// THE HUSHED WATCH: THEIR MOVES (the art chat for floors 11 to 15, 18 Oct 2026). A MOCK-UP: NOT IN THE GAME, behind
// WATCH_ON (art/hushed_watch.ts, off). Their look and brief are art/hushed_watch.ts.
//
// His picks (18 Oct): how they fight, “Halberd sweep (Recommended)” (offered as: they advance slowly, raise the long
// halberd high and shaking (the warning), then sweep it wide in front of them); how they go down, “Gag falls, they
// kneel (Recommended)” (offered as: the gag slips off, the Hush leaves them in a gasp, the halberd drops, and they
// sink to their knees and slump down, people again). Then, at 21:24 Pacific: “Hey go without my say so.  If something
// is shit I’ll get it to it but you’re doing a great jobs. At least for 11-15”: made and filmed on that word.
//
// THEIR MOVES, the same for the two of them:
//   STANDING (art/hushed_watch.ts): a sentry gone slack at his post, the halberd stood on its butt at his right side,
//     swaying a little against it; the head lolling and lifting; the lips working under the gag.
//   THE TRUDGE: slow and heavy, the boots lifted and stamped down, the body rolling over each; the halberd carried
//     upright in the right hand, its butt off the floor, nodding with each step.
//   THE HALBERD SWEEP (their blow): the halberd heaved up in both hands and raised high over the right shoulder, its
//     head far back and up, the body wound round to the right; held there, shaking, its blade glinting pink and the
//     Hush seeping harder round the gag (THE WARNING); then, hips first, a step in and the whole halberd swept round
//     in front of them, low, from their right to their left, its blade leading; carried on round to the left; and
//     heaved back up and stood again at the right side.
//   STRUCK: jolted back, the head snapped back, the halberd rocking in the hand, the Hush coughed out round the gag.
//   THE GAG FALLS, AND THEY KNEEL (their death, his pick): rocked back; the gag slips down off the mouth to the
//     throat; they gasp, the head thrown back, and the Hush pours up out of them in one great grey breath; the dull
//     pink goes out of their eyes; the halberd drops from the hand and falls clear; their knees give; they sway on
//     them, and slump forward onto the floor, the helmet tumbling off, and lie still: men of the city again.
//
// By his rulebook: every move through every check the bosses have (art/boss_checks.ts), from in front and behind:
// their feet grip the floor; nothing through them, the halberd too; nothing in the floor; nothing jerky; the blow
// drawn back, held and carried through, hips first; alive when still.
//   test: tsx --test tests/hushed_watch.test.ts

import { footwork, kneelHips, kneelSettle, plantBy, plantOf } from './bosses3';
import type { Plant } from './bosses3';
import type { BossShape, CheckLimb, CheckLump, CheckThing } from './boss_checks';
import type { ActorArt } from './actor_types';
import { HALBERD, HALBERD_HOLD, WATCH_BODY, WATCH_CANVAS, WATCH_REST, halberdGrip, halberdOf, watchPainter, watchStand, watchStandJaw } from './hushed_watch';
import type { WatchWho } from './hushed_watch';
import { TILE3, mobSet } from './new_mobs3';
import type { Mob, MobMove } from './new_mobs3';
import { add, dot, elbowFor, heading, len, lerp3, mul, norm, solve, sub } from './skeleton';
import type { Bones, Key3, Motion, Posed, Skeleton, V3 } from './skeleton';

type P = Partial<Bones>;
const B = WATCH_BODY;
const R = WATCH_REST;
const L0 = plantOf(B, 'L', {}, R);
const R0 = plantOf(B, 'R', {}, R);

/** Their elbows pointed as nearly toward these ways as their arms let them (the figure's own axes). */
function elbowsTo(pose: P, wantL: V3 | null, wantR: V3 | null): P {
  const q = { ...R, ...pose } as Posed;
  const le = wantL ? elbowFor(B, q, true, norm(wantL)) : q.le;
  const re = wantR ? elbowFor(B, { ...q, le } as Posed, false, norm(wantR)) : q.re;
  return { ...pose, le, re };
}
/** The draw at which their right hand holds the halberd as they carry it and stand it. */
const CARRY_DRAW = R.draw;
/** As they swing it: the right hand at its very butt, above the iron, the left hand a forearm further up toward its head. */
const SWING_DRAW = 0;
const SWING_LEFT = 7;
/**
 * A pose with both hands on the halberd: the body as `body` says, the right hand at `hand` (from the pelvis's place
 * over the floor: their forward, left and up), the halberd pointing `az`, `el` (degrees), its blade standing out to `edge`.
 */
