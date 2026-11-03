// THE GOLEM'S GUN ARM FIRING (the art chat, 28 Oct 2026). A MOCK-UP; NOTHING OF THE GAME IMPORTS IT.
//
// His word, 28 Oct, by 00:50: “I’d like the big construct to have a ranged attack as well.  Maybe put a cannon or a tesla
// coil on his other arm or whatever.” So its little tool arm becomes a gun arm (dev/sculpt_golem.ts, GOLEM_GUNS), and here
// is what each looks like as it fires, by his art rulebook: Movement 9, a big wind-up and a lightning-quick strike (the arm
// swung up to aim, then the shot a flash of a frame or two, then a big wind-down); Effects, big and wild (the flash, the
// smoke, the bolt crackling, the frame kicked on the shot and on the hit); Hits, every hit shows (the cultist flashes and is
// knocked back, rocked by a heavy one; what flies off it is its own, a scrap of robe and a little blood off a cultist; a
// spell crackles over it instead). Everything that glows is the friend's cyan; the shot itself is iron.
//
// THE CANNON: its muzzle glows as it is brought level; it fires with a great cyan flash out of its mouth, a kick back up
// its arm, a ring of smoke; the iron ball is across the floor in two frames, a streak of cyan behind it, and bursts on the
// cultist in a star of cyan shards and sparks; the smoke rolls up off its muzzle as it is brought back up.
// THE TESLA COIL: brought down to aim, it crackles, more and more, arcs leaping off its ball to its ring; then the bolt, a
// forked jag of lightning to the first cultist, and on from it to the second; both crackle as they are knocked back; the
// coil spits and smokes as it is raised again.

import { Px } from '../engine/px';
import { Light, SMOKE, cloud } from './warlock_fx';

/** What glows: the friend's cyan, darkest to white-hot. */
export const GUN_GLOW = ['#0c6a80', '#22d0e0', '#b8fff8', '#e8ffff'];
/** Iron: the cannon's shot. */
export const IRON = ['#1c1a24', '#4a4858', '#7a7890', '#c8c6dc'];
export { SMOKE };

const hash = (i: number): number => {
  const x = Math.sin(i * 91.3 + 17.1) * 43758.5453;
  return x - Math.floor(x);
};

/** Its shot through time, in frames (30 a second): the arm swung up to aim; the shot; the wind-down; a round of `long`. */
export const SHOT = { aim: 2, aimed: 12, fire: 15, hit: 17, down: 30, rest: 44, long: 50 };
const ease = (u: number): number => {
  const c = Math.max(0, Math.min(1, u));
  return c * c * (3 - 2 * c);
};
/** How far its gun is brought down to aim at frame `f` (0 at rest, up; 1 aimed). */
export function gunAim(f: number): number {
  if (f < SHOT.aim) return 0;
  if (f < SHOT.aimed) return ease((f - SHOT.aim) / (SHOT.aimed - SHOT.aim));
  if (f < SHOT.down) return 1;
  if (f < SHOT.rest) return 1 - ease((f - SHOT.down) / (SHOT.rest - SHOT.down));
  return 0;
}
/** How far it is kicked back up its arm by the shot at frame `f`: all at once as it fires, easing back. */
export function gunKick(f: number): number {
  const k = f - SHOT.fire;
  if (k < 0) return 0;
  return Math.exp(-k / 3.2);
}
/** How far the whole picture kicks at frame `f` (pixels): on the shot and on the hit (his rulebook's Effects: the screen kicks on big hits). */
export function gunShake(f: number, heavy: boolean): [number, number] {
  const a = f - SHOT.fire;
  const b = f - SHOT.hit;
  const s = (k: number, m: number): number => (k >= 0 && k < 4 ? m * (k % 2 === 0 ? 1 : -1) * (1 - k / 4) : 0);
  return [Math.round(s(a, heavy ? 2 : 1) + s(b, heavy ? 2 : 1)), Math.round(s(b, heavy ? 1 : 0))];
}

