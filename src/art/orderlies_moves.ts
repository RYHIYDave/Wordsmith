// THE PHYSICIAN'S ORDERLIES: THEIR MOVES (the art chat for floors 11 to 15, 19 Oct 2026). A MOCK-UP: NOT IN THE GAME,
// behind ORDERLIES_ON (art/orderlies.ts, off). Their look and brief are art/orderlies.ts: made on his word of 18 Oct,
// 21:24 Pacific, “Hey go without my say so.  If something is shit I’ll get it to it but you’re doing a great jobs. At
// least for 11-15”, the picks this chat would have marked recommended, and sent him with their films.
//
// THEIR MOVES:
//   STANDING (art/orderlies.ts): planted, the mallet on the right shoulder, breathing heavily through the gauze, the
//     head turning to watch; the mallet shifted on the shoulder once a round.
//   THE TRUDGE: heavy, wide-footed, the mallet on the shoulder.
//   THE MALLET BLOW (their blow): the mallet lifted off the shoulder in both hands and raised high over the head, the
//     body arched back, its iron hoops glinting pink, held shaking (THE WARNING); then hips first, a step in, and
//     brought down over the top with all their weight; it SLAMS INTO THE FLOOR before them, dust and splinters thrown
//     up; held there, bent over it; heaved back up onto the shoulder.
//   STRUCK: jolted back, the head snapped back, the mallet rocking on the shoulder.
//   THEIR DEATH, A FELLED TREE: rocked back, the mallet slipping from their hands and falling behind them; a lurching
//     step to catch themselves; then they go over forward, stiff, gathering speed, full length onto their face, and
//     lie still.
//
// By his rulebook: every move through every check the bosses have (art/boss_checks.ts), from in front and behind.
//   test: tsx --test tests/orderlies.test.ts

import { footwork, plantBy, plantOf } from './bosses3';
import type { Plant } from './bosses3';
import type { BossShape, CheckLimb, CheckLump, CheckThing } from './boss_checks';
import type { ActorArt } from './actor_types';
import { MALLET, ORDERLY_BODY, ORDERLY_CANVAS, ORDERLY_REST, ORDERLY_STAND_LONG, malletOf, orderlyPainter, orderlyStand } from './orderlies';
import { TILE3, mobSet } from './new_mobs3';
import type { Mob, MobMove, Moment } from './new_mobs3';
import { add, elbowFor, lerp3, mul, norm, solve, sub } from './skeleton';
import type { Bones, Key3, Motion, Posed, Skeleton, V3 } from './skeleton';

type P = Partial<Bones>;
const B = ORDERLY_BODY;
const R = ORDERLY_REST;
const L0 = plantOf(B, 'L', {}, R);
const R0 = plantOf(B, 'R', {}, R);
const len3 = (v: V3): number => Math.hypot(v[0], v[1], v[2]);
const clamp01 = (v: number): number => Math.max(0, Math.min(1, v));
void ORDERLY_STAND_LONG;

function elbowsTo(pose: P, wantL: V3 | null, wantR: V3 | null): P {
  const q = { ...R, ...pose } as Posed;
  const le = wantL ? elbowFor(B, q, true, norm(wantL)) : q.le;
  const re = wantR ? elbowFor(B, { ...q, le } as Posed, false, norm(wantR)) : q.re;
  return { ...pose, le, re };
}

// =============================================================================================
// THE TRUDGE

