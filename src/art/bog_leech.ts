// THE BOG LEECHES, floor 10's tiny mob (the Sunken Fen), in packs as the bats (6 to 10). His brief, two pop-ups,
// 15 Oct, by 23:35:
// - what they are: “Fat swamp leeches (Recommended)”, offered as: slick, ringed bodies, black-green, as long as a
//   forearm, glistening wet;
// - how big: “Tiny, in swarms (Recommended)”, offered as: knee-high to the knight when they rear; 6 to 10 a pack,
//   like the bats; fun to smash, sickening up close;
// - how they move: “Slithering like snakes” (not the recommended pick), offered as: low, wriggling, fast;
// - what you know them by: “A round mouth of teeth (Recommended)”, offered as: as it rears, a ring of hooked teeth
//   flares open on a pink gullet;
// - their one attack: “Leap, latch on, suck (Recommended)”, offered as: it rears and quivers, mouth flaring (the
//   warning), springs at you, clamps on and swells, then drops off fat;
// - how they die: “Burst in a dark splash (Recommended)”, offered as: popping in a splash of dark blood and bog
//   water;
// - never: “Not a cartoon worm (Recommended)”, offered as: no googly eyes or smiles; slimy and horrible up close;
// - their sound: “Wet squelches, a sucking slurp (Recommended)”.
//
// Not a body of bones: its own solids, frame by frame, as the rubbling (art/floor6_mobs.ts). Its body is a chain of
// ringed segments along a spine of points; its head end opens into the round mouth. Its gullet's pink is the
// enemy's, and gives the enemy's light while its mouth is open. Nothing of it glows cyan.
//
// Its look and stand have his yes (by 23:46): “Yes, animate it (Recommended)”. Its moves: its slither, its leap and
// latch, struck, its burst.

import type { Sprite } from '../engine/px';
import type { ActorArt, AnimSet, Clip } from './actor_types';
import { hash, lazyFrames, toSprite } from './kit';
import type { Painted, Ramp } from './kit';
import { ENEMY_RIM, FLAME } from './mkit';
import { TILE3, paintBits } from './new_mobs3';
import type { Bit, Put } from './new_mobs3';
import { stage } from './skin';
import type { GameView } from './skin';
import { add, cross, lerp3, mul, norm, sub } from './skeleton';
import type { V3 } from './skeleton';

/** THE SWITCH, OFF: nothing of the game reads this file. */
export const LEECH_ON = { on: false };

const clamp01 = (v: number): number => Math.max(0, Math.min(1, v));
const smooth = (u: number): number => {
  const k = clamp01(u);
  return k * k * (3 - 2 * k);
};

// =============================================================================================
// ITS LOOK

/** Its canvas, and its floor point on it (the middle of its body on the floor). */
export const BL_CANVAS = { w: 200, h: 150, ax: 92, ay: 108 };
/** How long its body is along its spine, in the figure's own lengths (the knight is 58 tall); how many segments. */
export const BL_LONG = 40;
const BL_N = 14;
const SEG = BL_LONG / BL_N;
/** How high its mouth is when it rears (the knight's knee). */
export const BL_REAR = 16;

/** Its skin: black-green, wet. */
const SKIN: Ramp = ['#070b08', '#070b08', '#121c14', '#1f2e1e', '#34492e'];
/** Its belly, paler. */
const BELLY: Ramp = ['#121812', '#121812', '#262f25', '#3a4636', '#56644c'];
/** Its two stripes down its back, dull olive, broken. */
const STRIPE = ['#3a3418', '#3a3418', '#5a4f22', '#7a6a2c', '#94823a'];
/** The wet glint on it. */
const GLINT = '#a3bd92';
/** Its gullet: the enemy's pink, deep in its mouth; the dark of its throat. */
export const GULLET: Ramp = ['#4a1028', '#4a1028', '#86244c', '#bd3d6c', '#e8679a'];
const THROAT = '#1a0610';
/** Its skin stretched over the blood it has drunk: dark wine. */
const FED: Ramp = ['#1c0710', '#1c0710', '#330d1a', '#4c1426', '#6a2236'];
/** Its lips, round the mouth. */
const LIP: Ramp = ['#0c0a0c', '#0c0a0c', '#1f1a1c', '#33302e', '#4c4a42'];

