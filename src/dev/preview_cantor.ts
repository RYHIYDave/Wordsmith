// Dev page: FLOOR 8'S BOSS, THE CANTOR (art/cantor.ts), for the owner to look at. Nothing of the game imports it.
//
//   node tools/preview.mjs src/dev/preview_cantor.ts shots/cantor_look.png 1014 1000 look
//     him standing, from in front and from behind, the knight and the Chanter beside him at the game's size, for
//     his size; close-ups of him from in front and from behind, at twice the game's size
//   node tools/page_gif.mjs src/dev/preview_cantor.ts "standfilm" shots/cantor_stand.gif 3
//     A FILM (10 frames a second): his stand, from in front and from behind side by side
//   node tools/page_gif.mjs src/dev/preview_cantor.ts "walkfilm" shots/cantor_walk.gif 4
//     FILMS of his moves, from in front and from behind side by side, as the game plays them: walkfilm (carried
//     over the floor at his pace, 16 a second), strikefilm (his staff strike, then struck), shoutfilm, copiesfilm,
//     rockfallfilm, deathfilm (30 a second)
//   node tools/preview.mjs src/dev/preview_cantor.ts shots/x.png 1014 760 "frame:attack:1.0"
//     one moment of a move, from in front and from behind

import { spriteOf3 } from '../art/heroes3';
import { MOVES3 } from '../art/moves3';
import { P } from '../art/palette';
import { CANTOR, CANTOR_CANVAS, CANTOR_COPIES, CANTOR_DIE, CANTOR_PACE, CANTOR_REEL_LONG, CANTOR_ROCKFALL, CANTOR_SHOUT, CANTOR_STAND_LONG, CANTOR_STRIKE, cantorStanding } from '../art/cantor';
import { CHANTER, CHANTER_CANVAS } from '../art/act1_cultists';
import { toSprite } from '../art/kit';
import { ENEMY_RIM } from '../art/mkit';
import { TILE3, deathOfMob, paintMob } from '../art/new_mobs3';
import { project } from '../art/skeleton';
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

