// THE HEADSMAN, MADE NEW (the art chat, 17 Oct 2026). A MOCK-UP: NOT IN THE GAME. Nothing of the game
// imports this file, and `HEADSMAN2.on`, the switch the main chat would put him in by, is off.
//
// His words to the main chat, 17 Oct, 11:37 (Eastern), after playing Version 22.0, sent to the art chat
// at his word: "I’d like the headsman completely redesigned to be sleeker and more agile." His picks in
// the art chat, one pop-up (by 15:55 Eastern): his build, "Lean, with a long axe (Recommended)" (offered
// as: tall and wiry in tight leathers, keeping the pointed hood and blood-red colours; a long crescent
// axe he spins like a staff); how he moves, "Darting dashes" (quick sideways dashes and sudden lunges);
// his attacks, "All new attacks" (the main chat changes his fight to match).
//
// Kept from the first Headsman (art/bosses3.ts), as his brief had it: the executioner's tall pointed
// hood, and nobody in it (its opening dark all the way in, the pink burning there); the blood-red. New:
// a lean, wiry body, the Warden's height still, in tight leathers; a long crescent axe, its haft as long
// as he is tall, held at its middle and spun like a staff.
//
// He is a monster of art/new_mobs3.ts's kind (a `Mob`: posed on the heroes' bones, dressed in the
// heroes' solids, lit from the upper left, the enemy's pink edge round him), on a canvas of his own.

import { INK, STEEL, dim, hash } from './kit';
import type { Ramp } from './kit';
import { FLAME, IRON, RUST, SOCKET } from './mkit';
import { TILE3, bandOn, sphere } from './new_mobs3';
import type { Bit, Mob, MobCanvas, Moment, PanelSkin, Put } from './new_mobs3';
import { mid, skirtOf, wornOn } from './skin';
import type { Ring, Skin, Stage } from './skin';
import { about, add, buildOf, cross, dot, heading, len, lerp3, mul, norm, solve, standing, sub } from './skeleton';
import type { Bones, Build, Key3, Motion, Posed, Skeleton, V3 } from './skeleton';

/** THE SWITCH, OFF. Nothing of the game reads this file; the main chat puts him in by it, on the owner's yes. */
export const HEADSMAN2 = { on: false };

const D = Math.PI / 180;
type P = Partial<Bones>;
const clamp01 = (v: number): number => Math.max(0, Math.min(1, v));

/** His body: the Warden's height still, but lean and wiry: narrow in the shoulder and the waist, long in the leg and the arm, every limb thin (the first Headsman was 112 tall, as broad as a door). */
export const H2_BODY: Build = buildOf(110, 0.96, { shoulders: 1.04, chest: 0.94, depth: 0.9, waist: 0.82, hips: 0.92, legs: 1.1, arms: 1.12, trunk: 0.96, limbs: 1.06, pad: 1.7 });
const B2 = H2_BODY;

/**
 * His colours. THE HOOD and its short cape and the sash: blood-red (a red a step brighter than the first
 * Headsman's, still dark). HIS LONG COAT: dark leather, as the first Headsman's; under it his breeches dark
 * leather; his strap, gloves and boots black leather; the axe's fittings iron; the blade black steel with a
 * bright edge.
 */
export const BLOOD: Ramp = ['#1c0408', '#1c0408', '#4c0c19', '#80182a', '#80182a'];
export const LEATHER: Ramp = ['#120a14', '#120a14', '#2c1424', '#48243a', '#48243a'];
/** His long coat: dark leather, as the first Headsman's. */
const COAT: Ramp = ['#0f0b18', '#0f0b18', '#221a33', '#3b3052', '#3b3052'];
const BLACK: Ramp = ['#0b0812', '#0b0812', '#1a1426', '#2e2640', '#2e2640'];
const HAFT: Ramp = dim(['#2a2466', '#2a2466', '#4640a0', '#6e68cc', '#6e68cc']);
const BLACK_STEEL: Ramp = ['#1a1640', '#1a1640', '#36306e', '#5c56a0', '#5c56a0'];

/** His canvas: room for his long axe held high over his hood, spun round him, and flung out at full reach. */
export const H2_CANVAS: MobCanvas = { w: 460, h: 400, ax: 230, ay: 300 };

// ---------------------------------------------------------------------------------------------
// HIS LONG AXE. A haft as long as he is tall, of dark wood bound in iron, an iron spike at its foot; at
// its head a broad crescent of black steel as the first Headsman's (solid: the owner, 17 Oct, to a hollow
// half moon: "The crescent head of the axe is weird"), narrow where it is set on the haft and broad at
// its edge, the edge bowed out, a square poll behind. He holds it at its middle, as a staff is held, and
// spins it so.

