// THE WARDEN'S FLOOR, A PLACE OF ITS OWN: THE KING'S TOMB WITH DAYLIGHT, the painting (the art chat, 2 Nov 2026). A MOCK-UP;
// NOTHING OF THE GAME IMPORTS IT.
//
// His words, 1 Nov 2026, 10:29: “I think we need to redo the art for a couple of the other early levels as well.  Floor 1 and
// 2 are probably fine.  But I think we’ve outgrown the 1-5 “just make it more dirt as you get lower” plan”; and 2 Nov, 10:13:
// “We may as well redo the first level as well.  Why not, we just did every other level right?” Read (told him so): floor 1
// gets a place of its own built round the Warden. His pick: “Tomb with daylight (Recommended)”, offered as: the king's grand
// tomb just under the town: pale carved stone, effigies, faded banners, roots breaking through, shafts of daylight from cracks
// above, the Warden's iron locks. The brightest floor, before it gets dark. Of the bosses' gates: “Its own arch, and we’ll
// need new ones for the other new levels as well”.
//
// So: floor 1 laid COMBO as the main chat lays it (game/dungeon.ts, CRYPT_KINDS: tight rooms you find your way through): you
// come down THE TOWN'S STAIRS (art/town_ways.ts; the first room's back wall, in its gate's arch) into THE STAIR HALL; two
// ways on, round by THE KING'S COURT or through THE EFFIGY HALL, to THE ANTECHAMBER before his gate, and through it HIS HALL,
// the Warden's, where the king lies, flat and open for his Lockdown (the stairwell down opens in its floor when he dies:
// art/crypt_ways.ts, as it is). THREE LOOKS within his pick:
//   A, MORNING LIGHT: warm gold shafts through the cracks onto pale limestone, faded blue and gold banners, dust in the beams,
//      roots and ivy at the cracks.
//   B, THE ROOTS BREAK IN: the town's tree roots through the vaults, moss on the effigies, green-gold light, water dripping.
//   C, COOL MARBLE AT NOON: white marble and grey-blue shade, a few sharp beams of noon light, the Warden's black iron locks
//      and chains stark against it.
//
// His art rulebook kept: crisp pixels, two to a game pixel; one camera; light from the upper left, a face turned to screen-left
// lit, one turned right in shade; the walls toward the eye cut low, as the game leaves them; the tops of the walls fading into
// the dark, as the game's; the place's own colours no brighter than the darkest word (the light is the daylight's); daylight
// warm and honest; nothing cyan (the friend's); the enemy's pink only in the Warden and the lock of his gate.
//
// Measures as the game's (art/isokit.ts): picture pixels; a tile 64 x 32 on the screen; heights up, in picture pixels. Painted
// with a DEPTH for every pixel (x + y of the world point seen there: the larger, the nearer the eye).

import { Px } from '../engine/px';
import { Iso, ISO_X } from '../art/isokit';
import { hash } from '../art/kit';
import { EMBER } from '../art/props';

export type Look = 'morning' | 'roots' | 'noon';
export const LOOKS: Look[] = ['morning', 'roots', 'noon'];
/** The letter he picks by, and the picture's name. */
export const LETTER: Record<Look, string> = { morning: 'a', roots: 'b', noon: 'c' };
export const FILE: Record<Look, string> = { morning: 'a_morning_light', roots: 'b_the_roots_break_in', noon: 'c_cool_marble_at_noon' };
/** Each look in a line, for him. */
export const CAPTION: Record<Look, string> = {
  morning: 'A. Morning light: warm gold shafts onto pale stone, faded blue and gold banners, ivy and roots at the cracks.',
  roots: "B. The roots break in: the town's tree roots through the vaults, moss on the tombs, green-gold light, dripping water.",
  noon: "C. Cool marble at noon: white marble, grey-blue shade, a few sharp beams, the Warden's black iron stark on it.",
};

/** Five tones of a material: its seam, its shade, its body, its light, its lit edge. */
export type R5 = readonly [string, string, string, string, string];
type R3 = readonly [string, string, string];

export interface Pal {
  /** The walls' dressed stone. */
  stone: R5;
  /** The floor's great flags, and (C) the grey-blue marble laid between them. */
  flags: R5;
  flags2: R5;
  /** The grave slabs of the king's court, let into the floor. */
  slab: R5;
  brass: R5;
  iron: R5;
  wood: R5;
  /** The king's banners, faded; their border and device. */
  cloth: R5;
  trim: R5;
  bone: R5;
  moss: R5;
  root: R5;
  leaf: R5;
  /** The Warden's cloth, a dull wine (the king's runner, his pieces). */
  wine: R5;
  water: R5;
  seam: string;
  beyond: string;
  /** Daylight where it falls, in three bands (outer to inner), and how far each goes toward it. */
  sun: R3;
  sunK: readonly [number, number, number];
  /** Fire's light (cressets, candles). */
  warm: R3;
  warmK: readonly [number, number, number];
  /** The hero's own pool of light. */
  pool: string;
  /** Daylight in the air of a shaft: its colour, how strong in three steps; the motes in it. */
  air: string;
  airK: readonly [number, number, number];
  mote: string;
  /** Sharp beams (noon): the light's edge hard, no glow round it. */
  sharp: boolean;
}

const BASE = {
  wood: ['#1a120c', '#2e2016', '#422f20', '#57402b', '#6c5236'] as R5,
  bone: ['#2a2620', '#463f35', '#625849', '#7c705c', '#948670'] as R5,
  wine: ['#1c0c10', '#301418', '#461c22', '#5c262c', '#703236'] as R5,
  water: ['#0b0f12', '#141d22', '#1f2c32', '#2e4046', '#4a5e60'] as R5,
  warm: ['#4c2c12', '#965a20', '#dc963c'] as R3,
  warmK: [0.18, 0.3, 0.42] as const,
  beyond: '#07060a',
};

export const PALS: Record<Look, Pal> = {
  // MORNING LIGHT: a warm pale limestone, faded blue banners with gold, ivy; the sun a warm gold
  morning: {
    ...BASE,
    stone: ['#241f1a', '#3f372d', '#584e40', '#706452', '#857760'],
    flags: ['#201c17', '#3a3229', '#51473a', '#675b4a', '#7a6d58'],
    flags2: ['#201c17', '#3a3229', '#51473a', '#675b4a', '#7a6d58'],
    slab: ['#17151a', '#2a272b', '#3c383a', '#4f4949', '#605957'],
    brass: ['#33260f', '#5a4219', '#7e6026', '#9c7a34', '#b49448'],
    iron: ['#0b0a0c', '#16141a', '#221f27', '#312d37', '#454050'],
    cloth: ['#12151e', '#1d2332', '#2a3245', '#384258', '#48536a'],
    trim: ['#3a2e14', '#5e4a20', '#7e6430', '#9a7e40', '#b09450'],
    moss: ['#121a0c', '#1e2a12', '#2c3c1a', '#3c5022', '#4e622c'],
    root: ['#120c08', '#21160e', '#2f2016', '#3f2c1e', '#523a28'],
    leaf: ['#0e160b', '#1a2a13', '#27401b', '#365625', '#486c2f'],
    seam: '#120f0c',
    sun: ['#806844', '#c09c60', '#f6d896'],
    sunK: [0.26, 0.42, 0.58],
    pool: '#6a6458',
    air: '#ffe0a0',
    airK: [0.08, 0.14, 0.21],
    mote: '#fff2c6',
    sharp: false,
  },
  // THE ROOTS BREAK IN: a greener, damp stone, moss, rotted green-gold banners, roots everywhere; the light green-gold
  roots: {
    ...BASE,
    stone: ['#1d1f19', '#353a2e', '#4c5040', '#626552', '#767a63'],
    flags: ['#1b1d17', '#31342a', '#46493a', '#5a5d4a', '#6c6f5a'],
    flags2: ['#1b1d17', '#31342a', '#46493a', '#5a5d4a', '#6c6f5a'],
    slab: ['#151715', '#272926', '#383a35', '#4a4c45', '#5c5d55'],
    brass: ['#24260f', '#3e4019', '#5a5a26', '#747234', '#8c8846'],
    iron: ['#0c0a09', '#181412', '#25201c', '#352d27', '#4a3f36'],
    cloth: ['#14170d', '#232914', '#33391c', '#444a26', '#565c30'],
    trim: ['#3a3214', '#5a4c1e', '#76662a', '#8e7c36', '#a49246'],
    moss: ['#10190a', '#1c2c10', '#2a4016', '#3a561e', '#4c6c28'],
    root: ['#100b07', '#1e150d', '#2c2014', '#3c2c1c', '#4e3a26'],
    leaf: ['#0e180a', '#1a2c11', '#284218', '#365a20', '#46702a'],
    seam: '#0e0f0b',
    sun: ['#5e6c3a', '#a0aa5e', '#e2e29a'],
    sunK: [0.24, 0.37, 0.5],
    pool: '#5e6456',
    air: '#e6eea8',
    airK: [0.07, 0.13, 0.19],
    mote: '#f2f6c8',
    sharp: false,
  },
  // COOL MARBLE AT NOON: white marble in grey-blue shade, black marble slabs, stark black iron; the light white and sharp
  noon: {
    ...BASE,
    stone: ['#1c1e24', '#363a43', '#50555f', '#686d79', '#7d838f'],
    flags: ['#1d1f24', '#383b42', '#51555d', '#696d76', '#7e8289'],
    flags2: ['#16191f', '#272c37', '#384050', '#4a5363', '#5b6575'],
    slab: ['#0d0d11', '#17171d', '#22222a', '#30303a', '#40404c'],
    brass: ['#33270f', '#5a4419', '#7e6226', '#9c7c34', '#b49448'],
    iron: ['#050507', '#0c0c10', '#16161c', '#24242c', '#383844'],
    cloth: ['#1b1d23', '#2c303a', '#3f4552', '#535a68', '#666e7c'],
    trim: ['#3a2e14', '#5e4a20', '#7e6430', '#9a7e40', '#b09450'],
    moss: ['#121a0c', '#1e2a12', '#2c3c1a', '#3c5022', '#4e622c'],
    root: ['#120c08', '#21160e', '#2f2016', '#3f2c1e', '#523a28'],
    leaf: ['#0e160b', '#1a2a13', '#27401b', '#365625', '#486c2f'],
    bone: ['#24252a', '#3e4048', '#585b64', '#72757e', '#8a8d96'],
    seam: '#0e0f13',
    sun: ['#8e8c8a', '#d0ccc2', '#fff4dc'],
    sunK: [0.24, 0.4, 0.5],
    pool: '#62666e',
    air: '#fffcf2',
    airK: [0.06, 0.11, 0.17],
    mote: '#ffffff',
    sharp: true,
  },
};

// =================================================================================================
// THE PLACE, in tiles (x down the screen to the right, y down to the left, as the game's): floor 1 laid COMBO. From the town's
// stairs (in the stair hall's left wall) two ways round to the boss's door (top right), and his hall beyond.

export interface Rect { x0: number; y0: number; x1: number; y1: number }
/** The Warden's hall, where the king lies. Flat, its middle kept open for his Lockdown. */
export const HALL: Rect = { x0: -1, y0: -10, x1: 9, y1: 0 };
/** The boss's doorway: three tiles of the hall's near wall (the row y 0..1), with HIS GATE in it. */
export const GATE: Rect = { x0: 3, y0: 0, x1: 6, y1: 1 };
/** The rooms: A the antechamber before the gate, B the effigy hall (the main way), C the king's court (the way round), D the stair hall. */
export const RA: Rect = { x0: 2, y0: 1, x1: 7, y1: 6 };
export const RB: Rect = { x0: 2, y0: 7, x1: 7, y1: 12 };
export const RC: Rect = { x0: -4, y0: 1, x1: 1, y1: 6 };
export const RD: Rect = { x0: -4, y0: 7, x1: 1, y1: 12 };
export const ROOMS: readonly Rect[] = [HALL, RA, RB, RC, RD];
/** The floors under the openings (each wall a tile thick). */
export const PASSES: readonly Rect[] = [
  { x0: 3, y0: 6, x1: 6, y1: 7 }, { x0: -3, y0: 6, x1: 0, y1: 7 }, { x0: 1, y0: 2, x1: 2, y1: 5 }, { x0: 1, y0: 8, x1: 2, y1: 11 },
];
/** THE TOWN'S STAIRS UP: three tiles of the stair hall's left wall (along y, its face at x = -4), in the gate's arch. */
export const STAIRS_AT = { x: -4, y0: 8, y1: 11 };

