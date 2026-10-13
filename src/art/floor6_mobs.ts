// FLOOR 6, THE QUARRY: ITS MOBS, a mock-up (nothing of the game imports this file; `FLOOR6_MOBS_ON` is off).
//
// The planning chat's mobs for the Quarry, with his yes (12 Oct, by 18:16: "Golems in the quarry" his own;
// the rubblings proposed and kept): the QUARRY GOLEM (medium) and the RUBBLING (tiny). His brief, asked as
// his art rulebook's questions for a new character (13 Oct, by 15:05): the golem, "Cut blocks bound in
// chains (Recommended)" (quarry blocks stacked into a body, lashed with the cult's iron chains, its skull
// mark burning on its chest block), dying "Bursts apart" (the blocks are flung outward); the rubbling, "A
// scuttling heap of chips (Recommended)" (a little mound of stone chips on stubby stone legs, a pink spark
// glowing inside), dying "Pops into grit (Recommended)" (its spark goes out and it bursts into a puff of
// grit and chips).
//
// THE GOLEM is built as the game's monsters are, on the heroes' bones (a `Mob` of art/new_mobs3.ts), its
// body the quarry's cut blocks (art/act1_stone.ts, as the Unfinished's raw side), the chains of the cult
// round it, the enemy's pink edge round it; what glows on it is the cult's fire only. THE RUBBLING is no
// body of bones: a heap on legs, painted from its own solids frame by frame, in the same painter.

import type { Px, Sprite } from '../engine/px';
import type { ActorArt, AnimSet, Clip } from './actor_types';
import { between, feetFor, plantBy, smooth01 } from './act1_feet';
import { HOLE, block, limbFrame } from './act1_stone';
import type { FaceSkin } from './act1_stone';
import { shriekAt } from './floor5';
import { hash, lazyFrames, toSprite } from './kit';
import type { Painted, Ramp } from './kit';
import { ENEMY_RIM, FLAME } from './mkit';
import { TILE3, canvasOf, deathOfMob, paintBits, paintMob, sphere } from './new_mobs3';
import type { Bit, Fall, Mob, MobCanvas, MobMove, Moment, Put } from './new_mobs3';
import { stage } from './skin';
import type { GameView, Stage } from './skin';
import { add, buildOf, cross, lerp3, mul, norm, standing, sub } from './skeleton';
import type { Bones, Build, Key3, Motion, V3 } from './skeleton';

/** THE SWITCH, OFF: nothing of the game reads this file. */
export const FLOOR6_MOBS_ON = { on: false };

type P = Partial<Bones>;
const clamp01 = (v: number): number => Math.max(0, Math.min(1, v));
const fr = (t: number): number => t - Math.floor(t);

// =============================================================================================
// THE QUARRY GOLEM (medium)

/** Its height (the knight's bones are 58): half as tall again as the knight, a heavy among the small ones. */
export const QG_TALL = 88;
/** (its moves were first set for a golem 78 tall: their reaches grow with it) */
const K = QG_TALL / 78;
/** Its body: squat and broad; limbs as thick as a man. */
export const QG_BODY: Build = buildOf(QG_TALL, 0.85, { shoulders: 1.75, chest: 1.6, depth: 1.45, waist: 1.3, hips: 1.35, legs: 0.7, arms: 1.22, trunk: 1.0, limbs: 2.4, pad: 4 });
const B = QG_BODY;
const { footOn, plantOf, footwork } = feetFor(B);

/** The cut stone of its blocks: dressed square by the masons, the tooling on its faces (a figure's ramp). */
export const CUT: Ramp = ['#4a4256', '#4a4256', '#a39686', '#d2c6b3', '#d2c6b3'];
/** The cult's chains: grey iron, bright where the light catches a link. */
export const CHAIN: Ramp = ['#26222e', '#26222e', '#625e72', '#aaa7b6', '#aaa7b6'];
/** Its canvas: room for it standing, its fists raised over its head, and its blocks flung out round it. */
export const QG_CANVAS: MobCanvas = { w: 340, h: 312, ax: 170, ay: 222 };

/** A face of a cut block: the masons' dressed face, the claw's fine tooling in rows, a chipped arris here and there; `mark`: the cult's skull burning on it. */
function cutFace(seed: number, mark?: (face: number, a: number, b: number) => string | null): FaceSkin {
  return (face, a, b, tone) => {
    const m = mark?.(face, a, b);
    if (m) return m;
    let t = tone;
    if (fr((b + hash(face, seed, 3) * 4) / 3.2) < 0.18 && face < 4) t -= 1; // the tooling, in rows
    if (hash(Math.floor(a / 2), Math.floor(b / 2) * 13 + face, seed) > 0.95) t = Math.min(t, 1); // a chip
    return CUT[Math.max(0, Math.min(4, t))];
  };
}

/** A CHAIN of iron links from `a` to `b`, sagging `sag`, each link a small flat ring turned across the last. */
function chain(put: Put, part: string, piece: string, a: V3, b: V3, sag: number, r = 1.5): void {
  const d = sub(b, a);
  const L = Math.hypot(d[0], d[1], d[2]);
  const n = Math.max(2, Math.round(L / (r * 2.2)));
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    const p = add(add(a, mul(d, t)), [0, 0, -sag * 4 * t * (1 - t)]);
    const along = norm(d, [1, 0, 0]);
    const side = i % 2 ? norm(cross(along, [0, 0, 1]), [0, 1, 0]) : [0, 0, 1] as V3;
    put(part, piece, { k: 'ball', c: p, ax: [mul(along, r * 1.25), mul(side, r * 0.9), mul(norm(cross(along, side)), r * 0.45)], skin: CHAIN });
  }
}
/** A chain round a solid (its middle `c`, two of its half-axes `u` and `v`, out from its faces by `pad`): the links of the half toward the eye. */
function chainRound(put: Put, part: string, piece: string, c: V3, u: V3, v: V3, n: number, r = 1.5): void {
  for (let i = 0; i < n; i++) {
    const th = (i / n) * Math.PI * 2;
    const p = add(c, add(mul(u, Math.cos(th)), mul(v, Math.sin(th))));
    const tan = norm(add(mul(u, -Math.sin(th)), mul(v, Math.cos(th))), [1, 0, 0]);
    const out = norm(add(mul(u, Math.cos(th)), mul(v, Math.sin(th))), [1, 0, 0]);
    const side = i % 2 ? out : norm(cross(tan, out), [0, 0, 1]);
    put(part, piece, { k: 'ball', c: p, ax: [mul(tan, r * 1.25), mul(side, r * 0.9), mul(norm(cross(tan, side)), r * 0.45)], skin: CHAIN, far: true });
  }
}

/** How it stands: hunched, its knees bent under the weight, its long block arms hanging, its fists near the floor. */
const QG_HANG = -(B.upperArm + B.foreArm) * 0.96;
export const QG_REST: Bones = {
  ...standing(B),
  pz: -4, pitch: 3, bend: 5, faceUp: 0,
  lfx: 2, lfy: 4, lft: 14, lk: 16, rfx: -2, rfy: -4, rft: -14, rk: -16,
  lhIn: 0, lhx: 12, lhy: 12, lhz: QG_HANG * 0.8, le: -34,
  rhIn: 0, rhx: 12, rhy: -12, rhz: QG_HANG * 0.8, re: 34,
};

