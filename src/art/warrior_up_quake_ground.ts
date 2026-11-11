// THE WARRIOR'S EARTHQUAKE: THE GROUND QUAKING (the art chat's helper, 11 Nov 2026; docs/mockups/warrior_weapons/README.md, step
// 3c). His word on the Earthquake (a full spin, then down): “Earthquake still not right”, and his pick, “The ground should really
// quake (Recommended)” (offered as: cracks running out, the floor slabs heaving up in a ring, and dust). Drawn here IN PLACE OF
// THE GAME'S THIN SLAM RING. A MOCK-UP BEHIND A SWITCH THAT IS OFF (art/warrior_up_weapons.ts WARRIOR_WEAPONS): nothing of the
// game imports this file (tests/warrior_weapons.test.ts holds it).
//
// Painted in code, at the game's own size (two picture pixels to a game pixel), on the floor's own plane as the game lays it
// (render/fx.ts wx, wy: a tile is 32 game pixels across the screen and 16 down, so a ring on the floor is an ellipse twice as
// wide as it is tall), in the floor's stone and the game's ink (art/palette.ts P.st1 to P.st7, P.ink, P.black: as the game's
// own cracked floor and dust are drawn, render/fx.ts and render/wild.ts landing), so it sits on any floor; the only light the
// friend's cyan, thin, on the wave's crest in its first frames. Every pixel whole.
//
// For each quake (the Earthquake's one; Tremors' three, each wider and weaker), anchored at the mark (where the maul's face
// struck, the ring's middle), 30 pictures a second:
//   CRACKS  (under everyone) forked and jagged breaks in the stone running out from the mark, longest along the way he struck:
//           3 pictures as they tear open, for each of his eight sides (the way he struck); the game keeps the last and lets it
//           fade as its own cracked floor does
//   UNDER   (under everyone) THE HEAVE: a ridge of flagstones lifting and tilting as a wave runs out through the floor to the
//           ring's edge (0.35 s), their lifted edges lit and dark gaps under them, each dropping back as the wave passes on;
//           then the floor still (30 pictures, 1 s)
//   OVER    (before what stands there) the grit thrown up at the blow, the dust off the ridge hanging and thinning, a few small
//           stones hopping and coming to rest (30 pictures, 1 s)

import type { Light, Sprite } from '../engine/px';
import { Px } from '../engine/px';
import { GRAIN, lazyFrames, toSprite } from './kit';
import { P } from './palette';
import { WU_SIDES } from './warrior_up';
import type { WuSide } from './warrior_up';
import { HAMMER_QUAKE_ROLL, HAMMER_QUAKE_ROUND, HAMMER_TREMORS } from './warrior_up_hammer_moves';

const FPS = 30;
/** How many pictures each quake's heave and its dust are (1 s: the heave 0.35 s, the settling after). */
export const QUAKE_FRAMES = 30;
/** How many pictures the cracks tear open in (the game keeps the last). */
export const QUAKE_CRACK_FRAMES = 3;
/** How long the game keeps the cracks after the blow, and the share of it at the end over which they fade (as its own). */
export const QUAKE_CRACKS_LAST = { seconds: 2.4, fade: 0.4 } as const;
/** The quakes: the Earthquake's (the first), and Tremors' second and third: how far round (tiles) and how strong (0..1). */
export const QUAKES: readonly { round: number; strength: number }[] = HAMMER_TREMORS.weaker.map((w, i) => ({ round: HAMMER_QUAKE_ROUND + i * HAMMER_TREMORS.wider, strength: w }));
/** How high the ridge stands at its full (picture pixels), and how wide it is (tiles, either side of its crest). */
const RIDGE_HIGH = 12;
const RIDGE_WIDE = 0.3;
/** The size of a flagstone (tiles) and the gap between two. */
const SLAB = 0.42;
const GAP = 0.06;
/** The friend's cyan on the crest's first frames (art/kit.ts SPARK). */
const CREST = '#22d0e0';

/** A little sequence of numbers that is the same every time. */
function seeded(n: number): () => number {
  let x = (n * 2654435761 + 97) >>> 0;
  return () => {
    x = (x * 1664525 + 1013904223) >>> 0;
    return x / 4294967296;
  };
}

