// FLOOR 14'S BOSS, THE PHYSICIAN (the art chat for floors 11 to 15, 19 Oct 2026). A MOCK-UP: NOT IN THE GAME. Nothing
// of the game imports this file; `PHYSICIAN_ON`, the switch the main chat would put him in by, is off. His moves are
// art/physician_moves.ts; what he throws and leaves on the floor, art/physician_shots.ts.
//
// His doc "Wordsmith Act 2: The Hush" (the planning chat's, with his yes as ideas), level 14, THE HOUSE OF QUIET:
// “Boss: The Physician. His floor is The Physician's Theatre. A beaked plague doctor with a quill-tipped syringe.” His
// moves there: “a rap with his cane (his basic attack); the Draw, a lunge that steals one of your words, which glows
// over his head until you beat it back out of him; Tonic, vials smashed on the floor that leave clouds of the Hush;
// Rounds, where the patients rise from their beds.” And the story: “the doctors aren't curing anyone. They draw out
// people's last words.”
//
// Made on his word to this chat of 18 Oct, 21:24 Pacific: “Hey go without my say so.  If something is shit I’ll get it
// to it but you’re doing a great jobs. At least for 11-15”. So his brief is this chat's, the picks it would have marked
// recommended, sent him as he is made:
// - SIZE AND BEARING: tall and thin, a head taller than the knight, long in the leg, stooped like a heron; precise and
//   unhurried, every move deliberate, then the sudden lunge of the Draw. (The Crier was stout and pompous, the
//   Palimpsest a lumbering giant: he is the third kind.)
// - HIS LOOK: a long black waxed coat to his shins, a short cape over his shoulders, a broad-brimmed black hat; the
//   beaked mask the plague doctors wore, here the Silent Order's blank bone-white, its long curved beak, two round
//   lenses of glass in it burning the enemy's pink; black gloves; a belt of tonic phials, pale green.
// - HIS CANE, in his right hand: black, a silver knob, a silver ferrule. HIS SYRINGE, in his left: a great glass
//   syringe in brass, its needle a sharpened quill; what it draws out burns pink in its barrel.
// - Nothing gory: he draws out words, not blood.
// And his words of 18 Oct on the act's enemies: Act 2's own, nothing of Act 1's (no cult robe, no bone, no violet).
//
// ON THE HEROES' BONES (art/skeleton.ts), as the Crier is: a monster of art/new_mobs3.ts's kind, on a canvas of his own.

import { hash } from './kit';
import type { Ramp } from './kit';
import { FLAME } from './mkit';
import { sphere } from './new_mobs3';
import type { Bit, MobCanvas, Moment, Put } from './new_mobs3';
import { wornOn } from './skin';
import type { Ring, Skin, Stage } from './skin';
import { add, buildOf, cross, dot, elbowFor, len, lerp3, mul, norm, standing, sub } from './skeleton';
import type { Bones, Build, Key3, Motion, Posed, Skeleton, V3 } from './skeleton';

/** THE SWITCH, OFF. Nothing of the game reads this file; the main chat puts him in by it, on the owner's yes. */
export const PHYSICIAN_ON = { on: false };

export const clamp01 = (v: number): number => Math.max(0, Math.min(1, v));
export const sm = (v: number): number => {
  const c = clamp01(v);
  return c * c * (3 - 2 * c);
};

// =============================================================================================
// HIS COLOURS: the Order's black, waxed; its blank bone-white; brass, glass, a quill

