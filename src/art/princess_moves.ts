// FLOOR 16'S BOSS, THE PRINCESS: HER MOVES (the art chat, 28 Oct 2026). A MOCK-UP: NOT IN THE GAME, behind PRINCESS_ON
// (art/princess.ts, off). Her look and his brief are art/princess.ts; her ultimate, the steed, art/princess_ride.ts.
//
// His picks for her (28 Oct): she “Glides without a sound (Recommended)”; her basic attack the “Nettle vine lash
// (Recommended)”; in place of his doc's Shirt, the “Vine snare (Recommended)”; his doc's Eleven (“her swan brothers diving
// across the floor in lines you must step between”) and Vow (“a ring of silence round her that darkens your words while
// you stand in it”); her ultimate the spectral steed; her death, “Steed fades, vines wither (Recommended)”; “Not a child,
// not a corpse (Recommended)”. And his rulebook's Movement 9, “Big wind-up, lightning strike”, for every new enemy from
// her on (his, 28 Oct: “Start from now on”): every blow of hers winds up big and is held (the warning), strikes in two
// frames smeared with its after-images, and winds down big.
//
// HER MOVES:
//   HOVERING (her stand): rising and sinking a little on the air, her gown stirring, her head turning slowly.
//   THE GLIDE (her walk): leaning into her way, bobbing on the air, her gown and her vine streaming back; no steps.
//   THE NETTLE VINE LASH (her attack): she turns away and raises her right arm high behind her, the vine lifted off the
//     floor and drawn back over her shoulder, its thorns glinting pink, her left hand pointing at you (THE WARNING, held);
//     her hips turn first; the strike: the vine whips over and cracks out its whole length along the floor at you (two
//     frames, smeared); it slides on; she draws it back and hovers again.
//   THE VINE SNARE: she lifts both hands high, palms up, rising, her head back (the warning, held); then slams them down
//     before her (two frames, smeared): the vines burst up out of the floor round you (art/princess_fx.ts).
//   THE ELEVEN: she spreads her arms wide like wings, rising, her face to the sky (the warning, held); then flings them
//     forward at you (two frames, smeared): her swan brothers dive across the floor in lines (art/princess_fx.ts).
//   THE VOW: she lays a finger on her lips and her other hand on her heart, bowing her head (the warning, held); then
//     throws her arms wide (two frames, smeared): the ring of silence bursts out round her.
//   THE STEED (her ultimate): art/princess_ride.ts; it forms, it leaps as long as the game likes, it fades.
//   STRUCK: jolted back, her arms flung out, her head thrown back.
//   HER DEATH: struck, she clutches her breast; the Hush leaves her; she drops her vine and sinks out of the air to her
//     knees while every nettle on her withers, browns and falls; she sits back on her heels, her head bowed, the pink gone
//     from her eyes: alive, freed, still.
//
// By his rulebook: every move through every check the bosses have (art/boss_checks.ts), from in front and behind, and
// the lightning strikes as his Movement 9 asks.
//   test: tsx --test tests/princess.test.ts

import type { ActorArt } from './actor_types';
import type { BossShape, CheckLimb, CheckLump, CheckThing, Handover } from './boss_checks';
import { footOn, kneelHips } from './bosses3';
import type { Plant } from './bosses3';
import { hash } from './kit';
import { FLAME } from './mkit';
import { TILE3, mobSet } from './new_mobs3';
import type { Mob, MobMove, Moment } from './new_mobs3';
import { PRINCESS_BODY, PRINCESS_REST, PR_CANVAS, PR_HOVER, PR_STAND_LONG, princessPainter, princessStand, restVine } from './princess';
import type { PrincessSay } from './princess';
import { RIDE_LEAP, RIDE_LONG, riderAt, rideMotion, steedPoseAt, track, whirlOf } from './princess_ride';
import type { RideMove } from './princess_ride';
import { add, cross, lerp3, mul, norm, solve, sub } from './skeleton';
import type { Bones, Key3, Motion, Posed, Skeleton, V3 } from './skeleton';
import { solesOf, steedAt, steedPoints } from './spectral_steed';

type P = Partial<Bones>;
const B = PRINCESS_BODY;
const R = PRINCESS_REST;
const FPS = 30;
const FR = 1 / FPS;
const clamp01 = (v: number): number => Math.max(0, Math.min(1, v));
const hashOf = (i: number, j: number): number => hash(i, j, 7531);
const smooth = (a: number, b: number, t: number): number => {
  const u = clamp01((t - a) / (b - a));
  return u * u * (3 - 2 * u);
};

// =============================================================================================
// A MOVE THROUGH KEY POSES: every field through its keys smoothly (its speed carried through each key, not stopped at
// it), but straight through a lightning strike; sampled on every frame the game shows

