// THE ORDER'S DREDGERS: THEIR MOVES (the art chat for floors 11 to 15, 19 Oct 2026). A MOCK-UP: NOT IN THE GAME, behind
// DREDGERS_ON (art/dredgers.ts, off). Their look and brief are art/dredgers.ts: made on his word of 18 Oct, 21:24
// Pacific, “Hey go without my say so.  If something is shit I’ll get it to it but you’re doing a great jobs. At least
// for 11-15”, the picks this chat would have marked recommended, and sent him with their films.
//
// THEIR MOVES:
//   STANDING (art/dredgers.ts): stooped, leaning on the boathook stood at their right side; the masked head turning
//     slowly, listening down the tunnel; the creel shrugged higher on the back once a round.
//   THE WADE: slow and heavy, the waders lifted high and set down as if through water; the boathook carried upright in
//     the right hand, its butt off the floor.
//   THE HOOK AND HAUL (their blow): the boathook taken in both hands and levelled low before them; drawn back, the
//     body wound round to the right, its hook glinting pink (THE WARNING), held shaking; then, hips first, a lunge,
//     the pole thrust out its whole length; a twist as the hook bites; and a hard haul back, leaning into it, a step
//     back; and the pole stood again at the right side.
//   STRUCK: jolted back, the masked head snapped back, the jars clinking.
//   THE JARS BURST (their death): rocked back; the jars in the creel crack and the lid is flung off; the voices pour
//     up out of it, pink going pale as they go free; the head thrown back; the boathook drops; emptied, they sink to
//     their knees, sway, and fall on their faces.
//
// By his rulebook: every move through every check the bosses have (art/boss_checks.ts), from in front and behind:
// their feet grip the floor; nothing through them, the boathook too; nothing in the floor; nothing jerky; the blow
// drawn back, held and carried through, hips first; alive when still.
//   test: tsx --test tests/dredgers.test.ts

import { footwork, kneelHips, kneelSettle, plantBy, plantOf } from './bosses3';
import type { Plant } from './bosses3';
import type { BossShape, CheckLimb, CheckLump, CheckThing } from './boss_checks';
import type { ActorArt } from './actor_types';
import { DREDGER_BODY, DREDGER_CANVAS, DREDGER_REST, POLE, POLE_HOLD, creelLump, dredgerPainter, dredgerStand, poleGrip, poleOf } from './dredgers';
import { TILE3, mobSet } from './new_mobs3';
import type { Mob, MobMove } from './new_mobs3';
import { add, dot, elbowFor, heading, len, lerp3, mul, norm, solve, sub } from './skeleton';
import type { Bones, Key3, Motion, Posed, Skeleton, V3 } from './skeleton';

type P = Partial<Bones>;
const B = DREDGER_BODY;
const R = DREDGER_REST;
const L0 = plantOf(B, 'L', {}, R);
const R0 = plantOf(B, 'R', {}, R);
const sm = (v: number): number => {
  const c = Math.max(0, Math.min(1, v));
  return c * c * (3 - 2 * c);
};

/** Their elbows pointed as nearly toward these ways as their arms let them (the figure's own axes). */
function elbowsTo(pose: P, wantL: V3 | null, wantR: V3 | null): P {
  const q = { ...R, ...pose } as Posed;
  const le = wantL ? elbowFor(B, q, true, norm(wantL)) : q.le;
  const re = wantR ? elbowFor(B, { ...q, le } as Posed, false, norm(wantR)) : q.re;
  return { ...pose, le, re };
}
/** The draw at which their right hand holds the boathook as they carry it and stand it. */
const CARRY_DRAW = R.draw;
/** As they thrust it: the right hand at its butt end, the left hand a forearm and more further up toward its head. */
const THRUST_DRAW = 0;
const LEFT_ON = 10;
/** The way its hook stands out as they lean on it, turned out to their right. */
const HOOK_OUT: V3 = [0.3, -0.95, 0];
/**
 * A pose with both hands on the boathook: the body as `body` says, the right hand at `hand` (from the pelvis's place
 * over the floor: their forward, left and up), the pole pointing `az`, `el` (degrees), its hook standing out to `edge`.
 */
