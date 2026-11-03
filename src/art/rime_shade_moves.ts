// FLOOR 20'S RIME SHADE: ITS MOVES (the art chat, 3 Nov 2026). A MOCK-UP: NOT IN THE GAME, behind RIME_SHADE_ON
// (art/rime_shade.ts, off). Its look and his words are art/rime_shade.ts; its breath's line of rime, art/rime_shade_fx.ts.
//
// His rules for every attack (his Movement 9, 24 Oct: “Like the wind up and wind down are big but the actual punch is lightning
// quick”; for the enemies, 28 Oct: “Start from now on, but every enemy is going to need that change eventually.  And bigger AOE
// to compensate for the extra time the player gets to evade”), his rulebook's Monsters 9, “Action, like a movie”, and his
// Animations 1 (“as big and wild and kinetic and weighty as possible.  I’d rather it be a notch too high than a notch too
// low.”). A small mob: ONE attack.
//
// ITS MOVES:
//   ITS STAND: hunched, breathing: its fog rising and falling with each breath, its cold breath puffing out of its hollow
//     and sinking as it breathes out, its icicle fingers stirring and clinking, its head turning slowly.
//   ITS DRIFT (its walk, `RS_PACE` tiles a second): low, half walking: its legs of fog stepping under its shroud, its feet
//     never on the floor, bobbing twice a stride, leaning into its way, its arms swinging long, its fog trailing.
//   THE RIME BREATH (its one attack, `RS_BREATH`): it sinks, then STRAIGHTENS to its full height, taller than the knight,
//     its arms flung out wide and back, its head thrown back, drawing in: the fog round it sucked into its hollow, the frost
//     forming over it, the cold gathering pale in its hollow, HELD, shivering, while the line it will send is marked on the
//     floor (art/rime_shade_fx.ts); hips first; then in TWO FRAMES it throws itself forward and down and breathes out,
//     smeared: its breath pours from its hollow onto the floor before it and the line of rime begins to creep from there
//     toward you (the fx's); it pours on a moment, then hunches, spent, deeper than it stands, fog pouring off it, its frost
//     gone thin; and rises back to its stand.
//   STRUCK: jolted back, its arms flung out, its frost cracking and shards of it flung off, its fog torn and closing.
//   ITS DEATH: struck, it arches back, its hollow to the sky, a last cold breath going out of it; its frost cracks and falls
//     away in flakes that are gone before they reach the floor; it rises and comes apart into fog, nothing left lying.
//
// By his rulebook: every move through every check the bosses have (art/boss_checks.ts `checkBoss`), from in front and behind.
//   test: tsx --test tests/rime_shade.test.ts

import type { ActorArt } from './actor_types';
import type { BossShape, CheckLimb, CheckLump, CheckThing, Handover } from './boss_checks';
import { HANG_L, HANG_R, RS_BODY, RS_CANVAS, RS_REST, elbowsTo, fingersOf, humpOf, rimePainter, shroudOf } from './rime_shade';
import type { RimeSay } from './rime_shade';
import { TILE3, mobSet } from './new_mobs3';
import type { Mob, MobMove, Moment } from './new_mobs3';
import { add, elbowFor, len, lerp3, mul, norm, solve, sub } from './skeleton';
import type { Bones, Key3, Motion, Posed, Skeleton, V3 } from './skeleton';

type P = Partial<Bones>;
const B = RS_BODY;
const R = RS_REST;
const FPS = 30;
const FR = 1 / FPS;
const TAU = Math.PI * 2;
const clamp01 = (v: number): number => Math.max(0, Math.min(1, v));
const smooth = (a: number, b: number, t: number): number => {
  const u = clamp01((t - a) / (b - a));
  return u * u * (3 - 2 * u);
};
const fr = (t: number): number => t - Math.floor(t);

// =============================================================================================
// A MOVE THROUGH KEY POSES (as the Hush's shapes', art/hush_shapes_moves.ts): every field through its keys smoothly, slow to
// start and slow to stop at each turn, but straight through a lightning strike; sampled on every frame the game shows

