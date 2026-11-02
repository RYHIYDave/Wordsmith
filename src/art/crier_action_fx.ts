// WHAT THE CRIER SENDS OUT, DONE THE ACTION WAY (the art chat's helper, 2 Nov 2026; docs/mockups/action_f11_crier). A MOCK-UP:
// NOTHING OF THE GAME IMPORTS IT, and it is behind CRIER_ACTION (art/crier_action.ts), off. Under the owner's Movement 9 and his rule
// for the enemies (28 Oct): “Start from now on, but every enemy is going to need that change eventually.  And bigger AOE to
// compensate for the extra time the player gets to evade”; and his rulebook's Monsters 9 (bosses fill the arena with things to
// dance around). In the enemy's pink and gold and the Hush's grey; never a friend's cyan.
//
//   THE SWING (SWEEP, RING): while each blow is held, the floor it will sweep marked in his pink (an arc out to its reach; for the
//     finisher a ring round where the bell will come down); each sweep throws an arc of dust and dead air along its way; the
//     finisher's bell cracks the flags and A RING OF SILENCE goes out over the floor from it.
//   THE SHOUT OFF THE WALLS (WALLS): while he holds the breath the whole square is marked, its three walls lit, and ONE SPOT left
//     plain, ringed in the Hush's pale: behind him, where none of it reaches. The shout: a wave of silence crosses the square
//     before him, hits the walls and comes back across from three sides (the far wall's back over him, the two side walls' in to
//     either side of his line), the floor going dark under each as it passes.
//   THE SCROLL DOWN A LANE (DECREE): while he holds it high, the lane marked down the square; flung, it lands and unrolls down the
//     lane in a smear; its letters burn along it a while (floor taken away); it crumbles into the Hush.
//   THE CROWD (CALL): while he holds the summons, the Hush wells up in the mouths of the lanes into the square; at the call, rings
//     roll out from him and the Hushed pour in out of the pools (the figures are the game's own, laid by the scene).
// Each is painted onto a picture through `at` (a floor point, tiles, and a height, picture pixels, to the picture), every pixel
// whole; `keep` says which of what stands up off the floor to paint (by the picture row of its floor point).

import { Px } from '../engine/px';
import { HUSH } from './crier';
import { CROWD_HIT, CROWD_HOLD, PROCLAIM_HIT, PROCLAIM_HOLD, SHOUT_HIT, SHOUT_HOLD, SWING_HITS, SWING_STRIKES, f } from './crier_action';
import { hash } from './kit';
import { FLAME } from './mkit';

const clamp01 = (v: number): number => (v < 0 ? 0 : v > 1 ? 1 : v);
const smooth = (u: number): number => {
  const k = clamp01(u);
  return k * k * (3 - 2 * k);
};
/** Where a floor point (tiles) and a height over it (picture pixels) is on the picture. */
export type At = (x: number, y: number, z?: number) => readonly [number, number];
/** Which of a picture's things to paint, by the picture row of its floor point. */
export type Keep = (floorY: number) => boolean;
const ALL: Keep = () => true;
/** A floor point `fwd` tiles before C and `left` to his left, him facing `aim` (radians on the floor's own axes). */
export const place = (C: readonly [number, number], aim: number, fwd: number, left: number): [number, number] => [C[0] + Math.cos(aim) * fwd + Math.cos(aim - Math.PI / 2) * left, C[1] + Math.sin(aim) * fwd + Math.sin(aim - Math.PI / 2) * left];
const dot = (p: Px, x: number, y: number, c: string, w = 1, h = 1): void => {
  const X = Math.round(x);
  const Y = Math.round(y);
  for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) if (X + i >= 0 && Y + j >= 0 && X + i < p.w && Y + j < p.h) p.set(X + i, Y + j, c);
};
/** The Hush's pale, a white of its own (never cyan); paper; ink; the seal's wax. */
const PALE = '#c8c2dc';
const PAPER = ['#3e382e', '#7a6e5c', '#ab9f84', '#c4b898', '#d6cbad'] as const;
const INK = '#0b0910';
const WAX = ['#2a0a10', '#5a1420', '#8a2232'] as const;

/** A dashed line on the floor from (x0, y0) to (x1, y1) (tiles): dashes running along it by `run`, lit by `lit` (0 to 1). */
function dashes(p: Px, at: At, a: readonly [number, number], b: readonly [number, number], lit: number, run: number, hot: boolean, step = 0.04): void {
  const L = Math.hypot(b[0] - a[0], b[1] - a[1]);
  for (let d = 0; d <= L; d += step) {
    if ((((d * 2.2 - run) % 1) + 1) % 1 > 0.6) continue;
    const u = d / Math.max(1e-6, L);
    const [X, Y] = at(a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u);
    if (lit < 0.5 && hash(Math.round(X), Math.round(Y), 5101) > lit * 2) continue;
    dot(p, X, Y, hot ? FLAME[3] : FLAME[2], 2, 1);
    dot(p, X, Y + 1, FLAME[0], 2, 1);
  }
}
/** A dashed circle on the floor round (cx, cy), `r` tiles. */
function dashedRing(p: Px, at: At, cx: number, cy: number, r: number, lit: number, run: number, hot: boolean): void {
  const n = Math.max(24, Math.round(r * 60));
  for (let i = 0; i < n; i++) {
    const u = i / n;
    if ((((u * Math.max(12, r * 9) + run) % 1) + 1) % 1 > 0.55) continue;
    const [X, Y] = at(cx + Math.cos(u * Math.PI * 2) * r, cy + Math.sin(u * Math.PI * 2) * r);
    if (lit < 0.5 && hash(i, 3, 5103) > lit * 2) continue;
    dot(p, X, Y, hot ? FLAME[3] : FLAME[2], 2, 1);
    dot(p, X, Y + 1, FLAME[0], 2, 1);
  }
}

