// Dev page: FLOOR 18'S QUEEN'S GUARD, THE MIRROR DUELLISTS (art/queens_guard.ts, art/queens_guard_moves.ts, art/queens_guard_fx.ts), standing,
// from in front and from behind, beside the knight for size; a file of them at the game's size; a move close up; and the
// film of every move at the scale of a boss arena. Nothing of the game imports it. The floor is a stand-in for the Glass
// Gallery's (polished dark stone in tiles, silver seams; not the floor's own art, which is not made yet).
//   PREVIEW_TIMEOUT=200000 node tools/preview.mjs src/dev/preview_queens_guard.ts shots/qg/sheet.png 1200 620 "sheet"
//   ... "big:<move>:<t>" (front and behind, four times as big), "grid:<move>:<t>,<t>,..." (a move at several moments,
//   twice as big, front above and behind below)
//   film: node tools/queens_guard_film.mjs (window.__film: how many frames, and each drawn on asking)
import type { Sprite } from '../engine/px';
import { makeHeroArt3 } from '../art/heroes3';
import { toSprite } from '../art/kit';
import type { Painted } from '../art/kit';
import { TILE3, canvasOf, deathOfMob, paintMob } from '../art/new_mobs3';
import type { Mob } from '../art/new_mobs3';
import { QG_DIES, QG_FAN, QG_GLIDE, QG_REEL, QG_SLASH, QG_STAND, QG_STEP_IN, QG_STEP_OUT, QG_WALK, QUEENS_GUARD } from '../art/queens_guard_moves';
import { FAN_CANVAS, FAN_FX, X_CANVAS, X_FX, fanPainted, xPainted } from '../art/queens_guard_fx';
import type { GameView } from '../art/skin';

const [mode = 'sheet', a1 = 'stand', a2 = '0'] = decodeURIComponent(location.hash.slice(1)).split(':');
const cv = document.createElement('canvas');
cv.width = window.innerWidth;
cv.height = window.innerHeight;
cv.style.display = 'block';
document.body.style.margin = '0';
document.body.appendChild(cv);
const g = cv.getContext('2d') as CanvasRenderingContext2D;
g.imageSmoothingEnabled = false;

// =============================================================================================
// A STAND-IN FLOOR FOR THE GLASS GALLERY: polished dark stone in tiles (a tile 64 by 32 picture pixels), silver seams, a
// faint sheen; and the edge of a boss arena (an ellipse 17 by 20 tiles) where asked

/** Picture pixels across and down for a place on the floor (figure lengths: forward and to the left, as seen from in front). */
const onFloor = (x: number, y: number): [number, number] => [(32 / TILE3) * (x + y), (16 / TILE3) * (x - y)];
function floor(w: number, h: number, ox: number, oy: number, k: number, arena: [number, number] | null): HTMLCanvasElement {
  const W = Math.ceil(w / k);
  const H = Math.ceil(h / k);
  const c = document.createElement('canvas');
  c.width = W;
  c.height = H;
  const cg = c.getContext('2d') as CanvasRenderingContext2D;
  const img = cg.createImageData(W, H);
  const put = (i: number, col: number[]): void => {
    img.data[i] = col[0];
    img.data[i + 1] = col[1];
    img.data[i + 2] = col[2];
    img.data[i + 3] = 255;
  };
  const A = [31, 28, 43];
  const Bc = [37, 34, 51];
  const SEAM = [62, 58, 84];
  const SEAM_LIT = [92, 88, 120];
  const VEIN = [46, 42, 62];
  const RIM = [86, 80, 116];
  const OUT = [16, 14, 24];
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const sx = x - ox / k;
      const sy = y - oy / k;
      // (back to the floor: tiles along each of the two ways)
      const ti = (sx / 32 + sy / 16) / 2;
      const tj = (sx / 32 - sy / 16) / 2;
      const fi = ti - Math.floor(ti);
      const fj = tj - Math.floor(tj);
      const i = (y * W + x) * 4;
      let col = (Math.floor(ti) + Math.floor(tj)) % 2 === 0 ? A : Bc;
      // a vein through the stone here and there
      const vein = Math.sin(ti * 9.1 + tj * 3.7) + Math.sin(ti * 2.3 - tj * 7.9);
      if (Math.abs(vein - 1.2) < 0.04) col = VEIN;
      if (fi < 0.022 || fj < 0.022) col = fi < 0.022 && fj > 0.5 ? SEAM_LIT : SEAM;
      // a sheen of the glasshouse's light across the polish
      const sheen = Math.sin((sx - sy * 2) * 0.012);
      if (sheen > 0.985 && (x + y) % 2 === 0) col = [col[0] + 10, col[1] + 10, col[2] + 14];
      if (arena) {
        const e = Math.hypot(ti / arena[0], tj / arena[1]);
        if (e > 1.0 && e < 1.0 + 0.6 / Math.max(arena[0], arena[1])) col = RIM;
        else if (e >= 1.0 + 0.6 / Math.max(arena[0], arena[1])) col = (x + y) % 3 ? OUT : A;
      }
      put(i, col);
    }
  }
  cg.putImageData(img, 0, 0);
  return c;
}
function laidFloor(ox: number, oy: number, k: number, arena: [number, number] | null = null): void {
  const f = floor(cv.width, cv.height, ox, oy, k, arena);
  g.drawImage(f, 0, 0, f.width * k, f.height * k);
}