/** A standing wall: along x (its face at y = `at`, turned to screen-left and lit) or along y (its face at x = `at`, in shade); from `a` to `b` along it; its openings; the gate's gap. */
export interface WallRun { alongX: boolean; at: number; a: number; b: number; arches: readonly (readonly [number, number])[]; gap?: readonly [number, number]; seed: number; stairs?: readonly [number, number] }
const PG = 12 / ISO_X;
export const WALLS: readonly WallRun[] = [
  { alongX: true, at: -10, a: -2, b: 10, arches: [], seed: 11 },
  { alongX: false, at: -1, a: -10, b: 0, arches: [], seed: 13 },
  { alongX: true, at: 1, a: -5, b: 7, arches: [], gap: [GATE.x0 - PG, GATE.x1 + PG], seed: 15 },
  { alongX: false, at: -4, a: 0, b: 13, arches: [], seed: 17, stairs: [STAIRS_AT.y0, STAIRS_AT.y1] },
  { alongX: false, at: 2, a: 1, b: 12, arches: [[2, 5], [8, 11]], seed: 19 },
  { alongX: true, at: 7, a: -4, b: 7, arches: [[-3, 0], [3, 6]], seed: 21 },
];
/** The walls toward the eye, cut low as the game leaves them. */
export const LOWS: readonly Rect[] = [
  { x0: 9, y0: -10, x1: 10, y1: 1 }, { x0: 7, y0: 0, x1: 9, y1: 1 }, { x0: 7, y0: 1, x1: 8, y1: 13 }, { x0: -4, y0: 12, x1: 7, y1: 13 },
];
export const WALL = 80;
export const LOW = 16;

/** The whole picture of the run in picture pixels, where the floor's (0, 0) is on it, and where a point of the world is on it. */
export const PICTURE = { W: 1200, H: 840, OX: 536, OY: 392 };
export const atPx = (x: number, y: number, z = 0): [number, number] => [PICTURE.OX + (x - y) * 32, PICTURE.OY + (x + y) * 16 - z];
/** One phone screen (507 x 234 game pixels), the camera on the hero, a little up the screen of his feet. */
export const PHONE = { W: 1014, H: 468, lift: 28 };

/** Where the hero stands: in the effigy hall in a shaft of light (the whole run and the phone screens), at the gate. */
export const HERO_RUN: [number, number] = [4.6, 9.2];
export const HERO_PHONE: Record<Look, [number, number]> = { morning: [4.6, 9.2], roots: [4.6, 9.2], noon: [4.6, 9.2] };
export const HERO_GATE: [number, number] = [4.0, 2.0];
/** Where the Warden is, in his hall: its middle, the room for his Lockdown round him. */
export const BOSS_AT: [number, number] = [4.6, -4.6];

// =================================================================================================
// Helpers

