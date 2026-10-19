// WHAT THE SCRIBES' INK DOES (the art chat, 18 Oct 2026). A MOCK-UP: NOT IN THE GAME. Nothing of the game draws these
// yet: the rules (how far they throw, what the ink does to the hero, how long a pool lasts) are the main chat's, and
// these are the pictures for them. As art/crier_shots.ts: drawn in the game's own pixels, given where a point of the
// floor is on the screen (`at`, from tiles).
//
// THE SILENT ORDER'S SCRIBES (art/scribes.ts, art/scribes_moves.ts): their blow is the ink flick.
//   As they draw the quill back (the warning), a small ring closes in on the spot it will land on (`drawInkMark`).
//   Flicked, a gob of black ink flies from the nib in an arc, droplets trailing (`drawInkFlight`).
//   It lands and bursts: a splash thrown out in a star of droplets, and a pool of wet black ink left glistening on the
//   flags, shrinking and drying away (`drawInkSplat`).
// The ink is black; what glints on it is the enemy's pink, never a friend's cyan.

import { INK_BLACK, INK_SHEEN } from './scribes';
import { hash } from './kit';
import { FLAME } from './mkit';
import type { FloorAt } from './mob_shots';

const clamp01 = (v: number): number => (v < 0 ? 0 : v > 1 ? 1 : v);

function dotAt(g: CanvasRenderingContext2D, x: number, y: number, color: string, w = 1, h = 1): void {
  g.fillStyle = color;
  g.fillRect(Math.round(x), Math.round(y), w, h);
}

/** How long the gob is in the air (seconds), how high its arc rises over the straight line (game pixels at its middle), how long the pool lasts. */
export const INK_FLIGHT = 0.36;
export const INK_ARC = 26;
export const INK_POOL_FOR = 2.4;
/** The pool's size: its half-width on the floor (tiles). */
export const INK_POOL = 0.62;

/**
 * THE WARNING: a ring on the floor where the ink will land, `k` of the way through the warning (0 to 1), closing in
 * from wide to the pool's own size, a pink line that brightens as it closes, with ticks at its four points.
 */
export function drawInkMark(g: CanvasRenderingContext2D, at: FloorAt, x: number, y: number, k: number, t: number): void {
  if (k <= 0) return;
  const was = g.globalAlpha;
  const r = INK_POOL * (1 + 1.4 * (1 - clamp01(k)));
  const n = 40;
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2 + t * 1.5;
    if (i % 5 === 4) continue;
    const [sx, sy] = at(x + Math.cos(a) * r, y + Math.sin(a) * r);
    g.globalAlpha = 0.35 + 0.55 * clamp01(k);
    dotAt(g, sx, sy, k > 0.7 ? FLAME[2] : FLAME[1], 2, 1);
  }
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI * 2 + Math.PI / 4;
    const [ax, ay] = at(x + Math.cos(a) * r * 0.7, y + Math.sin(a) * r * 0.7);
    g.globalAlpha = 0.5 + 0.4 * clamp01(k);
    dotAt(g, ax - 1, ay, FLAME[1], 3, 1);
  }
  g.globalAlpha = was;
}

/**
 * THE GOB IN FLIGHT, `t` seconds after it leaves the nib: from (x0, y0), `rise` game pixels above the floor there (the
 * nib's height), to (x1, y1) on the floor, along an arc; a black gob, its sheen catching the pink, droplets trailing.
 */
