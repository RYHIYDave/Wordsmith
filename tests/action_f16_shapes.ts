// FLOORS 16 TO 19'S MOBS' NEW MOVES AS THE BOSSES' REVIEW SEES THEM (docs/mockups/action_f16; art/boss_checks.ts checkBoss): each the
// game's own shape (art/palace_hands_moves.ts, art/palace_guard_moves.ts, art/masque_dancers_moves.ts, art/kings_knights_moves.ts) with its
// new strikes and smears; a combo's blows each reviewed as one; a move that ends on from where it began handed back to the stand there.
// Here and not in the art files: the game's own tests keep figures from importing the checks.

import type { BossShape, Handover } from '../src/art/boss_checks';
import { framesOf, movesOf } from '../src/art/boss_checks';
import type { Mob } from '../src/art/new_mobs3';
import { PH_SHAPE_GARDENER, PH_SHAPE_GROOM } from '../src/art/palace_hands_moves';
import { WHISTLE_GROOM, WHISTLE_SMEARED, WHISTLE_STRIKE } from '../src/art/action_f16_groom';
import { GD_SHAPE_PARTISAN, GD_SHAPE_SWORD } from '../src/art/palace_guard_moves';
import { DRILL_PARTISAN, DRILL_SMEARED, DRILL_STRIKES, DRILL_HITS, DRILL_SWORD, JAV, JAV_PARTISAN, JAV_PARTISAN_SWORD, JAV_SMEARED, JAV_SWORD, JAV_SWORD_AFTER, PULL, THRUST9_SMEARED, THRUST9_STRIKE } from '../src/art/action_f16_guard';
import { KN_SHAPE, KN_CLEAVE, smearedAt as knSmeared } from '../src/art/kings_knights_moves';
import { BANNER, BANNER_AT, BANNER_HIT, BANNER_KNIGHT, BANNER_SMEARED, BANNER_STRIKE, CLEAVE_KNIGHT, STAFF, backBanner, bannerHeld } from '../src/art/action_f16_knight';
import { TILE3 } from '../src/art/new_mobs3';
import { add } from '../src/art/skeleton';
import type { V3 } from '../src/art/skeleton';
import { DN_SHAPE_GENT, DN_SHAPE_LADY } from '../src/art/masque_dancers_moves';
import { THROW_GENT, THROW_LADY, THROW_SMEARED, THROW_STRIKE } from '../src/art/action_f16_dancer';
import { HEDGE_GARDENER, HEDGE_HITS, HEDGE_SMEARED, HEDGE_STRIKES, HEDGE_TRAVEL, LUNGE_GARDENER, LUNGE_SMEARED, LUNGE_STRIKE, LUNGE_TRAVEL } from '../src/art/action_f16_gardener';

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
/**
 * THE PALACE GUARD WITH THE JAVELIN (2 Nov, in place of the drill): the thrust a blow of its own; the javelin a blow (his right hand, which
 * hurls it, the end he strikes with, until he reaches for his sword); after it he is another (his sword drawn: `after`). The partisan
 * guard with his sword: the sword guard's moves, no shield; the pull-out no blow, and after it the partisan guard again.
 */
