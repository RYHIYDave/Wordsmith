// THE CHAINED ONE'S MOVES DONE THE ACTION WAY: WHAT THEY LEAVE ON THE FLOOR (the art chat's helper, 31 Oct 2026;
// docs/mockups/action_f3_chained/README.md). A MOCK-UP: NOTHING OF THE GAME IMPORTS THIS FILE. His moves themselves:
// art/chained_action.ts (CHAINED_ACTION, off).
//
//   THE CRACK   his lash's finisher: both fists and his chains brought down on the floor before him, and a crack splitting the
//               floor on out along the way he faces, red-hot at its lips, dust bursting up along it as it runs, chips flung.
//   THE RING    a shockwave going out over the floor: round him as his whirl's finisher slams his chains down; where his ball
//               crashes down; small, where his fists come down at the end of the hook (as floor 3's green troll's slam,
//               art/action_f3_fx.ts, made for any size).
// Each is a picture of a moment (seconds from the blow), on a canvas of its own with the floor point it stands on (its anchor), in
// picture pixels (two to a game pixel), as the figures are; the floor layer goes under the figures, the air layer by halves
// (`behind` before a figure at its anchor, `before` after it). Every pixel is whole. Nothing is of the friend's cyan: the floor's
// own stone and dust, the enemy's pink and fire, and white.

import { Px } from '../engine/px';
import type { Light } from '../engine/px';
import { MAIL, PINK, hash } from './kit';
import type { Painted } from './kit';
import { FLAME, SOCKET } from './mkit';
import type { Canvas } from './mkit';
import { floorPx } from './action_f1_fx';

const clamp01 = (v: number): number => (v < 0 ? 0 : v > 1 ? 1 : v);
const TAU = Math.PI * 2;
const WHITE = '#fff8ec';
const SEAM = '#0b0a11';
const STONE = ['#25222f', '#332f40', '#4a4658'] as const;
/** Which part of a picture that stands up off the floor. */
export type Side = 'behind' | 'before' | 'all';
const onSide = (fx: number, fy: number, side: Side): boolean => side === 'all' || (fx + fy > 0) === (side === 'before');

/** A set of whole pixels: each laid once, the last colour said for it winning. */
function pen(px: Px): (x: number, y: number, c: string) => void {
  return (x, y, c) => {
    const X = Math.round(x);
    const Y = Math.round(y);
    if (X < 1 || Y < 1 || X >= px.w - 1 || Y >= px.h - 1) return;
    px.set(X, Y, c);
  };
}
function blob(dot: (x: number, y: number, c: string) => void, x: number, y: number, r: number, c: string, thin = 0, seed = 0): void {
  for (let j = -Math.ceil(r); j <= Math.ceil(r); j++) {
    for (let i = -Math.ceil(r); i <= Math.ceil(r); i++) {
      if (i * i + j * j > r * r + 0.3) continue;
      if (thin > 0 && hash(Math.round(x) + i, Math.round(y) + j, seed) < thin) continue;
      dot(x + i, y + j, c);
    }
  }
}

// =============================================================================================
// THE RING

/**
 * A SHOCKWAVE RING'S NUMBERS (seconds from the blow): it goes out to its edge over `wave`, breaks up over `fade` more; its cracks
 * and dent are gone by `long`.
 *   whirl   round him as his whirl's finisher slams his chains down (tiles: what it strikes, a hero whose middle is within it)
 *   ball    round where his ball crashes down
 *   hammer  round where his fists come down on you at the end of the hook (its middle `ahead` tiles before him)
 */
