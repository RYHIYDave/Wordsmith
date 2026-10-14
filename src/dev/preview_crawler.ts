// Dev page: FLOOR 7'S CLIFF CRAWLER (art/ledge_crawlers.ts), for the owner to look at. Nothing of the game imports it.
//
//   node tools/preview.mjs src/dev/preview_crawler.ts shots/crawler_look.png 1014 700 look
//     the crawler standing, from in front and from behind, the knight beside it at the game's size (the top row);
//     close-ups of the whole figure, three times the top row's size (the bottom row)
//   node tools/preview.mjs src/dev/preview_crawler.ts shots/crawler_head.png 1014 360 head
//     the head from in front and from behind, eight times the top row's size; its feet from in front, six times
//   node tools/preview.mjs src/dev/preview_crawler.ts shots/crawler_phone.png 844 390 phone:0.2
//     the phone's size: the knight; the crawler walking (T seconds into its cycle); and the crawler at the landing of its leap
//   node tools/page_gif.mjs src/dev/preview_crawler.ts "walkfilm" shots/crawler_walk.gif 0
//     its walk, a tripod, sixteen frames a second, from in front and from behind, as it goes over the floor at its pace
//   node tools/page_gif.mjs src/dev/preview_crawler.ts "standfilm" shots/crawler_stand.gif 0
//     its stand, ten frames a second, never still; from in front and from behind
//   node tools/page_gif.mjs src/dev/preview_crawler.ts "attackfilm" shots/crawler_swipe.gif 0
//     its claw swipe, its basic blow: thirty a second, from in front and from behind
//   node tools/page_gif.mjs src/dev/preview_crawler.ts "leapfilm" shots/crawler_leap.gif 0
//     its leap, its one big move: the crouch, the spring, the landing held a tenth, the sink, the hop back; thirty a second
//   node tools/page_gif.mjs src/dev/preview_crawler.ts "reelfilm" shots/crawler_reel.gif 0
//     its flinch, struck: the freeze, the knock, back on its feet by 0.30 s; thirty a second
//   node tools/page_gif.mjs src/dev/preview_crawler.ts "deathfilm" shots/crawler_death.gif 0
//     its death: the buckle, the shell cracks open, its eyes out by 0.50 s, still from 0.80 s; thirty a second
//   node tools/preview.mjs src/dev/preview_crawler.ts shots/crawler_phonedown.png 844 390 phonedown
//     the phone's size: the knight; the crawler struck; the crawler dead, its shell cracked
//   node tools/preview.mjs src/dev/preview_crawler.ts shots/crawler_sheet_leap.png 1300 1000 sheet:leap
//     one move frame by frame at 2.2 times the game's size, from in front (sheet:leap:back for behind);
//     the moves: stand, walk, attack, leap, reel, dying

import { spriteOf3 } from '../art/heroes3';
import { MOVES3 } from '../art/moves3';
import { P } from '../art/palette';
import { CR_LEAP, CR_PACE, CR_REEL, CR_DIE, CR_STAND, CR_SWIPE, CR_WALK, crawlerFrame, crawlerStanding } from '../art/ledge_crawlers';
import { TILE3 } from '../art/new_mobs3';
import { project } from '../art/skeleton';
import { drawText } from '../engine/font';
import type { Sprite } from '../engine/px';
import { THEME } from '../ui/ui';
import { PW, drawAt } from './act1_stage';

const HASH = decodeURIComponent(location.hash.slice(1)) || 'look';
const T = Number(HASH.split(':')[1] ?? 0.2);

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

const SHADOW_RX = 46;

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
  const front = crawlerStanding('front');
  const back = crawlerStanding('back');
  const put = (sp: Sprite, x: number, rx: number, name: string): void => {
    shadow(x, rx);
    drawAt(g, sp, x, FOOT);
    label(g, name, x - name.length * 5, FOOT + 14);
  };
  put(knight, 150, 26, 'the knight');
  put(front, 480, SHADOW_RX, 'from in front');
  put(back, 830, SHADOW_RX, 'from behind');
  label(g, 'The cliff crawler, standing (the row above at the game\'s size)', 8, 6);
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
  const front = crawlerStanding('front');
  const back = crawlerStanding('back');
  crop(g, front, 40, 60, 8, -54, 24, 24, 8);
  label(g, 'the head, from in front', 40, 28);
  crop(g, back, 320, 60, 8, -54, 24, 24, 8);
  label(g, 'the head, from behind', 320, 28);
  crop(g, front, 600, 60, -40, -16, 80, 30, 5);
  label(g, 'the feet, from in front', 600, 28);
  label(g, 'The cliff crawler, close (its eyes the enemy\'s pink; its legs and claws)', 8, 326);
  document.body.style.margin = '0';
  document.body.style.background = '#0d1030';
  document.body.appendChild(cvs);
  (window as unknown as { __ready: boolean }).__ready = true;
}

