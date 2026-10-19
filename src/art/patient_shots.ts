// WHAT THE HUSHED PATIENTS LET OUT ON THE FLOOR (the art chat, 19 Oct 2026). A MOCK-UP: NOT IN THE GAME. Nothing of the
// game draws this yet: how far the scream reaches, how wide, and what it does to the hero are the main chat's, and this
// is the picture for them. As art/physician_shots.ts: drawn in the game's own pixels, given where a point of the floor
// is on the screen (`at`, from tiles).
//
// THE SILENT SCREAM (art/patients_moves.ts, their blow): from the patient's mouth, at the moment of the scream, a burst
// of the Hush blasting out across the floor before them in a widening fan, its front a ragged wave of grey that rolls
// out to SCREAM_REACH and breaks up, the dust of the floor thrown back from it (`drawScreamBurst`).

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
/** The Hush, darkest to palest; the floor's dust. */
const HUSH = ['#262234', '#3e3852', '#625a7a', '#9890b4', '#b6b0cc'];
const DUST = ['#4a4438', '#6e6656', '#958c78'];

/** How far the scream's burst rolls out before them (tiles), how wide it opens (half its angle, degrees), and how long it lasts (seconds). */
export const SCREAM_REACH = 1.8;
export const SCREAM_HALF = 34;
export const SCREAM_FOR = 0.6;
/** How high off the floor the burst leaves the mouth (game pixels), falling to the floor as it rolls out. */
const MOUTH_UP = 22;

/**
 * THE SILENT SCREAM'S BURST from a patient standing at (x, y) (tiles), screaming along (dx, dy) (any length), `t`
 * seconds after the scream: a fan of the Hush rolling out from the mouth and down to the floor, its front a ragged wave
 * that reaches SCREAM_REACH and breaks up; drawn in a fine dither so what is under it shows through.
 */
export function drawScreamBurst(g: CanvasRenderingContext2D, at: FloorAt, x: number, y: number, dx: number, dy: number, t: number): void {
  if (t < 0 || t >= SCREAM_FOR) return;
  const q = t / SCREAM_FOR;
  const l = Math.hypot(dx, dy) || 1;
  const ux = dx / l;
  const uy = dy / l;
  const half = (SCREAM_HALF * Math.PI) / 180;
  const front = 0.15 + (SCREAM_REACH - 0.15) * sm(q * 1.25);
  const was = g.globalAlpha;
  const fade = 1 - sm((q - 0.55) / 0.45);
  const along = (a: number, rr: number): [number, number] => {
    const [sx, sy0] = at(x + (ux * Math.cos(a) - uy * Math.sin(a)) * rr, y + (uy * Math.cos(a) + ux * Math.sin(a)) * rr);
    // (up off the floor at the mouth, down onto it by half way)
    return [sx, sy0 - MOUTH_UP * (1 - sm(rr / (SCREAM_REACH * 0.55)))];
  };
  // the fan: from the mouth out to its front, thicker toward its front; it falls to the floor as it goes
  const rows = 30;
  for (let i = 0; i < rows; i++) {
    const r = front * (0.22 + 0.78 * (i / (rows - 1)));
    const edge = 1 - (front - r) / Math.max(0.2, front);
    const n = Math.ceil(10 + r * 30);
    for (let j = 0; j < n; j++) {
      const a = -half + (2 * half * (j + 0.5)) / n + 0.06 * Math.sin(i * 1.7 + j);
      const rr = r + 0.08 * Math.sin(a * 9 + t * 22 + i) * edge;
      const [sx, sy] = along(a, rr);
      const want = (0.5 + 0.5 * edge * edge) * fade;
      if (hash(i * 31 + j, Math.floor(t * 30), 7801) > want) continue;
      const tone = edge > 0.85 ? 4 : edge > 0.6 ? 3 : edge > 0.35 ? 2 : 1;
      g.globalAlpha = 0.85;
      dotAt(g, sx, sy, HUSH[tone], edge > 0.7 ? 2 : 1, 1);
    }
  }
  // its front: a ragged wave of the Hush rolling out, and a fainter one behind it
  for (const [k, tone, alpha] of [[1, 4, 0.95], [0.72, 3, 0.6]] as const) {
    const r = front * k;
    const n = Math.ceil(16 + r * 40);
    for (let j = 0; j < n; j++) {
      const a = -half * 1.05 + (2.1 * half * (j + 0.5)) / n;
      if (hash(j, Math.floor(t * 30) + k * 7, 7803) < 0.15 + 0.5 * q) continue;
      const [sx, sy] = along(a, r + 0.05 * Math.sin(a * 13 + t * 30));
      g.globalAlpha = alpha * fade;
      dotAt(g, sx, sy - 1, HUSH[tone], 2, 1);
      dotAt(g, sx, sy, HUSH[tone - 2], 2, 1);
    }
  }
  // the dust of the floor thrown back where the front passes over it
  for (let i = 0; i < 18; i++) {
    const a = -half + 2 * half * hash(i, 1, 7802);
    const r = front * (0.85 + 0.15 * hash(i, 2, 7802));
    const [sx, sy] = at(x + (ux * Math.cos(a) - uy * Math.sin(a)) * r, y + (uy * Math.cos(a) + ux * Math.sin(a)) * r);
    g.globalAlpha = 0.7 * (1 - q);
    dotAt(g, sx + ux * 3 * q, sy - 3 * hash(i, 3, 7802) * q, DUST[i % 3]);
  }
  g.globalAlpha = was;
}
