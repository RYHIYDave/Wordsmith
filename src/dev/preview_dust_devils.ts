// Dev page: FLOOR 8'S DUST DEVILS (art/dust_devils.ts), for the owner to look at. Nothing of the game imports it.
//
//   node tools/preview.mjs src/dev/preview_dust_devils.ts shots/devil_look.png 1014 700 look
//     it standing, from in front and from behind, the knight beside it at the game's size; close-ups of it
//   node tools/page_gif.mjs src/dev/preview_dust_devils.ts "standfilm" shots/devil_stand.gif 4
//     A FILM (16 frames a second): its stand, from in front and from behind, at eight times the game's size

import { spriteOf3 } from '../art/heroes3';
import { MOVES3 } from '../art/moves3';
import { P } from '../art/palette';
import { DD_CANVAS, DD_STAND, LOOK, devilFrame, devilPainted } from '../art/dust_devils';
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

/** A sprite's lights, added over the picture as the game adds them (its bell's glow), at `k` times the game's size. */
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

const win = window as unknown as { __ready: boolean; __frames: number; __tickMs: number; __frame: (i: number) => string };

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
  const front = devilFrame('stand', T, 'front');
  const back = devilFrame('stand', T, 'back');
  const put = (sp: Sprite, x: number, rx: number, name: string): void => {
    shadow(x, rx);
    drawAt(g, sp, x, FOOT);
    litAt(g, sp, x, FOOT, 2);
    label(g, name, x - name.length * 5, FOOT + 24);
  };
  put(knight, 150, 26, 'the knight');
  put(front, 480, 16, 'from in front');
  put(back, 830, 16, 'from behind');
  label(g, 'A Dust Devil, standing (the row above at the game\'s size)', 8, 6);
  const big = (sp: Sprite, x: number, name: string): void => {
    g.drawImage(sp.img, Math.round(x - sp.ax * 6), Math.round(640 - sp.ay * 6), sp.w * 6, sp.h * 6);
    litAt(g, sp, x, 640, 6);
    label(g, name, x - name.length * 5, 655);
  };
  big(front, 260, 'from in front, close');
  big(back, 760, 'from behind, close');
  document.body.style.margin = '0';
  document.body.style.background = '#0d1030';
  document.body.appendChild(cvs);
  win.__ready = true;
}

function standFilm(): void {
  const fps = DD_STAND.fps;
  const n = DD_STAND.frames;
  const PANE = 400;
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
    label(g, 'A Dust Devil stands, never still (eight times the game\'s size)', 8, 6);
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
      const fy = TOP + 300;
      g.fillStyle = 'rgba(25, 18, 40, 0.3)';
      g.beginPath();
      g.ellipse(fx, fy, 88, 32, 0, 0, Math.PI * 2);
      g.fill();
      const sp = toSprite(devilPainted('stand', i / fps, view), null, DD_CANVAS.ax, DD_CANVAS.ay);
      g.drawImage(sp.img, Math.round(fx - sp.ax * 8), Math.round(fy - sp.ay * 8), sp.w * 8, sp.h * 8);
      litAt(g, sp, fx, fy, 8);
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

/** (for choosing among looks: each variant of `LOOK` beside the knight at the game's size, and close) */
function tries(): void {
  const variants: Partial<typeof LOOK>[] = JSON.parse(decodeURIComponent(HASH.slice('tries:'.length)));
  const cw = 180;
  const cvs = document.createElement('canvas');
  cvs.width = cw * (variants.length + 1);
  cvs.height = 520;
  const g = cvs.getContext('2d') as CanvasRenderingContext2D;
  g.imageSmoothingEnabled = false;
  sand(g, cvs.width, cvs.height);
  drawAt(g, spriteOf3(MOVES3.rear, 0, 'front'), cw / 2, 140);
  const base = { ...LOOK };
  variants.forEach((v, i) => {
    Object.assign(LOOK, base, v);
    const x = (i + 1) * cw + cw / 2;
    const sp = devilFrame('stand', 0.3, 'front');
    drawAt(g, sp, x, 140);
    litAt(g, sp, x, 140, 2);
    g.drawImage(sp.img, Math.round(x - sp.ax * 6), Math.round(470 - sp.ay * 6), sp.w * 6, sp.h * 6);
    litAt(g, sp, x, 470, 6);
    label(g, String(i + 1), x - 5, 160);
  });
  Object.assign(LOOK, base);
  document.body.style.margin = '0';
  document.body.appendChild(cvs);
  win.__ready = true;
}

if (HASH.startsWith('look')) look();
else if (HASH.startsWith('tries:')) tries();
else if (HASH === 'standfilm') standFilm();
else if (HASH.startsWith('frames:')) {
  // (several moments of one move side by side, from in front above and from behind below: `frames:move:t1,t2,...`)
  const [, mv, list] = HASH.split(':');
  const ts = list.split(',').map(Number);
  const cw = 200;
  const cvs = document.createElement('canvas');
  cvs.width = cw * ts.length;
  cvs.height = 620;
  const g = cvs.getContext('2d') as CanvasRenderingContext2D;
  g.imageSmoothingEnabled = false;
  sand(g, cvs.width, cvs.height);
  ts.forEach((t, i) => {
    (['front', 'back'] as const).forEach((view, k) => {
      const sp = toSprite(devilPainted(mv, t, view), null, DD_CANVAS.ax, DD_CANVAS.ay);
      const fx = i * cw + cw / 2;
      const fy = 270 + k * 300;
      g.drawImage(sp.img, Math.round(fx - sp.ax * 4), Math.round(fy - sp.ay * 4), sp.w * 4, sp.h * 4);
    });
    label(g, `${t.toFixed(2)} s`, i * cw + 8, 6);
  });
  document.body.style.margin = '0';
  document.body.appendChild(cvs);
  win.__ready = true;
}
