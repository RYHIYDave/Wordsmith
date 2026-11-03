// THE HEADSMAN'S FLOOR, ITS HALLS A PLACE OF THEIR OWN: THE CONDEMNED'S ROAD, the painting (the art chat, 2 Nov 2026). A
// MOCK-UP; NOTHING OF THE GAME IMPORTS IT.
//
// His words, 1 Nov 2026, 10:29: “I think we need to redo the art for a couple of the other early levels as well.  Floor 1 and
// 2 are probably fine.  But I think we’ve outgrown the 1-5 “just make it more dirt as you get lower” plan”; 2 Nov, 10:13:
// “We may as well redo the first level as well.  Why not, we just did every other level right?” Asked whether floor 2's halls
// too (his yard is new, the halls still the Crypt), his pick: “Yes, redo the halls (Recommended)”, offered as: the condemned's
// road: holding cells, the long walk and a last-rites chapel, torchlit, leading out into his yard at night.
//
// So: floor 2 laid OPEN as the main chat lays it (game/dungeon.ts, planOpen: the antechamber he comes in by, west of a grid of
// great rooms whose walls are knocked through, and the yard grown off the last of them toward +y, come into straight by its far
// wall along x): you come down FLOOR 1'S STAIRWELL (the stair from the Warden's hall) into THE GAOLER'S ROOM; a short way on into
// THE HOLDING CELLS, cell doors along its back wall; through the breach into THE CHAPEL OF LAST RITES, its altar against the
// back wall; from its mouth THE LONG WALK, straight, to HIS YARD'S GATE in the prison's high wall (art/yard_gate.ts, his yes,
// unchanged), and through it the yard at night (art/yard.ts, his yes, unchanged). THREE LOOKS within his pick:
//   A, WHITEWASHED CELLS: old whitewashed stone gone grey and flaking, wooden cell doors with grilles, tally marks scratched by
//      the doors, straw, torchlight.
//   B, THE LONG WALK: dark slate, oak doors studded with iron all down the walk, the torches few; a plain altar and a single
//      candle; at the walk's end a barred window on the night.
//   C, COLD NIGHT THROUGH THE SLITS: cold grey stone, high barred slits letting the moon in in pale shafts, the condemned's marks
//      cut round the doors (strokes, never letters), a chaplain's lectern, the torches few.
//
// His art rulebook kept: crisp pixels, two to a game pixel; one camera; light from the upper left (a face turned to screen-left
// lit, one turned right in shade); the walls toward the eye cut low, as the game leaves them; the walls' tops fading into the
// dark; torchlight an honest orange; nothing cyan (the friend's); the enemy's pink only in the Headsman and his gate's mark; no
// carved words; grim, never gory.
//
// Measures as the game's (art/isokit.ts): picture pixels; a tile 64 x 32 on the screen; heights up, in picture pixels. Painted
// with a DEPTH for every pixel (x + y of the world point seen there: the larger, the nearer the eye).

import { Px } from '../engine/px';
import { Iso, ISO_X } from '../art/isokit';
import { hash } from '../art/kit';
import { EMBER } from '../art/props';

export type Look = 'whitewash' | 'walk' | 'slits';
export const LOOKS: Look[] = ['whitewash', 'walk', 'slits'];
/** The letter he picks by, and the picture's name. */
export const LETTER: Record<Look, string> = { whitewash: 'a', walk: 'b', slits: 'c' };
export const FILE: Record<Look, string> = { whitewash: 'a_whitewashed_cells', walk: 'b_the_long_walk', slits: 'c_cold_night_through_the_slits' };
/** Each look in a line, for him. */
export const CAPTION: Record<Look, string> = {
  whitewash: 'A. Whitewashed cells: old limewash gone grey, wooden cell doors with grilles, tally marks, straw, torchlight.',
  walk: 'B. The long walk: dark slate, iron-studded doors all the way, a plain altar with one candle, a barred window on the night.',
  slits: "C. Cold night through the slits: the moon in pale shafts, the condemned's marks in the stone, a chaplain's lectern.",
};

/** Five tones of a material: its seam, its shade, its body, its light, its lit edge. */
export type R5 = readonly [string, string, string, string, string];
type R3 = readonly [string, string, string];

export interface Pal {
  /** The walls' face (A: the limewash), and the bare stone (A: under the wash; the frames, lintels, plinths, the flight). */
  stone: R5;
  bare: R5;
  /** The floor's flags. */
  flags: R5;
  straw: R5;
  wood: R5;
  iron: R5;
  /** The altar's cloth. */
  cloth: R5;
  bone: R5;
  /** His hood's red, as a place has it: near black. */
  hood: R5;
  rope: R5;
  wax: R5;
  /** The night seen through a window, top to bottom. */
  sky: R5;
  seam: string;
  beyond: string;
  /** Where no light falls, how far toward the dark. */
  dim: number;
  /** Fire's light (torches, candles, braziers), in three bands, and how far each goes toward it. */
  warm: R3;
  warmK: readonly [number, number, number];
  /** The moon's light (through the slits, the window, the gate). */
  moon: R3;
  moonK: readonly [number, number, number];
  /** The hero's own pool. */
  pool: string;
  /** The moon in the air of a shaft, how strong in three steps; motes in it. */
  air: string;
  airK: readonly [number, number, number];
  mote: string;
}

const BASE = {
  bone: ['#2a2620', '#463f35', '#625849', '#7c705c', '#948670'] as R5,
  hood: ['#120609', '#200a10', '#300f19', '#401622', '#4e1d2a'] as R5,
  warm: ['#4c2c12', '#965a20', '#dc963c'] as R3,
  warmK: [0.2, 0.32, 0.44] as const,
  moon: ['#283252', '#4a5a86', '#9aaad0'] as R3,
  sky: ['#05060f', '#0a0d1f', '#111632', '#1a2144', '#2b3762'] as R5,
  beyond: '#07060a',
  pool: '#6a6458',
  air: '#b4c2e6',
  mote: '#dfe6fa',
};

export const PALS: Record<Look, Pal> = {
  // WHITEWASHED CELLS: limewash gone grey over a brown-grey stone, warm timber doors, straw; torchlight
  whitewash: {
    ...BASE,
    stone: ['#232325', '#444447', '#636366', '#7d7d7f', '#949494'],
    bare: ['#191613', '#2d2822', '#423930', '#564a3e', '#685a4b'],
    flags: ['#191714', '#2d2924', '#433d35', '#575045', '#685f52'],
    straw: ['#1e1a11', '#3a321f', '#564a2d', '#6e5f3a', '#827148'],
    wood: ['#170f0a', '#2a1d13', '#3f2c1d', '#543b27', '#674a31'],
    iron: ['#0c0b0e', '#19171c', '#27242b', '#38343d', '#4d4853'],
    cloth: ['#272522', '#433f3a', '#5f5a52', '#78726a', '#8d867c'],
    rope: ['#1b1918', '#322e2b', '#4a4440', '#5f5853', '#726a63'],
    wax: ['#2a2520', '#4a4238', '#6c6254', '#8c806c', '#a89a84'],
    seam: '#110f0d',
    dim: 0.26,
    moonK: [0.14, 0.24, 0.34],
    airK: [0.05, 0.09, 0.14],
  },
  // THE LONG WALK: a dark slate, oak studded with iron, few torches, deep shade; the night at the walk's end
  walk: {
    ...BASE,
    stone: ['#121318', '#20222b', '#2f323e', '#3f4350', '#4f5461'],
    bare: ['#111216', '#1e2027', '#2c2f38', '#3b3e48', '#4a4e58'],
    flags: ['#131418', '#22242a', '#32353d', '#42454e', '#52555e'],
    straw: ['#1a1810', '#322d1d', '#4a4229', '#5f5535', '#706542'],
    wood: ['#130d09', '#24180f', '#352417', '#47311f', '#593e28'],
    iron: ['#0b0b0d', '#18181c', '#28282e', '#3c3c44', '#56565f'],
    cloth: ['#1d1c20', '#2f2d33', '#433f47', '#57525b', '#69636c'],
    rope: ['#19181a', '#2e2c2e', '#444043', '#585356', '#6a6466'],
    wax: ['#2a2520', '#4a4238', '#6c6254', '#8c806c', '#a89a84'],
    seam: '#0d0d10',
    dim: 0.3,
    moonK: [0.2, 0.32, 0.45],
    airK: [0.06, 0.11, 0.17],
  },
  // COLD NIGHT THROUGH THE SLITS: a cold grey-green stone, the moon in pale shafts, the torches few
  slits: {
    ...BASE,
    stone: ['#151922', '#242c3a', '#354052', '#475468', '#5a687c'],
    bare: ['#12151d', '#202733', '#303947', '#414c5c', '#525e70'],
    flags: ['#141820', '#232a36', '#333d4c', '#455061', '#566273'],
    straw: ['#1a1911', '#302e1f', '#47432d', '#5c563a', '#6d6647'],
    wood: ['#130f0b', '#241c14', '#36291d', '#493727', '#5a4430'],
    iron: ['#0b0c0d', '#17191b', '#25282b', '#363a3e', '#4b5055'],
    cloth: ['#1a1c1f', '#2c2f34', '#40444a', '#545960', '#666c73'],
    rope: ['#191a1a', '#2d2f2f', '#434646', '#575b5a', '#696d6c'],
    wax: ['#2a2622', '#4a443c', '#6c6458', '#8c8272', '#a89c88'],
    seam: '#0d0f0f',
    dim: 0.28,
    moonK: [0.26, 0.4, 0.56],
    airK: [0.04, 0.07, 0.11],
  },
};

