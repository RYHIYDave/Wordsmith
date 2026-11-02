// ACT 2, THE HUSH: FLOOR 11: THE HUSHED WATCH: what they do to the floor, drawn (render/act1_fx/types.ts). Their sweep is all
// in their own pictures (art/hushed_watch_moves.ts). THE ROUND SWEEP (their second move, the art chat's, Version 23.2): through
// its warning the art's ring of pink all round them as far as the halberd reaches (art/watch_shots.ts drawRoundWarn), and as
// the blade comes round, the dust whipped up in its wake and its streak of pink (drawRoundWake), from where they stand, as
// they began facing (game/act1_rules/watch.ts: nothing turns or moves them in it). On the floor, under what stands.

import { ROUND_DUST_FOR, ROUND_WAKE, drawRoundWake, drawRoundWarn } from '../../art/watch_shots';
import { ROUND } from '../../game/act1_rules/watch';
import { BITE_CANVAS, FLY_CANVAS, OIL_CANVAS, POOL, SHADOW_CANVAS, WATCH_LANTERN, bitePainted, lanternFlying, lanternShadow, oilPainted } from '../../art/action_f11_watch';
import { markRing } from '../../art/action_f6_fx';
import { oilFrame, oilSprite } from '../../art/act1_figs/watch';
import type { ThingsFilm } from '../../art/films';
import { toSprite } from '../../art/kit';
import { drawLights, drawSprite } from '../../engine/px';
import type { Sprite } from '../../engine/px';
import { BITE_PERIL, LANTERN_PERIL, lanternAt } from '../../game/act1_rules/watch';
import type { Peril } from '../../game/state';
import { livePicture, liveFrom } from './live';
import type { Act1FxCtx } from './types';
import type { Act1Fx } from './types';

const OLD: Act1Fx = {
  ground(c, m) {
    if (!m || !c.g || !m.act || m.act.id !== 'watch:round') return;
    const t = m.act.t;
    if (t >= ROUND.warn[0] && t < ROUND.hit) drawRoundWarn(c.g, c.at, m.x, m.y, Math.min(1, (t - ROUND.warn[0]) / (ROUND.hit - ROUND.warn[0])), c.t);
    if (t >= ROUND_WAKE[0] && t < ROUND_WAKE[1] + ROUND_DUST_FOR) drawRoundWake(c.g, mirrorFor(c.at, m, m.act.hand), m.x, m.y, m.fx, m.fy, t);
  },
};

/**
 * The floor as the art's wake is drawn on, for one drawn with `hand`: as it is for one drawn as the art made it; for one drawn
 * the other way round (-1), the halberd in the other hands and spinning the other way (game/act1_rules/watch.ts goes by the
 * figure's own left, R.rel), the floor turned over about the way they face, so that the wake follows the blade round.
 */
export function mirrorFor(
  at: (x: number, y: number) => readonly [number, number],
  m: { x: number; y: number; fx: number; fy: number },
  hand: number,
): (x: number, y: number) => readonly [number, number] {
  if (hand >= 0) return at;
  const l = Math.hypot(m.fx, m.fy) || 1;
  const ux = m.fx / l;
  const uy = m.fy / l;
  return (x, y) => {
    const dx = x - m.x;
    const dy = y - m.y;
    const d = dx * ux + dy * uy;
    return at(m.x + 2 * d * ux - dx, m.y + 2 * d * uy - dy);
  };
}

