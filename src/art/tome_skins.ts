// SKINS FOR THE WARLOCK'S BOOK (14 Nov 2026): the game's four unique tomes drawn at his hip, where his own red book hangs on its
// chain, as the Mage's unique staves are in her hand (art/staff_skins.ts) and the rest of the cast's weapons in theirs. His word,
// 14 Nov 2026, of the Mage's staves done: “then do it for the rest of the cast”; asked whether to start, his pick: “Start the rest
// of the cast (Recommended)”. PICTURES FIRST: nothing of the game draws these until he has seen them on him and said yes.
//
// His book is a skin (dev/sculpt_warlock.ts TomeAt, TomeSkin; his own PLAIN_TOME, painted exactly as before). Each of these is
// drawn to its picture in the bag (art/items_unique.ts):
//   THE LEDGER OF DEBTS: green boards, a red hide spine, a brass plate on its face, brass at its corners.
//   THE RESTLESS TOME: NOT AT HIS HIP. It leaves him and swirls round him (render/unique_fx.ts, its own picture, wherever he is):
//     its chain hangs empty from his belt, its last link broken open.
//   THE BURNING VERSE: charred black, three lines of a verse burning through its face, its pages' edge alight, fire off its head
//     (an honest fire's orange).
//   THE HORNBOOK (the levelling unique of floor 12): pale horn over its face, three lines of black letters under it, dark leather
//     at its spine, brass at its corners.
// Only the fire glows. All of it is the book's own stuff or the chain's steel (TomeSkin.extras says why).

import type { Ramp } from './kit';
import { add, mul } from './skeleton';
import { onBall } from '../dev/sculpt';
import type { Ell, Hit } from '../dev/sculpt';
import { PLAIN_TOME } from '../dev/sculpt_warlock';
import type { TomeSkin } from '../dev/sculpt_warlock';
import type { TomeId } from './heroes';

/** The game's four unique tomes (game/uniques.ts), by their ids (art/heroes.ts, where the game asks for them without the pictures). */
export type { TomeId };

/** A unique book hangs out over his coat's skirts, and bigger than his own, to be seen (his own is half under them). */
const OUT = 2.0;
const BIG = 1.35;
const sh = (r: Ramp, k: number): string => r[Math.max(0, Math.min(4, k))];
/** Where on the book's block a point is: along it (forward, the pages' edge at +1), through it (its faces at ±1), up it. */
const onBook = (h: Hit): [number, number, number] => {
  const b = onBall(h.prim as Ell, h.p);
  return [b[0], b[1], b[2]];
};
const IVORY: Ramp = ['#241c30', '#463a56', '#857894', '#cfc4dc', '#f2eefa'];
const BRASS: Ramp = ['#3a2410', '#6a4620', '#a07436', '#d0a656', '#f2d892'];
/** Its pages' edge (forward), as his own book's. */
const pages = (b: [number, number, number]): boolean => b[0] > 0.7 && Math.abs(b[2]) < 0.75;
/** Its corners. */
const corner = (b: [number, number, number]): boolean => Math.abs(b[0]) > 0.62 && Math.abs(b[2]) > 0.72;
/** Its spine (behind). */
const spine = (b: [number, number, number]): boolean => b[0] < -0.72;
/** On one of its faces. */
const face = (b: [number, number, number]): boolean => Math.abs(b[1]) > 0.55;

// ---------------------------------------------------------------------------------------------
// THE LEDGER OF DEBTS (game/uniques.ts `ledgerofdebts`)

const GREEN: Ramp = ['#08261a', '#0e4228', '#1c6c3c', '#36a058', '#7ee07a'];
const HIDE_RED: Ramp = ['#22040c', '#420a16', '#6e1420', '#a02a2c', '#c84a3e'];

export const LEDGER_TOME: TomeSkin = {
  id: 'ledgerofdebts',
  name: 'The Ledger of Debts',
  cover: GREEN,
  out: OUT,
  big: BIG,
  paint: (h) => {
    const b = onBook(h);
    if (corner(b)) return sh(BRASS, h.tone);
    if (pages(b)) return sh(IVORY, h.tone - 1);
    if (spine(b)) return sh(HIDE_RED, h.tone);
    // the brass plate on its faces, a tally scratched on it
    if (face(b) && Math.abs(b[0] + 0.05) < 0.5 && Math.abs(b[2]) < 0.55) return Math.abs(b[2] - 0.05) < 0.07 ? sh(BRASS, h.tone - 2) : sh(BRASS, h.tone);
    return null;
  },
};

