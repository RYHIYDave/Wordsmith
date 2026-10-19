// THE HUSHED PATIENTS: THEIR MOVES (the art chat for floors 11 to 15, 19 Oct 2026). A MOCK-UP: NOT IN THE GAME, behind
// PATIENTS_ON (art/patients.ts, off). Their look and brief are art/patients.ts: made on his word of 18 Oct, 21:24
// Pacific, “Hey go without my say so.  If something is shit I’ll get it to it but you’re doing a great jobs. At least
// for 11-15”, the picks this chat would have marked recommended, and sent him with their films.
//
// THEIR MOVES, the same for both (a man, a woman):
//   IN BED (`more.abed`, going round): on their backs on a ward bed behind where they will stand, knees drawn up,
//     breathing slow, eyes shut, mouthing in their sleep. (His doc: “Hushed patients who sit up in their beds as you
//     pass”.)
//   THEY RISE (`more.rise`): their eyes snap open pink; they SIT BOLT UPRIGHT; turn their heads to you; swing their legs
//     over the side of the bed, their bare feet down onto the floor; lean, push off the bed and stand.
//   STANDING: stooped, unsteady, the left hand at the throat their words were drawn from, the mouth working.
//   THE SHUFFLE: barefoot, the left hand at the throat.
//   THE SILENT SCREAM (their blow): reared back, both hands clutching the throat, the throat burning pink, shaking (THE
//     WARNING); then hips first, a step in, the head thrown forward and the arms flung back, the mouth gaping: a scream
//     with no sound, the Hush blasting out of them in a burst before them; held; back to the stoop.
//   STRUCK: jolted back, the head snapped back, the Hush coughed out.
//   THE HUSH LEAVES THEM (their death, his pick for the Hushed): rocked back; a gasp, the Hush pouring up out of them;
//     their knees give; they sway on their knees, sink down onto their right hip and lie down on their side, curled up
//     as if asleep at last.
//
// By his rulebook: every move through every check the bosses have (art/boss_checks.ts), from in front and behind.
//   test: tsx --test tests/patients.test.ts

import { footwork, kneelHips, kneelSettle, plantBy, plantOf } from './bosses3';
import type { Plant } from './bosses3';
import type { BossShape, CheckLimb, CheckLump, Handover } from './boss_checks';
import type { ActorArt } from './actor_types';
import { PT_BED, PT_BODY, PT_CANVAS, PT_REST, PT_STAND_LONG, patientJaw, patientPainter } from './patients';
import type { PatientWho } from './patients';
import { TILE3, mobSet } from './new_mobs3';
import type { Mob, MobMove, Moment } from './new_mobs3';
import { add, bonesAt, elbowFor, lerp3, mul, norm, solve, sub } from './skeleton';
import type { Bones, Key3, Motion, Posed, Skeleton, V3 } from './skeleton';

type P = Partial<Bones>;
const B = PT_BODY;
const R = PT_REST;
const L0 = plantOf(B, 'L', {}, R);
const R0 = plantOf(B, 'R', {}, R);
const fr = (t: number): number => t - Math.floor(t);
const len3 = (v: V3): number => Math.hypot(v[0], v[1], v[2]);
const clamp01 = (v: number): number => Math.max(0, Math.min(1, v));
const sm = (v: number): number => {
  const c = clamp01(v);
  return c * c * (3 - 2 * c);
};

function elbowsTo(pose: P, wantL: V3 | null, wantR: V3 | null): P {
  const q = { ...R, ...pose } as Posed;
  const le = wantL ? elbowFor(B, q, true, norm(wantL)) : q.le;
  const re = wantR ? elbowFor(B, { ...q, le } as Posed, false, norm(wantR)) : q.re;
  return { ...pose, le, re };
}

/**
 * A MOVE THAT FLOWS: from `base`, each field going on to each of its next values over that span of time (smoothly, and
 * spans may overlap, so that one thing is still going as the next begins), sampled thirty times a second.
 */
