// ACT 2, THE HUSH: FLOOR 12: THE ORDER'S DREDGERS: their pictures as the game holds a monster (art/act1_figs/types.ts), from the
// art chat's makeDredgerArt3() (art/dredgers_moves.ts, on the heroes' bones as art/new_mobs3.ts builds its mobs: mobSet, front
// and back; made on his word of 18 Oct, 21:24 Pacific, "Hey go without my say so ..."), as it hands them over, their wade at the
// pace it is painted for (DR_PACE): their stand (leaning on the boathook, listening), their wade (walk), THE HOOK AND HAUL
// (attack), struck (reel), and THE JARS BURST (die).

import { DREDGERS_ON } from '../dredgers';
import { makeDredgerArt3 } from '../dredgers_moves';
import type { Act1Fig } from './types';

export const FIG: Act1Fig | null = {
  make: () => makeDredgerArt3(),
  // (measured off their stand as the descent's are, tests/act2_dredger.test.ts: the top of the hood over their floor point, the
  // boathook's head standing higher beside it; half their width at the body, in the oilskin and the creel)
  size: { top: 31, half: 9 },
  switches: [DREDGERS_ON],
};
