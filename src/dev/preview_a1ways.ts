// Dev page: FLOORS 6 TO 10, THEIR WAYS ON AND WHERE EACH NEXT FLOOR BEGINS (art/act1_ways.ts; the art chat's, 22 Oct 2026, on his
// “Yes, paint them (Recommended)”). Nothing of the game imports it. Drawn on a plain patch of the floor's ground colour, in
// game pixels, twice.
//   node tools/preview.mjs src/dev/preview_a1ways.ts shots/ways/q.png 1020 600 "still:q:y-:shut"
//     still:<floor>:<dir>:<shut|open|f<N>>   the way on, leading <dir> (x+, x-, y+, y-), shut, open or a frame of its film
//     sheet:<floor>                         the four ways round, shut above and open below
//   node tools/page_gif.mjs src/dev/preview_a1ways.ts "film:q:y-" shots/ways/q_film.gif
//     shut, the film, open; the knight standing by

import { canyonStart, canyonWay, fenStart, fenWay, ledgeStart, ledgeWay, pinewoodStart, pinewoodWay, quarryStart, quarryWay } from '../art/act1_ways';
import type { StartArt } from '../art/ways_kit';
import { gateWardWay, houseOfQuietWay, libraryWay, millraceWay, undercityWay } from '../art/act2_ways';
import { spriteOf3 } from '../art/heroes3';
import { MOVES3 } from '../art/moves3';
import { turnOf } from '../art/ways_kit';
import type { WayArt, WayDir } from '../art/ways_kit';
import type { Sprite } from '../engine/px';

const HASH = decodeURIComponent(location.hash.slice(1)) || 'still:q:y-:shut';
const [mode, floorArg = 'q', dirArg = 'y-', stateArg = 'shut'] = HASH.split(':');
const SC = 2;
const W = 510;
const H = 300;
const cv = document.createElement('canvas');
cv.width = W * SC;
cv.height = H * SC;
cv.style.display = 'block';
const g = cv.getContext('2d') as CanvasRenderingContext2D;
g.imageSmoothingEnabled = false;
function show(): void {
  document.body.style.margin = '0';
  document.body.style.background = '#000';
  document.body.appendChild(cv);
  (window as unknown as { __ready: boolean }).__ready = true;
}
const draw = (s: Sprite, x: number, y: number, flip = false): void => {
  if (!flip) g.drawImage(s.img, Math.round(x) - s.ax, Math.round(y) - s.ay, s.w, s.h);
  else {
    g.save();
    g.translate(Math.round(x), 0);
    g.scale(-1, 1);
    g.drawImage(s.img, -s.ax, Math.round(y) - s.ay, s.w, s.h);
    g.restore();
  }
};

/** Each floor's ground, two tones in a check, and its way. */
const FLOORS: Record<string, { tones: [string, string]; way: (d: WayDir) => WayArt; start?: (d: WayDir) => StartArt }> = {
  q: { tones: ['#b8b0ab', '#c4bcb5'], way: quarryWay, start: quarryStart },
  l: { tones: ['#857e8c', '#8f8896'], way: ledgeWay, start: ledgeStart },
  c: { tones: ['#cc9a74', '#d4a47e'], way: canyonWay, start: canyonStart },
  p: { tones: ['#536638', '#5c6f3e'], way: pinewoodWay, start: pinewoodStart },
  f: { tones: ['#1c2a22', '#23332a'], way: fenWay, start: fenStart },
  g: { tones: ['#554c55', '#5d5459'], way: gateWardWay },
  u: { tones: ['#3b3c46', '#45464f'], way: undercityWay },
  m: { tones: ['#6a6458', '#726c60'], way: millraceWay },
  h: { tones: ['#8a8e84', '#94988d'], way: houseOfQuietWay },
  b: { tones: ['#5a4634', '#634e3a'], way: libraryWay },
};

