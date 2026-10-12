// Dev page: THE START SCREEN MADE NEW FOR THE NEW WORDSMITH, moving (art/title_smith3.ts), for a film
// (tools/page_gif.mjs): a phone held sideways (507 x 234 game pixels), laid out as the game lays it
// (ui/panels.ts smithLayout: the name of the game over his head, the three buttons along the bottom),
// one whole round of the picture's life (the power running through the runes, his breath, the top
// pulsing, the letters of light going round and bursting out).
//   node tools/page_gif.mjs src/dev/preview_smith3_film.ts "new:8:2" previews/title3.gif
//   hash = <new | old>:<seconds>:<screen pixels to a game pixel>
import { SMITH3_CYCLE, makeSmith3Title } from '../art/title_smith3';
import { SMITH2_CHOSEN, makeSmith2Title } from '../art/title_smith2';
import { drawText, textWidth } from '../engine/font';
import { smithLayout } from '../ui/panels';
import { THEME } from '../ui/ui';

const [whichArg = 'new', secArg = '', scaleArg = ''] = decodeURIComponent(location.hash.slice(1)).split(':');
const SECONDS = Number(secArg) || SMITH3_CYCLE;
const S = Number(scaleArg) || 2;
const FPS = 30;
const VW = 507;
const VH = 234;
const art = whichArg === 'old' ? makeSmith2Title(SMITH2_CHOSEN) : makeSmith3Title();
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
const NAME = 'WORDSMITH';
const labels = ['NEW GAME', 'LEXICON', 'OPTIONS'];
const lay = smithLayout(VW, VH, false, labels.length, textWidth(NAME), art);

function draw(t: number): void {
  g.fillStyle = '#05040f';
  g.fillRect(0, 0, VW, VH);
  // (the screen kicks with the burst, as ui/panels.ts throws it: the picture, not the buttons)
  const [kx, ky] = (art as { kick?(t: number): readonly [number, number] }).kick?.(t) ?? [0, 0];
  const ox = Math.floor((VW - art.w) / 2) + kx;
  g.drawImage(art.still, ox, lay.oy + ky);
  g.drawImage(art.life(t), ox, lay.oy + ky);
  const [flashColor, flash] = (art as { flash?(t: number): readonly [string, number] }).flash?.(t) ?? ['', 0];
  if (flash > 0) {
    g.globalAlpha = flash;
    g.fillStyle = flashColor;
    g.fillRect(0, 0, VW, VH);
    g.globalAlpha = 1;
  }
  drawText(g, NAME, Math.floor(VW / 2), lay.nameY, THEME.text, { align: 'center', scale: lay.big, shadow: THEME.call });
  lay.rects.forEach((r, i) => {
    // (the one to press blinks, as it does in the game)
    const lit = i === 0 && Math.floor(t * 2) % 2 === 0;
    g.fillStyle = i === 0 ? THEME.callHi : THEME.edgeHi;
    g.fillRect(r.x, r.y, r.w, r.h);
    g.fillStyle = i === 0 ? (lit ? THEME.callHi : THEME.call) : THEME.bg2;
    g.fillRect(r.x + 1, r.y + 1, r.w - 2, r.h - 2);
    drawText(g, labels[i], r.x + Math.floor(r.w / 2) - Math.floor(textWidth(labels[i]) / 2), r.y + Math.floor((r.h - 7) / 2), i === 0 ? '#ffffff' : THEME.text);
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
