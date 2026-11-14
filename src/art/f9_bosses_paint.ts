// FLOOR 9'S SIDE BOSSES: WHAT THEIR BLOWS THROW ABOUT, PAINTED (the enemy's pink and gold, FLAME; the mist's pale), on a picture of
// the figures' own size and in their own camera: the warnings laid on the ground (rings, arcs, lanes), the ground broken (cracks,
// shockwaves, dust, chips of stone, rock thrust up), the blows' bursts and smears and after-images and speed lines, the rage's fire,
// the mist's clouds and puffs. First painted for his films (tools/f9_bosses_film.ts, docs/mockups/f9_side_bosses/README.md); the
// game's pictures of them are painted with the same (art/f9_bosses_art.ts, art/f9_bosses_fx.ts), behind F9_LAIRS, off.

import { Px } from '../engine/px';
import { hash } from './kit';
import { FLAME } from './mkit';
import type { V3 } from './skeleton';

/** Where a point of a figure's ground is on the picture: its own lengths forward, to its left, up. */
export type Pr = (f: number, l: number, u: number) => readonly number[];

/** A pixel set if it is on the picture. */
export const put = (px: Px, x: number, y: number, c: string): void => {
  const X = Math.round(x);
  const Y = Math.round(y);
  if (X >= 0 && Y >= 0 && X < px.w && Y < px.h) px.set(X, Y, c);
};

/** A line of pixels, `w` thick, every pixel `keep(k)` says (0..1 along it). */
export function line(px: Px, a: readonly number[], b: readonly number[], c: string, w = 1, keep: (k: number) => boolean = () => true): void {
  const n = Math.max(1, Math.ceil(Math.hypot(b[0] - a[0], b[1] - a[1])));
  for (let i = 0; i <= n; i++) {
    const k = i / n;
    if (!keep(k)) continue;
    const x = a[0] + (b[0] - a[0]) * k;
    const y = a[1] + (b[1] - a[1]) * k;
    for (let dx = 0; dx < w; dx++) for (let dy = 0; dy < w; dy++) put(px, x + dx - (w >> 1), y + dy - (w >> 1), c);
  }
}

/** A WARNING RING on the ground where a blow will land: dashed pink, a faint dither inside. */
export function warnRing(px: Px, pr: Pr, cf: number, cl: number, r: number, t: number): void {
  const n = 48;
  for (let i = 0; i < n; i++) {
    if ((i + Math.floor(t * 10)) % 3 === 2) continue;
    const a0 = (i / n) * Math.PI * 2;
    const a1 = ((i + 1) / n) * Math.PI * 2;
    line(px, pr(cf + Math.cos(a0) * r, cl + Math.sin(a0) * r, 0), pr(cf + Math.cos(a1) * r, cl + Math.sin(a1) * r, 0), FLAME[2], 2);
  }
  // (a faint pink inside it)
  const c = pr(cf, cl, 0);
  const e = pr(cf + r, cl, 0);
  const R = Math.hypot(e[0] - c[0], e[1] - c[1]) + 6;
  for (let y = -R; y <= R; y++) for (let x = -R; x <= R; x++) {
    if ((Math.round(c[0] + x) + Math.round(c[1] + y)) % 3 !== 0 || Math.round(c[1] + y) % 2) continue;
    const [ff, ll] = invGround(pr, c[0] + x, c[1] + y);
    if (Math.hypot(ff - cf, ll - cl) < r) put(px, c[0] + x, c[1] + y, FLAME[1]);
  }
}

/** A WARNING ARC on the ground (a claw's sweep): its curved edges and its ends dashed pink, from angle `a0` to `a1` round (cf, cl), `r0` to `r1` out. */
export function warnArc(px: Px, pr: Pr, cf: number, cl: number, r0: number, r1: number, a0: number, a1: number, t: number): void {
  const n = 30;
  for (const r of [r0, r1]) for (let i = 0; i < n; i++) {
    if ((i + Math.floor(t * 10)) % 3 === 2) continue;
    const u = a0 + ((a1 - a0) * i) / n;
    const v = a0 + ((a1 - a0) * (i + 1)) / n;
    line(px, pr(cf + Math.cos(u) * r, cl + Math.sin(u) * r, 0), pr(cf + Math.cos(v) * r, cl + Math.sin(v) * r, 0), FLAME[2], 2);
  }
  for (const a of [a0, a1]) line(px, pr(cf + Math.cos(a) * r0, cl + Math.sin(a) * r0, 0), pr(cf + Math.cos(a) * r1, cl + Math.sin(a) * r1, 0), FLAME[2], 2);
  const c = pr(cf, cl, 0);
  for (let y = -80; y <= 80; y++) for (let x = -120; x <= 120; x++) {
    if ((Math.round(c[0] + x) + Math.round(c[1] + y)) % 3 !== 0 || Math.round(c[1] + y) % 2) continue;
    const [ff, ll] = invGround(pr, c[0] + x, c[1] + y);
    const r = Math.hypot(ff - cf, ll - cl);
    const a = Math.atan2(ll - cl, ff - cf);
    if (r > r0 && r < r1 && a > a0 && a < a1) put(px, c[0] + x, c[1] + y, FLAME[1]);
  }
}

/** A WARNING LANE on the ground: its edges dashed pink, its middle a faint pink dither. */
export function warnLane(px: Px, pr: Pr, f0: number, f1: number, l: number, half: number, t: number): void {
  for (const s of [-1, 1]) line(px, pr(f0, l + s * half, 0), pr(f1, l + s * half, 0), FLAME[2], 2, (k) => Math.floor(k * (f1 - f0) / 5 - t * 8) % 2 === 0);
  line(px, pr(f1, l - half, 0), pr(f1, l + half, 0), FLAME[2], 2);
  const a = pr(f0, l - half, 0);
  const b = pr(f1, l + half, 0);
  for (let y = Math.min(a[1], b[1]) - 40; y < Math.max(a[1], b[1]) + 40; y++) {
    for (let x = Math.min(a[0], b[0]) - 40; x < Math.max(a[0], b[0]) + 40; x++) {
      if ((x + y) % 3 !== 0 || y % 2) continue;
      // (inside the lane: by the ground point under this pixel)
      const [ff, ll] = invGround(pr, x, y);
      if (ff > f0 && ff < f1 && Math.abs(ll - l) < half) put(px, x, y, FLAME[1]);
    }
  }
}

