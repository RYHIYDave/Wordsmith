// The heads-up display: the life globe (and the mana globe, when mana is what limits the slow
// abilities), the two attacks written out as phrases with their word sockets, minimap, boss bar,
// messages, the first dungeon's prompts, and the few on-screen controls that are not abilities
// (inventory, potion, interact).
//
// Where the life globe is depends on what the game is played with (Version 11.2). With a mouse it is
// in the bottom left corner, beside the flask. With fingers that corner is where the left thumb
// lives (the owner: "the health pool is hidden under my left thumb and is hard to see most of the
// time"), so there it is in the top left corner, with the level beside it. The flask stays where
// it was: it is a button, and a button wants to be under a thumb. (The life is also a bar over the
// hero's head: render/lifebar.ts.)

import { WORD_COLOR } from '../art/icons';
import { ELEMENT_RAMP, P } from '../art/palette';
import { LINE_H, drawText, textWidth, wrapText } from '../engine/font';
import type { Input } from '../engine/input';
import { SKILLS, WORDS, xpToNext } from '../game/defs';
import { doorTiles } from '../game/doors';
import type { Game } from '../game/game';
import type { Hero, Level } from '../game/state';
import { T_FLOOR, T_WALL, WORD_IDS } from '../game/types';
import type { WordId } from '../game/types';
import { socketProblem } from '../game/words';
import type { Fx } from '../render/fx';
import type { Art } from '../render/render';
import { pressName } from './guide';
import type { Banner } from './guide';
import { THEME } from './ui';
import type { Ui } from './ui';
import { arrow, drawWordTile, nameParts, tileWidth, wordForm } from './words';

export interface HudOut {
  /** Open the inventory: -1 = no; 0, 1 or 2 = that ability's phrase (or the evasive move's button) was pressed; 3 = the INVENTORY button. */
  inventory: number;
  potion: boolean;
  interact: boolean;
  level: boolean;
  pause: boolean;
  /** The small map was pressed: show or hide the large one. */
  map: boolean;
}

export interface HudIn {
  /** The first dungeon's prompt for this moment, or null when there is none. */
  banner: Banner | null;
  /** A word that has just been picked up, and for how many seconds it has been announced. `big`: a new player's first word. */
  toast: { word: WordId; t: number; big?: boolean } | null;
  /**
   * Touch: the gesture the prompt is asking for, to be shown as a ghost. For a tap or a hold,
   * (x, y) is the thing to press, on screen; for the walking thumb, (dx, dy) is the way to go.
   */
  gesture: { kind: 'stick' | 'tap' | 'hold' | 'flick'; x: number; y: number; dx: number; dy: number } | null;
  /**
   * A fight is on (something awake is near). The attacks written along the bottom are not
   * buttons then: a press on one is an attack, like a press anywhere else on the world. (Until
   * Version 13.2 it opened the inventory, with the game waiting behind it: a monster standing
   * under them could not be attacked, and a thumb that strayed onto them in a fight stopped the
   * fight. The INVENTORY button and the keys open it as ever.)
   */
  fight?: boolean;
}

/**
 * A filled circle, drawn in rows half a game pixel tall so that its edge is as smooth as the
 * screen's grain allows (two picture pixels to a game pixel). (cx, cy) is its middle in game
 * pixels; only the rows from `top` down to `bottom` are drawn.
 */
function disc(g: CanvasRenderingContext2D, cx: number, cy: number, r: number, color: string, top = -1e9, bottom = 1e9): void {
  g.fillStyle = color;
  for (let y = Math.ceil((cy - r) * 2) / 2; y < cy + r; y += 0.5) {
    if (y < top || y >= bottom) continue;
    const m = y + 0.25 - cy;
    const half = Math.round(Math.sqrt(Math.max(0, r * r - m * m)) * 2) / 2;
    if (half > 0) g.fillRect(cx - half, y, half * 2, 0.5);
  }
}

/**
 * A globe of life or mana, in the heroes' look (Version 13): a flat disc of deep indigo, the
 * liquid in one flat colour with a line of light along its surface, and a thin rim (which takes
 * the colour of whatever ails the hero). It covers the pixels cx - r - 1 to cx + r + 1.
 */
function globe(g: CanvasRenderingContext2D, cx: number, cy: number, r: number, frac: number, fill: string, light: string, rim: string): void {
  // (its middle is the middle of the pixel (cx, cy))
  const mx = cx + 0.5;
  const my = cy + 0.5;
  const R = r + 0.5;
  disc(g, mx, my, R + 1, rim);
  disc(g, mx, my, R, THEME.ink);
  const f = Math.max(0, Math.min(1, frac));
  if (f <= 0) return;
  const level = Math.round((my + R - f * 2 * R) * 2) / 2;
  disc(g, mx, my, R, fill, level);
  if (f < 1) disc(g, mx, my, R, light, level, level + 1);
}

function minimap(g: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, game: Game): void {
  const L = game.level;
  const f = L.floor;
  const hero = game.hero;
  g.globalAlpha = 0.6;
  g.fillStyle = P.black;
  g.fillRect(x, y, w, h);
  g.globalAlpha = 1;
  const cx = x + Math.floor(w / 2);
  const cy = y + Math.floor(h / 2);
  const hx = Math.floor(hero.x);
  const hy = Math.floor(hero.y);
  const put = (tx: number, ty: number, color: string, size: number): void => {
    const px = cx + (tx - ty) - (hx - hy);
    const py = cy + Math.floor(((tx + ty) - (hx + hy)) / 2);
    if (px < x + 1 || py < y + 1 || px >= x + w - size || py >= y + h - size) return;
    g.fillStyle = color;
    g.fillRect(px, py, size, size);
  };
  const R = 36;
  for (let ty = Math.max(0, hy - R); ty <= Math.min(f.h - 1, hy + R); ty++) {
    for (let tx = Math.max(0, hx - R); tx <= Math.min(f.w - 1, hx + R); tx++) {
      const idx = ty * f.w + tx;
      if (!L.explored[idx]) continue;
      const k = f.tiles[idx];
      if (k === T_FLOOR) put(tx, ty, L.visible[idx] ? THEME.edgeHi : THEME.hot, 1);
      else if (k === T_WALL) put(tx, ty, THEME.bg2, 1);
    }
  }
  const p = L.portal;
  if (p && L.explored[p.ty * f.w + p.tx]) put(p.tx, p.ty, p.state === 1 ? P.tl4 : P.tl2, 2);
  // (in town the way out is the gate in the back wall)
  const gate = L.town ? L.stations.find((q) => q.kind === 'gate') : undefined;
  if (gate) put(Math.floor(gate.x), Math.floor(gate.y) - 1, P.tl4, 2);
  // chests that have been seen and not yet opened, so a vault left for later can be found again
  for (const c of L.props) {
    if (c.kind === 'chest' && c.state === 0 && L.explored[c.ty * f.w + c.tx]) put(c.tx, c.ty, P.gd4, 2);
    // (and the fallen wordsmith, until the satchel has been searched)
    else if (c.kind === 'body' && c.state === 0 && L.explored[c.ty * f.w + c.tx]) put(c.tx, c.ty, P.tl5, 3);
    // (THE MIX: and a lever that has been seen and not yet pulled)
    else if (c.kind === 'lever' && c.state === 0 && L.explored[c.ty * f.w + c.tx]) put(c.tx, c.ty, P.tl5, 3);
  }
  // (THE MIX: a gate that is down, across its doorway, so that the way it bars can be found again)
  for (const d of L.doors) {
    if ((d.spot.kind !== 'gate' && d.spot.kind !== 'trapgate') || d.want !== 0) continue;
    for (const i of doorTiles(f, d.spot)) if (L.explored[i]) put(i % f.w, Math.floor(i / f.w), P.sl3, 1);
  }
  for (const m of game.monsters) {
    if (m.dead || !m.seen) continue;
    if (m.boss) put(Math.floor(m.x), Math.floor(m.y), P.bl4, 3);
    else if (m.champion) put(Math.floor(m.x), Math.floor(m.y), P.fr5, 3);
    else if (m.elite) put(Math.floor(m.x), Math.floor(m.y), P.fr4, 2);
    else if (m.state !== 'sleep') put(Math.floor(m.x), Math.floor(m.y), P.bl3, 1);
  }
  put(hx, hy, P.white, 2);
  g.fillStyle = THEME.edge;
  g.fillRect(x, y, w, 1);
  g.fillRect(x, y + h - 1, w, 1);
  g.fillRect(x, y, 1, h);
  g.fillRect(x + w - 1, y, 1, h);
}

