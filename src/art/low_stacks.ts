// FLOOR 15'S STACKS, THE SHELVES ONE BLOCK HIGH (the art chat, 23 Oct 2026; a mock-up behind LOW_STACKS, off: nothing of the
// game imports it).
//
// The owner to the main chat, 23 Oct 2026, 11:40 Pacific: “The library is really hard to navigate.  The rows of shelves room
// needs the rows to maybe only be one block high, and there shouldn’t be any little doodad in the isles”. The main chat's
// reading (its 15:05 to this chat): in the stacks the ROWS stand only one block high, low bookcases he sees over, so that the
// aisles and who is in them are plain; the rooms' own walls stay as they are; the aisles' doodads are the main chat's.
// Shown pictures and a film from the game (the stacks as they are and with the rows one block high; the knight walking an
// aisle, round a row's end and back along the next), asked “Are the library's stacks right, with each row of shelves a low
// bookcase one block high? When you're behind one, it fades around you like the walls do.”, his answer to the art chat by
// 13:06 Pacific, 23 Oct: “Yes, send to main (Recommended)”.
//
// WHAT IT IS: each row of shelves a low bookcase as tall as a tile is wide (LOW_RISE, a block), a tile thick, as long as its row:
// a skirting, two shelves of books on each long side (the room's walls' own books, bays and light: art/library.ts), a top board
// with a lit edge; at each end a panelled end, a brass plate on it; on top, dark planks, dust, now and then a book or two left
// lying. Books on the long sides only; the Order's ink slashed across a bay now and then, chained books, shelves pulled empty,
// as on the walls. Nothing glows (Colour 3); every colour quietened as the ground's are (Colour 4: art/act2_quiet.ts).
//
// FOR THE MAIN CHAT (the rows' tiles stay walls in the rules; only how they are painted changes):
// - `lowStacksFloor(floor, rows)`: the floor THE GROUND IS PAINTED FROM, the rows' tiles made floor, so the ground paints no
//   wall there (and none of them stands whole by ACT2_WALLS); give greatLibraryLook the floor AS IT IS (it keeps the dust
//   along the shelves' feet and the room's zones from it).
// - `paintLowStacks(rows, x0, y0, w, h)`: the rows standing low over a piece of the ground (the same piece as the ground's,
//   picture pixels), every pixel with its line of tiles across the screen (its tile's x + y, plus 1), as art/standing.ts
//   paintStanding gives the walls; `withLowStacks(walls, low)` lays the two together (whichever is nearer the eye at each
//   pixel); then standingBits cuts them into bits, drawn among the figures and seen through round him, as the walls are.
// - `rows`: which tiles are the stacks' shelves (game/act2/library.ts shelve's T_WALL tiles), from the rules: `rowsOf(mask, w, h)`
//   over a mask, 1 for a shelf's tile.

import { T_FLOOR } from '../game/types';
import type { Floor } from '../game/types';
import { quietRGB } from './act2_quiet';
import { hash } from './kit';
import { LB_DUST, LB_GILT, LB_INK, LB_LEATHER, LB_PAGE, LB_WOOD, LB_ZONE, libraryBayAt, libraryRowOf, libraryShelves } from './library';
import type { StandingPiece } from './standing';
import type { RGB } from './terrain';
import { HWP, worldOf } from './terrain';

/** THE SWITCH: off, the stacks' rows are the floor's walls, standing whole to the dark as now. */
export const LOW_STACKS = { on: true };

/** How tall a low row stands, picture pixels: a block, as tall as a tile is wide (a tile's edge is about 40 of them). */
export const LOW_RISE = 42;
/** Its skirting, and its top board's front. */
const SKIRT = 3;
const CAP = 4;

/** Which tiles are the stacks' shelves. */
export type Rows = (tx: number, ty: number) => boolean;

/** The rows from a mask of the floor's tiles (1 a shelf's tile), w by h. */
export function rowsOf(mask: ArrayLike<number>, w: number, h: number): Rows {
  return (tx, ty) => tx >= 0 && ty >= 0 && tx < w && ty < h && mask[ty * w + tx] === 1;
}

/** The floor the ground is painted from: the rows' tiles made floor (they are painted standing low, here). */
export function lowStacksFloor(floor: Floor, rows: Rows): Floor {
  const tiles = new Uint8Array(floor.tiles);
  for (let ty = 0; ty < floor.h; ty++) for (let tx = 0; tx < floor.w; tx++) if (rows(tx, ty)) tiles[ty * floor.w + tx] = T_FLOOR;
  return { ...floor, tiles };
}

const mod = (a: number, m: number): number => ((a % m) + m) % m;