// =================================================================================================
// THE PLACE, in tiles (x down the screen to the right, y down to the left, as the game's): floor 2 laid OPEN. He comes in by
// the gaoler's room (top left: the stair down from floor 1 in its left wall), a short way east into the holding cells, through
// the breach into the chapel (its rooms' walls knocked through, as the open floor's are), and from the chapel's mouth the long
// walk straight toward +y to the yard's far wall and its gate; the yard beyond (bottom left), his hall, as it is.

export interface Rect { x0: number; y0: number; x1: number; y1: number }
export const S_HALL: Rect = { x0: -8, y0: -5, x1: -3, y1: 1 };
export const WAY_IN: Rect = { x0: -3, y0: -4, x1: 0, y1: -1 };
export const CELLS: Rect = { x0: 0, y0: -6, x1: 7, y1: 1 };
export const BREACH: Rect = { x0: 7, y0: -5, x1: 10, y1: 0 };
export const CHAPEL: Rect = { x0: 10, y0: -6, x1: 17, y1: 1 };
/** The long walk, from the chapel's near wall to the yard's far wall (both their rows, the ways through them). */
export const WALK: Rect = { x0: 12, y0: 1, x1: 15, y1: 11 };
/** HIS YARD: 13 tiles each way (game/yard.ts YARD_N), its far wall along x at y 10, the doorway in it x 12 to 15. */
export const YARD: Rect = { x0: 3, y0: 11, x1: 16, y1: 24 };
export const DOOR = { x0: 12, x1: 15, row: 10, face: 11 };
export const ROOMS: readonly Rect[] = [S_HALL, CELLS, CHAPEL];
export const PASSES: readonly Rect[] = [WAY_IN, BREACH, WALK];
/** THE STAIR DOWN FROM FLOOR 1: three tiles of the gaoler's room's left wall (along y, its face at x = -8). */
export const STAIRS_AT = { x: -8, y0: -4, y1: -1 };

export type Bay = 'door' | 'open' | 'window' | 'tally' | 'marks' | 'niche' | 'torch' | 'plain';
/** A standing wall: along x (its face at y = `at`, lit) or along y (its face at x = `at`, in shade); from `a` to `b`; its openings; its bays, look by look, each `bw` tiles from `b0`. */
export interface WallRun {
  alongX: boolean;
  at: number;
  a: number;
  b: number;
  arches: readonly (readonly [number, number])[];
  seed: number;
  stairs?: readonly [number, number];
  b0: number;
  bw: number;
  bays: Record<Look, readonly Bay[]>;
}
const ALL = (...b: Bay[]): Record<Look, readonly Bay[]> => ({ whitewash: b, walk: b, slits: b });
export const WALLS: readonly WallRun[] = [
  // the gaoler's room: its back wall, its left wall with the stair down from floor 1
  { alongX: true, at: -5, a: -9, b: -3, arches: [], seed: 11, b0: -9, bw: 2, bays: { whitewash: ['plain', 'torch', 'tally'], walk: ['plain', 'torch', 'door'], slits: ['window', 'torch', 'marks'] } },
  { alongX: false, at: -8, a: -5, b: 1, arches: [], seed: 13, stairs: [STAIRS_AT.y0, STAIRS_AT.y1], b0: -5, bw: 2, bays: ALL('plain', 'plain', 'plain') },
  // the way in
  { alongX: true, at: -4, a: -3, b: -1, arches: [], seed: 15, b0: -3, bw: 2, bays: { whitewash: ['tally'], walk: ['plain'], slits: ['marks'] } },
  // the holding cells: the left wall, the way in through it; the back wall and its cells
  { alongX: false, at: 0, a: -6, b: 1, arches: [[-4, -1]], seed: 17, b0: -6, bw: 2, bays: ALL('plain', 'plain', 'plain', 'plain') },
  { alongX: true, at: -6, a: -1, b: 7, arches: [], seed: 19, b0: -1, bw: 2, bays: { whitewash: ['door', 'torch', 'door', 'open'], walk: ['door', 'open', 'torch', 'door'], slits: ['door', 'window', 'door', 'window'] } },
  // the breach's far end, a wall's thickness left standing
  { alongX: true, at: -5, a: 7, b: 10, arches: [], seed: 21, b0: 7, bw: 3, bays: ALL('plain') },
  // the chapel's back wall, its altar before the second bay
  { alongX: true, at: -6, a: 10, b: 18, arches: [], seed: 23, b0: 10.5, bw: 2, bays: { whitewash: ['torch', 'niche', 'torch', 'plain'], walk: ['plain', 'niche', 'torch', 'plain'], slits: ['window', 'niche', 'window', 'torch'] } },
  // the long walk's wall (its other side toward the eye)
  { alongX: false, at: 12, a: 2, b: 10, arches: [], seed: 25, b0: 2, bw: 1.6, bays: { whitewash: ['door', 'torch', 'tally', 'door', 'tally'], walk: ['door', 'torch', 'window', 'door', 'door'], slits: ['window', 'marks', 'window', 'marks', 'marks'] } },
];
/** The walls toward the eye, cut low as the game leaves them. */
export const LOWS: readonly Rect[] = [
  { x0: -9, y0: 1, x1: -3, y1: 2 }, { x0: -3, y0: -5, x1: -2, y1: -4 }, { x0: -3, y0: -1, x1: -1, y1: 0 }, { x0: -3, y0: 0, x1: -2, y1: 2 },
  { x0: -1, y0: 1, x1: 7, y1: 2 }, { x0: 7, y0: 0, x1: 10, y1: 2 }, { x0: 10, y0: 1, x1: 12, y1: 2 }, { x0: 15, y0: 1, x1: 18, y1: 2 },
  { x0: 17, y0: -6, x1: 18, y1: 1 }, { x0: 15, y0: 2, x1: 16, y1: 10 },
];
export const WALL = 80;
export const LOW = 16;

/** The picture of the run, and where the floor's (0, 0) is on it. Its origin can be moved (a phone screen is painted on its own). */
export const PICTURE = { W: 1200, H: 840, OX: 371, OY: 300 };
export const VIEW = { W: PICTURE.W, H: PICTURE.H, OX: PICTURE.OX, OY: PICTURE.OY };
export function setView(w: number, h: number, ox: number, oy: number): void {
  VIEW.W = w;
  VIEW.H = h;
  VIEW.OX = ox;
  VIEW.OY = oy;
}
export const atPx = (x: number, y: number, z = 0): [number, number] => [VIEW.OX + (x - y) * 32, VIEW.OY + (x + y) * 16 - z];
/** One phone screen (507 x 234 game pixels), the camera on the hero, a little up the screen of his feet. */
export const PHONE = { W: 1014, H: 468, lift: 28 };

/** Where the hero stands: on the long walk (the whole run and the phone screens); just out of the gate, in the yard. */
export const HERO_RUN: [number, number] = [13.55, 3.5];
export const HERO_PHONE: Record<Look, [number, number]> = { whitewash: [13.55, 3.5], walk: [13.55, 3.5], slits: [13.55, 3.5] };
export const HERO_GATE: [number, number] = [13.4, 12.1];

// =================================================================================================
// Helpers

const clampK = (k: number): number => Math.max(0, Math.min(4, k));
export const mod = (a: number, n: number): number => ((a % n) + n) % n;
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
// THE PICTURE WITH A DEPTH: every pixel keeps the depth (x + y) of what was painted there; a nearer thing paints over a farther.
// The floor is laid a step back (as the game draws the floor before anything stands), and marked as floor, so that what lies
// flat on it is laid only on it. Figures are marked, so that the moon in the air of a shaft never washes over one.

export const FLOOR_BACK = 0.9;
export class Deep extends Px {
  readonly dep: Float32Array;
  readonly fig: Uint8Array;
  readonly flr: Uint8Array;
  depth = 0;
  figure = false;
  floor = false;
  constructor(w: number, h: number, bg: string) {
    super(w, h);
    this.dep = new Float32Array(w * h).fill(-1e9);
    this.fig = new Uint8Array(w * h);
    this.flr = new Uint8Array(w * h);
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
    this.flr[i] = this.floor ? 1 : 0;
    return super.set(x, y, c);
  }
  /** Laid over what is there, whatever its depth (a haze, a shadow). */
  over(x: number, y: number, c: string): this {
    return super.set(x, y, c);
  }
  depthAt(x: number, y: number): number {
    return x < 0 || y < 0 || x >= this.w || y >= this.h ? -1e9 : this.dep[y * this.w + x];
  }
  isFloor(x: number, y: number): boolean {
    return x >= 0 && y >= 0 && x < this.w && y < this.h && this.flr[y * this.w + x] === 1;
  }
}

// =================================================================================================
// THE LIGHT: the torches' and candles' honest fire, the moon through the slits and the window and in at the gate, the hero's own
// pool. Each in three bands, their edges broken in a checker of two-pixel squares so that no circle reads (no soft gradient).

export type LightKind = 'moon' | 'warm' | 'pool';
export interface Lamp { x: number; y: number; z: number; r: number; k: number; kind: LightKind }
/** A shaft of moonlight: its foot's middle on the floor, its half widths (tiles) along x and along y, how it leans, its top (the slit it comes through), and its bars' shadows (offsets along x or y, tiles). */
export interface Beam { x: number; y: number; rx: number; ry: number; lean: readonly [number, number]; top: number; bars: readonly number[]; barsAlongX: boolean; air?: boolean }
export interface Lights { lamps: Lamp[]; beams: Beam[] }

