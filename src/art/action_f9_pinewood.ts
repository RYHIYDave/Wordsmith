// FLOOR 9'S MOBS, MORE ACTION: THE TWISTED DEER AND THE FOG WOLVES OF THE PINEWOOD (the art chat's helper, 1 Nov 2026;
// docs/mockups/action_f9/README.md). A MOCK-UP: NOTHING OF THE GAME IMPORTS THIS FILE. The deer's BRAMBLE CHARGE in place of its
// stomp and its gore made by Movement 9 (DEER_BRAMBLE, off); the fog wolf's PACK STRIKE in place of its bite (WOLF_PACK, off). Each
// on the game's own figure (art/twisted_deer.ts, art/fog_wolves.ts), all it keeps frame for frame its own.
//
// His review of every enemy for more action, 31 Oct 2026, each offered and answered “Yes (Recommended)”:
//   THE TWISTED DEER: “Bramble charge, in place of the stomp: lowers its antlers and charges down a marked lane, leaving a hedge of
//   thorns along its path that stays a few seconds.” Its gore kept, tightened by Movement 9 (a medium mob: two attacks).
//   THE FOG WOLF: “Pack strike: the pack spreads in a ring round you, then lunges in one after another from every side, a beat
//   apart.” A small mob: this one attack.
// Under his Movement 9 (24 Oct: “Like the wind up and wind down are big but the actual punch is lightning quick”; 28 Oct: “And bigger
// AOE to compensate for the extra time the player gets to evade”) and his rulebook's Monsters 9, Action, like a movie.
//
// THE GORE: its head dropped low, its thorned antlers aimed at you, HELD trembling; in TWO FRAMES it lunges, its forefeet thrown
// forward a stride, and hooks its antlers up through you, smeared; its head flung up high after, held; it steps back and settles.
// THE BRAMBLE CHARGE: the lane is marked on the floor from it, through where you stood; it drops its antlers, stamps twice, and HOLDS,
// trembling; in TWO FRAMES it bursts off, smeared; it gallops down the lane, fast (the game carries it), and brakes at its end, tossing
// its antlers; and behind it, all along its path, A HEDGE OF THORNS bursts up out of the ground (its own twisted roots and bramble), a
// wall you cannot cross while it stands; withering after a few seconds.
// THE PACK STRIKE: each wolf, in its place on the ring round you, crouches down into its fog, its eyes flaring, its jaws opening, and
// HOLDS, trembling; in TWO FRAMES it leaps clean through where you stand (the game carries it), its jaws snapping shut, smeared: its
// fog streaming back along the way it came and its eyes' fire drawn out in two lines; it lands past you, skidding on its fog, shakes
// its head and falls back into its fog, on the ring again across from where it was. The pack's ring and its beat: the rules'.

import { Px } from '../engine/px';
import type { Light, Sprite } from '../engine/px';
import type { ActorArt, Clip } from './actor_types';
import { hash, lazyFrames, toSprite } from './kit';
import type { Painted } from './kit';
import { ENEMY_RIM, FLAME } from './mkit';
import { TILE3, paintBits } from './new_mobs3';
import type { Bit, Put } from './new_mobs3';
import { stage } from './skin';
import type { GameView } from './skin';
import type { V3 } from './skeleton';
import {
  BARK, CLOD, DEER_AURA, DEER_CANVAS, DEER_FEET, K0 as DK0, MOSS, PIVOT as D_PIVOT, POINT, ROOT, THORN, along as dAlong, burst,
  crooked, deerBits, eyeOf as dEye, fromKey as dFromKey, poseOf as dPoseOf, headFrame as dHead, keyed as dKeyed, laid as dLaid, makeDeerArt, plus as dPlus, shiver as dShiver,
  swell, thorns, worldOf as dWorld,
} from './twisted_deer';
import type { DeerPose, Key as DKey } from './twisted_deer';
import {
  B_BACK, FANG, K0 as WK0, PIVOT as W_PIVOT, STAND0 as W_STAND0, WISP, WOLF_AURA, WOLF_CANVAS, along as wAlong, basePose as wBase, eyeOf as wEye,
  fromKey as wFromKey, grainsOf, headFrame as wHead, keyed as wKeyed, laid as wLaid, legOf, makeWolfArt, plus as wPlus, thinned, wolfBits, worldOf as wWorld,
} from './fog_wolves';
import type { Key as WKey, WolfPose } from './fog_wolves';
import { FR, TAU, clamp01, f, smearAlong, smooth } from './action_f6_fx';

/** THE SWITCHES, OFF. With one on, the bestiary's figure is made by the maker below. */
export const DEER_BRAMBLE = { on: false };
export const WOLF_PACK = { on: false };

const sm = smooth;
const lin = (v: number): number => clamp01(v);
const easeOut = (v: number): number => 1 - (1 - clamp01(v)) ** 2;
const add = (a: V3, b: V3): V3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const lerpV = (a: V3, b: V3, s: number): V3 => [a[0] + (b[0] - a[0]) * s, a[1] + (b[1] - a[1]) * s, a[2] + (b[2] - a[2]) * s];
const bump = (t: number, a: number, b: number): number => (t <= a || t >= b ? 0 : Math.sin((Math.PI * (t - a)) / (b - a)) ** 2);

// =============================================================================================
// THE TWISTED DEER: ITS GORE BY MOVEMENT 9

/**
 * THE GORE'S NUMBERS (seconds from its start; tiles):
 *   wind-up  its head dropped low, its antlers aimed at you, its body drawn back on its haunches, by 0.25 s; HELD, trembling, to
 *            0.567 s (0.32 s)
 *   strike   TWO FRAMES, smeared: lunging, its forefeet thrown a stride forward (frame 18), its antlers hooked up through you
 *            (frame 19, 0.633 s: the clip's `hit`)
 *   wind-down  its head flung up high, held, to 0.95 s; its forefeet stepped back by 1.25 s; at rest 1.6 s
 *   reach    a hero in the strip `reach` before it and `half` to either side is struck and thrown (the game's: 1.12, 0.65)
 */
