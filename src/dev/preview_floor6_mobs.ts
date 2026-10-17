// Dev page: FLOOR 6'S MOBS (art/floor6_mobs.ts), the quarry golem and the rubbling, for the owner to look
// at before anything of them goes to the game. Nothing of the game imports it.
//
//   node tools/preview.mjs src/dev/preview_floor6_mobs.ts shots/f6m_look.png 1014 620 look
//     both standing, from in front and from behind, beside the knight, the Warden and the Unfinished's
//     knee at the game's size; close-ups of both, twice the game's size
//   node tools/preview.mjs src/dev/preview_floor6_mobs.ts shots/strip.png <w> <h> film:<who>:<move>:<fps>:<secs>:<view>
//     a move as a strip of frames, three to a row (who: golem or rubbling; cells 360 x 320 for the golem,
//     the rubbling drawn twice the game's size in cells of 280 x 220), cut by tools/film_strip.py
//   node tools/preview.mjs src/dev/preview_floor6_mobs.ts shots/strip.png <w> <h> walk:<who>:<fps>:<view>
//     its walk as the game plays it: the golem setting off, plodding and stopping; the rubbling scuttling;
//     carried over the floor at its pace
//   node tools/page_gif.mjs src/dev/preview_floor6_mobs.ts "deathfilm" shots/golem_death.gif 6
//     the golem struck down, from in front and from behind, twice the game's size, at the game's 20 frames a
//     second for its death; held on what is left

import { spriteOf3 } from '../art/heroes3';
import { MOVES3 } from '../art/moves3';
import { makeWardenArt } from '../art/monster_warden';
import { CHUNK_H, QG_DIE_TIME, QG_HIT, QG_PACE, QG_THROW, QG_THROW_HIT, QUARRY_GOLEM, RB_ATTACK, RB_DIE, RB_EMERGE, RB_PACE, RB_POP, RB_REEL, chunkShatter, golemChunk, golemFrame, rubblingFrame } from '../art/floor6_mobs';
import { handAt } from '../art/new_mobs3';
import type { V3 } from '../art/skeleton';
import { TILE3 } from '../art/new_mobs3';
import { project } from '../art/skeleton';
import { P } from '../art/palette';
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
/** A sprite drawn `k` times the game's size (the page's 2 a game pixel times `k`). */
function drawBig(g: CanvasRenderingContext2D, sp: Sprite, x: number, y: number, k: number): void {
  g.drawImage(sp.img, Math.round(x - sp.ax * 2 * k), Math.round(y - sp.ay * 2 * k), sp.w * 2 * k, sp.h * 2 * k);
}
function done(cvs: HTMLCanvasElement): void {
  document.body.style.margin = '0';
  document.body.style.background = '#0d1030';
  document.body.appendChild(cvs);
  (window as unknown as { __ready: boolean }).__ready = true;
}

function look(): void {
  const H = 620;
  const cvs = document.createElement('canvas');
  cvs.width = PW;
  cvs.height = H;
  const g = cvs.getContext('2d') as CanvasRenderingContext2D;
  g.imageSmoothingEnabled = false;
  bed(g, 0, 0, PW, H);
  const FOOT = 250;
  const put = (sp: Sprite, x: number, rx: number, name: string): void => {
    shadow(g, x, FOOT, rx);
    drawAt(g, sp, x, FOOT);
    label(g, name, x - name.length * 5, FOOT + 20);
  };
  label(g, 'Floor 6\'s mobs, standing (this row at the game\'s size)', 8, 6);
  put(spriteOf3(MOVES3.rear, 0, 'front'), 60, 14, 'knight');
  put(makeWardenArt().front.idle[0], 170, 30, 'Warden');
  put(golemFrame('stand', 0.4, 'front'), 330, 44, 'golem');
  put(golemFrame('stand', 0.4, 'back'), 500, 44, 'from behind');
  put(rubblingFrame('stand', 0.2, 'front'), 660, 14, 'rubbling');
  put(rubblingFrame('stand', 0.2, 'back'), 800, 14, 'behind');
  // close-ups
  const BIG = 560;
  drawBig(g, golemFrame('stand', 0.4, 'front'), 180, BIG, 3);
  drawBig(g, golemFrame('stand', 0.4, 'back'), 470, BIG, 3);
  drawBig(g, rubblingFrame('stand', 0.2, 'front'), 720, BIG - 40, 4);
  drawBig(g, rubblingFrame('stand', 0.2, 'back'), 900, BIG - 40, 4);
  label(g, 'three times the game\'s size', 8, 300);
  label(g, 'four times', 740, 300);
  done(cvs);
}

