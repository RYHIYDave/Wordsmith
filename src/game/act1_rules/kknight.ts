// ACT 2, PART TWO, THE HIGH CITY: FLOOR 19, THE KEEP: THE KING'S KNIGHTS: their rules (game/act1_rules/types.ts).
//
// His doc (level 19): "Enemies: the king's knights, still loyal and silent in their armour, crossbowmen on the walls, and the
// Silent Order's last." His picks to the art chat (docs/mockups/kings_knights/README.md): “Huge and slow, one each”, then
// “Bigger still”, then “Really big” (twice the knight's height, a greatsword, no shield, the royal swan on breast and back), and
// “Yes, that's them (Recommended)”. One at a time is his pick (a pack of them is one knight; the barracks, their lair, two);
// how many come at once the art chat left to the main chat.
//
// WHAT THEY DO (the art's numbers, art/kings_knights_moves.ts and kings_knights_fx.ts):
// - THEY WALK at KN_PACE, a tile and a half a second (the hero runs 4.6): slow and heavy.
// - THE SWEEP (his basic, KN_SWEEP, 2.7 s; the blade round at 1.1 s): wound back behind his right (the warning: the half
//   circle before him it will cross marked on the floor), the greatsword sweeps round before him to his left: whoever is within
//   SWEEP.r (4.6 tiles) of him and not behind him is struck.
// - THE CLEAVE (KN_CLEAVE, 2.3 s; down at 1.13 s): fists high over his helm (the warning: the line it will crack marked on the
//   floor), the blade comes down before him and THE FLOOR CRACKS on out in a line to CRACK.reach (8 tiles), CRACK.wide (2.1
//   tiles) across: whoever stands on it is struck, harder than the sweep. Made at one a few tiles off, not one beside him.
// What they leave on the floor, drawn: render/act1_fx/kknight.ts.

import { CRACK, SWEEP } from '../../art/kings_knights_fx';
import { CHOP_AT, KN_CLEAVE, KN_HALT, KN_PACE, KN_SETOFF, KN_SWEEP, KN_WALK } from '../../art/kings_knights_moves';
import { TILE3 } from '../../art/new_mobs3';
import type { ActDef } from '../bosses';
import type { Act1Rules } from './types';

/** Their numbers: the sweep's reach and how far round it goes (degrees each side of before him); the crack's start, end and width (tiles); the cleave's blow (times his own); a pack's size, and their lair's. */
export const KNIGHT_TUNE = {
  sweep: { r: SWEEP.r, arc: SWEEP.arc + 10 },
  crack: { from: CHOP_AT / TILE3 - 0.4, reach: CRACK.reach, wide: CRACK.wide },
  cleave: 1.4,
  pack: 1,
  lair: 2,
} as const;

const ACTS: readonly ActDef[] = [
  { id: 'kknight:sweep', clip: 'attack', long: KN_SWEEP.long, hit: KN_SWEEP.hit, dmg: 1, cooldown: 0, first: 0.5, after: 0.8, near: 0, far: KNIGHT_TUNE.sweep.r - 0.6 },
  { id: 'kknight:cleave', clip: 'cleave', long: KN_CLEAVE.long, hit: KN_CLEAVE.hit, dmg: KNIGHT_TUNE.cleave, cooldown: 5, first: 2, after: 0.8, near: 1.5, far: KNIGHT_TUNE.crack.reach - 0.5 },
];

/** Whether (x, y) is struck by a sweep laid from (sx, sy) facing (fx, fy): within its reach and not behind him. */
export function inSweep(sx: number, sy: number, fx: number, fy: number, x: number, y: number): boolean {
  const dx = x - sx;
  const dy = y - sy;
  const d = Math.hypot(dx, dy);
  if (d > KNIGHT_TUNE.sweep.r) return false;
  if (d < 0.6) return true;
  const cos = (dx * fx + dy * fy) / d;
  return cos >= Math.cos((KNIGHT_TUNE.sweep.arc * Math.PI) / 180);
}
/** Whether (x, y) is on the crack laid from (sx, sy) along (fx, fy). */
export function onCrack(sx: number, sy: number, fx: number, fy: number, x: number, y: number): boolean {
  const C = KNIGHT_TUNE.crack;
  const dx = x - sx;
  const dy = y - sy;
  const fwd = dx * fx + dy * fy;
  const side = Math.abs(-dx * fy + dy * fx);
  return fwd >= C.from - 0.3 && fwd <= C.reach + 0.2 && side <= C.wide / 2;
}

export const RULES: Act1Rules | null = {
  gait: { pace: KN_PACE, cycle: KN_WALK.frames / KN_WALK.fps, setOff: KN_SETOFF, halt: KN_HALT, raise: 0, lower: 0, stopAt: 2.8, slack: 0.8, trueBack: true },
  acts: ACTS,
  acting(R, m, a, t0, t1) {
    const g = R.g;
    const h = g.hero;
    const at = (T: number): boolean => t0 < T && t1 >= T;
    if (!m.act) return;
    if (a.id === 'kknight:sweep') {
      if (at(KN_SWEEP.strike[0])) g.sfx('swing', 0.8);
      if (!at(a.hit)) return;
      if (inSweep(m.x, m.y, m.fx, m.fy, h.x, h.y)) R.blow(m, a.dmg);
      R.peril(m, 'act1', m.x, m.y, { a1: 'kknight:sweep', dur: SWEEP.dust, hit: 0 });
      return;
    }
    if (a.id === 'kknight:cleave') {
      if (!at(a.hit)) return;
      g.sfx('slam', 0.9);
      g.emit({ t: 'shake', amount: 5 });
      if (onCrack(m.x, m.y, m.fx, m.fy, h.x, h.y)) R.blow(m, a.dmg);
      R.peril(m, 'act1', m.x, m.y, { a1: 'kknight:crack', dur: CRACK.long, hit: 0 });
    }
  },
};

