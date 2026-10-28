// Dev page: FLOOR 16, THE SWAN GARDENS, a first look (dev/garden_paint.ts), with the knight on the lake walk for scale.
// Nothing of the game imports it.
//   PREVIEW_TIMEOUT=120000 node tools/preview.mjs src/dev/preview_garden.ts shots/swans/overview.png 1200 840 "overview"
//   PREVIEW_TIMEOUT=120000 node tools/preview.mjs src/dev/preview_garden.ts shots/swans/phone.png 1014 468 "phone"
//     overview  a corner of the gardens (600 x 420 game pixels at two picture pixels each)
//     phone     one phone screen of it as the game would show it, the camera on the hero (507 x 234 game pixels)
//     close:X:Y one part of it four times as big, round picture pixel (X, Y)
import type { Sprite } from '../engine/px';
import { makeHeroArt3 } from '../art/heroes3';
import { H, HERO_AT, W, at, paintGarden, paintSwans } from './garden_paint';

const [mode = 'overview', cxArg = '600', cyArg = '400'] = decodeURIComponent(location.hash.slice(1)).split(':');

const garden = paintGarden();
paintSwans(garden);

const cv = document.createElement('canvas');
cv.width = W;
cv.height = H;
cv.style.display = 'block';
document.body.style.margin = '0';
document.body.style.background = '#000';
document.body.appendChild(cv);
const g = cv.getContext('2d') as CanvasRenderingContext2D;
g.imageSmoothingEnabled = false;
g.drawImage(garden.p.toCanvas(), 0, 0);

/** THE SOFT SHADOW the game draws under what stands (render.ts): a soft oval, darkest under it, gone at its rim. */
const blot = ((): HTMLCanvasElement => {
  const c = document.createElement('canvas');
  c.width = 64;
  c.height = 64;
  const q = c.getContext('2d') as CanvasRenderingContext2D;
  const grd = q.createRadialGradient(32, 32, 0, 32, 32, 32);
  grd.addColorStop(0, 'rgba(0,0,0,1)');
  grd.addColorStop(0.4, 'rgba(0,0,0,0.85)');
  grd.addColorStop(1, 'rgba(0,0,0,0)');
  q.fillStyle = grd;
  q.fillRect(0, 0, 64, 64);
  return c;
})();
const stand = (s: Sprite, x: number, y: number, z = 0, shadow = 0): void => {
  const [px, py] = at(x, y, z);
  const sx = px / 2;
  const sy = py / 2;
  g.setTransform(2, 0, 0, 2, 0, 0);
  if (shadow) {
    const w = shadow * 22.6 * 1.5;
    const hh = shadow * 11.3 * 1.5;
    g.save();
    g.imageSmoothingEnabled = true;
    g.globalAlpha = 0.6;
    g.drawImage(blot, sx - w, sy - hh, w * 2, hh * 2);
    g.restore();
  }
  g.drawImage(s.img, Math.round(sx) - s.ax, Math.round(sy) - s.ay, s.w, s.h);
  g.setTransform(1, 0, 0, 1, 0, 0);
};
const hero = makeHeroArt3().of('warrior', { twoHanded: false });
stand(hero.front.idle[0], HERO_AT[0], HERO_AT[1], 0, 0.36);

const crop = (cx: number, cy: number, sw: number, sh: number, k: number): void => {
  const src = document.createElement('canvas');
  src.width = W;
  src.height = H;
  (src.getContext('2d') as CanvasRenderingContext2D).drawImage(cv, 0, 0);
  cv.width = sw;
  cv.height = sh;
  const g2 = cv.getContext('2d') as CanvasRenderingContext2D;
  g2.imageSmoothingEnabled = false;
  g2.fillStyle = '#07080d';
  g2.fillRect(0, 0, sw, sh);
  g2.drawImage(src, Math.round(cx - sw / k / 2), Math.round(cy - sh / k / 2), sw / k, sh / k, 0, 0, sw, sh);
};
if (mode === 'phone') {
  // ONE PHONE SCREEN, the camera on the hero: 507 x 234 game pixels, from the picture at two picture pixels each
  const [hx, hy] = at(HERO_AT[0], HERO_AT[1]);
  crop(hx, hy - 20, 1014, 468, 1);
} else if (mode === 'close') {
  crop(Number(cxArg), Number(cyArg), 1014, 468, 4);
}
(window as unknown as { __ready: boolean }).__ready = true;
