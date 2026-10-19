// Dev page: THE PALIMPSEST (art/palimpsest.ts, art/palimpsest_moves.ts), floor 13's boss, on the Millrace's fields
// (art/millrace.ts), beside the knight for size. Nothing of the game imports it.
//
//   node tools/preview.mjs src/dev/preview_palimpsest.ts shots/pa_sheet.png 1300 760 sheet[:<scale>[:<wear>]]
//   node tools/preview.mjs src/dev/preview_palimpsest.ts shots/pa_close.png 1400 1000 close:<move>:<seconds>:<scale>[:<wear>]
//   node tools/preview.mjs src/dev/preview_palimpsest.ts shots/pa_game.png 1014 468 game
//   node tools/page_gif.mjs src/dev/preview_palimpsest.ts "film:<move>[:<scale>]" previews/palimpsest/<move>.gif
//     a film facing you (left) and away (right): stand, walk, attack, reel, die, and its own: cuts, leaves, rewrite
//   node tools/page_gif.mjs src/dev/preview_palimpsest.ts "shots" previews/palimpsest/shots.gif
//     what it leaves on the floor, at three times the game's size: the slam's splash; its pages lying, one burning;
//     pages crawling home; paper birds diving, each with its warning ring

import { millraceLook } from '../art/millrace';
import { PALIMPSEST, WEAR } from '../art/palimpsest_moves';
import { PA_OFF } from '../art/palimpsest';
import { BIRD_MARK_FOR, BIRD_SPEED, PAGE_BURN_FOR, SLAM_SPLASH_FOR, drawBirdMark, drawBurningPage, drawFallenPage, drawLeafBird, drawPageHome, drawSlamSplash } from '../art/palimpsest_shots';
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
const FLOOR = { depth: 13, seed: 13, w: W, h: H, tiles: new Uint8Array(W * H).fill(T_FLOOR), cut: new Uint8Array(W * H), variant: new Uint8Array(W * H), rooms: [], start: { x: 0, y: 0 } } as unknown as Floor;
const T = terrainOf(FLOOR, millraceLook({ yard: (x: number, y: number) => Math.hypot(x - 15, y - 15) < 9 }));

const cv = document.createElement('canvas');
const g = cv.getContext('2d') as CanvasRenderingContext2D;
const win = window as unknown as { __ready: boolean; __frames: number; __tickMs: number; __frame: (i: number) => string };
function show(): void {
  document.body.style.margin = '0';
  document.body.style.background = '#0d1030';
  document.body.appendChild(cv);
  win.__ready = true;
}
/** The ground under a pane, `S` times (a terrain pixel is a picture pixel), its middle on the yard's middle. */
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