export const OD_PACE = 0.8;
export const OD_WALK = { frames: 12, fps: 8 } as const;
function stepFoot(k: number, n: number, step: number, lift: number): [number, number, number] {
  const half = n / 2;
  if (k <= half) return [step * (half / 2 - k), 0, 0];
  const u = (k - half) / half;
  const g = u * u * (3 - 2 * u);
  return [-step * (half / 2) + step * half * g, lift * Math.sin(Math.PI * u), 14 * Math.sin(Math.PI * u) * (1 - u) - 6 * Math.sin(Math.PI * u) * u];
}
function orderlyWalk(): Motion {
  const n = OD_WALK.frames;
  const d = (OD_PACE * TILE3) / OD_WALK.fps;
  const keys: Key3[] = [];
  for (let i = 0; i <= n; i++) {
    const j = i % n;
    const a = (j / n) * Math.PI * 2;
    const [lx, lz, lp] = stepFoot(j, n, d, 3.4);
    const [rx, rz, rp] = stepFoot((j + n / 2) % n, n, d, 3.4);
    const sag = Math.abs(Math.sin(a));
    keys.push({
      at: i / OD_WALK.fps,
      ease: 'lin',
      pose: {
        pz: R.pz - 1.2 * sag, py: 1.6 * Math.sin(a), roll: R.roll + 4 * Math.sin(a), yaw: 4 * Math.cos(a), side: 1.6 * Math.sin(a),
        bend: R.bend + 2 * sag, pitch: R.pitch + 3, faceUp: R.faceUp - 2 * sag, faceTilt: R.faceTilt + 4 * Math.sin(a), faceTurn: R.faceTurn + 3 * Math.cos(a),
        lfx: lx, lfz: lz, lfp: lp, lfy: R.lfy, lft: R.lft,
        rfx: rx, rfz: rz, rfp: rp, rfy: R.rfy, rft: R.rft,
        lhx: R.lhx + 3.0 * Math.sin(a + Math.PI), lhz: R.lhz + 0.6 * sag,
        rhz: R.rhz + 0.8 * sag, wEl: (R.wEl as number) + 3 * Math.sin(a * 2),
      },
    });
  }
  return { keys, loop: 0 };
}

// =============================================================================================
// THE MALLET BLOW