/** Which ground point (f, l) is under a pixel, by the projection of two steps along the ground. */
export function invGround(pr: Pr, x: number, y: number): [number, number] {
  const o = pr(0, 0, 0);
  const ef = pr(1, 0, 0);
  const el = pr(0, 1, 0);
  const a = ef[0] - o[0];
  const b = el[0] - o[0];
  const c = ef[1] - o[1];
  const d = el[1] - o[1];
  const det = a * d - b * c || 1;
  const X = x - o[0];
  const Y = y - o[1];
  return [(X * d - b * Y) / det, (a * Y - c * X) / det];
}

/** A SHOCKWAVE along the ground from where a blow landed, `k` 0..1 of its life. */
export function shock(px: Px, pr: Pr, cf: number, cl: number, R: number, k: number): void {
  if (k <= 0 || k >= 1) return;
  const r = R * (1 - (1 - k) ** 2);
  const n = 64;
  for (let i = 0; i < n; i++) {
    if (k > 0.5 && hash(i, Math.floor(k * 20), 9201) < (k - 0.5) * 1.6) continue;
    const a0 = (i / n) * Math.PI * 2;
    const a1 = ((i + 1) / n) * Math.PI * 2;
    line(px, pr(cf + Math.cos(a0) * r, cl + Math.sin(a0) * r, 0), pr(cf + Math.cos(a1) * r, cl + Math.sin(a1) * r, 0), k < 0.4 ? FLAME[4] : FLAME[3], 2);
    line(px, pr(cf + Math.cos(a0) * r * 0.9, cl + Math.sin(a0) * r * 0.9, 0), pr(cf + Math.cos(a1) * r * 0.9, cl + Math.sin(a1) * r * 0.9, 0), FLAME[2]);
  }
}

/** DUST thrown up where something struck the ground, billowing out and settling, `k` 0..1. */
export function dust(px: Px, pr: Pr, cf: number, cl: number, k: number, seed: number, n = 10, R = 26): void {
  if (k <= 0 || k >= 1) return;
  for (let i = 0; i < n; i++) {
    const a = hash(i, 1, seed) * Math.PI * 2;
    const d = R * (0.3 + 0.7 * hash(i, 2, seed)) * Math.sqrt(k);
    const c = pr(cf + Math.cos(a) * d, cl + Math.sin(a) * d, 6 + 14 * k * hash(i, 3, seed));
    const r = 3 + 7 * k;
    for (let y = -r; y <= r; y++) for (let x = -r * 1.4; x <= r * 1.4; x++) {
      const q = Math.hypot(x / 1.4, y) / r;
      if (q > 1) continue;
      if ((Math.round(c[0] + x) + Math.round(c[1] + y)) % 2 && k > 0.35) continue;
      if (hash(Math.round(c[0] + x), Math.round(c[1] + y), seed + i) < k * 0.9 + q * 0.3) continue;
      put(px, c[0] + x, c[1] + y, DUST[q < 0.5 ? 3 : 2]);
    }
  }
}

/** CHIPS OF EARTH AND STONE flung up from where a blow landed, falling back, `t` seconds after. */
export function chips(px: Px, pr: Pr, cf: number, cl: number, t: number, seed: number, n = 12): void {
  if (t < 0 || t > 0.9) return;
  for (let i = 0; i < n; i++) {
    const a = hash(i, 1, seed) * Math.PI * 2;
    const v = 30 + 50 * hash(i, 2, seed);
    const vz = 60 + 90 * hash(i, 3, seed);
    const u = vz * t - 260 * t * t;
    if (u < 0) continue;
    const c = pr(cf + Math.cos(a) * v * t, cl + Math.sin(a) * v * t, u);
    const s = 1 + (i % 2);
    for (let y = 0; y < s; y++) for (let x = 0; x < s + 1; x++) put(px, c[0] + x, c[1] + y, ROCK[1 + ((i + x) % 3)]);
  }
}

/** A CRACK run out along the ground from (f0, l), as far as `k` of `long`, its glow fading after `fade`: jagged, branching, glowing pink and gold in its depths, shards of rock thrust up along it. */
export function crack(px: Px, pr: Pr, f0: number, l: number, long: number, k: number, fade: number, seed: number): void {
  if (k <= 0) return;
  const n = 40;
  let prev = pr(f0, l, 0);
  const glow = Math.max(0, 1 - fade);
  for (let i = 1; i <= n * Math.min(1, k); i++) {
    const f = f0 + (i / n) * long;
    const j = (hash(i, 1, seed) - 0.5) * 7 + Math.sin(i * 0.9 + seed) * 3;
    const p = pr(f, l + j, 0);
    line(px, prev, p, '#140c10', 4);
    if (glow > 0) line(px, prev, p, hash(i, 2, seed) < glow * 0.9 ? (i % 3 ? FLAME[2] : FLAME[3]) : '#2a1420', 2);
    // (branches)
    if (i % 6 === 3) {
      const s = hash(i, 3, seed) < 0.5 ? -1 : 1;
      line(px, p, pr(f + 6, l + j + s * 9, 0), '#140c10', 2);
    }
    // (shards of rock thrust up along it, as it passes)
    if (i % 4 === 0) {
      const age = k * n - i;
      const up = Math.min(1, age / 3) * (8 + 9 * hash(i, 4, seed));
      if (up > 0) {
        const base = pr(f, l + j + (hash(i, 5, seed) - 0.5) * 6, 0);
        for (let y = 0; y < up; y++) {
          const w = Math.max(1, Math.round((1 - y / up) * 3));
          for (let x = -w; x <= w; x++) put(px, base[0] + x, base[1] - y, x < 0 ? ROCK[3] : x > 0 ? ROCK[1] : ROCK[2]);
        }
      }
    }
    prev = p;
  }
}

/** ARCS from a point, spreading as `k` goes 0..1 (a roar, a howl): pink and gold, `dir` the way they go (radians in the picture). */
export function arcs(px: Px, x: number, y: number, k: number, dir: number, spread: number, n: number, ramp: readonly string[]): void {
  for (let j = 0; j < n; j++) {
    const kk = (k * 1.4 - j * 0.22);
    if (kk <= 0 || kk >= 1) continue;
    const r = 8 + 60 * kk;
    for (let i = -20; i <= 20; i++) {
      const a = dir + (i / 20) * spread;
      if (hash(i, j, 9301) < kk * 0.6) continue;
      const cc = kk < 0.4 ? ramp[ramp.length - 1] : ramp[ramp.length - 2];
      put(px, x + Math.cos(a) * r, y + Math.sin(a) * r * 0.7, cc);
      put(px, x + Math.cos(a) * (r - 1), y + Math.sin(a) * (r - 1) * 0.7, ramp[ramp.length - 3]);
    }
  }
}

