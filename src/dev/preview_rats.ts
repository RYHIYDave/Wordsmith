// Dev page: THE KING'S RATS (art/rats.ts), floor 12's small mob, on the Undercity's flags (art/undercity.ts), beside
// the Rat King, a Hushed porter and the knight for size. Nothing of the game imports it.

import { UC_ZONE, undercityLook } from '../art/undercity';
import { HUSHED_PORTER } from '../art/hushed_moves';
import { RAT_STAND, RAT_WALK, ratFrame, ratLong } from '../art/rats';
import { ratKingFrame } from '../art/rat_king';
import { spriteOf3 } from '../art/heroes3';
import { toSprite } from '../art/kit';
import { MOVES3 } from '../art/moves3';
import { canvasOf, deathOfMob, paintMob } from '../art/new_mobs3';
import type { Mob } from '../art/new_mobs3';
import { P } from '../art/palette';
import { paintTerrain, pictureOf, terrainOf } from '../art/terrain';
import { drawText } from '../engine/font';
import { drawAura, drawLights } from '../engine/px';
import type { Sprite } from '../engine/px';
import { T_FLOOR } from '../game/types';
import type { Floor } from '../game/types';
import type { GameView } from '../art/skin';
import { THEME } from '../ui/ui';

const parts = decodeURIComponent(location.hash.slice(1)).split(':');
const mode = parts[0] || 'sheet';

const W = 30;
const H = 30;
const FLOOR = { depth: 12, seed: 12, w: W, h: H, tiles: new Uint8Array(W * H).fill(T_FLOOR), cut: new Uint8Array(W * H), variant: new Uint8Array(W * H), rooms: [], start: { x: 0, y: 0 } } as unknown as Floor;
const LAND = { floor: FLOOR, zone: () => UC_ZONE.Walk, water: () => false };
const T = terrainOf(FLOOR, undercityLook(LAND));

const cv = document.createElement('canvas');
const g = cv.getContext('2d') as CanvasRenderingContext2D;
const win = window as unknown as { __ready: boolean; __frames: number; __tickMs: number; __frame: (i: number) => string };
function show(): void {
  document.body.style.margin = '0';
  document.body.style.background = '#0d1030';
  document.body.appendChild(cv);
  win.__ready = true;
}
/** The ground under a pane, `S` times (a terrain pixel is a picture pixel), its middle on the square's middle. */
function groundPane(x: number, y: number, w: number, h: number, S: number): void {
  const [cx, cy] = pictureOf(15, 15);
  const gw = Math.ceil(w / S);
  const gh = Math.ceil(h / S);
  const p = paintTerrain(T, Math.round(cx - gw / 2), Math.round(cy - gh / 2), gw, gh);
  const c = document.createElement('canvas');
  c.width = gw;
  c.height = gh;
  (c.getContext('2d') as CanvasRenderingContext2D).putImageData(new ImageData(p.rgba, gw, gh), 0, 0);
  g.imageSmoothingEnabled = false;
  g.drawImage(c, x, y, gw * S, gh * S);
  g.fillStyle = 'rgba(26,16,40,0.2)';
  g.fillRect(x, y, w, h);
}
const spOf = (mob: Mob, which: string, t: number, view: GameView): Sprite =>
  which === 'die' ? toSprite(deathOfMob(mob, t / mob.dieTime, view), null, canvasOf(mob).ax, canvasOf(mob).ay) : toSprite(paintMob(mob, which, t, view), mob.aura, canvasOf(mob).ax, canvasOf(mob).ay);
const KNIGHT = (): Sprite => spriteOf3(MOVES3.rear, 0, 'front');
function figure(sp: Sprite, fx: number, fy: number, S: number, shadow: number): void {
  g.save();
  g.fillStyle = 'rgba(14,10,24,0.45)';
  g.beginPath();
  g.ellipse(fx, fy, shadow * S, shadow * 0.45 * S, 0, 0, Math.PI * 2);
  g.fill();
  g.restore();
  drawAura(g, sp, fx, fy, 2 * S);
  g.imageSmoothingEnabled = false;
  g.drawImage(sp.img, Math.round(fx - sp.ax * 2 * S), Math.round(fy - sp.ay * 2 * S), sp.img.width * S, sp.img.height * S);
  drawLights(g, sp, fx, fy, 2 * S);
}
function label(s: string, x: number, y: number): void {
  g.save();
  g.scale(2, 2);
  drawText(g, s, x / 2, y / 2, THEME.text, { shadow: P.ink });
  g.restore();
}

//   node tools/preview.mjs src/dev/preview_rats.ts shots/rats_sheet.png 1500 520 sheet[:<scale>]
//   node tools/preview.mjs src/dev/preview_rats.ts shots/rats_game.png 1014 468 game
//   node tools/preview.mjs src/dev/preview_rats.ts shots/rats_close.png 1200 700 close:<move>:<seconds>:<scale>
//   node tools/page_gif.mjs src/dev/preview_rats.ts "film:<move>[:<scale>]" previews/rats/<move>.gif

