// Dev page: FLOOR 14'S ORDERLIES (art/orderlies.ts, art/orderlies_moves.ts), on the floor of the Physician's theatre
// (art/housequiet.ts), beside a Hushed patient and the knight for size. Nothing of the game imports it.
//
//   node tools/preview.mjs src/dev/preview_orderlies.ts shots/od_sheet.png 1300 640 sheet[:<scale>]
//   node tools/preview.mjs src/dev/preview_orderlies.ts shots/od_game.png 1014 468 game
//   node tools/preview.mjs src/dev/preview_orderlies.ts shots/od_close.png 1400 900 close:<move>:<seconds>:<scale>
//   node tools/page_gif.mjs src/dev/preview_orderlies.ts "film:<move>:<scale>" previews/orderlies/<move>.gif
//     a film facing you (left) and away (right): stand, walk, attack, reel, die
//   node tools/page_gif.mjs src/dev/preview_orderlies.ts "shots" previews/orderlies/shots.gif
//     the mallet's blow on the floor (art/orderly_shots.ts), twice the game's size
//   node tools/page_gif.mjs src/dev/preview_orderlies.ts "shots:quake" previews/orderlies/quake_shots.gif
//     the quake (their second blow): its warning ring and the floor shaken out, twice the game's size

import { HQ_ZONE, houseOfQuietLook } from '../art/housequiet';
import { PATIENT_MAN } from '../art/patients_moves';
import { ORDERLY, OD_BLOW, OD_QUAKE } from '../art/orderlies_moves';
import { QUAKE_CRACKS_FOR, SLAM_CRACKS_FOR, drawMalletSlam, drawQuake, drawQuakeWarn } from '../art/orderly_shots';
import { malletOf } from '../art/orderlies';
import { skeletonAt } from '../art/new_mobs3';
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
const FLOOR = { depth: 14, seed: 14, w: W, h: H, tiles: new Uint8Array(W * H).fill(T_FLOOR), cut: new Uint8Array(W * H), variant: new Uint8Array(W * H), rooms: [], start: { x: 0, y: 0 } } as unknown as Floor;
const T = terrainOf(FLOOR, houseOfQuietLook({ floor: FLOOR, zone: () => HQ_ZONE.Theatre }));
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
function figure(sp: Sprite, fx: number, fy: number, S: number, shadow: number, flip = false): void {
  if (shadow > 0) {
    g.save();
    g.fillStyle = 'rgba(14,10,24,0.45)';
    g.beginPath();
    g.ellipse(fx, fy, shadow * S, shadow * 0.45 * S, 0, 0, Math.PI * 2);
    g.fill();
    g.restore();
  }
  g.save();
  if (flip) {
    g.translate(fx, 0);
    g.scale(-1, 1);
    g.translate(-fx, 0);
  }
  drawAura(g, sp, fx, fy, 2 * S);
  g.imageSmoothingEnabled = false;
  g.drawImage(sp.img, Math.round(fx - sp.ax * 2 * S), Math.round(fy - sp.ay * 2 * S), sp.img.width * S, sp.img.height * S);
  drawLights(g, sp, fx, fy, 2 * S);
  g.restore();
}
function label(s: string, x: number, y: number): void {
  g.save();
  g.scale(2, 2);
  drawText(g, s, x / 2, y / 2, THEME.text, { shadow: P.ink });
  g.restore();
}

