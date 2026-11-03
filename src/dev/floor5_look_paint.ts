// THE FLESHMANCER'S FLOOR, A PLACE OF ITS OWN: THE MINE THAT BECOMES HIS TEMPLE, the painting (the art chat, 2 Nov 2026). A
// MOCK-UP; NOTHING OF THE GAME IMPORTS IT.
//
// His words, 1 Nov 2026, 10:29: “I think we need to redo the art for a couple of the other early levels as well.  Floor 1 and
// 2 are probably fine.  But I think we’ve outgrown the 1-5 “just make it more dirt as you get lower” plan”. Read (told him
// so): floors 3, 4 and 5 each a place of their own (floor, walls, colours, light) built round its boss; the pieces he already
// said yes to come along. Offered for floor 5: the cult's black temple, or a mine, cult-dressed. His answer: “I like the
// temple but I need the mine to be a prominent part of it.  Like you start in the mine then it becomes a temple further on”.
// Of the bosses' gates: “Its own arch, and we’ll need new ones for the other new levels as well”.
//
// So: floor 5 laid COMBO as the main chat lays it (game/dungeon.ts, CRYPT_KINDS: tight rooms you find your way through): you
// come out of floor 4's cave (art/cave4.ts, its other end `lairMouth`) into THE LANDING, the mine at its rawest; two ways on,
// round by THE SHRINE GALLERY or along THE DRIFT, to THE ANTECHAMBER before his gate, and through it HIS HALL, the temple at
// its fullest, the miners' shaft at its far corner (art/shaft.ts) that rides up to town. The mine: raw rock, timber sets
// (two posts and a cap), rails, carts, lanterns, the miners' gear. The temple: the rock carved and dressed, black worked
// stone, hangings, the shrieking-skull mark (art/floor5.ts `shriekAt`), braziers, the rift's deep pink cracks. THREE LOOKS:
//   A, THROUGH THE THRESHOLD: a lantern-lit mine giving way, through carved thresholds, to a black temple lit by the rift's
//      pink and braziers.
//   B, THE CULT CREEPING IN: room by room the cult's work grows over the mine: daubs, then hangings, then carving, until it
//      is all temple.
//   C, THE OPEN PIT: the mine's fires and the rift together: the temple cut into the benches of a vast open pit beside the
//      rooms, the rift glowing far below.
//
// His art rulebook kept: crisp pixels, two to a game pixel; one camera; light from the upper left, a face turned to screen-left
// lit, one turned right in shade; the walls toward the eye cut low, as the game leaves them; the tops of the walls fading into
// the dark, as the game's; a dark base, the place a step quieter than the figures; lantern and fire an honest warm; nothing
// cyan (the friend's); the enemy's pink only in the rift, the cult's mark and him.
//
// Measures as the game's (art/isokit.ts): picture pixels; a tile 64 x 32 on the screen; heights up, in picture pixels. Painted
// with a DEPTH for every pixel (x + y of the world point seen there: the larger, the nearer the eye).

import { Px } from '../engine/px';
import { Iso, ISO_X } from '../art/isokit';
import { hash } from '../art/kit';
import { EMBER } from '../art/props';
import { shriekAt } from '../art/floor5';

export type Look = 'threshold' | 'creep' | 'pit';
export const LOOKS: Look[] = ['threshold', 'creep', 'pit'];
/** The letter he picks by, and the picture's name. */
export const LETTER: Record<Look, string> = { threshold: 'a', creep: 'b', pit: 'c' };
export const FILE: Record<Look, string> = { threshold: 'a_through_the_threshold', creep: 'b_the_cult_creeping_in', pit: 'c_the_open_pit' };
/** Each look in a line, for him. */
export const CAPTION: Record<Look, string> = {
  threshold: 'A. Through the threshold: a lantern-lit mine, then carved doorways into a black temple lit pink by the rift.',
  creep: "B. The cult creeping in: room by room their marks, hangings and carving cover the mine till it's all temple.",
  pit: "C. The open pit: the temple cut into the ledges of a vast open pit beside you, the rift glowing far below.",
};

/** Five tones of a material: its seam, its shade, its body, its light, its lit edge. */
export type R5 = readonly [string, string, string, string, string];
type R3 = readonly [string, string, string];

export interface Pal {
  /** The mine's raw rock (its walls). */
  rock: R5;
  /** The temple's black worked stone. */
  stone: R5;
  /** The mine's floor: packed earth and grit. */
  earth: R5;
  /** The temple's floor: black flags. */
  flags: R5;
  wood: R5;
  iron: R5;
  bone: R5;
  /** The cult's hangings: an old oxblood cloth. */
  cloth: R5;
  /** Chalk: the cult's daubs on the raw rock, the mark painted on the hangings. */
  chalk: readonly [string, string];
  seam: string;
  beyond: string;
  /** Fire's light in three bands (outer to inner), and how far each goes toward it. */
  warm: R3;
  warmK: readonly [number, number, number];
  /** The rift's light, the enemy's deep pink, dulled: three bands. */
  rift: R3;
  riftK: readonly [number, number, number];
  /** The hero's own pool of light. */
  pool: string;
}

const BASE = {
  wood: ['#140d09', '#26180f', '#3a2616', '#50351f', '#6a472a'] as R5,
  iron: ['#0a0a0c', '#161518', '#232026', '#332f37', '#4c4752'] as R5,
  cloth: ['#12070a', '#260c13', '#3a121c', '#4f1a26', '#652430'] as R5,
  chalk: ['#6e6862', '#9a938a'] as const,
  seam: '#07060a',
  beyond: '#050407',
};

export const PALS: Record<Look, Pal> = {
  // THROUGH THE THRESHOLD: a warm brown mine rock under the lanterns; past the threshold the temple's stone near black, cold
  threshold: {
    ...BASE,
    rock: ['#110d0b', '#211914', '#30251d', '#433428', '#5b4836'],
    stone: ['#08070c', '#121018', '#1c1924', '#282433', '#3b3549'],
    earth: ['#0f0b09', '#1c1510', '#291f17', '#372a1f', '#4a3a2b'],
    flags: ['#09080d', '#131118', '#1d1a24', '#292532', '#3a3446'],
    bone: ['#1a1716', '#302a26', '#4a4139', '#655a4d', '#7f725f'],
    warm: ['#4c2c12', '#965a20', '#dc963c'],
    warmK: [0.18, 0.3, 0.42],
    rift: ['#2a0b24', '#4e123c', '#7c1d5a'],
    riftK: [0.22, 0.34, 0.46],
    pool: '#5a5258',
  },
  // THE CULT CREEPING IN: a greyer rock, the cult's stone blacker; candle and lantern light all through, the rift's only in his hall
  creep: {
    ...BASE,
    rock: ['#0f0e0d', '#1c1a18', '#2a2622', '#3a352f', '#504940'],
    stone: ['#08070b', '#110f16', '#1a1721', '#25212e', '#373143'],
    earth: ['#0e0c0b', '#1a1714', '#26211d', '#332c26', '#453c33'],
    flags: ['#09080c', '#121016', '#1b1820', '#26222d', '#36303f'],
    bone: ['#191717', '#2e2a28', '#47413c', '#615950', '#7a7064'],
    warm: ['#4a2a14', '#925622', '#d8903e'],
    warmK: [0.18, 0.3, 0.42],
    rift: ['#2a0b24', '#4e123c', '#7c1d5a'],
    riftK: [0.22, 0.34, 0.46],
    pool: '#565052',
  },
  // THE OPEN PIT: a rust-brown rock, the temple's stone a purple-black; the mine's fires and the rift's glow together
  pit: {
    ...BASE,
    rock: ['#120c0a', '#22160f', '#332218', '#473021', '#61432d'],
    stone: ['#0a070d', '#140f19', '#1f1826', '#2c2335', '#40344c'],
    earth: ['#100b09', '#1e140f', '#2b1e16', '#3a291e', '#4d3829'],
    flags: ['#0a080d', '#151019', '#1f1924', '#2b2331', '#3c3245'],
    bone: ['#1a1617', '#302828', '#4a3e3c', '#655650', '#7f6e64'],
    warm: ['#52260e', '#9c4c18', '#e0802c'],
    warmK: [0.2, 0.33, 0.45],
    rift: ['#2e0b26', '#561440', '#86205f'],
    riftK: [0.24, 0.38, 0.5],
    pool: '#5a5056',
  },
};

// =================================================================================================
// THE PLACE, in tiles (x down the screen to the right, y down to the left, as the game's): floor 5 laid COMBO. From the cave's
// mouth (in the landing's left wall) two ways round to the boss's door (top right), and his hall beyond.

export interface Rect { x0: number; y0: number; x1: number; y1: number }
/** The Fleshmancer's hall: the temple at its fullest. Flat. */
export const HALL: Rect = { x0: -1, y0: -10, x1: 9, y1: 0 };
/** The boss's doorway: three tiles of the hall's near wall (the row y 0..1), with HIS GATE in it. */
export const GATE: Rect = { x0: 3, y0: 0, x1: 6, y1: 1 };
/** The rooms: A the antechamber before the gate, B the drift (the main way), C the shrine gallery (the way round), D the landing. */
export const RA: Rect = { x0: 2, y0: 1, x1: 7, y1: 6 };
export const RB: Rect = { x0: 2, y0: 7, x1: 7, y1: 12 };
export const RC: Rect = { x0: -4, y0: 1, x1: 1, y1: 6 };
export const RD: Rect = { x0: -4, y0: 7, x1: 1, y1: 12 };
/** The floors under the openings (each wall a tile thick). */
export const PASSES: readonly Rect[] = [
  { x0: 3, y0: 6, x1: 6, y1: 7 }, { x0: -3, y0: 6, x1: 0, y1: 7 }, { x0: 1, y0: 2, x1: 2, y1: 5 }, { x0: 1, y0: 8, x1: 2, y1: 11 },
];
/** THE CAVE'S MOUTH, floor 4's cave come out (art/cave4.ts `lairMouth`): three tiles of the landing's left wall (along y, its face at x = -4). */
export const MOUTH_AT = { x: -4, y0: 8, y1: 11 };

