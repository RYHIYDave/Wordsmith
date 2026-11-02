// THE AMALGAMATION'S FLOOR, A PLACE OF ITS OWN: THE BURIED CHAPEL OF BONES, the painting (the art chat, 2 Nov 2026). A MOCK-UP;
// NOTHING OF THE GAME IMPORTS IT.
//
// His words, 1 Nov 2026, 10:29: “I think we need to redo the art for a couple of the other early levels as well.  Floor 1 and
// 2 are probably fine.  But I think we’ve outgrown the 1-5 “just make it more dirt as you get lower” plan”. Read (told him
// so): floors 3, 4 and 5 each a place of their own (floor, walls, colours, light) built round its boss; the pieces he already
// said yes to come along. His pick for floor 4: “Buried chapel of bones”, offered as: a sunken church turned ossuary: pillars
// and vaults, the dead stacked in its niches. Of the bosses' gates: “Its own arch, and we’ll need new ones for the other new
// levels as well”.
//
// So: floor 4 laid as the main chat lays it, COMBO (game/dungeon.ts, CRYPT_KINDS): tight rooms you find your way through. Here
// four small chapels in a square, each opening on two others by a round arch, so that there are two ways from the way in to
// the boss's door; the boss's door in the far wall of the last, with A GATE OF ITS OWN in the chapel's stone and bone; and
// beyond it THE AMALGAMATION'S HALL, the old church's choir, its dais at the back, the stretch of its wall where the dead are
// stacked floor to top (where it gives way to the cave to floor 5 once he falls: art/cave4.ts, his yes). The walls: the chapel's
// stone, a pilaster every two tiles with the ribs of the vault springing from it into the dark, and between them TWO TIERS OF
// NICHES with the dead stacked in them, their long bones' ends out and their skulls in a row on top. The floors: worn flags,
// grave slabs, bone dust. THREE LOOKS:
//   A, CANDLELIT: candles in every niche and in clusters on the floor; warm candle gold on pale bone and grey stone.
//   B, THE EARTH BREAKING IN: the mine's rock bursting through the walls, timber props shoring it, lanterns, broken pews.
//   C, COLD AND GRAND: tall pillars rising out of the walls and ribbed vaults lost in the dark above; grey light falling from a
//      broken shaft; the dead stacked in rows along the walls.
//
// His art rulebook kept: crisp pixels, two to a game pixel; one camera; light from the upper left, a face turned to screen-left
// lit, one turned right in shade; the walls toward the eye cut low, as the game leaves them; the tops of the walls fading into
// the dark, as the game's; a dark base, the place a step quieter than the figures; fire an honest orange-gold; nothing cyan
// (the friend's), nothing pink but the enemy's own (the maw on his gate, and him). No cross, no skull over crossed bones, no
// carved words (floor 4's own rule).
//
// Measures as the game's (art/isokit.ts): picture pixels; a tile 64 x 32 on the screen; heights up, in picture pixels. Painted
// with a DEPTH for every pixel (x + y of the world point seen there: the larger, the nearer the eye), so that walls, solids
// and the figures stand in front of one another as they do in the world.

import { Px } from '../engine/px';
import { Iso, ISO_X } from '../art/isokit';
import { hash } from '../art/kit';
import { EMBER } from '../art/props';

export type Look = 'candle' | 'breach' | 'cold';
export const LOOKS: Look[] = ['candle', 'breach', 'cold'];
/** The letter he picks by, and the picture's name. */
export const LETTER: Record<Look, string> = { candle: 'a', breach: 'b', cold: 'c' };
export const FILE: Record<Look, string> = { candle: 'a_candlelit', breach: 'b_earth_breaking_in', cold: 'c_cold_and_grand' };
/** Each look in a line, for him. */
export const CAPTION: Record<Look, string> = {
  candle: 'A. Candlelit chapel: candles in every niche and on the floor, warm gold on pale bone and grey stone.',
  breach: "B. The earth breaking in: the mine's rock bursting through, timber props, lanterns, broken pews.",
  cold: 'C. Cold and grand: tall pillars and vaults lost in the dark, grey light down a broken shaft, the dead in rows.',
};

/** Five tones of a material: its seam, its shade, its body, its light, its lit edge. */
export type R5 = readonly [string, string, string, string, string];
type R3 = readonly [string, string, string];

export interface Pal {
  /** The chapel's stone (its walls, its pillars). */
  stone: R5;
  /** Its floor's flags, and the grave slabs let into it. */
  flags: R5;
  slab: R5;
  /** The dead's bone. */
  bone: R5;
  /** Iron, wood, the mine's raw rock, earth. */
  iron: R5;
  wood: R5;
  rock: R5;
  earth: R5;
  /** Bone dust: its shade, body, light. */
  dust: R3;
  /** Candle wax: its shade and its light. */
  wax: readonly [string, string];
  seam: string;
  beyond: string;
  /** Fire's light in three bands (outer to inner), and how far each goes toward it. */
  warm: R3;
  warmK: readonly [number, number, number];
  /** The cold grey light down the shaft (look C), or none. */
  cold: R3 | null;
  coldK: readonly [number, number, number];
  /** The hero's own pool of light. */
  pool: string;
}

export const PALS: Record<Look, Pal> = {
  // CANDLELIT: a cool grey stone, so that the candles' gold is the warmth; bone pale ivory
  candle: {
    stone: ['#111015', '#1f1d25', '#2c2a33', '#3c3944', '#55515e'],
    flags: ['#0f0e12', '#1b1a20', '#26242c', '#33303a', '#47434f'],
    slab: ['#121116', '#201e26', '#2d2a34', '#3c3844', '#534e5c'],
    bone: ['#1b1717', '#332c29', '#53493f', '#706352', '#8e7f69'],
    iron: ['#0b0a0d', '#17151a', '#242128', '#35313a', '#524c56'],
    wood: ['#150f0d', '#251a15', '#38281e', '#4c3727', '#634a34'],
    rock: ['#100d0d', '#1d1817', '#2a2321', '#3a302c', '#4f433d'],
    earth: ['#0e0b0b', '#1a1514', '#251e1c', '#312825', '#3f3430'],
    dust: ['#2a2522', '#3a332e', '#4c443c'],
    wax: ['#8c7c62', '#c8b694'],
    seam: '#0a090d',
    beyond: '#060508',
    warm: ['#4c3218', '#9a682a', '#dca44a'],
    warmK: [0.16, 0.27, 0.38],
    cold: null,
    coldK: [0, 0, 0],
    pool: '#5c5660',
  },
  // THE EARTH BREAKING IN: a darker stone, dirtied; the mine's brown rock and earth; old timber; bone a dull grey-lavender
  breach: {
    stone: ['#0e0e11', '#1a1a1f', '#25252b', '#323239', '#47464f'],
    flags: ['#0d0d10', '#18181c', '#222227', '#2e2d33', '#413f47'],
    slab: ['#0f0f12', '#1b1b20', '#26262c', '#33323a', '#47454f'],
    bone: ['#16141c', '#29253a', '#433d54', '#5a536c', '#6e6782'],
    iron: ['#0a0a0c', '#161518', '#222024', '#312e33', '#4a464c'],
    wood: ['#150e0a', '#281b12', '#3b2a1b', '#503a25', '#684d31'],
    rock: ['#0f0c0b', '#1e1916', '#2c2521', '#3c332d', '#53483f'],
    earth: ['#0e0a09', '#19120f', '#231a15', '#2f231c', '#3c2d24'],
    dust: ['#221f24', '#2f2b32', '#3e3942'],
    wax: ['#6e6452', '#9a8e74'],
    seam: '#09090c',
    beyond: '#050506',
    warm: ['#542410', '#9a4a1c', '#e07e30'],
    warmK: [0.2, 0.34, 0.46],
    cold: null,
    coldK: [0, 0, 0],
    pool: '#4e4a52',
  },
  // COLD AND GRAND: a cold blue-grey stone; bone a pale grey-lavender; a flat cold light down the shaft, grey, never cyan
  cold: {
    stone: ['#0d0e13', '#191b23', '#242731', '#323642', '#4a4f5e'],
    flags: ['#0c0d11', '#17191f', '#21242c', '#2d3039', '#41454f'],
    slab: ['#0e0f14', '#1a1c24', '#252832', '#333744', '#4a4f5f'],
    bone: ['#16151d', '#2b2936', '#46435a', '#605c76', '#7c7792'],
    iron: ['#0a0a0d', '#15161a', '#202227', '#2e3037', '#474a54'],
    wood: ['#130f0e', '#221b19', '#332825', '#463733', '#5c4945'],
    rock: ['#0e0e11', '#1b1b20', '#28282e', '#36363e', '#4b4b55'],
    earth: ['#0d0d10', '#18181c', '#222227', '#2d2d33', '#3a3a41'],
    dust: ['#25252e', '#33333e', '#45454f'],
    wax: ['#5e5a62', '#8a8590'],
    seam: '#08090c',
    beyond: '#040507',
    warm: ['#542410', '#9a4a1c', '#e07e30'],
    warmK: [0.2, 0.34, 0.46],
    cold: ['#2c2e3a', '#4e5262', '#7e8292'],
    coldK: [0.22, 0.36, 0.5],
    pool: '#565a66',
  },
};

// =================================================================================================
// THE PLACE, in tiles (x down the screen to the right, y down to the left, as the game's): floor 4 laid COMBO, four small
// chapels in a square, two ways round from the way in (bottom left) to the boss's door (top right), and his hall beyond

export interface Rect { x0: number; y0: number; x1: number; y1: number }
/** The Amalgamation's hall: the old church's choir. */
export const HALL: Rect = { x0: -1, y0: -10, x1: 9, y1: 0 };
/** The boss's doorway: three tiles of the hall's near wall (the row y 0..1), with ITS GATE in it. */
export const GATE: Rect = { x0: 3, y0: 0, x1: 6, y1: 1 };
/** The four chapels: A before the gate, B the nave bay (the main way), C the side chapel (the way round), D the first. */
export const RA: Rect = { x0: 2, y0: 1, x1: 7, y1: 6 };
export const RB: Rect = { x0: 2, y0: 7, x1: 7, y1: 12 };
export const RC: Rect = { x0: -4, y0: 1, x1: 1, y1: 6 };
export const RD: Rect = { x0: -4, y0: 7, x1: 1, y1: 12 };
/** The way in, running on off the picture. */
export const ENTRY: Rect = { x0: -3, y0: 13, x1: 0, y1: 20 };
/** The floors under the arches (each wall a tile thick), and the way in's doorway. */
export const PASSES: readonly Rect[] = [
  { x0: 3, y0: 6, x1: 6, y1: 7 }, { x0: -3, y0: 6, x1: 0, y1: 7 }, { x0: 1, y0: 2, x1: 2, y1: 5 }, { x0: 1, y0: 8, x1: 2, y1: 11 }, { x0: -3, y0: 12, x1: 0, y1: 13 },
];
/** The hall's dais at its back: two steps up (z 7 and 14), the cult's altar on it. */
export const DAIS = { x0: 1.4, x1: 6.6, y0: -10, y1: -8.4, step: 0.55, z: 7 };
/** The stretch of the hall's back wall (along y, its face at x = -1) where the dead are stacked floor to top: where it gives way to the cave. */
export const CAVE_STRETCH = { x: -1, y0: -7, y1: -4 };