/** THE GOLEM AS SOLIDS: its blocks, the chains round them, the mark burning on its chest block, its eyes. */
function golemBits(st: Stage, m: Moment): Bit[] {
  void st;
  const { s, q } = m;
  const bits: Bit[] = [];
  const put: Put = (part, piece, shape) => {
    bits.push({ part, piece, shape });
  };
  const [cf, cl, cu] = s.chest;
  const lit = 1 - clamp01(q.out);
  const flare = m.glint;
  const frame = Math.floor(m.t * 10);
  // the legs: a block for the thigh, one for the shin, a slab for the foot
  for (const side of ['L', 'R'] as const) {
    const hip = side === 'L' ? s.hipL : s.hipR;
    const knee = side === 'L' ? s.kneeL : s.kneeR;
    const ankle = side === 'L' ? s.ankleL : s.ankleR;
    const heel = side === 'L' ? s.heelL : s.heelR;
    const toe = side === 'L' ? s.toeL : s.toeR;
    const [rH, rK, rA] = B.legR;
    const fwd = norm(sub(toe, heel), [1, 0, 0]);
    const across: V3 = norm([-fwd[1], fwd[0], 0], [0, 1, 0]);
    block(put, `leg${side}`, `thigh${side}`, lerp3(hip, knee, 0.5), limbFrame(hip, knee, fwd), [rH * 0.95, rH * 0.95, Math.hypot(...sub(hip, knee)) * 0.55], cutFace(side === 'L' ? 1 : 2));
    block(put, `leg${side}`, `shin${side}`, lerp3(knee, ankle, 0.5), limbFrame(knee, ankle, fwd), [rK * 0.95, rK * 0.92, Math.hypot(...sub(knee, ankle)) * 0.56], cutFace(side === 'L' ? 3 : 4));
    block(put, `leg${side}`, `foot${side}`, add(lerp3(heel, toe, 0.45), [0, 0, rA * 0.55]), [fwd, across, [0, 0, 1]], [B.ball * 0.9, rA * 1.2, rA * 0.6], cutFace(side === 'L' ? 5 : 6));
    // a chain round the thigh
    const tf = limbFrame(hip, knee, fwd);
    chainRound(put, `legChain${side}`, `thigh${side}`, lerp3(hip, knee, 0.4), mul(tf[0], rH * 1.05), mul(tf[1], rH * 1.05), 12, 1.3);
  }
  // the hips and the belly: two blocks
  block(put, 'hips', 'hips', add(s.pelvis, mul(s.hips[2], B.waist * 0.2)), s.hips, [B.pelvisDeep + 3, B.pelvisHalf + 4, B.waist * 0.9], cutFace(7));
  block(put, 'belly', 'belly', lerp3(s.waist, s.ribs, 0.4), s.belly, [B.waistDeep + 2, B.waistHalf + 3, B.ribs * 0.85], cutFace(8));
  // the chest: the great block, the cult's mark burning on its face
  const cc = add(s.ribs, add(mul(cu, B.chest * 0.45), mul(cf, 0.5)));
  const CH: V3 = [B.ribDeep + 3, B.ribHalf + 5, B.chest * 0.62];
  const mark = (face: number, a: number, b: number): string | null => {
    if (face !== 0) return null;
    const at = (da: number, db: number): ReturnType<typeof shriekAt> => shriekAt(-(a + da) / (CH[1] * 0.68), (b + db + CH[2] * 0.02) / (CH[2] * 0.8));
    const mk = at(0, 0);
    if (mk === 'dark') return '#2a0f22';
    if (mk !== 'bone') return null;
    if (lit < 0.08) return '#2a0f22';
    if (lit < 0.3) return FLAME[0];
    // (burning as the Unfinished's: hot pink at the edge of each stroke, gold at its heart, flickering)
    const edge = at(0.9, 0) !== 'bone' || at(-0.9, 0) !== 'bone' || at(0, 0.9) !== 'bone' || at(0, -0.9) !== 'bone';
    if (edge) return flare > 0.6 ? FLAME[3] : FLAME[2];
    const hot = hash(Math.floor(a), Math.floor(b), frame) > 0.6 - 0.4 * flare;
    return hot ? FLAME[4] : FLAME[3];
  };
  block(put, 'chest', 'chest', cc, s.chest, CH, cutFace(9, mark));
  put('glow', 'glow', { k: 'glow', p: add(cc, mul(cf, CH[0] + 3)), c: FLAME[2], r: 26 + 22 * flare, a: (0.3 + 0.35 * flare) * lit });
  // the chains lashing it: two down its front by the chest's edges and over its shoulders (the mark burning between them), one round its belly
  for (const sd of [1, -1]) {
    const top = add(cc, add(add(mul(cf, CH[0] * 0.2), mul(cl, sd * CH[1] * 0.78)), mul(cu, CH[2] + 1.6)));
    const edge = add(cc, add(add(mul(cf, CH[0] + 1.6), mul(cl, sd * CH[1] * 0.8)), mul(cu, CH[2] * 0.75)));
    const low = add(cc, add(add(mul(cf, CH[0] + 1.6), mul(cl, sd * CH[1] * 0.8)), mul(cu, -CH[2] * 0.95)));
    chain(put, `chestChain${sd > 0 ? 'L' : 'R'}`, 'chest', top, edge, 0, 1.7);
    chain(put, `chestChain${sd > 0 ? 'L' : 'R'}`, 'chest', edge, low, 0, 1.7);
  }
  chainRound(put, 'bellyChain', 'belly', lerp3(s.waist, s.ribs, 0.4), mul(s.belly[0], B.waistDeep + 3.6), mul(s.belly[1], B.waistHalf + 4.6), 26, 1.7);
  // the shoulders: blocks; the right one with its top torn off for a throw (`jaw`), and knitting back
  for (const side of ['L', 'R'] as const) {
    const sh = side === 'L' ? s.shoulderL : s.shoulderR;
    const torn = side === 'R' ? m.jaw ?? 0 : 0;
    const top = B.armR[0] * (1.0 - 0.5 * torn);
    const c = add(sh, mul(cu, B.armR[0] * 0.3 - (B.armR[0] - top)));
    block(put, `shoulder${side}`, `shoulder${side}`, c, s.chest, [B.armR[0] * 1.15, B.armR[0] * 1.15, top], cutFace(side === 'L' ? 10 : 11));
    if (torn > 0.02 && !m.skull) {
      // (the cult's fire knitting it back: a glow at the break, grit drawn up into it)
      const scar = add(c, mul(cu, top));
      put('knit', 'knit', { k: 'glow', p: scar, c: FLAME[2], r: 10 + 8 * torn, a: 0.35 * torn * lit });
      for (let i = 0; i < 6; i++) {
        const k2 = fr(m.t * 2.2 + i / 6);
        const from = add(scar, [(hash(i, 1, 64) - 0.5) * 22 * (1 - k2), (hash(i, 2, 64) - 0.5) * 22 * (1 - k2), -14 * (1 - k2)]);
        put('knitGrit', 'knitGrit', { k: 'mote', p: from, c: i % 2 ? CUT[3] : CUT[2], size: 2 });
      }
    }
  }
  // the chunk torn off it, in its left fist, to be thrown
  if (m.skull) {
    const el = s.elbowL;
    const hand = s.handL;
    const fore = norm(sub(hand, el), [0, 0, -1]);
    const ff = limbFrame(el, hand, cf);
    block(put, 'chunk', 'chunk', chunkIn(hand, fore), ff, CHUNK_H, cutFace(11));
  }
  // the chunk torn away: chips and grit burst off the shoulder
  if (m.charge > 0) {
    const k = m.charge - 0.001;
    const from = add(s.shoulderR, mul(cu, B.armR[0] * 1.2));
    for (let i = 0; i < 12; i++) {
      const a = hash(i, 1, 65) * Math.PI * 2;
      const v = 18 + hash(i, 2, 65) * 30;
      const p: V3 = [from[0] + Math.cos(a) * v * k, from[1] + Math.sin(a) * v * k, from[2] + (30 + 30 * hash(i, 3, 65)) * k - 200 * k * k];
      if (p[2] > 1) put('tear', 'tear', { k: 'mote', p, c: i % 2 ? CUT[3] : CUT[2], size: i % 3 ? 2 : 3 });
    }
  }
  // the arms: blocks, and great square fists; chains round the wrists, a broken length of chain hanging from each
  for (const side of ['L', 'R'] as const) {
    const sh = side === 'L' ? s.shoulderL : s.shoulderR;
    const el = side === 'L' ? s.elbowL : s.elbowR;
    const hand = side === 'L' ? s.handL : s.handR;
    const [r0, r1, r2] = B.armR;
    const fore = norm(sub(hand, el), [0, 0, -1]);
    block(put, `arm${side}`, `upper${side}`, lerp3(sh, el, 0.5), limbFrame(sh, el, cf), [r0 * 0.95, r0 * 0.95, Math.hypot(...sub(sh, el)) * 0.55], cutFace(side === 'L' ? 12 : 13));
    block(put, `fore${side}`, `fore${side}`, lerp3(el, hand, 0.5), limbFrame(el, hand, cf), [r1 * 1.0, r1 * 1.0, Math.hypot(...sub(el, hand)) * 0.55], cutFace(side === 'L' ? 14 : 15));
    block(put, `fist${side}`, `fist${side}`, add(hand, mul(fore, r2 * 1.3)), limbFrame(el, hand, cf), [r2 * 1.5, r2 * 1.5, r2 * 1.4], cutFace(side === 'L' ? 16 : 17));
    const ff = limbFrame(el, hand, cf);
    chainRound(put, `wrist${side}`, `fore${side}`, lerp3(el, hand, 0.8), mul(ff[0], r1 * 1.12), mul(ff[1], r1 * 1.12), 12, 1.2);
    // the broken end hanging from the wrist, swinging after the arm
    const from = add(lerp3(el, hand, 0.8), mul(ff[0], -r1 * 1.1));
    const lag = mul(m.come, -3);
    chain(put, `wristEnd${side}`, `fore${side}`, from, add(add(from, [0, 0, -10]), [lag[0] + Math.sin(m.wind * 6.3 + (side === 'L' ? 0 : 2)) * 1.5, lag[1], 0]), 0, 1.1);
  }
  // the head: a small block sunk between its shoulders, two holes burning
  const face = s.face;
  const hc = s.head;
  const HH: V3 = [B.headR[0] * 1.1, B.headR[1] * 1.2, B.headR[2] * 0.95];
  block(put, 'head', 'head', hc, face, HH, cutFace(18, (f, a, b) => {
    if (f !== 0) return null;
    const eye = Math.abs(Math.abs(a) - HH[1] * 0.42) < 1.5 && Math.abs(b - HH[2] * 0.1) < 1.2;
    if (!eye) return Math.abs(b + HH[2] * 0.55) < 0.6 && Math.abs(a) < HH[1] * 0.6 ? HOLE : null;
    return lit > 0.3 ? (Math.abs(Math.abs(a) - HH[1] * 0.42) < 0.7 ? FLAME[3] : FLAME[2]) : lit > 0.08 ? FLAME[0] : HOLE;
  }));
  if (lit > 0.3) put('eyes', 'eyes', { k: 'glow', p: add(hc, mul(face[0], HH[0] + 1)), c: FLAME[2], r: 9, a: 0.35 * lit });
  // grit, shaken off it (its steps, its blow)
  if (m.rally > 0) {
    const k = m.rally - 0.001;
    for (let i = 0; i < 8; i++) {
      const from = i % 2 ? s.shoulderL : s.shoulderR;
      const p = add(add(from, [(hash(i, 1, 61) - 0.5) * 14, (hash(i, 2, 61) - 0.5) * 14, 0]), [0, 0, -k * k * 140]);
      if (p[2] > 1) put('grit', 'grit', { k: 'mote', p, c: i % 2 ? CUT[2] : CUT[3], size: 2 });
    }
  }
  // its blow landing: chips and dust from where its fists strike the floor
  const at0 = lerp3(s.handL, s.handR, 0.5);
  if (m.since !== undefined && m.since >= 0 && m.since < 0.5 && !m.dying && at0[2] < 22) {
    const k = m.since;
    for (let i = 0; i < 14; i++) {
      const a = hash(i, 3, 62) * Math.PI * 2;
      const v = 30 + hash(i, 4, 62) * 50;
      const up = 50 + hash(i, 5, 62) * 70;
      const p: V3 = [at0[0] + Math.cos(a) * v * k, at0[1] + Math.sin(a) * v * k, Math.max(0, up * k - 300 * k * k)];
      if (p[2] <= 0 && k > 0.2) continue;
      put('chips', 'chips', { k: 'mote', p, c: i % 2 ? CUT[3] : CUT[2], size: i % 3 ? 2 : 3 });
    }
  }
  // its death: the mark white-hot as it swells, and the burst's flash
  if (m.dying && m.t < QG_BURST + 0.15) put('flash', 'flash', { k: 'glow', p: add(cc, mul(cf, CH[0])), c: FLAME[3], r: 20 + 60 * clamp01((m.t - QG_BURST + 0.25) / 0.3), a: 0.5 * clamp01(m.t / QG_BURST) });
  return bits;
}

