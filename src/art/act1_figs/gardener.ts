// ACT 2, PART TWO, THE HIGH CITY: FLOOR 16: THE HUSHED GARDENERS: their pictures as the game holds a monster
// (art/act1_figs/types.ts), the art chat's (art/palace_hands.ts, palace_hands_moves.ts; his yes, 28 Oct 2026: “Yes, they're right
// (Recommended)”), as handed over: makePalaceArt3(PALACE_GARDENER), on the heroes' bones as new_mobs3.ts builds its mobs (mobSet,
// front and back), their rush at its own pace: their stand (at his work, clipping at a hedge that is not there), the rush
// (walk), the shears snap (attack), struck (reel) and the Hush leaving them (die). Light: painted beside the game as the small
// kinds are. The grooms are a kind of their own (art/act1_figs/groom.ts), laid mixed with them (game/act1_rules/gardener.ts).

import { PALACE_HANDS_ON } from '../palace_hands';
import { PALACE_GARDENER, makePalaceArt3 } from '../palace_hands_moves';
import type { Act1Fig } from './types';

export const FIG: Act1Fig | null = {
  make: () => makePalaceArt3(PALACE_GARDENER),
  // (measured off their stand as tests/act2_palace_hands.test.ts measures it: the knight's height, the hat's brim)
  size: { top: 29, half: 9 },
  switches: [PALACE_HANDS_ON],
};
