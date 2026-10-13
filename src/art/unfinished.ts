// FLOOR 6'S BOSS, THE UNFINISHED: a mock-up (nothing of the game imports this file; `UNFINISHED_ON` is off).
//
// The planning chat's, with his yes (12 Oct, 18:07, "All the main ones rock.  I like them all"): a stone
// colossus the cult half-carved out of the quarry wall and woke with its chanting; fused to the wall at
// first, it tears itself free at half life; a fist slam, a rockslide, a hurled block that stays as cover,
// a stomp that cracks the terrace. His brief, asked as the art rulebook's questions for a new character
// (13 Oct, by 12:42): how big, "Twice the Warden (Recommended)" (a towering colossus, its head near the top
// of the quarry's cliff); the one thing to know it by, his own words, "One and two": HALF CARVED, HALF RAW
// ROCK (one side a finished, polished statue, the other still rough quarry stone with chisel marks and
// drill holes) AND THE CULT'S MARK BURNING (the shrieking skull cut into its chest, burning pink where the
// chanting woke it); how it moves, "Grinding and heavy (Recommended)" (a statue forced to walk, slow to
// start, every step a shudder, grit falling off it); how it dies, "Topples and shatters" (it falls like a
// felled statue and breaks into great blocks on the floor).
//
// THIS FILE, SO FAR: how it looks, standing (his order: "show you it standing before I animate anything").
// It is built as every boss is, on the heroes' bones (art/skeleton.ts) and dressed in the heroes' solids
// (art/skin.ts, through art/new_mobs3.ts's painter), lit from the upper left, the indigo seam, the enemy's
// pink edge round it. Its RIGHT side is the finished statue (smooth, pale, polished to a shine where the
// light falls full on it, its features carved: half a face with one eye, the brow, the nose, half a mouth;
// a shaped shoulder, a carved fist with its fingers and knuckles; a shaped knee and foot); its LEFT side
// is the raw stone it was coming out of (blocky, greyer, faceted where the point and the claw chisel
// roughed it, pocked, scored, rows of drill holes; a great boulder of a fist). Down its middle, where the
// carvers stopped, a groove and a line of drill holes. On its chest, across that line, the cult's mark
// cut deep and burning. Grit trickles off its raw side. Fused to the wall (phase one) a mass of the cliff's
// own rock still holds its back and its raw side.
//
// The colours are a figure's (three tones and the polish), so it stands out from the quarry, which is
// duller than every word; what glows on it is the cult's fire only (FLAME), and nothing on it is cyan.

import type { Sprite } from '../engine/px';
import { shriekAt } from './floor5';
import { hash, toSprite } from './kit';
import type { Painted, Ramp } from './kit';
import { ENEMY_RIM, FLAME } from './mkit';
import { at3, canvasOf, paintMob, sphere } from './new_mobs3';
import type { Bit, Mob, MobCanvas, MobMove, Moment, Put } from './new_mobs3';
import type { BossShape, CheckLimb, CheckLump } from './boss_checks';
import { wornOn } from './skin';
import type { GameView, Stage } from './skin';
import { add, buildOf, cross, dot, lerp3, mul, norm, standing, sub } from './skeleton';
import type { Bones, Build, Motion, Posed, Skeleton, V3 } from './skeleton';

/** THE SWITCH, OFF: nothing of the game reads this file. */
export const UNFINISHED_ON = { on: false };

const clamp01 = (v: number): number => Math.max(0, Math.min(1, v));
const fr = (t: number): number => t - Math.floor(t);
type P = Partial<Bones>;
/** A skin that is a painter (not a ramp). */
type SkinFn = (u: V3, tone: number, x: number, y: number) => string | null;

// ---------------------------------------------------------------------------------------------
// ITS BODY: twice the Warden (the Warden-sized bosses are built about 110 tall: the Headsman 112, the
// amalgamation 110); a statue's: shoulders broad as a gate, a deep chest, short heavy legs, long arms,
// limbs as thick as pillars, a head small for its bulk.

export const UF_TALL = 236;
export const UF_BODY: Build = buildOf(UF_TALL, 0.95, { shoulders: 1.55, chest: 1.45, depth: 1.3, waist: 1.2, hips: 1.25, legs: 0.84, arms: 1.24, trunk: 1.04, limbs: 2.0, pad: 5 });
const B = UF_BODY;

/** Its canvas: room for it standing, a fist raised over its head, and the rock of the wall behind it. */
export const UF_CANVAS: MobCanvas = { w: 520, h: 440, ax: 260, ay: 396 };

// ---------------------------------------------------------------------------------------------
// ITS STONE