const COAT: Ramp = ['#0c0d10', '#0c0d10', '#262a30', '#3c424a', '#565d68'];
const CAPE: Ramp = ['#09090c', '#09090c', '#1d1e24', '#2e3038', '#3c3f48'];
const HAT: Ramp = ['#09090c', '#09090c', '#1e1e24', '#2f3038', '#3e4048'];
const BEAK: Ramp = ['#57534c', '#57534c', '#b4ae9f', '#d8d2c2', '#eae4d4'];
const GLOVE: Ramp = ['#110f0f', '#110f0f', '#2a2523', '#3e3633', '#3e3633'];
const TROUSER: Ramp = ['#0e0e11', '#0e0e11', '#24242a', '#34343c', '#34343c'];
const BOOT: Ramp = ['#0b0a0a', '#0b0a0a', '#221e1c', '#35302c', '#35302c'];
/** His cane: ebony; its knob and ferrule silver. */
const EBONY: Ramp = ['#0d0b0b', '#0d0b0b', '#2a2320', '#3e3530', '#4c423c'];
const SILVER: Ramp = ['#3a3c44', '#3a3c44', '#868a94', '#c0c4cc', '#dfe2e8'];
/** The syringe: its glass, its brass, the quill. */
const GLASS: Ramp = ['#36403c', '#36403c', '#84948a', '#bcc8c0', '#dce4dc'];
const BRASS: Ramp = ['#38280f', '#38280f', '#86622c', '#c09648', '#dcb866'];
const QUILL: Ramp = ['#5a564c', '#5a564c', '#b2aa96', '#dad2be', '#ece6d4'];
/** The belt of tonic phials: its leather, the pale green tonic. */
const STRAP: Ramp = ['#1a120e', '#1a120e', '#3a2a20', '#523c2c', '#523c2c'];
const TONIC: Ramp = ['#26301f', '#26301f', '#5a7048', '#86a066', '#a8c086'];

// =============================================================================================
// THE BODY

/** A head taller than the knight (58): 72 tall standing straight; thin, long in the leg and the arm. */
export const PH_BODY: Build = buildOf(72, 1.12, { shoulders: 0.94, chest: 0.92, depth: 0.92, waist: 0.86, hips: 0.92, legs: 1.08, arms: 1.1, trunk: 1.04, limbs: 0.84 });
const B = PH_BODY;
/** His picture: room for the Draw's lunge and the syringe held up over his head, and the cane swung high. */
export const PH_CANVAS: MobCanvas = { w: 440, h: 360, ax: 210, ay: 270 };

// =============================================================================================
// HIS CANE AND HIS SYRINGE

/** The cane in his right hand, from the hand along the weapon's way: its knob behind the hand, its ferrule at its end. */
export const CANE = { knob: -2.6, end: 32 } as const;
export function caneOf(s: Skeleton): { knob: V3; tip: V3 } {
  return { knob: add(s.handR, mul(s.point, CANE.knob)), tip: add(s.handR, mul(s.point, CANE.end)) };
}
/** The syringe in his left hand: its plunger's end behind the hand, the barrel before it, the quill beyond. */
export const SYRINGE = { back: -3.6, barrel: 12, quill: 10 } as const;
/** Which way the syringe points: along his left forearm (`cock` 0), or turned up toward the sky by `cock` (1: halfway, 2 and more: near upright, as he holds it at rest). */
export function syringeWay(s: Skeleton, cock = 1.6): V3 {
  const fore = norm(sub(s.handL, s.elbowL), [1, 0, 0]);
  const k = Math.min(1, cock / 2);
  return norm(add(add(mul(fore, 1 - k), mul(s.chest[2], k)), mul(s.chest[1], 0.18 * k)), fore);
}
export function syringeOf(s: Skeleton, cock = 1.6): { back: V3; mouth: V3; tip: V3; way: V3 } {
  const way = syringeWay(s, cock);
  const back = add(s.handL, mul(way, SYRINGE.back));
  const mouth = add(s.handL, mul(way, SYRINGE.barrel));
  return { back, mouth, tip: add(mouth, mul(way, SYRINGE.quill)), way };
}
/** Where a tonic phial hangs on his belt (0 to 4, round from his left hip to his right). */
export function phialOn(s: Skeleton, i: number): V3 {
  const waistC = add(s.pelvis, mul(s.hips[2], B.waist * 0.55));
  const a = -0.95 + i * 0.475;
  const out = add(mul(s.belly[0], Math.cos(a) * (B.waistDeep + 2.6)), mul(s.belly[1], Math.sin(a) * (B.waistHalf + 2.6)));
  return add(add(waistC, out), mul(s.belly[2], -1.6));
}

// =============================================================================================
// HIM AS SOLIDS

