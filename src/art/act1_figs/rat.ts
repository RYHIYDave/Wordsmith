// ACT 2, THE HUSH: FLOOR 12: THE KING'S RATS: their pictures as the game holds a monster (art/act1_figs/types.ts), from the
// art chat's makeRatArt() (art/rats.ts, made on his word of 18 Oct, 21:24 Pacific, "Hey go without my say so ..."), as it hands
// them over: their stand (sniffing), their scurry (walk, painted for RAT_PACE), THE LEAP AND BITE (attack), struck (reel), their
// death (die: flipped onto the back, the voice puffing out of them), and LOOKING ROUND (clips.moves.look), which their effects
// play now and then from the stand (render/act1_fx/rat.ts).

import { RATS_ON, makeRatArt } from '../rats';
import type { Act1Fig } from './types';

export const FIG: Act1Fig | null = {
  make: makeRatArt,
  // (measured off its stand as the descent's are, tests/act2_rat.test.ts: the top of its back over its floor point, low and
  // swollen; half its length, nose to rump, as it is seen side on)
  size: { top: 11, half: 9 },
  switches: [RATS_ON],
};
