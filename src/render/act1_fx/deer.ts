// ACT 1: THE TWISTED DEER (FLOOR 9): what it does to the floor and sends across it, drawn (render/act1_fx/types.ts).
// Its thorns are painted with it, in its own canvas (art/twisted_deer.ts); what is the game's is the warning of its
// stomp: as it gathers and rears, a ring of the enemy's fire on the floor round it, as far as its thorns hurt,
// brightening until they burst (the Headsman's sweep's ring, art/boss_shots.ts, in the game's style).
//
// ITS BRAMBLE CHARGE (DEER_BRAMBLE: art/action_f9_pinewood.ts, his yes, with his fix of 2 Nov 2026), in place of the stomp: the
// lane marked on the floor from where it stood through where he stood (the golem's lane, art/action_f6_golem.ts lanePainted, at the
// charge's own length and width), laid out as it is aimed and broken up behind it as it runs; and behind it the hedge of living
// bramble, each clump bursting up as its hind feet pass, standing, writhing, withering: each clump's moments painted ahead (art/
// films.ts things:deer) or, until they are, painted here as each is first wanted and kept; the torn earth at its foot on the floor,
// the bramble among the figures at its foot. Seen from behind when the hedge runs up the screen, turned over when it runs to the
// left, as the deer is.

import { drawSweepRing } from '../../art/boss_shots';
import { CHARGE, CHARGE_CARRIED, DEER_BRAMBLE, HEDGE_AT, chargeCarry } from '../../art/action_f9_pinewood';
import { lanePainted } from '../../art/action_f6_golem';
import { clumpFrame, clumpSprite } from '../../art/act1_figs/deer';
import type { ThingsFilm } from '../../art/films';
import { toSprite } from '../../art/kit';
import type { GameView } from '../../art/skin';
import { drawSprite, flipSprite } from '../../engine/px';
import type { Sprite } from '../../engine/px';
import { CHARGE_PERIL, DEER, hedgeTo } from '../../game/act1_rules/deer';
import { TUNE } from '../../game/defs';
import { backView, flipped } from '../../game/facing';
import type { Peril } from '../../game/state';
import type { Act1Fx, Act1FxCtx } from './types';

const clamp01 = (v: number): number => (v < 0 ? 0 : v > 1 ? 1 : v);
const THINGS = 'things:deer';

/** Clump frames painted here before the painter's are in (by view, clump, layer and frame), and turned over. */
const own = new Map<string, Sprite>();
function clump(c: Act1FxCtx, view: GameView, flip: boolean, j: number, i: number, layer: 'air' | 'floor'): Sprite {
  const key = `${layer}:${view}:${j}`;
  const made = c.film ? c.film<ThingsFilm>(THINGS) : null;
  const list = made?.[key];
  let s = list ? list[layer === 'floor' ? 0 : i] : undefined;
  if (!s) {
    const k = `${key}:${i}`;
    s = own.get(k);
    if (!s) own.set(k, (s = clumpSprite(j, i, view, layer)));
  }
  if (!flip) return s;
  const fk = `flip:${key}:${layer === 'floor' ? 0 : i}:${list ? 'film' : 'own'}`;
  let f = own.get(fk);
  if (!f) own.set(fk, (f = flipSprite(s)));
  return f;
}
/** Each clump of the hedge standing now: where it is, and its frame. */
function clumpsOf(p: Peril): { j: number; i: number; x: number; y: number }[] {
  const out: { j: number; i: number; x: number; y: number }[] = [];
  const up = hedgeTo(p.d);
  for (let j = 0; j < up.length; j++) {
    const i = clumpFrame(j, p.t);
    if (i < 0) continue;
    out.push({ j, i, x: p.x + p.fx * HEDGE_AT[j], y: p.y + p.fy * HEDGE_AT[j] });
  }
  return out;
}

const STOMP: Act1Fx = {
  ground(c, m) {
    if (!m || !c.g || m.state !== 'act' || !m.act || m.act.id !== 'deer:stomp') return;
    const S = DEER.stomp;
    const T = m.act.t;
    if (T < S.warnFrom || T >= S.thorns) return;
    drawSweepRing(c.g, c.at, m.x, m.y, S.reach + TUNE.heroRadius * 0.5, clamp01((T - S.warnFrom) / (S.hit - S.warnFrom)), c.t);
  },
};

const BRAMBLE: Act1Fx = {
  films: [THINGS],
  ground(c, m, p) {
    if (!p || p.a1 !== CHARGE_PERIL || !c.g) return;
    const g = c.g;
    if (p.t < CHARGE.until) {
      // (its lane, laid out as it is aimed, broken up behind it as it runs)
      const k = clamp01((p.t - CHARGE.aim) / 0.3);
      const long = p.d >= CHARGE_CARRIED - 0.01 ? CHARGE.lane : p.d + 0.6;
      const L = lanePainted(p.fx, p.fy, k, Math.min(chargeCarry(p.t), p.d), long, CHARGE.half);
      const s = toSprite({ px: L.px, lights: [] }, null, L.ax, L.ay);
      const [sx, sy] = c.at(p.x, p.y);
      drawSprite(g, s, sx, sy);
    }
    // (the torn earth at each clump's foot)
    const view: GameView = backView(p.fx, p.fy) ? 'back' : 'front';
    const flip = flipped(p.fx, p.fy);
    for (const q of clumpsOf(p)) {
      const [sx, sy] = c.at(q.x, q.y);
      drawSprite(g, clump(c, view, flip, q.j, q.i, 'floor'), sx, sy);
    }
  },
  standing(c, m, p) {
    if (!p || p.a1 !== CHARGE_PERIL) return;
    const view: GameView = backView(p.fx, p.fy) ? 'back' : 'front';
    const flip = flipped(p.fx, p.fy);
    for (const q of clumpsOf(p)) {
      const [sx, sy] = c.at(q.x, q.y);
      c.stand(q.x + q.y, clump(c, view, flip, q.j, q.i, 'air'), sx, sy);
    }
  },
};

export const FX: Act1Fx | null = {
  get films() {
    return DEER_BRAMBLE.on ? BRAMBLE.films : undefined;
  },
  ground: (c, m, p) => (DEER_BRAMBLE.on ? BRAMBLE : STOMP).ground!(c, m, p),
  standing: (c, m, p) => (DEER_BRAMBLE.on ? BRAMBLE.standing!(c, m, p) : undefined),
};