/** How thick it is along its length, head (0) to tail (1): narrow at its head, fattest behind its middle, its tail a broad sucker. */
function girth(u: number): number {
  const pts: [number, number][] = [[0, 2.9], [0.1, 3.0], [0.28, 3.7], [0.55, 4.9], [0.75, 4.8], [0.9, 3.8], [1, 3.2]];
  for (let i = 1; i < pts.length; i++) {
    if (u <= pts[i][0]) {
      const [u0, r0] = pts[i - 1];
      const [u1, r1] = pts[i];
      return r0 + (r1 - r0) * smooth((u - u0) / (u1 - u0));
    }
  }
  return pts[pts.length - 1][1];
}

/**
 * A POSE of the leech: its spine, head first (BL_N + 1 points, in its own lengths from its floor point: forward,
 * left, up); its mouth (0 shut to 1 flared wide); how fat it is (0 as it is, 1 gorged); a bulge running down it
 * (where, head 0 to tail 1, and how big); flattened against the floor where it lies.
 */
export interface LeechPose {
  spine: V3[];
  gape: number;
  fat: number;
  bulge?: [number, number];
  /** Squashed flat, as it lands (0 not, 1 flat). */
  squash?: number;
}

/** THE LEECH AS SOLIDS: its ringed body, its tail's sucker, its round mouth and teeth; the light of its gullet. */
function leechBits(p: LeechPose, t: number, put: Put): void {
  const S = p.spine;
  const n = S.length - 1;
  const sq = p.squash ?? 0;
  for (let i = 0; i < n; i++) {
    const a = S[i];
    const b = S[i + 1];
    const u = (i + 0.5) / n;
    const f = norm(sub(a, b), [1, 0, 0]);
    const side = Math.abs(f[2]) > 0.94 ? [0, 1, 0] as V3 : norm(cross([0, 0, 1], f), [0, 1, 0]);
    const up = cross(f, side);
    const bul = p.bulge ? Math.max(0, 1 - Math.abs(u - p.bulge[0]) / 0.14) * p.bulge[1] : 0;
    const r = girth(u) * (1 + 0.45 * p.fat * Math.sin(Math.PI * Math.min(1, u * 1.15)) + 0.35 * bul) * (1 + 0.3 * sq);
    const c = lerp3(a, b, 0.5);
    // (flat underneath where it lies on the floor: its middle lifted to sit on it)
    const lying = clamp01(1 - c[2] / 3);
    const flat = 0.78 - 0.12 * lying - 0.25 * sq;
    const cc: V3 = [c[0], c[1], Math.max(c[2], r * flat * lying * 0.9)];
    const len = Math.hypot(...sub(a, b));
    const seg = i;
    put('body', `seg${i}`, {
      k: 'ball',
      c: cc,
      ax: [mul(f, len * 0.9), mul(side, r), mul(up, r * flat)],
      skin: (q, tone, x, y) => {
        // (ring creases between its segments; its belly paler; two broken stripes down its back; wet glints)
        const crease = Math.abs(q[0]) > 0.93 && seg % 2 === 0 ? 1 : 0;
        const tn = Math.max(1, tone - crease);
        if (q[2] < -0.42) return BELLY[tn];
        const st = Math.abs(Math.abs(q[1]) - 0.4) < 0.1 && q[2] > 0.15;
        const fed = p.fat > 0 && hash(x, y, 812) < p.fat * 0.75 && q[2] > -0.2;
        // (the wet glint: a streak along its top where the light catches, broken here and there, running as it moves)
        if (tone >= 4 && Math.abs(q[1] + 0.12) < 0.2 && q[2] > 0.55 && hash(seg, Math.floor((q[0] + 1) * 2 + t * 3), 813) > 0.3) return GLINT;
        if (fed) return FED[tn];
        return st ? STRIPE[tn] : SKIN[tn];
      },
    });
  }
  // --- its tail's sucker, a broad disc pressed under it ---
  {
    const a = S[n];
    const b = S[n - 1];
    const f = norm(sub(b, a), [1, 0, 0]);
    const side = Math.abs(f[2]) > 0.94 ? [0, 1, 0] as V3 : norm(cross([0, 0, 1], f), [0, 1, 0]);
    const up = cross(f, side);
    const r = girth(1) * 1.05 * (1 + 0.3 * sq);
    const c: V3 = [a[0], a[1], Math.max(a[2], 0.9)];
    put('body', 'sucker', { k: 'ball', c, ax: [mul(f, r * 0.75), mul(side, r), mul(up, r * 0.55)], skin: (q, tone) => (q[2] < -0.3 ? BELLY[Math.max(1, tone - 1)] : SKIN[Math.max(1, tone - (Math.abs(q[0]) > 0.7 ? 1 : 0))]) });
  }
  // --- ITS ROUND MOUTH: a disc at its head, its lips; flared open, the pink gullet and its dark throat, a ring of hooked teeth ---
  const h = S[0];
  const d = norm(sub(S[0], S[1]), [1, 0, 0]);
  const side = Math.abs(d[2]) > 0.94 ? [0, 1, 0] as V3 : norm(cross([0, 0, 1], d), [0, 1, 0]);
  const up = cross(d, side);
  const g = clamp01(p.gape);
  const rm = girth(0) * (1.05 + 0.75 * g);
  const mc = add(h, mul(d, 0.35 + 0.4 * g));
  put('body', 'mouth', {
    k: 'ball',
    c: mc,
    ax: [mul(d, 0.9 + 0.3 * g), mul(side, rm), mul(up, rm * (0.85 + 0.15 * g))],
    skin: (q, tone) => {
      const rho = Math.hypot(q[1], q[2]);
      if (q[0] < 0.2) return SKIN[Math.max(1, tone - 1)];
      if (g > 0.12) {
        if (rho < 0.42 * g) return THROAT;
        if (rho < 0.8) return GULLET[Math.min(4, tone + (rho < 0.55 ? 1 : 0))];
      }
      return LIP[tone];
    },
  });
  if (g > 0.12) {
    // (its teeth: a ring of them round the gullet, hooked in toward its throat)
    const pts: V3[] = [];
    const facing: V3[] = [];
    const k = 11;
    for (let i = 0; i < k; i++) {
      const a = (i / k) * Math.PI * 2 + 0.2;
      const ring = add(mul(side, Math.cos(a) * rm * 0.66), mul(up, Math.sin(a) * rm * 0.66 * (0.85 + 0.15 * g)));
      pts.push(add(add(mc, mul(d, 0.95)), ring));
      facing.push(add(d, mul(norm(ring, side), 0.3)));
    }
    put('body', 'teeth', { k: 'teeth', pts, facing });
    if (g > 0.35) put('glow', 'glow', { k: 'glow', p: add(mc, mul(d, 1.2)), c: FLAME[1], r: 5 + 6 * g, a: Math.min(0.5, 0.15 + 0.35 * g) });
  }
}

