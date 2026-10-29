// THE SILENT ORDER: THEIR MOVES (the art chat, 29 Oct 2026). A MOCK-UP: NOT IN THE GAME, behind ORDER_ON
// (art/silent_order.ts, off). Their look and the brief are art/silent_order.ts; what their blows leave in the world,
// art/silent_order_fx.ts.
//
// His pick for how they move: “Still, then sudden (Recommended)”. And his rulebook's Movement 9, his words of 24 Oct,
// “Like the wind up and wind down are big but the actual punch is lightning quick”, for every enemy from now on (28 Oct:
// “Start from now on, but every enemy is going to need that change eventually.  And bigger AOE to compensate for the
// extra time the player gets to evade”); and of speed and size, 28 Oct: “It’s all too slow and too narrow and too
// small.  I could dodge anything you’ve put in these moves with my eyes closed”. So they are utterly still, and then
// they are on you; every blow is a big held wind-up, a strike of two frames smeared with its after-images, and a big
// wind-down; and what they hit is big.
//
// THEIR MOVES (the three dressings alike, on their own bones):
//   STANDING, utterly still: hands folded before them, the masked head tilting a hair, the breath barely showing; only
//     the cloak stirs.
//   THE RUN (their walk, `ORDER_PACE` 5.5 tiles a second, twice the knight's): low and silent, long bounding strides, the
//     cloak streaming flat behind.
//   THE RUSH (still, then sudden): still; a flick of a crouch; and in two frames they are gone, flung low across the floor,
//     the cloak streaming, the game carrying them `RUSH.carry` (4.5 tiles) in a fifth of a second, smeared all along the way
//     they came; they land on the front foot and the cloak flies on past them, and they are still again. The game may play
//     it again and again to close on you, as it likes.
//   THE HUSHING PALM (their first blow): the left forefinger laid before the mouthless mask; the right palm drawn back
//     beside the head, fingers up, the body turned away and coiled low, the Hush gathering grey into the palm, the eye
//     holes flaring (THE WARNING, held); hips first; the palm thrust out in two frames, smeared, and the grey wave bursts
//     from it over a wide cone before them (art/silent_order_fx.ts: words darkened in it); held out as the wave rolls on;
//     drawn back.
//   THE CURVED KNIFE (their second): a curved knife drawn from the left hip; raised high behind the head, the left hand
//     levelled at you, leaning back, its edge glinting pink (THE WARNING, held); hips first; the arm whips over in two
//     frames, smeared, and the knife flies spinning from the hand (art/silent_order_fx.ts), `KNIFE_FLIGHT.reach` tiles;
//     the arm carried right through and down; drawn back up.
//   STRUCK: jolted back, the cloak flung.
//   THE MASK CRACKS, THE CLOAK FALLS EMPTY (their death): jolted; then utterly still while a crack runs down the mask and
//     the pink gutters out in its eyes; it splits and the halves fall; there is no one in the cloak, and it falls empty to
//     the floor in a heap (the masks' fog scatters).
//
// By his rulebook: every move through every check the bosses have (art/boss_checks.ts), from in front and from behind,
// and the lightning strikes as his Movement 9 asks.
//   test: tsx --test tests/silent_order.test.ts

import type { ActorArt } from './actor_types';
import type { BossShape, CheckLimb, CheckLump, CheckThing } from './boss_checks';
import { footOn, footwork, kneelHips, plantBy, plantOf } from './bosses3';
import type { Plant } from './bosses3';
import { hash } from './kit';
import { FLAME } from './mkit';
import { TILE3, mobSet, skeletonAt } from './new_mobs3';
import type { Mob, MobMove, Moment } from './new_mobs3';
import { FOG, KNIFE, ORDER_CANVAS, bodyOf, cloakRings, knifeOf, maskOn, orderPainter } from './silent_order';
import type { HandHold, OrderSay, OrderWho } from './silent_order';
import { stage } from './skin';
import type { Ring } from './skin';
import { add, lerp3, mul, norm, solve, standing, sub } from './skeleton';
import type { Bones, Build, Key3, Motion, Posed, Skeleton, V3 } from './skeleton';

type P = Partial<Bones>;
const FPS = 30;
const FR = 1 / FPS;
const clamp01 = (v: number): number => Math.max(0, Math.min(1, v));
const smooth = (a: number, b: number, t: number): number => {
  const u = clamp01((t - a) / (b - a));
  return u * u * (3 - 2 * u);
};

// =============================================================================================
// A MOVE THROUGH KEY POSES (as the Princess's: art/princess_moves.ts): every field through its keys smoothly, its speed
// carried through each key, but straight through a lightning strike; sampled on every frame the game shows

/** A monotone curve through (time, value) knots, its speed carried smoothly through each (Fritsch and Carlson). */
export function track(keys: ReadonlyArray<readonly [number, number]>): (t: number) => number {
  const n = keys.length;
  const ts = keys.map((k) => k[0]);
  const vs = keys.map((k) => k[1]);
  const d: number[] = [];
  for (let i = 0; i < n - 1; i++) d.push((vs[i + 1] - vs[i]) / (ts[i + 1] - ts[i]));
  const m: number[] = [];
  for (let i = 0; i < n; i++) {
    if (i === 0 || i === n - 1 || d[i - 1] * d[i] <= 0) m.push(0);
    else {
      const w1 = 2 * (ts[i + 1] - ts[i]) + (ts[i] - ts[i - 1]);
      const w2 = ts[i + 1] - ts[i] + 2 * (ts[i] - ts[i - 1]);
      m.push((w1 + w2) / (w1 / d[i - 1] + w2 / d[i]));
    }
  }
  return (t: number) => {
    if (t <= ts[0]) return vs[0];
    if (t >= ts[n - 1]) return vs[n - 1];
    let i = 0;
    while (i < n - 2 && t > ts[i + 1]) i++;
    const h = ts[i + 1] - ts[i];
    const u = (t - ts[i]) / h;
    const h00 = 2 * u ** 3 - 3 * u ** 2 + 1;
    const h10 = u ** 3 - 2 * u ** 2 + u;
    const h01 = -2 * u ** 3 + 3 * u ** 2;
    const h11 = u ** 3 - u ** 2;
    return h00 * vs[i] + h10 * h * m[i] + h01 * vs[i + 1] + h11 * h * m[i + 1];
  };
}
interface Plan {
  long: number;
  keys: ReadonlyArray<readonly [number, P]>;
  /** The strike: from the last frame of its wind-up to the frame it lands on. */
  strike?: readonly [number, number];
  hit?: number;
}
function poseFn(rest: Bones, plan: Plan): (t: number) => P {
  const full = plan.keys.map(([t, p]) => [t, { ...rest, ...p } as Record<string, number>] as const);
  const fields = Object.keys(full[0][1]).filter((k) => k !== 'lhIn' && k !== 'rhIn' && typeof full[0][1][k] === 'number');
  const tracks = new Map(fields.map((k) => [k, track(full.map(([t, p]) => [t, p[k]] as const))]));
  const st = plan.strike;
  const at = (t: number): Record<string, number> | undefined => full.find(([kt]) => Math.abs(kt - t) < 1e-6)?.[1];
  const a0 = st ? at(st[0]) : undefined;
  const a1 = st ? at(st[1]) : undefined;
  return (t) => {
    const out: Record<string, number> = { lhIn: full[0][1].lhIn, rhIn: full[0][1].rhIn };
    if (st && a0 && a1 && t > st[0] && t < st[1]) {
      const k = (t - st[0]) / (st[1] - st[0]);
      for (const f of fields) out[f] = a0[f] + (a1[f] - a0[f]) * k;
    } else for (const f of fields) out[f] = (tracks.get(f) as (t: number) => number)(t);
    return out as P;
  };
}
function motionOf(rest: Bones, plan: Plan): Motion {
  const f = poseFn(rest, plan);
  const keys: Key3[] = [];
  const n = Math.round(plan.long * FPS);
  for (let i = 0; i <= n; i++) keys.push({ at: i / FPS, pose: f(i / FPS), ease: 'lin' });
  return plan.hit !== undefined ? { keys, hit: plan.hit } : { keys };
}
/** The hands as the bones place them: each from its own shoulder along the figure's own forward, left and up (`lhIn` 1). */
const hands = (l: V3, r: V3, le = 0, re = 0): P => ({ lhIn: 1, lhx: l[0], lhy: l[1], lhz: l[2], le, rhIn: 1, rhx: r[0], rhy: r[1], rhz: r[2], re });

