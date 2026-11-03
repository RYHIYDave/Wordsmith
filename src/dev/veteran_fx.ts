// THE VETERAN'S ACTION LINES (the art chat, 2 Nov 2026). A MOCK-UP; NOTHING OF THE GAME IMPORTS IT.
//
// His word on the stills, 2 Nov 2026: “Those action lines will probably need to be bigger.  Remember, I’d rather have to
// pull back from a 10 then build up from a 1.” So, painted pixel by pixel (crisp: every pixel there or not), much bigger
// than the stills' streak: GREAT SWEEPING SMEARS along every blow (a broad band along the path the fist, shin, knee or
// elbow travels, white-hot at its head, cyan for a punch and hot orange for a kick, as his globes are, inked round),
// AFTER-IMAGES of him along the strike, IMPACT BURSTS where a blow lands (a jagged star, a ring round it), SHOCKWAVE RINGS
// along the floor on the heavy hits, DUST kicked off the floor on take-offs and landings, SPEED LINES behind a leap, the
// STARS of a stunned foe. Never the enemy's pink or gold on his.

import { Px, rgba } from '../engine/px';
import { CYAN, INK } from '../art/kit';
import { GLOBE_ORANGE } from './veteran_globes';

/** The colours of a punch's lines (his tap, cyan) and a kick's (his hold, hot orange): ink, outer, edge, glow, core. */
export const FX_PUNCH = [INK, CYAN[0], CYAN[2], CYAN[3], '#ffffff'] as const;
export const FX_KICK = [INK, GLOBE_ORANGE[1], GLOBE_ORANGE[2], GLOBE_ORANGE[4], '#ffffff'] as const;
const DUST = ['#2a2438', '#4a4460', '#6e6886', '#958fab', '#bcb6cc'];

/** Paint one pixel, solid. */
export function put(px: Px, x: number, y: number, c: string): void {
  x = Math.round(x);
  y = Math.round(y);
  if (x < 0 || y < 0 || x >= px.w || y >= px.h) return;
  const v = rgba(c);
  const i = (y * px.w + x) * 4;
  px.d[i] = v[0];
  px.d[i + 1] = v[1];
  px.d[i + 2] = v[2];
  px.d[i + 3] = 255;
}
function disc(px: Px, x: number, y: number, r: number, c: string, sy = 1): void {
  for (let yy = Math.floor(y - r * sy - 1); yy <= Math.ceil(y + r * sy + 1); yy++) {
    for (let xx = Math.floor(x - r - 1); xx <= Math.ceil(x + r + 1); xx++) {
      const dx = xx + 0.5 - x;
      const dy = (yy + 0.5 - y) / sy;
      if (dx * dx + dy * dy <= r * r) put(px, xx, yy, c);
    }
  }
}

/**
 * A GREAT SWEEPING SMEAR along a path (screen points, oldest first): a broad band, `w` wide at its head and thinning to a
 * thread at its tail; inked round, its outer colour, its edge, its glow, a white-hot core toward the head. `show` is how
 * much of it is still there, from its head back (1 all, 0 none), as it dies away after the blow.
 */
export function smear(px: Px, path: [number, number][], w: number, cols: readonly string[], show = 1): void {
  if (path.length < 2 || show <= 0) return;
  // (resampled evenly, a point a pixel)
  const pts: [number, number][] = [path[0]];
  for (let i = 1; i < path.length; i++) {
    const [ax, ay] = path[i - 1];
    const [bx, by] = path[i];
    const n = Math.max(1, Math.ceil(Math.hypot(bx - ax, by - ay) * 2));
    for (let k = 1; k <= n; k++) pts.push([ax + ((bx - ax) * k) / n, ay + ((by - ay) * k) / n]);
  }
  const N = pts.length;
  const from = Math.floor(N * (1 - show));
  const rad = (i: number): number => {
    const t = i / (N - 1);
    return 0.6 + (w / 2) * Math.pow(t, 0.8) * (t > 0.93 ? 1 - (t - 0.93) * 6 : 1);
  };
  const layers: [number, string][] = [[1.6, cols[0]], [0.8, cols[1]], [0, cols[2]], [-1.3, cols[3]], [-2.6, cols[4]]];
  for (const [grow, c] of layers) {
    for (let i = from; i < N; i++) {
      const r = rad(i) + grow * Math.min(1, rad(i) / 2.5);
      if (r <= 0.3) continue;
      disc(px, pts[i][0], pts[i][1], r, c);
    }
  }
}

