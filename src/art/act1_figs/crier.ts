// ACT 2, THE HUSH: FLOOR 11'S BOSS, THE CRIER: his pictures as the game holds a monster (art/act1_figs/types.ts). The art
// chat's (art/crier.ts, his look; art/crier_moves.ts, his moves: his look and every move with his own yes to pictures and
// films, 18 Oct: docs/mockups/act2_gateward/README.md), through the maker it hands over, makeCrierArt(), as art/new_mobs3.ts holds
// its mobs on the heroes' bones (`mobSet`, from in front and from behind, his march at the pace it is painted for,
// CR_PACE): stand (pleased with himself), walk (his march), attack (the swing of the trumpet), reel, die (the Hush pouring
// out of him), and in clips.moves his setting off and stopping, the Silent Shout, the Proclamation and the Crowd. What each
// does to the floor is drawn by render/act1_fx/crier.ts (the art chat's art/crier_shots.ts).
//
// HIS SWITCH (art/crier.ts CRIER) is not held here: art/bestiary.ts useAct1Figs throws every figure's switch with the
// descent's (ACT1, on), and he is the Hush's, behind ACT2 (off). It gates nothing of the game; the planning chat throws it
// with the act.

import { makeCrierArt } from '../crier_moves';
import type { Act1Fig } from './types';

export const FIG: Act1Fig | null = {
  make: () => makeCrierArt(),
  // (measured off his stand as tests/act2_crier.test.ts measures it: the top of his tricorn over his floor point, his plume
  // and his trumpet's bell beside it; half his width at the body, his belly and his coat)
  size: { top: 54, half: 16 },
  heavy: true,
};
