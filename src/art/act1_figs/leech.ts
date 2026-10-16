// ACT 1: THE BOG LEECHES (FLOOR 10): its pictures as the game holds a monster (art/act1_figs/types.ts): the art
// chat's (art/bog_leech.ts, his yes to each), as handed over: makeLeechArt(), its stand, its slither (walk), its leap
// and latch (attack), struck (reel) and its burst (die).

import { LEECH_ON, makeLeechArt } from '../bog_leech';
import type { Act1Fig } from './types';

export const FIG: Act1Fig | null = {
  make: makeLeechArt,
  // (measured off its stand as tests/act1_leech.test.ts measures it)
  size: { top: 7, half: 9 },
  switches: [LEECH_ON],
};
