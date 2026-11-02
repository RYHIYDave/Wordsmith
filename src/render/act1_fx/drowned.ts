// ACT 1: THE DROWNED (FLOOR 10): what it does to the floor and sends across it, drawn (render/act1_fx/types.ts).
// Nothing beyond its figure but this: while it lies under the water, not yet risen, nothing of it is seen: not its
// shadow, a pack's ring, its bar or its name (`hidden`); and its picture is its rise's first (all of it under the
// water), not its stand. As it wakes it rises, and is seen as its rise brings it up.
//
// ITS BOG RETCH AND FROST GRAB (DROWNED_RETCH: art/action_f9_fen.ts, his yes, 2 Nov 2026): the cone marked before it, the gush of
// black bog water thrown over it ('behind' and 'before' it, among the figures), the slick lying (its frames painted ahead: art/
// films.ts things:drowned; until they are, painted here as each is first wanted), each from in front or behind as the Drowned is,
// turned over when it faces left; where its hands close, the rime racing out over the floor, and round the feet of a hero it froze,
// the ice shot up, standing while he is held, shattering as he is let go.

import type { GameView } from '../../art/skin';
import { DROWNED_RETCH, RIME_CANVAS, SLICK_CANVAS, gushPainted, rimePainted } from '../../art/action_f9_fen';
import { slickFrame, slickSprite } from '../../art/act1_figs/drowned';
import type { ThingsFilm } from '../../art/films';
import { clipFrame } from '../figure';
import { drawLights, drawSprite, flipSprite } from '../../engine/px';
import type { Sprite } from '../../engine/px';
import { RIME_PERIL, SLICK_PERIL } from '../../game/act1_rules/drowned';
import { backView, flipped } from '../../game/facing';
import type { Peril } from '../../game/state';
import { liveFrom } from './live';
import type { Act1Fx, Act1FxCtx } from './types';

const THINGS = 'things:drowned';
/** Slick frames painted here before the painter's are in, and turned over. */
const own = new Map<string, Sprite>();
function slick(c: Act1FxCtx, view: GameView, flip: boolean, i: number): Sprite {
  const made = c.film ? c.film<ThingsFilm>(THINGS) : null;
  const list = made?.[`slick:${view}`];
  let s = list?.[i];
  if (!s) {
    const k = `${view}:${i}`;
    s = own.get(k);
    if (!s) own.set(k, (s = slickSprite(i, view)));
  }
  if (!flip) return s;
  const fk = `flip:${view}:${i}:${list ? 'film' : 'own'}`;
  let f = own.get(fk);
  if (!f) own.set(fk, (f = flipSprite(s)));
  return f;
}
const viewOf = (p: Peril): GameView => (backView(p.fx, p.fy) ? 'back' : 'front');
/** The gush in the air, one half of it. */
function gush(c: Act1FxCtx, p: Peril, side: 'behind' | 'before'): void {
  const view = viewOf(p);
  const flip = flipped(p.fx, p.fy);
  const C = SLICK_CANVAS;
  const s = liveFrom(`dr:gush:${p.x.toFixed(3)}:${p.y.toFixed(3)}:${side}`, `${Math.floor(p.t * 30)}`, C.ax, C.ay, () => gushPainted(p.t, view, side));
  if (!s) return;
  const [sx, sy] = c.at(p.x, p.y);
  c.stand(p.x + p.y + (side === 'before' ? 0.03 : -0.03), flip ? flipSprite(s) : s, sx, sy);
}

const RETCH: Act1Fx = {
  films: [THINGS],
  ground(c, m, p) {
    if (!p || !c.g) return;
    if (p.a1 === SLICK_PERIL) {
      const i = slickFrame(p.t);
      if (i < 0) return;
      const [sx, sy] = c.at(p.x, p.y);
      drawSprite(c.g, slick(c, viewOf(p), flipped(p.fx, p.fy), i), sx, sy);
      return;
    }
    if (p.a1 === RIME_PERIL) {
      const C = RIME_CANVAS;
      const s = liveFrom(`dr:rime:${p.x.toFixed(3)}:${p.y.toFixed(3)}`, `${Math.floor(p.t * 30)}`, C.ax, C.ay, () => rimePainted(p.t, 'floor'));
      if (!s) return;
      const [sx, sy] = c.at(p.x, p.y);
      drawSprite(c.g, s, sx, sy);
      drawLights(c.g, s, Math.round(sx), Math.round(sy), 1, 1);
    }
  },
  standing(c, m, p) {
    if (!p) return;
    if (p.a1 === SLICK_PERIL) {
      if (p.t < 0 || p.t > 0.6) return;
      gush(c, p, 'behind');
      gush(c, p, 'before');
      return;
    }
    if (p.a1 !== RIME_PERIL || p.d !== 1) return;
    // (the ice round the feet of the hero it froze: behind him and before him)
    const C = RIME_CANVAS;
    for (const side of ['behind', 'before'] as const) {
      const s = liveFrom(`dr:ice:${p.b.toFixed(3)}:${p.c.toFixed(3)}:${side}`, `${Math.floor(p.t * 30)}`, C.ax, C.ay, () => rimePainted(p.t, 'air', side));
      if (!s) continue;
      const [sx, sy] = c.at(p.b, p.c);
      c.stand(p.b + p.c + (side === 'before' ? 0.05 : -0.05), s, sx, sy);
    }
  },
};

export const FX: Act1Fx | null = {
  get films() {
    return DROWNED_RETCH.on ? RETCH.films : undefined;
  },
  hidden(m) {
    return !!m.a1 && m.a1.under === 1;
  },
  sprite(m, _art, set) {
    const rise = set.clips?.moves?.rise;
    if (!rise || !m.a1 || m.a1.under !== 1) return null;
    return clipFrame(rise, 0);
  },
  ground: (c, m, p) => (DROWNED_RETCH.on ? RETCH.ground!(c, m, p) : undefined),
  standing: (c, m, p) => (DROWNED_RETCH.on ? RETCH.standing!(c, m, p) : undefined),
};
