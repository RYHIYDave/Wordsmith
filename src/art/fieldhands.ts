// FLOOR 13'S SMALL MOB, THE HUSHED WORKING THE FIELDS (the art chat for floors 11 to 15, 19 Oct 2026). A MOCK-UP: NOT IN
// THE GAME. Nothing of the game imports this file; `FIELDHANDS_ON` is off. Their moves are art/fieldhands_moves.ts.
//
// His doc "Wordsmith Act 2: The Hush" (the planning chat's, with his yes as ideas), level 13, THE MILLRACE: its enemies
// “the Silent Order's carters, and the Hushed working the fields”; “fields left overgrown through the siege”. And his
// word to this chat of 18 Oct, 21:24 Pacific: “Hey go without my say so.  If something is shit I’ll get it to it but
// you’re doing a great jobs. At least for 11-15”. So their brief is this chat's, the picks it would have marked
// recommended, sent him with their films:
// - WHO THEY ARE: the Hushed (floor 11's, art/hushed.ts, his picks: “The Hush leaking out”, “Shuffle, then lunge and grab
//   (Recommended)”, “The Hush leaves them (Recommended)”), here the farm folk outside the walls, still working the fields
//   the siege left to go over: they reap and reap at nothing, their sickles going, their mouths working on words that
//   make no sound, the Hush leaking out of them. Two of them, for a gang: a REAPER (a countryman's long smock-frock of
//   oatmeal linen to his knees, a battered straw hat, leggings bound with cord, a neckerchief) and a GLEANER (a deep
//   sunbonnet, a russet bodice, her sleeves rolled, a long skirt and a sacking apron). Grown men and women, no child.
// - THEIR BLOW, THE SICKLE SLASH: the sickle raised high over the right shoulder, its blade glinting the enemy's pink,
//   held shaking (the warning); then a step in and a slash down and across before them, right to left; a follow-through
//   low to the left; back to their reaping.
// - THEIR DEATH: as floor 11's Hushed, his pick, “The Hush leaves them”: a gasp, the head thrown back, the Hush pouring
//   up out of them in one great grey breath; the sickle drops; their knees give and they slump forward, people again.
// And his words of 18 Oct on the act's enemies: Act 2's own, nothing of Act 1's.
//
// ON THE HEROES' BONES (art/skeleton.ts), as floor 11's Hushed are, whose body, skin and breath they share.

import { HUSH } from './crier';
import { BREATH_PALE, GREY_HAIR, HAIR, HUSHED_BODY, HUSHED_REST, INKBLOT, SKIN, hushBreath, hushLeaves, lagOf } from './hushed';
import { INK, hash } from './kit';
import type { Ramp } from './kit';
import { FLAME } from './mkit';
import { sphere } from './new_mobs3';
import type { Bit, MobCanvas, Moment, Put } from './new_mobs3';
import { wornOn } from './skin';
import type { Ring, Skin, Stage } from './skin';
import { add, cross, dot, lerp3, mul, norm, sub } from './skeleton';
import type { Bones, Key3, Motion, Skeleton, V3 } from './skeleton';

/** THE SWITCH, OFF. Nothing of the game reads this file. */
export const FIELDHANDS_ON = { on: false };

const fr = (t: number): number => t - Math.floor(t);
const clamp01 = (v: number): number => Math.max(0, Math.min(1, v));
void HUSH;
void BREATH_PALE;

// =============================================================================================
// THEIR COLOURS: country working clothes, faded by the sun and dulled by the dusk

