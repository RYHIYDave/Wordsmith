// A fallen wordsmith: the body of someone who came this way before, lying on the dungeon floor.
// Two pictures of the same body: before it has been searched, and after.
//
// Like the other props it is a hand-drawn character map in palette colours with a 1 px ink
// outline, lit from the top left. It lies flat, so the canvas is wide and low (32 x 20, the art
// itself about 30 x 15) and the anchor is the middle of the patch of floor it covers. The teal
// hood, trim and book are what set it apart from the warm-grey floor and the bone litter.
//
// Not yet searched: the book is shut and a small glint sits on its corner. Searched: the book lies
// open with bare pages, there is no glint, and the teal is a step duller.

import { Px } from '../engine/px';
import type { Sprite } from '../engine/px';
import { P } from './palette';

export interface BodyArt {
  /** A fallen adventurer lying on the dungeon floor, not yet searched. */
  body: Sprite;
  /** The same, after it has been searched. */
  searched: Sprite;
}

type Key = Readonly<Record<string, string>>;

const W = 32;
const H = 20;
/** Anchor: the middle of the floor the body and its book lie on. */
const AX = 16;
const AY = 11;

/**
 * The body, face down: a big hooded head to the left (the same big-headed build as the living
 * characters), the robe with its sash and hem, two boots, and one arm reaching out past the head.
 * Canvas rows 4..12.
 */
const FALLEN: readonly string[] = [
  '........JJHHh...dddddd..........',
  '.......JJHHHHh.dccccgccdd.......',
  '......JJHHHHHhhjccccgGccccdt....',
  '......JHHHHHhhjjccccgGcccccteEe.',
  '......HHHHHhhhjjcbbbgGbbbbcteee.',
  '......hHHhhhhjjjccccgGcccbbtk...',
  '......jhhhhhjj.abbbbbbbbbbbteEe.',
  '.......jjjjjj..dcaaaaaaaaaa.eee.',
  '............ddccb...............',
];

/** The book, shut, with the reaching hand on its corner. Canvas rows 13..17. */
const BOOK_SHUT: readonly string[] = [
  '.TTTTTTT.Sstcb',
  '.TttotttTs....',
  '.TttotttT.....',
  '.ppppppppp....',
  '.uuuuuuuuu....',
];

/** The book lying open, its pages bare. Canvas rows 13..17. */
const BOOK_OPEN: readonly string[] = [
  '..PPPP.PPSstcb',
  '.pPPPPpPPPsp..',
  '.pPPPPpPPPPp..',
  '.uppppuppppu..',
  '..uuuu.uuuu...',
];

function key(searched: boolean): Key {
  return {
    // robe and sleeve
    a: P.wd1,
    b: P.wd2,
    c: P.wd3,
    d: P.wd4,
    // hood and mantle: the teal that marks a wordsmith
    j: P.tl1,
    h: searched ? P.tl1 : P.tl2,
    H: searched ? P.tl2 : P.tl3,
    J: searched ? P.tl3 : P.tl4,
    // sash, hem, cuff and the cover of the book
    g: searched ? P.tl2 : P.tl3,
    G: searched ? P.tl3 : P.tl4,
    t: searched ? P.tl2 : P.tl3,
    T: searched ? P.tl3 : P.tl4,
    u: P.tl1,
    o: P.gd3, // the book's clasp
    // boots, and the fold between the legs
    e: P.er2,
    E: P.er4,
    k: P.ink,
    // hand and pages
    s: P.sk2,
    S: P.sk3,
    p: searched ? P.bn1 : P.bn2,
    P: searched ? P.bn2 : P.bn3,
  };
}

/** Paint a hand-drawn pixel map with its top-left corner at (x, y). '.' leaves a pixel alone. */
function stamp(p: Px, x: number, y: number, rows: readonly string[], k: Key): void {
  rows.forEach((row, j) => {
    for (let i = 0; i < row.length; i++) {
      const c = k[row.charAt(i)];
      if (c !== undefined) p.set(x + i, y + j, c);
    }
  });
}

function fallen(searched: boolean): Sprite {
  const p = new Px(W, H);
  const k = key(searched);
  stamp(p, 0, 4, FALLEN, k);
  stamp(p, 0, 13, searched ? BOOK_OPEN : BOOK_SHUT, k);
  p.outline(P.ink);
  if (!searched) {
    // a small bright glint on the corner of the book: there is something here to find
    p.set(2, 13, P.white).set(1, 13, P.tl5).set(3, 13, P.tl5).set(2, 12, P.tl5).set(2, 14, P.tl5);
  }
  return p.sprite(AX, AY);
}

/** Art for the searchable body found in the dungeon. */
export function makeBodyArt(): BodyArt {
  return { body: fallen(false), searched: fallen(true) };
}