/** Their blow: raised by `raised`; the warning; the mallet's head coming down at `hit` (a frame of the game's thirty a second) and in the floor at `floor`; held there to `held`; back on the shoulder by `long`. */
export const OD_BLOW = { long: 2.1, raised: 0.36, warn: [0.38, 0.66], hit: 25 / 30, floor: 27 / 30, held: 1.25 } as const;
const H = OD_BLOW.hit;
/** Both hands on the handle: the left below the right, toward the butt. */
const BOTH: P = { lhIn: 3, lhx: -4.2, lhy: 0, lhz: 0 };
/** Raised high over the head, the head of it behind them, the body arched back, the head up. */
// (its way said as pointing forward and tipped back past upright, 128 degrees up: so that from here it comes on over the top)
const RAISED: P = elbowsTo({ px: -2.6, pz: R.pz + 0.6, yaw: -4, twist: -6, pitch: -6, bend: -12, roll: 0, side: 0, faceUp: 16, faceTilt: 0, faceTurn: 0, rhIn: 1, rhx: 1.5, rhy: 3.0, rhz: 21, wAz: 0, wEl: 128, wRoll: 0, ...BOTH, lk: 10, rk: -10 }, [0.4, 1, 0.4], [0.4, -1, 0.4]);
const shake = (k: number): P => ({ ...RAISED, rhz: (RAISED.rhz as number) + (k % 2 ? 0.6 : -0.2), px: (RAISED.px as number) - 0.25 * (k % 2), roll: k % 2 ? 1 : -1 });
/** THE SWING OVER THE TOP, a frame of the game's at a time, gathering speed all the way into the floor: hips first (the hips driving forward, the chest still back, the mallet still up behind), then the chest, then the arms and the mallet. */
const DRIVE: P = elbowsTo({ ...RAISED, px: 1.2, pz: R.pz + 0.2, yaw: 2, twist: -4, pitch: 8, bend: -18, faceUp: 12, wAz: 0, wEl: 122 }, [0.4, 1, 0.4], [0.4, -1, 0.4]);
const DRIVE2: P = elbowsTo({ ...DRIVE, px: 1.9, pitch: 10, bend: -14, faceUp: 11, rhx: 4.0, rhz: 20.0, wEl: 110 }, [0.4, 1, 0.3], [0.4, -1, 0.3]);
const OVER: P = elbowsTo({ ...DRIVE, px: 2.9, pz: R.pz - 0.4, pitch: 14, bend: -4, faceUp: 8, rhx: 8.5, rhy: 1.5, rhz: 16, wEl: 82 }, [0.6, 1, -0.2], [0.6, -1, -0.2]);
const COMING: P = elbowsTo({ ...OVER, px: 4.3, pz: R.pz - 1.6, pitch: 19, bend: 8, faceUp: 0, rhx: 14, rhy: 2.0, rhz: 5, wEl: 32 }, [0.4, 1, -0.4], [0.4, -1, -0.4]);
/** THE BLOW: brought down before them, the head of it about to strike the floor. */
const DOWN: P = elbowsTo({ px: 5.4, pz: R.pz - 3.4, yaw: 4, twist: 2, pitch: 25, bend: 14, roll: 0, side: 0, faceUp: -4, faceTilt: 0, faceTurn: 0, rhIn: 1, rhx: 15.5, rhy: 2.0, rhz: -6, wAz: 0, wEl: -10, wRoll: 0, ...BOTH, lk: 16, rk: -10 }, [0.2, 1, -0.6], [0.2, -1, -0.6]);
/** IN THE FLOOR: the head of it slammed down on the boards, the body bent over it, the knees given. */
const FLOOR: P = elbowsTo({ ...DOWN, px: 6.5, pz: R.pz - 8.5, pitch: 38, bend: 21, faceUp: -10, rhx: 14.5, rhz: -25, wEl: -18 }, [0.2, 1, -0.6], [0.2, -1, -0.6]);
/** Heaving it back up: upright again, the mallet up before them, about to go back over onto the shoulder. */
const HEAVE: P = elbowsTo({ px: 1.5, pz: R.pz - 0.4, yaw: 0, twist: -4, pitch: 2, bend: 0, roll: 0, side: 0, faceUp: 6, faceTilt: 0, faceTurn: 0, rhIn: 1, rhx: 8, rhy: 1.0, rhz: 2, wAz: 0, wEl: 80, wRoll: 0, ...BOTH, lk: 12, rk: -10 }, [0.3, 1, -0.6], [0.3, -1, -0.6]);
const HEAVE_AS: P = { wAz: 180, wEl: 100 };
function orderlyBlow(): Motion {
  return {
    hit: H,
    keys: [
      { at: 0, pose: {} },
      // (lifted off the shoulder, the left hand coming to the handle)
      { at: 0.16, pose: elbowsTo({ px: -1.0, pitch: 0, bend: -2, faceUp: 8, rhIn: 1, rhx: 6, rhy: 1.5, rhz: 6, wAz: 182, wEl: 50, ...BOTH }, [0.4, 1, -0.2], [0.4, -1, -0.2]), ease: 'io', as: { wAz: 2, wEl: 130 } },
      { at: OD_BLOW.raised, pose: RAISED, ease: 'io' },
      { at: 0.44, pose: shake(1), ease: 'io' },
      { at: 0.52, pose: shake(2), ease: 'io' },
      { at: 0.59, pose: shake(3), ease: 'io' },
      { at: OD_BLOW.warn[1], pose: shake(4), ease: 'io' },
      { at: H - 3 / 30, pose: DRIVE, ease: 'io' },
      { at: H - 2 / 30, pose: DRIVE2, ease: 'lin' },
      { at: H - 1 / 30, pose: OVER, ease: 'lin' },
      { at: H, pose: COMING, ease: 'lin' },
      { at: H + 1 / 30, pose: DOWN, ease: 'lin' },
      { at: OD_BLOW.floor, pose: FLOOR, ease: 'lin' },
      { at: OD_BLOW.held, pose: { ...FLOOR, pz: (FLOOR.pz as number) + 0.2, pitch: 37, bend: 20, faceUp: -6 }, ease: 'io' },
      { at: 1.6, pose: HEAVE, ease: 'io', as: HEAVE_AS },
      { at: OD_BLOW.long, pose: {}, ease: 'io' },
    ],
  };
}
function orderlyBlowFeet(): (t: number) => P {
  return footwork(B, {
    L: { start: L0, moves: [{ t0: H - 0.13, t1: H - 0.01, to: plantBy(L0, 9, 0.5, 6), lift: 3.2 }, { t0: 1.55, t1: 1.85, to: L0, lift: 2.8 }] },
    R: { start: R0, moves: [{ t0: H - 0.06, t1: H + 0.05, to: { ...R0, pitch: 18 } }, { t0: 1.55, t1: 1.8, to: R0 }] },
  });
}
/** The warning: the hoops glinting pink, from as they raise it to the blow. */
function blowGlint(t: number): number {
  if (t < 0.12 || t > H + 0.05) return 0;
  return t < OD_BLOW.warn[0] ? (t - 0.12) / (OD_BLOW.warn[0] - 0.12) : 1;
}
/** How hard it has just struck the floor: 1 as it lands, falling away as the dust settles. */
export function slamAt(t: number): number {
  const u = (t - OD_BLOW.floor) / 0.6;
  return u >= 0 && u < 1 ? 1 - u : 0;
}

// =============================================================================================
// THE QUAKE (their second blow, the bigger: his rule of 9 Oct, a medium monster two attacks, the bigger hit cooling down longer)