/** How his going drags what hangs off him. */
export function lagOf(m: Moment, k: number, most: number): V3 {
  const raw = mul(m.come, -k);
  const l = len(raw);
  return l > most ? mul(raw, most / l) : raw;
}
/** A coat sleeve from shoulder to wrist, a wide cuff, a black glove, its fingers closed round what it holds or half curled. */
function arm(put: Put, s: Skeleton, side: 'L' | 'R', cu: V3, curl: number): void {
  const sh = side === 'L' ? s.shoulderL : s.shoulderR;
  const el = side === 'L' ? s.elbowL : s.elbowR;
  const hand = side === 'L' ? s.handL : s.handR;
  const [r0, r1, r2] = B.armR;
  const fore = norm(sub(hand, el), [0, 0, -1]);
  put(`arm${side}`, `arm${side}`, { k: 'ball', c: sh, ax: sphere(r0 * 1.3), skin: COAT, far: true });
  put(`arm${side}`, `arm${side}`, { k: 'rod', a: sh, b: el, ra: r0 * 1.24, rb: r1 * 1.26, ramp: COAT, far: true });
  put(`fore${side}`, `fore${side}`, { k: 'ball', c: el, ax: sphere(r1 * 1.26), skin: COAT, far: true });
  const wrist = add(hand, mul(fore, -1.2));
  put(`fore${side}`, `fore${side}`, { k: 'rod', a: el, b: lerp3(el, wrist, 0.6), ra: r1 * 1.24, rb: r2 * 1.5, ramp: COAT, far: true });
  // the cuff, wide and turned back
  put(`fore${side}`, `cuff${side}`, { k: 'rod', a: lerp3(el, wrist, 0.58), b: wrist, ra: r2 * 1.75, rb: r2 * 1.85, ramp: COAT, far: true });
  const e1 = norm(sub(cu, mul(fore, dot(cu, fore))), [0, 0, 1]);
  const e2 = norm(cross(fore, e1), [0, 1, 0]);
  put(`hand${side}`, `hand${side}`, { k: 'ball', c: add(hand, mul(fore, 0.3)), ax: [mul(fore, 1.7), mul(e2, 1.45), mul(e1, 1.0)], skin: GLOVE, far: true });
  // long thin fingers
  for (let i = 0; i < 4; i++) {
    const spread = (i - 1.5) * 0.32;
    const base = add(hand, add(mul(fore, 1.3), mul(e2, spread * 0.85)));
    const mid = add(base, add(mul(fore, 1.5 * (1 - 0.4 * curl)), mul(e1, -1.1 * curl)));
    const tip = add(mid, add(mul(fore, 1.2 * (1 - 0.8 * curl)), mul(e1, -1.4 * curl)));
    put(`hand${side}`, `finger${side}`, { k: 'rod', a: base, b: mid, ra: 0.48, rb: 0.42, ramp: GLOVE, far: true });
    put(`hand${side}`, `finger${side}`, { k: 'rod', a: mid, b: tip, ra: 0.42, rb: 0.32, ramp: GLOVE, far: true });
  }
}
/** A long thin leg in black, a black boot to the calf. */
function leg(put: Put, s: Skeleton, side: 'L' | 'R'): void {
  const hip = side === 'L' ? s.hipL : s.hipR;
  const knee = side === 'L' ? s.kneeL : s.kneeR;
  const ankle = side === 'L' ? s.ankleL : s.ankleR;
  const heel = side === 'L' ? s.heelL : s.heelR;
  const toe = side === 'L' ? s.toeL : s.toeR;
  const [rH, rK, rA] = B.legR;
  put(`leg${side}`, `leg${side}`, { k: 'rod', a: hip, b: knee, ra: rH * 1.1, rb: rK * 1.12, ramp: TROUSER, far: true });
  put(`leg${side}`, `leg${side}`, { k: 'ball', c: knee, ax: sphere(rK * 1.14), skin: TROUSER, far: true });
  const shin = norm(sub(ankle, knee), [0, 0, -1]);
  put(`shin${side}`, `shin${side}`, { k: 'rod', a: knee, b: lerp3(knee, ankle, 0.45), ra: rK * 1.12, rb: rK * 1.08, ramp: TROUSER, far: true });
  put(`shin${side}`, `boot${side}`, { k: 'rod', a: lerp3(knee, ankle, 0.42), b: ankle, ra: rK * 1.22, rb: rA * 1.32, ramp: BOOT, far: true });
  void shin;
  const fwd = norm(sub(toe, heel), [1, 0, 0]);
  const side3 = norm(Math.abs(fwd[2]) < 0.95 ? [-fwd[1], fwd[0], 0] : cross(s.hips[2], fwd), [0, 1, 0]);
  const up3 = norm(cross(fwd, side3), [0, 0, 1]);
  // (narrow, pointed at the toe)
  put(`foot${side}`, `foot${side}`, { k: 'ball', c: add(lerp3(heel, toe, 0.52), mul(up3, 1.6)), ax: [mul(fwd, 5.2), mul(side3, 1.9), mul(up3, 1.7)], skin: BOOT, far: true });
}
/** The torso as rings from the throat down to the hips. */
function torsoRings(s: Skeleton, pad: number): Ring[] {
  const [cf, cl, cu] = s.chest;
  const be = s.belly;
  const waistC = add(s.pelvis, mul(s.hips[2], B.waist * 0.6));
  return [
    { c: add(s.pelvis, mul(s.hips[2], -0.6)), u: mul(s.hips[0], B.pelvisDeep + 2.0 + pad), v: mul(s.hips[1], B.pelvisHalf + 2.0 + pad) },
    { c: waistC, u: mul(be[0], B.waistDeep + 1.6 + pad), v: mul(be[1], B.waistHalf + 1.6 + pad) },
    { c: s.ribs, u: mul(cf, B.ribDeep + 1.7 + pad), v: mul(cl, B.ribHalf + 1.8 + pad) },
    { c: lerp3(s.ribs, s.neck, 0.72), u: mul(cf, B.ribDeep + 1.1 + pad), v: mul(cl, B.shoulderHalf + 0.6 + pad) },
    { c: add(s.neck, mul(cu, 0.3)), u: mul(cf, 3.4 + pad * 0.5), v: mul(cl, 3.8 + pad * 0.5) },
  ];
}
/** THE COAT'S SKIRTS, from the waist down past the knees to his shins, round both legs, hanging back as he goes. */
function coatSkirts(put: Put, s: Skeleton, lag: V3, ph: number): void {
  const f = norm([s.hips[0][0], s.hips[0][1], 0], [1, 0, 0]);
  const l: V3 = [-f[1], f[0], 0];
  const waistC = add(s.pelvis, mul(s.hips[2], B.waist * 0.55));
  const kneeMid = lerp3(s.kneeL, s.kneeR, 0.5);
  const shinL = lerp3(s.kneeL, s.ankleL, 0.6);
  const shinR = lerp3(s.kneeR, s.ankleR, 0.6);
  const shinMid = lerp3(shinL, shinR, 0.5);
  const spanF = Math.abs(dot(sub(shinL, shinR), f));
  const spanL = Math.abs(dot(sub(shinL, shinR), l));
  const hemC: V3 = [shinMid[0] + lag[0] * 1.2, shinMid[1] + lag[1] * 1.2, Math.max(1.2, shinMid[2] + 0.5)];
  const hemDeep = Math.max(B.pelvisDeep + 2.8, spanF / 2 + 3.0);
  const hemWide = Math.max(B.pelvisHalf + 2.6, spanL / 2 + 3.0);
  const hemPts: V3[] = [];
  for (let i = 0; i < 18; i++) {
    const a = (i / 18) * Math.PI * 2;
    const rear = Math.max(0, -Math.cos(a));
    const p = add(hemC, add(mul(f, Math.cos(a) * hemDeep), mul(l, Math.sin(a) * hemWide)));
    const q = add(p, add([0, 0, Math.sin(ph * 2 + a * 3) * 0.35], mul(lag, rear * 0.7)));
    hemPts.push([q[0], q[1], Math.max(0.8, q[2])]);
  }
  const rings: Ring[] = [
    { c: waistC, u: mul(s.belly[0], B.waistDeep + 2.0), v: mul(s.belly[1], B.waistHalf + 2.0) },
    { c: [s.pelvis[0], s.pelvis[1], s.pelvis[2] - 1.0], u: mul(f, B.pelvisDeep + 2.4), v: mul(l, B.pelvisHalf + 2.4) },
    { c: [kneeMid[0] * 0.55 + hemC[0] * 0.45, kneeMid[1] * 0.55 + hemC[1] * 0.45, Math.max(2, kneeMid[2])], u: mul(f, (B.pelvisDeep + 2.4 + hemDeep) / 2), v: mul(l, (B.pelvisHalf + 2.4 + hemWide) / 2) },
    { c: hemC, u: mul(f, hemDeep), v: mul(l, hemWide), pts: hemPts },
  ];
  put('coat', 'skirts', { k: 'cloth', rings, ramp: COAT, look: { folds: [0, 30, -30, 70, -70, 115, -115, 160, -160], lift: 0.07 } });
}

