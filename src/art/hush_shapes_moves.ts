// FLOOR 20'S SHAPES OF THE HUSH: THEIR MOVES (the art chat, 29 Oct 2026). A MOCK-UP: NOT IN THE GAME, behind
// HUSHSHAPES_ON (art/hush_shapes.ts, off). Their look and the brief are art/hush_shapes.ts.
//
// His pick for how they move: “Drifting, then darting (Recommended)”. His rules for every attack from the Princess on
// (his Movement 9, 24 Oct: “Like the wind up and wind down are big but the actual punch is lightning quick”; for the
// enemies, 28 Oct: “Start from now on, but every enemy is going to need that change eventually.  And bigger AOE to
// compensate for the extra time the player gets to evade”), and for speed and size (28 Oct: “It’s all too slow and too
// narrow and too small.  I could dodge anything you’ve put in these moves with my eyes closed”): every strike two frames,
// smeared with its after-images, after a big held wind-up and before a big wind-down; the dart and the grip as fast and as
// big as the brief says from this first pass, measured in tiles (TILE3 a tile).
//
// THEIR MOVES:
//   HOVERING (their stand): hunched, faceless, a hand over the floor, rising and sinking, swaying; the long arms hanging
//     before it and stirring, the long fingers curling and uncurling; its head turning slowly; its mouth gaping wider and
//     narrower without a sound; the fog streaming off it.
//   THE DRIFT (their walk, `HS_PACE` tiles a second): slow, leaning into its way, bobbing on nothing, the arms trailing,
//     its tail streaming out behind it.
//   THE DART (`HS_DART`): NO LONGER ONE OF THEIR MOVES (their rhythm of 30 Oct, below); its code kept, nothing plays it.
//     It drew in on itself, held, went four tiles in two frames, smeared, and reared back as it braked.
//   THEIR RHYTHM (30 Oct): his pick “Yes, these (Recommended)”, to this, offered to make Act 2's enemies differ: "THE
//     HUSH'S SHAPES never still, swirling round you in a tightening spiral, faster as they close, then wrapping you".
//     THE CIRCLING GLIDES (`HS_GLIDES`): always facing you, going round you to its left or to its right, slow out on the
//     far ring and fast on the near one (`HS_CIRCLE`), leaning into the turn, its fog streaming out behind it round the
//     curve of the ring. THE SWOOP (`HS_SWOOP`, `swoopLeft`, `swoopRight`): its grip, wound up by the swirl's last fast turn:
//     a burst round you, its arms flung wide as it brakes square before you, held; then its grip as it always was (the
//     snap in two frames, the grip held); and it lets go and swirls off round you again.
//   THE GRIP (their attack, `HS_GRIP`): it rears up, its arms spread wide to either side, its fingers splayed, its mouth
//     gaping, the pink deep in its throat burning (THE WARNING, held, shivering); hips first; then in two frames its arms
//     snap shut round the space before it, smeared, crossing over, and close round whoever is there; it holds them a
//     moment, squeezing; it lets go and sinks back. Where its arms close the game draws the grip (art/hush_shapes.ts
//     `gripPainted`): coils of its grey fog wound round whoever it caught.
//   STRUCK: jolted back, its arms flung out, its fog torn through and closing again.
//   ITS DEATH: struck, it arches back, its head thrown back, its mouth stretched wide; the word it swallowed comes up out
//     of it; it rises and unravels into wisps, thinning to nothing, while the word takes its own colour again and flies
//     away, home.
//
// By his rulebook: every move through every check the bosses have (art/boss_checks.ts), from in front and behind.
//   test: tsx --test tests/hush_shapes.test.ts

import type { ActorArt } from './actor_types';
import type { BossShape, CheckLimb, CheckLump, CheckThing, Handover } from './boss_checks';
import { HANG_L, HANG_R, HS_BODY, HS_CANVAS, HS_REST, elbowsTo, fingersOf, humpOf, hushPainter, tailOf } from './hush_shapes';
import type { HushSay } from './hush_shapes';
import { TILE3, mobSet } from './new_mobs3';
import type { Mob, MobMove, Moment } from './new_mobs3';
import { add, elbowFor, lerp3, len, mul, norm, solve, sub } from './skeleton';
import type { Bones, Key3, Motion, Posed, Skeleton, V3 } from './skeleton';

