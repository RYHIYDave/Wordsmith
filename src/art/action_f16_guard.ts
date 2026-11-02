// FLOOR 16'S MEDIUM MOB, MORE ACTION: THE PALACE GUARD (the art chat's helper, 2 Nov 2026; docs/mockups/action_f16/README.md). A
// MOCK-UP: NOTHING OF THE GAME IMPORTS THIS FILE. Their LONG THRUST BY MOVEMENT 9 (their basic blow) and THE DRILL (in place of the
// wide sweep) (GUARD_DRILL, off), on the game's own figures, the partisan guard and the sword guard (art/palace_guard.ts,
// art/palace_guard_moves.ts), all they keep their own.
//
// His review of every enemy for more action, 31 Oct 2026, offered and answered “Yes (Recommended)”:
//   PALACE GUARD (floor 16, medium): “The drill, in place of the sweep: an overhead chop, a spin back round, then the partisan or sword
//   driven tip-first into the ground with a shockwave.” Its long thrust tightened by Movement 9.
// Under his Movement 9 (24 Oct: “Like the wind up and wind down are big but the actual punch is lightning quick”; 28 Oct: “And bigger
// AOE to compensate for the extra time the player gets to evade”). Medium: two attacks (his rule of 9 Oct).
//
// THE LONG THRUST: brought down level and drawn far back, HELD, shaking, its point glinting pink; in TWO FRAMES a lunge, thrust out its
// whole length, smeared; carried on; drawn back and stood again. A longer, wider line than the game's.
// THE DRILL: the weapon heaved up over the head, HELD; in TWO FRAMES chopped down before him, smeared; wound round to the left, the
// weapon held out flat, HELD; in TWO FRAMES whipped round on the ball of his left foot, a whole turn, the weapon at its full reach,
// smeared (struck all round him); carried round, facing you again; the weapon raised high, point down, in both hands (the sword in his
// fist, the shield up), HELD; in TWO FRAMES driven tip-first into the ground before him, smeared: a SHOCKWAVE rolling out over the floor;
// wrenched out and stood again.

import { Px } from '../engine/px';
import type { Light } from '../engine/px';
import type { ActorArt } from './actor_types';
import type { Ramp } from './kit';
import { ENEMY_RIM } from './mkit';
import { stage } from './skin';
import { footOn, footwork, plantBy, plantOf } from './bosses3';
import type { Plant } from './bosses3';
import { FLAME } from './mkit';
import { GUARD_BODY, GUARD_CANVAS, PARTISAN, SWORD, guardPainter, partisanGrip, partisanOf, swordGrip, swordOf } from './palace_guard';
import type { GuardWho } from './palace_guard';
import { GD_DIES, GUARD_PARTISAN, GUARD_SWORD, PARTISAN_REST, SWORD_REST } from './palace_guard_moves';
import { TILE3, mobSet, paintBits, posedOfMob, skeletonAt } from './new_mobs3';
import type { Bit, Mob, MobMove, Moment, Put } from './new_mobs3';
import type { Stage } from './skin';
import { add, cross, elbowFor, heading, lerp3, mul, norm, sub } from './skeleton';
import type { Bones, Key3, Posed, Skeleton, V3 } from './skeleton';
import { FR, clamp01, f, smearAlong } from './action_f6_fx';

/** THE SWITCH, OFF. With it on, the bestiary's palace guard is made by `makeDrillGuardArt`. */
export const GUARD_DRILL = { on: false };

type P = Partial<Bones>;
const B = GUARD_BODY;
const D = Math.PI / 180;
const restOf = (who: GuardWho): Bones => (who === 'partisan' ? PARTISAN_REST : SWORD_REST);
const L0 = plantOf(B, 'L', {}, PARTISAN_REST);
const R0 = plantOf(B, 'R', {}, PARTISAN_REST);
const PINK = ['#e0287a', '#ff7aa8', '#7a1058'] as const;

function elbowsTo(rest: Bones, pose: P, wantL: V3 | null, wantR: V3 | null): P {
  const q = { ...rest, ...pose } as Posed;
  const le = wantL ? elbowFor(B, q, true, norm(wantL)) : q.le;
  const re = wantR ? elbowFor(B, { ...q, le } as Posed, false, norm(wantR)) : q.re;
  return { ...pose, le, re };
}
/** Both hands on the partisan: the right at `hand` (from the pelvis's place), pointing `az`, `el`, its blade out along `edge`; the left `left` further up it. */
const bothP = (body: P, hand: V3, az: number, el: number, edge: V3 = [0, 0, 1], left = 12, draw = 0): P => ({ ...body, ...partisanGrip([hand[0] + ((body.px as number) ?? 0), hand[1] + ((body.py as number) ?? 0), hand[2]], heading(az, el), edge, draw, left) });
/** The sword in the right fist at `hand` (from the pelvis's place), pointing `az`, `el`. */
const swordIn = (body: P, hand: V3, az: number, el: number, across: V3 = [0, 0, 1]): P => ({ ...body, ...swordGrip([hand[0] + ((body.px as number) ?? 0), hand[1] + ((body.py as number) ?? 0), hand[2]], heading(az, el), across) });
/** The shield's arm: the left hand from its shoulder, the shield's face turned `pAz`. */
const guardL = (x: number, y: number, z: number, pAz: number): P => ({ lhIn: 1, lhx: x, lhy: y, lhz: z, pAz, pEl: 4 });
/** The way its blade leads as it comes over the top and down (az 0), at `el`. */
const leading = (el: number): V3 => [Math.sin(el * D), 0, -Math.cos(el * D)];

// =============================================================================================
// THE LONG THRUST, BY MOVEMENT 9

/**
 * THE THRUST'S NUMBERS (seconds from its start; tiles):
 *   wind-up  brought down level by 0.14 s, drawn far back by 0.3 s; HELD, shaking, its point glinting pink, to 0.6 s (0.3 s; was 0.2)
 *   strike   TWO FRAMES, smeared: the hips driven forward (frame 19), thrust out its whole length (frame 20, 0.667 s: the clip's `hit`)
 *   wind-down  carried on to 0.8 s; held out to 1.05 s; drawn back by 1.45 s; stood again by 1.9 s
 *   THE LINE  struck, whoever is from `from` to the point's reach and `more` beyond, `half` to either side of its line (`thrustStrikes`)
 */