export const beamAxis = (b: Beam, z: number): [number, number] => [b.x - b.lean[0] * z, b.y - b.lean[1] * z];

/** How lit a point is, by each kind of light: 0 none, 1, 2, 3 the inner band. */
export function bands(x: number, y: number, z: number, L: Lights): [number, number, number] {
  const out: [number, number, number] = [0, 0, 0];
  const sx = Math.floor((x - y) * 16);
  const sy = Math.floor(((x + y) * 16 - z) / 2);
  const jit = (sx + sy) & 1 ? 0.045 : -0.045;
  for (const b of L.beams) {
    const zz = Math.max(0, z);
    // (the light falls on the floor and on what stands low in it, not on the wall it comes in through)
    if (zz > b.top * 0.6) continue;
    const [ax, ay] = beamAxis(b, zz);
    if (Math.abs(x - ax) > b.rx * 2.6 || Math.abs(y - ay) > b.ry * 2.6) continue;
    const d = Math.hypot((x - ax) / b.rx, (y - ay) / b.ry) + jit;
    let k = d < 0.62 ? 3 : d < 0.9 ? 2 : d < 1.08 ? 1 : 0;
    // (the bars' shadows: lines through the pool in the light's way)
    if (k > 0) {
      const off = b.barsAlongX ? y - ay : x - ax;
      if (b.bars.some((q) => Math.abs(off - q) < 0.035)) k = Math.max(0, k - 2);
    }
    if (k === 0) {
      const d2 = Math.hypot((x - b.x) / (b.rx * 2.2), (y - b.y) / (b.ry * 2.2)) + zz / 140 + jit;
      if (d2 < 1) k = 1;
    }
    if (k > out[0]) out[0] = k;
  }
  for (const l of L.lamps) {
    if (Math.abs(x - l.x) > l.r * 1.1 || Math.abs(y - l.y) > l.r * 1.1) continue;
    const d = Math.hypot(x - l.x, y - l.y, (z - l.z) / 44) / l.r + jit;
    const b = Math.min(l.k, d < 0.34 ? 3 : d < 0.62 ? 2 : d < 1 ? 1 : 0);
    const i = l.kind === 'moon' ? 0 : l.kind === 'warm' ? 1 : 2;
    if (b > out[i]) out[i] = b;
  }
  return out;
}
/** A colour lit where it is: the moon, then the fire's, then the hero's pool; where nothing falls, toward the dark. */
export function lit(P: Pal, c: string, x: number, y: number, z: number, L: Lights, less = 0): string {
  const [m, w, p] = bands(x, y, z, L);
  return litBy(P, c, m - less, w - less, p - less);
}
export function litBy(P: Pal, c: string, m: number, w: number, p: number): string {
  if (m <= 0 && w <= 0 && p <= 0) return mixC(c, P.beyond, P.dim);
  if (m > 0) c = mixC(c, P.moon[m - 1], P.moonK[m - 1]);
  if (w > 0) c = mixC(c, P.warm[w - 1], P.warmK[w - 1]);
  if (p > 0 && w < 2) c = mixC(c, P.pool, p > 1 ? 0.16 : 0.08);
  return c;
}

/** A candle's flame (an honest fire): its foot, its body, its heart. */
export const CANDLE_FIRE = ['#d0501a', '#ffc860', '#fff3b0'] as const;
/** The moon full in a slit (C), a cold glare. */
export const SLIT_GLARE = [BASE.moon[1], BASE.moon[2], mixC(BASE.moon[2], '#ffffff', 0.12)] as const;
/** What gives off its own light: never lit, never faded. */
export const SHINE = new Set<string>([...EMBER, ...CANDLE_FIRE, ...SLIT_GLARE]);

// =================================================================================================
// THE PRISON'S FACE: rough-dressed stone in courses on a plinth of big blocks; look by look: limewashed and flaking (A), dark
// slate (B), cold stone with damp streaks (C); and in its bays THE CELL DOORS (A planks and a grille under a flat lintel; B oak
// studded with iron under a round head; C heavy planks and a hatch), AN OPEN CELL (straw on its floor, a chain on its wall), A
// HIGH BARRED WINDOW on the night (B a window, C a slit), TALLY MARKS (A), THE CONDEMNED'S MARKS (C: strokes, never letters), A
// NICHE behind the altar.

/** The stone of a face at a point, coursed, look by look. */
function ashlar(P: Pal, look: Look, lit0: boolean, s: number, up: number, seed: number): string {
  const down = lit0 ? 0 : 1;
  const B = P.bare;
  // THE PLINTH: big blocks, the bare stone in every look
  if (up < 12) {
    const L = 22 + Math.floor(hash(Math.floor((s + 400) / 22), seed, 1) * 0);
    const lu = mod(s + 400 + (seed % 7) * 5, L);
    if (up === 11) return B[clampK(4 - down)];
    if (up === 10 || lu === 0) return P.seam;
    if (lit0 && lu === 1) return B[clampK(3 - down)];
    return B[clampK((up < 2 ? 1 : 2) - down)];
  }
  const CH = look === 'walk' ? 14 : 12;
  const cv = up - 12;
  const row = Math.floor(cv / CH);
  const lv = mod(cv, CH);
  const off = Math.floor(hash(row, seed, 1) * 40);
  const L = (look === 'walk' ? 30 : 20) + Math.floor(hash(row, seed, 2) * 16);
  const uu = s + off + 400;
  const b = Math.floor(uu / L);
  const lu = mod(uu, L);
  const tone = hash(b, row * 7 + seed, 3);
  if (look === 'whitewash') {
    // limewash over it: the courses show through as faint lines; flaked off in patches to the stone under; grime low down
    const flake = fbm(s / 15, up / 10, seed + 5) > 0.66 + (up < 30 ? -0.04 : 0);
    if (flake) {
      if (lv === CH - 1 || lu === 0) return P.seam;
      let kk = 2 + (tone > 0.85 ? 1 : tone < 0.2 ? -1 : 0);
      if (lv === CH - 2) kk += 1;
      return B[clampK(kk - down)];
    }
    // (the edge of a flake, the wash's thickness catching the light)
    if (fbm(s / 15, (up - 1) / 10, seed + 5) > 0.66) return P.stone[clampK(4 - down)];
    let kk = 2;
    if ((lv === CH - 1 || lu === 0) && hash(b, row, seed + 21) > 0.45) kk = 1;
    else if (tone > 0.82 && fbm(s / 9, up / 9, seed + 23) > 0.5) kk = 3;
    let c = P.stone[clampK(kk - down)];
    // grime up from the floor, in streaks
    const grime = 26 + noise(s / 7, 1, seed) * 14;
    if (up < grime) c = mixC(c, B[1], 0.45 * (1 - up / grime) + 0.18);
    return c;
  }
  if (lv === CH - 1 || lu === 0) return P.seam;
  let kk = 2;
  if (tone < 0.18) kk -= 1;
  else if (tone > 0.88) kk += 1;
  if (lv === CH - 2) kk += 1;
  if (lit0 && lu === 1) kk += 1;
  if (lv === 0 || lu === L - 1) kk -= 1;
  if (hash(b, row, seed + 9) > 0.8 && lv > CH - 5 && lu < 4) kk -= 1;
  let c = P.stone[clampK(kk - down)];
  if (look === 'slits') {
    // damp running down from the slits, darker streaks
    const st = noise(s / 8, 3, seed + 31);
    if (st > 0.7 && up > 14 + noise(s / 5, 1, seed) * 30) c = mixC(c, P.stone[0], 0.26);
  } else if (up < 22) c = mixC(c, P.stone[0], 0.15);
  return c;
}

/** Is a point (du from the way's middle, up) in a round-headed way? */
export function inRound(du: number, up: number, half: number, spring: number, rise: number): boolean {
  if (Math.abs(du) >= half) return false;
  if (up < spring) return true;
  return (du / half) ** 2 + ((up - spring) / rise) ** 2 < 1;
}
/** The ring of voussoirs round a way at a point, if it is on it. */
function ringAt(P: Pal, du: number, up: number, half: number, spring: number, rise: number, ring: number, lit0: boolean, R: R5): string | null {
  const down = lit0 ? 0 : 1;
  if (inRound(du, up, half, spring, rise)) return null;
  if (up < spring) {
    const a = Math.abs(du);
    if (a >= half + ring) return null;
    const e = a - half;
    if (e < 1) return R[clampK((du < 0 ? 4 : 1) - down)];
    if (e > ring - 1.2) return P.seam;
    if (mod(up, 12) === 11) return P.seam;
    return R[clampK(3 - down)];
  }
  if (!inRound(du, up, half + ring, spring, rise + ring)) return null;
  const ang = Math.atan2(up - spring, du * (rise / half));
  const n = 9;
  const idx = Math.floor((ang / Math.PI) * n + 0.5);
  const into = (ang / Math.PI) * n + 0.5 - idx;
  const outer = !inRound(du, up + 1.2, half + ring - 1.2, spring, rise + ring - 1.2);
  if (outer) return P.seam;
  if (into < 0.08) return P.seam;
  const inner = !inRound(du, up - 1.5, half + 1.5, spring, rise + 1.5);
  if (inner && (du < 0 || up > spring + rise * 0.6)) return R[clampK(4 - down)];
  return R[clampK((idx % 2 ? 3 : 2) - down)];
}