// =============================================================================================
// THEIR REST: STILL, HANDS FOLDED BEFORE THEM

/** Their rest, on their own bones: upright and still, the hands folded one over the other before the waist, the masked head a little raised. */
export function restOf(B: Build): Bones {
  const hs = B.shoulderHalf;
  return {
    ...standing(B),
    pz: -0.3, pitch: 0, bend: -1, roll: 0, side: 0, faceUp: 3, faceTilt: 0, faceTurn: 0,
    lfx: 0.6, lfy: 0.8, lft: 8, lk: 6, rfx: -0.2, rfy: -0.8, rft: -8, rk: -6,
    ...hands([B.ribDeep + 3.6, -hs + 1.2, -B.chest - 6.6], [B.ribDeep + 3.9, hs - 0.6, -B.chest - 7.2], -14, 14),
    wAz: 0, wEl: 0, wRoll: 0, out: 0, draw: 0,
  } as Bones;
}

// =============================================================================================
// STANDING: utterly still

export const ORDER_STAND = { frames: 32, fps: 10 } as const;
function standMotion(R: Bones): Motion {
  const T = ORDER_STAND.frames / ORDER_STAND.fps;
  const keys: Key3[] = [];
  const N = 32;
  for (let i = 0; i <= N; i++) {
    const t = (i / N) * T;
    const a = (t / T) * Math.PI * 2;
    const breath = Math.sin(a * 2 - 0.5);
    keys.push({
      at: t,
      ease: 'lin',
      pose: {
        pz: R.pz + 0.78 * breath,
        py: 0.95 * Math.sin(a),
        roll: R.roll + 0.8 * Math.sin(a),
        bend: R.bend - 1.0 * breath,
        // (the masked head tilting, a hair, and back: the one thing about them that moves)
        faceTilt: R.faceTilt + 5 * Math.sin(a) * Math.abs(Math.sin(a)),
        faceTurn: R.faceTurn + 2.5 * Math.sin(a + 1.1),
        lhz: R.lhz + 0.3 * breath,
        rhz: R.rhz + 0.3 * breath,
      },
    });
  }
  return { loop: 0, keys };
}

// =============================================================================================
// THE RUN (their walk): low, silent, long bounding strides, twice the knight's pace

/** Their running pace, tiles a second (the knight walks 2.5). */
export const ORDER_PACE = 5.5;
export const ORDER_RUN = { frames: 10, fps: 30 } as const;
/** A foot of the run, frame `k` of `n`: down for two steps of the floor going back under it, then flicked up behind and brought through, quick and low. */
function runFoot(k: number, n: number, d: number): [number, number, number] {
  const down = 2;
  if (k <= down) return [d * (down / 2 - k), 0, 0];
  const u = (k - down) / (n - down);
  const g = u * u * (3 - 2 * u);
  const x = -d * (down / 2) + d * down * g - 6 * Math.sin(Math.PI * u) * (1 - u) * 1.4;
  const z = 8 * Math.sin(Math.PI * Math.pow(u, 0.65));
  const p = 26 * Math.sin(Math.PI * Math.min(1, u * 1.6)) * (1 - u) - 8 * Math.sin(Math.PI * u) * u;
  return [x, z, p];
}
/** Where in its stride the run begins (frames): with the swing foot coming down, nearest how they stand. */
const RUN_PHASE = 2;
function runMotion(R: Bones): Motion {
  const n = ORDER_RUN.frames;
  const d = (ORDER_PACE * TILE3) / ORDER_RUN.fps;
  const keys: Key3[] = [];
  for (let i = 0; i <= n; i++) {
    const j = i % n;
    const a = (j / n) * Math.PI * 2;
    const [lx, lz, lp] = runFoot((j + RUN_PHASE) % n, n, d);
    const [rx, rz, rp] = runFoot((j + RUN_PHASE + n / 2) % n, n, d);
    // (EERIE: above the waist they are as still as they stand, the hands folded before them, the mask level and on you,
    // leaning a little into it; below, the legs race under the cloak)
    const bob = Math.abs(Math.cos(a));
    keys.push({
      at: i / ORDER_RUN.fps,
      ease: 'lin',
      pose: {
        pz: R.pz - 2.4 + 0.7 * bob, py: 0.5 * Math.sin(a), roll: 0.8 * Math.sin(a), yaw: 3 * Math.cos(a), twist: -3 * Math.cos(a), side: 0.4 * Math.sin(a),
        pitch: 8, bend: 2, faceUp: R.faceUp + 6, faceTilt: 0.6 * Math.sin(a), faceTurn: -1 * Math.cos(a),
        lfx: lx + 0.6, lfz: lz, lfp: lp, lfy: 0.6, lft: 6, lk: 6,
        rfx: rx - 0.2, rfz: rz, rfp: rp, rfy: -0.6, rft: -6, rk: -6,
        lhIn: 1, lhx: R.lhx + 0.6, lhy: R.lhy, lhz: R.lhz + 0.4 * bob, le: R.le,
        rhIn: 1, rhx: R.rhx + 0.6, rhy: R.rhy, rhz: R.rhz + 0.4 * bob, re: R.re,
      },
    });
  }
  return { keys, loop: 0 };
}

// =============================================================================================
// THE RUSH (still, then sudden)

/**
 * The rush's times (seconds): still; the flick of a crouch; the launch (the strike, two frames); in the air while the
 * game carries them (`air`), `carry` tiles in all; landed on the front foot, the cloak flying on; still again by `long`.
 */
