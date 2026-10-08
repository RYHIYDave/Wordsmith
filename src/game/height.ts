// HEIGHT: raised floor, ledges, stairs, and pits.
//
// The owner, 5 Oct 2026: "I think steps are a must include"; "And the swipe moves need to be able
// to traverse the different levels as well. I need to be able to jump up and down ledges". And
// 7 Oct 2026: "Then work on ledges and stairs"; "Gaps and pits to use the swipe ability over".
//
// What a level knows (types.ts, Floor): `height`, how many levels up each floor tile stands;
// `stair`, which floor tiles are a flight of stairs and which way each goes up; and tiles of the
// kind T_PIT, which are holes. The rules that follow from them are all here:
//
//   WALKING NEVER CROSSES A LEDGE. A body passes from one tile to the next only where the two are
//   of one height, or where one is a stair and the other lies at its foot or its head. A stair is
//   entered at its two ends only: not from the side, and not from a corner.
//   NOBODY WALKS OVER A PIT (it is not floor: the walk grid has it shut). What flies crosses it,
//   and so do shots and sight (the open grid has it open).
//   THE SWIPE MOVES CROSS BOTH: a leap, a roll or a warp ends on the farthest place in its range
//   where the hero can stand, whatever its height (game.ts).
//
// A level with none of this (`hasRelief` false) pays nothing: its grid of steps is null.

import { T_FLOOR, T_PIT } from './types';
import type { Floor } from './types';

/** Which way a flight of stairs goes up: toward -y (the upper right of the screen), or toward -x (the upper left). */
export const STAIR_N = 1;
export const STAIR_W = 2;

/** The four side steps, as bits of a tile's entry in the grid of steps: to +x, to -x, to +y, to -y. */
export const STEP_E = 1;
export const STEP_W = 2;
export const STEP_S = 4;
export const STEP_N = 8;

/** Has this level any raised floor, stairs or pits at all? */
export function hasRelief(f: Floor): boolean {
  if (f.height) for (let i = 0; i < f.height.length; i++) if (f.height[i] !== 0) return true;
  if (f.stair) for (let i = 0; i < f.stair.length; i++) if (f.stair[i] !== 0) return true;
  for (let i = 0; i < f.tiles.length; i++) if (f.tiles[i] === T_PIT) return true;
  return false;
}

/** How many levels up a floor tile stands (the foot of a flight of stairs, for a stair). 0 for anything else. */
export function tileLevel(f: Floor, tx: number, ty: number): number {
  if (!f.height || tx < 0 || ty < 0 || tx >= f.w || ty >= f.h) return 0;
  return f.height[ty * f.w + tx];
}

/** Which way the stair on a tile goes up (STAIR_N, STAIR_W), or 0 if the tile is no stair. */
export function stairAt(f: Floor, tx: number, ty: number): number {
  if (!f.stair || tx < 0 || ty < 0 || tx >= f.w || ty >= f.h) return 0;
  return f.stair[ty * f.w + tx];
}

/**
 * How many levels up the GROUND is at a place in the world (in tiles): a whole number on plain
 * floor; on a flight of stairs it rises evenly from the foot to the head. 0 off the map, in a
 * wall and over a pit.
 */
export function levelAt(f: Floor, x: number, y: number): number {
  const tx = Math.floor(x);
  const ty = Math.floor(y);
  if (tx < 0 || ty < 0 || tx >= f.w || ty >= f.h) return 0;
  const i = ty * f.w + tx;
  if (f.tiles[i] !== T_FLOOR) return 0;
  const base = f.height ? f.height[i] : 0;
  const st = f.stair ? f.stair[i] : 0;
  if (st === STAIR_N) return base + Math.max(0, Math.min(1, 1 - (y - ty)));
  if (st === STAIR_W) return base + Math.max(0, Math.min(1, 1 - (x - tx)));
  return base;
}

/**
 * May a body pass between two tiles that lie side by side (never a diagonal: see `stepGrid`)?
 * Both must be floor. The rule is the same both ways.
 */