/** A standing wall: along x (its face at y = `at`, turned to screen-left and lit) or along y (its face at x = `at`, in shade); from `a` to `b` along it; its arches; the gate's gap. */
export interface WallRun { alongX: boolean; at: number; a: number; b: number; arches: readonly (readonly [number, number])[]; gap?: readonly [number, number]; seed: number }
const PG = 12 / ISO_X;
export const WALLS: readonly WallRun[] = [
  { alongX: true, at: -10, a: -2, b: 10, arches: [], seed: 11 },
  { alongX: false, at: -1, a: -10, b: 0, arches: [], seed: 13 },
  { alongX: true, at: 1, a: -5, b: 7, arches: [], gap: [GATE.x0 - PG, GATE.x1 + PG], seed: 15 },
  { alongX: false, at: -4, a: 0, b: 12, arches: [], seed: 17 },
  { alongX: false, at: 2, a: 1, b: 12, arches: [[2, 5], [8, 11]], seed: 19 },
  { alongX: true, at: 7, a: -4, b: 7, arches: [[-3, 0], [3, 6]], seed: 21 },
  { alongX: false, at: -3, a: 12, b: 20, arches: [], seed: 23 },
];
/** The walls toward the eye, cut low as the game leaves them. */
export const LOWS: readonly Rect[] = [
  { x0: 9, y0: -10, x1: 10, y1: 1 }, { x0: 7, y0: 0, x1: 9, y1: 1 }, { x0: 7, y0: 1, x1: 8, y1: 13 }, { x0: 0, y0: 12, x1: 7, y1: 13 }, { x0: 0, y0: 13, x1: 1, y1: 20 },
];
export const WALL = 80;
export const LOW = 16;
/** The arches between the chapels: round, springing at 18, their crown at 66 (a hero is 56). */
export const ARCH = { spring: 18, r: 48, ring: 8 };

/** The whole picture of the run in picture pixels, where the floor's (0, 0) is on it, and where a point of the world is on it. */
export const PICTURE = { W: 1200, H: 840, OX: 536, OY: 392 };
export const atPx = (x: number, y: number, z = 0): [number, number] => [PICTURE.OX + (x - y) * 32, PICTURE.OY + (x + y) * 16 - z];
/** One phone screen (507 x 234 game pixels), the camera on the hero, a little up the screen of his feet. */
export const PHONE = { W: 1014, H: 468, lift: 28 };

/** Where the hero stands: in the nave bay (the whole run), before the gate (one phone screen), at the gate. */
export const HERO_RUN: [number, number] = [4.5, 9.3];
export const HERO_PHONE: [number, number] = [4.4, 3.5];
export const HERO_GATE: [number, number] = [4.0, 2.0];
/** Where the Amalgamation is, in his hall. */
export const BOSS_AT: [number, number] = [4.3, -4.9];

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
  if (mixMemo.size < 200000) mixMemo.set(key, out);
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
  /** The depth of what is being painted now. */
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
  /** At a depth, then the colour. */
  at(d: number): this {
    this.depth = d;
    return this;
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
// THE LIGHT: what burns (candles, lanterns, a brazier) and the cold light down the shaft (look C); each in three bands, their
// edges broken in a checker of two-pixel squares so that no circle reads (no soft gradient: his Pixels 1); the hero's own pool.

export type LightKind = 'warm' | 'cold' | 'pool';
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
    const i = l.kind === 'warm' ? 0 : l.kind === 'cold' ? 1 : 2;
    if (b > out[i]) out[i] = b;
  }
  for (const g of L.patches) {
    const dx = Math.max(g.x0 - x, 0, x - g.x1);
    const dy = Math.max(g.y0 - y, 0, y - g.y1);
    const dz = Math.max(0, z - g.z) / 60;
    const d = Math.hypot(dx, dy, dz) / g.r + jit;
    const b = Math.min(g.k, d < 0.3 ? 3 : d < 0.6 ? 2 : d < 1 ? 1 : 0);
    const i = g.kind === 'warm' ? 0 : g.kind === 'cold' ? 1 : 2;
    if (b > out[i]) out[i] = b;
  }
  return out;
}
/** A colour lit where it is: the cold light, then the fire's, then the hero's pool. */
export function lit(P: Pal, c: string, x: number, y: number, z: number, L: Lights, less = 0): string {
  const [w, k, p] = bands(x, y, z, L);
  return litBy(P, c, w - less, k - less, p - less);
}
export function litBy(P: Pal, c: string, w: number, k: number, p: number): string {
  if (k > 0 && P.cold) c = mixC(c, P.cold[k - 1], P.coldK[k - 1]);
  if (w > 0) c = mixC(c, P.warm[w - 1], P.warmK[w - 1]);
  if (p > 0) c = mixC(c, P.pool, p > 1 ? 0.2 : 0.12);
  return c;
}

/** What gives off its own light (a flame, the enemy's embers): never lit, never faded. */
export const SHINE = new Set<string>([...EMBER, '#ffe6a8', '#7a1058', '#a01a62', '#c0206a']);

// =================================================================================================
// LITTLE THINGS PAINTED PIXEL BY PIXEL: a skull face on, the end of a long bone, a candle

/** A skull seen face on, 8 x 8: its dome lit from the upper left, its two sockets and nose dark, a row of teeth. */
const SKULL = [
  '..3443..',
  '.344443.',
  '34444332',
  '31144112',
  '31143112',
  '33331322',
  '.233332.',
  '..2.2.2.',
];
/** The knob of a long bone seen end on, 4 x 3. */
const KNUCKLE = ['.43.', '4332', '.21.'];

/** A tone of the dead's bone, or null, at (i, j) of a skull drawn at its top-left; `down` tones darker (a face in shade). */
export function skullPx(P: Pal, i: number, j: number, down: number): string | null {
  if (j < 0 || j >= 8 || i < 0 || i >= 8) return null;
  const ch = SKULL[j][i];
  if (ch === '.') return null;
  if (ch === '1') return P.seam;
  return P.bone[clampK(Number(ch) - down)];
}
function knucklePx(P: Pal, i: number, j: number, down: number): string | null {
  if (j < 0 || j >= 3 || i < 0 || i >= 4) return null;
  const ch = KNUCKLE[j][i];
  if (ch === '.') return null;
  return P.bone[clampK(Number(ch) - down)];
}
/** A candle's flame, 2 wide and 4 high above its wick (j 0 the top): yellow-white at its heart, gold, then orange at its foot. */
export function flamePx(i: number, j: number, k: number): string | null {
  if (i < 0 || i > 1 || j < 0 || j > 3) return null;
  if (j === 0) return i === (k & 1) ? EMBER[3] : null;
  if (j === 1) return i === 0 ? '#ffe6a8' : EMBER[3];
  if (j === 2) return i === 0 ? EMBER[4] : EMBER[3];
  return EMBER[2];
}

// =================================================================================================
// THE WALL'S FACE: the chapel's stone in courses on a plinth; A PILASTER every two tiles with its capital and the ribs of the
// vault springing from it into the dark; between them two tiers of round-headed NICHES, the dead stacked in them, the ends
// of their long bones out and their skulls in a row on top

const NICHE = { lo: [11, 27, 10] as const, hi: [40, 48, 9] as const, at: [20, -20] as const };

/** The face of a wall at a point: `along` (tiles), `up` over its foot; `u` its column on the picture (for crisp marks). */
function chapelFace(P: Pal, look: Look, lit0: boolean, along: number, up: number, seed: number): string {
  const S = P.stone;
  const down = lit0 ? 0 : 1;
  const s = Math.floor(along * ISO_X + 1e-6);
  const sw = ((s % 64) + 64) % 64;
  const d = sw < 32 ? sw : sw - 64;
  const bay = Math.floor(s / 64 + 0.5);
  // THE PILASTER: a half-round shaft 10 wide on a moulded base, a capital at 46 to 52
  if (up >= 46 && up < 53 && d >= -7 && d <= 6) {
    if (up === 52) return S[clampK(4 - down)];
    if (up === 51) return S[clampK(3 - down)];
    if (up === 46) return S[clampK(1 - down)];
    // (the capital carved with the dead: a row of knuckles across it)
    const k = knucklePx(P, ((d + 7) % 4 + 4) % 4, up - 47, down + 1);
    return k ?? S[clampK(2 - down)];
  }
  if (up < 46 && d >= -6 && d <= 5) {
    if (up < 9) {
      if (up === 8) return S[clampK(4 - down)];
      if (up < 2) return S[clampK(1 - down)];
      return d === -6 ? S[clampK(3 - down)] : d === 5 ? S[0] : S[clampK(2 - down)];
    }
    if (d < -5 || d > 4) return P.seam;
    if (up === 30 || up === 31) return up === 31 ? S[clampK(3 - down)] : S[0];
    const k = d === -5 ? 4 : d <= -3 ? 3 : d <= 1 ? 2 : d <= 3 ? 1 : 0;
    return S[clampK(k - down)];
  }
  // THE RIBS of the vault springing from the capital, up and out into the dark
  if (up >= 52) {
    const cx = d >= 0 ? 34 : -34;
    const r = Math.hypot(d + 0.5 - cx, up + 0.5 - 52);
    if (Math.abs(r - 34) < 2.6 && Math.abs(d) < 26) {
      const inner = r < 33;
      const outer = r > 35.2;
      return S[clampK((outer ? 4 : inner ? 1 : 3) - down)];
    }
    if (Math.abs(r - 34) < 3.4 && Math.abs(d) < 26) return P.seam;
  }
  // THE NICHES: two to a bay, two tiers
  for (const [tier, [floor, spring, rad]] of [[0, NICHE.lo], [1, NICHE.hi]] as const) {
    for (const c of NICHE.at) {
      const nx = d - c;
      if (nx < -rad - 1 || nx > rad) continue;
      const top = spring + Math.sqrt(Math.max(0, rad * rad - (nx + 0.5) * (nx + 0.5)));
      if (up < floor - 1 || up > top + 1) continue;
      const id = bay * 4 + (c > 0 ? 0 : 1) + tier * 2;
      // its frame: a lit sill, a dark edge round its head
      if (up === floor - 1) return S[clampK(4 - down)];
      if (nx < -rad || nx > rad - 1 || up > top) return P.seam;
      return nicheInside(P, look, lit0, tier, nx + rad, up - floor, Math.floor(top - floor), id + seed * 97);
    }
  }
  // THE PLINTH
  if (up < 9) {
    if (up === 8) return S[clampK(3 - down)];
    if (up === 7) return S[clampK(2 - down)];
    if (up < 2) return S[clampK(1 - down)];
    return hash(s >> 3, 1, seed) < 0.12 ? S[clampK(1 - down)] : S[clampK(2 - down)];
  }
  // THE STONE, in courses 10 high, blocks 18 to 32 long
  const CH = 10;
  const cv = up - 9;
  const row = Math.floor(cv / CH);
  const lv = cv % CH;
  const off = Math.floor(hash(row, seed, 1) * 40);
  const L = 18 + Math.floor(hash(row, seed, 2) * 14);
  const uu = s + off + 400;
  const b = Math.floor(uu / L);
  const lu = uu % L;
  if (lv === CH - 1 || lu === 0) return P.seam;
  let k = 2;
  const tone = hash(b, row * 7 + seed, 3);
  if (tone < 0.16) k -= 1;
  else if (tone > 0.9) k += 1;
  if (lv === CH - 2) k += 1;
  if (lit0 && lu === 1) k += 1;
  if (lv === 0 || lu === L - 1) k -= 1;
  return S[clampK(k - down)];
}