export const THRUST9_HIT = f(20);
export const THRUST9_STRIKE = [f(18), f(20)] as const;
export const THRUST9_SMEARED = (t: number): boolean => t > THRUST9_STRIKE[0] + 1e-6 && t <= THRUST9_STRIKE[1] + FR + 1e-6;
export const THRUST9 = { hit: THRUST9_HIT, strike: THRUST9_STRIKE, drawn: 0.3, long: 1.9, from: -0.2, more: 0.9, half: 0.85 } as const;
const THRUST_NAME = 'The long thrust, by Movement 9';
function thrustPoses(who: GuardWho): { take: P; drawn: P; drive: P; thrust: P; over: P; up: P; let_: P } {
  if (who === 'partisan') {
    const R = PARTISAN_REST;
    return {
      take: elbowsTo(R, bothP({ px: -0.4, pz: R.pz, yaw: -4, twist: -4, pitch: 4, bend: 3, side: 0, roll: 0, faceUp: 6, faceTilt: -2, faceTurn: 4, lk: 9, rk: -9 }, [2, -9, 37], 6, 10), [-0.1, 0.9, -0.5], [-0.6, -0.6, -0.5]),
      drawn: elbowsTo(R, bothP({ px: -2.8, pz: R.pz + 0.3, yaw: -12, twist: -8, pitch: 1, bend: 0, side: 1, roll: -1, faceUp: 8, faceTilt: 0, faceTurn: 8, lk: 12, rk: -12 }, [-8, -10, 37.5], 6, 7), [0.1, 0.7, -0.7], [-0.7, -0.5, -0.4]),
      drive: elbowsTo(R, bothP({ px: 2.4, pz: R.pz - 0.9, yaw: 6, twist: -14, pitch: 7, bend: 2, side: 1, roll: 0, faceUp: 6, faceTilt: 0, faceTurn: 4, lk: 16, rk: -8 }, [-4, -9.5, 37.5], 5, 5), [0.1, 0.7, -0.7], [-0.7, -0.5, -0.4]),
      thrust: elbowsTo(R, bothP({ px: 8.0, pz: R.pz - 3.0, yaw: 9, twist: 2, pitch: 15, bend: 8, side: -1, roll: 1, faceUp: 10, faceTilt: 0, faceTurn: -2, lk: 27, rk: -4 }, [13, -5, 39], 3, -2), [0, 0.6, -0.8], [-0.3, -0.7, -0.6]),
      over: elbowsTo(R, bothP({ px: 9.8, pz: R.pz - 3.3, yaw: 9, twist: 8, pitch: 17, bend: 10, side: -1, roll: 1, faceUp: 10, faceTurn: -2, lk: 28, rk: -3 }, [15, -5, 40], 2, -4), [0, 0.6, -0.8], [-0.2, -0.7, -0.6]),
      up: elbowsTo(R, { px: 2.4, pz: R.pz - 0.8, yaw: 3, twist: 0, pitch: 4, bend: 3, side: 0, roll: 0, faceUp: 4, faceTilt: 0, faceTurn: 2, lk: 10, rk: -8, ...partisanGrip([7, -11.5, 42], heading(0, 72), [0, 1, 0], 0.3, null), lhIn: 1, lhx: 8, lhy: 3, lhz: -17 }, [-0.1, 1, -0.4], [-0.5, -0.7, -0.7]),
      let_: elbowsTo(R, { px: 1.0, pz: R.pz - 0.3, yaw: 1, twist: 0, pitch: 2, bend: 1, side: 0, roll: 0, faceUp: 4, faceTilt: 0, faceTurn: 1, lk: 8, rk: -8, ...partisanGrip([5.6, -12, 43], heading(0, 84), [0, 1, 0], R.draw, null), lhIn: 1, lhx: 5, lhy: 5, lhz: -19 }, [-0.1, 1, -0.4], [-0.6, -0.4, -0.7]),
    };
  }
  const S = SWORD_REST;
  return {
    take: elbowsTo(S, { ...swordIn({ px: -0.4, pz: S.pz, yaw: -4, twist: -4, pitch: 4, bend: 3, side: 0, roll: 0, faceUp: 6, faceTilt: 0, faceTurn: 4, lk: 9, rk: -9 }, [3, -10, 37], 2, 6), ...guardL(9, -4, -14, 4) }, [0.2, 0.9, -0.4], [-0.5, -0.7, -0.5]),
    drawn: elbowsTo(S, { ...swordIn({ px: -3.8, pz: S.pz - 0.6, yaw: -16, twist: -10, pitch: 2, bend: 0, side: 1, roll: -1, faceUp: 8, faceTilt: 0, faceTurn: 8, lk: 14, rk: -14 }, [-9, -11, 37.5], 2, 5), ...guardL(9.5, -4, -13, 2) }, [0.2, 0.9, -0.4], [-0.7, -0.5, -0.4]),
    drive: elbowsTo(S, { ...swordIn({ px: 3.0, pz: S.pz - 1.4, yaw: 2, twist: -14, pitch: 8, bend: 3, side: 1, roll: 0, faceUp: 6, faceTilt: 0, faceTurn: 4, lk: 18, rk: -8 }, [-1, -10.5, 37.5], 2, 4), ...guardL(9, -1, -13, 14) }, [0.2, 0.9, -0.4], [-0.7, -0.5, -0.4]),
    thrust: elbowsTo(S, { ...swordIn({ px: 9.0, pz: S.pz - 3.2, yaw: 9, twist: 7, pitch: 16, bend: 8, side: -1, roll: 1, faceUp: 10, faceTilt: 0, faceTurn: -2, lk: 27, rk: -4 }, [19, -8, 40], 0, -2), ...guardL(4, 5, -12, 50) }, [0.1, 0.9, -0.4], [-0.3, -0.7, -0.6]),
    over: elbowsTo(S, { ...swordIn({ px: 9.6, pz: S.pz - 3.4, yaw: 9, twist: 8, pitch: 18, bend: 10, side: -1, roll: 1, faceUp: 10, faceTurn: -2, lk: 28, rk: -3 }, [22, -5.5, 39.5], 0, -4), ...guardL(3.5, 5.5, -12.5, 54) }, [0.1, 0.9, -0.4], [-0.2, -0.7, -0.6]),
    up: elbowsTo(S, { ...swordIn({ px: 2.4, pz: S.pz - 0.8, yaw: 3, twist: 0, pitch: 4, bend: 3, side: 0, roll: 0, faceUp: 4, faceTilt: 0, faceTurn: 2, lk: 10, rk: -8 }, [8, -9.5, 39], 0, 50), ...guardL(5, 1.5, -15, 20) }, [-0.3, 0.8, -0.6], [-0.3, -0.8, -0.5]),
    let_: elbowsTo(S, { ...swordIn({ px: 1.0, pz: S.pz - 0.3, yaw: 1, twist: 0, pitch: 2, bend: 1, side: 0, roll: 0, faceUp: 4, faceTilt: 0, faceTurn: 1, lk: 8, rk: -8 }, [7.5, -9.2, 38.5], 0, 76), ...guardL(7, 2, -13, -6) }, [-0.4, 0.7, -0.6], [-0.3, -0.8, -0.5]),
  };
}
function thrustKeys(who: GuardWho): Key3[] {
  const p = thrustPoses(who);
  const shake = (k: number): P => ({ ...p.drawn, rhz: (p.drawn.rhz as number) + (k % 2 ? 0.7 : -0.4), rhy: (p.drawn.rhy as number) + (k % 2 ? -0.35 : 0.25), px: (p.drawn.px as number) - 0.25 * (k % 2), rhx: (p.drawn.rhx as number) - 0.25 * (k % 2) });
  return [
    { at: 0, pose: {} },
    { at: 0.14, pose: p.take, ease: 'io' },
    { at: THRUST9.drawn, pose: p.drawn, ease: 'out' },
    { at: 0.38, pose: shake(1), ease: 'io' },
    { at: 0.46, pose: shake(2), ease: 'io' },
    { at: 0.52, pose: shake(3), ease: 'io' },
    { at: THRUST9_STRIKE[0] - 0.034, pose: p.drawn, ease: 'io' },
    { at: THRUST9_STRIKE[0], pose: { ...p.drawn, yaw: (p.drawn.yaw as number) + 4, twist: (p.drawn.twist as number) - 4 }, ease: 'in' },
    { at: f(19), pose: p.drive, ease: 'lin' },
    { at: THRUST9_HIT, pose: p.thrust, ease: 'lin' },
    { at: 0.8, pose: p.over, ease: 'out' },
    { at: 1.05, pose: { ...p.over, px: (p.over.px as number) - 0.4, rhz: (p.over.rhz as number) - 0.4 }, ease: 'io' },
    { at: 1.45, pose: p.up, ease: 'io' },
    { at: 1.68, pose: p.let_, ease: 'io' },
    { at: THRUST9.long, pose: {}, ease: 'io' },
  ];
}
function thrustFeet(): (t: number) => P {
  return footwork(B, {
    L: { start: L0, moves: [{ t0: THRUST9_STRIKE[0] - 0.04, t1: THRUST9_HIT, to: plantBy(L0, 12, 1, 8), lift: 3.0 }, { t0: 1.4, t1: 1.66, to: L0, lift: 2.6 }] },
    R: { start: R0, moves: [{ t0: 0.12, t1: 0.28, to: plantBy(R0, -2.5, -1, -12), lift: 2.2 }, { t0: THRUST9_STRIKE[0], t1: THRUST9_HIT, to: plantBy(R0, -2.5, -1, -12, { pitch: 18 }) }, { t0: 1.44, t1: 1.7, to: R0, lift: 2.4 }] },
  });
}
const thrustGlint = (t: number): number => (t < 0.1 || t > THRUST9_HIT + 0.2 ? 0 : t < THRUST9.drawn ? (t - 0.1) / (THRUST9.drawn - 0.1) : t <= THRUST9_HIT ? 1 : 1 - (t - THRUST9_HIT) / 0.2);

// =============================================================================================
// THE DRILL

/**
 * THE DRILL'S NUMBERS (seconds from its start; tiles):
 *   wind-up    heaved up over the head by 0.4 s, the left foot stepped in; HELD, shaking, glinting pink, to 0.6 s (0.2 s)
 *   THE CHOP   TWO FRAMES, smeared: over the top (frame 19), chopped down before him (frame 20, 0.667 s)
 *   wound      round to the left, the weapon held out flat, by 1.0 s; HELD to 1.133 s
 *   THE SPIN   TWO FRAMES, smeared: whipped round to his right on the ball of his left foot (200 degrees in the two: frame 36, 1.2 s),
 *              carried on round the whole turn by 1.65 s, facing you again by 1.85 s
 *   raised     high, point down, in both hands, by 2.1 s; HELD, shaking, to 2.333 s
 *   THE DRIVE  TWO FRAMES, smeared: driven tip-first into the ground before him (frame 72, 2.4 s: the clip's `hit`): the SHOCKWAVE
 *   wind-down  held in the ground, wrenched at, to 2.8 s; wrenched out by 3.05 s; stood again by 3.65 s
 *   struck     by the chop, a hero in the strip before him (`chop.fwd`, `chop.half`); by the spin, a hero within `spin` of him, all round;
 *              by the drive, a hero within `wave` of where the point goes in (and knocked `knock`)
 */
export const DRILL_HITS = [f(20), f(36), f(72)] as const;
export const DRILL_STRIKES = [[f(18), f(20)], [f(34), f(36)], [f(70), f(72)]] as const;
export const DRILL_HIT = DRILL_HITS[2];
export const DRILL_SMEARED = (t: number): boolean => DRILL_STRIKES.some(([a, b]) => t > a + 1e-6 && t <= b + FR + 1e-6);
export const DRILL = { up: 0.4, wound: 1.0, round: 1.65, facing: 1.85, raised: 2.1, long: 3.65, coil: 45, flash: 200, chop: { fwd: [0, 3.2] as const, half: 0.8 }, spin: 3.0, wave: 2.6, knock: 0.7, near: 0, far: 2.8 } as const;
const DRILL_NAME = 'The drill';

