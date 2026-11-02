// FLOORS 9 AND 10'S MOBS' NEW MOVES AS THE REVIEWS SEE THEM (docs/mockups/action_f9): the Drowned for the bosses' review
// (art/boss_checks.ts checkBoss: its shape the game's own, tests/drowned_shape.ts, with its new strikes, smears and the end each strikes
// with); the twisted deer and the fog wolf, which are not on the heroes' bones, for the review of the old rigs (art/action_f1_checks.ts
// checkKit: their points, their soles, the end they strike with, frame by frame, in game pixels, both ways round, and where the game
// has carried them over the floor). Here and not in the art files: the game's own tests keep figures from importing the checks.

import type { BossShape, Handover } from '../src/art/boss_checks';
import type { KitFrame, KitMove } from '../src/art/action_f1_checks';
import type { V } from '../src/art/kit';
import { TILE3 } from '../src/art/new_mobs3';
import { CHARGE, CHARGE_CARRIED, CHARGE_HIT, CHARGE_SMEARED, CHARGE_STRIKE, GORE9, GORE_HIT, GORE_SMEARED, GORE_STRIKE, LEAP, LEAP_CARRIED, LEAP_HIT, LEAP_SMEARED, LEAP_STRIKE, antlerTip, chargeCarry, chargePose, gore9Pose, jawsOf, leapCarry, leapPose } from '../src/art/action_f9_pinewood';
import { GRAB_SMEARED, GRAB_STRIKE, RETCH_SMEARED, RETCH_STRIKE, mouthOf } from '../src/art/action_f9_fen';
import { DEER_STAND, headFrame as dHead, poseOf as deerPose, worldOf as dWorld } from '../src/art/twisted_deer';
import { WOLF_STAND, basePose as wolfBase, headFrame as wHead, legOf, worldOf as wWorld } from '../src/art/fog_wolves';
import { stage } from '../src/art/skin';
import type { GameView } from '../src/art/skin';
import { lerp3 } from '../src/art/skeleton';
import type { V3 } from '../src/art/skeleton';
import { drownedShape } from './drowned_shape';

export function frostDrownedShape(): BossShape {
  const d = drownedShape();
  const turns = (m: string): Handover[] => [{ from: 'stand', at: 0, to: m, toAt: 0 }, { from: m, at: 'end', to: 'stand', toAt: 0 }];
  return {
    ...d,
    tip: (move, _t, s) => (move === 'attack' ? lerp3(s.handL, s.handR, 0.5) : move === 'retch' ? mouthOf(s) : null),
    strikes: { attack: GRAB_STRIKE, retch: RETCH_STRIKE },
    smeared: (move, t) => (move === 'attack' && GRAB_SMEARED(t)) || (move === 'retch' && RETCH_SMEARED(t)),
    handovers: [...(d.handovers ?? []), ...turns('retch')],
  };
}

/** A point of the figure's space where it is seen, in game pixels from where it set off (across, down), the game having carried it `c` tiles the way it faces. */
function seenAt(view: GameView): (p: V3, c?: number) => V {
  const st = stage(view, 0, 0, { w: 8, h: 8 });
  return (p, c = 0) => {
    const [x, y] = st.at([p[0] + c * TILE3, p[1], p[2]]);
    return [x / 2, y / 2];
  };
}
/** The deer: its head, its withers and its hips followed; between its antlers' tips the end it strikes with; a pair of its four feet as its soles (`pair` 0: its forefeet; 1: its hind feet), down where they stand on the floor. */
export function deerKit(view: GameView, which: 'attack' | 'charge' | 'stand', pair: 0 | 1): KitMove {
  const at = seenAt(view);
  const long = which === 'attack' ? GORE9.long : which === 'charge' ? CHARGE.long : DEER_STAND.period;
  const fps = which === 'stand' ? DEER_STAND.fps : 30;
  const n = Math.round(long * fps) + (which === 'stand' ? 0 : 1);
  const frames: KitFrame[] = [];
  for (let i = 0; i < n; i++) {
    const t = i / fps;
    const P = which === 'attack' ? gore9Pose(t) : which === 'charge' ? chargePose(t) : deerPose('stand', t);
    const c = which === 'charge' ? chargeCarry(t) : 0;
    const feet = [P.feet[pair * 2], P.feet[pair * 2 + 1]];
    frames.push({
      t,
      pts: { head: at(dHead(P).at, c), hips: at(dWorld(P, [-16, 0, 31]), c), withers: at(dWorld(P, [10, 0, 38]), c) },
      soles: [at(feet[0], c), at(feet[1], c)],
      down: [feet[0][2] < 0.005, feet[1][2] < 0.005],
      heights: [feet[0][2] / 2, feet[1][2] / 2],
      tip: which === 'stand' ? null : at(antlerTip(P), c),
      smeared: which === 'attack' ? GORE_SMEARED(t) : which === 'charge' ? CHARGE_SMEARED(t) : false,
    });
  }
  if (which === 'stand') return { name: 'stand', frames, round: true };
  if (which === 'attack') return { name: 'gore', frames, hit: GORE_HIT, strike: GORE_STRIKE };
  const o = at([0, 0, 0]);
  const e = at([0, 0, 0], CHARGE_CARRIED);
  return { name: 'charge', frames, hit: CHARGE_HIT, strike: CHARGE_STRIKE, shift: [e[0] - o[0], e[1] - o[1]] };
}
/** The fog wolf: its head, its hips and its tail followed; its jaws the end it strikes with; its legs' ends as its soles, never down (it glides: its legs never touch the floor). */
export function wolfKit(view: GameView, which: 'attack' | 'stand'): KitMove {
  const at = seenAt(view);
  const long = which === 'attack' ? LEAP.long : WOLF_STAND.period;
  const fps = which === 'attack' ? 30 : WOLF_STAND.fps;
  const n = Math.round(long * fps) + (which === 'attack' ? 1 : 0);
  const frames: KitFrame[] = [];
  for (let i = 0; i < n; i++) {
    const t = i / fps;
    const P = which === 'attack' ? leapPose(t) : wolfBase('stand', t);
    const c = which === 'attack' ? leapCarry(t) : 0;
    const f0 = legOf(P, 0)[2];
    const f1 = legOf(P, 2)[2];
    frames.push({
      t,
      pts: { head: at(wHead(P).at, c), hips: at(wWorld(P, [-11, 0, 22]), c), tail: at(wWorld(P, [-28, 0, 17]), c) },
      soles: [at(f0, c), at(f1, c)],
      down: [false, false],
      heights: [f0[2] / 2, f1[2] / 2],
      tip: which === 'attack' ? at(jawsOf(P), c) : null,
      smeared: which === 'attack' ? LEAP_SMEARED(t) : false,
    });
  }
  if (which === 'stand') return { name: 'stand', frames, round: true };
  const o = at([0, 0, 0]);
  const e = at([0, 0, 0], LEAP_CARRIED);
  return { name: 'leap', frames, hit: LEAP_HIT, strike: LEAP_STRIKE, shift: [e[0] - o[0], e[1] - o[1]] };
}