// --- ITS MOVES ---

/** Its breath: the blocks heave and grind, the chains sway and clink, the mark pulsing. 2 s round. */
function qgStand(): Motion {
  const R = QG_REST;
  return {
    loop: 0,
    keys: [
      { at: 0, pose: {} },
      { at: 0.9, pose: { pz: R.pz + 1.4, bend: R.bend - 2, faceUp: R.faceUp + 3, py: 1.6, roll: -1, lhz: R.lhz + 1.5, rhz: R.rhz + 1.5 }, ease: 'io' },
      { at: 1.2, pose: { pz: R.pz + 0.8, bend: R.bend - 1, faceUp: R.faceUp + 2, py: 1.2, roll: 0.6, faceTurn: 6 }, ease: 'in' },
      { at: 2.0, pose: {}, ease: 'io' },
    ],
  };
}

/** ITS WALK: a heavy plod, twelve frames at eight a second, painted for one tile a second; its bulk dropping onto each foot, grit shaken off. */
const QG_WALK_FRAMES = 12;
const QG_WALK_FPS = 8;
export const QG_PACE = 1.0;
const QG_GROUND = QG_PACE * TILE3;
const QG_STRIDE = QG_GROUND / QG_WALK_FPS;
function qgWalkPose(j: number): P {
  const R = QG_REST;
  const n = QG_WALK_FRAMES;
  const d = QG_STRIDE;
  const foot = (k: number): [number, number, number] => {
    if (k <= 7) return [3.5 * d - d * k, 0, 0];
    const u = (k - 7) / 5;
    const g = u * u * (3 - 2 * u);
    return [-3.5 * d + 7 * d * g, 10 * Math.pow(Math.sin(Math.PI * u), 0.7), 10 * (1 - u) - 8 * u * (1 - u)];
  };
  const a = (j / n) * Math.PI * 2;
  const jolt = [1, 0.6, 0.25, 0, 0, 0.2][j % 6];
  const [rx, rz, rp] = foot(j);
  const [lx, lz, lp] = foot((j + 6) % n);
  return {
    px: 0.5, py: -2.6 * Math.sin(a), pz: R.pz - 1 + 1 * Math.cos(2 * a) - 2.2 * jolt,
    yaw: 5 * Math.cos(a), twist: -4 * Math.cos(a), pitch: R.pitch + 2 + jolt, bend: R.bend + jolt,
    roll: 3 * Math.sin(a), side: 1.2 * Math.sin(a), faceUp: R.faceUp - 3 * jolt, faceTurn: -3 * Math.cos(a),
    rfx: rx, rfz: rz, rfy: R.rfy, rft: R.rft, rfp: rp, rk: -16,
    lfx: lx, lfz: lz, lfy: R.lfy, lft: R.lft, lfp: lp, lk: 16,
    rhx: R.rhx - 6 * Math.cos(a - 0.4), lhx: R.lhx + 6 * Math.cos(a - 0.4), rhz: R.rhz - 2 * jolt, lhz: R.lhz - 2 * jolt,
  };
}
function qgWalk(): Motion {
  const keys: Key3[] = [];
  for (let i = 0; i <= QG_WALK_FRAMES; i++) keys.push({ at: i / QG_WALK_FPS, ease: 'lin', pose: qgWalkPose(i % QG_WALK_FRAMES) });
  return { keys, loop: 0 };
}
const QG_SET_OFF = 0.6;
const QG_HALT = 0.6;
function qgSetOff(): Motion {
  const w0 = qgWalkPose(0);
  return { keys: [{ at: 0, pose: {} }, { at: QG_SET_OFF * 0.45, pose: { ...between({}, w0, 0.3, QG_REST), py: 2, roll: -1.5 }, ease: 'io' }, { at: QG_SET_OFF, pose: w0, ease: 'in' }] };
}
function qgSetOffFeet(): (t: number) => P {
  const R1 = plantOf('R', qgWalkPose(0), QG_REST);
  return footwork({ L: { start: plantOf('L', {}, QG_REST), moves: [] }, R: { start: plantOf('R', {}, QG_REST), moves: [{ t0: 0.18, t1: QG_SET_OFF - 0.02, to: plantBy(R1, QG_GROUND * QG_SET_OFF, 0), lift: 10 }] } }, QG_GROUND);
}
function qgHalt(): Motion {
  const w0 = qgWalkPose(0);
  return { keys: [{ at: 0, pose: w0 }, { at: QG_HALT * 0.6, pose: between(w0, {}, 0.6, QG_REST), ease: 'io' }, { at: QG_HALT * 0.85, pose: { pz: QG_REST.pz - 1.6 }, ease: 'in' }, { at: QG_HALT, pose: {}, ease: 'out' }] };
}
function qgHaltFeet(): (t: number) => P {
  const L0 = plantOf('L', {}, QG_REST);
  return footwork({ L: { start: plantOf('L', qgWalkPose(0), QG_REST), moves: [{ t0: 0.03, t1: QG_HALT * 0.8, to: plantBy(L0, QG_GROUND * QG_HALT * 0.8, 0), lift: 10 }] }, R: { start: plantOf('R', qgWalkPose(0), QG_REST), moves: [] } }, QG_GROUND);
}

