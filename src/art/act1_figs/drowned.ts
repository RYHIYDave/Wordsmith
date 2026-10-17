// ACT 1: THE DROWNED (FLOOR 10): its pictures as the game holds a monster (art/act1_figs/types.ts): the art chat's
// (art/drowned.ts, his yes to each), as handed over: makeDrownedArt3(), built on the bones as new_mobs3.ts builds its
// mobs (mobSet, front and back), its walk at its own pace: its stand, its shamble (walk), its grab (attack), rising out
// of the water (clips.moves.rise), struck (reel) and its death.

import { DROWNED_ON, makeDrownedArt3 } from '../drowned';
import type { Act1Fig } from './types';

export const FIG: Act1Fig | null = {
  make: () => makeDrownedArt3(),
  // (measured off its stand as tests/act1_drowned.test.ts measures it)
  size: { top: 28, half: 9 },
  switches: [DROWNED_ON],
};
