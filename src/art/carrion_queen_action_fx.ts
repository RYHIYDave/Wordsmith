// WHAT THE CARRION QUEEN'S MOVES DO TO HER EYRIE, DONE THE ACTION WAY (the art chat's helper, 1 Nov 2026; docs/mockups/action_f7_queen).
// A MOCK-UP: NOTHING OF THE GAME IMPORTS IT, and it is behind QUEEN_ACTION (art/carrion_queen_action.ts), off. Under the owner's
// Movement 9 and his rule for the enemies (28 Oct): “Start from now on, but every enemy is going to need that change eventually.  And
// bigger AOE to compensate for the extra time the player gets to evade”; his picks of 31 Oct, “Yes, no drop-pushes (Recommended)” and
// “Eclipse (Recommended)”.
//
//   HER RAKE: while she hangs, the wedge it rakes marked on the rock in her pink, its three claw lanes lit inside it, beating faster;
//     at her blow, three gouges of the cult's fire torn along the lanes out to its end in two frames, burning, then scorched.
//   HER GUST: while she is reared, its cone marked in RAYS RUNNING STRAIGHT OUT FROM HER, chevrons along each pointing away from her,
//     beating faster; at her clap, the blast racing out along every ray: so it is seen to shove straight away from her.
//   HER DIVE: while she is up out of sight, her line marked on the rock, chevrons along it, a ring where she will strike; at her
//     strike, the crater: cracks thrown out, scorched.
//   THE ECLIPSE: the dark coming across the ledge with her flock, and going; the pools of light drifting across it (`poolsAt`); how
//     lit a point of the ledge is (`lightAt`); a pool's rim of light; each vulture's dive line marked on the rock before it strikes.
// Each is painted onto a picture through `at` (a floor point, tiles, and a height, picture pixels, to the picture), in picture pixels
// as the figures are, two to a game pixel, every pixel whole.

import { Px, rgba } from '../engine/px';
import { FLAME } from './mkit';
import { hash } from './kit';
import { QA_DIVE, QA_ECLIPSE, QA_GUST, QA_RAKE, f } from './carrion_queen_action';

const cl01 = (v: number): number => (v < 0 ? 0 : v > 1 ? 1 : v);
const TAU = Math.PI * 2;
const D = Math.PI / 180;
const WHITE = '#fff6e0';
/** Scorched rock; the dark of a crack. */
const CHAR = ['#1a1218', '#2a1c26', '#3c2a36'] as const;
const INK = '#120c14';

/** Where a floor point (tiles from the scene's middle) and a height over it (picture pixels) is on the picture. */
export type At = (x: number, y: number, z?: number) => readonly [number, number];
/** A whole game pixel (two of the picture's) at (x, y), or `size` of them. */
function dot(p: Px, x: number, y: number, c: string, size = 1): void {
  const X = 2 * Math.round(x / 2);
  const Y = 2 * Math.round(y / 2);
  for (let j = 0; j < 2 * size; j++) for (let i = 0; i < 2 * size; i++) p.set(X + i - (size - 1), Y + j - (size - 1), c);
}
/** A line along the floor from a to b (floor points), its colour at each step (null: a gap). */
function floorLine(p: Px, at: At, a: readonly [number, number], b: readonly [number, number], col: (u: number) => string | null, size = 1, z = 0): void {
  const [x0, y0] = at(a[0], a[1], z);
  const [x1, y1] = at(b[0], b[1], z);
  const n = Math.max(1, Math.ceil(Math.hypot(x1 - x0, y1 - y0) / 2));
  for (let i = 0; i <= n; i++) {
    const u = i / n;
    const c = col(u);
    if (c) dot(p, x0 + (x1 - x0) * u, y0 + (y1 - y0) * u, c, size);
  }
}
/** A beat that quickens as the blow nears: 1 or 0, from `a` to `b`. */
function beating(t: number, a: number, b: number): boolean {
  const k = cl01((t - a) / (b - a));
  const phase = (t - a) * (3 + 9 * k);
  return phase - Math.floor(phase) < 0.6;
}
/** A floor point from her spot `B`, `fwd` tiles along the way she faces (`aim`, radians) and `left` to her left. */
export function from(B: readonly [number, number], aim: number, fwd: number, left: number): [number, number] {
  return [B[0] + Math.cos(aim) * fwd + Math.cos(aim - Math.PI / 2) * left, B[1] + Math.sin(aim) * fwd + Math.sin(aim - Math.PI / 2) * left];
}

