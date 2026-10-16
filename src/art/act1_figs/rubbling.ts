// ACT 1: THE RUBBLINGS (FLOOR 6): their pictures as the game holds a monster (art/act1_figs/types.ts): the art
// chat's makeRubblingArt() (art/floor6_mobs.ts, with his yes), as it hands them over. Its clips: attack (the bite),
// reel, die (popping into grit), and its move emerge (climbing up out of a pile of chips).

import { FLOOR6_MOBS_ON, makeRubblingArt } from '../floor6_mobs';
import type { Act1Fig } from './types';

export const FIG: Act1Fig = {
  make: makeRubblingArt,
  // (measured off its stand as the others are: tests/act1_rubbling.test.ts, and tests/first5_bosses.test.ts 10)
  size: { top: 12, half: 8 },
  switches: [FLOOR6_MOBS_ON],
};
