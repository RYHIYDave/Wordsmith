// THE SILENT ORDER'S SCRIBES: THEIR MOVES (the art chat for floors 11 to 15, 18 Oct 2026). A MOCK-UP: NOT IN THE GAME,
// behind SCRIBES_ON (art/scribes.ts, off). Their look and brief are art/scribes.ts; what their ink does to the floor,
// art/scribe_shots.ts.
//
// Made on his word of 21:24 Pacific, 18 Oct: “Hey go without my say so.  If something is shit I’ll get it to it but
// you’re doing a great jobs. At least for 11-15”. The brief is this chat's (art/scribes.ts), sent him with the films.
//
// THEIR MOVES:
//   STANDING (art/scribes.ts): stooped over the ledger on the left arm, writing in it, the quill scratching along a
//     line at a time, the head following; then the head lifting and cocking, listening; writing again.
//   THE GLIDE: short quick steps hidden under the habit, the body barely rising, so that they seem to slide over the
//     flags; the hem swaying and dragging; the ledger held, the quill hand still.
//   THE INK FLICK (their blow, from afar): the quill dipped into the inkhorn at the hip; then drawn back up high
//     over the right shoulder, the body wound round to the right and leaning back, the masked face turned on the
//     hero, the nib glowing pink and spitting (THE WARNING), held shaking; then, hips first, the arm whipped over and
//     down, the quill flicked at the hero: the ink flies (art/scribe_shots.ts) as the quill points at where it will
//     land; carried through down across the body; and back to the page.
//   STRUCK: jolted back, the ledger clutched to the chest, the quill hand flung up.
//   THE MASK SPLITS, THE PAGES FLY (their death): rocked back; a crack runs down the blank mask, and it splits and
//     falls away in two halves; the ledger bursts and its pages tear loose and fly up and away, fluttering (the
//     stolen words going free); the quill drops; their knees buckle and they sit down hard, and topple back to lie
//     on the floor, a drained face to the sky, arms flung out.
//
// By his rulebook: every move through every check the bosses have (art/boss_checks.ts), from in front and behind.
//   test: tsx --test tests/scribes.test.ts

import { footwork, plantBy, plantOf } from './bosses3';
import type { BossShape, CheckLimb, CheckLump, CheckThing } from './boss_checks';
import type { ActorArt } from './actor_types';
import { QUILL, SCRIBE_BODY, SCRIBE_CANVAS, SCRIBE_REST, quillOf, scribePainter, scribeStand } from './scribes';
import { TILE3, mobSet } from './new_mobs3';
import type { Mob, MobMove } from './new_mobs3';
import { add, elbowFor, lerp3, mul, norm, solve, sub } from './skeleton';
import type { Bones, Key3, Motion, Posed, Skeleton, V3 } from './skeleton';

type P = Partial<Bones>;
const B = SCRIBE_BODY;
const R = SCRIBE_REST;
const L0 = plantOf(B, 'L', {}, R);
const R0 = plantOf(B, 'R', {}, R);

/** Their elbows pointed as nearly toward these ways as their arms let them (the figure's own axes). */
function elbowsTo(pose: P, wantL: V3 | null, wantR: V3 | null): P {
  const q = { ...R, ...pose } as Posed;
  const le = wantL ? elbowFor(B, q, true, norm(wantL)) : q.le;
  const re = wantR ? elbowFor(B, { ...q, le } as Posed, false, norm(wantR)) : q.re;
  return { ...pose, le, re };
}
/** The quill pointing `az`, `el` (degrees: its nib to its tip). */
const quillWay = (az: number, el: number): P => ({ wAz: az, wEl: el });

// ---------------------------------------------------------------------------------------------
// THE GLIDE