/** A standing wall: along x (its face at y = `at`, turned to screen-left and lit) or along y (its face at x = `at`, in shade); from `a` to `b` along it; its openings; the gate's gap. */
export interface WallRun { alongX: boolean; at: number; a: number; b: number; arches: readonly (readonly [number, number])[]; gap?: readonly [number, number]; seed: number; mouth?: readonly [number, number] }
const PG = 12 / ISO_X;
export const WALLS: readonly WallRun[] = [
  { alongX: true, at: -10, a: -2, b: 10, arches: [], seed: 11 },
  { alongX: false, at: -1, a: -10, b: 0, arches: [], seed: 13 },
  { alongX: true, at: 1, a: -5, b: 7, arches: [], gap: [GATE.x0 - PG, GATE.x1 + PG], seed: 15 },
  { alongX: false, at: -4, a: 0, b: 13, arches: [], seed: 17, mouth: [MOUTH_AT.y0, MOUTH_AT.y1] },
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

/** Where the hero stands: in the drift (the whole run), where the mine turns to temple (one phone screen, each look), at the gate. */
export const HERO_RUN: [number, number] = [4.6, 9.2];
export const HERO_PHONE: Record<Look, [number, number]> = { threshold: [4.5, 8.2], creep: [3.4, 7.9], pit: [-2.2, 2.0] };
export const HERO_GATE: [number, number] = [4.0, 2.0];
/** Where the Fleshmancer is, in his hall. */
export const BOSS_AT: [number, number] = [4.6, -4.6];

// =================================================================================================
// THE CHANGE FROM MINE TO TEMPLE: how far the cult has made a point of the floor its own, 0 (the mine, raw) to 1 (the temple)

/** How far along the way from the cave's mouth to his gate a point is: 0 at the mouth, 1 at the gate; his hall 1. */
export function along(x: number, y: number): number {
  if (y < 0.6 && x > -1.5) return 1;
  const d0 = Math.hypot(x - (-3.6), y - 9.5);
  const d1 = Math.hypot(x - 4.5, y - 1.0);
  return Math.max(0, Math.min(1, d0 / (d0 + d1)));
}
/** How much a point is the temple's, look by look. */
export function templeK(look: Look, x: number, y: number): number {
  const p = along(x, y);
  if (look === 'threshold') {
    // (sharp: the mine to the thresholds, the temple past them)
    if (y < 0.6 && x > -1.5) return 1;
    if (x >= 2 && y < 6.6) return 1;
    return 0;
  }
  if (look === 'creep') {
    // (room by room: D 0, C and B a third to two thirds, A nearly all, the hall all; ragged along the walls)
    const n = (fbm(x * 0.9, y * 0.9, 501) - 0.5) * 0.36;
    return Math.max(0, Math.min(1, (p - 0.12) * 1.3 + n));
  }
  // (the pit: the mine on this side, the temple from the antechamber on; the pit's own below)
  if (y < 0.6 && x > -1.5) return 1;
  if (x >= 2 && y < 6.6) return 0.9;
  return Math.max(0, Math.min(0.32, (p - 0.2) * 0.8));
}

// =================================================================================================
// Helpers

const clampK = (k: number): number => Math.max(0, Math.min(4, k));
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
  if (mixMemo.size < 300000) mixMemo.set(key, out);
  return out;
}
function noise(x: number, y: number, k = 0): number {
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
// farther, never the other way, whatever order they come in.

export class Deep extends Px {
  readonly dep: Float32Array;
  depth = 0;
  constructor(w: number, h: number, bg: string) {
    super(w, h);
    this.dep = new Float32Array(w * h).fill(-1e9);
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) super.set(x, y, bg);
  }
  override set(x: number, y: number, c: string | null): this {
    x = Math.floor(x);
    y = Math.floor(y);
    if (c === null || x < 0 || y < 0 || x >= this.w || y >= this.h) return this;
    const i = y * this.w + x;
    if (this.depth < this.dep[i]) return this;
    this.dep[i] = this.depth;
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
// THE LIGHT: what burns (lanterns, braziers, fire baskets, candles) and the rift's deep pink; each in three bands, their edges
// broken in a checker of two-pixel squares so that no circle reads (no soft gradient: his Pixels 1); the hero's own pool.

export type LightKind = 'warm' | 'rift' | 'pool';
export interface Lamp { x: number; y: number; z: number; r: number; k: number; kind: LightKind }
export interface Patch { x0: number; y0: number; x1: number; y1: number; z: number; r: number; k: number; kind: LightKind }
export interface Lights { lamps: Lamp[]; patches: Patch[] }

/** How lit a point is, by each kind of light: 0 none, 1, 2, 3 the inner band. */
export function bands(x: number, y: number, z: number, L: Lights): [number, number, number] {
  const out: [number, number, number] = [0, 0, 0];
  const sx = Math.floor((x - y) * 16);
  const sy = Math.floor(((x + y) * 16 - z) / 2);
  const jit = (sx + sy) & 1 ? 0.045 : -0.045;
  for (const l of L.lamps) {
    if (Math.abs(x - l.x) > l.r * 1.1 || Math.abs(y - l.y) > l.r * 1.1) continue;
    const d = Math.hypot(x - l.x, y - l.y, (z - l.z) / 44) / l.r + jit;
    const b = Math.min(l.k, d < 0.34 ? 3 : d < 0.62 ? 2 : d < 1 ? 1 : 0);
    const i = l.kind === 'warm' ? 0 : l.kind === 'rift' ? 1 : 2;
    if (b > out[i]) out[i] = b;
  }
  for (const g of L.patches) {
    const dx = Math.max(g.x0 - x, 0, x - g.x1);
    const dy = Math.max(g.y0 - y, 0, y - g.y1);
    const dz = Math.max(0, z - g.z) / 60 + Math.max(0, g.z - z) / 160;
    const d = Math.hypot(dx, dy, dz) / g.r + jit;
    const b = Math.min(g.k, d < 0.3 ? 3 : d < 0.6 ? 2 : d < 1 ? 1 : 0);
    const i = g.kind === 'warm' ? 0 : g.kind === 'rift' ? 1 : 2;
    if (b > out[i]) out[i] = b;
  }
  return out;
}
/** A colour lit where it is: the rift's light, then the fire's, then the hero's pool. */
export function lit(P: Pal, c: string, x: number, y: number, z: number, L: Lights, less = 0): string {
  const [w, k, p] = bands(x, y, z, L);
  return litBy(P, c, w - less, k - less, p - less);
}
export function litBy(P: Pal, c: string, w: number, k: number, p: number): string {
  if (k > 0) c = mixC(c, P.rift[k - 1], P.riftK[k - 1]);
  if (w > 0) c = mixC(c, P.warm[w - 1], P.warmK[w - 1]);
  if (p > 0) c = mixC(c, P.pool, p > 1 ? 0.2 : 0.12);
  return c;
}

/** The rift's own fire in its cracks, the enemy's pink: hottest at the heart. */
export const RIFT_FIRE = ['#7a1058', '#a01a62', '#c0206a', '#ff4f8a'] as const;
/** What gives off its own light (a flame, the enemy's embers): never lit, never faded. */
export const SHINE = new Set<string>([...EMBER, '#ffe6a8', ...RIFT_FIRE]);

/** A candle's flame, 2 wide and 4 high above its wick (j 0 the top): yellow-white at its heart, gold, then orange at its foot. */
export function flamePx(i: number, j: number, k: number): string | null {
  if (i < 0 || i > 1 || j < 0 || j > 3) return null;
  if (j === 0) return i === (k & 1) ? EMBER[3] : null;
  if (j === 1) return i === 0 ? '#ffe6a8' : EMBER[3];
  if (j === 2) return i === 0 ? EMBER[4] : EMBER[3];
  return EMBER[2];
}

// =================================================================================================
// THE MINE'S FACE: raw rock broken in facets, the scores of the picks in it, a seam of ore here and there; TIMBER SETS every
// two tiles (a post against the rock, a cap along the wall over the posts), the miners' lagging boards between their tops.

const SET = { post: 5, cap0: 50, cap1: 58, lag0: 34 };

/** Raw rock at a point of a face: (s picture pixels along it, up over its foot); its facets lit from the upper left. */
function rawRock(P: Pal, lit0: boolean, s: number, up: number, seed: number): string {
  const R = P.rock;
  const down = lit0 ? 0 : 1;
  // (cells: lumps of rock about 26 across and 18 high, each a plane of its own)
  const cx = s / 26;
  const cy = up / 17;
  let best = 9;
  let second = 9;
  let id = 0;
  const ix = Math.floor(cx);
  const iy = Math.floor(cy);
  for (let j = -1; j <= 1; j++) for (let i = -1; i <= 1; i++) {
    const px = ix + i + hash(ix + i, iy + j, seed) * 0.9;
    const py = iy + j + hash(ix + i, iy + j, seed + 1) * 0.9;
    const d = Math.hypot(cx - px, (cy - py) * 1.1);
    if (d < best) {
      second = best;
      best = d;
      id = (ix + i) * 131 + (iy + j) * 17;
    } else if (d < second) second = d;
  }
  const edge = second - best;
  if (edge < 0.06) return P.seam;
  // its plane: some face up (lit), some down (dark); within it the light falls off toward its lower right
  const tilt = hash(id, 3, seed);
  let k = tilt < 0.2 ? 1 : tilt < 0.62 ? 2 : tilt < 0.9 ? 3 : 4;
  if (edge < 0.14) k += tilt < 0.5 ? -1 : 1;
  // the scores of the picks: short slanting cuts in clusters
  const sc = hash(Math.floor(s / 9), Math.floor(up / 7), seed + 7);
  if (sc > 0.86 && Math.abs(((s + up * 0.7) % 9) - 4) < 0.6) k -= 1;
  // fine grain
  if (hash(s >> 1, up >> 1, seed + 9) > 0.9) k -= 1;
  return R[clampK(k - down)];
}

/** The mine's face at a point: `s` along it in picture pixels, `up` over its foot; raw rock with its timber sets. */
function mineFace(P: Pal, lit0: boolean, s: number, up: number, seed: number, sets = true): string {
  const W = P.wood;
  const down = lit0 ? 0 : 1;
  if (sets) {
    const sw = ((s % 64) + 64) % 64;
    const d = sw < 32 ? sw : sw - 64;
    // THE POST: a squared timber 10 across, its edge toward the light lit, a split in it
    if (Math.abs(d + 0.5) <= SET.post && up < SET.cap1) {
      if (d === -SET.post) return W[clampK(4 - down)];
      if (d >= SET.post - 1) return W[0];
      const split = hash(Math.floor((s - d) / 64), 2, seed) * 6 - 3;
      if (Math.abs(d - split) < 0.6 && up > 8 && up < 40) return W[clampK(1 - down)];
      return W[clampK((d < -1 ? 3 : 2) - down)];
    }
    // THE CAP across the tops of the posts, along the wall
    if (up >= SET.cap0 && up < SET.cap1) {
      if (up === SET.cap1 - 1) return W[clampK(4 - down)];
      if (up === SET.cap0) return W[0];
      const g = hash(s >> 3, 5, seed) > 0.8 ? 1 : 0;
      return W[clampK(3 - g - down)];
    }
    // the wedge over each post
    if (up >= SET.cap1 && up < SET.cap1 + 3 && Math.abs(d) <= 3) return W[clampK(3 - down)];
    // THE LAGGING: boards laid between the posts' tops, holding the rock back, gaps between
    if (up >= SET.lag0 && up < SET.cap0) {
      const b = Math.floor((up - SET.lag0) / 5);
      const lv = (up - SET.lag0) % 5;
      const bayN = Math.floor((s - d) / 64);
      const short = hash(bayN, b, seed + 3) < 0.25;
      if (hash(bayN, 0, seed + 2) < 0.45 && !(short && Math.abs(d) > 20)) {
        if (lv === 4) return P.seam;
        return W[clampK((lv === 3 ? 3 : 2) - down - (hash(Math.floor((s - d) / 64), b, seed + 4) < 0.3 ? 1 : 0))];
      }
    }
  }
  // AN ORE SEAM: a band slanting through the rock, flecked dull
  const band = up - 22 - Math.sin(s / 41 + seed) * 7 - s * 0.06;
  if (Math.abs(((band % 90) + 90) % 90 - 45) < 2.2 && hash(s, up, seed + 21) > 0.4) return hash(s, up, seed + 23) > 0.7 ? '#6a5530' : '#4a3c24';
  return rawRock(P, lit0, s, up, seed);
}

// =================================================================================================
// THE TEMPLE'S FACE: black worked stone in great courses on a moulded plinth; A PILASTER every two tiles; between them a
// carved panel with the shrieking skull (the cult's mark) or a hanging; the rift's pink cracks in it here and there

/** The cult's mark at (i, j) from its middle, `r` its half width: 'bone' (raised, lit) or 'dark' (cut in), or null. */
export function markPx(i: number, j: number, r: number): 'bone' | 'dark' | null {
  return shriekAt((i + 0.5) / r, (j + 0.5) / r);
}

/** What hangs in each bay of the temple's walls: a hanging, a carved panel, or nothing. */
function bayHas(bay: number, seed: number, k: number): 'hanging' | 'panel' | 'none' {
  const h = hash(bay, seed, 71);
  if (k > 0.85) return h < 0.5 ? 'hanging' : 'panel';
  return h < 0.4 ? 'hanging' : h < 0.75 ? 'panel' : 'none';
}

function templeFace(P: Pal, lit0: boolean, s: number, up: number, seed: number, k: number): string {
  const S = P.stone;
  const down = lit0 ? 0 : 1;
  const sw = ((s % 64) + 64) % 64;
  const d = sw < 32 ? sw : sw - 64;
  const bay = Math.floor(s / 64 + 0.5);
  // THE PILASTER: square, 14 across, a lit edge toward the light, on the plinth, its capital a band
  if (Math.abs(d + 0.5) <= 7) {
    if (up < 12) return up === 11 ? S[clampK(4 - down)] : up < 2 ? S[clampK(1 - down)] : S[clampK(2 - down)];
    if (up >= 60 && up < 66) return up === 65 ? S[clampK(4 - down)] : up === 60 ? P.seam : S[clampK(3 - down)];
    if (d === -7) return S[clampK(4 - down)];
    if (d === -6) return S[clampK(3 - down)];
    if (d >= 6) return S[0];
    // (a groove down it)
    if (d === 0) return S[clampK(1 - down)];
    return S[clampK(2 - down)];
  }
  // THE PLINTH: a moulding
  if (up < 12) {
    if (up === 11) return S[clampK(4 - down)];
    if (up === 10) return S[clampK(2 - down)];
    if (up === 9) return P.seam;
    if (up < 2) return S[clampK(1 - down)];
    return S[clampK(2 - down)];
  }
  // (what hangs in a bay hangs at its middle, between two pilasters)
  const bay2 = Math.floor(s / 64);
  const m = sw - 32;
  const what = bayHas(bay2, seed, k);
  void bay;
  // A HANGING from a rod at 70 down to a ragged hem, the mark painted on it in chalk
  if (what === 'hanging' && Math.abs(m) <= 17) {
    const d = m;
    const bay = bay2;
    const hem = 16 + Math.floor(hash(bay, Math.floor(d / 3), seed + 41) * 7);
    if (up >= 70 && up < 72) return P.iron[clampK(3 - down)];
    if (up < 70 && up >= hem) {
      const C = P.cloth;
      // (folds: three, lit on their left)
      const f = ((d + 17) % 9 + 9) % 9;
      let kk = f < 2 ? 3 : f < 6 ? 2 : 1;
      if (Math.abs(d) === 17) kk = 0;
      // the mark, in chalk, at its middle
      const mk = markPx(d, up - 44, 11);
      if (mk === 'bone') return mixC(P.chalk[lit0 ? 1 : 0], C[2], 0.35);
      if (mk === 'dark') return C[0];
      // a tear or two at the hem
      if (up < hem + 3 && hash(bay, d, seed + 43) > 0.75) return P.seam;
      return C[clampK(kk - down)];
    }
  }
  // A CARVED PANEL: sunk, its frame lit on its upper-left edge; the mark in relief in it
  if (what === 'panel' && Math.abs(m) <= 16 && up >= 22 && up < 62) {
    const d = m;
    const e = Math.min(16 - Math.abs(d), up - 22, 61 - up);
    if (e < 1) return S[clampK((d < 0 || up > 58 ? 4 : 1) - down)];
    if (e < 3) return S[clampK(3 - down)];
    if (e < 4) return P.seam;
    const mk = markPx(d, up - 42, 11);
    if (mk === 'bone') {
      // (relief: lit toward its upper left)
      const rim = markPx(d - 1, up - 41, 11) === null;
      return S[clampK((rim ? 4 : 3) - down)];
    }
    if (mk === 'dark') return P.seam;
    return S[clampK(1 - down)];
  }
  // THE STONE, in courses 16 high, blocks 30 to 44 long, their edges dressed
  const CH = 16;
  const cv = up - 12;
  const row = Math.floor(cv / CH);
  const lv = cv % CH;
  const off = Math.floor(hash(row, seed, 1) * 40);
  const L = 30 + Math.floor(hash(row, seed, 2) * 14);
  const uu = s + off + 400;
  const b = Math.floor(uu / L);
  const lu = uu % L;
  if (lv === CH - 1 || lu === 0) return P.seam;
  let kk = 2;
  const tone = hash(b, row * 7 + seed, 3);
  if (tone < 0.2) kk -= 1;
  else if (tone > 0.92) kk += 1;
  if (lv === CH - 2) kk += 1;
  if (lit0 && lu === 1) kk += 1;
  if (lv === 0 || lu === L - 1) kk -= 1;
  return S[clampK(kk - down)];
}

/** THE RIFT'S CRACKS through the black stone: a jagged line, its heart the enemy's fire; where on a face. */
function riftCrack(s: number, up: number, seed: number): number {
  // (a crack rising from the foot every so often, wandering)
  const c = Math.floor((s + 20) / 120);
  if (hash(c, seed, 91) > 0.5) return 9;
  const x0 = c * 120 + 30 + hash(c, seed, 93) * 50;
  const top = 30 + hash(c, seed, 95) * 40;
  if (up > top) return 9;
  const wob = Math.sin(up * 0.35 + c) * 3 + Math.sin(up * 0.9 + c * 2) * 1.5 + (hash(Math.floor(up / 4), c, 97) - 0.5) * 3;
  return Math.abs(s - x0 - wob) + (up / top) * 1.2;
}

/** THE FACE where mine and temple meet, at a point: by how much it is the temple's (k), a stage of the cult's work. */
function wallFace(P: Pal, look: Look, lit0: boolean, s: number, up: number, seed: number, k: number): string {
  // (the edge of the cult's work wanders: carved stone cut into the rock in blocks, never in a straight line)
  const n = (fbm(s / 40, up / 30, seed + 61) - 0.5) * 0.5;
  const kk = k + n * (k > 0.02 && k < 0.98 ? 1 : 0);
  if (kk >= 0.62) {
    let c = templeFace(P, lit0, s, up, seed, k);
    // where it meets the raw rock, the cut edge lit
    if (kk < 0.66) c = P.stone[lit0 ? 4 : 3];
    // the rift's cracks (A and the hall: the temple at its fullest)
    if (k > 0.95 && look !== 'creep') {
      const e = riftCrack(s, up, seed);
      if (e < 0.8) return RIFT_FIRE[up < 14 ? 2 : 1];
      if (e < 1.6) return RIFT_FIRE[0];
    }
    if (k > 0.95 && look === 'creep' && seed === 11) {
      const e = riftCrack(s, up, seed);
      if (e < 0.8) return RIFT_FIRE[1];
      if (e < 1.6) return RIFT_FIRE[0];
    }
    return c;
  }
  let c = mineFace(P, lit0, s, up, seed);
  // THE CULT'S FIRST MARKS ON THE RAW ROCK (B: a quarter of the way in on): the mark daubed in chalk, hangings nailed to the caps
  if (kk > 0.22) {
    const sw = ((s % 64) + 64) % 64;
    const d = sw < 32 ? sw : sw - 64;
    const bay = Math.floor(s / 64 + 0.5);
    const h = hash(bay, seed, 77);
    // a hanging from the cap, between two posts (d ±32 is the bay's middle between posts)
    const m = ((s + 32) % 64 + 64) % 64 - 32;
    if (h < 0.45 && Math.abs(m) <= 11 && up < SET.cap0 && up >= 14 + Math.floor(hash(bay, Math.floor(m / 3), seed + 79) * 8)) {
      const C = P.cloth;
      const f = ((m + 11) % 8 + 8) % 8;
      let q = f < 2 ? 3 : f < 5 ? 2 : 1;
      if (Math.abs(m) === 11) q = 0;
      const mk = markPx(m, up - 36, 8);
      if (mk === 'bone') return mixC(P.chalk[lit0 ? 1 : 0], C[2], 0.35);
      if (mk === 'dark') return C[0];
      return C[clampK(q - (lit0 ? 0 : 1))];
    }
    // the mark daubed on the rock in chalk strokes (broken, dabbed)
    if (h >= 0.45 && h < 0.85 && Math.abs(m) <= 12 && up > 6 && up < 32) {
      const mk = markPx(m, up - 19, 11);
      if (mk === 'bone' && hash(s, up, seed + 81) > 0.25 && markPx(m, up - 19, 9.5) === null) return P.chalk[lit0 ? 1 : 0];
      if (mk === 'dark' && hash(s, up, seed + 83) > 0.5) return mixC(c, P.seam, 0.5);
    }
    void d;
  }
  return c;
}

/** The top of a wall fading into the dark: the game's four steps. */
export function faded(P: Pal, c: string, z: number, top: number): string {
  const FADE = 24;
  const fromTop = top - 1 - z;
  if (fromTop < FADE) return mixC(c, P.beyond, [0.9, 0.66, 0.42, 0.2][Math.max(0, Math.floor((fromTop * 4) / FADE))]);
  return c;
}


/** THE RIM OF THE CAVE'S MOUTH in the landing's rock: lumps of the raw rock broken back round it, earth and stones fallen before it. */
export function paintMouthRim(D: Deep, look: Look, L: Lights): void {
  const P = PALS[look];
  const x = MOUTH_AT.x;
  const ym = (MOUTH_AT.y0 + MOUTH_AT.y1) / 2;
  for (let k = 0; k < 13; k++) {
    const a = Math.PI * (k / 12);
    const yy = ym - Math.cos(a) * 1.45 + (hash(k, 1, 861) - 0.5) * 0.2;
    const z = Math.sin(a) * 70 + (hash(k, 2, 861) - 0.5) * 8;
    const r = 0.13 + hash(k, 3, 861) * 0.1;
    rock(D, look, L, [x + 0.08, yy, Math.max(6, z)], [r * 0.7, r, 9 + hash(k, 4, 861) * 6], 870 + k);
  }
  rock(D, look, L, [x + 0.45, ym, -3], [0.45, 1.1, 8], 899, P.earth);
  for (let k = 0; k < 7; k++) {
    rock(D, look, L, [x + 0.3 + hash(k, 5, 861) * 0.9, ym + (hash(k, 6, 861) - 0.5) * 2.2, 3], [0.09 + hash(k, 7, 861) * 0.06, 0.1 + hash(k, 8, 861) * 0.06, 4], 880 + k);
  }
}

// =================================================================================================
// THE OPENINGS BETWEEN THE ROOMS: in the mine a timber-framed way (two posts and a heavy cap); in the temple a carved way
// with a corbelled head (its sides stepping in toward the top), a carved band round it and the mark over it

export const OPEN = { half: 46, mineTop: 62, jamb: 42, steps: [[42, 38], [50, 30], [58, 20]] as const, templeTop: 66 };
/** A's CARVED THRESHOLDS: how far either side of the way the carved front reaches into the raw rock, its pilasters, the mark at its head. */
export const THRESH = { reach: 78, pil0: 60, cap: 52, markZ: 71, markR: 8 };

/** THE CARVED THRESHOLD's front at a point (du from the way's middle, up): black worked stone cut into the raw rock, pilasters
 *  either side with the mark on their capitals, a broad carved band round the way, the mark at its head with the enemy's pink
 *  dull in its eyes. Null where it is not (the rock goes on), or the way itself ('way'). */
function thresholdFace(P: Pal, du: number, up: number, lit0: boolean, s: number): string | null {
  const S = P.stone;
  const a = Math.abs(du);
  const down = lit0 ? 0 : 1;
  // (its outline in the rock: ragged, cut back)
  const rag = (hash(Math.floor(up / 6), Math.floor(du / 40), 401) - 0.5) * 6;
  if (a > THRESH.reach + rag) return null;
  if (a > THRESH.reach + rag - 2) return P.seam;
  // the pilasters
  if (a >= THRESH.pil0 && a < THRESH.pil0 + 14) {
    const pu = a - THRESH.pil0;
    if (up >= THRESH.cap && up < THRESH.cap + 14) {
      const mk = markPx(Math.floor(du < 0 ? du + THRESH.pil0 + 7 : du - THRESH.pil0 - 7), up - THRESH.cap - 7, 6);
      if (mk === 'bone') return S[clampK(4 - down)];
      if (mk === 'dark') return P.seam;
      return up === THRESH.cap + 13 ? S[clampK(4 - down)] : up === THRESH.cap ? P.seam : S[clampK(2 - down)];
    }
    if (up < 8) return up === 7 ? S[clampK(4 - down)] : S[clampK(2 - down)];
    if (pu < 1) return S[clampK((du < 0 ? 4 : 3) - down)];
    if (pu >= 13) return P.seam;
    return S[clampK((pu === 6 ? 1 : 3) - down)];
  }
  const band = 10;
  if (inOpening(0, up, -du / ISO_X - 1.5, -du / ISO_X + 1.5, true)) return 'way';
  // the broad band round the way, carved in blocks like a row of teeth
  let near = 99;
  for (let dy = -band; dy <= band; dy += 2) for (let dx = -band; dx <= band; dx += 2) {
    if (Math.hypot(dx, dy) > band) continue;
    if (inOpening(0, up + dy, -(du + dx) / ISO_X - 1.5, -(du + dx) / ISO_X + 1.5, true)) near = Math.min(near, Math.hypot(dx, dy));
  }
  if (near <= band) {
    if (near < 1.5) return S[clampK(4 - down)];
    if (near > band - 1.2) return P.seam;
    return ((Math.floor(du / 6) + Math.floor(up / 6)) & 1) ? S[clampK(2 - down)] : S[clampK(3 - down)];
  }
  // the mark at its head: the enemy's pink dull in its eyes
  const mk = markPx(du, up - THRESH.markZ, THRESH.markR);
  if (mk === 'bone') return S[clampK(4 - down)];
  if (mk === 'dark') return up > THRESH.markZ - 1 ? RIFT_FIRE[1] : RIFT_FIRE[0];
  // the worked stone between: great blocks
  const row = Math.floor(up / 14);
  const lv = up % 14;
  const lu = ((s + (row % 2 ? 0 : 17)) % 34 + 34) % 34;
  if (lv === 13 || lu === 0) return P.seam;
  if (lv === 12 || lu === 1) return S[clampK(3 - down)];
  return S[clampK(1 - down)];
}

/** Is a point of the wall's face in the opening? `temple`: its kind. */
export function inOpening(alongT: number, up: number, a0: number, a1: number, temple: boolean): boolean {
  const du = Math.abs((alongT - (a0 + a1) / 2) * ISO_X);
  if (!temple) return du < OPEN.half - 6 && up < OPEN.mineTop - 6;
  if (up < OPEN.jamb) return du < OPEN.half;
  for (const [z, h] of OPEN.steps) if (up < z + 8) return du < h;
  return false;
}
/** The frame round an opening, if a point is on it: a colour. */
function openingFrame(P: Pal, alongT: number, up: number, a0: number, a1: number, temple: boolean, lit0: boolean, threshold: boolean): string | null {
  const du = (alongT - (a0 + a1) / 2) * ISO_X;
  const a = Math.abs(du);
  const down = lit0 ? 0 : 1;
  if (!temple) {
    const W = P.wood;
    // the posts just inside the way, the cap over it
    if (up < OPEN.mineTop - 6 && a >= OPEN.half - 6 && a < OPEN.half + 4) {
      const e = a - (OPEN.half - 6);
      return e < 1 ? W[clampK(4 - down)] : e > 8 ? W[0] : W[clampK((du < 0 ? 3 : 2) - down)];
    }
    if (up >= OPEN.mineTop - 6 && up < OPEN.mineTop + 4 && a < OPEN.half + 10) {
      if (up === OPEN.mineTop + 3) return W[clampK(4 - down)];
      if (up === OPEN.mineTop - 6) return W[0];
      return W[clampK((hash(Math.floor(du / 6), 3, 5) > 0.7 ? 2 : 3) - down)];
    }
    return null;
  }
  const S = P.stone;
  const band = threshold ? 10 : 6;
  // the carved band round the way: outside its outline by `band`
  let outline = OPEN.half;
  let top = OPEN.templeTop;
  if (up >= OPEN.jamb) for (const [z, h] of OPEN.steps) if (up < z + 8) { outline = h; break; }
  if (up < OPEN.jamb) outline = OPEN.half;
  const inBand = (a < outline + band && up < top + band) && !inOpening(alongT, up, a0, a1, true);
  // (a stepped band: where it is within `band` of the opening, measured both ways)
  if (inBand) {
    let near = 99;
    for (let dy = -band; dy <= band; dy += 2) for (let dx = -band; dx <= band; dx += 2) {
      if (Math.hypot(dx, dy) > band) continue;
      if (inOpening(alongT + dx / ISO_X, up + dy, a0, a1, true)) near = Math.min(near, Math.hypot(dx, dy));
    }
    if (near <= band) {
      if (near < 1.5) return S[clampK(4 - down)];
      if (near > band - 1.2) return P.seam;
      // (threshold: the band carved with a row of the dead's teeth: little blocks)
      if (threshold && ((Math.floor(du / 5) + Math.floor(up / 5)) & 1)) return S[clampK(2 - down)];
      return S[clampK(3 - down)];
    }
  }
  // the mark over the way, on a block at its head
  const mk = markPx(du, up - (top + band + 9), threshold ? 9 : 7);
  if (mk === 'bone') return S[clampK(4 - down)];
  if (mk === 'dark') return threshold ? RIFT_FIRE[0] : P.seam;
  return null;
}

// =================================================================================================
// PAINTING THE WALLS: each standing run as boxes of the game's height, cut round its openings; the faces lit where they stand

export function paintWalls(D: Deep, look: Look, L: Lights, hole: (px: number, py: number) => boolean = () => false): void {
  const P = PALS[look];
  const iso = new Iso(D, PICTURE.OX, PICTURE.OY);
  for (const w of WALLS) {
    if (look === 'pit' && PIT_RIMS.some((r) => r.alongX === w.alongX && r.at === w.at)) {
      // (look C: the stretch of this wall over the pit is a parapet: painted with the pit)
      continue;
    }
    const cuts: [number, number][] = [];
    let a = w.a;
    const opens = [...w.arches.map((q) => [q[0], q[1]] as const), ...(w.gap ? [[w.gap[0], w.gap[1]] as const] : [])].sort((p, q) => p[0] - q[0]);
    for (const [o0, o1] of opens) {
      if (o0 > a) cuts.push([a, o0]);
      a = o1;
    }
    if (w.b > a) cuts.push([a, w.b]);
    const thresholds = look === 'threshold' ? w.arches.filter((o) => (w.alongX && w.at === 7 && o[0] === 3) || (!w.alongX && w.at === 2 && o[0] === 2)) : [];
    const face = (alongT: number, up: number, opening?: readonly [number, number]): string | null => {
      const [x, y] = w.alongX ? [alongT, w.at + 0.05] : [w.at + 0.05, alongT];
      const k = templeK(look, x, y);
      const s = Math.floor(alongT * ISO_X + 1e-6);
      let c: string | null = null;
      for (const t of thresholds) {
        const du = (alongT - (t[0] + t[1]) / 2) * ISO_X;
        const tc = thresholdFace(PALS[look], du, up, w.alongX, s);
        if (tc === 'way') return null;
        if (tc) {
          if (SHINE.has(tc)) return tc;
          const lc = lit(P, tc, x, y, up, L);
          // (it stands whole to the wall's top: carved, it does not fade as the rock does)
          return up < 74 ? lc : faded(P, lc, up, WALL);
        }
      }
      if (opening) {
        // (the opening's kind: by the side it is seen from; A's thresholds carved, on the mine's side, into A)
        const mid = (opening[0] + opening[1]) / 2;
        const [ox, oy] = w.alongX ? [mid, w.at + 0.3] : [w.at + 0.3, mid];
        const kOpen = templeK(look, ox, oy);
        const threshold = look === 'threshold' && ((w.alongX && w.at === 7 && opening[0] === 3) || (!w.alongX && w.at === 2 && opening[0] === 2));
        const temple = kOpen > 0.55 || threshold;
        if (inOpening(alongT, up, opening[0], opening[1], temple)) return null;
        c = openingFrame(P, alongT, up, opening[0], opening[1], temple, w.alongX, threshold);
      }
      if (!c) c = wallFace(P, look, w.alongX, s, up, w.seed, k);
      if (SHINE.has(c)) return c;
      return faded(P, lit(P, c, x, y, up, L), up, WALL);
    };
    const run = (s0: number, s1: number, opening?: readonly [number, number]): void => {
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
            return face(alongT, WALL - 1 - v, opening);
          },
          right: (u, v) => {
            const yy = y - (u + 0.5) / ISO_X;
            const up = WALL - 1 - v;
            D.depth = s1 + yy;
            const k = templeK(look, s1 + 0.2, yy);
            const c = k > 0.55 ? (up < 12 ? P.stone[up === 11 ? 2 : 0] : (up + 400) % 16 === 3 ? P.seam : P.stone[1]) : rawRock(P, false, Math.floor(yy * 32) + 900, up, w.seed + 5);
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
            const k = templeK(look, xx, s1 + 0.2);
            const c = k > 0.55 ? (up < 12 ? P.stone[up === 11 ? 4 : 2] : (up + 400) % 16 === 3 ? P.seam : P.stone[3]) : rawRock(P, true, Math.floor(xx * 32) + 700, up, w.seed + 6);
            return faded(P, lit(P, c, xx, s1 + 0.05, up, L), up, WALL);
          },
          right: (u, v, _w, _h, px, py) => {
            const alongT = s1 - (u + 0.5) / ISO_X;
            if (w.mouth && alongT > w.mouth[0] && alongT < w.mouth[1] && hole(px, py)) return null;
            D.depth = x + alongT;
            return face(alongT, WALL - 1 - v, opening);
          },
        });
      }
    };
    for (const [s0, s1] of cuts) run(s0, s1);
    for (const ar of w.arches) run(ar[0], ar[1], ar);
  }
}