interface Span {
  t0: number;
  t1: number;
  to: P;
}
function flowing(base: P, spans: ReadonlyArray<Span>, long: number): Key3[] {
  const fields = new Set<string>(Object.keys(base));
  for (const s of spans) for (const k of Object.keys(s.to)) fields.add(k);
  const keys: Key3[] = [];
  const n = Math.round(long * 30);
  for (let i = 0; i <= n; i++) {
    const t = (i / n) * long;
    const pose: Record<string, number> = {};
    for (const f of fields) {
      const v0 = (base as Record<string, number>)[f] ?? (R as unknown as Record<string, number>)[f];
      if (typeof v0 !== 'number') continue;
      let v = v0;
      let was = v0;
      for (const s of spans) {
        const to = (s.to as Record<string, number>)[f];
        if (typeof to !== 'number') continue;
        v += sm((t - s.t0) / (s.t1 - s.t0)) * (to - was);
        was = to;
      }
      pose[f] = v;
    }
    // (which place each hand is measured from: as the base says, all through)
    if (base.lhIn !== undefined) pose.lhIn = base.lhIn;
    if (base.rhIn !== undefined) pose.rhIn = base.rhIn;
    keys.push({ at: t, ease: 'lin', pose: pose as P });
  }
  return keys;
}

// ---------------------------------------------------------------------------------------------
// STANDING

function patientStand(): Motion {
  const T = PT_STAND_LONG;
  const keys: Key3[] = [];
  const N = 30;
  for (let i = 0; i <= N; i++) {
    const t = (i / N) * T;
    const a = (t / T) * Math.PI * 2;
    const breath = Math.sin(a * 2 - 0.5);
    keys.push({
      at: t,
      ease: 'lin',
      pose: {
        pz: R.pz + 0.6 * breath,
        py: 1.8 * Math.sin(a),
        px: 0.6 * Math.sin(a * 2 + 0.6),
        roll: R.roll + 3.6 * Math.sin(a),
        bend: R.bend - 2.0 * breath,
        pitch: R.pitch + 2.0 * Math.sin(a + 1.2),
        faceUp: R.faceUp + 8 * Math.sin(a + 0.4),
        faceTilt: R.faceTilt + 9 * Math.sin(a + 2.0),
        faceTurn: R.faceTurn + 10 * Math.sin(a * 0.5 + 0.8),
        lhx: R.lhx + 0.6 * breath,
        lhz: R.lhz + 0.5 * breath,
        rhx: R.rhx + 1.4 * Math.sin(a + 2.6),
        rhz: R.rhz + 0.6 * breath,
      },
    });
  }
  return { loop: 0, keys };
}

// ---------------------------------------------------------------------------------------------
// THE SHUFFLE

export const PT_PACE = 0.8;
export const PT_WALK = { frames: 10, fps: 8 } as const;
function stepFoot(k: number, n: number, step: number, lift: number): [number, number, number] {
  const half = n / 2;
  if (k <= half) return [step * (half / 2 - k), 0, 0];
  const u = (k - half) / half;
  const g = u * u * (3 - 2 * u);
  return [-step * (half / 2) + step * half * g, lift * Math.sin(Math.PI * u), 10 * Math.sin(Math.PI * u) * (1 - u) - 4 * Math.sin(Math.PI * u) * u];
}
function patientWalk(): Motion {
  const n = PT_WALK.frames;
  const d = (PT_PACE * TILE3) / PT_WALK.fps;
  const keys: Key3[] = [];
  for (let i = 0; i <= n; i++) {
    const j = i % n;
    const a = (j / n) * Math.PI * 2;
    const [lx, lz, lp] = stepFoot(j, n, d, 1.9);
    const [rx, rz, rp] = stepFoot((j + n / 2) % n, n, d, 1.9);
    const sag = Math.abs(Math.sin(a));
    keys.push({
      at: i / PT_WALK.fps,
      ease: 'lin',
      pose: {
        pz: R.pz - 1.0 * sag, py: 2.0 * Math.sin(a), roll: R.roll + 6 * Math.sin(a), yaw: 3 * Math.cos(a), side: R.side + 2.4 * Math.sin(a),
        bend: R.bend + 2 * sag, pitch: R.pitch + 3, faceUp: R.faceUp - 3 * sag, faceTilt: R.faceTilt + 10 * Math.sin(a), faceTurn: R.faceTurn + 4 * Math.cos(a),
        lfx: lx, lfz: lz, lfp: lp, lfy: R.lfy, lft: R.lft,
        rfx: rx, rfz: rz, rfp: rp, rfy: R.rfy, rft: R.rft,
        lhx: R.lhx + 0.5 * Math.sin(a), lhz: R.lhz + 0.4 * sag,
        rhx: R.rhx + 2.4 * Math.sin(a), rhz: R.rhz + 0.6 * sag,
      },
    });
  }
  return { keys, loop: 0 };
}
const walkJaw = (t: number): number => 0.45 + 0.3 * Math.max(0, Math.sin((t / (PT_WALK.frames / PT_WALK.fps)) * Math.PI * 4));

// ---------------------------------------------------------------------------------------------
// THE SILENT SCREAM