export const GORE_HIT = f(19);
export const GORE_STRIKE = [f(17), f(19)] as const;
export const GORE_SMEARED = (t: number): boolean => t > GORE_STRIKE[0] + 1e-6 && t <= GORE_STRIKE[1] + FR + 1e-6;
export const GORE9 = { hit: GORE_HIT, strike: GORE_STRIKE, low: 0.25, long: 1.6, reach: 1.6, half: 0.9, knock: 0.8 } as const;
const G9_LOW = dKeyed({ x: -7, z: -3.4, pitch: 8, neck: 46, hp: 38, hy: -10, hr: -5, ears: -35, eyes: 1.9 });
const G9_MID = dKeyed({ x: 8, z: -1.8, pitch: 2, neck: 26, hp: 16, hy: 0, hr: 2, ears: -35, eyes: 2 });
const G9_HIT = dKeyed({ x: 13, z: -0.4, pitch: -3, neck: 6, hp: -14, hy: 9, hr: 7, ears: -30, eyes: 2 });
const G9_UP = dKeyed({ x: 11, z: 1.4, pitch: -9, neck: -12, hp: -30, hy: 13, hr: 9, ears: -20, eyes: 1.7 });
const G9_UP2 = dKeyed({ x: 10, z: 1.0, pitch: -7, neck: -9, hp: -25, hy: 10, hr: 7, ears: -20, eyes: 1.5 });
/** How far its forefeet are thrown forward (its own lengths): a stride as it lunges, and back after. */
const LUNGE = 15;
function forefoot(t: number, i: 0 | 1): { foot: V3; fold: number } {
  const [s0, s1] = GORE_STRIKE;
  const r = DEER_FEET[i];
  const late = i === 1 ? 0.06 : 0;
  // (thrown forward in the strike; stepped back after, the far one a moment later)
  if (t <= s0) return { foot: r, fold: 0 };
  if (t < s1 + 1e-6) {
    const k = (t - s0) / (s1 - s0);
    return { foot: [r[0] + LUNGE * k, r[1], k < 1 ? 6 * Math.sin(Math.PI * k) + 0.01 : 0], fold: k < 1 ? 70 * Math.sin(Math.PI * k) : 0 };
  }
  const b0 = 1.0 + late;
  const b1 = 1.22 + late;
  if (t < b0) return { foot: [r[0] + LUNGE, r[1], 0], fold: 0 };
  if (t < b1) {
    const k = (t - b0) / (b1 - b0);
    return { foot: [r[0] + LUNGE * (1 - sm(k)), r[1], 5 * Math.sin(Math.PI * k) + 0.01], fold: 60 * Math.sin(Math.PI * k) };
  }
  return { foot: r, fold: 0 };
}
function goreBody(t: number): DeerPose {
  const [s0, s1] = GORE_STRIKE;
  let K = dAlong(t, [
    [0, DK0, sm],
    [GORE9.low, G9_LOW, swell],
    [s0, G9_LOW, sm],
    [f(18), G9_MID, lin],
    [s1, G9_HIT, lin],
    [s1 + 0.12, G9_UP, easeOut],
    [0.95, G9_UP2, sm],
    [1.25, dKeyed({ x: 2, z: 0.3, pitch: -2, neck: 2, hp: -6, hy: 3, eyes: 1.3 }), sm],
    [GORE9.long, DK0, swell],
  ]);
  if (t > GORE9.low && t < s0) K = dPlus(K, dShiver(t, sm((t - GORE9.low) / 0.06)));
  const f0 = forefoot(t, 0);
  const f1 = forefoot(t, 1);
  const P = dFromKey(K, [f0.foot, f1.foot, DEER_FEET[2], DEER_FEET[3]], [f0.fold, f1.fold, 0, 0]);
  P.tail = 30 * bump(t, 0.1, 1.3);
  return P;
}
/** Its antlers' two tips (its long left and short right), at a pose. */
export function antlerTips(P: DeerPose): [V3, V3] {
  const H = dHead(P);
  return [H.q([3.9, 14.2, 33.2]), H.q([-1.1, -13.8, 22.2])];
}
/** The end it strikes with: between its antlers' tips. */
export const antlerTip = (P: DeerPose): V3 => lerpV(...antlerTips(P), 0.5);

// =============================================================================================
// THE TWISTED DEER: ITS BRAMBLE CHARGE

/**
 * THE CHARGE'S NUMBERS (seconds from its start; tiles):
 *   aim      where the hero stands at `aim`: THE LANE is marked from it, through where he stood, `lane` tiles long, `half` to either
 *            side of its middle (0.73 s before it bursts off)
 *   wind-up  its antlers dropped, its body drawn back on its haunches by 0.3 s; it stamps its right forefoot twice (0.45 s, 0.6 s);
 *            HELD, trembling, to 0.933 s (0.31 s)
 *   strike   TWO FRAMES, smeared: it bursts off (frame 29: 0.9 tiles on), away (frame 30, 1.0 s: the clip's `hit`; 1.9 tiles on)
 *   the run  galloping down the lane at `pace` tiles a second, its antlers low (the game carries it: `chargeCarry(t)`)
 *   the stop braking over its last `stop` seconds, at `carried` tiles from where it set off
 *   wind-down  tossing its antlers, snorting, its feet stepped back under it, from 1.55 s; at rest 2.5 s
 *   struck   a hero in the lane as it comes by (within `half` of its middle) is struck and thrown aside
 *   THE HEDGE  behind it all along its path, from `HEDGE.from` tiles to where it stops, a hedge of thorns bursts up out of the
 *            ground as it passes: a wall `HEDGE.half` to either side of the lane's middle that he cannot cross while it stands, for
 *            `HEDGE.stays` seconds after it is all up, withering over its last `HEDGE.fade`; its thorns sting (the rules')
 *   near, far  charged at a hero from 2.5 to 7 tiles off
 */
export const CHARGE_HIT = f(30);
export const CHARGE_STRIKE = [f(28), f(30)] as const;
export const CHARGE_SMEARED = (t: number): boolean => t > CHARGE_STRIKE[0] + 1e-6 && t <= CHARGE_STRIKE[1] + FR + 1e-6;
const RUN = 0.37;
const STOP = 0.18;
export const CHARGE = { hit: CHARGE_HIT, strike: CHARGE_STRIKE, aim: 0.27, lower: 0.3, stamps: [0.45, 0.6] as const, launch: [0.9, 1.9] as const, pace: 11, run: RUN, stop: STOP, until: CHARGE_HIT + RUN + STOP, long: 2.5, lane: 7.6, half: 0.7, near: 2.5, far: 7 } as const;
/** How far the game has carried it down its lane, `t` seconds into the charge (tiles). */
export function chargeCarry(t: number): number {
  const [s0, s1] = CHARGE_STRIKE;
  const [l0, l1] = CHARGE.launch;
  if (t <= s0) return 0;
  if (t < s0 + FR) return l0 * ((t - s0) / FR);
  if (t < s1) return l0 + (l1 - l0) * ((t - s0 - FR) / FR);
  const r = t - s1;
  if (r < RUN) return l1 + CHARGE.pace * r;
  const u = Math.min(STOP, r - RUN);
  return l1 + CHARGE.pace * RUN + CHARGE.pace * u - (CHARGE.pace * u * u) / (2 * STOP);
}
/** How far it has gone when it stops (tiles): 7.0. */
export const CHARGE_CARRIED = chargeCarry(CHARGE.until + 1);
/** The seconds into the charge it has been carried `d` tiles (its first moment there). */
export function chargeAt(d: number): number {
  let lo = 0;
  let hi = CHARGE.until;
  if (d >= CHARGE_CARRIED) return CHARGE.until;
  for (let i = 0; i < 40; i++) {
    const m = (lo + hi) / 2;
    if (chargeCarry(m) < d) lo = m;
    else hi = m;
  }
  return hi;
}
// ITS GALLOP (his fix, 2 Nov 2026, 07:33: “I’m not in love with the bramble charge from the deer.  Maybe it’s just the look I don’t
// love, not sure”; his pick by 07:36: “Redo hedge and gallop (Recommended)”, offered as: same move; the hedge becomes dark, living
// brambles: leaves, hooked thorns, writhing up; the deer stretches into a full gallop). A REAL GALLOP, painted to the way it is
// carried: the body low and long, its head and antlers down and forward; its legs reaching far out in front and far back, GATHERING
// under it and STRETCHING out in turn (two flights a stride: stretched out after its hind feet push off, gathered under it after its
// forefeet do); each foot down on its own spot of the floor while the floor goes by under it (feet grip); mud kicked up off each.
const STRIDE = 2.2 * TILE3;
const FIRST = 1.9 * TILE3;
/** Where in its stride it is (0 to 1 a stride) when it lands from bursting off: stretched out, its forefeet about to come down. */
const U0 = 0.45;
/** Each foot's stride: when it comes down and lifts (parts of a stride: its right fore, left fore, right hind, left hind), and where it comes down (its own lengths forward of its middle). */
const GAIT = [
  { td: 0.5, lo: 0.8, x: 29 },
  { td: 0.56, lo: 0.86, x: 29 },
  { td: 1.0, lo: 1.36, x: -4 },
  { td: 1.06, lo: 1.42, x: -4 },
] as const;
/** A foot's fold as it comes down and as it lifts (its cannon reaching forward, or trailing back). */
const FOLD_DOWN = [-28, -28, -12, -12];
const FOLD_UP = [30, 30, 45, 45];
/** Where a foot lifts (its own lengths forward of its middle): where it came down, less the floor gone by under it while it was down. */
const liftX = (i: number): number => GAIT[i].x - (GAIT[i].lo - GAIT[i].td) * STRIDE;
/**
 * A foot swung through the air from where it lifted to where it comes down: [part of its swing, forward, up, fold]. Forefeet: flicked
 * up and back, folded tight under the forearm; the knee driven up and forward; the cannon flung out, reaching; down. Hind feet:
 * flicked up behind; swung forward under the belly, folded; reaching forward; down.
 */
