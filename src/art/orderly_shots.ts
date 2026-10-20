// WHAT THE ORDERLIES' MALLET LEAVES ON THE FLOOR (the art chat, 19 Oct 2026). A MOCK-UP: NOT IN THE GAME. Nothing of the
// game draws this yet: how hard the blow hits and how wide are the main chat's, and this is the picture for it. As
// art/physician_shots.ts: drawn in the game's own pixels, given where a point of the floor is on the screen (`at`, from
// tiles).
//
// THE MALLET BLOW (art/orderlies_moves.ts): where the mallet's head slams into the floor, a ring of dust rolls out
// across the boards, splinters thrown up and falling, and a star of cracks left in the boards that fades
// (`drawMalletSlam`).
//
// THE QUAKE (their second blow, the bigger, art/orderlies_moves.ts OD_QUAKE): through its warning a ring of the enemy's
// pink marked on the floor round where the mallet will come down, its dashes marching round, the floor inside it
// darkening (`drawQuakeWarn`); where it lands, the floor shaken out round it: a great ring of dust and splinters rolling
// out to QUAKE_REACH, the boards jumping as it passes, and cracks run out from where it struck, fading (`drawQuake`).

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
/** The dust thrown up: paler than any floor of the house, so that it shows over sawdust and boards alike. */
const DUST = ['#8a8472', '#aaa48e', '#c6bfa8', '#ddd6c0'];
const SPLINTER = ['#3a2c1c', '#6a5436'];
const SEAM = '#1a1612';

/** How far the ring of dust rolls out (tiles), how long it lasts, and how long the cracks stay (seconds). */
export const SLAM_REACH = 1.1;
export const SLAM_FOR = 0.6;
export const SLAM_CRACKS_FOR = 1.6;

/** WHERE THE MALLET STRUCK at (x, y) (tiles), `t` seconds after: a ring of dust rolling out and thinning; splinters thrown up and down; a star of cracks in the boards, fading. */
export function drawMalletSlam(g: CanvasRenderingContext2D, at: FloorAt, x: number, y: number, t: number): void {
  if (t < 0 || t >= Math.max(SLAM_FOR, SLAM_CRACKS_FOR)) return;
  const was = g.globalAlpha;
  // the cracks: seven, run out at once, fading
  if (t < SLAM_CRACKS_FOR) {
    g.globalAlpha = 1 - sm((t - (SLAM_CRACKS_FOR - 0.6)) / 0.6);
    for (let i = 0; i < 7; i++) {
      let a = (i / 7) * Math.PI * 2 + hash(i, 1, 7701) * 0.6;
      let px = x;
      let py = y;
      const long = 0.35 + 0.35 * hash(i, 2, 7701);
      const steps = 8;
      for (let k = 0; k < steps; k++) {
        a += (hash(i, k, 7702) - 0.5) * 0.7;
        px += (Math.cos(a) * long) / steps;
        py += (Math.sin(a) * long) / steps;
        const [sx, sy] = at(px, py);
        dotAt(g, sx, sy, SEAM);
      }
    }
  }
  if (t < SLAM_FOR) {
    const q = t / SLAM_FOR;
    // the ring of dust: rolling out, thick at its front, thinning
    const R = 0.15 + (SLAM_REACH - 0.15) * sm(q * 1.4);
    const n = Math.ceil(24 + R * 60);
    for (let j = 0; j < 3; j++) {
      const r = R * (1 - 0.12 * j);
      for (let i = 0; i < n; i++) {
        if (hash(i, j + Math.floor(t * 20) * 3, 7703) < 0.25 + 0.6 * q) continue;
        const a = (i / n) * Math.PI * 2;
        const [sx, sy] = at(x + Math.cos(a) * r, y + Math.sin(a) * r);
        g.globalAlpha = (0.9 - 0.25 * j) * (1 - q);
        dotAt(g, sx, sy - 1 - 2 * Math.sin(Math.PI * q) * hash(i, j, 7704), DUST[3 - j], j === 0 ? 2 : 1, 1);
      }
    }
    // splinters thrown up and falling
    for (let i = 0; i < 12; i++) {
      const a = i * 2.39996;
      const r = 0.1 + 0.6 * Math.sqrt(q) * (0.5 + hash(i, 3, 7705));
      const [sx, sy] = at(x + Math.cos(a) * r, y + Math.sin(a) * r);
      g.globalAlpha = 1 - q * q;
      dotAt(g, sx, sy - 22 * 4 * q * (1 - q) * hash(i, 4, 7705), SPLINTER[i % 2], i % 3 === 0 ? 2 : 1, 1);
    }
  }
  g.globalAlpha = was;
}

