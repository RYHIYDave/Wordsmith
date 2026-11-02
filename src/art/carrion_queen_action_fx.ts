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
  const [cx, cy] = from(B, aim, A, 0);
  if (t >= QA_DIVE.launch && t < hit) {
    const k = cl01((t - QA_DIVE.launch) / (hit - QA_DIVE.launch));
    const on = beating(t, QA_DIVE.launch, hit);
    const c = on ? (k > 0.65 ? FLAME[4] : FLAME[3]) : FLAME[2];
    const dim = on ? FLAME[2] : FLAME[1];
    // (her line: its two edges dashed, chevrons down it toward where she strikes)
    const lineEnd = A - Math.sqrt(Math.max(0, R * R - H * H));
    if (lineEnd > L) for (const sd of [-1, 1]) floorLine(p, at, from(B, aim, L, sd * H), from(B, aim, lineEnd, sd * H), (u) => (Math.floor(u * 10) % 2 === 0 ? c : dim), 2);
    const march = ((t - QA_DIVE.launch) * (1 + 3 * k)) % 1;
    for (let r = L + 0.3 + march * 0.7; r < A - 0.4; r += 0.7) for (const sd of [-1, 1]) floorLine(p, at, from(B, aim, r - 0.4, sd * H * 0.75), from(B, aim, r, 0), () => c, 2);
    // THE AREA SHE STRIKES, PLAIN: its whole ground hatched in her pink (a place to be out of), and its edge a thick ring, closing in
    // to its size as she stoops, beating faster
    const rr = R * (1 + 0.12 * (1 - k));
    const [X0, Y0] = at(cx, cy);
    const [Xe] = at(cx + rr * Math.SQRT1_2, cy - rr * Math.SQRT1_2);
    const rx = Math.abs(Xe - X0) + 4;
    for (let Y = -rx / 2; Y <= rx / 2; Y += 2) {
      for (let X = -rx; X <= rx; X += 2) {
        const e = (X / rx) ** 2 + (Y / (rx / 2)) ** 2;
        if (e >= 1) continue;
        // (diagonal hatching, every fourth game pixel, sliding toward her line's end as it beats)
        const band = (((X + 2 * Y) / 2 + Math.floor(t * 18)) % 6 + 6) % 6;
        if (band === 0 && hash(X, Y, 7311) < 0.9) dot(p, X0 + X, Y0 + Y, on ? FLAME[1] : CHAR[2]);
      }
    }
    const n = 96;
    for (let i = 0; i < n; i++) {
      if (i % 4 === 3) continue;
      const a0 = (i / n) * TAU;
      const a1 = ((i + 1) / n) * TAU;
      floorLine(p, at, [cx + Math.cos(a0) * rr, cy + Math.sin(a0) * rr], [cx + Math.cos(a1) * rr, cy + Math.sin(a1) * rr], () => c, k > 0.6 ? 3 : 2);
    }
    // (a second ring inside it, fainter, so that it reads as a place and not a line)
    for (let i = 0; i < 64; i += 2) {
      const a0 = (i / 64) * TAU;
      const a1 = ((i + 1) / 64) * TAU;
      floorLine(p, at, [cx + Math.cos(a0) * rr * 0.55, cy + Math.sin(a0) * rr * 0.55], [cx + Math.cos(a1) * rr * 0.55, cy + Math.sin(a1) * rr * 0.55], () => dim, 1);
    }
    // (her shadow on the rock, growing as she plunges)
    if (t > QA_DIVE.hold[0]) {
      const sk = cl01((t - QA_DIVE.hold[0]) / (hit - QA_DIVE.hold[0]));
      const sx = 20 + 40 * sk;
      for (let Y = -sx / 2; Y <= sx / 2; Y += 2) for (let X = -sx; X <= sx; X += 2) if ((X / sx) ** 2 + (Y / (sx / 2)) ** 2 < 1 && (X + Y) % 4 === 0) dot(p, X0 + X, Y0 + Y, INK);
    }
    return;
  }
  const s = t - hit;
  if (s < 0 || s > QA_DIVE.crater) return;
  // THE CRATER, LEFT A MOMENT: a bowl of broken rock where she struck, its rim heaved up pale; cracks thrown out from it across the
  // area, lit from under by her fire at first, then dark; a ring of her fire racing out to the area's edge; the rock about it dusted
  // pale where the dust settles. Gone by QA_DIVE.crater, crumbling away (whole pixels dropping out).
  const gone = cl01((s - (QA_DIVE.crater - 0.6)) / 0.6);
  const keep = (i: number, j: number): boolean => hash(i, j, 7321) >= gone;
  const k = cl01(s / f(3));
  for (let j = 0; j < 14; j++) {
    const a = (j / 14) * TAU + hash(j, 1, 7301) * 0.4;
    let x = cx;
    let y = cy;
    const len = R * (0.45 + 0.45 * hash(j, 2, 7301)) * k;
    const seg = 8;
    for (let q = 0; q < seg; q++) {
      const aa = a + (hash(j, q, 7302) - 0.5) * 0.9;
      const nx = x + Math.cos(aa) * (len / seg);
      const ny = y + Math.sin(aa) * (len / seg);
      const age = s / 0.9;
      if (keep(j, q)) floorLine(p, at, [x, y], [nx, ny], () => (age < 0.12 ? WHITE : age < 0.3 ? FLAME[4] : age < 0.55 ? FLAME[2] : CHAR[q < 3 ? 0 : 1]), q < 3 ? 2 : 1);
      // (a fork off the bigger ones)
      if (q === 3 && j % 2 === 0 && keep(j, 40)) floorLine(p, at, [nx, ny], [nx + Math.cos(aa + 0.8) * len * 0.22, ny + Math.sin(aa + 0.8) * len * 0.22], () => (age < 0.3 ? FLAME[3] : CHAR[1]), 1);
      x = nx;
      y = ny;
    }
  }
  const ring = R * (1 - Math.exp(-s / 0.07));
  if (s < 0.4) {
    const n = 120;
    for (let i = 0; i < n; i++) {
      const a = (i / n) * TAU;
      const [x, y] = at(cx + Math.cos(a) * ring, cy + Math.sin(a) * ring);
      dot(p, x, y, s < 0.1 ? WHITE : s < 0.22 ? FLAME[4] : FLAME[3], s < 0.2 ? 2 : 1);
    }
  }
  const [X0, Y0] = at(cx, cy);
  // (the bowl: an uneven rim of heaved-up rock, pale on its near lip, its inside dark and scorched)
  const BR = 20;
  for (let Y = -BR; Y <= BR; Y += 2) {
    for (let X = -2 * BR; X <= 2 * BR; X += 2) {
      const a = Math.atan2(Y * 2, X);
      const wob = 1 + 0.18 * Math.sin(a * 5 + 1.3) + 0.1 * Math.sin(a * 11);
      const e = Math.sqrt((X / (2 * BR)) ** 2 + (Y / BR) ** 2) / wob;
      if (e >= 1 || !keep(X, Y)) continue;
      let c: string;
      if (e > 0.78) c = Y > 0 ? (e > 0.9 ? '#b8b0bc' : '#8a818e') : e > 0.9 ? '#766d7c' : '#5a5262';
      else if (e > 0.62) c = Y < 0 ? '#2a2230' : '#3c3446';
      else c = s < 0.25 ? (e < 0.3 ? FLAME[3] : FLAME[1]) : CHAR[((X >> 1) + (Y >> 1)) & 1];
      dot(p, X0 + X, Y0 + Y, c);
    }
  }
  // (broken rock lying about the bowl, and the dust settled pale over the rock round it)
  for (let i = 0; i < 70; i++) {
    const a = hash(i, 1, 7331) * TAU;
    const r = R * (0.25 + 0.75 * Math.sqrt(hash(i, 2, 7331)));
    const [x, y] = at(cx + Math.cos(a) * r, cy + Math.sin(a) * r);
    if (!keep(i, 99) || s < 0.25 + (r / R) * 0.3) continue;
    if (i % 3 === 0) {
      dot(p, x, y, '#8a818e', 2);
      dot(p, x + 2, y + 2, '#3c3446');
    } else dot(p, x, y, hash(i, 3, 7331) > 0.5 ? '#9d94a0' : '#b2a9b4');
  }
}