if (mode === 'sheet') {
  const S = Number(parts[1]) || 3;
  WEAR.now = Number(parts[2]) || 0;
  cv.width = 1300;
  cv.height = 760;
  g.fillStyle = '#0d1030';
  g.fillRect(0, 0, cv.width, cv.height);
  const paneY = 40;
  const paneH = 660;
  groundPane(10, paneY, cv.width - 20, paneH, S);
  const fy = paneY + paneH - 70;
  figure(spOf(PALIMPSEST, 'stand', 0, 'front'), 330, fy, S, PALIMPSEST.shadow);
  figure(spOf(PALIMPSEST, 'stand', 0, 'back'), 820, fy, S, PALIMPSEST.shadow);
  label('the Palimpsest, facing you and away', 330, paneY + paneH + 12);
  figure(KNIGHT(), 1150, fy, S, 9);
  label('the knight', 1110, paneY + paneH + 12);
  label(`The Palimpsest, standing (${S} times${WEAR.now ? `, worn ${WEAR.now}` : ''})`, 14, 10);
  show();
} else if (mode === 'close') {
  const which = parts[1] || 'stand';
  const t = Number(parts[2]) || 0;
  const S = Number(parts[3]) || 4;
  WEAR.now = Number(parts[4]) || 0;
  for (const k of (parts[5] || '').split(',')) if (k) PA_OFF[k] = true;
  const sps = (['front', 'back'] as const).map((v) => spOf(PALIMPSEST, which, t, v));
  const boxes = sps.map((sp) => {
    const c = sp.img.getContext('2d') as CanvasRenderingContext2D;
    const d = c.getImageData(0, 0, sp.img.width, sp.img.height).data;
    let x0 = sp.img.width;
    let y0 = sp.img.height;
    let x1 = 0;
    let y1 = 0;
    for (let y = 0; y < sp.img.height; y++) for (let x = 0; x < sp.img.width; x++) if (d[(y * sp.img.width + x) * 4 + 3]) { x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); }
    return [x0, y0, x1 + 1, y1 + 1];
  });
  cv.width = boxes.reduce((a, b) => a + (b[2] - b[0]) * S + 30, 10);
  cv.height = Math.max(...boxes.map((b) => (b[3] - b[1]) * S)) + 50;
  g.fillStyle = '#3a3448';
  g.fillRect(0, 0, cv.width, cv.height);
  g.imageSmoothingEnabled = false;
  let x = 10;
  sps.forEach((sp, i) => {
    const [x0, y0, x1, y1] = boxes[i];
    g.drawImage(sp.img, x0, y0, x1 - x0, y1 - y0, x, 40, (x1 - x0) * S, (y1 - y0) * S);
    x += (x1 - x0) * S + 30;
  });
  label(`The Palimpsest: ${which} at ${t.toFixed(2)} s (${S} times)`, 10, 8);
  show();
} else if (mode === 'game') {
  cv.width = 1014;
  cv.height = 468;
  groundPane(0, 0, cv.width, cv.height, 1);
  const all: [Sprite, number, number, number][] = [
    [spOf(PALIMPSEST, 'stand', 0.4, 'front'), 640, 250, PALIMPSEST.shadow],
    [KNIGHT(), 450, 330, 9],
  ];
  all.sort((a, b) => a[2] - b[2]);
  for (const [sp, x, y, sh] of all) figure(sp, x, y, 1, sh);
  label('The Palimpsest and the knight, at the game\'s size', 10, 8);
  show();
} else if (mode === 'film') {
  const which = parts[1] || 'stand';
  const S = Number(parts[2]) || 2;
  const FPS = 30;
  const mob = PALIMPSEST;
  const walkLong = mob.walkFrames / mob.walkFps;
  const move = mob.more?.[which];
  const endOf = (mv: { motion: { keys: ReadonlyArray<{ at: number }> } }): number => mv.motion.keys[mv.motion.keys.length - 1].at;
  const LONG = which === 'stand' ? (2 * mob.idleFrames) / mob.idleFps : which === 'walk' ? 3 * walkLong : 0.5 + (which === 'die' ? mob.dieTime + 1 : which === 'attack' ? endOf(mob.attack) + 0.6 : move ? endOf(move) + 0.6 : 1.2);
  const TICKS = Math.round(LONG * FPS);
  const at = (t: number, view: GameView): Sprite => {
    if (which === 'stand') return spOf(mob, 'stand', (Math.floor(t * mob.idleFps) % mob.idleFrames) / mob.idleFps, view);
    if (which === 'walk') return spOf(mob, 'walk', (Math.floor(t * mob.walkFps) % mob.walkFrames) / mob.walkFps, view);
    const m = t - 0.5;
    return m < 0 ? spOf(mob, 'stand', 0, view) : spOf(mob, which, which === 'die' ? Math.min(mob.dieTime, m) : m, view);
  };
  const paneW = 300 * S;
  const paneH = 230 * S;
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
      figure(at(t, view), px + paneW * (view === 'front' ? 0.42 : 0.58), 40 + paneH * 0.74, S, mob.shadow);
      g.restore();
      label(view === 'front' ? 'facing you' : 'facing away', px + paneW / 2 - 40, 40 + paneH + 2);
    });
    label(`The Palimpsest: ${which}`, 12, 8);
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
else if (mode === 'shots') {
  const S = 3;
  const FPS = 30;
  const LONG = 2.4;
  cv.width = 1014;
  cv.height = 640;
  const gw = Math.ceil(cv.width / S);
  const gh = Math.ceil((cv.height - 40) / S);
  const [cx, cy] = pictureOf(15, 15);
  const ox = Math.round(cx - gw / 2);
  const oy = Math.round(cy - gh / 2);
  const ground = paintTerrain(T, ox, oy, gw, gh);
  const off = document.createElement('canvas');
  off.width = gw;
  off.height = gh;
  const o = off.getContext('2d') as CanvasRenderingContext2D;
  const at = (x: number, y: number): readonly [number, number] => {
    const [px, py] = pictureOf(x, y);
    return [px - ox, py - oy];
  };
  const draw = (tick: number): void => {
    const t = tick / FPS;
    o.putImageData(new ImageData(ground.rgba, gw, gh), 0, 0);
    // the slam's splash (top left), over and over
    drawSlamSplash(o, at, 13.6, 15.0, t % (SLAM_SPLASH_FOR + 0.3));
    // its pages lying on the floor, one catching fire each round (top right)
    for (let i = 0; i < 5; i++) {
      const x = 14.9 + (i % 3) * 0.55;
      const y = 13.2 + Math.floor(i / 3) * 0.6 + (i % 2) * 0.15;
      const burning = i === Math.floor(t / 0.8) % 5;
      if (burning) drawBurningPage(o, at, x, y, i * 0.9, 40 + i, t % 0.8 * (PAGE_BURN_FOR / 0.8));
      else drawFallenPage(o, at, x, y, i * 0.9, 40 + i);
    }
    // pages crawling home to where it stands (bottom left)
    for (let i = 0; i < 4; i++) {
      const a = (i / 4) * Math.PI * 1.2 + 2.2;
      drawPageHome(o, at, 14.6 + Math.cos(a) * 1.6, 16.8 + Math.sin(a) * 1.6, 14.6, 16.8, i, 60 + i, (t + i * 0.3) % 1.0);
    }
    // paper birds diving at the hero (bottom right): each its warning ring, then the dive
    for (let i = 0; i < 3; i++) {
      const T0 = (t + i * 0.7) % 2.1;
      const tx = 16.6 + i * 0.45;
      const ty = 14.6 + (i % 2) * 0.4 + i * 0.2;
      if (T0 < BIRD_MARK_FOR) drawBirdMark(o, at, tx, ty, T0 / BIRD_MARK_FOR);
      const fly = T0 - 0.15;
      const d = Math.hypot(1.6, 1.0);
      const long = d / BIRD_SPEED;
      if (fly > 0 && fly < long) {
        const k = fly / long;
        const sx = tx - 1.6;
        const sy = ty - 1.0;
        drawLeafBird(o, at, sx + (tx - sx) * k, sy + (ty - sy) * k, 50 * (1 - k) + 2, Math.atan2(ty - sy, tx - sx), fly, i);
      } else if (fly <= 0) drawLeafBird(o, at, tx - 1.6, ty - 1.0, 52, Math.atan2(1.0, 1.6), T0, i);
    }
    g.fillStyle = '#0d1030';
    g.fillRect(0, 0, cv.width, cv.height);
    g.imageSmoothingEnabled = false;
    g.drawImage(off, 0, 40, gw * S, gh * S);
    label('The Palimpsest: its slam, its pages lying and burning, crawling home, and its birds (3 times)', 10, 8);
  };
  draw(0);
  win.__frames = Math.round(LONG * FPS);
  win.__tickMs = 1000 / FPS;
  win.__frame = (i: number): string => {
    draw(i);
    return cv.toDataURL('image/png');
  };
  show();
}
