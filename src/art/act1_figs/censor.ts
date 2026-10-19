// ACT 2, THE HUSH: FLOOR 15'S BOSS, THE LAIR'S: THE CENSOR: his pictures as the game holds a monster (art/act1_figs/types.ts):
// the art chat's (art/censor.ts, censor_moves.ts; made on his word of 18 Oct 2026, 21:24 Pacific, "Hey go without my say
// so..."), as handed over: makeCensorArt(), on the heroes' bones (mobSet, in front and from behind), his walk at its own pace:
// his stand, his walk, the brush slash (attack), struck (reel), his death (the brush falling, the mask cracking and its halves
// falling away, the words of the city bursting out of him), and in clips.moves Redaction (redact, which the blacking out of
// the floor at half his life plays too), Strike-Through (strike) and the Hush (hush). What he lays on the floor is drawn by
// render/act1_fx/censor.ts (the art's censor_shots.ts).
//
// HEAVY: a boss, on a canvas of 640 by 520 of the art's pixels (CE_CANVAS): painted for floor 15 by the painter (render/
// painter.ts), beside the game, and let go of after (art/bestiary.ts HEAVY_FIGURES). What his frames take: CENSOR_COST.
//
// His switch, CENSOR_ON, is left as the art chat has it, off: nothing of the game draws him while ACT2 is off (game/act1.ts);
// it goes on with the Hush when the planning chat puts the act in.

import { makeCensorArt } from '../censor_moves';
import type { Act1Fig } from './types';

/** What his frames take, as measured (19 Oct 2026: every frame of both his views painted once, under the tests' paintWithoutCanvas, on this container's two shared cores): frames, megabytes held (four bytes a pixel, at the art's grain), seconds of painting. A tenth of what each of the descent's three big bosses holds (about 300 MB: docs/act1_build.md). */
export const CENSOR_COST = { frames: 816, mb: 25.9, seconds: 33 };

export const FIG: Act1Fig | null = {
  make: () => makeCensorArt(),
  // (measured off his stand as tests/act2_censor.test.ts measures it)
  size: { top: 45, half: 12 },
  heavy: true,
};