/** A pose turned `a` degrees to the left about the spot `c` on the floor (its own lengths): all of it, the feet as they are said (or not). */
function turned(p: P, a: number, c: readonly [number, number]): P {
  const ca = Math.cos(a * D);
  const sa = Math.sin(a * D);
  const rot = (x: number, y: number, about: readonly [number, number] = c): [number, number] => [about[0] + (x - about[0]) * ca - (y - about[1]) * sa, about[1] + (x - about[0]) * sa + (y - about[1]) * ca];
  const o: Record<string, unknown> = { ...p };
  const n = (k: string): number => (o[k] as number | undefined) ?? 0;
  [o.px, o.py] = rot(n('px'), n('py'));
  for (const k of ['yaw', 'faceTurn', 'wAz', 'pAz', 'lk', 'rk']) if (o[k] !== undefined) o[k] = n(k) + a;
  if (o.rhIn === 2) [o.rhx, o.rhy] = rot(n('rhx'), n('rhy'));
  if (o.lhIn === 2) [o.lhx, o.lhy] = rot(n('lhx'), n('lhy'));
  if (o.lhIn === 1) [o.lhx, o.lhy] = rot(n('lhx'), n('lhy'), [0, 0]);
  if (o.rhIn === 1) [o.rhx, o.rhy] = rot(n('rhx'), n('rhy'), [0, 0]);
  return o as P;
}
const STEP_L: Plant = plantBy(L0, 9, 1, 6);
/** The spot he whips round on: the ball of his left foot, stepped in. */
const PIVOT: readonly [number, number] = STEP_L.at;
interface DrillPoses {
  heave: P;
  over: P;
  mid: P;
  chop: P;
  through: P;
  out: P;
  lift?: P;
  reach?: P;
  take?: P;
  letGo?: P;
  raised: P;
  driveMid: P;
  driven: P;
  on?: P;
  wrench: P;
  upright: P;
  as?: Partial<Bones>;
}
function drillPoses(who: GuardWho): DrillPoses {
  if (who === 'partisan') {
    const R = PARTISAN_REST;
    const e = (body: P, hand: V3, az: number, el: number, edge: V3, wl: V3, wr: V3, left = 7, draw = 0): P => elbowsTo(R, bothP(body, hand, az, el, edge, left, draw), wl, wr);
    return {
      heave: e({ px: -1.8, pz: R.pz + 0.5, yaw: -8, twist: -8, pitch: -4, bend: -4, side: 1, roll: 0, faceUp: 12, faceTilt: 0, faceTurn: 4, lk: 10, rk: -12 }, [9, -7, 60], -150, 70, [0.6, 0, 0.8], [0.1, 0.8, -0.6], [0.0, -0.9, -0.4]),
      over: e({ px: -3.0, pz: R.pz + 1.0, yaw: -6, twist: -6, pitch: -8, bend: -9, side: 1, roll: 0, faceUp: 18, faceTilt: 0, faceTurn: 2, lk: 12, rk: -14 }, [7, -4, 66], -180, 52, [0.8, 0, 0.6], [0.3, 0.8, -0.5], [0.2, -0.9, -0.3]),
      mid: e({ px: 3.4, pz: R.pz - 0.8, yaw: 6, twist: -2, pitch: 9, bend: 1, side: 0, roll: 0, faceUp: 10, faceTilt: 0, faceTurn: 0, lk: 18, rk: -8 }, [15, -4, 62], 0, 72, leading(72), [0.4, 0.8, -0.4], [0.3, -0.9, -0.3]),
      chop: e({ px: 6.0, pz: R.pz - 3.2, yaw: 6, twist: 2, pitch: 20, bend: 12, side: 0, roll: 0, faceUp: 2, faceTilt: 0, faceTurn: -2, lk: 24, rk: -8 }, [21, -5, 36], 0, -10, leading(-10), [0.2, 0.9, -0.5], [0.1, -0.9, -0.5]),
      through: e({ px: 6.4, pz: R.pz - 3.6, yaw: 6, twist: 3, pitch: 23, bend: 14, side: 0, roll: 0, faceUp: 0, faceTilt: 0, faceTurn: -2, lk: 25, rk: -8 }, [21, -5, 32], 0, -18, leading(-18), [0.2, 0.9, -0.5], [0.1, -0.9, -0.5]),
      // (held out flat before him to his left, both hands at its butt before his chest: whipped round, it goes round at its full reach)
      out: e({ px: 4.0, pz: R.pz - 2.4, yaw: 0, twist: 0, pitch: 8, bend: 4, side: 0, roll: 0, faceUp: 6, faceTilt: 0, faceTurn: 0, lk: 20, rk: -10 }, [12, 1, 40], 40, -4, [0, 0, 1], [0.3, 1, -0.4], [0.2, -1, -0.4], 8),
      lift: e({ px: 2.6, pz: R.pz - 1.2, yaw: 0, twist: 0, pitch: 4, bend: 0, side: 0, roll: 0, faceUp: 8, faceTilt: 0, faceTurn: 0, lk: 16, rk: -12 }, [10, -8, 56], 0, -30, [0, 1, 0], [0.3, 1, -0.2], [0.3, -1, -0.2], 9, 0),
      raised: e({ px: 1.6, pz: R.pz + 0.4, yaw: 0, twist: -2, pitch: -4, bend: -8, side: 0, roll: 0, faceUp: 16, faceTilt: 0, faceTurn: 0, lk: 14, rk: -12 }, [11, -8, 76], 0, -55, [0, 1, 0], [0.3, 1, 0.3], [0.3, -1, 0.3], 9, 0.55),
      driveMid: e({ px: 4.6, pz: R.pz - 2.6, yaw: 2, twist: 0, pitch: 12, bend: 4, side: 0, roll: 0, faceUp: 8, faceTilt: 0, faceTurn: 0, lk: 20, rk: -12 }, [15, -8, 64], 0, -62, [0, 1, 0], [0.3, 1, 0], [0.3, -1, 0], 9, 0.55),
      driven: e({ px: 7.0, pz: R.pz - 6.0, yaw: 2, twist: 0, pitch: 18, bend: 9, side: 0, roll: 0, faceUp: -4, faceTilt: 0, faceTurn: 0, lk: 26, rk: -14 }, [21, -8, 49], 0, -66, [0, 1, 0], [0.2, 1, -0.4], [0.2, -1, -0.4], 9, 0.55),
      // (the fists driven on down the shaft after it, the partisan where it is)
      on: e({ px: 7.4, pz: R.pz - 7.6, yaw: 2, twist: 0, pitch: 21, bend: 11, side: 0, roll: 0, faceUp: -6, faceTilt: 0, faceTurn: 0, lk: 28, rk: -14 }, [21 + 2.44, -8, 49 - 5.48], 0, -66, [0, 1, 0], [0.2, 1, -0.4], [0.2, -1, -0.4], 9, 0.55 - 6 / 44),
      wrench: e({ px: 4.4, pz: R.pz - 3.4, yaw: 2, twist: 0, pitch: 14, bend: 8, side: 0, roll: 0, faceUp: 4, faceTilt: 0, faceTurn: 0, lk: 18, rk: -10 }, [17, -8, 58], 0, -58, [0, 1, 0], [0.2, 1, -0.4], [0.2, -1, -0.4], 9, 0.5),
      upright: e({ px: 2.0, pz: R.pz - 0.6, yaw: 6, twist: 0, pitch: 4, bend: 4, side: 0, roll: 0, faceUp: 0, faceTilt: 0, faceTurn: 0, lk: 10, rk: -8 }, [11, -10, 46], 0, 80, [0, -1, 0], [-0.2, 0.9, -0.4], [-0.4, -0.7, -0.7]),
      reach: elbowsTo(R, { px: -0.3, pz: R.pz, yaw: -2, twist: -2, pitch: 1, bend: 1, lhIn: 1, lhx: 9, lhy: -3, lhz: -13 }, [-0.1, 1, -0.3], null),
      take: e({ px: -0.6, pz: R.pz, yaw: -4, twist: -4, pitch: 2, bend: 3, side: 0, roll: 0, faceUp: 4, faceTilt: -2, faceTurn: 4, lk: 9, rk: -9 }, [13, -7.5, 46], -140, 86, [-0.6, -0.8, 0], [0.1, 1, -0.4], [-0.4, -0.7, -0.7]),
      letGo: elbowsTo(R, { ...bothP({ px: 1.0, pz: R.pz - 0.3, yaw: 6, twist: 0, pitch: 2, bend: 1, side: 0, roll: 0, faceUp: 0, faceTilt: 0, faceTurn: 0, lk: 10, rk: -8 }, [11, -10, 46], 0, 80, [0, -1, 0], 7), lhIn: 1, lhx: 5, lhy: 7, lhz: -17 }, [-0.1, 1, -0.3], [-0.6, -0.4, -0.7]),
      as: { wAz: 0, wEl: 128 },
    };
  }
  const S = SWORD_REST;
  const e = (body: P, hand: V3, az: number, el: number, left: P, wl: V3, wr: V3, across: V3 = [0, 0, 1]): P => elbowsTo(S, { ...swordIn(body, hand, az, el, across), ...left }, wl, wr);
  return {
    heave: e({ px: -1.8, pz: S.pz + 0.5, yaw: -8, twist: -8, pitch: -4, bend: -4, side: 1, roll: 0, faceUp: 12, faceTilt: 0, faceTurn: 4, lk: 10, rk: -12 }, [5, -9, 62], -160, 60, guardL(8, 0, -10, 20), [-0.2, 0.8, -0.6], [0.0, -0.9, -0.4], [0, 1, 0]),
    over: e({ px: -3.0, pz: S.pz + 1.0, yaw: -6, twist: -6, pitch: -8, bend: -9, side: 1, roll: 0, faceUp: 18, faceTilt: 0, faceTurn: 2, lk: 12, rk: -14 }, [2, -6, 68], -180, 40, guardL(9, 1, -9, 24), [-0.2, 0.8, -0.6], [0.2, -0.9, -0.3], [0, 1, 0]),
    mid: e({ px: 3.4, pz: S.pz - 0.8, yaw: 6, twist: -2, pitch: 9, bend: 1, side: 0, roll: 0, faceUp: 10, faceTilt: 0, faceTurn: 0, lk: 18, rk: -8 }, [11, -7, 66], 0, 70, guardL(8, 3, -11, 40), [-0.2, 0.8, -0.6], [0.3, -0.9, -0.3], [0, 1, 0]),
    chop: e({ px: 6.0, pz: S.pz - 3.2, yaw: 6, twist: 2, pitch: 20, bend: 12, side: 0, roll: 0, faceUp: 2, faceTilt: 0, faceTurn: -2, lk: 24, rk: -8 }, [21, -6, 40], 0, -16, guardL(4, 5, -12, 50), [-0.2, 0.8, -0.6], [0.1, -0.9, -0.5], [0, 1, 0]),
    through: e({ px: 6.4, pz: S.pz - 3.6, yaw: 6, twist: 3, pitch: 23, bend: 14, side: 0, roll: 0, faceUp: 0, faceTilt: 0, faceTurn: -2, lk: 25, rk: -8 }, [21, -6, 36], 0, -26, guardL(4, 5, -12, 52), [-0.2, 0.8, -0.6], [0.1, -0.9, -0.5], [0, 1, 0]),
    // (the sword held out flat before him to his left, the shield up at his chest: whipped round, it goes round at its full reach)
    out: e({ px: 4.0, pz: S.pz - 2.4, yaw: 0, twist: 0, pitch: 8, bend: 4, side: 0, roll: 0, faceUp: 6, faceTilt: 0, faceTurn: 0, lk: 20, rk: -10 }, [12, -2, 42], 30, -4, guardL(6, -1, -12, 10), [-0.2, 0.8, -0.6], [0.2, -1, -0.4]),
    raised: e({ px: 1.6, pz: S.pz + 0.4, yaw: 0, twist: -2, pitch: -4, bend: -8, side: 0, roll: 0, faceUp: 16, faceTilt: 0, faceTurn: 0, lk: 14, rk: -12 }, [13, -9, 74], 0, -68, guardL(8, 2, -8, 20), [-0.2, 0.8, -0.6], [0.3, -1, 0.3], [0, 1, 0]),
    driveMid: e({ px: 4.6, pz: S.pz - 3.4, yaw: 2, twist: 0, pitch: 14, bend: 6, side: 0, roll: 0, faceUp: 8, faceTilt: 0, faceTurn: 0, lk: 22, rk: -12 }, [18, -8, 54], 0, -64, guardL(7, 3, -10, 30), [-0.2, 0.8, -0.6], [0.3, -1, 0], [0, 1, 0]),
    driven: e({ px: 7.5, pz: S.pz - 9.0, yaw: 2, twist: 0, pitch: 30, bend: 16, side: 0, roll: 0, faceUp: -4, faceTilt: 0, faceTurn: 0, lk: 28, rk: -16 }, [22, -7, 31], 0, -62, guardL(5, 4, -12, 40), [-0.2, 0.8, -0.6], [0.2, -1, -0.4], [0, 1, 0]),
    wrench: e({ px: 4.4, pz: S.pz - 4.4, yaw: 2, twist: 0, pitch: 16, bend: 8, side: 0, roll: 0, faceUp: 4, faceTilt: 0, faceTurn: 0, lk: 20, rk: -10 }, [19, -7, 42], 0, -45, guardL(6, 3, -12, 30), [-0.2, 0.8, -0.6], [0.2, -1, -0.4], [0, 1, 0]),
    upright: e({ px: 2.0, pz: S.pz - 0.6, yaw: 6, twist: 0, pitch: 4, bend: 4, side: 0, roll: 0, faceUp: 0, faceTilt: 0, faceTurn: 0, lk: 10, rk: -8 }, [9, -9, 41], 0, 76, guardL(3.5, 1, -16, 20), [-0.4, 0.7, -0.6], [-0.3, -0.8, -0.5], [0, 1, 0]),
  };
}
/** How far round the spin has turned him `t` seconds in (degrees, to his left; 0 wound, -360 round): two frames of `flash`, then carried on round, slowing. */
export function drillTurn(t: number): number {
  const [s0, s1] = DRILL_STRIKES[1];
  if (t <= s0) return 0;
  if (t <= s1) return (-DRILL.flash * (t - s0)) / (s1 - s0);
  const u = Math.min(1, (t - s1) / (DRILL.round - s1));
  return -DRILL.flash - (360 - DRILL.flash) * (1 - (1 - u) * (1 - u));
}
function drillKeys(who: GuardWho): Key3[] {
  const p = drillPoses(who);
  const rest = restOf(who);
  const shake = (q: P, k: number): P => ({ ...q, rhz: (q.rhz as number) + (k % 2 ? 0.9 : -0.5), rhy: (q.rhy as number) + (k % 2 ? -0.4 : 0.3), px: (q.px as number) - 0.3 * (k % 2) });
  const [c1, c2, c3] = DRILL_STRIKES;
  // the spin: the pose held out flat, wound round to the left; then the whole of him (but his feet: art below) turned about the ball of his left foot
  const coil = turned(p.out, DRILL.coil, PIVOT);
  const keys: Key3[] = [
    { at: 0, pose: {} },
    ...(p.reach ? [{ at: 0.08, pose: p.reach, ease: 'in' } as Key3] : []),
    ...(p.take ? [{ at: 0.16, pose: p.take, ease: 'out' } as Key3] : []),
    { at: 0.27, pose: p.heave, ease: 'in' },
    { at: DRILL.up, pose: p.over, ease: 'out' },
    { at: 0.48, pose: shake(p.over, 1), ease: 'io' },
    { at: 0.54, pose: shake(p.over, 2), ease: 'io' },
    { at: c1[0], pose: p.over, ease: 'io', ...(p.as ? { as: p.as } : {}) },
    { at: f(19), pose: p.mid, ease: 'lin' },
    { at: DRILL_HITS[0], pose: p.chop, ease: 'lin' },
    { at: DRILL_HITS[0] + 0.12, pose: p.through, ease: 'out' },
    { at: DRILL.wound, pose: coil, ease: 'io' },
    { at: 1.07, pose: shake(coil, 1), ease: 'io' },
    { at: c2[0], pose: coil, ease: 'io' },
  ];
  // (every frame of the spin, the whole of him turned)
  for (let i = 35; i / 30 <= DRILL.round + 1e-6; i++) keys.push({ at: i / 30, pose: turned(p.out, DRILL.coil + drillTurn(i / 30), PIVOT), ease: 'lin' });
  // (round: from here on he is a whole turn round, as he began: every pose said so)
  const R360 = (q: P): P => turned({ ...rest, ...q }, -360, PIVOT);
  keys.push(
    { at: DRILL.facing, pose: R360(turned(p.out, 0, PIVOT)), ease: 'io' },
    ...(p.lift ? [{ at: 1.96, pose: R360(p.lift), ease: 'in' } as Key3] : []),
    { at: DRILL.raised, pose: R360(p.raised), ease: p.lift ? 'out' : 'io' },
    { at: 2.2, pose: R360(shake(p.raised, 1)), ease: 'io' },
    { at: 2.27, pose: R360(shake(p.raised, 2)), ease: 'io' },
    { at: c3[0], pose: R360(p.raised), ease: 'io' },
    { at: f(71), pose: R360(p.driveMid), ease: 'lin' },
    { at: DRILL_HIT, pose: R360(p.driven), ease: 'lin' },
    { at: DRILL_HIT + 0.14, pose: R360(p.on ?? { ...p.driven, pz: (p.driven.pz as number) - 0.4, pitch: (p.driven.pitch as number) + 1 }), ease: 'out' },
    { at: 2.68, pose: R360({ ...p.driven, px: (p.driven.px as number) - 0.5, pz: (p.driven.pz as number) + 0.5 }), ease: 'io' },
    { at: 2.8, pose: R360(p.driven), ease: 'io' },
    { at: 3.05, pose: R360(p.wrench), ease: 'io' },
    { at: 3.32, pose: R360(p.upright), ease: 'io' },
    ...(p.letGo ? [{ at: 3.5, pose: R360(p.letGo), ease: 'io' } as Key3] : []),
    { at: DRILL.long, pose: R360({}), ease: 'io' },
  );
  return keys;
}
/** His feet: the left stepped in for the chop and turned on its ball as he winds round; through the spin, both turned with him about its ball, the right foot swung round off the floor; set back at the end. */
function drillFeet(): (t: number) => P {
  const [c1, c2, c3] = DRILL_STRIKES;
  const base = footwork(B, {
    L: { start: L0, moves: [{ t0: 0.16, t1: 0.36, to: STEP_L, lift: 3.0 }, { t0: c1[1] + 0.1, t1: DRILL.wound, to: { ...STEP_L, pitch: 16 } }, { t0: DRILL.round, t1: DRILL.facing, to: STEP_L }, { t0: 3.1, t1: 3.4, to: L0, lift: 2.6 }] },
    R: { start: R0, moves: [{ t0: c1[0], t1: c1[1], to: { ...R0, pitch: 20 } }, { t0: c1[1] + 0.1, t1: DRILL.wound, to: R0 }, { t0: c3[0], t1: c3[1], to: { ...R0, pitch: 18 } }, { t0: 3.05, t1: 3.3, to: R0 }] },
  });
  return (t) => {
    const out = base(t);
    if (t <= c2[0] || t >= DRILL.round) return out;
    const a = drillTurn(t);
    // (the left foot turned on its ball where it is; the right swung round it, lifted off the floor, and set down where it was)
    const l = { ...STEP_L, pitch: 16, turn: STEP_L.turn + a };
    const ca = Math.cos(a * D);
    const sa = Math.sin(a * D);
    const [x, y] = [R0.at[0] - PIVOT[0], R0.at[1] - PIVOT[1]];
    const u = (t - c2[0]) / (DRILL.round - c2[0]);
    const r: Plant = { ...R0, at: [PIVOT[0] + x * ca - y * sa, PIVOT[1] + x * sa + y * ca], turn: R0.turn + a, pitch: 10 };
    return { ...out, ...footOn(B, 'L', l), ...footOn(B, 'R', r, 4 * Math.sin(Math.PI * u)), lk: (out.lk ?? 7) + a, rk: (out.rk ?? -7) + a };
  };
}
const drillGlint = (t: number): number => (t < 0.12 || t > DRILL_HIT + 0.3 ? 0 : t < DRILL.up ? (t - 0.12) / (DRILL.up - 0.12) : t <= DRILL_HIT ? 1 : 1 - (t - DRILL_HIT) / 0.3);

