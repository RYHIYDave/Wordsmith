// THE HUSHED TOWNSFOLK: THEIR MOVES (the art chat for floors 11 to 15, 18 Oct 2026). A MOCK-UP: NOT IN THE GAME,
// behind HUSHED_ON (art/hushed.ts, off). Their look and brief are art/hushed.ts.
//
// His picks (18 Oct): how they fight, “Shuffle, then lunge and grab (Recommended)” (offered as: slow shuffling
// crowds that suddenly lunge to grab and claw at you); how they go down, “The Hush leaves them (Recommended)”
// (offered as: they gasp as grey breath leaves them, and slump to the ground: people, not monsters). To their
// look, “Yes, animate them (Recommended)”. To their four films (the shuffle, the lunge and grab, struck, and the
// Hush leaving them), “Yes, as shown (Recommended)”.
//
// THEIR MOVES, the same for the three of them:
//   STANDING (art/hushed.ts): swaying on their feet, the head lolling, the mouth working on words that make no sound.
//   THE SHUFFLE: slow, the feet barely lifted, dragging, the body rocking from side to side over them, the head
//     hung forward, the arms swinging slack.
//   THE LUNGE AND GRAB (their blow): all at once the head comes up and the arms go up and out, the hands spread
//     like claws, the mouth gaping, the Hush gusting out of it, held trembling a moment (THE WARNING); then a lunge,
//     a long step in, both hands driving at you and clutching shut (the blow); they claw down, wrenching at what
//     they caught; and step back and slump again.
//   STRUCK: jolted back, the head snapped back, the Hush coughed out.
//   THE HUSH LEAVES THEM (their death, his pick): rocked back; they gasp, the head thrown back, the mouth wide,
//     and the Hush pours up out of them in one great grey breath; the dull pink goes out of their eyes; their knees
//     give; they sway on them, and slump forward onto the floor, and lie still: people again, asleep.
//
// By his rulebook: every move through every check the bosses have (art/boss_checks.ts), from in front and behind:
// their feet grip the floor; nothing through them; nothing in the floor; nothing jerky; the blow drawn back, held
// and carried through, hips first; alive when still.
//   test: tsx --test tests/hushed.test.ts

import { footwork, kneelHips, kneelSettle, plantBy, plantOf } from './bosses3';
import type { Plant } from './bosses3';
import type { BossShape, CheckLimb, CheckLump } from './boss_checks';
import type { ActorArt } from './actor_types';
import { HUSHED_BODY, HUSHED_CANVAS, HUSHED_REST, HUSHED_STAND_LONG, hushedPainter, hushedStand, standJaw } from './hushed';
import type { HushedWho } from './hushed';
import { TILE3, mobSet } from './new_mobs3';
import type { Mob, MobMove } from './new_mobs3';
import { add, elbowFor, lerp3, mul, norm, solve, sub } from './skeleton';
import type { Bones, Key3, Motion, Posed, Skeleton, V3 } from './skeleton';

type P = Partial<Bones>;
const B = HUSHED_BODY;
const R = HUSHED_REST;
const L0 = plantOf(B, 'L', {}, R);
const R0 = plantOf(B, 'R', {}, R);

/** Their elbows pointed as nearly toward these ways as their arms let them. */
function elbowsTo(pose: P, wantL: V3 | null, wantR: V3 | null): P {
  const q = { ...R, ...pose } as Posed;
  const le = wantL ? elbowFor(B, q, true, norm(wantL)) : q.le;
  const re = wantR ? elbowFor(B, { ...q, le } as Posed, false, norm(wantR)) : q.re;
  return { ...pose, le, re };
}

// ---------------------------------------------------------------------------------------------
// THE SHUFFLE

