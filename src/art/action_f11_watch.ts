// FLOOR 11'S MEDIUM MOB, MORE ACTION: THE HUSHED WATCHMAN (the art chat's helper, 1 Nov 2026; docs/mockups/action_f11/README.md). A
// MOCK-UP: NOTHING OF THE GAME IMPORTS THIS FILE. The watch's HALBERD CHOP (their basic blow, in place of the sweep) and THE LANTERN
// THROW (in place of the round sweep) (WATCH_LANTERN, off), on the game's own figures (art/hushed_watch.ts, art/hushed_watch_moves.ts),
// all they keep their own but the lantern at the belt.
//
// His review of every enemy for more action, 31 Oct 2026, offered and answered “Yes (Recommended)”:
//   THE HUSHED WATCHMAN (floor 11, medium): “His basic becomes a halberd chop. Lantern throw, in place of the spin: he hurls his
//   lantern, which smashes into a spreading pool of burning oil.”
// Under his Movement 9 (24 Oct: “Like the wind up and wind down are big but the actual punch is lightning quick”; 28 Oct: “And bigger
// AOE to compensate for the extra time the player gets to evade”).
//
// THE CHOP: the halberd heaved up and back over the head in both hands, the body arched back, HELD, shaking, its blade glinting pink;
// in TWO FRAMES it comes over the top and down, smeared, and its head BITES THE FLOOR before him, the floor splitting on along the way
// it fell; stuck, wrenched, wrenched out, stood again.
// THE LANTERN THROW: the halberd left standing in the right hand, the left takes the lantern off the belt and swings it back low behind,
// the body wound away, HELD, the lantern flaring; in TWO FRAMES it is swung through and lobbed high, smeared; it comes down where you
// stood and SMASHES into a spreading pool of burning oil that burns a good while: ground taken away. He takes another lantern from
// the back of his belt and hangs it at his hip. Warm oil-fire orange and the enemy's pink; never cyan.

import { Px } from '../engine/px';
import type { Light } from '../engine/px';
import type { ActorArt } from './actor_types';
import { footwork, plantBy, plantOf } from './bosses3';
import { hash } from './kit';
import type { Ramp } from './kit';
import { FLAME } from './mkit';
import { HALBERD, WATCH_BODY, WATCH_CANVAS, WATCH_REST, halberdGrip, halberdOf, halberdPlanted } from './hushed_watch';
import { WATCHMAN, WATCH_SERGEANT, makeWatchArt3 } from './hushed_watch_moves';
import { TILE3, mobSet, skeletonAt } from './new_mobs3';
import type { Bit, Mob, MobMove, Moment, Put } from './new_mobs3';
import { stage } from './skin';
import type { GameView, Stage } from './skin';
import { add, elbowFor, heading, lerp3, mul, norm, sub } from './skeleton';
import type { Bones, Key3, Posed, Skeleton, V3 } from './skeleton';
import { FR, TAU, blob, clamp01, f, markRing, pen, smearAlong, smooth, tileAt } from './action_f6_fx';

/** THE SWITCH, OFF. With it on, the bestiary's watch are made by `makeLanternWatchArt`. */
export const WATCH_LANTERN = { on: false };

type P = Partial<Bones>;
const B = WATCH_BODY;
const R = WATCH_REST;
const L0 = plantOf(B, 'L', {}, R);
const R0 = plantOf(B, 'R', {}, R);

/** Warm oil-fire: from its smoky dark to near white. Never cyan. */
export const OIL = ['#2a0e06', '#5c1e0a', '#a03a10', '#e0661c', '#ffa040', '#ffd890', '#fff4d0'] as const;
/** The lantern: its iron, its horn panes lit from within. */
const LIRON: Ramp = ['#14121a', '#24212c', '#38343f', '#504a56', '#6a6470'];
const HORN: Ramp = ['#5a2a10', '#9a4a18', '#d07a28', '#f0a848', '#ffd890'];
const PINK = ['#e0287a', '#ff7aa8', '#7a1058'] as const;
const STONE = ['#26222c', '#3e3842', '#5c5560', '#7c7478', '#a09890'] as const;

function elbowsTo(pose: P, wantL: V3 | null, wantR: V3 | null): P {
  const q = { ...R, ...pose } as Posed;
  const le = wantL ? elbowFor(B, q, true, norm(wantL)) : q.le;
  const re = wantR ? elbowFor(B, { ...q, le } as Posed, false, norm(wantR)) : q.re;
  return { ...pose, le, re };
}
/** Both hands on the halberd: the right at `hand` (from the pelvis's place), the halberd pointing `az`, `el`, its blade out along `edge`; the right hand at its butt, the left a forearm up it. */
const both = (body: P, hand: V3, az: number, el: number, edge: V3): P => ({ ...body, ...halberdGrip([hand[0] + ((body.px as number) ?? 0), hand[1] + ((body.py as number) ?? 0), hand[2]], heading(az, el), edge, 0, 7) });
/** The way its blade leads as it comes over the top and down (az 0), at `el`. */
const leading = (el: number): V3 => [Math.sin((el * Math.PI) / 180), 0, -Math.cos((el * Math.PI) / 180)];

// =============================================================================================
// THE HALBERD CHOP, BY MOVEMENT 9

/**
 * THE CHOP'S NUMBERS (seconds from its start; tiles):
 *   wind-up  taken up and heaved back over the head by 0.4 s, the left foot stepped forward; HELD, shaking, its blade glinting pink, to
 *            0.8 s (0.4 s)
 *   strike   TWO FRAMES, smeared: over the top (frame 25), its head in the floor (frame 26, 0.867 s: the clip's `hit`)
 *   wind-down  stuck, wrenched at twice, to 1.2 s; wrenched out by 1.36 s; stood upright by 1.7 s; at rest 2.1 s
 *   THE BITE  its blade in the floor `at` before him: a hero within `r` of there, or in the strip from `from` to `at` and `half` to
 *            either side, is struck; THE SPLIT runs on along the floor from the bite to `split` tiles before him (the same strip, `half`
 *            to either side), stones thrown up all along it
 */