const SWING: readonly (readonly (readonly number[])[])[] = [0, 1, 2, 3].map((i) =>
  i < 2
    ? [[0, liftX(i), 0, FOLD_UP[i]], [0.22, 3, 13, 112], [0.5, 19, 15, 70], [0.8, 34, 7, -32], [1, GAIT[i].x, 0, FOLD_DOWN[i]]]
    : [[0, liftX(i), 0, FOLD_UP[i]], [0.3, -31, 12, 98], [0.6, -14, 12, 40], [0.85, -1, 5, -18], [1, GAIT[i].x, 0, FOLD_DOWN[i]]],
);
/** Through points `ks` ([at, ...values]) smoothly (Catmull-Rom), at `v`. */
function through(ks: readonly (readonly number[])[], v: number): number[] {
  let i = 0;
  while (i < ks.length - 2 && v > ks[i + 1][0]) i++;
  const p0 = ks[Math.max(0, i - 1)];
  const p1 = ks[i];
  const p2 = ks[i + 1];
  const p3 = ks[Math.min(ks.length - 1, i + 2)];
  const u = clamp01((v - p1[0]) / (p2[0] - p1[0] || 1));
  const out: number[] = [];
  for (let k = 1; k < p1.length; k++) {
    const a = p0[k];
    const b = p1[k];
    const c = p2[k];
    const d = p3[k];
    out.push(0.5 * (2 * b + (-a + c) * u + (2 * a - 5 * b + 4 * c - d) * u * u + (-a + 3 * b - 3 * c + d) * u * u * u));
  }
  return out;
}
/** Where it is in its stride when it has been carried `c` (its own lengths): 0 to 1 a stride, from its landing out of the burst. */
const strideOf = (c: number): number => (c - FIRST) / STRIDE + U0;
/** A foot in the gallop when it has been carried `c` (its own lengths): down on its spot, or swung through to the next. */
function gallopFoot(i: number, c: number): { foot: V3; fold: number } {
  const r = DEER_FEET[i];
  const G = GAIT[i];
  const duty = G.lo - G.td;
  if (c < FIRST) {
    // (bursting off, in its two frames: up off the floor from where it stood into the stretched flight it lands from)
    const v = clamp01(c / FIRST);
    const to = gallopFoot(i, FIRST);
    const k = smooth(v);
    const fore = i < 2;
    return { foot: [r[0] + (to.foot[0] - r[0]) * k + (fore ? 6 : -8) * Math.sin(Math.PI * v), r[1], to.foot[2] * k + (fore ? 6 : 4) * Math.sin(Math.PI * v) + 0.01], fold: to.fold * k + (fore ? 40 : 30) * Math.sin(Math.PI * v) };
  }
  const since = (((strideOf(c) - G.td) % 1) + 1) % 1;
  if (since < duty) {
    // down: on its own spot, the body going on over it; its cannon swung from reaching to trailing
    return { foot: [G.x - since * STRIDE, r[1], 0], fold: FOLD_DOWN[i] + (FOLD_UP[i] - FOLD_DOWN[i]) * (since / duty) };
  }
  const v = (since - duty) / (1 - duty);
  const [x, z, fold] = through(SWING[i], v);
  return { foot: [x, r[1], z > 0.01 ? z : 0.01], fold };
}
/** When a foot comes down and lifts in its `k`th stride (its own lengths carried then), for the mud kicked up. */
const downAt = (i: number, k: number): number => FIRST + (k + GAIT[i].td - U0) * STRIDE;
const upAt = (i: number, k: number): number => downAt(i, k) + (GAIT[i].lo - GAIT[i].td) * STRIDE;
/** Where each foot is as it stops (its own lengths, a moment after its carry ends): to be stepped back under it. */
const STOPPED = [0, 1, 2, 3].map((i) => gallopFoot(i, CHARGE_CARRIED * TILE3));
/** Its feet stepped back under it after it stops: each that is up first, then each that is down far off its place. */
const SETTLE = ((): { from: V3; at: number }[] => {
  let j = 0;
  return STOPPED.map((s, i) => {
    const up = s.foot[2] > 0.05;
    const off = Math.abs(s.foot[0] - DEER_FEET[i][0]) > 1.5;
    return { from: s.foot, at: up ? CHARGE.until : off ? CHARGE.until + 0.14 + 0.12 * j++ : -1 };
  });
})();
const C_LOW = dKeyed({ x: -6, z: -3.4, pitch: 8, neck: 46, hp: 38, hy: -6, hr: -3, ears: -40, eyes: 1.9 });
// (stretched out in the air as it bursts off; then low and long, its neck stretched out before it, its head and antlers down and forward)
const C_FLY = dKeyed({ x: 6, z: 0.6, pitch: 1, neck: 40, hp: 40, hy: 0, hr: 0, ears: -65, eyes: 2 });
const C_RUN = dKeyed({ x: 3, z: -4.2, pitch: 3, neck: 44, hp: 44, hy: 0, hr: 0, ears: -65, eyes: 2 });
const C_BRAKE = dKeyed({ x: 3, z: -3, pitch: 9, neck: 40, hp: 32, hy: -2, hr: 0, ears: -45, eyes: 1.9 });
const C_TOSS = dKeyed({ x: -1, z: 0.6, pitch: -6, neck: -8, hp: -20, hy: 10, hr: 6, ears: -20, eyes: 1.7 });
function chargeBody(t: number): DeerPose {
  const [s0, s1] = CHARGE_STRIKE;
  const E = CHARGE.until;
  let K = dAlong(t, [
    [0, DK0, sm],
    [CHARGE.lower, C_LOW, swell],
    [s0, C_LOW, sm],
    [f(29), C_FLY, lin],
    [s1, C_RUN, lin],
    [E - STOP, C_RUN, sm],
    [E, C_BRAKE, sm],
    [E + 0.2, C_TOSS, easeOut],
    [E + 0.55, dKeyed({ x: 0, z: 0.3, pitch: -3, neck: -2, hp: -10, hy: 4, eyes: 1.4 }), sm],
    [CHARGE.long, DK0, swell],
  ]);
  const c = chargeCarry(t) * TILE3;
  // (the gallop's rocking, by where it is in its stride: up in its two flights, down as each pair of feet takes it; rocked forward onto
  // its forefeet and back onto its hind; its neck reaching on as its forefeet come down, so that its antlers go on steady)
  if (t > s1 - FR && t < E) {
    const u = strideOf(c);
    const k = Math.min(1 - sm((t - (E - STOP * 0.6)) / (STOP * 0.6)), sm((t - s1 + FR) / (2 * FR)));
    const rock = Math.sin(TAU * (u - 0.5));
    K = dPlus(K, { z: 1.7 * Math.cos(2 * TAU * (u - 0.45)) * k, pitch: 4 * rock * k, neck: -3 * rock * k, hp: -1.5 * rock * k, x: 1.2 * Math.cos(TAU * (u - 0.45)) * k });
  }
  // (the stamps: it dips onto each)
  for (const s of CHARGE.stamps) K = dPlus(K, { z: -0.8 * bump(t, s - 0.02, s + 0.1), hy: 2 * bump(t, s - 0.02, s + 0.12) });
  if (t > CHARGE.stamps[1] + 0.02 && t < s0) K = dPlus(K, dShiver(t, sm((t - CHARGE.stamps[1] - 0.02) / 0.06)));
  // (tossing its antlers: its head shaken side to side)
  const shake = bump(t, E + 0.12, E + 0.62);
  K = dPlus(K, { hy: 14 * Math.sin((t - E) * 30) * shake, hr: 8 * Math.sin((t - E) * 30 + 0.6) * shake });
  const feet: V3[] = [];
  const fold: number[] = [];
  for (let i = 0; i < 4; i++) {
    let ft: V3 = DEER_FEET[i];
    let fd = 0;
    if (i === 0 && t > 0.33 && t < 0.62) {
      // (the stamps of its right forefoot: lifted and slammed down on its own spot, twice)
      const up = Math.max(bump(t, 0.33, CHARGE.stamps[0]) * (t < CHARGE.stamps[0] - 0.04 ? 1 : 1), bump(t, 0.49, CHARGE.stamps[1]));
      ft = [DEER_FEET[0][0] + 1.5 * up, DEER_FEET[0][1], 6 * up + (up > 0 ? 0.01 : 0)];
      fd = 60 * up;
    } else if (t > s0 && t < E + 1e-6) {
      const g = gallopFoot(i, c);
      ft = g.foot;
      fd = g.fold;
    } else if (t >= E) {
      const S = SETTLE[i];
      ft = S.at < 0 ? STOPPED[i].foot : S.from;
      if (S.at >= 0 && t > S.at) {
        const k = clamp01((t - S.at) / 0.2);
        const h = S.from[2] > 0.05 ? S.from[2] * (1 - k) : 0;
        ft = [S.from[0] + (DEER_FEET[i][0] - S.from[0]) * sm(k), DEER_FEET[i][1], k < 1 ? h + 4 * Math.sin(Math.PI * k) + 0.01 : 0];
        fd = (i < 2 ? 50 : 20) * Math.sin(Math.PI * k);
      } else if (S.at >= 0 && S.from[2] > 0.05) fd = STOPPED[i].fold;
    }
    feet.push(ft);
    fold.push(fd);
  }
  const P = dFromKey(K, feet, fold);
  P.tail = t > s0 && t < E ? 40 : 30 * bump(t, 0.1, 1.0) + 25 * bump(t, E, CHARGE.long);
  return P;
}

