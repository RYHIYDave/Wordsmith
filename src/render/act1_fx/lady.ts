// ACT 2, PART TWO, THE HIGH CITY: FLOOR 18: THE LADIES-IN-WAITING: what they cast, drawn (render/act1_fx/types.ts), from the art
// chat's (art/gallery_ladies_fx.ts; brought in at his word of 2 Nov 2026, “All of it in this one”):
// - THE FLASH'S LIGHT ON THE FLOOR (flashPainted), under every figure, before her as she faces: the spot of light skittering where
//   it will fall through her wind-up, then the cone of cold light landing, held, broken up and gone; and its round in the enemy's
//   pink through her wind-up, as every blow of the act's is warned. The light in the air is in her own picture.
import { FLASH_CANVAS, FLASH_FX, flashPainted } from '../../art/gallery_ladies_fx';
import { LD_FLASH } from '../../art/gallery_ladies_moves';
import { toSprite } from '../../art/kit';
import { flipSprite } from '../../engine/px';
import type { Sprite } from '../../engine/px';
import { LADY_TUNE, flashHalf } from '../../game/act1_rules/lady';
import { drawFanWarn, warnK } from './garden_warn';
import type { Act1Fx } from './types';

const FPS = 30;
const MADE = new Map<string, Sprite>();
function light(k: number, back: boolean, flip: boolean): Sprite {
  const key = `${k}:${back ? 1 : 0}:${flip ? 1 : 0}`;
  let s = MADE.get(key);
  if (!s) {
    if (flip) s = flipSprite(light(k, back, false));
    else s = toSprite(flashPainted(k / FPS, back ? 'back' : 'front'), null, FLASH_CANVAS.ax, FLASH_CANVAS.ay);
    MADE.set(key, s);
  }
  return s;
}
const LONG = FLASH_FX.hold + FLASH_FX.fade;

export const FX: Act1Fx | null = {
  ground(c, m) {
    if (!c.g || !m || !m.act || m.act.id !== 'lady:flash') return;
    const t = m.act.t - LD_FLASH.hit;
    // (its round, in the enemy's pink, through her wind-up)
    const k = warnK(m.act.t, LD_FLASH.warn[0], LD_FLASH.hit);
    if (k >= 0) {
      const R = LADY_TUNE.flash.reach;
      const half = Math.atan2(flashHalf(R), R);
      drawFanWarn(c.g, c.at, { x: m.x, y: m.y, fx: m.fx, fy: m.fy, hand: m.act.hand }, -half, half, R, k * 0.7, c.t);
    }
    // (the light on the floor before her)
    if (t < -FLASH_FX.warn || t > LONG) return;
    const f = Math.floor(t * FPS);
    const sp = light(f, m.fx + m.fy < -0.2, m.fx - m.fy < 0);
    const [sx, sy] = c.at(m.x, m.y);
    c.g.drawImage(sp.img, Math.round(sx) - sp.ax, Math.round(sy) - sp.ay, sp.w, sp.h);
  },
};