/** Their blow: how long; when the scream bursts out of them (a frame of the game's thirty a second); the warning; how long the burst lasts in their own picture. */
export const PT_SCREAM = { long: 1.5, hit: 21 / 30, warn: [0.28, 0.58], burst: 0.6 } as const;
const H = PT_SCREAM.hit;
/** Both hands clutching the throat. */
const CLUTCH: P = { lhIn: 1, lhx: 5.0, lhy: -5.4, lhz: 0.6, rhIn: 1, rhx: 5.0, rhy: 5.4, rhz: 0.6, pt: 0.2 };
/** Reared back, drawing a breath that does not come: the head back, the hands at the throat, the weight on the back foot. */
const REARED: P = elbowsTo({ px: -3.4, pz: R.pz + 0.4, yaw: 0, twist: 0, pitch: -8, bend: -12, roll: 0, side: 0, faceUp: 30, faceTilt: 0, faceTurn: 0, ...CLUTCH, lk: 8, rk: -8 }, [0.2, 1, -0.6], [0.2, -1, -0.6]);
const shake = (k: number): P => ({ ...REARED, px: (REARED.px as number) - 0.3 * (k % 2), roll: k % 2 ? 1.2 : -1.2, faceTilt: k % 2 ? 3 : -3 });
/** Hips first: the hips coming forward, the chest still back, the hands still at the throat. */
const DRIVE: P = elbowsTo({ ...REARED, px: 0.6, pz: R.pz - 0.2, pitch: 8, bend: -18, faceUp: 22 }, [0.2, 1, -0.6], [0.2, -1, -0.6]);
/** THE SCREAM: the head thrown forward at you, the arms flung back and wide, the hands spread, the mouth gaping. */
const SCREAM: P = elbowsTo({ px: 5.5, pz: R.pz - 1.4, yaw: 0, twist: 0, pitch: 16, bend: 16, roll: 0, side: 0, faceUp: 4, faceTilt: 0, faceTurn: 0, lhIn: 1, lhx: -7, lhy: 8, lhz: -9, rhIn: 1, rhx: -7, rhy: -8, rhz: -9, pt: 1, lk: 14, rk: -8 }, [-0.3, 1, 0.2], [-0.3, -1, 0.2]);
/** Carried through: further forward, the arms further back. */
const THROUGH: P = elbowsTo({ ...SCREAM, px: 7.0, pz: R.pz - 2.0, pitch: 20, bend: 20, faceUp: 2, lhx: -9, lhz: -7, rhx: -9, rhz: -7 }, [-0.3, 1, 0.2], [-0.3, -1, 0.2]);
function patientScream(): Motion {
  return {
    hit: H,
    keys: [
      { at: 0, pose: {} },
      { at: PT_SCREAM.warn[0], pose: REARED, ease: 'io' },
      { at: 0.36, pose: shake(1), ease: 'io' },
      { at: 0.44, pose: shake(2), ease: 'io' },
      { at: 0.51, pose: shake(3), ease: 'io' },
      { at: PT_SCREAM.warn[1], pose: shake(4), ease: 'io' },
      { at: H - 0.08, pose: DRIVE, ease: 'in' },
      { at: H, pose: SCREAM, ease: 'lin' },
      { at: H + 0.14, pose: THROUGH, ease: 'out' },
      { at: 1.02, pose: { ...THROUGH, px: 6.0, pitch: 18, bend: 18, faceUp: 0, lhx: -8, rhx: -8 }, ease: 'io' },
      { at: PT_SCREAM.long, pose: {}, ease: 'io' },
    ],
  };
}
function patientScreamFeet(): (t: number) => P {
  return footwork(B, {
    L: { start: L0, moves: [{ t0: 0.1, t1: 0.26, to: plantBy(L0, -3, 0, 0), lift: 1.8 }, { t0: H - 0.12, t1: H - 0.01, to: plantBy(L0, 7, 0.5, 4), lift: 2.4 }, { t0: 1.04, t1: 1.3, to: L0, lift: 2.0 }] },
    R: { start: R0, moves: [{ t0: H - 0.06, t1: H + 0.04, to: { ...R0, pitch: 16 } }, { t0: 1.06, t1: 1.26, to: R0 }] },
  });
}
/** The warning: the throat burning pink, from as they rear back to the scream. */
function screamGlint(t: number): number {
  if (t < 0.1 || t > H + 0.1) return 0;
  return t < PT_SCREAM.warn[0] ? (t - 0.1) / (PT_SCREAM.warn[0] - 0.1) : t <= H ? 1 : 1 - (t - H) / 0.1;
}
const screamJaw = (t: number): number => (t < 0.1 ? 0.4 : t < H - 0.1 ? 0.08 : t < H + 0.45 ? 1 : 1 - 0.6 * Math.min(1, (t - H - 0.45) / 0.4));
/** How far through its burst the scream is, `t` seconds into the move (0 not yet, or gone). */
export function screamAt(t: number): number {
  const k = (t - H) / PT_SCREAM.burst;
  return k > 0 && k < 1 ? k : 0;
}