/** The reaper's smock-frock: oatmeal linen. */
const FROCK: Ramp = ['#2e2a22', '#2e2a22', '#6e6650', '#968c70', '#968c70'];
/** His straw hat, old and grey; the gleaner's sunbonnet, faded madder. */
const STRAW: Ramp = ['#2e2618', '#2e2618', '#6e5e3a', '#948050', '#a8925e'];
const BONNET: Ramp = ['#2a1a1a', '#2a1a1a', '#5e3c38', '#7e5650', '#7e5650'];
/** Leggings bound with cord; boots. */
const LEGGING: Ramp = ['#1e1c18', '#1e1c18', '#443e34', '#5c5446', '#5c5446'];
const BOOT: Ramp = ['#100e0c', '#100e0c', '#2c241e', '#40362c', '#40362c'];
const CORD: Ramp = ['#2a2418', '#2a2418', '#5a4c32', '#74643e', '#74643e'];
/** The neckerchief, a faded red. */
const NECKER: Ramp = ['#2e1414', '#2e1414', '#5e2a28', '#7a3a34', '#7a3a34'];
/** The gleaner's russet bodice and skirt, her sacking apron, her shift's sleeves. */
const RUSSET: Ramp = ['#2a1810', '#2a1810', '#5c3a24', '#7a5032', '#7a5032'];
const SKIRT: Ramp = ['#1e1a20', '#1e1a20', '#443c46', '#5c5260', '#5c5260'];
const SACKING: Ramp = ['#30281c', '#30281c', '#6a5a40', '#8a7854', '#8a7854'];
const SHIFT: Ramp = ['#3a362e', '#3a362e', '#7e7866', '#a49c86', '#a49c86'];
/** The sickle: an ash handle worn dark; its iron blade. */
const HANDLE: Ramp = ['#22180e', '#22180e', '#56402a', '#74583a', '#74583a'];
const IRON: Ramp = ['#1a1c22', '#1a1c22', '#4e535d', '#7a808c', '#9aa0aa'];

// =============================================================================================
// THE BODY: floor 11's Hushed

export const FH_BODY = HUSHED_BODY;
const HB = FH_BODY;
/** Their picture: room for the sickle raised over the shoulder and slashed out before them. */
export const FH_CANVAS: MobCanvas = { w: 240, h: 220, ax: 120, ay: 160 };

/** Who: a reaper, a gleaner. */
export type FieldhandWho = 'reaper' | 'gleaner';

// =============================================================================================
// THE SICKLE

/** Its handle from the butt (in the hand) to where the blade is set; the blade's curve. */
export const SICKLE = { butt: -2.0, handle: 7.5, r: 5.2, sweep: 1.18 } as const;
/** The sickle as it is at a moment: the handle from butt to where the blade is set, the blade's points from there round its crescent to its tip, its glint point (its middle). */
export function sickleOf(s: Skeleton): { butt: V3; top: V3; blade: V3[]; tip: V3; mid: V3 } {
  const p = s.point;
  const a = norm(sub(s.across, mul(p, dot(s.across, p))), [0, 0, 1]);
  const butt = add(s.handR, mul(p, SICKLE.butt));
  const top = add(s.handR, mul(p, SICKLE.handle));
  const blade: V3[] = [];
  const N = 9;
  for (let i = 0; i <= N; i++) {
    const th = (i / N) * Math.PI * SICKLE.sweep;
    blade.push(add(top, add(mul(a, SICKLE.r * (1 - Math.cos(th))), mul(p, SICKLE.r * 0.95 * Math.sin(th)))));
  }
  return { butt, top, blade, tip: blade[N], mid: blade[Math.round(N / 2)] };
}
/** THE SICKLE: the worn handle, an iron ferrule, the crescent blade tapering to its point; a pink glint along it as they raise it to strike (the warning). */
function sickle(put: Put, s: Skeleton, glint: number): void {
  const k = sickleOf(s);
  put('sickle', 'sickle', { k: 'rod', a: k.butt, b: k.top, ra: 0.75, rb: 0.65, ramp: HANDLE });
  put('sickle', 'sickle', { k: 'rod', a: add(k.top, mul(s.point, -1.0)), b: add(k.top, mul(s.point, 0.4)), ra: 0.85, rb: 0.8, ramp: IRON });
  for (let i = 0; i + 1 < k.blade.length; i++) {
    const r0 = 0.8 - 0.06 * i;
    put('sickle', 'sickle', { k: 'rod', a: k.blade[i], b: k.blade[i + 1], ra: Math.max(0.3, r0), rb: Math.max(0.22, r0 - 0.06), ramp: IRON });
  }
  if (glint > 0.05) put('glint', 'sickle', { k: 'glow', p: k.mid, c: FLAME[1], r: 5 + 5 * glint, a: 0.45 * glint });
}

// =============================================================================================
// THEM AS SOLIDS (as floor 11's Hushed, in their country clothes)