/** From the butt (the haft's foot) to the eye (where the head is set on it), and the blade: how far its edge reaches out from the haft, how tall it is along it. */
export const AXE2_LEN = 100;
const BLADE_OUT = 31;
const BLADE_TALL = 48;
/** How far past the eye the haft runs (its iron cap). */
const HAFT_TOP = 8.5;
/** How far the butt's spike runs out below the haft's foot. */
const SPIKE = 9;
/** Where his right hand holds it, from the butt: `draw` 0 low on it (to swing it long), 1 at its middle (to spin it, to carry it). */
const AXE2_HOLD = (draw: number): number => 32 + 18 * clamp01(draw);

/** The way the haft runs, and the way its edge faces (as `bosses3.ts` has it: `pAz`, `pEl`, made into the bones' roll by `resolveAxe2`). */
function axeWay(pt: V3, edge: V3, over = false): P {
  const p = norm(pt);
  const e = norm(sub(edge, mul(p, dot(edge, p))), [0, 0, -1]);
  const az = Math.atan2(p[1], p[0]) / D;
  const el = Math.asin(Math.max(-1, Math.min(1, p[2]))) / D;
  return { wAz: over ? az + 180 : az, wEl: over ? 180 - el : el, wRoll: 0, pAz: Math.atan2(e[1], e[0]) / D, pEl: Math.asin(Math.max(-1, Math.min(1, e[2]))) / D };
}
function rollFrom(s: Skeleton): V3 {
  const p = s.point;
  const l = s.chest[1];
  const r = sub(l, mul(p, dot(l, p)));
  return len(r) > 1e-3 ? norm(r) : norm(cross(p, [0, 0, 1]), [0, 1, 0]);
}
/** THE WAY HIS BLADE FACES, on his bones. */
export function axe2EdgeOf(s: Skeleton): V3 {
  const p = s.point;
  let flat = sub([0, 0, 1], mul(p, p[2]));
  if (len(flat) < 1e-3) flat = [-1, 0, 0];
  flat = norm(flat);
  const ac = norm(sub(s.across, mul(p, dot(s.across, p))), flat);
  const roll = Math.atan2(dot(cross(flat, ac), p), dot(flat, ac)) / D;
  return about(rollFrom(s), p, roll);
}
/** Each key's roll of the blade made from the way it is to face; each within half a turn of the last. */
function resolveAxe2(keys: ReadonlyArray<Key3>, rest: Bones): Key3[] {
  let last: number | undefined;
  return keys.map((k) => {
    const w = { ...rest, ...k.pose };
    const s = solve(B2, w as Posed);
    const p = s.point;
    const want = heading(w.pAz, w.pEl);
    const R = rollFrom(s);
    const e = norm(sub(want, mul(p, dot(want, p))), R);
    let roll = Math.atan2(dot(cross(R, e), p), dot(R, e)) / D;
    if (last !== undefined) roll -= 360 * Math.round((roll - last) / 360);
    last = roll;
    return { ...k, pose: { ...k.pose, wRoll: roll } };
  });
}
function resolvedRest(b: Bones): Bones {
  return { ...b, wRoll: resolveAxe2([{ at: 0, pose: {} }], b)[0].pose.wRoll as number };
}
/** A move of his with each key's blade roll made. */
const axed = (m: Motion, rest: Bones): Motion => ({ ...m, keys: resolveAxe2(m.keys, rest) });

/** WHERE HIS AXE IS: its butt (the haft's foot), the eye of its head, the middle of its edge and the edge's two horns, the way the edge faces, and the spike's point. */
export function axe2Of(s: Skeleton, draw: number): { butt: V3; eye: V3; edge: V3; horns: readonly [V3, V3]; out: V3; spike: V3 } {
  const pt = s.point;
  const out = axe2EdgeOf(s);
  const butt = add(s.handR, mul(pt, -AXE2_HOLD(draw)));
  const eye = add(butt, mul(pt, AXE2_LEN));
  const at = (k: number): V3 => add(add(eye, mul(out, BLADE_OUT - 3.5)), mul(pt, 1.5 + k * (BLADE_TALL / 2 - 1)));
  return { butt, eye, edge: add(eye, add(mul(out, BLADE_OUT + 1), mul(pt, 1.5))), horns: [at(1), at(-1)], out, spike: add(butt, mul(pt, -SPIKE)) };
}

/**
 * THE BLADE, flat, as a panel (as the first Headsman's): `a` out from the haft (0 at the haft, BLADE_OUT at
 * the edge), `b` along it: narrow where it is set on the haft and broad at its edge, the edge bowed out, its
 * top and foot sweeping out to the edge's two horns; black steel lit as one plane, a bright edge and a dark
 * groove inside it, spots of rust.
 */