// ---------------------------------------------------------------------------------------------
// STRUCK

function patientReel(): Motion {
  return {
    keys: [
      { at: 0, pose: {} },
      { at: 0.06, pose: { px: -2.8, pz: R.pz + 0.4, pitch: 0, bend: 0, faceUp: R.faceUp + 28, faceTilt: R.faceTilt + 10, lhx: R.lhx - 1, lhz: R.lhz + 1, rhx: 1.4, rhz: -17.5, out: 0.1 }, ease: 'out' },
      { at: 0.18, pose: { px: -1.2, pitch: R.pitch + 4, bend: R.bend + 4, faceUp: R.faceUp + 8 }, ease: 'io' },
      { at: 0.4, pose: {}, ease: 'io' },
    ],
  };
}
const reelJaw = (t: number): number => (t < 0.25 ? 1 : 0.45);

// ---------------------------------------------------------------------------------------------
// THE HUSH LEAVES THEM

export const PT_DIES = { long: 2.6, gasp: 0.3, knees: 0.9, fold: 1.5, down: 1.95 } as const;
const DIE_FEET = ((): Record<'L' | 'R', Plant> => ({ L: plantBy(L0, R0.at[0] - L0.at[0] + 2, 0), R: R0 }))();
const TUCK = 56;
const KNEE_DOWN = B.legR[1] * 1.3;
const kneeling = (lean: number, body: P): P => kneelSettle(B, R, { ...kneelHips(B, R, DIE_FEET, TUCK, KNEE_DOWN, lean), ...body }, DIE_FEET, TUCK, KNEE_DOWN);
const HANG = -(B.upperArm + B.foreArm) * 0.9;
const HANGING: P = { lhIn: 0, lhx: 3, lhy: 8, lhz: HANG + 4, le: -10, rhIn: 0, rhx: 3, rhy: -8, rhz: HANG + 4, re: 10 };
const ON_KNEES: P = kneeling(4, { yaw: 0, pitch: 2, roll: 2, twist: 0, bend: 6, side: 1, faceTurn: 0, faceUp: 0, faceTilt: 12, ...HANGING });
/** Their arms let go as they go down: each hand on the floor `back` behind its shoulder and `out` to its side. */
function limp(body: P, back: number, out: number): P {
  const s = solve(B, { ...R, ...body, lhIn: 0, rhIn: 0 } as Posed);
  const at = (sh: V3, side: number): V3 => [sh[0] - back, sh[1] + side * out, 2.6];
  const Lh = at(s.shoulderL, 1);
  const Rh = at(s.shoulderR, -1);
  const q = { ...R, ...body, lhIn: 2, lhx: Lh[0], lhy: Lh[1], lhz: Lh[2], rhIn: 2, rhx: Rh[0], rhy: Rh[1], rhz: Rh[2] } as Posed;
  const le = elbowFor(B, q, true, norm([0, 1, -0.4]));
  const re = elbowFor(B, { ...q, le } as Posed, false, norm([0, -1, -0.4]));
  return { ...body, lhIn: 2, lhx: Lh[0], lhy: Lh[1], lhz: Lh[2], rhIn: 2, rhx: Rh[0], rhy: Rh[1], rhz: Rh[2], le, re };
}
const lifted = (p: P, dz: number): P => ({ ...p, pz: (p.pz as number) + dz });
/** Folding forward over their knees, sinking to their right. */
const FOLD: P = kneeling(16, { yaw: 4, pitch: 30, roll: 14, twist: 0, bend: 22, side: 4, faceTurn: 8, faceUp: -28, faceTilt: 20, ...HANGING });
/** CURLED UP ON THEIR SIDE: over onto their right side on the floor, the knees drawn up under them, the head down on the boards, as if asleep. */
const CURLED: P = { ...limp(lifted(kneeling(62, { yaw: 12, pitch: 74, roll: 46, twist: 0, bend: 20, side: 10, faceTurn: 26, faceUp: -30, faceTilt: 46 }), 2.0), 16, 6), out: 1 };
function patientDying(): Motion {
  return {
    keys: [
      { at: 0, pose: {} },
      { at: 0.08, pose: { px: -2.4, pz: R.pz, pitch: -3, bend: -5, faceUp: R.faceUp + 22, out: 0.15 }, ease: 'out' },
      { at: PT_DIES.gasp, pose: { px: -2.2, pz: R.pz + 0.8, pitch: -9, bend: -15, faceUp: 42, faceTilt: 0, faceTurn: 0, lhIn: 1, lhx: 3.5, lhy: -5, lhz: -3, rhIn: 1, rhx: 3.5, rhy: 5, rhz: -3, out: 0.45 }, ease: 'out' },
      { at: 0.5, pose: { px: -2.0, pz: R.pz + 0.5, pitch: -8, bend: -13, faceUp: 38, faceTilt: 4, lhIn: 1, lhx: 3.2, lhy: -4.6, lhz: -3.6, rhIn: 1, rhx: 3.2, rhy: 4.6, rhz: -3.6, out: 0.85 }, ease: 'io' },
      { at: 0.68, pose: { px: -0.6, pz: R.pz - 5, pitch: 2, bend: 2, faceUp: 14, lk: 26, rk: -26, ...HANGING, out: 1 }, ease: 'in' },
      { at: PT_DIES.knees, pose: { ...ON_KNEES, out: 1 }, ease: 'out' },
      { at: 1.1, pose: { ...ON_KNEES, pz: (ON_KNEES.pz as number) + 0.6, pitch: -2, roll: -3, faceUp: 6, faceTilt: 4, out: 1 }, ease: 'io' },
      { at: 1.28, pose: { ...ON_KNEES, roll: 6, faceUp: -4, faceTilt: 18, out: 1 }, ease: 'io' },
      { at: PT_DIES.fold, pose: { ...FOLD, out: 1 }, ease: 'in' },
      { at: PT_DIES.down, pose: CURLED, ease: 'out' },
      { at: PT_DIES.long, pose: CURLED, ease: 'io' },
    ],
  };
}
function patientDyingFeet(): (t: number) => P {
  const F = DIE_FEET;
  return footwork(B, {
    L: { start: L0, moves: [{ t0: 0.04, t1: 0.26, to: F.L, lift: 2.2 }, { t0: 0.5, t1: 0.82, to: { ...F.L, pitch: TUCK } }] },
    R: { start: F.R, moves: [{ t0: 0.5, t1: 0.82, to: { ...F.R, pitch: TUCK } }] },
  });
}
const dieJaw = (t: number): number => (t < 0.1 ? 0.6 : t < 1.0 ? 1 : 1 - 0.7 * Math.min(1, (t - 1.0) / 0.6));