// =============================================================================================
// THE SWING

/**
 * THE SWEEPS (tiles and degrees, from where he stood as the move began, to the left of the way he faces): the bell sweeps out to
 * `bell` (its own middle, as painted), and the sweep's reach for the rules is `r` (the bell's own size and the dead air thrown off
 * it); across from `from` to `to`. The FINISHER's bell comes down `ahead` tiles before him; its RING OF SILENCE goes out `r` tiles
 * round it in `out` seconds, and lies `lie`.
 */
export const SWEEP = [
  { bell: 2.44, r: 3.2, from: -100, to: 50 },
  { bell: 2.77, r: 3.4, from: 100, to: -50 },
] as const;
export const RING = { ahead: 2.6, r: 2.8, out: 0.2, lie: 0.9 } as const;
/** When each blow's warning is on the floor (from its being hauled back to its strike). */
const SWING_WARN = [[f(10), SWING_STRIKES[0][0]], [f(38), SWING_STRIKES[1][0]], [f(66), SWING_STRIKES[2][0]]] as const;
/** Whether the swing strikes a hero `fwd` tiles before where he began and `left` to his left, at its `i`th blow (0, 1: the sweeps; 2: the finisher's ring). */
export function swingStrikes(i: number, fwd: number, left: number): boolean {
  if (i === 2) return Math.hypot(fwd - RING.ahead, left) <= RING.r;
  const S = SWEEP[i];
  const r = Math.hypot(fwd, left);
  const a = (Math.atan2(left, fwd) * 180) / Math.PI;
  const lo = Math.min(S.from, S.to);
  const hi = Math.max(S.from, S.to);
  return r <= S.r && r >= 0.5 && a >= lo && a <= hi;
}
/** THE SWING ON THE FLOOR, `m` seconds into it, him at C facing `aim`. */
export function paintSwing(p: Px, at: At, m: number, C: readonly [number, number], aim: number): void {
  const run = m * 2.4;
  // THE WARNINGS: the sweeps' arcs; the finisher's ring
  SWING_WARN.forEach(([a, b], i) => {
    if (m < a || m >= b) return;
    const k = smooth((m - a) / 0.25);
    const hot = m > b - 0.2;
    if (i < 2) {
      const S = SWEEP[i];
      const n = 60;
      for (let j = 0; j < n; j++) {
        const u0 = S.from + ((S.to - S.from) * j) / n;
        const u1 = S.from + ((S.to - S.from) * (j + 1)) / n;
        if ((((j / 3 + run) % 1) + 1) % 1 > 0.6) continue;
        dashes(p, at, place(C, aim, S.r * Math.cos((u0 * Math.PI) / 180), S.r * Math.sin((u0 * Math.PI) / 180)), place(C, aim, S.r * Math.cos((u1 * Math.PI) / 180), S.r * Math.sin((u1 * Math.PI) / 180)), k, 0, hot, 0.05);
      }
      for (const e of [S.from, S.to]) dashes(p, at, place(C, aim, 0.6 * Math.cos((e * Math.PI) / 180), 0.6 * Math.sin((e * Math.PI) / 180)), place(C, aim, S.r * Math.cos((e * Math.PI) / 180), S.r * Math.sin((e * Math.PI) / 180)), k, run, hot);
      // (a stipple of his pink over what it will sweep)
      for (let j = 0; j < 1400; j++) {
        const rr = 0.6 + (S.r - 0.6) * Math.sqrt(hash(j, i, 5111));
        const aa = ((S.from + (S.to - S.from) * hash(j, i + 7, 5111)) * Math.PI) / 180;
        if (hash(j, Math.floor(m * 8), 5113) > 0.4 * k) continue;
        const [X, Y] = at(...place(C, aim, rr * Math.cos(aa), rr * Math.sin(aa)));
        dot(p, X, Y, hash(j, 2, 5113) < 0.15 ? FLAME[2] : FLAME[1], 2, 1);
      }
    } else {
      const [cx, cy] = place(C, aim, RING.ahead, 0);
      dashedRing(p, at, cx, cy, RING.r, k, run, hot);
      dashedRing(p, at, cx, cy, RING.r * 0.5, k * 0.7, -run, hot);
      for (let j = 0; j < 1400; j++) {
        const rr = RING.r * Math.sqrt(hash(j, 1, 5115));
        const aa = hash(j, 2, 5115) * Math.PI * 2;
        if (hash(j, Math.floor(m * 8), 5117) > 0.4 * k) continue;
        const [X, Y] = at(cx + Math.cos(aa) * rr, cy + Math.sin(aa) * rr);
        dot(p, X, Y, hash(j, 3, 5117) < 0.15 ? FLAME[2] : FLAME[1], 2, 1);
      }
    }
  });
  // THE SWEEPS: an arc of dust and dead air thrown along the bell's way as it goes by, blown outward, thinning
  [0, 1].forEach((i) => {
    const s = m - SWING_HITS[i];
    if (s < -1 / 30 || s > 0.5) return;
    const S = SWEEP[i];
    const k = clamp01((s + 1 / 30) / 0.5);
    for (let j = 0; j < 140; j++) {
      const u = hash(j, i, 5121);
      const a = ((S.from + (S.to - S.from) * u) * Math.PI) / 180;
      if (s < 0 && u > 0.5) continue;
      if (hash(j, i + 3, 5121) < k * 0.9) continue;
      const rr = S.bell - 0.3 + 0.9 * hash(j, i + 5, 5121) + k * 0.9;
      const [X, Y] = at(...place(C, aim, rr * Math.cos(a), rr * Math.sin(a)), 4 + 10 * (1 - k) * hash(j, 9, 5121));
      dot(p, X, Y, j % 7 === 0 ? FLAME[2] : j % 3 ? HUSH[3] : HUSH[4], 2, 1);
    }
  });
  // THE FINISHER: the flags cracked under the bell; A RING OF SILENCE out over the floor from it
  const s = m - SWING_HITS[2];
  if (s >= 0 && s < RING.out + RING.lie) {
    const [cx, cy] = place(C, aim, RING.ahead, 0);
    const fade = s < RING.out + RING.lie * 0.5 ? 1 : 1 - (s - RING.out - RING.lie * 0.5) / (RING.lie * 0.5);
    for (let i = 0; i < 9; i++) {
      const a = hash(i, 1, 5131) * Math.PI * 2;
      const long = 0.6 + 0.8 * hash(i, 2, 5131);
      for (let d = 0.2; d < long; d += 0.03) {
        const wob = (hash(i, Math.round(d * 30), 5133) - 0.5) * 0.1;
        const [X, Y] = at(cx + Math.cos(a + wob) * d, cy + Math.sin(a + wob) * d);
        if (hash(Math.round(X), Math.round(Y), 5135) > fade) continue;
        dot(p, X, Y, INK);
      }
    }
    const r = RING.r * smooth(s / RING.out);
    // (the floor inside it gone dark: the dead air lying on it)
    for (let j = 0; j < 900; j++) {
      const rr = r * Math.sqrt(hash(j, 1, 5137));
      const a = hash(j, 2, 5137) * Math.PI * 2;
      if (hash(j, 3, 5137) > 0.55 * fade) continue;
      const [X, Y] = at(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr);
      dot(p, X, Y, rr < r * 0.5 ? HUSH[0] : HUSH[1], 2, 1);
    }
    // (its edge, going out: the Hush's pale, his pink in it, rings behind)
    for (const [back, c] of [[0, PALE], [0.1, HUSH[4]], [0.22, HUSH[3]]] as const) {
      const rr = r - back;
      if (rr <= 0.1) continue;
      const n = Math.round(rr * 70);
      for (let i = 0; i < n; i++) {
        const a = (i / n) * Math.PI * 2;
        if (hash(i, Math.round(back * 10), 5139) > fade * (s < RING.out ? 1 : 0.75)) continue;
        const [X, Y] = at(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr, s < RING.out ? 3 : 1);
        dot(p, X, Y, back === 0 && hash(i, 4, 5141) < 0.18 ? FLAME[2] : c, back === 0 ? 2 : 1, 1);
      }
    }
  }
}