export function canStep(f: Floor, ax: number, ay: number, bx: number, by: number): boolean {
  if (ax < 0 || ay < 0 || bx < 0 || by < 0 || ax >= f.w || bx >= f.w || ay >= f.h || by >= f.h) return false;
  const ia = ay * f.w + ax;
  const ib = by * f.w + bx;
  if (f.tiles[ia] !== T_FLOOR || f.tiles[ib] !== T_FLOOR) return false;
  const ha = f.height ? f.height[ia] : 0;
  const hb = f.height ? f.height[ib] : 0;
  const sa = f.stair ? f.stair[ia] : 0;
  const sb = f.stair ? f.stair[ib] : 0;
  if (sa === 0 && sb === 0) return ha === hb;
  const dx = bx - ax;
  const dy = by - ay;
  if (sa !== 0 && sb !== 0) {
    // two stairs: side by side in one flight, or one above the other in a longer one
    if (sa !== sb) return false;
    const along = sa === STAIR_N ? dy : dx; // -1: b is up the flight from a
    if (along === 0) return ha === hb;
    return hb === ha - along;
  }
  // a stair and a plain tile: the plain one lies at the stair's foot, at its height, or at its head, one level up
  const stairIsA = sa !== 0;
  const st = stairIsA ? sa : sb;
  const hs = stairIsA ? ha : hb;
  const hp = stairIsA ? hb : ha;
  // (which way the plain tile lies from the stair)
  const px = stairIsA ? dx : -dx;
  const py = stairIsA ? dy : -dy;
  const along = st === STAIR_N ? py : px;
  const across = st === STAIR_N ? px : py;
  if (across !== 0) return false;
  return along === 1 ? hp === hs : hp === hs + 1;
}

/**
 * For every tile, the side steps a body may take from it BY THE RULES OF HEIGHT (bits STEP_E,
 * STEP_W, STEP_S, STEP_N): whatever else is in the way (a wall, a barrel) is the walk grid's to
 * say. null for a level with no relief: every step is then as it always was.
 */
export function stepGrid(f: Floor): Uint8Array | null {
  if (!hasRelief(f)) return null;
  const g = new Uint8Array(f.w * f.h);
  for (let y = 0; y < f.h; y++) {
    for (let x = 0; x < f.w; x++) {
      let b = 0;
      if (canStep(f, x, y, x + 1, y)) b |= STEP_E;
      if (canStep(f, x, y, x - 1, y)) b |= STEP_W;
      if (canStep(f, x, y, x, y + 1)) b |= STEP_S;
      if (canStep(f, x, y, x, y - 1)) b |= STEP_N;
      g[y * f.w + x] = b;
    }
  }
  return g;
}

/**
 * A walking hero stopped by the corner of a ledge, or by the side of a flight of stairs, and no
 * more than this far out of line with the way past it (tiles), is moved into line as they walk:
 * nobody is asked to thread a needle with a thumb. `LANE_HELP` is a little more than half a hero's
 * width, so that a hero astride a line is always moved to one side of it; `STAIR_HELP` reaches
 * further, and is for the side that leads onto stairs, which is taken before the other (someone
 * walking at the edge of a flight of stairs means to climb it).
 */
export const LANE_HELP = 0.35;
export const STAIR_HELP = 0.45;

/**
 * May a body whose middle is on tile (hx, hy) also lie over the tile (tx, ty) next to it (a side
 * neighbour or a diagonal one)? Over a diagonal one only if it could get there both ways round:
 * so the corner of a ledge, and the corner of a flight of stairs, are solid.
 */
export function mayOverlap(step: Uint8Array, w: number, hx: number, hy: number, tx: number, ty: number): boolean {
  const dx = tx - hx;
  const dy = ty - hy;
  if (dx === 0 && dy === 0) return true;
  const i = hy * w + hx;
  const bx = dx > 0 ? STEP_E : STEP_W;
  const by = dy > 0 ? STEP_S : STEP_N;
  if (dy === 0) return (step[i] & bx) !== 0;
  if (dx === 0) return (step[i] & by) !== 0;
  // (the two ways round: by the tile beside it along x and then along y, and the other way about)
  return (step[i] & bx) !== 0 && (step[i + dx] & by) !== 0 && (step[i] & by) !== 0 && (step[i + dy * w] & bx) !== 0;
}