/** A WALL TOWARD THE EYE, cut low as the game leaves it: its cut top rough rock in the mine, a coping of black stone in the temple. */
export function lowWall(D: Deep, look: Look, L: Lights, r: Rect, seed: number): void {
  const P = PALS[look];
  const iso = new Iso(D, PICTURE.OX, PICTURE.OY);
  const long = r.x1 - r.x0 > r.y1 - r.y0;
  iso.box(r.x0, r.y0, r.x1, r.y1, 0, LOW, {
    top: (u, v) => {
      const x = r.x0 + u * (r.x1 - r.x0);
      const y = r.y0 + v * (r.y1 - r.y0);
      D.depth = x + y + 0.5;
      const k = templeK(look, x, y);
      const a = long ? x : y;
      const across = long ? (y - r.y0) / (r.y1 - r.y0) : (x - r.x0) / (r.x1 - r.x0);
      let c: string;
      if (k > 0.55) {
        const S = P.stone;
        const fa = (((a * 2 + hash(seed, 0, 3)) % 1) + 1) % 1;
        c = fa < 0.06 || across < 0.08 ? P.seam : hash(Math.floor(a * 2), seed, 5) > 0.7 ? S[2] : S[3];
        if (c !== P.seam && (fa < 0.14 || (long ? across > 0.86 : across < 0.2))) c = S[4];
      } else {
        const n = fbm(x * 5, y * 5, seed);
        c = n > 0.62 ? P.rock[4] : n > 0.48 ? P.rock[3] : n > 0.36 ? P.rock[2] : P.seam;
      }
      return lit(P, c, x, y, LOW, L);
    },
    left: (u, v) => {
      const x = r.x0 + (u + 0.5) / ISO_X;
      D.depth = x + r.y1 + 0.5;
      const k = templeK(look, x, r.y1 - 0.5);
      const c = k > 0.55 ? (v < 1 ? P.stone[4] : v > LOW - 4 ? P.stone[1] : P.stone[v % 8 === 7 ? 0 : 2]) : rawRock(P, true, u + 300, LOW - v + 40, seed);
      return lit(P, c, x, r.y1, LOW - v, L);
    },
    right: (u, v) => {
      const y = r.y1 - (u + 0.5) / ISO_X;
      D.depth = r.x1 + y + 0.5;
      const k = templeK(look, r.x1 - 0.5, y);
      const c = k > 0.55 ? (v < 1 ? P.stone[3] : v > LOW - 4 ? P.stone[0] : P.stone[v % 8 === 7 ? 0 : 1]) : rawRock(P, false, u + 500, LOW - v + 40, seed);
      return lit(P, c, r.x1, y, LOW - v, L);
    },
  });
}

