// THE CARRION QUEEN AS THE BOSS REVIEW SEES HER (art/boss_checks.ts): her outside as solids, and how her moves
// hand over. Here and not in src/art/carrion_queen.ts: the game's own tests keep figures from importing the
// checks (tests/bosses.test.ts, 12).

import type { BossShape, CheckLimb, CheckLump, Handover } from '../src/art/boss_checks';
import { CQ_BODY, CR, chestOf, headOf } from '../src/art/carrion_queen';
import { add, lerp3, mul, norm, sub } from '../src/art/skeleton';
import type { Skeleton } from '../src/art/skeleton';

const B = CQ_BODY;
export function queenShape(): BossShape {
  return {
    body: (s: Skeleton) => {
      const [rH, rK, rA] = B.legR;
      const [r0, r1] = B.armR;
      const limbs: CheckLimb[] = [
        { name: 'legL', a: s.hipL, b: s.kneeL, r: rH * 1.0 },
        { name: 'shinL', a: s.kneeL, b: s.ankleL, r: rK * 0.55 },
        { name: 'legR', a: s.hipR, b: s.kneeR, r: rH * 1.0 },
        { name: 'shinR', a: s.kneeR, b: s.ankleR, r: rK * 0.55 },
        { name: 'footL', a: s.heelL, b: s.toeL, r: rA * 0.4 },
        { name: 'footR', a: s.heelR, b: s.toeR, r: rA * 0.4 },
        // her wings' bones (the feathers hung from them are her wings' own)
        { name: 'upperL', a: s.shoulderL, b: s.elbowL, r: r0 * 0.6 },
        { name: 'foreL', a: s.elbowL, b: s.handL, r: r1 * 0.55 },
        { name: 'upperR', a: s.shoulderR, b: s.elbowR, r: r0 * 0.6 },
        { name: 'foreR', a: s.elbowR, b: s.handR, r: r1 * 0.55 },
        { name: 'neck', a: s.neck, b: headOf(s), r: 6 },
      ];
      const chestC = chestOf(s);
      const top = add(chestC, mul(s.chest[2], CR[2] * 0.6));
      const up = norm(sub(top, s.pelvis), s.chest[2]);
      const lumps: CheckLump[] = [
        { name: 'body', c: lerp3(s.pelvis, top, 0.5), rot: s.chest, h: [CR[0] * 0.95, CR[1] * 0.8, Math.hypot(...sub(top, s.pelvis)) * 0.6] },
        { name: 'head', c: headOf(s), rot: s.face, h: [B.headR[0] * 1.3, B.headR[1] * 1.05, B.headR[2] * 0.95] },
      ];
      void up;
      return { limbs, lumps };
    },
    // (she rakes with her right foot's talons)
    tip: (move, _t, s) => (move === 'attack' ? s.toeR : move === 'dive' ? lerp3(s.toeL, s.toeR, 0.5) : move === 'gust' ? lerp3(s.handL, s.handR, 0.5) : null),
    low: { knee: B.legR[1], elbow: B.armR[1], hand: B.armR[2] },
    // her stand into each move and back; into her hop from her stand, and out of it where its round begins
    // (her stand: never out of the air), as the game's bosses stop (game/bosses.ts)
    handovers: [
      { from: 'stand', at: 0, to: 'walk', toAt: 0 },
      { from: 'walk', at: 0, to: 'stand', toAt: 0 },
      ...['attack', 'reel', 'gust', 'dive', 'call'].flatMap((m): Handover[] => [
        { from: 'stand', at: 0, to: m, toAt: 0 },
        { from: m, at: 'end', to: 'stand', toAt: 0 },
      ]),
    ],
  };
}
/** Her moves made so far: her stand, her hop, her talon rake, her flinch, her wing gust, her dive, her call, and her death (his pick: she topples off the edge). */
export const MADE = ['stand', 'walk', 'attack', 'reel', 'gust', 'dive', 'call', 'dying'];
