// FLOOR 14'S MEDIUM MOB, THE PHYSICIAN'S ORDERLIES (the art chat for floors 11 to 15, 19 Oct 2026). A MOCK-UP: NOT IN THE
// GAME. Nothing of the game imports this file; `ORDERLIES_ON` is off. Their moves are art/orderlies_moves.ts; the mark of
// their blow on the floor, art/orderly_shots.ts.
//
// His doc "Wordsmith Act 2: The Hush" (the planning chat's, with his yes as ideas), level 14, THE HOUSE OF QUIET: “The
// city infirmary, where the Hushed are taken to be cured”; its enemies “Hushed patients who sit up in their beds as you
// pass, and the Physician's orderlies”; “the doctors aren't curing anyone. They draw out people's last words.” And his
// word to this chat of 18 Oct, 21:24 Pacific: “Hey go without my say so.  If something is shit I’ll get it to it but
// you’re doing a great jobs. At least for 11-15”. So their brief is this chat's, the picks it would have marked
// recommended, sent him with their films:
// - WHO THEY ARE: the Physician's orderlies, the House of Quiet's attendants in the Silent Order's service, who carry the
//   Hushed in and hold them down for him. Big, heavy men, a head over the knight, thick in the arm and the belly.
// - WHAT MARKS THEM: a long attendant's coat of grey-white canvas, buttoned high at the throat, its sleeves rolled to the
//   elbow over thick bare forearms; over it a heavy black apron of the Order's oilcloth from the chest to the shins; a
//   white linen cap and a gauze mask over the nose and mouth, tied behind with the Order's black cord, the cult's dull
//   pink in the eyes above it; a ring of iron keys at the belt; heavy boots. And THE QUIETING MALLET: a great wooden
//   mallet, a long ash handle and a head of dark lignum bound with two iron hoops, carried on the right shoulder.
// - THEIR BLOW, THE MALLET BLOW: the mallet lifted off the shoulder in both hands and raised high over the head, the
//   body arched back, its iron hoops glinting pink, held (the warning); then hips first, a step in, and brought down
//   before them with all their weight: it slams into the floor, dust and splinters thrown up, the boards cracked.
// - THEIR DEATH: rocked back, the mallet slipping from their hands; a lurching step to catch themselves; and they go
//   over forward like a felled tree, stiff, full length onto their face.
// And his words of 18 Oct on the act's enemies: Act 2's own, nothing of Act 1's.
//
// ON THE HEROES' BONES (art/skeleton.ts), as the carters are.

import { hash } from './kit';
import type { Ramp } from './kit';
import { FLAME } from './mkit';
import { sphere } from './new_mobs3';
import type { Bit, MobCanvas, Moment, Put } from './new_mobs3';
import { wornOn } from './skin';
import type { Ring, Skin, Stage } from './skin';
import { add, buildOf, cross, dot, elbowFor, len, lerp3, mul, norm, standing, sub } from './skeleton';
import type { Bones, Build, Key3, Motion, Posed, Skeleton, V3 } from './skeleton';

/** THE SWITCH, OFF. Nothing of the game reads this file. */
export const ORDERLIES_ON = { on: false };

const clamp01 = (v: number): number => Math.max(0, Math.min(1, v));

// =============================================================================================
// THEIR COLOURS: an attendant's canvas, the Order's black oilcloth, linen and gauze

const COAT: Ramp = ['#34363a', '#34363a', '#7a7e82', '#a2a6a8', '#b8bcbc'];
const APRON: Ramp = ['#0b0b0f', '#0b0b0f', '#22222a', '#383842', '#4c4c58'];
const LINEN: Ramp = ['#46463f', '#46463f', '#9c988c', '#c4c0b2', '#d4d0c2'];
/** Their skin: ruddy, the colour still in it (they are not the Hushed). */
const SKIN: Ramp = ['#38241e', '#38241e', '#765246', '#966a58', '#966a58'];
const TROUSER: Ramp = ['#18181a', '#18181a', '#323236', '#46464c', '#46464c'];
const BOOT: Ramp = ['#0c0b0b', '#0c0b0b', '#24201e', '#36302c', '#36302c'];
const CORD: Ramp = ['#0e0d12', '#0e0d12', '#26242c', '#36343e', '#36343e'];
const IRON: Ramp = ['#1a1c22', '#1a1c22', '#4a4f59', '#727884', '#8c929c'];
/** The mallet's hoops: black iron. */
const HOOP: Ramp = ['#121318', '#121318', '#2e3138', '#464a54', '#5a5e68'];
/** The mallet: its ash handle worn pale where it is gripped; its head of dark lignum. */
const ASH: Ramp = ['#2a2014', '#2a2014', '#6a5636', '#8c7450', '#9c845e'];
const LIGNUM: Ramp = ['#1a120c', '#1a120c', '#46301e', '#5e432a', '#6e5032'];
/** The floor's dust and splinters thrown up by the blow. */
const DUST = ['#aaa48e', '#c6bfa8', '#ddd6c0'];

