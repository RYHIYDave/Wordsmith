// FLOOR 16'S PALACE GUARD: THEIR MOVES (the art chat, 28 Oct 2026). A MOCK-UP: NOT IN THE GAME, behind GUARD_ON
// (art/palace_guard.ts, off). Their look and his brief are art/palace_guard.ts.
//
// THEIR MOVES (the partisan guard's and the sword guard's alike, each with his own weapon):
//   STANDING: at attention at their post, chin up; the partisan stood at the right side, or the sword held upright before
//     the right shoulder and the shield at the left; breathing, the weight shifting a little, the Hush leaking from the slit.
//   THE MARCH (his pick, “March in step (Recommended)”): stiff and drilled, upright, the knees brought up and the boots
//     stamped down, the weapon carried upright.
//   THE LONG THRUST (their first blow, his pick “Long thrust, wide sweep (Recommended)”): the weapon brought down level
//     and drawn back, its point glinting pink, held shaking (THE WARNING); then hips first, a lunge, the point thrust out
//     at you its whole length; carried on; drawn back and stood again.
//   THE WIDE SWEEP (their second blow, the bigger): the weapon heaved up and raised high over the right shoulder, the
//     body wound round, held shaking, its blade glinting pink (THE WARNING); then hips first, a step in, swept round low
//     before them from their right to their left; carried on round; brought back up and stood again.
//   STRUCK: jolted back, the plume tossing, the Hush coughed out of the slit.
//   TO ONE KNEE, THEN A CRASH (his pick, “To one knee, then a crash (Recommended)”): rocked back; a gasp, the head thrown
//     back, the Hush pouring out of the slit in one great grey breath; the weapon drops; the right knee goes down, the left
//     foot planted before them, and they hold there a moment, swaying; then the other knee gives and they crash forward
//     onto the floor and lie still.
//
// By his rulebook: every move through every check the bosses have (art/boss_checks.ts), from in front and behind.
//   test: tsx --test tests/palace_guard.test.ts

import { footwork, kneelHips, plantBy, plantOf } from './bosses3';
import type { Plant } from './bosses3';
import type { BossShape, CheckLimb, CheckLump, CheckThing } from './boss_checks';
import type { ActorArt } from './actor_types';
import { GUARD_BODY, GUARD_CANVAS, PARTISAN, guardPainter, partisanGrip, partisanOf, partisanPlanted, shieldOf, swordGrip, swordOf } from './palace_guard';
import type { GuardWho } from './palace_guard';
import { TILE3, mobSet } from './new_mobs3';
import type { Mob, MobMove, Moment } from './new_mobs3';
import { add, dot, elbowFor, heading, len, lerp3, mul, norm, solve, standing, sub } from './skeleton';
import type { Bones, Key3, Motion, Posed, Skeleton, V3 } from './skeleton';

type P = Partial<Bones>;
const B = GUARD_BODY;
const fr = (t: number): number => t - Math.floor(t);

// =============================================================================================
// THEIR REST: AT ATTENTION

const BASE: Bones = {
  ...standing(B),
  pz: -0.3, pitch: 0, bend: -1, roll: 0, side: 0, faceUp: 4, faceTilt: 0, faceTurn: 0,
  lfx: 0.8, lfy: 1.2, lft: 10, lk: 7, rfx: -0.4, rfy: -1.2, rft: -10, rk: -7,
  pt: 0, out: 0, pAz: 0, pEl: 0,
} as Bones;
/** The partisan guard at attention: the partisan stood at his right side, upright; his left arm straight down at his side. */
const PART0: Bones = { ...BASE, lhIn: 1, lhx: 2.5, lhy: 2.2, lhz: -24, le: -6, ...partisanPlanted([4.4, -12.6], 43, 2) } as Bones;
export const PARTISAN_REST: Bones = { ...PART0, re: elbowFor(B, PART0 as Posed, false, norm([-0.7, -0.05, -1])) };
/** The sword guard at attention: the sword held upright before his right shoulder, the shield on his left arm at his side, facing out. */
const SWORD_HAND: V3 = [7.5, -9.0, 38];
const SWORD0: Bones = { ...BASE, ...swordGrip(SWORD_HAND, heading(0, 84), [0, 1, 0]), lhIn: 1, lhx: 8, lhy: 2.5, lhz: -12.5, pAz: -16, pEl: 2 } as Bones;
export const SWORD_REST: Bones = {
  ...SWORD0,
  le: elbowFor(B, SWORD0 as Posed, true, norm([-0.4, 0.7, -0.6])),
  re: elbowFor(B, { ...SWORD0, le: elbowFor(B, SWORD0 as Posed, true, norm([-0.4, 0.7, -0.6])) } as Posed, false, norm([-0.3, -0.8, -0.5])),
};
const restOf = (who: GuardWho): Bones => (who === 'partisan' ? PARTISAN_REST : SWORD_REST);
const R = PARTISAN_REST;
const L0 = plantOf(B, 'L', {}, R);
const R0 = plantOf(B, 'R', {}, R);

function elbowsTo(rest: Bones, pose: P, wantL: V3 | null, wantR: V3 | null): P {
  const q = { ...rest, ...pose } as Posed;
  const le = wantL ? elbowFor(B, q, true, norm(wantL)) : q.le;
  const re = wantR ? elbowFor(B, { ...q, le } as Posed, false, norm(wantR)) : q.re;
  return { ...pose, le, re };
}

// =============================================================================================
// STANDING

export const GUARD_STAND_LONG = 3.2;
function guardStand(who: GuardWho): Motion {
  const rest = restOf(who);
  const T = GUARD_STAND_LONG;
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
        pz: rest.pz + 0.8 * breath,
        py: 0.9 * Math.sin(a),
        roll: rest.roll + 1.6 * Math.sin(a),
        bend: rest.bend - 1.8 * breath,
        pitch: rest.pitch + 0.8 * Math.sin(a + 1.2),
        faceUp: rest.faceUp + 2 * Math.sin(a + 0.4),
        faceTilt: rest.faceTilt + 2 * Math.sin(a + 2.0),
        faceTurn: rest.faceTurn + 5 * Math.sin(a * 0.5 + 0.8),
        lhx: rest.lhx + 0.5 * Math.sin(a + 0.4),
        lhz: rest.lhz + 0.4 * breath,
      },
    });
  }
  return { loop: 0, keys };
}

// =============================================================================================
// THE MARCH (his pick, “March in step (Recommended)”)

