// WHAT THE CENSOR LAYS ON THE FLOOR (the art chat, 19 Oct 2026). A MOCK-UP: NOT IN THE GAME. Nothing of the game draws
// these yet: the rules (how many bars Redaction lays and in what pattern, how long they lie and what they do to the
// hero, how far the Strike-Through runs and how fast, what the Hush does and for how long, which parts of the floor he
// blacks out for good at half his life) are the main chat's, and these are the pictures for them. As
// art/physician_shots.ts: drawn in the game's own pixels, given where a point of the floor is on the screen (`at`,
// from tiles).
//
// THE CENSOR (art/censor.ts, art/censor_moves.ts):
//   THE BRUSH SLASH: where its bristles swept the floor, a stroke of the Order's black ink laid in an arc across the
//     floor before him from his right to his left, wet, drying away (`drawSlashMark`).
//   REDACTION: through its warning, where each bar will fall is marked out on the floor in the enemy's pink, a frame
//     brightening as the slam comes; at the slam each bar is laid down along its length in an instant, black, its edges
//     ragged, ink spattered off it; it lies there wet, then dries away (`drawRedaction`; a bar laid for good at half his
//     life is the floor tile "the floor blacked out", art/floor15.ts).
//   STRIKE-THROUGH: through its warning, a line of the enemy's pink drawn across the floor from him through where you
//     stand, its dashes running out along it (`drawStrikeAim`); from the thrust, a line of black ink runs out along it
//     fast from his brush's point, its head spattering, and lies there drying (`drawStrikeLine`).
//   THE HUSH: from him, a ring of the Hush's grey rolls out across the whole room, and its veil lies thin over the floor
//     after it, and thins away (`drawRoomHush`).

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
/** The Order's ink: black, its wet sheen; dried, a dull grey-black. */
const INK = ['#06050a', '#16131d', '#3a3448', '#2a2830'];
const HUSH = ['#262234', '#3e3852', '#625a7a', '#9890b4'];

// =============================================================================================
// THE BRUSH SLASH

/** How far out before him the slash's stroke lies (tiles), how wide its arc either side of his facing (degrees), how long it lies (seconds). */
export const SLASH_MARK_REACH = 1.9;
export const SLASH_MARK_HALF = 55;
export const SLASH_MARK_FOR = 1.2;
/** WHERE THE SLASH SWEPT, from (x, y) facing (dx, dy), `t` seconds after its blow: an arc of black ink laid across the floor before him from his right to his left, thick in its middle, drying away. */
export function drawSlashMark(g: CanvasRenderingContext2D, at: FloorAt, x: number, y: number, dx: number, dy: number, t: number): void {
  if (t < 0 || t >= SLASH_MARK_FOR) return;
  const was = g.globalAlpha;
  const face = Math.atan2(dy, dx);
  const half = (SLASH_MARK_HALF * Math.PI) / 180;
  // (laid from his right to his left in the first tenth of a second)
  const laid = sm(t / 0.1);
  const dry = sm((t - (SLASH_MARK_FOR - 0.5)) / 0.5);
  const N = 70;
  for (let i = 0; i <= N; i++) {
    const u = i / N;
    if (u > laid) break;
    // (from his right, -half, to his left, +half: his left is +90 degrees from his facing on the floor's grid)
    const a = face - half + 2 * half * u;
    const thick = 0.34 * Math.sin(Math.PI * Math.min(1, u * 1.15)) + 0.06;
    for (let k = -2; k <= 2; k++) {
      const r = SLASH_MARK_REACH - 0.15 * Math.sin(u * Math.PI) + (k / 2) * thick;
      if (hash(i, k + 3, 8501) < dry) continue;
      const [sx, sy] = at(x + Math.cos(a) * r, y + Math.sin(a) * r);
      g.globalAlpha = 1;
      dotAt(g, sx, sy, k === -1 && i % 5 < 2 && dry < 0.3 ? INK[2] : dry > 0.5 ? INK[3] : INK[0], 2, 2);
    }
    // spatter thrown off the stroke's outer edge
    if (hash(i, 7, 8502) < 0.18) {
      const r = SLASH_MARK_REACH + 0.25 + 0.3 * hash(i, 8, 8502);
      const [sx, sy] = at(x + Math.cos(a) * r, y + Math.sin(a) * r);
      if (hash(i, 9, 8502) > dry) dotAt(g, sx, sy, INK[0]);
    }
  }
  g.globalAlpha = was;
}

// =============================================================================================
// REDACTION

