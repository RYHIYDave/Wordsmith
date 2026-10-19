// WHAT THE BOOKWARDENS' TOME LEAVES ON THE FLOOR (the art chat, 19 Oct 2026). A MOCK-UP: NOT IN THE GAME. Nothing of the
// game draws this yet: how hard the slam hits and how wide are the main chat's, and this is the picture for it. As
// art/orderly_shots.ts: drawn in the game's own pixels, given where a point of the floor is on the screen (`at`, from
// tiles).
//
// THE TOME SLAM (art/bookwardens_moves.ts): where the great book crashes down flat on its cover, a ring of dust is shoved
// out from under it across the floor, longest out of its sides; the floor under it cracked, the cracks fading; and loose
// pages knocked out of it, flung up and fluttering down round it, lying a while (`drawTomeSlam`).

import { hash } from './kit';
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
/** The dust shoved out: paler than any floor of the library, so that it shows over boards, marble and carpet alike. */
const DUST = ['#8a8472', '#aaa48e', '#c6bfa8', '#ddd6c0'];
const PAGE = ['#cfc5ab', '#e6dcc4', '#9c927a'];
const SEAM = '#120e0c';

/** How far the dust is shoved out (tiles, from the book's middle), how long it lasts; how long the cracks and the fallen pages stay (seconds). */
export const TOME_REACH = 1.2;
export const TOME_DUST_FOR = 0.6;
export const TOME_MARK_FOR = 1.8;
/** The book's half-length and half-width as it lies (tiles), along the way they face and across it. */
const BOOK_L = 0.36;
const BOOK_W = 0.28;

/**
 * WHERE THE TOME CRASHED DOWN at (x, y) (tiles: the book's middle), they facing (fx, fy) (a way along the floor), `t`
 * seconds after: the dust shoved out from under it, the floor cracked under it, loose pages flung up and fluttering
 * down round it.
 */
export function drawTomeSlam(g: CanvasRenderingContext2D, at: FloorAt, x: number, y: number, fx: number, fy: number, t: number): void {
  if (t < 0 || t >= TOME_MARK_FOR) return;
  const was = g.globalAlpha;
  const fl = Math.hypot(fx, fy) || 1;
  const ux = fx / fl;
  const uy = fy / fl;
  const W = (a: number, b: number): [number, number] => [x + ux * a - uy * b, y + uy * a + ux * b];
  const fade = 1 - sm((t - (TOME_MARK_FOR - 0.6)) / 0.6);
  // the cracks: out from under the book's edges, run out at once, fading
  g.globalAlpha = fade;
  for (let i = 0; i < 9; i++) {
    const side = i % 4;
    const along = (hash(i, 1, 9101) - 0.5) * 2;
    let a = side < 2 ? along * BOOK_L : (side === 2 ? 1 : -1) * BOOK_L;
    let b = side < 2 ? (side === 0 ? 1 : -1) * BOOK_W : along * BOOK_W;
    let ang = Math.atan2(b, a) + (hash(i, 2, 9101) - 0.5) * 0.8;
    const long = 0.25 + 0.3 * hash(i, 3, 9101);
    for (let k = 0; k < 7; k++) {
      ang += (hash(i, k, 9102) - 0.5) * 0.7;
      a += (Math.cos(ang) * long) / 7;
      b += (Math.sin(ang) * long) / 7;
      const [sx, sy] = at(...W(a, b));
      dotAt(g, sx, sy, SEAM);
    }
  }
  if (t < TOME_DUST_FOR) {
    const q = t / TOME_DUST_FOR;
    // the dust shoved out from under it: a ring, longest out of its sides, thinning as it goes
    const R = 0.3 + (TOME_REACH - 0.3) * sm(q * 1.4);
    const n = Math.ceil(30 + R * 60);
    for (let j = 0; j < 3; j++) {
      const r = R * (1 - 0.12 * j);
      for (let i = 0; i < n; i++) {
        if (hash(i, j + Math.floor(t * 20) * 3, 9103) < 0.25 + 0.6 * q) continue;
        const a = (i / n) * Math.PI * 2;
        const [sx, sy] = at(...W(Math.cos(a) * r * 0.8, Math.sin(a) * r * 1.15));
        g.globalAlpha = (0.9 - 0.25 * j) * (1 - q);
        dotAt(g, sx, sy - 1 - 2 * Math.sin(Math.PI * q) * hash(i, j, 9104), DUST[3 - j], j === 0 ? 2 : 1, 1);
      }
    }
  }
  // the loose pages: knocked out of it, flung up, fluttering down round it, and lying there
  for (let i = 0; i < 7; i++) {
    const a = i * 2.39996 + hash(i, 4, 9105);
    const r = 0.35 + 0.55 * hash(i, 5, 9105);
    const fly = 0.5 + 0.35 * hash(i, 6, 9105);
    const u = clamp01(t / fly);
    const p = W(Math.cos(a) * r * sm(u), Math.sin(a) * r * sm(u));
    const [sx, sy] = at(...p);
    const h = 26 * Math.sin(Math.PI * Math.min(1, u * 1.1)) * (0.6 + 0.4 * hash(i, 7, 9105)) * (1 - 0.3 * u);
    const flat = u >= 1;
    const flap = Math.sin(t * 22 + i) > 0;
    g.globalAlpha = fade;
    if (flat) {
      dotAt(g, sx - 1, sy, PAGE[0], 3, 1);
      dotAt(g, sx - 1, sy + 1, PAGE[2], 3, 1);
    } else {
      dotAt(g, sx, sy - h, PAGE[flap ? 1 : 2], flap ? 2 : 1, flap ? 1 : 2);
    }
  }
  g.globalAlpha = was;
}