/** Inside a niche: (i, j) from its left and its sill; `h` how high it is to the top of its head. */
function nicheInside(P: Pal, look: Look, lit0: boolean, tier: number, i: number, j: number, h: number, id: number): string {
  const down = lit0 ? 1 : 2;
  const back = mixC(P.stone[0], P.beyond, 0.5);
  const w = tier === 0 ? 20 : 18;
  // (its reveal: the left side and the head in shadow, the right side catching the light)
  const reveal = i < 2 || j > h - 2 ? P.seam : i === w - 1 ? P.stone[clampK(2 - (lit0 ? 0 : 1))] : null;
  // B: a niche here and there broken open, its dead fallen out, earth in it
  if (look === 'breach' && hash(id, 3, 501) < 0.3) {
    if (j < 6 + (hash(id, 4, 501) * 4 | 0)) {
      const n = fbm(i * 0.4, j * 0.4, id);
      return n > 0.62 ? P.bone[clampK(2 - down + 1)] : n > 0.45 ? P.earth[3] : P.earth[2];
    }
    const sk = skullPx(P, i - 3 - (id % 5), j - 7, down + 1);
    return sk ?? reveal ?? back;
  }
  if (reveal) return reveal;
  // THE STACK: rows of bone ends 3 high, the skulls in a row on top (C: the skulls in rows, the whole height)
  const rowsOfBone = look === 'cold' ? (tier === 0 ? 1 : 0) : tier === 0 ? 4 : 2;
  const boneTop = rowsOfBone * 3;
  if (j < boneTop) {
    const r = Math.floor(j / 3);
    const kx = ((i + (r % 2 ? 2 : 0)) % 5 + 5) % 5;
    const k = knucklePx(P, kx, 2 - (j % 3), down);
    return k ?? back;
  }
  // the skulls: rows of two, 8 high, from the top of the bones (look C: rows up to the head)
  const sj = j - boneTop;
  const skRows = look === 'cold' ? 3 : 1;
  const sr = Math.floor(sj / 8);
  if (sr < skRows) {
    const sk = skullPx(P, i - 1, 7 - (sj % 8), down - 1) ?? skullPx(P, i - 10, 7 - (sj % 8), down - 1);
    if (sk) return sk;
  }
  return back;
}

/** A candle in a niche (look A): where along the niche, and how tall; drawn over the face. */
export function nicheCandles(look: Look, tier: number, id: number): { i: number; h: number }[] {
  if (look !== 'candle') return [];
  const out: { i: number; h: number }[] = [];
  const n = tier === 0 ? 2 : 1 + (hash(id, 1, 77) < 0.5 ? 1 : 0);
  for (let k = 0; k < n; k++) out.push({ i: 3 + Math.floor(hash(id, k + 2, 77) * 13), h: 3 + Math.floor(hash(id, k + 5, 77) * 5) });
  return out;
}

/** The top of a wall fading into the dark: the game's four steps. */
export function faded(P: Pal, c: string, z: number, top: number): string {
  const FADE = 24;
  const fromTop = top - 1 - z;
  if (fromTop < FADE) return mixC(c, P.beyond, [0.9, 0.66, 0.42, 0.2][Math.max(0, Math.floor((fromTop * 4) / FADE))]);
  return c;
}

/** Is a point of the wall's face in an arch's opening? (`a0`..`a1` the opening along the wall.) */
export function inArch(along: number, up: number, a0: number, a1: number): boolean {
  const mid = (a0 + a1) / 2;
  const du = (along - mid) * ISO_X;
  if (Math.abs(du) >= ARCH.r) return false;
  if (up < ARCH.spring) return true;
  return Math.hypot(du, up - ARCH.spring) < ARCH.r;
}
/** The arch's ring of voussoirs round the opening, if a point is on it: a colour. */
function archRing(P: Pal, along: number, up: number, a0: number, a1: number, lit0: boolean): string | null {
  const mid = (a0 + a1) / 2;
  const du = (along - mid) * ISO_X;
  if (up < ARCH.spring - 4) {
    // the jambs: a dressed edge down each side
    const e = Math.abs(du) - ARCH.r;
    if (e >= 0 && e < 4) return e < 1 ? P.stone[clampK(4 - (lit0 ? 0 : 1))] : e > 3 ? P.seam : P.stone[clampK(3 - (lit0 ? 0 : 1))];
    return null;
  }
  const r = Math.hypot(du, Math.max(0, up - ARCH.spring));
  if (r < ARCH.r || r >= ARCH.r + ARCH.ring) return null;
  const ang = Math.atan2(Math.max(0, up - ARCH.spring), du);
  const seg = Math.floor((ang / Math.PI) * 11);
  const into = (ang / Math.PI) * 11 - seg;
  const down = lit0 ? 0 : 1;
  if (into < 0.08 || r > ARCH.r + ARCH.ring - 1) return P.seam;
  if (r < ARCH.r + 1) return P.stone[clampK(4 - down)];
  return P.stone[clampK((seg % 2 ? 3 : 2) - down + (into < 0.2 ? 1 : 0))];
}

// =================================================================================================
// PAINTING THE WALLS: each standing run as boxes of the game's height, cut round its arches; the jambs of each arch show as
// the ends of the boxes beside it; the faces lit where they stand; the candles in the niches (look A)

export function paintWalls(D: Deep, look: Look, L: Lights): void {
  const P = PALS[look];
  const iso = new Iso(D, PICTURE.OX, PICTURE.OY);
  for (const w of WALLS) {
    // the solid stretches between its openings
    const cuts: [number, number][] = [];
    let a = w.a;
    const opens = [...w.arches.map((q) => [q[0], q[1], 1] as const), ...(w.gap ? [[w.gap[0], w.gap[1], 0] as const] : [])].sort((p, q) => p[0] - q[0]);
    for (const [o0, o1] of opens) {
      if (o0 > a) cuts.push([a, o0]);
      a = o1;
    }
    if (w.b > a) cuts.push([a, w.b]);
    const face = (along: number, up: number, opening?: readonly [number, number]): string | null => {
      if (opening && inArch(along, up, opening[0], opening[1])) return null;
      const ring = opening ? archRing(P, along, up, opening[0], opening[1], w.alongX) : null;
      let c = ring ?? chapelFace(P, look, w.alongX, along, up, w.seed);
      // B: earth bled down the face from the top, and cracks
      if (look === 'breach') {
        const n = fbm(along * 1.3, up / 22, w.seed + 31);
        if (n > 0.66 && up > 20) c = mixC(c, P.earth[1], 0.5);
        const cr = Math.abs(fbm(along * 2.2, up / 14, w.seed + 33) - 0.5);
        if (cr < 0.012 && up > 12) c = P.seam;
      }
      const [x, y] = w.alongX ? [along, w.at + 0.05] : [w.at + 0.05, along];
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
            const along = s0 + (u + 0.5) / ISO_X;
            D.depth = along + y;
            return face(along, WALL - 1 - v, opening);
          },
          right: (u, v) => {
            // the end of the stretch: an arch's jamb, or the wall's end
            const yy = y - (u + 0.5) / ISO_X;
            const up = WALL - 1 - v;
            D.depth = s1 + yy;
            const c = up < 9 ? P.stone[up === 8 ? 2 : 0] : (up + 400) % 10 === 9 ? P.seam : P.stone[(Math.floor(up / 10) + Math.floor(yy * 3)) % 3 === 0 ? 0 : 1];
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
            // the end of the stretch toward +y: an arch's jamb, lit
            const xx = x - 1 + (u + 0.5) / ISO_X;
            const up = WALL - 1 - v;
            D.depth = xx + s1;
            const c = up < 9 ? P.stone[up === 8 ? 4 : 2] : (up + 400) % 10 === 9 ? P.seam : P.stone[(Math.floor(up / 10) + Math.floor(xx * 3)) % 3 === 0 ? 2 : 3];
            return faded(P, lit(P, c, xx, s1 + 0.05, up, L), up, WALL);
          },
          right: (u, v) => {
            const along = s1 - (u + 0.5) / ISO_X;
            D.depth = x + along;
            return face(along, WALL - 1 - v, opening);
          },
        });
      }
    };
    for (const [s0, s1] of cuts) run(s0, s1);
    for (const ar of w.arches) run(ar[0], ar[1], ar);
    // CANDLES IN THE NICHES (A): a stub or two on each sill, its flame, a drip of wax
    if (look === 'candle') {
      for (const [s0, s1] of [...cuts, ...w.arches.map((q): [number, number] => [q[0], q[1]])]) {
        for (let s = Math.ceil(s0 * ISO_X); s < s1 * ISO_X; s++) {
          const sw = ((s % 64) + 64) % 64;
          const d = sw < 32 ? sw : sw - 64;
          for (const [tier, nb] of [[0, NICHE.lo], [1, NICHE.hi]] as const) {
            for (const c of NICHE.at) {
              const rad = nb[2];
              if (d !== c - rad) continue;
              const bay = Math.floor(s / 64 + 0.5);
              const id = bay * 4 + (c > 0 ? 0 : 1) + tier * 2 + w.seed * 97;
              for (const cd of nicheCandles(look, tier, id)) {
                const along = (s + cd.i + 0.5) / ISO_X;
                if (w.arches.some((q) => inArch(along, nb[0] + 4, q[0], q[1]) || inArch(along, nb[0] + 12, q[0], q[1]))) continue;
                if (along < s0 || along >= s1) continue;
                const [x, y] = w.alongX ? [along, w.at + 0.02] : [w.at + 0.02, along];
                const [X0, Y0] = atPx(x, y, nb[0]);
                const X = Math.round(X0);
                const Y = Math.round(Y0);
                D.depth = x + y + 0.03;
                for (let j = 0; j < cd.h; j++) {
                  D.set(X, Y - j, j === cd.h - 1 ? P.wax[1] : lit(P, P.wax[0], x, y, nb[0] + j, L));
                  D.set(X + 1, Y - j, j > cd.h - 3 ? P.wax[1] : mixC(P.wax[0], P.seam, 0.3));
                }
                for (let j = 0; j < 4; j++) for (let i = 0; i < 2; i++) {
                  const f = flamePx(i, j, id + s);
                  if (f) D.set(X + i, Y - cd.h - 4 + j, f);
                }
              }
            }
          }
        }
      }
    }
  }
}