// ---------------------------------------------------------------------------------------------
// IN BED, AND RISING FROM IT

/** Where each hand is (the figure's own space) in a pose. */
const handsOf = (q: P): { L: V3; R: V3 } => {
  const s = solve(B, { ...R, ...q } as Posed);
  return { L: s.handL, R: s.handR };
};
const PILLOW_Y = 19;
/**
 * LYING ON THEIR BACK in the bed behind where they will stand (PT_BED: its middle 20 behind them, its length along their
 * left and right, the head end to their left): their head on the pillow, their knees drawn up, their feet flat on the
 * mattress, their arms at their sides.
 */
const LYING_BODY: P = {
  px: PT_BED.x, py: -5, pz: -6.6, yaw: -90, pitch: 0, roll: -90, twist: 0, bend: 0, side: 0,
  faceTurn: -90, faceUp: 80, faceTilt: -18,
  lfx: PT_BED.x + 4, lfy: -19 - B.stance, lfz: PT_BED.top, lfp: 0, lft: -90,
  rfx: PT_BED.x - 4, rfy: -19 + B.stance, rfz: PT_BED.top, rfp: 0, rft: -90,
  lk: -40, lkUp: 66, rk: 220, rkUp: 66,
  pt: 0.3,
};
void PILLOW_Y;
const LYING: P = (() => {
  const q = { ...R, ...LYING_BODY } as Posed;
  const s = solve(B, { ...q, lhIn: 0, rhIn: 0 } as Posed);
  const Lh: V3 = [s.shoulderL[0] + 1.6, s.pelvis[1] - 5, PT_BED.top + 2.4];
  const Rh: V3 = [s.shoulderR[0] - 1.6, s.pelvis[1] - 5, PT_BED.top + 2.4];
  const q2 = { ...q, lhIn: 2, lhx: Lh[0], lhy: Lh[1], lhz: Lh[2], rhIn: 2, rhx: Rh[0], rhy: Rh[1], rhz: Rh[2] } as Posed;
  const le = elbowFor(B, q2, true, norm([0.5, -0.4, -0.3]));
  const re = elbowFor(B, { ...q2, le } as Posed, false, norm([-0.5, -0.4, -0.3]));
  return { ...LYING_BODY, lhIn: 2, lhx: Lh[0], lhy: Lh[1], lhz: Lh[2], rhIn: 2, rhx: Rh[0], rhy: Rh[1], rhz: Rh[2], le, re };
})();
export const PT_ABED_LONG = 3.0;
/** In bed: breathing slow, the head stirring on the pillow, a hand twitching, mouthing in their sleep. */
function patientAbed(): Motion {
  const T = PT_ABED_LONG;
  const keys: Key3[] = [];
  const N = 30;
  for (let i = 0; i <= N; i++) {
    const t = (i / N) * T;
    const a = (t / T) * Math.PI * 2;
    const breath = Math.sin(a * 2);
    keys.push({
      at: t,
      ease: 'lin',
      pose: {
        ...LYING,
        pz: (LYING.pz as number) + 0.3 * breath,
        side: 2.0 * breath,
        faceTilt: (LYING.faceTilt as number) + 7 * Math.sin(a + 0.5),
        faceUp: (LYING.faceUp as number) - 3 * Math.sin(a),
        lhx: (LYING.lhx as number) + 0.5 * Math.max(0, Math.sin(a * 3)),
        pt: 0.3 + 0.3 * Math.max(0, Math.sin(a * 3)),
      },
    });
  }
  return { loop: 0, keys };
}
const abedJaw = (t: number): number => 0.12 + 0.2 * Math.max(0, Math.sin((fr(t / PT_ABED_LONG) * Math.PI * 4)));

