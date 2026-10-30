// ACT 2, PART TWO, THE HIGH CITY: FLOOR 16: THE HUSHED GROOMS: what they do to the floor, drawn (render/act1_fx/types.ts). The fork
// drawn back and glinting, the jab and the Hush leaving them are all in their own pictures (art/palace_hands_moves.ts). Only THE
// FORK'S WARNING is drawn here: through the wind-up, the long strip it will be jabbed along (game/act1_rules/gardener.ts
// JAB_STRIP) marked on the floor in the enemy's pink, as the gardeners' (render/act1_fx/gardener.ts palaceWarn).

import { JAB_STRIP } from '../../game/act1_rules/gardener';
import { palaceWarn } from './gardener';
import type { Act1Fx } from './types';

export const FX: Act1Fx | null = {
  ground(c, m) {
    palaceWarn(c, m, 'groom:jab', JAB_STRIP);
  },
};