/** A monotone curve through keys: slow at each turn, its speed carried through each key that is not one. */
function track(keys: ReadonlyArray<readonly [number, number]>): (t: number) => number {
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
type PW = P & { _wl?: V3; _wr?: V3 };
function poseFn(plan: Plan): (t: number, elbows?: boolean) => P {
  const full = plan.keys.map(([t, p]) => [t, { ...R, ...p } as unknown as Record<string, number>] as const);
  const fields = Object.keys(full[0][1]).filter((k) => k !== 'lhIn' && k !== 'rhIn' && typeof full[0][1][k] === 'number');
  const tracks = new Map(fields.map((k) => [k, track(full.map(([t, p]) => [t, p[k]] as const))]));
  const st = plan.strike;
  const at = (t: number): Record<string, number> | undefined => full.find(([kt]) => Math.abs(kt - t) < 1e-6)?.[1];
  const a0 = st ? at(st[0]) : undefined;
  const a1 = st ? at(st[1]) : undefined;
  const wants = plan.keys.map(([, p]) => [...norm((p as PW)._wl ?? HANG_L), ...norm((p as PW)._wr ?? HANG_R)]);
  const wTracks = [0, 1, 2, 3, 4, 5].map((j) => track(plan.keys.map(([t], i) => [t, wants[i][j]] as const)));
  const i0 = st ? plan.keys.findIndex(([kt]) => Math.abs(kt - st[0]) < 1e-6) : -1;
  const i1 = st ? plan.keys.findIndex(([kt]) => Math.abs(kt - st[1]) < 1e-6) : -1;
  return (t, elbows = false) => {
    const out: Record<string, number> = { lhIn: full[0][1].lhIn, rhIn: full[0][1].rhIn };
    const inStrike = !!(st && a0 && a1 && t > st[0] && t < st[1]);
    const k = inStrike && st ? (t - st[0]) / (st[1] - st[0]) : 0;
    if (inStrike && a0 && a1) for (const f of fields) out[f] = a0[f] + (a1[f] - a0[f]) * k;
    else for (const f of fields) out[f] = (tracks.get(f) as (t: number) => number)(t);
    if (elbows) {
      const w = inStrike ? wants[i0].map((v, j) => v + (wants[i1][j] - v) * k) : wTracks.map((f) => f(t));
      const q = { ...R, ...out } as unknown as Posed;
      out.le = elbowFor(B, q, true, norm([w[0], w[1], w[2]]));
      out.re = elbowFor(B, { ...q, le: out.le } as Posed, false, norm([w[3], w[4], w[5]]));
    }
    return out as P;
  };
}
function motionOf(plan: Plan, loop = false): Motion {
  const f = poseFn(plan);
  const keys: Key3[] = [];
  const n = Math.round(plan.long * FPS);
  for (let i = 0; i <= n; i++) keys.push({ at: i / FPS, pose: f(i / FPS), ease: 'lin' });
  if (loop) return { keys, loop: 0 };
  return plan.hit !== undefined ? { keys, hit: plan.hit } : { keys };
}
/** Its hands, each from its own shoulder along its own forward, left and up. */
const hands = (l: V3, r: V3): P => ({ lhIn: 1, lhx: l[0], lhy: l[1], lhz: l[2], rhIn: 1, rhx: r[0], rhy: r[1], rhz: r[2] });
/** A pose with its elbows put toward these ways. */
const E = (pose: P, wl: V3, wr: V3): P => ({ ...elbowsTo(R, pose, wl, wr), _wl: wl, _wr: wr }) as P;
const OUT_L: V3 = [-0.2, 1, -0.3];
const OUT_R: V3 = [-0.2, -1, -0.3];
const L0: V3 = [R.lhx, R.lhy, R.lhz];
const R0: V3 = [R.rhx, R.rhy, R.rhz];

// =============================================================================================
// ITS STAND: hunched, breathing

export const RS_STAND_LONG = 2.4;
function standPose(t: number): P {
  const a = (t / RS_STAND_LONG) * TAU;
  // (breathing in as `sin a` rises: its back straightening a little, its chest and shoulders rising)
  const inh = Math.sin(a);
  return E({
    pz: R.pz + 1.6 * inh, py: 1.4 * Math.sin(a + 0.7), roll: 2.2 * Math.sin(a + 0.7), side: 1.5 * Math.sin(a + 0.7),
    pitch: R.pitch - 1.2 * inh, bend: R.bend - 2.5 * inh, hunch: (R.hunch ?? 0) - 4 * inh, shrug: (R.shrug ?? 0) + 0.12 * inh,
    faceTurn: 12 * Math.sin(a * 0.5 * 2 + 0.4), faceUp: R.faceUp + 3.5 * inh, faceTilt: 5 * Math.sin(a + 1.2),
    lfx: R.lfx + 0.8 * Math.sin(a + 0.7), rfx: R.rfx + 0.8 * Math.sin(a + 0.7), lfz: R.lfz + 0.6 * inh, rfz: R.rfz + 0.6 * inh,
    ...hands([L0[0] + 1.8 * Math.sin(a + 0.8), L0[1] + 0.9 * Math.sin(a + 1.6), L0[2] + 1.4 * Math.sin(a + 0.8)], [R0[0] + 1.6 * Math.sin(a + 0.8 + Math.PI), R0[1] + 0.9 * Math.sin(a + 2.4), R0[2] + 1.3 * Math.sin(a + 0.8 + Math.PI)]),
  }, HANG_L, HANG_R);
}
const standPlan = (): Plan => ({ long: RS_STAND_LONG, keys: Array.from({ length: 49 }, (_, i) => [(i / 48) * RS_STAND_LONG, standPose((i / 48) * RS_STAND_LONG)] as const) });

// =============================================================================================
// ITS DRIFT (its walk): low, half walking

/** Its drift, tiles a second (the knight walks 2.5 in the pictures; the game's hero runs 4.6). */
export const RS_PACE = 1.8;
export const RS_DRIFT = { frames: 12, fps: 10 } as const;
const DRIFT_LONG = RS_DRIFT.frames / RS_DRIFT.fps;
function driftPose(t: number): P {
  const a = (t / DRIFT_LONG) * TAU;
  // (a step each half round: each leg swings forward under its shroud, its foot lifted, never down)
  const sl = Math.sin(a);
  const sr = Math.sin(a + Math.PI);
  return E({
    pz: R.pz + 0.3 + 1.1 * Math.cos(2 * a), px: 1.0, py: 0.9 * Math.sin(a + 0.4), roll: 1.6 * Math.sin(a + 0.4), side: 1.0 * Math.sin(a + 0.4),
    yaw: 3 * Math.sin(a), twist: -4 * Math.sin(a),
    pitch: R.pitch + 6 + 1.0 * Math.cos(2 * a + 0.6), bend: R.bend + 2, hunch: R.hunch,
    faceTurn: -2.5 * Math.sin(a), faceUp: R.faceUp + 4 + 1.2 * Math.cos(2 * a + 0.6), faceTilt: 2 * Math.sin(a + 1.4),
    lfx: R.lfx + 7 * sl, lfz: R.lfz + 1.2 + 2.2 * Math.max(0, Math.cos(a)), lfp: (R.lfp ?? 0) + 6 * sl,
    rfx: R.rfx + 7 * sr, rfz: R.rfz + 0.4 + 2.2 * Math.max(0, -Math.cos(a)), rfp: (R.rfp ?? 0) + 6 * sr,
    ...hands([L0[0] - 2 - 4 * sl, L0[1] + 0.6, L0[2] + 1.0 + 1.2 * Math.max(0, -sl)], [R0[0] - 2 - 4 * sr, R0[1] - 0.6, R0[2] + 1.0 + 1.2 * Math.max(0, -sr)]),
  }, HANG_L, HANG_R);
}
const driftPlan = (): Plan => ({ long: DRIFT_LONG, keys: Array.from({ length: 25 }, (_, i) => [(i / 24) * DRIFT_LONG, driftPose((i / 24) * DRIFT_LONG)] as const) });

// =============================================================================================
// THE RIME BREATH (its one attack)

/**
 * The breath's times (seconds): sunk and gathered by `gather`; straightened to its full height, its arms flung wide, by
 * `warn[0]`, HELD, shivering, drawing in, to `warn[1]`; the line it will send marked on the floor from `mark` (the fx's);
 * hips first; the strike, two frames (`strike`), landing at `hit`: it breathes out; its breath pours onto the floor to
 * `pour`; it hunches, spent, by `spent`, and is at its stand again by `long`.
 */
export const RS_BREATH = { long: 2.5, gather: 0.16, warn: [0.4, 0.733] as const, mark: 0.25, strike: [23 / FPS, 25 / FPS] as const, hit: 25 / FPS, pour: 1.3, spent: 1.75 } as const;
/** STRAIGHTENED: risen to its full height, leaning back, its arms flung out wide and back, its head thrown back, drawing in. */
const RISEN: P = E({ pz: R.pz + 9, px: -3, pitch: -8, bend: -12, hunch: 0, shrug: 0, faceUp: 20, faceTilt: 0, lfz: R.lfz - 1.5, rfz: R.rfz - 2, lfx: R.lfx + 1, rfx: R.rfx - 1, ...hands([-10, 29, 3], [-10, -29, 2]) }, [-0.6, 0.25, -0.8], [-0.6, -0.25, -0.8]);
const RISEN_SHIVER: P = E({ ...RISEN, pz: (RISEN.pz as number) + 0.45, faceUp: 21.5, ...hands([-10.4, 29.4, 3.5], [-9.7, -29.3, 1.6]) }, [-0.6, 0.25, -0.8], [-0.6, -0.25, -0.8]);
const GATHER: P = E({ pz: R.pz - 2.5, px: 0.5, pitch: R.pitch + 5, bend: R.bend + 6, hunch: (R.hunch ?? 0) + 6, shrug: 0.55, faceUp: -2, ...hands([7, 5, -24], [6, -5, -25]) }, HANG_L, HANG_R);
/** HIPS FIRST: its hips tipping forward under it while its head is still thrown back. */
const HIPS_FIRST: P = E({ ...RISEN, pz: R.pz + 8, px: -1.5, pitch: 2, bend: -13, faceUp: 19, ...hands([-11, 29, 2], [-11, -29, 1]) }, [-0.6, 0.25, -0.8], [-0.6, -0.25, -0.8]);
/** BREATHING OUT: thrown forward and down, its hollow on the floor before it, its arms flung back behind it. */
const BREATHE: P = E({ pz: R.pz + 1.5, px: 4.5, pitch: 22, bend: 22, hunch: 26, shrug: 0.2, faceUp: -22, faceTilt: 0, lfz: R.lfz, rfz: R.rfz, ...hands([-15, 17, -8], [-15, -17, -9]) }, [-0.6, 0.5, 0.4], [-0.6, -0.5, 0.4]);
const POURING: P = E({ ...BREATHE, pz: R.pz + 0.8, px: 5.2, pitch: 24, bend: 25, hunch: 28, faceUp: -24, ...hands([-13, 17, -11], [-13, -17, -12]) }, [-0.6, 0.5, 0.4], [-0.6, -0.5, 0.4]);
const POURING2: P = E({ ...POURING, pz: R.pz + 0.3, pitch: 25, faceUp: -22, ...hands([-11, 16, -13], [-11, -16, -14]) }, [-0.6, 0.5, 0.3], [-0.6, -0.5, 0.3]);
const SAGGING: P = E({ pz: R.pz - 3, px: 3, pitch: 22, bend: 28, hunch: 36, shrug: 0.5, faceUp: -10, ...hands([6, 10, -23], [5, -10, -24]) }, OUT_L, OUT_R);
/** SPENT: hunched deeper than it stands, its arms hanging limp, its head hanging, fog pouring off it. */
const SPENT: P = E({ pz: R.pz - 6, px: 1.5, pitch: 22, bend: 30, hunch: 42, shrug: 0.65, faceUp: -6, ...hands([14, 8, -26], [13, -8, -27]) }, HANG_L, HANG_R);
const RECOVER: P = E({ pz: R.pz - 3, px: 0.6, pitch: 14, bend: 20, hunch: 35, shrug: 0.45, faceUp: 0, ...hands([15, 8, -23], [13, -8.5, -24]) }, HANG_L, HANG_R);
function breathPlan(): Plan {
  const [w0, w1] = RS_BREATH.warn;
  const [s0, s1] = RS_BREATH.strike;
  return {
    long: RS_BREATH.long,
    strike: RS_BREATH.strike,
    hit: RS_BREATH.hit,
    keys: [
      [0, {}],
      [RS_BREATH.gather, GATHER],
      [w0, RISEN],
      [0.56, RISEN_SHIVER],
      [w1, RISEN],
      [s0, HIPS_FIRST],
      [s1, BREATHE],
      [0.97, POURING],
      [1.12, POURING2],
      [RS_BREATH.pour, SAGGING],
      [RS_BREATH.spent, SPENT],
      [2.1, RECOVER],
      [RS_BREATH.long, {}],
    ],
  };
}

// =============================================================================================
// STRUCK, AND ITS DEATH

export const RS_REEL = 0.4;
const JOLT: P = E({ pz: R.pz + 2.5, px: -4.5, pitch: 1, bend: 4, hunch: 16, shrug: 0.1, faceUp: 18, faceTilt: -6, ...hands([2, 15, -17], [2, -15, -16]) }, [-0.4, 1, -0.4], [-0.4, -1, -0.4]);
function reelPlan(): Plan {
  return { long: RS_REEL, keys: [[0, {}], [0.1, JOLT], [0.24, E({ pz: R.pz + 1, px: -2, pitch: 8, bend: 13, hunch: 25, faceUp: 6, ...hands([5, 9, -26], [4, -9, -26]) }, [-0.4, 1, -0.3], [-0.4, -1, -0.3])], [RS_REEL, {}]] };
}
/** Its death: struck (the jolt); arching back, its hollow to the sky, a last cold breath out of it; its frost cracking and falling away; rising, coming apart into fog. */
export const RS_DIES = { long: 2.2, crack: 0.12, unravel: [0.4, 1.75] as const } as const;
function diesPlan(): Plan {
  return {
    long: RS_DIES.long,
    keys: [
      [0, {}],
      [0.1, { ...JOLT }],
      [0.38, E({ pz: R.pz + 6, px: -3, pitch: -4, bend: -8, hunch: 4, shrug: 0, faceUp: 42, ...hands([-4, 22, 5], [-4, -22, 6]) }, [-0.6, 0.25, -0.8], [-0.6, -0.25, -0.8])],
      [0.9, E({ pz: R.pz + 10, px: -2, pitch: -3, bend: -5, hunch: 2, faceUp: 32, ...hands([-2, 21, 13], [-2, -21, 15]) }, [-0.2, 0.7, -1], [-0.2, -0.7, -1])],
      [1.45, E({ pz: R.pz + 13, px: -1.5, pitch: -2, bend: -3, hunch: 1, faceUp: 28, ...hands([-1, 19, 18], [-1, -19, 20]) }, [-0.1, 0.8, -1], [-0.1, -0.8, -1])],
      [RS_DIES.long, E({ pz: R.pz + 15, px: -1, pitch: -1, bend: -2, hunch: 0, faceUp: 26, ...hands([0, 18, 21], [0, -18, 23]) }, [0, 0.8, -1], [0, -0.8, -1])],
    ],
  };
}

// =============================================================================================
// WHAT A MOMENT SAYS OVER AND ABOVE THE BONES

export const RS_NAMES = {
  stand: 'The Rime Shade stands, breathing',
  walk: 'The Rime Shade drifts',
  attack: 'The rime breath',
  reel: 'The Rime Shade is struck',
  dying: 'It comes apart into fog and frost',
} as const;
const byName: Record<string, string> = Object.fromEntries(Object.entries(RS_NAMES).map(([k, v]) => [v, k]));
const PLANS: Record<string, Plan> = { stand: standPlan(), walk: driftPlan(), attack: breathPlan(), reel: reelPlan(), dying: diesPlan() };
const POSES: Record<string, (t: number, elbows?: boolean) => P> = Object.fromEntries(Object.entries(PLANS).map(([k, p]) => [k, poseFn(p)]));
const LOOPS = new Set<string>(['stand', 'walk']);
/** Its pose `t` seconds into a move (by the name the checks know it by), a move that goes round folded. */
function poseOf(move: string, t: number, elbows = false): P {
  const plan = PLANS[move];
  if (!plan) return {};
  const u = LOOPS.has(move) ? plan.long * fr(t / plan.long) : Math.max(0, Math.min(plan.long, t));
  return POSES[move](u, elbows);
}
const bonesOf = (move: string, t: number): Skeleton => solve(B, { ...R, ...poseOf(move, t) } as Posed);
/** Where the game has it, over and above its bones: carried along the floor as it drifts. */
function carriedAt(move: string, t: number): number {
  return move === 'walk' ? RS_PACE * TILE3 * t : 0;
}
/** Where it breathes from: its hollow, before its face, a little under its middle (the end it strikes with). */
export function hollowOf(s: Skeleton): V3 {
  return add(s.head, add(mul(s.face[0], B.headR[0] * 0.95), mul(s.face[2], -B.headR[2] * 0.2)));
}

/**
 * HOW ITS FOG FOLLOWS (Movement 4, “Loose things follow”): its shroud's hem and its low fog held on a spring to where its
 * body is, left behind as it goes and swinging on past as it stops, settling. Worked out from its going over the second
 * before (a move that goes round, from rounds back). Its own lengths, the fog's way off its rest.
 */
const LAGS = new Map<string, V3>();
export function lagAt(move: string, t: number): V3 {
  const key = `${move}:${t.toFixed(5)}`;
  const had = LAGS.get(key);
  if (had) return had;
  const loop = LOOPS.has(move);
  const t0 = loop ? t - 2.6 : 0;
  const dt = 1 / 120;
  const w = TAU * 2.0;
  const z = 0.55;
  const REACH = 9;
  const anchor = (u: number): V3 => {
    const q = poseOf(move, u, false);
    return [(q.px ?? 0) + carriedAt(move, u), q.py ?? 0, q.pz ?? R.pz];
  };
  let x = anchor(t0);
  let v: V3 = move === 'walk' ? [RS_PACE * TILE3, 0, 0] : [0, 0, 0];
  for (let u = t0; u < t - 1e-9; u += dt) {
    const a = anchor(u + dt);
    const acc: V3 = [w * w * (a[0] - x[0]) - 2 * z * w * v[0], w * w * (a[1] - x[1]) - 2 * z * w * v[1], w * w * (a[2] - x[2]) - 2 * z * w * v[2]];
    v = add(v, mul(acc, dt));
    x = add(x, mul(v, dt));
    const d = sub(x, a);
    const dl = len(d);
    if (dl > REACH) x = add(a, mul(d, REACH / dl));
  }
  const out = mul(sub(x, anchor(t)), 1.6);
  if (LAGS.size > 20000) LAGS.clear();
  LAGS.set(key, out);
  return out;
}
/** Its icicle fingers through a move: hanging, stirring and clinking as it stands; splayed wide as it rises and draws in; flung back splayed as it breathes out; hanging limp, spent. */
export function handsAt(move: string, t: number): { splay: number; curl: number } {
  if (move === 'attack') {
    const [w0] = RS_BREATH.warn;
    const [s0, s1] = RS_BREATH.strike;
    if (t <= RS_BREATH.gather) return { splay: 0.25 - 0.15 * smooth(0, RS_BREATH.gather, t), curl: 0.15 + 0.4 * smooth(0, RS_BREATH.gather, t) };
    if (t <= s0) return { splay: 0.1 + 0.9 * smooth(RS_BREATH.gather, w0, t), curl: 0.55 - 0.5 * smooth(RS_BREATH.gather, w0, t) };
    if (t <= s1) return { splay: 1 - 0.25 * ((t - s0) / (s1 - s0)), curl: 0.05 };
    const off = smooth(RS_BREATH.pour, RS_BREATH.spent, t);
    const back = smooth(RS_BREATH.spent, RS_BREATH.long, t);
    return { splay: 0.75 - 0.6 * off + 0.1 * back, curl: 0.05 + 0.35 * off - 0.2 * back };
  }
  if (move === 'walk') {
    const a = (t / DRIFT_LONG) * TAU;
    return { splay: 0.2 + 0.05 * Math.sin(2 * a), curl: 0.2 + 0.06 * Math.sin(2 * a + 1) };
  }
  if (move === 'reel') return { splay: 0.2 + 0.8 * Math.sin(Math.PI * clamp01(t / RS_REEL)), curl: 0.15 };
  if (move === 'dying') return { splay: 0.2 + 0.8 * smooth(0, 0.38, t), curl: 0.1 };
  const a = (t / RS_STAND_LONG) * TAU;
  return { splay: 0.25 + 0.1 * Math.sin(a + 1), curl: 0.15 + 0.12 * Math.sin(a * 2 + 0.3) };
}
/** THE WARNING: the cold gathering pale in its hollow, from as it straightens to just after it breathes out. */
function glintAt(move: string, t: number): number {
  if (move !== 'attack') return 0;
  if (t < 0.22 || t > RS_BREATH.hit + 0.2) return 0;
  if (t < RS_BREATH.warn[0] + 0.1) return (t - 0.22) / (RS_BREATH.warn[0] + 0.1 - 0.22);
  if (t <= RS_BREATH.hit) return 1;
  return 1 - (t - RS_BREATH.hit) / 0.2;
}
/** The frost over it: as it drifts; forming thick over it as it draws in; gone thin, spent; flaking away as it dies. */
export function frostAt(move: string, t: number): number {
  if (move === 'attack') return 0.55 + 0.45 * smooth(0.12, 0.6, t) - 0.75 * smooth(RS_BREATH.hit + 0.1, RS_BREATH.spent, t) + 0.3 * smooth(RS_BREATH.spent + 0.1, RS_BREATH.long, t);
  if (move === 'stand') return 0.55 + 0.05 * Math.sin((t / RS_STAND_LONG) * TAU);
  if (move === 'reel') return 0.55 - 0.15 * Math.sin(Math.PI * clamp01(t / RS_REEL));
  if (move === 'dying') return 0.55 * (1 - smooth(0.15, 1.1, t));
  return 0.55;
}
/** Its breath through a move (see `RimeSay.breath`). */
export function breathAt(move: string, t: number): { out: number; draw: number; pour: number; reach: number } {
  const none = { out: 0, draw: 0, pour: 0, reach: 0 };
  if (move === 'stand') return { ...none, out: clamp01(-Math.cos((t / RS_STAND_LONG) * TAU) * 1.2) };
  if (move === 'walk') return { ...none, out: 0.35 + 0.2 * Math.sin((t / DRIFT_LONG) * TAU * 2) };
  if (move === 'attack') {
    return {
      out: 0.8 * smooth(RS_BREATH.pour - 0.05, RS_BREATH.pour + 0.2, t) * (1 - smooth(2.0, RS_BREATH.long, t)),
      draw: smooth(0.24, 0.42, t) * (1 - smooth(RS_BREATH.strike[0] - 0.02, RS_BREATH.strike[0] + 0.01, t)),
      pour: smooth(RS_BREATH.strike[0] + 0.01, RS_BREATH.hit, t) * (1 - smooth(1.12, RS_BREATH.pour + 0.05, t)),
      reach: 1.0 * TILE3,
    };
  }
  if (move === 'reel') return { ...none, out: 0.4 * Math.sin(Math.PI * clamp01(t / RS_REEL)) };
  if (move === 'dying') return { ...none, out: smooth(0.15, 0.3, t) * (1 - smooth(0.7, 1.1, t)) };
  return none;
}

/** The strike of its one move: from the last frame of the wind-up to the frame it lands on. */
export const RS_STRIKES: Readonly<Record<string, readonly [number, number]>> = { attack: RS_BREATH.strike };
/** Whether a frame of a move shows its strike's smear: from the frame after its wind-up ends to the frame after it lands (thinning then). */
export function smearedAt(move: string, t: number): boolean {
  const s = RS_STRIKES[move];
  return !!s && t > s[0] + 1e-6 && t <= s[1] + FR + 1e-6;
}
/** THE SMEAR: after-images of its head and hood, and of its arms flung back, along the way they have come since its wind-up ended. */
function smearOf(move: string, t: number): V3[][] | null {
  if (!smearedAt(move, t)) return null;
  const [s0, s1] = RS_STRIKES[move];
  const to = Math.min(t, s1);
  const out: V3[][] = [];
  const n = 4;
  for (let i = 0; i <= n; i++) {
    const u = s0 - FR * 0.5 + ((to - (s0 - FR * 0.5)) * i) / n;
    const s = bonesOf(move, u);
    const h = handsAt(move, u);
    const fl = fingersOf(s, 'L', h.splay, h.curl);
    const frr = fingersOf(s, 'R', h.splay, h.curl);
    out.push([s.neck, s.head, hollowOf(s)], [s.elbowL, s.handL, fl.tips[1]], [s.elbowR, s.handR, frr.tips[1]]);
  }
  return t > s1 + 1e-6 ? out.slice(Math.floor(out.length / 2)) : out;
}
/** What every moment of its moves says over and above its bones (for its painter). */
export const RS_SAY: RimeSay = {
  lag: (m) => lagAt(byName[m.move ?? ''] ?? 'stand', m.t),
  hands: (m) => handsAt(byName[m.move ?? ''] ?? 'stand', m.t),
  frost: (m) => frostAt(m.dying ? 'dying' : (byName[m.move ?? ''] ?? 'stand'), m.t),
  formed: (m) => (m.dying ? 1 - smooth(RS_DIES.unravel[0], RS_DIES.unravel[1], m.t) : 1),
  tear: (m) => {
    const move = byName[m.move ?? ''] ?? '';
    if (move === 'reel') return smooth(0, 0.05, m.t) * (1 - smooth(0.08, 0.34, m.t));
    if (move === 'dying') return smooth(0, 0.06, m.t) * (1 - smooth(0.12, 0.4, m.t));
    return 0;
  },
  crack: (m) => {
    const move = m.dying ? 'dying' : (byName[m.move ?? ''] ?? '');
    if (move === 'reel') return { k: 1.0, since: m.t };
    if (move === 'dying') return { k: 1.6, since: Math.max(0, m.t - 0.02) };
    return null;
  },
  stream: (m) => {
    const move = m.dying ? 'dying' : (byName[m.move ?? ''] ?? '');
    if (move === 'walk') return 1.5;
    if (move === 'attack') return 1 + 0.5 * smooth(0.2, 0.5, m.t) * (1 - smooth(0.75, 0.9, m.t)) + 1.6 * smooth(1.0, 1.45, m.t) * (1 - smooth(2.0, RS_BREATH.long, m.t));
    if (move === 'dying') return 1 + 3 * smooth(0.3, 1.0, m.t);
    if (move === 'reel') return 2;
    return 1 + 0.35 * Math.sin((m.t / RS_STAND_LONG) * TAU);
  },
  breath: (m) => breathAt(m.dying ? 'dying' : (byName[m.move ?? ''] ?? 'stand'), m.t),
  smear: (m) => smearOf(byName[m.move ?? ''] ?? '', m.t),
};

// =============================================================================================
// IT, AS THE GAME HOLDS A MONSTER

function rimeMob(): Mob {
  const paint = rimePainter(RS_SAY);
  const mv = (key: keyof typeof RS_NAMES, motion: Motion, more: Partial<MobMove> = {}): MobMove => ({ name: RS_NAMES[key], motion, rest: R, glint: (t) => glintAt(key, t), ...more });
  return {
    id: 'rime-shade',
    name: 'The Rime Shade',
    size: "small: hunched, the knight's height; straightened, taller",
    build: B,
    stand: mv('stand', motionOf(PLANS.stand, true)),
    attack: mv('attack', motionOf(PLANS.attack)),
    idleFrames: 24,
    idleFps: 10,
    walk: mv('walk', motionOf(PLANS.walk, true), { period: DRIFT_LONG, ground: RS_PACE * TILE3 }),
    walkFrames: RS_DRIFT.frames,
    walkFps: RS_DRIFT.fps,
    pace: RS_PACE,
    reel: mv('reel', motionOf(PLANS.reel)),
    reelTime: RS_REEL,
    hit: RS_BREATH.hit,
    warn: RS_BREATH.warn[1] - RS_BREATH.warn[0],
    dieTime: RS_DIES.long,
    dying: mv('dying', motionOf(PLANS.dying)),
    aura: { x: RS_CANVAS.ax, y: RS_CANVAS.ay - 44, r: 36, color: '#aab2c4', a: 0.06 },
    shadow: 12,
    canvas: RS_CANVAS,
    trueBack: true,
    bits: paint.bits,
    grains: paint.grains,
    finish: paint.finish,
  };
}
export const RIME_SHADE = rimeMob();
export function makeRimeShadeArt3(mob: Mob = RIME_SHADE): ActorArt {
  return { front: mobSet(mob, 'front', mob.pace), back: mobSet(mob, 'back', mob.pace) };
}

// =============================================================================================
// IT AS THE CHECKS SEE IT (art/boss_checks.ts)

const len3 = (v: V3): number => Math.hypot(v[0], v[1], v[2]);
/** Its outside as painted: its arms, its legs and its neck as limbs; its hood, its hump, its chest, its waist, its hips and its shroud as solids. */
export function rimeSolids(s: Skeleton): { limbs: CheckLimb[]; lumps: CheckLump[] } {
  const [r0, r1] = B.armR;
  const limbs: CheckLimb[] = [];
  for (const side of ['L', 'R'] as const) {
    const L = side === 'L';
    limbs.push(
      { name: `upper${side}`, a: L ? s.shoulderL : s.shoulderR, b: L ? s.elbowL : s.elbowR, r: r0 },
      { name: `fore${side}`, a: L ? s.elbowL : s.elbowR, b: L ? s.handL : s.handR, r: r1 * 0.9 },
      { name: `leg${side}`, a: L ? s.hipL : s.hipR, b: L ? s.kneeL : s.kneeR, r: B.legR[0] },
      { name: `shin${side}`, a: L ? s.kneeL : s.kneeR, b: L ? s.ankleL : s.ankleR, r: B.legR[1] },
    );
  }
  limbs.push({ name: 'neck', a: s.neck, b: lerp3(s.neck, s.skull, 0.8), r: 2.6 });
  const hump = humpOf(s);
  const sh = shroudOf(s, [0, 0, 0]);
  const top = sh[sh.length - 1];
  const mid = sh[Math.floor(sh.length / 2)];
  const lumps: CheckLump[] = [
    { name: 'head', c: s.head, rot: s.face, h: [B.headR[0] * 1.1, B.headR[1] * 1.12, B.headR[2] * 1.05] },
    { name: 'hump', c: hump.c, rot: s.upper, h: [len3(hump.ax[0]), len3(hump.ax[1]), len3(hump.ax[2])] },
    { name: 'chest', c: lerp3(s.ribs, s.neck, 0.3), rot: s.chest, h: [B.ribDeep + 2.4, B.ribHalf + 2.4, len3(sub(s.neck, s.ribs)) * 0.55] },
    { name: 'belly', c: lerp3(s.waist, s.ribs, 0.45), rot: s.belly, h: [B.waistDeep + 2.2, B.waistHalf + 2.2, Math.max(3, len3(sub(s.ribs, s.waist)) * 0.6)] },
    { name: 'hips', c: add(s.pelvis, mul(s.hips[2], 1.0)), rot: s.hips, h: [B.pelvisDeep + 2.6, B.pelvisHalf + 2.8, 3.2] },
    { name: 'shroud', c: lerp3(top.c, mid.c, 0.5), rot: s.hips, h: [len3(top.u) * 0.9, len3(top.v) * 0.9, 4] },
  ];
  return { limbs, lumps };
}
const ALL_MOVES = ['stand', 'walk', 'attack', 'reel', 'dying'];
const walkFrames = Array.from({ length: RS_DRIFT.frames + 1 }, (_, i) => i / RS_DRIFT.fps);
export const RS_SHAPE: BossShape = {
  body: rimeSolids,
  // (what strikes: its hollow, as it breathes out)
  tip: (move, _t, s) => (move === 'attack' ? hollowOf(s) : null),
  // (its icicle fingers, which may lie along their own forearm)
  things: (move, t, s) => {
    const h = handsAt(move, t);
    return (['L', 'R'] as const).map((side): CheckThing => {
      const f = fingersOf(s, side, h.splay, h.curl);
      return { name: `icicles ${side}`, pts: [...f.knuckles, ...f.tips], r: 0.5, may: [`fore${side}`] };
    });
  },
  follow: (_move, _t, s) => ({ head: s.head, chest: s.ribs, pelvis: s.pelvis, handL: s.handL, handR: s.handR, elbowL: s.elbowL, elbowR: s.elbowR }),
  strikes: RS_STRIKES,
  smeared: smearedAt,
  handovers: [
    ...ALL_MOVES.filter((m) => m !== 'stand' && m !== 'walk').flatMap((m): Handover[] => (m === 'dying' ? [{ from: 'stand', at: 0, to: m, toAt: 0 }] : [{ from: 'stand', at: 0, to: m, toAt: 0 }, { from: m, at: 'end', to: 'stand', toAt: 0 }])),
    { from: 'stand', at: 0, to: 'walk', toAt: 0 },
    // (its drift, from any step of it: into its stand, its breath, struck, struck down; and its breath and struck back into it)
    ...walkFrames.flatMap((at): Handover[] => [
      { from: 'walk', at, to: 'stand', toAt: 0 },
      { from: 'walk', at, to: 'attack', toAt: 0 },
      { from: 'walk', at, to: 'reel', toAt: 0 },
      { from: 'walk', at, to: 'dying', toAt: 0 },
    ]),
    { from: 'attack', at: 'end', to: 'walk', toAt: 0 },
    { from: 'reel', at: 'end', to: 'walk', toAt: 0 },
  ],
};
export { poseOf as rimePoseOf, bonesOf as rimeBonesOf };