const both = (body: P, hand: V3, az: number, el: number, edge: V3): P => ({ ...body, ...halberdGrip([hand[0] + ((body.px as number) ?? 0), hand[1] + ((body.py as number) ?? 0), hand[2]], heading(az, el), edge, SWING_DRAW, SWING_LEFT) });

// ---------------------------------------------------------------------------------------------
// THE TRUDGE

/** Their trudge: twelve frames at eight a second, painted for WA_PACE tiles a second. */
export const WA_PACE = 0.8;
export const WA_WALK = { frames: 12, fps: 8 } as const;
/** A foot of a walk of `n` frames, `k` frames into its round: down from the first frame to the middle one, carried back under the figure; then lifted (heavily) and swung through. Forward, lift, how its sole is tipped. */
function stepFoot(k: number, n: number, step: number, lift: number): [number, number, number] {
  const half = n / 2;
  if (k <= half) return [step * (half / 2 - k), 0, 0];
  const u = (k - half) / half;
  const g = u * u * (3 - 2 * u);
  return [-step * (half / 2) + step * half * g, lift * Math.sin(Math.PI * u), 16 * Math.sin(Math.PI * u) * (1 - u) - 6 * Math.sin(Math.PI * u) * u];
}
/** The halberd carried upright in the right hand, its butt off the floor. */
const CARRY = (dx: number, dz: number): P => halberdGrip([4.5 + dx, -12.6, 47 + dz], heading(0, 84), [0, -1, 0], CARRY_DRAW, null);
function watchWalk(): Motion {
  const n = WA_WALK.frames;
  const d = (WA_PACE * TILE3) / WA_WALK.fps;
  const keys: Key3[] = [];
  for (let i = 0; i <= n; i++) {
    const j = i % n;
    const a = (j / n) * Math.PI * 2;
    const [lx, lz, lp] = stepFoot(j, n, d, 3.2);
    const [rx, rz, rp] = stepFoot((j + n / 2) % n, n, d, 3.2);
    // (the body sinking onto each boot as it stamps down, rolling over it; the halberd nodding with it)
    const sag = Math.abs(Math.sin(a));
    keys.push({
      at: i / WA_WALK.fps,
      ease: 'lin',
      pose: {
        ...elbowsTo({ ...CARRY(1.2 * Math.sin(a), -1.2 * sag), lhIn: 1, lhx: R.lhx + 2.8 * Math.sin(a + Math.PI), lhy: R.lhy, lhz: R.lhz + 0.6 * sag }, null, [-0.7, -0.05, -1]),
        pz: R.pz - 1.3 * sag, py: 1.4 * Math.sin(a), roll: R.roll + 4 * Math.sin(a), yaw: 4 * Math.cos(a), side: R.side + 1.6 * Math.sin(a),
        bend: R.bend + 1.5 * sag, pitch: R.pitch + 2, faceUp: R.faceUp - 2 * sag, faceTilt: R.faceTilt + 6 * Math.sin(a), faceTurn: R.faceTurn + 3 * Math.cos(a),
        lfx: lx, lfz: lz, lfp: lp, lfy: R.lfy, lft: R.lft,
        rfx: rx, rfz: rz, rfp: rp, rfy: R.rfy, rft: R.rft,
      },
    });
  }
  return { keys, loop: 0 };
}
const walkJaw = (t: number): number => 0.4 + 0.4 * Math.max(0, Math.sin((t / (WA_WALK.frames / WA_WALK.fps)) * Math.PI * 4));

// ---------------------------------------------------------------------------------------------
// THE HALBERD SWEEP

