// ACT 1: THE CANYON SCORPIONS (FLOOR 8): what it does to the floor and sends across it, drawn (render/act1_fx/types.ts).
// Its tail strike's jet of venom and its splash are painted in its own picture (art/canyon_scorpions.ts); what is drawn
// here is the warning of it: from as its tail is drawn back until its venom comes down, a ring on the floor where it will
// burst, in the game's way of warning of a blow that comes down on a place (art/boss_shots.ts drawSweepRing: the enemy's
// pink and gold).

import { drawSweepRing } from '../../art/boss_shots';
import { SCORPION, venomAt } from '../../game/act1_rules/scorpion';
import type { Act1Fx } from './types';

export const FX: Act1Fx | null = {
  ground(c, m) {
    if (!m || !c.g || !m.act || m.act.id !== 'scorpion:sting') return;
    const S = SCORPION.sting;
    const t = m.act.t;
    if (t < S.warnFrom || t >= S.burst) return;
    const p = venomAt(m);
    drawSweepRing(c.g, c.at, p.x, p.y, S.r, (t - S.warnFrom) / (S.burst - S.warnFrom), c.t);
  },
};
