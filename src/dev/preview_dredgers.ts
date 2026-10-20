// Dev page: THE ORDER'S DREDGERS (art/dredgers.ts, art/dredgers_moves.ts), floor 12's medium mob, on the Undercity's
// flags (art/undercity.ts), beside a Hushed watchman and the knight for size. Nothing of the game imports it.
//
//   node tools/preview.mjs src/dev/preview_dredgers.ts shots/dr_sheet.png 1300 640 sheet[:<scale>]
//   node tools/preview.mjs src/dev/preview_dredgers.ts shots/dr_game.png 1014 468 game
//   node tools/preview.mjs src/dev/preview_dredgers.ts shots/dr_close.png 1400 900 close:<move>:<seconds>:<scale>
//   node tools/page_gif.mjs src/dev/preview_dredgers.ts "film:<move>[:<scale>]" previews/dredgers/<move>.gif
//     a film facing you (left) and away (right): stand, walk, attack, net, reel, die
//   node tools/page_gif.mjs src/dev/preview_dredgers.ts "shots" previews/dredgers/net_shots.gif
//     the cast net (their second blow) flying and falling on the floor (art/dredger_shots.ts), twice the game's size

import { UC_ZONE, undercityLook } from '../art/undercity';
import { DREDGER, DR_NET, netLetGo } from '../art/dredgers_moves';
import { NET_FLIES, NET_LIES, drawNetFlying, drawNetLying, drawNetWarn, netFrom, netSpot } from '../art/dredger_shots';
import { WATCHMAN } from '../art/hushed_watch_moves';
import { ratFrame } from '../art/rats';
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