export const RUSH = { long: 0.9, still: 0.18, crouch: 0.3, strike: [9 / FPS, 11 / FPS] as const, air: [9 / FPS, 15 / FPS] as const, carry: 4.5, settle: 0.8 } as const;
/** Where the pelvis is through the rush, along the floor (the figure's own lengths): the game's carry and the body's own way over its feet together; and where the body is over its feet. */
const RUSH_C = RUSH.carry * TILE3 + 1;
const rushWorld = track([[RUSH.air[0], 0], [10 / FPS, 0.22 * RUSH_C], [11 / FPS, 0.45 * RUSH_C], [12 / FPS, 0.64 * RUSH_C], [13 / FPS, 0.79 * RUSH_C], [14 / FPS, 0.89 * RUSH_C], [RUSH.air[1], RUSH_C - 10], [0.56, RUSH_C - 3.5], [0.65, RUSH_C - 0.6], [RUSH.settle, RUSH_C]]);
const rushPx = (t: number): number => {
  if (t <= RUSH.air[0]) return -1 * smooth(RUSH.still, RUSH.crouch, t);
  if (t <= RUSH.air[1]) return -1 - 9 * ((t - RUSH.air[0]) / (RUSH.air[1] - RUSH.air[0]));
  return rushWorld(t) - RUSH_C;
};
/** HOW FAR THE GAME HAS CARRIED THEM `t` seconds into the rush, along their forward (the figure's own lengths): nothing until they launch; all of it (`RUSH.carry` tiles) by the time the front foot lands; none after. */
export function rushCarry(t: number): number {
  if (t <= RUSH.air[0]) return 0;
  const tt = Math.min(t, RUSH.air[1]);
  return rushWorld(tt) - (rushPx(tt) - rushPx(RUSH.air[0]));
}
function rushPlan(B: Build): Plan {
  const R = restOf(B);
  const hs = B.shoulderHalf;
  const crouch: P = { pz: -4.2, pitch: 10, bend: 6, faceUp: 10, faceTilt: 0, ...hands([B.ribDeep + 2.6, -hs + 3.2, -B.chest - 8], [B.ribDeep + 2.8, hs - 3, -B.chest - 8.4], -24, 24) };
  const fly: P = { pz: 1.4, pitch: 42, bend: 12, faceUp: 40, roll: 0, ...hands([-10, 4.2, -12], [-10, -4.2, -12], -30, 30) };
  const land: P = { pz: -3.8, pitch: 22, bend: 8, faceUp: 20, ...hands([-3, 3.8, -15.5], [-3, -3.8, -15.5], -24, 24) };
  return {
    long: RUSH.long,
    strike: RUSH.strike,
    keys: [
      [0, {}],
      [RUSH.still, { faceUp: R.faceUp + 2 }],
      [RUSH.crouch, crouch],
      [RUSH.strike[1], fly],
      [0.4333, { ...fly, pz: 1.6, pitch: 40 }],
      [RUSH.air[1], land],
      [0.62, { pz: -1.4, pitch: 7, bend: 3, faceUp: 8, ...hands([B.ribDeep + 1.5, -hs + 2.2, -B.chest - 7.6], [B.ribDeep + 1.8, hs - 1.6, -B.chest - 8.2], -16, 16) }],
      [RUSH.settle, {}],
      [RUSH.long, {}],
    ],
  };
}
/** The rush's feet: both down till they launch; in the air the front (left) foot reaching on and the back one trailing; the front foot landing where it stands at rest, the back one brought through and down. */
function rushFeet(B: Build): (t: number) => P {
  const R = restOf(B);
  const L0 = plantOf(B, 'L', {}, R);
  const R0 = plantOf(B, 'R', {}, R);
  const [a0, a1] = RUSH.air;
  return (t) => {
    let L: P;
    let Rf: P;
    if (t <= a0) {
      L = footOn(B, 'L', L0);
      Rf = footOn(B, 'R', R0);
    } else if (t < a1) {
      const u = (t - a0) / (a1 - a0);
      L = footOn(B, 'L', { ...plantBy(L0, 7 * Math.sin(Math.PI * u), 0), pitch: 18 * Math.sin(Math.PI * u) }, 7 * Math.sin(Math.PI * Math.pow(u, 0.7)));
      const v = Math.sin(Math.PI * Math.min(1, u * 1.15));
      Rf = footOn(B, 'R', { ...plantBy(R0, -19 * v, 0), pitch: 48 * v }, 2 + 11 * v);
    } else {
      L = footOn(B, 'L', L0);
      const u = clamp01((t - a1) / (0.76 - a1));
      const g = u * u * (3 - 2 * u);
      const v1 = Math.sin(Math.PI * Math.min(1, 1 / 1.15));
      Rf = u >= 1 ? footOn(B, 'R', R0) : footOn(B, 'R', { ...plantBy(R0, -19 * v1 * (1 - g), 0), pitch: 48 * v1 * (1 - g) }, (2 + 11 * v1) * Math.pow(1 - g, 0.7) + 3 * Math.sin(Math.PI * g));
    }
    return { ...L, ...Rf, px: rushPx(t) };
  };
}

// =============================================================================================
// THE HUSHING PALM (their first blow)

/** Their first blow: how long; the warning, held from and to; the strike (from the last frame of the wind-up to the frame it lands on); the blow. */
export const PALM = { long: 2.0, warn: [0.44, 26 / FPS] as const, strike: [26 / FPS, 28 / FPS] as const, hit: 28 / FPS } as const;
function palmPlan(B: Build): Plan {
  const hs = B.shoulderHalf;
  const R = restOf(B);
  const cock: P = { yaw: -30, twist: -8, pitch: -5, bend: -6, px: -2.2, pz: -2.6, side: 3, faceUp: 6, faceTurn: 4, faceTilt: -4, ...hands([10, -hs + 1.0, 5.5], [-6.5, -8.5, 5.5], -40, 70) };
  const shaking = (k: number): P => ({ ...cock, rhz: (cock.rhz as number) + (k % 2 ? 0.45 : -0.25), rhx: (cock.rhx as number) - 0.2 * (k % 2), faceTilt: (cock.faceTilt as number) + (k % 2 ? 0.8 : -0.6) });
  const hipsFirst: P = { ...cock, yaw: -14, twist: -24, px: -1.6 };
  const struck: P = { yaw: 14, twist: 8, pitch: 12, bend: 8, px: 7.4, pz: -3.6, side: -1, faceUp: 10, faceTurn: -2, faceTilt: 0, ...hands([-6, 6, -16], [20.2, 3.6, -3.2], -30, -10) };
  const on: P = { ...struck, yaw: 18, twist: 10, pitch: 15, bend: 10, px: 9.6, pz: -4.2, ...hands([-7, 6.5, -16.5], [21.0, 3.4, -2.6], -30, -12) };
  return {
    long: PALM.long,
    strike: PALM.strike,
    hit: PALM.hit,
    keys: [
      [0, {}],
      [0.18, { yaw: -10, twist: -2, pz: -0.8, faceUp: 4, ...hands([7, -hs + 1.5, -6], [1, -6, -9], -28, 40) }],
      [PALM.warn[0], cock],
      [0.56, shaking(1)],
      [0.68, shaking(2)],
      [0.78, shaking(3)],
      [PALM.strike[0], hipsFirst],
      [PALM.strike[1], struck],
      [1.06, on],
      [1.34, { ...on, px: 9.2, pitch: 14, ...hands([-6.5, 6.5, -16.6], [20.6, 3.2, -3.4], -30, -12) }],
      [1.62, { yaw: 4, twist: 2, pitch: 5, bend: 3, px: 3.0, pz: -1.6, faceUp: 4, ...hands([4, -hs + 2, -14], [9, 1.5, -12], -20, 10) }],
      [PALM.long, {}],
    ].map(([t, p]) => [t as number, p as P] as const),
  };
}
/** The palm's and the knife's feet: the right foot back into the coil, the left forward; the lunge onto it, the back heel up; back to rest. */
function blowFeet(B: Build): (t: number) => P {
  const R = restOf(B);
  const L0 = plantOf(B, 'L', {}, R);
  const R0 = plantOf(B, 'R', {}, R);
  return footwork(B, {
    L: { start: L0, moves: [{ t0: 0.2, t1: 0.38, to: plantBy(L0, 8, 0.8, 6), lift: 3.2 }, { t0: 1.46, t1: 1.74, to: L0, lift: 2.6 }] },
    R: { start: R0, moves: [{ t0: 0.08, t1: 0.24, to: plantBy(R0, -5.5, -1.2, -16), lift: 2.4 }, { t0: PALM.strike[0], t1: PALM.hit + 0.1, to: plantBy(R0, -5.5, -1.2, 4, { pitch: 26 }) }, { t0: 1.56, t1: 1.86, to: R0, lift: 2.4 }] },
  });
}