/**
 * ITS BLOW, the hammer: both fists raised together high over its head, leaning back, held there (the
 * mark flaring: the warning), then its hips go, its chest comes over, and both fists come down on the
 * floor before it with all its weight; chips and dust; it hauls them up again.
 */
export const QG_HIT = 0.95;
function qgHammer(): Motion {
  const R = QG_REST;
  const H = QG_HIT;
  const fists = (x: number, z: number, w = 6): P => ({ rhIn: 2, rhx: x * K, rhy: -w * K, rhz: z, lhIn: 2, lhx: x * K, lhy: w * K, lhz: z });
  return {
    hit: H,
    keys: [
      { at: 0, pose: {} },
      { at: 0.4, pose: { pz: R.pz + 2, pitch: -8, bend: -6, faceUp: 18, ...fists(-4, 112 * K), re: 34, le: -34 }, ease: 'io' },
      { at: 0.55, pose: { pz: R.pz + 2.4, pitch: -9, bend: -7, faceUp: 19, ...fists(-6, 113 * K), re: 34, le: -34 }, ease: 'io' },
      { at: 0.7, pose: { pz: R.pz + 2, pitch: -10, bend: -8, faceUp: 18, ...fists(-7, 112 * K), re: 34, le: -34 }, ease: 'io' },
      { at: 0.8, pose: { pz: R.pz + 1, pitch: -4, bend: -2, faceUp: 14, ...fists(4, 116 * K), re: 30, le: -30 }, ease: 'in' },
      { at: 0.88, pose: { pz: R.pz - 5, pitch: 8, bend: 8, faceUp: 4, lk: 22, rk: -22, ...fists(30, 80 * K), re: 24, le: -24 }, ease: 'lin' },
      { at: H, pose: { pz: R.pz - 15, pitch: 18, bend: 16, faceUp: -2, lk: 34, rk: -34, ...fists(38, B.armR[2] + 7), re: 14, le: -14 }, ease: 'lin' },
      { at: H + 0.18, pose: { pz: R.pz - 17, pitch: 20, bend: 18, faceUp: -4, lk: 36, rk: -36, ...fists(41, B.armR[2] + 7.5), re: 14, le: -14 }, ease: 'out' },
      { at: H + 0.4, pose: { pz: R.pz - 13, pitch: 16, bend: 15, faceUp: 0, lk: 30, rk: -30, ...fists(41, B.armR[2] + 9), re: 14, le: -14 }, ease: 'io' },
      { at: H + 0.85, pose: {}, ease: 'io' },
    ],
  };
}
/** The warning: the mark flaring as it holds its fists up. */
const qgGlint = (t: number): number => (t < 0.3 ? 0 : t < 0.6 ? (t - 0.3) / 0.3 : t < QG_HIT ? 1 : t < QG_HIT + 0.12 ? 1 - (t - QG_HIT) / 0.12 : 0);
const qgShaken = (since: number): number => (since >= 0 && since < 0.7 ? since + 0.001 : 0);

/**
 * ITS THROW, "a chunk torn off its body and thrown" (the planning chat's, kept with his yes): its left hand
 * reaches across and grips the top of its right shoulder; it wrenches a chunk of it away in a burst of chips;
 * winds the chunk back over its left shoulder, leaning back, held, the mark flaring (the warning); its hips go,
 * its chest comes round and it hurls the chunk overhand; it follows through, and the cult's fire knits its
 * shoulder whole again.
 */
export const QG_THROW_HIT = 1.12;
/** When it tears the chunk away, and how long the throw is. */
export const QG_TEAR = 0.45;
export const QG_THROW = 2.0;
/** The chunk's half-sizes (figure's lengths). */
export const CHUNK_H: V3 = [5.2, 6.0, 4.4];
/** Where the chunk is held: just past the end of its left fist, along its forearm (`fore`, from the elbow to the hand). */
export function chunkIn(hand: V3, fore: V3): V3 {
  return add(hand, mul(fore, B.armR[2] * 2.7 + CHUNK_H[2] + 0.6));
}
function qgThrow(): Motion {
  const R = QG_REST;
  const H = QG_THROW_HIT;
  const lh = (x: number, y: number, z: number): P => ({ lhIn: 2, lhx: x * K, lhy: y * K, lhz: z * K });
  const rh = (x: number, y: number, z: number): P => ({ rhIn: 2, rhx: x * K, rhy: y * K, rhz: z * K });
  return {
    hit: H,
    keys: [
      { at: 0, pose: {} },
      { at: 0.3, pose: { pz: R.pz + 0.5, pitch: R.pitch, bend: R.bend + 2, twist: -8, faceTurn: -10, ...lh(8, -9, 57), le: -60, ...rh(10, -30, 22) }, ease: 'io' },
      { at: QG_TEAR - 0.05, pose: { pz: R.pz + 0.8, pitch: R.pitch - 1, bend: R.bend + 1, twist: -10, faceTurn: -12, ...lh(7, -10, 58), le: -62, ...rh(10, -30, 22) }, ease: 'io' },
      { at: QG_TEAR + 0.1, pose: { pz: R.pz + 1.6, pitch: R.pitch - 3, bend: R.bend - 2, twist: -4, faceTurn: -6, roll: 2, ...lh(10, 0, 66), le: -50, ...rh(9, -30, 24) }, ease: 'out' },
      { at: 0.85, pose: { pz: R.pz + 2, pitch: -6, bend: -6, twist: 14, faceTurn: 8, faceUp: 8, roll: -2, ...lh(-12, 26, 72), le: -40, ...rh(18, -24, 42), re: 30 }, ease: 'io' },
      { at: 1.0, pose: { pz: R.pz + 2.2, pitch: -7, bend: -7, twist: 16, faceTurn: 9, faceUp: 9, roll: -2.4, ...lh(-14, 27, 73), le: -40, ...rh(19, -24, 43), re: 30 }, ease: 'io' },
      { at: H - 0.04, pose: { pz: R.pz, pitch: 4, bend: 4, twist: 0, faceTurn: 0, faceUp: 4, roll: 0, ...lh(10, 22, 70), le: -26, ...rh(10, -28, 34), re: 30 }, ease: 'in' },
      { at: H + 0.06, pose: { pz: R.pz - 3, pitch: 9, bend: 8, twist: -12, faceTurn: -6, faceUp: 0, ...lh(30, 10, 48), le: -16, ...rh(-2, -30, 32), re: 30 }, ease: 'out' },
      { at: H + 0.3, pose: { pz: R.pz - 4, pitch: 11, bend: 9, twist: -15, faceTurn: -8, faceUp: -2, lk: 18, rk: -18, ...lh(26, 2, 38), le: -20, ...rh(-4, -30, 26), re: 30 }, ease: 'out' },
      { at: QG_THROW, pose: {}, ease: 'io' },
    ],
  };
}
const qgThrowGlint = (t: number): number => (t < 0.6 ? 0 : t < 0.85 ? (t - 0.6) / 0.25 : t < QG_THROW_HIT ? 1 : t < QG_THROW_HIT + 0.12 ? 1 - (t - QG_THROW_HIT) / 0.12 : 0);
/** How much of its right shoulder is gone (0 whole, 1 torn): torn away at QG_TEAR, knitting back from just after the throw. */
const qgTorn = (t: number): number => (t < QG_TEAR - 0.02 ? 0 : t < QG_TEAR + 0.04 ? (t - QG_TEAR + 0.02) / 0.06 : t < QG_THROW_HIT + 0.1 ? 1 : t < QG_THROW - 0.15 ? 1 - smooth01((t - QG_THROW_HIT - 0.1) / (QG_THROW - 0.15 - QG_THROW_HIT - 0.1)) : 0);

