// Dev page: FLOOR 20, THE QUIET TOWER, a first look (dev/tower_paint.ts), with the knight in it for scale. Nothing of the
// game imports it.
//   PREVIEW_TIMEOUT=200000 node tools/preview.mjs src/dev/preview_tower.ts shots/tower/top.png 1200 840 "top"
//   PREVIEW_TIMEOUT=200000 node tools/preview.mjs src/dev/preview_tower.ts shots/tower/top_phone.png 1014 468 "top-phone"
//     top              the Tower Top, the Moth's floor without the Moth (600 x 420 game pixels at two picture pixels each)
//     top-phone        one phone screen of it as the game would show it, the camera on the hero (507 x 234 game pixels)
//     top-close:X:Y    one part of it twice as big, round picture pixel (X, Y)
//     inside           the scriptorium, a floor inside the tower
//     inside-phone     one phone screen of it, the camera on the hero, the dungeon's dark as the game lays it
//     inside-close:X:Y one part of it twice as big
import type { Sprite } from '../engine/px';
import { makeHeroArt3 } from '../art/heroes3';
import { H, W, paintScriptorium, paintTowerTop } from './tower_paint';
import type { Painting } from './tower_paint';

const [mode = 'top', cxArg = '600', cyArg = '400'] = decodeURIComponent(location.hash.slice(1)).split(':');
const inside = mode.startsWith('inside');
const P: Painting = inside ? paintScriptorium() : paintTowerTop();

const cv = document.createElement('canvas');
cv.width = W;
cv.height = H;
cv.style.display = 'block';
document.body.style.margin = '0';
document.body.style.background = '#000';
document.body.appendChild(cv);
const g = cv.getContext('2d') as CanvasRenderingContext2D;
g.imageSmoothingEnabled = false;
g.drawImage(P.p.toCanvas(), 0, 0);

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
const stand = (s: Sprite, px: number, py: number, shadow = 0): void => {
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
stand(hero.front.idle[0], P.hero[0], P.hero[1], 0.36);

/** THE DUNGEON'S DARK as the game lays it (render.ts: FAR_DARK 0.88 over all, the hero's pools taken out of it, the lights', the vignette). */
function dark(): void {
  const c = document.createElement('canvas');
  c.width = W;
  c.height = H;
  const d = c.getContext('2d') as CanvasRenderingContext2D;
  d.fillStyle = 'rgba(6,4,14,0.88)';
  d.fillRect(0, 0, W, H);
  d.globalCompositeOperation = 'destination-out';
  const spot = (x: number, y: number, r: number, strength: number): void => {
    d.save();
    d.translate(x, y);
    d.scale(1, 0.62);
    const grd = d.createRadialGradient(0, 0, 0, 0, 0, r);
    grd.addColorStop(0, `rgba(0,0,0,${strength})`);
    grd.addColorStop(0.5, `rgba(0,0,0,${0.7 * strength})`);
    grd.addColorStop(1, 'rgba(0,0,0,0)');
    d.fillStyle = grd;
    d.fillRect(-r, -r, 2 * r, 2 * r);
    d.restore();
  };
  spot(P.hero[0], P.hero[1] - 16, 760, 0.36);
  spot(P.hero[0], P.hero[1] - 16, 330, 1);
  for (const L of P.lights) spot(L.x, L.y, L.r * 1.3, Math.min(0.9, L.a * 1.4));
  g.drawImage(c, 0, 0);
  const grd = g.createRadialGradient(W / 2, H / 2, (0.5 * Math.hypot(W, H)) / 2 / Math.SQRT2, W / 2, H / 2, Math.hypot(W, H) / 2);
  grd.addColorStop(0, 'rgba(6,4,14,0)');
  grd.addColorStop(1, 'rgba(6,4,14,0.62)');
  g.fillStyle = grd;
  g.fillRect(0, 0, W, H);
}
/** The lights' glow over the dark (the candles' honest flame, the chapter's own pale light). */
function glow(): void {
  g.save();
  g.globalCompositeOperation = 'lighter';
  for (const L of P.lights) {
    const grd = g.createRadialGradient(L.x, L.y, 0, L.x, L.y, L.r);
    grd.addColorStop(0, L.color);
    grd.addColorStop(1, 'rgba(0,0,0,0)');
    g.globalAlpha = L.a * 0.5;
    g.fillStyle = grd;
    g.fillRect(L.x - L.r, L.y - L.r, 2 * L.r, 2 * L.r);
  }
  g.restore();
}

const crop = (cx: number, cy: number, sw: number, sh: number, k: number): void => {
  const src = document.createElement('canvas');
  src.width = W;
  src.height = H;
  (src.getContext('2d') as CanvasRenderingContext2D).drawImage(cv, 0, 0);
  cv.width = sw;
  cv.height = sh;
  const g2 = cv.getContext('2d') as CanvasRenderingContext2D;
  g2.imageSmoothingEnabled = false;
  g2.fillStyle = '#07080c';
  g2.fillRect(0, 0, sw, sh);
  g2.drawImage(src, Math.round(cx - sw / k / 2), Math.round(cy - sh / k / 2), sw / k, sh / k, 0, 0, sw, sh);
};
if (mode === 'inside-phone') {
  dark();
  glow();
  crop(P.hero[0], P.hero[1] - 20, 1014, 468, 1);
} else if (mode === 'top-phone') crop(P.hero[0], P.hero[1] - 20, 1014, 468, 1);
else if (mode === 'top-close' || mode === 'inside-close') crop(Number(cxArg), Number(cyArg), 1014, 468, 2);
(window as unknown as { __ready: boolean }).__ready = true;
