// FLOOR 2, THE HEADSMAN'S FLOOR, AS THE PRISON'S GROUNDS AT NIGHT: ITS PIECES, READY FOR THE GAME (the art chat, 2 Nov 2026).
// Behind the switch GROUNDS, off; nothing of the game imports it until the main chat puts it in.
//
// His words, 2 Nov 2026: asked whether to redo floor 2's halls, “Yes, redo the halls (Recommended)” (the condemned's road:
// holding cells, the long walk and a last-rites chapel, torchlit, leading out into his yard at night). Shown three looks of
// indoor halls, he asked: “I was looking for this level to be pretty open, is this just for the beginning of the level to get
// you to the yard then it opens up, or is this how the whole level is and only his boss area is outside?” Asked whether more
// of it should be outside, his pick: “Mostly outside”, offered as: the prison's grounds at night: cell blocks with open
// courtyards between, crossing under the sky to his yard.
//
// BUILT ON HIS YARD (art/yard.ts, his yes, behind YARD; unchanged): its cobbles, puddles, beaten earth and gutters; its high
// outer wall with its wall-walk and battlements; its tower; its night sky over the walls; its torch. And on his yard's own gate
// (art/yard_gate.ts, unchanged), the way into his yard at the end. Everything new here is in the yard's night colours and
// measures (picture pixels, two to a game pixel; a tile a diamond 64 x 32), anchored as the yard's pieces are:
//
//   floor(tx, ty)      THE COURTYARDS' COBBLES: the yard's own (the same pictures)
//   walk(tx, ty)       THE LONG WALK: big worn flags laid on the world, paler than the cobbles, the condemned's road
//   tiles              mud, straw, weeds at a wall's foot (along x, along y); and the yard's own (puddles, earth, gutters, sawdust)
//   block              THE CELL BLOCKS a tile at a time, as the game lays walls (along x turned to screen-left and lit; along y
//                      to screen-right, in shade): 150 high as the yard's wall, two storeys of barred cell windows (some lit
//                      within), iron-studded doors, a torch's bay, scratched tallies, a block's corner; a slate roof over
//   wall, tower,       the yard's own: the prison's high outer wall, its watchtower, the night sky over the walls (the moon, the
//   beyond             stars, the keep)
//   gateway(..)        THE WAYS BETWEEN COURTYARDS through a cell block, as strips (art/gates.ts, Flat): a battlemented gatehouse
//                      over a round arch three tiles wide, open or with its portcullis drawn up; and THE GAOLER'S DOOR, his
//                      house's gable end with its two oak leaves swung back against it and his lantern over it
//   chapel(..)         THE LAST-RITES CHAPEL'S FRONT, three tiles of a block's face: a gable and its bell-cote, a lit doorway
//   wayIn(..)          WHERE YOU ARRIVE: the stair down from floor 1, in the gaoler's room's back wall, floor 1's light at its head
//   gaol               THE GAOLER'S ROOM, inside: its flags, its walls (80 high and fading as the game's, its keys, its hatch)
//   pieces             the well, the tumbril (along x, along y), floor 2's own pieces in the night's colours, the yard's torch
//                      and wide puddles
//
// NOT PAINTED IN: the dark and the light. As everywhere in the game the renderer lays its darkness and cuts a hole in it where a
// light burns (render.ts). GROUNDS_LIGHTS below says what lights to place; the dark under the sky is the yard's.
//
// His art rulebook kept: crisp pixels; one camera; light from the upper left (a face turned to screen-left lit, one to
// screen-right in shade); seams a deep indigo, never black; the place a step quieter than the figures; nothing glowing cyan (the
// friend's) or pink (the enemy's); fire an honest orange; real shapes, not circles and squares; original designs, no letters.

import { Px } from '../engine/px';
import type { Light, Sprite } from '../engine/px';
import { Iso, ISO_X } from './isokit';
import type { SideShader } from './isokit';
import { GRAIN, hash } from './kit';
import { COAL, EMBER, stoneOf } from './props';
import { SHINES } from './floorkit';
import type { Piece, Spot } from './floorkit';
import { HOOD, RAVEN, headsmanPieces } from './floor2';
import { CRYPT_FLOORS, OLD_IRON, OLD_RUST, TIMBER as CRYPT_TIMBER } from './crypt';
import { FLAME } from './mkit';
import { Flat, STRIP } from './gates';
import type { Strip } from './gates';
import { makeYardArt } from './yard';

/** THE SWITCH: off until his yes to the grounds in play. */
export const GROUNDS = { on: false };

// =================================================================================================
// MEASURES

const TW = 32 * GRAIN;
const TH = 16 * GRAIN;
const HALF = TW / 2;
/** How high a cell block's face stands to its eaves (the yard's wall's height), and how high its roof rises over a tile. */
export const BLOCK_H = 120;
export const ROOF = 28;
/** The gatehouse over a way between courtyards: its parapet's coping, and its merlons over that. */
export const GATEHOUSE = { top: 156, merlon: 24 };
/** The way through a gateway (from the doorway's middle): its half width, its spring, its rise. Three tiles, as the game's ways. */
export const GATEWAY = { half: 44, spring: 64, rise: 38, ring: 14 };
/** The gaoler's door: the way through his house's gable end, three tiles as the game's; his house's gable peak. */
export const GAOL_DOOR = { half: 44, spring: 54, rise: 28, ring: 10, peak: 186 };
/** The gaoler's room's walls inside: the game's (WALL_LOOK.tall 40 game pixels, its top 12 fading in four steps). */
export const GAOL_WALL = 80;
export const GAOL_FADE = 24;
const FADE_STEPS = [0.14, 0.38, 0.62, 0.84];
/** The stair down from floor 1: its arch (two tiles across, in the middle of three), its steps. */
export const WAY_IN = { half: 30, spring: 34, rise: 24, ring: 8, steps: 10, run: 0.27, rise1: 8 };
/** The chapel's front: its gable's peak, its doorway, its bell-cote. */
export const CHAPEL_FRONT = { peak: 186, cote: 212, door: { half: 14, spring: 34, rise: 14 } };

// =================================================================================================
// THE NIGHT'S COLOURS (the yard's, his pick B): five tones a material, its seam to its lit edge

type R5 = readonly [string, string, string, string, string];
/** (the yard's stone; its moonlit edge a touch under the darkest word, as the yard's wall keeps it at the 99th of its pixels) */
const STONE: R5 = ['#0e0c24', '#1b1c36', '#262850', '#343867', '#4e5886'];
const COBBLE: R5 = ['#0e0c22', '#1a1b32', '#242642', '#303355', '#4c5482'];
const EARTH: R5 = ['#0e0c1c', '#1b1526', '#261d32', '#32273e', '#433552'];
const TIMBER: R5 = ['#120d1a', '#20182a', '#2f2338', '#3f3046', '#53435a'];
const IRON: R5 = ['#0e0c24', '#1a1c32', '#282b46', '#393d5e', '#5c628a'];
const SLATE: R5 = ['#0d0e20', '#16182e', '#1f223e', '#2a2e50', '#404672'];
const MOSS = ['#131b22', '#1c272b', '#273436'] as const;
const PUDDLE = ['#141a36', '#26305e', '#46558c'] as const;
/** The long walk's flags: a paler dressed stone, worn smooth, so the road reads under the moon. */
const FLAG: R5 = ['#0e0c24', '#222540', '#2e3354', '#3b4268', '#56608c'];
/** Straw under the moon: its yellow gone grey. */
const STRAW: R5 = ['#1c1824', '#36303c', '#4e4650', '#665c60', '#7e7270'];
/** Weeds at a wall's foot: a dark green, moonlit at their tips. */
const WEED: R5 = ['#0f1618', '#16211f', '#1e2d27', '#2a3d31', '#3a503c'];
/** The chapel's finer stone, a step paler than the cell blocks'. */
const FINE: R5 = ['#0e0c24', '#1f2140', '#2c2f58', '#3a3f70', '#4e5888'];
const SEAM = '#0e0c24';
const VOID = '#04040a';
/** Light in a window or a doorway: an honest orange, dim (the yard's far windows). */
const WINDOW = ['#7a3a22', '#a8502a', '#e07a36'] as const;
/** Floor 1's light at the head of the stair (its tomb's green-gold, faint). */
const ABOVE = ['#2a2e26', '#4a5038', '#7a8050', '#b8be7a'] as const;
const FIRE = EMBER;