// =============================================================================================
// THE SHOUT OFF THE WALLS

/** The square the pictures stand in: its walls (floor tiles, the floor's own axes). */
export interface Square {
  readonly x0: number;
  readonly x1: number;
  readonly y0: number;
  readonly y1: number;
}
/**
 * THE SHOUT OFF THE WALLS (tiles and seconds): the wave out of the bell from `from` tiles before him, crossing the square before
 * him (the half of it ahead of his shoulders) at `out` tiles a second, its front `band` deep; off each of the three walls it
 * reaches (the far wall, his left and his right), the echo comes back across at `back` tiles a second, straight, as wide as the
 * square: the side walls' in to within `side` of his line, the far wall's back over him to `behind` tiles behind him. Where any
 * of them passes the floor goes dark, and stays dark `dark`. THE ONE SPOT none of them reach: within `side` of his line, more than
 * `behind` behind him, to the wall at his back.
 */
export const WALLS = { from: 0.6, out: 20, back: 16, band: 0.45, side: 1.3, behind: 1.6, dark: 1.2 } as const;
/** The square's walls in his own frame (tiles from him: ahead, at his back, to his left, to his right), him at C facing `aim` (along one of the square's sides). */
export function wallsOf(sq: Square, C: readonly [number, number], aim: number): { far: number; back: number; left: number; right: number } {
  const ax = Math.round(Math.cos(aim));
  const ay = Math.round(Math.sin(aim));
  const to = (dx: number, dy: number): number => (dx > 0 ? sq.x1 - C[0] : dx < 0 ? C[0] - sq.x0 : dy > 0 ? sq.y1 - C[1] : C[1] - sq.y0);
  return { far: to(ax, ay), back: to(-ax, -ay), left: to(ay, -ax), right: to(-ay, ax) };
}
/** When the wave reaches each wall, and when each echo is done (seconds after the shout). */
export function echoTimes(w: { far: number; left: number; right: number }): { far: [number, number]; left: [number, number]; right: [number, number] } {
  const reach = (d: number): number => Math.max(0, d - WALLS.from) / WALLS.out;
  return {
    far: [reach(w.far), reach(w.far) + (w.far + WALLS.behind) / WALLS.back],
    left: [reach(w.left), reach(w.left) + (w.left - WALLS.side) / WALLS.back],
    right: [reach(w.right), reach(w.right) + (w.right - WALLS.side) / WALLS.back],
  };
}
/** Where each front is `s` seconds after the shout (his frame: the wave's radius ahead; the far echo's distance ahead of him; the side echoes' distance to his left and right), null where it is not. */
export function frontsAt(s: number, w: { far: number; back: number; left: number; right: number }): { wave: number | null; far: number | null; left: number | null; right: number | null } {
  const T = echoTimes(w);
  const wave = s >= 0 ? WALLS.from + WALLS.out * s : null;
  const echo = (tw: [number, number], from: number, sgn: number): number | null => (s < tw[0] || s > tw[1] ? null : from - sgn * WALLS.back * (s - tw[0]));
  return {
    wave: wave !== null && wave < Math.hypot(Math.max(w.far, 0), Math.max(w.left, w.right)) + 0.5 ? wave : null,
    far: echo(T.far, w.far, 1),
    left: echo(T.left, w.left, 1),
    right: echo(T.right, w.right, 1),
  };
}
/** Whether a hero at (fwd, left) (tiles, his frame) is within a front as it passes, `s` seconds after the shout. */
export function shoutStrikes(s: number, fwd: number, left: number, w: { far: number; back: number; left: number; right: number }): boolean {
  const F = frontsAt(s, w);
  const B = WALLS.band;
  if (F.wave !== null && fwd > 0 && Math.abs(Math.hypot(fwd, left) - F.wave) <= B && fwd <= w.far && Math.abs(left) <= Math.max(w.left, w.right)) return true;
  if (F.far !== null && Math.abs(fwd - F.far) <= B) return true;
  if (F.left !== null && left > 0 && Math.abs(left - F.left) <= B) return true;
  if (F.right !== null && left < 0 && Math.abs(-left - F.right) <= B) return true;
  return false;
}
/** Whether a spot (his frame) is THE ONE SPOT none of them reach. */
export const shoutSafe = (fwd: number, left: number, w: { back: number }): boolean => Math.abs(left) < WALLS.side - WALLS.band && fwd < -(WALLS.behind + WALLS.band) && fwd > -w.back;
/** Whether a front has gone over a spot by `s` seconds after the shout (the floor dark there), and how long ago. */
function passedOver(s: number, fwd: number, left: number, w: { far: number; back: number; left: number; right: number }): number | null {
  const T = echoTimes(w);
  let since: number | null = null;
  const seen = (when: number): void => {
    if (when <= s) since = since === null ? s - when : Math.min(since, s - when);
  };
  if (fwd > 0) seen((Math.hypot(fwd, left) - WALLS.from) / WALLS.out);
  if (fwd >= -WALLS.behind) seen(T.far[0] + (w.far - fwd) / WALLS.back);
  if (left >= WALLS.side) seen(T.left[0] + (w.left - left) / WALLS.back);
  if (-left >= WALLS.side) seen(T.right[0] + (w.right + left) / WALLS.back);
  return since;
}
/** THE SHOUT ON THE FLOOR, `m` seconds into it, him at C facing `aim`, in the square `sq`. */
export function paintShout(p: Px, at: At, m: number, C: readonly [number, number], aim: number, sq: Square): void {
  const w = wallsOf(sq, C, aim);
  const run = m * 2.2;
  const s = m - SHOUT_HIT;
  const T = echoTimes(w);
  const done = Math.max(T.far[1], T.left[1], T.right[1]);
  const W = (fwd: number, left: number): [number, number] => place(C, aim, fwd, left);
  // THE WARNING: from the breath held to the shout; the whole square stippled in his pink, but the one spot
  if (m >= SHOUT_HOLD[0] - 0.2 && s < 0) {
    const k = smooth((m - SHOUT_HOLD[0] + 0.2) / 0.5);
    const hot = s > -0.25;
    const pulse = 0.5 + 0.5 * Math.sin(m * 9);
    for (let fwd = -w.back + 0.04; fwd < w.far; fwd += 0.1) {
      for (let left = -w.right + 0.04; left < w.left; left += 0.1) {
        if (Math.abs(left) < WALLS.side && fwd < -WALLS.behind) continue;
        const h = hash(Math.round(fwd * 10), Math.round(left * 10), 5151);
        if (h > (0.16 + 0.1 * pulse) * k) continue;
        const [X, Y] = at(...W(fwd + (hash(Math.round(fwd * 10), 7, 5153) - 0.5) * 0.06, left));
        dot(p, X, Y, h < 0.05 * k ? FLAME[2] : FLAME[1], 2, 1);
      }
    }
    // (the three walls lit along their feet: where it will come back from)
    dashes(p, at, W(w.far - 0.15, w.left), W(w.far - 0.15, -w.right), k, run, hot);
    dashes(p, at, W(-w.back, w.left - 0.15), W(w.far, w.left - 0.15), k, run, hot);
    dashes(p, at, W(-w.back, -w.right + 0.15), W(w.far, -w.right + 0.15), k, run, hot);
    // (the lines where the echoes will die: the edges of the one spot)
    dashes(p, at, W(-WALLS.behind, WALLS.side), W(-w.back, WALLS.side), k, -run, hot);
    dashes(p, at, W(-WALLS.behind, -WALLS.side), W(-w.back, -WALLS.side), k, -run, hot);
    dashes(p, at, W(-WALLS.behind, WALLS.side), W(-WALLS.behind, -WALLS.side), k, -run, hot);
  }
  // THE ONE SPOT: ringed in the Hush's pale from the breath until the last echo is done
  if (m >= SHOUT_HOLD[0] && s < done + 0.4) {
    const k = smooth((m - SHOUT_HOLD[0]) / 0.4) * (s < done ? 1 : 1 - (s - done) / 0.4);
    const edge: [number, number][] = [[-WALLS.behind - 0.1, WALLS.side - 0.1], [-WALLS.behind - 0.1, -WALLS.side + 0.1], [-w.back + 0.1, -WALLS.side + 0.1], [-w.back + 0.1, WALLS.side - 0.1]];
    for (let i = 0; i < 4; i++) {
      const a = W(...edge[i]);
      const b = W(...edge[(i + 1) % 4]);
      const L = Math.hypot(b[0] - a[0], b[1] - a[1]);
      for (let d = 0; d <= L; d += 0.03) {
        const [X, Y] = at(a[0] + ((b[0] - a[0]) * d) / L, a[1] + ((b[1] - a[1]) * d) / L);
        if (hash(Math.round(X), Math.round(Y), 5155) > k) continue;
        dot(p, X, Y, PALE);
        dot(p, X, Y + 1, HUSH[2]);
      }
    }
  }
  if (s < 0 || s > done + WALLS.dark) return;
  // THE DARK: the floor gone dark where a front has passed, lifting after
  for (let fwd = -w.back + 0.03; fwd < w.far; fwd += 0.09) {
    for (let left = -w.right + 0.03; left < w.left; left += 0.09) {
      const since = passedOver(s, fwd, left, w);
      if (since === null || since > WALLS.dark) continue;
      const k = 1 - since / WALLS.dark;
      const h = hash(Math.round(fwd * 11), Math.round(left * 11), 5157);
      if (h > 0.9 * k) continue;
      const [X, Y] = at(...W(fwd, left));
      dot(p, X, Y, h < 0.35 ? HUSH[0] : h < 0.7 ? HUSH[1] : HUSH[2], 3, 2);
    }
  }
  // THE FRONTS: the wave going out (an arc before him), the echoes coming back (straight, as wide as the square)
  const F = frontsAt(s, w);
  // (each front a low wall of dead air rolling over the floor: its leading edge the Hush's pale, his pink in it, standing up off the
  // floor; grey-violet behind it, thinning)
  const curtain = (q: [number, number], back: number, seed: number): void => {
    const [X, Y] = at(q[0], q[1]);
    const tall = back < 0.05 ? 16 : back < 0.2 ? 11 : back < 0.4 ? 6 : 3;
    for (let z = 0; z < tall; z += 1) {
      const hz = hash(seed, z, 5159);
      if (hz < 0.25 + (z / tall) * 0.5) continue;
      const c = back < 0.05 ? (z > tall - 4 ? HUSH[4] : hz > 0.93 ? FLAME[2] : PALE) : back < 0.2 ? HUSH[4] : back < 0.4 ? HUSH[3] : HUSH[2];
      dot(p, X, Y - z, c, 2, 1);
    }
  };
  const BACKS = [0, 0.1, 0.22, 0.36, 0.52, 0.7];
  const inSq = (fwd: number, left: number): boolean => fwd <= w.far && fwd >= -w.back && left <= w.left && left >= -w.right;
  if (F.wave !== null) {
    for (const back of BACKS) {
      const r = F.wave - back;
      if (r < 0.3) continue;
      const n = Math.round(r * 40);
      for (let i = 0; i <= n; i++) {
        const a = -Math.PI / 2 + (Math.PI * i) / n;
        const fwd = r * Math.cos(a);
        const left = r * Math.sin(a);
        if (inSq(fwd, left) && hash(i, Math.round(back * 50), 5161) > back * 0.6) curtain(W(fwd, left), back, i * 13 + Math.round(back * 50));
      }
    }
  }
  const across = (fwdAt: (u: number) => number, leftAt: (u: number) => number, n: number, back: number, seed: number): void => {
    for (let i = 0; i <= n; i++) if (hash(i, seed + Math.round(back * 50), 5165) > back * 0.6) curtain(W(fwdAt(i / n), leftAt(i / n)), back, i * 17 + seed);
  };
  for (const back of BACKS) {
    if (F.far !== null) across(() => F.far! + back, (u) => -w.right + (w.left + w.right) * u, Math.round((w.left + w.right) * 22), back, 21);
    if (F.left !== null) across((u) => -w.back + (w.far + w.back) * u, () => F.left! + back, Math.round((w.far + w.back) * 22), back, 31);
    if (F.right !== null) across((u) => -w.back + (w.far + w.back) * u, () => -F.right! - back, Math.round((w.far + w.back) * 22), back, 41);
  }
  // (dust and scraps of paper thrown along ahead of the fronts)
  for (let i = 0; i < 90; i++) {
    const which = i % 4;
    const u = hash(i, 1, 5163);
    let q: [number, number] | null = null;
    if (which === 0 && F.wave !== null) {
      const a = -Math.PI / 2 + Math.PI * u;
      const r = F.wave + 0.2 + 0.3 * hash(i, 2, 5163);
      if (inSq(r * Math.cos(a), r * Math.sin(a))) q = W(r * Math.cos(a), r * Math.sin(a));
    } else if (which === 1 && F.far !== null) q = W(F.far - 0.25, -w.right + (w.left + w.right) * u);
    else if (which === 2 && F.left !== null) q = W(-w.back + (w.far + w.back) * u, F.left - 0.25);
    else if (which === 3 && F.right !== null) q = W(-w.back + (w.far + w.back) * u, -F.right + 0.25);
    if (!q) continue;
    const [X, Y] = at(q[0], q[1], 4 + 8 * hash(i, 3, 5163));
    dot(p, X, Y, i % 5 === 0 ? PAPER[3] : HUSH[4], 2, 1);
  }
}

