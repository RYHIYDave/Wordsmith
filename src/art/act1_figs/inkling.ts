// ACT 2, THE HUSH: FLOOR 15: THE INKLINGS: their pictures as the game holds a monster (art/act1_figs/types.ts): the art chat's
// (art/inklings.ts, inklings_moves.ts; made on his word of 18 Oct 2026, 21:24 Pacific, "Hey go without my say so..."), as
// handed over: makeInklingArt3(), on the heroes' bones (mobSet, in front and from behind), its scuttle at its own pace: its
// stand, its scuttle (walk), the ink lash (attack), struck (reel), its death (bursting, and run down to a stain), and in
// clips.moves its melt and its rise. Going about as a pool of ink, its figure is not drawn: its pool is (render/act1_fx/
// inkling.ts, the art's drawInkPool).
//
// Its switch, INKLINGS_ON, is left as the art chat has it, off: nothing of the game draws them while ACT2 is off
// (game/act1.ts); it goes on with the Hush when the planning chat puts the act in.

import { makeInklingArt3 } from '../inklings_moves';
import type { Act1Fig } from './types';

export const FIG: Act1Fig | null = {
  make: () => makeInklingArt3(),
  // (measured off its stand as tests/act2_inkling.test.ts measures it)
  size: { top: 14, half: 9 },
};