/** The lamps the niches' candles make (look A): one to each tile of wall, on its face, low. */
export function nicheLamps(look: Look): Lamp[] {
  if (look !== 'candle') return [];
  const out: Lamp[] = [];
  for (const w of WALLS) {
    for (let t = Math.ceil(w.a); t < w.b; t++) {
      const along = t + 0.5;
      if (w.gap && along > w.gap[0] && along < w.gap[1]) continue;
      if (w.arches.some((q) => along > q[0] && along < q[1])) continue;
      if (w.alongX && w.at === -10 && along > 8.6) continue;
      const [x, y] = w.alongX ? [along, w.at + 0.15] : [w.at + 0.15, along];
      out.push({ x, y, z: 26, r: 1.15, k: 3, kind: 'warm' });
    }
  }
  return out;
}

/** A WALL TOWARD THE EYE, cut low as the game leaves it: its cut top a coping of blocks, its faces. */
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
      const fa = (((a * 2 + hash(seed, 0, 3)) % 1) + 1) % 1;
      let c = fa < 0.06 || across < 0.08 ? P.seam : hash(Math.floor(a * 2), seed, 5) > 0.7 ? S[2] : S[3];
      if (c !== P.seam && (fa < 0.14 || (long ? across > 0.86 : across < 0.2))) c = S[4];
      return lit(P, c, x, y, LOW, L);
    },
    left: (u, v) => {
      const x = r.x0 + (u + 0.5) / ISO_X;
      D.depth = x + r.y1 + 0.5;
      return lit(P, v < 1 ? S[4] : v > LOW - 4 ? S[1] : S[v % 6 === 5 ? 0 : 2], x, r.y1, LOW - v, L);
    },
    right: (u, v) => {
      const y = r.y1 - (u + 0.5) / ISO_X;
      D.depth = r.x1 + y + 0.5;
      return lit(P, v < 1 ? S[3] : v > LOW - 4 ? S[0] : S[v % 6 === 5 ? 0 : 1], r.x1, y, LOW - v, L);
    },
  });
}

// =================================================================================================
// THE FLOOR: big flags, worn on their edges toward the light; GRAVE SLABS let into it, each with a raised border and a carved
// roundel at its head (no words, no cross); bone dust drifted at the walls' feet; B: earth spilled over it; the dais's steps

/** The grave slabs, in world tiles. */
export const SLABS: readonly Rect[] = [
  { x0: 2.5, y0: 7.8, x1: 3.5, y1: 9.8 }, { x0: 5.5, y0: 7.8, x1: 6.5, y1: 9.8 }, { x0: 2.5, y0: 10.2, x1: 3.5, y1: 11.6 },
  { x0: -2.6, y0: 8.4, x1: -1.0, y1: 10.4 },
  { x0: 2.6, y0: 3.2, x1: 3.5, y1: 5.2 },
  { x0: -3.2, y0: 1.6, x1: -2.2, y1: 3.6 }, { x0: -1.6, y0: 1.6, x1: -0.6, y1: 3.6 },
  { x0: 0.0, y0: -7.4, x1: 1.0, y1: -5.4 }, { x0: 7.2, y0: -7.4, x1: 8.2, y1: -5.4 }, { x0: 0.0, y0: -4.2, x1: 1.0, y1: -2.2 }, { x0: 7.2, y0: -4.2, x1: 8.2, y1: -2.2 },
];

function flagAt(x: number, y: number, seed: number): number {
  const row = Math.floor(y * 2);
  const off = hash(row, seed, 1) * 0.5;
  const L = hash(row, seed, 2) > 0.45 ? 0.5 : 0.75;
  const xx = x + off;
  const i = Math.floor(xx / L);
  const fu = xx / L - i;
  const fv = y * 2 - row;
  const su = 0.05 / L;
  if (fu < su || fv < 0.07) return -1;
  let k = 2;
  const tone = hash(i, row, seed + 3);
  if (tone < 0.22) k = 1;
  else if (tone > 0.86) k = 3;
  if (fu < su + 0.07 || fv > 0.88) k += 1;
  if (fu > 0.93 || fv < 0.15) k -= 1;
  if (hash(i, row, seed + 5) > 0.84) {
    const c = Math.abs(fv - 0.5 - (fu - 0.5) * (hash(i, row, seed + 6) - 0.5) * 1.6 - Math.sin(fu * 9) * 0.06);
    if (c < 0.035) return -1;
  }
  return clampK(k);
}

/** A grave slab's colour at a point of it, or null. */
function slabAt(P: Pal, look: Look, x: number, y: number, i: number): string | null {
  const s = SLABS[i];
  if (!inRect(x, y, s)) return null;
  const u = (x - s.x0) / (s.x1 - s.x0);
  const v = (y - s.y0) / (s.y1 - s.y0);
  const ex = Math.min(x - s.x0, s.x1 - x);
  const ey = Math.min(y - s.y0, s.y1 - y);
  const e = Math.min(ex, ey);
  const T = P.slab;
  if (e < 0.03) return P.seam;
  // the raised border, lit on its edges toward the light (the low x and the high y sides)
  if (e < 0.11) {
    const towardLight = x - s.x0 < 0.11 || s.y1 - y < 0.11;
    return e < 0.05 ? T[towardLight ? 4 : 1] : T[3];
  }
  if (e < 0.13) return T[1];
  // the carved roundel at its head (the low y end): a ring, a boss in it
  const long = s.y1 - s.y0 > s.x1 - s.x0;
  const [hx, hy] = long ? [(s.x0 + s.x1) / 2, s.y0 + 0.36] : [s.x0 + 0.36, (s.y0 + s.y1) / 2];
  const r = Math.hypot(x - hx, (y - hy));
  if (r < 0.2) {
    if (r > 0.15) return x < hx ? T[4] : T[1];
    if (r > 0.12) return T[1];
    if (r < 0.05) return x - hx < -0.01 ? T[4] : T[3];
  }
  // a crack across some, worn
  const crack = Math.abs(v - 0.62 - (u - 0.5) * 0.4 + Math.sin(u * 11 + i) * 0.03);
  if ((i % 3 === 1 || look === 'breach') && crack < 0.012) return P.seam;
  const n = fbm(x * 6, y * 6, 600 + i);
  // B: the slabs heaved, one end sunk dark
  if (look === 'breach' && i % 2 === 0 && v > 0.7) return mixC(T[1], P.earth[1], 0.4);
  return n > 0.62 ? T[3] : n < 0.3 ? T[1] : T[2];
}

/** How near a point is to a room's far walls (its low x and low y sides): for the dust at their feet. */
function nearFar(x: number, y: number, r: Rect): number {
  return Math.min(x - r.x0, y - r.y0);
}

export function paintFloors(D: Deep, look: Look, L: Lights): void {
  const P = PALS[look];
  const iso = new Iso(D, PICTURE.OX, PICTURE.OY);
  const rooms: [Rect, number][] = [[HALL, 701], [RA, 703], [RB, 705], [RC, 707], [RD, 709], [ENTRY, 711], [GATE, 713], ...PASSES.map((p, i): [Rect, number] => [p, 715 + i])];
  for (const [r, seed] of rooms) {
    iso.top(r.x0, r.y0, r.x1, r.y1, 0, (u, v) => {
      const x = r.x0 + u * (r.x1 - r.x0);
      const y = r.y0 + v * (r.y1 - r.y0);
      D.depth = x + y;
      let c: string | null = null;
      for (let i = 0; i < SLABS.length && !c; i++) c = slabAt(P, look, x, y, i);
      if (!c) {
        const k = flagAt(x, y, seed);
        c = k < 0 ? P.flags[0] : P.flags[k];
        // grime in drifts
        const g = fbm(x * 0.9, y * 0.9, seed + 7);
        if (g > 0.64) c = mixC(c, P.seam, 0.3);
      }
      // BONE DUST drifted at the far walls' feet and in the corners
      const nf = nearFar(x, y, r);
      const dn = fbm(x * 3.2, y * 3.2, seed + 9);
      if (nf < 0.55 && dn > 0.42 + nf * 0.5) c = dn > 0.6 ? P.dust[2] : dn > 0.5 ? P.dust[1] : P.dust[0];
      // B: earth spilled across the floor in tongues from the breaks
      if (look === 'breach') {
        const e = fbm(x * 0.7, y * 0.7, 731);
        if (e > 0.6) {
          const e2 = fbm(x * 4, y * 4, 733);
          c = e2 > 0.6 ? P.earth[3] : e2 > 0.4 ? P.earth[2] : P.earth[1];
        }
      }
      // the floor at a far wall's foot, in its shade
      if (nf < 0.16) c = mixC(c, P.beyond, 0.4);
      return lit(P, c, x, y, 0, L);
    });
  }
  // THE DAIS at the back of his hall: two steps of the chapel's stone, their noses lit
  const Dz = DAIS;
  for (const [k, inset] of [[1, 0], [2, Dz.step]] as const) {
    const x0 = Dz.x0 + inset;
    const x1 = Dz.x1 - inset;
    const y1 = Dz.y1 - inset;
    const z = Dz.z * k;
    iso.box(x0, Dz.y0, x1, y1, z - Dz.z, z, {
      top: (u, v) => {
        const x = x0 + u * (x1 - x0);
        const y = Dz.y0 + v * (y1 - Dz.y0);
        D.depth = x + y + z / 16;
        const kk = flagAt(x, y, 741 + k);
        let c = kk < 0 ? P.flags[0] : P.flags[clampK(kk + 1)];
        if (y1 - y < 0.06 || x - x0 < 0.06) c = P.stone[4];
        return lit(P, c, x, y, z, L);
      },
      left: (u, v) => {
        const x = x0 + (u + 0.5) / ISO_X;
        D.depth = x + y1 + z / 16;
        return lit(P, v === 0 ? P.stone[3] : v === Dz.z - 1 ? P.stone[0] : P.stone[2], x, y1, z - v, L);
      },
      right: (u, v) => {
        const y = y1 - (u + 0.5) / ISO_X;
        D.depth = x1 + y + z / 16;
        return lit(P, v === 0 ? P.stone[2] : P.stone[1], x1, y, z - v, L);
      },
    });
  }
}

