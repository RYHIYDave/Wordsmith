// Dev page: FLOOR 6'S BOSS, THE UNFINISHED, standing (art/unfinished.ts), for the owner to look at before
// anything of it moves. Nothing of the game imports it.
//
//   node tools/preview.mjs src/dev/preview_unfinished.ts shots/uf_look.png 1014 640 look
//     it standing free, from in front and from behind, and still one with the wall; the knight and the
//     Warden beside it at the game's size, for its size; a close-up of it from in front
//   node tools/preview.mjs src/dev/preview_unfinished.ts shots/uf_cut.png 1014 468 cut[:t]
//     one phone screen of its arena: it still one with the far wall of the cut, the knight come in

import { makeDaggerCultistArt3 } from '../art/cultists';
import { spriteOf3 } from '../art/heroes3';
import { makeWardenArt } from '../art/monster_warden';
import { MOVES3 } from '../art/moves3';
import { P } from '../art/palette';
import { QUARRY_LOOK } from '../art/quarry';
import { UF_BREATH, UF_HURL_HIT, UF_PACE, UF_FALLS, UF_SLIDE_HIT, UF_STOMP_HIT, UF_TEAR_HIT, UNFINISHED, BLOCK_FLY_Z, BLOCK_H, blockFlight, boulderRolling, hurledBlock, stompCracks, unfinishedDeath, unfinishedFrame, unfinishedStanding } from '../art/unfinished';
import { skeletonAt } from '../art/new_mobs3';
import { lerp3 } from '../art/skeleton';
import type { V3 } from '../art/skeleton';
import { TILE3 } from '../art/new_mobs3';
import { project } from '../art/skeleton';
import { drawText } from '../engine/font';
import type { Sprite } from '../engine/px';
import { THEME } from '../ui/ui';
import { PW, Stage, area, at, drawAt, layTiles, path, union } from './act1_stage';

const HASH = decodeURIComponent(location.hash.slice(1)) || 'look';
const T = Number(HASH.split(':')[1] ?? 0.4);

if (HASH.startsWith('cut')) cut();
else if (HASH.startsWith('strip')) strip();
else if (HASH.startsWith('walkfilm')) walkFilm();
else if (HASH.startsWith('bigfilm')) bigFilm();
else look();

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
  // the quarry's bed as a floor under them, plain
  g.fillStyle = '#b8b0a8';
  g.fillRect(0, 0, PW, H);
  g.fillStyle = '#a69e98';
  for (let y = 0; y < H; y += 32) for (let x = (y / 32) % 2 ? 0 : 64; x < PW; x += 128) g.fillRect(x, y, 64, 32);
  const FOOT = 930;
  const shadow = (x: number, rx: number): void => {
    g.fillStyle = 'rgba(25, 18, 40, 0.3)';
    g.beginPath();
    g.ellipse(x, FOOT, rx, rx * 0.4, 0, 0, Math.PI * 2);
    g.fill();
  };
  const knight = spriteOf3(MOVES3.rear, 0, 'front');
  const warden = makeWardenArt().front.idle[0];
  const front = unfinishedStanding(T, 'front');
  const back = unfinishedStanding(T, 'back');
  const fused = unfinishedStanding(T, 'front', true);
  const put = (sp: Sprite, x: number, rx: number, name: string): void => {
    shadow(x, rx);
    drawAt(g, sp, x, FOOT);
    label(g, name, x - name.length * 5, FOOT + 22);
  };
  put(knight, 50, 14, 'knight');
  put(warden, 128, 30, 'Warden');
  put(front, 330, 70, 'from in front');
  put(back, 580, 70, 'from behind');
  put(fused, 840, 80, 'one with the wall');
  label(g, 'The Unfinished, standing (the row below at the game\'s size)', 8, 6);
  // close-ups, twice the game's size: from in front and from behind
  const big = (sp: Sprite, x: number, name: string): void => {
    g.drawImage(sp.img, Math.round(x - sp.ax * 4), Math.round(500 - sp.ay * 4), sp.w * 4, sp.h * 4);
    label(g, name, x - name.length * 5, 512);
  };
  big(front, 270, 'from in front, close');
  big(back, 750, 'from behind, close');
  document.body.style.margin = '0';
  document.body.style.background = '#0d1030';
  document.body.appendChild(cvs);
  (window as unknown as { __ready: boolean }).__ready = true;
}

