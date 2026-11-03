// THE NEW ITEM PICTURES, STYLE A, PAINTED, GAME-READY behind ITEMS_A (off until he has seen them in the game and said yes).
// Nothing of the game imports this file yet (tests/items_a.test.ts says so); the README of the new item pictures (docs/mockups) says what the
// main chat changes to bring it in.
//
// The owner, 2 Nov 2026, 19:53: “I’d like new item sprites I think.  They’re pretty old art.  Then I guess get ready for unique
// items.” Of the Veteran: “Oh and we need sprites for his weapon, hand wraps, or brawler’s wraps.  2 handed obv.” His picks, 3 Nov:
// “A, painted”; “Finer and a rim”. And, 3 Nov, 09:39: “I need fighters wraps, a demonic tome, and something for the tinkerer’s
// weapon as items”; of the Tinkerer's: “Her big wrench (Recommended)”.
//
// So every item kind at every rarity: lit and shaded like the new heroes (five tones to a material, dark seams where one part
// meets another, a shadow cast where one part lies over another, a bold ink outline), each rarer one FINER in its own way
// (Normal plain; Magic a touch of blue; Rare gold and a yellow stone; Unique blackened or gilded, with orange stones), and a thin
// RIM of its rarity's colour (the game's own, RARITY_COLOR) round the item's own outline, in the bag and lying on the floor.
// 32 by 32 picture pixels at the heroes' grain: the 16 game pixels today's item pictures fill, anchor the middle.
// The light comes from the upper left. Nothing glows but the demon's fire on the tome (orange and red) and the core of the
// Tinkerer's wrench (the friend's cyan: hers is a friend's).

import { Px, mix } from '../engine/px';
import type { Sprite } from '../engine/px';
import type { Rarity } from '../game/types';
import { RARITY_COLOR } from './palette';

/** The switch: off until he has said yes to them in the game. */
export const ITEMS_A = { on: false };

export const ITEM_A_KINDS = [
  'sword', 'greatsword', 'bow', 'wand', 'staff', 'wraps', 'tome', 'wrench', 'shield', 'quiver', 'focus',
  'helm', 'hood', 'armor', 'robe', 'gloves', 'belt', 'boots', 'ring', 'amulet',
] as const;
export type ItemAKind = (typeof ITEM_A_KINDS)[number];
/** The names he knows them by. */
export const ITEM_A_NAME: Record<ItemAKind, string> = {
  sword: 'Sword', greatsword: 'Greatsword', bow: 'Bow', wand: 'Wand', staff: 'Staff', wraps: 'Brawler’s wraps', tome: 'Demonic tome',
  wrench: 'Tinkerer’s wrench', shield: 'Shield', quiver: 'Quiver', focus: 'Focus', helm: 'Helmet', hood: 'Hood', armor: 'Armour',
  robe: 'Robe', gloves: 'Gloves', belt: 'Belt', boots: 'Boots', ring: 'Ring', amulet: 'Amulet',
};
/** The weapons that were in the game until Version 12 (game/types.ts OldWeaponKind): each shows the picture of the kind it becomes (game/items.ts OLD_WEAPON, migrateItem). */
export const ITEM_A_OLD: Record<'axe' | 'mace' | 'maul' | 'longbow', ItemAKind> = { axe: 'sword', mace: 'sword', maul: 'greatsword', longbow: 'bow' };
/** Picture pixels across (two to a game pixel: 16 game pixels, today's size). */
export const ITEM_A_N = 32;
/** How much of the frame the item itself takes: the rest is its ink outline, its rim and a clear pixel round it all, so the rim never touches the slot's frame. */
export const ITEM_A_SCALE = 0.88;
export const ITEM_A_INK = '#0e0c24';
/** The rim's colours: the game's own rarity colours. */
export const ITEM_A_RIM = RARITY_COLOR;

const N = ITEM_A_N;
const INK = ITEM_A_INK;
type Rar = 0 | 1 | 2 | 3;

// ---------------------------------------------------------------------------------------------
// Materials: five tones each, darkest to brightest.

type Ramp = readonly [string, string, string, string, string];
const M = {
  steel: ['#26224e', '#45418a', '#7a76be', '#b6b2ea', '#f2f0ff'],
  /** blackened steel */
  dsteel: ['#16142a', '#2a2848', '#46446e', '#6e6c9a', '#b0aed8'],
  gold: ['#4a2408', '#8a4e14', '#d0902c', '#f6cc5c', '#fff4c0'],
  brass: ['#3a2410', '#6a4620', '#a07436', '#d0a656', '#f2d892'],
  leather: ['#2a140c', '#4a2a18', '#7a4a2a', '#ac7444', '#d6a470'],
  dleather: ['#1a0e0c', '#2e1a14', '#4c2e20', '#6e4630', '#94664a'],
  wood: ['#2e180e', '#52301a', '#80522c', '#b07c48', '#d6a874'],
  /** blackened wood */
  ebony: ['#0c0810', '#1c141e', '#30242e', '#4a3842', '#6e5660'],
  linen: ['#463a38', '#7a6a62', '#ae9c8e', '#dccebe', '#f8f0e2'],
  /** black cloth */
  black: ['#0a0816', '#16122a', '#262040', '#3a3258', '#5a5078'],
  red: ['#34081a', '#661024', '#a81e2e', '#dc4234', '#ff8a66'],
  green: ['#08261a', '#0e4228', '#1c6c3c', '#36a058', '#7ee07a'],
  violet: ['#1a0c40', '#341a74', '#5a2ab4', '#8a4ce8', '#d4b4ff'],
  blue: ['#0c1440', '#16286e', '#2446a8', '#4a74e0', '#9ab8ff'],
  vcloth: ['#1a0c36', '#2e1660', '#4a2490', '#6e3cc0', '#a27ae8'],
  teal: ['#06222e', '#0c3a50', '#147488', '#36b4b0', '#b4f4e4'],
  ruby: ['#360612', '#700e26', '#bc1a36', '#f8505c', '#ffd0cc'],
  sapphire: ['#0a1048', '#18288a', '#2a50cc', '#5a8aff', '#d6e4ff'],
  topaz: ['#4a2a04', '#8a5208', '#d89a14', '#ffd448', '#fff8d0'],
  amber: ['#4a1404', '#8a2c08', '#d85a14', '#ff9a3c', '#ffe0b0'],
  ivory: ['#46384c', '#76687c', '#ae9ea8', '#ded2cc', '#fffaf0'],
  feather: ['#3a3446', '#6a6278', '#a49cb0', '#dcd6e4', '#ffffff'],
  string: ['#5a5050', '#8a8078', '#c8beb0', '#ece4d4', '#ffffff'],
  shadow: ['#06050e', '#0a0816', '#120e22', '#1a1630', '#24203e'],
  /** the Warlock's red book (dev/sculpt_warlock.ts BOOKRED) */
  bookred: ['#22040c', '#420a16', '#6e1420', '#a02a2c', '#c84a3e'],
  /** the demon's fire: orange and red (not the enemy's pink flame, not a gold glow) */
  fire: ['#4a0806', '#8e1a0a', '#d8401a', '#ff8a2c', '#ffd49a'],
  /** the Tinkerer's glowing core: the friend's cyan */
  core: ['#0c6a80', '#127e94', '#22d0e0', '#8af6f0', '#e8fffc'],
} satisfies Record<string, Ramp>;
type Mat = keyof typeof M;

// ---------------------------------------------------------------------------------------------
// Shapes, in pixel-edge coordinates on the 32 by 32 canvas (before ITEM_A_SCALE).

type V = readonly [number, number];
const add = (a: V, b: V): V => [a[0] + b[0], a[1] + b[1]];
const sub = (a: V, b: V): V => [a[0] - b[0], a[1] - b[1]];
const mul = (a: V, k: number): V => [a[0] * k, a[1] * k];
const lerp = (a: V, b: V, t: number): V => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
const len = (a: V): number => Math.hypot(a[0], a[1]);
const unit = (a: V): V => mul(a, 1 / (len(a) || 1));
/** A quarter turn clockwise on the screen (y runs down): the right-hand side of a direction. */
const side = (u: V): V => [-u[1], u[0]];
/** Points along a direction and across it from an origin. */
const at = (o: V, u: V, along: number, across: number): V => add(add(o, mul(u, along)), mul(side(u), across));

type Shape =
  | { t: 'poly'; p: readonly V[] }
  | { t: 'cap'; a: V; b: V; r: number; r2?: number }
  | { t: 'ell'; c: V; rx: number; ry: number; rot?: number }
  | { t: 'path'; p: readonly V[]; r: readonly number[] };
const poly = (...p: V[]): Shape => ({ t: 'poly', p });
const cap = (a: V, b: V, r: number, r2?: number): Shape => ({ t: 'cap', a, b, r, r2 });
const ell = (c: V, rx: number, ry = rx, rot = 0): Shape => ({ t: 'ell', c, rx, ry, rot });
const path = (p: readonly V[], r: readonly number[]): Shape => ({ t: 'path', p, r });

function segDist(p: V, a: V, b: V): { d: number; t: number } {
  const ab = sub(b, a);
  const l2 = ab[0] * ab[0] + ab[1] * ab[1] || 1;
  const t = Math.max(0, Math.min(1, ((p[0] - a[0]) * ab[0] + (p[1] - a[1]) * ab[1]) / l2));
  return { d: len(sub(p, lerp(a, b, t))), t };
}
function inside(s: Shape, p: V): boolean {
  switch (s.t) {
    case 'poly': {
      let c = false;
      for (let i = 0, j = s.p.length - 1; i < s.p.length; j = i++) {
        const a = s.p[i], b = s.p[j];
        if (a[1] > p[1] !== b[1] > p[1] && p[0] < ((b[0] - a[0]) * (p[1] - a[1])) / (b[1] - a[1]) + a[0]) c = !c;
      }
      return c;
    }
    case 'cap': {
      const { d, t } = segDist(p, s.a, s.b);
      return d <= s.r + ((s.r2 ?? s.r) - s.r) * t;
    }
    case 'ell': {
      const rot = ((s.rot ?? 0) * Math.PI) / 180;
      const dx = p[0] - s.c[0], dy = p[1] - s.c[1];
      const x = dx * Math.cos(rot) + dy * Math.sin(rot);
      const y = -dx * Math.sin(rot) + dy * Math.cos(rot);
      return (x / s.rx) ** 2 + (y / s.ry) ** 2 <= 1;
    }
    case 'path': {
      for (let i = 0; i + 1 < s.p.length; i++) {
        const { d, t } = segDist(p, s.p[i], s.p[i + 1]);
        if (d <= s.r[i] + (s.r[i + 1] - s.r[i]) * t) return true;
      }
      return false;
    }
  }
}

// ---------------------------------------------------------------------------------------------
// Light

/** How a part takes the light. */
type Shade =
  | { k: 'flat'; bev?: number } // a face toward you, its edges rounded off over `bev` pixels
  | { k: 'soft'; r: number } // soft and round all over (cloth, leather): rounded off over `r` pixels from its edge
  | { k: 'cyl'; a: V; b: V; w: number } // round along a line (a grip, a shaft): `w` its half-width
  | { k: 'dome'; c: V; r: number; ry?: number } // a ball or a dome
  | { k: 'ridge'; a: V; b: V; tilt?: number } // two faces either side of a line (a blade, a crystal)
  | { k: 'face'; n: readonly [number, number] }; // one flat face turned toward a side (a facet)

interface Mark {
  /** A line from a to b, or a dot at a. */
  a: V;
  b?: V;
  /** A tone of the part's material (0 darkest to 4 brightest), or a colour. */
  t: number | string;
}
interface Part {
  s: Shape;
  cut?: readonly Shape[];
  m: Mat;
  sh: Shade;
  /** Added to its light: a part turned toward the light or away. */
  bias?: number;
  /** Takes a highlight (metal, gems, glass, fire). */
  shine?: boolean;
  /** No dark seam where it lies over another part (an inlay, a painted device). */
  flush?: boolean;
  marks?: readonly Mark[];
}

