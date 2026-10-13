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
import { UF_BREATH, UF_PACE, unfinishedFrame, unfinishedStanding } from '../art/unfinished';
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