const both = (body: P, hand: V3, az: number, el: number, edge: V3): P => ({ ...body, ...poleGrip([hand[0] + ((body.px as number) ?? 0), hand[1] + ((body.py as number) ?? 0), hand[2]], heading(az, el), edge, THRUST_DRAW, LEFT_ON) });

// ---------------------------------------------------------------------------------------------
// THE WADE

/** Their wade: twelve frames at eight a second, painted for DR_PACE tiles a second. */
export const DR_PACE = 0.85;
export const DR_WALK = { frames: 12, fps: 8 } as const;
/** A foot of a walk of `n` frames, `k` frames into its round: down from the first frame to the middle one, carried back under the figure; then lifted high (as out of water) and swung through. Forward, lift, how its sole is tipped. */
function stepFoot(k: number, n: number, step: number, lift: number): [number, number, number] {
  const half = n / 2;
  if (k <= half) return [step * (half / 2 - k), 0, 0];
  const u = (k - half) / half;
  const g = u * u * (3 - 2 * u);
  return [-step * (half / 2) + step * half * g, lift * Math.sin(Math.PI * u), 18 * Math.sin(Math.PI * u) * (1 - u) - 8 * Math.sin(Math.PI * u) * u];
}
/** The boathook carried upright in the right hand, its butt off the floor. */
const CARRY = (dx: number, dz: number): P => poleGrip([4.8 + dx, -12.0, 44 + dz], heading(0, 84), HOOK_OUT, CARRY_DRAW, null);
function dredgerWalk(): Motion {
  const n = DR_WALK.frames;
  const d = (DR_PACE * TILE3) / DR_WALK.fps;
  const keys: Key3[] = [];
  for (let i = 0; i <= n; i++) {
    const j = i % n;
    const a = (j / n) * Math.PI * 2;
    const [lx, lz, lp] = stepFoot(j, n, d, 4.6);
    const [rx, rz, rp] = stepFoot((j + n / 2) % n, n, d, 4.6);
    // (the body sinking onto each wader as it comes down, rolling over it, leaning into the going; the pole nodding)
    const sag = Math.abs(Math.sin(a));
    keys.push({
      at: i / DR_WALK.fps,
      ease: 'lin',
      pose: {
        ...elbowsTo({ ...CARRY(1.2 * Math.sin(a), -1.2 * sag), lhIn: 1, lhx: R.lhx + 3.0 * Math.sin(a + Math.PI), lhy: R.lhy, lhz: R.lhz + 0.8 * sag }, null, [-0.7, -0.05, -1]),
        pz: R.pz - 1.2 * sag, py: 1.4 * Math.sin(a), roll: R.roll + 4 * Math.sin(a), yaw: 4 * Math.cos(a), side: R.side + 1.6 * Math.sin(a),
        bend: R.bend + 2 * sag, pitch: R.pitch + 3, faceUp: R.faceUp - 2 * sag, faceTilt: R.faceTilt + 5 * Math.sin(a), faceTurn: R.faceTurn + 4 * Math.cos(a),
        lfx: lx, lfz: lz, lfp: lp, lfy: R.lfy, lft: R.lft,
        rfx: rx, rfz: rz, rfp: rp, rfy: R.rfy, rft: R.rft,
      },
    });
  }
  return { keys, loop: 0 };
}

// ---------------------------------------------------------------------------------------------
// THE HOOK AND HAUL