/** Little chips of bone scattered on the floors, and dust: drawn over the floor, under what stands. */
export function paintChips(D: Deep, look: Look, L: Lights): void {
  const P = PALS[look];
  const rooms = [HALL, RA, RB, RC, RD, ENTRY];
  let n = 0;
  for (const r of rooms) {
    const count = Math.round((r.x1 - r.x0) * (r.y1 - r.y0) * (look === 'cold' ? 2 : 3.5));
    for (let i = 0; i < count; i++) {
      const x = r.x0 + 0.2 + hash(i, n, 801) * (r.x1 - r.x0 - 0.4);
      const y = r.y0 + 0.2 + hash(i, n, 803) * (r.y1 - r.y0 - 0.4);
      n++;
      const [X0, Y0] = atPx(x, y);
      const X = Math.round(X0);
      const Y = Math.round(Y0);
      if (D.depthAt(X, Y) > x + y + 0.2) continue;
      D.depth = x + y + 0.01;
      const len = 2 + Math.floor(hash(i, n, 805) * 3);
      const dir = hash(i, n, 807) < 0.5 ? 1 : -1;
      for (let k = 0; k < len; k++) {
        const yy = Y + (k > 1 ? dir : 0);
        D.set(X + k, yy, lit(P, k === 0 ? P.bone[3] : P.bone[2], x, y, 1, L));
        D.set(X + k, yy + 1, mixC(P.flags[0], P.seam, 0.5));
      }
    }
  }
}

// =================================================================================================
// SOLIDS, MARCHED: for each pixel the line of sight is followed from the eye's side of the thing's box inward, and the first
// point inside it is what is seen. The line of sight through (sx, sy) on the picture: x = (t + q) / 2, y = (t - q) / 2, z =
// 16 t - sy, q = sx / 32; t = x + y is the depth. Pillars, ribs, rock, timber, pews and the gate are painted so.

