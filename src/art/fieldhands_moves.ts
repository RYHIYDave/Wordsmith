// THE HUSHED WORKING THE FIELDS: THEIR MOVES (the art chat for floors 11 to 15, 19 Oct 2026). A MOCK-UP: NOT IN THE GAME,
// behind FIELDHANDS_ON (art/fieldhands.ts, off). Their look and brief are art/fieldhands.ts: made on his word of 18 Oct,
// 21:24 Pacific, “Hey go without my say so.  If something is shit I’ll get it to it but you’re doing a great jobs. At
// least for 11-15”, the picks this chat would have marked recommended, and sent him with their films.
//
// THEIR MOVES, the same for both (a reaper, a gleaner):
//   STANDING (art/fieldhands.ts): stooped, reaping at corn that is not there, over and over, the mouth working.
//   THE SHUFFLE: floor 11's Hushed's, the sickle hanging in the hand.
//   THE SICKLE SLASH (their blow): the sickle raised high over the right shoulder, the body wound round, the head up,
//     the blade glinting pink, held shaking (THE WARNING); then hips first, a step in, and a slash down and across
//     before them from their right to their left; carried through low to the left; back to the stoop.
//   STRUCK: jolted back, the head snapped back, the Hush coughed out.
//   THE HUSH LEAVES THEM (their death, his pick for the Hushed): rocked back; a gasp, the head thrown back, the Hush
//     pouring up out of them in one great grey breath; the sickle drops from the hand; the knees give; they slump forward
//     onto the floor and lie still: people again.
//
// By his rulebook: every move through every check the bosses have (art/boss_checks.ts), from in front and behind.
//   test: tsx --test tests/fieldhands.test.ts

import { footwork, kneelHips, kneelSettle, plantBy, plantOf } from './bosses3';
import type { Plant } from './bosses3';
import type { BossShape, CheckLimb, CheckLump, CheckThing } from './boss_checks';
import type { ActorArt } from './actor_types';
import { FH_BODY, FH_CANVAS, FH_REST, fieldJaw, fieldPainter, fieldStand, sickleOf } from './fieldhands';
import type { FieldhandWho } from './fieldhands';
import { TILE3, mobSet } from './new_mobs3';
import type { Mob, MobMove, Moment } from './new_mobs3';
import { add, elbowFor, lerp3, mul, norm, solve, sub } from './skeleton';
import type { Bones, Key3, Motion, Posed, Skeleton, V3 } from './skeleton';

type P = Partial<Bones>;
const B = FH_BODY;
const R = FH_REST;
const L0 = plantOf(B, 'L', {}, R);
const R0 = plantOf(B, 'R', {}, R);

function elbowsTo(pose: P, wantL: V3 | null, wantR: V3 | null): P {
  const q = { ...R, ...pose } as Posed;
  const le = wantL ? elbowFor(B, q, true, norm(wantL)) : q.le;
  const re = wantR ? elbowFor(B, { ...q, le } as Posed, false, norm(wantR)) : q.re;
  return { ...pose, le, re };
}

// ---------------------------------------------------------------------------------------------
// THE SHUFFLE (floor 11's Hushed's)

