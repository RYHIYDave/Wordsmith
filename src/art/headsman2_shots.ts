// WHAT THE HEADSMAN MADE NEW DOES TO THE FLOOR (the art chat, 17 Oct 2026). A MOCK-UP: NOT IN THE GAME, behind
// HEADSMAN2 (art/headsman2.ts, off); nothing of the game imports this file. As art/boss_shots.ts: drawn in the
// game's own pixels, as the floor's effects are, given where a point of the floor is on the screen (`FloorAt`).
//
// HIS VAULT'S SLAM. His words by 16:45 Pacific, 17 Oct, of its first film: "Bigger for sure, much bigger aoe on
// the hit with more force". So where the blade comes down (art/headsman2_moves.ts H2_VAULT.hit, the spot the game
// marks) the whole floor round it is struck, H2_SLAM.reach tiles every way:
//   while he gathers (the warning, `drawVaultMark`): a ring burns on the floor as wide as the slam will be, a
//     second running in toward the spot, and the stone inside it glowing in cracks as the blow comes;
//   the slam (`drawVaultSlam`, under him): a flash of the enemy's fire where the blade bit and rays of it out
//     across the stone; a shock ring of fire racing out to the slam's edge, a wave of dust thrown up close behind
//     it; the floor split open in wide cracks out to the edge, burning and then dark; a crater of broken stone
//     where it struck, its rim heaped up;
//   and over him (`drawVaultSlamOver`): a column of fire bursting up out of the crater and flames up out of the
//     cracks; chunks of the floor flung up and out all round, falling and bouncing; sparks; dust rolling out.
// What the slam hurts, how far it throws, how long the game is held still and how hard the screen shakes are
// the main chat's (H2_SLAM.freeze and .shake are what the films show). Its colours are the enemy's: pink and gold
// (never a friend's cyan).

import { hash } from './kit';
import { FLAME } from './mkit';
import type { FloorAt } from './mob_shots';
import { P } from './palette';

export const H2_SLAM = {
  /** How far the slam reaches, every way from where the blade bites (tiles). */
  reach: 2.5,
  /** How long what it does to the floor shows (seconds from the blow). */
  for: 1.8,
  /** In the films: the game held still at the blow (seconds), and the screen's kick (its pixels, dying away over `shakeFor` seconds). */
  freeze: 0.14,
  shake: 7,
  shakeFor: 0.45,
};

const clamp01 = (v: number): number => (v < 0 ? 0 : v > 1 ? 1 : v);
const easeOut = (k: number): number => 1 - (1 - clamp01(k)) ** 3;

/** A block of pixels, rounded, in a colour. */
function dotAt(g: CanvasRenderingContext2D, x: number, y: number, color: string, w = 1, h = 1): void {
  g.fillStyle = color;
  g.fillRect(Math.round(x), Math.round(y), w, h);
}
/** A crack across the floor, from (x, y) out along (dx, dy) for `long` tiles, jagged (the same jags each frame for one `seed`), drawn `k` of the way out: its screen pixels, each with how far along it is. */
function crack(at: FloorAt, x: number, y: number, dx: number, dy: number, long: number, seed: number, k: number, each: (sx: number, sy: number, f: number) => void): void {
  const sx0 = -dy;
  const sy0 = dx;
  const n = Math.max(2, Math.round(long * 5));
  let last: readonly [number, number] | null = null;
  for (let i = 0; i <= n; i++) {
    const f = i / n;
    if (f > k) break;
    const d = f * long;
    const off = i === 0 ? 0 : (hash(i, seed, 97) - 0.5) * 0.16 * (0.5 + f);
    const p = at(x + dx * d + sx0 * off, y + dy * d + sy0 * off);
    if (last) {
      const steps = Math.max(1, Math.ceil(Math.hypot(p[0] - last[0], p[1] - last[1])));
      for (let j = 0; j < steps; j++) each(last[0] + ((p[0] - last[0]) * j) / steps, last[1] + ((p[1] - last[1]) * j) / steps, f);
    }
    last = p;
  }
}
/** A ring on the floor round (x, y), `r` tiles, each of its points told to `each` (with how far round it is). */
function ring(at: FloorAt, x: number, y: number, r: number, each: (sx: number, sy: number, a: number) => void): void {
  const n = Math.max(40, Math.round(r * 46));
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    const [sx, sy] = at(x + Math.cos(a) * r, y + Math.sin(a) * r);
    each(sx, sy, a);
  }
}

