// Dev page: the frames of a moving picture of the new start screen (art/title_smith2.ts), for
// tools/smith2_gif.mjs to collect and join into a GIF: the part of the picture a phone held
// sideways shows, with the name of the game and the menu's buttons where the game draws them,
// and the picture's life running.
//   node tools/smith2_gif.mjs previews/start_screen_moving.gif [seconds=7] [fps=12] [scale=2] [every=0] [look]
//   hash = <seconds>:<fps>:<scale>:<look>     look: what else glows, joined by + (braziers+runes ...)
// The page offers window.__frame(i), which draws frame i and returns it as a PNG.

import { makeSmith2Title } from '../art/title_smith2';
import type { Smith2Look } from '../art/title_smith2';
import { drawText, textWidth } from '../engine/font';
import { THEME } from '../ui/ui';

const [secArg = '', fpsArg = '', scaleArg = '', lookArg = ''] = decodeURIComponent(location.hash.slice(1)).split(':');
const SECONDS = Number(secArg) || 7;
const FPS = Number(fpsArg) || 12;
const S = Number(scaleArg) || 2;
const VW = 507;
const VH = 234;

const look: Partial<Smith2Look> = {};
for (const name of lookArg.split('+')) {
  if (name === 'braziers' || name === 'runes' || name === 'lanterns' || name === 'rising' || name === 'moon' || name === 'veins') look[name] = true;
}
const art = makeSmith2Title(look);
// (every frame of his breath, before the first is recorded)
art.warm?.();
const cv = document.createElement('canvas');
cv.width = VW * S;
cv.height = VH * S;
cv.style.position = 'static';
cv.style.display = 'block';
document.body.style.margin = '0';
document.body.style.background = '#000';
document.body.appendChild(cv);
const g = cv.getContext('2d') as CanvasRenderingContext2D;
g.imageSmoothingEnabled = false;
g.scale(S, S);

function draw(t: number): void {
  g.fillStyle = '#05040f';
  g.fillRect(0, 0, VW, VH);
  const ox = Math.floor((VW - art.w) / 2);
  const oy = VH - art.lift - art.lip;
  g.drawImage(art.still, ox, oy);
  g.drawImage(art.life(t), ox, oy);
  drawText(g, 'WORDSMITH', Math.floor(VW / 2), 5, THEME.text, { align: 'center', scale: 3, shadow: THEME.call });
  const labels = ['NEW GAME', 'LEXICON', 'OPTIONS'];
  const bw = 132;
  const bh = 22;
  const gap = 4;
  const x0 = Math.floor((VW - labels.length * bw - (labels.length - 1) * gap) / 2);
  const y = VH - 3 - bh;
  labels.forEach((label, i) => {
    const x = x0 + i * (bw + gap);
    // (the one to press blinks, as it does in the game)
    const lit = i === 0 && Math.floor(t * 2) % 2 === 0;
    g.fillStyle = i === 0 ? THEME.callHi : THEME.edgeHi;
    g.fillRect(x, y, bw, bh);
    g.fillStyle = i === 0 ? (lit ? THEME.callHi : THEME.call) : THEME.bg2;
    g.fillRect(x + 1, y + 1, bw - 2, bh - 2);
    drawText(g, label, x + Math.floor(bw / 2) - Math.floor(textWidth(label) / 2), y + 8, i === 0 ? '#ffffff' : THEME.text);
  });
}

const w = window as unknown as { __ready: boolean; __frames: number; __tickMs: number; __frame: (i: number) => string };
w.__frames = Math.round(SECONDS * FPS);
w.__tickMs = 1000 / FPS;
w.__frame = (i: number): string => {
  draw(i / FPS);
  return cv.toDataURL('image/png');
};
draw(0);
w.__ready = true;
