// THE NEW MONSTERS IN THE WORLD (Version 19.9; game/defs.ts NEW_MONSTERS): where what they throw is,
// as it flies, by the art chat's films of them (src/dev/preview_new_mobs.ts, `golemfilm` and `bwfilm`,
// which he said yes to by 11:14 and 11:36). The rules know only where a thing was thrown from, where
// it comes down and when (game/defs.ts SKULL, SPEAR); the pictures know the rest.

import { SKULL } from '../game/defs';

/** How high (the game's pixels) the Boneward's spear rises over the line between where it left the hand and where it comes down: a flat throw. */
const SPEAR_ARC = 7;
/** Of a skull's flight, the share in which it rises to its height (then it falls). */
const SKULL_UP = 0.45;

/**
 * THE GOLEM'S SKULL `z.t` seconds into its flight of `z.dur`: where it is over the floor, and how high
 * (the game's pixels). Thrown up and forward from (x1, y1), over where it was aimed, (x, y), by
 * SKULL.over of the way, and falling onto it from SKULL.top.
 */
export function skullAt(z: { x: number; y: number; x1?: number; y1?: number; t: number; dur: number }): { x: number; y: number; z: number } {
  const k = Math.max(0, Math.min(1, z.dur > 0 ? z.t / z.dur : 1));
  const over = Math.min(1, k / SKULL.over);
  const e = 1 - (1 - over) * (1 - over);
  const x0 = z.x1 ?? z.x;
  const y0 = z.y1 ?? z.y;
  const up = k < SKULL_UP ? SKULL.z + (SKULL.top - SKULL.z) * (1 - (1 - k / SKULL_UP) ** 2) : SKULL.top * (1 - ((k - SKULL_UP) / (1 - SKULL_UP)) ** 2);
  return { x: x0 + (z.x - x0) * e, y: y0 + (z.y - y0) * e, z: Math.max(0, up) };
}

/** THE BONEWARD'S SPEAR in flight: how high it is (the game's pixels), from the hand's height down to the floor where it comes down, a little arc over the way. */
export function spearHeight(p: { dist: number; way?: number; z0?: number }): number {
  const way = p.way ?? 0;
  const k = way > 0 ? Math.max(0, Math.min(1, 1 - p.dist / way)) : 1;
  return (p.z0 ?? 0) * (1 - k) + 4 * SPEAR_ARC * k * (1 - k);
}