const bladeSkin: PanelSkin = (a0, b, front, tone) => {
  const x = a0 + BLADE_OUT / 2;
  const half = BLADE_TALL / 2;
  const yy = b / half;
  const edge = BLADE_OUT - 5 * yy * yy;
  if (x > edge) return null;
  const neck = 5.5;
  const k = Math.max(0, (x - 3) / (BLADE_OUT - 3));
  const reach = neck + (half - neck) * Math.pow(k, 1.6);
  if (Math.abs(b) > reach) return null;
  const t = front ? tone : Math.max(0, tone - 1);
  if (x > edge - 2.4) return STEEL[Math.min(4, t + 1)];
  if (x > edge - 3.6) return BLACK_STEEL[Math.max(0, t - 1)];
  if (x < 4.2 && Math.abs(b) < neck - 0.4) return IRON[Math.min(3, t)];
  if (hash(Math.round(x * 0.8), Math.round(b * 0.8), front ? 5 : 6) < 0.07) return RUST[Math.max(1, Math.min(3, t))];
  return BLACK_STEEL[t];
};

/** HIS AXE AS SOLIDS, from its butt along `pt`, its blade out along `out`: the haft bound in iron, the spike at its foot, the iron collar of the head, the blade, the poll; a blood-red tassel under the head. */
function axe2Solids(put: Put, butt: V3, pt: V3, out: V3, tassel?: { lag: V3; wave: number }): void {
  const eye = add(butt, mul(pt, AXE2_LEN));
  const top = add(eye, mul(pt, HAFT_TOP));
  put('haft', 'axe', { k: 'rod', a: butt, b: top, ra: 1.55, rb: 1.45, ramp: HAFT });
  put('haft', 'axe', { k: 'rod', a: add(butt, mul(pt, 5)), b: add(butt, mul(pt, -SPIKE)), ra: 2.0, rb: 0.5, ramp: IRON });
  for (const k of [0.14, 0.4, 0.62, 0.84]) bandOn(put, 'haft', 'axe', butt, eye, k, 1.9, 1);
  put('haft', 'axe', { k: 'ball', c: top, ax: sphere(2.0), skin: IRON });
  put('head', 'axe', { k: 'rod', a: add(eye, mul(pt, -5)), b: add(eye, mul(pt, 6)), ra: 2.8, rb: 2.8, ramp: IRON });
  put('blade', 'axe', { k: 'panel', c: add(eye, add(mul(out, BLADE_OUT / 2 + 1.5), mul(pt, 1.5))), u: mul(out, BLADE_OUT / 2), v: mul(pt, BLADE_TALL / 2), skin: bladeSkin });
  put('head', 'axe', { k: 'ball', c: add(eye, mul(out, -3.4)), ax: [mul(out, 2.3), mul(norm(cross(pt, out), [0, 0, 1]), 2.4), mul(pt, 4.0)], skin: IRON });
  if (tassel) {
    const knot = add(eye, add(mul(pt, -6), mul(out, -2.6)));
    const hang = norm(add([0, 0, -1], add(mul(tassel.lag, 0.35), [Math.sin(tassel.wave) * 0.12, Math.cos(tassel.wave * 1.3) * 0.12, 0])));
    put('tassel', 'tassel', { k: 'rod', a: knot, b: add(knot, mul(hang, 9)), ra: 1.3, rb: 2.2, ramp: BLOOD });
  }
}

// ---------------------------------------------------------------------------------------------
// HIS BODY AS SOLIDS

/** A SKIRT KEPT CLOSE (as the first Headsman's, art/bosses3.ts): no ring of it deeper or wider than `deep` and `wide`, nor further out from under the waist than `off`. */
function hugged(rings: Ring[], top: V3, deep: number, wide: number, off: number): Ring[] {
  return rings.map((r, i) => {
    if (i === 0) return r;
    const du = len(r.u);
    const dv = len(r.v);
    const ku = du > deep ? deep / du : 1;
    const kv = dv > wide ? wide / dv : 1;
    const fu = mul(r.u, 1 / Math.max(1e-6, du));
    const fv = mul(r.v, 1 / Math.max(1e-6, dv));
    const away: V3 = [r.c[0] - top[0], r.c[1] - top[1], 0];
    const far = len(away);
    const c: V3 = far > off ? [top[0] + (away[0] * off) / far, top[1] + (away[1] * off) / far, r.c[2]] : r.c;
    const pts = r.pts?.map((p) => {
      const d = sub(p, r.c);
      return add(c, add(add(mul(fu, dot(d, fu) * ku), mul(fv, dot(d, fv) * kv)), [0, 0, d[2]]));
    });
    return { c, u: mul(r.u, ku), v: mul(r.v, kv), pts };
  });
}

