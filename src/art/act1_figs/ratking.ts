// ACT 2, THE HUSH: FLOOR 12'S BOSS: THE RAT KING: his pictures as the game holds a monster (art/act1_figs/types.ts), the art
// chat's makeRatKingArt() (art/rat_king.ts, behind RAT_KING_ON; made on his word of 18 Oct, 21:24 Pacific, "Hey go without my
// say so ..."), as it hands them over: his stand (every rat squirming its own way), his scuttle (walk, painted for RK_PACE),
// THE BITE (attack), struck (reel), his death (die), and in clips.moves THE ROLL (curl, roll going round, uncurl), UNKNOT and
// KNOT, and STOLEN WORDS (words). His roll and his unknotting are played from those, in turn, by his effects
// (render/act1_fx/ratking.ts), as his rules carry them; what he throws, and his swarm, are the art's own painters
// (art/rat_king_shots.ts), drawn there too.

import { RAT_KING_ON, makeRatKingArt } from '../rat_king';
import type { Act1Fig } from './types';

export const FIG: Act1Fig | null = {
  make: makeRatKingArt,
  // (measured off his stand as the descent's are, tests/act2_ratking.test.ts: the top of the King on his heap over his floor
  // point, his glass crown with him; half the heap's width, near three tiles across)
  size: { top: 29, half: 36 },
  heavy: true,
  switches: [RAT_KING_ON],
};
