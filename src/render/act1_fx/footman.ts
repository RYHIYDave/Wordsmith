// ACT 2, PART TWO, THE HIGH CITY: FLOOR 17: THE FOOTMEN: what they do, drawn (render/act1_fx/types.ts). His throw and swing and
// their smears are in his own pictures (art/masque_footmen_moves.ts); here:
// - THE TRAY IN FLIGHT, from as it leaves his hand to as he catches it, the art's trayShotPainted along its loop, anchored at his
//   floor point and turned as he is (his pictures leave the tray off his hand for just that long);
// - THE FIRE FAN from as the candelabrum comes down, the art's firePainted, while his swing lasts;
// - THEIR WARNINGS through each wind-up, in the enemy's pink: the tray's way out and back, a strip six tiles before him; the
//   fire's wedge (game/act1_rules/footman.ts FOOTMAN_TUNE.fire).
import { toSprite } from '../../art/kit';
import { FIRE_CANVAS, TRAY_SHOT_CANVAS, firePainted, trayShotPainted } from '../../art/masque_footmen_fx';
import { FM_SWING, FM_THROW, TRAY_FLIGHT, trayFlight } from '../../art/masque_footmen_moves';
import { flipSprite } from '../../engine/px';
import type { Sprite } from '../../engine/px';
import { FOOTMAN_TUNE } from '../../game/act1_rules/footman';
import { drawFanWarn, drawStripWarn, warnK } from './garden_warn';
import type { Act1Fx } from './types';

const FPS = 30;
const MADE = new Map<string, Sprite>();
/** One frame of the tray's flight or of the fire, seen from in front or behind, made the first time it is asked for. */
function frame(what: 'tray' | 'fire', k: number, back: boolean, flip: boolean): Sprite {
  const key = `${what}:${k}:${back ? 1 : 0}:${flip ? 1 : 0}`;
  let s = MADE.get(key);
  if (!s && flip) {
    s = flipSprite(frame(what, k, back, false));
    MADE.set(key, s);
  }
  if (!s) {
    const view = back ? 'back' : 'front';
    if (what === 'tray') {
      const t = k / FPS;
      const was = [1, 2, 3].map((j) => trayFlight(Math.max(0, t - j / FPS)).c);
      s = toSprite(trayShotPainted(trayFlight(t), view, was), null, TRAY_SHOT_CANVAS.ax, TRAY_SHOT_CANVAS.ay);
    } else s = toSprite(firePainted(k / FPS, view), null, FIRE_CANVAS.ax, FIRE_CANVAS.ay);
    MADE.set(key, s);
  }
  return s;
}

export const FX: Act1Fx | null = {
  ground(c, m) {
    if (!m || !c.g || !m.act) return;
    const w = { x: m.x, y: m.y, fx: m.fx, fy: m.fy, hand: m.act.hand };
    if (m.act.id === 'footman:tray') {
      const k = warnK(m.act.t, FM_THROW.warn[0] - 0.2, FM_THROW.hit);
      if (k >= 0) drawStripWarn(c.g, c.at, w, 0.4, FOOTMAN_TUNE.tray.reach, -1.3, 1.3, k, c.t);
    } else if (m.act.id === 'footman:fire') {
      const k = warnK(m.act.t, FM_SWING.warn[0] - 0.2, FM_SWING.hit);
      const F = FOOTMAN_TUNE.fire;
      if (k >= 0) drawFanWarn(c.g, c.at, w, -F.half, F.half, F.far, k, c.t);
    }
  },
  standing(c, m) {
    if (!m || !m.act) return;
    const back = m.fx + m.fy < -0.2;
    const flip = m.fx - m.fy < 0;
    const T = m.act.t;
    let s: Sprite | null = null;
    if (m.act.id === 'footman:tray' && T >= FM_THROW.hit && T < FM_THROW.catch) s = frame('tray', Math.min(Math.round(TRAY_FLIGHT.long * FPS), Math.floor((T - FM_THROW.hit) * FPS)), back, flip);
    else if (m.act.id === 'footman:fire' && T >= FM_SWING.hit) s = frame('fire', Math.floor((T - FM_SWING.hit) * FPS), back, flip);
    if (!s) return;
    const [sx, sy] = c.at(m.x, m.y);
    c.stand(m.x + m.y + 0.05, s, sx, sy);
  },
};