const clampK = (k: number): number => Math.max(0, Math.min(4, k));
const mod = (a: number, n: number): number => ((a % n) + n) % n;
function hexRgb(c: string): [number, number, number] {
  const n = parseInt(c.slice(1, 7), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
function toHex(r: number, g: number, b: number): string {
  const f = (v: number): string => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0');
  return `#${f(r)}${f(g)}${f(b)}`;
}
const mixMemo = new Map<string, string>();
/** A colour `k` of the way to another. */
export function mixC(a: string, b: string, k: number): string {
  const key = `${a}${b}${Math.round(k * 200)}`;
  const hit = mixMemo.get(key);
  if (hit) return hit;
  const [r0, g0, b0] = hexRgb(a);
  const [r1, g1, b1] = hexRgb(b);
  const out = toHex(r0 + (r1 - r0) * k, g0 + (g1 - g0) * k, b0 + (b1 - b0) * k);
  if (mixMemo.size < 400000) mixMemo.set(key, out);
  return out;
}
export function noise(x: number, y: number, k = 0): number {
  const i = Math.floor(x);
  const j = Math.floor(y);
  const fx = x - i;
  const fy = y - j;
  const sx = fx * fx * (3 - 2 * fx);
  const sy = fy * fy * (3 - 2 * fy);
  const a = hash(i, j, k) + (hash(i + 1, j, k) - hash(i, j, k)) * sx;
  const b = hash(i, j + 1, k) + (hash(i + 1, j + 1, k) - hash(i, j + 1, k)) * sx;
  return a + (b - a) * sy;
}
export const fbm = (x: number, y: number, k = 0): number => 0.55 * noise(x, y, k) + 0.3 * noise(x * 2.1, y * 2.1, k + 11) + 0.15 * noise(x * 4.3, y * 4.3, k + 23);
export const inRect = (x: number, y: number, r: Rect): boolean => x >= r.x0 && x < r.x1 && y >= r.y0 && y < r.y1;

// =================================================================================================
// THE PICTURE WITH A DEPTH: every pixel keeps the depth (x + y) of what was painted there; a nearer thing paints over a
// farther, never the other way, whatever order they come in. Figures are marked, so that the daylight in the air of a shaft
// never washes over one stood in it.

export class Deep extends Px {
  readonly dep: Float32Array;
  readonly fig: Uint8Array;
  depth = 0;
  figure = false;
  constructor(w: number, h: number, bg: string) {
    super(w, h);
    this.dep = new Float32Array(w * h).fill(-1e9);
    this.fig = new Uint8Array(w * h);
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) super.set(x, y, bg);
  }
  override set(x: number, y: number, c: string | null): this {
    x = Math.floor(x);
    y = Math.floor(y);
    if (c === null || x < 0 || y < 0 || x >= this.w || y >= this.h) return this;
    const i = y * this.w + x;
    if (this.depth < this.dep[i]) return this;
    this.dep[i] = this.depth;
    this.fig[i] = this.figure ? 1 : 0;
    return super.set(x, y, c);
  }
  /** Laid over what is there, whatever its depth (a haze, a shadow). */
  over(x: number, y: number, c: string): this {
    return super.set(x, y, c);
  }
  depthAt(x: number, y: number): number {
    return x < 0 || y < 0 || x >= this.w || y >= this.h ? -1e9 : this.dep[y * this.w + x];
  }
}

// =================================================================================================
// THE LIGHT: SHAFTS OF DAYLIGHT falling from cracks in the vaults above (each a column of light leaning from the upper left,
// its foot a pool on the floor), the cressets' honest fire, the hero's own pool. Each in three bands, their edges broken in a
// checker of two-pixel squares so that no circle reads (no soft gradient: his Pixels 1).

export type LightKind = 'sun' | 'warm' | 'pool';
export interface Lamp { x: number; y: number; z: number; r: number; k: number; kind: LightKind }
/** A shaft of daylight: its foot's middle on the floor, its radius (tiles), how it leans (tiles per picture pixel up, toward -x and -y), how high it is seen. */
export interface Beam { x: number; y: number; r: number; lean: readonly [number, number]; top: number; air?: boolean }
export interface Lights { lamps: Lamp[]; beams: Beam[]; sharp: boolean }

/** The middle of a shaft at a height. */
export const beamAxis = (b: Beam, z: number): [number, number] => [b.x - b.lean[0] * z, b.y - b.lean[1] * z];

/** How lit a point is, by each kind of light: 0 none, 1, 2, 3 the inner band. */
export function bands(x: number, y: number, z: number, L: Lights): [number, number, number] {
  const out: [number, number, number] = [0, 0, 0];
  const sx = Math.floor((x - y) * 16);
  const sy = Math.floor(((x + y) * 16 - z) / 2);
  const jit = (sx + sy) & 1 ? 0.045 : -0.045;
  for (const b of L.beams) {
    const zz = Math.max(0, z);
    if (zz > b.top) continue;
    const [ax, ay] = beamAxis(b, zz);
    if (Math.abs(x - ax) > b.r * 2.2 || Math.abs(y - ay) > b.r * 2.2) continue;
    const d = Math.hypot(x - ax, y - ay) / b.r + jit;
    let k = 0;
    if (L.sharp) k = d < 0.86 ? 3 : d < 1.0 ? 2 : 0;
    else k = d < 0.55 ? 3 : d < 0.85 ? 2 : d < 1.05 ? 1 : 0;
    // (the glow it throws round its foot, on the floor and the foot of what stands there)
    if (k === 0) {
      const d2 = Math.hypot(x - b.x, y - b.y) / (b.r * (L.sharp ? 1.6 : 2.9)) + zz / 170 + jit;
      if (d2 < 1) k = 1;
    }
    if (k > out[0]) out[0] = k;
  }
  for (const l of L.lamps) {
    if (Math.abs(x - l.x) > l.r * 1.1 || Math.abs(y - l.y) > l.r * 1.1) continue;
    const d = Math.hypot(x - l.x, y - l.y, (z - l.z) / 44) / l.r + jit;
    const b = Math.min(l.k, d < 0.34 ? 3 : d < 0.62 ? 2 : d < 1 ? 1 : 0);
    const i = l.kind === 'sun' ? 0 : l.kind === 'warm' ? 1 : 2;
    if (b > out[i]) out[i] = b;
  }
  return out;
}
/** A colour lit where it is: the daylight, then the fire's, then the hero's pool. */
export function lit(P: Pal, c: string, x: number, y: number, z: number, L: Lights, less = 0): string {
  const [s, w, p] = bands(x, y, z, L);
  return litBy(P, c, s - less, w - less, p - less);
}
export function litBy(P: Pal, c: string, s: number, w: number, p: number): string {
  if (s > 0) c = mixC(c, P.sun[s - 1], P.sunK[s - 1]);
  if (w > 0) c = mixC(c, P.warm[w - 1], P.warmK[w - 1]);
  if (p > 0 && s < 2) c = mixC(c, P.pool, p > 1 ? 0.18 : 0.1);
  return c;
}

/** The enemy's fire (art/mkit.ts FLAME), in the Warden's lock: dull embers. */
export const LOCK_FIRE = ['#7a1058', '#c0206a', '#ff4f8a'] as const;
/** What gives off its own light (a flame, the enemy's embers): never lit, never faded. */
export const SHINE = new Set<string>([...EMBER, '#ffe6a8', ...LOCK_FIRE]);

// =================================================================================================
// THE CROWN: the dead king's mark, an original one (a band, three tall points each with a ball, two low ones between)

/** The crown at (i, j) from its middle (j up), `r` its half width: 'gold' (raised, lit), 'dark' (cut), or null. */
export function crownPx(i: number, j: number, r: number): 'gold' | 'dark' | null {
  const u = i / r;
  const v = j / r;
  const a = Math.abs(u);
  if (a > 0.95) return null;
  // the band
  if (v >= -0.62 && v < -0.22) return v < -0.5 || v > -0.32 ? 'gold' : (Math.floor((u + 1) * 5) & 1 ? 'dark' : 'gold');
  if (v < -0.22) return null;
  // the points: three tall (to 0.62, a ball over each), two low between (to 0.22)
  for (const [c, top] of [[0, 0.62], [-0.68, 0.5], [0.68, 0.5]] as const) {
    const w = 0.16 * (1 - (v + 0.22) / (top + 0.22)) + 0.04;
    if (Math.abs(u - c) < w && v < top) return 'gold';
    if (Math.hypot(u - c, v - top - 0.12) < 0.12) return 'gold';
  }
  for (const c of [-0.34, 0.34]) {
    const w = 0.13 * (1 - (v + 0.22) / 0.44);
    if (Math.abs(u - c) < w && v < 0.22) return 'gold';
  }
  return null;
}

// =================================================================================================
// THE TOMB'S FACE: dressed stone in courses on a moulded plinth; A PILASTER every two tiles; between them, bay by bay, a
// faded BANNER, A WALL TOMB (an arched niche with an effigy lying in it), A BURIAL CELL barred with the Warden's iron, or
// the king's crown carved in a panel. Over it, look by look: ivy and roots at the cracks (A), the town's roots everywhere and
// moss (B), the Warden's chains hung bay to bay (C).

export type Bay = 'banner' | 'tomb' | 'cell' | 'crown' | 'plain';
/** What is in a bay of a wall (its seed), look by look. */
export function bayOf(look: Look, seed: number, bay: number): Bay {
  const h = hash(bay, seed, 71);
  const hall = seed === 11 || seed === 13;
  if (look === 'morning') return h < (hall ? 0.4 : 0.32) ? 'banner' : h < 0.56 ? 'tomb' : h < 0.7 ? 'cell' : h < 0.82 ? 'crown' : 'plain';
  if (look === 'roots') return h < 0.26 ? 'banner' : h < 0.54 ? 'tomb' : h < 0.68 ? 'cell' : h < 0.74 ? 'crown' : 'plain';
  return h < (hall ? 0.3 : 0.22) ? 'banner' : h < 0.46 ? 'tomb' : h < 0.72 ? 'cell' : h < 0.82 ? 'crown' : 'plain';
}

/** A ROOT of the town's trees come through the vault, on a wall: (its column, whether there is one), its line down the face. */
function rootOn(look: Look, s: number, up: number, seed: number): { e: number; w: number; across: number } | null {
  const pitch = look === 'roots' ? 40 : look === 'morning' ? 150 : 0;
  if (!pitch) return null;
  let best: { e: number; w: number; across: number } | null = null;
  const c0 = Math.floor(s / pitch);
  for (let c = c0 - 1; c <= c0 + 1; c++) {
    const have = hash(c, seed, 301);
    if (have > (look === 'roots' ? 0.86 : 0.42)) continue;
    const x0 = c * pitch + hash(c, seed, 303) * pitch * 0.7;
    // how far down it reaches (B: some to the floor)
    const end = look === 'roots' ? (hash(c, seed, 305) < 0.4 ? -4 : 8 + hash(c, seed, 307) * 36) : 34 + hash(c, seed, 307) * 26;
    if (up < end || up > 84) continue;
    const t = (up - end) / (84 - end);
    const thick = (look === 'roots' ? 3.6 + hash(c, seed, 309) * 4.4 : 1.8 + hash(c, seed, 309) * 1.8) * (0.35 + 0.65 * t) + 0.8;
    const wob = Math.sin(up * 0.09 + c * 1.7) * 6 + Math.sin(up * 0.23 + c) * 2.2 + (up - end) * (hash(c, seed, 311) - 0.5) * 0.25;
    const xm = x0 + wob;
    const e = Math.abs(s - xm);
    if (e < thick && (!best || e - thick < best.e - best.w)) best = { e, w: thick, across: (s - xm) / thick };
    // a side root, thinner, off it
    const at = end + (84 - end) * (0.3 + hash(c, seed, 313) * 0.4);
    if (up < at && up > at - 22) {
      const dir = hash(c, seed, 315) < 0.5 ? -1 : 1;
      const xs = xm + dir * (at - up) * 0.9 + Math.sin(up * 0.3) * 1.5;
      const ws = 1.1 + ((up - (at - 22)) / 22) * 1.2;
      const es = Math.abs(s - xs);
      if (es < ws && (!best || es - ws < best.e - best.w)) best = { e: es, w: ws, across: (s - xs) / ws };
    }
  }
  return best;
}

/** The face's stone, coursed, look by look its age. */
function ashlar(P: Pal, look: Look, lit0: boolean, s: number, up: number, seed: number): string {
  const S = P.stone;
  const down = lit0 ? 0 : 1;
  const CH = 16;
  const cv = up - 12;
  const row = Math.floor(cv / CH);
  const lv = mod(cv, CH);
  const off = Math.floor(hash(row, seed, 1) * 40);
  const L = 30 + Math.floor(hash(row, seed, 2) * 14);
  const uu = s + off + 400;
  const b = Math.floor(uu / L);
  const lu = mod(uu, L);
  if (lv === CH - 1 || lu === 0) {
    if (look === 'roots' && fbm(s / 20, up / 14, seed + 5) > 0.5) return P.moss[clampK(1 + (lit0 ? 1 : 0))];
    return P.seam;
  }
  let kk = 2;
  const tone = hash(b, row * 7 + seed, 3);
  if (tone < 0.18) kk -= 1;
  else if (tone > 0.9) kk += 1;
  if (lv === CH - 2) kk += 1;
  if (lit0 && lu === 1) kk += 1;
  if (lv === 0 || lu === L - 1) kk -= 1;
  // (a chip off a corner)
  if (hash(b, row, seed + 9) > 0.8 && lv > CH - 5 && lu < 4) kk -= 1;
  let c = S[clampK(kk - down)];
  if (look === 'morning') {
    // water stains from the cracks, faint, running down
    const st = noise(s / 9, 3, seed + 31);
    if (st > 0.72 && up > 20 + noise(s / 5, 1, seed) * 30) c = mixC(c, S[0], 0.22);
  } else if (look === 'roots') {
    // damp: darker low down, moss on the lower courses and the tops of stones
    if (up < 30 && fbm(s / 18, up / 10, seed + 7) > 0.56) c = P.moss[clampK(kk - down)];
    else if (lv >= CH - 3 && fbm(s / 11, up / 8, seed + 13) > 0.62) c = P.moss[clampK(kk + 1 - down)];
    else if (up < 22) c = mixC(c, S[0], 0.18);
  } else {
    // marble: thin veins slanting across
    const v = Math.abs(mod(s * 0.6 + up * 1.3 + noise(s / 14, up / 14, seed) * 22 + b * 17, 47) - 23);
    if (v < 0.7) c = S[clampK(kk + 1 - down)];
    else if (v < 1.3 && tone > 0.5) c = mixC(c, S[0], 0.25);
  }
  return c;
}

/** A link of a chain at (along it, across it): 'lit' | 'dark' | null; links of 5 picture pixels, flat and edge-on by turns. */
function chainLink(a: number, b: number): 'lit' | 'dark' | null {
  const k = Math.floor(a / 5);
  const f = mod(a, 5);
  if (k & 1) return Math.abs(b) < 0.8 && f > 0.2 && f < 4.8 ? (b < 0 ? 'lit' : 'dark') : null;
  const ring = Math.hypot((f - 2.5) / 2.6, b / 1.9);
  if (ring < 1 && ring > 0.45) return b < 0 || f < 2 ? 'lit' : 'dark';
  return null;
}

/** The face at a point (s along it in picture pixels, up over its foot). */
export function tombFace(P: Pal, look: Look, lit0: boolean, s: number, up: number, seed: number): string {
  const S = P.stone;
  const I = P.iron;
  const down = lit0 ? 0 : 1;
  const sw = mod(s, 64);
  const d = sw < 32 ? sw : sw - 64;
  const bay = Math.floor(s / 64);
  const m = sw - 32;
  const what = bayOf(look, seed, bay);
  // ROOTS of the town's trees through the vault (A at the cracks; B everywhere)
  const rt = rootOn(look, s, up, seed);
  if (rt) {
    const R = P.root;
    const a = rt.across;
    if (Math.abs(a) > 0.82) return R[0];
    let k = a < -0.4 ? 3 : a < 0.25 ? 2 : 1;
    if (hash(Math.floor(s), Math.floor(up / 3), 333) > 0.85) k -= 1;
    if (look === 'roots' && a < -0.2 && fbm(s / 6, up / 6, 335) > 0.6) return P.moss[clampK(k)];
    return R[clampK(k + (lit0 ? 0 : 0) - (lit0 ? 0 : 1) + 1)];
  }
  // IVY (A) round the roots and the cracks' heads, hanging down a little
  if (look === 'morning' && up > 40) {
    const near = rootOn(look, s, Math.max(up, 70), seed) ?? rootOn(look, s + 10, Math.max(up, 70), seed) ?? rootOn(look, s - 10, Math.max(up, 70), seed);
    if (near && fbm(s / 7, up / 7, 341) > 0.48 + (84 - up) / 80) {
      const lf = hash(s >> 1, up >> 1, 343);
      if (lf > 0.35) return P.leaf[clampK((lf > 0.8 ? 4 : lf > 0.6 ? 3 : 2) - down)];
      return P.leaf[clampK(1 - down)];
    }
  }
  // THE PILASTER: square, 12 across, fluted, on its base, its capital a carved band
  if (Math.abs(d + 0.5) <= 6) {
    if (up < 14) return up === 13 ? S[clampK(4 - down)] : up === 12 ? S[clampK(1 - down)] : up < 2 ? S[clampK(1 - down)] : S[clampK(3 - down)];
    if (up >= 60 && up < 70) {
      if (up === 69) return S[clampK(4 - down)];
      if (up === 60) return P.seam;
      // (the capital: a band of little leaves, lit along their tops)
      return mod(d + up, 4) < 2 ? S[clampK(3 - down)] : S[clampK(2 - down)];
    }
    // C: an iron ring on it, a chain from it
    if (look === 'noon' && Math.hypot(d + 0.5, up - 52) < 3.2 && Math.hypot(d + 0.5, up - 52) > 1.6) return up > 52 ? I[3] : I[1];
    if (d === -6) return S[clampK(4 - down)];
    if (d === -5) return S[clampK(3 - down)];
    if (d >= 5) return S[clampK(1 - down)];
    if (d === -2 || d === 2) return S[clampK(1 - down)];
    if (d === -1 || d === 3) return S[clampK(3 - down)];
    return S[clampK(2 - down)];
  }
  // THE PLINTH: a moulding
  if (up < 12) {
    if (look === 'roots' && fbm(s / 16, up / 6, seed + 3) > 0.55) return P.moss[clampK((up > 8 ? 3 : 2) - down)];
    if (up === 11) return S[clampK(4 - down)];
    if (up === 10) return S[clampK(2 - down)];
    if (up === 9) return P.seam;
    if (up < 2) return S[clampK(1 - down)];
    return S[clampK(2 - down)];
  }
  // C: THE WARDEN'S CHAIN hung from pilaster to pilaster across the bays with a cell or a tomb
  if (look === 'noon' && (what === 'cell' || what === 'tomb')) {
    const sag = 52 - 13 * (1 - (m / 26) ** 2);
    const ck = chainLink(m + 40, up - sag);
    if (Math.abs(m) < 26 && ck) return ck === 'lit' ? I[clampK(4 - down)] : I[1];
  }
  // A BANNER from a rod at 70 down to its hem, faded: folds lit on their left, a border, the king's crown at its middle
  if (what === 'banner' && Math.abs(m) <= 15) {
    const C = P.cloth;
    const T = P.trim;
    if (up >= 70 && up < 72) return Math.abs(m) <= 15 ? I[clampK(3 - down)] : null as unknown as string;
    const rag = look === 'roots' ? 30 : look === 'morning' ? 18 : 16;
    // a swallowtail hem, frayed (rotted in B)
    let hem = rag + Math.floor(hash(bay, Math.floor(m / 3), seed + 41) * (look === 'noon' ? 2 : 7)) + Math.max(0, 9 - Math.abs(m)) * 0.9;
    if (look === 'roots' && hash(bay, Math.floor(m / 4), seed + 45) > 0.6) hem += 10;
    if (up < 70 && up >= hem) {
      // holes eaten in it (B), a tear or two (A)
      if (look === 'roots' && fbm(m / 5, up / 5, seed + bay) > 0.68) return tombBehind(P, look, lit0, s, up, seed);
      if (look === 'morning' && up < hem + 3 && hash(bay, m, seed + 43) > 0.7) return tombBehind(P, look, lit0, s, up, seed);
      const f = mod(m + 15, 10);
      let kk = f < 2 ? 3 : f < 7 ? 2 : 1;
      if (Math.abs(m) >= 15) kk = 0;
      // the border, faded gold
      if (Math.abs(m) >= 12 && Math.abs(m) < 14) return T[clampK(kk - down)];
      if (up >= hem + 3 && up < hem + 5) return T[clampK(kk - down)];
      if (up >= 64 && up < 66) return T[clampK(kk - down)];
      // the crown at its middle
      const cr = crownPx(m, up - 47, 9);
      if (cr === 'gold') return T[clampK(kk + 1 - down)];
      if (cr === 'dark') return T[clampK(kk - 1 - down)];
      let c = C[clampK(kk - down)];
      // (faded: lighter in streaks where the light caught it for years)
      if (look !== 'noon' && fbm(m / 6, up / 22, seed + bay * 3) > 0.62) c = C[clampK(kk + 1 - down)];
      if (look === 'roots' && fbm(m / 4, up / 4, seed + 7) > 0.66) c = P.moss[clampK(kk - down)];
      return c;
    }
  }
  // A WALL TOMB: an arched niche, an effigy lying on the chest in it
  if (what === 'tomb' && Math.abs(m) <= 24 && up >= 14 && up < 62) {
    const ni = Math.abs(m) < 20 && (up < 44 || (m / 20) ** 2 + ((up - 44) / 13) ** 2 < 1);
    const ri = Math.abs(m) < 24 && (up < 44 || (m / 24) ** 2 + ((up - 44) / 17) ** 2 < 1);
    if (ri && !ni) {
      // the frame round it: a moulding lit on its upper left
      const ul = m < 0 || up > 50;
      return S[clampK((ul ? 4 : 1) - down - (Math.abs(m) > 22 ? 1 : 0))];
    }
    if (ni) {
      // the effigy, lying, head to the left on a pillow, hands folded, feet up
      const ef = effigyProfile(m);
      if (up >= 16 && up < 25) {
        // the chest's front: a little arcade carved in it
        if (up === 24) return S[clampK(4 - down)];
        if (up === 16) return S[clampK(1 - down)];
        const ar = mod(m + 20, 8);
        if (up < 22 && ar > 1 && ar < 6 && !(up > 19 && (ar === 2 || ar === 5))) return S[clampK(1 - down)];
        return S[clampK(3 - down)];
      }
      if (ef && up >= 25 && up < 25 + ef) {
        const top = up === 24 + ef;
        let c = S[clampK((top ? 4 : up < 27 ? 2 : 3) - down)];
        if (look === 'roots' && fbm(m / 3, up / 3, seed + bay) > 0.5 && up > 25 + ef - 3) c = P.moss[clampK((top ? 4 : 3) - down)];
        return c;
      }
      // the niche's back, in shade
      return mixC(S[clampK(1 - down)], P.seam, up > 40 ? 0.35 : 0.15);
    }
  }
  // A BURIAL CELL barred with the Warden's iron: an arched opening, the dark in it, bars, a lock
  if (what === 'cell' && Math.abs(m) <= 21 && up >= 12 && up < 64) {
    const ni = Math.abs(m) < 16 && (up < 42 || (m / 16) ** 2 + ((up - 42) / 14) ** 2 < 1);
    const ri = Math.abs(m) < 21 && (up < 42 || (m / 21) ** 2 + ((up - 42) / 19) ** 2 < 1);
    if (ri && !ni) return S[clampK(((m < 0 || up > 48) ? 4 : 1) - down - (Math.abs(m) > 19 ? 1 : 0))];
    if (ni) {
      // the lock plate
      if (Math.abs(m) <= 3 && up >= 27 && up < 34) {
        if (m === 0 && (up === 29 || up === 30)) return P.seam;
        return up === 33 || m === -3 ? I[clampK(4 - down)] : I[2];
      }
      // bars every six, crossbars at 26 and 46, riveted
      const bm = mod(m + 16, 6);
      if (bm < 2) return bm === 0 ? I[clampK(4 - down)] : I[1];
      if (up === 24 || up === 25 || up === 46 || up === 47) return up === 25 || up === 47 ? I[clampK(3 - down)] : I[1];
      // the dark behind, a skull and bones on the shelf there
      const sk = Math.hypot(m + 6, (up - 19) * 1.2);
      if (sk < 3.4) return P.bone[clampK((sk < 1.6 ? 2 : 1) - down)];
      if (up >= 15 && up < 17 && m > -1 && m < 12) return P.bone[clampK(1 - down)];
      return mixC(P.seam, P.beyond, 0.6);
    }
  }
  // THE KING'S CROWN in a carved panel
  if (what === 'crown' && Math.abs(m) <= 15 && up >= 24 && up < 58) {
    const e = Math.min(15 - Math.abs(m), up - 24, 57 - up);
    if (e < 1) return S[clampK((m < 0 || up > 54 ? 4 : 1) - down)];
    if (e < 3) return S[clampK(3 - down)];
    if (e < 4) return P.seam;
    const cr = crownPx(m, up - 40, 11);
    if (cr === 'gold') {
      const rim = crownPx(m - 1, up - 39, 11) === null;
      return look === 'noon' ? S[clampK((rim ? 4 : 3) - down)] : mixC(S[clampK((rim ? 4 : 3) - down)], P.trim[3], 0.35);
    }
    if (cr === 'dark') return P.seam;
    return S[clampK(1 - down)];
  }
  return tombBehind(P, look, lit0, s, up, seed);
}
/** The stone behind what hangs on a face (what shows through a banner's holes, or round anything). */
function tombBehind(P: Pal, look: Look, lit0: boolean, s: number, up: number, seed: number): string {
  return ashlar(P, look, lit0, s, up, seed);
}
/** An effigy in a wall tomb, lying: how high it stands over the chest at `m` from the niche's middle (0: none). */
function effigyProfile(m: number): number {
  if (m < -18 || m > 17) return 0;
  if (m < -11) return Math.hypot(m + 14, 0) < 3.6 ? 7 : 3;
  if (m < -9) return 5;
  if (m < -1) return m > -7 && m < -2 ? 7 : 5;
  if (m < 12) return 4;
  return m < 15 ? 7 : 5;
}

/** The top of a wall fading into the dark: the game's four steps. */
export function faded(P: Pal, c: string, z: number, top: number): string {
  const FADE = 24;
  const fromTop = top - 1 - z;
  if (fromTop < FADE) return mixC(c, P.beyond, [0.9, 0.66, 0.42, 0.2][Math.max(0, Math.floor((fromTop * 4) / FADE))]);
  return c;
}

// =================================================================================================
// THE WAYS BETWEEN THE ROOMS: a round-headed way, a ring of voussoirs round it, a keystone; THE TOWN'S STAIRS UP behind the
// game's gate's arch (art/gates.ts ARCH: 40 to its spring, 42 its rise), standing whole over the walls' fading top.

export const OPEN = { half: 46, spring: 40, rise: 28, ring: 8 };
export const STAIR_ARCH = { half: 48, spring: 40, rise: 42, ring: 10, jamb: 12 };

/** Is a point (du from the way's middle, up) in a round-headed way? */
function inRound(du: number, up: number, half: number, spring: number, rise: number): boolean {
  if (Math.abs(du) >= half) return false;
  if (up < spring) return true;
  return (du / half) ** 2 + ((up - spring) / rise) ** 2 < 1;
}
/** The ring of voussoirs round a way at a point, if it is on it: a colour. */
function ringAt(P: Pal, look: Look, du: number, up: number, half: number, spring: number, rise: number, ring: number, lit0: boolean): string | null {
  const S = P.stone;
  const down = lit0 ? 0 : 1;
  if (inRound(du, up, half, spring, rise)) return null;
  if (up < spring) {
    // the jambs
    const a = Math.abs(du);
    if (a >= half + ring) return null;
    const e = a - half;
    if (e < 1) return S[clampK((du < 0 ? 4 : 1) - down)];
    if (e > ring - 1.2) return P.seam;
    if (mod(up, 16) === 15) return P.seam;
    return S[clampK(3 - down)];
  }
  if (!inRound(du, up, half + ring, spring, rise + ring)) {
    return null;
  }
  // the voussoirs: wedges round the head, the keystone at its crown
  const ang = Math.atan2(up - spring, du * (rise / half));
  const n = 11;
  const idx = Math.floor((ang / Math.PI) * n + 0.5);
  const into = (ang / Math.PI) * n + 0.5 - idx;
  const key = idx === Math.floor(n / 2) || idx === Math.ceil(n / 2) - 0 && Math.abs(du) < 6;
  const outer = !inRound(du, up + 1.2, half + ring - 1.2, spring, rise + ring - 1.2);
  if (outer) return P.seam;
  if (into < 0.07 && !key) return P.seam;
  const inner = !inRound(du, up - 1.5, half + 1.5, spring, rise + 1.5);
  if (inner && (du < 0 || up > spring + rise * 0.6)) return S[clampK(4 - down)];
  let c = S[clampK((idx % 2 ? 3 : 2) - down)];
  if (look === 'roots' && fbm(du / 6, up / 6, 371) > 0.6) c = P.moss[clampK(3 - down)];
  if (look === 'morning' && Math.abs(du) < 5 && up > spring + rise) c = mixC(S[clampK(3 - down)], P.trim[3], 0.3);
  return c;
}

// =================================================================================================
// PAINTING THE WALLS: each standing run as boxes of the game's height, cut round its openings; the faces lit where they stand

export function paintWalls(D: Deep, look: Look, L: Lights): void {
  const P = PALS[look];
  const iso = new Iso(D, PICTURE.OX, PICTURE.OY);
  for (const w of WALLS) {
    const cuts: [number, number][] = [];
    let a = w.a;
    const opens = [...w.arches.map((q) => [q[0], q[1]] as const), ...(w.gap ? [[w.gap[0], w.gap[1]] as const] : [])].sort((p, q) => p[0] - q[0]);
    for (const [o0, o1] of opens) {
      if (o0 > a) cuts.push([a, o0]);
      a = o1;
    }
    if (w.b > a) cuts.push([a, w.b]);
    const face = (alongT: number, up: number, top: number): string | null => {
      const [x, y] = w.alongX ? [alongT, w.at + 0.05] : [w.at + 0.05, alongT];
      const s = Math.floor(alongT * ISO_X + 1e-6);
      for (const o of w.arches) {
        const du = (alongT - (o[0] + o[1]) / 2) * ISO_X;
        if (Math.abs(du) > OPEN.half + OPEN.ring + 2) continue;
        if (inRound(du, up, OPEN.half, OPEN.spring, OPEN.rise)) return null;
        const rc = ringAt(P, look, du, up, OPEN.half, OPEN.spring, OPEN.rise, OPEN.ring, w.alongX);
        if (rc) return faded(P, lit(P, rc, x, y, up, L), up, WALL);
      }
      if (w.stairs) {
        const du = (alongT - (w.stairs[0] + w.stairs[1]) / 2) * ISO_X;
        const A = STAIR_ARCH;
        if (Math.abs(du) < A.half + A.ring + 2) {
          if (inRound(du, up, A.half, A.spring, A.rise)) return null;
          const rc = ringAt(P, look, du, up, A.half, A.spring, A.rise, A.ring, w.alongX);
          // (the arch stands whole over the walls' fading top, as the game's gates do)
          if (rc) return lit(P, rc, x, y, up, L);
          if (up >= top - 0) return null;
        }
      }
      if (up >= WALL) return null;
      const c = tombFace(P, look, w.alongX, s, up, w.seed);
      if (SHINE.has(c)) return c;
      return faded(P, lit(P, c, x, y, up, L), up, WALL);
    };
    const H = w.stairs ? STAIR_ARCH.spring + STAIR_ARCH.rise + STAIR_ARCH.ring + 2 : WALL;
    const run = (s0: number, s1: number): void => {
      if (w.alongX) {
        const y = w.at;
        iso.box(s0, y - 1, s1, y, 0, WALL, {
          top: (u, v) => {
            D.depth = s0 + u * (s1 - s0) + y - 1 + v;
            return P.beyond;
          },
          left: (u, v) => {
            const alongT = s0 + (u + 0.5) / ISO_X;
            D.depth = alongT + y;
            return face(alongT, WALL - 1 - v, WALL);
          },
          right: (u, v) => {
            const yy = y - (u + 0.5) / ISO_X;
            const up = WALL - 1 - v;
            D.depth = s1 + yy;
            const c = up < 12 ? P.stone[up === 11 ? 3 : 1] : mod(up + 4, 16) === 3 ? P.seam : P.stone[1];
            return faded(P, lit(P, c, s1 + 0.05, yy, up, L, 1), up, WALL);
          },
        });
      } else {
        const x = w.at;
        const tall = w.stairs && s0 < w.stairs[1] && s1 > w.stairs[0] ? H : WALL;
        iso.box(x - 1, s0, x, s1, 0, WALL, {
          top: (u, v) => {
            D.depth = x - 1 + u + s0 + v * (s1 - s0);
            return P.beyond;
          },
          left: (u, v) => {
            const xx = x - 1 + (u + 0.5) / ISO_X;
            const up = WALL - 1 - v;
            D.depth = xx + s1;
            const c = up < 12 ? P.stone[up === 11 ? 4 : 2] : mod(up + 4, 16) === 3 ? P.seam : P.stone[3];
            return faded(P, lit(P, c, xx, s1 + 0.05, up, L), up, WALL);
          },
          right: (u, v) => {
            const alongT = s1 - (u + 0.5) / ISO_X;
            D.depth = x + alongT;
            return face(alongT, WALL - 1 - v, WALL);
          },
        });
        if (tall > WALL) {
          // (the stairs' arch over the wall's top: its ring standing whole)
          iso.right(x, s0, s1, WALL, tall, (u, v) => {
            const alongT = s1 - (u + 0.5) / ISO_X;
            D.depth = x + alongT + 0.01;
            const up = tall - 1 - v;
            const du = (alongT - (w.stairs![0] + w.stairs![1]) / 2) * ISO_X;
            const A = STAIR_ARCH;
            const rc = ringAt(P, look, du, up, A.half, A.spring, A.rise, A.ring, false);
            return rc ? lit(P, rc, x + 0.05, alongT, up, L) : null;
          });
        }
      }
    };
    for (const [s0, s1] of cuts) run(s0, s1);
    for (const ar of w.arches) run(ar[0], ar[1]);
  }
}

/** A WALL TOWARD THE EYE, cut low as the game leaves it: a coping of the tomb's stone. */
export function lowWall(D: Deep, look: Look, L: Lights, r: Rect, seed: number): void {
  const P = PALS[look];
  const S = P.stone;
  const iso = new Iso(D, PICTURE.OX, PICTURE.OY);
  const long = r.x1 - r.x0 > r.y1 - r.y0;
  iso.box(r.x0, r.y0, r.x1, r.y1, 0, LOW, {
    top: (u, v) => {
      const x = r.x0 + u * (r.x1 - r.x0);
      const y = r.y0 + v * (r.y1 - r.y0);
      D.depth = x + y + 0.5;
      const a = long ? x : y;
      const across = long ? (y - r.y0) / (r.y1 - r.y0) : (x - r.x0) / (r.x1 - r.x0);
      const fa = mod(a * 2 + hash(seed, 0, 3), 1);
      let c = fa < 0.05 || across < 0.08 ? P.seam : hash(Math.floor(a * 2), seed, 5) > 0.7 ? S[2] : S[3];
      if (c !== P.seam && (fa < 0.12 || (long ? across > 0.86 : across < 0.2))) c = S[4];
      if (look === 'roots' && fbm(x * 4, y * 4, seed) > 0.58) c = P.moss[3];
      return lit(P, c, x, y, LOW, L);
    },
    left: (u, v) => {
      const x = r.x0 + (u + 0.5) / ISO_X;
      D.depth = x + r.y1 + 0.5;
      const c = v < 1 ? S[4] : v > LOW - 4 ? S[1] : S[v % 8 === 7 ? 0 : 2];
      return lit(P, c, x, r.y1, LOW - v, L);
    },
    right: (u, v) => {
      const y = r.y1 - (u + 0.5) / ISO_X;
      D.depth = r.x1 + y + 0.5;
      const c = v < 1 ? S[3] : v > LOW - 4 ? S[0] : S[v % 8 === 7 ? 0 : 1];
      return lit(P, c, r.x1, y, LOW - v, L);
    },
  });
}

// =================================================================================================
// THE FLOOR: great flags laid square on the tiles' lines, a carved border round each, BRASS inlaid (a band round each room, a
// star at the flags' meetings in his hall); THE GRAVE SLABS of the king's court let into it, each with a knight cut in it;
// look by look: worn and warm (A), heaved by roots, mossed, puddled (B), a checker of white and grey-blue marble (C)

/** The grave slabs: [x, y] of a slab's corner, along x or along y (two tiles long, a tile wide). */
export const SLABS: readonly [number, number, boolean][] = [
  [-3.5, 1.5, false], [-2.25, 1.5, false], [-1.0, 1.5, false], [0.25, 3.8, true], [-3.5, 4.3, true],
  [2.5, 10.7, true], [5.2, 10.7, true], [-3.4, 7.5, true],
];
function slabAt(x: number, y: number): { u: number; v: number; i: number } | null {
  for (let i = 0; i < SLABS.length; i++) {
    const [sx, sy, ax] = SLABS[i];
    const [w, h] = ax ? [2, 0.9] : [0.9, 2];
    if (x >= sx && x < sx + w && y >= sy && y < sy + h) return { u: ax ? (x - sx) / 2 : (y - sy) / 2, v: ax ? (y - sy) / 0.9 : (x - sx) / 0.9, i };
  }
  return null;
}
/** A knight cut in a grave slab (u along it 0 at his head, v across): his outline. */
function slabKnight(u: number, v: number): boolean {
  const a = Math.abs(v - 0.5);
  const head = Math.hypot((u - 0.16) * 2.2, a * 1.3) < 0.13;
  const ring = Math.hypot((u - 0.16) * 2.2, a * 1.3);
  if (ring > 0.11 && ring < 0.15) return true;
  void head;
  // his body's outline, shoulders to feet
  const half = u < 0.24 ? 0 : u < 0.32 ? 0.3 : 0.3 - (u - 0.32) * 0.22;
  if (u > 0.24 && u < 0.92 && Math.abs(a - half) < 0.035) return true;
  if (u > 0.9 && u < 0.93 && a < half) return true;
  // the sword down his middle, its cross at the waist
  if (u > 0.3 && u < 0.88 && a < 0.025) return true;
  if (u > 0.42 && u < 0.45 && a < 0.16) return true;
  return false;
}

function flagT(x: number, y: number, seed: number): number {
  const fu = x - Math.floor(x);
  const fv = y - Math.floor(y);
  const e = Math.min(fu, fv, 1 - fu, 1 - fv);
  if (e < 0.025) return -1;
  if (e < 0.06) return fu < 0.06 || 1 - fv < 0.06 ? 4 : 1;
  const tone = hash(Math.floor(x), Math.floor(y), seed);
  let k = tone < 0.22 ? 1 : tone > 0.88 ? 3 : 2;
  const n = fbm(x * 5, y * 5, seed + 2);
  if (n > 0.66) k += 1;
  if (n < 0.3) k -= 1;
  if (hash(Math.floor(x), Math.floor(y), seed + 4) > 0.74 && Math.abs(fv - 0.5 - (fu - 0.5) * 0.7 + Math.sin(fu * 13) * 0.04) < 0.014) return -1;
  return clampK(k);
}

/** B's roots across the floor: polylines from the walls' feet. */
export const FLOOR_ROOTS: readonly (readonly [number, number])[][] = [
  [[-4, 2.2], [-3.2, 2.6], [-2.4, 2.4], [-1.6, 3.0]], [[0.2, 1.0], [0.0, 1.8], [-0.6, 2.4]], [[2, 9.0], [2.8, 9.6], [3.2, 10.6]],
  [[6.5, 7], [6.2, 7.8], [6.6, 8.6]], [[-1, -6.2], [0.0, -5.6], [0.6, -5.8], [1.2, -5.0]], [[8.0, -10], [7.6, -9.0], [8.2, -8.4]],
  [[-4, 9.6], [-3.4, 10.4], [-2.4, 10.8]], [[3.0, 1], [3.2, 1.8], [2.6, 2.6]],
];
/** Puddles (B): middle, radii. */
export const PUDDLES: readonly [number, number, number, number][] = [[-1.2, 10.6, 0.6, 0.35], [5.6, 8.0, 0.5, 0.3], [-2.0, 4.4, 0.55, 0.3], [6.0, -2.0, 0.6, 0.35], [1.6, -7.6, 0.45, 0.3]];

function rootDist(x: number, y: number): { d: number; w: number } {
  let best = { d: 9, w: 0 };
  FLOOR_ROOTS.forEach((pl, i) => {
    for (let k = 0; k + 1 < pl.length; k++) {
      const [ax, ay] = pl[k];
      const [bx, by] = pl[k + 1];
      const dx = bx - ax;
      const dy = by - ay;
      const L2 = dx * dx + dy * dy;
      const t = Math.max(0, Math.min(1, ((x - ax) * dx + (y - ay) * dy) / L2));
      const px = ax + dx * t;
      const py = ay + dy * t;
      const wob = Math.sin((k + t) * 9 + i) * 0.03;
      const d = Math.hypot(x - px, y - py) + wob;
      const w = 0.2 - (k + t) / pl.length * 0.11;
      if (d - w < best.d - best.w) best = { d, w };
    }
  });
  return best;
}

export function paintFloors(D: Deep, look: Look, L: Lights): void {
  const P = PALS[look];
  const iso = new Iso(D, PICTURE.OX, PICTURE.OY);
  const rooms: [Rect, number][] = [[HALL, 701], [RA, 703], [RB, 705], [RC, 707], [RD, 709], [GATE, 713], ...PASSES.map((p, i): [Rect, number] => [p, 715 + i])];
  for (const [r, seed] of rooms) {
    const isRoom = ROOMS.includes(r);
    iso.top(r.x0, r.y0, r.x1, r.y1, 0, (u, v) => {
      const x = r.x0 + u * (r.x1 - r.x0);
      const y = r.y0 + v * (r.y1 - r.y0);
      D.depth = x + y;
      const F = look === 'noon' && (Math.floor(x) + Math.floor(y)) & 1 ? P.flags2 : P.flags;
      const f = flagT(x, y, 611);
      let c = f < 0 ? P.seam : F[f];
      // C: veins in the marble
      if (look === 'noon' && f >= 0) {
        const vn = Math.abs(mod(x * 9 + y * 4 + noise(x * 3, y * 3, 613) * 3, 5) - 2.5);
        if (vn < 0.05) c = F[clampK(f + 1)];
      }
      // A: worn smooth and lighter down the middle of the ways
      if (look === 'morning' && f >= 0 && fbm(x * 1.2, y * 1.2, 617) > 0.6) c = F[clampK(f + 1)];
      // BRASS: a band round each room, a tile and a half in from its walls; a star at the flags' corners in his hall
      if (isRoom) {
        const e = Math.min(x - r.x0, y - r.y0, r.x1 - x, r.y1 - y);
        if (Math.abs(e - 0.42) < 0.035 && look !== 'roots') c = P.brass[e < 0.42 ? 3 : 2];
        if (look === 'roots' && Math.abs(e - 0.42) < 0.035 && fbm(x * 3, y * 3, 619) > 0.45) c = P.brass[2];
        if (r === HALL) {
          const fu = x - Math.round(x);
          const fv = y - Math.round(y);
          if (Math.abs(fu) + Math.abs(fv) < 0.1 && look !== 'roots') c = Math.abs(fu) + Math.abs(fv) < 0.05 ? P.brass[4] : P.brass[2];
        }
      }
      // THE GRAVE SLABS of the court
      const sl = slabAt(x, y);
      if (sl) {
        const S = P.slab;
        const e = Math.min(sl.u * 2, (1 - sl.u) * 2, sl.v * 0.9, (1 - sl.v) * 0.9);
        if (e < 0.02) c = P.seam;
        else if (e < 0.05) c = look === 'roots' ? S[3] : P.brass[3];
        else if (slabKnight(sl.u, sl.v)) c = look === 'noon' ? S[4] : S[0];
        else {
          const n = fbm(x * 6, y * 6, 621 + sl.i);
          c = S[n > 0.62 ? 3 : n > 0.4 ? 2 : 1];
          if (look === 'roots' && n > 0.56) c = P.moss[2];
        }
      }
      // B: THE ROOTS over the floor, the flags heaved round them, moss in the joints; PUDDLES
      if (look === 'roots') {
        if (f < 0 && fbm(x * 4, y * 4, 623) > 0.42) c = P.moss[2];
        const rd = rootDist(x, y);
        if (rd.d < rd.w) {
          const a = rd.d / rd.w;
          c = P.root[a < 0.35 ? 3 : a < 0.75 ? 2 : 1];
        } else if (rd.d < rd.w + 0.05) c = P.seam;
        else if (rd.d < rd.w + 0.18 && f >= 0 && hash(Math.floor(x * 12), Math.floor(y * 12), 625) > 0.6) c = F[clampK(f - 1)];
        for (const [px, py, rx, ry] of PUDDLES) {
          const q = Math.hypot((x - px) / rx, (y - py) / ry) + (noise(x * 6, y * 6, 627) - 0.5) * 0.3;
          if (q < 1) {
            const W = P.water;
            c = q > 0.88 ? W[2] : W[3];
            // the vault's light caught in it, a streak
            if (Math.abs((x - px) - (y - py) * 0.5) < 0.04 && q < 0.75) c = W[4];
            else if (Math.abs((x - px) - (y - py) * 0.5 + 0.12) < 0.03 && q < 0.6) c = W[3];
          }
        }
      }
      // the floor at a far wall's foot, in its shade
      const nf = Math.min(x - r.x0, y - r.y0);
      if (isRoom && nf < 0.14) c = mixC(c, P.beyond, 0.35);
      return lit(P, c, x, y, 0, L);
    });
  }
}

/** Dust, grit, leaves blown in through the cracks; little stones fallen from the vault. Over the floor, under what stands. */
export function paintChips(D: Deep, look: Look, L: Lights): void {
  const P = PALS[look];
  let n = 0;
  for (const r of ROOMS) {
    const count = Math.round((r.x1 - r.x0) * (r.y1 - r.y0) * (look === 'noon' ? 0.8 : look === 'roots' ? 3.2 : 2));
    for (let i = 0; i < count; i++) {
      const x = r.x0 + 0.2 + hash(i, n, 801) * (r.x1 - r.x0 - 0.4);
      const y = r.y0 + 0.2 + hash(i, n, 803) * (r.y1 - r.y0 - 0.4);
      n++;
      const [X0, Y0] = atPx(x, y);
      const X = Math.round(X0);
      const Y = Math.round(Y0);
      if (D.depthAt(X, Y) > x + y + 0.2) continue;
      D.depth = x + y + 0.01;
      const leaf = look !== 'noon' && hash(i, n, 805) < (look === 'roots' ? 0.6 : 0.4);
      if (leaf) {
        const G = look === 'roots' ? P.leaf : (['#2a2010', '#4a3418', '#6a4a20', '#7e5c28', '#946c30'] as R5);
        D.set(X, Y, lit(P, G[3], x, y, 1, L)).set(X + 1, Y, lit(P, G[2], x, y, 1, L)).set(X + 2, Y + 1, lit(P, G[1], x, y, 1, L));
        D.set(X + 1, Y + 1, lit(P, G[2], x, y, 1, L));
      } else {
        const w = 2 + Math.floor(hash(i, n, 807) * 2);
        for (let q = 0; q < w; q++) {
          D.set(X + q, Y - 1, lit(P, q === 0 ? P.stone[4] : P.stone[3], x, y, 2, L));
          D.set(X + q, Y, lit(P, P.stone[1], x, y, 1, L));
        }
      }
    }
  }
}

// =================================================================================================
// SOLIDS, MARCHED: for each pixel the line of sight is followed from the eye's side of the thing's box inward, and the first
// point inside it is what is seen. (x = (t + q) / 2, y = (t - q) / 2, z = 16 t - sy, q = sx / 32; t = x + y.)

export type Face = 'x' | 'y' | 'z' | 'in';
export interface Solid {
  box: { x0: number; y0: number; z0: number; x1: number; y1: number; z1: number };
  inside: (x: number, y: number, z: number) => boolean;
  shade: (x: number, y: number, z: number, face: Face) => string | null;
}

export function march(D: Deep, s: Solid, step = 0.02): void {
  const { OX, OY } = PICTURE;
  const b = s.box;
  const corners: [number, number][] = [];
  for (const x of [b.x0, b.x1]) for (const y of [b.y0, b.y1]) for (const z of [b.z0, b.z1]) corners.push(atPx(x, y, z));
  const minX = Math.max(0, Math.floor(Math.min(...corners.map((c) => c[0]))));
  const maxX = Math.min(D.w - 1, Math.ceil(Math.max(...corners.map((c) => c[0]))));
  const minY = Math.max(0, Math.floor(Math.min(...corners.map((c) => c[1]))));
  const maxY = Math.min(D.h - 1, Math.ceil(Math.max(...corners.map((c) => c[1]))));
  for (let py = minY; py <= maxY; py++) {
    const sy = py + 0.5 - OY;
    for (let px = minX; px <= maxX; px++) {
      const q = (px + 0.5 - OX) / 32;
      let lo = Math.max(2 * b.x0 - q, 2 * b.y0 + q, (b.z0 + sy) / 16);
      const hi = Math.min(2 * b.x1 - q, 2 * b.y1 + q, (b.z1 + sy) / 16);
      if (hi <= lo) continue;
      if (hi < D.depthAt(px, py)) continue;
      lo -= step;
      let prev: [number, number, number] | null = null;
      for (let t = hi; t >= lo; t -= step) {
        const x = (t + q) / 2;
        const y = (t - q) / 2;
        const z = 16 * t - sy;
        if (s.inside(x, y, z)) {
          let face: Face = 'in';
          if (prev) {
            if (!s.inside(prev[0], y, z)) face = 'x';
            else if (!s.inside(x, prev[1], z)) face = 'y';
            else if (!s.inside(x, y, prev[2])) face = 'z';
          } else face = t >= hi - 1e-6 ? (hi === 2 * b.x1 - q ? 'x' : hi === 2 * b.y1 + q ? 'y' : 'z') : 'in';
          const c = s.shade(x, y, z, face);
          if (c) {
            D.depth = t;
            D.set(px, py, c);
          }
          break;
        }
        prev = [x, y, z];
      }
    }
  }
}

// =================================================================================================
// THE TOWN'S STAIRS UP, in the stair hall's left wall: a flight of the tomb's stone going up away from the room (toward -x)
// between walls of it, under a vault, into the town's daylight at its top: plainly the way back up.

export const FLIGHT = { run: 0.26, rise: 7, steps: 13, inset: 0.3 };
export function paintStairs(D: Deep, look: Look, L: Lights): void {
  const P = PALS[look];
  const S = P.stone;
  const x0 = STAIRS_AT.x;
  const ym = (STAIRS_AT.y0 + STAIRS_AT.y1) / 2;
  const half = STAIR_ARCH.half / ISO_X;
  const stepTop = (x: number): number => {
    const d = x0 - FLIGHT.inset - x;
    if (d < 0) return 0;
    return Math.min(FLIGHT.steps, Math.floor(d / FLIGHT.run) + 1) * FLIGHT.rise;
  };
  const vault = (x: number, y: number): number => {
    const d = Math.max(0, x0 - FLIGHT.inset - x);
    const a = (y - ym) / half;
    return STAIR_ARCH.spring + 4 + d * (FLIGHT.rise / FLIGHT.run) + Math.sqrt(Math.max(0, 1 - a * a)) * STAIR_ARCH.rise - 2;
  };
  const end = x0 - FLIGHT.inset - FLIGHT.run * FLIGHT.steps;
  const air = (x: number, y: number, z: number): boolean => {
    if (Math.abs(y - ym) >= half) return false;
    if (z < stepTop(x)) return false;
    if (x < end - 0.6) return false;
    return z < vault(x, y);
  };
  // (the light of the town at the top: how far up the flight a point is, 0 at its foot to 1 at its head)
  const upK = (x: number): number => Math.max(0, Math.min(1, (x0 - x) / (x0 - end + 0.4)));
  march(D, {
    box: { x0: end - 0.8, y0: ym - half - 0.2, z0: 0, x1: x0 - 0.02, y1: ym + half + 0.2, z1: 260 },
    inside: (x, y, z) => !air(x, y, z),
    shade: (x, y, z) => {
      // (only what is seen through the arch's way)
      const dt = 2 * (x0 - x);
      const yw = y + dt / 2;
      const zw = z + 16 * dt;
      const du = (yw - ym) * ISO_X;
      if (!inRound(-du, zw, STAIR_ARCH.half, STAIR_ARCH.spring, STAIR_ARCH.rise)) return null;
      const k = upK(x);
      let c: string;
      const st = stepTop(x);
      const onTread = z >= st - 0.6 && z < st + 1 && Math.abs(y - ym) < half - 0.02;
      const onRiser = !onTread && z < st && Math.abs(y - ym) < half - 0.02;
      if (x < end - 0.55) c = mixC(P.sun[2], '#ffffff', 0.2);
      else if (onTread) {
        // a tread: its nosing lit, its stone, a joint across it now and then
        const into = mod(x0 - FLIGHT.inset - x, FLIGHT.run) / FLIGHT.run;
        c = into < 0.18 ? S[4] : into > 0.84 ? S[2] : S[3];
        if (Math.abs(mod((y - ym) * ISO_X + 60, 22) - 11) > 10.3) c = S[1];
      } else if (onRiser) {
        // a riser, turned to the room: in its own shade under the nosing above it
        c = z > st - 1.2 ? S[2] : S[1];
      } else if (Math.abs(y - ym) >= half - 0.02) {
        // the walls of the way, in courses, dark in the passage
        const course = Math.floor(z / 12);
        const along = (x0 - x) * 32 + (course % 2) * 14;
        c = mod(z, 12) < 1 || mod(along, 28) < 1 ? P.seam : mixC(y > ym ? S[1] : S[2], P.beyond, 0.25);
      } else c = mixC(S[1], P.beyond, 0.3);
      // (the town's daylight from the head of the flight: warmer and brighter the higher; the treads catch it most)
      const sunK = (k < 0.2 ? 0 : k < 0.42 ? 0.18 : k < 0.62 ? 0.36 : k < 0.8 ? 0.54 : 0.74) * (onTread ? 1.15 : 0.85);
      if (sunK > 0) c = mixC(c, P.sun[2], Math.min(0.85, sunK));
      return lit(P, c, Math.max(x, x0 - 0.3), y, Math.min(z, 30), L);
    },
  }, 0.012);
}

// =================================================================================================
// THE TOMBS OF THE KING'S COURT: a chest of the tomb's stone on a plinth, little arches carved round its sides, its lid
// overhanging, and an EFFIGY lying on it (head on a pillow, hands folded, feet up); bound in THE WARDEN'S IRON: two straps
// round it riveted, and a lock hung on its side. Moss on them in B.

export interface Chest { x: number; y: number; alongX: boolean; len: number; bound: boolean; open?: boolean }
export const CHESTS: Record<Look, Chest[]> = {
  morning: [
    { x: 2.95, y: 9.6, alongX: false, len: 1.9, bound: true }, { x: 6.15, y: 9.6, alongX: false, len: 1.9, bound: false },
    { x: -1.6, y: 3.6, alongX: true, len: 1.9, bound: true }, { x: 1.6, y: -8.4, alongX: false, len: 1.8, bound: true }, { x: 7.4, y: -8.4, alongX: false, len: 1.8, bound: true },
  ],
  roots: [
    { x: 2.95, y: 9.6, alongX: false, len: 1.9, bound: true }, { x: 6.15, y: 9.6, alongX: false, len: 1.9, bound: true },
    { x: -1.6, y: 3.6, alongX: true, len: 1.9, bound: false }, { x: 1.6, y: -8.4, alongX: false, len: 1.8, bound: true }, { x: 7.4, y: -8.4, alongX: false, len: 1.8, bound: true },
  ],
  noon: [
    { x: 2.95, y: 9.6, alongX: false, len: 1.9, bound: true }, { x: 6.15, y: 9.6, alongX: false, len: 1.9, bound: true },
    { x: -1.6, y: 3.6, alongX: true, len: 1.9, bound: true }, { x: 1.6, y: -8.4, alongX: false, len: 1.8, bound: true }, { x: 7.4, y: -8.4, alongX: false, len: 1.8, bound: true },
  ],
};
const CH = { wide: 0.42, plinth: 4, top: 22, lid: 27 };

type Mat = 'plinth' | 'chest' | 'lid' | 'effigy' | 'iron';
export function paintChest(D: Deep, look: Look, L: Lights, c: Chest): void {
  const P = PALS[look];
  const S = P.stone;
  const I = P.iron;
  const hl = c.len / 2;
  const hw = CH.wide;
  // local: a along the chest (its head at -hl, toward the back), b across, z up
  const loc = (x: number, y: number): [number, number] => (c.alongX ? [x - c.x, y - c.y] : [y - c.y, x - c.x]);
  const straps = [-hl * 0.45, hl * 0.42];
  const eff = (a: number, b: number, z: number): number => {
    // the effigy: ellipsoids, its field (< 0 inside)
    const zb = z - CH.lid;
    const e = (ca: number, cb: number, cz: number, ra: number, rb: number, rz: number): number => ((a - ca) / ra) ** 2 + ((b - cb) / rb) ** 2 + ((zb - cz) / rz) ** 2 - 1;
    return Math.min(
      e(-hl * 0.78, 0, 4, 0.13, 0.13, 5.5), // the head
      e(-hl * 0.86, 0, 1.2, 0.12, 0.22, 2.2), // the pillow
      e(-hl * 0.05, 0, 2.4, hl * 0.66, 0.2, 4.2), // the body
      e(-hl * 0.32, 0, 6.2, 0.1, 0.09, 2.6), // the hands, folded
      e(hl * 0.74, -0.08, 5.5, 0.06, 0.055, 6), e(hl * 0.74, 0.08, 5.5, 0.06, 0.055, 6), // the feet
    );
  };
  const mat = (x: number, y: number, z: number): Mat | null => {
    const [a, b] = loc(x, y);
    if (z < 0) return null;
    const strap = c.bound && straps.some((s) => Math.abs(a - s) < 0.05);
    if (z < CH.plinth) return Math.abs(a) < hl + 0.06 && Math.abs(b) < hw + 0.06 ? 'plinth' : null;
    if (z < CH.top) {
      if (strap && Math.abs(a) < hl + 0.03 && Math.abs(b) < hw + 0.03) return 'iron';
      return Math.abs(a) < hl && Math.abs(b) < hw ? 'chest' : null;
    }
    if (z < CH.lid) {
      if (strap && Math.abs(a) < hl + 0.08 && Math.abs(b) < hw + 0.08 && z < CH.lid + 1) return 'iron';
      return Math.abs(a) < hl + 0.05 && Math.abs(b) < hw + 0.05 ? 'lid' : null;
    }
    if (z < CH.lid + 14 && Math.abs(a) < hl && Math.abs(b) < hw) {
      if (eff(a, b, z) < 0) return strap && eff(a, b, z - 1) < 0 && eff(a, b, z + 1.2) >= 0 ? 'iron' : 'effigy';
      if (strap && eff(a, b, z - 1.2) < 0) return 'iron';
    }
    return null;
  };
  const reach = Math.max(hl, hw) + 0.15;
  march(D, {
    box: { x0: c.x - reach, y0: c.y - reach, z0: 0, x1: c.x + reach, y1: c.y + reach, z1: CH.lid + 16 },
    inside: (x, y, z) => mat(x, y, z) !== null,
    shade: (x, y, z, face) => {
      const m = mat(x, y, z)!;
      const [a, b] = loc(x, y);
      let k = 2;
      // which way it faces: up lit, toward -y... (screen-left, the +y side) between, toward +x (screen-right) in shade
      if (m === 'effigy') {
        const e = 0.03;
        const gx = eff(...loc(x + e, y), z) - eff(...loc(x - e, y), z);
        const gy = eff(...loc(x, y + e), z) - eff(...loc(x, y - e), z);
        const gz = (eff(a, b, z + 1) - eff(a, b, z - 1)) * 0.8;
        const n = Math.hypot(gx, gy, gz) || 1;
        const l = (gx * -0.3 + gy * 0.45 + gz * 0.85) / n;
        k = l > 0.62 ? 4 : l > 0.28 ? 3 : l > -0.1 ? 2 : 1;
        let col = (look === 'noon' ? S : P.stone)[clampK(k)];
        if (look === 'roots' && l > 0.3 && fbm(a * 9, b * 9 + z / 8, 881) > 0.48) col = P.moss[clampK(k)];
        return lit(P, col, x, y, z, L);
      }
      if (face === 'z') k = m === 'lid' ? 4 : 3;
      else if (face === 'y') k = 3;
      else if (face === 'x') k = 1;
      if (m === 'iron') {
        const rv = face !== 'z' && Math.abs(z - (CH.top - 4)) < 1 && Math.abs((c.alongX ? x : y) - (c.alongX ? x : y)) < 1;
        void rv;
        return lit(P, I[clampK(k + (face === 'z' ? 0 : 0))], x, y, z, L);
      }
      let col = S[clampK(k)];
      if (m === 'chest' && face !== 'z') {
        // the little arches carved round its sides
        const along = face === 'y' ? (c.alongX ? a : b) : c.alongX ? b : a;
        const ar = mod(along * 32 + 40, 9);
        const up = z - CH.plinth;
        if (up > 3 && up < 14 && ar > 1.5 && ar < 7.5 && !(up > 10 && (ar < 2.5 || ar > 6.5))) col = S[clampK(k - 1)];
        if (up >= CH.top - CH.plinth - 1) col = S[clampK(k + 1)];
      }
      if (m === 'lid' && face !== 'z' && z > CH.lid - 1.5) col = S[clampK(k + 1)];
      if (m === 'plinth') col = S[clampK(k - 1)];
      if (look === 'roots' && (face === 'z' || z < CH.plinth + 3) && fbm(a * 8 + z / 6, b * 8, 883) > 0.55) col = P.moss[clampK(k)];
      return lit(P, col, x, y, z, L);
    },
  }, 0.01);
  // THE LOCK hung on the strap at the chest's side toward the eye
  if (c.bound) {
    const [lx, ly] = c.alongX ? [c.x + straps[1], c.y + hw + 0.04] : [c.x + hw + 0.04, c.y + straps[1]];
    const [X0, Y0] = atPx(lx, ly, CH.top - 6);
    const X = Math.round(X0);
    const Y = Math.round(Y0);
    D.depth = lx + ly + 0.05;
    for (let j = -3; j < 0; j++) for (const i of [-2, 2]) D.set(X + i, Y + j, I[3]);
    D.set(X - 1, Y - 4, I[3]).set(X, Y - 4, I[3]).set(X + 1, Y - 4, I[2]);
    for (let j = 0; j < 6; j++) for (let i = -3; i <= 3; i++) D.set(X + i, Y + j, i === -3 || j === 0 ? I[4] : i === 3 || j === 5 ? I[0] : i === 0 && (j === 2 || j === 3) ? P.seam : I[2]);
  }
}

// =================================================================================================
// THE GATE OF HIS OWN, in the tomb's carved stone with his iron, in the boss's doorway: PILLARS of the pale stone, fluted, a
// round-headed way under a ring of voussoirs, the stone over it squared to a cornice and a GABLE like a tomb's front, the dead
// king's CROWN carved great in it; and on it THE WARDEN'S IRON: a band riveted across under the cornice, CHAINS from rings on
// the pillars to A GREAT LOCK hung over the keystone (the enemy's fire dull and low in its keyhole), SPIKES along the gable's
// edges, and at its peak his HORNS in black iron; THE DROP at the back of the way, drawn up: square bars, pointed, as his
// Lockdown's. An original design, built as the game's boss gates are: the three tiles of the way between two pillars
// (art/gates.ts: SPAN 96, PILLAR 12); painted slice by slice through the wall's thickness.

const PILLAR = 12;
export const GATE_W = 96 + PILLAR * 2;
/** The way: its half width, its spring, its rise (its crown at 86). */
export const GWAY = { half: 48, spring: 46, rise: 40 };
/** The ring of voussoirs, the cornice, the gable's peak, the horns' tips. */
export const GRING = 12;
export const CORNICE = { under: 108, top: 116 };
export const GABLE_PEAK = 170;
export const HORNS_TOP = 214;
/** The crown in the gable: its middle's height, its half width. */
export const GCROWN = { z: 138, r: 21 };
/** The lock over the keystone: its body's foot and top, its half width. */
export const GLOCK = { z0: 84, z1: 100, half: 9 };
/** Where the drop's points hang, drawn up (picture pixels over the floor). */
export const GATE_LIFT = 80;
/** His lock's place in the world: at the middle of the way, in the gate's face. */
export const LOCK_AT: [number, number, number] = [(GATE.x0 + GATE.x1) / 2, GATE.y1, (GLOCK.z0 + GLOCK.z1) / 2];

/** The gate's face at a point: `u` across from the outer edge of the left pillar, `up` over the floor. Null: the way through, or the air. */
export function gateFace(P: Pal, look: Look, u: number, up: number, front: boolean, back = 0): string | null {
  // (the gate's stone a tone lifted, as the game's gates are, so that it reads at the end of the way; its iron's edge catching the light)
  const S: R5 = [P.stone[1], P.stone[2], P.stone[3], P.stone[4], mixC(P.stone[4], '#ffffff', 0.14)];
  const I: R5 = [P.iron[0], P.iron[1], P.iron[2], P.iron[4], mixC(P.iron[4], P.stone[4], 0.45)];
  const mid = GATE_W / 2;
  const du = u + 0.5 - mid;
  const a = Math.abs(du);
  if (a > mid + 0.5) return null;
  // THE LOCK, hung over the keystone from the band: its shackle, its body, its keyhole in embers
  if (front && a <= GLOCK.half && up >= GLOCK.z0 && up < GLOCK.z1) {
    const e = Math.min(GLOCK.half - a, up - GLOCK.z0, GLOCK.z1 - 1 - up);
    if (e < 1) return du < 0 || up === GLOCK.z1 - 1 ? I[4] : I[0];
    // the keyhole: a round and a slot, the Warden's fire dull in it
    const kh = Math.hypot(du, up - 93) < 2.2 || (a < 1.2 && up >= 87 && up < 93);
    if (kh) return up < 90 ? LOCK_FIRE[1] : LOCK_FIRE[0];
    if (Math.hypot(du, up - 92) < 4.2) return I[1];
    // rivets at its corners
    if ((a > GLOCK.half - 3 && a < GLOCK.half - 1.5) && (up < GLOCK.z0 + 2.5 || up > GLOCK.z1 - 3.5) && up % 1 === 0) return I[4];
    return du < -2 ? I[3] : I[2];
  }
  if (front && up >= GLOCK.z1 && up < GLOCK.z1 + 7 && a >= 4 && a < 7) return du < 0 ? I[3] : I[1];
  if (front && up >= GLOCK.z1 + 5 && up < GLOCK.z1 + 8 && a < 7) return I[3];
  // THE CHAINS from the rings on the pillars (64 up) to the lock's sides, sagging
  if (front && a > 8 && a < 56) {
    const t = (a - 8) / 48;
    const z = 92 + (64 - 92) * t - 14 * Math.sin(Math.PI * t);
    const along = Math.hypot((a - 8) * 1, 0);
    // (links of eight, flat and edge-on by turns)
    const lk = Math.floor(along / 7);
    const f = mod(along, 7);
    const b = up - z;
    if (lk & 1) {
      if (Math.abs(b) < 1.2 && f > 0.4 && f < 6.6) return b < 0 ? I[4] : I[1];
    } else {
      const ring = Math.hypot((f - 3.5) / 3.6, b / 2.8);
      if (ring < 1 && ring > 0.42) return b > 0 || f < 3 ? I[4] : I[1];
    }
  }
  // THE WAY, under the ring
  if (inRound(du, up, GWAY.half, GWAY.spring, GWAY.rise)) return null;
  // THE PILLARS, to the spring: fluted, a base, a capital
  if (up < GWAY.spring) {
    if (a < GWAY.half) return null;
    if (!front) return mod(up, 16) === 15 ? P.seam : S[1];
    const pu = a - GWAY.half;
    // a ring on each pillar's face, for the chain
    if (Math.hypot(pu - 6, up - 34) < 3.2 && Math.hypot(pu - 6, up - 34) > 1.6) return up > 34 ? I[3] : I[1];
    if (up < 10) return up === 9 ? S[4] : up < 2 ? S[1] : S[3];
    if (up >= GWAY.spring - 6) return up === GWAY.spring - 1 ? S[4] : up === GWAY.spring - 6 ? P.seam : S[3];
    if (du < 0 ? pu > 10.5 : pu < 1.5) return du < 0 ? S[4] : S[1];
    if (du < 0 ? pu < 1.5 : pu > 10.5) return du < 0 ? S[1] : S[0];
    if (Math.abs(pu - 4) < 0.6 || Math.abs(pu - 8) < 0.6) return du < 0 ? S[2] : S[1];
    return du < 0 ? S[3] : S[2];
  }
  // THE RING of voussoirs, the stone squared round it, THE IRON BAND across under the cornice
  if (up < CORNICE.under) {
    if (!front) return S[1];
    if (up >= CORNICE.under - 8) {
      if (up === CORNICE.under - 1 || up === CORNICE.under - 8) return I[up === CORNICE.under - 1 ? 3 : 0];
      if (mod(du + 300, 10) < 1.5 && up === CORNICE.under - 5) return I[4];
      return I[2];
    }
    const rc = ringAt(P, look, du, up, GWAY.half, GWAY.spring, GWAY.rise, GRING, true);
    if (rc) return rc;
    // the squared stone (spandrels), its courses
    if (a > mid - 1.5) return S[du < 0 ? 4 : 1];
    if (mod(up - GWAY.spring, 14) === 13) return P.seam;
    return S[2];
  }
  // (over the cornice the gable is a pediment, a hand's breadth thick: nothing of it further back)
  if (!front && up >= CORNICE.top && back > 7) return null;
  // THE CORNICE: a moulding lit along its top
  if (up < CORNICE.top) {
    if (!front) return S[1];
    if (up === CORNICE.top - 1) return S[4];
    if (up === CORNICE.under) return P.seam;
    if (up === CORNICE.under + 2) return S[1];
    return (Math.floor(du / 4) & 1) && up < CORNICE.under + 4 ? S[2] : S[3];
  }
  // THE GABLE: rising to its peak, its edges raking; spikes of his iron along them; the crown in it
  const slope = (GABLE_PEAK - CORNICE.top) / (mid - 2);
  const edge = GABLE_PEAK - a * slope;
  if (up < edge) {
    // (behind its face: the gable's raking top lit as it goes back, its end in shade)
    if (!front) return up > edge - 3 ? S[3] : S[1];
    const fromEdge = edge - up;
    if (fromEdge < 2) return du < 0 ? S[4] : S[3];
    if (fromEdge < 6) return fromEdge < 3 ? P.seam : du < 0 ? S[3] : S[2];
    if (fromEdge < 7) return P.seam;
    const cr = crownPx(du, up - GCROWN.z, GCROWN.r);
    if (cr === 'gold') {
      const rim = crownPx(du - 1.5, up - GCROWN.z + 1.5, GCROWN.r) === null;
      const rimLo = crownPx(du + 1.5, up - GCROWN.z - 1.5, GCROWN.r) === null;
      if (rim) return S[4];
      if (rimLo) return S[1];
      return look === 'noon' ? S[3] : mixC(S[3], P.trim[3], 0.35);
    }
    if (crownPx(du, up - GCROWN.z, GCROWN.r + 2)) return S[0];
    // the field of the gable, sunk, its edge a seam
    return fromEdge < 8 ? S[1] : S[2];
  }
  if (!front) return null;
  // the spikes along the raking edges, every ten, leaning up and out
  const along = a / 10;
  const k = Math.round(along);
  if (a > 3 && a < mid - 4 && Math.abs(along - k) < 0.18 * Math.max(0, 1 - (up - edge) / 9) && up - edge < 9) return du < 0 ? I[3] : I[1];
  // HIS HORNS at the peak, in black iron: two horns curving up and out from a boss
  if (up >= GABLE_PEAK - 4 && up < HORNS_TOP) {
    const h = up - (GABLE_PEAK - 4);
    if (h < 10 && a < 9 - h * 0.4) return h > 8.5 || (du < 0 && a > 7.5 - h * 0.4) ? I[4] : du < 0 ? I[3] : I[2];
    // each horn's middle line: out from the boss, then up, its tip turned in
    const t = h / (HORNS_TOP - GABLE_PEAK + 4);
    const cx = 6 + 22 * Math.sin(t * 1.9) - 6 * t * t;
    const w = 5.2 * (1 - t) + 0.7;
    if (Math.abs(a - cx) < w) return a - cx > w - 1.4 || (t > 0.8 && a - cx > w - 2) ? I[4] : du < 0 ? I[3] : I[2];
  }
  return null;
}

/** THE GATE, painted into the picture with its depth: slices from the back of the wall to its face; the drop in its slot. */
export function paintGate(D: Deep, look: Look, L: Lights): void {
  const P = PALS[look];
  const iso = new Iso(D, PICTURE.OX, PICTURE.OY);
  const x0 = GATE.x0 - PILLAR / ISO_X;
  const x1 = GATE.x1 + PILLAR / ISO_X;
  const yBack = 0.35;
  const yFront = 1.0;
  const ySlot = 0.5;
  const top = HORNS_TOP + 4;
  for (let s = 0; ; s++) {
    const y = yBack + s / ISO_X;
    if (y > yFront + 1e-6) break;
    const front = y + 1 / ISO_X > yFront + 1e-6;
    if (Math.abs(y - ySlot) < 0.5 / ISO_X) paintDrop(D, iso, P, x0, x1, y, L);
    iso.left(x0, x1, y, 0, top, (u, v) => {
      const up = top - 1 - v;
      if (u >= GATE_W) return null;
      const c = gateFace(P, look, u, up, front, (yFront - y) * ISO_X);
      if (!c) return null;
      const x = x0 + (u + 0.5) / ISO_X;
      D.depth = x + y;
      if (SHINE.has(c)) return c;
      return lit(P, c, x, y + 0.1, up, L, front ? 0 : 1);
    });
  }
}
/** THE DROP drawn up into its slot: square bars of black iron every twelve, pointed, straps across. */
function paintDrop(D: Deep, iso: Iso, P: Pal, x0: number, x1: number, y: number, L: Lights): void {
  const I = P.iron;
  iso.left(x0, x1, y, 0, GWAY.spring + GWAY.rise, (u, v) => {
    const up = GWAY.spring + GWAY.rise - 1 - v;
    if (u < PILLAR || u >= GATE_W - PILLAR) return null;
    if (up < GATE_LIFT) return null;
    const x = x0 + (u + 0.5) / ISO_X;
    D.depth = x + y;
    const b = mod(u - PILLAR, 12);
    const h = up - GATE_LIFT;
    if (h >= 5 && h < 8) return lit(P, h === 7 ? I[4] : h === 5 ? I[0] : I[2], x, y, up, L, 1);
    // the bars, their points
    const w = h < 4 ? (h / 4) * 1.6 : 1.6;
    if (Math.abs(b - 6) <= w) return lit(P, b < 6 ? I[4] : I[2], x, y, up, L, 1);
    return null;
  });
}

// =================================================================================================
// THE SHAFTS OF DAYLIGHT, look by look: where each falls, how wide, how it leans (A the morning's long slant; B many and
// small, through the roots' holes; C few, sharp, near upright)

export const BEAMS: Record<Look, Beam[]> = {
  morning: [
    { x: 4.6, y: 9.2, r: 0.95, lean: [0.0105, 0.0025], top: 300 }, { x: -1.6, y: 9.9, r: 0.8, lean: [0.0105, 0.0025], top: 300 },
    { x: -1.7, y: 3.5, r: 0.8, lean: [0.0105, 0.0025], top: 300 }, { x: 5.4, y: 3.8, r: 0.7, lean: [0.0105, 0.0025], top: 300 },
    { x: 2.4, y: -6.2, r: 1.0, lean: [0.0105, 0.0025], top: 300 }, { x: 6.9, y: -2.6, r: 0.8, lean: [0.0105, 0.0025], top: 300 },
    { x: 6.4, y: -8.0, r: 0.6, lean: [0.0105, 0.0025], top: 300 },
  ],
  roots: [
    { x: 4.6, y: 9.2, r: 0.66, lean: [0.0085, 0.004], top: 300 }, { x: -2.1, y: 10.3, r: 0.55, lean: [0.0085, 0.004], top: 300 },
    { x: 0.0, y: 8.3, r: 0.4, lean: [0.0085, 0.004], top: 300 }, { x: 6.2, y: 11.3, r: 0.38, lean: [0.0085, 0.004], top: 300 },
    { x: -2.6, y: 2.6, r: 0.52, lean: [0.0085, 0.004], top: 300 }, { x: 0.1, y: 4.9, r: 0.38, lean: [0.0085, 0.004], top: 300 },
    { x: 3.5, y: 4.2, r: 0.46, lean: [0.0085, 0.004], top: 300 }, { x: 2.0, y: -7.0, r: 0.62, lean: [0.0085, 0.004], top: 300 },
    { x: 7.1, y: -5.6, r: 0.46, lean: [0.0085, 0.004], top: 300 }, { x: 4.0, y: -2.0, r: 0.42, lean: [0.0085, 0.004], top: 300 },
  ],
  noon: [
    { x: 4.6, y: 9.2, r: 0.62, lean: [0.0028, 0.0012], top: 320 }, { x: -1.5, y: 9.7, r: 0.52, lean: [0.0028, 0.0012], top: 320 },
    { x: -1.6, y: 3.5, r: 0.5, lean: [0.0028, 0.0012], top: 320 }, { x: 4.6, y: -7.3, r: 0.72, lean: [0.0028, 0.0012], top: 320 },
    { x: 1.7, y: -2.3, r: 0.46, lean: [0.0028, 0.0012], top: 320 },
  ],
};
/** The town's daylight down the stairs: a shaft through the arch, leaning up the flight. */
export const STAIR_BEAM: Beam = { x: -3.15, y: 9.5, r: 0.85, lean: [0.03, 0.0], top: 110, air: false };

/** The cressets in his hall (fire, its light): where. */
export const CRESSETS: [number, number][] = [[3.0, -9.0], [6.0, -9.0]];

/** Every light of a look, the hero's pool with them. */
export function lightsOf(look: Look, heroAt: [number, number]): Lights {
  const lamps: Lamp[] = [];
  for (const [x, y] of CRESSETS) lamps.push({ x, y, z: 34, r: 1.6, k: 3, kind: 'warm' });
  lamps.push({ x: heroAt[0], y: heroAt[1], z: 20, r: 1.5, k: 2, kind: 'pool' });
  return { lamps, beams: [...BEAMS[look], STAIR_BEAM], sharp: PALS[look].sharp };
}

/**
 * THE SHAFTS IN THE AIR: each a column of daylight leaning from the upper left, seen as the air in it lit (warmer, lighter),
 * streaked along its length, motes of dust turning in it; brightest low down, giving out in steps toward the vault above (and
 * over the walls' tops, in the dark). Laid over what is behind it, never over what stands in front of it, nor over a figure
 * stood in it.
 */
export function paintBeams(D: Deep, look: Look, L: Lights, dx = 0, dy = 0): void {
  const P = PALS[look];
  L.beams.forEach((b, bi) => {
    if (b.air === false) return;
    const rx = b.r * 45.25;
    const ry = b.r * 22.6;
    const [fx, fy] = atPx(b.x, b.y);
    const [tx, ty] = atPx(...beamAxis(b, b.top), b.top);
    const X0 = Math.max(0, Math.floor(Math.min(fx, tx) - rx - 2 + dx));
    const X1 = Math.min(D.w - 1, Math.ceil(Math.max(fx, tx) + rx + 2 + dx));
    const Y0 = Math.max(0, Math.floor(ty - ry - 2 + dy));
    const Y1 = Math.min(D.h - 1, Math.ceil(fy + ry + 2 + dy));
    if (X1 < X0 || Y1 < Y0) return;
    const W = X1 - X0 + 1;
    const H = Y1 - Y0 + 1;
    const lowZ = new Float32Array(W * H).fill(-1);
    const across = new Float32Array(W * H);
    for (let z = 0; z <= b.top; z += 1) {
      const [ax, ay] = beamAxis(b, z);
      const [cx0, cy0] = atPx(ax, ay, z);
      const cx = cx0 + dx;
      const cy = cy0 + dy;
      for (let py = Math.max(Y0, Math.floor(cy - ry)); py <= Math.min(Y1, Math.ceil(cy + ry)); py++) {
        const vy = (py + 0.5 - cy) / ry;
        if (Math.abs(vy) >= 1) continue;
        const hw = rx * Math.sqrt(1 - vy * vy);
        for (let px = Math.max(X0, Math.floor(cx - hw)); px <= Math.min(X1, Math.ceil(cx + hw)); px++) {
          const ux = (px + 0.5 - cx) / rx;
          if (ux * ux + vy * vy >= 1) continue;
          const i = (py - Y0) * W + (px - X0);
          if (lowZ[i] < 0) {
            lowZ[i] = z;
            across[i] = ux;
          }
        }
      }
    }
    for (let py = Y0; py <= Y1; py++) for (let px = X0; px <= X1; px++) {
      const i = (py - Y0) * W + (px - X0);
      const z = lowZ[i];
      if (z < 0) continue;
      const [ax, ay] = beamAxis(b, z);
      const at = ax + ay;
      const dep = D.depthAt(px, py);
      const k = py * D.w + px;
      if (D.fig[k] && dep > at - 0.15) continue;
      if (dep > at + b.r * 1.2) continue;
      const c = D.get(px, py);
      if (!c || SHINE.has(c)) continue;
      const h = z / b.top;
      const u = across[i];
      const chk = ((px >> 1) + (py >> 1)) & 1;
      // (in steps up its length, each edge a checker of two-pixel squares)
      let step = h < 0.18 + (chk ? 0.03 : 0) ? 3 : h < 0.42 + (chk ? 0.03 : 0) ? 2 : h < 0.7 + (chk ? 0.04 : 0) ? 1 : h < 0.92 && chk ? 1 : 0;
      if (Math.abs(u) > (P.sharp ? 0.9 : 0.78) + (chk ? 0.05 : 0)) step -= 1;
      // streaks along it
      const st = Math.floor((u + 1) * (P.sharp ? 3 : 5) + hash(bi, 7, 911) * 2);
      if (!P.sharp && hash(st, bi, 913) > 0.62) step -= 1;
      if (step <= 0) continue;
      let col = mixC(c, P.air, P.airK[step - 1]);
      // motes of dust (two-pixel squares), turning in it
      if (h < 0.55 && Math.abs(u) < 0.8 && hash(px >> 1, py >> 1, 917 + bi) > (look === 'noon' ? 0.992 : 0.984)) col = mixC(c, P.mote, 0.6);
      D.over(px, py, col);
    }
  });
}

/** B's drips from the vault into the puddles: a drop falling, a ring where it struck (frame `f`). */
export function paintDrips(D: Deep, look: Look, f = 0): void {
  if (look !== 'roots') return;
  const P = PALS[look];
  PUDDLES.forEach(([x, y], i) => {
    const [X0, Y0] = atPx(x + 0.1, y - 0.05);
    const X = Math.round(X0);
    const Y = Math.round(Y0);
    D.depth = x + y + 0.02;
    // the ring
    for (let a = 0; a < 24; a++) {
      const t = (a / 24) * Math.PI * 2;
      const r = 5 + ((i + f) % 3) * 2;
      D.over(Math.round(X + Math.cos(t) * r), Math.round(Y + Math.sin(t) * r * 0.5), P.water[3]);
    }
    // drops falling: a streak of three, two of them up the air
    for (const h of [40 + i * 23, 110 + i * 31]) {
      const yy = Y - (h % 160) - 6;
      for (let j = 0; j < 4; j++) if (D.depthAt(X, yy + j) <= x + y + 0.3) D.over(X, yy + j, j === 3 ? P.water[4] : P.water[3]);
    }
  });
}

/** Where the enemy's pink may be seen (the test's): the Warden, and the lock of his gate; in picture pixels from the world. */
export function pinkPlaces(): { at: [number, number, number]; rx: number; ry: number }[] {
  return [
    { at: [LOCK_AT[0], LOCK_AT[1], LOCK_AT[2]], rx: 14, ry: 14 },
    { at: [BOSS_AT[0], BOSS_AT[1], 50], rx: 90, ry: 110 },
  ];
}
