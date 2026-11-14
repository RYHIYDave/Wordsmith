// FLOOR 9'S SIDE BOSSES' ATTACKS ON FILM (docs/mockups/f9_side_bosses/pictures/f9_bosses_film.mp4), made outside a browser: the troll
// chieftain's club smash, ground slam, rage war cry and bull rush; the mist wolf's bite, claw sweep, howl, lunge through you and mist
// cloud; each beside the Brawler, on a stand-in of the Pinewood's grass; the blows also at half speed. Captioned. Frames are piped to
// ffmpeg. Nothing of the game imports it.
//   node node_modules/tsx/dist/cli.mjs tools/f9_bosses_film.ts <out.mp4> [stills <dir> <seconds,...> [parts] | count]
import { spawn } from 'node:child_process';
import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { Px } from '../src/engine/px';
import { hash } from '../src/art/kit';
import { FLAME } from '../src/art/mkit';
import { makeHeroArt3 } from '../src/art/heroes3';
import { WOLF_CANVAS, wolfPainted } from '../src/art/fog_wolves';
import { frameAt } from '../src/dev/action_f1_scene';
import { cut, scaled, spriteLaid } from '../src/dev/king_scene';
import type { Sprite } from '../src/engine/px';
import { CLUB_LONG, chiefAt, sculptChief9, sculptWolf9, wolfAt } from '../src/dev/sculpt_f9_bosses';
import type { ChiefPose } from '../src/dev/sculpt_f9_bosses';
import type { Drawn } from '../src/dev/sculpt';
import { CHIEF_MOVES, CLAW_ARC, LUNGE_LONG, RUSH_LONG, WOLF_MOVES, chiefPose, wolfPose } from '../src/dev/f9_bosses_moves';
import type { Beat, ChiefMove, WolfMove } from '../src/dev/f9_bosses_moves';
import type { V3 } from '../src/art/skeleton';
import { png } from './king_png';

(Px.prototype as unknown as { toCanvas: (this: Px) => unknown }).toCanvas = function (this: Px): unknown {
  return this;
};

const W = 1200;
const H = 676;
const FPS = 30;

// THE GROUND: the Pinewood's grass (art/pinewood.ts's greens), in patches, a stand-in
const GRASS = ['#2e3c24', '#40502c', '#536638', '#677a43', '#7c8e4e', '#94a45c'];
function grass(SW: number, SH: number): Px {
  const px = new Px(SW, SH);
  for (let y = 0; y < SH; y++) {
    for (let x = 0; x < SW; x++) {
      // (soft patches of a shade darker, flecks of a shade lighter: a step quieter than the figures)
      const big = Math.sin(x * 0.031 + y * 0.047) + Math.sin(x * 0.017 - y * 0.061 + 1.3);
      const g = hash(x, y, 9103);
      let k = big > 1.1 && g < 0.7 ? 2 : 3;
      if (g > 0.93) k = 4;
      else if (g < 0.05) k = 2;
      px.set(x, y, GRASS[k]);
    }
  }
  return px;
}
/** (AT YOUR PHONE'S OWN SIZE, `phone`: see `part`) */
const PHONE = process.argv[3] === 'phone';
const PW = 1278;
const PH = 590;
const PHONE_GROUND = PHONE ? grass(PW, PH) : null;
const GROUNDS = new Map<number, Px>();
/** The ground for a scene `k` times as big as the film's picture. */
const groundFor = (k: number): Px => {
  let g = GROUNDS.get(k);
  if (!g) {
    const w = Math.ceil(W / k);
    const h = Math.ceil(H / k);
    // (at the phone's size, the scene's ground the very piece of the phone's ground it is laid on, so that no seam shows)
    g = PHONE_GROUND ? cut(PHONE_GROUND, Math.round((PW - w) / 2), Math.round((PH - h) / 2), w, h) : grass(w, h);
    GROUNDS.set(k, g);
  }
  return g;
};

// THE BRAWLER, for size and for a target
const BRAWLER = makeHeroArt3().of('brawler' as never, {} as never) as never;

type Pr = (f: number, l: number, u: number) => readonly number[];

/** A pixel set if it is on the picture. */
const put = (px: Px, x: number, y: number, c: string): void => {
  const X = Math.round(x);
  const Y = Math.round(y);
  if (X >= 0 && Y >= 0 && X < px.w && Y < px.h) px.set(X, Y, c);
};
/** A line of pixels, `w` thick, every pixel `keep(k)` says (0..1 along it). */
function line(px: Px, a: readonly number[], b: readonly number[], c: string, w = 1, keep: (k: number) => boolean = () => true): void {
  const n = Math.max(1, Math.ceil(Math.hypot(b[0] - a[0], b[1] - a[1])));
  for (let i = 0; i <= n; i++) {
    const k = i / n;
    if (!keep(k)) continue;
    const x = a[0] + (b[0] - a[0]) * k;
    const y = a[1] + (b[1] - a[1]) * k;
    for (let dx = 0; dx < w; dx++) for (let dy = 0; dy < w; dy++) put(px, x + dx - (w >> 1), y + dy - (w >> 1), c);
  }
}

// =================================================================================================
// WHAT THEIR BLOWS THROW ABOUT (the enemy's pink and gold, FLAME; the mist's pale)

