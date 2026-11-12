// THE VETERAN'S ACTION LINES (the art chat, 2 Nov 2026). A MOCK-UP; NOTHING OF THE GAME IMPORTS IT.
//
// His word on the stills, 2 Nov 2026: “Those action lines will probably need to be bigger.  Remember, I’d rather have to
// pull back from a 10 then build up from a 1.” So, painted pixel by pixel (crisp: every pixel there or not), much bigger
// than the stills' streak: GREAT SWEEPING SMEARS along every blow (a broad band along the path the fist, shin, knee or
// elbow travels, white-hot at its head, green for a punch and hot orange for a kick, as his globes are, inked round),
// AFTER-IMAGES of him along the strike, IMPACT BURSTS where a blow lands (a jagged star, a ring round it), SHOCKWAVE RINGS
// along the floor on the heavy hits, DUST kicked off the floor on take-offs and landings, SPEED LINES behind a leap, the
// STARS of a stunned foe. Never the enemy's pink or gold on his. His punches green (his 3 Nov, 10:44: “the brawler is Str/dex,
// so I think we change the color of the globe for a punch to green and the kicks stay orange/red”), his kicks hot orange.

import { Px, rgba } from '../engine/px';
import { INK } from '../art/kit';
import { GLOBE_GREEN, GLOBE_ORANGE } from './veteran_globes';

