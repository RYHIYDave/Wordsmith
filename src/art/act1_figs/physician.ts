// ACT 2, THE HUSH: FLOOR 14'S BOSS: THE PHYSICIAN: his pictures as the game holds a monster (art/act1_figs/types.ts), from the art chat's
// (art/physician.ts, physician_moves.ts, physician_shots.ts): makePhysicianArt(), on the heroes' bones (mobSet, from in front and
// from behind, his stalking stride at its own pace): his stand over his cane, his walk, the rap of his cane (attack), struck
// (reel), his death (die), and in clips.moves the Draw (`draw`), Tonic (`tonic`) and Rounds (`rounds`).
//
// HEAVY, as a boss is: made for his floor, let go of after (art/bestiary.ts HEAVY_FIGURES). His frames are a tall thin man's,
// not a giant's: about 760 of them both ways round, about 17 MB painted (measured off his paintings, every eighth frame of
// every clip, both ways: the descent's three big bosses held about 300 MB each).

import { PHYSICIAN_ON } from '../physician';
import { makePhysicianArt } from '../physician_moves';
import type { Act1Fig } from './types';

export const FIG: Act1Fig | null = {
  make: () => makePhysicianArt(),
  // (measured off his stand as tests/act2_physician.test.ts measures it: the top of his hat over his floor point, half his width at the body)
  size: { top: 35, half: 12 },
  heavy: true,
  switches: [PHYSICIAN_ON],
};
