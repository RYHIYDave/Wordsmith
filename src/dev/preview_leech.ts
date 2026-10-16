// THE BOG LEECHES, floor 10's tiny mob, as mock-ups for the owner (art/bog_leech.ts, behind LEECH_ON, off).
// Hashes: `look` (them standing beside the knight, the Drowned and a rubbling, at the game's size, a pack of them,
// and close up); `standfilm` (their stand, moving, three times the game's size).

import { BL_IDLE, BL_STAND, leechFrame } from '../art/bog_leech';
import { DROWNED } from '../art/drowned';
import { rubblingFrame } from '../art/floor6_mobs';
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
/** The fen's mud, as a floor: dark peat, a few puddles. */
function mud(g: CanvasRenderingContext2D, ox: number, oy: number, w: number, h: number): void {
  g.fillStyle = '#2b2a22';
  g.fillRect(ox, oy, w, h);
  g.fillStyle = '#34332a';
  for (let y = 0; y < h; y += 32) for (let x = (y / 32) % 2 ? 0 : 64; x < w; x += 128) g.fillRect(ox + x, oy + y, Math.min(64, w - x), Math.min(32, h - y));
  g.fillStyle = '#1d2a28';
  for (let i = 0; i < 9; i++) {
    const x = ((i * 337) % w) + ox;
    const y = ((i * 211) % h) + oy;
    g.beginPath();
    g.ellipse(x, y, 30 + (i % 3) * 12, 9 + (i % 2) * 4, 0, 0, Math.PI * 2);
    g.fill();
  }
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
  const H = 700;
  const cvs = document.createElement('canvas');
  cvs.width = PW;
  cvs.height = H;
  const g = cvs.getContext('2d') as CanvasRenderingContext2D;
  g.imageSmoothingEnabled = false;
  mud(g, 0, 0, PW, H);
  const FOOT = 210;
  const put = (sp: Sprite, x: number, rx: number, name: string, y = FOOT): void => {
    shadow(g, x, y, rx);
    drawAt(g, sp, x, y);
    if (name) label(g, name, x - name.length * 5, y + 18);
  };
  label(g, 'The Bog Leeches (this row at the game\'s size)', 8, 6);
  put(spriteOf3(MOVES3.rear, 0, 'front'), 60, 14, 'knight');
  put(drowned(0.3), 170, 18, 'drowned');
  put(rubblingFrame('stand', 0.2, 'front'), 280, 12, 'rubbling');
  put(leechFrame('stand', 0.2, 'front'), 400, 14, 'leech');
  put(leechFrame('stand', 0.6, 'back'), 520, 14, 'behind');
  put(leechFrame('stand', 1.12, 'front'), 640, 14, 'its mouth');
  // (a pack of seven, as they come)
  label(g, 'a pack', 820, 6);
  const pack: [number, number, number, 'front' | 'back'][] = [[760, 120, 0.1, 'front'], [850, 100, 0.7, 'front'], [930, 140, 1.2, 'back'], [800, 175, 0.4, 'front'], [890, 200, 1.0, 'front'], [960, 230, 0.25, 'back'], [770, 240, 1.45, 'front']];
  for (const [x, y, t, v] of pack) put(leechFrame('stand', t, v), x, 12, '', y);
  label(g, 'three times the game\'s size', 8, 290);
  const BIG = 640;
  drawBig(g, leechFrame('stand', 0.2, 'front'), 200, BIG, 3);
  drawBig(g, leechFrame('stand', 0.6, 'back'), 530, BIG, 3);
  drawBig(g, leechFrame('stand', 1.12, 'front'), 840, BIG, 3);
  label(g, 'its mouth of teeth', 760, BIG + 20);
  done(cvs);
}

/** ITS STAND, moving, three times the game's size, from in front and behind (hash `standfilm`). */
function standFilm(): void {
  const fps = BL_IDLE.fps;
  const n = Math.round(BL_STAND * fps);
  const W = PW;
  const H = 360;
  const cvs = document.createElement('canvas');
  cvs.width = W;
  cvs.height = H;
  const g = cvs.getContext('2d') as CanvasRenderingContext2D;
  g.imageSmoothingEnabled = false;
  const draw = (i: number): void => {
    const t = i / fps;
    mud(g, 0, 0, W, H);
    for (const [x, view, k] of [[230, 'front', 0], [520, 'back', 0], [800, 'front', 0.8]] as [number, 'front' | 'back', number][]) {
      shadow(g, x, 300, 46);
      drawBig(g, leechFrame('stand', t + k, view), x, 300, 3);
    }
    label(g, 'A bog leech, standing (three times the game\'s size)', 8, 6);
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