export const FH_PACE = 0.9;
export const FH_WALK = { frames: 10, fps: 8 } as const;
function stepFoot(k: number, n: number, step: number, lift: number): [number, number, number] {
  const half = n / 2;
  if (k <= half) return [step * (half / 2 - k), 0, 0];
  const u = (k - half) / half;
  const g = u * u * (3 - 2 * u);
  return [-step * (half / 2) + step * half * g, lift * Math.sin(Math.PI * u), 10 * Math.sin(Math.PI * u) * (1 - u) - 4 * Math.sin(Math.PI * u) * u];
}
function fieldWalk(): Motion {
  const n = FH_WALK.frames;
  const d = (FH_PACE * TILE3) / FH_WALK.fps;
  const keys: Key3[] = [];
  for (let i = 0; i <= n; i++) {
    const j = i % n;
    const a = (j / n) * Math.PI * 2;
    const [lx, lz, lp] = stepFoot(j, n, d, 1.9);
    const [rx, rz, rp] = stepFoot((j + n / 2) % n, n, d, 1.9);
    const sag = Math.abs(Math.sin(a));
    keys.push({
      at: i / FH_WALK.fps,
      ease: 'lin',
      pose: {
        pz: R.pz - 0.9 * sag, py: 1.8 * Math.sin(a), roll: R.roll + 5 * Math.sin(a), yaw: 3 * Math.cos(a), side: R.side + 2 * Math.sin(a),
        bend: R.bend + 2 * sag, pitch: R.pitch + 3, faceUp: R.faceUp - 3 * sag, faceTilt: R.faceTilt + 9 * Math.sin(a), faceTurn: R.faceTurn + 4 * Math.cos(a),
        lfx: lx, lfz: lz, lfp: lp, lfy: R.lfy, lft: R.lft,
        rfx: rx, rfz: rz, rfp: rp, rfy: R.rfy, rft: R.rft,
        lhx: R.lhx + 2.2 * Math.sin(a + Math.PI), rhx: R.rhx + 2.2 * Math.sin(a),
        lhz: R.lhz + 0.6 * sag, rhz: R.rhz + 0.6 * sag,
        wEl: (R.wEl as number) - 6 * Math.sin(a),
      },
    });
  }
  return { keys, loop: 0 };
}
const walkJaw = (t: number): number => 0.45 + 0.3 * Math.max(0, Math.sin((t / (FH_WALK.frames / FH_WALK.fps)) * Math.PI * 4));

// ---------------------------------------------------------------------------------------------
// THE SICKLE SLASH