/** A tally of five scratched at (i, j) from the tally's foot-left: four strokes and one across. */
function tallyAt(i: number, j: number): boolean {
  if (j < 0 || j > 6) return false;
  if (i >= 0 && i <= 9 && i % 2 === 0 && i < 8) return true;
  // (the fifth, across them)
  return i >= -1 && i <= 8 && Math.abs(j - (i + 1) * 0.66) < 0.6;
}
/** One of the condemned's marks (C): a stroke and its ticks, a box, a fork; never a letter. `kind` 0..4; (i, j) from its foot-left, 5 wide, 7 tall. */
function markAt(kind: number, i: number, j: number): boolean {
  if (i < 0 || i > 4 || j < 0 || j > 6) return false;
  switch (kind) {
    case 0: return i === 2 || (j === 4 && i < 2) || (j === 2 && i > 2);
    case 1: return (i === 0 || i === 4) && j < 6 || j === 0 || (j === 5 && i < 3);
    case 2: return (i === 2 && j < 4) || (j >= 4 && Math.abs(i - 2) === j - 4);
    case 3: return i === 1 || i === 3 || (j === 3 && i > 0 && i < 4);
    default: return (j === 6 - i && i < 5) || (i === 1 && j < 3);
  }
}

/** The face at a point (s along it in picture pixels from the wall's start, up over its foot), its bay and where in it (m from the bay's middle). */
export function cellFace(P: Pal, look: Look, lit0: boolean, s: number, up: number, seed: number, bay: Bay, m: number, half: number): string {
  const W = P.wood;
  const I = P.iron;
  const B = P.bare;
  const down = lit0 ? 0 : 1;
  const am = Math.abs(m);
  // A CELL DOOR, shut: its frame, its leaf of planks, its straps, its grille and lock; or AN OPEN CELL
  if ((bay === 'door' || bay === 'open') && am < 21 && up < 66) {
    const roundHead = look !== 'whitewash';
    const head = roundHead ? 44 : 52;
    const inWay = (h: number, w: number): boolean => (roundHead ? inRound(m, up, w, head, 12 + (w - 15)) : Math.abs(m) < w && up < head + (w - 15));
    const leaf = inWay(15, 15);
    const frame = !leaf && inWay(20, 20);
    if (frame) {
      // the frame: dressed jambs and a lintel (A) or a ring of voussoirs (B, C), the bare stone
      if (roundHead) {
        const rc = ringAt(P, m, up, 15, head, 12, 5, lit0, B);
        if (rc) return rc;
      }
      if (up >= head) {
        // the lintel, its joints, lit along its top
        if (up === head + 5) return B[clampK(4 - down)];
        if (up === head || Math.abs(m) === 6) return P.seam;
        return B[clampK(3 - down)];
      }
      if (am >= 19) return P.seam;
      if (mod(up, 12) === 11) return P.seam;
      return B[clampK((m < 0 ? 4 : 2) - down - (am > 17 ? 1 : 0))];
    }
    if (leaf && bay === 'open') {
      // the cell, open: its leaf swung in against the left jamb (its edge), the dark in it, straw on its floor, a chain on its back wall
      if (m < -11) return mod(up, 7) === 0 ? P.seam : W[clampK((m < -13 ? 1 : 2) - down)];
      if (up < 5 + Math.floor(hash(Math.floor(m), 3, seed) * 3)) return P.straw[clampK((hash(Math.floor(m / 2), up, seed) > 0.5 ? 2 : 1) - down)];
      if (up < 7 && hash(Math.floor(m), up, seed + 1) > 0.6) return P.straw[clampK(1 - down)];
      // a chain hung from a ring, slack, on the cell's back wall
      const cz = 30 - Math.abs(m - 3) * 0.6;
      if (m > -8 && m < 13 && Math.abs(up - (cz + 6 * ((m - 2) / 10) ** 2)) < 0.8 && mod(m, 3) < 2) return I[clampK(2 - down)];
      if (Math.hypot(m + 7, up - 33) < 1.8) return I[clampK(3 - down)];
      return mixC(P.seam, P.beyond, 0.5 + (up / 80) * 0.3);
    }
    if (leaf) {
      // THE LEAF: planks every six, a shade at the head (under the lintel)
      const pl = Math.floor((m + 15) / 6);
      const pu = mod(m + 15, 6);
      // the grille: a little window, its frame of iron, its bars, the dark behind (A, B); C: a hatch, shut
      if (look !== 'slits' && am <= 6 && up >= 30 && up < 40) {
        if (am === 6 || up === 30 || up === 39) return am === 6 && m < 0 || up === 39 ? I[clampK(4 - down)] : I[1];
        if (m === -2 || m === 2) return I[clampK(3 - down)];
        return mixC(P.seam, P.beyond, 0.6);
      }
      if (look === 'slits' && am <= 7 && up >= 32 && up < 40) {
        if (am === 7 || up === 32 || up === 39) return up === 39 ? W[clampK(4 - down)] : P.seam;
        return W[clampK(3 - down)];
      }
      // the straps of iron across it, from the hinges on the left, ending round
      for (const sz of [10, 44]) {
        if (up >= sz && up < sz + 3 && m < 11 - (up === sz + 1 ? 0 : 0.5) && (m < 9 || Math.hypot(m - 9, up - sz - 1) < 2)) {
          if (look === 'walk' && mod(m + 15, 5) === 2 && up === sz + 1) return I[clampK(4 - down)];
          return up === sz + 2 ? I[clampK(3 - down)] : I[clampK(1 + (up === sz + 1 ? 1 : 0) - down)];
        }
      }
      // the lock plate and its ring
      if (m >= 7 && m <= 12 && up >= 20 && up < 28) {
        if (m === 9 && (up === 23 || up === 24)) return P.seam;
        return m === 7 || up === 27 ? I[clampK(4 - down)] : I[2];
      }
      if (Math.hypot(m - 10, up - 17) < 2.6 && Math.hypot(m - 10, up - 17) > 1.4) return up > 17 ? I[clampK(3 - down)] : I[1];
      // B: studs in rows
      if (look === 'walk' && (pu === 3 || pu === 4) && mod(up, 7) === 4) return pu === 3 ? I[clampK(4 - down)] : I[clampK(3 - down)];
      if (look === 'walk' && (pu === 3 || pu === 4) && mod(up, 7) === 3) return I[1];
      if (pu === 0) return P.seam;
      let kk = (pu === 1 ? 3 : 2) + (hash(pl, seed, 5) > 0.7 ? -1 : 0);
      if (up > head - 3) kk -= 1;
      // (worn at its foot, scuffed)
      if (up < 6 && hash(Math.floor(m), up, seed + 7) > 0.6) kk -= 1;
      return W[clampK(kk - down)];
    }
  }
  // A HIGH WINDOW ON THE NIGHT: B a barred window, C a slit; its reveal, its sill, the sky in it with a star
  if (bay === 'window') {
    const hw = look === 'walk' ? 9 : 4;
    const y0 = look === 'walk' ? 48 : 46;
    const y1 = 72;
    const inOpen = am < hw && up >= y0 && up < y1 - (look === 'walk' ? Math.max(0, am - 5) * 0.8 : 0);
    const inRev = am < hw + 3 && up >= y0 - 3 && up < y1 + 3 && !inOpen;
    if (inOpen) {
      // the bars
      const bars = look === 'walk' ? [-4, 0, 4] : [0];
      if (bars.includes(Math.round(m))) return I[clampK(3 - down)];
      if (look === 'walk' && up === 60) return I[clampK(2 - down)];
      // the reveal's far side, in shade, at the opening's right
      if (m > hw - 2) return B[clampK(1 - down)];
      if (up < y0 + 2) return B[clampK(3 - down)];
      const sky = P.sky[clampK(Math.floor(((up - y0) / (y1 - y0)) * -4 + 4.5))];
      // (C: the moon full in the slit, a cold glare)
      if (look === 'slits') return up > 62 ? SLIT_GLARE[0] : up > 52 && up < 60 ? SLIT_GLARE[2] : SLIT_GLARE[1];
      if (hash(Math.floor(m) + 40, up, seed + 3) > 0.94) return '#9aa4c8';
      return sky;
    }
    if (inRev) {
      if (up < y0) return up === y0 - 1 ? B[clampK(4 - down)] : B[clampK(2 - down)];
      if (am >= hw + 2) return P.seam;
      return B[clampK((m < 0 ? 3 : 1) - down)];
    }
  }
  // A NICHE behind the altar: a shallow round-headed recess, a shelf; its back in shade
  if (bay === 'niche' && am < 17 && up >= 14 && up < 66) {
    const ni = inRound(m, up - 14, 12, 34, 12);
    const ri = inRound(m, up - 14, 16, 34, 16);
    if (ri && !ni) {
      const rc = ringAt(P, m, up - 14, 12, 34, 12, 4, lit0, B);
      if (rc) return rc;
    }
    if (ni) {
      if (up === 14 || up === 15) return B[clampK(4 - down)];
      if (up === 32 || up === 33) return up === 33 ? B[clampK(4 - down)] : P.seam;
      return mixC(B[clampK(1 - down)], P.seam, up > 44 ? 0.4 : 0.2);
    }
  }
  // TALLY MARKS (A): rows of fives scratched in the wash, by the doors and in their own bays
  if (look === 'whitewash' && (bay === 'tally' || bay === 'door' || bay === 'open')) {
    const near = bay === 'tally' ? am < half - 4 : am >= 22 && am < half - 2;
    if (near && up >= 18 && up < 50) {
      const row = Math.floor((up - 18) / 10);
      const j = (up - 18) % 10;
      const g = Math.floor((m + 40) / 13);
      const i = mod(m + 40, 13) - 1;
      const n = Math.floor(hash(row, Math.floor(s / 64), seed + 13) * 5);
      if (hash(g, row, seed + 11) < 0.68 && (bay === 'tally' || g % 3 !== 1 || n > 1) && j <= 6 && tallyAt(i, j)) return B[clampK(0 + (hash(g, row, seed + 12) > 0.6 ? 1 : 0) - down)];
    }
  }
  // THE CONDEMNED'S MARKS (C): strokes cut in rows round the doors and in their own bays, each his own (never letters)
  if (look === 'slits' && (bay === 'marks' || bay === 'door')) {
    const near = bay === 'marks' ? am < half - 3 : am >= 22 && am < half - 2;
    if (near && up >= 16 && up < 60) {
      const row = Math.floor((up - 16) / 11);
      const j = (up - 16) % 11;
      const g = Math.floor((m + 50) / 8);
      const i = mod(m + 50, 8) - 1;
      const h = hash(g, row, seed + 17);
      const mk = Math.floor(hash(g, row, seed + 19) * 5);
      if (h < 0.62 && markAt(mk, i, j)) return P.seam;
      if (h < 0.62 && markAt(mk, i - 1, j + 1)) return P.stone[clampK(4 - down)];
    }
  }
  // (soot over a torch)
  const c = ashlar(P, look, lit0, s, up, seed);
  if (bay === 'torch' && am < 10 && up > 64) return mixC(c, P.seam, 0.35 * (1 - am / 10));
  return c;
}

