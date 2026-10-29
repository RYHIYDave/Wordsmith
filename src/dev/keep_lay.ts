// Where the Keep's pieces (art/floor19.ts) stand on the corner laid by hand (dev/keep_level.ts), for the dev pages, laid as
// art/floor19.ts says the game may lay them. Nothing of the game imports it.
import type { Sprite } from '../engine/px';
import { keepPieces } from '../art/floor19';
import type { Piece } from '../art/floorkit';
import { K_HOLES, K_PORT_DOOR, K_PORT_HALL, K_THRONE } from './keep_level';

export interface Laid { d: number; s: Sprite; x: number; y: number; shadow: number; under?: boolean; wall?: boolean; name: string }

/** Every piece laid on the corner: what hangs on the walls (at the foot of their faces), what lies on the floor, what stands. */
export function layKeepPieces(): Laid[] {
  const P = keepPieces();
  const of = (n: string): Piece => {
    const p = P.find((q) => q.name === n);
    if (!p) throw new Error(`no piece named ${n}`);
    return p;
  };
  const out: Laid[] = [];
  const put = (n: string, x: number, y: number, f = 0, under = false): void => {
    const p = of(n);
    out.push({ d: x + y, s: p.frames![f], x, y, shadow: under ? 0 : p.shadow ?? 0, under, name: n });
  };
  /** On a wall: `face` 'left' a wall along x (its foot at y), 'right' a wall along y (its foot at x); at its spot `k`. */
  const hang = (n: string, face: 'left' | 'right', x: number, y: number, k = 0, f = 0): void => {
    const p = of(n);
    const spot = p.spots ? p.spots[k % p.spots.length] : { left: p.left!, right: p.right! };
    out.push({ d: x + y, s: (face === 'left' ? spot.left : spot.right)[f], x, y, shadow: 0, wall: true, name: n });
  };

  // THE WALL WALK: battlements along its outer row; a cauldron of pitch heating on it
  for (let x = 6; x < 42; x++) put('battlements', x + 0.5, 3.5, 0);
  for (const y of [3, 4]) put('battlements', 6.5, y + 0.5, 1);
  put('a cauldron of pitch', 30.5, 4.4, 0);

  // THE THRONE HALL: the throne on its dais at its head under the cloth of estate; banners down its walls, torches, braziers
  // either side of the dais; the runner down the hall to it, torn; two suits of armour in its far corners
  hang('the cloth of estate', 'left', K_THRONE[0], 8);
  put('the throne on its dais', K_THRONE[0], K_THRONE[1]);
  for (const [x, k] of [[18.5, 0], [21, 1], [27, 2], [29.5, 3]] as const) hang('a royal banner', 'left', x, 8, k);
  for (const [y, k] of [[11.5, 0], [15, 1], [18.5, 2]] as const) hang('a royal banner', 'right', 16, y, k);
  hang('a torch in its sconce', 'left', 20, 8, 0, 0);
  hang('a torch in its sconce', 'left', 28, 8, 1, 1);
  hang('a torch in its sconce', 'right', 16, 13.3, 0, 2);
  hang('a torch in its sconce', 'right', 16, 16.8, 2, 0);
  put('a brazier', 21.6, 11.2, 0);
  put('a brazier', 26.4, 11.2, 1);
  for (let y = 10; y < 21; y++) put('the royal runner', K_THRONE[0], y + 0.5, y === 17 ? 3 : 2, true);
  put('a suit of armour on its stand', 17.4, 9.4, 0);
  put('a suit of armour on its stand', 30.6, 9.4, 0);
  // its doorway into the armoury, the portcullis raised in it (along y)
  for (let y = K_PORT_DOOR.y0; y < K_PORT_DOOR.y1; y++) put('a portcullis', K_PORT_DOOR.x + 0.5, y + 0.5, 5);

  // THE ARMOURY: weapon racks along its far wall, a crossbow rack by its left wall, the anvil, armour (one knocked down), barrels
  put('a weapon rack', 7.6, 9.6, 0);
  put('a weapon rack', 11.4, 9.6, 0);
  put('a crossbow rack', 5.6, 13.4, 1);
  hang('a torch in its sconce', 'left', 9.5, 9, 2, 1);
  hang('an arrow slit', 'right', 5, 16.5, 1);
  put("an armourer's anvil", 9.4, 14.2);
  put('a suit of armour on its stand', 6.4, 17.6, 0);
  put('a suit of armour on its stand', 11.6, 17.2, 1);
  put('barrels', 12.6, 11.4, 0);

  // THE BARRACKS: bunks along its far wall and down its left, a long table, barrels (one burst), a torch
  put('barracks bunks', 36.6, 10, 0);
  put('barracks bunks', 40.6, 10, 0);
  put('barracks bunks', 35, 15.4, 1);
  put('a long table', 39.4, 15.6, 0);
  put('barrels', 41.8, 17.8, 1);
  hang('a torch in its sconce', 'left', 38.6, 9, 1, 2);

  // THE GALLERY: banners and torches down it; the war table; a portcullis down across it, cutting it in two, its winch by it
  for (const [x, k] of [[6, 0], [30, 2], [41, 3]] as const) hang('a royal banner', 'left', x, 23, k);
  for (const [x, f] of [[20.5, 1], [34, 2]] as const) hang('a torch in its sconce', 'left', x, 23, 0, f);
  for (let y = K_PORT_HALL.y0; y < K_PORT_HALL.y1; y++) put('a portcullis', K_PORT_HALL.x + 0.5, y + 0.5, 9);
  put("the portcullis's winch", 14.4, 23.6);
  put('the war table, its map', 36.5, 24.4);

  // THE BAILEY: the keep's great doors on its far wall where the way in is; the well; barrels; a crossbow rack; arrow slits
  hang("the keep's great doors", 'left', 20, 29, 0, 1);
  put('the castle well', 19.5, 35.5);
  put('barrels', 11.6, 30.4, 0);
  put('a crossbow rack', 27.4, 29.6, 0);

  // THE GATE PASSAGE: its murder holes, one still, one pouring, one left its pool
  put('a murder hole', K_HOLES[0][0], K_HOLES[0][1], 0, true);
  put('a murder hole', K_HOLES[1][0], K_HOLES[1][1], 2, false);
  put('a murder hole', K_HOLES[2][0], K_HOLES[2][1], 3, false);

  // THE KING'S BEDCHAMBER: his great bed, its head to the far wall, its curtains; the songbird's cushion by it, empty; the
  // clockwork songbird broken on the floor; a torch
  put("the king's great bed", 3.8, 30.3);
  put("the songbird's silk cushion", 6.2, 29.8);
  put('the clockwork songbird, broken', 5.4, 33.2, 0, true);
  hang('a torch in its sconce', 'left', 6.6, 29, 1, 0);
  return out;
}