/** Their blow: how long; when the blade crosses before them (a frame of the game's thirty a second); the warning. */
export const FH_SLASH = { long: 1.3, hit: 17 / 30, warn: [0.24, 0.44] } as const;
const H = FH_SLASH.hit;
/** Raised high over the right shoulder, the body wound round to the right, the head up, the mouth gaping. */
const RAISED: P = elbowsTo({ px: -1.6, pz: R.pz + 0.6, yaw: -6, twist: -14, pitch: -2, bend: -4, side: 2, roll: 0, faceUp: 14, faceTilt: -2, faceTurn: 8, lhIn: 1, lhx: 6, lhy: 6, lhz: -12, rhIn: 1, rhx: -3, rhy: -7, rhz: 14, wAz: -150, wEl: 40, wRoll: 90, lk: 9, rk: -10 }, [0.4, 0.8, -0.4], [-0.3, -0.8, 0.5]);
const shake = (k: number): P => ({ ...RAISED, rhz: (RAISED.rhz as number) + (k % 2 ? 0.7 : -0.3), px: (RAISED.px as number) - 0.25 * (k % 2) });
/** Hips first: the body coming round and forward, the sickle still up behind. */
const DRIVE: P = elbowsTo({ ...RAISED, px: 0.8, pz: R.pz - 0.2, yaw: 4, twist: -12, pitch: 8, bend: 0, faceUp: 10, faceTurn: 2, rhx: -1, rhz: 13 }, [0.4, 0.8, -0.4], [-0.3, -0.8, 0.5]);
/** THE SLASH: down and across before them, right to left, a step in. */
const SLASH: P = elbowsTo({ px: 5, pz: R.pz - 1.6, yaw: 8, twist: 12, pitch: 18, bend: 14, side: -2, roll: 0, faceUp: 8, faceTilt: 0, faceTurn: -6, lhIn: 1, lhx: 3, lhy: 9, lhz: -14, rhIn: 1, rhx: 15, rhy: 0, rhz: -6, wAz: 55, wEl: -12, wRoll: 90, lk: 18, rk: -8 }, [0, 0.9, -0.4], [0.2, -0.9, -0.3]);
/** Carried through low to their left. */
const THROUGH: P = elbowsTo({ px: 5.5, pz: R.pz - 2.2, yaw: 12, twist: 20, pitch: 22, bend: 18, side: -3, faceUp: 6, faceTurn: -10, lhIn: 1, lhx: 1, lhy: 9, lhz: -16, rhIn: 1, rhx: 10, rhy: 8, rhz: -15, wAz: 90, wEl: -30, wRoll: 90, lk: 20, rk: -8 }, [0, 0.9, -0.4], [0.3, -0.6, -0.6]);
function fieldSlash(): Motion {
  return {
    hit: H,
    keys: [
      { at: 0, pose: {} },
      { at: FH_SLASH.warn[0], pose: RAISED, ease: 'io' },
      { at: 0.31, pose: shake(1), ease: 'io' },
      { at: 0.38, pose: shake(2), ease: 'io' },
      { at: FH_SLASH.warn[1], pose: shake(3), ease: 'io' },
      { at: H - 0.08, pose: DRIVE, ease: 'in' },
      { at: H, pose: SLASH, ease: 'lin' },
      { at: H + 0.14, pose: THROUGH, ease: 'out' },
      { at: 0.92, pose: { ...THROUGH, px: 3.5, pz: R.pz - 1.4, twist: 14, pitch: 16, bend: 15, rhz: -18 }, ease: 'io' },
      { at: FH_SLASH.long, pose: {}, ease: 'io' },
    ],
  };
}
function fieldSlashFeet(): (t: number) => P {
  return footwork(B, {
    L: { start: L0, moves: [{ t0: H - 0.12, t1: H - 0.01, to: plantBy(L0, 7, 0.5, 4), lift: 2.6 }, { t0: 0.92, t1: 1.2, to: L0, lift: 2.2 }] },
    R: { start: R0, moves: [{ t0: H - 0.06, t1: H + 0.04, to: { ...R0, pitch: 18 } }, { t0: 0.94, t1: 1.16, to: R0 }] },
  });
}
/** The warning: the blade glinting pink, from as they raise it to just after it crosses. */
function slashGlint(t: number): number {
  if (t < 0.08 || t > H + 0.2) return 0;
  return t < FH_SLASH.warn[0] ? (t - 0.08) / (FH_SLASH.warn[0] - 0.08) : t <= H ? 1 : 1 - (t - H) / 0.2;
}
const slashJaw = (t: number): number => (t < 0.12 ? 0.45 + 2 * t : t < H + 0.2 ? 1 : 1 - 0.5 * Math.min(1, (t - H - 0.2) / 0.5));

// ---------------------------------------------------------------------------------------------
// STRUCK

function fieldReel(): Motion {
  return {
    keys: [
      { at: 0, pose: {} },
      { at: 0.06, pose: { px: -2.6, pz: R.pz + 0.4, pitch: -2, bend: -4, faceUp: R.faceUp + 26, faceTilt: R.faceTilt + 10, lhx: 0.5, lhy: 5, lhz: -17, rhx: 1.4, rhz: -17.5, wEl: (R.wEl as number) + 12, out: 0.1 }, ease: 'out' },
      { at: 0.18, pose: { px: -1.2, pitch: 5, bend: 6, faceUp: R.faceUp + 8 }, ease: 'io' },
      { at: 0.4, pose: {}, ease: 'io' },
    ],
  };
}
const reelJaw = (t: number): number => (t < 0.25 ? 1 : 0.45);

// ---------------------------------------------------------------------------------------------
// THE HUSH LEAVES THEM