/** The top of a wall fading into the dark: the game's four steps. */
export function faded(P: Pal, c: string, z: number, top: number): string {
  const FADE = 24;
  const fromTop = top - 1 - z;
  if (fromTop < FADE) return mixC(c, P.beyond, [0.9, 0.66, 0.42, 0.2][Math.max(0, Math.floor((fromTop * 4) / FADE))]);
  return c;
}

// =================================================================================================
// THE WAYS: a round-headed way between two rooms (the holding cells' way in); THE STAIR DOWN FROM FLOOR 1 behind the game's
// gate's arch (art/gates.ts ARCH: 40 to its spring, 42 its rise), standing whole over the walls' fading top.

export const OPEN = { half: 46, spring: 40, rise: 28, ring: 8 };
export const STAIR_ARCH = { half: 48, spring: 40, rise: 42, ring: 10 };

/** The bay of a wall at a point along it (tiles), and where in it (picture pixels from its middle). */
export function bayAt(w: WallRun, look: Look, alongT: number): { bay: Bay; m: number; half: number; k: number } {
  const k = Math.floor((alongT - w.b0) / w.bw);
  const list = w.bays[look];
  const bay = k >= 0 && k < list.length ? list[k] : 'plain';
  const mid = w.b0 + (k + 0.5) * w.bw;
  return { bay, m: (alongT - mid) * ISO_X, half: (w.bw * ISO_X) / 2, k };
}

export function paintWalls(D: Deep, look: Look, L: Lights): void {
  const P = PALS[look];
  const iso = new Iso(D, VIEW.OX, VIEW.OY);
  for (const w of WALLS) {
    const cuts: [number, number][] = [];
    let a = w.a;
    for (const [o0, o1] of [...w.arches].sort((p, q) => p[0] - q[0])) {
      if (o0 > a) cuts.push([a, o0]);
      a = o1;
    }
    if (w.b > a) cuts.push([a, w.b]);
    const face = (alongT: number, up: number): string | null => {
      const [x, y] = w.alongX ? [alongT, w.at + 0.05] : [w.at + 0.05, alongT];
      const s = Math.floor((alongT - w.a) * ISO_X + 1e-6);
      for (const o of w.arches) {
        const du = (alongT - (o[0] + o[1]) / 2) * ISO_X;
        if (Math.abs(du) > OPEN.half + OPEN.ring + 2) continue;
        if (inRound(du, up, OPEN.half, OPEN.spring, OPEN.rise)) return null;
        const rc = ringAt(P, du, up, OPEN.half, OPEN.spring, OPEN.rise, OPEN.ring, w.alongX, P.bare);
        if (rc) return faded(P, lit(P, rc, x, y, up, L), up, WALL);
      }
      if (w.stairs) {
        const du = (alongT - (w.stairs[0] + w.stairs[1]) / 2) * ISO_X;
        const A = STAIR_ARCH;
        if (Math.abs(du) < A.half + A.ring + 2) {
          if (inRound(du, up, A.half, A.spring, A.rise)) return null;
          const rc = ringAt(P, du, up, A.half, A.spring, A.rise, A.ring, w.alongX, P.bare);
          if (rc) return lit(P, rc, x, y, up, L);
        }
      }
      if (up >= WALL) return null;
      const bb = bayAt(w, look, alongT);
      const c = cellFace(P, look, w.alongX, s, up, w.seed, bb.bay, bb.m, bb.half);
      if (SHINE.has(c)) return c;
      return faded(P, lit(P, c, x, y, up, L), up, WALL);
    };
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
            return face(alongT, WALL - 1 - v);
          },
          right: (u, v) => {
            const yy = y - (u + 0.5) / ISO_X;
            const up = WALL - 1 - v;
            D.depth = s1 + yy;
            const sy = Math.floor((y - yy) * ISO_X) + (Math.floor(up / 12) % 2) * 14;
            const c = up < 12 ? P.bare[up === 11 ? 3 : 1] : mod(up, 12) === 11 || mod(sy, 22) === 0 ? P.seam : P.bare[1];
            return faded(P, lit(P, c, s1 + 0.05, yy, up, L, 1), up, WALL);
          },
        });
      } else {
        const x = w.at;
        iso.box(x - 1, s0, x, s1, 0, WALL, {
          top: (u, v) => {
            D.depth = x - 1 + u + s0 + v * (s1 - s0);
            return P.beyond;
          },
          left: (u, v) => {
            const xx = x - 1 + (u + 0.5) / ISO_X;
            const up = WALL - 1 - v;
            D.depth = xx + s1;
            // (the wall's end, its thickness: the bare stone in courses)
            const sx = Math.floor((xx - (x - 1)) * ISO_X) + (Math.floor(up / 12) % 2) * 14;
            const c = up < 12 ? P.bare[up === 11 ? 4 : 2] : mod(up, 12) === 11 || mod(sx, 22) === 0 ? P.seam : P.bare[3];
            return faded(P, lit(P, c, xx, s1 + 0.05, up, L), up, WALL);
          },
          right: (u, v) => {
            const alongT = s1 - (u + 0.5) / ISO_X;
            D.depth = x + alongT;
            return face(alongT, WALL - 1 - v);
          },
        });
        if (w.stairs && s0 < w.stairs[1] && s1 > w.stairs[0]) {
          const A = STAIR_ARCH;
          const tall = A.spring + A.rise + A.ring + 2;
          iso.right(x, s0, s1, WALL, tall, (u, v) => {
            const alongT = s1 - (u + 0.5) / ISO_X;
            D.depth = x + alongT + 0.01;
            const up = tall - 1 - v;
            const du = (alongT - (w.stairs![0] + w.stairs![1]) / 2) * ISO_X;
            const rc = ringAt(P, du, up, A.half, A.spring, A.rise, A.ring, false, P.bare);
            return rc ? lit(P, rc, x + 0.05, alongT, up, L) : null;
          });
        }
      }
    };
    for (const [s0, s1] of cuts) run(s0, s1);
    for (const ar of w.arches) run(ar[0], ar[1]);
  }
}

/** A WALL TOWARD THE EYE, cut low as the game leaves it: a coping of the bare stone (or, for the yard's, its own night stone). */
export function lowWall(D: Deep, look: Look, L: Lights, r: Rect, seed: number, own?: R5): void {
  const P = PALS[look];
  const S = own ?? P.bare;
  const iso = new Iso(D, VIEW.OX, VIEW.OY);
  const long = r.x1 - r.x0 > r.y1 - r.y0;
  const tone = (c: string, x: number, y: number, z: number): string => (own ? c : lit(P, c, x, y, z, L));
  iso.box(r.x0, r.y0, r.x1, r.y1, 0, LOW, {
    top: (u, v) => {
      const x = r.x0 + u * (r.x1 - r.x0);
      const y = r.y0 + v * (r.y1 - r.y0);
      D.depth = x + y + 0.5;
      const a = long ? x : y;
      const across = long ? (y - r.y0) / (r.y1 - r.y0) : (x - r.x0) / (r.x1 - r.x0);
      // (blocks of the coping, each its own length, two across)
      const half = across < 0.5 ? 0 : 1;
      const L = 0.42 + hash(half, seed, 7) * 0.2;
      const fa = mod(a / L + hash(seed, half, 3), 1);
      const blk = Math.floor(a / L + hash(seed, half, 3));
      let c = fa < 0.06 * (1 / L) * 0.42 || across < 0.08 || Math.abs(across - 0.5) < 0.04 ? P.seam : hash(blk, seed + half, 5) > 0.7 ? S[2] : S[3];
      if (c !== P.seam && (fa < 0.14 || (long ? across > 0.88 : across < 0.16))) c = S[4];
      return tone(c, x, y, LOW);
    },
    left: (u, v) => {
      const x = r.x0 + (u + 0.5) / ISO_X;
      D.depth = x + r.y1 + 0.5;
      const c = v < 1 ? S[4] : v > LOW - 4 ? S[1] : S[v % 8 === 7 ? 0 : 2];
      return tone(c, x, r.y1, LOW - v);
    },
    right: (u, v) => {
      const y = r.y1 - (u + 0.5) / ISO_X;
      D.depth = r.x1 + y + 0.5;
      const c = v < 1 ? S[3] : v > LOW - 4 ? S[0] : S[v % 8 === 7 ? 0 : 1];
      return tone(c, r.x1, y, LOW - v);
    },
  });
}