// =============================================================================================
// THE SCROLL DOWN A LANE

/**
 * THE DECREE (tiles and seconds): its lane from `from` tiles before him to `to` (or the wall, if nearer), `half` to either side;
 * from the fling it lands at `lands`, has unrolled to the end at `unrolled` (in a smear); its letters burn from the near end out at
 * `burn` tiles a second and burn on until `out`, then it crumbles into the Hush, gone at `gone`. The floor under it is taken away
 * while its letters burn: a hero on it is struck every `every`.
 */
export const DECREE = { from: 1.3, to: 13.5, half: 1.5, lands: 0.1, unrolled: 0.3, burn: 40, out: 4.3, gone: 5.0, every: 0.5 } as const;
/** How far down its lane the roll is, `s` seconds after the fling (tiles); null in the air. */
export function decreeFront(s: number, to: number = DECREE.to): number | null {
  if (s < DECREE.lands) return null;
  const u = clamp01((s - DECREE.lands) / (DECREE.unrolled - DECREE.lands));
  return DECREE.from + (to - DECREE.from) * (1 - (1 - u) ** 1.6);
}
/** Whether the decree burns under a hero at (fwd, left) (his frame), `s` seconds after the fling: the floor taken away. */
export function decreeBurns(s: number, fwd: number, left: number, to: number = DECREE.to): boolean {
  const front = decreeFront(s, to);
  return front !== null && s < DECREE.out && Math.abs(left) <= DECREE.half && fwd >= DECREE.from && fwd <= front;
}
/** A letter of the decree: a few strokes in a cell (u, v from 0 to 1 across and along), made up from its seed (no letters of any real hand). */
function glyph(seed: number): [number, number, number, number][] {
  const strokes: [number, number, number, number][] = [];
  const n = 2 + Math.floor(hash(seed, 1, 5171) * 3);
  for (let i = 0; i < n; i++) {
    const kind = Math.floor(hash(seed, i + 2, 5171) * 4);
    const a = hash(seed, i + 9, 5171);
    if (kind === 0) strokes.push([0.15 + 0.7 * a, 0.1, 0.15 + 0.7 * a, 0.9]);
    else if (kind === 1) strokes.push([0.1, 0.2 + 0.6 * a, 0.9, 0.2 + 0.6 * a]);
    else if (kind === 2) strokes.push([0.1, 0.9, 0.9, 0.1]);
    else strokes.push([0.2, 0.1 + 0.3 * a, 0.8, 0.6 + 0.3 * a]);
  }
  return strokes;
}
/** THE SCROLL DOWN A LANE on the floor, `m` seconds into the move, him at C facing `aim`; `to` where its lane ends. `hand`: where it leaves his hand (tiles before him, picture pixels up). */
export function paintDecree(p: Px, at: At, m: number, C: readonly [number, number], aim: number, to: number = DECREE.to, hand: readonly [number, number] = [0.9, 70], layer: 'floor' | 'air' = 'floor', keep: Keep = ALL): void {
  const W = (fwd: number, left: number): [number, number] => place(C, aim, fwd, left);
  const s = m - PROCLAIM_HIT;
  const run = m * 2.4;
  if (layer === 'floor' && m >= PROCLAIM_HOLD[0] - 0.25 && s < DECREE.lands) {
    // THE WARNING: the lane marked out down the square, racing out to its end, a bar across its end; a stipple over it
    const k = smooth((m - PROCLAIM_HOLD[0] + 0.25) / 0.45);
    const hot = s > -0.25;
    const long = DECREE.from + (to - DECREE.from) * k;
    for (const side of [-1, 1]) dashes(p, at, W(DECREE.from, side * DECREE.half), W(long, side * DECREE.half), 1, run, hot);
    if (k >= 1) dashes(p, at, W(to, -DECREE.half), W(to, DECREE.half), 1, run, hot);
    dashes(p, at, W(DECREE.from, -DECREE.half), W(DECREE.from, DECREE.half), k, run, hot);
    for (let j = 0; j < 3000; j++) {
      const fwd = DECREE.from + (long - DECREE.from) * hash(j, 1, 5175);
      const left = (hash(j, 2, 5175) * 2 - 1) * DECREE.half;
      if (hash(j, Math.floor(m * 7), 5177) > 0.4) continue;
      const [X, Y] = at(...W(fwd, left));
      dot(p, X, Y, hash(j, 3, 5177) < 0.15 ? FLAME[2] : FLAME[1], 2, 1);
    }
  }
  if (s < 0 || s >= DECREE.gone) return;
  if (s < DECREE.lands) {
    // IN THE AIR: the roll flung down from his hand to the lane's near end, swelling to its width, a streak behind it
    if (layer !== 'air') return;
    const u = s / DECREE.lands;
    const d = hand[0] + (DECREE.from - hand[0]) * u;
    const [X, Y] = at(...W(d, 0), hand[1] * (1 - u));
    if (!keep(at(...W(d, 0))[1])) return;
    const half = 0.4 + (DECREE.half - 0.4) * u;
    for (let l = -half; l <= half; l += 0.03) {
      const [x2, y2] = at(...W(d, l), hand[1] * (1 - u));
      for (let j = 0; j < 7; j++) dot(p, x2, y2 - j, j < 2 ? PAPER[4] : j < 5 ? PAPER[3] : PAPER[1]);
    }
    for (let j = 1; j < 6; j++) {
      const [x3, y3] = at(...W(d - j * 0.12, 0), hand[1] * (1 - u) + j * 9);
      dot(p, x3, y3, j < 3 ? FLAME[3] : FLAME[2], 2, 2);
    }
    void X;
    void Y;
    return;
  }
  if (layer !== 'floor') return;
  const front = decreeFront(s, to) as number;
  const crumble = s < DECREE.out ? 0 : (s - DECREE.out) / (DECREE.gone - DECREE.out);
  const left0 = DECREE.from + (front - DECREE.from) * (1 - crumble);
  const unrolling = s < DECREE.unrolled;
  // THE SHEET: blank paper, yellowed; dark under its edges
  for (let d = DECREE.from; d <= left0; d += 0.035) {
    for (let l = -DECREE.half; l <= DECREE.half; l += 0.035) {
      const [X, Y] = at(...W(d, l));
      const edge = DECREE.half - Math.abs(l);
      const h = hash(Math.round(X), Math.round(Y), 5179);
      if (crumble > 0 && d > left0 - 0.6 && h < (d - (left0 - 0.6)) / 0.6) continue;
      dot(p, X, Y, edge < 0.06 ? PAPER[1] : edge < 0.14 ? PAPER[2] : h < 0.08 ? PAPER[2] : h < 0.7 ? PAPER[3] : PAPER[4], 2, 1);
    }
  }
  for (const side of [-1, 1]) {
    for (let d = DECREE.from; d <= left0; d += 0.03) {
      const [X, Y] = at(...W(d, side * (DECREE.half + 0.03)));
      dot(p, X, Y + 1, INK, 2, 1);
    }
  }
  // THE SMEAR as it unrolls: the roll racing out ahead, streaks of it behind along the paper, dust thrown before it
  if (unrolling) {
    for (let j = 0; j < 5; j++) {
      const d = front - j * 0.55;
      if (d < DECREE.from) continue;
      for (let l = -DECREE.half; l <= DECREE.half; l += 0.03) {
        if (j > 0 && hash(Math.round(l * 40), j, 5181) < 0.3 + j * 0.12) continue;
        const [X, Y] = at(...W(d, l));
        for (let z = 0; z < (j === 0 ? 9 : 3); z++) dot(p, X, Y - z, j === 0 ? (z < 3 ? PAPER[4] : z < 7 ? PAPER[3] : PAPER[1]) : j < 2 ? FLAME[3] : j < 4 ? FLAME[2] : FLAME[1]);
      }
    }
    for (let i = 0; i < 40; i++) {
      const l = (hash(i, 1, 5183) * 2 - 1) * DECREE.half * 1.2;
      const [X, Y] = at(...W(front + 0.2 + 0.6 * hash(i, 2, 5183), l), 4 + 12 * hash(i, 3, 5183));
      dot(p, X, Y, i % 3 ? HUSH[3] : HUSH[4], 2, 1);
    }
  } else if (crumble === 0) {
    // (the last of it curled at the end)
    for (let l = -DECREE.half; l <= DECREE.half; l += 0.03) {
      const [X, Y] = at(...W(front, l));
      for (let z = 0; z < 5; z++) dot(p, X, Y - z, z < 2 ? PAPER[4] : PAPER[2]);
    }
  }
  // THE LETTERS BURNING along it: lit from the near end out as the burn races down it, burning on, then dying with the crumbling
  const lit = DECREE.from + (s - DECREE.unrolled * 0.5) * DECREE.burn;
  const rows = Math.floor((left0 - DECREE.from - 0.3) / 0.62);
  for (let r = 0; r < rows; r++) {
    const d = DECREE.from + 0.35 + r * 0.62;
    if (d > lit) break;
    for (let c = 0; c < 3; c++) {
      const l = -DECREE.half + 0.22 + c * 0.92;
      const seed = r * 7 + c;
      const heat = 0.55 + 0.45 * Math.sin(m * 9 + r * 1.3 + c * 2.1);
      const fresh = clamp01(1 - (lit - d) / 2.5);
      for (const [u0, v0, u1, v1] of glyph(seed)) {
        const n = 10;
        for (let k = 0; k <= n; k++) {
          const u = u0 + ((u1 - u0) * k) / n;
          const v = v0 + ((v1 - v0) * k) / n;
          const [X, Y] = at(...W(d + 0.52 * v, l + 0.62 * u));
          if (crumble > 0 && hash(seed, k, 5185) < crumble * 1.4) continue;
          dot(p, X - 1, Y + 1, FLAME[0], 3, 2);
          dot(p, X, Y, fresh > 0.5 ? '#fff0c8' : heat > 0.75 ? FLAME[4] : heat > 0.4 ? FLAME[3] : FLAME[2], 2, 2);
        }
      }
    }
  }
  // (the floor under it scorched and smoking: specks of the Hush rising off the burning letters)
  for (let i = 0; i < 70; i++) {
    const life = (s * 1.3 + hash(i, 1, 5187)) % 1;
    const d = DECREE.from + (Math.min(lit, left0) - DECREE.from) * hash(i, 2, 5187);
    if (d < DECREE.from) continue;
    const l = (hash(i, 3, 5187) * 2 - 1) * DECREE.half;
    const [X, Y] = at(...W(d, l), 2 + life * 26);
    if (crumble > 0.9) continue;
    dot(p, X + Math.sin(i + s * 3) * 2, Y, life < 0.3 ? FLAME[2] : life < 0.6 ? HUSH[4] : HUSH[3], 2, 1);
  }
  // THE SEAL at the near end, cracked open and burning
  if (crumble < 0.95) {
    const [cx, cy] = at(...W(DECREE.from + 0.3, 0));
    for (const [dy, half, c] of [[-4, 4, WAX[2]], [-3, 7, WAX[1]], [-2, 9, WAX[1]], [-1, 9, WAX[1]], [0, 8, WAX[1]], [1, 6, WAX[0]]] as const) dot(p, cx - half, cy + dy, c, half * 2 + 1, 1);
    dot(p, cx - 5, cy - 2, FLAME[2], 11, 1);
    dot(p, cx - 1, cy - 3, FLAME[4], 3, 2);
  }
}