/** A limb no further than `most` from where it was a moment before (the lag of what hangs off him). */
function capped(v: V3, most: number): V3 {
  const l = len(v);
  return l > most ? mul(v, most / l) : v;
}

/** THE HEADSMAN, MADE NEW, AS SOLIDS: boots, tight leathers, straps and belt, the sash, bracers and gloves, the hood and its short cape (empty), the long axe. */
function headsman2Bits(st: Stage, m: Moment): Bit[] {
  const { s, q } = m;
  const B = B2;
  const bits: Bit[] = [];
  const put: Put = (part, piece, shape) => {
    bits.push({ part, piece, shape });
  };
  const [cf, cl, cu] = s.chest;
  const lit = 1 - clamp01(q.out);
  const lag = capped(mul(m.come, -1.6), 4.2);
  const wave = m.wind * Math.PI * 2;
  const f = norm([s.hips[0][0], s.hips[0][1], 0], [1, 0, 0]);
  const l: V3 = [-f[1], f[0], 0];

  // --- his legs: tight leather breeches, knee-high boots of black leather, pointed, a strap at the top ---
  for (const side of ['L', 'R'] as const) {
    const hip = side === 'L' ? s.hipL : s.hipR;
    const knee = side === 'L' ? s.kneeL : s.kneeR;
    const ankle = side === 'L' ? s.ankleL : s.ankleR;
    const heel = side === 'L' ? s.heelL : s.heelR;
    const toe = side === 'L' ? s.toeL : s.toeR;
    const [rH, rK, rA] = B.legR;
    put(`leg${side}`, `leg${side}`, { k: 'rod', a: hip, b: knee, ra: rH * 1.05, rb: rK * 1.02, ramp: LEATHER, far: true });
    put(`leg${side}`, `leg${side}`, { k: 'ball', c: knee, ax: sphere(rK * 1.06), skin: LEATHER, far: true });
    const top = lerp3(knee, ankle, 0.08);
    put(`boot${side}`, `boot${side}`, { k: 'rod', a: top, b: ankle, ra: rK * 1.16, rb: rA * 1.12, ramp: BLACK, far: true });
    const fwd = norm(sub(toe, heel), [1, 0, 0]);
    const side3 = norm([-fwd[1], fwd[0], 0], [0, 1, 0]);
    put(`boot${side}`, `foot${side}`, { k: 'ball', c: add(lerp3(heel, toe, 0.52), [0, 0, 2.0]), ax: [mul(fwd, 8.6), mul(side3, 3.4), [0, 0, 2.3]], skin: BLACK, far: true });
    bandOn(put, `boot${side}`, `boot${side}`, knee, ankle, 0.16, rK * 1.24, 2);
  }

  // --- HIS LONG COAT (the owner, 17 Oct: "I like the full coat look with the wiry frame underneath"): dark
  // leather as the first Headsman's, but cut close to a lean body, from his throat to his calves; its skirts
  // SPLIT before and behind, one round each leg, so that a stride or a lunge parts them, and they fly out
  // after him as he darts ---
  const waistC = add(s.pelvis, mul(s.hips[2], B.waist * 0.55));
  const be = s.belly;
  const skirts = (['L', 'R'] as const).map((side) => {
    const sgn = side === 'L' ? 1 : -1;
    const one: Skeleton = side === 'L' ? { ...s, hipR: s.hipL, kneeR: s.kneeL, ankleR: s.ankleL, heelR: s.heelL, toeR: s.toeL } : { ...s, hipL: s.hipR, kneeL: s.kneeR, ankleL: s.ankleR, heelL: s.heelR, toeL: s.toeR };
    const top: Ring = { c: add(waistC, mul(s.hips[1], sgn * B.waistHalf * 0.42)), u: mul(s.hips[0], B.waistDeep + 2.4), v: mul(s.hips[1], B.waistHalf * 0.66 + 2.4) };
    const rings = hugged(skirtOf(one, B, { top, drop: B.thigh * 1.62, wide: B.pelvisHalf * 0.6 + 4, deep: B.pelvisDeep + 5, lag: mul(lag, 1.4), wind: m.wind, gale: q.gale, pad: 1.3 }), top.c, B.pelvisDeep + 6, B.pelvisHalf * 0.6 + 5.5, 7);
    put(`coat${side}`, 'coat', { k: 'cloth', rings, ramp: COAT, look: { folds: [30, -30, 90, -90, 150, -150], lift: 0.1 } });
    return rings;
  });
  void skirts;
  const torso: Ring[] = [
    { c: waistC, u: mul(be[0], B.waistDeep + 2.3), v: mul(be[1], B.waistHalf + 2.3) },
    { c: s.ribs, u: mul(cf, B.ribDeep + 2.6), v: mul(cl, B.ribHalf + 2.8) },
    { c: lerp3(s.ribs, s.neck, 0.72), u: mul(cf, B.ribDeep + 2.2), v: mul(cl, B.shoulderHalf + 0.4) },
    { c: add(s.neck, mul(cu, 1.2)), u: mul(cf, 5.0), v: mul(cl, 5.8) },
  ];
  put('body', 'body', { k: 'cloth', rings: torso, ramp: COAT, look: { folds: [0, 50, -50], lift: 0.04 } });
  // a strap across his chest from his left shoulder to his right hip, buckled
  const beltC = add(waistC, mul(s.hips[2], -0.6));
  {
    const from = add(lerp3(s.ribs, s.neck, 0.8), add(mul(cl, B.shoulderHalf * 0.62), mul(cf, B.ribDeep * 0.7)));
    const to = add(beltC, add(mul(be[1], -B.waistHalf * 0.85), mul(be[0], B.waistDeep * 0.75)));
    const midP = add(lerp3(from, to, 0.5), mul(cf, B.ribDeep + 2.6 - B.ribDeep * 0.7));
    put('strap', 'strap', { k: 'rod', a: from, b: midP, ra: 1.25, rb: 1.25, ramp: BLACK });
    put('strap', 'strap', { k: 'rod', a: midP, b: to, ra: 1.25, rb: 1.25, ramp: BLACK });
    put('strap', 'strap', { k: 'ball', c: midP, ax: sphere(1.5), skin: IRON });
  }

  // --- a blood-red sash wound tight round his waist over the coat, knotted at his left hip, its two long tails hanging past his knee and flying out after him ---
  {
    put('belt', 'belt', { k: 'band', ring: { c: beltC, u: mul(be[0], B.waistDeep + 3.0), v: mul(be[1], B.waistHalf + 3.0) }, ramp: BLOOD, rows: 4 });
    const knot = add(beltC, add(mul(be[1], B.waistHalf + 3.0), mul(be[0], 0.6)));
    put('sash', 'sash', { k: 'ball', c: knot, ax: [mul(be[0], 2.6), mul(be[1], 2.0), mul(s.hips[2], 2.6)], skin: (u, tone) => BLOOD[tone] });
    for (const [k, drop, off] of [[0, 30, 1.2], [1, 24, -1.6]] as const) {
      const rings: Ring[] = [];
      const n = 6;
      for (let i = 0; i <= n; i++) {
        const j = i / n;
        const sway = Math.sin(wave + j * 2.2 + k * 1.7) * 1.4 * j;
        const p = add(add(knot, add(mul(be[0], off * (1 - j)), mul(be[1], 1.2 * j))), add([0, 0, -drop * j], add(mul(lag, 2.4 * j * j), mul(l, sway))));
        const w = 2.8 - 0.8 * j;
        rings.push({ c: p, u: mul(f, 0.7), v: mul(l, w) });
      }
      put(`sash${k}`, 'sash', { k: 'cloth', rings, ramp: BLOOD, look: { folds: [0], lift: 0.1 } });
    }
  }

  // --- his arms: the coat's sleeves, close, to his wrists, a cuff turned back; gloves of black leather bound with iron ---
  for (const side of ['L', 'R'] as const) {
    const sh = side === 'L' ? s.shoulderL : s.shoulderR;
    const el = side === 'L' ? s.elbowL : s.elbowR;
    const hand = side === 'L' ? s.handL : s.handR;
    const fore = norm(sub(hand, el), [0, 0, -1]);
    const [r0, r1, r2] = B.armR;
    put(`arm${side}`, `arm${side}`, { k: 'ball', c: sh, ax: sphere(r0 * 1.16), skin: COAT, far: true });
    put(`arm${side}`, `arm${side}`, { k: 'rod', a: sh, b: el, ra: r0 * 1.12, rb: r1 * 1.1, ramp: COAT, far: true });
    put(`fore${side}`, `fore${side}`, { k: 'ball', c: el, ax: sphere(r1 * 1.12), skin: COAT, far: true });
    const cuff = lerp3(el, hand, 0.62);
    put(`fore${side}`, `fore${side}`, { k: 'rod', a: el, b: cuff, ra: r1 * 1.08, rb: r1 * 1.12, ramp: COAT, far: true });
    put(`fore${side}`, `fore${side}`, { k: 'band', ring: { c: cuff, u: mul(norm(cross(fore, cu), cl), r1 * 1.4), v: mul(norm(cross(fore, norm(cross(fore, cu), cl)), cf), r1 * 1.4) }, ramp: COAT, rows: 2 });
    put(`fore${side}`, `fore${side}`, { k: 'rod', a: cuff, b: add(hand, mul(fore, -1.2)), ra: r1 * 1.02, rb: r2 * 1.12, ramp: BLACK, far: true });
    bandOn(put, `fore${side}`, `fore${side}`, cuff, hand, 0.35, r1 * 1.05, 1);
    const fist = add(hand, mul(fore, 1.6));
    const flat = norm(sub(cf, mul(fore, dot(cf, fore))), cu);
    const across = norm(sub(cl, mul(fore, dot(cl, fore))), cl);
    put(`fore${side}`, `fist${side}`, { k: 'ball', c: fist, ax: [mul(fore, 3.2), mul(across, 2.7), mul(flat, 2.4)], skin: BLACK, far: true });
  }

  // --- his hood and its short cape: tall and pointed, swept back, its point lagging after him; a short cape of it over his shoulders, cut in points; and nobody in it ---
  const face = wornOn(st, s, 10);
  const [ff, fl, fu] = face;
  const hc = add(s.head, add(mul(fu, -0.6), mul(ff, -0.5)));
  {
    const hemPts: V3[] = [];
    const capeC = add(add(s.neck, mul(cu, -6.0)), mul(lag, 0.6));
    const capeU = mul(cf, B.ribDeep + 2.6);
    const capeV = mul(cl, B.shoulderHalf + 2.6);
    for (let i = 0; i < 20; i++) {
      const ang = (i / 20) * Math.PI * 2;
      const point = i % 2 === 0;
      const rear = Math.max(0, -Math.cos(ang));
      const p = add(capeC, add(mul(capeU, Math.cos(ang) * (1 + 0.05 * Math.sin(wave + ang))), mul(capeV, Math.sin(ang))));
      hemPts.push(add(p, [0, 0, (point ? -3.4 - rear * 2.4 : 0.4) + Math.sin(wave * 2 + p[0]) * 0.4]));
    }
    const cape: Ring[] = [
      { c: add(s.neck, mul(cu, 3.2)), u: mul(cf, 5.6), v: mul(cl, 6.2) },
      { c: add(s.neck, mul(cu, -1.4)), u: mul(cf, B.ribDeep + 1.8), v: mul(cl, B.shoulderHalf + 1.4) },
      { c: capeC, u: capeU, v: capeV, pts: hemPts },
    ];
    put('cape', 'cape', { k: 'cloth', rings: cape, ramp: BLOOD, look: { folds: [20, -20, 70, -70, 130, -130, 180], lift: 0.25 } });
    const collar = add(s.neck, mul(cu, 3.0));
    put('cape', 'cape', { k: 'ball', c: collar, ax: [mul(cf, 5.0), mul(cl, 5.6), mul(cu, 1.2)], skin: (u) => (u[2] < -0.2 ? null : INK) });
  }
  const hr: V3 = [8.6, 8.0, 9.6];
  const cam = Math.atan2(dot(st.eye, fl), dot(st.eye, ff)) / D;
  const toward = clamp01((110 - Math.abs(cam)) / 40);
  const midA = Math.max(-40, Math.min(40, cam * 0.67)) * toward * D;
  const od: V3 = norm(add(mul(ff, Math.cos(midA)), mul(fl, Math.sin(midA))));
  const os: V3 = norm(sub(fl, mul(od, dot(fl, od))));
  const hoodSkin: Skin = (u, tone) => {
    const flat = Math.hypot(u[0], u[1]);
    const toOpen = flat > 1e-6 ? (u[0] * Math.cos(midA) + u[1] * Math.sin(midA)) / flat : 0;
    if (flat > 0.3 && toOpen > 0.74 && u[2] < 0.5 && u[2] > -0.94) return null;
    if (flat > 0.22 && toOpen > 0.6 && u[2] < 0.64 && u[2] > -1) return BLOOD[Math.min(4, tone + 1)];
    return BLOOD[tone];
  };
  put('hood', 'hood', { k: 'ball', c: hc, ax: [mul(ff, hr[0]), mul(fl, hr[1]), mul(fu, hr[2])], skin: hoodSkin });
  const ic = add(hc, mul(od, -1.6));
  put('hood', 'hood', { k: 'ball', c: ic, ax: [mul(od, hr[0] - 1.5), mul(os, hr[1] - 1.1), mul(fu, hr[2] - 1.3)], skin: (u) => (u[0] < -0.1 ? null : INK) });
  // its point: tall, swept back like a flame, lagging after him as he darts
  const p1 = add(hc, add(mul(fu, hr[2] + 4), mul(ff, -2.6)));
  const tip = add(add(hc, mul(fu, hr[2] + 18)), add(mul(ff, -9.5), mul(lag, 1.5)));
  put('hood', 'hood', { k: 'rod', a: add(hc, mul(fu, hr[2] * 0.3)), b: p1, ra: hr[1] * 0.97, rb: hr[1] * 0.62, ramp: BLOOD });
  put('hood', 'hood', { k: 'rod', a: add(p1, mul(fu, -0.5)), b: tip, ra: hr[1] * 0.64, rb: 0.9, ramp: BLOOD });
  // the pink burning in the dark where a face would be: two points of it, and its light
  if (lit > 0.05) {
    const heat = lit * (1 + 0.7 * clamp01(m.glint));
    for (const k of [-1, 1]) {
      const e = add(ic, add(mul(od, (hr[0] - 1.5) * 0.7), add(mul(os, k * 2.6), mul(fu, -0.5))));
      put('hood', 'hood', { k: 'dot', p: e, c: heat > 1.25 ? FLAME[4] : heat > 0.5 ? SOCKET : FLAME[1], facing: od, c2: heat > 0.5 ? (heat > 1.25 ? FLAME[3] : FLAME[2]) : undefined });
      if (dot(od, st.eye) > 0.05) put('hood', 'hood', { k: 'glow', p: e, c: SOCKET, r: 6 + 4 * Math.max(0, heat - 1), a: Math.min(0.85, 0.5 * heat) });
    }
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2 + m.t * 1.3;
      const e = add(ic, add(mul(od, (hr[0] - 1.5) * 0.62), add(mul(os, Math.cos(a) * 3.8), mul(fu, -1.3 + Math.sin(a) * 2.7))));
      if (hash(i, Math.floor(m.t * 6 + 1e-6), 41) < 0.5 * lit) put('hood', 'hood', { k: 'dot', p: e, c: FLAME[0], facing: od });
    }
  }

  // --- HIS LONG AXE ---
  if (!m.bare) {
    const a = axe2Of(s, q.draw);
    axe2Solids(put, a.butt, s.point, a.out, { lag, wave });
    if (m.glint > 0.05 && lit > 0.1) {
      const g = m.glint;
      for (let i = 0; i <= 10; i++) {
        const k = i / 10;
        const p = k < 0.5 ? lerp3(a.horns[1], a.edge, k * 2) : lerp3(a.edge, a.horns[0], k * 2 - 1);
        if (Math.abs(k - 0.5) < 0.2 + 0.3 * g) put('glint', 'glint', { k: 'mote', p, c: g > 0.8 && Math.abs(k - 0.5) < 0.15 ? FLAME[4] : FLAME[3], size: 1 });
      }
      put('glint', 'glint', { k: 'glow', p: a.edge, c: FLAME[3], r: 5 + 9 * g, a: Math.min(0.8, 0.6 * g) });
    }
  }
  void mid;
  return bits;
}