/** Their blow: how long; when the blade crosses before them (a frame of the game's thirty a second); when the warning is held from and to. */
export const WA_SWEEP = { long: 1.8, hit: 24 / 30, warn: [0.32, 0.62] } as const;
/** Taking it up: the halberd lifted upright in both hands before the chest, slid up through the right hand to its butt; its head turned to face back over the right shoulder. */
const TAKE: P = elbowsTo(both({ px: -0.6, pz: R.pz, yaw: -4, twist: -4, pitch: 2, bend: 3, side: 0, roll: 0, faceUp: 4, faceTilt: -2, faceTurn: 4, lk: 9, rk: -9 }, [11, -11, 46], -140, 86, [-0.6, -0.8, 0]), [-0.2, 0.7, -1], [-0.4, -0.7, -0.7]);
/** Heaving it up: the head of it tipping back over the right shoulder, the hands rising before them. */
const HEAVE: P = elbowsTo(both({ px: -1.2, pz: R.pz + 0.2, yaw: -10, twist: -10, pitch: -1, bend: 0, side: 1, roll: -1, faceUp: 10, faceTilt: -2, faceTurn: 8, lk: 10, rk: -12 }, [11, -12, 60], -140, 55, [0, 0, 1]), [-0.1, 0.8, -0.8], [-0.3, -0.8, -0.6]);
/** RAISED HIGH (the warning): the halberd up over their head in both hands, lying back over the right shoulder, its head far back and out; the body wound round to the right, leaning back onto the back foot. */
const RAISED: P = elbowsTo(both({ px: -2.4, pz: R.pz + 0.8, yaw: -16, twist: -18, pitch: -6, bend: -6, side: 3, roll: -2, faceUp: 18, faceTilt: 0, faceTurn: 14, lk: 12, rk: -14 }, [9, -4, 72], -140, 15, [0, 0, 1]), [0.3, 0.6, -0.6], [0.1, -0.9, -0.3]);
const shaking = (k: number): P => ({ ...RAISED, rhz: (RAISED.rhz as number) + (k % 2 ? 0.9 : -0.5), rhy: (RAISED.rhy as number) + (k % 2 ? -0.4 : 0.3), px: (RAISED.px as number) - 0.25 * (k % 2), rhx: (RAISED.rhx as number) - 0.25 * (k % 2) });
/** The drive: the hips already turning and coming forward over the stepping foot, the halberd still up and back (hips first). */
const DRIVE: P = elbowsTo(both({ ...RAISED, px: 2.2, pz: R.pz - 0.6, yaw: 4, twist: -34, pitch: 2, bend: -2, side: 2, roll: 0, faceUp: 10, faceTurn: 6 }, [8, -8, 69], -128, 10, [0, 0.2, 1]), [0.3, 0.6, -0.6], [0.1, -0.9, -0.3]);
/** Coming round: the halberd swinging down and round at their right, its head out to the side. */
const COMING: P = elbowsTo(both({ px: 4.8, pz: R.pz - 1.8, yaw: 12, twist: -14, pitch: 8, bend: 4, side: 0, roll: 1, faceUp: 6, faceTurn: 2, lk: 18, rk: -6 }, [14, -18, 51], -62, -4, [0.6, 0.8, 0]), [0.2, 0.8, -0.6], [-0.1, -0.9, -0.4]);
/** THE BLOW: the halberd swept round low before them, pointing ahead, its blade leading to their left. */
const SWEEP: P = elbowsTo(both({ px: 6.5, pz: R.pz - 2.6, yaw: 18, twist: 4, pitch: 14, bend: 10, side: -2, roll: 2, faceUp: 4, faceTilt: 0, faceTurn: -4, lk: 22, rk: -6 }, [19, -5, 41], 0, -12, [0, 1, 0]), [0, 0.8, -0.6], [-0.2, -0.9, -0.5]);
/** Carried on round to their left, still low. */
const ROUND: P = elbowsTo(both({ px: 6.0, pz: R.pz - 2.8, yaw: 30, twist: 18, pitch: 16, bend: 12, side: -3, roll: 2, faceUp: 2, faceTurn: -10, lk: 24, rk: -4 }, [15, 8, 42], 76, -15, [-0.8, 0.6, 0]), [0, 0.8, -0.6], [0.2, -0.9, -0.4]);
const ROUND2: P = elbowsTo(both({ px: 5.0, pz: R.pz - 2.6, yaw: 40, twist: 30, pitch: 14, bend: 12, side: -3, roll: 2, faceUp: 2, faceTurn: -18, lk: 26, rk: -2 }, [9, 17, 43], 128, -16, [-0.8, -0.6, 0]), [0.2, 0.8, -0.6], [0.5, -0.6, -0.4]);
/** Brought back to their right side, rising. */
const BACK: P = elbowsTo(both({ px: 3.6, pz: R.pz - 1.4, yaw: 12, twist: 0, pitch: 8, bend: 6, side: 0, roll: 0, faceUp: 2, faceTurn: -4, lk: 14, rk: -6 }, [17, -8, 46], 30, 20, [0.5, -0.9, 0]), [-0.2, 0.7, -0.8], [-0.3, -0.8, -0.6]);
/** Heaved back up: the halberd upright before them in both hands, to be lowered through the right hand onto its butt. */
const UPRIGHT: P = elbowsTo(both({ px: 2.0, pz: R.pz - 0.6, yaw: 6, twist: 0, pitch: 4, bend: 4, side: 0, roll: 0, faceUp: 0, faceTurn: 0, lk: 10, rk: -8 }, [11, -10, 46], 0, 80, [0, -1, 0]), [-0.4, 0.6, -0.8], [-0.4, -0.7, -0.7]);
function watchSweep(): Motion {
  const H = WA_SWEEP.hit;
  return {
    hit: H,
    keys: [
      { at: 0, pose: {} },
      { at: 0.1, pose: TAKE, ease: 'in' },
      { at: 0.2, pose: HEAVE, ease: 'lin' },
      { at: 0.32, pose: RAISED, ease: 'out' },
      { at: 0.4, pose: shaking(1), ease: 'io' },
      { at: 0.48, pose: shaking(2), ease: 'io' },
      { at: 0.56, pose: shaking(3), ease: 'io' },
      { at: WA_SWEEP.warn[1], pose: shaking(4), ease: 'io' },
      { at: H - 0.12, pose: DRIVE, ease: 'in' },
      { at: H - 0.06, pose: COMING, ease: 'lin' },
      { at: H, pose: SWEEP, ease: 'lin' },
      { at: H + 0.1, pose: ROUND, ease: 'lin' },
      { at: H + 0.26, pose: ROUND2, ease: 'out' },
      { at: 1.24, pose: BACK, ease: 'io' },
      { at: 1.42, pose: UPRIGHT, ease: 'io' },
      { at: WA_SWEEP.long, pose: {}, ease: 'io' },
    ],
  };
}
function watchSweepFeet(): (t: number) => P {
  const H = WA_SWEEP.hit;
  return footwork(B, {
    L: { start: L0, moves: [{ t0: H - 0.14, t1: H - 0.02, to: plantBy(L0, 8, 1.5, 10), lift: 3.4 }, { t0: 1.32, t1: 1.62, to: L0, lift: 2.8 }] },
    R: { start: R0, moves: [{ t0: 0.1, t1: 0.26, to: plantBy(R0, -1.5, -1, -14), lift: 2.4 }, { t0: H - 0.08, t1: H + 0.06, to: plantBy(R0, -1.5, -1, 12, { pitch: 22 }) }, { t0: 1.3, t1: 1.6, to: R0, lift: 2.4 }] },
  });
}
/** The warning: the blade glinting pink and the Hush seeping harder, from as they heave it up until just after the blow. */
function sweepGlint(t: number): number {
  const H = WA_SWEEP.hit;
  if (t < 0.12 || t > H + 0.4) return 0;
  return t < 0.32 ? (t - 0.12) / 0.2 : t <= H + 0.1 ? 1 : 1 - (t - H - 0.1) / 0.3;
}
const sweepJaw = (t: number): number => (t < 0.3 ? 0.4 + 2 * t : t < WA_SWEEP.hit + 0.2 ? 1 : 1 - 0.5 * Math.min(1, (t - WA_SWEEP.hit - 0.2) / 0.5));