/** THE HEAD: the Order's black hood under a broad black hat, and the beaked mask of bone-white, its two round lenses burning pink. */
function head(put: Put, st: Stage, s: Skeleton, lit: number, hat: boolean): void {
  const [ff, fl, fu] = wornOn(st, s, 8);
  const hr: V3 = [B.headR[0], B.headR[1] * 1.05, B.headR[2]];
  const hc = add(s.head, mul(fu, -0.3));
  put('head', 'head', { k: 'ball', c: hc, ax: [mul(ff, hr[0]), mul(fl, hr[1]), mul(fu, hr[2])], skin: CAPE });
  put('hood', 'hood', {
    k: 'ball', c: add(hc, add(mul(ff, -0.8), mul(fu, 0.3))), ax: [mul(ff, hr[0] * 1.3), mul(fl, hr[1] * 1.36), mul(fu, hr[2] * 1.22)],
    skin: (u, tone) => (u[0] > 0.3 && Math.abs(u[1]) < 0.78 && u[2] < 0.6 ? null : CAPE[tone]),
  });
  // the mask's face, close over the hood's opening
  const mc = add(hc, add(mul(ff, hr[0] * 0.55), mul(fu, hr[2] * 0.0)));
  const skin: Skin = (u, tone) => (u[0] < 0.05 ? null : hash(Math.floor(u[1] * 8 + 9), Math.floor(u[2] * 8 + 9), 7601) < 0.08 ? BEAK[Math.max(1, tone - 1)] : BEAK[Math.min(4, tone + 1)]);
  put('mask', 'mask', { k: 'ball', c: mc, ax: [mul(ff, hr[0] * 0.84), mul(fl, hr[1] * 0.96), mul(fu, hr[2] * 1.0)], skin });
  // THE BEAK: long, curving down to its point, from the middle of the mask's face
  const root = add(mc, add(mul(ff, hr[0] * 0.66), mul(fu, -hr[2] * 0.18)));
  const mid = add(root, add(mul(ff, 7.4), mul(fu, -1.4)));
  const point = add(mid, add(mul(ff, 6.4), mul(fu, -3.6)));
  put('mask', 'beak', { k: 'rod', a: root, b: mid, ra: 2.8, rb: 1.75, ramp: BEAK });
  put('mask', 'beak', { k: 'rod', a: mid, b: point, ra: 1.75, rb: 0.45, ramp: BEAK });
  // its stitched seam along the top
  put('mask', 'beak', { k: 'rod', a: add(root, mul(fu, 2.0)), b: add(mid, mul(fu, 1.3)), ra: 0.32, rb: 0.3, ramp: ['#3a3630', '#3a3630', '#6a6458', '#8a8476', '#8a8476'] });
  // THE LENSES: two round glasses in brass rims, burning pink while he lives
  for (const k of [-1, 1]) {
    const e = add(mc, add(mul(ff, hr[0] * 0.7), add(mul(fl, k * hr[1] * 0.42), mul(fu, hr[2] * 0.22))));
    put('mask', 'rims', { k: 'ball', c: e, ax: [mul(ff, 0.9), mul(fl, 2.0), mul(fu, 2.0)], skin: BRASS });
    put('mask', 'lenses', { k: 'ball', c: add(e, mul(ff, 0.4)), ax: [mul(ff, 0.7), mul(fl, 1.5), mul(fu, 1.5)], skin: (_u, tone) => (lit > 0.4 ? FLAME[tone >= 3 ? 3 : 2] : ['#141218', '#1e1a22', '#2a2630', '#3a3540', '#4a4450'][tone]) });
    put('head', 'eyes', { k: 'dot', p: add(e, mul(ff, 0.95)), c: lit > 0.4 ? FLAME[1] : '#18141e', facing: ff });
  }
  if (hat) {
    // the hat: a low flat-topped crown, a broad stiff brim, a band
    const top = add(hc, mul(fu, hr[2] * 0.8));
    put('hat', 'hat', { k: 'ball', c: add(top, mul(fu, 1.4)), ax: [mul(ff, hr[0] * 1.0), mul(fl, hr[1] * 1.04), mul(fu, hr[2] * 0.62)], skin: (u, tone) => (u[2] < -0.3 ? null : Math.abs(u[2] + 0.12) < 0.1 ? STRAP[Math.min(3, tone)] : HAT[tone]) });
    put('hat', 'hat', { k: 'ball', c: add(top, mul(fu, -0.2)), ax: [mul(norm(add(ff, mul(fu, 0.12))), hr[0] * 2.15), mul(fl, hr[1] * 2.2), mul(fu, 0.45)], skin: HAT });
  }
}