export const CHOP_HIT = f(26);
export const CHOP_STRIKE = [f(24), f(26)] as const;
export const CHOP_SMEARED = (t: number): boolean => t > CHOP_STRIKE[0] + 1e-6 && t <= CHOP_STRIKE[1] + FR + 1e-6;
export const CHOP = { hit: CHOP_HIT, strike: CHOP_STRIKE, up: 0.4, long: 2.1, r: 1.3, from: 0.4, half: 0.7, split: 4.0, knock: 0.6, seen: 1.6 } as const;
const CHOP_NAME = 'The halberd chop';
const OVER_BODY: P = { px: -3.0, pz: R.pz + 1.0, yaw: -6, twist: -6, pitch: -8, bend: -9, side: 1, roll: 0, faceUp: 18, faceTilt: 0, faceTurn: 2, lk: 12, rk: -14 };
const OVER: P = elbowsTo(both(OVER_BODY, [7, -4, 66], -180, 52, [0.8, 0, 0.6]), [0.3, 0.8, -0.5], [0.2, -0.9, -0.3]);
const overShake = (k: number): P => ({ ...OVER, rhz: (OVER.rhz as number) + (k % 2 ? 0.9 : -0.5), rhy: (OVER.rhy as number) + (k % 2 ? -0.4 : 0.3), px: (OVER.px as number) - 0.3 * (k % 2), faceUp: 18 + (k % 2) });
/** Over the top: the hips driven forward and round first, the chest after, the halberd straight up before the head. */
const MID: P = elbowsTo(both({ px: 3.4, pz: R.pz - 0.8, yaw: 6, twist: -2, pitch: 9, bend: 1, side: 0, roll: 0, faceUp: 10, faceTilt: 0, faceTurn: 0, lk: 18, rk: -8 }, [15, -4, 62], 0, 72, leading(72)), [0.4, 0.8, -0.4], [0.3, -0.9, -0.3]);
/** THE BITE: its head in the floor before him, his body bent over it, the front knee given. */
const BITE_BODY: P = { px: 7.0, pz: R.pz - 4.2, yaw: 6, twist: 2, pitch: 26, bend: 16, side: 0, roll: 0, faceUp: -2, faceTilt: 0, faceTurn: -2, lk: 26, rk: -8 };
const BITE: P = elbowsTo(both(BITE_BODY, [22, -5, 31], 0, -22, leading(-22)), [0.2, 0.9, -0.5], [0.1, -0.9, -0.5]);
const tug = (dx: number, dz: number, del: number): P => elbowsTo(both({ ...BITE_BODY, px: 7.0 + dx, pz: (BITE_BODY.pz as number) + dz, pitch: 26 - dx * 1.5 }, [22 + dx, -5, 31 + dz], 0, -22 + del, leading(-22 + del)), [0.2, 0.9, -0.5], [0.1, -0.9, -0.5]);
const WRENCH: P = elbowsTo(both({ px: 3.4, pz: R.pz - 1.6, yaw: 4, twist: 0, pitch: 12, bend: 6, side: 0, roll: 0, faceUp: 6, faceTilt: 0, faceTurn: 0, lk: 16, rk: -8 }, [17, -6, 44], 0, 30, leading(30)), [0.2, 0.8, -0.6], [0.0, -0.9, -0.5]);
const UPRIGHT: P = elbowsTo(both({ px: 2.0, pz: R.pz - 0.6, yaw: 6, twist: 0, pitch: 4, bend: 4, side: 0, roll: 0, faceUp: 0, faceTilt: 0, faceTurn: 0, lk: 10, rk: -8 }, [11, -10, 46], 0, 80, [0, -1, 0]), [-0.4, 0.6, -0.8], [-0.4, -0.7, -0.7]);
function chopKeys(): Key3[] {
  const take: P = elbowsTo(both({ px: -0.6, pz: R.pz, yaw: -4, twist: -4, pitch: 2, bend: 3, side: 0, roll: 0, faceUp: 4, faceTilt: -2, faceTurn: 4, lk: 9, rk: -9 }, [11, -11, 48], -40, 84, [0, -1, 0]), [-0.2, 0.7, -1], [-0.4, -0.7, -0.7]);
  const heave: P = elbowsTo(both({ px: -1.8, pz: R.pz + 0.5, yaw: -8, twist: -8, pitch: -4, bend: -4, side: 1, roll: 0, faceUp: 12, faceTilt: 0, faceTurn: 4, lk: 10, rk: -12 }, [9, -7, 60], -150, 70, [0.6, 0, 0.8]), [0.1, 0.8, -0.6], [0.0, -0.9, -0.4]);
  // (the hold said again as over the top, for the way on from it: forward, and 128 degrees up)
  const as = { wAz: 0, wEl: 128 };
  return [
    { at: 0, pose: {} },
    { at: 0.14, pose: take, ease: 'io' },
    { at: 0.27, pose: heave, ease: 'io' },
    { at: CHOP.up, pose: OVER, ease: 'out' },
    { at: 0.48, pose: overShake(1), ease: 'io' },
    { at: 0.56, pose: overShake(2), ease: 'io' },
    { at: 0.64, pose: overShake(3), ease: 'io' },
    { at: 0.72, pose: overShake(4), ease: 'io' },
    { at: CHOP_STRIKE[0], pose: OVER, ease: 'io', as },
    { at: f(25), pose: MID, ease: 'lin' },
    { at: CHOP_HIT, pose: BITE, ease: 'lin' },
    { at: 0.98, pose: tug(-0.35, 0.3, 0.5), ease: 'out' },
    { at: 1.08, pose: tug(0, 0, 0.1), ease: 'io' },
    { at: 1.18, pose: tug(-0.5, 0.4, 0.8), ease: 'io' },
    { at: 1.36, pose: WRENCH, ease: 'io' },
    { at: 1.7, pose: UPRIGHT, ease: 'io' },
    { at: CHOP.long, pose: {}, ease: 'io' },
  ];
}
function chopFeet(): (t: number) => P {
  return footwork(B, {
    L: { start: L0, moves: [{ t0: 0.16, t1: 0.36, to: plantBy(L0, 9, 1, 6), lift: 3.0 }, { t0: 1.5, t1: 1.8, to: L0, lift: 2.6 }] },
    R: { start: R0, moves: [{ t0: CHOP_STRIKE[0], t1: CHOP_HIT, to: { ...R0, pitch: 20 } }, { t0: 1.4, t1: 1.62, to: R0 }] },
  });
}
/** The warning: its blade glinting pink and the Hush seeping harder, from as it goes up to just after the bite. */
const chopGlint = (t: number): number => (t < 0.1 || t > CHOP_HIT + 0.3 ? 0 : t < CHOP.up ? (t - 0.1) / (CHOP.up - 0.1) : t <= CHOP_HIT ? 1 : 1 - (t - CHOP_HIT) / 0.3);
const chopJaw = (t: number): number => (t < 0.3 ? 0.4 + 2 * t : t < CHOP_HIT + 0.3 ? 1 : 1 - 0.5 * Math.min(1, (t - CHOP_HIT - 0.3) / 0.5));