/** Their shuffle: ten frames at eight a second, painted for HU_PACE tiles a second. */
export const HU_PACE = 0.9;
export const HU_WALK = { frames: 10, fps: 8 } as const;
/** A foot of a walk of `n` frames, `k` frames into its round: down from the first frame to the middle one, carried back under the figure; then lifted (barely) and swung through. Forward, lift, how its sole is tipped. */
function stepFoot(k: number, n: number, step: number, lift: number): [number, number, number] {
  const half = n / 2;
  if (k <= half) return [step * (half / 2 - k), 0, 0];
  const u = (k - half) / half;
  const g = u * u * (3 - 2 * u);
  return [-step * (half / 2) + step * half * g, lift * Math.sin(Math.PI * u), 10 * Math.sin(Math.PI * u) * (1 - u) - 4 * Math.sin(Math.PI * u) * u];
}
function hushedWalk(): Motion {
  const n = HU_WALK.frames;
  const d = (HU_PACE * TILE3) / HU_WALK.fps;
  const keys: Key3[] = [];
  for (let i = 0; i <= n; i++) {
    const j = i % n;
    const a = (j / n) * Math.PI * 2;
    // (each foot barely lifted, dragged through)
    const [lx, lz, lp] = stepFoot(j, n, d, 1.9);
    const [rx, rz, rp] = stepFoot((j + n / 2) % n, n, d, 1.9);
    // (the body rocking over onto each foot as it comes down, sagging, the head lolling with it)
    const sag = Math.abs(Math.sin(a));
    keys.push({
      at: i / HU_WALK.fps,
      ease: 'lin',
      pose: {
        pz: R.pz - 0.9 * sag, py: 1.8 * Math.sin(a), roll: R.roll + 5 * Math.sin(a), yaw: 3 * Math.cos(a), side: R.side + 2 * Math.sin(a),
        bend: R.bend + 2 * sag, pitch: R.pitch + 3, faceUp: R.faceUp - 3 * sag, faceTilt: R.faceTilt + 9 * Math.sin(a), faceTurn: R.faceTurn + 4 * Math.cos(a),
        lfx: lx, lfz: lz, lfp: lp, lfy: R.lfy, lft: R.lft,
        rfx: rx, rfz: rz, rfp: rp, rfy: R.rfy, rft: R.rft,
        lhx: R.lhx + 2.2 * Math.sin(a + Math.PI), rhx: R.rhx + 2.2 * Math.sin(a),
        lhz: R.lhz + 0.6 * sag, rhz: R.rhz + 0.6 * sag,
      },
    });
  }
  return { keys, loop: 0 };
}
/** Their mouth as they shuffle: hanging open, working now and then. */
const walkJaw = (t: number): number => 0.45 + 0.3 * Math.max(0, Math.sin((t / (HU_WALK.frames / HU_WALK.fps)) * Math.PI * 4));

// ---------------------------------------------------------------------------------------------
// THE LUNGE AND GRAB

/** Their blow: how long; when their hands clutch shut on you (a frame of the game's thirty a second); when the warning is held from and to. */
export const HU_GRAB = { long: 1.4, hit: 18 / 30, warn: [0.22, 0.42] } as const;
/** Reared, arms up and out, hands spread as claws, head up, mouth gaping: the warning. */
const REAR: P = elbowsTo({ px: -2.6, pz: R.pz + 1.0, pitch: -5, bend: -7, side: 0, roll: 0, faceUp: 22, faceTilt: -2, faceTurn: 0, lhIn: 1, lhx: 1.5, lhy: 9, lhz: 1, rhIn: 1, rhx: 1.5, rhy: -9, rhz: 1, pt: 1, lk: 8, rk: -8 }, [-0.2, 0.9, -0.4], [-0.2, -0.9, -0.4]);
const tremble = (k: number): P => ({ ...REAR, lhz: (REAR.lhz as number) + (k % 2 ? 0.8 : -0.4), rhz: (REAR.rhz as number) + (k % 2 ? -0.4 : 0.8), px: (REAR.px as number) - 0.3 * (k % 2) });
/** The lunge's start: the hips already driving forward, the arms still back (hips first). */
const DRIVE: P = elbowsTo({ ...REAR, px: 0.5, pz: R.pz - 0.4, pitch: 8, bend: -4, lhx: 1, lhz: 0, rhx: 1, rhz: 0 }, [-0.2, 0.9, -0.4], [-0.2, -0.9, -0.4]);
/** The grab: thrown forward on a long step, both hands driven at you at chest height, clutching shut. */
const GRAB: P = elbowsTo({ px: 8.5, pz: R.pz - 2.4, pitch: 24, bend: 18, faceUp: 14, faceTilt: 0, lhIn: 1, lhx: 19, lhy: 3.2, lhz: -3, rhIn: 1, rhx: 19, rhy: -3.2, rhz: -3, pt: 0.1, lk: 22, rk: -6 }, [0, 0.8, -0.6], [0, -0.8, -0.6]);
/** Clawing down and back at what they caught, bent over it. */
const CLAW: P = elbowsTo({ px: 6.5, pz: R.pz - 3.2, pitch: 30, bend: 24, faceUp: 10, faceTilt: -4, lhIn: 1, lhx: 13, lhy: 2.6, lhz: -15, rhIn: 1, rhx: 13, rhy: -2.6, rhz: -15, pt: 0, lk: 24, rk: -8 }, [0, 0.8, -0.6], [0, -0.8, -0.6]);
function hushedGrab(): Motion {
  const H = HU_GRAB.hit;
  return {
    hit: H,
    keys: [
      { at: 0, pose: {} },
      { at: 0.18, pose: REAR, ease: 'io' },
      { at: 0.26, pose: tremble(1), ease: 'io' },
      { at: 0.34, pose: tremble(2), ease: 'io' },
      { at: HU_GRAB.warn[1], pose: tremble(3), ease: 'io' },
      { at: H - 0.1, pose: DRIVE, ease: 'in' },
      { at: H, pose: GRAB, ease: 'lin' },
      { at: H + 0.12, pose: { ...GRAB, px: 9, pitch: 27, bend: 21, lhz: -7, rhz: -7, pt: 0 }, ease: 'out' },
      { at: 0.92, pose: CLAW, ease: 'io' },
      { at: 1.12, pose: { ...CLAW, px: 3, pz: R.pz - 1.6, pitch: 16, bend: 16, lhx: 8, rhx: 8, lhz: -18, rhz: -18 }, ease: 'io' },
      { at: HU_GRAB.long, pose: {}, ease: 'io' },
    ],
  };
}
function hushedGrabFeet(): (t: number) => P {
  const H = HU_GRAB.hit;
  return footwork(B, {
    L: { start: L0, moves: [{ t0: H - 0.12, t1: H - 0.01, to: plantBy(L0, 9, 0.5), lift: 3 }, { t0: 1.0, t1: 1.28, to: L0, lift: 2.4 }] },
    R: { start: R0, moves: [{ t0: H - 0.06, t1: H + 0.04, to: { ...R0, pitch: 20 } }, { t0: 1.02, t1: 1.24, to: R0 }] },
  });
}
/** The Hush gusting out of them as they rear and lunge (the warning): up as they rear, hardest as they grab, dying back after. */
function grabGust(t: number): number {
  const H = HU_GRAB.hit;
  if (t < 0.08 || t > H + 0.45) return 0;
  return t < 0.22 ? (t - 0.08) / 0.14 : t <= H + 0.1 ? 1 : 1 - (t - H - 0.1) / 0.35;
}
const grabJaw = (t: number): number => (t < 0.12 ? 0.45 + 2 * t : t < HU_GRAB.hit + 0.2 ? 1 : 1 - 0.5 * Math.min(1, (t - HU_GRAB.hit - 0.2) / 0.5));

