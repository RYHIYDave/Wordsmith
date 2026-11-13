// ONE-HANDED SWORDS AS THEY WERE (game/defs.ts ONE_HAND_SWORDS, off since 12 Nov 2026 at his word: “we dont need one handed
// swords yet.  so those can stay out of the game for now until we add the gladiator”): for the tests of the game's own ways
// (the shelves, the stranger's gamble, the drops) that were written with the plain sword among the things to be had. With the
// switch off, none is found, sold or gambled for; that is held by tests/warrior_uniques_drop.test.ts. Called at the top of such
// a test file (each file is run alone). In a file of its own, not in helpers.ts, so that it does not pull every test into a
// --changed run (his rule of 7 Nov 2026).
import { ONE_HAND_SWORDS } from '../src/game/defs';

export function swordsAsBefore(): void {
  ONE_HAND_SWORDS.on = true;
}