// ---------------------------------------------------------------------------------------------
// HOW HE STANDS: light on his feet, side-on, his knees bent, his weight forward on the balls of his
// feet; the long axe held at its middle in his right hand, slanting up behind him over his right
// shoulder, the crescent high over his hood and its foot's spike low before him; his left hand open
// before him, low, its fingers spread. His hood low, looking at you.

const H2_HANG = -(B2.upperArm + B2.foreArm) * 0.9;
export const H2_BASE: Bones = {
  ...standing(B2),
  pz: -4.5, px: 0, yaw: -34, pitch: 9, roll: 0, twist: 10, bend: 10, side: 0,
  faceTurn: 22, faceUp: -10, faceTilt: 0,
  lfx: 13, lfy: 6, lft: 12, lk: 22, rfx: -13, rfy: -8, rft: -24, rk: -20,
  lhIn: 0, lhx: 3, lhy: 5, lhz: H2_HANG, le: -10,
  rhIn: 0, rhx: 4, rhy: -5, rhz: H2_HANG, re: 10,
  wAz: 0, wEl: -80, wRoll: 0, draw: 1, pt: 0, out: 0, prop: 0, gale: 0,
};
/** The guard: the axe up behind his right shoulder, his left hand out before him. */
const H2_GUARD: P = {
  rhIn: 2, rhx: 2, rhy: -15, rhz: 66, re: 30,
  ...axeWay([-0.42, -0.2, 0.88], [-0.1, -1, 0]),
  lhIn: 0, lhx: 21, lhy: -1, lhz: -21, le: -52,
  draw: 1,
};
export const H2_REST: Bones = resolvedRest({ ...H2_BASE, ...H2_GUARD });