/** A CLAW'S OR A BITE'S SWEEP: a crescent along an arc (picture), its trailing end thin, fading by `k`. */
export function slash(px: Px, x: number, y: number, r: number, a0: number, a1: number, k: number, ramp: readonly string[], w = 3): void {
  if (k <= 0 || k >= 1) return;
  const n = Math.ceil(Math.abs(a1 - a0) * r);
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    if (t > Math.min(1, k * 2.2)) break;
    if (t < k * 1.2 - 0.2) continue;
    const a = a0 + (a1 - a0) * t;
    const th = Math.max(1, Math.round(w * Math.sin(t * Math.PI)));
    for (let d = 0; d < th; d++) put(px, x + Math.cos(a) * (r - d), y + Math.sin(a) * (r - d), d === 0 ? ramp[ramp.length - 1] : ramp[ramp.length - 2]);
  }
}

/** A STAR OF A HIT on someone struck. */
export function hit(px: Px, x: number, y: number, k: number): void {
  if (k <= 0 || k >= 1) return;
  const r = 4 + 10 * k;
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2 + 0.3;
    line(px, [x + Math.cos(a) * r * 0.3, y + Math.sin(a) * r * 0.3], [x + Math.cos(a) * r * (i % 2 ? 0.6 : 1), y + Math.sin(a) * r * (i % 2 ? 0.6 : 1)], k < 0.5 ? FLAME[4] : FLAME[3]);
  }
}

/** THE RAGE ON HIM: pink and gold flames licking up off his outline, flickering (`f` the frame). */
export function rage(px: Px, body: Px, f: number, amt: number, ox = 0, oy = 0): void {
  if (amt <= 0) return;
  const a = (x: number, y: number): boolean => x >= 0 && y >= 0 && x < body.w && y < body.h && body.d[(y * body.w + x) * 4 + 3] > 0;
  for (let y = 1; y < body.h - 1; y++) {
    for (let x = 1; x < body.w - 1; x++) {
      if (!a(x, y) || a(x, y - 1)) continue;
      if (hash(x, y + Math.floor(f / 2) * 7, 9401) > amt * 0.9) continue;
      const tall = 3 + Math.floor(hash(x, Math.floor(f / 2), 9403) * 8);
      for (let k = 1; k <= tall; k++) {
        if (a(x, y - k)) break;
        put(px, ox + x + Math.round(Math.sin((y - k + f) * 0.7) * 0.6), oy + y - k, k < tall * 0.4 ? FLAME[3] : k < tall * 0.8 ? FLAME[2] : FLAME[1]);
      }
    }
  }
  // (a glow of it all round him: a dither of pink just outside his outline)
  for (let y = 2; y < body.h - 2; y++) {
    for (let x = 2; x < body.w - 2; x++) {
      if (a(x, y) || (x + y + f) % 2) continue;
      if (a(x - 2, y) || a(x + 2, y) || a(x, y - 2) || a(x, y + 2)) if (hash(x, y, 9405 + (f >> 2)) < amt * 0.8) put(px, ox + x, oy + y, FLAME[1]);
    }
  }
}

/** THE MIST CLOUD: billowing out round (cf, cl) to `R`, `k` 0..1 as it grows, thick; churning by `t`; pink glints in it where it hurts. */
export function mistCloud(px: Px, pr: Pr, cf: number, cl: number, R: number, k: number, t: number, thin: number): void {
  if (k <= 0) return;
  const c = pr(cf, cl, 18);
  const e = pr(cf + R * k, cl, 18);
  const rx = Math.abs(e[0] - c[0]) * 1.3 + 4;
  const ry = rx * 0.62;
  for (let y = Math.floor(c[1] - ry * 1.4); y < c[1] + ry; y++) {
    for (let x = Math.floor(c[0] - rx); x < c[0] + rx; x++) {
      const q = Math.hypot((x - c[0]) / rx, (y - c[1]) / ry);
      // (soft billows rolling through it, drifting: smooth noise at two sizes, never a pattern)
      const swirl = 0.62 * vnoise(x / 22 + t * 0.5, y / 13 - t * 0.2, 9501) + 0.38 * vnoise(x / 9 - t * 0.7, y / 6 + t * 0.3, 9502);
      const d = (1 - q) * 1.6 + (swirl - 0.5) * 0.5 - thin;
      if (d <= 0) continue;
      const B = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5][(y & 3) * 4 + (x & 3)];
      if (Math.min(0.9, d) * 16 < B + 0.5) continue;
      put(px, x, y, swirl > 0.75 ? MIST[4] : swirl > 0.35 ? MIST[3] : MIST[2]);
    }
  }
  // (glints in it where it hurts)
  for (let i = 0; i < 16; i++) {
    const ph = (t * 1.7 + hash(i, 1, 9503)) % 1;
    if (ph > 0.35 || thin > 0.6) continue;
    const a = hash(i, 2, 9503) * Math.PI * 2;
    const d = Math.sqrt(hash(i, 3, 9503)) * 0.85;
    const x = c[0] + Math.cos(a) * rx * d;
    const y = c[1] + Math.sin(a) * ry * d;
    put(px, x, y, FLAME[4]);
    put(px, x - 1, y, FLAME[2]);
    put(px, x + 1, y, FLAME[2]);
    put(px, x, y - 1, FLAME[2]);
    put(px, x, y + 1, FLAME[2]);
  }
}

/** AN AFTER-IMAGE of a figure: every other pixel of it, in `ramp`'s pale and its colour, `k` (0..1) of it left. */
export function ghost(px: Px, fig: Px, ramp: readonly string[], k: number, seed: number, ox = 0, oy = 0): void {
  const a = (x: number, y: number): boolean => x >= 0 && y >= 0 && x < fig.w && y < fig.h && fig.d[(y * fig.w + x) * 4 + 3] > 0;
  for (let y = 0; y < fig.h; y++) {
    for (let x = 0; x < fig.w; x++) {
      if (!a(x, y)) continue;
      // (a checker of it, thinning as it fades: the body a step darker, its outline its colour)
      if ((ox + x + oy + y) % 2) continue;
      if (hash(x >> 2, y >> 2, seed) > k * 1.1) continue;
      const edge = !a(x - 2, y) || !a(x + 2, y) || !a(x, y - 2) || !a(x, y + 2);
      put(px, ox + x, oy + y, edge ? ramp[ramp.length - 3] : ramp[Math.max(0, ramp.length - 4)]);
    }
  }
}

