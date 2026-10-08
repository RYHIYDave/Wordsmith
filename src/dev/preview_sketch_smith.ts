// Dev page: one of the rough sketches for the start screen (dev/sketch_smith.ts), as a phone held
// sideways would show it: the sketch with every pixel doubled, and over it the name of the game
// and the menu's buttons where the game would draw them.
//   node tools/preview.mjs src/dev/preview_sketch_smith.ts shots/sketch/desk.png 1014 468 "n=0"
//   hash = n=<which sketch, from 0>[,bare]      bare: no name and no buttons

import { drawText, textWidth } from '../engine/font';
import { THEME } from '../ui/ui';
import { SKETCHES, SKH, SKW } from './sketch_smith';

const hash = decodeURIComponent(location.hash.slice(1));
const n = Number((/n=(\d+)/.exec(hash) ?? [])[1]) || 0;
const S = 2;
const VW = 507;
const VH = 234;

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
g.drawImage(SKETCHES[Math.min(n, SKETCHES.length - 1)].paint().toCanvas(), 0, 0, SKW * 2, SKH * 2);

if (!hash.includes('bare')) {
  drawText(g, 'WORDSMITH', Math.floor(VW / 2), 3, THEME.text, { align: 'center', scale: 3, shadow: THEME.call });
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
