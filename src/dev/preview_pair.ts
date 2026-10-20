// Dev page: FLOOR 13'S DOUBLE BOSS, THE SCRAPER AND THE QUILL (art/scraper.ts, art/quill.ts), for the owner to look at. Nothing
// of the game imports it.
//
//   node tools/preview.mjs src/dev/preview_pair.ts shots/pair_look.png 1014 820 look
//     the two standing, from in front and from behind, the knight beside them at the game's size; close-ups of each

import { spriteOf3 } from '../art/heroes3';
import { MOVES3 } from '../art/moves3';
import { P } from '../art/palette';
import { scraperFrame } from '../art/scraper';
import { quillFrame } from '../art/quill';
import { drawText } from '../engine/font';
import type { Sprite } from '../engine/px';
import { THEME } from '../ui/ui';
import { PW, drawAt } from './act1_stage';

const HASH = decodeURIComponent(location.hash.slice(1)) || 'look';
const T = Number(HASH.split(':')[1] ?? 0.3);

function label(g: CanvasRenderingContext2D, text: string, x: number, y: number): void {
  g.save();
  g.scale(2, 2);
  drawText(g, text, Math.round(x / 2), Math.round(y / 2), THEME.text, { shadow: P.ink });
  g.restore();
}
/** The Millrace's pulping floor, plain: wet grey flags. */
function floor(g: CanvasRenderingContext2D, w: number, h: number): void {
  g.fillStyle = '#4a4a42';
  g.fillRect(0, 0, w, h);
  g.fillStyle = '#42423b';
  for (let y = 0; y < h; y += 32) for (let x = (y / 32) % 2 ? 0 : 64; x < w; x += 128) g.fillRect(x, y, 64, 32);
}

function look(): void {
  const H = 1100;
  const cvs = document.createElement('canvas');
  cvs.width = PW;
  cvs.height = H;
  const g = cvs.getContext('2d') as CanvasRenderingContext2D;
  g.imageSmoothingEnabled = false;
  floor(g, PW, H);
  const FOOT = 250;
  const shadow = (x: number, rx: number): void => {
    g.fillStyle = 'rgba(20, 18, 30, 0.35)';
    g.beginPath();
    g.ellipse(x, FOOT, rx, rx * 0.4, 0, 0, Math.PI * 2);
    g.fill();
  };
  const knight = spriteOf3(MOVES3.rear, 0, 'front');
  const put = (sp: Sprite, x: number, rx: number, name: string): void => {
    shadow(x, rx);
    drawAt(g, sp, x, FOOT);
    label(g, name, x - name.length * 5, FOOT + 24);
  };
  put(knight, 70, 26, 'the knight');
  put(scraperFrame('stand', T, 'front'), 290, 70, 'the Scraper');
  put(scraperFrame('stand', T, 'back'), 560, 70, 'from behind');
  put(quillFrame('stand', T, 'front'), 780, 34, 'the Quill');
  put(quillFrame('stand', T, 'back'), 930, 34, 'from behind');
  label(g, 'Floor 13: the Scraper and the Quill, standing (the row above at the game\'s size)', 8, 6);
  const big = (sp: Sprite, x: number, y: number, k: number, name: string): void => {
    g.drawImage(sp.img, Math.round(x - sp.ax * k), Math.round(y - sp.ay * k), sp.w * k, sp.h * k);
    label(g, name, x - name.length * 5, y + 24);
  };
  big(scraperFrame('stand', T, 'front'), 290, 1040, 4.2, 'the Scraper, close');
  big(quillFrame('stand', T, 'front'), 790, 1040, 3.6, 'the Quill, close');
  document.body.style.margin = '0';
  document.body.style.background = '#0d1030';
  document.body.appendChild(cvs);
  (window as unknown as { __ready: boolean }).__ready = true;
}

if (HASH.startsWith('look')) look();