interface Cell {
  w: number;
  h: number;
  fx: number;
  fy: number;
  k: number;
  rx: number;
}
const CELLS: Record<string, Cell> = {
  golem: { w: 400, h: 400, fx: 170, fy: 320, k: 2, rx: 80 },
  rubbling: { w: 300, h: 240, fx: 150, fy: 170, k: 2, rx: 28 },
};
/** Cells for a whole sequence (room for the golem's blocks flung out as it bursts). */
const SEQ_CELLS: Record<string, Cell> = {
  golem: { w: 560, h: 480, fx: 250, fy: 320, k: 2, rx: 80 },
  rubbling: { w: 300, h: 240, fx: 150, fy: 170, k: 2, rx: 28 },
};
function frameOf(who: string, move: string, t: number, view: 'front' | 'back'): Sprite {
  return who === 'golem' ? golemFrame(move, t, view) : rubblingFrame(move, t, view);
}

/** A MOVE AS A STRIP OF FRAMES (hash `film:<who>:<move>:<fps>:<secs>:<view>`), three to a row. */
function film(): void {
  const [, who, move, fpsS, longS, viewS] = HASH.split(':');
  const fps = Number(fpsS);
  const n = Math.round(Number(longS) * fps) + 1;
  const view = (viewS || 'front') as 'front' | 'back';
  const C = CELLS[who];
  const cols = 3;
  const cvs = document.createElement('canvas');
  cvs.width = C.w * cols;
  cvs.height = C.h * Math.ceil(n / cols);
  const g = cvs.getContext('2d') as CanvasRenderingContext2D;
  g.imageSmoothingEnabled = false;
  for (let i = 0; i < n; i++) {
    const ox = (i % cols) * C.w;
    const oy = Math.floor(i / cols) * C.h;
    bed(g, ox, oy, C.w, C.h, 16 * C.k);
    g.save();
    g.beginPath();
    g.rect(ox, oy, C.w, C.h);
    g.clip();
    if (move !== 'dying' || who === 'rubbling') shadow(g, ox + C.fx, oy + C.fy, C.rx);
    drawBig(g, frameOf(who, move, i / fps, view), ox + C.fx, oy + C.fy, C.k);
    g.restore();
  }
  done(cvs);
}

/** ITS WALK AS THE GAME PLAYS IT (hash `walk:<who>:<fps>:<view>`), carried over the floor at its pace. */
function walk(): void {
  const [, who, fpsS, viewS] = HASH.split(':');
  const fps = Number(fpsS);
  const view = (viewS || 'front') as 'front' | 'back';
  const parts: [string, number][] = who === 'golem' ? [['setOff', 0.6], ['walk', 3.0], ['halt', 0.6]] : [['walk', 2.0]];
  const seq: [string, number, number][] = [];
  let T = 0;
  for (const [mv, long] of parts) {
    const n = Math.round(long * fps);
    for (let i = 0; i < n; i++) seq.push([mv, i / fps, T + i / fps]);
    T += long;
  }
  if (who === 'golem') seq.push(['stand', 0, T]);
  const C = CELLS[who];
  const cols = 3;
  const cvs = document.createElement('canvas');
  cvs.width = C.w * cols;
  cvs.height = C.h * Math.ceil(seq.length / cols);
  const g = cvs.getContext('2d') as CanvasRenderingContext2D;
  g.imageSmoothingEnabled = false;
  const pace = who === 'golem' ? QG_PACE : RB_PACE;
  seq.forEach(([mv, t, at], i) => {
    const ox = (i % cols) * C.w;
    const oy = Math.floor(i / cols) * C.h;
    // the floor slides under it (the camera following), so it stays in its cell
    const [dx, dy] = project([pace * TILE3 * at, 0, 0], view);
    const tile = 16 * C.k;
    g.save();
    g.beginPath();
    g.rect(ox, oy, C.w, C.h);
    g.clip();
    g.translate(-(((dx * C.k) % (tile * 4)) + tile * 4) % (tile * 4), -(((dy * C.k) % (tile * 2)) + tile * 2) % (tile * 2));
    bed(g, ox, oy, C.w + tile * 4, C.h + tile * 2, tile);
    g.restore();
    g.save();
    g.beginPath();
    g.rect(ox, oy, C.w, C.h);
    g.clip();
    shadow(g, ox + C.fx, oy + C.fy, C.rx);
    drawBig(g, frameOf(who, mv, t, view), ox + C.fx, oy + C.fy, C.k);
    g.restore();
  });
  done(cvs);
}