// =============================================================================================
// THEM

/** The point of the weapon (what strikes, and what the smear follows): the partisan's tip and the head of its blade; the sword's point and the middle of its blade. */
function weaponLine(who: GuardWho, mob: Mob, move: string, t: number): [V3, V3, V3] {
  const s = skeletonAt(mob, move, t);
  if (who === 'partisan') {
    const pt = partisanOf(s, posedOfMob(mob, move, t));
    return [pt.tip, pt.blade, pt.at(60)];
  }
  const w = swordOf(s);
  return [w.tip, w.mid, w.guard];
}
function moreBits(who: GuardWho, mob: Mob, st: Stage, m: Moment): Bit[] {
  const bits: Bit[] = [];
  const put: Put = (part, piece, shape) => {
    bits.push({ part, piece, shape });
  };
  const t = m.t;
  const key = m.move === THRUST_NAME && THRUST9_SMEARED(t) ? 'attack' : m.move === DRILL_NAME && DRILL_SMEARED(t) ? 'drill' : null;
  if (!key) return bits;
  const strikes: ReadonlyArray<readonly [number, number]> = key === 'attack' ? [THRUST9_STRIKE] : DRILL_STRIKES;
  const k = strikes.findIndex(([a, b]) => t > a + 1e-6 && t <= b + FR + 1e-6);
  const hit = strikes[k][1];
  const thin = Math.abs(t - hit - FR) < 1e-6;
  const lines: V3[][] = [[], [], []];
  for (let i = 0; i <= 8; i++) {
    const u = Math.min(t, hit) - (FR * 1.3 * i) / 8;
    const [a, b, c] = weaponLine(who, mob, key, u);
    lines[0].push(a);
    lines[1].push(b);
    lines[2].push(c);
  }
  smearAlong(st, put, lines, thin, ['#3e3a4a', '#7a808a', '#c6cad0', '#f2f2f6'], PINK[1]);
  return bits;
}
const GD_CANVAS2 = { w: 520, h: 360, ax: 260, ay: 240 } as const;
function drillGuard(who: GuardWho): Mob {
  const base = who === 'partisan' ? GUARD_PARTISAN : GUARD_SWORD;
  const paint = guardPainter(who, { dropped: (m: Moment) => !!m.dying && m.t >= GD_DIES.drop });
  const rest = restOf(who);
  const mv = (name: string, keys: Key3[], hit: number, more: Partial<MobMove>): MobMove => ({ name, motion: { keys, hit }, rest, ...more });
  const mob: Mob = {
    ...base,
    id: `${base.id}-drill`,
    attack: mv(THRUST_NAME, thrustKeys(who), THRUST9_HIT, { feet: thrustFeet(), glint: thrustGlint, jaw: base.attack.jaw }),
    hit: THRUST9_HIT,
    warn: THRUST9_STRIKE[0] - THRUST9.drawn,
    more: { drill: mv(DRILL_NAME, drillKeys(who), DRILL_HIT, { feet: drillFeet(), glint: drillGlint, jaw: base.attack.jaw }) },
    canvas: GD_CANVAS2,
    aura: { ...base.aura, x: base.aura.x - GUARD_CANVAS.ax + GD_CANVAS2.ax, y: base.aura.y - GUARD_CANVAS.ay + GD_CANVAS2.ay },
    bits: (st, m) => [...paint.bits(st, m), ...moreBits(who, mob, st, m)],
    grains: paint.grains,
  };
  return mob;
}
/** THE PARTISAN GUARD AND THE SWORD GUARD WITH THE THRUST BY MOVEMENT 9 AND THE DRILL (GUARD_DRILL): the game's own in all but these two. */
export const DRILL_PARTISAN = drillGuard('partisan');
export const DRILL_SWORD = drillGuard('sword');
/** As the game holds a monster: the thrust as `attack`, the drill as `moves.drill` (in place of `sweep`). */
export function makeDrillGuardArt(mob: Mob = DRILL_PARTISAN, pace = mob.pace): ActorArt {
  return { front: mobSet(mob, 'front', pace), back: mobSet(mob, 'back', pace) };
}
void FLAME;