function cut(): void {
  // THE UNFINISHED CUT: a deep cut in the quarry, its far wall as high as the colossus, the terrace before it
  const shape = union(area(520, 420, 8.2, 4.6, 0.12), path([[260, 450], [150, 500]], 2.0));
  const FLOOR = layTiles(shape, 48, 48);
  const S = new Stage(FLOOR, { ...QUARRY_LOOK, rise: 230 });
  S.ground();
  const [bx, by] = at(540, 336);
  S.put({ x: bx, y: by, sp: unfinishedStanding(T % UF_BREATH, 'front', true), shadow: 2.2 });
  const dagger = makeDaggerCultistArt3();
  for (const [px, py] of [[420, 410], [700, 400]] as const) {
    const [x, y] = at(px, py);
    S.put({ x, y, sp: dagger.front.idle[0], figure: true, shadow: 0.45 });
  }
  const HERO = at(300, 440);
  S.put({ x: HERO[0], y: HERO[1], sp: spriteOf3(MOVES3.rear, 0, 'front'), figure: true, shadow: 0.5 });
  S.standAll();
  S.lights();
  S.nameAndMap('The Unfinished Cut', HERO);
  S.show();
}

/**
 * A MOVE AS A STRIP OF FRAMES for a film (hash `strip:<move>:<frames a second>:<seconds>:<view>`): every
 * frame in a cell of 360 x 360, three to a row, on the quarry's bed, its shadow under it; cut into a film
 * by tools/film_strip.py.
 */
function strip(): void {
  const [, move, fpsS, longS, viewS] = HASH.split(':');
  const fps = Number(fpsS);
  const n = Math.round(Number(longS) * fps) + 1;
  const view = (viewS || 'front') as 'front' | 'back';
  const CW = 360;
  const CH = 360;
  const cols = 3;
  const cvs = document.createElement('canvas');
  cvs.width = CW * cols;
  cvs.height = CH * Math.ceil(n / cols);
  const g = cvs.getContext('2d') as CanvasRenderingContext2D;
  g.imageSmoothingEnabled = false;
  for (let i = 0; i < n; i++) {
    const ox = (i % cols) * CW;
    const oy = Math.floor(i / cols) * CH;
    g.fillStyle = '#b8b0a8';
    g.fillRect(ox, oy, CW, CH);
    g.fillStyle = '#a69e98';
    for (let y = 0; y < CH; y += 32) for (let x = ((y / 32) % 2 ? 0 : 64); x < CW; x += 128) g.fillRect(ox + x, oy + y, 64, 32);
    const fx = ox + 140;
    const fy = oy + 290;
    g.fillStyle = 'rgba(25, 18, 40, 0.3)';
    g.beginPath();
    g.ellipse(fx, fy, 64, 26, 0, 0, Math.PI * 2);
    g.fill();
    g.save();
    g.beginPath();
    g.rect(ox, oy, CW, CH);
    g.clip();
    drawAt(g, unfinishedFrame(move, i / fps, view), fx, fy);
    g.restore();
  }
  document.body.style.margin = '0';
  document.body.style.background = '#0d1030';
  document.body.appendChild(cvs);
  (window as unknown as { __ready: boolean }).__ready = true;
}

/**
 * ITS WALK AS THE GAME PLAYS IT (hash `walkfilm:<frames a second>:<view>`): setting off from its stance,
 * once round its walk, and stopping, carried on over the floor at its pace as the game carries it; each
 * frame a cell of 360 x 360, three to a row (tools/film_strip.py).
 */