// =============================================================================================
// THE CROWD

/**
 * THE CALL (tiles and seconds): while he holds the summons, the Hush wells up in the mouths of the lanes into the square; from the
 * call, its rings roll out from him at `speed` (to `reach`), and out of each pool `each` of the Hushed come, `apart` seconds apart,
 * the first `first` after the call; each pool sinks `sink` after its last is out.
 */
export const CALL = { speed: 12, reach: 16, rings: 4, every: 0.18, each: 2, apart: 0.35, first: 0.25, out: 0.45, sink: 0.8 } as const;
/** When the `k`th of a pool comes out of it (seconds after the call), the `i`th pool of a call. */
export const comesOut = (i: number, k: number): number => CALL.first + i * 0.08 + k * CALL.apart;
/** THE CROWD ON THE FLOOR, `m` seconds into the move, him at C; the pools at `spots`. */
export function paintCall(p: Px, at: At, m: number, C: readonly [number, number], spots: ReadonlyArray<readonly [number, number]>, inside: (x: number, y: number) => boolean = () => true): void {
  const s = m - CROWD_HIT;
  // THE WARNING: the pools welling up in the lanes' mouths, growing as he holds the summons; his pink in them
  spots.forEach(([x, y], i) => {
    const grow = smooth((m - CROWD_HOLD[0] - i * 0.04) / 0.6);
    const last = comesOut(i, CALL.each - 1) + CALL.out;
    const sink = s < last ? 1 : 1 - (s - last) / CALL.sink;
    if (grow <= 0 || sink <= 0) return;
    const R = 1.15 * grow * (1 + 0.05 * Math.sin(m * 7 + i));
    for (let j = 0; j < 700; j++) {
      const a = hash(j, i, 5191) * Math.PI * 2;
      const r = R * Math.sqrt(hash(j, i + 1, 5191));
      if (hash(j, i + 2, 5191) > sink) continue;
      const [X, Y] = at(x + Math.cos(a) * r, y + Math.sin(a) * r);
      dot(p, X, Y, r < R * 0.55 ? HUSH[0] : HUSH[1], 2, 2);
    }
    const n = Math.max(10, Math.round(R * 70));
    for (let j = 0; j < n; j++) {
      const a = (j / n) * Math.PI * 2;
      const rr = R * (1 + 0.07 * Math.sin(a * 5 + m * 9));
      const [X, Y] = at(x + Math.cos(a) * rr, y + Math.sin(a) * rr);
      if (hash(j, i + 3, 5191) > sink) continue;
      dot(p, X, Y, s < 0 && j % 3 !== 0 ? (s > -0.3 ? FLAME[3] : FLAME[2]) : HUSH[4], 2, 1);
      dot(p, X, Y + 1, s < 0 ? FLAME[0] : HUSH[2], 2, 1);
    }
    // (pinpoints of pink in it before they are out; specks rising)
    if (s < CALL.first + CALL.out) {
      const [X, Y] = at(x, y);
      for (const dx of [-3, 2]) dot(p, X + dx, Y - 2, FLAME[3], 2, 1);
    }
    for (let j = 0; j < 14; j++) {
      const life = (m * 1.6 + hash(j, i, 5193)) % 1;
      const a = hash(j, i + 4, 5193) * Math.PI * 2;
      const [X, Y] = at(x + Math.cos(a) * R * 0.7, y + Math.sin(a) * R * 0.7, 2 + life * 30);
      if (hash(j, i + 5, 5193) > sink) continue;
      dot(p, X, Y, life < 0.4 ? HUSH[4] : HUSH[3], 2, 1);
    }
  });
  // THE CALL'S RINGS rolling out across the square from him
  if (s >= 0) {
    for (let j = 0; j < CALL.rings; j++) {
      const age = s - j * CALL.every;
      if (age < 0) continue;
      const r = 0.8 + age * CALL.speed;
      if (r > CALL.reach) continue;
      const fade = 1 - r / CALL.reach;
      for (const [back, c] of [[0, PALE], [0.15, HUSH[4]], [0.32, HUSH[3]]] as const) {
        const rr = r - back;
        if (rr < 0.5) continue;
        const n = Math.round(rr * 55);
        for (let i = 0; i < n; i++) {
          if (hash(i, j + Math.round(back * 10), 5195) > fade * 0.95) continue;
          const a = (i / n) * Math.PI * 2;
          if (!inside(C[0] + Math.cos(a) * rr, C[1] + Math.sin(a) * rr)) continue;
          const [X, Y] = at(C[0] + Math.cos(a) * rr, C[1] + Math.sin(a) * rr, 1);
          dot(p, X, Y, back === 0 && hash(i, j, 5197) < 0.1 ? FLAME[2] : c, back === 0 ? 2 : 1, 1);
        }
      }
    }
  }
}
void SWING_HITS;
