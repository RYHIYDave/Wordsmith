// THE HOLLOW STAG'S NEW MOVES AS THE REVIEW SEES THEM (docs/mockups/action_f9_stag): he is not on the heroes' bones, so the review
// for the old rigs (art/action_f1_checks.ts checkKit, as the twisted deer's in tests/action_f9_shapes.ts): his head, his withers and
// his hips followed; between his antlers' tips (or, crashing down out of his bellow, his muzzle) the end he strikes with; a pair of
// his four hoofs as his soles (`pair` 0: his forefeet; 1: his hind feet), down where they stand on the floor; frame by frame, in game
// pixels, both ways round, where the game has carried him over the floor and all. Here and not in the art files: the game's own
// tests keep figures from importing the checks.

import type { KitFrame, KitMove } from '../src/art/action_f1_checks';
import type { V } from '../src/art/kit';
import { TILE3 } from '../src/art/new_mobs3';
import { STAG_STAND, headFrame, poseOf, worldOf } from '../src/art/hollow_stag';
import type { StagPose } from '../src/art/hollow_stag';
import { CHARGE9_HIT, CHARGE9_STRIKE, CLOSE_HIT, CLOSE_STRIKE, GORE9_HIT, GORE9_STRIKE, LONG9, STOT9, antlersOf, charge9Carry, muzzleOf, pose9, smeared9, stareCarry, stot9Carry, stotAt } from '../src/art/stag_action';
import type { Move9 } from '../src/art/stag_action';
import { stage } from '../src/art/skin';
import type { GameView } from '../src/art/skin';
import type { V3 } from '../src/art/skeleton';

/** A point of his space where it is seen, in game pixels from where he set off (across, down), the game having carried him `c` tiles the way he faces. */
function seenAt(view: GameView): (p: V3, c?: number) => V {
  const st = stage(view, 0, 0, { w: 8, h: 8 });
  return (p, c = 0) => {
    const [x, y] = st.at([p[0] + c * TILE3, p[1], p[2]]);
    return [x / 2, y / 2];
  };
}
const CARRY: Record<Move9, (t: number) => number> = { attack: () => 0, charge: charge9Carry, close: () => 0, walk: stot9Carry, stare: stareCarry };
/** His frame as the review reads it. */
function kitFrame(at: ReturnType<typeof seenAt>, P: StagPose, t: number, c: number, pair: 0 | 1, tip: V | null, smeared: boolean): KitFrame {
  const feet = [P.feet[pair * 2], P.feet[pair * 2 + 1]];
  return {
    t,
    pts: { head: at(headFrame(P).at, c), withers: at(worldOf(P, [20, 0, 66]), c), hips: at(worldOf(P, [-27, 0, 52]), c) },
    soles: [at(feet[0], c), at(feet[1], c)],
    down: [feet[0][2] < 0.005, feet[1][2] < 0.005],
    heights: [feet[0][2] / 2, feet[1][2] / 2],
    tip,
    smeared,
  };
}
/** His stand (the game's own), as the review reads it. */
export function standKit(view: GameView, pair: 0 | 1): KitMove {
  const at = seenAt(view);
  const frames: KitFrame[] = [];
  for (let i = 0; i < STAG_STAND.frames; i++) {
    const t = i / STAG_STAND.fps;
    frames.push(kitFrame(at, poseOf('stand', t), t, 0, pair, null, false));
  }
  return { name: 'stand', frames, round: true };
}
/**
 * One of his new moves as the review reads it. His walk (the great stot) two rounds, from the middle of a landing to the middle of a
 * landing; standing to stare with the last tenths of the bound it lands from before it (it begins as a bound lands, the game
 * stopping him there: what it hands over from is his walk, still carried on).
 */
export function stagKit(view: GameView, which: Move9, pair: 0 | 1): KitMove {
  const at = seenAt(view);
  const long = which === 'walk' ? 2 * STOT9.period : LONG9[which];
  const n = Math.round(long * 30) + 1;
  const carry = CARRY[which];
  const frames: KitFrame[] = [];
  if (which === 'stare') for (let i = -34; i < 0; i++) frames.push(kitFrame(at, stotAt(i / 30), i / 30, (STOT9.pace * i) / 30, pair, null, false));
  for (let i = 0; i < n; i++) {
    const t = i / 30;
    const P = pose9(which, t);
    const c = carry(t);
    const tip = which === 'attack' || which === 'charge' ? at(antlersOf(P), c) : which === 'close' ? at(muzzleOf(P), c) : null;
    frames.push(kitFrame(at, P, t, c, pair, tip, smeared9(which, t)));
  }
  const o = at([0, 0, 0]);
  const e = at([0, 0, 0], carry(long));
  const shift: V = [e[0] - o[0], e[1] - o[1]];
  if (which === 'attack') return { name: 'gore', frames, hit: GORE9_HIT, strike: GORE9_STRIKE };
  if (which === 'charge') return { name: 'charge', frames, hit: CHARGE9_HIT, strike: CHARGE9_STRIKE, shift };
  if (which === 'close') return { name: 'close', frames, hit: CLOSE_HIT, strike: CLOSE_STRIKE };
  return { name: which, frames, shift };
}