export const RING = { wave: 0.2, fade: 0.25, long: 1.6, whirl: 3.5, ball: 2.5, hammer: 1.5 } as const;
/** How far out a ring of `radius` has gone, `t` seconds after its blow (tiles). */
export function ringReach(t: number, radius: number): number {
  if (t < 0) return 0;
  const k = clamp01(t / RING.wave);
  return radius * (1 - (1 - k) ** 3);
}
/** The canvas for a ring of `radius` tiles: all of it on the floor and the dust and chips thrown up over it; its anchor the ring's middle. */
export function ringCanvas(radius: number): Canvas {
  const w = 2 * Math.ceil(radius * 45.3 + 16);
  const down = Math.ceil(radius * 22.7 + 10);
  const up = Math.ceil(radius * 22.7 + 60);
  return { w, h: up + down, ax: w / 2, ay: up };
}
/** The cracks a slam opens in the floor: from its middle out, jagged, each its own length (tiles), as lists of floor points. */
function cracksOf(R: number, seed: number): [number, number][][] {
  const out: [number, number][][] = [];
  const n = Math.max(7, Math.round(5 + R * 2.5));
  for (let i = 0; i < n; i++) {
    const a0 = (i / n) * TAU + hash(i, 3, seed) * 0.4;
    const long = R * (0.38 + 0.34 * hash(i, 5, seed));
    const pts: [number, number][] = [];
    let a = a0;
    for (let k = 0; k <= 10; k++) {
      const r = 0.22 + (long - 0.22) * (k / 10);
      a += (hash(i, k, seed + 2) - 0.5) * 0.35;
      pts.push([Math.cos(a) * r, Math.sin(a) * r]);
    }
    out.push(pts);
  }
  return out;
}
/**
 * A SHOCKWAVE RING `radius` tiles round its middle, `t` seconds after its blow (nothing before it, nothing after RING.long).
 *   floor   a dent where it struck and the cracks it opens (red-hot at their lips at first, then dark, then gone); the ring going
 *           out over the floor, a band of the floor's dust with the enemy's pink dotted at its leading edge, breaking up
 *   air     the flash (white and the enemy's pink, a moment), dust thrown up along the ring as it goes, chips of stone flung up and
 *           falling, the dust settling
 */