// --- what flies off it, its smears ---
type Chip = [V3, string, number];
/** A pose as the deer's painter has it, with what hangs from it swung by how it has been moving (the deer's own `drag`) and how far the game has carried it then (so that what hangs off it trails as it runs). */
function withDrag(base: (t: number) => DeerPose, carry: (t: number) => number, t: number): DeerPose {
  const P = base(t);
  const before = base(t - 0.1);
  const a = dWorld(P, [0, 0, 30]);
  const b = dWorld(before, [0, 0, 30]);
  P.drag = [a[0] - b[0] + (carry(t) - carry(t - 0.1)) * TILE3 * 0.25, a[1] - b[1], a[2] - b[2]];
  return P;
}
const none = (): number => 0;
/** THE GORE: its pose, the earth it rakes up, its smear. */
export function gore9Pose(t: number): DeerPose {
  const P = withDrag(goreBody, none, t);
  P.chips = [
    ...burst([40, 0, 0.6], GORE_HIT - 0.02, t, 22, 303, CLOD, { speed: 38, up: 44, ahead: [0.9, 0, 0], life: 0.45, size: 3 }),
    ...burst([DEER_FEET[0][0] + LUNGE, 0, 0.6], GORE_HIT, t, 12, 304, CLOD, { speed: 26, up: 20, life: 0.3 }),
    ...burst([DEER_FEET[0][0] + LUNGE, 0, 0.6], 1.22, t, 6, 305, CLOD, { speed: 16, up: 12, life: 0.22 }),
  ];
  P.flares = t > 0.15 && t < GORE_HIT + 0.2 ? [[dHead(P).p([5, 0, 3]), 16, 0.3 * clamp01((t - 0.15) / 0.15)]] : [];
  return P;
}
/** THE CHARGE: its pose, the earth it tears up, its smears. */
export function chargePose(t: number): DeerPose {
  const P = withDrag(chargeBody, chargeCarry, t);
  const c = chargeCarry(t) * TILE3;
  const chips: Chip[] = [];
  // (its stamps: earth kicked up off each)
  for (const [j, s] of CHARGE.stamps.entries()) chips.push(...burst([DEER_FEET[0][0] + 2, DEER_FEET[0][1], 0.6], s, t, 10, 311 + j, CLOD, { speed: 22, up: 26, ahead: [-0.5, 0, 0], life: 0.32 }));
  // (bursting off: earth flung back off its hind feet; it stays where it was thrown, the deer gone on from it)
  for (const [j, at] of [[2, 313], [3, 314]] as const) {
    for (const ch of burst([DEER_FEET[j][0] - 3, DEER_FEET[j][1], 0.6], CHARGE_STRIKE[0], t, 14, at, CLOD, { speed: 40, up: 30, ahead: [-1.2, 0, 0], life: 0.38, size: 3 })) {
      const p: V3 = [ch[0][0] - c, ch[0][1], ch[0][2]];
      if (p[0] > -95) chips.push([p, ch[1], ch[2]]);
    }
  }
  // (galloping: MUD kicked up off each foot: a splash as it comes down, and clods flung back and up as it pushes off, the hind feet
  // most; left in the air where they were thrown, the deer gone on from them)
  if (t > CHARGE_STRIKE[1] - FR && t < CHARGE.until + 0.45) {
    const far = Math.min(c, CHARGE_CARRIED * TILE3);
    for (let i = 0; i < 4; i++) {
      for (let k = 0; k < 5; k++) {
        const d0 = downAt(i, k);
        if (d0 <= far && d0 >= FIRST - 1) {
          const spot = GAIT[i].x + d0 - c;
          for (const ch of burst([0, DEER_FEET[i][1], 0.6], chargeAt(d0 / TILE3), t, 6, 321 + i * 7 + k, CLOD, { speed: 18, up: 16, ahead: [-0.4, 0, 0], life: 0.25, size: 2 })) chips.push([[ch[0][0] + spot, ch[0][1], ch[0][2]], ch[1], ch[2]]);
        }
        const d1 = upAt(i, k);
        if (d1 <= far && d1 >= FIRST - 1) {
          const spot = liftX(i) + d1 - c;
          const hind = i >= 2;
          for (const ch of burst([0, DEER_FEET[i][1], 0.6], chargeAt(d1 / TILE3), t, hind ? 12 : 7, 361 + i * 7 + k, CLOD, { speed: hind ? 46 : 30, up: hind ? 40 : 28, ahead: [-1.5, 0, 0], life: 0.42, size: hind ? 3 : 2 })) chips.push([[ch[0][0] + spot, ch[0][1], ch[0][2]], ch[1], ch[2]]);
        }
      }
    }
  }
  // (braking: its forefeet dug in, earth sprayed up before it)
  chips.push(...burst([DEER_FEET[0][0] + 6, 0, 0.6], CHARGE.until - STOP * 0.7, t, 22, 331, CLOD, { speed: 34, up: 34, ahead: [0.9, 0, 0], life: 0.42, size: 3 }));
  // (its snort as it tosses its antlers: its breath, pale, out of its nose)
  if (t > CHARGE.until + 0.15 && t < CHARGE.until + 0.6) {
    const H = dHead(P);
    const u = (t - CHARGE.until - 0.15) / 0.45;
    for (let i = 0; i < 8; i++) {
      const p = H.p([9 + 10 * u * (0.6 + 0.4 * hash(i, 1, 333)), (hash(i, 2, 333) - 0.5) * 8 * u, -3 - 6 * u * hash(i, 3, 333)]);
      if (hash(i, Math.floor(t * 30), 335) < u) continue;
      chips.push([p, i % 2 ? '#a89a8e' : '#cfc6bc', u < 0.4 ? 2 : 1]);
    }
  }
  // (what has been left far behind it, the picture lets go of: the game's floor is the deer's own picture only so far)
  P.chips = chips.filter(([p]) => p[0] > -100 && p[0] < 130);
  P.flares = t > 0.2 && t < CHARGE.until ? [[dHead(P).p([5, 0, 3]), 16, 0.3 * clamp01((t - 0.2) / 0.15)]] : [];
  return P;
}
/** The deer's pose for any move: its own but the gore (by Movement 9) and the charge. */
export function brambleDeerPose(which: string, t: number): DeerPose {
  if (which === 'attack') return gore9Pose(t);
  if (which === 'charge') return chargePose(t);
  return dPoseOf(which, t);
}
/** The smear of its antlers (and, bursting off, of its body), along the way they came, in the frame it is painted in: after-images. */
function deerSmear(st: ReturnType<typeof stage>, put: Put, which: 'attack' | 'charge', t: number): void {
  const hit = which === 'attack' ? GORE_HIT : CHARGE_HIT;
  const smeared = which === 'attack' ? GORE_SMEARED(t) : CHARGE_SMEARED(t);
  const body = which === 'attack' ? goreBody : chargeBody;
  const carry = which === 'attack' ? none : chargeCarry;
  const running = which === 'charge' && t > CHARGE_HIT + FR && t < CHARGE.until - 0.05;
  if (!smeared && !running) return;
  const thin = Math.abs(t - hit - FR) < 1e-6 || running;
  const back = running ? FR * 0.8 : FR * 1.4;
  const pts: ((P: DeerPose) => V3)[] = [(P) => antlerTips(P)[0], (P) => antlerTips(P)[1], (P) => dHead(P).p([6, 0, 0])];
  if (which === 'charge') pts.push((P) => dWorld(P, [10, 0, 40]), (P) => dWorld(P, [-8, 0, 41]), (P) => dWorld(P, [-20, 0, 36]), (P) => dWorld(P, [4, 0, 24]));
  const now = carry(t);
  const lines: V3[][] = pts.map(() => []);
  for (let i = 0; i <= 8; i++) {
    const u = Math.min(t, running ? t : hit) - (back * i) / 8;
    const P = body(u);
    const dx = (carry(u) - now) * TILE3;
    pts.forEach((pt, j) => {
      const p = pt(P);
      lines[j].push([p[0] + dx, p[1], p[2]]);
    });
  }
  smearAlong(st, put, lines, thin, [BARK[2], THORN[1], THORN[3], '#fff0d8'], FLAME[2]);
}
/** One frame of the deer's new moves, from in front or behind: `attack` (the gore by Movement 9), `charge`. */
export function brambleDeerPainted(which: 'attack' | 'charge', t: number, view: GameView = 'front'): Painted {
  dEye(view);
  const P = which === 'attack' ? gore9Pose(t) : chargePose(t);
  const st = stage(view, DEER_CANVAS.ax, DEER_CANVAS.ay, DEER_CANVAS);
  const bits: Bit[] = [];
  const put: Put = (part, piece, shape) => {
    bits.push({ part, piece, shape });
  };
  deerBits(P, put, view);
  deerSmear(st, put, which, t);
  const lights = paintBits(st, bits, dWorld(P, D_PIVOT));
  for (const [p, r, a] of P.flares) {
    const [x, y] = st.at(p);
    lights.push({ x, y, r, color: FLAME[3], a });
  }
  const px = st.whole(ENEMY_RIM);
  for (const [pt, col, size] of P.chips) dLaid(px, st, pt, col, size);
  return { px, lights };
}
const deerFrame9 = (which: 'attack' | 'charge', t: number, view: GameView): Sprite => toSprite(brambleDeerPainted(which, t, view), DEER_AURA, DEER_CANVAS.ax, DEER_CANVAS.ay);
/** As the game holds a monster: the game's own deer (stand, limp, struck, death: its own pictures), its gore by Movement 9 as its `attack`, the bramble charge as `moves.charge` (in place of `stomp`). */
export function makeBrambleDeerArt(): ActorArt {
  const art = makeDeerArt();
  for (const [set, view] of [[art.front, 'front'], [art.back, 'back']] as const) {
    const clip = (which: 'attack' | 'charge', long: number, hit: number): Clip => ({ frames: lazyFrames(Math.round(long * 30) + 1, (i) => deerFrame9(which, i / 30, view)), fps: 30, hit });
    const attack = clip('attack', GORE9.long, GORE_HIT);
    set.attack = lazyFrames(3, (i) => attack.frames[[12, 19, 24][i]]);
    if (set.clips) {
      set.clips.attack = attack;
      const moves = { ...(set.clips.moves ?? {}) };
      delete moves.stomp;
      set.clips.moves = { ...moves, charge: clip('charge', CHARGE.long, CHARGE_HIT) };
    }
  }
  return art;
}