/** STRUCK: rocked back a little, its chains rattling, grit shaken off. */
function qgStruck(): Motion {
  const R = QG_REST;
  return {
    keys: [
      { at: 0, pose: {} },
      { at: 0.06, pose: { px: -2, pz: R.pz - 0.6, pitch: R.pitch - 7, bend: R.bend - 6, faceUp: R.faceUp + 10, lhx: R.lhx - 3, rhx: R.rhx - 3 }, ease: 'out' },
      { at: 0.16, pose: { px: -1, pitch: R.pitch - 2, bend: R.bend - 2, faceUp: R.faceUp + 3 }, ease: 'io' },
      { at: 0.3, pose: {}, ease: 'io' },
    ],
  };
}

/** ITS DEATH, "Bursts apart": it swells, its arms flung out, the mark burning white-hot, trembling; and bursts: its chains snap and its blocks are flung outward, tumbling, and land all round where it stood. */
export const QG_DIE_TIME = 1.6;
export const QG_BURST = 0.42;
function qgDying(): Motion {
  const R = QG_REST;
  const out: P = { lhIn: 1, lhx: 10, lhy: 40, lhz: -22, le: -50, rhIn: 1, rhx: 10, rhy: -40, rhz: -22, re: 50 };
  return {
    keys: [
      { at: 0, pose: {} },
      { at: 0.12, pose: { px: -1.5, pz: R.pz + 1, pitch: R.pitch - 8, bend: R.bend - 8, faceUp: R.faceUp + 14, ...out }, ease: 'out' },
      { at: 0.26, pose: { px: -1.5, pz: R.pz + 2.4, pitch: R.pitch - 12, bend: R.bend - 12, faceUp: R.faceUp + 20, roll: 1.4, ...out, lhz: -18, rhz: -18 }, ease: 'io' },
      { at: QG_BURST, pose: { px: -1.5, pz: R.pz + 3, pitch: R.pitch - 13, bend: R.bend - 13, faceUp: R.faceUp + 22, roll: -1.2, ...out, lhz: -16, rhz: -16, out: 1 }, ease: 'io' },
      { at: QG_DIE_TIME, pose: { px: -1.5, pz: R.pz + 3, pitch: R.pitch - 13, bend: R.bend - 13, faceUp: R.faceUp + 22, ...out, lhz: -16, rhz: -16, out: 1 }, ease: 'lin' },
    ],
  };
}
/** How each piece of it is flung as it bursts: out from its middle the way it is from it, up, tumbling, and down where it lands. */
function qgFall(piece: string): Fall | null {
  if (/^(grit|chips|glow|eyes|flash)/.test(piece)) return null;
  let h = 0;
  for (let i = 0; i < piece.length; i++) h = (h * 31 + piece.charCodeAt(i)) | 0;
  const a = hash(h, 1, 13);
  const b = hash(h, 2, 13);
  // (which way it is from its middle: the left side flung left, the right right, the front forward)
  const side = /L$/.test(piece) ? 1 : /R$/.test(piece) ? -1 : b - 0.5;
  const ahead = /^(chest|head|fist)/.test(piece) ? 1 : /^(hips|belly)/.test(piece) ? -0.4 : a - 0.5;
  return { from: QG_BURST + a * 0.03, to: [ahead * (30 + 30 * a), side * (30 + 34 * b)], spin: (a - 0.5) * 220, lay: 'keep', hop: 3 + 4 * b, rise: 24 + 30 * a };
}

function qgMob(): Mob {
  return {
    id: 'quarry-golem',
    name: 'Quarry golem',
    size: 'medium',
    build: B,
    stand: { name: 'The quarry golem stands, grinding', motion: qgStand(), rest: QG_REST },
    attack: { name: 'The hammer', motion: qgHammer(), rest: QG_REST, glint: qgGlint, rally: (t) => qgShaken(t - QG_HIT) },
    idleFrames: 16,
    idleFps: 8,
    walk: { name: 'The quarry golem plods', motion: qgWalk(), rest: QG_REST, period: QG_WALK_FRAMES / QG_WALK_FPS, ground: QG_GROUND, rally: (t) => qgShaken(t % ((QG_WALK_FRAMES / QG_WALK_FPS) / 2)) },
    walkFrames: QG_WALK_FRAMES,
    walkFps: QG_WALK_FPS,
    pace: QG_PACE,
    more: {
      setOff: { name: 'The quarry golem sets off', motion: qgSetOff(), rest: QG_REST, ground: QG_GROUND, feet: qgSetOffFeet() },
      halt: { name: 'The quarry golem stops', motion: qgHalt(), rest: QG_REST, ground: QG_GROUND, feet: qgHaltFeet() },
      throw: { name: 'The quarry golem tears a chunk off itself and throws it', motion: qgThrow(), rest: QG_REST, glint: qgThrowGlint, jaw: qgTorn, skull: (t) => t >= QG_TEAR && t < QG_THROW_HIT, charge: (t) => (t >= QG_TEAR && t < QG_TEAR + 0.6 ? t - QG_TEAR + 0.001 : 0), rally: (t) => (t >= QG_THROW_HIT ? qgShaken(t - QG_THROW_HIT) : qgShaken(t - QG_TEAR)) },
    },
    reel: { name: 'The quarry golem is struck', motion: qgStruck(), rest: QG_REST, rally: (t) => qgShaken(t) },
    reelTime: 0.3,
    hit: QG_HIT,
    warn: 0.5,
    dieTime: QG_DIE_TIME,
    dying: { name: 'The quarry golem bursts apart', motion: qgDying(), rest: QG_REST, glint: (t) => clamp01(t / QG_BURST) },
    aura: { x: QG_CANVAS.ax, y: QG_CANVAS.ay - 50, r: 70, color: '#ff3a78', a: 0.12 },
    shadow: 30,
    canvas: QG_CANVAS,
    bits: (st, m) => golemBits(st, m),
    fall: qgFall,
  };
}
/** THE QUARRY GOLEM. */
export const QUARRY_GOLEM: Mob = qgMob();

/** A frame of one of its moves (as the game holds a figure), or of its death (`dying`). */
export function golemFrame(which: string, t: number, view: GameView = 'front'): Sprite {
  const can = canvasOf(QUARRY_GOLEM);
  if (which === 'dying') return toSprite(deathOfMob(QUARRY_GOLEM, Math.min(1, t / QG_DIE_TIME), view), null, can.ax, can.ay);
  return toSprite(paintMob(QUARRY_GOLEM, which, t, view, ENEMY_RIM), null, can.ax, can.ay);
}

/**
 * THE CHUNK IN FLIGHT, thrown: the block torn off its shoulder, tumbling end over end (`turn`, 0..1 once
 * round), the enemy's edge round it (it is the golem's, and it hurts). Its middle on the anchor; the game flies
 * it from `handAt(QUARRY_GOLEM, 'throw', QG_THROW_HIT, 'L')`.
 */
export function golemChunk(turn: number, view: GameView = 'front'): Sprite {
  const st = stage(view, 32, 32, { w: 64, h: 64 });
  const bits: Bit[] = [];
  const put: Put = (part, piece, shape) => bits.push({ part, piece, shape });
  const a = turn * Math.PI * 2;
  const F: V3 = [Math.cos(a), 0, -Math.sin(a)];
  const U: V3 = [Math.sin(a), 0, Math.cos(a)];
  block(put, 'chunk', 'chunk', [0, 0, 0], [F, [0, 1, 0], U], CHUNK_H, cutFace(11));
  const lights = paintBits(st, bits, [0, 0, 0]);
  return toSprite({ px: st.whole(ENEMY_RIM), lights }, null, 32, 32);
}
/** The frames of the chunk in flight, once round. */
export const CHUNK_FRAMES = 8;
export function makeGolemChunkArt(view: GameView = 'front'): Sprite[] {
  return lazyFrames(CHUNK_FRAMES, (i) => golemChunk(i / CHUNK_FRAMES, view));
}
/**
 * THE CHUNK SHATTERING where it comes down (`frame` 0 to 4, at 12 a second; 4 is what is left): it strikes
 * and splits, its pieces flung out and tumbling down round where it struck, a puff of grit; then a few
 * chips lying. A floor piece, its middle where the chunk came down: 128 x 96 at (64, 64). No edge, no light.
 */