// =============================================================================================
// WHERE THEY STRIKE (tiles before him, to his left)

/** The weapon's point at the thrust (tiles before him, to his left). */
export function thrustReach(mob: Mob = DRILL_PARTISAN): [number, number] {
  const s = skeletonAt(mob, 'attack', THRUST9_HIT);
  const p = mob === DRILL_SWORD ? swordOf(s).tip : partisanOf(s, posedOfMob(mob, 'attack', THRUST9_HIT)).tip;
  return [p[0] / TILE3, p[1] / TILE3];
}
/** Whether the thrust strikes a hero `x` tiles before him and `y` to his left. */
export function thrustStrikes(mob: Mob, x: number, y: number): boolean {
  const [rx, ry] = thrustReach(mob);
  return x >= THRUST9.from && x <= rx + THRUST9.more && Math.abs(y - ry) <= THRUST9.half;
}
/** Where the point goes into the ground at the drive (tiles before him, to his left). */
export function driveAt(mob: Mob = DRILL_PARTISAN): [number, number] {
  const s = skeletonAt(mob, 'drill', DRILL_HIT);
  const p = mob === DRILL_SWORD ? swordOf(s).tip : partisanOf(s, posedOfMob(mob, 'drill', DRILL_HIT)).tip;
  return [p[0] / TILE3, p[1] / TILE3];
}
/** Whether blow `k` of the drill strikes a hero `x` tiles before him and `y` to his left (0 the chop, 1 the spin, 2 the drive). */
export function drillStrikes(mob: Mob, k: 0 | 1 | 2, x: number, y: number): boolean {
  if (k === 0) return x >= DRILL.chop.fwd[0] && x <= DRILL.chop.fwd[1] && Math.abs(y) <= DRILL.chop.half;
  if (k === 1) return Math.hypot(x, y) <= DRILL.spin;
  const [dx, dy] = driveAt(mob);
  return Math.hypot(x - dx, y - dy) <= DRILL.wave;
}

// =============================================================================================
// THE JAVELIN (2 Nov 2026): THEIR SECOND ATTACK, IN PLACE OF THE DRILL (the long thrust stays)
//
// The owner, 2 Nov 2026, 07:32: “Okay now I need you to look at how many enemies do a small hit, small hit, slam combo.  I feel like you
// over corrected to that a little too much.” Asked which keep it: “Chained One and troll (Recommended)”. So the drill (chop, spin, a
// drive into the ground) goes; asked what in its place, his pick: “Javelin (Recommended)”, offered as: he hurls the partisan; it sticks
// quivering where you stood with a burst of turf. He draws a sword till he pulls it out.
//
// THE PARTISAN GUARD: a sword in its scabbard at his left hip now (his look changes by it, in every frame of this set). THE THROW: the
// partisan HAULED BACK over his right shoulder, his left hand pointed at you, where you stand MARKED on the turf: HELD, shaking, its
// blade glinting pink; in TWO FRAMES HURLED, smeared; it flies (`spearFlying`) and STICKS QUIVERING where you stood (`spearStuck`), a
// burst of turf 1.6 tiles round; he DRAWS HIS SWORD from his hip. With it (JAV_PARTISAN_SWORD) he stands, marches and strikes (a quick
// sword thrust) until he has walked to his partisan; then THE PULL-OUT: his sword back in its scabbard, both hands on the shaft, HEAVED,
// held, WRENCHED OUT in a spray of turf, and up into his hands: the partisan guard again.
// THE SWORD GUARD: a light javelin across his back now (his look changes by it). THE THROW: his sword put up in the scabbard at his hip,
// the javelin drawn off his back over his right shoulder, hauled back, held, hurled the same way; his sword drawn again; then he is
// the sword guard as he is (no javelin to fetch: a scabbard at his hip, his back bare).

/** Its moments, for each: hauled back by `haul`; HELD to the strike; the strike's two frames; the sword in his hand from `sword`; his stand by `long`. */
export const JAV = {
  partisan: { haul: 0.45, strike: [f(27), f(29)] as const, hit: f(29), sword: 1.62, long: 2.25 },
  sword: { haul: 0.85, strike: [f(35), f(37)] as const, hit: f(37), sword: 1.95, long: 2.55, sheathed: 0.32, grab: 0.5 },
  mark: 0.15,
  /** The burst of turf where it sticks, and who is struck (within `r` of where it lands, as it lands); its flight `fly(d)` seconds over `d` tiles, `arc(d)` high. */
  r: 1.6,
  near: 2,
  far: 7,
  quiver: 0.8,
  sink: 0,
  lean: 66,
} as const;
export const javFly = (d: number): number => 0.22 + 0.035 * d;
export const javArc = (d: number): number => 14 + 4 * d;
const JAV_NAME = 'The javelin';
const PULL_NAME = 'The partisan wrenched out';
export const JAV_SMEARED = (who: GuardWho) => (t: number): boolean => t > JAV[who].strike[0] + 1e-6 && t <= JAV[who].strike[1] + FR + 1e-6;
const SCAB: Ramp = ['#140e0a', '#140e0a', '#33241a', '#4c3626', '#4c3626'];
const JASH: Ramp = ['#22180e', '#22180e', '#5a4630', '#7a6244', '#7a6244'];
const JSTEEL: Ramp = ['#20232b', '#20232b', '#646b78', '#98a0ac', '#c8ced6'];
/** The light javelin's length, and where his hand holds it (from its butt). */
const JAVELIN = { long: 74, hold: 30, head: 8 } as const;