/** How far the quake shakes the floor out (tiles, from where the mallet struck), how long its ring takes, and how long its cracks stay (seconds). */
export const QUAKE_REACH = 2.2;
export const QUAKE_FOR = 0.7;
export const QUAKE_CRACKS_FOR = 2.0;
/** THE QUAKE'S WARNING, `k` of the way through it (0 to 1): a ring of the enemy's pink round (x, y) at QUAKE_REACH, its dashes marching round, brightening, the floor inside it darkening. */
export function drawQuakeWarn(g: CanvasRenderingContext2D, at: FloorAt, x: number, y: number, k: number): void {
  if (k <= 0 || k > 1) return;
  const was = g.globalAlpha;
  // (the floor inside darkening: a sparse dither, thicker as it comes)
  for (let i = 0; i < 140; i++) {
    const a = i * 2.39996;
    const r = QUAKE_REACH * Math.sqrt((i + 0.5) / 140);
    if (hash(i, 1, 7711) > 0.25 + 0.45 * k) continue;
    const [sx, sy] = at(x + Math.cos(a) * r, y + Math.sin(a) * r);
    g.globalAlpha = 0.35 * k;
    dotAt(g, sx, sy, '#1a1016', 2, 1);
  }
  // (its ring, dashed, marching round)
  const n = 96;
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    if ((Math.floor(i / 4 + k * 10) & 1) === 0) continue;
    const [sx, sy] = at(x + Math.cos(a) * QUAKE_REACH, y + Math.sin(a) * QUAKE_REACH);
    g.globalAlpha = 0.45 + 0.55 * k;
    dotAt(g, sx, sy, k > 0.75 ? FLAME[3] : FLAME[2], 2, 1);
  }
  g.globalAlpha = was;
}
/** WHERE THE QUAKE STRUCK at (x, y) (tiles), `t` seconds after: a great ring of dust and splinters rolling out to QUAKE_REACH, the boards jumping as it passes; cracks run out from where it struck, fading. */
export function drawQuake(g: CanvasRenderingContext2D, at: FloorAt, x: number, y: number, t: number): void {
  if (t < 0 || t >= Math.max(QUAKE_FOR, QUAKE_CRACKS_FOR)) return;
  const was = g.globalAlpha;
  // the cracks: twelve, run out at once, branching, fading
  g.globalAlpha = 1 - sm((t - (QUAKE_CRACKS_FOR - 0.7)) / 0.7);
  for (let i = 0; i < 12; i++) {
    let a = (i / 12) * Math.PI * 2 + hash(i, 1, 7712) * 0.5;
    let px = x;
    let py = y;
    const long = 0.6 + 0.6 * hash(i, 2, 7712);
    const steps = 12;
    for (let k = 0; k < steps; k++) {
      a += (hash(i, k, 7713) - 0.5) * 0.6;
      px += (Math.cos(a) * long) / steps;
      py += (Math.sin(a) * long) / steps;
      const [sx, sy] = at(px, py);
      dotAt(g, sx, sy, SEAM, k < 4 ? 2 : 1, 1);
      // (a branch off the larger ones)
      if (k === 6 && hash(i, 3, 7712) > 0.5) {
        let bx = px;
        let by = py;
        const b = a + (hash(i, 4, 7712) > 0.5 ? 0.8 : -0.8);
        for (let j = 1; j <= 4; j++) {
          bx += Math.cos(b) * 0.05;
          by += Math.sin(b) * 0.05;
          const [cx, cy] = at(bx, by);
          dotAt(g, cx, cy, SEAM);
        }
      }
    }
  }
  if (t < QUAKE_FOR) {
    const q = t / QUAKE_FOR;
    // the ring: rolling out, thick at its front, thinning as it goes
    const R = 0.2 + (QUAKE_REACH - 0.2) * sm(Math.min(1, q * 1.25));
    const n = Math.ceil(36 + R * 70);
    for (let j = 0; j < 4; j++) {
      const r = R * (1 - 0.08 * j);
      for (let i = 0; i < n; i++) {
        if (hash(i, j + Math.floor(t * 20) * 4, 7714) < 0.2 + 0.6 * q) continue;
        const a = (i / n) * Math.PI * 2;
        const [sx, sy] = at(x + Math.cos(a) * r, y + Math.sin(a) * r);
        g.globalAlpha = (0.95 - 0.2 * j) * (1 - q);
        dotAt(g, sx, sy - 1 - 3 * Math.sin(Math.PI * q) * hash(i, j, 7715), DUST[3 - Math.min(3, j)], j < 2 ? 2 : 1, 1);
      }
    }
    // the boards jumping as the ring passes: splinters and chips thrown up at its front, falling back
    for (let i = 0; i < 28; i++) {
      const a = i * 2.39996;
      const r0 = 0.3 + (QUAKE_REACH - 0.3) * hash(i, 5, 7716);
      const passed = R - r0;
      if (passed < 0 || passed > 0.9) continue;
      const u = passed / 0.9;
      const [sx, sy] = at(x + Math.cos(a) * r0, y + Math.sin(a) * r0);
      g.globalAlpha = 1 - u;
      dotAt(g, sx, sy - 14 * 4 * u * (1 - u), SPLINTER[i % 2], i % 3 === 0 ? 2 : 1, 1);
    }
  }
  g.globalAlpha = was;
}
