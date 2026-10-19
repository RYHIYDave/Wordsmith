// Dev page: THE HUSHED TOWNSFOLK (art/hushed.ts), the city's small mob, on the flags of the Crier's Square
// (art/gateward.ts) at dusk, beside the knight for size. Nothing of the game imports it.
//
//   node tools/preview.mjs src/dev/preview_hushed.ts shots/hushed_sheet.png 1014 640 sheet[:<scale>]
//     the three, standing, facing you and facing away, beside the knight
//   node tools/preview.mjs src/dev/preview_hushed.ts shots/hushed_game.png 1014 468 game
//     a crowd of them as a phone shows it (the game's size), the knight before them
//   node tools/preview.mjs src/dev/preview_hushed.ts shots/hushed_pose.png 1014 640 pose:<who>:<move>:<seconds>[:<scale>]
//   node tools/page_gif.mjs src/dev/preview_hushed.ts "film:<move>[:<scale>]" previews/hushed/<move>.gif
//     a film of the three side by side (stand, walk, attack, reel, death), facing you above, away below

import { GW_ZONE, gateWardLook, gateWardPaintFloor } from '../art/gateward';
import { HUSHED_ALL, HUSHED_BAKER, HUSHED_GOODWIFE, HUSHED_PORTER } from '../art/hushed';
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
const BY: Record<string, Mob> = { porter: HUSHED_PORTER, goodwife: HUSHED_GOODWIFE, baker: HUSHED_BAKER };

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

if (mode === 'sheet' || mode === 'pose') {
  const S = Number(mode === 'sheet' ? parts[1] : parts[4]) || 3;
  const which = mode === 'pose' ? parts[2] : 'stand';
  const t = mode === 'pose' ? Number(parts[3]) : 0;
  const mobs = mode === 'pose' ? [BY[parts[1]] ?? HUSHED_PORTER] : [...HUSHED_ALL];
  cv.width = mode === 'pose' ? 1014 : 1600;
  cv.height = 640;
  g.fillStyle = '#0d1030';
  g.fillRect(0, 0, cv.width, cv.height);
  const paneY = 40;
  const paneH = 540;
  groundPane(10, paneY, cv.width - 20, paneH, S);
  const fy = paneY + paneH - 60;
  const cols = mobs.length * 2 + 1;
  const step = (cv.width - 40) / cols;
  mobs.forEach((mob, i) => {
    figure(spOf(mob, which, t, 'front'), 20 + step * (2 * i + 0.5), fy, S, mob.shadow);
    figure(spOf(mob, which, t, 'back'), 20 + step * (2 * i + 1.5), fy, S, mob.shadow);
    label(mob.name.replace('A Hushed ', ''), 20 + step * (2 * i + 0.5) - 30, paneY + paneH + 12);
  });
  figure(KNIGHT(), 20 + step * (cols - 0.5), fy, S, 9);
  label('the knight', 20 + step * (cols - 0.5) - 40, paneY + paneH + 12);
  label(mode === 'sheet' ? `The Hushed townsfolk, standing, facing you and away (${S} times)` : `${mobs[0].name}: ${which} at ${t.toFixed(2)} s (${S} times)`, 14, 10);
  show();
} else if (mode === 'game') {
  // a crowd of them at the game's size, the knight before them
  cv.width = 1014;
  cv.height = 468;
  groundPane(0, 0, cv.width, cv.height, 1);
  const crowd: [Mob, number, number, number][] = [
    [HUSHED_PORTER, 600, 170, 0.3], [HUSHED_GOODWIFE, 660, 200, 1.1], [HUSHED_BAKER, 560, 220, 2.0],
    [HUSHED_GOODWIFE, 700, 250, 0.7], [HUSHED_PORTER, 620, 280, 1.6], [HUSHED_BAKER, 740, 190, 2.4],
  ];
  const all: [Sprite, number, number, number][] = crowd.map(([mob, x, y, t]) => [spOf(mob, 'stand', t, 'front'), x, y, mob.shadow]);
  all.push([KNIGHT(), 430, 300, 9]);
  all.sort((a, b) => a[2] - b[2]);
  for (const [sp, x, y, sh] of all) figure(sp, x, y, 1, sh);
  label('The Hushed, at the game\'s size', 10, 8);
  show();
} else if (mode === 'film') {
  // the three side by side, facing you above and away below; their stand twice round, or a move between stands
  const which = parts[1] || 'stand';
  const S = Number(parts[2]) || 2;
  const FPS = 30;
  const mob0 = HUSHED_PORTER;
  const LONG = which === 'stand' ? (2 * mob0.idleFrames) / mob0.idleFps : 0.5 + (which === 'die' ? mob0.dieTime + 1 : 2.2);
  const TICKS = Math.round(LONG * FPS);
  const at = (mob: Mob, t: number, view: GameView): Sprite => {
    if (which === 'stand') return spOf(mob, 'stand', (Math.floor(t * mob.idleFps) % mob.idleFrames) / mob.idleFps, view);
    const m = t - 0.5;
    return m < 0 ? spOf(mob, 'stand', 0, view) : spOf(mob, which, which === 'die' ? Math.min(mob.dieTime, m) : m, view);
  };
  const cellW = 150 * S;
  const cellH = 120 * S;
  cv.width = cellW * 3 + 20;
  cv.height = cellH * 2 + 50;
  const draw = (tick: number): void => {
    const t = tick / FPS;
    g.fillStyle = '#0d1030';
    g.fillRect(0, 0, cv.width, cv.height);
    groundPane(10, 40, cv.width - 20, cellH * 2, S);
    HUSHED_ALL.forEach((mob, i) => {
      figure(at(mob, t, 'front'), 10 + cellW * (i + 0.5), 40 + cellH * 0.82, S, mob.shadow);
      figure(at(mob, t, 'back'), 10 + cellW * (i + 0.5), 40 + cellH * 1.82, S, mob.shadow);
    });
    label(`The Hushed townsfolk: ${which}`, 12, 8);
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
