// ACT 2, PART TWO, THE HIGH CITY: FLOOR 16: THE HUSHED GARDENERS: what they do to the floor, drawn (render/act1_fx/types.ts). The
// shears raised and glinting, their snap and the Hush leaving them are all in their own pictures (art/palace_hands_moves.ts).
// Only THE SHEARS' WARNING is drawn here: through the wind-up, from as the shears are lifted to the snap, the strip they will
// snap shut on (game/act1_rules/gardener.ts SNAP_STRIP) marked on the floor in the enemy's pink (render/act1_fx/garden_warn.ts).

import { PALACE, SNAP_STRIP } from '../../game/act1_rules/gardener';
import type { Strip } from '../../game/act1_rules/gardener';
import type { Monster } from '../../game/state';
import { drawStripWarn, warnK } from './garden_warn';
import type { Act1Fx, Act1FxCtx } from './types';

/** The warning is laid from as the tool begins to be lifted or drawn back until the blow. */
export const PALACE_WARN_FROM = 0.1;

/** One of the gardeners or the grooms winding up act `id`: its strip `s` marked on the floor. */
export function palaceWarn(c: Act1FxCtx, m: Monster | null, id: string, s: Strip): void {
  if (!m || !c.g || !m.act || m.act.id !== id) return;
  const k = warnK(m.act.t, PALACE_WARN_FROM, PALACE.blow.hit);
  if (k < 0) return;
  drawStripWarn(c.g, c.at, { x: m.x, y: m.y, fx: m.fx, fy: m.fy, hand: m.act.hand }, s.from, s.to, s.left0, s.left1, k, c.t);
}

export const FX: Act1Fx | null = {
  ground(c, m) {
    palaceWarn(c, m, 'gardener:snap', SNAP_STRIP);
  },
};
