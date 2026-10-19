// WHAT THE PALIMPSEST THROWS AND LEAVES ON THE FLOOR (the art chat, 19 Oct 2026). A MOCK-UP: NOT IN THE GAME. Nothing
// of the game draws these yet: the rules (how far its slam reaches, how many pages fall and where, what the birds do to
// the hero, how a page burns) are the main chat's, and these are the pictures for them. As art/crier_shots.ts and
// art/rat_king_shots.ts: drawn in the game's own pixels, given where a point of the floor is on the screen (`at`, from
// tiles).
//
// THE PALIMPSEST (art/palimpsest.ts, art/palimpsest_moves.ts):
//   THE PULP-FIST SLAM: where its fists come down, a splash of grey pulp and torn scraps thrown out round them, the floor
//     cracked under them (`drawSlamSplash`).
//   ITS PAGES ON THE FLOOR: struck, its pages are torn off and fall about it (in its own picture they are thrown out and
//     land); the game keeps them lying there (`drawFallenPage`) for its Rewrite. A page the hero's fire touches BURNS:
//     it curls, blackens from its edges in, flames lick up off it, and it is ash (`drawBurningPage`): his doc, “Fire words
//     shine here”. In its Rewrite the pages left unburned crawl home across the floor to it (`drawPageHome`; its own
//     picture shows its last stretch, climbing onto it).
//   LOOSE LEAVES: the paper birds, flapping (`drawLeafBird`), the game's to fly from where they leave its picture to dive
//     at the hero; through their warning, a ring of the enemy's pink closing in where each will strike (`drawBirdMark`).

import { hash } from './kit';
import { FLAME } from './mkit';
import type { FloorAt } from './mob_shots';
import { EMBER } from './props';

const clamp01 = (v: number): number => (v < 0 ? 0 : v > 1 ? 1 : v);
const sm = (v: number): number => {
  const c = clamp01(v);
  return c * c * (3 - 2 * c);
};
function dotAt(g: CanvasRenderingContext2D, x: number, y: number, color: string, w = 1, h = 1): void {
  g.fillStyle = color;
  g.fillRect(Math.round(x), Math.round(y), w, h);
}
/** The pages' paper, the Order's ink, the older brown hand; the pulp; ash. */
const PAPER = ['#4a453c', '#827b6b', '#b2aa95', '#d2c9b0'];
const INK = '#1a1720';
const PULP = ['#383631', '#5e5a51', '#857f72', '#a39c8c'];
const ASH = ['#1e1c1c', '#3a3634', '#5e5854'];

/** How long the slam's splash lasts (seconds); how far it is thrown (tiles). */
export const SLAM_SPLASH_FOR = 0.7;
export const SLAM_SPLASH_REACH = 1.3;
/** How long a page takes to burn (seconds). */
export const PAGE_BURN_FOR = 0.8;
/** How fast a page crawls home (tiles a second). */
export const PAGE_HOME_SPEED = 2.2;
/** How fast a paper bird flies (tiles a second), and how long its warning ring takes to close (seconds). */
export const BIRD_SPEED = 5;
export const BIRD_MARK_FOR = 0.5;

/**
 * THE SLAM'S SPLASH where the fists came down at (x, y) (tiles), `t` seconds after: cracks run out across the floor and
 * fade; grey pulp and torn scraps thrown out round it, up and down again; a ring of slurry left that dries away.
 */
