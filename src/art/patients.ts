// FLOOR 14'S SMALL MOB, THE HUSHED PATIENTS (the art chat for floors 11 to 15, 19 Oct 2026). A MOCK-UP: NOT IN THE GAME.
// Nothing of the game imports this file; `PATIENTS_ON` is off. Their moves are art/patients_moves.ts; what they let out
// on the floor, art/patient_shots.ts.
//
// His doc "Wordsmith Act 2: The Hush" (the planning chat's, with his yes as ideas), level 14, THE HOUSE OF QUIET: “The
// city infirmary, where the Hushed are taken to be cured”; its enemies “Hushed patients who sit up in their beds as you
// pass, and the Physician's orderlies”; its story “the doctors aren't curing anyone. They draw out people's last
// words.”; the Physician's Rounds, “where the patients rise from their beds”. And his word to this chat of 18 Oct, 21:24
// Pacific: “Hey go without my say so.  If something is shit I’ll get it to it but you’re doing a great jobs. At least
// for 11-15”. So their brief is this chat's, the picks it would have marked recommended, sent him with their films:
// - WHO THEY ARE: the Hushed (floor 11's, art/hushed.ts, his picks: “The Hush leaking out”, “The Hush leaves them
//   (Recommended)”), here the people of the city brought to the House of Quiet to be cured and lying in its wards, their
//   last words drawn out of them. Two of them, for a ward: a MAN in a long nightshirt to his calves, his head bandaged,
//   and a WOMAN in a nightgown to her ankles, a frilled nightcap, a grey shawl round her shoulders, her hair down her
//   back. Barefoot, both. Each has the ward's number inked on the breast in the Order's black. Grown men and women, no
//   child. Their faces drained, their eyes the cult's dull pink, their mouths working, the Hush leaking out of them.
// - IN THEIR BEDS (his doc: “who sit up in their beds as you pass”): lying on their backs on an iron ward bed (art/
//   floor14.ts, its `empty` frame), knees drawn up, breathing slow, eyes shut, mouthing in their sleep. As you pass THEY
//   SIT BOLT UPRIGHT, their eyes snapping open pink; turn their heads to you; swing their legs over the side, slide off
//   onto their bare feet and come.
// - THEIR BLOW, THE SILENT SCREAM: they hunch over, both hands at their throat, the throat burning pink (the warning);
//   then, a step in, they throw their head forward and their arms back and scream: a scream with no sound, the Hush
//   blasting out of the gaping mouth in a burst before them.
// - THEIR DEATH: as floor 11's Hushed, his pick, “The Hush leaves them”: a gasp, the Hush pouring up out of them in one
//   great grey breath; but the sick go down softly: their knees give, they sink, and lie down on their side, curled up
//   as if asleep at last.
// And his words of 18 Oct on the act's enemies: Act 2's own, nothing of Act 1's.
//
// ON THE HEROES' BONES (art/skeleton.ts), as floor 11's Hushed are, whose body, skin and breath they share.

import { BREATH_PALE, GREY_HAIR, HAIR, HUSHED_BODY, HUSHED_REST, INKBLOT, SKIN, hushBreath, hushLeaves, lagOf } from './hushed';
import { HUSH } from './crier';
import { INK, hash } from './kit';
import type { Ramp } from './kit';
import { FLAME } from './mkit';
import { sphere } from './new_mobs3';
import type { Bit, MobCanvas, Moment, Put } from './new_mobs3';
import { wornOn } from './skin';
import type { Ring, Skin, Stage } from './skin';
import { add, cross, dot, elbowFor, lerp3, mul, norm, sub } from './skeleton';
import type { Bones, Posed, Skeleton, V3 } from './skeleton';

/** THE SWITCH, OFF. Nothing of the game reads this file. */
export const PATIENTS_ON = { on: false };

const fr = (t: number): number => t - Math.floor(t);
const clamp01 = (v: number): number => Math.max(0, Math.min(1, v));

// =============================================================================================
// THEIR COLOURS: the ward's linen, washed grey; the Order's ink

