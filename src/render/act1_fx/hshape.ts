// ACT 2, PART TWO, THE HIGH CITY: FLOOR 20, THE QUIET TOWER: THE HUSH IN ITS OWN SHAPES: what they do, drawn (render/act1_fx/
// types.ts). Their drift, dart and grip are in their own pictures (art/hush_shapes_moves.ts); here:
// - THE GRIP'S COILS round whoever it caught (or where it shut on nothing), the art's gripPainted: its far half under him, its near
//   half over him (GRIP_FX, 0.8 s from the blow);
// - THEIR WARNINGS through each wind-up, in the enemy's pink: the dart's line (four tiles), the grip's round.
import { GRIP_CANVAS, gripPainted } from '../../art/hush_shapes';
import { HS_DART, HS_GRIP } from '../../art/hush_shapes_moves';
import { toSprite } from '../../art/kit';
import type { Sprite } from '../../engine/px';
import { HUSH_TUNE, gripPoint } from '../../game/act1_rules/hshape';
import { drawFanWarn, drawStripWarn, warnK } from './garden_warn';
import type { Act1Fx } from './types';

const FPS = 30;
const MADE = new Map<string, Sprite>();
function coils(k: number, half: 'far' | 'near'): Sprite {
  const key = `${k}:${half}`;
  let s = MADE.get(key);
  if (!s) {
    s = toSprite(gripPainted(k / FPS, 'front', half), null, GRIP_CANVAS.ax, GRIP_CANVAS.ay);
    MADE.set(key, s);
  }
  return s;
}

export const FX: Act1Fx | null = {
  ground(c, m) {
    if (!c.g || !m || !m.act) return;
    const w = { x: m.x, y: m.y, fx: m.fx, fy: m.fy, hand: m.act.hand };
    if (m.act.id === 'hshape:dart') {
      const k = warnK(m.act.t, HS_DART.warn[0] - 0.1, HS_DART.strike[0]);
      if (k >= 0) drawStripWarn(c.g, c.at, w, 0.3, HUSH_TUNE.dart.carry, -0.45, 0.45, k, c.t);
    } else if (m.act.id === 'hshape:grip') {
      const k = warnK(m.act.t, HS_GRIP.warn[0] - 0.15, HS_GRIP.hit);
      const P = gripPoint(m);
      if (k >= 0) drawFanWarn(c.g, c.at, { ...w, x: P.x, y: P.y }, -Math.PI, Math.PI, HUSH_TUNE.grip.r, k, c.t);
    }
  },
  standing(c, _m, p) {
    if (!p || p.a1 !== 'hshape:grip' || p.t >= 0.8) return;
    const k = Math.min(23, Math.floor(p.t * FPS));
    // (round him, following him while it holds: he cannot move)
    const x = p.a && !c.game.over ? c.game.hero.x : p.x;
    const y = p.a && !c.game.over ? c.game.hero.y : p.y;
    const [sx, sy] = c.at(x, y);
    c.stand(x + y - 0.04, coils(k, 'far'), sx, sy);
    c.stand(x + y + 0.04, coils(k, 'near'), sx, sy);
  },
};