// ---------------------------------------------------------------------------------------------
// STRUCK

function watchReel(): Motion {
  return {
    keys: [
      { at: 0, pose: {} },
      { at: 0.06, pose: { px: -2.4, pz: R.pz + 0.5, pitch: -4, bend: -5, faceUp: R.faceUp + 22, faceTilt: R.faceTilt + 8, lhx: 1.5, lhy: 5, lhz: -19, wEl: (R.wEl as number) - 6, out: 0.1 }, ease: 'out' },
      { at: 0.18, pose: { px: -1.0, pitch: 4, bend: 6, faceUp: R.faceUp + 6, wEl: (R.wEl as number) + 2 }, ease: 'io' },
      { at: 0.4, pose: {}, ease: 'io' },
    ],
  };
}

// ---------------------------------------------------------------------------------------------
// THE GAG FALLS, AND THEY KNEEL

export const WA_DIES = { long: 2.6, slip: [0.14, 0.4], gasp: 0.42, drop: 0.5, knees: 1.0, down: 2.1, helm: 1.96 } as const;
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
const ON_KNEES: P = kneeling(6, { yaw: 0, pitch: 2, roll: 2, twist: 0, bend: 4, side: 1, faceTurn: 0, faceUp: 4, faceTilt: 10, ...HANGING });
const FOLD: P = kneeling(14, { yaw: 4, pitch: 28, roll: 3, twist: 0, bend: 22, side: 1, faceTurn: 6, faceUp: -30, faceTilt: 8, ...HANGING });
const SLUMP: P = limp(kneeling(30, { yaw: 6, pitch: 62, roll: 2, twist: 0, bend: 24, side: 0, faceTurn: 14, faceUp: -48, faceTilt: 14 }), 8, 10);
const PRONE: P = { ...limp(lifted(kneeling(66, { yaw: 8, pitch: 80, roll: 6, twist: 0, bend: 8, side: 0, faceTurn: 30, faceUp: -36, faceTilt: 22 }), 2.6), 24, 10), out: 1 };
function watchDying(): Motion {
  return {
    keys: [
      { at: 0, pose: {} },
      { at: 0.08, pose: { px: -2.2, pz: R.pz, pitch: -3, bend: -5, faceUp: R.faceUp + 16, out: 0.1 }, ease: 'out' },
      // the gag slipping: the head rolling, the jaw working it loose
      { at: 0.26, pose: { px: -2.0, pz: R.pz + 0.3, pitch: -4, bend: -8, faceUp: R.faceUp + 24, faceTilt: 8, faceTurn: -6, out: 0.25 }, ease: 'io' },
      // THE GASP: the head thrown back, the mouth wide, the chest arched, the left arm falling open: the Hush pours out
      { at: WA_DIES.gasp, pose: { px: -2.0, pz: R.pz + 0.9, pitch: -9, bend: -15, faceUp: 42, faceTilt: 0, faceTurn: 0, lhIn: 1, lhx: -1, lhy: 7, lhz: -18, out: 0.5 }, ease: 'out' },
      // the halberd drops from the hand (WA_DIES.drop): the right arm falls to his side
      { at: 0.62, pose: { px: -1.8, pz: R.pz + 0.5, pitch: -8, bend: -13, faceUp: 38, faceTilt: 4, lhIn: 1, lhx: -0.6, lhy: 6.5, lhz: -19, rhIn: 1, rhx: -0.6, rhy: -6.5, rhz: -19, out: 0.85 }, ease: 'io' },
      // their knees give
      { at: 0.8, pose: { px: -0.6, pz: R.pz - 5, pitch: 2, bend: 2, faceUp: 14, lk: 26, rk: -26, ...HANGING, out: 1 }, ease: 'in' },
      { at: WA_DIES.knees, pose: { ...ON_KNEES, out: 1 }, ease: 'out' },
      { at: 1.22, pose: { ...ON_KNEES, pz: (ON_KNEES.pz as number) + 0.6, pitch: -2, roll: -3, faceUp: 10, out: 1 }, ease: 'io' },
      { at: 1.5, pose: { ...ON_KNEES, pitch: 8, roll: 4, faceUp: -6, out: 1 }, ease: 'io' },
      // and slump forward onto the floor, and lie still
      { at: 1.72, pose: { ...FOLD, out: 1 }, ease: 'in' },
      { at: 1.9, pose: { ...SLUMP, out: 1 }, ease: 'lin' },
      { at: WA_DIES.down, pose: PRONE, ease: 'out' },
      { at: WA_DIES.long, pose: PRONE, ease: 'io' },
    ],
  };
}
function watchDyingFeet(): (t: number) => P {
  const F = DIE_FEET;
  return footwork(B, {
    L: { start: L0, moves: [{ t0: 0.04, t1: 0.26, to: F.L, lift: 2.6 }, { t0: 0.62, t1: 0.96, to: { ...F.L, pitch: TUCK } }] },
    R: { start: R0, moves: [{ t0: 0.62, t1: 0.96, to: { ...F.R, pitch: TUCK } }] },
  });
}
const dieJaw = (t: number): number => (t < 0.2 ? 0.4 : t < 1.2 ? 1 : 1 - 0.6 * Math.min(1, (t - 1.2) / 0.6));
/** How far the gag has slipped, from the mouth (0) to the throat (1). */
const dieSlip = (t: number): number => {
  const [a, b] = WA_DIES.slip;
  const u = Math.max(0, Math.min(1, (t - a) / (b - a)));
  return u * u * (3 - 2 * u);
};