/** What a moment of a move says over and above the bones. */
export interface PhysicianSay {
  /** Whether the cane is in his hand (painted always: as he dies it falls as a piece of its own). */
  cane: (m: Moment) => boolean;
  /** Where the syringe is: in his left hand, or (as he throws his Tonic) thrust in his belt. */
  syringe: (m: Moment) => 'hand' | 'belt';
  /** How far its plunger is drawn back (0 home, 1 all the way), and how full its barrel is of what it drew (0 to 1). */
  plunger: (m: Moment) => number;
  fill: (m: Moment) => number;
  /** How many tonic phials are in his left hand (as he throws his Tonic), and how many are left on his belt. */
  inHand: (m: Moment) => number;
  onBelt: (m: Moment) => number;
  hat: (m: Moment) => boolean;
  /** How the syringe is cocked at the wrist. */
  cock: (m: Moment) => number;
  /** What glints pink through a warning: the cane's ferrule (his rap) or the syringe's quill (the Draw). */
  glintOn: (m: Moment) => 'cane' | 'syringe';
  /** Grains of the moment: dust where the cane rapped, the words going free as he dies. */
  grains?: (m: Moment, out: [V3, string, number][]) => void;
}
/** The grains at each moment, laid after his edge (Mob.grains). */
const GRAINS = new WeakMap<Moment, [V3, string, number][]>();
function physicianBits(st: Stage, m: Moment, say: PhysicianSay): Bit[] {
  const { s, q } = m;
  const bits: Bit[] = [];
  const grains: [V3, string, number][] = [];
  GRAINS.set(m, grains);
  const put: Put = (part, piece, shape) => bits.push({ part, piece, shape });
  const [cf, cl, cu] = s.chest;
  const lit = 1 - clamp01(q.out);
  const lag = lagOf(m, 1.4, 3.0);
  for (const side of ['L', 'R'] as const) leg(put, s, side);
  // THE LONG WAXED COAT: its body, its skirts to his shins; a row of buttons down its front
  put('body', 'coat', { k: 'cloth', rings: torsoRings(s, 0.5), ramp: COAT, look: { folds: [0, 40, -40, 100, -100, 160, -160], lift: 0.05 } });
  coatSkirts(put, s, lag, m.t * 3);
  for (let i = 0; i < 4; i++) {
    const c = add(lerp3(s.ribs, s.neck, 0.55 - i * 0.28), mul(cf, B.ribDeep + 2.1 - i * 0.15));
    put('body', 'buttons', { k: 'ball', c, ax: sphere(0.55), skin: SILVER });
  }
  // THE BELT OF TONIC PHIALS
  const waistC = add(s.pelvis, mul(s.hips[2], B.waist * 0.55));
  put('body', 'belt', { k: 'band', ring: { c: waistC, u: mul(s.belly[0], B.waistDeep + 2.4), v: mul(s.belly[1], B.waistHalf + 2.4) }, ramp: STRAP, rows: 2 });
  const left = say.onBelt(m);
  for (let i = 0; i < 5; i++) {
    if (i >= left) continue;
    const c = phialOn(s, i);
    put('body', 'phials', { k: 'rod', a: add(c, mul(s.belly[2], -1.6)), b: add(c, mul(s.belly[2], 1.4)), ra: 0.95, rb: 0.95, ramp: TONIC });
    put('body', 'phials', { k: 'ball', c: add(c, mul(s.belly[2], 1.8)), ax: sphere(0.6), skin: EBONY });
  }
  // THE SHORT CAPE over his shoulders
  {
    const top: Ring = { c: add(s.neck, mul(cu, -0.1)), u: mul(cf, 3.8), v: mul(cl, 4.4) };
    const mid: Ring = { c: add(lerp3(s.ribs, s.neck, 0.72), mul(cu, 0.5)), u: mul(cf, B.ribDeep + 2.8), v: mul(cl, B.shoulderHalf + 2.6) };
    const hem: Ring = { c: add(lerp3(s.ribs, s.neck, 0.3), add(mul(cf, -0.5), mul(lag, 0.5))), u: mul(cf, B.ribDeep + 3.2), v: mul(cl, B.shoulderHalf + 3.2) };
    put('cape', 'cape', { k: 'cloth', rings: [top, mid, hem], ramp: CAPE, look: { folds: [40, -40, 110, -110, 170, -170], lift: 0.08 } });
  }
  arm(put, s, 'L', cu, say.syringe(m) === 'hand' || say.inHand(m) > 0 ? 1 : 0.5);
  arm(put, s, 'R', cu, say.cane(m) ? 1 : 0.5);
  put('neck', 'neck', { k: 'rod', a: add(s.neck, mul(cu, -1.4)), b: lerp3(s.neck, s.head, 0.5), ra: 2.6, rb: 2.4, ramp: CAPE });
  // (the hat, the cane and the syringe are painted even once they are gone from him: as he dies each falls as a piece of its own, Mob.fall)
  head(put, st, s, lit, true);
  // THE CANE, in his right hand
  {
    const c = caneOf(s);
    put('cane', 'cane', { k: 'rod', a: c.knob, b: c.tip, ra: 0.75, rb: 0.6, ramp: EBONY });
    put('cane', 'cane', { k: 'ball', c: c.knob, ax: sphere(1.25), skin: SILVER });
    put('cane', 'cane', { k: 'rod', a: add(c.tip, mul(s.point, -1.6)), b: c.tip, ra: 0.72, rb: 0.6, ramp: SILVER });
    const glint = say.glintOn(m) === 'cane' ? clamp01(m.glint) : 0;
    if (glint > 0.05) put('cane', 'glint', { k: 'glow', p: c.tip, c: FLAME[1], r: 5 + 5 * glint, a: 0.45 * glint });
  }
  // THE SYRINGE: in his left hand, or thrust in his belt at his left hip
  {
    const where = say.syringe(m);
    let back: V3;
    let way: V3;
    if (where === 'hand') {
      const sy = syringeOf(s, say.cock(m));
      back = sy.back;
      way = sy.way;
    } else {
      // (through the belt at the left hip, the quill down)
      const hip = add(add(waistC, mul(s.belly[1], B.waistHalf + 3.0)), mul(s.belly[0], -0.6));
      way = norm(add(mul(s.belly[2], -1), mul(s.belly[0], 0.35)), [0, 0, -1]);
      back = add(hip, mul(way, -6));
    }
    const mouth = add(back, mul(way, SYRINGE.barrel - SYRINGE.back));
    const tip = add(mouth, mul(way, SYRINGE.quill));
    const draw = clamp01(say.plunger(m));
    const fill = clamp01(say.fill(m));
    // the plunger: its rod out behind the barrel as far as it is drawn, its ring for the thumb
    const ring = add(back, mul(way, -1.4 - 5.5 * draw));
    put('syringe', 'syringe', { k: 'rod', a: ring, b: add(back, mul(way, 1.2)), ra: 0.42, rb: 0.42, ramp: BRASS });
    put('syringe', 'syringe', { k: 'ball', c: ring, ax: sphere(1.0), skin: BRASS });
    // the barrel: its brass ends, its glass, and in it what it has drawn, burning pink
    const bLen = SYRINGE.barrel - SYRINGE.back - 1.6;
    const b0 = add(back, mul(way, 0.8));
    const b1 = add(b0, mul(way, bLen));
    put('syringe', 'syringe', { k: 'rod', a: add(back, mul(way, -0.2)), b: b0, ra: 2.2, rb: 2.2, ramp: BRASS });
    const split = add(b1, mul(way, -bLen * fill));
    if (fill > 0.04) put('syringe', 'drawn', { k: 'rod', a: split, b: b1, ra: 1.85, rb: 1.85, ramp: FLAME });
    if (fill < 0.96) put('syringe', 'syringe', { k: 'rod', a: b0, b: split, ra: 1.85, rb: 1.85, ramp: GLASS });
    put('syringe', 'syringe', { k: 'rod', a: b1, b: mouth, ra: 2.2, rb: 1.0, ramp: BRASS });
    // the quill: its shaft sharpened to a nib, a short vane of feather at its root
    put('syringe', 'syringe', { k: 'rod', a: mouth, b: tip, ra: 0.7, rb: 0.2, ramp: QUILL });
    const side = norm(cross(way, cu), [0, 1, 0]);
    put('syringe', 'syringe', { k: 'rod', a: add(mouth, mul(way, 0.6)), b: add(add(mouth, mul(way, 4.2)), mul(side, 1.7)), ra: 0.65, rb: 0.25, ramp: QUILL });
    const glint = say.glintOn(m) === 'syringe' ? clamp01(m.glint) : 0;
    if (glint > 0.05) put('syringe', 'glint', { k: 'glow', p: tip, c: FLAME[1], r: 5 + 5 * glint, a: 0.45 * glint });
    if (fill > 0.04) put('syringe', 'glow', { k: 'glow', p: lerp3(split, b1, 0.5), c: FLAME[1], r: 6 + 5 * fill, a: 0.3 * fill });
  }
  // THE PHIALS IN HIS HAND, as he throws his Tonic
  const n = say.inHand(m);
  if (n > 0) {
    const fore = norm(sub(s.handL, s.elbowL), [0, 0, 1]);
    for (let i = 0; i < n; i++) {
      const c = add(add(s.handL, mul(fore, 1.6)), mul(cl, (i - (n - 1) / 2) * 1.4));
      put('handL', 'phials', { k: 'rod', a: add(c, mul(fore, -1.6)), b: add(c, mul(fore, 2.6)), ra: 1.15, rb: 1.15, ramp: TONIC });
      put('handL', 'phials', { k: 'ball', c: add(c, mul(fore, 3.0)), ax: sphere(0.7), skin: EBONY });
    }
  }
  say.grains?.(m, grains);
  return bits;
}