/** The finished statue: the quarry's limestone dressed and rubbed smooth, a shine where the light falls full (a figure's ramp: three tones and the polish). */
export const POLISHED: Ramp = ['#4b4357', '#4b4357', '#a2978b', '#d3c8b7', '#ebe3d4'];
/** The raw stone: the same limestone as it came out of the bed, a little greyer, never rubbed. */
export const RAW: Ramp = ['#463e4c', '#463e4c', '#8d8381', '#b3a99d', '#b3a99d'];
/** The quarry's wall as it is round the fused colossus (art/quarry.ts Q_WALL's middle row): its shade to its lit face. */
const WALL: Ramp = ['#5e5458', '#76696a', '#a29587', '#c9bdb0', '#c9bdb0'];
/** The deep of a drill hole or a cut. */
const HOLE = '#1f1826';
/** The cult's mark cut into it: the dark of the cut, where the fire is not. */
const CUT_DARK = '#2a0f22';

/** THE POLISHED SKIN, with whatever is carved in it (`carve`: a tone up or down, or a colour of its own, at u). */
function polishedSkin(carve?: (u: V3, tone: number) => number | string | null): SkinFn {
  return (u, tone) => {
    const c = carve ? carve(u, tone) : null;
    if (typeof c === 'string') return c;
    let t = tone + (typeof c === 'number' ? c : 0);
    // (the grain of the stone, faint, in the dressed face: it moves with the solid)
    if (t >= 2 && t <= 3 && hash(Math.floor((u[0] + 1) * 11), Math.floor((u[1] + 1) * 11) * 37 + Math.floor((u[2] + 1) * 11), 91) > 0.93) t -= 1;
    return POLISHED[Math.max(0, Math.min(4, t))];
  };
}
/** The raw stone on a round solid (a lump): flat facets a tone up or down, the claw's scored lines, the point's pocks. */
function rawSkin(seed: number): SkinFn {
  return (u, tone) => {
    const k = hash(Math.floor((u[0] + 1) * 2.2) * 7 + Math.floor((u[1] + 1) * 2.2), Math.floor((u[2] + 1) * 2.6), seed);
    let t = tone + (k > 0.72 ? 1 : k < 0.22 ? -1 : 0);
    if (fr((u[2] * 3.2 + u[1] * 1.6 + u[0] * 1.1) * 2.4 + seed * 0.13) < 0.1) t -= 1;
    if (hash(Math.floor((u[0] + 1) * 9), Math.floor((u[1] + 1) * 9) * 31 + Math.floor((u[2] + 1) * 9), seed + 1) > 0.94) t = Math.min(t, 1);
    return RAW[Math.max(0, Math.min(4, t))];
  };
}

/** A face of a block: which (0 +F, 1 -F, 2 +L, 3 -L, 4 +U, 5 -U), `a` and `b` across it (the figure's lengths, from its middle), the light on it. */
type FaceSkin = (face: number, a: number, b: number, tone: number) => string | null;
/**
 * THE RAW STONE ON A BLOCK'S FACE: each face broken into two or three flat planes a tone apart, the
 * claw's scored lines slanting across, the point's pocks, its edges knocked (a tone lighter where the
 * light catches them); `holes`: a row of drill holes on that face, where it says.
 */
function rawFace(seed: number, holes?: (face: number, a: number, b: number) => boolean): FaceSkin {
  return (face, a, b, tone) => {
    if (holes && holes(face, a, b)) return HOLE;
    // (its planes: slanting, of no one size, as the point took the stone off)
    const ca = Math.floor((a + b * 0.55 + hash(face, 1, seed) * 9) / (8 + hash(face, 2, seed) * 5));
    const cb = Math.floor((b - a * 0.35 + hash(face, 3, seed) * 9) / (10 + hash(face, 4, seed) * 6));
    const k = hash(ca * 5 + face, cb, seed);
    let t = tone + (k > 0.78 ? 1 : k < 0.18 ? -1 : 0);
    if (fr((a * 0.6 + b) / 5.2 + seed * 0.17) < 0.09) t -= 1;
    if (hash(Math.floor(a / 1.6), Math.floor(b / 1.6) * 31 + face, seed + 3) > 0.96) t = Math.min(t, 1);
    return RAW[Math.max(0, Math.min(4, t))];
  };
}
/**
 * A BLOCK of the raw stone, turned as `A` (its forward, left and up: right-handed), its half-sizes `h`:
 * each face a flat panel lit as one, as a block cut from the bed is.
 */
