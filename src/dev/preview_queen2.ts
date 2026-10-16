// Dev page: FLOOR 7'S BOSS, THE CARRION QUEEN MADE NEW (art/carrion_queen2.ts, behind QUEEN2_ON, off), for the owner
// to look at. Nothing of the game imports it.
//   node tools/preview.mjs src/dev/preview_queen2.ts shots/q2_look.png 1014 1100 look
//   node tools/page_gif.mjs src/dev/preview_queen2.ts "standfilm" shots/q2_stand.gif 6
//   node tools/page_gif.mjs src/dev/preview_queen2.ts "film:attack" shots/q2_rake.gif 6   (walk, attack, gust, dive, call, reel, dying)

import { Q2_CANVAS, Q2_IDLE, Q2_SCALE, Q2_STAND, queen2Frame } from '../art/carrion_queen2';
import { Q2_DIE, Q2_WALK, queen2Long, queen2MovePainted } from '../art/carrion_queen2_moves';
import { toSprite } from '../art/kit';
import { queenStanding } from '../art/carrion_queen';
import { spriteOf3 } from '../art/heroes3';
import { MOVES3 } from '../art/moves3';
import { P } from '../art/palette';
import { unfinishedStanding } from '../art/unfinished';
import { drawText } from '../engine/font';
import type { Sprite } from '../engine/px';
import { THEME } from '../ui/ui';
import { PW, drawAt } from './act1_stage';

const HASH = decodeURIComponent(location.hash.slice(1)) || 'look';

function label(g: CanvasRenderingContext2D, text: string, x: number, y: number): void {
  g.save();
  g.scale(2, 2);
  drawText(g, text, Math.round(x / 2), Math.round(y / 2), THEME.text, { shadow: P.ink });
  g.restore();
}
/** The Ledge Road's rock as a floor, plain. */
function rock(g: CanvasRenderingContext2D, w: number, h: number): void {
  g.fillStyle = '#766d7c';
  g.fillRect(0, 0, w, h);
  g.fillStyle = '#6c6372';
  for (let y = 0; y < h; y += 32) for (let x = (y / 32) % 2 ? 0 : 64; x < w; x += 128) g.fillRect(x, y, 64, 32);
}
function shadow(g: CanvasRenderingContext2D, x: number, y: number, rx: number): void {
  g.fillStyle = 'rgba(25, 18, 40, 0.3)';
  g.beginPath();
  g.ellipse(x, y, rx, rx * 0.4, 0, 0, Math.PI * 2);
  g.fill();
}
function big(g: CanvasRenderingContext2D, sp: Sprite, x: number, y: number, k: number): void {
  g.drawImage(sp.img, Math.round(x - sp.ax * k), Math.round(y - sp.ay * k), sp.w * k, sp.h * k);
}
function done(cvs: HTMLCanvasElement): void {
  document.body.style.margin = '0';
  document.body.style.background = '#0d1030';
  document.body.appendChild(cvs);
  (window as unknown as { __ready: boolean }).__ready = true;
}

function look(): void {
  const H = 1100;
  const cvs = document.createElement('canvas');
  cvs.width = PW;
  cvs.height = H;
  const g = cvs.getContext('2d') as CanvasRenderingContext2D;
  g.imageSmoothingEnabled = false;
  rock(g, PW, H);
  const FOOT = 1060;
  const put = (sp: Sprite, x: number, rx: number, name: string): void => {
    shadow(g, x, FOOT, rx);
    drawAt(g, sp, x, FOOT);
    label(g, name, x - name.length * 5, FOOT + 14);
  };
  put(spriteOf3(MOVES3.rear, 0, 'front'), 36, 14, 'knight');
  put(unfinishedStanding(0.4, 'front'), 140, 50, 'the Unfinished');
  put(queen2Frame('stand', 0.1, 'front'), 440, 70, 'the Queen');
  put(toSprite(queen2MovePainted('call', 0.8, 'front'), null, Q2_CANVAS.ax, Q2_CANVAS.ay), 815, 70, 'her call');
  label(g, 'The Carrion Queen, made new (the row below at the game\'s size)', 8, 6);
  label(g, 'as she was', 8, 40);
  // (as she was, small, for the eye to compare)
  const old = queenStanding(0.4, 'front');
  g.drawImage(old.img, 10, 60, old.w, old.h);
  big(g, queen2Frame('stand', 0.1, 'front'), 300, 700, 2.9);
  big(g, queen2Frame('stand', 0.1, 'back'), 760, 700, 2.9);
  label(g, 'from in front, close', 200, 716);
  label(g, 'from behind, close', 690, 716);
  done(cvs);
}

/** HER STAND, moving, at the game's size, from in front and behind (hash `standfilm`). */
function standFilm(): void {
  const fps = Q2_IDLE.fps;
  const n = Math.round(Q2_STAND * fps);
  const W = PW;
  const H = 620;
  const cvs = document.createElement('canvas');
  cvs.width = W;
  cvs.height = H;
  const g = cvs.getContext('2d') as CanvasRenderingContext2D;
  g.imageSmoothingEnabled = false;
  const draw = (i: number): void => {
    const t = i / fps;
    rock(g, W, H);
    for (const [x, view] of [[300, 'front'], [740, 'back']] as [number, 'front' | 'back'][]) {
      shadow(g, x, 580, 90);
      big(g, queen2Frame('stand', t, view), x, 580, 2);
    }
    label(g, 'The Carrion Queen, standing', 8, 6);
    label(g, `${t.toFixed(2)} s`, 8, H - 28);
  };
  draw(0);
  done(cvs);
  const win = window as unknown as { __frames: number; __tickMs: number; __frame: (i: number) => string };
  win.__frames = n;
  win.__tickMs = 1000 / fps;
  win.__frame = (i: number): string => {
    draw(i);
    return cvs.toDataURL('image/png');
  };
}