// =============================================================================================
// THE CURVED KNIFE (their second blow)

export const THROW = { long: 2.0, draw: [0.1, 0.24] as const, warn: [0.46, 26 / FPS] as const, strike: [26 / FPS, 28 / FPS] as const, hit: 28 / FPS } as const;
/** The knife in flight once it has left the hand at the blow: how fast (tiles a second), how far (tiles), how fast it spins (turns a second). */
export const KNIFE_FLIGHT = { speed: 20, reach: 8, spin: 6 } as const;
function knifePlan(B: Build): Plan {
  const hs = B.shoulderHalf;
  const raised: P = { yaw: -32, twist: -12, pitch: -8, bend: -7, px: -2.4, pz: -2.8, side: 3, faceUp: 4, faceTurn: 6, faceTilt: -3, ...hands([19, -hs + 2.5, 2.0], [-6.5, -3.4, 15.5], -10, 40), wAz: 170, wEl: 52, wRoll: 90 };
  const shaking = (k: number): P => ({ ...raised, rhz: (raised.rhz as number) + (k % 2 ? 0.5 : -0.3), rhx: (raised.rhx as number) - 0.25 * (k % 2), wEl: 52 + (k % 2 ? 1.5 : -1) });
  const hipsFirst: P = { ...raised, yaw: -16, twist: -28, px: -1.8 };
  const thrown: P = { yaw: 18, twist: 10, pitch: 14, bend: 10, px: 7.2, pz: -3.8, side: -1, faceUp: 8, faceTurn: -2, faceTilt: 0, ...hands([-6, 7, -15], [19.5, 3.6, -6.5], -30, -14), wAz: 0, wEl: -10, wRoll: 90 };
  const follow: P = { yaw: 22, twist: 16, pitch: 20, bend: 15, px: 9.4, pz: -4.6, side: -2, faceUp: 14, faceTurn: -4, ...hands([-7, 7.5, -15.5], [12.5, 11.5, -20.5], -30, -30), wAz: -20, wEl: -50, wRoll: 90 };
  return {
    long: THROW.long,
    strike: THROW.strike,
    hit: THROW.hit,
    keys: [
      [0, {}],
      [0.16, { yaw: 10, twist: 4, pz: -0.8, bend: 4, faceUp: 2, ...hands([3, 2.5, -17], [6.5, hs + 2.8, -14.5], -20, 30), wAz: 90, wEl: 70, wRoll: 0 }],
      [0.26, { yaw: 6, twist: 2, pz: -1.2, bend: 5, faceUp: 2, ...hands([5, 1.5, -16], [6.0, hs + 2.0, -13.0], -20, 30), wAz: 100, wEl: 60, wRoll: 40 }],
      // (swung out to the right before the chest, the blade up, and so up behind the shoulder: round the head, never across it)
      [0.35, { yaw: -12, twist: -6, pitch: -3, bend: -2, px: -1.0, pz: -2.0, side: 1, faceUp: 3, faceTurn: 3, ...hands([12, -hs + 3, -6], [7, -4.5, -3], -14, 10), wAz: -10, wEl: 78, wRoll: 60 }],
      [THROW.warn[0], raised],
      [0.58, shaking(1)],
      [0.7, shaking(2)],
      [0.79, shaking(3)],
      [THROW.strike[0], hipsFirst],
      [THROW.strike[1], thrown],
      [1.1, follow],
      [1.34, { ...follow, px: 9.0, pitch: 19, ...hands([-6.6, 7.4, -15.6], [12.0, 11.0, -20.8], -30, -30) }],
      [1.64, { yaw: 6, twist: 3, pitch: 6, bend: 4, px: 3.0, pz: -1.6, faceUp: 4, ...hands([4, -hs + 2, -14], [8, -1, -14], -20, 14), wAz: 0, wEl: -30, wRoll: 0 }],
      [THROW.long, {}],
    ].map(([t, p]) => [t as number, p as P] as const),
  };
}

// =============================================================================================
// STRUCK, AND THEIR DEATH

export const ORDER_REEL = 0.4;
function reelPlan(B: Build): Plan {
  const hs = B.shoulderHalf;
  return {
    long: ORDER_REEL,
    keys: [
      [0, {}],
      [0.07, { px: -3.2, pz: 0.4, pitch: -7, bend: -9, faceUp: 18, faceTilt: 6, ...hands([4, -hs + 4, -14], [4, hs - 4, -14.5], -40, 40) }],
      [0.2, { px: -1.4, pitch: -2, bend: -3, faceUp: 8 }],
      [ORDER_REEL, {}],
    ],
  };
}
/** Their death (seconds): jolted; still while the crack runs down the mask; the halves fall (the left, then the right); the cloak empties and falls; it lies. */
export const ORDER_DIES = { long: 2.2, crack: [0.12, 0.3] as const, maskL: 0.34, maskR: 0.37, empty: 0.4, down: 1.1 } as const;
const TUCK = 50;
function diesPlan(B: Build): Plan {
  const hs = B.shoulderHalf;
  const R = restOf(B);
  const L0 = plantOf(B, 'L', {}, R);
  const R0 = plantOf(B, 'R', {}, R);
  const feet = { L: { ...L0, pitch: TUCK }, R: { ...R0, pitch: TUCK } };
  const KZ = B.legR[1] * 1.3;
  const kneel = (lean: number, body: P): P => ({ ...kneelHips(B, R, feet, TUCK, KZ, lean), ...body });
  const limp = (dz: number): P => hands([7, -hs + 3, -18 + dz], [7, hs - 3, -18.5 + dz], -16, 16);
  return {
    long: ORDER_DIES.long,
    keys: [
      [0, {}],
      [0.08, { px: -2.6, pitch: -6, bend: -8, faceUp: 16, faceTilt: 4, ...hands([4.5, -hs + 4, -14], [4.5, hs - 4, -14], -36, 36) }],
      // utterly still while the mask cracks; the light going out of its eyes
      [0.2, { px: -1.6, pitch: -3, bend: -4, faceUp: 10, faceTilt: 2, out: 0.5 }],
      [ORDER_DIES.empty, { px: -1.4, pitch: -2.5, bend: -3.5, faceUp: 10, faceTilt: 2, out: 1 }],
      // (no one in it: the bones go down with the cloak, onto their knees and folded over, as the heap lies)
      [0.72, { ...kneel(8, { pitch: 10, bend: 14, faceUp: -10, ...limp(0) }), out: 1 }],
      [ORDER_DIES.down, { ...kneel(-36, { pitch: 6, bend: 24, faceUp: -30, ...limp(-2) }), out: 1 }],
      [ORDER_DIES.long, { ...kneel(-38, { pitch: 6, bend: 25, faceUp: -31, ...limp(-2.2) }), out: 1 }],
    ].map(([t, p]) => [t as number, p as P] as const),
  };
}
function diesFeet(B: Build): (t: number) => P {
  const R = restOf(B);
  const L0 = plantOf(B, 'L', {}, R);
  const R0 = plantOf(B, 'R', {}, R);
  return footwork(B, {
    L: { start: L0, moves: [{ t0: ORDER_DIES.empty + 0.02, t1: 0.74, to: { ...L0, pitch: TUCK } }] },
    R: { start: R0, moves: [{ t0: ORDER_DIES.empty + 0.04, t1: 0.76, to: { ...R0, pitch: TUCK } }] },
  });
}

