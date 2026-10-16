// ACT 1: THE DUST DEVILS (FLOOR 8): its pictures as the game holds a monster (art/act1_figs/types.ts): the art chat's,
// through its own maker, makeDevilArt() (art/dust_devils.ts), each move with his yes, as shown: its stand (never still),
// its weave (`walk`, its dust trail painted for DD_PACE, 2.4 tiles a second), its lash (`attack`), its stutter when struck
// (`reel`) and its death (`die`: the wind dies, its bell drops and cracks; thirty a second as it is painted).

import { DEVIL_ON, makeDevilArt } from '../dust_devils';
import type { Act1Fig } from './types';

export const FIG: Act1Fig | null = {
  make: makeDevilArt,
  // (measured off its standing picture: the top of its funnel; half its funnel)
  size: { top: 16, half: 6 },
  switches: [DEVIL_ON],
};
