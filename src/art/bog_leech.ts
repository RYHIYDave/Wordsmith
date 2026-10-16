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
// LOOK FIRST (his rule): this file holds its look and its stand; its moves follow his yes to them.

import type { Sprite } from '../engine/px';
import type { ActorArt, AnimSet } from './actor_types';
import { hash, lazyFrames, toSprite } from './kit';
import type { Painted, Ramp } from './kit';
import { ENEMY_RIM, FLAME } from './mkit';
import { TILE3, paintBits } from './new_mobs3';
import type { Bit, Put } from './new_mobs3';
import { stage } from './skin';
import type { GameView } from './skin';
import { add, cross, dot, lerp3, mul, norm, sub } from './skeleton';
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
        if (fed) return GULLET[Math.max(1, tn - 1)];
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

/** One frame of the leech: `which` (stand), `t` seconds in, from in front or behind. */
export function leechPainted(which: string, t: number, view: GameView = 'front'): Painted {
  const p = standPose(t);
  void which;
  return paintLeech(view, p, t, standGrains(p, t), true);
}

/** One frame, as the game holds a figure. */
export function leechFrame(which: string, t: number, view: GameView = 'front'): Sprite {
  return toSprite(leechPainted(which, t, view), null, BL_CANVAS.ax, BL_CANVAS.ay);
}

/** Its stand's frames: 16 at ten a second. */
export const BL_IDLE = { frames: 16, fps: 10 } as const;

/** THE BOG LEECH, as the game holds a monster's pictures (its stand only, for now). */
export function makeLeechArt(): ActorArt {
  const set = (view: GameView): AnimSet => {
    const frame = (which: string, t: number): Sprite => toSprite(leechPainted(which, t, view), { x: BL_CANVAS.ax, y: BL_CANVAS.ay - 4, r: 16, color: '#ff3a78', a: 0.08 }, BL_CANVAS.ax, BL_CANVAS.ay);
    const idle = lazyFrames(BL_IDLE.frames, (i) => frame('stand', i / BL_IDLE.fps));
    return { idle, walk: idle, attack: idle, idleFps: BL_IDLE.fps, walkFps: BL_IDLE.fps, clips: {} };
  };
  return { front: set('front'), back: set('back') };
}

void TILE3;
void dot;