export function drawInkFlight(g: CanvasRenderingContext2D, at: FloorAt, x0: number, y0: number, rise: number, x1: number, y1: number, t: number): void {
  if (t < 0 || t >= INK_FLIGHT) return;
  const u = t / INK_FLIGHT;
  const pos = (v: number): [number, number] => {
    const [ax, ay] = at(x0 + (x1 - x0) * v, y0 + (y1 - y0) * v);
    return [ax, ay - rise * (1 - v) - INK_ARC * 4 * v * (1 - v)];
  };
  // (droplets trailing behind it, smaller and further back)
  for (let i = 1; i <= 6; i++) {
    const v = u - i * 0.035;
    if (v < 0) continue;
    const [dx, dy] = pos(v);
    dotAt(g, dx + (hash(i, 3, 2501) - 0.5) * 3, dy + (hash(i, 4, 2501) - 0.5) * 3, i < 3 ? INK_BLACK : INK_SHEEN, i < 3 ? 2 : 1, i < 3 ? 2 : 1);
  }
  const [cx, cy] = pos(u);
  // the gob: black, swelling as it flies, a pink glint on its top
  const r = 2 + Math.round(2 * Math.min(1, u * 2));
  g.fillStyle = INK_BLACK;
  g.fillRect(Math.round(cx - r), Math.round(cy - r + 1), r * 2, r * 2 - 1);
  g.fillRect(Math.round(cx - r + 1), Math.round(cy - r), r * 2 - 2, r * 2 + 1);
  dotAt(g, cx - 1, cy - r + 1, INK_SHEEN, 2, 1);
  dotAt(g, cx, cy - r + 1, FLAME[1]);
}

/**
 * WHERE IT LANDS, `t` seconds after: a splash thrown out in a star of droplets (the first fifth of a second), and a
 * pool of wet black ink on the flags, its edge ragged, a pink glint moving on it; shrinking and drying from its
 * edge, gone after INK_POOL_FOR.
 */
export function drawInkSplat(g: CanvasRenderingContext2D, at: FloorAt, x: number, y: number, t: number): void {
  if (t < 0 || t >= INK_POOL_FOR) return;
  const was = g.globalAlpha;
  // THE POOL: a ragged blot, spreading at once to its size, then shrinking as it dries
  const grow = clamp01(t / 0.12);
  const dry = t < INK_POOL_FOR * 0.55 ? 1 : 1 - (t - INK_POOL_FOR * 0.55) / (INK_POOL_FOR * 0.45);
  const R = INK_POOL * grow * (0.55 + 0.45 * dry);
  const step = 0.06;
  for (let fx = -R; fx <= R; fx += step) {
    for (let fy = -R; fy <= R; fy += step) {
      const a = Math.atan2(fy, fx);
      const edge = R * (0.82 + 0.18 * Math.sin(a * 5 + 1.3) * Math.cos(a * 3)) ;
      const d = Math.hypot(fx, fy);
      if (d > edge) continue;
      const [sx, sy] = at(x + fx, y + fy);
      g.globalAlpha = 0.92 * (dry < 1 ? 0.5 + 0.5 * dry : 1);
      dotAt(g, sx, sy, d > edge - 0.06 ? INK_SHEEN : INK_BLACK);
    }
  }
  // a glint of pink moving slowly across its wet face
  const ga = t * 1.7;
  const [gx, gy] = at(x + Math.cos(ga) * R * 0.4, y + Math.sin(ga) * R * 0.3);
  g.globalAlpha = 0.8 * dry;
  dotAt(g, gx - 1, gy, FLAME[1], 3, 1);
  dotAt(g, gx, gy - 1, FLAME[2]);
  // THE SPLASH: droplets flung out in a star, arcing up and down again
  if (t < 0.32) {
    for (let i = 0; i < 16; i++) {
      const a = (i / 16) * Math.PI * 2 + hash(i, 1, 2503) * 0.4;
      const out = (0.4 + 0.9 * hash(i, 2, 2503)) * (t / 0.32);
      const up = 14 * hash(i, 3, 2503) * 4 * (t / 0.32) * (1 - t / 0.32);
      const [sx, sy] = at(x + Math.cos(a) * out, y + Math.sin(a) * out);
      g.globalAlpha = 1;
      dotAt(g, sx, sy - up, i % 4 === 0 ? INK_SHEEN : INK_BLACK, 2, 2);
    }
  }
  g.globalAlpha = was;
}