/** STANDING, ALIVE: light on his feet, bouncing a little on his knees; his hood turning to keep you in it. Two seconds round. (The twirl comes with his moves.) */
function h2Stand(): Motion {
  const R = H2_REST;
  return {
    loop: 0,
    keys: [
      { at: 0, pose: {} },
      { at: 0.5, pose: { pz: R.pz - 1.6, bend: R.bend + 1.5, faceTurn: R.faceTurn - 8, rhz: (R.rhz as number) - 1.5 }, ease: 'io' },
      { at: 1.0, pose: { pz: R.pz + 0.2, faceTurn: R.faceTurn + 6 }, ease: 'io' },
      { at: 1.5, pose: { pz: R.pz - 1.6, bend: R.bend + 1.5, faceTurn: R.faceTurn + 2, rhz: (R.rhz as number) - 1.5 }, ease: 'io' },
      { at: 2.0, pose: {}, ease: 'io' },
    ],
  };
}

/**
 * HOW HE MIGHT MOVE (pictures, for his look: not yet moves): `looks` at 0, 1, 2 and 3 seconds:
 * 0 his guard, as he stands; 1 the axe spun before him, a blur of steel at its middle; 2 darting aside,
 * low and long, the axe trailing; 3 a lunge, the crescent's edge flung out at full reach.
 */