// --- THE HEDGE OF THORNS ---
/**
 * THE HEDGE (tiles; seconds from the charge's start):
 *   clumps   from `from` tiles along its path to `CHARGE_CARRIED - 0.3`, one every `step`, each bursting up out of the ground a moment
 *            (`late`) after the deer has gone by it (`hedgeUp(d)`), full height in `rise`
 *   half     the wall's half width (the hero cannot cross it while it stands)
 *   high     its height (its own lengths: the knight is 58; to his belt and over)
 *   stays    standing this long after its last clump is up, withering over its last `fade`
 */
export const HEDGE = { from: 0.3, step: 0.42, late: 0.05, rise: 0.12, half: 0.4, high: 34, stays: 4.0, fade: 0.6 } as const;
/** Where along its path each clump of the hedge stands (tiles from where the deer set off). */
export const HEDGE_AT: readonly number[] = ((): number[] => {
  const out: number[] = [];
  for (let d = HEDGE.from; d <= CHARGE_CARRIED - 0.3 + 1e-6; d += HEDGE.step) out.push(d);
  return out;
})();
/** When a clump `d` tiles along bursts up (seconds into the charge): as the deer's hind feet have gone by it. */
export const hedgeUp = (d: number): number => chargeAt(d + 0.6) + HEDGE.late;
/** When the hedge is gone (seconds into the charge). */
export const HEDGE_GONE = hedgeUp(HEDGE_AT[HEDGE_AT.length - 1]) + HEDGE.rise + HEDGE.stays;
/** How far up a clump stands, `s` seconds after it bursts up: shot up, standing, withering down at the hedge's end (`left`: seconds to the end). */
function hedgeHigh(s: number, left: number): number {
  if (s < 0 || left < 0) return 0;
  const up = s < HEDGE.rise ? easeOut(s / HEDGE.rise) * (1 + 0.15 * Math.sin(Math.PI * s / HEDGE.rise)) : 1;
  return up * (left < HEDGE.fade ? 0.25 + 0.75 * sm(left / HEDGE.fade) : 1);
}
export const CLUMP_CANVAS = { w: 120, h: 110, ax: 60, ay: 74 } as const;
/**
 * ONE CLUMP OF THE HEDGE, `t` seconds into the charge, `d` tiles along its path, from in front or behind (its anchor its middle on
 * the floor): its own twisted roots, its violet and its bark, and pale dead bramble, burst up out of the ground and arching over,
 * barbed all along, their points black; earth thrown up as it bursts; its edge the enemy's pink while it stands; withering, its
 * stems sinking and blackening. A rim of torn earth at its foot ('floor').
 */
