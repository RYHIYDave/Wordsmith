// Isometric projection. World units are tiles; one tile is a 32x16 pixel diamond on screen.
//
//   world x grows toward screen right-down, world y grows toward screen left-down.
//   Tile (tx, ty) covers world [tx, tx+1) x [ty, ty+1). Its diamond's TOP vertex is at
//   screen (sx(tx, ty), sy(tx, ty)); its centre is 8 px below that.

export const TW = 32; // tile diamond width in pixels
export const TH = 16; // tile diamond height in pixels
export const HW = 16;
export const HH = 8;

/** Height in pixels of a full wall block and of a cut-away (low) wall block. */
export const WALL_H = 24;
export const LOW_WALL_H = 8;

/**
 * How high one level of raised floor stands, in pixels: a ledge the height of a hero's thigh,
 * which nobody steps up (the owner, 5 Oct 2026: "I need to be able to jump up and down ledges"),
 * and four steps of a flight of stairs. How deep a pit is seen to go before it is lost in the dark.
 */
export const LEDGE_H = 12;
export const PIT_DEPTH = 22;

export function sx(x: number, y: number): number {
  return (x - y) * HW;
}

export function sy(x: number, y: number): number {
  return (x + y) * HH;
}

/** Screen pixel offset (relative to the world origin's screen position) back to world coordinates. */
export function toWorldX(px: number, py: number): number {
  return (px / HW + py / HH) / 2;
}

export function toWorldY(px: number, py: number): number {
  return (py / HH - px / HW) / 2;
}

/**
 * Turn a direction the player gave in SCREEN space (e.g. stick up-right) into a unit vector in
 * WORLD space, so the hero visibly moves the way the input points.
 */
export function screenDirToWorld(dx: number, dy: number): { x: number; y: number } {
  const wx = toWorldX(dx, dy);
  const wy = toWorldY(dx, dy);
  const len = Math.hypot(wx, wy);
  return len > 1e-6 ? { x: wx / len, y: wy / len } : { x: 0, y: 0 };
}

/** Depth key for painter's-order sorting: larger = nearer the camera. */
export function depth(x: number, y: number): number {
  return x + y;
}
