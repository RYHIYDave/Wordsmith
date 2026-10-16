// THE EYESPAWN, floor 10's medium mob, as mock-ups for the owner (art/eyespawn.ts, behind SPAWN_ON, off).
// Hashes: `look` (it standing beside the knight, the Drowned and one of the Eye's eggs it hatches from, at the game's
// size, and close up); `standfilm` (its stand, moving, three times the game's size).

import { ES_IDLE, ES_STAND, eyespawnFrame } from '../art/eyespawn';
import { DROWNED } from '../art/drowned';
import { spawnFrame } from '../art/drowned_eye';
import { spriteOf3 } from '../art/heroes3';
import { MOVES3 } from '../art/moves3';
import { canvasOf, paintMob } from '../art/new_mobs3';
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
/** The ruin's old paving by the Eye's pool: grey-violet flags, slime in the joints. */
function paving(g: CanvasRenderingContext2D, ox: number, oy: number, w: number, h: number): void {
  g.fillStyle = '#3a3846';
  g.fillRect(ox, oy, w, h);
  g.fillStyle = '#44424f';
  for (let y = 0; y < h; y += 32) for (let x = (y / 32) % 2 ? 0 : 64; x < w; x += 128) g.fillRect(ox + x, oy + y, Math.min(64, w - x), Math.min(32, h - y));
  g.fillStyle = '#2e3a26';
  for (let y = 0; y < h; y += 32) g.fillRect(ox, oy + y, w, 2);
}
function shadow(g: CanvasRenderingContext2D, x: number, y: number, rx: number): void {
  g.fillStyle = 'rgba(10, 8, 16, 0.35)';
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
function drowned(t: number): Sprite {
  const can = canvasOf(DROWNED);
  return toSprite(paintMob(DROWNED, 'stand', t, 'front', ENEMY_RIM), null, can.ax, can.ay);
}

function look(): void {
  const H = 900;
  const cvs = document.createElement('canvas');
  cvs.width = PW;
  cvs.height = H;
  const g = cvs.getContext('2d') as CanvasRenderingContext2D;
  g.imageSmoothingEnabled = false;
  paving(g, 0, 0, PW, H);
  const FOOT = 230;
  const put = (sp: Sprite, x: number, rx: number, name: string): void => {
    shadow(g, x, FOOT, rx);
    drawAt(g, sp, x, FOOT);
    if (name) label(g, name, x - name.length * 5, FOOT + 20);
  };
  label(g, 'The Eyespawn (this row at the game\'s size)', 8, 6);
  put(spriteOf3(MOVES3.rear, 0, 'front'), 60, 14, 'knight');
  put(drowned(0.3), 180, 18, 'drowned');
  put(spawnFrame(1.0, 'front', 1), 300, 0, 'its egg');
  put(eyespawnFrame('stand', 0.2, 'front'), 450, 26, 'eyespawn');
  put(eyespawnFrame('stand', 0.2, 'back'), 640, 26, 'behind');
  put(eyespawnFrame('stand', 0.95, 'front'), 840, 26, 'its eye darts');
  label(g, 'three times the game\'s size', 8, 300);
  const BIG = 790;
  drawBig(g, eyespawnFrame('stand', 0.2, 'front'), 260, BIG, 3);
  drawBig(g, eyespawnFrame('stand', 0.2, 'back'), 760, BIG, 3);
  done(cvs);
}

/** ITS STAND, moving, three times the game's size, from in front and behind (hash `standfilm`). */
function standFilm(): void {
  const fps = ES_IDLE.fps;
  const n = Math.round(ES_STAND * fps);
  const W = PW;
  const H = 520;
  const cvs = document.createElement('canvas');
  cvs.width = W;
  cvs.height = H;
  const g = cvs.getContext('2d') as CanvasRenderingContext2D;
  g.imageSmoothingEnabled = false;
  const draw = (i: number): void => {
    const t = i / fps;
    paving(g, 0, 0, W, H);
    for (const [x, view] of [[270, 'front'], [750, 'back']] as [number, 'front' | 'back'][]) {
      shadow(g, x, 470, 80);
      drawBig(g, eyespawnFrame('stand', t, view), x, 470, 3);
    }
    label(g, 'The Eyespawn, standing (three times the game\'s size)', 8, 6);
    label(g, `${t.toFixed(1)} s`, 8, H - 28);
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

if (HASH.startsWith('look')) look();
else if (HASH === 'standfilm') standFilm();