// =============================================================================================
// HER RAKE

/** How wide the rake's wedge is to either side `fwd` tiles before her (tiles). */
export const rakeHalf = (fwd: number): number => QA_RAKE.half + QA_RAKE.spread * fwd;
/** Whether a point `fwd` tiles before her and `left` to her left is raked (for the rules: the wedge, at her blow). */
export function rakeStrikes(fwd: number, left: number): boolean {
  return fwd >= QA_RAKE.from && fwd <= QA_RAKE.to && Math.abs(left) <= rakeHalf(fwd);
}
/** The rake's marks on the rock `t` seconds into her rake, she at `B` facing `aim`. */
export function paintRakeMarks(p: Px, at: At, B: readonly [number, number], aim: number, t: number): void {
  const warn0 = QA_RAKE.up - f(4);
  const hit = QA_RAKE.hit;
  const { from: F, to: T } = QA_RAKE;
  const P = (fw: number, l: number): [number, number] => from(B, aim, fw, l);
  const lane = (j: number, fw: number): number => (QA_RAKE.lanes[j] / 24) * (rakeHalf(fw) - 0.35);
  if (t >= warn0 && t < hit) {
    // THE WARNING: the wedge's edge dashed in her pink; the three claw lanes lit inside it, hotter and quicker as she hangs
    const k = cl01((t - warn0) / (hit - warn0));
    const on = beating(t, warn0, hit);
    const edge = on ? FLAME[2] : FLAME[1];
    const dash = (u: number, n: number): string | null => (Math.floor(u * n) % 2 === 0 ? edge : null);
    floorLine(p, at, P(F, -rakeHalf(F)), P(T, -rakeHalf(T)), (u) => dash(u, 14), 2);
    floorLine(p, at, P(F, rakeHalf(F)), P(T, rakeHalf(T)), (u) => dash(u, 14), 2);
    floorLine(p, at, P(T, -rakeHalf(T)), P(T, rakeHalf(T)), (u) => dash(u, 8), 2);
    floorLine(p, at, P(F, -rakeHalf(F)), P(F, rakeHalf(F)), (u) => dash(u, 4), 2);
    for (let j = 0; j < 3; j++) {
      const c = on ? (k > 0.6 ? FLAME[4] : FLAME[3]) : FLAME[2];
      const steps = 40;
      for (let i = 0; i <= steps; i++) {
        const u = i / steps;
        // (a claw's lane: thin at her end, widest two-thirds out, a hooked point at its far end)
        if (u > k * 1.6) break;
        const fw = F + 0.3 + (T - F - 0.3) * u;
        const [x, y] = at(...P(fw, lane(j, fw)));
        dot(p, x, y, c, u > 0.2 && u < 0.85 ? 3 : 2);
      }
    }
    return;
  }
  const s = t - hit;
  if (s < 0 || s > 1.6) return;
  // THE GOUGES: torn along the lanes from her talons out to the wedge's end in two frames (white, gold), burning, then scorched
  const reach = cl01((s + f(1)) / f(2));
  for (let j = 0; j < 3; j++) {
    const steps = 60;
    for (let i = 0; i <= steps; i++) {
      const u = i / steps;
      if (u > reach) break;
      const fw = F + 0.3 + (T - F - 0.3) * u;
      const wob = (hash(i, j, 7101) - 0.5) * 0.12;
      const [x, y] = at(...P(fw, lane(j, fw) + wob));
      const age = s / 1.1 + (1 - u) * 0.1;
      const w = u > 0.15 && u < 0.9 ? 3 : 2;
      if (age < 0.12) dot(p, x, y, WHITE, w + 1);
      else if (age < 0.35) dot(p, x, y, FLAME[4], w);
      else if (age < 0.6) dot(p, x, y, hash(i, j, 7102) > 0.5 ? FLAME[3] : FLAME[2], w);
      else if (age < 0.85) dot(p, x, y, hash(i, j, 7103) > 0.6 ? FLAME[1] : CHAR[2], w);
      else if (s < 1.6) dot(p, x, y, CHAR[i % 2], w);
      // (flames licking up off a burning gouge)
      if (age > 0.1 && age < 0.6 && hash(i, j, 7104 + Math.floor(s * 20)) > 0.8) dot(p, x, y - 4 - 8 * hash(i, j, 7105), age < 0.35 ? FLAME[4] : FLAME[3]);
    }
  }
}

