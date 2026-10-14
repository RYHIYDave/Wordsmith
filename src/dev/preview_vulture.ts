// Dev page: FLOOR 7'S VULTURE (art/ledge_vultures.ts), for the owner to look at. Nothing of the game imports it.
//
//   node tools/preview.mjs src/dev/preview_vulture.ts shots/vulture_look.png 1014 700 look
//     the vulture standing, from in front and from behind, the knight beside it at the game's size (the top row);
//     close-ups of the whole figure from in front and from behind, three times the top row's size (the bottom row)
//   node tools/preview.mjs src/dev/preview_vulture.ts shots/vulture_head.png 1014 360 head
//     the head from in front and from behind, eight times the top row's size; its feet from in front, six times
//   node tools/preview.mjs src/dev/preview_vulture.ts shots/vulture_phone.png 844 390 phone:0.4
//     the phone's size: the knight, the vulture circling (T seconds into its round), and the vulture at its strike
//   node tools/page_gif.mjs src/dev/preview_vulture.ts "walkfilm" shots/vulture_walk.gif 0
//     its walk, the circling flight, as the game plays it: sixteen frames a second, three seconds, from in front and behind
//   node tools/page_gif.mjs src/dev/preview_vulture.ts "divefilm" shots/vulture_dive.gif 0
//     its dive, its one attack, as the game plays it: thirty frames a second, from in front and from behind

import { spriteOf3 } from '../art/heroes3';
import { MOVES3 } from '../art/moves3';
import { P } from '../art/palette';
import { VULTURE, VULTURE_DIVE, VULTURE_PACE, VULTURE_WALK, vultureFrame, vultureStanding } from '../art/ledge_vultures';
import { TILE3 } from '../art/new_mobs3';
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

/**
 * THE PHONE'S SIZE: 844 by 390, as the game is shown in landscape. The knight; the vulture circling, T seconds into its
 * round, from in front; and the vulture at the strike of its dive, from in front; each at the game's own size.
 */
function phone(): void {
  const H = 390;
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
  shadow(160, 26);
  drawAt(g, spriteOf3(MOVES3.rear, 0, 'front'), 160, FOOT);
  shadow(420, 34);
  drawAt(g, vultureFrame('walk', T, 'front'), 420, FOOT);
  shadow(640, 34);
  drawAt(g, vultureFrame('attack', VULTURE_DIVE.hit, 'front'), 640, FOOT);
  label(g, 'the knight; the vulture circling; the vulture at its strike (the game\'s size)', 8, 6);
  document.body.style.margin = '0';
  document.body.style.background = '#0d1030';
  document.body.appendChild(cvs);
  (window as unknown as { __ready: boolean }).__ready = true;
}

// ---------------------------------------------------------------------------------------------
// FILMS (tools/page_gif.mjs): the page draws any one frame of them on asking. THE WALK: its circling flight as the game
// plays it (sixteen frames a second, one wing beat a round), at its pace, from in front and from behind. Its shadow stays
// on the floor under it while it flies. THE DIVE: its one attack as the game plays it (thirty a second).

const win = window as unknown as { __ready: boolean; __frames: number; __tickMs: number; __frame: (i: number) => string };
const PANE_W = 560;
const PANE_H = 500;
const TOP = 30;
/** The films show it this many canvas pixels to a game pixel (drawAt's own is two): so its wings and feet can be read. */
const FILM_ZOOM = 3;
/** A picture, its anchor (the floor point under it) on (x, y), `s` canvas pixels to a game pixel. */
function zoomAt(g: CanvasRenderingContext2D, sp: Sprite, x: number, y: number, s: number): void {
  g.drawImage(sp.img, Math.round(x - sp.ax * s), Math.round(y - sp.ay * s), sp.w * s, sp.h * s);
}
/** What it does at each moment of a film: which move, how far into it, how far it has come over the floor. */
type Beat = { move: string; t: number; ground: number };
/** A run of moves one after another (`[move, seconds]`), a frame at each 1/fps. */
function beatsOf(run: ReadonlyArray<readonly [string, number]>, fps: number): Beat[] {
  const out: Beat[] = [];
  let ground = 0;
  for (const [move, long] of run) {
    const n = Math.round(long * fps);
    for (let i = 0; i < n; i++) {
      out.push({ move, t: i / fps, ground });
      if (move === 'walk') ground += (VULTURE_PACE * TILE3) / fps;
    }
  }
  return out;
}
function filmBeats(beats: Beat[], fps: number, title: string, at: ReadonlyArray<{ view: 'front' | 'back'; x: number; y: number }>): void {
  const cvs = document.createElement('canvas');
  cvs.width = PANE_W * at.length;
  cvs.height = TOP + PANE_H;
  const g = cvs.getContext('2d') as CanvasRenderingContext2D;
  g.imageSmoothingEnabled = false;
  const draw = (i: number): void => {
    const b = beats[i];
    g.fillStyle = '#0d1030';
    g.fillRect(0, 0, cvs.width, cvs.height);
    label(g, title, 8, 6);
    at.forEach(({ view, x, y }, k) => {
      const ox = k * PANE_W;
      g.save();
      g.beginPath();
      g.rect(ox + 2, TOP, PANE_W - 4, PANE_H - 2);
      g.clip();
      g.fillStyle = '#766d7c';
      g.fillRect(ox, TOP, PANE_W, PANE_H);
      g.fillStyle = '#6c6372';
      for (let yy = 0; yy < PANE_H; yy += 32) for (let xx = (yy / 32) % 2 ? 0 : 64; xx < PANE_W; xx += 128) g.fillRect(ox + xx, TOP + yy, 64, 32);
      const [dx, dy] = project([b.ground, 0, 0], view);
      const fx = ox + x + dx;
      const fy = TOP + y + dy;
      g.fillStyle = 'rgba(25, 18, 40, 0.3)';
      g.beginPath();
      g.ellipse(fx, fy, (VULTURE.shadow / 2) * FILM_ZOOM, (VULTURE.shadow / 2) * FILM_ZOOM * 0.4, 0, 0, Math.PI * 2);
      g.fill();
      zoomAt(g, vultureFrame(b.move, b.t, view), fx, fy, FILM_ZOOM);
      g.restore();
      label(g, view === 'front' ? 'from in front' : 'from behind', ox + 10, TOP + PANE_H - 26);
    });
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

if (HASH.startsWith('look')) look();
if (HASH.startsWith('head')) head();
if (HASH.startsWith('phone')) phone();
if (HASH === 'walkfilm') {
  filmBeats(beatsOf([['walk', 3]], VULTURE_WALK.fps), VULTURE_WALK.fps, 'The vulture circles, as the game plays it (its pace)', [
    { view: 'front', x: 200, y: 330 },
    { view: 'back', x: 200, y: 330 },
  ]);
}
if (HASH === 'divefilm') {
  filmBeats(beatsOf([['attack', VULTURE_DIVE.long]], VULTURE_DIVE.fps), VULTURE_DIVE.fps, 'The vulture dives: warning 0.25 s, strike 0.70 s, held 0.1 s (30 a second)', [
    { view: 'front', x: 200, y: 330 },
    { view: 'back', x: 200, y: 330 },
  ]);
}
