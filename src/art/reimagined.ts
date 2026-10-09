// THE HEROES REIMAGINED: NEW OUTFITS OVER THE SAME BONES AND MOVES (the art chat, 9 Oct 2026; NOT
// IN THE GAME). The art rulebook, Heroes 4: "Every move is made on the hero's skeleton, apart from
// what they wear, so a skin is a new outfit over the same bones and moves. A skin keeps the hero
// known at a glance and keeps the friend's cyan." The owner asked for "a reimagined ranger skin",
// as pictures for him to judge (previews/reimagined/: src/dev/preview_reimagined.ts and
// src/dev/preview_reimagined_gif.ts make them).
//
// PICTURES FIRST: each hero's new outfit is painted only while its switch here is on, and every
// switch is OFF. Off, the game is exactly as it was (tests/reimagined.test.ts holds it, frame for
// frame). The ranger's is "THE WIND-RUNNER" (art/hero3_ranger2.ts), the knight's "THE BOAR KNIGHT"
// (art/hero3_knight2.ts), the mage's "THE STORM-WITCH" (art/hero3_mage2.ts).

import type { TailDef } from '../engine/tails';
import { CYAN, LEAF, PINK } from './kit';
import type { Ramp } from './kit';

/** Which heroes wear their reimagined outfit. ALL OFF until the owner has seen it and said yes. */
export const REIMAGINED = { ranger: false, knight: false, mage: false };

/**
 * What flies from the Wind-runner (art/hero3_ranger2.ts), moved and drawn every frame of the game
 * as the first ranger's feather is (engine/tails.ts): no frame names them while his switch is off.
 *   - THE LIRIPIPE: the long tail of his hood, a narrow tube of its own bright green, about half
 *     his height long, from the crown of the hood, tapering to a narrow tip. Cloth: it has no shape
 *     of its own; it streams back in the standing wind, trails behind him when he runs and swings on
 *     when he stops, and an S-wave runs down it (engine/tails.ts, `wave` and `across`). The one
 *     thing to know him by.
 *   - THE FEATHER from his first cap, long and glowing cyan, its quill tucked into the side of the
 *     hood: it sweeps back from there rather than standing up, as a quill under a band of cloth
 *     does.
 */
export const RANGER2_TAILS: Record<string, TailDef> = {
  // (it tapers from the width of the hood's point to a narrow tip, and an S-wave runs down it with the wind and his motion: cloth, not a rod)
  'r2-liripipe': { n: 10, seg: 1.5, w0: 5.2, w1: 1.2, dark: LEAF[1], mid: LEAF[2], light: LEAF[3], gravity: 150, wind: 240, flutter: 260, rate: 1.5, drag: 5, wave: 8.8, across: true },
  'r2-feather': {
    n: 8, seg: 1.95, w0: 2.2, w1: 1.4, belly: 2.2, dark: CYAN[1], mid: CYAN[2], light: CYAN[3],
    rest: [[-0.3, -1], [-0.45, -1], [-0.6, -0.85], [-0.75, -0.7], [-0.9, -0.45], [-1, -0.2], [-1, 0.05], [-0.95, 0.3]],
    stiff: 1, gravity: 40, wind: 90, flutter: 70, rate: 1.9, drag: 9,
    glow: { color: CYAN[3], r: 6, a: 0.4, at: 0.55 },
  },
};

// (The Boar Knight, art/hero3_knight2.ts, has nothing that the game moves apart from him: his cloak
// is painted in the frames, left behind as he moves and streaming out as he runs, its hem cut into
// short jagged points. Long strips torn from it, and then short tatters, were tried, flying from
// its hem: they read as legs and as claws.)

/** The Storm-witch's coat (art/hero3_mage2.ts): a deep violet; its lining a lighter purple. */
const COAT2: Ramp = ['#1e1040', '#1e1040', '#462a8a', '#6c4cbc', '#6c4cbc'];
const LINING2: Ramp = ['#4a2a7a', '#4a2a7a', '#7a52b8', '#a682e0', '#a682e0'];
/**
 * What flies from the Storm-witch (art/hero3_mage2.ts): HER PINK BRAIDS, longer than the battle
 * mage's and freer, so that they fly with her; and THE POINTS OF HER TWO COAT-TAILS, cloth, as wide
 * as each tail where they leave its hem and coming to a point, drawn behind her (they hang from under
 * the hem); seen from in front, it is their lining that shows (engine/tails.ts, `inside`). (The
 * coat-tails themselves are painted in the frames, behind her and round her legs.) No frame names
 * them while her switch is off.
 */
export const MAGE2_TAILS: Record<string, TailDef> = {
  'm2-braid-a': { n: 7, seg: 1.15, w0: 3.2, w1: 2.4, dark: PINK[0], mid: PINK[2], light: PINK[3], tip: CYAN[2], rest: [[0, 1], [0, 1], [0, 1], [0, 1], [0, 1], [0, 1], [0, 1]], stiff: 0.05, gravity: 260, wind: 60, flutter: 60, rate: 1.1, drag: 5 },
  'm2-braid-b': { n: 7, seg: 1.15, w0: 3.2, w1: 2.4, dark: '#520a3c', mid: PINK[0], light: PINK[2], tip: CYAN[2], rest: [[0, 1], [0, 1], [0, 1], [0, 1], [0, 1], [0, 1], [0, 1]], stiff: 0.05, gravity: 260, wind: 60, flutter: 60, rate: 1.1, drag: 5 },
  // (long, from the back of her coat's skirt to her ankles, broad at the top and coming to a point; seen from in front, it is their lining that shows)
  'm2-coat-a': { n: 3, seg: 1.3, w0: 8, w1: 2.6, dark: COAT2[1], mid: COAT2[2], light: COAT2[3], inside: { dark: LINING2[1], mid: LINING2[2], light: LINING2[3] }, gravity: 240, wind: 70, flutter: 120, rate: 1.5, drag: 4, wave: 5, across: true },
  'm2-coat-b': { n: 3, seg: 1.3, w0: 8, w1: 2.6, dark: COAT2[1], mid: COAT2[2], light: COAT2[3], inside: { dark: LINING2[1], mid: LINING2[2], light: LINING2[3] }, gravity: 240, wind: 70, flutter: 120, rate: 1.25, drag: 4, wave: 5, across: true },
};
