// ACT 2, THE HUSH: FLOOR 14: THE ORDERLIES: their pictures as the game holds a monster (art/act1_figs/types.ts), from the art chat's
// (art/orderlies.ts, orderlies_moves.ts, orderly_shots.ts): makeOrderlyArt3(), on the heroes' bones (mobSet, from in front and
// from behind, its trudge at its own pace): their stand, their trudge (walk), the mallet blow (attack), struck (reel) and their
// death, a felled tree (die).

import { ORDERLIES_ON } from '../orderlies';
import { makeOrderlyArt3 } from '../orderlies_moves';
import type { Act1Fig } from './types';

export const FIG: Act1Fig | null = {
  make: () => makeOrderlyArt3(),
  // (measured off their stand as tests/act2_orderly.test.ts measures it: the top of the cap over the floor point, half their width at the body)
  size: { top: 32, half: 12 },
  switches: [ORDERLIES_ON],
};