/** A SMEAR along a path (picture points, oldest first): thick at its head, thinning to its tail; white at its heart, then `ramp`. */
export function smear(px: Px, path: readonly (readonly number[])[], w: number, ramp: readonly string[], k = 1, inner?: readonly (readonly number[])[]): void {
  // (filled between the arc its head swept and the arc its middle swept, as a crescent: the heart white, then the ramp, its edge the ramp's darker)
  const n = path.length;
  for (let i = 1; i < n; i++) {
    const t = i / (n - 1);
    if (t < 1 - k) continue;
    const o0 = path[i - 1];
    const o1 = path[i];
    const i0 = inner ? inner[i - 1] : o0;
    const i1 = inner ? inner[i] : o1;
    // (filled solid: as many strokes across as it is pixels wide, twice over)
    const steps = Math.max(4, Math.ceil(Math.max(Math.hypot(i0[0] - o0[0], i0[1] - o0[1]), Math.hypot(i1[0] - o1[0], i1[1] - o1[1])) * 2));
    for (let s = 0; s <= steps; s++) {
      const q = s / steps;
      // (thin at the tail, full at the head)
      if (q > 0.2 + 0.8 * t) continue;
      const a = [o0[0] + (i0[0] - o0[0]) * q, o0[1] + (i0[1] - o0[1]) * q];
      const b = [o1[0] + (i1[0] - o1[0]) * q, o1[1] + (i1[1] - o1[1]) * q];
      const c = q < 0.14 ? '#fffaf0' : q < 0.4 ? ramp[ramp.length - 1] : q < 0.7 ? ramp[ramp.length - 2] : ramp[ramp.length - 3];
      line(px, a, b, c, 2);
    }
    void w;
  }
}

/** Points along an arc from `a` round to `b` about `c` (its own lengths), `n` of them, the radius going from one's to the other's. */
export function arcPath(c: V3, a: V3, b: V3, n: number): V3[] {
  const va = [a[0] - c[0], a[1] - c[1], a[2] - c[2]];
  const vb = [b[0] - c[0], b[1] - c[1], b[2] - c[2]];
  const ra = Math.hypot(va[0], va[1], va[2]) || 1;
  const rb = Math.hypot(vb[0], vb[1], vb[2]) || 1;
  const ua = va.map((v) => v / ra);
  const ub = vb.map((v) => v / rb);
  const om = Math.acos(Math.max(-1, Math.min(1, ua[0] * ub[0] + ua[1] * ub[1] + ua[2] * ub[2])));
  const out: V3[] = [];
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    const s0 = om < 1e-3 ? 1 - t : Math.sin((1 - t) * om) / Math.sin(om);
    const s1 = om < 1e-3 ? t : Math.sin(t * om) / Math.sin(om);
    const r = ra + (rb - ra) * t;
    out.push([c[0] + (ua[0] * s0 + ub[0] * s1) * r, c[1] + (ua[1] * s0 + ub[1] * s1) * r, c[2] + (ua[2] * s0 + ub[2] * s1) * r]);
  }
  return out;
}

/** SPEED LINES behind something going fast along (vx, vy) (picture), from (x, y). */
export function speedLines(px: Px, x: number, y: number, vx: number, vy: number, n: number, spread: number, seed: number, col: string): void {
  const len = Math.hypot(vx, vy) || 1;
  const ux = vx / len;
  const uy = vy / len;
  for (let i = 0; i < n; i++) {
    const o = (hash(i, 1, seed) - 0.5) * 2 * spread;
    const back = 6 + hash(i, 2, seed) * 30;
    const l = 14 + hash(i, 3, seed) * 36;
    const sx = x - ux * back - uy * o;
    const sy = y - uy * back + ux * o;
    line(px, [sx, sy], [sx - ux * l, sy - uy * l], col);
  }
}

/** THE BURST where a heavy blow lands: a flash and rays thrown out, gold to pink, `k` 0..1 of its blink. */
export function burst(px: Px, x: number, y: number, k: number, size: number, seed: number): void {
  if (k < 0 || k >= 1) return;
  const r0 = size * (0.3 + 0.7 * k);
  // (the flash: a squashed disc, white at its heart)
  for (let j = -r0 * 0.5; j <= r0 * 0.5; j++) for (let i = -r0; i <= r0; i++) {
    const q = Math.hypot(i / r0, j / (r0 * 0.5));
    if (q > 1 - k * 0.6) continue;
    if (k > 0.4 && (Math.round(x + i) + Math.round(y + j)) % 2) continue;
    put(px, x + i, y + j, q < 0.4 ? '#fffaf0' : q < 0.7 ? FLAME[4] : FLAME[3]);
  }
  // (rays)
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2 + hash(i, 1, seed) * 0.4;
    const L = size * (1.2 + hash(i, 2, seed) * 1.4) * (0.4 + k);
    const a0 = L * k * 0.6;
    line(px, [x + Math.cos(a) * a0, y + Math.sin(a) * a0 * 0.6], [x + Math.cos(a) * L, y + Math.sin(a) * L * 0.6], i % 2 ? FLAME[3] : FLAME[4], k < 0.3 ? 2 : 1);
  }
}

/** EMBERS of the enemy's fire rising off something, `t` the clock, `n` of them in a band `w` wide at (x, y). */
export function embers(px: Px, x: number, y: number, w: number, h: number, t: number, n: number, seed: number): void {
  for (let i = 0; i < n; i++) {
    const ph = (t * (0.6 + hash(i, 1, seed) * 0.8) + hash(i, 2, seed)) % 1;
    const ex = x + (hash(i, 3, seed) - 0.5) * w + Math.sin(t * 4 + i) * 3;
    const ey = y - ph * h;
    const c = ph < 0.3 ? FLAME[4] : ph < 0.7 ? FLAME[3] : FLAME[2];
    put(px, ex, ey, c);
    if (ph < 0.5) put(px, ex, ey + 1, FLAME[2]);
  }
}

