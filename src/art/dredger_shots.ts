// WHAT THE DREDGERS' CAST NET DOES ON THE FLOOR (the art chat, 19 Oct 2026). A MOCK-UP: NOT IN THE GAME. Nothing of the
// game draws this yet: how long the net holds whoever it falls on, and what it does to them, are the main chat's; this
// is the picture for it. As art/carter_shots.ts: drawn in the game's own pixels, given where a point of the floor is
// on the screen (`at`, from tiles).
//
// THE CAST NET (their second blow, art/dredgers_moves.ts DR_NET): through its warning a ring of the enemy's pink marked
// on the floor where the net will fall, NET_REACH tiles before them, as wide as the net, a lattice of the net's mesh
// faint inside it (`drawNetWarn`); let go of, the net flies out from their hand, opening as it goes, spinning, its lead
// weights glinting pink round its edge, its shadow under it (`drawNetFlying`); it falls spread over the ring, the weights
// striking the floor in a ring of dust, and lies there, its weights' glint fading (`drawNetLying`).

import { hash } from './kit';
import { FLAME } from './mkit';
import { TILE3 } from './new_mobs3';
import type { FloorAt } from './mob_shots';
import type { V3 } from './skeleton';

const clamp01 = (v: number): number => (v < 0 ? 0 : v > 1 ? 1 : v);
const sm = (v: number): number => {
  const c = clamp01(v);
  return c * c * (3 - 2 * c);
};
function dotAt(g: CanvasRenderingContext2D, x: number, y: number, color: string, w = 1, h = 1): void {
  g.fillStyle = color;
  g.fillRect(Math.round(x), Math.round(y), w, h);
}
/** The net's tarred cord, its pale knots; its lead weights; the dust. */
const CORD = ['#2a2016', '#6a5538', '#9a845c'];
const LEAD = ['#2c2e36', '#5a5e6a', '#9a9eaa'];
const DUST = ['#8a8472', '#aaa48e', '#c6bfa8'];

/** How far before them the net falls (tiles, its middle, along the way they face); how wide it lies (tiles of radius). */
export const NET_REACH = 3.0;
export const NET_R = 0.85;
/** How long it flies, from let go to fallen (seconds); how high over a straight line its flight rises (the game's pixels). */
export const NET_FLIES = 0.5;
export const NET_ARC = 22;
/** How long it lies in this picture before it fades (seconds): how long it holds in the game is the main chat's. */
export const NET_LIES = 1.6;
/** How many lead weights round its edge. */
const WEIGHTS = 9;

/** Where the net falls, from them at (x, y) facing (fx, fy). */
export function netSpot(x: number, y: number, fx: number, fy: number): [number, number] {
  const l = Math.hypot(fx, fy) || 1;
  return [x + (fx / l) * NET_REACH, y + (fy / l) * NET_REACH];
}
/** Where it is let go of, in tiles and the game's pixels up, from them at (x, y) facing (fx, fy), given where it is then in their own forward, left and up (art/dredgers_moves.ts netLetGo). */
export function netFrom(x: number, y: number, fx: number, fy: number, p: V3): [number, number, number] {
  const l = Math.hypot(fx, fy) || 1;
  const ux = fx / l;
  const uy = fy / l;
  // (their left, seen from above, is the way they face turned a quarter round against the clock: the floor's -y, facing +x)
  return [x + (ux * p[0] + uy * p[1]) / TILE3, y + (uy * p[0] - ux * p[1]) / TILE3, p[2] / 2];
}

/** A line a pixel wide between two points of the screen. */
function line(g: CanvasRenderingContext2D, x0: number, y0: number, x1: number, y1: number, color: string): void {
  x0 = Math.round(x0);
  y0 = Math.round(y0);
  x1 = Math.round(x1);
  y1 = Math.round(y1);
  const dx = Math.abs(x1 - x0);
  const dy = -Math.abs(y1 - y0);
  const sx = x0 < x1 ? 1 : -1;
  const sy = y0 < y1 ? 1 : -1;
  let err = dx + dy;
  g.fillStyle = color;
  for (let n = 0; n < 400; n++) {
    g.fillRect(x0, y0, 1, 1);
    if (x0 === x1 && y0 === y1) break;
    const e2 = 2 * err;
    if (e2 >= dy) {
      err += dy;
      x0 += sx;
    }
    if (e2 <= dx) {
      err += dx;
      y0 += sy;
    }
  }
}
/** How far apart the net's cords are, across it (tiles, as it lies spread). */
const MESH = 0.27;
/**
 * The net's mesh on a disc of radius `r` (tiles) at (cx, cy), turned `spin` (lying, 0: its cords along the floor's
 * own lines, so that they are drawn clean), `z` (the game's pixels) over the floor: two sets of cords across one
 * another, its knots paler where they cross; and the cord round its edge.
 */
