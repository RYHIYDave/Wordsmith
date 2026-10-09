// THE RED TROLL'S CHARGE, MARKED ON THE FLOOR (the art chat, 9 Oct 2026). NOT IN THE GAME YET.
//
// The owner's yes in the main chat, 9 Oct, by 08:15 (as that chat posted it): the red troll (the
// guardian) has a club swing, a slam, and a charge along a marked line. And to the art chat, 09:17, of
// the red circle a slam is warned by: "It’s not the big red circles I have a problem with". So the
// line is the circle's own kind: the
// same reds (render/render.ts, the 'warn' zone), the same faint ground that darkens as the moment
// comes, and the same fill that runs to the far end as the wind-up runs out (the circle's grows from
// its middle; the lane's runs from the troll to where he will stop), with chevrons along it, pointing
// the way he will come. While he runs it, what he has left behind fades.
//
// Drawn in the game's own pixels on the floor, under the figures: `drawChargeLane`, given where a
// point of the floor is on the screen (render.ts: wx, wy). Nothing of the game draws it yet: that is
// the main chat's, with his yes (a zone of its own kind, from the troll to the end of his run).

import { P } from './palette';

/** Where a point of the floor (tiles) is on the screen, in the game's pixels. */
export type FloorAt = (x: number, y: number) => readonly [number, number];

/** The lane of one charge. */
export interface Lane {
  /** Where the charge starts and where it ends (tiles). */
  x0: number;
  y0: number;
  x1: number;
  y1: number;
  /** Half its width (tiles): what the troll will run down whoever is in. */
  half: number;
  /** How far the wind-up has gone, 0 (begun) to 1 (he sets off). */
  k: number;
  /** While he runs: how much of the way he has come, 0 to 1 (what is behind him fades). */
  gone?: number;
}

/** How far apart its chevrons are along it (tiles). */
const CHEVRON_EVERY = 0.55;

/** A line of the game's pixels, every `every`th one of it. */
function line(g: CanvasRenderingContext2D, x0: number, y0: number, x1: number, y1: number, color: string, every = 1): void {
  x0 = Math.round(x0);
  y0 = Math.round(y0);
  x1 = Math.round(x1);
  y1 = Math.round(y1);
  const dx = Math.abs(x1 - x0);
  const dy = -Math.abs(y1 - y0);
  const sx = x0 < x1 ? 1 : -1;
  const sy = y0 < y1 ? 1 : -1;
  let err = dx + dy;
  g.fillStyle = color;
  for (let n = 0; n < 600; n++) {
    if (n % every === 0) g.fillRect(x0, y0, 1, 1);
    if (x0 === x1 && y0 === y1) break;
    const e2 = 2 * err;
    if (e2 >= dy) {
      err += dy;
      x0 += sx;
    }
    if (e2 <= dx) {
      err += dx;
      y0 += sy;
    }
  }
}

/** A filled four-sided piece of the floor, at a strength. */
function quad(g: CanvasRenderingContext2D, pts: ReadonlyArray<readonly [number, number]>, color: string, alpha: number): void {
  g.globalAlpha = alpha;
  g.fillStyle = color;
  g.beginPath();
  g.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length; i++) g.lineTo(pts[i][0], pts[i][1]);
  g.closePath();
  g.fill();
  g.globalAlpha = 1;
}

/** THE LINE OF A CHARGE on the floor, at its moment. */
export function drawChargeLane(g: CanvasRenderingContext2D, lane: Lane, at: FloorAt): void {
  const len = Math.hypot(lane.x1 - lane.x0, lane.y1 - lane.y0);
  if (len < 0.05) return;
  const fx = (lane.x1 - lane.x0) / len;
  const fy = (lane.y1 - lane.y0) / len;
  const cx = -fy;
  const cy = fx;
  const k = Math.max(0, Math.min(1, lane.k));
  const from = Math.max(0, Math.min(1, lane.gone ?? 0)) * len;
  const fade = lane.gone === undefined ? 1 : 1 - 0.35 * Math.max(0, Math.min(1, lane.gone));
  /** A point `a` tiles along it and `c` across it. */
  const pt = (a: number, c: number): readonly [number, number] => at(lane.x0 + fx * a + cx * c, lane.y0 + fy * a + cy * c);
  const h = lane.half;
  const alpha = g.globalAlpha;
  g.globalAlpha = 1;
  // the faint ground of it, darkening as the moment comes (the circle's outer ground)
  quad(g, [pt(from, h), pt(len, h), pt(len, -h), pt(from, -h)], P.bl3, (0.16 + 0.3 * k) * fade);
  // the fill that runs out to the far end as the wind-up runs out (the circle's growing middle)
  const run = Math.max(from, len * k);
  if (run > from) quad(g, [pt(from, h), pt(run, h), pt(run, -h), pt(from, -h)], P.bl4, 0.3 * fade);
  // its two edges, dotted, and its far end
  g.globalAlpha = fade;
  for (const side of [-1, 1]) {
    const [ax, ay] = pt(from, h * side);
    const [bx, by] = pt(len, h * side);
    line(g, ax, ay, bx, by, P.bl5, 2);
  }
  const [ex0, ey0] = pt(len, h);
  const [ex1, ey1] = pt(len, -h);
  line(g, ex0, ey0, ex1, ey1, P.bl5);
  // chevrons down its middle, pointing the way he will come: bright where the fill has reached
  for (let a = CHEVRON_EVERY * 0.75; a < len - 0.15; a += CHEVRON_EVERY) {
    if (a < from) continue;
    const lit = a <= run;
    const [tx, ty] = pt(a + 0.12, 0);
    for (const side of [-1, 1]) {
      const [bx, by] = pt(a - 0.12, h * 0.62 * side);
      g.globalAlpha = fade * (lit ? 1 : 0.55);
      line(g, bx, by, tx, ty, lit ? P.bl5 : P.bl4);
    }
  }
  g.globalAlpha = alpha;
}
