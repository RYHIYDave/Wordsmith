// FLOOR 4'S TWO MOBS AS THE BOSSES' REVIEW SEES THEM (art/boss_checks.ts `checkBoss`, on the heroes' bones): the Ossuary Golem
// and the dagger cultist, each its outside as solids, what it carries (the golem's club of skulls, the skeleton in its fist; the
// cultist's dagger), the end it strikes with, its strikes and its smears, and how its moves hand over. Here and not in the
// figures' own files: the game's own tests keep its figures from importing the checks (tests/bosses.test.ts, 12). Neither had
// been through the review before (docs/mockups/action_f4/README.md).

import type { BossShape, CheckLimb, CheckLump, CheckThing, Handover } from '../src/art/boss_checks';
import { framesOf } from '../src/art/boss_checks';
import { KNIFE_BODY, knifeTipOf } from '../src/art/cultists';
import { FRENZY, FRENZY_SMEARED, FRENZY_STRIKES, FRENZY_TRAVEL } from '../src/art/cultists';
import { CLUB_TIP, HURL_SMEARED, HURL_STRIKE, SWING_SMEARED, SWING_STRIKE, heldBones } from '../src/art/action_f4_fx';
import type { Mob } from '../src/art/new_mobs3';
import { add, lerp3, mul, norm, sub } from '../src/art/skeleton';
import type { Skeleton } from '../src/art/skeleton';

/** THE OSSUARY GOLEM: its bundles of bone, its packed hulk and shoulders, its sunk skull; its club, and the skeleton it hauls up. */
export function golemShape(mob: Mob, action: boolean): BossShape {
  const B = mob.build;
  return {
    body: (s: Skeleton) => {
      const [cf, cl, cu] = s.chest;
      const limbs: CheckLimb[] = [
        { name: 'legL', a: s.hipL, b: s.kneeL, r: 4.2 },
        { name: 'legR', a: s.hipR, b: s.kneeR, r: 4.2 },
        { name: 'shinL', a: s.kneeL, b: s.ankleL, r: 3.6 },
        { name: 'shinR', a: s.kneeR, b: s.ankleR, r: 3.6 },
        { name: 'upperL', a: s.shoulderL, b: s.elbowL, r: 4.0 },
        { name: 'upperR', a: s.shoulderR, b: s.elbowR, r: 4.0 },
        { name: 'foreL', a: s.elbowL, b: s.handL, r: 4.6 },
        { name: 'foreR', a: s.elbowR, b: s.handR, r: 4.2 },
        { name: 'neck', a: s.neck, b: s.skull, r: 3.0 },
      ];
      const chestC = add(add(s.ribs, mul(cu, B.chest * 0.42)), mul(cf, -1.2));
      const lumps: CheckLump[] = [
        { name: 'trunk', c: chestC, rot: s.chest, h: [B.ribDeep + 1.4, B.ribHalf + 1.6, B.chest * 0.66] },
        { name: 'hips', c: add(s.pelvis, mul(s.hips[2], 1.5)), rot: s.hips, h: [B.pelvisDeep, B.pelvisHalf + 0.8, 5] },
        { name: 'head', c: s.head, rot: s.face, h: [4.8, 4.6, 4.4] },
      ];
      for (const [side, sh, sg] of [['L', s.shoulderL, 1], ['R', s.shoulderR, -1]] as const) lumps.push({ name: `smass${side}`, c: add(add(sh, mul(cu, 2.6)), add(mul(cf, -0.8), mul(cl, sg * -1.2))), rot: s.chest, h: [6.4, 6.2, 5.6] });
      return { limbs, lumps };
    },
    things: (move, t, s) => {
      const out: CheckThing[] = [];
      // the club of skulls at the end of its left arm (its fused skulls: the forearm's line on past the hand)
      const fore = norm(sub(s.handL, s.elbowL), [0, 0, -1]);
      out.push({ name: 'club', pts: Array.from({ length: 5 }, (_, i) => add(s.handL, mul(fore, 4 + i * 2.4))), r: 3.2, may: ['foreL'] });
      // the skeleton in its fist (the hurl): each of its bones, from its own points
      if (action && move === 'throw') {
        const held = heldBones(mob, t);
        if (held) out.push({ name: 'skeleton', pts: held, r: 0.9 });
      }
      return out;
    },
    tip: (move, t, s) => {
      if (move === 'throw' || move === 'hurl') return s.handR;
      const fore = norm(sub(s.handL, s.elbowL), [0, 0, -1]);
      return add(s.handL, mul(fore, CLUB_TIP));
    },
    ...(action
      ? {
          strikes: { attack: SWING_STRIKE, throw: HURL_STRIKE },
          smeared: (move: string, t: number) => (move === 'attack' ? SWING_SMEARED(t) : move === 'throw' ? HURL_SMEARED(t) : false),
        }
      : {}),
    // (its knees are as thick as a man's middle, its fists round: the review's lows for a man, scaled)
    low: { knee: 3.3, elbow: 3.6, hand: 4.0 },
  };
}
/** Where the golem's moves hand over: its stand into each move and back, its walk in and out at every step, each attack from its walk. */
export function golemHandovers(mob: Mob, moves: readonly string[]): Handover[] {
  const walk = framesOf(mob, 'walk').slice(0, -1);
  return [
    { from: 'stand', at: 0, to: 'walk', toAt: 0 },
    ...walk.map((t): Handover => ({ from: 'walk', at: t, to: 'stand', toAt: 0 })),
    ...moves.flatMap((m): Handover[] => [{ from: 'stand', at: 0, to: m, toAt: 0 }, { from: m, at: 'end', to: 'stand', toAt: 0 }, ...walk.map((t): Handover => ({ from: 'walk', at: t, to: m, toAt: 0 }))]),
  ];
}