// =============================================================================================
// THEM, AS THE GAME HOLDS A MONSTER

/** The names of their moves, as the game and the review know them. */
export const ORDER_NAMES = {
  stand: 'The Silent Order stand still',
  walk: 'The Silent Order run',
  rush: 'The rush',
  attack: 'The hushing palm',
  knife: 'The curved knife',
  reel: 'The Silent Order are struck',
  dying: 'The mask cracks, the cloak falls empty',
} as const;
const byName: Record<string, string> = Object.fromEntries(Object.entries(ORDER_NAMES).map(([k, v]) => [v, k]));
/** Each blow's (and the rush's) lightning strike: from the last frame of its wind-up to the frame it lands on. */
export const ORDER_STRIKES: Readonly<Record<string, readonly [number, number]>> = { attack: PALM.strike, knife: THROW.strike, rush: RUSH.strike };
/** Whether a frame of a move is painted with its smear: from the frame after its wind-up ends to the frame after it lands; and the rush all through the air. */
export function smearedAt(move: string, t: number): boolean {
  if (move === 'rush') return t > RUSH.air[0] + 1e-6 && t <= RUSH.air[1] + FR + 1e-6;
  const s = ORDER_STRIKES[move];
  return !!s && t > s[0] + 1e-6 && t <= s[1] + FR + 1e-6;
}

interface Built {
  plans: Record<string, Plan>;
  poses: Record<string, (t: number) => P>;
  rest: Bones;
  B: Build;
}
function built(who: OrderWho): Built {
  const B = bodyOf(who);
  const rest = restOf(B);
  const plans: Record<string, Plan> = { attack: palmPlan(B), knife: knifePlan(B), rush: rushPlan(B), reel: reelPlan(B), dying: diesPlan(B) };
  const poses = Object.fromEntries(Object.entries(plans).map(([k, p]) => [k, poseFn(rest, p)]));
  return { plans, poses, rest, B };
}

/** How each hand is held through each move. */
function handsAt(move: string, t: number): readonly [HandHold, HandHold] {
  const folded: HandHold = { curl: 0.45, spread: 0.2 };
  if (move === 'stand' || move === 'reel') return [folded, folded];
  if (move === 'walk') return [{ curl: 0.75 }, { curl: 0.75 }];
  if (move === 'rush') return t > RUSH.still && t < RUSH.settle ? [{ curl: 0.25, spread: 0.6 }, { curl: 0.25, spread: 0.6 }] : [folded, folded];
  if (move === 'attack') {
    const L: HandHold = t > 0.14 && t < 0.96 ? { curl: 1, point: true, fingers: [0.15, 0, 1], face: [0, -1, 0] } : folded;
    const R: HandHold = t > 0.2 && t < 1.55 ? { curl: 0, spread: 1, fingers: [0.2, 0, 1], face: [1, 0, 0.1] } : folded;
    return [L, R];
  }
  if (move === 'knife') {
    const L: HandHold = t > 0.3 && t < THROW.hit + 0.04 ? { curl: 1, point: true } : { curl: 0.4, spread: 0.5 };
    const R: HandHold = t > THROW.draw[1] - 0.04 && t < THROW.hit ? { curl: 1 } : t >= THROW.hit && t < 1.5 ? { curl: 0.15, spread: 0.9 } : folded;
    return [L, R];
  }
  if (move === 'dying') return t < ORDER_DIES.empty ? [{ curl: 0.2, spread: 0.6 }, { curl: 0.2, spread: 0.6 }] : [folded, folded];
  return [folded, folded];
}
/** How bright the pink burns in the eye holes: dull; flaring through a warning and the rush. */
function flareAt(move: string, t: number): number {
  if (move === 'attack') return smooth(0.2, PALM.warn[0], t) * (1 - smooth(PALM.hit, PALM.hit + 0.3, t));
  if (move === 'knife') return smooth(0.26, THROW.warn[0], t) * (1 - smooth(THROW.hit, THROW.hit + 0.3, t));
  if (move === 'rush') return smooth(RUSH.still - 0.04, RUSH.crouch, t) * (1 - smooth(RUSH.air[1], RUSH.settle, t));
  return 0;
}

/**
 * THE CLOAK LEFT BEHIND AND FLUNG ON: a damped spring on the hem, pulled back by how fast they go (the body's own way over
 * its feet, the game's carry in the rush, its pace in the run) and swinging on past them when they stop. Worked through
 * each move from its start (a loop, twice round, the second kept).
 */
const SWAYS = new Map<string, (t: number) => V3>();
function swayOf(key: string, long: number, loop: boolean, at: (t: number) => V3): (t: number) => V3 {
  const have = SWAYS.get(key);
  if (have) return have;
  const dt = 1 / 240;
  const W = 2 * Math.PI * 2.1;
  const Z = 0.42;
  const DRAG = 0.055;
  const MOST = 16;
  const n = Math.max(2, Math.round(long / dt));
  const laps = loop ? 2 : 1;
  let x: V3 = [0, 0, 0];
  let v: V3 = [0, 0, 0];
  const out: V3[] = [];
  let prev = at(0);
  for (let lap = 0; lap < laps; lap++) {
    for (let i = 0; i <= n; i++) {
      const t = (i / n) * long;
      const p = at(t);
      const vel = i === 0 && lap === 0 ? ([0, 0, 0] as V3) : mul(sub(p, prev), 1 / dt);
      prev = p;
      const want: V3 = [-DRAG * vel[0], -DRAG * vel[1], 0];
      const acc = add(mul(sub(want, x), W * W), mul(v, -2 * Z * W));
      v = add(v, mul(acc, dt));
      x = add(x, mul(v, dt));
      const l = Math.hypot(x[0], x[1]);
      if (l > MOST) x = [x[0] * (MOST / l), x[1] * (MOST / l), 0];
      if (lap === laps - 1) out.push(x);
    }
    if (loop) prev = sub(prev, at(long)) as V3;
  }
  const f = (t: number): V3 => {
    const u = loop ? ((t % long) + long) % long : Math.max(0, Math.min(long, t));
    const k = Math.min(n, Math.max(0, Math.round((u / long) * n)));
    return out[k];
  };
  SWAYS.set(key, f);
  return f;
}

