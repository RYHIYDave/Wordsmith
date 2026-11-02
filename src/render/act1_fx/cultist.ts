// FLOOR 2, MORE ACTION (game/defs.ts ACTION_F2): THE CULTIST'S FIRE SIGIL, drawn (render/act1_fx/types.ts), from the art chat's
// pictures (art/action_f2_fx.ts, his yes to them). Its cast is in its own pictures (art/monster_cultist.ts, CULTIST_SIGIL); here,
// the peril it casts (game/action_f2.ts SIGIL_PERIL), from SIGIL.delay before its eruption to SIGIL_LONG after: the ring traced
// round and filling on the floor (sigilPainted 'floor', under the figures); the pillar of fire and its embers (sigilPainted
// 'air'), behind and before a figure standing at its middle.
import { SIGIL, SIGIL_CANVAS, SIGIL_LONG, sigilPainted } from '../../art/action_f2_fx';
import { toSprite } from '../../art/kit';
import { drawSprite } from '../../engine/px';
import type { Sprite } from '../../engine/px';
import { SIGIL_PERIL } from '../../game/action_f2';
import type { Peril } from '../../game/state';
import type { Act1Fx } from './types';

const FPS = 30;
const MADE = new Map<string, Sprite>();
/** One frame of the sigil, k frames from its first (SIGIL.delay before the eruption), made the first time it is asked for. */
function frame(what: 'floor' | 'behind' | 'before', k: number): Sprite {
  const key = `${what}:${k}`;
  let s = MADE.get(key);
  if (s) return s;
  const t = k / FPS - SIGIL.delay;
  s = toSprite(sigilPainted(t, what === 'floor' ? 'floor' : 'air', SIGIL.radius, what === 'floor' ? 'all' : what), null, SIGIL_CANVAS.ax, SIGIL_CANVAS.ay);
  MADE.set(key, s);
  return s;
}
/** The frame now, or -1: not yet, or over. */
function kOf(p: Peril): number {
  return p.t >= -SIGIL.delay && p.t <= SIGIL_LONG ? Math.floor((p.t + SIGIL.delay) * FPS) : -1;
}

export const FX: Act1Fx | null = {
  ground(c, m, p) {
    if (m || !p || p.a1 !== SIGIL_PERIL || !c.g) return;
    const k = kOf(p);
    if (k < 0) return;
    const [sx, sy] = c.at(p.x, p.y);
    drawSprite(c.g, frame('floor', k), sx, sy);
  },
  standing(c, m, p) {
    if (m || !p || p.a1 !== SIGIL_PERIL || p.t < 0) return;
    const k = kOf(p);
    if (k < 0) return;
    const [sx, sy] = c.at(p.x, p.y);
    c.stand(p.x + p.y - 0.02, frame('behind', k), sx, sy);
    c.stand(p.x + p.y + 0.02, frame('before', k), sx, sy);
  },
};