/** A WARNING RING on the ground where a blow will land: dashed pink, a faint dither inside. */
function warnRing(px: Px, pr: Pr, cf: number, cl: number, r: number, t: number): void {
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
function warnArc(px: Px, pr: Pr, cf: number, cl: number, r0: number, r1: number, a0: number, a1: number, t: number): void {
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
function warnLane(px: Px, pr: Pr, f0: number, f1: number, l: number, half: number, t: number): void {
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
function invGround(pr: Pr, x: number, y: number): [number, number] {
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
function shock(px: Px, pr: Pr, cf: number, cl: number, R: number, k: number): void {
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
const DUST = ['#4a4034', '#6a5c48', '#8a7a60', '#a89878'];
/** DUST thrown up where something struck the ground, billowing out and settling, `k` 0..1. */
function dust(px: Px, pr: Pr, cf: number, cl: number, k: number, seed: number, n = 10, R = 26): void {
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
const ROCK = ['#2e2c2a', '#4a4844', '#6a6862', '#8c8a82'];
/** CHIPS OF EARTH AND STONE flung up from where a blow landed, falling back, `t` seconds after. */
function chips(px: Px, pr: Pr, cf: number, cl: number, t: number, seed: number, n = 12): void {
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
function crack(px: Px, pr: Pr, f0: number, l: number, long: number, k: number, fade: number, seed: number): void {
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
function arcs(px: Px, x: number, y: number, k: number, dir: number, spread: number, n: number, ramp: readonly string[]): void {
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
function slash(px: Px, x: number, y: number, r: number, a0: number, a1: number, k: number, ramp: readonly string[], w = 3): void {
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
function hit(px: Px, x: number, y: number, k: number): void {
  if (k <= 0 || k >= 1) return;
  const r = 4 + 10 * k;
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2 + 0.3;
    line(px, [x + Math.cos(a) * r * 0.3, y + Math.sin(a) * r * 0.3], [x + Math.cos(a) * r * (i % 2 ? 0.6 : 1), y + Math.sin(a) * r * (i % 2 ? 0.6 : 1)], k < 0.5 ? FLAME[4] : FLAME[3]);
  }
}
/** THE RAGE ON HIM: pink and gold flames licking up off his outline, flickering (`f` the frame). */
function rage(px: Px, body: Px, f: number, amt: number): void {
  if (amt <= 0) return;
  const a = (x: number, y: number): boolean => x >= 0 && y >= 0 && x < body.w && y < body.h && body.d[(y * body.w + x) * 4 + 3] > 0;
  for (let y = 1; y < body.h - 1; y++) {
    for (let x = 1; x < body.w - 1; x++) {
      if (!a(x, y) || a(x, y - 1)) continue;
      if (hash(x, y + Math.floor(f / 2) * 7, 9401) > amt * 0.9) continue;
      const tall = 3 + Math.floor(hash(x, Math.floor(f / 2), 9403) * 8);
      for (let k = 1; k <= tall; k++) {
        if (a(x, y - k)) break;
        put(px, x + Math.round(Math.sin((y - k + f) * 0.7) * 0.6), y - k, k < tall * 0.4 ? FLAME[3] : k < tall * 0.8 ? FLAME[2] : FLAME[1]);
      }
    }
  }
  // (a glow of it all round him: a dither of pink just outside his outline)
  for (let y = 2; y < body.h - 2; y++) {
    for (let x = 2; x < body.w - 2; x++) {
      if (a(x, y) || (x + y + f) % 2) continue;
      if (a(x - 2, y) || a(x + 2, y) || a(x, y - 2) || a(x, y + 2)) if (hash(x, y, 9405 + (f >> 2)) < amt * 0.8) put(px, x, y, FLAME[1]);
    }
  }
}
const MIST = ['#4a4664', '#6c688a', '#9692b2', '#c6c2da', '#eeecf8'];
/** THE MIST CLOUD: billowing out round (cf, cl) to `R`, `k` 0..1 as it grows, thick; churning by `t`; pink glints in it where it hurts. */
function mistCloud(px: Px, pr: Pr, cf: number, cl: number, R: number, k: number, t: number, thin: number): void {
  if (k <= 0) return;
  const c = pr(cf, cl, 18);
  const e = pr(cf + R * k, cl, 18);
  const rx = Math.abs(e[0] - c[0]) * 1.3 + 4;
  const ry = rx * 0.62;
  for (let y = Math.floor(c[1] - ry * 1.4); y < c[1] + ry; y++) {
    for (let x = Math.floor(c[0] - rx); x < c[0] + rx; x++) {
      const q = Math.hypot((x - c[0]) / rx, (y - c[1]) / ry);
      // (soft billows: slow waves through it, drifting, not cells)
      const swirl = 0.5 + 0.25 * Math.sin(x * 0.11 + Math.sin(y * 0.07 + t * 1.3) * 2.2 + t * 0.9) + 0.25 * Math.sin(y * 0.16 - x * 0.05 + Math.cos(x * 0.09 - t) * 1.8 - t * 1.1);
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
/** A FIGURE laid down on the picture at its anchor, every `keep`-th pixel of it (a fade in). */
function lay(px: Px, fig: Px, ax: number, ay: number, x: number, y: number, keep = 1): void {
  for (let j = 0; j < fig.h; j++) {
    for (let i = 0; i < fig.w; i++) {
      const c = fig.get(i, j);
      if (!c) continue;
      if (keep < 1 && hash(i, j, 9601) > keep) continue;
      put(px, x - ax + i, y - ay + j, c);
    }
  }
}

// =================================================================================================
// THE RULES' OWN: the freeze where a heavy blow lands, the screen's kick, the blow smeared with after-images, the one struck rocked

/** The move's own time at the film's `t`: held still through each blow's freeze (Movement 7). */
function clockOf(beats: readonly Beat[], t: number): number {
  let m = t;
  for (const b of beats) {
    if (m <= b.at) break;
    if (m < b.at + b.freeze) return b.at;
    m -= b.freeze;
  }
  return m;
}
/** The film's own time at which a beat lands (later by every freeze before it). */
function beatFilm(beats: readonly Beat[], i: number): number {
  let t = beats[i].at;
  for (let j = 0; j < i; j++) t += beats[j].freeze;
  return t;
}
/** How far the screen is kicked at the film's `t` (Animations: the screen kicks on big hits), and for the war cry's roar, a long rumble. */
function kickOf(beats: readonly Beat[], t: number, f: number): [number, number] {
  let a = 0;
  beats.forEach((b, i) => {
    const s = t - beatFilm(beats, i);
    if (s >= 0 && s < b.ring) a = Math.max(a, b.shake * (1 - s / b.ring) ** 1.5);
  });
  return [Math.round((hash(f, 1, 1401) - 0.5) * 2 * a), Math.round((hash(f, 2, 1401) - 0.5) * 2 * a)];
}
/** A frame kicked by (dx, dy): what runs off one side comes in from the ground's colour. */
function kicked(p: Px, d: [number, number]): Px {
  if (!d[0] && !d[1]) return p;
  const out = new Px(p.w, p.h);
  for (let y = 0; y < p.h; y++) {
    const sy = Math.min(p.h - 1, Math.max(0, y - d[1]));
    for (let x = 0; x < p.w; x++) {
      const sx = Math.min(p.w - 1, Math.max(0, x - d[0]));
      const i = (sy * p.w + sx) * 4;
      out.d.set(p.d.subarray(i, i + 4), (y * p.w + x) * 4);
    }
  }
  return out;
}
/** AN AFTER-IMAGE of a figure: every other pixel of it, in `ramp`'s pale and its colour, `k` (0..1) of it left. */
function ghost(px: Px, fig: Px, ramp: readonly string[], k: number, seed: number): void {
  const a = (x: number, y: number): boolean => x >= 0 && y >= 0 && x < fig.w && y < fig.h && fig.d[(y * fig.w + x) * 4 + 3] > 0;
  for (let y = 0; y < fig.h; y++) {
    for (let x = 0; x < fig.w; x++) {
      if (!a(x, y)) continue;
      // (a checker of it, thinning as it fades: the body a step darker, its outline its colour)
      if ((x + y) % 2) continue;
      if (hash(x >> 2, y >> 2, seed) > k * 1.1) continue;
      const edge = !a(x - 2, y) || !a(x + 2, y) || !a(x, y - 2) || !a(x, y + 2);
      put(px, x, y, edge ? ramp[ramp.length - 3] : ramp[Math.max(0, ramp.length - 4)]);
    }
  }
}
/** A SMEAR along a path (picture points, oldest first): thick at its head, thinning to its tail; white at its heart, then `ramp`. */
function smear(px: Px, path: readonly (readonly number[])[], w: number, ramp: readonly string[], k = 1, inner?: readonly (readonly number[])[]): void {
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
function arcPath(c: V3, a: V3, b: V3, n: number): V3[] {
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
function speedLines(px: Px, x: number, y: number, vx: number, vy: number, n: number, spread: number, seed: number, col: string): void {
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
function burst(px: Px, x: number, y: number, k: number, size: number, seed: number): void {
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
function embers(px: Px, x: number, y: number, w: number, h: number, t: number, n: number, seed: number): void {
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
function flamePillars(px: Px, pr: Pr, cf: number, cl: number, r: number, k: number, f: number): void {
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
function spike(px: Px, x: number, y: number, tall: number, up: number, lean: number): void {
  const h = tall * up;
  for (let j = 0; j < h; j++) {
    const w = Math.max(1, Math.round((1 - j / tall) * tall * 0.28));
    for (let i = -w; i <= w; i++) put(px, x + i + lean * j * 0.15, y - j, i < -w * 0.3 ? ROCK[3] : i > w * 0.4 ? ROCK[1] : ROCK[2]);
  }
  line(px, [x - tall * 0.3, y], [x + tall * 0.3, y], ROCK[0], 2);
}

/** Someone struck: when (the move's own time) and which way he is thrown (picture), and how far. */
interface Struck {
  at: number;
  dx: number;
  dy: number;
  far: number;
}
/** The Brawler's own reel (his clips are kept by name, not under `moves`), `s` seconds in. */
function reelAt(look: 'front' | 'back', s: number): { px: Px; ax: number; ay: number } {
  const c = ((BRAWLER as unknown as Record<string, { clips: Record<string, { frames: Sprite[]; fps: number }> }>)[look]).clips.reel;
  return spriteLaid(c.frames[Math.max(0, Math.min(c.frames.length - 1, Math.round(s * c.fps)))]);
}
/** THE BRAWLER, struck or not (Hits 3: a struck figure flashes and is knocked back; a heavy blow rocks it): his picture and where he is. */
function brawlerAt(view: 'front' | 'back', t: number, m: number, hits: readonly Struck[], x: number, y: number): { px: Px; ax: number; ay: number; x: number; y: number } {
  let h: Struck | null = null;
  for (const q of hits) if (m >= q.at) h = q;
  const look = view === 'front' ? 'back' : 'front';
  if (!h || m - h.at > 1.2) return { ...frameAt(BRAWLER, look, 'stand', t), x, y };
  const s = m - h.at;
  const thrown = h.far * (1 - (1 - Math.min(1, s / 0.3)) ** 3);
  const l = s < 0.5 ? reelAt(look, s) : frameAt(BRAWLER, look, 'stand', t);
  let px = l.px;
  if (s < 0.08) {
    // (the flash: white, then the enemy's pink)
    px = l.px.clone();
    for (let i = 0; i < px.w * px.h; i++) if (px.d[i * 4 + 3]) px.set(i % px.w, Math.floor(i / px.w), s < 0.04 ? '#ffffff' : FLAME[3]);
  }
  return { px, ax: l.ax, ay: l.ay, x: x + h.dx * thrown, y: y + h.dy * thrown };
}

/** The chieftain's club's head at a pose (his own lengths). */
const clubHead = (p: ChiefPose): V3 => {
  const a = p.fistR;
  const b = p.clubEnd;
  const d = [b[0] - a[0], b[1] - a[1], b[2] - a[2]];
  const n = Math.hypot(d[0], d[1], d[2]) || 1;
  const L = CLUB_LONG * 0.95;
  return [a[0] + p.hip[0] + (d[0] / n) * L, a[1] + p.hip[1] + (d[1] / n) * L, a[2] + p.hip[2] + (d[2] / n) * L];
};

// =================================================================================================
// THE SCENES

type View = 'front' | 'back';
interface Part {
  long: number;
  title: string;
  line: string;
  frame: (t: number) => Px;
}
type Scene = ((t: number) => Px) & { k: number; long: number };

/** A chieftain scene: `move` seen `view` at `yaw`, his floor point at (bx, by), the Brawler `tf` ahead of him and `tl` to his left. */
function chiefFilm(move: ChiefMove, view: View, yaw: number, bx: number, by: number, tf: number, tl: number, k = 2): Scene {
  const size = { w: Math.ceil(W / k), h: Math.ceil(H / k), ax: bx, ay: by };
  const GROUND = groundFor(k);
  const M = CHIEF_MOVES[move];
  const long = M.long + M.beats.reduce((s, b) => s + b.freeze, 0);
  const f = (t: number): Px => {
    const m = clockOf(M.beats, t);
    const fr = Math.floor(t * 30);
    const pose = chiefPose(move, m);
    const d: Drawn = sculptChief9(view, pose, yaw, size);
    const pr: Pr = (ff, l, u) => chiefAt(d, yaw, [ff, l, u]);
    const tg = pr(tf, tl, 0);
    const hip = pr(pose.hip[0], pose.hip[1], 0);
    const beat = M.beats[0];
    const since = m - beat.at;
    const sinceF = t - beatFilm(M.beats, 0);
    const impact: V3 = move === 'smash' ? clubHead(chiefPose('smash', beat.at)) : move === 'slam' ? clubHead(chiefPose('slam', beat.at)) : [0, 0, 0];
    // (who is struck, and which way he is thrown: away from the blow)
    const away = (fromF: number, fromL: number, far: number): Struck => {
      const a = pr(fromF, fromL, 0);
      const dx = tg[0] - a[0];
      const dy = tg[1] - a[1];
      const n = Math.hypot(dx, dy) || 1;
      return { at: beat.at, dx: dx / n, dy: dy / n, far };
    };
    const hits: Struck[] = move === 'smash' ? [away(impact[0], impact[1], 22)] : move === 'rush' ? [away(pose.hip[0] - 40, 0, 46)] : move === 'warcry' ? [away(0, 0, 14)] : [];
    // (the slam's crack reaches him a little after it lands)
    const crackAt = 0.3 * Math.min(1, Math.max(0, (tf - impact[0]) / 132));
    if (move === 'slam') hits.push({ ...away(impact[0], impact[1], 30), at: beat.at + crackAt });
    const p = GROUND.clone();
    // ON THE GROUND
    if (move === 'smash') {
      if (m > 0.5 && since < 0) warnRing(p, pr, impact[0], impact[1], 34, t);
      if (since >= 0) for (let i = 0; i < 7; i++) {
        const a = (i / 7) * Math.PI * 2 + 0.4;
        crackRay(p, pr, impact[0], impact[1], a, 26 + 26 * hash(i, 1, 77), Math.min(1, sinceF / 0.12), (since - 0.6) / 1.0, 77 + i);
      }
      shock(p, pr, impact[0], impact[1], 70, sinceF / 0.45);
      shock(p, pr, impact[0], impact[1], 44, (sinceF - 0.08) / 0.4);
    }
    if (move === 'slam') {
      if (m > 0.45 && since < 0) warnLane(p, pr, impact[0] - 8, impact[0] + 126, impact[1], 13, t);
      if (since >= 0) crack(p, pr, impact[0] - 8, impact[1], 132, Math.min(1, sinceF / 0.3), (since - 0.7) / 0.9, 81);
      shock(p, pr, impact[0], impact[1], 46, sinceF / 0.4);
    }
    if (move === 'warcry') shock(p, pr, 0, 0, 130, sinceF / 0.6);
    if (move === 'rush' && m > 0.3 && m < 1.15) warnLane(p, pr, 10, RUSH_LONG + 20, 0, 24, t);
    // (the rage's after-images, his ghosts under him while he strikes)
    const strike = M.strikes.find(([a, b]) => m >= a && m <= b + 0.1);
    if (strike) {
      const [a, b] = strike;
      const n = move === 'rush' ? 5 : 2;
      for (let i = n; i >= 1; i--) {
        const q = Math.max(a - 0.05, Math.min(m, b) - (i * (b - a)) / n);
        const gd = sculptChief9(view, chiefPose(move, q), yaw, size);
        ghost(p, gd.px, FLAME, (1 - i / (n + 1)) * (m > b ? 1 - (m - b) / 0.1 : 1), 9800 + i);
      }
    }
    // THE TWO OF THEM, the farther first
    const hero = brawlerAt(view, t, m, hits, tg[0], tg[1]);
    const heroFirst = hero.y < hip[1];
    const layHero = (): void => lay(p, hero.px, hero.ax, hero.ay, hero.x, hero.y);
    if (heroFirst) layHero();
    lay(p, d.px, 0, 0, 0, 0);
    if (!heroFirst) layHero();
    // OVER THEM
    // (the club's smear, from where the strike began to where it is)
    if (strike && (move === 'smash' || move === 'slam' || move === 'warcry')) {
      const [a, b] = strike;
      const p0 = chiefPose(move, a);
      const p1 = chiefPose(move, Math.min(m, b));
      const piv: V3 = [p1.hip[0], p1.hip[1] - 12, p1.hip[2] + 76];
      const outer = arcPath(piv, clubHead(p0), clubHead(p1), 14).map((q) => pr(q[0], q[1], q[2]));
      const mid = (q: ChiefPose): V3 => {
        const h = clubHead(q);
        const f0 = [q.fistR[0] + q.hip[0], q.fistR[1] + q.hip[1], q.fistR[2] + q.hip[2]];
        return [(h[0] + f0[0]) / 2, (h[1] + f0[1]) / 2, (h[2] + f0[2]) / 2];
      };
      const inner = arcPath(piv, mid(p0), mid(p1), 14).map((q) => pr(q[0], q[1], q[2]));
      smear(p, outer, 22, FLAME, m > b ? 1 - (m - b) / 0.1 : 1, inner);
    }
    if (move === 'smash' || move === 'slam') {
      const c = pr(impact[0], impact[1], 4);
      burst(p, c[0], c[1], sinceF / 0.22, 26, 9707);
      dust(p, pr, impact[0], impact[1], since / 1.0, 9701, 16, 60);
      chips(p, pr, impact[0], impact[1], since, 9703, 26);
      if (since >= 0 && since < 1.4) embers(p, c[0], c[1], 40, 60, since, 14, 9709);
      if (move === 'slam') {
        // (the rock thrust up along the crack as it runs, each with its own burst of stone and dust)
        for (let i = 1; i <= 5; i++) {
          const ff = impact[0] + i * 24;
          const when = (i * 24) / 132 * 0.3;
          const s2 = since - when;
          if (s2 < 0) continue;
          const b2 = pr(ff, impact[1] + (hash(i, 1, 9711) - 0.5) * 10, 0);
          spike(p, b2[0], b2[1], 18 + 14 * hash(i, 2, 9711), Math.min(1, s2 / 0.06) * (s2 > 1.1 ? Math.max(0, 1 - (s2 - 1.1) / 0.4) : 1), hash(i, 3, 9711) - 0.5);
          chips(p, pr, ff, impact[1], s2, 9713 + i, 8);
          dust(p, pr, ff, impact[1], s2 / 0.8, 9715 + i, 6, 22);
        }
      }
    }
    if (move === 'warcry') {
      // (gathering: embers drawn in to him; the roar: arcs, the burst, the fire bursting up round him, the rage on him after)
      const head = pr(pose.hip[0] + 30, 0, 118);
      const feet = pr(pose.hip[0], 0, 0);
      if (m > 0.3 && m < 0.97) for (let i = 0; i < 18; i++) {
        const ph = ((m - 0.3) * 1.6 + hash(i, 1, 9921)) % 1;
        const a = hash(i, 2, 9921) * Math.PI * 2;
        const r = 80 * (1 - ph);
        put(p, feet[0] + Math.cos(a) * r, feet[1] - 50 + Math.sin(a) * r * 0.6, ph > 0.6 ? FLAME[4] : FLAME[2]);
      }
      burst(p, head[0], head[1], sinceF / 0.25, 30, 9923);
      if (since > 0 && since < 0.95) arcs(p, head[0], head[1], since / 0.95, -Math.PI / 2, 1.5, 4, FLAME);
      if (since > 0.6 && since < 1.6) arcs(p, head[0], head[1], (since - 0.6) / 1.0, -Math.PI / 2, 1.5, 3, FLAME);
      flamePillars(p, pr, pose.hip[0], 0, 30, since / 1.1, fr);
      if (since > 0) {
        rage(p, d.px, fr, Math.min(1, since / 0.2));
        embers(p, feet[0], feet[1], 70, 150, m, 26, 9925);
      }
      dust(p, pr, 0, 0, since / 0.8, 9927, 18, 120);
      for (const [ts, s] of [[2.3, -1], [2.4, 1], [2.5, -1], [2.6, 1]] as const) dust(p, pr, pose.hip[0] + 12, s * 18, (m - ts) / 0.45, Math.round(9931 + ts * 10), 6, 16);
      if (m > 2.2 && m < 2.7) speedLines(p, hip[0], hip[1] - 60, tg[0] - hip[0], tg[1] - hip[1], 10, 40, 9933 + fr, FLAME[2]);
    }
    if (move === 'rush') {
      for (const ts of [0.52, 0.76]) {
        dust(p, pr, 0, -18, (m - ts) / 0.6, Math.round(9941 + ts * 100), 8, 18);
        chips(p, pr, 0, -18, m - ts, Math.round(9943 + ts * 100), 6);
      }
      // (breath steaming off his snout as he paws)
      if (m > 0.3 && m < 1.15) {
        const sn = pr(pose.hip[0] + 40, 0, 72);
        for (let i = 0; i < 8; i++) {
          const ph = (m * 2 + hash(i, 1, 9945)) % 1;
          put(p, sn[0] + ph * 14 + (hash(i, 2, 9945) - 0.5) * 6, sn[1] - ph * 8, ph < 0.5 ? '#d8d4e0' : '#9a96a8');
        }
      }
      if (m > 1.15 && m < 1.5) {
        speedLines(p, hip[0], hip[1] - 50, tg[0] - pr(0, 0, 0)[0], tg[1] - pr(0, 0, 0)[1], 16, 50, 9947 + fr, '#d8d0c0');
        for (let i = 0; i < 6; i++) dust(p, pr, pose.hip[0] - 20 - i * 18, (hash(i, 1, 9949) - 0.5) * 24, 0.2 + i * 0.1, 9951 + i + fr, 3, 10);
      }
      const hc = pr(RUSH_LONG - 10, 0, 50);
      burst(p, hc[0], hc[1], sinceF / 0.22, 30, 9953);
      dust(p, pr, RUSH_LONG + 24, 0, since / 0.8, 9955, 16, 40);
      chips(p, pr, RUSH_LONG + 24, 0, since, 9957, 16);
    }
    return kicked(p, kickOf(M.beats, t, fr));
  };
  return Object.assign(f, { k, long });
}

/** A crack run straight out from (cf, cl) at angle `a` (on the ground), `len` long, `k` of it shown, its glow fading after `fade`. */
function crackRay(px: Px, pr: Pr, cf: number, cl: number, a: number, len: number, k: number, fade: number, seed: number): void {
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

/** A mist wolf scene: `move` seen `view` at `yaw`, its floor point at (bx, by), the Brawler `tf` ahead and `tl` to its left. */
function wolfFilm(move: WolfMove, view: View, yaw: number, bx: number, by: number, tf: number, tl: number, k = 3): Scene {
  const size = { w: Math.ceil(W / k), h: Math.ceil(H / k), ax: bx, ay: by };
  const GROUND = groundFor(k);
  const FOGS: [number, number][] = [[50, 80], [0, -80]];
  const M = WOLF_MOVES[move];
  const long = M.long + M.beats.reduce((s, b) => s + b.freeze, 0);
  const f = (t: number): Px => {
    const m = clockOf(M.beats, t);
    const fr = Math.floor(t * 30);
    const pose = wolfPose(move, m);
    const d: Drawn = sculptWolf9(view, pose, yaw, size);
    const pr: Pr = (ff, l, u) => wolfAt(d, yaw, [ff, l, u]);
    const tg = pr(tf, tl, 0);
    const root = pr(pose.root[0], pose.root[1], 0);
    const beat = M.beats[0];
    const since = m - beat.at;
    const sinceF = t - beatFilm(M.beats, 0);
    const away = (fromF: number, fromL: number, far: number, at = beat.at): Struck => {
      const a = pr(fromF, fromL, 0);
      const dx = tg[0] - a[0];
      const dy = tg[1] - a[1];
      const n = Math.hypot(dx, dy) || 1;
      return { at, dx: dx / n, dy: dy / n, far };
    };
    const hits: Struck[] =
      move === 'bite' ? [away(0, 0, 14)] : move === 'claw' ? [{ ...away(0, 0, 22), dx: 0.55, dy: -0.85 }] : move === 'lunge' ? [away(0, 0, 20)] : move === 'cloud' ? [0.95, 1.35, 1.75, 2.15].map((q) => away(0, 0, 6, q)) : [];
    const p = GROUND.clone();
    if (move === 'lunge' && m > 0.35 && m < 0.72) warnLane(p, pr, 20, LUNGE_LONG + 30, 0, 16, t);
    if (move === 'bite' && m > 0.25 && since < 0) warnRing(p, pr, 74, 0, 20, t);
    if (move === 'claw' && m > 0.3 && since < 0) warnArc(p, pr, 22, 0, 30, 78, -1.1, 1.2, t);
    // (the ground scored by its three claws along the sweep, glowing, fading)
    if (move === 'claw' && since >= 0) {
      for (let c = 0; c < 3; c++) {
        const pts = arcPath([CLAW_ARC.about[0], CLAW_ARC.about[1], 0], [CLAW_ARC.from[0] + 20, CLAW_ARC.from[1] + c * 6, 0], [CLAW_ARC.to[0] + 6 - c * 4, CLAW_ARC.to[1] + c * 3, 0], 16);
        for (let i = 1; i < pts.length; i++) {
          if (i / pts.length > Math.min(1, sinceF / 0.06)) break;
          const a = pr(pts[i - 1][0], pts[i - 1][1], 0);
          const b2 = pr(pts[i][0], pts[i][1], 0);
          line(p, a, b2, '#1e1820', 2);
          if (since < 1.0 && hash(i, c, 9871) > since) line(p, a, b2, FLAME[2], 1);
        }
      }
    }
    if (move === 'cloud' && m > 0.3 && since < 0) warnRing(p, pr, 20, 0, 100, t);
    // (after-images of it while it strikes)
    const strike = M.strikes.find(([a, b]) => m >= a && m <= b + 0.1);
    if (strike && move !== 'howl' && move !== 'cloud') {
      const [a, b] = strike;
      for (let i = 4; i >= 1; i--) {
        const q = Math.max(a - 0.04, Math.min(m, b) - (i * (b - a)) / 4);
        const gd = sculptWolf9(view, { ...wolfPose(move, q), ghost: 0 }, yaw, size);
        ghost(p, gd.px, MIST, (1 - i / 5) * (m > b ? 1 - (m - b) / 0.1 : 1), 9810 + i);
      }
    }
    // (the fog wolves it calls, bursting out of mist either side of it)
    const fogs: { px: Px; ax: number; ay: number; x: number; y: number; keep: number }[] = [];
    if (move === 'howl') {
      FOGS.forEach(([ff, ll], i) => {
        const when = 1.2 + i * 0.25;
        mistCloud(p, pr, ff, ll, 34, Math.min(1, Math.max(0, (m - 0.95 - i * 0.2) / 0.3)), m, Math.max(0, (m - when - 0.6) / 0.6));
        if (m > when) {
          const fp = wolfPainted('stand', m + i * 0.3, 'front');
          const at = pr(ff, ll, 0);
          fogs.push({ px: fp.px, ax: WOLF_CANVAS.ax, ay: WOLF_CANVAS.ay, x: at[0], y: at[1], keep: Math.min(1, (m - when) / 0.25) });
        }
      });
    }
    // (the mist cloud, under the Brawler: he stays in sight in it, Animations 4)
    if (move === 'cloud') {
      const g = since < 0 ? 0 : Math.min(1, sinceF / 0.18);
      const thin = m < 2.5 ? 0 : (m - 2.5) / 0.7;
      mistCloud(p, pr, pose.root[0] + 20, 0, 120, g, m, thin * 1.2);
    }
    const hero = brawlerAt(view, t, m, hits, tg[0], tg[1]);
    const items = [{ kind: 'hero', y: hero.y }, { kind: 'wolf', y: root[1] }, ...fogs.map((q, i) => ({ kind: `fog${i}`, y: q.y }))].sort((a, b) => a.y - b.y);
    for (const it of items) {
      if (it.kind === 'hero') lay(p, hero.px, hero.ax, hero.ay, hero.x, hero.y);
      else if (it.kind === 'wolf') lay(p, d.px, 0, 0, 0, 0);
      else {
        const q = fogs[Number(it.kind.slice(3))];
        lay(p, q.px, q.ax, q.ay, q.x, q.y, q.keep);
      }
    }
    // OVER THEM
    const muzzle = pr(pose.root[0] + 72, 0, 74 + pose.root[2]);
    const hitAt = pr(tf, tl, 30);
    if (move === 'bite') {
      // (the jaws' crescents closing on you, huge; mist sprayed off the bite)
      if (m > 0.58) {
        slash(p, hitAt[0] - 4, hitAt[1] + 4, 22, -2.6, -0.4, (m - 0.58) / 0.2, [MIST[2], FLAME[2], '#fffaf0'], 4);
        slash(p, hitAt[0] - 4, hitAt[1] - 2, 22, 2.6, 0.4, (m - 0.6) / 0.2, [MIST[2], FLAME[2], '#fffaf0'], 4);
      }
      burst(p, hitAt[0], hitAt[1], sinceF / 0.18, 16, 9961);
      mistBurst(p, pr, -15, 0, (m - 0.55) / 0.5, 9963);
      mistBurst(p, pr, tf, tl, since / 0.5, 9965);
      if (strike) speedLines(p, muzzle[0], muzzle[1], 1, 0.55, 12, 20, 9967 + fr, MIST[4]);
    }
    if (move === 'claw') {
      // (three great claw crescents along the whole sweep, from where the paw was cocked to where it struck, white at the heart, edged
      // with its pink, the mist sprayed off them; they hang a moment and fade)
      const [s0, s1] = M.strikes[0];
      if (m >= s0 && since < 0.25) {
        // (three long claw marks swept down across you, round from above its shoulder, past you: white at the heart, its pink at the edge)
        const sp = pr(CLAW_ARC.about[0], CLAW_ARC.about[1], CLAW_ARC.about[2]);
        const dx = hitAt[0] - sp[0];
        const dy = hitAt[1] - sp[1];
        const r = Math.hypot(dx, dy);
        const ah = Math.atan2(dy, dx);
        const k = since < 0 ? (m - s0) / (s1 - s0) * 0.5 : 0.5 + since / 0.5;
        for (let c = -1; c <= 1; c++) slash(p, sp[0], sp[1], r + c * 7, ah - 1.7, ah + 1.0, k, [MIST[2], FLAME[2], '#fffaf0'], 6);
      }
      burst(p, hitAt[0], hitAt[1], sinceF / 0.2, 22, 9971);
      mistBurst(p, pr, tf, tl, since / 0.5, 9973);
      mistBurst(p, pr, CLAW_ARC.to[0], CLAW_ARC.to[1], since / 0.6, 9977);
      // (the mist streaming up off it while it rears)
      if (m > 0.2 && m < 0.62) embersMist(p, root[0] + 10, root[1] - 40, 70, 110, m, 26, 9975);
      if (m >= s0 && m <= s1 + 0.05) speedLines(p, hitAt[0], hitAt[1], -1, 0.3, 16, 30, 9979 + fr, MIST[4]);
    }
    if (move === 'howl') {
      const head = pr(pose.root[0] + 40, 0, 112);
      if (m > 0.88 && m < 2.4) {
        arcs(p, head[0], head[1], ((m - 0.88) % 0.5) / 0.5, -Math.PI / 2 - 0.25, 1.4, 3, [MIST[2], MIST[3], MIST[4]]);
        arcs(p, head[0], head[1], ((m - 0.63) % 0.5) / 0.5, -Math.PI / 2 - 0.25, 1.4, 3, [MIST[2], MIST[3], FLAME[2]]);
      }
      burst(p, head[0], head[1], sinceF / 0.2, 14, 9981);
      FOGS.forEach(([ff, ll], i) => mistBurst(p, pr, ff, ll, (m - 1.2 - i * 0.25) / 0.6, 9983 + i));
      if (m > 0.9 && m < 2.3) embersMist(p, root[0], root[1], 120, 40, m, 20, 9985);
    }
    if (move === 'lunge') {
      // (gathering: mist drawn into it; the streak of mist where it went; you, struck as it passes through)
      if (m > 0.35 && m < 0.7) for (let i = 0; i < 20; i++) {
        const ph = ((m - 0.35) * 2.2 + hash(i, 1, 9991)) % 1;
        const a = hash(i, 2, 9991) * Math.PI * 2;
        const r = 60 * (1 - ph);
        put(p, root[0] + Math.cos(a) * r, root[1] - 26 + Math.sin(a) * r * 0.6, ph > 0.6 ? MIST[4] : MIST[3]);
      }
      if (m > 0.7) {
        const reach = Math.min(LUNGE_LONG, pose.root[0]);
        for (let i = 0; i < 14; i++) {
          const ff = reach - i * 13;
          if (ff < -16) break;
          mistCloud(p, pr, ff, (hash(i, 1, 9993) - 0.5) * 10, 12, 1, m + i, Math.min(1.4, Math.max(0, (m - 0.84) * 1.6) + i * 0.05));
        }
      }
      if (strike) speedLines(p, root[0], root[1] - 30, 1, 0.55, 18, 26, 9995 + fr, MIST[4]);
      burst(p, hitAt[0], hitAt[1], sinceF / 0.2, 18, 9997);
      mistBurst(p, pr, LUNGE_LONG, 0, (m - 0.84) / 0.6, 9999);
    }
    if (move === 'cloud') {
      // (drawing the mist in; the blast of it outward; its claws in it at you; its eyes moving in it)
      if (m > 0.2 && m < 0.66) for (let i = 0; i < 24; i++) {
        const ph = ((m - 0.2) * 2.4 + hash(i, 1, 9801)) % 1;
        const a = hash(i, 2, 9801) * Math.PI * 2;
        const r = 90 * (1 - ph);
        put(p, muzzle[0] + Math.cos(a) * r, muzzle[1] + Math.sin(a) * r * 0.6, ph > 0.6 ? MIST[4] : MIST[3]);
      }
      mistRing(p, pr, pose.root[0] + 20, 0, 150, sinceF / 0.35);
      burst(p, muzzle[0], muzzle[1], sinceF / 0.18, 14, 9803);
      for (const q of [0.95, 1.35, 1.75, 2.15]) {
        slash(p, hitAt[0] - 2, hitAt[1] - 4, 18, q * 3 % 6.28, q * 3 % 6.28 + 2.2, (m - q + 0.06) / 0.25, [MIST[2], FLAME[2], '#fffaf0'], 3);
        burst(p, hitAt[0], hitAt[1], (m - q) / 0.12, 8, 9805);
      }
      if (since > 0 && m < 2.6) {
        const a = m * 2.2;
        const c = pr(pose.root[0] + 20 + Math.cos(a) * 50, Math.sin(a) * 50, 50);
        put(p, c[0], c[1], FLAME[4]);
        put(p, c[0] + 4, c[1] - 1, FLAME[4]);
        put(p, c[0] + 1, c[1], FLAME[2]);
        put(p, c[0] + 5, c[1] - 1, FLAME[2]);
      }
    }
    return kicked(p, kickOf(M.beats, t, fr));
  };
  return Object.assign(f, { k, long });
}

/** MIST BURSTING out of a point on the ground, `k` 0..1 of its life: a puff thrown up and out, thinning. */
function mistBurst(px: Px, pr: Pr, cf: number, cl: number, k: number, seed: number): void {
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
function mistRing(px: Px, pr: Pr, cf: number, cl: number, R: number, k: number): void {
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
function embersMist(px: Px, x: number, y: number, w: number, h: number, t: number, n: number, seed: number): void {
  for (let i = 0; i < n; i++) {
    const ph = (t * (0.6 + hash(i, 1, seed) * 0.8) + hash(i, 2, seed)) % 1;
    put(px, x + (hash(i, 3, seed) - 0.5) * w + Math.sin(t * 3 + i) * 3, y - ph * h, ph < 0.5 ? MIST[4] : MIST[3]);
  }
}

/**
 * AT YOUR PHONE'S OWN SIZE (`phone`): his question, 13 Nov 2026, 23:50: “Most of the guardian stuff is bad but from the phone screen it’s
 * probably okay??”. The game shows 639 game pixels across a phone 852 points wide (his: tools/scenarios/f9_lairs.mjs's canvas, 1662
 * picture pixels across at 1.3 times as wide), so 1278 picture pixels; a film that many pixels across, played across his phone held
 * sideways, shows them as big as the game does: each scene laid in its middle a pixel to a pixel, the grass round it.
 */
/** A part: `long` seconds of a scene, played from `from`, `slow` times slower. */
function part(scene: Scene, title: string, line2: string, from = 0, long = scene.long, slow = 1): Part {
  if (PHONE) {
    return { long: long * slow, title, line: line2, frame: (t) => {
      const sc = scene(from + t / slow);
      const out = PHONE_GROUND!.clone();
      out.blit(sc, Math.round((PW - sc.w) / 2), Math.round((PH - sc.h) / 2));
      return out;
    } };
  }
  return { long: long * slow, title, line: line2, frame: (t) => cut(scaled(scene(from + t / slow), scene.k), 0, 0, W, H) };
}

const smashF = chiefFilm('smash', 'front', 25, 250, 228, 104, -10);
const smashB = chiefFilm('smash', 'back', 25, 330, 300, 104, 40);
const slamF = chiefFilm('slam', 'front', 55, 135, 246, 118, 0);
const cryF = chiefFilm('warcry', 'front', 25, 230, 215, 140, 0);
const rushF = chiefFilm('rush', 'front', 40, 110, 195, RUSH_LONG + 40, 0);
const biteF = wolfFilm('bite', 'front', 42, 130, 150, 104, 0);
const clawF = wolfFilm('claw', 'front', 42, 140, 150, 90, 0);
const howlF = wolfFilm('howl', 'front', 42, 150, 150, 110, -40);
const lungeF = wolfFilm('lunge', 'front', 42, 110, 125, 84, 0);
const cloudF = wolfFilm('cloud', 'front', 42, 130, 150, 92, 0);

const CS = CHIEF_MOVES.smash.beats[0].at;
export const parts: Part[] = [
  part(smashF, 'THE TROLL CHIEFTAIN’S CLUB SMASH', 'Rears right back, the club over his head, HELD, its ring marked · down in two frames · the freeze, the ground broken'),
  part(smashF, 'THE CLUB SMASH · HALF SPEED', 'Over and down in a flash, after-images and all · the burst · thrown back', CS - 0.12, 0.6, 2),
  part(smashB, 'THE CLUB SMASH · FROM BEHIND', 'Get out of the ring while he holds it up'),
  part(slamF, 'HIS GROUND SLAM', 'Squats, LEAPS, hangs there, the line marked · crashes down: the ground split open, rock thrust up along it'),
  part(cryF, 'HIS WAR CRY: HIS RAGE', 'Gathers it in, shaking · thrown open: the roar, the fire bursting up round him · the rage on him: quicker blows, quicker feet'),
  part(rushF, 'HIS BULL RUSH', 'Head down, the club a ram, pawing the ground, coiled, his line marked · down it in a blur · into you'),
  part(biteF, 'THE MIST WOLF’S BITE', 'Coiled back on its haunches, HELD · flung at you, jaws wide, in two frames · snapped shut, worried, let go'),
  part(biteF, 'THE BITE · HALF SPEED', 'Flung, snapped', WOLF_MOVES.bite.beats[0].at - 0.13, 0.45, 2),
  part(clawF, 'ITS CLAW SWEEP', 'Rears right up, a forepaw cocked high, HELD, its sweep marked · crashes down across you in two frames: three claw marks'),
  part(howlF, 'ITS HOWL', 'Head down, then thrown back: the howl · the floor’s wolves burst out of the mist to it'),
  part(lungeF, 'ITS LUNGE', 'Crouched flat, the mist drawn into it, its line marked · gone to mist, through you in a blink · lands beyond, turned back'),
  part(lungeF, 'THE LUNGE · HALF SPEED', 'Through you', 0.66, 0.4, 2),
  part(cloudF, 'ITS MIST CLOUD', 'Draws the mist in · blasts it out and is gone into it · its claws come at you out of it · it thins'),
];

const [out = 'f9_bosses_film.mp4', mode = ''] = process.argv.slice(2);
let total = 0;
for (const p of parts) total += p.long;
console.log(parts.length, 'parts,', total.toFixed(1), 's');
if (mode === 'stills') {
  const dir = process.argv[4] ?? 'stills';
  mkdirSync(dir, { recursive: true });
  const at = (process.argv[5] ?? '').split(',').filter(Boolean).map(Number);
  const only = process.argv[6] ? process.argv[6].split(',').map(Number) : null;
  parts.forEach((p, i) => {
    if (only && !only.includes(i)) return;
    for (const k of at.length ? at : [0.2, 0.4, 0.6, 0.8]) writeFileSync(`${dir}/p${i}_${k.toFixed(2)}.png`, png(p.frame(Math.min(p.long - 1e-3, p.long * k))));
  });
} else if (mode === 'count') {
  parts.forEach((p, i) => console.log(i, p.long.toFixed(2), p.title));
} else {
  const font = '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf';
  const font2 = '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf';
  const dir = mkdtempSync(join(tmpdir(), 'f9_bosses_captions_'));
  const filters: string[] = [];
  let at = 0;
  parts.forEach((p, i) => {
    writeFileSync(`${dir}/t${i}.txt`, p.title);
    writeFileSync(`${dir}/l${i}.txt`, p.line);
    const en = `:enable='between(t,${at.toFixed(3)},${(at + p.long - 0.001).toFixed(3)})'`;
    filters.push(`drawtext=fontfile=${font}:textfile=${dir}/t${i}.txt:x=18:y=14:fontsize=26:fontcolor=0xf0e8d0:box=1:boxcolor=0x07060c@0.65:boxborderw=8${en}`);
    filters.push(`drawtext=fontfile=${font2}:textfile=${dir}/l${i}.txt:x=18:y=${PHONE ? PH : H}-44:fontsize=18:fontcolor=0xd8d2e6:box=1:boxcolor=0x07060c@0.65:boxborderw=8${en}`);
    at += p.long;
  });
  const OW = PHONE ? PW : W;
  const OH = PHONE ? PH : H;
  const ff = spawn('ffmpeg', ['-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', `${OW}x${OH}`, '-r', String(FPS), '-i', '-', '-vf', filters.join(','), '-c:v', 'libx264', '-preset', 'medium', '-crf', '18', '-tune', 'animation', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', out], { stdio: ['pipe', 'inherit', 'inherit'] });
  const rgb = Buffer.alloc(OW * OH * 3);
  let n = 0;
  const t0 = Date.now();
  const write = async (): Promise<void> => {
    for (const [i, p] of parts.entries()) {
      const frames = Math.round(p.long * FPS);
      for (let f = 0; f < frames; f++) {
        const px = p.frame(f / FPS);
        for (let k = 0, j = 0; k < OW * OH * 4; k += 4, j += 3) {
          rgb[j] = px.d[k];
          rgb[j + 1] = px.d[k + 1];
          rgb[j + 2] = px.d[k + 2];
        }
        if (!ff.stdin.write(rgb)) await new Promise((r) => ff.stdin.once('drain', r));
        n++;
      }
      console.log(`part ${i} done (${n} frames, ${((Date.now() - t0) / 1000).toFixed(0)} s)`);
    }
    ff.stdin.end();
  };
  void write();
  ff.on('close', (code) => console.log('ffmpeg done', code, out, n, 'frames'));
}