/** The man's nightshirt: linen washed thin and grey. */
const NIGHTSHIRT: Ramp = ['#45423a', '#45423a', '#8e8a7a', '#b8b2a0', '#cdc7b4'];
/** The woman's nightgown, a little warmer; her nightcap and the man's bandage, a cleaner linen. */
const NIGHTGOWN: Ramp = ['#48443e', '#48443e', '#928c80', '#bcb6a8', '#d0cabc'];
const BANDAGE: Ramp = ['#46443e', '#46443e', '#949082', '#bab4a2', '#c8c2ae'];
/** Her shawl: grey wool. */
const SHAWL: Ramp = ['#1e2026', '#1e2026', '#40434e', '#5a5e6a', '#5a5e6a'];
/** The soles of their bare feet, darker. */
const SOLE: Ramp = ['#2a2220', '#2a2220', '#5e504a', '#7e6c62', '#7e6c62'];

// =============================================================================================
// THE BODY: floor 11's Hushed

export const PT_BODY = HUSHED_BODY;
const HB = PT_BODY;
/**
 * Their picture: room for one lying on a bed behind where they will stand (the bed's middle 20 behind them, its length
 * along their left and right) and for the scream thrown forward.
 */
export const PT_CANVAS: MobCanvas = { w: 250, h: 210, ax: 136, ay: 158 };
/** Where the bed they rise from stands (its middle, in their own space: behind them), how long it is along their left and right, how wide, and how high its mattress is (art/floor14.ts `wardBed`). */
export const PT_BED = { x: -20, half: 27, wide: 12, top: 18.6 } as const;

/** Who: a man, a woman. */
export type PatientWho = 'man' | 'woman';

// =============================================================================================
// THEM AS SOLIDS

/** A sleeve to the wrist, and the hand: its fingers curled slack, or spread and clawing (`open`). */
function arm(put: Put, s: Skeleton, side: 'L' | 'R', sleeve: Ramp, open: number, cu: V3): void {
  const sh = side === 'L' ? s.shoulderL : s.shoulderR;
  const el = side === 'L' ? s.elbowL : s.elbowR;
  const hand = side === 'L' ? s.handL : s.handR;
  const [r0, r1, r2] = HB.armR;
  const fore = norm(sub(hand, el), [0, 0, -1]);
  put(`arm${side}`, `arm${side}`, { k: 'ball', c: sh, ax: sphere(r0 * 1.2), skin: sleeve, far: true });
  put(`arm${side}`, `arm${side}`, { k: 'rod', a: sh, b: el, ra: r0 * 1.18, rb: r1 * 1.16, ramp: sleeve, far: true });
  put(`fore${side}`, `fore${side}`, { k: 'ball', c: el, ax: sphere(r1 * 1.16), skin: sleeve, far: true });
  const wrist = add(hand, mul(fore, -1.2));
  // (a loose sleeve, widening to the wrist)
  put(`fore${side}`, `fore${side}`, { k: 'rod', a: el, b: wrist, ra: r1 * 1.12, rb: r2 * 1.5, ramp: sleeve, far: true });
  const e1 = norm(sub(cu, mul(fore, dot(cu, fore))), [0, 0, 1]);
  const e2 = norm(cross(fore, e1), [0, 1, 0]);
  put(`hand${side}`, `hand${side}`, { k: 'ball', c: add(hand, mul(fore, 0.4)), ax: [mul(fore, 1.7), mul(e2, 1.5), mul(e1, 0.9)], skin: SKIN, far: true });
  for (let i = 0; i < 4; i++) {
    const spread = (i - 1.5) * (0.3 + 0.55 * open);
    const base = add(hand, add(mul(fore, 1.4), mul(e2, spread * 0.85)));
    const curl = 1 - open;
    const mid = add(base, add(mul(fore, 1.5), add(mul(e1, -0.8 * curl), mul(e2, spread * 0.5))));
    const tip = add(mid, add(mul(fore, 1.1 * (1 - 0.5 * curl)), mul(e1, -1.3 * curl)));
    put(`hand${side}`, `finger${side}`, { k: 'rod', a: base, b: mid, ra: 0.5, rb: 0.42, ramp: SKIN, far: true });
    put(`hand${side}`, `finger${side}`, { k: 'rod', a: mid, b: tip, ra: 0.42, rb: 0.3, ramp: SKIN, far: true });
  }
}
/** A bare leg below the hem, and a bare foot. */
function leg(put: Put, s: Skeleton, side: 'L' | 'R', thigh: Ramp): void {
  const hip = side === 'L' ? s.hipL : s.hipR;
  const knee = side === 'L' ? s.kneeL : s.kneeR;
  const ankle = side === 'L' ? s.ankleL : s.ankleR;
  const heel = side === 'L' ? s.heelL : s.heelR;
  const toe = side === 'L' ? s.toeL : s.toeR;
  const [rH, rK, rA] = HB.legR;
  put(`leg${side}`, `leg${side}`, { k: 'rod', a: hip, b: knee, ra: rH * 1.0, rb: rK * 1.0, ramp: thigh, far: true });
  put(`leg${side}`, `leg${side}`, { k: 'ball', c: knee, ax: sphere(rK * 1.02), skin: thigh, far: true });
  put(`shin${side}`, `shin${side}`, { k: 'rod', a: knee, b: ankle, ra: rK * 0.92, rb: rA * 0.95, ramp: SKIN, far: true });
  // the bare foot: narrower than a shoe, its sole darker
  const fwd = norm(sub(toe, heel), [1, 0, 0]);
  const side3 = norm(Math.abs(fwd[2]) < 0.95 ? [-fwd[1], fwd[0], 0] : cross(s.hips[2], fwd), [0, 1, 0]);
  const up3 = norm(cross(fwd, side3), [0, 0, 1]);
  const mid = add(lerp3(heel, toe, 0.55), mul(up3, 1.15));
  put(`foot${side}`, `foot${side}`, { k: 'ball', c: mid, ax: [mul(fwd, 4.3), mul(side3, 1.75), mul(up3, 1.25)], skin: (u, tone) => (u[2] < -0.55 ? SOLE[tone] : SKIN[tone]), far: true });
}

