// FLOORS 6 TO 8'S MOBS' NEW MOVES AS THE REVIEWS SEE THEM (docs/mockups/action_f6): the Firepot Thrower, the Chanter and the quarry
// golem for the bosses' review (art/boss_checks.ts checkBoss: their shapes the game's own, tests/act1_cult_shape.ts and
// tests/golem_shape.ts, with their new strikes, smears and what they carry); the canyon scorpion and the dust devil, which are not on
// the heroes' bones, for the review of the old rigs (art/action_f1_checks.ts checkKit: their points, their soles, the end they
// strike with, frame by frame, in game pixels, both ways round). Here and not in the art files: the game's own tests keep figures
// from importing the checks.

import type { BossShape, Handover } from '../src/art/boss_checks';
import type { KitFrame, KitMove } from '../src/art/action_f1_checks';
import type { V } from '../src/art/kit';
import { CAST_SMEARED, CAST_STRIKE, LOB_SMEARED, LOB_STRIKE } from '../src/art/action_f6_cult';
import { BOULDER_R, HAMMER_SMEARED, HAMMER_STRIKE, ROLL_SMEARED, ROLL_STRIKE, boulderHeld } from '../src/art/action_f6_golem';
import { SNAP9, SNAP_HIT, SNAP_SMEARED, SNAP_STRIKE, SPIT, SPIT_HIT, SPIT_SMEARED, SPIT_STRIKE, TW, TW_HIT, TW_SMEARED, TW_STRIKE, spitScorpionPose, twisterPose } from '../src/art/action_f6_canyon';
import { SC_FEET, SC_STAND, stingTip, worldOf } from '../src/art/canyon_scorpions';
import { BELL_UP, DD_STAND, middleAt, standPose as ddStand } from '../src/art/dust_devils';
import { stage } from '../src/art/skin';
import type { GameView } from '../src/art/skin';
import { add, lerp3 } from '../src/art/skeleton';
import type { V3 } from '../src/art/skeleton';
import { chanterShape, potsShape } from './act1_cult_shape';
import { golemShape } from './golem_shape';

export function blazeShape(): BossShape {
  return { ...potsShape(), strikes: { attack: LOB_STRIKE }, smeared: (move, t) => move === 'attack' && LOB_SMEARED(t) };
}
export function castShape(): BossShape {
  return { ...chanterShape(), strikes: { attack: CAST_STRIKE }, smeared: (move, t) => move === 'attack' && CAST_SMEARED(t) };
}
export function boulderShape(): BossShape {
  const g = golemShape();
  const turns = (m: string): Handover[] => [{ from: 'stand', at: 0, to: m, toAt: 0 }, { from: m, at: 'end', to: 'stand', toAt: 0 }];
  return {
    ...g,
    tip: (move, _t, s) => (move === 'attack' || move === 'throw' ? lerp3(s.handL, s.handR, 0.5) : null),
    // (the boulder between its fists, from when it is torn up to when it is bowled: it may touch its fists and forearms, nothing else of it)
    things: (move, t) => {
      const c = move === 'throw' ? boulderHeld(t) : null;
      return c ? [{ name: 'the boulder', pts: [c], r: BOULDER_R * 0.9, may: ['foreL', 'foreR'] }] : [];
    },
    strikes: { attack: HAMMER_STRIKE, throw: ROLL_STRIKE },
    smeared: (move, t) => (move === 'attack' && HAMMER_SMEARED(t)) || (move === 'throw' && ROLL_SMEARED(t)),
    handovers: [...turns('attack'), ...turns('throw')],
  };
}

// ---------------------------------------------------------------------------------------------
// THE OLD RIGS: frames as checkKit reads them

/** A point of the figure's space where it is seen, in game pixels from its floor point (across, down). */
function seenAt(view: GameView): (p: V3) => V {
  const st = stage(view, 0, 0, { w: 8, h: 8 });
  return (p) => {
    const [x, y] = st.at(p);
    return [x / 2, y / 2];
  };
}
/** The scorpion: its head and its back followed, its pincers' tips (the snap) or its sting (the spit) the end it strikes with; two of its eight feet as its soles (`pair`: which two). */
export function scorpionKit(view: GameView, which: 'attack' | 'spit' | 'stand', pair: number): KitMove {
  const at = seenAt(view);
  const long = which === 'attack' ? SNAP9.long : which === 'spit' ? SPIT.long : SC_STAND.period;
  const fps = which === 'stand' ? SC_STAND.fps : 30;
  const n = Math.round(long * fps) + (which === 'stand' ? 0 : 1);
  const frames: KitFrame[] = [];
  for (let i = 0; i < n; i++) {
    const t = i / fps;
    const P = spitScorpionPose(which, t);
    const feet = [P.feet[pair * 2] ?? SC_FEET[pair * 2], P.feet[pair * 2 + 1] ?? SC_FEET[pair * 2 + 1]];
    const tip = which === 'attack' ? lerp3(worldOf(P, add(P.hands[0], [9, 0, 0])), worldOf(P, add(P.hands[1], [9, 0, 0])), 0.5) : which === 'spit' ? stingTip(P) : null;
    frames.push({
      t,
      pts: { head: at(worldOf(P, [10, 0, 4])), hips: at(worldOf(P, [-8, 0, 0])), tail: at(worldOf(P, [-19, 0, 6])) },
      soles: [at(feet[0]), at(feet[1])],
      down: [feet[0][2] < 0.6, feet[1][2] < 0.6],
      heights: [feet[0][2] / 2, feet[1][2] / 2],
      tip: tip ? at(tip) : null,
      smeared: which === 'attack' ? SNAP_SMEARED(t) : which === 'spit' ? SPIT_SMEARED(t) : false,
    });
  }
  if (which === 'stand') return { name: 'stand', frames, round: true };
  return which === 'attack' ? { name: 'snap', frames, hit: SNAP_HIT, strike: SNAP_STRIKE } : { name: 'spit', frames, hit: SPIT_HIT, strike: SPIT_STRIKE };
}
/**
 * The dust devil: its foot, its bell and the top of its funnel followed; the top, the end it bursts up with; its foot its sole, never
 * down (it glides: it has no feet to grip). Its twister has no end it strikes with that is drawn back as a blow is (it bursts up out
 * of its spin), so its strike is reviewed (STRIKE) and not its blow (BLOW, HIPS): its held wind-up is asked in the test.
 */
export function devilKit(view: GameView, which: 'attack' | 'stand'): KitMove {
  const at = seenAt(view);
  const long = which === 'attack' ? TW.long : DD_STAND.period;
  const fps = which === 'attack' ? 30 : DD_STAND.fps;
  const n = Math.round(long * fps) + (which === 'attack' ? 1 : 0);
  const frames: KitFrame[] = [];
  for (let i = 0; i < n; i++) {
    const t = i / fps;
    const P = which === 'attack' ? twisterPose(t) : ddStand(t);
    const foot = middleAt(P, 0);
    frames.push({
      t,
      pts: { hips: at(foot), head: at(add(middleAt(P, BELL_UP), P.bellOff)), mid: at(middleAt(P, 0.5)) },
      soles: [at(foot), at(foot)],
      down: [false, false],
      heights: [foot[2] / 2, foot[2] / 2],
      tip: which === 'attack' ? at(middleAt(P, 1)) : null,
      smeared: which === 'attack' ? TW_SMEARED(t) : false,
    });
  }
  return which === 'attack' ? { name: 'twister', frames, strike: TW_STRIKE } : { name: 'stand', frames, round: true };
}
void TW_HIT;
