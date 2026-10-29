// FLOOR 19, THE KEEP (the High City): THE PAINTING, A FIRST LOOK (an art helper for the art chat, 29 Oct 2026). A MOCK-UP;
// NOTHING OF THE GAME IMPORTS IT.
//
// His doc "Wordsmith Act 2, Part Two: The High City (Levels 16–20)" (planned with him in the main chat; his "Yes, go
// (Recommended)"), level 19: "Level 19: The Keep. The old castle at the hill's crown, where the king lies dying." Its
// layout "walls and towers: battlements, a gatehouse, the barracks and the armoury, the throne hall, and the king's
// bedchamber at the top of the keep."; its hazards "murder holes that drop pitch, and portcullises that slam down to cut
// a hall in two."; its palette "Cold stone, royal blue, old gold."; its boss the King, "His floor is the Throne Hall."
// Its story from Andersen's "The Nightingale" (1843), drawn only from the book.
//
// WHAT IS PAINTED (one corner of the Keep, about a phone screen and a half), at night, the moon over the battlements:
// - THE THRONE HALL, its roof and near walls cut away as the game cuts them: a floor of great flags in a chequer of cold
//   grey and slate; the royal runner, royal blue bordered in old gold, worn and torn, from the dais down the hall; at its
//   head, against the far wall, THE THRONE on a dais of three steps, empty, under its cloth of estate (royal blue, the
//   royal crest in old gold) and its canopy; TALL BANNERS of royal blue and old gold down the walls, the royal crest on
//   each, one torn and burnt at its foot; a tall window, the moon in its panes; torches in iron sconces and two braziers
//   either side of the dais, honest fire, their light warm on the cold stone; two suits of armour standing empty.
// - THE GATEHOUSE on the left, its passage cut open along its length: setts worn into ruts; THE MURDER HOLES in its
//   vault, pitch dripping from one into a black pool smoking on the setts; the great doors shut at its far end; and at
//   its mouth into the hall, A RAISED PORTCULLIS, its spikes showing under the arch.
// - THE BATTLEMENTS along the tops of the walls, the gatehouse's and two towers', merlons against the night sky, the moon
//   cold on them.
// - The knight on the runner, for scale (the preview page stands him there).
//
// His art rulebook kept: one camera, the game's (a tile 64 x 32 picture pixels, heights up in picture pixels, two to a
// game pixel); light from the upper left; three tones or so a material, more where a fire lights it (Pixels 4); no black
// outlines, the seams a deep indigo; a step quieter than the figures, every colour under the dullest word's (Colour 4:
// the whole painting goes through art/act2_quiet.ts at the end, the fires aside); nothing cyan (the royal blue held to a
// true blue, hue 220 and more); no pink; nothing glows but honest fire (Colour 3: the moon is a light on things, never a
// glow; the old gold is metal and thread, dull); real shapes; old, broken and burnt (Places 6); crisp pixels.
//
// HOW IT FITS THE GAME (art/keep.ts, art/floor19.ts): the game walks on one level; its walls are the ground's walls,
// faced in the Keep's stone, and the battlements are the open-air walks' low parapets with the sky above them; the
// throne, the banners, the torches, the braziers, the portcullis, the murder holes and the rest are pieces.

import { Px } from '../engine/px';
import { Scene } from '../art/floor4';
import type { V3 } from '../art/floor4';
import { hash } from '../art/kit';
import { EMBER } from '../art/props';
import { quietHex } from '../art/act2_quiet';

// =================================================================================================
// THE PALETTE: cold stone, royal blue, old gold; the night; honest fire

/** Seven tones of a material: seam, deep, shade, body, light, lit edge, lit by a fire. */
type R7 = readonly [string, string, string, string, string, string, string];
export const PAL = {
  /** Cold stone, a grey with blue in it: the ashlar, the flags. */
  stone: ['#0d0f17', '#161a26', '#202635', '#2b3243', '#384052', '#4a5366', '#616b80'] as R7,
  /** Slate, the chequer's dark flags. */
  slate: ['#0a0c14', '#11141f', '#181c2a', '#202536', '#292f42', '#353c52', '#454d66'] as R7,
  /** Royal blue cloth (never the friend's cyan: hue 220 and more). */
  royal: ['#0c0e1c', '#141a30', '#1d2444', '#262f58', '#303b6a', '#3e4a7c', '#4e5a8c'] as R7,
  /** Old gold, thread and gilt, dull: never a glow. */
  gold: ['#1e1810', '#332917', '#4d3e20', '#69552c', '#86703a', '#a28a4c', '#bba264'] as R7,
  /** Iron, blue-grey. */
  iron: ['#0b0c12', '#13151d', '#1c1f29', '#272b37', '#353a48', '#4a505f', '#646b7b'] as R7,
  /** Polished steel: the armour. */
  steel: ['#10121a', '#1c1f2a', '#2b2f3d', '#3e4354', '#575d70', '#7a8194', '#a1a8b8'] as R7,
  /** Old oak, dark. */
  oak: ['#120d0e', '#1d1515', '#2a1e1b', '#382822', '#47342a', '#5a4434', '#6e5541'] as R7,
  /** Pitch, black, its sheen cold. */
  pitch: ['#050407', '#09080c', '#0f0d13', '#16131b', '#211d27', '#312c38', '#474150'] as R7,
  /** The night sky, from deep to its palest, low over the walls. */
  sky: ['#05060c', '#070912', '#0a0d19', '#0d1121', '#11162a'] as const,
  star: ['#5f6680', '#9aa0b6'] as const,
  /** The moon, a light on things: never a glow. */
  moon: ['#7e8396', '#a3a8b8', '#c3c7d2', '#d6d9e0'] as const,
  /** Grey smoke off the hot pitch. */
  smoke: ['#1c1b22', '#26242d', '#33313b'] as const,
  /** The deep dark past everything. */
  deep: '#06070c',
  /** A seam: a deep indigo, never black. */
  seam: '#0e0c24',
} as const;
/** The warmth a fire throws on what it lights (mixed in, a step at a time). */
const WARM = '#d6955a';
const FIRE = new Set(EMBER.map((c) => c.toLowerCase()));

// =================================================================================================
// THE PLACE, in tiles (x down the screen to the right, y down to the left, as the game's); heights in picture pixels

export const W = 1200;
export const H = 840;
/** The world's (0, 0, 0), the far corner of the throne hall's floor, on the picture. */
export const OX = 640;
export const OY = 320;
/** A tile in the depth painter's units (floor 4's Scene: 40 to a tile). */
const U = 40;
/** The walls' height; the gatehouse's; the towers'. */
const WALL_H = 140;
const GATE_H = 170;
const TOWER_H = 200;
/** The throne hall: x from 0 to HX, y from 0 to HY (tiles). */
const HX = 11;
const HY = 13;
/** Walls a tile thick. */
const THICK = 1;
/** The gate passage: along x from GX0 to 0, y from GY0 to GY1; its vault springs at SPRING, a tile across. */
const GX0 = -7;
const GY0 = 8;
const GY1 = 10;
const SPRING = 70;
/** The dais and the throne at its head. */
const DAIS = { x0: 4.0, x1: 7.0, y1: 2.2 };
const THRONE: V3 = [5.5 * U, 0.62 * U, 21];
/** Where the hero stands: on the runner, half way down the hall. */
export const HERO_AT: readonly [number, number] = [5.5, 8.4];
/** The murder holes in the vault (x, tiles), the one that drips. */
const HOLES = [-2.6, -4.0, -5.4];
const DRIP = 1;
const HOLE_TH = (22 * Math.PI) / 180;

export const at = (x: number, y: number, z = 0): [number, number] => [OX + (x - y) * 32, OY + (x + y) * 16 - z];

// =================================================================================================
// Helpers

const rgbOf = (c: string): [number, number, number] => [parseInt(c.slice(1, 3), 16), parseInt(c.slice(3, 5), 16), parseInt(c.slice(5, 7), 16)];
const hexOf = (r: number, g: number, b: number): string => '#' + [r, g, b].map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join('');
export function mixC(a: string, b: string, k: number): string {
  const A = rgbOf(a);
  const B = rgbOf(b);
  return hexOf(A[0] + (B[0] - A[0]) * k, A[1] + (B[1] - A[1]) * k, A[2] + (B[2] - A[2]) * k);
}
const cl = (v: number, a: number, b: number): number => Math.max(a, Math.min(b, v));
const fr = (t: number): number => t - Math.floor(t);
const norm = (a: readonly number[]): V3 => {
  const n = Math.hypot(a[0], a[1], a[2]) || 1;
  return [a[0] / n, a[1] / n, a[2] / n];
};
const dot = (a: readonly number[], b: readonly number[]): number => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const BAYER = [
  [0, 8, 2, 10],
  [12, 4, 14, 6],
  [3, 11, 1, 9],
  [15, 7, 13, 5],
];
const bayer = (x: number, y: number): number => (BAYER[((y % 4) + 4) % 4][((x % 4) + 4) % 4] + 0.5) / 16;
function noise(x: number, y: number, k = 0): number {
  const xi = Math.floor(x);
  const yi = Math.floor(y);
  const u = fr(x);
  const v = fr(y);
  const s = (t: number): number => t * t * (3 - 2 * t);
  const a = hash(xi, yi, k);
  const b = hash(xi + 1, yi, k);
  const c = hash(xi, yi + 1, k);
  const d = hash(xi + 1, yi + 1, k);
  return a + (b - a) * s(u) + (c - a) * s(v) + (a - b - c + d) * s(u) * s(v);
}

/** The light from the upper left (his rulebook): the moon over the walls. */
const LIGHT = norm([-0.55, 0.45, 0.7]);

// =================================================================================================
// THE FIRES and the warmth they throw

interface Fire {
  at: V3;
  /** How strong, and how far it reaches (units). */
  a: number;
  r: number;
}
const FIRES: Fire[] = [];
/** How much warm light falls on a point of the world turned `n`. */
function warmth(w: readonly number[], n: readonly number[]): number {
  let I = 0;
  for (const f of FIRES) {
    const d = [f.at[0] - w[0], f.at[1] - w[1], f.at[2] - w[2]];
    const dl = Math.hypot(d[0], d[1], d[2]) || 1;
    const face = Math.max(0, dot(d, n) / dl);
    I += (f.a * (0.2 + 0.8 * face)) / (1 + (dl / f.r) ** 2);
  }
  return I;
}

let S: Scene;
/**
 * A COLOUR OF A MATERIAL at a point of the world: the tone `idx` of its ramp, lifted a step or two where a fire lights it
 * (crisp, in steps, a fine checker where one step meets the next) and warmed with it.
 */
