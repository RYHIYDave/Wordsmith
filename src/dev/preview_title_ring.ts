// Dev page: the start screen's new picture, the ring on the hill (art/title_ring.ts).
//   node tools/preview.mjs src/dev/preview_title_ring.ts shots/ring.png 1280 720                  the whole picture, twice its size
//   node tools/preview.mjs src/dev/preview_title_ring.ts shots/ring.png 1014 468 "507x234,ui"     as his phone held sideways shows it, the name and buttons on it
//   node tools/page_gif.mjs src/dev/preview_title_ring.ts "507x234,ui,film=12" shots/ring.gif    a film of its life (frames in shots/gif_frames_*), 30 a second
//   hash = [<w>x<h>][,s=<scale>][,ui][,t=<seconds>][,pixel] (pixel: painted pixel by pixel, as paintRing does, not laid up as the game does)

import { RING_H, RING_W, makeRingTitle, paintRing } from '../art/title_ring';
import { drawText, textWidth } from '../engine/font';
import { smithLayout } from '../ui/panels';
import { THEME } from '../ui/ui';

const hash = decodeURIComponent(location.hash.slice(1));
const size = /(\d+)x(\d+)/.exec(hash);
const S = Number((/s=(\d+)/.exec(hash) ?? [])[1]) || 2;
const T = Number((/t=([\d.]+)/.exec(hash) ?? [])[1]) || 0;

for (const el of [document.documentElement, document.body]) {
  el.style.height = 'auto';
  el.style.overflow = 'visible';
}
document.body.style.margin = '0';
document.body.style.background = '#000';

const t0 = performance.now();
const pic = makeRingTitle();
console.log(`laid up in ${(performance.now() - t0).toFixed(0)} ms`);
const t1 = performance.now();
for (let i = 0; i < 60; i++) pic.life(i / 30);
console.log(`a frame of its life: ${((performance.now() - t1) / 60).toFixed(2)} ms`);
const film = /film=([\d.]+)/.exec(hash);
const frameAt = (t: number): HTMLCanvasElement => (hash.includes('pixel') ? paintRing(t).canvas() : pic.life(t));

const VW = size ? +size[1] : RING_W;
const VH = size ? +size[2] : RING_H;
const cv = document.createElement('canvas');
cv.width = VW * S;
cv.height = VH * S;
cv.style.display = 'block';
document.body.appendChild(cv);
const g = cv.getContext('2d') as CanvasRenderingContext2D;
g.imageSmoothingEnabled = false;
g.scale(S, S);
function draw(t: number): void {
  g.fillStyle = '#05040f';
g.fillRect(0, 0, VW, VH);
const still = frameAt(t);
if (size) {
  const lay = smithLayout(VW, VH, true, 3, textWidth('WORDSMITH'), pic);
  g.drawImage(still, Math.floor((VW - pic.w) / 2), lay.oy);
  if (hash.includes('ui')) {
    drawText(g, 'WORDSMITH', Math.floor(VW / 2), lay.nameY, THEME.text, { align: 'center', scale: lay.big, shadow: THEME.call });
    ['NEW GAME', 'LEXICON', 'OPTIONS'].forEach((label, i) => {
      const r = lay.rects[i];
      g.fillStyle = i === 0 ? THEME.callHi : THEME.edgeHi;
      g.fillRect(r.x, r.y, r.w, r.h);
      g.fillStyle = i === 0 ? THEME.call : THEME.bg2;
      g.fillRect(r.x + 1, r.y + 1, r.w - 2, r.h - 2);
      drawText(g, label, r.x + Math.floor(r.w / 2) - Math.floor(textWidth(label) / 2), r.y + 8, i === 0 ? '#ffffff' : THEME.text);
    });
  }
} else g.drawImage(still, 0, 0);
const [fc, fk] = pic.flash(t);
if (fk > 0 && !hash.includes('pixel')) {
  g.globalAlpha = fk;
  g.fillStyle = fc;
  g.fillRect(0, 0, VW, VH);
  g.globalAlpha = 1;
}
}

draw(T);
const w = window as unknown as { __ready: boolean; __frames: number; __tickMs: number; __frame(k: number): string };
if (film) {
  w.__frames = Math.round(+film[1] * 30);
  w.__tickMs = 1000 / 30;
  w.__frame = (k: number): string => {
    draw(k / 30);
    return cv.toDataURL('image/png');
  };
}
w.__ready = true;