/**
 * The quake: the mallet raised high in both hands by `raised`, crouched and coiled under it, its hoops glinting pink (the
 * warning, `warn`); a dip, and they LEAP (both feet off the floor from `jump[0]`, highest at `apex`), the mallet swung
 * over the top as they come down; THE BLOW at `hit` (a frame of the game's thirty a second); the mallet's head and their
 * feet on the floor together at `floor`, the head about a tile before them, the floor shaking out round it; held there,
 * bent over it, to `held`; heaved back up onto the shoulder by `long`.
 */
export const OD_QUAKE = { long: 2.7, raised: 0.5, warn: [0.5, 0.86], jump: [0.93, 1.23], apex: 1.06, hit: 36 / 30, floor: 37 / 30, held: 1.62 } as const;
const QH = OD_QUAKE.hit;
const QF = OD_QUAKE.floor;
/** How far forward they land (their own lengths), and how high their feet leave the floor at the top of the leap. */
const LEAP = 7;
const LEAP_UP = 9;
/** Coiled under the raised mallet: crouched, the mallet high over the head and laid back, the head up. */
const COILED: P = elbowsTo({ ...RAISED, px: -2.0, pz: R.pz - 3.4, pitch: -2, bend: -10, faceUp: 18, rhx: 1.0, rhy: 3.0, rhz: 21.5, wEl: 132, lk: 18, rk: -18 }, [0.4, 1, 0.4], [0.4, -1, 0.4]);
const coiled = (k: number): P => ({ ...COILED, rhz: (COILED.rhz as number) + (k % 2 ? 0.6 : -0.2), px: (COILED.px as number) - 0.25 * (k % 2), roll: k % 2 ? 1.2 : -1.2 });
/** The dip before the leap: lower still, the mallet laid further back. */
const DIP: P = elbowsTo({ ...COILED, px: -1.2, pz: R.pz - 6.0, pitch: 4, bend: -6, faceUp: 14, wEl: 138, lk: 24, rk: -24 }, [0.4, 1, 0.4], [0.4, -1, 0.4]);
/** In the air, rising: stretched up, hips driving forward, the mallet still back over the head. */
const RISING: P = elbowsTo({ ...COILED, px: 2.0, pz: R.pz + 5.0, pitch: 4, bend: -16, faceUp: 14, rhz: 22, wEl: 134, lk: 6, rk: -6 }, [0.4, 1, 0.4], [0.4, -1, 0.4]);
/** At the top of the leap: the hips forward, the chest still back, the mallet at the top of its swing. */
const APEX: P = elbowsTo({ ...RISING, px: 3.6, pz: R.pz + 7.0, pitch: 16, bend: -20, faceUp: 10, rhx: 3.0, rhz: 21, wEl: 120, lk: 14, rk: -14 }, [0.4, 1, 0.4], [0.4, -1, 0.3]);
/** Coming down: the mallet over the top, gathering speed, a frame of the game's at a time. */
const FALL1: P = elbowsTo({ ...APEX, px: 5.0, pz: R.pz + 5.0, pitch: 24, bend: -10, faceUp: 8, rhx: 7.5, rhy: 1.5, rhz: 17, wEl: 92, lk: 16, rk: -16 }, [0.6, 1, -0.2], [0.6, -1, -0.2]);
const FALL2: P = elbowsTo({ ...FALL1, px: 6.4, pz: R.pz + 2.0, pitch: 30, bend: 0, faceUp: 2, rhx: 12.5, rhy: 2.0, rhz: 8, wEl: 50, lk: 18, rk: -18 }, [0.4, 1, -0.4], [0.4, -1, -0.4]);
/** THE BLOW: brought down before them as they land. */
const QDOWN: P = elbowsTo({ ...DOWN, px: 7.4, pz: R.pz - 3.0, pitch: 34, bend: 10, rhx: 15.5, rhz: -6, wEl: -6, lk: 20, rk: -20 }, [0.2, 1, -0.6], [0.2, -1, -0.6]);
/** IN THE FLOOR: the mallet's head slammed down, the body bent over it, the knees given, landed. */
const QFLOOR: P = elbowsTo({ ...FLOOR, px: 8.2, pz: R.pz - 8.6, pitch: 38, bend: 21, faceUp: -10, rhx: 14.5, rhz: -25, wEl: -18, lk: 26, rk: -26 }, [0.2, 1, -0.6], [0.2, -1, -0.6]);
function orderlyQuake(): Motion {
  return {
    hit: QH,
    keys: [
      { at: 0, pose: {} },
      // (lifted off the shoulder, the left hand coming to the handle)
      { at: 0.18, pose: elbowsTo({ px: -1.0, pitch: 0, bend: -2, faceUp: 8, rhIn: 1, rhx: 6, rhy: 1.5, rhz: 6, wAz: 182, wEl: 50, ...BOTH }, [0.4, 1, -0.2], [0.4, -1, -0.2]), ease: 'io', as: { wAz: 2, wEl: 130 } },
      { at: OD_QUAKE.raised, pose: COILED, ease: 'io' },
      { at: 0.59, pose: coiled(1), ease: 'io' },
      { at: 0.68, pose: coiled(2), ease: 'io' },
      { at: 0.77, pose: coiled(3), ease: 'io' },
      { at: OD_QUAKE.warn[1], pose: coiled(4), ease: 'io' },
      { at: OD_QUAKE.jump[0] - 0.01, pose: DIP, ease: 'io' },
      { at: 0.99, pose: RISING, ease: 'in' },
      { at: OD_QUAKE.apex, pose: APEX, ease: 'lin' },
      { at: QH - 2 / 30, pose: FALL1, ease: 'lin' },
      { at: QH - 1 / 30, pose: FALL2, ease: 'lin' },
      { at: QH, pose: QDOWN, ease: 'lin' },
      { at: QF, pose: QFLOOR, ease: 'lin' },
      { at: OD_QUAKE.held, pose: { ...QFLOOR, pz: (QFLOOR.pz as number) + 0.4, pitch: 37, bend: 20, faceUp: -6 }, ease: 'io' },
      { at: 2.0, pose: { ...HEAVE, px: (HEAVE.px as number) + 3.0 }, ease: 'io', as: HEAVE_AS },
      { at: OD_QUAKE.long, pose: {}, ease: 'io' },
    ],
  };
}
function orderlyQuakeFeet(): (t: number) => P {
  const [j0, j1] = OD_QUAKE.jump;
  return footwork(B, {
    L: { start: L0, moves: [{ t0: j0, t1: j1, to: plantBy(L0, LEAP, 0.5, 4), lift: LEAP_UP }, { t0: 1.9, t1: 2.3, to: L0, lift: 2.8 }] },
    R: { start: R0, moves: [{ t0: j0, t1: j1, to: plantBy(R0, LEAP, -0.5, -4), lift: LEAP_UP }, { t0: 2.15, t1: 2.5, to: R0, lift: 2.8 }] },
  });
}
/** The warning: the hoops glinting pink, from as they raise it to the blow. */
function quakeGlint(t: number): number {
  if (t < 0.2 || t > QH + 0.05) return 0;
  return t < OD_QUAKE.warn[0] ? (t - 0.2) / (OD_QUAKE.warn[0] - 0.2) : 1;
}
/** How hard the quake has just struck the floor: 1 as it lands, falling away as the dust settles. */
export function quakeAt(t: number): number {
  const u = (t - QF) / 0.7;
  return u >= 0 && u < 1 ? 1 - u : 0;
}