// =================================================================================================
// THE FLOOR: in the mine packed earth and grit, stones, the miners' plank walks and their rails; in the temple great black
// flags laid square, a carved border round each; between, the flags laid over the earth as the cult's work comes on; the
// rift's pink cracks in the temple's floor

/** THE RAILS: from the landing along the drift, and (A) turning to end at the threshold, a stop at their end; each piece a straight run along x or y, or a quarter turn. */
export interface RailRun { kind: 'x' | 'y'; at: number; a: number; b: number }
export const RAILS: Record<Look, { runs: RailRun[]; bend: { cx: number; cy: number; r: number; from: number; to: number } | null; stop: [number, number] | null }> = {
  threshold: { runs: [{ kind: 'y', at: 9.5, a: -3.6, b: 3.7 }, { kind: 'x', at: 4.5, a: 7.4, b: 8.7 }], bend: { cx: 3.7, cy: 8.7, r: 0.8, from: Math.PI / 2, to: 0 }, stop: [4.5, 7.35] },
  creep: { runs: [{ kind: 'y', at: 9.5, a: -3.6, b: 6.6 }], bend: null, stop: [6.6, 9.5] },
  pit: { runs: [{ kind: 'y', at: 9.5, a: -3.6, b: 3.7 }, { kind: 'x', at: -1.5, a: 0.4, b: 6.6 }], bend: null, stop: [-1.5, 0.45] },
};
/** How far across the rails a point is (0 their middle), and how far along them, or null. */
function railAt(look: Look, x: number, y: number): { off: number; s: number } | null {
  const R = RAILS[look];
  for (const r of R.runs) {
    // ('y' kind: a run along x at y = at; 'x' kind: a run along y at x = at)
    if (r.kind === 'y') {
      if (x >= r.a && x <= r.b && Math.abs(y - r.at) < 0.4) return { off: y - r.at, s: x };
    } else if (y >= r.a && y <= r.b && Math.abs(x - r.at) < 0.4) return { off: x - r.at, s: y };
  }
  if (R.bend) {
    const b = R.bend;
    const dx = x - b.cx;
    const dy = y - b.cy;
    const a = Math.atan2(dy, dx);
    const lo = Math.min(b.from, b.to);
    const hi = Math.max(b.from, b.to);
    if (a >= lo && a <= hi) {
      const rr = Math.hypot(dx, dy);
      if (Math.abs(rr - b.r) < 0.4) return { off: rr - b.r, s: a * b.r };
    }
  }
  return null;
}

