// FLOORS 11 TO 15'S MOBS' NEW MOVES AS THE BOSSES' REVIEW SEES THEM (docs/mockups/action_f11; art/boss_checks.ts checkBoss): each the game's
// own shape (art/hushed_watch_moves.ts WA_SHAPE, art/fieldhands_moves.ts FH_SHAPE, art/orderlies_moves.ts OD_SHAPE, art/bookwardens_moves.ts
// WB_SHAPE) with its new strikes and smears; the watch's lantern as a thing they carry; the harvest a combo of three blows that ends where the
// game hands it back to the stand, on; the tome slam's tome where the game's warped time puts it. Here and not in the art files: the game's own
// tests keep figures from importing the checks.

import type { BossShape, CheckThing, Handover } from '../src/art/boss_checks';
import { framesOf, movesOf } from '../src/art/boss_checks';
import type { Mob } from '../src/art/new_mobs3';
import type { Skeleton } from '../src/art/skeleton';
import { halberdOf } from '../src/art/hushed_watch';
import { WA_DIES, WA_SHAPE } from '../src/art/hushed_watch_moves';
import { FH_SHAPE } from '../src/art/fieldhands_moves';
import { OD_SHAPE } from '../src/art/orderlies_moves';
import { WB_SHAPE, tomeWayOf } from '../src/art/bookwardens_moves';
import { tomeAt } from '../src/art/bookwardens';
import { CHOP_SMEARED, CHOP_STRIKE, LANTERN, LOB_HIT, LOB_SMEARED, LOB_STRIKE, hangOf, lanternPts, ringOf } from '../src/art/action_f11_watch';
import { HARVEST_HITS, HARVEST_REAPER, HARVEST_SMEARED, HARVEST_STRIKES, TRAVEL } from '../src/art/action_f11_field';
import { BLOW_SMEARED, BLOW_STRIKE, GURNEY_SMEARED, GURNEY_STRIKE } from '../src/art/action_f11_orderly';
import { BARRAGE_SMEARED, BARRAGE_STRIKE, SLAM_SMEARED, SLAM_STRIKE, slamWarp } from '../src/art/action_f11_warden';

/** The watch's lantern as the checks see it: along its middle, as thick as it is; in the hand, the left forearm may touch it. */
function lanternThings(mob: Mob, move: string, t: number, s: Skeleton): CheckThing[] {
  if (move === 'dying') return [];
  const r = ringOf(move, t, s);
  if (!r) return [];
  const L = lanternPts(r.ring, hangOf(mob, move, t, false));
  return [{ name: 'lantern', pts: [L.top, L.mid, L.foot], r: LANTERN.r, may: r.hand ? ['foreL'] : [] }];
}
/** THE WATCH: the halberd's blade the end they strike with in the chop; the left hand in the throw, until the lantern leaves it. */
export function lanternShape(mob: Mob): BossShape {
  return {
    ...WA_SHAPE,
    things: (move, t, s, q) => [...(WA_SHAPE.things?.(move, t, s, q) ?? []), ...lanternThings(mob, move, t, s)],
    tip: (move, t, s, q) => (move === 'lantern' ? (t <= LOB_HIT + 1e-6 ? s.handL : null) : move === 'dying' && t >= WA_DIES.drop ? null : halberdOf(s, q).edge),
    strikes: { attack: CHOP_STRIKE, lantern: LOB_STRIKE },
    smeared: (move, t) => (move === 'attack' && CHOP_SMEARED(t)) || (move === 'lantern' && LOB_SMEARED(t)),
  };
}
/** THE FIELDHANDS: the harvest a combo of three blows; it ends `travel` on, where the game hands it back to the stand. */
export function harvestShape(mob: Mob = HARVEST_REAPER): BossShape {
  const others = movesOf(mob).filter((x) => x !== 'stand' && x !== 'walk');
  const hand: Handover[] = [
    ...others.flatMap((x): Handover[] => (x === 'dying' ? [{ from: 'stand', at: 0, to: x, toAt: 0 }] : [{ from: 'stand', at: 0, to: x, toAt: 0 }, { from: x, at: 'end', to: 'stand', toAt: 0, shift: x === 'attack' ? [TRAVEL, 0] : undefined }])),
    { from: 'stand', at: 0, to: 'walk', toAt: 0 },
    ...framesOf(mob, 'walk').map((t): Handover => ({ from: 'walk', at: t, to: 'stand', toAt: 0 })),
  ];
  const [h1, h2, h3] = HARVEST_HITS;
  const [s1, s2, s3] = HARVEST_STRIKES;
  return {
    ...FH_SHAPE,
    blows: { attack: [{ hit: h1, strike: s1, from: 0, until: 0.9 }, { hit: h2, strike: s2, from: 0.9, until: 1.42 }, { hit: h3, strike: s3, from: 1.42 }] },
    smeared: (move, t) => move === 'attack' && HARVEST_SMEARED(t),
    handovers: hand,
  };
}
/** THE ORDERLY: the mallet's head the end it strikes with, in both. */
export function gurneyShape(): BossShape {
  return {
    ...OD_SHAPE,
    strikes: { attack: BLOW_STRIKE, gurney: GURNEY_STRIKE },
    smeared: (move, t) => (move === 'attack' && BLOW_SMEARED(t)) || (move === 'gurney' && GURNEY_SMEARED(t)),
  };
}
/** THE BOOKWARDEN: the tome in the slam (where the game's warped time puts it); his left hand in the barrage, the tome hanging. */
export function barrageShape(): BossShape {
  return {
    ...WB_SHAPE,
    tip: (move, t, s, q) => (move === 'attack' ? tomeAt(s, tomeWayOf('attack', slamWarp(t))).mid : move === 'barrage' ? s.handL : (WB_SHAPE.tip?.(move, t, s, q) ?? null)),
    things: (move, t, s, q) => (move === 'attack' ? (WB_SHAPE.things?.('attack', slamWarp(t), s, q) ?? []) : move === 'barrage' ? (WB_SHAPE.things?.('stand', t, s, q) ?? []) : (WB_SHAPE.things?.(move, t, s, q) ?? [])),
    strikes: { attack: SLAM_STRIKE, barrage: BARRAGE_STRIKE },
    smeared: (move, t) => (move === 'attack' && SLAM_SMEARED(t)) || (move === 'barrage' && BARRAGE_SMEARED(t)),
  };
}