/** A bar Redaction lays: its middle (tiles), which way it runs (0 along x, 1 along y), how long and how wide (tiles). */
export interface Bar {
  x: number;
  y: number;
  along: 0 | 1;
  long: number;
  wide: number;
}
/** How long before the slam the bars are marked out (seconds); how long a bar takes to be laid; how long it lies, drying away over its last half second. */
export const REDACT_WARN = 0.6;
export const REDACT_LAY = 0.12;
export const REDACT_FOR = 2.0;
/** THE BARS of Redaction, `t` seconds from the slam (negative: the warning before it): marked out in pink, then laid black and lying wet, then dried away. */
export function drawRedaction(g: CanvasRenderingContext2D, at: FloorAt, bars: readonly Bar[], t: number): void {
  if (t < -REDACT_WARN || t >= REDACT_FOR) return;
  const was = g.globalAlpha;
  bars.forEach((b, n) => {
    const pt = (u: number, v: number): readonly [number, number] => (b.along === 0 ? at(b.x + u, b.y + v) : at(b.x + v, b.y + u));
    const L = b.long / 2;
    const Wd = b.wide / 2;
    if (t < 0) {
      // THE WARNING: the bar's outline in the enemy's pink, its dashes marching round, brightening as the slam comes
      const k = 1 - -t / REDACT_WARN;
      const per = Math.ceil((2 * (b.long + b.wide)) / 0.08);
      for (let i = 0; i < per; i++) {
        const s = (i / per) * 2 * (b.long + b.wide);
        if ((Math.floor(s / 0.24 + t * 6 + n) & 1) === 0) continue;
        let u: number;
        let v: number;
        if (s < b.long) [u, v] = [-L + s, -Wd];
        else if (s < b.long + b.wide) [u, v] = [L, -Wd + (s - b.long)];
        else if (s < 2 * b.long + b.wide) [u, v] = [L - (s - b.long - b.wide), Wd];
        else [u, v] = [-L, Wd - (s - 2 * b.long - b.wide)];
        const [sx, sy] = pt(u, v);
        g.globalAlpha = 0.5 + 0.5 * k;
        dotAt(g, sx, sy, k > 0.7 ? FLAME[3] : FLAME[2]);
      }
      // the floor inside it darkening, a fine dither thickening as it comes
      for (let i = 0; i < b.long * 18; i++) {
        for (let j = 0; j < b.wide * 18; j++) {
          if (hash(i, j + n * 97, 8511) > 0.12 * k) continue;
          const [sx, sy] = pt(-L + (i + 0.5) / 18, -Wd + (j + 0.5) / 18);
          g.globalAlpha = 0.6;
          dotAt(g, sx, sy, INK[1]);
        }
      }
    } else {
      // THE BAR: laid along its length from one end in an instant, black, its edges ragged; wet, then dried away
      const laid = sm(t / REDACT_LAY);
      const dry = sm((t - (REDACT_FOR - 0.5)) / 0.5);
      for (let i = 0; i < b.long * 18; i++) {
        const u = -L + (i + 0.5) / 18;
        if ((u + L) / b.long > laid) break;
        const rag = 0.06 * Math.sin(i * 1.7 + n) + 0.04 * Math.sin(i * 0.5 + n * 3);
        for (let j = -2; j < b.wide * 18 + 2; j++) {
          const v = -Wd + (j + 0.5) / 18;
          if (Math.abs(v) > Wd + rag) continue;
          if (hash(i, j + n * 97, 8512) < dry) continue;
          const [sx, sy] = pt(u, v);
          g.globalAlpha = 1;
          const sheen = Math.abs(v + Wd * 0.4) < 0.03 && i % 7 < 4 && dry < 0.3;
          dotAt(g, sx, sy, sheen ? INK[2] : dry > 0.5 ? INK[3] : INK[0]);
        }
      }
      // ink spattered off it as it slams down
      if (t < 0.4) {
        for (let i = 0; i < 18; i++) {
          const side = i % 2 ? 1 : -1;
          const u = -L + b.long * hash(i, n, 8513);
          const v = side * (Wd + 0.1 + 0.4 * hash(i, n + 1, 8513) * sm(t / 0.2));
          const [sx, sy] = pt(u, v);
          g.globalAlpha = 1 - t / 0.4;
          dotAt(g, sx, sy - 6 * Math.sin((Math.PI * t) / 0.4) * hash(i, n + 2, 8513), INK[0], i % 3 === 0 ? 2 : 1, 1);
        }
      }
    }
  });
  g.globalAlpha = was;
}

// =============================================================================================
// STRIKE-THROUGH

