// A CORNER OF THE MASQUE LAID BY HAND on the game's tiles, for the first look (dev/masque_paint.ts), the dev pages and the
// checks: how a level of floor 17 may be laid with its ground (art/masque.ts) and its pieces (art/floor17.ts). How the
// real floor is laid is the main chat's. Nothing of the game imports it.
//
// Five rooms of the palace round the violet room, where the knight stands: to the west through a doorway the black room,
// the seventh (the tale's order runs blue, purple, green, orange, white, violet, black, from the east), its ebony clock
// against its western wall; to the north-east the white room, the fifth; to the south-east a card room; to the south the
// long gallery, and between it and the black room a servants' passage, the closed corridor where the braziers stand. One
// tile of wall between rooms; each doorway two tiles wide.

import { T_FLOOR, T_WALL } from '../game/types';
import type { Floor } from '../game/types';
import { MQ_ZONE } from '../art/masque';
import type { MasqueLand } from '../art/masque';

export const MW = 36;
export const MH = 30;
type Rect = readonly [number, number, number, number]; // x0, y0, x1, y1 (x1, y1 not in it)
const inR = (r: Rect, x: number, y: number): boolean => x >= r[0] && x < r[2] && y >= r[1] && y < r[3];

/** The rooms, each with what it is. */
export const M_ROOMS: readonly (readonly [Rect, number])[] = [
  [[12, 12, 20, 20], MQ_ZONE.Violet],
  [[3, 10, 11, 18], MQ_ZONE.Black],
  [[21, 6, 29, 14], MQ_ZONE.White],
  [[21, 15, 28, 22], MQ_ZONE.Cards],
  [[3, 19, 11, 21], MQ_ZONE.Passage],
  // the gallery, irregular as the tale's suite is: four tiles across under the violet room, three under the passage
  [[0, 22, 21, 25], MQ_ZONE.Gallery],
  [[11, 21, 21, 22], MQ_ZONE.Gallery],
];
/** The doorways, each two tiles wide, and the room whose floor runs through it. */
export const M_DOORS: readonly (readonly [Rect, number])[] = [
  // the violet room into the black room (the black's velvet runs through)
  [[11, 14, 12, 16], MQ_ZONE.Black],
  // the violet room into the white room (the white's marble), and into the card room (the violet's)
  [[20, 12, 21, 14], MQ_ZONE.White],
  [[20, 16, 21, 18], MQ_ZONE.Violet],
  // the violet room down into the gallery
  [[15, 20, 17, 21], MQ_ZONE.Gallery],
  // the passage into the gallery, at its west end
  [[4, 21, 6, 22], MQ_ZONE.Passage],
];
/** Where the knight stands: in the violet room, toward the doorway into the black room. */
export const M_HERO: readonly [number, number] = [15.2, 16.4];
/** The ebony clock against the black room's western wall (its front looking along +x). */
export const M_CLOCK: readonly [number, number] = [3.55, 13.5];

/** The level's tiles and what each is. */
export function masqueFloor(): { floor: Floor; zone: Uint8Array } {
  const tiles = new Uint8Array(MW * MH).fill(T_WALL);
  const zone = new Uint8Array(MW * MH).fill(MQ_ZONE.Passage);
  for (let y = 0; y < MH; y++) {
    for (let x = 0; x < MW; x++) {
      const i = y * MW + x;
      for (const [r, z] of M_ROOMS) {
        if (inR(r, x, y)) {
          tiles[i] = T_FLOOR;
          zone[i] = z;
        }
      }
      for (const [r, z] of M_DOORS) {
        if (inR(r, x, y)) {
          tiles[i] = T_FLOOR;
          zone[i] = z;
        }
      }
    }
  }
  const floor = { depth: 17, seed: 17, w: MW, h: MH, tiles, cut: new Uint8Array(MW * MH), variant: new Uint8Array(MW * MH), rooms: [], start: { x: M_HERO[0], y: M_HERO[1] } } as unknown as Floor;
  return { floor, zone };
}

/** What only this level knows, for its ground. */
export function masqueLand(): MasqueLand {
  const { floor, zone } = masqueFloor();
  return { floor, zone: (tx, ty) => zone[ty * MW + tx] };
}