/** They rise: how long; when their eyes open; sat up; their head turned to you; their feet on the floor; stood. */
export const PT_RISE = { long: 2.3, eyes: 0.12, sat: 0.46, look: 0.76, feet: 1.32, up: 1.96 } as const;
/** The stand's own first frame, the hands said where they are (so that the rise hands over to the stand without a leap). */
const STAND0: P = (() => {
  const q = bonesAt(patientStand().keys, R, 0);
  const h = handsOf(q);
  return { ...q, lhIn: 2, lhx: h.L[0], lhy: h.L[1], lhz: h.L[2], rhIn: 2, rhx: h.R[0], rhy: h.R[1], rhz: h.R[2] };
})();
function patientRise(): Motion {
  const X = PT_BED.x;
  const edge = X + PT_BED.wide;
  const S = PT_RISE;
  const pick = (q: P, ks: ReadonlyArray<keyof Bones>): P => Object.fromEntries(ks.map((k) => [k, q[k]])) as P;
  const spans: Span[] = [
    // a twitch, and the eyes open
    { t0: 0.02, t1: 0.12, to: { faceTilt: -8, pt: 0.8 } },
    // SAT BOLT UPRIGHT: up off the pillow, leaning over the drawn-up knees, the hands pushing on the mattress
    { t0: 0.1, t1: S.sat, to: { roll: 8, pz: -8.0, faceUp: -4, faceTilt: 0, lk: -90, lkUp: 55, rk: 270, rkUp: 55, pt: 0.3, side: 0 } },
    { t0: 0.1, t1: S.sat, to: { lhx: X + 7, lhy: -7, lhz: PT_BED.top + 3.0, rhx: X - 7, rhy: -7, rhz: PT_BED.top + 3.0 } },
    // the head turned to you
    { t0: S.sat - 0.04, t1: S.look, to: { faceTurn: -30, faceUp: 0, faceTilt: -6 } },
    // the legs swung round over the side, the body turning on the mattress to sit on its edge
    { t0: S.look - 0.06, t1: S.feet - 0.06, to: { yaw: 0, roll: 0, pitch: 14, px: edge - 3, py: 0, faceTurn: 0, faceUp: -6, lk: R.lk, lkUp: 0, rk: R.rk + 360, rkUp: 0 } },
    { t0: S.look - 0.06, t1: S.feet - 0.1, to: { lhx: edge - 3, lhy: 9, rhx: edge - 3, rhy: -9 } },
    { t0: S.look - 0.04, t1: 1.12, to: { lfx: -7, lfy: -4, lfz: PT_BED.top + 2.4, lfp: 30, lft: -40, rfx: -9, rfy: -10, rfz: PT_BED.top + 2.0, rfp: 30, rft: -50 } },
    { t0: 1.0, t1: S.feet, to: { lfx: R.lfx, lfy: R.lfy, lfz: 0, lfp: 0, lft: R.lft, rfx: R.rfx, rfy: R.rfy, rfz: 0, rfp: 0, rft: R.rft } },
    // leaning out over the feet, pushing off the bed, and up
    { t0: S.feet - 0.06, t1: 1.6, to: { pitch: 34, px: -5, pz: -5.0, faceUp: -2 } },
    { t0: 1.56, t1: S.up, to: { ...pick(STAND0, ['px', 'py', 'pz', 'yaw', 'pitch', 'roll', 'twist', 'bend', 'side', 'faceTurn', 'faceUp', 'faceTilt', 'lk', 'lkUp', 'rkUp']), rk: (STAND0.rk as number) + 360 } },
    { t0: 1.48, t1: S.up + 0.1, to: pick(STAND0, ['lhx', 'lhy', 'lhz', 'rhx', 'rhy', 'rhz', 'le', 're', 'pt']) },
    // settled into the stand's first frame
    { t0: S.up, t1: S.long, to: { ...pick(STAND0, ['px', 'py', 'pz', 'yaw', 'pitch', 'roll', 'twist', 'bend', 'side', 'faceTurn', 'faceUp', 'faceTilt', 'lhx', 'lhy', 'lhz', 'rhx', 'rhy', 'rhz', 'le', 're', 'lfx', 'lfy', 'lfz', 'lfp', 'lft', 'rfx', 'rfy', 'rfz', 'rfp', 'rft', 'lk', 'lkUp', 'rkUp', 'pt']), rk: (STAND0.rk as number) + 360 } },
  ];
  return { keys: flowing(LYING, spans, S.long) };
}
const riseJaw = (t: number): number => (t < PT_RISE.eyes ? 0.15 : t < PT_RISE.sat ? 0.15 + 0.85 * sm((t - PT_RISE.eyes) / (PT_RISE.sat - PT_RISE.eyes)) : t < 1.2 ? 1 - 0.4 * sm((t - PT_RISE.sat) / 0.6) : patientJaw(0) + (0.6 - patientJaw(0)) * (1 - sm((t - 1.2) / (PT_RISE.long - 1.2))));

