// Dev helpers for THE SILENT ORDER's pages and film (src/dev/preview_silent_order.ts, src/dev/order_film_plan.ts): the
// ballroom floor, laying a sprite, a soft shadow, the frames of a move (kept). Nothing of the game imports it.
import type { Sprite } from '../engine/px';
import { makeHeroArt3 } from '../art/heroes3';
import { toSprite } from '../art/kit';
import { canvasOf, deathOfMob, paintMob } from '../art/new_mobs3';
import type { Mob } from '../art/new_mobs3';
import type { GameView } from '../art/skin';

const GRID = Math.sqrt(2 / 3);
const TILE = 32 / GRID;
/** THE BALLROOM FLOOR: black and grey marble in tiles, a fine seam between them (the measure of a tile, for the eye). */
export function floor(gx: CanvasRenderingContext2D, w: number, h: number, ox: number, oy: number, k: number, view: GameView): void {
  const img = gx.createImageData(w, h);
  const d = img.data;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      // (back from the screen to the floor: the inverse of the view's projection, in the figure's own lengths)
      const sx = (x - ox) / k / GRID;
      const sy = ((y - oy) / k / GRID) * 2;
      const fx = view === 'front' ? (sx + sy) / 2 : (sx - sy) / 2;
      const fy = view === 'front' ? (sx - sy) / 2 : (-sx - sy) / 2;
      const tx = fx / TILE;
      const ty = fy / TILE;
      const ix = Math.floor(tx);
      const iy = Math.floor(ty);
      const ex = Math.min(tx - ix, ix + 1 - tx);
      const ey = Math.min(ty - iy, iy + 1 - ty);
      const seam = Math.min(ex, ey) < 0.035 / Math.max(0.5, k / 2);
      const dark = (ix + iy) % 2 === 0;
      const vein = Math.sin(fx * 0.21 + Math.sin(fy * 0.13) * 3) * Math.sin(fy * 0.17 - fx * 0.05);
      let c: [number, number, number] = dark ? [21, 20, 26] : [36, 34, 43];
      if (vein > 0.9) c = dark ? [26, 25, 32] : [42, 40, 50];
      if (seam) c = [12, 11, 16];
      // (the dark of the room toward the edges)
      const vx = (x / w - 0.5) * 2;
      const vy = (y / h - 0.5) * 2;
      const fade = 1 - 0.35 * Math.min(1, vx * vx * 0.6 + vy * vy * 0.6);
      const i = (y * w + x) * 4;
      d[i] = c[0] * fade;
      d[i + 1] = c[1] * fade;
      d[i + 2] = c[2] * fade;
      d[i + 3] = 255;
    }
  }
  gx.putImageData(img, 0, 0);
}
export function draw(gx: CanvasRenderingContext2D, s: Sprite, x: number, y: number, k: number, flip = false): void {
  const d = s.density ?? 1;
  if (!flip) {
    gx.drawImage(s.img, Math.round(x - s.ax * d * k), Math.round(y - s.ay * d * k), s.w * d * k, s.h * d * k);
    return;
  }
  gx.save();
  gx.translate(Math.round(x), 0);
  gx.scale(-1, 1);
  gx.drawImage(s.img, Math.round(-s.ax * d * k), Math.round(y - s.ay * d * k), s.w * d * k, s.h * d * k);
  gx.restore();
}
export function shadow(gx: CanvasRenderingContext2D, x: number, y: number, r: number, k: number): void {
  gx.save();
  gx.fillStyle = 'rgba(4,3,8,0.55)';
  gx.beginPath();
  gx.ellipse(x, y, r * k, r * k * 0.5, 0, 0, Math.PI * 2);
  gx.fill();
  gx.restore();
}
const SPRITES = new Map<string, Sprite>();
/** (forget the oldest when there are many: a film paints thousands) */
const KEEP = 900;
export function spOf(mob: Mob, which: string, t: number, view: GameView): Sprite {
  const key = `${mob.id}:${which}:${t.toFixed(4)}:${view}`;
  let s = SPRITES.get(key);
  if (!s) {
    const can = canvasOf(mob);
    s = which === 'dying' ? toSprite(deathOfMob(mob, Math.min(1, t / mob.dieTime), view), null, can.ax, can.ay) : toSprite(paintMob(mob, which, t, view), mob.aura, can.ax, can.ay);
    SPRITES.set(key, s);
    if (SPRITES.size > KEEP) SPRITES.delete(SPRITES.keys().next().value as string);
  }
  return s;
}
export const hero = makeHeroArt3().of('warrior', { twoHanded: false });
