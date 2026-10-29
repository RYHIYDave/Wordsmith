// Where the Glass Gallery's pieces (art/floor18.ts) stand on the level laid by hand (dev/glass_level.ts), for the dev pages,
// laid as the game may lay them: what stands on the floor at its foot; what hangs on a wall at the foot of that wall's face
// (on a wall along x, the face turned to screen-left, `left`; along y, the face turned to screen-right, `right`). How the
// real floor is laid is the main chat's. Nothing of the game imports it.
import type { Sprite } from '../engine/px';
import { glassGalleryPieces } from '../art/floor18';
import type { Piece } from '../art/floorkit';

export interface Laid { d: number; s: Sprite; x: number; y: number; shadow: number; under?: boolean; name: string }

/** Every piece laid on the level. */
export function layGlassPieces(): Laid[] {
  const P = glassGalleryPieces();
  const of = (n: string): Piece => {
    const p = P.find((q) => q.name === n);
    if (!p) throw new Error(`no piece named ${n}`);
    return p;
  };
  const out: Laid[] = [];
  /** What stands (or lies, `under`) at (x, y). */
  const put = (n: string, x: number, y: number, f = 0, under = false): void => {
    const p = of(n);
    out.push({ d: x + y, s: p.frames![f], x, y, shadow: p.shadow ?? 0, under, name: n });
  };
  /** What hangs on the face of a wall along x whose foot runs at y (its middle at x): the face turned to screen-left. */
  const onX = (n: string, x: number, y: number, f = 0): void => {
    const p = of(n);
    out.push({ d: x + y - 0.6, s: p.left![f], x, y, shadow: 0, name: n });
  };
  /** The same on a wall along y whose foot runs at x: the face turned to screen-right. */
  const onY = (n: string, x: number, y: number, f = 0): void => {
    const p = of(n);
    out.push({ d: x + y - 0.6, s: p.right![f], x, y, shadow: 0, name: n });
  };

  // THE GALLERY: its back wall's foot at y 12, hung with tall mirrors, a sconce between some, a tapestry in rags; the
  // doorways at 8-9, 18-19 and 29-30 left open. The mirror before the hero whole; the next cracked; one burst
  const WALL = 12;
  // (two and a half tiles apart: each mirror's glass 58 across, the size the reflections' step-out is made for)
  const MIRRORS: [number, number][] = [[6.0, 0], [11.3, 0], [13.8, 0], [16.3, 0], [21.2, 0], [23.7, 1], [26.2, 2], [32.3, 0], [34.7, 1]];
  for (const [x, f] of MIRRORS) onX('a tall mirror', x, WALL, f);
  onX('a sconce of candles', 4.6, WALL);
  onX('a tapestry in rags', 30.4, WALL);
  // its left wall's foot at x 4: mirrors on it, a sconce
  for (const y of [13.5, 17.5]) onY('a tall mirror', 4, y);
  onY('a sconce of candles', 4, 15.5);
  // standing in the gallery: candelabra between the mirrors, a console table, banquettes along its front, busts at its
  // ends; the cracked mirror's shards before it; her things dropped; a row of skylights down its near side (two of them
  // broken through: the ground's own holes)
  for (const x of [12.55, 15.05, 22.45, 27.6]) put('a silver candelabrum', x, 12.75);
  put('a console table', 33.5, 12.62);
  put("a mirror's shards", 23.7, 12.85, 0, true);
  for (const x of [8.2, 17.0, 27.5]) put('a velvet banquette', x, 18.45, 0);
  put('a bust on a plinth', 4.75, 18.3);
  put('a bust on a plinth', 33.4, 18.3, 1);
  put('a jewel box, spilled', 18.6, 13.5, 0, true);
  put('a hand mirror, dropped', 25.3, 14.0, 0, true);
  put('a skylight', 11.5, 17.5, 0, true);
  put('a skylight', 15.5, 17.5, 1, true);
  put('a skylight', 20.5, 17.5, 0, true);
  // the way on into the Mirror Hall: a gate of wrought silver across it, stood open
  put('a gate of wrought silver', 35.5, 15.5, 3);

  // THE CHAPEL: its stained glass in its back wall (foot at y 3) and its left (foot at x 5); pews in two rows either side of
  // its aisle; the glass coffin before the windows, a candelabrum either side; the day's colours on its floor
  for (const x of [6.5, 9.0, 11.5]) onX('a stained-glass window', x, 3);
  for (const y of [5.5, 8.0]) onY('a stained-glass window', 5, y);
  put('the colours of the stained glass', 6.6, 5.6, 0, true);
  put('the colours of the stained glass', 9.2, 4.9, 0, true);
  for (const y of [6.4, 7.6, 8.8]) {
    put('a chapel pew', 6.9, y, 0);
    put('a chapel pew', 11.2, y, 0);
  }
  put('a glass coffin', 9.0, 4.5);
  put('a silver candelabrum', 7.0, 3.7);
  put('a silver candelabrum', 11.2, 3.7);

  // THE DRESSING ROOM: the table against its back wall (foot at y 5), the wardrobe, the screen, the cheval glass, a
  // banquette; her jewels spilled
  put('a dressing table', 17.6, 5.75, 0);
  put('a wardrobe of gowns', 20.5, 5.75, 0);
  onY('a tall mirror', 16, 8.5);
  put('a dressing screen', 17.2, 8.6, 0);
  put('a cheval mirror', 21.2, 8.6, 0);
  put('a jewel box, spilled', 19.4, 7.6, 0, true);

  // THE GLASSHOUSE: benches of dead orchids in rows, an orchid in its pot by the door, one knocked over; a pane fallen
  // from the roof; a skylight in its floor (it stands on the roof: the floor below is the gallery's)
  for (const [x, y] of [[27.4, 3.4], [31.4, 3.4], [27.4, 6.4], [31.4, 6.4]] as const) put('a bench of dead orchids', x, y, 0);
  put('an orchid in its pot, dead', 33.9, 8.9, 0);
  put('an orchid in its pot, dead', 28.3, 8.8, 1);
  put('a pane fallen from the roof', 30.6, 8.4, 0, true);
  put('a skylight', 33.5, 5.5, 2, true);

  // THE MIRROR HALL (the Queen's): tall mirrors on its back wall (foot at y 11), her doors between them; candelabra; the
  // apple she made on its dish
  for (const x of [37.4, 41.6]) onX('a tall mirror', x, 11);
  onX("the queen's doors", 39.5, 11, 0);
  put('a silver candelabrum', 36.8, 11.8);
  put('a silver candelabrum', 42.2, 11.8);
  put('the apple on a silver dish', 39.5, 17.2);
  return out;
}