// =============================================================================================
// THE BODY

/** A head over the knight (58), heavy in the shoulder, the arm and the belly. */
export const ORDERLY_BODY: Build = buildOf(66, 1.1, { shoulders: 1.16, chest: 1.12, depth: 1.12, waist: 1.18, hips: 1.06, arms: 1.06, trunk: 1.0, limbs: 1.12 });
const OB = ORDERLY_BODY;
/** Their picture: room for the mallet raised high, and for them lying full length before where they stood. */
export const ORDERLY_CANVAS: MobCanvas = { w: 400, h: 320, ax: 170, ay: 226 };

// =============================================================================================
// THE QUIETING MALLET

/** Its handle from the butt (behind the right hand) to its head's middle; its head's length (along `across`) and how thick it is round. */
export const MALLET = { butt: -6, neck: 27, head: 14, r: 4.6 } as const;
/** The mallet as it is at a moment: its butt, its neck (where the handle meets the head), the head's middle and its two faces. */
export function malletOf(s: Skeleton): { butt: V3; neck: V3; head: V3; faceA: V3; faceB: V3 } {
  const p = s.point;
  const a = norm(sub(s.across, mul(p, dot(s.across, p))), [0, 0, 1]);
  const head = add(s.handR, mul(p, MALLET.neck));
  return {
    butt: add(s.handR, mul(p, MALLET.butt)),
    neck: add(s.handR, mul(p, MALLET.neck - MALLET.r)),
    head,
    faceA: add(head, mul(a, MALLET.head / 2)),
    faceB: add(head, mul(a, -MALLET.head / 2)),
  };
}
/** THE MALLET: the ash handle, its butt knob; the lignum head, round, bound with two iron hoops near its faces; the hoops glinting pink as they raise it to strike (the warning). */
function mallet(put: Put, s: Skeleton, glint: number): void {
  const k = malletOf(s);
  put('mallet', 'mallet', { k: 'rod', a: k.butt, b: k.neck, ra: 1.0, rb: 1.2, ramp: ASH });
  put('mallet', 'mallet', { k: 'ball', c: k.butt, ax: sphere(1.3), skin: ASH });
  put('mallet', 'mallet', { k: 'rod', a: k.faceA, b: k.faceB, ra: MALLET.r, rb: MALLET.r, ramp: LIGNUM });
  for (const f of [0.14, 0.86]) {
    const c = lerp3(k.faceA, k.faceB, f);
    const d = norm(sub(k.faceA, k.faceB), [0, 0, 1]);
    put('hoops', 'mallet', { k: 'rod', a: add(c, mul(d, -0.45)), b: add(c, mul(d, 0.45)), ra: MALLET.r + 0.3, rb: MALLET.r + 0.3, ramp: HOOP });
  }
  if (glint > 0.05) for (const f of [0.14, 0.86]) put('glint', 'mallet', { k: 'glow', p: lerp3(k.faceA, k.faceB, f), c: FLAME[1], r: 3 + 3 * glint, a: 0.3 * glint });
}

// =============================================================================================
// THEM AS SOLIDS

