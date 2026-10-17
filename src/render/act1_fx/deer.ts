// ACT 1: THE TWISTED DEER (FLOOR 9): what it does to the floor and sends across it, drawn (render/act1_fx/types.ts).
// Its thorns are painted with it, in its own canvas (art/twisted_deer.ts); what is the game's is the warning of its
// stomp: as it gathers and rears, a ring of the enemy's fire on the floor round it, as far as its thorns hurt,
// brightening until they burst (the Headsman's sweep's ring, art/boss_shots.ts, in the game's style).

import { drawSweepRing } from '../../art/boss_shots';
import { DEER } from '../../game/act1_rules/deer';
import { TUNE } from '../../game/defs';
import type { Act1Fx } from './types';

const clamp01 = (v: number): number => (v < 0 ? 0 : v > 1 ? 1 : v);

export const FX: Act1Fx | null = {
  ground(c, m) {
    if (!m || !c.g || m.state !== 'act' || !m.act || m.act.id !== 'deer:stomp') return;
    const S = DEER.stomp;
    const T = m.act.t;
    if (T < S.warnFrom || T >= S.thorns) return;
    drawSweepRing(c.g, c.at, m.x, m.y, S.reach + TUNE.heroRadius * 0.5, clamp01((T - S.warnFrom) / (S.hit - S.warnFrom)), c.t);
  },
};