/** A sleeve or a bare arm from shoulder to wrist, and the hand: closed round the sickle, or its fingers half curled. */
function arm(put: Put, s: Skeleton, side: 'L' | 'R', upper: Ramp, lower: Ramp, cuff: Ramp | null, grip: number, cu: V3): void {
  const sh = side === 'L' ? s.shoulderL : s.shoulderR;
  const el = side === 'L' ? s.elbowL : s.elbowR;
  const hand = side === 'L' ? s.handL : s.handR;
  const [r0, r1, r2] = HB.armR;
  const fore = norm(sub(hand, el), [0, 0, -1]);
  put(`arm${side}`, `arm${side}`, { k: 'ball', c: sh, ax: sphere(r0 * 1.15), skin: upper, far: true });
  put(`arm${side}`, `arm${side}`, { k: 'rod', a: sh, b: el, ra: r0 * 1.12, rb: r1 * 1.1, ramp: upper, far: true });
  put(`fore${side}`, `fore${side}`, { k: 'ball', c: el, ax: sphere(r1 * 1.1), skin: upper, far: true });
  const wrist = add(hand, mul(fore, -1.2));
  put(`fore${side}`, `fore${side}`, { k: 'rod', a: el, b: wrist, ra: r1 * 1.06, rb: r2 * 1.1, ramp: lower, far: true });
  if (cuff) put(`fore${side}`, `cuff${side}`, { k: 'rod', a: lerp3(el, wrist, 0.05), b: lerp3(el, wrist, 0.3), ra: r1 * 1.3, rb: r1 * 1.3, ramp: cuff, far: true });
  const e1 = norm(sub(cu, mul(fore, dot(cu, fore))), [0, 0, 1]);
  const e2 = norm(cross(fore, e1), [0, 1, 0]);
  put(`hand${side}`, `hand${side}`, { k: 'ball', c: add(hand, mul(fore, 0.4)), ax: [mul(fore, 1.7), mul(e2, 1.5), mul(e1, 0.9)], skin: SKIN, far: true });
  for (let i = 0; i < 4; i++) {
    const spread = (i - 1.5) * 0.3;
    const base = add(hand, add(mul(fore, 1.4), mul(e2, spread * 0.85)));
    const mid = add(base, add(mul(fore, 1.3 * (1 - 0.5 * grip)), mul(e1, -0.9 - 0.4 * grip)));
    const tip = add(mid, add(mul(fore, 0.9 * (1 - 0.8 * grip)), mul(e1, -1.2 - 0.3 * grip)));
    put(`hand${side}`, `finger${side}`, { k: 'rod', a: base, b: mid, ra: 0.5, rb: 0.42, ramp: SKIN, far: true });
    put(`hand${side}`, `finger${side}`, { k: 'rod', a: mid, b: tip, ra: 0.42, rb: 0.3, ramp: SKIN, far: true });
  }
}
/** A leg: leggings bound criss-cross with cord, a heavy boot. */
function leg(put: Put, s: Skeleton, side: 'L' | 'R', upper: Ramp): void {
  const hip = side === 'L' ? s.hipL : s.hipR;
  const knee = side === 'L' ? s.kneeL : s.kneeR;
  const ankle = side === 'L' ? s.ankleL : s.ankleR;
  const heel = side === 'L' ? s.heelL : s.heelR;
  const toe = side === 'L' ? s.toeL : s.toeR;
  const [rH, rK, rA] = HB.legR;
  put(`leg${side}`, `leg${side}`, { k: 'rod', a: hip, b: knee, ra: rH * 1.08, rb: rK * 1.08, ramp: upper, far: true });
  put(`leg${side}`, `leg${side}`, { k: 'ball', c: knee, ax: sphere(rK * 1.1), skin: upper, far: true });
  put(`shin${side}`, `shin${side}`, { k: 'rod', a: knee, b: ankle, ra: rK * 1.06, rb: rA * 1.15, ramp: LEGGING, far: true });
  for (let i = 1; i <= 3; i++) {
    const c = lerp3(knee, ankle, i / 4);
    put(`shin${side}`, `cord${side}`, { k: 'rod', a: add(c, [0, 0, -0.35]), b: add(c, [0, 0, 0.35]), ra: rK * 1.16 - 0.06 * i, rb: rK * 1.16 - 0.06 * i, ramp: CORD, far: true });
  }
  const fwd = norm(sub(toe, heel), [1, 0, 0]);
  const side3 = norm(Math.abs(fwd[2]) < 0.95 ? [-fwd[1], fwd[0], 0] : cross(s.hips[2], fwd), [0, 1, 0]);
  const up3 = norm(cross(fwd, side3), [0, 0, 1]);
  put(`foot${side}`, `foot${side}`, { k: 'ball', c: add(lerp3(heel, toe, 0.5), mul(up3, 1.6)), ax: [mul(fwd, 4.9), mul(side3, 2.2), mul(up3, 1.7)], skin: BOOT, far: true });
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
  const rT = HB.legR[0] * 1.08;
  return { c: add(c, mul(lag, 0.7)), u: mul(f, Math.max(HB.pelvisDeep + 1.8, spanF / 2 + rT + 1.0) + pad), v: mul(l, Math.max(HB.pelvisHalf + 2.0, spanL / 2 + rT + 1.0) + pad) };
}
/** The torso from the throat down to `hem`. */
function torsoRings(s: Skeleton, pad: number, hem: Ring | null): Ring[] {
  const [cf, cl, cu] = s.chest;
  const be = s.belly;
  const waistC = add(s.pelvis, mul(s.hips[2], HB.waist * 0.6));
  const rings: Ring[] = [];
  if (hem) rings.push(hem, { c: add(s.pelvis, mul(s.hips[2], -1.4)), u: mul(s.hips[0], HB.pelvisDeep + 2.0 + pad), v: mul(s.hips[1], HB.pelvisHalf + 2.2 + pad) });
  rings.push(
    { c: waistC, u: mul(be[0], HB.waistDeep + 1.4 + pad), v: mul(be[1], HB.waistHalf + 1.4 + pad) },
    { c: s.ribs, u: mul(cf, HB.ribDeep + 1.6 + pad), v: mul(cl, HB.ribHalf + 1.8 + pad) },
    { c: lerp3(s.ribs, s.neck, 0.72), u: mul(cf, HB.ribDeep + 1.0 + pad), v: mul(cl, HB.shoulderHalf + 0.4 + pad) },
    { c: add(s.neck, mul(cu, -0.8)), u: mul(cf, 3.2), v: mul(cl, 3.8) },
  );
  return rings;
}
/** The gleaner's long skirt, from the waist to the floor round both legs, dragging behind. */
function skirt(put: Put, s: Skeleton, lag: V3, ph: number): { hemC: V3; f: V3; l: V3; hemDeep: number } {
  const f = norm([s.hips[0][0], s.hips[0][1], 0], [1, 0, 0]);
  const l: V3 = [-f[1], f[0], 0];
  const waistC = add(s.pelvis, mul(s.hips[2], HB.waist * 0.55));
  const kneeMid = lerp3(s.kneeL, s.kneeR, 0.5);
  const footMid = lerp3(lerp3(s.heelL, s.toeL, 0.5), lerp3(s.heelR, s.toeR, 0.5), 0.5);
  const spanF = Math.abs(dot(sub(s.ankleL, s.ankleR), f));
  const spanL = Math.abs(dot(sub(s.ankleL, s.ankleR), l));
  const hemC: V3 = [footMid[0] + lag[0] * 1.1, footMid[1] + lag[1] * 1.1, Math.min(1.6, Math.min(s.ankleL[2], s.ankleR[2]) + 0.9)];
  const hemDeep = Math.max(HB.pelvisDeep + 3.4, spanF / 2 + 3.2);
  const hemWide = Math.max(HB.pelvisHalf + 3.6, spanL / 2 + 3.0);
  const hemPts: V3[] = [];
  for (let i = 0; i < 18; i++) {
    const a = (i / 18) * Math.PI * 2;
    const rear = Math.max(0, -Math.cos(a));
    const p = add(hemC, add(mul(f, Math.cos(a) * hemDeep), mul(l, Math.sin(a) * hemWide)));
    hemPts.push(add(p, add([0, 0, Math.sin(ph * 2 + a * 3) * 0.3], mul(lag, rear * 0.6))));
  }
  const rings: Ring[] = [
    { c: waistC, u: mul(s.belly[0], HB.waistDeep + 1.8), v: mul(s.belly[1], HB.waistHalf + 1.8) },
    { c: [s.pelvis[0], s.pelvis[1], s.pelvis[2] - 1.0], u: mul(f, HB.pelvisDeep + 2.6), v: mul(l, HB.pelvisHalf + 2.8) },
    { c: [kneeMid[0] * 0.6 + hemC[0] * 0.4, kneeMid[1] * 0.6 + hemC[1] * 0.4, kneeMid[2]], u: mul(f, (HB.pelvisDeep + 2.6 + hemDeep) / 2), v: mul(l, (HB.pelvisHalf + 2.8 + hemWide) / 2) },
    { c: hemC, u: mul(f, hemDeep), v: mul(l, hemWide), pts: hemPts },
  ];
  put('skirt', 'skirt', { k: 'cloth', rings, ramp: SKIRT, look: { folds: [25, -25, 70, -70, 120, -120, 165, -165], lift: 0.05 } });
  return { hemC, f, l, hemDeep };
}

