// Dev page: FLOOR 10'S BOSS, THE DROWNED EYE (art/drowned_eye.ts), for the owner to look at. Nothing of the game
// imports it.
//
//   node tools/preview.mjs src/dev/preview_drowned_eye.ts shots/eye_look.png 1014 1772 look
//     it risen in its pool on the ruin, from in front and from behind, the knight on the ring beside it at the game's
//     size; below, under the water (phase 1), torn open into its maw, and blazing (phase 3)
//   big:kind:view:scale   one of its looks large

import { spriteOf3 } from '../art/heroes3';
import { MOVES3 } from '../art/moves3';
import { P } from '../art/palette';
import { fenLook } from '../art/fen';
import { fenPieces } from '../art/floor10';
import { EYE_DEATH, EYE_EMPOWER, EYE_OBELISKS, EYE_STRUCK, EYE_SURFACE, obeliskTop, EYE_SPLASH, SPAWN_CANVAS, EYE_SPAWN, EYE_SPEW, spawnLanding, spawnPainted, BILE_CANVAS, BOLT_CANVAS, BURST_CANVAS, EYE_BILE, EYE_BITE, EYE_BOLT, EYE_BURST, EYE_CALL, EYE_GAZE, EYE_SPIT, bileLanding, bilePainted, boltPainted, burstPainted, EYE_CANVAS, EYE_HABITS, EYE_LURK, EYE_POOL, EYE_RING, EYE_SLAM, EYE_STAND, EYE_SWEEP, eyeLong, eyeLookFrame, eyePainted } from '../art/drowned_eye';
import { toSprite } from '../art/kit';
import { stage } from '../art/skin';
import { TILE3 } from '../art/new_mobs3';
import type { EyeLook } from '../art/drowned_eye';
import { pictureOf, worldOf } from '../art/terrain';
import { drawText } from '../engine/font';
import type { Sprite } from '../engine/px';
import { THEME } from '../ui/ui';
import { PW, drawAt } from './act1_stage';

const HASH = decodeURIComponent(location.hash.slice(1)) || 'look';