// =============================================================================================
// THE LANTERN THROW

/**
 * THE THROW'S NUMBERS (seconds from its start; tiles):
 *   wind-up  the lantern off his belt by 0.34 s; swung back low behind him, the body wound away, by 0.52 s; HELD, the lantern flaring,
 *            to 0.867 s (0.35 s)
 *   strike   TWO FRAMES, smeared: swung through (frame 27), lobbed (frame 28, 0.933 s: the clip's `hit`)
 *   wind-down  his arm up after it to 1.12 s; down by 1.4 s; another lantern from the back of his belt (1.6 s), hung at his hip by
 *            1.92 s; at rest 2.4 s
 *   ITS FLIGHT  `lobFly(d)` seconds to a place `d` tiles off, aimed where the hero stands as it leaves his hand; `lobArc(d)` picture
 *            pixels over the straight way; from `lobFrom()` (where it leaves his hand)
 *   THE SMASH  a hero within `burst` tiles as it lands is struck
 *   THE BURNING OIL  spreading out to `r` in `spread` s; burning `burn` s, dying down over its last `fade`; a hero in it burned tick by
 *            tick (the rules')
 *   near, far  thrown at a hero from 2 to 8 tiles off
 */
export const LOB_HIT = f(28);
export const LOB_STRIKE = [f(26), f(28)] as const;
export const LOB_SMEARED = (t: number): boolean => t > LOB_STRIKE[0] + 1e-6 && t <= LOB_STRIKE[1] + FR + 1e-6;
export const LOB = { hit: LOB_HIT, strike: LOB_STRIKE, off: 0.34, back: 0.52, long: 2.4, reload: 1.6, hung: 1.92, near: 2, far: 8 } as const;
export const POOL = { burst: 1.4, r: 1.9, spread: 0.35, burn: 6, fade: 1.0, smash: 0.5 } as const;
export const lobFly = (d: number): number => 0.5 + 0.06 * d;
export const lobArc = (d: number): number => 50 + 6 * d;
const LOB_NAME = 'The lantern throw';
/** The lantern's ring on his belt: behind his left hip (in his hips' own forward, left and up). */
const BELT: V3 = [-7.5, 12.0, 1.0];
const lh = (x: number, y: number, z: number): P => ({ lhIn: 2, lhx: x, lhy: y, lhz: z });
function lobKeys(): Key3[] {
  const ring0 = add([0, 0, 34.4 + R.pz], BELT);
  // (the halberd stood a little out from him while his left arm swings, so that his right arm keeps clear of it)
  const out = halberdPlanted([5.4, -14.0], 43, 4);
  const at = (body: P, hand: V3, want: V3): P => elbowsTo({ ...out, ...body, ...lh(hand[0] + ((body.px as number) ?? 0), hand[1], hand[2]) }, want, [-0.6, -0.4, -1]);
  const wound: P = { px: -2.6, pz: R.pz + 0.2, yaw: 12, twist: 14, pitch: -6, bend: -8, side: -2, roll: 0, faceUp: 14, faceTilt: -4, faceTurn: -4, lk: 13, rk: -8 };
  const back = (d: number): P => at({ ...wound, twist: 14 + d, faceUp: 14 + d * 0.5 }, [-9 - d * 0.3, 22, 68 + d * 0.5], [-0.9, 0.2, 0.3]);
  return [
    { at: 0, pose: {} },
    { at: 0.2, pose: at({ px: -0.4, pz: R.pz - 0.6, yaw: 6, twist: 6, pitch: 6, bend: 8, side: 1, faceTurn: 12, faceUp: -6 }, [ring0[0] + 0.6, ring0[1], ring0[2] + 1.2], [-0.3, 0.9, 0]), ease: 'io' },
    { at: LOB.off, pose: at({ px: -0.8, pz: R.pz - 0.6, yaw: 9, twist: 7, pitch: 5, bend: 6, side: 0, faceTurn: 2, faceUp: 0 }, [-6, 15, 42], [-0.3, 0.9, 0]), ease: 'io' },
    { at: LOB.back, pose: back(0), ease: 'out' },
    { at: 0.62, pose: back(1), ease: 'io' },
    { at: 0.72, pose: back(-0.6), ease: 'io' },
    { at: 0.8, pose: back(0.8), ease: 'io' },
    { at: LOB_STRIKE[0], pose: back(0), ease: 'io' },
    // (over the top: the hips first, then the chest, then the arm)
    { at: f(27), pose: at({ px: 1.6, pz: R.pz - 0.2, yaw: -4, twist: 2, pitch: 4, bend: 0, side: 0, roll: 0, faceUp: 18, faceTilt: 0, faceTurn: 0, lk: 12, rk: -8 }, [3, 14, 74], [0, 0.9, 0.4]), ease: 'lin' },
    { at: LOB_HIT, pose: at({ px: 4.2, pz: R.pz - 1.0, yaw: -8, twist: -12, pitch: 10, bend: 6, side: 0, roll: 0, faceUp: 16, faceTilt: 0, faceTurn: 0, lk: 16, rk: -8 }, [18, 10, 58], [0.3, 0.9, -0.2]), ease: 'lin' },
    { at: 1.12, pose: at({ px: 4.6, pz: R.pz - 1.4, yaw: -8, twist: -14, pitch: 16, bend: 12, side: 0, roll: 0, faceUp: 4, faceTilt: 0, faceTurn: 0, lk: 16, rk: -8 }, [17, 4, 36], [0.2, 0.9, -0.4]), ease: 'out' },
    { at: 1.4, pose: at({ px: 1.0, pz: R.pz - 0.4, yaw: 0, twist: -2, pitch: 4, bend: 4, side: 0, faceUp: 6, faceTurn: 0, lk: 10, rk: -8 }, [7, 14, 36], [-0.3, 0.9, -0.2]), ease: 'io' },
    // (another lantern from the back of his belt)
    { at: LOB.reload, pose: at({ px: 0.2, pz: R.pz - 0.4, yaw: 5, twist: 5, pitch: 6, bend: 6, side: 1, faceTurn: 16, faceUp: -4 }, [-11, 9, 37], [-0.6, 0.7, 0.1]), ease: 'io' },
    { at: LOB.hung, pose: at({ px: -0.4, pz: R.pz - 0.6, yaw: 6, twist: 6, pitch: 6, bend: 8, side: 1, faceTurn: 12, faceUp: -6 }, [ring0[0] + 0.6, ring0[1], ring0[2] + 1.2], [-0.3, 0.9, 0]), ease: 'io' },
    { at: LOB.long, pose: {}, ease: 'io' },
  ];
}
function lobFeet(): (t: number) => P {
  return footwork(B, {
    L: { start: L0, moves: [{ t0: 0.34, t1: 0.52, to: plantBy(L0, -6, 1.5, 14), lift: 2.6 }, { t0: f(27) - 0.02, t1: 1.1, to: plantBy(L0, 3, 0.5, 4), lift: 2.4 }, { t0: 1.9, t1: 2.2, to: L0, lift: 2.2 }] },
    R: { start: R0, moves: [{ t0: LOB_STRIKE[0], t1: LOB_HIT + 0.05, to: { ...R0, pitch: 16 } }, { t0: 1.3, t1: 1.5, to: R0 }] },
  });
}
/** The lantern flaring as he swings it back (the warning). */
export const lobFlare = (t: number): number => (t < LOB.off ? 0 : t < LOB.back ? (t - LOB.off) / (LOB.back - LOB.off) : t <= LOB_HIT ? 1 : 0);
const lobJaw = (t: number): number => (t < 0.4 ? 0.4 + 1.5 * t : t < LOB_HIT + 0.3 ? 1 : 1 - 0.5 * Math.min(1, (t - LOB_HIT - 0.3) / 0.5));