/** A row's run through a tile: whether it runs along x (else along y), and where it begins and ends along that way (tiles, its last tile's far edge). */
interface Run {
  alongX: boolean;
  a0: number;
  a1: number;
}
function runsOf(rows: Rows): (tx: number, ty: number) => Run {
  const kept = new Map<number, Run>();
  return (tx, ty) => {
    const key = (tx + 2048) * 4096 + (ty + 2048);
    let r = kept.get(key);
    if (r) return r;
    const alongX = rows(tx - 1, ty) || rows(tx + 1, ty) || !(rows(tx, ty - 1) || rows(tx, ty + 1));
    let a0 = alongX ? tx : ty;
    let a1 = a0 + 1;
    if (alongX) {
      while (rows(a0 - 1, ty)) a0--;
      while (rows(a1, ty)) a1++;
    } else {
      while (rows(tx, a0 - 1)) a0--;
      while (rows(tx, a1)) a1++;
    }
    r = { alongX, a0, a1 };
    kept.set(key, r);
    return r;
  };
}

/**
 * A LOW BOOKCASE'S LONG SIDE, `v` picture pixels over the floor, picture column `px`, turned `turn` (1 to the lower left, lit; -1 to
 * the lower right, in shade); `fromL` and `fromR` how far it is from the row's end on the screen's left and right (picture pixels).
 */
function longFace(turn: number, v: number, px: number, fromL: number, fromR: number): RGB {
  const row = libraryRowOf(turn + (hash(Math.floor(px / 56), 9, 5402) - 0.5) * 0.1);
  const W = LB_WOOD[row];
  // the skirting
  if (v < SKIRT) return v === SKIRT - 1 ? W[0] : W[3];
  // the top board's front: its underside dark, its lit top edge
  if (v >= LOW_RISE - CAP) return v === LOW_RISE - 1 ? W[0] : v === LOW_RISE - CAP ? W[3] : W[1];
  // the uprights at its ends, and between its bays
  if (fromL < 4) return fromL < 1 ? W[0] : fromL >= 3 ? W[3] : W[1];
  if (fromR < 3) return fromR < 1 ? W[3] : W[2];
  const bay0 = libraryBayAt(px, LB_ZONE.Stacks);
  // (no ladder, no window on a low case)
  const bay = bay0.kind === 3 || bay0.kind === 5 ? { ...bay0, kind: 0 } : bay0;
  if (bay.u < 4) return bay.u === 0 ? W[0] : bay.u === 3 ? W[3] : W[1];
  let c = libraryShelves(v - SKIRT, px, row, bay, 0);
  // THE ORDER'S INK slashed across the spines, now and then: a black brush stroke, drips running down
  if (bay.kind === 1) {
    const u = bay.u;
    const mid = 12 + hash(bay.key, 3, 5404) * 14;
    const slope = (hash(bay.key, 4, 5404) - 0.5) * 0.5;
    const along = mid + (u - 28) * slope + 1.5 * Math.sin(u * 0.3 + bay.key);
    const thick = 2.6 + 1.2 * Math.sin((u / 56) * Math.PI);
    if (u > 6 && u < 54 && Math.abs(v - along) < thick) c = mod(u + v, 9) === 0 ? LB_INK[1] : LB_INK[0];
    if (u > 6 && u < 54 && mod(u, 5) === 2 && hash(Math.floor(u / 5), bay.key, 5405) < 0.5 && v < along && v > along - thick - 2 - hash(Math.floor(u / 5), bay.key, 5406) * 9) c = LB_INK[0];
  }
  return c;
}

/** A LOW BOOKCASE'S END: a panelled end of dark wood, a brass plate for its label near its top; `u` across it from the screen's left (picture pixels, 0 to 32). */
function endFace(turn: number, v: number, u: number): RGB {
  const row = libraryRowOf(turn);
  const W = LB_WOOD[row];
  if (v < SKIRT) return v === SKIRT - 1 ? W[0] : W[3];
  if (v >= LOW_RISE - CAP) return v === LOW_RISE - 1 ? W[0] : v === LOW_RISE - CAP ? W[3] : W[1];
  // its frame, and the panel sunk in it: lit along the panel's top and left, dark along its bottom and right
  if (u < 3 || u > 29) return u < 1 ? W[0] : u > 31 ? W[3] : W[1];
  if (v < 6 || v > LOW_RISE - CAP - 3) return W[1];
  if (v === LOW_RISE - CAP - 3 || u === 3) return W[3];
  if (v === 6 || u === 29) return W[0];
  // the brass plate, a card in it
  if (v >= 26 && v < 32 && u >= 10 && u < 22) return v === 26 || u === 10 ? LB_GILT[row === 2 ? 2 : 0] : v === 31 || u === 21 ? LB_GILT[2] : v >= 28 && v < 30 && u >= 12 && u < 20 ? LB_PAGE[row === 2 ? 2 : 1] : LB_GILT[1];
  return W[2];
}