interface Plan {
  long: number;
  keys: ReadonlyArray<readonly [number, P]>;
  /** The strike: from the last frame of its wind-up to the frame it lands on. */
  strike?: readonly [number, number];
  hit?: number;
}
function poseFn(plan: Plan): (t: number) => P {
  const full = plan.keys.map(([t, p]) => [t, { ...R, ...p } as Record<string, number>] as const);
  const fields = Object.keys(full[0][1]).filter((k) => k !== 'lhIn' && k !== 'rhIn' && typeof full[0][1][k] === 'number');
  const tracks = new Map(fields.map((k) => [k, track(full.map(([t, p]) => [t, p[k]] as const))]));
  const st = plan.strike;
  const at = (t: number): Record<string, number> | undefined => full.find(([kt]) => Math.abs(kt - t) < 1e-6)?.[1];
  const a0 = st ? at(st[0]) : undefined;
  const a1 = st ? at(st[1]) : undefined;
  return (t) => {
    const out: Record<string, number> = { lhIn: full[0][1].lhIn, rhIn: full[0][1].rhIn };
    // (the strike itself, straight from its wind-up's end to where it lands)
    if (st && a0 && a1 && t > st[0] && t < st[1]) {
      const k = (t - st[0]) / (st[1] - st[0]);
      for (const f of fields) out[f] = a0[f] + (a1[f] - a0[f]) * k;
    } else for (const f of fields) out[f] = (tracks.get(f) as (t: number) => number)(t);
    return out as P;
  };
}
function motionOf(plan: Plan): Motion {
  const f = poseFn(plan);
  const keys: Key3[] = [];
  const n = Math.round(plan.long * FPS);
  for (let i = 0; i <= n; i++) keys.push({ at: i / FPS, pose: f(i / FPS), ease: 'lin' });
  return plan.hit !== undefined ? { keys, hit: plan.hit } : { keys };
}
/** Her hands as the bones place them: each from its own shoulder along her own forward, left and up (`lhIn` 1). */
const hands = (l: V3, r: V3, le: number, re: number): P => ({ lhIn: 1, lhx: l[0], lhy: l[1], lhz: l[2], le, rhIn: 1, rhx: r[0], rhy: r[1], rhz: r[2], re });
const L0: V3 = [R.lhx, R.lhy, R.lhz];
const R0: V3 = [R.rhx, R.rhy, R.rhz];

// =============================================================================================
// THE GLIDE (her walk): no steps; fast, leaning hard into her way, skimming the floor, her gown and hair and vine
// streaming back. His words, 28 Oct, 22:27: “Her move speed is shit”; “Everything is always so plodding when you first
// animate them.  I could tell you I want a cheetah boss and it would walk around like an old dog.”

export const PR_GLIDE = { frames: 12, fps: 20 };
/** Her speed gliding, tiles a second: she darts about the arena (the knight walks 2.5). */
export const PR_PACE = 4.0;
function glidePlan(): Plan {
  const T = PR_GLIDE.frames / PR_GLIDE.fps;
  const keys: [number, P][] = [];
  for (let i = 0; i <= 12; i++) {
    const t = (i / 12) * T;
    const a = (t / T) * Math.PI * 2;
    keys.push([t, {
      pz: R.pz + 1.2 + 0.6 * Math.sin(a), pitch: 10, bend: 5 + 0.6 * Math.sin(a + 0.8), roll: 1.0 * Math.sin(a), side: 0.6 * Math.sin(a), faceUp: 2, faceTurn: -4, faceTilt: 3,
      ...hands([-0.5 - 0.8 * Math.cos(a), 6, -17 + 0.5 * Math.sin(a)], [-0.5 + 0.6 * Math.sin(a), -7, -19.5], -18, 18),
      lfz: R.lfz + 1.2 + 0.6 * Math.sin(a), rfz: R.rfz + 1.2 + 0.6 * Math.sin(a), lfx: R.lfx - 3, rfx: R.rfx - 3,
    }]);
  }
  return { long: T, keys };
}

// =============================================================================================
// THE NETTLE VINE LASH (her attack): A SWEEP. His words, 28 Oct, by 22:23: “The swipe of the vine should cover a 90 degree
// swing and cover maybe 1/6 of the entire arena”, and of its first length, “Triple that at least”.

/** Her vine's reach as it sweeps (her own lengths): seven and a half tiles, so that its quarter turn covers a sixth of a boss arena (about 17 by 20 tiles). */
export const LASH_REACH = 7.5 * TILE3;
/**
 * The lash's times, and the sweep's ways (degrees round from her front, to her left; her front the way the move faces):
 * drawn back along the floor to her right (`from`), swept through the quarter turn it strikes (`area`), carried on (`to`).
 */