/** A grain laid on its finished picture (wet drops: no edge round them). */
type Grain = [V3, string, number];

/** One frame of the leech from a pose, with its grains, living (its pink edge) or not. */
function paintLeech(view: GameView, p: LeechPose, t: number, grains: Grain[], living: boolean): Painted {
  const st = stage(view, BL_CANVAS.ax, BL_CANVAS.ay, BL_CANVAS);
  const bits: Bit[] = [];
  const put: Put = (part, piece, shape) => bits.push({ part, piece, shape });
  leechBits(p, t, put);
  const lights = paintBits(st, bits, p.spine[Math.floor(p.spine.length / 2)]);
  const px = st.whole(living ? ENEMY_RIM : null);
  for (const [pt, col, size] of grains) {
    const [x, y] = st.at(pt);
    const xi = Math.round(x - 0.5);
    const yi = Math.round(y - 0.5);
    for (let dy = 0; dy < size; dy++) for (let dx = 0; dx < size; dx++) if (xi + dx >= 0 && yi + dy >= 0 && xi + dx < px.w && yi + dy < px.h) px.set(xi + dx, yi + dy, col);
  }
  return { px, lights };
}

// =============================================================================================
// HOW ITS BODY LIES

/**
 * A spine traced as a turtle walks, from its tail forward: each step SEG long, turned `yaw(u)` (radians, toward its
 * left) and tipped up `pitch(u)` (u: 0 at its head to 1 at its tail), then laid so its middle on the floor is at its
 * floor point (or as `at` says). Head first.
 */
function turtle(yaw: (u: number) => number, pitch: (u: number) => number, at: V3 | null = null): V3[] {
  const pts: V3[] = [[0, 0, 0]];
  for (let i = BL_N - 1; i >= 0; i--) {
    const u = (i + 0.5) / BL_N;
    const y = yaw(u);
    const pz = pitch(u);
    const last = pts[pts.length - 1];
    pts.push([last[0] + SEG * Math.cos(pz) * Math.cos(y), last[1] + SEG * Math.cos(pz) * Math.sin(y), last[2] + SEG * Math.sin(pz)]);
  }
  pts.reverse();
  // (its middle on the floor: where it lies, between its tail and where it rears)
  const low = pts.filter((q) => q[2] < 1.5);
  const mid = (low.length ? low : pts).reduce((s, q) => add(s, q), [0, 0, 0] as V3);
  const m = mul(mid, 1 / (low.length || pts.length));
  const o: V3 = at ?? [0, 0, 0];
  return pts.map((q) => [q[0] - m[0] + o[0], q[1] - m[1] + o[1], q[2]]);
}