// =============================================================================================
// THE LANTERN ON HIM: on its ring at his belt, or in his left hand; hanging from its ring, swinging as it is swung

export const LANTERN = { bail: 3.4, long: 11, r: 3.0 } as const;
const KEY_OF = new Map<string, string>();
/** Where its ring is at a moment of a move (`null`: he has none then); and whether it is in his hand. */
export function ringOf(key: string, t: number, s: Skeleton): { ring: V3; hand: boolean } | null {
  if (key === 'lantern') {
    if (t > LOB_HIT + 1e-6 && t < LOB.reload - 1e-6) return null;
    if (t >= LOB.off - 0.04 && t <= LOB_HIT + 1e-6) return { ring: add(s.handL, [0, 0, -1.4]), hand: true };
    if (t >= LOB.reload - 1e-6 && t < LOB.hung) return { ring: add(s.handL, [0, 0, -1.4]), hand: true };
  }
  const h = s.hips;
  return { ring: add(s.pelvis, add(add(mul(h[0], BELT[0]), mul(h[1], BELT[1])), mul(h[2], BELT[2]))), hand: false };
}
/** Its way down from its ring at a moment (hanging, thrown back as its ring is swung on, a little). */
export function hangOf(mob: Mob, key: string, t: number, dying: boolean): V3 {
  const sk = (u: number): Skeleton => skeletonAt(mob, dying ? 'dying' : key, Math.max(0, u));
  const r0 = ringOf(key, t, sk(t));
  const r1 = ringOf(key, t - FR, sk(t - FR));
  const r2 = ringOf(key, t - 2 * FR, sk(t - 2 * FR));
  if (!r0 || !r1 || !r2 || t < 2 * FR) return [0, 0, -1];
  // (its ring's speeding: the lantern swings back from it)
  const acc = sub(sub(r0.ring, r1.ring), sub(r1.ring, r2.ring));
  const v = sub(r0.ring, r1.ring);
  const k = r0.hand ? 1 : 0.5;
  const d = add([0, 0, -1], add(mul(acc, -0.35 * k), mul(v, -0.12 * k)));
  return norm([d[0], d[1], Math.min(-0.25, d[2])]);
}
/** The lantern's points: its ring, the top of it, its middle, its foot. */
export function lanternPts(ring: V3, down: V3): { ring: V3; top: V3; mid: V3; foot: V3 } {
  let top = add(ring, mul(down, LANTERN.bail));
  let foot = add(top, mul(down, LANTERN.long));
  // (on the floor, it lies: never into it)
  if (foot[2] < LANTERN.r + 0.3) {
    const lift = LANTERN.r + 0.3 - foot[2];
    foot = add(foot, [0, 0, lift]);
    top = add(top, [0, 0, Math.min(lift, Math.max(0, LANTERN.r + 0.3 - top[2]))]);
  }
  return { ring, top, mid: lerp3(top, foot, 0.5), foot };
}
function putLantern(put: Put, ring: V3, down: V3, flare: number): void {
  const L = lanternPts(ring, down);
  const ax = norm(sub(L.foot, L.top));
  put('lantern', 'lantern', { k: 'rod', a: L.ring, b: L.top, ra: 0.5, rb: 0.5, ramp: LIRON });
  put('lantern', 'lantern', { k: 'rod', a: add(L.top, mul(ax, -0.6)), b: add(L.top, mul(ax, 1.4)), ra: 1.4, rb: LANTERN.r + 0.5, ramp: LIRON });
  put('lantern', 'lantern', { k: 'rod', a: add(L.top, mul(ax, 1.4)), b: add(L.foot, mul(ax, -1.2)), ra: LANTERN.r, rb: LANTERN.r, ramp: flare > 0.5 ? (['#9a4a18', '#d07a28', '#f0a848', '#ffd890', '#fff4d0'] as unknown as Ramp) : HORN });
  put('lantern', 'lantern', { k: 'rod', a: add(L.foot, mul(ax, -1.2)), b: L.foot, ra: LANTERN.r + 0.5, rb: LANTERN.r + 0.3, ramp: LIRON });
  put('lantern', 'glow', { k: 'glow', p: L.mid, c: OIL[4], r: 12 + 14 * flare, a: 0.22 + 0.25 * flare });
}

// =============================================================================================
// WHAT IS PAINTED ON HIM FOR THESE

