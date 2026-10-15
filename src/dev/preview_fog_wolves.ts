// Dev page: FLOOR 9'S FOG WOLVES (art/fog_wolves.ts), for the owner to look at. Nothing of the game imports it.
//
//   node tools/preview.mjs src/dev/preview_fog_wolves.ts shots/wolf_look.png 1014 640 look
//     one standing, from in front and from behind, the knight beside it at the game's size; close-ups of it
//   node tools/page_gif.mjs src/dev/preview_fog_wolves.ts "standfilm" shots/wolf_stand.gif 6
//     A FILM (15 frames a second): its stand, from in front and from behind, at six times the game's size
//   walkfilm, bitefilm, deathfilm: FILMS (thirty frames a second; its glide sixteen) of its moves: its glide over the
//     meadow at its pace; its bite, then struck; its death, blown apart into fog
//   frames:move:t1,t2,...   several moments of one move side by side
//   big:move:t:scale[:raw]   one moment large, from in front and from behind

import { spriteOf3 } from '../art/heroes3';
import { MOVES3 } from '../art/moves3';
import { P } from '../art/palette';
import { WOLF_BITE, WOLF_CANVAS, WOLF_DIE, WOLF_HABITS, WOLF_PACE, WOLF_REEL, WOLF_STAND, WOLF_WALK, wolfFrame, wolfPainted } from '../art/fog_wolves';
import { TILE3 } from '../art/new_mobs3';
import { project } from '../art/skeleton';
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
/** A sprite's lights, added over the picture as the game adds them (its eyes' glow), at `k` times the game's size. */
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
  const H = 640;
  const cvs = document.createElement('canvas');
  cvs.width = PW;
  cvs.height = H;
  const g = cvs.getContext('2d') as CanvasRenderingContext2D;
  g.imageSmoothingEnabled = false;
  meadow(g, PW, H);
  const FOOT = 190;
  const shadow = (x: number, rx: number): void => {
    g.fillStyle = 'rgba(25, 18, 40, 0.3)';
    g.beginPath();
    g.ellipse(x, FOOT, rx, rx * 0.4, 0, 0, Math.PI * 2);
    g.fill();
  };
  const knight = spriteOf3(MOVES3.rear, 0, 'front');
  const front = wolfFrame('stand', T, 'front');
  const back = wolfFrame('stand', T, 'back');
  const put = (sp: Sprite, x: number, rx: number, name: string): void => {
    shadow(x, rx);
    drawAt(g, sp, x, FOOT);
    litAt(g, sp, x, FOOT, 2);
    label(g, name, x - name.length * 5, FOOT + 24);
  };
  put(knight, 150, 26, 'the knight');
  put(front, 470, 34, 'from in front');
  put(back, 820, 34, 'from behind');
  label(g, 'The Fog Wolf, standing (the row above at the game\'s size)', 8, 6);
  const big = (sp: Sprite, x: number, name: string): void => {
    g.drawImage(sp.img, Math.round(x - sp.ax * 6), Math.round(590 - sp.ay * 6), sp.w * 6, sp.h * 6);
    litAt(g, sp, x, 590, 6);
    label(g, name, x - name.length * 5, 606);
  };
  big(front, 270, 'from in front, close');
  big(back, 760, 'from behind, close');
  document.body.style.margin = '0';
  document.body.style.background = '#0d1030';
  document.body.appendChild(cvs);
  (window as unknown as { __ready: boolean }).__ready = true;
}