// =============================================================================================
// HER GUST: rays straight out from her

/** Whether a point `fwd` tiles before her and `left` to her left is in her gust's blast (the rules', at her clap). */
export function gustStrikes(fwd: number, left: number): boolean {
  return fwd > -0.3 && fwd <= QA_GUST.far && Math.abs(left) <= QA_GUST.wide + QA_GUST.spread * Math.max(0, fwd);
}
/** How far her gust shoves one it strikes `fwd` tiles before her, straight away from her (tiles). */
export function gustShove(fwd: number): number {
  return Math.max(QA_GUST.least, QA_GUST.push * (1 - Math.max(0, fwd) / (QA_GUST.far + 2)));
}
/** The rays of her gust's cone: their ways (radians to her left of the way she faces) and how far each runs before the cone's edge. */
export function gustRays(): { a: number; len: number }[] {
  const n = QA_GUST.rays;
  const out: { a: number; len: number }[] = [];
  const lim = Math.atan(QA_GUST.spread) + 0.12;
  for (let i = 0; i < n; i++) {
    const a = -lim + (2 * lim * i) / (n - 1);
    out.push({ a, len: QA_GUST.far / Math.max(0.6, Math.cos(a)) });
  }
  return out;
}
/** Her gust's marks on the rock `t` seconds into it. */
export function paintGustMarks(p: Px, at: At, B: readonly [number, number], aim: number, t: number): void {
  const [h0] = QA_GUST.hold;
  const warn0 = h0 - f(6);
  const hit = QA_GUST.hit;
  const rays = gustRays();
  const chevron = (r: number, a: number, size: number, c: string): void => {
    // (a chevron on the ray, its point away from her)
    const tip = from(B, aim + a, r, 0);
    for (const sd of [-1, 1]) {
      const back = from(B, aim + a, r - size, sd * size * 0.8);
      floorLine(p, at, back, tip, () => c, 2);
    }
  };
  if (t >= warn0 && t < hit) {
    const k = cl01((t - warn0) / (hit - warn0));
    const on = beating(t, warn0, hit);
    rays.forEach(({ a, len }, i) => {
      const reach = Math.min(len, QA_GUST.far * (0.25 + 0.75 * cl01(k * 1.5)));
      const rim = i === 0 || i === rays.length - 1;
      // (the ray, a line straight out from her: the cone's two edges solid, the rays inside it fine)
      floorLine(p, at, from(B, aim + a, 0.7, 0), from(B, aim + a, reach, 0), () => (rim ? (on ? FLAME[2] : FLAME[1]) : FLAME[1]), rim ? 2 : 1);
      // (big chevrons marching out along every other ray, away from her)
      if (i % 2 === 1 || rim) return;
      const march = ((t - warn0) * (1.0 + 2.5 * k)) % 1;
      for (let r = 1.4 + march * 1.4; r < reach - 0.2; r += 1.4) chevron(r, a, 0.45, on ? (k > 0.6 ? FLAME[4] : FLAME[3]) : FLAME[2]);
    });
    // (the cone's far end: an arc dashed across it)
    const lim = Math.atan(QA_GUST.spread) + 0.12;
    const reach = QA_GUST.far * (0.25 + 0.75 * cl01(k * 1.5));
    const arcAt = (q: number): [number, number] => from(B, aim - lim + (2 * lim * q) / 24, reach, 0);
    for (let q = 0; q < 24; q += 2) floorLine(p, at, arcAt(q), arcAt(q + 1), () => (on ? FLAME[2] : FLAME[1]), 2);
    return;
  }
  const s = t - hit;
  if (s < 0 || s > 0.9) return;
  // THE BLAST: racing straight out along every ray, a front of streaks; the rays left pale and fading
  const front = 18 * s + 0.8;
  for (const { a, len } of rays) {
    const end = Math.min(len, front);
    const fade = s / 0.9;
    floorLine(p, at, from(B, aim + a, 0.7, 0), from(B, aim + a, end, 0), (u) => (hash(Math.floor(u * 40), Math.floor(a * 100), 7201) > 0.35 + 0.6 * fade ? (fade < 0.3 ? '#d8d0dc' : '#9a90a4') : null));
    if (front < len + 1) {
      for (let q = 0; q < 3; q++) chevron(Math.min(len, front - q * 0.35), a, 0.4 - q * 0.08, q === 0 ? WHITE : q === 1 ? FLAME[4] : FLAME[3]);
    }
  }
}

