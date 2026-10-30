// ACT 2, PART TWO, THE HIGH CITY: FLOOR 16: THE PALACE GUARD: what they do to the floor, drawn (render/act1_fx/types.ts). Their
// weapons glinting through the wind-up, the thrust, the sweep, the march and their fall to one knee are all in their own
// pictures (art/palace_guard_moves.ts). Only THEIR WARNINGS are drawn here (render/act1_fx/garden_warn.ts), each by its own
// weapon's reach (game/act1_rules/pguard.ts, by their look): through THE LONG THRUST's wind-up, the long line it will be thrust
// along; through THE WIDE SWEEP's, the fan it will sweep round, until the blade comes down into it.

import { PGUARD, lookOf, sweepFan, thrustLine } from '../../game/act1_rules/pguard';
import { drawFanWarn, drawStripWarn, warnK } from './garden_warn';
import type { Act1Fx } from './types';

/** The warnings are laid from as the weapon begins to be brought down or heaved up until the blow. */
export const GUARD_WARN_FROM = 0.1;

export const FX: Act1Fx | null = {
  ground(c, m) {
    if (!m || !c.g || !m.act) return;
    const look = lookOf(m);
    const w = { x: m.x, y: m.y, fx: m.fx, fy: m.fy, hand: m.act.hand };
    if (m.act.id === 'pguard:thrust') {
      const k = warnK(m.act.t, GUARD_WARN_FROM, PGUARD.thrust.hit);
      if (k < 0) return;
      const L = thrustLine(look);
      drawStripWarn(c.g, c.at, w, L.from, L.to, L.left0, L.left1, k, c.t);
    } else if (m.act.id === 'pguard:sweep') {
      const F = sweepFan(look);
      const k = warnK(m.act.t, GUARD_WARN_FROM, F.t0);
      if (k < 0) return;
      drawFanWarn(c.g, c.at, w, F.b0, F.b1, F.r, k, c.t);
    }
  },
};