if (mode === 'sheet') {
  const S = Number(parts[1]) || 3;
  cv.width = 1300;
  cv.height = 640;
  g.fillStyle = '#0d1030';
  g.fillRect(0, 0, cv.width, cv.height);
  const paneY = 40;
  const paneH = 540;
  groundPane(10, paneY, cv.width - 20, paneH, S);
  const fy = paneY + paneH - 60;
  figure(spOf(DREDGER, 'stand', 0, 'front'), 200, fy, S, DREDGER.shadow);
  figure(spOf(DREDGER, 'stand', 0, 'back'), 520, fy, S, DREDGER.shadow);
  label('a dredger, facing you and away', 200, paneY + paneH + 12);
  figure(spOf(WATCHMAN, 'stand', 0, 'front'), 860, fy, S, WATCHMAN.shadow);
  label('a Hushed watchman', 790, paneY + paneH + 12);
  figure(KNIGHT(), 1120, fy, S, 9);
  label('the knight', 1080, paneY + paneH + 12);
  label(`The Order's dredgers, standing (${S} times)`, 14, 10);
  show();
} else if (mode === 'close') {
  const which = parts[1] || 'stand';
  const t = Number(parts[2]) || 0;
  const S = Number(parts[3]) || 4;
  const sps = (['front', 'back'] as const).map((v) => spOf(DREDGER, which, t, v));
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
  label(`A dredger: ${which} at ${t.toFixed(2)} s (${S} times)`, 10, 8);
  show();
} else if (mode === 'game') {
  // two of them with a pack of the King's rats, the knight before them, at the game's size
  cv.width = 1014;
  cv.height = 468;
  groundPane(0, 0, cv.width, cv.height, 1);
  const all: [Sprite, number, number, number][] = [
    [spOf(DREDGER, 'stand', 0.4, 'front'), 640, 210, DREDGER.shadow],
    [spOf(DREDGER, 'attack', 0.5, 'front'), 720, 270, DREDGER.shadow],
    [ratFrame('stand', 0.2, 'front'), 560, 300, 12],
    [ratFrame('walk', 0.1, 'front'), 600, 340, 12],
    [ratFrame('stand', 1.1, 'back'), 380, 350, 12],
    [KNIGHT(), 450, 310, 9],
  ];
  all.sort((a, b) => a[2] - b[2]);
  for (const [sp, x, y, sh] of all) figure(sp, x, y, 1, sh);
  label('The Order\'s dredgers with the King\'s rats, at the game\'s size', 10, 8);
  show();
} else if (mode === 'shots') {
  const mob = DREDGER;
  // the cast net thrown, flying and falling on the floor, twice the game's size
  const S = 2;
  const FPS = 30;
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
  const P2 = off.getContext('2d') as CanvasRenderingContext2D;
  P2.imageSmoothingEnabled = false;
  const gameC = document.createElement('canvas');
  gameC.width = Math.ceil(gw / 2);
  gameC.height = Math.ceil(gh / 2);
  const o = gameC.getContext('2d') as CanvasRenderingContext2D;
  const atP = (x: number, y: number): readonly [number, number] => {
    const [px, py] = pictureOf(x, y);
    return [px - ox, py - oy];
  };
  const at = (x: number, y: number): [number, number] => {
    const [px, py] = atP(x, y);
    return [px / 2, py / 2];
  };
  const put = (sp: Sprite, x: number, y: number): void => {
    const [sx, sy] = atP(x, y);
    P2.fillStyle = 'rgba(14,10,24,0.45)';
    P2.beginPath();
    P2.ellipse(sx, sy, 24, 11, 0, 0, Math.PI * 2);
    P2.fill();
    P2.drawImage(sp.img, Math.round(sx - sp.ax * 2), Math.round(sy - sp.ay * 2), sp.img.width, sp.img.height);
  };
  const X0 = 12.8;
  const Y0 = 14.4;
  const long = DR_NET.long;
  const TICKS = Math.round((0.5 + long + 0.6) * FPS);
  const [nx, ny] = netSpot(X0, Y0, 1, 0);
  const from = netFrom(X0, Y0, 1, 0, netLetGo());
  const fell = DR_NET.hit + NET_FLIES;
  const draw = (tick: number): void => {
    const t = tick / FPS;
    const m = t - 0.5;
    P2.putImageData(new ImageData(ground.rgba, gw, gh), 0, 0);
    o.clearRect(0, 0, gameC.width, gameC.height);
    const w0 = DR_NET.warn[0];
    if (m >= w0 && m < fell) drawNetWarn(o, at, nx, ny, Math.min(1, (m - w0) / (fell - w0)), m);
    if (m >= fell) drawNetLying(o, at, nx, ny, m - fell);
    P2.drawImage(gameC, 0, 0, gameC.width * 2, gameC.height * 2);
    put(m < 0 || m >= long ? spOf(mob, 'stand', 0, 'front') : spOf(mob, 'net', m, 'front'), X0, Y0);
    // (the net in the air over the floor and them: drawn after)
    o.clearRect(0, 0, gameC.width, gameC.height);
    if (m >= DR_NET.hit && m < fell) drawNetFlying(o, at, from, nx, ny, m - DR_NET.hit);
    P2.drawImage(gameC, 0, 0, gameC.width * 2, gameC.height * 2);
    g.fillStyle = '#0d1030';
    g.fillRect(0, 0, cv.width, cv.height);
    g.imageSmoothingEnabled = false;
    g.drawImage(off, 0, 40, gw * S, gh * S);
    label(`The cast net on the floor (twice the game's size): ${Math.max(0, m).toFixed(2)} s; it lies ${NET_LIES} s here`, 10, 8);
  };
  draw(0);
  win.__frames = TICKS;
  win.__tickMs = 1000 / FPS;
  win.__frame = (i: number): string => {
    draw(i);
    return cv.toDataURL('image/png');
  };
  show();
} else if (mode === 'film') {
  // facing you (left) and away (right): its stand twice round, its wade, or a move between stands
  const which = parts[1] || 'stand';
  const S = Number(parts[2]) || 2;
  const FPS = 30;
  const mob = DREDGER;
  const walkLong = mob.walkFrames / mob.walkFps;
  const moveLong = (w: string): number => {
    const mv = w === 'attack' ? mob.attack : (mob.more ?? {})[w];
    return mv ? mv.motion.keys[mv.motion.keys.length - 1].at + 0.6 : 1.2;
  };
  const LONG = which === 'stand' ? (2 * mob.idleFrames) / mob.idleFps : which === 'walk' ? 3 * walkLong : 0.5 + (which === 'die' ? mob.dieTime + 1 : moveLong(which));
  const TICKS = Math.round(LONG * FPS);
  const at = (t: number, view: GameView): Sprite => {
    if (which === 'stand') return spOf(mob, 'stand', (Math.floor(t * mob.idleFps) % mob.idleFrames) / mob.idleFps, view);
    if (which === 'walk') return spOf(mob, 'walk', (Math.floor(t * mob.walkFps) % mob.walkFrames) / mob.walkFps, view);
    const m = t - 0.5;
    return m < 0 ? spOf(mob, 'stand', 0, view) : spOf(mob, which, which === 'die' ? Math.min(mob.dieTime, m) : m, view);
  };
  const paneW = 230 * S;
  const paneH = 160 * S;
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
      figure(at(t, view), px + paneW * (view === 'front' ? 0.36 : 0.62), 40 + paneH * (view === 'front' ? 0.62 : 0.8), S, mob.shadow);
      g.restore();
      label(view === 'front' ? 'facing you' : 'facing away', px + paneW / 2 - 40, 40 + paneH + 2);
    });
    label(`The Order's dredgers: ${which}`, 12, 8);
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