// The large map: everything explored so far, drawn once into its own picture and added to as the
// hero explores, so showing it costs one image a frame however big the dungeon is.
interface Chart {
  level: Level;
  cv: HTMLCanvasElement;
  cg: CanvasRenderingContext2D;
  done: Uint8Array;
  /** The part of the picture that has anything on it. */
  x0: number;
  y0: number;
  x1: number;
  y1: number;
}
let chart: Chart | null = null;

function chartFor(L: Level): Chart {
  const f = L.floor;
  if (!chart || chart.level !== L) {
    const cv = document.createElement('canvas');
    cv.width = f.w + f.h;
    cv.height = Math.ceil((f.w + f.h) / 2) + 1;
    chart = { level: L, cv, cg: cv.getContext('2d') as CanvasRenderingContext2D, done: new Uint8Array(f.w * f.h), x0: cv.width, y0: cv.height, x1: 0, y1: 0 };
  }
  const c = chart;
  const n = f.w * f.h;
  for (let i = 0; i < n; i++) {
    if (c.done[i] === 1 || L.explored[i] === 0) continue;
    c.done[i] = 1;
    const k = f.tiles[i];
    if (k !== T_FLOOR && k !== T_WALL) continue;
    const tx = i % f.w;
    const ty = (i - tx) / f.w;
    const px = tx - ty + f.h - 1;
    const py = (tx + ty) >> 1;
    c.cg.fillStyle = k === T_FLOOR ? THEME.edgeHi : THEME.bg2;
    c.cg.fillRect(px, py, 1, 1);
    if (px < c.x0) c.x0 = px;
    if (px > c.x1) c.x1 = px;
    if (py < c.y0) c.y0 = py;
    if (py > c.y1) c.y1 = py;
  }
  return c;
}

/**
 * The dungeon map: everything explored so far, filling the screen. The game is paused while it
 * is open (it is opened by pressing the small map, or M), and any press closes it. Returns true
 * when it should close.
 */
export function drawMap(ui: Ui, game: Game, t: number): boolean {
  const g = ui.g;
  const W = ui.w;
  const H = ui.h;
  const touch = ui.touch;
  const close = ui.pressIn(0, 0, W, H);
  ui.claim(0, 0, W, H);
  const L = game.level;
  const f = L.floor;
  const hero = game.hero;
  const c = chartFor(L);
  ui.shade(0.85);
  if (c.x1 < c.x0) return close;
  // As large as fits (up to 3x). What has been explored sits in the middle of the screen; if even
  // 1x is too big for the screen, the map is centred on the hero instead.
  const top = 6;
  const availW = W - 12;
  const availH = H - top - 30;
  const bw = c.x1 - c.x0 + 1;
  const bh = c.y1 - c.y0 + 1;
  const k = Math.max(1, Math.min(3, Math.floor(availW / bw), Math.floor(availH / bh)));
  const fits = bw * k <= availW && bh * k <= availH;
  const hx = Math.floor(hero.x);
  const hy = Math.floor(hero.y);
  const ox = fits ? Math.floor((W - bw * k) / 2) - c.x0 * k : Math.floor(W / 2) - (hx - hy + f.h - 1) * k;
  const oy = fits ? top + Math.floor((availH - bh * k) / 2) - c.y0 * k : Math.floor(H / 2) - ((hx + hy) >> 1) * k;
  g.drawImage(c.cv, ox, oy, c.cv.width * k, c.cv.height * k);
  const put = (tx: number, ty: number, color: string, size: number): void => {
    g.fillStyle = color;
    const s = size + k - 1;
    g.fillRect(ox + (tx - ty + f.h - 1) * k - (s >> 1), oy + ((tx + ty) >> 1) * k - (s >> 1), s, s);
  };
  const p = L.portal;
  if (p && L.explored[p.ty * f.w + p.tx]) put(p.tx, p.ty, p.state === 1 ? P.tl4 : P.tl2, 4);
  const gate = L.town ? L.stations.find((q) => q.kind === 'gate') : undefined;
  if (gate) put(Math.floor(gate.x), Math.floor(gate.y) - 1, P.tl4, 4);
  for (const ch of L.props) {
    if (ch.kind === 'chest' && ch.state === 0 && L.explored[ch.ty * f.w + ch.tx]) put(ch.tx, ch.ty, P.gd4, 3);
    else if (ch.kind === 'body' && ch.state === 0 && L.explored[ch.ty * f.w + ch.tx]) put(ch.tx, ch.ty, P.tl5, 4);
    else if (ch.kind === 'lever' && ch.state === 0 && L.explored[ch.ty * f.w + ch.tx]) put(ch.tx, ch.ty, P.tl5, 4);
  }
  for (const d of L.doors) {
    if ((d.spot.kind !== 'gate' && d.spot.kind !== 'trapgate') || d.want !== 0) continue;
    for (const i of doorTiles(f, d.spot)) if (L.explored[i]) put(i % f.w, Math.floor(i / f.w), P.sl3, 2);
  }
  for (const m of game.monsters) {
    if (m.dead || !m.seen) continue;
    if (m.boss) put(Math.floor(m.x), Math.floor(m.y), P.bl4, 4);
    else if (m.champion) put(Math.floor(m.x), Math.floor(m.y), P.fr5, 4);
    else if (m.elite) put(Math.floor(m.x), Math.floor(m.y), P.fr4, 3);
  }
  put(hx, hy, P.ink, 6);
  put(hx, hy, Math.floor(t * 3) % 2 === 0 ? P.white : P.tl5, 4);
  // legend, on its own dark strip so the dimmed HUD underneath does not show through it
  g.fillStyle = P.black;
  g.fillRect(0, H - 25, W, 25);
  const ly = H - 10;
  const items: [string, string][] = [[P.white, 'you'], [P.gd4, 'chest'], [P.fr5, 'guardian'], [P.bl4, 'boss'], [P.tl4, 'way home']];
  let width = 0;
  for (const [, label] of items) width += 5 + textWidth(label, 'small') + 7;
  let lx = Math.floor((W - width) / 2);
  for (const [color, label] of items) {
    g.fillStyle = color;
    g.fillRect(lx, ly + 1, 3, 3);
    lx += 5;
    lx += drawText(g, label, lx, ly, THEME.text, { font: 'small', shadow: P.ink }) + 7;
  }
  drawText(g, touch ? 'tap to close' : 'click or M to close', Math.floor(W / 2), ly - 9, THEME.dim, { align: 'center', font: 'small', shadow: P.ink });
  return close;
}