/** The colours of a punch's lines (his tap, green) and a kick's (his hold, hot orange): ink, outer, edge, glow, core. */
export const FX_PUNCH = [INK, GLOBE_GREEN[0], GLOBE_GREEN[2], GLOBE_GREEN[3], '#ffffff'] as const;
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
export function smear(px: Px, path: [number, number][], w: number, cols: readonly string[], show = 1, keep?: boolean[]): void {
  if (path.length < 2 || show <= 0) return;
  // (resampled evenly, a point a pixel; `keep`, if given, says which stretches of it are painted now: a band that goes
  // round him is painted behind him where it is behind him and in front where it is in front)
  const pts: [number, number][] = [path[0]];
  const on: boolean[] = [keep ? keep[0] : true];
  for (let i = 1; i < path.length; i++) {
    const [ax, ay] = path[i - 1];
    const [bx, by] = path[i];
    const n = Math.max(1, Math.ceil(Math.hypot(bx - ax, by - ay) * 2));
    for (let k = 1; k <= n; k++) {
      pts.push([ax + ((bx - ax) * k) / n, ay + ((by - ay) * k) / n]);
      on.push(keep ? keep[k * 2 < n ? i - 1 : i] : true);
    }
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
      if (!on[i]) continue;
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
export function impact(px: Px, x: number, y: number, age: number, cols: readonly string[], heavy: boolean, seed: number, big = 1): void {
  if (age < 0 || age > 6) return;
  const R = (heavy ? 26 : 16) * big;
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
          const r = (heavy ? 3.2 : 2.2) * Math.sqrt(big) * (1 - t) * k + grow * (1 - t * 0.5);
          if (r <= 0.2) continue;
          disc(px, x + Math.cos(a) * len * t, y + Math.sin(a) * len * t * 0.8, r, c);
        }
      }
      disc(px, x, y, (heavy ? 7 : 5) * Math.sqrt(big) * k + grow, c);
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
  const rr = ((heavy ? 10 : 7) + age * (heavy ? 6 : 4)) * Math.sqrt(big);
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

/**
 * THE PUSH KICK'S BLAST OF FORCE (his “Push kick hits in a cone in front of”): a cone spreading out from the heel along the
 * floor, `age` frames after the blow: its two edges drawn out from the heel, a wedge of hot orange streaks racing out
 * inside it to its front, and a fan of dust rolled up along that front. `at(r, a)`: the picture's point on the floor `r`
 * out from the heel, `a` degrees off the line of the kick. It reaches `reach` out (his measure) in seven frames and dies
 * away by fourteen.
 */
export function coneBlast(px: Px, at: (r: number, a: number) => [number, number], deg: number, reach: number, age: number, cols: readonly string[], seed: number): void {
  if (age < 0 || age > 14) return;
  const u = Math.min(1, age / 7);
  const front = reach * (1 - (1 - u) * (1 - u));
  const half = deg / 2;
  const line = (r0: number, r1: number, a: number, c: string, thick = 0): void => {
    const [x0, y0] = at(r0, a);
    const [x1, y1] = at(r1, a);
    const n = Math.max(1, Math.ceil(Math.hypot(x1 - x0, y1 - y0) * 2));
    for (let k = 0; k <= n; k++) {
      const x = x0 + ((x1 - x0) * k) / n;
      const y = y0 + ((y1 - y0) * k) / n;
      put(px, x, y, c);
      if (thick) put(px, x, y + 1, c);
    }
  };
  // (the cone itself, laid on the floor: a glow of hot orange through the whole wedge out to its front, every other pixel,
  // thinning as it dies)
  if (age <= 10) {
    const seen = new Set<number>();
    for (let r = 3; r <= front; r += 0.6) {
      const step = Math.max(0.4, (0.6 / Math.max(1, r)) * (180 / Math.PI));
      for (let a = -half; a <= half; a += step) {
        const [x, y] = at(r, a);
        const X = Math.round(x);
        const Y = Math.round(y);
        const k = Y * 100000 + X;
        if (seen.has(k)) continue;
        seen.add(k);
        const near = r / Math.max(1, front);
        // (dense while it is new, so its reach reads: the whole wedge lit, its front hottest; thinning as it dies)
        if (age > 4 && (X + Y) % 2 !== 0 && near < 0.75) continue;
        if (age > 7 && (X * 3 + Y) % 4 !== 0) continue;
        put(px, X, Y, near > 0.85 && age <= 7 ? cols[3] : near > 0.6 || (X + Y) % 2 === 0 ? cols[2] : cols[1]);
      }
    }
  }
  // (the two edges of the cone: from the heel to its front, bright, then dimming)
  if (age <= 11) for (const a of [-half, half]) line(2, front, a, age < 6 ? cols[3] : cols[2], age < 6 ? 1 : 0);
  // (the streaks: each its own angle across the cone, a stroke racing out behind the front, white-hot at its head)
  if (age <= 10) {
    const n = 11;
    for (let i = 0; i < n; i++) {
      const a = -half * 0.92 + (deg * 0.92 * (i + 0.5 * rnd(seed + i))) / n;
      const lead = front * (0.82 + 0.18 * rnd(seed + 11 + i));
      const tail = lead * (0.42 + 0.2 * rnd(seed + 23 + i)) * (age > 6 ? 1.3 : 1);
      if (lead - tail < 2) continue;
      line(tail, lead, a, cols[0], 1);
      line(tail + (lead - tail) * 0.1, lead, a, cols[2], 1);
      line(tail + (lead - tail) * 0.55, lead, a, age < 7 ? cols[4] : cols[3], 1);
    }
  }
  // (the front itself, an arc across the cone; and the fan of dust rolled up along it)
  if (age <= 9) for (let a = -half; a <= half; a += 2) put(px, ...at(front, a), age < 5 ? cols[4] : cols[3]);
  for (let i = 0; i < 6; i++) {
    const a = -half * 0.85 + (deg * 0.85 * i) / 5;
    const [x, y] = at(front * (0.9 + 0.1 * rnd(seed + 41 + i)), a);
    dust(px, x, y, Math.max(0, age - 2), i % 2 === 0, seed + 53 + i * 7);
  }
}

// =============================================================================================
// HIS REACH (his word, 3 Nov 2026: “I’d like all of his moves to have more reach”; his pick “Both”): THE FORCE PAST THE FIST
// OR FOOT, a blast of air and light in the blow's colour (green a punch, hot orange a kick; never pink, never gold).

type V3 = readonly [number, number, number] | readonly number[];
/** The picture's point for a point of the scene (his measure, along the floor and up). */
export type To = (q: V3) => [number, number];

/**
 * A SHOCK CONE shot out along a straight blow's line from the fist, foot or knee (`o`), its line `dir` along the floor and
 * tipped `up` off it, `half` its half-spread (radians): its front `front` out (a bright ring of air across the line, inked
 * round, white at its heart), two rings of air left behind it, and streaks of light racing along the cone's skin to the
 * front. `age` frames since the blow; once its front is out (`out`, frames), it breaks up and is gone in five.
 * `lean` (radians; 0, as it has always been painted): the rings' level axis swung that far toward the line the cone goes out
 * along, for a cone seen exactly side-on (the Brawler from all eight sides, thrown straight to the left or right of the
 * screen: art/veteran_fx_art.ts), whose rings would else lie edge-on to the eye, a bar and not a ring.
 */
export function shockCone(px: Px, to: To, o: V3, dir: number, up: number, half: number, front: number, age: number, out: number, cols: readonly string[], seed: number, lean = 0): void {
  if (age < 0 || age > out + 5 || front <= 1) return;
  const gone = Math.max(0, Math.min(1, (age - out) / 5));
  const a: V3 = [Math.cos(up) * Math.cos(dir), Math.cos(up) * Math.sin(dir), Math.sin(up)];
  const v0: V3 = [-Math.sin(dir), Math.cos(dir), 0];
  const w: V3 = [a[1] * v0[2] - a[2] * v0[1], a[2] * v0[0] - a[0] * v0[2], a[0] * v0[1] - a[1] * v0[0]];
  const v: V3 = lean ? [v0[0] * Math.cos(lean) + a[0] * Math.sin(lean), v0[1] * Math.cos(lean) + a[1] * Math.sin(lean), v0[2] * Math.cos(lean) + a[2] * Math.sin(lean)] : v0;
  const at = (t: number, phi: number, rho: number): [number, number] => to([o[0] + a[0] * t + (v[0] * Math.cos(phi) + w[0] * Math.sin(phi)) * rho, o[1] + a[1] * t + (v[1] * Math.cos(phi) + w[1] * Math.sin(phi)) * rho, o[2] + a[2] * t + (v[2] * Math.cos(phi) + w[2] * Math.sin(phi)) * rho]);
  const keep = (i: number): boolean => gone <= 0 || rnd(seed * 7 + i) > gone;
  const tan = Math.tan(half);
  // (its body of air, lit: every other pixel inside it, over its front half, thinning as it breaks up)
  if (gone < 0.6) {
    const seen = new Set<number>();
    for (let t = front * 0.45; t <= front; t += 0.7) {
      const rho = t * tan;
      for (let r = 0; r <= rho; r += 0.8) {
        const n = Math.max(1, Math.ceil((2 * Math.PI * r) / 0.8));
        for (let i = 0; i < n; i++) {
          const [x, y] = at(t, (i / n) * Math.PI * 2, r);
          const X = Math.round(x);
          const Y = Math.round(y);
          const key = Y * 100000 + X;
          if (seen.has(key) || (X + Y) % 2 !== 0) continue;
          seen.add(key);
          if (gone > 0 && rnd(key) < gone * 1.6) continue;
          put(px, X, Y, t > front * 0.8 ? cols[3] : cols[2]);
        }
      }
    }
  }
  // (the streaks along its skin, from a quarter of the way out to the front)
  const n = 16;
  for (let i = 0; i < n; i++) {
    const phi = (i / n) * Math.PI * 2 + rnd(seed + i) * 0.4;
    const t0 = front * (0.2 + 0.25 * rnd(seed + 20 + i));
    const t1 = front * (0.94 + 0.06 * rnd(seed + 40 + i));
    const [x0, y0] = at(t0, phi, t0 * tan);
    const [x1, y1] = at(t1, phi, t1 * tan);
    const N = Math.max(2, Math.ceil(Math.hypot(x1 - x0, y1 - y0) * 2));
    for (let k = 0; k <= N; k++) {
      if (!keep(i * 97 + k)) continue;
      const u = k / N;
      const c = u < 0.4 ? cols[2] : u < 0.8 ? cols[3] : cols[4];
      if (u > 0.5) disc(px, x0 + (x1 - x0) * u, y0 + (y1 - y0) * u, 0.9, cols[1]);
      put(px, x0 + (x1 - x0) * u, y0 + (y1 - y0) * u, c);
    }
  }
  // (the rings: two left behind, thin; the front, thick, inked round, white at its heart)
  const ring = (t: number, layers: [number, string][], step: number): void => {
    const rho = t * tan + 1.5;
    const [ax, ay] = at(t, 0, rho);
    const [bx, by] = at(t, Math.PI / 2, rho);
    const R = Math.max(2, Math.hypot(ax - bx, ay - by));
    const N = Math.max(12, Math.ceil(R * 2 * Math.PI * step));
    for (const [r, c] of layers) {
      for (let k = 0; k < N; k++) {
        if (!keep(k + Math.round(t) * 31)) continue;
        const [x, y] = at(t, (k / N) * Math.PI * 2, rho);
        if (r <= 0.5) put(px, x, y, c);
        else disc(px, x, y, r, c);
      }
    }
  };
  ring(front * 0.45, [[0.9, cols[1]], [0.5, cols[2]]], 0.6);
  ring(front * 0.72, [[1.4, cols[0]], [0.9, cols[1]], [0.5, cols[3]]], 0.8);
  ring(front, [[2.8, cols[0]], [2.1, cols[1]], [1.4, cols[2]], [0.9, cols[3]], [0.5, cols[4]]], 1.4);
  // (its heart at the front, a flash while it is new)
  if (age <= 2) {
    const [x, y] = at(front, 0, 0);
    const r = Math.max(1.5, front * tan * 0.35) * (age <= 1 ? 1 : 0.6);
    disc(px, x, y, r + 1, cols[3]);
    disc(px, x, y, r * 0.6, cols[4]);
  }
}

/**
 * A CRESCENT OF FORCE lying flat at a height round a centre (`o`), from `a0` to `a1` (radians, along the floor), its leading
 * edge `r` out: thick in its middle, its two horns tapering to points, `thick` deep at the most; inked round, its colour, a
 * glow and a white-hot core along its leading edge. `gone` (0 to 1) breaks it up as it dies. `keep` says which stretch of it
 * is painted now (a crescent round him is painted behind him where it is behind him, in front where it is in front).
 */
export function crescent(px: Px, to: To, o: V3, a0: number, a1: number, r: number, thick: number, cols: readonly string[], gone = 0, seed = 0, keep?: (q: V3) => boolean, r0?: number): void {
  if (r <= 1 || Math.abs(a1 - a0) < 0.02 || gone >= 1) return;
  const to3 = to;
  const N = Math.max(8, Math.ceil(r * Math.abs(a1 - a0) * 2.4));
  type S = { x: number; y: number; ox: number; oy: number; rad: number; on: boolean };
  const pts: S[] = [];
  for (let k = 0; k <= N; k++) {
    const s = k / N;
    const a = a0 + (a1 - a0) * s;
    const t = thick * Math.pow(Math.sin(Math.PI * s), 0.65);
    if (t < 0.4) continue;
    const c = Math.cos(a);
    const sn = Math.sin(a);
    const outer: V3 = [o[0] + c * r, o[1] + sn * r, o[2]];
    const mid: V3 = [o[0] + c * (r - t / 2), o[1] + sn * (r - t / 2), o[2]];
    const inner: V3 = [o[0] + c * (r - t), o[1] + sn * (r - t), o[2]];
    const [ox, oy] = to(outer);
    const [mx, my] = to(mid);
    const [ix, iy] = to(inner);
    const rad = Math.max(0.7, Math.hypot(ox - ix, oy - iy) / 2, t * 0.22);
    pts.push({ x: mx, y: my, ox, oy, rad, on: (keep ? keep(mid) : true) && (gone <= 0 || rnd(seed + k) > gone) });
  }
  // (streaks of air left behind it, out along the way it goes, from where it was thrown)
  if (gone < 0.7 && r0 !== undefined && r - thick > r0 + 4) {
    const n = Math.max(4, Math.round((Math.abs(a1 - a0) * 180) / Math.PI / 9));
    for (let i = 0; i <= n; i++) {
      const s = (i + 0.5 * rnd(seed + 300 + i)) / (n + 0.5);
      const t = Math.pow(Math.sin(Math.PI * s), 0.65);
      if (t < 0.3) continue;
      const a = a0 + (a1 - a0) * s;
      const from = r0 + (r - thick - r0) * (0.15 + 0.45 * rnd(seed + 400 + i));
      const to = r - thick * t * 0.6;
      const N = Math.ceil((to - from) * 1.6);
      for (let k = 0; k <= N; k++) {
        const rr = from + ((to - from) * k) / N;
        const q: V3 = [o[0] + Math.cos(a) * rr, o[1] + Math.sin(a) * rr, o[2]];
        if (keep && !keep(q)) continue;
        const [x, y] = to3(q);
        put(px, x, y, k / N < 0.5 ? cols[2] : cols[3]);
      }
    }
  }
  const layers: [number, string, number][] = [[1.6, cols[0], 0], [0.8, cols[1], 0], [0, cols[2], 0.25], [-1.4, cols[3], 0.5], [-2.8, cols[4], 0.75]];
  for (const [grow, c, lean] of layers) {
    for (const p of pts) {
      if (!p.on) continue;
      const rr = p.rad + grow * Math.min(1, p.rad / 2.2);
      if (rr <= 0.35) continue;
      // (the bright layers drawn toward the leading edge)
      disc(px, p.x + (p.ox - p.x) * lean, p.y + (p.oy - p.y) * lean, rr, c);
    }
  }
}

/** WHERE A CRESCENT IS OVER THE FLOOR: a faint line of its colour along the floor under its leading edge (so its reach reads). */
export function floorTrace(px: Px, to: To, o: V3, a0: number, a1: number, r: number, c: string, gone = 0): void {
  if (r <= 1 || gone >= 1) return;
  const N = Math.max(8, Math.ceil(r * Math.abs(a1 - a0) * 2.4));
  for (let k = 0; k <= N; k++) {
    if (k % 3 === 2) continue;
    if (gone > 0 && rnd(k * 3 + 1) < gone) continue;
    const a = a0 + ((a1 - a0) * k) / N;
    put(px, ...to([o[0] + Math.cos(a) * r, o[1] + Math.sin(a) * r, 0]), c);
  }
}