function walkFilm(): void {
  const [, fpsS, viewS] = HASH.split(':');
  const fps = Number(fpsS);
  const view = (viewS || 'front') as 'front' | 'back';
  const parts: [string, number][] = [['setOff', 1.0], ['walk', 3.0], ['halt', 1.0]];
  const seq: [string, number, number][] = [];
  let T = 0;
  for (const [mv, long] of parts) {
    const n = Math.round(long * fps);
    for (let i = 0; i < n; i++) seq.push([mv, i / fps, T + i / fps]);
    T += long;
  }
  seq.push(['stand', 0, T]);
  const CW = 360;
  const CH = 360;
  const cols = 3;
  const cvs = document.createElement('canvas');
  cvs.width = CW * cols;
  cvs.height = CH * Math.ceil(seq.length / cols);
  const g = cvs.getContext('2d') as CanvasRenderingContext2D;
  g.imageSmoothingEnabled = false;
  const ground = UF_PACE * TILE3;
  seq.forEach(([mv, t, at], i) => {
    const ox = (i % cols) * CW;
    const oy = Math.floor(i / cols) * CH;
    g.fillStyle = '#b8b0a8';
    g.fillRect(ox, oy, CW, CH);
    g.fillStyle = '#a69e98';
    for (let y = 0; y < CH; y += 32) for (let x = ((y / 32) % 2 ? 0 : 64); x < CW; x += 128) g.fillRect(ox + x, oy + y, 64, 32);
    const [dx, dy] = project([ground * at, 0, 0], view);
    const fx = ox + 110 + dx;
    const fy = oy + 260 + dy;
    g.fillStyle = 'rgba(25, 18, 40, 0.3)';
    g.beginPath();
    g.ellipse(fx, fy, 64, 26, 0, 0, Math.PI * 2);
    g.fill();
    g.save();
    g.beginPath();
    g.rect(ox, oy, CW, CH);
    g.clip();
    drawAt(g, unfinishedFrame(mv, t, view), fx, fy);
    g.restore();
  });
  document.body.style.margin = '0';
  document.body.style.background = '#0d1030';
  document.body.appendChild(cvs);
  (window as unknown as { __ready: boolean }).__ready = true;
}

/**
 * ONE OF ITS BIG MOVES AS THE GAME WOULD PLAY IT (hash `bigfilm:<move>:<frames a second>:<seconds>`), with
 * what it leaves: the stomp's cracks under its foot; the block flying and landing as cover; boulders
 * rolling down their lanes after the rockslide, and the screen's kick at each blow. Cells of 540 x 600,
 * two to a row (tools/film_strip.py: `film_strip.py <strip> <gif> <frames> <fps> 540 2 1 600`).
 */