export function hedgeClumpPainted(d: number, t: number, view: GameView = 'front', layer: 'floor' | 'air' = 'air'): { px: Px; lights: Light[] } {
  const C = CLUMP_CANVAS;
  const s = t - hedgeUp(d);
  const left = HEDGE_GONE - t;
  const k = hedgeHigh(s, left);
  const j = Math.round(d / HEDGE.step);
  const st = stage(view, C.ax, C.ay, C);
  if (layer === 'floor') {
    const px = new Px(C.w, C.h);
    if (s < 0 || left < -0.3) return { px, lights: [] };
    // (the earth torn open where it burst up: a dark rut, clods lying)
    for (let i = 0; i < 46; i++) {
      const a = hash(i, j, 701) * TAU;
      const r = Math.sqrt(hash(i, j + 1, 701));
      const [x, y] = st.at([Math.cos(a) * r * HEDGE.step * TILE3 * 0.7, Math.sin(a) * r * HEDGE.half * TILE3 * 1.3, 0]);
      const X = Math.round(x);
      const Y = Math.round(y);
      const c = r < 0.55 ? '#1a120e' : hash(i, j + 2, 701) > 0.5 ? '#2a1e16' : '#3a2a1e';
      for (const [ox, oy] of [[0, 0], [1, 0], [0, 1], [1, 1]] as const) if (X + ox > 0 && Y + oy > 0 && X + ox < C.w - 1 && Y + oy < C.h - 1) px.set(X + ox, Y + oy, c);
    }
    return { px, lights: [] };
  }
  const bits: Bit[] = [];
  const put: Put = (part, piece, shape) => {
    bits.push({ part, piece, shape });
  };
  // LIVING BRAMBLE (his pick, 2 Nov: “Redo hedge and gallop (Recommended)”, offered as: the hedge becomes dark, living brambles:
  // leaves, hooked thorns, writhing up): stems as thick as a wrist, green-black, burst up out of the ground coiled and writhing open
  // as they rise, arching over and curling at their tips; leaves along them; big hooked thorns; writhing slowly while it stands;
  // withering at the end, blackening, sinking, its leaves dropping
  const dead = left < HEDGE.fade ? 1 - left / HEDGE.fade : 0;
  if (k > 0.02) {
    const stem: Ramp = dead > 0.5 ? BRAMBLE_DEAD : BRAMBLE;
    const hook: Ramp = dead > 0.5 ? BRAMBLE_DEAD : HOOK;
    const STEMS = 4;
    for (let i = 0; i < STEMS; i++) {
      const pts = brambleStem(i, j, k, t, dead);
      const part = `bramble${i}`;
      const r0 = i < 3 ? 1.9 : 1.5;
      crooked(put, part, `stem${i}_`, pts, r0 * (0.6 + 0.4 * k), 0.75, stem);
      if (k < 0.25) continue;
      // (big hooked thorns along it: out from the stem, then bent back toward its root, the bramble's way)
      for (let q = 1; q < pts.length - 1; q++) {
        const dir = norm3(sub3(pts[q + 1], pts[q - 1]));
        for (const side of [0, 1]) {
          if (hash(q, i * 2 + side, 751 + j) > 0.62) continue;
          const a = hash(q, i * 2 + side, 753 + j) * TAU;
          const out = norm3(add(mul3(perp(dir), Math.cos(a)), mul3(norm3(cross3(dir, perp(dir))), Math.sin(a))));
          const rr = r0 + (0.75 - r0) * (q / (pts.length - 1));
          const root = add(pts[q], mul3(out, rr * 0.8));
          const bend = add(root, mul3(out, 2.6 * Math.min(1, k)));
          const tip = add(bend, add(mul3(dir, -2.2), mul3(out, 0.6)));
          put(part, `hook${i}_${q}_${side}a`, { k: 'rod', a: root, b: bend, ra: 0.95, rb: 0.6, ramp: hook });
          put(part, `hook${i}_${q}_${side}b`, { k: 'rod', a: bend, b: tip, ra: 0.6, rb: 0.3, ramp: hook });
        }
      }
      // (its leaves: three-fingered, along it in pairs, dark green, their tops lit; dropping as it withers)
      if (dead < 0.7) {
        for (const at of [0.38, 0.62]) {
          const q = at * (pts.length - 1);
          const q0 = Math.floor(q);
          const p0 = lerpV(pts[q0], pts[Math.min(pts.length - 1, q0 + 1)], q - q0);
          const dir = norm3(sub3(pts[Math.min(pts.length - 1, q0 + 1)], pts[q0]));
          for (const sd of [-1, 1]) {
            if ((sd > 0) !== (at < 0.5) || hash(i, Math.round(at * 10) + sd, 761 + j) > 0.85) continue;
            const side = norm3(add(mul3(perp(dir), sd), [0, 0, 0.5]));
            const sag = dead * 6;
            const stalk = add(p0, add(mul3(side, 2.6), [0, 0, -sag]));
            for (const fan of [-0.55, 0, 0.55]) {
              const w = norm3(add(side, mul3(dir, fan)));
              const c = add(stalk, mul3(w, fan === 0 ? 2.5 : 2.0));
              put(part, `leaf${i}_${at}_${sd}_${fan}`, { k: 'ball', c, ax: [mul3(w, fan === 0 ? 2.5 : 2.0), mul3(norm3(cross3(w, [0, 0, 1])), 1.3), [0, 0, 0.6]], skin: dead > 0.3 ? LEAF_DEAD : LEAF });
            }
          }
        }
      }
    }
  }
  const lights = paintBits(st, bits, [0, 0, 10]);
  const px = st.whole(left > HEDGE.fade * 0.5 ? ENEMY_RIM : null);
  // (earth thrown up as it bursts)
  const dot = (p: V3, c: string, size: number): void => dLaid(px, st, p, c, size);
  for (const ch of burst([0, 0, 0.6], 0, s, 12, 731 + j, CLOD, { speed: 28, up: 50, life: 0.4, size: 2 })) dot(ch[0], ch[1], ch[2]);
  // (withering: dead leaves and bits of stem falling off it)
  if (left < HEDGE.fade && left > 0) for (let i = 0; i < 8; i++) {
    const u = ((HEDGE.fade - left) / HEDGE.fade + i / 8) % 1;
    dot([(hash(i, j, 741) - 0.5) * 22, (hash(i, j, 743) - 0.5) * 14, Math.max(0.6, HEDGE.high * 0.8 * (1 - u))], i % 2 ? LEAF_DEAD[2] : BRAMBLE_DEAD[3], 2);
  }
  return { px, lights };
}
// THE BRAMBLE'S OWN COLOURS: green-black stems, lit along their tops; dark leaves; its thorns a dull red-brown, their points dark;
// dead, the stems and leaves gone brown-black and grey
type Ramp = readonly [string, string, string, string, string];
const BRAMBLE: Ramp = ['#030604', '#0a140c', '#142618', '#223a24', '#36522e'];
const BRAMBLE_DEAD: Ramp = ['#0a0806', '#16100c', '#241a14', '#34281e', '#463828'];
const HOOK: Ramp = ['#140808', '#341414', '#582624', '#844234', '#b8846a'];
const LEAF: Ramp = ['#040a05', '#0a180c', '#142c16', '#224622', '#3a6230'];
const LEAF_DEAD: Ramp = ['#0c0a06', '#1c160c', '#2e2414', '#463620', '#5c4a2c'];
const sub3 = (a: V3, b: V3): V3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const mul3 = (a: V3, k: number): V3 => [a[0] * k, a[1] * k, a[2] * k];
const cross3 = (a: V3, b: V3): V3 => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const norm3 = (a: V3): V3 => {
  const l = Math.hypot(a[0], a[1], a[2]) || 1;
  return [a[0] / l, a[1] / l, a[2] / l];
};
/** A way square to `d` (level where it can be). */
const perp = (d: V3): V3 => {
  const c = cross3(d, [0, 0, 1]);
  return Math.hypot(c[0], c[1], c[2]) < 1e-3 ? [0, 1, 0] : norm3(c);
};
/**
 * ONE STEM OF THE BRAMBLE, clump `j`, stem `i`, `k` how far up it has come (0 to 1, with its overshoot), `t` seconds into the charge,
 * `dead` how far withered: from its root in the ground it rises, arches over along the hedge and curls down at its tip into a hook;
 * coming up it is coiled tight and writhes open as it rises; standing, it writhes slowly (its arch swaying, its tip curling and
 * uncurling); withering, it sags and sinks. Its points along it, its own lengths from the clump's middle on the floor.
 */
