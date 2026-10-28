// THE SKILL TREES' PAGE (not in the game: behind TALENTS in game/talents.ts, off, until he has seen
// pictures and said yes). A fourth page of the inventory, TALENTS, beside GEAR, ATTACKS and STATS:
// the class's tree in its own shape (game/talents.ts says what each talent does and where it sits),
// read from left to right, with the points to spend over it. A talent pressed is read on a card
// over the game's half, against the panel, as a piece of gear is; TAKE spends a point on it.
//   - a talent taken is lit: the friend's cyan round it, its rune in its path's colour on a ground
//     of that colour, and the line that led to it lit too;
//   - one that can be taken now has its path's colour round it and a ring that pulses;
//   - one whose way is open but with no point to spend, a quiet rim;
//   - one whose way is not open yet, dark, its rune faint.
// A BIG talent (a big change to how something works) is the larger stone, with a second rim.

import { GLYPH, WORD_COLOR, WORD_GLOW } from '../art/icons';
import { P } from '../art/palette';
import { LINE_H, drawText, textWidth, wrapText } from '../engine/font';
import { WORDS } from '../game/defs';
import type { Game } from '../game/game';
import { TREES, nextTalentLevel, talentName, talentOpen, talentText, talentWord } from '../game/talents';
import type { TalentDef, TalentTree } from '../game/talents';
import type { WordId } from '../game/types';
import { THEME, inside } from './ui';
import type { Rect, Ui } from './ui';

/** What the page keeps between frames (kept in the inventory's own state). */
export interface TalentUi {
  /** The talent being read. */
  sel: string | null;
  /** The card as it was drawn last frame, and its TAKE or UNDO (a press on it is answered next frame). */
  card: { r: Rect; take: Rect | null; undo?: Rect | null } | null;
  /** A talent just taken, and how long ago: it flares. */
  flash: { id: string; t: number } | null;
}

export function newTalentUi(): TalentUi {
  return { sel: null, card: null, flash: null };
}

/** How big a talent's stone is: a step, and a big one. */
export const STONE = 11;
export const BIG_STONE = 15;
/** The card's width. */
const CARD = 136;