/** THE DAGGER CULTIST: his thin bound legs, his trunk in its girded robe, his cowl; his dagger. */
export function knifeShape(mob: Mob, action: boolean): BossShape {
  const B = KNIFE_BODY;
  return {
    body: (s: Skeleton) => {
      const limbs: CheckLimb[] = [
        { name: 'legL', a: s.hipL, b: s.kneeL, r: B.legR[0] * 0.9 },
        { name: 'legR', a: s.hipR, b: s.kneeR, r: B.legR[0] * 0.9 },
        { name: 'shinL', a: s.kneeL, b: s.ankleL, r: B.legR[1] * 0.85 },
        { name: 'shinR', a: s.kneeR, b: s.ankleR, r: B.legR[1] * 0.85 },
        { name: 'upperL', a: s.shoulderL, b: s.elbowL, r: B.armR[0] * 0.8 },
        { name: 'upperR', a: s.shoulderR, b: s.elbowR, r: B.armR[0] * 0.8 },
        { name: 'foreL', a: s.elbowL, b: s.handL, r: B.armR[1] * 0.8 },
        { name: 'foreR', a: s.elbowR, b: s.handR, r: B.armR[1] * 0.8 },
        { name: 'neck', a: s.neck, b: s.skull, r: 1.4 },
      ];
      const lumps: CheckLump[] = [
        { name: 'ribs', c: lerp3(s.ribs, s.neck, 0.35), rot: s.chest, h: [B.ribDeep, B.ribHalf, B.chest * 0.62] },
        { name: 'belly', c: lerp3(s.waist, s.ribs, 0.5), rot: s.belly, h: [B.waistDeep, B.waistHalf, B.ribs * 0.6] },
        { name: 'pelvis', c: add(s.pelvis, mul(s.hips[2], 0.8)), rot: s.hips, h: [B.pelvisDeep, B.pelvisHalf, 2.4] },
        { name: 'head', c: s.head, rot: s.face, h: [B.headR[0], B.headR[1], B.headR[2]] },
      ];
      return { limbs, lumps };
    },
    things: (_move, _t, s) => {
      const tip = knifeTipOf(s);
      const from = add(s.handR, mul(s.point, 2.4));
      return [{ name: 'dagger', pts: Array.from({ length: 6 }, (_, i) => lerp3(from, tip, i / 5)), r: 0.7, may: ['foreR'] }];
    },
    tip: (_move, _t, s) => knifeTipOf(s),
    ...(action
      ? {
          blows: {
            attack: FRENZY_STRIKES.map(([a, b], i) => ({ hit: b, strike: [a, b] as const, from: i === 0 ? 0 : FRENZY_STRIKES[i - 1][1] + 0.02, until: i < 3 ? FRENZY_STRIKES[i + 1][0] - 0.06 : undefined })),
          },
          smeared: (move: string, t: number) => move === 'attack' && FRENZY_SMEARED(t),
        }
      : {}),
  };
}
/** Where the dagger cultist's moves hand over: his stand into each and back, his run in and out at every stride, his attack from his run; the frenzy ends where his steps have taken him. */
export function knifeHandovers(mob: Mob, action: boolean): Handover[] {
  const run = framesOf(mob, 'walk').slice(0, -1);
  return [
    { from: 'stand', at: 0, to: 'walk', toAt: 0 },
    ...run.map((t): Handover => ({ from: 'walk', at: t, to: 'stand', toAt: 0 })),
    // (into his attack from his run: the frenzy from the frames of its round the game may begin it on, FRENZY.fromRun)
    ...run.filter((_, i) => !action || FRENZY.fromRun.includes(i)).map((t): Handover => ({ from: 'walk', at: t, to: 'attack', toAt: 0 })),
    ...run.map((t): Handover => ({ from: 'walk', at: t, to: 'reel', toAt: 0 })),
    { from: 'stand', at: 0, to: 'attack', toAt: 0 },
    { from: 'attack', at: 'end', to: 'stand', toAt: 0, shift: action ? [FRENZY_TRAVEL, 0] : undefined },
    { from: 'attack', at: 'end', to: 'walk', toAt: 0, shift: action ? [FRENZY_TRAVEL, 0] : undefined },
    { from: 'stand', at: 0, to: 'reel', toAt: 0 },
    { from: 'reel', at: 'end', to: 'stand', toAt: 0 },
    { from: 'stand', at: 0, to: 'dying', toAt: 0 },
  ];
}