function brambleStem(i: number, j: number, k: number, t: number, dead: number): V3[] {
  const big = i < 3;
  const x0 = (hash(i, j, 703) - 0.5) * HEDGE.step * TILE3 * 1.1;
  const y0 = (hash(i, j, 705) - 0.5) * HEDGE.half * TILE3 * 1.1;
  // (mostly along the hedge, either way; the small ones across it)
  const phi0 = big ? (hash(i, j, 709) < 0.5 ? 0 : Math.PI) + (hash(i, j, 711) - 0.5) * 0.9 : Math.PI / 2 + (hash(i, j, 711) - 0.5) * 1.6 + (hash(i, j, 709) < 0.5 ? 0 : Math.PI);
  const writhe = Math.sin(t * 2.4 + i * 1.9 + j) * (1 - dead);
  const phi = phi0 + 0.14 * writhe;
  const L = (big ? HEDGE.high * 1.75 : HEDGE.high * 1.2) * (0.85 + 0.2 * hash(i, j, 713)) * Math.min(1.12, k) * (1 - 0.35 * dead);
  const dir: V3 = [Math.cos(phi), Math.sin(phi), 0];
  const N = 14;
  const pts: V3[] = [[x0, y0, -1.5]];
  // (coiled as it comes up, writhing open as it rises)
  const coil = 4.2 * (1 - Math.min(1, k)) ** 1.5;
  for (let q = 1; q <= N; q++) {
    const u = q / N;
    const th = 1.45 - 1.3 * u - 5 * Math.max(0, u - 0.5) ** 2 - 18 * Math.max(0, u - 0.85) ** 2 - coil * u * u + 0.22 * writhe * u - dead * 0.9 * u;
    const p = pts[q - 1];
    const step = L / N;
    pts.push([p[0] + dir[0] * Math.cos(th) * step, p[1] + dir[1] * Math.cos(th) * step + Math.sin(u * 5 + i) * 0.5, p[2] + Math.sin(th) * step]);
  }
  // (never through the floor)
  return pts.map((p) => [p[0], p[1], Math.max(p === pts[0] ? -1.5 : 1.2, p[2] - dead * 8)] as V3);
}
/** Whether a point `x` tiles along the charge's path from where it set off and `y` aside is in the hedge's wall, `t` seconds into the charge. */
export function inHedge(x: number, y: number, t: number): boolean {
  if (Math.abs(y) > HEDGE.half) return false;
  for (const d of HEDGE_AT) if (Math.abs(x - d) <= HEDGE.step / 2 && hedgeHigh(t - hedgeUp(d), HEDGE_GONE - t) > 0.5) return true;
  return false;
}

// =============================================================================================
// THE FOG WOLF: ITS PACK STRIKE

/**
 * THE LUNGE'S NUMBERS (seconds from its start; tiles):
 *   wind-up  crouched down into its fog, its eyes flaring, its jaws opening, by 0.25 s; HELD, trembling, to 0.567 s (0.32 s)
 *   strike   TWO FRAMES, smeared: in the air (frame 18: carried 2 tiles), its jaws snapped shut past you (frame 19, 0.633 s: the
 *            clip's `hit`; carried `leap` tiles, 4.4)
 *   wind-down  skidding on its fog `skid` tiles more (0.8), to 0.97 s, tugging its head; falling back into its fog; on its stand by 1.5 s
 *   struck   a hero in the strip it leaps through (from where it was to where it lands, `half` to either side) is bitten
 * THE PACK (the rules', for the game to carry): the pack spreads round the hero, each on its own place of a ring `ring` tiles round
 * him, spread evenly round it (the 4 or 5 of it); then one after another, going round, each lunges a `beat` after the one before,
 * clean through where he stands, landing `past` beyond him and skidding on to the ring across from where it was (leap and skid: twice the ring).
 */