/** Their blow: how long; when the pole is thrust out its whole length (a frame of the game's thirty a second); when the warning is held from and to; when the hook bites, and when the haul is hardest. */
export const DR_HAUL = { long: 2.0, hit: 22 / 30, warn: [0.3, 0.6], bite: 22 / 30 + 0.26, haul: 22 / 30 + 0.52 } as const;
const H = DR_HAUL.hit;
/** Taking it up: the boathook lifted off the floor and levelled low before them in both hands, its hook down. */
const TAKE: P = elbowsTo(both({ px: -0.4, pz: R.pz, yaw: -6, twist: -4, pitch: 6, bend: 6, side: 0, roll: 0, faceUp: 6, faceTilt: -2, faceTurn: 4, lk: 9, rk: -9 }, [2, -8, 33], 10, 8, [0, 0, -1]), [0.1, 0.7, -0.7], [-0.6, -0.6, -0.5]);
/** DRAWN BACK (the warning): the body wound round to the right, back on the back foot, the pole drawn back along itself, its hook up a little and glinting. */
const DRAWN: P = elbowsTo(both({ px: -2.6, pz: R.pz + 0.3, yaw: -12, twist: -10, pitch: 2, bend: 2, side: 2, roll: -1, faceUp: 8, faceTilt: 0, faceTurn: 8, lk: 12, rk: -12 }, [-6, -9, 34], 8, 9, [0, 0, -1]), [0.1, 0.7, -0.7], [-0.7, -0.5, -0.4]);
const shaking = (k: number): P => ({ ...DRAWN, rhz: (DRAWN.rhz as number) + (k % 2 ? 0.7 : -0.4), rhy: (DRAWN.rhy as number) + (k % 2 ? -0.35 : 0.25), px: (DRAWN.px as number) - 0.2 * (k % 2), rhx: (DRAWN.rhx as number) - 0.2 * (k % 2) });
/** The drive: the hips coming round and forward over the stepping foot, the pole still drawn back (hips first). */
const DRIVE: P = elbowsTo(both({ px: 2.4, pz: R.pz - 0.8, yaw: 2, twist: -14, pitch: 8, bend: 4, side: 1, roll: 0, faceUp: 6, faceTilt: 0, faceTurn: 4, lk: 14, rk: -8 }, [-4, -8.5, 34], 6, 6, [0, 0, -1]), [0.1, 0.7, -0.7], [-0.7, -0.5, -0.4]);
/** THE THRUST: lunged forward onto the front foot, both arms driving, the pole out its whole length before them, a little down. */
const THRUST: P = elbowsTo(both({ px: 8.5, pz: R.pz - 3.0, yaw: 8, twist: 6, pitch: 16, bend: 10, side: -1, roll: 1, faceUp: 10, faceTilt: 0, faceTurn: -2, lk: 26, rk: -4 }, [8, -5, 36], 3, -5, [0, 0, -1]), [0, 0.6, -0.8], [-0.3, -0.7, -0.6]);
/** Carried on through to its whole length, the arms straight. */
const OVER: P = elbowsTo(both({ px: 9.4, pz: R.pz - 3.2, yaw: 9, twist: 8, pitch: 18, bend: 12, side: -1, roll: 1, faceUp: 10, faceTurn: -2, lk: 28, rk: -3 }, [14, -4.6, 35], 2, -6, [0, 0, -1]), [0, 0.6, -0.8], [-0.2, -0.7, -0.6]);
/** THE BITE: held out there, the pole twisted a quarter round in the hands, its hook turned to catch. */
const BITE: P = elbowsTo(both({ px: 9.0, pz: R.pz - 3.0, yaw: 8, twist: 6, pitch: 16, bend: 11, side: -1, roll: 1, faceUp: 10, faceTurn: -2, lk: 27, rk: -4 }, [14, -4.8, 35.4], 2, -6, [0, 1, 0]), [0, 0.6, -0.8], [-0.2, -0.7, -0.6]);
/** THE HAUL: leaning back hard into it, stepped back, the pole hauled in along itself to the hip. */
const HAUL: P = elbowsTo(both({ px: -3.5, pz: R.pz + 0.2, yaw: -8, twist: -8, pitch: -10, bend: -10, side: 2, roll: -1, faceUp: 14, faceTilt: 2, faceTurn: 6, lk: 10, rk: -14 }, [-9, -9, 37], 5, 4, [0, 1, 0]), [0.1, 0.7, -0.7], [-0.8, -0.4, -0.4]);
const HAULED: P = elbowsTo(both({ ...HAUL, px: -3.0, pitch: -6, bend: -6, faceUp: 10 }, [-7, -9, 36], 5, 4, [0, 1, 0]), [0.1, 0.7, -0.7], [-0.8, -0.4, -0.4]);
/** The pole swung up at their right side in the right hand, upright, to be stood on its butt again; the left hand let go of it, hanging. */
const UPRIGHT: P = elbowsTo({ px: 1.2, pz: R.pz - 0.4, yaw: 2, twist: 0, pitch: 6, bend: 6, side: 0, roll: 0, faceUp: 4, faceTilt: -2, faceTurn: 2, lk: 10, rk: -9, ...poleGrip([7, -11.5, 40], heading(0, 80), HOOK_OUT, THRUST_DRAW, null), lhIn: 1, lhx: R.lhx, lhy: R.lhy, lhz: R.lhz }, null, [-0.5, -0.7, -0.7]);
function dredgerHaul(): Motion {
  return {
    hit: H,
    keys: [
      { at: 0, pose: {} },
      { at: 0.14, pose: TAKE, ease: 'io' },
      { at: DR_HAUL.warn[0], pose: DRAWN, ease: 'out' },
      { at: 0.38, pose: shaking(1), ease: 'io' },
      { at: 0.46, pose: shaking(2), ease: 'io' },
      { at: 0.54, pose: shaking(3), ease: 'io' },
      { at: DR_HAUL.warn[1], pose: shaking(4), ease: 'io' },
      { at: H - 0.08, pose: DRIVE, ease: 'in' },
      { at: H, pose: THRUST, ease: 'lin' },
      { at: H + 0.08, pose: OVER, ease: 'out' },
      { at: DR_HAUL.bite, pose: BITE, ease: 'io' },
      { at: DR_HAUL.haul, pose: HAUL, ease: 'io' },
      { at: DR_HAUL.haul + 0.14, pose: HAULED, ease: 'io' },
      { at: 1.62, pose: UPRIGHT, ease: 'io' },
      { at: DR_HAUL.long, pose: {}, ease: 'io' },
    ],
  };
}
function dredgerHaulFeet(): (t: number) => P {
  return footwork(B, {
    L: { start: L0, moves: [{ t0: H - 0.14, t1: H - 0.02, to: plantBy(L0, 10, 1, 8), lift: 3.0 }, { t0: DR_HAUL.bite + 0.06, t1: DR_HAUL.haul, to: plantBy(L0, 1, 1, 0), lift: 2.6 }, { t0: 1.6, t1: 1.84, to: L0, lift: 2.4 }] },
    R: { start: R0, moves: [{ t0: 0.12, t1: 0.26, to: plantBy(R0, -1.5, -1, -12), lift: 2.2 }, { t0: DR_HAUL.bite + 0.1, t1: DR_HAUL.haul + 0.04, to: plantBy(R0, -5, -1, -12), lift: 2.4 }, { t0: 1.56, t1: 1.8, to: R0, lift: 2.4 }] },
  });
}
/** The warning: the hook glinting pink, from as they take it up until it bites. */
function haulGlint(t: number): number {
  if (t < 0.14 || t > DR_HAUL.bite + 0.2) return 0;
  return t < DR_HAUL.warn[0] ? (t - 0.14) / (DR_HAUL.warn[0] - 0.14) : t <= DR_HAUL.bite ? 1 : 1 - (t - DR_HAUL.bite) / 0.2;
}

