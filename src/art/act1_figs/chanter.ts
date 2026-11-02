// ACT 1: THE CHANTER (THE CULT, FLOORS 6 TO 10): its pictures as the game holds a monster (art/act1_figs/types.ts):
// the art chat's makeChanterArt3() (art/act1_cultists.ts, with his yes), as it hands them over, its procession at
// the pace it is painted for. Its clips: attack (the bolt of cursed words), reel, die (its book burning).

import { ACT1_CULT_ON, makeChanterArt3 } from '../act1_cultists';
import { CHANTER_LIGHTNING, makeLightningChanterArt } from '../action_f6_cult';
import type { Act1Fig } from './types';

export const FIG: Act1Fig = {
  // (and its chain lightning, behind CHANTER_LIGHTNING: art/action_f6_cult.ts, his yes, 2 Nov 2026)
  make: () => (CHANTER_LIGHTNING.on ? makeLightningChanterArt() : makeChanterArt3()),
  // (measured off its stand as the others are: tests/act1_chanter.test.ts, and tests/first5_bosses.test.ts 10)
  size: { top: 30, half: 8 },
  switches: [ACT1_CULT_ON],
};