const H2_LOOKS: P[] = [
  {},
  // (spinning it before him: held at its middle, square across him, the crescent up and to his left)
  { pz: -6, yaw: -12, pitch: 8, twist: 0, bend: 8, faceTurn: 6, lfx: 12, lfy: 8, lk: 24, rfx: -12, rfy: -8, rk: -22, rhIn: 1, rhx: 16, rhy: -4, rhz: 6, re: 40, ...axeWay([0.15, 0.55, 0.82], [0.6, 0.3, -0.4]), lhIn: 3, lhx: -16, lhy: 0, lhz: 0, le: -30 },
  // (darting to his left: low, his left foot reaching far out, his right pushing off, the axe trailing low behind him)
  { px: -2, py: 8, pz: -14, yaw: -40, pitch: 16, roll: -12, twist: 16, bend: 14, side: -6, faceTurn: 20, faceUp: -6, lfx: 4, lfy: 30, lft: 30, lk: 40, rfx: -10, rfy: -18, rft: -30, rk: -6, rfp: 30, rhIn: 1, rhx: -6, rhy: -12, rhz: -22, re: 20, ...axeWay([-0.9, -0.3, 0.3], [0, 0, -1]), lhIn: 1, lhx: 8, lhy: 18, lhz: -6, le: -40 },
  // (the lunge: his left foot far forward, his body long and low, the axe at full reach before him, both hands at its foot)
  { px: 16, pz: -20, yaw: -18, pitch: 30, twist: 2, bend: 12, faceTurn: 8, faceUp: -18, lfx: 34, lfy: 6, lk: 48, rfx: -22, rfy: -8, rk: -4, rfp: 26, rhIn: 1, rhx: 24, rhy: -4, rhz: -4, re: 4, ...axeWay([0.86, 0.1, 0.5], [0.4, 0, -0.92]), draw: 0, lhIn: 3, lhx: -9, lhy: 0, lhz: 0, le: -10 },
];
function h2Looks(): Motion {
  return { keys: H2_LOOKS.map((pose, i) => ({ at: i, pose, ease: 'lin' as const })) };
}

