// ACT 2, PART TWO, THE HIGH CITY: FLOOR 16: WHERE A BLOW OF THE GARDENS' OWN WILL LAND, MARKED ON THE FLOOR through its wind-up
// (the swans' bite, the gardeners' shears, the grooms' fork, the palace guard's thrust and sweep: render/act1_fx/swan.ts,
// gardener.ts, groom.ts, pguard.ts), so that one who sees it can step out of it. His rule of 28 Oct 2026 (“And bigger AOE to
// compensate for the extra time the player gets to evade”): their blows strike further than they used to, and the wind-up is
// the player's time to get out; so where it will strike is shown.
//
// Drawn as the Hush's warnings are (art/watch_shots.ts drawRoundWarn, art/orderly_shots.ts drawQuakeWarn), in the game's own
// pixels: the edge of what will be struck a dashed line of the enemy's pink (FLAME), its dashes marching on as the blow comes,
// brightening; the floor inside darkening, a sparse dither growing thicker. Nothing in it glows, and nothing is cyan.
// A strip before one of them (`drawStripWarn`) or a fan round them (`drawFanWarn`), laid by where it stands, the way it faces and
// the hand it is drawn with, as its rules strike (game/facing.ts beside: the same left as R.rel).

import { hash } from '../../art/kit';
import { FLAME } from '../../art/mkit';
import type { FloorAt } from '../../art/mob_shots';
import { beside } from '../../game/facing';

const clamp01 = (v: number): number => (v < 0 ? 0 : v > 1 ? 1 : v);
const sm = (v: number): number => {
  const c = clamp01(v);
  return c * c * (3 - 2 * c);
};
/** The darkening of the floor inside (the Hush's warnings' own). */
const SHADE = '#1a1016';
/** How far apart the edge's dots are (tiles), and how many to a dash. */
const STEP = 0.07;
const DASH = 3;

function dotAt(g: CanvasRenderingContext2D, x: number, y: number, color: string, w = 2, h = 1): void {
  g.fillStyle = color;
  g.fillRect(Math.round(x), Math.round(y), w, h);
}

/** Who is warning: where it stands, the way it faces, and the hand it is drawn with. */
export interface WarnFrom {
  x: number;
  y: number;
  fx: number;
  fy: number;
  hand: number;
}

/** How far through a wind-up a warning is, from `from` to the blow at `hit`: 0 to 1 (outside it, -1: not drawn). */
export function warnK(t: number, from: number, hit: number): number {
  return t < from || t > hit ? -1 : clamp01((t - from) / Math.max(1e-6, hit - from));
}

/** Its edge, dashed and marching: `pts` a closed run of floor points; `k` how far through the warning; `t` the clock. */
function edge(g: CanvasRenderingContext2D, at: FloorAt, pts: ReadonlyArray<readonly [number, number]>, k: number, t: number, shown: number): void {
  const was = g.globalAlpha;
  let j = 0;
  for (let i = 0; i < pts.length; i++) {
    const [ax, ay] = pts[i];
    const [bx, by] = pts[(i + 1) % pts.length];
    const n = Math.max(1, Math.round(Math.hypot(bx - ax, by - ay) / STEP));
    for (let s = 0; s < n; s++, j++) {
      if ((Math.floor(j / DASH - t * 9) & 1) === 0) continue;
      const u = s / n;
      const [sx, sy] = at(ax + (bx - ax) * u, ay + (by - ay) * u);
      g.globalAlpha = was * shown * (0.45 + 0.55 * k);
      dotAt(g, sx, sy, k > 0.75 ? FLAME[3] : FLAME[2]);
    }
  }
  g.globalAlpha = was;
}

/** The floor inside darkening: `n` points through it (`inside(i)`, null for none), more of them shown as `k` comes on. */
function shade(g: CanvasRenderingContext2D, at: FloorAt, n: number, inside: (i: number) => readonly [number, number] | null, k: number, shown: number): void {
  const was = g.globalAlpha;
  for (let i = 0; i < n; i++) {
    if (hash(i, 1, 7721) > 0.3 + 0.5 * k) continue;
    const p = inside(i);
    if (!p) continue;
    const [sx, sy] = at(p[0], p[1]);
    g.globalAlpha = was * 0.35 * shown * (0.5 + 0.5 * k);
    dotAt(g, sx, sy, SHADE);
  }
  g.globalAlpha = was;
}

/**
 * A STRIP BEFORE ONE OF THEM: from `from` to `to` tiles before it, from `left0` to `left1` to the left it is drawn with; `k` how
 * far through the warning (0 to 1), `t` the clock (seconds).
 */
export function drawStripWarn(g: CanvasRenderingContext2D, at: FloorAt, w: WarnFrom, from: number, to: number, left0: number, left1: number, k: number, t: number): void {
  if (k < 0 || k > 1) return;
  const p = (fwd: number, left: number): readonly [number, number] => {
    const q = beside(w.x, w.y, w.fx, w.fy, w.hand, fwd, left);
    return [q.x, q.y];
  };
  const shown = sm(k / 0.25);
  const area = (to - from) * (left1 - left0);
  const n = Math.round(area * 60);
  shade(g, at, n, (i) => p(from + (to - from) * hash(i, 2, 7722), left0 + (left1 - left0) * hash(i, 3, 7723)), k, shown);
  edge(g, at, [p(from, left0), p(to, left0), p(to, left1), p(from, left1)], k, t, shown);
}

/**
 * A FAN ROUND ONE OF THEM: from bearing `b0` round to `b1` (radians to the left it is drawn with of the way it faces), `r`
 * tiles out from where it stands; `k` how far through the warning, `t` the clock.
 */
export function drawFanWarn(g: CanvasRenderingContext2D, at: FloorAt, w: WarnFrom, b0: number, b1: number, r: number, k: number, t: number): void {
  if (k < 0 || k > 1) return;
  const p = (b: number, d: number): readonly [number, number] => {
    const q = beside(w.x, w.y, w.fx, w.fy, w.hand, Math.cos(b) * d, Math.sin(b) * d);
    return [q.x, q.y];
  };
  const shown = sm(k / 0.25);
  const area = 0.5 * (b1 - b0) * r * r;
  const n = Math.round(area * 50);
  // (scattered through it, thinner near its middle)
  shade(g, at, n, (i) => p(b0 + (b1 - b0) * hash(i, 4, 7724), r * (0.3 + 0.7 * Math.sqrt(hash(i, 5, 7725)))), k, shown);
  const pts: (readonly [number, number])[] = [p(0, 0)];
  const arc = Math.max(2, Math.round(((b1 - b0) * r) / STEP));
  for (let i = 0; i <= arc; i++) pts.push(p(b0 + ((b1 - b0) * i) / arc, r));
  edge(g, at, pts, k, t, shown);
}