function block(put: Put, part: string, piece: string, c: V3, A: readonly [V3, V3, V3], h: V3, skin: FaceSkin): void {
  for (let k = 0; k < 3; k++) {
    const k1 = (k + 1) % 3;
    const k2 = (k + 2) % 3;
    for (const sgn of [1, -1] as const) {
      const face = k * 2 + (sgn > 0 ? 0 : 1);
      const fc = add(c, mul(A[k], sgn * h[k]));
      // (its two edges ordered so that the panel's own normal is the face's outward one)
      const U = mul(A[sgn > 0 ? k1 : k2], h[sgn > 0 ? k1 : k2]);
      const V = mul(A[sgn > 0 ? k2 : k1], h[sgn > 0 ? k2 : k1]);
      put(part, piece, { k: 'panel', c: fc, u: U, v: V, skin: (a, b, front, tone) => (front ? skin(face, a, b, tone) : null) });
    }
  }
}
/** A frame along a limb from `from` to `to` (its up, toward `from`), facing as near `fwd` as it can. */
function limbFrame(from: V3, to: V3, fwd: V3): [V3, V3, V3] {
  const U = norm(sub(from, to), [0, 0, 1]);
  const F = norm(sub(fwd, mul(U, dot(fwd, U))), [1, 0, 0]);
  return [F, cross(U, F), U];
}

// ---------------------------------------------------------------------------------------------
// HOW IT STANDS: a statue forced to stand: its feet planted wide, its knees a little bent under the
// weight, its back bowed, its head pushed forward, its arms hanging, its fists by its knees.

const HANG = -(B.upperArm + B.foreArm) * 0.95;
export const UF_REST: Bones = {
  ...standing(B),
  pz: -7, px: 0, yaw: 0, pitch: 6, roll: 0, twist: 0, bend: 12, side: 0,
  faceTurn: -18, faceUp: 4, faceTilt: 0,
  lfx: 3, lfy: 9, lft: 12, lk: 14, rfx: -2, rfy: -9, rft: -10, rk: -14,
  lhIn: 0, lhx: 12, lhy: 12, lhz: HANG * 0.92, le: -24,
  rhIn: 0, rhx: 12, rhy: -12, rhz: HANG * 0.92, re: 24,
};

/** ITS BREATH, such as a statue has: the stone heaves slowly up and settles, grinding; a shudder runs through it, and the grit falls. 2.4 s round. */
function ufStand(): Motion {
  const R = UF_REST;
  return {
    loop: 0,
    keys: [
      { at: 0, pose: {} },
      // (its weight grinding over onto its raw left leg as the stone heaves up)
      { at: 1.0, pose: { pz: R.pz + 1.6, bend: R.bend - 2, pitch: R.pitch - 1, faceUp: R.faceUp + 2, py: 2.6, roll: -0.8 }, ease: 'io' },
      // (the shudder: the weight drops back into it, and it settles, grinding)
      { at: 1.25, pose: { pz: R.pz + 0.6, bend: R.bend - 1, faceUp: R.faceUp + 1, roll: 0.4, py: 2.4 }, ease: 'in' },
      { at: 1.4, pose: { pz: R.pz + 0.2, roll: -1.0, faceTurn: R.faceTurn + 2, py: 2.0 }, ease: 'io' },
      { at: 1.6, pose: { pz: R.pz + 0.1, roll: -0.4, faceTurn: R.faceTurn + 3, py: 1.6 }, ease: 'io' },
      { at: 2.4, pose: {}, ease: 'io' },
    ],
  };
}
/** When the shudder runs through it, in its breath (grit shaken off falls from then). */
const SHUDDER = 1.25;

// ---------------------------------------------------------------------------------------------
// ITS SOLIDS

/** What makes one picture of it: as it stands, and whether it is still one with the wall behind it. */
export interface UfLook {
  fused: boolean;
}

/** The middle of its chest, and the chest's half-sizes (its solids, and the checks'). */
const chestOf = (s: Skeleton): V3 => add(s.ribs, add(mul(s.chest[2], B.chest * 0.44), mul(s.chest[0], 1.0)));
const CR: V3 = [B.ribDeep + 3, B.ribHalf + 8, B.chest * 0.66];