export const GD_PACE = 0.8;
export const GD_WALK = { frames: 12, fps: 10 } as const;
/** A foot of the march: down and carried back under him; then brought up high at the knee and stamped down. */
function stepFoot(k: number, n: number, step: number, lift: number): [number, number, number] {
  const half = n / 2;
  if (k <= half) return [step * (half / 2 - k), 0, 0];
  const u = (k - half) / half;
  const g = u * u * (3 - 2 * u);
  return [-step * (half / 2) + step * half * g, lift * Math.sin(Math.PI * u), 10 * Math.sin(Math.PI * u) * (1 - u) - 4 * Math.sin(Math.PI * u) * u];
}
/** The partisan carried upright at the right side, its butt off the floor; the sword at the carry. */
const CARRY_P = (dx: number, dz: number): P => partisanGrip([4.6 + dx, -12.6, 46 + dz], heading(0, 86), [0, 1, 0], PARTISAN_REST.draw, null);
const CARRY_S = (dx: number, dz: number): P => swordGrip([SWORD_HAND[0] + dx, SWORD_HAND[1], SWORD_HAND[2] + dz], heading(0, 84), [0, 1, 0]);
function guardMarch(who: GuardWho): Motion {
  const rest = restOf(who);
  const n = GD_WALK.frames;
  const d = (GD_PACE * TILE3) / GD_WALK.fps;
  const keys: Key3[] = [];
  for (let i = 0; i <= n; i++) {
    const j = i % n;
    const a = (j / n) * Math.PI * 2;
    const [lx, lz, lp] = stepFoot(j, n, d, 6.0);
    const [rx, rz, rp] = stepFoot((j + n / 2) % n, n, d, 6.0);
    // (upright and stiff: the body rising onto each foot as it stamps down, hardly rolling; the weapon steady)
    const sag = Math.abs(Math.sin(a));
    const body: P = {
      pz: rest.pz - 1.0 * sag, py: 0.9 * Math.sin(a), roll: rest.roll + 2 * Math.sin(a), yaw: 2 * Math.cos(a), side: rest.side + 0.8 * Math.sin(a),
      bend: rest.bend + 0.6 * sag, pitch: rest.pitch + 1, faceUp: rest.faceUp, faceTilt: rest.faceTilt + 2 * Math.sin(a), faceTurn: rest.faceTurn + 1.5 * Math.cos(a),
      lfx: lx, lfz: lz, lfp: lp, lfy: rest.lfy, lft: rest.lft,
      rfx: rx, rfz: rz, rfp: rp, rfy: rest.rfy, rft: rest.rft,
    };
    const pose =
      who === 'partisan'
        ? elbowsTo(rest, { ...body, ...CARRY_P(0.6 * Math.sin(a), -0.9 * sag), lhIn: 1, lhx: rest.lhx + 2.4 * Math.sin(a + Math.PI), lhy: rest.lhy, lhz: rest.lhz + 0.5 * sag }, null, [-0.7, -0.05, -1])
        : elbowsTo(rest, { ...body, ...CARRY_S(0.5 * Math.sin(a), -0.8 * sag), lhIn: 1, lhx: rest.lhx + 1.2 * Math.sin(a + Math.PI), lhy: rest.lhy, lhz: rest.lhz + 0.4 * sag }, [-0.4, 0.7, -0.6], [-0.3, -0.8, -0.5]);
    keys.push({ at: i / GD_WALK.fps, ease: 'lin', pose });
  }
  return { keys, loop: 0 };
}

// =============================================================================================
// THE LONG THRUST (their first blow)