export const SC_PACE = 1.0;
export const SC_WALK = { frames: 10, fps: 10 } as const;
function stepFoot(k: number, n: number, step: number, lift: number): [number, number, number] {
  const half = n / 2;
  if (k <= half) return [step * (half / 2 - k), 0, 0];
  const u = (k - half) / half;
  const g = u * u * (3 - 2 * u);
  return [-step * (half / 2) + step * half * g, lift * Math.sin(Math.PI * u), 8 * Math.sin(Math.PI * u) * (1 - u) - 3 * Math.sin(Math.PI * u) * u];
}
function scribeGlide(): Motion {
  const n = SC_WALK.frames;
  const d = (SC_PACE * TILE3) / SC_WALK.fps;
  const keys: Key3[] = [];
  for (let i = 0; i <= n; i++) {
    const j = i % n;
    const a = (j / n) * Math.PI * 2;
    const [lx, lz, lp] = stepFoot(j, n, d, 1.5);
    const [rx, rz, rp] = stepFoot((j + n / 2) % n, n, d, 1.5);
    const sag = Math.abs(Math.sin(a));
    keys.push({
      at: i / SC_WALK.fps,
      ease: 'lin',
      pose: {
        pz: R.pz - 0.35 * sag, py: 0.5 * Math.sin(a), roll: R.roll + 1.2 * Math.sin(a), yaw: 2 * Math.cos(a),
        pitch: R.pitch + 3, bend: R.bend - 2, faceUp: R.faceUp + 8, faceTilt: R.faceTilt + 3 * Math.sin(a), faceTurn: R.faceTurn,
        lfx: lx, lfz: lz, lfp: lp, lfy: R.lfy, lft: R.lft,
        rfx: rx, rfz: rz, rfp: rp, rfy: R.rfy, rft: R.rft,
        rhx: R.rhx - 1, rhz: R.rhz + 0.5 * sag, lhz: R.lhz + 0.3 * sag,
      },
    });
  }
  return { keys, loop: 0 };
}

// ---------------------------------------------------------------------------------------------
// THE INK FLICK