const LV = ((): readonly [number, number, number] => {
  const v = [-0.5, -0.66, 0.58];
  const l = Math.hypot(v[0], v[1], v[2]);
  return [v[0] / l, v[1] / l, v[2] / l];
})();

/** Paint the parts (in order, later over earlier), ink round them, and the rarity's rim round that. */
function paint(parts: readonly Part[], rar: Rar): Px {
  const k = ITEM_A_SCALE;
  const sample = (x: number, y: number): V => [16 + (x + 0.5 - 16) / k, 16 + (y + 0.5 - 16) / k];
  const masks = parts.map((pt) => {
    const m = new Uint8Array(N * N);
    for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
      const p = sample(x, y);
      if (inside(pt.s, p) && !(pt.cut ?? []).some((c) => inside(c, p))) m[y * N + x] = 1;
    }
    return m;
  });
  const owner = new Int16Array(N * N).fill(-1);
  masks.forEach((m, i) => { for (let j = 0; j < N * N; j++) if (m[j]) owner[j] = i; });
  const own = (x: number, y: number): number => (x < 0 || y < 0 || x >= N || y >= N ? -1 : owner[y * N + x]);
  const tone = new Int8Array(N * N).fill(-1);
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
    const i = own(x, y);
    if (i < 0) continue;
    const pt = parts[i];
    const m = masks[i];
    const p = sample(x, y);
    let n: [number, number, number] = [0, 0, 1];
    const sh = pt.sh;
    if (sh.k === 'cyl') {
      const u = unit(sub(sh.b, sh.a));
      const q = side(u);
      const s = Math.max(-0.95, Math.min(0.95, ((p[0] - sh.a[0]) * q[0] + (p[1] - sh.a[1]) * q[1]) / sh.w)) * 0.92;
      n = [q[0] * s, q[1] * s, Math.sqrt(1 - s * s)];
    } else if (sh.k === 'dome') {
      const dx = (p[0] - sh.c[0]) / sh.r, dy = (p[1] - sh.c[1]) / (sh.ry ?? sh.r);
      const l = Math.min(0.96, Math.hypot(dx, dy));
      const a = Math.atan2(dy, dx);
      n = [Math.cos(a) * l, Math.sin(a) * l, Math.sqrt(1 - l * l)];
    } else if (sh.k === 'ridge') {
      const u = unit(sub(sh.b, sh.a));
      const q = side(u);
      const s = (p[0] - sh.a[0]) * q[0] + (p[1] - sh.a[1]) * q[1];
      const tl = sh.tilt ?? 0.42;
      const sg = s < 0 ? -1 : 1;
      n = [q[0] * sg * tl, q[1] * sg * tl, Math.sqrt(1 - tl * tl)];
    } else if (sh.k === 'face') {
      const l = Math.min(0.9, Math.hypot(sh.n[0], sh.n[1]));
      n = [sh.n[0], sh.n[1], Math.sqrt(1 - l * l)];
    }
    // the edges rounded off: toward the nearest pixel outside the part (its own whole shape, not what covers it)
    const r = sh.k === 'soft' ? sh.r : sh.k === 'flat' ? sh.bev ?? 1.4 : 1.1;
    let best = 99, bx = 0, by = 0;
    const R = Math.ceil(r) + 1;
    for (let dy = -R; dy <= R; dy++) for (let dx = -R; dx <= R; dx++) {
      const xx = x + dx, yy = y + dy;
      const out = xx < 0 || yy < 0 || xx >= N || yy >= N || !m[yy * N + xx];
      if (!out) continue;
      const d = Math.hypot(dx, dy);
      if (d < best) { best = d; bx = dx; by = dy; }
    }
    if (best < 99) {
      const t = Math.max(0, Math.min(1, 1 - (best - 1) / r)) * (sh.k === 'soft' ? 0.85 : 0.7);
      const l = Math.hypot(bx, by);
      n = [n[0] + (bx / l) * t, n[1] + (by / l) * t, n[2] * (1 - t * 0.5)];
      const nl = Math.hypot(n[0], n[1], n[2]);
      n = [n[0] / nl, n[1] / nl, n[2] / nl];
    }
    const v = n[0] * LV[0] + n[1] * LV[1] + n[2] * LV[2] + (pt.bias ?? 0);
    let t = v > 0.93 ? 4 : v > 0.72 ? 3 : v > 0.42 ? 2 : v > 0.08 ? 1 : 0;
    if (!pt.shine && t > 3) t = 3;
    tone[y * N + x] = t;
  }
  // a shadow cast down and to the right where one part lies over another
  const t2 = Int8Array.from(tone);
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
    const i = own(x, y);
    if (i < 0) continue;
    const over = [own(x - 1, y - 1), own(x - 2, y - 1), own(x - 1, y - 2), own(x - 2, y - 2)].some((j) => j > i && !parts[j].flush);
    if (over) t2[y * N + x] = Math.max(0, tone[y * N + x] - 1);
  }
  tone.set(t2);
  const out = new Px(N, N);
  const ramps = parts.map((pt) => M[pt.m] as Ramp);
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
    const i = own(x, y);
    if (i < 0) continue;
    const seam = [own(x + 1, y), own(x - 1, y), own(x, y + 1), own(x, y - 1)].some((j) => j > i && !parts[j].flush);
    const rr = ramps[i];
    out.set(x, y, seam ? mix(rr[0], INK, 0.55) : rr[tone[y * N + x]]);
  }
  // marks: lines and dots drawn on a part, only where that part shows
  parts.forEach((pt, i) => {
    for (const mk of pt.marks ?? []) {
      const col = typeof mk.t === 'number' ? ramps[i][mk.t] : mk.t;
      const pix = (px: number, py: number): void => {
        const x = Math.floor(16 + (px - 16) * k), y = Math.floor(16 + (py - 16) * k);
        if (own(x, y) === i) out.set(x, y, col);
      };
      if (!mk.b) { pix(mk.a[0], mk.a[1]); continue; }
      const steps = Math.max(1, Math.ceil(Math.max(Math.abs(mk.b[0] - mk.a[0]), Math.abs(mk.b[1] - mk.a[1])) * 1.5));
      let last = '';
      for (let s = 0; s <= steps; s++) {
        const q = lerp(mk.a, mk.b, s / steps);
        const key = `${Math.floor(16 + (q[0] - 16) * k)},${Math.floor(16 + (q[1] - 16) * k)}`;
        if (key === last) continue;
        last = key;
        pix(q[0], q[1]);
      }
    }
  });
  out.outline(INK);
  out.outline(RARITY_COLOR[rar]);
  // (the rim goes round the item's own outline only: where it would fill a narrow notch between two parts, that is ink)
  const notch: number[] = [];
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
    if (out.get(x, y) !== RARITY_COLOR[rar]) continue;
    const open = [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dy]) => x + dx < 0 || y + dy < 0 || x + dx >= N || y + dy >= N || !out.has(x + dx, y + dy));
    if (!open) notch.push(x, y);
  }
  for (let i = 0; i < notch.length; i += 2) out.set(notch[i], notch[i + 1], INK);
  return out;
}

// ---------------------------------------------------------------------------------------------
// Finery, by rarity: Normal plain; Magic a touch of blue; Rare gold and a yellow stone; Unique blackened or gilded, orange stones.

/** The stone a piece is set with, if any. */
const STONE: readonly (Mat | null)[] = [null, 'sapphire', 'topaz', 'amber'];
/** Its fittings: plain steel, or gold. */
const TRIM = (r: Rar): Mat => (r >= 2 ? 'gold' : 'steel');
/** A set stone: a dome that takes the light. */
const gem = (c: V, r: number, m: Mat, ry = r): Part => ({ s: ell(c, r, ry), m, sh: { k: 'dome', c, r, ry }, shine: true });
/** A stud or rivet. */
const stud = (c: V, r: number, m: Mat): Part => ({ s: ell(c, r), m, sh: { k: 'dome', c, r }, shine: true, flush: true });
/** Gold inlay on blackened metal: a line of gold. */
const INLAY = '#e0a040';
const INLAY_LO = '#8a4e14';
/** A cog: teeth round a rim, a hole in its middle. */
function cog(c: V, r: number, teeth: number, m: Mat, turn = 0): Part {
  const p: V[] = [];
  for (let i = 0; i < teeth * 4; i++) {
    const a = turn + (i / (teeth * 4)) * Math.PI * 2;
    const rr = i % 4 < 2 ? r : r * 0.7;
    p.push([c[0] + Math.cos(a) * rr, c[1] + Math.sin(a) * rr]);
  }
  return { s: poly(...p), cut: [ell(c, r * 0.32)], m, sh: { k: 'dome', c, r }, shine: true };
}

/** Parts made narrower (`sx`) or shorter (`sy`) about the middle of the frame, then turned `deg` clockwise about it: their shapes, their light and their marks. */
function squeeze(parts: readonly Part[], sx: number, sy: number, deg = 0): Part[] {
  const a = (deg * Math.PI) / 180, ca = Math.cos(a), sa = Math.sin(a);
  const f = (p: V): V => {
    const x = (p[0] - 16) * sx, y = (p[1] - 16) * sy;
    return [16 + x * ca - y * sa, 16 + x * sa + y * ca];
  };
  const kr = (sx + sy) / 2;
  const shape = (s: Shape): Shape => {
    switch (s.t) {
      case 'poly': return { t: 'poly', p: s.p.map(f) };
      case 'cap': return { t: 'cap', a: f(s.a), b: f(s.b), r: s.r * kr, r2: s.r2 === undefined ? undefined : s.r2 * kr };
      case 'ell': return { t: 'ell', c: f(s.c), rx: s.rx * sx, ry: s.ry * sy, rot: (s.rot ?? 0) + deg };
      case 'path': return { t: 'path', p: s.p.map(f), r: s.r.map((x) => x * kr) };
    }
  };
  const shade = (sh: Shade): Shade => {
    switch (sh.k) {
      case 'cyl': return { k: 'cyl', a: f(sh.a), b: f(sh.b), w: sh.w * kr };
      case 'dome': return { k: 'dome', c: f(sh.c), r: sh.r * kr, ry: (sh.ry ?? sh.r) * kr };
      case 'ridge': return { ...sh, a: f(sh.a), b: f(sh.b) };
      case 'face': return { k: 'face', n: [sh.n[0] * ca - sh.n[1] * sa, sh.n[0] * sa + sh.n[1] * ca] };
      default: return sh;
    }
  };
  return parts.map((pt) => ({
    ...pt, s: shape(pt.s), cut: pt.cut?.map(shape), sh: shade(pt.sh),
    marks: pt.marks?.map((mk) => ({ a: f(mk.a), b: mk.b ? f(mk.b) : undefined, t: mk.t })),
  }));
}

// ---------------------------------------------------------------------------------------------
// The items. Weapons lie on the diagonal, grip at the bottom left, as today; the rest are seen from the front.

const UP: V = unit([1, -1]);