export function javShape(mob: Mob): BossShape {
  const partisan = mob === JAV_PARTISAN;
  const withSword = mob === JAV_PARTISAN_SWORD;
  const base = partisan ? GD_SHAPE_PARTISAN : GD_SHAPE_SWORD;
  const who = partisan ? 'partisan' : 'sword';
  const noShield = (th: ReturnType<NonNullable<BossShape['things']>>): ReturnType<NonNullable<BossShape['things']>> => th.filter((x) => x.name !== 'shield');
  return {
    ...base,
    tip: (move, t, s, q) => {
      if (move === 'javelin') return t <= JAV[who].sword - 0.25 ? s.handR : null;
      if (move === 'pullOut') return null;
      return base.tip?.(move, t, s, q) ?? null;
    },
    things: (move, t, s, q) => {
      if (move === 'javelin') {
        if (partisan) return t <= JAV.partisan.hit + 1e-6 ? (GD_SHAPE_PARTISAN.things?.(move, t, s, q) ?? []) : t >= JAV.partisan.sword ? noShield(GD_SHAPE_SWORD.things?.(move, t, s, q) ?? []) : [];
        const th = GD_SHAPE_SWORD.things?.(move, t, s, q) ?? [];
        return t >= JAV.sword.sheathed - 0.1 && t < JAV.sword.sword ? th.filter((x) => x.name === 'shield') : th;
      }
      if (move === 'pullOut') return t >= PULL.grip ? (GD_SHAPE_PARTISAN.things?.(move, t, s, q) ?? []) : t < PULL.sheathed - 0.2 ? noShield(GD_SHAPE_SWORD.things?.(move, t, s, q) ?? []) : [];
      const th = base.things?.(move, t, s, q) ?? [];
      return withSword ? noShield(th) : th;
    },
    strikes: { attack: THRUST9_STRIKE, ...(withSword ? {} : { javelin: JAV[who].strike }) },
    smeared: (move, t) => (move === 'attack' && THRUST9_SMEARED(t)) || (move === 'javelin' && JAV_SMEARED(who)(t)),
    after: partisan ? { javelin: JAV_PARTISAN_SWORD } : withSword ? { pullOut: JAV_PARTISAN } : mob === JAV_SWORD ? { javelin: JAV_SWORD_AFTER } : {},
  };
}
export const guardRows = (): [string, Mob, BossShape, string[]][] => [
  ['partisan', JAV_PARTISAN, javShape(JAV_PARTISAN), ['attack', 'javelin']],
  ['partisan with sword', JAV_PARTISAN_SWORD, javShape(JAV_PARTISAN_SWORD), ['stand', 'walk', 'attack', 'pullOut']],
  ['sword', JAV_SWORD, javShape(JAV_SWORD), ['attack', 'javelin']],
];

/** THE KING'S KNIGHT: his cleave his blow; the banner a blow of its own (its staff's foot the end he strikes with); it on his back, a thing he carries. */
export function bannerShape(mob: Mob = BANNER_KNIGHT): BossShape {
  const carrying = mob === BANNER_KNIGHT;
  const staffPts = (foot: V3, way: V3, from = 0): V3[] => {
    const out: V3[] = [];
    for (let k = from; k <= STAFF.long; k += 8) out.push([foot[0] + way[0] * k, foot[1] + way[1] * k, foot[2] + way[2] * k]);
    return out;
  };
  return {
    ...KN_SHAPE,
    tip: (move, t, s, q) => {
      if (move === 'banner') {
        // (the staff's foot: on his back, in his fist, and driven into the floor where it stands)
        if (t <= BANNER_HIT + 1e-6) return bannerHeld(mob, t, s)?.foot ?? backBanner(s).foot;
        const k = Math.min(1, (t - BANNER_HIT) / 0.14);
        return add(bannerFoot(), [0, 0, -BANNER.sink * k * k * (3 - 2 * k)]);
      }
      return KN_SHAPE.tip?.(move === 'attack' ? 'cleave' : move, t, s, q) ?? null;
    },
    things: (move, t, s, q) => {
      const out = [...(KN_SHAPE.things?.(move, t, s, q) ?? [])];
      if (!carrying) return out;
      if (move === 'banner' && t > BANNER_HIT + 1e-6) {
        // (planted where he drove it; his fist on it till he lets go)
        if (t < BANNER.let + 0.1) out.push({ name: 'banner', pts: staffPts(add(bannerFoot(), [0, 0, -BANNER.sink]), [0, 0, 1], BANNER.sink), r: STAFF.r, may: ['foreL'] });
        return out;
      }
      const h = move === 'banner' ? bannerHeld(mob, t, s) : null;
      // (in his left fist, his raised arm alongside the staff)
      if (h) out.push({ name: 'banner', pts: staffPts(h.foot, h.way), r: STAFF.r, may: ['foreL', 'upperL'] });
      else {
        const b = backBanner(s);
        out.push({ name: 'banner', pts: staffPts(b.foot, b.way), r: STAFF.r, may: move === 'banner' ? ['foreL', 'upperL'] : [] });
      }
      return out;
    },
    strikes: { attack: KN_CLEAVE.strike, ...(carrying ? { banner: BANNER_STRIKE } : {}) },
    smeared: (move, t) => (move === 'attack' && knSmeared('cleave', t)) || (move === 'banner' && BANNER_SMEARED(t)),
    handovers: [
      ...(KN_SHAPE.handovers ?? []).filter((h) => h.from !== 'cleave' && h.to !== 'cleave'),
      ...(carrying ? [{ from: 'stand', at: 0, to: 'banner', toAt: 0 } as Handover] : []),
    ],
  };
}
/** Where the banner's foot stands as he drives it (his own lengths). */
export function bannerFoot(): V3 {
  return [BANNER_AT[0] * TILE3, BANNER_AT[1] * TILE3, 0];
}
export const knightRows = (): [string, Mob, BossShape, string[]][] => [
  ['banner', BANNER_KNIGHT, bannerShape(BANNER_KNIGHT), ['banner', 'attack']],
  ['cleave', CLEAVE_KNIGHT, bannerShape(CLEAVE_KNIGHT), ['attack']],
];

