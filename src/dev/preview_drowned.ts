// Dev page: THE DROWNED, floor 10's small mob (art/drowned.ts), for the owner to look at before anything of it
// moves. Nothing of the game imports it.
//
//   node tools/preview.mjs src/dev/preview_drowned.ts shots/drowned_look.png 1014 640 look[:t]
//     standing, from in front and from behind, beside the knight and the cult's dagger cultist and chanter at the
//     game's size; close-ups, three times the game's size

import { DROWNED } from '../art/drowned';
import { CHANTER } from '../art/act1_cultists';
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
  label(g, 'The Drowned, standing (this row at the game\'s size)', 8, 6);
  put(spriteOf3(MOVES3.rear, 0, 'front'), 70, 14, 'knight');
  put(frameOf(DAGGER_CULTIST, 'stand', T, 'front'), 200, 14, 'cultist');
  put(frameOf(CHANTER, 'stand', T, 'front'), 330, 16, 'chanter');
  put(frameOf(DROWNED, 'stand', T, 'front'), 520, 18, 'drowned');
  put(frameOf(DROWNED, 'stand', T, 'back'), 680, 18, 'behind');
  put(frameOf(DROWNED, 'stand', T + 1.7, 'front'), 850, 18, 'its head jerks');
  label(g, 'three times the game\'s size', 8, 280);
  const BIG = 590;
  drawBig(g, frameOf(DROWNED, 'stand', T, 'front'), 250, BIG, 3);
  drawBig(g, frameOf(DROWNED, 'stand', T, 'back'), 720, BIG, 3);
  done(cvs);
}

if (HASH.startsWith('look')) look();