export const PR_LASH = { long: 1.6, warn: [0.4, 0.7] as const, strike: [22 / FPS, 24 / FPS] as const, hit: 24 / FPS, from: -62, area: [-45, 45] as const, to: 60 };
/** Wound up: turned away to her right, her right arm swung back low behind her, the vine grown out its whole length along the floor to her right; her left hand pointing at you. */
const COCKED: P = { yaw: -30, twist: -14, bend: -4, pitch: -3, faceTurn: 34, faceUp: -2, faceTilt: 2, pz: R.pz + 1.2, ...hands([15, 4, 0], [-7, -12, -12], -30, 40), draw: 1 };
/** Her hips turned first, her chest still back. */
const HIPS_FIRST: P = { ...COCKED, yaw: -17, twist: -27, pitch: -1 };
/** Struck: her arm whipped across before her to her left, the vine swept round its quarter turn along the floor. */
const SWEPT: P = { yaw: 18, twist: 12, bend: 8, pitch: 4, faceTurn: -6, faceUp: -6, faceTilt: 4, pz: R.pz, ...hands([-3, 9, -14], [12, 10, -13], -30, -10), draw: 2 };
const SWEPT_ON: P = { ...SWEPT, yaw: 23, twist: 16, bend: 10, pitch: 5, ...hands([-4, 9, -15], [8, 14, -15], -30, -16), draw: 2.2 };
function lashPlan(): Plan {
  const [w0, w1] = PR_LASH.warn;
  const [s0, s1] = PR_LASH.strike;
  return {
    long: PR_LASH.long,
    strike: PR_LASH.strike,
    hit: PR_LASH.hit,
    keys: [
      [0, { draw: 0 }],
      [0.2, { yaw: -15, twist: -7, bend: -2, pitch: -2, faceTurn: 16, pz: R.pz + 0.6, ...hands([11, 3, -7], [-1, -11, -16], -26, 30), draw: 0.45 }],
      [w0, COCKED],
      [0.55, { ...COCKED, ...hands([15, 4, 0.3], [-7.2, -12.1, -12.2], -30, 40), draw: 1 }],
      [w1, COCKED],
      [s0, HIPS_FIRST],
      [s1, SWEPT],
      [1.0, SWEPT_ON],
      [1.3, { yaw: 9, twist: 6, bend: 4, pitch: 1, faceTurn: -6, ...hands([4, 5, -16], [7, 1, -19], -20, 0), draw: 2.62 }],
      [PR_LASH.long, { draw: 3 }],
    ],
  };
}
const N_VINE = 24;
/** A line of points resampled to `n` (by its points' order). */
function resampled(pts: ReadonlyArray<V3>, n: number): V3[] {
  const out: V3[] = [];
  for (let i = 0; i <= n; i++) {
    const u = (i / n) * (pts.length - 1);
    const j = Math.min(pts.length - 2, Math.floor(u));
    out.push(lerp3(pts[j], pts[j + 1], u - j));
  }
  return out;
}
/** The vine laid out along the floor from her right hand: down to the floor a little way out, then `long` out along the way `deg` round from her front, its far end trailing `trail` degrees behind the way it is swept. */
function laidVine(s: Skeleton, deg: number, long: number, trail: number): V3[] {
  const hand = s.handR;
  const D = Math.PI / 180;
  const way = (a: number): V3 => [Math.cos(a * D), Math.sin(a * D), 0];
  const near = Math.min(long, 15);
  const base = add([s.pelvis[0], s.pelvis[1], 0], mul(way(deg), near));
  const out: V3[] = [];
  // (on the floor its middle is as high as it is thick there: it lies on the floor, not in it)
  const lie = (k: number): number => 0.5 + 1.25 * 1.6 * (1 - 0.35 * k);
  for (let i = 0; i <= N_VINE; i++) {
    const k = i / N_VINE;
    if (k <= 0.12) {
      const u = k / 0.12;
      const p = lerp3(hand, [base[0], base[1], lie(k)], u);
      out.push([p[0], p[1], p[2] + 3 * Math.sin(Math.PI * u) * (1 - u)]);
      continue;
    }
    const u = (k - 0.12) / 0.88;
    const a = deg - trail * u * u;
    const d = near + (long - near) * u;
    const w = [s.pelvis[0], s.pelvis[1], 0] as V3;
    const p = add(w, mul(way(a), d));
    out.push([p[0], p[1], lie(k)]);
  }
  return out;
}
/** THE VINE THROUGH THE LASH (the bones' `draw`): 0 trailing at rest; 0 to 1 growing out its whole length along the floor to her right; 1 to 2 swept round its quarter turn; 2 to 2.2 carried on; 2.2 to 3 drawn back in to trailing again. */
export function lashVine(s: Skeleton, draw: number, t: number): V3[] {
  const rest = resampled(restAt(s, t), N_VINE);
  const mix = (a: V3[], b: V3[], k: number): V3[] => a.map((p, i) => lerp3(p, b[i], k));
  const [a0, a1] = PR_LASH.area;
  const from = PR_LASH.from;
  if (draw <= 1) {
    const k = clamp01(draw);
    const grown = laidVine(s, from, 18 + (LASH_REACH - 18) * smooth(0.15, 1, k), 0);
    return mix(rest, grown, smooth(0, 0.35, k));
  }
  if (draw <= 2) {
    // (swept: from where it lay, through the quarter turn it strikes; its far end trailing behind as it goes)
    const u = draw - 1;
    const deg = from + (a1 - from) * u;
    return laidVine(s, deg, LASH_REACH, 26 * Math.sin(Math.PI * u));
  }
  if (draw <= 2.2) return laidVine(s, a1 + (PR_LASH.to - a1) * ((draw - 2) / 0.2), LASH_REACH, 0);
  // (drawn back in: shortening along the floor, then lifting into her hand)
  // (round in front of her, back to her right side as it comes in, so that it never crosses her)
  const k = clamp01((draw - 2.2) / 0.8);
  // (first pulled in along its own line, then, short, round to her right)
  const short = laidVine(s, PR_LASH.to + (-75 - PR_LASH.to) * smooth(0.3, 1, k), LASH_REACH + (16 - LASH_REACH) * smooth(0, 0.75, k), 0);
  return mix(short, rest, smooth(0.6, 1, k));
}
/** The vine trailing as she hovers, from a moment's bones alone (its sway by `t`; it does not lag). */
function restAt(s: Skeleton, t: number): V3[] {
  return restVine(s, { s, t, come: [0, 0, 0] } as unknown as Moment);
}

// =============================================================================================
// THE VINE SNARE, THE ELEVEN, THE VOW: cast with her hands

export const PR_SNARE = { long: 1.6, warn: [0.42, 0.72] as const, strike: [23 / FPS, 25 / FPS] as const, hit: 25 / FPS };
export const PR_ELEVEN = { long: 1.8, warn: [0.5, 0.85] as const, strike: [27 / FPS, 29 / FPS] as const, hit: 29 / FPS };
export const PR_VOW = { long: 1.9, warn: [0.55, 0.9] as const, strike: [28 / FPS, 30 / FPS] as const, hit: 30 / FPS };

