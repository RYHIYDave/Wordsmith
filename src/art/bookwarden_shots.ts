// WHAT THE BOOKWARDENS' TOME LEAVES ON THE FLOOR (the art chat, 19 Oct 2026). A MOCK-UP: NOT IN THE GAME. Nothing of the
// game draws this yet: how hard the slam hits and how wide are the main chat's, and this is the picture for it. As
// art/orderly_shots.ts: drawn in the game's own pixels, given where a point of the floor is on the screen (`at`, from
// tiles).
//
// THE TOME SLAM (art/bookwardens_moves.ts): where the great book crashes down flat on its cover, a ring of dust is shoved
// out from under it across the floor, longest out of its sides; the floor under it cracked, the cracks fading; and loose
// pages knocked out of it, flung up and fluttering down round it, lying a while (`drawTomeSlam`).
//
// THE PAGE STORM (their second blow, art/bookwardens_moves.ts WB_STORM): through its warning a fan of the enemy's pink
// marked on the floor before them, as wide and as far as the storm will go, its dashes running out along it, the floor
// in it darkening (`drawStormWarn`); as the book is thrown open, the stolen words tear out of it in a gale of pages
// across the floor in that fan, turning over as they fly, their shadows under them, burning pink (`drawPageStorm`).

import { hash } from './kit';
import { FLAME } from './mkit';
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

/** How far the dust is shoved out (tiles, from the book's middle: its ring stretched, 1.15 of this out of the book's sides and 0.8 of it along the way they face), how long it lasts; how long the cracks and the fallen pages stay (seconds). */
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

/** THE PAGE STORM'S FAN on the floor: from their feet, out to STORM_REACH tiles, STORM_HALF either side of the way they face (radians); the pages come out of the book STORM_FROM tiles before them, flying STORM_SPEED tiles a second; they pour for STORM_POUR seconds, and the last are gone STORM_TAIL after. */
export const STORM_REACH = 3.4;
export const STORM_HALF = 0.45;
export const STORM_FROM = 1.1;
export const STORM_SPEED = 6.0;
export const STORM_POUR = 0.85;
export const STORM_TAIL = 0.45;
/** A point of the fan: `r` tiles out, `a` radians to their left of the way they face, from them at (x, y) facing (fx, fy). */
function inFan(x: number, y: number, fx: number, fy: number, r: number, a: number): [number, number] {
  const face = Math.atan2(fy, fx);
  // (their left on the floor is the way they face turned a quarter round, (fy, -fx))
  return [x + Math.cos(face - a) * r, y + Math.sin(face - a) * r];
}
/** THE WARNING, `k` of the way through it (0 to 1): the fan's edges and its far arc in pink dashes running out from them, brightening; the floor inside it darkening toward its far end. `t`: the time (seconds). */
export function drawStormWarn(g: CanvasRenderingContext2D, at: FloorAt, x: number, y: number, fx: number, fy: number, k: number, t: number): void {
  if (k <= 0 || k > 1) return;
  const was = g.globalAlpha;
  const shown = sm(k / 0.3);
  for (let i = 0; i < 80; i++) {
    const r = 0.7 + (STORM_REACH - 0.7) * Math.sqrt((i + 0.5) / 80);
    const a = (hash(i, 1, 9511) * 2 - 1) * STORM_HALF * 0.95;
    const [sx, sy] = at(...inFan(x, y, fx, fy, r, a));
    g.globalAlpha = was * 0.34 * shown * (r / STORM_REACH);
    dotAt(g, sx, sy, SEAM, 2, 1);
  }
  const color = k > 0.75 ? FLAME[3] : FLAME[2];
  for (const side of [-1, 1]) {
    for (let j = 0; j < 26; j++) {
      if ((Math.floor(j / 2 - t * 10) & 1) === 0) continue;
      const r = 0.7 + ((STORM_REACH - 0.7) * j) / 25;
      const [sx, sy] = at(...inFan(x, y, fx, fy, r, side * STORM_HALF));
      g.globalAlpha = was * shown * (0.45 + 0.55 * k);
      dotAt(g, sx, sy, color, 2, 1);
    }
  }
  for (let j = 0; j <= 20; j++) {
    if ((Math.floor(j / 2 - t * 10) & 1) === 0) continue;
    const [sx, sy] = at(...inFan(x, y, fx, fy, STORM_REACH, -STORM_HALF + (2 * STORM_HALF * j) / 20));
    g.globalAlpha = was * shown * (0.45 + 0.55 * k);
    dotAt(g, sx, sy, color, 2, 1);
  }
  g.globalAlpha = was;
}
/**
 * THE PAGE STORM, `t` seconds after the book is thrown open (0 to STORM_POUR + STORM_TAIL), from them at (x, y) facing
 * (fx, fy): page after page torn out of the book and flung out across the fan, low over the floor, turning over as they
 * fly (now a page's face, now its edge), the stolen words on them burning pink; their shadows on the floor under them.
 */
export function drawPageStorm(g: CanvasRenderingContext2D, at: FloorAt, x: number, y: number, fx: number, fy: number, t: number): void {
  if (t < 0 || t >= STORM_POUR + STORM_TAIL) return;
  const was = g.globalAlpha;
  const N = 90;
  for (let i = 0; i < N; i++) {
    const born = (i / N) * STORM_POUR;
    const age = t - born;
    if (age < 0) continue;
    const r = STORM_FROM + STORM_SPEED * (0.75 + 0.5 * hash(i, 1, 9521)) * age;
    if (r > STORM_REACH + 0.1) continue;
    // (each on its own line out across the fan, wandering a little as it flies)
    const a = (hash(i, 2, 9521) * 2 - 1) * STORM_HALF * 0.92 + 0.08 * Math.sin(age * 9 + i);
    const [sx, sy] = at(...inFan(x, y, fx, fy, r, a));
    const z = 5 + 10 * hash(i, 3, 9521) + 3 * Math.sin(age * 14 + i * 2.1);
    const fade = 1 - sm((r - (STORM_REACH - 0.5)) / 0.5);
    g.globalAlpha = was * 0.35 * fade;
    dotAt(g, sx - 1, sy, SEAM, 2, 1);
    g.globalAlpha = was * fade;
    const flat = Math.sin(age * 20 + i * 1.7) > 0;
    // (a dark edge under each, so that it shows over pale marble as well as dark boards)
    if (flat) {
      dotAt(g, sx - 1, sy - z + 2, SEAM, 3, 1);
      dotAt(g, sx - 1, sy - z, PAGE[i % 2], 3, 2);
      dotAt(g, sx, sy - z, i % 3 === 0 ? FLAME[3] : FLAME[2]);
    } else {
      dotAt(g, sx + 1, sy - z - 1, SEAM, 1, 3);
      dotAt(g, sx, sy - z - 1, PAGE[2], 1, 3);
      if (i % 2 === 0) dotAt(g, sx, sy - z, FLAME[2]);
    }
  }
  g.globalAlpha = was;
}