// =============================================================================================
// The attacks as phrases
//
// Words are what the game is about, so the two attacks are not icons: each is written out at the
// bottom of the screen as it reads, FLAME STRIKE of POWER, with every empty socket shown as a
// socket. Pressing one opens the Words screen.

const SLOT_W = 11;
const SLOT_H = 12;
const PIECE_GAP = 3;

interface Piece {
  kind: 'word' | 'rune' | 'empty' | 'name' | 'link';
  text: string;
  color: string;
  w: number;
  word: WordId | null;
  /** An empty socket that a spare word could go into right now. */
  glow: boolean;
}

/**
 * An attack as it reads: the words in front, its name, the words behind. `tight` 0 writes every
 * word out; 1 shows the words behind as their rune stones; 2 shows all of them as rune stones
 * (four long words do not fit across a small screen).
 */
function phrase(h: Hero, s: number, tight: number): Piece[] {
  const sk = h.skills[s];
  const out: Piece[] = [];
  const spare = WORD_IDS.filter((w) => h.words[w] > 0);
  const fits = (group: readonly (WordId | null)[]): boolean => spare.some((w) => socketProblem(group, w) === null);
  const glowF = fits(sk.front);
  const glowB = fits(sk.behind);
  const word = (w: WordId, form: 'front' | 'behind', rune: boolean): Piece => {
    const text = wordForm(w, form);
    return rune ? { kind: 'rune', text, color: WORD_COLOR[w], w: 12, word: w, glow: false } : { kind: 'word', text, color: WORD_COLOR[w], w: textWidth(text), word: w, glow: false };
  };
  const empty = (glow: boolean): Piece => ({ kind: 'empty', text: '', color: '', w: SLOT_W, word: null, glow });
  for (const w of sk.front) out.push(w ? word(w, 'front', tight >= 2) : empty(glowF));
  const name = SKILLS[sk.id].name.toUpperCase();
  out.push({ kind: 'name', text: name, color: P.white, w: textWidth(name), word: null, glow: false });
  let first = true;
  for (const w of sk.behind) {
    if (!w) {
      out.push(empty(glowB));
      continue;
    }
    const link = first ? 'of' : 'and';
    out.push({ kind: 'link', text: link, color: THEME.dim, w: textWidth(link, 'small'), word: null, glow: false });
    out.push(word(w, 'behind', tight >= 1));
    first = false;
  }
  return out;
}

function phraseWidth(ps: Piece[]): number {
  return ps.reduce((n, p) => n + p.w, 0) + Math.max(0, ps.length - 1) * PIECE_GAP;
}

function drawPhrase(g: CanvasRenderingContext2D, art: Art, ps: Piece[], x0: number, y: number, h: number, pulse: boolean): void {
  let x = x0;
  const ty = y + Math.floor((h - 8) / 2);
  for (const p of ps) {
    if (p.kind === 'word' || p.kind === 'name') drawText(g, p.text, x, ty, p.color, { shadow: P.ink });
    else if (p.kind === 'link') drawText(g, p.text, x, ty + 3, p.color, { font: 'small' });
    else if (p.kind === 'rune' && p.word) {
      const icon = art.icons.word[p.word];
      g.drawImage(icon.img, x, y + Math.floor((h - icon.h) / 2));
    } else {
      // an empty socket: a dark notch with a plus in it. It glows while a spare word could go in.
      const sy = y + Math.floor((h - SLOT_H) / 2);
      g.fillStyle = p.glow ? (pulse ? THEME.accent : THEME.accentLo) : THEME.edge;
      g.fillRect(x, sy, SLOT_W, SLOT_H);
      g.fillStyle = p.glow ? (pulse ? THEME.accentBg : THEME.accentBg2) : THEME.slot;
      g.fillRect(x + 1, sy + 1, SLOT_W - 2, SLOT_H - 2);
      g.fillStyle = p.glow ? THEME.accent : THEME.edge;
      g.fillRect(x + 3, sy + 6, 5, 1);
      g.fillRect(x + 5, sy + 4, 1, 5);
    }
    x += p.w + PIECE_GAP;
  }
}

// =============================================================================================
// The first dungeon's prompt, and the announcement of a word picked up

let bannerKey = '';
let bannerAt = -9;
/** When each line of the fight prompt was first seen done (it shrinks to a ticked line from then on). */
const tickedAt = new Map<string, number>();
/** The last fight prompt drawn, and when: it stays a moment, all ticked, after its last line is done. */
let lastFight: { b: Banner; t: number } | null = null;

/** A small box, ticked or empty. */
function tickBox(g: CanvasRenderingContext2D, x: number, y: number, done: boolean): void {
  g.fillStyle = done ? THEME.good : THEME.edgeHi;
  g.fillRect(x, y, 7, 7);
  g.fillStyle = done ? THEME.goodBg : THEME.slot;
  g.fillRect(x + 1, y + 1, 5, 5);
  if (!done) return;
  g.fillStyle = THEME.good;
  g.fillRect(x + 1, y + 3, 1, 1);
  g.fillRect(x + 2, y + 4, 1, 1);
  g.fillRect(x + 3, y + 3, 1, 1);
  g.fillRect(x + 4, y + 2, 1, 1);
  g.fillRect(x + 5, y + 1, 1, 1);
}

/**
 * The prompt for this moment, at the top of the screen. One large line and a smaller one under it;
 * or, in a fight, a line for each thing to try ("TAP to STRIKE"), large until it has been done and
 * a small ticked line after. Returns where it ends.
 */
/** On a narrow screen (a phone held upright), where the prompt and the news of a word begin: under the map and the pause button. */
const NARROW_TOP = 74;
/** With fingers, the middle of the life globe, down from the top of the screen: it sits under the name of the place. */
const TOP_GLOBE_Y = 29;