function lit(R: R7, idx: number, w: readonly number[], n: readonly number[], k = 1): string {
  const [sx, sy] = S.at(w);
  const I = warmth(w, n) * k;
  const v = I + (bayer(Math.floor(sx), Math.floor(sy)) - 0.5) * 0.07;
  const q = v > 1.15 ? 3 : v > 0.62 ? 2 : v > 0.3 ? 1 : 0;
  const t = cl(Math.round(idx) + q, 0, 6);
  const c = R[t];
  return q ? mixC(c, WARM, [0, 0.1, 0.18, 0.26][q]) : c;
}
/** The tone a face turned `n` takes in the moon's light (1 deep to 5 lit edge), `bias` added. */
function toneOf(n: readonly number[], bias = 0): number {
  const l = dot(n, LIGHT) + bias;
  return l > 0.66 ? 5 : l > 0.3 ? 4 : l > -0.12 ? 3 : l > -0.5 ? 2 : 1;
}
/** A material shaded as it faces, lit by the fires: for what is built round (a throne's posts, a brazier's bowl). */
const shadeR = (R: R7, bias = 0, k = 1) => (n: V3, w: V3): string => lit(R, toneOf(n, bias), w, n, k);

const TOWARD: V3 = [0.61, 0.61, 0.5];
/** A ROD from `a` to `b` (a post, a bar, a limb of armour), round, lit across from the upper left and by the fires. */
function rodL(a: V3, b: V3, r0: number, r1: number, R: R7, id: number, bias = 0): void {
  const [x0, y0] = S.at(a);
  const [x1, y1] = S.at(b);
  const dx = x1 - x0;
  const dy = y1 - y0;
  const len2 = dx * dx + dy * dy || 1;
  const rM = Math.max(r0, r1) * 1.1 + 1;
  const d0 = dot(a, TOWARD) + (r0 + r1) / 2;
  const d1 = dot(b, TOWARD) + (r0 + r1) / 2;
  for (let y = Math.floor(Math.min(y0, y1) - rM); y <= Math.ceil(Math.max(y0, y1) + rM); y++) {
    for (let x = Math.floor(Math.min(x0, x1) - rM); x <= Math.ceil(Math.max(x0, x1) + rM); x++) {
      const t = cl(((x + 0.5 - x0) * dx + (y + 0.5 - y0) * dy) / len2, 0, 1);
      const r = (r0 + (r1 - r0) * t) * 1.1;
      const ox = x + 0.5 - (x0 + dx * t);
      const oy = y + 0.5 - (y0 + dy * t);
      if (ox * ox + oy * oy > r * r) continue;
      const s = (ox * -0.64 + oy * -0.77) / (r * 0.81);
      const w: V3 = [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
      const tone = (s > 0.5 ? 4.4 : s < -0.45 ? 2 : 3.2) + bias;
      S.put(x, y, d0 + (d1 - d0) * t, lit(R, tone, w, TOWARD), id, w[2]);
    }
  }
}
/** A BALL of a material, lit as it faces and by the fires. */
function ballL(c: V3, r: number, R: R7, id: number, bias = 0): void {
  S.egg(c, [[1, 0, 0], [0, 1, 0], [0, 0, 1]], [r, r, r], shadeR(R, bias), id);
}

/** A box of one material, lit as it faces and by the fires; a lit edge along its top. */
function block(c: V3, r: V3, R: R7, id: number, bias = 0, tex?: (f: number, u: number, v: number, w: V3) => number): void {
  S.box(c, [[1, 0, 0], [0, 1, 0], [0, 0, 1]], r, (f, u, v, n) => {
    const w: V3 = [c[0], c[1], c[2]];
    // (the point on the face: for the fires' light)
    const ax = f >> 1;
    const e1 = (ax + 1) % 3;
    const e2 = (ax + 2) % 3;
    w[ax] += (f % 2 ? -1 : 1) * r[ax];
    w[e1] += (u * 2 - 1) * r[e1];
    w[e2] += (v * 2 - 1) * r[e2];
    let t = toneOf(n, bias) + (tex ? tex(f, u, v, w) : 0);
    if (f !== 4 && f !== 5 && ((ax === 0 && e2 === 2) || (ax === 1 && e2 === 2)) && v > 0.94) t += 1;
    if (f === 0 && v > 0.94) t += 1;
    return lit(R, t, w, n);
  }, id);
}

// =================================================================================================
// THE STONE: ashlar in courses on a face, flags on the floor

/** Ashlar: dressed stone in courses 12 high, blocks of their own lengths, broken joint; `a` along the face, `z` up it (units, picture pixels). Its tone's offset, or null at a joint. */
function ashlar(a: number, z: number, seed: number): number | null {
  const CH = 14;
  const course = Math.floor(z / CH);
  const len = 46 + Math.floor(hash(course, 1, seed) * 3) * 10;
  const off = hash(course, 0, seed) * len;
  const ju = fr((a + off) / len) * len;
  const jz = z - course * CH;
  if (jz < 1.2 || ju < 1.3) return null;
  const b = Math.floor((a + off) / len);
  const h = hash(b, course, seed + 2);
  let t = h < 0.16 ? -0.7 : h > 0.88 ? 0.5 : 0;
  // its top edge lit, its face pitted here and there
  if (jz > CH - 1.4) t += 0.6;
  if (hash(Math.floor(a / 1.6), Math.floor(z / 2), seed + 3) < 0.05) t -= 1;
  return t;
}
/** A colour of a wall's face: ashlar (its joints in seam), its tone by how the face is turned, the fires on it, the dark high up indoors. */
function wallAt(a: number, z: number, w: V3, n: V3, base: number, seed: number, indoor = true): string {
  const t0 = ashlar(a, z, seed);
  if (t0 === null) return lit(PAL.stone, Math.max(0, base - 2), w, n, 0.6);
  let t = base + t0;
  // a plinth course along its foot, its top lit
  if (z < 10) t -= z > 8.4 ? -1 : 0.6;
  // up under the dark (indoors, the roof cut away)
  if (indoor && z > 96) t -= z > 120 ? 1.6 : 0.8;
  // damp low down, soot high
  if (z < 18 && hash(Math.floor(a / 3), 9, seed + 5) < 0.3) t -= 0.6;
  return lit(PAL.stone, t, w, n);
}

/** The throne hall's flags, half a tile square, in a chequer of grey and slate; worn, cracked. */
function hallFlag(x: number, y: number, w: V3): string {
  const n: V3 = [0, 0, 1];
  const i = Math.floor(x / 20);
  const j = Math.floor(y / 20);
  const u = x - i * 20;
  const v = y - j * 20;
  const R = (i + j) & 1 ? PAL.slate : PAL.stone;
  if (u < 1.1 || v < 1.1) return lit(PAL.stone, 0, w, n, 0.5);
  const h = hash(i, j, 1901);
  let t = 3 + (h < 0.2 ? -0.6 : h > 0.85 ? 0.5 : 0);
  // the flag's upper left edges lit
  if (u < 2.4 || v < 2.4) t += 0.8;
  // a crack across a flag here and there
  if (h > 0.9 && Math.abs(u - v * 0.7 - 4 - h * 8) < 0.7) t = 1;
  // a flag broken: a corner gone, rubble in it
  if (h < 0.025 && u + v > 26) return lit(PAL.stone, hash(Math.floor(x / 2), Math.floor(y / 2), 1903) < 0.5 ? 1 : 2, w, n);
  // dark in toward the walls
  if (x < 14 || y < 14) t -= 0.7;
  // THE MOON through the tall window, lying on the flags: back along the light, where it passes the window
  const zw = 1.273 * x;
  const yw = y + 0.818 * x - MOONWIN.c;
  const head = MOONWIN.springs + Math.sqrt(Math.max(0, (2 * MOONWIN.half) ** 2 - (Math.abs(yw) + MOONWIN.half) ** 2)) * 0.95;
  if (Math.abs(yw) < MOONWIN.half && zw > MOONWIN.sill && zw < head && fr((yw + MOONWIN.half) / 7.4) > 0.16 && fr((zw - MOONWIN.sill) / 9) > 0.12) return mixC(lit(R, t + 1.4, w, n), '#8d96bb', 0.2);
  return lit(R, t, w, n);
}
/** The tall window the moon comes in by (the hall's left wall, y in units). */
const MOONWIN = { c: 3.0 * 40, half: 11, sill: 54, springs: 100 };
/** The gate passage's setts, small and square, two ruts worn along it; pitch spilled under the holes. */
function setts(x: number, y: number, w: V3): string {
  const n: V3 = [0, 0, 1];
  const row = Math.floor(y / 7);
  const off = (row & 1) * 4;
  const i = Math.floor((x + off) / 8);
  const u = x + off - i * 8;
  const v = y - row * 7;
  if (u < 1 || v < 1) return lit(PAL.stone, 0, w, n, 0.6);
  const h = hash(i, row, 1911);
  let t = 2 + (h < 0.25 ? -0.6 : h > 0.8 ? 0.5 : 0);
  if (u < 2.2 || v < 2.2) t += 0.8;
  // the ruts the carts wore, a cart's width apart
  for (const ry of [GY0 + 0.55, GY1 - 0.55]) if (Math.abs(y / U - ry) < 0.12) t -= 1;
  return lit(PAL.stone, t, w, n);
}

// =================================================================================================
// THE WALLS, THE TOPS, THE BATTLEMENTS

/** A wall's face along x (looking +y, in the light) at `y`, from x0 to x1, z0 to z1; `hole(x, z)` where it is open. */
function faceX(y: number, x0: number, x1: number, z0: number, z1: number, id: number, opts: { base?: number; indoor?: boolean; hole?: (x: number, z: number) => boolean; paint?: (x: number, z: number, w: V3) => string | null; seed?: number } = {}): void {
  const n: V3 = [0, 1, 0];
  S.quad([[x0, y, z0], [x1, y, z0], [x1, y, z1], [x0, y, z1]], (_u, _v, w) => {
    if (opts.hole && opts.hole(w[0], w[2])) return null;
    const p = opts.paint ? opts.paint(w[0], w[2], w) : null;
    if (p) return p;
    return wallAt(w[0], w[2], w, n, opts.base ?? 3.4, opts.seed ?? 1921, opts.indoor ?? true);
  }, id);
}
/** A wall's face along y (looking +x, in shade) at `x`. */
function faceY(x: number, y0: number, y1: number, z0: number, z1: number, id: number, opts: { base?: number; indoor?: boolean; hole?: (y: number, z: number) => boolean; paint?: (y: number, z: number, w: V3) => string | null; seed?: number } = {}): void {
  const n: V3 = [1, 0, 0];
  S.quad([[x, y1, z0], [x, y0, z0], [x, y0, z1], [x, y1, z1]], (_u, _v, w) => {
    if (opts.hole && opts.hole(w[1], w[2])) return null;
    const p = opts.paint ? opts.paint(w[1], w[2], w) : null;
    if (p) return p;
    return wallAt(-w[1], w[2], w, n, opts.base ?? 2.2, opts.seed ?? 1923, opts.indoor ?? true);
  }, id);
}
/** A wall's top: flags of the wall walk, seen from above, x0..x1 by y0..y1 at z. */
function topAt(x0: number, y0: number, x1: number, y1: number, z: number, id: number, base = 4): void {
  const n: V3 = [0, 0, 1];
  S.quad([[x0, y0, z], [x1, y0, z], [x1, y1, z], [x0, y1, z]], (_u, _v, w) => {
    const i = Math.floor(w[0] / 16);
    const j = Math.floor(w[1] / 22);
    const u = w[0] - i * 16;
    const v = w[1] - j * 22;
    if (u < 1 || v < 1) return lit(PAL.stone, base - 2, w, n, 0.6);
    const h = hash(i, j, 1931);
    return lit(PAL.stone, base + (h < 0.25 ? -0.6 : h > 0.85 ? 0.5 : 0) + (u < 2.2 || v < 2.2 ? 0.7 : 0), w, n, 0.6);
  }, id);
}
/** A plain box of the Keep's stone: its faces in ashlar, its top lit (a merlon, a pier, a stub of wall). */
function stoneBlock(x0: number, y0: number, z0: number, x1: number, y1: number, z1: number, id: number, seed = 1941, bias = 0): void {
  S.box([(x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2], [[1, 0, 0], [0, 1, 0], [0, 0, 1]], [(x1 - x0) / 2, (y1 - y0) / 2, (z1 - z0) / 2], (f, u, v, n) => {
    const w: V3 = f === 4 ? [x0 + (x1 - x0) * u, y0 + (y1 - y0) * v, z1] : f === 0 ? [x1, y0 + (y1 - y0) * u, z0 + (z1 - z0) * v] : [x0 + (x1 - x0) * v, y1, z0 + (z1 - z0) * u];
    if (f === 4) return lit(PAL.stone, 4.6 + bias, w, n, 0.7);
    const a = f === 0 ? -w[1] : w[0];
    const t = ashlar(a, w[2] + 3, seed);
    const base = (f === 0 ? 2.2 : 3.6) + bias;
    if (t === null) return lit(PAL.stone, base - 2, w, n, 0.6);
    // the edge where the side meets the top catches the moon
    return lit(PAL.stone, base + t + (w[2] > z1 - 1.6 ? 1 : 0), w, n, 0.7);
  }, id);
}
/**
 * BATTLEMENTS along a wall's outer edge: a parapet `PAR` high over the walk, merlons `MER` higher, a crenel between each
 * two. Along x (the parapet's inner face looking +y) or along y (looking +x). `from`..`to` along it, `at` across.
 */
const PAR = 16;
const MER = 17;
function battlements(alongX: boolean, at0: number, from: number, to: number, z: number, idBase: number, depth = 10): void {
  const a0 = Math.min(from, to);
  const a1 = Math.max(from, to);
  const B = (p0: number, p1: number, q0: number, q1: number, z0: number, z1: number, id: number): void =>
    alongX ? stoneBlock(p0, q0, z0, p1, q1, z1, id, 1951) : stoneBlock(q0, p0, z0, q1, p1, z1, id, 1953);
  B(a0, a1, at0, at0 + depth, z, z + PAR, idBase);
  const step = 30;
  let k = 0;
  for (let a = a0 + 4; a + 16 <= a1; a += step, k++) B(a, a + 17, at0, at0 + depth, z + PAR, z + PAR + MER, idBase + 1 + (k % 2));
}

// =================================================================================================
// FIRE: flames painted on the picture, in the honest fire's own colours

/** A FLAME at a point of the world: tongues licking up, `size` picture pixels tall; `seed` its own shape. */
function flame(base: V3, size: number, seed: number, id: number): void {
  const [bx, by] = S.at(base);
  const d = dot(base, [0.61, 0.61, 0.5]) + 30;
  const tongues = [
    { dx: 0, h: size, w: size * 0.42 },
    { dx: -size * 0.28, h: size * 0.66, w: size * 0.3 },
    { dx: size * 0.3, h: size * 0.72, w: size * 0.28 },
  ];
  const H0 = Math.ceil(size * 1.1);
  for (let yy = -H0; yy <= 2; yy++) {
    for (let xx = -Math.ceil(size); xx <= Math.ceil(size); xx++) {
      let best = 0;
      for (const [i, t] of tongues.entries()) {
        const up = -yy / t.h;
        if (up < -0.15 || up > 1) continue;
        // a teardrop: widest a third of the way up, a wobble along it
        const half = t.w * (up < 0.3 ? Math.sqrt(Math.max(0, (up + 0.15) / 0.45)) : Math.pow(Math.max(0, 1 - (up - 0.3) / 0.7), 1.1));
        const wob = Math.sin(up * 7 + seed * 1.7 + i * 2.1) * t.w * 0.25 * up;
        const off = Math.abs(xx - t.dx - wob);
        if (off > half) continue;
        const inner = 1 - off / Math.max(0.5, half);
        best = Math.max(best, inner * (1 - Math.max(0, up - 0.5) * 0.9) + (i === 0 ? 0.15 : 0));
      }
      if (best <= 0) continue;
      const c = best > 0.78 ? EMBER[4] : best > 0.55 ? EMBER[3] : best > 0.3 ? EMBER[2] : EMBER[1];
      S.put(Math.round(bx + xx), Math.round(by + yy), d, c, id, base[2] + 1);
    }
  }
}

// =================================================================================================
// THE ROYAL CREST (the palace guard's own mark, art/palace_guard.ts: a white swan, its wings raised, its neck in its S),
// here in old gold on royal blue. A picture of its own, 15 x 15, facing left.

const CREST = [
  '.......#.....#.',
  '......##....##.',
  '.....###...###.',
  '.##..###..####.',
  '#..#.####.###..',
  '...#..#######..',
  '...#..#######..',
  '..#..########..',
  '..#.#########..',
  '...##########..',
  '....########...',
  '.....######....',
  '...#########...',
  '...............',
  '...............',
];
const crestAt = (cx: number, cy: number): boolean => {
  const x = Math.floor(cx);
  const y = Math.floor(cy);
  return y >= 0 && y < 15 && x >= 0 && x < 15 && CREST[y][x] === '#';
};

/**
 * A BANNER hung on a wall's face: royal blue in long folds, an old gold border, the royal crest; its foot cut in a swallow
 * tail, or torn and burnt. On a face along x (`alongX`, looking +y) or along y; `c` its middle along the face, `top`, its
 * height `len`, its width `wd` (units).
 */
function banner(alongX: boolean, face: number, c: number, top: number, len: number, wd: number, id: number, torn = false): void {
  const out = 2.5;
  const P = (a: number, z: number, o: number): V3 => (alongX ? [c + a, face + out + o, z] : [face + out + o, c - a, z]);
  const n0: V3 = alongX ? [0, 1, 0] : [1, 0, 0];
  const half = wd / 2;
  S.quad([P(-half, top - len - 12, 0), P(half, top - len - 12, 0), P(half, top, 0), P(-half, top, 0)], (u, v, w) => {
    const a = -half + u * wd;
    const z = top - len - 12 + v * (len + 12);
    const fromTop = top - z;
    // its foot: a swallow tail, or torn and burnt ragged
    const ua = Math.abs(a) / half;
    let foot = len - 14 * (1 - ua);
    if (torn) foot = len - 18 - 10 * noise(a * 0.35, 3, 1961) - (a > 0 ? 8 * fr(a * 0.13) : 0);
    if (fromTop > foot) return null;
    // the folds: long, upright, a ripple across it; its face turned with them
    const ph = (a / wd) * Math.PI * 5 + 0.6;
    const slope = Math.cos(ph);
    const n = norm(alongX ? [slope * 0.5, 1, 0] : [1, -slope * 0.5, 0]);
    let t = toneOf(n, 0.05) + (alongX ? 0 : -0.3);
    if (Math.sin(ph) > 0.82) t += 0.6;
    // scorched up from a torn foot
    const scorch = torn && fromTop > foot - 9 ? 1 : 0;
    // its border of old gold, a line of blue inside it, a fringe along its head
    const edge = Math.min(half - Math.abs(a), fromTop - 4, foot - fromTop);
    if (fromTop < 4) return lit(PAL.gold, t - 0.5 + (fr(a * 0.5) < 0.5 ? 0.6 : 0), w, n);
    if (edge < 2.4 && !(torn && fromTop > foot - 6)) return scorch ? lit(PAL.oak, t - 1, w, n) : lit(PAL.gold, t - 0.3, w, n);
    if (edge < 3.6) return lit(PAL.royal, t - 1.2, w, n);
    // the crest, in old gold, in its upper half
    const cx = (a + 9.5) / 1.3;
    const cz = (fromTop - 14) / 1.3;
    if (crestAt(cx, cz)) return lit(PAL.gold, t + (crestAt(cx - 1, cz) ? 0 : 0.6) - (crestAt(cx, cz + 1) ? 0 : 0.5), w, n);
    // a band of gold under it, a lozenge pattern below
    if (Math.abs(fromTop - 38) < 1.3) return lit(PAL.gold, t - 0.4, w, n);
    if (fromTop > 44 && fromTop < foot - 8 && Math.abs(fr((fromTop - 44) / 16) - 0.5) * 16 + Math.abs(a) * 0.9 < 2.2) return lit(PAL.gold, t - 0.6, w, n);
    if (scorch) return lit(PAL.oak, t - 1.6, w, n);
    return lit(PAL.royal, t, w, n);
  }, id);
  // its pole: an iron rod along the face, a finial at each end, on two brackets
  const pz = top + 1;
  rodL(P(-half - 4, pz, 0.5), P(half + 4, pz, 0.5), 1.1, 1.1, PAL.iron, id + 1);
  for (const s of [-1, 1]) ballL(P(s * (half + 5), pz, 0.5), 1.8, PAL.iron, id + 1);
}

// =================================================================================================
// A SUIT OF ARMOUR ON ITS STAND (the king's knights' kind, standing empty): plate, dark and polished, the plates' seams
// dark between them; a great helm with its sights and breaths; on a plinth of oak, facing +y

function armour(ax: number, ay: number, id: number): void {
  const O = (x: number, y: number, z: number): V3 => [ax + x, ay + y, z];
  const AX: [V3, V3, V3] = [[1, 0, 0], [0, 1, 0], [0, 0, 1]];
  const steel = (bias: number) => (n: V3, w: V3): string => lit(PAL.steel, toneOf(n, bias - 0.15), w, n, 0.55);
  // the plinth, and the post of the stand behind
  S.box(O(0, 0, 2.5), AX, [10, 10, 2.5], (f, u, v, n) => lit(PAL.oak, f === 4 ? (v > 0.9 || u < 0.08 ? 4.6 : 3.6) : f === 0 ? 1.8 : 2.8, O((u - 0.5) * 20, (v - 0.5) * 20, 5), n), id);
  rodL(O(-2, -4, 5), O(-2, -4, 50), 1.2, 1.2, PAL.oak, id + 1);
  // across the screen, his right is toward -x, +y: the suit faces +y
  for (const s of [-1, 1]) {
    const hx = s * 3.2;
    // sabaton, pointed, its lames
    S.egg(O(hx, 3.4, 6.6), AX, [2.6, 5.2, 1.8], (n, w) => lit(PAL.steel, toneOf(n, -0.2) + (fr(w[1] / 2.2) < 0.3 ? -0.8 : 0), w, n), id + 2);
    // greave, swelling at the calf
    S.egg(O(hx, 0, 13), AX, [2.4, 2.6, 7.4], steel(-0.25), id + 2);
    // poleyn at the knee, its wing out to the side
    S.egg(O(hx, 0.8, 20.5), AX, [2.9, 2.9, 2.4], steel(0), id + 3);
    S.egg(O(hx + s * 2.6, 0.6, 20.5), [[0, 1, 0], [1, 0, 0], [0, 0, 1]], [2.2, 0.8, 2], steel(0.1), id + 3);
    // cuisse up the thigh
    S.egg(O(hx * 0.95, 0, 27.5), AX, [3.1, 3.2, 6], steel(-0.15), id + 2);
  }
  // the faulds: three lames flaring over the hips, dark between; the breastplate over them, its ridge lit; the gorget
  for (const [k, z] of [33, 35.6, 38.2].entries()) S.egg(O(0, 0, z), AX, [7.4 - k * 0.5, 6 - k * 0.4, 2], (n, w) => lit(PAL.steel, toneOf(n, -0.1) + (w[2] < z - 1.2 ? -1.2 : 0), w, n), id + 4 + k);
  S.egg(O(0, 0.3, 46), AX, [7.4, 5.6, 9], (n, w) => {
    const ridge = Math.abs(w[0] - ax) < 0.9 && n[1] > 0.3;
    const plack = w[2] < 42 && w[2] > 40.8;
    return lit(PAL.steel, toneOf(n, -0.05) + (ridge ? 1 : 0) + (plack ? -1.2 : 0), w, n);
  }, id + 7);
  S.egg(O(0, -0.4, 55), AX, [4.4, 4, 2.2], steel(0), id + 8);
  for (const s of [-1, 1]) {
    // pauldron in two lames, the rerebrace, the couter at the elbow, the vambrace, the gauntlet, fingers curled
    S.egg(O(s * 7.6, -0.4, 52.4), AX, [4.8, 4.8, 3.4], steel(0.05), id + 9);
    S.egg(O(s * 8.2, -0.2, 49.2), AX, [4.2, 4.4, 2.4], (n, w) => lit(PAL.steel, toneOf(n, -0.05) + (w[2] > 50.6 ? -1 : 0), w, n), id + 10);
    rodL(O(s * 8.6, 0, 47), O(s * 9, 0.4, 39), 2.2, 2.1, PAL.steel, id + 11, -0.3);
    S.egg(O(s * 9, 1, 38.4), AX, [2.6, 2.6, 2.2], steel(0.05), id + 11);
    rodL(O(s * 9, 0.6, 37), O(s * 8.6, 2, 29.5), 2.1, 1.9, PAL.steel, id + 11, -0.3);
    S.egg(O(s * 8.6, 2.4, 27.6), AX, [2.2, 2.4, 2.8], steel(-0.1), id + 12);
  }
  // the great helm: flat-topped, its sights a dark slit, a ridge down its face, breaths pierced on its cheek; a crest of
  // old gold
  for (let k = 0; k < 9; k++) {
    const z = 58 + k * 1.4;
    S.egg(O(0, 0, z), AX, [4.6 - (k > 7 ? 0.6 : 0), 4.8 - (k > 7 ? 0.6 : 0), 0.9], (n, w) => {
      const front = n[1] > 0.45;
      if (front && k === 5) return PAL.deep;
      if (front && Math.abs(w[0] - ax) < 0.8 && k < 5) return lit(PAL.steel, 4.6, w, n);
      if (n[0] > 0.2 && n[1] > 0.2 && k < 4 && k > 1 && fr((w[1] - ay) / 1.6) < 0.45) return PAL.deep;
      return lit(PAL.steel, toneOf([n[0], n[1], 0], k > 7 ? 0.5 : 0.05) + (k === 4 || k === 6 ? 0.6 : 0), w, n);
    }, id + 13);
  }
  S.egg(O(0, 0, 70.4), AX, [3.8, 4, 0.7], steel(0.4), id + 13);
  rodL(O(0, 0, 70), O(0, 0, 76), 1.6, 0.5, PAL.gold, id + 14, 0.2);
}

// =================================================================================================
// THE PAINTING

export interface Keep {
  p: Px;
}

/** Paint the first look. */
export function paintKeep(): Keep {
  S = new Scene(new Px(W, H), OX, OY);
  FIRES.length = 0;
  const T = (t: number): number => t * U;

  // ---- WHERE THE FIRES BURN (their light is reckoned for everything painted after)
  const torchesX = [3.0, 8.0].map((x) => [T(x), 3, 82] as V3);
  const torchesY = [[3, T(6.7), 82], [3, T(GY1 + 0.62), 78]] as V3[];
  const torchGate: V3 = [T(HOLES[0] - 0.75), T(GY0) + 3, 56];
  const braziers: V3[] = [[T(3.0), T(3.0), 0], [T(8.0), T(3.0), 0]];
  for (const t of torchesX) FIRES.push({ at: [t[0], t[1] + 8, t[2] + 12], a: 1.05, r: 66 });
  for (const t of torchesY) FIRES.push({ at: [t[0] + 8, t[1], t[2] + 12], a: 1.05, r: 66 });
  FIRES.push({ at: [torchGate[0], torchGate[1] + 8, torchGate[2] + 12], a: 1.2, r: 60 });
  for (const b of braziers) FIRES.push({ at: [b[0], b[1], 44], a: 1.4, r: 86 });
  // the fire under the pitch on the gatehouse's walk
  const CAUL: V3 = [T(-3.3), T(GY0 - 0.42), GATE_H];
  FIRES.push({ at: [CAUL[0], CAUL[1], GATE_H + 8], a: 1.3, r: 60 });

  // ---- THE GROUND OUTSIDE (dark, fading out) and the hall's floor
  S.quad([[T(-12), T(-1), -0.25], [T(18), T(-1), -0.25], [T(18), T(22), -0.25], [T(-12), T(22), -0.25]], (_u, _v, w) => {
    // (only near the castle, the ground falling away past it: the sky behind)
    const x = w[0] / U;
    const y = w[1] / U;
    if (y < GY0 && x < 0) return null;
    if (y < 0) return null;
    const far = Math.max(0, x - (HX + 1.2), y - (HY + 1.2), GX0 - 1 - x) + (x < 0 && y > GY1 + 1 ? Math.max(0, -x) * 0.25 : 0);
    const n: V3 = [0, 0, 1];
    const [sx, sy] = S.at(w);
    const k = far * 0.55 + 0.3 + (bayer(Math.floor(sx), Math.floor(sy)) - 0.5) * 0.25;
    if (k > 1) return PAL.deep;
    const c = setts(w[0], w[1], w);
    return mixC(c, PAL.deep, Math.round(k * 4) / 4 + 0.0 * n[0]);
  }, 1);
  S.quad([[0, 0, 0], [T(HX), 0, 0], [T(HX), T(HY), 0], [0, T(HY), 0]], (_u, _v, w) => hallFlag(w[0], w[1], w), 2);
  // the passage's floor, its mouth into the hall
  S.quad([[T(GX0), T(GY0), 0.1], [T(0), T(GY0), 0.1], [T(0), T(GY1), 0.1], [T(GX0), T(GY1), 0.1]], (_u, _v, w) => {
    // the black pool of pitch under the hole that drips, and old pitch splashed under the others
    for (const [k, hx] of HOLES.entries()) {
      const px = T(hx);
      const py = T(GY0 + 1 - Math.cos(HOLE_TH));
      const d = Math.hypot((w[0] - px) / (k === DRIP ? 26 : 13), (w[1] - py - (k === DRIP ? 10 : 4)) / (k === DRIP ? 18 : 8)) + 0.35 * (noise(w[0] * 0.15, w[1] * 0.15, 1971 + k) - 0.5);
      if (d < 1) {
        const n: V3 = [0, 0, 1];
        if (k !== DRIP) return lit(PAL.pitch, d < 0.6 ? 2 : 3, w, n, 0.5);
        // the pool: black, its sheen cold, rings where the drops fall
        const r = Math.hypot(w[0] - px, (w[1] - py - 2) * 1.6);
        if (Math.abs(fr(r / 7) - 0.5) < 0.09 && r < 24) return PAL.pitch[5];
        return lit(PAL.pitch, d > 0.85 ? 3 : fr((w[0] - w[1]) * 0.07) < 0.08 ? 4 : 1, w, n, 0.4);
      }
    }
    return setts(w[0], w[1], w);
  }, 3);

  // ---- THE DAIS: three steps of stone, the runner up them
  const steps = [
    { x0: DAIS.x0, x1: DAIS.x1, y1: DAIS.y1, z: 7 },
    { x0: DAIS.x0 + 0.2, x1: DAIS.x1 - 0.2, y1: DAIS.y1 - 0.5, z: 14 },
    { x0: DAIS.x0 + 0.4, x1: DAIS.x1 - 0.4, y1: DAIS.y1 - 1.0, z: 21 },
  ];
  steps.forEach((s, i) => {
    S.box([T((s.x0 + s.x1) / 2), T(s.y1 / 2), s.z / 2 + 0.01 * i], [[1, 0, 0], [0, 1, 0], [0, 0, 1]], [T((s.x1 - s.x0) / 2), T(s.y1 / 2), s.z / 2], (f, u, v, n) => {
      const w: V3 = f === 4 ? [T(s.x0 + (s.x1 - s.x0) * u), T(s.y1 * v), s.z] : f === 0 ? [T(s.x1), T(s.y1 * u), s.z * v] : [T(s.x0 + (s.x1 - s.x0) * v), T(s.y1), s.z * u];
      // the runner up its middle
      const onRunner = Math.abs(w[0] - T(5.5)) < T(0.62);
      if (onRunner && (f === 4 || f === 2)) {
        const e = T(0.62) - Math.abs(w[0] - T(5.5));
        if (e < 3) return lit(PAL.gold, f === 4 ? 3.6 : 2.6, w, n);
        return lit(PAL.royal, f === 4 ? (f === 4 && v > 0.9 ? 4.4 : 3.4) : 2.4, w, n);
      }
      if (f === 4) return lit(PAL.stone, v > 0.92 ? 4.8 : 3.8, w, n);
      return lit(PAL.stone, f === 0 ? 2 : (u > 0.85 ? 3.8 : 3), w, n);
    }, 10 + i);
  });

  // ---- THE ROYAL RUNNER from the dais down the hall: royal blue, an old gold border, worn and torn
  {
    const x0 = T(5.5 - 0.62);
    const x1 = T(5.5 + 0.62);
    const y0 = T(DAIS.y1);
    const y1 = T(HY + 0.6);
    S.quad([[x0, y0, 0.6], [x1, y0, 0.6], [x1, y1, 0.6], [x0, y1, 0.6]], (_u, _v, w) => {
      const n: V3 = [0, 0, 1];
      const e = Math.min(w[0] - x0, x1 - w[0]);
      const along = w[1] - y0;
      // a tear across it, the flags showing through
      const tear = Math.abs(along - T(6.6) - (w[0] - x0) * 0.25 - 3 * Math.sin(w[0] * 0.3)) < 1.6 + 1.6 * noise(w[0] * 0.2, 1, 1981);
      if (tear && e > 4) return hallFlag(w[0], w[1], w);
      if (e < 1.4) return lit(PAL.royal, 1.4, w, n);
      if (e < 4.2) return lit(PAL.gold, 2.6 + (fr(along / 6) < 0.5 ? 0.5 : 0), w, n);
      if (e < 6) return lit(PAL.royal, 2.2, w, n);
      // a lozenge of old gold every so often down it
      const lz = Math.abs(fr(along / 46) * 46 - 23) * 0.55 + Math.abs(w[0] - T(5.5)) < 12;
      const lzEdge = Math.abs(fr(along / 46) * 46 - 23) * 0.55 + Math.abs(w[0] - T(5.5)) > 10.4;
      if (lz && lzEdge) return lit(PAL.gold, 2.4, w, n);
      // worn threadbare down its middle
      const worn = noise(w[0] * 0.12, w[1] * 0.05, 1983) > 0.62;
      return lit(PAL.royal, worn ? 3.6 : 3, w, n);
    }, 15);
  }

  // ---- THE FAR WALLS OF THE HALL
  // the window in the left wall, its moon; the soot over each torch; the arch of the gate passage's mouth
  const sootX = torchesX.map((t) => t[0]);
  const sootY = torchesY.map((t) => t[1]);
  const WIN = MOONWIN;
  const archTop = (y: number): number => {
    const r = y - T(GY0 + 1);
    return SPRING + Math.sqrt(Math.max(0, U * U - r * r));
  };
  faceX(0, T(-0.0), T(13), 0, WALL_H, 20, {
    base: 3.2,
    paint: (x, z, w) => {
      for (const sx of sootX) {
        const d = Math.abs(x - sx);
        if (z > 92 && d < 9 - (z - 92) * 0.12 + 3 * noise(x * 0.2, z * 0.1, 1991) && hash(Math.floor(x / 2), Math.floor(z / 2), 1992) < 0.7) {
          const t = ashlar(x, z, 1921);
          return lit(PAL.stone, t === null ? 0 : 1.2 - (z > 120 ? 0.4 : 0), w, [0, 1, 0], 0.5);
        }
      }
      return null;
    },
  });
  faceY(0, 0, T(GY1 + 1), 0, WALL_H, 21, {
    base: 2.1,
    hole: (y, z) => y > T(GY0) && y < T(GY1) && z < archTop(y),
    paint: (y, z, w) => {
      const n: V3 = [1, 0, 0];
      // the arch of the passage's mouth: a ring of wedge stones round it, their joints toward its middle
      if (y > T(GY0) - 8 && y < T(GY1) + 8 && z > SPRING - 2) {
        const r = Math.hypot(y - T(GY0 + 1), Math.max(0, z - SPRING));
        if (r < U + 8 && r >= U - 0.5) {
          const ang = Math.atan2(Math.max(0, z - SPRING), y - T(GY0 + 1));
          const joint = fr((ang / Math.PI) * 11) < 0.1 || r > U + 7;
          return lit(PAL.stone, joint ? 0.8 : r < U + 1.6 ? 1.2 : 2.8 + (fr((ang / Math.PI) * 11) < 0.3 ? 0.5 : 0), w, n);
        }
      }
      const du = y - WIN.c;
      // THE TALL WINDOW: a lancet, deep in the wall, its reveal lit on one side; leaded panes, the moon in them
      const head = WIN.springs + Math.sqrt(Math.max(0, WIN.half * 2 * WIN.half * 2 - (Math.abs(du) + WIN.half) ** 2)) * 0.95;
      if (Math.abs(du) < WIN.half + 4 && z > WIN.sill - 4 && z < head + 4) {
        const inside = Math.abs(du) < WIN.half && z > WIN.sill && z < head;
        if (!inside) return lit(PAL.stone, z < WIN.sill ? 3.6 : du > 0 ? 3 : 1.4, w, n);
        if (fr((du + WIN.half) / 7.4) < 0.14 || fr((z - WIN.sill) / 9) < 0.11) return lit(PAL.iron, 1, w, n, 0.4);
        // the night through the panes: the moon's pale on the upper ones, a pane or two broken out
        const pane = hash(Math.floor((du + WIN.half) / 7.4), Math.floor((z - WIN.sill) / 9), 1995);
        if (pane > 0.9) return PAL.sky[0];
        const mo = z > WIN.springs - 14 + du * 0.6;
        return mo ? (pane > 0.45 ? PAL.moon[1] : PAL.moon[0]) : pane > 0.5 ? '#2b3348' : '#232a3d';
      }
      for (const sy of sootY) {
        const d = Math.abs(y - sy);
        if (z > 88 && d < 9 - (z - 88) * 0.12 + 3 * noise(y * 0.2, z * 0.1, 1993) && hash(Math.floor(y / 2), Math.floor(z / 2), 1994) < 0.7) {
          const t = ashlar(-y, z, 1923);
          return lit(PAL.stone, t === null ? 0 : 0.8, w, n, 0.5);
        }
      }
      return null;
    },
  });
  // the left wall's end, where the near wall past it is cut down: its stones broken back in steps
  S.quad([[-T(THICK), T(GY1 + 1), 12], [0, T(GY1 + 1), 12], [0, T(GY1 + 1), WALL_H], [-T(THICK), T(GY1 + 1), WALL_H]], (_u, _v, w) => {
    const n: V3 = [0, 1, 0];
    const t = ashlar(w[0] + 9, w[2], 2025);
    return lit(PAL.stone, t === null ? 1 : 3 + t, w, n);
  }, 24);
  // the walls' tops, the walks on them, the battlements on their outer edges
  topAt(0, -T(THICK), T(13), 0, WALL_H, 22);
  topAt(-T(THICK), 0, 0, T(GY1 + 1), WALL_H, 23);
  topAt(-T(THICK), -T(THICK), 0, 0, WALL_H, 22);
  battlements(true, -T(THICK), T(-0.2), T(13), WALL_H, 30);
  battlements(false, -T(THICK), T(-0.2), T(GY0 - 1), WALL_H, 33);
  battlements(false, -T(THICK), T(GY0 + 1), T(GY1 + 1), WALL_H, 36);

  // ---- THE TOWERS: at the hall's far corner, and at the far end of its right wall
  const tower = (x0: number, y0: number, x1: number, y1: number, h: number, id: number): void => {
    stoneBlock(T(x0), T(y0), WALL_H - 30, T(x1), T(y1), h, id, 2001, -0.2);
    // its top: a walk round a roof of lead, battlements all round
    battlements(true, T(y0), T(x0), T(x1), h, id + 1, 9);
    battlements(false, T(x0), T(y0), T(y1), h, id + 4, 9);
    // (its two near sides' parapets low, so the walk shows)
    stoneBlock(T(x0), T(y1) - 9, h, T(x1), T(y1), h + 7, id + 7, 2003);
    stoneBlock(T(x1) - 9, T(y0), h, T(x1), T(y1), h + 7, id + 8, 2003);
  };
  tower(-2.8, -2.8, -0.2, -0.2, TOWER_H, 40);
  tower(13, -2.6, 15.8, 0, TOWER_H - 10, 50);
  // arrow slits and a door onto the walk, in the corner tower's faces
  for (const [y, z] of [[-1.5, 170], [-2.2, WALL_H + 4]] as const) {
    S.quad([[T(-0.2) + 0.3, T(y) - 2, z], [T(-0.2) + 0.3, T(y) + 2, z], [T(-0.2) + 0.3, T(y) + 2, z + (z > WALL_H + 10 ? 16 : 22)], [T(-0.2) + 0.3, T(y) - 2, z + (z > WALL_H + 10 ? 16 : 22)]], () => PAL.deep, 60);
  }
  S.quad([[T(-1.4), T(-0.2) + 0.3, 182], [T(-1.25), T(-0.2) + 0.3, 182], [T(-1.25), T(-0.2) + 0.3, 196], [T(-1.4), T(-0.2) + 0.3, 196]], () => PAL.deep, 60);
  // the door from the left wall's walk into the corner tower, round-headed
  S.quad([[T(-0.9), T(-0.2) + 0.3, WALL_H], [T(-0.3), T(-0.2) + 0.3, WALL_H], [T(-0.3), T(-0.2) + 0.3, WALL_H + 30], [T(-0.9), T(-0.2) + 0.3, WALL_H + 30]], (u, v) => {
    const a = (u - 0.5) * 24;
    if (v * 30 > 20 + Math.sqrt(Math.max(0, 144 - a * a)) * 0.8) return null;
    return u < 0.12 ? PAL.stone[4] : PAL.deep;
  }, 61);

  // ---- THE GATEHOUSE: its far wall, the vault cut open at its crown, the murder holes in it, the masonry over it,
  // its battlements; the great doors at the far end; its near wall cut down
  const gx0 = T(GX0 - 1);
  const gx1 = -T(THICK);
  const slot = -T(0.5);
  faceX(T(GY0), T(GX0), 0, 0, SPRING, 70, {
    base: 2.8,
    seed: 2011,
    paint: (x, z, w) => {
      // the portcullis's groove up the arch's jamb
      if (Math.abs(x - slot) < 2.6) return lit(PAL.stone, Math.abs(x - slot) < 1.6 ? 0 : 3.6, w, [0, 1, 0], 0.6);
      // the soot over the passage's torch
      const d = Math.abs(x - torchGate[0]);
      if (z > 66 && d < 7 && hash(Math.floor(x / 2), Math.floor(z / 2), 2013) < 0.75) return lit(PAL.stone, 1, w, [0, 1, 0], 0.5);
      return null;
    },
  });
  // the vault: its far half, from its springing to where it turns from the eye
  const VSTEPS = 14;
  for (let i = 0; i < VSTEPS; i++) {
    const a0 = (i / VSTEPS) * (52 * Math.PI) / 180;
    const a1 = ((i + 1) / VSTEPS) * (52 * Math.PI) / 180;
    const P = (x: number, a: number): V3 => [x, T(GY0 + 1) - Math.cos(a) * U, SPRING + Math.sin(a) * U];
    const am = (a0 + a1) / 2;
    const n: V3 = [0, Math.cos(am), -Math.sin(am)];
    S.quad([P(T(GX0), a0), P(0, a0), P(0, a1), P(T(GX0), a1)], (_u, v, w) => {
      const a = a0 + (a1 - a0) * v;
      // THE MURDER HOLES: square, black, their lips cut deep, lit along the side toward the springing
      for (const hx of HOLES) {
        const du = w[0] - T(hx);
        const dv = (a - HOLE_TH) * U;
        if (Math.abs(du) < 9 && Math.abs(dv) < 8) {
          if (Math.abs(du) > 6.6 || Math.abs(dv) > 5.8) return lit(PAL.stone, dv < -5 ? 4.6 : du > 6 ? 1 : 2, w, n, 0.8);
          return dv < -3.5 && du < 4 ? PAL.pitch[2] : PAL.deep;
        }
      }
      // the portcullis's slot across the vault at the mouth
      if (Math.abs(w[0] - slot) < 3) return Math.abs(w[0] - slot) < 1.8 ? PAL.deep : lit(PAL.stone, 3.4, w, n);
      // the vault's stones in rings across the passage
      const ring = fr(w[0] / 14) < 0.09;
      const course = fr((a * U) / 9) < 0.14;
      const t = 3.2 - a * 1.8 + (ring || course ? -1.4 : 0) + (hash(Math.floor(w[0] / 14), Math.floor((a * U) / 9), 2015) < 0.2 ? -0.5 : 0);
      return lit(PAL.stone, t, w, n);
    }, 71);
  }
  // the masonry over the vault, cut at its crown (as the game cuts what stands over the floor): its section, rubble
  // between dressed faces, its lowest edge broken
  S.quad([[gx0, T(GY0 + 1), SPRING + U - 6], [gx1, T(GY0 + 1), SPRING + U - 6], [gx1, T(GY0 + 1), GATE_H], [gx0, T(GY0 + 1), GATE_H]], (_u, _v, w) => {
    const n: V3 = [0, 1, 0];
    if (w[2] < SPRING + U + 4 - 8 * noise(w[0] * 0.1, 1, 2019)) return null;
    // the rubble core: rough stones of all sizes, mortar between
    const cj = Math.floor(w[2] / 6);
    const g = 6 + Math.floor(hash(cj, 0, 2016) * 3) * 3;
    const off = hash(cj, 1, 2016) * g;
    const ci = Math.floor((w[0] + off) / g);
    const h0 = hash(ci, cj, 2017);
    const ju = fr((w[0] + off) / g) < 1.2 / g || fr(w[2] / 6) < 0.2 || (h0 > 0.7 && fr(w[2] / 3) < 0.34 && fr((w[0] + off) / g) > 0.5);
    const edge = w[2] > GATE_H - 14;
    if (edge) {
      const t = ashlar(w[0], w[2], 2018);
      return lit(PAL.stone, t === null ? 1 : 3.2 + t, w, n);
    }
    return lit(PAL.stone, ju ? 1.2 : 2.6 + (h0 < 0.3 ? -0.6 : h0 > 0.8 ? 0.6 : 0), w, n, 0.6);
  }, 72);
  topAt(gx0, T(GY0 - 1), gx1, T(GY0 + 1), GATE_H, 73, 4.2);
  // THE MURDER HOLES seen from above, in the walk over the passage: square shafts down through the vault, their lips
  // worn, an iron grate over one; the cauldron of pitch heating on its fire beside them
  for (const [k, hx] of HOLES.entries()) {
    const cx = T(hx);
    const cy = T(GY0 + 0.45);
    const h = 8;
    S.quad([[cx - h - 2, cy - h - 2, GATE_H + 0.4], [cx + h + 2, cy - h - 2, GATE_H + 0.4], [cx + h + 2, cy + h + 2, GATE_H + 0.4], [cx - h - 2, cy + h + 2, GATE_H + 0.4]], (_u, _v, w) => {
      const n: V3 = [0, 0, 1];
      const du = w[0] - cx;
      const dv = w[1] - cy;
      // the lip: a kerb of dressed stone round it, lit on its far sides (they face the eye), dark on its near ones
      if (Math.abs(du) > h || Math.abs(dv) > h) return lit(PAL.stone, du < -h || dv < -h ? 4.6 : 3.2, w, n, 0.8);
      // down the shaft: its far walls seen, lit and then dark, and black below
      if (du < -h + 4 || dv < -h + 4) return lit(PAL.stone, du < -h + 2 || dv < -h + 2 ? 2.4 : 1.2, w, n, 0.6);
      // a grate of iron bars over the first
      if (k === 0 && (fr((du + h) / 4) < 0.3 || fr((dv + h) / 4) < 0.3)) return lit(PAL.iron, 3.6, w, n, 0.8);
      return PAL.deep;
    }, 160 + k);
  }
  {
    const [cx, cy, cz] = CAUL;
    // the fire on the flags: logs, embers, flames up round the pot
    for (const [a, b] of [[-9, 4], [8, -5], [-3, -8]] as const) rodL([cx + a, cy + b, cz + 1.4], [cx - a * 0.2, cy - b * 0.2, cz + 2.6], 1.8, 1.6, PAL.oak, 165, -0.4);
    S.egg([cx, cy, cz + 0.6], [[1, 0, 0], [0, 1, 0], [0, 0, 1]], [9, 9, 0.6], (_n, w) => {
      const hh = hash(Math.floor(w[0] / 2.5), Math.floor(w[1] / 2.5), 2071);
      return hh < 0.35 ? EMBER[0] : hh < 0.6 ? '#5a1c1c' : hh < 0.72 ? EMBER[1] : '#1c0f1c';
    }, 166);
    // the pot on three short iron legs over it: round-bellied, its lip lit, the pitch black in it, steaming
    for (let k = 0; k < 3; k++) {
      const a = (k / 3) * Math.PI * 2 + 0.9;
      rodL([cx + Math.cos(a) * 11, cy + Math.sin(a) * 11, cz], [cx + Math.cos(a) * 9, cy + Math.sin(a) * 9, cz + 12], 1.4, 1.2, PAL.iron, 167, 0.8);
    }
    S.egg([cx, cy, cz + 21], [[1, 0, 0], [0, 1, 0], [0, 0, 1]], [14, 14, 12], (n, w) => {
      const lip = w[2] > cz + 28.6;
      return lit(PAL.steel, toneOf(n, -0.25) + (lip ? 1.6 : 0) - (w[2] < cz + 14 ? 0.6 : 0), w, n, 0.8);
    }, 169, (w) => w[2] <= cz + 29.6);
    S.egg([cx, cy, cz + 29.4], [[1, 0, 0], [0, 1, 0], [0, 0, 1]], [12, 12, 0.5], (_n, w) => (fr((w[0] - w[1]) * 0.12) < 0.12 ? PAL.pitch[6] : PAL.pitch[3]), 170);
    flame([cx - 9, cy + 10, cz + 2], 13, 7, 171);
    flame([cx + 10, cy + 6, cz + 2], 11, 8, 171);
    flame([cx - 1, cy + 13, cz + 2], 9, 9, 171);
    // the ladle leaning on the pot
    rodL([cx + 5, cy - 5, cz + 29], [cx + 15, cy - 16, cz + 48], 1.1, 1.1, PAL.oak, 172, 0.4);
    // its steam, thin, curling up off it
    for (let i = 0; i < 10; i++) {
      const t = i / 10;
      const z = cz + 31 + t * 26;
      S.egg([cx - 2 + 5 * Math.sin(t * 6), cy + 2 * Math.cos(t * 5), z], [[1, 0, 0], [0, 1, 0], [0, 0, 1]], [1.6 + t * 2, 1.6 + t * 2, 1.4 + t], (n, w) => {
        const [px, py] = S.at(w);
        if (t > 0.4 && (Math.floor(px) + Math.floor(py)) % 2) return null;
        return dot(n, LIGHT) > 0.2 ? PAL.smoke[2] : PAL.smoke[1];
      }, (1 << 20) + 100 + i);
    }
  }
  battlements(true, T(GY0 - 1), gx0, gx1, GATE_H, 74);
  battlements(false, gx0, T(GY0 - 1), T(GY0 + 1), GATE_H, 77);
  // its side over the hall's wall walk, looking +x
  faceY(gx1, T(GY0 - 1), T(GY0 + 1), WALL_H - 2, GATE_H, 79, { base: 2.4, seed: 2021, indoor: false });
  // the great doors at the far end of the passage: two leaves of oak, studded and banded with iron, a wicket in one
  S.quad([[T(GX0), T(GY1), 0], [T(GX0), T(GY0), 0], [T(GX0), T(GY0), SPRING + U], [T(GX0), T(GY1), SPRING + U]], (_u, _v, w) => {
    const n: V3 = [1, 0, 0];
    const top = archTop(w[1]);
    if (w[2] > top) return lit(PAL.stone, 1.6 + (ashlar(-w[1], w[2], 2023) ?? -1), w, n);
    if (w[2] > top - 4) return lit(PAL.stone, 2.4, w, n);
    const b = w[1] - T(GY0);
    if (Math.abs(b - U) < 1.2) return lit(PAL.oak, 0, w, n);
    // the iron bands across, the studs in rows
    if (Math.abs(fr(w[2] / 26) * 26 - 13) < 1.6) return lit(PAL.iron, 2.4, w, n);
    if (fr(b / 9) < 0.18 && fr(w[2] / 9) < 0.2) return lit(PAL.iron, 3.4, w, n);
    // the wicket door in the right leaf
    if (b > U + 8 && b < U + 26 && w[2] < 46 && (Math.abs(b - U - 8) < 1 || Math.abs(b - U - 26) < 1 || Math.abs(w[2] - 46) < 1)) return lit(PAL.oak, 0.5, w, n);
    return lit(PAL.oak, 2 + (fr(b / 7) < 0.14 ? -1 : 0), w, n);
  }, 80);
  // the gatehouse's near wall and the hall's near walls, cut down: a stub of stone, its top broken
  const stub = (x0: number, y0: number, x1: number, y1: number, id: number): void => {
    const h = (x: number, y: number): number => 13 + 7 * noise(x * 0.08, y * 0.08, 2031) + (hash(Math.floor(x / 8), Math.floor(y / 8), 2033) < 0.2 ? -4 : 0);
    // its top, broken; its faces toward the eye
    const STEP = 4;
    for (let x = x0; x < x1; x += STEP) {
      for (let y = y0; y < y1; y += STEP) {
        const z = h(x + 2, y + 2);
        S.box([x + STEP / 2, y + STEP / 2, z / 2], [[1, 0, 0], [0, 1, 0], [0, 0, 1]], [STEP / 2, STEP / 2, z / 2], (f, u, v, n) => {
          const w: V3 = f === 4 ? [x + STEP * u, y + STEP * v, z] : f === 0 ? [x + STEP, y + STEP * u, z * v] : [x + STEP * v, y + STEP, z * u];
          if (f === 4) return lit(PAL.stone, 4 + (hash(Math.floor(x / 4), Math.floor(y / 4), 2035) < 0.3 ? -1 : 0), w, n, 0.7);
          const t = ashlar(f === 0 ? -w[1] : w[0], w[2], 2037);
          return lit(PAL.stone, t === null ? 0.6 : (f === 0 ? 2 : 3) + t, w, n, 0.7);
        }, id);
      }
    }
  };
  stub(T(GX0 - 1), T(GY1), gx1, T(GY1 + 1), 90);
  stub(T(-THICK), T(GY1 + 1), 0, T(HY + 3), 91);
  stub(T(-THICK), T(HY), T(HX + THICK), T(HY + THICK), 92);
  stub(T(HX), 0, T(HX + THICK), T(HY + THICK), 93);

  // ---- THE PORTCULLIS, raised in its slot in the wall over the passage's mouth: the spiked foot of its grille under
  // the arch, its oak bars shod with iron
  {
    const bottom = 90;
    for (let i = 0; i <= 7; i++) {
      const y = T(GY0) + 5 + i * ((T(GY1) - T(GY0) - 10) / 7);
      rodL([slot, y, bottom + 2], [slot, y, WALL_H - 8], 2.1, 2.1, PAL.oak, 100);
      // its iron spike, shod on the bar's foot
      rodL([slot, y, bottom + 4], [slot, y, bottom - 9], 2.3, 0.3, PAL.iron, 101, 0.4);
    }
    for (const z of [bottom + 7, bottom + 24]) rodL([slot, T(GY0) + 3, z], [slot, T(GY1) - 3, z], 1.6, 1.6, PAL.iron, 102);
  }

  // ---- THE PITCH dripping from the middle hole, smoking where it lands
  {
    const hx = T(HOLES[DRIP]);
    const hy = T(GY0 + 1 - Math.cos(HOLE_TH));
    const hz = SPRING + Math.sin(HOLE_TH) * U;
    // a string of it, thick at the hole, breaking into drops
    {
      const [x0, y0] = S.at([hx, hy + 2, hz - 1]);
      const [, y1] = S.at([hx, hy + 2, 2]);
      const d = dot([hx, hy + 2, 40], TOWARD) + 4;
      for (let y = Math.round(y0); y <= Math.round(y1); y++) {
        const t = (y - y0) / Math.max(1, y1 - y0);
        const half = 1.4 + 0.8 * t + (hash(0, y >> 2, 2045) < 0.2 ? 0.6 : 0);
        for (let x = Math.round(x0 - half); x <= Math.round(x0 + half); x++) {
          const o = x - x0;
          const c = o < -half + 1 ? PAL.pitch[4] : Math.abs(o + 0.3) < 0.6 && hash(x, y >> 1, 2047) < 0.7 ? PAL.pitch[6] : PAL.pitch[2];
          S.put(x, y, d, c, 110, hz * (1 - t));
        }
      }
    }
    // where it lands: a crown of it thrown up out of the pool
    for (let k = 0; k < 9; k++) {
      const a = (k / 9) * Math.PI * 2;
      const tip: V3 = [hx + Math.cos(a) * 7, hy + 6 + Math.sin(a) * 6, 5 + 3 * hash(k, 1, 2043)];
      rodL([hx + Math.cos(a) * 3, hy + 6 + Math.sin(a) * 3, 1], tip, 1.2, 0.6, PAL.pitch, 111, -0.6);
    }
    // the smoke off the pool: grey, curling up, thinning
    for (let i = 0; i < 18; i++) {
      const t = i / 18;
      const sx = hx + 4 * Math.sin(t * 7 + 1) + (t - 0.5) * 6;
      const sy = hy + 12 + 3 * Math.cos(t * 5);
      const z = 3 + t * 34;
      const r = 1.8 + t * 2.2;
      if (hash(i, 1, 2041) < t * 0.6) continue;
      S.egg([sx, sy, z], [[1, 0, 0], [0, 1, 0], [0, 0, 1]], [r, r, r * 0.8], (n, w) => {
        const [px, py] = S.at(w);
        if (t > 0.45 && (Math.floor(px) + Math.floor(py)) % 2) return null;
        return dot(n, LIGHT) > 0.2 ? PAL.smoke[2] : dot(n, LIGHT) > -0.2 ? PAL.smoke[1] : PAL.smoke[0];
      }, (1 << 20) + i);
    }
  }

  // ---- THE THRONE on its dais, empty, under its cloth of estate
  {
    const [tx, ty, tz] = THRONE;
    const cloth = { x0: T(4.1), x1: T(6.9), z0: 28, z1: 124 };
    // the cloth of estate on the wall behind: royal blue in long folds, an old gold border, the crest large, a powdering
    // of small gold stars
    S.quad([[cloth.x0, 1.5, cloth.z0], [cloth.x1, 1.5, cloth.z0], [cloth.x1, 1.5, cloth.z1], [cloth.x0, 1.5, cloth.z1]], (_u, _v, w) => {
      const n: V3 = [0, 1, 0];
      const a = w[0] - (cloth.x0 + cloth.x1) / 2;
      const fromTop = cloth.z1 - w[2];
      const half = (cloth.x1 - cloth.x0) / 2;
      const ph = (a / half) * Math.PI * 4;
      const t = 3 + (Math.sin(ph) > 0.85 ? 0.6 : Math.sin(ph) < -0.8 ? -0.6 : 0);
      const edge = Math.min(half - Math.abs(a), w[2] - cloth.z0);
      // its foot a fringe of gold
      if (w[2] - cloth.z0 < 5) return fr(a / 3) < 0.5 ? lit(PAL.gold, 2.8, w, n) : w[2] - cloth.z0 < 2 ? null : lit(PAL.gold, 3.4, w, n);
      if (edge < 3.2) return lit(PAL.gold, t - 0.2, w, n);
      if (edge < 4.8) return lit(PAL.royal, t - 1.2, w, n);
      // the crest, twice as big, high on it
      const cx = (a + 15) / 2;
      const cz = (fromTop - 14) / 2;
      if (crestAt(cx, cz)) return lit(PAL.gold, t + (crestAt(cx - 0.5, cz - 0.5) ? 0 : 0.7), w, n);
      const si = Math.floor(a / 11 + 20);
      const sj = Math.floor(fromTop / 13);
      if ((si + sj) % 2 === 0 && Math.abs(fr(a / 11) - 0.5) < 0.12 && Math.abs(fr(fromTop / 13) - 0.5) < 0.12 && !(fromTop > 10 && fromTop < 46 && Math.abs(a) < 20)) return lit(PAL.gold, t - 0.6, w, n);
      return lit(PAL.royal, t, w, n);
    }, 120);
    // over it, a narrow tester out from the wall, and its valance hanging: royal blue, scalloped, fringed with gold
    const half = (cloth.x1 - cloth.x0) / 2 + 4;
    const mid = (cloth.x0 + cloth.x1) / 2;
    S.box([mid, 6, 129], [[1, 0, 0], [0, 1, 0], [0, 0, 1]], [half, 6, 2.5], (f, u, v, n) => {
      const w: V3 = [mid - half + 2 * half * (f === 4 ? u : v), f === 4 ? 12 * v : 12, 129];
      if (f === 4) return lit(PAL.gold, 3.6, w, n);
      return lit(PAL.gold, f === 0 ? 2.4 : 4, w, n);
    }, 121);
    S.quad([[mid - half, 12.3, 112], [mid + half, 12.3, 112], [mid + half, 12.3, 127], [mid - half, 12.3, 127]], (_u, v, w) => {
      const n: V3 = [0, 1, 0];
      const a = w[0] - (mid - half);
      const z = 112 + v * 15;
      const sc = 3 + 6 * Math.abs(Math.sin((a / 18) * Math.PI));
      const tassel = fr(a / 18) < 0.1 || fr(a / 18) > 0.95;
      if (tassel) return z < 114 ? null : lit(PAL.gold, z < 117 ? 4.2 : 3.2, w, n);
      if (z < 112 + sc) return null;
      if (z < 114 + sc) return lit(PAL.gold, fr(a / 2.5) < 0.5 ? 3 : 3.8, w, n);
      if (z > 124) return lit(PAL.gold, 3.6, w, n);
      return lit(PAL.royal, 3 + (Math.abs(fr(a / 18) - 0.5) < 0.12 && z > 118 && z < 122 ? 1.4 : 0), w, n);
    }, 122);

    // THE THRONE: carved oak gilt along its edges; a high back of royal blue, the crest at its head, under a pointed
    // gable crowned with a gilt finial; posts up to gilt pinnacles; arms ending in gilt scrolls; its seat empty
    const O = (x: number, y: number, z: number): V3 => [tx + x, ty + y, tz + z];
    const gilt = (n: V3, w: V3): string => lit(PAL.gold, toneOf(n, 0.15), w, n);
    // its seat, a chest of oak, three little arches carved on its front
    S.box(O(0, 0, 10), [[1, 0, 0], [0, 1, 0], [0, 0, 1]], [18, 13, 10], (f, u, v, n) => {
      const w = f === 4 ? O((u - 0.5) * 36, (v - 0.5) * 26, 20) : f === 0 ? O(18, (u - 0.5) * 26, v * 20) : O((v - 0.5) * 36, 13, u * 20);
      if (f === 2) {
        const a = (v - 0.5) * 36;
        const z = u * 20;
        if (z > 17.6 || z < 2 || Math.abs(a) > 16) return lit(PAL.gold, z > 17.6 ? 4 : 3, w, n);
        // the arches: sunk, their heads round
        const k = Math.floor((a + 16) / 10.7);
        const ca = -16 + (k + 0.5) * 10.7;
        const r = Math.hypot(a - ca, Math.max(0, z - 10));
        if (z > 4 && r < 3.6) return lit(PAL.oak, r > 2.6 ? 3.6 : 1, w, n);
        return lit(PAL.oak, 3, w, n);
      }
      if (f === 0) return lit(PAL.oak, v > 0.9 ? 3 : 1.8, w, n);
      return lit(PAL.oak, 4, w, n);
    }, 130);
    // the cushion of royal blue, dented: no one sits there now
    S.egg(O(0, 1, 21), [[1, 0, 0], [0, 1, 0], [0, 0, 1]], [16, 11, 3.2], (n, w) => {
      const dent = Math.hypot(w[0] - tx, w[1] - ty - 1) < 7 ? -0.7 : 0;
      return lit(PAL.royal, toneOf(n, 0.15) + dent, w, n);
    }, 131);
    // its back: a panel of royal blue framed in gilt, the crest at its head
    S.box(O(0, -11, 61), [[1, 0, 0], [0, 1, 0], [0, 0, 1]], [16, 2.5, 41], (f, u, v, n) => {
      if (f !== 2) return lit(PAL.oak, f === 4 ? 4 : 1.8, O(16, -11, 61), n);
      const a = (v - 0.5) * 32;
      const z = 20 + u * 82;
      const w = O(a, -8.5, z);
      const e = Math.min(16 - Math.abs(a), z - 20, 102 - z);
      if (e < 2) return lit(PAL.oak, 3.4, w, n);
      if (e < 3.6) return lit(PAL.gold, e < 2.8 ? 4 : 3, w, n);
      const cx = a / 1.2 + 7.5;
      const cz = (102 - z - 9) / 1.2;
      if (crestAt(cx, cz)) return lit(PAL.gold, 3.6 + (crestAt(cx - 1, cz - 1) ? 0 : 0.6), w, n);
      // the cloth of the back in folds, buttoned
      if (fr((z - 20) / 16) < 0.08 && z < 80) return lit(PAL.royal, 1.6, w, n);
      if (Math.abs(fr((z - 20) / 16) - 0.08) < 0.04 && Math.abs(fr((a + 16) / 10.6) - 0.5) < 0.1) return lit(PAL.gold, 3.2, w, n);
      return lit(PAL.royal, 3, w, n);
    }, 132);
    // its gable over the back, carved, gilt along its edges, a finial like a crown on its peak
    S.quad([O(-17, -8.3, 102), O(17, -8.3, 102), O(1.5, -8.3, 121), O(-1.5, -8.3, 121)], (u, v, w) => {
      const n: V3 = [0, 1, 0];
      const e = Math.min(u, 1 - u) * (1 - v * 0.9) * 34;
      if (e < 2.2 || v < 0.1) return lit(PAL.gold, e < 1.2 ? 4.4 : 3.4, w, n);
      // a trefoil cut in it
      const r = Math.hypot((u - 0.5) * 34, (v - 0.42) * 19);
      if (r < 3.4) return lit(PAL.oak, r > 2.4 ? 4 : 1, w, n);
      return lit(PAL.oak, 3, w, n);
    }, 133);
    for (const s of [-1, 0, 1]) S.egg(O(s * 2.6, -8.4, 123 + (s ? 0 : 1.6)), [[1, 0, 0], [0, 1, 0], [0, 0, 1]], [1.6, 1.4, s ? 2.4 : 3.2], gilt, 133);
    S.egg(O(0, -8.4, 121.4), [[1, 0, 0], [0, 1, 0], [0, 0, 1]], [4.4, 1.6, 1.4], gilt, 133);
    // its posts, carved, banded with gilt, each up to a gilt pinnacle
    for (const s of [-1, 1]) {
      rodL(O(s * 19, -11, 0), O(s * 19, -11, 104), 3, 2.8, PAL.oak, 134, 0.2);
      for (const z of [36, 70]) S.egg(O(s * 19, -11, z), [[1, 0, 0], [0, 1, 0], [0, 0, 1]], [3.6, 3.6, 2], gilt, 134);
      S.egg(O(s * 19, -11, 105), [[1, 0, 0], [0, 1, 0], [0, 0, 1]], [3.8, 3.8, 2.2], gilt, 134);
      rodL(O(s * 19, -11, 106), O(s * 19, -11, 122), 2.8, 0.3, PAL.gold, 135, 0.3);
      // its arm, on a turned post in front, ending in a gilt scroll
      S.box(O(s * 19, 0.5, 34), [[1, 0, 0], [0, 1, 0], [0, 0, 1]], [2.8, 12.5, 2], (f, u, v, n) => lit(f === 4 ? PAL.gold : PAL.oak, f === 4 ? 3.4 : f === 0 ? 1.8 : 3, O(s * 19, (u - 0.5) * 25, 34), n), 136);
      rodL(O(s * 19, 11, 0), O(s * 19, 11, 32), 2.6, 2.3, PAL.oak, 137, 0.2);
      S.egg(O(s * 19, 13, 35), [[1, 0, 0], [0, 1, 0], [0, 0, 1]], [3, 3.6, 3.6], gilt, 137);
    }
  }

  // ---- THE BANNERS down the walls; a torn and burnt one
  banner(true, 0, T(1.8), 128, 84, T(0.9), 140);
  banner(true, 0, T(9.4), 128, 84, T(0.9), 142, true);
  banner(true, 0, T(11.9), 128, 84, T(0.9), 144);
  banner(false, 0, T(1.25), 128, 84, T(0.9), 146);
  banner(false, 0, T(5.0), 128, 84, T(0.9), 148);

  // a banner fallen, its pole snapped, lying on the flags, its foot burnt
  {
    const cx = T(9.0);
    const cy = T(9.6);
    S.quad([[cx - 44, cy - 34, 0.8], [cx + 44, cy - 34, 0.8], [cx + 44, cy + 34, 0.8], [cx - 44, cy + 34, 0.8]], (_u, _v, w) => {
      const n: V3 = [0, 0, 1];
      // (along `a` from its head to its foot, `b` across it)
      const a = (w[0] - cx) * 0.94 + (w[1] - cy) * 0.34 + 34;
      const b = -(w[0] - cx) * 0.34 + (w[1] - cy) * 0.94 + 2 * Math.sin(a * 0.15);
      const half = 15;
      if (a < 0 || Math.abs(b) > half) return null;
      // its swallow tail, ragged and burnt
      const foot = 64 - 10 * (1 - Math.abs(b) / half) - 5 * noise(b * 0.4, 1, 2081);
      if (a > foot) return null;
      const fold = Math.sin(a * 0.35 + 0.8);
      const edge = Math.min(half - Math.abs(b), a);
      if (a > foot - 6) return lit(PAL.oak, 0.8 + (fold > 0 ? 0.6 : 0), w, n);
      if (edge < 2.6) return lit(PAL.gold, 2.6 + (fold > 0.4 ? 0.8 : 0), w, n);
      const cxr = (a - 8) / 1.3;
      const czr = (b + 9.5) / 1.3;
      if (crestAt(czr, cxr)) return lit(PAL.gold, 2.4, w, n);
      return lit(PAL.royal, 2.8 + (fold > 0.6 ? 0.8 : fold < -0.6 ? -0.8 : 0), w, n);
    }, 150);
    // its pole, snapped in two
    const P = (a: number, b: number): V3 => [cx + (a - 34) * 0.94 - b * 0.34, cy + (a - 34) * 0.34 + b * 0.94, 2];
    rodL(P(-2, -20), P(-2, 6), 1.3, 1.3, PAL.iron, 151);
    rodL(P(-8, 14), P(4, 26), 1.3, 1.3, PAL.iron, 151);
  }

  // ---- THE TORCHES in their iron sconces
  const torch = (alongX: boolean, a: number, z: number, id: number): void => {
    const P = (u: number, o: number, zz: number): V3 => (alongX ? [a + u, o, zz] : [o, a - u, zz]);
    S.box(P(0, 1.5, z - 2), [[1, 0, 0], [0, 1, 0], [0, 0, 1]], alongX ? [3, 1.5, 6] : [1.5, 3, 6], (_f, _u, _v, n) => lit(PAL.iron, toneOf(n), P(0, 2, z), n), id);
    rodL(P(0, 2, z - 4), P(0, 9, z + 1), 0.9, 0.9, PAL.iron, id);
    // the cup, the torch's shaft in it, its head wrapped and burning
    S.egg(P(0, 9, z + 3), [[1, 0, 0], [0, 1, 0], [0, 0, 1]], [2.6, 2.6, 2.2], (n, w) => lit(PAL.iron, toneOf(n), w, n), id);
    rodL(P(0, 9, z - 8), P(0, 10.5, z + 9), 1.5, 1.7, PAL.oak, id + 1);
    S.egg(P(0, 10.6, z + 10), [[1, 0, 0], [0, 1, 0], [0, 0, 1]], [2.6, 2.6, 3], (n, w) => lit(PAL.oak, toneOf(n, -0.3), w, n), id + 1);
    flame(P(0, 10.8, z + 11), 15, a, id + 2);
  };
  torchesX.forEach((t, i) => torch(true, t[0], t[2], 160 + i * 3));
  torchesY.forEach((t, i) => torch(false, t[1], t[2], 170 + i * 3));
  torch(true, torchGate[0], torchGate[2], 180);

  // ---- THE BRAZIERS either side of the dais: an iron bowl on three legs, coals in it, fire
  for (const [i, b] of braziers.entries()) {
    const [bx, by] = b;
    for (let k = 0; k < 3; k++) {
      const a = (k / 3) * Math.PI * 2 + 0.4;
      rodL([bx + Math.cos(a) * 14, by + Math.sin(a) * 14, 0], [bx + Math.cos(a) * 8, by + Math.sin(a) * 8, 30], 1.3, 1.1, PAL.iron, 190 + i);
      // its foot curled
      ballL([bx + Math.cos(a) * 14.5, by + Math.sin(a) * 14.5, 1.4], 1.8, PAL.iron, 190 + i);
    }
    S.egg([bx, by, 34], [[1, 0, 0], [0, 1, 0], [0, 0, 1]], [12, 12, 8], (n, w) => lit(PAL.iron, toneOf(n, 0.05) + (Math.abs(w[2] - 37) < 0.8 ? 1 : 0), w, n), 192 + i, (w) => w[2] <= 37.5);
    // its rim, and the coals in it
    S.egg([bx, by, 37.5], [[1, 0, 0], [0, 1, 0], [0, 0, 1]], [11, 11, 0.6], (_n, w) => {
      const hh = hash(Math.floor(w[0] / 2.5), Math.floor(w[1] / 2.5), 2051 + i);
      return hh < 0.35 ? EMBER[0] : hh < 0.55 ? '#5a1c1c' : hh < 0.7 ? EMBER[1] : '#1c0f1c';
    }, 194 + i);
    flame([bx - 3, by + 2, 38], 26, i * 3 + 1, 196 + i);
    flame([bx + 4, by - 3, 38], 18, i * 3 + 2, 196 + i);
  }

  // ---- TWO SUITS OF ARMOUR standing empty on their stands, the king's knights' (silent, as they are)
  for (const [i, [ax, ay]] of [[T(0.9), T(1.2)], [T(10.2), T(1.0)]].entries()) armour(ax, ay, 200 + i * 20);

  S.seams();

  // ---- THE NIGHT SKY behind it all: dark, deepest at the top, a few stars, long thin clouds; the moon
  const p = S.p;
  const MOON = { x: 210, y: 72, r: 17 };
  for (let x = 0; x < W; x++) {
    // (down each column: sky until the castle; past it, what is empty is the dark)
    let below = false;
    for (let y = 0; y < H; y++) {
      if (S.id[y * W + x] >= 0 && p.has(x, y)) {
        below = true;
        continue;
      }
      if (below) {
        p.set(x, y, PAL.deep);
        continue;
      }
      const b = bayer(x, y);
      const band = cl(Math.floor((y / 330) * 4 + b * 0.9), 0, 4);
      let c: string = PAL.sky[band];
      // a cloud, long and thin, lit on its underside by the moon
      const cl0 = noise(x / 160, y / 14, 2061) + 0.3 * noise(x / 40, y / 5, 2062);
      if (cl0 > 0.95) c = cl0 > 1.06 && noise(x / 160, (y + 3) / 14, 2061) < cl0 - 0.05 ? '#1a2034' : '#121729';
      // stars, single and few, and a brighter one now and then
      const st = hash(x, y, 2063);
      if (st > 0.9988 && c === PAL.sky[band]) c = st > 0.9997 ? PAL.star[1] : PAL.star[0];
      // the moon, three quarters full, its dark side to the right, its seas
      const dx = x - MOON.x;
      const dy = y - MOON.y;
      const d = Math.hypot(dx, dy);
      if (d < MOON.r) {
        const lit2 = Math.hypot(dx + 8, dy + 2) < MOON.r + 1;
        if (!lit2) c = '#151a2b';
        else {
          const sea = noise(x / 6, y / 6, 2065) > 0.62;
          c = d > MOON.r - 1.2 ? PAL.moon[1] : sea ? PAL.moon[1] : dx + dy < -7 ? PAL.moon[3] : PAL.moon[2];
        }
      }
      p.set(x, y, c);
    }
  }

  // ---- A STEP QUIETER THAN ANY WORD (Colour 4): every colour quietened, the fires aside
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const c = p.get(x, y);
      if (!c || FIRE.has(c)) continue;
      const q = quietHex(c);
      if (q !== c) p.set(x, y, q);
    }
  }
  return { p };
}