/** The grey of the Hush gathering into the palm through the warning; bursting out of it as it strikes; a puff of it out of the cloak as it empties. */
function moreOf(who: OrderWho, move: string, m: Moment, B: Build, at: (move: string, t: number) => Skeleton, sway: (move: string, t: number) => V3): [V3, string, number][] {
  const out: [V3, string, number][] = [];
  const t = m.t;
  const s = m.s;
  if (move === 'attack' && t > 0.24 && t < PALM.hit) {
    // gathering: grains drawn in round the palm, faster and closer as the warning goes on
    const k = smooth(0.24, PALM.warn[1], t);
    for (let i = 0; i < 44; i++) {
      const ph = (t * (1.3 + 0.9 * k) + i / 44) % 1;
      const r = (18 - 15 * ph) * (0.6 + 0.4 * hash(i, 1, 9031));
      const a = i * 2.39 + t * 5;
      const p = add(s.handR, [Math.cos(a) * r * 0.7 - 1.5, Math.sin(a) * r, Math.sin(a * 1.7) * r * 0.6 + 1.5]);
      if (hash(i, Math.floor(t * 20), 9032) > 0.35 + 0.65 * k) continue;
      out.push([p, ph > 0.75 ? FOG[6] : ph > 0.45 ? FOG[5] : FOG[3], ph > 0.7 ? 2 : 1]);
    }
    // (and the palm itself pale with it, held)
    for (let i = 0; i < 10 * k; i++) {
      const a = i * 2.1 + t * 9;
      out.push([add(s.handR, [Math.cos(a) * 2.2, Math.sin(a) * 2.2, 2 + Math.sin(a * 1.3) * 2]), i % 2 ? FOG[6] : FOG[5], 1]);
    }
  }
  if (move === 'attack' && t >= PALM.hit && t < PALM.hit + 0.45) {
    // the burst off the palm: grains flung forward out of it, spreading into the wave
    const k = (t - PALM.hit) / 0.45;
    const h = at('attack', PALM.hit).handR;
    for (let i = 0; i < 40; i++) {
      if (hash(i, 2, 9033) < k * 0.9) continue;
      const a = (hash(i, 3, 9033) - 0.5) * 1.5;
      const r = 3 + 46 * Math.sqrt(k) * (0.5 + 0.5 * hash(i, 4, 9033));
      const p: V3 = [h[0] + Math.cos(a) * r, h[1] + Math.sin(a) * r, Math.max(0.6, h[2] - 18 * k * hash(i, 5, 9033) + 3 * Math.sin(i))];
      out.push([p, k < 0.25 ? FOG[6] : k < 0.6 ? FOG[4] : FOG[2], k < 0.3 ? 2 : 1]);
    }
  }
  if (move === 'rush') {
    // dust kicked up where the front foot lands (where they launched is left behind them, tiles back: the game's to show)
    if (t >= RUSH.air[1] && t < RUSH.air[1] + 0.35) {
      const k = (t - RUSH.air[1]) / 0.35;
      for (let i = 0; i < 16; i++) {
        if (hash(i, 10, 9034) < k) continue;
        const a = hash(i, 11, 9034) * Math.PI * 2;
        const r = 2 + 9 * k * (0.5 + hash(i, 12, 9034));
        out.push([[s.toeL[0] + Math.cos(a) * r + 4 * k, s.toeL[1] + Math.sin(a) * r, 0.6 + 3 * k * hash(i, 13, 9034)], i % 2 ? FOG[2] : FOG[3], 2]);
      }
    }
  }
  if (move === 'rush' && t > RUSH.air[0] + 1e-6 && t <= RUSH.air[1] + FR + 1e-6) {
    // GHOSTS of them along the way they came, dark and broken, the oldest faintest: their cloak's outline, left behind
    const c = rushCarry(t);
    for (let j = 1; j <= 3; j++) {
      const u = Math.max(RUSH.air[0], t - (j * FR) / 2.2);
      const sk = at('rush', u);
      const back = c - rushCarry(u);
      if (back < 3) continue;
      const rings = cloakRings(sk, B, sway('rush', u), 0);
      rings.forEach((r, ri) => (r.pts ?? []).forEach((p, pi) => {
        if ((pi + ri + j) % (j + 1) !== 0) return;
        out.push([[p[0] - back, p[1], p[2]], j === 1 ? '#3a3549' : '#2b2737', 1]);
      }));
      const mk = maskOf(B, sk);
      for (let q = 0; q < 10; q++) out.push([[mk[0] - back + Math.cos(q) * 2.2, mk[1] + Math.sin(q * 1.3) * 2.6, mk[2] + Math.sin(q * 2.1) * 3], j === 1 ? '#8f8b9a' : '#5a5664', 1]);
    }
  }
  if (move === 'dying' && who !== 'mask' && t > ORDER_DIES.empty - 0.02 && t < ORDER_DIES.empty + 0.6) {
    // as it empties: a puff of grey out of the hood's mouth, the cuffs and the hem, rising and gone
    const k = (t - ORDER_DIES.empty + 0.02) / 0.62;
    const was = at('dying', ORDER_DIES.empty);
    const o = maskOf(B, was);
    const ff = was.face[0];
    for (let i = 0; i < 46; i++) {
      // (a last grey breath out of the empty hood's mouth, out and up, curling, gone)
      const life = k * 1.25 - 0.4 * hash(i, 14, 9035);
      if (life <= 0 || life > 1) continue;
      const curl = life * 5 + i;
      const p: V3 = add(o, add(mul(ff, 2 + 7 * life), [Math.sin(curl) * (1 + 3 * life), Math.cos(curl * 0.8) * (1 + 3 * life), 3 + 16 * life * (0.6 + 0.6 * hash(i, 15, 9035))]));
      out.push([p, life < 0.3 ? FOG[4] : life < 0.65 ? FOG[3] : FOG[1], life < 0.4 && i % 3 === 0 ? 2 : 1]);
    }
  }
  if (move === 'dying' && who !== 'mask' && t > 0.62 && t < 1.25) {
    // and the dust it throws up off the floor as it lands in a heap
    const k = (t - 0.62) / 0.63;
    const c = at('dying', ORDER_DIES.empty).pelvis;
    for (let i = 0; i < 40; i++) {
      if (hash(i, 18, 9035) < k * 1.1) continue;
      const a = hash(i, 19, 9035) * Math.PI * 2;
      const r = 12 + 12 * Math.sqrt(k) * (0.5 + hash(i, 20, 9035));
      out.push([[c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r * 0.9, 0.6 + 4 * Math.sin(Math.PI * k) * hash(i, 21, 9035)], i % 2 ? FOG[2] : FOG[1], 1]);
    }
  }
  return out;
}
/** Where the mask is on a skeleton (for what comes out of the hood). */
function maskOf(B: Build, s: Skeleton): V3 {
  return add(s.head, mul(s.face[0], B.headR[0] * 0.4));
}

