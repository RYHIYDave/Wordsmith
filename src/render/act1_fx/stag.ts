// ACT 1: THE HOLLOW STAG, FLOOR 9'S BOSS: what it does to the floor and sends across it, drawn (render/act1_fx/types.ts),
// where its rules (game/act1_rules/stag.ts) have it. Only what its own pictures do not paint:
//   ON THE FLOOR: its charge's lane as it paws, and fading behind it as it runs (the red troll's, art/charge_lane.ts:
//     the bosses' warning in the red circle's own reds, his yes to it on 9 Oct);
//   AMONG THE FIGURES: its roots worming through the ground toward you, the art chat's own painter of them
//     (art/hollow_stag.ts rootSnakePainted: stretches of ROOT_STRETCH laid end to end along each line, from
//     ROOT_SNAKE.from to STAG_ROOTS.reach, each `t` from when its root's head passes the stretch's middle; its crack
//     glowing before it is its own warning). One line keeps one seed, so its stretches make one root; each stretch's
//     moment is painted the first time it is wanted and kept while its line lasts.

import { drawChargeLane } from '../../art/charge_lane';
import { ROOT_CANVAS, ROOT_SNAKE, ROOT_STRETCH, STAG_ROOTS, rootSnakePainted } from '../../art/hollow_stag';
import { toSprite } from '../../art/kit';
import type { Sprite } from '../../engine/px';
import { STAG, rootHeadAt } from '../../game/act1_rules/stag';
import type { Monster, Peril } from '../../game/state';
import type { Act1Fx } from './types';

const clamp01 = (v: number): number => (v < 0 ? 0 : v > 1 ? 1 : v);
/** Its roots' stretches' moments, painted at this many a second (its films' thirty). */
const ROOT_FPS = 30;
/** How long before and after its head passes a stretch's middle the stretch shows anything (its crack coming; its body and furrow after). */
const ROOT_BEFORE = (ROOT_STRETCH / 2 + ROOT_SNAKE.crack) / ROOT_SNAKE.speed + 0.05;
const ROOT_AFTER = (ROOT_STRETCH / 2 + ROOT_SNAKE.body) / ROOT_SNAKE.speed + 0.55;

/** The way a line of the floor runs, in degrees round from the painter's forward (art/skin.ts, seen in front: its x along the floor's x, its left along the floor's -y). */
export function alongOf(fx: number, fy: number): number {
  return (Math.atan2(-fy, fx) * 180) / Math.PI;
}

/** Each line's stretches' moments, kept while it lasts (by the peril, by the moment). */
const LINES = new WeakMap<Peril, Map<number, Sprite>>();

function stretch(p: Peril, k: number): Sprite {
  let made = LINES.get(p);
  if (!made) LINES.set(p, (made = new Map()));
  let s = made.get(k);
  if (!s) {
    s = toSprite(rootSnakePainted(k / ROOT_FPS, 'front', alongOf(p.fx, p.fy), 13 * (p.c + 1)), null, ROOT_CANVAS.ax, ROOT_CANVAS.ay);
    made.set(k, s);
  }
  return s;
}

export const FX: Act1Fx | null = {
  ground(c, m) {
    const g = c.g;
    if (!g || !m || m.state !== 'act' || !m.act || m.act.id !== 'stag:charge') return;
    const C = STAG.charge;
    const T = m.act.t;
    if (T < C.warn || T >= C.crash) return;
    const run = C.pace * (C.crash - C.run);
    // (from where it set off to where its antlers will crash, as wide as what it runs down)
    const x0 = m.act.x;
    const y0 = m.act.y;
    const end = run + C.ahead[1];
    const lane = { x0, y0, x1: x0 + m.fx * end, y1: y0 + m.fy * end, half: C.half, k: clamp01((T - C.warn) / (C.run - C.warn)) };
    drawChargeLane(g, T < C.run ? lane : { ...lane, k: 1, gone: clamp01((T - C.run) / (C.crash - C.run)) }, c.at);
  },

  standing(c, m, p) {
    if (m || !p || p.a1 !== 'stag:root') return;
    // (its stretches end to end along the line, each where its root is now)
    for (let d = ROOT_SNAKE.from + ROOT_STRETCH / 2; d <= STAG_ROOTS.reach + 1e-9; d += ROOT_STRETCH) {
      const tau = p.t - rootHeadAt(d);
      if (tau < -ROOT_BEFORE || tau > ROOT_AFTER) continue;
      const s = stretch(p, Math.round(tau * ROOT_FPS));
      const x = p.x + p.fx * d;
      const y = p.y + p.fy * d;
      const [sx, sy] = c.at(x, y);
      c.stand(x + y, s, sx, sy);
    }
  },

  // (struck as it stots, it bounds on: its flinch is a standing one, its hoofs on their spots)
  sprite(m: Monster, _art, set) {
    if (m.state === 'act' || !m.gait || m.gait.mode !== 'walk' || m.struckT === undefined) return null;
    const reel = set.clips?.reel;
    if (!reel || m.struckT >= reel.frames.length / reel.fps) return null;
    return set.walk[Math.floor(Math.max(0, m.gait.t) * (set.walkFps ?? 16) + 1e-6) % set.walk.length];
  },
};