/** The canvas a quake is painted on, and the mark in it (picture pixels). */
function canvasOf(round: number): { w: number; h: number; ax: number; ay: number } {
  const half = Math.ceil((round + 0.6) * 32 * Math.SQRT2) + 8;
  const halfH = Math.ceil((round + 0.6) * 16 * Math.SQRT2) + 40;
  return { w: 2 * half, h: 2 * halfH, ax: half, ay: halfH + 16 };
}
/** A point on the floor (tiles from the mark, along the floor's own two ways) on the canvas. */
const on = (c: { ax: number; ay: number }, u: number, v: number): [number, number] => [c.ax + (u - v) * 32, c.ay + (u + v) * 16];

/** Where the wave is at a moment (tiles from the mark), and how strong it still is (0..1). */
export function waveAt(q: { round: number; strength: number }, frame: number): { r: number; k: number } {
  const t = frame / FPS;
  const r = q.round * Math.min(1, t / HAMMER_QUAKE_ROLL);
  // (it rises out of the blow, runs at its full out to the edge, and dies there over a tenth of a second and a half)
  const rise = Math.min(1, (t + 1 / FPS) / 0.1);
  const die = t <= HAMMER_QUAKE_ROLL ? 1 : Math.max(0, 1 - (t - HAMMER_QUAKE_ROLL) / 0.16);
  return { r, k: q.strength * rise * die };
}

/** Fill a four-cornered shape (picture pixels) with one colour, keeping to whole pixels. */
function fillQuad(px: Px, pts: [number, number][], col: string): void {
  const ys = pts.map((p) => p[1]);
  const y0 = Math.floor(Math.min(...ys));
  const y1 = Math.ceil(Math.max(...ys));
  for (let y = y0; y <= y1; y++) {
    const yc = y + 0.5;
    const xs: number[] = [];
    for (let i = 0; i < pts.length; i++) {
      const [ax, ay] = pts[i];
      const [bx, by] = pts[(i + 1) % pts.length];
      if ((ay <= yc && by > yc) || (by <= yc && ay > yc)) xs.push(ax + ((yc - ay) / (by - ay)) * (bx - ax));
    }
    xs.sort((a, b) => a - b);
    for (let i = 0; i + 1 < xs.length; i += 2) for (let x = Math.round(xs[i]); x < Math.round(xs[i + 1]); x++) if (x >= 0 && y >= 0 && x < px.w && y < px.h) px.set(x, y, col);
  }
}
/** A line of whole pixels. */
function line(px: Px, x0: number, y0: number, x1: number, y1: number, col: string): void {
  const n = Math.max(1, Math.ceil(Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0))));
  for (let i = 0; i <= n; i++) {
    const x = Math.round(x0 + ((x1 - x0) * i) / n - 0.5);
    const y = Math.round(y0 + ((y1 - y0) * i) / n - 0.5);
    if (x >= 0 && y >= 0 && x < px.w && y < px.h) px.set(x, y, col);
  }
}

/**
 * THE HEAVE, a picture: the flagstones the wave is under lifted and tilted (each corner as high as the wave is there), drawn
 * from the back to the front: the dark gap where each stood, then its top, lit where it is lifted most, its edges inked; on
 * the wave's first frames its crest has a thin line of the friend's cyan.
 */
