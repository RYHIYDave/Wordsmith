// Dev page: THE CULT'S TWO NEW KINDS FOR FLOORS 6 TO 10 (art/act1_cultists.ts), the Chanter and the Firepot
// thrower, for the owner to look at before anything of them moves. Nothing of the game imports it.
//
//   node tools/preview.mjs src/dev/preview_act1_cult.ts shots/act1_cult_look.png 1014 640 look[:t]
//     both standing, from in front and from behind, beside the knight and the dagger cultist at the game's
//     size; close-ups of both, three times the game's size
//   node tools/preview.mjs src/dev/preview_act1_cult.ts shots/strip.png <w> <h> film:<who>:<move>:<fps>:<secs>:<view>
//     a move as a strip of frames, three to a row, cells 300 x 260 at twice the game's size (tools/film_strip.py)

import { BOLT_FRAMES, CHANTER, CH_BOLT, CH_DIES, FIREPOT_BURST_FRAMES, FIREPOT_FRAMES, FIREPOT_THROWER, POTS_DIES, POTS_LOB, chanterBookAt, chantWard, curseBolt, firepotFire, firepotFlying, potsPotAt } from '../art/act1_cultists';
import { TILE3 } from '../art/new_mobs3';
import { project } from '../art/skeleton';
import type { V3 } from '../art/skeleton';
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

/**
 * ITS ATTACK AS THE GAME WOULD PLAY IT, with what it sends (hash `shotfilm:<who>:<fps>`): the Chanter's bolt
 * from its book, flying 4 tiles in 0.4 s; the Firepot thrower's pot lobbed 3.5 tiles in an arc over 0.7 s, its
 * shadow under it, bursting into the cult's fire where it comes down and burning on. Cells of 640 x 400, two to
 * a row. (How far and how fast are the game's.)
 */
function shotFilm(): void {
  const [, who, fpsS] = HASH.split(':');
  const fps = Number(fpsS);
  const chanter = who === 'chanter';
  const mob = WHO[who];
  const H = chanter ? CH_BOLT.hit : POTS_LOB.hit;
  const FLY = chanter ? 0.4 : 0.7;
  const long = (chanter ? CH_BOLT.long : POTS_LOB.long) + 0.6;
  const n = Math.round(long * fps) + 1;
  const W = 640;
  const Hc = 400;
  const k = 2;
  const FX = 140;
  const FY = 230;
  const cols = 2;
  const cvs = document.createElement('canvas');
  cvs.width = W * cols;
  cvs.height = Hc * Math.ceil(n / cols);
  const g = cvs.getContext('2d') as CanvasRenderingContext2D;
  g.imageSmoothingEnabled = false;
  const from: V3 = chanter ? chanterBookAt() : potsPotAt();
  const to: V3 = chanter ? [4 * TILE3, 0.6 * TILE3, from[2]] : [3.2 * TILE3, 0.3 * TILE3, 0];
  const scr = (p: V3): [number, number] => {
    const [x, y] = project(p, 'front');
    return [x * k, y * k];
  };
  for (let i = 0; i < n; i++) {
    const t = i / fps;
    const ox = (i % cols) * W;
    const oy = Math.floor(i / cols) * Hc;
    bed(g, ox, oy, W, Hc, 32);
    g.save();
    g.beginPath();
    g.rect(ox, oy, W, Hc);
    g.clip();
    shadow(g, ox + FX, oy + FY, 36);
    const long0 = chanter ? CH_BOLT.long : POTS_LOB.long;
    drawBig(g, frameOf(mob, t < long0 ? 'attack' : 'stand', t < long0 ? t : t - long0, 'front'), ox + FX, oy + FY, k);
    if (t >= H) {
      const u = (t - H) / FLY;
      if (u < 1) {
        const p: V3 = [from[0] + (to[0] - from[0]) * u, from[1] + (to[1] - from[1]) * u, chanter ? from[2] : from[2] + (POT_Z - from[2]) * u + 34 * Math.sin(Math.PI * u)];
        const [sx, sy] = scr([p[0], p[1], 0]);
        shadow(g, ox + FX + sx, oy + FY + sy, chanter ? 6 : 8);
        const [cx, cy] = scr(p);
        drawBig(g, chanter ? curseBolt(Math.floor(u * 8) % BOLT_FRAMES) : firepotFlying(u * 1.25), ox + FX + cx, oy + FY + cy, k);
      } else if (!chanter) {
        const f = Math.floor((t - H - FLY) * 10);
        const [cx, cy] = scr(to);
        drawBig(g, firepotFire(f < FIREPOT_BURST_FRAMES ? f : FIREPOT_BURST_FRAMES + ((f - FIREPOT_BURST_FRAMES) % 4)), ox + FX + cx, oy + FY + cy, k);
      }
    }
    g.restore();
  }
  done(cvs);
}
const POT_Z = 3;
void FIREPOT_FRAMES;
void chantWard;
void CH_DIES;
void POTS_DIES;

/** ITS WALK, A FLINCH AND ITS DEATH, as the game would play them (hash `seq:<who>:<fps>`): walking 2 s (the floor carried under it at its pace), standing, struck, standing, dying and lying there. Cells 300 x 260, three to a row. */
function seq(): void {
  const [, who, fpsS] = HASH.split(':');
  const mob = WHO[who];
  const fps = Number(fpsS);
  const parts: [string, number][] = [['walk', 2.0], ['stand', 0.6], ['reel', mob.reelTime], ['stand', 0.6], ['dying', mob.dieTime + 1.0]];
  const list: [string, number, number][] = [];
  let T = 0;
  for (const [mv, long] of parts) {
    for (let i = 0; i < Math.round(long * fps); i++) list.push([mv, i / fps, mv === 'walk' ? T + i / fps : -1]);
    if (mv === 'walk') T += long;
  }
  const W = 300;
  const Hc = 260;
  const k = 2;
  const cols = 3;
  const cvs = document.createElement('canvas');
  cvs.width = W * cols;
  cvs.height = Hc * Math.ceil(list.length / cols);
  const g = cvs.getContext('2d') as CanvasRenderingContext2D;
  g.imageSmoothingEnabled = false;
  list.forEach(([mv, t, walked], i) => {
    const ox = (i % cols) * W;
    const oy = Math.floor(i / cols) * Hc;
    const tile = 32;
    g.save();
    g.beginPath();
    g.rect(ox, oy, W, Hc);
    g.clip();
    // (the floor carried under it as it walks, at its pace: the camera following)
    const went = walked >= 0 ? walked : T;
    const [dx, dy] = project([mob.pace * TILE3 * went, 0, 0], 'front');
    g.translate(-(((dx * k) % (tile * 4)) + tile * 4) % (tile * 4), -(((dy * k) % (tile * 2)) + tile * 2) % (tile * 2));
    bed(g, ox, oy, W + tile * 4, Hc + tile * 2, tile);
    g.restore();
    g.save();
    g.beginPath();
    g.rect(ox, oy, W, Hc);
    g.clip();
    if (mv !== 'dying') shadow(g, ox + 130, oy + 190, 34);
    drawBig(g, frameOf(mob, mv, mv === 'dying' ? Math.min(t, mob.dieTime) : t, 'front'), ox + 130, oy + 190, k);
    g.restore();
  });
  done(cvs);
}

if (HASH.startsWith('seq')) seq();
else if (HASH.startsWith('shotfilm')) shotFilm();
else if (HASH.startsWith('film')) film();
else look();
