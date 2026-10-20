// WHAT THE CARTERS' DRIVER'S LASH LEAVES ON THE FLOOR (the art chat, 19 Oct 2026). A MOCK-UP: NOT IN THE GAME. Nothing of
// the game draws this yet: how hard each crack hits and how wide are the main chat's, and this is the picture for it. As
// art/orderly_shots.ts: drawn in the game's own pixels, given where a point of the floor is on the screen (`at`, from
// tiles).
//
// THE DRIVER'S LASH (their second blow, art/carters_moves.ts CT_LASHES): through its warning three rings of the enemy's
// pink marked on the floor in a line before them, one after another, where the three cracks will fall (`drawLashesWarn`);
// where each cracks, a burst of pink sparks off the floor and a puff of dust, a scuff left a moment (`drawLashCrack`).

import { hash } from './kit';
import { FLAME } from './mkit';
import { CT_LASHES } from './carters_moves';
import type { FloorAt } from './mob_shots';

const clamp01 = (v: number): number => (v < 0 ? 0 : v > 1 ? 1 : v);
const sm = (v: number): number => {
  const c = clamp01(v);
  return c * c * (3 - 2 * c);
};
function dotAt(g: CanvasRenderingContext2D, x: number, y: number, color: string, w = 1, h = 1): void {
  g.fillStyle = color;
  g.fillRect(Math.round(x), Math.round(y), w, h);
}
const DUST = ['#8a8472', '#aaa48e', '#c6bfa8'];
const SCUFF = '#2a2420';

/** How wide each crack's ring is (tiles of radius); how long a crack's sparks fly and how long its scuff stays (seconds). */
export const LASH_MARK_R = 0.2;
export const LASH_SPARKS_FOR = 0.3;
export const LASH_CRACK_FOR = 0.8;
/** Where the three cracks fall: tiles before where they stood along the way they face, and a little to their right (under the whip hand). */
export const LASH_REACH = CT_LASHES.reach;
export const LASH_RIGHT = 3 / (32 / Math.sqrt(2 / 3));

/** The three cracks' places on the floor, from them at (x, y) facing (fx, fy). */
export function lashSpots(x: number, y: number, fx: number, fy: number): [number, number][] {
  const l = Math.hypot(fx, fy) || 1;
  const ux = fx / l;
  const uy = fy / l;
  // (their right, seen from above, is the way they face turned a quarter clockwise)
  return LASH_REACH.map((r) => [x + ux * r + uy * LASH_RIGHT, y + uy * r - ux * LASH_RIGHT]);
}
/** THE WARNING, `k` of the way through it (0 to 1): the three rings marked out one after another, nearest first, their dashes marching round, brightening. */
export function drawLashesWarn(g: CanvasRenderingContext2D, at: FloorAt, x: number, y: number, fx: number, fy: number, k: number): void {
  if (k <= 0 || k > 1) return;
  const was = g.globalAlpha;
  lashSpots(x, y, fx, fy).forEach(([cx, cy], i) => {
    const shown = sm((k - i * 0.22) / 0.3);
    if (shown <= 0) return;
    // (its middle, a spot of the floor darkening)
    for (let j = 0; j < 10; j++) {
      const a = j * 2.39996;
      const r = LASH_MARK_R * 0.55 * Math.sqrt((j + 0.5) / 10);
      const [sx, sy] = at(cx + Math.cos(a) * r, cy + Math.sin(a) * r);
      g.globalAlpha = 0.4 * shown;
      dotAt(g, sx, sy, '#1a1016', 2, 1);
    }
    const n = 28;
    for (let j = 0; j < n; j++) {
      if ((Math.floor(j / 2 + k * 8) & 1) === 0) continue;
      const a = (j / n) * Math.PI * 2;
      const [sx, sy] = at(cx + Math.cos(a) * LASH_MARK_R, cy + Math.sin(a) * LASH_MARK_R);
      g.globalAlpha = shown * (0.45 + 0.55 * k);
      dotAt(g, sx, sy, k > 0.75 ? FLAME[3] : FLAME[2], 2, 1);
    }
  });
  g.globalAlpha = was;
}
/** A CRACK at (x, y) (tiles), `t` seconds after: pink sparks flung off the floor and falling, a puff of dust, a scuff on the floor fading. */
export function drawLashCrack(g: CanvasRenderingContext2D, at: FloorAt, x: number, y: number, t: number): void {
  if (t < 0 || t >= LASH_CRACK_FOR) return;
  const was = g.globalAlpha;
  // the scuff where the cracker struck
  g.globalAlpha = 1 - sm((t - (LASH_CRACK_FOR - 0.4)) / 0.4);
  for (let i = 0; i < 14; i++) {
    const a = i * 2.39996;
    const r = 0.04 + 0.14 * hash(i, 1, 7811);
    const [sx, sy] = at(x + Math.cos(a) * r, y + Math.sin(a) * r * 0.6);
    dotAt(g, sx, sy, SCUFF, i % 3 === 0 ? 2 : 1, 1);
  }
  // the dust, puffed out and settling
  if (t < 0.5) {
    const q = t / 0.5;
    for (let i = 0; i < 18; i++) {
      const a = (i / 18) * Math.PI * 2;
      const r = 0.1 + (LASH_MARK_R - 0.1) * sm(q * 1.4);
      if (hash(i, Math.floor(t * 20), 7812) < q * 0.8) continue;
      const [sx, sy] = at(x + Math.cos(a) * r, y + Math.sin(a) * r);
      g.globalAlpha = 0.85 * (1 - q);
      dotAt(g, sx, sy - 1 - 2 * Math.sin(Math.PI * q), DUST[i % 3], 1, 1);
    }
  }
  // the sparks, the enemy's pink and gold, flung up and out and falling
  if (t < LASH_SPARKS_FOR) {
    const q = t / LASH_SPARKS_FOR;
    for (let i = 0; i < 16; i++) {
      const a = i * 2.39996 + hash(i, 2, 7813);
      const r = (0.1 + 0.3 * hash(i, 3, 7813)) * Math.sqrt(q);
      const [sx, sy] = at(x + Math.cos(a) * r, y + Math.sin(a) * r);
      g.globalAlpha = 1 - q * q;
      dotAt(g, sx, sy - 18 * 4 * q * (1 - q) * (0.4 + hash(i, 4, 7813)), i % 3 === 0 ? FLAME[4] : i % 3 === 1 ? FLAME[3] : FLAME[2], q < 0.4 ? 2 : 1, 1);
    }
  }
  g.globalAlpha = was;
}