/** THE UNFINISHED AS SOLIDS. */
function ufBits(st: Stage, m: Moment, look: UfLook): Bit[] {
  const { s, q } = m;
  const bits: Bit[] = [];
  const put: Put = (part, piece, shape) => {
    bits.push({ part, piece, shape });
  };
  const [cf, cl, cu] = s.chest;
  const lit = 1 - clamp01(q.out);
  const frame = Math.floor(m.t * 8);
  const P = polishedSkin();

  // --- THE LEGS: the right finished (the thigh's muscle, the kneecap, the calf, a carved foot and its toes); the left the raw block, roughed to a column ---
  for (const side of ['L', 'R'] as const) {
    const hip = side === 'L' ? s.hipL : s.hipR;
    const knee = side === 'L' ? s.kneeL : s.kneeR;
    const ankle = side === 'L' ? s.ankleL : s.ankleR;
    const heel = side === 'L' ? s.heelL : s.heelR;
    const toe = side === 'L' ? s.toeL : s.toeR;
    const [rH, rK, rA] = B.legR;
    const fwd = norm(sub(toe, heel), [1, 0, 0]);
    const across: V3 = norm([-fwd[1], fwd[0], 0], [0, 1, 0]);
    if (side === 'R') {
      const tf = limbFrame(hip, knee, fwd);
      put('legR', 'thighR', { k: 'rod', a: hip, b: knee, ra: rH * 0.88, rb: rK * 0.78, ramp: POLISHED, far: true });
      put('legR', 'thighR', { k: 'ball', c: add(lerp3(hip, knee, 0.55), mul(tf[0], rH * 0.32)), ax: [mul(tf[0], rH * 0.62), mul(tf[1], rH * 0.66), mul(tf[2], len3(hip, knee) * 0.36)], skin: P, far: true });
      put('legR', 'kneeR', { k: 'ball', c: add(knee, mul(tf[0], rK * 0.42)), ax: sphere(rK * 0.72), skin: P, far: true });
      const sf = limbFrame(knee, ankle, fwd);
      put('legR', 'shinR', { k: 'rod', a: knee, b: ankle, ra: rK * 0.76, rb: rA * 0.82, ramp: POLISHED, far: true });
      put('legR', 'shinR', { k: 'ball', c: add(lerp3(knee, ankle, 0.3), mul(sf[0], -rK * 0.3)), ax: [mul(sf[0], rK * 0.6), mul(sf[1], rK * 0.7), mul(sf[2], len3(knee, ankle) * 0.3)], skin: P, far: true });
      put('legR', 'shinR', { k: 'ball', c: ankle, ax: sphere(rA * 0.9), skin: P, far: true });
      const fc = add(lerp3(heel, toe, 0.48), [0, 0, rA * 0.42]);
      put('legR', 'footR', { k: 'ball', c: fc, ax: [mul(fwd, B.ball * 0.84), mul(across, rA * 1.05), [0, 0, rA * 0.52]], skin: P, far: true });
      for (const k of [-1.5, -0.5, 0.5, 1.5]) put('legR', 'footR', { k: 'ball', c: add(add(toe, mul(across, k * rA * 0.42)), [0, 0, rA * 0.28]), ax: sphere(rA * 0.27), skin: P, far: true });
    } else {
      const holes = (face: number, a: number, b: number): boolean => face === 0 && Math.abs(a - 1.5) < 1.6 && fr(b / 7.5) < 0.3;
      const tf = limbFrame(hip, knee, fwd);
      block(put, 'legL', 'thighL', lerp3(hip, knee, 0.48), tf, [rH * 1.0, rH * 1.0, len3(hip, knee) * 0.56], rawFace(11, holes));
      const kf = limbFrame(add(knee, [0, 0, 4]), sub(knee, [0, 0, 4]), fwd);
      block(put, 'legL', 'kneeL', add(knee, mul(fwd, rK * 0.25)), kf, [rK * 1.0, rK * 0.95, rK * 0.9], rawFace(12));
      const sf = limbFrame(knee, ankle, fwd);
      block(put, 'legL', 'shinL', lerp3(knee, ankle, 0.5), sf, [rK * 0.95, rK * 0.92, len3(knee, ankle) * 0.52], rawFace(13, holes));
      const ff: [V3, V3, V3] = [fwd, across, [0, 0, 1]];
      block(put, 'legL', 'footL', add(lerp3(heel, toe, 0.45), [0, 0, rA * 0.7]), ff, [B.ball * 0.95, rA * 1.3, rA * 0.72], rawFace(14));
    }
  }

  // --- THE HIPS, THE BELLY, THE CHEST: the right half finished (a carved belt, the belly's muscles, the breast), the left half still the block; the cult's mark cut across the middle of its chest, burning ---
  const [hf, hl, hu] = s.hips;
  const pc = add(s.pelvis, mul(hu, B.waist * 0.2));
  const PH: V3 = [B.pelvisDeep + 4, B.pelvisHalf + 6, B.waist * 0.95];
  put('hips', 'body', { k: 'ball', c: pc, ax: [mul(hf, PH[0]), mul(hl, PH[1]), mul(hu, PH[2])], skin: polishedSkin((u) => (u[2] > 0.36 && u[2] < 0.62 ? (u[2] > 0.5 ? 1 : -1) : null)) });
  block(put, 'hips', 'hipsRaw', add(pc, mul(hl, PH[1] * 0.5)), s.hips, [PH[0] * 1.02, PH[1] * 0.56, PH[2] * 0.98], rawFace(21));
  const be = s.belly;
  const bc = lerp3(s.waist, s.ribs, 0.4);
  const BH: V3 = [B.waistDeep + 5, B.waistHalf + 6, B.ribs * 0.9];
  put('belly', 'body', { k: 'ball', c: bc, ax: [mul(be[0], BH[0]), mul(be[1], BH[1]), mul(be[2], BH[2])], skin: polishedSkin((u) => (u[0] > 0.4 && (Math.abs(u[1] + 0.24) < 0.04 || Math.abs(fr((u[2] + 1) * 1.6) - 0.5) > 0.46) ? -1 : null)) });
  block(put, 'belly', 'bellyRaw', add(bc, mul(be[1], BH[1] * 0.5)), be, [BH[0] * 1.03, BH[1] * 0.56, BH[2] * 1.0], rawFace(22));
  const chestC = chestOf(s);
  // THE CULT'S MARK, cut deep across the middle of its chest and burning: where a point of the chest is on it
  const mc = add(chestC, add(mul(cf, CR[0] * 0.9), mul(cu, CR[2] * 0.05)));
  const MW = CR[1] * 0.62;
  const MH = CR[2] * 0.82;
  const markAt = (p: V3): string | null => {
    const d = sub(p, mc);
    if (dot(d, cf) < -CR[0] * 0.6) return null;
    const mk = shriekAt(-dot(d, cl) / MW, dot(d, cu) / MH);
    if (mk === 'dark') return CUT_DARK;
    if (mk !== 'bone') return null;
    if (lit < 0.3) return FLAME[0];
    // (burning: hottest at the heart of each stroke, the fire's tongues licking up it by turns)
    const x = -dot(d, cl) / MW;
    const y = dot(d, cu) / MH;
    const edge = shriekAt(x + 0.07, y) !== 'bone' || shriekAt(x - 0.07, y) !== 'bone' || shriekAt(x, y + 0.06) !== 'bone' || shriekAt(x, y - 0.06) !== 'bone';
    if (edge) return FLAME[2];
    return fr(y * 3 - frame * 0.25 + hash(Math.floor(x * 6), 1, 93) * 0.5) < 0.3 ? FLAME[4] : FLAME[3];
  };
  const chestSkin = polishedSkin((u) => {
    // (the carved breast: its lower edge, curving)
    if (u[0] > 0.3 && u[1] < -0.06 && Math.abs(u[2] + 0.28 - 0.3 * (u[1] + 0.5) ** 2) < 0.05) return -2;
    return null;
  });
  put('chest', 'body', { k: 'ball', c: chestC, ax: [mul(cf, CR[0]), mul(cl, CR[1]), mul(cu, CR[2])], skin: chestSkin });
  block(put, 'chest', 'chestRaw', add(chestC, add(mul(cl, CR[1] * 0.52), mul(cu, CR[2] * 0.05))), s.chest, [CR[0] * 1.02, CR[1] * 0.58, CR[2] * 1.02], rawFace(23, (face, a, b) => face === 4 && Math.abs(b) < 1.2 && fr(a / 6) < 0.3));
  // the mark itself: cut into the face the carvers dressed flat for it across the middle of the chest, its own part
  put('mark', 'mark', { k: 'panel', c: add(mc, mul(cf, CR[0] * 0.14 + 0.8)), u: mul(cl, MW), v: mul(cu, MH), skin: (a, b, front) => (front ? markAt(add(mc, add(mul(cl, a), mul(cu, b)))) : null) });
  // the groove where the carvers stopped, drilled, from its belt to its collar
  for (let i = 0; i < 9; i++) {
    const k = i / 8;
    const p = add(lerp3(add(pc, mul(hf, PH[0] * 0.98)), add(chestC, add(mul(cf, CR[0] * 0.96), mul(cu, CR[2] * 0.8))), k), mul(cl, CR[1] * -0.02));
    if (k > 0.45 && k < 0.88) continue; // (the mark is there)
    put('chest', 'hole', { k: 'dot', p, c: HOLE, facing: cf, c2: HOLE });
  }
  // its light
  put('glow', 'glow', { k: 'glow', p: add(mc, mul(cf, 6)), c: FLAME[2], r: 54, a: 0.36 * lit });
  put('glow', 'glow', { k: 'glow', p: add(mc, mul(cf, 6)), c: FLAME[3], r: 18, a: 0.32 * lit });

  // --- THE SHOULDERS: the right a carved shoulder; the left a great block of the stone, unshaped ---
  {
    const [r0] = B.armR;
    put('shoulderR', 'armR', { k: 'ball', c: add(s.shoulderR, add(mul(cu, r0 * 0.2), mul(cl, r0 * 0.15))), ax: [mul(cf, r0 * 1.0), mul(cl, r0 * 1.05), mul(cu, r0 * 0.92)], skin: P, far: true });
    block(put, 'shoulderL', 'shoulderL', add(s.shoulderL, add(mul(cu, r0 * 0.4), mul(cl, r0 * 0.2))), s.chest, [r0 * 1.25, r0 * 1.3, r0 * 1.1], rawFace(31));
  }

  // --- THE ARMS: the right finished down to a carved fist; the left the raw block, a great square fist ---
  for (const side of ['L', 'R'] as const) {
    const sh = side === 'L' ? s.shoulderL : s.shoulderR;
    const el = side === 'L' ? s.elbowL : s.elbowR;
    const hand = side === 'L' ? s.handL : s.handR;
    const fore = norm(sub(hand, el), [0, 0, -1]);
    const [r0, r1, r2] = B.armR;
    const palmUp = norm(sub(cf, mul(fore, dot(cf, fore))), cu);
    const acrossF = norm(cross(fore, palmUp), cl);
    if (side === 'R') {
      const uf = limbFrame(sh, el, cf);
      put('armR', 'upperR', { k: 'rod', a: sh, b: el, ra: r0 * 0.9, rb: r1 * 0.82, ramp: POLISHED, far: true });
      put('armR', 'upperR', { k: 'ball', c: add(lerp3(sh, el, 0.55), mul(uf[0], r0 * 0.36)), ax: [mul(uf[0], r0 * 0.6), mul(uf[1], r0 * 0.66), mul(uf[2], len3(sh, el) * 0.3)], skin: P, far: true });
      put('foreR', 'elbowR', { k: 'ball', c: el, ax: sphere(r1 * 0.88), skin: P, far: true });
      const ff = limbFrame(el, hand, cf);
      put('foreR', 'foreR', { k: 'rod', a: el, b: hand, ra: r1 * 0.86, rb: r2 * 0.8, ramp: POLISHED, far: true });
      put('foreR', 'foreR', { k: 'ball', c: add(lerp3(el, hand, 0.28), mul(ff[1], r1 * 0.2)), ax: [mul(ff[0], r1 * 0.72), mul(ff[1], r1 * 0.78), mul(ff[2], len3(el, hand) * 0.3)], skin: P, far: true });
      // the fist: knuckles forward, the fingers curled under, the thumb across them
      const fc = add(hand, mul(fore, r2 * 0.9));
      put('fistR', 'fistR', { k: 'ball', c: fc, ax: [mul(fore, r2 * 1.15), mul(acrossF, r2 * 1.2), mul(palmUp, r2 * 0.98)], skin: P, far: true });
      for (let i = 0; i < 4; i++) {
        const k = (i - 1.5) / 1.5;
        const kn = add(add(fc, mul(fore, r2 * 0.9)), mul(acrossF, k * r2 * 0.84));
        put('fistR', 'fistR', { k: 'ball', c: add(kn, mul(palmUp, -r2 * 0.12)), ax: sphere(r2 * 0.38), skin: P, far: true });
      }
      put('fistR', 'fistR', { k: 'rod', a: add(add(fc, mul(acrossF, -r2 * 1.0)), mul(palmUp, -r2 * 0.3)), b: add(add(fc, mul(fore, r2 * 0.5)), mul(palmUp, -r2 * 0.8)), ra: r2 * 0.38, rb: r2 * 0.32, ramp: POLISHED, far: true });
    } else {
      const holes = (face: number, a: number, b: number): boolean => face === 0 && Math.abs(a) < 1.6 && fr(b / 7) < 0.32;
      block(put, 'armL', 'upperL', lerp3(sh, el, 0.5), limbFrame(sh, el, cf), [r0 * 1.05, r0 * 1.05, len3(sh, el) * 0.56], rawFace(41, holes));
      block(put, 'foreL', 'elbowL', el, limbFrame(sh, el, cf), [r1 * 1.0, r1 * 1.0, r1 * 0.9], rawFace(42));
      block(put, 'foreL', 'foreL', lerp3(el, hand, 0.5), limbFrame(el, hand, palmUp), [r1 * 1.15, r1 * 1.1, len3(el, hand) * 0.55], rawFace(43, holes));
      // the fist: a square block as big as a man's chest, a crack across it
      block(put, 'fistL', 'fistL', add(hand, mul(fore, r2 * 1.3)), limbFrame(el, hand, palmUp), [r2 * 1.5, r2 * 1.55, r2 * 1.45], rawFace(44, (face, a, b) => face % 2 === 0 && Math.abs(a * 0.5 + b * 0.8 - 1) < 0.6));
    }
  }

  // --- THE NECK AND THE HEAD: half a face, finished (a band round the brow, the brow, a blank eye with the cult's fire waking in it, the nose, half the mouth, the jaw); the other half the raw block ---
  put('neck', 'head', { k: 'rod', a: s.neck, b: s.skull, ra: B.headR[1] * 0.95, rb: B.headR[1] * 0.85, ramp: RAW });
  {
    const face = wornOn(st, s, 6);
    const [ff, fl, fu] = face;
    const hr: V3 = [B.headR[0] * 1.25, B.headR[1] * 1.28, B.headR[2] * 1.2];
    const carved = (u: V3, tone: number): number | string | null => {
      if (u[2] > 0.34 && u[2] < 0.52) return u[2] > 0.45 ? 1 : 0; // the band round the brow
      if (u[0] < 0.25) return null;
      // the eye: a deep socket under the brow, the blank eye in it, the cult's fire waking in it
      const ex = (u[1] + 0.42) / 0.24;
      const ez = (u[2] - 0.06) / 0.15;
      if (ex * ex + ez * ez < 1) {
        if (ex * ex * 2.2 + ez * ez * 2.2 < 1) return lit > 0.3 ? (hash(frame, 2, 77) > 0.4 ? FLAME[3] : FLAME[2]) : RAW[1];
        return POLISHED[0];
      }
      if (u[2] > 0.2 && u[2] < 0.32 && u[1] < -0.1) return 1; // the brow's ridge, in the light
      if (u[1] > -0.14 && u[2] < 0.2 && u[2] > -0.3) return tone >= 2 ? 1 : 0; // the nose, its ridge
      if (u[1] > -0.24 && u[2] < -0.3 && u[2] > -0.38) return -1; // under the nose
      if (u[2] < -0.48 && u[2] > -0.57 && u[1] > -0.42) return -2; // the mouth
      return null;
    };
    put('head', 'head', { k: 'ball', c: s.head, ax: [mul(ff, hr[0]), mul(fl, hr[1]), mul(fu, hr[2])], skin: polishedSkin(carved) });
    block(put, 'head', 'headRaw', at3(s.head, face, 0, hr[1] * 0.55, hr[2] * 0.05), face, [hr[0] * 1.04, hr[1] * 0.56, hr[2] * 1.06], rawFace(52));
    if (lit > 0.3) put('eye', 'eye', { k: 'glow', p: at3(s.head, face, hr[0] * 0.9, -hr[1] * 0.42, hr[2] * 0.06), c: FLAME[2], r: 12, a: 0.42 * lit });
  }

  // --- FUSED TO THE WALL (the fight's first half): the cliff's own rock still holds its back and its raw side ---
  if (look.fused) {
    // (the cliff's own stone, in its benches: the wall it is still part of, behind it and holding its raw side)
    const cliff = (seed: number): FaceSkin => {
      const raw = rawFace(seed);
      return (face, a, b, tone) => {
        if (face < 4 && fr((b + 40) / 13.5) < 0.09) return WALL[Math.max(0, tone - 1)];
        if (face === 4 || face === 5) return raw(face, a, b, tone);
        const c = raw(face, a, b, tone);
        return c === HOLE ? c : WALL[Math.max(0, Math.min(4, tone))];
      };
    };
    const back = add(chestC, mul(cf, -CR[0] * 1.6));
    block(put, 'wall', 'wall', add(back, mul(cu, -CR[2] * 0.2)), s.chest, [CR[0] * 0.8, CR[1] * 2.1, CR[2] * 2.5], cliff(61));
    block(put, 'wall', 'wall2', add(add(s.shoulderL, mul(cl, B.armR[0] * 1.8)), mul(cf, -CR[0] * 0.5)), s.chest, [CR[0] * 1.0, B.armR[0] * 1.5, CR[2] * 2.3], cliff(62));
    block(put, 'wall', 'wall3', add(lerp3(s.hipL, s.kneeL, 0.5), add(mul(cl, B.legR[0] * 1.6), mul(cf, -B.legR[0] * 1.0))), s.hips, [B.legR[0] * 1.3, B.legR[0] * 1.3, B.thigh * 1.0], cliff(63));
  }

  // --- GRIT, trickling off its raw side, and shaken off after the shudder ---
  {
    const n = 6;
    const after = m.t - SHUDDER;
    for (let i = 0; i < n; i++) {
      const ph = fr(m.t * 0.9 + i / n);
      const from = i % 3 === 0 ? s.shoulderL : i % 3 === 1 ? s.elbowL : lerp3(s.handL, s.elbowL, 0.3);
      const off: V3 = [(hash(i, 1, 81) - 0.5) * 10, (hash(i, 2, 81) - 0.2) * 12, 0];
      const p = add(add(from, off), [0, 0, -ph * ph * 60]);
      if (p[2] > 1) put('grit', 'grit', { k: 'mote', p, c: i % 2 ? RAW[2] : RAW[3], size: 2 });
    }
    if (after > 0 && after < 0.9) {
      for (let i = 0; i < 8; i++) {
        const from = i % 2 ? s.shoulderL : s.head;
        const off: V3 = [(hash(i, 3, 82) - 0.5) * 18, (hash(i, 4, 82) - 0.3) * 20, 0];
        const p = add(add(from, off), [0, 0, -after * after * 120 - hash(i, 5, 82) * 6]);
        if (p[2] > 1) put('grit', 'grit', { k: 'mote', p, c: i % 2 ? RAW[2] : RAW[3], size: 2 });
      }
    }
  }
  void rawSkin;
  return bits;
}

