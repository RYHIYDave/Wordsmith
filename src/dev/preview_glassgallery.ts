// Dev page: FLOOR 18, THE GLASS GALLERY, BUILT FROM ITS GAME-READY PARTS: its ground painted by the game's painter in the
// gallery's look (art/glassgallery.ts) from a level laid by hand (dev/glass_level.ts), its pieces (art/floor18.ts) set on it
// as the game sets them (dev/glass_lay.ts), far to near, with the knight in the gallery. Nothing of the game imports it.
//   PREVIEW_TIMEOUT=400000 node tools/preview.mjs src/dev/preview_glassgallery.ts shots/glass/game.png 1200 840 "overview"
//   ... "phone" (one phone screen, the camera on the hero, the dungeon's dark as the game lays it and the candles' light:
//   1014 x 468), "bare" (the ground alone, no pieces), "tiles" (the tiles drawn over it), "whole" (the whole level, 2400 x
//   1500), "close:X:Y" (twice as big round picture pixel X, Y of the overview)
import type { Sprite } from '../engine/px';
import { makeHeroArt3 } from '../art/heroes3';
import { glassGalleryTerrain, paintGlassGallery } from '../art/glassgallery';
import { pictureOf } from '../art/terrain';
import { T_FLOOR } from '../game/types';
import { L_HERO, LH, LW, glassFloor, glassLand, isSkyHole } from './glass_level';
import { layGlassPieces } from './glass_lay';

const [mode = 'overview', cxArg = '600', cyArg = '400'] = decodeURIComponent(location.hash.slice(1)).split(':');
const whole = mode === 'whole';
const W = whole ? 2400 : 1200;
const H = whole ? 1500 : 840;
const floor = glassFloor();
const T = glassGalleryTerrain(glassLand(floor));
const phone = mode === 'phone';
const [hx, hy] = whole ? pictureOf(LW / 2, LH / 2) : phone ? pictureOf(L_HERO[0], L_HERO[1]) : pictureOf(20, 10.5);
/** The picture's top left in the world's picture (the overview on the gallery and the rooms behind it; the phone on the hero). */
const VX = Math.round(hx - W / 2);
const VY = Math.round(hy - H / 2 - (phone ? 60 : 0));

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
const stands: Stand[] = mode === 'bare' || mode === 'tiles' ? [] : layGlassPieces();
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

/** Where each light of what is laid is on the picture, its reach and strength. */
function lightsOf(laid: readonly Stand[]): { x: number; y: number; r: number; a: number; color: string }[] {
  const out: { x: number; y: number; r: number; a: number; color: string }[] = [];
  for (const l of laid) {
    const sp = l.s;
    if (!sp.lights) continue;
    const [sx0, sy0] = pictureOf(l.x, l.y);
    const d = sp.density ?? 1;
    for (const L of sp.lights) out.push({ x: sx0 - VX - sp.ax * d + L.x * d, y: sy0 - VY - sp.ay * d + L.y * d, r: L.r * d, a: L.a ?? 0.5, color: L.color });
  }
  return out;
}
/**
 * THE DUNGEON'S DARK as the game lays it (render.ts: FAR_DARK 0.88 over all, the hero's wide gentle pool and his bright
 * one taken out of it, the vignette), and taken away round each candle as round a brazier; then the candles' light.
 */
function dark(ls: ReturnType<typeof lightsOf>): void {
  const c = document.createElement('canvas');
  c.width = W;
  c.height = H;
  const d = c.getContext('2d') as CanvasRenderingContext2D;
  d.fillStyle = 'rgba(6,4,14,0.88)';
  d.fillRect(0, 0, W, H);
  d.globalCompositeOperation = 'destination-out';
  const [hx0, hy0] = pictureOf(L_HERO[0], L_HERO[1]);
  const pool = (x: number, y: number, r: number, strength: number): void => {
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
  pool(hx0 - VX, hy0 - VY - 16, 380 * 2, 0.36);
  pool(hx0 - VX, hy0 - VY - 16, 165 * 2, 1);
  for (const L of ls) pool(L.x, L.y, L.r * 1.3, Math.min(0.9, L.a * 1.4));
  g.drawImage(c, 0, 0);
  const grd = g.createRadialGradient(W / 2, H / 2, 0.5 * Math.hypot(W, H) / 2 / Math.SQRT2, W / 2, H / 2, Math.hypot(W, H) / 2);
  grd.addColorStop(0, 'rgba(6,4,14,0)');
  grd.addColorStop(1, 'rgba(6,4,14,0.62)');
  g.fillStyle = grd;
  g.fillRect(0, 0, W, H);
  g.save();
  g.globalCompositeOperation = 'lighter';
  for (const L of ls) {
    const gg = g.createRadialGradient(L.x, L.y, 0, L.x, L.y, L.r);
    gg.addColorStop(0, L.color);
    gg.addColorStop(1, 'rgba(0,0,0,0)');
    g.globalAlpha = L.a * 0.5;
    g.fillStyle = gg;
    g.fillRect(L.x - L.r, L.y - L.r, 2 * L.r, 2 * L.r);
  }
  g.restore();
}
if (phone) dark(lightsOf(stands));

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