/** PILLARS OF THE RAGE'S FIRE bursting up round him from the ground, `k` 0..1 of their life, flickering by frame `f`. */
export function flamePillars(px: Px, pr: Pr, cf: number, cl: number, r: number, k: number, f: number): void {
  if (k <= 0 || k >= 1) return;
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * Math.PI * 2 + 0.3;
    const b = pr(cf + Math.cos(a) * r, cl + Math.sin(a) * r, 0);
    const tall = (26 + 30 * hash(i, 1, 9901)) * Math.sin(k * Math.PI) * (0.8 + 0.4 * hash(i, f >> 1, 9903));
    for (let y = 0; y < tall; y++) {
      const wv = Math.max(1, Math.round((1 - y / tall) * 5));
      for (let x = -wv; x <= wv; x++) {
        if (hash(Math.round(b[0] + x), Math.round(b[1] - y) + f, 9905) < y / tall * 0.7) continue;
        put(px, b[0] + x + Math.sin((y + f) * 0.5) * 1.5, b[1] - y, y < tall * 0.3 ? FLAME[4] : y < tall * 0.6 ? FLAME[3] : FLAME[2]);
      }
    }
  }
}

/** SHARDS OF ROCK thrust up out of the ground at (x, y), `up` of their height `tall`. */
export function spike(px: Px, x: number, y: number, tall: number, up: number, lean: number): void {
  const h = tall * up;
  for (let j = 0; j < h; j++) {
    const w = Math.max(1, Math.round((1 - j / tall) * tall * 0.28));
    for (let i = -w; i <= w; i++) put(px, x + i + lean * j * 0.15, y - j, i < -w * 0.3 ? ROCK[3] : i > w * 0.4 ? ROCK[1] : ROCK[2]);
  }
  line(px, [x - tall * 0.3, y], [x + tall * 0.3, y], ROCK[0], 2);
}

/** A crack run straight out from (cf, cl) at angle `a` (on the ground), `len` long, `k` of it shown, its glow fading after `fade`. */
export function crackRay(px: Px, pr: Pr, cf: number, cl: number, a: number, len: number, k: number, fade: number, seed: number): void {
  if (k <= 0) return;
  const n = 10;
  let prev = pr(cf, cl, 0);
  for (let i = 1; i <= n * k; i++) {
    const r = (i / n) * len;
    const j = (hash(i, 1, seed) - 0.5) * 0.5;
    const p2 = pr(cf + Math.cos(a + j) * r, cl + Math.sin(a + j) * r, 0);
    line(px, prev, p2, '#1e1218', Math.max(1, 3 - Math.floor(i / 4)));
    if (fade < 1) line(px, prev, p2, hash(i, 2, seed) > fade ? (i < 4 ? FLAME[3] : FLAME[2]) : '#3a1c28', i < 4 ? 2 : 1);
    prev = p2;
  }
}

/** MIST BURSTING out of a point on the ground, `k` 0..1 of its life: a puff thrown up and out, thinning. */
export function mistBurst(px: Px, pr: Pr, cf: number, cl: number, k: number, seed: number): void {
  if (k <= 0 || k >= 1) return;
  for (let i = 0; i < 18; i++) {
    const a = hash(i, 1, seed) * Math.PI * 2;
    const r = (10 + 30 * hash(i, 2, seed)) * Math.sqrt(k);
    const c = pr(cf + Math.cos(a) * r, cl + Math.sin(a) * r, 8 + 30 * k * hash(i, 3, seed));
    const s = 2 + 5 * k;
    for (let y = -s; y <= s; y++) for (let x = -s * 1.3; x <= s * 1.3; x++) {
      if (Math.hypot(x / 1.3, y) > s) continue;
      if ((Math.round(c[0] + x) + Math.round(c[1] + y)) % 2 && k > 0.3) continue;
      if (hash(Math.round(c[0] + x), Math.round(c[1] + y), seed + i) < k * 0.85) continue;
      put(px, c[0] + x, c[1] + y, k < 0.4 ? MIST[4] : MIST[3]);
    }
  }
}

/** A RING OF MIST blasting out along the ground, `k` 0..1. */
export function mistRing(px: Px, pr: Pr, cf: number, cl: number, R: number, k: number): void {
  if (k <= 0 || k >= 1) return;
  const r = R * (1 - (1 - k) ** 2);
  for (let i = 0; i < 90; i++) {
    const a = (i / 90) * Math.PI * 2;
    const c = pr(cf + Math.cos(a) * r, cl + Math.sin(a) * r, 6);
    for (let j = 0; j < 4; j++) {
      if (hash(i, j, 9811) < k * 0.8) continue;
      put(px, c[0] + (hash(i, j + 4, 9811) - 0.5) * 6, c[1] - j * 2, j < 2 ? MIST[4] : MIST[3]);
    }
  }
}

/** MOTES OF MIST rising off it (its own embers), in a band `w` wide at (x, y). */
export function embersMist(px: Px, x: number, y: number, w: number, h: number, t: number, n: number, seed: number): void {
  for (let i = 0; i < n; i++) {
    const ph = (t * (0.6 + hash(i, 1, seed) * 0.8) + hash(i, 2, seed)) % 1;
    put(px, x + (hash(i, 3, seed) - 0.5) * w + Math.sin(t * 3 + i) * 3, y - ph * h, ph < 0.5 ? MIST[4] : MIST[3]);
  }
}

export const DUST = ['#4a4034', '#6a5c48', '#8a7a60', '#a89878'];

export const ROCK = ['#2e2c2a', '#4a4844', '#6a6862', '#8c8a82'];

export const MIST = ['#4a4664', '#6c688a', '#9692b2', '#c6c2da', '#eeecf8'];

// =================================================================================================
// THE GAME'S OWN, BIG: what the side bosses throw about painted to fill the screen at the phone's size (his word, 14 Nov 2026, of them
// in play: “These animations are boring.  I’m supposed to be looking for insane animations that need to be toned down but I have yet
// to see one issue with something being TOO intense”). Thick, wide, many: never a hairline.