const mob = ORDERLY;
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
  figure(spOf(mob, 'stand', 0, 'front'), 220, fy, S, mob.shadow);
  figure(spOf(mob, 'stand', 0, 'back'), 560, fy, S, mob.shadow);
  label('an orderly, facing you and away', 220, paneY + paneH + 12);
  figure(spOf(PATIENT_MAN, 'stand', 0, 'front'), 860, fy, S, PATIENT_MAN.shadow);
  label('a Hushed patient', 820, paneY + paneH + 12);
  figure(KNIGHT(), 1140, fy, S, 9);
  label('the knight', 1100, paneY + paneH + 12);
  label(`The Physician's orderlies, standing (${S} times)`, 14, 10);
  show();
} else if (mode === 'close') {
  const which = parts[1] || 'stand';
  const t = Number(parts[2]) || 0;
  const S = Number(parts[3]) || 4;
  const sps = [spOf(mob, which, t, 'front'), spOf(mob, which, t, 'back')];
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
  label(`The orderlies: ${which} at ${t.toFixed(2)} s (${S} times)`, 10, 8);
  show();
} else if (mode === 'game') {
  // two orderlies and two patients in the theatre, the knight before them, at the game's size
  cv.width = 1014;
  cv.height = 468;
  groundPane(0, 0, cv.width, cv.height, 1);
  const all: [Sprite, number, number, number][] = [
    [spOf(mob, 'stand', 0.4, 'front'), 640, 200, mob.shadow],
    [spOf(mob, 'attack', OD_BLOW.warn[0] + 0.1, 'front'), 560, 290, mob.shadow],
    [spOf(PATIENT_MAN, 'walk', 0.2, 'front'), 720, 280, PATIENT_MAN.shadow],
    [spOf(mob, 'walk', 0.3, 'back'), 360, 250, mob.shadow],
    [KNIGHT(), 470, 360, 9],
  ];
  all.sort((a, b) => a[2] - b[2]);
  for (const [sp, x, y, sh] of all) figure(sp, x, y, 1, sh);
  label("The Physician's orderlies, at the game's size", 10, 8);
  show();
} else if (mode === 'shots') {
  // the blow (or the quake: 'shots:quake') and where it lands on the floor, twice the game's size
  const QUAKE = parts[1] === 'quake';
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
  // (the ground and the figure in picture pixels; what they leave on the floor in the game's own pixels, two picture
  // pixels each, as the game draws it)
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
    P2.ellipse(sx, sy, 22, 10, 0, 0, Math.PI * 2);
    P2.fill();
    P2.drawImage(sp.img, Math.round(sx - sp.ax * 2), Math.round(sy - sp.ay * 2), sp.img.width, sp.img.height);
  };
  const X0 = 14.2;
  const Y0 = 14.6;
  const mvOf = QUAKE ? (mob.more ?? {}).quake : mob.attack;
  const long = mvOf.motion.keys[mvOf.motion.keys.length - 1].at;
  const TICKS = Math.round((0.5 + long + 0.5) * FPS);
  // (where the mallet's head comes down, in tiles from their feet: their left is the floor's -y, seen from in front)
  const head = malletOf(skeletonAt(mob, QUAKE ? 'quake' : 'attack', QUAKE ? OD_QUAKE.floor : OD_BLOW.floor)).head;
  const TILE = 32 / Math.sqrt(2 / 3);
  const hx = head[0] / TILE;
  const hy = -head[1] / TILE;
  const draw = (tick: number): void => {
    const t = tick / FPS;
    const m = t - 0.5;
    P2.putImageData(new ImageData(ground.rgba, gw, gh), 0, 0);
    o.clearRect(0, 0, gameC.width, gameC.height);
    if (QUAKE && m >= OD_QUAKE.warn[0] - 0.1 && m < OD_QUAKE.floor) drawQuakeWarn(o, at, X0 + hx, Y0 + hy, Math.min(1, (m - OD_QUAKE.warn[0] + 0.1) / (OD_QUAKE.floor - OD_QUAKE.warn[0] + 0.1)));
    put(m < 0 || m >= long ? spOf(mob, 'stand', 0, 'front') : spOf(mob, QUAKE ? 'quake' : 'attack', m, 'front'), X0, Y0);
    if (!QUAKE && m >= OD_BLOW.floor) drawMalletSlam(o, at, X0 + hx, Y0 + hy, m - OD_BLOW.floor);
    if (QUAKE && m >= OD_QUAKE.floor) drawQuake(o, at, X0 + hx, Y0 + hy, m - OD_QUAKE.floor);
    P2.drawImage(gameC, 0, 0, gameC.width * 2, gameC.height * 2);
    g.fillStyle = '#0d1030';
    g.fillRect(0, 0, cv.width, cv.height);
    g.imageSmoothingEnabled = false;
    g.drawImage(off, 0, 40, gw * S, gh * S);
    label(QUAKE ? `The quake on the floor (twice the game's size): ${Math.max(0, m - OD_QUAKE.floor).toFixed(2)} s of ${QUAKE_CRACKS_FOR} s` : `The mallet's blow on the floor (twice the game's size): ${Math.max(0, m - OD_BLOW.floor).toFixed(2)} s of ${SLAM_CRACKS_FOR} s`, 10, 8);
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
  const which = parts[1] || 'stand';
  const S = Number(parts[2]) || 2;
  const FPS = 30;
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
  const paneW = 260 * S;
  const paneH = 190 * S;
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
      figure(at(t, view), px + paneW * (view === 'front' ? 0.36 : 0.62), 40 + paneH * (view === 'front' ? 0.62 : 0.82), S, mob.shadow);
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
