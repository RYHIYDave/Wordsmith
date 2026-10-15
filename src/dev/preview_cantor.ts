// Dev page: FLOOR 8'S BOSS, THE CANTOR (art/cantor.ts), for the owner to look at. Nothing of the game imports it.
//
//   node tools/preview.mjs src/dev/preview_cantor.ts shots/cantor_look.png 1014 1000 look
//     him standing, from in front and from behind, the knight and the Chanter beside him at the game's size, for
//     his size; close-ups of him from in front and from behind, at twice the game's size
//   node tools/page_gif.mjs src/dev/preview_cantor.ts "standfilm" shots/cantor_stand.gif 3
//     A FILM (10 frames a second): his stand, from in front and from behind side by side

import { spriteOf3 } from '../art/heroes3';
import { MOVES3 } from '../art/moves3';
import { P } from '../art/palette';
import { CANTOR, CANTOR_CANVAS, CANTOR_STAND_LONG, cantorStanding } from '../art/cantor';
import { CHANTER, CHANTER_CANVAS } from '../art/act1_cultists';
import { toSprite } from '../art/kit';
import { ENEMY_RIM } from '../art/mkit';
import { paintMob } from '../art/new_mobs3';
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

/** The canyon's sand, plain, as a floor under them. */
function sand(g: CanvasRenderingContext2D, w: number, h: number, y0 = 0): void {
  g.fillStyle = '#b88462';
  g.fillRect(0, y0, w, h);
  g.fillStyle = '#ae7c5c';
  for (let y = 0; y < h; y += 32) for (let x = (y / 32) % 2 ? 0 : 64; x < w; x += 128) g.fillRect(x, y0 + y, 64, 32);
}

function look(): void {
  const H = 1000;
  const cvs = document.createElement('canvas');
  cvs.width = PW;
  cvs.height = H;
  const g = cvs.getContext('2d') as CanvasRenderingContext2D;
  g.imageSmoothingEnabled = false;
  sand(g, PW, H);
  const FOOT = 960;
  const shadow = (x: number, rx: number): void => {
    g.fillStyle = 'rgba(25, 18, 40, 0.3)';
    g.beginPath();
    g.ellipse(x, FOOT, rx, rx * 0.4, 0, 0, Math.PI * 2);
    g.fill();
  };
  const knight = spriteOf3(MOVES3.rear, 0, 'front');
  const chanter = toSprite(paintMob(CHANTER, 'stand', 0.4, 'front', ENEMY_RIM), null, CHANTER_CANVAS.ax, CHANTER_CANVAS.ay);
  const front = cantorStanding(T, 'front');
  const back = cantorStanding(T, 'back');
  const put = (sp: Sprite, x: number, rx: number, name: string): void => {
    shadow(x, rx);
    drawAt(g, sp, x, FOOT);
    label(g, name, x - name.length * 5, FOOT + 14);
  };
  put(knight, 70, 14, 'knight');
  put(front, 340, 40, 'from in front');
  put(back, 640, 40, 'from behind');
  put(chanter, 900, 16, 'the Chanter');
  label(g, 'The Cantor, standing over his flock (the row below at the game\'s size)', 8, 6);
  // close-ups, twice the game's size
  const big = (sp: Sprite, x: number, name: string): void => {
    g.drawImage(sp.img, Math.round(x - sp.ax * 4), Math.round(700 - sp.ay * 4), sp.w * 4, sp.h * 4);
    label(g, name, x - name.length * 5, 710);
  };
  big(front, 260, 'from in front, close');
  big(back, 760, 'from behind, close');
  document.body.style.margin = '0';
  document.body.style.background = '#0d1030';
  document.body.appendChild(cvs);
  (window as unknown as { __ready: boolean }).__ready = true;
}

// ---------------------------------------------------------------------------------------------
// FILMS (tools/page_gif.mjs): the page draws any one frame of them on asking

const win = window as unknown as { __ready: boolean; __frames: number; __tickMs: number; __frame: (i: number) => string };
const PANE_W = 500;
const PANE_H = 640;
const TOP = 30;

function standFilm(): void {
  const fps = 10;
  const n = Math.round(CANTOR_STAND_LONG * fps);
  const cvs = document.createElement('canvas');
  cvs.width = PANE_W * 2;
  cvs.height = TOP + PANE_H;
  const g = cvs.getContext('2d') as CanvasRenderingContext2D;
  g.imageSmoothingEnabled = false;
  const draw = (i: number): void => {
    g.fillStyle = '#0d1030';
    g.fillRect(0, 0, cvs.width, cvs.height);
    label(g, 'The Cantor stands over his flock (his breath, 3.2 s round; twice the game\'s size)', 8, 6);
    (['front', 'back'] as const).forEach((view, k) => {
      const ox = k * PANE_W;
      g.save();
      g.beginPath();
      g.rect(ox + 2, TOP, PANE_W - 4, PANE_H - 2);
      g.clip();
      g.translate(ox, TOP);
      sand(g, PANE_W, PANE_H);
      g.translate(-ox, -TOP);
      const fx = ox + PANE_W / 2;
      const fy = TOP + 590;
      g.fillStyle = 'rgba(25, 18, 40, 0.3)';
      g.beginPath();
      g.ellipse(fx, fy, 110, 44, 0, 0, Math.PI * 2);
      g.fill();
      // (at twice the game's size)
      const sp = toSprite(paintMob(CANTOR, 'stand', i / fps, view, ENEMY_RIM), null, CANTOR_CANVAS.ax, CANTOR_CANVAS.ay);
      g.drawImage(sp.img, Math.round(fx - sp.ax * 4), Math.round(fy - sp.ay * 4), sp.w * 4, sp.h * 4);
      g.restore();
      label(g, view === 'front' ? 'from in front' : 'from behind', ox + 10, TOP + PANE_H - 26);
    });
  };
  draw(0);
  document.body.style.margin = '0';
  document.body.style.background = '#0d1030';
  document.body.appendChild(cvs);
  win.__frames = n;
  win.__tickMs = 1000 / fps;
  win.__frame = (i: number): string => {
    draw(i);
    return cvs.toDataURL('image/png');
  };
  win.__ready = true;
}

if (HASH.startsWith('look')) look();
else if (HASH === 'standfilm') standFilm();