function drawBanner(ui: Ui, b: Banner, t: number): number {
  const g = ui.g;
  const W = ui.w;
  const key = b.lines.length ? `fight:${b.lines.map((l) => l.id).join()}` : b.text;
  if (key !== bannerKey) {
    bannerKey = key;
    bannerAt = t;
  }
  const age = t - bannerAt;
  // on a wide screen it sits between the corners (the buttons on the left, the map on the right);
  // on a narrow one (a phone held upright) below them
  const wide = W >= 380;
  const maxW = (wide ? W - 156 : W - 12) - 16;
  const capColor = b.caption === 'WORDSMITHING' ? THEME.callHi : THEME.accent;
  interface Row { h: number; w: number; draw: (y: number) => void }
  const rows: Row[] = [];
  const cx = Math.floor(W / 2);
  if (b.lines.length) {
    // (the lines still to do are all drawn the same size: the largest at which every one of them fits)
    const big = b.lines.every((l) => textWidth(`${l.how} ${l.what}`) * 2 + 12 <= maxW);
    for (const l of b.lines) {
      const id = `${l.id}:${l.how}`;
      if (l.done && !tickedAt.has(id)) tickedAt.set(id, t);
      if (!l.done) tickedAt.delete(id);
      const since = l.done ? t - (tickedAt.get(id) ?? t) : -1;
      const text = `${l.how} ${l.what}`;
      if (l.done && since > 0.5) {
        // done: a small ticked line
        const w = 10 + textWidth(text, 'small');
        rows.push({ h: 8, w, draw: (y) => {
          const x = cx - Math.floor(w / 2);
          tickBox(g, x, y, true);
          drawText(g, text, x + 10, y + 1, THEME.good, { font: 'small', shadow: P.ink });
        } });
        continue;
      }
      // to do (or just done, and flashing): the gesture in gold, what it does in white
      const scale = big ? 2 : 1;
      const hw = textWidth(l.how) * scale;
      const gap = 4 * scale;
      const w = 12 + hw + gap + textWidth(l.what) * scale;
      const flash = l.done ? Math.floor(since * 12) % 2 === 0 : age < 0.5 && Math.floor(age * 10) % 2 === 0;
      rows.push({ h: 9 * scale + 1, w, draw: (y) => {
        const x = cx - Math.floor(w / 2);
        tickBox(g, x, y + (scale === 2 ? 4 : 1), l.done);
        drawText(g, l.how, x + 12, y, l.done ? THEME.good : flash ? P.white : THEME.accent, { scale, shadow: P.ink });
        drawText(g, l.what, x + 12 + hw + gap, y, l.done ? THEME.good : P.white, { scale, shadow: P.ink });
      } });
    }
  } else {
    let scale = 2;
    let parts = wrapText(b.text, Math.floor(maxW / 2));
    if (parts.length > (wide ? 1 : 3)) {
      scale = 1;
      parts = wrapText(b.text, maxW);
    }
    const fresh = age < 0.55 && Math.floor(age * 10) % 2 === 0;
    for (const r of parts) rows.push({ h: 9 * scale, w: textWidth(r) * scale, draw: (y) => drawText(g, r, cx, y, fresh ? P.white : THEME.accent, { align: 'center', scale, shadow: P.ink }) });
    if (b.sub) {
      const font = wrapText(b.sub, maxW).length <= (wide ? 2 : 3) ? 'normal' : 'small';
      wrapText(b.sub, maxW, font).forEach((r, i) => rows.push({ h: LINE_H[font] + (i === 0 ? 1 : 0), w: textWidth(r, font), draw: (y) => drawText(g, r, cx, y + (i === 0 ? 1 : 0), THEME.text, { align: 'center', font, shadow: P.ink }) }));
    }
  }
  let cw = textWidth(b.caption, 'small');
  let bh = 4 + 8 + 3;
  for (const r of rows) {
    cw = Math.max(cw, r.w);
    bh += r.h;
  }
  const bw = cw + 16;
  const bx = Math.floor((W - bw) / 2);
  // it drops into place when the prompt changes
  // (on a narrow screen: below the corner buttons, the pause button included)
  const by = (wide ? 3 : NARROW_TOP) - Math.round((1 - Math.min(1, age / 0.16)) * 6);
  // (a panel like any other, but the fight shows through it a little)
  g.globalAlpha = 0.9;
  ui.box(bx, by, bw, bh, THEME.bg, age < 0.55 ? capColor : THEME.edgeHi);
  g.globalAlpha = 1;
  drawText(g, b.caption, cx, by + 4, capColor, { align: 'center', font: 'small' });
  let y = by + 12;
  for (const r of rows) {
    r.draw(y);
    y += r.h;
  }
  return by + bh;
}

/**
 * "WORD FOUND": the word just picked up, on its tile, at the top of the screen for a moment.
 * `big`: a new player's first word, which is the moment the game is about: its rune and its name
 * are written large, with a line saying what a word is for.
 */
function drawToast(ui: Ui, art: Art, word: WordId, age: number, top: number, big: boolean): number {
  const g = ui.g;
  const hue = WORD_COLOR[word];
  if (big) {
    const name = WORDS[word].name.toUpperCase();
    const scale = ui.w >= 380 ? 3 : 2;
    const nw = textWidth(name) * scale;
    const line = 'A power word. Words change your attacks.';
    const small = textWidth(line) > ui.w - 24;
    const bw = Math.min(ui.w - 8, Math.max(nw + 12 * 2 + 12 + 24, textWidth(line, small ? 'small' : 'normal') + 20));
    const bh = 14 + 9 * scale + 16;
    const bx = Math.floor((ui.w - bw) / 2);
    const by = top - Math.round((1 - Math.min(1, age / 0.18)) * 10);
    const fade = age > 3.0 ? Math.max(0, 1 - (age - 3.0) / 0.5) : 1;
    g.globalAlpha = 0.92 * fade;
    ui.box(bx, by, bw, bh, age < 0.1 ? P.white : THEME.bg, hue);
    g.globalAlpha = fade;
    g.fillStyle = hue;
    g.fillRect(bx + 2, by, bw - 4, 1.5);
    g.fillRect(bx + 2, by + bh - 1.5, bw - 4, 1.5);
    drawText(g, 'WORD FOUND', Math.floor(ui.w / 2), by + 5, THEME.accent, { align: 'center', font: 'small' });
    // the rune stone, twice its size, and the word beside it
    const icon = art.icons.word[word];
    const tw = icon.w * 2 + 8 + nw;
    const x = Math.floor((ui.w - tw) / 2);
    const lit = age < 0.6 && Math.floor(age * 12) % 2 === 0;
    g.drawImage(icon.img, x, by + 13 + Math.floor((9 * scale - icon.h * 2) / 2), icon.w * 2, icon.h * 2);
    drawText(g, name, x + icon.w * 2 + 8, by + 13, lit ? P.white : hue, { scale, shadow: P.ink });
    drawText(g, line, Math.floor(ui.w / 2), by + 15 + 9 * scale, THEME.text, { align: 'center', font: small ? 'small' : 'normal', shadow: P.ink });
    g.globalAlpha = 1;
    return by + bh;
  }
  const tw = tileWidth(word, 'name');
  const label = 'WORD FOUND';
  const bw = Math.max(tw, textWidth(label, 'small')) + 14;
  const bh = 32;
  const bx = Math.floor((ui.w - bw) / 2);
  const by = top - Math.round((1 - Math.min(1, age / 0.14)) * 8);
  const fade = age > 2.3 ? Math.max(0, 1 - (age - 2.3) / 0.5) : 1;
  g.globalAlpha = 0.9 * fade;
  ui.box(bx, by, bw, bh, THEME.bg, hue);
  g.globalAlpha = fade;
  drawText(g, label, Math.floor(ui.w / 2), by + 3, THEME.accent, { align: 'center', font: 'small' });
  drawWordTile(ui, art, Math.floor((ui.w - tw) / 2), by + 10, tw, 18, word, 'name', { lit: age < 0.4, alpha: fade });
  g.globalAlpha = 1;
  return by + bh;
}