/** The scabbard at his left hip: its mouth and the way it hangs (down and back). */
function scabbardOf(s: Skeleton): { mouth: V3; way: V3 } {
  const [hf, hl, hu] = s.hips;
  // (its hilt forward at his left front, over the belt; the scabbard slung back and down past his hip)
  const mouth = add(s.pelvis, add(add(mul(hf, 10.5), mul(hl, 6)), mul(hu, 1.6)));
  return { mouth, way: norm(add(add(mul(hu, -0.82), mul(hf, -0.55)), mul(hl, 0.15))) };
}
/** The javelin across the sword guard's back: from low at his right hip up over his left shoulder; its butt and way. */
function backJavelin(s: Skeleton): { butt: V3; way: V3 } {
  const [cf, cl, cu] = s.chest;
  const butt = add(add(s.hipR, mul(s.hips[0], -6.2)), mul(s.hips[1], -3));
  const way = norm(add(add(mul(cu, 0.86), mul(cl, 0.5)), mul(cf, -0.06)));
  return { butt, way };
}
function javelinBits(bits: Bit[], butt: V3, way: V3, glint = 0): void {
  const put = (part: string, shape: Bit['shape']): void => void bits.push({ part, piece: 'javelin', shape });
  const at = (k: number): V3 => add(butt, mul(way, k));
  const across = norm(cross(way, Math.abs(way[2]) < 0.9 ? [0, 0, 1] : [1, 0, 0]));
  put('javelin', { k: 'rod', a: at(0), b: at(JAVELIN.long - JAVELIN.head), ra: 0.7, rb: 0.65, ramp: JASH });
  put('javelin', { k: 'rod', a: at(JAVELIN.long - JAVELIN.head - 1.5), b: at(JAVELIN.long - JAVELIN.head + 0.6), ra: 0.9, rb: 0.85, ramp: JSTEEL });
  put('javelin', { k: 'ball', c: at(JAVELIN.long - JAVELIN.head * 0.55), ax: [mul(way, JAVELIN.head * 0.48), mul(across, 1.6), mul(norm(cross(way, across)), 0.5)], skin: JSTEEL });
  put('javelin', { k: 'rod', a: at(JAVELIN.long - JAVELIN.head * 0.2), b: at(JAVELIN.long), ra: 0.6, rb: 0.15, ramp: JSTEEL });
  if (glint > 0.05) put('glint', { k: 'glow', p: at(JAVELIN.long - JAVELIN.head * 0.5), c: FLAME[1], r: 6 + 6 * glint, a: 0.5 * glint });
}
/** The sword's bits as the guard painter paints it, with its hilt at `hand` pointing `way` (the sword guard's painter, only the sword; `hiltOnly` sheathed). */
const SWORD_PAINT = guardPainter('sword', { dropped: () => false });
function swordAt(st: Stage, m: Moment, hand: V3, way: V3, across: V3, hiltOnly: boolean): Bit[] {
  const fake = { ...m, s: { ...m.s, handR: hand, point: way, across } as Skeleton, glint: 0 };
  return SWORD_PAINT.bits(st, fake).filter((b) => b.piece === 'sword' && (!hiltOnly || b.part === 'hilt'));
}
function scabbardBits(st: Stage, m: Moment, sheathed: boolean): Bit[] {
  const sc = scabbardOf(m.s);
  const bits: Bit[] = [{ part: 'scabbard', piece: 'scabbard', shape: { k: 'rod', a: add(sc.mouth, mul(sc.way, -0.6)), b: add(sc.mouth, mul(sc.way, SWORD.blade + 1)), ra: 1.35, rb: 0.95, ramp: SCAB } }];
  bits.push({ part: 'scabbard', piece: 'scabbard', shape: { k: 'rod', a: add(sc.mouth, mul(sc.way, -0.8)), b: add(sc.mouth, mul(sc.way, 1.2)), ra: 1.5, rb: 1.45, ramp: JSTEEL } });
  if (sheathed) bits.push(...swordAt(st, m, add(sc.mouth, mul(sc.way, -SWORD.guard - 0.4)), sc.way, norm(cross(sc.way, m.s.hips[0])), true));
  return bits;
}

// ---------------------------------------------------------------------------------------------
// THE THROW'S POSES (from the pelvis's place: the right hand's grip; the way the weapon points)

function javPoses(who: GuardWho): { take: P; hauled: P; whip: P; hurled: P; through: P; reach: P; hilt: P; drawn: P } {
  const R = restOf(who);
  const left = (x: number, y: number, z: number, pAz = 0): P => (who === 'sword' ? guardL(x, y, z, pAz) : { lhIn: 1, lhx: x, lhy: y, lhz: z });
  // (the weapon in his right fist alone: the partisan by its balance, `draw` along its shaft; the javelin with the sword's grip)
  const grip = (body: P, hand: V3, az: number, el: number): P =>
    who === 'partisan' ? { ...body, ...partisanGrip([hand[0] + ((body.px as number) ?? 0), hand[1] + ((body.py as number) ?? 0), hand[2]], heading(az, el), [0, 0, 1], 0.62, null) } : swordIn(body, hand, az, el, [0, 0, 1]);
  const e = (p: P, wl: V3, wr: V3): P => elbowsTo(R, p, wl, wr);
  return {
    take: e({ ...grip({ px: -0.5, pz: R.pz, yaw: -8, twist: -6, pitch: 2, bend: 2, side: 0, roll: 0, faceUp: 6, faceTilt: 0, faceTurn: 6, lk: 9, rk: -12 }, [2, -11, 44], 0, 8), ...left(9, 2, -10, 0) }, [0.1, 0.9, -0.4], [-0.3, -0.8, -0.5]),
    hauled: e({ ...grip({ px: -3.4, pz: R.pz - 0.4, yaw: -24, twist: -22, pitch: -6, bend: -7, side: 2, roll: 0, faceUp: 8, faceTilt: 0, faceTurn: 22, lk: 6, rk: -26 }, [-11, -13, 58], 2, 16), ...left(15, 3, 4, 10) }, [0.3, 0.9, 0.1], [-0.5, -0.7, -0.2]),
    whip: e({ ...grip({ px: 1.2, pz: R.pz - 1.2, yaw: -4, twist: -4, pitch: 4, bend: 0, side: 1, roll: 0, faceUp: 8, faceTilt: 0, faceTurn: 6, lk: 12, rk: -16 }, [4, -13, 60], 0, 12), ...left(10, 6, -6, 20) }, [0.2, 0.9, -0.3], [-0.2, -0.8, 0.2]),
    hurled: e({ ...grip({ px: 5.2, pz: R.pz - 2.6, yaw: 18, twist: 16, pitch: 14, bend: 8, side: -2, roll: 0, faceUp: 6, faceTilt: 0, faceTurn: -12, lk: 22, rk: -6 }, [22, -11, 54], -4, 6), ...left(3, 9, -14, 40) }, [0, 0.9, -0.4], [0.2, -0.7, -0.4]),
    through: e({ ...grip({ px: 6.4, pz: R.pz - 3.6, yaw: 26, twist: 22, pitch: 22, bend: 13, side: -3, roll: 0, faceUp: 2, faceTilt: 0, faceTurn: -18, lk: 26, rk: -6 }, [16, 4, 30], 30, -40), ...left(0, 10, -16, 40) }, [0, 0.9, -0.4], [0.3, -0.4, -0.6]),
    // (his right hand across to the sword's hilt at his left hip; the sword drawn out of it and up)
    reach: e({ ...grip({ px: 2.6, pz: R.pz - 1.2, yaw: 12, twist: 10, pitch: 8, bend: 4, side: -1, roll: 0, faceUp: 4, faceTilt: 0, faceTurn: -6, lk: 14, rk: -10 }, [14, 0, 36], 60, -50), ...left(4, 8, -15, 20) }, [0, 0.9, -0.4], [0.2, -0.9, -0.3]),
    hilt: e({ px: 1.6, pz: R.pz - 1.0, yaw: 10, twist: 8, pitch: 6, bend: 3, side: 0, roll: 0, faceUp: 4, faceTilt: 0, faceTurn: -4, lk: 12, rk: -10, ...swordGrip([13, 5.5, 36.8], scabWayAt(), [0, 0, 1]), ...left(5, 9, -14, 20) }, [0, 0.9, -0.4], [0.6, -0.6, -0.4]),
    drawn: e({ px: 0.8, pz: R.pz - 0.4, yaw: 4, twist: 2, pitch: 3, bend: 2, side: 0, roll: 0, faceUp: 4, faceTilt: 0, faceTurn: 0, lk: 10, rk: -9, ...swordGrip([13, -8, 44], heading(-10, 40), [0, 1, 0]), ...left(7, 3, -12, 0) }, [-0.3, 0.8, -0.6], [-0.3, -0.8, -0.5]),
  };
}
/** The way the scabbard hangs at rest (for the sword's way as it is put up or drawn). */
function scabWayAt(): V3 {
  return scabbardOf(skeletonAt(GUARD_SWORD, 'stand', 0)).way;
}
function javKeys(who: GuardWho): Key3[] {
  const J = JAV[who];
  const p = javPoses(who);
  const shake = (q: P, k: number): P => ({ ...q, rhz: (q.rhz as number) + (k % 2 ? 0.8 : -0.4), rhy: (q.rhy as number) + (k % 2 ? -0.35 : 0.25), px: (q.px as number) - 0.25 * (k % 2) });
  const [s0] = J.strike;
  const keys: Key3[] = [{ at: 0, pose: {} }];
  if (who === 'sword') {
    const sw = JAV.sword;
    // (his sword put up: the hilt to his left hip, its point down into the scabbard; his hand up over his right shoulder to the javelin)
    keys.push(
      { at: sw.sheathed, pose: p.hilt, ease: 'io' },
      { at: sw.sheathed + 0.08, pose: { ...p.hilt, rhz: (p.hilt.rhz as number) - 0.6 }, ease: 'io' },
      { at: sw.grab, pose: elbowsTo(SWORD_REST, { px: -1, pz: SWORD_REST.pz, yaw: -10, twist: -10, pitch: -2, bend: -2, side: 1, roll: 0, faceUp: 6, faceTilt: 0, faceTurn: 10, lk: 8, rk: -12, ...swordIn({}, [-4, -9, 66], 170, 50, [0, 0, 1]), ...guardL(9, 2, -8, 10) }, [0.1, 0.9, -0.4], [0.1, -0.6, 0.8]), ease: 'io' },
    );
  } else keys.push({ at: 0.15, pose: p.take, ease: 'io' });
  keys.push(
    { at: J.haul, pose: p.hauled, ease: 'out' },
    { at: J.haul + 0.1, pose: shake(p.hauled, 1), ease: 'io' },
    { at: J.haul + 0.2, pose: shake(p.hauled, 2), ease: 'io' },
    { at: J.haul + 0.28, pose: shake(p.hauled, 3), ease: 'io' },
    { at: s0 - 0.034, pose: p.hauled, ease: 'io' },
    { at: s0, pose: { ...p.hauled, yaw: (p.hauled.yaw as number) + 4, twist: (p.hauled.twist as number) + 3 }, ease: 'in' },
    { at: s0 + FR, pose: p.whip, ease: 'lin' },
    { at: J.hit, pose: p.hurled, ease: 'lin' },
    { at: J.hit + 0.2, pose: p.through, ease: 'out' },
    { at: J.hit + 0.42, pose: { ...p.through, px: (p.through.px as number) - 0.6, pz: (p.through.pz as number) + 0.8 }, ease: 'io' },
    { at: J.sword - 0.2, pose: p.reach, ease: 'io' },
    { at: J.sword, pose: p.hilt, ease: 'io' },
    { at: J.sword + 0.25, pose: p.drawn, ease: 'io' },
    { at: J.long, pose: { ...SWORD_REST }, ease: 'io' },
  );
  return keys;
}
function javFeet(who: GuardWho): (t: number) => P {
  const J = JAV[who];
  const L0s = plantOf(B, 'L', {}, restOf(who));
  const R0s = plantOf(B, 'R', {}, restOf(who));
  return footwork(B, {
    L: { start: L0s, moves: [{ t0: J.haul - 0.3, t1: J.haul - 0.06, to: plantBy(L0s, 10, 1, 8), lift: 3.0 }, { t0: J.long - 0.5, t1: J.long - 0.22, to: L0s, lift: 2.6 }] },
    R: { start: R0s, moves: [{ t0: J.haul - 0.26, t1: J.haul, to: plantBy(R0s, -4, -1, -24), lift: 2.4 }, { t0: J.strike[0], t1: J.hit, to: plantBy(R0s, -4, -1, -24, { pitch: 22 }) }, { t0: J.hit + 0.06, t1: J.hit + 0.3, to: plantBy(R0s, 9, -1, -6), lift: 3.4 }, { t0: J.long - 0.75, t1: J.long - 0.45, to: R0s, lift: 2.6 }] },
  });
}
const javGlint = (who: GuardWho) => (t: number): number => {
  const J = JAV[who];
  return t < J.haul - 0.3 || t > J.hit ? 0 : t < J.haul ? (t - J.haul + 0.3) / 0.3 : 1;
};