/**
 * A NIGHTSHIRT OR A NIGHTGOWN, from the throat down round both legs to `hemAt` of the way from the knees to the ankles,
 * as rings that follow the legs however they lie (standing, sitting on a bed's edge, lying in it with the knees drawn
 * up), the hem hanging back as they go.
 */
function gown(put: Put, s: Skeleton, hemAt: number, ramp: Ramp, lag: V3, ph: number, folds: number[]): void {
  const [cf, cl, cu] = s.chest;
  const [rH, rK, rA] = HB.legR;
  const left = s.hips[1];
  /** A ring round both legs at `k` along (0 the hips, 1 the knees, 2 the ankles), its plane across the legs there. */
  const at = (k: number, pad: number): Ring => {
    const pt = (side: 'L' | 'R'): V3 => {
      const hip = side === 'L' ? s.hipL : s.hipR;
      const knee = side === 'L' ? s.kneeL : s.kneeR;
      const ankle = side === 'L' ? s.ankleL : s.ankleR;
      return k <= 1 ? lerp3(hip, knee, k) : lerp3(knee, ankle, k - 1);
    };
    const way = (side: 'L' | 'R'): V3 => {
      const hip = side === 'L' ? s.hipL : s.hipR;
      const knee = side === 'L' ? s.kneeL : s.kneeR;
      const ankle = side === 'L' ? s.ankleL : s.ankleR;
      const th = norm(sub(knee, hip), [0, 0, -1]);
      const sh = norm(sub(ankle, knee), [0, 0, -1]);
      const w = k < 0.85 ? th : k > 1.15 ? sh : norm(add(th, sh), sh);
      return w;
    };
    const a = pt('L');
    const b = pt('R');
    const dir = norm(add(way('L'), way('R')), [0, 0, -1]);
    const l = norm(sub(left, mul(dir, dot(left, dir))), [0, 1, 0]);
    const f = norm(cross(dir, l), [1, 0, 0]);
    const d = sub(a, b);
    const r = k <= 1 ? rH + (rK - rH) * k : rK + (rA - rK) * (k - 1);
    const ring: Ring = { c: lerp3(a, b, 0.5), u: mul(f, Math.abs(dot(d, f)) / 2 + r + pad), v: mul(l, Math.abs(dot(d, l)) / 2 + r + pad) };
    return { ...ring, pts: onFloor(ring) };
  };
  /** A ring's edge, but lying along the floor where it would go under it (the gown on the boards as they kneel). */
  const onFloor = (r: Ring): V3[] => {
    const out: V3[] = [];
    for (let i = 0; i < 18; i++) {
      const a = (i / 18) * Math.PI * 2;
      const p = add(r.c, add(mul(r.u, Math.cos(a)), mul(r.v, Math.sin(a))));
      out.push([p[0], p[1], Math.max(0.4, p[2])]);
    }
    return out;
  };
  const hemK = 1 + hemAt;
  const hem = at(hemK, 2.4 + 0.6 * hemAt);
  // (the hem's edge: a little wave, hanging back where it trails, and sagging under its own weight)
  const hemPts: V3[] = [];
  const uL = Math.hypot(...hem.u);
  for (let i = 0; i < 18; i++) {
    const a = (i / 18) * Math.PI * 2;
    const rear = Math.max(0, -Math.cos(a));
    const p = add(hem.c, add(mul(hem.u, Math.cos(a)), mul(hem.v, Math.sin(a))));
    const q = add(p, add([0, 0, Math.sin(ph * 2 + a * 3) * 0.3 - 0.5], mul(lag, rear * 0.6 + 0.3)));
    hemPts.push([q[0], q[1], Math.max(0.4, q[2])]);
  }
  void uL;
  const waistC = add(s.pelvis, mul(s.hips[2], HB.waist * 0.6));
  const rings: Ring[] = [
    { ...hem, pts: hemPts },
    at(1.0, 2.0),
    at(0.45, 1.6),
    { c: add(s.pelvis, mul(s.hips[2], -1.4)), u: mul(s.hips[0], HB.pelvisDeep + 2.0), v: mul(s.hips[1], HB.pelvisHalf + 2.2) },
    { c: waistC, u: mul(s.belly[0], HB.waistDeep + 1.8), v: mul(s.belly[1], HB.waistHalf + 1.8) },
    { c: s.ribs, u: mul(cf, HB.ribDeep + 1.9), v: mul(cl, HB.ribHalf + 2.0) },
    { c: lerp3(s.ribs, s.neck, 0.72), u: mul(cf, HB.ribDeep + 1.2), v: mul(cl, HB.shoulderHalf + 0.6) },
    { c: add(s.neck, mul(cu, -0.8)), u: mul(cf, 3.2), v: mul(cl, 3.8) },
  ];
  put('body', 'gown', { k: 'cloth', rings, ramp, look: { folds, lift: 0.06 } });
}

