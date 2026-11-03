// Dev page: FLOOR 18, THE GLASS GALLERY, a first look (dev/gallery_paint.ts), the knight before the mirrors for scale, his
// likeness faint in the glass. Nothing of the game imports it.
//   PREVIEW_TIMEOUT=200000 node tools/preview.mjs src/dev/preview_gallery.ts shots/glass/overview.png 1200 840 "overview"
//   PREVIEW_TIMEOUT=200000 node tools/preview.mjs src/dev/preview_gallery.ts shots/glass/phone.png 1014 468 "phone"
//     overview   a corner of the queen's wing (600 x 420 game pixels at two picture pixels each)
//     phone      one phone screen of it as the game would show it, the camera on the hero (507 x 234 game pixels)
//     close:X:Y  one part of it twice as big (or close:X:Y:K, K times), round picture pixel (X, Y), on 1200 x 840
import type { Sprite } from '../engine/px';
import { makeHeroArt3 } from '../art/heroes3';
import { H, HERO_AT, MIRRORS, W, at, paintGallery } from './gallery_paint';

const [mode = 'overview', cxArg = '600', cyArg = '400', kArg = '2'] = decodeURIComponent(location.hash.slice(1)).split(':');

const gallery = paintGallery();
const cv = document.createElement('canvas');
cv.width = W;
cv.height = H;
cv.style.display = 'block';
document.body.style.margin = '0';
document.body.style.background = '#000';
document.body.appendChild(cv);
const g = cv.getContext('2d') as CanvasRenderingContext2D;
g.imageSmoothingEnabled = false;
g.drawImage(gallery.p.toCanvas(), 0, 0);

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
const hero = makeHeroArt3().of('warrior', { twoHanded: false });
const knight: Sprite = hero.front.idle[0];

// HIS LIKENESS IN THE GLASS: the mirror before him gives him back, faint, cold, turned about, up the glass as far as he
// stands out from it (the eye's way turned back off the glass); only on that mirror's glass.
{
  const [kx, ky] = HERO_AT;
  const m = MIRRORS.find((q) => q.wall === 'back' && kx + ky > q.a0 && kx + ky < q.a1);
  if (m) {
    // his feet's likeness on the glass: along it kx + ky, up it 32 * ky
    const [fx, fy] = at(kx + ky, 0, 32 * ky);
    const off = document.createElement('canvas');
    off.width = W;
    off.height = H;
    const o = off.getContext('2d') as CanvasRenderingContext2D;
    o.imageSmoothingEnabled = false;
    o.setTransform(-2, 0, 0, 2, Math.round(fx), 0);
    o.drawImage(knight.img, -knight.ax, Math.round(fy / 2) - knight.ay, knight.w, knight.h);
    o.setTransform(1, 0, 0, 1, 0, 0);
    // the glass's cold silver over him, and only where that glass is
    const id = o.getImageData(0, 0, W, H);
    const base = g.getImageData(0, 0, W, H);
    const want = m.id + 1;
    for (let i = 0; i < W * H; i++) {
      if (id.data[i * 4 + 3] < 128 || gallery.glassOf[i] !== want) continue;
      const r = id.data[i * 4];
      const gg = id.data[i * 4 + 1];
      const b = id.data[i * 4 + 2];
      // (grey, then toward the glass, faint: never the friend's cyan in the glass)
      const l = (r * 0.3 + gg * 0.5 + b * 0.2) * 0.9;
      const t = 0.58;
      base.data[i * 4] = Math.round(base.data[i * 4] * (1 - t) + (l * 0.86 + 6) * t);
      base.data[i * 4 + 1] = Math.round(base.data[i * 4 + 1] * (1 - t) + (l * 0.88 + 8) * t);
      base.data[i * 4 + 2] = Math.round(base.data[i * 4 + 2] * (1 - t) + (l * 1.0 + 16) * t);
    }
    g.putImageData(base, 0, 0);
  }
}
// THE KNIGHT, his soft shadow under him
{
  const [px, py] = at(HERO_AT[0], HERO_AT[1]);
  const sx = px / 2;
  const sy = py / 2;
  g.setTransform(2, 0, 0, 2, 0, 0);
  const w = 0.36 * 22.6 * 1.5;
  const hh = 0.36 * 11.3 * 1.5;
  g.save();
  g.imageSmoothingEnabled = true;
  g.globalAlpha = 0.6;
  g.drawImage(blot, sx - w, sy - hh, w * 2, hh * 2);
  g.restore();
  g.drawImage(knight.img, Math.round(sx) - knight.ax, Math.round(sy) - knight.ay, knight.w, knight.h);
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
  g2.fillStyle = '#08070d';
  g2.fillRect(0, 0, sw, sh);
  g2.drawImage(src, Math.round(cx - sw / k / 2), Math.round(cy - sh / k / 2), sw / k, sh / k, 0, 0, sw, sh);
};
if (mode === 'phone') {
  const [hx, hy] = at(HERO_AT[0], HERO_AT[1]);
  crop(hx, hy - 20, 1014, 468, 1);
} else if (mode === 'close') {
  crop(Number(cxArg), Number(cyArg), W, H, Number(kArg));
}
(window as unknown as { __ready: boolean }).__ready = true;