const HANDS_UP: P = { faceUp: 16, bend: -6, pitch: -3, pz: R.pz + 3, faceTurn: 0, ...hands([5, 5.5, 15], [5, -5.5, 15], -50, 50) };
const HANDS_DOWN: P = { faceUp: -8, bend: 12, pitch: 8, pz: R.pz - 0.5, faceTurn: -4, ...hands([15, 3.5, -15], [15, -3.5, -15], -24, 24) };
function snarePlan(): Plan {
  const [w0, w1] = PR_SNARE.warn;
  const [s0, s1] = PR_SNARE.strike;
  return {
    long: PR_SNARE.long,
    strike: PR_SNARE.strike,
    hit: PR_SNARE.hit,
    keys: [
      [0, {}],
      [0.22, { faceUp: 6, bend: -2, pz: R.pz + 1.2, ...hands([7, 5, -4], [6, -6, -6], -36, 36) }],
      [w0, HANDS_UP],
      [0.57, { ...HANDS_UP, ...hands([5, 5.6, 15.3], [5, -5.6, 15.3], -50, 50) }],
      [w1, HANDS_UP],
      [s0, { ...HANDS_UP, pitch: 1 }],
      [s1, HANDS_DOWN],
      [1.0, { ...HANDS_DOWN, bend: 14, pitch: 9, pz: R.pz - 1, ...hands([13, 4.5, -20], [13, -4.5, -20], -20, 20) }],
      [1.28, { faceUp: -6, bend: 6, pitch: 3, ...hands([9, 2, -17], [6, -5, -21], -16, 14) }],
      [PR_SNARE.long, {}],
    ],
  };
}
const WINGS: P = { faceUp: 22, bend: -9, pitch: -4, pz: R.pz + 4, faceTurn: 0, ...hands([-3, 17, 8], [-3, -17, 8], -70, 70) };
const FLUNG: P = { faceUp: 0, bend: 8, pitch: 5, pz: R.pz + 2, faceTurn: -4, ...hands([20, 4.5, 3], [20, -4.5, 3], -30, 30) };
function elevenPlan(): Plan {
  const [w0, w1] = PR_ELEVEN.warn;
  const [s0, s1] = PR_ELEVEN.strike;
  return {
    long: PR_ELEVEN.long,
    strike: PR_ELEVEN.strike,
    hit: PR_ELEVEN.hit,
    keys: [
      [0, {}],
      [0.26, { faceUp: 8, bend: -3, pz: R.pz + 1.5, ...hands([3, 11, -10], [2, -12, -11], -50, 50) }],
      [w0, WINGS],
      [0.68, { ...WINGS, pz: R.pz + 4.4, ...hands([-3.2, 17.2, 8.4], [-3.2, -17.2, 8.4], -70, 70) }],
      [w1, WINGS],
      [s0, { ...WINGS, pitch: -1 }],
      [s1, FLUNG],
      [1.15, { ...FLUNG, bend: 10, pitch: 6, ...hands([19, 6, -3], [19, -6, -3], -28, 28) }],
      [1.45, { faceUp: -2, bend: 4, pitch: 2, pz: R.pz + 0.8, ...hands([10, 3, -14], [7, -5, -18], -18, 14) }],
      [PR_ELEVEN.long, {}],
    ],
  };
}
const HUSHING: P = { faceUp: -12, bend: 6, pitch: 2, pz: R.pz - 0.5, faceTurn: 0, faceTilt: 2, ...hands([6, -4, -6], [9, 6.2, 6], -6, 60) };
const BURST: P = { faceUp: 18, bend: -9, pitch: -4, pz: R.pz + 3, faceTurn: 0, ...hands([3, 20, -7], [3, -20, -7], -40, 40) };
function vowPlan(): Plan {
  const [w0, w1] = PR_VOW.warn;
  const [s0, s1] = PR_VOW.strike;
  return {
    long: PR_VOW.long,
    strike: PR_VOW.strike,
    hit: PR_VOW.hit,
    keys: [
      [0, {}],
      [0.3, { faceUp: -6, bend: 3, ...hands([7, -1, -10], [8, 1, -6], -10, 40) }],
      [w0, HUSHING],
      [0.72, { ...HUSHING, faceUp: -13, pz: R.pz - 0.7 }],
      [w1, HUSHING],
      [s0, { ...HUSHING, pitch: -1 }],
      [s1, BURST],
      [1.2, { ...BURST, ...hands([0, 21, -10], [0, -21, -10], -36, 36) }],
      [1.5, { faceUp: 6, bend: -3, pz: R.pz + 1, ...hands([5, 12, -15], [4, -12, -16], -24, 24) }],
      [PR_VOW.long, {}],
    ],
  };
}

// =============================================================================================
// STRUCK, AND HER DEATH