/**
 * THE VAULT'S WARNING at the spot (x, y) (tiles): `k` from 0 as he plants the haft to 1 as the blade comes
 * down; `t` the clock (for what runs round). A ring burning as wide as the slam, a second running in from it
 * toward the spot over and over, the cracks of the slam to come glowing faintly in the stone, more as it nears.
 */
export function drawVaultMark(g: CanvasRenderingContext2D, at: FloorAt, x: number, y: number, k: number, t: number): void {
  if (k <= 0) return;
  const was = g.globalAlpha;
  const R = H2_SLAM.reach;
  const run = (t * 1.3) % 1;
  ring(at, x, y, R, (sx, sy, a) => {
    const lead = 1 - ((((a / (Math.PI * 2) - run) % 1) + 1) % 1);
    const hot = lead > 0.86 ? (lead - 0.86) / 0.14 : 0;
    g.globalAlpha = was * Math.min(1, 0.3 + 0.6 * k + 0.4 * hot);
    dotAt(g, sx, sy, hot > 0.5 ? FLAME[3] : FLAME[2], 2, 1);
    dotAt(g, sx, sy + 1, FLAME[0], 2, 1);
  });
  // (a ring running in from the edge toward the spot, again and again)
  const inward = R * (1 - ((t * 1.8) % 1));
  g.globalAlpha = was * 0.55 * k;
  ring(at, x, y, inward, (sx, sy, a) => {
    if (Math.floor((a / (Math.PI * 2)) * 60) % 2 === 0) dotAt(g, sx, sy, FLAME[1]);
  });
  // (the cracks to come, glowing faintly in the stone)
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * Math.PI * 2 + hash(i, 3, 89) * 0.5;
    crack(at, x, y, Math.cos(a), Math.sin(a), R * (0.55 + 0.35 * hash(i, 4, 89)), 60 + i, 0.35 + 0.65 * k, (sx, sy, f) => {
      g.globalAlpha = was * k * 0.45 * (1 - f * 0.6);
      dotAt(g, sx, sy, FLAME[1]);
    });
  }
  // (the spot itself)
  const [cx, cy] = at(x, y);
  g.globalAlpha = was * (0.5 + 0.5 * k);
  dotAt(g, cx - 3, cy - 1, FLAME[2], 7, 3);
  dotAt(g, cx - 1, cy, FLAME[3], 3, 1);
  g.globalAlpha = was;
}

/**
 * THE SLAM, at the spot (x, y) (tiles), `t` seconds after the blade comes down; (fx, fy) the way he faces on the
 * floor. Drawn under him: the floor's own (`drawVaultSlam`); over him: what flies and what burns up out of the
 * floor (`drawVaultSlamOver`).
 */