// ---------------------------------------------------------------------------------------------
// STRUCK

function hushedReel(): Motion {
  return {
    keys: [
      { at: 0, pose: {} },
      { at: 0.06, pose: { px: -2.6, pz: R.pz + 0.4, pitch: -2, bend: -4, faceUp: R.faceUp + 26, faceTilt: R.faceTilt + 10, lhx: 0.5, rhx: 0.2, lhy: 5, rhy: -5.4, lhz: -17, rhz: -17.5, out: 0.1 }, ease: 'out' },
      { at: 0.18, pose: { px: -1.2, pitch: 5, bend: 6, faceUp: R.faceUp + 8 }, ease: 'io' },
      { at: 0.4, pose: {}, ease: 'io' },
    ],
  };
}
const reelJaw = (t: number): number => (t < 0.25 ? 1 : 0.45);

// ---------------------------------------------------------------------------------------------
// THE HUSH LEAVES THEM

export const HU_DIES = { long: 2.2, gasp: 0.3, knees: 0.85, down: 1.85 } as const;
const DIE_FEET = ((): Record<'L' | 'R', Plant> => ({ L: plantBy(L0, R0.at[0] - L0.at[0] + 3, 0), R: R0 }))();
const TUCK = 56;
const KNEE_DOWN = B.legR[1] * 1.3;
const kneeling = (lean: number, body: P): P => kneelSettle(B, R, { ...kneelHips(B, R, DIE_FEET, TUCK, KNEE_DOWN, lean), ...body }, DIE_FEET, TUCK, KNEE_DOWN);
const HANG = -(B.upperArm + B.foreArm) * 0.9;
const HANGING: P = { lhIn: 0, lhx: 3, lhy: 8, lhz: HANG + 4, le: -10, rhIn: 0, rhx: 3, rhy: -8, rhz: HANG + 4, re: 10 };
/** Their arms laid limp on the floor where their body puts them as it goes down: each hand `back` behind its shoulder and `out` to its side. */
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
const ON_KNEES: P = kneeling(6, { yaw: 0, pitch: 2, roll: 2, twist: 0, bend: 4, side: 1, faceTurn: 0, faceUp: 4, faceTilt: 10, ...HANGING });
const FOLD: P = kneeling(14, { yaw: 4, pitch: 28, roll: 3, twist: 0, bend: 22, side: 1, faceTurn: 6, faceUp: -30, faceTilt: 8, ...HANGING });
const SLUMP: P = limp(kneeling(30, { yaw: 6, pitch: 62, roll: 2, twist: 0, bend: 24, side: 0, faceTurn: 14, faceUp: -48, faceTilt: 14 }), 8, 10);
const PRONE: P = { ...limp(lifted(kneeling(66, { yaw: 8, pitch: 80, roll: 6, twist: 0, bend: 8, side: 0, faceTurn: 30, faceUp: -36, faceTilt: 22 }), 2.2), 22, 9), out: 1 };
function hushedDying(): Motion {
  return {
    keys: [
      { at: 0, pose: {} },
      { at: 0.08, pose: { px: -2.4, pz: R.pz, pitch: -3, bend: -5, faceUp: R.faceUp + 20, out: 0.15 }, ease: 'out' },
      // THE GASP: the head thrown back, the mouth wide, the chest arched, the arms falling open: the Hush pours out
      { at: HU_DIES.gasp, pose: { px: -2.2, pz: R.pz + 0.8, pitch: -9, bend: -15, faceUp: 42, faceTilt: 0, faceTurn: 0, lhIn: 1, lhx: -1, lhy: 6.5, lhz: -16, rhIn: 1, rhx: -1, rhy: -6.5, rhz: -16, out: 0.45 }, ease: 'out' },
      { at: 0.5, pose: { px: -2.0, pz: R.pz + 0.5, pitch: -8, bend: -13, faceUp: 38, faceTilt: 4, lhIn: 1, lhx: -0.6, lhy: 6, lhz: -17, rhIn: 1, rhx: -0.6, rhy: -6, rhz: -17, out: 0.85 }, ease: 'io' },
      // their knees give
      { at: 0.66, pose: { px: -0.6, pz: R.pz - 5, pitch: 2, bend: 2, faceUp: 14, lk: 26, rk: -26, ...HANGING, out: 1 }, ease: 'in' },
      { at: HU_DIES.knees, pose: { ...ON_KNEES, out: 1 }, ease: 'out' },
      { at: 1.05, pose: { ...ON_KNEES, pz: (ON_KNEES.pz as number) + 0.6, pitch: -2, roll: -3, faceUp: 10, out: 1 }, ease: 'io' },
      { at: 1.3, pose: { ...ON_KNEES, pitch: 8, roll: 4, faceUp: -6, out: 1 }, ease: 'io' },
      // and slump forward onto the floor, and lie still
      { at: 1.5, pose: { ...FOLD, out: 1 }, ease: 'in' },
      { at: 1.66, pose: { ...SLUMP, out: 1 }, ease: 'lin' },
      { at: HU_DIES.down, pose: PRONE, ease: 'out' },
      { at: HU_DIES.long, pose: PRONE, ease: 'io' },
    ],
  };
}
function hushedDyingFeet(): (t: number) => P {
  const F = DIE_FEET;
  return footwork(B, {
    L: { start: L0, moves: [{ t0: 0.04, t1: 0.26, to: F.L, lift: 2.4 }, { t0: 0.5, t1: 0.82, to: { ...F.L, pitch: TUCK } }] },
    R: { start: F.R, moves: [{ t0: 0.5, t1: 0.82, to: { ...F.R, pitch: TUCK } }] },
  });
}
const dieJaw = (t: number): number => (t < 0.1 ? 0.6 : t < 1.0 ? 1 : 1 - 0.6 * Math.min(1, (t - 1.0) / 0.6));