/** How the figure's going drags what hangs off it. */
export function lagOf(m: Moment, k: number, most: number): V3 {
  const raw = mul(m.come, -k);
  const l = len(raw);
  return l > most ? mul(raw, most / l) : raw;
}
/** A canvas sleeve rolled to the elbow, the thick bare forearm, the big hand: closed round the mallet's handle, or half curled. */
function arm(put: Put, s: Skeleton, side: 'L' | 'R', cu: V3, curl: number): void {
  const sh = side === 'L' ? s.shoulderL : s.shoulderR;
  const el = side === 'L' ? s.elbowL : s.elbowR;
  const hand = side === 'L' ? s.handL : s.handR;
  const [r0, r1, r2] = OB.armR;
  const fore = norm(sub(hand, el), [0, 0, -1]);
  put(`arm${side}`, `arm${side}`, { k: 'ball', c: sh, ax: sphere(r0 * 1.26), skin: COAT, far: true });
  put(`arm${side}`, `arm${side}`, { k: 'rod', a: sh, b: el, ra: r0 * 1.22, rb: r1 * 1.25, ramp: COAT, far: true });
  // (the sleeve rolled up thick above the elbow)
  put(`arm${side}`, `roll${side}`, { k: 'rod', a: lerp3(sh, el, 0.72), b: lerp3(sh, el, 0.98), ra: r1 * 1.5, rb: r1 * 1.5, ramp: COAT, far: true });
  put(`fore${side}`, `fore${side}`, { k: 'ball', c: el, ax: sphere(r1 * 1.12), skin: SKIN, far: true });
  const wrist = add(hand, mul(fore, -1.3));
  put(`fore${side}`, `fore${side}`, { k: 'rod', a: el, b: wrist, ra: r1 * 1.18, rb: r2 * 1.08, ramp: SKIN, far: true });
  const e1 = norm(sub(cu, mul(fore, dot(cu, fore))), [0, 0, 1]);
  const e2 = norm(cross(fore, e1), [0, 1, 0]);
  put(`hand${side}`, `hand${side}`, { k: 'ball', c: add(hand, mul(fore, 0.4)), ax: [mul(fore, 2.0), mul(e2, 1.8), mul(e1, 1.2)], skin: SKIN, far: true });
  for (let i = 0; i < 4; i++) {
    const spread = (i - 1.5) * 0.38;
    const base = add(hand, add(mul(fore, 1.6), mul(e2, spread * 0.9)));
    const mid = add(base, add(mul(fore, 1.4 * (1 - 0.4 * curl)), mul(e1, -1.1 * curl)));
    const tip = add(mid, add(mul(fore, 1.0 * (1 - 0.8 * curl)), mul(e1, -1.4 * curl)));
    put(`hand${side}`, `finger${side}`, { k: 'rod', a: base, b: mid, ra: 0.62, rb: 0.54, ramp: SKIN, far: true });
    put(`hand${side}`, `finger${side}`, { k: 'rod', a: mid, b: tip, ra: 0.54, rb: 0.42, ramp: SKIN, far: true });
  }
}
/** A leg in dark trousers, a heavy boot. */
function leg(put: Put, s: Skeleton, side: 'L' | 'R'): void {
  const hip = side === 'L' ? s.hipL : s.hipR;
  const knee = side === 'L' ? s.kneeL : s.kneeR;
  const ankle = side === 'L' ? s.ankleL : s.ankleR;
  const heel = side === 'L' ? s.heelL : s.heelR;
  const toe = side === 'L' ? s.toeL : s.toeR;
  const [rH, rK, rA] = OB.legR;
  put(`leg${side}`, `leg${side}`, { k: 'rod', a: hip, b: knee, ra: rH * 1.08, rb: rK * 1.1, ramp: TROUSER, far: true });
  put(`leg${side}`, `leg${side}`, { k: 'ball', c: knee, ax: sphere(rK * 1.12), skin: TROUSER, far: true });
  put(`shin${side}`, `shin${side}`, { k: 'rod', a: knee, b: ankle, ra: rK * 1.08, rb: rA * 1.12, ramp: TROUSER, far: true });
  put(`shin${side}`, `boot${side}`, { k: 'rod', a: lerp3(knee, ankle, 0.62), b: ankle, ra: rA * 1.38, rb: rA * 1.16, ramp: BOOT, far: true });
  const fwd = norm(sub(toe, heel), [1, 0, 0]);
  const side3 = norm(Math.abs(fwd[2]) < 0.95 ? [-fwd[1], fwd[0], 0] : cross(s.hips[2], fwd), [0, 1, 0]);
  const up3 = norm(cross(fwd, side3), [0, 0, 1]);
  put(`foot${side}`, `foot${side}`, { k: 'ball', c: add(lerp3(heel, toe, 0.5), mul(up3, 1.9)), ax: [mul(fwd, 5.2), mul(side3, 2.4), mul(up3, 2.0)], skin: BOOT, far: true });
}
/** A ring round both thighs `down` of the way from the hips to the knees, hanging back as they go. */
function thighRing(s: Skeleton, down: number, pad: number, lag: V3): Ring {
  const f = norm([s.hips[0][0], s.hips[0][1], 0], [1, 0, 0]);
  const l: V3 = [-f[1], f[0], 0];
  const a = lerp3(s.hipL, s.kneeL, down);
  const b = lerp3(s.hipR, s.kneeR, down);
  const c = lerp3(a, b, 0.5);
  const spanF = Math.abs(dot(sub(a, b), f));
  const spanL = Math.abs(dot(sub(a, b), l));
  const rT = OB.legR[0] * 1.08;
  return { c: add(c, mul(lag, 0.7)), u: mul(f, Math.max(OB.pelvisDeep + 2.0, spanF / 2 + rT + 1.2) + pad), v: mul(l, Math.max(OB.pelvisHalf + 2.2, spanL / 2 + rT + 1.2) + pad) };
}
/** The torso as rings from the throat down to `hem`. */
function torsoRings(s: Skeleton, pad: number, hem: Ring): Ring[] {
  const [cf, cl, cu] = s.chest;
  const be = s.belly;
  const waistC = add(s.pelvis, mul(s.hips[2], OB.waist * 0.6));
  return [
    hem,
    { c: add(s.pelvis, mul(s.hips[2], -1.4)), u: mul(s.hips[0], OB.pelvisDeep + 2.2 + pad), v: mul(s.hips[1], OB.pelvisHalf + 2.4 + pad) },
    { c: waistC, u: mul(be[0], OB.waistDeep + 2.0 + pad), v: mul(be[1], OB.waistHalf + 1.8 + pad) },
    { c: s.ribs, u: mul(cf, OB.ribDeep + 1.9 + pad), v: mul(cl, OB.ribHalf + 2.0 + pad) },
    { c: lerp3(s.ribs, s.neck, 0.72), u: mul(cf, OB.ribDeep + 1.3 + pad), v: mul(cl, OB.shoulderHalf + 0.8 + pad) },
    { c: add(s.neck, mul(cu, 0.2)), u: mul(cf, 4.0 + pad * 0.5), v: mul(cl, 4.6 + pad * 0.5) },
  ];
}

