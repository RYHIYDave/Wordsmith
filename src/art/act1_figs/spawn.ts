// ACT 1: THE EYESPAWN (FLOOR 10): its pictures as the game holds a monster (art/act1_figs/types.ts): the art chat's
// (art/eyespawn.ts, his yes to each), as handed over: makeEyespawnArt(), its stand, its haul (walk), its lash (attack),
// its gaze beam (clips.moves.gaze), hatching (clips.moves.hatch), struck (reel) and its death.

import { SPAWN_ON, makeEyespawnArt } from '../eyespawn';
import type { Act1Fig } from './types';

export const FIG: Act1Fig | null = {
  make: makeEyespawnArt,
  // (measured off its stand as tests/act1_spawn.test.ts measures it)
  size: { top: 33, half: 15 },
  switches: [SPAWN_ON],
};