// =============================================================================================
// ITS STAND

/** Its stand: a 1.6 s round. */
export const BL_STAND = 1.6;
/**
 * ITS STAND: coiled in an S on the floor, writhing, the front of it reared like a snake's, its head weaving and
 * sniffing for you; once a round its mouth flares open on its teeth and shuts; a swallow running down it; wet.
 */
export function standPose(t: number): LeechPose {
  const a = (t / BL_STAND) * Math.PI * 2;
  // (its mouth flares once a round, 0.9 to 1.35 s in, its head tipping up to bare it)
  const k = (((t % BL_STAND) + BL_STAND) % BL_STAND);
  const gape = k > 0.9 && k < 1.35 ? Math.sin(Math.PI * (k - 0.9) / 0.45) : 0.05;
  const rear = 1.42 + 0.06 * Math.sin(a);
  const pose = turtle(
    (u) => 0.6 * smooth((u - 0.3) / 0.25) + 0.62 * Math.sin(u * 6.0 + a * 0.5 + 0.6) * (u > 0.42 ? 1 : 0.3) + 0.6 * Math.sin(a * 2 + u * 3) * (u < 0.42 ? 1 : 0.2),
    (u) => (u < 0.44 ? rear * smooth((0.44 - u) / 0.1) - (u < 0.15 ? (rear - 0.25 - 0.6 * gape) * smooth((0.15 - u) / 0.1) : 0) : 0),
  );
  return { spine: pose, gape, fat: 0, bulge: [((t / BL_STAND) * 1.4) % 1.4, 0.7] };
}
/** Its stand's grains: water dripping off it. */
function standGrains(p: LeechPose, t: number): Grain[] {
  const out: Grain[] = [];
  for (let i = 0; i < 4; i++) {
    const s = p.spine[2 + i * 3];
    const k = (t * 1.3 + hash(i, 1, 815)) % 1;
    if (s[2] < 2.5) continue;
    out.push([[s[0], s[1], Math.max(0.2, s[2] * (1 - k))], k > 0.9 ? '#3d5048' : '#6f8a80', 1]);
  }
  return out;
}

// =============================================================================================
// ITS MOVES

/** A pose between two, point by point (its spine, its mouth, how fat). */
function blend(a: LeechPose, b: LeechPose, k: number): LeechPose {
  const w = clamp01(k);
  return {
    spine: a.spine.map((q, i) => lerp3(q, b.spine[i], w)),
    gape: a.gape + (b.gape - a.gape) * w,
    fat: a.fat + (b.fat - a.fat) * w,
    bulge: w < 0.5 ? a.bulge : b.bulge,
    squash: (a.squash ?? 0) + ((b.squash ?? 0) - (a.squash ?? 0)) * w,
  };
}
/** The same pose moved (forward, left, up). */
function moved(p: LeechPose, by: V3): LeechPose {
  return { ...p, spine: p.spine.map((q) => add(q, by)) };
}

/** ITS SLITHER: how fast (tiles a second; its slither is painted for it), its frames and their rate. */
export const BL_PACE = 2.4;
export const BL_WALK = { frames: 8, fps: 30 } as const;
/** How far it goes in a round of its slither, which is the length of the wave it lays on the floor; how wide its S. */
const BL_WAVE = (BL_PACE * TILE3 * BL_WALK.frames) / BL_WALK.fps;
const BL_SWING = 4.6;
/**
 * ITS SLITHER (his pick: slithering like snakes): its body lies on one S-shaped track on the floor, and goes along it
 * as the game carries it on, every point of it following its head; its head held up off the floor, swinging with
 * the track; low, fast.
 */
export function slitherPose(t: number): LeechPose {
  const X = BL_PACE * TILE3 * t;
  const track = (x: number): number => BL_SWING * Math.sin((2 * Math.PI * x) / BL_WAVE);
  // (from its head back along the track, a point every SEG of the way)
  const head = 15.5;
  const pts: V3[] = [];
  let x = head + X;
  let y = track(x);
  let s = 0;
  let next = 0;
  const dx = 0.04;
  // (its head held up: each step along the floor shortened by how much it climbs, so that it keeps its length)
  const lift = (i: number): number => 6.5 * Math.max(0, 1 - (i * SEG) / 14) ** 2;
  while (pts.length <= BL_N) {
    if (s >= next) {
      const i = pts.length;
      pts.push([x - X, y, lift(i)]);
      next += Math.sqrt(Math.max(0.5, SEG * SEG - (lift(i) - lift(i + 1)) ** 2));
    }
    const x2 = x - dx;
    const y2 = track(x2);
    s += Math.hypot(dx, y2 - y);
    x = x2;
    y = y2;
  }
  return { spine: pts, gape: 0.05, fat: 0, bulge: [((t * 3) % 1.4), 0.4] };
}

