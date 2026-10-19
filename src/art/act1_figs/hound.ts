// ACT 2, THE HUSH: FLOOR 11 (and the city's own): THE MUTE WATCH HOUNDS: its pictures as the game holds a monster
// (art/act1_figs/types.ts): the art chat's (art/hounds.ts, made on his word of 18 Oct, 21:24 Pacific), as handed over:
// makeHoundArt(), painted from their own solids as Act 1's deer and wolves are: their stand (restless, panting under the
// gag), their lope (walk), the pounce (attack), struck (reel), and the gag off, the silent howl, down on their side (die).

import { HOUNDS_ON, makeHoundArt } from '../hounds';
import type { Act1Fig } from './types';

export const FIG: Act1Fig | null = {
  make: makeHoundArt,
  // (measured off its stand as tests/act2_hound.test.ts measures it: its back at the knight's hip)
  size: { top: 16, half: 12 },
  switches: [HOUNDS_ON],
};
