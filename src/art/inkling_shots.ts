// AN INKLING GOING ABOUT AS A POOL OF INK (the art chat, 19 Oct 2026). A MOCK-UP: NOT IN THE GAME. Nothing of the game
// draws this yet: when the inklings sink into their pools, where they slide and how fast, and where they rise again, are
// the main chat's; this is the picture for it. As art/censor_shots.ts: drawn in the game's own pixels, given where a
// point of the floor is on the screen (`at`, from tiles).
//
// THE INKLINGS (art/inklings.ts, art/inklings_moves.ts): sunk into a pool of the Order's ink (their move `melt`), they
// slide along the floor as that pool, its surface rippling, its edge creeping, two pink eyes surfacing in it now and
// then, a trail of wet ink left behind it drying away (`drawInkPool`); then rise up out of it (their move `rise`).

import { hash } from './kit';
import { FLAME } from './mkit';
import type { FloorAt } from './mob_shots';

const clamp01 = (v: number): number => (v < 0 ? 0 : v > 1 ? 1 : v);
function dotAt(g: CanvasRenderingContext2D, x: number, y: number, color: string, w = 1, h = 1): void {
  g.fillStyle = color;
  g.fillRect(Math.round(x), Math.round(y), w, h);
}
const INK = ['#040306', '#0c0a11', '#18151f', '#3a3548'];

/** How wide the pool is (tiles of radius); how long the trail behind it lies (tiles), drying away along it. */
export const IK_POOL_R = 0.42;
export const IK_TRAIL = 1.4;
/**
 * AN INKLING'S POOL at (x, y) (tiles), going along (dx, dy) (tiles a second; 0 and 0 for a pool lying still), `t`
 * seconds into its going: a ragged pool of black ink, its surface rippling, a sheen across it; two pink eyes surfacing
 * in it now and then; a trail of ink drying away behind it.
 */
export function drawInkPool(g: CanvasRenderingContext2D, at: FloorAt, x: number, y: number, dx: number, dy: number, t: number): void {
  const was = g.globalAlpha;
  g.globalAlpha = 1;
  const sp = Math.hypot(dx, dy);
  const ux = sp > 0 ? dx / sp : 1;
  const uy = sp > 0 ? dy / sp : 0;
  // THE TRAIL behind it: wet next to it, broken and drying further back
  if (sp > 0) {
    const n = Math.ceil(IK_TRAIL / 0.05);
    for (let i = 0; i < n; i++) {
      const s = IK_POOL_R * 0.6 + (i / n) * IK_TRAIL;
      const k = s / (IK_TRAIL + IK_POOL_R);
      if (hash(i, Math.floor(t * 4), 8701) < k * 1.1) continue;
      const o = (hash(i, 2, 8701) - 0.5) * IK_POOL_R * (1 - k);
      const [sx, sy] = at(x - ux * s - uy * o, y - uy * s + ux * o);
      dotAt(g, sx, sy, k > 0.6 ? INK[2] : INK[0], k < 0.4 ? 2 : 1, 1);
    }
  }
  // THE POOL: a ragged round of ink, the edge creeping, lengthened along the way it goes
  const stretch = 1 + 0.35 * clamp01(sp / 2);
  const N = 22;
  for (let i = -N; i <= N; i++) {
    for (let j = -N; j <= N; j++) {
      const u = (i / N) * IK_POOL_R * 1.3 * stretch;
      const v = (j / N) * IK_POOL_R * 1.3;
      const a = Math.atan2(v, u / stretch);
      const rag = IK_POOL_R * (1 + 0.14 * Math.sin(a * 5 + t * 6) + 0.07 * Math.sin(a * 9 - t * 9));
      const d = Math.hypot(u / stretch, v);
      if (d > rag) continue;
      const wx = x + ux * u - uy * v;
      const wy = y + uy * u + ux * v;
      const [sx, sy] = at(wx, wy);
      // its surface: rippling rings, a cold sheen across its front
      const ring = Math.abs(((d / IK_POOL_R) * 3 - t * 2) % 1) < 0.12;
      const sheen = Math.abs(u * 0.4 - v - IK_POOL_R * 0.3) < 0.03;
      dotAt(g, sx, sy, sheen ? INK[3] : ring ? INK[2] : d > rag - 0.05 ? INK[1] : INK[0]);
    }
  }
  // TWO PINK EYES surfacing in it now and then, blinking
  const phase = (t * 0.7 + hash(Math.floor(x * 3), Math.floor(y * 3), 8702)) % 1;
  if (phase < 0.45) {
    const open = Math.sin((phase / 0.45) * Math.PI);
    for (const s of [-1, 1]) {
      const ex = x + ux * IK_POOL_R * 0.25 - uy * s * 0.08;
      const ey = y + uy * IK_POOL_R * 0.25 + ux * s * 0.08;
      const [sx, sy] = at(ex, ey);
      dotAt(g, sx, sy, open > 0.5 ? FLAME[1] : FLAME[3]);
      if (open > 0.6) dotAt(g, sx, sy - 1, FLAME[0]);
    }
  }
  g.globalAlpha = was;
}
