// Dev page: FLOOR 9'S BOSS, THE HOLLOW STAG (art/hollow_stag.ts), for the owner to look at. Nothing of the game
// imports it.
//
//   node tools/preview.mjs src/dev/preview_hollow_stag.ts shots/stag_look.png 1014 820 look
//     it standing, from in front and from behind, the knight beside it at the game's size; close-ups of it
//   node tools/page_gif.mjs src/dev/preview_hollow_stag.ts "standfilm" shots/stag_stand.gif 6
//     A FILM (15 frames a second): its restless stand, from in front and from behind, at four times the game's size
//   frames:move:t1,t2,...   several moments of one move side by side, from in front above and from behind below

import { spriteOf3 } from '../art/heroes3';
import { MOVES3 } from '../art/moves3';
import { P } from '../art/palette';
import { STAG_CANVAS, STAG_HABITS, STAG_STAND, stagFrame, stagPainted } from '../art/hollow_stag';
import { toSprite } from '../art/kit';
import { drawText } from '../engine/font';
import type { Sprite } from '../engine/px';
import { THEME } from '../ui/ui';
import { PW, drawAt } from './act1_stage';

const HASH = decodeURIComponent(location.hash.slice(1)) || 'look';
const T = Number(HASH.split(':')[1] ?? 0.05);

function label(g: CanvasRenderingContext2D, text: string, x: number, y: number): void {
  g.save();
  g.scale(2, 2);
  drawText(g, text, Math.round(x / 2), Math.round(y / 2), THEME.text, { shadow: P.ink });
  g.restore();
}
/** The Pinewood's meadow grass, plain, as a floor under it. */
function meadow(g: CanvasRenderingContext2D, w: number, h: number): void {
  g.fillStyle = '#536638';
  g.fillRect(0, 0, w, h);
  g.fillStyle = '#4c5e33';
  for (let y = 0; y < h; y += 32) for (let x = (y / 32) % 2 ? 0 : 64; x < w; x += 128) g.fillRect(x, y, 64, 32);
}