// ---------------------------------------------------------------------------------------------
// THEM, AS THE GAME HOLDS A MONSTER

const NAMES = { stand: 'The patients stand, swaying', walk: 'The patients shuffle', attack: 'The silent scream', reel: 'The patients are struck', dying: 'The Hush leaves them', abed: 'The patients lie in their beds', rise: 'The patients sit up in their beds' } as const;
function patientMob(who: PatientWho): Mob {
  const paint = patientPainter(who, {
    eyes: (m: Moment) => (m.move === NAMES.abed ? 0 : m.move === NAMES.rise ? (m.t >= PT_RISE.eyes ? 1 : 0) : 1),
    scream: (m: Moment) => (m.move === NAMES.attack ? screamAt(m.t) : 0),
  });
  const mv = (name: string, motion: Motion, more: Partial<MobMove> = {}): MobMove => ({ name, motion, rest: R, ...more });
  return {
    id: `patient-${who}`,
    name: who === 'man' ? 'A Hushed patient' : 'A Hushed patient (a woman)',
    size: "small: the knight's height",
    build: B,
    stand: mv(NAMES.stand, patientStand(), { jaw: patientJaw }),
    attack: mv(NAMES.attack, patientScream(), { feet: patientScreamFeet(), glint: screamGlint, jaw: screamJaw }),
    idleFrames: 30,
    idleFps: 10,
    walk: mv(NAMES.walk, patientWalk(), { period: PT_WALK.frames / PT_WALK.fps, ground: PT_PACE * TILE3, jaw: walkJaw }),
    walkFrames: PT_WALK.frames,
    walkFps: PT_WALK.fps,
    pace: PT_PACE,
    reel: mv(NAMES.reel, patientReel(), { jaw: reelJaw }),
    reelTime: 0.4,
    hit: H,
    warn: PT_SCREAM.warn[1] - PT_SCREAM.warn[0],
    dieTime: PT_DIES.long,
    dying: mv(NAMES.dying, patientDying(), { feet: patientDyingFeet(), jaw: dieJaw }),
    more: {
      abed: mv(NAMES.abed, patientAbed(), { jaw: abedJaw }),
      rise: mv(NAMES.rise, patientRise(), { jaw: riseJaw }),
    },
    aura: { x: PT_CANVAS.ax, y: PT_CANVAS.ay - 40, r: 34, color: '#9890b4', a: 0.06 },
    shadow: 11,
    canvas: PT_CANVAS,
    trueBack: true,
    bits: paint.bits,
    grains: paint.grains,
  };
}
export const PATIENT_MAN = patientMob('man');
export const PATIENT_WOMAN = patientMob('woman');
export const PATIENTS_ALL: readonly Mob[] = [PATIENT_MAN, PATIENT_WOMAN];
export function makePatientArt3(mob: Mob = PATIENT_MAN, pace = mob.pace): ActorArt {
  return { front: mobSet(mob, 'front', pace), back: mobSet(mob, 'back', pace) };
}