/** The patch of ground round (cx, cy), its tiles in a check. */
function ground(cx: number, cy: number, tones: [string, string], R = 7): void {
  for (let ty = -R; ty <= R; ty++) {
    for (let tx = -R; tx <= R; tx++) {
      const x = cx + (tx - ty) * 16;
      const y = cy + (tx + ty) * 8;
      g.fillStyle = tones[(tx + ty) & 1];
      g.beginPath();
      g.moveTo(x, y);
      g.lineTo(x + 16, y + 8);
      g.lineTo(x, y + 16);
      g.lineTo(x - 16, y + 8);
      g.closePath();
      g.fill();
    }
  }
}
/** The knight standing a tile and a half before the way, looking at it. */
function knightBy(cx: number, cy: number, d: WayDir, t: number): void {
  const T = turnOf(d);
  const p = T(-2.6, 1.2, 0);
  const x = cx + (p[0] - p[1]) * 16;
  const y = cy + (p[0] + p[1]) * 8;
  const q = T(1, 0, 0);
  const sx = q[0] - q[1];
  const sy = q[0] + q[1];
  g.save();
  g.fillStyle = 'rgba(0,0,0,0.3)';
  g.beginPath();
  g.ellipse(x, y, 8, 4, 0, 0, Math.PI * 2);
  g.fill();
  g.restore();
  draw(spriteOf3(MOVES3.rear, t, sy >= 0 ? 'front' : 'back'), x, y, sx < 0);
}
/** One way as it stands (`state`), on its ground at (cx, cy); the knight before it when it is behind him in depth. */
function scene(cx: number, cy: number, fl: string, d: WayDir, state: string, t = 0): void {
  const F = FLOORS[fl];
  ground(cx, cy, F.tones);
  const art = F.way(d);
  const knightFirst = d === 'x+' || d === 'y+';
  if (state === 'under') {
    draw(art.open.under, cx, cy);
  } else if (state === 'shut' || state === 'open') {
    const L = art[state];
    draw(L.under, cx, cy);
    if (!knightFirst) {
      draw(L.over, cx, cy);
      knightBy(cx, cy, d, t);
    } else {
      knightBy(cx, cy, d, t);
      draw(L.over, cx, cy);
    }
  } else {
    const k = Math.max(0, Math.min(art.film.frames.length - 1, Number(state.slice(1)) || 0));
    if (knightFirst) knightBy(cx, cy, d, t);
    draw(art.film.frames[k], cx, cy);
    if (!knightFirst) knightBy(cx, cy, d, t);
  }
}

g.setTransform(SC, 0, 0, SC, 0, 0);
g.fillStyle = '#1a1820';
g.fillRect(0, 0, W, H);
if (mode === 'still') {
  scene(W / 2, H / 2 + 20, floorArg, dirArg as WayDir, stateArg);
  show();
} else if (mode === 'sheet') {
  // the four ways round, shut above and open below, each its own picture side by side
  const dirs: WayDir[] = ['x+', 'x-', 'y+', 'y-'];
  cv.width = W * 4 * SC;
  cv.height = H * 2 * SC;
  g.imageSmoothingEnabled = false;
  g.setTransform(SC, 0, 0, SC, 0, 0);
  g.fillStyle = '#1a1820';
  g.fillRect(0, 0, W * 4, H * 2);
  dirs.forEach((d, i) => {
    for (const [j, st] of (['shut', 'open'] as const).entries()) {
      g.save();
      g.beginPath();
      g.rect(i * W, j * H, W, H);
      g.clip();
      scene(i * W + W / 2, j * H + H / 2 + 20, floorArg, d, st);
      g.restore();
    }
  });
  show();
} else if (mode === 'starts') {
  // where each floor begins (6 to 10's starts are floors q, l, c, p, f's own pieces), two ways round, the knight at the start
  const fls = ['q', 'l', 'c', 'p', 'f'];
  const dirs: WayDir[] = [(dirArg as WayDir) || 'y-', 'x+'];
  cv.width = W * fls.length * SC;
  cv.height = H * 2 * SC;
  g.imageSmoothingEnabled = false;
  g.setTransform(SC, 0, 0, SC, 0, 0);
  g.fillStyle = '#1a1820';
  g.fillRect(0, 0, W * fls.length, H * 2);
  fls.forEach((fl, i) => {
    dirs.forEach((d, j) => {
      const F = FLOORS[fl];
      const cx = i * W + W / 2;
      const cy = j * H + H / 2 + 40;
      g.save();
      g.beginPath();
      g.rect(i * W, j * H, W, H);
      g.clip();
      ground(cx, cy, F.tones);
      const st = F.start!(d);
      draw(st.under, cx, cy);
      const T = turnOf(d);
      const q = T(-1, 0, 0);
      const front = d === 'x+' || d === 'y+';
      const kn = (): void => draw(spriteOf3(MOVES3.rear, 0, q[0] + q[1] >= 0 ? 'front' : 'back'), cx, cy, q[0] - q[1] < 0);
      if (front) kn();
      draw(st.over, cx, cy);
      if (!front) kn();
      g.restore();
    });
  });
  show();
} else if (mode === 'film') {
  const art = FLOORS[floorArg].way(dirArg as WayDir);
  const HOLD = 20;
  const AFTER = 36;
  const N = art.film.frames.length;
  const frame = (k: number): void => {
    g.setTransform(SC, 0, 0, SC, 0, 0);
    g.fillStyle = '#1a1820';
    g.fillRect(0, 0, W, H);
    const t = k / 30;
    if (k < HOLD) scene(W / 2, H / 2 + 20, floorArg, dirArg as WayDir, 'shut', t);
    else if (k < HOLD + N) scene(W / 2, H / 2 + 20, floorArg, dirArg as WayDir, `f${k - HOLD}`, t);
    else scene(W / 2, H / 2 + 20, floorArg, dirArg as WayDir, 'open', t);
  };
  const w2 = window as unknown as { __frames: number; __tickMs: number; __frame: (k: number) => string };
  w2.__frames = HOLD + N + AFTER;
  w2.__tickMs = 1000 / 30;
  w2.__frame = (k) => {
    frame(k);
    return cv.toDataURL('image/png');
  };
  frame(0);
  show();
}
