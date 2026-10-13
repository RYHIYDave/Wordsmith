// Dev page: THE CULT'S TWO NEW KINDS FOR FLOORS 6 TO 10 (art/act1_cultists.ts), the Chanter and the Firepot
// thrower, for the owner to look at before anything of them moves. Nothing of the game imports it.
//
//   node tools/preview.mjs src/dev/preview_act1_cult.ts shots/act1_cult_look.png 1014 640 look[:t]
//     both standing, from in front and from behind, beside the knight and the dagger cultist at the game's
//     size; close-ups of both, three times the game's size
//   node tools/preview.mjs src/dev/preview_act1_cult.ts shots/strip.png <w> <h> film:<who>:<move>:<fps>:<secs>:<view>
//     a move as a strip of frames, three to a row, cells 300 x 260 at twice the game's size (tools/film_strip.py)

import { CHANTER, FIREPOT_THROWER } from '../art/act1_cultists';
import { DAGGER_CULTIST } from '../art/cultists';
import { spriteOf3 } from '../art/heroes3';
import { MOVES3 } from '../art/moves3';
import { canvasOf, deathOfMob, paintMob } from '../art/new_mobs3';
import type { Mob } from '../art/new_mobs3';
import { toSprite } from '../art/kit';
import { P } from '../art/palette';
import { ENEMY_RIM } from '../art/mkit';
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
function bed(g: CanvasRenderingContext2D, ox: number, oy: number, w: number, h: number, tile = 32): void {
  g.fillStyle = '#b8b0a8';
  g.fillRect(ox, oy, w, h);
  g.fillStyle = '#a69e98';
  for (let y = 0; y < h; y += tile) for (let x = (y / tile) % 2 ? 0 : tile * 2; x < w; x += tile * 4) g.fillRect(ox + x, oy + y, Math.min(tile * 2, w - x), Math.min(tile, h - y));
}
function shadow(g: CanvasRenderingContext2D, x: number, y: number, rx: number): void {
  g.fillStyle = 'rgba(25, 18, 40, 0.3)';
  g.beginPath();
  g.ellipse(x, y, rx, rx * 0.4, 0, 0, Math.PI * 2);
  g.fill();
}
function drawBig(g: CanvasRenderingContext2D, sp: Sprite, x: number, y: number, k: number): void {
  g.drawImage(sp.img, Math.round(x - sp.ax * 2 * k), Math.round(y - sp.ay * 2 * k), sp.w * 2 * k, sp.h * 2 * k);
}
function done(cvs: HTMLCanvasElement): void {
  document.body.style.margin = '0';
  document.body.style.background = '#0d1030';
  document.body.appendChild(cvs);
  (window as unknown as { __ready: boolean }).__ready = true;
}
function frameOf(mob: Mob, move: string, t: number, view: 'front' | 'back'): Sprite {
  const can = canvasOf(mob);
  if (move === 'dying') return toSprite(deathOfMob(mob, Math.min(1, t / mob.dieTime), view), null, can.ax, can.ay);
  return toSprite(paintMob(mob, move, t, view, ENEMY_RIM), null, can.ax, can.ay);
}
const WHO: Record<string, Mob> = { chanter: CHANTER, pots: FIREPOT_THROWER };

function look(): void {
  const T = Number(HASH.split(':')[1] ?? 0.3);
  const H = 640;
  const cvs = document.createElement('canvas');
  cvs.width = PW;
  cvs.height = H;
  const g = cvs.getContext('2d') as CanvasRenderingContext2D;
  g.imageSmoothingEnabled = false;
  bed(g, 0, 0, PW, H);
  const FOOT = 230;
  const put = (sp: Sprite, x: number, rx: number, name: string): void => {
    shadow(g, x, FOOT, rx);
    drawAt(g, sp, x, FOOT);
    label(g, name, x - name.length * 5, FOOT + 20);
  };
  label(g, 'The cult\'s two new kinds, standing (this row at the game\'s size)', 8, 6);
  put(spriteOf3(MOVES3.rear, 0, 'front'), 60, 14, 'knight');
  put(frameOf(DAGGER_CULTIST, 'stand', T, 'front'), 170, 14, 'dagger');
  put(frameOf(CHANTER, 'stand', T, 'front'), 300, 16, 'chanter');
  put(frameOf(CHANTER, 'stand', T, 'back'), 420, 16, 'behind');
  put(frameOf(FIREPOT_THROWER, 'stand', T, 'front'), 600, 18, 'firepot');
  put(frameOf(FIREPOT_THROWER, 'stand', T, 'back'), 740, 18, 'behind');
  label(g, 'three times the game\'s size', 8, 280);
  const BIG = 600;
  drawBig(g, frameOf(CHANTER, 'stand', T, 'front'), 130, BIG, 3);
  drawBig(g, frameOf(CHANTER, 'stand', T, 'back'), 360, BIG, 3);
  drawBig(g, frameOf(FIREPOT_THROWER, 'stand', T, 'front'), 640, BIG, 3);
  drawBig(g, frameOf(FIREPOT_THROWER, 'stand', T, 'back'), 880, BIG, 3);
  done(cvs);
}

/** A MOVE AS A STRIP OF FRAMES (hash `film:<who>:<move>:<fps>:<secs>:<view>`), three to a row. */
function film(): void {
  const [, who, move, fpsS, longS, viewS] = HASH.split(':');
  const mob = WHO[who];
  const fps = Number(fpsS);
  const n = Math.round(Number(longS) * fps) + 1;
  const view = (viewS || 'front') as 'front' | 'back';
  const W = 300;
  const Hc = 260;
  const cols = 3;
  const cvs = document.createElement('canvas');
  cvs.width = W * cols;
  cvs.height = Hc * Math.ceil(n / cols);
  const g = cvs.getContext('2d') as CanvasRenderingContext2D;
  g.imageSmoothingEnabled = false;
  for (let i = 0; i < n; i++) {
    const ox = (i % cols) * W;
    const oy = Math.floor(i / cols) * Hc;
    bed(g, ox, oy, W, Hc, 32);
    g.save();
    g.beginPath();
    g.rect(ox, oy, W, Hc);
    g.clip();
    shadow(g, ox + 140, oy + 200, 34);
    drawBig(g, frameOf(mob, move, i / fps, view), ox + 140, oy + 200, 2);
    g.restore();
  }
  done(cvs);
}

if (HASH.startsWith('film')) film();
else look();