// ---------------------------------------------------------------------------------------------
// THEM AS THE CHECKS SEE THEM (art/boss_checks.ts)

export function patientSolids(s: Skeleton): { limbs: CheckLimb[]; lumps: CheckLump[] } {
  const [rH, rK, rA] = B.legR;
  const [r0, r1] = B.armR;
  const limbs: CheckLimb[] = [];
  for (const side of ['L', 'R'] as const) {
    const L = side === 'L';
    limbs.push(
      { name: `leg${side}`, a: L ? s.hipL : s.hipR, b: L ? s.kneeL : s.kneeR, r: rH * 1.0 },
      { name: `shin${side}`, a: L ? s.kneeL : s.kneeR, b: L ? s.ankleL : s.ankleR, r: Math.max(rK, rA) * 0.95 },
      { name: `foot${side}`, a: add(L ? s.heelL : s.heelR, [0, 0, 1.2]), b: add(L ? s.toeL : s.toeR, [0, 0, 1.2]), r: 1.6 },
      { name: `upper${side}`, a: L ? s.shoulderL : s.shoulderR, b: L ? s.elbowL : s.elbowR, r: r0 * 1.18 },
      { name: `fore${side}`, a: L ? s.elbowL : s.elbowR, b: L ? s.handL : s.handR, r: r1 * 1.12 },
    );
  }
  limbs.push({ name: 'neck', a: s.neck, b: lerp3(s.neck, s.head, 0.5), r: 2.1 });
  const waistC = add(s.pelvis, mul(s.hips[2], B.waist * 0.6));
  const lumps: CheckLump[] = [
    { name: 'head', c: s.head, rot: s.face, h: [B.headR[0] * 1.02, B.headR[1] * 1.08, B.headR[2]] },
    { name: 'chest', c: lerp3(s.ribs, s.neck, 0.3), rot: s.chest, h: [B.ribDeep + 1.9, B.ribHalf + 2.0, len3(sub(s.neck, s.ribs)) * 0.55] },
    { name: 'belly', c: lerp3(waistC, s.ribs, 0.45), rot: s.belly, h: [B.waistDeep + 1.8, B.waistHalf + 1.8, Math.max(3, len3(sub(s.ribs, waistC)) * 0.6)] },
    { name: 'hips', c: add(s.pelvis, mul(s.hips[2], B.waist * 0.2)), rot: s.hips, h: [B.pelvisDeep + 2.0, B.pelvisHalf + 2.2, B.waist * 0.75] },
  ];
  return { limbs, lumps };
}
/** Where they scream from: the mouth. */
export function mouthOf(s: Skeleton): V3 {
  return add(s.head, add(mul(s.face[0], B.headR[0]), mul(s.face[2], -B.headR[2] * 0.4)));
}
/** THEIR HANDOVERS: their stand into each move and back, as any; into their walk and out of it; but in bed only into their rising, and their rising into their stand. */
function patientHandovers(mob: Mob): Handover[] {
  const out: Handover[] = [];
  for (const m of ['attack', 'reel']) out.push({ from: 'stand', at: 0, to: m, toAt: 0 }, { from: m, at: 'end', to: 'stand', toAt: 0 });
  out.push({ from: 'stand', at: 0, to: 'dying', toAt: 0 }, { from: 'stand', at: 0, to: 'walk', toAt: 0 });
  const walkLong = mob.walkFrames / mob.walkFps;
  for (let i = 0; i <= mob.walkFrames; i++) out.push({ from: 'walk', at: (i / mob.walkFrames) * walkLong, to: 'stand', toAt: 0 });
  for (let i = 0; i <= 30; i++) out.push({ from: 'abed', at: i / 10, to: 'rise', toAt: 0 });
  out.push({ from: 'rise', at: 'end', to: 'stand', toAt: 0 });
  return out;
}
export const PT_SHAPE: BossShape = {
  body: patientSolids,
  // (what they strike with: the scream, out of the mouth)
  tip: (move, _t, s) => (move === 'attack' ? mouthOf(s) : null),
  handovers: patientHandovers(PATIENT_MAN),
};