export function drawVaultSlam(g: CanvasRenderingContext2D, at: FloorAt, x: number, y: number, fx: number, fy: number, t: number): void {
  if (t < 0 || t >= H2_SLAM.for) return;
  void fx;
  void fy;
  const was = g.globalAlpha;
  const R = H2_SLAM.reach;
  const fade = t < H2_SLAM.for * 0.6 ? 1 : 1 - (t - H2_SLAM.for * 0.6) / (H2_SLAM.for * 0.4);
  const hot = clamp01(1 - t / 0.9);
  const [cx, cy] = at(x, y);
  // the cracks: out every way to the edge of it, racing out in the first fifth of a second, split wide and
  // burning, the fire dying back from their ends to the middle, then dark; and a branch off each
  const out = easeOut(t / 0.18);
  for (let i = 0; i < 14; i++) {
    const a = (i / 14) * Math.PI * 2 + hash(i, 5, 93) * 0.35;
    const long = R * (0.75 + 0.3 * hash(i, 6, 93));
    const draw = (sx: number, sy: number, f: number): void => {
      g.globalAlpha = was * fade;
      const burning = f < 0.15 + 0.85 * hot;
      const wide = f < 0.5 ? 3 : f < 0.8 ? 2 : 1;
      dotAt(g, sx - 1, sy, P.black, wide + 1, 2);
      if (burning) dotAt(g, sx, sy, f < 0.25 && hot > 0.6 ? FLAME[4] : f < 0.55 ? FLAME[3] : FLAME[2], Math.max(1, wide - 1), 1);
    };
    crack(at, x, y, Math.cos(a), Math.sin(a), long, 70 + i, out, draw);
    for (const side of [-1, 1]) {
      if (hash(i, side + 10, 93) < 0.35) continue;
      const b = a + side * (0.6 + 0.4 * hash(i, side + 12, 93));
      const from = 0.3 + 0.35 * hash(i, side + 14, 93);
      crack(at, x + Math.cos(a) * long * from, y + Math.sin(a) * long * from, Math.cos(b), Math.sin(b), long * 0.38, 90 + i * 3 + side, clamp01((out - from) / (1 - from)), (sx, sy, f) => draw(sx, sy, Math.min(1, from + f * 0.5)));
    }
  }
  // the crater: broken stone sunk where it struck, glowing at first, its rim of rubble heaped up
  for (let i = 0; i < 64; i++) {
    const a = (i / 64) * Math.PI * 2;
    const rr = 0.62 * (0.82 + 0.36 * hash(i, 9, 95));
    for (let j = 0; j <= 6; j++) {
      const [sx, sy] = at(x + Math.cos(a) * rr * (j / 6), y + Math.sin(a) * rr * (j / 6));
      g.globalAlpha = was * fade;
      dotAt(g, sx, sy, j === 6 ? (hash(i, 10, 95) < 0.5 ? P.st6 : P.st5) : j === 5 ? P.st4 : hot > 0.4 && j < 3 ? (j === 0 ? FLAME[3] : FLAME[1]) : P.black, j >= 5 ? 2 : 1, j >= 5 ? 2 : 1);
    }
  }
  // the shock ring of fire, racing out to the edge, and the wave of dust close behind it, thrown up
  if (t < 0.55) {
    const k = easeOut(t / 0.34);
    const r = 0.4 + (R - 0.4) * k;
    const fire = clamp01(1 - t / 0.5);
    ring(at, x, y, r, (sx, sy, a) => {
      g.globalAlpha = was * fire;
      dotAt(g, sx - 1, sy - 2, FLAME[4], 3, 1);
      dotAt(g, sx - 1, sy - 1, FLAME[3], 3, 2);
      dotAt(g, sx - 1, sy + 1, FLAME[1], 3, 1);
      const n = Math.round(a * 24);
      if (hash(n, 1, 99) < 0.45) dotAt(g, sx, sy - 3 - 7 * hash(n, 2, 99) * fire, hash(n, 5, 99) < 0.5 ? FLAME[3] : FLAME[2], 2, 2);
    });
    const rd = Math.max(0.3, r - 0.4);
    ring(at, x, y, rd, (sx, sy, a) => {
      const n = Math.round(a * 30);
      const h = 2 + 9 * hash(n, 3, 99) * Math.sin(Math.PI * clamp01(t / 0.55));
      g.globalAlpha = was * 0.85 * clamp01(1 - t / 0.55);
      dotAt(g, sx - 1, sy - h, hash(n, 4, 99) < 0.5 ? P.st6 : P.st4, 3, 3);
    });
  }
  // the flash where the blade bit, and its rays out across the stone
  if (t < 0.14) {
    const f = 1 - t / 0.14;
    g.globalAlpha = was * f;
    dotAt(g, cx - 14, cy - 6, FLAME[3], 29, 13);
    dotAt(g, cx - 8, cy - 3, FLAME[4], 17, 7);
    for (let i = 0; i < 18; i++) {
      const a = (i / 18) * Math.PI * 2 + 0.2;
      crack(at, x, y, Math.cos(a), Math.sin(a), R * 0.8 * (0.6 + 0.4 * hash(i, 11, 93)), 120 + i, 1, (sx, sy, k2) => {
        if (k2 > f) return;
        g.globalAlpha = was * f * (1 - k2 * 0.7);
        dotAt(g, sx, sy, k2 < 0.4 ? FLAME[4] : FLAME[3], 2, 2);
      });
    }
  }
  g.globalAlpha = was;
}