/** Where her eyrie's edge is behind her, in the world's lengths (her own, as built, times her scale). */
const EDGE = -60 * Q2_SCALE;
/**
 * THE EDGE AND THE DROP for her death (a stand-in for the eyrie's, which the game lays): past the edge behind her,
 * nothing but the dark of the drop; `near`: the rock on this side of the edge only, laid again over her.
 */
function drop(g: CanvasRenderingContext2D, x: number, foot: number, view: 'front' | 'back', W: number, H: number, near: boolean): void {
  // (a point of the floor on the page: from in front, forward is right and down, her left right and up; from behind, forward right and up, her left right and down)
  const at = (wx: number, wy: number): [number, number] => (view === 'front' ? [x + 0.82 * wx + 0.82 * wy, foot + 0.41 * wx - 0.41 * wy] : [x + 0.82 * wx + 0.82 * wy, foot - 0.41 * wx + 0.41 * wy]);
  const a = at(EDGE, -2000);
  const b = at(EDGE, 2000);
  g.save();
  // (each view in its own half of the page)
  const half = view === 'front' ? 0 : W / 2;
  g.beginPath();
  g.rect(half, 0, W / 2, H);
  g.clip();
  g.beginPath();
  g.moveTo(a[0], a[1]);
  g.lineTo(b[0], b[1]);
  // (the drop is on the far side of the edge: up and left from in front, down and left from behind)
  const far: [number, number][] = view === 'front' ? [[W + 4000, -4000], [-4000, -4000], [-4000, H + 4000]] : [[W + 4000, H + 4000], [-4000, H + 4000], [-4000, -4000]];
  const nearSide: [number, number][] = view === 'front' ? [[W + 4000, H + 4000], [-4000, H + 4000]] : [[W + 4000, -4000], [-4000, -4000]];
  for (const [px, py] of near ? nearSide : far) g.lineTo(px, py);
  g.closePath();
  g.clip();
  if (near) rock(g, W, H);
  else {
    g.fillStyle = '#1c1630';
    g.fillRect(0, 0, W, H);
    g.fillStyle = '#272040';
    for (let i = 0; i < 40; i++) g.fillRect((i * 97) % W, (i * 53) % H, 2, 2);
  }
  g.restore();
  // (the edge itself: a lip of pale rock)
  g.save();
  g.beginPath();
  g.rect(half, 0, W / 2, H);
  g.clip();
  g.strokeStyle = '#8a8090';
  g.lineWidth = 2;
  g.beginPath();
  g.moveTo(a[0], a[1]);
  g.lineTo(b[0], b[1]);
  g.stroke();
  g.restore();
}

/** A MOVE OF HERS, moving, at the game's size, from in front and behind (hash `film:<move>`: walk, attack, ...). */
const NAMES: Record<string, string> = { walk: 'her hop', attack: 'her talon rake', gust: 'her wing gust', dive: 'her dive', call: 'her call', reel: 'struck', dying: 'her death: off the edge' };
function moveFilm(move: string): void {
  const fps = move === 'walk' ? Q2_WALK.fps : 30;
  const long = queen2Long(move);
  const n = Math.round(long * fps) + (move === 'walk' ? 0 : 1);
  const W = PW;
  const H = move === 'dive' ? 900 : 640;
  const FOOT = move === 'dive' ? 780 : 560;
  const cvs = document.createElement('canvas');
  cvs.width = W;
  cvs.height = H;
  const g = cvs.getContext('2d') as CanvasRenderingContext2D;
  g.imageSmoothingEnabled = false;
  const draw = (i: number): void => {
    const t = i / fps;
    rock(g, W, H);
    for (const [x, view] of [[300, 'front'], [740, 'back']] as [number, 'front' | 'back'][]) {
      // (her death: the eyrie's edge behind her, the drop past it; she topples into it)
      if (move === 'dying') drop(g, x, FOOT, view, W, H, false);
      shadow(g, x, FOOT, 90);
      const sp = toSprite(queen2MovePainted(move, t, view), null, Q2_CANVAS.ax, Q2_CANVAS.ay);
      big(g, sp, x, FOOT, 2);
      // (from in front the edge's near rock hides what of her has gone down past it)
      if (move === 'dying' && view === 'front' && t >= Q2_DIE.over) drop(g, x, FOOT, view, W, H, true);
    }
    label(g, `The Carrion Queen: ${NAMES[move] ?? move}`, 8, 6);
    label(g, `${t.toFixed(2)} s`, 8, H - 28);
  };
  draw(0);
  done(cvs);
  const win = window as unknown as { __frames: number; __tickMs: number; __frame: (i: number) => string };
  win.__frames = n;
  win.__tickMs = 1000 / fps;
  win.__frame = (i: number): string => {
    draw(i);
    return cvs.toDataURL('image/png');
  };
}

if (HASH === 'look') look();
else if (HASH === 'standfilm') standFilm();
else if (HASH.startsWith('film:')) moveFilm(HASH.slice(5));
