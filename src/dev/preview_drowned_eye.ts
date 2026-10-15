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
import { BURST_CANVAS, EYE_BURST, burstPainted, EYE_CANVAS, EYE_HABITS, EYE_LURK, EYE_POOL, EYE_RING, EYE_SLAM, EYE_STAND, EYE_SWEEP, eyeLong, eyeLookFrame, eyePainted } from '../art/drowned_eye';
import { toSprite } from '../art/kit';
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
} else if (HASH.startsWith('film:')) {
  const which = HASH.split(':')[1];
  film(which, `The Drowned Eye: ${which}`, 30, Math.round(eyeLong(which) * 30) + 1, () => '');
}
else if (HASH.startsWith('big')) big();