// ---------------------------------------------------------------------------------------------
// STRUCK

function dredgerReel(): Motion {
  return {
    keys: [
      { at: 0, pose: {} },
      { at: 0.06, pose: { px: -2.4, pz: R.pz + 0.5, pitch: 0, bend: 0, faceUp: R.faceUp + 22, faceTilt: R.faceTilt + 8, lhx: 2.0, lhy: 5, lhz: -17, wEl: (R.wEl as number) - 6, out: 0.1 }, ease: 'out' },
      { at: 0.18, pose: { px: -1.0, pitch: 8, bend: 10, faceUp: R.faceUp + 6, wEl: (R.wEl as number) + 2 }, ease: 'io' },
      { at: 0.4, pose: {}, ease: 'io' },
    ],
  };
}

// ---------------------------------------------------------------------------------------------
// THE JARS BURST

export const DR_DIES = { long: 2.6, burst: [0.12, 0.3], lid: 0.2, pour: [0.18, 1.9], gasp: 0.4, drop: 0.42, knees: 1.0, down: 2.1 } as const;
const DIE_FEET = ((): Record<'L' | 'R', Plant> => ({ L: plantBy(L0, R0.at[0] - L0.at[0] + 3, 0), R: R0 }))();
const TUCK = 56;
const KNEE_DOWN = B.legR[1] * 1.3;
const kneeling = (lean: number, body: P): P => kneelSettle(B, R, { ...kneelHips(B, R, DIE_FEET, TUCK, KNEE_DOWN, lean), ...body }, DIE_FEET, TUCK, KNEE_DOWN);
const HANG = -(B.upperArm + B.foreArm) * 0.9;
const HANGING: P = { lhIn: 0, lhx: 3, lhy: 9, lhz: HANG + 4, le: -10, rhIn: 0, rhx: 3, rhy: -9, rhz: HANG + 4, re: 10 };
/** Their arms laid limp on the floor where their body puts them as it goes down: each hand `back` behind its shoulder and `out` to its side. */
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
const ON_KNEES: P = kneeling(6, { yaw: 0, pitch: 4, roll: 2, twist: 0, bend: 6, side: 1, faceTurn: 0, faceUp: 0, faceTilt: 10, ...HANGING });
const FOLD: P = kneeling(14, { yaw: 4, pitch: 28, roll: 3, twist: 0, bend: 22, side: 1, faceTurn: 6, faceUp: -30, faceTilt: 8, ...HANGING });
const SLUMP: P = limp(kneeling(30, { yaw: 6, pitch: 62, roll: 2, twist: 0, bend: 24, side: 0, faceTurn: 14, faceUp: -48, faceTilt: 14 }), 8, 10);
const PRONE: P = { ...limp(lifted(kneeling(66, { yaw: 8, pitch: 80, roll: 6, twist: 0, bend: 8, side: 0, faceTurn: 30, faceUp: -36, faceTilt: 22 }), 2.6), 24, 10), out: 1 };
function dredgerDying(): Motion {
  return {
    keys: [
      { at: 0, pose: {} },
      { at: 0.08, pose: { px: -2.2, pz: R.pz, pitch: 0, bend: 0, faceUp: R.faceUp + 14, out: 0.1 }, ease: 'out' },
      // the jars bursting on their back: thrown forward by it, the head jerked
      { at: 0.24, pose: { px: -1.4, pz: R.pz + 0.3, pitch: 10, bend: 8, faceUp: R.faceUp + 4, faceTilt: 8, faceTurn: -8, out: 0.25 }, ease: 'io' },
      // the head thrown back as the voices pour out of them, the left arm falling open
      { at: DR_DIES.gasp, pose: { px: -1.8, pz: R.pz + 0.9, pitch: -6, bend: -12, faceUp: 40, faceTilt: 0, faceTurn: 0, lhIn: 1, lhx: -1, lhy: 7, lhz: -17, out: 0.5 }, ease: 'out' },
      // the boathook drops from the hand (DR_DIES.drop): the right arm falls to their side
      { at: 0.62, pose: { px: -1.6, pz: R.pz + 0.5, pitch: -5, bend: -10, faceUp: 34, faceTilt: 4, lhIn: 1, lhx: -0.6, lhy: 6.5, lhz: -18, rhIn: 1, rhx: -0.6, rhy: -6.5, rhz: -18, out: 0.85 }, ease: 'io' },
      // their knees give
      { at: 0.8, pose: { px: -0.6, pz: R.pz - 5, pitch: 4, bend: 4, faceUp: 14, lk: 26, rk: -26, ...HANGING, out: 1 }, ease: 'in' },
      { at: DR_DIES.knees, pose: { ...ON_KNEES, out: 1 }, ease: 'out' },
      { at: 1.22, pose: { ...ON_KNEES, pz: (ON_KNEES.pz as number) + 0.6, pitch: 0, roll: -3, faceUp: 8, out: 1 }, ease: 'io' },
      { at: 1.5, pose: { ...ON_KNEES, pitch: 10, roll: 4, faceUp: -6, out: 1 }, ease: 'io' },
      // and fall forward onto their faces, and lie still
      { at: 1.72, pose: { ...FOLD, out: 1 }, ease: 'in' },
      { at: 1.9, pose: { ...SLUMP, out: 1 }, ease: 'lin' },
      { at: DR_DIES.down, pose: PRONE, ease: 'out' },
      { at: DR_DIES.long, pose: PRONE, ease: 'io' },
    ],
  };
}
function dredgerDyingFeet(): (t: number) => P {
  const F = DIE_FEET;
  return footwork(B, {
    L: { start: L0, moves: [{ t0: 0.04, t1: 0.26, to: F.L, lift: 2.6 }, { t0: 0.62, t1: 0.96, to: { ...F.L, pitch: TUCK } }] },
    R: { start: R0, moves: [{ t0: 0.62, t1: 0.96, to: { ...F.R, pitch: TUCK } }] },
  });
}
/** How far the jars have burst; how much of the voices is pouring out of the creel now; how far they have gone free. */
const dieBurst = (t: number): number => sm((t - DR_DIES.burst[0]) / (DR_DIES.burst[1] - DR_DIES.burst[0]));
const diePour = (t: number): number => (t < DR_DIES.pour[0] || t > DR_DIES.pour[1] ? 0 : sm((t - DR_DIES.pour[0]) / 0.1) * (1 - sm((t - 1.3) / (DR_DIES.pour[1] - 1.3))));
const dieFreed = (t: number): number => sm((t - 0.5) / 0.8);