// ---------------------------------------------------------------------------------------------
// THEM, AS THE GAME HOLDS A MONSTER

function watchMob(who: WatchWho): Mob {
  const paint = watchPainter(who, { slip: dieSlip });
  const mv = (name: string, motion: Motion, more: Partial<MobMove> = {}): MobMove => ({ name, motion, rest: R, ...more });
  return {
    id: `watch-${who}`,
    name: who === 'watchman' ? 'A Hushed watchman' : 'A Hushed sergeant of the watch',
    size: 'medium: a head taller than the knight',
    build: B,
    stand: mv('The Hushed watch keep their post', watchStand(), { jaw: watchStandJaw }),
    attack: mv('The halberd sweep', watchSweep(), { feet: watchSweepFeet(), glint: sweepGlint, jaw: sweepJaw, trail: (s, q) => [halberdOf(s, q).edge, halberdOf(s, q).tip], trailSpan: 3.0 }),
    idleFrames: 32,
    idleFps: 10,
    walk: mv('The Hushed watch trudge', watchWalk(), { period: WA_WALK.frames / WA_WALK.fps, ground: WA_PACE * TILE3, jaw: walkJaw }),
    walkFrames: WA_WALK.frames,
    walkFps: WA_WALK.fps,
    pace: WA_PACE,
    reel: mv('The Hushed watch are struck', watchReel(), { glint: (t) => (t < 0.3 ? 1 - t / 0.3 : 0) }),
    reelTime: 0.4,
    hit: WA_SWEEP.hit,
    warn: WA_SWEEP.warn[1] - WA_SWEEP.warn[0],
    dieTime: WA_DIES.long,
    dying: mv('The gag falls, and they kneel', watchDying(), { feet: watchDyingFeet(), jaw: dieJaw }),
    aura: { x: WATCH_CANVAS.ax, y: WATCH_CANVAS.ay - 46, r: 40, color: '#9890b4', a: 0.06 },
    shadow: 13,
    canvas: WATCH_CANVAS,
    trueBack: true,
    bits: paint.bits,
    grains: paint.grains,
    // (the halberd drops from his hand and falls clear to his right; his helmet tumbles off as he goes down)
    fall(piece) {
      if (piece === 'halberd') return { from: WA_DIES.drop, to: [-16, -30], spin: 62, lay: 'axis', hop: 1.4 };
      if (piece === 'helm') return { from: WA_DIES.helm, to: [46, 20], spin: 70, lay: 'keep', hop: 1.8 };
      return null;
    },
  };
}
export const WATCHMAN = watchMob('watchman');
export const WATCH_SERGEANT = watchMob('sergeant');
export const WATCH_ALL: readonly Mob[] = [WATCHMAN, WATCH_SERGEANT];
export function makeWatchArt3(mob: Mob = WATCHMAN, pace = mob.pace): ActorArt {
  return { front: mobSet(mob, 'front', pace), back: mobSet(mob, 'back', pace) };
}

