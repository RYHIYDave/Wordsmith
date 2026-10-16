// ACT 1: THE HOLLOW STAG, FLOOR 9'S BOSS: its pictures as the game holds a monster (art/act1_figs/types.ts). The
// art chat's (art/hollow_stag.ts, all of it with his yes as shown, 15 Oct by 13:13), through the maker it hands
// over, makeStagArt(): stand, walk (its stotting, painted for STAG_PACE), attack (the antler gore), reel, die (roots
// drag it down into the ground), and in clips.moves its charge, its roots and its bellow. (Its roots worming through
// the ground are a painter of their own, laid along their lines by render/act1_fx/stag.ts.)

import { STAG_ON, makeStagArt } from '../hollow_stag';
import type { Act1Fig } from './types';

export const FIG: Act1Fig | null = {
  make: makeStagArt,
  // (measured off its stand as tests/act1_stag.test.ts measures it: the top of it over its floor point; half its width at the body)
  size: { top: 52, half: 24 },
  heavy: true,
  switches: [STAG_ON],
};