export function chunkShatter(frame: number): Sprite {
  const st = stage('front', 64, 64, { w: 128, h: 96 });
  const bits: Bit[] = [];
  const put: Put = (part, piece, shape) => bits.push({ part, piece, shape });
  const k = Math.min(1, frame / 4);
  for (let i = 0; i < 7; i++) {
    const a = (i / 7) * Math.PI * 2 + hash(i, 1, 66) * 0.6;
    const far = (6 + 12 * hash(i, 2, 66)) * Math.sqrt(k) + 2;
    const h: V3 = [1.8 + 1.4 * hash(i, 3, 66), 1.6 + 1.2 * hash(i, 4, 66), 1.3 + 0.8 * hash(i, 5, 66)];
    const up = frame >= 4 ? 0 : (6 + 8 * hash(i, 6, 66)) * Math.sin(Math.PI * Math.min(1, k * 1.25));
    const tilt = frame >= 4 ? 0 : (hash(i, 7, 66) - 0.5) * 3 * k;
    const yaw = hash(i, 8, 66) * 6.3;
    const f: V3 = [Math.cos(yaw), Math.sin(yaw), 0];
    const l0: V3 = [-Math.sin(yaw), Math.cos(yaw), 0];
    block(put, `bit${i}`, `bit${i}`, [Math.cos(a) * far, Math.sin(a) * far, h[2] + up], [f, add(mul(l0, Math.cos(tilt)), [0, 0, Math.sin(tilt)]), add(mul(l0, -Math.sin(tilt)), [0, 0, Math.cos(tilt)])], h, cutFace(80 + i));
  }
  if (frame < 4) for (let i = 0; i < 16; i++) {
    const a = hash(i, 1, 67) * Math.PI * 2;
    const r = (4 + 18 * hash(i, 2, 67)) * Math.sqrt(k + 0.2);
    put('grit', 'grit', { k: 'mote', p: [Math.cos(a) * r, Math.sin(a) * r, Math.max(0.5, (4 + 12 * hash(i, 3, 67)) * (1 - k * 0.7))], c: i % 2 ? CUT[3] : CUT[2], size: i % 3 ? 2 : 3 });
  }
  const lights = paintBits(st, bits, [0, 0, 4]);
  return toSprite({ px: st.whole(null), lights }, null, 64, 64);
}

// =============================================================================================
// THE RUBBLING (tiny): a heap of chips on four stubby legs of stone, a pink spark glowing in its
// middle. Not a body of bones: its own solids, frame by frame.

/** Its canvas, and its floor point on it. */
export const RB_CANVAS = { w: 112, h: 92, ax: 56, ay: 70 };
/** How fast it scuttles (tiles a second; its scuttle is painted for it). */
export const RB_PACE = 2.0;
/** Its scuttle: eight frames at twenty-four a second, once round in a third of a second, its legs two and two. */
const RB_WALK_FRAMES = 8;
const RB_WALK_FPS = 24;
/** How far it goes while a foot is down (half its round). */
const RB_HALF = (RB_PACE * TILE3 * (RB_WALK_FRAMES / 2)) / RB_WALK_FPS;
/** When its butt lands, in its attack; its attack's length; its flinch's; its death's, and when it pops. */
export const RB_HIT = 0.42;
export const RB_ATTACK = 0.8;
export const RB_REEL = 0.27;
export const RB_DIE = 0.8;
export const RB_POP = 0.16;
/** Rising out of a rock pile: how long. */
export const RB_EMERGE = 0.7;
/** Its four legs: where each comes out of the heap (forward, left), and where its foot rests (forward, left). */
const RB_LEGS: ReadonlyArray<readonly [number, number, number, number]> = [
  [5, 5, 8, 10],
  [-5, 5, -7, 10],
  [5, -5, 8, -10],
  [-5, -5, -7, -10],
];

/** A pose of the rubbling: its heap's middle (forward, up), squashed (`squash`: 0 as it is, 1 flat, below 0 swollen), tipped forward; each foot's place (forward, left, up); the spark (0 out to 1 flaring). */
interface RbPose {
  x: number;
  z: number;
  squash: number;
  tip: number;
  feet: ReadonlyArray<readonly [number, number, number]>;
  spark: number;
  /** Its maw: the top of its heap hinged up off its front (0 shut, 1 wide), the spark blazing in the gap. */
  gape?: number;
  /** Risen out of a pile (0 a low pile of chips, 1 standing); `shiver`: its chips trembling. */
  rise?: number;
  shiver?: number;
}
const RB_STILL: RbPose = { x: 0, z: 9, squash: 0, tip: 0, feet: RB_LEGS.map(([, , fx, fy]) => [fx, fy, 0] as const), spark: 0.6 };
const at0 = (fx: number, fy: number, dx = 0, z = 0): readonly [number, number, number] => [fx + dx, fy, z];

/** Its chips: where each lies in the heap (round its middle, how far out, how high), its size, how it is turned. The legs' stones are chips too, as it pops. */
interface RbChip {
  home: V3;
  h: V3;
  yaw: number;
  tilt: number;
}
const RB_CHIPS: RbChip[] = (() => {
  const out: RbChip[] = [];
  const add1 = (i: number, ang: number, r: number, z: number, big: number): void => {
    out.push({ home: [Math.cos(ang) * r, Math.sin(ang) * r, z], h: [(2.6 + 1.3 * hash(i, 3, 71)) * big, (2.2 + 1.1 * hash(i, 4, 71)) * big, (1.8 + 0.8 * hash(i, 5, 71)) * big], yaw: hash(i, 1, 71) * Math.PI * 2, tilt: (hash(i, 2, 71) - 0.5) * 1.1 });
  };
  // (seven round its foot, leaving a gap low at its front where the spark shows; four above; one on top)
  for (let i = 0; i < 7; i++) add1(i, 1.0 + (i / 6) * (Math.PI * 2 - 2.0), 5.4, 1.2, 1);
  for (let i = 0; i < 4; i++) add1(7 + i, 0.9 + (i / 4) * Math.PI * 2, 2.8, 5.2, 0.95);
  add1(11, 0, 0.6, 8.6, 0.85);
  return out;
})();
/** A chip's frame, turned `yaw` about the upright and tipped `tilt` about its own forward. */
function chipFrame(yaw: number, tilt: number): [V3, V3, V3] {
  const f: V3 = [Math.cos(yaw), Math.sin(yaw), 0];
  const l0: V3 = [-Math.sin(yaw), Math.cos(yaw), 0];
  return [f, add(mul(l0, Math.cos(tilt)), [0, 0, Math.sin(tilt)]), add(mul(l0, -Math.sin(tilt)), [0, 0, Math.cos(tilt)])];
}

