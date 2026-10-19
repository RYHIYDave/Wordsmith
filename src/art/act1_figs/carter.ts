// ACT 2, THE HUSH: FLOOR 13: THE SILENT ORDER'S CARTERS: their pictures as the game holds a monster (art/act1_figs/types.ts), the
// art chat's (art/carters.ts, carters_moves.ts; made on his word of 18 Oct, 21:24 Pacific, for floors 11 to 15), as handed
// over: makeCarterArt3(), on the heroes' bones as new_mobs3.ts builds its mobs (mobSet, front and back), its trudge at its
// own pace: their stand (planted, the masked head turning, the lash trailing), their trudge (walk), the whip crack
// (attack), struck (reel) and their death, over onto their back (die).

import { CARTERS_ON } from '../carters';
import { makeCarterArt3 } from '../carters_moves';
import type { Act1Fig } from './types';

export const FIG: Act1Fig | null = {
  make: () => makeCarterArt3(),
  // (measured off their stand as tests/act2_carter.test.ts measures it: the crown of the broad black hat, a little over the
  // knight's head, 33 game pixels; half their width at the body, broad in the cape and the long coat, their picture reaching
  // 29 to either side with the lash trailing behind)
  size: { top: 33, half: 12 },
  switches: [CARTERS_ON],
};