/**
 * THE PHONE'S SIZE: 844 by 390, as the game is shown in landscape. The knight; the crawler walking, T seconds into its
 * cycle, from in front; and the crawler at the landing of its leap, from in front; each at the game's own size.
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
  const knight = spriteOf3(MOVES3.rear, 0, 'front');
  const walk = crawlerFrame('walk', T, 'front');
  const landing = crawlerFrame('leap', CR_LEAP.hit, 'front');
  const put = (sp: Sprite, x: number, rx: number, name: string): void => {
    shadow(x, rx);
    drawAt(g, sp, x, FOOT);
    label(g, name, x - name.length * 5, FOOT + 14);
  };
  put(knight, 150, 26, 'the knight');
  put(walk, 420, SHADOW_RX, 'walking');
  put(landing, 700, SHADOW_RX, 'its leap lands');
  document.body.style.margin = '0';
  document.body.style.background = '#0d1030';
  document.body.appendChild(cvs);
  (window as unknown as { __ready: boolean }).__ready = true;
}

/** Struck, and dead: the phone's size, the knight beside them. */
function phonedown(): void {
  const H = 390;
  const cvs = document.createElement('canvas');
  cvs.width = PW;
  cvs.height = H;
  const g = cvs.getContext('2d') as CanvasRenderingContext2D;
  g.imageSmoothingEnabled = false;
  floor(g, PW, H);
  const FOOT = 300;
  const knight = spriteOf3(MOVES3.rear, 0, 'front');
  const struck = crawlerFrame('reel', CR_REEL.freeze + 0.03, 'front');
  const dead = crawlerFrame('dying', CR_DIE.long, 'front');
  drawAt(g, knight, 150, FOOT);
  label(g, 'the knight', 150 - 50, FOOT + 14);
  drawAt(g, struck, 420, FOOT);
  label(g, 'struck', 420 - 18, FOOT + 14);
  drawAt(g, dead, 700, FOOT);
  label(g, 'dead', 700 - 12, FOOT + 14);
  document.body.style.margin = '0';
  document.body.style.background = '#0d1030';
  document.body.appendChild(cvs);
  (window as unknown as { __ready: boolean }).__ready = true;
}

// ---------------------------------------------------------------------------------------------
// THE FILMS: what it does at each moment (which move, how far into it, how far it has come over the floor).