/** Their blow: how long; when the ink leaves the quill (a frame of the game's thirty a second); when the warning is held from and to. */
export const SC_FLICK = { long: 1.36, hit: 19 / 30, warn: [0.32, 0.5] } as const;
/** The quill dipped into the inkhorn at the right hip. */
const DIP: P = elbowsTo({ pitch: 12, bend: 18, yaw: -6, twist: -8, faceUp: -24, faceTurn: -14, rhIn: 1, rhx: 2.5, rhy: -4.5, rhz: -21, ...quillWay(-20, -78) }, null, [-0.6, -0.6, -0.4]);
/** DRAWN BACK (the warning): the quill up over the right shoulder, pointing back, the body wound round to the right and leaning back, the face turned on the hero. */
const DRAWN: P = elbowsTo({ px: -1.6, pz: R.pz + 0.4, pitch: -4, bend: -2, yaw: -14, twist: -20, side: 3, roll: -1, faceUp: 2, faceTilt: 0, faceTurn: 20, rhIn: 1, rhx: -3.5, rhy: -6, rhz: 9, ...quillWay(-160, 28), lk: 8, rk: -10 }, null, [0.1, -0.7, 0.7]);
const trembling = (k: number): P => ({ ...DRAWN, rhz: (DRAWN.rhz as number) + (k % 2 ? 0.7 : -0.3), rhx: (DRAWN.rhx as number) + (k % 2 ? -0.4 : 0.2) });
/** The drive: the hips turning and coming forward, the arm still back (hips first). */
const DRIVE: P = elbowsTo({ ...DRAWN, px: 1.6, pz: R.pz - 0.3, pitch: 6, bend: 4, yaw: 4, twist: -28, side: 1, faceUp: 0, faceTurn: 4, rhx: -2.5, rhy: -6.5, rhz: 10, ...quillWay(-150, 40) }, null, [0.1, -0.7, 0.7]);
/** Over the top: the arm whipping over, the quill upright. */
const OVER: P = elbowsTo({ px: 2.6, pz: R.pz - 0.6, pitch: 10, bend: 6, yaw: 10, twist: -8, side: 0, roll: 0, faceUp: -4, faceTurn: 2, rhIn: 1, rhx: 6, rhy: -4.5, rhz: 9, ...quillWay(-30, 80), lk: 12, rk: -8 }, null, [0.2, -0.8, 0.5]);
/** THE FLICK: the arm out before them and down, the quill pointing at where the ink will land. */
const FLICK: P = elbowsTo({ px: 3.6, pz: R.pz - 1.2, pitch: 18, bend: 12, yaw: 14, twist: 4, side: -1, roll: 1, faceUp: -10, faceTurn: -2, rhIn: 1, rhx: 15, rhy: -4, rhz: -5, ...quillWay(4, -18), lk: 16, rk: -6 }, null, [-0.2, -0.9, 0.2]);
/** Carried through, down across the body. */
const THROUGH: P = elbowsTo({ px: 3.2, pz: R.pz - 1.4, pitch: 22, bend: 16, yaw: 18, twist: 12, side: -2, roll: 1, faceUp: -16, faceTurn: -6, rhIn: 1, rhx: 13, rhy: 3, rhz: -14, ...quillWay(40, -42), lk: 18, rk: -6 }, null, [-0.3, -0.9, -0.2]);
function scribeFlick(): Motion {
  const H = SC_FLICK.hit;
  return {
    hit: H,
    keys: [
      { at: 0, pose: {} },
      { at: 0.14, pose: DIP, ease: 'io' },
      { at: 0.32, pose: DRAWN, ease: 'out' },
      { at: 0.37, pose: trembling(1), ease: 'io' },
      { at: 0.42, pose: trembling(2), ease: 'io' },
      { at: 0.46, pose: trembling(3), ease: 'io' },
      { at: SC_FLICK.warn[1], pose: trembling(4), ease: 'io' },
      { at: H - 0.1, pose: DRIVE, ease: 'in' },
      { at: H - 0.05, pose: OVER, ease: 'lin' },
      { at: H, pose: FLICK, ease: 'lin' },
      { at: H + 0.12, pose: THROUGH, ease: 'out' },
      { at: 1.02, pose: { ...THROUGH, pitch: 14, bend: 14, yaw: 6, twist: 4, rhIn: 1, rhx: 11, rhy: -1, rhz: -14, faceUp: -18 }, ease: 'io' },
      { at: SC_FLICK.long, pose: {}, ease: 'io' },
    ],
  };
}
function scribeFlickFeet(): (t: number) => P {
  const H = SC_FLICK.hit;
  return footwork(B, {
    L: { start: L0, moves: [{ t0: H - 0.14, t1: H - 0.02, to: plantBy(L0, 5, 0.5, 6), lift: 2.2 }, { t0: 1.02, t1: 1.28, to: L0, lift: 1.8 }] },
    R: { start: R0, moves: [{ t0: 0.16, t1: 0.3, to: plantBy(R0, -1.5, -0.6, -12), lift: 1.6 }, { t0: 1.0, t1: 1.24, to: R0, lift: 1.6 }] },
  });
}
/** The nib glowing pink and spitting as it is drawn back (the warning), out as the ink leaves it. */
function flickGlint(t: number): number {
  const H = SC_FLICK.hit;
  if (t < 0.16 || t > H + 0.08) return 0;
  return t < 0.32 ? (t - 0.16) / 0.16 : t <= H ? 1 : 1 - (t - H) / 0.08;
}

// ---------------------------------------------------------------------------------------------
// STRUCK

function scribeReel(): Motion {
  return {
    keys: [
      { at: 0, pose: {} },
      { at: 0.06, pose: { px: -2.2, pz: R.pz + 0.4, pitch: -3, bend: -4, faceUp: R.faceUp + 26, faceTilt: R.faceTilt + 10, lhx: 6, lhz: -12, rhIn: 1, rhx: 4, rhy: -7, rhz: -8, out: 0.1 }, ease: 'out' },
      { at: 0.16, pose: { px: -1.0, pitch: 4, bend: 10, faceUp: R.faceUp + 8 }, ease: 'io' },
      { at: 0.35, pose: {}, ease: 'io' },
    ],
  };
}