// =============================================================================================
// HER DIVE: THE ROCK BURSTS (his fix: “really sell it with dirt and dust on the impact”)

/** The eyrie's own colours for what is flung up: its rock, its grit, the dirt in its cracks, its dust (pale, the rock's violet-grey). */
const DIRT = ['#2e2630', '#3c3240', '#4e4250'] as const;
const STONE = ['#3a3342', '#5a5262', '#766d7c', '#9d94a0', '#c6bec8'] as const;
const DUST = ['#463e4e', '#5c5466', '#746c7e', '#8e8698', '#aaa2b2'] as const;
/** An ordered dither (4 by 4) on whole game pixels: whether a pixel is kept at density `k` (0 to 1). */
const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
const dense = (X: number, Y: number, k: number): boolean => (BAYER[((Y >> 1) & 3) * 4 + ((X >> 1) & 3)] + 0.5) / 16 < k;
/**
 * A PUFF OF DUST on the picture at (x, y), `r` picture pixels round, `k` how thick (thinning as it hangs and drifts off): a billow lit
 * from the upper left, shaded under, its edge broken; in whole game pixels, dithered as it thins, so that it stays crisp.
 */
function puff(p: Px, x: number, y: number, r: number, k: number, seed: number): void {
  if (k <= 0.02 || r < 2) return;
  const X0 = 2 * Math.round(x / 2);
  const Y0 = 2 * Math.round(y / 2);
  const R = Math.ceil(r / 2) * 2;
  for (let Y = -R; Y <= R; Y += 2) {
    for (let X = -R; X <= R; X += 2) {
      const a = Math.atan2(Y, X);
      const lump = 1 + 0.16 * Math.sin(a * 3 + seed) + 0.1 * Math.sin(a * 5 - seed * 2);
      const e = Math.hypot(X, Y) / (r * lump);
      if (e >= 1) continue;
      // (its edge thinner than its heart)
      if (!dense(X0 + X, Y0 + Y, k * (e > 0.8 ? 0.55 : 1))) continue;
      const lit = -(X + 1.4 * Y) / (r * 1.5) + 0.2 * (1 - e);
      const c = e > 0.86 && Y > 0 ? DUST[0] : lit > 0.42 ? DUST[4] : lit > 0.12 ? DUST[3] : lit > -0.22 ? DUST[2] : lit > -0.55 ? DUST[1] : DUST[0];
      dot(p, X0 + X, Y0 + Y, c);
    }
  }
}
/** A chunk of broken rock, a few game pixels across, turned: lit on top, dark under, an edge of shadow. */
function chunk(p: Px, x: number, y: number, size: number, turn: number): void {
  const X0 = 2 * Math.round(x / 2);
  const Y0 = 2 * Math.round(y / 2);
  const c = Math.cos(turn);
  const sn = Math.sin(turn);
  const S = size * 2;
  for (let Y = -S - 2; Y <= S + 2; Y += 2) {
    for (let X = -S - 2; X <= S + 2; X += 2) {
      const u = (X * c + Y * sn) / S;
      const v = (-X * sn + Y * c) / (S * 0.75);
      // (an uneven lump: flat-faced, a corner knocked off)
      if (Math.abs(u) + Math.abs(v) * 0.8 > 1.1 || (u > 0.55 && v < -0.3)) continue;
      const edge = Math.abs(u) + Math.abs(v) * 0.8 > 0.8;
      dot(p, X0 + X, Y0 + Y, edge ? STONE[0] : Y < 0 ? STONE[2] : u < 0 ? STONE[1] : DIRT[2]);
    }
  }
}
/** What is flung up where she strikes: each piece's way out (radians on the floor), how fast out (tiles a second) and up (picture pixels a second), its kind (0 grit, 1 dirt, 2 broken rock), how late. */
interface Flung {
  a: number;
  v: number;
  w: number;
  kind: 0 | 1 | 2;
  late: number;
  size: number;
}
const FLUNG: Flung[] = Array.from({ length: 200 }, (_, i) => {
  const h1 = hash(i, 1, 7341);
  const h2 = hash(i, 2, 7341);
  const h3 = hash(i, 3, 7341);
  const kind = (i % 5 === 0 ? 2 : i % 3 === 0 ? 1 : 0) as 0 | 1 | 2;
  // (a column straight up at the middle, and a fountain out over the whole area; the heavy rock not so far)
  const column = i % 7 === 0;
  return { a: h1 * TAU, v: column ? 0.3 + 0.7 * h2 : (kind === 2 ? 1.8 : 2.4) + (kind === 2 ? 3.4 : 5.4) * h2 * h2, w: column ? 560 + 220 * h3 : 240 + 420 * h3, kind, late: hash(i, 4, 7341) * 0.05, size: kind === 2 ? 2 + Math.round(hash(i, 5, 7341) * 2) : kind === 1 ? 2 : 1 };
});
const GRAV = 1400;
/** Where a flung piece is `s` seconds after the strike: how far out (tiles), how high (picture pixels), and whether it is lying (`rest`) or gone. Rock bounces twice and lies; grit and dirt are gone where they land. */
function flight(q: Flung, s: number): { r: number; z: number; rest: boolean } | null {
  let t = s - q.late;
  if (t < 0) return null;
  // (slowed by the air as it goes)
  const out = (dt: number, v: number): number => (v * (1 - Math.exp(-dt * 2.2))) / 2.2;
  let r = 0;
  let w = q.w;
  let v = q.v;
  for (let b = 0; b < 3; b++) {
    const land = (2 * w) / GRAV;
    if (t < land) return { r: r + out(t, v), z: w * t - (GRAV * t * t) / 2, rest: false };
    if (q.kind !== 2) return null;
    r += out(land, v);
    v *= 0.45 * Math.exp(-land * 2.2);
    w *= 0.32;
    t -= land;
    if (w < 30) break;
  }
  return t < 0.9 ? { r, z: 0, rest: true } : null;
}
/** The ring of dust's puffs: rolling out from where she struck to the area's edge, and an inner billow; each its own place round. */
const RING_N = 34;
/**
 * HER DIVE'S BURST, `t` seconds into her dive, she at `B` facing `aim`: what is flung up and the dust, `part` the half of it behind
 * where she strikes ('back', laid before the figures) or before it ('front', laid over them), as the game sorts what stands.
 *   THE FOUNTAIN   dirt, grit and broken rock flung up and out over the whole area in a fountain, a column straight up at its middle;
 *                  the rock falls back and bounces twice and lies a moment; the grit and dirt are gone where they land
 *   THE DUST RING  a thick ring of dust rolling out along the rock to the area's edge (QA_DIVE.r) in under half a second, billowing;
 *                  an inner billow and a cloud over the crater rising; then all of it hanging, swelling, drifting off with the wind
 *                  and thinning away by QA_DIVE.dust
 */