/** The rails' iron: shade, body, its worn top, the shine on it. */
const RAIL = ['#141210', '#34302b', '#544c43', '#766c60'] as const;

function flagT(x: number, y: number): number {
  // great flags, a tile square, laid on the tiles' lines; a carved border round each
  const fu = x - Math.floor(x);
  const fv = y - Math.floor(y);
  const e = Math.min(fu, fv, 1 - fu, 1 - fv);
  if (e < 0.025) return -1;
  if (e < 0.06) return fu < 0.06 || 1 - fv < 0.06 ? 4 : 1;
  if (e > 0.11 && e < 0.13) return 0;
  const tone = hash(Math.floor(x), Math.floor(y), 611);
  let k = tone < 0.25 ? 1 : tone > 0.88 ? 3 : 2;
  const n = fbm(x * 5, y * 5, 613);
  if (n > 0.66) k += 1;
  if (n < 0.3) k -= 1;
  // a crack across some
  if (hash(Math.floor(x), Math.floor(y), 615) > 0.7 && Math.abs(fv - 0.5 - (fu - 0.5) * 0.7 + Math.sin(fu * 13) * 0.04) < 0.014) return -1;
  return clampK(k);
}

/** THE RIFT'S CRACKS in the temple's floor: a few jagged lines from where the rift lies in his hall, and here and there in A. */
export const FLOOR_CRACKS: Record<Look, [number, number, number, number][]> = {
  threshold: [[4.6, -7.4, 0.3, 3.2], [4.6, -7.4, 2.6, 2.6], [4.6, -7.4, -2.2, 2.4], [4.6, 3.5, -0.4, 2.2]],
  creep: [[4.6, -7.4, 0.3, 2.6], [4.6, -7.4, 2.6, 2.2]],
  pit: [[4.6, -7.4, 0.3, 3.2], [4.6, -7.4, 2.6, 2.6], [4.6, -7.4, -2.2, 2.4]],
};
function crackDist(look: Look, x: number, y: number): number {
  let best = 9;
  FLOOR_CRACKS[look].forEach(([cx, cy, a, len], i) => {
    const ux = Math.cos(a);
    const uy = Math.sin(a);
    const t = (x - cx) * ux + (y - cy) * uy;
    if (t < 0 || t > len) return;
    const nx = -(x - cx) * uy + (y - cy) * ux;
    const wob = Math.sin(t * 7 + i) * 0.06 + Math.sin(t * 17 + i * 3) * 0.03 + (hash(Math.floor(t * 8), i, 621) - 0.5) * 0.05;
    best = Math.min(best, Math.abs(nx - wob) + t / len * 0.02);
  });
  return best;
}

export function paintFloors(D: Deep, look: Look, L: Lights): void {
  const P = PALS[look];
  const iso = new Iso(D, PICTURE.OX, PICTURE.OY);
  const rooms: [Rect, number][] = [[HALL, 701], [RA, 703], [RB, 705], [RC, 707], [RD, 709], [GATE, 713], ...PASSES.map((p, i): [Rect, number] => [p, 715 + i])];
  for (const [r, seed] of rooms) {
    iso.top(r.x0, r.y0, r.x1, r.y1, 0, (u, v) => {
      const x = r.x0 + u * (r.x1 - r.x0);
      const y = r.y0 + v * (r.y1 - r.y0);
      D.depth = x + y;
      const k = templeK(look, x, y);
      const n = fbm(x * 1.6, y * 1.6, 731);
      let c: string;
      const flagged = k > 0.75 || (k > 0.25 && n < (k - 0.25) * 1.4);
      if (flagged) {
        const f = flagT(x, y);
        c = f < 0 ? P.seam : P.flags[f];
        // (where the flags give out over the earth, their edge broken, earth in the joints)
        if (k < 0.75 && n > (k - 0.25) * 1.4 - 0.08 && f >= 0) c = P.flags[Math.max(0, f - 1)];
        // the rift's cracks
        if (k > 0.95) {
          const cd = crackDist(look, x, y);
          if (cd < 0.022) return RIFT_FIRE[2];
          if (cd < 0.04) return RIFT_FIRE[0];
          if (cd < 0.09) c = mixC(c, P.rift[2], 0.4);
        }
      } else {
        // EARTH, packed, trodden; grit and little stones; darker in drifts
        const g = fbm(x * 3, y * 3, seed);
        let e = g > 0.62 ? 3 : g > 0.45 ? 2 : g > 0.32 ? 1 : 0;
        const st = hash(Math.floor(x * 14), Math.floor(y * 14), seed + 3);
        if (st > 0.93) e = 4;
        else if (st > 0.88) e = Math.max(0, e - 1);
        c = P.earth[clampK(e + 0)];
        // the trodden way, lighter and smoother, down the middle of each room
        const mid = Math.min(Math.abs(x - (r.x0 + r.x1) / 2), Math.abs(y - (r.y0 + r.y1) / 2));
        if (mid < 0.7 && g > 0.3 && g < 0.62) c = P.earth[2];
      }
      // THE RAILS: sleepers across, two iron rails on them
      const ra = railAt(look, x, y);
      if (ra && (!flagged || look === 'creep')) {
        const ao = Math.abs(ra.off);
        const sl = ((ra.s * 3.2) % 1 + 1) % 1;
        const ri = Math.abs(ao - 0.2);
        if (ri < 0.03) c = RAIL[3];
        else if (ri < 0.05) c = ao < 0.2 ? RAIL[2] : RAIL[1];
        else if (ri < 0.065) c = RAIL[0];
        else if (ao < 0.34 && sl < 0.34) c = sl < 0.07 ? P.wood[4] : sl > 0.28 ? P.wood[0] : P.wood[3];
        // (B: the flags laid over them, only their ends showing out of the joints)
        if (flagged && look === 'creep' && k > 0.55 && ri >= 0.05) c = P.flags[2];
      }
      // the floor at a far wall's foot, in its shade; grit drifted there
      const nf = Math.min(x - r.x0, y - r.y0);
      if (nf < 0.4 && !flagged && fbm(x * 4, y * 4, seed + 9) > 0.45 + nf) c = P.rock[2];
      if (nf < 0.16) c = mixC(c, P.beyond, 0.4);
      return lit(P, c, x, y, 0, L);
    });
  }
}

/** Little stones and grit scattered on the mine's floors; bones on the temple's: over the floor, under what stands. */
export function paintChips(D: Deep, look: Look, L: Lights): void {
  const P = PALS[look];
  const rooms = [HALL, RA, RB, RC, RD];
  let n = 0;
  for (const r of rooms) {
    const count = Math.round((r.x1 - r.x0) * (r.y1 - r.y0) * 3);
    for (let i = 0; i < count; i++) {
      const x = r.x0 + 0.2 + hash(i, n, 801) * (r.x1 - r.x0 - 0.4);
      const y = r.y0 + 0.2 + hash(i, n, 803) * (r.y1 - r.y0 - 0.4);
      n++;
      const [X0, Y0] = atPx(x, y);
      const X = Math.round(X0);
      const Y = Math.round(Y0);
      if (D.depthAt(X, Y) > x + y + 0.2) continue;
      D.depth = x + y + 0.01;
      const k = templeK(look, x, y);
      if (k > 0.75) {
        if (hash(i, n, 809) > 0.4) continue;
        const len = 2 + Math.floor(hash(i, n, 805) * 3);
        for (let q = 0; q < len; q++) {
          D.set(X + q, Y, lit(P, q === 0 ? P.bone[3] : P.bone[2], x, y, 1, L));
          D.set(X + q, Y + 1, mixC(P.flags[0], P.seam, 0.5));
        }
      } else {
        // a stone: lit on its upper left, its shadow under it
        const w = 2 + Math.floor(hash(i, n, 807) * 3);
        for (let q = 0; q < w; q++) {
          D.set(X + q, Y - 1, lit(P, q === 0 ? P.rock[4] : P.rock[3], x, y, 2, L));
          D.set(X + q, Y, lit(P, P.rock[1], x, y, 1, L));
          D.set(X + q, Y + 1, mixC(P.earth[0], P.seam, 0.5));
        }
      }
    }
  }
}

// =================================================================================================
// SOLIDS, MARCHED: for each pixel the line of sight is followed from the eye's side of the thing's box inward, and the first
// point inside it is what is seen. (As floor 4's: x = (t + q) / 2, y = (t - q) / 2, z = 16 t - sy, q = sx / 32; t = x + y.)

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

/** ROCK, raw and broken: a lump of the mine's rock, lumpy, its facets lit from the upper left. */
export function rock(D: Deep, look: Look, L: Lights, c: [number, number, number], r: [number, number, number], seed: number, ramp?: R5): void {
  const P = PALS[look];
  const R = ramp ?? P.rock;
  const f = (x: number, y: number, z: number): number => {
    const dx = (x - c[0]) / r[0];
    const dy = (y - c[1]) / r[1];
    const dz = (z - c[2]) / r[2];
    const n = noise(dx * 1.8 + seed, dy * 1.8 + dz * 1.4, seed) - 0.5 + (noise(dx * 4.1 + dz * 2, dy * 4.1 - seed, seed + 5) - 0.5) * 0.5;
    return dx * dx + dy * dy + dz * dz - 1 - n * 1.1;
  };
  march(D, {
    box: { x0: c[0] - r[0] * 1.3, y0: c[1] - r[1] * 1.3, z0: Math.max(-2, c[2] - r[2] * 1.3), x1: c[0] + r[0] * 1.3, y1: c[1] + r[1] * 1.3, z1: c[2] + r[2] * 1.3 },
    inside: (x, y, z) => f(x, y, z) < 0,
    shade: (x, y, z) => {
      const e = 0.04;
      const gx = (f(x + e, y, z) - f(x - e, y, z)) / (2 * e);
      const gy = (f(x, y + e, z) - f(x, y - e, z)) / (2 * e);
      const gz = (f(x, y, z + e * 32) - f(x, y, z - e * 32)) / (2 * e);
      const m = Math.hypot(gx, gy, gz) || 1;
      const nx = Math.round(gx / m);
      const ny = Math.round(gy / m);
      const nz = Math.round((gz / m) * 1.4) / 1.4;
      const nm = Math.hypot(nx, ny, nz) || 1;
      const l = (nx * -0.3 + ny * 0.45 + nz * 0.85) / nm;
      const k = l > 0.7 ? 4 : l > 0.35 ? 3 : l > 0.0 ? 2 : l > -0.35 ? 1 : 0;
      const cr = Math.abs(noise(x * 7 + seed, y * 7 + z / 9, seed + 3) - 0.5) < 0.025;
      return lit(P, cr ? R[0] : R[k], x, y, z, L, 1);
    },
  }, 0.012);
}

