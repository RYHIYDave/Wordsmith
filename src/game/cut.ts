// TRIANGLES: a tile cut corner to corner, half of it wall.
//
// The owner, 7 Oct 2026, 06:59: "What would happen if we added triangles to the tileset?"; of the
// stills of rooms with them, 08:01: "Triangles look pretty good I like it". (And of cutting the
// tile finer still, 08:14: "We can table it for now. But remind me of this option when we start
// working on new environments": docs/NEXT_VERSION.md has that reminder.)
//
// What a level knows (types.ts, Floor.cut): for a cut tile, which half of it is wall. In the tile's
// own measure (u along +x, v along +y, each 0 to 1):
//
//   the line ACROSS the screen is u + v = 1 (from the tile's left corner to its right one):
//     CUT_FAR   the wall is the half with u + v < 1 (up the screen: the tile's top corner);
//     CUT_NEAR  the wall is the half with u + v > 1 (toward the eye: its bottom corner);
//   the line UP AND DOWN the screen is u = v (from its top corner to its bottom one):
//     CUT_LEFT  the wall is the half with v > u (its left corner);
//     CUT_RIGHT the wall is the half with u > v (its right corner).
//
// The rules that follow are all here:
//   A BODY stands on the floor half of a cut floor tile and never reaches into the wall half: it
//   is held off the slanting wall by its own half width, as off any wall (`bodyInWall`).
//   A SHOT, A LINE OF SIGHT and anything that is asked of a single place meet the wall half as
//   wall (`inWall`, `segmentInWall`).
//   WAY-FINDING leaves cut tiles alone: the walk grid has them shut (nav.ts, buildWalkGrid), so
//   nobody is steered through half a tile. A hero may still walk onto the floor half.
// A level with no cut tile (`Floor.cut` absent) pays nothing.

import { CUT_FAR, CUT_FAR_LOW, CUT_LEFT, CUT_LEFT_LOW, CUT_NEAR, CUT_NEAR_LOW, CUT_RIGHT, CUT_RIGHT_LOW } from './types';
import type { Floor } from './types';

/** Which half of a cut tile is wall, whatever its height: CUT_FAR, CUT_NEAR, CUT_LEFT or CUT_RIGHT (0 for a whole tile). */
export function cutHalf(c: number): number {
  switch (c) {
    case CUT_FAR:
    case CUT_FAR_LOW:
      return CUT_FAR;
    case CUT_NEAR:
    case CUT_NEAR_LOW:
      return CUT_NEAR;
    case CUT_LEFT:
    case CUT_LEFT_LOW:
      return CUT_LEFT;
    case CUT_RIGHT:
    case CUT_RIGHT_LOW:
      return CUT_RIGHT;
    default:
      return 0;
  }
}

/** Is the wall half of a cut tile drawn cut down low? */
export function cutLow(c: number): boolean {
  return c === CUT_FAR_LOW || c === CUT_NEAR_LOW || c === CUT_LEFT_LOW || c === CUT_RIGHT_LOW;
}

const R2 = Math.SQRT1_2;

/**
 * How far a place in a tile's own measure (u, v) lies INTO the wall half of a tile cut `c`, in
 * tiles, measured square to the cut (less than 0: that far out on the floor side).
 */
export function intoWall(c: number, u: number, v: number): number {
  switch (cutHalf(c)) {
    case CUT_FAR:
      return (1 - u - v) * R2;
    case CUT_NEAR:
      return (u + v - 1) * R2;
    case CUT_LEFT:
      return (v - u) * R2;
    case CUT_RIGHT:
      return (u - v) * R2;
    default:
      return -1;
  }
}

/** The cut of the tile at (tx, ty): 0 if it is whole, or off the map. */
export function cutAt(f: Floor, tx: number, ty: number): number {
  if (!f.cut || tx < 0 || ty < 0 || tx >= f.w || ty >= f.h) return 0;
  return f.cut[ty * f.w + tx];
}

/** Is this place in the world in the wall half of a cut tile? (False on a whole tile: its own kind says what it is.) */
export function inWall(f: Floor, x: number, y: number): boolean {
  const tx = Math.floor(x);
  const ty = Math.floor(y);
  const c = cutAt(f, tx, ty);
  return c !== 0 && intoWall(c, x - tx, y - ty) > 0;
}

/** The three corners of the wall half of a tile cut `c`, in the tile's own measure: the two ends of the cut, then the corner the wall is in. */
function wallCorners(c: number): readonly [number, number, number, number, number, number] {
  switch (cutHalf(c)) {
    case CUT_FAR:
      return [1, 0, 0, 1, 0, 0];
    case CUT_NEAR:
      return [1, 0, 0, 1, 1, 1];
    case CUT_LEFT:
      return [0, 0, 1, 1, 0, 1];
    default:
      return [0, 0, 1, 1, 1, 0];
  }
}

/** The square of how far a place is from a stretch of line. */
function fromStretch(px: number, py: number, ax: number, ay: number, bx: number, by: number): number {
  const dx = bx - ax;
  const dy = by - ay;
  const len = dx * dx + dy * dy;
  const t = len > 0 ? Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / len)) : 0;
  const qx = ax + dx * t - px;
  const qy = ay + dy * t - py;
  return qx * qx + qy * qy;
}

/**
 * Does a body (a round one, `r` across its half) whose middle is at (x, y) in the world reach
 * into the wall half of the cut tile (tx, ty)? The wall half is a triangle: the body reaches it
 * if its middle is in it, or nearer than `r` to one of its three sides.
 */
export function bodyInWall(c: number, tx: number, ty: number, x: number, y: number, r: number): boolean {
  const u = x - tx;
  const v = y - ty;
  if (u >= 0 && u <= 1 && v >= 0 && v <= 1 && intoWall(c, u, v) > 0) return true;
  const [ax, ay, bx, by, cx, cy] = wallCorners(c);
  const rr = r * r;
  // (a hair inside: a body exactly `r` from the wall stands, as it does against any wall)
  const near = rr - 1e-9;
  return fromStretch(u, v, ax, ay, bx, by) < near || fromStretch(u, v, bx, by, cx, cy) < near || fromStretch(u, v, cx, cy, ax, ay) < near;
}

/**
 * Does the straight stretch from (x0, y0) to (x1, y1), both of them in the tile (tx, ty) or on
 * its edge, pass through the wall half of that tile cut `c`? (The wall half is all on one side of
 * a line, so the stretch is in it if either of its ends is.)
 */
export function segmentInWall(c: number, tx: number, ty: number, x0: number, y0: number, x1: number, y1: number): boolean {
  const eps = 1e-6;
  return intoWall(c, x0 - tx, y0 - ty) > eps || intoWall(c, x1 - tx, y1 - ty) > eps;
}

/**
 * Which way along the cut of a tile a body slides when it is pushed against it: the unit vector
 * along the cut line (one of its two ways; the caller tries both).
 */
export function alongCut(c: number): { x: number; y: number } {
  const h = cutHalf(c);
  // (the line across the screen runs from (0, 1) to (1, 0): +x -y; the line up and down from (0, 0) to (1, 1): +x +y)
  return h === CUT_FAR || h === CUT_NEAR ? { x: R2, y: -R2 } : { x: R2, y: R2 };
}
