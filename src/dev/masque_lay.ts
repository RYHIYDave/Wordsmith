// Where the Masque's pieces (art/floor17.ts) stand on the corner laid by hand (dev/masque_level.ts), for the first look
// (dev/masque_paint.ts) and the dev pages, laid as the game may lay them. Nothing of the game imports it.
//
// THE SEVEN ROOMS ARE LIT THROUGH THEIR WINDOWS (the tale: no lamp or candle in them); the candles are the gallery's and
// the card room's (his doc's "candlelight"); the braziers stand in the servants' passage, "opposite to each window".
import type { Sprite } from '../engine/px';
import { masquePieces } from '../art/floor17';
import type { Piece } from '../art/floorkit';

export interface Laid {
  /** Its depth, far to near (what lies on the floor and what hangs on a wall go first). */
  d: number;
  s: Sprite;
  x: number;
  y: number;
  shadow: number;
  /** Lying on the floor (drawn before all that stands). */
  under?: boolean;
  /** Hung on a far wall (drawn before all on the floor): its foot on the wall's foot line. */
  wall?: boolean;
  name: string;
}

/** Every piece laid in the corner; `chime`: the clock at its chime (the first look's moment), else swinging. */
export function layMasquePieces(chime = false): Laid[] {
  const P = masquePieces();
  const of = (n: string): Piece => {
    const p = P.find((q) => q.name === n);
    if (!p) throw new Error(`no piece named ${n}`);
    return p;
  };
  const out: Laid[] = [];
  const put = (n: string, x: number, y: number, f = 0, under = false, d = x + y): void => {
    const p = of(n);
    out.push({ d, s: p.frames![f], x, y, shadow: under ? 0 : p.shadow ?? 0, under, name: n });
  };
  /** On a far wall: along x at the wall's line y (`face` 0, turned to the screen's left), or along y at its line x (1). */
  const hang = (n: string, face: 0 | 1, x: number, y: number, f = 0): void => {
    const p = of(n);
    const s = face === 0 ? p.left![f] : p.right![f];
    out.push({ d: -1e6 + x + y, s, x, y, shadow: 0, wall: true, name: n });
  };
  // THE BLACK ROOM: the great ebony clock against its western wall, its front to the east; a third window, curtained,
  // between the two the ground has in its northern wall; masks dropped where the dancers fled it
  put('the great ebony clock', 3.55, 13.5, chime ? 11 : 6);
  hang('black velvet at a window lit red', 0, 7, 10);
  put('masks dropped on the floor', 9.4, 15.4, 0, true);
  // THE VIOLET ROOM: the great doors in its northern wall between its windows; gilt chairs along the wall; a fainting
  // couch; the golden ornaments hanging from the roof over its middle; the royal crest in its floor; wine spilled
  hang('the great doors', 0, 16, 12);
  for (const x of [12.9, 19.1]) put('a gilt chair', x, 12.7);
  put('a gilt chair', 12.7, 19.2, 1);
  put('a fainting couch', 13.4, 13.8, 1);
  put('the royal crest in the floor', 16.5, 15.5, 0, true);
  put('gilt ornaments hanging from the roof', 17.0, 16.4);
  put('wine spilled', 18.3, 18.4, 0, true);
  put('gilt ornaments, scattered', 13.8, 17.8, 0, true);
  // THE WHITE ROOM: the buffet of the feast gone cold along its northern wall, a pier glass over it; a tapestry on its
  // western wall; the musicians' corner, the harpsichord, a viol on its stand, gilt chairs; a footman's tray dropped
  hang('a pier glass, its glass gone', 0, 25, 6);
  hang('a tapestry of the masque', 1, 21, 7.2);
  put('a buffet of a feast gone cold', 25, 6.9);
  put('a harpsichord', 22.3, 11.2, 1);
  put('a viol and its stand', 24.2, 12.6);
  put('a gilt chair', 23.6, 10.3);
  put("a footman's tray", 27.4, 9.8);
  put("a footman's tray", 26.2, 12.4, 1);
  // THE CARD ROOM: the card table with the royal cards under a crystal chandelier, another overturned and its cards
  // flung; a gilt candelabrum lit at either side; a folding screen; the prince's bargain with the Order
  put('a card table with royal cards', 24.4, 18.2);
  put('a gilt chair', 23.3, 19.6);
  put('a card table with royal cards', 26.6, 20.8, 1);
  put('royal cards, scattered', 22.6, 20.8, 0, true);
  put('a crystal chandelier', 24.4, 18.2, 0, false, 24.4 + 18.2 + 0.01);
  put('a gilt candelabrum', 21.7, 15.7);
  put('a gilt candelabrum', 27.3, 16.4, 1);
  put('a folding screen of arabesques', 26.9, 15.9);
  put("the prince's bargain with the Order", 21.9, 21.2);
  // THE GALLERY: gilt candelabra down it, a chandelier, masks and the golden ornaments dropped by the dancers
  put('a gilt candelabrum', 4.2, 23.6);
  put('a gilt candelabrum', 10.6, 23.4);
  put('a crystal chandelier', 14.6, 23.2);
  put('a gilt candelabrum', 19.6, 22.2);
  put('masks dropped on the floor', 7.4, 23.4, 0, true);
  put('gilt ornaments, scattered', 16.6, 23.8, 0, true);
  put('a gilt chair', 12.2, 21.6, 1);
  // THE SERVANTS' PASSAGE: the braziers on their tripods, opposite the black room's windows
  put('a brazier on its tripod', 5.2, 19.5, 0);
  put('a brazier on its tripod', 9.0, 19.5, 2);
  return out;
}