function len3(a: V3, b: V3): number {
  return Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
}

// ---------------------------------------------------------------------------------------------
// THE UNFINISHED AS A MONSTER OF THE BONES (its stand only, so far: the rest are its stand, not for use)

function ufMove(name: string, motion: Motion): MobMove {
  return { name, motion, rest: UF_REST };
}
function ufMob(look: UfLook): Mob {
  const stand = ufMove('stand', ufStand());
  return {
    id: look.fused ? 'unfinished-fused' : 'unfinished',
    name: 'The Unfinished',
    size: 'a boss: twice the Warden',
    build: B,
    stand,
    attack: stand,
    idleFrames: 24,
    idleFps: 10,
    walk: stand,
    walkFrames: 8,
    walkFps: 8,
    pace: 0.6,
    reel: stand,
    reelTime: 0.5,
    hit: 1,
    warn: 0.5,
    dieTime: 2,
    dying: stand,
    aura: { x: UF_CANVAS.ax, y: UF_CANVAS.ay - 120, r: 140, color: '#ff3a78', a: 0.18 },
    shadow: 64,
    canvas: UF_CANVAS,
    bits: (st, m) => ufBits(st, m, look),
  };
}
/** THE UNFINISHED, free of the wall (the fight's second half). */
export const UNFINISHED: Mob = ufMob({ fused: false });
/** THE UNFINISHED, still one with the wall (the fight's first half). */
export const UNFINISHED_FUSED: Mob = ufMob({ fused: true });