function moreBits(mob: Mob, st: Stage, m: Moment): Bit[] {
  const bits: Bit[] = [];
  const put: Put = (part, piece, shape) => {
    bits.push({ part, piece, shape });
  };
  const t = m.t;
  const key = m.dying ? 'dying' : KEY_OF.get(m.move ?? '') ?? 'stand';
  const mote = (p: V3, c: string, size = 1): void => put('fx', 'fx', { k: 'mote', p, c, size });
  // the lantern, on him
  const r = ringOf(key, t, m.s);
  if (r) {
    const flare = key === 'lantern' ? lobFlare(t) : 0;
    putLantern(put, r.ring, hangOf(mob, key, t, !!m.dying), flare);
    if (flare > 0.1) {
      // (flaring: sparks of the oil-fire spat up out of its top, and the enemy's pink in them)
      const L = lanternPts(r.ring, hangOf(mob, key, t, false));
      for (let i = 0; i < 8; i++) {
        const u = (t * 2.5 + i / 8) % 1;
        if (hash(i, Math.floor(t * 2.5 + i / 8), 1101) > flare) continue;
        mote(add(L.top, [(hash(i, 1, 1103) - 0.5) * 6 * u, (hash(i, 2, 1103) - 0.5) * 6 * u, 1 + 9 * u]), i % 4 === 0 ? PINK[1] : u < 0.4 ? OIL[5] : OIL[3], u < 0.3 ? 2 : 1);
      }
    }
  }
  if (key === 'attack' && CHOP_SMEARED(t)) {
    const thin = Math.abs(t - CHOP_HIT - FR) < 1e-6;
    const lines: V3[][] = [[], [], [], []];
    for (let i = 0; i <= 8; i++) {
      const u = Math.min(t, CHOP_HIT) - (FR * 1.3 * i) / 8;
      const ss = skeletonAt(mob, 'attack', u);
      const h = halberdOf(ss, { draw: 0 });
      lines[0].push(h.tip);
      lines[1].push(h.at(HALBERD.bladeHi));
      lines[2].push(h.at(HALBERD.bladeLo));
      lines[3].push(h.at(HALBERD.socket - 8));
    }
    smearAlong(st, put, lines, thin, ['#3a3e48', '#6e7480', '#b8bcc6', '#eef0f4'], PINK[1]);
  }
  if (key === 'lantern' && LOB_SMEARED(t)) {
    const thin = Math.abs(t - LOB_HIT - FR) < 1e-6;
    const lines: V3[][] = [[], [], []];
    for (let i = 0; i <= 8; i++) {
      const u = Math.min(t, LOB_HIT) - (FR * 1.3 * i) / 8;
      const ss = skeletonAt(mob, 'lantern', u);
      lines[0].push(add(ss.handL, [0, 0, -1.4 - LANTERN.bail - LANTERN.long * 0.5]));
      lines[1].push(ss.handL);
      lines[2].push(lerp3(ss.handL, ss.elbowL, 0.5));
    }
    smearAlong(st, put, lines, thin, [OIL[1], OIL[2], OIL[4], OIL[6]], PINK[1]);
  }
  return bits;
}

const W_CANVAS2 = { w: 400, h: 320, ax: 190, ay: 226 } as const;
function lanternWatch(base: Mob): Mob {
  const mv = (name: string, motion: { keys: Key3[]; hit: number }, more: Partial<MobMove> = {}): MobMove => ({ name, motion, rest: R, ...more });
  const mob: Mob = {
    ...base,
    id: `${base.id}-lantern`,
    attack: mv(CHOP_NAME, { keys: chopKeys(), hit: CHOP_HIT }, { feet: chopFeet(), glint: chopGlint, jaw: chopJaw }),
    hit: CHOP_HIT,
    warn: CHOP_STRIKE[0] - CHOP.up,
    more: { lantern: mv(LOB_NAME, { keys: lobKeys(), hit: LOB_HIT }, { feet: lobFeet(), glint: (t) => 0.5 * lobFlare(t), jaw: lobJaw }) },
    canvas: W_CANVAS2,
    aura: { ...base.aura, x: base.aura.x - WATCH_CANVAS.ax + W_CANVAS2.ax, y: base.aura.y - WATCH_CANVAS.ay + W_CANVAS2.ay },
    bits: (st, m) => [...base.bits(st, m), ...moreBits(mob, st, m)],
  };
  for (const [k, v] of [['stand', base.stand], ['walk', base.walk], ['reel', base.reel], ['dying', base.dying]] as const) KEY_OF.set(v.name, k);
  KEY_OF.set(CHOP_NAME, 'attack');
  KEY_OF.set(LOB_NAME, 'lantern');
  return mob;
}
/** THE WATCHMAN AND THE SERGEANT WITH THE CHOP AND THE LANTERN THROW (WATCH_LANTERN): the game's own in all but these two and the lantern at the belt. */
export const LANTERN_WATCHMAN = lanternWatch(WATCHMAN);
export const LANTERN_SERGEANT = lanternWatch(WATCH_SERGEANT);
/** As the game holds a monster: the chop as `attack`, the lantern throw as `moves.lantern` (in place of `round`). */
export function makeLanternWatchArt(mob: Mob = LANTERN_WATCHMAN, pace = mob.pace): ActorArt {
  return { front: mobSet(mob, 'front', pace), back: mobSet(mob, 'back', pace) };
}
/** (for the checks: the game's own, for its frames) */
export const gameWatchArt = makeWatchArt3;

// =============================================================================================
// WHERE THE CHOP BITES, AND WHERE THE LANTERN GOES

/** Where its blade is in the floor at the bite (tiles before him, to his left). */
export function biteAt(): [number, number] {
  const s = skeletonAt(LANTERN_WATCHMAN, 'attack', CHOP_HIT);
  const e = halberdOf(s, { draw: 0 }).edge;
  return [e[0] / TILE3, e[1] / TILE3];
}
/** Where the lantern leaves his hand (tiles before him, to his left; and how high its middle is, picture pixels over the floor). */
export function lobFrom(): { x: number; y: number; z: number } {
  const s = skeletonAt(LANTERN_WATCHMAN, 'lantern', LOB_HIT);
  const p = s.handL;
  return { x: p[0] / TILE3, y: p[1] / TILE3, z: p[2] - 1.4 - LANTERN.bail - LANTERN.long / 2 };
}
/** Whether a hero `x` tiles before him and `y` to his left is in the bite or the split. */
export function chopStrikes(x: number, y: number): boolean {
  const [bx, by] = biteAt();
  return Math.hypot(x - bx, y - by) <= CHOP.r || (x >= CHOP.from && x <= CHOP.split && Math.abs(y - by) <= CHOP.half);
}