/** A silhouette of him (an after-image): every pixel of `fig` that is there, in one colour, at (ox, oy). */
export function ghost(px: Px, fig: Px, ox: number, oy: number, c: string, edge: string): void {
  const solid = (x: number, y: number): boolean => x >= 0 && y >= 0 && x < fig.w && y < fig.h && fig.d[(y * fig.w + x) * 4 + 3] === 255;
  for (let y = 0; y < fig.h; y++) {
    for (let x = 0; x < fig.w; x++) {
      if (!solid(x, y)) continue;
      const rim = !solid(x - 1, y) || !solid(x + 1, y) || !solid(x, y - 1) || !solid(x, y + 1);
      put(px, ox + x, oy + y, rim ? edge : c);
    }
  }
}

/** A seeded number in [0, 1). */
export function rnd(n: number): number {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}

/**
 * AN IMPACT BURST where a blow lands, `age` frames after (0: the frame it lands): a jagged star of white-hot spikes, inked,
 * its colour round it, flung out big on the first frame and breaking into lines as it goes; a ring round it, growing.
 */
export function impact(px: Px, x: number, y: number, age: number, cols: readonly string[], heavy: boolean, seed: number): void {
  if (age < 0 || age > 6) return;
  const R = heavy ? 26 : 16;
  const n = heavy ? 11 : 8;
  // the star
  if (age <= 2) {
    const k = age === 0 ? 1 : age === 1 ? 0.85 : 0.6;
    for (const [grow, c] of [[2, cols[0]], [1, cols[2]], [0, cols[3]], [-1.5, cols[4]]] as const) {
      for (let i = 0; i < n; i++) {
        const a = (i / n) * Math.PI * 2 + rnd(seed + i) * 0.5;
        const len = R * k * (0.55 + 0.45 * rnd(seed + 40 + i));
        const steps = Math.ceil(len * 2);
        for (let s = 0; s <= steps; s++) {
          const t = s / steps;
          const r = (heavy ? 3.2 : 2.2) * (1 - t) * k + grow * (1 - t * 0.5);
          if (r <= 0.2) continue;
          disc(px, x + Math.cos(a) * len * t, y + Math.sin(a) * len * t * 0.8, r, c);
        }
      }
      disc(px, x, y, (heavy ? 7 : 5) * k + grow, c);
    }
  } else {
    // (broken into lines flying out)
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2 + rnd(seed + i) * 0.5;
      const r0 = R * (0.5 + 0.18 * age);
      const r1 = r0 + R * 0.35 * (1 - (age - 3) / 4);
      for (let t = r0; t <= r1; t += 0.5) put(px, x + Math.cos(a) * t, y + Math.sin(a) * t * 0.8, age < 5 ? cols[3] : cols[2]);
    }
  }
  // the ring round it
  const rr = (heavy ? 10 : 7) + age * (heavy ? 6 : 4);
  const thick = Math.max(1, (heavy ? 3 : 2) - Math.floor(age / 2));
  for (let a = 0; a < Math.PI * 2; a += 0.5 / rr) {
    for (let t = 0; t < thick; t++) put(px, x + Math.cos(a) * (rr + t), y + Math.sin(a) * (rr + t) * 0.85, t === thick - 1 && thick > 1 ? cols[2] : cols[4]);
  }
}

/** A SHOCKWAVE RING along the floor round a point (screen, the floor's own slant), `age` frames after a heavy blow. */
export function floorRing(px: Px, x: number, y: number, age: number, cols: readonly string[], big = 1): void {
  if (age < 0 || age > 9) return;
  const r = (10 + age * 7) * big;
  const thick = Math.max(1, 4 - Math.floor(age / 2.5));
  for (let a = 0; a < Math.PI * 2; a += 0.4 / r) {
    for (let t = 0; t < thick; t++) {
      const c = t === 0 ? cols[4] : t === thick - 1 ? cols[1] : cols[3];
      put(px, x + Math.cos(a) * (r - t), y + Math.sin(a) * (r - t) * 0.5, age > 6 && t === 0 ? cols[3] : c);
    }
  }
}