/** THE HEAD: a broad ruddy face, a white linen cap, a gauze mask over the nose and mouth tied with the Order's black cord, the cult's dull pink in the eyes. */
function head(put: Put, st: Stage, s: Skeleton, lit: number, lag: V3): void {
  const [ff, fl, fu] = wornOn(st, s, 8);
  const hr: V3 = [OB.headR[0] * 1.02, OB.headR[1] * 1.12, OB.headR[2] * 0.98];
  const hc = add(s.head, mul(fu, -0.3));
  const skin: Skin = (u, tone) => {
    // heavy brows over deep-set eyes; stubble on the jaw below the mask
    if (u[0] > 0.6 && Math.abs(u[1]) < 0.62 && u[2] > 0.16 && u[2] < 0.28) return SKIN[Math.max(0, tone - 2)];
    if (u[2] < -0.45 && u[0] > -0.2 && hash(Math.floor(u[1] * 12 + 20), Math.floor(u[2] * 12 + 20), 7601) < 0.4) return SKIN[Math.max(0, tone - 1)];
    return SKIN[tone];
  };
  put('head', 'head', { k: 'ball', c: hc, ax: [mul(ff, hr[0]), mul(fl, hr[1]), mul(fu, hr[2])], skin });
  // the ears
  for (const k of [-1, 1]) put('head', 'ears', { k: 'ball', c: add(hc, add(mul(fl, k * hr[1] * 0.98), mul(fu, -hr[2] * 0.05))), ax: [mul(ff, 1.2), mul(fl, 0.6), mul(fu, 1.6)], skin: SKIN });
  // the linen cap, close over the crown
  put('hat', 'cap', { k: 'ball', c: add(hc, add(mul(fu, hr[2] * 0.32), mul(ff, -0.4))), ax: [mul(ff, hr[0] * 1.06), mul(fl, hr[1] * 1.06), mul(fu, hr[2] * 0.82)], skin: (u, tone) => (u[2] < -0.05 ? null : u[2] < 0.12 ? LINEN[Math.max(1, tone - 1)] : LINEN[tone]) });
  // THE GAUZE MASK over the nose and mouth, its cords round to the back of the head
  put('mask', 'gauze', {
    k: 'ball', c: add(hc, add(mul(ff, hr[0] * 0.32), mul(fu, -hr[2] * 0.36))), ax: [mul(ff, hr[0] * 0.78), mul(fl, hr[1] * 0.9), mul(fu, hr[2] * 0.5)],
    skin: (u, tone) => (u[0] < 0.1 || u[2] > 0.72 ? null : hash(Math.floor(u[1] * 9 + 9), Math.floor(u[2] * 9 + 9), 7602) < 0.18 ? LINEN[Math.max(1, tone - 1)] : LINEN[Math.min(4, tone + 1)]),
  });
  for (const k of [-1, 1]) {
    const a = add(hc, add(mul(ff, hr[0] * 0.5), add(mul(fl, k * hr[1] * 0.86), mul(fu, -hr[2] * 0.1))));
    const b = add(hc, add(mul(ff, -hr[0] * 0.92), add(mul(fl, k * hr[1] * 0.4), mul(fu, hr[2] * 0.05))));
    put('mask', 'cords', { k: 'rod', a, b, ra: 0.35, rb: 0.35, ramp: CORD });
  }
  const knot = add(hc, add(mul(ff, -hr[0] * 1.0), mul(fu, hr[2] * 0.05)));
  put('mask', 'cords', { k: 'rod', a: knot, b: add(add(knot, mul(fu, -3.2)), mul(lag, 0.5)), ra: 0.4, rb: 0.3, ramp: CORD });
  for (const k of [-1, 1]) {
    const e = add(hc, add(mul(ff, hr[0] * 0.92), add(mul(fl, k * hr[1] * 0.3), mul(fu, hr[2] * 0.08))));
    put('head', 'eyes', { k: 'dot', p: e, c: lit > 0.4 ? FLAME[1] : '#24181a', facing: ff });
  }
}