/** The bite's canvas (its anchor where the blade goes in). */
export const BITE_CANVAS = { w: 380, h: 260, ax: 140, ay: 120 } as const;
/**
 * THE BITE, `t` seconds after it (where the blade goes in), the way he faces `dx`, `dy` (tiles, a unit way on the floor):
 *   floor  the floor split from under the blade on along that way to `CHOP.split` tiles before him, jagged, gaping and black, its
 *          lips the enemy's pink as it opens; a ring of dust and grit out to `CHOP.r` round the bite; cracks fading by `CHOP.seen`
 *   air    the flash and sparks off the blade; stones and grit thrown up all along the split as it runs, falling; dust
 * (`side`, for the air: 'behind' before a figure there, 'before' after it.)
 */
export function bitePainted(t: number, layer: 'floor' | 'air', dx: number, dy: number, side: 'behind' | 'before' | 'all' = 'all'): { px: Px; lights: Light[] } {
  const C = BITE_CANVAS;
  const px = new Px(C.w, C.h);
  const lights: Light[] = [];
  if (t < 0 || t > CHOP.seen) return { px, lights };
  const dot2 = pen(px);
  const under = pen(px, true);
  const nx = -dy;
  const ny = dx;
  const [bx] = biteAt();
  const run = CHOP.split - bx;
  const at = (a: number, b: number): [number, number] => tileAt(C.ax, C.ay, dx * a + nx * b, dy * a + ny * b);
  const fade = 1 - smooth((t - (CHOP.seen - 0.5)) / 0.5);
  const ran = run * clamp01(t / 0.16);
  const onSide = (y: number): boolean => side === 'all' || (y > C.ay) === (side === 'before');
  if (layer === 'floor') {
    // the split: a jagged gaping line on along his way, widest near the bite
    for (let a = -0.25; a <= ran; a += 0.012) {
      const w = (0.1 * (1 - a / (run + 0.3)) + 0.035) * (0.6 + 0.4 * fade);
      const wob = 0.09 * Math.sin(a * 9.3 + 0.4) + 0.05 * Math.sin(a * 23 + 1.1) + 0.03 * (hash(Math.round(a * 40), 1, 1111) - 0.5);
      for (let b = -w; b <= w; b += 0.012) {
        const [x, y] = at(a, wob + b);
        dot2(x, y, Math.abs(b) > w * 0.6 ? STONE[1] : '#0c0a10');
      }
      // (its lips lit pink as it opens)
      if (hash(Math.round(a * 60), 2, 1113) < 0.75 * fade) for (const sd of [-1, 1]) {
        const [x, y] = at(a, wob + sd * (w + 0.02));
        under(x, y, t < 0.4 ? PINK[1] : PINK[0]);
        under(x, y + 1, STONE[3]);
      }
      // (forks off it)
      if (Math.round(a / 0.012) % 37 === 5) {
        const sd = hash(Math.round(a * 10), 3, 1115) < 0.5 ? -1 : 1;
        for (let k = 0; k < 0.4 * fade; k += 0.012) {
          const [x, y] = at(a + k * 0.6, wob + sd * (w + k));
          dot2(x, y, '#0c0a10');
        }
      }
    }
    // cracks starring out of the bite
    for (let i = 0; i < 9; i++) {
      const a0 = (i / 9) * TAU + hash(i, 1, 1117);
      const L = CHOP.r * (0.4 + 0.5 * hash(i, 2, 1117)) * clamp01(t / 0.1);
      for (let u = 0.05; u < L; u += 0.012) {
        const a = a0 + 0.25 * Math.sin(u * 7 + i);
        const [x, y] = at(Math.cos(a) * u, Math.sin(a) * u);
        if (hash(Math.round(x), Math.round(y), 1119) < 1 - fade) continue;
        dot2(x, y, u < L * 0.5 ? '#0c0a10' : STONE[0]);
      }
    }
    // the ring of dust and grit going out to its reach, its leading edge pink
    if (t < 0.45) {
      const k = 1 - (1 - clamp01(t / 0.2)) ** 2;
      markRing(px, C.ax, C.ay, CHOP.r * k, 1, [PINK[0], PINK[1], PINK[2]], 0.3);
      for (let i = 0; i < 160; i++) {
        const a = hash(i, 1, 1121) * TAU;
        const d = CHOP.r * k * (0.6 + 0.4 * Math.sqrt(hash(i, 2, 1121)));
        const [x, y] = at(Math.cos(a) * d, Math.sin(a) * d);
        if (hash(i, 3, 1121) < t / 0.45) continue;
        under(x, y, i % 3 ? STONE[3] : STONE[2]);
      }
    }
    return { px, lights };
  }
  // --- the air ---
  if (t < 0.07 && side !== 'behind') {
    blob(dot2, C.ax, C.ay - 3, 4 + 4 * (1 - t / 0.07), '#fff6e8');
    for (let i = 0; i < 14; i++) {
      const a = -Math.PI * (0.1 + 0.8 * hash(i, 1, 1123));
      const L = 8 + 18 * hash(i, 2, 1123);
      for (let s = 2; s < L; s++) dot2(C.ax + Math.cos(a) * s, C.ay - 3 + Math.sin(a) * s, s < L * 0.4 ? '#fff6e8' : i % 3 ? OIL[5] : PINK[1]);
    }
    lights.push({ x: C.ax, y: C.ay - 6, r: 60, color: OIL[5], a: 0.4 });
  }
  // stones and grit thrown up all along the split as it runs, falling
  for (let i = 0; i < 70; i++) {
    const a = hash(i, 1, 1125) * run;
    const t0 = (a / Math.max(0.01, run)) * 0.16;
    const s = t - t0;
    if (s < 0 || s > 0.55) continue;
    const b = (hash(i, 2, 1125) - 0.5) * 0.5;
    const [x, y] = at(a + b * 0.3, b);
    if (!onSide(y)) continue;
    const up = (60 + 80 * hash(i, 3, 1125)) * s - 260 * s * s;
    if (up < 0) continue;
    const sz = i % 4 === 0 ? 2 : 1;
    for (let q = 0; q < sz * sz; q++) dot2(x + (q % sz) + b * 20 * s, y - up + Math.floor(q / sz), i % 5 === 0 ? PINK[1] : i % 2 ? STONE[4] : STONE[3]);
  }
  // dust rising off it
  if (t < 0.8) for (let i = 0; i < 40; i++) {
    const a = hash(i, 1, 1127) * run * clamp01(t / 0.16);
    const [x, y] = at(a, (hash(i, 2, 1127) - 0.5) * 0.5);
    if (!onSide(y)) continue;
    const u = t / 0.8;
    if (hash(i, 3, 1127) < u) continue;
    blob(under, x + (hash(i, 4, 1127) - 0.5) * 8 * u, y - 4 - 16 * u * hash(i, 5, 1127), 1.5 + 2 * u, i % 2 ? STONE[2] : STONE[3], 0.4, 1129);
  }
  return { px, lights };
}