function draw(s: Sprite, x: number, y: number, k: number): void {
  const d = s.density ?? 1;
  g.drawImage(s.img, Math.round(x - s.ax * d * k), Math.round(y - s.ay * d * k), s.w * d * k, s.h * d * k);
}
const CACHE = new Map<string, Sprite>();
const spOf = (mob: Mob, which: string, t: number, view: GameView): Sprite => {
  const key = `${which}:${t.toFixed(4)}:${view}`;
  let s = CACHE.get(key);
  if (!s) {
    s = which === 'dying' ? toSprite(deathOfMob(mob, Math.min(1, t / mob.dieTime), view), null, canvasOf(mob).ax, canvasOf(mob).ay) : toSprite(paintMob(mob, which, t, view), mob.aura, canvasOf(mob).ax, canvasOf(mob).ay);
    CACHE.set(key, s);
  }
  return s;
};
const fxSprite = (p: Painted, can: { ax: number; ay: number }): Sprite => toSprite(p, null, can.ax, can.ay);
const hero = makeHeroArt3().of('warrior', { twoHanded: false });
const G = QUEENS_GUARD;
function label(text: string, x: number, y: number, size = 15, color = '#e8e4f4'): void {
  g.font = `bold ${size}px sans-serif`;
  g.fillStyle = 'rgba(8,6,14,0.75)';
  const w = g.measureText(text).width;
  g.fillRect(x - 6, y - size - 2, w + 12, size + 9);
  g.fillStyle = color;
  g.fillText(text, x, y);
}

if (mode === 'sheet') {
  // THE SHEET: the queen's guard from in front and from behind, beside the knight, three times as big; a few of them at
  // the game's size
  const K = 3;
  laidFloor(0, cv.height * 0.55, K);
  const y = cv.height - 90;
  draw(hero.front.idle[0], 80, y, K);
  draw(spOf(G, 'stand', 0, 'front'), 300, y, K);
  draw(spOf(G, 'stand', 0, 'back'), 590, y, K);
  draw(hero.back.idle[0], 790, y, K);
  // (at the game's size: one on guard, one gliding, one drawn back to slash, one throwing the fan, beside the knight)
  const x0 = 900;
  const y0 = y - 150;
  g.fillStyle = 'rgba(8,6,14,0.55)';
  g.fillRect(x0 - 20, y0 - 180, 300, 300);
  draw(hero.front.idle[0], x0 + 200, y0 + 90, 1);
  for (const [dx, dy, mv, t] of [[30, -40, 'stand', 0], [110, -60, 'walk', 0.35], [40, 40, 'attack', 0.7], [140, 30, 'fan', 0.6]] as const) draw(spOf(G, mv, t, 'front'), x0 + dx, y0 + dy, 1);
  label('The queen’s guard, floor 18 (medium): mirror duellists — from in front, from behind, beside the knight (3× size)', 14, 26);
  label('At the game’s size', x0 - 10, y0 - 158, 13);
} else if (mode === 'big') {
  const K = 4;
  laidFloor(0, cv.height * 0.5, K);
  const t = Number(a2) || 0;
  draw(spOf(G, a1, t, 'front'), cv.width * 0.3, cv.height - 140, K);
  draw(spOf(G, a1, t, 'back'), cv.width * 0.72, cv.height - 140, K);
} else if (mode === 'grid') {
  // A MOVE AT SEVERAL MOMENTS (`grid:<move>:<t>,<t>,...`), twice as big: from in front along the top, from behind below
  const K = 2;
  laidFloor(0, cv.height * 0.5, K);
  const ts = a2.split(',').map(Number);
  const w = cv.width / ts.length;
  ts.forEach((t, i) => {
    for (const [row, view] of [[0, 'front'], [1, 'back']] as const) {
      const y = (cv.height / 2) * (row + 1) - 30;
      draw(spOf(G, a1, t, view), w * (i + 0.42), y, K);
      label(`${t.toFixed(3)} s`, w * i + 8, y + 22, 12);
    }
  });
}

