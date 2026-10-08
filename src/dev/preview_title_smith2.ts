// Dev page: the new start-screen picture (art/title_smith2.ts: the old skald leaning over us, seen
// from the floor), for looking at while it is painted.
//   node tools/preview.mjs src/dev/preview_title_smith2.ts shots/smith2.png 1280 720              the whole picture, twice its size
//   node tools/preview.mjs src/dev/preview_title_smith2.ts shots/smith2.png 1014 468 "507x234,ui" the part of it a phone held sideways shows
//   hash = [<w>x<h>][,s=<scale>][,ui][,t=<seconds>][,still][,look=<a>+<b>...][,crop=x,y,w,h]
//     <w>x<h>   the screen, in game pixels
//     s         screen pixels to a game pixel (default 2)
//     ui        the name of the game and the menu's three buttons drawn over it, where the game draws them
//     t         the moment of the picture's life to show (default 3.4)
//     still     the picture alone, with none of its life
//     look      what else glows: any of braziers, runes, lanterns, rising, moon, veins, joined by +
//     crop      a part of the picture alone, at scale s (for looking closely)

import { SMITH2_H, SMITH2_W, makeSmith2Title } from '../art/title_smith2';
import type { Smith2Look } from '../art/title_smith2';
import { drawText, textWidth } from '../engine/font';
import { THEME } from '../ui/ui';

const hash = decodeURIComponent(location.hash.slice(1));
const size = /(\d+)x(\d+)/.exec(hash);
const S = Number((/s=(\d+)/.exec(hash) ?? [])[1]) || 2;
const T = Number((/t=([\d.]+)/.exec(hash) ?? [])[1]) || 3.4;
const crop = /crop=(\d+),(\d+),(\d+),(\d+)/.exec(hash);
const look: Partial<Smith2Look> = {};
for (const name of ((/look=([a-z+]+)/.exec(hash) ?? [])[1] ?? '').split('+')) {
  if (name === 'braziers' || name === 'runes' || name === 'lanterns' || name === 'rising' || name === 'moon' || name === 'veins') look[name] = true;
}
const t0 = performance.now();
const art = makeSmith2Title(look);
console.log(`makeSmith2Title took ${(performance.now() - t0).toFixed(1)} ms`);
const t1 = performance.now();
art.warm?.();
console.log(`the frames of his breath took ${(performance.now() - t1).toFixed(1)} ms`);

const VW = crop ? +crop[3] : size ? +size[1] : SMITH2_W;
const VH = crop ? +crop[4] : size ? +size[2] : SMITH2_H;

const cv = document.createElement('canvas');
cv.width = VW * S;
cv.height = VH * S;
cv.style.position = 'static';
cv.style.display = 'block';
for (const el of [document.documentElement, document.body]) {
  el.style.height = 'auto';
  el.style.overflow = 'visible';
}
document.body.style.margin = '0';
document.body.style.width = `${cv.width}px`;
document.body.style.background = '#000';
document.body.appendChild(cv);
const g = cv.getContext('2d') as CanvasRenderingContext2D;
g.imageSmoothingEnabled = false;
g.scale(S, S);
g.fillStyle = '#05040f';
g.fillRect(0, 0, VW, VH);

const ox = crop ? -+crop[1] : Math.floor((VW - art.w) / 2);
const oy = crop ? -+crop[2] : size ? VH - art.lift - art.lip : 0;
g.drawImage(art.still, ox, oy);
if (!hash.includes('still')) g.drawImage(art.life(T), ox, oy);
if (!crop && hash.includes('ui')) {
  drawText(g, 'WORDSMITH', Math.floor(VW / 2), 5, THEME.text, { align: 'center', scale: 3, shadow: THEME.call });
  const labels = ['NEW GAME', 'LEXICON', 'OPTIONS'];
  const bw = 132;
  const bh = 22;
  const gap = 4;
  const x0 = Math.floor((VW - labels.length * bw - (labels.length - 1) * gap) / 2);
  const y = VH - 3 - bh;
  labels.forEach((label, i) => {
    const x = x0 + i * (bw + gap);
    g.fillStyle = i === 0 ? THEME.callHi : THEME.edgeHi;
    g.fillRect(x, y, bw, bh);
    g.fillStyle = i === 0 ? THEME.call : THEME.bg2;
    g.fillRect(x + 1, y + 1, bw - 2, bh - 2);
    drawText(g, label, x + Math.floor(bw / 2) - Math.floor(textWidth(label) / 2), y + 8, i === 0 ? '#ffffff' : THEME.text);
  });
}

(window as unknown as { __ready: boolean }).__ready = true;
