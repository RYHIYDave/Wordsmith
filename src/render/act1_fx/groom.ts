// ACT 2, PART TWO, THE HIGH CITY: FLOOR 16: THE HUSHED GROOMS: what they do to the floor, drawn (render/act1_fx/types.ts). The fork
// lowered and aimed, its jab and the Hush leaving them are all in their own pictures (art/palace_hands_moves.ts). Only THE FORK'S
// WARNING is drawn here: through the wind-up, the strip the tines will be jabbed along (game/act1_rules/gardener.ts JAB_STRIP),
// marked on the floor in the enemy's pink, as the gardener's (render/act1_fx/gardener.ts).
//
// LOOSE THE HORSE (GROOM_HORSE: art/action_f16_groom.ts, his pick of 31 Oct 2026): THE LINE marked across the garden as he whistles
// (the golem's lane, art/action_f6_golem.ts lanePainted, at the line's own width), broken up behind the horse as it gallops; THE HORSE
// galloping down it, seen from in front or behind as it runs, turned over when it runs to the left (its frames painted ahead: art/
// films.ts things:groom); the mist it bursts out of at the line's start, and goes into at its end.

import { JAB_STRIP } from '../../game/act1_rules/gardener';
import { keptPictures } from './kept';
import { palaceWarn } from './gardener';
import type { Act1Fx, Act1FxCtx } from './types';
import { GROOM_HORSE, LOOSE } from '../../art/action_f16_groom';
import { HORSE_N, MIST_N, horseSprite, mistSprite } from '../../art/act1_figs/groom';
import { lanePainted } from '../../art/action_f6_golem';
import { tileAt } from '../../art/action_f6_fx';
import type { ThingsFilm } from '../../art/films';
import { drawSprite, flipSprite } from '../../engine/px';
import type { Sprite } from '../../engine/px';
import { HORSE_PERIL, horseOn } from '../../game/act1_rules/groom';
import { backView, flipped } from '../../game/facing';
import type { Peril } from '../../game/state';
import { liveFrom } from './live';

const THINGS = 'things:groom';
const own = keptPictures<string, Sprite>();
function frameOf(c: Act1FxCtx, key: string, i: number, make: () => Sprite, flip: boolean): Sprite {
  const made = c.film ? c.film<ThingsFilm>(THINGS) : null;
  let s = made?.[key]?.[i];
  const from = s ? 'film' : 'own';
  if (!s) {
    s = own.get(`${key}:${i}`);
    if (!s) own.set(`${key}:${i}`, (s = make()));
  }
  if (!flip) return s;
  const fk = `flip:${key}:${i}:${from}`;
  let f = own.get(fk);
  if (!f) own.set(fk, (f = flipSprite(s)));
  return f;
}
/** THE LINE on the floor: laid out as he whistles, broken up behind the horse. */
function line(c: Act1FxCtx, p: Peril): void {
  const k = Math.min(1, (p.t + 0.53) / 0.3);
  const gone = p.t > 0 ? Math.max(0, horseOn(p.t, p.a).gone - 0.8) : 0;
  const [X1, Y1] = tileAt(0, 0, p.fx * p.a, p.fy * p.a);
  const ax = -(Math.min(0, X1) - 70);
  const ay = -(Math.min(0, Y1) - 70);
  const s = liveFrom(`gr:line:${p.x.toFixed(3)}:${p.y.toFixed(3)}`, `${Math.round(k * 10)}:${Math.round(gone * 4)}`, ax, ay, () => ({ px: lanePainted(p.fx, p.fy, k, gone, p.a, LOOSE.half).px }));
  if (!s) return;
  const [sx, sy] = c.at(p.x, p.y);
  drawSprite(c.g!, s, sx, sy);
}

const HORSE_FX: Act1Fx = {
  films: [THINGS],
  ground(c, m, p) {
    if (!p || p.a1 !== HORSE_PERIL || !c.g) return;
    const on = p.t > 0 ? horseOn(p.t, p.a) : null;
    if (on && on.gone > p.a + 0.5) return;
    line(c, p);
  },
  standing(c, m, p) {
    if (!p || p.a1 !== HORSE_PERIL || p.t < 0) return;
    const on = horseOn(p.t, p.a);
    // THE MIST it bursts out of at the line's start, and goes into at its end
    const mi = Math.floor(p.t * 30);
    if (mi < MIST_N) {
      const [sx, sy] = c.at(p.x, p.y);
      c.stand(p.x + p.y, frameOf(c, 'mist', mi, () => mistSprite(mi), false), sx, sy);
    }
    const endT = (p.a - LOOSE.fade * 0.6) / LOOSE.pace;
    const ei = Math.floor((p.t - endT) * 30);
    if (ei >= 0 && ei < MIST_N) {
      const ex = p.x + p.fx * p.a;
      const ey = p.y + p.fy * p.a;
      const [sx, sy] = c.at(ex, ey);
      c.stand(ex + ey, frameOf(c, 'mist', ei, () => mistSprite(ei), false), sx, sy);
    }
    // THE HORSE galloping down its line, seen as it runs
    if (on.gone > p.a || on.formed <= 0) return;
    const shift = LOOSE.lane - p.a;
    const tf = on.gone > p.a - LOOSE.fade ? (on.gone + shift) / LOOSE.pace : p.t;
    const i = Math.max(0, Math.min(HORSE_N - 1, Math.floor(tf * 30)));
    const view = backView(p.fx, p.fy) ? 'back' : 'front';
    const x = p.x + p.fx * on.gone;
    const y = p.y + p.fy * on.gone;
    const [sx, sy] = c.at(x, y);
    c.stand(x + y, frameOf(c, `horse:${view}`, i, () => horseSprite(i, view), flipped(p.fx, p.fy)), sx, sy);
  },
};

export const FX: Act1Fx | null = {
  get films() {
    return GROOM_HORSE.on ? HORSE_FX.films : undefined;
  },
  ground(c, m, p) {
    if (GROOM_HORSE.on) return HORSE_FX.ground!(c, m, p);
    palaceWarn(c, m, 'groom:jab', JAB_STRIP);
  },
  standing: (c, m, p) => HORSE_FX.standing!(c, m, p),
};
