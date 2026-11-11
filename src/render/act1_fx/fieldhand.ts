// ACT 2, THE HUSH: FLOOR 13: THE HUSHED WORKING THE FIELDS: what it does to the floor and sends across it, drawn (render/act1_fx/types.ts), from the art
// chat's (art/fieldhands.ts, fieldhands_moves.ts). Null: nothing beyond its figure (or not built yet).

import { BOOM, FIELD_HARVEST, boomAt } from '../../art/action_f11_field';
import { curveFrame, curveSprite, sickleFrame, sickleSprite } from '../../art/act1_figs/fieldhand';
import type { ThingsFilm } from '../../art/films';
import { drawSprite, flipSprite } from '../../engine/px';
import type { Sprite } from '../../engine/px';
import { backView, beside, flipped } from '../../game/facing';
import { keptPictures } from './kept';
import type { Act1Fx, Act1FxCtx } from './types';

// THE SICKLE BOOMERANG (FIELD_HARVEST: art/action_f11_field.ts, his pick of 2 Nov 2026): its curve marked on the floor from where they
// stand, laid out as they draw back and gone behind it as it flies; the sickle spinning along it at its height, among the figures at
// the floor point under it; each as they face in their picture, turned over as they are (painted ahead: art/films.ts things:fieldhand).
const THINGS = 'things:fieldhand';
const own = keptPictures<string, Sprite>();
function frame(c: Act1FxCtx, what: 'sickle' | 'curve', view: 'front' | 'back', flip: boolean, i: number): Sprite {
  const key = `${what}:${view}`;
  const made = c.film ? c.film<ThingsFilm>(THINGS) : null;
  let s = made?.[key]?.[i];
  const from = s ? 'film' : 'own';
  if (!s) {
    const k = `${key}:${i}`;
    s = own.get(k);
    if (!s) own.set(k, (s = what === 'sickle' ? sickleSprite(i, view) : curveSprite(i, view)));
  }
  if (!flip) return s;
  const fk = `flip:${key}:${i}:${from}`;
  let f = own.get(fk);
  if (!f) own.set(fk, (f = flipSprite(s)));
  return f;
}

const BOOM_FX: Act1Fx = {
  films: [THINGS],
  ground(c, m) {
    if (!m || !c.g || m.state !== 'act' || !m.act || m.act.id !== 'fieldhand:boom') return;
    const i = curveFrame(m.act.t);
    if (i < 0) return;
    const view = backView(m.fx, m.fy) ? 'back' : 'front';
    const [sx, sy] = c.at(m.x, m.y);
    drawSprite(c.g, frame(c, 'curve', view, flipped(m.fx, m.fy), i), sx, sy);
  },
  standing(c, m) {
    if (!m || m.state !== 'act' || !m.act || m.act.id !== 'fieldhand:boom') return;
    const t = m.act.t;
    const i = sickleFrame(t);
    const p = boomAt(t);
    if (i < 0 || !p) return;
    const w = beside(m.x, m.y, m.fx, m.fy, m.act.hand, p.x, p.y);
    const view = backView(m.fx, m.fy) ? 'back' : 'front';
    const [sx, sy] = c.at(w.x, w.y);
    c.stand(w.x + w.y, frame(c, 'sickle', view, flipped(m.fx, m.fy), i), sx, sy);
    c.spot(sx, sy - 16, 14, 0.4);
  },
};
void BOOM;

export const FX: Act1Fx | null = {
  get films() {
    return FIELD_HARVEST.on ? BOOM_FX.films : undefined;
  },
  ground: (c, m, p) => (FIELD_HARVEST.on ? BOOM_FX.ground!(c, m, p) : undefined),
  standing: (c, m, p) => (FIELD_HARVEST.on ? BOOM_FX.standing!(c, m, p) : undefined),
};