export function paintUnder(qi: number, frame: number): { px: Px; lights: Light[] } {
  const q = QUAKES[qi];
  const c = canvasOf(q.round);
  const px = new Px(c.w, c.h);
  const wave = waveAt(q, frame);
  const lights: Light[] = [];
  if (wave.k > 0.02) {
    const r = seeded(qi * 131 + 7);
    // (the flagstones round the mark: broken into rings of stones, each ring's stones its own lengths, a little crooked)
    const stones: { pts: [number, number][]; d: number; f: number; tip: number[] }[] = [];
    for (let rho = 0.28; rho < q.round + 0.05; rho += SLAB * 0.72) {
      const outer = rho + SLAB * 0.72 - GAP;
      const n = Math.max(6, Math.round((2 * Math.PI * (rho + outer)) / 2 / SLAB));
      const off = r() * Math.PI * 2;
      for (let k = 0; k < n; k++) {
        const t0 = off + ((k + (r() - 0.5) * 0.3) / n) * Math.PI * 2;
        const t1 = off + ((k + 1 + (r() - 0.5) * 0.3) / n) * Math.PI * 2 - GAP / Math.max(0.3, rho);
        const tm = (t0 + t1) / 2;
        const j = (): number => (r() - 0.5) * 0.05;
        const pts: [number, number][] = [
          [rho + j(), t0], [outer + j(), t0 + 0.02], [outer + 0.02 + j(), tm], [outer + j(), t1 - 0.02], [rho + j(), t1], [rho - 0.02 + j(), tm],
        ].map(([d, th]) => [d * Math.cos(th), d * Math.sin(th)]);
        stones.push({ pts, d: (rho + outer) / 2, f: 0.6 + 0.65 * r(), tip: [0, 1, 2, 3, 4, 5].map(() => (r() - 0.5) * 5) });
      }
    }
    // (back to front on the screen: by u + v of each stone's middle)
    const midOf = (s0: { pts: [number, number][] }): number => s0.pts.reduce((m, [u, v]) => m + u + v, 0) / s0.pts.length;
    stones.sort((a0, b0) => midOf(a0) - midOf(b0));
    const lift = (u: number, v: number): number => {
      const d = Math.hypot(u, v);
      if (d > q.round + 0.05 || d < 0.2) return 0;
      const x = (d - wave.r) / RIDGE_WIDE;
      // (steeper before the crest than behind it: the stones heave up ahead and fall back after)
      const h = x > 0 ? Math.exp(-x * x * 3) : Math.exp(-x * x * 1.4);
      return RIDGE_HIGH * wave.k * h;
    };
    for (const st of stones) {
      // (each stone heaved its own way: some higher, each tipped a little crooked)
      const hs = st.pts.map(([u, v], k) => { const h = lift(u, v) * st.f; return h > 0.8 ? Math.max(0.5, h + st.tip[k] * wave.k) : h; });
      const top = Math.max(...hs);
      if (top < 1.2) continue;
      const floor = st.pts.map(([u, v]) => on(c, u, v));
      const raised = floor.map(([x, y], k) => [x, y - hs[k]] as [number, number]);
      const m = floor.length;
      // (the dark where it stood, and its broken sides)
      fillQuad(px, floor, P.black);
      for (let k = 0; k < m; k++) fillQuad(px, [floor[k], floor[(k + 1) % m], raised[(k + 1) % m], raised[k]], (raised[k][1] + raised[(k + 1) % m][1]) / 2 > (raised[0][1] + raised[3][1]) / 2 ? P.st2 : P.st1);
      // (its top, lighter the higher it is)
      fillQuad(px, raised, top > RIDGE_HIGH * 0.7 ? P.st5 : top > RIDGE_HIGH * 0.35 ? P.st4 : P.st3);
      // (its lifted edge lit: the edge between its two highest corners next to each other)
      let best = 0;
      for (let k = 0; k < m; k++) if (hs[k] + hs[(k + 1) % m] > hs[best] + hs[(best + 1) % m]) best = k;
      const A = raised[best];
      const Bq = raised[(best + 1) % m];
      line(px, A[0], A[1], Bq[0], Bq[1], top > RIDGE_HIGH * 0.8 ? P.st7 : top > RIDGE_HIGH * 0.4 ? P.st6 : P.st5);
      // (its near edges inked, where it stands over the dark)
      for (let k = 0; k < m; k++) {
        const [x0, y0] = raised[k];
        const [x1, y1] = raised[(k + 1) % m];
        if (Math.max(y0, y1) >= Math.max(...raised.map((p0) => p0[1])) - 1.5) line(px, x0, y0 + 1, x1, y1 + 1, P.ink);
      }
      // (the crest's light, the friend's cyan, thin, on its first frames, on the stones standing highest)
      if (frame <= 3 && top > RIDGE_HIGH * wave.k * 0.9) line(px, A[0], A[1] - 1, Bq[0], Bq[1] - 1, CREST);
    }
    if (frame <= 4) {
      const [lx, ly] = on(c, wave.r * 0.7, wave.r * 0.7);
      lights.push({ x: lx, y: ly, r: 30, color: CREST, a: 0.12 * q.strength });
    }
  }
  return { px, lights };
}