export type Face = 'x' | 'y' | 'z' | 'in';
export interface Solid {
  box: { x0: number; y0: number; z0: number; x1: number; y1: number; z1: number };
  inside: (x: number, y: number, z: number) => boolean;
  /** The colour where the eye meets it (the face it crossed), or null to see on through. */
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
          // (which way it was entered: the coordinate whose step took it inside)
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

/** A tone of a ramp for a face: the top lightest, the face to screen-left (+y) in between, the face to screen-right (+x) darkest. */
export function faceTone(r: R5, face: Face, bias = 0): string {
  return r[clampK((face === 'z' ? 3 : face === 'y' ? 2 : face === 'x' ? 1 : 2) + bias)];
}

/** A PIER of the chapel's stone, fluted, on a square plinth, up to its capital at `cap`, where the ribs spring. */
export function pier(D: Deep, look: Look, L: Lights, x: number, y: number, cap: number): void {
  const P = PALS[look];
  const R = 0.24;
  const top = cap + 12;
  march(D, {
    box: { x0: x - 0.4, y0: y - 0.4, z0: 0, x1: x + 0.4, y1: y + 0.4, z1: top },
    inside: (px, py, z) => {
      const dx = px - x;
      const dy = py - y;
      if (z < 10) return Math.max(Math.abs(dx), Math.abs(dy)) < 0.34;
      if (z < 15) return Math.hypot(dx, dy) < 0.3;
      if (z >= cap) return Math.hypot(dx, dy) < (z < cap + 4 ? 0.3 : 0.37);
      return Math.hypot(dx, dy) < R;
    },
    shade: (px, py, z, face) => {
      const dx = px - x;
      const dy = py - y;
      const a = Math.atan2(dy, dx);
      // round: lit toward screen-left (+y) and up, dark toward +x; FLUTED, a groove every eighth of the way round
      const lt = Math.cos(a - 2.0);
      let k = lt > 0.65 ? 4 : lt > 0.15 ? 3 : lt > -0.35 ? 2 : lt > -0.8 ? 1 : 0;
      if (z >= 15 && z < cap && Math.cos(a * 8 + 0.4) < -0.75) k -= 1;
      if (z < 10) k = face === 'z' ? 3 : face === 'y' ? 2 : 1;
      else if (z < 15) k = Math.min(4, k + 1);
      else if (z >= cap) k = face === 'z' || z >= top - 2 ? 4 : z < cap + 4 ? k - 1 : k;
      let c = P.stone[clampK(k)];
      // the capital carved with a band of knuckle bones
      if (z >= cap + 4 && z < top - 2 && face !== 'z') {
        const kn = knucklePx(P, ((Math.floor(a * 9 + 40) % 4) + 4) % 4, Math.floor(z - cap - 4) % 3, lt > 0 ? 0 : 1);
        if (kn) c = kn;
      }
      return lit(P, c, px, py, z, L);
    },
  }, 0.012);
}

/**
 * THE RIBS springing from a pier's capital: each goes up off it near upright, then curves out over the room, lost in the dark
 * above (fading in the game's four steps). `dirs`: which way each goes (along the floor), how far, how high it climbs.
 */
export function ribs(D: Deep, look: Look, L: Lights, x: number, y: number, z0: number, dirs: readonly [number, number, number, number][]): void {
  const P = PALS[look];
  const fadeFrom = z0 + 14;
  for (const [ux, uy, reach, climb] of dirs) {
    const m = Math.hypot(ux, uy) || 1;
    const n = Math.ceil((reach * 40 + climb) * 3);
    let last: [number, number] | null = null;
    for (let i = 0; i <= n; i++) {
      const t = i / n;
      const s = 1 - Math.cos((t * Math.PI) / 2);
      const wx = x + (ux / m) * (0.26 + reach * s);
      const wy = y + (uy / m) * (0.26 + reach * s);
      const wz = z0 + climb * Math.sin((t * Math.PI) / 2);
      const [X0, Y0] = atPx(wx, wy, wz);
      const f = Math.min(4, Math.floor(((wz - fadeFrom) / (climb * 0.9)) * 4));
      if (f >= 4) break;
      const fade = (c: string): string => (f < 0 ? c : mixC(c, P.beyond, [0.2, 0.42, 0.66, 0.9][f]));
      // (a band 6 across, square to the rib's way on the picture: its edge toward the upper left lit, the other dark)
      const [tx, ty] = last ? [X0 - last[0], Y0 - last[1]] : [0, -1];
      last = [X0, Y0];
      const tm = Math.hypot(tx, ty) || 1;
      let nx = -ty / tm;
      let ny = tx / tm;
      if (nx + ny > 0) {
        nx = -nx;
        ny = -ny;
      }
      D.depth = wx + wy;
      for (let dy = -4; dy <= 4; dy++) {
        for (let dx = -4; dx <= 4; dx++) {
          const across = dx * nx + dy * ny;
          const along = Math.abs(dx * (tx / tm) + dy * (ty / tm));
          if (Math.abs(across) > 3.2 || along > 1.2) continue;
          const c = across > 2.4 ? P.stone[4] : across > 0.8 ? P.stone[3] : across > -0.8 ? P.stone[2] : across > -2.4 ? P.stone[1] : P.seam;
          D.set(Math.round(X0) + dx, Math.round(Y0) + dy, fade(c === P.seam ? c : lit(P, c, wx, wy, wz, L)));
        }
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
      const gx = (f(x + e, y, z) - f(x - e, y, z)) / (2 * e) / 1;
      const gy = (f(x, y + e, z) - f(x, y - e, z)) / (2 * e);
      const gz = (f(x, y, z + e * 32) - f(x, y, z - e * 32)) / (2 * e);
      const m = Math.hypot(gx, gy, gz) || 1;
      // (facets: the normal stepped, so the rock breaks into planes)
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

/** A BOX turned about the upright by `yaw` and tipped about its own length by `roll` (a pew fallen on its back): wood or iron. */
export function obox(D: Deep, look: Look, L: Lights, c: [number, number, number], half: [number, number, number], yaw: number, roll: number, ramp: R5, grain = true, pitch = 0): void {
  const P = PALS[look];
  const cy = Math.cos(yaw);
  const sy = Math.sin(yaw);
  const cr = Math.cos(roll);
  const sr = Math.sin(roll);
  const cp = Math.cos(pitch);
  const sp = Math.sin(pitch);
  // world to the box's own frame (x along it, y across, z up; z in tiles: 32 picture pixels to one)
  const local = (x: number, y: number, z: number): [number, number, number] => {
    const dx = x - c[0];
    const dy = y - c[1];
    const dz = (z - c[2]) / 32;
    let lx = dx * cy + dy * sy;
    let ly = -dx * sy + dy * cy;
    let lz = dz;
    // pitch: about its across axis (one end down)
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
      // which face of its own: the one it is nearest the surface of
      const ex = half[0] - Math.abs(lx);
      const ey = half[1] - Math.abs(ly);
      const ez = half[2] - Math.abs(lz);
      // its normal in the world
      let n: [number, number, number];
      if (ez <= ex && ez <= ey) n = [0, 0, Math.sign(lz)];
      else if (ey <= ex) n = [0, Math.sign(ly), 0];
      else n = [Math.sign(lx), 0, 0];
      // (back through roll, pitch and yaw)
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
      const edge = Math.min(ex < 0.02 ? 0 : 9, ey < 0.02 ? 0 : 9, ez < 0.02 ? 0 : 9) === 0 && Math.min(ex, ey, ez) < 0.02 && [ex, ey, ez].filter((v) => v < 0.03).length >= 2;
      if (edge && l > 0.3) k += 1;
      // the grain along it
      if (grain && Math.abs(((lx * 7 + hash(Math.floor(ly * 20), 1, 921) * 3) % 1) - 0.5) < 0.05) k -= 1;
      return lit(P, ramp[clampK(k)], x, y, z, L);
    },
  }, 0.01);
}

// =================================================================================================
// THE GATE OF ITS OWN, in the chapel's stone and bone, in the boss's doorway: CLUSTERED PILLARS (three round shafts) on moulded
// bases, a skull carved on each capital; A POINTED ARCH over the three tiles of the way, its ring set with the dead's skulls,
// one to each voussoir, upright; over it a cornice and A GABLE, its slopes coped with long bones, a skull on its peak; in the
// gable a roundel with THE MAW, his mark (floor 4's own: a mouth roaring open, its corners cut square, three fangs of every
// size hanging in it, the enemy's fire dull and low in it); THE DROP at the back of the arch, drawn up: a grille of the dead's
// long bones bound with iron, their ends cut to points. An original design. Built as the game's boss gates are: the three
// tiles of the way between two pillars (art/gates.ts: SPAN 96, PILLAR 12); painted slice by slice through the wall's
// thickness, so that its inner side reads through the way.

export const GATE_SPRING = 64;
/** The pointed arch: two arcs of this radius from centres this far either side of the middle (its crown at 64 + 59). */
export const GATE_R = 60;
const GATE_C = 12;
export const GATE_CORNICE = 140;
export const GATE_PEAK = 192;
const PILLAR = 12;
const RING = 14;
/** Where the drop's points hang, drawn up (picture pixels over the floor). */
export const GATE_LIFT = 88;
/** His mark, the maw, in the gable: its middle over the floor. */
export const MAW_Z = 164;
/** His mark's place in the world: at the middle of the way, in the gate's face. */
export const MARK_AT: [number, number, number] = [(GATE.x0 + GATE.x1) / 2, GATE.y1, MAW_Z];

const inPointed = (du: number, dz: number, R: number): boolean => dz > 0 && Math.hypot(du - GATE_C, dz) < R && Math.hypot(du + GATE_C, dz) < R;

/** The gate's face at a point: `u` across from the outer edge of the left pillar, `up` over the floor. Null: the way through, or the air. */
export function gateFace(P: Pal, u: number, up: number, front: boolean): string | null {
  const S = P.stone;
  const B = P.bone;
  const W = 96 + PILLAR * 2;
  const mid = W / 2;
  const du = u + 0.5 - mid;
  const dz = up + 0.5 - GATE_SPRING;
  // THE WAY
  if (Math.abs(du) < 48 && (dz <= 0 || inPointed(du, dz, GATE_R))) return null;
  // THE GABLE's outline (over the cornice) and the finial
  const gTop = GATE_CORNICE + 6 + (GATE_PEAK - GATE_CORNICE - 6) * (1 - Math.abs(du) / mid);
  if (up >= GATE_CORNICE + 6 && up > gTop) {
    // the skull on the peak, upright
    const sk = skullPx(P, Math.floor(du + 4), Math.floor(GATE_PEAK + 8 - up), 0);
    if (front && sk && up > GATE_PEAK - 4) return sk;
    return null;
  }
  if (!front) {
    if (up > GATE_CORNICE + 6) return null;
    return up % 12 === 11 ? P.seam : S[1];
  }
  if (up >= GATE_CORNICE + 6) {
    // the gable's coping of long bones laid along its slopes: a knob at each end, shafts between
    if (gTop - up < 5) {
      const along = Math.abs(du) * 1.0 + up * 0.5;
      const knob = ((Math.floor(along / 9) % 2) + 2) % 2 === 0 && (along % 9) < 3;
      const t = gTop - up;
      if (knob) return B[t < 1 ? 4 : t < 3 ? 3 : 2];
      return t < 1 ? B[3] : t < 2 ? B[2] : t < 4 ? B[1] : P.seam;
    }
    // THE ROUNDEL with the maw
    const rr = Math.hypot(du, up + 0.5 - MAW_Z);
    if (rr < 15) return mawAt(P, du, up + 0.5 - MAW_Z, rr);
    // the gable's face: small courses
    return (up + 400) % 9 === 8 || ((u + Math.floor(up / 9) * 7 + 400) % 17) === 0 ? P.seam : S[(Math.floor(u / 17) + Math.floor(up / 9)) % 4 === 0 ? 2 : 3];
  }
  // THE CORNICE across the top of the face
  if (up >= GATE_CORNICE) return up === GATE_CORNICE + 5 ? S[4] : up >= GATE_CORNICE + 3 ? S[3] : up === GATE_CORNICE ? P.seam : S[1];
  // THE PILLARS up to the spring: three round shafts on a moulded base, a band, a capital with a skull carved on it
  const inPillar = u < PILLAR || u >= W - PILLAR;
  if (inPillar && up < GATE_SPRING) {
    const pu = u < PILLAR ? u : u - (W - PILLAR);
    if (up < 7) return up === 6 ? S[4] : pu === 0 ? S[3] : up < 1 ? S[1] : S[2];
    if (up < 10) return up === 9 ? S[4] : S[3];
    if (up >= GATE_SPRING - 10) {
      if (up >= GATE_SPRING - 2) return up === GATE_SPRING - 1 ? S[4] : S[3];
      const sk = skullPx(P, pu - 2, GATE_SPRING - 3 - up, 0);
      return sk ?? (pu === 0 ? S[4] : pu === PILLAR - 1 ? S[1] : S[2]);
    }
    if (up === 34 || up === 35) return up === 35 ? S[4] : S[1];
    const sp = pu % 4;
    return sp === 0 ? S[4] : sp === 1 ? S[3] : sp === 2 ? S[2] : S[0];
  }
  // THE RING of the pointed arch, set with skulls, one to each voussoir, upright
  if (dz > -1 && inPointed(du, dz + 0.01, GATE_R + RING) && Math.abs(du) < 48 + RING) {
    const left = du < 0;
    const cx = left ? GATE_C : -GATE_C;
    const rho = Math.hypot(du - cx, Math.max(0, dz));
    if (rho < GATE_R + 1.5) return S[4];
    if (rho > GATE_R + RING - 1.5) return rho > GATE_R + RING - 0.5 ? P.seam : S[3];
    if (Math.abs(du) < 4) return Math.abs(du) > 3 ? P.seam : S[3];
    // the arc from the spring: the voussoirs every 12 along it, a skull in each
    const ang = Math.atan2(Math.max(0, dz), left ? du - cx : -(du - cx));
    const arc = (Math.PI - ang) * (GATE_R + RING / 2);
    const k = Math.round((arc - 7) / 12);
    const a0 = 7 + 12 * k;
    const ca = Math.PI - a0 / (GATE_R + RING / 2);
    const sx = cx + (left ? 1 : -1) * Math.cos(ca) * (GATE_R + RING / 2);
    const sz = Math.sin(ca) * (GATE_R + RING / 2);
    const sk = skullPx(P, Math.floor(du - sx + 4), Math.floor(sz + 4 - dz), 0);
    if (sk && a0 > 3) return sk;
    const into = arc - (a0 - 6);
    if (into < 1 || into > 11.6) return P.seam;
    return S[k % 2 ? 2 : 3];
  }
  // THE FACE about the arch: ashlar in courses, lit toward the left
  const row = Math.floor(up / 12);
  const lv = up % 12;
  const off = row % 2 ? 0 : 14;
  const lu = (u + off + 400) % 28;
  if (lv === 11 || lu === 0) return P.seam;
  if (lv === 10 || lu === 1) return S[4];
  return (Math.floor((u + off + 400) / 28) + row) % 3 === 0 ? S[2] : S[3];
}

/** THE MAW in its roundel: (du, dz) from the roundel's middle. */
function mawAt(P: Pal, du: number, dz: number, rr: number): string {
  const S = P.stone;
  const B = P.bone;
  // the roundel's ring: lit on its upper left
  if (rr > 12.5) return du - dz < 0 ? S[4] : S[1];
  if (rr > 11.5) return P.seam;
  // the mouth, roaring open: a little wider than tall, its corners cut square
  const ax = Math.abs(du);
  const top = 5.5 - (ax > 5 ? 1 : 0);
  const bot = -6 + (ax > 6 ? 1 : 0);
  const inMouth = ax < 7.5 && dz < top && dz > bot && !(ax > 6 && (dz > top - 1.2 || dz < bot + 1.2));
  if (inMouth) {
    // THREE FANGS of every size, all hanging from the top: long at the left, short in the middle, middling at the right
    for (const [fx, len] of [[-4, 7.5], [0.5, 3.5], [4.5, 5.5]] as const) {
      const fromTop = top - dz;
      if (fromTop < len) {
        const half = 1.4 * (1 - fromTop / len) + 0.35;
        if (Math.abs(du - fx) < half) return du < fx ? B[4] : B[2];
      }
    }
    // the enemy's fire, dull, lowest in it, in embers (never in rings)
    const ember = hash(Math.floor(du + 20), Math.floor(dz + 20), 977);
    if (dz < bot + 2.2) return ember < 0.75 ? '#a01a62' : '#7a1058';
    if (dz < bot + 4.2) return ember < 0.45 ? '#7a1058' : P.beyond;
    return P.beyond;
  }
  // its lips, cut in the stone
  if (ax < 9 && dz < top + 1.5 && dz > bot - 1.5) return dz > 0 ? S[1] : S[4];
  // the roundel's sunk field
  return S[2];
}

/** THE GATE, painted into the picture with its depth: slices from the back of the wall to its face; the drop in its slot. */
export function paintGate(D: Deep, look: Look, L: Lights): void {
  const P = PALS[look];
  const iso = new Iso(D, PICTURE.OX, PICTURE.OY);
  const W = 96 + PILLAR * 2;
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
    if (Math.abs(y - ySlot) < 0.5 / ISO_X) paintDrop(D, iso, P, look, x0, x1, y, L);
    iso.left(x0, x1, y, 0, top, (u, v) => {
      const up = top - 1 - v;
      if (u >= W) return null;
      const c = gateFace(P, u, up, front);
      if (!c) return null;
      const x = x0 + (u + 0.5) / ISO_X;
      D.depth = x + y;
      if (SHINE.has(c)) return c;
      return lit(P, c, x, y + 0.1, up, L, front ? 0 : 1);
    });
  }
}
/** THE DROP drawn up into its slot: the dead's long bones every twelve, bound with two straps of iron, their ends cut to points. */
function paintDrop(D: Deep, iso: Iso, P: Pal, look: Look, x0: number, x1: number, y: number, L: Lights): void {
  const B = P.bone;
  const I = P.iron;
  const W = 96 + PILLAR * 2;
  iso.left(x0, x1, y, 0, GATE_CORNICE, (u, v) => {
    const up = GATE_CORNICE - 1 - v;
    if (u < PILLAR || u >= W - PILLAR) return null;
    if (up < GATE_LIFT) return null;
    const x = x0 + (u + 0.5) / ISO_X;
    D.depth = x + y;
    const b = (u - PILLAR + 400) % 12;
    const h = up - GATE_LIFT;
    // the straps of iron, riveted where they cross a bone
    if ((h >= 16 && h < 20) || (h >= 40 && h < 43)) {
      const rivet = Math.abs(b - 6.5) < 1 && (h === 17 || h === 41);
      return lit(P, rivet ? I[4] : h === 19 || h === 42 ? I[3] : h === 16 || h === 40 ? I[0] : I[2], x, y, up, L, 1);
    }
    // the bones: 5 wide, a knob where each passes a strap, the end cut to a point
    const knob = (h >= 13 && h < 16) || (h >= 20 && h < 23) || (h >= 37 && h < 40);
    const half = h < 10 ? 2.5 * (h / 10) : knob ? 3.5 : 2.5;
    if (Math.abs(b - 6) <= half) {
      const k = b < 5 ? 4 : b < 6.5 ? 3 : b < 7.5 ? 2 : 1;
      return lit(P, B[k], x, y, up, L, 1);
    }
    void look;
    return null;
  });
}

// =================================================================================================
// CANDLES ON THE FLOOR (look A): clusters of them, every height, standing in pools of their own wax

/** The clusters: where, how many, how wide. */
export const CANDLE_CLUSTERS: readonly [number, number, number, number][] = [
  [2.55, 1.35, 7, 0.32], [6.45, 1.35, 7, 0.32], [2.5, 5.5, 5, 0.3], [6.4, 6.4, 5, 0.3], [2.4, 7.4, 6, 0.3], [6.6, 11.4, 6, 0.32], [-3.6, 7.4, 6, 0.3],
  [0.5, 11.4, 5, 0.3], [-3.6, 1.4, 6, 0.3], [0.4, 5.5, 5, 0.28], [1.2, -8.2, 9, 0.4], [6.9, -8.2, 9, 0.4], [-0.5, -9.4, 6, 0.32], [8.4, -1.0, 7, 0.36], [-0.5, -0.6, 6, 0.32],
  [-2.4, 14.0, 4, 0.26], [3.1, -9.6, 5, 0.3], [5.4, -9.6, 5, 0.3],
];

export function paintFloorCandles(D: Deep, look: Look, L: Lights): void {
  if (look !== 'candle') return;
  const P = PALS[look];
  CANDLE_CLUSTERS.forEach(([cx, cy, n, spread], ci) => {
    const zBase = cy < DAIS.y1 && cx > DAIS.x0 && cx < DAIS.x1 ? DAIS.z * 2 : 0;
    // the pool of wax under them
    const iso = new Iso(D, PICTURE.OX, PICTURE.OY);
    iso.top(cx - spread, cy - spread, cx + spread, cy + spread, zBase, (u, v) => {
      const x = cx - spread + u * spread * 2;
      const y = cy - spread + v * spread * 2;
      const r = Math.hypot(x - cx, y - cy) / spread + (fbm(x * 9, y * 9, ci) - 0.5) * 0.5;
      if (r > 0.95) return null;
      D.depth = x + y + 0.005;
      return r > 0.8 ? mixC(P.wax[0], P.flags[1], 0.5) : P.wax[0];
    });
    const sticks: [number, number, number][] = [];
    for (let i = 0; i < n; i++) {
      const a = hash(ci, i, 951) * Math.PI * 2;
      const r = Math.sqrt(hash(ci, i, 953)) * spread * 0.8;
      sticks.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r, 6 + Math.floor(hash(ci, i, 955) * 14)]);
    }
    sticks.sort((p, q) => p[0] + p[1] - (q[0] + q[1]));
    for (const [x, y, h] of sticks) {
      const [X0, Y0] = atPx(x, y, zBase);
      const X = Math.round(X0 / 2) * 2;
      const Y = Math.round(Y0);
      D.depth = x + y + 0.01;
      // (a candle three pixels wide: lit on its left, its own flame lighting its top)
      for (let j = 0; j < h; j++) {
        const top = j > h - 3;
        D.set(X - 1, Y - j, top ? P.wax[1] : mixC(P.wax[1], P.wax[0], 0.4));
        D.set(X, Y - j, top ? P.wax[1] : P.wax[0]);
        D.set(X + 1, Y - j, mixC(P.wax[0], P.seam, 0.45));
      }
      // a drip down one
      if (hash(Math.floor(x * 50), Math.floor(y * 50), 957) < 0.4) D.set(X - 1, Y - h + 3, P.wax[1]).set(X - 1, Y - h + 4, P.wax[1]);
      for (let j = 0; j < 4; j++) for (let i = 0; i < 2; i++) {
        const f = flamePx(i, j, Math.floor(x * 31 + y * 17));
        if (f) D.set(X - 1 + i, Y - h - 4 + j, f);
      }
    }
  });
}
export function candleLamps(look: Look): Lamp[] {
  if (look !== 'candle') return [];
  return CANDLE_CLUSTERS.map(([x, y, n]) => ({ x, y, z: 14, r: 1.1 + n * 0.09, k: 3, kind: 'warm' as const }));
}

