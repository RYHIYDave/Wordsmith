// THE DROWNED AS THE BOSS REVIEW SEES IT (art/boss_checks.ts): its outside as solids, the end it strikes with (its
// two hands), and how its moves hand over. Here and not in src/art/drowned.ts: the game's own tests keep figures from
// importing the checks (tests/bosses.test.ts, 12).

import type { BossShape, CheckLimb, CheckLump } from '../src/art/boss_checks';
import { DROWNED_BODY } from '../src/art/drowned';
import { add, lerp3, mul } from '../src/art/skeleton';
import type { Skeleton } from '../src/art/skeleton';

export function drownedShape(): BossShape {
  const B = DROWNED_BODY;
  return {
    body: (s: Skeleton) => {
      const limbs: CheckLimb[] = [
        { name: 'legL', a: s.hipL, b: s.kneeL, r: 1.8 },
        { name: 'shinL', a: s.kneeL, b: s.ankleL, r: 1.3 },
        { name: 'legR', a: s.hipR, b: s.kneeR, r: 1.8 },
        { name: 'shinR', a: s.kneeR, b: s.ankleR, r: 1.3 },
        { name: 'footL', a: s.heelL, b: s.toeL, r: 0.9 },
        { name: 'footR', a: s.heelR, b: s.toeR, r: 0.9 },
        { name: 'upperL', a: s.shoulderL, b: s.elbowL, r: 2.4 },
        { name: 'foreL', a: s.elbowL, b: s.handL, r: 1.2 },
        { name: 'upperR', a: s.shoulderR, b: s.elbowR, r: 2.4 },
        { name: 'foreR', a: s.elbowR, b: s.handR, r: 1.2 },
      ];
      const [cf, , cu] = s.chest;
      const lumps: CheckLump[] = [
        { name: 'chest', c: add(s.ribs, mul(cu, 1)), rot: s.chest, h: [B.ribDeep + 1.6, B.ribHalf + 1.6, B.chest * 0.5] },
        { name: 'belly', c: lerp3(s.waist, s.ribs, 0.4), rot: s.belly, h: [B.waistDeep + 1.2, B.waistHalf + 1.2, B.ribs * 0.7] },
        { name: 'head', c: add(s.head, mul(cf, 0.5)), rot: s.face, h: [5.6, 5.0, 5.8] },
      ];
      return { limbs, lumps };
    },
    tip: (move, _t, s) => (move === 'attack' ? lerp3(s.handL, s.handR, 0.5) : null),
    things: () => [],
    low: { knee: 1.3, elbow: 1.0, hand: 1.0 },
    handovers: [
      { from: 'stand', at: 0, to: 'walk', toAt: 0 },
      { from: 'walk', at: 0, to: 'stand', toAt: 0 },
      { from: 'stand', at: 0, to: 'attack', toAt: 0 },
      { from: 'attack', at: 'end', to: 'stand', toAt: 0 },
      { from: 'stand', at: 0, to: 'reel', toAt: 0 },
      { from: 'reel', at: 'end', to: 'stand', toAt: 0 },
      { from: 'rise', at: 'end', to: 'stand', toAt: 0 },
      { from: 'stand', at: 0, to: 'dying', toAt: 0 },
    ],
  };
}
export const DROWNED_MOVES = ['stand', 'walk', 'attack', 'reel'];