type P = Partial<Bones>;
const B = HS_BODY;
const R = HS_REST;
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
// A MOVE THROUGH KEY POSES (as the Princess's, art/princess_moves.ts): every field through its keys smoothly, slow to start
// and slow to stop at each turn, but straight through a lightning strike; sampled on every frame the game shows

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
/** A key pose with the ways its elbows are put (`E`): kept with it, so that between keys the elbows go from the one way to the other (and are put so on every frame), not the numbers that say it, which are measured from a line that turns as a hand crosses the body. */
type PW = P & { _wl?: V3; _wr?: V3 };
function poseFn(plan: Plan): (t: number, elbows?: boolean) => P {
  const full = plan.keys.map(([t, p]) => [t, { ...R, ...p } as unknown as Record<string, number>] as const);
  const fields = Object.keys(full[0][1]).filter((k) => k !== 'lhIn' && k !== 'rhIn' && typeof full[0][1][k] === 'number');
  const tracks = new Map(fields.map((k) => [k, track(full.map(([t, p]) => [t, p[k]] as const))]));
  const st = plan.strike;
  const at = (t: number): Record<string, number> | undefined => full.find(([kt]) => Math.abs(kt - t) < 1e-6)?.[1];
  const a0 = st ? at(st[0]) : undefined;
  const a1 = st ? at(st[1]) : undefined;
  // (the ways the elbows are put, key by key, followed as the fields are)
  const wants = plan.keys.map(([, p]) => [...norm((p as PW)._wl ?? HANG_L), ...norm((p as PW)._wr ?? HANG_R)]);
  const wTracks = [0, 1, 2, 3, 4, 5].map((j) => track(plan.keys.map(([t], i) => [t, wants[i][j]] as const)));
  const i0 = st ? plan.keys.findIndex(([kt]) => Math.abs(kt - st[0]) < 1e-6) : -1;
  const i1 = st ? plan.keys.findIndex(([kt]) => Math.abs(kt - st[1]) < 1e-6) : -1;
  return (t, elbows = true) => {
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
/** Its hands, each from its own shoulder along the figure's own forward, left and up. */
const hands = (l: V3, r: V3): P => ({ lhIn: 1, lhx: l[0], lhy: l[1], lhz: l[2], rhIn: 1, rhx: r[0], rhy: r[1], rhz: r[2] });
/** Its folded legs go up and down with it (they are never seen: inside its tail). */
const legsAt = (pz: number, px: number): P => ({ lfz: R.lfz + (pz - R.pz), rfz: R.rfz + (pz - R.pz), lfx: R.lfx + px, rfx: R.rfx + px });
const at = (pz: number, more: P): P => ({ pz, ...legsAt(pz, (more.px as number | undefined) ?? 0), ...more });
/** A pose with its elbows put toward these ways. */
const E = (pose: P, wl: V3, wr: V3): P => ({ ...elbowsTo(R, pose, wl, wr), _wl: wl, _wr: wr }) as P;
const OUT_L: V3 = [0, 1, -0.3];
const OUT_R: V3 = [0, -1, -0.3];
const L0: V3 = [R.lhx, R.lhy, R.lhz];
const R0: V3 = [R.rhx, R.rhy, R.rhz];

// =============================================================================================
// HOVERING (their stand)

export const HS_STAND_LONG = 2.4;
function standPose(t: number): P {
  const a = (t / HS_STAND_LONG) * TAU;
  const pz = R.pz + 1.5 * Math.sin(a);
  return E(at(pz, {
    py: 1.3 * Math.sin(a + 0.6), roll: 2.2 * Math.sin(a + 0.6), side: 1.6 * Math.sin(a + 0.6),
    pitch: R.pitch + 1.6 * Math.sin(a + 1.3), bend: R.bend - 2.2 * Math.sin(a),
    faceTurn: 12 * Math.sin(a + 0.4), faceUp: R.faceUp + 3 * Math.sin(2 * a), faceTilt: 6 * Math.sin(a + 1.2),
    ...hands([L0[0] + 1.8 * Math.sin(a + 0.8), L0[1] + 0.8 * Math.sin(a + 1.6), L0[2] + 1.3 * Math.sin(a + 0.8)], [R0[0] + 1.6 * Math.sin(a + 0.8 + Math.PI), R0[1] + 0.8 * Math.sin(a + 2.4), R0[2] + 1.2 * Math.sin(a + 0.8 + Math.PI)]),
  }), HANG_L, HANG_R);
}
const standPlan = (): Plan => ({ long: HS_STAND_LONG, keys: Array.from({ length: 49 }, (_, i) => [(i / 48) * HS_STAND_LONG, standPose((i / 48) * HS_STAND_LONG)] as const) });

// =============================================================================================
// THE DRIFT (their walk): slow, leaning into its way, bobbing on nothing

/** Its drift, tiles a second (the knight walks 2.5; the city's Hushed shuffle 0.9): slow, as his pick says, until it darts. */
export const HS_PACE = 1.5;
export const HS_DRIFT = { frames: 12, fps: 10 } as const;
const DRIFT_LONG = HS_DRIFT.frames / HS_DRIFT.fps;
function driftPose(t: number): P {
  const a = (t / DRIFT_LONG) * TAU;
  const pz = R.pz + 0.6 + 1.2 * Math.sin(a);
  return E(at(pz, {
    px: 0.8, py: 0.8 * Math.sin(a + 0.5), roll: 1.6 * Math.sin(a + 0.5), side: 1.0 * Math.sin(a + 0.5),
    pitch: R.pitch + 4 + 1.2 * Math.sin(a + 1.0), bend: R.bend + 2 - 1.2 * Math.sin(a),
    faceTurn: 2 * Math.sin(a), faceUp: R.faceUp + 3 + 1.5 * Math.sin(a + 0.6), faceTilt: 2 * Math.sin(a + 1.4),
    ...hands([L0[0] - 2.2 + 1.2 * Math.sin(a + 0.9), L0[1] + 0.6, L0[2] + 0.6 + 0.9 * Math.sin(a + 0.9)], [R0[0] - 2.2 + 1.2 * Math.sin(a + 0.9 + Math.PI), R0[1] - 0.6, R0[2] + 0.6 + 0.9 * Math.sin(a + 0.9 + Math.PI)]),
  }), HANG_L, HANG_R);
}
const driftPlan = (): Plan => ({ long: DRIFT_LONG, keys: Array.from({ length: 25 }, (_, i) => [(i / 24) * DRIFT_LONG, driftPose((i / 24) * DRIFT_LONG)] as const) });

// =============================================================================================
// THE DART: drawn in, held; four tiles in two frames; rearing back as it brakes

/**
 * The dart's times: drawn in by `warn[0]` and held shivering to `warn[1]`; the strike, from the last frame of the wind-up
 * to the frame it arrives on (two frames); over by `long`. `carry`: how far it goes in those two frames (the figure's own
 * lengths: four tiles). It goes in its own picture, from where the game has it; AT ITS END THE GAME MOVES IT THERE (the
 * checks' `shift`), and it stands, or grips, from where it arrived.
 */
export const HS_DART = { long: 1.0, warn: [0.17, 0.37] as const, strike: [12 / FPS, 14 / FPS] as const, carry: 4 * TILE3 } as const;
/** How far it has gone `t` seconds into its dart (the figure's own lengths, the way it faces). */
export function dartCarry(t: number): number {
  const [s0, s1] = HS_DART.strike;
  return t <= s0 ? 0 : t >= s1 ? HS_DART.carry : (HS_DART.carry * (t - s0)) / (s1 - s0);
}
const COIL: P = E(at(R.pz - 3.5, { px: -2.5, pitch: 7, bend: 20, faceUp: 8, faceTilt: 0, faceTurn: 0, ...hands([-7, 7, -21], [-7, -7, -21]) }), [-1, 0.6, 0], [-1, -0.6, 0]);
const COIL_SHIVER: P = E({ ...COIL, ...hands([-7.3, 7.3, -20.7], [-6.8, -7.3, -21.3]), pz: (COIL.pz as number) + 0.35 }, [-1, 0.6, 0], [-1, -0.6, 0]);
const DART_GO: P = E({ ...COIL, pitch: 15, px: -1, bend: 22 }, [-1, 0.6, 0], [-1, -0.6, 0]);
const C = HS_DART.carry;
const RUSH: P = E(at(R.pz - 1, { px: C + 4, pitch: 38, bend: 34, faceUp: 16, ...hands([-15, 8, -15], [-15, -8, -15]) }), [-0.6, 0.5, 0.6], [-0.6, -0.5, 0.6]);
const BRAKE: P = E(at(R.pz + 2.5, { px: C - 2, pitch: 6, bend: 16, faceUp: -2, faceTilt: 3, ...hands([13, 5, -25], [13, -5, -25]) }), OUT_L, OUT_R);
const SETTLE: P = E(at(R.pz + 0.5, { px: C + 0.5, pitch: 24, bend: 30, faceUp: 2, ...hands([6, 4, -30], [5, -4, -30]) }), HANG_L, HANG_R);
function dartPlan(): Plan {
  const [w0, w1] = HS_DART.warn;
  const [s0, s1] = HS_DART.strike;
  return {
    long: HS_DART.long,
    strike: HS_DART.strike,
    keys: [
      [0, {}],
      [w0, COIL],
      [0.27, COIL_SHIVER],
      [w1, COIL],
      [s0, DART_GO],
      [s1, RUSH],
      [0.62, BRAKE],
      [0.82, SETTLE],
      [HS_DART.long, at(R.pz, { px: C })],
    ],
  };
}

// =============================================================================================
// THE GRIP (their attack): arms spread wide, held; snapped shut round the space before it in two frames; held; let go

/**
 * The grip's times: rearing up and spreading its arms to `warn[0]`, held shivering to `warn[1]`; hips first; the strike
 * (two frames), landing at `hit`; holding whoever it caught to `hold`; let go and sunk back by `long`.
 */
export const HS_GRIP = { long: 1.7, warn: [0.33, 0.62] as const, strike: [20 / FPS, 22 / FPS] as const, hit: 22 / FPS, hold: 1.13 } as const;
const RISING: P = E(at(R.pz + 3, { pitch: 12, bend: 18, faceUp: 6, ...hands([2, 17, -14], [2, -17, -14]) }), [-0.4, 0.5, -1], [-0.4, -0.5, -1]);
const SPREAD: P = E(at(R.pz + 5, { px: -2.5, pitch: 4, bend: 10, faceUp: 12, ...hands([3, 33, 6], [3, -33, 6]) }), [-0.3, 0.3, -1], [-0.3, -0.3, -1]);
const SPREAD_SHIVER: P = E({ ...SPREAD, pz: (SPREAD.pz as number) + 0.3, ...hands([2.7, 33.4, 6.4], [2.8, -33.3, 6.3]) }, [-0.3, 0.3, -1], [-0.3, -0.3, -1]);
const HIPS_FIRST: P = E(at(R.pz + 3.6, { px: 1, pitch: 13, bend: 11, faceUp: 12, ...hands([3, 33, 6], [3, -33, 6]) }), [-0.3, 0.3, -1], [-0.3, -0.3, -1]);
/** SHUT: lunged in, its arms snapped round before it and crossing, the left over the right. */
const SHUT: P = E(at(R.pz - 1, { px: 11, pitch: 33, bend: 30, faceUp: 10, ...hands([33, -9, -9], [33, 9, -19]) }), [0, 1, 0.25], [0, -1, 0.25]);
const WRAPPED: P = E(at(R.pz - 1.5, { px: 14, pitch: 35, bend: 31, faceUp: 8, ...hands([31, -16, -9], [31, 16, -20]) }), [0, 1, 0.25], [0, -1, 0.25]);
const SQUEEZE: P = E({ ...WRAPPED, ...hands([30, -17, -9.5], [30, 17, -20.5]), pz: (WRAPPED.pz as number) - 0.5 }, [0, 1, 0.25], [0, -1, 0.25]);
const UNCROSS: P = E(at(R.pz - 1, { px: 9, pitch: 31, bend: 30, faceUp: 5, ...hands([25, 1, -8], [25, -1, -25]) }), [0, 1, 0.25], [0, -1, 0.25]);
const RELEASE: P = E(at(R.pz - 0.5, { px: 5, pitch: 27, bend: 30, faceUp: 3, ...hands([10, 12, -22], [10, -12, -27]) }), OUT_L, OUT_R);
function gripPlan(): Plan {
  const [w0, w1] = HS_GRIP.warn;
  const [s0, s1] = HS_GRIP.strike;
  return {
    long: HS_GRIP.long,
    strike: HS_GRIP.strike,
    hit: HS_GRIP.hit,
    keys: [
      [0, {}],
      [0.18, RISING],
      [w0, SPREAD],
      [0.47, SPREAD_SHIVER],
      [w1, SPREAD],
      [s0, HIPS_FIRST],
      [s1, SHUT],
      [0.86, WRAPPED],
      [0.98, SQUEEZE],
      [HS_GRIP.hold, WRAPPED],
      [1.27, UNCROSS],
      [1.44, RELEASE],
      [HS_GRIP.long, {}],
    ],
  };
}
/** Where its grip closes, on the floor (the figure's own lengths, forward of where it hovers): the middle of its hands as they snap shut. */
export function gripAt(): V3 {
  const s = solve(B, { ...R, ...poseOf('attack', HS_GRIP.hit) } as Posed);
  const m = lerp3(s.handL, s.handR, 0.5);
  return [m[0], m[1], 0];
}

// =============================================================================================
// THEIR RHYTHM (30 Oct): his pick, “Yes, these (Recommended)”, to make Act 2's enemies differ, to this as offered: "THE
// HUSH'S SHAPES never still, swirling round you in a tightening spiral, faster as they close, then wrapping you". No
// drift then dart: always moving, each going round you, the swarm spiralling in; then, one after another, the swoop.

/**
 * THE SPIRAL (the game steers them; these are the numbers their pictures are painted for, and a start for the game's):
 * each goes round you on a ring, facing you, its ring closing in at `closing` tiles a second from `slow.ring` to
 * `fast.ring`, its pace (tiles a second along the ring) rising as it closes, from `slow.pace` to `fast.pace`; the
 * game plays the slow glide out to `switchAt` tiles and the fast one inside it. On the near ring it swoops: its ring
 * closing to `grip` (where its grip shuts round you, `gripAt`), its pace bursting to `burst` and braking to nothing.
 */
export const HS_CIRCLE = {
  slow: { pace: 3.0, ring: 5.0 },
  fast: { pace: 6.5, ring: 2.5 },
  closing: 0.8,
  switchAt: 3.75,
  burst: 8.0,
  grip: 1.5,
} as const;
/** Its pace (tiles a second round you) on a ring `r` tiles out: from the far ring's to the near ring's, faster as it closes. */
export function circlePace(r: number): number {
  const { slow, fast } = HS_CIRCLE;
  const k = Math.max(0, Math.min(1, (slow.ring - r) / (slow.ring - fast.ring)));
  return slow.pace + (fast.pace - slow.pace) * k;
}
/** THE CIRCLING GLIDES: the way each goes (`side`: 1 to its own left, -1 to its right) and whether on the near ring, fast. Each a round of the walk's frames (12 at 10 a second), all facing you. */
export const HS_GLIDES = {
  circleLeft: { side: 1, fast: 0 },
  circleRight: { side: -1, fast: 0 },
  circleLeftFast: { side: 1, fast: 1 },
  circleRightFast: { side: -1, fast: 1 },
} as const;
export type GlideName = keyof typeof HS_GLIDES;
export const HS_GLIDE_MOVES = Object.keys(HS_GLIDES) as GlideName[];
const glideOf = (move: string): { side: number; fast: number } | undefined => (HS_GLIDES as Record<string, { side: number; fast: number }>)[move];
/** A glide's pace and the ring it is painted for (tiles). */
export const glidePace = (move: GlideName): number => (HS_GLIDES[move].fast ? HS_CIRCLE.fast.pace : HS_CIRCLE.slow.pace);
export const glideRing = (move: GlideName): number => (HS_GLIDES[move].fast ? HS_CIRCLE.fast.ring : HS_CIRCLE.slow.ring);
const CIRCLE_LONG = DRIFT_LONG;
/** Its hands, the leading one (on the side it goes to) and the trailing one, each moved from where it hangs: forward, out to its own side, up. */
function handsBy(side: number, lead: V3, trail: V3): P {
  const L = side > 0 ? lead : trail;
  const Rr = side > 0 ? trail : lead;
  return hands([L0[0] + L[0], L0[1] + L[1], L0[2] + L[2]], [R0[0] + Rr[0], R0[1] - Rr[1], R0[2] + Rr[2]]);
}
/**
 * A CIRCLING GLIDE at a moment: facing you (its gape on you, its head turned back to you), its body turned a little into
 * the way it goes and leaning into the turn (in toward you, and over into its going); bobbing on nothing; its leading
 * hand reaching on round the ring, the trailing one dragged out behind; more so, fast.
 */
function circlePose(t: number, side: number, fast: number): P {
  const a = (t / CIRCLE_LONG) * TAU;
  const k = fast;
  const yaw = side * (11 + 7 * k);
  const w = Math.sin(2 * a);
  return E(at(R.pz + 1.2 + 0.9 * w, {
    px: 0.6 + 0.6 * k, py: 0.5 * Math.sin(a + 0.4),
    yaw, roll: -side * (5 + 4 * k) + 0.8 * Math.sin(a + 0.6), side: -side * (2.5 + 2 * k) + 0.6 * Math.sin(a + 0.6),
    pitch: R.pitch + 3 + 3 * k + 1.0 * Math.sin(2 * a + 1.0), bend: R.bend + 1 - 1.2 * w,
    faceTurn: -yaw * 0.85 + 2.5 * Math.sin(a + 0.3), faceUp: R.faceUp + 2 + 1.5 * Math.sin(2 * a + 0.5), faceTilt: side * (3 + 3 * k),
    ...handsBy(side,
      [0.3 + 0.5 * k + 0.6 * Math.sin(2 * a + 0.8), 0.3 * k + 0.4 * Math.sin(2 * a + 0.4), 0.4 + 0.6 * k + 0.6 * Math.sin(2 * a + 0.8)],
      [-2.5 - 1.5 * k + 0.7 * Math.sin(2 * a + 2.2), 4 + 2.5 * k + 0.5 * Math.sin(2 * a + 1.8), 2 + 1 * k + 0.8 * Math.sin(2 * a + 2.2)]),
  }), HANG_L, HANG_R);
}
const circlePlan = (side: number, fast: number): Plan => ({ long: CIRCLE_LONG, keys: Array.from({ length: 25 }, (_, i) => [(i / 24) * CIRCLE_LONG, circlePose((i / 24) * CIRCLE_LONG, side, fast)] as const) });

/**
 * THE SWOOP (its grip, wound up by the swirl's last fast turn): from the near ring, a burst round you (`turn`), its arms
 * rising and flung wide, its mouth gaping, the pink in its throat burning, as it brakes square before you on the grip's
 * ring; held there, shivering (THE WARNING, `warn`); then its grip as it always was: hips first, the snap in two frames
 * (`strike`, landing at `hit`), the grip held (to `hold`); it lets go and swirls off round you again (`off`), into its
 * slow glide. Times in seconds.
 */
export const HS_SWOOP = { long: HS_GRIP.long, turn: [0, 0.36] as const, warn: [0.36, HS_GRIP.warn[1]] as const, strike: HS_GRIP.strike, hit: HS_GRIP.hit, hold: HS_GRIP.hold, off: [1.27, HS_GRIP.long] as const } as const;
export const HS_SWOOPS = { swoopLeft: 1, swoopRight: -1 } as const;
export type SwoopName = keyof typeof HS_SWOOPS;
const swoopSide = (move: string): number => (HS_SWOOPS as Record<string, number>)[move] ?? 0;
/** The game's carrying it through the swoop, along the ring (tiles a second, the way it goes): the near ring's pace bursting to its fastest, braking to nothing square before you; still through the grip; picking up again to the far ring's pace as it swirls off. */
const SWOOP_V = track([[0, HS_CIRCLE.fast.pace], [0.13, HS_CIRCLE.burst], [HS_SWOOP.turn[1], 0], [HS_SWOOP.off[0], 0], [1.6, HS_CIRCLE.slow.pace], [HS_SWOOP.long, HS_CIRCLE.slow.pace]]);
/** And in toward you (as a share of the way in, a second): its ring closing from the near ring to the grip's through its last turn. */
const SWOOP_IN = track([[0, 0], [0.1, 1], [0.28, 1], [HS_SWOOP.turn[1], 0]]);
const SWOOP_IN_ALL = ((): number => {
  let a = 0;
  for (let i = 0; i < 1000; i++) a += SWOOP_IN(((i + 0.5) / 1000) * HS_SWOOP.turn[1]) * (HS_SWOOP.turn[1] / 1000);
  return a;
})();
const swoopAlong = new Map<string, [number, number]>();
/** How far the game has carried it, `t` seconds into its swoop (tiles): round the ring the way it goes, and in toward you. */
export function swoopCarry(t: number): { round: number; inward: number } {
  const key = t.toFixed(5);
  const had = swoopAlong.get(key);
  if (had) return { round: had[0], inward: had[1] };
  let round = 0;
  let inward = 0;
  const n = Math.max(1, Math.ceil(Math.max(0, t) / 0.002));
  const dt = Math.max(0, t) / n;
  for (let i = 0; i < n; i++) {
    round += SWOOP_V((i + 0.5) * dt) * dt;
    inward += SWOOP_IN((i + 0.5) * dt) * dt;
  }
  inward *= (HS_CIRCLE.fast.ring - HS_CIRCLE.grip) / SWOOP_IN_ALL;
  swoopAlong.set(key, [round, inward]);
  return { round, inward };
}
/** Its pace along the ring `t` seconds into its swoop (tiles a second). */
export const swoopPace = (t: number): number => SWOOP_V(Math.max(0, Math.min(HS_SWOOP.long, t)));
function swoopPlan(side: number): Plan {
  const [, w1] = HS_SWOOP.warn;
  const [s0, s1] = HS_SWOOP.strike;
  const BANK: P = E(at(R.pz + 2.2, {
    px: 0.5, yaw: side * 24, roll: -side * 13, side: -side * 6, pitch: R.pitch + 7, bend: R.bend - 4,
    faceTurn: -side * 21, faceUp: R.faceUp - 1, faceTilt: side * 7,
    ...handsBy(side, [1, 12, 6], [-6, 12, 9]),
  }), [-0.3, 0.8, -0.6], [-0.3, -0.8, -0.6]);
  const TURN_IN: P = E(at(R.pz + 4, {
    px: -1.5, yaw: side * 11, roll: -side * 6, side: -side * 3, pitch: 8, bend: 14,
    faceTurn: -side * 10, faceUp: 10, faceTilt: side * 3,
    ...hands(side > 0 ? [4, 27, 2] : [1, 28, 4], side > 0 ? [1, -28, 4] : [4, -27, 2]),
  }), [-0.3, 0.4, -1], [-0.3, -0.4, -1]);
  // (swirling off: its body turned into its going again, leaning into the turn, into its slow glide)
  const OFF: P = E(at(R.pz + 0.4, {
    px: 3, yaw: side * 7, roll: -side * 3, side: -side * 1.5, pitch: 22, bend: 32, faceTurn: -side * 6, faceUp: 4,
    ...handsBy(side, [5, 6, -1], [3, 8, -3]),
  }), OUT_L, OUT_R);
  return {
    long: HS_SWOOP.long,
    strike: HS_SWOOP.strike,
    hit: HS_SWOOP.hit,
    keys: [
      [0, circlePose(0, side, 1)],
      [0.13, BANK],
      [0.27, TURN_IN],
      [HS_SWOOP.turn[1], SPREAD],
      [0.47, SPREAD_SHIVER],
      [w1, SPREAD],
      [s0, HIPS_FIRST],
      [s1, SHUT],
      [0.86, WRAPPED],
      [0.98, SQUEEZE],
      [HS_SWOOP.hold, WRAPPED],
      [HS_SWOOP.off[0], UNCROSS],
      [1.46, OFF],
      [HS_SWOOP.long, circlePose(0, side, 0)],
    ],
  };
}

// =============================================================================================
// STRUCK, AND ITS DEATH

export const HS_REEL = 0.4;
const JOLT: P = E(at(R.pz + 2, { px: -4, pitch: 3, bend: 8, faceUp: 20, faceTilt: -6, ...hands([3, 11, -14], [3, -11, -13]) }), [-0.4, 1, -0.5], [-0.4, -1, -0.5]);
function reelPlan(): Plan {
  return { long: HS_REEL, keys: [[0, {}], [0.1, JOLT], [0.23, E(at(R.pz + 1, { px: -2, pitch: 14, bend: 22, faceUp: 6, ...hands([3, 8, -24], [3, -8, -23]) }), [-0.4, 1, -0.4], [-0.4, -1, -0.4])], [HS_REEL, {}]] };
}
/** Its death: struck (the jolt), arching back with its mouth stretched as the word comes up out of it, unravelling to nothing, the word flying home. */
export const HS_DIES = { long: 2.0, unravel: [0.35, 1.55] as const, word: [0.3, 0.8, 1.15, 1.45, 1.75] as const } as const;
function diesPlan(): Plan {
  return {
    long: HS_DIES.long,
    keys: [
      [0, {}],
      [0.1, { ...JOLT }],
      [0.36, E(at(R.pz + 5, { px: -3, pitch: 0, bend: -6, faceUp: 42, faceTilt: 0, ...hands([-4, 20, 4], [-4, -20, 6]) }), [-0.4, 1, -0.5], [-0.4, -1, -0.5])],
      [0.85, E(at(R.pz + 9, { px: -2, pitch: -2, bend: -4, faceUp: 30, ...hands([-2, 19, 13], [-2, -19, 15]) }), [-0.2, 0.7, -1], [-0.2, -0.7, -1])],
      [1.35, E(at(R.pz + 12, { px: -1.5, pitch: -1, bend: -2, faceUp: 26, ...hands([-1, 17, 19], [-1, -17, 21]) }), [-0.1, 0.8, -1], [-0.1, -0.8, -1])],
      [HS_DIES.long, E(at(R.pz + 14, { px: -1, pitch: 0, bend: -1, faceUp: 24, ...hands([0, 16, 22], [0, -16, 24]) }), [0, 0.8, -1], [0, -0.8, -1])],
    ],
  };
}

// =============================================================================================
// WHAT A MOMENT SAYS OVER AND ABOVE THE BONES

export const HS_NAMES = {
  stand: 'The Hush hovers',
  walk: 'The Hush drifts',
  attack: 'The grip',
  dart: 'The dart',
  reel: 'The Hush is struck',
  dying: 'It unravels; the word flies home',
  circleLeft: 'It circles you, to its left',
  circleRight: 'It circles you, to its right',
  circleLeftFast: 'It circles you fast, to its left',
  circleRightFast: 'It circles you fast, to its right',
  swoopLeft: 'It swoops round you to its left, and wraps you',
  swoopRight: 'It swoops round you to its right, and wraps you',
} as const;
const byName: Record<string, string> = Object.fromEntries(Object.entries(HS_NAMES).map(([k, v]) => [v, k]));
const PLANS: Record<string, Plan> = {
  stand: standPlan(), walk: driftPlan(), attack: gripPlan(), dart: dartPlan(), reel: reelPlan(), dying: diesPlan(),
  ...Object.fromEntries(HS_GLIDE_MOVES.map((g) => [g, circlePlan(HS_GLIDES[g].side, HS_GLIDES[g].fast)])),
  swoopLeft: swoopPlan(1), swoopRight: swoopPlan(-1),
};
const POSES: Record<string, (t: number, elbows?: boolean) => P> = Object.fromEntries(Object.entries(PLANS).map(([k, p]) => [k, poseFn(p)]));
const LOOPS = new Set<string>(['stand', 'walk', ...HS_GLIDE_MOVES]);
/** Its pose `t` seconds into a move (by the name the checks know it by), a move that goes round folded. */
function poseOf(move: string, t: number, elbows = true): P {
  const plan = PLANS[move];
  if (!plan) return {};
  const u = LOOPS.has(move) ? plan.long * fr(t / plan.long) : Math.max(0, Math.min(plan.long, t));
  return POSES[move](u, elbows);
}
const bonesOf = (move: string, t: number): Skeleton => solve(B, { ...R, ...poseOf(move, t) } as Posed);
/** Where the game has it, over and above its bones: carried along the floor as it drifts, and as it darts. */
function carriedAt(move: string, t: number): number {
  return move === 'walk' ? HS_PACE * TILE3 * t : 0;
}
/** Where the game has it to its side (the figure's own lengths): carried round you as it circles, and as it swoops; and in toward you as it swoops. */
function carriedBy(move: string, t: number): V3 {
  const g = glideOf(move);
  if (g) return [0, g.side * (g.fast ? HS_CIRCLE.fast.pace : HS_CIRCLE.slow.pace) * TILE3 * t, 0];
  const side = swoopSide(move);
  if (side) {
    const c = swoopCarry(t);
    return [c.inward * TILE3, side * c.round * TILE3, 0];
  }
  return [0, 0, 0];
}

/**
 * HOW ITS FOG FOLLOWS (Movement 4, “Loose things follow”): the end of its tail held on a spring to where its body is,
 * left behind as it goes and swinging on past as it stops, settling. Worked out from its going over the second before
 * (a move that goes round, from as many rounds back as it takes to settle). The figure's own lengths, the fog's way off
 * its rest.
 */
const LAGS = new Map<string, V3>();
export function lagAt(move: string, t: number): V3 {
  const key = `${move}:${t.toFixed(5)}`;
  const had = LAGS.get(key);
  if (had) return had;
  const loop = LOOPS.has(move);
  const t1 = t;
  // (a swoop comes out of the near ring's glide: its fog as that left it)
  const sw = swoopSide(move);
  const t0 = loop || sw ? t - 2.6 : 0;
  const dt = 1 / 120;
  const w = TAU * 2.2;
  const z = 0.55;
  // (a fog's tail is only so long, and is not flung faster than fog goes: held within reach of its body, its speed capped)
  const REACH = 11;
  const FASTEST = 260;
  const anchor = (u: number): V3 => {
    const before = sw && u < 0;
    const q = poseOf(before ? (sw > 0 ? 'circleLeftFast' : 'circleRightFast') : move, u, false);
    const by = before ? ([0, sw * HS_CIRCLE.fast.pace * TILE3 * u, 0] as V3) : carriedBy(move, u);
    return [(q.px ?? 0) + carriedAt(move, u) + by[0], (q.py ?? 0) + by[1], q.pz ?? R.pz];
  };
  let x = anchor(t0);
  const g = glideOf(move);
  let v: V3 = loop && move === 'walk' ? [HS_PACE * TILE3, 0, 0] : g ? [0, g.side * glidePace(move as GlideName) * TILE3, 0] : swoopSide(move) ? [0, swoopSide(move) * HS_CIRCLE.fast.pace * TILE3, 0] : [0, 0, 0];
  for (let u = t0; u < t1 - 1e-9; u += dt) {
    const a = anchor(u + dt);
    const acc: V3 = [w * w * (a[0] - x[0]) - 2 * z * w * v[0], w * w * (a[1] - x[1]) - 2 * z * w * v[1], w * w * (a[2] - x[2]) - 2 * z * w * v[2]];
    v = add(v, mul(acc, dt));
    const sp = len(v);
    if (sp > FASTEST) v = mul(v, FASTEST / sp);
    x = add(x, mul(v, dt));
    const d = sub(x, a);
    const dl = len(d);
    if (dl > REACH) x = add(a, mul(d, REACH / dl));
  }
  const out = mul(sub(x, anchor(t1)), 2.4);
  if (LAGS.size > 20000) LAGS.clear();
  LAGS.set(key, out);
  return out;
}
/** Its fingers through a move: hanging, curling and uncurling as it hovers; drawn in as it darts; splayed wide in its grip's warning and closed round as it snaps shut; splayed as it unravels. */
export function handsAt(move: string, t: number): { splay: number; curl: number } {
  const g = glideOf(move);
  // (circling: its fingers trailing loose, stirring)
  const circling = (u: number, fast: number): { splay: number; curl: number } => ({ splay: 0.15 + 0.04 * fast + 0.04 * Math.sin((u / CIRCLE_LONG) * TAU * 2 + 1), curl: 0.13 + 0.05 * Math.sin((u / CIRCLE_LONG) * TAU * 2 + 0.3) });
  if (g) return circling(t, g.fast);
  if (swoopSide(move)) {
    const [s0, s1] = HS_SWOOP.strike;
    const c0 = circling(0, 1);
    const c1 = circling(0, 0);
    // (splayed wide as its arms are flung out in its last turn; then as its grip; loosening into its glide as it swirls off)
    if (t <= s0) {
      const k = smooth(0.05, HS_SWOOP.turn[1], t);
      return { splay: c0.splay + (1 - c0.splay) * k, curl: c0.curl * (1 - k) };
    }
    if (t <= s1) return handsAt('attack', t);
    const off = smooth(HS_SWOOP.hold, HS_SWOOP.long, t);
    return { splay: 0.2 + (c1.splay - 0.2) * off, curl: 1 + (c1.curl - 1) * off };
  }
  if (move === 'attack') {
    const [w0] = HS_GRIP.warn;
    const [s0, s1] = HS_GRIP.strike;
    if (t <= s0) return { splay: smooth(0.1, w0, t), curl: 0.2 * (1 - smooth(0.1, w0, t)) };
    if (t <= s1) return { splay: 1 - (t - s0) / (s1 - s0) * 0.8, curl: (t - s0) / (s1 - s0) };
    const off = smooth(HS_GRIP.hold, 1.5, t);
    return { splay: 0.2 * (1 - off), curl: 1 - 0.8 * off };
  }
  if (move === 'dart') return { splay: 0.15 * (1 - smooth(0.4, 0.9, t)), curl: 0.2 + 0.35 * smooth(0, 0.17, t) * (1 - smooth(0.47, 0.9, t)) };
  if (move === 'reel') return { splay: Math.sin(Math.PI * clamp01(t / HS_REEL)), curl: 0.2 };
  if (move === 'dying') return { splay: smooth(0, 0.35, t), curl: 0.1 };
  const a = (t / HS_STAND_LONG) * TAU;
  return { splay: 0.3 + 0.1 * Math.sin(a + 1), curl: 0.12 + 0.12 * Math.sin(a * 2 + 0.3) };
}
/** Its mouth through a move (0 shut, 1 wide, more stretched): gaping wider and narrower as it hovers; wide as it darts and grips; stretched as it dies. */
function jawAt(move: string, t: number): number {
  const a = (t / HS_STAND_LONG) * TAU;
  // (circling: its mouth open on you, gaping wider and narrower; swooping, gaping its widest, and back as it swirls off)
  const round = (u: number): number => 0.62 + 0.1 * Math.sin((u / CIRCLE_LONG) * TAU * 2 + 0.7);
  if (glideOf(move)) return round(t);
  if (swoopSide(move)) return round(0) + (1.3 - round(0)) * smooth(0.04, 0.3, t) - (1.3 - round(0)) * smooth(1.2, HS_SWOOP.long, t);
  if (move === 'attack') return 0.5 + 0.8 * smooth(0.05, HS_GRIP.warn[0], t) - 0.5 * smooth(1.2, HS_GRIP.long, t);
  if (move === 'dart') return 0.5 + 0.45 * smooth(0, 0.17, t) - 0.45 * smooth(0.5, 0.95, t);
  if (move === 'reel') return 0.5 + 0.5 * Math.sin(Math.PI * clamp01(t / HS_REEL));
  if (move === 'dying') return 0.5 + 0.8 * smooth(0, 0.3, t);
  if (move === 'walk') return 0.55 + 0.08 * Math.sin((t / DRIFT_LONG) * TAU);
  return 0.5 + 0.18 * Math.sin(a * 2 + 0.7);
}
/** The warning: the pink in its throat burning, from as it spreads its arms to just after the blow. */
function glintAt(move: string, t: number): number {
  if (swoopSide(move)) return t < 0.04 || t > HS_SWOOP.hit + 0.15 ? 0 : t < HS_SWOOP.turn[1] ? (t - 0.04) / (HS_SWOOP.turn[1] - 0.04) : t <= HS_SWOOP.hit ? 1 : 1 - (t - HS_SWOOP.hit) / 0.15;
  if (move === 'attack') return t < 0.1 || t > HS_GRIP.hit + 0.15 ? 0 : t < HS_GRIP.warn[0] ? (t - 0.1) / (HS_GRIP.warn[0] - 0.1) : t <= HS_GRIP.hit ? 1 : 1 - (t - HS_GRIP.hit) / 0.15;
  if (move === 'dart') return t < 0.05 || t > HS_DART.strike[1] ? 0 : Math.min(1, (t - 0.05) / 0.12);
  return 0;
}

/** The strikes of their moves, by move: from the last frame of the wind-up to the frame it lands on. (The dart's is no longer one of them: `ALL_STRIKES` keeps it, for its code.) */
export const HS_STRIKES: Readonly<Record<string, readonly [number, number]>> = { attack: HS_GRIP.strike, swoopLeft: HS_SWOOP.strike, swoopRight: HS_SWOOP.strike };
const ALL_STRIKES: Readonly<Record<string, readonly [number, number]>> = { ...HS_STRIKES, dart: HS_DART.strike };
/** Whether a frame of a move shows its strike's smear: from the frame after its wind-up ends to the frame after it lands (thinning then). */
export function smearedAt(move: string, t: number): boolean {
  const s = ALL_STRIKES[move];
  return !!s && t > s[0] + 1e-6 && t <= s[1] + FR + 1e-6;
}
/** THE SMEAR: after-images of it along the way it has come since its wind-up ended (as the game has carried it: in the figure's own space as it is now). */
function smearOf(move: string, t: number): V3[][] | null {
  if (!smearedAt(move, t)) return null;
  const [s0, s1] = ALL_STRIKES[move];
  const to = Math.min(t, s1);
  const out: V3[][] = [];
  const n = move === 'dart' ? 10 : 5;
  const here = carriedAt(move, t);
  const paths: V3[][] = Array.from({ length: 12 }, () => []);
  for (let i = 0; i <= n; i++) {
    const u = s0 - FR * 0.5 + ((to - (s0 - FR * 0.5)) * i) / n;
    const s = bonesOf(move, u);
    const by: V3 = [carriedAt(move, u) - here, 0, 0];
    const o = (p: V3): V3 => add(p, by);
    if (move === 'dart') {
      // (streaks along the way it came: of its crown, its hump, its shoulders, its elbows, its hands, its ribs, its hips and its plume)
      const tip = tailOf(s, [0, 0, 0], u);
      [s.head, humpOf(s).c, s.shoulderL, s.shoulderR, s.elbowL, s.elbowR, s.handL, s.handR, s.ribs, s.pelvis, tip[2].c, tip[4].c].forEach((p, j) => paths[j].push(o(p)));
    } else {
      const h = handsAt(move, u);
      const fl = fingersOf(s, 'L', h.splay, h.curl);
      const frr = fingersOf(s, 'R', h.splay, h.curl);
      out.push([s.shoulderL, s.elbowL, s.handL, fl.tips[1]], [s.shoulderR, s.elbowR, s.handR, frr.tips[1]]);
    }
  }
  // (the dart's streaks laid as their pieces, oldest first: dimmest at the start of the way, brightest where it now is)
  if (move === 'dart') for (let i = 0; i < n; i++) for (const path of paths) out.push([path[i], path[i + 1]]);
  return t > s1 + 1e-6 ? out.slice(Math.floor(out.length / 2)) : out;
}
/** THE WORD IT SWALLOWED, as it dies: out of its mouth and up, its own colour coming back; held; then away, home, and gone. */
function wordOf(t: number): { p: V3; own: number; cell: number; left: number } | null {
  const [w0, w1, w2, w3, w4] = HS_DIES.word;
  if (t < w0 || t >= w4) return null;
  const s = bonesOf('dying', Math.min(t, w1));
  const mouth = add(s.head, add(mul(s.face[0], B.headR[0] * 0.9), mul(s.face[2], -B.headR[2] * 0.5)));
  const rise = 22 * smooth(w0, w1, t);
  const bob = t > w1 ? 1.2 * Math.sin((t - w1) * 9) : 0;
  const away = smooth(w2, w4, t);
  const p = add(mouth, [3 * smooth(w0, w1, t) + 24 * away, 4 * away, rise + bob + 40 * away * away]);
  return { p, own: smooth(w0 + 0.15, w2, t), cell: 2, left: 1 - smooth(w3, w4, t) };
}
/** What every moment of its moves says over and above its bones (for its painter). */
export const HS_SAY: HushSay = {
  lag: (m) => lagAt(byName[m.move ?? ''] ?? 'stand', m.t),
  hands: (m) => handsAt(byName[m.move ?? ''] ?? 'stand', m.t),
  formed: (m) => (m.dying ? 1 - smooth(HS_DIES.unravel[0], HS_DIES.unravel[1], m.t) : 1),
  tear: (m) => {
    const move = byName[m.move ?? ''] ?? '';
    if (move === 'reel') return smooth(0, 0.05, m.t) * (1 - smooth(0.08, 0.34, m.t));
    if (move === 'dying') return smooth(0, 0.06, m.t) * (1 - smooth(0.12, 0.4, m.t));
    return 0;
  },
  stream: (m) => {
    const move = byName[m.move ?? ''] ?? '';
    if (move === 'walk') return 1.4;
    if (move === 'dart') return 1 + 2 * smooth(0.3, 0.45, m.t) * (1 - smooth(0.55, 0.95, m.t));
    if (move === 'attack') return 1 + 0.8 * smooth(0.2, 0.7, m.t) * (1 - smooth(1.2, 1.6, m.t));
    if (move === 'dying') return 1 + 3 * smooth(0.3, 1.0, m.t);
    if (move === 'reel') return 2;
    const g = glideOf(move);
    if (g) return g.fast ? 2.4 : 1.7;
    // (swooping: as hard as it is going, from the far ring's glide to the near ring's; and more as it grips)
    if (swoopSide(move)) return 1.7 + 0.7 * clamp01((swoopPace(m.t) - HS_CIRCLE.slow.pace) / (HS_CIRCLE.fast.pace - HS_CIRCLE.slow.pace)) + 0.8 * smooth(0.2, 0.7, m.t) * (1 - smooth(1.2, 1.6, m.t));
    return 1;
  },
  smear: (m) => smearOf(byName[m.move ?? ''] ?? '', m.t),
  word: (m) => (m.dying ? wordOf(m.t) : null),
  orbit: (m) => orbitOf(byName[m.move ?? ''] ?? '', m.t),
};
/** Circling you: the ring it goes round on (the figure's own lengths), how far and how flat its fog streams out behind it along it (as the way it goes; none when it is not circling). */
export function orbitOf(move: string, t: number): { r: number; reach: number; flat: number } | null {
  const g = glideOf(move);
  if (g) return g.fast ? { r: HS_CIRCLE.fast.ring * TILE3, reach: 3.2, flat: 0.8 } : { r: HS_CIRCLE.slow.ring * TILE3, reach: 2.2, flat: 0.65 };
  if (!swoopSide(move)) return null;
  // (swooping: as the near ring's glide, its fog streaming out as far as it is going fast, the ring closing to the grip's; as it swirls off, as the far ring's)
  const v = Math.min(1, swoopPace(t) / HS_CIRCLE.fast.pace);
  const off = smooth(HS_SWOOP.off[0], HS_SWOOP.long, t);
  const r = HS_CIRCLE.fast.ring - (HS_CIRCLE.fast.ring - HS_CIRCLE.grip) * smooth(0, HS_SWOOP.turn[1], t) * (1 - off) + (HS_CIRCLE.slow.ring - HS_CIRCLE.fast.ring) * off;
  return { r: r * TILE3, reach: 1 + (3.2 - 1) * v * (1 - off) + (2.2 - 1) * off, flat: 0.8 * v * (1 - off) + 0.65 * off + 0.3 * (1 - v) * (1 - off) };
}

// =============================================================================================
// IT, AS THE GAME HOLDS A MONSTER

function hushMob(): Mob {
  const paint = hushPainter(HS_SAY);
  const mv = (key: keyof typeof HS_NAMES, motion: Motion, more: Partial<MobMove> = {}): MobMove => ({ name: HS_NAMES[key], motion, rest: R, jaw: (t) => jawAt(key, t), glint: (t) => glintAt(key, t), ...more });
  return {
    id: 'hush-shape',
    name: 'A shape of the Hush',
    size: "small: the knight's size, in swarms",
    build: B,
    stand: mv('stand', motionOf(PLANS.stand, true)),
    attack: mv('attack', motionOf(PLANS.attack)),
    // (the dart is no longer theirs: their rhythm of 30 Oct, never still, swirling round you; its code is kept above, out of their moves)
    more: {
      ...Object.fromEntries(HS_GLIDE_MOVES.map((g) => [g, mv(g, motionOf(PLANS[g], true), { period: CIRCLE_LONG, ground: 0 })])),
      swoopLeft: mv('swoopLeft', motionOf(PLANS.swoopLeft)),
      swoopRight: mv('swoopRight', motionOf(PLANS.swoopRight)),
    },
    idleFrames: 24,
    idleFps: 10,
    walk: mv('walk', motionOf(PLANS.walk, true), { period: DRIFT_LONG, ground: HS_PACE * TILE3 }),
    walkFrames: HS_DRIFT.frames,
    walkFps: HS_DRIFT.fps,
    pace: HS_PACE,
    reel: mv('reel', motionOf(PLANS.reel)),
    reelTime: HS_REEL,
    hit: HS_GRIP.hit,
    warn: HS_GRIP.warn[1] - HS_GRIP.warn[0],
    dieTime: HS_DIES.long,
    dying: mv('dying', motionOf(PLANS.dying)),
    aura: { x: HS_CANVAS.ax, y: HS_CANVAS.ay - 40, r: 34, color: '#9890b4', a: 0.06 },
    shadow: 10,
    canvas: HS_CANVAS,
    trueBack: true,
    bits: paint.bits,
    grains: paint.grains,
    finish: paint.finish,
  };
}
export const HUSH_SHAPE = hushMob();
export function makeHushShapeArt3(mob: Mob = HUSH_SHAPE): ActorArt {
  return { front: mobSet(mob, 'front', mob.pace), back: mobSet(mob, 'back', mob.pace) };
}

// =============================================================================================
// IT AS THE CHECKS SEE IT (art/boss_checks.ts)

const len3 = (v: V3): number => Math.hypot(v[0], v[1], v[2]);
/** Its outside as painted: its arms and neck as limbs; its head, its hump, its chest, its waist, its hips and its tail as solids. */
export function hushSolids(s: Skeleton): { limbs: CheckLimb[]; lumps: CheckLump[] } {
  const [r0, r1] = B.armR;
  const limbs: CheckLimb[] = [];
  for (const side of ['L', 'R'] as const) {
    const L = side === 'L';
    limbs.push(
      { name: `upper${side}`, a: L ? s.shoulderL : s.shoulderR, b: L ? s.elbowL : s.elbowR, r: r0 },
      { name: `fore${side}`, a: L ? s.elbowL : s.elbowR, b: L ? s.handL : s.handR, r: r1 * 0.9 },
    );
  }
  limbs.push({ name: 'neck', a: s.neck, b: lerp3(s.neck, s.skull, 0.85), r: 2.4 });
  const hump = humpOf(s);
  const tail = tailOf(s, [0, 0, 0], 0);
  const f = s.hips;
  const lumps: CheckLump[] = [
    { name: 'head', c: s.head, rot: s.face, h: [B.headR[0] * 1.05, B.headR[1] * 1.08, B.headR[2] * 1.05] },
    { name: 'hump', c: hump.c, rot: s.chest, h: [len3(hump.ax[0]), len3(hump.ax[1]), len3(hump.ax[2])] },
    { name: 'chest', c: lerp3(s.ribs, s.neck, 0.3), rot: s.chest, h: [B.ribDeep + 2.4, B.ribHalf + 2.4, len3(sub(s.neck, s.ribs)) * 0.55] },
    { name: 'belly', c: lerp3(s.waist, s.ribs, 0.45), rot: s.belly, h: [B.waistDeep + 2.4, B.waistHalf + 2.4, Math.max(3, len3(sub(s.ribs, s.waist)) * 0.6)] },
    { name: 'hips', c: add(s.pelvis, mul(s.hips[2], 0.8)), rot: s.hips, h: [B.pelvisDeep + 3.4, B.pelvisHalf + 3.8, 3.2] },
    { name: 'tail', c: tail[2].c, rot: f, h: [tail[2].deep, tail[2].across, 4.5] },
  ];
  return { limbs, lumps };
}
const ALL_MOVES = ['stand', 'walk', 'attack', 'reel', 'dying'];
/** The game's frames of a circling glide (its walk's: 12 at 10 a second, and its first again). */
const glideFrames = Array.from({ length: HS_DRIFT.frames + 1 }, (_, i) => i / HS_DRIFT.fps);
export const HS_SHAPE: BossShape = {
  body: hushSolids,
  // (what strikes: its left hand, the upper, as its arms snap shut; its crown as it darts)
  tip: (move, _t, s) => (move === 'attack' || swoopSide(move) ? s.handL : move === 'dart' ? s.head : null),
  // (its long fingers, which may lie along their own forearm)
  things: (move, t, s) => {
    const h = handsAt(move, t);
    return (['L', 'R'] as const).map((side): CheckThing => {
      const f = fingersOf(s, side, h.splay, h.curl);
      return { name: `fingers ${side}`, pts: [...f.knuckles, ...f.tips], r: 0.45, may: [`fore${side}`] };
    });
  },
  follow: (_move, _t, s) => ({ head: s.head, chest: s.ribs, pelvis: s.pelvis, handL: s.handL, handR: s.handR, elbowL: s.elbowL, elbowR: s.elbowR }),
  strikes: HS_STRIKES,
  smeared: smearedAt,
  handovers: [
    ...ALL_MOVES.filter((m) => m !== 'stand' && m !== 'walk' && m !== 'dart').flatMap((m): Handover[] => (m === 'dying' ? [{ from: 'stand', at: 0, to: m, toAt: 0 }] : [{ from: 'stand', at: 0, to: m, toAt: 0 }, { from: m, at: 'end', to: 'stand', toAt: 0 }])),
    { from: 'stand', at: 0, to: 'walk', toAt: 0 },
    ...Array.from({ length: HS_DRIFT.frames + 1 }, (_, i): Handover => ({ from: 'walk', at: i / HS_DRIFT.fps, to: 'stand', toAt: 0 })),
    // (the drift into the grip, from any step of it)
    ...glideFrames.map((at): Handover => ({ from: 'walk', at, to: 'attack', toAt: 0 })),
    // THEIR RHYTHM: each circling glide, from any frame of it: into its swoop (from the near ring), into the other pace the
    // same way round (as its ring closes), struck, struck down; and out of its hover, its drift, its grip and struck into it;
    // the swoop out of its glide and back into it as it swirls off
    ...HS_GLIDE_MOVES.flatMap((g): Handover[] => {
      const { side, fast } = HS_GLIDES[g];
      const other = (fast ? (side > 0 ? 'circleLeft' : 'circleRight') : side > 0 ? 'circleLeftFast' : 'circleRightFast') as GlideName;
      const swoop = side > 0 ? 'swoopLeft' : 'swoopRight';
      return [
        ...glideFrames.flatMap((at): Handover[] => [
          { from: g, at, to: other, toAt: 0 },
          { from: g, at, to: 'reel', toAt: 0 },
          { from: g, at, to: 'dying', toAt: 0 },
          ...(fast ? [{ from: g, at, to: swoop, toAt: 0 }] : []),
          ...(fast ? [] : [{ from: 'walk', at, to: g, toAt: 0 }]),
        ]),
        // (out of its hover, onto the far ring)
        ...(fast ? [] : [{ from: 'stand', at: 0, to: g, toAt: 0 }]),
        { from: 'attack', at: 'end', to: g, toAt: 0 },
        { from: 'reel', at: 'end', to: g, toAt: 0 },
        { from: swoop, at: 'end', to: g, toAt: 0 },
      ];
    }),
    // (the swoop's held warning is its grip's: the grip from there on, as it always was)
    ...(['swoopLeft', 'swoopRight'] as const).map((w): Handover => ({ from: w, at: HS_SWOOP.warn[1], to: 'attack', toAt: HS_GRIP.warn[1] })),
  ],
};
export { poseOf as hushPoseOf, bonesOf as hushBonesOf };
