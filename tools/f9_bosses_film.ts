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
import { cut, scaled } from '../src/dev/king_scene';
import { chiefAt, sculptChief9, sculptWolf9, wolfAt } from '../src/dev/sculpt_f9_bosses';
import type { Drawn } from '../src/dev/sculpt';
import { CHIEF_MOVES, LUNGE_LONG, RUSH_LONG, WOLF_MOVES, chiefPose, wolfPose } from '../src/dev/f9_bosses_moves';
import type { ChiefMove, WolfMove } from '../src/dev/f9_bosses_moves';
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
const GROUNDS = new Map<number, Px>();
/** The ground for a scene `k` times as big as the film's picture. */
const groundFor = (k: number): Px => {
  let g = GROUNDS.get(k);
  if (!g) GROUNDS.set(k, (g = grass(Math.ceil(W / k), Math.ceil(H / k))));
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
// THE SCENES

type View = 'front' | 'back';
interface Part {
  long: number;
  title: string;
  line: string;
  frame: (t: number) => Px;
}

/** A chieftain scene: `move` seen `view` at `yaw`, his floor point at (bx, by), the Brawler `tf` ahead of him and `tl` to his left; whichever of them is farther drawn first. */
function chiefFilm(move: ChiefMove, view: View, yaw: number, bx: number, by: number, tf: number, tl: number, k = 2) {
  const size = { w: Math.ceil(W / k), h: Math.ceil(H / k), ax: bx, ay: by };
  const GROUND = groundFor(k);
  return (t: number): Px => {
    const pose = chiefPose(move, t);
    const d: Drawn = sculptChief9(view, pose, yaw, size);
    const pr: Pr = (f, l, u) => chiefAt(d, yaw, [f, l, u]);
    const tg = pr(tf, tl, 0);
    const hip = pr(pose.hip[0], pose.hip[1], 0);
    const hero = frameAt(BRAWLER, view === 'front' ? 'back' : 'front', 'stand', t);
    const M = CHIEF_MOVES[move];
    const since = t - M.hit;
    const impact: V3 = move === 'smash' ? [87, -8, 0] : [56, -5, 0];
    const p = GROUND.clone();
    // (on the ground)
    if (move === 'smash') {
      if (t > 0.35 && since < 0) warnRing(p, pr, impact[0], impact[1], 26, t);
      if (since >= 0) {
        crack(p, pr, impact[0] - 6, impact[1], 20, 1, since / 1.2, 77);
        crack(p, pr, impact[0] + 4, impact[1] + 6, -16, 1, since / 1.2, 79);
      }
      shock(p, pr, impact[0], impact[1], 32, since / 0.4);
    }
    if (move === 'slam') {
      if (t > 0.6 && since < 0) warnLane(p, pr, impact[0] - 6, impact[0] + 150, impact[1], 10, t);
      if (since >= 0) crack(p, pr, impact[0] - 6, impact[1], 156, since / 0.5, (since - 0.6) / 0.8, 81);
      shock(p, pr, impact[0], impact[1], 22, since / 0.35);
    }
    if (move === 'rush' && t > 0.25 && t < 1.15) warnLane(p, pr, 20, RUSH_LONG + 30, 0, 22, t);
    // (the two of them, the farther first)
    const heroFirst = tg[1] < hip[1];
    const layHero = (): void => lay(p, hero.px, hero.ax, hero.ay, tg[0], tg[1]);
    if (heroFirst) layHero();
    lay(p, d.px, 0, 0, 0, 0);
    if (!heroFirst) layHero();
    // (over them)
    if (move === 'smash' || move === 'slam') {
      dust(p, pr, impact[0], impact[1], since / 0.9, 9701, 12, 34);
      chips(p, pr, impact[0], impact[1], since, 9703);
      if (move === 'slam') for (let i = 1; i <= 4; i++) dust(p, pr, impact[0] + i * 34, impact[1], (since - i * 0.12) / 0.8, 9705 + i, 5, 14);
    }
    if (move === 'warcry') {
      const head = pr(pose.hip[0] + 28, 0, 112);
      if (since > 0 && since < 1.1) arcs(p, head[0], head[1], since / 1.1, -Math.PI / 2, 1.3, 3, FLAME);
      if (since > 0.05) rage(p, d.px, Math.floor(t * 30), Math.min(1, (since - 0.05) / 0.3));
      for (const [ts, s] of [[2.1, 1], [2.3, -1], [2.5, 1], [2.7, -1]] as const) dust(p, pr, pose.hip[0] + 10, s * 18, (t - ts) / 0.5, Math.round(9711 + ts * 10), 4, 10);
    }
    if (move === 'rush') {
      for (const ts of [0.58, 0.88]) dust(p, pr, 0, -18, (t - ts) / 0.6, Math.round(9721 + ts * 100), 5, 12);
      if (t > 1.05 && t < 1.95) for (let i = 0; i < 6; i++) dust(p, pr, pose.hip[0] - 16 - i * 16, (hash(i, 1, 9723) - 0.5) * 22, 0.25 + i * 0.1, 9725 + i, 2, 8);
      dust(p, pr, RUSH_LONG + 18, 0, (t - 1.75) / 0.7, 9727, 10, 26);
    }
    return p;
  };
}

/** A mist wolf scene: `move` seen `view` at `yaw`, its floor point at (bx, by), the Brawler `tf` ahead and `tl` to its left. */
function wolfFilm(move: WolfMove, view: View, yaw: number, bx: number, by: number, tf: number, tl: number, k = 3) {
  const size = { w: Math.ceil(W / k), h: Math.ceil(H / k), ax: bx, ay: by };
  const GROUND = groundFor(k);
  const FOGS: [number, number][] = [[50, 75], [0, -75]];
  return (t: number): Px => {
    const pose = wolfPose(move, t);
    const d: Drawn = sculptWolf9(view, pose, yaw, size);
    const pr: Pr = (f, l, u) => wolfAt(d, yaw, [f, l, u]);
    const tg = pr(tf, tl, 0);
    const root = pr(pose.root[0], pose.root[1], 0);
    const hero = frameAt(BRAWLER, view === 'front' ? 'back' : 'front', 'stand', t);
    const M = WOLF_MOVES[move];
    const since = t - M.hit;
    const p = GROUND.clone();
    if (move === 'lunge' && t > 0.3 && t < 0.68) warnLane(p, pr, 30, LUNGE_LONG + 40, 0, 14, t);
    if (move === 'bite' && t > 0.15 && since < 0) warnRing(p, pr, 62, 0, 18, t);
    if (move === 'claw' && t > 0.15 && since < 0) warnRing(p, pr, 54, 0, 22, t);
    // (the fog wolves it calls, out of the mist either side of it)
    const fogs: { px: Px; ax: number; ay: number; x: number; y: number; keep: number }[] = [];
    if (move === 'howl' && t > 0.9) {
      for (const [k, [ff, ll]] of FOGS.entries()) {
        const fp = wolfPainted('stand', t + k * 0.3, 'front');
        const at = pr(ff, ll, 0);
        fogs.push({ px: fp.px, ax: WOLF_CANVAS.ax, ay: WOLF_CANVAS.ay, x: at[0], y: at[1], keep: Math.min(1, (t - 0.9 - k * 0.2) / 0.7) });
        mistCloud(p, pr, ff, ll, 26, Math.min(1, (t - 0.8) / 0.4), t, Math.max(0, (t - 1.6) / 0.8));
      }
    }
    const items = [
      { kind: 'hero', y: tg[1] },
      { kind: 'wolf', y: root[1] },
      ...fogs.map((f, i) => ({ kind: `fog${i}`, y: f.y })),
    ].sort((a, b) => a.y - b.y);
    // (the lunge passes through you: you are struck as it does)
    const struck = move === 'lunge' ? Math.abs(pose.root[0] - tf) < 30 && t > 0.68 && t < 0.95 : false;
    for (const it of items) {
      if (it.kind === 'hero') lay(p, hero.px, hero.ax, hero.ay, tg[0] + (struck ? 1 : 0), tg[1]);
      else if (it.kind === 'wolf') lay(p, d.px, 0, 0, 0, 0);
      else {
        const f = fogs[Number(it.kind.slice(3))];
        if (f.keep > 0) lay(p, f.px, f.ax, f.ay, f.x, f.y, f.keep);
      }
    }
    // (over them)
    const muzzle = pr(pose.root[0] + 70, 0, 74 + pose.root[2]);
    if (move === 'bite') {
      slash(p, muzzle[0] - 4, muzzle[1] + 2, 12, -2.4, -0.6, (t - 0.42) / 0.22, MIST, 3);
      slash(p, muzzle[0] - 4, muzzle[1] + 4, 12, 2.4, 0.6, (t - 0.44) / 0.22, MIST, 3);
      hit(p, tg[0], tg[1] - 40, (t - 0.5) / 0.25);
    }
    if (move === 'claw') {
      const pc = pr(46, 0, 30);
      for (let i = 0; i < 3; i++) slash(p, pc[0] - 6, pc[1] + i * 4 - 4, 30, -2.2, 0.4, (t - 0.36 - i * 0.02) / 0.3, [MIST[2], FLAME[2], MIST[4]], 2);
      hit(p, tg[0], tg[1] - 36, (t - 0.47) / 0.25);
    }
    if (move === 'howl') {
      const head = pr(pose.root[0] + 52, 0, 104);
      if (t > 0.55 && t < 2.1) arcs(p, head[0], head[1], ((t - 0.55) % 0.75) / 0.75, -Math.PI / 2 - 0.3, 1.0, 2, ['#6c688a', '#c6c2da', '#eeecf8']);
    }
    if (move === 'lunge') {
      // (the mist it leaves along its way)
      if (t > 0.6) for (let i = 0; i < 10; i++) {
        const f = Math.min(pose.root[0], LUNGE_LONG) - i * 16;
        if (f < 0) break;
        mistCloud(p, pr, f, (hash(i, 1, 9801) - 0.5) * 8, 10, 1, t + i, Math.min(1, (t - 0.6) * 1.2 + i * 0.07));
      }
      if (struck) hit(p, tg[0], tg[1] - 34, ((t - 0.7) % 0.2) / 0.2);
    }
    if (move === 'cloud') {
      const g = t < 0.4 ? 0 : t < 1.0 ? (t - 0.4) / 0.6 : 1;
      const thin = t < 2.4 ? 0 : (t - 2.4) / 0.6;
      mistCloud(p, pr, pose.root[0] + 20, 0, 110, g, t, thin * 1.2);
      // (its eyes, through the mist)
      const eyes = pr(pose.root[0] + 57, 0, 81);
      if (g > 0.3 && thin < 0.7) {
        put(p, eyes[0], eyes[1], FLAME[4]);
        put(p, eyes[0] + 3, eyes[1] - 1, FLAME[4]);
      }
      if (g >= 1 && thin < 0.5) hit(p, tg[0], tg[1] - 34, ((t - 1.0) % 0.45) / 0.3);
    }
    return p;
  };
}

/** A part: `long` seconds of a scene `k` times as big, played from `from`, `slow` times slower. */
function part(scene: ((t: number) => Px) & { k?: number }, long: number, title: string, line2: string, from = 0, slow = 1): Part {
  return { long: long * slow, title, line: line2, frame: (t) => cut(scaled(scene(from + t / slow), scene.k ?? 2), 0, 0, W, H) };
}
const at = <T extends (t: number) => Px>(f: T, k: number): T & { k: number } => Object.assign(f, { k });

const C = CHIEF_MOVES;
const Wm = WOLF_MOVES;
const smashF = at(chiefFilm('smash', 'front', 25, 250, 195, 100, -14), 2);
const smashB = at(chiefFilm('smash', 'back', 25, 330, 300, 100, 45), 2);
const slamF = at(chiefFilm('slam', 'front', 40, 150, 175, 150, 0), 2);
const cryF = at(chiefFilm('warcry', 'front', 25, 230, 200, 128, 0), 2);
const rushF = at(chiefFilm('rush', 'front', 40, 110, 195, 120, 75), 2);
const biteF = at(wolfFilm('bite', 'front', 42, 130, 150, 105, 0), 3);
const clawF = at(wolfFilm('claw', 'front', 42, 140, 150, 92, 0), 3);
const howlF = at(wolfFilm('howl', 'front', 42, 150, 150, 110, -40), 3);
const lungeF = at(wolfFilm('lunge', 'front', 42, 110, 125, 80, 0), 3);
const cloudF = at(wolfFilm('cloud', 'front', 42, 130, 150, 90, 0), 3);

export const parts: Part[] = [
  part(smashF, C.smash.long, 'THE TROLL CHIEFTAIN’S CLUB SMASH', 'Both hands on it, swung up over his head, HELD, where it lands marked · down in two frames · a shockwave, the ground cracked'),
  part(smashF, 0.7, 'THE CLUB SMASH · HALF SPEED', 'Over and down: wound up, swung, landed', C.smash.hit - 0.25, 2),
  part(smashB, C.smash.long, 'THE CLUB SMASH · FROM BEHIND', 'The ring marked where it will land: get out of it while he holds it up'),
  part(slamF, C.slam.long, 'HIS GROUND SLAM', 'Crouched, then up on his toes, the club straight up, HELD, a line marked · driven down: the ground cracks open along the line'),
  part(cryF, C.warcry.long, 'HIS WAR CRY: HIS RAGE', 'Gathered in, then thrown open: the roar · the rage on him, burning pink and gold: his blows quicker and his feet quicker'),
  part(rushF, C.rush.long, 'HIS BULL RUSH', 'Head down, the club tucked like a ram, he paws the ground: his line marked · down it at a run · skids to a stop'),
  part(biteF, Wm.bite.long, 'THE MIST WOLF’S BITE', 'Gathered back, HELD · the lunge in, jaws flung open · snapped shut'),
  part(biteF, 0.45, 'THE BITE · HALF SPEED', 'Jaws open, shut', Wm.bite.hit - 0.15, 2),
  part(clawF, Wm.claw.long, 'ITS CLAW SWEEP', 'Up on its hind legs a little, a forepaw raised, HELD · swept across before it'),
  part(howlF, Wm.howl.long, 'ITS HOWL', 'Its head thrown back: the howl · the floor’s wolves come out of the mist to it'),
  part(lungeF, Wm.lunge.long, 'ITS LUNGE', 'Crouched, its line marked · gone to mist, it passes through you and takes its shape again beyond'),
  part(lungeF, 0.5, 'THE LUNGE · HALF SPEED', 'Through you', 0.62, 2),
  part(cloudF, Wm.cloud.long, 'ITS MIST CLOUD', 'It breathes the mist out and is gone into it · inside, it hurts · it thins'),
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
    filters.push(`drawtext=fontfile=${font2}:textfile=${dir}/l${i}.txt:x=18:y=${H}-44:fontsize=18:fontcolor=0xd8d2e6:box=1:boxcolor=0x07060c@0.65:boxborderw=8${en}`);
    at += p.long;
  });
  const ff = spawn('ffmpeg', ['-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', `${W}x${H}`, '-r', String(FPS), '-i', '-', '-vf', filters.join(','), '-c:v', 'libx264', '-preset', 'medium', '-crf', '20', '-tune', 'animation', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', out], { stdio: ['pipe', 'inherit', 'inherit'] });
  const rgb = Buffer.alloc(W * H * 3);
  let n = 0;
  const t0 = Date.now();
  const write = async (): Promise<void> => {
    for (const [i, p] of parts.entries()) {
      const frames = Math.round(p.long * FPS);
      for (let f = 0; f < frames; f++) {
        const px = p.frame(f / FPS);
        for (let k = 0, j = 0; k < W * H * 4; k += 4, j += 3) {
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