// ---------------------------------------------------------------------------------------------
// THEM, AS THE GAME HOLDS A MONSTER

function dredgerMob(): Mob {
  const paint = dredgerPainter({ burst: dieBurst, burstAt: DR_DIES.burst[0], pour: diePour, freed: dieFreed });
  const mv = (name: string, motion: Motion, more: Partial<MobMove> = {}): MobMove => ({ name, motion, rest: R, ...more });
  return {
    id: 'dredger',
    name: 'A dredger of the Silent Order',
    size: 'medium: the knight\'s height, heavier',
    build: B,
    stand: mv('The dredgers lean on their boathooks, listening', dredgerStand()),
    attack: mv('The hook and haul', dredgerHaul(), { feet: dredgerHaulFeet(), glint: haulGlint, trail: (s, q) => [poleOf(s, q).hook, poleOf(s, q).tip], trailSpan: 2.4 }),
    idleFrames: 30,
    idleFps: 10,
    walk: mv('The dredgers wade', dredgerWalk(), { period: DR_WALK.frames / DR_WALK.fps, ground: DR_PACE * TILE3 }),
    walkFrames: DR_WALK.frames,
    walkFps: DR_WALK.fps,
    pace: DR_PACE,
    reel: mv('The dredgers are struck', dredgerReel(), { glint: (t) => (t < 0.3 ? 1 - t / 0.3 : 0) }),
    reelTime: 0.4,
    hit: H,
    warn: DR_HAUL.warn[1] - DR_HAUL.warn[0],
    dieTime: DR_DIES.long,
    dying: mv('The jars burst', dredgerDying(), { feet: dredgerDyingFeet() }),
    aura: { x: DREDGER_CANVAS.ax, y: DREDGER_CANVAS.ay - 40, r: 36, color: '#9890b4', a: 0.06 },
    shadow: 12,
    canvas: DREDGER_CANVAS,
    trueBack: true,
    bits: paint.bits,
    grains: paint.grains,
    // (the boathook drops from their hand and falls clear to their right; the creel's lid is flung off behind them as the jars burst)
    fall(piece) {
      if (piece === 'boathook') return { from: DR_DIES.drop, to: [-14, -32], spin: 60, lay: 'axis', hop: 1.4 };
      if (piece === 'lid') return { from: DR_DIES.lid, to: [-30, 22], spin: 160, lay: 'flat', hop: 2.2, rise: 10 };
      return null;
    },
  };
}
export const DREDGER = dredgerMob();
export function makeDredgerArt3(mob: Mob = DREDGER, pace = mob.pace): ActorArt {
  return { front: mobSet(mob, 'front', pace), back: mobSet(mob, 'back', pace) };
}