/** THE SMEAR: after-images of what strikes along the way it came since its wind-up ended (the arm and the hand; the arm and the knife); in the rush, the whole of them, streaked back along the floor they crossed. */
function smearOf(move: string, t: number, at: (move: string, t: number) => Skeleton, B: Build): V3[][] | null {
  if (!smearedAt(move, t)) return null;
  const out: V3[][] = [];
  if (move === 'rush') {
    const to = Math.min(t, RUSH.air[1]);
    const from = Math.max(RUSH.air[0], to - 1.3 * FR);
    const c = rushCarry(t);
    const n = 7;
    const pts: Record<string, V3[]> = { hem: [], pelvis: [], chest: [], handL: [], handR: [], hood: [], mask: [] };
    for (let i = 0; i <= n; i++) {
      const u = from + ((to - from) * i) / n;
      const s = at('rush', u);
      const back: V3 = [-(c - rushCarry(u)), 0, 0];
      const sh = (p: V3): V3 => add(p, back);
      pts.hem.push(sh([s.pelvis[0] - 6, s.pelvis[1], 6]));
      pts.pelvis.push(sh(s.pelvis));
      pts.chest.push(sh(s.ribs));
      pts.handL.push(sh(s.handL));
      pts.handR.push(sh(s.handR));
      pts.hood.push(sh(add(s.head, [-3, 0, 5])));
      pts.mask.push(sh(maskOf(B, s)));
    }
    // (dim first, the mask's white streak last and brightest)
    out.push(pts.hem, pts.pelvis, pts.handL, pts.handR, pts.chest, pts.hood, pts.mask);
    return t > RUSH.air[1] + 1e-6 ? out.slice(3) : out;
  }
  const [s0, s1] = ORDER_STRIKES[move];
  const to = Math.min(t, s1);
  const n = 5;
  for (let i = 0; i <= n; i++) {
    const u = s0 - FR * 0.5 + ((to - (s0 - FR * 0.5)) * i) / n;
    const s = at(move, u);
    out.push([s.shoulderR, s.elbowR, s.handR]);
    if (move === 'knife') {
      const k = knifeOf(s.handR, s.point, s.across);
      out.push([k.pommel, k.guard, k.tip]);
    } else out.push([s.handR, add(s.handR, mul(norm(sub(s.handR, s.elbowR)), 3.2)), add(s.handR, [0, 0, 3.5])]);
  }
  return t > s1 + 1e-6 ? out.slice(Math.floor(out.length / 2)) : out;
}

function orderMob(who: OrderWho): Mob {
  const b = built(who);
  const { B, rest } = b;
  const bonesOf = (move: string, t: number): Skeleton => {
    const pl = b.plans[move];
    const pose = b.poses[move]?.(Math.max(0, Math.min(pl.long, t))) ?? {};
    const feet = move === 'attack' || move === 'knife' ? blowFeet(B)(t) : move === 'rush' ? rushFeet(B)(t) : move === 'dying' ? diesFeet(B)(t) : {};
    return solve(B, { ...rest, ...pose, ...feet } as Posed);
  };
  const atCache = new Map<string, Skeleton>();
  const at = (move: string, t: number): Skeleton => {
    const k = `${move}:${t.toFixed(4)}`;
    let s = atCache.get(k);
    if (!s) atCache.set(k, (s = bonesOf(move, t)));
    return s;
  };
  // (where the body goes over the floor through a move, for the cloak's spring: its pelvis, the game's carry, its pace)
  let mob: Mob | null = null;
  const pelvisAt = (move: string, t: number): V3 => {
    if (!mob) return [0, 0, 0];
    if (move === 'stand' || move === 'walk') {
      const s = skeletonAt(mob, move, t);
      return move === 'walk' ? add(s.pelvis, [ORDER_PACE * TILE3 * t, 0, 0]) : s.pelvis;
    }
    const s = at(move, t);
    return move === 'rush' ? add(s.pelvis, [rushCarry(t), 0, 0]) : s.pelvis;
  };
  const longOf = (move: string): number => (move === 'stand' ? ORDER_STAND.frames / ORDER_STAND.fps : move === 'walk' ? ORDER_RUN.frames / ORDER_RUN.fps : b.plans[move]?.long ?? 1);
  const emptyRings = new Map<string, Ring[]>();
  const swayAt = (move: string, t: number): V3 => {
    const v = swayOf(`${who}:${move}`, longOf(move), move === 'stand' || move === 'walk', (u) => pelvisAt(move, u))(t);
    // (running, the back of the hem flaps up off each stride)
    if (move === 'walk') return [v[0], v[1], 3.2 * Math.abs(Math.sin((t / (ORDER_RUN.frames / ORDER_RUN.fps)) * Math.PI * 2 + 0.6))];
    return v;
  };
  const say: OrderSay = {
    sway: (m) => swayAt(byName[m.move ?? ''] ?? 'stand', m.t),
    hands: (m) => handsAt(byName[m.move ?? ''] ?? 'stand', m.t),
    knife: (m) => {
      const move = byName[m.move ?? ''] ?? '';
      return move === 'knife' && m.t >= THROW.draw[1] - 0.04 && m.t < THROW.hit;
    },
    flare: (m) => flareAt(byName[m.move ?? ''] ?? '', m.t),
    crack: (m) => smooth(ORDER_DIES.crack[0], ORDER_DIES.crack[1], m.t) * (m.t >= ORDER_DIES.crack[0] ? 1 : 0) + (m.t >= ORDER_DIES.crack[1] ? 0 : 0),
    emptied: (m) => (m.dying && m.t >= ORDER_DIES.empty ? m.t - ORDER_DIES.empty : -1),
    emptyCloak: (st) => {
      const key = st.view;
      let r = emptyRings.get(key);
      if (!r) {
        const s = at('dying', ORDER_DIES.empty);
        emptyRings.set(key, (r = cloakRings(s, B, [0, 0, 0], 0)));
      }
      return r;
    },
    smear: (m) => smearOf(byName[m.move ?? ''] ?? '', m.t, at, B),
    more: (m) => moreOf(who, byName[m.move ?? ''] ?? '', m, B, at, swayAt),
    fogArms: (m) => {
      const move = byName[m.move ?? ''] ?? '';
      const t = m.t;
      if (move === 'attack') return [smooth(0.1, 0.4, t) * (1 - smooth(1.0, 1.5, t)), smooth(0.14, PALM.warn[0], t) * (1 - smooth(1.3, 1.8, t))];
      if (move === 'knife') return [smooth(0.24, THROW.warn[0], t) * (1 - smooth(THROW.hit, 1.4, t)), smooth(0.06, 0.24, t) * (1 - smooth(1.3, 1.8, t))];
      if (move === 'dying') return [0, 0];
      return [0.08, 0.08];
    },
  };
  const paint = orderPainter(who, say);
  const mv = (name: string, motion: Motion, more: Partial<MobMove> = {}): MobMove => ({ name, motion, rest, ...more });
  const glow = (warn: readonly [number, number], hit: number) => (t: number): number => (t >= warn[0] - 0.1 && t <= hit ? smooth(warn[0] - 0.1, warn[0], t) : 0);
  const names: Record<OrderWho, string> = { guest: 'A guest of the Silent Order', armed: 'The Silent Order\'s last, armed', mask: 'A mask of the Silent Order' };
  mob = {
    id: `order-${who}`,
    name: names[who],
    size: 'medium: the knight\'s size',
    build: B,
    stand: mv(ORDER_NAMES.stand, standMotion(rest)),
    attack: mv(ORDER_NAMES.attack, motionOf(rest, b.plans.attack), { feet: blowFeet(B) }),
    more: {
      knife: mv(ORDER_NAMES.knife, motionOf(rest, b.plans.knife), { feet: blowFeet(B), glint: glow(THROW.warn, THROW.hit) }),
      rush: mv(ORDER_NAMES.rush, motionOf(rest, b.plans.rush), { feet: rushFeet(B) }),
    },
    idleFrames: ORDER_STAND.frames,
    idleFps: ORDER_STAND.fps,
    walk: mv(ORDER_NAMES.walk, runMotion(rest), { period: ORDER_RUN.frames / ORDER_RUN.fps, ground: ORDER_PACE * TILE3 }),
    walkFrames: ORDER_RUN.frames,
    walkFps: ORDER_RUN.fps,
    pace: ORDER_PACE,
    reel: mv(ORDER_NAMES.reel, motionOf(rest, b.plans.reel)),
    reelTime: ORDER_REEL,
    hit: PALM.hit,
    warn: PALM.warn[1] - PALM.warn[0],
    dieTime: ORDER_DIES.long,
    dying: mv(ORDER_NAMES.dying, motionOf(rest, b.plans.dying), { feet: diesFeet(B) }),
    aura: { x: ORDER_CANVAS.ax, y: ORDER_CANVAS.ay - 44, r: 38, color: '#8a8698', a: 0.06 },
    shadow: 12,
    canvas: ORDER_CANVAS,
    trueBack: true,
    bits: paint.bits,
    grains: paint.grains,
    // (the mask's two halves fall from the face, clear before the heap of the cloak, face up)
    fall(piece) {
      const near = who === 'mask' ? 0.45 : 1;
      if (piece === 'maskL') return { from: ORDER_DIES.maskL, to: [17 * near, 8 * near], spin: 70, lay: 'flat', up: [1, 0, 0.35], hop: 1.4 };
      if (piece === 'maskR') return { from: ORDER_DIES.maskR, to: [19 * near, -7 * near], spin: -95, lay: 'flat', up: [1, 0, 0.35], hop: 1.2 };
      return null;
    },
  };
  return mob;
}
export const ORDER_GUEST = orderMob('guest');
export const ORDER_ARMED = orderMob('armed');
export const ORDER_MASK = orderMob('mask');
export const ORDER_ALL: readonly Mob[] = [ORDER_GUEST, ORDER_ARMED, ORDER_MASK];
export const orderOf = (who: OrderWho): Mob => (who === 'guest' ? ORDER_GUEST : who === 'armed' ? ORDER_ARMED : ORDER_MASK);
export function makeOrderArt3(mob: Mob = ORDER_GUEST, pace = mob.pace): ActorArt {
  return { front: mobSet(mob, 'front', pace), back: mobSet(mob, 'back', pace) };
}
/** Where the knife leaves the hand at the blow (the figure's own lengths, from its floor point): the knife in flight starts there. */
export function knifeLeaves(mob: Mob): V3 {
  return skeletonAt(mob, 'knife', THROW.hit).handR;
}
/** Where the palm is as it strikes: the wave starts there. */
export function palmAt(mob: Mob): V3 {
  return skeletonAt(mob, 'attack', PALM.hit).handR;
}