/** A BOX turned about the upright by `yaw` (and tipped by `roll` about its length, `pitch` across): timber, iron, stone. */
export function obox(D: Deep, look: Look, L: Lights, c: [number, number, number], half: [number, number, number], yaw: number, roll: number, ramp: R5, grain = true, pitch = 0): void {
  const cy = Math.cos(yaw);
  const sy = Math.sin(yaw);
  const cr = Math.cos(roll);
  const sr = Math.sin(roll);
  const cp = Math.cos(pitch);
  const sp = Math.sin(pitch);
  const P = PALS[look];
  const local = (x: number, y: number, z: number): [number, number, number] => {
    const dx = x - c[0];
    const dy = y - c[1];
    const dz = (z - c[2]) / 32;
    let lx = dx * cy + dy * sy;
    let ly = -dx * sy + dy * cy;
    let lz = dz;
    const lx2 = lx * cp + lz * sp;
    lz = -lx * sp + lz * cp;
    lx = lx2;
    const ly2 = ly * cr + lz * sr;
    lz = -ly * sr + lz * cr;
    ly = ly2;
    return [lx, ly, lz];
  };
  const reach = Math.hypot(half[0], half[1], half[2]);
  march(D, {
    box: { x0: c[0] - reach, y0: c[1] - reach, z0: c[2] - reach * 32, x1: c[0] + reach, y1: c[1] + reach, z1: c[2] + reach * 32 },
    inside: (x, y, z) => {
      const [lx, ly, lz] = local(x, y, z);
      return Math.abs(lx) < half[0] && Math.abs(ly) < half[1] && Math.abs(lz) < half[2];
    },
    shade: (x, y, z) => {
      const [lx, ly, lz] = local(x, y, z);
      const ex = half[0] - Math.abs(lx);
      const ey = half[1] - Math.abs(ly);
      const ez = half[2] - Math.abs(lz);
      let n: [number, number, number];
      if (ez <= ex && ez <= ey) n = [0, 0, Math.sign(lz)];
      else if (ey <= ex) n = [0, Math.sign(ly), 0];
      else n = [Math.sign(lx), 0, 0];
      let [nx, ny, nz] = n;
      const ny2 = ny * cr - nz * sr;
      nz = ny * sr + nz * cr;
      ny = ny2;
      const nx2 = nx * cp - nz * sp;
      nz = nx * sp + nz * cp;
      nx = nx2;
      const wx = nx * cy - ny * sy;
      const wy = nx * sy + ny * cy;
      const l = wx * -0.3 + wy * 0.5 + nz * 0.82;
      let k = l > 0.7 ? 3 : l > 0.3 ? 2 : l > -0.2 ? 1 : 0;
      const edge = Math.min(ex, ey, ez) < 0.02 && [ex, ey, ez].filter((v) => v < 0.03).length >= 2;
      if (edge && l > 0.3) k += 1;
      if (grain && Math.abs(((lx * 7 + hash(Math.floor(ly * 20), 1, 921) * 3) % 1) - 0.5) < 0.05) k -= 1;
      return lit(P, ramp[clampK(k)], x, y, z, L);
    },
  }, 0.01);
}

// =================================================================================================
// THE MINE'S OWN: free-standing timber sets in the rooms (two posts and a cap across the way), the miners' lanterns hung on the
// sets' posts and caps; the stop at the rails' end; the temple's own: braziers, black candles

/** A set standing across a room: its two posts and the cap from one to the other, this high. */
export interface FreeSet { a: [number, number]; b: [number, number]; h: number }
export const FREE_SETS: Record<Look, FreeSet[]> = {
  threshold: [{ a: [-3.6, 8.4], b: [0.6, 8.4], h: 74 }, { a: [-3.6, 11.5], b: [0.6, 11.5], h: 74 }, { a: [2.5, 8.2], b: [2.5, 11.6], h: 74 }, { a: [-3.6, 4.3], b: [0.5, 4.3], h: 74 }],
  creep: [{ a: [-3.6, 8.4], b: [0.6, 8.4], h: 74 }, { a: [-3.6, 11.5], b: [0.6, 11.5], h: 74 }],
  pit: [{ a: [-3.6, 8.4], b: [0.6, 8.4], h: 74 }, { a: [2.5, 8.2], b: [2.5, 11.6], h: 74 }],
};

export function paintSets(D: Deep, look: Look, L: Lights): void {
  const P = PALS[look];
  for (const st of FREE_SETS[look]) {
    for (const [x, y] of [st.a, st.b]) obox(D, look, L, [x, y, st.h / 2], [0.12, 0.12, st.h / 64], 0.02, 0, P.wood);
    const [a, b] = [st.a, st.b];
    const len = Math.hypot(b[0] - a[0], b[1] - a[1]);
    const yaw = Math.atan2(b[1] - a[1], b[0] - a[0]);
    obox(D, look, L, [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2, st.h + 6], [len / 2 + 0.22, 0.14, 6 / 32], yaw, 0, P.wood);
    for (const [x, y] of [st.a, st.b]) obox(D, look, L, [x, y, st.h - 3], [0.17, 0.13, 2 / 32], yaw, 0, P.wood, false);
  }
}

/** The miners' lanterns: where each hangs (on a set's cap, or a nail in the rock), how high. */
export const LANTERNS: Record<Look, [number, number, number][]> = {
  threshold: [[-1.6, 8.55, 60], [-1.4, 11.65, 60], [2.65, 9.9, 60], [-1.5, 4.45, 60], [-3.85, 2.5, 50], [0.5, 7.2, 50], [2.2, 11.4, 50], [6.2, 7.2, 50]],
  creep: [[-1.6, 8.55, 60], [-1.4, 11.65, 60], [-3.85, 5.0, 50], [6.2, 7.2, 50]],
  pit: [[-1.6, 8.55, 60], [2.65, 9.9, 60], [-3.85, 5.0, 50], [-3.85, 11.8, 50]],
};

export function paintLanterns(D: Deep, look: Look): void {
  const P = PALS[look];
  for (const [x, y, z] of LANTERNS[look]) {
    const [X0, Y0] = atPx(x, y, z);
    const X = Math.round(X0);
    const Y = Math.round(Y0);
    D.depth = x + y + 0.25;
    for (let j = -14; j < -9; j++) D.set(X, Y + j, P.iron[2]);
    for (let i = -3; i <= 3; i++) D.set(X + i, Y - 9 + Math.abs(i) / 2, i < 0 ? P.iron[3] : P.iron[1]);
    for (let j = -7; j < 3; j++) {
      for (let i = -3; i <= 3; i++) {
        const edge = Math.abs(i) === 3 || i === 0;
        let c: string = edge ? (i < 0 ? P.iron[3] : P.iron[1]) : EMBER[2];
        if (!edge && j > -5 && j < 1 && Math.abs(i) < 2) c = j < -2 ? '#ffe6a8' : EMBER[3];
        D.set(X + i, Y + j, c);
      }
    }
    for (let i = -3; i <= 3; i++) D.set(X + i, Y + 3, P.iron[2]);
  }
}

/** The stop at the rails' end: a beam of timber across them on two blocks. */
export function paintStop(D: Deep, look: Look, L: Lights): void {
  const at = RAILS[look].stop;
  if (!at) return;
  const P = PALS[look];
  const alongY = RAILS[look].runs.some((r) => r.kind === 'x' && Math.abs(r.at - at[0]) < 0.01);
  const yaw = alongY ? 0 : Math.PI / 2;
  obox(D, look, L, [at[0], at[1], 10], [0.36, 0.09, 4 / 32], yaw, 0, P.wood);
  for (const s of [-0.24, 0.24]) obox(D, look, L, [at[0] + (alongY ? s : 0), at[1] + (alongY ? 0 : s), 4], [0.07, 0.07, 4 / 32], yaw, 0, P.wood, false);
}

/** A BRAZIER of the cult's: a black iron bowl on three legs, its fire honest orange. */
export function brazier(D: Deep, look: Look, x: number, y: number, f = 0): void {
  const P = PALS[look];
  const [X0, Y0] = atPx(x, y);
  const X = Math.round(X0 / 2) * 2;
  const Y = Math.round(Y0);
  D.depth = x + y + 0.05;
  for (const [lx, ly] of [[-7, 0], [7, 0], [0, 3]] as const) for (let j = 0; j < 20; j++) D.set(X + lx + Math.round((lx * j) / 60), Y + ly - j, j < 2 ? P.iron[1] : lx < 0 ? P.iron[3] : P.iron[2]);
  for (let j = 0; j < 7; j++) {
    const w = 10 - Math.floor(j / 3);
    for (let i = -w; i <= w; i++) D.set(X + i, Y - 20 - (6 - j), j === 0 ? P.iron[4] : i < -w + 2 ? P.iron[3] : i > w - 2 ? P.iron[0] : P.iron[1]);
  }
  // a skull of the mark on the bowl's front
  for (let j = -4; j <= 4; j++) for (let i = -4; i <= 4; i++) {
    const m = markPx(i, -j, 4);
    if (m === 'bone') D.set(X + i, Y - 23 + j, P.iron[3]);
  }
  for (let i = -9; i <= 9; i++) D.set(X + i, Y - 27, (i + 9 + f) % 3 ? EMBER[1] : EMBER[0]);
  for (let j = 0; j < 15; j++) {
    const w = Math.max(0, Math.round(6.5 * (1 - j / 15) + Math.sin(j * 1.7 + f) * 1.2));
    for (let i = -w; i <= w; i++) D.set(X + i + Math.round(Math.sin(j * 0.6 + f) * 1.5), Y - 28 - j, j < 3 ? EMBER[2] : Math.abs(i) < w * 0.4 ? (j < 8 ? '#ffe6a8' : EMBER[3]) : j < 9 ? EMBER[3] : EMBER[2]);
  }
}
export const BRAZIERS: Record<Look, [number, number][]> = {
  threshold: [[2.6, 1.55], [6.5, 1.55], [2.55, 5.6], [0.6, -8.3], [8.3, -8.3], [2.2, -1.0], [6.9, -1.0], [3.6, 6.3], [5.5, 6.3]],
  creep: [[2.6, 1.55], [6.5, 1.55], [0.6, -8.3], [8.3, -8.3], [2.2, -1.0], [6.9, -1.0]],
  pit: [[2.6, 1.55], [6.5, 1.55], [8.3, -8.3], [2.2, -1.0], [6.9, -1.0], [8.3, -4.5]],
};

/** The cult's black candles in clusters on the floor (B: where their work is coming on). */
export const CANDLES: Record<Look, [number, number, number][]> = {
  threshold: [],
  creep: [[-3.5, 1.5, 5], [0.4, 1.5, 4], [-3.5, 5.4, 4], [2.5, 7.5, 5], [6.4, 7.5, 4], [2.5, 11.4, 3], [3.0, 1.4, 6], [6.3, 5.6, 5], [0.3, -9.4, 7], [8.4, -9.4, 7]],
  pit: [],
};
export function paintCandles(D: Deep, look: Look): void {
  const P = PALS[look];
  CANDLES[look].forEach(([cx, cy, n], ci) => {
    const sticks: [number, number, number][] = [];
    for (let i = 0; i < n; i++) {
      const a = hash(ci, i, 951) * Math.PI * 2;
      const r = Math.sqrt(hash(ci, i, 953)) * 0.26;
      sticks.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r, 6 + Math.floor(hash(ci, i, 955) * 12)]);
    }
    sticks.sort((p, q) => p[0] + p[1] - (q[0] + q[1]));
    for (const [x, y, h] of sticks) {
      const [X0, Y0] = atPx(x, y);
      const X = Math.round(X0 / 2) * 2;
      const Y = Math.round(Y0);
      D.depth = x + y + 0.01;
      // black candles (the cult's): three pixels wide, lit on their left
      for (let j = 0; j < h; j++) {
        D.set(X - 1, Y - j, P.iron[3]);
        D.set(X, Y - j, P.iron[2]);
        D.set(X + 1, Y - j, P.iron[0]);
      }
      for (let j = 0; j < 4; j++) for (let i = 0; i < 2; i++) {
        const f = flamePx(i, j, Math.floor(x * 31 + y * 17));
        if (f) D.set(X - 1 + i, Y - h - 4 + j, f);
      }
    }
  });
}