// ---- the runes on the stones ------------------------------------------------------------------
// 'X' the colour, 'o' the glow. The paths' runes are the words' where a word is the thing (the
// elements, the eye's sight, the wind's arrows, iron's shield, the quake's weight), three of the
// arrow's own, and the technique's blade.
const ARROW: readonly string[] = ['....X..', '.....X.', 'XXXXXXo', '.....X.', '....X..'];
const JAWS: readonly string[] = ['X.X.X.X', 'XXXXXXX', 'X.....X', '.X.o.X.', '..XXX..'];
const SPLIT: readonly string[] = ['.....X', '....X.', 'XXXo..', '....X.', '.....X'];
const BLADE: readonly string[] = ['.X.....', '.X.....', 'XXXXXXo', '.X.....', '.X.....'];
// (the new classes' paths, 28 Oct 2026: the man's sigil, the demon's horned head, the pact's claw; a vial, the Golem's head, a
// gear, a coin; speed's chevrons, power's impact, a fist thrown back)
const SIGIL: readonly string[] = ['..XXX..', '.X...X.', 'X..o..X', '.X...X.', '..XXX..'];
const HORNS: readonly string[] = ['X.....X', 'XX...XX', '.XXXXX.', '.XoXoX.', '..XXX..'];
const CLAW: readonly string[] = ['X.X.X..', 'X.X.X..', 'XXXXX.X', '.XXXXo.', '..XXX..'];
const VIAL: readonly string[] = ['..XXX..', '...X...', '..XoX..', '.XoooX.', '.XXXXX.'];
const GOLEM: readonly string[] = ['.XXXXX.', 'XoX.XoX', 'XXXXXXX', 'X.XXX.X', 'X.X.X.X'];
const GEAR: readonly string[] = ['.X.X.X.', 'XXXXXXX', '.XXoXX.', 'XXXXXXX', '.X.X.X.'];
const COIN: readonly string[] = ['..XXX..', '.XoooX.', '.XoXoX.', '.XoooX.', '..XXX..'];
const QUICK: readonly string[] = ['X..X...', '.X..X..', '..X..Xo', '.X..X..', 'X..X...'];
const IMPACT: readonly string[] = ['X..X..X', '.X.X.X.', '..XoX..', '.X.X.X.', 'X..X..X'];
const KNUCKLE: readonly string[] = ['..X....', '.XX....', 'XXXXXXo', '.XX...X', '..X..X.'];
/** A rune and its two colours. */
interface Rune {
  rows: readonly string[];
  color: string;
  glow: string;
}
function wordRune(w: WordId): Rune {
  return { rows: GLYPH[w], color: WORD_COLOR[w], glow: WORD_GLOW[w] };
}
/** Each path's rune, by the path's id. */
const PATH_RUNE: Record<string, (color: string) => Rune> = {
  fire: () => wordRune('fire'),
  lightning: () => wordRune('lightning'),
  frost: () => wordRune('frost'),
  wind: () => wordRune('swift'),
  eye: () => wordRune('precise'),
  shaft: (c) => ({ rows: ARROW, color: c, glow: P.white }),
  traps: (c) => ({ rows: JAWS, color: c, glow: P.white }),
  arrows: (c) => ({ rows: SPLIT, color: c, glow: P.white }),
  technique: (c) => ({ rows: BLADE, color: c, glow: P.white }),
  iron: () => wordRune('guarding'),
  cross: () => wordRune('heavy'),
  man: (c) => ({ rows: SIGIL, color: c, glow: P.white }),
  demon: (c) => ({ rows: HORNS, color: c, glow: P.white }),
  pact: (c) => ({ rows: CLAW, color: c, glow: P.white }),
  vials: (c) => ({ rows: VIAL, color: c, glow: P.white }),
  golem: (c) => ({ rows: GOLEM, color: c, glow: P.white }),
  works: (c) => ({ rows: GEAR, color: c, glow: P.white }),
  gold: (c) => ({ rows: COIN, color: c, glow: P.white }),
  speed: (c) => ({ rows: QUICK, color: c, glow: P.white }),
  power: (c) => ({ rows: IMPACT, color: c, glow: P.white }),
  counter: (c) => ({ rows: KNUCKLE, color: c, glow: P.white }),
};
/** The rune a talent's stone carries: its word's, if it works with one; else its path's. */
function runeOf(tree: TalentTree, t: TalentDef): Rune {
  const word = talentWord(t);
  if (word) return wordRune(word);
  const path = tree.paths.find((p) => p.id === t.path);
  const color = path ? path.color : THEME.text;
  return (PATH_RUNE[t.path] ?? ((c: string) => ({ rows: ARROW, color: c, glow: P.white })))(color);
}
function drawRune(g: CanvasRenderingContext2D, rune: Rune, cx: number, cy: number, alpha: number): void {
  const h = rune.rows.length;
  const w = rune.rows[0].length;
  const x0 = Math.round(cx - w / 2);
  const y0 = Math.round(cy - h / 2);
  g.globalAlpha = alpha;
  for (let y = 0; y < h; y++) {
    const row = rune.rows[y];
    for (let x = 0; x < w; x++) {
      const c = row[x];
      if (c === '.') continue;
      g.fillStyle = c === 'o' ? rune.glow : rune.color;
      g.fillRect(x0 + x, y0 + y, 1, 1);
    }
  }
  g.globalAlpha = 1;
}

/** A line one game pixel thick, pixel by pixel (the art has no soft lines). */
function line(g: CanvasRenderingContext2D, x0: number, y0: number, x1: number, y1: number, color: string, alpha = 1): void {
  g.globalAlpha = alpha;
  g.fillStyle = color;
  let x = Math.round(x0);
  let y = Math.round(y0);
  const X = Math.round(x1);
  const Y = Math.round(y1);
  const dx = Math.abs(X - x);
  const dy = -Math.abs(Y - y);
  const sx = x < X ? 1 : -1;
  const sy = y < Y ? 1 : -1;
  let err = dx + dy;
  for (let n = 0; n < 2000; n++) {
    g.fillRect(x, y, 1, 1);
    if (x === X && y === Y) break;
    const e2 = 2 * err;
    if (e2 >= dy) {
      err += dy;
      x += sx;
    }
    if (e2 <= dx) {
      err += dx;
      y += sy;
    }
  }
  g.globalAlpha = 1;
}

// ---- the new classes' figures (28 Oct 2026) ---------------------------------------------------------
/**
 * A TALON along talents `ns`: wide at the first, narrowing to a point past the last, hooking down by `hook` (radians, over
 * the length past the last); filled faint, its edges a little less so.
 */
