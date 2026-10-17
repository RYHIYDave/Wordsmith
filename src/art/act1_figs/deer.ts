// ACT 1: THE TWISTED DEER (FLOOR 9): its pictures as the game holds a monster (art/act1_figs/types.ts): the art chat's
// (art/twisted_deer.ts, his yes to each), as handed over: makeDeerArt(), its stand, its limp (walk), its gore (attack),
// its rearing stomp (clips.moves.stomp), struck (reel) and its death.

import { TWISTED_DEER_ON, makeDeerArt } from '../twisted_deer';
import type { Act1Fig } from './types';

export const FIG: Act1Fig | null = {
  make: makeDeerArt,
  // (measured off its stand as tests/act1_deer.test.ts measures it, over its floor point: its back is 27 up, its head and
  // antlers stand higher before it, to 34)
  size: { top: 30, half: 15 },
  switches: [TWISTED_DEER_ON],
};
