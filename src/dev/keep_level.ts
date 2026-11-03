// A CORNER OF THE KEEP LAID BY HAND on the game's tiles, for the dev pages and the checks: how a level of floor 19 may be
// laid with its ground (art/keep.ts) and its pieces (art/floor19.ts). How the real floor is laid is the main chat's.
// Nothing of the game imports it.
//
// What is laid (tiles; x down the screen to the right, y down to the left):
// - THE WALL WALK along the top, on the battlements, open to the sky; a stair down from it into the armoury.
// - THE THRONE HALL in the middle, the throne on its dais against its far wall; THE ARMOURY to its left and THE BARRACKS
//   to its right, each through a doorway; a PORTCULLIS across the throne hall's doorway into the gallery below it.
// - THE GALLERY, a long hall across the front, a portcullis across it too ("to cut a hall in two").
// - Below the gallery, THE BAILEY open to the sky, its well; out of it on the right THE GATE PASSAGE under the gatehouse,
//   its murder holes, to the great doors; on the left THE KING'S BEDCHAMBER, his great bed, the songbird's cushion by it,
//   the clockwork songbird broken on the floor.

import { T_FLOOR, T_WALL } from '../game/types';
import type { Floor } from '../game/types';
import { KP_ZONE } from '../art/keep';
import type { KeepLand } from '../art/keep';

export const KW = 48;
export const KH = 46;
type Rect = readonly [number, number, number, number];
/** The rooms (x0, y0, x1, y1: x1, y1 not in them), each with its kind; then the doorways and ways between them. */
export const K_ROOMS: readonly (readonly [Rect, number])[] = [
  [[6, 3, 42, 5], KP_ZONE.Walk],
  [[16, 8, 32, 21], KP_ZONE.Throne],
  [[5, 9, 14, 19], KP_ZONE.Armoury],
  [[34, 9, 43, 19], KP_ZONE.Barracks],
  [[2, 23, 44, 26], KP_ZONE.Hall],
  [[10, 29, 30, 41], KP_ZONE.Bailey],
  [[30, 33, 41, 36], KP_ZONE.Gate],
  [[1, 29, 8, 39], KP_ZONE.Chamber],
];
export const K_DOORS: readonly (readonly [Rect, number])[] = [
  // the stair down from the walk into the armoury
  [[8, 5, 10, 9], KP_ZONE.Hall],
  [[14, 13, 16, 15], KP_ZONE.Armoury],
  [[32, 13, 34, 15], KP_ZONE.Barracks],
  [[23, 21, 25, 23], KP_ZONE.Hall],
  [[8, 19, 10, 23], KP_ZONE.Hall],
  [[38, 19, 40, 23], KP_ZONE.Hall],
  [[19, 26, 21, 29], KP_ZONE.Hall],
  [[3, 26, 5, 29], KP_ZONE.Chamber],
];
/** The throne, at the head of its hall; the portcullises (each a row of tiles across a way: in the doorway from the throne hall into the armoury, and across the gallery); the murder holes. */
export const K_THRONE: readonly [number, number] = [24, 9.4];
export const K_PORT_DOOR = { x: 15, y0: 13, y1: 15 };
export const K_PORT_HALL = { x: 12, y0: 23, y1: 26 };
export const K_HOLES: readonly (readonly [number, number])[] = [
  [33.5, 34.5],
  [35.5, 34.5],
  [37.5, 34.5],
];
/** Where the hero stands: in the throne hall, on the runner, short of the dais. */
export const K_HERO: readonly [number, number] = [24.4, 16.2];

const inR = (r: Rect, x: number, y: number): boolean => x >= r[0] && x < r[2] && y >= r[1] && y < r[3];

/** The level's tiles and each walkable tile's kind. */
export function keepLevel(): { floor: Floor; zone: Uint8Array; land: KeepLand } {
  const tiles = new Uint8Array(KW * KH).fill(T_WALL);
  const zone = new Uint8Array(KW * KH).fill(KP_ZONE.Hall);
  for (let y = 0; y < KH; y++) {
    for (let x = 0; x < KW; x++) {
      const i = y * KW + x;
      for (const [r, z] of [...K_ROOMS, ...K_DOORS]) {
        if (inR(r, x, y)) {
          tiles[i] = T_FLOOR;
          zone[i] = z;
        }
      }
    }
  }
  const floor = { depth: 19, seed: 19, w: KW, h: KH, tiles, cut: new Uint8Array(KW * KH), variant: new Uint8Array(KW * KH), rooms: [], start: { x: K_HERO[0], y: K_HERO[1] } } as unknown as Floor;
  return { floor, zone, land: { floor, zone: (tx, ty) => zone[ty * KW + tx] } };
}