/** THE HEAD: a drained face, the cult's dull pink in the eyes, the mouth hanging open and working; the reaper's battered straw hat, the gleaner's deep sunbonnet. Returns the mouth. */
function head(put: Put, st: Stage, s: Skeleton, who: FieldhandWho, jaw: number, lit: number, lag: V3): V3 {
  const [ff, fl, fu] = wornOn(st, s, 8);
  const hr: V3 = [HB.headR[0] * 1.02, HB.headR[1] * 1.08, HB.headR[2] * 1.0];
  const hc = add(s.head, mul(fu, -0.3));
  const hairOf = who === 'reaper' ? GREY_HAIR : HAIR;
  const skin: Skin = (u, tone) => {
    const fwd = u[0];
    const side = Math.abs(u[1]);
    const open = 0.08 + 0.2 * jaw;
    if (fwd > 0.7 && side < 0.24 && u[2] < -0.32 && u[2] > -0.32 - open * 1.5) return u[2] > -0.38 ? '#22161a' : INK;
    if (fwd > 0.45 && fwd < 0.75 && side > 0.42 && side < 0.7 && u[2] < -0.1 && u[2] > -0.5) return SKIN[Math.max(0, tone - 1)];
    if (fwd > 0.88 && side < 0.14 && u[2] > -0.24 && u[2] < 0.1) return SKIN[Math.min(4, tone + 1)];
    // (the reaper's stubble, grey, along his jaw)
    if (who === 'reaper' && fwd > 0.2 && u[2] < -0.45 && hash(Math.floor(u[1] * 12), Math.floor(u[2] * 12), 7401) < 0.5) return GREY_HAIR[tone];
    if (fwd < 0.1 && u[2] > -0.45) return hairOf[tone];
    return SKIN[tone];
  };
  put('head', 'head', { k: 'ball', c: hc, ax: [mul(ff, hr[0]), mul(fl, hr[1]), mul(fu, hr[2])], skin });
  for (const k of [-1, 1]) {
    const a = add(hc, add(mul(ff, hr[0] * 0.88), add(mul(fl, k * hr[1] * 0.12), mul(fu, hr[2] * 0.3))));
    const b = add(hc, add(mul(ff, hr[0] * 0.72), add(mul(fl, k * hr[1] * 0.6), mul(fu, hr[2] * 0.24))));
    put('head', 'brows', { k: 'rod', a, b, ra: 0.75, rb: 0.6, ramp: hairOf });
  }
  for (const k of [-1, 1]) {
    const e = add(hc, add(mul(ff, hr[0] * 0.92), add(mul(fl, k * hr[1] * 0.34), mul(fu, hr[2] * 0.1))));
    put('head', 'eyes', { k: 'dot', p: e, c: lit > 0.4 ? FLAME[1] : '#3a2a30', facing: ff });
  }
  if (who === 'reaper') {
    // a battered straw hat: its crown, and its wide brim, frayed and drooping at the back
    const top = add(hc, mul(fu, hr[2] * 0.55));
    const weave: Skin = (u, tone) => (hash(Math.floor(Math.atan2(u[1], u[0]) * 6), Math.floor(u[2] * 5), 7402) < 0.3 ? STRAW[Math.max(0, tone - 1)] : STRAW[tone]);
    put('hat', 'hat', { k: 'ball', c: add(top, mul(fu, 0.6)), ax: [mul(ff, hr[0] * 0.95), mul(fl, hr[1] * 0.95), mul(fu, hr[2] * 0.62)], skin: (u, tone) => (u[2] < -0.4 ? null : weave(u, tone, 0, 0)) });
    put('hat', 'brim', { k: 'ball', c: add(add(top, mul(fu, -1.4)), mul(lag, 0.2)), ax: [mul(norm(add(ff, mul(fu, -0.12))), hr[0] * 2.1), mul(fl, hr[1] * 2.0), mul(norm(add(fu, mul(ff, 0.12))), 0.55)], skin: (u, tone) => (hash(Math.floor(Math.atan2(u[1], u[0]) * 9), 1, 7403) < 0.12 && Math.hypot(u[0], u[1]) > 0.9 ? null : weave(u, tone, 0, 0)) });
  } else {
    // a deep sunbonnet, its brim standing out round her face, its curtain down the back of her neck
    const top = add(hc, mul(fu, hr[2] * 0.2));
    put('hat', 'bonnet', { k: 'ball', c: add(top, mul(ff, -0.9)), ax: [mul(ff, hr[0] * 1.12), mul(fl, hr[1] * 1.16), mul(fu, hr[2] * 1.02)], skin: (u, tone) => (u[0] > 0.25 && u[2] < 0.62 ? null : BONNET[tone]) });
    const rim: Ring = { c: add(hc, add(mul(ff, hr[0] * 0.75), mul(fu, hr[2] * 0.15))), u: mul(fu, hr[2] * 1.15), v: mul(fl, hr[1] * 1.2) };
    put('hat', 'bonnet', { k: 'band', ring: rim, ramp: BONNET, rows: 2 });
    const nape = add(hc, add(mul(ff, -hr[0] * 0.9), mul(fu, -hr[2] * 0.5)));
    put('hat', 'curtain', { k: 'rod', a: nape, b: add(add(nape, mul(fu, -4.2)), mul(lag, 0.6)), ra: hr[1] * 0.9, rb: hr[1] * 1.05, ramp: BONNET });
  }
  return add(hc, add(mul(ff, hr[0] * 1.02), mul(fu, -hr[2] * 0.4)));
}