/** A sprite's lights, added over the picture as the game adds them (its eye's glow), at `k` times the game's size. */
function litAt(g: CanvasRenderingContext2D, sp: Sprite, x: number, y: number, k: number): void {
  g.save();
  g.globalCompositeOperation = 'lighter';
  for (const L of sp.lights ?? []) {
    const lx = x + (L.x - sp.ax) * k;
    const ly = y + (L.y - sp.ay) * k;
    const r = L.r * k;
    const gr = g.createRadialGradient(lx, ly, 1, lx, ly, r);
    gr.addColorStop(0, hexA(L.color, (L.a ?? 0.5) * 0.55));
    gr.addColorStop(1, hexA(L.color, 0));
    g.fillStyle = gr;
    g.fillRect(lx - r, ly - r, 2 * r, 2 * r);
  }
  g.restore();
}
function hexA(c: string, a: number): string {
  const n = parseInt(c.slice(1), 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${a})`;
}

function look(): void {
  const H = 820;
  const cvs = document.createElement('canvas');
  cvs.width = PW;
  cvs.height = H;
  const g = cvs.getContext('2d') as CanvasRenderingContext2D;
  g.imageSmoothingEnabled = false;
  meadow(g, PW, H);
  const FOOT = 270;
  const shadow = (x: number, rx: number): void => {
    g.fillStyle = 'rgba(25, 18, 40, 0.3)';
    g.beginPath();
    g.ellipse(x, FOOT, rx, rx * 0.4, 0, 0, Math.PI * 2);
    g.fill();
  };
  const knight = spriteOf3(MOVES3.rear, 0, 'front');
  const front = stagFrame('stand', T, 'front');
  const back = stagFrame('stand', T, 'back');
  const put = (sp: Sprite, x: number, rx: number, name: string): void => {
    shadow(x, rx);
    drawAt(g, sp, x, FOOT);
    litAt(g, sp, x, FOOT, 2);
    label(g, name, x - name.length * 5, FOOT + 24);
  };
  put(knight, 130, 26, 'the knight');
  put(front, 440, 70, 'from in front');
  put(back, 800, 70, 'from behind');
  label(g, 'The Hollow Stag, standing (the row above at the game\'s size)', 8, 6);
  const big = (sp: Sprite, x: number, name: string): void => {
    g.drawImage(sp.img, Math.round(x - sp.ax * 3), Math.round(770 - sp.ay * 3), sp.w * 3, sp.h * 3);
    litAt(g, sp, x, 770, 3);
    label(g, name, x - name.length * 5, 786);
  };
  big(front, 250, 'from in front, close');
  big(back, 760, 'from behind, close');
  document.body.style.margin = '0';
  document.body.style.background = '#0d1030';
  document.body.appendChild(cvs);
  (window as unknown as { __ready: boolean }).__ready = true;
}

const win = window as unknown as { __ready: boolean; __frames: number; __tickMs: number; __frame: (i: number) => string };
function standFilm(): void {
  const fps = STAG_STAND.fps;
  const n = STAG_STAND.frames;
  const PANE = 600;
  const TOP = 30;
  const PH = 640;
  const cvs = document.createElement('canvas');
  cvs.width = PANE * 2;
  cvs.height = TOP + PH;
  const g = cvs.getContext('2d') as CanvasRenderingContext2D;
  g.imageSmoothingEnabled = false;
  const said = (t: number): string => {
    const [a, b] = STAG_HABITS.toss;
    if (t >= a && t < b) return 'tosses its head';
    if (t >= STAG_HABITS.paw[0] && t < STAG_HABITS.paw[1] + 0.12) return 'paws and stamps';
    if (t >= STAG_HABITS.snort - 0.2 && t < STAG_HABITS.snort + 0.22) return 'snorts';
    if (t >= STAG_HABITS.blink[0] && t < STAG_HABITS.blink[1]) return 'blinks';
    return '';
  };
  const draw = (i: number): void => {
    g.fillStyle = '#0d1030';
    g.fillRect(0, 0, cvs.width, cvs.height);
    label(g, 'The Hollow Stag stands, restless (four times the game\'s size)', 8, 6);
    const note = said(i / fps);
    if (note) label(g, note, cvs.width - note.length * 10 - 12, 6);
    (['front', 'back'] as const).forEach((view, k) => {
      const ox = k * PANE;
      g.save();
      g.beginPath();
      g.rect(ox + 2, TOP, PANE - 4, PH - 2);
      g.clip();
      g.translate(ox, TOP);
      meadow(g, PANE, PH);
      g.translate(-ox, -TOP);
      const fx = ox + PANE / 2 - 20;
      const fy = TOP + 560;
      g.fillStyle = 'rgba(25, 18, 40, 0.3)';
      g.beginPath();
      g.ellipse(fx, fy, 170, 68, 0, 0, Math.PI * 2);
      g.fill();
      const sp = toSprite(stagPainted('stand', i / fps, view), null, STAG_CANVAS.ax, STAG_CANVAS.ay);
      g.drawImage(sp.img, Math.round(fx - sp.ax * 4), Math.round(fy - sp.ay * 4), sp.w * 4, sp.h * 4);
      litAt(g, sp, fx, fy, 4);
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
else if (HASH.startsWith('big:')) {
  // (one moment large, from in front and from behind: `big:move:t:scale`, the scale in picture pixels)
  const [, mv, at, k0, raw] = HASH.split(':');
  const K = Number(k0 ?? 3) * 2;
  const W0 = Math.round(STAG_CANVAS.w * K * 0.5);
  const H0 = Math.round(STAG_CANVAS.h * K * 0.5);
  const cvs = document.createElement('canvas');
  cvs.width = W0 * 2;
  cvs.height = H0;
  const g = cvs.getContext('2d') as CanvasRenderingContext2D;
  g.imageSmoothingEnabled = false;
  meadow(g, cvs.width, cvs.height);
  (['front', 'back'] as const).forEach((view, k) => {
    const sp = toSprite(stagPainted(mv, Number(at), view), null, STAG_CANVAS.ax, STAG_CANVAS.ay);
    g.drawImage(sp.img, Math.round(k * W0 + STAG_CANVAS.ax * K * 0.5 - sp.ax * K), Math.round(STAG_CANVAS.ay * K * 0.5 - sp.ay * K), sp.w * K, sp.h * K);
    if (raw !== 'raw') litAt(g, sp, k * W0 + STAG_CANVAS.ax * K * 0.5, STAG_CANVAS.ay * K * 0.5, K);
  });
  document.body.style.margin = '0';
  document.body.appendChild(cvs);
  win.__ready = true;
} else if (HASH.startsWith('frames:')) {
  // (several moments of one move side by side, from in front above and from behind below: `frames:move:t1,t2,...`)
  const [, mv, list] = HASH.split(':');
  const ts = list.split(',').map(Number);
  const cw = 330;
  const cvs = document.createElement('canvas');
  cvs.width = cw * ts.length;
  cvs.height = 900;
  const g = cvs.getContext('2d') as CanvasRenderingContext2D;
  g.imageSmoothingEnabled = false;
  meadow(g, cvs.width, cvs.height);
  ts.forEach((t, i) => {
    (['front', 'back'] as const).forEach((view, k) => {
      const sp = toSprite(stagPainted(mv, t, view), null, STAG_CANVAS.ax, STAG_CANVAS.ay);
      const fx = i * cw + cw / 2 - 10;
      const fy = 400 + k * 440;
      g.drawImage(sp.img, Math.round(fx - sp.ax * 2), Math.round(fy - sp.ay * 2), sp.w * 2, sp.h * 2);
    });
    label(g, `${t.toFixed(2)} s`, i * cw + 8, 6);
  });
  document.body.style.margin = '0';
  document.body.appendChild(cvs);
  win.__ready = true;
}