/** THE GROOM: the whistle a blow of its own, his left hand the end he strikes with (flung out down the line). */
export function whistleShape(): BossShape {
  return {
    ...PH_SHAPE_GROOM,
    tip: (move, t, s, q) => (move === 'attack' ? s.handL : PH_SHAPE_GROOM.tip?.(move, t, s, q) ?? null),
    strikes: { attack: WHISTLE_STRIKE },
    smeared: (move, t) => move === 'attack' && WHISTLE_SMEARED(t),
  };
}
export const groomRows = (): [string, Mob, BossShape, string[]][] => [['groom', WHISTLE_GROOM, whistleShape(), ['attack']]];
/** THE GARDENER'S SHEAR LUNGE (2 Nov, in place of the hedge cut): one blow, the shears' middle the end he strikes with; it ends `travel` on. */
export function lungeShape(mob: Mob = LUNGE_GARDENER): BossShape {
  return {
    ...PH_SHAPE_GARDENER,
    strikes: { attack: LUNGE_STRIKE },
    smeared: (move, t) => move === 'attack' && LUNGE_SMEARED(t),
    handovers: travelHandovers(mob, { attack: LUNGE_TRAVEL }),
  };
}
export const gardenerRows = (): [string, Mob, BossShape, string[]][] => [['gardener', LUNGE_GARDENER, lungeShape(), ['attack']]];

/** THE DANCERS: the throw a blow of its own for each (their hands the end they strike with: his flung open, hers drawn in as she is flung); it ends where it began (she is carried down the lane by the game). */
export function throwShape(mob: Mob): BossShape {
  const base = mob === THROW_GENT ? DN_SHAPE_GENT : DN_SHAPE_LADY;
  return {
    ...base,
    // (his hands, flung open; hers not: she is carried off down the lane by the game, her strike that, not her picture's)
    tip: (move, t, s) => (move === 'attack' && mob === THROW_GENT ? s.handR : null),
    strikes: mob === THROW_GENT ? { attack: THROW_STRIKE } : {},
    smeared: (move, t) => move === 'attack' && THROW_SMEARED(t),
    handovers: (base.handovers ?? []).map((h) => (h.from === 'attack' ? { ...h, shift: undefined } : h)),
  };
}
export const dancerRows = (): [string, Mob, BossShape, string[]][] => [
  ['gent', THROW_GENT, throwShape(THROW_GENT), ['attack']],
  ['lady', THROW_LADY, throwShape(THROW_LADY), ['attack']],
];