/** The Hush leaking out of them at each moment, laid after their edge (Mob.grains). */
const BREATH = new WeakMap<Moment, [V3, string, number][]>();
/** What a moment of a move says over and above the bones: whether the sickle has fallen from the hand, how open the mouth is. */
export interface FieldSay {
  dropped: (m: Moment) => boolean;
}
function fieldBits(who: FieldhandWho, st: Stage, m: Moment, say: FieldSay): Bit[] {
  const { s, q } = m;
  const bits: Bit[] = [];
  const breath: [V3, string, number][] = [];
  BREATH.set(m, breath);
  const put: Put = (part, piece, shape) => {
    if (shape.k === 'mote' && part === 'hush') {
      breath.push([shape.p, shape.c, shape.size]);
      return;
    }
    bits.push({ part, piece, shape });
  };
  const [cf, cl, cu] = s.chest;
  const lit = 1 - clamp01(q.out);
  const ph = m.wind * Math.PI * 2;
  const lag = lagOf(m, 1.5, 3.0);
  const jaw = clamp01(m.jaw ?? 0.4);
  const seed = who === 'reaper' ? 4 : 5;
  const held = !say.dropped(m);
  if (who === 'reaper') {
    // A REAPER: a long smock-frock of oatmeal linen to his knees, its yoke smocked across his chest; leggings and boots;
    // a neckerchief; his sleeves to the wrist
    for (const side of ['L', 'R'] as const) leg(put, s, side, LEGGING);
    put('body', 'frock', { k: 'cloth', rings: torsoRings(s, 0.7, thighRing(s, 0.92, 1.2, lag)), ramp: FROCK, look: { folds: [0, 20, -20, 45, -45, 90, -90, 140, -140, 180], lift: 0.06 } });
    // the smocking: rows of little gathers across the chest
    for (let r = 0; r < 3; r++) {
      const c = add(lerp3(s.ribs, s.neck, 0.55 - r * 0.12), mul(cf, HB.ribDeep + 1.9));
      put('body', 'smocking', { k: 'rod', a: add(c, mul(cl, -HB.ribHalf * 0.55)), b: add(c, mul(cl, HB.ribHalf * 0.55)), ra: 0.4, rb: 0.4, ramp: CORD });
    }
    put('body', 'ink', { k: 'ball', c: add(add(lerp3(s.ribs, s.pelvis, 0.6), mul(s.belly[0], HB.waistDeep + 2.2)), mul(cl, 1.6)), ax: [mul(cf, 0.5), mul(cl, 2.0), mul(cu, 1.5)], skin: () => INKBLOT });
    put('neck', 'neckerchief', { k: 'ball', c: add(add(s.neck, mul(cu, -1.2)), mul(cf, 2.2)), ax: [mul(cf, 2.2), mul(cl, 3.6), mul(cu, 1.8)], skin: NECKER });
    for (const side of ['L', 'R'] as const) arm(put, s, side, FROCK, FROCK, null, side === 'R' && held ? 1 : 0.4, cu);
  } else {
    // A GLEANER: a russet bodice laced over her shift, her sleeves rolled; a long dark skirt; a sacking apron, its
    // corner tucked up into her waist for a lap, a few ears of corn in it; a sunbonnet
    for (const side of ['L', 'R'] as const) {
      const heel = side === 'L' ? s.heelL : s.heelR;
      const toe = side === 'L' ? s.toeL : s.toeR;
      const fwd = norm(sub(toe, heel), [1, 0, 0]);
      const side3 = norm(Math.abs(fwd[2]) < 0.95 ? [-fwd[1], fwd[0], 0] : cross(s.hips[2], fwd), [0, 1, 0]);
      const up3 = norm(cross(fwd, side3), [0, 0, 1]);
      put(`foot${side}`, `foot${side}`, { k: 'ball', c: add(lerp3(heel, toe, 0.5), mul(up3, 1.5)), ax: [mul(fwd, 4.6), mul(side3, 2.0), mul(up3, 1.6)], skin: BOOT, far: true });
    }
    const sk = skirt(put, s, lag, ph);
    put('body', 'bodice', { k: 'cloth', rings: torsoRings(s, 0.4, null), ramp: RUSSET, look: { folds: [0, 50, -50], lift: 0.04 } });
    // its lacing
    for (let r = 0; r < 4; r++) {
      const c = add(lerp3(s.ribs, s.neck, 0.5 - r * 0.15), mul(cf, HB.ribDeep + 1.7));
      put('body', 'lacing', { k: 'rod', a: add(c, mul(cl, -1.2)), b: add(c, mul(cl, 1.2)), ra: 0.3, rb: 0.3, ramp: SHIFT });
    }
    // the sacking apron, its lap of gleaned ears
    const waistC = add(s.pelvis, mul(s.hips[2], HB.waist * 0.55));
    const front = add(waistC, mul(sk.f, HB.waistDeep + 2.3));
    const low = add(sk.hemC, add(mul(sk.f, sk.hemDeep + 0.3), [0, 0, 9]));
    const mid = lerp3(front, low, 0.5);
    put('skirt', 'apron', { k: 'panel', c: add(mid, mul(sk.f, 1.4)), u: mul(sk.l, HB.waistHalf + 1.0), v: mul(sub(low, front), -0.5), skin: (a, b, frontSide, tone) => (frontSide ? (hash(Math.round(a * 3), Math.round(b * 3), 7404) > 0.85 ? SACKING[Math.max(0, tone - 1)] : SACKING[tone]) : SACKING[Math.max(0, tone - 1)]) });
    const lap = add(front, add(mul(sk.f, 2.8), [0, 0, -1.6]));
    put('skirt', 'lap', { k: 'ball', c: lap, ax: [mul(sk.f, 2.2), mul(sk.l, HB.waistHalf * 0.8), [0, 0, 1.8]], skin: SACKING });
    for (let i = 0; i < 5; i++) put('skirt', 'ears', { k: 'rod', a: add(lap, [0, 0, 0.8]), b: add(lap, add(add(mul(sk.l, (i - 2) * 1.2), mul(sk.f, 0.6)), [0, 0, 3.2 + (i % 2)])), ra: 0.4, rb: 0.5, ramp: STRAW });
    put('body', 'ink', { k: 'ball', c: add(add(s.ribs, mul(cf, HB.ribDeep + 1.9)), mul(cl, -1.2)), ax: [mul(cf, 0.5), mul(cl, 1.8), mul(cu, 1.4)], skin: () => INKBLOT });
    for (const side of ['L', 'R'] as const) arm(put, s, side, SHIFT, SKIN, SHIFT, side === 'R' && held ? 1 : 0.4, cu);
  }
  put('neck', 'neck', { k: 'rod', a: add(s.neck, mul(cu, -1.5)), b: lerp3(s.neck, s.head, 0.5), ra: 2.2, rb: 2.0, ramp: SKIN });
  const mouth = head(put, st, s, who, jaw, lit, lag);
  // (painted even once dropped: as they die it falls from them as a piece of its own, Mob.fall)
  sickle(put, s, held ? clamp01(m.glint) : 0);
  const [ff, fl] = wornOn(st, s, 8);
  const puff = m.dying ? Math.max(0, 2.2 * (1 - clamp01((m.t - 0.15) / 1.1))) : 0.7 + 0.8 * clamp01(m.glint);
  hushBreath(put, mouth, ff, fl, m.t, puff, seed);
  if (m.dying) hushLeaves(put, mouth, ff, fl, m.t, seed, 0.12, 1.7);
  return bits;
}