/** WHAT FLIES FROM THE SLAM AND BURNS UP OUT OF THE FLOOR, over everything, `t` seconds after the blow, at the spot (x, y) (tiles): fire bursting up out of the crater and the cracks; chunks of the floor flung up and out; sparks; dust rolling out. */
export function drawVaultSlamOver(g: CanvasRenderingContext2D, at: FloorAt, x: number, y: number, t: number): void {
  if (t < 0 || t >= 1.4) return;
  const was = g.globalAlpha;
  const R = H2_SLAM.reach;
  const [cx, cy] = at(x, y);
  // fire bursting up out of the crater, a column of it, and up out of the cracks as they split, dying down
  if (t < 0.5) {
    const k = clamp01(1 - t / 0.5);
    for (let i = 0; i < 14; i++) {
      const a = (i / 14) * Math.PI * 2 + hash(i, 1, 105);
      const rr = 0.45 * hash(i, 2, 105);
      const [sx, sy] = at(x + Math.cos(a) * rr, y + Math.sin(a) * rr);
      const tall = (36 + 46 * hash(i, 3, 105)) * k * (0.7 + 0.3 * Math.sin(t * 40 + i));
      for (let j = 0; j < tall; j += 2) {
        const f = j / Math.max(1, tall);
        g.globalAlpha = was * Math.min(1, k * 1.4) * (1 - f * 0.5);
        dotAt(g, sx - 1 + Math.sin(j * 0.3 + i + t * 30) * f * 2, sy - j, f < 0.3 ? FLAME[4] : f < 0.6 ? FLAME[3] : f < 0.85 ? FLAME[2] : FLAME[1], f < 0.6 ? 3 : 2, 2);
      }
    }
    for (let i = 0; i < 14; i++) {
      const a = (i / 14) * Math.PI * 2 + hash(i, 5, 93) * 0.35;
      const along2 = R * (0.75 + 0.3 * hash(i, 6, 93)) * (0.25 + 0.6 * hash(i, 4, 105)) * easeOut(t / 0.18);
      const [sx, sy] = at(x + Math.cos(a) * along2, y + Math.sin(a) * along2);
      const tall = (14 + 20 * hash(i, 6, 105)) * k;
      for (let j = 0; j < tall; j += 2) {
        const f = j / Math.max(1, tall);
        g.globalAlpha = was * k * (1 - f * 0.6);
        dotAt(g, sx, sy - j, f < 0.4 ? FLAME[3] : FLAME[2], 2, 2);
      }
    }
  }
  // chunks of the floor: each out along its own way, up and down again, a bounce, and lying; stone lit on top and dark under
  for (let i = 0; i < 40; i++) {
    const a = (i / 40) * Math.PI * 2 + hash(i, 1, 101) * 0.3;
    const far = R * (0.3 + 0.85 * hash(i, 2, 101));
    const T = 0.5 + 0.3 * hash(i, 3, 101);
    const k = clamp01(t / T);
    const d = far * (1 - (1 - k) ** 1.6);
    const up = 46 + 60 * hash(i, 4, 101);
    let h = up * 4 * k * (1 - k);
    if (t > T && t < T + 0.2) h = 7 * Math.sin((Math.PI * (t - T)) / 0.2) * hash(i, 5, 101);
    const [sx, sy] = at(x + Math.cos(a) * d, y + Math.sin(a) * d);
    const big = hash(i, 6, 101) < 0.4 ? 4 : 3;
    g.globalAlpha = was * clamp01((1.4 - t) / 0.4);
    if (h > 2) {
      g.globalAlpha *= 0.4;
      dotAt(g, sx, sy + 1, P.black, big, 1);
      g.globalAlpha = was * clamp01((1.4 - t) / 0.4);
    }
    dotAt(g, sx, sy - h + big - 1, P.ink, big, 1);
    dotAt(g, sx, sy - h, i % 3 === 0 ? P.st6 : P.st5, big, big - 1);
    dotAt(g, sx, sy - h, P.st6, big - 1, 1);
  }
  // sparks of the enemy's fire, flung out fast, falling and going out
  if (t < 0.7) {
    for (let i = 0; i < 30; i++) {
      const a = (i / 30) * Math.PI * 2 + hash(i, 7, 103);
      const v = R * (0.8 + 0.9 * hash(i, 8, 103));
      const d = v * easeOut(t / 0.7);
      const h = (28 + 44 * hash(i, 9, 103)) * Math.sin(Math.PI * clamp01(t / 0.7));
      const [sx, sy] = at(x + Math.cos(a) * d, y + Math.sin(a) * d);
      g.globalAlpha = was * clamp01(1 - t / 0.7);
      dotAt(g, sx, sy - h, t < 0.25 ? FLAME[4] : FLAME[3], 2, 2);
    }
  }
  // dust rolling out over the floor after the ring, low and slow, thinning
  if (t > 0.12) {
    const k = clamp01((t - 0.12) / 1.2);
    for (let i = 0; i < 44; i++) {
      const a = (i / 44) * Math.PI * 2 + hash(i, 11, 107) * 0.2;
      const d = R * (0.5 + 0.6 * hash(i, 12, 107)) * easeOut(k);
      const [sx, sy] = at(x + Math.cos(a) * d, y + Math.sin(a) * d);
      const h = 3 + 10 * hash(i, 13, 107) * k;
      g.globalAlpha = was * 0.6 * (1 - k);
      dotAt(g, sx - 2, sy - h, hash(i, 14, 107) < 0.5 ? P.st5 : P.st4, 4 + Math.round(3 * hash(i, 15, 107)), 3);
    }
  }
  void cx;
  void cy;
  g.globalAlpha = was;
}
