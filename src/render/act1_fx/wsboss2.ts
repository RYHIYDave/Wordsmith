// ENDLESS MODE'S FINAL BOSS ON FOOT, DRAWN (the queue's build-endless-tablet-and-final-boss, stage 3; behind ENDLESS_KEY), for
// render/act1_fx/wsboss.ts: HIS RUNES, written and thrown (his words for them, 12 Nov 2026: “i want to see the runes i see in my
// lexicon on thiese attacks”, “not with the stone around it, just the symbol carved into it.  and have him like create it not just
// pull it out of thin air”), in the saddle and on foot; and HIS MELDS, each as the art chat drew it (art/endless_boss.ts, every one
// with his yes), laid where its rules put it (game/act1_rules/wsboss2.ts), drawn in the game's own pixels:
//   - every warning before it can hurt in the bosses' ground-warning pink (render/act1_fx/garden_warn.ts);
//   - the melds' elements read in their own colours (render/melds3.ts MELD_RAMP), his pink through them;
//   - what stands among the figures painted by the art (the Blight's trees: art/act1_figs/wsboss.ts), the rest drawn here.
// The film tool's choreography (tools/endless_boss_film.ts meldScene, writeRune) brought into the game: the art's picture pixels are
// half a game pixel (GRAIN), so its lengths here are halved.

import { AVAL, BLIGHT, BLIGHT_FINGERS, BLIGHT_AT, CONTAGION, ERUPT, ERUPT_AT, FALL, FIRE, FROST, FROSTBITE, FUMES, HAIL, MELD, POWER, SCALD, SHADE, SPORE, THUNDER, WILDFIRE, BOLT, eruptRace, hailCloudAt } from '../../art/endless_boss';
import { THING_FPS, WS_THING_MAKERS, meteorFrame, treeFrame, treeVariant, wsPhase1Mob, wsPhase2Mob, MELD_CLIP, TREE_LIFE } from '../../art/act1_figs/wsboss';
import { GLYPH, WORD_COLOR, WORD_GLOW } from '../../art/icons';
import { FLAME } from '../../art/mkit';
import { skeletonAt } from '../../art/new_mobs3';
import type { Mob } from '../../art/new_mobs3';
import { P as PAL } from '../../art/palette';
import { project } from '../../art/skeleton';
import type { V3 } from '../../art/skeleton';
import { TILE3 } from '../../art/new_mobs3';
import { FINAL_PLACE, toEdge } from '../../art/final_arena';
import { drawSprite } from '../../engine/px';
import type { Sprite } from '../../engine/px';
import { MELDS, WILD_BOOM, WS2_TUNE, avalancheAt, layOf, own, scaldBeamAt, slamRingAt } from '../../game/act1_rules/wsboss2';
import type { MeldId } from '../../game/act1_rules/wsboss2';
import type { Monster, Peril } from '../../game/state';
import { MELD_GLYPH, MELD_RAMP } from '../melds3';
import { drawFanWarn, drawPolyWarn, drawStripWarn, warnK } from './garden_warn';
import type { Act1FxCtx } from './types';

const T = TILE3;
const S = MELD.slam;
const TAU = Math.PI * 2;
const clamp01 = (v: number): number => (v < 0 ? 0 : v > 1 ? 1 : v);
const smooth = (v: number): number => {
  const c = clamp01(v);
  return c * c * (3 - 2 * c);
};
const hash = (a: number, b: number, c: number): number => {
  const h = Math.sin(a * 127.1 + b * 311.7 + c * 74.7) * 43758.5453;
  return h - Math.floor(h);
};
const PINK = '#ff4f8a';
const HOT = '#fffbe8';

// ---------------------------------------------------------------------------------------------
// THE THINGS PAINTED AHEAD (the same film as wsboss.ts's: things:wsboss)

const THINGS = 'things:wsboss';
const own0: Record<string, Sprite[]> = {};
function thing(c: Act1FxCtx, name: string, i: number): Sprite | null {
  const M = WS_THING_MAKERS[name];
  if (!M) return null;
  const k = Math.max(0, Math.min(M.n - 1, i));
  const f = c.film?.<Record<string, Sprite[]>>(THINGS)?.[name]?.[k];
  if (f) return f;
  const list = (own0[name] ??= []);
  return (list[k] ??= M.make(k));
}

// ---------------------------------------------------------------------------------------------
// WHERE HIS HAND IS (his own lengths: forward, to his left, up), a frame of a move at a time, worked out once a move

type Bone = { h: V3; p: V3 };
const BONES: Record<string, Bone[]> = {};
let mob1: Mob | null = null;
let mob2: Mob | null = null;
function bone(move: string, t: number): Bone {
  const key = move;
  let list = BONES[key];
  if (!list) {
    const foot = move === MELD_CLIP;
    const mob = foot ? (mob2 ??= wsPhase2Mob()) : (mob1 ??= wsPhase1Mob());
    const long = foot ? MELD.long : 1.6;
    list = BONES[key] = [];
    for (let i = 0; i <= Math.ceil(long * 30); i++) {
      const sk = skeletonAt(mob, move, i / 30);
      list.push({ h: [...sk.handL] as V3, p: [...sk.pelvis] as V3 });
    }
  }
  return list[Math.max(0, Math.min(list.length - 1, Math.round(t * 30)))];
}
/** The shade's version of one of his points: from his pelvis's floor point, his shade's size, behind him and over him. */
function great(b: Bone, q: V3): V3 {
  return [b.p[0] + (q[0] - b.p[0]) * SHADE.size - SHADE.behind, b.p[1] + (q[1] - b.p[1]) * SHADE.size + SHADE.side, q[2] * SHADE.size + SHADE.up];
}
/** The way he is painted from, by the side his picture is (render/act1_fx/wsboss.ts sideOf). */
export type Side = 'front' | 'frontL' | 'backL' | 'back';
const VIEW: Record<Side, 'front' | 'frontL' | 'rearL' | 'back'> = { front: 'front', frontL: 'frontL', backL: 'rearL', back: 'back' };
/** A point of his own (forward, left, up) on the screen, as his picture from `side` has it. */
function ownAt(c: Act1FxCtx, m: Monster, side: Side, q: V3): [number, number] {
  const [sx, sy] = c.at(m.x, m.y);
  const pr = project(q, VIEW[side]);
  return [sx + pr[0] / 2, sy + pr[1] / 2];
}

// ---------------------------------------------------------------------------------------------
// THE RUNES (the Lexicon's symbols, no stone round them; the meld's own as render/melds3.ts cuts it)

type Cell = { x: number; y: number; lift: boolean };
const ORDERS = new Map<readonly string[], Cell[]>();
/** The order his claw writes a symbol's cells in (the film tool's strokeOrder). */
function strokeOrder(rows: readonly string[]): Cell[] {
  const have = ORDERS.get(rows);
  if (have) return have;
  const left = new Set<string>();
  rows.forEach((r, y) => [...r].forEach((ch, x) => {
    if (ch !== '.') left.add(`${x},${y}`);
  }));
  const out: Cell[] = [];
  let cur: [number, number] | null = null;
  let d: [number, number] = [0, 0];
  while (left.size) {
    let next: [number, number] | null = null;
    if (cur) for (const [dx, dy] of [d, [1, 0], [0, 1], [-1, 0], [0, -1], [1, 1], [-1, 1], [1, -1], [-1, -1]] as [number, number][]) {
      if ((dx || dy) && left.has(`${cur[0] + dx},${cur[1] + dy}`)) {
        next = [cur[0] + dx, cur[1] + dy];
        break;
      }
    }
    const lift = !next;
    if (!next) for (const k of left) {
      const [x, y] = k.split(',').map(Number);
      if (!next || y < next[1] || (y === next[1] && x < next[0])) next = [x, y];
    }
    const n2 = next as [number, number];
    d = cur && !lift ? [n2[0] - cur[0], n2[1] - cur[1]] : [0, 0];
    left.delete(`${n2[0]},${n2[1]}`);
    out.push({ x: n2[0], y: n2[1], lift: lift && out.length > 0 });
    cur = n2;
  }
  ORDERS.set(rows, out);
  return out;
}
/** A symbol drawn at (cx, cy), `K` game pixels to a cell, `lit` of its cells written (the freshest white-hot, cooling through its
 * glow to its own colours), inked round. */
function glyph(g: CanvasRenderingContext2D, rows: readonly string[], cols: readonly [string, string], cx: number, cy: number, K: number, lit = Infinity, a = 1): void {
  const order = strokeOrder(rows);
  const n = rows.length;
  const x0 = cx - (n * K) / 2;
  const y0 = cy - (n * K) / 2;
  const box = (i: number): [number, number, number, number] => {
    const c = order[i];
    const X = Math.round(x0 + c.x * K);
    const Y = Math.round(y0 + c.y * K);
    return [X, Y, Math.round(x0 + (c.x + 1) * K) - X, Math.round(y0 + (c.y + 1) * K) - Y];
  };
  const m = Math.min(order.length, Math.ceil(lit));
  const was = g.globalAlpha;
  g.globalAlpha = was * a;
  g.fillStyle = PAL.ink;
  for (let i = 0; i < m; i++) {
    const [X, Y, w, h] = box(i);
    g.fillRect(X - 1, Y - 1, w + 2, h + 2);
  }
  for (let i = 0; i < m; i++) {
    const c = order[i];
    const age = lit - i;
    const ownC = rows[c.y][c.x] === 'o' ? cols[1] : cols[0];
    g.fillStyle = age < 1.6 ? HOT : age < 4 ? cols[1] : ownC;
    const [X, Y, w, h] = box(i);
    g.fillRect(X, Y, w, h);
  }
  g.globalAlpha = was;
}
function dot(g: CanvasRenderingContext2D, x: number, y: number, r: number, col: string, a: number): void {
  const was = g.globalAlpha;
  g.globalAlpha = was * a;
  g.fillStyle = col;
  if (r <= 1) g.fillRect(Math.round(x), Math.round(y), 1, 1);
  else {
    g.beginPath();
    g.arc(x, y, r, 0, TAU);
    g.fill();
  }
  g.globalAlpha = was;
}
function haze(g: CanvasRenderingContext2D, x: number, y: number, r: number, col: string, a: number): void {
  if (a <= 0 || r <= 0) return;
  const gr = g.createRadialGradient(x, y, 0, x, y, r);
  gr.addColorStop(0, col);
  gr.addColorStop(1, 'rgba(0,0,0,0)');
  const was = g.globalAlpha;
  g.globalAlpha = was * a;
  g.fillStyle = gr;
  g.fillRect(x - r, y - r, r * 2, r * 2);
  g.globalAlpha = was;
}
type WordId = 'power' | 'fire' | 'frost' | 'lightning' | 'poison';
/** HE MAKES IT (the film tool's writeRune): his pink gathers into his raised claw at (fx, fy); then a beam of it writes the symbol on
 * the air at (X, Y), stroke by stroke, sparks thrown off where it writes; written, it flares, and hangs burning. */