// =================================================================================================
// LOOK B: THE EARTH BREAKING IN. The mine's rock bursting through the walls and heaped on the floors, timber props and their
// caps shoring it, lanterns hung on them, pews broken and thrown down.

/** The breaks: where the rock comes through (a centre on the wall and how far it reaches into the room). */
export const BREAKS: readonly { c: [number, number, number]; r: [number, number, number]; n: number; seed: number }[] = [
  // through the first chapel's left wall
  { c: [-4.1, 9.6, 30], r: [0.9, 1.5, 44], n: 7, seed: 1 },
  // through the hall's back wall, its right side
  { c: [7.0, -10.1, 34], r: [1.6, 0.9, 48], n: 8, seed: 2 },
  // through the side chapel's back wall
  { c: [-1.8, 0.9, 26], r: [1.3, 0.7, 36], n: 6, seed: 3 },
];

export function paintBreaks(D: Deep, look: Look, L: Lights): void {
  if (look !== 'breach') return;
  const P = PALS[look];
  for (const b of BREAKS) {
    // great lumps of rock, the biggest in the wall, smaller ones tumbled out before it
    for (let i = 0; i < b.n; i++) {
      const t = i / b.n;
      const ax = (hash(i, b.seed, 961) - 0.5) * 2;
      const ay = (hash(i, b.seed, 963) - 0.5) * 2;
      const big = 1 - t * 0.6;
      const cx = b.c[0] + ax * b.r[0] * 0.6 + (b.r[0] < b.r[1] ? t * 1.2 : 0);
      const cy = b.c[1] + ay * b.r[1] * 0.6 + (b.r[0] >= b.r[1] ? t * 1.2 : 0);
      const cz = Math.max(10, (b.c[2] + 30) * (1 - t) + (hash(i, b.seed, 965) - 0.5) * 30);
      rock(D, look, L, [cx, cy, cz], [0.55 * big + 0.15, 0.55 * big + 0.15, 30 * big + 8], b.seed * 10 + i);
    }
    // the earth and rubble spilled before it, a long low heap
    const ex = b.c[0] + (b.r[0] < b.r[1] ? 1.0 : 0);
    const ey = b.c[1] + (b.r[0] >= b.r[1] ? 1.0 : 0);
    rock(D, look, L, [ex, ey, -2], [b.r[0] < b.r[1] ? 1.2 : b.r[0] * 1.1, b.r[0] >= b.r[1] ? 1.2 : b.r[1] * 1.1, 14], b.seed * 10 + 9, P.earth);
    for (let i = 0; i < 9; i++) {
      const x = ex + (hash(i, b.seed, 967) - 0.5) * 2.2;
      const y = ey + (hash(i, b.seed, 969) - 0.5) * 2.2;
      rock(D, look, L, [x, y, 3], [0.1 + hash(i, b.seed, 971) * 0.1, 0.1 + hash(i, b.seed, 973) * 0.1, 5], b.seed * 30 + i);
    }
  }
}

/** The props: posts (x, y, how high) and the caps laid along their tops (from one post to another). */
export const PROPS: readonly { posts: [number, number][]; h: number }[] = [
  { posts: [[-3.55, 8.2], [-3.55, 11.1]], h: 84 },
  { posts: [[5.6, -9.45], [8.4, -9.45]], h: 88 },
  { posts: [[2.45, 7.5], [2.45, 11.5]], h: 78 },
  { posts: [[-3.4, 1.5], [0.4, 1.5]], h: 76 },
];

export function paintProps(D: Deep, look: Look, L: Lights): void {
  if (look !== 'breach') return;
  const P = PALS[look];
  for (const pr of PROPS) {
    for (const [x, y] of pr.posts) obox(D, look, L, [x, y, pr.h / 2], [0.11, 0.11, pr.h / 64], 0.05, 0, P.wood);
    const [a, b] = pr.posts;
    const len = Math.hypot(b[0] - a[0], b[1] - a[1]);
    const yaw = Math.atan2(b[1] - a[1], b[0] - a[0]);
    obox(D, look, L, [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2, pr.h + 5], [len / 2 + 0.25, 0.13, 6 / 32], yaw, 0, P.wood);
    // a wedge driven in over each post
    for (const [x, y] of pr.posts) obox(D, look, L, [x, y, pr.h - 4], [0.16, 0.12, 2 / 32], yaw, 0, P.wood, false);
  }
  // a brace from the first prop's post down into the floor
  obox(D, look, L, [-3.0, 9.6, 30], [0.08, 0.08, 1.15], 0, 0.55, P.wood, true, 0);
}

/** The lanterns hung on the props: where, how high. */
export const PROP_LANTERNS: readonly [number, number, number][] = [[-3.4, 9.65, 60], [7.0, -9.25, 64], [2.6, 9.5, 58], [-1.5, 1.7, 56]];