/** THE RUBBLING AS SOLIDS: its heap of chips, its legs, the spark in its middle. */
function rubblingBits(p: RbPose, t: number, put: Put): void {
  const rise = p.rise ?? 1;
  const c: V3 = [p.x, 0, p.z];
  const k = (1 - 0.35 * p.squash) * (0.3 + 0.7 * Math.min(1, rise));
  const wide = (1 + 0.18 * p.squash) * (1 + 0.35 * (1 - Math.min(1, rise)));
  const tipF = (v: V3): V3 => [v[0] * wide + v[2] * Math.sin(p.tip), v[1] * wide, v[2] * Math.cos(p.tip)];
  // (its maw: the upper chips hinged up about the back of its heap)
  const phi = 0.85 * (p.gape ?? 0);
  const hinge = (v: V3): V3 => {
    if (phi === 0 || v[2] < 4) return v;
    const dx = v[0] + 4.5;
    const dz = v[2] - 3;
    return [-4.5 + dx * Math.cos(phi) - dz * Math.sin(phi), v[1], 3 + dx * Math.sin(phi) + dz * Math.cos(phi)];
  };
  // the legs: each two short blocks of stone, knee up, to its foot (tucked in under it while it is a pile)
  if (rise > 0.3) RB_LEGS.forEach(([lx, ly], i) => {
    const hip: V3 = add(c, tipF([lx, ly, -2]));
    const [fx, fy, fz] = p.feet[i];
    const foot: V3 = [fx, fy, fz + 1.5];
    const mid: V3 = add(lerp3(hip, foot, 0.5), [0, ly > 0 ? 3 : -3, 4]);
    put(`leg${i}`, `leg${i}`, { k: 'rod', a: hip, b: mid, ra: 2.4, rb: 2.0, ramp: CUT });
    put(`leg${i}`, `leg${i}`, { k: 'rod', a: mid, b: foot, ra: 2.0, rb: 1.6, ramp: CUT });
  });
  // the heap
  RB_CHIPS.forEach((ch, i) => {
    const [hx, hy, hz] = hinge(ch.home);
    const sh = p.shiver ? (hash(i, Math.floor(t * 30), 78) - 0.5) * p.shiver : 0;
    const tilt = ch.tilt + (ch.home[2] >= 4 ? phi * 0.8 : 0);
    block(put, 'heap', `chip${i}`, add(c, tipF([hx + sh, hy - sh, hz * k])), chipFrame(ch.yaw, tilt), [ch.h[0], ch.h[1], ch.h[2] * Math.max(0.6, k)], cutFace(70 + i));
  });
  // the spark, showing in the gap at its front
  if (p.spark > 0.05) {
    const sc = add(c, tipF([4.6, 0, 2.6 * k]));
    const flick = hash(Math.floor(t * 12), 1, 73);
    put('spark', 'spark', { k: 'ball', c: sc, ax: sphere(1.8 + Math.min(1, p.spark) + 1.2 * (p.gape ?? 0)), skin: (_u, tone) => (p.spark < 0.3 ? FLAME[1] : p.spark > 1.05 ? FLAME[4] : tone >= 3 && (p.spark > 0.85 || flick > 0.6) ? FLAME[3] : tone >= 2 ? FLAME[2] : FLAME[1]) });
    put('spark', 'sparkGlow', { k: 'glow', p: sc, c: FLAME[2], r: 10 + 10 * Math.min(1.4, p.spark), a: Math.min(0.7, 0.3 + 0.3 * p.spark) });
  }
}

/** ITS POP: each chip of it (and the stones of its legs) flung out from its middle, tumbling, and down where it lands, `s` seconds after it popped. */
function rubblingPop(s: number, put: Put): void {
  const fly = (i: number, from: V3, h: V3, yaw0: number, tilt0: number): void => {
    const out = norm([from[0] + (hash(i, 1, 77) - 0.5) * 3, from[1] + (hash(i, 2, 77) - 0.5) * 3, 0], [1, 0, 0]);
    const far = 9 + 13 * hash(i, 3, 77);
    const up = 34 + 26 * hash(i, 4, 77);
    const g = 260;
    const land = (up + Math.sqrt(up * up + 2 * g * Math.max(0, from[2] - h[2]))) / g;
    const u = Math.min(1, s / land);
    const fl = Math.min(s, land);
    const z = s < land ? Math.max(h[2], from[2] + up * fl - (g / 2) * fl * fl) : h[2];
    // (it slides a little once it is down)
    const slide = s > land ? Math.min(1, (s - land) / 0.12) * 1.6 : 0;
    const p: V3 = [from[0] + out[0] * (far * u + slide), from[1] + out[1] * (far * u + slide), z];
    // (it tumbles, turning just so far that it comes down flat)
    const turns = Math.round((tilt0 + (hash(i, 5, 77) - 0.5) * 16 * land) / Math.PI);
    const spin = (turns * Math.PI - tilt0) / land;
    block(put, `bit${i}`, `bit${i}`, p, chipFrame(yaw0 + 4 * (hash(i, 6, 77) - 0.5) * fl, tilt0 + spin * fl), h, cutFace(70 + i));
  };
  RB_CHIPS.forEach((ch, i) => fly(i, add(ch.home, [0, 0, 8]), ch.h, ch.yaw, ch.tilt));
  RB_LEGS.forEach(([lx, ly, fx, fy], j) => fly(20 + j, [(lx + fx) / 2, (ly + fy) / 2, 4], [2.2, 1.6, 1.4], Math.atan2(fy - ly, fx - lx), 0));
}

/** Where its four feet are as it scuttles, `t` seconds in (forward, left, up from its floor point): two down, carried back under it as fast as it goes, two up and swinging on. */
export function rubblingWalkFeet(t: number): (readonly [number, number, number])[] {
  const ph = ((((t * RB_WALK_FPS) / RB_WALK_FRAMES) % 1) + 1) % 1;
  return RB_LEGS.map(([, , fx, fy], i) => {
    const u = (ph + (i === 0 || i === 3 ? 0 : 0.5)) % 1;
    if (u < 0.5) return at0(fx, fy, RB_HALF * (0.5 - 2 * u));
    const v = (u - 0.5) * 2;
    return at0(fx, fy, -RB_HALF / 2 + RB_HALF * v * v * (3 - 2 * v), 3.5 * Math.sin(Math.PI * v));
  });
}
/** Its scuttle's frames and their rate (the game shows them faster or slower to match another pace). */
export const RB_WALK = { frames: RB_WALK_FRAMES, fps: RB_WALK_FPS };

