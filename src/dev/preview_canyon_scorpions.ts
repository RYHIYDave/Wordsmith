// Dev page: FLOOR 8'S CANYON SCORPIONS (art/canyon_scorpions.ts), for the owner to look at. Nothing of the game
// imports it.
//
//   node tools/preview.mjs src/dev/preview_canyon_scorpions.ts shots/scorpion_look.png 1014 700 look
//     it standing, from in front and from behind, the knight beside it at the game's size; close-ups of it
//   node tools/page_gif.mjs src/dev/preview_canyon_scorpions.ts "standfilm" shots/scorpion_stand.gif 4
//     A FILM (10 frames a second): its stand, from in front and from behind, at twice the game's size

import { spriteOf3 } from '../art/heroes3';
import { MOVES3 } from '../art/moves3';
import { P } from '../art/palette';
import { SC_CANVAS, SC_STAND, scorpionFrame, scorpionPainted } from '../art/canyon_scorpions';
import { toSprite } from '../art/kit';
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
/** The canyon's sand, plain, as a floor under them. */
function sand(g: CanvasRenderingContext2D, w: number, h: number): void {
  g.fillStyle = '#b88462';
  g.fillRect(0, 0, w, h);
  g.fillStyle = '#ae7c5c';
  for (let y = 0; y < h; y += 32) for (let x = (y / 32) % 2 ? 0 : 64; x < w; x += 128) g.fillRect(x, y, 64, 32);
}

function look(): void {
  const H = 700;
  const cvs = document.createElement('canvas');
  cvs.width = PW;
  cvs.height = H;
  const g = cvs.getContext('2d') as CanvasRenderingContext2D;
  g.imageSmoothingEnabled = false;
  sand(g, PW, H);
  const FOOT = 250;
  const shadow = (x: number, rx: number): void => {
    g.fillStyle = 'rgba(25, 18, 40, 0.3)';
    g.beginPath();
    g.ellipse(x, FOOT, rx, rx * 0.4, 0, 0, Math.PI * 2);
    g.fill();
  };
  const knight = spriteOf3(MOVES3.rear, 0, 'front');
  const front = scorpionFrame('stand', T, 'front');
  const back = scorpionFrame('stand', T, 'back');
  const put = (sp: Sprite, x: number, rx: number, name: string): void => {
    shadow(x, rx);
    drawAt(g, sp, x, FOOT);
    label(g, name, x - name.length * 5, FOOT + 24);
  };
  put(knight, 150, 26, 'the knight');
  put(front, 480, 40, 'from in front');
  put(back, 830, 40, 'from behind');
  label(g, 'The Canyon Scorpion, standing (the row above at the game\'s size)', 8, 6);
  const big = (sp: Sprite, x: number, name: string): void => {
    g.drawImage(sp.img, Math.round(x - sp.ax * 6), Math.round(600 - sp.ay * 6), sp.w * 6, sp.h * 6);
    label(g, name, x - name.length * 5, 640);
  };
  big(front, 260, 'from in front, close');
  big(back, 760, 'from behind, close');
  document.body.style.margin = '0';
  document.body.style.background = '#0d1030';
  document.body.appendChild(cvs);
  (window as unknown as { __ready: boolean }).__ready = true;
}

const win = window as unknown as { __ready: boolean; __frames: number; __tickMs: number; __frame: (i: number) => string };
function standFilm(): void {
  const fps = SC_STAND.fps;
  const n = SC_STAND.frames;
  const PANE = 500;
  const TOP = 30;
  const PH = 380;
  const cvs = document.createElement('canvas');
  cvs.width = PANE * 2;
  cvs.height = TOP + PH;
  const g = cvs.getContext('2d') as CanvasRenderingContext2D;
  g.imageSmoothingEnabled = false;
  const draw = (i: number): void => {
    g.fillStyle = '#0d1030';
    g.fillRect(0, 0, cvs.width, cvs.height);
    label(g, 'The Canyon Scorpion stands, dead still but for its tail (twice the game\'s size)', 8, 6);
    (['front', 'back'] as const).forEach((view, k) => {
      const ox = k * PANE;
      g.save();
      g.beginPath();
      g.rect(ox + 2, TOP, PANE - 4, PH - 2);
      g.clip();
      g.translate(ox, TOP);
      sand(g, PANE, PH);
      g.translate(-ox, -TOP);
      const fx = ox + PANE / 2;
      const fy = TOP + 290;
      g.fillStyle = 'rgba(25, 18, 40, 0.3)';
      g.beginPath();
      g.ellipse(fx, fy, 90, 36, 0, 0, Math.PI * 2);
      g.fill();
      const sp = toSprite(scorpionPainted('stand', i / fps, view), null, SC_CANVAS.ax, SC_CANVAS.ay);
      g.drawImage(sp.img, Math.round(fx - sp.ax * 4), Math.round(fy - sp.ay * 4), sp.w * 4, sp.h * 4);
      g.restore();
      label(g, view === 'front' ? 'from in front' : 'from behind', ox + 10, TOP + PH - 26);
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