/** What he does at each moment of a film: which move, how far into it, how far he has come over the floor (his death: `die`, how far through it). */
type Beat = { move: string; t: number; ground: number; die?: number };
function beatsOf(run: ReadonlyArray<readonly [string, number]>, fps: number): Beat[] {
  const out: Beat[] = [];
  let ground = 0;
  let breath = 0;
  for (const [mv, long] of run) {
    const n = Math.round(long * fps);
    for (let i = 0; i < n; i++) {
      const t = i / fps;
      out.push({ move: mv, t: mv === 'stand' ? breath + t : t, ground });
      if (mv === 'walk') ground += (CANTOR_PACE * TILE3) / fps;
    }
    if (mv === 'stand') breath += n / fps;
  }
  return out;
}
/** A FILM: the beats one after another, from in front and from behind side by side, `scale` screen pixels to a picture pixel (1: the game's size; 2: twice it), his feet at (`fx`, `fy`) in each pane. */
function filmBeats(beats: Beat[], fps: number, title: string, o: { w: number; h: number; scale: number; fx: number; fy: number }, note?: (b: Beat) => string): void {
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
      const fx = ox + o.fx + dx * o.scale;
      const fy = TOP + o.fy + dy * o.scale;
      g.fillStyle = 'rgba(25, 18, 40, 0.3)';
      g.beginPath();
      g.ellipse(fx, fy, 30 * o.scale, 12 * o.scale, 0, 0, Math.PI * 2);
      g.fill();
      const painted = b.die !== undefined ? deathOfMob(CANTOR, b.die, view) : paintMob(CANTOR, b.move, b.t, view, ENEMY_RIM);
      const sp = toSprite(painted, null, CANTOR_CANVAS.ax, CANTOR_CANVAS.ay);
      const k2 = o.scale * 2;
      g.drawImage(sp.img, Math.round(fx - sp.ax * k2), Math.round(fy - sp.ay * k2), sp.w * k2, sp.h * k2);
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
const BIG = { w: 640, h: 800, scale: 2, fx: 320, fy: 640 };
const WIDE = { w: 760, h: 620, scale: 1, fx: 380, fy: 400 };

if (HASH.startsWith('look')) look();
else if (HASH === 'standfilm') standFilm();
else if (HASH === 'walkfilm') {
  filmBeats(beatsOf([['stand', 0.5], ['walk', 3], ['stand', 0.5]], CANTOR.walkFps), CANTOR.walkFps, 'The Cantor walks in procession (as the game plays it, at his pace; twice the game\'s size)', { ...BIG, fx: 220, fy: 600 });
} else if (HASH === 'strikefilm') {
  const S = CANTOR_STRIKE;
  const at = (b: Beat): string => (b.move === 'attack' ? (b.t >= S.warn && b.t < S.swing ? 'held overhead, trembling' : b.t >= S.hit && b.t < S.hit + S.freeze ? 'the bell on the rock' : Math.abs(b.t - S.hit - S.echo) < 0.06 ? 'its echo' : '') : b.move === 'reel' ? 'struck' : '');
  filmBeats(beatsOf([['stand', 0.4], ['attack', S.long], ['stand', 0.5], ['reel', CANTOR_REEL_LONG], ['stand', 0.6]], 30), 30, 'The Cantor: his staff strike, then struck (twice the game\'s size)', { ...BIG, fx: 200 }, at);
} else if (HASH === 'shoutfilm') {
  const S = CANTOR_SHOUT;
  const at = (b: Beat): string => (b.move === 'shout' ? (b.t >= S.warn && b.t < S.lunge ? 'drawing in light' : b.t >= S.hit && b.t < S.hit + 0.3 ? 'the blast' : b.t >= S.back && b.t < S.back + 0.5 ? 'it comes back off the far wall' : '') : '');
  filmBeats(beatsOf([['stand', 0.4], ['shout', S.long], ['stand', 0.5]], 30), 30, 'The Cantor: his shout (twice the game\'s size)', { w: 760, h: 820, scale: 2, fx: 250, fy: 470 }, at);
} else if (HASH === 'copiesfilm') {
  filmBeats(beatsOf([['stand', 0.4], ['copies', CANTOR_COPIES.long], ['stand', 0.4]], 30), 30, 'The Cantor: his sound-copies (twice the game\'s size)', BIG);
} else if (HASH === 'rockfallfilm') {
  filmBeats(beatsOf([['stand', 0.4], ['rockfall', CANTOR_ROCKFALL.long], ['stand', 0.4]], 30), 30, 'The Cantor: his rockfall (twice the game\'s size)', { w: 760, h: 900, scale: 2, fx: 380, fy: 640 });
} else if (HASH === 'deathfilm') {
  const fps = 30;
  const beats: Beat[] = [];
  for (let i = 0; i < Math.round(0.5 * fps); i++) beats.push({ move: 'stand', t: i / fps, ground: 0 });
  const n = Math.round(CANTOR_DIE.long * fps);
  for (let i = 0; i <= n; i++) beats.push({ move: 'dying', t: (i / n) * CANTOR_DIE.long, ground: 0, die: i / n });
  for (let i = 0; i < Math.round(0.6 * fps); i++) beats.push({ move: 'dying', t: CANTOR_DIE.long, ground: 0, die: 1 });
  filmBeats(beats, fps, 'The Cantor: his last note tears him apart (twice the game\'s size)', BIG, (b) => (b.die !== undefined && b.t < 0.12 ? 'struck' : ''));
} else if (HASH.startsWith('phone')) {
  // (as a phone shows him: the game's size, a phone's screen, 844 by 390, from in front and from behind)
  const [, mv, ts] = HASH.split(':');
  const t = Number(ts ?? 0);
  const beat: Beat = mv === 'dying' ? { move: mv, t, ground: 0, die: t / CANTOR_DIE.long } : { move: mv, t, ground: 0 };
  filmBeats([beat], 30, `${mv} at ${t.toFixed(2)} s, as a phone shows it`, { w: 422, h: 390, scale: 1, fx: 170, fy: 250 });
} else if (HASH.startsWith('frame')) {
  const [, mv, ts] = HASH.split(':');
  const t = Number(ts ?? 0);
  const beat: Beat = mv === 'dying' ? { move: mv, t, ground: 0, die: t / CANTOR_DIE.long } : { move: mv, t, ground: 0 };
  filmBeats([beat], 30, `${mv} at ${t.toFixed(2)} s`, { w: 507, h: 730, scale: 2, fx: 253, fy: 600 });
}