export function ringPainted(t: number, layer: 'floor' | 'air', radius: number, side: Side = 'all', seed = 41): Painted {
  const C = ringCanvas(radius);
  const px = new Px(C.w, C.h);
  const lights: Light[] = [];
  if (t < -1e-6 || t > RING.long + 1e-6) return { px, lights };
  const dot = pen(px);
  const at = (x: number, y: number): [number, number] => {
    const [X, Y] = floorPx(x, y);
    return [C.ax + X, C.ay + Y];
  };
  const R = radius;
  const reach = ringReach(t, R);
  const left = 1 - clamp01((t - RING.wave) / RING.fade);
  const f = Math.floor(t * 30 + 1e-6);
  if (layer === 'floor') {
    const dent = 1 - clamp01((t - 1.0) / 0.6);
    if (dent > 0) {
      const d = Math.min(1, 0.4 + R * 0.2);
      for (let j = -6; j <= 6; j++) for (let i = -12; i <= 12; i++) if ((i / (12 * d)) ** 2 + (j / (6 * d)) ** 2 < 0.55 && hash(i, j, 52) < dent) dot(C.ax + i, C.ay + j, SEAM);
    }
    const hot = 1 - clamp01(t / 0.45);
    const gone = clamp01((t - 1.0) / (RING.long - 1.0));
    for (const line of cracksOf(R, seed)) {
      for (let k = 1; k < line.length; k++) {
        const [x0, y0] = at(...line[k - 1]);
        const [x1, y1] = at(...line[k]);
        if (Math.hypot(...line[k]) > reach + 0.05) break;
        const n = Math.max(1, Math.ceil(Math.hypot(x1 - x0, y1 - y0)));
        for (let j = 0; j <= n; j++) {
          const x = x0 + ((x1 - x0) * j) / n;
          const y = y0 + ((y1 - y0) * j) / n;
          if (hash(Math.round(x), Math.round(y), 53) < gone) continue;
          dot(x, y, SEAM);
          if (k < 4) dot(x, y + 1, SEAM);
          if (hot > 0 && hash(Math.round(x), Math.round(y), 54) < hot * (1 - k / line.length) * 1.6) dot(x, y - 1, k < 3 && hot > 0.5 ? FLAME[3] : PINK[2]);
        }
      }
    }
    if (left > 0 && t <= RING.wave + RING.fade) {
      const band = 0.32 * R;
      const n = Math.round(R * 70);
      for (let k = 0; k < n; k++) {
        const a = (k / n) * TAU;
        for (let b = 0; b < 4; b++) {
          const r = reach - band * (b / 4) * (0.6 + 0.4 * hash(k, b, 55));
          if (r < 0.15) continue;
          const [x, y] = at(Math.cos(a) * r, Math.sin(a) * r);
          if (hash(k, b + f * 7, 56) > left * (1 - b * 0.18)) continue;
          dot(x, y, b === 0 ? MAIL[3] : MAIL[2]);
        }
        if (t <= RING.wave + 0.06 && k % 2 === 0) {
          const [x, y] = at(Math.cos(a) * reach, Math.sin(a) * reach);
          dot(x, y, PINK[3]);
        }
      }
    }
    return { px, lights };
  }
  if (t < 0.1 && side !== 'behind') {
    const k = 1 - t / 0.1;
    const L = (10 + 16 * k) * Math.min(1.3, 0.6 + R * 0.2);
    for (const [dx, dy] of [[1, 0], [-1, 0], [0.55, -1], [-0.55, -1], [0.8, -0.55], [-0.8, -0.55]] as const) {
      for (let s = 0; s < L * (dy < 0 ? 1.2 : 1); s++) dot(C.ax + dx * s, C.ay - 2 + dy * s * 0.9, s < L * 0.35 ? WHITE : s < L * 0.7 ? FLAME[4] : PINK[3]);
    }
    blob(dot, C.ax, C.ay - 3, 3 + 3 * k, WHITE);
    lights.push({ x: C.ax, y: C.ay - 6, r: 60 + 40 * k, color: SOCKET, a: 0.35 * k });
  }
  if (left > 0 && t <= RING.wave + RING.fade) {
    const n = Math.round(R * 20);
    for (let k = 0; k < n; k++) {
      const a = (k / n) * TAU + hash(k, 2, 57) * 0.2;
      const fx = Math.cos(a) * reach;
      const fy = Math.sin(a) * reach;
      if (!onSide(fx, fy, side)) continue;
      const [x, y] = at(fx, fy);
      const tall = (4 + 10 * (1 - reach / (R + 0.01))) * (0.7 + 0.6 * hash(k, 3, 57)) * left;
      const r = 2.2 + 1.6 * hash(k, 4, 57);
      for (let s = 0; s < 3; s++) blob(dot, x, y - 1 - (tall * s) / 2.5, r * (1 - s * 0.25), s === 0 ? MAIL[2] : MAIL[3], 1 - left * 0.9, k * 3 + s);
    }
  }
  for (let k = 0; k < 14; k++) {
    const life = 0.45 + 0.2 * hash(k, 1, 58);
    if (t > life) continue;
    const a = (k / 14) * TAU + hash(k, 2, 58);
    const out = (0.4 + 0.9 * hash(k, 3, 58)) * (t / life) * Math.min(1.5, 0.6 + R * 0.25);
    const fx = Math.cos(a) * out;
    const fy = Math.sin(a) * out;
    if (!onSide(fx, fy, side)) continue;
    const [x, y] = at(fx, fy);
    const up = (26 + 22 * hash(k, 4, 58)) * 4 * (t / life) * (1 - t / life);
    const c = STONE[k % 3];
    dot(x, y - up, c);
    if (k % 2 === 0) dot(x + 1, y - up, c);
    if (k % 3 === 0) dot(x, y - up - 1, STONE[2]);
  }
  const settle = t < 0.15 ? 0 : 1 - clamp01((t - 0.15) / 0.95);
  if (settle > 0) {
    for (let k = 0; k < 26; k++) {
      const a = hash(k, 1, 59) * TAU;
      const r = (0.2 + 0.75 * hash(k, 2, 59)) * R * 0.45;
      const fx = Math.cos(a) * r;
      const fy = Math.sin(a) * r;
      if (!onSide(fx, fy, side)) continue;
      const [x, y] = at(fx, fy);
      blob(dot, x, y - 3 - 6 * hash(k, 3, 59) * (1 - settle * 0.5), 2 + 2 * hash(k, 4, 59), k % 3 ? MAIL[2] : MAIL[3], 1 - settle * 0.85, k);
    }
  }
  return { px, lights };
}
/** Whether a hero `x`, `y` tiles from a ring's middle is struck by it. */
export const ringStrikes = (x: number, y: number, radius: number): boolean => Math.hypot(x, y) <= radius;

// =============================================================================================
// THE CRACK

/**
 * THE CRACK'S NUMBERS (tiles along the way he faced as the lash began, from where he stood then; seconds from the finisher's blow).
 *   from, to   it splits the floor from where his fists come down (`from`) on out to `to`
 *   half       half its width: what is within it as it runs is struck (his chains lie along its first stretch)
 *   run        how long it takes to run out from `from` to `to`
 *   long       its lips cool, its dust settles, it closes: nothing left after this
 */