/** The cracks, for the way he struck (`aim`, radians on the floor) and how far they have torn (0..1): forked, jagged breaks. */
export function paintCracks(qi: number, aim: number, grown: number): { px: Px; lights: Light[] } {
  const q = QUAKES[qi];
  const c = canvasOf(q.round);
  const px = new Px(c.w, c.h);
  const r = seeded(qi * 977 + 31);
  const main = Math.round(4 + 4 * q.strength);
  const wide = q.strength > 0.8;
  const paths: [number, number][][] = [];
  const grow = (u0: number, v0: number, a: number, long: number, depth: number): void => {
    const pts: [number, number][] = [[u0, v0]];
    const steps = Math.max(2, Math.round(long / 0.16));
    let u = u0;
    let v = v0;
    let dir = a;
    for (let i = 1; i <= steps; i++) {
      dir += (r() - 0.5) * 0.9;
      const step = long / steps;
      u += Math.cos(dir) * step;
      v += Math.sin(dir) * step;
      pts.push([u, v]);
      // (a fork now and then, shorter, at a slant)
      if (depth < 2 && r() < 0.18) grow(u, v, dir + (r() < 0.5 ? -1 : 1) * (0.5 + r() * 0.5), (long - (i * long) / steps) * (0.4 + r() * 0.3), depth + 1);
    }
    paths.push(pts);
  };
  for (let k = 0; k < main; k++) {
    const a = aim + (k / main) * Math.PI * 2 + (r() - 0.5) * 0.7;
    // (longest along the way he struck)
    const along = Math.cos(a - aim);
    const long = q.round * (0.3 + 0.28 * Math.max(0, along) + 0.12 * r()) * (0.7 + 0.3 * q.strength);
    grow(Math.cos(a) * 0.06, Math.sin(a) * 0.06, a, long, 0);
  }
  for (const pts of paths) {
    const upto = Math.max(1, Math.ceil((pts.length - 1) * grown));
    for (let i = 0; i < upto; i++) {
      const [x0, y0] = on(c, ...pts[i]);
      const [x1, y1] = on(c, ...pts[i + 1]);
      line(px, x0, y0 + 1, x1, y1 + 1, P.black);
      if (wide && i < upto * 0.5) line(px, x0 + 1, y0, x1 + 1, y1, P.st1);
      line(px, x0, y0, x1, y1, P.ink);
    }
  }
  // (the stone broken under the face: a small dark hollow at the mark)
  const [mx, my] = on(c, 0, 0);
  for (let y = -2; y <= 2; y++) for (let x = -4; x <= 4; x++) if ((x / 4.5) ** 2 + (y / 2.3) ** 2 < 1) px.set(Math.round(mx + x), Math.round(my + y), Math.abs(y) < 1 && Math.abs(x) < 3 ? P.black : P.st1);
  return { px, lights: [] };
}

/**
 * THE DUST, THE GRIT AND THE STONES, a picture: the grit thrown up out of the blow (its first few frames); dust off the ridge
 * where the wave has passed, rising a little, spreading, thinning and going (pixel by pixel, never half see-through); a few small
 * stones thrown up off the ridge and hopping to rest.
 */