/** A line of light from (x0, y0) to (x1, y1), `k` bright, `w` across. */
function line(l: Light, x0: number, y0: number, x1: number, y1: number, k: number, w = 1): void {
  const n = Math.max(1, Math.ceil(Math.hypot(x1 - x0, y1 - y0)));
  for (let i = 0; i <= n; i++) {
    const x = x0 + ((x1 - x0) * i) / n;
    const y = y0 + ((y1 - y0) * i) / n;
    for (let a = 0; a < w; a++) for (let b = 0; b < w; b++) l.put(x + a - (w >> 1), y + b - (w >> 1), k);
  }
}
/** A round of light at (x, y), `r` across: white at its heart, cyan to its edge. */
function disc(l: Light, x: number, y: number, r: number, top = 3): void {
  for (let yy = Math.floor(y - r); yy <= Math.ceil(y + r); yy++) {
    for (let xx = Math.floor(x - r); xx <= Math.ceil(x + r); xx++) {
      const d = Math.hypot(xx - x, yy - y) / Math.max(0.5, r);
      if (d > 1) continue;
      l.put(xx, yy, Math.max(0, Math.min(top, Math.round(top - d * top * 0.9))));
    }
  }
}

/**
 * THE CANNON'S FLASH out of its mouth at (x, y), fired the way (dx, dy) (a unit, on the picture), `k` frames after it fired:
 * a white heart and a star of cyan tongues out ahead of it and to its sides, gone in three frames.
 */
export function muzzleFlash(l: Light, x: number, y: number, dx: number, dy: number, k: number, seed: number): void {
  if (k < 0 || k > 2) return;
  const big = (k === 0 ? 1 : k === 1 ? 0.7 : 0.35) * 1.5;
  disc(l, x + dx * 3, y + dy * 3, 5.5 * big, 3);
  const rays = 9;
  for (let i = 0; i < rays; i++) {
    const spread = ((i / (rays - 1)) * 2 - 1) * 1.15;
    const a = Math.atan2(dy, dx) + spread + (hash(seed + i) - 0.5) * 0.18;
    const len = (6 + 18 * (1 - Math.abs(spread) / 1.15) + 5 * hash(seed * 3 + i)) * big;
    const ex = x + Math.cos(a) * len;
    const ey = y + Math.sin(a) * len;
    line(l, x, y, ex, ey, 1, 2);
    line(l, x, y, x + (ex - x) * 0.6, y + (ey - y) * 0.6, 2, 2);
    line(l, x, y, x + (ex - x) * 0.3, y + (ey - y) * 0.3, 3, 1);
  }
}
/** Its smoke: puffs rolling out of its mouth (x, y) the way (dx, dy) and up, `k` frames after it fired, thinning. */
export function gunSmoke(sm: Light, x: number, y: number, dx: number, dy: number, k: number, t: number, seed: number): void {
  if (k < 0 || k > 34) return;
  for (let i = 0; i < 7; i++) {
    const out = (6 + 16 * hash(seed + i)) * (1 - Math.exp(-k / 5));
    const up = k * (0.4 + 0.3 * hash(seed * 7 + i));
    const r = 4.5 + i * 0.9 + k * 0.45;
    cloud(sm, x + dx * out + (hash(seed * 3 + i) - 0.5) * 10, y + dy * out - up, 2 * r, 1.6 * r, t + i, Math.min(1, 0.02 + k / 40), 500 + seed + i);
  }
}
/** A wisp of smoke curling up from (x, y) (the coil spitting as it cools), `k` frames on. */
export function wisp(sm: Light, x: number, y: number, k: number, t: number, seed: number): void {
  if (k < 0 || k > 26) return;
  const r = 2 + k * 0.25;
  cloud(sm, x + Math.sin(k * 0.3 + seed) * 2, y - k * 0.9, 2 * r, 1.6 * r, t + seed, Math.min(1, 0.2 + k / 26), 700 + seed);
}

/**
 * THE SHOT across the floor, from (x0, y0) to (x1, y1), `u` of the way (it is there in two frames): the iron ball, two
 * ghosts of it behind it, and a streak of cyan behind those, fading the frame after.
 */