/**
 * ITS MOVES ONE AFTER ANOTHER, AS THE GAME WOULD PLAY THEM (hash `seq:<who>:<fps>`): standing, its blow, standing,
 * struck, standing, and its death, held on what is left of it; three to a row (cells 560 x 480 for the golem,
 * 300 x 240 for the rubbling).
 */
function seq(): void {
  const [, who, fpsS] = HASH.split(':');
  const fps = Number(fpsS);
  const golem = who === 'golem';
  const parts: [string, number][] = [...(golem ? [] : [['emerge', RB_EMERGE] as [string, number]]), ['stand', 1.0], ['attack', golem ? QG_HIT + 0.85 : RB_ATTACK], ['stand', 0.6], ['reel', golem ? 0.3 : RB_REEL], ['stand', 0.8], ['dying', (golem ? QG_DIE_TIME : RB_DIE) + 1.0]];
  const list: [string, number][] = [];
  for (const [mv, long] of parts) for (let i = 0; i < Math.round(long * fps); i++) list.push([mv, i / fps]);
  const C = SEQ_CELLS[who];
  const cols = 3;
  const cvs = document.createElement('canvas');
  cvs.width = C.w * cols;
  cvs.height = C.h * Math.ceil(list.length / cols);
  const g = cvs.getContext('2d') as CanvasRenderingContext2D;
  g.imageSmoothingEnabled = false;
  list.forEach(([mv, t], i) => {
    const ox = (i % cols) * C.w;
    const oy = Math.floor(i / cols) * C.h;
    bed(g, ox, oy, C.w, C.h, 16 * C.k);
    g.save();
    g.beginPath();
    g.rect(ox, oy, C.w, C.h);
    g.clip();
    const gone = mv === 'dying' && t > (golem ? 0.42 : RB_POP);
    if (!gone) shadow(g, ox + C.fx, oy + C.fy, C.rx);
    drawBig(g, mv === 'dying' ? frameOf(who, 'dying', Math.min(t, golem ? QG_DIE_TIME : RB_DIE), 'front') : frameOf(who, mv, t, 'front'), ox + C.fx, oy + C.fy, C.k);
    g.restore();
  });
  done(cvs);
}

/**
 * ITS THROW AS THE GAME WOULD PLAY IT (hash `throwfilm:<fps>`): the golem tears the chunk off its shoulder and
 * throws it; the chunk flies (here 0.55 s, 3.5 tiles, along an arc: the flight is the game's) from where its
 * hand lets it go, its shadow under it, and shatters where it comes down. Cells of 720 x 480, two to a row.
 */