// =================================================================================================
// THE FLOOR: worn flags in a running bond (a tile long, half a tile wide), cracked, some chipped; worn smooth down the middle of
// the walk; A GUTTER down the walk's middle to the yard and along the foot of the cells' wall; STRAW in drifts before the cells
// and in the corners (A most, C least)

/** The gutters: along x (y fixed) or along y (x fixed), from, to. */
export const GUTTERS: readonly { alongX: boolean; at: number; a: number; b: number }[] = [
  { alongX: false, at: 13.5, a: 1.0, b: 11.2 },
  { alongX: true, at: -5.55, a: -0.9, b: 6.9 },
];
/** Drifts of straw: middle, radii (tiles), how much in each look. */
export const STRAW: readonly [number, number, number, number][] = [
  [0.4, -5.2, 1.2, 0.5], [4.2, -5.1, 1.0, 0.55], [6.4, -4.4, 0.6, 0.9], [2.3, -1.2, 0.7, 0.4], [-7.2, -4.4, 0.6, 0.5],
  [-4.3, 0.3, 0.7, 0.45], [16.3, -5.4, 0.5, 0.6], [12.4, 8.6, 0.3, 0.8], [8.6, -4.6, 0.5, 0.35],
];
const STRAW_ON: Record<Look, number> = { whitewash: 1, walk: 0.62, slits: 0.4 };

function flagT(x: number, y: number, seed: number): number {
  // (rows along x, half a tile wide; in each row its own length of flag, its joints offset)
  const rowY = Math.floor(y * 2);
  const fv = y * 2 - rowY;
  const Lr = [0.5, 0.75, 0.62, 0.88][Math.floor(hash(rowY, 0, seed + 1) * 4)];
  const xo = x / Lr + hash(rowY, 0, seed) * 3;
  const col = Math.floor(xo);
  const fu = xo - col;
  const eu = fu * Lr;
  const eu1 = (1 - fu) * Lr;
  if (fv < 0.07 || eu < 0.022) return -1;
  // (the edges toward the light lit, the others in shade)
  if (fv > 0.88 || eu < 0.055) return fv > 0.88 && eu1 < 0.04 ? 2 : 3;
  if (fv < 0.15 || eu1 < 0.04) return 1;
  const tone = hash(col, rowY, seed);
  let k = tone < 0.22 ? 1 : tone > 0.86 ? 3 : 2;
  const n = fbm(x * 5, y * 5, seed + 2);
  if (n > 0.68) k += 1;
  if (n < 0.28) k -= 1;
  // a crack across a few
  if (hash(col, rowY, seed + 4) > 0.9 && Math.abs(fv - 0.5 - (fu - 0.5) * (fu < 0.55 ? 0.6 : -0.3)) < 0.05) return -1;
  // a corner chipped away
  if (hash(col, rowY, seed + 6) > 0.88 && fu > 0.8 && fv > 0.55) return 0;
  return clampK(k);
}

export function paintFloors(D: Deep, look: Look, L: Lights): void {
  const P = PALS[look];
  const iso = new Iso(D, VIEW.OX, VIEW.OY);
  const all: [Rect, number][] = [[S_HALL, 701], [CELLS, 703], [CHAPEL, 705], ...PASSES.map((p, i): [Rect, number] => [p, 715 + i])];
  D.floor = true;
  for (const [r, seed] of all) {
    const isRoom = ROOMS.includes(r);
    iso.top(r.x0, r.y0, r.x1, r.y1, 0, (u, v) => {
      const x = r.x0 + u * (r.x1 - r.x0);
      const y = r.y0 + v * (r.y1 - r.y0);
      D.depth = x + y - FLOOR_BACK;
      const F = P.flags;
      const f = flagT(x, y, 611);
      let c = f < 0 ? P.seam : F[f];
      // worn smooth and paler down the walk and the way to it
      const worn = (inRect(x, y, WALK) && Math.abs(x - 13.5) < 0.9) || (inRect(x, y, CHAPEL) && Math.abs(x - 13.5) < 0.7 && y > -4);
      if (worn && f >= 0 && fbm(x * 2, y * 2, 617) > 0.42) c = F[clampK(f + 1)];
      // THE GUTTERS: a channel, its rims, its wet bed
      for (const g of GUTTERS) {
        const along = g.alongX ? x : y;
        const across = g.alongX ? y - g.at : x - g.at;
        if (along < g.a || along > g.b) continue;
        const a = Math.abs(across);
        if (a < 0.075) {
          c = a < 0.04 ? (hash(Math.floor(along * 16), 0, 621) > 0.8 ? P.flags[2] : P.seam) : P.flags[1];
          if (a < 0.03 && fbm(along * 3, 0, 623) > 0.55) c = mixC(P.seam, P.moon[1], 0.18);
        } else if (a < 0.12) c = across < 0 ? F[4] : F[1];
      }
      // STRAW in drifts: strands, lit along their tops
      const sk = STRAW_ON[look];
      for (const [sx, sy, rx, ry] of STRAW) {
        const q = Math.hypot((x - sx) / rx, (y - sy) / ry) + (fbm(x * 4, y * 4, 627) - 0.5) * 0.7;
        if (q < sk) {
          const st = hash(Math.floor((x + y * 0.4) * 22), Math.floor((y - x * 0.3) * 9), 629);
          c = P.straw[st > 0.7 ? 4 : st > 0.4 ? 3 : st > 0.15 ? 2 : 1];
          if (q > sk - 0.12 && st < 0.5) c = F[clampK(f)];
        }
      }
      // the floor at a far wall's foot, in its shade
      const nf = Math.min(x - r.x0, y - r.y0);
      if (isRoom && nf < 0.14) c = mixC(c, P.beyond, 0.35);
      return lit(P, c, x, y, 0, L);
    });
  }
  D.floor = false;
}

