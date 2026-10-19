// Dev page: THE MUTE WATCH HOUNDS (art/hounds.ts), on the flags of the Crier's Square (art/gateward.ts) at dusk,
// beside the knight and a Hushed watchman for size. Nothing of the game imports it.
//
//   node tools/page_gif.mjs src/dev/preview_watch.ts "film:<move>[:<scale>]" previews/watch/<move>.gif
//     a film of the two side by side (stand, walk, attack, reel, death), facing you above, away below

import { GW_ZONE, gateWardLook, gateWardPaintFloor } from '../art/gateward';
import { HUSHED_PORTER } from '../art/hushed_moves';
import { WATCHMAN, WATCH_SERGEANT } from '../art/hushed_watch_moves';
import { HOUND_DIE, HOUND_POUNCE, HOUND_STAND, HOUND_WALK, houndFrame, houndLong } from '../art/hounds';
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
const FLOOR = { depth: 11, seed: 11, w: W, h: H, tiles: new Uint8Array(W * H).fill(T_FLOOR), cut: new Uint8Array(W * H), variant: new Uint8Array(W * H), rooms: [], start: { x: 0, y: 0 } } as unknown as Floor;
const LAND = { floor: FLOOR, zone: () => GW_ZONE.Square };
const T = terrainOf(gateWardPaintFloor(LAND, 'open'), gateWardLook(LAND, 'open'));

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

//   node tools/preview.mjs src/dev/preview_hounds.ts shots/hounds_sheet.png 1700 640 sheet[:<scale>]
//   node tools/preview.mjs src/dev/preview_hounds.ts shots/hounds_game.png 1014 468 game
//   node tools/preview.mjs src/dev/preview_hounds.ts shots/hounds_close.png 1400 900 close:<move>:<seconds>:<scale>
//   node tools/page_gif.mjs src/dev/preview_hounds.ts "film:<move>[:<scale>]" previews/hounds/<move>.gif

const HF = (which: string, t: number, view: GameView): Sprite => houndFrame(which === 'die' ? 'dying' : which, t, view);
if (mode === 'sheet') {
  const S = Number(parts[1]) || 3;
  cv.width = 1700;
  cv.height = 640;
  g.fillStyle = '#0d1030';
  g.fillRect(0, 0, cv.width, cv.height);
  const paneY = 40;
  const paneH = 540;
  groundPane(10, paneY, cv.width - 20, paneH, S);
  const fy = paneY + paneH - 70;
  const step = (cv.width - 40) / 5;
  figure(HF('stand', 0, 'front'), 20 + step * 0.6, fy, S, 12);
  figure(HF('stand', 0, 'back'), 20 + step * 1.75, fy, S, 12);
  label('a mute watch hound, facing you and away', 20 + step * 0.4, paneY + paneH + 12);
  figure(spOf(WATCHMAN, 'stand', 0, 'front'), 20 + step * 3.0, fy, S, WATCHMAN.shadow);
  label('a watchman', 20 + step * 3.0 - 40, paneY + paneH + 12);
  figure(KNIGHT(), 20 + step * 4.2, fy, S, 9);
  label('the knight', 20 + step * 4.2 - 40, paneY + paneH + 12);
  label(`The mute watch hounds, standing (${S} times)`, 14, 10);
  show();
} else if (mode === 'close') {
  const which = parts[1] || 'stand';
  const t = Number(parts[2]) || 0;
  const S = Number(parts[3]) || 6;
  const sps = (['front', 'back'] as const).map((v) => HF(which, t, v));
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
  label(`A mute watch hound: ${which} at ${t.toFixed(2)} s (${S} times)`, 10, 8);
  show();
} else if (mode === 'game') {
  cv.width = 1014;
  cv.height = 468;
  groundPane(0, 0, cv.width, cv.height, 1);
  const all: [Sprite, number, number, number][] = [
    [HF('stand', 0.2, 'front'), 600, 250, 12], [HF('stand', 1.0, 'front'), 660, 290, 12], [HF('walk', 0.1, 'front'), 560, 300, 12],
    [spOf(WATCHMAN, 'stand', 0.3, 'front'), 650, 200, WATCHMAN.shadow], [spOf(WATCH_SERGEANT, 'stand', 1.3, 'front'), 720, 240, WATCH_SERGEANT.shadow],
    [spOf(HUSHED_PORTER, 'stand', 0.7, 'front'), 520, 220, HUSHED_PORTER.shadow],
  ];
  all.push([KNIGHT(), 430, 320, 9]);
  all.sort((a, b) => a[2] - b[2]);
  for (const [sp, x, y, sh] of all) figure(sp, x, y, 1, sh);
  label('The mute watch hounds with the watch, at the game\'s size', 10, 8);
  show();
} else if (mode === 'film') {
  // facing you (left) and facing away (right): its stand twice round, its lope, or a move between stands
  const which = parts[1] || 'stand';
  const S = Number(parts[2]) || 2;
  const FPS = 30;
  const LONG = which === 'stand' ? 2 * HOUND_STAND.period : which === 'walk' ? 4 * HOUND_WALK.period : 0.5 + (which === 'die' ? HOUND_DIE.long + 0.8 : houndLong(which) + 0.6);
  const TICKS = Math.round(LONG * FPS);
  const spAt = (t: number, view: GameView): Sprite => {
    if (which === 'stand') return HF('stand', (Math.floor(t * HOUND_STAND.fps) % HOUND_STAND.frames) / HOUND_STAND.fps, view);
    if (which === 'walk') return HF('walk', (Math.floor(t * HOUND_WALK.fps) % HOUND_WALK.frames) / HOUND_WALK.fps, view);
    const m = t - 0.5;
    const long = which === 'die' ? HOUND_DIE.long : houndLong(which);
    return m < 0 || (which !== 'die' && m > long) ? HF('stand', 0, view) : HF(which, Math.min(long, m), view);
  };
  const paneW = 210 * S;
  const paneH = 130 * S;
  cv.width = paneW * 2 + 30;
  cv.height = paneH + 56;
  const draw = (tick: number): void => {
    const t = tick / FPS;
    g.fillStyle = '#0d1030';
    g.fillRect(0, 0, cv.width, cv.height);
    (['front', 'back'] as const).forEach((view, j) => {
      const px = 10 + j * (paneW + 10);
      groundPane(px, 40, paneW, paneH, S);
      figure(spAt(t, view), px + paneW * 0.42, 40 + paneH * 0.72, S, 12);
      label(view === 'front' ? 'facing you' : 'facing away', px + paneW / 2 - 40, 40 + paneH + 2);
    });
    label(`A mute watch hound: ${which}`, 12, 8);
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
void HOUND_POUNCE;