function throwFilm(): void {
  const fps = Number(HASH.split(':')[1]);
  const FLY = 0.55;
  const long = QG_THROW + 0.5;
  const n = Math.round(long * fps) + 1;
  const W = 720;
  const H = 480;
  const k = 2;
  const FX = 170;
  const FY = 300;
  const cols = 2;
  const cvs = document.createElement('canvas');
  cvs.width = W * cols;
  cvs.height = H * Math.ceil(n / cols);
  const g = cvs.getContext('2d') as CanvasRenderingContext2D;
  g.imageSmoothingEnabled = false;
  const from = handAt(QUARRY_GOLEM, 'throw', QG_THROW_HIT, 'L');
  const to: V3 = [3.5 * TILE3, 0.4 * TILE3, 0];
  const scr = (p: V3): [number, number] => {
    const [x, y] = project(p, 'front');
    return [x * k, y * k];
  };
  for (let i = 0; i < n; i++) {
    const t = i / fps;
    const ox = (i % cols) * W;
    const oy = Math.floor(i / cols) * H;
    bed(g, ox, oy, W, H, 32);
    g.save();
    g.beginPath();
    g.rect(ox, oy, W, H);
    g.clip();
    shadow(g, ox + FX, oy + FY, 80);
    drawBig(g, t < QG_THROW ? golemFrame('throw', t, 'front') : golemFrame('stand', t - QG_THROW, 'front'), ox + FX, oy + FY, k);
    if (t >= QG_THROW_HIT) {
      const u = (t - QG_THROW_HIT) / FLY;
      if (u < 1) {
        const p: V3 = [from[0] + (to[0] - from[0]) * u, from[1] + (to[1] - from[1]) * u, from[2] + (CHUNK_H[2] - from[2]) * u + 40 * Math.sin(Math.PI * u)];
        const [sx, sy] = scr([p[0], p[1], 0]);
        shadow(g, ox + FX + sx, oy + FY + sy, 10 + 6 * u);
        const [cx, cy] = scr(p);
        drawBig(g, golemChunk(u * 1.5, 'front'), ox + FX + cx, oy + FY + cy, k);
      } else {
        const f = Math.min(4, Math.floor((t - QG_THROW_HIT - FLY) * 12));
        const [cx, cy] = scr(to);
        drawBig(g, chunkShatter(f), ox + FX + cx, oy + FY + cy, k);
      }
    }
    g.restore();
  }
  done(cvs);
}

/** ITS DEATH AS THE GAME PLAYS IT (hash `deathfilm`): a moment standing, struck, and its death at the game's 20 a second, held on what is left; from in front and from behind, twice the game's size. */
function deathFilm(): void {
  const FPS = 20;
  const STAND = 0.5;
  const HOLD = 1.0;
  const n = Math.round((STAND + QG_DIE_TIME + HOLD) * FPS) + 1;
  const W = 1000;
  const H = 520;
  const cvs = document.createElement('canvas');
  cvs.width = W;
  cvs.height = H;
  const g = cvs.getContext('2d') as CanvasRenderingContext2D;
  g.imageSmoothingEnabled = false;
  const draw = (i: number): void => {
    const t = i / FPS;
    bed(g, 0, 0, W, H, 32);
    for (const [x, view] of [[270, 'front'], [730, 'back']] as [number, 'front' | 'back'][]) {
      const dying = t >= STAND;
      if (!dying || t - STAND < 0.3) shadow(g, x, 380, 80);
      drawBig(g, dying ? golemFrame('dying', Math.min(t - STAND, QG_DIE_TIME), view) : golemFrame('stand', t, view), x, 380, 1);
    }
    label(g, 'The quarry golem, struck down', 12, 8);
    label(g, `${Math.max(0, t - STAND).toFixed(2)} s`, 12, H - 30);
  };
  draw(0);
  done(cvs);
  const win = window as unknown as { __frames: number; __tickMs: number; __frame: (i: number) => string };
  win.__frames = n;
  win.__tickMs = 1000 / FPS;
  win.__frame = (i: number): string => {
    draw(i);
    return cvs.toDataURL('image/png');
  };
}

if (HASH.startsWith('deathfilm')) deathFilm();
else if (HASH.startsWith('throwfilm')) throwFilm();
else if (HASH.startsWith('seq')) seq();
else if (HASH.startsWith('film')) film();
else if (HASH.startsWith('walk')) walk();
else look();