function sword(r: Rar): Part[] {
  const fin = [
    { guard: 'steel', pommel: 'steel', grip: 'leather' },
    { guard: 'steel', pommel: 'steel', grip: 'blue' },
    { guard: 'gold', pommel: 'gold', grip: 'leather' },
    { guard: 'gold', pommel: 'gold', grip: 'red' },
  ][r] as { guard: Mat; pommel: Mat; grip: Mat };
  // (a one-handed sword, shorter and slimmer than the greatsword, so the two are told apart at a glance)
  const G: V = [13.4, 18.6];
  const T: V = [26.0, 6.0];
  const L = len(sub(T, G));
  const w = 2.4;
  const b0 = at(G, UP, 0.6, 0), tn = at(G, UP, L - 4.4, 0);
  const blade: Part = {
    s: poly(at(b0, UP, 0, -w), at(tn, UP, 0, -w), T, at(tn, UP, 0, w), at(b0, UP, 0, w)),
    m: r === 3 ? 'dsteel' : 'steel', sh: { k: 'ridge', a: G, b: T }, shine: true,
    marks: [
      ...(r >= 2 ? [{ a: at(b0, UP, 1.5, 0), b: at(tn, UP, -2, 0), t: r === 3 ? INLAY : 1 } as Mark] : []),
      { a: at(tn, UP, 1.2, -1.2), t: 4 },
    ],
  };
  const gl = r === 3 ? 6.4 : 5.6;
  const guard: Part = {
    s: r === 3
      ? path([at(G, UP, 2.4, -gl), at(G, UP, 0.4, -3), at(G, UP, 0, 0), at(G, UP, 0.4, 3), at(G, UP, 2.4, gl)], [1.1, 1.5, 1.8, 1.5, 1.1])
      : cap(at(G, UP, 0, -gl), at(G, UP, 0, gl), 1.6),
    m: fin.guard, sh: { k: 'cyl', a: at(G, UP, 0, -gl), b: at(G, UP, 0, gl), w: 1.5 }, shine: true,
  };
  const grip: Part = {
    s: cap(at(G, UP, -0.5, 0), at(G, UP, -6.0, 0), 1.6), m: fin.grip, sh: { k: 'cyl', a: G, b: at(G, UP, -6, 0), w: 1.6 }, bias: 0.16,
    marks: [2.2, 4.0].map((d) => ({ a: at(G, UP, -d, -1.8), b: at(G, UP, -d - 0.9, 1.8), t: 1 })),
  };
  const pc = at(G, UP, -8.0, 0);
  const pommel: Part = { s: ell(pc, 2.4), m: fin.pommel, sh: { k: 'dome', c: pc, r: 2.4 }, shine: true };
  const parts: Part[] = [blade, grip, guard, pommel];
  const st = STONE[r];
  if (st) {
    parts.push(gem(pc, 1.25, st));
    if (r === 3) parts.push(gem(G, 1.3, st));
  }
  return parts;
}

function greatsword(r: Rar): Part[] {
  const G: V = [11.4, 20.6];
  const T: V = [29.4, 2.6];
  const L = len(sub(T, G));
  const w = 4.3;
  const b0 = at(G, UP, 0.8, 0), tn = at(G, UP, L - 5.8, 0);
  const parts: Part[] = [];
  parts.push({
    s: poly(at(b0, UP, 0, -w + 0.4), at(b0, UP, 2.2, -w), at(tn, UP, 0, -w), T, at(tn, UP, 0, w), at(b0, UP, 2.2, w), at(b0, UP, 0, w - 0.4)),
    m: r === 3 ? 'dsteel' : 'steel', sh: { k: 'ridge', a: G, b: T, tilt: 0.38 }, shine: true,
    marks: [
      { a: at(b0, UP, 3, -0.6), b: at(tn, UP, -2, -0.6), t: r === 3 ? INLAY : r === 2 ? '#d0902c' : 1 },
      { a: at(b0, UP, 3, 0.6), b: at(tn, UP, -2, 0.6), t: r === 3 ? INLAY_LO : r === 2 ? '#8a4e14' : 0 },
      { a: at(tn, UP, 2, -2), t: 4 },
    ],
  });
  // the long two-handed grip, then the guard with its quillons swept toward the point
  parts.push({
    s: cap(at(G, UP, -0.6, 0), at(G, UP, -8.6, 0), 1.55), m: r === 1 ? 'blue' : r === 3 ? 'red' : 'leather', sh: { k: 'cyl', a: G, b: at(G, UP, -8, 0), w: 1.55 }, bias: 0.16,
    marks: [2.2, 4.4, 6.6].map((d) => ({ a: at(G, UP, -d, -1.7), b: at(G, UP, -d - 1, 1.7), t: 1 })),
  });
  const q = r === 3 ? 9.0 : 8.4;
  parts.push({
    s: path(r === 3
      ? [at(G, UP, 3.8, -q - 0.4), at(G, UP, 2.4, -q), at(G, UP, 0.5, -6), at(G, UP, 0, 0), at(G, UP, 0.5, 6), at(G, UP, 2.4, q), at(G, UP, 3.8, q + 0.4)]
      : [at(G, UP, 2.6, -q), at(G, UP, 0.5, -6), at(G, UP, 0, 0), at(G, UP, 0.5, 6), at(G, UP, 2.6, q)], r === 3 ? [0.8, 1.1, 1.4, 1.8, 1.4, 1.1, 0.8] : [1.0, 1.4, 1.8, 1.4, 1.0]),
    m: TRIM(r), sh: { k: 'cyl', a: at(G, UP, 0, -7), b: at(G, UP, 0, 7), w: 1.8 }, shine: true,
  });
  parts.push(STONE[r] ? gem(G, 1.5, STONE[r]!) : { s: ell(G, 1.4), m: 'steel', sh: { k: 'dome', c: G, r: 1.4 }, shine: true });
  const pc = at(G, UP, -10.4, 0);
  parts.push({ s: poly(at(pc, UP, 2, 0), at(pc, UP, 0.6, -2.3), at(pc, UP, -1.6, -1.4), at(pc, UP, -2.2, 0), at(pc, UP, -1.6, 1.4), at(pc, UP, 0.6, 2.3)), m: TRIM(r), sh: { k: 'dome', c: pc, r: 2.4 }, shine: true });
  if (r >= 2) parts.push(gem(at(pc, UP, -0.1, 0), 1.0, STONE[r]!));
  return parts;
}

/** A recurve bow on the diagonal, its belly toward the upper left, the string from corner to corner. */
function bow(r: Rar): Part[] {
  const d: V = UP; // along the string, bottom left to top right
  const nrm: V = unit([-1, -1]); // toward its belly
  const c0: V = [18.4, 18.4];
  const H = 9.6, S = 14.2;
  const P = (s: number): V => {
    const u = s / S;
    const h = H * (1 - u * u) + 2.6 * Math.max(0, (Math.abs(u) - 0.72) / 0.28) ** 2;
    return add(add(c0, mul(d, s)), mul(nrm, h));
  };
  const ss = [-14.6, -12.4, -9.6, -6.4, -3.2, 0, 3.2, 6.4, 9.6, 12.4, 14.6];
  const rs = ss.map((s) => 0.95 + 1.35 * (1 - Math.abs(s) / 14.6));
  const tipA = P(-12.3), tipB = P(12.3);
  const parts: Part[] = [];
  parts.push({ s: cap(tipA, tipB, 0.55), m: 'string', sh: { k: 'flat' }, flush: true });
  parts.push({
    s: path(ss.map(P), rs), m: r === 3 ? 'ebony' : 'wood', sh: { k: 'soft', r: 1.6 },
    // (the finest: a line of gold inlaid down its belly)
    marks: r === 3 ? [-11, -8, -5, 5, 8, 11].map((s) => ({ a: add(P(s), mul(nrm, 0.5)), b: add(P(s + 2.2), mul(nrm, 0.5)), t: INLAY })) : [],
  });
  // the tips, capped in horn, or in gold
  for (const s of [-14.6, 14.6]) parts.push({ s: ell(P(s), 1.35), m: r >= 2 ? 'gold' : 'ivory', sh: { k: 'dome', c: P(s), r: 1.35 }, shine: true });
  if (r === 3) for (const s of [-14.6, 14.6]) parts.push(gem(P(s), 0.75, 'amber'));
  const g = P(0);
  parts.push({
    s: cap(add(g, mul(d, -2.8)), add(g, mul(d, 2.8)), 2.4), m: r === 0 ? 'leather' : r === 1 ? 'blue' : 'red', sh: { k: 'cyl', a: add(g, mul(d, -3)), b: add(g, mul(d, 3)), w: 2.0 },
    marks: [-1.6, 0, 1.6].map((s) => ({ a: add(add(g, mul(d, s)), mul(nrm, 2)), b: add(add(g, mul(d, s + 0.6)), mul(nrm, -2)), t: 0 })),
  });
  if (r >= 2) for (const s of [-3.0, 3.0]) parts.push({ s: cap(add(add(g, mul(d, s)), mul(nrm, 2.4)), add(add(g, mul(d, s)), mul(nrm, -2.4)), 0.75), m: 'gold', sh: { k: 'cyl', a: add(g, mul(d, s - 1)), b: add(g, mul(d, s + 1)), w: 0.8 }, shine: true });
  if (STONE[r]) parts.push(gem(add(g, mul(nrm, 0.6)), r === 1 ? 1.1 : 1.25, STONE[r]!));
  return parts;
}

/** A short wand: a rod with a collar holding a pointed crystal. */
function wand(r: Rar): Part[] {
  const A: V = [5.8, 26.2];
  const K: V = at(A, UP, 15.2, 0);
  const parts: Part[] = [];
  parts.push({
    s: cap(A, K, 1.75, 1.3), m: r === 0 ? 'wood' : r === 3 ? 'ebony' : 'ivory', sh: { k: 'cyl', a: A, b: K, w: 1.6 },
    // (carved rings round it; the finest, a gold spiral)
    marks: [3, 5.5, 8, 10.5].map((t) => ({ a: at(A, UP, t, -1.4), b: at(A, UP, t + 1.4, 1.4), t: r === 3 ? INLAY : 1 })),
  });
  parts.push({ s: ell(A, 2.3), m: TRIM(r), sh: { k: 'dome', c: A, r: 2.3 }, shine: true });
  if (STONE[r]) parts.push(gem(A, 1.2, STONE[r]!));
  parts.push({ s: cap(at(K, UP, -1.6, 0), at(K, UP, 0.8, 0), 2.3), m: TRIM(r), sh: { k: 'cyl', a: at(K, UP, 0, -2.3), b: at(K, UP, 0, 2.3), w: 2.3 }, shine: true });
  const tip = at(K, UP, 10.2, 0);
  const crystal = poly(at(K, UP, 0.6, -2.2), at(K, UP, 5.0, -3.3), tip, at(K, UP, 5.0, 3.3), at(K, UP, 0.6, 2.2));
  parts.push({
    s: crystal, m: 'violet', sh: { k: 'ridge', a: K, b: tip, tilt: 0.5 }, shine: true,
    marks: [{ a: at(K, UP, 2.4, -1), b: at(K, UP, 5.6, -1.4), t: 4 }],
  });
  // (gold claws up the crystal's sides, and stones in the collar)
  if (r >= 2) for (const sg of [-1, 1]) parts.push({ s: path([at(K, UP, 0.4, sg * 2.2), at(K, UP, 2.8, sg * 3.2), at(K, UP, 4.6, sg * 2.6)], [0.9, 0.8, 0.55]), m: 'gold', sh: { k: 'soft', r: 1 }, shine: true });
  if (r === 3) parts.push(gem(at(K, UP, -0.4, 0), 1.0, 'amber'));
  return parts;
}

