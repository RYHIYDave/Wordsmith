// WHAT THE HUSHED WATCH'S ROUND SWEEP LEAVES ON THE FLOOR (the art chat, 19 Oct 2026). A MOCK-UP: NOT IN THE GAME.
// Nothing of the game draws this yet: whom the blade strikes as it comes round, and how hard, are the main chat's; this
// is the picture for it. As art/carter_shots.ts: drawn in the game's own pixels, given where a point of the floor is on
// the screen (`at`, from tiles).
//
// THE ROUND SWEEP (their second blow, art/hushed_watch_moves.ts WA_ROUND): through its warning a ring of the enemy's
// pink all the way round them as far as the halberd reaches, ROUND_REACH tiles, its dashes marching round the way it
// will go, the floor inside it darkening (`drawRoundWarn`); as the blade comes round, the dust of the floor whipped up
// under it in its wake, and its streak of pink a moment where it has just been (`drawRoundWake`).

import { hash } from './kit';
import { FLAME } from './mkit';
import { WA_ROUND, roundBladeAt } from './hushed_watch_moves';
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

/** How far round them the halberd reaches as it goes round (tiles: its top spike, 2.4 to 2.56 through the spin). */
export const ROUND_REACH = 2.5;
/** How long the dust whipped up under the blade hangs (seconds), and its streak of pink. */
export const ROUND_DUST_FOR = 0.5;
export const ROUND_STREAK_FOR = 0.1;
/** When the blade's wake begins and ends (seconds into the move): as the spin gets going, to as it slows. */
export const ROUND_WAKE = [WA_ROUND.spin[0] + 0.1, WA_ROUND.spin[1]] as const;

/** Where the blade is at each frame of the spin (seconds; its bearing to their left of the way they began facing, radians; and how far out, tiles). */
let PATH: [number, number, number][] | null = null;
function path(): [number, number, number][] {
  if (!PATH) {
    PATH = [];
    for (let i = Math.floor(ROUND_WAKE[0] * 30); i <= Math.ceil(ROUND_WAKE[1] * 30); i++) {
      const b = roundBladeAt(i / 30);
      PATH.push([i / 30, b.bearing, b.reach]);
    }
  }
  return PATH;
}

/** THE WARNING, `k` of the way through it (0 to 1), round them at (x, y): a ring of pink as far as the halberd reaches, its dashes marching round to their left, brightening; the floor inside it darkening toward its edge. `t`: the time (seconds). */
export function drawRoundWarn(g: CanvasRenderingContext2D, at: FloorAt, x: number, y: number, k: number, t: number): void {
  if (k <= 0 || k > 1) return;
  const was = g.globalAlpha;
  const shown = sm(k / 0.3);
  // (the floor it sweeps, darkening toward the ring)
  for (let i = 0; i < 90; i++) {
    const a = i * 2.39996;
    const r = ROUND_REACH * (0.45 + 0.53 * Math.sqrt((i + 0.5) / 90));
    const [sx, sy] = at(x + Math.cos(a) * r, y + Math.sin(a) * r);
    g.globalAlpha = was * 0.32 * shown * (r / ROUND_REACH);
    dotAt(g, sx, sy, '#1a1016', 2, 1);
  }
  const n = 72;
  for (let j = 0; j < n; j++) {
    if ((Math.floor(j / 3 - t * 9) & 1) === 0) continue;
    const a = (j / n) * Math.PI * 2;
    const [sx, sy] = at(x + Math.cos(a) * ROUND_REACH, y + Math.sin(a) * ROUND_REACH);
    g.globalAlpha = was * shown * (0.45 + 0.55 * k);
    dotAt(g, sx, sy, k > 0.75 ? FLAME[3] : FLAME[2], 2, 1);
  }
  g.globalAlpha = was;
}

/**
 * THE BLADE'S WAKE round them at (x, y), facing (fx, fy) as they began, `t` seconds into the move: the dust of the
 * floor whipped up under where the blade has passed, swirling round after it and settling; and the blade's streak of
 * pink a moment just behind it, out at its reach.
 */
export function drawRoundWake(g: CanvasRenderingContext2D, at: FloorAt, x: number, y: number, fx: number, fy: number, t: number): void {
  if (t < ROUND_WAKE[0] || t > ROUND_WAKE[1] + ROUND_DUST_FOR) return;
  const was = g.globalAlpha;
  const face = Math.atan2(fy, fx);
  // (their left on the floor is the way they face turned a quarter round, (fy, -fx): the bearing goes the other way round on it)
  const spot = (b: number, r: number): readonly [number, number] => at(x + Math.cos(face - b) * r, y + Math.sin(face - b) * r);
  const P = path();
  for (let i = 1; i < P.length; i++) {
    const [t1, b1, r1] = P[i];
    const [, b0, r0] = P[i - 1];
    const age = t - t1;
    if (age < 0 || age > ROUND_DUST_FOR) continue;
    const q = age / ROUND_DUST_FOR;
    // the dust under the stretch of floor the blade crossed this frame, whipped up and on round after it, settling
    for (let j = 0; j < 8; j++) {
      const u = (j + hash(i, j, 9311)) / 8;
      const b = b0 + (b1 - b0) * u + 0.25 * q * (0.4 + hash(i, j, 9312));
      const r = (r0 + (r1 - r0) * u) * (0.55 + 0.4 * hash(i, j, 9313));
      const [sx, sy] = spot(b, r);
      g.globalAlpha = was * 0.8 * (1 - q);
      dotAt(g, sx, sy - 1 - 4 * Math.sin(Math.PI * Math.min(1, q * 1.4)) * (0.5 + hash(i, j, 9314)), DUST[j % 3]);
    }
    // the streak of pink just behind the blade, out at its reach
    if (age <= ROUND_STREAK_FOR) {
      g.globalAlpha = was * (1 - age / ROUND_STREAK_FOR);
      for (let j = 0; j <= 6; j++) {
        const u = j / 6;
        const [sx, sy] = spot(b0 + (b1 - b0) * u, (r0 + (r1 - r0) * u) * 0.95);
        dotAt(g, sx, sy - 2, age < ROUND_STREAK_FOR / 2 ? FLAME[3] : FLAME[2], 2, 1);
      }
    }
  }
  g.globalAlpha = was;
}