function writeRune(c: Act1FxCtx, word: WordId, X: number, Y: number, fx: number, fy: number, p: number, held: number, K: number): void {
  const g = c.g!;
  const GATHER = 0.22;
  const rows = GLYPH[word];
  const cols: [string, string] = [WORD_COLOR[word], WORD_GLOW[word]];
  const order = strokeOrder(rows);
  const fr = Math.floor(c.t * 30);
  const half = (rows.length * K) / 2;
  if (p < GATHER) {
    const k = p / GATHER;
    for (let i = 0; i < 16; i++) {
      const ph = k * 1.7 - (i / 16) * 0.7;
      if (ph <= 0 || ph >= 1) continue;
      const a = i * 2.39 + ph * 3.2;
      const r = 17 * (1 - ph) * (0.8 + (0.4 * ((i * 37) % 7)) / 7);
      dot(g, fx + Math.cos(a) * r, fy + Math.sin(a) * r * 0.75, 1, i % 3 === 0 ? cols[0] : PINK, 0.95);
    }
    dot(g, fx, fy, 0.5 + 1.2 * k, HOT, 0.9);
    c.spot(fx, fy, 10 + 10 * k, 0.4);
    return;
  }
  const w = Math.min(1, (p - GATHER) / (1 - GATHER));
  const lit = w * order.length;
  haze(g, X, Y, half + 5, PINK, 0.18 + 0.12 * Math.min(1, held * 4));
  c.spot(X, Y, half + 14, 0.5);
  const flare = held > 0 && held < 0.1;
  glyph(g, rows, cols, X, Y, K, flare ? order.length + 1.2 - held * 30 : held > 0 ? Infinity : lit);
  if (w >= 1) return;
  // (the beam from his claw to where it writes, flickering; dimmer while his claw is lifted between strokes)
  const i = Math.min(order.length - 1, Math.floor(lit));
  const a0 = order[Math.max(0, i - 1)];
  const a1 = order[i];
  const f = lit - i;
  const qx = X - half + ((a1.lift ? a1.x : a0.x + (a1.x - a0.x) * f) + 0.5) * K;
  const qy = Y - half + ((a1.lift ? a1.y : a0.y + (a1.y - a0.y) * f) + 0.5) * K;
  const steps = Math.max(1, Math.ceil(Math.hypot(qx - fx, qy - fy)));
  for (let k = 0; k <= steps; k++) {
    if ((k + fr) % 5 === 0) continue;
    const u = k / steps;
    const wob = Math.sin(u * 9 + fr * 1.7) * 0.6 * Math.sin(Math.PI * u);
    dot(g, fx + (qx - fx) * u + wob, fy + (qy - fy) * u - wob, 1, (k + fr) % 3 === 0 ? HOT : PINK, a1.lift ? 0.4 : 0.9);
  }
  dot(g, fx, fy, 1, HOT, 0.9);
  dot(g, qx, qy, 1.4, HOT, 1);
  for (let k = 0; k < 6; k++) {
    const r = hash(fr, k, 7);
    const a = r * TAU;
    const d = 2 + 3 * ((k * 0.37 + r * 3) % 1);
    dot(g, qx + Math.cos(a) * d, qy + Math.sin(a) * d - 1, 1, k % 2 ? PINK : cols[1], 0.9);
  }
}

// ---------------------------------------------------------------------------------------------
// HIS WORDS IN THE SADDLE: each written at his hand, then thrown where it goes

/** Each word's rune: the word, its writing, when it is let go, where it goes (and when it gets there), as the art times them. */
const WORD_THROW: Record<string, { word: WordId; write: readonly [number, number]; cast: number; at: number }> = {
  power: { word: 'power', write: POWER.write, cast: POWER.cast, at: POWER.cast + 0.3 },
  flame: { word: 'fire', write: FIRE.write, cast: FIRE.cast, at: FIRE.burst },
  frost: { word: 'frost', write: FROST.write, cast: FROST.write[1] + 0.08, at: FROST.hit },
  lightning: { word: 'lightning', write: BOLT.write, cast: BOLT.cast, at: BOLT.crack },
  poison: { word: 'poison', write: SPORE.write, cast: SPORE.cast, at: SPORE.burst },
};
const RUNE_K = 2;
function wordRune(c: Act1FxCtx, m: Monster, side: Side, move: string, t: number): void {
  const W = WORD_THROW[move];
  const g = c.g;
  if (!W || !g || t < W.write[0] || t > W.at + 0.25) return;
  const spotOf = (h: V3): V3 => [h[0] + 9, h[1], h[2] + 15];
  const spot = ownAt(c, m, side, spotOf(bone(move, W.write[1]).h));
  if (t <= W.cast) {
    const hb = bone(move, t).h;
    const claw = ownAt(c, m, side, [hb[0] + 1.5, hb[1], hb[2] + 1.5]);
    writeRune(c, W.word, spot[0], spot[1], claw[0], claw[1], clamp01((t - W.write[0]) / (W.write[1] - W.write[0])), Math.max(0, t - W.write[1]), RUNE_K);
    return;
  }
  // (thrown: flame straight up out of sight; power out over the hero; frost driven into the floor before him; lightning over the
  // room, where the orb will crack out; poison over the hero, where it bursts)
  const k = m.a1 ?? {};
  const h = c.game.hero;
  const fx = k.fx ?? m.fx;
  const fy = k.fy ?? m.fy;
  let to: [number, number];
  if (move === 'flame') to = [spot[0], spot[1] - 200];
  else if (move === 'frost') to = c.at(m.x + fx * FROST.from, m.y + fy * FROST.from) as [number, number];
  else if (move === 'lightning') {
    const [x, y] = c.at((m.x + h.x) / 2, (m.y + h.y) / 2);
    to = [x, y - 35];
  } else {
    const [x, y] = c.at(k.cx ?? h.x, k.cy ?? h.y);
    to = [x, y - 30];
  }
  const u = clamp01((t - W.cast) / (W.at - W.cast));
  const e = move === 'frost' ? u * u : smooth(u);
  const rows = GLYPH[W.word];
  const cols: [string, string] = [WORD_COLOR[W.word], WORD_GLOW[W.word]];
  const x = spot[0] + (to[0] - spot[0]) * e;
  const y = spot[1] + (to[1] - spot[1]) * e - (move === 'frost' || move === 'flame' ? 0 : 30 * Math.sin(Math.PI * u));
  if (t > W.at) {
    // (where it strikes: a flash of his pink and the word's colour)
    const b = (t - W.at) / 0.25;
    haze(g, to[0], to[1], 8 + 14 * b, HOT, 0.8 * (1 - b));
    haze(g, to[0], to[1], 12 + 18 * b, cols[0], 0.5 * (1 - b));
    return;
  }
  for (let j = 1; j < 5; j++) {
    const v = Math.max(0, e - j * 0.06);
    glyph(g, rows, cols, spot[0] + (to[0] - spot[0]) * v, spot[1] + (to[1] - spot[1]) * v, RUNE_K, Infinity, 0.35 / j);
  }
  haze(g, x, y, 10, PINK, 0.3);
  glyph(g, rows, cols, x, y, RUNE_K);
  c.spot(x, y, 16, 0.5);
}

// ---------------------------------------------------------------------------------------------
// A MELD (the film tool's meldScene): his rune and his shade's, written; up, wheeling round each other, melded; driven down

/** Where each meld's rune goes: into the floor this far before him (tiles), at his feet (0), flung up out of sight ('sky'), or flung
 * to the wall behind him ('wall'). */
