// Dev page: FLOOR 7'S BOSS, THE CARRION QUEEN MADE NEW (art/carrion_queen2.ts, behind QUEEN2_ON, off), for the owner
// to look at. Nothing of the game imports it.
//   node tools/preview.mjs src/dev/preview_queen2.ts shots/q2_look.png 1014 1100 look
//   node tools/page_gif.mjs src/dev/preview_queen2.ts "standfilm" shots/q2_stand.gif 6

import { Q2_IDLE, Q2_STAND, queen2Frame } from '../art/carrion_queen2';
import { queenStanding } from '../art/carrion_queen';
import { spriteOf3 } from '../art/heroes3';
import { MOVES3 } from '../art/moves3';
import { P } from '../art/palette';
import { unfinishedStanding } from '../art/unfinished';
import { drawText } from '../engine/font';
import type { Sprite } from '../engine/px';
import { THEME } from '../ui/ui';
import { PW, drawAt } from './act1_stage';

const HASH = decodeURIComponent(location.hash.slice(1)) || 'look';

function label(g: CanvasRenderingContext2D, text: string, x: number, y: number): void {
  g.save();
  g.scale(2, 2);
  drawText(g, text, Math.round(x / 2), Math.round(y / 2), THEME.text, { shadow: P.ink });
  g.restore();
}
/** The Ledge Road's rock as a floor, plain. */
function rock(g: CanvasRenderingContext2D, w: number, h: number): void {
  g.fillStyle = '#766d7c';
  g.fillRect(0, 0, w, h);
  g.fillStyle = '#6c6372';
  for (let y = 0; y < h; y += 32) for (let x = (y / 32) % 2 ? 0 : 64; x < w; x += 128) g.fillRect(x, y, 64, 32);
}
function shadow(g: CanvasRenderingContext2D, x: number, y: number, rx: number): void {
  g.fillStyle = 'rgba(25, 18, 40, 0.3)';
  g.beginPath();
  g.ellipse(x, y, rx, rx * 0.4, 0, 0, Math.PI * 2);
  g.fill();
}
function big(g: CanvasRenderingContext2D, sp: Sprite, x: number, y: number, k: number): void {
  g.drawImage(sp.img, Math.round(x - sp.ax * k), Math.round(y - sp.ay * k), sp.w * k, sp.h * k);
}
function done(cvs: HTMLCanvasElement): void {
  document.body.style.margin = '0';
  document.body.style.background = '#0d1030';
  document.body.appendChild(cvs);
  (window as unknown as { __ready: boolean }).__ready = true;
}

function look(): void {
  const H = 1100;
  const cvs = document.createElement('canvas');
  cvs.width = PW;
  cvs.height = H;
  const g = cvs.getContext('2d') as CanvasRenderingContext2D;
  g.imageSmoothingEnabled = false;
  rock(g, PW, H);
  const FOOT = 1060;
  const put = (sp: Sprite, x: number, rx: number, name: string): void => {
    shadow(g, x, FOOT, rx);
    drawAt(g, sp, x, FOOT);
    label(g, name, x - name.length * 5, FOOT + 14);
  };
  put(spriteOf3(MOVES3.rear, 0, 'front'), 36, 14, 'knight');
  put(unfinishedStanding(0.4, 'front'), 140, 50, 'the Unfinished');
  put(queen2Frame('stand', 0.1, 'front'), 440, 70, 'the Queen');
  put(queen2Frame('stand', 1.45, 'front'), 815, 70, 'flaring');
  label(g, 'The Carrion Queen, made new (the row below at the game\'s size)', 8, 6);
  label(g, 'as she was', 8, 40);
  // (as she was, small, for the eye to compare)
  const old = queenStanding(0.4, 'front');
  g.drawImage(old.img, 10, 60, old.w, old.h);
  big(g, queen2Frame('stand', 0.1, 'front'), 300, 700, 2.9);
  big(g, queen2Frame('stand', 0.1, 'back'), 760, 700, 2.9);
  label(g, 'from in front, close', 200, 716);
  label(g, 'from behind, close', 690, 716);
  done(cvs);
}

/** HER STAND, moving, at the game's size, from in front and behind (hash `standfilm`). */
function standFilm(): void {
  const fps = Q2_IDLE.fps;
  const n = Math.round(Q2_STAND * fps);
  const W = PW;
  const H = 620;
  const cvs = document.createElement('canvas');
  cvs.width = W;
  cvs.height = H;
  const g = cvs.getContext('2d') as CanvasRenderingContext2D;
  g.imageSmoothingEnabled = false;
  const draw = (i: number): void => {
    const t = i / fps;
    rock(g, W, H);
    for (const [x, view] of [[300, 'front'], [740, 'back']] as [number, 'front' | 'back'][]) {
      shadow(g, x, 580, 90);
      big(g, queen2Frame('stand', t, view), x, 580, 2);
    }
    label(g, 'The Carrion Queen, standing', 8, 6);
    label(g, `${t.toFixed(2)} s`, 8, H - 28);
  };
  draw(0);
  done(cvs);
  const win = window as unknown as { __frames: number; __tickMs: number; __frame: (i: number) => string };
  win.__frames = n;
  win.__tickMs = 1000 / fps;
  win.__frame = (i: number): string => {
    draw(i);
    return cvs.toDataURL('image/png');
  };
}

if (HASH === 'look') look();
else if (HASH === 'standfilm') standFilm();
