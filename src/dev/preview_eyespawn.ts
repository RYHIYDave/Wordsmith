// THE EYESPAWN, floor 10's medium mob, as mock-ups for the owner (art/eyespawn.ts, behind SPAWN_ON, off).
// Hashes: `look` (it standing beside the knight, the Drowned and one of the Eye's eggs it hatches from, at the game's
// size, and close up); `standfilm` (its stand, moving, three times the game's size); `seq:hatch` (his egg landing and
// hatching, it hauling itself across) and `seq:attack` (its lash, its gaze beam, struck, its death), twice the game's
// size, from in front and behind.

import { ES_DIE, ES_GAZE, ES_HATCH, ES_IDLE, ES_LASH, ES_PACE, ES_REEL, ES_STAND, ES_WALK, eyespawnFrame } from '../art/eyespawn';
import { EYE_SPAWN } from '../art/drowned_eye';
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


/** A sprite at `k` times, turned to face the other way. */
function drawFlip(g: CanvasRenderingContext2D, sp: Sprite, x: number, y: number, k: number): void {
  g.save();
  g.translate(Math.round(x), 0);
  g.scale(-1, 1);
  g.drawImage(sp.img, Math.round(-sp.ax * 2 * k), Math.round(y - sp.ay * 2 * k), sp.w * 2 * k, sp.h * 2 * k);
  g.restore();
}
/**
 * ITS MOVES AS THE GAME WOULD PLAY THEM, one after another (hash `seq:<name>`), twice the game's size, from in front
 * (left) and behind (right): `hatch`, one of his eggs landing, rocking, bursting, and it hatching out of it, standing,
 * hauling itself across at its pace, standing; `attack`, its lash, its gaze beam, struck, its death and what is left.
 * From behind, the knight stands before it where its lash reaches, facing it; from in front he would hide it.
 */
function seqFilm(): void {
  const which = HASH.split(':')[1];
  const parts: [string, number][] = which === 'hatch'
    ? [['egg', EYE_SPAWN.hatch], ['hatch', ES_HATCH.long], ['stand', 0.4], ['walk', ES_WALK.frames / ES_WALK.fps * 2], ['stand', 0.6]]
    : [['stand', 0.4], ['attack', ES_LASH.long], ['stand', 0.3], ['gaze', ES_GAZE.long], ['stand', 0.3], ['reel', ES_REEL], ['stand', 0.4], ['dying', ES_DIE.long], ['dead', 0.6]];
  const fps = 15;
  const list: [string, number, number][] = [];
  let T = 0;
  for (const [mv, long] of parts) {
    const n = Math.round(long * fps);
    for (let i = 0; i < n; i++) list.push([mv, i / fps, T + i / fps]);
    T += long;
  }
  const W = PW;
  const H = 560;
  const k = 2;
  const cvs = document.createElement('canvas');
  cvs.width = W;
  cvs.height = H;
  const g = cvs.getContext('2d') as CanvasRenderingContext2D;
  g.imageSmoothingEnabled = false;
  const walkStart = parts.slice(0, parts.findIndex((p) => p[0] === 'walk')).reduce((a, p) => a + p[1], 0);
  const walkLong = which === 'hatch' ? (ES_WALK.frames / ES_WALK.fps) * 2 : 0;
  const P3 = 0.8165 * k;
  const draw = (i: number): void => {
    const [mv, t, at] = list[Math.min(i, list.length - 1)];
    paving(g, 0, 0, W, H);
    for (const [x0, y0, view] of [[which === 'hatch' ? 170 : 230, which === 'hatch' ? 360 : 400, 'front'], [which === 'hatch' ? 620 : 700, 470, 'back']] as [number, number, 'front' | 'back'][]) {
      const dn = view === 'front' ? 0.5 : -0.5;
      const went = which === 'hatch' ? Math.max(0, Math.min(at, walkStart + walkLong) - walkStart) * ES_PACE * 39.19 : 0;
      const x = x0 + went * P3;
      const y = y0 + went * P3 * dn;
      if (which === 'attack' && view === 'back') {
        const kx = x0 + 50 * P3;
        const ky = y0 - 50 * P3 * 0.5;
        shadow(g, kx, ky, 28);
        drawFlip(g, spriteOf3(MOVES3.rear, 0, 'front'), kx, ky, k);
      }
      if (mv === 'egg') {
        drawBig(g, spawnFrame(t + 0, view, 1), x, y, k);
        continue;
      }
      if (mv !== 'dying' && mv !== 'dead') shadow(g, x, y, 52);
      const sp = mv === 'dead' ? eyespawnFrame('dying', ES_DIE.long, view) : eyespawnFrame(mv, t, view);
      drawBig(g, sp, x, y, k);
      // (the burst egg's shell under it as it hatches)
      if (mv === 'hatch' && t < 0.45) drawBig(g, spawnFrame(EYE_SPAWN.hatch + t, view, 1), x, y, k);
    }
    const say: Record<string, string> = {
      egg: t < EYE_SPAWN.hatch - 0.5 ? 'his egg lands, rocking' : 'it shakes and bulges (the warning)',
      hatch: t < 0.75 ? 'it hatches, unfurling' : 'its eye snaps open',
      walk: 'it hauls itself along',
      attack: t < ES_LASH.warn[1] ? 'its lash: coiled back (the warning)' : t < ES_LASH.hit + 0.1 ? 'IT LASHES' : '',
      gaze: t < ES_GAZE.beam[0] ? 'its gaze: its eye narrows, the line flickers (the warning)' : t < ES_GAZE.beam[1] ? 'ITS BEAM BURNS' : '',
      reel: 'struck',
      dying: t < ES_DIE.burst ? 'it swells' : 'its eye bursts',
      dead: '',
      stand: '',
    };
    label(g, 'The Eyespawn (twice the game\'s size)', 8, 6);
    if (say[mv]) label(g, say[mv], W - say[mv].length * 12 - 16, 34);
    label(g, `${at.toFixed(2)} s`, 8, H - 28);
  };
  draw(0);
  done(cvs);
  const win = window as unknown as { __frames: number; __tickMs: number; __frame: (i: number) => string };
  win.__frames = list.length;
  win.__tickMs = 1000 / fps;
  win.__frame = (i: number): string => {
    draw(i);
    return cvs.toDataURL('image/png');
  };
}

if (HASH.startsWith('look')) look();
else if (HASH.startsWith('seq:')) seqFilm();
else if (HASH === 'standfilm') standFilm();