/**
 * Touch only: a ghost of the gesture the lesson is asking for, drawn where it should be made.
 * `x`, `y`: where (for a tap or a hold, the monster to press on). `dx`, `dy`: which way (for the
 * walking thumb), in screen terms.
 */
function drawGesture(g: CanvasRenderingContext2D, kind: 'stick' | 'tap' | 'hold' | 'flick', x: number, y: number, dx: number, dy: number, t: number): void {
  const ring = (cx: number, cy: number, r: number, color: string, n = 24): void => {
    g.fillStyle = color;
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2;
      g.fillRect(Math.round(cx + Math.cos(a) * r), Math.round(cy + Math.sin(a) * r), 1, 1);
    }
  };
  const thumb = (cx: number, cy: number, alpha: number): void => {
    g.globalAlpha = alpha;
    g.fillStyle = P.white;
    g.fillRect(Math.round(cx) - 3, Math.round(cy) - 2, 6, 4);
    g.fillRect(Math.round(cx) - 2, Math.round(cy) - 3, 4, 6);
    g.globalAlpha = 1;
  };
  if (kind === 'stick') {
    // a thumb is put down, and pushed the way to go
    const k = (t * 0.8) % 1;
    const push = k < 0.2 ? 0 : Math.min(1, (k - 0.2) / 0.35);
    const len = Math.hypot(dx, dy) || 1;
    ring(x, y, 18, THEME.edgeHi, 28);
    thumb(x + (dx / len) * 14 * push, y + (dy / len) * 14 * push, k > 0.85 ? (1 - k) / 0.15 : Math.min(1, k / 0.1) * 0.9);
  } else if (kind === 'tap') {
    const k = (t * 1.5) % 1;
    ring(x, y, 13 - k * 8, THEME.accent, 20);
    if (k > 0.6) thumb(x, y, 0.9);
  } else if (kind === 'hold') {
    // the thumb stays down, and the ring closes round it
    const k = (t * 0.8) % 1;
    const n = 20;
    const lit = Math.round(Math.min(1, k / 0.7) * n);
    for (let i = 0; i < n; i++) {
      const a = -Math.PI / 2 + (i / n) * Math.PI * 2;
      g.fillStyle = i < lit ? THEME.accent : THEME.edge;
      g.fillRect(Math.round(x + Math.cos(a) * 11), Math.round(y + Math.sin(a) * 11), k > 0.7 ? 2 : 1, k > 0.7 ? 2 : 1);
    }
    thumb(x, y, 0.9);
  } else {
    // a quick stroke across the screen
    const k = (t * 0.9) % 1;
    const go = Math.min(1, k / 0.22);
    const a = k > 0.6 ? Math.max(0, 1 - (k - 0.6) / 0.25) : 1;
    g.globalAlpha = 0.5 * a;
    g.fillStyle = P.white;
    g.fillRect(Math.round(x), Math.round(y) - 1, Math.round(46 * go), 2);
    g.globalAlpha = 1;
    thumb(x + 46 * go, y, 0.9 * a);
  }
}