export function paintOver(qi: number, frame: number): { px: Px; lights: Light[] } {
  const q = QUAKES[qi];
  const c = canvasOf(q.round);
  const px = new Px(c.w, c.h);
  const t = frame / FPS;
  const r = seeded(qi * 53 + 3);
  const dot = (x: number, y: number, col: string, big = false): void => {
    for (const [dx, dy] of big ? [[0, 0], [1, 0], [0, 1], [1, 1]] : [[0, 0]]) {
      const X = Math.round(x) + dx;
      const Y = Math.round(y) + dy;
      if (X >= 0 && Y >= 0 && X < px.w && Y < px.h) px.set(X, Y, col);
    }
  };
  // THE GRIT out of the blow
  const grit = Math.round(18 * q.strength) + 4;
  for (let i = 0; i < grit; i++) {
    const a = r() * Math.PI * 2;
    const v = 0.9 + r() * 1.6;
    const up = 50 + r() * 70;
    const life = 0.25 + r() * 0.2;
    if (t > life) continue;
    const [x, y] = on(c, Math.cos(a) * v * t, Math.sin(a) * v * t);
    dot(x, y - (up * t - 320 * t * t), i % 3 === 0 ? P.st7 : P.st5, i % 4 === 0);
  }
  // THE DUST off the ridge: puffs where the wave has been, each its own, rising, spreading and thinning
  const puffs = Math.round(44 * q.strength * (q.round / 2)) + 8;
  for (let i = 0; i < puffs; i++) {
    const a = r() * Math.PI * 2;
    const d = (0.35 + r() * 0.65) * q.round;
    const born = (d / q.round) * HAMMER_QUAKE_ROLL;
    const life = 0.45 + r() * 0.5;
    const age = (t - born) / life;
    const seedP = r();
    if (age < 0 || age > 1) continue;
    const [x0, y0] = on(c, Math.cos(a) * d, Math.sin(a) * d);
    const rise = 6 + 10 * age;
    const size = (3 + 5 * Math.sqrt(age)) * (0.6 + 0.4 * q.strength);
    const rp = seeded(i * 17 + Math.floor(seedP * 1000));
    // (thinner as it ages: fewer of its grains drawn)
    const grains = Math.round((16 + 22 * q.strength) * (1 - age * 0.85));
    for (let g = 0; g < grains; g++) {
      const ga = rp() * Math.PI * 2;
      const gd = Math.sqrt(rp()) * size;
      dot(x0 + Math.cos(ga) * gd * 1.6, y0 - rise + Math.sin(ga) * gd * 0.8, age < 0.35 ? P.st6 : age < 0.7 ? P.st5 : P.st4);
    }
  }
  // THE STONES hopping off the ridge and coming to rest
  const stones = Math.round(7 * q.strength) + 2;
  for (let i = 0; i < stones; i++) {
    const a = r() * Math.PI * 2;
    const d0 = (0.4 + r() * 0.5) * q.round;
    const born = (d0 / q.round) * HAMMER_QUAKE_ROLL;
    const s = t - born;
    if (s < 0) continue;
    const out = 0.25 + r() * 0.35;
    const hop = (9 + r() * 10) * (0.5 + 0.5 * q.strength);
    // (two hops, the second smaller, then still)
    const T1 = 0.32;
    const T2 = 0.2;
    let h = 0;
    let along = 0;
    if (s < T1) { const k = s / T1; h = hop * 4 * k * (1 - k); along = out * 0.7 * k; } else if (s < T1 + T2) { const k = (s - T1) / T2; h = hop * 0.35 * 4 * k * (1 - k); along = out * (0.7 + 0.3 * k); } else along = out;
    const d = d0 + along;
    const [x, y] = on(c, Math.cos(a) * d, Math.sin(a) * d);
    dot(x, y - h - 1, P.st6, true);
    px.set(Math.round(x) + 1, Math.round(y - h), P.ink);
  }
  return { px, lights: [] };
}

/** The way he struck, on the floor, for each of his eight sides (radians on the floor's own two ways: render/fx.ts wx, wy). */
export function aimOf(side: WuSide): number {
  // (art/warrior_up_art.ts wuFacing: front is down and to the right of the screen, the floor's +x; then round by 45 degrees)
  const i = WU_SIDES.indexOf(side);
  const turn = [0, 1, 2, 3, 4, 5, 6, 7][i];
  return (turn * Math.PI) / 4;
}

/** One quake's pictures as the game holds them, anchored at the mark: `under` and `over` (30 each, 1 s), and the cracks (3) for
 * each of his eight sides. */
export interface QuakeGround {
  under: Sprite[];
  over: Sprite[];
  cracks: Record<WuSide, Sprite[]>;
  /** How far round it reaches (tiles), and how strong. */
  round: number;
  strength: number;
}
/** The Earthquake's quake (`quakeGround(0)`), and Tremors' second and third (1, 2): the first is the same for both. */
export function quakeGround(qi: number): QuakeGround {
  const c = canvasOf(QUAKES[qi].round);
  const cracks = {} as Record<WuSide, Sprite[]>;
  for (const side of WU_SIDES) cracks[side] = lazyFrames(QUAKE_CRACK_FRAMES, (i) => toSprite(paintCracks(qi, aimOf(side), [0.45, 0.8, 1][i]), null, c.ax, c.ay));
  return {
    under: lazyFrames(QUAKE_FRAMES, (i) => toSprite(paintUnder(qi, i), null, c.ax, c.ay)),
    over: lazyFrames(QUAKE_FRAMES, (i) => toSprite(paintOver(qi, i), null, c.ax, c.ay)),
    cracks,
    round: QUAKES[qi].round,
    strength: QUAKES[qi].strength,
  };
}
void GRAIN;