const clampK = (k: number): number => Math.max(0, Math.min(4, k));
function hexOf(c: string): [number, number, number] {
  const n = parseInt(c.slice(1, 7), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
function mixC(a: string, b: string, k: number): string {
  const [r0, g0, b0] = hexOf(a);
  const [r1, g1, b1] = hexOf(b);
  const f = (v: number): string => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0');
  return `#${f(r0 + (r1 - r0) * k)}${f(g0 + (g1 - g0) * k)}${f(b0 + (b1 - b0) * k)}`;
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
const fbm = (x: number, y: number, k = 0): number => 0.55 * noise(x, y, k) + 0.3 * noise(x * 2.1, y * 2.1, k + 11) + 0.15 * noise(x * 4.3, y * 4.3, k + 23);
const mod = (a: number, n: number): number => ((a % n) + n) % n;
const halfWidth = (y: number): number => (y < TH / 2 ? 2 * y + 1 : 2 * (TH - 1 - y) + 1);
function onTile(x: number, y: number): [number, number] {
  const px = x + 0.5 - HALF;
  const py = y + 0.5;
  return [(px / HALF + py / (TH / 2)) / 2, (py / (TH / 2) - px / HALF) / 2];
}
/** A sprite's pixels, whether painted under the game's canvas or the tests'. */
export function pixelsOf(s: Sprite): Px {
  const img = s.img as unknown;
  if (img instanceof Px) return img;
  const c = s.img;
  const q = c.getContext('2d') as CanvasRenderingContext2D;
  const d = q.getImageData(0, 0, c.width, c.height).data;
  const p = new Px(c.width, c.height);
  p.d.set(d);
  return p;
}
/** A floor tile's picture from a painter of the world (x, y in tiles). */
function tileOf(paint: (x: number, y: number) => string | null, tx: number, ty: number): Sprite {
  const p = new Px(TW, TH);
  for (let y = 0; y < TH; y++) {
    const hw = halfWidth(y);
    for (let x = HALF - hw; x < HALF + hw; x++) {
      const [u, v] = onTile(x, y);
      const c = paint(tx + u, ty + v);
      if (c) p.set(x, y, c);
    }
  }
  return p.sprite(HALF, 0, GRAIN);
}

// =================================================================================================
// THE YARD'S COBBLES (the same stones, laid on the world, so a tile of mud, straw or weeds meets the yard's own cobbles exactly)

const CS = 0.25;
const CELLS = 4 / CS;
const wrap = (i: number): number => ((i % CELLS) + CELLS) % CELLS;
function cobbleAt(x: number, y: number, r: R5 = COBBLE): string {
  const gi = Math.floor(x / CS);
  const gj = Math.floor(y / CS);
  let d1 = 9;
  let d2 = 9;
  let ci = 0;
  let cj = 0;
  let cx = 0;
  let cy = 0;
  for (let a = -1; a <= 1; a++) for (let b = -1; b <= 1; b++) {
    const i = gi + a;
    const j = gj + b;
    const fx = (i + 0.2 + 0.6 * hash(wrap(i), wrap(j), 61)) * CS;
    const fy = (j + 0.2 + 0.6 * hash(wrap(i), wrap(j), 62)) * CS;
    const d = Math.hypot(x - fx, y - fy);
    if (d < d1) {
      d2 = d1;
      d1 = d;
      ci = wrap(i);
      cj = wrap(j);
      cx = fx;
      cy = fy;
    } else if (d < d2) d2 = d;
  }
  if (d2 - d1 < 0.032) return hash(ci * 3 + cj, Math.floor((x + y) * 20) & 63, 69) > 0.93 ? MOSS[1] : r[0];
  const ex = (x - cx) / Math.max(0.05, d1);
  const ey = (y - cy) / Math.max(0.05, d1);
  const toLight = (-ex + ey) * Math.SQRT1_2;
  const edge = d1 / d2 > 0.62;
  let k = 2;
  const tone = hash(ci, cj, 71);
  if (tone < 0.18) k = 1;
  else if (tone > 0.9) k = 3;
  if (edge && toLight > 0.35) k += 1;
  if (edge && toLight < -0.35) k -= 1;
  return r[clampK(k)];
}

// =================================================================================================
// THE LONG WALK: big flags in rows half a tile wide running along x, each its own length, worn smooth and pale in the middle of
// each flag, chipped at a corner here and there; laid on the world, so any run of walk tiles meets itself (repeats every 4 tiles)

function walkAt(x: number, y: number): string {
  const row = Math.floor(y * 2);
  const off = hash(mod(row, 8), 0, 83) * 1.3;
  const len = 0.6 + 0.35 * hash(mod(row, 8), 1, 83);
  const a = x + off;
  const k0 = Math.floor(a / len);
  const fu = a / len - k0;
  const fv = y * 2 - row;
  const id = hash(mod(k0, 16), mod(row, 8), 85);
  if (fv < 0.07 || fu < 0.035) return SEAM;
  let k = id < 0.2 ? 1 : 2;
  // (the edge toward the light lit, the edge away in shade)
  if (fv > 0.88 || fu < 0.09) k += 1;
  if (fv < 0.16 || fu > 0.95) k -= 1;
  // (worn pale where feet went: the middle of each flag)
  if (Math.abs(fv - 0.52) < 0.24 && fu > 0.2 && fu < 0.8 && fbm(x * 3, y * 3, 87) > 0.5) k += 1;
  // (a crack across a flag, now and then; a corner chipped)
  if (id > 0.86 && Math.abs(fu - 0.3 - fv * 0.4) < 0.025) return FLAG[0];
  if (id > 0.7 && fu > 0.88 && fv > 0.75) return EARTH[1];
  return FLAG[clampK(k)];
}

// =================================================================================================
// THE GROUNDS' OWN FLOOR TILES (laid over the cobbles here and there)

function mudTile(seed: number): Sprite {
  return tileOf((x, y) => {
    const d = Math.hypot((x - 0.5) / 0.5, (y - 0.5) / 0.46) + (fbm(x * 4 + seed, y * 4, seed) - 0.5) * 0.7;
    if (d > 1) return cobbleAt(x, y);
    if (d > 0.9) return EARTH[1];
    // (ruts and hoof-pocks, wet; the moon in the wettest)
    const rut = Math.abs(((x - y * 0.3) * 4.2 + fbm(x * 2, y * 2, seed + 2) * 1.6) % 1);
    const wet = fbm(x * 3 + 7, y * 3, seed + 4);
    if (wet > 0.66) return Math.abs(((x - y) * 2.4) % 1) < 0.1 ? PUDDLE[2] : PUDDLE[wet > 0.72 ? 1 : 0];
    if (rut < 0.12) return EARTH[0];
    if (rut > 0.88) return EARTH[3];
    return EARTH[hash(Math.floor(x * 24), Math.floor(y * 24), seed) > 0.85 ? 1 : 2];
  }, 0, 0);
}
/** Straws over the cobbles: short lines lying every which way, lit along their tops; a drift of them in the middle. */
function strawTile(seed: number, drift: number): Sprite {
  const straws: [number, number, number, number][] = [];
  for (let i = 0; i < 70; i++) {
    const cx = hash(i, 1, seed);
    const cy = hash(i, 2, seed);
    const far = Math.hypot(cx - 0.5, cy - 0.5);
    if (far > 0.25 + drift * 0.3 && hash(i, 5, seed) > 0.35) continue;
    const a = hash(i, 3, seed) * Math.PI;
    const l = 0.08 + 0.1 * hash(i, 4, seed);
    straws.push([cx, cy, Math.cos(a) * l, Math.sin(a) * l]);
  }
  return tileOf((x, y) => {
    const dd = Math.hypot((x - 0.5) / 0.36, (y - 0.5) / 0.32) + (fbm(x * 5, y * 5, seed) - 0.5) * 0.5;
    if (drift > 0.5 && dd < 0.7) {
      const f = hash(Math.floor(x * 30), Math.floor(y * 30), seed + 3);
      return STRAW[f > 0.6 ? 3 : f > 0.25 ? 2 : 1];
    }
    for (const [cx, cy, dx, dy] of straws) {
      const t = Math.max(0, Math.min(1, ((x - cx) * dx + (y - cy) * dy) / (dx * dx + dy * dy)));
      const d = Math.hypot(x - cx - dx * t, y - cy - dy * t);
      if (d < 0.018) return STRAW[t < 0.5 ? 3 : 2];
      if (d < 0.03) return STRAW[1];
    }
    return cobbleAt(x, y);
  }, 0, 0);
}
/** Weeds at a wall's foot: tufts along the tile's far edge (along x: at v near 0; along y: at u near 0), grass in the joints out from it. */
function weedTile(alongX: boolean, seed: number): Sprite {
  return tileOf((x, y) => {
    const across = alongX ? y : x;
    const along = alongX ? x : y;
    const reach = 0.16 + 0.22 * fbm(along * 5, 1, seed);
    if (across < reach) {
      // (blades: thin strokes leaning, lit at their tips)
      const blade = Math.floor(along * 26 + Math.floor(across * 9) * 0.37);
      const h = hash(blade, Math.floor(across * 12), seed + 1);
      if (h > 0.55) return WEED[across < reach * 0.4 ? 1 : h > 0.85 ? 4 : 3];
      return WEED[across < reach * 0.5 ? 0 : 2];
    }
    const c = cobbleAt(x, y);
    if (c === COBBLE[0] && across < 0.6 && hash(Math.floor(x * 40), Math.floor(y * 40), seed + 2) > 0.4) return WEED[2];
    return c;
  }, 0, 0);
}

// =================================================================================================
// STONE, AS IT IS PAINTED ON A FACE (u along it, up from the floor)

/** The prison's dressed stone in courses, by (u, up): `lit` its face turned to the light. */
function stoneAt(r: R5, u: number, up: number, lit: boolean, seed: number, course = 12): string {
  const c = Math.floor(up / course);
  const lv = course - 1 - (up % course);
  const off = Math.floor(hash(c, seed, 1) * 40);
  const L = 22 + Math.floor(hash(c, seed, 2) * 14);
  const b = Math.floor((u + off + 400) / L);
  const lu = (u + off + 400) % L;
  if (lv === course - 1 || lu === 0) return r[0];
  let k = lit ? 2 : 1;
  const tone = hash(b, c * 7 + seed, 3);
  if (tone < 0.1) k -= 1;
  else if (tone > 0.93) k += 1;
  if (lv === 0) k += 1;
  if (lit && lu === 1) k += 1;
  if (lv === course - 2 || lu === L - 1) k -= 1;
  if (hash(u >> 1, up >> 1, seed + 5) < 0.025) k -= 1;
  if (up < 10) k -= 1;
  return r[clampK(k)];
}
/** Big dressed blocks, a step lighter (quoins, jambs, a plinth). */
function dressedAt(u: number, up: number, lit: boolean, r: R5 = STONE, h = 12): string {
  const c = Math.floor(up / h);
  const lv = up % h;
  if (lv === 0) return r[0];
  let k = lit ? 3 : 2;
  if (lv === h - 1) k += 1;
  if (lv === 1) k -= 1;
  if (hash(c, Math.floor(u / 6), 97) < 0.15) k -= 1;
  return r[clampK(k)];
}
/** Is a point (du from a way's middle, up) in a round-headed way? */
export function inRound(du: number, up: number, half: number, spring: number, rise: number): boolean {
  if (Math.abs(du) >= half) return false;
  if (up < spring) return up >= 0;
  return (du / half) ** 2 + ((up - spring) / rise) ** 2 < 1;
}
/** The ring of wedge stones round a round-headed way, at a point, if it is on it (du less than 0 toward the light). */
function ringAt(r: R5, du: number, up: number, half: number, spring: number, rise: number, ring: number, lit: boolean, stones = 11): string | null {
  const dn = lit ? 0 : 1;
  if (inRound(du, up, half, spring, rise)) return null;
  if (up < spring) {
    const a = Math.abs(du);
    if (a >= half + ring * 0.6) return null;
    if (a - half < 1.2) return r[clampK((du < 0 ? 4 : 1) - dn)];
    if (up % 14 === 0) return r[0];
    return r[clampK(3 - dn)];
  }
  const nx = du / (half + ring);
  const ny = (up - spring) / (rise + ring);
  if (nx * nx + ny * ny >= 1) return null;
  const ang = Math.atan2(up - spring, du * (rise / half));
  const seg = (ang / Math.PI) * stones;
  const near = Math.abs(seg - Math.round(seg));
  if (near < 0.07) return r[0];
  const inner = (du / (half + 1.6)) ** 2 + ((up - spring) / (rise + 1.6)) ** 2 < 1;
  if (inner) return r[clampK((du < 0 ? 4 : 1) - dn)];
  if (nx * nx + ny * ny > 0.93) return r[clampK(1 - dn)];
  return r[clampK((Math.floor(seg) % 2 ? 3 : 2) - dn)];
}

// =================================================================================================
// THE CELL BLOCKS, a tile at a time: two storeys of barred cell windows, a string course between, a plinth, a cornice, a slate
// roof over; the kinds of tile vary along a block so that nothing is the same on two tiles side by side

export type BlockKind = 'cells' | 'lit above' | 'lit below' | 'door' | 'torch' | 'tallies' | 'corner, low end' | 'corner, high end';
export const BLOCK_KINDS: readonly BlockKind[] = ['cells', 'lit above', 'lit below', 'door', 'torch', 'tallies', 'corner, low end', 'corner, high end'];
/** The order the kinds come in along a block (a corner at a block's two ends, where the main chat asks for it). */
const BLOCK_ORDER: readonly BlockKind[] = ['cells', 'door', 'lit above', 'torch', 'cells', 'tallies', 'lit below', 'door'];
/** The cell windows: their middle across the tile, their half width, and the storeys' sills and heads. */
const WIN = { mid: 16, half: 6, storeys: [[30, 50], [74, 96]] as const };
const STRING = 60;
const PLINTH = 14;
/** How high a block's torch is set (the yard's: 92). */
export const BLOCK_TORCH_UP = 92;

/** A barred cell window at (du from its middle, up from its sill), lit within or dark; null off it. */
function cellWindow(du: number, up: number, h: number, lit: boolean, inside: 'dark' | 'lit'): string | null {
  const a = Math.abs(du);
  const half = WIN.half;
  if (a > half + 2 || up < -3 || up > h + 3) return null;
  // (its surround of dressed stone: a lintel, a sill, the jambs)
  if (up > h) return up === h + 3 ? SEAM : STONE[lit ? 4 : 3];
  if (up < 0) return up === -3 ? STONE[lit ? 4 : 3] : up === -1 ? SEAM : STONE[lit ? 3 : 2];
  if (a > half) return a === half + 1 ? SEAM : STONE[lit ? 3 : 2];
  // (the bars, three uprights and a cross bar; their lit edge toward the light)
  const bar = du === -3 || du === 0 || du === 3;
  const barL = du === -4 || du === -1 || du === 2;
  const cross = up === Math.floor(h / 2) || up === Math.floor(h / 2) + 1;
  if (bar || cross) return IRON[cross && !bar ? 2 : lit ? 3 : 2];
  if (barL) return inside === 'lit' ? IRON[1] : IRON[1];
  if (inside === 'lit') return up < h * 0.4 ? WINDOW[2] : up < h * 0.75 ? WINDOW[1] : WINDOW[0];
  return up > h - 3 ? SEAM : VOID;
}
/** The iron-studded door of a block at (du from its middle, up). */
function blockDoor(du: number, up: number, lit: boolean): string | null {
  const half = 9;
  const H = 46;
  const a = Math.abs(du);
  if (a > half + 4 || up > H + 6) return null;
  // (the lintel, a single big stone, and the jambs)
  if (up > H) return up === H + 6 ? SEAM : up === H + 1 ? STONE[0] : dressedAt(du + 40, up, lit, STONE, 6);
  if (a > half) return a === half + 1 ? SEAM : dressedAt(du + 40, up, lit, STONE, 9);
  // (the leaf: upright oak boards, three iron straps with studs, a ring)
  const strap = [8, 22, 36].some((s) => up >= s && up < s + 3);
  if (strap) {
    if ((du + 9) % 4 === 1 && up % 3 === 1) return IRON[4];
    return IRON[up % 3 === 0 ? 3 : 2];
  }
  if (Math.abs(du - 4) <= 1 && up >= 17 && up <= 20) return IRON[lit ? 4 : 3];
  if (a === half) return TIMBER[0];
  const board = Math.floor((du + 9) / 4);
  if ((du + 9) % 4 === 0) return TIMBER[0];
  return TIMBER[clampK((lit ? 2 : 1) + (hash(board, Math.floor(up / 5), 77) > 0.85 ? -1 : 0) + ((du + 9) % 4 === 1 && lit ? 1 : 0))];
}
/** Scratched tallies, in fives, low on a face. */
function tallyAt(u: number, up: number): boolean {
  if (up < 18 || up > 34) return false;
  const g = Math.floor((u - 3) / 12);
  if (g < 0 || g > 1) return false;
  const lu = (u - 3) % 12;
  if (lu < 8 && lu % 2 === 0 && up < 32) return true;
  return Math.abs(lu - (up - 18) * 0.55) < 0.6 && up < 33;
}
/** A face of a block: `kind`, `lit` (turned to the light), `ue` the column of the face's low end (along x its left, along y its right). */
function blockShade(kind: BlockKind, lit: boolean, seed: number): SideShader {
  return (u0, v, w, h) => {
    const u = lit ? u0 : w - 1 - u0;
    const up = h - 1 - v;
    const dn = lit ? 0 : 1;
    // THE CORNICE, its lit top edge, its shadow under
    if (v < 6) return v === 0 ? STONE[clampK(4 - dn)] : v === 5 ? SEAM : v === 1 ? STONE[clampK(3 - dn)] : STONE[clampK(2 - dn)];
    // THE QUOINS at a block's end
    if (kind === 'corner, low end' || kind === 'corner, high end') {
      const e = kind === 'corner, low end' ? u : w - 1 - u;
      const c = Math.floor(up / 12);
      const wq = c % 2 ? 9 : 15;
      if (e < wq) return e === wq - 1 || up % 12 === 0 ? SEAM : dressedAt(e, up, lit);
    }
    const du = u - WIN.mid;
    // THE DOOR, through the plinth (a window over it)
    if (kind === 'door') {
      const d = blockDoor(du, up, lit);
      if (d) return d;
    }
    // THE STRING COURSE between the storeys
    if (up >= STRING && up < STRING + 4) return up === STRING + 3 ? STONE[clampK(4 - dn)] : up === STRING ? SEAM : STONE[clampK(2 - dn)];
    // THE PLINTH, big blocks
    if (up < PLINTH) {
      if (up === PLINTH - 1) return STONE[clampK(3 - dn)];
      if (up < 5 && hash(u >> 1, up, seed + 13) < 0.45 - up * 0.08) return MOSS[up < 2 ? 0 : 1];
      return mod(u + seed * 3, 20) === 0 ? SEAM : STONE[clampK(1 - dn + (hash(Math.floor((u + seed * 3) / 20), 0, seed) > 0.8 ? 1 : 0))];
    }
    // THE WINDOWS, two storeys (a door's tile has only the upper one; a torch's bay has none)
    if (kind !== 'torch') {
      for (let s = 0; s < 2; s++) {
        if (kind === 'door' && s === 0) continue;
        if ((kind === 'corner, low end' || kind === 'corner, high end') && s === 1) continue;
        const [sill, head] = WIN.storeys[s];
        const inside = (kind === 'lit above' && s === 1) || (kind === 'lit below' && s === 0) ? 'lit' : 'dark';
        const c = cellWindow(du, up - sill, head - sill, lit, inside);
        if (c) return c;
      }
    }
    // SOOT over the torch, streaked up the face from its fire to the cornice
    if (kind === 'torch' && up > BLOCK_TORCH_UP + 14) {
      const spread = 3 + (up - BLOCK_TORCH_UP) * 0.08;
      if (Math.abs(du) < spread && hash(u, up >> 2, seed + 21) > 0.2 + Math.abs(du) / spread * 0.5) return STONE[0];
    }
    if (kind === 'tallies' && tallyAt(u, up)) return STONE[clampK(3 - dn)];
    // (a drip stain under each sill)
    for (const [sill] of WIN.storeys) if (kind !== 'torch' && Math.abs(du) < 4 && up < sill - 3 && up > sill - 16 && hash(u, 1, seed + 25) > 0.55) return STONE[clampK(1 - dn)];
    return stoneAt(STONE, u + seed * 7, up, lit, seed);
  };
}
/** The slate roof over a tile of block, rising away from its eaves: courses of slates, the ridge's tiles at the back, moss here and there. */
function roofShade(lit: boolean, seed: number): (t: number, s: number) => string {
  return (t, s) => {
    const dn = lit ? 0 : 1;
    if (t < 0.07) return SLATE[clampK(4 - dn)];
    if (t > 0.9) return t > 0.97 ? STONE[clampK(3 - dn)] : STONE[clampK(2 - dn)];
    const row = Math.floor(t * 8);
    if (t * 8 - row < 0.14) return SLATE[0];
    const cell = Math.floor(s * 5 + (row % 2) * 0.5);
    if (Math.abs(s * 5 + (row % 2) * 0.5 - Math.round(s * 5 + (row % 2) * 0.5)) < 0.05) return SLATE[1];
    if (fbm(s * 4 + seed, t * 4, seed) > 0.7) return MOSS[2];
    return SLATE[clampK((hash(cell, row, seed) > 0.8 ? 3 : 2) - dn + (t * 8 - row > 0.8 ? 1 : 0))];
  };
}
/** A tile of cell block: its face (along x turned to screen-left and lit, along y to screen-right in shade) and its roof. Anchored as the game's walls are: at the floor point of the tile's top corner. */
function blockTile(kind: BlockKind, alongX: boolean, seed: number): Sprite {
  const H = BLOCK_H;
  const top = ROOF + 2;
  const p = new Px(TW, TH + H + top);
  const iso = new Iso(p, HALF, H + top);
  if (alongX) {
    iso.slopeLeft(0, 1, 1, H, 0, 1, 0, H + ROOF, roofShade(true, seed));
    iso.left(0, 1, 1, 0, H, blockShade(kind, true, seed));
  } else {
    iso.slopeRight(1, 0, 1, H, 0, 0, 1, H + ROOF, roofShade(false, seed));
    iso.right(1, 0, 1, 0, H, blockShade(kind, false, seed));
  }
  const s = p.sprite(HALF, H + top, GRAIN);
  if (kind === 'lit above' || kind === 'lit below') {
    // (the lit window's own glow: dim, warm)
    const up = kind === 'lit above' ? 85 : 40;
    const [x, y] = iso.at(alongX ? 0.5 : 1, alongX ? 1 : 0.5, up);
    s.lights = [{ x: x / GRAIN, y: y / GRAIN, r: 10, color: WINDOW[2], a: 0.3 } as Light];
  }
  return s;
}

// =================================================================================================
// THE GATEWAYS between courtyards (strips, art/gates.ts Flat): from u -32 (the tile before the doorway) to u 128 (the tile after)

export type GatewayKind = 'open' | 'barred' | 'gaol';
const G0 = -32;
const G1 = 128;
/** A gatehouse over a round arch three tiles wide, battlemented; `barred`, its portcullis drawn up into the arch's head. */
function gatehouse(lit: boolean, barred: boolean): Flat {
  const H = GATEHOUSE.top + GATEHOUSE.merlon;
  const f = new Flat(G0, G1, H);
  const A = GATEWAY;
  const dn = lit ? 0 : 1;
  for (let u = G0; u < G1; u++) {
    for (let up = 0; up < H; up++) {
      const du = u - 48;
      // (the battlements: merlons on the parapet, the coping under them)
      if (up >= GATEHOUSE.top) {
        const m = mod(u - G0, 26);
        if (m >= 15) continue;
        const c = up === H - 1 ? STONE[clampK(4 - dn)] : m === 0 ? STONE[clampK(3 - dn)] : m === 14 ? SEAM : stoneAt(STONE, u, up, lit, 611);
        f.set(u, up, c);
        continue;
      }
      if (up >= GATEHOUSE.top - 5) {
        f.set(u, up, up === GATEHOUSE.top - 1 ? STONE[clampK(4 - dn)] : up === GATEHOUSE.top - 5 ? SEAM : STONE[clampK(3 - dn)]);
        continue;
      }
      if (inRound(du, up, A.half, A.spring, A.rise)) {
        if (barred) {
          // THE PORTCULLIS drawn up: its bars hanging into the arch's head, each to a spike; its cross bars; the slot it rose into
          const head = A.spring + A.rise * Math.sqrt(Math.max(0, 1 - (du / A.half) ** 2));
          const bar = mod(du + 3, 12);
          const tip = 92;
          if (up > head - 3) {
            f.set(u, up, SEAM);
            continue;
          }
          if (bar <= 2 && up >= tip) {
            f.set(u, up, IRON[bar === 0 ? (lit ? 3 : 2) : bar === 1 ? 2 : 1]);
            continue;
          }
          if (bar === 1 && up >= tip - 4) {
            f.set(u, up, IRON[3]);
            continue;
          }
          if ((up === 100 || up === 101 || up === 113 || up === 114) && up >= tip) {
            f.set(u, up, IRON[up % 2 ? 2 : 1]);
            continue;
          }
        }
        continue;
      }
      const r = ringAt(STONE, du, up, A.half, A.spring, A.rise, A.ring, lit, 13);
      if (r) {
        f.set(u, up, r);
        continue;
      }
      // (the gatehouse's corners: quoins standing proud)
      const e = Math.min(u - G0, G1 - 1 - u);
      const wq = Math.floor(up / 12) % 2 ? 8 : 13;
      if (e < wq) {
        f.set(u, up, e === wq - 1 || up % 12 === 0 ? SEAM : dressedAt(e, up, lit));
        continue;
      }
      // (an arrow slit over the arch, the night behind it)
      if (Math.abs(du) <= 1 && up > 124 && up < 146) {
        f.set(u, up, du === -1 ? STONE[clampK(3 - dn)] : VOID);
        continue;
      }
      if (Math.abs(du) <= 3 && (up === 123 || up === 146)) {
        f.set(u, up, STONE[clampK(3 - dn)]);
        continue;
      }
      // (a plinth along its foot)
      if (up < PLINTH) {
        f.set(u, up, up === PLINTH - 1 ? STONE[clampK(3 - dn)] : mod(u + 7, 20) === 0 ? SEAM : STONE[clampK(1 - dn)]);
        continue;
      }
      f.set(u, up, stoneAt(STONE, u, up, lit, 612));
    }
  }
  return f;
}
/** THE GAOLER'S DOOR: his house's gable end, the way through it three tiles wide, his two oak leaves swung back flat against the face either side, his lantern over it, a little lit window either side. */
function gaolDoor(lit: boolean): { f: Flat; lantern: [number, number] } {
  const D = GAOL_DOOR;
  const H = D.peak + 2;
  const f = new Flat(G0, G1, H);
  const dn = lit ? 0 : 1;
  const topAt = (u: number): number => BLOCK_H + (D.peak - BLOCK_H) * Math.max(0, 1 - Math.abs(u - 48) / 80);
  const LANTERN: [number, number] = [48, 96];
  for (let u = G0; u < G1; u++) {
    const top = Math.round(topAt(u));
    for (let up = 0; up < H; up++) {
      if (up > top) continue;
      const du = u - 48;
      // (the gable's coping along its raking edges)
      if (up > top - 7) {
        f.set(u, up, up === top ? STONE[clampK(4 - dn)] : up === top - 6 ? SEAM : STONE[clampK((du < 0 ? 3 : 2) - dn)]);
        continue;
      }
      // THE LEAVES, swung back against the face: upright boards, iron straps and studs, his ring; their heads following the arch
      const leaf = u < -2 ? -2 - u : u >= 98 ? u - 98 : -1;
      if (leaf >= 0 && leaf < 28) {
        const mirror = 44 - leaf;
        const headUp = D.spring + D.rise * Math.sqrt(Math.max(0, 1 - (mirror / D.half) ** 2));
        if (up < headUp) {
          if (leaf === 0 || leaf === 27 || up >= headUp - 1) {
            f.set(u, up, TIMBER[0]);
            continue;
          }
          if ([10, 30, 50].some((s) => up >= s && up < s + 3)) {
            f.set(u, up, (leaf % 4 === 2 && up % 3 === 1) ? IRON[4] : IRON[up % 3 === 0 ? 3 : 2]);
            continue;
          }
          if (leaf % 6 === 0) {
            f.set(u, up, TIMBER[0]);
            continue;
          }
          f.set(u, up, TIMBER[clampK((lit ? 2 : 1) + (leaf % 6 === 1 ? 1 : 0) + (hash(Math.floor(leaf / 6), up >> 3, 631) > 0.85 ? -1 : 0))]);
          continue;
        }
      }
      if (inRound(du, up, D.half, D.spring, D.rise)) continue;
      const r = ringAt(STONE, du, up, D.half, D.spring, D.rise, D.ring, lit, 11);
      if (r) {
        f.set(u, up, r);
        continue;
      }
      // HIS LANTERN on its bracket over the way: an iron arm, a cage, a candle burning in it
      const lx = u - LANTERN[0];
      const ly = up - LANTERN[1];
      if (ly >= 14 && ly <= 16 && lx >= -1 && lx <= 1) {
        f.set(u, up, IRON[3]);
        continue;
      }
      if (Math.abs(lx) <= 4 && ly >= 0 && ly <= 13) {
        const rim = Math.abs(lx) === 4 || ly === 0 || ly === 13 || ly === 12;
        if (rim) {
          f.set(u, up, IRON[lx < 0 ? 3 : 1]);
          continue;
        }
        if (Math.abs(lx) <= 1 && ly >= 3 && ly <= 9) {
          f.set(u, up, FIRE[ly < 5 ? 4 : ly < 7 ? 3 : 2]);
          continue;
        }
        f.set(u, up, FIRE[1]);
        continue;
      }
      // (two little windows of his quarters, lit within)
      for (const wx of [-14, 110]) {
        const a = u - wx;
        if (Math.abs(a) <= 5 && up >= 94 && up <= 110) {
          if (Math.abs(a) === 5 || up === 94 || up === 110) f.set(u, up, a === -5 || up === 110 ? STONE[clampK(4 - dn)] : SEAM);
          else if (a === 0 || up === 102) f.set(u, up, TIMBER[1]);
          else f.set(u, up, up < 100 ? WINDOW[2] : WINDOW[1]);
        }
      }
      if (f.has(u, up)) continue;
      // (quoins at its corners, a plinth, the stone)
      const e = Math.min(u - G0, G1 - 1 - u);
      const wq = Math.floor(up / 12) % 2 ? 8 : 13;
      if (e < wq && up < BLOCK_H) {
        f.set(u, up, e === wq - 1 || up % 12 === 0 ? SEAM : dressedAt(e, up, lit));
        continue;
      }
      if (up < PLINTH) {
        f.set(u, up, up === PLINTH - 1 ? STONE[clampK(3 - dn)] : mod(u + 7, 20) === 0 ? SEAM : STONE[clampK(1 - dn)]);
        continue;
      }
      f.set(u, up, stoneAt(STONE, u, up, lit, 633));
    }
  }
  return { f, lantern: LANTERN };
}

// =================================================================================================
// FLIP A PICTURE OF A FACE ALONG X INTO ONE ALONG Y (mirrored, and a step into the shade: its own light kept)

const KEEP = new Set<string>([...EMBER, ...COAL, ...FLAME, ...WINDOW, ...ABOVE].map((c) => c.toLowerCase()));
function toRight(s: Sprite): Sprite {
  const src = pixelsOf(s);
  const out = new Px(src.w, src.h);
  for (let y = 0; y < src.h; y++) for (let x = 0; x < src.w; x++) {
    const c = src.get(x, y);
    if (!c) continue;
    const X = src.w - 1 - x;
    out.set(X, y, KEEP.has(c.toLowerCase()) ? c : mixC(c, SEAM, 0.3));
    out.d[(y * out.w + X) * 4 + 3] = src.d[(y * src.w + x) * 4 + 3];
  }
  const d = s.density ?? 1;
  const s2 = out.sprite(src.w - s.ax * d, s.ay * d, d);
  if (s.lights) s2.lights = s.lights.map((l) => ({ ...l, x: src.w / d - l.x }));
  return s2;
}

// =================================================================================================
// THE LAST-RITES CHAPEL'S FRONT: three tiles of a block's face (along x, lit), as one picture; finer stone, buttressed at its
// ends, a gable with a bell-cote at its peak, a round-headed doorway lit within (the altar's candles seen at the back), two
// lancets faintly lit. Anchored at the floor point under its middle on the face's line ((a + 1.5, row + 1) along x).

function chapelFront(): Sprite {
  const C = CHAPEL_FRONT;
  const W = 112;
  const Hh = 316;
  const p = new Px(W, Hh);
  const iso = new Iso(p, 40, 248);
  const gable = (u: number): number => {
    const g = BLOCK_H + (C.peak - BLOCK_H) * Math.max(0, 1 - Math.abs(u - 48) / 48);
    return Math.abs(u - 48) <= 7 ? C.cote : g;
  };
  iso.left(0, 3, 1, 0, C.cote, (u, v, _w, h) => {
    const up = h - 1 - v;
    const top = Math.round(gable(u));
    if (up > top) return null;
    const du = u - 48;
    // THE BELL-COTE: a small arch at the peak, its bell
    if (Math.abs(du) <= 7 && up > C.peak - 6) {
      if (up === top) return FINE[4];
      if (Math.abs(du) <= 4 && up > C.peak + 2 && up < C.cote - 6 && inRound(du, up - C.peak - 2, 5, 8, 6)) {
        // (the bell, dark iron, its lip lit)
        if (Math.abs(du) <= 3 && up > C.peak + 4 && up < C.peak + 13) return up < C.peak + 6 ? IRON[4] : IRON[du < 0 ? 3 : 2];
        return VOID;
      }
      return dressedAt(du + 9, up, true, FINE, 8);
    }
    // (the gable's coping)
    if (up > top - 6) return up === top ? FINE[4] : up === top - 5 ? SEAM : FINE[du < 0 ? 3 : 2];
    // THE DOORWAY, lit within: the warm light, the altar's dark shape at the back, its two candles
    const D = C.door;
    if (inRound(du, up, D.half, D.spring, D.rise)) {
      if (Math.abs(du) <= 4 && up <= 10) return up === 10 ? WINDOW[1] : TIMBER[1];
      for (const cx of [-7, 7]) {
        if (du === cx && up >= 11 && up <= 15) return FIRE[up > 13 ? 4 : 3];
        if (du === cx && up >= 6 && up <= 10) return FINE[3];
      }
      return up < 14 ? WINDOW[2] : up < 30 ? WINDOW[1] : WINDOW[0];
    }
    const r = ringAt(FINE, du, up, D.half, D.spring, D.rise, 8, true, 9);
    if (r) return r;
    // TWO LANCETS, faintly lit, their leading
    for (const lx of [-29, 29]) {
      const a = u - 48 - lx;
      if (Math.abs(a) <= 4 && up >= 58 && up <= 92) {
        const head = 84 + Math.sqrt(Math.max(0, 16 - a * a)) * 2;
        if (up > head) continue;
        if (Math.abs(a) === 4 || up === 58) return a === -4 ? FINE[4] : SEAM;
        if (a === 0 || up === 74) return IRON[1];
        return up < 68 ? WINDOW[1] : WINDOW[0];
      }
    }
    // A ROUND WINDOW in the gable, its four lights
    const rr = Math.hypot(du, up - 144);
    if (rr < 9) {
      if (rr > 7.2) return FINE[du < 0 ? 4 : 1];
      if (Math.abs(du) <= 0.6 || Math.abs(up - 144) <= 0.6) return FINE[2];
      return WINDOW[0];
    }
    // BUTTRESSES at its ends (quoins), a plinth, the finer stone
    const e = Math.min(u, 95 - u);
    if (e < 7) return up % 10 === 0 || e === 6 ? SEAM : dressedAt(e, up, true, FINE, 10);
    if (up < PLINTH) return up === PLINTH - 1 ? FINE[3] : mod(u, 16) === 0 ? SEAM : FINE[1];
    return stoneAt(FINE, u, up, true, 651, 10);
  });
  const [ax, ay] = iso.at(1.5, 1);
  const s = p.sprite(ax, ay, GRAIN);
  const [lx, ly] = iso.at(1.5, 1, 14);
  s.lights = [{ x: lx / GRAIN, y: ly / GRAIN, r: 26, color: WINDOW[2], a: 0.4 } as Light];
  return s;
}

// =================================================================================================
// WHERE YOU ARRIVE: THE STAIR DOWN FROM FLOOR 1, in the gaoler's room's back wall (along x, lit): three tiles of the room's wall
// as one picture, a round arch two tiles across in its middle, and through it a flight of the bare stone going up away from
// the room under its vault, floor 1's green-gold light faint at its head. Anchored at (a + 1.5, row + 1), as a wall's face.

function wayInPicture(): Sprite {
  const A = WAY_IN;
  const W = 112;
  const Hh = 152;
  const ox = 40;
  const oy = 84;
  const stair = new Px(W, Hh);
  const si = new Iso(stair, ox, oy);
  // (the dark beyond, and floor 1's light up at the stair's head)
  for (let y = 0; y < Hh; y++) for (let x = 0; x < W; x++) stair.set(x, y, VOID);
  const [hx, hy] = si.at(1.5, 1 - A.steps * A.run, A.steps * A.rise1 + 20);
  for (let y = 0; y < Hh; y++) for (let x = 0; x < W; x++) {
    const d = Math.hypot((x - hx) / 1.6, y - hy);
    const band = d < 14 ? 3 : d < 24 ? 2 : d < 36 ? 1 : d < 50 ? 0 : -1;
    if (band >= 0 && ((x >> 1) + (y >> 1)) % 2 === 0 || band >= 1) stair.set(x, y, ABOVE[Math.max(0, band)]);
  }
  // (the passage's left wall, going up with the stair)
  si.right(0.5, 1 - A.steps * A.run - 0.2, 1, 0, A.steps * A.rise1 + 90, (u, v, w, h) => {
    const up = h - 1 - v;
    const far = 1 - u / w;
    const c = stoneAt(STONE, u, up, false, 671, 10);
    return far > 0.75 ? mixC(c, ABOVE[1], 0.35) : far < 0.3 ? c : c;
  });
  // (the steps, far to near: each a block of the stone, its tread worn, its riser in its own shade; higher, nearer floor 1's light)
  for (let i = A.steps - 1; i >= 0; i--) {
    const y1 = 1 - i * A.run;
    const y0 = y1 - A.run;
    const z1 = (i + 1) * A.rise1;
    const near = 1 - i / A.steps;
    const towardLight = (c: string): string => (i >= 2 ? mixC(c, ABOVE[2], Math.min(0.55, 0.08 * i)) : c);
    si.box(0.5, y0, 2.5, y1, 0, z1, {
      top: (u, v) => towardLight(v > 0.82 ? STONE[4] : hash(Math.floor(u * 6), i, 673) > 0.8 ? STONE[2] : u > 0.25 && u < 0.75 && near > 0 ? STONE[3] : STONE[3]),
      left: (u, v) => towardLight(v === 0 ? STONE[3] : u % 23 === 0 ? SEAM : STONE[2]),
      right: () => SEAM,
    });
  }
  // THE WALL, three tiles, with the arch: the stair seen through its opening
  const p = new Px(W, Hh);
  const iso = new Iso(p, ox, oy);
  const tops = new Map<number, number>();
  const holes: [number, number][] = [];
  iso.left(0, 3, 1, 0, GAOL_WALL, (u, v, _w, h, px, py) => {
    const up = h - 1 - v;
    if (v === 0) tops.set(px, py);
    const du = u - 48;
    if (inRound(du, up, A.half, A.spring, A.rise)) {
      holes.push([px, py]);
      return null;
    }
    const r = ringAt(STONE, du, up, A.half, A.spring, A.rise, A.ring, true, 9);
    if (r) return r;
    return gaolStone(u + 13, up, true, 675);
  });
  for (const [x, y] of holes) {
    const c = stair.get(x, y);
    if (c) p.set(x, y, c);
  }
  // (the room's wall fades at its top as the game's: but not the arch's ring, which stands whole)
  for (let x = 0; x < W; x++) {
    const top = tops.get(x);
    if (top === undefined) continue;
    for (let k = 0; k < GAOL_FADE; k++) {
      const y = top + k;
      if (!p.get(x, y)) continue;
      const du = x - 56;
      const upAt = GAOL_WALL - 1 - k;
      if (inRound(du, upAt, A.half + A.ring + 1, A.spring, A.rise + A.ring + 1)) continue;
      p.d[(y * p.w + x) * 4 + 3] = Math.round(255 * FADE_STEPS[Math.floor((k * 4) / GAOL_FADE)]);
    }
  }
  // (the joint at its two ends left empty, as the game's walls leave it)
  const [ax, ay] = iso.at(1.5, 1);
  const s = p.sprite(ax, ay, GRAIN);
  const [gx, gy] = iso.at(1.5, 1, A.spring + A.rise - 8);
  s.lights = [{ x: gx / GRAIN, y: gy / GRAIN, r: 22, color: ABOVE[3], a: 0.22 } as Light];
  return s;
}

// =================================================================================================
// THE GAOLER'S ROOM, inside: its flags; its walls 80 high fading at the top as the game's, rough stone, and in their bays his keys
// on a board of pegs, a barred hatch on the night (the moon's grey on its sill), his tallies, or bare stone

export type GaolKind = 'bare' | 'keys' | 'hatch' | 'tallies';
export const GAOL_KINDS: readonly GaolKind[] = ['bare', 'keys', 'hatch', 'tallies'];
const GAOL_ORDER: readonly GaolKind[] = ['bare', 'keys', 'bare', 'hatch', 'tallies', 'bare', 'hatch', 'keys'];
function gaolStone(u: number, up: number, lit: boolean, seed: number): string {
  return stoneAt(STONE, u, up, lit, seed, 10);
}
function gaolTile(kind: GaolKind, alongX: boolean, seed: number): Sprite {
  const H = GAOL_WALL;
  const p = new Px(TW, TH + H);
  const iso = new Iso(p, HALF, H);
  const tops = new Map<number, number>();
  const shade: SideShader = (u0, v, w, h, px, py) => {
    if (v === 0) tops.set(px, py);
    const lit = alongX;
    const u = lit ? u0 : w - 1 - u0;
    const up = h - 1 - v;
    const dn = lit ? 0 : 1;
    const du = u - 16;
    if (kind === 'keys' && Math.abs(du) <= 8 && up >= 30 && up <= 46) {
      // (a board of pegs, three rings of keys hanging from it)
      if (up >= 42) return up === 46 ? TIMBER[3] : up === 42 ? TIMBER[0] : TIMBER[clampK(2 - dn)];
      for (const kx of [-5, 0, 5]) {
        const ry = 37;
        const d = Math.hypot(du - kx, (up - ry) * 1.2);
        if (d > 2.2 && d < 3.6) return IRON[du - kx < 0 ? 4 : 2];
        if (Math.abs(du - kx - 1) <= 0 && up >= 30 && up < 34) return IRON[3];
      }
    }
    if (kind === 'hatch' && Math.abs(du) <= 6 && up >= 50 && up <= 66) {
      if (Math.abs(du) === 6 || up === 50 || up === 66) return up === 50 ? PUDDLE[2] : SEAM;
      if (du === -3 || du === 0 || du === 3) return IRON[lit ? 3 : 2];
      if (up === 58) return IRON[2];
      return up < 54 ? PUDDLE[1] : '#0a0c1e';
    }
    if (kind === 'tallies' && tallyAt(u, up - 8)) return STONE[clampK(3 - dn)];
    if (up < 8) return up === 7 ? STONE[clampK(3 - dn)] : STONE[clampK(1 - dn)];
    return gaolStone(u + seed, up, lit, seed);
  };
  if (alongX) iso.left(0, 1, 1, 0, H, shade);
  else iso.right(1, 0, 1, 0, H, shade);
  for (let x = 0; x < p.w; x++) {
    const top = tops.get(x);
    if (top === undefined) continue;
    for (let k = 0; k < GAOL_FADE; k++) {
      const y = top + k;
      if (!p.get(x, y)) continue;
      p.d[(y * p.w + x) * 4 + 3] = Math.round(255 * FADE_STEPS[Math.floor((k * 4) / GAOL_FADE)]);
    }
  }
  const joint = alongX ? 0 : TW - 1;
  for (let y = 0; y < p.h; y++) p.erase(joint, y);
  return p.sprite(HALF, H, GRAIN);
}
/** The gaoler's room's flags: square, worn, laid on the world. */
function gaolFlagAt(x: number, y: number): string {
  const i = Math.floor(x * 2);
  const j = Math.floor(y * 2);
  const fu = x * 2 - i;
  const fv = y * 2 - j;
  if (fu < 0.06 || fv < 0.06) return SEAM;
  let k = hash(mod(i, 8), mod(j, 8), 691) > 0.75 ? 3 : 2;
  if (fu < 0.14 || fv > 0.9) k += 1;
  if (fv < 0.14 || fu > 0.92) k -= 1;
  if (hash(mod(i, 8), mod(j, 8), 692) > 0.88 && Math.abs(fu - fv) < 0.04) return STONE[0];
  return STONE[clampK(k)];
}

// =================================================================================================
// THE WELL: a drum of rough stones with its coping, the dark water and the moon in it; two posts and a beam, the windlass with
// its rope wound and its crank, the bucket on the rim. Anchored at the floor point under its middle; a tile.

function well(): Sprite {
  const W = 84;
  const H = 136;
  const p = new Px(W, H);
  const cx = 42;
  const cy = 112;
  const rx = 24;
  const ry = 12;
  const Z = 30;
  // the drum, column by column: its front, lit on the left
  for (let x = -rx; x <= rx; x++) {
    const s = x / rx;
    const front = Math.round(ry * Math.sqrt(Math.max(0, 1 - s * s)));
    const th = Math.asin(Math.max(-1, Math.min(1, s)));
    for (let z = 0; z < Z; z++) {
      const course = Math.floor(z / 8);
      const lz = z % 8;
      const seg = Math.floor((th + Math.PI / 2) / 0.42 + (course % 2) * 0.5);
      const segF = (th + Math.PI / 2) / 0.42 + (course % 2) * 0.5 - seg;
      let k = s < -0.4 ? 3 : s < 0.3 ? 2 : 1;
      if (lz === 7 || segF < 0.08) k = 0;
      else if (lz === 0) k += 1;
      if (hash(seg, course, 701) > 0.82) k -= 1;
      if (z < 4 && hash(x, z, 703) < 0.4) {
        p.set(cx + x, cy + front - z, MOSS[1]);
        continue;
      }
      p.set(cx + x, cy + front - z, k === 0 ? SEAM : STONE[clampK(k)]);
    }
  }
  // its top: the coping ring, the water inside
  for (let y = -ry - 1; y <= ry + 1; y++) for (let x = -rx; x <= rx; x++) {
    const d = Math.hypot(x / rx, y / ry);
    if (d > 1) continue;
    const X = cx + x;
    const Y = cy + y - Z;
    if (d > 0.72) {
      const ang = Math.atan2(y, x);
      const seg = Math.floor((ang + Math.PI) / 0.5);
      const edge = Math.abs((ang + Math.PI) / 0.5 - seg) < 0.1;
      p.set(X, Y, edge ? SEAM : d > 0.92 ? STONE[y > 0 ? 3 : 4] : STONE[x - y < 0 ? 4 : 3]);
    } else if (d > 0.62) p.set(X, Y, SEAM);
    else p.set(X, Y, Math.abs(x + 4 - y * 1.6) < 1.5 && d < 0.5 ? PUDDLE[2] : d < 0.4 ? PUDDLE[0] : '#0a0b1c');
  }
  // the posts (stood on the rim at the left and right), the beam, the windlass with rope wound, the crank
  const postTop = cy - Z - 74;
  for (const px of [cx - 22, cx + 19]) {
    for (let y = postTop; y < cy - Z + 2; y++) {
      p.set(px, y, TIMBER[1]).set(px + 1, y, TIMBER[px < cx ? 4 : 2]).set(px + 2, y, TIMBER[px < cx ? 3 : 2]).set(px + 3, y, TIMBER[1]);
    }
  }
  for (let x = cx - 25; x <= cx + 25; x++) {
    p.set(x, postTop - 4, TIMBER[0]).set(x, postTop - 3, TIMBER[4]).set(x, postTop - 2, TIMBER[3]).set(x, postTop - 1, TIMBER[2]).set(x, postTop, TIMBER[1]);
  }
  const wy = postTop + 22;
  for (let x = cx - 18; x <= cx + 18; x++) {
    for (let k = -4; k <= 4; k++) {
      const rope = (x + (k + 4)) % 3 === 0;
      p.set(x, wy + k, Math.abs(k) === 4 ? TIMBER[0] : rope ? '#574545' : k < -1 ? '#877160' : k < 2 ? '#6f5954' : '#3f3134');
    }
  }
  for (let k = 0; k < 10; k++) p.set(cx + 24, wy - 2 + k, IRON[3]).set(cx + 25, wy - 2 + k, IRON[1]);
  for (let x = 0; x < 6; x++) p.set(cx + 24 + x, wy + 8, IRON[2]).set(cx + 24 + x, wy + 9, IRON[1]);
  // (the rope down from the windlass, into the dark)
  for (let y = wy + 5; y < cy - Z - 2; y++) p.set(cx + 3, y, '#6f5954').set(cx + 4, y, '#3f3134');
  // the bucket on the rim, at the front left: staves, two iron hoops, its handle
  const bx = cx - 12;
  const by = cy - Z + 6;
  for (let x = -6; x <= 6; x++) {
    for (let z = 0; z < 12; z++) {
      const hoop = z === 2 || z === 9;
      const stave = mod(x + 6, 3) === 0;
      p.set(bx + x, by - z, hoop ? IRON[x < 0 ? 4 : 2] : stave ? TIMBER[0] : TIMBER[x < -2 ? 4 : x < 2 ? 3 : 2]);
    }
    p.set(bx + x, by - 12, TIMBER[0]);
  }
  for (let x = -6; x <= 6; x++) {
    const y = by - 12 - Math.round(6 * Math.sqrt(Math.max(0, 1 - (x / 6) ** 2)));
    p.set(bx + x, y, IRON[3]);
  }
  return p.sprite(cx, cy, GRAIN);
}

// =================================================================================================
// THE TUMBRIL, the condemned's cart: a bed of planks on two great spoked wheels, slatted sides, its shafts down on the cobbles;
// two tiles long. Along x (its wheel toward the eye on its +y side) or along y (on its +x side). Anchored at the floor point
// under its middle.

const CART = { len: 0.95, wide: 0.42, bed: 26, side: 16, R: 22, shaft: 1.0 };
function tumbril(alongX: boolean): Sprite {
  const W = 200;
  const H = 120;
  const p = new Px(W, H);
  const iso = new Iso(p, 100, 84);
  const C = CART;
  // (the world's x and y for the cart's own: a along its length, b across)
  const X = (a: number, b: number): [number, number] => (alongX ? [a, b] : [b, a]);
  const at = (a: number, b: number, z: number): [number, number] => iso.at(...X(a, b), z);
  const wheel = (b: number): void => {
    const [hx, hy] = at(0, b, C.R);
    for (let s = -C.R - 1; s <= C.R + 1; s += 0.5) for (let t = -C.R - 1; t <= C.R + 1; t += 0.5) {
      const r = Math.hypot(s, t);
      if (r > C.R) continue;
      // (in the wheel's plane: s along the cart, t up; its angle as seen on the screen, so its lit side is toward the light)
      const sx = alongX ? s : -s;
      const ang = Math.atan2(t, sx);
      const X0 = Math.round(hx + sx);
      const Y0 = Math.round(hy + s / 2 * (alongX ? 1 : 1) - t);
      let c: string | null = null;
      const lit = Math.cos(ang - 2.4) > 0;
      const dn = alongX ? 0 : 1;
      if (r > C.R - 1.6) c = IRON[(lit ? 4 : 2) - dn];
      else if (r > C.R - 5) c = TIMBER[(lit ? 3 : 1) - dn];
      else if (r < 4) c = r < 2 ? IRON[3 - dn] : TIMBER[2 - dn];
      else {
        const sp = mod(ang + Math.PI, Math.PI / 5);
        if (sp * r < 1.6 || (Math.PI / 5 - sp) * r < 0.4) c = TIMBER[(lit ? 3 : 2) - dn];
      }
      if (c) p.set(X0, Y0, c);
    }
  };
  // the far wheel, then the bed and its sides, then the shafts, then the near wheel
  wheel(alongX ? -C.wide - 0.06 : -C.wide - 0.06);
  const planks = (u: number, v: number): string => {
    const k = Math.floor((alongX ? v : u) * 5);
    const f = (alongX ? v : u) * 5 - k;
    return f < 0.14 ? TIMBER[0] : TIMBER[hash(k, 0, 711) > 0.7 ? 3 : 2];
  };
  const [x0, y0] = X(-C.len, -C.wide);
  const [x1, y1] = X(C.len, C.wide);
  iso.box(x0, y0, x1, y1, C.bed - 5, C.bed, { top: planks, left: () => TIMBER[2], right: () => TIMBER[1] });
  // (the slatted sides: posts at the corners and along, two rails)
  const slats = (lit: boolean): SideShader => (u, v, _w, h) => {
    const up = h - 1 - v;
    if (up >= h - 3) return TIMBER[lit ? 4 : 2];
    if (up < 3) return TIMBER[lit ? 3 : 1];
    if (Math.abs(up - Math.floor(h / 2)) <= 1) return TIMBER[lit ? 3 : 2];
    if (mod(u, 9) <= 1) return TIMBER[mod(u, 9) === 0 && lit ? 3 : 2];
    return null;
  };
  // (the far side and the near side, low, open between the slats)
  if (alongX) {
    iso.left(-C.len, C.len, -C.wide, C.bed, C.bed + C.side, slats(true));
    iso.right(-C.len, -C.wide, C.wide, C.bed, C.bed + C.side, slats(false));
    iso.right(C.len, -C.wide, C.wide, C.bed, C.bed + C.side, slats(false));
    iso.left(-C.len, C.len, C.wide, C.bed, C.bed + C.side, slats(true));
  } else {
    iso.right(-C.wide, -C.len, C.len, C.bed, C.bed + C.side, slats(false));
    iso.left(-C.wide, C.wide, -C.len, C.bed, C.bed + C.side, slats(true));
    iso.left(-C.wide, C.wide, C.len, C.bed, C.bed + C.side, slats(true));
    iso.right(C.wide, -C.len, C.len, C.bed, C.bed + C.side, slats(false));
  }
  // (the shafts, from the bed's front down to the cobbles)
  for (const b of [-C.wide + 0.08, C.wide - 0.08]) {
    const [ax, ay] = at(C.len, b, C.bed - 3);
    const [bx2, by2] = at(C.len + C.shaft, b, 2);
    const n = Math.ceil(Math.max(Math.abs(bx2 - ax), Math.abs(by2 - ay)));
    for (let i = 0; i <= n; i++) {
      const x = Math.round(ax + ((bx2 - ax) * i) / n);
      const y = Math.round(ay + ((by2 - ay) * i) / n);
      p.set(x, y, TIMBER[3]).set(x, y + 1, TIMBER[1]);
    }
  }
  wheel(C.wide + 0.06);
  const [ax, ay] = iso.at(0, 0);
  return p.sprite(ax, ay, GRAIN);
}

// =================================================================================================
// FLOOR 2'S OWN PIECES IN THE NIGHT'S COLOURS (his yes already: art/floor2.ts): each colour sorted into its family by the
// nearest of floor 2's own (its stone, iron, timber, his hood's red, bone, rope, straw) and put at the same place in that family
// under the yard's moon; fire, coals and the enemy's own are their own light and stay as they are

type Fam = 'stone' | 'iron' | 'wood' | 'hood' | 'bone' | 'rope' | 'straw';
const TH2 = CRYPT_FLOORS[1];
const KNOWN: [Fam, readonly string[]][] = [
  ['stone', [...TH2.slab, ...TH2.cap, ...TH2.capLow, ...TH2.lit, ...TH2.shade, TH2.mortar, ...stoneOf(TH2), '#110f17', '#19161f', '#221e29']],
  ['iron', [...OLD_IRON, ...OLD_RUST, '#1c1a3a', '#4c4884', '#8480bc', '#a8a4dc', '#16142c', '#34305e', '#4c4880', '#9a96c8', '#16132e', '#2e2a5a', '#4c4888', '#6a66a8', '#a4a0d4', '#262036', '#3c3452', '#4e4666', ...RAVEN]],
  ['wood', [...CRYPT_TIMBER, '#100c18', '#211a2e', '#352c46', '#433856']],
  ['hood', [...HOOD]],
  ['bone', ['#26203e', '#6a6294', '#a29ac6', '#c2bae2', '#1e1a34', '#3e3862', '#5a5484']],
  ['rope', ['#1e1820', '#4a3e48', '#6a5c64', '#7e7078', '#1e1626', '#3c2e3c', '#58465a', '#6a5868']],
  ['straw', ['#2e2a3a', '#433e52', '#5a546a', '#3e3a52', '#4a4660', '#58526a']],
];
/** The night's family for each (their stone a step lighter than the walls', so that a piece stands off them). */
const RAMPS: Record<Fam, R5> = {
  stone: ['#1b1c36', '#262850', '#343867', '#48507c', '#606a98'],
  iron: IRON,
  wood: TIMBER,
  hood: ['#1a0c18', '#2c1222', '#421c2c', '#562836', '#6a3440'],
  bone: ['#1e1c32', '#3a3a56', '#585c7a', '#787e9c', '#979db8'],
  rope: ['#24191f', '#3f3134', '#574545', '#6f5954', '#877160'],
  straw: STRAW,
};
const FIRE_KEPT = new Set<string>([...EMBER, ...COAL, ...FLAME, ...SHINES].map((c) => c.toLowerCase()));
const lumOf = (c: string): number => {
  const [r, g, b] = hexOf(c);
  return 0.3 * r + 0.55 * g + 0.15 * b;
};
const RANGE = new Map<Fam, [number, number]>(KNOWN.map(([f, cs]) => [f, [Math.min(...cs.map(lumOf)), Math.max(...cs.map(lumOf))]]));
const gradeMemo = new Map<string, string>();
/** A colour of floor 2's own under the yard's moon. */
export function gradeColour(c: string): string {
  const lc = c.toLowerCase();
  if (FIRE_KEPT.has(lc)) return c;
  const hit = gradeMemo.get(lc);
  if (hit) return hit;
  const [r, g, b] = hexOf(lc);
  let best: Fam = 'stone';
  let bd = 1e9;
  for (const [f, cs] of KNOWN) for (const k of cs) {
    const [r2, g2, b2] = hexOf(k);
    const d = (r - r2) ** 2 + (g - g2) ** 2 + (b - b2) ** 2;
    if (d < bd) {
      bd = d;
      best = f;
    }
  }
  const ramp = RAMPS[best];
  const [lo, hi] = RANGE.get(best)!;
  const t = Math.max(0, Math.min(4, ((lumOf(lc) - lo) / Math.max(1, hi - lo)) * 4.4 - 0.2));
  const i = Math.min(3, Math.floor(t));
  const out = mixC(ramp[i], ramp[i + 1], t - i);
  gradeMemo.set(lc, out);
  return out;
}
const gradedMemo = new WeakMap<Sprite, Sprite>();
/** A picture of floor 2's own under the moon (its shape, its anchor and its lights as they were). */
export function gradeSprite(s: Sprite): Sprite {
  const hit = gradedMemo.get(s);
  if (hit) return hit;
  const src = pixelsOf(s);
  const out = new Px(src.w, src.h);
  const memo = new Map<number, string>();
  for (let i = 0; i < src.d.length; i += 4) {
    const a = src.d[i + 3];
    if (a === 0) continue;
    const key = (src.d[i] << 16) | (src.d[i + 1] << 8) | src.d[i + 2];
    let c = memo.get(key);
    if (!c) memo.set(key, (c = gradeColour(`#${key.toString(16).padStart(6, '0')}`)));
    const [r, g, b] = hexOf(c);
    out.d[i] = r;
    out.d[i + 1] = g;
    out.d[i + 2] = b;
    out.d[i + 3] = a;
  }
  const d = s.density ?? 1;
  const s2 = out.sprite(s.ax * d, s.ay * d, d);
  if (s.lights) s2.lights = s.lights.map((l) => ({ ...l }));
  gradedMemo.set(s, s2);
  return s2;
}
function gradePiece(p: Piece): Piece {
  const g = (list?: Sprite[]): Sprite[] | undefined => list?.map(gradeSprite);
  const spots: Spot[] | undefined = p.spots?.map((q) => ({ du: q.du, dv: q.dv, left: q.left.map(gradeSprite), right: q.right.map(gradeSprite) }));
  return { ...p, frames: g(p.frames), left: g(p.left), right: g(p.right), spots };
}

// =================================================================================================
// THE LIGHTS, for the main chat to place (the renderer's own: a hole cut in the dark, render.ts `spot`, and a glow drawn over
// it, a sprite's `lights`). In game pixels, from where each thing is anchored.

export const GROUNDS_LIGHTS = {
  /** THE DARK under the open sky: the yard's (render/yard.ts YARD_DARK, its sky's lift and its vignette), in every courtyard. */
  dark: { a: 0.42, rgb: [6, 4, 14] as const, skyLift: 0.55, vignette: 0.4 },
  /** THE GAOLER'S ROOM, indoors: the Crypt's dark (render.ts FAR_DARK) and the game's own vignette, lit by his brazier. */
  gaol: { a: 0.88 },
  /** THE YARD'S TORCH on a block's face or the outer wall (the yard's own: render/yard.ts torchLight): a hole 36 up from the face's foot under it, flickering. */
  torch: { up: 36, r: 48, strength: 0.85 },
  /** A BRAZIER (floor 2's own 'brazier of irons'), as render.ts lights one. */
  brazier: { up: 14, r: 62, strength: 0.9 },
  /** THE GAOLER'S LANTERN over his door: a hole at it (its fire on the gateway's strip, with its glow), and the warm room through the door. */
  lantern: { up: 52, r: 54, strength: 0.85, room: { into: 1.5, r: 50, strength: 0.6 } },
  /** THE CHAPEL'S LIT DOORWAY: a hole on the floor before it (0.6 of a tile out from the face's line, 6 up), its glow on its picture. */
  chapel: { out: 0.6, up: 6, r: 56, strength: 0.75 },
  /** A LIT CELL WINDOW: its glow only (on its face's picture, `lights`): no hole. */
  window: { r: 10, a: 0.3 },
  /** THE STAIR DOWN FROM FLOOR 1: a hole at its arch's foot, a tile into the room; its glow on its picture (floor 1's green-gold, faint). */
  wayIn: { into: 1, up: 8, r: 46, strength: 0.55 },
} as const;

// =================================================================================================
// ALL OF IT

export interface GroundsArt {
  /** The courtyards' cobbles of tile (tx, ty): the yard's own. */
  floor(tx: number, ty: number): Sprite;
  /** The long walk's flags of tile (tx, ty) (they repeat every four tiles). */
  walk(tx: number, ty: number): Sprite;
  /** Floor tiles laid over the cobbles: the grounds' own (mud, straw, weeds) and the yard's (puddles, earth, gutters, sawdust). */
  tiles: Piece[];
  /** THE CELL BLOCKS: a tile of face of each kind (BLOCK_KINDS, in order), along x and along y; `face` picks one for a wall tile. */
  block: {
    faceLeft: Sprite[];
    faceRight: Sprite[];
    face(alongX: boolean, tx: number, ty: number, end?: 'low' | 'high'): Sprite;
  };
  /** THE PRISON'S HIGH OUTER WALL: the yard's own faces (four each way). */
  wall: { faceLeft: Sprite[]; faceRight: Sprite[] };
  /** A watchtower (the yard's), and the night sky over the walls (the yard's backdrop). */
  tower: Sprite;
  beyond: Sprite;
  /** A way between two courtyards through a cell block (strips from t -1 to t 4); `gaol`, the gaoler's door out. */
  gateway(alongX: boolean, kind: GatewayKind): Strip[];
  /** The last-rites chapel's front: three tiles of a block's face as one picture, anchored at the floor point under its middle on the face's line. */
  chapel(alongX: boolean): Sprite;
  /** Where you arrive: the stair down from floor 1, three tiles of the gaoler's room's back wall as one picture, anchored as the chapel is. */
  wayIn(alongX: boolean): Sprite;
  /** The gaoler's room inside: its flags, and a tile of its wall of each kind (GAOL_KINDS) along x and along y. */
  gaol: {
    floor(tx: number, ty: number): Sprite;
    faceLeft: Sprite[];
    faceRight: Sprite[];
    face(alongX: boolean, tx: number, ty: number): Sprite;
  };
  /** The well, the tumbril along x and along y, floor 2's own in the night's colours, the yard's torch and its wide puddles. */
  pieces: Piece[];
}

let made: GroundsArt | null = null;
/** The grounds' pictures, made the first time they are asked for and kept. */
export function makeGroundsArt(): GroundsArt {
  if (made) return made;
  const Y = makeYardArt();
  const walks = new Map<string, Sprite>();
  const gaolFloors = new Map<string, Sprite>();
  const left = BLOCK_KINDS.map((k, i) => blockTile(k, true, 501 + i * 13));
  const right = BLOCK_KINDS.map((k, i) => blockTile(k, false, 507 + i * 13));
  const gLeft = GAOL_KINDS.map((k, i) => gaolTile(k, true, 551 + i * 7));
  const gRight = GAOL_KINDS.map((k, i) => gaolTile(k, false, 553 + i * 7));
  const ways = new Map<string, Strip[]>();
  const chapelX = chapelFront();
  const chapelY = toRight(chapelX);
  const inX = wayInPicture();
  const inY = toRight(inX);
  const own = headsmanPieces().map(gradePiece);
  made = {
    floor: (tx, ty) => Y.floor(tx, ty),
    walk(tx, ty) {
      const key = `${mod(tx, 4)},${mod(ty, 4)}`;
      let s = walks.get(key);
      if (!s) {
        const [a, b] = key.split(',').map(Number);
        walks.set(key, (s = tileOf(walkAt, a, b)));
      }
      return s;
    },
    tiles: [
      { name: 'mud', kind: 'floor tile', frames: [mudTile(521)] },
      { name: 'churned mud', kind: 'floor tile', frames: [mudTile(523)] },
      { name: 'straw', kind: 'floor tile', frames: [strawTile(525, 0)] },
      { name: 'a drift of straw', kind: 'floor tile', frames: [strawTile(527, 1)] },
      { name: 'weeds along x', kind: 'floor tile', frames: [weedTile(true, 529)] },
      { name: 'weeds along y', kind: 'floor tile', frames: [weedTile(false, 531)] },
      ...Y.tiles,
    ],
    block: {
      faceLeft: left,
      faceRight: right,
      face(alongX, tx, ty, end) {
        const list = alongX ? left : right;
        if (end) return list[BLOCK_KINDS.indexOf(end === 'low' ? 'corner, low end' : 'corner, high end')];
        const along = alongX ? tx : ty;
        const line = alongX ? ty : tx;
        const k = BLOCK_ORDER[mod(along + Math.floor(hash(line, 0, 541) * 8), BLOCK_ORDER.length)];
        return list[BLOCK_KINDS.indexOf(k)];
      },
    },
    wall: { faceLeft: Y.faceLeft, faceRight: Y.faceRight },
    tower: Y.tower,
    beyond: Y.beyond,
    gateway(alongX, kind) {
      const key = `${alongX ? 'x' : 'y'}${kind}`;
      let s = ways.get(key);
      if (!s) {
        if (kind === 'gaol') {
          const { f, lantern } = gaolDoor(alongX);
          s = f.strips(alongX);
          // (the lantern's glow, on the strip it hangs in)
          const st = s.find((q) => Math.abs(q.t * 32 + STRIP / 2 - lantern[0]) <= STRIP / 2);
          if (st) st.s.lights = [{ x: (alongX ? STRIP / 2 : STRIP / 2) / GRAIN, y: (f.anchorRow - lantern[1] - 8) / GRAIN, r: 24, color: FIRE[2], a: 0.5 } as Light];
        } else s = gatehouse(alongX, kind === 'barred').strips(alongX);
        ways.set(key, s);
      }
      return s;
    },
    chapel: (alongX) => (alongX ? chapelX : chapelY),
    wayIn: (alongX) => (alongX ? inX : inY),
    gaol: {
      floor(tx, ty) {
        const key = `${mod(tx, 4)},${mod(ty, 4)}`;
        let s = gaolFloors.get(key);
        if (!s) {
          const [a, b] = key.split(',').map(Number);
          gaolFloors.set(key, (s = tileOf(gaolFlagAt, a, b)));
        }
        return s;
      },
      faceLeft: gLeft,
      faceRight: gRight,
      face(alongX, tx, ty) {
        const along = alongX ? tx : ty;
        const k = GAOL_ORDER[mod(along, GAOL_ORDER.length)];
        return (alongX ? gLeft : gRight)[GAOL_KINDS.indexOf(k)];
      },
    },
    pieces: [
      { name: 'the well', kind: 'obstacle', frames: [well()], shadow: 0.7 },
      { name: 'the tumbril, along x', kind: 'obstacle', frames: [tumbril(true)], shadow: 1.1 },
      { name: 'the tumbril, along y', kind: 'obstacle', frames: [tumbril(false)], shadow: 1.1 },
      ...own,
      ...Y.pieces.filter((p) => p.name === "the yard's torch" || p.name === 'a wide puddle' || p.name === 'a great puddle'),
    ],
  };
  return made;
}
/** Let the grounds' pictures go (they are made again if they are wanted). */
export function forgetGrounds(): void {
  made = null;
}
/** The grounds' own pieces' footprints (tiles), for whoever lays them. */
export const GROUNDS_FOOTPRINTS = { well: { w: 1, d: 1 }, tumbrilAlongX: { w: 3, d: 1 }, tumbrilAlongY: { w: 1, d: 3 } };
/** (ISO_X kept for whoever lays the strips: a tile along the plane is this many picture pixels) */
export const GROUNDS_TILE = ISO_X;