const win = window as unknown as { __ready: boolean; __frames: number; __tickMs: number; __frame: (i: number) => string };
const PANE_W = 560;
const PANE_H = 500;
const TOP = 30;
/** The films show it this many canvas pixels to a game pixel (drawAt's own is two): so its legs and claws can be read. */
const FILM_ZOOM = 3;
function zoomAt(g: CanvasRenderingContext2D, sp: Sprite, x: number, y: number, s: number): void {
  g.drawImage(sp.img, Math.round(x - sp.ax * s), Math.round(y - sp.ay * s), sp.w * s, sp.h * s);
}
type Beat = { move: string; t: number; ground: number };
/** A run of moves one after another (`[move, seconds]`), a frame at each 1/fps; `last`: the frame at the move's end too. */
function beatsOf(run: ReadonlyArray<readonly [string, number]>, fps: number, last = false, pace = 0): Beat[] {
  const out: Beat[] = [];
  let ground = 0;
  for (const [move, long] of run) {
    const n = Math.round(long * fps) + (last ? 1 : 0);
    for (let i = 0; i < n; i++) {
      out.push({ move, t: i / fps, ground });
      if (move === 'walk') ground += (pace * TILE3) / fps;
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
      g.ellipse(fx, fy, SHADOW_RX * FILM_ZOOM * 0.5, SHADOW_RX * FILM_ZOOM * 0.5 * 0.4, 0, 0, Math.PI * 2);
      g.fill();
      zoomAt(g, crawlerFrame(b.move, b.t, view), fx, fy, FILM_ZOOM);
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


/** A contact sheet of one move, frame by frame (every `every`th frame), from in front or behind, for checking the motion. */
const SHEETS: Record<string, [number, number, number]> = {
  walk: [CR_WALK.period * 2, CR_WALK.fps, 1],
  stand: [CR_STAND.period, CR_STAND.fps, 1],
  attack: [CR_SWIPE.long, CR_SWIPE.fps, 3],
  leap: [CR_LEAP.long, CR_LEAP.fps, 3],
  reel: [CR_REEL.long, CR_REEL.fps, 1],
  dying: [CR_DIE.long, CR_DIE.fps, 3],
};
/** Its figure is drawn this many times the game's size on a sheet, so that its legs and claws can be read. */
const SHEET_ZOOM = 2.2;
function sheet(move: string, view: 'front' | 'back'): void {
  const [long, fps, every] = SHEETS[move];
  const times: number[] = [];
  for (let i = 0; i <= Math.round(long * fps); i += every) times.push(i / fps);
  const cols = 5;
  const cw = 260;
  const ch = 240;
  const floorAt = Math.round(ch * 0.66);
  const rows = Math.ceil(times.length / cols);
  const cvs = document.createElement('canvas');
  cvs.width = cols * cw;
  cvs.height = rows * ch + 30;
  const g = cvs.getContext('2d') as CanvasRenderingContext2D;
  g.imageSmoothingEnabled = false;
  g.fillStyle = '#0d1030';
  g.fillRect(0, 0, cvs.width, cvs.height);
  label(g, `The cliff crawler, ${move}, from ${view === 'front' ? 'in front' : 'behind'}: frame by frame (${every > 1 ? 'every ' + every + 'th' : 'every'} frame at ${fps} a second)`, 8, 6);
  times.forEach((t, k) => {
    const x0 = (k % cols) * cw;
    const y0 = 30 + Math.floor(k / cols) * ch;
    g.save();
    g.beginPath();
    g.rect(x0 + 1, y0 + 1, cw - 2, ch - 2);
    g.clip();
    g.fillStyle = '#766d7c';
    g.fillRect(x0, y0, cw, ch);
    g.fillStyle = '#6c6372';
    g.fillRect(x0, y0 + floorAt, cw, ch - floorAt);
    zoomAt(g, crawlerFrame(move, t, view), x0 + cw / 2, y0 + floorAt, SHEET_ZOOM);
    g.restore();
    label(g, `${t.toFixed(3)} s`, x0 + 6, y0 + 6);
  });
  document.body.style.margin = '0';
  document.body.style.background = '#0d1030';
  document.body.appendChild(cvs);
  (window as unknown as { __ready: boolean }).__ready = true;
}

const PANES = [
  { view: 'front' as const, x: 280, y: 330 },
  { view: 'back' as const, x: 280, y: 330 },
];

if (HASH === 'walkfilm') {
  filmBeats(beatsOf([['walk', 1.5]], CR_WALK.fps, false, CR_PACE), CR_WALK.fps, 'The cliff crawler scuttles over the rock, as the game plays it (sixteen a second, its pace)', PANES);
}
if (HASH === 'standfilm') {
  filmBeats(beatsOf([['stand', CR_STAND.period * 2]], CR_STAND.fps, true), CR_STAND.fps, 'The cliff crawler stands and never stills (ten a second)', PANES);
}
if (HASH === 'attackfilm') {
  filmBeats(beatsOf([['attack', CR_SWIPE.long]], CR_SWIPE.fps, true), CR_SWIPE.fps, `The claw swipe: warning, the blow at ${CR_SWIPE.hit} s, followed through (thirty a second)`, PANES);
}
if (HASH === 'leapfilm') {
  filmBeats(beatsOf([['leap', CR_LEAP.long]], CR_LEAP.fps, true), CR_LEAP.fps, `The leap: the crouch, the spring, the landing held a tenth (${CR_LEAP.hit} s), the hop back (thirty a second)`, PANES);
}
if (HASH === 'reelfilm') {
  filmBeats(beatsOf([['reel', CR_REEL.long]], CR_REEL.fps, true), CR_REEL.fps, 'The cliff crawler is struck: the freeze, the knock, back on its feet by 0.30 s (thirty a second)', PANES);
}
if (HASH === 'deathfilm') {
  filmBeats(beatsOf([['dying', CR_DIE.long]], CR_DIE.fps, true), CR_DIE.fps, 'The cliff crawler dies: its shell cracks open; its eyes out by 0.50 s; still from 0.80 s (thirty a second)', PANES);
}

if (HASH.startsWith('look')) look();
if (HASH.startsWith('head')) head();
if (HASH.startsWith('phone:')) phone();
if (HASH === 'phonedown') phonedown();
if (HASH.startsWith('sheet:')) {
  const [, move, view] = HASH.split(':');
  sheet(move, view === 'back' ? 'back' : 'front');
}