/** Straws and grit kicked about; little stones off the walls. Over the floor, under what stands. */
export function paintChips(D: Deep, look: Look, L: Lights): void {
  const P = PALS[look];
  let n = 0;
  for (const r of [...ROOMS, WALK]) {
    const count = Math.round((r.x1 - r.x0) * (r.y1 - r.y0) * (look === 'whitewash' ? 2.4 : look === 'walk' ? 1.4 : 1));
    for (let i = 0; i < count; i++) {
      const x = r.x0 + 0.2 + hash(i, n, 801) * (r.x1 - r.x0 - 0.4);
      const y = r.y0 + 0.2 + hash(i, n, 803) * (r.y1 - r.y0 - 0.4);
      n++;
      const [X0, Y0] = atPx(x, y);
      const X = Math.round(X0);
      const Y = Math.round(Y0);
      if (!D.isFloor(X, Y) || !D.isFloor(X + 3, Y + 1)) continue;
      const straw = hash(i, n, 805) < 0.7;
      if (straw) {
        // a straw: three pixels, lit along it
        const dir = hash(i, n, 806) < 0.5 ? 1 : -1;
        D.over(X, Y, lit(P, P.straw[3], x, y, 1, L)).over(X + 1, Y + (dir > 0 ? 0 : 0), lit(P, P.straw[2], x, y, 1, L)).over(X + 2, Y + dir * 1, lit(P, P.straw[2], x, y, 1, L));
        D.over(X + 3, Y + dir * 1, lit(P, P.straw[1], x, y, 1, L));
      } else {
        const w = 2;
        for (let q = 0; q < w; q++) {
          D.over(X + q, Y - 1, lit(P, q === 0 ? P.bare[4] : P.bare[3], x, y, 2, L));
          D.over(X + q, Y, lit(P, P.bare[1], x, y, 1, L));
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
  const { OX, OY } = VIEW;
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
// THE STAIR DOWN FROM FLOOR 1, in the gaoler's room's left wall: a flight of the bare stone going up away from the room (toward
// -x) between walls of it, under a vault, to the Warden's hall above: its light (his tomb's green-gold day) faint at the top.

export const FLIGHT = { run: 0.26, rise: 7, steps: 13, inset: 0.3 };
/** The light at the stair's head: floor 1's, from the Warden's hall (its daylight, green-gold, faint). */
export const ABOVE = '#b8be7a';
export function paintStairs(D: Deep, look: Look, L: Lights): void {
  const P = PALS[look];
  const S = P.bare;
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
  const upK = (x: number): number => Math.max(0, Math.min(1, (x0 - x) / (x0 - end + 0.4)));
  march(D, {
    box: { x0: end - 0.8, y0: ym - half - 0.2, z0: 0, x1: x0 - 0.02, y1: ym + half + 0.2, z1: 260 },
    inside: (x, y, z) => !air(x, y, z),
    shade: (x, y, z) => {
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
      if (x < end - 0.55) c = mixC(ABOVE, P.beyond, 0.35);
      else if (onTread) {
        const into = mod(x0 - FLIGHT.inset - x, FLIGHT.run) / FLIGHT.run;
        c = into < 0.18 ? S[4] : into > 0.84 ? S[2] : S[3];
        if (Math.abs(mod((y - ym) * ISO_X + 60, 22) - 11) > 10.3) c = S[1];
        // worn hollow in the middle of each tread
        if (into > 0.3 && into < 0.7 && Math.abs(y - ym) < half * 0.35) c = S[2];
      } else if (onRiser) c = z > st - 1.2 ? S[2] : S[1];
      else if (Math.abs(y - ym) >= half - 0.02) {
        const course = Math.floor(z / 12);
        const along = (x0 - x) * 32 + (course % 2) * 14;
        c = mod(z, 12) < 1 || mod(along, 28) < 1 ? P.seam : mixC(y > ym ? S[1] : S[2], P.beyond, 0.25);
      } else c = mixC(S[1], P.beyond, 0.3);
      // (dark down the flight; floor 1's light faint at its head)
      const upL = k < 0.55 ? 0 : k < 0.75 ? 0.12 : k < 0.9 ? 0.24 : 0.36;
      if (upL > 0) c = mixC(c, ABOVE, upL * (onTread ? 1.1 : 0.8));
      else c = mixC(c, P.beyond, 0.25 * (1 - k));
      return lit(P, c, Math.max(x, x0 - 0.3), y, Math.min(z, 30), L);
    },
  }, 0.012);
}

// =================================================================================================
// THE CHAPEL OF LAST RITES: A PLAIN ALTAR of the bare stone on a step against its back wall, a cloth over it (A, C), its candles
// (A three, B one, C one beside the book); TWO BENCHES before it, an aisle between, plain timber; C: THE CHAPLAIN'S LECTERN.

export const ALTAR = { x0: 12.8, x1: 14.2, y0: -5.95, y1: -5.42, top: 26 };
export const STEP = { x0: 12.45, x1: 14.55, y0: -6, y1: -4.95, z: 5 };
export const BENCHES: readonly { x0: number; x1: number; y: number }[] = [
  { x0: 10.9, x1: 12.95, y: -3.7 }, { x0: 14.05, x1: 16.1, y: -3.7 }, { x0: 10.9, x1: 12.95, y: -2.4 }, { x0: 14.05, x1: 16.1, y: -2.4 },
];
export const LECTERN = { x: 15.4, y: -4.85 };
/** The altar's candles, look by look: where on its top (x), how tall. */
export const ALTAR_CANDLES: Record<Look, readonly [number, number][]> = {
  whitewash: [[13.05, 12], [13.5, 16], [13.95, 10]],
  walk: [[13.5, 14]],
  slits: [[13.2, 11]],
};

export function paintAltar(D: Deep, look: Look, L: Lights): void {
  const P = PALS[look];
  const S = P.bare;
  const C = P.cloth;
  const A = ALTAR;
  const cloth = look !== 'walk';
  const mat = (x: number, y: number, z: number): 'step' | 'body' | 'top' | 'cloth' | null => {
    if (z < 0) return null;
    if (z < STEP.z) return x >= STEP.x0 && x < STEP.x1 && y >= STEP.y0 && y < STEP.y1 ? 'step' : null;
    if (cloth && z >= A.top - 14 && z < A.top + 1 && y >= A.y1 - 0.02 && y < A.y1 + 0.03 && x > 13.05 && x < 13.95) return 'cloth';
    if (z < A.top - 4) return x >= A.x0 + 0.04 && x < A.x1 - 0.04 && y >= A.y0 && y < A.y1 - 0.03 ? 'body' : null;
    if (z < A.top) return x >= A.x0 - 0.03 && x < A.x1 + 0.03 && y >= A.y0 && y < A.y1 + 0.02 ? (cloth && x > 13.05 && x < 13.95 && z > A.top - 2 ? 'cloth' : 'top') : null;
    return null;
  };
  march(D, {
    box: { x0: STEP.x0 - 0.05, y0: STEP.y0, z0: 0, x1: STEP.x1 + 0.05, y1: STEP.y1 + 0.05, z1: A.top + 2 },
    inside: (x, y, z) => mat(x, y, z) !== null,
    shade: (x, y, z, face) => {
      const m = mat(x, y, z)!;
      let k = face === 'z' ? 4 : face === 'y' ? 3 : face === 'x' ? 1 : 2;
      if (m === 'cloth') {
        // linen hung over the front, its folds, a hem
        const f = mod((x - 13.05) * 32, 7);
        let kk = face === 'z' ? 4 : f < 2 ? 3 : f < 5 ? 2 : 1;
        if (z < A.top - 12) kk -= 1;
        return lit(P, C[clampK(kk)], x, y, z, L);
      }
      let col = S[clampK(k)];
      if (m === 'body' && face === 'y') {
        // a plain panel sunk in its front, its rim lit along its top and left
        const u = (x - A.x0) * 32;
        const e = Math.min(u - 4, A.x1 * 32 - A.x0 * 32 - 4 - u, z - STEP.z - 3, A.top - 7 - z);
        if (e >= 0 && e < 1) col = S[clampK(u < 10 || z > A.top - 9 ? 4 : 1)];
        else if (e >= 1) col = S[2];
      }
      if (m === 'top' && face !== 'z') col = S[clampK(k + 1)];
      if (m === 'step') col = S[clampK(face === 'z' ? 3 : face === 'y' ? 2 : 1)];
      return lit(P, col, x, y, z, L);
    },
  }, 0.01);
  // THE CANDLES on it: a stick of wax, its drips, the flame (an honest fire)
  for (const [cx, h] of ALTAR_CANDLES[look]) candle(D, look, L, cx, (A.y0 + A.y1) / 2 + 0.05, A.top, h);
}

/** A candle standing at (x, y) on a surface `z` high, `h` tall: its wax lit on its left, its flame. */
export function candle(D: Deep, look: Look, L: Lights, x: number, y: number, z: number, h: number): void {
  const P = PALS[look];
  const [X0, Y0] = atPx(x, y, z);
  const X = Math.round(X0);
  const Y = Math.round(Y0);
  D.depth = x + y + 0.3;
  const Wx = P.wax;
  for (let j = 0; j < h; j++) {
    D.set(X - 1, Y - j, lit(P, Wx[j > h - 2 ? 4 : 3], x, y, z + j, L));
    D.set(X, Y - j, lit(P, Wx[2], x, y, z + j, L));
    D.set(X + 1, Y - j, lit(P, Wx[1], x, y, z + j, L));
  }
  // (a drip down its side, a pool of wax at its foot)
  D.set(X - 2, Y, lit(P, Wx[3], x, y, z, L)).set(X + 2, Y, lit(P, Wx[1], x, y, z, L)).set(X - 1, Y - h + 3, lit(P, Wx[4], x, y, z, L));
  // the wick and the flame
  D.set(X, Y - h, P.seam);
  const F = CANDLE_FIRE;
  D.set(X, Y - h - 1, F[0]).set(X, Y - h - 2, F[1]).set(X, Y - h - 3, F[2]).set(X, Y - h - 4, F[1]).set(X, Y - h - 5, F[0]);
  D.set(X - 1, Y - h - 2, F[0]).set(X + 1, Y - h - 2, F[0]).set(X - 1, Y - h - 3, F[1]).set(X + 1, Y - h - 3, F[0]);
}

export function paintBenches(D: Deep, look: Look, L: Lights): void {
  const P = PALS[look];
  const Wd = P.wood;
  for (const bn of BENCHES) {
    const d = 0.28;
    const mat = (x: number, y: number, z: number): 'seat' | 'leg' | 'rail' | null => {
      if (x < bn.x0 || x >= bn.x1 || y < bn.y - d / 2 || y >= bn.y + d / 2) return null;
      if (z >= 12 && z < 15) return 'seat';
      const end = x < bn.x0 + 0.1 || x >= bn.x1 - 0.1;
      if (z >= 0 && z < 12 && end && Math.abs(y - bn.y) < d / 2 - 0.03) return 'leg';
      if (z >= 3 && z < 5 && Math.abs(y - bn.y) < 0.04) return 'rail';
      return null;
    };
    march(D, {
      box: { x0: bn.x0, y0: bn.y - d / 2, z0: 0, x1: bn.x1, y1: bn.y + d / 2, z1: 16 },
      inside: (x, y, z) => mat(x, y, z) !== null,
      shade: (x, y, z, face) => {
        const m = mat(x, y, z)!;
        let k = face === 'z' ? 3 : face === 'y' ? 2 : 1;
        if (m === 'seat' && face === 'z') {
          // the seat's planks along it, worn pale along its front edge
          const pl = mod((y - bn.y + d / 2) * 32, 3.2);
          k = pl < 0.6 ? 1 : y > bn.y + d / 2 - 0.05 ? 4 : 3;
        }
        if (m === 'seat' && face === 'y' && z > 14) k = 3;
        return lit(P, Wd[clampK(k)], x, y, z, L);
      },
    }, 0.01);
  }
}

/** C: THE CHAPLAIN'S LECTERN: a foot, a post, a slanted rest with a book open on it. */
export function paintLectern(D: Deep, look: Look, L: Lights): void {
  if (look !== 'slits') return;
  const P = PALS[look];
  const Wd = P.wood;
  const { x: cx, y: cy } = LECTERN;
  // (the rest slopes down toward the eye, toward +y)
  const restZ = (y: number): number => 40 + (cy - y) * 22;
  const mat = (x: number, y: number, z: number): 'foot' | 'post' | 'rest' | 'book' | null => {
    const dx = x - cx;
    const dy = y - cy;
    if (z < 0) return null;
    if (z < 4) return Math.abs(dx) < 0.2 && Math.abs(dy) < 0.16 ? 'foot' : null;
    if (z < 34) return Math.abs(dx) < 0.045 && Math.abs(dy) < 0.045 ? 'post' : null;
    if (Math.abs(dx) < 0.24 && Math.abs(dy) < 0.17) {
      const rz = restZ(y);
      if (z < rz && z > rz - 3) return 'rest';
      if (Math.abs(dx) < 0.2 && Math.abs(dy) < 0.13 && z >= rz && z < rz + 2.5 - Math.abs(dx) * 4) return 'book';
    }
    return null;
  };
  march(D, {
    box: { x0: cx - 0.26, y0: cy - 0.2, z0: 0, x1: cx + 0.26, y1: cy + 0.2, z1: 52 },
    inside: (x, y, z) => mat(x, y, z) !== null,
    shade: (x, y, z, face) => {
      const m = mat(x, y, z)!;
      if (m === 'book') {
        // two pages, their spine down the middle, lines of writing as faint grey rules (no letters)
        const dx = x - cx;
        if (Math.abs(dx) < 0.012) return lit(P, P.bone[1], x, y, z, L);
        const rule = mod((y - cy) * 64, 2.2) < 0.7 && Math.abs(dx) > 0.03 && Math.abs(dx) < 0.17;
        return lit(P, rule ? P.bone[2] : P.bone[dx < 0 ? 4 : 3], x, y, z, L);
      }
      const k = face === 'z' ? 3 : face === 'y' ? 2 : face === 'x' ? 1 : 2;
      return lit(P, Wd[clampK(k + (m === 'rest' ? 1 : 0))], x, y, z, L);
    },
  }, 0.008);
  candle(D, look, L, cx + 0.36, cy - 0.04, 0, 22);
}

// =================================================================================================
// THE MOON, look by look: through the barred window at the walk's end (B), through the slits in the cells' and the chapel's
// back walls (C); and in every look a little in at the gate from the yard.

/** The slits' and windows' shafts: each from its opening in the wall down onto the floor. */
export const BEAMS: Record<Look, Beam[]> = {
  whitewash: [],
  walk: [
    // (the window in the walk's wall, along y at x 12: the light in toward +x)
    { x: 13.9, y: 6.0, rx: 0.55, ry: 0.46, lean: [0.03, 0.0], top: 62, bars: [-0.13, 0, 0.13], barsAlongX: true },
  ],
  slits: [
    // (the slits in the cells' back wall, along x at y -6: the light in toward +y)
    { x: 2.15, y: -4.3, rx: 0.3, ry: 0.78, lean: [0.005, 0.03], top: 60, bars: [0], barsAlongX: false },
    { x: 6.15, y: -4.3, rx: 0.3, ry: 0.78, lean: [0.005, 0.03], top: 60, bars: [0], barsAlongX: false },
    // the chapel's
    { x: 11.65, y: -4.3, rx: 0.3, ry: 0.78, lean: [0.005, 0.03], top: 60, bars: [0], barsAlongX: false },
    { x: 15.65, y: -4.3, rx: 0.3, ry: 0.78, lean: [0.005, 0.03], top: 60, bars: [0], barsAlongX: false },
    // the walk's
    { x: 13.0, y: 2.8, rx: 0.78, ry: 0.3, lean: [0.03, 0.0], top: 60, bars: [0], barsAlongX: true },
    { x: 13.0, y: 6.0, rx: 0.78, ry: 0.3, lean: [0.03, 0.0], top: 60, bars: [0], barsAlongX: true },
    // the gaoler's room's
    { x: -7.85, y: -3.3, rx: 0.3, ry: 0.78, lean: [0.005, 0.03], top: 60, bars: [0], barsAlongX: false },
  ],
};

/** Where the torches are (on a wall: along x or y, the wall's face, where along it), look by look: in the bays marked so. */
export function torchesOf(look: Look): { alongX: boolean; along: number; face: number }[] {
  const out: { alongX: boolean; along: number; face: number }[] = [];
  for (const w of WALLS) {
    w.bays[look].forEach((b, k) => {
      if (b === 'torch') out.push({ alongX: w.alongX, along: w.b0 + (k + 0.5) * w.bw, face: w.at });
    });
  }
  return out;
}
/** The yard's torches either side of the doorway, three quarters of a tile out from each end (render/yard.ts), 92 up the wall. */
export const YARD_TORCHES: [number, number][] = [[DOOR.x0 - 0.75, DOOR.face], [DOOR.x1 + 0.75, DOOR.face]];

/** Every light of a look, the hero's pool with them. */
export function lightsOf(look: Look, heroAt: [number, number]): Lights {
  const lamps: Lamp[] = [];
  for (const t of torchesOf(look)) {
    const [x, y] = t.alongX ? [t.along, t.face + 0.15] : [t.face + 0.15, t.along];
    lamps.push({ x, y, z: 52, r: look === 'walk' ? 3.3 : 2.9, k: 3, kind: 'warm' });
  }
  // the candles in the chapel
  const nC = ALTAR_CANDLES[look].length;
  lamps.push({ x: 13.5, y: -5.5, z: 34, r: 1.1 + nC * 0.35, k: 3, kind: 'warm' });
  if (look === 'slits') lamps.push({ x: LECTERN.x + 0.36, y: LECTERN.y, z: 26, r: 1.2, k: 2, kind: 'warm' });
  // the yard's torches, and the moon in at the gate
  for (const [x, y] of YARD_TORCHES) lamps.push({ x, y: y + 0.15, z: 92, r: 2.4, k: 3, kind: 'warm' });
  lamps.push({ x: 13.5, y: DOOR.face - 0.2, z: 10, r: 1.6, k: 2, kind: 'moon' });
  // floor 1's light down the stair, faint
  lamps.push({ x: -7.4, y: -2.5, z: 10, r: 1.3, k: 1, kind: 'moon' });
  lamps.push({ x: heroAt[0], y: heroAt[1], z: 20, r: 1.5, k: 2, kind: 'pool' });
  return { lamps, beams: BEAMS[look] };
}

/**
 * THE MOON IN THE AIR of each shaft: a column of pale light from its slit down to the floor, seen as the air in it lit, brightest
 * low down and giving out in steps up toward the slit; motes in it. Laid over what is behind it, never over what stands in front of
 * it, nor over a figure stood in it.
 */
export function paintBeams(D: Deep, look: Look, L: Lights): void {
  const P = PALS[look];
  L.beams.forEach((b, bi) => {
    if (b.air === false) return;
    const rx = Math.max(b.rx, b.ry) * 45.25 * 0.5 + Math.min(b.rx, b.ry) * 45.25 * 0.5;
    const ry = rx * 0.5;
    const [fx, fy] = atPx(b.x, b.y);
    const [tx, ty] = atPx(...beamAxis(b, b.top), b.top);
    const X0 = Math.max(0, Math.floor(Math.min(fx, tx) - rx - 2));
    const X1 = Math.min(D.w - 1, Math.ceil(Math.max(fx, tx) + rx + 2));
    const Y0 = Math.max(0, Math.floor(ty - ry - 2));
    const Y1 = Math.min(D.h - 1, Math.ceil(fy + ry + 2));
    if (X1 < X0 || Y1 < Y0) return;
    const W = X1 - X0 + 1;
    const H = Y1 - Y0 + 1;
    const lowZ = new Float32Array(W * H).fill(-1);
    const across = new Float32Array(W * H);
    for (let z = 0; z <= b.top; z += 1) {
      const [ax, ay] = beamAxis(b, z);
      const [cx, cy] = atPx(ax, ay, z);
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
      if (dep > at + Math.max(b.rx, b.ry) * 1.2) continue;
      // (high up, only the floor shows the air in it: never laid on the wall it comes in through)
      if (!D.fig[k] && !D.flr[k] && z / b.top > 0.3) continue;
      const c = D.get(px, py);
      if (!c || SHINE.has(c)) continue;
      const h = z / b.top;
      const u = across[i];
      const chk = ((px >> 1) + (py >> 1)) & 1;
      let step = h < 0.22 + (chk ? 0.03 : 0) ? 3 : h < 0.5 + (chk ? 0.03 : 0) ? 2 : h < 0.82 + (chk ? 0.04 : 0) ? 1 : 0;
      if (Math.abs(u) > 0.78 + (chk ? 0.05 : 0)) step -= 1;
      if (step <= 0) continue;
      let col = mixC(c, P.air, P.airK[step - 1]);
      if (h < 0.6 && Math.abs(u) < 0.8 && hash(px >> 1, py >> 1, 917 + bi) > 0.988) col = mixC(c, P.mote, 0.5);
      D.over(px, py, col);
    }
  });
}

/** Where the enemy's pink may be seen (the test's): the Headsman, and the mark on his gate; in the world. */
export const MARK_AT: [number, number, number] = [(DOOR.x0 + DOOR.x1) / 2, DOOR.face, 128];
export const BOSS_AT: [number, number] = [9.5, 20.5];
export function pinkPlaces(): { at: [number, number, number]; rx: number; ry: number }[] {
  return [
    { at: MARK_AT, rx: 26, ry: 30 },
    { at: [BOSS_AT[0], BOSS_AT[1], 60], rx: 110, ry: 120 },
  ];
}
