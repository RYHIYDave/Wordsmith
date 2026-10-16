// ACT 1: THE FIREPOT THROWER (THE CULT, FLOORS 6 TO 10): its pictures as the game holds a monster
// (art/act1_figs/types.ts): the art chat's makeFirepotThrowerArt3() (art/act1_cultists.ts, with his yes), as it
// hands them over, its trudge at the pace it is painted for. Its clips: attack (the lob), reel, die (its own pots
// going off).

import { ACT1_CULT_ON, makeFirepotThrowerArt3 } from '../act1_cultists';
import type { Act1Fig } from './types';

export const FIG: Act1Fig = {
  make: () => makeFirepotThrowerArt3(),
  // (measured off its stand as the others are: tests/act1_firepot.test.ts, and tests/first5_bosses.test.ts 10)
  size: { top: 30, half: 8 },
  switches: [ACT1_CULT_ON],
};