/** The lantern in flight's picture (its anchor at its middle), `t` seconds after it leaves his hand: tumbling, its flame streaming. */
export const FLY_CANVAS = { w: 64, h: 64, ax: 32, ay: 32 } as const;
export function lanternFlying(t: number): { px: Px; lights: Light[] } {
  const C = FLY_CANVAS;
  const px = new Px(C.w, C.h);
  const dot2 = pen(px);
  const a = t * 9;
  const ca = Math.cos(a);
  const sa = Math.sin(a);
  // (its body, its caps, its bail: a little box of iron and horn, turning over)
  const put = (u: number, v: number, c: string): void => dot2(C.ax + u * ca - v * sa, C.ay + u * sa + v * ca, c);
  for (let v = -9; v <= 9; v += 0.5) {
    for (let u = -5; u <= 5; u += 0.5) {
      const cap = Math.abs(v) > 6.5;
      const rib = Math.abs(Math.abs(u) - 4.6) < 0.5 || Math.abs(u) < 0.4;
      const edge = Math.abs(u) > 4.6 || Math.abs(v) > 8.5;
      put(u, v, edge ? PINK[2] : cap ? (u < 0 ? LIRON[3] : LIRON[2]) : rib ? LIRON[1] : Math.abs(v) < 2.5 && Math.abs(u) < 2.2 ? OIL[6] : u < 0 ? HORN[4] : HORN[3]);
    }
  }
  for (let k = 0; k <= 8; k++) put(Math.cos((k / 8) * Math.PI) * 3.6, -9 - Math.sin((k / 8) * Math.PI) * 3.6, LIRON[3]);
  // (its flame streaming out of its top, back along the way it flies)
  for (let i = 0; i < 40; i++) {
    const u = i / 40;
    for (const w of [-1, 0, 1]) dot2(C.ax - 16 * u - 4 + Math.sin(i * 1.7 + t * 20) * 3 * u + w * (1 - u), C.ay - 6 + 12 * u + Math.cos(i * 1.3) * 3 * u + w, u < 0.3 ? OIL[5] : u < 0.6 ? OIL[4] : i % 3 ? OIL[3] : PINK[1]);
  }
  return { px, lights: [{ x: C.ax, y: C.ay, r: 40, color: OIL[4], a: 0.5 }] };
}

/** The burning oil's canvas (its anchor where the lantern smashes). */
export const OIL_CANVAS = { w: 360, h: 280, ax: 180, ay: 150 } as const;
/** The pool's ragged edge: how far out along a way `a` it reaches (tiles), `t` seconds after it smashes. */
const poolEdge = (a: number, t: number): number => {
  const grow = 1 - (1 - clamp01(t / POOL.spread)) ** 2;
  return POOL.r * grow * (1 + 0.09 * Math.sin(a * 5 + 0.7) + 0.06 * Math.sin(a * 11 + 2.1) + 0.03 * Math.sin(a * 17 + t * 0.6));
};
/** Whether a point `x`, `y` tiles from where it smashed is in the burning oil `t` seconds after. */
export const inOil = (x: number, y: number, t: number): boolean => t >= 0 && t <= POOL.burn && Math.hypot(x, y) <= poolEdge(Math.atan2(y, x), t);
function flameTongue(dot2: (x: number, y: number, c: string) => void, x: number, y: number, h: number, ph: number, hot: number): void {
  const n = Math.max(2, Math.round(h));
  for (let i = 0; i < n; i++) {
    const u = i / n;
    const w = Math.max(0, Math.round((1 - u) * (1.6 + h * 0.13) * (0.7 + 0.3 * Math.sin(ph * 2 + u * 5))));
    const sway = Math.sin(ph + u * 3.2) * u * 1.8;
    for (let j = -w; j <= w; j++) dot2(x + j + sway, y - i, u < 0.22 * hot ? OIL[6] : u < 0.45 ? OIL[5] : u < 0.7 ? OIL[4] : u < 0.88 ? OIL[3] : OIL[2]);
  }
}
/**
 * WHERE THE LANTERN SMASHES, `t` seconds after it does:
 *   floor  THE OIL spreading out over the floor to `POOL.r` in `POOL.spread`, black and glistening, burning: a carpet of tongues of the
 *          oil-fire, tall at its ragged edge, the floor scorched under it, embers rising, its edge dotted with the enemy's pink; for
 *          `POOL.burn` seconds, dying down over its last `fade`
 *   air    the smash: a flash; the horn and the iron of it flung out; a ball of the oil-fire bursting up and out to `POOL.burst`,
 *          rolling up and darkening into smoke; gone by `POOL.smash`. By halves (`side`): 'behind' before a figure there, 'before' after.
 */