/** ITS LEAP AND LATCH (his pick): how long; when its mouth clamps on you (a frame of the game's thirty a second); its warning; when it lets go and lands; where it clamps on (forward of its floor point, and how high: the knight's thigh). */
export const BL_ATTACK = 1.9;
export const BL_HIT = 19 / 30;
export const BL_WARN = [0.3, 0.5] as const;
export const BL_LETGO = 1.25;
export const BL_LAND = 1.4;
export const BL_LATCH: V3 = [36, 0, 21];
/** Reared to strike: its front up to the knight's knee, its neck drawn back in an S like a cobra's, its body bunched under it, its mouth flared wide. */
function coiledPose(t: number, quiver: number): LeechPose {
  const sh = quiver * Math.sin(t * 2 * Math.PI * 14);
  const pose = turtle(
    (u) => 0.3 * smooth((u - 0.3) / 0.25) + 0.95 * Math.sin(u * 7.5 + 0.9) * (u > 0.42 ? 1 : 0.15) + 0.06 * sh * (u < 0.42 ? 1 : 0),
    (u) => (u >= 0.5 ? 0 : u >= 0.3 ? 1.45 * smooth((0.5 - u) / 0.08) : u >= 0.13 ? 1.45 + 0.45 * smooth((0.3 - u) / 0.06) : 1.9 - 1.75 * smooth((0.13 - u) / 0.06)),
  );
  return { spine: pose.map((q) => [q[0] - 3, q[1], q[2] + (q[2] > 3 ? 0.4 * sh : 0)]), gape: 1, fat: 0, bulge: [0.2, 0.9 * quiver] };
}
/** Hanging off you by its mouth (clamped on at BL_LATCH): down your leg, the rest of it on the floor, curling; swelling as it drinks. */
function hangingPose(t: number, fat: number): LeechPose {
  const L = BL_LATCH;
  const sw = Math.sin(t * 2 * Math.PI * 1.7);
  const down = L[2] - 1.0;
  const pts: V3[] = [];
  for (let i = 0; i <= BL_N; i++) {
    const s = i * SEG;
    if (s <= down) {
      const k = s / down;
      pts.push([L[0] - 0.9 - 4.5 * k * k + 0.8 * sw * k, 1.2 * Math.sin(k * 2.2 + t * 6) * k, L[2] - s * 0.97]);
    } else {
      const r = s - down;
      const a = 0.35 + r * 0.09 + 0.25 * sw;
      pts.push([L[0] - 5.4 - Math.sin(a) * r * 0.55 - r * 0.45, Math.cos(a) * r * 0.55 - r * 0.25 + 1.2 * Math.sin(r * 0.5 + t * 7), 0]);
    }
  }
  // (its head pressed to you, pumping)
  const pump = 0.6 * Math.max(0, Math.sin(t * 2 * Math.PI * 3));
  pts[0] = add(pts[0], [pump, 0, 0]);
  return { spine: pts, gape: 0.28, fat, bulge: [((t - BL_HIT) * 3) % 1, 1.2] };
}
/** Fallen off you, fat, lying in a heavy C on the floor before you. */
function droppedPose(t: number): LeechPose {
  const pose = turtle((u) => 2.4 + 2.2 * (u - 0.5) + 0.25 * Math.sin(t * 9 + u * 5), (u) => (u < 0.12 ? 0.35 * smooth((0.12 - u) / 0.12) : 0), [BL_LATCH[0] - 12, 2, 0]);
  return { spine: pose, gape: 0.15, fat: 1, bulge: [0.5, 0.3] };
}
/** ITS ATTACK: rear and quiver, mouth flared (the warning); the leap; clamped on, drinking, swelling; it lets go, drops fat, and wriggles back. */
export function attackPose(t: number): LeechPose {
  const stand0 = standPose(0);
  if (t < BL_WARN[0]) return blend(stand0, coiledPose(t, 0), smooth(t / BL_WARN[0]));
  if (t < BL_WARN[1]) return coiledPose(t, 1);
  if (t < BL_HIT) {
    // (THE LEAP: its head flung along an arc from where it reared to you; its body after it, drawn out straight, its tail leaving the floor)
    // (each point of it follows its head: back along the way its head flew, then on along where it lay coiled)
    const u = (t - BL_WARN[1]) / (BL_HIT - BL_WARN[1]);
    const from = coiledPose(BL_WARN[1], 0);
    const h0 = from.spine[0];
    const L = BL_LATCH;
    const at = (v: number): V3 => [h0[0] + (L[0] - h0[0]) * v, h0[1] + (L[1] - h0[1]) * v, h0[2] + (L[2] - h0[2]) * v + 13 * Math.sin(Math.PI * v)];
    const way: V3[] = [];
    for (let j = 0; j <= 40; j++) way.push(at(u * (1 - j / 40)));
    const path: V3[] = [...way, ...from.spine.slice(1)];
    const spine: V3[] = [path[0]];
    let need = SEG;
    let k = 0;
    let rest = 0;
    while (spine.length <= BL_N) {
      if (k >= path.length - 1) {
        spine.push(path[path.length - 1]);
        continue;
      }
      const a = path[k];
      const b = path[k + 1];
      const d = Math.hypot(...sub(b, a));
      if (rest + d >= need) {
        const f = (need - rest) / d;
        const p = lerp3(a, b, f);
        const whip = 1.4 * Math.sin(spine.length * 0.9 - u * 9) * Math.min(1, spine.length / 3);
        spine.push([p[0], p[1] + whip, p[2]]);
        path[k] = p;
        rest = 0;
        need = SEG;
      } else {
        rest += d;
        k++;
      }
    }
    return { spine, gape: u < 0.8 ? 1 : 1 - ((u - 0.8) / 0.2) * 0.72, fat: 0, bulge: [0, 0] };
  }
  if (t < BL_LETGO) {
    // (CLAMPED ON: it swings down from its mouth, curling; drinking, a swallow running down it three times a second; swelling)
    const k = smooth((t - BL_HIT) / 0.12);
    const fat = smooth((t - BL_HIT) / (BL_LETGO - BL_HIT));
    const hang = hangingPose(t, fat);
    if (k >= 1) return hang;
    const at = attackPose(BL_HIT - 0.001);
    return blend(at, hang, k);
  }
  if (t < BL_LAND) {
    // (it lets go: falls, heavy, onto the floor before you)
    const u = (t - BL_LETGO) / (BL_LAND - BL_LETGO);
    const hang = hangingPose(BL_LETGO, 1);
    const down = droppedPose(t);
    const g = u * u;
    return { ...blend(hang, down, g), fat: 1, gape: 0.15 };
  }
  // (it lands with a squash, lies a moment, and wriggles back to where it was, its swelling going down)
  const u = (t - BL_LAND) / (BL_ATTACK - BL_LAND);
  const down = droppedPose(t);
  const squash = Math.max(0, 1 - (t - BL_LAND) / 0.12) * 0.8;
  const back = smooth((u - 0.15) / 0.85);
  const wr = Math.sin(u * Math.PI * 5) * (1 - back) * back * 4;
  const p = blend(down, stand0, back);
  return { ...moved(p, [0, wr, 0]), squash, fat: 1 - smooth((u - 0.45) / 0.55) };
}
/** The splash of its landing, and drops off it as it drinks. */
function attackGrains(t: number): Grain[] {
  const out: Grain[] = [];
  if (t > BL_LAND && t < BL_LAND + 0.3) {
    const s = t - BL_LAND;
    for (let i = 0; i < 12; i++) {
      const a = hash(i, 1, 821) * Math.PI * 2;
      const r = (3 + 9 * hash(i, 2, 821)) * Math.min(1, s / 0.12);
      const z = Math.max(0.3, 6 * hash(i, 3, 821) * Math.sin(Math.PI * Math.min(1, s / 0.3)));
      out.push([[BL_LATCH[0] - 12 + Math.cos(a) * r, 2 + Math.sin(a) * r, z], i % 3 ? '#4a5a50' : '#6f8a80', 1]);
    }
  }
  if (t > BL_HIT && t < BL_LETGO) {
    // (dark drops running from where it clamps on)
    for (let i = 0; i < 3; i++) {
      const k = ((t - BL_HIT) * 1.6 + i / 3) % 1;
      out.push([[BL_LATCH[0] - 0.5, 1.5 - i, BL_LATCH[2] - 2 - 16 * k * k], i % 2 ? '#5c1422' : '#3a0c16', 1]);
    }
  }
  return out;
}

