// ACT 2, PART TWO, THE HIGH CITY: FLOOR 16: THE HUSHED GROOMS: their pictures as the game holds a monster (art/act1_figs/types.ts),
// the art chat's (art/palace_hands.ts, palace_hands_moves.ts; his yes with the gardeners'), as handed over:
// makePalaceArt3(PALACE_GROOM), on the heroes' bones (mobSet, front and back), their rush at its own pace: their stand (leaning on
// his fork stood at his side), the rush (walk), the fork jab (attack), struck (reel) and the Hush leaving them, the fork
// dropping clear (die). Light: painted beside the game as the small kinds are.

import { PALACE_HANDS_ON } from '../palace_hands';
import { PALACE_GROOM, makePalaceArt3 } from '../palace_hands_moves';
import type { Act1Fig } from './types';

export const FIG: Act1Fig | null = {
  make: () => makePalaceArt3(PALACE_GROOM),
  // (measured off their stand as tests/act2_palace_hands.test.ts measures it: the knight's height, the fork stood beside him)
  size: { top: 28, half: 9 },
  switches: [PALACE_HANDS_ON],
};