export const PR_REEL = 0.4;
const JOLT: P = { px: -2.2, pitch: -8, bend: -9, faceUp: 18, pz: R.pz + 1.2, ...hands([2, 9, -10], [2, -9, -10], -40, 40) };
function reelPlan(): Plan {
  return { long: PR_REEL, keys: [[0, {}], [0.07, JOLT], [PR_REEL, {}]] };
}
export const PR_DIES = { long: 3.2, drop: 0.45, sink: [0.9, 1.7] as const, wither: [0.45, 2.5] as const, sit: [1.9, 2.5] as const };
const TUCK = 56;
const KNEE_Z = B.legR[1] * 1.3;
const KNEEL_FEET: Record<'L' | 'R', Plant> = { L: { at: [-11, 4.8], turn: 4, pitch: TUCK }, R: { at: [-11, -4.8], turn: -4, pitch: TUCK } };
const feetAt = (lift: number): P => ({ ...footOn(B, 'L', KNEEL_FEET.L, lift), ...footOn(B, 'R', KNEEL_FEET.R, lift) });
/** On her knees, upright (`lean` 0) or sat back on her heels (less than nothing). */
const kneel = (lean: number, body: P): P => ({ ...kneelHips(B, R, KNEEL_FEET, TUCK, KNEE_Z, lean), ...feetAt(0), ...body });
const LAP = (dz: number): P => hands([9, -2.5, -15 + dz], [9, 2.5, -15 + dz], -14, 14);
function diesPlan(): Plan {
  const K0 = kneel(4, { pitch: 4, bend: 8, faceUp: -22, faceTurn: 0, faceTilt: 6, ...LAP(0), out: 0.6 });
  const K1 = kneel(-50, { pitch: 2, bend: 14, faceUp: -30, faceTurn: 4, faceTilt: 10, ...LAP(-3), out: 1 });
  const sinkMid = { ...kneel(4, { pitch: 4, bend: 9, faceUp: -22, faceTurn: 0, faceTilt: 6, ...hands([7, -3.5, -9], [7, 3.5, -9], -10, 10), out: 0.45 }), ...feetAt(2.2) };
  return {
    long: PR_DIES.long,
    keys: [
      [0, {}],
      [0.1, { ...JOLT }],
      // she clutches her breast; the Hush leaves her
      [0.45, { pitch: 3, bend: 9, faceUp: -18, faceTurn: 0, pz: R.pz + 0.6, ...hands([6, -3.5, -7], [6, 3.5, -7], -8, 8), out: 0.25 }],
      [0.9, { pitch: 4, bend: 10, faceUp: -20, faceTurn: 0, pz: R.pz - 1.5, ...hands([6.5, -3.5, -8], [6.5, 3.5, -8], -8, 8), out: 0.35, lfx: -4, rfx: -4, lfz: R.lfz + 1.5, rfz: R.rfz + 1.5 }],
      // she sinks out of the air to her knees
      [1.35, { ...sinkMid, pz: ((sinkMid.pz as number) + (R.pz - 1.5)) / 2 + 3 }],
      [PR_DIES.sink[1], K0],
      [PR_DIES.sit[0], { ...K0, faceUp: -24 }],
      [2.2, kneel(-26, { pitch: 3, bend: 11, faceUp: -27, faceTurn: 2, faceTilt: 8, ...LAP(-1.5), out: 0.85 })],
      // and sits back on her heels, her head bowed, still
      [PR_DIES.sit[1], K1],
      [PR_DIES.long, { ...K1, bend: 14.5, faceUp: -31 }],
    ],
  };
}
/** Her vine as she dies: in her hand until she drops it (`PR_DIES.drop`), then falling to lie on the floor at her right. */
function dyingVine(s: Skeleton, t: number, held: Skeleton): V3[] {
  const v = restAt(t < PR_DIES.drop ? s : held, Math.min(t, PR_DIES.drop));
  if (t < PR_DIES.drop) return v;
  const k = clamp01((t - PR_DIES.drop) / 0.35);
  return v.map((p) => [p[0], p[1], p[2] + (0.9 - p[2]) * k * k] as V3);
}

// =============================================================================================
// HER, AS THE GAME HOLDS A MONSTER