/** STRUCK: how long. Its front flung back, its body whipped into a C, its mouth gaping; back as it was. */
export const BL_REEL = 0.35;
export function reelPose(t: number): LeechPose {
  const u = clamp01(t / BL_REEL);
  const k = Math.sin(Math.PI * Math.min(1, u / 0.85)) * (u < 0.3 ? 1 : 1);
  const hit = turtle(
    (u2) => 0.6 * smooth((u2 - 0.3) / 0.25) + 1.3 * Math.sin(u2 * 3.2 + 2.2),
    (u2) => (u2 < 0.4 ? 1.9 * smooth((0.4 - u2) / 0.12) - (u2 < 0.2 ? 0.6 * smooth((0.2 - u2) / 0.1) : 0) : 0),
    [-5, 0, 0],
  );
  return blend(standPose(0), { spine: hit, gape: 1, fat: 0, bulge: [0.3, 1] }, k);
}
function reelGrains(t: number): Grain[] {
  const out: Grain[] = [];
  const s = t;
  for (let i = 0; i < 7; i++) out.push([[12 - (4 + 10 * hash(i, 1, 823)) * s * 3, 4 + (hash(i, 2, 823) - 0.5) * 10 * s * 3, Math.max(0.3, 12 + 30 * s - 140 * s * s)], i % 2 ? '#4a5a50' : '#6f8a80', 1]);
  return out;
}