// ---------------------------------------------------------------------------------------------
// THEM, AS THE GAME HOLDS A MONSTER

const STAND_NAME = 'The Hushed stand, mouthing';
function hushedMob(who: HushedWho): Mob {
  const paint = hushedPainter(who);
  const mv = (name: string, motion: Motion, more: Partial<MobMove> = {}): MobMove => ({ name, motion, rest: R, ...more });
  return {
    id: `hushed-${who}`,
    name: who === 'porter' ? 'A Hushed porter' : who === 'goodwife' ? 'A Hushed goodwife' : 'A Hushed baker',
    size: "small: the knight's height",
    build: B,
    stand: mv(STAND_NAME, hushedStand(), { jaw: standJaw }),
    attack: mv('The Hushed lunge and grab', hushedGrab(), { feet: hushedGrabFeet(), glint: grabGust, jaw: grabJaw, trail: (s: Skeleton) => [s.handL, s.handR], trailSpan: 2.2 }),
    idleFrames: 28,
    idleFps: 10,
    walk: mv('The Hushed shuffle', hushedWalk(), { period: HU_WALK.frames / HU_WALK.fps, ground: HU_PACE * TILE3, jaw: walkJaw }),
    walkFrames: HU_WALK.frames,
    walkFps: HU_WALK.fps,
    pace: HU_PACE,
    reel: mv('The Hushed are struck', hushedReel(), { jaw: reelJaw, glint: (t) => (t < 0.3 ? 1 - t / 0.3 : 0) }),
    reelTime: 0.4,
    hit: HU_GRAB.hit,
    warn: HU_GRAB.warn[1] - HU_GRAB.warn[0],
    dieTime: HU_DIES.long,
    dying: mv('The Hush leaves them', hushedDying(), { feet: hushedDyingFeet(), jaw: dieJaw }),
    aura: { x: HUSHED_CANVAS.ax, y: HUSHED_CANVAS.ay - 40, r: 34, color: '#9890b4', a: 0.06 },
    shadow: 11,
    canvas: HUSHED_CANVAS,
    trueBack: true,
    bits: paint.bits,
    grains: paint.grains,
  };
}
export const HUSHED_PORTER = hushedMob('porter');
export const HUSHED_GOODWIFE = hushedMob('goodwife');
export const HUSHED_BAKER = hushedMob('baker');
export const HUSHED_ALL: readonly Mob[] = [HUSHED_PORTER, HUSHED_GOODWIFE, HUSHED_BAKER];
export function makeHushedArt3(mob: Mob = HUSHED_PORTER, pace = mob.pace): ActorArt {
  return { front: mobSet(mob, 'front', pace), back: mobSet(mob, 'back', pace) };
}