/** Where the ring of keys hangs at their left hip, and how it swings. */
function keys(put: Put, s: Skeleton, lag: V3, ph: number): void {
  const waistC = add(s.pelvis, mul(s.hips[2], OB.waist * 0.6));
  const hook = add(add(waistC, mul(s.belly[1], OB.waistHalf + 3.0)), mul(s.belly[0], -0.6));
  const ring = add(add(hook, [0, 0, -2.4]), mul(lag, 0.5));
  put('keys', 'keys', { k: 'band', ring: { c: ring, u: [1.5, 0, 0], v: [0, 0.6, 1.4] }, ramp: IRON, rows: 1 });
  for (let i = 0; i < 4; i++) {
    const a = (i - 1.5) * 0.5 + 0.2 * Math.sin(ph * 2 + i);
    const top = add(ring, [Math.sin(a) * 1.2, 0, -1.2]);
    put('keys', 'keys', { k: 'rod', a: top, b: add(add(top, [Math.sin(a) * 1.6, 0.3 * i - 0.5, -3.4]), mul(lag, 0.6)), ra: 0.35, rb: 0.3, ramp: IRON });
  }
}

/** What a moment of a move says over and above the bones: whether the mallet is still in their hands; how hard it has just struck the floor (0 not, 1 at its hardest). */
export interface OrderlySay {
  mallet: (m: Moment) => boolean;
  slam: (m: Moment) => number;
}
/** The dust and splinters at each moment, laid after their edge (Mob.grains). */
const GRAINS = new WeakMap<Moment, [V3, string, number][]>();
function orderlyBits(st: Stage, m: Moment, say: OrderlySay): Bit[] {
  const { s, q } = m;
  const bits: Bit[] = [];
  const grains: [V3, string, number][] = [];
  GRAINS.set(m, grains);
  const put: Put = (part, piece, shape) => bits.push({ part, piece, shape });
  const [cf, cl, cu] = s.chest;
  const lit = 1 - clamp01(q.out);
  const lag = lagOf(m, 1.5, 3.0);
  const ph = m.wind * Math.PI * 2;
  for (const side of ['L', 'R'] as const) leg(put, s, side);
  // THE ATTENDANT'S COAT, to the knee, buttoned high at the throat
  put('body', 'coat', { k: 'cloth', rings: torsoRings(s, 0.6, thighRing(s, 0.92, 1.2, lag)), ramp: COAT, look: { folds: [0, 30, -30, 70, -70, 120, -120, 160, -160], lift: 0.06 } });
  for (let i = 0; i < 4; i++) {
    const c = add(lerp3(s.neck, s.ribs, 0.12 + i * 0.26), mul(cf, OB.ribDeep + 2.2 - i * 0.2));
    put('body', 'buttons', { k: 'ball', c: add(c, mul(cl, -2.4)), ax: sphere(0.55), skin: LINEN });
  }
  // THE ORDER'S BLACK OILCLOTH APRON, from the chest to the shins, its bib and its strap round the neck
  {
    const f = norm([s.hips[0][0], s.hips[0][1], 0], [1, 0, 0]);
    const l: V3 = [-f[1], f[0], 0];
    const chest = add(lerp3(s.ribs, s.neck, 0.4), mul(cf, OB.ribDeep + 2.3));
    const waistC = add(s.pelvis, mul(s.hips[2], OB.waist * 0.6));
    const belly = add(waistC, mul(s.belly[0], OB.waistDeep + 2.6));
    const kneeMid = lerp3(s.kneeL, s.kneeR, 0.5);
    const shins = add(add(lerp3(kneeMid, lerp3(s.ankleL, s.ankleR, 0.5), 0.45), mul(f, OB.legR[1] + 2.6)), mul(lag, 0.6));
    const sheen = (a: number, b: number, front: boolean, tone: number): string => (!front ? APRON[Math.max(0, tone - 1)] : Math.abs(a - 0.25 + b * 0.2) < 0.08 ? APRON[Math.min(4, tone + 1)] : APRON[tone]);
    put('body', 'apron', { k: 'panel', c: add(lerp3(chest, belly, 0.5), mul(cf, 0.5)), u: mul(cl, OB.ribHalf * 0.8), v: mul(sub(chest, belly), 0.5), skin: sheen });
    put('body', 'apron', { k: 'panel', c: add(lerp3(belly, shins, 0.5), mul(f, 1.0)), u: mul(l, OB.waistHalf + 2.8), v: mul(sub(belly, shins), 0.5), skin: (a, b, front, tone) => (front && hash(Math.round(a * 5), Math.round(b * 7), 7603) > 0.93 ? '#4a4040' : sheen(a, b, front, tone)) });
    put('body', 'apron', { k: 'band', ring: { c: waistC, u: mul(s.belly[0], OB.waistDeep + 2.7), v: mul(s.belly[1], OB.waistHalf + 2.7) }, ramp: APRON, rows: 2 });
    for (const k of [-1, 1]) put('body', 'strap', { k: 'rod', a: add(chest, mul(cl, k * OB.ribHalf * 0.7)), b: add(add(s.neck, mul(cl, k * 2.6)), mul(cu, 0.6)), ra: 0.5, rb: 0.5, ramp: APRON });
  }
  keys(put, s, lag, ph);
  const held = say.mallet(m);
  arm(put, s, 'L', cu, held ? 1 : 0.4);
  arm(put, s, 'R', cu, held ? 1 : 0.4);
  put('neck', 'neck', { k: 'rod', a: add(s.neck, mul(cu, -1.5)), b: lerp3(s.neck, s.head, 0.5), ra: 3.4, rb: 3.0, ramp: SKIN });
  put('neck', 'collar', { k: 'band', ring: { c: add(s.neck, mul(cu, 0.6)), u: mul(cf, 4.2), v: mul(cl, 4.6) }, ramp: COAT, rows: 2 });
  head(put, st, s, lit, lag);
  // (painted even once dropped: as they die it falls from them as a piece of its own, Mob.fall)
  mallet(put, s, held ? clamp01(m.glint) : 0);
  // THE BLOW ON THE FLOOR: dust and splinters thrown up round the mallet's head
  const slam = clamp01(say.slam(m));
  if (slam > 0.02) {
    const k = malletOf(s);
    const low = k.faceA[2] < k.faceB[2] ? k.faceA : k.faceB;
    const at: V3 = [low[0], low[1], 0.6];
    for (let i = 0; i < 48; i++) {
      const a = i * 2.39996;
      const out = 3 + 22 * (1 - slam) * (0.5 + hash(i, 1, 7604));
      const up = 16 * Math.sin(Math.PI * Math.min(1, (1 - slam) * 1.3)) * hash(i, 2, 7604);
      grains.push([add(at, [Math.cos(a) * out, Math.sin(a) * out * 0.8, up]), i % 5 === 0 ? '#2a2016' : DUST[i % 3], slam > 0.5 && i % 3 === 0 ? 2 : 1]);
    }
  }
  return bits;
}

