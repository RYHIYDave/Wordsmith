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

/** ITS STAND, moving, at twice the game's size, from in front and behind (hash `standfilm`). */
function standFilm(): void {
  const fps = 10;
  const n = Math.round(DROWNED.idleFrames);
  const W = PW;
  const H = 440;
  const cvs = document.createElement('canvas');
  cvs.width = W;
  cvs.height = H;
  const g = cvs.getContext('2d') as CanvasRenderingContext2D;
  g.imageSmoothingEnabled = false;
  const draw = (i: number): void => {
    const t = i / fps;
    bed(g, 0, 0, W, H);
    for (const [x, view, k] of [[260, 'front', 0], [560, 'back', 0], [820, 'front', 1.3]] as [number, 'front' | 'back', number][]) {
      shadow(g, x, 400, 50);
      drawBig(g, frameOf(DROWNED, 'stand', t + k, view), x, 400, 3);
    }
    label(g, 'The Drowned, standing (three times the game\'s size)', 8, 6);
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

/** The fen's water, as a floor to rise out of: dark, a few pale streaks on it. */
function water(g: CanvasRenderingContext2D, w: number, h: number): void {
  g.fillStyle = '#16211b';
  g.fillRect(0, 0, w, h);
  g.fillStyle = '#22322a';
  for (let i = 0; i < 90; i++) {
    const x = (i * 137) % w;
    const y = (i * 71) % h;
    g.fillRect(x, y, 10 + (i % 4) * 6, 2);
  }
}
/**
 * ITS MOVES AS THE GAME WOULD PLAY THEM, one after another (hash `seq:<name>`), three times the game's size: `rise`,
 * rising out of the water, then shambling 2.5 s (carried across at its pace), and standing; `grab`, its grab twice,
 * struck, and its death, lying a while after.
 */
function seqFilm(): void {
  const which = HASH.split(':')[1];
  const parts: [string, number][] = which === 'rise' ? [['rise', 1.9], ['stand', 0.4], ['walk', 2.5], ['stand', 0.6]] : [['stand', 0.4], ['attack', DROWNED.attack.motion.keys[DROWNED.attack.motion.keys.length - 1].at], ['stand', 0.3], ['reel', DROWNED.reelTime], ['stand', 0.4], ['dying', DROWNED.dieTime], ['dead', 0.6]];
  const fps = 15;
  const list: [string, number, number][] = [];
  let T = 0;
  for (const [mv, long] of parts) {
    const n = Math.round(long * fps);
    for (let i = 0; i < n; i++) list.push([mv, i / fps, T + i / fps]);
    T += long;
  }
  const W = PW;
  const H = 460;
  const k = 3;
  const cvs = document.createElement('canvas');
  cvs.width = W;
  cvs.height = H;
  const g = cvs.getContext('2d') as CanvasRenderingContext2D;
  g.imageSmoothingEnabled = false;
  const walkStart = parts.slice(0, parts.findIndex((p) => p[0] === 'walk')).reduce((a, p) => a + p[1], 0);
  const draw = (i: number): void => {
    const [mv, t, at] = list[Math.min(i, list.length - 1)];
    if (which === 'rise') water(g, W, H);
    else bed(g, 0, 0, W, H);
    // (walking, it is carried across at its pace: 32 picture pixels a tile, at three times)
    const walked = which === 'rise' ? Math.max(0, Math.min(at, walkStart + 2.5) - walkStart) * DROWNED.pace * 32 * k * 0.5 : 0;
    const x = 300 + (which === 'rise' && at >= walkStart ? walked : 0);
    const y = 400 + (which === 'rise' && at >= walkStart ? walked * 0.5 : 0) - (which === 'rise' ? 60 : 0);
    if (mv !== 'rise' || t > 0.6) shadow(g, x, y, 50);
    const sp = mv === 'dead' ? frameOf(DROWNED, 'dying', DROWNED.dieTime, 'front') : frameOf(DROWNED, mv, t, 'front');
    drawBig(g, sp, x, y, k);
    // (beside it, from behind, the same moment, where the walk is not)
    if (which !== 'rise') {
      shadow(g, 760, 400, 50);
      drawBig(g, mv === 'dead' ? frameOf(DROWNED, 'dying', DROWNED.dieTime, 'back') : frameOf(DROWNED, mv, t, 'back'), 760, 400, k);
    }
    const say: Record<string, string> = { rise: 'it rises out of the water', walk: 'it shambles', attack: t < 0.45 ? 'the grab: arms up, eyes flaring (the warning)' : t < 0.8 ? 'IT GRABS' : 'and drags you down', reel: 'struck', dying: 'it collapses into water and weed', dead: '', stand: '' };
    label(g, 'The Drowned (three times the game\'s size)', 8, 6);
    if (say[mv]) label(g, say[mv], W - say[mv].length * 12 - 16, 6);
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
