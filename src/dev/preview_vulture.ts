// Dev page: FLOOR 7'S VULTURE (art/ledge_vultures.ts), for the owner to look at. Nothing of the game imports it.
//
//   node tools/preview.mjs src/dev/preview_vulture.ts shots/vulture_look.png 1014 700 look
//     the vulture standing, from in front and from behind, the knight beside it at the game's size (the top row);
//     close-ups of the whole figure from in front and from behind, three times the top row's size (the bottom row)
//   node tools/preview.mjs src/dev/preview_vulture.ts shots/vulture_head.png 1014 360 head
//     the head from in front and from behind, eight times the top row's size; its feet from in front, six times

import { spriteOf3 } from '../art/heroes3';
import { MOVES3 } from '../art/moves3';
import { P } from '../art/palette';
import { vultureStanding } from '../art/ledge_vultures';
import { drawText } from '../engine/font';
import type { Sprite } from '../engine/px';
import { THEME } from '../ui/ui';
import { PW, drawAt } from './act1_stage';

const HASH = decodeURIComponent(location.hash.slice(1)) || 'look';
const T = Number(HASH.split(':')[1] ?? 0.4);

function label(g: CanvasRenderingContext2D, text: string, x: number, y: number): void {
  g.save();
  g.scale(2, 2);
  drawText(g, text, Math.round(x / 2), Math.round(y / 2), THEME.text, { shadow: P.ink });
  g.restore();
}

/** The trail's rock as a floor under them, plain. */
function floor(g: CanvasRenderingContext2D, w: number, h: number): void {
  g.fillStyle = '#766d7c';
  g.fillRect(0, 0, w, h);
  g.fillStyle = '#6c6372';
  for (let y = 0; y < h; y += 32) for (let x = (y / 32) % 2 ? 0 : 64; x < w; x += 128) g.fillRect(x, y, 64, 32);
}

/**
 * A piece of the sprite's own picture: `x0`, `y0` from its anchor (the floor point under the figure), in the picture's
 * pixels (two to a game pixel), `w` by `h` of them, drawn `k` times as large (k picture pixels become k canvas pixels).
 */
function crop(g: CanvasRenderingContext2D, sp: Sprite, dx: number, dy: number, x0: number, y0: number, w: number, h: number, k: number): void {
  const d = sp.density ?? 1;
  g.drawImage(sp.img, Math.round(sp.ax * d + x0), Math.round(sp.ay * d + y0), w, h, dx, dy, w * k, h * k);
}

function look(): void {
  const H = 700;
  const cvs = document.createElement('canvas');
  cvs.width = PW;
  cvs.height = H;
  const g = cvs.getContext('2d') as CanvasRenderingContext2D;
  g.imageSmoothingEnabled = false;
  floor(g, PW, H);
  const FOOT = 300;
  const shadow = (x: number, rx: number): void => {
    g.fillStyle = 'rgba(25, 18, 40, 0.3)';
    g.beginPath();
    g.ellipse(x, FOOT, rx, rx * 0.4, 0, 0, Math.PI * 2);
    g.fill();
  };
  const knight = spriteOf3(MOVES3.rear, 0, 'front');
  const front = vultureStanding(T, 'front');
  const back = vultureStanding(T, 'back');
  const put = (sp: Sprite, x: number, rx: number, name: string): void => {
    shadow(x, rx);
    drawAt(g, sp, x, FOOT);
    label(g, name, x - name.length * 5, FOOT + 14);
  };
  put(knight, 200, 26, 'the knight');
  put(front, 520, 34, 'from in front');
  put(back, 820, 34, 'from behind');
  label(g, 'The vulture, standing hunched (the row above at the game\'s size)', 8, 6);
  // close-ups: the whole figure, three times the top row's size, its name under it
  const big = (sp: Sprite, x: number, name: string): void => {
    const d = sp.density ?? 1;
    const w = sp.w * d;
    const h = sp.h * d;
    g.drawImage(sp.img, 0, 0, w, h, Math.round(x - (w * 3) / 2), 352, w * 3, h * 3);
    label(g, name, x - name.length * 5, 656);
  };
  big(front, 260, 'from in front, close');
  big(back, 760, 'from behind, close');
  document.body.style.margin = '0';
  document.body.style.background = '#0d1030';
  document.body.appendChild(cvs);
  (window as unknown as { __ready: boolean }).__ready = true;
}

/** The head from both sides, eight times the top row's size; the feet from in front, six times. */
function head(): void {
  const W = 1014;
  const H = 360;
  const cvs = document.createElement('canvas');
  cvs.width = W;
  cvs.height = H;
  const g = cvs.getContext('2d') as CanvasRenderingContext2D;
  g.imageSmoothingEnabled = false;
  floor(g, W, H);
  const front = vultureStanding(T, 'front');
  const back = vultureStanding(T, 'back');
  // the head: from its anchor, 6 picture pixels forward, 40 up; a square of 24
  crop(g, front, 40, 60, -6, -52, 24, 24, 8);
  label(g, 'the head, from in front', 40, 28);
  crop(g, back, 320, 60, -6, -52, 24, 24, 8);
  label(g, 'the head, from behind', 320, 28);
  // the feet: the whole width of the figure, from 14 picture pixels above its floor point to the floor
  crop(g, front, 600, 80, -22, -14, 64, 28, 6);
  label(g, 'the feet, from in front', 600, 28);
  label(g, 'The vulture, close (its eyes the enemy\'s pink; its legs and feet)', 8, 326);
  document.body.style.margin = '0';
  document.body.style.background = '#0d1030';
  document.body.appendChild(cvs);
  (window as unknown as { __ready: boolean }).__ready = true;
}

if (HASH.startsWith('look')) look();
if (HASH.startsWith('head')) head();