// =============================================================================================
// HER DIVE: her line and the crater

/** Whether a point `fwd` tiles before her and `left` to her left is struck by her dive (the rules', at her strike). */
export function diveStrikes(fwd: number, left: number): boolean {
  return Math.hypot(fwd - QA_DIVE.at, left) <= QA_DIVE.r || (fwd >= QA_DIVE.line && fwd <= QA_DIVE.at && Math.abs(left) <= QA_DIVE.half);
}
/** Her dive's marks on the rock `t` seconds into it. */
export function paintDiveMarks(p: Px, at: At, B: readonly [number, number], aim: number, t: number): void {
  const hit = QA_DIVE.hit;
  const A = QA_DIVE.at;
  const L = QA_DIVE.line;
  const H = QA_DIVE.half;
  const R = QA_DIVE.r;
  if (t >= QA_DIVE.launch && t < hit) {
    const k = cl01((t - QA_DIVE.launch) / (hit - QA_DIVE.launch));
    const on = beating(t, QA_DIVE.launch, hit);
    const c = on ? (k > 0.65 ? FLAME[4] : FLAME[3]) : FLAME[2];
    const dim = on ? FLAME[2] : FLAME[1];
    // (her line: its two edges dashed, chevrons down it toward where she strikes)
    for (const sd of [-1, 1]) floorLine(p, at, from(B, aim, L, sd * H), from(B, aim, A - Math.sqrt(R * R - H * H), sd * H), (u) => (Math.floor(u * 10) % 2 === 0 ? c : dim), 2);
    const march = ((t - QA_DIVE.launch) * (1 + 3 * k)) % 1;
    for (let r = L + 0.3 + march * 0.7; r < A - 0.4; r += 0.7) for (const sd of [-1, 1]) floorLine(p, at, from(B, aim, r - 0.4, sd * H * 0.75), from(B, aim, r, 0), () => c, 2);
    // (the ring where she strikes, closing in on its middle as she stoops)
    const rr = R * (1 + 0.15 * (1 - k));
    const n = 48;
    for (let i = 0; i < n; i++) {
      if (i % 3 === 2) continue;
      const a0 = (i / n) * TAU;
      const a1 = ((i + 1) / n) * TAU;
      floorLine(p, at, from(B, aim, A + Math.cos(a0) * rr, Math.sin(a0) * rr), from(B, aim, A + Math.cos(a1) * rr, Math.sin(a1) * rr), () => c, k > 0.6 ? 3 : 2);
    }
    // (her shadow on the rock, growing as she plunges)
    if (t > QA_DIVE.hold[0]) {
      const sk = cl01((t - QA_DIVE.hold[0]) / (hit - QA_DIVE.hold[0]));
      const [cx, cy] = at(...from(B, aim, A, 0));
      const rx = 14 + 26 * sk;
      for (let Y = -rx / 2; Y <= rx / 2; Y += 2) for (let X = -rx; X <= rx; X += 2) if ((X / rx) ** 2 + (Y / (rx / 2)) ** 2 < 1 && (X + Y) % 4 === 0) dot(p, cx + X, cy + Y, INK);
    }
    return;
  }
  const s = t - hit;
  if (s < 0 || s > 1.6) return;
  // THE CRATER: cracks thrown out from where she struck, lit from under, then scorched; a ring of her fire going out to the ring's edge
  const [cx, cy] = from(B, aim, A, 0);
  const k = cl01(s / f(3));
  for (let j = 0; j < 9; j++) {
    const a = (j / 9) * TAU + hash(j, 1, 7301) * 0.5;
    let x = cx;
    let y = cy;
    const len = R * (0.7 + 0.5 * hash(j, 2, 7301)) * k;
    const seg = 6;
    for (let q = 0; q < seg; q++) {
      const aa = a + (hash(j, q, 7302) - 0.5) * 0.9;
      const nx = x + Math.cos(aa) * (len / seg);
      const ny = y + Math.sin(aa) * (len / seg);
      const age = s / 1.3;
      floorLine(p, at, [x, y], [nx, ny], () => (age < 0.15 ? WHITE : age < 0.4 ? FLAME[4] : age < 0.7 ? FLAME[2] : CHAR[1]), q < 2 ? 2 : 1);
      x = nx;
      y = ny;
    }
  }
  const ring = R * cl01(s / 0.25);
  if (s < 0.45) {
    const n = 56;
    for (let i = 0; i < n; i++) {
      const a = (i / n) * TAU;
      const [x, y] = at(cx + Math.cos(a) * ring, cy + Math.sin(a) * ring);
      dot(p, x, y, s < 0.12 ? WHITE : s < 0.25 ? FLAME[4] : FLAME[3], 1);
    }
  }
  const [X0, Y0] = at(cx, cy);
  for (let Y = -10; Y <= 10; Y += 2) for (let X = -20; X <= 20; X += 2) if ((X / 20) ** 2 + (Y / 10) ** 2 < 1) dot(p, X0 + X, Y0 + Y, s < 0.3 ? FLAME[1] : CHAR[(X + Y) & 2 ? 0 : 1]);
}