export function paintPropLanterns(D: Deep, look: Look, L: Lights): void {
  if (look !== 'breach') return;
  const P = PALS[look];
  for (const [x, y, z] of PROP_LANTERNS) {
    const [X0, Y0] = atPx(x, y, z);
    const X = Math.round(X0);
    const Y = Math.round(Y0);
    D.depth = x + y + 0.2;
    // its hook and ring, its peaked cap, its cage round the glass and the flame, its foot
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
export function lanternLamps(look: Look): Lamp[] {
  if (look !== 'breach') return [];
  return PROP_LANTERNS.map(([x, y, z]) => ({ x: x + 0.3, y: y + 0.3, z: z - 4, r: 2.3, k: 3, kind: 'warm' as const }));
}

/** THE PEWS: broken and thrown down. Each: its middle, its yaw, how it lies (`up` standing, `back` fallen on its back, `side`, snapped in two). */
export const PEWS: readonly { x: number; y: number; yaw: number; lie: 'up' | 'back' | 'side' | 'snapped' }[] = [
  { x: 5.4, y: 10.9, yaw: 0.25, lie: 'up' },
  { x: 5.7, y: 8.6, yaw: -0.4, lie: 'back' },
  { x: -1.4, y: 10.8, yaw: 0.1, lie: 'snapped' },
  { x: 4.8, y: 4.3, yaw: 1.2, lie: 'side' },
  { x: -1.5, y: 4.9, yaw: 0.35, lie: 'up' },
];

export function paintPews(D: Deep, look: Look, L: Lights): void {
  if (look !== 'breach') return;
  const P = PALS[look];
  const W = P.wood;
  for (const pw of PEWS) {
    const cy = Math.cos(pw.yaw);
    const sy = Math.sin(pw.yaw);
    const at = (along: number, across: number): [number, number] => [pw.x + along * cy - across * sy, pw.y + along * sy + across * cy];
    if (pw.lie === 'up') {
      const [sx, sy2] = at(0, 0.05);
      obox(D, look, L, [sx, sy2, 15], [0.85, 0.2, 2 / 32], pw.yaw, 0, W);
      const [bx, by] = at(0, -0.17);
      obox(D, look, L, [bx, by, 28], [0.85, 0.035, 12 / 32], pw.yaw, 0, W);
      for (const e of [-0.72, 0.72]) {
        const [lx, ly] = at(e, 0.05);
        obox(D, look, L, [lx, ly, 7], [0.04, 0.17, 7 / 32], pw.yaw, 0, W, false);
      }
    } else if (pw.lie === 'back') {
      // fallen on its back: the back flat on the floor, the seat standing up from it, its legs in the air
      const [bx, by] = at(0, 0);
      obox(D, look, L, [bx, by, 2], [0.85, 0.36, 2 / 32], pw.yaw, 0, W);
      const [sx, sy2] = at(0, 0.3);
      obox(D, look, L, [sx, sy2, 10], [0.85, 0.035, 9 / 32], pw.yaw, 0, W);
      for (const e of [-0.72, 0.72]) {
        const [lx, ly] = at(e, 0.48);
        obox(D, look, L, [lx, ly, 13], [0.04, 0.17, 2 / 32], pw.yaw, 0, W, false);
      }
    } else if (pw.lie === 'side') {
      const [sx, sy2] = at(0, 0);
      obox(D, look, L, [sx, sy2, 6], [0.85, 0.03, 6 / 32], pw.yaw, 0, W);
      const [bx, by] = at(0, -0.2);
      obox(D, look, L, [bx, by, 2], [0.85, 0.2, 2 / 32], pw.yaw, 0, W);
    } else {
      // snapped in two in the middle, each half's broken end down on the floor
      for (const side of [-1, 1]) {
        const [hx, hy] = at(side * 0.5, 0);
        obox(D, look, L, [hx, hy, 9], [0.42, 0.2, 2 / 32], pw.yaw + side * 0.18, 0, W, true, side * 0.32);
        const [bx, by] = at(side * 0.5, -0.17);
        obox(D, look, L, [bx, by, 18], [0.42, 0.035, 10 / 32], pw.yaw + side * 0.18, 0, W, true, side * 0.32);
      }
    }
  }
}

// =================================================================================================
// LOOK C: COLD AND GRAND. The piers at the arches and the corners rise out of the walls into the dark, the ribs of the vaults
// springing from them high up and lost; grey light falls down a broken shaft; the dead stacked in rows along the walls.

/** The piers: in his hall in every look (its corners); in look C in each chapel's far corner too, taller. */
export const PIERS_HALL: readonly [number, number][] = [[-0.66, -9.66], [8.66, -9.66]];
export const PIERS_C: readonly [number, number][] = [[2.34, 7.34], [-3.66, 1.34], [-3.66, 7.34]];

export function paintPiers(D: Deep, look: Look, L: Lights): void {
  const cap = look === 'cold' ? 150 : 100;
  const climb = look === 'cold' ? 150 : 90;
  const reach = look === 'cold' ? 2.6 : 2.0;
  const into: [number, number, number, number][] = [[1, 0, reach, climb], [0, 1, reach, climb], [1, 1, reach * 1.2, climb * 1.1]];
  PIERS_HALL.forEach(([x, y], i) => {
    pier(D, look, L, x, y, cap);
    // (the ribs go out over the hall: from its back corners toward its middle and along its walls)
    const dirs: [number, number, number, number][] = i === 0 ? into : [[-1, 0, reach, climb], [0, 1, reach, climb], [-1, 1, reach * 1.2, climb * 1.1]];
    ribs(D, look, L, x, y, cap + 12, dirs);
  });
  if (look !== 'cold') return;
  for (const [x, y] of PIERS_C) {
    pier(D, look, L, x, y, cap);
    ribs(D, look, L, x, y, cap + 12, into);
  }
}

/** The stacks of the dead along the walls (look C): long boxes faced with rows of bone ends, bands of skulls. */
export const STACKS: readonly { x0: number; y0: number; x1: number; y1: number; h: number }[] = [
  { x0: -3.95, y0: 7.85, x1: -3.45, y1: 11.6, h: 34 },
  { x0: -3.2, y0: 1.05, x1: 0.6, y1: 1.55, h: 30 },
  { x0: -0.95, y0: -8.4, x1: -0.45, y1: -7.2, h: 40 },
  { x0: -0.95, y0: -3.6, x1: -0.45, y1: -1.4, h: 40 },
];

export function paintStacks(D: Deep, look: Look, L: Lights): void {
  if (look !== 'cold') return;
  const P = PALS[look];
  const iso = new Iso(D, PICTURE.OX, PICTURE.OY);
  for (const s of STACKS) {
    if (s.h <= 0) continue;
    const face = (u: number, up: number, down: number): string => {
      // bands: bone ends 3 rows, then a band of skulls, then bone ends, a row of skulls on top
      const band = up < 9 ? 'bone' : up < 17 ? 'skull' : up < s.h - 8 ? 'bone' : 'skull';
      if (band === 'skull') {
        const j = up < 17 ? 16 - up : s.h - 1 - up;
        const sk = skullPx(P, ((u % 9) + 9) % 9, j, down);
        return sk ?? mixC(P.bone[0], P.beyond, 0.4);
      }
      const r = Math.floor(up / 3);
      const k = knucklePx(P, ((u + (r % 2 ? 2 : 0)) % 5 + 5) % 5, 2 - (up % 3), down);
      return k ?? mixC(P.bone[0], P.beyond, 0.4);
    };
    iso.box(s.x0, s.y0, s.x1, s.y1, 0, s.h, {
      top: (u, v) => {
        const x = s.x0 + u * (s.x1 - s.x0);
        const y = s.y0 + v * (s.y1 - s.y0);
        D.depth = x + y + s.h / 16;
        const n = hash(Math.floor(x * 14), Math.floor(y * 14), 981);
        return lit(P, n > 0.5 ? P.bone[3] : n > 0.2 ? P.bone[2] : P.bone[1], x, y, s.h, L);
      },
      left: (u, v) => {
        const x = s.x0 + (u + 0.5) / ISO_X;
        D.depth = x + s.y1;
        return lit(P, face(u, s.h - 1 - v, 0), x, s.y1, s.h - v, L);
      },
      right: (u, v) => {
        const y = s.y1 - (u + 0.5) / ISO_X;
        D.depth = s.x1 + y;
        return lit(P, face(u, s.h - 1 - v, 1), s.x1, y, s.h - v, L);
      },
    });
  }
}

/** THE SHAFTS of grey light (look C): where each falls on the floor. */
export const SHAFTS: readonly Rect[] = [
  { x0: 3.0, y0: -6.6, x1: 5.8, y1: -3.6 },
  { x0: 3.6, y0: 8.4, x1: 5.6, y1: 10.4 },
  { x0: -2.8, y0: 2.4, x1: -1.2, y1: 4.0 },
];
export function shaftPatches(look: Look): Patch[] {
  if (look !== 'cold') return [];
  return SHAFTS.map((s, i) => ({ ...s, z: 0, r: i === 0 ? 1.7 : 1.3, k: 3, kind: 'cold' as const }));
}
/** The shaft seen in the air: a haze of two-pixel squares in a checker, falling from the dark above onto its patch, leaning as the light comes from the upper left; fainter as it rises. */
export function shaftHaze(D: Deep, look: Look, keepClear: [number, number, number][]): void {
  if (look !== 'cold') return;
  const P = PALS[look];
  if (!P.cold) return;
  const LEAN = 0.3;
  for (const s of SHAFTS) {
    // (for each slant line u = px + LEAN * py, the lowest point of the patch on it: the beam is everything above that)
    const foot = new Map<number, number>();
    for (let x = s.x0; x <= s.x1; x += 0.01) {
      for (let y = s.y0; y <= s.y1; y += 0.01) {
        const [px, py] = atPx(x, y);
        const u = Math.round((px + LEAN * py) / 2);
        foot.set(u, Math.max(foot.get(u) ?? -1e9, py));
      }
    }
    for (let py = 0; py < D.h; py += 2) {
      for (let px = 0; px < D.w; px += 2) {
        if (((px >> 1) + (py >> 1)) % 2) continue;
        const u = Math.round((px + LEAN * py) / 2);
        const f = foot.get(u);
        if (f === undefined || py > f) continue;
        if (keepClear.some(([cx, cy, r]) => Math.hypot(px - cx, (py - cy) * 1.3) < r)) continue;
        const up = f - py;
        const streak = ((u % 9) + 9) % 9 < 3 ? 0.03 : 0;
        const k = (up < 110 ? 0.13 : up < 240 ? 0.09 : up < 400 ? 0.06 : 0.035) + streak;
        for (let dy = 0; dy < 2; dy++) for (let dx = 0; dx < 2; dx++) {
          const o = D.get(px + dx, py + dy);
          if (!o || SHINE.has(o)) continue;
          D.over(px + dx, py + dy, mixC(o, P.cold[2], k));
        }
      }
    }
  }
}

// =================================================================================================
// EVERY LIGHT OF A LOOK, the hero's pool with them

export function lightsOf(look: Look, heroAt: [number, number]): Lights {
  const lamps: Lamp[] = [...nicheLamps(look), ...candleLamps(look), ...lanternLamps(look)];
  const patches: Patch[] = [...shaftPatches(look)];
  // the cult's candles on its altar, on the dais
  lamps.push({ x: 4.0, y: -9.0, z: 30, r: look === 'candle' ? 2.2 : 1.9, k: 3, kind: 'warm' });
  if (look === 'breach') {
    // the miners' lanterns on the walls (floor 4's own, set where the page stands them)
    for (const [along, face, ax] of WALL_LANTERNS) lamps.push({ x: ax ? along : face + 0.35, y: ax ? face + 0.35 : along, z: 44, r: 2.0, k: 3, kind: 'warm' });
  }
  if (look === 'cold') {
    // two braziers of the cult before the dais: the only fire on the floor but the altar's
    for (const [x, y] of BRAZIERS_C) lamps.push({ x, y, z: 24, r: 1.7, k: 3, kind: 'warm' });
  }
  lamps.push({ x: heroAt[0], y: heroAt[1], z: 20, r: 1.7, k: 2, kind: 'pool' });
  return { lamps, patches };
}
/** Where the miners' lanterns (floor 4's own) hang on the walls in look B: along the wall, the wall's face, along x? */
export const WALL_LANTERNS: readonly [number, number, boolean][] = [[1.5, 2, false], [-0.5, 1, true], [0.5, -10, true], [6.5, 7, true], [-3.5, 7, true], [-8.5, -1, false]];
/** The cult's braziers in his hall, look C. */
export const BRAZIERS_C: readonly [number, number][] = [[2.0, -7.7], [6.2, -7.7]];