// =============================================================================================
// THE FILM: every move at the scale of a boss arena with the knight in it for size (left), and close up from in front and
// from behind (right); each strike again at half speed

interface Shot {
  /** What it says. */
  say: string;
  /** How long (seconds of film). */
  long: number;
  /** The move, and its own time at a moment of the film (seconds into the shot). */
  move: (s: number) => { move: string; t: number };
  /** Where they stand on the floor (figure lengths from the arena's middle, as seen from in front). */
  at: (s: number) => [number, number];
  view: GameView;
  /** What a blow leaves, if any: which, how long since it began, and where. */
  fx?: (s: number) => { which: 'x' | 'fan'; t: number; at: [number, number] } | null;
  /** Where the knight stands. */
  knight: [number, number];
  /** Where the camera looks, if not between them. */
  cam?: [number, number];
}
const T = TILE3;
const FPS = 30;
const half = (s: number, t0: number): number => t0 + Math.floor((s / 2) * FPS) / FPS;
function shots(): Shot[] {
  const out: Shot[] = [];
  const W = QG_WALK.frames / QG_WALK.fps;
  const sideOf = (view: GameView): string => (view === 'front' ? 'from in front' : 'from behind');
  // STANDING
  out.push({ say: 'On guard: a glass blade in each hand, crossed low; breathing', long: 2.0, move: (s) => ({ move: 'stand', t: s }), at: () => [-1.6 * T, 0], view: 'front', knight: [1.8 * T, 0.6 * T] });
  // THE GLIDE, toward the knight
  for (const view of ['front', 'back'] as GameView[]) {
    const start: [number, number] = view === 'front' ? [-3.4 * T, -0.4 * T] : [-0.4 * T, -3.4 * T];
    const go = (s: number): [number, number] => (view === 'front' ? [start[0] + QG_GLIDE * s * T, start[1]] : [start[0], start[1] + QG_GLIDE * s * T]);
    out.push({ say: `The glide (${QG_GLIDE} tiles/s) — ${sideOf(view)}`, long: 2.0, move: (s) => ({ move: 'walk', t: s % W }), at: go, view, knight: view === 'front' ? [1.6 * T, 0.6 * T] : [0.6 * T, 1.6 * T] });
  }
  // THE MIRROR STEP: into the glass where they stand, gone, and out of another beside the knight
  for (const view of ['front', 'back'] as GameView[]) {
    const A: [number, number] = view === 'front' ? [-3.2 * T, 0.6 * T] : [0.6 * T, -3.2 * T];
    const Bp: [number, number] = view === 'front' ? [0.4 * T, -1.2 * T] : [-1.2 * T, 0.4 * T];
    const s1 = 0.3;
    const s2 = s1 + QG_STEP_IN.long;
    const s3 = s2 + 0.3;
    const s4 = s3 + QG_STEP_OUT.long;
    out.push({
      say: `The mirror step: into the glass, and out of another beside you — ${sideOf(view)}`,
      long: s4 + 0.6,
      move: (s) => (s < s1 ? { move: 'stand', t: s } : s < s2 ? { move: 'stepIn', t: s - s1 } : s < s3 ? { move: 'stepIn', t: QG_STEP_IN.long } : s < s4 ? { move: 'stepOut', t: s - s3 } : { move: 'stand', t: s - s4 }),
      at: (s) => (s < s2 + 0.15 ? A : Bp),
      view,
      knight: view === 'front' ? [1.8 * T, 0.2 * T] : [0.2 * T, 1.8 * T],
      cam: view === 'front' ? [-0.6 * T, 0] : [0, -0.6 * T],
    });
  }
  {
    const t0 = QG_STEP_IN.strike[0] - 0.1;
    const u0 = QG_STEP_OUT.strike[0] - 0.1;
    out.push({ say: 'The mirror step at half speed: into the glass in two frames, out in two, smeared', long: 1.6, move: (s) => (s < 0.8 ? { move: 'stepIn', t: half(s, t0) } : { move: 'stepOut', t: half(s - 0.8, u0) }), at: () => [-1.6 * T, 0], view: 'front', knight: [1.8 * T, 0.6 * T] });
  }
  // THE DOUBLE SLASH, both ways, then its strikes at half speed
  for (const view of ['front', 'back'] as GameView[]) {
    const at: [number, number] = view === 'front' ? [-2 * T, 0] : [0, -2 * T];
    out.push({ say: `The double slash — an X of glass light ${QG_SLASH.from}–${QG_SLASH.reach} tiles out — ${sideOf(view)}`, long: QG_SLASH.long + 0.3, move: (s) => ({ move: 'attack', t: Math.min(QG_SLASH.long, s) }), at: () => at, view, fx: (s) => (s >= QG_SLASH.hit ? { which: 'x', t: s - QG_SLASH.hit, at } : null), knight: view === 'front' ? [0.4 * T, 0.9 * T] : [0.9 * T, 0.4 * T] });
  }
  {
    const at: [number, number] = [-2 * T, 0];
    const t0 = QG_SLASH.warn[1] - 0.16;
    out.push({ say: 'The double slash at half speed: two slashes of two frames each, smeared', long: 1.2, move: (s) => ({ move: 'attack', t: half(s, t0) }), at: () => at, view: 'front', fx: (s) => (half(s, t0) >= QG_SLASH.hit ? { which: 'x', t: half(s, t0) - QG_SLASH.hit, at } : null), knight: [0.4 * T, 0.9 * T] });
  }
  // THE SHARD FAN, both ways, then its strike at half speed
  for (const view of ['front', 'back'] as GameView[]) {
    const at: [number, number] = view === 'front' ? [-4 * T, 0] : [0, -4 * T];
    out.push({ say: `The shard fan — ${QG_FAN.count} shards, ${QG_FAN.spread}° wide, ${QG_FAN.range} tiles — ${sideOf(view)}`, long: QG_FAN.long + 0.3, move: (s) => ({ move: 'fan', t: Math.min(QG_FAN.long, s) }), at: () => at, view, fx: (s) => (s >= QG_FAN.hit ? { which: 'fan', t: s - QG_FAN.hit, at } : null), knight: view === 'front' ? [3 * T, 1.2 * T] : [1.2 * T, 3 * T], cam: view === 'front' ? [0, 0] : [0, 0] });
  }
  {
    const at: [number, number] = [-4 * T, 0];
    const t0 = QG_FAN.warn[1] - 0.16;
    out.push({ say: 'The shard fan at half speed: thrown in two frames, smeared', long: 1.2, move: (s) => ({ move: 'fan', t: half(s, t0) }), at: () => at, view: 'front', fx: (s) => (half(s, t0) >= QG_FAN.hit ? { which: 'fan', t: half(s, t0) - QG_FAN.hit, at } : null), knight: [3 * T, 1.2 * T], cam: [0, 0] });
  }
  // STRUCK, both ways
  out.push({ say: 'Struck', long: 0.8, move: (s) => ({ move: 'reel', t: Math.min(QG_REEL, s % 0.6) }), at: () => [-1.6 * T, 0], view: 'front', knight: [0.8 * T, 0.4 * T] });
  out.push({ say: 'Struck — from behind', long: 0.8, move: (s) => ({ move: 'reel', t: Math.min(QG_REEL, s % 0.6) }), at: () => [0, -1.6 * T], view: 'back', knight: [0.4 * T, 0.8 * T] });
  // THE DEATH, both ways
  for (const view of ['front', 'back'] as GameView[]) {
    out.push({ say: `Cracks race over him; the Hush leaves him; he shatters like a mirror — ${sideOf(view)}`, long: QG_DIES.long + 0.4, move: (s) => ({ move: 'dying', t: Math.min(QG_DIES.long, s) }), at: () => (view === 'front' ? [-1.6 * T, 0] : [0, -1.6 * T]), view, knight: view === 'front' ? [1.0 * T, 0.8 * T] : [0.8 * T, 1.0 * T] });
  }
  return out;
}
const SHOTS = shots();
const FRAMES = SHOTS.map((s) => Math.round(s.long * FPS));
const TOTAL = FRAMES.reduce((a, b) => a + b, 0);
function filmFrame(i: number): void {
  let k = i;
  let si = 0;
  while (si < SHOTS.length - 1 && k >= FRAMES[si]) k -= FRAMES[si++];
  const shot = SHOTS[si];
  const s = k / FPS;
  const { move, t } = shot.move(s);
  // THE ARENA: the camera on the middle of what happens
  const AW = 800;
  const K = 1.25;
  const pos = shot.at(s);
  const mid: [number, number] = shot.cam ?? [(shot.knight[0] + shot.at(0)[0]) / 2, (shot.knight[1] + shot.at(0)[1]) / 2];
  const [mx, my] = onFloor(mid[0], mid[1]);
  const ox = AW / 2 - mx * K;
  const oy = cv.height / 2 + 30 - my * K;
  g.save();
  g.beginPath();
  g.rect(0, 0, AW, cv.height);
  g.clip();
  laidFloor(ox, oy, K, [8.5, 10]);
  const scr = (p: [number, number]): [number, number] => {
    const [x, y] = onFloor(p[0], p[1]);
    return [ox + x * K, oy + y * K];
  };
  const fx = shot.fx?.(s);
  const drawFx = (): void => {
    if (!fx) return;
    const [fxX, fxY] = scr(fx.at);
    if (fx.which === 'x' && fx.t <= X_FX.long) draw(fxSprite(xPainted(fx.t, shot.view), X_CANVAS), fxX, fxY, K);
    if (fx.which === 'fan' && fx.t <= FAN_FX.long) draw(fxSprite(fanPainted(fx.t, shot.view), FAN_CANVAS), fxX, fxY, K);
  };
  if (fx?.which === 'x') drawFx();
  const [kx, ky] = scr(shot.knight);
  const [gx, gy] = scr(pos);
  const guard = spOf(G, move, t, shot.view);
  const kn = hero.front.idle[Math.floor(s * 10) % hero.front.idle.length];
  if (ky < gy) {
    draw(kn, kx, ky, K);
    draw(guard, gx, gy, K);
  } else {
    draw(guard, gx, gy, K);
    draw(kn, kx, ky, K);
  }
  // (the shards fly over everything)
  if (fx?.which === 'fan') drawFx();
  g.restore();
  // CLOSE UP: from in front above, from behind below
  g.fillStyle = '#0c0a14';
  g.fillRect(AW, 0, cv.width - AW, cv.height);
  const CK = 1.6;
  for (const [row, view] of [[0, 'front'], [1, 'back']] as const) {
    const top = row * (cv.height / 2);
    g.save();
    g.beginPath();
    g.rect(AW + 4, top + 4, cv.width - AW - 8, cv.height / 2 - 8);
    g.clip();
    laidFloor(AW, top + cv.height / 4, CK);
    const cx = AW + (cv.width - AW) * 0.42;
    const cy = top + cv.height / 2 - 30;
    draw(spOf(G, move, t, view), cx, cy, CK);
    g.restore();
    label(view === 'front' ? 'in front' : 'behind', AW + 12, top + 24, 13, '#cfc8ec');
  }
  label(shot.say, 12, 26, 16);
  const NAMES: Record<string, string> = { walk: 'glide', attack: 'double slash', fan: 'shard fan', reel: 'struck', dying: 'death', stepIn: 'into the glass', stepOut: 'out of the glass', stand: 'on guard' };
  label(`${NAMES[move] ?? move} ${t.toFixed(2)} s`, 12, cv.height - 14, 13, '#b8b2d8');
  label('arena: an ellipse 17 by 20 tiles; a tile is one floor square', AW - 410, cv.height - 14, 12, '#9c96bc');
}
(window as unknown as { __film: { count: number; draw: (i: number) => void } }).__film = { count: TOTAL, draw: filmFrame };
if (mode === 'film') filmFrame(Number(a1) || 0);
void QG_STAND;
(window as unknown as { __ready: boolean }).__ready = true;