export function shotStreak(l: Light, iron: Light, x0: number, y0: number, x1: number, y1: number, u: number): void {
  if (u < 0 || u > 1.6) return;
  const at = Math.min(1, u);
  const x = x0 + (x1 - x0) * at;
  const y = y0 + (y1 - y0) * at;
  const back = Math.max(0, at - 0.55);
  const fade = u > 1 ? 1 - (u - 1) / 0.6 : 1;
  // (the streak: a line of cyan from where it was to where it is, brightest just behind it)
  const sx = x0 + (x1 - x0) * back;
  const sy = y0 + (y1 - y0) * back;
  if (fade > 0.5) line(l, sx, sy, x, y, 1, 3);
  if (fade > 0.75) line(l, x0 + (x1 - x0) * (back + (at - back) * 0.5), y0 + (y1 - y0) * (back + (at - back) * 0.5), x, y, 2, 1);
  if (u > 1) return;
  // (the ball, wreathed in the friend's cyan, and its ghosts behind it)
  for (const [g, k] of [[0.18, 1], [0.09, 2], [0, 3]] as const) {
    const gx = x - (x1 - x0) * g;
    const gy = y - (y1 - y0) * g;
    for (let yy = -6; yy <= 6; yy++) for (let xx = -6; xx <= 6; xx++) {
      const d = Math.hypot(xx, yy);
      if (k === 3 && d > 4.2 && d <= 6.0) l.put(gx + xx, gy + yy, d > 5.1 ? 1 : 2);
      if (d > 4.2) continue;
      iron.put(gx + xx, gy + yy, k === 3 ? (d < 1.6 && xx < 0 && yy < 0 ? 3 : d < 3 ? 2 : 1) : k === 2 ? 1 : 0);
    }
  }
}
/**
 * IT BURSTS ON WHAT IT HITS at (x, y), `k` frames on: a white flash, a star of cyan shards flung out of it, and sparks
 * flung up and falling.
 */
export function impactBurst(l: Light, x: number, y: number, k: number, seed: number, big = 1): void {
  if (k < 0 || k > 16) return;
  if (k < 2) disc(l, x, y, (k === 0 ? 7 : 4.5) * big, 3);
  const n = 12;
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2 + hash(seed + i) * 0.4;
    const sp = (2.4 + 2.2 * hash(seed * 5 + i)) * big;
    if (k < 6) {
      // (a shard: a short dash flying out, fading)
      const r0 = sp * k;
      const r1 = r0 + 4 + 3 * hash(seed + i * 3);
      line(l, x + Math.cos(a) * r0, y + Math.sin(a) * r0 * 0.8, x + Math.cos(a) * r1, y + Math.sin(a) * r1 * 0.8, k < 2 ? 3 : k < 4 ? 2 : 1, k < 3 ? 2 : 1);
    }
    // (a spark: flung up and out, falling, dying)
    const vx = Math.cos(a) * sp * 0.8;
    const vy = -1.8 - 2.2 * hash(seed * 7 + i);
    const sx = x + vx * k;
    const sy = y + vy * k + 0.22 * k * k;
    if (k < 14 && hash(seed * 11 + i) < 0.85 - k * 0.04) {
      l.put(sx, sy, k < 5 ? 2 : 1);
      l.put(sx + 1, sy, k < 5 ? 2 : 1);
    }
  }
}