export function drawSlamSplash(g: CanvasRenderingContext2D, at: FloorAt, x: number, y: number, t: number): void {
  if (t < 0 || t >= SLAM_SPLASH_FOR) return;
  const k = t / SLAM_SPLASH_FOR;
  const was = g.globalAlpha;
  // the cracks: dark lines out from the middle, longest at first, fading
  g.globalAlpha = 0.85 * (1 - sm((k - 0.4) / 0.6));
  for (let i = 0; i < 9; i++) {
    const a = (i / 9) * Math.PI * 2 + hash(i, 1, 7301) * 0.5;
    const long = (0.55 + 0.45 * hash(i, 2, 7301)) * SLAM_SPLASH_REACH * 0.8 * sm(k * 6);
    let px = x;
    let py = y;
    for (let s = 1; s <= 8; s++) {
      const q = (s / 8) * long;
      const wob = (hash(i, s, 7302) - 0.5) * 0.12;
      const nx = x + Math.cos(a + wob) * q;
      const ny = y + Math.sin(a + wob) * q;
      const [sx0, sy0] = at(px, py);
      const [sx1, sy1] = at(nx, ny);
      const n = Math.max(1, Math.ceil(Math.hypot(sx1 - sx0, sy1 - sy0)));
      for (let j = 0; j < n; j++) dotAt(g, sx0 + ((sx1 - sx0) * j) / n, sy0 + ((sy1 - sy0) * j) / n, '#100e14');
      px = nx;
      py = ny;
    }
  }
  // the slurry, a ring of it settling round where they came down, drying away
  g.globalAlpha = 0.9 * (1 - sm((k - 0.5) / 0.5));
  for (let i = 0; i < 26; i++) {
    const a = i * 2.39996;
    const r = (0.35 + 0.5 * hash(i, 3, 7303)) * SLAM_SPLASH_REACH * sm(k * 3);
    const [sx, sy] = at(x + Math.cos(a) * r, y + Math.sin(a) * r);
    dotAt(g, sx - 1, sy, PULP[(i % 3) + 0], 3, 2);
  }
  // the throw: blobs of pulp and torn scraps thrown up and out, falling back
  g.globalAlpha = 1;
  for (let i = 0; i < 30; i++) {
    const a = i * 2.39996 + 0.4;
    const sp = 0.5 + 0.5 * hash(i, 4, 7303);
    const q = clamp01(k * (1.3 + 0.6 * hash(i, 5, 7303)));
    if (q >= 1) continue;
    const r = sp * SLAM_SPLASH_REACH * sm(q * 1.4);
    const [sx, sy] = at(x + Math.cos(a) * r, y + Math.sin(a) * r);
    const up = 30 * sp * 4 * q * (1 - q);
    const scrap = i % 4 === 0;
    dotAt(g, sx - 1, sy - up, scrap ? PAPER[3] : PULP[q < 0.5 ? 3 : 2], scrap ? 3 : 2, 2);
    if (scrap) dotAt(g, sx - 1, sy - up + 1, INK, 2, 1);
  }
  g.globalAlpha = was;
}

/** A page's four corners on the screen, lying on the floor at (x, y) (tiles), turned `turn` (radians), torn a little at each corner by `seed`. */
function pageCorners(at: FloorAt, x: number, y: number, turn: number, seed: number, size = 1): [number, number][] {
  const w = 0.17 * size;
  const h = 0.21 * size;
  const c = Math.cos(turn);
  const s = Math.sin(turn);
  return [
    [-w, -h],
    [w, -h],
    [w, h],
    [-w, h],
  ].map(([a, b], i) => {
    const j = 0.03 * (hash(seed, i, 7311) - 0.5);
    return at(x + (a + j) * c - b * s, y + (a + j) * s + b * c) as [number, number];
  });
}
/** Is (px, py) inside the four corners? */
function inside(q: [number, number][], px: number, py: number): boolean {
  let n = false;
  for (let i = 0, j = q.length - 1; i < q.length; j = i++) {
    const [xi, yi] = q[i];
    const [xj, yj] = q[j];
    if (yi > py !== yj > py && px < ((xj - xi) * (py - yi)) / (yj - yi) + xi) n = !n;
  }
  return n;
}
/** A page drawn flat on the floor, pixel by pixel: paper, its lines of writing, its edge; `burnt` 0 to 1, how far it is burnt from its edges in (black, then gone to ash). */
function page(g: CanvasRenderingContext2D, q: [number, number][], seed: number, burnt: number): void {
  const xs = q.map((p) => p[0]);
  const ys = q.map((p) => p[1]);
  const x0 = Math.floor(Math.min(...xs));
  const x1 = Math.ceil(Math.max(...xs));
  const y0 = Math.floor(Math.min(...ys));
  const y1 = Math.ceil(Math.max(...ys));
  const cx = (x0 + x1) / 2;
  const cy = (y0 + y1) / 2;
  const half = Math.max(1, Math.min(x1 - x0, y1 - y0) / 2);
  for (let y = y0; y <= y1; y++) {
    for (let x = x0; x <= x1; x++) {
      if (!inside(q, x + 0.5, y + 0.5)) continue;
      const edge = !inside(q, x + 1.5, y + 0.5) || !inside(q, x - 0.5, y + 0.5) || !inside(q, x + 0.5, y + 1.5) || !inside(q, x + 0.5, y - 0.5);
      // (how far in from its edge, 0 at the edge to 1 at its middle: it burns from its edges in)
      const deep = 1 - Math.max(Math.abs(x + 0.5 - cx), Math.abs(y + 0.5 - cy) * 1.1) / (half + 2);
      const b = burnt * 1.25 - deep * 0.9 + 0.12 * (hash(x, y, seed + 7312) - 0.5);
      if (b > 0.55) continue;
      if (b > 0.32) {
        dotAt(g, x, y, ASH[Math.floor(hash(x, y, 7313) * 3)]);
        continue;
      }
      if (b > 0.18) {
        dotAt(g, x, y, '#120e10');
        continue;
      }
      if (edge) {
        dotAt(g, x, y, y > cy ? PAPER[0] : PAPER[1]);
        continue;
      }
      const line = (y - y0) % 3 === 1 && hash(Math.floor((x - x0 + seed) / 3), y, 7314) < 0.75;
      dotAt(g, x, y, line ? INK : hash(Math.floor(x / 3), Math.floor(y / 3), seed + 7315) < 0.2 ? PAPER[1] : PAPER[2 + ((x + y) % 7 === 0 ? 1 : 0)]);
    }
  }
}

