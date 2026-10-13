// THE UNFINISHED AS THE BOSS REVIEW SEES IT (art/boss_checks.ts): its outside as solids, the end it strikes
// with, what it carries, and how its moves hand over. Here and not in src/art/unfinished.ts: the game's own
// tests keep its figures from importing the checks (tests/bosses.test.ts, 12).

import type { BossShape, CheckLimb, CheckLump, Handover } from '../src/art/boss_checks';
import { CR, UF_BODY, UF_HURL_HIT, UF_HURL_TEAR, chestOf } from '../src/art/unfinished';
import { add, lerp3, mul } from '../src/art/skeleton';
import type { Skeleton } from '../src/art/skeleton';

/** THE UNFINISHED AS THE BOSS REVIEW SEES IT (art/boss_checks.ts): its outside as solids; the end it strikes with; how its moves hand over. */
const B = UF_BODY;
export function ufShape(): BossShape {
  return {
    body: (s: Skeleton) => {
      const [rH, rK, rA] = B.legR;
      const [r0, r1] = B.armR;
      const limbs: CheckLimb[] = [
        { name: 'legL', a: s.hipL, b: s.kneeL, r: rH * 1.0 },
        { name: 'shinL', a: s.kneeL, b: s.ankleL, r: rK * 0.95 },
        { name: 'legR', a: s.hipR, b: s.kneeR, r: rH * 0.9 },
        { name: 'shinR', a: s.kneeR, b: s.ankleR, r: rK * 0.8 },
        { name: 'footL', a: s.heelL, b: s.toeL, r: rA * 0.6 },
        { name: 'footR', a: s.heelR, b: s.toeR, r: rA * 0.5 },
        { name: 'upperL', a: s.shoulderL, b: s.elbowL, r: r0 * 1.0 },
        { name: 'foreL', a: s.elbowL, b: s.handL, r: r1 * 1.1 },
        { name: 'upperR', a: s.shoulderR, b: s.elbowR, r: r0 * 0.9 },
        { name: 'foreR', a: s.elbowR, b: s.handR, r: r1 * 0.85 },
        { name: 'neck', a: s.neck, b: s.skull, r: B.headR[1] * 0.9 },
      ];
      const lumps: CheckLump[] = [
        { name: 'chest', c: chestOf(s), rot: s.chest, h: CR },
        { name: 'belly', c: lerp3(s.waist, s.ribs, 0.4), rot: s.belly, h: [B.waistDeep + 5, B.waistHalf + 6, B.ribs * 0.9] },
        { name: 'hips', c: add(s.pelvis, mul(s.hips[2], B.waist * 0.2)), rot: s.hips, h: [B.pelvisDeep + 4, B.pelvisHalf + 6, B.waist * 0.95] },
        { name: 'head', c: s.head, rot: s.face, h: [B.headR[0] * 1.25, B.headR[1] * 1.28, B.headR[2] * 1.2] },
      ];
      return { limbs, lumps };
    },
    tip: (move, _t, s) => (move === 'attack' ? s.handR : move === 'stomp' ? s.heelR : move === 'hurl' || move === 'rockslide' ? lerp3(s.handL, s.handR, 0.5) : null),
    things: (move, t, s) => (move === 'hurl' && t >= 0.5 && t < UF_HURL_HIT ? [{ name: 'the block', pts: [t < UF_HURL_TEAR ? [70, 0, 23] : lerp3(s.handL, s.handR, 0.5)], r: 20, may: ['foreL', 'foreR', 'upperL', 'upperR'] }] : []),
    low: { knee: B.legR[1], elbow: B.armR[1], hand: B.armR[2] },
    handovers: [
      { from: 'stand', at: 0, to: 'setOff', toAt: 0 },
      { from: 'setOff', at: 'end', to: 'walk', toAt: 0 },
      { from: 'walk', at: 0, to: 'halt', toAt: 0 },
      { from: 'halt', at: 'end', to: 'stand', toAt: 0 },
      ...['attack', 'reel', 'stomp', 'hurl', 'rockslide'].flatMap((m): Handover[] => [
        { from: 'stand', at: 0, to: m, toAt: 0 },
        { from: m, at: 'end', to: 'stand', toAt: 0 },
      ]),
    ],
  };
}
/** Its moves made so far (its death and its other moves are still its stand, not for use). */
export const MADE = ['stand', 'walk', 'setOff', 'halt', 'attack', 'reel', 'stomp', 'hurl', 'rockslide'];
