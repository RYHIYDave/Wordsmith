// ACT 2, THE HUSH: FLOOR 15: THE BOOKWARDENS: their pictures as the game holds a monster (art/act1_figs/types.ts): the art
// chat's (art/bookwardens.ts, bookwardens_moves.ts; made on his word of 18 Oct 2026, 21:24 Pacific, "Hey go without my say
// so..."), as handed over: makeBookwardenArt3(), on the heroes' bones (mobSet, in front and from behind), its trudge at its
// own pace: its stand, its trudge (walk), the tome slam (attack), struck (reel) and its death (the chain snapping, the tome
// bursting, the haft dropped).
//
// Its switch, BOOKWARDENS_ON, is left as the art chat has it, off: nothing of the game draws them while ACT2 is off
// (game/act1.ts); it goes on with the Hush when the planning chat puts the act in.

import { makeBookwardenArt3 } from '../bookwardens_moves';
import type { Act1Fig } from './types';

export const FIG: Act1Fig | null = {
  make: () => makeBookwardenArt3(),
  // (measured off its stand as tests/act2_bookwarden.test.ts measures it)
  size: { top: 34, half: 11 },
};