export const PR_NAMES = {
  stand: 'The Princess hovers',
  walk: 'The Princess glides',
  attack: 'The nettle vine lash',
  snare: 'The vine snare',
  eleven: 'The Eleven',
  vow: 'The Vow',
  rideForm: 'The steed forms',
  rideLeap: 'A leap',
  rideEnd: 'The steed fades',
  reel: 'The Princess is struck',
  dying: 'Steed fades, vines wither',
} as const;
const RIDES: Readonly<Record<string, RideMove>> = { [PR_NAMES.rideForm]: 'rideForm', [PR_NAMES.rideLeap]: 'rideLeap', [PR_NAMES.rideEnd]: 'rideEnd' };
/** Each of her moves by the name the review knows it by (art/boss_checks.ts), its plan's pose at a moment. */
const PLANS: Record<string, Plan> = { attack: lashPlan(), snare: snarePlan(), eleven: elevenPlan(), vow: vowPlan(), reel: reelPlan(), dying: diesPlan() };
const POSES: Record<string, (t: number) => P> = Object.fromEntries(Object.entries(PLANS).map(([k, p]) => [k, poseFn(p)]));
const bonesOf = (move: string, t: number): Skeleton => {
  const ride = (Object.values(RIDES) as string[]).includes(move) ? (move as RideMove) : null;
  const pose = ride ? riderAt(ride, Math.max(0, Math.min(RIDE_LONG[ride], t))) : (POSES[move]?.(Math.max(0, Math.min(PLANS[move].long, t))) ?? {});
  return solve(B, { ...R, ...pose } as Posed);
};
/** The strikes, by move: from the last frame of the wind-up to the frame it lands on. */
export const PR_STRIKES: Readonly<Record<string, readonly [number, number]>> = { attack: PR_LASH.strike, snare: PR_SNARE.strike, eleven: PR_ELEVEN.strike, vow: PR_VOW.strike, rideLeap: RIDE_LEAP.strike };
const byName: Record<string, string> = Object.fromEntries(Object.entries(PR_NAMES).map(([k, v]) => [v, k]));
/** Whether a frame of a move shows its strike's smear: from the frame after its wind-up ends to the frame after it lands (thinning then). */
export function smearedAt(move: string, t: number): boolean {
  const s = PR_STRIKES[move];
  return !!s && t > s[0] + 1e-6 && t <= s[1] + FR + 1e-6;
}
/** THE SMEAR: after-images of what strikes, along the way it has come since its wind-up ended. */
function smearOf(move: string, t: number): V3[][] | null {
  if (!smearedAt(move, t)) return null;
  const [s0, s1] = PR_STRIKES[move];
  const to = Math.min(t, s1);
  const out: V3[][] = [];
  if (move === 'attack') {
    // (the sweep's own streaks first, dimmest: arcs across the quarter turn it has swept so far, all the way out)
    const from = PR_LASH.from;
    const now = from + (PR_LASH.area[1] - from) * clamp01(((POSES.attack(to).draw as number) ?? 1) - 1);
    const D = Math.PI / 180;
    const s = bonesOf('attack', to);
    for (let r = 24; r <= LASH_REACH; r += 22) {
      const arc: V3[] = [];
      const steps = Math.max(2, Math.ceil(((now - from) * D * r) / 10));
      for (let j = 0; j <= steps; j++) {
        const a = (from + ((now - from) * j) / steps) * D;
        arc.push([s.pelvis[0] + Math.cos(a) * r, s.pelvis[1] + Math.sin(a) * r, 0.8]);
      }
      out.push(arc);
    }
  }
  const n = move === 'attack' ? 8 : 4;
  for (let i = 0; i <= n; i++) {
    const u = s0 - FR * 0.5 + ((to - (s0 - FR * 0.5)) * i) / n;
    if (move === 'rideLeap') {
      const P = steedPoseAt('rideLeap', u);
      const pts = steedPoints(P);
      out.push([pts.poll, pts.muzzle], [steedAt(P, [14, 5, 33]), pts.hoof0], [steedAt(P, [14, -5, 33]), pts.hoof1], [pts.chest, steedAt(P, [8, 0, 48])]);
      continue;
    }
    const s = bonesOf(move, u);
    if (move === 'attack') out.push(lashVine(s, (POSES.attack(u).draw as number) ?? 0, u));
    else out.push([s.elbowR, s.handR], [s.elbowL, s.handL]);
  }
  // (and after it has landed, thinned: the oldest gone)
  return t > s1 + 1e-6 ? out.slice(Math.floor(out.length / 2)) : out;
}
/** WHAT IS LAID AFTER HER EDGE IN HER MOVES: the thorns glinting pink through each warning; the fog bursting from the steed's hooves as it lands. */
function moreOf(move: string, m: Moment): [V3, string, number][] {
  const out: [V3, string, number][] = [];
  const t = m.t;
  const warn = move === 'attack' ? PR_LASH.warn : move === 'snare' ? PR_SNARE.warn : move === 'eleven' ? PR_ELEVEN.warn : move === 'vow' ? PR_VOW.warn : null;
  if (warn && t >= warn[0] - 0.1 && t <= warn[1] + 0.03) {
    // (thorns glinting along the vine and up her arms, by turns)
    const s = m.s;
    const pts = move === 'attack' ? lashVine(s, (m.q.draw as number) ?? 0, t) : [lerp3(s.elbowR, s.handR, 0.4), lerp3(s.elbowL, s.handL, 0.4), lerp3(s.elbowR, s.handR, 0.8), lerp3(s.elbowL, s.handL, 0.8)];
    const tick = Math.floor(t * 15);
    pts.forEach((p, i) => {
      if ((i + tick) % 3 === 0) out.push([add(p, [0, 0, 0.8]), (i + tick) % 2 ? FLAME[3] : FLAME[4], 1]);
    });
  }
  if (move === 'rideLeap' && t >= RIDE_LEAP.hit - 1e-6 && t < RIDE_LEAP.hit + 0.42) {
    // THE FOG BURSTING OUT where its hooves come down: puffs rolling out over the floor all round, thinning as they go
    const k = (t - RIDE_LEAP.hit) / 0.42;
    const P = steedPoseAt('rideLeap', t);
    const soles = solesOf(P);
    const c = lerp3(soles[0], soles[1], 0.5);
    const n = 40;
    for (let i = 0; i < n; i++) {
      const own = hashOf(i, 1);
      if (own < k * 0.85) continue;
      const a = (i / n) * Math.PI * 2 + (hashOf(i, 2) - 0.5) * 0.5;
      const r = (5 + 28 * Math.sqrt(k)) * (0.7 + 0.5 * hashOf(i, 3));
      const z = 0.6 + (1 + 5 * hashOf(i, 4)) * Math.sin(Math.PI * Math.min(1, k * 1.4));
      const col = k < 0.3 ? '#dcd8ea' : own > 0.7 ? '#c8c2dc' : '#9890b4';
      out.push([[c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r * 0.9, z], col, own > 0.5 && k < 0.6 ? 3 : 2]);
    }
  }
  if (move === 'dying' && t > 0.38 && t < 1.6) {
    // THE HUSH LEAVES HER: a grey breath out of her lips, rising and thinning
    const s = m.s;
    const mouth = add(s.head, add(mul(s.face[0], B.headR[0] * 0.9), mul(s.face[2], -B.headR[2] * 0.45)));
    for (let i = 0; i < 22; i++) {
      const life = (t - 0.38) * 1.6 - i * 0.045;
      if (life < 0 || life > 1) continue;
      const p = add(mouth, add(mul(s.face[0], 2 + 5 * life), [Math.sin(i * 1.7 + t * 3) * 1.6 * life, Math.cos(i * 1.3) * 1.6 * life, 2 + 16 * life]));
      out.push([p, life < 0.3 ? '#b6b0cc' : life < 0.6 ? '#9890b4' : '#625a7a', life < 0.5 ? 2 : 1]);
    }
  }
  if (move === 'rideForm' && t < 1.0) {
    // THE GREY BREATH GATHERING on the floor round her, drawn in and up
    const k = t / 1.0;
    for (let i = 0; i < 24; i++) {
      const a = (i / 24) * Math.PI * 2 + k * 2.2;
      const r = 34 * (1 - k) + 8;
      out.push([[Math.cos(a) * r, Math.sin(a) * r * 0.8, 0.6 + 14 * k * k * ((i % 4) / 3)], i % 2 ? '#b0aacb' : '#9890b4', 2]);
    }
  }
  return out;
}
const vineOf = (m: Moment): V3[] | null => {
  const move = byName[m.move ?? ''] ?? '';
  if (move === 'attack') return lashVine(m.s, (m.q.draw as number) ?? 0, m.t);
  if (move === 'dying') return dyingVine(m.s, m.t, bonesOf('dying', PR_DIES.drop));
  const r = RIDES[m.move ?? ''];
  if (r) return riddenVine(r, m.s, m.t);
  return null;
};
/** Her vine on her steed: trailing as it forms, whirled over her head as it leaps, trailing again as it fades. */
function riddenVine(r: RideMove, s: Skeleton, t: number): V3[] {
  const k = whirlOf(r, t);
  if (k <= 0) return restAt(s, t);
  const w = whirledVine(s, r === 'rideLeap' ? t : 0);
  if (k >= 1) return w;
  return restAt(s, t).map((p, i) => lerp3(p, w[i], k));
}
/** Her vine whirled over her head as she rides: from her right hand up and back, curling round. */
export function whirledVine(s: Skeleton, t: number): V3[] {
  const pts: V3[] = [s.handR];
  const a = t * Math.PI * 2 * (1 / RIDE_LEAP.long);
  for (let i = 1; i <= 12; i++) {
    const k = i / 12;
    const dir = norm([-Math.cos(a + k * 2.2) * 0.8 - 0.2, -Math.sin(a + k * 2.2) * 0.8 - 0.6, 0.3]);
    pts.push(add(s.handR, add(mul(dir, 26 * k), [0, 0, 8 * Math.sin(Math.PI * k) - 10 * k * k])));
  }
  return pts;
}
const SAY: PrincessSay = {
  vine: vineOf,
  steed: (m) => {
    const r = RIDES[m.move ?? ''];
    return r ? steedPoseAt(r, Math.max(0, Math.min(RIDE_LONG[r], m.t))) : null;
  },
  wither: (m) => (m.dying ? smooth(PR_DIES.wither[0], PR_DIES.wither[1], m.t) : 0),
  smear: (m) => smearOf(byName[m.move ?? ''] ?? '', m.t),
  more: (m) => moreOf(byName[m.move ?? ''] ?? '', m),
  seated: (m) => !!RIDES[m.move ?? ''],
};