// THE CHOP AND THE LANTERN (WATCH_LANTERN: art/action_f11_watch.ts, his yes, 2 Nov 2026): where the chop bites, the floor split on
// along his way and the grit and sparks thrown up ('floor', and 'air' by halves); the lantern lobbed, its shadow under it and where it
// will smash marked, filling as it comes; its smash ('air', by halves) and the oil burning on the floor (its frames painted ahead:
// art/films.ts things:watch; until they are, here as each is first wanted).
const OIL_THINGS = 'things:watch';
const oilOwn = new Map<number, Sprite>();
function oil(c: Act1FxCtx, i: number): Sprite {
  const made = c.film ? c.film<ThingsFilm>(OIL_THINGS) : null;
  const s = made?.oil?.[i];
  if (s) return s;
  let o = oilOwn.get(i);
  if (!o) oilOwn.set(i, (o = oilSprite(i)));
  return o;
}
const SHADOWS = new Map<number, Sprite>();
const keyOf = (p: Peril): string => `${p.a1}:${p.x.toFixed(3)}:${p.y.toFixed(3)}`;
function halves(c: Act1FxCtx, p: Peril, key: string, f: string, ax: number, ay: number, paint: (side: 'behind' | 'before') => { px: import('../../engine/px').Px; lights: import('../../engine/px').Light[] }): void {
  const [sx, sy] = c.at(p.x, p.y);
  for (const side of ['behind', 'before'] as const) {
    const s = liveFrom(`${key}:${side}`, f, ax, ay, () => paint(side));
    if (s) c.stand(p.x + p.y + (side === 'before' ? 0.03 : -0.03), s, sx, sy);
  }
}
const LANTERN_FX: Act1Fx = {
  films: [OIL_THINGS],
  ground(c, m, p) {
    if (!p || !c.g) return;
    const g = c.g;
    const [lx, ly] = c.at(p.x, p.y);
    if (p.a1 === BITE_PERIL) {
      const s = liveFrom(`${keyOf(p)}:floor`, `${Math.floor(p.t * 10)}`, BITE_CANVAS.ax, BITE_CANVAS.ay, () => bitePainted(p.t, 'floor', p.fx, p.fy));
      if (s) drawSprite(g, s, lx, ly);
      return;
    }
    if (p.a1 !== LANTERN_PERIL) return;
    if (p.t < p.hit) {
      // (where it will smash marked, filling as it comes; its shadow under it)
      const k = Math.max(0, Math.min(1, p.t / p.hit));
      const C = OIL_CANVAS;
      const mark = livePicture(`${keyOf(p)}:mark`, C.w, C.h, C.ax, C.ay, `${Math.floor(k * 24)}`, (px) => markRing(px, C.ax, C.ay, POOL.burst, k));
      if (mark) drawSprite(g, mark, lx, ly);
      const w = lanternAt(p);
      const [sx, sy] = c.at(w.x, w.y);
      const q = Math.round(k * 20);
      let sh = SHADOWS.get(q);
      if (!sh) SHADOWS.set(q, (sh = toSprite({ px: lanternShadow(q / 20), lights: [] }, null, SHADOW_CANVAS.ax, SHADOW_CANVAS.ay)));
      drawSprite(g, sh, sx, sy);
      return;
    }
    const i = oilFrame(p.t - p.hit);
    if (i < 0) return;
    const s = oil(c, i);
    drawSprite(g, s, lx, ly);
    drawLights(g, s, Math.round(lx), Math.round(ly), 1, 1);
    c.spot(lx, ly - 4, 44, 0.6);
  },
  standing(c, m, p) {
    if (!p) return;
    if (p.a1 === BITE_PERIL) {
      if (p.t > 1.0) return;
      halves(c, p, keyOf(p), `${Math.floor(p.t * 30)}`, BITE_CANVAS.ax, BITE_CANVAS.ay, (side) => bitePainted(p.t, 'air', p.fx, p.fy, side));
      return;
    }
    if (p.a1 !== LANTERN_PERIL) return;
    if (p.t < p.hit) {
      const w = lanternAt(p);
      const s = liveFrom(`${keyOf(p)}:fly`, `${Math.floor(p.t * 30)}`, FLY_CANVAS.ax, FLY_CANVAS.ay, () => lanternFlying(p.t));
      const [sx, sy] = c.at(w.x, w.y);
      if (s) c.stand(w.x + w.y, s, sx, sy - w.z);
      c.spot(sx, sy - w.z, 12, 0.5);
      return;
    }
    const t = p.t - p.hit;
    if (t > POOL.smash) return;
    halves(c, p, keyOf(p), `${Math.floor(t * 30)}`, OIL_CANVAS.ax, OIL_CANVAS.ay, (side) => oilPainted(t, 'air', side));
  },
};

export const FX: Act1Fx | null = {
  get films() {
    return WATCH_LANTERN.on ? LANTERN_FX.films : undefined;
  },
  ground: (c, m, p) => (WATCH_LANTERN.on ? LANTERN_FX : OLD).ground!(c, m, p),
  standing: (c, m, p) => (WATCH_LANTERN.on ? LANTERN_FX.standing!(c, m, p) : undefined),
};