/** Their first blow: how long; when the point is thrust out (a frame of the game's thirty a second); the warning, held from and to. */
export const GD_THRUST = { long: 1.5, hit: 20 / 30, warn: [0.28, 0.48] } as const;
const HT = GD_THRUST.hit;
/** Both hands on the partisan, the right at its butt end: the body as `body` says, the right hand at `hand` (from the pelvis's place over the floor), pointing `az`, `el`. */
const bothP = (body: P, hand: V3, az: number, el: number): P => ({ ...body, ...partisanGrip([hand[0] + ((body.px as number) ?? 0), hand[1] + ((body.py as number) ?? 0), hand[2]], heading(az, el), [0, 0, 1], 0, 12) });
const P_TAKE: P = elbowsTo(R, bothP({ px: -0.4, pz: R.pz, yaw: -4, twist: -4, pitch: 4, bend: 3, side: 0, roll: 0, faceUp: 6, faceTilt: -2, faceTurn: 4, lk: 9, rk: -9 }, [2, -9, 37], 6, 10), [-0.1, 0.9, -0.5], [-0.6, -0.6, -0.5]);
const P_DRAWN: P = elbowsTo(R, bothP({ px: -2.8, pz: R.pz + 0.3, yaw: -12, twist: -8, pitch: 1, bend: 0, side: 1, roll: -1, faceUp: 8, faceTilt: 0, faceTurn: 8, lk: 12, rk: -12 }, [-8, -10, 37.5], 6, 7), [0.1, 0.7, -0.7], [-0.7, -0.5, -0.4]);
const shakeP = (k: number): P => ({ ...P_DRAWN, rhz: (P_DRAWN.rhz as number) + (k % 2 ? 0.7 : -0.4), rhy: (P_DRAWN.rhy as number) + (k % 2 ? -0.35 : 0.25), px: (P_DRAWN.px as number) - 0.2 * (k % 2), rhx: (P_DRAWN.rhx as number) - 0.2 * (k % 2) });
const P_DRIVE: P = elbowsTo(R, bothP({ px: 2.2, pz: R.pz - 0.8, yaw: 2, twist: -12, pitch: 7, bend: 2, side: 1, roll: 0, faceUp: 6, faceTilt: 0, faceTurn: 4, lk: 14, rk: -8 }, [-4.5, -9.5, 37.5], 5, 5), [0.1, 0.7, -0.7], [-0.7, -0.5, -0.4]);
const P_THRUST: P = elbowsTo(R, bothP({ px: 6.6, pz: R.pz - 2.6, yaw: 8, twist: 6, pitch: 13, bend: 7, side: -1, roll: 1, faceUp: 10, faceTilt: 0, faceTurn: -2, lk: 24, rk: -4 }, [10, -5, 39], 3, -2), [0, 0.6, -0.8], [-0.3, -0.7, -0.6]);
const P_OVER: P = elbowsTo(R, bothP({ px: 9.8, pz: R.pz - 3.1, yaw: 9, twist: 8, pitch: 16, bend: 10, side: -1, roll: 1, faceUp: 10, faceTurn: -2, lk: 27, rk: -3 }, [12, -5, 40], 2, -4), [0, 0.6, -0.8], [-0.2, -0.7, -0.6]);
const P_UP: P = elbowsTo(R, { px: 2.4, pz: R.pz - 0.8, yaw: 3, twist: 0, pitch: 4, bend: 3, side: 0, roll: 0, faceUp: 4, faceTilt: 0, faceTurn: 2, lk: 10, rk: -8, ...partisanGrip([7, -11.5, 42], heading(0, 72), [0, 1, 0], 0.3, null), lhIn: 1, lhx: 8, lhy: 3, lhz: -17 }, [-0.1, 1, -0.4], [-0.5, -0.7, -0.7]);
/** The left hand let go of it and gone back to his side, the partisan near upright in the right. */
const P_LET: P = elbowsTo(R, { px: 1.0, pz: R.pz - 0.3, yaw: 1, twist: 0, pitch: 2, bend: 1, side: 0, roll: 0, faceUp: 4, faceTilt: 0, faceTurn: 1, lk: 8, rk: -8, ...partisanGrip([5.6, -12, 43], heading(0, 84), [0, 1, 0], R.draw, null), lhIn: 1, lhx: 5, lhy: 5, lhz: -19 }, [-0.1, 1, -0.4], [-0.6, -0.4, -0.7]);
function partisanThrust(): Motion {
  return {
    hit: HT,
    keys: [
      { at: 0, pose: {} },
      { at: 0.14, pose: P_TAKE, ease: 'io' },
      { at: GD_THRUST.warn[0], pose: P_DRAWN, ease: 'out' },
      { at: 0.34, pose: shakeP(1), ease: 'io' },
      { at: 0.41, pose: shakeP(2), ease: 'io' },
      { at: GD_THRUST.warn[1], pose: shakeP(3), ease: 'io' },
      { at: HT - 0.1, pose: P_DRIVE, ease: 'in' },
      { at: HT, pose: P_THRUST, ease: 'lin' },
      { at: HT + 0.1, pose: P_OVER, ease: 'out' },
      { at: 1.0, pose: P_UP, ease: 'io' },
      { at: 1.24, pose: P_LET, ease: 'io' },
      { at: GD_THRUST.long, pose: {}, ease: 'io' },
    ],
  };
}
/** The sword guard's thrust: the sword brought down to his hip, point forward, the shield before him; drawn back; then a lunge, the sword thrust out past the shield's edge, the shield swung aside. */
const swordIn = (body: P, hand: V3, az: number, el: number): P => ({ ...body, ...swordGrip([hand[0] + ((body.px as number) ?? 0), hand[1] + ((body.py as number) ?? 0), hand[2]], heading(az, el), [0, 0, 1]) });
const S = SWORD_REST;
const guardL = (x: number, y: number, z: number, pAz: number): P => ({ lhIn: 1, lhx: x, lhy: y, lhz: z, pAz, pEl: 4 });
const S_TAKE: P = elbowsTo(S, { ...swordIn({ px: -0.4, pz: S.pz, yaw: -4, twist: -4, pitch: 4, bend: 3, side: 0, roll: 0, faceUp: 6, faceTilt: 0, faceTurn: 4, lk: 9, rk: -9 }, [3, -10, 37], 2, 6), ...guardL(9, -4, -14, 4) }, [0.2, 0.9, -0.4], [-0.5, -0.7, -0.5]);
const S_DRAWN: P = elbowsTo(S, { ...swordIn({ px: -2.6, pz: S.pz + 0.3, yaw: -12, twist: -8, pitch: 1, bend: 0, side: 1, roll: -1, faceUp: 8, faceTilt: 0, faceTurn: 8, lk: 12, rk: -12 }, [-6, -11, 37.5], 2, 5), ...guardL(9.5, -4, -13, 2) }, [0.2, 0.9, -0.4], [-0.7, -0.5, -0.4]);
const shakeS = (k: number): P => ({ ...S_DRAWN, rhz: (S_DRAWN.rhz as number) + (k % 2 ? 0.7 : -0.4), rhy: (S_DRAWN.rhy as number) + (k % 2 ? -0.35 : 0.25), px: (S_DRAWN.px as number) - 0.2 * (k % 2), rhx: (S_DRAWN.rhx as number) - 0.2 * (k % 2) });
const S_DRIVE: P = elbowsTo(S, { ...swordIn({ px: 2.2, pz: S.pz - 0.8, yaw: 2, twist: -12, pitch: 7, bend: 2, side: 1, roll: 0, faceUp: 6, faceTilt: 0, faceTurn: 4, lk: 14, rk: -8 }, [-3, -10.5, 37.5], 2, 4), ...guardL(9, -1, -13, 14) }, [0.2, 0.9, -0.4], [-0.7, -0.5, -0.4]);
const S_THRUST: P = elbowsTo(S, { ...swordIn({ px: 8.5, pz: S.pz - 3.0, yaw: 8, twist: 6, pitch: 15, bend: 8, side: -1, roll: 1, faceUp: 10, faceTilt: 0, faceTurn: -2, lk: 26, rk: -4 }, [17, -8, 40], 0, -2), ...guardL(4, 5, -12, 50) }, [0.1, 0.9, -0.4], [-0.3, -0.7, -0.6]);
const S_OVER: P = elbowsTo(S, { ...swordIn({ px: 9.4, pz: S.pz - 3.2, yaw: 9, twist: 8, pitch: 17, bend: 10, side: -1, roll: 1, faceUp: 10, faceTurn: -2, lk: 28, rk: -3 }, [21, -5.5, 39.5], 0, -4), ...guardL(3.5, 5.5, -12.5, 54) }, [0.1, 0.9, -0.4], [-0.2, -0.7, -0.6]);
const S_BACK: P = elbowsTo(S, { ...swordIn({ px: 2.4, pz: S.pz - 0.8, yaw: 3, twist: 0, pitch: 4, bend: 3, side: 0, roll: 0, faceUp: 4, faceTilt: 0, faceTurn: 2, lk: 10, rk: -8 }, [8, -9.5, 39], 0, 50), ...guardL(5, 1.5, -15, 20) }, [-0.3, 0.8, -0.6], [-0.3, -0.8, -0.5]);
function swordThrust(): Motion {
  return {
    hit: HT,
    keys: [
      { at: 0, pose: {} },
      { at: 0.14, pose: S_TAKE, ease: 'io' },
      { at: GD_THRUST.warn[0], pose: S_DRAWN, ease: 'out' },
      { at: 0.34, pose: shakeS(1), ease: 'io' },
      { at: 0.41, pose: shakeS(2), ease: 'io' },
      { at: GD_THRUST.warn[1], pose: shakeS(3), ease: 'io' },
      { at: HT - 0.1, pose: S_DRIVE, ease: 'in' },
      { at: HT, pose: S_THRUST, ease: 'lin' },
      { at: HT + 0.1, pose: S_OVER, ease: 'out' },
      { at: 1.0, pose: S_BACK, ease: 'io' },
      { at: GD_THRUST.long, pose: {}, ease: 'io' },
    ],
  };
}
function thrustFeet(): (t: number) => P {
  return footwork(B, {
    L: { start: L0, moves: [{ t0: HT - 0.14, t1: HT - 0.02, to: plantBy(L0, 10, 1, 8), lift: 3.0 }, { t0: 0.98, t1: 1.24, to: L0, lift: 2.6 }] },
    R: { start: R0, moves: [{ t0: 0.12, t1: 0.26, to: plantBy(R0, -1.5, -1, -12), lift: 2.2 }, { t0: 1.02, t1: 1.28, to: R0, lift: 2.4 }] },
  });
}
function thrustGlint(t: number): number {
  if (t < 0.1 || t > HT + 0.2) return 0;
  return t < GD_THRUST.warn[0] ? (t - 0.1) / (GD_THRUST.warn[0] - 0.1) : t <= HT ? 1 : 1 - (t - HT) / 0.2;
}

