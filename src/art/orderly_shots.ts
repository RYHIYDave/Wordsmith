// WHAT THE ORDERLIES' MALLET LEAVES ON THE FLOOR (the art chat, 19 Oct 2026). A MOCK-UP: NOT IN THE GAME. Nothing of the
// game draws this yet: how hard the blow hits and how wide are the main chat's, and this is the picture for it. As
// art/physician_shots.ts: drawn in the game's own pixels, given where a point of the floor is on the screen (`at`, from
// tiles).
//
// THE MALLET BLOW (art/orderlies_moves.ts): where the mallet's head slams into the floor, a ring of dust rolls out
// across the boards, splinters thrown up and falling, and a star of cracks left in the boards that fades
// (`drawMalletSlam`).

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