// ---------------------------------------------------------------------------------------------
// THE MASK SPLITS, THE PAGES FLY

export const SC_DIES = { long: 2.4, crack: [0.08, 0.3], mask: 0.32, quill: 0.36, sit: 1.0, down: 1.56 } as const;
const HIP_H = B.ankle + B.shank + B.thigh;
/** Sat down hard: the pelvis just off the floor, leaning back, the knees up, the feet out before them on their heels. */
const SIT_FEET = { L: plantBy(L0, 9, 1.0, 6, { on: 'heel', pitch: -24 }), R: plantBy(R0, 7, -1.0, -6, { on: 'heel', pitch: -24 }) };
/** Their arms flung out on the floor where their body puts them: each hand `back` behind its shoulder and `out` to its side, on the floor. */
function flung(body: P, back: number, out: number, z = 2.4): P {
  const s = solve(B, { ...R, ...body, lhIn: 0, rhIn: 0 } as Posed);
  const at = (sh: V3, side: number): V3 => [sh[0] - back, sh[1] + side * out, z];
  const Lh = at(s.shoulderL, 1);
  const Rh = at(s.shoulderR, -1);
  const q = { ...R, ...body, lhIn: 2, lhx: Lh[0], lhy: Lh[1], lhz: Lh[2], rhIn: 2, rhx: Rh[0], rhy: Rh[1], rhz: Rh[2] } as Posed;
  const le = elbowFor(B, q, true, norm([-0.3, 1, 0.3]));
  const re = elbowFor(B, { ...q, le } as Posed, false, norm([-0.3, -1, 0.3]));
  return { ...body, lhIn: 2, lhx: Lh[0], lhy: Lh[1], lhz: Lh[2], rhIn: 2, rhx: Rh[0], rhy: Rh[1], rhz: Rh[2], le, re };
}
const SAT: P = { px: -6, pz: -HIP_H + 6.2, pitch: -22, bend: -6, yaw: 2, roll: 2, twist: 0, side: 0, faceUp: 14, faceTilt: 6, faceTurn: -6, lk: 12, rk: -12, lhIn: 0, lhx: 6, lhy: 4, lhz: -12, le: -16, rhIn: 1, rhx: -2, rhy: -8, rhz: -16, re: 20, out: 1 };
/** Lying on their back, the knees still up, the feet where they sat; the face to the sky, the arms flung out on the floor. */
const LYING: P = flung({ px: -8, pz: -HIP_H + 7.4, pitch: -84, bend: -4, yaw: 4, roll: 3, twist: 0, side: 1, faceUp: 72, faceTilt: 10, faceTurn: -18, lk: 14, rk: -14, out: 1 }, -2, 12, 2.8);
function scribeDying(): Motion {
  return {
    keys: [
      { at: 0, pose: {} },
      { at: 0.07, pose: { px: -2.0, pz: R.pz + 0.3, pitch: -4, bend: -6, faceUp: R.faceUp + 26, out: 0.15 }, ease: 'out' },
      // the mask splitting: the head thrown back, the arms flung up and out, the ledger bursting open
      { at: SC_DIES.mask, pose: { px: -2.6, pz: R.pz + 0.8, pitch: -10, bend: -14, faceUp: 32, faceTilt: 4, faceTurn: -10, lhIn: 1, lhx: 4, lhy: 10, lhz: -6, rhIn: 1, rhx: 2, rhy: -11, rhz: -2, out: 0.5 }, ease: 'out' },
      { at: 0.56, pose: { px: -3.0, pz: R.pz - 1.0, pitch: -12, bend: -12, faceUp: 26, faceTilt: 8, faceTurn: -8, lhIn: 1, lhx: 3, lhy: 9, lhz: -9, rhIn: 1, rhx: 1, rhy: -10, rhz: -8, lk: 8, rk: -8, out: 0.9 }, ease: 'io' },
      // the knees buckle: down hard onto the floor, sat, leaning back
      { at: 0.8, pose: { px: -4.6, pz: -HIP_H * 0.45, pitch: -12, bend: -8, faceUp: 18, lk: 12, rk: -12, lhIn: 0, lhx: 6, lhy: 5, lhz: -12, le: -16, rhIn: 1, rhx: 0, rhy: -9, rhz: -14, re: 20, out: 1 }, ease: 'in' },
      { at: SC_DIES.sit, pose: SAT, ease: 'out' },
      { at: 1.2, pose: { ...SAT, pitch: -30, bend: -10, faceUp: 22 }, ease: 'io' },
      // and topple back to lie on the floor, the face to the sky
      { at: 1.42, pose: flung({ ...SAT, px: -7, pz: -HIP_H + 6.0, pitch: -62, bend: -8, faceUp: 50, lk: 14, rk: -14 }, 2, 9, 6), ease: 'in' },
      { at: SC_DIES.down, pose: LYING, ease: 'out' },
      { at: SC_DIES.long, pose: LYING, ease: 'io' },
    ],
  };
}
function scribeDyingFeet(): (t: number) => P {
  return footwork(B, {
    L: { start: L0, moves: [{ t0: 0.04, t1: 0.22, to: plantBy(L0, -2.0, 0.6, 4), lift: 1.6 }, { t0: 0.42, t1: 0.66, to: SIT_FEET.L, lift: 3.6 }] },
    R: { start: R0, moves: [{ t0: 0.46, t1: 0.7, to: SIT_FEET.R, lift: 2.6 }] },
  });
}
/** How far the mask has cracked: a crack running down it, then split. */
const dieCrack = (t: number): number => Math.max(0, Math.min(1, (t - SC_DIES.crack[0]) / (SC_DIES.crack[1] - SC_DIES.crack[0])));