/** ITS DEATH (his pick: it bursts in a dark splash): how long; when it bursts. */
export const BL_DIE = 1.0;
export const BL_POP = 0.18;
const BLOOD = ['#2a0810', '#3a0c16', '#5c1422', '#7a1e2c'];
const BOG = ['#2e3a34', '#4a5a50', '#6f8a80'];
/** Swelling and thrashing as it dies, before it bursts. */
function swellPose(t: number): LeechPose {
  const u = clamp01(t / BL_POP);
  const thr = Math.sin(t * 2 * Math.PI * 9) * u;
  const p = turtle(
    (u2) => 0.6 * smooth((u2 - 0.3) / 0.25) + (0.7 + 0.5 * thr) * Math.sin(u2 * 6.5 + 1 + thr),
    (u2) => (u2 < 0.4 ? (1.2 - 0.6 * u) * smooth((0.4 - u2) / 0.1) - (u2 < 0.15 ? 0.6 * smooth((0.15 - u2) / 0.1) : 0) : 0),
  );
  return blend(standPose(0), { spine: p, gape: 1, fat: 1.7, bulge: [0.5, 1.5] }, smooth(u * 1.6));
}
/** What is left after it bursts, `s` seconds on: scraps of its skin flung out and lying flat, a dark stain spreading on the floor, and the splash. */
function burstBits(s: number, put: Put, grains: Grain[]): void {
  // (the stain: dark blood and bog water spreading out flat)
  const r = 9 + 8 * Math.min(1, Math.sqrt(s / 0.35));
  put('stain', 'stain', { k: 'ball', c: [2, 0, 0.15], ax: [[r, 0, 0], [0, r * 0.85, 0], [0, 0, 0.12]], skin: (q, _tone, x, y) => {
    const d = Math.hypot(q[0], q[1]);
    if (d > 0.82 && hash(Math.floor(x / 2), Math.floor(y / 2), 825) > 0.55) return null;
    return d < 0.55 ? (hash(x, y, 826) > 0.8 ? BLOOD[2] : BLOOD[0]) : hash(x, y, 827) > 0.7 ? BOG[1] : BLOOD[1];
  } });
  // (scraps of its skin: its head with the ring of its mouth, a piece of its middle, its tail's sucker; flung out, lying flat)
  const scraps: [number, number, number, number][] = [[1.0, 0.35, 3.0, 2.2], [-0.5, 2.6, 4.2, 2.6], [-1.0, 4.6, 3.4, 2.8]];
  scraps.forEach(([dx, ang, len, wid], i) => {
    const fly = Math.min(1, s / 0.22);
    const far = 6 + 4 * i;
    const c: V3 = [2 + dx + Math.cos(ang) * far * fly, Math.sin(ang) * far * fly, Math.max(0.5, 7 * Math.sin(Math.PI * fly) * (1 - fly * 0.5))];
    put(`scrap${i}`, `scrap${i}`, { k: 'ball', c, ax: [[len * Math.cos(ang + 1), len * Math.sin(ang + 1), 0], [-wid * Math.sin(ang + 1), wid * Math.cos(ang + 1), 0], [0, 0, 0.9]], skin: (q, tone) => (i === 0 && Math.hypot(q[0] - 0.4, q[1]) < 0.4 ? GULLET[1] : Math.abs(Math.abs(q[1]) - 0.45) < 0.12 ? STRIPE[Math.max(1, tone - 1)] : SKIN[Math.max(1, tone - 1)]) });
  });
  // (THE SPLASH: dark blood and bog water flung out and up, falling, and lying where it lands)
  for (let i = 0; i < 60; i++) {
    const a = hash(i, 1, 829) * Math.PI * 2;
    const sp = 50 + 50 * hash(i, 2, 829);
    const up = 20 + 30 * hash(i, 3, 829);
    const g = 220;
    const land = (up + Math.sqrt(up * up + 2 * g * 4)) / g;
    const f = Math.min(s, land);
    const z = s < land ? 4 + up * f - (g / 2) * f * f : 0.2;
    const far = sp * f;
    const col = i % 3 === 0 ? BOG[i % 2 ? 1 : 2] : BLOOD[1 + (i % 3)];
    if (s > land + 0.25 && i % 2) continue;
    grains.push([[2 + Math.cos(a) * far, Math.sin(a) * far, Math.max(0.2, z)], col, s < land && i % 3 !== 2 ? 2 : 1]);
  }
}