// =============================================================================================
// THEIR STAND: REAPING AT NOTHING

/** Their rest, as floor 11's Hushed: slack, the head hung; the sickle in the right hand, hanging. */
export const FH_REST: Bones = {
  ...HUSHED_REST,
  rhIn: 1, rhx: 4.0, rhy: -3.6, rhz: -20, re: 10,
  wAz: 10, wEl: -20, wRoll: 0,
};
/** Their stand: 3.0 s round. Stooped, reaping at corn that is not there: the left hand gathers a fistful, the sickle hooks in behind it and draws back, cutting; they straighten a little, the mouth working; and again. */
export const FH_STAND_LONG = 3.0;
export function fieldStand(): Motion {
  const R = FH_REST;
  const T = FH_STAND_LONG;
  const keys: Key3[] = [];
  const N = 30;
  for (let i = 0; i <= N; i++) {
    const t = (i / N) * T;
    const a = (t / T) * Math.PI * 2;
    // (one stroke a round: down and in, drawn back across, up again)
    const stroke = 0.5 - 0.5 * Math.cos(a);
    const draw = Math.sin(a);
    keys.push({
      at: t,
      ease: 'lin',
      pose: {
        pz: R.pz - 1.0 * stroke,
        py: 0.8 * Math.sin(a),
        roll: R.roll + 2.0 * Math.sin(a),
        pitch: R.pitch + 4 * stroke,
        bend: R.bend + 5 * stroke,
        faceUp: R.faceUp - 4 * stroke + 2,
        faceTilt: R.faceTilt + 5 * Math.sin(a + 2.0),
        faceTurn: R.faceTurn + 6 * Math.sin(a + 0.8),
        lhIn: 1, lhx: R.lhx + 3 * stroke, lhy: R.lhy - 1 * stroke, lhz: R.lhz - 1 * stroke,
        rhIn: 1, rhx: R.rhx + 2.4 * stroke - 1.4 * draw, rhy: R.rhy + 1.4 * stroke, rhz: R.rhz - 1.2 * stroke,
        wAz: (R.wAz as number) + 12 * stroke - 9 * draw, wEl: (R.wEl as number) - 5 * stroke,
      },
    });
  }
  return { loop: 0, keys };
}
/** Their mouth, working on words that make no sound. */
export function fieldJaw(t: number): number {
  const u = fr(t / FH_STAND_LONG);
  return 0.3 + 0.5 * Math.max(0, Math.sin(u * Math.PI * 6)) * (u < 0.7 ? 1 : 0.3);
}

/** THEM AS THE PAINTER TAKES THEM. */
export function fieldPainter(who: FieldhandWho, say: FieldSay): { bits: (st: Stage, m: Moment) => Bit[]; grains: (st: Stage, m: Moment) => ReadonlyArray<readonly [V3, string, number]> } {
  return { bits: (st, m) => fieldBits(who, st, m, say), grains: (_st, m) => BREATH.get(m) ?? [] };
}