// ---------------------------------------------------------------------------------------------
// THEM, AS THE GAME HOLDS A MONSTER

function scribeMob(): Mob {
  const paint = scribePainter({ crack: dieCrack });
  const mv = (name: string, motion: Motion, more: Partial<MobMove> = {}): MobMove => ({ name, motion, rest: R, ...more });
  return {
    id: 'order-scribe',
    name: 'A scribe of the Silent Order',
    size: "small: the knight's height",
    build: B,
    stand: mv('The scribe writes', scribeStand()),
    attack: mv('The ink flick', scribeFlick(), { feet: scribeFlickFeet(), glint: flickGlint, trail: (s) => [quillOf(s).nib], trailSpan: 1.6 }),
    idleFrames: 30,
    idleFps: 10,
    walk: mv('The scribe glides', scribeGlide(), { period: SC_WALK.frames / SC_WALK.fps, ground: SC_PACE * TILE3 }),
    walkFrames: SC_WALK.frames,
    walkFps: SC_WALK.fps,
    pace: SC_PACE,
    reel: mv('The scribe is struck', scribeReel(), { glint: () => 0 }),
    reelTime: 0.35,
    hit: SC_FLICK.hit,
    warn: SC_FLICK.warn[1] - SC_FLICK.warn[0],
    dieTime: SC_DIES.long,
    dying: mv('The mask splits, the pages fly', scribeDying(), { feet: scribeDyingFeet() }),
    aura: { x: SCRIBE_CANVAS.ax, y: SCRIBE_CANVAS.ay - 40, r: 34, color: '#9890b4', a: 0.06 },
    shadow: 10,
    canvas: SCRIBE_CANVAS,
    trueBack: true,
    bits: paint.bits,
    // (the mask's halves fall to either side of them, the quill before them)
    fall(piece) {
      if (piece === 'maskL') return { from: SC_DIES.mask, to: [4, 27], spin: 120, lay: 'flat', hop: 1.2 };
      if (piece === 'maskR') return { from: SC_DIES.mask + 0.04, to: [2, -27], spin: -140, lay: 'flat', hop: 1.4 };
      if (piece === 'quill') return { from: SC_DIES.quill, to: [2, -22], spin: 50, lay: 'axis', hop: 0.8 };
      return null;
    },
  };
}
export const SCRIBE = scribeMob();
export const SCRIBES_ALL: readonly Mob[] = [SCRIBE];
export function makeScribeArt3(mob: Mob = SCRIBE, pace = mob.pace): ActorArt {
  return { front: mobSet(mob, 'front', pace), back: mobSet(mob, 'back', pace) };
}