// =============================================================================================
// STRUCK

function orderlyReel(): Motion {
  return {
    keys: [
      { at: 0, pose: {} },
      { at: 0.06, pose: { px: -2.6, pz: R.pz + 0.5, pitch: -2, bend: -4, faceUp: R.faceUp + 22, faceTilt: R.faceTilt + 8, lhx: 1, lhy: 6, lhz: -18, rhz: R.rhz + 1.5, wEl: (R.wEl as number) + 8, out: 0.1 }, ease: 'out' },
      { at: 0.18, pose: { px: -1.0, pitch: 6, bend: 8, faceUp: R.faceUp + 6, wEl: (R.wEl as number) - 3 }, ease: 'io' },
      { at: 0.4, pose: {}, ease: 'io' },
    ],
  };
}

// =============================================================================================
// THEIR DEATH: A FELLED TREE

/** How long; when the mallet slips from their hands; the lurching step; when they begin to go over; when they hit the floor. */
export const OD_DIES = { long: 2.6, drop: 0.3, step: [0.36, 0.6], over: 0.9, down: 1.52 } as const;
/** The lurching step: the right foot forward to catch them; and the feet as they rock up onto their toes going over. */
const STEP_R: Plant = plantBy(R0, 9, 0.5, 4);
/** And the left brought up beside it, the feet together as they go over. */
const STEP_L: Plant = plantBy(L0, 9, -0.5, -4);
const TOE = 76;
function orderlyDyingFeet(): (t: number) => P {
  return footwork(B, {
    L: { start: L0, moves: [{ t0: OD_DIES.step[1] - 0.04, t1: OD_DIES.over, to: STEP_L, lift: 2.6 }, { t0: OD_DIES.over + 0.06, t1: OD_DIES.down - 0.04, to: { ...STEP_L, pitch: TOE } }] },
    R: { start: R0, moves: [{ t0: OD_DIES.step[0], t1: OD_DIES.step[1], to: STEP_R, lift: 3.4 }, { t0: OD_DIES.over + 0.06, t1: OD_DIES.down - 0.04, to: { ...STEP_R, pitch: TOE } }] },
  });
}
/** The arms hanging along them (in the chest's own space), so that they go over with the body. */
const HANG_LEN = (B.upperArm + B.foreArm) * 0.96;
const ALONG: P = { lhIn: 0, lhx: 1.5, lhy: 1.2, lhz: -HANG_LEN, le: -6, rhIn: 0, rhx: 1.5, rhy: -1.2, rhz: -HANG_LEN, re: 6 };
/** Their whole length leaning `lean` degrees forward of upright, stiff from the ankles (as the feet are then), the head lifted a little, the face turning to the side as it nears the floor. */
function felled(lean: number, t: number): P {
  const feet = orderlyDyingFeet()(t);
  const s0 = solve(B, { ...R, ...feet, ...ALONG } as Posed);
  const ankle = lerp3(s0.ankleL, s0.ankleR, 0.5);
  const reach = (B.thigh + B.shank) * 0.985;
  const D = Math.PI / 180;
  const hip: V3 = [ankle[0] + reach * Math.sin(lean * D), ankle[1], ankle[2] + reach * Math.cos(lean * D)];
  const hipH = B.ankle + B.shank + B.thigh;
  const k = clamp01((lean - 40) / 45);
  return { px: hip[0], py: hip[1], pz: hip[2] - hipH, yaw: 0, pitch: lean, roll: 0, twist: 0, bend: 4 - 6 * k, side: 0, faceUp: 10 * (1 - k) - 20 * k, faceTurn: 70 * k, faceTilt: 30 * k, lk: 0, rk: 0, lkUp: -lean, rkUp: -lean, ...ALONG, out: 1 };
}
/** Their solids' lowest point in a pose (the figure's own lengths). */
function lowOf(q: Posed): number {
  const s = solve(B, q);
  const c = orderlySolids(s);
  let low = Infinity;
  for (const o of c.lumps) low = Math.min(low, o.c[2] - Math.hypot(o.h[0] * o.rot[0][2], o.h[1] * o.rot[1][2], o.h[2] * o.rot[2][2]));
  for (const l of c.limbs) if (/^(upper|fore|neck|leg)/.test(l.name)) low = Math.min(low, Math.min(l.a[2], l.b[2]) - l.r);
  return low;
}
/** How far over they go before the lowest of them rests on the floor. */
const LAID = ((): number => {
  let lo = 60;
  let hi = 100;
  for (let i = 0; i < 30; i++) {
    const m = (lo + hi) / 2;
    if (lowOf({ ...R, ...felled(m, OD_DIES.long), ...orderlyDyingFeet()(OD_DIES.long) } as Posed) > 0.6) lo = m;
    else hi = m;
  }
  return lo;
})();
/** Their arms where they fell, laid on the floor along them. */
function laidArms(body: P, t: number): P {
  const feet = orderlyDyingFeet()(t);
  const s = solve(B, { ...R, ...body, ...feet } as Posed);
  const flat = (h: V3, out: number): V3 => [h[0], h[1] + out, Math.max(2.4, h[2])];
  const Lh = flat(s.handL, 3.5);
  const Rh = flat(s.handR, -3.5);
  const q = { ...R, ...body, ...feet, lhIn: 2, lhx: Lh[0], lhy: Lh[1], lhz: Lh[2], rhIn: 2, rhx: Rh[0], rhy: Rh[1], rhz: Rh[2] } as Posed;
  const le = elbowFor(B, q, true, norm([0, 1, 0.6]));
  const re = elbowFor(B, { ...q, le } as Posed, false, norm([0, -1, 0.6]));
  return { ...body, lhIn: 2, lhx: Lh[0], lhy: Lh[1], lhz: Lh[2], rhIn: 2, rhx: Rh[0], rhy: Rh[1], rhz: Rh[2], le, re };
}
function orderlyDying(): Motion {
  const keys: Key3[] = [
    { at: 0, pose: {} },
    { at: 0.08, pose: { px: -2.8, pz: R.pz + 0.5, pitch: -4, bend: -6, faceUp: R.faceUp + 24, rhz: R.rhz + 2, out: 0.15 }, ease: 'out' },
    // (the mallet slipping off the shoulder, the hands opening)
    { at: OD_DIES.drop, pose: { px: -2.0, pz: R.pz + 0.2, pitch: -2, bend: -4, faceUp: 18, rhIn: 1, rhx: 4, rhy: -6, rhz: -12, lhIn: 1, lhx: 3, lhy: 6, lhz: -16, out: 0.45 }, ease: 'io' },
    // (the lurching step forward, the body pitching after it)
    { at: OD_DIES.step[1], pose: { ...ALONG, px: 5.0, pz: R.pz - 1.2, pitch: 8, bend: 6, faceUp: 4, faceTilt: 6, out: 0.8 }, ease: 'io' },
  ];
  // (stiff, swaying, then over: gathering speed all the way down)
  const t0 = OD_DIES.over;
  const t1 = OD_DIES.down;
  keys.push({ at: t0, pose: felled(9, t0), ease: 'io' });
  const n = Math.round((t1 - t0) * 30);
  for (let i = 1; i <= n; i++) {
    const t = t0 + ((t1 - t0) * i) / n;
    const u = i / n;
    keys.push({ at: t, pose: felled(9 + (LAID - 9) * u * u, t), ease: 'lin' });
  }
  const DOWN_POSE = laidArms(felled(LAID, OD_DIES.long), OD_DIES.long);
  keys.push({ at: t1 + 0.1, pose: { ...DOWN_POSE, pz: (DOWN_POSE.pz as number) + 1.2 }, ease: 'out' });
  keys.push({ at: t1 + 0.28, pose: DOWN_POSE, ease: 'io' });
  keys.push({ at: OD_DIES.long, pose: DOWN_POSE, ease: 'io' });
  return { keys };
}