export const LEAP_HIT = f(19);
export const LEAP_STRIKE = [f(17), f(19)] as const;
export const LEAP_SMEARED = (t: number): boolean => t > LEAP_STRIKE[0] + 1e-6 && t <= LEAP_STRIKE[1] + FR + 1e-6;
export const LEAP = { hit: LEAP_HIT, strike: LEAP_STRIKE, crouch: 0.25, long: 1.5, mid: 2.0, leap: 4.4, skid: 0.8, skidFor: 0.34, half: 0.6 } as const;
export const PACK = { ring: 2.6, beat: 0.35, past: LEAP.leap - 2.6, gather: 1.2 } as const;
/** How far the game has carried it, `t` seconds into its lunge (tiles, the way it faces). */
export function leapCarry(t: number): number {
  const [s0, s1] = LEAP_STRIKE;
  if (t <= s0) return 0;
  if (t < s0 + FR) return LEAP.mid * ((t - s0) / FR);
  if (t < s1) return LEAP.mid + (LEAP.leap - LEAP.mid) * ((t - s0 - FR) / FR);
  return LEAP.leap + LEAP.skid * easeOut((t - s1) / LEAP.skidFor);
}
export const LEAP_CARRIED = LEAP.leap + LEAP.skid;
const L_CROUCH = wKeyed({ x: -8, z: -4.2, pitch: 9, neck: 18, h1: 14, h0: 0, h2: 0, gape: 0.42, snarl: 1, ears: -62, tail: -12, eyes: 2.3, solid: 0.5, s0: -24, s1: -22, s2: 30, s3: 28, b0: 62, b1: 58, b2: 68, b3: 64 });
const L_FLY = wKeyed({ x: 6, z: 7, pitch: -7, neck: -16, h1: -12, h0: 0, h2: 0, gape: 1, snarl: 1, ears: -72, tail: 22, eyes: 2.4, solid: 1, s0: 64, s1: 58, s2: -56, s3: -50, b0: 4, b1: 6, b2: 8, b3: 10 });
const L_SNAP = wKeyed({ x: 9, z: 3.5, pitch: -2, neck: -8, h1: 2, h0: 0, h2: 0, gape: 0, snarl: 1, ears: -64, tail: 18, eyes: 2.3, solid: 1, s0: 44, s1: 40, s2: -36, s3: -32, b0: 14, b1: 16, b2: 22, b3: 24 });
const L_SKID = wKeyed({ x: 4, z: 0.4, pitch: 4, neck: 6, h1: 8, h0: 0, h2: 0, gape: 0, snarl: 1, ears: -52, tail: 12, eyes: 2.0, solid: 0.9, s0: 8, s1: 6, s2: -4, s3: -2, b0: 30, b1: 30, b2: 34, b3: 34 });
/** Its lunge: crouched, held trembling; the leap; skidding, tugging; back into its fog. */
function leapBody(t: number): WolfPose {
  const [s0, s1] = LEAP_STRIKE;
  let K: WKey = wAlong(t, [
    [0, WK0, sm],
    [LEAP.crouch, L_CROUCH, sm],
    [s0, L_CROUCH, sm],
    [f(18), L_FLY, lin],
    [s1, L_SNAP, lin],
    [0.8, L_SKID, easeOut],
    [1.1, B_BACK, sm],
    [LEAP.long, WK0, sm],
  ]);
  if (t > LEAP.crouch && t < s0) {
    const k = sm((t - LEAP.crouch) / 0.05);
    K = wPlus(K, { h0: 1.4 * Math.sin(t * 180) * k, z: 0.35 * Math.sin(t * 150 + 1) * k, h1: Math.sin(t * 130 + 2) * k });
  }
  // (the tug as it lands: its head shaken)
  const shake = bump(t, s1, 0.9);
  K = wPlus(K, { h0: 16 * Math.sin((t - s1) * 36) * shake, h2: 8 * Math.sin((t - s1) * 36) * shake });
  return wFromKey(K, (2 * t) / LEAP.long);
}
/** Its pose for its fog's painter: at `u`, seen from the frame it is painted in at `now` (so that its fog, left where it was, streams back along its leap). */
function leapSeen(now: number): (w: string, u: number) => WolfPose {
  return (w, u) => {
    if (w !== 'leap') return wBase(w, u);
    const P = leapBody(Math.max(0, u));
    P.x += (leapCarry(Math.max(0, u)) - leapCarry(now)) * TILE3;
    const before = leapBody(Math.max(0, u - 0.1));
    const a = wWorld(P, [0, 0, 22]);
    const b = wWorld(before, [0, 0, 22]);
    P.drag = [a[0] - b[0] + (leapCarry(u) - leapCarry(u - 0.1)) * TILE3 * 0.1, a[1] - b[1], a[2] - b[2]];
    return P;
  };
}
/** THE LUNGE's pose at `t` (in the frame it is painted in). */
export function leapPose(t: number): WolfPose {
  return leapSeen(t)('leap', t);
}
/** Its jaws (the end it strikes with). */
export const jawsOf = (P: WolfPose): V3 => wHead(P).p([11, 0, -1.4]);
/** The smear of its leap: after-images of its fog's shape along the way it came, and its eyes' fire drawn out in two lines. */
function leapSmear(st: ReturnType<typeof stage>, put: Put, t: number): void {
  if (!LEAP_SMEARED(t)) return;
  const thin = Math.abs(t - LEAP_HIT - FR) < 1e-6;
  const seen = leapSeen(t);
  const at = (u: number): WolfPose => seen('leap', u);
  const span = Math.min(t, LEAP_HIT) - LEAP_STRIKE[0];
  // its eyes' fire, two lines, and its jaws
  const eyeLines: V3[][] = [[], [], []];
  for (let i = 0; i <= 10; i++) {
    const u = Math.min(t, LEAP_HIT) - (span * i) / 10;
    const P = at(u);
    const H = wHead(P);
    eyeLines[0].push(H.p([4, 3.6, 2.2]));
    eyeLines[1].push(H.p([4, -3.6, 2.2]));
    eyeLines[2].push(jawsOf(P));
  }
  smearAlong(st, put, eyeLines.slice(0, 2), thin, [FLAME[1], FLAME[2], FLAME[3], FLAME[4]], FLAME[4]);
  smearAlong(st, put, eyeLines.slice(2), thin, [WISP[4], WISP[2], FANG[3], FANG[4]], FANG[4]);
  // its fog's shape, after-images: its back, its belly, its haunch and its chest, in pale fog
  const body: V3[] = [[16, 0, 26], [8, 0, 29], [-4, 0, 27], [-14, 0, 25], [-24, 0, 20], [8, 0, 15], [-6, 0, 16]];
  const lines: V3[][] = body.map(() => []);
  for (let i = 0; i <= 8; i++) {
    const u = Math.min(t, LEAP_HIT) - (span * i) / 8;
    const P = at(u);
    body.forEach((b, j) => lines[j].push(wWorld(P, b)));
  }
  smearAlong(st, put, lines, thin, [WISP[4], WISP[3], WISP[1], WISP[0]], WISP[0]);
}
/** The canvas its lunge is painted on: the wolf's own, made bigger behind it, for its smear. */
export const LEAP_CANVAS = { w: 420, h: 300, ax: 210, ay: 170 } as const;
/** One frame of its lunge, from in front or behind. */
export function leapPainted(t: number, view: GameView = 'front'): Painted {
  wEye(view);
  const C = LEAP_CANVAS;
  const P = leapPose(t);
  const st = stage(view, C.ax, C.ay, C);
  const bits: Bit[] = [];
  const put: Put = (part, piece, shape) => {
    bits.push({ part, piece, shape });
  };
  wolfBits(P, put, view);
  const lights = paintBits(st, bits, wWorld(P, W_PIVOT));
  const px = st.whole(ENEMY_RIM);
  thinned(px, st, P);
  // (the smear laid after its fog is thinned, so that it is whole)
  const sbits: Bit[] = [];
  leapSmear(st, (part, piece, shape) => {
    sbits.push({ part, piece, shape });
  }, t);
  if (sbits.length) {
    const st2 = stage(view, C.ax, C.ay, C);
    paintBits(st2, sbits, wWorld(P, W_PIVOT));
    const sm2 = st2.whole(null);
    for (let i = 0; i < px.w * px.h; i++) if (sm2.d[i * 4 + 3] === 255 && px.d[i * 4 + 3] !== 255) px.d.set(sm2.d.subarray(i * 4, i * 4 + 4), i * 4);
  }
  const seen = leapSeen(t);
  for (const [pt, col, size] of grainsOf('leap', t, seen)) wLaid(px, st, pt, col, size);
  // (as its jaws snap shut, fog bursts from them; as it lands, its fog splashes out low over the floor)
  const s0 = t - LEAP_HIT;
  if (s0 >= 0 && s0 < 0.35) {
    const jaws = jawsOf(leapBody(LEAP_HIT));
    for (let i = 0; i < 22; i++) {
      const L = 0.18 + 0.14 * hash(i, 1, 807);
      if (s0 >= L) continue;
      const a = hash(i, 2, 807) * TAU;
      const far = (34 * (0.5 + 0.7 * hash(i, 3, 807)) * (1 - Math.exp(-4 * s0))) / 4;
      const q: V3 = [jaws[0] - (leapCarry(t) - LEAP.leap) * TILE3 + Math.cos(a) * far * 0.6 + far * 0.4, jaws[1] + Math.sin(a) * far, jaws[2] + (hash(i, 4, 807) - 0.3) * far];
      wLaid(px, st, [q[0], q[1], Math.max(0.4, q[2])], i % 4 === 0 ? FANG[4] : WISP[Math.min(4, Math.floor((s0 / L) * 4))], s0 / L < 0.5 ? 2 : 1);
    }
    for (let i = 0; i < 26; i++) {
      const L = 0.25 + 0.1 * hash(i, 1, 809);
      if (s0 >= L) continue;
      const a = hash(i, 2, 809) * TAU;
      const r = 6 + 26 * (s0 / L) * (0.5 + 0.5 * hash(i, 3, 809));
      wLaid(px, st, [Math.cos(a) * r * 1.3, Math.sin(a) * r, 0.6 + 2 * hash(i, 4, 809)], WISP[1 + (i % 3)], s0 / L < 0.5 ? 2 : 1);
    }
  }
  return { px, lights };
}
/** As the game holds a monster: the game's own fog wolf (stand, glide, struck, death: its own pictures), its pack strike's lunge as its `attack` (one clip, 1.5 s, its blow the snap past you). */
export function makePackWolfArt(): ActorArt {
  const art = makeWolfArt();
  for (const [set, view] of [[art.front, 'front'], [art.back, 'back']] as const) {
    const frames = lazyFrames(Math.round(LEAP.long * 30) + 1, (i) => toSprite(leapPainted(i / 30, view), { ...WOLF_AURA, x: WOLF_AURA.x - WOLF_CANVAS.ax + LEAP_CANVAS.ax, y: WOLF_AURA.y - WOLF_CANVAS.ay + LEAP_CANVAS.ay }, LEAP_CANVAS.ax, LEAP_CANVAS.ay));
    const attack: Clip = { frames, fps: 30, hit: LEAP_HIT };
    set.attack = lazyFrames(3, (i) => frames[[12, 19, 26][i]]);
    if (set.clips) set.clips.attack = attack;
  }
  return art;
}
/** Where each wolf of a pack of `n` stands on the ring round the hero (radians round from the first), and when it lunges (seconds after the first). */
export function packOf(n: number): { a: number; at: number }[] {
  return Array.from({ length: n }, (_, i) => ({ a: (i / n) * TAU, at: i * PACK.beat }));
}
/** Whether the hero `x`, `y` tiles from where a wolf set off (along the way it leaps, and aside) is in the strip it leaps through. */
export const leapStrikes = (x: number, y: number): boolean => x >= -0.3 && x <= LEAP.leap + 0.2 && Math.abs(y) <= LEAP.half;
void W_STAND0;
void legOf;
void dEye;