// ---------------------------------------------------------------------------------------------
// THEM AS THE CHECKS SEE THEM (art/boss_checks.ts): their outside as painted, by name, and the boathook while it is theirs

const len3 = (v: V3): number => Math.hypot(v[0], v[1], v[2]);
export function dredgerSolids(s: Skeleton): { limbs: CheckLimb[]; lumps: CheckLump[] } {
  const [rH, rK, rA] = B.legR;
  const [r0, r1] = B.armR;
  const limbs: CheckLimb[] = [];
  for (const side of ['L', 'R'] as const) {
    const L = side === 'L';
    limbs.push(
      { name: `leg${side}`, a: L ? s.hipL : s.hipR, b: L ? s.kneeL : s.kneeR, r: rH * 1.12 },
      { name: `shin${side}`, a: L ? s.kneeL : s.kneeR, b: L ? s.ankleL : s.ankleR, r: Math.max(rK, rA) * 1.16 },
      { name: `foot${side}`, a: add(L ? s.heelL : s.heelR, [0, 0, 1.8]), b: add(L ? s.toeL : s.toeR, [0, 0, 1.8]), r: 2.1 },
      { name: `upper${side}`, a: L ? s.shoulderL : s.shoulderR, b: L ? s.elbowL : s.elbowR, r: r0 * 1.22 },
      { name: `fore${side}`, a: L ? s.elbowL : s.elbowR, b: L ? s.handL : s.handR, r: r1 * 1.18 },
    );
  }
  limbs.push({ name: 'neck', a: s.neck, b: lerp3(s.neck, s.head, 0.5), r: 2.9 });
  const waistC = add(s.pelvis, mul(s.hips[2], B.waist * 0.6));
  const cr = creelLump(s);
  const lumps: CheckLump[] = [
    { name: 'head', c: s.head, rot: s.face, h: [B.headR[0] * 1.3, B.headR[1] * 1.3, B.headR[2] * 1.2] },
    { name: 'chest', c: lerp3(s.ribs, s.neck, 0.3), rot: s.chest, h: [B.ribDeep + 2.2, B.ribHalf + 2.4, len3(sub(s.neck, s.ribs)) * 0.55] },
    { name: 'belly', c: lerp3(waistC, s.ribs, 0.45), rot: s.belly, h: [B.waistDeep + 2.0, B.waistHalf + 2.0, Math.max(3, len3(sub(s.ribs, waistC)) * 0.6)] },
    { name: 'hips', c: add(s.pelvis, mul(s.hips[2], B.waist * 0.2)), rot: s.hips, h: [B.pelvisDeep + 2.4, B.pelvisHalf + 2.6, B.waist * 0.75] },
    { name: 'creel', c: cr.c, rot: cr.rot, h: cr.h },
  ];
  return { limbs, lumps };
}
/** The boathook as the checks see it: points along its pole from the butt to the point, and its hook. */
function poleThings(s: Skeleton, q: Posed): CheckThing[] {
  const h = poleOf(s, q);
  const pole: V3[] = [];
  for (let k = 0; k <= POLE.long; k += 4) pole.push(h.at(k));
  const hook: V3[] = [0.3, 0.65, 1.0].map((u) => add(h.at(POLE.hookAt), mul(h.across, POLE.hookOut * u)));
  hook.push(h.barb);
  const onIt = (hand: V3): boolean => {
    const ab = sub(h.tip, h.butt);
    const k = Math.max(0, Math.min(1, dot(sub(hand, h.butt), ab) / Math.max(1e-6, dot(ab, ab))));
    return len(sub(hand, add(h.butt, mul(ab, k)))) < 1.2 + B.armR[2] * 1.2 + 2.5;
  };
  const may = [...(q.lhIn === 3 || onIt(s.handL) ? ['foreL'] : []), 'foreR'];
  return [
    { name: 'boathook', pts: pole, r: 1.0, may },
    { name: 'boathook hook', pts: hook, r: 0.9, may },
  ];
}
export const DR_SHAPE: BossShape = {
  body: dredgerSolids,
  // (what they strike with: the boathook's hook, while it is theirs)
  tip: (move, t, s, q) => (move === 'dying' && t >= DR_DIES.drop ? null : poleOf(s, q).hook),
  things: (move, t, s, q) => (move === 'dying' && t >= DR_DIES.drop ? [] : poleThings(s, q)),
};
/** (for the checks: how far up its pole their right hand holds it as they carry it) */
export const DR_HOLD = POLE_HOLD(CARRY_DRAW);
