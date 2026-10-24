// ACT 1: THE DROWNED EYE, THE ACT'S BOSS (FLOOR 10): his pictures as the game holds a monster (art/act1_figs/types.ts).
//
// The art chat's, every one with his yes (art/drowned_eye.ts behind EYE_ON; docs/mockups/act1_fen/README.md), used as
// they are painted: eyeFrame(which, t, view, aim, clock, phase3), each from in front (he faces the camera always), from
// the first moment of his stand (`clock` 0: game/act1_rules/eye.ts begins each move of his as his stand comes round to
// its start), at the rates and for the aims the rules' EYE_MOVES say (15 frames a second, his stand's own, or 10; the
// art's moves are painted for 30). His stand risen is `idle` (and `walk`: he never walks); the rest are moves by name:
//   lurk                his lurk under the water (phase 1)
//   sweepUnder@aim      his sweep from under the water, aimed 0, 120 and -120
//   surface             his surfacing (phase 1 to 2)
//   spew                his eyespawn spewed out, toward the camera
//   splash              his splash
//   empower             the siege pulled into him (phase 2 to 3)
//   stand3              his stand, blazing (phase 3)
//   call                his call, blazing (the siege's bolts are laid by the game)
//   die                 his death, blazing (the dome shatters, he sinks: nothing of him left)
// and, held with his so that they are painted ahead with him, three pictures of their own the game lays on the floor:
//   burst               an arm bursting up from glowing cracks (EYE_BURST, at its own 30 a second)
//   bolt                one of the siege's bolts (EYE_BOLT, at 30)
//   egg                 one of his eggs, landed, until it hatches (EYE_SPAWN, at 15)
//
// WHAT THEY COST (src/dev/measure_eye.ts, this container's Chromium, 16 Oct): EYE_COST below. A frame of him takes a
// fifth to two thirds of a second to paint (measured alone: stand 0.25, lurk 0.48, sweep from under 0.28, spew 0.70,
// splash 0.54, death 0.71), and up to a megabyte to hold once risen; a frame of a boss of floors 2 to 5 takes about a
// fiftieth of a second and a twentieth of a megabyte (docs/first5_build.md). Heavy: painted for floor 10 by the painter
// (render/painter.ts), beside the game, and let go of after. Held whole (MB): his stand 28.2, lurk 5.7, stand blazing
// 41.5; his sweep from under, three aims, 20.5; his surfacing 17.5; his spew 31.5; his splash 52.7; the siege pulled in
// 36.3; his call 37.8; his death 40.9; his arms bursting up 2.3, the siege's bolts 5.1, his eggs 0.4.

import type { ActorArt, AnimSet, Clip } from '../actor_types';
import { EYE_BOLT, EYE_BURST, EYE_ON, EYE_SPAWN, boltFrame, burstFrame, eyeFrame, spawnFrame } from '../drowned_eye';
import { lazyFrames } from '../kit';
import { EYE_MOVES, EYE_STAND, eyeClip } from '../../game/act1_rules/eye';
import type { EyeMove } from '../../game/act1_rules/eye';
import type { Act1Fig } from './types';

/**
 * What his pictures cost as measured (16 Oct, src/dev/measure_eye.ts, every list painted once): frames, seconds of
 * painting, megabytes held. (The seconds with this container's two cores shared with others' work, as they were: alone,
 * each frame took a third as long or less.)
 */
export const EYE_COST = { frames: 676, seconds: 799, mb: 320.4 };

/** One of his moves, aimed `aim`, as the game holds it. */
function clipOf(move: EyeMove, aim: number): Clip {
  const M = EYE_MOVES[move];
  const n = Math.ceil(M.long * M.fps - 1e-6);
  return { frames: lazyFrames(n, (i) => eyeFrame(M.which, i / M.fps, 'front', aim, 0, M.p3)), fps: M.fps };
}

/** THE DROWNED EYE, as the game holds a monster: from in front both ways round (he never turns his back). */
export function makeEyeArt(): ActorArt {
  const stand = lazyFrames(EYE_STAND.frames, (i) => eyeFrame('stand', i / EYE_STAND.fps, 'front', 0, 0, 0));
  const moves: Record<string, Clip> = {};
  // (in the order the fight wants them: the painter paints them in this order)
  moves.burst = { frames: lazyFrames(Math.round(EYE_BURST.long * EYE_BURST.fps), (i) => burstFrame(i / EYE_BURST.fps, 'front', 0)), fps: EYE_BURST.fps };
  const order: EyeMove[] = ['lurk', 'sweepUnder', 'surface', 'spew', 'splash', 'empower', 'stand3', 'call'];
  for (const mv of order) {
    for (const aim of EYE_MOVES[mv].aims) moves[eyeClip(mv, aim)] = clipOf(mv, aim);
    if (mv === 'surface') moves.egg = { frames: lazyFrames(Math.round(EYE_SPAWN.long * EYE_SPAWN.fps), (i) => spawnFrame(i / EYE_SPAWN.fps, 'front', 0)), fps: EYE_SPAWN.fps };
    if (mv === 'stand3') moves.bolt = { frames: lazyFrames(Math.round(EYE_BOLT.long * EYE_BOLT.fps), (i) => boltFrame(i / EYE_BOLT.fps, 'front', 0)), fps: EYE_BOLT.fps };
  }
  const set: AnimSet = { idle: stand, walk: stand, attack: [], idleFps: EYE_STAND.fps, walkFps: EYE_STAND.fps, clips: { moves, die: clipOf('death', 0) } };
  // (painted coarse first: art/bestiary.ts paintOrder; the game shows the nearest frame painted, render/act1_fx/eye.ts)
  return { front: set, back: set, coarse: true };
}

export const FIG: Act1Fig = {
  make: makeEyeArt,
  // (his stand risen, from in front: the top of his eye's hood over his middle, and half his bulk's width, game pixels)
  size: { top: 135, half: 58 },
  heavy: true,
  switches: [EYE_ON],
};
