// THE QUARRY GOLEM AS THE BOSS REVIEW SEES IT (art/boss_checks.ts): its outside as solids, the end it strikes
// with, and how its moves hand over. Here and not in src/art/floor6_mobs.ts: the game's own tests keep its
// figures from importing the checks (tests/bosses.test.ts, 12).

import type { BossShape, CheckLimb, CheckLump, Handover } from '../src/art/boss_checks';
import { QG_BODY } from '../src/art/floor6_mobs';
import { add, lerp3, mul } from '../src/art/skeleton';
import type { Skeleton } from '../src/art/skeleton';

const B = QG_BODY;
/** THE QUARRY GOLEM AS THE BOSS REVIEW SEES IT: its blocks as solids; the end it strikes with (both fists together); how its moves hand over. */
export function golemShape(): BossShape {
  return {
    body: (s: Skeleton) => {
      const [rH, rK, rA] = B.legR;
      const [r0, r1] = B.armR;
      const limbs: CheckLimb[] = [
        { name: 'legL', a: s.hipL, b: s.kneeL, r: rH * 0.9 },
        { name: 'shinL', a: s.kneeL, b: s.ankleL, r: rK * 0.85 },
        { name: 'legR', a: s.hipR, b: s.kneeR, r: rH * 0.9 },
        { name: 'shinR', a: s.kneeR, b: s.ankleR, r: rK * 0.85 },
        { name: 'footL', a: s.heelL, b: s.toeL, r: rA * 0.5 },
        { name: 'footR', a: s.heelR, b: s.toeR, r: rA * 0.5 },
        { name: 'upperL', a: s.shoulderL, b: s.elbowL, r: r0 * 0.9 },
        { name: 'foreL', a: s.elbowL, b: s.handL, r: r1 * 0.95 },
        { name: 'upperR', a: s.shoulderR, b: s.elbowR, r: r0 * 0.9 },
        { name: 'foreR', a: s.elbowR, b: s.handR, r: r1 * 0.95 },
      ];
      const [cf, , cu] = s.chest;
      const lumps: CheckLump[] = [
        { name: 'chest', c: add(s.ribs, add(mul(cu, B.chest * 0.45), mul(cf, 0.5))), rot: s.chest, h: [B.ribDeep + 3, B.ribHalf + 5, B.chest * 0.62] },
        { name: 'belly', c: lerp3(s.waist, s.ribs, 0.4), rot: s.belly, h: [B.waistDeep + 2, B.waistHalf + 3, B.ribs * 0.85] },
        { name: 'hips', c: add(s.pelvis, mul(s.hips[2], B.waist * 0.2)), rot: s.hips, h: [B.pelvisDeep + 3, B.pelvisHalf + 4, B.waist * 0.9] },
        { name: 'head', c: s.head, rot: s.face, h: [B.headR[0] * 1.1, B.headR[1] * 1.2, B.headR[2] * 0.95] },
      ];
      return { limbs, lumps };
    },
    tip: (move, _t, s) => (move === 'attack' ? lerp3(s.handL, s.handR, 0.5) : null),
    things: () => [],
    low: { knee: B.legR[1], elbow: B.armR[1], hand: B.armR[2] },
    handovers: [
      { from: 'stand', at: 0, to: 'setOff', toAt: 0 },
      { from: 'setOff', at: 'end', to: 'walk', toAt: 0 },
      { from: 'walk', at: 0, to: 'halt', toAt: 0 },
      { from: 'halt', at: 'end', to: 'stand', toAt: 0 },
      ...['attack', 'reel'].flatMap((m): Handover[] => [
        { from: 'stand', at: 0, to: m, toAt: 0 },
        { from: m, at: 'end', to: 'stand', toAt: 0 },
      ]),
      { from: 'stand', at: 0, to: 'dying', toAt: 0 },
    ],
  };
}
/** Its moves. */
export const GOLEM_MOVES = ['stand', 'walk', 'setOff', 'halt', 'attack', 'reel', 'dying'];