// ---------------------------------------------------------------------------------------------
// THEM AS THE CHECKS SEE THEM (art/boss_checks.ts): their outside as painted, by name, and the halberd while it is theirs

const len3 = (v: V3): number => Math.hypot(v[0], v[1], v[2]);
export function watchSolids(s: Skeleton): { limbs: CheckLimb[]; lumps: CheckLump[] } {
  const [rH, rK, rA] = B.legR;
  const [r0, r1] = B.armR;
  const limbs: CheckLimb[] = [];
  for (const side of ['L', 'R'] as const) {
    const L = side === 'L';
    limbs.push(
      { name: `leg${side}`, a: L ? s.hipL : s.hipR, b: L ? s.kneeL : s.kneeR, r: rH * 1.08 },
      { name: `shin${side}`, a: L ? s.kneeL : s.kneeR, b: L ? s.ankleL : s.ankleR, r: Math.max(rK, rA) * 1.14 },
      { name: `foot${side}`, a: add(L ? s.heelL : s.heelR, [0, 0, 1.7]), b: add(L ? s.toeL : s.toeR, [0, 0, 1.7]), r: 2.0 },
      { name: `upper${side}`, a: L ? s.shoulderL : s.shoulderR, b: L ? s.elbowL : s.elbowR, r: r0 * 1.16 },
      { name: `fore${side}`, a: L ? s.elbowL : s.elbowR, b: L ? s.handL : s.handR, r: r1 * 1.12 },
    );
  }
  limbs.push({ name: 'neck', a: s.neck, b: lerp3(s.neck, s.head, 0.5), r: 3.0 });
  const waistC = add(s.pelvis, mul(s.hips[2], B.waist * 0.6));
  const lumps: CheckLump[] = [
    { name: 'head', c: s.head, rot: s.face, h: [B.headR[0] * 1.1, B.headR[1] * 1.15, B.headR[2] * 1.05] },
    { name: 'chest', c: lerp3(s.ribs, s.neck, 0.3), rot: s.chest, h: [B.ribDeep + 2.0, B.ribHalf + 2.2, len3(sub(s.neck, s.ribs)) * 0.55] },
    { name: 'belly', c: lerp3(waistC, s.ribs, 0.45), rot: s.belly, h: [B.waistDeep + 1.8, B.waistHalf + 1.8, Math.max(3, len3(sub(s.ribs, waistC)) * 0.6)] },
    { name: 'hips', c: add(s.pelvis, mul(s.hips[2], B.waist * 0.2)), rot: s.hips, h: [B.pelvisDeep + 2.2, B.pelvisHalf + 2.4, B.waist * 0.75] },
  ];
  return { limbs, lumps };
}
/** The halberd as the checks see it: points along its staff from the butt to the point, and its blade and back spike. */
function halberdThings(s: Skeleton, q: Posed): CheckThing[] {
  const h = halberdOf(s, q);
  const staff: V3[] = [];
  for (let k = 0; k <= HALBERD.long; k += 4) staff.push(h.at(k));
  const mid = (HALBERD.bladeLo + HALBERD.bladeHi) / 2;
  const blade: V3[] = [0.3, 0.55, 0.8, 1.0].map((u) => add(h.at(mid), mul(h.across, 1 + 8.2 * u)));
  const fluke: V3[] = [0.3, 0.6, 0.9].map((u) => add(h.at(mid), mul(h.across, -7 * u)));
  // (it is held in the right hand, and in the left when both are on it: those forearms may touch it)
  const onIt = (hand: V3): boolean => {
    const ab = sub(h.tip, h.butt);
    const k = Math.max(0, Math.min(1, dot(sub(hand, h.butt), ab) / Math.max(1e-6, dot(ab, ab))));
    return len(sub(hand, add(h.butt, mul(ab, k)))) < 1.2 + B.armR[2] * 1.2 + 2.5;
  };
  const may = [...(q.lhIn === 3 || onIt(s.handL) ? ['foreL'] : []), 'foreR'];
  return [
    { name: 'halberd', pts: staff, r: 1.15, may },
    { name: 'halberd blade', pts: blade, r: 1.0, may },
    { name: 'halberd spike', pts: fluke, r: 0.9, may },
  ];
}
export const WA_SHAPE: BossShape = {
  body: watchSolids,
  // (what they strike with: the halberd's blade, while it is theirs)
  tip: (move, t, s, q) => (move === 'dying' && t >= WA_DIES.drop ? null : halberdOf(s, q).edge),
  things: (move, t, s, q) => (move === 'dying' && t >= WA_DIES.drop ? [] : halberdThings(s, q)),
};
/** (for the checks: how far up its staff their right hand holds it as they carry it) */
export const WA_HOLD = HALBERD_HOLD(CARRY_DRAW);
