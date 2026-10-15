// THE CANTOR AS THE BOSS REVIEW SEES HIM (art/boss_checks.ts): his outside as solids, what he carries, and how
// his moves hand over. Here and not in src/art/cantor.ts: the game's own tests keep figures from importing the
// checks (tests/bosses.test.ts, 12).

import type { BossShape, CheckLimb, CheckLump } from '../src/art/boss_checks';
import { CANTOR_BODY, pipesOf, staffOf } from '../src/art/cantor';
import { add, lerp3, mul, sub } from '../src/art/skeleton';
import type { Skeleton } from '../src/art/skeleton';

const B = CANTOR_BODY;
export function cantorShape(): BossShape {
  return {
    body: (s: Skeleton) => {
      const [rH, rK, rA] = B.legR;
      const [r0, r1] = B.armR;
      const limbs: CheckLimb[] = [
        { name: 'legL', a: s.hipL, b: s.kneeL, r: rH * 1.0 },
        { name: 'shinL', a: s.kneeL, b: s.ankleL, r: rK * 0.8 },
        { name: 'legR', a: s.hipR, b: s.kneeR, r: rH * 1.0 },
        { name: 'shinR', a: s.kneeR, b: s.ankleR, r: rK * 0.8 },
        { name: 'footL', a: s.heelL, b: s.toeL, r: rA * 0.6 },
        { name: 'footR', a: s.heelR, b: s.toeR, r: rA * 0.6 },
        { name: 'upperL', a: s.shoulderL, b: s.elbowL, r: r0 * 0.9 },
        { name: 'foreL', a: s.elbowL, b: s.handL, r: r1 * 0.7 },
        { name: 'upperR', a: s.shoulderR, b: s.elbowR, r: r0 * 0.9 },
        { name: 'foreR', a: s.elbowR, b: s.handR, r: r1 * 0.7 },
        { name: 'neck', a: s.neck, b: s.head, r: 1.5 },
      ];
      const pipes = pipesOf(s);
      const mid = lerp3(lerp3(pipes[0].foot, pipes[8].foot, 0.5), lerp3(pipes[0].top, pipes[8].top, 0.5), 0.5);
      const lumps: CheckLump[] = [
        { name: 'chest', c: s.ribs, rot: s.chest, h: [B.ribDeep + 1.2, B.ribHalf + 1.2, B.chest * 0.55] },
        { name: 'belly', c: lerp3(s.ribs, s.pelvis, 0.5), rot: s.belly, h: [B.waistDeep + 1.2, B.waistHalf + 1.2, B.waist * 0.6] },
        { name: 'hips', c: s.pelvis, rot: s.hips, h: [B.pelvisDeep + 1.4, B.pelvisHalf + 1.4, B.hipHalf * 1.4] },
        { name: 'head', c: s.head, rot: s.face, h: [B.headR[0] * 0.92, B.headR[1] * 0.88, B.headR[2] * 1.12] },
        // his pipes, rising from between his shoulder blades: no arm through them
        { name: 'pipes', c: add(mid, mul(s.chest[0], -1.5)), rot: s.chest, h: [2.6, 16, 22] },
      ];
      return { limbs, lumps };
    },
    // his staff, in his right hand: through nothing of him but that hand
    things: (_move, _t, s) => {
      const { foot, head } = staffOf(s);
      return [{ name: 'staff', pts: [foot, lerp3(foot, head, 0.5), head], r: 0.9, may: ['foreR', 'handR'] }];
    },
    tip: (move, _t, s) => (move === 'attack' ? staffOf(s).head : null),
    low: { knee: B.legR[1], elbow: B.armR[1], hand: B.armR[2] },
  };
}
/** His moves made so far: his stand. */
export const MADE = ['stand'];
void sub;