function mesh(g: CanvasRenderingContext2D, at: FloorAt, cx: number, cy: number, r: number, spin: number, z: number, color: string, knot: string | null): void {
  const c = Math.cos(spin);
  const s = Math.sin(spin);
  const to = (u: number, v: number): [number, number] => {
    const [sx, sy] = at(cx + u * c - v * s, cy + u * s + v * c);
    return [sx, sy - z];
  };
  const step = MESH * (r / NET_R);
  const n = Math.floor(r / step);
  for (let j = -n; j <= n; j++) {
    const off = j * step;
    const half = Math.sqrt(Math.max(0, r * r - off * off));
    const [ax, ay] = to(-half, off);
    const [bx, by] = to(half, off);
    line(g, ax, ay, bx, by, color);
    const [px, py] = to(off, -half);
    const [qx, qy] = to(off, half);
    line(g, px, py, qx, qy, color);
  }
  if (knot) {
    for (let i = -n; i <= n; i++) {
      for (let j = -n; j <= n; j++) {
        if ((i * step) ** 2 + (j * step) ** 2 > r * r) continue;
        const [kx, ky] = to(i * step, j * step);
        dotAt(g, kx, ky, knot);
      }
    }
  }
  for (let i = 0; i < 40; i++) {
    const a = (i / 40) * Math.PI * 2;
    const [ex, ey] = to(Math.cos(a) * r, Math.sin(a) * r);
    dotAt(g, ex, ey, color);
  }
}
/** The weights round its edge, `r` (tiles) out, turned `spin`, `z` over the floor (the weights hang `sag` lower), `lit` how pink they glint (0..1). */
function weights(g: CanvasRenderingContext2D, at: FloorAt, cx: number, cy: number, r: number, spin: number, z: number, sag: number, lit: number): void {
  for (let i = 0; i < WEIGHTS; i++) {
    const a = spin + (i / WEIGHTS) * Math.PI * 2;
    const [sx, sy] = at(cx + Math.cos(a) * r, cy + Math.sin(a) * r);
    const y = sy - z + sag;
    dotAt(g, sx - 1, y, LEAD[1], 2, 2);
    dotAt(g, sx - 1, y, lit > 0.5 ? FLAME[(i + Math.floor(spin * 3)) % 3 === 0 ? 4 : 3] : lit > 0.15 ? FLAME[2] : LEAD[2]);
  }
}

/** THE WARNING, `k` of the way through it (0 to 1), at the net's spot (x, y): a ring of the enemy's pink as wide as the net, its dashes marching round and brightening; the net's lattice faint inside it, darkening the floor. */
export function drawNetWarn(g: CanvasRenderingContext2D, at: FloorAt, x: number, y: number, k: number, t: number): void {
  if (k <= 0 || k > 1) return;
  const was = g.globalAlpha;
  const shown = sm(k / 0.3);
  g.globalAlpha = was * 0.32 * shown;
  mesh(g, at, x, y, NET_R * 0.97, 0, 0, '#1a1016', null);
  const n = 44;
  for (let j = 0; j < n; j++) {
    if ((Math.floor(j / 2 + t * 10) & 1) === 0) continue;
    const a = (j / n) * Math.PI * 2;
    const [sx, sy] = at(x + Math.cos(a) * NET_R, y + Math.sin(a) * NET_R);
    g.globalAlpha = was * shown * (0.45 + 0.55 * k);
    dotAt(g, sx, sy, k > 0.75 ? FLAME[3] : FLAME[2], 2, 1);
  }
  g.globalAlpha = was;
}

/**
 * THE NET IN FLIGHT, `t` seconds after it is let go of (0 to NET_FLIES): from `from` (tiles, and the game's pixels up)
 * to its spot (x, y), rising in an arc and coming down; opening from a ball to its whole width as it goes, spinning,
 * its weights flung out round its edge, glinting; its shadow under it on the floor, growing as it comes down.
 */