export const FH_DIES = { long: 2.2, gasp: 0.3, drop: 0.34, knees: 0.85, down: 1.85 } as const;
const DIE_FEET = ((): Record<'L' | 'R', Plant> => ({ L: plantBy(L0, R0.at[0] - L0.at[0] + 3, 0), R: R0 }))();
const TUCK = 56;
const KNEE_DOWN = B.legR[1] * 1.3;
const kneeling = (lean: number, body: P): P => kneelSettle(B, R, { ...kneelHips(B, R, DIE_FEET, TUCK, KNEE_DOWN, lean), ...body }, DIE_FEET, TUCK, KNEE_DOWN);
const HANG = -(B.upperArm + B.foreArm) * 0.9;
const HANGING: P = { lhIn: 0, lhx: 3, lhy: 8, lhz: HANG + 4, le: -10, rhIn: 0, rhx: 3, rhy: -8, rhz: HANG + 4, re: 10 };
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
function fieldDying(): Motion {
  return {
    keys: [
      { at: 0, pose: {} },
      { at: 0.08, pose: { px: -2.4, pz: R.pz, pitch: -3, bend: -5, faceUp: R.faceUp + 20, out: 0.15 }, ease: 'out' },
      { at: FH_DIES.gasp, pose: { px: -2.2, pz: R.pz + 0.8, pitch: -9, bend: -15, faceUp: 42, faceTilt: 0, faceTurn: 0, lhIn: 1, lhx: -1, lhy: 6.5, lhz: -16, rhIn: 1, rhx: -1, rhy: -6.5, rhz: -16, out: 0.45 }, ease: 'out' },
      { at: 0.5, pose: { px: -2.0, pz: R.pz + 0.5, pitch: -8, bend: -13, faceUp: 38, faceTilt: 4, lhIn: 1, lhx: -0.6, lhy: 6, lhz: -17, rhIn: 1, rhx: -0.6, rhy: -6, rhz: -17, out: 0.85 }, ease: 'io' },
      { at: 0.66, pose: { px: -0.6, pz: R.pz - 5, pitch: 2, bend: 2, faceUp: 14, lk: 26, rk: -26, ...HANGING, out: 1 }, ease: 'in' },
      { at: FH_DIES.knees, pose: { ...ON_KNEES, out: 1 }, ease: 'out' },
      { at: 1.05, pose: { ...ON_KNEES, pz: (ON_KNEES.pz as number) + 0.6, pitch: -2, roll: -3, faceUp: 10, out: 1 }, ease: 'io' },
      { at: 1.3, pose: { ...ON_KNEES, pitch: 8, roll: 4, faceUp: -6, out: 1 }, ease: 'io' },
      { at: 1.5, pose: { ...FOLD, out: 1 }, ease: 'in' },
      { at: 1.66, pose: { ...SLUMP, out: 1 }, ease: 'lin' },
      { at: FH_DIES.down, pose: PRONE, ease: 'out' },
      { at: FH_DIES.long, pose: PRONE, ease: 'io' },
    ],
  };
}
function fieldDyingFeet(): (t: number) => P {
  const F = DIE_FEET;
  return footwork(B, {
    L: { start: L0, moves: [{ t0: 0.04, t1: 0.26, to: F.L, lift: 2.4 }, { t0: 0.5, t1: 0.82, to: { ...F.L, pitch: TUCK } }] },
    R: { start: F.R, moves: [{ t0: 0.5, t1: 0.82, to: { ...F.R, pitch: TUCK } }] },
  });
}
const dieJaw = (t: number): number => (t < 0.1 ? 0.6 : t < 1.0 ? 1 : 1 - 0.6 * Math.min(1, (t - 1.0) / 0.6));

// ---------------------------------------------------------------------------------------------
// THEM, AS THE GAME HOLDS A MONSTER