export function oilPainted(t: number, layer: 'floor' | 'air', side: 'behind' | 'before' | 'all' = 'all'): { px: Px; lights: Light[] } {
  const C = OIL_CANVAS;
  const px = new Px(C.w, C.h);
  const lights: Light[] = [];
  if (t < 0 || t > POOL.burn) return { px, lights };
  const at = (x: number, y: number): [number, number] => tileAt(C.ax, C.ay, x, y);
  const dot2 = pen(px);
  const under = pen(px, true);
  const fierce = t < 0.1 ? 1 : 1 - smooth((t - (POOL.burn - POOL.fade)) / POOL.fade) * 0.96;
  if (layer === 'floor') {
    // the tongues: a carpet of them, each on its own spot of the oil, taller toward the edge
    const flames: [number, number, number, number][] = [];
    for (let i = 0; i < 240; i++) {
      const a = hash(i, 1, 1131) * TAU;
      const e = Math.sqrt(hash(i, 2, 1131));
      const d = e * poolEdge(a, t) * 0.96;
      const [x, y] = at(Math.cos(a) * d, Math.sin(a) * d);
      const ph = t * (7 + 4 * hash(i, 3, 1131)) + hash(i, 4, 1131) * TAU;
      const h = (5 + 10 * hash(i, 5, 1131) + (e > 0.7 ? 8 : 0)) * fierce * (0.55 + 0.45 * Math.sin(ph * 0.7 + i)) * clamp01(t / 0.08 + 0.3);
      if (h > 1.4 && hash(i, 6, 1131) < 0.35 + 0.65 * fierce) flames.push([x, y, h, ph]);
    }
    flames.sort((p, q) => p[1] - q[1]);
    for (const [x, y, h, ph] of flames) flameTongue(dot2, x, y, h, ph, fierce);
    // the oil under it: black, glistening, scorching the floor; glowing where it burns hottest
    for (let Y = 0; Y < C.h; Y++) {
      for (let X = 0; X < C.w; X++) {
        const dx = X + 0.5 - C.ax;
        const dy = Y + 0.5 - C.ay;
        const fx = (dx / 32 + dy / 16) / 2;
        const fy = (dy / 16 - dx / 32) / 2;
        const d = Math.hypot(fx, fy);
        const edge = poolEdge(Math.atan2(fy, fx), t);
        if (d > edge) continue;
        const g = hash(X >> 1, Y >> 1, 1133 + Math.floor(t * 8));
        under(X, Y, d > edge * 0.94 ? '#120806' : g < 0.18 * fierce ? OIL[2] : g < 0.3 * fierce ? OIL[1] : hash(X, Y, 1135) > 0.93 ? '#4a3a30' : (X + Y) % 3 ? '#1a0c08' : '#24120a');
      }
    }
    // its edge: the enemy's pink, dotted, so that where it burns is seen
    if (fierce > 0.25 && t > POOL.spread * 0.8) {
      for (let a = 0; a < TAU; a += 0.018) {
        if (Math.round(a / 0.018) % 4 >= 2) continue;
        const r = poolEdge(a, t) * 1.04;
        const [x, y] = at(Math.cos(a) * r, Math.sin(a) * r);
        under(x, y, PINK[0]);
        under(x, y + 1, PINK[2]);
      }
    }
    // embers and smoke rising off it
    for (let i = 0; i < 26; i++) {
      const life = 0.7 + 0.6 * hash(i, 11, 1137);
      const u = (t / life + hash(i, 12, 1137)) % 1;
      const n = Math.floor(t / life + hash(i, 12, 1137));
      const a = hash(i, 13, 1137 + n) * TAU;
      const d = Math.sqrt(hash(i, 14, 1137 + n)) * POOL.r * 0.9;
      const [x, y] = at(Math.cos(a) * d, Math.sin(a) * d);
      if (fierce > 0.15 && hash(i, 15, 1137) < fierce) dot2(x + Math.sin(u * 7 + i) * 3, y - 6 - u * 34, u < 0.4 ? OIL[5] : u < 0.7 ? OIL[3] : i % 3 ? '#3a2c28' : PINK[0]);
    }
    if (fierce > 0.1) lights.push({ x: C.ax, y: C.ay - 8, r: 60 + 40 * POOL.r, color: OIL[4], a: 0.35 * fierce });
    return { px, lights };
  }
  // --- the air: the smash ---
  if (t > POOL.smash) return { px, lights };
  const k = t / POOL.smash;
  const onSide = (y: number): boolean => side === 'all' || (y > C.ay) === (side === 'before');
  if (t < 0.07 && side !== 'behind') {
    blob(dot2, C.ax, C.ay - 8, 6 + 8 * (1 - t / 0.07), OIL[6]);
    lights.push({ x: C.ax, y: C.ay - 12, r: 120, color: OIL[5], a: 0.6 });
  }
  const balls: [number, number, number, string][] = [];
  for (let i = 0; i < 50; i++) {
    const a = hash(i, 1, 1141) * TAU;
    const far = POOL.burst * (0.2 + 0.8 * Math.sqrt(hash(i, 2, 1141)));
    const go = 1 - (1 - clamp01(k * 2.4)) ** 3;
    const d = far * go;
    const [x, y] = at(Math.cos(a) * d, Math.sin(a) * d);
    if (!onSide(y)) continue;
    const up = (6 + 60 * hash(i, 3, 1141) * (1 - d / (POOL.burst * 1.1))) * Math.sqrt(k) + 4;
    const size = (4 + 8 * hash(i, 4, 1141)) * (1 - k * 0.55) * (k < 0.08 ? k / 0.08 : 1);
    const col = k < 0.3 ? (i % 3 ? OIL[5] : OIL[6]) : k < 0.55 ? (i % 4 === 0 ? PINK[1] : i % 3 ? OIL[4] : OIL[3]) : k < 0.7 ? (i % 2 ? OIL[2] : '#4a3430') : i % 2 ? '#3a2e2c' : '#2c2426';
    balls.push([x, y - up, size, col]);
  }
  balls.sort((p, q) => q[2] - p[2]);
  for (const [x, y, s, c] of balls) blob(under, x, y, s, c, k > 0.7 ? 0.5 : 0.1, 1143);
  // the horn and the iron of it flung out, falling
  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * TAU + hash(i, 1, 1145);
    const d = POOL.burst * (0.4 + 0.7 * hash(i, 2, 1145)) * Math.min(1, k * 2);
    const [x, y] = at(Math.cos(a) * d, Math.sin(a) * d);
    if (!onSide(y)) continue;
    const up = 40 * Math.sin(Math.PI * Math.min(1, k * 1.5)) * hash(i, 3, 1145);
    dot2(x, y - up, i % 3 ? HORN[3] : LIRON[3]);
    dot2(x + 1, y - up, i % 3 ? HORN[2] : LIRON[2]);
  }
  if (side !== 'behind') lights.push({ x: C.ax, y: C.ay - 26, r: 100 + 40 * k, color: OIL[4], a: 0.5 * (1 - k) });
  return { px, lights };
}
/** The lantern's shadow on the floor under it in flight (`k` 0 to 1 through its flight), its anchor under it. */
export const SHADOW_CANVAS = { w: 40, h: 24, ax: 20, ay: 12 } as const;
export function lanternShadow(k: number): Px {
  const C = SHADOW_CANVAS;
  const px = new Px(C.w, C.h);
  const rx = 4 + 7 * clamp01(k);
  for (let j = -6; j <= 6; j++) for (let i = -14; i <= 14; i++) {
    const e = (i / rx) ** 2 + (j / (rx * 0.45)) ** 2;
    if (e > 1) continue;
    if (((i + j) & 1) === 0 || k > 0.75) px.set(C.ax + i, C.ay + j, '#0e0a10');
  }
  return px;
}
void stage;
void FLAME;
export type { GameView };