// =============================================================================================
// THEIR STAND

/** Their rest: heavy, wide-footed, a little stooped; the mallet carried on the right shoulder, its handle in the right hand before the chest; the left hand hanging, half closed. */
const REST0: Bones = {
  ...standing(OB),
  pz: -0.5, pitch: 4, bend: 6, roll: 1, side: 0, faceUp: 2, faceTilt: -3, faceTurn: 2,
  lfx: 1.4, lfy: 2.8, lft: 16, lk: 10, rfx: -1.2, rfy: -2.8, rft: -16, rk: -10,
  lhIn: 1, lhx: 3.0, lhy: 3.6, lhz: -21, le: -12,
  rhIn: 1, rhx: 7.0, rhy: 1.0, rhz: -7.0, wAz: 186, wEl: 48, wRoll: 0,
  pt: 0, out: 0,
} as Bones;
export const ORDERLY_REST: Bones = { ...REST0, re: elbowFor(OB, REST0 as Posed, false, norm([0.3, -0.8, -0.6])) };

/** Their stand: 3.2 s round. Planted, breathing heavily through the gauze; the head turning to watch; the mallet shifted on the shoulder once a round. */
export const ORDERLY_STAND_LONG = 3.2;
export function orderlyStand(): Motion {
  const R = ORDERLY_REST;
  const T = ORDERLY_STAND_LONG;
  const keys: Key3[] = [];
  const N = 32;
  for (let i = 0; i <= N; i++) {
    const t = (i / N) * T;
    const a = (t / T) * Math.PI * 2;
    const breath = Math.sin(a * 2 - 0.5);
    const shift = Math.max(0, Math.sin((a - 3.6) * 2.2)) * (a > 3.6 && a < 3.6 + Math.PI / 2.2 ? 1 : 0);
    keys.push({
      at: t,
      ease: 'lin',
      pose: {
        pz: R.pz + 0.8 * breath,
        py: 1.0 * Math.sin(a),
        roll: R.roll + 2.2 * Math.sin(a),
        bend: R.bend - 1.8 * breath,
        pitch: R.pitch + 1.2 * Math.sin(a + 1.2),
        faceUp: R.faceUp + 3 * Math.sin(a + 0.4),
        faceTurn: R.faceTurn + 16 * Math.sin(a + 0.8),
        rhz: R.rhz + 1.2 * shift + 0.4 * breath,
        wEl: (R.wEl as number) + 5 * shift,
        lhx: R.lhx + 0.8 * Math.sin(a + 2.0),
        lhz: R.lhz + 0.4 * breath,
      },
    });
  }
  return { loop: 0, keys };
}

/** THE ORDERLIES AS THE PAINTER TAKES THEM. */
export function orderlyPainter(say: OrderlySay): { bits: (st: Stage, m: Moment) => Bit[]; grains: (st: Stage, m: Moment) => ReadonlyArray<readonly [V3, string, number]> } {
  return { bits: (st, m) => orderlyBits(st, m, say), grains: (_st, m) => GRAINS.get(m) ?? [] };
}