export const CRACK = { from: 2.4, to: 6.4, half: 0.8, run: 0.15, long: 1.8 } as const;
/** How far out the crack has run, `t` seconds after the blow (tiles from where he stood). */
export const crackReach = (t: number): number => (t < 0 ? CRACK.from : CRACK.from + (CRACK.to - CRACK.from) * (1 - (1 - clamp01(t / CRACK.run)) ** 2));
/** Whether a hero `along` tiles before where he stood and `across` to its side is struck by the crack at `t` (as it runs past). */
export const crackStrikes = (along: number, across: number, t: number): boolean => along >= 0.5 && along <= crackReach(t) && Math.abs(across) <= CRACK.half;
/** The crack's canvas: anchored at its middle (half way along it), big enough for it whichever way it runs. */
const CRACK_HALF = (CRACK.to - CRACK.from) / 2 + 0.6;
export const CRACK_CANVAS: Canvas = { w: 2 * Math.ceil(CRACK_HALF * 45.3 + 14), h: Math.ceil(CRACK_HALF * 45.3 + 80), ax: Math.ceil(CRACK_HALF * 45.3 + 14), ay: Math.ceil(CRACK_HALF * 22.7 + 60) };
/** The crack's middle: this many tiles before where he stood. */
export const CRACK_MID = (CRACK.from + CRACK.to) / 2;
/** The crack's way: its main line and its branches, as points along it (tiles from its start) and across it. */
function crackLines(): [number, number][][] {
  const L = CRACK.to - CRACK.from;
  const main: [number, number][] = [];
  let c = 0;
  for (let i = 0; i <= 28; i++) {
    const a = (L * i) / 28;
    c += (hash(i, 1, 71) - 0.5) * 0.16;
    c *= 0.86;
    main.push([a, c]);
  }
  const out = [main];
  for (let b = 0; b < 7; b++) {
    const i = 3 + Math.floor(hash(b, 2, 71) * 22);
    const [a0, c0] = main[i];
    const sg = hash(b, 3, 71) > 0.5 ? 1 : -1;
    const long = 0.35 + 0.4 * hash(b, 4, 71);
    const br: [number, number][] = [[a0, c0]];
    for (let k = 1; k <= 5; k++) br.push([a0 + (long * k) / 5 * 0.7, c0 + sg * ((long * k) / 5) * (0.7 + 0.2 * hash(b, k, 72))]);
    out.push(br);
  }
  return out;
}
const LINES = crackLines();
/**
 * THE CRACK, `t` seconds after the finisher's blow, running the way `way` (a way along the floor: tiles, unit), on its canvas
 * anchored at its middle (CRACK_MID before where he stood).
 *   floor   the crack itself, a jagged split with branches, opening out from where his fists came down as it runs (red-hot at its
 *           lips, then dark, then closing pixel by pixel); the floor heaved along it, a band of the floor's dust either side, the
 *           enemy's pink dotted along its edges as it runs
 *   air     the flash where his fists struck; dust bursting up along it as it runs, high where it runs and falling behind; chips of
 *           stone flung up out of it and falling
 */
