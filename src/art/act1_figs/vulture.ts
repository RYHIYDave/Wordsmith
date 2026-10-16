// ACT 1: THE VULTURES (FLOOR 7): its pictures as the game holds a monster (art/act1_figs/types.ts): the art chat's
// VULTURE (art/ledge_vultures.ts), each move with his yes, as shown: its stand (the hunched bird on its perch, where it
// sits until it wakes), its walk (circling flight: it is a flier, its feet off the floor all the round), its dive (its
// one attack, `attack`), its flinch (`reel`, struck in the air) and its death (`die`, knocked from the air onto its
// back). Made as art/new_mobs3.ts makes its mobs (mobSet: its pool of light and its edge as theirs), with two things
// of the art chat's notes (README, "Notes for the main chat"): its walk at its own beat, one wing beat a second, whatever
// speed the rules fly it at (a flier has no feet to slide: game/act1_rules/vulture.ts carries its clock); and its death
// at the thirty frames a second it is painted for, not the game's twenty (mkit.ts DEATH_FPS), as his rulebook's
// "attacks and moves 30" has it.

import { lazyFrames } from '../kit';
import { VULTURE, VULTURE_DEATH, VULTURE_ON, VULTURE_PACE, vultureFrame } from '../ledge_vultures';
import { mobSet } from '../new_mobs3';
import type { ActorArt, AnimSet } from '../actor_types';
import type { GameView } from '../skin';
import type { Act1Fig } from './types';

function set(view: GameView): AnimSet {
  const s = mobSet(VULTURE, view, VULTURE_PACE);
  const n = Math.round(VULTURE_DEATH.long * VULTURE_DEATH.fps) + 1;
  // (its death as the art paints it: deathOfMob, no edge and no pool of light, thirty a second)
  s.clips = { ...s.clips, die: { frames: lazyFrames(n, (i) => vultureFrame('dying', i / VULTURE_DEATH.fps, view)), fps: VULTURE_DEATH.fps } };
  return s;
}

export const FIG: Act1Fig | null = {
  make: (): ActorArt => ({ front: set('front'), back: set('back') }),
  // (measured off its standing picture as the game's figures are: tests/act1_vulture.test.ts)
  size: { top: 26, half: 14 },
  switches: [VULTURE_ON],
};