/** How fast the line runs out (tiles a second), and how long it lies, drying away over its last half second (seconds from the thrust). */
export const STRIKE_SPEED = 16;
export const STRIKE_FOR = 1.4;
/** THE STRIKE-THROUGH'S WARNING, from (x, y) along (dx, dy) for `reach` tiles, `k` of the way through it (0 to 1): a line of the enemy's pink across the floor, its dashes running out along it. */
export function drawStrikeAim(g: CanvasRenderingContext2D, at: FloorAt, x: number, y: number, dx: number, dy: number, reach: number, k: number): void {
  if (k <= 0 || k > 1) return;
  const l = Math.hypot(dx, dy) || 1;
  const ux = dx / l;
  const uy = dy / l;
  const was = g.globalAlpha;
  const n = Math.ceil(reach / 0.06);
  for (let i = 0; i < n; i++) {
    const s = (i / n) * reach;
    // (its dashes run out from him along the line)
    if ((Math.floor(s / 0.3 - k * 8) & 1) === 0) continue;
    const [sx, sy] = at(x + ux * s, y + uy * s);
    g.globalAlpha = (0.45 + 0.55 * k) * (1 - 0.4 * (s / reach));
    dotAt(g, sx, sy, k > 0.75 ? FLAME[3] : FLAME[2], 2, 1);
  }
  g.globalAlpha = was;
}
/** THE STRIKE-THROUGH, `t` seconds from the thrust: a line of black ink running out from (x, y) along (dx, dy) at STRIKE_SPEED to `reach` tiles, its head spattering, lying wet, then drying away. */
export function drawStrikeLine(g: CanvasRenderingContext2D, at: FloorAt, x: number, y: number, dx: number, dy: number, reach: number, t: number): void {
  if (t < 0 || t >= STRIKE_FOR) return;
  const l = Math.hypot(dx, dy) || 1;
  const ux = dx / l;
  const uy = dy / l;
  const head = Math.min(reach, STRIKE_SPEED * t);
  const dry = sm((t - (STRIKE_FOR - 0.5)) / 0.5);
  const was = g.globalAlpha;
  g.globalAlpha = 1;
  const n = Math.ceil(head / 0.05);
  for (let i = 0; i < n; i++) {
    const s = (i / n) * head;
    if (hash(i, 1, 8521) < dry) continue;
    const [sx, sy] = at(x + ux * s, y + uy * s);
    // (thick near him, thinning toward its head)
    const w = s < reach * 0.6 ? 2 : 1;
    dotAt(g, sx, sy - 1, dry > 0.5 ? INK[3] : INK[0], w, 2);
    if (i % 9 < 3 && dry < 0.3) dotAt(g, sx, sy - 1, INK[2]);
  }
  // its head, spattering as it runs
  if (head < reach) {
    for (let i = 0; i < 8; i++) {
      const s = head - 0.25 * hash(i, Math.floor(t * 30), 8522);
      const o = (hash(i, Math.floor(t * 30) + 1, 8522) - 0.5) * 0.5;
      const [sx, sy] = at(x + ux * s - uy * o, y + uy * s + ux * o);
      dotAt(g, sx, sy - 2 * hash(i, 3, 8522), INK[0]);
    }
  }
  g.globalAlpha = was;
}

// =============================================================================================
// THE HUSH

/** How long the ring takes to roll out across the room (seconds), and how long the veil lies after it, thinning away over its last second (seconds from the release). */
export const ROOM_HUSH_RING = 1.0;
export const ROOM_HUSH_FOR = 3.0;
/** THE HUSH, `t` seconds after he lets it go from (x, y): a ring of grey rolling out to `reach` tiles, the veil lying thin over the floor inside it, thinning away. */
export function drawRoomHush(g: CanvasRenderingContext2D, at: FloorAt, x: number, y: number, reach: number, t: number): void {
  if (t < 0 || t >= ROOM_HUSH_FOR) return;
  const was = g.globalAlpha;
  const R = 0.3 + (reach - 0.3) * sm(t / ROOM_HUSH_RING);
  const fade = 1 - sm((t - (ROOM_HUSH_FOR - 1)) / 1);
  // the ring, rolling out, thick at its front
  if (t < ROOM_HUSH_RING + 0.3) {
    const n = Math.ceil(R * 44);
    for (let k = 0; k < 3; k++) {
      const r = R - k * 0.12;
      for (let i = 0; i < n; i++) {
        const a = (i / n) * Math.PI * 2;
        if (hash(i, k + Math.floor(t * 20) * 3, 8531) < 0.25 + 0.5 * sm((t - ROOM_HUSH_RING) / 0.3)) continue;
        const [sx, sy] = at(x + Math.cos(a) * r, y + Math.sin(a) * r);
        g.globalAlpha = 0.85 - 0.25 * k;
        dotAt(g, sx, sy - 1 - k, HUSH[3 - k], 2, 1);
      }
    }
  }
  // the veil inside it: a sparse dither of grey over the floor, drifting
  const cells = Math.ceil(R * 10);
  for (let i = -cells; i <= cells; i++) {
    for (let j = -cells; j <= cells; j++) {
      const u = i / 10;
      const v = j / 10;
      if (u * u + v * v > R * R) continue;
      if (hash(i, j, 8532) > 0.16 * fade) continue;
      const drift = Math.sin(t * 1.3 + i * 0.7) * 0.05;
      const [sx, sy] = at(x + u + drift, y + v);
      g.globalAlpha = 0.5 * fade;
      dotAt(g, sx, sy, HUSH[hash(i, j, 8533) < 0.5 ? 1 : 2], 2, 1);
    }
  }
  g.globalAlpha = was;
}