/** A long gnarled staff, its head two wooden prongs gripping a big crystal. */
function staff(r: Rar): Part[] {
  const orb: V = [23.2, 8.8];
  const wood: Mat = r === 3 ? 'ebony' : 'wood';
  const parts: Part[] = [];
  const shaft: V[] = [[3.4, 29.4], [7.4, 25.8], [10.4, 22.2], [14.2, 18.8], [17.2, 15.2], [19.6, 13.0]];
  parts.push({ s: path(shaft, [1.7, 1.9, 1.8, 2.0, 1.9, 2.1]), m: wood, sh: { k: 'soft', r: 1.5 }, marks: [{ a: [9, 24.2], t: 0 }, { a: [15.4, 17.8], t: 0 }, { a: [6.2, 27.4], b: [8.2, 25.6], t: 3 }] });
  if (r >= 2) parts.push({ s: cap([4.0, 28.8], [5.6, 27.2], 1.85), m: 'gold', sh: { k: 'cyl', a: [4, 28.8], b: [5.6, 27.2], w: 1.85 }, shine: true });
  parts.push({ s: ell(orb, 4.3), m: 'violet', sh: { k: 'dome', c: orb, r: 4.3 }, shine: true });
  // the two prongs round the crystal (gilded on the finest)
  const pm: Mat = r === 3 ? 'gold' : wood;
  parts.push({ s: path([[19.4, 13.2], [17.6, 9.6], [18.2, 5.6], [21.0, 3.4], [24.4, 3.6]], [1.6, 1.4, 1.2, 1.0, 0.7]), m: pm, sh: { k: 'soft', r: 1.4 }, shine: r === 3 });
  parts.push({ s: path([[19.6, 13.0], [23.0, 14.2], [27.0, 12.6], [28.8, 9.4], [28.4, 6.2]], [1.6, 1.4, 1.2, 1.0, 0.7]), m: pm, sh: { k: 'soft', r: 1.4 }, shine: r === 3 });
  if (r === 2) for (const p of [[24.4, 3.6], [28.4, 6.2]] as V[]) parts.push({ s: ell(p, 1.0), m: 'gold', sh: { k: 'dome', c: p, r: 1 }, shine: true });
  // a band where the head meets the shaft: iron, or gold
  parts.push({ s: cap([17.4, 15.4], [19.8, 12.8], 2.0), m: TRIM(r), sh: { k: 'cyl', a: [17.4, 15.4], b: [19.8, 12.8], w: 2 }, shine: true });
  if (r === 1) {
    // a blue ribbon tied under the band, its ends hanging
    parts.push({ s: path([[16.8, 16.4], [15.0, 19.2], [15.6, 22.4]], [0.9, 0.8, 0.6]), m: 'blue', sh: { k: 'soft', r: 1 } });
    parts.push({ s: path([[16.8, 16.4], [17.8, 19.6], [17.2, 21.4]], [0.8, 0.7, 0.5]), m: 'blue', sh: { k: 'soft', r: 1 }, bias: -0.15 });
  }
  if (STONE[r]) parts.push(gem([18.6, 14.1], 1.15, STONE[r]!));
  if (r === 3) for (const p of [[24.4, 3.6], [28.4, 6.2]] as V[]) parts.push(gem(p, 1.05, 'amber'));
  return parts;
}

/** THE VETERAN'S WRAPS: a pair of fists bound in linen, a plate over the front one's knuckles, a strap over the back one's, the
 * ends trailing loose. A two-handed weapon, so a pair. */
function wraps(r: Rar): Part[] {
  const parts: Part[] = [];
  // (linen; the finest dyed deep red and gilded)
  const cloth: Mat = r === 3 ? 'red' : 'linen';
  const plateM: Mat = r >= 2 ? 'gold' : 'steel';
  // a fist seen from the front, knuckles up, in its own frame: (0, 0) the middle of the fist, `k` times its size, turned by `deg`
  const fist = (cx: number, cy: number, k: number, deg: number, plate: boolean, back: boolean): void => {
    const rad = (deg * Math.PI) / 180;
    const t = (p: V): V => [cx + k * (p[0] * Math.cos(rad) - p[1] * Math.sin(rad)), cy + k * (p[0] * Math.sin(rad) + p[1] * Math.cos(rad))];
    const tp = (ps: V[]): V[] => ps.map(t);
    const b = back ? -0.2 : 0;
    // the loose end, trailing from the wrist
    parts.push({ s: path(tp([[-2.6, 7.4], [-5.2, 9.2], [-5.4, 11.6]]), [1.0 * k, 0.9 * k, 0.7 * k]), m: r === 1 ? 'blue' : cloth, sh: { k: 'soft', r: 1 }, bias: b - 0.12 });
    // the wrist and forearm, bound round and round
    parts.push({
      s: cap(t([0, 4]), t([0.3, 9.4]), 3.9 * k, 3.6 * k), m: cloth, sh: { k: 'cyl', a: t([0, 4]), b: t([0.3, 9.4]), w: 3.8 * k }, bias: b - 0.05,
      marks: [6.4, 8.4].map((y) => ({ a: t([-3.8, y]), b: t([3.8, y - 1.6]), t: 1 })),
    });
    // (a band round the wrist: blue, or gold)
    if (r >= 1) parts.push({ s: path(tp([[-3.9, 7.6], [0, 6.6], [3.9, 6.0]]), [0.8 * k, 0.8 * k, 0.8 * k]), m: r === 1 ? 'blue' : 'gold', sh: { k: 'soft', r: 1 }, shine: r >= 2, bias: b });
    // the back of the fist, behind the fingers
    parts.push({ s: poly(...tp([[-6.4, -3.0], [6.4, -3.0], [6.2, 4.8], [4.6, 6.4], [-4.6, 6.4], [-6.4, 4.6]])), m: cloth, sh: { k: 'soft', r: 2.4 }, bias: b - 0.1 });
    // the four fingers, rolled under: their middle bones toward you, side by side
    [-4.8, -1.6, 1.6, 4.8].forEach((x, i) => {
      const top = i === 1 || i === 2 ? -4.6 : -3.9;
      // (the wrapping's turns round each)
      parts.push({ s: cap(t([x, top]), t([x, 2.2]), 1.62 * k), m: cloth, sh: { k: 'cyl', a: t([x - 1, 0]), b: t([x + 1, 0]), w: 1.7 * k }, bias: b + 0.04, marks: [{ a: t([x - 1.4, -0.4]), b: t([x + 1.4, 0.4]), t: 1 }] });
    });
    // the thumb, folded across their foot
    parts.push({ s: cap(t([-6.3, 4.4]), t([1.4, 3.4]), 1.7 * k), m: cloth, sh: { k: 'cyl', a: t([-6, 4.4]), b: t([1.4, 3.4]), w: 1.7 * k }, bias: b + 0.1 });
    if (plate) {
      // the front fist: studs on its knuckles (none on the plainest): steel, a blue stone at the middle; gold and a yellow; gold and orange
      if (r >= 1) [-4.8, -1.6, 1.6, 4.8].forEach((x, i) => {
        const st = (i === 1 || i === 2) ? STONE[r]! : plateM;
        parts.push(st === plateM ? stud(t([x, -3.4]), 1.0 * k, st) : { ...gem(t([x, -3.4]), 1.05 * k, st), flush: true });
      });
    } else {
      // the back fist: a strap across its fingers: leather, blue, dark with a gold stud, or gold with an orange stone
      parts.push({ s: path(tp([[-6.6, -1.2], [0, -1.6], [6.6, -1.2]]), [1.0 * k, 1.05 * k, 1.0 * k]), m: r === 1 ? 'blue' : r === 3 ? 'gold' : 'dleather', sh: { k: 'soft', r: 1 }, bias: b, shine: r === 3 });
      if (r >= 2) parts.push(r === 3 ? { ...gem(t([0, -1.5]), 0.9 * k, 'amber'), flush: true } : stud(t([0, -1.5]), 0.8 * k, 'gold'));
    }
  };
  fist(23.2, 9.4, 0.9, 14, false, true);
  fist(11.8, 15.6, 1.12, -6, true, false);
  return parts;
}

/**
 * THE DEMONIC TOME, the Warlock's: a heavy book standing, bound in the Warlock's dark red leather (his own red book's) and iron, a
 * horned demon's face on its cover, clasps over its pages' edge, the pages edged in the demon's fire. Rarer, more demonic: chains
 * across it; a third eye open on the brow; and the finest blackened and gilded, its eyes burning, a burning sigil under the face.
 */