const RF = (which: string, t: number, view: GameView): Sprite => ratFrame(which === 'die' ? 'dying' : which, t, view);
const SHADOW = 12;
if (mode === 'sheet') {
  const S = Number(parts[1]) || 3;
  cv.width = 1500;
  cv.height = 520;
  g.fillStyle = '#0d1030';
  g.fillRect(0, 0, cv.width, cv.height);
  const paneY = 40;
  const paneH = 420;
  groundPane(10, paneY, cv.width - 20, paneH, S);
  const fy = paneY + paneH - 60;
  figure(RF('stand', 0, 'front'), 150, fy, S, SHADOW);
  figure(RF('stand', 0, 'back'), 420, fy, S, SHADOW);
  figure(RF('look', 0.5, 'front'), 640, fy, S, SHADOW);
  label('a rat, facing you, away, and up to look round', 60, paneY + paneH + 12);
  figure(spOf(HUSHED_PORTER, 'stand', 0, 'front'), 960, fy, S, HUSHED_PORTER.shadow);
  label('a Hushed porter', 900, paneY + paneH + 12);
  figure(KNIGHT(), 1250, fy, S, 9);
  label('the knight', 1210, paneY + paneH + 12);
  label(`The King's rats (${S} times)`, 14, 10);
  show();
} else if (mode === 'close') {
  const which = parts[1] || 'stand';
  const t = Number(parts[2]) || 0;
  const S = Number(parts[3]) || 6;
  const sps = (['front', 'back'] as const).map((v) => RF(which, t, v));
  const W0 = sps.reduce((a, sp) => a + sp.img.width * S + 30, 10);
  cv.width = W0;
  cv.height = Math.max(...sps.map((sp) => sp.img.height * S)) + 50;
  g.fillStyle = '#3a3448';
  g.fillRect(0, 0, cv.width, cv.height);
  g.imageSmoothingEnabled = false;
  let x = 10;
  for (const sp of sps) {
    g.drawImage(sp.img, x, 40, sp.img.width * S, sp.img.height * S);
    x += sp.img.width * S + 30;
  }
  label(`A rat: ${which} at ${t.toFixed(2)} s (${S} times)`, 10, 8);
  show();
} else if (mode === 'game') {
  // a pack of them round the knight, the King behind, at the game's own size
  cv.width = 1014;
  cv.height = 468;
  groundPane(0, 0, cv.width, cv.height, 1);
  const all: [Sprite, number, number, number][] = [
    [ratKingFrame('stand', 0.2, 'front'), 760, 200, 34],
    [RF('stand', 0.1, 'front'), 520, 300, SHADOW],
    [RF('attack', 0.25, 'front'), 470, 340, SHADOW],
    [RF('walk', 0.08, 'front'), 600, 345, SHADOW],
    [RF('look', 0.6, 'back'), 360, 360, SHADOW],
    [RF('walk', 0.16, 'back'), 410, 270, SHADOW],
    [RF('dying', 1.5, 'front'), 640, 260, 0],
    [KNIGHT(), 430, 320, 9],
  ];
  all.sort((a, b) => a[2] - b[2]);
  for (const [sp, x, y, sh] of all) figure(sp, x, y, 1, sh);
  label('The King\'s rats round the knight, the Rat King behind, at the game\'s size', 10, 8);
  show();
} else if (mode === 'film') {
  // facing you (left) and facing away (right): its stand twice round, its scurry, or a move between stands
  const which = parts[1] || 'stand';
  const S = Number(parts[2]) || 4;
  const FPS = 30;
  const LONG = which === 'stand' ? 2 * RAT_STAND.period : which === 'walk' ? 8 * RAT_WALK.period : 0.5 + (which === 'die' ? ratLong('dying') + 0.8 : ratLong(which) + 0.6);
  const TICKS = Math.round(LONG * FPS);
  const spAt = (t: number, view: GameView): Sprite => {
    if (which === 'stand') return RF('stand', (Math.floor(t * RAT_STAND.fps) % RAT_STAND.frames) / RAT_STAND.fps, view);
    if (which === 'walk') return RF('walk', (Math.floor(t * RAT_WALK.fps) % RAT_WALK.frames) / RAT_WALK.fps, view);
    const m = t - 0.5;
    const long = which === 'die' ? ratLong('dying') : ratLong(which);
    return m < 0 || (which !== 'die' && m > long) ? RF('stand', 0, view) : RF(which, Math.min(long, m), view);
  };
  const paneW = 120 * S;
  const paneH = 80 * S;
  cv.width = paneW * 2 + 30;
  cv.height = paneH + 56;
  const draw = (tick: number): void => {
    const t = tick / FPS;
    g.fillStyle = '#0d1030';
    g.fillRect(0, 0, cv.width, cv.height);
    (['front', 'back'] as const).forEach((view, j) => {
      const px = 10 + j * (paneW + 10);
      groundPane(px, 40, paneW, paneH, S);
      g.save();
      g.beginPath();
      g.rect(px, 40, paneW, paneH);
      g.clip();
      figure(spAt(t, view), px + paneW * 0.45, 40 + paneH * 0.66, S, SHADOW);
      g.restore();
      label(view === 'front' ? 'facing you' : 'facing away', px + paneW / 2 - 40, 40 + paneH + 2);
    });
    label(`A rat: ${which}`, 12, 8);
  };
  draw(0);
  win.__frames = TICKS;
  win.__tickMs = 1000 / FPS;
  win.__frame = (i: number): string => {
    draw(i);
    return cv.toDataURL('image/png');
  };
  show();
}
