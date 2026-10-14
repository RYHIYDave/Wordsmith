// Dev page: FLOOR 7'S BOSS, THE CARRION QUEEN (art/carrion_queen.ts), for the owner to look at. Nothing of the
// game imports it.
//
//   node tools/preview.mjs src/dev/preview_carrion_queen.ts shots/cq_look.png 1014 1000 look
//     her standing, from in front and from behind, the knight and the Unfinished beside her at the game's
//     size, for her size; close-ups of her from in front and from behind
//   node tools/page_gif.mjs src/dev/preview_carrion_queen.ts "walkfilm" shots/cq_walk.gif 4
//     A FILM (16 frames a second): her hop as the game plays it, from in front and from behind side by side,
//     carried over the floor at her pace: standing, three hops, standing
//   node tools/page_gif.mjs src/dev/preview_carrion_queen.ts "rakefilm" shots/cq_rake.gif 6
//     A FILM (30 frames a second): standing, her talon rake, standing, struck, standing; the moment her
//     talons land marked under the picture

import { spriteOf3 } from '../art/heroes3';
import { MOVES3 } from '../art/moves3';
import { P } from '../art/palette';
import { CARRION_QUEEN, CQ_CALL, CQ_DIVE, CQ_GUST, CQ_PACE, CQ_RAKE, queenFrame, queenStanding } from '../art/carrion_queen';
import { TILE3 } from '../art/new_mobs3';
import { project } from '../art/skeleton';
import { unfinishedStanding } from '../art/unfinished';
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

function look(): void {
  const H = 1000;
  const cvs = document.createElement('canvas');
  cvs.width = PW;
  cvs.height = H;
  const g = cvs.getContext('2d') as CanvasRenderingContext2D;
  g.imageSmoothingEnabled = false;
  // the trail's rock as a floor under them, plain
  g.fillStyle = '#766d7c';
  g.fillRect(0, 0, PW, H);
  g.fillStyle = '#6c6372';
  for (let y = 0; y < H; y += 32) for (let x = (y / 32) % 2 ? 0 : 64; x < PW; x += 128) g.fillRect(x, y, 64, 32);
  const FOOT = 960;
  const shadow = (x: number, rx: number): void => {
    g.fillStyle = 'rgba(25, 18, 40, 0.3)';
    g.beginPath();
    g.ellipse(x, FOOT, rx, rx * 0.4, 0, 0, Math.PI * 2);
    g.fill();
  };
  const knight = spriteOf3(MOVES3.rear, 0, 'front');
  const uf = unfinishedStanding(0.4, 'front');
  const front = queenStanding(T, 'front');
  const back = queenStanding(T, 'back');
  const put = (sp: Sprite, x: number, rx: number, name: string): void => {
    shadow(x, rx);
    drawAt(g, sp, x, FOOT);
    label(g, name, x - name.length * 5, FOOT + 14);
  };
  put(knight, 44, 14, 'knight');
  put(front, 270, 80, 'from in front');
  put(back, 560, 80, 'from behind');
  put(uf, 850, 70, 'the Unfinished');
  label(g, 'The Carrion Queen, standing mantled (the row below at the game\'s size)', 8, 6);
  // close-ups, twice the game's size
  const big = (sp: Sprite, x: number, name: string): void => {
    g.drawImage(sp.img, Math.round(x - sp.ax * 3), Math.round(560 - sp.ay * 3), sp.w * 3, sp.h * 3);
    label(g, name, x - name.length * 5, 570);
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
const PANE_W = 560;
const PANE_H = 500;
const TOP = 30;
/** What she does at each moment of a film: which move, how far into it, how far she has come over the floor. */
type Beat = { move: string; t: number; ground: number };
/** A run of moves one after another (`[move, seconds]`), a frame at each 1/fps: her stand goes on breathing from where it was. */
function beatsOf(run: ReadonlyArray<readonly [string, number]>, fps: number): Beat[] {
  const out: Beat[] = [];
  let ground = 0;
  let breath = 0;
  for (const [move, long] of run) {
    const n = Math.round(long * fps);
    for (let i = 0; i < n; i++) {
      const t = i / fps;
      out.push({ move, t: move === 'stand' ? breath + t : t, ground });
      if (move === 'walk') ground += (CQ_PACE * TILE3) / fps;
    }
    if (move === 'stand') breath += n / fps;
  }
  return out;
}
function film(run: ReadonlyArray<readonly [string, number]>, fps: number, title: string, at: ReadonlyArray<{ view: 'front' | 'back'; x: number; y: number }>, note?: (b: Beat) => string): void {
  const beats = beatsOf(run, fps);
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
      g.ellipse(fx, fy, 90, 36, 0, 0, Math.PI * 2);
      g.fill();
      drawAt(g, queenFrame(b.move, b.t, view), fx, fy);
      g.restore();
      label(g, view === 'front' ? 'from in front' : 'from behind', ox + 10, TOP + PANE_H - 26);
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

if (HASH === 'look') look();
else if (HASH === 'walkfilm') {
  const fps = CARRION_QUEEN.walkFps;
  film([['stand', 0.5], ['walk', 3], ['stand', 0.75]], fps, 'The Carrion Queen hops (as the game plays it, at her pace)', [{ view: 'front', x: 190, y: 340 }, { view: 'back', x: 190, y: 400 }]);
} else if (HASH === 'gustfilm') {
  const at = (b: Beat): string => (b.move === 'gust' && Math.abs(b.t - CQ_GUST.hit) < 0.05 ? 'the wings beat down' : b.move === 'gust' && b.t < CQ_GUST.hit ? 'held, trembling' : '');
  film([['stand', 0.4], ['gust', CQ_GUST.long], ['stand', 0.5]], 30, 'The Carrion Queen: her wing gust', [{ view: 'front', x: 250, y: 400 }, { view: 'back', x: 250, y: 420 }], at);
} else if (HASH === 'divefilm') {
  const at = (b: Beat): string => (b.move === 'dive' && Math.abs(b.t - CQ_DIVE.hit) < 0.05 ? 'her talons strike' : b.move === 'dive' && b.t >= CQ_DIVE.warn && b.t < 0.85 ? 'hangs, trembling' : '');
  film([['stand', 0.4], ['dive', CQ_DIVE.long], ['stand', 0.5]], 30, 'The Carrion Queen: her dive along the line', [{ view: 'front', x: 250, y: 400 }, { view: 'back', x: 250, y: 420 }], at);
} else if (HASH === 'callfilm') {
  film([['stand', 0.4], ['call', CQ_CALL.long], ['stand', 0.5]], 30, 'The Carrion Queen: her call', [{ view: 'front', x: 250, y: 400 }, { view: 'back', x: 250, y: 420 }]);
} else if (HASH === 'rakefilm') {
  const hitAt = (b: Beat): string => (b.move === 'attack' && Math.abs(b.t - CQ_RAKE.hit) < 0.05 ? 'her talons land' : b.move === 'reel' ? 'struck' : '');
  film([['stand', 0.4], ['attack', CQ_RAKE.long], ['stand', 0.5], ['reel', 0.4], ['stand', 0.6]], 30, 'The Carrion Queen: her talon rake, then struck', [{ view: 'front', x: 250, y: 400 }, { view: 'back', x: 250, y: 420 }], hitAt);
}