function label(g: CanvasRenderingContext2D, text: string, x: number, y: number): void {
  g.save();
  g.scale(2, 2);
  drawText(g, text, Math.round(x / 2), Math.round(y / 2), THEME.text, { shadow: P.ink });
  g.restore();
}
function hexA(c: string, a: number): string {
  const n = parseInt(c.slice(1), 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${a})`;
}
/** A sprite's lights, added over the picture as the game adds them, at `k` picture pixels to a game pixel. */
function litAt(g: CanvasRenderingContext2D, sp: Sprite, x: number, y: number, k = 2): void {
  g.save();
  g.globalCompositeOperation = 'lighter';
  for (const L of sp.lights ?? []) {
    const lx = x + (L.x - sp.ax) * k;
    const ly = y + (L.y - sp.ay) * k;
    const r = L.r * k;
    const gr = g.createRadialGradient(lx, ly, 1, lx, ly, r);
    gr.addColorStop(0, hexA(L.color, (L.a ?? 0.5) * 0.55));
    gr.addColorStop(1, hexA(L.color, 0));
    g.fillStyle = gr;
    g.fillRect(lx - r, ly - r, 2 * r, 2 * r);
  }
  g.restore();
}

/** THE POOL AND ITS RUIN, as the fen's ground paints them (the planning chat's shapes): the pool's middle at world (PCX, PCY). */
const PCX = 20;
const PCY = 20;
const poolDist = (x: number, y: number): number => Math.hypot((x - PCX) / (EYE_POOL.rx / TILE3), (y - PCY) / (EYE_POOL.ry / TILE3));
const ringDist = (x: number, y: number): number => Math.hypot((x - PCX) / (EYE_RING.rx / TILE3), (y - PCY) / (EYE_RING.ry / TILE3));
const LOOK = fenLook({ pool: poolDist, paved: (x, y) => ringDist(x, y) < 1 && poolDist(x, y) >= 1 });
/** The fen round the pool, `w` by `h`, with the pool's middle at (cx, cy). */
function ground(g: CanvasRenderingContext2D, x0: number, y0: number, w: number, h: number, cx: number, cy: number): void {
  const [p0x, p0y] = pictureOf(PCX, PCY);
  const img = new ImageData(w, h);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const px = Math.round(x - cx + p0x);
      const py = Math.round(y - cy + p0y);
      const [wx, wy] = worldOf(px, py);
      const paved = ringDist(wx, wy) < 1 && poolDist(wx, wy) >= 1;
      const c = paved ? LOOK.floor(wx, wy, px, py, 1) : LOOK.top(wx, wy, px, py, 1, 0);
      const o = (y * w + x) * 4;
      img.data[o] = c[0];
      img.data[o + 1] = c[1];
      img.data[o + 2] = c[2];
      img.data[o + 3] = 255;
    }
  }
  g.putImageData(img, x0, y0);
}
const knight = spriteOf3(MOVES3.rear, 0, 'front');
/** The knight on the ring, where he stands beside it. */
const KNIGHT_AT: [number, number] = [PCX - 0.6, PCY + 3.7];
/** The way to the knight from the pool's middle, as the Eye aims (degrees round from his forward toward his left): the figure's x is the world's x, its y the world's y turned back; his forward is half way between. */
const AIM_KNIGHT = (() => {
  const fx = KNIGHT_AT[0] - PCX;
  const fy = -(KNIGHT_AT[1] - PCY);
  return (Math.atan2((fx + fy) * Math.SQRT1_2, (fx - fy) * Math.SQRT1_2) * 180) / Math.PI;
})();

function panel(g: CanvasRenderingContext2D, x0: number, y0: number, w: number, h: number, cx: number, cy: number, sp: Sprite, withKnight: boolean, name: string): void {
  g.save();
  g.beginPath();
  g.rect(x0, y0, w, h);
  g.clip();
  ground(g, x0, y0, w, h, cx, cy);
  const [p0x, p0y] = pictureOf(PCX, PCY);
  const [kx, ky] = pictureOf(KNIGHT_AT[0], KNIGHT_AT[1]);
  const kAt: [number, number] = [x0 + cx + kx - p0x, y0 + cy + ky - p0y];
  // (the knight is nearer the eye than the pool's middle, so he is laid after it)
  drawAt(g, sp, x0 + cx, y0 + cy);
  litAt(g, sp, x0 + cx, y0 + cy);
  if (withKnight) {
    g.fillStyle = 'rgba(25, 18, 40, 0.35)';
    g.beginPath();
    g.ellipse(kAt[0], kAt[1], 26, 11, 0, 0, Math.PI * 2);
    g.fill();
    drawAt(g, knight, kAt[0], kAt[1]);
  }
  g.restore();
  label(g, name, x0 + 6, y0 + 4);
}

function look(): void {
  const H = 1772;
  const cvs = document.createElement('canvas');
  cvs.width = PW;
  cvs.height = H;
  const g = cvs.getContext('2d') as CanvasRenderingContext2D;
  g.imageSmoothingEnabled = false;
  g.fillStyle = '#0d1030';
  g.fillRect(0, 0, PW, H);
  panel(g, 0, 0, PW, 640, 507, 450, eyeLookFrame('risen', 'front'), true, 'The Drowned Eye, risen in his pool on the ruin\'s ring: from in front');
  panel(g, 0, 644, 505, 562, 252, 420, eyeLookFrame('risen', 'back'), true, 'from behind');
  panel(g, 509, 644, 505, 562, 252, 420, eyeLookFrame('under', 'front'), false, 'under the water (phase 1)');
  panel(g, 0, 1210, 505, 562, 252, 420, eyeLookFrame('maw', 'front'), false, 'torn open into his maw');
  panel(g, 509, 1210, 505, 562, 252, 420, eyeLookFrame('blaze', 'front'), false, 'blazing (phase 3)');
  document.body.style.margin = '0';
  document.body.style.background = '#0d1030';
  document.body.appendChild(cvs);
  (window as unknown as { __ready: boolean }).__ready = true;
}

function big(): void {
  const [, kind, view, sc] = HASH.split(':');
  const k = Number(sc ?? 2);
  const sp = eyeLookFrame((kind || 'risen') as EyeLook, (view || 'front') as 'front' | 'back');
  const W = Math.min(1600, sp.w * 2 * k + 40);
  const H = Math.min(1400, sp.h * 2 * k + 40);
  const cvs = document.createElement('canvas');
  cvs.width = W;
  cvs.height = H;
  const g = cvs.getContext('2d') as CanvasRenderingContext2D;
  g.imageSmoothingEnabled = false;
  ground(g, 0, 0, W, H, W / 2, H - 40 - (sp.h - sp.ay) * 2 * k);
  // (the ground at the game's size under a figure drawn larger: only for looking at the figure close)
  g.drawImage(sp.img, Math.round(W / 2 - sp.ax * 2 * k), Math.round(H - 40 - sp.h * 2 * k), sp.w * 2 * k, sp.h * 2 * k);
  document.body.style.margin = '0';
  document.body.appendChild(cvs);
  (window as unknown as { __ready: boolean }).__ready = true;
}

const win = window as unknown as { __ready: boolean; __frames: number; __tickMs: number; __frame: (i: number) => string };

/** A FILM of one of its moves at the game's size, from in front, on the ruin's ring, the knight on it for size: `n` frames at `fps`, `note(t)` what is happening. */
function film(which: string, title: string, fps: number, n: number, note: (t: number) => string, aim = AIM_KNIGHT): void {
  const W = PW;
  const H = 640;
  const cx = 507;
  const cy = 450;
  const cvs = document.createElement('canvas');
  cvs.width = W;
  cvs.height = H;
  const g = cvs.getContext('2d') as CanvasRenderingContext2D;
  g.imageSmoothingEnabled = false;
  const floor = document.createElement('canvas');
  floor.width = W;
  floor.height = H;
  ground(floor.getContext('2d') as CanvasRenderingContext2D, 0, 0, W, H, cx, cy);
  const [p0x, p0y] = pictureOf(PCX, PCY);
  const [kx, ky] = pictureOf(KNIGHT_AT[0], KNIGHT_AT[1]);
  const kAt: [number, number] = [cx + kx - p0x, cy + ky - p0y];
  const draw = (i: number): void => {
    const t = i / fps;
    g.drawImage(floor, 0, 0);
    const sp = toSprite(eyePainted(which, t, 'front', aim), null, EYE_CANVAS.ax, EYE_CANVAS.ay);
    drawAt(g, sp, cx, cy);
    litAt(g, sp, cx, cy);
    g.fillStyle = 'rgba(25, 18, 40, 0.35)';
    g.beginPath();
    g.ellipse(kAt[0], kAt[1], 26, 11, 0, 0, Math.PI * 2);
    g.fill();
    drawAt(g, knight, kAt[0], kAt[1]);
    label(g, title, 8, 6);
    const say = note(t);
    if (say) label(g, say, W - say.length * 12 - 16, 6);
    label(g, `${t.toFixed(2)} s`, 8, H - 28);
  };
  draw(0);
  document.body.style.margin = '0';
  document.body.style.background = '#0d1030';
  document.body.appendChild(cvs);
  win.__frames = n;
  win.__tickMs = 1000 / fps;
  win.__frame = (i: number): string => {
    draw(i);
    return cvs.toDataURL('image/png');
  };
  win.__ready = true;
}

/** THE BURSTS FILMED: under the water he lurks; four arms burst up round the knight from glowing cracks, one after another. */
/** HIS CALL: he lifts his arms to the dome, and the siege's bolts rain down round the ring, one where you stand. */
function callFilm(): void {
  const fps = EYE_BOLT.fps;
  // where they fall (world tiles from his middle) and when, after he begins his call
  const bolts: [number, number, number][] = [[2.8, 3.4, 0.35], [-4.0, 1.6, 0.5], [KNIGHT_AT[0] - PCX, KNIGHT_AT[1] - PCY, 0.65], [-2.0, -3.6, 0.8], [4.2, 0.6, 0.95], [3.5, -3.0, 1.1]];
  const long = Math.max(...bolts.map((b) => b[2])) + EYE_BOLT.long + 0.1;
  const n = Math.round(long * fps) + 1;
  const W = PW;
  const H = 640;
  const cx = 507;
  const cy = 450;
  const cvs = document.createElement('canvas');
  cvs.width = W;
  cvs.height = H;
  const g = cvs.getContext('2d') as CanvasRenderingContext2D;
  g.imageSmoothingEnabled = false;
  const floor = document.createElement('canvas');
  floor.width = W;
  floor.height = H;
  ground(floor.getContext('2d') as CanvasRenderingContext2D, 0, 0, W, H, cx, cy);
  const [p0x, p0y] = pictureOf(PCX, PCY);
  const spot = (x: number, y: number): [number, number] => {
    const [px, py] = pictureOf(x, y);
    return [cx + px - p0x, cy + py - p0y];
  };
  const draw = (i: number): void => {
    const t = i / fps;
    g.drawImage(floor, 0, 0);
    const things: [number, () => void][] = [];
    const boss = toSprite(t <= EYE_CALL.long ? eyePainted('call', t, 'front') : eyePainted('stand', t, 'front'), null, EYE_CANVAS.ax, EYE_CANVAS.ay);
    things.push([PCX + PCY, () => {
      drawAt(g, boss, cx, cy);
      litAt(g, boss, cx, cy);
    }]);
    bolts.forEach(([bx, by, t0], k) => {
      const tb = t - t0;
      if (tb < 0 || tb > EYE_BOLT.long) return;
      const sp = toSprite(boltPainted(tb, 'front', k * 5 + 1), null, BOLT_CANVAS.ax, BOLT_CANVAS.ay);
      const [sx, sy] = spot(PCX + bx, PCY + by);
      things.push([PCX + bx + PCY + by, () => {
        drawAt(g, sp, sx, sy);
        litAt(g, sp, sx, sy);
      }]);
    });
    const [kx, ky] = spot(KNIGHT_AT[0], KNIGHT_AT[1]);
    things.push([KNIGHT_AT[0] + KNIGHT_AT[1] + 0.01, () => {
      g.fillStyle = 'rgba(25, 18, 40, 0.35)';
      g.beginPath();
      g.ellipse(kx, ky, 26, 11, 0, 0, Math.PI * 2);
      g.fill();
      drawAt(g, knight, kx, ky);
    }]);
    things.sort((a, b) => a[0] - b[0]);
    for (const [, f] of things) f();
    label(g, 'The Drowned Eye: the siege\'s bolts', 8, 6);
    const say = t < EYE_CALL.raise ? 'he calls on the siege' : t < bolts[0][2] + EYE_BOLT.strike ? 'runes open where they will fall (the warning)' : t < bolts[bolts.length - 1][2] + EYE_BOLT.strike + 0.3 ? 'BOLTS' : '';
    if (say) label(g, say, W - say.length * 12 - 16, 6);
    label(g, `${t.toFixed(2)} s`, 8, H - 28);
  };
  draw(0);
  document.body.style.margin = '0';
  document.body.style.background = '#0d1030';
  document.body.appendChild(cvs);
  win.__frames = n;
  win.__tickMs = 1000 / fps;
  win.__frame = (i: number): string => {
    draw(i);
    return cvs.toDataURL('image/png');
  };
  win.__ready = true;
}

/** HIS BILE: three globs spat high over the ring, their shadows where they will land, pools of it left bubbling. */
function spitFilm(): void {
  const fps = EYE_SPIT.fps;
  const long = EYE_SPIT.long + 1.2;
  const n = Math.round(long * fps) + 1;
  const W = PW;
  const H = 640;
  const cx = 507;
  const cy = 450;
  const cvs = document.createElement('canvas');
  cvs.width = W;
  cvs.height = H;
  const g = cvs.getContext('2d') as CanvasRenderingContext2D;
  g.imageSmoothingEnabled = false;
  const floor = document.createElement('canvas');
  floor.width = W;
  floor.height = H;
  ground(floor.getContext('2d') as CanvasRenderingContext2D, 0, 0, W, H, cx, cy);
  const ST = stage('front', EYE_CANVAS.ax, EYE_CANVAS.ay, EYE_CANVAS);
  const [p0x, p0y] = pictureOf(PCX, PCY);
  const [kx0, ky0] = pictureOf(KNIGHT_AT[0], KNIGHT_AT[1]);
  const kAt: [number, number] = [cx + kx0 - p0x, cy + ky0 - p0y];
  const draw = (i: number): void => {
    const t = i / fps;
    g.drawImage(floor, 0, 0);
    // the pools, on the floor under all
    EYE_SPIT.spits.forEach((ts, k) => {
      const tp = t - (ts + EYE_SPIT.fly);
      if (tp < 0 || tp > EYE_BILE.long) return;
      const [sx, sy] = ST.at(bileLanding(AIM_KNIGHT, k));
      const sp = toSprite(bilePainted(tp, 'front', k * 3 + 2), null, BILE_CANVAS.ax, BILE_CANVAS.ay);
      drawAt(g, sp, cx + sx - EYE_CANVAS.ax, cy + sy - EYE_CANVAS.ay);
    });
    const boss = toSprite(t <= EYE_SPIT.long ? eyePainted('spit', t, 'front', AIM_KNIGHT) : eyePainted('stand', t, 'front'), null, EYE_CANVAS.ax, EYE_CANVAS.ay);
    drawAt(g, boss, cx, cy);
    litAt(g, boss, cx, cy);
    g.fillStyle = 'rgba(25, 18, 40, 0.35)';
    g.beginPath();
    g.ellipse(kAt[0], kAt[1], 26, 11, 0, 0, Math.PI * 2);
    g.fill();
    drawAt(g, knight, kAt[0], kAt[1]);
    label(g, 'The Drowned Eye: his bile', 8, 6);
    const S = EYE_SPIT;
    const say = t < S.spits[0] ? 'his maw opens, drooling (the warning)' : t < S.spits[2] + S.fly ? 'SPAT: their shadows show where they land' : t < S.long ? 'pools of it, bubbling' : 'pools of it, bubbling';
    label(g, say, W - say.length * 12 - 16, 6);
    label(g, `${t.toFixed(2)} s`, 8, H - 28);
  };
  draw(0);
  document.body.style.margin = '0';
  document.body.style.background = '#0d1030';
  document.body.appendChild(cvs);
  win.__frames = n;
  win.__tickMs = 1000 / fps;
  win.__frame = (i: number): string => {
    draw(i);
    return cvs.toDataURL('image/png');
  };
  win.__ready = true;
}

/** HIS EYESPAWN: a torrent of the fen's muck spewed across the ring, eggs tumbling out in it; they land, rock, hatch. */
function spewFilm(): void {
  const fps = EYE_SPEW.fps;
  const long = EYE_SPEW.eggs[2] + EYE_SPEW.fly + EYE_SPAWN.long + 0.1;
  const n = Math.round(long * fps) + 1;
  const W = PW;
  const H = 640;
  const cx = 507;
  const cy = 450;
  const cvs = document.createElement('canvas');
  cvs.width = W;
  cvs.height = H;
  const g = cvs.getContext('2d') as CanvasRenderingContext2D;
  g.imageSmoothingEnabled = false;
  const floor = document.createElement('canvas');
  floor.width = W;
  floor.height = H;
  ground(floor.getContext('2d') as CanvasRenderingContext2D, 0, 0, W, H, cx, cy);
  const ST = stage('front', EYE_CANVAS.ax, EYE_CANVAS.ay, EYE_CANVAS);
  const [p0x, p0y] = pictureOf(PCX, PCY);
  const [kx0, ky0] = pictureOf(KNIGHT_AT[0], KNIGHT_AT[1]);
  const kAt: [number, number] = [cx + kx0 - p0x, cy + ky0 - p0y];
  const draw = (i: number): void => {
    const t = i / fps;
    g.drawImage(floor, 0, 0);
    const boss = toSprite(t <= EYE_SPEW.long ? eyePainted('spew', t, 'front', AIM_KNIGHT) : eyePainted('stand', t, 'front'), null, EYE_CANVAS.ax, EYE_CANVAS.ay);
    drawAt(g, boss, cx, cy);
    litAt(g, boss, cx, cy);
    // the eggs, landed (in front of him, on the ring)
    EYE_SPEW.eggs.forEach((te, k) => {
      const tl = t - (te + EYE_SPEW.fly);
      if (tl < 0 || tl > EYE_SPAWN.long) return;
      const [sx, sy] = ST.at(spawnLanding(AIM_KNIGHT, k));
      const sp = toSprite(spawnPainted(tl, 'front', k * 3 + 1), null, SPAWN_CANVAS.ax, SPAWN_CANVAS.ay);
      drawAt(g, sp, cx + sx - EYE_CANVAS.ax, cy + sy - EYE_CANVAS.ay);
    });
    g.fillStyle = 'rgba(25, 18, 40, 0.35)';
    g.beginPath();
    g.ellipse(kAt[0], kAt[1], 26, 11, 0, 0, Math.PI * 2);
    g.fill();
    drawAt(g, knight, kAt[0], kAt[1]);
    label(g, 'The Drowned Eye: he spews eyespawn', 8, 6);
    const S = EYE_SPEW;
    const hatch = S.eggs[0] + S.fly + EYE_SPAWN.hatch;
    const say = t < S.spew[0] ? 'he retches (the warning)' : t < S.spew[1] + 0.3 ? 'THE MUCK, AND EGGS IN IT' : t < hatch - 0.5 ? 'the eggs rock' : t < hatch ? 'they shake (about to hatch)' : t < hatch + 0.6 ? 'THEY HATCH' : '';
    if (say) label(g, say, W - say.length * 12 - 16, 6);
    label(g, `${t.toFixed(2)} s`, 8, H - 28);
  };
  draw(0);
  document.body.style.margin = '0';
  document.body.style.background = '#0d1030';
  document.body.appendChild(cvs);
  win.__frames = n;
  win.__tickMs = 1000 / fps;
  win.__frame = (i: number): string => {
    draw(i);
    return cvs.toDataURL('image/png');
  };
  win.__ready = true;
}

/**
 * A film of him on the ring with the cult's obelisks standing round it (where EYE_OBELISKS has them): `pose(t)` paints
 * him at `t`; `note(t)` says what is happening.
 */
function ringFilm(title: string, fps: number, long: number, pose: (t: number) => ReturnType<typeof eyePainted>, note: (t: number) => string, obelisks = true): void {
  const n = Math.round(long * fps) + 1;
  const W = PW;
  const H = 640;
  const cx = 507;
  const cy = 450;
  const cvs = document.createElement('canvas');
  cvs.width = W;
  cvs.height = H;
  const g = cvs.getContext('2d') as CanvasRenderingContext2D;
  g.imageSmoothingEnabled = false;
  const floor = document.createElement('canvas');
  floor.width = W;
  floor.height = H;
  ground(floor.getContext('2d') as CanvasRenderingContext2D, 0, 0, W, H, cx, cy);
  const ST = stage('front', EYE_CANVAS.ax, EYE_CANVAS.ay, EYE_CANVAS);
  const obelisk = fenPieces().find((p) => p.name === "the cult's obelisk");
  const [p0x, p0y] = pictureOf(PCX, PCY);
  const [kx0, ky0] = pictureOf(KNIGHT_AT[0], KNIGHT_AT[1]);
  const kAt: [number, number] = [cx + kx0 - p0x, cy + ky0 - p0y];
  const draw = (i: number): void => {
    const t = i / fps;
    g.drawImage(floor, 0, 0);
    const things: [number, () => void][] = [];
    const boss = toSprite(pose(t), null, EYE_CANVAS.ax, EYE_CANVAS.ay);
    things.push([cy, () => {
      drawAt(g, boss, cx, cy);
      litAt(g, boss, cx, cy);
    }]);
    if (obelisks && obelisk) EYE_OBELISKS.forEach((_a, k) => {
      const top = obeliskTop(k);
      const [sx, sy] = ST.at([top[0], top[1], 0]);
      const at: [number, number] = [cx + sx - EYE_CANVAS.ax, cy + sy - EYE_CANVAS.ay];
      // (the one behind him stands behind him; those before him, before him)
      things.push([at[1] > cy ? at[1] + 1000 : at[1] - 1000, () => {
        const frames = obelisk.frames ?? [];
        if (frames.length) drawAt(g, frames[Math.floor(t * 6) % frames.length], at[0], at[1]);
      }]);
    });
    things.push([kAt[1] + 1000, () => {
      g.fillStyle = 'rgba(25, 18, 40, 0.35)';
      g.beginPath();
      g.ellipse(kAt[0], kAt[1], 26, 11, 0, 0, Math.PI * 2);
      g.fill();
      drawAt(g, knight, kAt[0], kAt[1]);
    }]);
    things.sort((a, b) => a[0] - b[0]);
    for (const [, f] of things) f();
    label(g, title, 8, 6);
    const say = note(t);
    if (say) label(g, say, W - say.length * 12 - 16, 6);
    label(g, `${t.toFixed(2)} s`, 8, H - 28);
  };
  draw(0);
  document.body.style.margin = '0';
  document.body.style.background = '#0d1030';
  document.body.appendChild(cvs);
  win.__frames = n;
  win.__tickMs = 1000 / fps;
  win.__frame = (i: number): string => {
    draw(i);
    return cvs.toDataURL('image/png');
  };
  win.__ready = true;
}

function burstFilm(): void {
  const fps = EYE_BURST.fps;
  const lag = 0.12;
  const n = Math.round((EYE_BURST.long + 3 * lag) * fps) + 1;
  const W = PW;
  const H = 640;
  const cx = 507;
  const cy = 450;
  const cvs = document.createElement('canvas');
  cvs.width = W;
  cvs.height = H;
  const g = cvs.getContext('2d') as CanvasRenderingContext2D;
  g.imageSmoothingEnabled = false;
  const floor = document.createElement('canvas');
  floor.width = W;
  floor.height = H;
  ground(floor.getContext('2d') as CanvasRenderingContext2D, 0, 0, W, H, cx, cy);
  const [p0x, p0y] = pictureOf(PCX, PCY);
  const spot = (x: number, y: number): [number, number] => {
    const [px, py] = pictureOf(x, y);
    return [cx + px - p0x, cy + py - p0y];
  };
  // where they burst: under him, and round him (world tiles), each a little after the last
  const bursts: [number, number, number][] = [[KNIGHT_AT[0], KNIGHT_AT[1], 0], [KNIGHT_AT[0] - 1.1, KNIGHT_AT[1] + 0.5, 1], [KNIGHT_AT[0] + 0.9, KNIGHT_AT[1] + 0.9, 2], [KNIGHT_AT[0] + 0.2, KNIGHT_AT[1] - 1.2, 3]];
  const draw = (i: number): void => {
    const t = i / fps;
    g.drawImage(floor, 0, 0);
    const boss = toSprite(eyePainted('lurk', t, 'front'), null, EYE_CANVAS.ax, EYE_CANVAS.ay);
    drawAt(g, boss, cx, cy);
    litAt(g, boss, cx, cy);
    const things: [number, () => void][] = [];
    for (const [bx, by, k] of bursts) {
      const tb = t - k * lag;
      if (tb < 0 || tb > EYE_BURST.long) continue;
      const sp = toSprite(burstPainted(tb, 'front', k * 7 + 3), null, BURST_CANVAS.ax, BURST_CANVAS.ay);
      const [sx, sy] = spot(bx, by);
      things.push([bx + by, () => {
        drawAt(g, sp, sx, sy);
        litAt(g, sp, sx, sy);
      }]);
    }
    const [kx, ky] = spot(KNIGHT_AT[0], KNIGHT_AT[1]);
    things.push([KNIGHT_AT[0] + KNIGHT_AT[1] + 0.01, () => {
      g.fillStyle = 'rgba(25, 18, 40, 0.35)';
      g.beginPath();
      g.ellipse(kx, ky, 26, 11, 0, 0, Math.PI * 2);
      g.fill();
      drawAt(g, knight, kx, ky);
    }]);
    things.sort((a, b) => a[0] - b[0]);
    for (const [, f] of things) f();
    label(g, 'The Drowned Eye: arms burst up from glowing cracks', 8, 6);
    const say = t < EYE_BURST.burst ? 'the cracks glow (the warning)' : t < EYE_BURST.burst + 3 * lag + 0.1 ? 'BURST' : t < EYE_BURST.sink[0] + 3 * lag ? 'they thrash' : 'drawn back down';
    label(g, say, W - say.length * 12 - 16, 6);
    label(g, `${t.toFixed(2)} s`, 8, H - 28);
  };
  draw(0);
  document.body.style.margin = '0';
  document.body.style.background = '#0d1030';
  document.body.appendChild(cvs);
  win.__frames = n;
  win.__tickMs = 1000 / fps;
  win.__frame = (i: number): string => {
    draw(i);
    return cvs.toDataURL('image/png');
  };
  win.__ready = true;
}

if (HASH === 'look') look();
else if (HASH === 'burstfilm') burstFilm();
else if (HASH === 'callfilm') callFilm();
else if (HASH === 'spitfilm') spitFilm();
else if (HASH === 'spewfilm') spewFilm();
else if (HASH === 'surfacefilm') {
  const S = EYE_SURFACE;
  ringFilm('The Drowned Eye: he surfaces (phase 1 to 2)', S.fps, S.long + 0.5, (t) => (t <= S.long ? eyePainted('surface', t, 'front') : eyePainted('stand', t, 'front')), (t) =>
    t < S.boil ? 'the pool boils (the warning)' : t < S.roar[0] ? 'HE RISES' : t < S.roar[1] ? 'HIS EYE TEARS OPEN: HE ROARS' : '', false);
} else if (HASH === 'empowerfilm') {
  const S = EYE_EMPOWER;
  ringFilm('The Drowned Eye: the siege pulled in (phase 2 to 3)', S.fps, S.long + 0.6, (t) => (t <= S.long ? eyePainted('empower', t, 'front') : eyePainted('stand', t, 'front', 0, 0, 1)), (t) =>
    t < S.reach[0] ? 'he calls on the siege' : t < S.blaze[1] ? 'THE OBELISKS\' LINES BEND INTO HIM' : t < S.burst + 0.5 ? 'HIS VEINS BLAZE' : 'phase 3');
} else if (HASH === 'struckfilm') {
  const S = EYE_STRUCK;
  // struck twice risen, then twice under the water
  ringFilm('The Drowned Eye: struck', S.fps, 3.2, (t) => {
    const under = t >= 1.6;
    const t0 = under ? t - 1.6 : t;
    const k = t0 < 0.8 ? 0 : 1;
    const tt = t0 - k * 0.8;
    const which = under ? (tt < S.long ? 'struckUnder' : 'lurk') : tt < S.long ? 'struck' : 'stand';
    return eyePainted(which, which === 'struck' || which === 'struckUnder' ? tt : t, 'front', k ? 30 : AIM_KNIGHT, which === 'struck' || which === 'struckUnder' ? t - tt : 0);
  }, (t) => (t < 1.6 ? 'struck, risen' : 'struck, under the water'), false);
} else if (HASH === 'deathfilm') {
  const S = EYE_DEATH;
  ringFilm('The Drowned Eye: his death', S.fps, S.long + 0.3, (t) => eyePainted('death', Math.min(t, S.long), 'front', 0, 0, 1), (t) =>
    t < S.cracks[0] ? 'struck down: his last roar' : t < S.shatter ? 'the dome cracks' : t < S.sink[0] ? 'IT SHATTERS' : t < S.sink[1] ? 'he sinks, his eye going dark' : 'gone');
}
else if (HASH === 'standfilm') film('stand', 'The Drowned Eye, risen (the game\'s size)', EYE_STAND.fps, EYE_STAND.frames, (t) => (t >= EYE_HABITS.blink[0] && t < EYE_HABITS.blink[1] ? 'blinks' : t >= EYE_HABITS.dart[0] && t < EYE_HABITS.dart[1] ? 'his eye darts' : ''));
else if (HASH === 'lurkfilm') film('lurk', 'The Drowned Eye under the water, phase 1 (the game\'s size)', EYE_LURK.fps, EYE_LURK.frames, () => '');
else if (HASH === 'slamfilm' || HASH === 'slamunderfilm') {
  const S = EYE_SLAM;
  film(HASH === 'slamfilm' ? 'slam' : 'slamUnder', `The Drowned Eye: the slam${HASH === 'slamfilm' ? '' : ', from under the water'}`, S.fps, Math.round(S.long * S.fps) + 1, (t) =>
    t < S.rear ? 'rears up out of the pool' : t < S.fall ? 'held high: its shadow falls (the warning)' : t < S.hit ? 'falls' : t < S.hit + S.freeze ? 'SLAM' : t < S.drag[0] ? 'the stones crack' : t < S.drag[1] ? 'drags back' : '');
} else if (HASH === 'sweepfilm' || HASH === 'sweepunderfilm') {
  const S = EYE_SWEEP;
  film(HASH === 'sweepfilm' ? 'sweep' : 'sweepUnder', `The Drowned Eye: the sweep${HASH === 'sweepfilm' ? '' : ', from under the water'}`, S.fps, Math.round(S.long * S.fps) + 1, (t) =>
    t < S.cock ? 'rises to one side' : t < S.sweep[0] ? 'cocked back (the warning)' : t < S.sweep[1] ? 'SWEEP' : t < S.over ? 'overshoots' : t < S.back[1] ? 'sinks back' : '');
} else if (HASH === 'bitefilm') {
  const B = EYE_BITE;
  film('bite', 'The Drowned Eye: his breath and bite', B.fps, Math.round(B.long * B.fps) + 1, (t) =>
    t < B.inhale[0] ? 'his maw tears open' : t < B.inhale[1] ? 'HE BREATHES IN (the warning, the pull)' : t < B.snap + B.hold + 0.1 ? 'THE BITE' : 'he draws back');
} else if (HASH === 'splashfilm') {
  const S = EYE_SPLASH;
  film('splash', 'The Drowned Eye: his splash', S.fps, Math.round(S.long * S.fps) + 1, (t) =>
    t < S.rise[0] ? 'he sinks, gathering' : t < S.hang[0] ? 'HE HEAVES HIMSELF UP' : t < S.hang[1] ? 'hangs there (the warning)' : t < S.crash ? 'down' : t < S.wave[1] ? 'THE WAVE: jump or dash through it' : 'he settles');
} else if (HASH === 'gazefilm') {
  const G = EYE_GAZE;
  film('gazeBack', 'The Drowned Eye: his gaze', G.fps, Math.round(G.long * G.fps) + 1, (t) =>
    t < G.gather ? 'his eye narrows, gathering (the warning)' : t < G.sweep[0] ? '' : t < G.sweep[1] ? 'HIS GAZE sweeps' : t < G.fade ? 'it dies' : 'he blinks');
} else if (HASH.startsWith('film:')) {
  const which = HASH.split(':')[1];
  film(which, `The Drowned Eye: ${which}`, 30, Math.round(eyeLong(which) * 30) + 1, () => '');
}
else if (HASH.startsWith('big')) big();