// ---------------------------------------------------------------------------------------------
// THEM AS THE CHECKS SEE THEM (art/boss_checks.ts): their outside as painted, by name

export function hushedSolids(s: Skeleton): { limbs: CheckLimb[]; lumps: CheckLump[] } {
  const [rH, rK, rA] = B.legR;
  const [r0, r1] = B.armR;
  const limbs: CheckLimb[] = [];
  for (const side of ['L', 'R'] as const) {
    const L = side === 'L';
    limbs.push(
      { name: `leg${side}`, a: L ? s.hipL : s.hipR, b: L ? s.kneeL : s.kneeR, r: rH * 1.08 },
      { name: `shin${side}`, a: L ? s.kneeL : s.kneeR, b: L ? s.ankleL : s.ankleR, r: Math.max(rK, rA) * 1.05 },
      { name: `foot${side}`, a: add(L ? s.heelL : s.heelR, [0, 0, 1.5]), b: add(L ? s.toeL : s.toeR, [0, 0, 1.5]), r: 1.8 },
      { name: `upper${side}`, a: L ? s.shoulderL : s.shoulderR, b: L ? s.elbowL : s.elbowR, r: r0 * 1.12 },
      { name: `fore${side}`, a: L ? s.elbowL : s.elbowR, b: L ? s.handL : s.handR, r: r1 * 1.08 },
    );
  }
  limbs.push({ name: 'neck', a: s.neck, b: lerp3(s.neck, s.head, 0.5), r: 2.2 });
  const waistC = add(s.pelvis, mul(s.hips[2], B.waist * 0.6));
  const lumps: CheckLump[] = [
    { name: 'head', c: s.head, rot: s.face, h: [B.headR[0] * 1.05, B.headR[1] * 1.1, B.headR[2]] },
    { name: 'chest', c: lerp3(s.ribs, s.neck, 0.3), rot: s.chest, h: [B.ribDeep + 1.6, B.ribHalf + 1.8, len3(sub(s.neck, s.ribs)) * 0.55] },
    { name: 'belly', c: lerp3(waistC, s.ribs, 0.45), rot: s.belly, h: [B.waistDeep + 1.4, B.waistHalf + 1.4, Math.max(3, len3(sub(s.ribs, waistC)) * 0.6)] },
    { name: 'hips', c: add(s.pelvis, mul(s.hips[2], B.waist * 0.2)), rot: s.hips, h: [B.pelvisDeep + 1.8, B.pelvisHalf + 2.0, B.waist * 0.75] },
  ];
  return { limbs, lumps };
}
const len3 = (v: V3): number => Math.hypot(v[0], v[1], v[2]);
export const HU_SHAPE: BossShape = {
  body: hushedSolids,
  // (what they strike with: their right hand)
  tip: (_move, _t, s) => s.handR,
};