// =============================================================================================
// THEM, AS THE GAME HOLDS A MONSTER

const NAMES = { stand: 'The orderlies stand, watching', walk: 'The orderlies trudge', attack: 'The mallet blow', quake: 'The quake', reel: 'The orderlies are struck', dying: 'The orderlies go down like felled trees' } as const;
function orderlyMob(): Mob {
  const paint = orderlyPainter({
    mallet: (m: Moment) => !(m.dying && m.t >= OD_DIES.drop),
    slam: (m: Moment) => (m.move === NAMES.attack ? slamAt(m.t) : m.move === NAMES.quake ? quakeAt(m.t) : 0),
  });
  const mv = (name: string, motion: Motion, more: Partial<MobMove> = {}): MobMove => ({ name, motion, rest: R, ...more });
  return {
    id: 'orderly',
    name: "The Physician's orderly",
    size: 'medium: a head over the knight',
    build: B,
    stand: mv(NAMES.stand, orderlyStand()),
    attack: mv(NAMES.attack, orderlyBlow(), { feet: orderlyBlowFeet(), glint: blowGlint, trail: (s: Skeleton) => { const k = malletOf(s); return [k.faceA, k.head, k.faceB]; }, trailSpan: 2.4 }),
    idleFrames: 32,
    idleFps: 10,
    walk: mv(NAMES.walk, orderlyWalk(), { period: OD_WALK.frames / OD_WALK.fps, ground: OD_PACE * TILE3 }),
    walkFrames: OD_WALK.frames,
    walkFps: OD_WALK.fps,
    pace: OD_PACE,
    // (their second blow, the bigger: the game names it 'quake')
    more: {
      quake: mv(NAMES.quake, orderlyQuake(), { feet: orderlyQuakeFeet(), glint: quakeGlint, blurAt: QH, trail: (s: Skeleton) => { const k = malletOf(s); return [k.faceA, k.head, k.faceB]; }, trailSpan: 2.4 }),
    },
    reel: mv(NAMES.reel, orderlyReel()),
    reelTime: 0.4,
    hit: H,
    warn: OD_BLOW.warn[1] - OD_BLOW.warn[0],
    dieTime: OD_DIES.long,
    dying: mv(NAMES.dying, orderlyDying(), { feet: orderlyDyingFeet() }),
    aura: { x: ORDERLY_CANVAS.ax, y: ORDERLY_CANVAS.ay - 50, r: 40, color: '#5a1838', a: 0.07 },
    shadow: 13,
    canvas: ORDERLY_CANVAS,
    trueBack: true,
    bits: paint.bits,
    grains: paint.grains,
    // (the mallet slips from their hands and falls behind them to their right)
    fall(piece) {
      if (piece === 'mallet') return { from: OD_DIES.drop, to: [-24, -22], spin: 50, lay: 'axis', hop: 1.2 };
      return null;
    },
  };
}
export const ORDERLY = orderlyMob();
export function makeOrderlyArt3(pace = ORDERLY.pace): ActorArt {
  return { front: mobSet(ORDERLY, 'front', pace), back: mobSet(ORDERLY, 'back', pace) };
}