function tome(r: Rar): Part[] {
  // (drawn on the square, then made a book's shape, narrower than it is tall, and stood leaning a little: not a shield's)
  return squeeze(tomeParts(r), 0.7, 0.86, 12);
}
function tomeParts(r: Rar): Part[] {
  const parts: Part[] = [];
  const cover: Mat = r === 3 ? 'black' : 'bookred';
  const iron: Mat = r >= 2 ? 'gold' : 'steel';
  // the back board, behind; the pages, edged in fire, showing at its right and its foot; the front board
  parts.push({ s: poly([8.4, 4.4], [27.4, 4.0], [27.8, 28.8], [9.0, 29.6]), m: cover, sh: { k: 'flat', bev: 1 }, bias: -0.3 });
  const fireMarks: Mark[] = [];
  for (let y = 5.2; y < 27.6; y += 1.4) fireMarks.push({ a: [26.6, y], t: '#ff8a2c' }, { a: [26.6, y + 0.7], t: '#d8401a' });
  for (let x = 9.8; x < 26; x += 1.4) fireMarks.push({ a: [x, 28.2], t: '#ff8a2c' }, { a: [x + 0.7, 28.2], t: '#d8401a' });
  parts.push({ s: poly([8.6, 3.6], [26.8, 3.4], [27.0, 28.4], [9.0, 28.8]), m: 'linen', sh: { k: 'flat', bev: 0.6 }, bias: -0.1, marks: [{ a: [25.4, 4.6], b: [25.6, 27.0], t: 1 }, { a: [10.4, 27.6], b: [25.2, 27.4], t: 1 }, ...fireMarks] });
  const front = poly([4.6, 2.6], [24.8, 2.2], [25.2, 26.4], [5.0, 27.4]);
  parts.push({
    s: front, m: cover, sh: { k: 'soft', r: 2.2 },
    // (tooled lines round its edge)
    marks: [{ a: [8.4, 4.8], b: [22.6, 4.4], t: 0 }, { a: [22.8, 4.6], b: [23.0, 24.4], t: 0 }, { a: [8.6, 25.0], b: [22.8, 24.6], t: 0 }],
  });
  // the spine's round, down its left
  parts.push({ s: cap([5.4, 3.4], [5.8, 26.6], 1.9), m: cover, sh: { k: 'cyl', a: [5.4, 3], b: [5.8, 27], w: 1.9 }, bias: 0.05, marks: [{ a: [4.4, 8.0], b: [7.2, 8.0], t: 0 }, { a: [4.4, 21.2], b: [7.4, 21.2], t: 0 }] });
  // iron (or gold) at its corners
  for (const [c, sx, sy] of [[[24.8, 2.2], -1, 1], [[25.2, 26.4], -1, -1]] as [V, number, number][]) {
    parts.push({ s: poly(c, [c[0] + sx * 4.2, c[1]], [c[0], c[1] + sy * 4.2]), m: iron, sh: { k: 'flat', bev: 0.8 }, shine: true });
    if (r === 3) parts.push(gem([c[0] + sx * 1.4, c[1] + sy * 1.4], 0.8, 'amber'));
  }
  // THE DEMON: a horned face raised out of the cover
  const fc: V = [14.6, 13.6];
  const relief: Mat = r >= 2 ? 'gold' : r === 1 ? 'steel' : 'dsteel';
  for (const sx of [-1, 1]) parts.push({ s: path([[fc[0] + sx * 2.6, fc[1] - 2.6], [fc[0] + sx * 5.2, fc[1] - 4.4], [fc[0] + sx * 6.4, fc[1] - 7.6], [fc[0] + sx * 5.4, fc[1] - 9.6]], [1.4, 1.2, 0.9, 0.5]), m: r === 0 ? 'ivory' : relief, sh: { k: 'soft', r: 1.2 }, shine: true, bias: sx < 0 ? 0.1 : -0.05 });
  parts.push({
    s: poly([fc[0] - 4.0, fc[1] - 3.4], [fc[0], fc[1] - 4.6], [fc[0] + 4.0, fc[1] - 3.4], [fc[0] + 4.2, fc[1] + 1.4], [fc[0] + 2.2, fc[1] + 5.4], [fc[0], fc[1] + 6.4], [fc[0] - 2.2, fc[1] + 5.4], [fc[0] - 4.2, fc[1] + 1.4]),
    m: relief, sh: { k: 'dome', c: [fc[0] - 0.6, fc[1] - 0.6], r: 5.4, ry: 6 }, shine: true, bias: r === 0 ? 0.12 : 0,
    // (its fanged mouth, its brow)
    marks: [{ a: [fc[0] - 2.0, fc[1] + 3.4], b: [fc[0] + 2.0, fc[1] + 3.4], t: 0 }, { a: [fc[0] - 1.0, fc[1] + 3.4], b: [fc[0] - 0.8, fc[1] + 4.4], t: 3 }, { a: [fc[0] + 1.0, fc[1] + 3.4], b: [fc[0] + 0.8, fc[1] + 4.4], t: 3 }, { a: [fc[0] - 2.6, fc[1] - 2.4], b: [fc[0] - 0.6, fc[1] - 1.4], t: 1 }, { a: [fc[0] + 2.6, fc[1] - 2.4], b: [fc[0] + 0.6, fc[1] - 1.4], t: 1 }],
  });
  // its eyes: slits, dark; burning in the finest
  for (const sx of [-1, 1]) parts.push({ s: poly([fc[0] + sx * 0.6, fc[1] - 0.4], [fc[0] + sx * 3.0, fc[1] - 1.4], [fc[0] + sx * 2.6, fc[1] + 0.4], [fc[0] + sx * 1.0, fc[1] + 0.6]), m: r === 3 ? 'fire' : 'shadow', sh: { k: 'flat' }, shine: r === 3, bias: 0.5 });
  if (r >= 2) {
    // a third eye, open on its brow: yellow, its pupil a slit (orange on the finest)
    parts.push({ s: ell([fc[0], fc[1] - 2.6], 1.5, 1.0), m: r === 3 ? 'amber' : 'topaz', sh: { k: 'dome', c: [fc[0], fc[1] - 2.6], r: 1.5, ry: 1 }, shine: true, marks: [{ a: [fc[0], fc[1] - 3.4], b: [fc[0], fc[1] - 1.8], t: 0 }] });
  }
  if (r === 3) {
    // a burning sigil under the face: a ring and its cross-strokes, in fire
    const sc: V = [14.8, 22.8];
    parts.push({ s: ell(sc, 2.4, 1.6), cut: [ell(sc, 1.5, 0.8)], m: 'fire', sh: { k: 'flat' }, shine: true, flush: true, bias: 0.4 });
    parts.push({ s: path([[sc[0] - 3.2, sc[1] + 1.0], [sc[0], sc[1] - 1.8], [sc[0] + 3.2, sc[1] + 1.0]], [0.5, 0.5, 0.5]), m: 'fire', sh: { k: 'flat' }, shine: true, flush: true, bias: 0.6 });
  }
  if (r === 1 || r === 3) {
    // a chain across the cover and round the book, its links
    const ch: V[] = [[3.6, 17.6], [14.6, 19.6], [26.4, 18.2]];
    const links: Mark[] = [];
    for (let i = 0; i + 1 < ch.length; i++) for (let t = 0; t < 1; t += 0.18) links.push({ a: lerp(ch[i], ch[i + 1], t), t: 4 }, { a: lerp(ch[i], ch[i + 1], t + 0.09), t: 1 });
    parts.push({ s: path(ch, [0.9, 0.9, 0.9]), m: r === 3 ? 'gold' : 'steel', sh: { k: 'flat' }, shine: true, marks: links });
  }
  // a ribbon marker hanging out of its foot, forked
  parts.push({ s: poly([17.0, 27.0], [19.4, 26.8], [20.2, 31.8], [18.8, 30.6], [17.6, 32.0]), m: r === 1 ? 'blue' : r === 3 ? 'gold' : 'red', sh: { k: 'flat', bev: 0.8 }, shine: r === 3, bias: -0.1 });
  // the clasps, over the pages' edge
  for (const y of [7.4, 21.8]) {
    parts.push({ s: poly([21.6, y - 1.2], [27.8, y - 1.1], [28.4, y], [27.8, y + 1.1], [21.6, y + 1.2]), m: iron, sh: { k: 'flat', bev: 0.8 }, shine: true });
    parts.push(STONE[r] ? gem([26.0, y], 0.95, STONE[r]!) : stud([26.0, y], 0.7, 'steel'));
  }
  if (r >= 2) {
    // fire licking up out of the pages' edge
    for (const [x, y, h] of (r === 3 ? [[27.6, 12.4, 3.0], [27.8, 16.4, 2.4], [27.6, 25.0, 2.6]] : [[27.6, 14.4, 2.2]]) as [number, number, number][]) {
      parts.push({ s: path([[x - 0.6, y + 1.2], [x + 0.8, y], [x + 1.2 + h * 0.3, y - h]], [0.9, 0.7, 0.3]), m: 'fire', sh: { k: 'flat' }, shine: true, bias: 0.3 });
    }
  }
  return parts;
}

/** THE TINKERER'S WRENCH: her big wrench (dev/sculpt_tinkerer.ts, `wrenchIn`: a steel shaft, a broad jaw with its gap), on the
 * diagonal, its grip at the bottom left. Rarer: gears, a gauge, rivets; the finest blackened and gilded round a glowing core. */
function wrench(r: Rar): Part[] {
  const parts: Part[] = [];
  const steel: Mat = r === 3 ? 'dsteel' : 'steel';
  const G: V = [7.2, 24.8];
  const H: V = at(G, UP, 19.6, 0); // the middle of its jaw
  // the shaft, thick, tapering toward the grip
  parts.push({ s: cap(at(G, UP, -2.8, 0), at(H, UP, -3, 0), 1.75, 2.1), m: steel, sh: { k: 'ridge', a: G, b: H, tilt: 0.3 }, shine: true, marks: [{ a: at(G, UP, 4, -0.9), b: at(H, UP, -5, -1.0), t: r === 3 ? INLAY : 3 }] });
  // the jaw: a broad head, its gap open toward the upper right
  const jaw: Shape = poly(at(H, UP, -4.4, -2.6), at(H, UP, -2.2, -5.2), at(H, UP, 1.6, -5.6), at(H, UP, 4.8, -4.4), at(H, UP, 5.6, -2.2), at(H, UP, 3.4, -1.8), at(H, UP, 3.0, 1.8), at(H, UP, 5.6, 2.2), at(H, UP, 4.8, 4.4), at(H, UP, 1.6, 5.6), at(H, UP, -2.2, 5.2), at(H, UP, -4.4, 2.6));
  parts.push({
    s: jaw, cut: [ell(at(H, UP, 1.2, 0), 1.9, 1.9)], m: steel, sh: { k: 'soft', r: 2.2 }, shine: true,
    marks: [{ a: at(H, UP, -1.8, -4.4), b: at(H, UP, 2.4, -4.6), t: r === 3 ? INLAY : 4 }],
  });
  // the grip, wrapped
  parts.push({ s: cap(at(G, UP, -3.2, 0), at(G, UP, 2.8, 0), 2.2), m: r === 1 ? 'blue' : r === 3 ? 'red' : 'leather', sh: { k: 'cyl', a: at(G, UP, 0, -2), b: at(G, UP, 0, 2), w: 2.2 }, bias: 0.12, marks: [-1.6, 0.2, 2.0].map((d) => ({ a: at(G, UP, d, -2.2), b: at(G, UP, d + 0.9, 2.2), t: 1 })) });
  parts.push({ s: ell(at(G, UP, -3.8, 0), 2.0), m: r >= 2 ? 'gold' : steel, sh: { k: 'dome', c: at(G, UP, -3.8, 0), r: 2 }, shine: true });
  // rivets on its jaw
  for (const a of [-1, 1]) parts.push(stud(at(H, UP, -2.6, a * 3.2), 0.7, r === 3 ? 'gold' : r === 2 ? 'gold' : 'steel'));
  if (r >= 1) {
    // a gear at its throat, turning (brass; gold on the finer)
    parts.push(cog(at(H, UP, -6.2, -2.8), r >= 2 ? 2.7 : 2.4, 6, r >= 2 ? 'gold' : 'brass'));
  }
  if (r >= 2) {
    // a gauge on the shaft: a gold bezel, its pale face, a red needle
    const gc = at(G, UP, 8.4, 2.0);
    parts.push({ s: ell(gc, 2.5), m: 'gold', sh: { k: 'dome', c: gc, r: 2.5 }, shine: true });
    parts.push({ s: ell(gc, 1.65), m: 'ivory', sh: { k: 'flat', bev: 0.6 }, flush: true, bias: 0.15, marks: [{ a: gc, b: add(gc, [1.0, -1.1]), t: '#a81e2e' }] });
    parts.push(gem(at(G, UP, 4.6, -0.4), 0.95, STONE[r]!));
  }
  if (r === 3) {
    // a second gear, and the glowing core set in its jaw
    parts.push(cog(at(G, UP, 12.6, -2.6), 1.9, 5, 'gold', 0.3));
    const cc = at(H, UP, -1.6, 0);
    parts.push({ s: ell(cc, 1.9), m: 'gold', sh: { k: 'dome', c: cc, r: 1.9 }, shine: true });
    parts.push({ s: ell(cc, 1.25), m: 'core', sh: { k: 'dome', c: cc, r: 1.25 }, shine: true, flush: true, bias: 0.35 });
    parts.push(gem(at(H, UP, -2.6, -3.2), 0.8, 'amber'), gem(at(H, UP, -2.6, 3.2), 0.8, 'amber'));
  }
  return parts;
}

/** A heater shield, seen from the front: a rim round its field, a chevron, a boss. */
function shield(r: Rar): Part[] {
  const rim: V[] = [[4.6, 4.8], [16, 3.0], [27.4, 4.8], [27.6, 12.4], [26.0, 19.0], [22.2, 24.6], [16, 29.6], [9.8, 24.6], [6.0, 19.0], [4.4, 12.4]];
  const outer = poly(...rim);
  const sc = (p: V): V => [16 + (p[0] - 16) * 0.82, 15.4 + (p[1] - 15.4) * 0.84];
  const inner = poly(...rim.map(sc));
  const parts: Part[] = [];
  parts.push({ s: outer, m: r === 3 ? 'gold' : 'steel', sh: { k: 'soft', r: 2 }, shine: true });
  // the field: bare planks; blue; red; blackened
  const field: Mat = r === 0 ? 'wood' : r === 1 ? 'blue' : r === 2 ? 'red' : 'dsteel';
  parts.push({ s: inner, m: field, sh: { k: 'soft', r: 5 }, shine: r === 3, marks: r === 0 ? [11.2, 16, 20.8].map((x) => ({ a: [x, 5.4] as V, b: [x, 27.0] as V, t: 0 })) : [] });
  if (r >= 1) parts.push({ s: poly([7.0, 17.2], [16, 9.8], [25.0, 17.2], [25.0, 20.8], [16, 13.6], [7.0, 20.8]), m: r === 1 ? 'steel' : 'gold', sh: { k: 'flat', bev: 1 }, shine: true });
  // the boss
  parts.push({ s: ell([16, 9.0], 2.4), m: r >= 2 ? 'gold' : 'steel', sh: { k: 'dome', c: [16, 9.0], r: 2.4 }, shine: true });
  if (STONE[r]) parts.push(gem([16, 9.0], 1.35, STONE[r]!));
  for (const p of [[7.0, 6.8], [25.0, 6.8], [16, 26.6]] as V[]) parts.push(r === 3 ? { ...gem(p, 0.95, 'amber'), flush: true } : stud(p, 0.8, r === 2 ? 'gold' : 'steel'));
  if (r === 3) for (const p of [[7.6, 19.0], [24.4, 19.0]] as V[]) parts.push({ ...gem(p, 0.9, 'amber'), flush: true });
  return parts;
}