/** One frame of the leech: `which` (stand, walk, attack, reel, dying), `t` seconds in, from in front or behind. */
export function leechPainted(which: string, t: number, view: GameView = 'front'): Painted {
  if (which === 'walk') return paintLeech(view, slitherPose(t), t, [], true);
  if (which === 'attack') return paintLeech(view, attackPose(t), t, attackGrains(t), true);
  if (which === 'reel') return paintLeech(view, reelPose(t), t, reelGrains(t), true);
  if (which === 'dying') {
    if (t < BL_POP) return paintLeech(view, swellPose(t), t, [], false);
    const st = stage(view, BL_CANVAS.ax, BL_CANVAS.ay, BL_CANVAS);
    const bits: Bit[] = [];
    const grains: Grain[] = [];
    burstBits(t - BL_POP, (part, piece, shape) => bits.push({ part, piece, shape }), grains);
    const lights = paintBits(st, bits, [2, 0, 0]);
    const px = st.whole(null);
    for (const [pt, col, size] of grains) {
      const [x, y] = st.at(pt);
      const xi = Math.round(x - 0.5);
      const yi = Math.round(y - 0.5);
      for (let dy = 0; dy < size; dy++) for (let dx = 0; dx < size; dx++) if (xi + dx >= 0 && yi + dy >= 0 && xi + dx < px.w && yi + dy < px.h) px.set(xi + dx, yi + dy, col);
    }
    return { px, lights };
  }
  const p = standPose(t);
  return paintLeech(view, p, t, standGrains(p, t), true);
}

/** One frame, as the game holds a figure. */
export function leechFrame(which: string, t: number, view: GameView = 'front'): Sprite {
  return toSprite(leechPainted(which, t, view), null, BL_CANVAS.ax, BL_CANVAS.ay);
}

/** Its stand's frames: 16 at ten a second. */
export const BL_IDLE = { frames: 16, fps: 10 } as const;

/** THE BOG LEECH, as the game holds a monster's pictures (its slither painted for BL_PACE). */
export function makeLeechArt(): ActorArt {
  const set = (view: GameView): AnimSet => {
    const frame = (which: string, t: number): Sprite => toSprite(leechPainted(which, t, view), which === 'dying' ? null : { x: BL_CANVAS.ax, y: BL_CANVAS.ay - 4, r: 16, color: '#ff3a78', a: 0.08 }, BL_CANVAS.ax, BL_CANVAS.ay);
    const attack: Clip = { frames: lazyFrames(Math.round(BL_ATTACK * 30) + 1, (i) => frame('attack', i / 30)), fps: 30, hit: BL_HIT };
    const die: Clip = { frames: lazyFrames(Math.round(BL_DIE * 20) + 1, (i) => frame('dying', i / 20)), fps: 20 };
    const reel: Clip = { frames: lazyFrames(Math.round(BL_REEL * 30) + 1, (i) => frame('reel', i / 30)), fps: 30 };
    return {
      idle: lazyFrames(BL_IDLE.frames, (i) => frame('stand', i / BL_IDLE.fps)),
      walk: lazyFrames(BL_WALK.frames, (i) => frame('walk', i / BL_WALK.fps)),
      attack: lazyFrames(3, (i) => attack.frames[[12, 19, 30][i]]),
      idleFps: BL_IDLE.fps,
      walkFps: BL_WALK.fps,
      clips: { attack, die, reel },
    };
  };
  return { front: set('front'), back: set('back') };
}
