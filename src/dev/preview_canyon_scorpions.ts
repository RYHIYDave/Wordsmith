// Dev page: FLOOR 8'S CANYON SCORPIONS (art/canyon_scorpions.ts), for the owner to look at. Nothing of the game
// imports it.
//
//   node tools/preview.mjs src/dev/preview_canyon_scorpions.ts shots/scorpion_look.png 1014 700 look
//     it standing, from in front and from behind, the knight beside it at the game's size; close-ups of it
//   node tools/page_gif.mjs src/dev/preview_canyon_scorpions.ts "standfilm" shots/scorpion_stand.gif 4
//     A FILM (10 frames a second): its stand, from in front and from behind, at twice the game's size
//   node tools/page_gif.mjs src/dev/preview_canyon_scorpions.ts "walkfilm" shots/scorpion_walk.gif 4
//     FILMS of its moves as the game plays them, from in front and from behind, at twice the game's size: walkfilm
//     (darting: a dash, a stop, a dash, carried over the floor at its pace), snapfilm (its pincer snap, then struck),
//     stingfilm (its tail strike), deathfilm

import { spriteOf3 } from '../art/heroes3';
import { MOVES3 } from '../art/moves3';
import { P } from '../art/palette';
import { SC_CANVAS, SC_DIE, SC_PACE, SC_REEL, SC_SNAP, SC_STAND, SC_STING, SC_WALK, scorpionFrame, scorpionPainted } from '../art/canyon_scorpions';
import { TILE3 } from '../art/new_mobs3';
import { project } from '../art/skeleton';
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
      if (mv === 'walk') ground += (SC_PACE * TILE3) / fps;
    }
    if (mv === 'stand') breath += n / fps;
    if (mv === 'walk') stride += n / fps;
  }
  return out;
}
function film(beats: Beat[], fps: number, title: string, o: { w: number; h: number; fx: number; fy: number }, note?: (b: Beat) => string): void {
  const TOP = 30;
  const cvs = document.createElement('canvas');
  cvs.width = o.w * 2;
  cvs.height = TOP + o.h;
  const g = cvs.getContext('2d') as CanvasRenderingContext2D;
  g.imageSmoothingEnabled = false;
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
      sand(g, o.w, o.h);
      g.translate(-ox, -TOP);
      const [dx, dy] = project([b.ground, 0, 0], view);
      const fx = ox + o.fx + dx * 2;
      const fy = TOP + o.fy + dy * 2;
      g.fillStyle = 'rgba(25, 18, 40, 0.3)';
      g.beginPath();
      g.ellipse(fx, fy, 70, 28, 0, 0, Math.PI * 2);
      g.fill();
      const sp = toSprite(scorpionPainted(b.move, b.t, view), null, SC_CANVAS.ax, SC_CANVAS.ay);
      g.drawImage(sp.img, Math.round(fx - sp.ax * 4), Math.round(fy - sp.ay * 4), sp.w * 4, sp.h * 4);
      g.restore();
      label(g, view === 'front' ? 'from in front' : 'from behind', ox + 10, TOP + o.h - 26);
    });
    const said = note?.(b);
    if (said) label(g, said, cvs.width - said.length * 10 - 12, 6);
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
const PANE = { w: 560, h: 520, fx: 260, fy: 330 };

if (HASH.startsWith('look')) look();
else if (HASH === 'standfilm') standFilm();
else if (HASH === 'walkfilm') {
  // (darting: a dash, a stop dead, a dash; the stops are its stand)
  const fps = SC_WALK.fps;
  film(beatsOf([['stand', 0.5], ['walk', 1.0], ['stand', 0.75], ['walk', 0.75], ['stand', 0.6]], fps), fps, 'The Canyon Scorpion darts (as the game would move it, at its pace)', { ...PANE, w: 640, fx: 140 });
} else if (HASH === 'snapfilm') {
  const at = (b: Beat): string => (b.move === 'attack' ? (b.t >= SC_SNAP.warn && b.t < 0.24 ? 'pincers wide, trembling' : Math.abs(b.t - SC_SNAP.hit) < 0.02 ? 'snap' : '') : b.move === 'reel' ? 'struck' : '');
  film(beatsOf([['stand', 0.4], ['attack', SC_SNAP.long], ['stand', 0.5], ['reel', SC_REEL.long], ['stand', 0.5]], 30), 30, 'The Canyon Scorpion: its pincer snap, then struck', PANE, at);
} else if (HASH === 'stingfilm') {
  const at = (b: Beat): string => (b.move === 'sting' ? (b.t >= SC_STING.warn && b.t < 0.58 ? 'tail drawn back, rattling' : b.t >= SC_STING.hit && b.t < SC_STING.hit + SC_STING.freeze ? 'the stab' : b.t >= SC_STING.hit + SC_STING.freeze && b.t < SC_STING.hit + 0.5 ? 'its venom, two tiles on' : '') : '');
  film(beatsOf([['stand', 0.4], ['sting', SC_STING.long], ['stand', 0.5]], 30), 30, 'The Canyon Scorpion: its tail strike', { ...PANE, w: 640, fx: 220, fy: 300 }, at);
} else if (HASH === 'deathfilm') {
  const beats = beatsOf([['stand', 0.4], ['dying', SC_DIE.long]], 30);
  for (let i = 0; i < 18; i++) beats.push({ move: 'dying', t: SC_DIE.long, ground: 0 });
  film(beats, 30, 'The Canyon Scorpion: flipped onto its back, its legs curling', PANE, (b) => (b.move === 'dying' && b.t < 0.1 ? 'struck' : ''));
}
else if (HASH.startsWith('frames:')) {
  // (several moments of one move side by side, from in front above and from behind below: `frames:move:t1,t2,...`)
  const [, mv, list] = HASH.split(':');
  const ts = list.split(',').map(Number);
  const cw = 250;
  const cvs = document.createElement('canvas');
  cvs.width = cw * ts.length;
  cvs.height = 560;
  const g = cvs.getContext('2d') as CanvasRenderingContext2D;
  g.imageSmoothingEnabled = false;
  sand(g, cvs.width, cvs.height);
  ts.forEach((t, i) => {
    (['front', 'back'] as const).forEach((view, k) => {
      const sp = toSprite(scorpionPainted(mv, t, view), null, SC_CANVAS.ax, SC_CANVAS.ay);
      const fx = i * cw + cw / 2;
      const fy = 200 + k * 270;
      g.drawImage(sp.img, Math.round(fx - sp.ax * 4), Math.round(fy - sp.ay * 4), sp.w * 4, sp.h * 4);
    });
    label(g, `${t.toFixed(2)} s`, i * cw + 8, 6);
  });
  document.body.style.margin = '0';
  document.body.appendChild(cvs);
  win.__ready = true;
}