/** A PAGE TORN OFF IT, LYING ON THE FLOOR at (x, y) (tiles), turned `turn`: wet paper, its writing, a corner curled. */
export function drawFallenPage(g: CanvasRenderingContext2D, at: FloorAt, x: number, y: number, turn: number, seed: number): void {
  page(g, pageCorners(at, x, y, turn, seed), seed, 0);
}

/**
 * A PAGE BURNING where it lies, `t` seconds after the hero's fire touched it: it blackens from its edges in, flames lick
 * up off it (an honest fire's orange: the hero's fire, not the enemy's), it curls to ash, and the ash is gone by
 * PAGE_BURN_FOR. Returns false once it is gone.
 */
export function drawBurningPage(g: CanvasRenderingContext2D, at: FloorAt, x: number, y: number, turn: number, seed: number, t: number): boolean {
  if (t >= PAGE_BURN_FOR) return false;
  const k = clamp01(t / PAGE_BURN_FOR);
  const was = g.globalAlpha;
  // (the ash going at the last)
  g.globalAlpha = 1 - sm((k - 0.75) / 0.25);
  page(g, pageCorners(at, x, y, turn + k * 0.3, seed, 1 - 0.35 * k), seed, sm(k * 1.3));
  g.globalAlpha = was;
  // the flames, licking up off it: most as it catches, dying down to sparks
  const fire = Math.sin(Math.PI * clamp01(k * 1.2));
  const [sx, sy] = at(x, y);
  for (let i = 0; i < 9; i++) {
    const dx = (hash(i, 1, 7321) - 0.5) * 12;
    const life = (t * 3 + hash(i, 2, 7321)) % 1;
    const h = (4 + 6 * hash(i, 3, 7321)) * fire * (1 - life);
    for (let j = 0; j < h; j++) {
      const w = j < h * 0.4 ? 2 : 1;
      const col = j < h * 0.25 ? EMBER[4] : j < h * 0.55 ? EMBER[3] : j < h * 0.8 ? EMBER[2] : EMBER[1];
      dotAt(g, sx + dx + Math.sin(t * 20 + i + j * 0.6) * 0.8, sy - 1 - j - life * 4, col, w, 1);
    }
  }
  // sparks and a curl of smoke going up
  for (let i = 0; i < 6; i++) {
    const life = (t * 2 + i / 6) % 1;
    dotAt(g, sx + (hash(i, 4, 7322) - 0.5) * 10 + Math.sin(life * 7 + i) * 2, sy - 4 - life * 18, life < 0.5 && k < 0.7 ? EMBER[3] : ASH[2]);
  }
  return true;
}

