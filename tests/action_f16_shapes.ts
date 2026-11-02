// FLOORS 16 TO 19'S MOBS' NEW MOVES AS THE BOSSES' REVIEW SEES THEM (docs/mockups/action_f16; art/boss_checks.ts checkBoss): each the
// game's own shape (art/palace_hands_moves.ts, art/palace_guard_moves.ts, art/masque_dancers_moves.ts, art/kings_knights_moves.ts) with its
// new strikes and smears; a combo's blows each reviewed as one; a move that ends on from where it began handed back to the stand there.
// Here and not in the art files: the game's own tests keep figures from importing the checks.

import type { BossShape, Handover } from '../src/art/boss_checks';
import { framesOf, movesOf } from '../src/art/boss_checks';
import type { Mob } from '../src/art/new_mobs3';
import { PH_SHAPE_GARDENER } from '../src/art/palace_hands_moves';
import { GD_SHAPE_PARTISAN, GD_SHAPE_SWORD } from '../src/art/palace_guard_moves';
import { DRILL_PARTISAN, DRILL_SMEARED, DRILL_STRIKES, DRILL_HITS, DRILL_SWORD, THRUST9_SMEARED, THRUST9_STRIKE } from '../src/art/action_f16_guard';
import { HEDGE_GARDENER, HEDGE_HITS, HEDGE_SMEARED, HEDGE_STRIKES, HEDGE_TRAVEL } from '../src/art/action_f16_gardener';

/** Handovers for one whose `attack` ends `travel` on (the game moves him on by it): his stand into each move and back; into his walk and out of it at every step. */
export function travelHandovers(mob: Mob, travel: Readonly<Record<string, number>>): Handover[] {
  const others = movesOf(mob).filter((x) => x !== 'stand' && x !== 'walk');
  return [
    ...others.flatMap((x): Handover[] => (x === 'dying' ? [{ from: 'stand', at: 0, to: x, toAt: 0 }] : [{ from: 'stand', at: 0, to: x, toAt: 0 }, { from: x, at: 'end', to: 'stand', toAt: 0, shift: travel[x] ? [travel[x], 0] : undefined }])),
    { from: 'stand', at: 0, to: 'walk', toAt: 0 },
    ...framesOf(mob, 'walk').map((t): Handover => ({ from: 'walk', at: t, to: 'stand', toAt: 0 })),
  ];
}

/** THE GARDENER: the hedge cut a combo of three blows (the shears' middle the end he strikes with); it ends `travel` on. */
export function hedgeShape(mob: Mob = HEDGE_GARDENER): BossShape {
  const [h1, h2, h3] = HEDGE_HITS;
  const [s1, s2, s3] = HEDGE_STRIKES;
  return {
    ...PH_SHAPE_GARDENER,
    blows: { attack: [{ hit: h1, strike: s1, from: 0, until: 0.9 }, { hit: h2, strike: s2, from: 0.9, until: 1.4 }, { hit: h3, strike: s3, from: 1.4 }] },
    smeared: (move, t) => move === 'attack' && HEDGE_SMEARED(t),
    handovers: travelHandovers(mob, { attack: HEDGE_TRAVEL }),
  };
}

/** THE PALACE GUARD: the thrust a blow of its own; the drill a combo of three (the weapon's point the end it strikes with). */
export function drillShape(mob: Mob): BossShape {
  const base = mob === DRILL_SWORD ? GD_SHAPE_SWORD : GD_SHAPE_PARTISAN;
  const [h1, h2, h3] = DRILL_HITS;
  const [s1, s2, s3] = DRILL_STRIKES;
  return {
    ...base,
    // (the partisan's drill: its point in the chop and the spin; his fists, what drive it into the ground, in the drive: from the one to
    // the other as he comes round)
    tip: (move, t, s, q) => {
      const p = base.tip?.(move === 'drill' ? 'attack' : move, t, s, q) ?? null;
      if (move !== 'drill' || mob !== DRILL_PARTISAN || !p) return p;
      const u = Math.max(0, Math.min(1, (t - 1.62) / 0.24));
      const w = u * u * (3 - 2 * u);
      return [p[0] + (s.handR[0] - p[0]) * w, p[1] + (s.handR[1] - p[1]) * w, p[2] + (s.handR[2] - p[2]) * w];
    },
    strikes: { attack: THRUST9_STRIKE },
    blows: { drill: [{ hit: h1, strike: s1, from: 0, until: 0.9 }, { hit: h2, strike: s2, from: 0.9, until: 1.9 }, { hit: h3, strike: s3, from: 1.9 }] },
    smeared: (move, t) => (move === 'attack' && THRUST9_SMEARED(t)) || (move === 'drill' && DRILL_SMEARED(t)),
  };
}
export const guardRows = (): [string, Mob, BossShape, string[]][] => [
  ['partisan', DRILL_PARTISAN, drillShape(DRILL_PARTISAN), ['attack', 'drill']],
  ['sword', DRILL_SWORD, drillShape(DRILL_SWORD), ['attack', 'drill']],
];