// =============================================================================================
// THEM AS THE CHECKS SEE THEM (art/boss_checks.ts)

export function orderlySolids(s: Skeleton): { limbs: CheckLimb[]; lumps: CheckLump[] } {
  const [rH, rK, rA] = B.legR;
  const [r0, r1] = B.armR;
  const limbs: CheckLimb[] = [];
  for (const side of ['L', 'R'] as const) {
    const L = side === 'L';
    limbs.push(
      { name: `leg${side}`, a: L ? s.hipL : s.hipR, b: L ? s.kneeL : s.kneeR, r: rH * 1.08 },
      { name: `shin${side}`, a: L ? s.kneeL : s.kneeR, b: L ? s.ankleL : s.ankleR, r: Math.max(rK, rA) * 1.2 },
      { name: `foot${side}`, a: add(L ? s.heelL : s.heelR, [0, 0, 1.9]), b: add(L ? s.toeL : s.toeR, [0, 0, 1.9]), r: 2.1 },
      { name: `upper${side}`, a: L ? s.shoulderL : s.shoulderR, b: L ? s.elbowL : s.elbowR, r: r0 * 1.22 },
      { name: `fore${side}`, a: L ? s.elbowL : s.elbowR, b: L ? s.handL : s.handR, r: r1 * 1.18 },
    );
  }
  limbs.push({ name: 'neck', a: s.neck, b: lerp3(s.neck, s.head, 0.5), r: 3.2 });
  const waistC = add(s.pelvis, mul(s.hips[2], B.waist * 0.6));
  const lumps: CheckLump[] = [
    { name: 'head', c: s.head, rot: s.face, h: [B.headR[0] * 1.04, B.headR[1] * 1.14, B.headR[2]] },
    { name: 'chest', c: lerp3(s.ribs, s.neck, 0.3), rot: s.chest, h: [B.ribDeep + 2.0, B.ribHalf + 2.0, len3(sub(s.neck, s.ribs)) * 0.55] },
    { name: 'belly', c: lerp3(waistC, s.ribs, 0.45), rot: s.belly, h: [B.waistDeep + 2.2, B.waistHalf + 1.8, Math.max(3, len3(sub(s.ribs, waistC)) * 0.6)] },
    { name: 'hips', c: add(s.pelvis, mul(s.hips[2], B.waist * 0.2)), rot: s.hips, h: [B.pelvisDeep + 2.2, B.pelvisHalf + 2.4, B.waist * 0.75] },
  ];
  return { limbs, lumps };
}
function malletThings(s: Skeleton): CheckThing[] {
  const k = malletOf(s);
  return [
    // (its handle in the hands, and lying on the right shoulder as it is carried)
    { name: 'mallet handle', pts: [k.butt, lerp3(k.butt, k.neck, 0.33), lerp3(k.butt, k.neck, 0.66), k.neck], r: 1.1, may: ['foreR', 'foreL', 'upperR'] },
    { name: 'mallet head', pts: [k.faceA, lerp3(k.faceA, k.faceB, 0.25), k.head, lerp3(k.faceA, k.faceB, 0.75), k.faceB], r: MALLET.r, may: [] },
  ];
}
export const OD_SHAPE: BossShape = {
  body: orderlySolids,
  // (what they strike with: the mallet's head, while it is theirs)
  tip: (move, t, s) => (move === 'dying' && t >= OD_DIES.drop ? null : malletOf(s).head),
  things: (move, t, s) => (move === 'dying' && t >= OD_DIES.drop ? [] : malletThings(s)),
};
