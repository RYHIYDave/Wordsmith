// THE CHAINED ONE'S MOVES DONE THE ACTION WAY (game/bosses.ts CO_ACTION): what his blows leave on the floor, drawn
// (render/act1_fx/types.ts), from the art chat's pictures (art/chained_action_fx.ts, his yes to them, 31 Oct 2026). His moves
// are in his own pictures (art/chained_action.ts, CHAINED_ACTION) and the hook and the ball in flight are render/bossfx.ts's;
// here, the perils his rules leave (game/bosses.ts coActing):
// - THE CRACK (CO_CRACK): its lane marked as his fists go up (the game's own lane, drawChargeLane); from the finisher's blow, the
//   crack running out and closing (crackPainted 'floor', under the figures; 'air', behind and before a figure at its middle),
//   along the way he faced, by sixteen ways round;
// - A RING (CO_RING_PERIL, `d` its radius): the whirl's, the blow waiting's, the ball's (ringPainted, the same way).
import { CRACK, CRACK_CANVAS, CRACK_MID, RING, crackPainted, ringCanvas, ringPainted } from '../../art/chained_action_fx';
import { drawChargeLane } from '../../art/charge_lane';
import { toSprite } from '../../art/kit';
import { drawSprite } from '../../engine/px';
import type { Sprite } from '../../engine/px';
import { CO_CRACK, CO_RING_PERIL } from '../../game/bosses';
import type { Peril } from '../../game/state';
import type { Act1Fx } from './types';

const FPS = 30;
const WAYS = 16;
const MADE = new Map<string, Sprite>();
type Layer = 'floor' | 'behind' | 'before';
/** The way of the sixteen round nearest (fx, fy). */
const wayOf = (fx: number, fy: number): number => ((Math.round((Math.atan2(fy, fx) / (2 * Math.PI)) * WAYS) % WAYS) + WAYS) % WAYS;
/** One frame of the crack, `k` frames from the finisher's blow, run along way `w` of the sixteen. */
function crack(what: Layer, k: number, w: number): Sprite {
  const key = `crack:${what}:${k}:${w}`;
  let s = MADE.get(key);
  if (!s) {
    const a = (w / WAYS) * 2 * Math.PI;
    s = toSprite(crackPainted(k / FPS, what === 'floor' ? 'floor' : 'air', [Math.cos(a), Math.sin(a)], what === 'floor' ? 'all' : what), null, CRACK_CANVAS.ax, CRACK_CANVAS.ay);
    MADE.set(key, s);
  }
  return s;
}
/** One frame of a ring `r` round, `k` frames from its blow. */
function ring(what: Layer, k: number, r: number): Sprite {
  const key = `ring:${what}:${k}:${r}`;
  let s = MADE.get(key);
  if (!s) {
    const C = ringCanvas(r);
    s = toSprite(ringPainted(k / FPS, what === 'floor' ? 'floor' : 'air', r, what === 'floor' ? 'all' : what), null, C.ax, C.ay);
    MADE.set(key, s);
  }
  return s;
}
/** Where the crack's pictures are anchored: CRACK_MID before where he stood, the way he faced. */
const crackMid = (p: Peril): [number, number] => [p.x + p.fx * CRACK_MID, p.y + p.fy * CRACK_MID];

export const FX: Act1Fx | null = {
  ground(c, m, p) {
    if (m || !p || !c.g) return;
    if (p.a1 === CO_CRACK) {
      if (p.t < 0) {
        // (its lane, marked from his fists going up to the blow)
        // (`b`: how long before the blow it was marked)
        drawChargeLane(c.g, { x0: p.x + p.fx * 0.5, y0: p.y + p.fy * 0.5, x1: p.x + p.fx * CRACK.to, y1: p.y + p.fy * CRACK.to, half: CRACK.half, k: p.b > 0 ? 1 + p.t / p.b : 1 }, c.at);
        return;
      }
      if (p.t > CRACK.long) return;
      const [x, y] = crackMid(p);
      const [sx, sy] = c.at(x, y);
      drawSprite(c.g, crack('floor', Math.floor(p.t * FPS), wayOf(p.fx, p.fy)), sx, sy);
    } else if (p.a1 === CO_RING_PERIL) {
      if (p.t < 0 || p.t > RING.long) return;
      const [sx, sy] = c.at(p.x, p.y);
      drawSprite(c.g, ring('floor', Math.floor(p.t * FPS), p.d), sx, sy);
    }
  },
  standing(c, m, p) {
    if (m || !p || p.t < 0) return;
    if (p.a1 === CO_CRACK && p.t <= CRACK.long) {
      const [x, y] = crackMid(p);
      const [sx, sy] = c.at(x, y);
      const k = Math.floor(p.t * FPS);
      const w = wayOf(p.fx, p.fy);
      c.stand(x + y - 0.02, crack('behind', k, w), sx, sy);
      c.stand(x + y + 0.02, crack('before', k, w), sx, sy);
    } else if (p.a1 === CO_RING_PERIL && p.t <= RING.long) {
      const [sx, sy] = c.at(p.x, p.y);
      const k = Math.floor(p.t * FPS);
      c.stand(p.x + p.y - 0.02, ring('behind', k, p.d), sx, sy);
      c.stand(p.x + p.y + 0.02, ring('before', k, p.d), sx, sy);
    }
  },
};