/** A filled ellipse, `rx` by `ry`, in `c`; every other pixel only where `dither`. */
export function blob(px: Px, x: number, y: number, rx: number, ry: number, c: string, dither = false): void {
  for (let j = Math.floor(-ry); j <= ry; j++) {
    const w = rx * Math.sqrt(Math.max(0, 1 - (j / ry) ** 2));
    for (let i = Math.floor(-w); i <= w; i++) {
      if (dither && (Math.round(x + i) + Math.round(y + j)) % 2) continue;
      put(px, x + i, y + j, c);
    }
  }
}
/** A PUFF OF DUST OR SMOKE, round and shaded: dark under, pale on top; `fade` 0..1 thins it to a dither and to nothing. */
export function puff(px: Px, x: number, y: number, r: number, ramp: readonly string[], fade: number, seed: number): void {
  if (r < 1 || fade >= 1) return;
  for (let j = Math.floor(-r); j <= r; j++) {
    for (let i = Math.floor(-r * 1.15); i <= r * 1.15; i++) {
      const q = Math.hypot(i / 1.15, j) / r;
      if (q > 1) continue;
      const X = Math.round(x + i);
      const Y = Math.round(y + j);
      if (fade > 0 && hash(X, Y, seed) < fade * 1.1 - (1 - q) * 0.2) continue;
      if (fade > 0.45 && (X + Y) % 2) continue;
      // (mist: soft, a dither thinning to its edge, no rim)
      if (ramp === MISTY) {
        if ((X + Y) % 2 || hash(X >> 1, Y >> 1, seed + 3) < q * q * 0.9) continue;
        put(px, X, Y, ramp[q < 0.5 && -j / r > 0 ? 3 : 2]);
        continue;
      }
      const lit = -j / r * 0.7 - i / r * 0.3;
      const k = q > 0.86 ? 0 : lit > 0.35 ? 3 : lit > -0.1 ? 2 : 1;
      put(px, X, Y, ramp[Math.min(ramp.length - 1, k)]);
    }
  }
}
/** A GREAT SHOCKWAVE rolling out over the ground from (cf, cl) to `R` (its own lengths), `k` 0..1: a thick bright band, a wall of dust riding it. */
export function bigShock(px: Px, pr: Pr, cf: number, cl: number, R: number, k: number, thick: number, seed: number, hot: readonly string[] = SHOCK_HOT, dusty: readonly string[] = DUSTY): void {
  if (k <= 0 || k >= 1) return;
  const r = R * (1 - (1 - k) ** 2.2);
  const band = Math.max(3, thick * (1 - k * 0.6));
  // (as many steps round it as it is pixels round, and more: a solid band, not a string of dots)
  const o = pr(cf, cl, 0);
  const o1 = pr(cf + Math.max(1, r), cl, 0);
  const n = Math.max(64, Math.round(Math.hypot(o1[0] - o[0], o1[1] - o[1]) * Math.PI * 2 * 1.3));
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    if (k > 0.55 && hash(Math.floor(i / 6), Math.floor(k * 30), seed) < (k - 0.55) * 2) continue;
    for (let b = 0; b < band; b += 0.7) {
      const rr = r - b;
      if (rr < 0) break;
      const p = pr(cf + Math.cos(a) * rr, cl + Math.sin(a) * rr, 0);
      const q = b / band;
      put(px, p[0], p[1], q < 0.2 ? hot[0] : q < 0.45 ? hot[1] : q < 0.75 ? hot[2] : hot[3]);
    }
  }
  // (the dust it throws up as it goes: puffs riding its front)
  for (let i = 0; i < 26; i++) {
    const a = (i / 26) * Math.PI * 2 + hash(i, 1, seed) * 0.2;
    const p = pr(cf + Math.cos(a) * r * 0.97, cl + Math.sin(a) * r * 0.97, 4 + 10 * k);
    puff(px, p[0], p[1] - 6, 9 + 24 * k * (0.6 + hash(i, 2, seed) * 0.6), dusty, Math.max(0, k * 1.2 - 0.25), seed + i);
  }
}
/** A shockwave's colours, its front to its back: the enemy's fire; the mist's. */
export const SHOCK_HOT = ['#fffaf0', FLAME[4], FLAME[3], FLAME[2]];
export const SHOCK_MIST = ['#ffffff', '#eeecf8', '#c6c2da', FLAME[2]];
/** The mist's puffs, dark to pale. */
export const MISTY = ['#4a4664', '#8a86a8', '#c6c2da', '#f2f0fa'];
/** Dust's colours, dark to pale; stone's. */
export const DUSTY = ['#2e261e', '#5a4c3c', '#857258', '#b09a78'];
export const STONEY = ['#1e1c1a', '#3e3b37', '#625e57', '#8e897f'];
/** A CRATER where something came down: a dark pit, its rim of broken stone, cracks out from it glowing pink and gold in their depths, far. */
export function crater(px: Px, pr: Pr, cf: number, cl: number, r: number, k: number, fade: number, seed: number, rays = 9): void {
  if (k <= 0) return;
  const glow = Math.max(0, Math.min(1, 1 - fade));
  const R = r * Math.min(1, k * 1.6);
  // (the cracks out from it, thick, jagged, branching, the full length at once)
  for (let i = 0; i < rays; i++) {
    const a = (i / rays) * Math.PI * 2 + hash(i, 1, seed) * 0.5;
    const long = r * (2.2 + hash(i, 2, seed) * 2.2) * Math.min(1, k * 2.5);
    let prev = pr(cf + Math.cos(a) * R * 0.7, cl + Math.sin(a) * R * 0.7, 0);
    const steps = 14;
    for (let s = 1; s <= steps; s++) {
      const d = R * 0.7 + (long - R * 0.7) * (s / steps);
      const w = (hash(i, s, seed + 1) - 0.5) * r * 0.35;
      const q = pr(cf + Math.cos(a) * d - Math.sin(a) * w, cl + Math.sin(a) * d + Math.cos(a) * w, 0);
      const wide = Math.max(2, Math.round(6 * (1 - s / steps)) + 2);
      line(px, prev, q, '#120a10', wide);
      if (glow > 0 && s < steps) line(px, prev, q, hash(i, s, seed + 2) < glow ? (s % 3 ? FLAME[3] : FLAME[4]) : '#3a1428', Math.max(1, wide - 3));
      if (s % 5 === 2) {
        const sa = a + (hash(i, s, seed + 3) < 0.5 ? -0.9 : 0.9);
        line(px, q, pr(cf + Math.cos(a) * d + Math.cos(sa) * r * 0.8, cl + Math.sin(a) * d + Math.sin(sa) * r * 0.8, 0), '#120a10', 3);
      }
      prev = q;
    }
  }
  // (the pit, dark, its heart glowing as it cools)
  const c = pr(cf, cl, 0);
  const e = pr(cf + R, cl, 0);
  const rx = Math.max(4, Math.abs(e[0] - c[0]) * 1.35);
  blob(px, c[0], c[1], rx, rx * 0.5, '#140c12');
  if (glow > 0) blob(px, c[0], c[1], rx * 0.55, rx * 0.26, glow > 0.5 ? FLAME[2] : FLAME[1], glow < 0.5);
  if (glow > 0.6) blob(px, c[0], c[1], rx * 0.3, rx * 0.14, FLAME[4]);
  // (its rim of broken stone, heaved up)
  for (let i = 0; i < 22; i++) {
    const a = (i / 22) * Math.PI * 2 + hash(i, 4, seed) * 0.25;
    const p = pr(cf + Math.cos(a) * R * 1.05, cl + Math.sin(a) * R * 1.05, 0);
    const s = 3 + hash(i, 5, seed) * 5;
    blob(px, p[0], p[1] - s * 0.5, s * 1.2, s * 0.8, STONEY[1 + (i % 3)]);
    put(px, p[0] - s * 0.4, p[1] - s, STONEY[3]);
  }
}
/** A GREAT CRACK run out along the ground from (f0, l), `k` of `long` of it run, glowing in its depths till `fade`; slabs of rock heaved up along it. */
export function bigCrack(px: Px, pr: Pr, f0: number, l: number, long: number, k: number, fade: number, seed: number, wide = 10): void {
  if (k <= 0) return;
  const glow = Math.max(0, Math.min(1, 1 - fade));
  const n = 46;
  let prev = pr(f0, l, 0);
  for (let i = 1; i <= n * Math.min(1, k); i++) {
    const f = f0 + (i / n) * long;
    const j = (hash(i, 1, seed) - 0.5) * 9 + Math.sin(i * 0.8 + seed) * 4;
    const p = pr(f, l + j, 0);
    const w = Math.max(3, Math.round(wide * (1 - (i / n) * 0.5)));
    line(px, prev, p, '#120a10', w);
    if (glow > 0) line(px, prev, p, hash(i, 2, seed) < glow ? (i % 3 ? FLAME[3] : FLAME[4]) : '#3a1428', Math.max(1, w - 4));
    if (i % 5 === 2) {
      const s = hash(i, 3, seed) < 0.5 ? -1 : 1;
      line(px, p, pr(f + 10, l + j + s * 16, 0), '#120a10', 3);
      line(px, pr(f + 10, l + j + s * 16, 0), pr(f + 16, l + j + s * 26, 0), '#120a10', 2);
    }
    // (slabs of rock heaved up either side as it runs)
    if (i % 3 === 0) {
      const age = k * n - i;
      const up = Math.min(1, age / 2.5) * (12 + 16 * hash(i, 4, seed));
      if (up > 0) {
        for (const side of [-1, 1]) {
          const base = pr(f, l + j + side * (wide * 0.9 + hash(i, 5, seed) * 6), 0);
          const h = up * (0.6 + 0.4 * hash(i, side + 7, seed));
          for (let y = 0; y < h; y++) {
            const ww = Math.max(1, Math.round((1 - y / h) * (5 + hash(i, 6, seed) * 4)));
            for (let x = -ww; x <= ww; x++) put(px, base[0] + x + side * y * 0.25, base[1] - y, x < -ww * 0.3 ? STONEY[3] : x > ww * 0.4 ? STONEY[1] : STONEY[2]);
          }
        }
      }
    }
    prev = p;
  }
}
/** ROCKS flung up high from where a blow landed, tumbling, each with its shadow on the ground, coming down and bouncing: `t` seconds after. */
export function rocks(px: Px, pr: Pr, cf: number, cl: number, t: number, seed: number, n: number, size: number, reach: number): void {
  if (t < 0 || t > 1.6) return;
  for (let i = 0; i < n; i++) {
    const a = hash(i, 1, seed) * Math.PI * 2;
    const v = reach * (0.5 + 0.9 * hash(i, 2, seed));
    const vz = 160 + 220 * hash(i, 3, seed);
    const g = 520;
    const land = (2 * vz) / g;
    let u: number;
    let d: number;
    if (t < land) {
      u = vz * t - 0.5 * g * t * t;
      d = v * t;
    } else {
      // (a bounce, lower, then still)
      const t2 = t - land;
      const vz2 = vz * 0.3;
      u = Math.max(0, vz2 * t2 - 0.5 * g * t2 * t2);
      d = v * land + v * 0.3 * Math.min(t2, (2 * vz2) / g);
    }
    const s = size * (0.6 + 1.1 * hash(i, 4, seed));
    const gp = pr(cf + Math.cos(a) * d, cl + Math.sin(a) * d, 0);
    blob(px, gp[0], gp[1], s * 0.9, s * 0.35, '#0e0a0c', true);
    const p = pr(cf + Math.cos(a) * d, cl + Math.sin(a) * d, u);
    const spin = t * (6 + 10 * hash(i, 5, seed));
    const w = s * (0.7 + 0.3 * Math.abs(Math.cos(spin)));
    blob(px, p[0], p[1] - s * 0.5, w, s * 0.75, STONEY[1]);
    blob(px, p[0] - w * 0.25, p[1] - s * 0.75, w * 0.6, s * 0.4, STONEY[3]);
    put(px, p[0] + w * 0.4, p[1] - s * 0.2, STONEY[0]);
  }
}
/** A CLOUD OF DUST billowing up and out from (cf, cl) to `R`, `k` 0..1 of its life, `n` great puffs. */
export function plume(px: Px, pr: Pr, cf: number, cl: number, k: number, R: number, seed: number, n = 14, big = 18, ramp: readonly string[] = DUSTY): void {
  if (k <= 0 || k >= 1) return;
  for (let i = 0; i < n; i++) {
    const a = hash(i, 1, seed) * Math.PI * 2;
    const d = R * (0.25 + 0.75 * hash(i, 2, seed)) * Math.sqrt(k);
    const p = pr(cf + Math.cos(a) * d, cl + Math.sin(a) * d, 8 + 40 * k * hash(i, 3, seed));
    puff(px, p[0], p[1], big * (0.5 + 0.7 * hash(i, 4, seed)) * (0.4 + 0.8 * k), ramp, Math.max(0, k * 1.3 - 0.3), seed + i * 7);
  }
}
/** A GREAT BURST where a heavy blow lands: a blinding disc and thick rays out across the screen, `k` 0..1. */
export function bigBurst(px: Px, x: number, y: number, k: number, size: number, seed: number): void {
  if (k < 0 || k >= 1) return;
  const r0 = size * (0.35 + 0.65 * k);
  blob(px, x, y, r0 * (1 - k * 0.5), r0 * 0.55 * (1 - k * 0.5), k < 0.35 ? '#fffaf0' : FLAME[4], k > 0.5);
  if (k < 0.6) blob(px, x, y, r0 * 0.55 * (1 - k), r0 * 0.3 * (1 - k), '#ffffff');
  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * Math.PI * 2 + hash(i, 1, seed) * 0.3;
    const L = size * (1.8 + hash(i, 2, seed) * 2.2) * (0.5 + k);
    const a0 = L * k * 0.55;
    const w = k < 0.3 ? 6 : k < 0.6 ? 4 : 2;
    line(px, [x + Math.cos(a) * a0, y + Math.sin(a) * a0 * 0.6], [x + Math.cos(a) * L, y + Math.sin(a) * L * 0.6], i % 2 ? FLAME[3] : '#fffaf0', w);
  }
}
/** RADIAL SPEED LINES out from a point to the screen's edge (a heavy blow: the manga's), `k` 0..1. */
export function radial(px: Px, x: number, y: number, k: number, n: number, from: number, to: number, seed: number, col = '#fffaf0'): void {
  if (k <= 0 || k >= 1) return;
  for (let i = 0; i < n; i++) {
    const a = hash(i, 1, seed) * Math.PI * 2;
    const r0 = from + (to - from) * (0.15 + 0.5 * k) * hash(i, 2, seed);
    const r1 = r0 + (to - from) * (0.25 + 0.35 * hash(i, 3, seed)) * (1 - k * 0.5);
    line(px, [x + Math.cos(a) * r0, y + Math.sin(a) * r0 * 0.7], [x + Math.cos(a) * r1, y + Math.sin(a) * r1 * 0.7], col, i % 3 ? 2 : 3);
  }
}
/** A RING OF FIRE bursting up round (cf, cl) at `R`, `k` 0..1 of its life: tall tongues of the rage's pink and gold, flickering by frame `f`. */
export function fireRing(px: Px, pr: Pr, cf: number, cl: number, R: number, k: number, f: number, n = 18, tall = 90): void {
  if (k <= 0 || k >= 1) return;
  const up = Math.sin(Math.min(1, k * 1.4) * Math.PI * 0.5) * (k > 0.7 ? (1 - k) / 0.3 : 1);
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2 + 0.2;
    const b = pr(cf + Math.cos(a) * R, cl + Math.sin(a) * R, 0);
    const h = tall * (0.55 + 0.45 * hash(i, 1, 9911)) * up * (0.8 + 0.35 * hash(i, f >> 1, 9913));
    for (let y = 0; y < h; y++) {
      const w = Math.max(1, Math.round((1 - y / h) * 9));
      for (let x = -w; x <= w; x++) {
        if (hash(Math.round(b[0] + x), Math.round(b[1] - y) + f, 9915) < (y / h) * 0.6) continue;
        put(px, b[0] + x + Math.sin((y + f * 2) * 0.35) * 2, b[1] - y, y < h * 0.25 ? '#fffaf0' : y < h * 0.5 ? FLAME[4] : y < h * 0.8 ? FLAME[3] : FLAME[2]);
      }
    }
  }
}