/** A jag of lightning from (x0, y0) to (x1, y1), its path broken up anew with each `seed`: its points. */
function jag(x0: number, y0: number, x1: number, y1: number, seed: number, rough: number): [number, number][] {
  let pts: [number, number][] = [[x0, y0], [x1, y1]];
  let r = rough * Math.hypot(x1 - x0, y1 - y0);
  for (let pass = 0; pass < 5; pass++) {
    const out: [number, number][] = [pts[0]];
    for (let i = 1; i < pts.length; i++) {
      const [ax, ay] = pts[i - 1];
      const [bx, by] = pts[i];
      const len = Math.hypot(bx - ax, by - ay) || 1;
      const off = (hash(seed * 13 + pass * 101 + i * 7) - 0.5) * 2 * r;
      out.push([(ax + bx) / 2 + (-(by - ay) / len) * off, (ay + by) / 2 + ((bx - ax) / len) * off]);
      out.push([bx, by]);
    }
    pts = out;
    r *= 0.55;
  }
  return pts;
}
/** A path of light along points: a white core `core` wide, cyan round it. */
function along(l: Light, pts: [number, number][], core: number, glow: boolean): void {
  for (let i = 1; i < pts.length; i++) {
    const [ax, ay] = pts[i - 1];
    const [bx, by] = pts[i];
    if (glow) line(l, ax, ay, bx, by, 1, core + 2);
    line(l, ax, ay, bx, by, 2, core + 1);
    line(l, ax, ay, bx, by, 3, core);
  }
}
/**
 * THE BOLT from (x0, y0) to (x1, y1): a forked jag of lightning, white-hot at its core, cyan round it, forks spitting off it
 * that die out; broken up anew each frame (`seed`); `k` its frame (0 the brightest; fading as it dies).
 */
export function bolt(l: Light, x0: number, y0: number, x1: number, y1: number, seed: number, k = 0): void {
  const pts = jag(x0, y0, x1, y1, seed, 0.16);
  const core = k === 0 ? 2 : 1;
  along(l, pts, core, k < 2);
  // (its forks: off it here and there, short, jagged, dying out)
  const forks = k === 0 ? 4 : 2;
  for (let i = 0; i < forks; i++) {
    const at = pts[Math.floor((0.2 + 0.6 * hash(seed * 3 + i)) * (pts.length - 1))];
    const a = Math.atan2(y1 - y0, x1 - x0) + (hash(seed * 5 + i) < 0.5 ? 1 : -1) * (0.5 + 0.6 * hash(seed * 7 + i));
    const len = 8 + 12 * hash(seed * 9 + i);
    const fp = jag(at[0], at[1], at[0] + Math.cos(a) * len, at[1] + Math.sin(a) * len, seed * 17 + i, 0.3);
    for (let j = 1; j < fp.length; j++) line(l, fp[j - 1][0], fp[j - 1][1], fp[j][0], fp[j][1], j < fp.length * 0.5 ? 2 : 1, 1);
  }
}
/**
 * CRACKLING round (x, y), `r` out: little arcs leaping about it, `n` of them, broken up anew each frame (`seed`): the coil's
 * ball charging, or what it hit crawling with it.
 */
export function crackle(l: Light, x: number, y: number, r: number, n: number, seed: number): void {
  for (let i = 0; i < n; i++) {
    const a = hash(seed * 3 + i) * Math.PI * 2;
    const a2 = a + (hash(seed * 5 + i) - 0.5) * 1.6;
    const r0 = r * (0.25 + 0.3 * hash(seed * 7 + i));
    const r1 = r * (0.75 + 0.35 * hash(seed * 11 + i));
    const pts = jag(x + Math.cos(a) * r0, y + Math.sin(a) * r0, x + Math.cos(a2) * r1, y + Math.sin(a2) * r1, seed * 19 + i, 0.35);
    for (let j = 1; j < pts.length; j++) line(l, pts[j - 1][0], pts[j - 1][1], pts[j][0], pts[j][1], j < pts.length / 2 ? 2 : 1, 1);
  }
}
/** A glow round (x, y): a halo of cyan `r` across, faint at its edge (the coil's ball as it charges). */
export function halo(l: Light, x: number, y: number, r: number): void {
  disc(l, x, y, r, 2);
}

/** A picture of `w` by `h` with its smoke, its iron and its light laid on it, in that order. */
export function layGun(w: number, h: number, sm: Light, iron: Light, l: Light): Px {
  const out = new Px(w, h);
  sm.lay(out, SMOKE);
  iron.lay(out, IRON);
  l.lay(out, GUN_GLOW);
  return out;
}
