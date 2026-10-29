// TWO STRETCHES OF THE QUIET TOWER LAID BY HAND on the game's tiles, for the dev pages and the checks: how a level of floor 20
// may be laid with its ground (art/quiettower.ts) and its pieces (art/floor20.ts). How the real floor is laid is the main
// chat's. Nothing of the game imports it.
//
// - THE TOWER TOP, the Moth's floor: a round platform of the game's tiles, 16 across (a boss's arena, as floor 16's), the
//   parapet the ring of tiles round it, the drop past that.
// - THE INSIDE: four rooms of a floor of the tower, joined by doorways: the scriptorium, the bell-less belfry, a room the
//   fog has filled, and the stair's landing, the tower's stair going on up from it.

import { T_FLOOR, T_WALL } from '../game/types';
import type { Floor } from '../game/types';
import { QT_ZONE } from '../art/quiettower';
import type { QuietLand, TopLand } from '../art/quiettower';

const floorOf = (w: number, h: number, tiles: Uint8Array, start: readonly [number, number]): Floor => ({ depth: 20, seed: 20, w, h, tiles, cut: new Uint8Array(w * h), variant: new Uint8Array(w * h), rooms: [], start: { x: start[0], y: start[1] } } as unknown as Floor);

// =================================================================================================
// THE TOWER TOP

export const TW_ = 30;
export const TH_ = 30;
/** The platform's middle, and how far its floor reaches (tiles). */
export const TOP_C: readonly [number, number] = [15, 15];
export const TOP_R = 8.2;
/** Where the hero stands: before the lectern, come up by the trapdoor. */
export const TOP_HERO: readonly [number, number] = [16.6, 17.8];

export function topFloor(): Floor {
  const tiles = new Uint8Array(TW_ * TH_).fill(T_WALL);
  for (let y = 0; y < TH_; y++) for (let x = 0; x < TW_; x++) if (Math.hypot(x + 0.5 - TOP_C[0], y + 0.5 - TOP_C[1]) < TOP_R) tiles[y * TW_ + x] = T_FLOOR;
  return floorOf(TW_, TH_, tiles, TOP_HERO);
}
export function topLand(): Omit<TopLand, 'floor'> {
  return { centre: TOP_C };
}

// =================================================================================================
// THE INSIDE

export const IW = 40;
export const IH = 34;
type Rect = [number, number, number, number];
/** The rooms (x0, y0, x1, y1, the far edges not in them), each its kind; the doorways between them (floor, the stair's). */
export const IN_ROOMS: readonly (readonly [Rect, number])[] = [
  [[4, 4, 16, 14], QT_ZONE.Scriptorium],
  [[20, 4, 31, 14], QT_ZONE.Belfry],
  [[4, 18, 16, 29], QT_ZONE.Fogged],
  [[20, 18, 31, 29], QT_ZONE.Stair],
];
export const IN_DOORS: readonly Rect[] = [
  [16, 8, 20, 10],
  [9, 14, 11, 18],
  [25, 14, 27, 18],
  [16, 22, 20, 24],
];
/** Where the hero stands: in the scriptorium, by its doorway to the belfry. */
export const IN_HERO: readonly [number, number] = [12.6, 10.4];
const inR = (r: Rect, x: number, y: number): boolean => x >= r[0] && x < r[2] && y >= r[1] && y < r[3];

export function insideFloor(): Floor {
  const tiles = new Uint8Array(IW * IH).fill(T_WALL);
  for (let y = 0; y < IH; y++) for (let x = 0; x < IW; x++) if (IN_ROOMS.some(([r]) => inR(r, x, y)) || IN_DOORS.some((r) => inR(r, x, y))) tiles[y * IW + x] = T_FLOOR;
  return floorOf(IW, IH, tiles, IN_HERO);
}
export function insideLand(): Omit<QuietLand, 'floor'> {
  return {
    zone: (tx, ty) => IN_ROOMS.find(([r]) => inR(r, tx, ty))?.[1] ?? QT_ZONE.Stair,
    // (the fog seeping out of its room through the doorways)
    fog: (x, y) => {
      const d1 = Math.hypot(x - 18, y - 23);
      const d2 = Math.hypot(x - 10, y - 16);
      return Math.max(0, 0.6 - Math.min(d1, d2) / 4);
    },
  };
}