/** THE HEAD: a drained face, the cult's dull pink in the eyes (`eyes`: 0 shut, 1 open and burning), the mouth working; the man's bandage, the woman's nightcap and her hair down her back. Returns the mouth. */
function head(put: Put, st: Stage, s: Skeleton, who: PatientWho, jaw: number, eyes: number, lag: V3): V3 {
  const [ff, fl, fu] = wornOn(st, s, 8);
  const hr: V3 = [HB.headR[0] * 1.0, HB.headR[1] * 1.06, HB.headR[2] * 1.0];
  const hc = add(s.head, mul(fu, -0.3));
  const hairOf = who === 'man' ? HAIR : GREY_HAIR;
  const skin: Skin = (u, tone) => {
    const fwd = u[0];
    const side = Math.abs(u[1]);
    const open = 0.08 + 0.24 * jaw;
    if (fwd > 0.68 && side < 0.26 && u[2] < -0.3 && u[2] > -0.3 - open * 1.5) return u[2] > -0.36 ? '#22161a' : INK;
    if (fwd > 0.45 && fwd < 0.75 && side > 0.42 && side < 0.7 && u[2] < -0.1 && u[2] > -0.5) return SKIN[Math.max(0, tone - 1)];
    // (dark under the eyes: the sick)
    if (fwd > 0.7 && side > 0.2 && side < 0.5 && u[2] > -0.12 && u[2] < 0.02) return SKIN[Math.max(0, tone - 1)];
    if (fwd > 0.88 && side < 0.14 && u[2] > -0.24 && u[2] < 0.1) return SKIN[Math.min(4, tone + 1)];
    if (who === 'man' && fwd > 0.2 && u[2] < -0.45 && hash(Math.floor(u[1] * 12), Math.floor(u[2] * 12), 7501) < 0.45) return HAIR[Math.max(1, tone)];
    if (fwd < 0.1 && u[2] > -0.45) return hairOf[tone];
    return SKIN[tone];
  };
  put('head', 'head', { k: 'ball', c: hc, ax: [mul(ff, hr[0]), mul(fl, hr[1]), mul(fu, hr[2])], skin });
  for (const k of [-1, 1]) {
    const a = add(hc, add(mul(ff, hr[0] * 0.88), add(mul(fl, k * hr[1] * 0.12), mul(fu, hr[2] * 0.3))));
    const b = add(hc, add(mul(ff, hr[0] * 0.72), add(mul(fl, k * hr[1] * 0.6), mul(fu, hr[2] * 0.24))));
    put('head', 'brows', { k: 'rod', a, b, ra: 0.7, rb: 0.55, ramp: hairOf });
  }
  for (const k of [-1, 1]) {
    const e = add(hc, add(mul(ff, hr[0] * 0.92), add(mul(fl, k * hr[1] * 0.34), mul(fu, hr[2] * 0.1))));
    put('head', 'eyes', { k: 'dot', p: e, c: eyes > 0.4 ? FLAME[1] : '#3a2a30', facing: ff });
  }
  if (who === 'man') {
    // a bandage wound round his brow, and over his crown from ear to ear; its end tucked in at the back
    put('hat', 'bandage', { k: 'band', ring: { c: add(hc, mul(fu, hr[2] * 0.36)), u: mul(norm(add(ff, mul(fu, -0.12))), hr[0] * 1.06), v: mul(fl, hr[1] * 1.08) }, ramp: BANDAGE, rows: 3 });
    put('hat', 'bandage', { k: 'band', ring: { c: add(hc, mul(fu, hr[2] * 0.1)), u: mul(fu, hr[2] * 1.06), v: mul(fl, hr[1] * 1.08) }, ramp: BANDAGE, rows: 2 });
    const knot = add(hc, add(mul(ff, -hr[0] * 1.02), mul(fu, hr[2] * 0.3)));
    put('hat', 'bandage', { k: 'rod', a: knot, b: add(add(knot, mul(fu, -2.4)), mul(lag, 0.4)), ra: 0.8, rb: 0.6, ramp: BANDAGE });
  } else {
    // a frilled nightcap over her crown, tied under her chin; her hair loose down her back
    const top = add(hc, mul(fu, hr[2] * 0.3));
    put('hat', 'nightcap', { k: 'ball', c: add(top, mul(ff, -0.9)), ax: [mul(ff, hr[0] * 1.14), mul(fl, hr[1] * 1.16), mul(fu, hr[2] * 0.98)], skin: (u, tone) => (u[0] > 0.35 && u[2] < 0.45 ? null : u[2] < -0.3 ? null : BANDAGE[Math.min(4, tone + (hash(Math.floor(Math.atan2(u[1], u[0]) * 4), Math.floor(u[2] * 4), 7502) < 0.25 ? -1 : 0))]) });
    const rim: Ring = { c: add(hc, add(mul(ff, hr[0] * 0.55), mul(fu, hr[2] * 0.32))), u: mul(fu, hr[2] * 1.12), v: mul(fl, hr[1] * 1.22) };
    put('hat', 'frill', { k: 'band', ring: rim, ramp: BANDAGE, rows: 2 });
    for (const k of [-1, 1]) {
      const ear = add(hc, add(mul(fl, k * hr[1] * 0.98), mul(fu, -hr[2] * 0.1)));
      put('hat', 'ties', { k: 'rod', a: ear, b: add(hc, add(mul(ff, hr[0] * 0.3), mul(fu, -hr[2] * 1.05))), ra: 0.35, rb: 0.35, ramp: BANDAGE });
    }
    const nape = add(hc, add(mul(ff, -hr[0] * 0.92), mul(fu, -hr[2] * 0.35)));
    put('hair', 'hair', { k: 'rod', a: nape, b: add(add(nape, mul(fu, -8.5)), add(mul(lag, 0.8), mul(ff, -1.4))), ra: hr[1] * 0.78, rb: hr[1] * 0.5, ramp: GREY_HAIR });
    for (const k of [-1, 1]) {
      const at = add(hc, add(mul(fl, k * hr[1] * 0.92), mul(fu, -hr[2] * 0.2)));
      put('hair', 'locks', { k: 'rod', a: at, b: add(add(at, mul(fu, -5.5)), add(mul(lag, 0.5), mul(ff, -0.6))), ra: 1.0, rb: 0.6, ramp: GREY_HAIR });
    }
  }
  return add(hc, add(mul(ff, hr[0] * 1.02), mul(fu, -hr[2] * 0.4)));
}