/** One picture of it standing, `t` seconds into its breath, as the game holds a figure (cut down, its lights in game pixels; no pool of light). */
export function unfinishedStanding(t: number, view: GameView = 'front', fused = false): Sprite {
  const mob = fused ? UNFINISHED_FUSED : UNFINISHED;
  const can = canvasOf(mob);
  return toSprite(paintMob(mob, 'stand', t, view, ENEMY_RIM), null, can.ax, can.ay);
}
/** The same, as painted (for the checks). */
export function unfinishedPainted(t: number, view: GameView = 'front', fused = false): Painted {
  return paintMob(fused ? UNFINISHED_FUSED : UNFINISHED, 'stand', t, view, ENEMY_RIM);
}

/** ITS BREATH'S ROUND, in seconds (for its frames). */
export const UF_BREATH = 2.4;

// ---------------------------------------------------------------------------------------------
// THE UNFINISHED AS THE CHECKS SEE IT (art/boss_checks.ts): its outside as solids.

export function ufShape(): BossShape {
  return {
    body: (s: Skeleton, q: Posed) => {
      void q;
      const [rH, rK, rA] = B.legR;
      const [r0, r1, r2] = B.armR;
      const limbs: CheckLimb[] = [
        { name: 'legL', a: s.hipL, b: s.kneeL, r: rH * 1.0 },
        { name: 'shinL', a: s.kneeL, b: s.ankleL, r: rK * 0.95 },
        { name: 'legR', a: s.hipR, b: s.kneeR, r: rH * 0.9 },
        { name: 'shinR', a: s.kneeR, b: s.ankleR, r: rK * 0.8 },
        { name: 'footL', a: s.heelL, b: s.toeL, r: rA * 0.6 },
        { name: 'footR', a: s.heelR, b: s.toeR, r: rA * 0.5 },
        { name: 'upperL', a: s.shoulderL, b: s.elbowL, r: r0 * 1.0 },
        { name: 'foreL', a: s.elbowL, b: s.handL, r: r1 * 1.1 },
        { name: 'upperR', a: s.shoulderR, b: s.elbowR, r: r0 * 0.9 },
        { name: 'foreR', a: s.elbowR, b: s.handR, r: r1 * 0.85 },
        { name: 'neck', a: s.neck, b: s.skull, r: B.headR[1] * 0.9 },
      ];
      const lumps: CheckLump[] = [
        { name: 'chest', c: chestOf(s), rot: s.chest, h: CR },
        { name: 'belly', c: lerp3(s.waist, s.ribs, 0.4), rot: s.belly, h: [B.waistDeep + 5, B.waistHalf + 6, B.ribs * 0.9] },
        { name: 'hips', c: add(s.pelvis, mul(s.hips[2], B.waist * 0.2)), rot: s.hips, h: [B.pelvisDeep + 4, B.pelvisHalf + 6, B.waist * 0.95] },
        { name: 'head', c: s.head, rot: s.face, h: [B.headR[0] * 1.25, B.headR[1] * 1.28, B.headR[2] * 1.2] },
      ];
      void r2;
      void rA;
      return { limbs, lumps };
    },
    low: { knee: B.legR[1], elbow: B.armR[1], hand: B.armR[2] },
  };
}