/** GOUGES torn in the ground (a claw's), from `a` to `b` round `c` (its own lengths), `n` of them side by side, `k` of the way torn, glowing till `fade`. */
export function gouges(px: Px, pr: Pr, c: V3, a: V3, b: V3, n: number, k: number, fade: number, seed: number): void {
  if (k <= 0) return;
  const glow = Math.max(0, Math.min(1, 1 - fade));
  for (let j = 0; j < n; j++) {
    const off = (j - (n - 1) / 2) * 9;
    const pts = arcPath([c[0], c[1], 0], [a[0] + off * 0.6, a[1] + off, 0], [b[0] - off * 0.4, b[1] + off * 0.5, 0], 22);
    for (let i = 1; i < pts.length; i++) {
      if (i / pts.length > Math.min(1, k)) break;
      const p0 = pr(pts[i - 1][0], pts[i - 1][1], 0);
      const p1 = pr(pts[i][0], pts[i][1], 0);
      const w = Math.max(2, Math.round(7 * Math.sin((i / pts.length) * Math.PI)));
      line(px, p0, p1, '#120a10', w + 2);
      if (glow > 0 && hash(i, j, seed) < glow) line(px, p0, p1, i % 3 ? FLAME[3] : '#fffaf0', Math.max(1, w - 2));
    }
  }
}
/** EYES, pink, burning, in pairs, moving in a cloud round (cf, cl) (its own lengths), `n` pairs, `t` the clock. */
export function eyesIn(px: Px, pr: Pr, cf: number, cl: number, R: number, n: number, t: number, seed: number): void {
  for (let i = 0; i < n; i++) {
    const a = hash(i, 1, seed) * Math.PI * 2 + t * (0.6 + hash(i, 2, seed));
    const d = R * (0.25 + 0.7 * hash(i, 3, seed));
    const blink = Math.sin(t * 3 + i * 1.7) > -0.7;
    if (!blink) continue;
    const c = pr(cf + Math.cos(a) * d, cl + Math.sin(a) * d, 30 + 20 * hash(i, 4, seed));
    for (const dx of [0, 10]) {
      blob(px, c[0] + dx, c[1], 6, 3.5, FLAME[1], true);
      blob(px, c[0] + dx, c[1], 3.5, 2.2, FLAME[2]);
      blob(px, c[0] + dx, c[1], 1.6, 1, FLAME[4]);
    }
  }
}

/** Smooth noise, 0..1, of a point (bilinear between the corners of its cell, eased). */
export function vnoise(x: number, y: number, seed: number): number {
  const x0 = Math.floor(x);
  const y0 = Math.floor(y);
  const fx = x - x0;
  const fy = y - y0;
  const u = fx * fx * (3 - 2 * fx);
  const v = fy * fy * (3 - 2 * fy);
  const a = hash(x0, y0, seed);
  const b = hash(x0 + 1, y0, seed);
  const c = hash(x0, y0 + 1, seed);
  const d = hash(x0 + 1, y0 + 1, seed);
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
}