// =============================================================================================
// THE WIDE SWEEP (their second blow: the city watch's halberd sweep, as a partisan's; the same for a sword)

export const GD_SWEEP = { long: 1.8, hit: 24 / 30, warn: [0.32, 0.62] } as const;
const HS = GD_SWEEP.hit;
const SWEEP_LEFT = 7;
const both2 = (body: P, hand: V3, az: number, el: number, edge: V3): P => ({ ...body, ...partisanGrip([hand[0] + ((body.px as number) ?? 0), hand[1] + ((body.py as number) ?? 0), hand[2]], heading(az, el), edge, 0, SWEEP_LEFT) });
/** The sweep's keys for the partisan (as the watch's halberd sweep, art/hushed_watch_moves.ts). */
function partisanSweepKeys(): [number, P, Key3['ease']][] {
  const e = (body: P, hand: V3, az: number, el: number, edge: V3, wl: V3, wr: V3): P => elbowsTo(R, both2(body, hand, az, el, edge), wl, wr);
  const TAKE = e({ px: -0.6, pz: R.pz, yaw: -4, twist: -4, pitch: 2, bend: 3, side: 0, roll: 0, faceUp: 4, faceTilt: -2, faceTurn: 4, lk: 9, rk: -9 }, [11, -11, 46], -140, 86, [-0.6, -0.8, 0], [-0.1, 0.9, -0.5], [-0.4, -0.7, -0.7]);
  const HEAVE = e({ px: -1.2, pz: R.pz + 0.2, yaw: -10, twist: -10, pitch: -1, bend: 0, side: 1, roll: -1, faceUp: 10, faceTilt: -2, faceTurn: 8, lk: 10, rk: -12 }, [11, -12, 60], -140, 55, [0, 0, 1], [-0.1, 0.8, -0.8], [-0.3, -0.8, -0.6]);
  const RAISED = e({ px: -2.4, pz: R.pz + 0.8, yaw: -16, twist: -18, pitch: -6, bend: -6, side: 3, roll: -2, faceUp: 18, faceTilt: 0, faceTurn: 14, lk: 12, rk: -14 }, [9, -4, 72], -140, 15, [0, 0, 1], [0.1, 0.9, -0.3], [0.1, -0.9, -0.3]);
  const shaking = (k: number): P => ({ ...RAISED, rhz: (RAISED.rhz as number) + (k % 2 ? 0.9 : -0.5), rhy: (RAISED.rhy as number) + (k % 2 ? -0.4 : 0.3), px: (RAISED.px as number) - 0.25 * (k % 2), rhx: (RAISED.rhx as number) - 0.25 * (k % 2) });
  const DRIVE = e({ ...RAISED, px: 2.2, pz: R.pz - 0.6, yaw: 4, twist: -34, pitch: 2, bend: -2, side: 2, roll: 0, faceUp: 10, faceTurn: 6 }, [8, -8, 69], -128, 10, [0, 0.2, 1], [0.3, 1, 0.1], [0.1, -0.9, -0.3]);
  const COMING = e({ px: 4.8, pz: R.pz - 1.8, yaw: 12, twist: -14, pitch: 8, bend: 4, side: 0, roll: 1, faceUp: 6, faceTurn: 2, lk: 18, rk: -6 }, [14, -18, 51], -62, -4, [0.6, 0.8, 0], [0.2, 0.8, -0.6], [-0.1, -0.9, -0.4]);
  const SWEEP = e({ px: 6.5, pz: R.pz - 2.6, yaw: 18, twist: 4, pitch: 14, bend: 10, side: -2, roll: 2, faceUp: 4, faceTilt: 0, faceTurn: -4, lk: 22, rk: -6 }, [19, -5, 41], 0, -12, [0, 1, 0], [0, 0.8, -0.6], [-0.2, -0.9, -0.5]);
  const ROUND = e({ px: 6.0, pz: R.pz - 2.8, yaw: 30, twist: 18, pitch: 16, bend: 12, side: -3, roll: 2, faceUp: 2, faceTurn: -10, lk: 24, rk: -4 }, [15, 8, 42], 76, -15, [-0.8, 0.6, 0], [0, 0.8, -0.6], [0.2, -0.9, -0.4]);
  const ROUND2 = e({ px: 5.0, pz: R.pz - 2.6, yaw: 40, twist: 30, pitch: 14, bend: 12, side: -3, roll: 2, faceUp: 2, faceTurn: -18, lk: 26, rk: -2 }, [9, 17, 43], 128, -16, [-0.8, -0.6, 0], [0.2, 0.8, -0.6], [0.5, -0.6, -0.4]);
  const BACK = e({ px: 3.6, pz: R.pz - 1.4, yaw: 12, twist: 0, pitch: 8, bend: 6, side: 0, roll: 0, faceUp: 2, faceTurn: -4, lk: 14, rk: -6 }, [17, -8, 46], 30, 20, [0.5, -0.9, 0], [-0.2, 0.7, -0.8], [-0.3, -0.8, -0.6]);
  const UPRIGHT = e({ px: 2.0, pz: R.pz - 0.6, yaw: 6, twist: 0, pitch: 4, bend: 4, side: 0, roll: 0, faceUp: 0, faceTurn: 0, lk: 10, rk: -8 }, [11, -10, 46], 0, 80, [0, -1, 0], [-0.2, 0.9, -0.4], [-0.4, -0.7, -0.7]);
  // (the left hand let go of it and swung out round to his side, clear of the breastplate)
  const LET_GO: P = elbowsTo(R, { ...UPRIGHT, px: 1.0, pz: R.pz - 0.3, pitch: 2, bend: 1, lhIn: 1, lhx: 5, lhy: 7, lhz: -17 }, [-0.1, 1, -0.3], [-0.6, -0.4, -0.7]);
  // (the left hand coming across to it round the front of the breastplate)
  const REACH = elbowsTo(R, { px: -0.3, pz: R.pz, yaw: -2, twist: -2, pitch: 1, bend: 1, lhIn: 1, lhx: 9, lhy: -3, lhz: -13 }, [-0.1, 1, -0.3], null);
  return [
    [0.08, REACH, 'io'], [0.16, TAKE, 'out'], [0.24, HEAVE, 'in'], [0.33, RAISED, 'out'], [0.4, shaking(1), 'io'], [0.48, shaking(2), 'io'], [0.56, shaking(3), 'io'], [GD_SWEEP.warn[1], shaking(4), 'io'],
    [HS - 0.12, DRIVE, 'in'], [HS - 0.06, COMING, 'lin'], [HS, SWEEP, 'lin'], [HS + 0.1, ROUND, 'lin'], [HS + 0.26, ROUND2, 'out'], [1.24, BACK, 'lin'], [1.42, UPRIGHT, 'io'], [1.6, LET_GO, 'io'],
  ];
}
/** The sweep's keys for the sword: raised high back over the right shoulder, the shield held out of the way to the left; swept round flat before him. */
function swordSweepKeys(): [number, P, Key3['ease']][] {
  const e = (body: P, hand: V3, az: number, el: number, left: P, wl: V3, wr: V3): P => elbowsTo(S, { ...swordIn(body, hand, az, el), ...left }, wl, wr);
  const TAKE = e({ px: -0.6, pz: S.pz, yaw: -4, twist: -4, pitch: 2, bend: 3, side: 0, roll: 0, faceUp: 4, faceTilt: -2, faceTurn: 4, lk: 9, rk: -9 }, [9, -10, 46], -60, 70, guardL(6, -1, -14, 20), [-0.3, 0.8, -0.6], [-0.4, -0.7, -0.7]);
  const HEAVE = e({ px: -1.2, pz: S.pz + 0.2, yaw: -10, twist: -10, pitch: -1, bend: 0, side: 1, roll: -1, faceUp: 10, faceTilt: -2, faceTurn: 8, lk: 10, rk: -12 }, [6, -11, 57], -140, 50, guardL(6, -1, -12, 24), [-0.3, 0.8, -0.6], [-0.3, -0.8, -0.6]);
  const RAISED = e({ px: -2.4, pz: S.pz + 0.8, yaw: -16, twist: -18, pitch: -6, bend: -6, side: 3, roll: -2, faceUp: 18, faceTilt: 0, faceTurn: 14, lk: 12, rk: -14 }, [3, -9, 64], -150, 22, guardL(7, 1, -10, 30), [-0.2, 0.8, -0.6], [0.1, -0.9, -0.3]);
  const shaking = (k: number): P => ({ ...RAISED, rhz: (RAISED.rhz as number) + (k % 2 ? 0.9 : -0.5), rhy: (RAISED.rhy as number) + (k % 2 ? -0.4 : 0.3), px: (RAISED.px as number) - 0.25 * (k % 2), rhx: (RAISED.rhx as number) - 0.25 * (k % 2) });
  const DRIVE = e({ ...RAISED, px: 2.2, pz: S.pz - 0.6, yaw: 4, twist: -34, pitch: 2, bend: -2, side: 2, roll: 0, faceUp: 10, faceTurn: 6 }, [3, -10, 62], -140, 12, guardL(5, 2, -11, 40), [-0.2, 0.8, -0.6], [0.1, -0.9, -0.3]);
  const COMING = e({ px: 4.8, pz: S.pz - 1.8, yaw: 12, twist: -14, pitch: 8, bend: 4, side: 0, roll: 1, faceUp: 6, faceTurn: 2, lk: 18, rk: -6 }, [12, -17, 48], -70, -2, guardL(2, 4, -11, 60), [-0.3, 0.8, -0.5], [-0.1, -0.9, -0.4]);
  const SWEEP = e({ px: 6.5, pz: S.pz - 2.6, yaw: 18, twist: 4, pitch: 14, bend: 10, side: -2, roll: 2, faceUp: 4, faceTilt: 0, faceTurn: -4, lk: 22, rk: -6 }, [19, -5, 42], -6, -8, guardL(-1, 6, -11, 80), [-0.4, 0.8, -0.4], [-0.2, -0.9, -0.5]);
  const ROUND = e({ px: 6.0, pz: S.pz - 2.8, yaw: 30, twist: 18, pitch: 16, bend: 12, side: -3, roll: 2, faceUp: 2, faceTurn: -10, lk: 24, rk: -4 }, [16, 7, 42], 60, -10, guardL(-2, 6, -10, 100), [-0.4, 0.8, -0.4], [0.2, -0.9, -0.4]);
  const ROUND2 = e({ px: 5.0, pz: S.pz - 2.6, yaw: 40, twist: 30, pitch: 14, bend: 12, side: -3, roll: 2, faceUp: 2, faceTurn: -18, lk: 26, rk: -2 }, [10, 15, 43], 110, -12, guardL(-2.5, 6, -10, 110), [-0.4, 0.8, -0.4], [0.5, -0.6, -0.4]);
  const BACK = e({ px: 3.6, pz: S.pz - 1.4, yaw: 12, twist: 0, pitch: 8, bend: 6, side: 0, roll: 0, faceUp: 2, faceTurn: -4, lk: 14, rk: -6 }, [14, -6, 44], 20, 30, guardL(3, 3, -14, 50), [-0.3, 0.8, -0.6], [-0.3, -0.8, -0.6]);
  const UPRIGHT = e({ px: 2.0, pz: S.pz - 0.6, yaw: 6, twist: 0, pitch: 4, bend: 4, side: 0, roll: 0, faceUp: 0, faceTurn: 0, lk: 10, rk: -8 }, [9, -9, 41], 0, 76, guardL(3.5, 1, -16, 20), [-0.4, 0.7, -0.6], [-0.3, -0.8, -0.5]);
  return [
    [0.1, TAKE, 'in'], [0.2, HEAVE, 'lin'], [0.32, RAISED, 'out'], [0.4, shaking(1), 'io'], [0.48, shaking(2), 'io'], [0.56, shaking(3), 'io'], [GD_SWEEP.warn[1], shaking(4), 'io'],
    [HS - 0.12, DRIVE, 'in'], [HS - 0.06, COMING, 'lin'], [HS, SWEEP, 'lin'], [HS + 0.1, ROUND, 'lin'], [HS + 0.26, ROUND2, 'out'], [1.24, BACK, 'io'], [1.42, UPRIGHT, 'io'],
  ];
}
function guardSweep(who: GuardWho): Motion {
  const keys: Key3[] = [{ at: 0, pose: {} }];
  for (const [at, pose, ease] of who === 'partisan' ? partisanSweepKeys() : swordSweepKeys()) keys.push({ at, pose, ease });
  keys.push({ at: GD_SWEEP.long, pose: {}, ease: 'io' });
  return { hit: HS, keys };
}
function sweepFeet(): (t: number) => P {
  return footwork(B, {
    L: { start: L0, moves: [{ t0: HS - 0.14, t1: HS - 0.02, to: plantBy(L0, 8, 1.5, 10), lift: 3.4 }, { t0: 1.32, t1: 1.62, to: L0, lift: 2.8 }] },
    R: { start: R0, moves: [{ t0: 0.1, t1: 0.26, to: plantBy(R0, -1.5, -1, -14), lift: 2.4 }, { t0: HS - 0.08, t1: HS + 0.06, to: plantBy(R0, -1.5, -1, 12, { pitch: 22 }) }, { t0: 1.3, t1: 1.6, to: R0, lift: 2.4 }] },
  });
}
function sweepGlint(t: number): number {
  if (t < 0.12 || t > HS + 0.4) return 0;
  return t < 0.32 ? (t - 0.12) / 0.2 : t <= HS + 0.1 ? 1 : 1 - (t - HS - 0.1) / 0.3;
}