// =============================================================================================
// THEM AS THE CHECKS SEE THEM (art/boss_checks.ts)

const len3 = (v: V3): number => Math.hypot(v[0], v[1], v[2]);
export function orderSolids(B: Build): (s: Skeleton) => { limbs: CheckLimb[]; lumps: CheckLump[] } {
  return (s) => {
    const [rH, rK, rA] = B.legR;
    const [r0, r1] = B.armR;
    const limbs: CheckLimb[] = [];
    for (const side of ['L', 'R'] as const) {
      const L = side === 'L';
      limbs.push(
        { name: `leg${side}`, a: L ? s.hipL : s.hipR, b: L ? s.kneeL : s.kneeR, r: rH * 1.12 },
        { name: `shin${side}`, a: L ? s.kneeL : s.kneeR, b: L ? s.ankleL : s.ankleR, r: Math.max(rK, rA) * 1.2 },
        { name: `foot${side}`, a: add(L ? s.heelL : s.heelR, [0, 0, 1.5]), b: add(L ? s.toeL : s.toeR, [0, 0, 1.5]), r: 1.8 },
        { name: `upper${side}`, a: L ? s.shoulderL : s.shoulderR, b: L ? s.elbowL : s.elbowR, r: r0 * 1.25 },
        { name: `fore${side}`, a: L ? s.elbowL : s.elbowR, b: L ? s.handL : s.handR, r: r1 * 1.15 },
      );
    }
    limbs.push({ name: 'neck', a: s.neck, b: lerp3(s.neck, s.head, 0.5), r: 2.4 });
    const waistC = add(s.pelvis, mul(s.hips[2], B.waist * 0.6));
    const lumps: CheckLump[] = [
      // (the mask and the hood round it)
      { name: 'head', c: add(s.head, mul(s.face[0], -0.2)), rot: s.face, h: [B.headR[0] * 1.15, B.headR[1] * 1.2, B.headR[2] * 1.08] },
      { name: 'chest', c: lerp3(s.ribs, s.neck, 0.3), rot: s.chest, h: [B.ribDeep + 1.6, B.ribHalf + 1.5, len3(sub(s.neck, s.ribs)) * 0.55] },
      { name: 'belly', c: lerp3(waistC, s.ribs, 0.45), rot: s.belly, h: [B.waistDeep + 1.4, B.waistHalf + 1.4, Math.max(3, len3(sub(s.ribs, waistC)) * 0.6)] },
      { name: 'hips', c: add(s.pelvis, mul(s.hips[2], B.waist * 0.2)), rot: s.hips, h: [B.pelvisDeep + 2.0, B.pelvisHalf + 2.0, B.waist * 0.75] },
    ];
    return { limbs, lumps };
  };
}
export function orderShape(who: OrderWho): BossShape {
  const B = bodyOf(who);
  return {
    body: orderSolids(B),
    tip: (move, _t, s) => (move === 'attack' || move === 'knife' ? s.handR : null),
    things: (move, t, s) => {
      if (move !== 'knife' || t < THROW.draw[1] - 0.04 || t >= THROW.hit) return [];
      const k = knifeOf(s.handR, s.point, s.across);
      return [
        { name: 'knife handle', pts: [k.pommel, lerp3(k.pommel, s.handR, 0.5)], r: 0.8, may: ['foreR'] },
        { name: 'knife', pts: [...k.spine.slice(1), ...k.edge.slice(2)], r: 0.8, may: [] },
      ] as CheckThing[];
    },
    strikes: ORDER_STRIKES,
    smeared: smearedAt,
  };
}
export const ORDER_SHAPES: Readonly<Record<OrderWho, BossShape>> = { guest: orderShape('guest'), armed: orderShape('armed'), mask: orderShape('mask') };
void KNIFE;
void maskOn;
void stage;
void FLAME;