/** One frame of the rubbling: `which` (stand, walk, attack, reel, dying), `t` seconds in, from in front or behind. Its grit is laid on after its pink edge, so that it stays the stone's colour. */
export function rubblingPainted(which: string, t: number, view: GameView = 'front'): Painted {
  const st = stage(view, RB_CANVAS.ax, RB_CANVAS.ay, RB_CANVAS);
  const bits: Bit[] = [];
  const put: Put = (part, piece, shape) => bits.push({ part, piece, shape });
  let p: RbPose = RB_STILL;
  const motes: [V3, string, number][] = [];
  const grit = (i: number): string => (i % 3 === 0 ? CUT[3] : i % 3 === 1 ? CUT[2] : '#8a7e78');
  let alive = true;
  if (which === 'stand') {
    // (its heap breathes, a leg shifts, its spark pulses)
    const a = (t / 1.0) * Math.PI * 2;
    const feet = RB_STILL.feet.map(([fx, fy], i) => [fx + (i === 1 ? Math.max(0, Math.sin(a)) * 2 : 0), fy, i === 1 ? Math.max(0, Math.sin(a)) * 2.5 : 0] as const);
    p = { ...RB_STILL, z: 9 + 0.7 * Math.sin(a), squash: 0.08 + 0.08 * Math.sin(a), feet, spark: 0.55 + 0.3 * Math.sin(a * 2) };
  } else if (which === 'walk') {
    // (scuttling: its legs two and two, each foot down where it came down until it lifts; its heap bobbing at each step)
    const ph = ((((t * RB_WALK_FPS) / RB_WALK_FRAMES) % 1) + 1) % 1;
    const feet = rubblingWalkFeet(t);
    p = { ...RB_STILL, z: 9.2 + 1.3 * Math.abs(Math.sin(ph * Math.PI * 2)), tip: 0.12, squash: 0.1 * Math.abs(Math.cos(ph * Math.PI * 2)), feet, spark: 0.7 };
  } else if (which === 'attack') {
    // (THE BITE: crouched, the top of its heap hinged open on the blazing spark: the warning; it springs at you and snaps shut; it drops back)
    if (t < 0.28) {
      const u = t / 0.28;
      p = { ...RB_STILL, z: 9 - 3 * u, squash: 0.4 * u, tip: -0.15 * u, spark: 0.6 + 0.6 * u, gape: smooth01(u) };
    } else if (t < RB_HIT) {
      const u = (t - 0.28) / (RB_HIT - 0.28);
      p = { ...RB_STILL, x: 16 * u, z: 6 + 18 * Math.sin(Math.PI * u * 0.8), squash: 0.4 * (1 - u) - 0.15 * Math.sin(Math.PI * u), tip: 0.35 * u, spark: 1.2, gape: u < 0.6 ? 1 : 1 - smooth01((u - 0.6) / 0.4), feet: RB_STILL.feet.map(([fx, fy]) => at0(fx, fy, 16 * u, Math.max(0, 14 * Math.sin(Math.PI * u * 0.8) - 2))) };
    } else if (t < 0.6) {
      const u = (t - RB_HIT) / (0.6 - RB_HIT);
      p = { ...RB_STILL, x: 16 - 4 * u, z: 10 - 2 * u, squash: 0.25 * (1 - u), tip: 0.35 * (1 - u), spark: 1 - 0.3 * u, feet: RB_STILL.feet.map(([fx, fy]) => at0(fx, fy, 16 - 4 * u)) };
      if (u < 0.7) for (let i = 0; i < 8; i++) motes.push([[22 + hash(i, 1, 74) * 8 + u * 10, (hash(i, 2, 74) - 0.5) * 14, 4 + hash(i, 3, 74) * 10 * (1 - u)], grit(i), i % 3 ? 2 : 3]);
    } else {
      // (and scuttles back to where it stood)
      const u = (t - 0.6) / (RB_ATTACK - 0.6);
      const g = u * u * (3 - 2 * u);
      p = { ...RB_STILL, x: 12 * (1 - g), feet: RB_STILL.feet.map(([fx, fy], i) => at0(fx, fy, 12 * (1 - g), (i === 0 || i === 3 ? Math.sin(Math.PI * u * 2) : Math.sin(Math.PI * u * 2 + Math.PI)) > 0 ? 2 : 0)) };
    }
  } else if (which === 'emerge') {
    // (OUT OF A ROCK PILE: a low pile of chips that trembles, a pink glow waking in it; it heaves up, its legs kick out, its spark lights; it settles and stands)
    const sp = (u: number): number => u * u * (3 - 2 * u);
    if (t < 0.22) {
      const u = t / 0.22;
      p = { ...RB_STILL, z: 3, rise: 0, shiver: 0.4 + 1.2 * u, spark: 0.15 + 0.25 * u, feet: RB_STILL.feet.map(([fx, fy]) => at0(fx * 0.4, fy * 0.4)) };
    } else if (t < 0.5) {
      const u = (t - 0.22) / 0.28;
      const r = 1.12 * sp(u);
      p = { ...RB_STILL, z: 3 + 7 * sp(u), rise: r, shiver: 1.6 * (1 - u), spark: 0.4 + 0.8 * u, feet: RB_STILL.feet.map(([fx, fy]) => at0(fx * (0.4 + 0.6 * sp(u)), fy * (0.4 + 0.6 * sp(u)), 0, 3 * Math.sin(Math.PI * u))) };
      for (let i = 0; i < 6; i++) motes.push([[(hash(i, 1, 79) - 0.5) * 16, (hash(i, 2, 79) - 0.5) * 16, Math.max(0.5, 12 * u - 14 * u * u + 2)], grit(i), 2]);
    } else {
      const u = clamp01((t - 0.5) / (RB_EMERGE - 0.5));
      p = { ...RB_STILL, z: 10 - 1 * sp(u), rise: 1.12 - 0.12 * sp(u), squash: 0.2 * Math.sin(Math.PI * u), spark: 1.2 - 0.6 * sp(u) };
    }
  } else if (which === 'reel') {
    // (knocked back off its feet, legs kicking up, chips knocked off it; it lands squashed and springs back)
    const u = clamp01(t / RB_REEL);
    const up = Math.sin(Math.PI * Math.min(1, u / 0.75));
    const land = u > 0.75 ? Math.sin(Math.PI * (u - 0.75) / 0.25) : 0;
    p = { ...RB_STILL, x: -7 * up, z: 9 + 6 * up - 2.5 * land, squash: 0.45 * land - 0.1 * up, tip: -0.5 * up, spark: 1 - 0.5 * up, feet: RB_STILL.feet.map(([fx, fy]) => at0(fx, fy, -5 * up, 4 * up)) };
    for (let i = 0; i < 6; i++) {
      const s = u * RB_REEL;
      motes.push([[3 - (6 + 10 * hash(i, 1, 75)) * s * 4, (hash(i, 2, 75) - 0.5) * 16 * s * 4, Math.max(0.5, 14 + 40 * s - 160 * s * s)], grit(i), i % 3 ? 2 : 3]);
    }
  } else {
    // dying: struck, its spark flares and goes out; it pops, its chips and the stones of its legs flung out in a puff of grit, and lie where they land
    alive = false;
    if (t < RB_POP) {
      const u = t / RB_POP;
      p = { ...RB_STILL, x: -2 * Math.sin(Math.PI * u), z: 9 + 1.5 * u, squash: -0.4 * u, spark: u < 0.4 ? 1 + 0.4 * (u / 0.4) : 1.4 * (1 - (u - 0.4) / 0.6) };
    } else {
      const s = t - RB_POP;
      rubblingPop(s, put);
      // (the puff: grit thrown out and up, hanging, thinning, settling)
      for (let i = 0; i < 30; i++) {
        if (hash(i, 4, 76) < (s - 0.15) * 2.2) continue;
        const a = hash(i, 1, 76) * Math.PI * 2;
        const r = (4 + 18 * hash(i, 2, 76)) * Math.min(1, Math.sqrt(s / 0.3));
        const z = Math.max(0.5, 8 + 10 * hash(i, 3, 76) * Math.min(1, s / 0.15) - 10 * Math.max(0, s - 0.2));
        motes.push([[Math.cos(a) * r, Math.sin(a) * r, z], grit(i), i % 4 ? 2 : 3]);
      }
      if (s < 0.08) put('flash', 'flash', { k: 'glow', p: [3, 0, 9], c: FLAME[2], r: 22, a: 0.4 * (1 - s / 0.08) });
      const lights = paintBits(st, bits, [0, 0, 6]);
      const px = st.whole(null);
      for (const [pt, col, size] of motes) laid(px, st, pt, col, size);
      return { px, lights };
    }
  }
  rubblingBits(p, t, put);
  const lights = paintBits(st, bits, [p.x, 0, p.z]);
  const px = st.whole(alive ? ENEMY_RIM : null);
  for (const [pt, col, size] of motes) laid(px, st, pt, col, size);
  return { px, lights };
}
/** A grain of grit laid on a finished picture. */
function laid(px: Px, st: Stage, p: V3, col: string, size: number): void {
  const [x, y] = st.at(p);
  const xi = Math.round(x - 0.5);
  const yi = Math.round(y - 0.5);
  for (let dy = 0; dy < size; dy++) for (let dx = 0; dx < size; dx++) if (xi + dx >= 0 && yi + dy >= 0 && xi + dx < px.w && yi + dy < px.h) px.set(xi + dx, yi + dy, col);
}

/** THE RUBBLING, as the game holds a monster's pictures (its scuttle painted for `RB_PACE`). */
export function makeRubblingArt(): ActorArt {
  const set = (view: GameView): AnimSet => {
    const frame = (which: string, t: number): Sprite => toSprite(rubblingPainted(which, t, view), which === 'dying' ? null : { x: RB_CANVAS.ax, y: RB_CANVAS.ay - 8, r: 22, color: '#ff3a78', a: 0.1 }, RB_CANVAS.ax, RB_CANVAS.ay);
    const n = Math.round(RB_ATTACK * 30) + 1;
    const attack: Clip = { frames: lazyFrames(n, (i) => frame('attack', i / 30)), fps: 30, hit: RB_HIT };
    const die: Clip = { frames: lazyFrames(Math.round(RB_DIE * 20) + 1, (i) => frame('dying', i / 20)), fps: 20 };
    const reel: Clip = { frames: lazyFrames(Math.round(RB_REEL * 30) + 1, (i) => frame('reel', i / 30)), fps: 30 };
    return {
      idle: lazyFrames(8, (i) => frame('stand', i / 8)),
      walk: lazyFrames(RB_WALK_FRAMES, (i) => frame('walk', i / RB_WALK_FPS)),
      attack: lazyFrames(3, (i) => attack.frames[[6, 13, 19][i]]),
      idleFps: 8,
      walkFps: RB_WALK_FPS,
      clips: { attack, die, reel, moves: { emerge: { frames: lazyFrames(Math.round(RB_EMERGE * 30) + 1, (i) => frame('emerge', i / 30)), fps: 30 } } },
    };
  };
  return { front: set('front'), back: set('back') };
}
/** One frame of the rubbling, as the game holds a figure. */
export function rubblingFrame(which: string, t: number, view: GameView = 'front'): Sprite {
  return toSprite(rubblingPainted(which, t, view), null, RB_CANVAS.ax, RB_CANVAS.ay);
}