function bigFilm(): void {
  const [, move, fpsS, longS] = HASH.split(':');
  const fps = Number(fpsS);
  const n = Math.round(Number(longS) * fps) + 1;
  const CW = 540;
  const CH = 600;
  const cols = 2;
  const cvs = document.createElement('canvas');
  cvs.width = CW * cols;
  cvs.height = CH * Math.ceil(n / cols);
  const g = cvs.getContext('2d') as CanvasRenderingContext2D;
  g.imageSmoothingEnabled = false;
  const at = (p: V3, ox: number, oy: number): [number, number] => {
    const [x, y] = project(p, 'front');
    return [ox + x, oy + y];
  };
  const hit = move === 'stomp' ? UF_STOMP_HIT : move === 'hurl' ? UF_HURL_HIT : move === 'rockslide' ? UF_SLIDE_HIT : -99;
  const toe = skeletonAt(UNFINISHED, 'stomp', UF_STOMP_HIT + 0.1).toeR;
  const sHit = skeletonAt(UNFINISHED, 'hurl', UF_HURL_HIT);
  const from = lerp3(sHit.handL, sHit.handR, 0.5);
  const LAND: V3 = [260, -10, BLOCK_H[2]];
  const FLY = 0.55;
  for (let i = 0; i < n; i++) {
    const t = i / fps;
    const since = t - hit;
    const again = move === 'rockslide' ? t - (UF_SLIDE_HIT + 0.56) : -1;
    const kick = (k: number): number => (k >= 0 && k < 0.25 ? Math.round(Math.sin(k * 60) * 4 * (1 - k / 0.25)) : 0);
    const shake = move === 'rockslide' ? kick(since) + kick(again) : move === 'stomp' ? kick(since) : move === 'dying' ? kick(t - UF_FALLS) : move === 'tearFree' ? kick(t - UF_TEAR_HIT) : 0;
    const ox = (i % cols) * CW;
    const oy = Math.floor(i / cols) * CH;
    g.save();
    g.beginPath();
    g.rect(ox, oy, CW, CH);
    g.clip();
    g.fillStyle = '#b8b0a8';
    g.fillRect(ox, oy, CW, CH);
    g.translate(0, shake);
    g.fillStyle = '#a69e98';
    for (let y = -32; y < CH + 32; y += 32) for (let x = ((y / 32) % 2 ? 0 : 64); x < CW; x += 128) g.fillRect(ox + x, oy + y, 64, 32);
    const fx = ox + 150;
    const fy = oy + 420;
    if (move === 'stomp' && since >= 0) {
      const [cx, cy] = at([toe[0] - 6, toe[1], 0], fx, fy);
      drawAt(g, stompCracks(since < 0.04 ? 0 : since < 0.09 ? 1 : since < 0.15 ? 2 : 3), cx, cy);
    }
    g.fillStyle = 'rgba(25, 18, 40, 0.3)';
    g.beginPath();
    g.ellipse(fx, fy, 64, 26, 0, 0, Math.PI * 2);
    g.fill();
    const tt = Math.min(t, Number(longS));
    drawAt(g, move === 'dying' ? unfinishedDeath(tt) : unfinishedFrame(move, tt, 'front', move === 'tearFree'), fx, fy);
    if (move === 'hurl' && since >= 0) {
      const k = Math.min(1, since / FLY);
      if (k < 1) {
        const p = blockFlight(from, LAND, k);
        const [bx, by] = at([p[0], p[1], 0], fx, fy);
        const [sx, sy] = at([p[0], p[1], p[2] - BLOCK_FLY_Z], fx, fy);
        g.fillStyle = 'rgba(25, 18, 40, 0.25)';
        g.beginPath();
        g.ellipse(bx, by, 34, 14, 0, 0, Math.PI * 2);
        g.fill();
        drawAt(g, hurledBlock(Math.floor(since * 14) % 4), sx, sy);
      } else {
        const [bx, by] = at([LAND[0], LAND[1], 0], fx, fy);
        drawAt(g, hurledBlock(4), bx, by);
      }
    }
    if (move === 'rockslide' && since >= 0.2) {
      for (const [x, start, speed] of [[150, 0.2, 260], [70, 0.55, 230], [230, 0.9, 280]] as const) {
        const k = since - start;
        if (k < 0) continue;
        const p: V3 = [x, -260 + speed * k, 0];
        const [bx, by] = at(p, fx, fy);
        g.fillStyle = 'rgba(25, 18, 40, 0.25)';
        g.beginPath();
        g.ellipse(bx, by, 24, 10, 0, 0, Math.PI * 2);
        g.fill();
        drawAt(g, boulderRolling(Math.floor(k * speed / 18) % 8), bx, by - Math.abs(Math.sin(k * 9)) * 4);
      }
    }
    g.restore();
  }
  document.body.style.margin = '0';
  document.body.style.background = '#0d1030';
  document.body.appendChild(cvs);
  (window as unknown as { __ready: boolean }).__ready = true;
}