const win = window as unknown as { __ready: boolean; __frames: number; __tickMs: number; __frame: (i: number) => string };
function standFilm(): void {
  const fps = WOLF_STAND.fps;
  const n = WOLF_STAND.frames;
  const PANE = 520;
  const TOP = 30;
  const PH = 440;
  const K = 6;
  const cvs = document.createElement('canvas');
  cvs.width = PANE * 2;
  cvs.height = TOP + PH;
  const g = cvs.getContext('2d') as CanvasRenderingContext2D;
  g.imageSmoothingEnabled = false;
  const said = (t: number): string => {
    if (t >= WOLF_HABITS.growl[0] && t < WOLF_HABITS.growl[1]) return 'a growl';
    if (t >= WOLF_HABITS.glance[0] && t < WOLF_HABITS.glance[1]) return 'a glance aside';
    return '';
  };
  const draw = (i: number): void => {
    g.fillStyle = '#0d1030';
    g.fillRect(0, 0, cvs.width, cvs.height);
    label(g, 'The Fog Wolf hovers, never still (six times the game\'s size)', 8, 6);
    const note = said(i / fps);
    if (note) label(g, note, cvs.width - note.length * 12 - 16, 6);
    (['front', 'back'] as const).forEach((view, k) => {
      const ox = k * PANE;
      g.save();
      g.beginPath();
      g.rect(ox + 2, TOP, PANE - 4, PH - 2);
      g.clip();
      g.translate(ox, TOP);
      meadow(g, PANE, PH);
      g.translate(-ox, -TOP);
      const fx = ox + PANE / 2 - 10;
      const fy = TOP + 330;
      g.fillStyle = 'rgba(25, 18, 40, 0.3)';
      g.beginPath();
      g.ellipse(fx, fy, 16 * K, 7 * K, 0, 0, Math.PI * 2);
      g.fill();
      const sp = toSprite(wolfPainted('stand', i / fps, view), null, WOLF_CANVAS.ax, WOLF_CANVAS.ay);
      g.drawImage(sp.img, Math.round(fx - sp.ax * K), Math.round(fy - sp.ay * K), sp.w * K, sp.h * K);
      litAt(g, sp, fx, fy, K);
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

/** What it does at each moment of a film: which move, how far into it, how far it has come over the floor. */
type Beat = { move: string; t: number; ground: number };
function beatsOf(run: ReadonlyArray<readonly [string, number]>, fps: number): Beat[] {
  const out: Beat[] = [];
  let ground = 0;
  let breath = 0;
  let stride = 0;
  for (const [mv, long] of run) {
    const n = Math.round(long * fps);
    for (let i = 0; i < n; i++) {
      const t = i / fps;
      out.push({ move: mv, t: mv === 'stand' ? breath + t : mv === 'walk' ? stride + t : t, ground });
      if (mv === 'walk') ground += (WOLF_PACE * TILE3) / fps;
    }
    if (mv === 'stand') breath += n / fps;
    if (mv === 'walk') stride += n / fps;
  }
  return out;
}
function film(beats: Beat[], fps: number, title: string, o: { w: number; h: number; fx: number; fy: number; k: number; by?: number }, note?: (b: Beat) => string): void {
  const TOP = 30;
  const cvs = document.createElement('canvas');
  cvs.width = o.w * 2;
  cvs.height = TOP + o.h;
  const g = cvs.getContext('2d') as CanvasRenderingContext2D;
  g.imageSmoothingEnabled = false;
  const K = o.k;
  const draw = (i: number): void => {
    const b = beats[i];
    g.fillStyle = '#0d1030';
    g.fillRect(0, 0, cvs.width, cvs.height);
    label(g, title, 8, 6);
    (['front', 'back'] as const).forEach((view, k) => {
      const ox = k * o.w;
      g.save();
      g.beginPath();
      g.rect(ox + 2, TOP, o.w - 4, o.h - 2);
      g.clip();
      g.translate(ox, TOP);
      meadow(g, o.w, o.h);
      g.translate(-ox, -TOP);
      const [dx, dy] = project([b.ground, 0, 0], view);
      // (its sprites are in game pixels, two picture pixels each; the floor's places are in picture pixels)
      const fx = ox + o.fx + (dx * K) / 2;
      const fy = TOP + o.fy + (view === 'back' ? o.by ?? 0 : 0) + (dy * K) / 2;
      g.fillStyle = 'rgba(25, 18, 40, 0.3)';
      g.beginPath();
      g.ellipse(fx, fy, 16 * K, 7 * K, 0, 0, Math.PI * 2);
      g.fill();
      const sp = toSprite(wolfPainted(b.move, b.t, view), null, WOLF_CANVAS.ax, WOLF_CANVAS.ay);
      g.drawImage(sp.img, Math.round(fx - sp.ax * K), Math.round(fy - sp.ay * K), sp.w * K, sp.h * K);
      litAt(g, sp, fx, fy, K);
      g.restore();
      label(g, view === 'front' ? 'from in front' : 'from behind', ox + 10, TOP + o.h - 26);
    });
    const said = note?.(b);
    if (said) label(g, said, cvs.width - said.length * 12 - 16, 6);
  };
  draw(0);
  document.body.style.margin = '0';
  document.body.style.background = '#0d1030';
  document.body.appendChild(cvs);
  win.__frames = beats.length;
  win.__tickMs = 1000 / fps;
  win.__frame = (i: number): string => {
    draw(i);
    return cvs.toDataURL('image/png');
  };
  win.__ready = true;
}
const hold = (beats: Beat[], n: number): Beat[] => {
  const last = beats[beats.length - 1];
  for (let i = 0; i < n; i++) beats.push({ ...last });
  return beats;
};

if (HASH.startsWith('look')) look();
else if (HASH === 'standfilm') standFilm();
else if (HASH === 'walkfilm') {
  const fps = WOLF_WALK.fps;
  film(beatsOf([['stand', 0.5], ['walk', WOLF_WALK.period * 2], ['stand', 0.5]], fps), fps, 'The Fog Wolf glides, its legs lost in its fog (at its pace)', { w: 820, h: 640, fx: 200, fy: 330, k: 5, by: 190 });
} else if (HASH === 'bitefilm') {
  const B = WOLF_BITE;
  const at = (b: Beat): string => (b.move === 'attack' ? (b.t >= B.warn && b.t < B.lunge ? 'crouched, eyes flaring' : b.t >= B.lunge && b.t < B.hit ? 'the lunge' : b.t >= B.hit && b.t < 0.62 ? 'the snap' : '') : b.move === 'reel' ? 'struck' : '');
  film(beatsOf([['stand', 0.4], ['attack', B.long], ['stand', 0.5], ['reel', WOLF_REEL.long], ['stand', 0.4]], 30), 30, 'The Fog Wolf: its bite, a lunge out of the fog; then struck', { w: 700, h: 560, fx: 300, fy: 420, k: 6 }, at);
} else if (HASH === 'deathfilm') {
  const Dd = WOLF_DIE;
  const at = (b: Beat): string => (b.move === 'dying' ? (b.t < Dd.freeze ? 'struck' : b.t < Dd.gone ? 'it blows apart into fog' : b.t < Dd.out ? 'its eyes, last' : '') : '');
  film(hold(beatsOf([['stand', 0.4], ['dying', Dd.long]], 30), 15), 30, 'The Fog Wolf: its death', { w: 700, h: 560, fx: 320, fy: 420, k: 6 }, at);
}
else if (HASH.startsWith('big:')) {
  const [, mv, at, k0, raw] = HASH.split(':');
  const K = Number(k0 ?? 3) * 2;
  const W0 = Math.round(WOLF_CANVAS.w * K * 0.5);
  const H0 = Math.round(WOLF_CANVAS.h * K * 0.5);
  const cvs = document.createElement('canvas');
  cvs.width = W0 * 2;
  cvs.height = H0;
  const g = cvs.getContext('2d') as CanvasRenderingContext2D;
  g.imageSmoothingEnabled = false;
  meadow(g, cvs.width, cvs.height);
  (['front', 'back'] as const).forEach((view, k) => {
    const sp = toSprite(wolfPainted(mv, Number(at), view), null, WOLF_CANVAS.ax, WOLF_CANVAS.ay);
    g.drawImage(sp.img, Math.round(k * W0 + WOLF_CANVAS.ax * K * 0.5 - sp.ax * K), Math.round(WOLF_CANVAS.ay * K * 0.5 - sp.ay * K), sp.w * K, sp.h * K);
    if (raw !== 'raw') litAt(g, sp, k * W0 + WOLF_CANVAS.ax * K * 0.5, WOLF_CANVAS.ay * K * 0.5, K);
  });
  document.body.style.margin = '0';
  document.body.appendChild(cvs);
  win.__ready = true;
} else if (HASH.startsWith('frames:')) {
  const [, mv, list] = HASH.split(':');
  const ts = list.split(',').map(Number);
  const cw = 260;
  const cvs = document.createElement('canvas');
  cvs.width = cw * ts.length;
  cvs.height = 620;
  const g = cvs.getContext('2d') as CanvasRenderingContext2D;
  g.imageSmoothingEnabled = false;
  meadow(g, cvs.width, cvs.height);
  ts.forEach((t, i) => {
    (['front', 'back'] as const).forEach((view, k) => {
      const sp = toSprite(wolfPainted(mv, t, view), null, WOLF_CANVAS.ax, WOLF_CANVAS.ay);
      const fx = i * cw + cw / 2 - 10;
      const fy = 270 + k * 300;
      g.drawImage(sp.img, Math.round(fx - sp.ax * 3), Math.round(fy - sp.ay * 3), sp.w * 3, sp.h * 3);
    });
    label(g, `${t.toFixed(2)} s`, i * cw + 8, 6);
  });
  document.body.style.margin = '0';
  document.body.appendChild(cvs);
  win.__ready = true;
}