// =============================================================================================
// STRUCK

function guardReel(who: GuardWho): Motion {
  const rest = restOf(who);
  return {
    keys: [
      { at: 0, pose: {} },
      { at: 0.06, pose: { px: -2.4, pz: rest.pz + 0.5, pitch: -4, bend: -5, faceUp: rest.faceUp + 18, faceTilt: rest.faceTilt + 8, out: 0.1 }, ease: 'out' },
      { at: 0.18, pose: { px: -1.0, pitch: 4, bend: 6, faceUp: rest.faceUp + 4 }, ease: 'io' },
      { at: 0.4, pose: {}, ease: 'io' },
    ],
  };
}

// =============================================================================================
// TO ONE KNEE, THEN A CRASH (his pick)

export const GD_DIES = { long: 2.8, gasp: 0.4, drop: 0.48, knee: 1.0, hold: [1.0, 1.55], crash: 1.95, down: 2.3 } as const;
const TUCK = 56;
const KNEE_DOWN = B.legR[1] * 1.3;
/** On one knee: the right knee down, its foot back on its toes; the left foot planted flat before him, that knee up. */
const KNEEL_R: Plant = plantBy(R0, -13, 0.5, 0);
const KNEEL_L: Plant = plantBy(L0, 20, -0.5, 4);
/** Down on both: the left knee brought down beside the right, its foot back on its toes too. */
const DOWN_L: Plant = plantBy(L0, KNEEL_R.at[0] - L0.at[0], -0.5, 0);
const mirrorR = (p: Plant): Plant => ({ ...p, at: [p.at[0], -p.at[1]], turn: -p.turn });
/** On one knee, leaning `lean` forward of upright: the hips over the right knee's spot as a man kneeling on both would hold them. */
function oneKnee(lean: number, body: P): P {
  const h = kneelHips(B, R, { L: mirrorR(KNEEL_R), R: KNEEL_R }, TUCK, KNEE_DOWN, lean);
  return { ...h, lk: 0, lkUp: 70, ...body };
}
const bothKnees = (lean: number, body: P): P => ({ ...kneelHips(B, R, { L: DOWN_L, R: KNEEL_R }, TUCK, KNEE_DOWN, lean), ...body });
const HANG = -(B.upperArm + B.foreArm) * 0.9;
const HANGING: P = { lhIn: 0, lhx: 3, lhy: 9, lhz: HANG + 4, le: -10, rhIn: 0, rhx: 3, rhy: -9, rhz: HANG + 4, re: 10 };
/** Their arms flung out on the floor as they crash: each hand `back` behind its shoulder and `out` to its side. */
function limp(body: P, back: number, out: number): P {
  const s = solve(B, { ...R, ...body, lhIn: 0, rhIn: 0 } as Posed);
  const at = (sh: V3, side: number): V3 => [sh[0] - back, sh[1] + side * out, 2.9];
  const Lh = at(s.shoulderL, 1);
  const Rh = at(s.shoulderR, -1);
  const q = { ...R, ...body, lhIn: 2, lhx: Lh[0], lhy: Lh[1], lhz: Lh[2], rhIn: 2, rhx: Rh[0], rhy: Rh[1], rhz: Rh[2] } as Posed;
  const le = elbowFor(B, q, true, norm([0, 1, -0.4]));
  const re = elbowFor(B, { ...q, le } as Posed, false, norm([0, -1, -0.4]));
  return { ...body, lhIn: 2, lhx: Lh[0], lhy: Lh[1], lhz: Lh[2], rhIn: 2, rhx: Rh[0], rhy: Rh[1], rhz: Rh[2], le, re };
}
const lifted = (p: P, dz: number): P => ({ ...p, pz: (p.pz as number) + dz });
const ON_KNEE: P = oneKnee(4, { yaw: 0, pitch: 2, roll: 1, twist: 0, bend: 4, side: 1, faceTurn: 0, faceUp: 6, faceTilt: 8, ...HANGING });
const SWAY: P = oneKnee(8, { yaw: 2, pitch: 6, roll: 3, twist: 0, bend: 8, side: 1, faceTurn: 4, faceUp: -4, faceTilt: 10, ...HANGING });
const FOLD: P = bothKnees(20, { yaw: 4, pitch: 34, roll: 3, twist: 0, bend: 22, side: 1, faceTurn: 6, faceUp: -30, faceTilt: 8, ...HANGING });
const SLUMP: P = limp(bothKnees(36, { yaw: 6, pitch: 62, roll: 2, twist: 0, bend: 24, side: 0, faceTurn: 14, faceUp: -48, faceTilt: 14 }), 8, 12);
const PRONE: P = { ...limp(lifted(bothKnees(66, { yaw: 8, pitch: 80, roll: 6, twist: 0, bend: 8, side: 0, faceTurn: 30, faceUp: -36, faceTilt: 22 }), 2.6), 24, 12), out: 1 };
function guardDying(who: GuardWho): Motion {
  const rest = restOf(who);
  return {
    keys: [
      { at: 0, pose: {} },
      { at: 0.08, pose: { px: -2.2, pz: rest.pz, pitch: -3, bend: -5, faceUp: rest.faceUp + 14, out: 0.1 }, ease: 'out' },
      // THE GASP: the head thrown back, the chest arched: the Hush pours out of the slit
      { at: GD_DIES.gasp, pose: { px: -2.0, pz: rest.pz + 0.9, pitch: -8, bend: -14, faceUp: 40, faceTilt: 0, faceTurn: 0, ...(who === 'sword' ? { lhIn: 1, lhx: 7.5, lhy: 3, lhz: -10, pAz: 24 } : { rhIn: 2, rhx: 3.0, rhy: -12.6, rhz: 46.5 }), out: 0.5 }, ease: 'out' },
      // the weapon drops (GD_DIES.drop): the arms fall to the sides
      { at: 0.62, pose: { px: -1.8, pz: rest.pz + 0.5, pitch: -7, bend: -12, faceUp: 34, faceTilt: 4, lhIn: 1, lhx: -0.6, lhy: 7, lhz: -21, rhIn: 1, rhx: -0.6, rhy: -7, rhz: -21, pAz: 60, out: 0.85 }, ease: 'io' },
      // down onto the right knee, the left foot planted before him
      { at: 0.82, pose: { px: 0, pz: rest.pz - 6, pitch: 3, bend: 3, faceUp: 14, lk: 20, rk: -24, ...HANGING, out: 1 }, ease: 'in' },
      { at: GD_DIES.knee, pose: { ...ON_KNEE, out: 1 }, ease: 'out' },
      // held there, swaying
      { at: 1.25, pose: { ...ON_KNEE, pz: (ON_KNEE.pz as number) + 0.5, pitch: -1, roll: -2, faceUp: 10, out: 1 }, ease: 'io' },
      { at: GD_DIES.hold[1], pose: { ...SWAY, out: 1 }, ease: 'io' },
      // then the other knee gives and he crashes forward
      { at: 1.78, pose: { ...FOLD, out: 1 }, ease: 'in' },
      { at: GD_DIES.crash, pose: { ...SLUMP, out: 1 }, ease: 'lin' },
      { at: GD_DIES.down, pose: PRONE, ease: 'out' },
      { at: GD_DIES.long, pose: PRONE, ease: 'io' },
    ],
  };
}
function guardDyingFeet(): (t: number) => P {
  return footwork(B, {
    L: { start: L0, moves: [{ t0: 0.66, t1: 0.96, to: KNEEL_L, lift: 3.2 }, { t0: GD_DIES.hold[1] + 0.02, t1: 1.86, to: { ...DOWN_L, pitch: TUCK }, lift: 2.0 }] },
    R: { start: R0, moves: [{ t0: 0.62, t1: 0.92, to: { ...KNEEL_R, pitch: TUCK }, lift: 1.6 }] },
  });
}