export function crackPainted(t: number, layer: 'floor' | 'air', way: readonly [number, number], side: Side = 'all'): Painted {
  const C = CRACK_CANVAS;
  const px = new Px(C.w, C.h);
  const lights: Light[] = [];
  if (t < -1e-6 || t > CRACK.long + 1e-6) return { px, lights };
  const dot = pen(px);
  const L = CRACK.to - CRACK.from;
  const ux = way[0];
  const uy = way[1];
  /** A point `a` tiles along the crack from its start and `c` across it, on the canvas, and as floor tiles from its middle. */
  const fl = (a: number, c: number): [number, number] => [ux * (a - L / 2) - uy * c, uy * (a - L / 2) + ux * c];
  const at = (a: number, c: number): [number, number] => {
    const [X, Y] = floorPx(...fl(a, c));
    return [C.ax + X, C.ay + Y];
  };
  const ran = crackReach(t) - CRACK.from;
  const hot = 1 - clamp01(t / 0.6);
  const gone = clamp01((t - 1.1) / (CRACK.long - 1.1));
  const f = Math.floor(t * 30 + 1e-6);
  if (layer === 'floor') {
    // (the floor heaved along it as it runs: a band of dust either side, the enemy's pink at its edges while it runs)
    const heave = 1 - clamp01((t - CRACK.run) / 0.35);
    if (heave > 0) {
      for (let k = 0; k <= Math.round(L * 30); k++) {
        const a = (k / Math.round(L * 30)) * L;
        if (a > ran) break;
        for (const sg of [-1, 1]) {
          for (let b = 0; b < 3; b++) {
            if (hash(k, b + f * 5 + (sg > 0 ? 9 : 0), 73) > heave * (1 - b * 0.2)) continue;
            const [x, y] = at(a, sg * CRACK.half * (0.45 + 0.2 * b + 0.15 * hash(k, b, 74)));
            dot(x, y, b === 0 ? MAIL[2] : MAIL[3]);
          }
          if (t < CRACK.run + 0.08 && k % 2 === 0) {
            const [x, y] = at(a, sg * CRACK.half);
            dot(x, y, PINK[3]);
          }
        }
      }
    }
    // (the crack and its branches, open as far as it has run)
    LINES.forEach((line, li) => {
      for (let k = 1; k < line.length; k++) {
        if (line[k][0] > ran + 0.02) break;
        const [x0, y0] = at(...line[k - 1]);
        const [x1, y1] = at(...line[k]);
        const n = Math.max(1, Math.ceil(Math.hypot(x1 - x0, y1 - y0)));
        // (the main split wide and deep near where his fists struck, narrowing as it runs; its lip lit; red-hot at first)
        const wide = li === 0 ? 3 - (2 * k) / line.length : 1;
        for (let j = 0; j <= n; j++) {
          const x = x0 + ((x1 - x0) * j) / n;
          const y = y0 + ((y1 - y0) * j) / n;
          if (hash(Math.round(x), Math.round(y), 75) < gone) continue;
          for (let w = 0; w < Math.round(wide); w++) dot(x, y + w, SEAM);
          if (wide >= 2) dot(x + 1, y, SEAM);
          if (li === 0) dot(x, y + Math.round(wide), STONE[2]);
          if (hot > 0 && hash(Math.round(x), Math.round(y), 76) < hot * (li === 0 ? 1.6 : 0.8)) {
            dot(x, y - 1, hot > 0.6 && li === 0 ? FLAME[3] : PINK[2]);
            if (li === 0 && wide >= 2 && hot > 0.3) dot(x, y, hot > 0.7 ? FLAME[4] : FLAME[2]);
          }
        }
      }
    });
    return { px, lights };
  }
  // the flash where his fists struck
  if (t < 0.1) {
    const [fx0, fy0] = fl(0, 0);
    if (onSide(fx0, fy0, side)) {
      const k = 1 - t / 0.1;
      const [x0, y0] = at(0, 0);
      for (const [dx, dy] of [[1, 0], [-1, 0], [0.55, -1], [-0.55, -1]] as const) for (let s = 0; s < 12 + 12 * k; s++) dot(x0 + dx * s, y0 - 2 + dy * s * 0.9, s < 6 ? WHITE : s < 14 ? FLAME[4] : PINK[3]);
      blob(dot, x0, y0 - 3, 2 + 3 * k, WHITE);
      lights.push({ x: x0, y: y0 - 6, r: 50 + 30 * k, color: SOCKET, a: 0.3 * k });
    }
  }
  // dust bursting up along it as it runs (highest where it is running now), falling back behind
  const n = Math.round(L * 7);
  for (let k = 0; k <= n; k++) {
    const a = (k / n) * L;
    if (a > ran) break;
    const when = CRACK.run * (1 - Math.sqrt(1 - Math.min(1, a / L)));
    const age = t - when;
    const life = 0.55 + 0.25 * hash(k, 1, 77);
    if (age < 0 || age > life) continue;
    const c = (hash(k, 2, 77) - 0.5) * CRACK.half;
    const [fx, fy] = fl(a, c);
    if (!onSide(fx, fy, side)) continue;
    const [x, y] = at(a, c);
    const u = age / life;
    const tall = (7 + 8 * hash(k, 3, 77)) * Math.sin(Math.PI * Math.min(1, u * 1.4));
    const r = 1.8 + 1.6 * hash(k, 4, 77);
    for (let s = 0; s < 3; s++) blob(dot, x, y - 1 - (tall * s) / 2.2, r * (1 - s * 0.22), s === 0 ? MAIL[2] : MAIL[3], 0.2 + 0.75 * u, k * 3 + s);
  }
  // chips of stone flung up out of it
  for (let k = 0; k < 22; k++) {
    const a = hash(k, 1, 78) * L;
    if (a > ran) continue;
    const when = CRACK.run * (1 - Math.sqrt(1 - Math.min(1, a / L)));
    const age = t - when;
    const life = 0.4 + 0.2 * hash(k, 2, 78);
    if (age < 0 || age > life) continue;
    const c = (hash(k, 3, 78) - 0.5) * 2 * CRACK.half * (age / life);
    const [fx, fy] = fl(a, c);
    if (!onSide(fx, fy, side)) continue;
    const [x, y] = at(a, c);
    const up = (20 + 20 * hash(k, 4, 78)) * 4 * (age / life) * (1 - age / life);
    const col = STONE[k % 3];
    dot(x, y - up, col);
    if (k % 2 === 0) dot(x + 1, y - up, col);
  }
  return { px, lights };
}