export function paintDiveBurst(p: Px, at: At, B: readonly [number, number], aim: number, t: number, part: 'back' | 'front'): void {
  const s = t - QA_DIVE.hit;
  if (s < 0 || s > QA_DIVE.dust) return;
  const R = QA_DIVE.r;
  const [cx, cy] = from(B, aim, QA_DIVE.at, 0);
  const [, Yc] = at(cx, cy);
  const mine = (y: number): boolean => (part === 'back' ? y < Yc : y >= Yc);
  // (the wind: the dust drifting off to the picture's right and a little up; how thick it still is)
  const drift = Math.max(0, s - 0.45);
  const wind = 16 * drift + 4 * drift * drift;
  const thick = 1 - cl01((s - 0.5) / (QA_DIVE.dust - 0.5));
  // THE DUST RING: rolling out, then hanging; puffs behind the middle first (the far side), so the near ones lie over them
  const out = R * 0.97 * (1 - Math.exp(-s / 0.13));
  const puffs: [number, number, number, number, number][] = [];
  for (let i = 0; i < RING_N; i++) {
    const a = (i / RING_N) * TAU + hash(i, 1, 7351) * 0.12;
    const rr = out * (0.93 + 0.1 * hash(i, 2, 7351));
    const [x, y] = at(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr);
    const big = 8 + 13 * Math.sqrt(cl01(s / 0.5)) + 5 * drift;
    // (rolling: two lobes, the upper one tumbling forward over the lower)
    const roll = s * 7 + i;
    puffs.push([x + wind, y - big * 0.55 - 3 * drift, big, thick, i]);
    puffs.push([x + wind + Math.cos(roll) * big * 0.35, y - big * 1.05 - 4 * drift + Math.sin(roll) * big * 0.2, big * 0.72, thick * 0.9, i + 50]);
  }
  // (an inner billow, and the cloud over the crater rising and spreading)
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * TAU + 0.3;
    const rr = out * 0.5;
    const [x, y] = at(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr);
    const big = 10 + 13 * Math.sqrt(cl01(s / 0.6)) + 5 * drift;
    puffs.push([x + wind * 0.8, y - big * 0.8 - 8 * drift, big, thick * 0.95, i + 100]);
  }
  for (let i = 0; i < 7; i++) {
    const a = (i / 7) * TAU;
    const rise = 30 + 70 * (1 - Math.exp(-s / 0.35)) + 10 * drift;
    const spread = 6 + 26 * Math.sqrt(cl01(s / 0.7));
    const [x, y] = at(cx, cy);
    puffs.push([x + Math.cos(a) * spread * 1.4 + wind * 0.6, y - rise + Math.sin(a) * spread * 0.6, 12 + 12 * cl01(s / 0.6) + 4 * drift, thick * (s < 0.08 ? 0 : 0.8), i + 200]);
  }
  // (lay them far to near: what is higher on the picture first)
  for (const [x, y, r, k, seed] of puffs.sort((u, v) => u[1] - v[1])) {
    const floorY = y + r * 0.6;
    if (mine(floorY)) puff(p, x, y, r, k, seed);
  }
  // THE FOUNTAIN, over the dust: dirt, grit and broken rock
  for (const [i, q] of FLUNG.entries()) {
    const fl = flight(q, s);
    if (!fl) continue;
    const fx = cx + Math.cos(q.a) * fl.r;
    const fy = cy + Math.sin(q.a) * fl.r;
    const [X, Yf] = at(fx, fy);
    if (!mine(Yf)) continue;
    const Y = Yf - fl.z;
    if (fl.rest) {
      if (hash(i, Math.floor(s * 10), 7361) < cl01((s - 1.4) / 0.6)) continue;
      chunk(p, X, Y, q.size, q.a);
      continue;
    }
    if (q.kind === 2) chunk(p, X, Y, q.size, q.a + s * 9 * (i % 2 ? 1 : -1));
    else if (q.kind === 1) {
      dot(p, X, Y, DIRT[i % 3], 2);
      dot(p, X, Y + 2, DIRT[0]);
    } else {
      dot(p, X, Y, i % 2 ? STONE[2] : STONE[3]);
      // (a streak behind fast grit, along the way it came)
      if (s < 0.25) dot(p, X - Math.cos(q.a) * 2, Y + 4, STONE[1]);
    }
  }
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