/** A leather quiver leaning to the right, three arrows' fletching out of its mouth, its strap looped at its side. */
function quiver(r: Rar): Part[] {
  const B: V = [11.8, 27.4], T: V = [19.4, 11.0];
  const u = unit(sub(T, B));
  const parts: Part[] = [];
  const fl: Mat[] = r === 0 ? ['feather', 'feather', 'feather'] : r === 1 ? ['blue', 'feather', 'blue'] : r === 2 ? ['red', 'feather', 'red'] : ['red', 'black', 'red'];
  // arrows first (their shafts go down into it)
  const tips: V[] = [[15.4, 2.6], [20.6, 3.0], [25.4, 5.4]];
  tips.forEach((tip, i) => {
    const base = at(T, u, -2, -1.6 + i * 1.6);
    parts.push({ s: cap(base, tip, 0.6), m: r === 3 ? 'ebony' : 'wood', sh: { k: 'flat' } });
    const v = unit(sub(tip, base));
    const f0 = at(tip, v, -0.4, 0), f1 = at(tip, v, -6.2, 0);
    parts.push({ s: poly(at(f0, v, 0, -0.5), at(f0, v, -1.8, -2.5), at(f1, v, 0, -2.5), at(f1, v, -0.8, 0), at(f1, v, 0, 2.5), at(f0, v, -1.8, 2.5), at(f0, v, 0, 0.5)), m: fl[i], sh: { k: 'ridge', a: f1, b: f0, tilt: 0.3 } });
  });
  const body: Mat = r === 3 ? 'black' : 'leather';
  parts.push({
    s: cap(B, T, 3.0, 3.6), m: body, sh: { k: 'cyl', a: B, b: T, w: 3.4 }, bias: r === 3 ? 0.3 : 0.14,
    // (a seam down it; the finer, tooled lines in gold)
    marks: [{ a: at(B, u, 2, -1.8), b: at(T, u, -3, -2.2), t: r === 3 ? INLAY : r === 2 ? '#d0902c' : 1 }],
  });
  const fit: Mat = r >= 2 ? 'gold' : r === 1 ? 'steel' : 'brass';
  parts.push({ s: cap(at(T, u, -0.8, 0), at(T, u, 0.9, 0), 4.0), m: fit, sh: { k: 'cyl', a: at(T, u, 0, -4), b: at(T, u, 0, 4), w: 4 }, shine: true });
  parts.push({ s: ell(at(T, u, 1.0, 0), 3.1, 1.4, -48), m: 'shadow', sh: { k: 'flat' }, flush: true });
  parts.push({ s: cap(at(B, u, 0.4, 0), at(B, u, 2.0, 0), 3.3), m: r === 3 ? 'gold' : 'dleather', sh: { k: 'cyl', a: at(B, u, 1, -3), b: at(B, u, 1, 3), w: 3 }, shine: r === 3 });
  // the strap, looped out at its left
  parts.push({ s: path([at(T, u, -2.2, -3.4), at(T, u, -6, -6.4), at(B, u, 6, -6.6), at(B, u, 2.6, -3.4)], [0.8, 0.9, 0.9, 0.8]), m: r === 1 ? 'blue' : 'dleather', sh: { k: 'soft', r: 1 } });
  if (STONE[r]) parts.push(gem(at(B, u, 8.4, 0.4), r === 1 ? 1.2 : 1.4, STONE[r]!));
  return parts;
}

/** A crystal focus: a six-sided crystal standing in a cradle on a short handle. */
function focus(r: Rar): Part[] {
  const parts: Part[] = [];
  const cradle: Mat = r === 3 ? 'dsteel' : TRIM(r);
  const claw: Mat = r >= 2 ? 'gold' : 'steel';
  parts.push({ s: cap([16, 22.6], [16, 28.0], 1.5), m: r === 3 ? 'ebony' : 'wood', sh: { k: 'cyl', a: [16, 22], b: [16, 28], w: 1.5 } });
  parts.push({ s: ell([16, 28.6], 2.6, 1.7), m: claw, sh: { k: 'dome', c: [16, 28.4], r: 2.6, ry: 1.7 }, shine: true });
  // the crystal: three faces, lit, middle, shaded, and its point
  const top: V = [16, 2.2];
  parts.push({ s: poly([11.0, 9.2], top, [16, 10.4], [16, 22.6], [11.0, 19.4]), m: 'teal', sh: { k: 'face', n: [-0.55, -0.2] }, shine: true });
  parts.push({ s: poly(top, [21.0, 9.2], [21.0, 19.4], [16, 22.6], [16, 10.4]), m: 'teal', sh: { k: 'face', n: [0.5, 0.1] }, shine: true, flush: true });
  parts.push({ s: poly([13.6, 10.6], top, [18.4, 10.6], [18.4, 21.0], [16, 22.4], [13.6, 21.0]), m: 'teal', sh: { k: 'face', n: [-0.1, -0.15] }, shine: true, flush: true, marks: [{ a: [14.6, 12], b: [14.6, 17], t: 4 }] });
  // the cradle: a band round its foot and claws up its sides (taller on the finer)
  parts.push({ s: poly([9.6, 17.8], [22.4, 17.8], [21.4, 21.2], [16, 23.6], [10.6, 21.2]), m: cradle, sh: { k: 'soft', r: 2 }, shine: true, marks: r === 3 ? [{ a: [10.4, 18.8], b: [21.6, 18.8], t: INLAY }] : [] });
  const hi = r >= 2 ? 8.8 : 11.8;
  for (const sx of [-1, 1]) parts.push({ s: path([[16 + sx * 5.4, 18.6], [16 + sx * 6.2, 14.6], [16 + sx * 5.0, hi]], [1.1, 0.9, 0.6]), m: claw, sh: { k: 'soft', r: 1 }, shine: true });
  if (r === 3) for (const sx of [-1, 1]) parts.push(gem([16 + sx * 6.1, 14.6], 0.85, 'amber'));
  if (STONE[r]) parts.push(gem([16, 20.2], 1.3, STONE[r]!));
  return parts;
}

/** A knight's helmet turned a little to the left: a T-slit, a ridge over the top, a crest. */
function helm(r: Rar): Part[] {
  const parts: Part[] = [];
  const shellM: Mat = r === 3 ? 'dsteel' : 'steel';
  // the crest, behind: horsehair, blue, red
  parts.push({ s: path([[11.4, 6.2], [16.0, 3.4], [22.0, 3.2], [27.0, 5.2], [29.0, 9.6], [29.0, 13.6]], [1.8, 2.0, 2.0, 1.9, 1.5, 1.0]), m: r === 0 ? 'leather' : r === 1 ? 'blue' : 'red', sh: { k: 'soft', r: 2 }, marks: [{ a: [16, 2.6], b: [26, 4.6], t: 3 }, { a: [25, 6], b: [28, 11], t: 1 }] });
  const shell = poly([8.0, 13.0], [9.4, 8.0], [12.8, 5.0], [17.0, 4.0], [21.4, 5.4], [24.4, 9.2], [25.4, 14.6], [26.4, 22.6], [25.0, 26.8], [21.0, 27.6], [12.6, 28.2], [9.2, 27.0], [7.8, 21.0]);
  parts.push({
    s: shell, m: shellM, sh: { k: 'soft', r: 4.5 }, shine: true,
    marks: [{ a: [13.0, 5.0], b: [11.0, 12.0], t: 4 }, { a: [8.4, 24.4], t: 3 }, { a: [24.8, 24.6], t: 1 }, { a: [24.6, 12.4], t: 1 }, ...(r === 3 ? [{ a: [8.6, 26.4], b: [24.6, 26.0], t: INLAY } as Mark, { a: [21.6, 6.2], b: [24.6, 11.4], t: INLAY } as Mark] : [])],
  });
  // the ridge over its top, down to the brow: steel, or gold
  parts.push({ s: path([[16.4, 4.0], [15.2, 8.0], [14.4, 12.4]], [1.0, 1.0, 1.0]), m: r >= 2 ? 'gold' : shellM, sh: { k: 'cyl', a: [16.4, 4], b: [14.4, 12.4], w: 1 }, shine: true, flush: true, bias: 0.15 });
  // the T: the eye slit across, the breathing slit down
  parts.push({ s: poly([8.2, 13.4], [22.0, 13.2], [21.8, 15.6], [16.2, 15.8], [16.2, 23.4], [13.6, 23.4], [13.6, 15.8], [8.4, 15.8]), m: 'shadow', sh: { k: 'flat' } });
  // (the finer: a gold band over the brow, round the slit)
  if (r >= 2) parts.push({ s: path([[8.4, 12.2], [15.2, 11.8], [22.6, 12.0]], [0.75, 0.75, 0.75]), m: 'gold', sh: { k: 'flat', bev: 0.6 }, shine: true });
  for (const p of [[10.6, 19.6], [19.6, 19.6], [21.2, 24.0], [10.8, 24.6]] as V[]) parts.push(r === 3 && (p[1] < 20) ? { ...gem(p, 0.9, 'amber'), flush: true } : stud(p, 0.75, r >= 2 ? 'gold' : r === 1 ? 'steel' : 'brass'));
  if (STONE[r]) parts.push(gem([14.9, 10.8], r === 1 ? 1.1 : 1.3, STONE[r]!));
  return parts;
}

/** A cloth hood with its point drooping back and a short cape over the shoulders, its face in shadow. */
function hood(r: Rar): Part[] {
  const parts: Part[] = [];
  const cloth: Mat = r === 3 ? 'black' : 'green';
  const hem: V[] = [[30.4, 29.4], [22.0, 28.6], [16, 29.6], [10.0, 28.6], [1.6, 29.4]];
  parts.push({
    s: poly([5.6, 21.0], [7.6, 13.0], [10.4, 7.0], [14.6, 3.4], [19.6, 2.0], [24.6, 2.6], [28.4, 4.8], [30.4, 9.6], [30.6, 16.4], [29.4, 17.0], [28.0, 11.6], [25.4, 8.8], [25.6, 15.6], [26.6, 21.0], [30.4, 25.4], ...hem, [1.6, 25.4]),
    m: cloth, sh: { k: 'soft', r: 4.5 }, bias: r === 3 ? 0.12 : 0,
    // (folds; on the finer, a gold-stitched hem, and on the finest gold along the cape's edge)
    marks: [{ a: [8.4, 24], b: [11.4, 28.4], t: 1 }, { a: [23.6, 24], b: [21.4, 28.4], t: 1 }, { a: [12.6, 5.6], b: [9.4, 11.6], t: 3 }, ...(r >= 2 ? [{ a: [2.4, 28.4], b: [10.0, 27.8], t: '#d0902c' }, { a: [10.0, 27.8], b: [16, 28.8], t: '#d0902c' }, { a: [16, 28.8], b: [22.0, 27.8], t: '#d0902c' }, { a: [22.0, 27.8], b: [29.6, 28.4], t: '#d0902c' }] as Mark[] : [])],
  });
  // the face opening: an edge round the shadow, leather, blue, or gold
  parts.push({ s: ell([15.4, 15.4], 6.6, 8.0, -6), m: r === 0 ? 'leather' : r === 1 ? 'blue' : 'gold', sh: { k: 'soft', r: 2 }, shine: r >= 2 });
  parts.push({ s: ell([15.6, 15.8], 5.0, 6.6, -6), m: 'shadow', sh: { k: 'flat' }, marks: [{ a: [13.0, 15.6], t: r === 3 ? '#d8401a' : 2 }, { a: [17.6, 15.6], t: r === 3 ? '#d8401a' : 2 }] });
  // the cape's fold at the chin, and its clasp
  parts.push({ s: poly([9.4, 22.4], [15.6, 25.2], [21.6, 22.4], [20.4, 26.0], [15.6, 27.6], [10.8, 26.0]), m: cloth, sh: { k: 'soft', r: 2 }, bias: 0.05 });
  parts.push({ s: ell([15.6, 25.0], 1.9), m: TRIM(r), sh: { k: 'dome', c: [15.6, 25.0], r: 1.9 }, shine: true });
  if (STONE[r]) parts.push(gem([15.6, 25.0], 1.15, STONE[r]!));
  return parts;
}