function princessMob(): Mob {
  const paint = princessPainter(SAY);
  const mv = (name: string, motion: Motion, more: Partial<MobMove> = {}): MobMove => ({ name, motion, rest: R, ...more });
  const glow = (warn: readonly [number, number]) => (t: number): number => (t >= warn[0] && t <= warn[1] ? 1 : 0);
  return {
    id: 'princess',
    name: 'The Princess',
    size: 'a boss: a head taller than the knight',
    build: B,
    stand: mv(PR_NAMES.stand, princessStand()),
    attack: mv(PR_NAMES.attack, motionOf(PLANS.attack), { glint: glow(PR_LASH.warn) }),
    more: {
      snare: mv(PR_NAMES.snare, motionOf(PLANS.snare), { glint: glow(PR_SNARE.warn) }),
      eleven: mv(PR_NAMES.eleven, motionOf(PLANS.eleven), { glint: glow(PR_ELEVEN.warn) }),
      vow: mv(PR_NAMES.vow, motionOf(PLANS.vow), { glint: glow(PR_VOW.warn) }),
      rideForm: mv(PR_NAMES.rideForm, rideMotion('rideForm')),
      rideLeap: mv(PR_NAMES.rideLeap, rideMotion('rideLeap'), { glint: glow(RIDE_LEAP.warn) }),
      rideEnd: mv(PR_NAMES.rideEnd, rideMotion('rideEnd')),
    },
    idleFrames: 28,
    idleFps: 10,
    walk: mv(PR_NAMES.walk, { ...motionOf(glidePlan()), loop: 0 }, { period: PR_GLIDE.frames / PR_GLIDE.fps, ground: PR_PACE * TILE3 }),
    walkFrames: PR_GLIDE.frames,
    walkFps: PR_GLIDE.fps,
    pace: PR_PACE,
    reel: mv(PR_NAMES.reel, motionOf(PLANS.reel)),
    reelTime: PR_REEL,
    hit: PR_LASH.hit,
    warn: PR_LASH.warn[1] - PR_LASH.warn[0],
    dieTime: PR_DIES.long,
    dying: mv(PR_NAMES.dying, motionOf(PLANS.dying)),
    aura: { x: PR_CANVAS.ax, y: PR_CANVAS.ay - 46, r: 44, color: '#9890b4', a: 0.08 },
    shadow: 14,
    canvas: PR_CANVAS,
    trueBack: true,
    bits: paint.bits,
    grains: paint.grains,
    finish: paint.finish,
    // (the steed rises up out of the floor and sinks back into it: what of it is below is not seen)
    under: (m) => !!RIDES[m.move ?? ''],
  };
}
export const PRINCESS = princessMob();
export function makePrincessArt3(mob: Mob = PRINCESS): ActorArt {
  return { front: mobSet(mob, 'front', mob.pace), back: mobSet(mob, 'back', mob.pace) };
}

// =============================================================================================
// HER AS THE CHECKS SEE HER (art/boss_checks.ts)