/** A LOW BOOKCASE'S TOP, seen from above: `c` across it from its far edge (0) to its near (1), `a` along it (tiles); `end0`, `end1` how far it is from its row's far and near end (tiles). */
function topOf(c: number, a: number, end0: number, end1: number, tx: number, ty: number, px: number, py: number): RGB {
  const W = LB_WOOD[0];
  // its mouldings: the near edges lit, the far dark
  if (c > 0.92 || end1 < 0.06) return W[0];
  if (c < 0.06 || end0 < 0.05) return W[3];
  if (c > 0.86 || end1 < 0.1) return W[1];
  // A BOOK OR TWO LEFT LYING on it, now and then
  const k = hash(tx, ty, 5471);
  if (k < 0.3) {
    const b0 = Math.floor(a) + 0.15 + hash(tx, ty, 5472) * 0.35;
    const lie = a - b0;
    const two = k < 0.12;
    for (let i = two ? 1 : 0; i >= 0; i--) {
      const s0 = 0.28 + i * 0.06;
      const s1 = 0.66 + i * 0.06;
      if (lie >= i * 0.04 && lie < 0.36 + i * 0.04 && c >= s0 && c < s1) {
        const C = LB_LEATHER[Math.floor(hash(tx + i, ty, 5473) * LB_LEATHER.length)];
        // its pages' edge toward the eye, its spine's lit edge
        if (c >= s1 - 0.05) return LB_PAGE[1];
        if (lie < i * 0.04 + 0.04) return C[2];
        return mod(px + py, 7) === 0 ? C[0] : C[1];
      }
    }
  }
  // dust
  if (hash(px >> 1, py, 5474) < 0.05) return LB_DUST[hash(px, py >> 1, 5475) < 0.5 ? 0 : 1];
  // its planks along the row, three across
  const p = c * 3;
  if (mod(p, 1) < 0.06) return LB_WOOD[1][3];
  const grain = hash(Math.floor(a * 6 + Math.floor(p) * 13), Math.floor(p), 5476);
  return Math.floor(p) % 2 ? (grain < 0.3 ? W[2] : W[1]) : grain < 0.25 ? W[1] : W[2];
}

/**
 * PAINT THE ROWS STANDING LOW over a piece of the ground: the world's picture from (x0, y0), w by h picture pixels (as the ground's
 * pieces are cut); clear wherever no row is seen, and each pixel's line of tiles across the screen (a tile's x + y, plus 1).
 */
export function paintLowStacks(rows: Rows, x0: number, y0: number, w: number, h: number): StandingPiece {
  const H = LOW_RISE;
  const rgba = new Uint8ClampedArray(w * h * 4);
  const depth = new Int32Array(w * h).fill(-1);
  const run = runsOf(rows);
  const n = h + H + 1;
  const last = new Int32Array(n);
  const wx = new Float64Array(n);
  const wy = new Float64Array(n);
  for (let c = 0; c < w; c++) {
    const px = x0 + c;
    let l = -1;
    for (let j = 0; j < n; j++) {
      const [x, y] = worldOf(px, y0 + j);
      wx[j] = x;
      wy[j] = y;
      if (rows(Math.floor(x), Math.floor(y))) l = j;
      last[j] = l;
    }
    for (let r = 0; r < h; r++) {
      const s = last[r + H];
      if (s < r) continue;
      const v = s - r;
      const x = wx[s];
      const y = wy[s];
      const tx = Math.floor(x);
      const ty = Math.floor(y);
      const R = run(tx, ty);
      let col: RGB;
      if (v === H) {
        // its top
        const cAcross = R.alongX ? y - ty : x - tx;
        const a = R.alongX ? x : y;
        col = topOf(cAcross, a, a - R.a0, R.a1 - a, tx, ty, px, y0 + r);
      } else {
        // its face: which side the eye crosses into it by (toward +y, lit; toward +x, in shade; both, its corner)
        const nx = Math.floor(wx[s + 1]) !== tx;
        const ny = Math.floor(wy[s + 1]) !== ty;
        const turn = ny && !nx ? 1 : nx && !ny ? -1 : 0;
        const long = turn === 0 || (turn === 1) === R.alongX;
        if (turn === 0) col = LB_WOOD[1][0];
        else if (long) {
          // along the row on the screen: a +y side runs left to right with x, a +x side right to left with y (32 picture pixels a tile)
          const fromL = R.alongX ? (x - R.a0) * HWP : (R.a1 - y) * HWP;
          const fromR = R.alongX ? (R.a1 - x) * HWP : (y - R.a0) * HWP;
          col = longFace(turn, v, px, fromL, fromR);
        } else col = endFace(turn, v, turn === 1 ? (x - tx) * HWP : (ty + 1 - y) * HWP);
      }
      const q = quietRGB(col);
      const i = r * w + c;
      const o = i * 4;
      rgba[o] = q[0];
      rgba[o + 1] = q[1];
      rgba[o + 2] = q[2];
      rgba[o + 3] = 255;
      depth[i] = tx + ty + 1;
    }
  }
  return { x0, y0, w, h, rgba, depth };
}

/** The walls standing whole and the rows standing low, of the same piece, laid together: at each pixel whichever is nearer the eye. */
export function withLowStacks(walls: StandingPiece, low: StandingPiece): StandingPiece {
  const rgba = new Uint8ClampedArray(walls.rgba);
  const depth = new Int32Array(walls.depth);
  for (let i = 0; i < depth.length; i++) {
    const d = low.depth[i];
    if (d < 0 || (depth[i] >= 0 && depth[i] >= d)) continue;
    depth[i] = d;
    for (let k = 0; k < 4; k++) rgba[i * 4 + k] = low.rgba[i * 4 + k];
  }
  return { x0: walls.x0, y0: walls.y0, w: walls.w, h: walls.h, rgba, depth };
}

