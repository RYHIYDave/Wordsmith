// ACT 2, PART TWO, THE HIGH CITY: FLOOR 16: THE PALACE GUARD: what they do to the floor, drawn (render/act1_fx/types.ts). Their
// weapons glinting through the wind-up, the thrust, the sweep, the march and their fall to one knee are all in their own
// pictures (art/palace_guard_moves.ts). Only THEIR WARNINGS are drawn here (render/act1_fx/garden_warn.ts), each by its own
// weapon's reach (game/act1_rules/pguard.ts, by their look): through THE LONG THRUST's wind-up, the long line it will be thrust
// along; through THE WIDE SWEEP's, the fan it will sweep round, until the blade comes down into it.

import { PGUARD, lookOf, sweepFan, thrustLine } from '../../game/act1_rules/pguard';
import { drawFanWarn, drawStripWarn, warnK } from './garden_warn';
import type { Act1Fx } from './types';
import { FLIGHT_CANVAS, GUARD_DRILL, JAV, STUCK_CANVAS, THRUST9, THRUST9_HIT, javAt, spearFlying, spearStuck } from '../../art/action_f16_guard';
import { CLIP_CANVAS, clippingsPainted } from '../../art/action_f16_gardener';
import { JAV_PERIL, thrust9Strikes } from '../../game/act1_rules/pguard';
import { backView, flipped } from '../../game/facing';
import { drawSprite } from '../../engine/px';
import type { Peril } from '../../game/state';
import { liveFrom, liveTurned } from './live';

/** The warnings are laid from as the weapon begins to be brought down or heaved up until the blow. */
export const GUARD_WARN_FROM = 0.1;

const OLD: Act1Fx = {
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

// THE JAVELIN, AND THE LONG THRUST BY MOVEMENT 9 (GUARD_DRILL: art/action_f16_guard.ts, his pick of 2 Nov 2026): the thrust's line marked
// through its hold, as before (its own length now); through the javelin's hold, where the hero stands marked, a ring of JAV.r round him;
// the weapon flying (spearFlying), stuck quivering, then standing (spearStuck), seen as the guard faced as he threw it, turned over
// as he was; the burst of turf where it sticks (the gardener's cut grass, art/action_f16_gardener.ts clippingsPainted).
const viewOf = (p: { fx: number; fy: number }): 'front' | 'back' => (backView(p.fx, p.fy) ? 'back' : 'front');
const JAV_FX: Act1Fx = {
  ground(c, m, p) {
    if (!c.g) return;
    if (m) {
      const act = m.act;
      if (!act || m.state !== 'act') return;
      const w = { x: m.x, y: m.y, fx: m.fx, fy: m.fy, hand: act.hand };
      if (act.id === 'pguard:thrust') {
        const k = warnK(act.t, GUARD_WARN_FROM, THRUST9_HIT);
        if (k < 0) return;
        // (its line: from THRUST9.from to as far as it strikes)
        let to = 1;
        while (to < 6 && thrust9Strikes(m.form ?? 0, to + 0.05, 0)) to += 0.05;
        drawStripWarn(c.g, c.at, w, THRUST9.from, to, -THRUST9.half, THRUST9.half, k, c.t);
      } else if (act.id === 'pguard:javelin' || act.id === 'pguard:javelin2') {
        const hit = act.id === 'pguard:javelin' ? JAV.partisan.hit : JAV.sword.hit;
        const k = warnK(act.t, JAV.mark, hit);
        if (k < 0) return;
        const h = c.game.hero;
        drawFanWarn(c.g, c.at, { x: h.x, y: h.y, fx: 1, fy: 0, hand: 1 }, -Math.PI, Math.PI, JAV.r, k, c.t);
      }
      return;
    }
    if (!p || p.a1 !== JAV_PERIL || p.t < p.hit) return;
    const u = p.t - p.hit;
    const C = CLIP_CANVAS;
    const s = liveFrom(`pg:turf:${p.x.toFixed(3)}:${p.y.toFixed(3)}`, `${Math.floor(Math.min(u, 1.85) * 30)}`, C.ax, C.ay, () => clippingsPainted(u, 'floor', 'all', 1));
    const [sx, sy] = c.at(p.x, p.y);
    if (s) drawSprite(c.g, s, sx, sy);
  },
  standing(c, m, p) {
    if (!p || p.a1 !== JAV_PERIL) return;
    const who = p.b === 0 ? 'partisan' : 'sword';
    const view = viewOf(p);
    const flip = flipped(p.fx, p.fy);
    if (p.t < p.hit) {
      // IN FLIGHT, from his hand to where it sticks
      const j = javAt(who, p.t, p.c);
      const C = FLIGHT_CANVAS;
      const s = liveTurned(`pg:fly:${p.x.toFixed(3)}:${p.y.toFixed(3)}`, `${Math.floor(p.t * 30)}`, C.w, C.ax, C.ay, flip, () => spearFlying(who, p.t, p.c, view));
      if (!s) return;
      const x = p.x - p.fx * (p.c - j.x);
      const y = p.y - p.fy * (p.c - j.x);
      const [sx, sy] = c.at(x, y);
      // (its height is in its picture: painted at it over the picture's floor point)
      c.stand(x + y, s, sx, sy);
      return;
    }
    const u = p.t - p.hit;
    // STUCK, quivering, then still; the turf flung up round it
    const C = STUCK_CANVAS;
    const s = liveTurned(`pg:stuck:${p.x.toFixed(3)}:${p.y.toFixed(3)}`, `${Math.floor(Math.min(u, JAV.quiver + 0.05) * 30)}`, C.w, C.ax, C.ay, flip, () => spearStuck(who, u, view));
    const [sx, sy] = c.at(p.x, p.y);
    if (s) c.stand(p.x + p.y, s, sx, sy);
    if (u < 1.5) {
      const K = CLIP_CANVAS;
      for (const side of ['behind', 'before'] as const) {
        const a = liveFrom(`pg:turf:${p.x.toFixed(3)}:${p.y.toFixed(3)}:${side}`, `${Math.floor(u * 30)}`, K.ax, K.ay, () => clippingsPainted(u, 'air', side, 1));
        if (a) c.stand(p.x + p.y + (side === 'before' ? 0.05 : -0.05), a, sx, sy);
      }
    }
  },
};
void (null as unknown as Peril);

export const FX: Act1Fx | null = {
  ground: (c, m, p) => (GUARD_DRILL.on ? JAV_FX.ground!(c, m, p) : OLD.ground!(c, m, p)),
  standing: (c, m, p) => JAV_FX.standing!(c, m, p),
};