// =============================================================================================
// THE ECLIPSE

/** How dark the ledge is `t` seconds into her Eclipse (0: as lit as ever; 1: the dark), and how far across from the drop the dark has come. */
export function eclipseDark(t: number): number {
  const { hold, hit, fall, dark, back, dim } = QA_ECLIPSE;
  // (dimming as her flock gathers while she screams; the light going in a few frames as it pours over; coming back as it scatters)
  if (t < hold[0]) return 0;
  if (t < hit) return (1 - dim) * cl01((t - hold[0]) / (hit - hold[0]));
  if (t < hit + fall) return Math.max(1 - dim, cl01((t - hit) / fall));
  if (t < hit + dark) return 1;
  return 1 - cl01((t - hit - dark) / back);
}
/** How far the dark has come over the ledge from the drop at `t` (0: not at all; 1: all of it), as the flock pours in. */
export function darkFront(t: number): number {
  const { hit, fall, dark } = QA_ECLIPSE;
  if (t < hit) return 0;
  if (t < hit + fall) return cl01((t - hit) / fall);
  if (t < hit + dark) return 1;
  return 1;
}
/** A pool of light at a moment: its middle (tiles), how far across (its radius, tiles), and how lit (0 to 1, as it opens and closes). */
export interface Pool {
  x: number;
  y: number;
  r: number;
  k: number;
}
/**
 * THE POOLS OF LIGHT `t` seconds into her Eclipse, over a ledge whose middle is (0, 0) and which reaches `rx`, `ry` tiles along the
 * floor's x and y (an arena, as hers is: about 17 by 20): gaps in her flock, each drifting across it slowly along its own long loop,
 * at QA_ECLIPSE.drift tiles a second; opening as the dark falls, closing as the light comes back.
 */
export function poolsAt(t: number, rx = 8.5, ry = 10, seed = 0): Pool[] {
  const { hit, fall, dark, pools, r, drift } = QA_ECLIPSE;
  if (t < hit + fall * 0.5 || t > hit + dark) return [];
  const s = t - hit;
  const open = cl01((s - fall * 0.5) / 0.3) * (1 - cl01((s - dark + 0.25) / 0.25));
  const out: Pool[] = [];
  for (let i = 0; i < pools; i++) {
    // (each on a long slow loop round the ledge, a third of the way round from the next)
    const ph = (i / pools) * TAU + seed;
    const a = ph + (s * drift) / (0.55 * (rx + ry) * 0.5);
    out.push({ x: Math.cos(a) * rx * 0.55, y: Math.sin(a) * ry * 0.55, r: r * (0.85 + 0.15 * open), k: open });
  }
  return out;
}
/** Whether a floor point is in a pool of light. */
export function inPool(pools: ReadonlyArray<Pool>, x: number, y: number, give = 0): boolean {
  return pools.some((q) => q.k > 0.5 && Math.hypot(x - q.x, y - q.y) <= q.r - give);
}
/**
 * HOW LIT a floor point is (1: as lit as ever; DARK_FLOOR: the dark), the dark at `dark` (eclipseDark), the pools `pools`: in a pool
 * fully lit; at its rim a band a step down; outside, the dark. In whole steps, so that it stays crisp.
 */