/** The Hush leaking out of them at each moment, laid after their edge (Mob.grains). */
const BREATH = new WeakMap<Moment, [V3, string, number][]>();
/** What a moment of a move says over and above the bones: how open their eyes are (0 shut, asleep); how hard the scream blasts out of them (0 none). */
export interface PatientSay {
  eyes: (m: Moment) => number;
  scream: (m: Moment) => number;
}
function patientBits(who: PatientWho, st: Stage, m: Moment, say: PatientSay): Bit[] {
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
  const ph = m.wind * Math.PI * 2;
  const lag = lagOf(m, 1.5, 3.0);
  const jaw = clamp01(m.jaw ?? 0.4);
  const open = clamp01(q.pt);
  const eyes = clamp01(say.eyes(m)) * (1 - clamp01(q.out));
  const seed = who === 'man' ? 6 : 7;
  const ramp = who === 'man' ? NIGHTSHIRT : NIGHTGOWN;
  for (const side of ['L', 'R'] as const) leg(put, s, side, ramp);
  gown(put, s, who === 'man' ? 0.22 : 0.86, ramp, lag, ph, who === 'man' ? [0, 24, -24, 48, -48, 72, -72, 96, -96, 120, -120, 144, -144, 168, -168] : [20, -20, 60, -60, 110, -110, 160, -160]);
  // its placket at the throat: a slit and two buttons
  const throat = add(add(s.neck, mul(cu, -2.2)), mul(cf, HB.ribDeep * 0.55 + 1.6));
  put('body', 'placket', { k: 'rod', a: throat, b: add(throat, add(mul(cu, -3.4), mul(cf, 0.8))), ra: 0.3, rb: 0.3, ramp: [INK, INK, '#4a463e', '#5a564c', '#5a564c'] });
  // THE WARD'S NUMBER, inked on the breast in the Order's black
  put('body', 'number', {
    k: 'panel',
    c: add(add(lerp3(s.ribs, s.neck, 0.42), mul(cf, HB.ribDeep + 2.0)), mul(cl, 2.2)),
    u: mul(cl, 1.5),
    v: mul(cu, 1.2),
    skin: (a, b, front) => (!front ? null : Math.abs(a) < 0.25 && Math.abs(b) < 0.55 ? null : INKBLOT),
  });
  if (who === 'woman') {
    // her shawl: round her shoulders and down her back, its ends crossed over her breast
    const top = add(s.neck, mul(cu, -0.6));
    const ring1: Ring = { c: top, u: mul(cf, 3.6), v: mul(cl, 4.4) };
    const ring2: Ring = { c: add(lerp3(s.ribs, s.neck, 0.7), mul(cf, -0.4)), u: mul(cf, HB.ribDeep + 2.6), v: mul(cl, HB.shoulderHalf + 2.3) };
    const ring3: Ring = { c: add(lerp3(s.ribs, s.neck, 0.3), mul(cf, -0.8)), u: mul(cf, HB.ribDeep + 2.8), v: mul(cl, HB.ribHalf + 3.1) };
    put('shawl', 'shawl', { k: 'cloth', rings: [ring1, ring2, ring3], ramp: SHAWL, look: { folds: [60, -60, 150, -150], lift: 0.06 }, torn: [2, 0, 3, 1, 0, 2, 3, 1, 2, 0, 1, 3, 0, 2, 1, 3] });
    for (const k of [-1, 1]) {
      const a = add(add(lerp3(s.ribs, s.neck, 0.8), mul(cl, k * HB.shoulderHalf * 0.7)), mul(cf, HB.ribDeep * 0.6));
      const b = add(add(lerp3(s.ribs, s.neck, 0.15), mul(cl, -k * HB.ribHalf * 0.5)), mul(cf, HB.ribDeep + 2.7));
      put('shawl', 'shawl', { k: 'rod', a, b, ra: 1.8, rb: 1.6, ramp: SHAWL });
    }
  }
  for (const side of ['L', 'R'] as const) arm(put, s, side, ramp, open, cu);
  put('neck', 'neck', { k: 'rod', a: add(s.neck, mul(cu, -1.5)), b: lerp3(s.neck, s.head, 0.5), ra: 2.1, rb: 1.9, ramp: SKIN });
  const mouth = head(put, st, s, who, jaw, eyes, lag);
  const [ff, fl, fu] = wornOn(st, s, 8);
  // THE WARNING: the throat burning the enemy's pink under their clutching hands
  if (m.glint > 0.05) put('glint', 'neck', { k: 'glow', p: lerp3(s.neck, s.head, 0.25), c: FLAME[1], r: 5 + 5 * m.glint, a: 0.45 * m.glint });
  // THE HUSH: leaking out of them, faint as they sleep; THE SCREAM, a burst of it blasting out before them
  const awake = clamp01(say.eyes(m));
  const puff = m.dying ? Math.max(0, 2.2 * (1 - clamp01((m.t - 0.15) / 1.1))) : (0.25 + 0.5 * awake) + 0.8 * clamp01(m.glint);
  hushBreath(put, mouth, ff, fl, m.t, puff, seed);
  const blast = say.scream(m);
  if (blast > 0) screamBurst(put, mouth, ff, fl, fu, blast, seed);
  if (m.dying) hushLeaves(put, mouth, ff, fl, m.t, seed, 0.12, 1.7);
  return bits;
}