// =============================================================================================
// HIS STAND

/** His rest: tall, stooped forward a little from the shoulders, the cane planted before his right foot, the syringe held up in his left hand, its quill toward the sky; his beaked head lowered, watching. */
const REST0: Bones = {
  ...standing(B),
  pz: -0.4, pitch: 5, bend: 9, roll: 0, side: 0, faceUp: 2, faceTilt: 0, faceTurn: 0,
  lfx: 1.6, lfy: 2.2, lft: 12, lk: 6, rfx: -0.8, rfy: -2.2, rft: -12, rk: -6,
  lhIn: 1, lhx: 10.5, lhy: 2.6, lhz: -16, le: -40,
  rhIn: 1, rhx: 8.5, rhy: -6.0, rhz: -24, wAz: -14, wEl: -72, wRoll: 0,
  pt: 0, out: 0,
} as Bones;
export const PH_REST: Bones = {
  ...REST0,
  le: elbowFor(B, REST0 as Posed, true, norm([-0.2, 0.75, -0.6])),
  re: elbowFor(B, REST0 as Posed, false, norm([-0.4, -0.75, -0.5])),
};

/** His stand: 3.2 s round. Still, upright over his cane; his beaked head cocking this way and that, as a bird's does; once a round he taps the syringe's barrel with a finger. */
export const PH_STAND_LONG = 3.2;
export function physicianStand(): Motion {
  const R = PH_REST;
  const T = PH_STAND_LONG;
  const keys: Key3[] = [];
  const N = 32;
  for (let i = 0; i <= N; i++) {
    const t = (i / N) * T;
    const a = (t / T) * Math.PI * 2;
    const breath = Math.sin(a * 2 - 0.5);
    // (the head held still, then turned sharply, held, and back: a bird's)
    const turn = 22 * Math.tanh(3 * Math.sin(a + 0.6));
    const cockT = 10 * Math.tanh(3 * Math.sin(a * 2 + 1.4));
    keys.push({
      at: t,
      ease: 'lin',
      pose: {
        pz: R.pz + 0.9 * breath,
        py: 1.3 * Math.sin(a),
        roll: R.roll + 2.2 * Math.sin(a),
        bend: R.bend - 2.0 * breath,
        pitch: R.pitch + 0.8 * Math.sin(a + 1.2),
        faceUp: R.faceUp + 3 * Math.sin(a * 2 + 0.4),
        faceTurn: R.faceTurn + turn,
        faceTilt: R.faceTilt + cockT,
        lhz: R.lhz + 0.5 * breath,
        lhx: R.lhx + 0.3 * Math.sin(a),
      },
    });
  }
  return { loop: 0, keys };
}

/** HIM AS THE PAINTER TAKES HIM. */
export function physicianPainter(say: PhysicianSay): { bits: (st: Stage, m: Moment) => Bit[]; grains: (st: Stage, m: Moment) => ReadonlyArray<readonly [V3, string, number]> } {
  return { bits: (st, m) => physicianBits(st, m, say), grains: (_st, m) => GRAINS.get(m) ?? [] };
}
