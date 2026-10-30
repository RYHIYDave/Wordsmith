// ACT 2, PART TWO, THE HIGH CITY: FLOOR 17: THE SILENT ORDER: what they do, drawn (render/act1_fx/types.ts). Their rush, throw and
// palm and their smears are in their own pictures (art/silent_order_moves.ts); here:
// - THE GREY WAVE from the palm's blow, the art's wavePainted at their floor point turned their way, while the palm lasts;
// - THE KNIFE in flight and lying where it came down, the art's knifePainted, along the way it was thrown (game/act1_rules/
//   order.ts knifeWhere);
// - THEIR WARNINGS through each wind-up, in the enemy's pink: the knife's line (eight tiles, narrow), the wave's cone.
import { toSprite } from '../../art/kit';
import { KNIFE_CANVAS, PALM_WAVE, WAVE_CANVAS, knifePainted, wavePainted } from '../../art/silent_order_fx';
import { PALM, THROW } from '../../art/silent_order_moves';
import { flipSprite } from '../../engine/px';
import type { Sprite } from '../../engine/px';
import { ORDER_TUNE, knifeWhere } from '../../game/act1_rules/order';
import { drawFanWarn, drawStripWarn, warnK } from './garden_warn';
import type { Act1Fx } from './types';

const FPS = 30;
const MADE = new Map<string, Sprite>();
function frame(what: 'wave' | 'knife', k: number, back: boolean, flip: boolean): Sprite {
  const key = `${what}:${k}:${back ? 1 : 0}:${flip ? 1 : 0}`;
  let s = MADE.get(key);
  if (s) return s;
  if (flip) s = flipSprite(frame(what, k, back, false));
  else if (what === 'wave') s = toSprite(wavePainted(k / FPS, back ? 'back' : 'front'), null, WAVE_CANVAS.ax, WAVE_CANVAS.ay);
  else s = toSprite(knifePainted(k / FPS, back ? 'back' : 'front'), null, KNIFE_CANVAS.ax, KNIFE_CANVAS.ay);
  MADE.set(key, s);
  return s;
}

export const FX: Act1Fx | null = {
  ground(c, m, p) {
    if (!c.g) return;
    if (m && m.act) {
      const w = { x: m.x, y: m.y, fx: m.fx, fy: m.fy, hand: m.act.hand };
      if (m.act.id === 'order:knife') {
        const k = warnK(m.act.t, THROW.warn[0] - 0.2, THROW.hit);
        if (k >= 0) drawStripWarn(c.g, c.at, w, 0.3, 8, -0.5, 0.5, k, c.t);
      } else if (m.act.id === 'order:palm') {
        const k = warnK(m.act.t, PALM.warn[0] - 0.2, PALM.hit);
        const P = ORDER_TUNE.palm;
        if (k >= 0) drawFanWarn(c.g, c.at, w, -P.half, P.half, P.reach, k, c.t);
      }
    }
    void p;
  },
  standing(c, m, p) {
    if (m && m.act && m.act.id === 'order:palm' && m.act.t >= PALM.hit) {
      const k = Math.floor((m.act.t - PALM.hit) * FPS);
      if (k / FPS > PALM_WAVE.long) return;
      const [sx, sy] = c.at(m.x, m.y);
      c.stand(m.x + m.y - 0.3, frame('wave', k, m.fx + m.fy < -0.2, m.fx - m.fy < 0), sx, sy);
    }
    if (p && p.a1 === 'order:knife') {
      const at = knifeWhere(p, p.t);
      const [sx, sy] = c.at(at.x, at.y);
      c.stand(at.x + at.y + 0.02, frame('knife', Math.min(Math.floor(p.t * FPS), 30), p.fx + p.fy < -0.2, p.fx - p.fy < 0), sx, sy);
    }
  },
};
