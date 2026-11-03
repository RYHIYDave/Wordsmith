// THE NEW ITEM PICTURES, THREE STYLES TO PICK FROM (docs/mockups/items_look): pictures only, not in the game. Nothing of the game
// imports this file (tests/items_look.test.ts says so).
//
// The owner, 2 Nov 2026, 19:53: “I’d like new item sprites I think.  They’re pretty old art.  Then I guess get ready for unique
// items.” And of the Veteran: “Oh and we need sprites for his weapon, hand wraps, or brawler’s wraps.  2 handed obv.”
//
// Every item is built ONCE as shapes (a blade, a guard, a grip, a pommel...), each of its own material and shaped by its own
// light (a blade's two faces, a grip's roundness, a gem's dome, cloth's soft folds), and then painted three ways:
//   A  PAINTED: lit and shaded like the new heroes, five tones to a material, dark seams between parts, a shadow cast where one
//      part lies over another, a bold ink outline.
//   B  CLASSIC LOOT: bright flat colours, three tones to a material, ink lines between every part like a cartoon, and the
//      rarity's colour as a rim round the whole thing (in the bag and lying on the floor alike).
//   C  WORN AND STORIED: painted as A, in old, dulled colours, scratched and grimed, and each with a little story of its own
//      (a nicked blade, a patched hood, a burnt hem, a tally cut in a bow).
// All at the heroes' grain: 32 by 32 picture pixels, the 16 game pixels today's pictures fill, so they go in today's slots.
// The light comes from the upper left, as everywhere in the game; what glows on a friend is cyan, and nothing here glows at all.

import { Px, mix, rgba } from '../engine/px';

export type LookStyle = 'A' | 'B' | 'C';
export const LOOK_STYLES: readonly LookStyle[] = ['A', 'B', 'C'];
export const ITEM_LOOK_KINDS = [
  'sword', 'greatsword', 'bow', 'wand', 'staff', 'wraps', 'shield', 'quiver', 'focus',
  'helm', 'hood', 'armor', 'robe', 'gloves', 'belt', 'boots', 'ring', 'amulet',
] as const;
export type LookKind = (typeof ITEM_LOOK_KINDS)[number];
/** The names he knows them by. */
export const LOOK_NAME: Record<LookKind, string> = {
  sword: 'Sword', greatsword: 'Greatsword', bow: 'Bow', wand: 'Wand', staff: 'Staff', wraps: 'Brawler’s wraps', shield: 'Shield',
  quiver: 'Quiver', focus: 'Focus', helm: 'Helmet', hood: 'Hood', armor: 'Armour', robe: 'Robe', gloves: 'Gloves', belt: 'Belt',
  boots: 'Boots', ring: 'Ring', amulet: 'Amulet',
};
/** The game's rarity colours (art/palette.ts RARITY_COLOR): Normal, Magic, Rare, Unique. */
export const LOOK_RARITY = ['#cfc6bc', '#6f8cff', '#ffe070', '#ff8a3a'] as const;
export const LOOK_RARITY_NAME = ['Normal', 'Magic', 'Rare', 'Unique'] as const;
/** Picture pixels across (two to a game pixel: 16 game pixels, today's size). */
export const LOOK_N = 32;
const N = LOOK_N;
const INK = '#0e0c24';

// ---------------------------------------------------------------------------------------------
// Materials: five tones each, darkest to brightest.

type Ramp = readonly [string, string, string, string, string];
const M = {
  steel: ['#26224e', '#45418a', '#7a76be', '#b6b2ea', '#f2f0ff'],
  dsteel: ['#16142a', '#2a2848', '#46446e', '#6e6c9a', '#b0aed8'],
  gold: ['#4a2408', '#8a4e14', '#d0902c', '#f6cc5c', '#fff4c0'],
  brass: ['#3a2410', '#6a4620', '#a07436', '#d0a656', '#f2d892'],
  leather: ['#2a140c', '#4a2a18', '#7a4a2a', '#ac7444', '#d6a470'],
  dleather: ['#1a0e0c', '#2e1a14', '#4c2e20', '#6e4630', '#94664a'],
  wood: ['#2e180e', '#52301a', '#80522c', '#b07c48', '#d6a874'],
  linen: ['#463a38', '#7a6a62', '#ae9c8e', '#dccebe', '#f8f0e2'],
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
} satisfies Record<string, Ramp>;
type Mat = keyof typeof M;

function hsl(c: string): [number, number, number] {
  const [r0, g0, b0] = rgba(c);
  const r = r0 / 255, g = g0 / 255, b = b0 / 255;
  const mx = Math.max(r, g, b), mn = Math.min(r, g, b);
  const l = (mx + mn) / 2;
  if (mx === mn) return [0, 0, l];
  const d = mx - mn;
  const s = l > 0.5 ? d / (2 - mx - mn) : d / (mx + mn);
  const h = mx === r ? (g - b) / d + (g < b ? 6 : 0) : mx === g ? (b - r) / d + 2 : (r - g) / d + 4;
  return [h * 60, s, l];
}
function fromHsl(h: number, s: number, l: number): string {
  const f = (n: number): number => {
    const k = (n + h / 30) % 12;
    const a = s * Math.min(l, 1 - l);
    return Math.round(255 * (l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1))));
  };
  return '#' + [f(0), f(8), f(4)].map((v) => Math.max(0, Math.min(255, v)).toString(16).padStart(2, '0')).join('');
}
const saturate = (c: string, k: number, dl = 0): string => {
  const [h, s, l] = hsl(c);
  return fromHsl(h, Math.min(1, s * k), Math.max(0, Math.min(1, l + dl)));
};

/** A material's tones in a style. */
function tones(style: LookStyle, m: Mat): Ramp {
  const r = M[m];
  if (style === 'A') return r;
  if (style === 'B') return [saturate(r[1], 1.25), saturate(r[2], 1.3), saturate(r[3], 1.3), saturate(r[4], 1.2, 0.02), '#ffffff'];
  // C: old and dulled, warmed toward a grimy brown; its brightest no longer shines
  const old = (c: string): string => mix(saturate(c, 0.8, 0.025), '#5a4232', 0.1);
  return [old(r[0]), old(r[1]), old(r[2]), old(r[3]), old(mix(r[3], r[4], 0.35))];
}

// ---------------------------------------------------------------------------------------------
// Shapes, in pixel-edge coordinates on the 32 by 32 canvas.

export type V = readonly [number, number];
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
  | { t: 'path'; p: readonly V[]; r: readonly number[] }
  | { t: 'or'; s: readonly Shape[] };
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
    case 'or':
      return s.s.some((x) => inside(x, p));
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
  /** Takes a highlight (metal, gems, glass). */
  shine?: boolean;
  /** No dark seam where it lies over another part (an inlay, a painted device). */
  flush?: boolean;
  marks?: readonly Mark[];
  /** Metal, cloth or leather: what wear does to it in style C. */
  wear?: 'metal' | 'soft' | 'wood' | 'gem';
}

const LV = ((): readonly [number, number, number] => {
  const v = [-0.5, -0.66, 0.58];
  const l = Math.hypot(v[0], v[1], v[2]);
  return [v[0] / l, v[1] / l, v[2] / l];
})();

export interface LookOpt {
  style: LookStyle;
  rar: 0 | 1 | 2 | 3;
}

/** A small seeded random, so every picture comes out the same each time. */
function rng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const seedOf = (s: string): number => [...s].reduce((h, c) => Math.imul(h ^ c.charCodeAt(0), 16777619), 2166136261);

