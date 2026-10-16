// ACT 1: THE QUARRY GOLEM (FLOOR 6): its pictures as the game holds a monster (art/act1_figs/types.ts). The art
// chat's QUARRY_GOLEM (art/floor6_mobs.ts, with his yes), a Mob on the heroes' bones handed over as one, so held as
// art/new_mobs3.ts holds its own mobs: `mobSet` for in front and from behind, its walk at the pace it is painted
// for. Its clips: attack (the hammer), reel, die (bursting apart), and its moves setOff, halt and throw.

import { FLOOR6_MOBS_ON, QG_PACE, QUARRY_GOLEM } from '../floor6_mobs';
import { mobSet } from '../new_mobs3';
import type { Act1Fig } from './types';

export const FIG: Act1Fig = {
  make: () => ({ front: mobSet(QUARRY_GOLEM, 'front', QG_PACE), back: mobSet(QUARRY_GOLEM, 'back', QG_PACE) }),
  // (measured off its stand as the others are: tests/act1_qgolem.test.ts, and tests/first5_bosses.test.ts 10)
  size: { top: 38, half: 20 },
  switches: [FLOOR6_MOBS_ON],
};
