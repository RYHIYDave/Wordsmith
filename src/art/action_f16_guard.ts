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

import type { ActorArt } from './actor_types';
import { footOn, footwork, plantBy, plantOf } from './bosses3';
import type { Plant } from './bosses3';
import { FLAME } from './mkit';
import { GUARD_BODY, GUARD_CANVAS, guardPainter, partisanGrip, partisanOf, swordGrip, swordOf } from './palace_guard';
import type { GuardWho } from './palace_guard';
import { GD_DIES, GUARD_PARTISAN, GUARD_SWORD, PARTISAN_REST, SWORD_REST } from './palace_guard_moves';
import { TILE3, mobSet, posedOfMob, skeletonAt } from './new_mobs3';
import type { Bit, Mob, MobMove, Moment, Put } from './new_mobs3';
import type { Stage } from './skin';
import { elbowFor, heading, norm } from './skeleton';
import type { Bones, Key3, Posed, V3 } from './skeleton';
import { FR, f, smearAlong } from './action_f6_fx';

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