/**
 * THE SCREAM WITH NO SOUND, in their own picture: the Hush blasting out of the gaping mouth in a burst before them,
 * `k` from its first puff (0) to gone (1): sixty-four puffs flung out forward in a widening cone, slowing, thinning. (The
 * burst's reach across the floor is the game's: art/patient_shots.ts.)
 */
function screamBurst(put: Put, mouth: V3, ff: V3, fl: V3, fu: V3, k: number, seed: number): void {
  for (let i = 0; i < 64; i++) {
    const born = 0.3 * hash(i, seed, 7511);
    const age = (k - born) / 0.7;
    if (age <= 0 || age >= 1) continue;
    const a = (hash(i, seed + 1, 7511) - 0.5) * 1.5;
    const b = (hash(i, seed + 2, 7511) - 0.5) * 1.0;
    const out = 3 + 36 * Math.sqrt(age) * (0.55 + 0.45 * hash(i, seed + 3, 7511));
    const p = add(mouth, add(mul(ff, out * Math.cos(a)), add(mul(fl, out * Math.sin(a)), add(mul(fu, out * b * 0.6), [0, 0, -out * 0.12]))));
    const c = age < 0.3 ? BREATH_PALE : age < 0.55 ? HUSH[4] : age < 0.8 ? HUSH[3] : HUSH[2];
    if (age > 0.75 && hash(i, Math.floor(k * 40), 7512) < (age - 0.75) * 4) continue;
    put('hush', 'hush', { k: 'mote', p, c, size: age < 0.5 ? 3 : 2 });
  }
}

