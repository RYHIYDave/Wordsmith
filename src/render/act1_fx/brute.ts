// FLOOR 3, MORE ACTION (game/defs.ts ACTION_F3): THE GREEN TROLL'S SHOCKWAVE RING, drawn (render/act1_fx/types.ts), from the art
// chat's pictures (art/action_f3_fx.ts, his yes to them, 31 Oct 2026). His rampage is in his own pictures (art/monster_brute.ts,
// BRUTE_RAMPAGE), and its ring was marked before the slam with the game's red circle; here, the ring his slam sends out
// (game/action_f3.ts RING_PERIL): the dent and its cracks, the ring going out over the floor (ringPainted 'floor', under the
// figures); the flash, the dust and the chips flung up (ringPainted 'air'), behind and before a figure at its middle.
import { RING, RING_CANVAS, ringPainted } from '../../art/action_f3_fx';
import { toSprite } from '../../art/kit';
import { drawSprite } from '../../engine/px';
import type { Sprite } from '../../engine/px';
import { RING_PERIL } from '../../game/action_f3';
import type { Peril } from '../../game/state';
import type { Act1Fx } from './types';

const FPS = 30;
const MADE = new Map<string, Sprite>();
/** One frame of the ring, k frames from the slam, made the first time it is asked for. */
function frame(what: 'floor' | 'behind' | 'before', k: number): Sprite {
  const key = `${what}:${k}`;
  let s = MADE.get(key);
  if (!s) MADE.set(key, (s = toSprite(ringPainted(k / FPS, what === 'floor' ? 'floor' : 'air', RING.radius, what === 'floor' ? 'all' : what), null, RING_CANVAS.ax, RING_CANVAS.ay)));
  return s;
}
/** The frame now, or -1: over. */
const kOf = (p: Peril): number => (p.a1 === RING_PERIL && p.t >= 0 && p.t <= RING.long ? Math.floor(p.t * FPS) : -1);

export const FX: Act1Fx | null = {
  ground(c, m, p) {
    if (m || !p || !c.g) return;
    const k = kOf(p);
    if (k < 0) return;
    const [sx, sy] = c.at(p.x, p.y);
    drawSprite(c.g, frame('floor', k), sx, sy);
  },
  standing(c, m, p) {
    if (m || !p) return;
    const k = kOf(p);
    if (k < 0) return;
    const [sx, sy] = c.at(p.x, p.y);
    c.stand(p.x + p.y - 0.02, frame('behind', k), sx, sy);
    c.stand(p.x + p.y + 0.02, frame('before', k), sx, sy);
  },
};
