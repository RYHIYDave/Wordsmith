// ACT 2, PART TWO, THE HIGH CITY: FLOOR 16: THE SWANS: what they do to the floor, drawn (render/act1_fx/types.ts). Their crouch and
// hiss, the lunge and bite, the charge and their burst of feathers as they die are all in their own pictures (art/garden_swans.ts).
// Only THE BITE'S WARNING is drawn here: through its wind-up, from the crouch to the bill shutting, the strip it will strike
// (game/act1_rules/swan.ts SWAN.bite) marked on the floor in the enemy's pink (render/act1_fx/garden_warn.ts).

import { BITE_REACH, SWAN } from '../../game/act1_rules/swan';
import { drawStripWarn, warnK } from './garden_warn';
import type { Act1Fx } from './types';

/** The warning is laid from a little into the bite (as it begins to crouch) until its blow. */
export const SWAN_WARN_FROM = 0.08;

export const FX: Act1Fx | null = {
  ground(c, m) {
    if (!m || !c.g || !m.act || m.act.id !== 'swan:bite') return;
    const B = SWAN.bite;
    const k = warnK(m.act.t, SWAN_WARN_FROM, B.hit);
    if (k < 0) return;
    drawStripWarn(c.g, c.at, { x: m.x, y: m.y, fx: m.fx, fy: m.fy, hand: m.act.hand }, B.from, BITE_REACH, -B.half, B.half, k, c.t);
  },
};