/** A breastplate with shoulder plates, a fauld of two bands, and a belt. */
function armor(r: Rar): Part[] {
  const parts: Part[] = [];
  const plate: Mat = r === 3 ? 'dsteel' : 'steel';
  const trim = r >= 2 ? (r === 3 ? INLAY : '#d0902c') : null;
  parts.push({ s: poly([9.2, 22.4], [22.8, 22.4], [24.6, 26.4], [16, 27.4], [7.4, 26.4]), m: plate, sh: { k: 'soft', r: 1.6 }, shine: true });
  parts.push({ s: poly([8.4, 25.6], [23.6, 25.6], [25.6, 29.4], [16, 30.4], [6.4, 29.4]), m: plate, sh: { k: 'soft', r: 1.6 }, shine: true, bias: -0.08, marks: trim ? [{ a: [7.2, 29.0], b: [16, 30.0], t: trim }, { a: [16, 30.0], b: [24.8, 29.0], t: trim }] : [] });
  parts.push({
    s: poly([8.4, 7.4], [12.6, 6.0], [16, 9.4], [19.4, 6.0], [23.6, 7.4], [25.0, 13.4], [23.6, 20.4], [16, 23.4], [8.4, 20.4], [7.0, 13.4]),
    m: plate, sh: { k: 'ridge', a: [16, 9], b: [16, 23], tilt: 0.3 }, shine: true,
    marks: [...(trim ? [{ a: [12.6, 6.4], b: [16, 9.6], t: '#f6cc5c' }, { a: [16, 9.6], b: [19.4, 6.4], t: '#d0902c' }] as Mark[] : []), { a: [11.0, 11.6], b: [11.6, 16.0], t: 4 }],
  });
  parts.push({ s: cap([16, 9.6], [16, 22.4], 0.7), m: r === 3 ? 'gold' : plate, sh: { k: 'flat' }, flush: true, bias: 0.1, shine: r === 3 });
  for (const sx of [-1, 1]) {
    const c: V = [16 + sx * 9.8, 8.6];
    const pauldron: V[] = [[c[0] - 5 * sx, c[1] + 4.4], [c[0] - 4.4 * sx, c[1] - 1.8], [c[0] - 1.4 * sx, c[1] - 4.2], [c[0] + 2.6 * sx, c[1] - 3.6], [c[0] + 4.6 * sx, c[1] + 0.4], [c[0] + 3.4 * sx, c[1] + 3.6], [c[0] + 0.2 * sx, c[1] + 2.4]];
    parts.push({ s: poly(...pauldron), m: plate, sh: { k: 'dome', c: [c[0] - sx * 0.6, c[1] - 0.6], r: 5.2 }, shine: true, marks: trim ? [{ a: [c[0] - 4.2 * sx, c[1] + 3.2], b: [c[0] + 3 * sx, c[1] + 3.2], t: trim }] : r === 1 ? [{ a: [c[0] - 4.2 * sx, c[1] + 3.2], b: [c[0] + 3 * sx, c[1] + 3.2], t: '#4a74e0' }] : [] });
    if (r === 3) parts.push(gem([c[0] - 0.4 * sx, c[1] - 0.6], 1.0, 'amber'));
  }
  // the belt: leather, blue, red
  parts.push({ s: poly([7.6, 19.8], [24.4, 19.8], [24.0, 22.4], [8.0, 22.4]), m: r === 1 ? 'blue' : r >= 2 ? 'red' : 'leather', sh: { k: 'flat', bev: 1 } });
  parts.push({ s: poly([14.4, 19.4], [17.6, 19.4], [17.6, 22.8], [14.4, 22.8]), cut: [poly([15.4, 20.4], [16.6, 20.4], [16.6, 21.8], [15.4, 21.8])], m: r >= 2 ? 'gold' : 'steel', sh: { k: 'flat', bev: 1 }, shine: true });
  for (const p of [[10.2, 9.4], [21.8, 9.4]] as V[]) parts.push(stud(p, 0.7, r >= 2 ? 'gold' : 'steel'));
  if (STONE[r]) parts.push(gem([16, 13.4], r === 1 ? 1.2 : 1.45, STONE[r]!));
  return parts;
}

/** A long robe, hung up: wide bell sleeves, a flared hem, a band down its front and a sash at the waist. */
function robe(r: Rar): Part[] {
  const parts: Part[] = [];
  const cloth: Mat = r === 3 ? 'black' : 'vcloth';
  const band: Mat = r === 0 ? 'vcloth' : r === 1 ? 'blue' : 'gold';
  const hem: V[] = [[27.6, 30.4], [16, 30.8], [4.4, 30.4]];
  parts.push({ s: poly([11.2, 3.0], [16, 6.4], [20.8, 3.0], [23.4, 4.8], [23.0, 14.0], [24.6, 22.0], ...hem, [7.4, 22.0], [9.0, 14.0], [8.6, 4.8]), m: cloth, sh: { k: 'soft', r: 4 }, bias: r === 3 ? 0.14 : 0, marks: [{ a: [11.4, 18], b: [9.6, 28.6], t: 1 }, { a: [20.8, 18], b: [22.6, 28.6], t: 1 }, { a: [13.2, 22], b: [12.6, 29], t: 2 }] });
  for (const sx of [-1, 1]) {
    const x = (v: number): number => 16 + sx * v;
    parts.push({ s: poly([x(7.4), 4.4], [x(11.8), 8.6], [x(14.8), 17.4], [x(14.6), 21.2], [x(10.4), 21.8], [x(8.2), 15.0], [x(6.6), 9.6]), m: cloth, sh: { k: 'soft', r: 2.5 }, bias: (sx < 0 ? 0.05 : -0.05) + (r === 3 ? 0.14 : 0), marks: [...(r >= 1 ? [{ a: [x(14.4), 20.6], b: [x(10.6), 21.2], t: r === 1 ? '#4a74e0' : '#d0902c' } as Mark] : []), { a: [x(10.6), 12.4], b: [x(12.4), 19.0], t: 1 } as Mark] });
  }
  parts.push({ s: poly([14.6, 6.2], [16, 7.4], [17.4, 6.2], [17.8, 30.4], [14.2, 30.4]), m: band, sh: { k: 'flat', bev: 1 }, shine: r >= 2, bias: r === 0 ? -0.25 : 0 });
  parts.push({ s: poly([10.8, 3.2], [16, 6.8], [21.2, 3.2], [21.8, 4.4], [16, 8.4], [10.2, 4.4]), m: band, sh: { k: 'flat', bev: 1 }, shine: r >= 2, bias: r === 0 ? -0.25 : 0 });
  // the sash: a cord; blue; red
  parts.push({ s: poly([8.6, 14.4], [23.4, 14.4], [23.6, 16.8], [8.4, 16.8]), m: r === 0 ? 'string' : r === 1 ? 'blue' : 'red', sh: { k: 'flat', bev: 1 } });
  parts.push({ s: path([[19.4, 16.4], [20.4, 19.6], [19.8, 23.0]], [1.0, 0.9, 0.8]), m: r === 0 ? 'string' : r === 1 ? 'blue' : 'red', sh: { k: 'soft', r: 1 } });
  if (r >= 2) parts.push({ s: poly([4.4, 29.2], [27.6, 29.2], [27.6, 30.6], [16, 31.0], [4.4, 30.6]), m: 'gold', sh: { k: 'flat', bev: 0.6 }, shine: true, flush: true });
  if (STONE[r]) parts.push(gem([16, 15.6], r === 1 ? 1.3 : 1.5, STONE[r]!));
  if (r === 3) parts.push(gem([19.8, 23.2], 0.9, 'amber'));
  return parts;
}

/** A steel gauntlet, the back of the hand toward you: four plated fingers, the thumb out, a flared cuff. */
function gloves(r: Rar): Part[] {
  const parts: Part[] = [];
  const plate: Mat = r === 3 ? 'dsteel' : 'steel';
  const trim = r === 3 ? INLAY : r === 2 ? '#d0902c' : r === 1 ? '#4a74e0' : null;
  parts.push({ s: poly([10.0, 22.0], [22.6, 22.0], [25.2, 29.6], [7.4, 29.6]), m: plate, sh: { k: 'soft', r: 2.4 }, shine: true, marks: trim ? [{ a: [8.4, 28.0], b: [24.4, 28.0], t: trim }] : [] });
  parts.push({ s: poly([10.6, 11.8], [22.0, 11.0], [22.6, 18.6], [21.4, 22.6], [11.0, 22.6], [10.0, 17.6]), m: r === 1 ? 'blue' : r === 3 ? 'red' : 'leather', sh: { k: 'soft', r: 2.5 } });
  const fingers: [V, V][] = [[[12.4, 12.6], [11.2, 4.2]], [[15.4, 12.0], [15.0, 2.8]], [[18.4, 12.0], [18.8, 3.4]], [[21.0, 12.6], [22.6, 5.8]]];
  fingers.forEach(([a, b]) => {
    const u = unit(sub(b, a));
    parts.push({ s: cap(a, b, 1.62), m: plate, sh: { k: 'cyl', a, b, w: 1.6 }, shine: true, marks: [3, 5.8].map((d) => ({ a: at(a, u, d, -1.5), b: at(a, u, d, 1.5), t: r >= 2 ? '#8a4e14' : 0 })) });
  });
  parts.push({ s: poly([10.4, 12.4], [22.2, 11.6], [22.6, 18.4], [16.4, 19.6], [10.2, 18.0]), m: plate, sh: { k: 'soft', r: 3 }, shine: true, marks: [{ a: [11.2, 13.4], b: [21.2, 12.8], t: r >= 2 ? (r === 3 ? INLAY : '#f6cc5c') : 4 }] });
  parts.push({ s: path([[11.6, 19.0], [7.8, 16.4], [5.2, 12.4]], [2.0, 1.7, 1.4]), m: plate, sh: { k: 'cyl', a: [11.6, 19], b: [5.2, 12.4], w: 1.8 }, shine: true, marks: [{ a: [7, 15.6], b: [8.6, 13.6], t: 0 }] });
  if (r >= 2) parts.push({ s: cap([10.0, 22.4], [22.6, 22.4], 0.8), m: 'gold', sh: { k: 'flat', bev: 0.6 }, shine: true });
  if (STONE[r]) parts.push(gem([16.4, 15.6], r === 1 ? 1.3 : 1.5, STONE[r]!));
  if (r === 3) parts.push(gem([16.2, 26.0], 1.0, 'amber'));
  return parts;
}