// ---------------------------------------------------------------------------------------------
// THE PULL-OUT: the partisan stuck in the turf before him, wrenched out

/** Where the partisan stands stuck before him as he begins the pull-out (his own lengths): its point buried, leaning back at him. */
export const STUCK = ((): { tip: V3; way: V3; butt: V3 } => {
  const el = JAV.lean * (Math.PI / 180);
  const way: V3 = [Math.cos(el), 0, -Math.sin(el)];
  const tip: V3 = [44, 0, 0.6];
  return { tip, way, butt: add(tip, mul(way, -PARTISAN.long)) };
})();
export const PULL = { sheathed: 0.42, grip: 0.72, heave: [0.72, 1.32] as const, free: 1.48, long: 2.65 } as const;
/** His fists on the stuck shaft: the right `k` along it from its butt, the left `j`. */
function onShaft(body: P, k: number, j: number, lift = 0, back = 0): P {
  const at = (u: number): V3 => add(add(STUCK.butt, mul(STUCK.way, u)), [-back, 0, lift]);
  const wayNow = norm(sub(at(PARTISAN.long), at(0)));
  const r = at(k);
  const draw = (k - 2) / 44;
  return { ...body, ...partisanGrip([r[0], r[1], r[2]], wayNow, [0, 1, 0], draw, j - k) };
}
function pullKeys(): Key3[] {
  const S = SWORD_REST;
  const R = PARTISAN_REST;
  const e = (rest: Bones, p: P, wl: V3, wr: V3): P => elbowsTo(rest, p, wl, wr);
  const BODY: P = { px: 0, pz: S.pz - 3.4, yaw: 0, twist: 0, pitch: 16, bend: 10, side: 0, roll: 0, faceUp: 6, faceTilt: 0, faceTurn: 0, lk: 18, rk: -18 };
  const hilt = e(S, { px: 1.6, pz: S.pz - 1.0, yaw: 10, twist: 8, pitch: 6, bend: 3, side: 0, roll: 0, faceUp: 4, faceTilt: 0, faceTurn: -4, lk: 12, rk: -10, ...swordGrip([13, 5.5, 36.8], scabWayAt(), [0, 0, 1]), lhIn: 1, lhx: 6, lhy: 4, lhz: -14 }, [0, 0.9, -0.4], [0.6, -0.6, -0.4]);
  // (both fists high on the shaft, near its butt, reaching up: the right at 12 along it, the left at 28)
  const grip = e(S, onShaft({ ...BODY, px: 3, pz: S.pz - 1.2, pitch: 6, bend: 2, faceUp: 18 }, 12, 28), [0.3, 0.9, 0.2], [0.3, -0.9, 0.2]);
  const heave = (k: number): P => e(S, onShaft({ ...BODY, px: 1.6 - 0.4 * (k % 2), pz: S.pz - 4.2, pitch: -4, bend: -6, faceUp: 22, lk: 22, rk: -22 }, 12, 28, 0, 0), [0.3, 0.9, 0.2], [0.3, -0.9, 0.2]);
  const free = e(S, onShaft({ ...BODY, px: -1, pz: S.pz - 0.6, pitch: -6, bend: -8, faceUp: 24 }, 12, 28, 10, 4), [0.3, 0.9, 0.2], [0.3, -0.9, 0.2]);
  // (swung over: its blade up before him, then upright at his right side)
  const tilt = e(S, { ...BODY, px: 0.6, pz: S.pz - 0.8, pitch: -2, bend: -4, faceUp: 16, ...partisanGrip([10, -3, 66], heading(0, -33), [0, 1, 0], (12 - 2) / 44, null), lhIn: 1, lhx: 8, lhy: 8, lhz: -2 }, [0.3, 0.9, 0], [0.3, -0.9, 0]);
  const flat = e(S, { ...BODY, px: 0, pz: S.pz - 0.8, pitch: 2, bend: 0, faceUp: 10, ...partisanGrip([13, -6, 58], heading(0, 0), [0, 1, 0], (12 - 2) / 44, null), lhIn: 1, lhx: 7, lhy: 9, lhz: -8 }, [0.2, 0.9, -0.2], [0.2, -0.9, -0.2]);
  const upright = e(S, { ...BODY, px: 0, pz: S.pz - 0.6, pitch: 2, bend: 0, faceUp: 6, ...partisanGrip([13, -10, 52], heading(0, 84), [0, 1, 0], (12 - 2) / 44, null), lhIn: 1, lhx: 7, lhy: 9, lhz: -10 }, [0.2, 0.9, -0.4], [0.1, -0.9, -0.4]);
  void R;
  return [
    { at: 0, pose: {} },
    { at: PULL.sheathed - 0.1, pose: hilt, ease: 'io' },
    { at: PULL.sheathed, pose: { ...hilt, rhz: (hilt.rhz as number) - 0.8 }, ease: 'io' },
    { at: PULL.grip, pose: grip, ease: 'io' },
    { at: PULL.heave[0] + 0.12, pose: heave(0), ease: 'io' },
    { at: PULL.heave[0] + 0.24, pose: heave(1), ease: 'io' },
    { at: PULL.heave[0] + 0.36, pose: heave(2), ease: 'io' },
    { at: PULL.heave[0] + 0.48, pose: heave(3), ease: 'io' },
    { at: PULL.heave[1], pose: heave(4), ease: 'io' },
    { at: PULL.free, pose: free, ease: 'out' },
    { at: 1.66, pose: tilt, ease: 'io' },
    { at: 1.82, pose: flat, ease: 'io' },
    { at: 2.02, pose: upright, ease: 'io' },
    { at: PULL.long, pose: { ...PARTISAN_REST }, ease: 'io' },
  ];
}
/** Where the partisan is in the pull-out (`null` when it is in his hands, the painter's own): stuck, rocking as he heaves. */
function stuckAt(t: number): { butt: V3; way: V3 } | null {
  if (t >= PULL.grip) return null;
  return { butt: STUCK.butt, way: STUCK.way };
}
function pullFeet(): (t: number) => P {
  const L0s = plantOf(B, 'L', {}, SWORD_REST);
  const R0s = plantOf(B, 'R', {}, SWORD_REST);
  return footwork(B, {
    L: { start: L0s, moves: [{ t0: 0.5, t1: 0.72, to: plantBy(L0s, 6, 2, 10), lift: 2.6 }, { t0: 2.0, t1: 2.25, to: L0s, lift: 2.4 }] },
    R: { start: R0s, moves: [{ t0: 0.55, t1: 0.78, to: plantBy(R0s, -3, -2, -14), lift: 2.4 }, { t0: 2.1, t1: 2.35, to: R0s, lift: 2.4 }] },
  });
}

// ---------------------------------------------------------------------------------------------
// THEM, WITH THE JAVELIN

