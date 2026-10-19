// Dev page: FLOOR 15'S BOSS, THE CENSOR (art/censor.ts, art/censor_moves.ts), on the floor of his Reading Room
// (art/library.ts), beside a scribe of his Order and the knight for size. Nothing of the game imports it.
//
//   node tools/preview.mjs src/dev/preview_censor.ts shots/ce_sheet.png 1300 640 sheet[:<scale>]
//   node tools/preview.mjs src/dev/preview_censor.ts shots/ce_game.png 1014 468 game
//   node tools/preview.mjs src/dev/preview_censor.ts shots/ce_close.png 1400 900 close:<move>:<seconds>:<scale>
//   node tools/page_gif.mjs src/dev/preview_censor.ts "film:<move>:<scale>" previews/censor/<move>.gif
//     a film facing you (left) and away (right): stand, walk, attack, redact, strike, hush, reel, die
//   node tools/page_gif.mjs src/dev/preview_censor.ts "shots" previews/censor/shots.gif
//     what he lays on the floor (art/censor_shots.ts), twice the game's size
//   node tools/preview.mjs src/dev/preview_censor.ts shots/ce_strip.png 1400 600 strip:<move>:<t,t,...>:<scale>
//     moments of one move side by side, facing you

import { LB_ZONE, greatLibraryLook } from '../art/library';
import { SCRIBE } from '../art/scribes_moves';
import { CENSOR } from '../art/censor_moves';
import { REDACT_FOR, REDACT_WARN, ROOM_HUSH_FOR, drawRedaction, drawRoomHush, drawSlashMark, drawStrikeAim, drawStrikeLine } from '../art/censor_shots';
import type { Bar } from '../art/censor_shots';
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
const FLOOR = { depth: 15, seed: 15, w: W, h: H, tiles: new Uint8Array(W * H).fill(T_FLOOR), cut: new Uint8Array(W * H), variant: new Uint8Array(W * H), rooms: [], start: { x: 0, y: 0 } } as unknown as Floor;
const T = terrainOf(FLOOR, greatLibraryLook({ floor: FLOOR, zone: () => LB_ZONE.Reading }));

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
  figure(spOf(CENSOR, 'stand', 0, 'front'), 220, fy, S, CENSOR.shadow);
  figure(spOf(CENSOR, 'stand', 0, 'back'), 560, fy, S, CENSOR.shadow);
  label('the Censor, facing you and away', 240, paneY + paneH + 12);
  figure(spOf(SCRIBE, 'stand', 0, 'front'), 900, fy, S, SCRIBE.shadow);
  label('a scribe of his Order', 840, paneY + paneH + 12);
  figure(KNIGHT(), 1160, fy, S, 9);
  label('the knight', 1120, paneY + paneH + 12);
  label(`The Censor, standing (${S} times)`, 14, 10);
  show();
} else if (mode === 'close') {
  const which = parts[1] || 'stand';
  const t = Number(parts[2]) || 0;
  const S = Number(parts[3]) || 4;
  const sps = [spOf(CENSOR, which, t, 'front'), spOf(CENSOR, which, t, 'back')];
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
  label(`The Censor: ${which} at ${t.toFixed(2)} s (${S} times)`, 10, 8);
  show();
} else if (mode === 'game') {
  // him in his Reading Room with two of his scribes, the knight before him, at the game's size
  cv.width = 1014;
  cv.height = 468;
  groundPane(0, 0, cv.width, cv.height, 1);
  const all: [Sprite, number, number, number][] = [
    [spOf(CENSOR, 'stand', 0.4, 'front'), 560, 250, 16],
    [spOf(SCRIBE, 'stand', 0.4, 'front'), 700, 200, 8],
    [spOf(SCRIBE, 'stand', 1.2, 'front'), 780, 300, 8],
    [KNIGHT(), 450, 330, 9],
  ];
  all.sort((a, b) => a[2] - b[2]);
  for (const [sp, x, y, sh] of all) figure(sp, x, y, 1, sh);
  label('The Censor in his Reading Room, at the game\'s size', 10, 8);
  show();
} else if (mode === 'strip') {
  // moments of one move side by side, facing you (or away: a fifth part 'back')
  const which = parts[1] || 'stand';
  const ts = (parts[2] || '0').split(',').map(Number);
  const S = Number(parts[3]) || 1.5;
  const view: GameView = parts[4] === 'back' ? 'back' : 'front';
  const sps = ts.map((t) => spOf(CENSOR, which, t, view));
  const cw = Math.round(150 * S);
  cv.width = cw * ts.length + 20;
  cv.height = Math.round(250 * S) + 40;
  g.fillStyle = '#3a3448';
  g.fillRect(0, 0, cv.width, cv.height);
  g.imageSmoothingEnabled = false;
  sps.forEach((sp, i) => {
    const ox = 10 + i * cw + cw / 2;
    const oy = 30 + Math.round(190 * S);
    g.drawImage(sp.img, Math.round(ox - sp.ax * 2 * S), Math.round(oy - sp.ay * 2 * S), sp.img.width * S, sp.img.height * S);
    label(`${ts[i].toFixed(2)}`, 10 + i * cw + 4, 8);
  });
  show();
} else if (mode === 'shots') {
  const S = 2;
  const FPS = 30;
  const LONG = 6.0;
  cv.width = 1014;
  cv.height = 640;
  const gw = Math.ceil(cv.width / S);
  const gh = Math.ceil((cv.height - 40) / S);
  const [cx, cy] = pictureOf(15, 15);
  const ox = Math.round(cx - gw / 2);
  const oy = Math.round(cy - gh / 2);
  const ground = paintTerrain(T, ox, oy, gw, gh);
  // (the ground and the figures in picture pixels; what he lays on the floor in the game's own pixels, two picture
  // pixels each, as the game draws them)
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
  const at = (x: number, y: number): readonly [number, number] => {
    const [px, py] = atP(x, y);
    return [px / 2, py / 2];
  };
  const knight = KNIGHT();
  const put = (sp: Sprite, x: number, y: number): void => {
    const [sx, sy] = atP(x, y);
    P2.drawImage(sp.img, Math.round(sx - sp.ax * 2), Math.round(sy - sp.ay * 2), sp.img.width, sp.img.height);
  };
  /** Redaction's bars, in a pattern across the room: three along x, staggered. */
  const BARS: Bar[] = [
    { x: 15.6, y: 12.4, along: 0, long: 3.2, wide: 0.7 },
    { x: 17.0, y: 13.8, along: 0, long: 3.2, wide: 0.7 },
    { x: 15.6, y: 15.2, along: 0, long: 3.2, wide: 0.7 },
  ];
  const draw = (tick: number): void => {
    const t = tick / FPS;
    P2.putImageData(new ImageData(ground.rgba, gw, gh), 0, 0);
    o.clearRect(0, 0, gameC.width, gameC.height);
    // (the room's Hush, from him, every six seconds, under everything)
    drawRoomHush(o, at, 12.6, 15.6, 5, (t + 3.4) % LONG);
    // (top right) Redaction: the bars marked out, slammed down, lying, dried away; over and over
    drawRedaction(o, at, BARS, (t % (REDACT_WARN + REDACT_FOR + 0.4)) - REDACT_WARN);
    // (left) the slash's stroke before him, every 1.5 s
    drawSlashMark(o, at, 12.6, 15.6, 1, 0.15, t % 1.5);
    // (bottom) the Strike-Through: its warning toward the knight, then the line run out through him and on
    const k = t % 2.4;
    if (k < 0.8) drawStrikeAim(o, at, 12.8, 16.4, 1, 0.3, 8, k / 0.8);
    else drawStrikeLine(o, at, 12.8, 16.4, 1, 0.3, 8, k - 0.8);
    P2.drawImage(gameC, 0, 0, gameC.width * 2, gameC.height * 2);
    put(spOf(CENSOR, 'stand', (Math.floor(t * 10) % 32) / 10, 'front'), 12.6, 15.6);
    put(knight, 15.6, 17.2);
    g.fillStyle = '#0d1030';
    g.fillRect(0, 0, cv.width, cv.height);
    g.imageSmoothingEnabled = false;
    g.drawImage(off, 0, 40, gw * S, gh * S);
    label('The Censor: his slash\'s stroke, Redaction, the Strike-Through, the Hush (twice the game)', 10, 8);
  };
  void ROOM_HUSH_FOR;
  draw(Math.round(1.0 * FPS));
  win.__frames = Math.round(LONG * FPS);
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
  const mob = CENSOR;
  const walkLong = mob.walkFrames / mob.walkFps;
  const moveLong = (w: string): number => {
    const mv = w === 'attack' ? mob.attack : w === 'reel' ? mob.reel : (mob.more ?? {})[w];
    return mv ? mv.motion.keys[mv.motion.keys.length - 1].at : 1.2;
  };
  const LONG = which === 'stand' ? (2 * mob.idleFrames) / mob.idleFps : which === 'walk' ? 3 * walkLong : 0.5 + (which === 'die' ? mob.dieTime + 1 : moveLong(which) + 0.6);
  const TICKS = Math.round(LONG * FPS);
  const at = (t: number, view: GameView): Sprite => {
    if (which === 'stand') return spOf(mob, 'stand', (Math.floor(t * mob.idleFps) % mob.idleFrames) / mob.idleFps, view);
    if (which === 'walk') return spOf(mob, 'walk', (Math.floor(t * mob.walkFps) % mob.walkFrames) / mob.walkFps, view);
    const m = t - 0.5;
    return m < 0 ? spOf(mob, 'stand', 0, view) : spOf(mob, which, which === 'die' ? Math.min(mob.dieTime, m) : m, view);
  };
  const paneW = 300 * S;
  const paneH = 250 * S;
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
    label(`${mob.name}: ${which}`, 12, 8);
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