// =============================================================================================
// THEIR REST

/** Their rest, as floor 11's Hushed, but sicker: stooped, unsteady, the left hand at the throat their words were drawn from. */
const REST0: Bones = {
  ...HUSHED_REST,
  pz: -1.2, pitch: 10, bend: 14, roll: 3, side: 2, faceUp: 2, faceTilt: -12, faceTurn: 4,
  lhIn: 1, lhx: 5.0, lhy: -4.6, lhz: -9.0, le: 0,
  rhIn: 1, rhx: 3.4, rhy: -3.4, rhz: -20.5, re: 8,
};
export const PT_REST: Bones = { ...REST0, le: elbowFor(HB, REST0 as Posed, true, norm([0.25, 0.35, -1])) };
export const PT_STAND_LONG = 3.0;
/** Their mouth, working on words that make no sound. */
export function patientJaw(t: number): number {
  const u = fr(t / PT_STAND_LONG);
  return 0.3 + 0.5 * Math.max(0, Math.sin(u * Math.PI * 6)) * (u < 0.7 ? 1 : 0.3);
}

/** THEM AS THE PAINTER TAKES THEM. */
export function patientPainter(who: PatientWho, say: PatientSay): { bits: (st: Stage, m: Moment) => Bit[]; grains: (st: Stage, m: Moment) => ReadonlyArray<readonly [V3, string, number]> } {
  return { bits: (st, m) => patientBits(who, st, m, say), grains: (_st, m) => BREATH.get(m) ?? [] };
}