export const HEADSMAN_2: Mob = {
  id: 'headsman',
  name: 'The Headsman',
  size: 'a boss: the Warden’s height, lean',
  build: B2,
  stand: { name: 'The Headsman, on his toes, his axe up behind him', motion: axed(h2Stand(), H2_REST), rest: H2_REST },
  attack: { name: 'The Headsman (his attacks come with his moves)', motion: axed(h2Stand(), H2_REST), rest: H2_REST },
  idleFrames: 20,
  idleFps: 10,
  walk: { name: 'The Headsman (his walk comes with his moves)', motion: axed(h2Stand(), H2_REST), rest: H2_REST, period: 2, ground: 0 },
  walkFrames: 20,
  walkFps: 10,
  pace: 0,
  more: {
    looks: { name: 'How he might move (pictures)', motion: axed(h2Looks(), H2_REST), rest: H2_REST },
  },
  reel: { name: 'The Headsman is struck (comes with his moves)', motion: axed(h2Stand(), H2_REST), rest: H2_REST },
  reelTime: 0.3,
  hit: 0.5,
  warn: 0.3,
  dieTime: 2,
  dying: { name: 'The Headsman falls (comes with his moves)', motion: axed(h2Stand(), H2_REST), rest: H2_REST },
  aura: { x: H2_CANVAS.ax - 2, y: H2_CANVAS.ay - 56, r: 84, color: '#ff3a78', a: 0.15 },
  shadow: 24,
  canvas: H2_CANVAS,
  trueBack: true,
  bits: (st, m) => headsman2Bits(st, m),
};
void TILE3;