// =================================================================================================
// THE GATE OF HIS OWN, in the temple's dress, in the boss's doorway: BATTERED PYLONS of the black worked stone (leaning in as
// they rise), A LINTEL whose underside is cut into a row of fangs hanging over the way; over it the stone gives out to THE RAW
// ROCK of the mine, unhewn, and carved out of the rock THE SHRIEKING SKULL, the cult's mark, great, its jaw dropped wide, the
// enemy's fire dull and low in its sockets and mouth (never in rings); a cracked band of the rift's pink running up out of the
// lintel into its mouth; THE DROP at the back of the way, drawn up: bars of black iron hooked at their ends like a jaw's teeth.
// An original design, built as the game's boss gates are: the three tiles of the way between two pillars (art/gates.ts: SPAN
// 96, PILLAR 12); painted slice by slice through the wall's thickness, so that its inner side reads through the way.

const PILLAR = 12;
export const GATE_W = 96 + PILLAR * 2;
/** The lintel: its underside (over the way), its top. */
export const LINTEL = { under: 92, top: 112 };
/** The fangs hanging from the lintel's underside, how far. */
export const FANG = 10;
/** The skull over it: its middle's height, its half width. */
export const SKULL = { z: 148, r: 30 };
/** The rock's crest over the gate: its highest point. */
export const GATE_PEAK = 198;
/** Where the drop's points hang, drawn up (picture pixels over the floor). */
export const GATE_LIFT = 80;
/** His mark's place in the world: at the middle of the way, in the gate's face. */
export const MARK_AT: [number, number, number] = [(GATE.x0 + GATE.x1) / 2, GATE.y1, SKULL.z];

/** The gate's face at a point: `u` across from the outer edge of the left pillar, `up` over the floor. Null: the way through, or the air. */
export function gateFace(P: Pal, u: number, up: number, front: boolean): string | null {
  const S = P.stone;
  const R = P.rock;
  const mid = GATE_W / 2;
  const du = u + 0.5 - mid;
  const a = Math.abs(du);
  // THE WAY, under the fangs
  if (a < 48 && up < LINTEL.under) {
    // the fangs, a row of them hanging, long and short
    if (front && up >= LINTEL.under - FANG) {
      const i = Math.floor((du + 48) / 12);
      const fx = (du + 48) % 12 - 6;
      const len = i % 2 ? FANG * 0.6 : FANG;
      const from = LINTEL.under - up;
      if (from < len) {
        const half = 4.6 * (1 - from / len) + 0.4;
        if (Math.abs(fx) < half) return fx < -half + 1.5 ? S[4] : fx < 0 ? S[3] : S[1];
      }
    }
    return null;
  }
  // THE PYLONS: battered, leaning in as they rise (their outer edges), to the lintel
  const lean = (up / LINTEL.top) * 5;
  if (up < LINTEL.under) {
    if (u < lean - 0.5 || u >= GATE_W - lean + 0.5) return null;
    if (!front) return up % 16 === 15 ? P.seam : S[1];
    const pu = u < mid ? u - lean : GATE_W - lean - u;
    if (up < 10) return up === 9 ? S[4] : up < 2 ? S[1] : S[2];
    // its courses, its edge toward the light lit
    if ((up - 10) % 18 === 17) return P.seam;
    if (u < mid && pu < 1.5) return S[4];
    if (u >= mid && pu < 1.5) return S[1];
    // a strip down its middle: a channel cut in it
    if (Math.abs(pu - 6) < 1) return u < mid ? S[1] : S[0];
    return u < mid ? S[3] : S[2];
  }
  // THE LINTEL: a single great slab
  if (up < LINTEL.top) {
    if (u < lean - 0.5 || u >= GATE_W - lean + 0.5) return null;
    if (!front) return S[1];
    if (up === LINTEL.top - 1) return S[4];
    if (up === LINTEL.under) return P.seam;
    if (up === LINTEL.top - 3 || up === LINTEL.under + 3) return S[1];
    // its band carved with notches
    if (up > LINTEL.under + 3 && up < LINTEL.top - 3 && Math.abs(((du + 400) % 10) - 5) < 1) return S[1];
    return S[3];
  }
  // OVER IT: THE RAW ROCK, its outline ragged, rising to a crest over the middle; THE SKULL carved out of it
  const crest = LINTEL.top + 6 + (GATE_PEAK - LINTEL.top - 6) * Math.max(0, 1 - Math.pow(a / (mid + 4), 1.3)) + (noise(du / 5, 3, 51) - 0.5) * 18 + (hash(Math.floor(du / 9), 1, 53) > 0.7 ? 8 : 0);
  if (up > crest || a > mid - lean + 4) return null;
  if (!front) return up > crest - 2 ? null : R[1];
  // the skull
  const j = up + 0.5 - SKULL.z;
  const m = shriekAt(du / SKULL.r, j / SKULL.r);
  if (m) {
    if (m === 'dark') {
      // the enemy's fire, dull and low in its sockets and mouth, in embers (never in rings)
      const inMouth = j < -0.24 * SKULL.r;
      const lowIn = inMouth ? j < -0.86 * SKULL.r : j < 0.2 * SKULL.r - 2;
      const ember = hash(Math.floor(du + 60), Math.floor(up), 977);
      if (lowIn) return ember < 0.6 ? RIFT_FIRE[1] : RIFT_FIRE[0];
      if (inMouth && j < -0.7 * SKULL.r) return ember < 0.35 ? RIFT_FIRE[0] : P.beyond;
      return P.beyond;
    }
    // (carved bone-white out of the black rock: relief lit toward the upper left)
    const edgeUL = !shriekAt((du - 1.5) / SKULL.r, (j + 1.5) / SKULL.r);
    const edgeLR = !shriekAt((du + 1.5) / SKULL.r, (j - 1.5) / SKULL.r);
    const B = P.bone;
    if (edgeUL) return B[3];
    if (edgeLR) return B[0];
    // (cracks in the old carving)
    if (Math.abs(noise(du / 5, j / 5, 61) - 0.5) < 0.03) return B[0];
    return a < SKULL.r * 0.3 && j > 0 ? B[2] : B[1];
  }
  // round the skull, a halo of the rock cut back, dark
  if (shriekAt(du / (SKULL.r + 4), j / (SKULL.r + 4))) return P.seam;
  // the rock: faceted, lit from the upper left
  const rk = rawRock(P, true, Math.floor(du + 300), up, 53);
  if (up > crest - 2) return R[4];
  return rk;
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
  const top = GATE_PEAK + 12;
  for (let s = 0; ; s++) {
    const y = yBack + s / ISO_X;
    if (y > yFront + 1e-6) break;
    const front = y + 1 / ISO_X > yFront + 1e-6;
    if (Math.abs(y - ySlot) < 0.5 / ISO_X) paintDrop(D, iso, P, x0, x1, y, L);
    iso.left(x0, x1, y, 0, top, (u, v) => {
      const up = top - 1 - v;
      if (u >= GATE_W) return null;
      const c = gateFace(P, u, up, front);
      if (!c) return null;
      const x = x0 + (u + 0.5) / ISO_X;
      D.depth = x + y;
      if (SHINE.has(c)) return c;
      return lit(P, c, x, y + 0.1, up, L, front ? 0 : 1);
    });
  }
}
/** THE DROP drawn up into its slot: bars of black iron every twelve, a strap across, their ends hooked like a jaw's teeth. */
function paintDrop(D: Deep, iso: Iso, P: Pal, x0: number, x1: number, y: number, L: Lights): void {
  const I = P.iron;
  iso.left(x0, x1, y, 0, LINTEL.under, (u, v) => {
    const up = LINTEL.under - 1 - v;
    if (u < PILLAR || u >= GATE_W - PILLAR) return null;
    if (up < GATE_LIFT) return null;
    const x = x0 + (u + 0.5) / ISO_X;
    D.depth = x + y;
    const b = (u - PILLAR + 400) % 12;
    const h = up - GATE_LIFT;
    if (h >= 4 && h < 7) return lit(P, h === 6 ? I[4] : h === 4 ? I[0] : I[2], x, y, up, L, 1);
    // the bars, their ends hooked toward the way's middle
    const hook = h < 4 ? (u < GATE_W / 2 ? 1 : -1) * (4 - h) * 0.8 : 0;
    if (Math.abs(b - 6 - hook) <= (h < 2 ? 1 : 1.6)) return lit(P, b - hook < 6 ? I[4] : I[2], x, y, up, L, 1);
    return null;
  });
}

// =================================================================================================
// LOOK C: THE OPEN PIT beside the rooms (beyond the shrine gallery's back and the hall's left side): its far sides cut in
// benches (ledges) stepping down into the dark, the mine's timber and fires on the upper ones, the temple's carved fronts in
// the lower, and far below the rift glowing up. Its near edges a parapet of rough rock where the walls would be.

export const PIT: Rect = { x0: -12, y0: -13, x1: -1, y1: 1 };
/** The walls whose stretch over the pit is a parapet (C's back, along x at y = 1; the hall's left, along y at x = -1). */
export const PIT_RIMS: readonly { alongX: boolean; at: number }[] = [{ alongX: true, at: 1 }, { alongX: false, at: -1 }];
/** The benches: each a step down and in. */
export const BENCH = { h: 56, step: 0.9, n: 5 };

/** The pit's floor height at a point (0 the rooms' floor), or null outside it. */
function pitZ(x: number, y: number): number | null {
  if (x < PIT.x0 || y < PIT.y0) return null;
  // (in from the far sides: each bench a step further in and lower)
  const din = Math.min(x - PIT.x0, y - PIT.y0);
  const i = Math.floor(din / BENCH.step);
  if (i >= BENCH.n) return -BENCH.h * BENCH.n - 400;
  return -BENCH.h * (i + 1);
}

/** Whether a point down in the pit is seen: its line of sight up to the eye leaves the pit through its open mouth, not through the ground under the rooms. */
export function pitSeen(x: number, y: number, z: number): boolean {
  if (z >= 0) return true;
  const dt = -z / 16;
  return x + dt / 2 < PIT.x1 && y + dt / 2 < PIT.y1;
}