function fieldMob(who: FieldhandWho): Mob {
  const paint = fieldPainter(who, { dropped: (m: Moment) => !!m.dying && m.t >= FH_DIES.drop });
  const mv = (name: string, motion: Motion, more: Partial<MobMove> = {}): MobMove => ({ name, motion, rest: R, ...more });
  return {
    id: `field-${who}`,
    name: who === 'reaper' ? 'A Hushed reaper' : 'A Hushed gleaner',
    size: "small: the knight's height",
    build: B,
    stand: mv('The Hushed reap at nothing', fieldStand(), { jaw: fieldJaw }),
    attack: mv('The sickle slash', fieldSlash(), { feet: fieldSlashFeet(), glint: slashGlint, jaw: slashJaw, trail: (s: Skeleton) => { const k = sickleOf(s); return [k.mid, k.tip]; }, trailSpan: 2.2 }),
    idleFrames: 30,
    idleFps: 10,
    walk: mv('The Hushed shuffle', fieldWalk(), { period: FH_WALK.frames / FH_WALK.fps, ground: FH_PACE * TILE3, jaw: walkJaw }),
    walkFrames: FH_WALK.frames,
    walkFps: FH_WALK.fps,
    pace: FH_PACE,
    reel: mv('The Hushed are struck', fieldReel(), { jaw: reelJaw, glint: (t) => (t < 0.3 ? 1 - t / 0.3 : 0) }),
    reelTime: 0.4,
    hit: H,
    warn: FH_SLASH.warn[1] - FH_SLASH.warn[0],
    dieTime: FH_DIES.long,
    dying: mv('The Hush leaves them', fieldDying(), { feet: fieldDyingFeet(), jaw: dieJaw }),
    aura: { x: FH_CANVAS.ax, y: FH_CANVAS.ay - 40, r: 34, color: '#9890b4', a: 0.06 },
    shadow: 11,
    canvas: FH_CANVAS,
    trueBack: true,
    bits: paint.bits,
    grains: paint.grains,
    // (the sickle drops from the hand and falls clear to their right)
    fall(piece) {
      if (piece === 'sickle') return { from: FH_DIES.drop, to: [-6, -22], spin: 70, lay: 'axis', hop: 1.4 };
      return null;
    },
  };
}
export const FIELD_REAPER = fieldMob('reaper');
export const FIELD_GLEANER = fieldMob('gleaner');
export const FIELD_ALL: readonly Mob[] = [FIELD_REAPER, FIELD_GLEANER];
export function makeFieldArt3(mob: Mob = FIELD_REAPER, pace = mob.pace): ActorArt {
  return { front: mobSet(mob, 'front', pace), back: mobSet(mob, 'back', pace) };
}

// ---------------------------------------------------------------------------------------------
// THEM AS THE CHECKS SEE THEM (art/boss_checks.ts)

const len3 = (v: V3): number => Math.hypot(v[0], v[1], v[2]);
export function fieldSolids(s: Skeleton): { limbs: CheckLimb[]; lumps: CheckLump[] } {
  const [rH, rK, rA] = B.legR;
  const [r0, r1] = B.armR;
  const limbs: CheckLimb[] = [];
  for (const side of ['L', 'R'] as const) {
    const L = side === 'L';
    limbs.push(
      { name: `leg${side}`, a: L ? s.hipL : s.hipR, b: L ? s.kneeL : s.kneeR, r: rH * 1.08 },
      { name: `shin${side}`, a: L ? s.kneeL : s.kneeR, b: L ? s.ankleL : s.ankleR, r: Math.max(rK, rA) * 1.1 },
      { name: `foot${side}`, a: add(L ? s.heelL : s.heelR, [0, 0, 1.6]), b: add(L ? s.toeL : s.toeR, [0, 0, 1.6]), r: 1.9 },
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
function sickleThings(s: Skeleton): CheckThing[] {
  const k = sickleOf(s);
  return [
    { name: 'sickle handle', pts: [k.butt, lerp3(k.butt, k.top, 0.5), k.top], r: 0.7, may: ['foreR'] },
    { name: 'sickle blade', pts: k.blade, r: 0.6, may: [] },
  ];
}
export const FH_SHAPE: BossShape = {
  body: fieldSolids,
  // (what they strike with: the sickle's blade, while it is theirs)
  tip: (move, t, s) => (move === 'dying' && t >= FH_DIES.drop ? null : sickleOf(s).mid),
  things: (move, t, s) => (move === 'dying' && t >= FH_DIES.drop ? [] : sickleThings(s)),
};
