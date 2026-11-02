// ACT 2, PART TWO, THE HIGH CITY: FLOOR 16: THE HUSHED GARDENERS: what they do to the floor, drawn (render/act1_fx/types.ts). The
// shears raised and glinting, their snap and the Hush leaving them are all in their own pictures (art/palace_hands_moves.ts).
// Only THE SHEARS' WARNING is drawn here: through the wind-up, from as the shears are lifted to the snap, the strip they will
// snap shut on (game/act1_rules/gardener.ts SNAP_STRIP) marked on the floor in the enemy's pink (render/act1_fx/garden_warn.ts).

import { PALACE, SNAP_STRIP } from '../../game/act1_rules/gardener';
import type { Strip } from '../../game/act1_rules/gardener';
import type { Monster } from '../../game/state';
import { drawStripWarn, warnK } from './garden_warn';
import { CLIP_CANVAS, GARDENER_HEDGE, LUNGE, LUNGE_HIT, clippingsPainted, snapAt } from '../../art/action_f16_gardener';
import { CLIP_PERIL } from '../../game/act1_rules/gardener';
import { liveFrom } from './live';
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

// THE SHEAR LUNGE (GARDENER_HEDGE: art/action_f16_gardener.ts, his pick of 2 Nov 2026): its lane marked before him from LUNGE.mark to the
// snap, and where the blades will shut, as his other warnings are (garden_warn.ts); the spray of cut grass where they shut, by halves
// among what stands (clippingsPainted, 'air').
const LUNGE_FX: Act1Fx = {
  ground(c, m) {
    if (!m || !c.g || !m.act || m.act.id !== 'gardener:lunge') return;
    const k = warnK(m.act.t, LUNGE.mark, LUNGE_HIT);
    if (k < 0) return;
    const w = { x: m.x, y: m.y, fx: m.fx, fy: m.fy, hand: m.act.hand };
    const [sx, sy] = snapAt();
    drawStripWarn(c.g, c.at, w, 0, LUNGE.lane, -LUNGE.half, LUNGE.half, k, c.t);
    drawStripWarn(c.g, c.at, w, sx - LUNGE.snap, sx + LUNGE.snap, sy - LUNGE.snap, sy + LUNGE.snap, k, c.t);
  },
  standing(c, m, p) {
    if (!p || p.a1 !== CLIP_PERIL) return;
    const C = CLIP_CANVAS;
    for (const side of ['behind', 'before'] as const) {
      const s = liveFrom(`gd:clip:${p.x.toFixed(3)}:${p.y.toFixed(3)}:${side}`, `${Math.floor(p.t * 30)}`, C.ax, C.ay, () => clippingsPainted(p.t, 'air', side, 0.75));
      if (!s) continue;
      const [sx, sy] = c.at(p.x, p.y);
      c.stand(p.x + p.y + (side === 'before' ? 0.05 : -0.05), s, sx, sy);
    }
  },
};

export const FX: Act1Fx | null = {
  ground(c, m, p) {
    if (GARDENER_HEDGE.on) return LUNGE_FX.ground!(c, m, p);
    palaceWarn(c, m, 'gardener:snap', SNAP_STRIP);
  },
  standing: (c, m, p) => LUNGE_FX.standing!(c, m, p),
};