/** A belt in a loop, its buckle at the front, a pouch hung at its side. */
function belt(r: Rar): Part[] {
  const parts: Part[] = [];
  const hide: Mat = r === 3 ? 'dleather' : 'leather';
  const c: V = [16, 15.6];
  // the back of the loop (its inside, in shadow), then the front; its holes; studs on the finer
  const holes: V[] = [[21.6, 23.2], [24.0, 22.2]];
  parts.push({ s: ell(c, 13.8, 9.0), cut: [ell([16, 17.2], 10.0, 5.0), poly([0, 16], [32, 16], [32, 32], [0, 32])], m: hide, sh: { k: 'flat' }, bias: -0.36 });
  parts.push({ s: ell(c, 13.8, 9.0), cut: [ell([16, 13.6], 10.4, 5.4), poly([0, 0], [32, 0], [32, 15.4], [0, 15.4])], m: hide, sh: { k: 'soft', r: 2.2 }, bias: r === 3 ? 0.15 : 0, marks: [{ a: [6, 19.6], b: [10, 21.6], t: 3 }, ...holes.map((p) => ({ a: p, t: 0 }))] });
  if (r >= 2) for (const p of [[5.4, 19.2], [8.0, 21.6]] as V[]) parts.push(stud(p, 0.7, 'gold'));
  // the tail through the buckle, hanging down
  parts.push({ s: poly([13.6, 22.6], [17.4, 22.6], [17.8, 29.4], [16.0, 30.4], [14.2, 29.4]), m: hide, sh: { k: 'soft', r: 1.4 }, bias: 0.05 + (r === 3 ? 0.15 : 0), marks: r >= 2 ? [{ a: [15.9, 29.2], t: '#d0902c' }] : [] });
  parts.push({ s: poly([11.8, 19.2], [20.2, 19.2], [20.2, 26.0], [11.8, 26.0]), cut: [poly([13.6, 20.8], [18.4, 20.8], [18.4, 24.4], [13.6, 24.4])], m: r >= 2 ? 'gold' : 'steel', sh: { k: 'flat', bev: 1.2 }, shine: true });
  parts.push({ s: cap([13.6, 22.6], [17.6, 22.6], 0.55), m: r >= 2 ? 'gold' : 'steel', sh: { k: 'flat' }, shine: true });
  // the pouch, hung at its right; its flap; its button, or its stone
  parts.push({ s: poly([22.4, 19.8], [29.0, 18.6], [29.6, 25.4], [27.6, 28.0], [23.2, 28.0], [21.8, 25.0]), m: r === 1 ? 'blue' : 'dleather', sh: { k: 'soft', r: 2.4 }, bias: 0.2 });
  parts.push({ s: poly([22.0, 19.4], [29.4, 18.2], [29.4, 21.8], [25.8, 23.6], [22.2, 22.6]), m: hide, sh: { k: 'soft', r: 1.2 }, bias: 0.05 + (r === 3 ? 0.15 : 0), marks: r === 3 ? [{ a: [22.4, 22.0], b: [25.8, 23.0], t: INLAY }, { a: [25.8, 23.0], b: [29.0, 21.4], t: INLAY }] : [] });
  parts.push(STONE[r] ? gem([25.8, 22.6], 1.15, STONE[r]!) : { s: ell([25.8, 22.6], 0.9), m: 'brass', sh: { k: 'dome', c: [25.8, 22.6], r: 0.9 }, shine: true });
  if (r === 3) parts.push(gem([16, 19.6], 1.0, 'amber'));
  return parts;
}

/** A tall leather boot from the side, its toe to the left: a folded cuff, a strap and buckle, a heel. */
function boots(r: Rar): Part[] {
  const parts: Part[] = [];
  const hide: Mat = r === 3 ? 'dleather' : 'leather';
  parts.push({ s: poly([13.0, 6.0], [23.8, 6.0], [24.6, 15.0], [25.4, 24.0], [26.4, 27.6], [26.0, 28.6], [4.6, 28.6], [3.6, 25.6], [6.0, 22.8], [11.4, 20.6], [12.6, 15.0]), m: hide, sh: { k: 'soft', r: 3.5 }, bias: r === 3 ? 0.15 : 0, marks: [{ a: [14.4, 8.6], b: [14.0, 19.0], t: 3 }, { a: [8.0, 22.6], b: [5.6, 25.0], t: 3 }, { a: [22.4, 10], b: [23.0, 22], t: 1 }] });
  // the cuff: leather, blue, or gold-trimmed
  parts.push({ s: poly([11.8, 2.6], [25.2, 2.4], [25.4, 7.6], [24.0, 8.6], [12.6, 8.6], [11.4, 7.4]), m: r === 1 ? 'blue' : hide, sh: { k: 'soft', r: 1.8 }, bias: 0.12 + (r === 3 ? 0.15 : 0), marks: r >= 2 ? [{ a: [12.4, 7.8], b: [24.4, 7.8], t: r === 3 ? INLAY : '#d0902c' }] : [] });
  parts.push({ s: poly([3.4, 27.6], [26.8, 27.6], [26.8, 30.2], [4.8, 30.2], [3.0, 29.0]), m: 'dleather', sh: { k: 'flat', bev: 0.8 } });
  parts.push({ s: poly([19.6, 26.8], [26.8, 26.8], [26.8, 30.4], [20.0, 30.4]), m: r === 3 ? 'gold' : 'dleather', sh: { k: 'flat', bev: 1 }, bias: -0.1, shine: r === 3 });
  // (the finer: a toe cap)
  if (r >= 2) parts.push({ s: poly([3.6, 25.6], [6.2, 23.0], [8.8, 22.2], [8.6, 28.6], [4.6, 28.6]), m: r === 3 ? 'gold' : 'steel', sh: { k: 'soft', r: 1.6 }, shine: true });
  parts.push({ s: poly([11.8, 17.8], [25.0, 16.0], [25.2, 18.6], [12.0, 20.6]), m: 'dleather', sh: { k: 'flat', bev: 0.8 } });
  parts.push({ s: poly([15.0, 16.6], [18.6, 16.2], [18.8, 20.0], [15.2, 20.4]), cut: [poly([16.0, 17.6], [17.8, 17.4], [17.8, 19.2], [16.0, 19.4])], m: r >= 2 ? 'gold' : r === 1 ? 'steel' : 'brass', sh: { k: 'flat', bev: 1 }, shine: true });
  if (STONE[r]) parts.push(gem([21.8, 17.2], r === 1 ? 1.0 : 1.2, STONE[r]!));
  if (r === 3) parts.push(gem([18.6, 5.2], 1.1, 'amber'));
  return parts;
}

/** A ring, tilted toward you, a big faceted stone in claws on top: a garnet in steel; a sapphire; a topaz in gold; amber in gold, with more. */
function ring(r: Rar): Part[] {
  const parts: Part[] = [];
  const band: Mat = r >= 2 ? 'gold' : 'steel';
  const stone: Mat = STONE[r] ?? 'ruby';
  const c: V = [16, 20.6];
  parts.push({ s: ell(c, 10.2, 8.6), cut: [ell([16, 19.4], 6.6, 5.2)], m: band, sh: { k: 'soft', r: 2.6 }, shine: true, marks: [{ a: [8.0, 17.0], b: [7.6, 21.6], t: 4 }, ...(r === 3 ? [{ a: [10.4, 27.0], b: [21.6, 27.0], t: '#8a4e14' } as Mark] : [])] });
  // the setting
  parts.push({ s: poly([10.4, 12.6], [21.6, 12.6], [20.0, 15.6], [12.0, 15.6]), m: band, sh: { k: 'soft', r: 1.6 }, shine: true });
  const g: V = [16, 8.4];
  const gemS = poly([12.6, 3.0], [19.4, 3.0], [22.0, 6.4], [22.0, 10.0], [19.0, 13.6], [13.0, 13.6], [10.0, 10.0], [10.0, 6.4]);
  parts.push({ s: gemS, m: stone, sh: { k: 'dome', c: g, r: 6.4, ry: 5.8 }, shine: true, marks: [{ a: [13.4, 5.4], b: [18.6, 5.4], t: 3 }, { a: [12.6, 9.6], b: [19.4, 9.6], t: 1 }, { a: [13.6, 4.4], t: 4 }, { a: [14.4, 4.4], t: 4 }] });
  for (const p of [[10.6, 6.2], [21.4, 6.2], [11.2, 12.2], [20.8, 12.2]] as V[]) parts.push({ s: ell(p, 1.0), m: band, sh: { k: 'dome', c: p, r: 1 }, shine: true });
  // (the finest: small stones set in the band)
  if (r === 3) for (const p of [[7.4, 22.6], [24.6, 22.6]] as V[]) parts.push(gem(p, 1.0, 'amber'));
  if (r === 2) parts.push(gem([16, 28.2], 0.9, 'topaz'));
  return parts;
}

/** An amulet: a chain hung in a V, a setting with a stone: steel and a garnet; a sapphire; gold and a topaz; gold and amber, with more. */
function amulet(r: Rar): Part[] {
  const parts: Part[] = [];
  const metal: Mat = r >= 2 ? 'gold' : 'steel';
  const L: V[] = [[4.6, 3.0], [5.8, 8.6], [9.0, 13.4], [13.2, 16.6]];
  const R: V[] = [[27.4, 3.0], [26.2, 8.6], [23.0, 13.4], [18.8, 16.6]];
  for (const ch of [L, R]) {
    const links: Mark[] = [];
    for (let i = 0; i + 1 < ch.length; i++) for (let t = 0; t < 1; t += 0.34) links.push({ a: lerp(ch[i], ch[i + 1], t), t: 4 });
    parts.push({ s: path(ch, [0.95, 0.95, 0.95, 0.95]), m: metal, sh: { k: 'flat' }, shine: true, marks: links });
  }
  parts.push({ s: ell([16, 16.8], 2.2, 1.8), cut: [ell([16, 16.8], 1.0, 0.8)], m: metal, sh: { k: 'soft', r: 1 }, shine: true });
  const c: V = [16, 23.4];
  const set = r === 3
    ? poly([16, 17.6], [19.2, 18.6], [22.6, 18.4], [22.0, 22.2], [23.2, 25.6], [19.4, 27.2], [16, 31.0], [12.6, 27.2], [8.8, 25.6], [10.0, 22.2], [9.4, 18.4], [12.8, 18.6])
    : poly([16, 17.6], [21.6, 20.6], [22.0, 25.4], [16, 30.4], [10.0, 25.4], [10.4, 20.6]);
  parts.push({ s: set, m: metal, sh: { k: 'soft', r: 2.2 }, shine: true });
  parts.push({ s: ell(c, 3.6, 4.2), m: STONE[r] ?? 'ruby', sh: { k: 'dome', c, r: 3.6, ry: 4.2 }, shine: true });
  if (r === 3) for (const p of [[9.8, 19.2], [22.2, 19.2], [16, 29.4]] as V[]) parts.push(gem(p, 0.9, 'amber'));
  if (r === 2) parts.push({ ...gem([16, 29.0], 0.8, 'gold'), flush: true });
  return parts;
}

type Painter = (r: Rar) => Part[];
const PAINTERS: Record<ItemAKind, Painter> = { sword, greatsword, bow, wand, staff, wraps, tome, wrench, shield, quiver, focus, helm, hood, armor, robe, gloves, belt, boots, ring, amulet };

/** One item at one rarity: a 32 by 32 picture (two picture pixels to a game pixel). */
export function paintItemA(kind: ItemAKind, rarity: Rarity): Px {
  return paint(PAINTERS[kind](rarity), rarity);
}

/** Which of these pictures an item's picture key shows: its own, or the old weapons' the kind they became. Null for none. */
export function itemAKind(key: string): ItemAKind | null {
  if ((ITEM_A_KINDS as readonly string[]).includes(key)) return key as ItemAKind;
  if (Object.prototype.hasOwnProperty.call(ITEM_A_OLD, key)) return ITEM_A_OLD[key as keyof typeof ITEM_A_OLD];
  return null;
}

const made = new Map<string, Sprite>();
/**
 * THE PICTURE OF AN ITEM, for the UI and the floor: its kind (an item's `icon`, or 'wraps', 'tome', 'wrench') at its rarity, 16 by
 * 16 game pixels painted two picture pixels to a game pixel, anchor the middle (8, 8), as art/icons.ts' item pictures are drawn.
 * Draw it at its size in game pixels (`w` by `h`), as `ui.slot` and the floor's `stand` already do. Made once and kept.
 */
export function itemArt(key: string, rarity: Rarity): Sprite {
  const kind = itemAKind(key);
  if (!kind) throw new Error(`items_a: no picture for ${key}`);
  const id = `${kind}:${rarity}`;
  let s = made.get(id);
  if (!s) made.set(id, (s = paintItemA(kind, rarity).sprite(16, 16, 2)));
  return s;
}
