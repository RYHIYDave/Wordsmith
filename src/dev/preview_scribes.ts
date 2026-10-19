// Dev page: THE SILENT ORDER'S SCRIBES (art/scribes.ts), on the flags of the Crier's Square (art/gateward.ts) at
// dusk, beside the knight and one of the Hushed townsfolk for size. Nothing of the game imports it.
//
//   node tools/preview.mjs src/dev/preview_scribes.ts shots/scribes_sheet.png 1014 640 sheet[:<scale>]
//     the two, standing, facing you and facing away, beside the knight and a Hushed porter
//   node tools/preview.mjs src/dev/preview_scribes.ts shots/scribes_game.png 1014 468 game
//     a squad of them with a crowd of the townsfolk as a phone shows it (the game's size), the knight before them
//   node tools/preview.mjs src/dev/preview_scribes.ts shots/scribes_pose.png 1014 640 pose:<who>:<move>:<seconds>[:<scale>]
//   node tools/page_gif.mjs src/dev/preview_scribes.ts "film:<move>[:<scale>]" previews/scribes/<move>.gif
//     a film (stand, walk, attack, reel, die), facing you and facing away, the ink on the floor

import { GW_ZONE, gateWardLook, gateWardPaintFloor } from '../art/gateward';
import { HUSHED_BAKER, HUSHED_GOODWIFE, HUSHED_PORTER } from '../art/hushed_moves';
import { SCRIBE, SCRIBES_ALL, SC_FLICK } from '../art/scribes_moves';
import { quillOf } from '../art/scribes';
import { INK_FLIGHT, drawInkFlight, drawInkMark, drawInkSplat } from '../art/scribe_shots';
import { WATCHMAN } from '../art/hushed_watch_moves';
import { spriteOf3 } from '../art/heroes3';
import { toSprite } from '../art/kit';
import { MOVES3 } from '../art/moves3';
import { TILE3, canvasOf, deathOfMob, momentOf, paintMob } from '../art/new_mobs3';
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
const BY: Record<string, Mob> = { scribe: SCRIBE };

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
  const mobs = mode === 'pose' ? [BY[parts[1]] ?? SCRIBE] : [...SCRIBES_ALL];
  cv.width = mode === 'pose' ? 1014 : 1700;
  cv.height = 760;
  g.fillStyle = '#0d1030';
  g.fillRect(0, 0, cv.width, cv.height);
  const paneY = 40;
  const paneH = 660;
  groundPane(10, paneY, cv.width - 20, paneH, S);
  const fy = paneY + paneH - 60;
  const cols = mobs.length * 2 + 2;
  const step = (cv.width - 40) / cols;
  mobs.forEach((mob, i) => {
    figure(spOf(mob, which, t, 'front'), 20 + step * (2 * i + 0.5), fy, S, mob.shadow);
    figure(spOf(mob, which, t, 'back'), 20 + step * (2 * i + 1.5), fy, S, mob.shadow);
    label(mob.name.replace('A Hushed ', '').replace(' of the watch', ''), 20 + step * (2 * i + 0.5) - 30, paneY + paneH + 12);
  });
  figure(spOf(HUSHED_PORTER, 'stand', 0, 'front'), 20 + step * (cols - 1.5), fy, S, HUSHED_PORTER.shadow);
  label('a porter', 20 + step * (cols - 1.5) - 30, paneY + paneH + 12);
  figure(KNIGHT(), 20 + step * (cols - 0.5), fy, S, 9);
  label('the knight', 20 + step * (cols - 0.5) - 40, paneY + paneH + 12);
  label(mode === 'sheet' ? `The Silent Order's scribe, standing, facing you and away (${S} times)` : `${mobs[0].name}: ${which} at ${t.toFixed(2)} s (${S} times)`, 14, 10);
  show();
} else if (mode === 'close') {
  // one of them close up, both ways round, cut to what is painted: close:<who>:<move>:<seconds>:<scale>
  const mob = BY[parts[1]] ?? SCRIBE;
  const which = parts[2] || 'stand';
  const t = Number(parts[3]) || 0;
  const S = Number(parts[4]) || 6;
  const sps = (['front', 'back'] as const).map((v) => spOf(mob, which, t, v));
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
  const w = boxes.reduce((a, b) => a + (b[2] - b[0]) * S + 30, 10);
  const h = Math.max(...boxes.map((b) => (b[3] - b[1]) * S)) + 50;
  cv.width = w;
  cv.height = h;
  g.fillStyle = '#3a3448';
  g.fillRect(0, 0, w, h);
  g.imageSmoothingEnabled = false;
  let x = 10;
  sps.forEach((sp, i) => {
    const [x0, y0, x1, y1] = boxes[i];
    g.drawImage(sp.img, x0, y0, x1 - x0, y1 - y0, x, 40, (x1 - x0) * S, (y1 - y0) * S);
    x += (x1 - x0) * S + 30;
  });
  label(`${mob.name}: ${which} at ${t.toFixed(2)} s (${S} times)`, 10, 8);
  show();
} else if (mode === 'game') {
  // a crowd of them at the game's size, the knight before them
  cv.width = 1014;
  cv.height = 468;
  groundPane(0, 0, cv.width, cv.height, 1);
  const crowd: [Mob, number, number, number][] = [
    [SCRIBE, 640, 170, 0.3], [SCRIBE, 720, 210, 1.1], [WATCHMAN, 600, 230, 2.0],
    [HUSHED_PORTER, 540, 250, 0.7], [HUSHED_GOODWIFE, 600, 300, 1.6], [HUSHED_BAKER, 500, 300, 2.4],
  ];
  const all: [Sprite, number, number, number][] = crowd.map(([mob, x, y, t]) => [spOf(mob, 'stand', t, 'front'), x, y, mob.shadow]);
  all.push([KNIGHT(), 430, 300, 9]);
  all.sort((a, b) => a[2] - b[2]);
  for (const [sp, x, y, sh] of all) figure(sp, x, y, 1, sh);
  label('The scribes with the watch and the townsfolk, at the game\'s size', 10, 8);
  show();
} else if (mode === 'film') {
  // facing you (left) and facing away (right); their stand twice round, or a move between stands; the ink drawn on
  // the floor in the game's own pixels (art/scribe_shots.ts) as it flies and lands
  const which = parts[1] || 'stand';
  const S = Number(parts[2]) || 1.5;
  const K = 2 * S;
  const FPS = 30;
  const mob = SCRIBE;
  const LONG = which === 'stand' ? (2 * mob.idleFrames) / mob.idleFps : 0.5 + (which === 'die' ? mob.dieTime + 1 : which === 'attack' ? SC_FLICK.long + INK_FLIGHT + 1.4 : 1.6);
  const TICKS = Math.round(LONG * FPS);
  const spAt = (t: number, view: GameView): Sprite => {
    if (which === 'stand') return spOf(mob, 'stand', (Math.floor(t * mob.idleFps) % mob.idleFrames) / mob.idleFps, view);
    const m = t - 0.5;
    return m < 0 || (which !== 'die' && m > mob.attack.motion.keys[mob.attack.motion.keys.length - 1].at && which === 'attack') ? spOf(mob, 'stand', 0, view) : spOf(mob, which, which === 'die' ? Math.min(mob.dieTime, m) : m, view);
  };
  const paneW = 330 * S;
  const paneH = 220 * S;
  cv.width = paneW * 2 + 30;
  cv.height = paneH + 56;
  const ISO = (x: number, y: number): [number, number] => [(x - y) * 16, (x + y) * 8];
  const floorOf = (view: GameView, fwd: number, left: number): [number, number] => (view === 'front' ? [fwd, -left] : [-left, -fwd]);
  // (where the ink leaves the nib, and where it lands: 4.2 tiles before them)
  const flick = momentOf(mob, mob.attack, SC_FLICK.hit);
  const nib = quillOf(flick.s).nib;
  const low = document.createElement('canvas');
  const inGame = (px: number, py: number, fx0: number, fy0: number, draw: (c: CanvasRenderingContext2D) => void): void => {
    low.width = Math.ceil(paneW / K) + 2;
    low.height = Math.ceil(paneH / K) + 2;
    const c = low.getContext('2d') as CanvasRenderingContext2D;
    c.clearRect(0, 0, low.width, low.height);
    c.save();
    c.translate(Math.round((fx0 - px) / K), Math.round((fy0 - py) / K));
    draw(c);
    c.restore();
    g.save();
    g.beginPath();
    g.rect(px, py, paneW, paneH);
    g.clip();
    g.imageSmoothingEnabled = false;
    g.drawImage(low, px + (((fx0 - px) / K) % 1) * 0, py, low.width * K, low.height * K);
    g.restore();
  };
  const draw = (tick: number): void => {
    const t = tick / FPS;
    const m = t - 0.5;
    g.fillStyle = '#0d1030';
    g.fillRect(0, 0, cv.width, cv.height);
    (['front', 'back'] as const).forEach((view, j) => {
      const px = 10 + j * (paneW + 10);
      const py = 40;
      groundPane(px, py, paneW, paneH, S);
      const fx0 = px + paneW * 0.3;
      const fy0 = py + paneH * (view === 'front' ? 0.42 : 0.82);
      const [tx, ty] = floorOf(view, 4.2, 0);
      const [nx, ny] = floorOf(view, nib[0] / TILE3, nib[1] / TILE3);
      if (which === 'attack') {
        inGame(px, py, fx0, fy0, (c) => {
          if (m > 0.16 && m < SC_FLICK.hit + INK_FLIGHT) drawInkMark(c, ISO, tx, ty, Math.min(1, (m - 0.16) / (SC_FLICK.hit - 0.16)), m);
          drawInkSplat(c, ISO, tx, ty, m - SC_FLICK.hit - INK_FLIGHT);
        });
      }
      figure(spAt(t, view), fx0, fy0, S, mob.shadow);
      if (which === 'attack') inGame(px, py, fx0, fy0, (c) => drawInkFlight(c, ISO, nx, ny, nib[2] / 2, tx, ty, m - SC_FLICK.hit));
      label(view === 'front' ? 'facing you' : 'facing away', px + paneW / 2 - 40, py + paneH + 2);
    });
    label(`The Silent Order's scribe: ${which}`, 12, 8);
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