// =============================================================================================
// THEM, AS THE GAME HOLDS A MONSTER

const jawOf = (t: number): number => 0.4 + 0.3 * Math.max(0, Math.sin(fr(t / 2) * Math.PI * 6));
function guardMob(who: GuardWho): Mob {
  const paint = guardPainter(who, { dropped: (m: Moment) => !!m.dying && m.t >= GD_DIES.drop });
  const rest = restOf(who);
  const mv = (name: string, motion: Motion, more: Partial<MobMove> = {}): MobMove => ({ name, motion, rest, ...more });
  const trail = (s: Skeleton, q: Posed): V3[] => (who === 'partisan' ? [partisanOf(s, q).blade, partisanOf(s, q).tip] : [swordOf(s).mid, swordOf(s).tip]);
  return {
    id: `guard-${who}`,
    name: who === 'partisan' ? 'A Hushed palace guard (partisan)' : 'A Hushed palace guard (sword and shield)',
    size: 'medium: a head taller than the knight',
    build: B,
    stand: mv('The palace guard stand at attention', guardStand(who), { jaw: jawOf }),
    attack: mv('The long thrust', who === 'partisan' ? partisanThrust() : swordThrust(), { feet: thrustFeet(), glint: thrustGlint, jaw: jawOf, trail, trailSpan: 2.4 }),
    more: {
      sweep: mv('The wide sweep', guardSweep(who), { feet: sweepFeet(), glint: sweepGlint, jaw: jawOf, trail, trailSpan: 3.0 }),
    },
    idleFrames: 32,
    idleFps: 10,
    walk: mv('The palace guard march', guardMarch(who), { period: GD_WALK.frames / GD_WALK.fps, ground: GD_PACE * TILE3, jaw: jawOf }),
    walkFrames: GD_WALK.frames,
    walkFps: GD_WALK.fps,
    pace: GD_PACE,
    reel: mv('The palace guard are struck', guardReel(who), { glint: (t) => (t < 0.3 ? 1 - t / 0.3 : 0) }),
    reelTime: 0.4,
    hit: HT,
    warn: GD_THRUST.warn[1] - GD_THRUST.warn[0],
    dieTime: GD_DIES.long,
    dying: mv('To one knee, then a crash', guardDying(who), { feet: guardDyingFeet(), jaw: jawOf }),
    aura: { x: GUARD_CANVAS.ax, y: GUARD_CANVAS.ay - 46, r: 40, color: '#9890b4', a: 0.06 },
    shadow: 13,
    canvas: GUARD_CANVAS,
    trueBack: true,
    bits: paint.bits,
    grains: paint.grains,
    // (the weapon drops from his hand and falls clear to his right; the shield to his left)
    fall(piece) {
      if (piece === 'partisan') return { from: GD_DIES.drop, to: [-16, -30], spin: 62, lay: 'axis', hop: 1.4 };
      if (piece === 'sword') return { from: GD_DIES.drop, to: [-10, -26], spin: 80, lay: 'axis', hop: 1.4 };
      if (piece === 'shield') return { from: GD_DIES.drop + 0.06, to: [-14, 26], spin: 20, lay: 'flat', hop: 1.2 };
      return null;
    },
  };
}
export const GUARD_PARTISAN = guardMob('partisan');
export const GUARD_SWORD = guardMob('sword');
export const GUARD_ALL: readonly Mob[] = [GUARD_PARTISAN, GUARD_SWORD];
export function makeGuardArt3(mob: Mob = GUARD_PARTISAN, pace = mob.pace): ActorArt {
  return { front: mobSet(mob, 'front', pace), back: mobSet(mob, 'back', pace) };
}

