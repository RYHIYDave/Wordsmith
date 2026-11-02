// ACT 2, THE HUSH: FLOOR 14: THE ORDERLIES: what they do to the floor, drawn (render/act1_fx/types.ts), from the art chat's
// (art/orderlies.ts, orderlies_moves.ts, orderly_shots.ts), where their rules (game/act1_rules/orderly.ts) have it: the
// mallet's blow is all in their own pictures (raised, brought down, the dust and splinters thrown up where it goes in); its
// MARK ON THE FLOOR where it went in (`orderly:slam`): the art's drawMalletSlam, a ring of dust rolling out, splinters, a
// star of cracks in the boards fading. THE QUAKE (their second move, Version 23.2): through its warning the art's ring of
// pink where the mallet will come down (drawQuakeWarn); where it went in (`orderly:quake`), the floor shaken out round it
// and its cracks (drawQuake). On the floor, under what stands. Nothing in it glows.

import { drawMalletSlam, drawQuake, drawQuakeWarn } from '../../art/orderly_shots';
import { ORDERLY, quakeSpot } from '../../game/act1_rules/orderly';
import { CRASH_CANVAS, GURNEY, ORDERLY_GURNEY, crashPainted } from '../../art/action_f11_orderly';
import { lanePainted } from '../../art/action_f6_golem';
import { gurneyFrame, gurneySprite } from '../../art/act1_figs/orderly';
import type { ThingsFilm } from '../../art/films';
import { toSprite } from '../../art/kit';
import { drawSprite, flipSprite } from '../../engine/px';
import type { Sprite } from '../../engine/px';
import { GURNEY_PERIL, gurneyDown } from '../../game/act1_rules/orderly';
import { backView, flipped } from '../../game/facing';
import { liveFrom } from './live';
import type { Act1FxCtx } from './types';
import type { Act1Fx } from './types';

const OLD: Act1Fx = {
  ground(c, m, p) {
    if (!c.g) return;
    if (m && m.act && m.act.id === 'orderly:quake') {
      const Q = ORDERLY.quake;
      const t = m.act.t;
      if (t < Q.warn[0] || t >= Q.floor) return;
      const s = quakeSpot(m, m.act.hand);
      drawQuakeWarn(c.g, c.at, s.x, s.y, Math.min(1, (t - Q.warn[0]) / (Q.floor - Q.warn[0])));
      return;
    }
    if (!p) return;
    if (p.a1 === 'orderly:slam') drawMalletSlam(c.g, c.at, p.x, p.y, p.t);
    else if (p.a1 === 'orderly:quake') drawQuake(c.g, c.at, p.x, p.y, p.t);
  },
};

// THE GURNEY CHARGE (ORDERLY_GURNEY: art/action_f11_orderly.ts, his yes, 2 Nov 2026): its lane marked from him through where the hero
// stood (the golem's lane, art/action_f6_golem.ts lanePainted, at its own length and width), broken up behind it as it careers on; the
// gurney standing before him, careering down the lane, crashed (painted ahead: art/films.ts things:orderly), seen as he faces, turned
// over as he is; where it crashes, its ring of dust ('floor') and what is flung ('air', by halves). The mallet's mark as before.
const THINGS = 'things:orderly';
const own = new Map<string, Sprite>();
function gurney(c: Act1FxCtx, view: 'front' | 'back', flip: boolean, i: number): Sprite {
  const key = `gurney:${view}`;
  const made = c.film ? c.film<ThingsFilm>(THINGS) : null;
  let s = made?.[key]?.[i];
  const from = s ? 'film' : 'own';
  if (!s) {
    s = own.get(`${key}:${i}`);
    if (!s) own.set(`${key}:${i}`, (s = gurneySprite(i, view)));
  }
  if (!flip) return s;
  const fk = `flip:${key}:${i}:${from}`;
  let f = own.get(fk);
  if (!f) own.set(fk, (f = flipSprite(s)));
  return f;
}
const GURNEY_FX: Act1Fx = {
  films: [THINGS],
  ground(c, m, p) {
    if (!p || p.a1 !== GURNEY_PERIL) return OLD.ground!(c, m, p);
    if (!c.g) return;
    if (p.hit >= 1e9) {
      // (its lane, laid out as it is aimed, broken up behind it)
      const k = Math.min(1, (p.t + (GURNEY.hit - GURNEY.aim)) / 0.3);
      const L = lanePainted(p.fx, p.fy, k, p.t > 0 ? GURNEY.at + gurneyDown(p) : 0, GURNEY.at + p.d + GURNEY.long / 2, GURNEY.half);
      const s = toSprite({ px: L.px, lights: [] }, null, L.ax, L.ay);
      const [sx, sy] = c.at(p.x, p.y);
      drawSprite(c.g, s, sx, sy);
      return;
    }
    const t = p.t - p.hit;
    const s = liveFrom(`og:${p.b.toFixed(3)}:${p.c.toFixed(3)}:floor`, `${Math.floor(t * 30)}`, CRASH_CANVAS.ax, CRASH_CANVAS.ay, () => crashPainted(t, 'floor'));
    const [sx, sy] = c.at(p.b, p.c);
    if (s) drawSprite(c.g, s, sx, sy);
  },
  standing(c, m, p) {
    if (!p || p.a1 !== GURNEY_PERIL) return;
    const view = backView(p.fx, p.fy) ? 'back' : 'front';
    const flip = flipped(p.fx, p.fy);
    const crashed = p.hit < 1e9;
    const d = crashed ? Math.hypot(p.b - p.x, p.c - p.y) - GURNEY.at : gurneyDown(p);
    const x = p.x + p.fx * (GURNEY.at + d);
    const y = p.y + p.fy * (GURNEY.at + d);
    const [sx, sy] = c.at(x, y);
    c.stand(x + y, gurney(c, view, flip, gurneyFrame(crashed ? p.hit : p.t, crashed ? p.t - p.hit : -1)), sx, sy);
    if (!crashed) return;
    const t = p.t - p.hit;
    if (t > 1.0) return;
    for (const side of ['behind', 'before'] as const) {
      const a = liveFrom(`og:${p.b.toFixed(3)}:${p.c.toFixed(3)}:${side}`, `${Math.floor(t * 30)}`, CRASH_CANVAS.ax, CRASH_CANVAS.ay, () => crashPainted(t, 'air', side));
      if (a) c.stand(p.b + p.c + (side === 'before' ? 0.05 : -0.05), a, sx, sy);
    }
  },
};

export const FX: Act1Fx | null = {
  get films() {
    return ORDERLY_GURNEY.on ? GURNEY_FX.films : undefined;
  },
  ground: (c, m, p) => (ORDERLY_GURNEY.on ? GURNEY_FX : OLD).ground!(c, m, p),
  standing: (c, m, p) => (ORDERLY_GURNEY.on ? GURNEY_FX.standing!(c, m, p) : undefined),
};