const INTO: Record<MeldId, number | 'sky' | 'wall'> = {
  eruption: ERUPT.at, hailstorm: 'sky', thunder: 'sky', avalanche: 'wall', blight: BLIGHT.at, scald: 0, frostbite: 0, fumes: FUMES.at, wildfire: WILDFIRE.at, contagion: 0,
};
const MEET: V3 = [8, -4, 112];
function meldRune(c: Act1FxCtx, m: Monster, side: Side, mi: MeldId, t: number): void {
  const g = c.g;
  if (!g) return;
  const [mine, its] = MELDS[mi].words as readonly [WordId, WordId];
  const spotOf = (h: V3): V3 => [h[0] + 9, h[1], h[2] + 15];
  const b1 = bone(MELD_CLIP, MELD.write[1]);
  const mySpot = spotOf(b1.h);
  const itsSpot = great(b1, spotOf(b1.h));
  const W = MELD.write;
  // (his rune, at his hand; the shade's, a moment after, at its great hand, twice the size)
  if (t > W[0] && t <= MELD.up) {
    const hb = bone(MELD_CLIP, t).h;
    const [x, y] = ownAt(c, m, side, mySpot);
    const [fx, fy] = ownAt(c, m, side, [hb[0] + 1.5, hb[1], hb[2] + 1.5]);
    writeRune(c, mine, x, y, fx, fy, clamp01((t - W[0]) / (W[1] - W[0])), Math.max(0, t - W[1]), RUNE_K);
  }
  const tl = t - SHADE.lag;
  if (tl > W[0] && t <= MELD.up + SHADE.lag * 0.5) {
    const bl = bone(MELD_CLIP, tl);
    const [x, y] = ownAt(c, m, side, itsSpot);
    const [fx, fy] = ownAt(c, m, side, great(bl, bl.h));
    writeRune(c, its, x, y, fx, fy, clamp01((tl - W[0]) / (W[1] - W[0])), Math.max(0, tl - W[1]), RUNE_K * 2);
  }
  // (up, and meeting over him: wheeling round each other faster and faster, closing)
  if (t > MELD.up && t < MELD.melded) {
    const u = clamp01((t - MELD.up) / (MELD.meet - MELD.up));
    const e = smooth(u);
    const lift = (a: V3): V3 => [a[0] + (MEET[0] - a[0]) * e, a[1] + (MEET[1] - a[1]) * e, a[2] + (MEET[2] - a[2]) * e + 30 * Math.sin(Math.PI * u)];
    let pa = lift(mySpot);
    let pb = lift(itsSpot);
    if (t > MELD.meet) {
      const w = (t - MELD.meet) / (MELD.melded - MELD.meet);
      const r = 16 * (1 - w);
      const th = 18 * w * w + 2;
      pa = [MEET[0] + Math.cos(th) * r, MEET[1] + Math.sin(th) * r, MEET[2] + Math.sin(th) * r * 0.4];
      pb = [MEET[0] - Math.cos(th) * r, MEET[1] - Math.sin(th) * r, MEET[2] - Math.sin(th) * r * 0.4];
      for (let i = 0; i < 10; i++) {
        const a2 = i * 2.4 + t * 13;
        const [qx, qy] = ownAt(c, m, side, [MEET[0] + Math.cos(a2) * (r + 6 + (i % 3) * 3), MEET[1] + Math.sin(a2) * (r + 6), MEET[2] + Math.sin(a2 * 1.3) * 8]);
        dot(g, qx, qy, 1, i % 2 ? PINK : HOT, 0.9);
      }
    }
    const [xa, ya] = ownAt(c, m, side, pa);
    const [xb, yb] = ownAt(c, m, side, pb);
    glyph(g, GLYPH[its], [WORD_COLOR[its], WORD_GLOW[its]], xb, yb, RUNE_K + 1);
    glyph(g, GLYPH[mine], [WORD_COLOR[mine], WORD_GLOW[mine]], xa, ya, RUNE_K);
    c.spot((xa + xb) / 2, (ya + yb) / 2, 24, 0.5);
  }
  // (MELDED: a flash, and the meld's own rune blazing where they met; driven down into the floor by the slam, or flung away)
  const rows = MELD_GLYPH[mi];
  const ramp = MELD_RAMP[mi];
  const cols: [string, string] = [ramp[3], ramp[4]];
  const BIG = 2.5;
  const [mx, my] = ownAt(c, m, side, MEET);
  if (t >= MELD.melded && t < MELD.melded + 0.22) {
    const b = (t - MELD.melded) / 0.22;
    haze(g, mx, my, 7 + 15 * b, HOT, 0.85 * (1 - b));
    haze(g, mx, my, 12 + 20 * b, PINK, 0.6 * (1 - b));
  }
  const fx = m.a1?.fx ?? m.fx;
  const fy = m.a1?.fy ?? m.fy;
  const into = INTO[mi];
  const intoAt = (): [number, number] => {
    if (typeof into === 'number') return c.at(m.x + fx * into, m.y + fy * into) as [number, number];
    const d = toEdge(m.x, m.y, -fx, -fy, 0.2);
    const [x, y] = c.at(m.x - fx * d, m.y - fy * d);
    return [x, y - 20];
  };
  if (t >= MELD.melded && t <= MELD.slam - 2 / 30 + 1e-6) {
    haze(g, mx, my, 15, PINK, 0.2 + 0.08 * Math.sin(t * 30));
    glyph(g, rows, cols, mx, my, BIG);
    c.spot(mx, my, 30, 0.7);
  } else if (into === 'sky' && t > MELD.slam - 2 / 30 && t < MELD.slam + 0.3) {
    const u = (t - (MELD.slam - 2 / 30)) / (0.3 + 2 / 30);
    for (let k2 = 0; k2 < 8; k2++) glyph(g, rows, cols, mx, my - 260 * u * u - 40 * u + 6 * k2, BIG, Infinity, k2 === 0 ? 1 : 0.45 / k2);
  } else if (into !== 'sky' && t > MELD.slam - 2 / 30 && t <= MELD.slam + 1 / 30 + (into === 'wall' ? 0.25 : 0)) {
    const u = clamp01((t - (MELD.slam - 2 / 30)) / (into === 'wall' ? 0.3 : 2 / 30));
    const [ix, iy] = intoAt();
    for (let k2 = 0; k2 < 6; k2++) {
      const v = Math.max(0, u - k2 * 0.12);
      glyph(g, rows, cols, mx + (ix - mx) * v, my + (iy - my) * v, BIG, Infinity, k2 === 0 ? 1 : 0.4 / k2);
    }
  }
  if (into !== 'sky' && t > MELD.slam && t < MELD.slam + 0.4) {
    const b = (t - MELD.slam) / 0.4;
    const [ix, iy] = intoAt();
    haze(g, ix, iy, 8 + 10 * b, '#fff0b0', 0.8 * (1 - b));
    haze(g, ix, iy, 14 + 14 * b, cols[0], 0.7 * (1 - b));
    haze(g, ix, iy, 20 + 18 * b, PINK, 0.5 * (1 - b));
    c.spot(ix, iy, 40, 0.9 * (1 - b));
  }
}

/** The runes of whatever he is doing, over all (render/act1_fx/wsboss.ts air). */
export function runesAir(c: Act1FxCtx, m: Monster, side: Side): void {
  const a = m.act;
  if (!a || m.dead || !c.g) return;
  const id = a.id.slice(7);
  if (id === 'meld') {
    const mi = m.a1?.meld;
    const k = mi === undefined ? null : (Object.keys(MELDS) as MeldId[])[mi | 0];
    if (k) meldRune(c, m, side, k, a.t);
  } else if (WORD_THROW[id]) wordRune(c, m, side, id, a.t);
}

// ---------------------------------------------------------------------------------------------
// ON THE FLOOR, AROUND AND OVER: the melds' own drawings

/** A ring on the floor about (x, y), `r` tiles, as the screen sees it. */
function floorRing(c: Act1FxCtx, x: number, y: number, r: number, n = 48): void {
  const g = c.g!;
  g.beginPath();
  for (let i = 0; i <= n; i++) {
    const a = (i / n) * TAU;
    const [sx, sy] = c.at(x + Math.cos(a) * r, y + Math.sin(a) * r);
    if (i === 0) g.moveTo(sx, sy);
    else g.lineTo(sx, sy);
  }
}
/** A pool on the floor (an ellipse as the screen sees a round of `r` tiles), its colour falling off from its middle. */
function pool(c: Act1FxCtx, x: number, y: number, r: number, stops: readonly (readonly [number, string])[], a = 1): void {
  const g = c.g!;
  const [sx, sy] = c.at(x, y);
  const R = r * 16 * Math.SQRT2;
  const was = g.globalAlpha;
  g.globalAlpha = was * a;
  g.save();
  g.translate(sx, sy);
  g.scale(1, 0.5);
  const gr = g.createRadialGradient(0, 0, 0, 0, 0, R);
  for (const [o, col] of stops) gr.addColorStop(o, col);
  g.fillStyle = gr;
  g.beginPath();
  g.arc(0, 0, R, 0, TAU);
  g.fill();
  g.restore();
  g.globalAlpha = was;
}
/** A jagged bolt from (x0, y0) to (x1, y1) on the screen: its glow, its body, its white heart; forks off it. */
function bolt(g: CanvasRenderingContext2D, x0: number, y0: number, x1: number, y1: number, seed: number, w: number, cols: readonly [string, string, string], a = 1, fork = 2): void {
  const n = Math.max(3, Math.round(Math.hypot(x1 - x0, y1 - y0) / 9));
  const pts: [number, number][] = [[x0, y0]];
  const L = Math.hypot(x1 - x0, y1 - y0) || 1;
  const nx = -(y1 - y0) / L;
  const ny = (x1 - x0) / L;
  for (let i = 1; i < n; i++) {
    const u = i / n;
    const j = (hash(seed, i, 3) - 0.5) * 2 * Math.min(10, L * 0.12);
    pts.push([x0 + (x1 - x0) * u + nx * j, y0 + (y1 - y0) * u + ny * j]);
  }
  pts.push([x1, y1]);
  const was = g.globalAlpha;
  g.lineCap = 'round';
  g.lineJoin = 'round';
  for (const [lw, col, al] of [[w * 3, cols[0], 0.35], [w * 1.6, cols[1], 0.85], [Math.max(1, w * 0.6), cols[2], 1]] as const) {
    g.globalAlpha = was * a * al;
    g.strokeStyle = col;
    g.lineWidth = lw;
    g.beginPath();
    pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y)));
    g.stroke();
  }
  g.globalAlpha = was;
  for (let f = 0; f < fork; f++) {
    const i = 1 + Math.floor(hash(seed, f, 9) * (pts.length - 2));
    const [fx, fy] = pts[i];
    const ang = Math.atan2(y1 - y0, x1 - x0) + (hash(seed, f, 11) - 0.5) * 1.8;
    const fl = L * (0.12 + 0.15 * hash(seed, f, 13));
    bolt(g, fx, fy, fx + Math.cos(ang) * fl, fy + Math.sin(ang) * fl, seed * 7 + f + 1, w * 0.5, cols, a * 0.8, 0);
  }
}
function stroke(g: CanvasRenderingContext2D, col: string, w: number, a: number): void {
  const was = g.globalAlpha;
  g.globalAlpha = was * a;
  g.strokeStyle = col;
  g.lineWidth = w;
  g.stroke();
  g.globalAlpha = was;
}
const WFROM = (x: number, y: number) => ({ x, y, fx: 1, fy: 0, hand: 1 });
/** A round warning about (x, y), `r` tiles, `k` through it. */
const roundWarn = (c: Act1FxCtx, x: number, y: number, r: number, k: number): void => drawFanWarn(c.g!, c.at, WFROM(x, y), -Math.PI, Math.PI, r, k, c.t);
/** The whole floor darkened (a storm over the room). */
function floorTint(c: Act1FxCtx, col: string, a: number): void {
  if (a <= 0) return;
  pool(c, FINAL_PLACE.cx, FINAL_PLACE.cy, FINAL_PLACE.floor + 0.3, [[0, col], [0.85, col], [1, 'rgba(0,0,0,0)']], a);
}
const OWN_PERILS = new Set(['slamring', 'scorch', 'fallring', 'deathring']);
const meldOfPeril = (p: Peril): MeldId | 'slamring' | 'scorch' | 'fallring' | 'deathring' | null => {
  const id = (p.a1 ?? '').slice(7);
  return id in MELDS || OWN_PERILS.has(id) ? (id as MeldId) : null;
};
/** Is this peril one of his melds' (drawn here)? */
export const drawnHere = (p: Peril): boolean => meldOfPeril(p) !== null;