export const DARK_FLOOR = 0.34;
export function lightAt(x: number, y: number, dark: number, pools: ReadonlyArray<Pool>): number {
  if (dark <= 0) return 1;
  const lo = 1 - (1 - DARK_FLOOR) * dark;
  let best = lo;
  for (const q of pools) {
    if (q.k <= 0) continue;
    const d = Math.hypot(x - q.x, y - q.y);
    const r = q.r * q.k;
    if (d <= r - 0.18) best = Math.max(best, 1);
    else if (d <= r) best = Math.max(best, lo + (1 - lo) * 0.62);
    else if (d <= r + 0.25) best = Math.max(best, lo + (1 - lo) * 0.25);
  }
  return best;
}
/** The dark's own colour, laid over what it darkens (a deep violet, the flock's shadow): how much of it at a given lightness. */
const DUSK = rgba('#140e26');
/** A pixel darkened to `l` (1: as it was), toward the dusk; what glows with the enemy's fire, or the friend's cyan, kept. */
export function darkened(r: number, g: number, b: number, l: number): [number, number, number] {
  if (l >= 0.999) return [r, g, b];
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  // (a glow: bright and strong in colour: her fire, her eyes, the knight's cyan; kept, a little dimmed)
  if (max > 170 && max - min > 0.45 * max) return [Math.round(r * 0.92), Math.round(g * 0.92), Math.round(b * 0.92)];
  const m = 1 - l;
  return [Math.round(r * l + DUSK[0] * m * 0.9), Math.round(g * l + DUSK[1] * m * 0.9), Math.round(b * l + DUSK[2] * m * 1.1)];
}
/** A pool's rim of light on the rock: a ring of pale motes on its edge, so that it reads even small. */
export function paintPoolRims(p: Px, at: At, pools: ReadonlyArray<Pool>, t: number): void {
  for (const [j, q] of pools.entries()) {
    if (q.k <= 0.2) continue;
    const r = q.r * q.k;
    const n = Math.round(r * 30);
    for (let i = 0; i < n; i++) {
      const a = (i / n) * TAU + t * 0.15 * (j % 2 ? 1 : -1);
      if (hash(i, j, 7401) > 0.7) continue;
      const [x, y] = at(q.x + Math.cos(a) * r, q.y + Math.sin(a) * r);
      dot(p, x, y, hash(i, j, 7402) > 0.5 ? '#e8dcc0' : '#bcae98');
    }
  }
}
/**
 * A VULTURE'S DIVE IN THE DARK: its line on the rock from where it comes in (`a`) to where it strikes (`b`), marked from `k` 0 to 1
 * (its warning: the line drawn out from `a`, chevrons down it, a ring at `b`, beating faster); `struck` from 0, after it strikes:
 * the rock scored where its talons went, fading.
 */
export function paintVultureLine(p: Px, at: At, a: readonly [number, number], b: readonly [number, number], k: number, struck = -1, seed = 0): void {
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  const L = Math.hypot(dx, dy) || 1;
  const ux = dx / L;
  const uy = dy / L;
  const P = (s: number, l = 0): [number, number] => [a[0] + ux * s - uy * l, a[1] + uy * s + ux * l];
  if (struck < 0) {
    const on = Math.floor(k * (4 + 10 * k) * 2) % 2 === 0;
    const c = on ? (k > 0.6 ? FLAME[4] : FLAME[3]) : FLAME[2];
    const reach = L * cl01(k * 2.5);
    floorLine(p, at, P(0), P(reach), (u) => (Math.floor(u * reach * 3) % 2 === 0 ? c : null), 2);
    for (let s = 0.5; s < reach - 0.2; s += 0.7) for (const sd of [-1, 1]) floorLine(p, at, P(s - 0.35, sd * QA_ECLIPSE.half), P(s), () => c, 2);
    if (k > 0.3) {
      const rr = QA_ECLIPSE.hitR * (1 + 0.3 * (1 - k));
      const n = 32;
      for (let i = 0; i < n; i++) {
        if (i % 4 === 3) continue;
        const a0 = (i / n) * TAU;
        const a1 = ((i + 1) / n) * TAU;
        floorLine(p, at, [b[0] + Math.cos(a0) * rr, b[1] + Math.sin(a0) * rr], [b[0] + Math.cos(a1) * rr, b[1] + Math.sin(a1) * rr], () => c, 2);
      }
    }
    return;
  }
  if (struck > 0.8) return;
  // (scored where its talons went: three short gouges along its line, white, gold, then her pink, then gone)
  for (const l of [-0.18, 0, 0.18]) {
    floorLine(p, at, P(L - QA_ECLIPSE.tail * 0.5, l), P(L + 0.35, l * 1.4), (u) => (hash(Math.floor(u * 20), seed, 7501) > 0.2 ? (struck < 0.1 ? WHITE : struck < 0.3 ? FLAME[4] : struck < 0.55 ? FLAME[2] : FLAME[1]) : null), 2);
  }
  void D;
}