// =============================================================================================
// THEM AS THE CHECKS SEE THEM (art/boss_checks.ts)

const len3 = (v: V3): number => Math.hypot(v[0], v[1], v[2]);
export function guardSolids(s: Skeleton): { limbs: CheckLimb[]; lumps: CheckLump[] } {
  const [rH, rK, rA] = B.legR;
  const [r0, r1] = B.armR;
  const limbs: CheckLimb[] = [];
  for (const side of ['L', 'R'] as const) {
    const L = side === 'L';
    limbs.push(
      { name: `leg${side}`, a: L ? s.hipL : s.hipR, b: L ? s.kneeL : s.kneeR, r: rH * 1.1 },
      { name: `shin${side}`, a: L ? s.kneeL : s.kneeR, b: L ? s.ankleL : s.ankleR, r: Math.max(rK, rA) * 1.2 },
      { name: `foot${side}`, a: add(L ? s.heelL : s.heelR, [0, 0, 1.7]), b: add(L ? s.toeL : s.toeR, [0, 0, 1.7]), r: 2.0 },
      { name: `upper${side}`, a: L ? s.shoulderL : s.shoulderR, b: L ? s.elbowL : s.elbowR, r: r0 * 1.18 },
      { name: `fore${side}`, a: L ? s.elbowL : s.elbowR, b: L ? s.handL : s.handR, r: r1 * 1.1 },
    );
  }
  limbs.push({ name: 'neck', a: s.neck, b: lerp3(s.neck, s.head, 0.5), r: 3.0 });
  const waistC = add(s.pelvis, mul(s.hips[2], B.waist * 0.6));
  const lumps: CheckLump[] = [
    { name: 'head', c: add(s.head, mul(s.face[2], 0.2)), rot: s.face, h: [B.headR[0] * 1.1, B.headR[1] * 1.12, B.headR[2] * 1.06] },
    { name: 'chest', c: lerp3(s.ribs, s.neck, 0.3), rot: s.chest, h: [B.ribDeep + 2.6, B.ribHalf + 2.4, len3(sub(s.neck, s.ribs)) * 0.55] },
    { name: 'belly', c: lerp3(waistC, s.ribs, 0.45), rot: s.belly, h: [B.waistDeep + 2.6, B.waistHalf + 2.4, Math.max(3, len3(sub(s.ribs, waistC)) * 0.6)] },
    { name: 'hips', c: add(s.pelvis, mul(s.hips[2], B.waist * 0.2)), rot: s.hips, h: [B.pelvisDeep + 2.2, B.pelvisHalf + 2.4, B.waist * 0.75] },
  ];
  return { limbs, lumps };
}
function partisanThings(s: Skeleton, q: Posed): CheckThing[] {
  const h = partisanOf(s, q);
  const staff: V3[] = [];
  for (let k = 0; k <= PARTISAN.long; k += 4) staff.push(h.at(k));
  const onIt = (hand: V3): boolean => {
    const ab = sub(h.tip, h.butt);
    const k = Math.max(0, Math.min(1, dot(sub(hand, h.butt), ab) / Math.max(1e-6, dot(ab, ab))));
    return len(sub(hand, add(h.butt, mul(ab, k)))) < 1.2 + B.armR[2] * 1.2 + 2.5;
  };
  const may = [...(q.lhIn === 3 || onIt(s.handL) ? ['foreL'] : []), 'foreR'];
  const flukes: V3[] = [-1, 1].map((k) => add(h.at(PARTISAN.foot + 1), mul(h.across, k * 4.6)));
  return [
    { name: 'partisan', pts: staff, r: 1.15, may },
    { name: 'partisan blade', pts: [h.at(PARTISAN.foot), ...flukes, h.blade, h.tip], r: 1.4, may },
  ];
}
function swordThings(s: Skeleton, q: Posed): CheckThing[] {
  const w = swordOf(s);
  const blade: V3[] = [];
  for (let k = 0.1; k <= 1.0001; k += 0.18) blade.push(lerp3(w.guard, w.tip, k));
  const sh = shieldOf(s, q);
  return [
    { name: 'sword hilt', pts: [w.pommel, w.guard], r: 1.0, may: ['foreR'] },
    { name: 'sword', pts: blade, r: 0.9, may: [] },
    { name: 'shield', pts: [sh.c, ...sh.rim], r: 0.9, may: ['foreL', 'upperL'] },
  ];
}
export function guardShape(who: GuardWho): BossShape {
  const tipOf = (move: string, s: Skeleton, q: Posed): V3 => {
    if (who === 'partisan') return move === 'sweep' ? partisanOf(s, q).blade : partisanOf(s, q).tip;
    return move === 'sweep' ? swordOf(s).mid : swordOf(s).tip;
  };
  return {
    body: guardSolids,
    tip: (move, t, s, q) => (move === 'dying' && t >= GD_DIES.drop ? null : tipOf(move, s, q)),
    things: (move, t, s, q) => (move === 'dying' && t >= GD_DIES.drop ? [] : who === 'partisan' ? partisanThings(s, q) : swordThings(s, q)),
  };
}
export const GD_SHAPE_PARTISAN = guardShape('partisan');
export const GD_SHAPE_SWORD = guardShape('sword');