function drawTalon(g: CanvasRenderingContext2D, ns: readonly TalentAt[], width: number, hook: number, color: string): void {
  if (ns.length < 2) return;
  const pts = ns.map((n) => [n.cx, n.cy] as [number, number]);
  // (past the last: on the way it was going, turning down, a few steps)
  const a = pts[pts.length - 2];
  const b = pts[pts.length - 1];
  let ang = Math.atan2(b[1] - a[1], b[0] - a[0]);
  const step = Math.hypot(b[0] - a[0], b[1] - a[1]) * 0.12;
  let [x, y] = b;
  for (let i = 0; i < 4; i++) {
    ang += hook / 4;
    x += Math.cos(ang) * step;
    y += Math.sin(ang) * step;
    pts.push([x, y]);
  }
  // (its length so far at each point: its width goes down along it to nothing at the point)
  const along: number[] = [0];
  for (let i = 1; i < pts.length; i++) along.push(along[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
  const total = along[along.length - 1] || 1;
  const left: [number, number][] = [];
  const right: [number, number][] = [];
  for (let i = 0; i < pts.length; i++) {
    const p = pts[Math.max(0, i - 1)];
    const q = pts[Math.min(pts.length - 1, i + 1)];
    const l = Math.hypot(q[0] - p[0], q[1] - p[1]) || 1;
    const nx = -(q[1] - p[1]) / l;
    const ny = (q[0] - p[0]) / l;
    const w = width * Math.pow(1 - along[i] / total, 0.8);
    left.push([pts[i][0] + nx * w, pts[i][1] + ny * w]);
    right.push([pts[i][0] - nx * w, pts[i][1] - ny * w]);
  }
  g.globalAlpha = 0.1;
  g.fillStyle = color;
  g.beginPath();
  g.moveTo(left[0][0] + 0.5, left[0][1] + 0.5);
  for (const p of left.slice(1)) g.lineTo(p[0] + 0.5, p[1] + 0.5);
  for (const p of right.slice().reverse()) g.lineTo(p[0] + 0.5, p[1] + 0.5);
  g.closePath();
  g.fill();
  g.globalAlpha = 1;
  for (const side of [left, right]) for (let i = 1; i < side.length; i++) line(g, side[i - 1][0], side[i - 1][1], side[i][0], side[i][1], color, 0.3);
}

/** A GEAR: its ring through the talents `ring` round the hub talent, a tooth out at each, `spokes` spokes, the hub's boss. */
function drawGear(g: CanvasRenderingContext2D, hub: TalentAt, ring: readonly TalentAt[], spokes: number, color: string): void {
  const r = ring.reduce((s, n) => s + Math.hypot(n.cx - hub.cx, n.cy - hub.cy), 0) / ring.length;
  const band = Math.max(4, Math.round(r * 0.13));
  // (the ring: a band either side of the talents' circle)
  g.globalAlpha = 0.09;
  g.fillStyle = color;
  g.beginPath();
  g.arc(hub.cx + 0.5, hub.cy + 0.5, r + band, 0, Math.PI * 2);
  g.arc(hub.cx + 0.5, hub.cy + 0.5, r - band, 0, Math.PI * 2, true);
  g.fill();
  // (a tooth out at each talent of the ring)
  for (const n of ring) {
    const a = Math.atan2(n.cy - hub.cy, n.cx - hub.cx);
    const ux = Math.cos(a);
    const uy = Math.sin(a);
    const half = band * 0.9;
    const r0 = r + band;
    const r1 = r + band * 2.1;
    g.beginPath();
    g.moveTo(hub.cx + ux * r0 - uy * half * 1.2 + 0.5, hub.cy + uy * r0 + ux * half * 1.2 + 0.5);
    g.lineTo(hub.cx + ux * r1 - uy * half * 0.8 + 0.5, hub.cy + uy * r1 + ux * half * 0.8 + 0.5);
    g.lineTo(hub.cx + ux * r1 + uy * half * 0.8 + 0.5, hub.cy + uy * r1 - ux * half * 0.8 + 0.5);
    g.lineTo(hub.cx + ux * r0 + uy * half * 1.2 + 0.5, hub.cy + uy * r0 - ux * half * 1.2 + 0.5);
    g.closePath();
    g.fill();
  }
  // (the boss round the hub)
  g.beginPath();
  g.arc(hub.cx + 0.5, hub.cy + 0.5, band * 1.8, 0, Math.PI * 2);
  g.fill();
  g.globalAlpha = 1;
  // (its edges, and the spokes: straight up, down, left and right for four)
  const edge = (rad: number, alpha: number): void => {
    let px = hub.cx + rad;
    let py = hub.cy;
    for (let i = 1; i <= 64; i++) {
      const a = (i / 64) * Math.PI * 2;
      const qx = hub.cx + Math.cos(a) * rad;
      const qy = hub.cy + Math.sin(a) * rad;
      line(g, px, py, qx, qy, color, alpha);
      px = qx;
      py = qy;
    }
  };
  edge(r + band, 0.3);
  edge(r - band, 0.22);
  for (let i = 0; i < spokes; i++) {
    const a = (i / spokes) * Math.PI * 2;
    for (const o of [-1.5, 1.5]) {
      const nx = -Math.sin(a) * o;
      const ny = Math.cos(a) * o;
      line(g, hub.cx + Math.cos(a) * band * 1.8 + nx, hub.cy + Math.sin(a) * band * 1.8 + ny, hub.cx + Math.cos(a) * (r - band) + nx, hub.cy + Math.sin(a) * (r - band) + ny, color, 0.22);
    }
  }
}

/** A ROUNDED BLOCK round the talents `ns`, `pad` pixels out from their middles (the fist's fingers, its back, its thumb). */
function drawRound(g: CanvasRenderingContext2D, ns: readonly TalentAt[], pad: number, color: string): void {
  const x0 = Math.min(...ns.map((n) => n.cx)) - pad;
  const x1 = Math.max(...ns.map((n) => n.cx)) + pad;
  const y0 = Math.min(...ns.map((n) => n.cy)) - pad;
  const y1 = Math.max(...ns.map((n) => n.cy)) + pad;
  const rad = Math.min(pad, (x1 - x0) / 2, (y1 - y0) / 2);
  g.globalAlpha = 0.1;
  g.fillStyle = color;
  g.beginPath();
  g.moveTo(x0 + rad, y0);
  g.lineTo(x1 - rad, y0);
  g.arc(x1 - rad, y0 + rad, rad, -Math.PI / 2, 0);
  g.lineTo(x1, y1 - rad);
  g.arc(x1 - rad, y1 - rad, rad, 0, Math.PI / 2);
  g.lineTo(x0 + rad, y1);
  g.arc(x0 + rad, y1 - rad, rad, Math.PI / 2, Math.PI);
  g.lineTo(x0, y0 + rad);
  g.arc(x0 + rad, y0 + rad, rad, Math.PI, Math.PI * 1.5);
  g.closePath();
  g.fill();
  g.globalAlpha = 1;
  // (its edges: the straight runs, and the corners stepped round)
  line(g, x0 + rad, y0, x1 - rad, y0, color, 0.3);
  line(g, x0 + rad, y1, x1 - rad, y1, color, 0.3);
  line(g, x0, y0 + rad, x0, y1 - rad, color, 0.3);
  line(g, x1, y0 + rad, x1, y1 - rad, color, 0.3);
  for (const [cx, cy, a0] of [[x1 - rad, y0 + rad, -Math.PI / 2], [x1 - rad, y1 - rad, 0], [x0 + rad, y1 - rad, Math.PI / 2], [x0 + rad, y0 + rad, Math.PI]] as const) {
    for (let i = 0; i < 6; i++) {
      const a = a0 + (i / 6) * (Math.PI / 2);
      const b = a0 + ((i + 1) / 6) * (Math.PI / 2);
      line(g, cx + Math.cos(a) * rad, cy + Math.sin(a) * rad, cx + Math.cos(b) * rad, cy + Math.sin(b) * rad, color, 0.3);
    }
  }
}

// ---- where everything goes ------------------------------------------------------------------------
export interface TalentAt {
  def: TalentDef;
  /** Its stone. */
  r: Rect;
  cx: number;
  cy: number;
}
export interface TalentLayout {
  tree: TalentTree;
  nodes: TalentAt[];
  root: { x: number; y: number } | null;
  labels: { text: string; x: number; y: number; color: string }[];
  /** The line over the tree: what it is and the points. */
  headY: number;
  /** Pixels to one of the shape's own units (across: the smaller, where it is stretched). */
  unit: number;
}

/** The tree laid into the page's room `r`, its shape stretched to fill it. */
export function layTalents(game: Game, r: Rect): TalentLayout {
  const tree = TREES[game.hero.cls];
  const pts: (readonly [number, number])[] = tree.talents.map((t) => t.at);
  if (tree.root) pts.push(tree.root);
  // (the box its shape is laid in: where its talents go, or the room it says it needs)
  const [minX, minY, maxX, maxY] = tree.room ?? [Math.min(...pts.map((p) => p[0])), Math.min(...pts.map((p) => p[1])), Math.max(...pts.map((p) => p[0])), Math.max(...pts.map((p) => p[1]))];
  const headY = r.y + 1;
  // (room for half a big stone round the edge, and for the captions of the paths above and below)
  const area: Rect = { x: r.x + 9, y: r.y + 19, w: r.w - 18, h: r.h - 29 };
  let sx = area.w / Math.max(0.01, maxX - minX);
  let sy = area.h / Math.max(0.01, maxY - minY);
  // (a round shape, the gear, laid as round as it is: the smaller of the two, in the middle of the room)
  let ox = 0;
  let oy = 0;
  if (tree.square) {
    const s = Math.min(sx, sy);
    ox = (area.w - s * (maxX - minX)) / 2;
    oy = (area.h - s * (maxY - minY)) / 2;
    sx = s;
    sy = s;
  }
  const map = (x: number, y: number): [number, number] => [Math.round(area.x + ox + (x - minX) * sx), Math.round(area.y + oy + (y - minY) * sy)];
  const nodes = tree.talents.map((def): TalentAt => {
    const [cx, cy] = map(def.at[0], def.at[1]);
    const s = def.big ? BIG_STONE : STONE;
    return { def, r: { x: cx - Math.floor(s / 2), y: cy - Math.floor(s / 2), w: s, h: s }, cx, cy };
  });
  const root = tree.root ? (([x, y]) => ({ x, y }))(map(tree.root[0], tree.root[1])) : null;
  // (each path's name beside one of its talents: small letters, 6 high)
  const labels = tree.paths
    .filter((p) => p.name)
    .map((p) => {
      const n = nodes.find((q) => q.def.id === p.label.node);
      const w = textWidth(p.name, 'small');
      let x = r.x;
      let y = r.y + 10;
      if (n) {
        const half = Math.ceil(n.r.w / 2) + (n.def.big ? 2 : 0);
        if (p.label.side === 'right') [x, y] = [n.cx + half + 3, n.cy - 3];
        else if (p.label.side === 'left') [x, y] = [n.cx - half - 3 - w, n.cy - 3];
        else if (p.label.side === 'above') [x, y] = [n.cx - Math.floor(w / 2), n.cy - half - 8];
        else [x, y] = [n.cx - Math.floor(w / 2), n.cy + half + 2];
      }
      return { text: p.name, x: Math.max(r.x, Math.min(r.x + r.w - w, x)), y: Math.max(r.y + 10, Math.min(r.y + r.h - 6, y)), color: p.color };
    });
  return { tree, nodes, root, labels, headY, unit: Math.min(sx, sy) };
}

/** The card of the talent being read: where it goes, over the game's half against the panel. */
function cardRect(panel: Rect, at: TalentAt, h: number, W: number, H: number): Rect {
  if (panel.y > 0) {
    // (the panel is the bottom half: the card stands over it)
    const x = Math.max(2, Math.min(W - CARD - 2, at.cx - Math.floor(CARD / 2)));
    return { x, y: Math.max(2, panel.y - h - 3), w: CARD, h };
  }
  const x = Math.max(2, panel.x - CARD - 3);
  const y = Math.max(2, Math.min(H - h - 2, at.cy - 12));
  return { x, y, w: CARD, h };
}

/** What the card says, line by line, and how tall it is. */
function cardLines(game: Game, t: TalentDef, tree: TalentTree): { text: string; color: string; small: boolean }[] {
  const path = tree.paths.find((p) => p.id === t.path);
  const out: { text: string; color: string; small: boolean }[] = [];
  out.push({ text: talentName(t).toUpperCase(), color: P.white, small: false });
  out.push({ text: `${t.big ? 'BIG ' : ''}${path && path.name ? `${path.name} ` : ''}TALENT`, color: path ? path.color : THEME.dim, small: true });
  // (TALENTS2: a remade talent's new words, name and word)
  for (const l of wrapText(talentText(t), CARD - 10)) out.push({ text: l, color: THEME.text, small: false });
  const word = talentWord(t);
  if (word) out.push({ text: `WORKS WITH ${WORDS[word].name.toUpperCase()}`, color: WORD_COLOR[word], small: true });
  // (a tree drafted, to be shown to the owner: its talents do nothing yet, and the card says so)
  if (tree.draft && !t.works) out.push({ text: 'A DRAFT: NOT IN PLAY YET', color: THEME.dim, small: true });
  return out;
}

/**
 * The presses on the page, before it is drawn (with the layout of this frame and the card of the
 * last): a stone is read; TAKE spends a point. Returns a word to say, if any.
 */
export function talentPresses(ui: Ui, game: Game, st: TalentUi, lay: TalentLayout): string | null {
  let say: string | null = null;
  const card = st.card;
  if (card && card.take && st.sel && ui.pressIn(card.take.x, card.take.y, card.take.w, card.take.h)) {
    const id = st.sel;
    const why = game.takeTalent(id);
    if (why) say = why;
    else st.flash = { id, t: 0 };
  }
  if (card && card.undo && st.sel && ui.pressIn(card.undo.x, card.undo.y, card.undo.w, card.undo.h)) {
    const why = game.unlearnTalent(st.sel);
    if (why) say = why;
  }
  // (a press anywhere else on the card is the card's: it does not close the inventory)
  if (card && ui.press && !ui.used && inside(card.r, ui.press.x, ui.press.y)) ui.used = true;
  const pad = ui.touch ? 3 : 1;
  for (const n of lay.nodes) {
    if (!ui.pressIn(n.r.x - pad, n.r.y - pad, n.r.w + 2 * pad, n.r.h + 2 * pad)) continue;
    st.sel = n.def.id;
  }
  return say;
}

/** The page, and the card of the talent being read. */
export function drawTalents(ui: Ui, game: Game, st: TalentUi, lay: TalentLayout, r: Rect, panel: Rect, t: number, dt: number): void {
  const g = ui.g;
  const h = game.hero;
  const tree = lay.tree;
  const taken = h.talents;
  const left = game.talentsLeft();
  const pulse = 0.5 + 0.5 * Math.sin(t * 6);
  if (st.flash) {
    st.flash.t += dt;
    if (st.flash.t > 0.8) st.flash = null;
  }
  if (st.sel && !tree.talents.some((q) => q.id === st.sel)) st.sel = null;

  // the line over the tree: what it is, and the points
  const next = nextTalentLevel(h.level);
  const pts = left > 0 ? `${left} ${left === 1 ? 'POINT' : 'POINTS'} TO SPEND` : next !== null ? `NEXT POINT AT LEVEL ${next}` : 'ALL TEN SPENT';
  // (what the tree is, where there is room for it beside the points)
  const what = `TALENTS: ${tree.shape.toUpperCase()}`;
  const ptsW = textWidth(pts, left > 0 ? 'normal' : 'small');
  drawText(g, textWidth(what, 'small') + 8 + ptsW <= r.w ? what : 'TALENTS', r.x, lay.headY + 2, THEME.dim, { font: 'small' });
  drawText(g, pts, r.x + r.w, lay.headY, left > 0 ? THEME.accent : THEME.dim, { align: 'right', font: left > 0 ? 'normal' : 'small' });
  ui.mark('talents:points', r.x + r.w - textWidth(pts), lay.headY, textWidth(pts), 9);

  const at = new Map(lay.nodes.map((n) => [n.def.id, n]));
  const isTaken = (id: string): boolean => taken.includes(id);
  // the faint pictures behind the tree, so that its shape reads (the arrow's feathers and head, the swords); the new classes'
  // (a claw's talons, a gear, a fist) kept to the page
  const keep = (tree.figures ?? []).some((f) => f.kind === 'talon' || f.kind === 'gear' || f.kind === 'round');
  g.save();
  if (keep) {
    g.beginPath();
    g.rect(r.x - 4, r.y + 10, r.w + 8, r.h - 10);
    g.clip();
  }
  for (const f of tree.figures ?? []) {
    const path = tree.paths.find((p) => p.id === f.path);
    const color = path ? path.color : THEME.dim;
    if (f.kind === 'fill') {
      const pts = f.ids.map((id) => at.get(id)).filter((n): n is TalentAt => !!n);
      if (pts.length < 3) continue;
      g.globalAlpha = 0.09;
      g.fillStyle = color;
      g.beginPath();
      g.moveTo(pts[0].cx + 0.5, pts[0].cy + 0.5);
      for (const n of pts.slice(1)) g.lineTo(n.cx + 0.5, n.cy + 0.5);
      g.closePath();
      g.fill();
      g.globalAlpha = 1;
    } else if (f.kind === 'talon') drawTalon(g, f.ids.map((id) => at.get(id)).filter((n): n is TalentAt => !!n), f.width, f.hook, color);
    else if (f.kind === 'gear') {
      const hub = at.get(f.hub);
      const ring = f.ring.map((id) => at.get(id)).filter((n): n is TalentAt => !!n);
      if (hub && ring.length >= 3) drawGear(g, hub, ring, f.spokes, color);
    } else if (f.kind === 'round') {
      const ns = f.ids.map((id) => at.get(id)).filter((n): n is TalentAt => !!n);
      if (ns.length) drawRound(g, ns, f.pad * lay.unit, color);
    } else {
      const P0 = at.get(f.pommel);
      const G = at.get(f.guard);
      const T = at.get(f.tip);
      const Q = f.quillons.map((id) => at.get(id));
      if (!P0 || !G || !T || !Q[0] || !Q[1]) continue;
      // the blade: two edges from the guard to the point
      const len = Math.hypot(T.cx - G.cx, T.cy - G.cy) || 1;
      const ux = (T.cx - G.cx) / len;
      const uy = (T.cy - G.cy) / len;
      const nx = -uy;
      const ny = ux;
      const bw = 5;
      const ex = T.cx + ux * 8;
      const ey = T.cy + uy * 8;
      g.globalAlpha = 0.1;
      g.fillStyle = color;
      g.beginPath();
      g.moveTo(G.cx + nx * bw + 0.5, G.cy + ny * bw + 0.5);
      g.lineTo(ex + 0.5, ey + 0.5);
      g.lineTo(G.cx - nx * bw + 0.5, G.cy - ny * bw + 0.5);
      g.closePath();
      g.fill();
      g.globalAlpha = 1;
      line(g, G.cx + nx * bw, G.cy + ny * bw, ex, ey, color, 0.35);
      line(g, G.cx - nx * bw, G.cy - ny * bw, ex, ey, color, 0.35);
      // the crossguard, through the guard from quillon to quillon, and the grip down to the pommel
      for (const o of [-1.5, 0, 1.5]) {
        const qx = (Q[1]!.cx - Q[0]!.cx);
        const qy = (Q[1]!.cy - Q[0]!.cy);
        const ql = Math.hypot(qx, qy) || 1;
        const mx = (-qy / ql) * o;
        const my = (qx / ql) * o;
        line(g, Q[0]!.cx + mx, Q[0]!.cy + my, Q[1]!.cx + mx, Q[1]!.cy + my, color, 0.3);
        line(g, G.cx + nx * o, G.cy + ny * o, P0.cx + nx * o, P0.cy + ny * o, color, 0.25);
      }
    }
  }
  g.restore();
  // the lines: between each talent and the ones that lead to it; and from the mage's rune
  if (lay.root) {
    for (const n of lay.nodes) {
      if (n.def.from.length) continue;
      const lit = isTaken(n.def.id);
      line(g, lay.root.x, lay.root.y, n.cx, n.cy, lit ? THEME.accent : THEME.edgeHi, lit ? 1 : 0.7);
    }
  }
  for (const n of lay.nodes) {
    for (const f of n.def.from) {
      const m = at.get(f);
      if (!m) continue;
      const lit = isTaken(n.def.id) && isTaken(f);
      line(g, m.cx, m.cy, n.cx, n.cy, lit ? THEME.accent : THEME.edgeHi, lit ? 1 : 0.55);
    }
  }
  // the mage's rune, where her three paths begin
  if (lay.root) {
    const { x, y } = lay.root;
    ui.box(x - 7, y - 7, 15, 15, THEME.bg2, THEME.accentLo);
    drawRune(g, { rows: ['..X..', '.XoX.', 'XoooX', '.XoX.', '..X..'], color: THEME.accentLo, glow: THEME.accent }, x + 0.5, y + 0.5, 1);
  }
  // the captions of the paths
  for (const l of lay.labels) drawText(g, l.text, l.x, l.y, l.color, { font: 'small' });

  // the stones
  for (const n of lay.nodes) {
    const def = n.def;
    const took = isTaken(def.id);
    const open = !took && talentOpen(h.cls, taken, def.id);
    const can = open && left > 0;
    const rune = runeOf(tree, def);
    const path = tree.paths.find((p) => p.id === def.path);
    const pc = path ? path.color : THEME.text;
    const { x, y, w } = n.r;
    if (def.big) {
      // a big talent: a second rim round the stone
      ui.box(x - 2, y - 2, w + 4, w + 4, THEME.ink, took ? THEME.accent : can ? pc : THEME.edge);
    }
    if (took) {
      ui.box(x, y, w, w, THEME.hot, THEME.accent);
      g.globalAlpha = 0.35;
      g.fillStyle = pc;
      g.fillRect(x + 1, y + 1, w - 2, w - 2);
      g.globalAlpha = 1;
    } else if (can) ui.box(x, y, w, w, THEME.bg2, pc);
    else if (open) ui.box(x, y, w, w, THEME.bg2, THEME.edgeHi);
    else ui.box(x, y, w, w, THEME.slot, THEME.edge);
    drawRune(g, rune, n.cx + 0.5, n.cy + 0.5, took || can ? 1 : open ? 0.75 : 0.35);
    // (one that can be taken now: a ring that pulses round it)
    if (can) {
      g.globalAlpha = 0.25 + 0.5 * pulse;
      g.strokeStyle = THEME.accent;
      g.lineWidth = 0.5;
      const o = def.big ? 4 : 2;
      g.strokeRect(x - o + 0.25, y - o + 0.25, w + 2 * o - 0.5, w + 2 * o - 0.5);
      g.globalAlpha = 1;
    }
    // (the one being read)
    if (st.sel === def.id) {
      const o = def.big ? 4 : 3;
      g.fillStyle = THEME.accent;
      g.fillRect(x - o, y - o, w + 2 * o, 1);
      g.fillRect(x - o, y + w + o - 1, w + 2 * o, 1);
      g.fillRect(x - o, y - o, 1, w + 2 * o);
      g.fillRect(x + w + o - 1, y - o, 1, w + 2 * o);
    }
    // (just taken: it flares)
    if (st.flash && st.flash.id === def.id) {
      const k = st.flash.t / 0.8;
      const o = Math.round(2 + k * 8);
      g.globalAlpha = 1 - k;
      g.strokeStyle = P.white;
      g.lineWidth = 1;
      g.strokeRect(x - o + 0.5, y - o + 0.5, w + 2 * o - 1, w + 2 * o - 1);
      g.globalAlpha = 1;
    }
    ui.mark(`talent:${def.id}`, x, y, w, w);
  }

  // the card of the talent being read
  st.card = null;
  const sel = st.sel ? at.get(st.sel) : undefined;
  if (!sel) return;
  const def = sel.def;
  const lines = cardLines(game, def, tree);
  const took = isTaken(def.id);
  const why = game.talentProblem(def.id);
  const bh = ui.touch ? 18 : 13;
  const textH = lines.reduce((a, l) => a + LINE_H[l.small ? 'small' : 'normal'] + (l.small ? 2 : 1), 0);
  const ch = 5 + textH + 3 + bh + 5;
  const cr = cardRect(panel, sel, ch, ui.w, ui.h);
  ui.box(cr.x, cr.y, cr.w, cr.h, THEME.bg, THEME.edgeHi);
  g.fillStyle = THEME.accentLo;
  g.fillRect(cr.x + 1, cr.y + 1, cr.w - 2, 0.5);
  let ly = cr.y + 5;
  for (const l of lines) {
    drawText(g, l.text, cr.x + 5, ly + (l.small ? 0 : 0), l.color, { font: l.small ? 'small' : 'normal' });
    ly += LINE_H[l.small ? 'small' : 'normal'] + (l.small ? 2 : 1);
  }
  const by = cr.y + cr.h - 5 - bh;
  let take: Rect | null = null;
  let undo: Rect | null = null;
  if (took) {
    // taken: and in town, undone for gold (his rulebook), if nothing taken hangs on it alone
    drawText(g, 'TAKEN', cr.x + 5, by + Math.floor((bh - 8) / 2) + 1, THEME.good);
    const tw = textWidth('TAKEN') + 10;
    const no = game.unlearnProblemNow(def.id);
    if (no === null) {
      undo = { x: cr.x + 5 + tw, y: by, w: cr.w - 10 - tw, h: bh };
      ui.drawButton(undo.x, undo.y, undo.w, undo.h, `UNDO  ${game.unlearnPrice()} GOLD`);
      ui.mark('button:UNDO', undo.x, undo.y, undo.w, undo.h);
    } else drawText(g, no.toUpperCase(), cr.x + 5 + tw, by + Math.floor((bh - 6) / 2) + 1, THEME.dim, { font: 'small' });
  } else if (why === null) {
    take = { x: cr.x + 5, y: by, w: cr.w - 10, h: bh };
    ui.drawButton(take.x, take.y, take.w, take.h, 'TAKE  (1 POINT)', { primary: true });
    ui.mark('button:TAKE', take.x, take.y, take.w, take.h);
  } else drawText(g, why.toUpperCase(), cr.x + 5, by + Math.floor((bh - 6) / 2) + 1, THEME.dim, { font: 'small' });
  ui.mark('talent-card', cr.x, cr.y, cr.w, cr.h);
  st.card = { r: cr, take, undo };
}