export function drawHud(ui: Ui, game: Game, art: Art, fx: Fx, t: number, input: Input, inp: HudIn): HudOut {
  const g = ui.g;
  const W = ui.w;
  const H = ui.h;
  const h = game.hero;
  const d = h.d;
  const out: HudOut = { inventory: -1, potion: false, interact: false, level: false, pause: false, map: false };
  const touch = ui.touch;
  // The fight prompt stays a moment after its last line is done, all ticked, before it goes.
  let banner = inp.banner;
  if (banner && banner.lines.length) lastFight = { b: banner, t };
  else if (!banner && lastFight && t - lastFight.t < 1.4 && game.guide) banner = { ...lastFight.b, point: null, lines: lastFight.b.lines.map((l) => ({ ...l, done: true })) };
  else if (banner) lastFight = null;
  const point = banner ? banner.point : null;
  const byMana = game.meta.limit === 'mana';
  const pulse = Math.floor(t * 3) % 2 === 0;

  // ---- globes -------------------------------------------------------------------------------
  const gy = H - 19;
  // (with fingers: out from under the left thumb, below the name of the place)
  const lifeX = 19;
  const lifeY = touch ? TOP_GLOBE_Y : gy;
  const lifeRim = h.burnT > 0 ? P.fr4 : h.poisonT > 0 ? P.vn4 : h.chillT > 0 ? P.bu4 : h.shockT > 0 ? P.lt3 : THEME.edgeHi;
  globe(g, lifeX, lifeY, 14, h.life / d.maxLife, THEME.life, THEME.lifeHi, lifeRim);
  drawText(g, `${Math.ceil(h.life)}`, lifeX, lifeY - 3, P.white, { align: 'center', font: 'small', shadow: P.ink });
  ui.mark('life', lifeX - 15, lifeY - 15, 31, 31);
  // (mana is only there to be seen when it is what limits the slow abilities)
  if (byMana) {
    globe(g, W - 20, gy, 14, h.mana / d.maxMana, THEME.mana, THEME.manaHi, THEME.edgeHi);
    drawText(g, `${Math.floor(h.mana)}`, W - 20, gy - 3, P.white, { align: 'center', font: 'small', shadow: P.ink });
  }

  // ---- potion (tap or Q) --------------------------------------------------------------------
  // On touch everything a finger must hit is drawn larger.
  const ps = touch ? 26 : 20;
  const px = 37;
  const py = H - ps - 1;
  if (ui.pressIn(px, py, ps, ps)) out.potion = true;
  ui.claim(px, py, ps, ps);
  ui.mark('potion', px, py, ps, ps);
  ui.slot(px, py, ps, art.icons.potion, h.potions > 0 ? THEME.edgeHi : THEME.edge);
  if (h.potions <= 0) {
    g.globalAlpha = 0.65;
    g.fillStyle = P.black;
    g.fillRect(px + 1, py + 1, ps - 2, ps - 2);
    g.globalAlpha = 1;
  }
  drawText(g, `${h.potions}`, px + ps - 2, py + ps - 7, P.white, { align: 'right', font: 'small', shadow: P.ink });
  if (!touch) drawText(g, 'Q', px + 2, py + 2, THEME.dim, { font: 'small', shadow: P.ink });
  // (with fingers the level is up beside the life)
  if (!touch) drawText(g, `LV ${h.level}`, px, py - 7, THEME.accent, { font: 'small', shadow: P.ink });
  if (point === 'flask') {
    // the prompt is pointing at the flask
    if (pulse) {
      g.fillStyle = THEME.accent;
      g.fillRect(px, py, ps, 1);
      g.fillRect(px, py + ps - 1, ps, 1);
      g.fillRect(px, py, 1, ps);
      g.fillRect(px + ps - 1, py, 1, ps);
    }
    arrow(g, px + Math.floor(ps / 2), py - 9, t, THEME.accent);
  }

  // ---- the evasive move: beside the mana, as the flask is beside the life ---------------------
  // (it only shows whether it is ready: the move itself is a flick, or Space)
  let hoverSkill = -1;
  const ex = byMana ? W - 37 - ps : W - ps - 5;
  {
    const s = h.skills[2];
    const def = SKILLS[s.id];
    ui.mark('skill:2', ex, py, ps, ps);
    if (ui.hover(ex, py, ps, ps)) hoverSkill = 2;
    // With a mouse, a click on it opens the inventory at its line of word slots, as a click on an
    // attack's plate does (and, like them, not while a fight is on). Not with fingers: the right
    // thumb lives in this corner, and every touch that begins here is a tap, a hold or a swipe.
    if (!touch && (!inp.fight || point === 'dodge')) {
      if (ui.pressIn(ex, py, ps, ps)) out.inventory = 2;
      ui.claim(ex, py, ps, ps);
    }
    ui.slot(ex, py, ps, art.icons.ability[def.icon], THEME.edgeHi);
    // its words (Version 12.2): a pip for each in its colour, those in front along the top of the
    // button and those behind along the bottom; and its name above, where there is room (below)
    s.front.filter((w): w is WordId => w !== null).forEach((w, i) => {
      g.fillStyle = P.ink;
      g.fillRect(ex + 1 + i * 5, py + 1, 5, 5);
      g.fillStyle = WORD_COLOR[w];
      g.fillRect(ex + 2 + i * 5, py + 2, 3, 3);
    });
    s.behind.filter((w): w is WordId => w !== null).forEach((w, i) => {
      g.fillStyle = P.ink;
      g.fillRect(ex + 1 + i * 5, py + ps - 6, 5, 5);
      g.fillStyle = WORD_COLOR[w];
      g.fillRect(ex + 2 + i * 5, py + ps - 5, 3, 3);
    });
    if (def.cooldown > 0 && s.charges < 1) {
      const cover = Math.max(0, Math.min(1, s.cd / Math.max(0.01, s.r.cooldown)));
      g.globalAlpha = 0.72;
      g.fillStyle = P.black;
      g.fillRect(ex + 1, py + 1, ps - 2, Math.ceil((ps - 2) * cover));
      g.globalAlpha = 1;
    }
    if (byMana && h.mana < s.r.mana) {
      g.globalAlpha = 0.72;
      g.fillStyle = P.bu1;
      g.fillRect(ex + 1, py + 1, ps - 2, ps - 2);
      g.globalAlpha = 1;
    }
    if (s.maxCharges > 1) drawText(g, `${s.charges}`, ex + ps - 2, py + ps - 7, P.white, { align: 'right', font: 'small', shadow: P.ink });
    drawText(g, touch ? 'SWIPE' : 'SPACE', ex + Math.floor(ps / 2), py - 7, point === 'dodge' ? THEME.accent : THEME.dim, { align: 'center', font: 'small', shadow: P.ink });
    if (point === 'dodge') {
      // the prompt is pointing at the dodge
      if (pulse) {
        g.fillStyle = THEME.accent;
        g.fillRect(ex, py, ps, 1);
        g.fillRect(ex, py + ps - 1, ps, 1);
        g.fillRect(ex, py, 1, ps);
        g.fillRect(ex + ps - 1, py, 1, ps);
      }
      // (its arrow is drawn below, once it is known whether the move's name is written over the button)
    }
  }

  // ---- the two attacks, written out with their word sockets ---------------------------------
  const PH = touch ? 22 : 20;
  const PAD = 4;
  const availL = px + ps + 5;
  const availR = ex - 5;
  const plateW = (pieces: Piece[]): number => 20 + PAD + phraseWidth(pieces) + PAD;
  let tight = 0;
  let pieces = [phrase(h, 0, 0), phrase(h, 1, 0)];
  // side by side if they fit (with the longer words drawn as their rune stones if need be)
  while (plateW(pieces[0]) + plateW(pieces[1]) + 5 > availR - availL && tight < 2) {
    tight++;
    pieces = [phrase(h, 0, tight), phrase(h, 1, tight)];
  }
  const stacked = plateW(pieces[0]) + plateW(pieces[1]) + 5 > availR - availL;
  if (stacked) {
    // a narrow screen (a phone held upright): one above the other, above the globes
    pieces = [0, 1].map((s) => {
      let p = phrase(h, s, 0);
      for (let k = 1; k <= 2 && plateW(p) > W - 8; k++) p = phrase(h, s, k);
      return p;
    });
  }
  const w0 = plateW(pieces[0]);
  const w1 = plateW(pieces[1]);
  const plates = stacked
    ? [{ x: Math.floor((W - w0) / 2), y: H - 40 - PH * 2 - 9, w: w0, h: PH }, { x: Math.floor((W - w1) / 2), y: H - 40 - PH, w: w1, h: PH }]
    : [{ x: Math.round((availL + availR - w0 - w1 - 5) / 2), y: H - PH - 4, w: w0, h: PH }, { x: Math.round((availL + availR - w0 - w1 - 5) / 2) + w0 + 5, y: H - PH - 4, w: w1, h: PH }];
  const barTop = plates[0].y;
  // the evasive move's name with its words, in small letters over its button, when the plates
  // are not stacked up there (a phone held upright has no room for it: the pips say it)
  {
    const sw = h.skills[2];
    const parts = nameParts(SKILLS[sw.id], sw.front, sw.behind);
    const named = parts.length > 1 && !stacked;
    if (named) {
      let nx = W - 3 - parts.reduce((a, p, i) => a + textWidth(p.text, 'small') + (i ? 3 : 0), 0);
      for (const p of parts) nx += drawText(g, p.text, nx, py - 14, p.color, { font: 'small', shadow: P.ink }) + 3;
    }
    // (the prompt's arrow at the dodge stands clear of that name)
    if (point === 'dodge') arrow(g, ex + Math.floor(ps / 2), py - (named ? 17 : 9), t, THEME.accent);
  }
  // (with a mouse, an attack that goes on while it is held says HOLD: see pressName)
  const keys = [pressName(false, 0, h.skills[0].id), pressName(false, 1, h.skills[1].id)];
  const gestures = ['TAP', 'HOLD'];
  for (let s = 0; s < 2; s++) {
    const r = plates[s];
    const sk = h.skills[s];
    const def = SKILLS[sk.id];
    // the prompt points at the phrase it wants pressed
    const asked = point === (s === 0 ? 'plate0' : 'plate1');
    // A press on it opens the inventory at this attack. Not while a fight is on (HudIn.fight): it
    // is not claimed then, and a press there falls through to the world as an attack. (Unless the
    // first dungeon's prompt is asking for exactly this press.)
    const button = !inp.fight || asked;
    if (button) {
      if (ui.pressIn(r.x, r.y, r.w, r.h)) out.inventory = s;
      ui.claim(r.x, r.y, r.w, r.h);
    }
    ui.mark(`skill:${s}`, r.x, r.y, r.w, r.h);
    const hot = button && ui.hover(r.x, r.y, r.w, r.h);
    if (hot) hoverSkill = s;
    const ramp = sk.r.element === 'phys' ? null : ELEMENT_RAMP[sk.r.element];
    ui.box(r.x, r.y, r.w, r.h, hot || (asked && pulse) ? THEME.hot : THEME.bg2, asked ? (pulse ? THEME.accent : THEME.accentLo) : hot ? THEME.accent : THEME.edge);
    const iy = r.y + Math.floor((PH - 20) / 2);
    ui.slot(r.x, iy, 20, art.icons.ability[def.icon], ramp ? ramp[2] : THEME.edgeHi);
    let cover = 0;
    if (def.cooldown > 0 && sk.charges < 1) cover = Math.max(0, Math.min(1, sk.cd / Math.max(0.01, sk.r.cooldown)));
    // (an attack that goes on while held needs only its first bite's worth of mana to begin)
    const need = def.channel && def.tick ? (sk.r.mana * def.tick) / def.channel : sk.r.mana;
    const going = h.channel && h.channel.skill === s ? h.channel : null;
    const noMana = byMana && !going && h.mana < need;
    if (cover > 0 || noMana) {
      g.globalAlpha = 0.72;
      g.fillStyle = noMana && cover === 0 ? P.bu1 : P.black;
      g.fillRect(r.x + 1, iy + 1, 18, noMana && cover === 0 ? 18 : Math.ceil(18 * cover));
      g.globalAlpha = 1;
    }
    if (going && def.channel && !byMana) {
      // one that is being held: how much of its length is left, as a bar that runs down
      const left = Math.max(0, Math.min(1, 1 - going.t / def.channel));
      g.fillStyle = P.ink;
      g.fillRect(r.x + 1, iy + 15, 18, 4);
      g.fillStyle = THEME.accent;
      g.fillRect(r.x + 2, iy + 16, Math.round(16 * left), 2);
    }
    if (sk.maxCharges > 1) drawText(g, `${sk.charges}`, r.x + 18, iy + 13, P.white, { align: 'right', font: 'small', shadow: P.ink });
    drawPhrase(g, art, pieces[s], r.x + 20 + PAD, r.y, PH, pulse);
    drawText(g, touch ? gestures[s] : keys[s], r.x + 1, r.y - 6, THEME.dim, { font: 'small', shadow: P.ink });
    if (asked) arrow(g, r.x + Math.floor(r.w / 2), r.y - 8, t, THEME.accent);
  }
  if (hoverSkill >= 0) {
    // what the ability under the mouse does, words included
    const s = h.skills[hoverSkill];
    const rows: string[] = [];
    for (const l of s.r.lines) rows.push(...wrapText(l, 170, 'small'));
    if (hoverSkill < 2) rows.push('Click to change its words.');
    const bw = 178;
    const bh = 14 + rows.length * 6;
    const tx = Math.max(2, Math.min(W - bw - 2, Math.floor(W / 2 - bw / 2)));
    const ty = barTop - bh - 10;
    ui.box(tx, ty, bw, bh, THEME.bg, THEME.edgeHi);
    drawText(g, s.r.name, tx + 4, ty + 3, THEME.accent);
    rows.forEach((r, k) => drawText(g, r, tx + 4, ty + 13 + k * 6, k === rows.length - 1 && hoverSkill < 2 ? THEME.dim : THEME.text, { font: 'small' }));
  }
  // experience
  const xw = availR - availL;
  g.fillStyle = THEME.ink;
  g.fillRect(availL, H - 3, xw, 2);
  g.fillStyle = THEME.accentLo;
  g.fillRect(availL, H - 3, Math.round((xw * h.xp) / xpToNext(h.level)), 2);

  // ---- level-up and interact prompts --------------------------------------------------------
  const pbh = touch ? 18 : 13;
  let promptY = touch ? barTop - pbh - 11 : barTop - 22;
  if (h.pending > 0) {
    const w = touch ? 92 : 78;
    const x = Math.floor(W / 2 - w / 2);
    if (ui.pressIn(x, promptY, w, pbh)) out.level = true;
    ui.claim(x, promptY, w, pbh);
    ui.drawButton(x, promptY, w, pbh, touch ? 'LEVEL UP' : 'LEVEL UP (L)', { primary: true, lit: pulse });
    promptY -= pbh + 3;
  }
  const hint = game.interactHint();
  if (hint) {
    const label = touch ? hint : `${hint} (E)`;
    const w = ui.width(label) + (touch ? 20 : 12);
    const x = Math.floor(W / 2 - w / 2);
    if (ui.pressIn(x, promptY, w, pbh)) out.interact = true;
    ui.claim(x, promptY, w, pbh);
    ui.drawButton(x, promptY, w, pbh, label, { lit: true });
  }

  // ---- top left: where we are, gold, and the inventory -----------------------------------------
  // With fingers the life globe is here too: under the name of the place, with the gold and the
  // level to its right and the inventory below.
  const spare = WORD_IDS.reduce((n, w) => n + h.words[w], 0);
  let lx = 4;
  const btnY = touch ? TOP_GLOBE_Y + 19 : 24;
  const btnH = touch ? 18 : 13;
  const place = game.practice ? 'Practice room' : game.level.town ? 'Town' : `Dungeon ${game.depth}`;
  drawText(g, place, 4, 3, game.practice ? THEME.accent : THEME.text, { shadow: P.ink });
  const coin = art.icons.gold[0];
  const statX = touch ? lifeX + 19 : 4;
  const goldY = touch ? TOP_GLOBE_Y - 10 : 14;
  g.drawImage(coin.img, statX, goldY);
  drawText(g, `${h.gold}`, statX + coin.w + 2, goldY, THEME.gold, { font: 'small', shadow: P.ink });
  if (touch) drawText(g, `LV ${h.level}`, statX, goldY + 11, THEME.text, { font: 'small', shadow: P.ink });
  {
    // words, attacks and gear are one screen: it is lit while a word is waiting for a place
    const label = touch ? 'INVENTORY' : 'INVENTORY (I)';
    const w = ui.width(label, !touch) + (touch ? 14 : 10);
    if (ui.pressIn(lx, btnY, w, btnH)) out.inventory = 3;
    ui.claim(lx, btnY, w, btnH);
    // (pink, the colour of the one thing to press, only while a word waits; a plain button otherwise)
    ui.drawButton(lx, btnY, w, btnH, label, { small: !touch, primary: spare > 0, lit: spare > 0 && Math.floor(t * 2) % 2 === 0 });
    lx += w + 3;
  }
  if (spare > 0) {
    // spare words waiting for a place
    const first = WORD_IDS.find((w) => h.words[w] > 0);
    if (first) {
      const iy = btnY + Math.floor((btnH - 12) / 2);
      g.drawImage(art.icons.word[first].img, lx, iy);
      drawText(g, `${spare}`, lx + 14, iy + 4, WORD_COLOR[first], { font: 'small', shadow: P.ink });
    }
  }

  // ---- top right: minimap and pause ---------------------------------------------------------
  const mw = Math.min(66, Math.floor(W * 0.2));
  const mh = 46;
  minimap(g, W - mw - 4, 4, mw, mh, game);
  if (!game.level.town) {
    // pressing the small map shows the large one
    if (ui.pressIn(W - mw - 4, 4, mw, mh)) out.map = true;
    ui.claim(W - mw - 4, 4, mw, mh);
    ui.mark('minimap', W - mw - 4, 4, mw, mh);
    if (!touch) drawText(g, 'M', W - mw - 2, 6, THEME.dim, { font: 'small', shadow: P.ink });
  }
  const pw = touch ? 24 : 14;
  const ph = touch ? 18 : 12;
  const pauseY = mh + 7;
  if (ui.pressIn(W - pw - 4, pauseY, pw, ph)) out.pause = true;
  ui.claim(W - pw - 4, pauseY, pw, ph);
  ui.drawButton(W - pw - 4, pauseY, pw, ph, 'II', { small: !touch });

  // ---- boss bar -----------------------------------------------------------------------------
  const boss = game.boss;
  const bossUp = !!boss && !boss.dead && boss.state !== 'sleep';
  if (boss && bossUp) {
    const bw = Math.min(150, W - 160);
    const x = Math.floor(W / 2 - bw / 2);
    drawText(g, boss.name, Math.floor(W / 2), 4, boss.words.length ? WORD_COLOR[boss.words[0]] : P.fr4, { align: 'center', shadow: P.ink });
    g.fillStyle = THEME.ink;
    g.fillRect(x - 1, 14, bw + 2, 6);
    g.fillStyle = THEME.lifeLo;
    g.fillRect(x, 15, bw, 4);
    g.fillStyle = THEME.life;
    g.fillRect(x, 15, Math.round((bw * Math.max(0, boss.life)) / boss.maxLife), 4);
  }

  // ---- the first dungeon's prompt, and the word just found ------------------------------------
  // (a word found is the bigger news: for its moment it takes the prompt's place)
  // (where the prompt or the news of a word ends, so that on a narrow screen the messages can go under it)
  let noticeEnd = 0;
  if (inp.toast) noticeEnd = drawToast(ui, art, inp.toast.word, inp.toast.t, bossUp && W >= 380 ? 24 : W >= 380 ? 4 : NARROW_TOP, !!inp.toast.big);
  else if (banner && !bossUp) noticeEnd = drawBanner(ui, banner, t);

  // ---- messages -----------------------------------------------------------------------------
  const msgW = Math.max(120, Math.floor(W / 2) - 62);
  if (touch) {
    // With fingers: top left, under the inventory button, the newest first and the older below it.
    // (They were in the bottom left, above the flask, where the left thumb is. The owner, asked
    // whether they were hidden as the life globe had been: "Yes they are also being hidden".)
    const narrow = W < 380;
    let my = btnY + btnH + 4;
    if (narrow && noticeEnd > 0) my = Math.max(my, noticeEnd + 4);
    for (let i = fx.messages.length - 1; i >= 0 && i >= fx.messages.length - 4; i--) {
      const m = fx.messages[i];
      // (on arriving, the game says where: "Dungeon 1". Up here that is already written, two lines above)
      if (m.text === place) continue;
      g.globalAlpha = m.t > m.life - 1 ? Math.max(0, m.life - m.t) : 1;
      for (const part of wrapText(m.text, narrow ? W - 12 : msgW, 'normal')) {
        drawText(g, part, 4, my, m.color, { shadow: P.ink });
        my += 9;
      }
      g.globalAlpha = 1;
    }
  } else {
    // With a mouse: above the flask, the newest lowest (when the attacks are stacked they reach
    // across the screen, so above them).
    let my = stacked ? barTop - pbh - 26 : H - ps - 26;
    for (let i = fx.messages.length - 1; i >= 0 && i >= fx.messages.length - 4; i--) {
      const m = fx.messages[i];
      const parts = wrapText(m.text, msgW, 'normal');
      g.globalAlpha = m.t > m.life - 1 ? Math.max(0, m.life - m.t) : 1;
      for (let k = parts.length - 1; k >= 0; k--) {
        drawText(g, parts[k], 4, my, m.color, { shadow: P.ink });
        my -= 9;
      }
      g.globalAlpha = 1;
    }
  }

  // ---- touch: a ghost of the gesture the prompt is asking for ---------------------------------
  if (touch && inp.gesture) {
    const q = inp.gesture;
    if (q.kind === 'stick' && !input.stick.active) drawGesture(g, 'stick', Math.round(W * 0.17), Math.round(H * 0.62), q.dx, q.dy, t);
    else if (q.kind === 'flick' && !input.aim.active) drawGesture(g, 'flick', Math.round(W * 0.62), Math.round(H * 0.6), 1, 0, t);
    else if ((q.kind === 'tap' || q.kind === 'hold') && !input.aim.active) drawGesture(g, q.kind, q.x, q.y, 0, 0, t);
  }

  // ---- touch feedback: the stick, and where the right thumb is aiming -------------------------
  if (input.stick.active) {
    const s = input.stick;
    g.fillStyle = THEME.edgeHi;
    for (let i = 0; i < 28; i++) {
      const a = (i / 28) * Math.PI * 2;
      g.fillRect(Math.round(s.ox + Math.cos(a) * 18), Math.round(s.oy + Math.sin(a) * 18), 1, 1);
    }
    g.globalAlpha = 0.6;
    g.fillStyle = THEME.edgeHi;
    g.fillRect(Math.round(s.ox + s.dx * 14) - 3, Math.round(s.oy + s.dy * 14) - 3, 6, 6);
    g.globalAlpha = 1;
  }
  // the reticle sits on whatever a tap's aim help picked
  if (input.mark) {
    g.fillStyle = THEME.accent;
    const ax = Math.round(input.mark.x);
    const ay = Math.round(input.mark.y);
    const o = 6 + (Math.floor(t * 6) % 2);
    g.fillRect(ax - o - 2, ay, 3, 1);
    g.fillRect(ax + o, ay, 3, 1);
    g.fillRect(ax, ay - o - 2, 1, 3);
    g.fillRect(ax, ay + o, 1, 3);
  }
  // a ring closes above the right thumb as a press turns into a hold
  const hold = input.holdProgress();
  if (input.aim.active && hold > 0.35) {
    const cx = Math.round(input.aim.x);
    const cy = Math.round(input.aim.y) - 20;
    const n = 16;
    const lit = Math.round(((hold - 0.35) / 0.65) * n);
    for (let i = 0; i < n; i++) {
      const a = -Math.PI / 2 + (i / n) * Math.PI * 2;
      g.fillStyle = i < lit ? (hold >= 1 ? THEME.accent : THEME.edgeHi) : THEME.edge;
      g.fillRect(Math.round(cx + Math.cos(a) * 7), Math.round(cy + Math.sin(a) * 7), hold >= 1 ? 2 : 1, hold >= 1 ? 2 : 1);
    }
  }
  return out;
}
