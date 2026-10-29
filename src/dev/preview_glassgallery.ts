// Dev page: FLOOR 18, THE GLASS GALLERY, BUILT FROM ITS GAME-READY PARTS: its ground painted by the game's painter in the
// gallery's look (art/glassgallery.ts) from a level laid by hand (dev/glass_level.ts), with the knight in the gallery.
// Nothing of the game imports it.
//   PREVIEW_TIMEOUT=400000 node tools/preview.mjs src/dev/preview_glassgallery.ts shots/glass/game.png 1200 840 "overview"
//   ... "phone" (one phone screen, the camera on the hero: 1014 x 468), "bare" (the ground alone, no pieces), "tiles" (the
//   tiles drawn over it), "whole" (the whole level, 2400 x 1500), "close:X:Y" (twice as big round picture pixel X, Y)
import type { Sprite } from '../engine/px';
import { makeHeroArt3 } from '../art/heroes3';
import { glassGalleryTerrain, paintGlassGallery } from '../art/glassgallery';
import { pictureOf } from '../art/terrain';
import { T_FLOOR } from '../game/types';
import { L_HERO, LH, LW, glassFloor, glassLand, isSkyHole } from './glass_level';

const [mode = 'overview', cxArg = '600', cyArg = '400'] = decodeURIComponent(location.hash.slice(1)).split(':');
const whole = mode === 'whole';
const W = whole ? 2400 : 1200;
const H = whole ? 1500 : 840;
const floor = glassFloor();
const T = glassGalleryTerrain(glassLand(floor));
const [hx, hy] = whole ? pictureOf(LW / 2, LH / 2) : pictureOf(L_HERO[0], L_HERO[1]);
/** The picture's top left in the world's picture: the hero a little below the middle. */
const VX = Math.round(hx - W / 2);
const VY = Math.round(hy - H / 2 - (whole ? 0 : 60));

const cv = document.createElement('canvas');
cv.width = W;
cv.height = H;
cv.style.display = 'block';
document.body.style.margin = '0';
document.body.style.background = '#000';
document.body.appendChild(cv);
const g = cv.getContext('2d') as CanvasRenderingContext2D;
g.imageSmoothingEnabled = false;
const PIECE = 256;
for (let py = 0; py < H; py += PIECE) {
  for (let px = 0; px < W; px += PIECE) {
    const pw = Math.min(PIECE, W - px);
    const ph = Math.min(PIECE, H - py);
    const p = paintGlassGallery(T, VX + px, VY + py, pw, ph, isSkyHole);
    g.putImageData(new ImageData(p.rgba, pw, ph), px, py);
  }
}
if (mode === 'tiles') {
  g.lineWidth = 1;
  for (let ty = 0; ty < floor.h; ty++) {
    for (let tx = 0; tx < floor.w; tx++) {
      if (floor.tiles[ty * floor.w + tx] !== T_FLOOR) continue;
      const pts: [number, number][] = [[tx, ty], [tx + 1, ty], [tx + 1, ty + 1], [tx, ty + 1]];
      g.strokeStyle = 'rgba(255, 255, 255, 0.3)';
      g.beginPath();
      pts.forEach(([x, y], n) => {
        const [sx, sy] = pictureOf(x, y);
        if (n) g.lineTo(sx - VX + 0.5, sy - VY + 0.5);
        else g.moveTo(sx - VX + 0.5, sy - VY + 0.5);
      });
      g.closePath();
      g.stroke();
    }
  }
}

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
export interface Stand { d: number; s: Sprite; x: number; y: number; shadow: number; under?: boolean; name?: string }
const stands: Stand[] = [];
const hero = makeHeroArt3().of('warrior', { twoHanded: false });
stands.push({ d: L_HERO[0] + L_HERO[1], s: hero.front.idle[0], x: L_HERO[0], y: L_HERO[1], shadow: 0.36, name: 'hero' });
stands.sort((a, b) => (a.under === b.under ? a.d - b.d : a.under ? -1 : 1));
for (const st of stands) {
  const [px, py] = pictureOf(st.x, st.y);
  const sx = (px - VX) / 2;
  const sy = (py - VY) / 2;
  g.setTransform(2, 0, 0, 2, 0, 0);
  if (st.shadow) {
    const w = st.shadow * 22.6 * 1.5;
    const hh = st.shadow * 11.3 * 1.5;
    g.save();
    g.imageSmoothingEnabled = true;
    g.globalAlpha = 0.6;
    g.drawImage(blot, sx - w, sy - hh, w * 2, hh * 2);
    g.restore();
  }
  g.drawImage(st.s.img, Math.round(sx) - st.s.ax, Math.round(sy) - st.s.ay, st.s.w, st.s.h);
  g.setTransform(1, 0, 0, 1, 0, 0);
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
  g2.fillStyle = '#09080e';
  g2.fillRect(0, 0, sw, sh);
  g2.drawImage(src, Math.round(cx - sw / k / 2), Math.round(cy - sh / k / 2), sw / k, sh / k, 0, 0, sw, sh);
};
if (mode === 'phone') crop(W / 2, H / 2 + 60, 1014, 468, 1);
else if (mode === 'close') crop(Number(cxArg), Number(cyArg), 1200, 840, 2);
(window as unknown as { __ready: boolean }).__ready = true;