/** Paint the parts (in order, later over earlier) in a style. */
function paint(name: string, parts: readonly Part[], o: LookOpt): Px {
  const { style } = o;
  // B is drawn a little smaller, to leave room for its ink line and its rarity rim
  const k = style === 'B' ? 0.92 : 1;
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
    let t: number;
    if (style === 'B') t = v > 0.84 ? 3 : v > 0.3 ? 2 : 1;
    else t = v > 0.93 ? 4 : v > 0.72 ? 3 : v > 0.42 ? 2 : v > 0.08 ? 1 : 0;
    if (!pt.shine && t > 3) t = 3;
    tone[y * N + x] = t;
  }
  // a shadow cast down and to the right where one part lies over another (not in B: flat colours)
  if (style !== 'B') {
    const t2 = Int8Array.from(tone);
    for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
      const i = own(x, y);
      if (i < 0) continue;
      const over = [own(x - 1, y - 1), own(x - 2, y - 1), own(x - 1, y - 2), own(x - 2, y - 2)].some((j) => j > i && !parts[j].flush);
      if (over) t2[y * N + x] = Math.max(0, tone[y * N + x] - 1);
    }
    tone.set(t2);
  }
  const out = new Px(N, N);
  const ramps = parts.map((pt) => tones(style, pt.m));
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
    const i = own(x, y);
    if (i < 0) continue;
    const seam = [own(x + 1, y), own(x - 1, y), own(x, y + 1), own(x, y - 1)].some((j) => j > i && !parts[j].flush);
    const rr = ramps[i];
    out.set(x, y, seam ? (style === 'B' ? INK : mix(rr[0], INK, 0.55)) : rr[tone[y * N + x]]);
  }
  // marks: lines and dots drawn on a part, only where that part shows
  parts.forEach((pt, i) => {
    for (const mk of pt.marks ?? []) {
      const col = typeof mk.t === 'number' ? ramps[i][mk.t] : mk.t;
      const pix = (px: number, py: number): void => {
        // (a mark is placed on the shape's own points: in B the shape is drawn smaller, so it is placed so too)
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
  // C: wear on everything: metal scratched and grimed, leather and cloth scuffed, wood grained
  if (style === 'C') {
    const rnd = rng(seedOf(name));
    parts.forEach((pt, i) => {
      if (!pt.wear) return;
      const rr = ramps[i];
      const mine: number[] = [];
      for (let j = 0; j < N * N; j++) if (owner[j] === i) mine.push(j);
      if (mine.length < 6) return;
      if (pt.wear === 'metal') {
        for (const j of mine) {
          const tt = tone[j];
          if (tt <= 1 && rnd() < 0.12) out.set(j % N, Math.floor(j / N), mix(rr[tt], '#7a4426', 0.5));
        }
        const scratches = Math.min(3, Math.floor(mine.length / 25));
        for (let s = 0; s < scratches; s++) {
          const j = mine[Math.floor(rnd() * mine.length)];
          const dx = rnd() < 0.5 ? 1 : -1;
          for (let q = 0; q < 3; q++) {
            const x = (j % N) + q * dx, y = Math.floor(j / N) + (q > 0 ? 1 : 0) * (q % 2);
            if (own(x, y) === i) out.set(x, y, rr[Math.min(4, tone[y * N + x] + 2)]);
          }
        }
      } else if (pt.wear === 'soft' || pt.wear === 'wood') {
        for (const j of mine) {
          const tt = tone[j];
          if (tt >= 2 && rnd() < (pt.wear === 'wood' ? 0.1 : 0.14)) out.set(j % N, Math.floor(j / N), rr[tt - 1]);
        }
      }
    });
  }
  out.outline(INK);
  if (style === 'B') out.outline(LOOK_RARITY[o.rar]);
  return out;
}

// ---------------------------------------------------------------------------------------------
// The items. Weapons lie on the diagonal, grip at the bottom left, as today; the rest are seen from the front.

const UP: V = unit([1, -1]);

/** The pommel's gem, the guard's metal, the grip's wrap: how fine a sword is made by its rarity (A and C). */
function swordFinery(o: LookOpt): { guard: Mat; pommel: Mat; gem: Mat | null; grip: Mat } {
  if (o.rar === 3) return { guard: 'gold', pommel: 'gold', gem: 'amber', grip: 'red' };
  if (o.rar === 2) return { guard: 'gold', pommel: 'gold', gem: 'topaz', grip: 'leather' };
  if (o.rar === 1) return { guard: 'steel', pommel: 'steel', gem: 'sapphire', grip: 'blue' };
  return { guard: 'steel', pommel: 'steel', gem: null, grip: 'leather' };
}

function sword(o: LookOpt): Part[] {
  const C = o.style === 'C';
  const fin = o.style === 'B' ? swordFinery({ ...o, rar: 0 }) : swordFinery(o);
  const G: V = [12.2, 19.8];
  const T: V = [27.6, 4.4];
  const L = len(sub(T, G));
  const w = 2.6;
  const b0 = at(G, UP, 0.6, 0), tn = at(G, UP, L - 4.4, 0);
  const blade: Part = {
    s: poly(at(b0, UP, 0, -w), at(tn, UP, 0, -w), T, at(tn, UP, 0, w), at(b0, UP, 0, w)),
    m: o.rar === 3 && o.style !== 'B' ? 'dsteel' : 'steel', sh: { k: 'ridge', a: G, b: T }, shine: true, wear: 'metal',
    marks: [
      ...(o.rar >= 2 && o.style !== 'B' ? [{ a: at(b0, UP, 1.5, 0), b: at(tn, UP, -2, 0), t: o.rar === 3 ? '#e0a040' : 1 } as Mark] : []),
      { a: at(tn, UP, 1.2, -1.2), t: 4 },
    ],
    cut: C ? [ell(at(G, UP, 8, 2.6), 1.1, 1.1), ell(at(G, UP, 12.5, 2.7), 0.9, 0.9), ell(at(G, UP, 5.5, -2.6), 0.8, 0.8)] : undefined,
  };
  const gl = o.rar === 3 && o.style !== 'B' ? 6.4 : 5.6;
  const guard: Part = {
    s: o.rar === 3 && o.style !== 'B'
      ? path([at(G, UP, 2.4, -gl), at(G, UP, 0.4, -3), at(G, UP, 0, 0), at(G, UP, 0.4, 3), at(G, UP, 2.4, gl)], [1.1, 1.5, 1.8, 1.5, 1.1])
      : cap(at(G, UP, 0, -gl), at(G, UP, 0, gl), 1.6),
    m: fin.guard, sh: { k: 'cyl', a: at(G, UP, 0, -gl), b: at(G, UP, 0, gl), w: 1.5 }, shine: true, wear: 'metal',
  };
  const grip: Part = {
    s: cap(at(G, UP, -0.5, 0), at(G, UP, -6.0, 0), 1.6), m: fin.grip, sh: { k: 'cyl', a: G, b: at(G, UP, -6, 0), w: 1.6 }, bias: 0.16, wear: 'soft',
    marks: [2.2, 4.0].map((d) => ({ a: at(G, UP, -d, -1.8), b: at(G, UP, -d - 0.9, 1.8), t: 1 })),
  };
  const pc = at(G, UP, -8.0, 0);
  const pommel: Part = { s: ell(pc, 2.4), m: fin.pommel, sh: { k: 'dome', c: pc, r: 2.4 }, shine: true, wear: 'metal' };
  const parts: Part[] = [blade, grip, guard, pommel];
  if (fin.gem) {
    parts.push({ s: ell(pc, 1.25), m: fin.gem, sh: { k: 'dome', c: pc, r: 1.3 }, shine: true, wear: 'gem' });
    if (o.rar === 3) parts.push({ s: ell(G, 1.3), m: fin.gem, sh: { k: 'dome', c: G, r: 1.3 }, shine: true });
  }
  if (C) {
    // a cord tied round the grip below the guard, its end hanging loose
    const q = at(G, UP, -2.6, 0);
    parts.push({ s: path([q, add(q, [-1.4, 1.8]), add(q, [-1.0, 4.0])], [0.8, 0.75, 0.6]), m: o.rar === 1 ? 'blue' : 'red', sh: { k: 'soft', r: 1 }, wear: 'soft' });
    parts.push({ s: cap(at(G, UP, -2.6, -1.8), at(G, UP, -2.6, 1.8), 0.8), m: o.rar === 1 ? 'blue' : 'red', sh: { k: 'flat' } });
  }
  return parts;
}

function greatsword(o: LookOpt): Part[] {
  const C = o.style === 'C';
  const G: V = [11.4, 20.6];
  const T: V = [29.4, 2.6];
  const L = len(sub(T, G));
  const w = 3.8;
  const b0 = at(G, UP, 0.8, 0), tn = at(G, UP, L - 5.8, 0);
  const parts: Part[] = [];
  parts.push({
    s: poly(at(b0, UP, 0, -w + 0.4), at(b0, UP, 2.2, -w), at(tn, UP, 0, -w), C ? at(T, UP, -1.8, -1.6) : T, ...(C ? [at(T, UP, -2.4, 0.4)] : []), at(tn, UP, 0, w), at(b0, UP, 2.2, w), at(b0, UP, 0, w - 0.4)),
    m: 'steel', sh: { k: 'ridge', a: G, b: T, tilt: 0.38 }, shine: true, wear: 'metal',
    marks: [
      { a: at(b0, UP, 3, -0.6), b: at(tn, UP, -2, -0.6), t: 1 },
      { a: at(b0, UP, 3, 0.6), b: at(tn, UP, -2, 0.6), t: 0 },
      { a: at(tn, UP, 2, -2), t: 4 },
    ],
    cut: C ? [ell(at(G, UP, 9, 3.6), 1.2, 1.0), ell(at(G, UP, 15, -3.5), 1.0, 1.0)] : undefined,
  });
  // the long two-handed grip, then the guard with its quillons swept toward the point
  parts.push({
    s: cap(at(G, UP, -0.6, 0), at(G, UP, -8.6, 0), 1.55), m: 'leather', sh: { k: 'cyl', a: G, b: at(G, UP, -8, 0), w: 1.55 }, bias: 0.16, wear: 'soft',
    marks: [2.2, 4.4, 6.6].map((d) => ({ a: at(G, UP, -d, -1.7), b: at(G, UP, -d - 1, 1.7), t: 1 })),
  });
  parts.push({
    s: path([at(G, UP, 2.6, -7.6), at(G, UP, 0.5, -6), at(G, UP, 0, 0), at(G, UP, 0.5, 6), at(G, UP, 2.6, 7.6)], [1.0, 1.4, 1.8, 1.4, 1.0]),
    m: 'steel', sh: { k: 'cyl', a: at(G, UP, 0, -7), b: at(G, UP, 0, 7), w: 1.8 }, shine: true, wear: 'metal',
  });
  parts.push({ s: ell(G, 1.4), m: 'steel', sh: { k: 'dome', c: G, r: 1.4 }, shine: true });
  const pc = at(G, UP, -10.4, 0);
  parts.push({ s: poly(at(pc, UP, 2, 0), at(pc, UP, 0.6, -2.3), at(pc, UP, -1.6, -1.4), at(pc, UP, -2.2, 0), at(pc, UP, -1.6, 1.4), at(pc, UP, 0.6, 2.3)), m: 'steel', sh: { k: 'dome', c: pc, r: 2.4 }, shine: true, wear: 'metal' });
  if (C) {
    // a rag tied below the guard, its ends blown back
    const rc = at(G, UP, -1.6, 0);
    parts.push({ s: cap(at(rc, UP, 0, -1.9), at(rc, UP, 0, 1.9), 1.1), m: 'linen', sh: { k: 'soft', r: 1 }, wear: 'soft' });
    parts.push({ s: path([at(rc, UP, 0, 2), at(rc, UP, -1.6, 3.6), at(rc, UP, -1.2, 5.6)], [0.9, 0.8, 0.6]), m: 'linen', sh: { k: 'soft', r: 1 }, wear: 'soft' });
    parts.push({ s: path([at(rc, UP, 0, 2), at(rc, UP, -3, 3), at(rc, UP, -4.4, 4.4)], [0.8, 0.7, 0.55]), m: 'linen', sh: { k: 'soft', r: 1 }, bias: -0.2 });
  }
  return parts;
}

/** A recurve bow on the diagonal, its belly toward the upper left, the string from corner to corner. */
function bow(o: LookOpt): Part[] {
  const C = o.style === 'C';
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
    s: path(ss.map(P), rs), m: 'wood', sh: { k: 'soft', r: 1.6 }, wear: 'wood',
    marks: C ? [-8, -7, -6, -5].map((s) => ({ a: add(P(s), mul(nrm, 0.9)), b: add(P(s), mul(nrm, -0.3)), t: 0 })) : [],
  });
  // the tips, capped in horn
  for (const s of [-14.6, 14.6]) parts.push({ s: ell(P(s), 1.35), m: 'ivory', sh: { k: 'dome', c: P(s), r: 1.35 }, shine: true });
  const g = P(0);
  parts.push({
    s: cap(add(g, mul(d, -2.8)), add(g, mul(d, 2.8)), 2.4), m: C ? 'dleather' : 'red', sh: { k: 'cyl', a: add(g, mul(d, -3)), b: add(g, mul(d, 3)), w: 2.0 }, wear: 'soft',
    marks: [-1.6, 0, 1.6].map((s) => ({ a: add(add(g, mul(d, s)), mul(nrm, 2)), b: add(add(g, mul(d, s + 0.6)), mul(nrm, -2)), t: 0 })),
  });
  if (C) {
    // a feather tied at the grip; a knot where the string was mended
    const f0 = add(add(g, mul(d, -1.6)), mul(nrm, -1.8));
    parts.push({ s: path([f0, add(f0, [1.2, 3]), add(f0, [3.6, 5.8])], [0.6, 1.4, 0.7]), m: 'feather', sh: { k: 'soft', r: 1 }, marks: [{ a: f0, b: add(f0, [3.6, 5.8]), t: 1 }] });
    parts.push({ s: ell(lerp(tipA, tipB, 0.62), 1.0), m: 'string', sh: { k: 'flat' } });
  }
  return parts;
}

/** A short wand: a rod with a gold collar holding a pointed crystal. */
function wand(o: LookOpt): Part[] {
  const C = o.style === 'C';
  const A: V = [5.8, 26.2];
  const K: V = at(A, UP, 15.2, 0);
  const parts: Part[] = [];
  parts.push({
    s: cap(A, K, 1.75, 1.3), m: 'ivory', sh: { k: 'cyl', a: A, b: K, w: 1.6 }, wear: 'wood',
    marks: [3, 5.5, 8, 10.5].map((t) => ({ a: at(A, UP, t, -1.4), b: at(A, UP, t + 1.4, 1.4), t: 1 })),
  });
  parts.push({ s: ell(A, 2.3), m: 'gold', sh: { k: 'dome', c: A, r: 2.3 }, shine: true, wear: 'metal' });
  parts.push({ s: cap(at(K, UP, -1.6, 0), at(K, UP, 0.8, 0), 2.3), m: 'gold', sh: { k: 'cyl', a: at(K, UP, 0, -2.3), b: at(K, UP, 0, 2.3), w: 2.3 }, shine: true, wear: 'metal' });
  const tip = at(K, UP, 10.2, 0);
  const crystal = poly(at(K, UP, 0.6, -2.2), at(K, UP, 5.0, -3.3), tip, at(K, UP, 5.0, 3.3), at(K, UP, 0.6, 2.2));
  parts.push({
    s: crystal, m: 'violet', sh: { k: 'ridge', a: K, b: tip, tilt: 0.5 }, shine: true, wear: 'gem',
    marks: [{ a: at(K, UP, 2.4, -1), b: at(K, UP, 5.6, -1.4), t: 4 }, ...(C ? [{ a: at(K, UP, 3, 0.4), b: at(K, UP, 6.4, 1.6), t: 0 } as Mark] : [])],
    cut: C ? [ell(at(K, UP, 8.2, 1.2), 1.0)] : undefined,
  });
  if (C) parts.push({ s: cap(at(A, UP, 6.2, 0), at(A, UP, 8.2, 0), 1.65), m: 'string', sh: { k: 'cyl', a: A, b: K, w: 1.6 }, marks: [6.6, 7.4].map((t) => ({ a: at(A, UP, t, -1.8), b: at(A, UP, t + 0.5, 1.8), t: 1 })) });
  return parts;
}

/** A long gnarled staff, its head two wooden prongs gripping a big crystal. */
function staff(o: LookOpt): Part[] {
  const C = o.style === 'C';
  const orb: V = [23.2, 8.8];
  const parts: Part[] = [];
  const shaft: V[] = [[3.4, 29.4], [7.4, 25.8], [10.4, 22.2], [14.2, 18.8], [17.2, 15.2], [19.6, 13.0]];
  parts.push({
    s: path(shaft, [1.7, 1.9, 1.8, 2.0, 1.9, 2.1]), m: 'wood', sh: { k: 'soft', r: 1.5 }, wear: 'wood',
    marks: [{ a: [9, 24.2], t: 0 }, { a: [15.4, 17.8], t: 0 }, { a: [6.2, 27.4], b: [8.2, 25.6], t: 3 }],
  });
  parts.push({ s: ell(orb, 4.3), m: 'violet', sh: { k: 'dome', c: orb, r: 4.3 }, shine: true, wear: 'gem', marks: C ? [{ a: [21.6, 6.2], b: [24.4, 10.6], t: 0 }] : [] });
  // the two prongs round the crystal
  parts.push({ s: path([[19.4, 13.2], [17.6, 9.6], [18.2, 5.6], [21.0, 3.4], [24.4, 3.6]], [1.6, 1.4, 1.2, 1.0, 0.7]), m: 'wood', sh: { k: 'soft', r: 1.4 }, wear: 'wood' });
  parts.push({ s: path([[19.6, 13.0], [23.0, 14.2], [27.0, 12.6], [28.8, 9.4], C ? [28.8, 8.6] : [28.4, 6.2]], [1.6, 1.4, 1.2, 1.0, 0.7]), m: 'wood', sh: { k: 'soft', r: 1.4 }, wear: 'wood' });
  parts.push({ s: cap([17.4, 15.4], [19.8, 12.8], 2.0), m: 'gold', sh: { k: 'cyl', a: [17.4, 15.4], b: [19.8, 12.8], w: 2 }, shine: true, wear: 'metal' });
  if (C) {
    // a cord of beads hung from the head
    parts.push({ s: path([[18.8, 14.6], [17.4, 18.0], [17.8, 21.4]], [0.5, 0.5, 0.5]), m: 'string', sh: { k: 'flat' } });
    for (const b of [[17.5, 17.6], [17.6, 19.8], [17.9, 22.0]] as V[]) parts.push({ s: ell(b, 1.05), m: 'red', sh: { k: 'dome', c: b, r: 1.05 }, shine: true });
  }
  return parts;
}

/** A heater shield, seen from the front: a steel rim round a red field with a gold chevron and a boss. */
function shield(o: LookOpt): Part[] {
  const C = o.style === 'C';
  const rim: V[] = [[4.6, 4.8], [16, 3.0], [27.4, 4.8], [27.6, 12.4], [26.0, 19.0], [22.2, 24.6], [16, 29.6], [9.8, 24.6], [6.0, 19.0], [4.4, 12.4]];
  const outer = poly(...rim);
  const sc = (p: V): V => [16 + (p[0] - 16) * 0.82, 15.4 + (p[1] - 15.4) * 0.84];
  const inner = poly(...rim.map(sc));
  const parts: Part[] = [];
  parts.push({ s: outer, m: 'steel', sh: { k: 'soft', r: 2 }, shine: true, wear: 'metal', cut: C ? [ell([27.4, 9.6], 1.3, 1.6)] : undefined });
  parts.push({ s: inner, m: 'red', sh: { k: 'soft', r: 5 }, wear: 'soft', marks: C ? [{ a: [8.4, 9.0], b: [13.2, 15.4], t: 0 }, { a: [8.8, 8.6], b: [13.6, 15.0], t: 3 }] : [] });
  parts.push({ s: poly([7.0, 17.2], [16, 9.8], [25.0, 17.2], [25.0, 20.8], [16, 13.6], [7.0, 20.8]), m: 'gold', sh: { k: 'flat', bev: 1 }, shine: true, wear: 'metal' });
  parts.push({ s: ell([16, 9.0], 2.4), m: 'steel', sh: { k: 'dome', c: [16, 9.0], r: 2.4 }, shine: true, wear: 'metal' });
  for (const r of [[7.0, 6.8], [25.0, 6.8], [16, 26.6]] as V[]) parts.push({ s: ell(r, 0.8), m: 'steel', sh: { k: 'dome', c: r, r: 0.8 }, shine: true, flush: true });
  if (C) {
    // an arrow's broken shaft still stuck in it
    parts.push({ s: cap([19.4, 22.4], [24.6, 17.6], 0.65), m: 'wood', sh: { k: 'flat' } });
    parts.push({ s: poly([24.0, 16.6], [26.4, 16.0], [25.4, 18.6]), m: 'feather', sh: { k: 'flat' } });
  }
  return parts;
}

/** A leather quiver leaning to the right, three arrows' fletching out of its mouth, its strap looped at its side. */
function quiver(o: LookOpt): Part[] {
  const C = o.style === 'C';
  const B: V = [11.8, 27.4], T: V = [19.4, 11.0];
  const u = unit(sub(T, B));
  const parts: Part[] = [];
  // arrows first (their shafts go down into it)
  const arrows: [V, number, Mat][] = [[[15.4, 2.6], -0.25, 'red'], [[20.6, 3.0], 0, 'feather'], [[25.4, 5.4], 0.3, 'red']];
  arrows.forEach(([tip, _a, m], i) => {
    const broken = C && i === 2;
    const base = at(T, u, -2, -1.6 + i * 1.6);
    const end: V = broken ? lerp(base, tip, 0.55) : tip;
    parts.push({ s: cap(base, end, 0.6), m: 'wood', sh: { k: 'flat' } });
    if (!broken) {
      const v = unit(sub(tip, base));
      const f0 = at(tip, v, -0.4, 0), f1 = at(tip, v, -6.2, 0);
      parts.push({ s: poly(at(f0, v, 0, -0.5), at(f0, v, -1.8, -2.5), at(f1, v, 0, -2.5), at(f1, v, -0.8, 0), at(f1, v, 0, 2.5), at(f0, v, -1.8, 2.5), at(f0, v, 0, 0.5)), m, sh: { k: 'ridge', a: f1, b: f0, tilt: 0.3 }, wear: 'soft' });
    }
  });
  parts.push({
    s: cap(B, T, 3.0, 3.6), m: 'leather', sh: { k: 'cyl', a: B, b: T, w: 3.4 }, bias: 0.14, wear: 'soft',
    marks: [{ a: at(B, u, 2, -1.8), b: at(T, u, -3, -2.2), t: 1 }],
  });
  parts.push({ s: cap(at(T, u, -0.8, 0), at(T, u, 0.9, 0), 4.0), m: 'brass', sh: { k: 'cyl', a: at(T, u, 0, -4), b: at(T, u, 0, 4), w: 4 }, shine: true, wear: 'metal' });
  parts.push({ s: ell(at(T, u, 1.0, 0), 3.1, 1.4, -48), m: 'shadow', sh: { k: 'flat' }, flush: true });
  parts.push({ s: cap(at(B, u, 0.4, 0), at(B, u, 2.0, 0), 3.3), m: 'dleather', sh: { k: 'cyl', a: at(B, u, 1, -3), b: at(B, u, 1, 3), w: 3 }, wear: 'soft' });
  // the strap, looped out at its left
  parts.push({ s: path([at(T, u, -2.2, -3.4), at(T, u, -6, -6.4), at(B, u, 6, -6.6), at(B, u, 2.6, -3.4)], [0.8, 0.9, 0.9, 0.8]), m: 'dleather', sh: { k: 'soft', r: 1 } });
  if (C) parts.push({ s: poly(at(B, u, 6, -1.4), at(B, u, 10.4, -1.8), at(B, u, 10.6, 2.2), at(B, u, 6.2, 2.4)), m: 'dleather', sh: { k: 'flat', bev: 1 }, marks: [{ a: at(B, u, 6.4, -1.8), b: at(B, u, 10.4, -2.0), t: 4 }] });
  return parts;
}

/** A crystal focus: a six-sided crystal standing in a gold cradle on a short handle. */
function focus(o: LookOpt): Part[] {
  const C = o.style === 'C';
  const parts: Part[] = [];
  parts.push({ s: cap([16, 22.6], [16, 28.0], 1.5), m: 'wood', sh: { k: 'cyl', a: [16, 22], b: [16, 28], w: 1.5 }, wear: 'wood' });
  parts.push({ s: ell([16, 28.6], 2.6, 1.7), m: 'gold', sh: { k: 'dome', c: [16, 28.4], r: 2.6, ry: 1.7 }, shine: true, wear: 'metal' });
  // the crystal: three faces, lit, middle, shaded, and its point
  const top: V = [16, 2.2];
  parts.push({ s: poly([11.0, 9.2], top, [16, 10.4], [16, 22.6], [11.0, 19.4]), m: 'teal', sh: { k: 'face', n: [-0.55, -0.2] }, shine: true, wear: 'gem' });
  parts.push({ s: poly(top, [21.0, 9.2], [21.0, 19.4], [16, 22.6], [16, 10.4]), m: 'teal', sh: { k: 'face', n: [0.5, 0.1] }, shine: true, wear: 'gem', flush: true });
  parts.push({ s: poly([13.6, 10.6], top, [18.4, 10.6], [18.4, 21.0], [16, 22.4], [13.6, 21.0]), m: 'teal', sh: { k: 'face', n: [-0.1, -0.15] }, shine: true, flush: true, marks: [{ a: [14.6, 12], b: [14.6, 17], t: 4 }, ...(C ? [{ a: [17.4, 8], b: [15.2, 13.6], t: 0 }, { a: [15.2, 13.6], b: [16.4, 17.4], t: 0 }] as Mark[] : [])] });
  // the cradle: a band round its foot and three claws up its sides
  parts.push({ s: poly([9.6, 17.8], [22.4, 17.8], [21.4, 21.2], [16, 23.6], [10.6, 21.2]), m: 'gold', sh: { k: 'soft', r: 2 }, shine: true, wear: 'metal' });
  parts.push({ s: path([[10.6, 18.6], [9.8, 14.6], [11.0, 11.8]], [1.1, 0.9, 0.6]), m: 'gold', sh: { k: 'soft', r: 1 }, shine: true });
  if (!C) parts.push({ s: path([[21.4, 18.6], [22.2, 14.6], [21.0, 11.8]], [1.1, 0.9, 0.6]), m: 'gold', sh: { k: 'soft', r: 1 }, shine: true });
  else parts.push({ s: path([[21.4, 18.6], [22.0, 16.6]], [1.1, 0.9]), m: 'gold', sh: { k: 'soft', r: 1 }, shine: true });
  parts.push({ s: ell([16, 20.2], 1.2), m: 'ruby', sh: { k: 'dome', c: [16, 20.2], r: 1.2 }, shine: true });
  return parts;
}

/** A knight's helmet turned a little to the left: a T-slit, a ridge over the top, a red crest. */
function helm(o: LookOpt): Part[] {
  const C = o.style === 'C';
  const parts: Part[] = [];
  // the crest, behind
  parts.push({ s: path([[11.4, 6.2], [16.0, 3.4], [22.0, 3.2], [27.0, 5.2], [29.0, 9.6], [29.0, 13.6]], C ? [1.6, 1.8, 1.6, 1.2, 0.8, 0.5] : [1.8, 2.0, 2.0, 1.9, 1.5, 1.0]), m: 'red', sh: { k: 'soft', r: 2 }, wear: 'soft', marks: [{ a: [16, 2.6], b: [26, 4.6], t: 3 }, { a: [25, 6], b: [28, 11], t: 1 }] });
  const shell = poly([8.0, 13.0], [9.4, 8.0], [12.8, 5.0], [17.0, 4.0], [21.4, 5.4], [24.4, 9.2], [25.4, 14.6], [26.4, 22.6], [25.0, 26.8], [21.0, 27.6], [12.6, 28.2], [9.2, 27.0], [7.8, 21.0]);
  parts.push({
    s: shell, m: 'steel', sh: { k: 'soft', r: 4.5 }, shine: true, wear: 'metal',
    marks: [{ a: [13.0, 5.0], b: [11.0, 12.0], t: 4 }, { a: [8.4, 24.4], t: 3 }, { a: [24.8, 24.6], t: 1 }, { a: [24.6, 12.4], t: 1 }, ...(C ? [{ a: [19.8, 17.4], b: [24.2, 21.8], t: 0 }, { a: [20.2, 17.0], b: [24.6, 21.4], t: 3 }] as Mark[] : [])],
    cut: C ? [ell([26.6, 26.6], 1.2, 1.0)] : undefined,
  });
  // the ridge over its top, down to the brow
  parts.push({ s: path([[16.4, 4.0], [15.2, 8.0], [14.4, 12.4]], [1.0, 1.0, 1.0]), m: 'steel', sh: { k: 'cyl', a: [16.4, 4], b: [14.4, 12.4], w: 1 }, shine: true, flush: true, bias: 0.15 });
  if (C) parts.push({ s: ell([20.0, 8.6], 2.0, 1.5), m: 'dsteel', sh: { k: 'dome', c: [20.6, 9.4], r: 2.2 }, flush: true, bias: -0.1 });
  // the T: the eye slit across, the breathing slit down
  parts.push({ s: poly([8.2, 13.4], [22.0, 13.2], [21.8, 15.6], [16.2, 15.8], [16.2, 23.4], [13.6, 23.4], [13.6, 15.8], [8.4, 15.8]), m: 'shadow', sh: { k: 'flat' } });
  for (const r of [[10.6, 19.6], [19.6, 19.6], [21.2, 24.0], [10.8, 24.6]] as V[]) parts.push({ s: ell(r, 0.75), m: 'brass', sh: { k: 'dome', c: r, r: 0.8 }, shine: true, flush: true });
  return parts;
}

/** A cloth hood with its point drooping back and a short cape over the shoulders, its face in shadow. */
function hood(o: LookOpt): Part[] {
  const C = o.style === 'C';
  const parts: Part[] = [];
  const hem: V[] = C
    ? [[30.4, 29.0], [28.0, 28.0], [26.0, 29.8], [23.2, 28.2], [21.4, 29.8], [16, 28.8], [12.0, 29.8], [9.6, 28.4], [7.4, 29.6], [4.6, 28.2], [1.6, 29.2]]
    : [[30.4, 29.4], [22.0, 28.6], [16, 29.6], [10.0, 28.6], [1.6, 29.4]];
  parts.push({ s: poly([5.6, 21.0], [7.6, 13.0], [10.4, 7.0], [14.6, 3.4], [19.6, 2.0], [24.6, 2.6], [28.4, 4.8], [30.4, 9.6], [30.6, 16.4], [29.4, 17.0], [28.0, 11.6], [25.4, 8.8], [25.6, 15.6], [26.6, 21.0], [30.4, 25.4], ...hem, [1.6, 25.4]), m: 'green', sh: { k: 'soft', r: 4.5 }, wear: 'soft', marks: [{ a: [8.4, 24], b: [11.4, 28.4], t: 1 }, { a: [23.6, 24], b: [21.4, 28.4], t: 1 }, { a: [12.6, 5.6], b: [9.4, 11.6], t: 3 }] });
  // the face opening: a leather-trimmed edge round the shadow
  parts.push({ s: ell([15.4, 15.4], 6.6, 8.0, -6), m: 'leather', sh: { k: 'soft', r: 2 }, wear: 'soft' });
  parts.push({ s: ell([15.6, 15.8], 5.0, 6.6, -6), m: 'shadow', sh: { k: 'flat' }, marks: [{ a: [13.0, 15.6], t: 2 }, { a: [17.6, 15.6], t: 2 }] });
  // the cape's fold at the chin
  parts.push({ s: poly([9.4, 22.4], [15.6, 25.2], [21.6, 22.4], [20.4, 26.0], [15.6, 27.6], [10.8, 26.0]), m: 'green', sh: { k: 'soft', r: 2 }, bias: 0.05 });
  if (C) parts.push({ s: poly([20.0, 4.4], [24.2, 4.6], [24.4, 8.4], [20.2, 8.6]), m: 'leather', sh: { k: 'flat', bev: 1 }, marks: [{ a: [19.8, 4.2], b: [24.4, 4.4], t: 4 }, { a: [24.6, 4.6], b: [24.6, 8.4], t: 4 }] });
  return parts;
}

/** A breastplate with shoulder plates, a fauld of two bands, and a belt. */
function armor(o: LookOpt): Part[] {
  const C = o.style === 'C';
  const parts: Part[] = [];
  parts.push({ s: poly([9.2, 22.4], [22.8, 22.4], [24.6, 26.4], [16, 27.4], [7.4, 26.4]), m: 'steel', sh: { k: 'soft', r: 1.6 }, shine: true, wear: 'metal' });
  parts.push({ s: poly([8.4, 25.6], [23.6, 25.6], [25.6, 29.4], [16, 30.4], [6.4, 29.4]), m: 'steel', sh: { k: 'soft', r: 1.6 }, shine: true, wear: 'metal', bias: -0.08 });
  parts.push({
    s: poly([8.4, 7.4], [12.6, 6.0], [16, 9.4], [19.4, 6.0], [23.6, 7.4], [25.0, 13.4], [23.6, 20.4], [16, 23.4], [8.4, 20.4], [7.0, 13.4]),
    m: 'steel', sh: { k: 'ridge', a: [16, 9], b: [16, 23], tilt: 0.3 }, shine: true, wear: 'metal',
    marks: [{ a: [12.6, 6.4], b: [16, 9.6], t: '#f6cc5c' }, { a: [16, 9.6], b: [19.4, 6.4], t: '#d0902c' }, { a: [11.0, 11.6], b: [11.6, 16.0], t: 4 }, ...(C ? [{ a: [18.4, 12.0], b: [22.4, 16.6], t: 0 }, { a: [18.8, 11.6], b: [22.8, 16.2], t: 3 }] as Mark[] : [])],
  });
  parts.push({ s: cap([16, 9.6], [16, 22.4], 0.7), m: 'steel', sh: { k: 'flat' }, flush: true, bias: 0.1 });
  for (const sx of [-1, 1]) {
    const c: V = [16 + sx * 9.8, 8.6];
    const pauldron: V[] = [[c[0] - 5 * sx, c[1] + 4.4], [c[0] - 4.4 * sx, c[1] - 1.8], [c[0] - 1.4 * sx, c[1] - 4.2], [c[0] + 2.6 * sx, c[1] - 3.6], [c[0] + 4.6 * sx, c[1] + 0.4], [c[0] + 3.4 * sx, c[1] + 3.6], [c[0] + 0.2 * sx, c[1] + 2.4]];
    parts.push({ s: poly(...pauldron), m: 'steel', sh: { k: 'dome', c: [c[0] - sx * 0.6, c[1] - 0.6], r: 5.2 }, shine: true, wear: 'metal', marks: [{ a: [c[0] - 4.2 * sx, c[1] + 3.2], b: [c[0] + 3 * sx, c[1] + 3.2], t: '#d0902c' }] });
  }
  parts.push({ s: poly([7.6, 19.8], [24.4, 19.8], [24.0, 22.4], [8.0, 22.4]), m: 'leather', sh: { k: 'flat', bev: 1 }, wear: 'soft' });
  parts.push({ s: poly([14.4, 19.4], [17.6, 19.4], [17.6, 22.8], [14.4, 22.8]), cut: [poly([15.4, 20.4], [16.6, 20.4], [16.6, 21.8], [15.4, 21.8])], m: 'gold', sh: { k: 'flat', bev: 1 }, shine: true, wear: 'metal' });
  if (!C) for (const r of [[10.2, 9.4], [21.8, 9.4]] as V[]) parts.push({ s: ell(r, 0.7), m: 'gold', sh: { k: 'dome', c: r, r: 0.7 }, shine: true, flush: true });
  else parts.push({ s: ell([10.2, 9.4], 0.7), m: 'gold', sh: { k: 'dome', c: [10.2, 9.4], r: 0.7 }, shine: true, flush: true });
  return parts;
}

/** A long robe, hung up: wide bell sleeves, a flared hem, gold trim down its front and a sash at the waist. */
function robe(o: LookOpt): Part[] {
  const C = o.style === 'C';
  const parts: Part[] = [];
  const hem: V[] = C ? [[27.6, 30.4], [25.4, 28.8], [23.4, 30.6], [20.2, 29.2], [16, 30.6], [12.8, 29.0], [10.0, 30.6], [7.2, 29.0], [4.4, 30.4]] : [[27.6, 30.4], [16, 30.8], [4.4, 30.4]];
  parts.push({ s: poly([11.2, 3.0], [16, 6.4], [20.8, 3.0], [23.4, 4.8], [23.0, 14.0], [24.6, 22.0], ...hem, [7.4, 22.0], [9.0, 14.0], [8.6, 4.8]), m: 'vcloth', sh: { k: 'soft', r: 4 }, wear: 'soft', marks: [{ a: [11.4, 18], b: [9.6, 28.6], t: 1 }, { a: [20.8, 18], b: [22.6, 28.6], t: 1 }, { a: [13.2, 22], b: [12.6, 29], t: 2 }] });
  for (const sx of [-1, 1]) {
    const x = (v: number): number => 16 + sx * v;
    parts.push({ s: poly([x(7.4), 4.4], [x(11.8), 8.6], [x(14.8), 17.4], [x(14.6), 21.2], [x(10.4), 21.8], [x(8.2), 15.0], [x(6.6), 9.6]), m: 'vcloth', sh: { k: 'soft', r: 2.5 }, wear: 'soft', bias: sx < 0 ? 0.05 : -0.05, marks: [{ a: [x(14.4), 20.6], b: [x(10.6), 21.2], t: '#d0902c' }, { a: [x(10.6), 12.4], b: [x(12.4), 19.0], t: 1 }] });
  }
  parts.push({ s: poly([14.6, 6.2], [16, 7.4], [17.4, 6.2], [17.8, 30.4], [14.2, 30.4]), m: 'gold', sh: { k: 'flat', bev: 1 }, shine: true, wear: 'metal' });
  parts.push({ s: poly([10.8, 3.2], [16, 6.8], [21.2, 3.2], [21.8, 4.4], [16, 8.4], [10.2, 4.4]), m: 'gold', sh: { k: 'flat', bev: 1 }, shine: true });
  parts.push({ s: poly([8.6, 14.4], [23.4, 14.4], [23.6, 16.8], [8.4, 16.8]), m: 'red', sh: { k: 'flat', bev: 1 }, wear: 'soft' });
  parts.push({ s: path([[19.4, 16.4], [20.4, 19.6], [19.8, 23.0]], [1.0, 0.9, 0.8]), m: 'red', sh: { k: 'soft', r: 1 } });
  if (!C) parts.push({ s: poly([4.4, 29.2], [27.6, 29.2], [27.6, 30.6], [16, 31.0], [4.4, 30.6]), m: 'gold', sh: { k: 'flat', bev: 0.6 }, shine: true, flush: true });
  else parts.push({ s: poly([24.4, 9.0], [27.2, 9.6], [27.0, 13.6], [24.6, 13.2]), m: 'green', sh: { k: 'flat', bev: 1 }, marks: [{ a: [24.2, 8.8], b: [24.4, 13.2], t: 3 }] });
  return parts;
}

/** A steel gauntlet, the back of the hand toward you: four plated fingers, the thumb out, a flared cuff. */
function gloves(o: LookOpt): Part[] {
  const C = o.style === 'C';
  const parts: Part[] = [];
  parts.push({ s: poly([10.0, 22.0], [22.6, 22.0], [25.2, 29.6], [7.4, 29.6]), m: 'steel', sh: { k: 'soft', r: 2.4 }, shine: true, wear: 'metal', marks: [{ a: [8.4, 28.0], b: [24.4, 28.0], t: '#d0902c' }] });
  parts.push({ s: poly([10.6, 11.8], [22.0, 11.0], [22.6, 18.6], [21.4, 22.6], [11.0, 22.6], [10.0, 17.6]), m: 'leather', sh: { k: 'soft', r: 2.5 }, wear: 'soft' });
  const fingers: [V, V][] = [[[12.4, 12.6], [11.2, 4.2]], [[15.4, 12.0], [15.0, 2.8]], [[18.4, 12.0], [18.8, 3.4]], [[21.0, 12.6], [22.6, 5.8]]];
  fingers.forEach(([a, b], i) => {
    const bare = C && i === 2;
    const u = unit(sub(b, a));
    parts.push({ s: cap(a, b, 1.62), m: bare ? 'leather' : 'steel', sh: { k: 'cyl', a, b, w: 1.6 }, shine: !bare, wear: bare ? 'soft' : 'metal', marks: bare ? [] : [3, 5.8].map((d) => ({ a: at(a, u, d, -1.5), b: at(a, u, d, 1.5), t: 0 })) });
  });
  parts.push({ s: poly([10.4, 12.4], [22.2, 11.6], [22.6, 18.4], [16.4, 19.6], [10.2, 18.0]), m: 'steel', sh: { k: 'soft', r: 3 }, shine: true, wear: 'metal', marks: [{ a: [11.2, 13.4], b: [21.2, 12.8], t: 4 }] });
  parts.push({ s: path([[11.6, 19.0], [7.8, 16.4], [5.2, 12.4]], [2.0, 1.7, 1.4]), m: 'steel', sh: { k: 'cyl', a: [11.6, 19], b: [5.2, 12.4], w: 1.8 }, shine: true, wear: 'metal', marks: [{ a: [7, 15.6], b: [8.6, 13.6], t: 0 }] });
  return parts;
}

/** A belt in a loop, its buckle at the front, a pouch hung at its side. */
function belt(o: LookOpt): Part[] {
  const C = o.style === 'C';
  const parts: Part[] = [];
  const c: V = [16, 15.6];
  // the back of the loop (its inside, in shadow), then the front; its holes (more punched in an old one)
  const holes: V[] = C ? [[21.6, 23.2], [24.0, 22.2], [26.0, 21.0], [19.4, 23.8]] : [[21.6, 23.2], [24.0, 22.2]];
  parts.push({ s: ell(c, 13.8, 9.0), cut: [ell([16, 17.2], 10.0, 5.0), poly([0, 16], [32, 16], [32, 32], [0, 32])], m: 'leather', sh: { k: 'flat' }, bias: -0.36, wear: 'soft' });
  parts.push({ s: ell(c, 13.8, 9.0), cut: [ell([16, 13.6], 10.4, 5.4), poly([0, 0], [32, 0], [32, 15.4], [0, 15.4])], m: 'leather', sh: { k: 'soft', r: 2.2 }, wear: 'soft', marks: [{ a: [6, 19.6], b: [10, 21.6], t: 3 }, ...holes.map((p) => ({ a: p, t: 0 }))] });
  // the tail through the buckle, hanging down
  parts.push({ s: poly([13.6, 22.6], [17.4, 22.6], C ? [18.0, 28.0] : [17.8, 29.4], C ? [16.6, 29.0] : [16.0, 30.4], C ? [14.8, 28.4] : [14.2, 29.4]), m: 'leather', sh: { k: 'soft', r: 1.4 }, wear: 'soft', bias: 0.05 });
  parts.push({ s: poly([11.8, 19.2], [20.2, 19.2], [20.2, 26.0], [11.8, 26.0]), cut: [poly([13.6, 20.8], [18.4, 20.8], [18.4, 24.4], [13.6, 24.4])], m: 'gold', sh: { k: 'flat', bev: 1.2 }, shine: true, wear: 'metal' });
  parts.push({ s: cap([13.6, 22.6], [17.6, 22.6], 0.55), m: 'gold', sh: { k: 'flat' }, shine: true });
  // the pouch, hung at its right
  parts.push({ s: poly([22.4, 19.8], [29.0, 18.6], [29.6, 25.4], [27.6, 28.0], [23.2, 28.0], [21.8, 25.0]), m: 'dleather', sh: { k: 'soft', r: 2.4 }, bias: 0.2, wear: 'soft' });
  parts.push({ s: poly([22.0, 19.4], [29.4, 18.2], [29.4, 21.8], [25.8, 23.6], [22.2, 22.6]), m: 'leather', sh: { k: 'soft', r: 1.2 }, bias: 0.05 });
  parts.push({ s: ell([25.8, 22.6], 0.9), m: 'brass', sh: { k: 'dome', c: [25.8, 22.6], r: 0.9 }, shine: true });
  return parts;
}

/** A tall leather boot from the side, its toe to the left: a folded cuff, a strap and buckle, a heel. */
function boots(o: LookOpt): Part[] {
  const C = o.style === 'C';
  const parts: Part[] = [];
  parts.push({ s: poly([13.0, 6.0], [23.8, 6.0], [24.6, 15.0], [25.4, 24.0], [26.4, 27.6], [26.0, 28.6], [4.6, 28.6], [3.6, 25.6], [6.0, 22.8], [11.4, 20.6], [12.6, 15.0]), m: 'leather', sh: { k: 'soft', r: 3.5 }, wear: 'soft', marks: [{ a: [14.4, 8.6], b: [14.0, 19.0], t: 3 }, { a: [8.0, 22.6], b: [5.6, 25.0], t: 3 }, { a: [22.4, 10], b: [23.0, 22], t: 1 }] });
  parts.push({ s: poly([11.8, 2.6], [25.2, 2.4], [25.4, 7.6], [24.0, 8.6], [12.6, 8.6], [11.4, 7.4]), m: 'leather', sh: { k: 'soft', r: 1.8 }, bias: 0.12, wear: 'soft', marks: C ? [{ a: [18.0, 7.6], b: [19.4, 9.0], t: 0 }] : [] });
  parts.push({ s: poly([3.4, 27.6], [26.8, 27.6], [26.8, 30.2], [4.8, 30.2], [3.0, 29.0]), m: 'dleather', sh: { k: 'flat', bev: 0.8 }, marks: C ? [6, 9, 12, 15, 18].map((x) => ({ a: [x, 29.4] as V, t: '#b2b2bc' })) : [] });
  parts.push({ s: poly([19.6, 26.8], [26.8, 26.8], [26.8, 30.4], [20.0, 30.4]), m: 'dleather', sh: { k: 'flat', bev: 1 }, bias: -0.1 });
  parts.push({ s: poly([11.8, 17.8], [25.0, 16.0], [25.2, 18.6], [12.0, 20.6]), m: 'dleather', sh: { k: 'flat', bev: 0.8 } });
  parts.push({ s: poly([15.0, 16.6], [18.6, 16.2], [18.8, 20.0], [15.2, 20.4]), cut: [poly([16.0, 17.6], [17.8, 17.4], [17.8, 19.2], [16.0, 19.4])], m: 'brass', sh: { k: 'flat', bev: 1 }, shine: true, wear: 'metal' });
  if (C) parts.push({ s: poly([3.6, 24.0], [8.4, 22.6], [9.0, 27.4], [3.8, 27.4]), m: 'dleather', sh: { k: 'flat', bev: 1 }, marks: [{ a: [4.0, 23.8], b: [8.6, 22.6], t: 4 }, { a: [8.8, 23.0], b: [9.0, 27.0], t: 4 }] });
  return parts;
}

/** A gold ring, tilted toward you, a big faceted ruby in claws on top. */
function ring(o: LookOpt): Part[] {
  const C = o.style === 'C';
  const parts: Part[] = [];
  const c: V = [16, 20.6];
  parts.push({ s: ell(c, 10.2, 8.6), cut: [ell([16, 19.4], 6.6, 5.2)], m: 'gold', sh: { k: 'soft', r: 2.6 }, shine: true, wear: 'metal', marks: C ? ([[10.4, 27.0], [13.4, 28.4], [18.6, 28.4], [21.6, 27.0]] as V[]).map((p) => ({ a: p, t: 1 })) : [{ a: [8.0, 17.0], b: [7.6, 21.6], t: 4 }] });
  // the setting
  parts.push({ s: poly([10.4, 12.6], [21.6, 12.6], [20.0, 15.6], [12.0, 15.6]), m: 'gold', sh: { k: 'soft', r: 1.6 }, shine: true, wear: 'metal' });
  const g: V = [16, 8.4];
  const gem = poly([12.6, 3.0], [19.4, 3.0], [22.0, 6.4], [22.0, 10.0], [19.0, 13.6], [13.0, 13.6], [10.0, 10.0], [10.0, 6.4]);
  parts.push({ s: gem, m: 'ruby', sh: { k: 'dome', c: g, r: 6.4, ry: 5.8 }, shine: true, wear: 'gem', cut: C ? [poly([18.6, 1.6], [23.6, 2.0], [22.6, 6.6])] : undefined, marks: [{ a: [13.4, 5.4], b: [18.6, 5.4], t: 3 }, { a: [12.6, 9.6], b: [19.4, 9.6], t: 1 }, { a: [13.6, 4.4], t: 4 }, { a: [14.4, 4.4], t: 4 }] });
  for (const p of [[10.6, 6.2], [21.4, 6.2], [11.2, 12.2], [20.8, 12.2]] as V[]) parts.push({ s: ell(p, 1.0), m: 'gold', sh: { k: 'dome', c: p, r: 1 }, shine: true });
  return parts;
}

/** An amulet: a chain hung in a V, a gold setting with a sapphire. */
function amulet(o: LookOpt): Part[] {
  const C = o.style === 'C';
  const parts: Part[] = [];
  const L: V[] = [[4.6, 3.0], [5.8, 8.6], [9.0, 13.4], [13.2, 16.6]];
  const R: V[] = [[27.4, 3.0], [26.2, 8.6], [23.0, 13.4], [18.8, 16.6]];
  for (const ch of [L, R]) {
    const links: Mark[] = [];
    for (let i = 0; i + 1 < ch.length; i++) for (let t = 0; t < 1; t += 0.34) links.push({ a: lerp(ch[i], ch[i + 1], t), t: 4 });
    parts.push({ s: path(ch, [0.95, 0.95, 0.95, 0.95]), m: 'gold', sh: { k: 'flat' }, shine: true, wear: 'metal', marks: links });
  }
  if (C) parts.push({ s: ell([7.0, 11.2], 1.4), m: 'string', sh: { k: 'soft', r: 1 } });
  parts.push({ s: ell([16, 16.8], 2.2, 1.8), cut: [ell([16, 16.8], 1.0, 0.8)], m: 'gold', sh: { k: 'soft', r: 1 }, shine: true });
  const c: V = [16, 23.4];
  parts.push({ s: poly([16, 17.6], [21.6, 20.6], [22.0, 25.4], [16, 30.4], [10.0, 25.4], [10.4, 20.6]), m: 'gold', sh: { k: 'soft', r: 2.2 }, shine: true, wear: 'metal' });
  parts.push({ s: ell(c, 3.6, 4.2), m: 'sapphire', sh: { k: 'dome', c, r: 3.6, ry: 4.2 }, shine: true, wear: 'gem', cut: C ? [poly([18.6, 19.0], [21.0, 21.0], [18.6, 22.0])] : undefined, marks: C ? [{ a: [14.6, 22], b: [17.4, 26.2], t: 0 }] : [] });
  return parts;
}

/** THE VETERAN'S WRAPS: two fists' worth of hand wraps, linen bound round and round, leather straps over the knuckles, a brass
 * plate across the front fist's, the ends trailing loose. A two-handed weapon, so a pair. */
function wraps(o: LookOpt): Part[] {
  const C = o.style === 'C';
  const parts: Part[] = [];
  // a fist seen from the front, knuckles up, in its own frame: (0, 0) the middle of the fist, `k` times its size, turned by `deg`
  const fist = (cx: number, cy: number, k: number, deg: number, plate: boolean, back: boolean): void => {
    const r = (deg * Math.PI) / 180;
    const t = (p: V): V => [cx + k * (p[0] * Math.cos(r) - p[1] * Math.sin(r)), cy + k * (p[0] * Math.sin(r) + p[1] * Math.cos(r))];
    const tp = (ps: V[]): V[] => ps.map(t);
    const b = back ? -0.2 : 0;
    // the loose end, trailing from the wrist
    parts.push({ s: path(tp([[-2.6, 7.4], [-5.2, 9.2], [-5.4, 11.6]]), [1.0 * k, 0.9 * k, 0.7 * k]), m: 'linen', sh: { k: 'soft', r: 1 }, bias: b - 0.12, wear: 'soft' });
    // the wrist and forearm, bound round and round
    parts.push({
      s: cap(t([0, 4]), t([0.3, 9.4]), 3.9 * k, 3.6 * k), m: 'linen', sh: { k: 'cyl', a: t([0, 4]), b: t([0.3, 9.4]), w: 3.8 * k }, bias: b - 0.05, wear: 'soft',
      marks: [6.4, 8.4].map((y) => ({ a: t([-3.8, y]), b: t([3.8, y - 1.6]), t: 1 })),
    });
    // the back of the fist, behind the fingers
    parts.push({ s: poly(...tp([[-6.4, -3.0], [6.4, -3.0], [6.2, 4.8], [4.6, 6.4], [-4.6, 6.4], [-6.4, 4.6]])), m: 'linen', sh: { k: 'soft', r: 2.4 }, bias: b - 0.1, wear: 'soft' });
    // the four fingers, rolled under: their middle bones toward you, side by side
    [-4.8, -1.6, 1.6, 4.8].forEach((x, i) => {
      const top = i === 1 || i === 2 ? -4.6 : -3.9;
      parts.push({ s: cap(t([x, top]), t([x, 2.2]), 1.62 * k), m: 'linen', sh: { k: 'cyl', a: t([x - 1, 0]), b: t([x + 1, 0]), w: 1.7 * k }, bias: b + 0.04, wear: 'soft' });
    });
    // the thumb, folded across their foot
    parts.push({ s: cap(t([-6.3, 4.4]), t([1.4, 3.4]), 1.7 * k), m: 'linen', sh: { k: 'cyl', a: t([-6, 4.4]), b: t([1.4, 3.4]), w: 1.7 * k }, bias: b + 0.1, wear: 'soft' });
    if (plate) {
      // a brass plate across the knuckles, studded
      parts.push({ s: path(tp([[-6.6, -5.0], [0, -5.6], [6.6, -5.0]]), [1.15 * k, 1.25 * k, 1.15 * k]), m: 'brass', sh: { k: 'soft', r: 1.2 }, shine: true, wear: 'metal' });
      for (const x of [-4.8, -1.6, 1.6, 4.8]) parts.push({ s: ell(t([x, -5.3]), 0.8 * k), m: 'steel', sh: { k: 'dome', c: t([x, -5.3]), r: 0.85 * k }, shine: true, flush: true });
    } else {
      // a leather strap across them
      parts.push({ s: path(tp([[-6.6, -1.2], [0, -1.6], [6.6, -1.2]]), [1.0 * k, 1.05 * k, 1.0 * k]), m: 'dleather', sh: { k: 'soft', r: 1 }, bias: b, wear: 'soft' });
    }
    if (C && plate) parts.push({ s: ell(t([1.6, -1.0]), 1.4 * k, 1.1 * k), m: 'red', sh: { k: 'flat' }, flush: true, bias: -0.5 });
  };
  fist(23.4, 10.6, 0.92, 14, false, true);
  fist(12.4, 14.4, 1.18, -6, true, false);
  return parts;
}

type Painter = (o: LookOpt) => Part[];
const PAINTERS: Partial<Record<LookKind, Painter>> = { sword, greatsword, bow, wand, staff, wraps, shield, quiver, focus, helm, hood, armor, robe, gloves, belt, boots, ring, amulet };

/** One item, in one style, at one rarity: a 32 by 32 picture. */
export function paintItemLook(kind: LookKind, style: LookStyle, rar: 0 | 1 | 2 | 3 = 0): Px {
  const f = PAINTERS[kind];
  if (!f) throw new Error(`items_look: no painter for ${kind}`);
  return paint(`${kind}:${style}`, f({ style, rar }), { style, rar });
}
export const LOOK_READY = (): LookKind[] => ITEM_LOOK_KINDS.filter((k) => PAINTERS[k]);