export function meldGround(c: Act1FxCtx, p: Peril): void {
  const g = c.g;
  if (!g) return;
  const id = meldOfPeril(p);
  const t = p.t;
  const lay = layOf(p);
  switch (id) {
    case 'slamring': {
      // (the slam's ring rolling out over the whole floor: a bright edge, the floor darkened behind it)
      const r = slamRingAt(t);
      if (r > FINAL_PLACE.floor + 1) return;
      const fade = 1 - clamp01((r - 2) / (FINAL_PLACE.floor + 1));
      floorRing(c, p.x, p.y, Math.max(0.1, r - 0.3));
      stroke(g, '#2a0a18', 6, 0.35 * fade);
      floorRing(c, p.x, p.y, r);
      stroke(g, PINK, 2, 0.5 + 0.5 * fade);
      floorRing(c, p.x, p.y, r + 0.08);
      stroke(g, '#ffd0e0', 1, 0.8 * fade);
      return;
    }
    case 'deathring': {
      // (his death: the burst, a ring of his light thrown out over the floor from where he was, as his runes fly)
      const u = t / 0.7;
      if (u >= 1) return;
      const r = (6 + 120 * (1 - (1 - u) * (1 - u))) / T;
      floorRing(c, p.x, p.y, r);
      stroke(g, PINK, 4, 0.8 * (1 - u));
      floorRing(c, p.x, p.y, r + 0.05);
      stroke(g, '#ffd8e6', 1.5, 0.9 * (1 - u));
      const [sx, sy] = c.at(p.x, p.y);
      c.spot(sx, sy, 90, 1 - u);
      return;
    }
    case 'fallring': {
      // (the boar's death: his slam's ring, harming nothing, rolling out over the floor; cracks thrown out under it)
      const u = t / FALL.ring.long;
      if (u > 1.15) return;
      const r = 0.6 + FALL.ring.reach * (1 - (1 - Math.min(1, u)) ** 2);
      const a = u < 1 ? 1 - 0.6 * u : ((1.15 - u) / 0.15) * 0.4;
      floorRing(c, p.x, p.y, Math.max(0.1, r - 0.3));
      stroke(g, '#2a0a18', 8, 0.35 * a);
      floorRing(c, p.x, p.y, r);
      stroke(g, PINK, 3, 0.85 * a);
      floorRing(c, p.x, p.y, r + 0.06);
      stroke(g, '#ffd0e0', 1, 0.85 * a);
      return;
    }
    case 'scorch': {
      // (where the boar lay: a scorch on the floor, its ash blown away; cracks out from where he struck, cooling)
      const fade = clamp01((t - 0.25) / 0.4) * (1 - clamp01((t - (p.dur - 2)) / 2));
      pool(c, p.x, p.y, 1.5, [[0, '#141014'], [0.7, 'rgba(20,16,20,0.6)'], [1, 'rgba(20,16,20,0)']], 0.55 * fade);
      const cool = clamp01(t / 1.2);
      for (let k = 0; k < 9; k++) {
        let ang = (k / 9) * TAU + 0.4 * Math.sin(k * 3.1);
        let x = p.b;
        let y = p.c;
        const long = (0.7 + 0.6 * ((k * 0.618) % 1)) * clamp01(t / 0.12);
        g.beginPath();
        const [s0x, s0y] = c.at(x, y);
        g.moveTo(s0x, s0y);
        for (let d = 0; d < long; d += 0.08) {
          ang += 0.35 * Math.sin(d * 15 + k);
          x += Math.cos(ang) * 0.08;
          y += Math.sin(ang) * 0.08;
          const [sx, sy] = c.at(x, y);
          g.lineTo(sx, sy);
        }
        stroke(g, '#0e0b10', 1.5, 0.8 * (1 - clamp01((t - (p.dur - 2)) / 2)));
        if (cool < 1) stroke(g, PINK, 1, 0.6 * (1 - cool));
      }
      return;
    }
    case 'eruption': {
      // (where the rune went in: the floor split, a fissure racing out along each way, molten in its depths, his pink at its heart;
      // each vent marked as it swells, then blown, its pool cooling)
      const race = eruptRace(t + S);
      const last = Math.max(...(lay?.spots ?? []).map((v) => v.t), 0);
      const cool = clamp01((t - last - 0.6) / 1.6);
      const gone = clamp01((t - (ERUPT.end - 0.8)) / 0.8);
      const ox = p.x + p.fx * ERUPT.at;
      const oy = p.y + p.fy * ERUPT.at;
      for (const [f, deg] of ERUPT.fans.entries()) {
        const ang = (deg * Math.PI) / 180;
        const ax = p.fx * Math.cos(ang) + p.fy * Math.sin(ang);
        const ay = p.fy * Math.cos(ang) - p.fx * Math.sin(ang);
        const L = race * ERUPT.long;
        if (L <= 0) continue;
        g.beginPath();
        for (let d = 0; d <= L; d += 0.1) {
          const wob = (Math.sin(d * T * 0.31 + f * 2) * 3 + Math.sin(d * T * 0.9 + f) * 1.2) / T;
          const [sx, sy] = c.at(ox + ax * d + ay * wob, oy + ay * d - ax * wob);
          if (d === 0) g.moveTo(sx, sy);
          else g.lineTo(sx, sy);
        }
        g.lineCap = 'round';
        g.lineJoin = 'round';
        stroke(g, '#140808', 5, 0.75 * (1 - gone));
        stroke(g, cool < 0.6 ? '#c25a12' : '#2a0e0a', 3, (0.95 - 0.5 * cool) * (1 - gone));
        stroke(g, cool < 0.5 ? '#ffb43a' : '#4a1208', 1.6, (0.9 - 0.5 * cool) * (1 - gone));
        stroke(g, PINK, 0.8, 0.7 * (1 - cool) * (1 - gone));
      }
      for (const v of lay?.spots ?? []) {
        const k = warnK(t, v.t - 0.75, v.t);
        if (k >= 0) {
          roundWarn(c, v.x, v.y, WS2_TUNE.eruption.reach, k);
          pool(c, v.x, v.y, 0.45, [[0, '#ffb43a'], [0.5, '#c25a12'], [1, 'rgba(74,18,8,0)']], 0.3 + 0.6 * k);
        }
        const u = t - v.t;
        if (u >= 0) pool(c, v.x, v.y, 0.75, [[0, '#fff0b0'], [0.35, '#ffb43a'], [0.7, '#8a2c0c'], [1, 'rgba(28,8,6,0)']], (1 - clamp01((u - ERUPT.hold) / ERUPT.cool)) * 0.9);
      }
      return;
    }
    case 'hailstorm': {
      // (the storm's shadow over the room; each stone's shadow on the floor where it will strike, marked; the bolts' marks)
      const cl = hailCloudAt(t + S);
      floorTint(c, '#141a34', 0.35 * cl);
      for (const s of lay?.spots ?? []) {
        const bolt0 = s.r === 2;
        const k = bolt0 ? warnK(t, s.t - HAIL.boltWarn, s.t) : warnK(t, s.t - HAIL.fall - HAIL.warn, s.t);
        if (k >= 0) roundWarn(c, s.x, s.y, bolt0 ? WS2_TUNE.hail.bolt.reach : WS2_TUNE.hail.reach, k);
        const u = t - s.t;
        if (u >= 0 && u < 1.4) {
          // (shattered: a frost of ice splinters left where it struck, melting)
          const a = 1 - u / 1.4;
          for (let i = 0; i < (bolt0 ? 10 : 7); i++) {
            const ang = hash(s.k, i, 21) * TAU;
            const d = (bolt0 ? 0.9 : 0.5) * Math.sqrt(hash(s.k, i, 22));
            const [sx, sy] = c.at(s.x + Math.cos(ang) * d, s.y + Math.sin(ang) * d);
            dot(g, sx, sy, 1, bolt0 ? '#bc84ff' : i % 2 ? '#e2eefa' : '#b4cce8', 0.8 * a);
          }
          if (bolt0) pool(c, s.x, s.y, 0.7, [[0, '#0a0a14'], [1, 'rgba(10,10,20,0)']], 0.6 * a);
        }
      }
      return;
    }
    case 'thunder': {
      // (storm clouds over the room; each strike's ring locking on where the hero stands, tightening as it charges; the crater it
      // leaves; its thunderclap rolling out)
      const cl = smooth((t - THUNDER.clouds[0]) / (THUNDER.clouds[1] - THUNDER.clouds[0])) * (1 - smooth((t - (THUNDER.end - 0.8)) / 0.8));
      floorTint(c, '#1c1038', 0.3 * cl);
      for (const s of lay?.spots ?? []) {
        const bt = s.t + (s.r ?? 0.6);
        const k = warnK(t, s.t, bt);
        if (k >= 0) {
          roundWarn(c, s.x, s.y, WS2_TUNE.thunder.reach, k);
          floorRing(c, s.x, s.y, WS2_TUNE.thunder.reach * (1.9 - 0.9 * k));
          stroke(g, '#bc84ff', 1.5, 0.4 + 0.5 * k);
          for (let i = 0; i < 5; i++) {
            const a0 = hash(Math.floor(c.t * 20), i, s.k) * TAU;
            const r = WS2_TUNE.thunder.reach * (1.9 - 0.9 * k);
            const [x0, y0] = c.at(s.x + Math.cos(a0) * r, s.y + Math.sin(a0) * r);
            const [x1, y1] = c.at(s.x + Math.cos(a0 + 0.4) * r, s.y + Math.sin(a0 + 0.4) * r);
            bolt(g, x0, y0, x1, y1, Math.floor(c.t * 20) + i, 0.6, ['#3a2070', '#bc84ff', '#f0e4ff'], 0.8, 0);
          }
        }
        const u = t - bt;
        if (u >= 0 && u < 2.4) {
          const a = 1 - clamp01((u - 1.4) / 1);
          pool(c, s.x, s.y, 0.95, [[0, '#08060e'], [0.6, 'rgba(12,8,20,0.8)'], [1, 'rgba(12,8,20,0)']], 0.75 * a);
          for (let i = 0; i < 7; i++) {
            const ang = (i / 7) * TAU + s.k;
            const [x0, y0] = c.at(s.x + Math.cos(ang) * 0.3, s.y + Math.sin(ang) * 0.3);
            const [x1, y1] = c.at(s.x + Math.cos(ang + 0.15) * 1.3, s.y + Math.sin(ang + 0.15) * 1.3);
            g.beginPath();
            g.moveTo(x0, y0);
            g.lineTo(x1, y1);
            stroke(g, u < 0.6 ? '#bc84ff' : '#2a1a40', 1, 0.8 * a);
          }
          const cu = u - THUNDER.clapAfter;
          if (cu > 0 && cu < THUNDER.clapLong) {
            const v = cu / THUNDER.clapLong;
            const r = 0.3 + THUNDER.clap * (1 - (1 - v) ** 2);
            floorRing(c, s.x, s.y, r);
            stroke(g, '#6c48c0', 5, 0.35 * (1 - v));
            floorRing(c, s.x, s.y, r);
            stroke(g, '#f0e4ff', 1.5, 0.9 * (1 - v));
          }
        }
      }
      return;
    }
    case 'avalanche': {
      // (red over the whole floor but its strip along the edge; the snow it leaves, thawing)
      const side = lay?.side ?? 1;
      const lx = -p.fy * side;
      const ly = p.fx * side;
      const cut = FINAL_PLACE.floor - WS2_TUNE.avalanche.safe;
      const out = AVAL.rumble[1];
      const k = warnK(t, AVAL.red[0], out);
      if (k >= 0) {
        // (the floor's round, cut short by the strip's edge)
        const R = FINAL_PLACE.floor;
        const half = Math.acos(cut / R);
        const base = Math.atan2(ly, lx);
        const pts: [number, number][] = [];
        for (let i = 0; i <= 40; i++) {
          const a = base + half + ((TAU - 2 * half) * i) / 40;
          pts.push([FINAL_PLACE.cx + Math.cos(a) * R, FINAL_PLACE.cy + Math.sin(a) * R]);
        }
        drawPolyWarn(g, c.at, pts, Math.round(170 * 14), (i) => {
          const a = hash(i, 1, 31) * TAU;
          const r = R * Math.sqrt(hash(i, 2, 32));
          const x = Math.cos(a) * r;
          const y = Math.sin(a) * r;
          return x * lx + y * ly >= cut ? null : [FINAL_PLACE.cx + x, FINAL_PLACE.cy + y];
        }, k, c.t);
      }
      const A = avalancheAt(t);
      if (A.front > 0) {
        // (the bed of snow it has laid, thawing after it is gone)
        const thaw = clamp01((t - (out + AVAL.cross + AVAL.stream + AVAL.tail)) / 1.4);
        const n = 90;
        for (let i = 0; i < n; i++) {
          const along = hash(i, 1, 41) * A.span;
          if (along > A.front) continue;
          const across = (hash(i, 2, 42) * 2 - 1) * FINAL_PLACE.floor;
          if (across * 1 >= cut) continue;
          const x = FINAL_PLACE.cx + p.fx * (along - FINAL_PLACE.floor) + lx * across;
          const y = FINAL_PLACE.cy + p.fy * (along - FINAL_PLACE.floor) + ly * across;
          if (Math.hypot(x - FINAL_PLACE.cx, y - FINAL_PLACE.cy) > FINAL_PLACE.floor) continue;
          pool(c, x, y, 0.7 + 0.5 * hash(i, 3, 43), [[0, '#e2f0f8'], [0.6, 'rgba(165,198,215,0.7)'], [1, 'rgba(106,138,162,0)']], 0.55 * (1 - thaw));
        }
      }
      return;
    }
    case 'contagion': {
      // (the sickness spreading patch by patch out of each place a spark landed: marked as it comes, sickened a moment, then burned
      // out and dark: safe)
      const G = lay?.grid;
      if (!G) return;
      const fade = 1 - clamp01((t - (CONTAGION.end - CONTAGION.fade)) / CONTAGION.fade);
      const was = g.globalAlpha;
      for (let k = 0; k < G.at.length; k++) {
        const at = G.at[k];
        if (!isFinite(at) || t < at - CONTAGION.mark) continue;
        const i = k % G.n;
        const j = Math.floor(k / G.n);
        const x = G.x0 + i * G.size;
        const y = G.y0 + j * G.size;
        const u = t - at;
        let col: string;
        let a: number;
        if (u < 0) {
          col = FLAME[2];
          a = 0.12 + 0.3 * (1 + u / CONTAGION.mark);
        } else if (u < CONTAGION.sick) {
          const f = u / CONTAGION.sick;
          col = f < 0.25 ? '#c4ffb0' : f < 0.6 ? '#62ff5a' : '#22a02c';
          a = 0.75;
        } else {
          // (burned out: scorched dark, fading as it cools)
          col = '#12140e';
          a = 0.45 * fade * (1 - clamp01((u - CONTAGION.sick) / 2.5));
          if (a <= 0.01) continue;
        }
        const [ax, ay] = c.at(x, y);
        const [bx, by] = c.at(x + G.size, y);
        const [cx2, cy2] = c.at(x + G.size, y + G.size);
        const [dx, dy] = c.at(x, y + G.size);
        g.globalAlpha = was * a;
        g.fillStyle = col;
        g.beginPath();
        g.moveTo(ax, ay);
        g.lineTo(bx, by);
        g.lineTo(cx2, cy2);
        g.lineTo(dx, dy);
        g.fill();
      }
      g.globalAlpha = was;
      return;
    }
    case 'scald': {
      // (the ice racing out round him, heating, flashing to steam: its reach marked till it flashes; the beams' lines marked before
      // they fire)
      const r = SCALD.r;
      const fz = clamp01((t - SCALD.freeze[0]) / (SCALD.freeze[1] - SCALD.freeze[0]));
      const ht = clamp01((t - SCALD.heat[0]) / (SCALD.heat[1] - SCALD.heat[0]));
      if (t < SCALD.flash && fz > 0) {
        const ri = r * (1 - (1 - fz) ** 2);
        pool(c, p.x, p.y, ri, [[0, ht > 0.5 ? '#ffb070' : '#e2f0f8'], [0.75, ht > 0.5 ? '#c0206a' : '#a5c6d7'], [1, 'rgba(52,72,92,0)']], 0.55 + 0.25 * ht);
      }
      const k = warnK(t, SCALD.heat[0], SCALD.flash);
      if (k >= 0) roundWarn(c, p.x, p.y, WS2_TUNE.scald.outer, k);
      if (t > SCALD.flash && t < SCALD.flash + SCALD.hang + SCALD.thin) {
        const a = 1 - clamp01((t - SCALD.flash - SCALD.hang) / SCALD.thin);
        pool(c, p.x, p.y, r + 0.2, [[0, 'rgba(242,220,204,0)'], [0.35, 'rgba(242,220,204,0.35)'], [0.8, '#a08884'], [1, 'rgba(90,68,70,0)']], 0.5 * a);
      }
      for (const kind of ['fire', 'frost'] as const) {
        const B = scaldBeamAt(t, kind);
        if (!B) continue;
        const ca = Math.cos(B.ang);
        const sa = Math.sin(B.ang);
        const bx = p.fx * ca + p.fy * sa;
        const by = p.fy * ca - p.fx * sa;
        if (B.on <= 0) {
          const kk = clamp01((t - SCALD.tele[0]) / (SCALD.beams[0] - SCALD.tele[0]));
          const L = toEdge(p.x, p.y, bx, by, 0);
          drawStripWarn(g, c.at, { x: p.x, y: p.y, fx: bx, fy: by, hand: 1 }, 0.4, L, -WS2_TUNE.scald.beam.half, WS2_TUNE.scald.beam.half, kk, c.t);
        } else {
          // (what it has swept: scorched black or rimed white behind it)
          const L = toEdge(p.x, p.y, bx, by, 0);
          const [x0, y0] = c.at(p.x + bx * 0.5, p.y + by * 0.5);
          const [x1, y1] = c.at(p.x + bx * L, p.y + by * L);
          g.beginPath();
          g.moveTo(x0, y0);
          g.lineTo(x1, y1);
          g.lineCap = 'round';
          stroke(g, kind === 'fire' ? '#2a0e0a' : '#a5c6d7', 6, 0.5);
        }
      }
      return;
    }
    case 'blight': {
      // (the rot creeping out from where the rune went in, along its fingers to the walls: the trees will burst up where it lies)
      const reach = clamp01((t - BLIGHT.spread[0]) / (BLIGHT.spread[1] - BLIGHT.spread[0]));
      const far = Math.max(...BLIGHT_FINGERS.map((f) => f.d[f.d.length - 1]));
      const D = reach * far;
      const dry = 1 - clamp01((t - (BLIGHT.end - BLIGHT.dry)) / BLIGHT.dry);
      const pre = t < BLIGHT.heave;
      const W = (x: number, y: number): [number, number] => {
        const q = own(p.x, p.y, p.fx, p.fy, x, y);
        return c.at(q.x, q.y) as [number, number];
      };
      // (its heart, where the rune went in)
      const ci = own(p.x, p.y, p.fx, p.fy, BLIGHT_AT[0], BLIGHT_AT[1]);
      pool(c, ci.x, ci.y, BLIGHT.core * clamp01(t / 0.3), [[0, '#161c0a'], [0.7, '#2e3a12'], [1, 'rgba(46,58,18,0)']], 0.85 * dry);
      g.lineCap = 'round';
      g.lineJoin = 'round';
      for (const pass of [0, 1, 2] as const) {
        for (const fg of BLIGHT_FINGERS) {
          if (fg.d[0] > D) continue;
          for (let i = 1; i < fg.pts.length; i++) {
            if (fg.d[i - 1] > D) break;
            const u = clamp01((D - fg.d[i - 1]) / Math.max(1e-6, fg.d[i] - fg.d[i - 1]));
            const a = fg.pts[i - 1];
            const b = fg.pts[i];
            const [x0, y0] = W(a[0], a[1]);
            const [x1, y1] = W(a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u);
            g.beginPath();
            g.moveTo(x0, y0);
            g.lineTo(x1, y1);
            const w = fg.w[i] * 0.42 * 2;
            if (pass === 0) stroke(g, pre ? FLAME[2] : '#3a1a2a', w + 3, pre ? 0.35 : 0.2 * dry);
            else if (pass === 1) stroke(g, '#1e260c', w, 0.9 * dry);
            else stroke(g, i % 2 ? '#52661e' : '#7e9a3a', Math.max(1, w * 0.25), 0.7 * dry);
          }
        }
      }
      return;
    }
    case 'fumes': {
      // (each vent cracked in the floor, venting its cloud: the poison lies over the floor in a round, its edge marked; as its spark
      // comes for it, marked again, hot; gone up, its smoke)
      for (const cl of lay?.spots ?? []) {
        const u = t - cl.t;
        if (u < -0.4) continue;
        const sp = clamp01(u / FUMES.spread);
        const R = (cl.r ?? 1.5) * (sp * sp * (3 - 2 * sp));
        const boom = cl.done ?? 99;
        if (t < boom) {
          pool(c, cl.x, cl.y, 0.35, [[0, '#e0d07a'], [1, 'rgba(118,104,28,0)']], 0.6);
          if (R > 0.05) {
            pool(c, cl.x, cl.y, R, [[0, 'rgba(196,214,70,0.8)'], [0.6, 'rgba(150,150,40,0.65)'], [0.9, 'rgba(98,86,24,0.4)'], [1, 'rgba(62,54,16,0)']], 0.95);
            floorRing(c, cl.x, cl.y, R * 0.92);
            stroke(g, '#b4a02c', 1, 0.45);
          }
          const k = warnK(t, boom - 0.9, boom);
          if (k >= 0) roundWarn(c, cl.x, cl.y, R, k);
        } else {
          const v = (t - boom) / FUMES.smoke;
          if (v < 1) pool(c, cl.x, cl.y, (cl.r ?? 1.5) * 0.9, [[0, '#1c1806'], [1, 'rgba(28,24,6,0)']], 0.7 * (1 - v));
        }
      }
      return;
    }
    case 'wildfire': {
      // (each spot marked as it comes, then burning; the web of lightning between them; marked all at once before it detonates;
      // scorched after)
      for (const s of lay?.spots ?? []) {
        const k = warnK(t, s.t - WILDFIRE.warn, s.t);
        if (k >= 0) roundWarn(c, s.x, s.y, WS2_TUNE.wildfire.reach, k);
        const kb = warnK(t, WILDFIRE.link, WILD_BOOM);
        if (kb >= 0 && t >= s.t) roundWarn(c, s.x, s.y, WS2_TUNE.wildfire.boom.reach, kb);
        if (t >= s.t) {
          const u = t - WILD_BOOM;
          const a = u < 0 ? 1 : 1 - clamp01(u / WILDFIRE.die);
          pool(c, s.x, s.y, u < 0 ? 0.6 : 1.0, [[0, u < 0 ? '#fff4c0' : '#3a1004'], [0.4, u < 0 ? '#ffb81c' : '#1a0804'], [1, 'rgba(58,16,4,0)']], 0.7 * a);
        }
      }
      return;
    }
    case 'frostbite': {
      // (the eye round him marked before the gale; the gale's rime over the floor, outside it, melting at the last; the eye's edge
      // hot gold)
      const E = WS2_TUNE.frostbite.eye;
      const on = smooth((t - FROSTBITE.gale[0]) / 0.4);
      const off = clamp01((t - FROSTBITE.gale[1]) / FROSTBITE.melt);
      if (t < FROSTBITE.gale[0] + 0.3) {
        floorRing(c, p.x, p.y, E);
        stroke(g, '#ffc040', 1.5, 0.4 + 0.5 * Math.abs(Math.sin(c.t * 12)));
      }
      floorTint(c, '#142a50', 0.3 * on * (1 - off));
      // (rime: frost dots laid thick over the floor outside the eye, growing as the gale blows)
      const grow = clamp01((t - FROSTBITE.gale[0]) / FROSTBITE.rime);
      const was = g.globalAlpha;
      const n = Math.round(900 * grow);
      for (let i = 0; i < n; i++) {
        const a = hash(i, 1, 51) * TAU;
        const r = E + (FINAL_PLACE.floor + 1) * Math.sqrt(hash(i, 2, 52));
        const x = p.x + Math.cos(a) * r;
        const y = p.y + Math.sin(a) * r;
        if (Math.hypot(x - FINAL_PLACE.cx, y - FINAL_PLACE.cy) > FINAL_PLACE.floor) continue;
        const [sx, sy] = c.at(x, y);
        const glint = (i * 7 + Math.floor(c.t * 4)) % 29 === 0;
        g.globalAlpha = was * (1 - off) * (glint ? 0.9 : 0.35);
        g.fillStyle = glint ? '#e4f4ff' : i % 5 === 0 ? PINK : i & 1 ? '#8cc0ec' : '#3a78b8';
        g.fillRect(Math.round(sx), Math.round(sy), 2, 1);
      }
      g.globalAlpha = was;
      if (on > 0 && off < 1) {
        // (the eye: bare floor, calm, its edge hot gold, the gale's wall swirling at it)
        pool(c, p.x, p.y, E, [[0, 'rgba(10,20,40,0)'], [0.85, 'rgba(10,20,40,0)'], [1, 'rgba(255,192,64,0.25)']], on * (1 - off));
        floorRing(c, p.x, p.y, E);
        stroke(g, '#ffc040', 2, 0.85 * on * (1 - off));
      }
      return;
    }
  }
}

