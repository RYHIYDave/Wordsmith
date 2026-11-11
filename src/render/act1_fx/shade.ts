// FLOOR 2, MORE ACTION (game/defs.ts ACTION_F2): THE SHADE'S RIME, drawn (render/act1_fx/types.ts), from the art chat's pictures
// (art/action_f2_fx.ts, his yes to them). Its cold rake is in its own pictures (makeFrostShadeArt, SHADE_FROST); here, the patch
// of frost its blow leaves before it (game/action_f2.ts RIME_PERIL): spreading, lying, melting in; flat, under the figures.
import { RIME, RIME_CANVAS, rimePainted } from '../../art/action_f2_fx';
import { toSprite } from '../../art/kit';
import { drawSprite } from '../../engine/px';
import type { Sprite } from '../../engine/px';
import { RIME_PERIL } from '../../game/action_f2';
import { keptPictures } from './kept';
import type { Act1Fx } from './types';

const FPS = 30;
const MADE = keptPictures<number, Sprite>(true);
function frame(k: number): Sprite {
  let s = MADE.get(k);
  if (!s) MADE.set(k, (s = toSprite(rimePainted(k / FPS), null, RIME_CANVAS.ax, RIME_CANVAS.ay)));
  return s;
}

export const FX: Act1Fx | null = {
  ground(c, m, p) {
    if (m || !p || p.a1 !== RIME_PERIL || !c.g || p.t < 0 || p.t > RIME.lie) return;
    const [sx, sy] = c.at(p.x, p.y);
    drawSprite(c.g, frame(Math.floor(p.t * FPS)), sx, sy);
  },
};
