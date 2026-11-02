// FLOOR 1, MORE ACTION (game/defs.ts ACTION_F1): THE BONE ARCHER'S ARROW RAIN, drawn (render/act1_fx/types.ts), from the art
// chat's pictures (art/action_f1_fx.ts, his yes to them, 31 Oct 2026). Its draw and loose are in its own pictures
// (art/monster_bones.ts clips.moves.rain); here, the peril it leaves (game/action_f1.ts RAIN_PERIL), from the loose:
// - WHAT IT LOOSED flying up into the dark over the archer (rainRisePainted, RAIN.rise), anchored at its floor point, turned as it is;
// - THE RING on the floor where the hero stood, filling with the shadows of falling arrows (rainPainted 'floor'), under the figures;
// - THE ARROWS coming down and standing in the stones (rainPainted 'air'), behind and before a figure at the ring's middle.
import { RAIN, RAIN_CANVAS, RAIN_LONG, RISE_CANVAS, rainPainted, rainRisePainted } from '../../art/action_f1_fx';
import { toSprite } from '../../art/kit';
import { drawSprite, flipSprite } from '../../engine/px';
import type { Sprite } from '../../engine/px';
import { RAIN_PERIL } from '../../game/action_f1';
import type { Peril } from '../../game/state';
import type { Act1Fx } from './types';

const FPS = 30;
const MADE = new Map<string, Sprite>();
type Layer = 'floor' | 'behind' | 'before' | 'rise';
/** One frame of the rain (k frames from the loose), seen from in front or behind, made the first time it is asked for. */
function frame(what: Layer, k: number, back: boolean, flip: boolean): Sprite {
  const key = `${what}:${k}:${back ? 1 : 0}:${flip ? 1 : 0}`;
  let s = MADE.get(key);
  if (s) return s;
  if (flip) s = flipSprite(frame(what, k, back, false));
  else {
    const view = back ? 'back' : 'front';
    const t = k / FPS;
    if (what === 'rise') s = toSprite(rainRisePainted(t, view), null, RISE_CANVAS.ax, RISE_CANVAS.ay);
    else s = toSprite(rainPainted(t, view, what === 'floor' ? 'floor' : 'air', RAIN.radius, what === 'floor' ? 'all' : what), null, RAIN_CANVAS.ax, RAIN_CANVAS.ay);
  }
  MADE.set(key, s);
  return s;
}

/** The rain's frame now (from its loose), or -1: over. Shot away from the eye (the ring up the screen of the archer): seen from behind. */
function now(p: Peril): { k: number; back: boolean } {
  const k = p.t >= 0 && p.t <= RAIN_LONG ? Math.floor(p.t * FPS) : -1;
  return { k, back: p.x + p.y < p.b + p.c - 0.2 };
}

export const FX: Act1Fx | null = {
  ground(c, m, p) {
    if (m || !p || p.a1 !== RAIN_PERIL || !c.g) return;
    const { k, back } = now(p);
    if (k < 0) return;
    const [sx, sy] = c.at(p.x, p.y);
    drawSprite(c.g, frame('floor', k, back, false), sx, sy);
  },
  standing(c, m, p) {
    if (m || !p || p.a1 !== RAIN_PERIL) return;
    const { k, back } = now(p);
    if (k < 0) return;
    const [sx, sy] = c.at(p.x, p.y);
    c.stand(p.x + p.y - 0.02, frame('behind', k, back, false), sx, sy);
    c.stand(p.x + p.y + 0.02, frame('before', k, back, false), sx, sy);
    // (what it loosed, flying up over the archer from the frame after the loose; turned as the archer faces)
    if (p.t > 1 / FPS && p.t < RAIN.rise + 1 / FPS) {
      const [ax, ay] = c.at(p.b, p.c);
      c.stand(p.b + p.c + 0.1, frame('rise', k, back, p.fx - p.fy < 0), ax, ay);
    }
  },
};