export function paintPit(D: Deep, look: Look, L: Lights): void {
  if (look !== 'pit') return;
  const P = PALS[look];
  const iso = new Iso(D, PICTURE.OX, PICTURE.OY);
  // THE BENCHES' FACES: for bench i, a face along x at y = y0 + i * step (facing +y, lit) and along y at x = x0 + i * step (facing +x)
  for (let i = 0; i <= BENCH.n; i++) {
    // (the topmost rises on above the rooms' floor into the dark, as the game's walls do)
    const zTop = i === 0 ? WALL : -BENCH.h * i;
    const zBot = i === BENCH.n ? -BENCH.h * i - 420 : -BENCH.h * (i + 1);
    const yF = PIT.y0 + i * BENCH.step;
    const xF = PIT.x0 + i * BENCH.step;
    const deepK = i / BENCH.n;
    const benchFace = (lit0: boolean, s: number, z: number, x: number, y: number, seed: number): string => {
      const up = z - zBot;
      let c: string;
      // the upper benches the mine's (timber sets), the lower the temple's carved fronts; the lowest the rift's light
      if (i <= 1) c = mineFace(P, lit0, s, i === 0 ? up : Math.min(up, 60), seed, i === 0 ? up < 62 + 0 : up < 62);
      else c = i === 2 ? (hash(Math.floor(s / 128), i, 301) < 0.5 ? templeFace(P, lit0, s, up, seed, 1) : rawRock(P, lit0, s, up, seed)) : templeFace(P, lit0, s, up, seed, 1);
      // (great carved fronts on bench 3: tall doorways into the dark)
      if (i >= 3) {
        const dd = ((s % 160) + 160) % 160 - 80;
        if (Math.abs(dd) < 14 && up < 44) return P.beyond;
        if (Math.abs(dd) < 18 && up < 48) return P.stone[lit0 ? 4 : 3];
      }
      if (SHINE.has(c)) return c;
      // the rift's glow from below, up the faces, stronger the deeper
      const glow = Math.max(0, deepK * 1.2 - 0.1 + (1 - up / BENCH.h) * 0.25 * (i > 1 ? 1 : 0));
      c = lit(P, c, x, y, z, L);
      if (glow > 0) c = mixC(c, P.rift[glow > 0.85 ? 2 : glow > 0.5 ? 1 : 0], Math.min(0.42, glow * 0.38));
      // (the topmost into the dark; every bench a little darker toward its top, the dark of the pit between)
      if (i === 0) c = faded(P, mixC(c, P.beyond, 0.42), z, WALL);
      return c;
    };
    // along x (facing +y)
    iso.left(xF, PIT.x1, yF, zBot, zTop, (u, v) => {
      const x = xF + (u + 0.5) / ISO_X;
      const z = zTop - v - 1;
      if (!pitSeen(x, yF, z)) return null;
      D.depth = x + yF - 0.5;
      return benchFace(true, Math.floor(x * 32), z, x, yF, 311 + i);
    });
    // along y (facing +x)
    iso.right(xF, yF, PIT.y1, zBot, zTop, (u, v) => {
      const y = PIT.y1 - (u + 0.5) / ISO_X;
      const z = zTop - v - 1;
      if (!pitSeen(xF, y, z)) return null;
      D.depth = xF + y - 0.5;
      return benchFace(false, Math.floor(-y * 32), z, xF, y, 331 + i);
    });
    // THE BENCH'S TOP (the ledge): rubble and earth, a rail of timber at its lip on the upper ones
    if (i < BENCH.n) {
      const y0 = yF;
      const x0 = xF;
      const zT = -BENCH.h * (i + 1);
      // two strips: along x (y from y0 to y0+step) and along y
      const strips: Rect[] = [{ x0: x0, y0: y0, x1: PIT.x1, y1: y0 + BENCH.step }, { x0: x0, y0: y0 + BENCH.step, x1: x0 + BENCH.step, y1: PIT.y1 }];
      for (const r of strips) {
        iso.top(r.x0, r.y0, r.x1, r.y1, zT, (u, v) => {
          const x = r.x0 + u * (r.x1 - r.x0);
          const y = r.y0 + v * (r.y1 - r.y0);
          if (!pitSeen(x, y, zT)) return null;
          D.depth = x + y - 0.5;
          const n = fbm(x * 4, y * 4, 341 + i);
          let c = n > 0.6 ? P.earth[3] : n > 0.42 ? P.earth[2] : P.earth[1];
          if (i >= 2) c = n > 0.55 ? P.flags[2] : P.flags[1];
          // the lip, lit
          const lip = Math.min(r.x1 === PIT.x1 ? y0 + BENCH.step - y : 9, r.y1 === PIT.y1 ? x0 + BENCH.step - x : 9);
          if (lip < 0.06) c = i >= 2 ? P.stone[4] : P.rock[4];
          c = lit(P, c, x, y, zT, L);
          const glow = (i + 1) / BENCH.n;
          return mixC(c, P.rift[glow > 0.7 ? 2 : glow > 0.4 ? 1 : 0], Math.min(0.5, glow * 0.4));
        });
      }
    }
  }
  // THE MINE'S FIRES on the upper ledges and the temple's braziers on the lower: fire baskets on poles
  for (const [x, y, z, big] of PIT_FIRES) {
    if (!pitSeen(x, y, z + 30)) continue;
    const [X0, Y0] = atPx(x, y, z);
    const X = Math.round(X0 / 2) * 2;
    const Y = Math.round(Y0);
    D.depth = x + y - 0.4;
    const pole = big ? 24 : 16;
    for (let j = 0; j < pole; j++) D.set(X, Y - j, P.iron[j < 2 ? 1 : 2]).set(X + 1, Y - j, P.iron[0]);
    for (let i = -4; i <= 4; i++) D.set(X + i, Y - pole, P.iron[3]).set(X + i, Y - pole - 1, P.iron[2]);
    for (let j = 0; j < (big ? 12 : 8); j++) {
      const w = Math.max(0, Math.round((big ? 4.5 : 3.5) * (1 - j / (big ? 12 : 8)) + Math.sin(j * 1.9 + x) * 0.8));
      for (let i = -w; i <= w; i++) D.set(X + i, Y - pole - 2 - j, j < 2 ? EMBER[2] : Math.abs(i) < w * 0.5 && j < 6 ? '#ffe6a8' : EMBER[3]);
    }
  }
}
/** The fires on the pit's ledges: where (x, y on its bench, the bench's top z), big or small. */
export const PIT_FIRES: readonly [number, number, number, boolean][] = [
  [-6.0, -12.55, -56, false], [-11.55, -5.5, -56, false],
  [-6.2, -11.65, -112, true], [-10.65, -6.0, -112, true], [-2.6, -10.75, -168, true], [-9.75, -1.9, -168, true],
];

/** THE PIT'S PARAPET: the walls' stretches over the pit cut to a rough wall of stacked rock, a timber rail on posts along it. */
export function paintParapets(D: Deep, look: Look, L: Lights): void {
  if (look !== 'pit') return;
  const P = PALS[look];
  const iso = new Iso(D, PICTURE.OX, PICTURE.OY);
  const H = 18;
  const runs: Rect[] = [{ x0: -5, y0: 0, x1: 1, y1: 1 }, { x0: -2, y0: -10, x1: -1, y1: 0 }, { x0: -2, y0: -11, x1: 10, y1: -10 }];
  runs.forEach((r, ri) => {
    if (ri === 2) return;
    iso.box(r.x0, r.y0, r.x1, r.y1, 0, H, {
      top: (u, v) => {
        const x = r.x0 + u * (r.x1 - r.x0);
        const y = r.y0 + v * (r.y1 - r.y0);
        D.depth = x + y + 0.3;
        const n = fbm(x * 5, y * 5, 361 + ri);
        return lit(P, n > 0.6 ? P.rock[4] : n > 0.45 ? P.rock[3] : n > 0.33 ? P.rock[2] : P.seam, x, y, H, L);
      },
      left: (u, v) => {
        const x = r.x0 + (u + 0.5) / ISO_X;
        D.depth = x + r.y1 + 0.3;
        return lit(P, rawRock(P, true, u + 1200, H - v + 30, 363 + ri), x, r.y1, H - v, L);
      },
      right: (u, v) => {
        const y = r.y1 - (u + 0.5) / ISO_X;
        D.depth = r.x1 + y + 0.3;
        return lit(P, rawRock(P, false, u + 1400, H - v + 30, 365 + ri), r.x1, y, H - v, L);
      },
    });
  });
  // the timber rail on posts along the parapet's top
  for (let x = -4.6; x <= 0.6; x += 1.3) obox(D, look, L, [x, 0.5, H + 12], [0.06, 0.06, 12 / 32], 0, 0, P.wood, false);
  obox(D, look, L, [-2.0, 0.5, H + 22], [2.7, 0.05, 2 / 32], 0, 0, P.wood);
  for (let y = -9.6; y <= -0.4; y += 1.3) obox(D, look, L, [-1.5, y, H + 12], [0.06, 0.06, 12 / 32], 0, 0, P.wood, false);
  obox(D, look, L, [-1.5, -5.0, H + 22], [0.05, 4.7, 2 / 32], 0, 0, P.wood);
}

/** The pit's own light: the rift's glow along its near rims (from below), and its fires. */
export function pitLights(look: Look): { lamps: Lamp[]; patches: Patch[] } {
  if (look !== 'pit') return { lamps: [], patches: [] };
  const lamps: Lamp[] = PIT_FIRES.map(([x, y, z, big]) => ({ x: x + 0.4, y: y + 0.4, z: z + 30, r: big ? 2.0 : 1.5, k: 3, kind: 'warm' as const }));
  const patches: Patch[] = [
    { x0: -9, y0: -10, x1: -3, y1: -3, z: -330, r: 3.4, k: 3, kind: 'rift' },
  ];
  return { lamps, patches };
}

// =================================================================================================
// EVERY LIGHT OF A LOOK, the hero's pool with them

export function lightsOf(look: Look, heroAt: [number, number]): Lights {
  const lamps: Lamp[] = [];
  const patches: Patch[] = [];
  for (const [x, y, z] of LANTERNS[look]) lamps.push({ x: x + 0.2, y: y + 0.2, z: z - 4, r: 2.1, k: 3, kind: 'warm' });
  for (const [x, y] of BRAZIERS[look]) lamps.push({ x, y, z: 30, r: 1.9, k: 3, kind: 'warm' });
  for (const [x, y, n] of CANDLES[look]) lamps.push({ x, y, z: 12, r: 0.9 + n * 0.08, k: 3, kind: 'warm' });
  // THE RIFT in his hall (the floor's own piece) and its cracks: the enemy's deep pink, dulled
  lamps.push({ x: 4.6, y: -7.4, z: 10, r: look === 'creep' ? 2.4 : 3.0, k: 3, kind: 'rift' });
  if (look !== 'creep') {
    // (A and C: the temple's walls' cracks glow a little round them; the antechamber's floor crack)
    lamps.push({ x: 4.4, y: 4.4, z: 4, r: 1.4, k: 2, kind: 'rift' });
    lamps.push({ x: 0.5, y: -4.0, z: 20, r: 2.0, k: 2, kind: 'rift' });
  }
  const pit = pitLights(look);
  lamps.push(...pit.lamps);
  patches.push(...pit.patches);
  lamps.push({ x: heroAt[0], y: heroAt[1], z: 20, r: 1.7, k: 2, kind: 'pool' });
  return { lamps, patches };
}

/** The rift's cracks in the temple's walls, each a place in the world (its foot's middle, its top), as `wallFace` paints them. */
export function wallCracks(look: Look): { x: number; y: number; top: number }[] {
  const out: { x: number; y: number; top: number }[] = [];
  for (const w of WALLS) {
    if (look === 'pit' && PIT_RIMS.some((r) => r.alongX === w.alongX && r.at === w.at)) continue;
    for (let c = Math.floor((w.a * ISO_X + 20) / 120) - 1; c <= Math.ceil((w.b * ISO_X + 20) / 120); c++) {
      if (hash(c, w.seed, 91) > 0.5) continue;
      const x0 = c * 120 + 30 + hash(c, w.seed, 93) * 50;
      const top = 30 + hash(c, w.seed, 95) * 40;
      const along = x0 / ISO_X;
      if (along < w.a || along > w.b) continue;
      const [x, y] = w.alongX ? [along, w.at + 0.05] : [w.at + 0.05, along];
      if (templeK(look, x, y) <= 0.95) continue;
      if (look === 'creep' && w.seed !== 11) continue;
      out.push({ x, y, top });
    }
  }
  return out;
}

/** Where the enemy's pink may be seen (the test's): the rift and its cracks, his gate's skull, and him; in picture pixels from the world. */
export function pinkPlaces(look: Look): { at: [number, number, number]; rx: number; ry: number }[] {
  const out: { at: [number, number, number]; rx: number; ry: number }[] = [];
  out.push({ at: [MARK_AT[0], MARK_AT[1], MARK_AT[2] - 10], rx: 50, ry: 64 });
  out.push({ at: [4.6, -7.4, 10], rx: 130, ry: 90 });
  out.push({ at: [BOSS_AT[0], BOSS_AT[1], 40], rx: 110, ry: 140 });
  for (const c of wallCracks(look)) out.push({ at: [c.x, c.y, c.top / 2], rx: 16, ry: c.top / 2 + 12 });
  if (look === 'threshold') {
    // (the marks at the heads of A's two thresholds: the enemy's pink dull in their eyes)
    out.push({ at: [4.5, 7, THRESH.markZ], rx: 16, ry: 14 });
    out.push({ at: [2, 3.5, THRESH.markZ], rx: 16, ry: 14 });
  }
  for (const [cx, cy, a, len] of FLOOR_CRACKS[look]) {
    for (let t = 0; t <= len; t += 0.5) out.push({ at: [cx + Math.cos(a) * t, cy + Math.sin(a) * t, 0], rx: 26, ry: 16 });
  }
  return out;
}
