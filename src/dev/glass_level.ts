// A CORNER OF THE GLASS GALLERY LAID BY HAND on the game's tiles, as the first look was painted (dev/gallery_paint.ts), for
// the dev pages and the checks: how a level of floor 18 may be laid with its ground (art/glassgallery.ts) and its pieces
// (art/floor18.ts). How the real floor is laid is the main chat's. Nothing of the game imports it.
//
// A long gallery of mirrors along x, a runner down it; off its back wall, through doorways, the chapel, a dressing room
// and the glasshouse (on one level, as the game walks: the stair up to the roof is a piece); a skylight broken through in
// the gallery's floor; at its far end the way on into the Mirror Hall.

import { T_FLOOR, T_WALL } from '../game/types';
import type { Floor } from '../game/types';
import { GG_ZONE } from '../art/glassgallery';
import type { GlassLand } from '../art/glassgallery';

export const LW = 44;
export const LH = 30;
type Rect = readonly [number, number, number, number];
const inR = (r: Rect, x: number, y: number): boolean => x >= r[0] && x < r[2] && y >= r[1] && y < r[3];
/** The rooms (x0, y0, x1, y1) and what each is. */
export const ROOMS: readonly (readonly [Rect, number])[] = [
  [[4, 12, 36, 19], GG_ZONE.Gallery],
  [[5, 3, 13, 10], GG_ZONE.Chapel],
  [[16, 5, 22, 10], GG_ZONE.Dressing],
  [[25, 2, 35, 10], GG_ZONE.Glasshouse],
  [[36, 11, 43, 21], GG_ZONE.MirrorHall],
];
/** The doorways through the walls between them (two tiles wide, the wall two tiles thick). */
export const DOORS: readonly Rect[] = [
  [8, 10, 10, 12],
  [18, 10, 20, 12],
  [29, 10, 31, 12],
];
/** The way on into the Mirror Hall, at the gallery's far end: an arch three tiles wide. */
export const HALL_WAY: Rect = [35, 14, 37, 17];
/** The runner down the gallery (y from y0 to y1), and on across the Mirror Hall. */
export const RUNNER = { y0: 14.9, y1: 16.1, x0: 4.6, x1: 42.4 };
/** The skylights broken through in the gallery's floor (the drop): tiles. */
export const SKY_HOLES: readonly (readonly [number, number])[] = [
  [13, 17],
  [14, 17],
];
/** Where the hero stands: in the gallery before the mirrors on its back wall. */
export const L_HERO: readonly [number, number] = [21.4, 13.6];

export const isSkyHole = (tx: number, ty: number): boolean => SKY_HOLES.some(([x, y]) => x === tx && y === ty);

/** The level's tiles. */
export function glassFloor(): Floor {
  const tiles = new Uint8Array(LW * LH).fill(T_WALL);
  for (let ty = 0; ty < LH; ty++) {
    for (let tx = 0; tx < LW; tx++) {
      let floor = ROOMS.some(([r]) => inR(r, tx, ty)) || DOORS.some((r) => inR(r, tx, ty)) || inR(HALL_WAY, tx, ty);
      if (isSkyHole(tx, ty)) floor = false;
      if (floor) tiles[ty * LW + tx] = T_FLOOR;
    }
  }
  return { depth: 18, seed: 18, w: LW, h: LH, tiles, cut: new Uint8Array(LW * LH), variant: new Uint8Array(LW * LH), rooms: [], start: { x: L_HERO[0], y: L_HERO[1] } } as unknown as Floor;
}

/** What only this level knows, for its ground. */
export function glassLand(floor: Floor = glassFloor()): GlassLand {
  return {
    floor,
    zone: (tx, ty) => {
      for (const [r, z] of ROOMS) if (inR(r, tx, ty)) return z;
      // (a doorway is the room it opens from: the gallery)
      return GG_ZONE.Gallery;
    },
    runner: (x, y) => (x > RUNNER.x0 && x < RUNNER.x1 ? Math.min(y - RUNNER.y0, RUNNER.y1 - y) : -1),
    skylight: isSkyHole,
  };
}