/** A PAGE CRAWLING HOME across the floor from (x0, y0) toward it at (x1, y1) (tiles), `t` seconds after it set off, its edges lifting and dropping like a thing breathing; false once it is there. */
export function drawPageHome(g: CanvasRenderingContext2D, at: FloorAt, x0: number, y0: number, x1: number, y1: number, turn: number, seed: number, t: number): boolean {
  const d = Math.hypot(x1 - x0, y1 - y0) || 1;
  const long = d / PAGE_HOME_SPEED;
  if (t < 0 || t >= long) return false;
  const k = sm(t / long);
  const x = x0 + (x1 - x0) * k;
  const y = y0 + (y1 - y0) * k;
  const breathe = 0.75 + 0.25 * Math.abs(Math.sin(t * 14 + seed));
  page(g, pageCorners(at, x, y, turn + k * 1.2, seed, breathe), seed, 0);
  // (a faint pink at its leading edge: the enemy calling it home)
  const [sx, sy] = at(x + (x1 - x0) / d * 0.2, y + (y1 - y0) / d * 0.2);
  dotAt(g, sx - 1, sy, FLAME[1], 2, 1);
  return true;
}

/**
 * A PAPER BIRD at (x, y) (tiles), `rise` game pixels above the floor, flying along `heading` (radians on the floor), `t`
 * seconds into its flight: a folded page, its two wings beating, the enemy's pink along their edges.
 */
export function drawLeafBird(g: CanvasRenderingContext2D, at: FloorAt, x: number, y: number, rise: number, heading: number, t: number, seed: number): void {
  const [sx0, sy0] = at(x, y);
  const [hx, hy] = at(x + Math.cos(heading) * 0.3, y + Math.sin(heading) * 0.3);
  const fx = hx - sx0;
  const fy = hy - sy0;
  const fl = Math.hypot(fx, fy) || 1;
  const ux = fx / fl;
  const uy = fy / fl;
  const sx = sx0;
  const sy = sy0 - rise;
  // its shadow on the floor
  g.fillStyle = 'rgba(14,10,24,0.35)';
  g.fillRect(Math.round(sx0 - 3), Math.round(sy0), 6, 2);
  const flap = Math.sin(t * 28 + seed);
  // the wings: from its body out to either side, up or down as they beat
  for (const sgn of [-1, 1]) {
    for (let i = 1; i <= 6; i++) {
      const out = i;
      const lift = flap * i * 0.7;
      for (let j = -2; j <= 1; j++) {
        const px = sx - uy * sgn * out + ux * (j - i * 0.25);
        const py = sy + ux * sgn * out * 0.5 + uy * (j - i * 0.25) - lift;
        dotAt(g, px, py, i === 6 || j === -2 ? FLAME[2] : (i + j) % 3 === 0 ? INK : PAPER[flap * sgn > 0 ? 3 : 2]);
      }
    }
  }
  // its body, a fold of paper, its point ahead
  for (let i = -3; i <= 4; i++) dotAt(g, sx + ux * i, sy + uy * i, i === 4 ? PAPER[3] : PAPER[1], 1, 2);
}

/** THE WARNING where a bird will strike at (x, y) (tiles), `k` of the way through it: a ring of the enemy's pink closing in on the spot. */
export function drawBirdMark(g: CanvasRenderingContext2D, at: FloorAt, x: number, y: number, k: number): void {
  if (k <= 0 || k >= 1) return;
  const was = g.globalAlpha;
  const r = 0.6 * (1 - 0.7 * sm(k));
  g.globalAlpha = 0.35 + 0.55 * k;
  for (let i = 0; i < 32; i++) {
    if (i % 4 === 3) continue;
    const a = (i / 32) * Math.PI * 2;
    const [sx, sy] = at(x + Math.cos(a) * r, y + Math.sin(a) * r);
    dotAt(g, sx, sy, k > 0.6 ? FLAME[2] : FLAME[1]);
  }
  g.globalAlpha = was;
}