const len3 = (v: V3): number => Math.hypot(v[0], v[1], v[2]);
export function princessSolids(s: Skeleton): { limbs: CheckLimb[]; lumps: CheckLump[] } {
  const [rH, rK, rA] = B.legR;
  const [r0, r1] = B.armR;
  const limbs: CheckLimb[] = [];
  for (const side of ['L', 'R'] as const) {
    const L = side === 'L';
    limbs.push(
      { name: `leg${side}`, a: L ? s.hipL : s.hipR, b: L ? s.kneeL : s.kneeR, r: rH * 1.1 },
      { name: `shin${side}`, a: L ? s.kneeL : s.kneeR, b: L ? s.ankleL : s.ankleR, r: Math.max(rK, rA) * 1.15 },
      { name: `upper${side}`, a: L ? s.shoulderL : s.shoulderR, b: L ? s.elbowL : s.elbowR, r: r0 * 1.15 },
      { name: `fore${side}`, a: L ? s.elbowL : s.elbowR, b: L ? s.handL : s.handR, r: r1 * 1.1 },
    );
  }
  limbs.push({ name: 'neck', a: s.neck, b: lerp3(s.neck, s.head, 0.5), r: 2.0 });
  const waistC = add(s.pelvis, mul(s.hips[2], B.waist * 0.62));
  const lumps: CheckLump[] = [
    { name: 'head', c: add(s.head, mul(s.face[2], -0.2)), rot: s.face, h: [B.headR[0] * 1.05, B.headR[1] * 1.08, B.headR[2] * 1.02] },
    { name: 'chest', c: lerp3(s.ribs, s.neck, 0.3), rot: s.chest, h: [B.ribDeep + 1.4, B.ribHalf + 1.2, len3(sub(s.neck, s.ribs)) * 0.55] },
    { name: 'belly', c: lerp3(waistC, s.ribs, 0.45), rot: s.belly, h: [B.waistDeep + 1.5, B.waistHalf + 1.3, Math.max(3, len3(sub(s.ribs, waistC)) * 0.6)] },
    { name: 'hips', c: add(s.pelvis, mul(s.hips[2], B.waist * 0.2)), rot: s.hips, h: [B.pelvisDeep + 2.2, B.pelvisHalf + 2.0, B.waist * 0.75] },
  ];
  return { limbs, lumps };
}
const isRide = (move: string): move is RideMove => move === 'rideForm' || move === 'rideLeap' || move === 'rideEnd';
const vineFor = (move: string, t: number, s: Skeleton, q: Posed): V3[] | null => {
  if (move === 'attack') return lashVine(s, (q.draw as number) ?? 0, t);
  if (isRide(move)) return riddenVine(move, s, t);
  if (move === 'dying') return t < PR_DIES.drop ? restAt(s, t) : null;
  return restAt(s, t);
};
const ALL_MOVES = ['stand', 'walk', 'attack', 'reel', 'dying', 'snare', 'eleven', 'vow', 'rideForm', 'rideLeap', 'rideEnd'];
export const PR_SHAPE: BossShape = {
  body: princessSolids,
  tip: (move, t, s, q) => {
    if (move === 'attack') {
      const v = lashVine(s, (q.draw as number) ?? 0, t);
      return v[v.length - 1];
    }
    if (move === 'snare' || move === 'eleven' || move === 'vow') return s.handR;
    if (move === 'rideLeap') return steedPoints(steedPoseAt('rideLeap', t)).chest;
    return null;
  },
  things: (move, t, s, q) => {
    const v = vineFor(move, t, s, q);
    return v ? ([{ name: 'vine', pts: v.slice(1), r: 1.1, may: ['foreR'] }] as CheckThing[]) : [];
  },
  // (riding, what grips the floor is the steed's hooves, down where they come down; standing, her own feet, never down while she hovers)
  // (a hoof under the floor as the steed rises out of it or sinks back, swallowed by it, grips nothing: it is not there)
  grips: (move, t, s) => {
    if (!isRide(move)) return [{ name: 'heelL', p: s.heelL }, { name: 'toeL', p: s.toeL }, { name: 'heelR', p: s.heelR }, { name: 'toeR', p: s.toeR }];
    const P = steedPoseAt(move, t);
    return solesOf(P).map((p, i) => ({ name: `hoof${i}`, p: P.z < -0.5 ? ([p[0], p[1], 1e3] as V3) : p }));
  },
  follow: (move, t, s) => {
    const own: Record<string, V3> = { head: s.head, handL: s.handL, handR: s.handR, pelvis: s.pelvis, chest: s.ribs };
    if (!isRide(move)) return own;
    const P = steedPoseAt(move, t);
    const pts = steedPoints(P);
    return { ...own, muzzle: pts.muzzle, poll: pts.poll, withers: pts.chest, croup: pts.croup, hoof0: pts.hoof0, hoof1: pts.hoof1, hoof2: pts.hoof2, hoof3: pts.hoof3, back: steedAt(P, [0, 0, 49]) };
  },
  strikes: PR_STRIKES,
  smeared: smearedAt,
  handovers: [
    ...ALL_MOVES.filter((m) => m !== 'stand' && m !== 'walk' && !isRide(m)).flatMap((m): Handover[] => (m === 'dying' ? [{ from: 'stand', at: 0, to: m, toAt: 0 }] : [{ from: 'stand', at: 0, to: m, toAt: 0 }, { from: m, at: 'end', to: 'stand', toAt: 0 }])),
    { from: 'stand', at: 0, to: 'walk', toAt: 0 },
    ...Array.from({ length: PR_GLIDE.frames + 1 }, (_, i): Handover => ({ from: 'walk', at: i / PR_GLIDE.fps, to: 'stand', toAt: 0 })),
    { from: 'stand', at: 0, to: 'rideForm', toAt: 0 },
    { from: 'rideForm', at: 'end', to: 'rideLeap', toAt: 0 },
    { from: 'rideLeap', at: 'end', to: 'rideLeap', toAt: 0 },
    { from: 'rideLeap', at: 'end', to: 'rideEnd', toAt: 0 },
    { from: 'rideEnd', at: 'end', to: 'stand', toAt: 0 },
  ],
};
void cross;
void PR_HOVER;
void PR_STAND_LONG;