// ---------------------------------------------------------------------------------------------
// THE RESTLESS TOME (game/uniques.ts `restlesstome`: “The tome leaves your hand and swirls around you.”)

export const RESTLESS_TOME: TomeSkin = {
  id: 'restlesstome',
  name: 'The Restless Tome',
  cover: PLAIN_TOME.cover,
  gone: true,
  out: OUT,
};

// ---------------------------------------------------------------------------------------------
// THE BURNING VERSE (game/uniques.ts `burningverse`: “A burn you cause on a cursed enemy never goes out.”)

const CHAR: Ramp = ['#08060a', '#151014', '#261c20', '#3c2e30', '#5e4a48'];
/** An honest fire: dark orange at its skin, yellow at its heart. */
const FIRE: Ramp = ['#b8401a', '#e8641e', '#ff9a2e', '#ffc85a', '#ffe9a6'];

export const BURNING_TOME: TomeSkin = {
  id: 'burningverse',
  name: 'The Burning Verse',
  cover: CHAR,
  out: OUT,
  big: BIG,
  paint: (h) => {
    if (h.prim.tag === 'fire') return h.tone >= 3 ? FIRE[4] : h.tone >= 2 ? FIRE[3] : FIRE[2];
    const b = onBook(h);
    // its pages' edge alight
    if (pages(b)) return h.tone >= 2 ? FIRE[3] : FIRE[1];
    // three lines of the verse, burning through its faces, the last one short
    if (face(b)) {
      for (const [z, x1] of [[0.45, 0.5], [0.02, 0.5], [-0.41, 0.1]] as const) if (Math.abs(b[2] - z) < 0.11 && b[0] > -0.52 && b[0] < x1) return h.tone >= 2 ? FIRE[4] : FIRE[2];
    }
    return null;
  },
  extras(sc, at, { book }) {
    // fire off its head: three tongues licking up from its top edge
    const top = add(at.hipR, mul(at.u, 3.0 * at.k));
    [[-1.4, 2.4], [0.2, 3.4], [1.6, 2.2]].forEach(([x, tall]) => {
      const a = add(top, mul(at.f, x * at.k));
      const m = add(a, add(mul(at.u, tall * 0.55), mul(at.f, 0.25)));
      const tip = add(a, add(mul(at.u, tall), mul(at.f, -0.2)));
      sc.cone(book, 'book', a, m, 0.85, 0.6, 0.3, { tag: 'fire' });
      sc.cone(book, 'book', m, tip, 0.6, 0.1, 0.3, { tag: 'fire' });
    });
  },
};

// ---------------------------------------------------------------------------------------------
// THE HORNBOOK (game/uniques.ts `hornbook`, the levelling unique of floor 12)

const HORN: Ramp = ['#3a2e1c', '#6a5432', '#a08454', '#d0b680', '#f4e6bc'];
const DARK_LEATHER: Ramp = ['#0e0a0c', '#1c1416', '#2e2222', '#443432', '#5e4a44'];

export const HORNBOOK_TOME: TomeSkin = {
  id: 'hornbook',
  name: 'The Hornbook',
  cover: HORN,
  out: OUT,
  big: BIG,
  paint: (h) => {
    const b = onBook(h);
    if (corner(b)) return sh(BRASS, h.tone);
    if (pages(b)) return sh(IVORY, h.tone - 1);
    if (spine(b)) return sh(DARK_LEATHER, h.tone);
    // three lines of black letters under the horn
    if (face(b)) for (const z of [0.42, 0.02, -0.38]) if (Math.abs(b[2] - z) < 0.09 && Math.abs(b[0] + 0.05) < 0.45) return sh(DARK_LEATHER, h.tone - 1);
    return null;
  },
};

/** THE FOUR, by their ids. */
export const TOME_SKIN_OF: Record<TomeId, TomeSkin> = {
  ledgerofdebts: LEDGER_TOME,
  restlesstome: RESTLESS_TOME,
  burningverse: BURNING_TOME,
  hornbook: HORNBOOK_TOME,
};
/** His own first, then the four, in the order they are shown. */
export const TOME_SKIN_LIST: TomeSkin[] = [PLAIN_TOME, LEDGER_TOME, RESTLESS_TOME, BURNING_TOME, HORNBOOK_TOME];