/** DUST kicked off the floor at a point (screen), `age` frames after: puffs rolling out along the floor and up, thinning away. */
export function dust(px: Px, x: number, y: number, age: number, big: boolean, seed: number): void {
  if (age < 0 || age > 14) return;
  const n = big ? 14 : 8;
  const spread = (big ? 30 : 16) * (1 - Math.pow(1 - Math.min(1, age / 12), 2));
  const puffs: [number, number, number][] = [];
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2 + rnd(seed + i) * 0.7;
    const cx = x + Math.cos(a) * spread * (0.55 + 0.55 * rnd(seed + 9 + i));
    const cy = y + Math.sin(a) * spread * 0.42 - age * (0.35 + rnd(seed + 19 + i) * 0.5);
    const r = (big ? 4.2 : 3.0) * (0.55 + 0.6 * rnd(seed + 29 + i)) * (age < 4 ? 0.6 + age * 0.12 : 1 - (age - 4) / 11);
    if (r >= 0.9) puffs.push([cx, cy, r]);
  }
  // (a soft dark edge, the body of each puff, its lit top; thinning to wisps as it goes)
  for (const [cx, cy, r] of puffs) disc(px, cx, cy + 0.6, r + 0.8, age > 8 ? DUST[1] : DUST[1]);
  for (const [cx, cy, r] of puffs) disc(px, cx, cy, r, age > 9 ? DUST[2] : DUST[3]);
  for (const [cx, cy, r] of puffs) if (r > 1.6) disc(px, cx - r * 0.25, cy - r * 0.35, r * 0.5, age > 9 ? DUST[3] : DUST[4]);
}

/** SPEED LINES behind something moving fast: long thin streaks back along the way it came (screen), around its middle. */
export function speedLines(px: Px, x: number, y: number, vx: number, vy: number, spread: number, seed: number, cols: readonly string[]): void {
  const v = Math.hypot(vx, vy);
  if (v < 2) return;
  const ux = -vx / v;
  const uy = -vy / v;
  const n = 7;
  for (let i = 0; i < n; i++) {
    const off = (rnd(seed + i) - 0.5) * 2 * spread;
    const start = 6 + rnd(seed + 7 + i) * 10;
    const len = Math.min(70, v * (2.5 + 2 * rnd(seed + 17 + i)));
    const sx = x - uy * off + ux * start;
    const sy = y + ux * off + uy * start;
    for (let t = 0; t < len; t += 0.5) {
      const c = t < len * 0.3 ? cols[4] : t < len * 0.7 ? cols[3] : cols[2];
      put(px, sx + ux * t, sy + uy * t, c);
      if (i % 2 === 0 && t < len * 0.5) put(px, sx + ux * t - uy, sy + uy * t + ux, cols[2]);
    }
  }
}

/** STARS wheeling round a stunned foe's head (screen), at a frame. */
export function stars(px: Px, x: number, y: number, f: number): void {
  for (let i = 0; i < 3; i++) {
    const a = f * 0.32 + (i / 3) * Math.PI * 2;
    const sx = x + Math.cos(a) * 9;
    const sy = y + Math.sin(a) * 3.5;
    for (const [dx, dy] of [[0, 0], [1, 0], [-1, 0], [0, 1], [0, -1]]) put(px, sx + dx, sy + dy, '#f4f2ff');
    for (const [dx, dy] of [[2, 0], [-2, 0], [0, 2], [0, -2]]) put(px, sx + dx, sy + dy, INK);
  }
}

/** A dark shadow on the floor under something (screen), smaller the higher it is. */
export function shadow(px: Px, x: number, y: number, half: number, lift: number): void {
  const k = Math.max(0.45, 1 - lift / 90);
  const rx = half * k;
  const ry = Math.max(2, half * 0.36 * k);
  for (let yy = Math.floor(y - ry); yy <= Math.ceil(y + ry); yy++) {
    for (let xx = Math.floor(x - rx); xx <= Math.ceil(x + rx); xx++) {
      const dx = (xx + 0.5 - x) / rx;
      const dy = (yy + 0.5 - y) / ry;
      if (dx * dx + dy * dy <= 1) put(px, xx, yy, '#0c0a18');
    }
  }
}