export function drawNetFlying(g: CanvasRenderingContext2D, at: FloorAt, from: readonly [number, number, number], x: number, y: number, t: number): void {
  if (t < 0 || t >= NET_FLIES) return;
  const k = t / NET_FLIES;
  const cx = from[0] + (x - from[0]) * k;
  const cy = from[1] + (y - from[1]) * k;
  const z = from[2] * (1 - k) + 4 * NET_ARC * k * (1 - k);
  const r = 0.08 + (NET_R - 0.08) * sm(k / 0.85);
  // (spinning as it flies, and come round to lie square as it falls)
  const spin = (Math.PI / 2) * 1.5 * (1 - k) * (1 - k);
  const was = g.globalAlpha;
  // its shadow on the floor
  g.globalAlpha = was * (0.2 + 0.35 * k);
  for (let i = 0; i < 24; i++) {
    const a = i * 2.39996;
    const q = Math.sqrt((i + 0.5) / 24) * r;
    const [sx, sy] = at(cx + Math.cos(a) * q, cy + Math.sin(a) * q);
    dotAt(g, sx - 1, sy, '#0a0810', 3, 1);
  }
  g.globalAlpha = was;
  if (r < 0.2) {
    // (still balled up: a knot of cord, the weights round it)
    const [sx, sy] = at(cx, cy);
    dotAt(g, sx - 2, sy - z - 2, CORD[0], 5, 4);
    dotAt(g, sx - 1, sy - z - 2, CORD[1], 3, 2);
    dotAt(g, sx, sy - z - 2, CORD[2]);
  } else {
    // (opening: the cords drawn in from the edge to its middle, the mesh across it, its middle a little higher)
    const [mx, my] = at(cx, cy);
    for (let i = 0; i < WEIGHTS; i++) {
      const a = spin + (i / WEIGHTS) * Math.PI * 2;
      for (let j = 1; j < 5; j++) {
        const u = j / 5;
        const [sx, sy] = at(cx + Math.cos(a) * r * u, cy + Math.sin(a) * r * u);
        dotAt(g, sx, sy - z - 2 * (1 - u), CORD[0]);
      }
    }
    mesh(g, at, cx, cy, r, spin, z, CORD[1], CORD[2]);
    dotAt(g, mx - 1, my - z - 2, CORD[2], 2, 1);
  }
  weights(g, at, cx, cy, Math.max(0.12, r), spin, z, 1 + 2 * (1 - k), 1);
  g.globalAlpha = was;
}

/**
 * THE NET FALLEN, `t` seconds after (0 to NET_LIES + 0.3), spread over its spot (x, y): its weights striking the floor
 * in a ring of dust, flashing pink; then lying, its mesh dark on the floor, its weights' glint going out; fading at the end.
 */
export function drawNetLying(g: CanvasRenderingContext2D, at: FloorAt, x: number, y: number, t: number): void {
  if (t < 0 || t >= NET_LIES + 0.3) return;
  const was = g.globalAlpha;
  const fade = 1 - sm((t - NET_LIES) / 0.3);
  const spin = 0;
  // (it settles: its middle sagging down onto the floor after the weights)
  const z = 2 * (1 - sm(t / 0.12));
  g.globalAlpha = was * fade;
  mesh(g, at, x, y, NET_R, spin, z, CORD[1], CORD[2]);
  weights(g, at, x, y, NET_R, spin, 0, 0, 1 - sm(t / 0.6));
  // the dust the weights strike up, in a ring round its edge, settling
  if (t < 0.5) {
    const q = t / 0.5;
    for (let i = 0; i < 30; i++) {
      const a = (i / 30) * Math.PI * 2 + hash(i, 1, 8211) * 0.2;
      const r = NET_R * (1 + 0.25 * sm(q * 1.4) * (0.5 + hash(i, 2, 8211)));
      if (hash(i, Math.floor(t * 20), 8212) < q * 0.8) continue;
      const [sx, sy] = at(x + Math.cos(a) * r, y + Math.sin(a) * r);
      g.globalAlpha = was * 0.85 * (1 - q);
      dotAt(g, sx, sy - 1 - 3 * Math.sin(Math.PI * q), DUST[i % 3]);
    }
  }
  // and a flash of pink off each weight as it strikes
  if (t < 0.18) {
    g.globalAlpha = was * (1 - t / 0.18);
    for (let i = 0; i < WEIGHTS; i++) {
      const a = spin + (i / WEIGHTS) * Math.PI * 2;
      const [sx, sy] = at(x + Math.cos(a) * NET_R, y + Math.sin(a) * NET_R);
      dotAt(g, sx - 1, sy - 2 - 6 * (t / 0.18), FLAME[4], 1, 1);
      dotAt(g, sx + 1, sy - 1 - 4 * (t / 0.18), FLAME[3], 1, 1);
    }
  }
  g.globalAlpha = was;
}