export function meldStanding(c: Act1FxCtx, p: Peril): void {
  const id = meldOfPeril(p);
  const t = p.t;
  const lay = layOf(p);
  if (!lay) return;
  switch (id) {
    case 'eruption':
      // (each vent blowing: a blast of molten fire out of the floor, settling to a burning pool)
      for (const v of lay.spots) {
        const u = t - v.t;
        if (u < 0 || u > ERUPT.hold + ERUPT.cool) continue;
        const s = thing(c, `meteor${v.k % 4}`, meteorFrame(Math.max(0, u)));
        const [sx, sy] = c.at(v.x, v.y);
        if (s) c.stand(v.x + v.y, s, sx, sy, 1 - clamp01((u - ERUPT.hold - 0.6) / (ERUPT.cool - 0.6)));
      }
      return;
    case 'blight':
      // (the trees punching up through the rot, standing as walls, crumbling)
      for (const tr of lay.spots) {
        const u = t - tr.t;
        if (u < 0 || u > TREE_LIFE) continue;
        const s = thing(c, `tree${treeVariant(tr.k)}`, treeFrame(u));
        const [sx, sy] = c.at(tr.x, tr.y);
        if (s) c.stand(tr.x + tr.y, s, sx, sy);
      }
      return;
    case 'fumes':
      // (each cloud going up as its spark reaches it)
      for (const cl of lay.spots) {
        const u = t - (cl.done ?? 99);
        if (u < 0 || u > 0.6) continue;
        const s = thing(c, `meteor${cl.k % 4}`, meteorFrame(u));
        const [sx, sy] = c.at(cl.x, cl.y);
        if (s) c.stand(cl.x + cl.y, s, sx, sy);
      }
      return;
    case 'wildfire':
      // (each spot burning, then all of it going up at once)
      for (const s0 of lay.spots) {
        const u = t - s0.t;
        if (u < 0) continue;
        const ub = t - WILD_BOOM;
        if (ub > 0.6) continue;
        const s = thing(c, `meteor${s0.k % 4}`, ub >= 0 ? meteorFrame(ub) : meteorFrame(0.6 + u));
        const [sx, sy] = c.at(s0.x, s0.y);
        if (s) c.stand(s0.x + s0.y, s, sx, sy);
      }
      return;
  }
}