/** The partisan's bits as the partisan guard's painter paints it, along `way` from `butt` (for it stuck, and in flight). */
const PART_PAINT = guardPainter('partisan', { dropped: () => false });
function partisanAlong(st: Stage, m: Moment, butt: V3, way: V3, across: V3): Bit[] {
  const draw = 0.5;
  const hand = add(butt, mul(way, 2 + 44 * draw));
  const fake = { ...m, s: { ...m.s, handR: hand, point: way, across } as Skeleton, q: { ...m.q, draw }, glint: 0 };
  return PART_PAINT.bits(st, fake).filter((b) => b.piece === 'partisan');
}
const JV_CANVAS = { w: 560, h: 380, ax: 260, ay: 250 } as const;
type JavWho = 'partisan' | 'partisan+sword' | 'sword' | 'sword+after';
function javGuard(who: JavWho): Mob {
  const weapon: GuardWho = who === 'partisan' || who === 'partisan+sword' ? 'partisan' : 'sword';
  const holdsSword = who !== 'partisan';
  const baseMob = holdsSword ? DRILL_SWORD : DRILL_PARTISAN;
  const painter = guardPainter(holdsSword ? 'sword' : 'partisan', { dropped: (m: Moment) => !!m.dying && m.t >= GD_DIES.drop });
  const rest = holdsSword ? SWORD_REST : PARTISAN_REST;
  const mv = (name: string, keys: Key3[], hit: number, more: Partial<MobMove>): MobMove => ({ name, motion: { keys, hit }, rest, ...more });
  const jw = JAV[weapon];
  const more: Record<string, MobMove> = {};
  if (who === 'partisan' || who === 'sword') more.javelin = { ...mv(JAV_NAME, javKeys(weapon), jw.hit, { feet: javFeet(weapon), glint: javGlint(weapon), jaw: baseMob.attack.jaw }), rest: weapon === 'partisan' ? PARTISAN_REST : SWORD_REST };
  if (who === 'partisan+sword') more.pullOut = mv(PULL_NAME, pullKeys(), PULL.free, { feet: pullFeet(), jaw: baseMob.attack.jaw });
  const mob: Mob = {
    ...baseMob,
    id: `guard-${who}-javelin`,
    more,
    canvas: JV_CANVAS,
    aura: { ...baseMob.aura, x: baseMob.aura.x - GD_CANVAS2.ax + JV_CANVAS.ax, y: baseMob.aura.y - GD_CANVAS2.ay + JV_CANVAS.ay },
    bits: (st, m) => {
      const t = m.t;
      const throwing = m.move === JAV_NAME;
      const pulling = m.move === PULL_NAME;
      let own: Bit[];
      if (throwing && weapon === 'partisan') {
        // (the partisan in his hand until it leaves it; his sword in his hand once he has drawn it)
        const inHand = t <= jw.hit + 1e-6;
        own = t >= jw.sword ? SWORD_PAINT.bits(st, m).filter((b) => b.piece !== 'shield') : PART_PAINT.bits(st, m);
        if (t >= jw.sword) own = own.filter((b) => b.piece !== 'partisan');
        else if (!inHand) own = own.filter((b) => b.piece !== 'partisan');
        own.push(...scabbardBits(st, m, t < jw.sword));
      } else if (throwing) {
        // (the sword guard: his sword put up, the javelin off his back and thrown, his sword drawn again)
        const sw = JAV.sword;
        const sheathed = t >= sw.sheathed && t < sw.sword;
        own = painter.bits(st, m).filter((b) => !(sheathed && b.piece === 'sword'));
        own.push(...scabbardBits(st, m, sheathed));
        if (t < sw.grab) {
          const bj = backJavelin(m.s);
          javelinBits(own, bj.butt, bj.way);
        } else if (t <= sw.hit + 1e-6) javelinBits(own, add(m.s.handR, mul(m.s.point, -JAVELIN.hold)), m.s.point, javGlint('sword')(t));
      } else if (pulling) {
        // (his sword in his hand until he puts it up; the partisan stuck before him till his hands are on it, then in them)
        const sheathed = t >= PULL.sheathed;
        own = (sheathed ? PART_PAINT.bits(st, m) : SWORD_PAINT.bits(st, m).filter((b) => b.piece !== 'shield' && b.piece !== 'partisan'));
        const stuck = stuckAt(t);
        if (stuck) {
          own = own.filter((b) => b.piece !== 'partisan');
          own.push(...partisanAlong(st, m, stuck.butt, stuck.way, [0, 1, 0]));
        }
        own.push(...scabbardBits(st, m, sheathed));
      } else {
        own = painter.bits(st, m);
        if (who === 'partisan+sword') own = own.filter((b) => b.piece !== 'shield');
        own.push(...scabbardBits(st, m, who === 'partisan'));
        if (who === 'sword') {
          const bj = backJavelin(m.s);
          javelinBits(own, bj.butt, bj.way);
        }
      }
      return [...own, ...javSmear(weapon, mob, st, m)];
    },
    grains: painter.grains,
  };
  return mob;
}
function javSmear(who: GuardWho, mob: Mob, st: Stage, m: Moment): Bit[] {
  const bits: Bit[] = [];
  if (m.move !== JAV_NAME || !JAV_SMEARED(who)(m.t)) return bits;
  const put: Put = (part, piece, shape) => void bits.push({ part, piece, shape });
  const hit = JAV[who].hit;
  const thin = Math.abs(m.t - hit - FR) < 1e-6;
  const lines: V3[][] = [[], [], []];
  for (let i = 0; i <= 8; i++) {
    const u = Math.min(m.t, hit) - (FR * 1.3 * i) / 8;
    const s = skeletonAt(mob, 'javelin', u);
    const L = who === 'partisan' ? PARTISAN.long : JAVELIN.long;
    const hold = who === 'partisan' ? 2 + 44 * 0.86 : JAVELIN.hold;
    const butt = add(s.handR, mul(s.point, -hold));
    lines[0].push(add(butt, mul(s.point, L)));
    lines[1].push(add(butt, mul(s.point, L * 0.75)));
    lines[2].push(s.handR);
  }
  smearAlong(st, put, lines, thin, ['#3e3a4a', '#7a808a', '#c6cad0', '#f2f2f6'], PINK[1]);
  return bits;
}
/** THE PARTISAN GUARD WITH THE JAVELIN (his thrust, and `javelin` in place of the drill; a sword at his hip). */
export const JAV_PARTISAN = javGuard('partisan');
/** THE PARTISAN GUARD WITH HIS SWORD, while his partisan is stuck in the turf: the sword guard's stand, march and thrust, no shield; `pullOut`. */
export const JAV_PARTISAN_SWORD = javGuard('partisan+sword');
/** THE SWORD GUARD WITH A JAVELIN ON HIS BACK (his thrust, and `javelin`); and after it, his back bare. */
export const JAV_SWORD = javGuard('sword');
export const JAV_SWORD_AFTER = javGuard('sword+after');
export function makeJavelinGuardArt(mob: Mob = JAV_PARTISAN, pace = mob.pace): ActorArt {
  return { front: mobSet(mob, 'front', pace), back: mobSet(mob, 'back', pace) };
}

// ---------------------------------------------------------------------------------------------
// ITS FLIGHT, AND IT STUCK

/** Where the weapon is `u` seconds after it leaves his hand on a throw of `d` tiles (tiles before him, its height in his lengths, and its way). */
export function javAt(who: GuardWho, u: number, d: number): { x: number; z: number; way: V3; done: boolean } {
  const fly = javFly(d);
  const k = clamp01(u / fly);
  const s0 = skeletonAt(who === 'partisan' ? JAV_PARTISAN : JAV_SWORD, 'javelin', JAV[who].hit);
  const x0 = s0.handR[0] / TILE3;
  const z0 = s0.handR[2];
  const arc = javArc(d);
  const x = x0 + (d - x0) * k;
  const z = z0 * (1 - k) + 4 * arc * k * (1 - k);
  const dz = -z0 + 4 * arc * (1 - 2 * k);
  const way = norm([(d - x0) * TILE3, 0, dz]);
  return { x, z, way, done: k >= 1 };
}
export const FLIGHT_CANVAS = { w: 240, h: 200, ax: 120, ay: 150 } as const;
/** The weapon in flight, its middle over the canvas's anchor at its height (`view` as he faces): the partisan or the javelin, a streak behind it. */
export function spearFlying(who: GuardWho, u: number, d: number, view: 'front' | 'back'): { px: Px; lights: Light[] } {
  const C = FLIGHT_CANVAS;
  const st = stage(view, C.ax, C.ay, C);
  const j = javAt(who, u, d);
  const L = who === 'partisan' ? PARTISAN.long : JAVELIN.long;
  const mid: V3 = [0, 0, j.z];
  const butt = add(mid, mul(j.way, -L * 0.55));
  const bits: Bit[] = [];
  const m0 = { s: skeletonAt(GUARD_PARTISAN, 'stand', 0), q: posedOfMob(GUARD_PARTISAN, 'stand', 0), t: 0, come: [0, 0, 0], wind: 0, blur: false, glint: 0, bare: false, skull: false, rally: 0, charge: 0 } as Moment;
  if (who === 'partisan') bits.push(...partisanAlong(st, m0, butt, j.way, [0, 1, 0]));
  else javelinBits(bits, butt, j.way);
  // (a streak of air behind it)
  for (let i = 1; i < 14; i++) bits.push({ part: 'streak', piece: 'streak', shape: { k: 'mote', p: add(butt, mul(j.way, -i * 3)), c: i < 4 ? '#f2f2f6' : i < 8 ? '#c6cad0' : PINK[0], size: i < 6 ? 2 : 1 } });
  const lights = paintBits(st, bits, mid);
  return { px: st.whole(ENEMY_RIM), lights };
}
export const STUCK_CANVAS = { w: 260, h: 200, ax: 130, ay: 140 } as const;
/** The weapon STUCK where it landed (the canvas's anchor), `since` seconds after: driven in, QUIVERING, still; leaning back the way it came (`view` as he faces). */
export function spearStuck(who: GuardWho, since: number, view: 'front' | 'back'): { px: Px; lights: Light[] } {
  const C = STUCK_CANVAS;
  const st = stage(view, C.ax, C.ay, C);
  const L = who === 'partisan' ? PARTISAN.long : JAVELIN.long;
  const quiver = since < JAV.quiver ? Math.sin(since * 46) * 7 * (1 - since / JAV.quiver) ** 1.5 : 0;
  const el = (JAV.lean + quiver) * (Math.PI / 180);
  const way: V3 = [Math.cos(el), 0, -Math.sin(el)];
  const tip: V3 = [0, 0, 0.6];
  const butt = add(tip, mul(way, -L));
  const bits: Bit[] = [];
  const m0 = { s: skeletonAt(GUARD_PARTISAN, 'stand', 0), q: posedOfMob(GUARD_PARTISAN, 'stand', 0), t: 0, come: [0, 0, 0], wind: 0, blur: false, glint: 0, bare: false, skull: false, rally: 0, charge: 0 } as Moment;
  if (who === 'partisan') bits.push(...partisanAlong(st, m0, butt, way, [0, 1, 0]));
  else javelinBits(bits, butt, way);
  // (driven into the turf: a ruck of torn earth and grass heaped round where it went in)
  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * Math.PI * 2;
    const r = 2.2 + 1.4 * ((i * 7) % 3) / 2;
    bits.push({ part: 'turf', piece: 'turf', shape: { k: 'mote', p: [Math.cos(a) * r, Math.sin(a) * r, 0.8 + (i % 3) * 0.5], c: i % 4 === 0 ? '#45632f' : i % 2 ? '#24180f' : '#3a2a1c', size: 2 } });
  }
  const lights = paintBits(st, bits, lerp3(butt, tip, 0.5));
  const px = st.whole(ENEMY_RIM);
  // (what of it is in the turf is not seen: below the anchor's floor line, nothing)
  void sub;
  return { px, lights };
}
/** Whether the throw strikes a hero `x`, `y` tiles from where it lands, as it lands. */
export const javStrikes = (x: number, y: number): boolean => Math.hypot(x, y) <= JAV.r;