// ---------------------------------------------------------------------------------------------
// THEM AS THE CHECKS SEE THEM

const len3 = (v: V3): number => Math.hypot(v[0], v[1], v[2]);
export function scribeSolids(s: Skeleton): { limbs: CheckLimb[]; lumps: CheckLump[] } {
  const [rH, rK, rA] = B.legR;
  const [r0, r1] = B.armR;
  const limbs: CheckLimb[] = [];
  for (const side of ['L', 'R'] as const) {
    const L = side === 'L';
    limbs.push(
      { name: `leg${side}`, a: L ? s.hipL : s.hipR, b: L ? s.kneeL : s.kneeR, r: rH * 1.08 },
      { name: `shin${side}`, a: L ? s.kneeL : s.kneeR, b: L ? s.ankleL : s.ankleR, r: Math.max(rK, rA) * 1.05 },
      { name: `foot${side}`, a: add(L ? s.heelL : s.heelR, [0, 0, 1.3]), b: add(L ? s.toeL : s.toeR, [0, 0, 1.3]), r: 1.5 },
      { name: `upper${side}`, a: L ? s.shoulderL : s.shoulderR, b: L ? s.elbowL : s.elbowR, r: r0 * 1.25 },
      { name: `fore${side}`, a: L ? s.elbowL : s.elbowR, b: L ? s.handL : s.handR, r: r1 * 1.3 },
    );
  }
  limbs.push({ name: 'neck', a: s.neck, b: lerp3(s.neck, s.head, 0.5), r: 2.0 });
  const waistC = add(s.pelvis, mul(s.hips[2], B.waist * 0.6));
  const lumps: CheckLump[] = [
    { name: 'head', c: s.head, rot: s.face, h: [B.headR[0] * 1.15, B.headR[1] * 1.2, B.headR[2] * 1.1] },
    { name: 'chest', c: lerp3(s.ribs, s.neck, 0.3), rot: s.chest, h: [B.ribDeep + 1.8, B.ribHalf + 2.0, len3(sub(s.neck, s.ribs)) * 0.55] },
    { name: 'belly', c: lerp3(waistC, s.ribs, 0.45), rot: s.belly, h: [B.waistDeep + 1.6, B.waistHalf + 1.6, Math.max(3, len3(sub(s.ribs, waistC)) * 0.6)] },
    { name: 'hips', c: add(s.pelvis, mul(s.hips[2], B.waist * 0.2)), rot: s.hips, h: [B.pelvisDeep + 2.4, B.pelvisHalf + 2.6, B.waist * 0.75] },
  ];
  return { limbs, lumps };
}
function quillThings(s: Skeleton): CheckThing[] {
  const q = quillOf(s);
  const pts: V3[] = [];
  for (let k = 0; k <= QUILL.long; k += 3) pts.push(add(q.nib, mul(q.way, k)));
  return [{ name: 'quill', pts, r: 0.7, may: ['foreR'] }];
}
export const SC_SHAPE: BossShape = {
  body: scribeSolids,
  // (what they strike with: the quill's nib, while it is theirs)
  tip: (move, t, s) => (move === 'dying' && t >= SC_DIES.quill ? null : quillOf(s).nib),
  things: (move, t, s) => (move === 'dying' && t >= SC_DIES.quill ? [] : quillThings(s)),
};