export function meldAir(c: Act1FxCtx, p: Peril): void {
  const g = c.g;
  if (!g) return;
  const id = meldOfPeril(p);
  const t = p.t;
  const lay = layOf(p);
  switch (id) {
    case 'eruption':
      // (each vent's column of fire at its blowing, its rocks thrown up and falling back)
      for (const v of lay?.spots ?? []) {
        const u = t - v.t;
        if (u < 0 || u > 1.0) continue;
        const [sx, sy] = c.at(v.x, v.y);
        if (u < ERUPT.burst + ERUPT.hold) {
          const k = 1 - u / (ERUPT.burst + ERUPT.hold);
          const H = 70 * Math.min(1, u / ERUPT.burst + 0.3);
          const wob = Math.sin(c.t * 40 + v.k) * 1.5;
          const gr = g.createLinearGradient(sx, sy, sx, sy - H);
          gr.addColorStop(0, '#fff0b0');
          gr.addColorStop(0.3, '#ffb43a');
          gr.addColorStop(0.7, '#c25a12');
          gr.addColorStop(1, 'rgba(255,79,138,0)');
          const was = g.globalAlpha;
          g.globalAlpha = was * (0.6 + 0.4 * k);
          g.fillStyle = gr;
          g.beginPath();
          g.moveTo(sx - 6, sy);
          g.quadraticCurveTo(sx - 9 + wob, sy - H * 0.5, sx - 2 + wob, sy - H);
          g.lineTo(sx + 2 + wob, sy - H);
          g.quadraticCurveTo(sx + 9 + wob, sy - H * 0.5, sx + 6, sy);
          g.fill();
          g.globalAlpha = was;
          c.spot(sx, sy - H * 0.3, 40, 0.8 * k);
        }
        for (let i = 0; i < ERUPT.rocks; i++) {
          const ang = hash(v.k, i, 61) * TAU;
          const sp = 18 + 22 * hash(v.k, i, 62);
          const vz = 90 + 60 * hash(v.k, i, 63);
          const z = vz * u - 0.5 * 360 * u * u;
          if (z < 0 && u > 0.1) continue;
          dot(g, sx + Math.cos(ang) * sp * u, sy + Math.sin(ang) * sp * u * 0.5 - Math.max(0, z) * 0.5, 1.4, i % 2 ? '#ffb43a' : '#4a1208', 0.9);
        }
      }
      return;
    case 'hailstorm':
      for (const s of lay?.spots ?? []) {
        const u = t - s.t;
        const [sx, sy] = c.at(s.x, s.y);
        if (s.r === 2) {
          // (a bolt out of the storm, a few frames)
          if (u >= 0 && u < 0.18) {
            bolt(g, sx + 6 * (hash(s.k, 1, 3) - 0.5), sy - 230, sx, sy, s.k * 13 + 5, 1.6, ['#6878b8', '#cad6ff', '#ffffff'], 1 - u / 0.18, 2);
            c.spot(sx, sy, 60, 1 - u / 0.18);
          }
          continue;
        }
        // (a stone falling onto its shadow, a streak above it; shattering)
        if (u >= -HAIL.fall && u < 0) {
          const h = (-u / HAIL.fall) * (HAIL.high / 2);
          const r = 2 + (s.k % 3) * 0.7;
          g.beginPath();
          g.moveTo(sx, sy - h - 12);
          g.lineTo(sx, sy - h);
          stroke(g, '#cad6ff', 1, 0.35);
          const was = g.globalAlpha;
          g.fillStyle = '#4a6a9a';
          g.beginPath();
          g.moveTo(sx, sy - h - r - 1);
          g.lineTo(sx + r + 1, sy - h);
          g.lineTo(sx, sy - h + r + 1);
          g.lineTo(sx - r - 1, sy - h);
          g.fill();
          g.fillStyle = '#e2eefa';
          g.beginPath();
          g.moveTo(sx, sy - h - r);
          g.lineTo(sx + r, sy - h);
          g.lineTo(sx, sy - h + r * 0.5);
          g.lineTo(sx - r * 0.7, sy - h);
          g.fill();
          g.globalAlpha = was;
        } else if (u >= 0 && u < 0.25) {
          const k = u / 0.25;
          for (let i = 0; i < 6; i++) {
            const ang = (i / 6) * TAU + s.k;
            const d = 3 + 9 * k;
            dot(g, sx + Math.cos(ang) * d, sy + Math.sin(ang) * d * 0.5 - 6 * Math.sin(Math.PI * k), 1, i % 2 ? '#ffffff' : '#b4cce8', 1 - k);
          }
        }
      }
      return;
    case 'thunder':
      // (ONE GREAT BOLT, a pillar of violet-white lightning, hammering down on each ring)
      for (const s of lay?.spots ?? []) {
        const u = t - (s.t + (s.r ?? 0.6));
        if (u < 0 || u > THUNDER.bolt) continue;
        const k = 1 - u / THUNDER.bolt;
        const [sx, sy] = c.at(s.x, s.y);
        bolt(g, sx + 10 * (hash(s.k, 2, 5) - 0.5), sy - 260, sx, sy, s.k * 17 + Math.floor(u * 30), 3.2, ['#6c48c0', '#bc84ff', '#ffffff'], k, 3);
        haze(g, sx, sy, 22, '#f0e4ff', 0.8 * k);
        c.spot(sx, sy, 80, k);
      }
      return;
    case 'avalanche': {
      // (THE TORRENT: snow tearing across the room from the far side behind him, its front billowing, its boulders tumbling in it)
      const A = avalancheAt(t);
      if (A.front <= 0 || A.tail >= A.span) return;
      const side = lay?.side ?? 1;
      const lx = -p.fy * side;
      const ly = p.fx * side;
      const cut = FINAL_PLACE.floor - WS2_TUNE.avalanche.safe;
      const at = (along: number, across: number): [number, number] => c.at(FINAL_PLACE.cx + p.fx * (along - FINAL_PLACE.floor) + lx * across, FINAL_PLACE.cy + p.fy * (along - FINAL_PLACE.floor) + ly * across) as [number, number];
      const inFloor = (along: number, across: number): boolean => Math.hypot(along - FINAL_PLACE.floor, across) <= FINAL_PLACE.floor + 0.3;
      const was = g.globalAlpha;
      // (its body: powder, thick and churning, thrown up higher toward its front)
      for (let i = 0; i < 150; i++) {
        const across = -FINAL_PLACE.floor + (cut + FINAL_PLACE.floor) * hash(i, 1, 71);
        const along = A.tail + (A.front - A.tail) * ((hash(i, 2, 72) + t * 1.7) % 1);
        if (!inFloor(along, across)) continue;
        const nearFront = 1 - clamp01((A.front - along) / 2.2);
        const [sx, sy] = at(along, across);
        const r = 8 + 8 * hash(i, 3, 73) + 8 * nearFront;
        haze(g, sx, sy - 4 - 12 * nearFront * hash(i, 4, 74), r, i % 3 === 0 ? '#a5c6d7' : '#f2f8fc', 0.5 + 0.35 * nearFront);
      }
      // (clods of packed snow tumbling in it, each lit on top, in shadow under)
      for (let i = 0; i < 110; i++) {
        const across = -FINAL_PLACE.floor + (cut + FINAL_PLACE.floor) * hash(i, 11, 81);
        const along = A.tail + (A.front - A.tail) * ((hash(i, 12, 82) + t * 1.9) % 1);
        if (!inFloor(along, across)) continue;
        const [sx, sy] = at(along, across);
        const r = 1.5 + 2 * hash(i, 13, 83);
        const lift = 3 + 8 * Math.abs(Math.sin(t * 7 + i));
        g.globalAlpha = was;
        g.fillStyle = '#6a8aa2';
        g.fillRect(Math.round(sx - r), Math.round(sy - lift - r + 1), Math.round(2 * r), Math.round(2 * r));
        g.fillStyle = i % 2 ? '#e2f0f8' : '#ffffff';
        g.fillRect(Math.round(sx - r), Math.round(sy - lift - r), Math.round(2 * r), Math.round(r + 0.5));
      }
      for (let i = 0; i < AVAL.boulders; i++) {
        const across = -FINAL_PLACE.floor + (cut + FINAL_PLACE.floor) * hash(i, 5, 75);
        const along = A.tail + (A.front - A.tail) * ((hash(i, 6, 76) + t * 1.3) % 1);
        if (!inFloor(along, across)) continue;
        const [sx, sy] = at(along, across);
        const r = 3 + 3 * hash(i, 7, 77);
        const sp = t * 9 + i;
        g.globalAlpha = was;
        g.fillStyle = '#34485c';
        g.beginPath();
        for (let q = 0; q < 6; q++) {
          const a = sp + (q / 6) * TAU;
          const rr = r * (0.75 + 0.35 * hash(i, q, 78));
          if (q === 0) g.moveTo(sx + Math.cos(a) * rr, sy - 6 + Math.sin(a) * rr);
          else g.lineTo(sx + Math.cos(a) * rr, sy - 6 + Math.sin(a) * rr);
        }
        g.fill();
        g.fillStyle = '#6a8aa2';
        g.fillRect(Math.round(sx - 1), Math.round(sy - 7 - r * 0.4), 2, 1);
      }
      // (the front: a wall of powder thrown up, bright)
      if (A.front < A.span) for (let i = 0; i < 40; i++) {
        const across = -FINAL_PLACE.floor + (cut + FINAL_PLACE.floor) * (i / 39);
        const along = A.front - 0.2 * hash(i, 8, 79);
        if (!inFloor(along, across)) continue;
        const [sx, sy] = at(along, across);
        haze(g, sx, sy - 10, 12 + 6 * hash(i, 9, 80), '#ffffff', 0.55);
      }
      g.globalAlpha = was;
      return;
    }
    case 'contagion': {
      // (the sparks the rune splits into, leaping out to where the sickness starts; each patch's arc as it is passed on)
      const G = lay?.grid;
      if (!G) return;
      const [hx, hy] = c.at(p.x, p.y);
      for (const s of lay?.spots ?? []) {
        const u = t - (s.t - 0.25);
        if (u < 0 || u > 0.35) continue;
        const [tx, ty] = c.at(s.x, s.y);
        const k = Math.min(1, u / 0.25);
        bolt(g, hx, hy - 20, hx + (tx - hx) * k, hy - 20 + (ty - hy + 20) * k, s.k * 7 + Math.floor(u * 30), 1.2, ['#105a1a', '#62ff5a', '#f4fff0'], 1, 1);
      }
      for (let k = 0; k < G.at.length; k++) {
        const u = t - G.at[k];
        if (u < 0 || u > 0.12 || G.from[k] < 0) continue;
        if ((k * 7) % 3) continue;
        const f = G.from[k];
        const [ax, ay] = c.at(G.x0 + ((f % G.n) + 0.5) * G.size, G.y0 + (Math.floor(f / G.n) + 0.5) * G.size);
        const [bx, by] = c.at(G.x0 + ((k % G.n) + 0.5) * G.size, G.y0 + (Math.floor(k / G.n) + 0.5) * G.size);
        bolt(g, ax, ay - 3, bx, by - 3, k, 0.7, ['#105a1a', '#62ff5a', '#f4fff0'], 1 - u / 0.12, 0);
      }
      return;
    }
    case 'scald': {
      // (the steam boiling up round him once it flashes; the two beams, fire and cold, from him to the wall, sweeping round)
      if (t > SCALD.flash && t < SCALD.flash + SCALD.hang + SCALD.thin) {
        const a = (1 - clamp01((t - SCALD.flash - SCALD.hang) / SCALD.thin)) * clamp01((t - SCALD.flash) / 0.2);
        for (let i = 0; i < 40; i++) {
          const ang = hash(i, 1, 81) * TAU + t * 0.4;
          const r = WS2_TUNE.scald.inner + (SCALD.r - WS2_TUNE.scald.inner) * hash(i, 2, 82);
          const up = ((t * 0.6 + hash(i, 3, 83)) % 1);
          const [sx, sy] = c.at(p.x + Math.cos(ang) * r, p.y + Math.sin(ang) * r);
          haze(g, sx, sy - 6 - up * 34, 10 + 10 * up, i % 4 === 0 ? '#f2dccc' : '#fff4ec', 0.7 * a * (1 - up));
        }
        if (t - SCALD.flash < 0.35) {
          const b = (t - SCALD.flash) / 0.35;
          const [sx, sy] = c.at(p.x, p.y);
          haze(g, sx, sy - 10, 30 + 40 * b, '#ffffff', 0.7 * (1 - b));
        }
      }
      for (const kind of ['fire', 'frost'] as const) {
        const B = scaldBeamAt(t, kind);
        if (!B || B.on <= 0) continue;
        const ca = Math.cos(B.ang);
        const sa = Math.sin(B.ang);
        const bx = p.fx * ca + p.fy * sa;
        const by = p.fy * ca - p.fx * sa;
        const L = toEdge(p.x, p.y, bx, by, 0);
        const [x0, y0] = c.at(p.x + bx * 0.4, p.y + by * 0.4);
        const [x1, y1] = c.at(p.x + bx * L, p.y + by * L);
        const z0 = 22;
        const flick = 0.85 + 0.15 * Math.sin(c.t * 50 + (kind === 'fire' ? 0 : 2));
        const cols = kind === 'fire' ? ['#e06a10', '#ffb43a', '#fff0b0'] : ['#3a78b8', '#a5c6d7', '#ffffff'];
        g.lineCap = 'round';
        for (const [w, col, al] of [[12, cols[0], 0.35], [6, cols[1], 0.85], [2.5, cols[2], 1]] as const) {
          g.beginPath();
          g.moveTo(x0, y0 - z0);
          g.lineTo(x1, y1 - 4);
          stroke(g, col, w * B.on, al * flick);
        }
        haze(g, x1, y1 - 4, 14, cols[1], 0.7);
        for (let i = 0; i < 8; i++) {
          const u = (i / 8 + c.t * 2) % 1;
          dot(g, x0 + (x1 - x0) * u + (hash(i, Math.floor(c.t * 20), 84) - 0.5) * 6, y0 - z0 + (y1 - 4 - y0 + z0) * u + (hash(i, Math.floor(c.t * 20), 85) - 0.5) * 6, 1, kind === 'fire' ? '#fff0b0' : '#ffffff', 0.9);
        }
        c.spot((x0 + x1) / 2, (y0 + y1) / 2, 60, 0.6);
      }
      return;
    }
    case 'fumes': {
      // (the clouds billowing over the floor; the sparks he flings into them in the order they came; each going up)
      const [hx, hy] = c.at(p.x, p.y);
      for (const cl of lay?.spots ?? []) {
        const u = t - cl.t;
        const boom = cl.done ?? 99;
        if (u > 0 && t < boom) {
          const sp = clamp01(u / FUMES.spread);
          const R = (cl.r ?? 1.5) * sp;
          for (let i = 0; i < 9; i++) {
            const ang = hash(cl.k, i, 91) * TAU + t * 0.3;
            const r = R * 0.7 * Math.sqrt(hash(cl.k, i, 92));
            const [sx, sy] = c.at(cl.x + Math.cos(ang) * r, cl.y + Math.sin(ang) * r);
            const up = (t * 0.4 + hash(cl.k, i, 93)) % 1;
            haze(g, sx, sy - 6 - up * 16, 12 + 10 * sp, i % 3 === 0 ? '#e0d07a' : i % 3 === 1 ? '#b8cc4a' : '#8a7e22', 0.55 * sp * (1 - up * 0.6));
          }
        }
        const fl = t - (boom - FUMES.fly);
        if (fl >= 0 && fl < FUMES.fly) {
          const k = fl / FUMES.fly;
          const [tx, ty] = c.at(cl.x, cl.y);
          const x = hx + (tx - hx) * k;
          const y = hy - 30 + (ty - hy + 30) * k - 25 * Math.sin(Math.PI * k);
          dot(g, x, y, 2, '#fff0b0', 1);
          haze(g, x, y, 8, '#ffb43a', 0.8);
          for (let j = 1; j < 5; j++) dot(g, x - (tx - hx) * 0.03 * j, y + 2 * j, 1, '#ffb43a', 0.6 / j);
          c.spot(x, y, 20, 0.6);
        }
        const ub = t - boom;
        if (ub >= 0 && ub < 0.4) {
          const [sx, sy] = c.at(cl.x, cl.y);
          haze(g, sx, sy - 12, 20 + 40 * (ub / 0.4), '#ffb43a', 0.8 * (1 - ub / 0.4));
          c.spot(sx, sy, 70, 1 - ub / 0.4);
        }
      }
      return;
    }
    case 'wildfire': {
      // (each spot's pillar of fire with lightning in it; the web of arcs between the burning; all of it going up at once)
      const spots = lay?.spots ?? [];
      const ub = t - WILD_BOOM;
      for (const s of spots) {
        if (t < s.t || ub > 0.4) continue;
        const [sx, sy] = c.at(s.x, s.y);
        const u = t - s.t;
        const H = (ub >= 0 ? 90 : 40 + 8 * Math.sin(c.t * 9 + s.k)) * Math.min(1, u / 0.15 + 0.2);
        const gr = g.createLinearGradient(sx, sy, sx, sy - H);
        gr.addColorStop(0, '#fff4c0');
        gr.addColorStop(0.35, '#ffb81c');
        gr.addColorStop(0.75, '#e06a10');
        gr.addColorStop(1, 'rgba(138,42,6,0)');
        const was = g.globalAlpha;
        g.globalAlpha = was * (ub >= 0 ? 1 - ub / 0.4 : 0.85);
        g.fillStyle = gr;
        g.beginPath();
        g.ellipse(sx, sy - H / 2, 5 + (ub >= 0 ? 6 : 0), H / 2, 0, 0, TAU);
        g.fill();
        g.globalAlpha = was;
        if ((Math.floor(c.t * 12) + s.k) % 3 === 0) bolt(g, sx, sy - H * 0.8, sx + 3, sy - 4, s.k * 3 + Math.floor(c.t * 12), 0.6, ['#8a2a06', '#ffb81c', '#ffffff'], 0.9, 0);
        c.spot(sx, sy - 10, 30, 0.6);
      }
      if (ub < 0) for (const [i, j] of lay?.links ?? []) {
        const A = spots[i];
        const B = spots[j];
        if (t < Math.max(A.t, B.t)) continue;
        const [ax, ay] = c.at(A.x, A.y);
        const [bx, by] = c.at(B.x, B.y);
        bolt(g, ax, ay - 14, bx, by - 14, i * 31 + j + Math.floor(c.t * 15), 0.9, ['#8a2a06', '#ffb81c', '#fff4c0'], 0.85, 1);
      }
      if (ub >= 0 && ub < 0.5) {
        const [sx, sy] = c.at(p.x, p.y);
        haze(g, sx, sy, 200, '#fff4c0', 0.35 * (1 - ub / 0.5));
      }
      return;
    }
    case 'frostbite': {
      // (THE GALE: a freezing venom wind streaming out from him to the walls, frost and his pink venom in it)
      const on = smooth((t - FROSTBITE.gale[0]) / 0.4) * (1 - smooth((t - FROSTBITE.gale[1]) / 0.4));
      if (on <= 0) return;
      const E = WS2_TUNE.frostbite.eye;
      const was = g.globalAlpha;
      g.lineCap = 'round';
      for (let i = 0; i < 150; i++) {
        const ang = hash(i, 1, 101) * TAU + Math.sin(t * 2 + i) * 0.05;
        const v = (hash(i, 2, 102) + t * (0.9 + 0.5 * hash(i, 3, 103))) % 1;
        const r = E + (FINAL_PLACE.floor + 1 - E) * v;
        const x = p.x + Math.cos(ang) * r;
        const y = p.y + Math.sin(ang) * r;
        if (Math.hypot(x - FINAL_PLACE.cx, y - FINAL_PLACE.cy) > FINAL_PLACE.floor + 0.5) continue;
        const [sx, sy] = c.at(x, y);
        const [ex, ey] = c.at(x + Math.cos(ang) * 0.6, y + Math.sin(ang) * 0.6);
        const z = 6 + 16 * hash(i, 4, 104);
        g.globalAlpha = was * on * (0.35 + 0.4 * (1 - v));
        g.strokeStyle = i % 7 === 0 ? PINK : i % 3 === 0 ? '#e4f4ff' : '#8cc0ec';
        g.lineWidth = i % 7 === 0 ? 2 : 1;
        g.beginPath();
        g.moveTo(sx, sy - z);
        g.lineTo(ex, ey - z);
        g.stroke();
      }
      g.globalAlpha = was;
      // (the gale's wall swirling at the eye's edge)
      for (let i = 0; i < 24; i++) {
        const ang = (i / 24) * TAU + t * 3;
        const [sx, sy] = c.at(p.x + Math.cos(ang) * E, p.y + Math.sin(ang) * E);
        haze(g, sx, sy - 10, 7, '#e4f4ff', 0.3 * on);
      }
      return;
    }
  }
}
