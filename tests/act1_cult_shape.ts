// THE CHANTER AND THE FIREPOT THROWER AS THE BOSS REVIEW SEES THEM (art/boss_checks.ts): their outsides as
// solids, the end each strikes with, what each carries, and how their moves hand over. Here and not in
// src/art/act1_cultists.ts: the game's own tests keep figures from importing the checks (tests/bosses.test.ts, 12).

import type { BossShape, CheckLimb, CheckLump, Handover } from '../src/art/boss_checks';
import { BOOK, CHANTER_BODY, POTS_BODY, bookOf } from '../src/art/act1_cultists';
import { add, lerp3, mul } from '../src/art/skeleton';
import type { Build, Skeleton } from '../src/art/skeleton';

function bodyOf(B: Build) {
  return (s: Skeleton) => {
    const limbs: CheckLimb[] = [
      { name: 'legL', a: s.hipL, b: s.kneeL, r: 1.8 },
      { name: 'shinL', a: s.kneeL, b: s.ankleL, r: 1.3 },
      { name: 'legR', a: s.hipR, b: s.kneeR, r: 1.8 },
      { name: 'shinR', a: s.kneeR, b: s.ankleR, r: 1.3 },
      { name: 'footL', a: s.heelL, b: s.toeL, r: 0.9 },
      { name: 'footR', a: s.heelR, b: s.toeR, r: 0.9 },
      { name: 'upperL', a: s.shoulderL, b: s.elbowL, r: 2.2 },
      { name: 'foreL', a: s.elbowL, b: s.handL, r: 1.0 },
      { name: 'upperR', a: s.shoulderR, b: s.elbowR, r: 2.2 },
      { name: 'foreR', a: s.elbowR, b: s.handR, r: 1.0 },
    ];
    const [cf, , cu] = s.chest;
    const lumps: CheckLump[] = [
      { name: 'chest', c: add(s.ribs, mul(cu, 1)), rot: s.chest, h: [B.ribDeep + 1.6, B.ribHalf + 1.6, B.chest * 0.5] },
      { name: 'belly', c: lerp3(s.waist, s.ribs, 0.4), rot: s.belly, h: [B.waistDeep + 1.2, B.waistHalf + 1.2, B.ribs * 0.7] },
      { name: 'head', c: add(s.head, mul(cf, 0.5)), rot: s.face, h: [5.0, 4.4, 5.2] },
    ];
    return { limbs, lumps };
  };
}
const turns = (moves: string[]): Handover[] => moves.flatMap((m): Handover[] => [{ from: 'stand', at: 0, to: m, toAt: 0 }, { from: m, at: 'end', to: 'stand', toAt: 0 }]);

export function chanterShape(): BossShape {
  return {
    body: bodyOf(CHANTER_BODY),
    tip: (move, _t, s) => (move === 'attack' ? lerp3(s.handL, s.handR, 0.5) : null),
    // (the book in its hands: its middle, as big as it is)
    things: (move, _t, s) => (move === 'dying' ? [] : [{ name: 'the book', pts: [bookOf(s).c], r: BOOK.thick + 0.6, may: ['foreL', 'foreR'] }]),
    low: { knee: 1.3, elbow: 1.0, hand: 1.0 },
    handovers: [{ from: 'stand', at: 0, to: 'walk', toAt: 0 }, { from: 'walk', at: 0, to: 'stand', toAt: 0 }, ...turns(['attack', 'reel']), { from: 'stand', at: 0, to: 'dying', toAt: 0 }],
  };
}
export function potsShape(): BossShape {
  return {
    body: bodyOf(POTS_BODY),
    tip: (move, _t, s) => (move === 'attack' ? s.handR : null),
    things: () => [],
    low: { knee: 1.3, elbow: 1.0, hand: 1.0 },
    handovers: [{ from: 'stand', at: 0, to: 'walk', toAt: 0 }, { from: 'walk', at: 0, to: 'stand', toAt: 0 }, ...turns(['attack', 'reel']), { from: 'stand', at: 0, to: 'dying', toAt: 0 }],
  };
}
export const CULT_MOVES = ['stand', 'walk', 'attack', 'reel', 'dying'];

