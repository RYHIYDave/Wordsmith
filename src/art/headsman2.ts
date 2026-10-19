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
// a lean, wiry body, the Warden's height still, in tight leathers; a long axe, its haft as long as he is
// tall, held at its middle and spun like a staff. Of the first look of him, his words by 17:51: "The
// crescent head of the axe is weird, and I like the full coat look with the wiry frame underneath": so the
// blade is a broad solid one (as the first Headsman's), not a crescent, and he wears a long coat, cut close,
// over the wiry frame; and to that, by 17:57, "Yes, animate him (Recommended)".
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

/** THE SWITCH, ON SINCE VERSION 23.0: his yes, 17 Oct 2026, 21:04 Eastern, asked "Send the Headsman to main?": "Yes" (the art chat's post of 21:06). With HEADSMAN2_FIGHT (game/bosses.ts). */
export const HEADSMAN2 = { on: true };

export const D = Math.PI / 180;
export type P = Partial<Bones>;
export const clamp01 = (v: number): number => Math.max(0, Math.min(1, v));

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

/** As he dies: when the axe falls from his hands, and when his hood slips off, empty (seconds into his death). */
export const H2_AXE_GOES = 0.3;
/** The blade wheel's name (art/headsman2_moves.ts): as it spins (its `gale`), the painter draws the wheel of fire. */
export const WHEEL_NAME = 'The blade wheel';
/** The flurry's name, and its three cuts (seconds into it): the third comes down before him and bites the floor. */
export const FLURRY_NAME = 'The flurry';
export const H2_FLURRY_HITS = [0.62, 1.08, 1.54] as const;
export const H2_HOOD_GOES = 1.32;

/**
 * His canvas: room for his long axe held high over his hood, spun round him, and flung out at full reach, and
 * for the ground his flurry and his vault carry him over before the game moves him, and his feet up on top of the
 * haft in the vault (in every frame of every move both ways round he reaches at most 156 to the left of where he
 * stands, 299 up, 262 to the right and 118 down: tests/headsman2.test.ts keeps a margin round him).
 */
export const H2_CANVAS: MobCanvas = { w: 480, h: 450, ax: 200, ay: 316 };

// ---------------------------------------------------------------------------------------------
// HIS LONG AXE. A haft as long as he is tall, of dark wood bound in iron, an iron spike at its foot; at
// its head a broad crescent of black steel as the first Headsman's (solid: the owner, 17 Oct, to a hollow
// half moon: "The crescent head of the axe is weird"), narrow where it is set on the haft and broad at
// its edge, the edge bowed out, a square poll behind. He holds it at its middle, as a staff is held, and
// spins it so.

/** From the butt (the haft's foot) to the eye (where the head is set on it), and the blade: how far its edge reaches out from the haft, how tall it is along it. */
export const AXE2_LEN = 100;
export const BLADE_OUT = 31;
export const BLADE_TALL = 48;
/** How far past the eye the haft runs (its iron cap). */
export const HAFT_TOP = 8.5;
/** How far the butt's spike runs out below the haft's foot. */
export const SPIKE = 9;
/** Where his right hand holds it, from the butt: `draw` 0 at its very foot (to swing it at full reach, his left hand at the end below it), 1 at its middle (to spin it, to carry it). */
export const AXE2_HOLD = (draw: number): number => 6 + 44 * clamp01(draw);

/** The way the haft runs, and the way its edge faces (as `bosses3.ts` has it: `pAz`, `pEl`, made into the bones' roll by `resolveAxe2`). */
export function axeWay(pt: V3, edge: V3, over = false): P {
  const p = norm(pt);
  const e = norm(sub(edge, mul(p, dot(edge, p))), [0, 0, -1]);
  const az = Math.atan2(p[1], p[0]) / D;
  const el = Math.asin(Math.max(-1, Math.min(1, p[2]))) / D;
  return { wAz: over ? az + 180 : az, wEl: over ? 180 - el : el, wRoll: 0, pAz: Math.atan2(e[1], e[0]) / D, pEl: Math.asin(Math.max(-1, Math.min(1, e[2]))) / D };
}
/**
 * THE WAY HIS BLADE FACES: as the pose says it (`pAz`, `pEl`, a way on the floor's own axes, said for each
 * key and going smoothly from key to key), square to the haft. (Not as a roll about the haft measured from
 * some way of his body: any such way is one the haft must sometimes run along, spun as this axe is, and
 * there the roll cannot be measured and the blade would spin round between two keys.)
 */
export function axe2EdgeOf(s: Skeleton, q: { pAz: number; pEl: number }): V3 {
  const p = s.point;
  const e = heading(q.pAz, q.pEl);
  const r = sub(e, mul(p, dot(e, p)));
  return len(r) > 1e-4 ? norm(r) : norm(cross(p, [0, 0, 1]), [0, 1, 0]);
}
/** Each key's way the blade faces, said within half a turn of the last key's (so that it goes the short way round from one to the next). */
export function resolveAxe2(keys: ReadonlyArray<Key3>, rest: Bones): Key3[] {
  let last: number | undefined;
  let lastW: number | undefined;
  return keys.map((k) => {
    const w = { ...rest, ...k.pose };
    let az = w.pAz;
    if (last !== undefined) az -= 360 * Math.round((az - last) / 360);
    last = az;
    // (and the way the haft runs, from the last key's as it was said for the way on from it: so that it too goes the short way round)
    let wAz = w.wAz;
    if (lastW !== undefined) wAz -= 360 * Math.round((wAz - lastW) / 360);
    lastW = k.as?.wAz !== undefined ? k.as.wAz - 360 * Math.round((k.as.wAz - wAz - 180) / 360) : wAz;
    const as = k.as?.wAz !== undefined ? { ...k.as, wAz: lastW } : k.as;
    return { ...k, pose: { ...k.pose, pAz: az, pEl: w.pEl, wAz }, ...(as ? { as } : {}) };
  });
}
export function resolvedRest(b: Bones): Bones {
  return { ...b };
}
/** A move of his with each key's blade made to go the short way round. */
export const axed = (m: Motion, rest: Bones): Motion => ({ ...m, keys: resolveAxe2(m.keys, rest) });

/** WHERE HIS AXE IS: its butt (the haft's foot), the eye of its head, the middle of its edge and the edge's two horns, the way the edge faces, and the spike's point. */
export function axe2Of(s: Skeleton, q: { draw: number; pAz: number; pEl: number }): { butt: V3; eye: V3; edge: V3; horns: readonly [V3, V3]; out: V3; spike: V3 } {
  const pt = s.point;
  const out = axe2EdgeOf(s, q);
  const draw = q.draw;
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
function axe2Solids(put: Put, butt: V3, pt: V3, out: V3, tassel?: { lag: V3; wave: number }, seen?: V3): void {
  const eye = add(butt, mul(pt, AXE2_LEN));
  const top = add(eye, mul(pt, HAFT_TOP));
  put('haft', 'axe', { k: 'rod', a: butt, b: top, ra: 1.55, rb: 1.45, ramp: HAFT });
  put('haft', 'axe', { k: 'rod', a: add(butt, mul(pt, 5)), b: add(butt, mul(pt, -SPIKE)), ra: 2.0, rb: 0.5, ramp: IRON });
  for (const k of [0.14, 0.4, 0.62, 0.84]) bandOn(put, 'haft', 'axe', butt, eye, k, 1.9, 1);
  put('haft', 'axe', { k: 'ball', c: top, ax: sphere(2.0), skin: IRON });
  put('head', 'axe', { k: 'rod', a: add(eye, mul(pt, -5)), b: add(eye, mul(pt, 6)), ra: 2.8, rb: 2.8, ramp: IRON });
  put('blade', 'axe', { k: 'panel', c: add(eye, add(mul(out, BLADE_OUT / 2 + 1.5), mul(pt, 1.5))), u: mul(out, BLADE_OUT / 2), v: mul(pt, BLADE_TALL / 2), skin: bladeSkin });
  put('head', 'axe', { k: 'ball', c: add(eye, mul(out, -3.4)), ax: [mul(out, 2.3), mul(norm(cross(pt, out), [0, 0, 1]), 2.4), mul(pt, 4.0)], skin: IRON });
  // (its edge, honed bright, as a thin line of steel of its own: so that seen edge on, when the flat of the blade is a line and paints nothing, the blade is still there, a bright sliver)
  const edgeAt = (yy: number): V3 => add(eye, add(mul(out, 1.5 + BLADE_OUT - 5 * yy * yy - 1.2), mul(pt, 1.5 + yy * (BLADE_TALL / 2))));
  for (let i = 0; i < 6; i++) put('blade', 'axe', { k: 'rod', a: edgeAt(-0.82 + (1.64 * i) / 6), b: edgeAt(-0.82 + (1.64 * (i + 1)) / 6), ra: 1.0, rb: 1.0, ramp: STEEL });
  // (and, seen nearly edge on, the thickness of the blade from the head out to the edge, as the flat then shows it)
  if (!seen || Math.abs(dot(norm(cross(pt, out)), seen)) < 0.3) put('blade', 'axe', { k: 'rod', a: add(eye, add(mul(out, 3), mul(pt, 1.5))), b: edgeAt(0), ra: 0.9, rb: 0.6, ramp: BLACK_STEEL });
  if (tassel) {
    const knot = add(eye, add(mul(pt, -6), mul(out, -2.6)));
    const hang = norm(add([0, 0, -1], add(mul(tassel.lag, 0.35), [Math.sin(tassel.wave) * 0.12, Math.cos(tassel.wave * 1.3) * 0.12, 0])));
    put('tassel', 'axe', { k: 'rod', a: knot, b: add(knot, mul(hang, 9)), ra: 1.3, rb: 2.2, ramp: BLOOD });
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

/** A skirt's rings kept on the floor, not in it: a ring that would dip below it (tilted as he kneels or lunges) lifted until it does not. */
function offFloor(rings: Ring[]): Ring[] {
  const FLOOR = 0.6;
  return rings.map((r) => {
    const under = r.c[2] - Math.hypot(r.u[2], r.v[2]);
    const lowPt = r.pts ? Math.min(...r.pts.map((p) => p[2])) : Infinity;
    const up = Math.max(0, FLOOR - under, FLOOR - lowPt);
    if (up <= 0) return r;
    return { ...r, c: [r.c[0], r.c[1], r.c[2] + up], pts: r.pts?.map((p): V3 => [p[0], p[1], p[2] + up]) };
  });
}

/** A limb no further than `most` from where it was a moment before (the lag of what hangs off him). */
function capped(v: V3, most: number): V3 {
  const l = len(v);
  return l > most ? mul(v, most / l) : v;
}

/**
 * HIS COAT'S TWO SKIRTS at a moment, from his waist to below his knees, one round each leg (split before
 * and behind), kept close to the leg it goes round; hanging back by `lag` (how far he has come since a
 * moment before), in the wind. For his painter and for the checks (art/boss_checks.ts: nothing goes
 * through his coat).
 */
export function coatSkirts(s: Skeleton, lag: V3 = [0, 0, 0], wind = 0, gale = 0): ['L' | 'R', Ring[]][] {
  const B = B2;
  const waistC = add(s.pelvis, mul(s.hips[2], B.waist * 0.55));
  return (['L', 'R'] as const).map((side) => {
    const sgn = side === 'L' ? 1 : -1;
    const one: Skeleton = side === 'L' ? { ...s, hipR: s.hipL, kneeR: s.kneeL, ankleR: s.ankleL, heelR: s.heelL, toeR: s.toeL } : { ...s, hipL: s.hipR, kneeL: s.kneeR, ankleL: s.ankleR, heelL: s.heelR, toeL: s.toeR };
    const top: Ring = { c: add(waistC, mul(s.hips[1], sgn * B.waistHalf * 0.42)), u: mul(s.hips[0], B.waistDeep + 2.4), v: mul(s.hips[1], B.waistHalf * 0.66 + 2.4) };
    return [side, offFloor(hugged(skirtOf(one, B, { top, drop: B.thigh * 1.62, wide: B.pelvisHalf * 0.6 + 4, deep: B.pelvisDeep + 5, lag, wind, gale, pad: 1.3 }), top.c, B.pelvisDeep + 6, B.pelvisHalf * 0.6 + 5.5, 7))];
  });
}

/** THE HEADSMAN, MADE NEW, AS SOLIDS: boots, tight leathers, straps and belt, the sash, bracers and gloves, the hood and its short cape (empty), the long axe. */
export function headsman2Bits(st: Stage, m: Moment): Bit[] {
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
    // (the foot's own frame: level, as when he stands, its sole down; and a foot pointed up or down, as in the
    // air over his head, its sole turned with it, not squashed flat against the floor's up)
    const side3 = norm(Math.abs(fwd[2]) < 0.95 ? [-fwd[1], fwd[0], 0] : cross(s.hips[2], fwd), [0, 1, 0]);
    const steep = clamp01((Math.abs(fwd[2]) - 0.35) / 0.4);
    const up3 = norm(add(mul([0, 0, 1], 1 - steep), mul(cross(fwd, side3), steep)), [0, 0, 1]);
    put(`boot${side}`, `foot${side}`, { k: 'ball', c: add(lerp3(heel, toe, 0.52), mul(up3, 2.0)), ax: [mul(fwd, 8.6), mul(side3, 3.4), mul(up3, 2.3)], skin: BLACK, far: true });
    bandOn(put, `boot${side}`, `boot${side}`, knee, ankle, 0.16, rK * 1.24, 2);
  }

  // --- HIS LONG COAT (the owner, 17 Oct: "I like the full coat look with the wiry frame underneath"): dark
  // leather as the first Headsman's, but cut close to a lean body, from his throat to his calves; its skirts
  // SPLIT before and behind, one round each leg, so that a stride or a lunge parts them, and they fly out
  // after him as he darts ---
  const waistC = add(s.pelvis, mul(s.hips[2], B.waist * 0.55));
  const be = s.belly;
  for (const [side, rings] of coatSkirts(s, mul(lag, 1.4), m.wind, q.gale)) put(`coat${side}`, 'coat', { k: 'cloth', rings, ramp: COAT, look: { folds: [30, -30, 90, -90, 150, -150], lift: 0.1 } });
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
        const p0 = add(add(knot, add(mul(be[0], off * (1 - j)), mul(be[1], 1.2 * j))), add([0, 0, -drop * j], add(mul(lag, 2.4 * j * j), mul(l, sway))));
        // (lying on the floor where it reaches it, not into it)
        const p: V3 = [p0[0], p0[1], Math.max(p0[2], 1.4)];
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
    if (m.dying && m.t > H2_HOOD_GOES) {
      // the last of the pink, rising out of his empty collar and fading: there was nobody in it
      const k = (m.t - H2_HOOD_GOES) / 0.9;
      for (let i = 0; i < 12; i++) {
        const life = (k * 1.4 + hash(i, 1, 71)) % 1;
        if (k + hash(i, 2, 71) * 0.5 > 1.3) continue;
        const a = hash(i, 3, 71) * Math.PI * 2;
        const p = add(collar, [Math.cos(a) * 3 * (1 - life), Math.sin(a) * 3 * (1 - life), 1 + life * 16]);
        put('wisp', 'wisp', { k: 'mote', p, c: life < 0.4 ? FLAME[2] : FLAME[1], size: 2 });
      }
      if (k < 1) put('wisp', 'wisp', { k: 'glow', p: add(collar, [0, 0, 4]), c: SOCKET, r: 10, a: 0.4 * (1 - k) });
    }
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
    const a = axe2Of(s, q);
    axe2Solids(put, a.butt, s.point, a.out, { lag, wave }, st.eye);
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

  // --- THE WEIGHT OF HIS BLOWS: the way his blade went through the air, a band of the enemy's fire along its edge's path, widest and hottest just behind the blade ---
  if (m.trails && m.trails.length >= 4 && lit > 0.1) {
    const edgeT = smoothed(m.trails[1]);
    const eyeT = smoothed(m.trails[3]);
    const n = edgeT.length - 1;
    for (let i = 1; i <= n; i++) {
      const age0 = (i - 1) / n;
      const age1 = i / n;
      const a0 = edgeT[i - 1];
      const a1 = edgeT[i];
      const b0 = eyeT[i - 1];
      const b1 = eyeT[i];
      const long = Math.max(1, Math.ceil(Math.hypot(...(st.at(a1).map((v, k) => v - st.at(a0)[k]) as [number, number])) / 1.2));
      for (let j = 0; j < long; j++) {
        const f2 = j / long;
        const age = age0 + (age1 - age0) * f2;
        const e = lerp3(a0, a1, f2);
        const y = lerp3(b0, b1, f2);
        // (from the edge in toward the haft: the band is the blade's outer half when new, a thread when old)
        const w = 0.95 * (1 - age) + 0.08;
        const across = Math.max(1, Math.ceil(Math.hypot(...(st.at(lerp3(e, y, w)).map((v, k) => v - st.at(e)[k]) as [number, number])) / 1.2));
        for (let k = 0; k <= across; k++) {
          const u = (k / across) * w;
          if (age > 0.45 && hash(i * 97 + j, k, 79) < (age - 0.45) * 1.6) continue;
          const c = u < 0.05 ? (age < 0.3 ? FLAME[4] : FLAME[3]) : age < 0.22 ? FLAME[3] : age < 0.5 ? FLAME[2] : FLAME[1];
          // (where it breaks up as it fades, flecks a game pixel big: never a picture pixel alone, which his pink edge would make a cross)
          put('streak', 'streak', { k: 'mote', p: lerp3(e, y, u), c, size: age > 0.4 ? 2 : 1 });
        }
      }
    }
    put('streak', 'streak', { k: 'glow', p: edgeT[Math.min(2, n)], c: FLAME[3], r: 18, a: 0.32 });
  }

  // --- THE BLADE WHEEL AT FULL SPIN (art/headsman2_moves.ts): a wheel of the enemy's fire where its edge goes round, before him, faint but for where the blade is ---
  if (m.move === WHEEL_NAME && q.gale > 0.3 && !m.bare && lit > 0.1) {
    const a = axe2Of(s, q);
    const hub = s.handR;
    const rr = len(sub(a.edge, hub));
    const rs = len(sub(a.spike, hub));
    const k = clamp01((q.gale - 0.3) / 0.5);
    const fwd = norm([s.hips[0][0], s.hips[0][1], 0], [1, 0, 0]);
    const lft: V3 = [-fwd[1], fwd[0], 0];
    const n = 64;
    for (let i = 0; i < n; i++) {
      const ang = (i / n) * Math.PI * 2;
      const dir = add(mul(lft, Math.cos(ang)), mul([0, 0, 1], Math.sin(ang)));
      if (hash(i, Math.floor(m.t * 30 + 1e-6), 61) > 0.55 * k) continue;
      put('wheel', 'wheel', { k: 'mote', p: add(hub, mul(dir, rr)), c: i % 3 === 0 ? FLAME[2] : FLAME[1], size: 2 });
      if (i % 2 === 0) put('wheel', 'wheel', { k: 'mote', p: add(hub, mul(dir, rs)), c: FLAME[1], size: 2 });
    }
    put('wheel', 'wheel', { k: 'glow', p: hub, c: FLAME[2], r: rr * 0.8, a: 0.18 * k });
  }

  // --- WHERE HIS BLADE BITES THE FLOOR: stone chips thrown up and out, and dust ---
  // (the flurry's third cut, not its first, is the one that comes down on the floor)
  const since = m.move === FLURRY_NAME ? m.t - H2_FLURRY_HITS[2] : m.since;
  if (since !== undefined && since >= 0 && since < 0.4 && !m.bare && !m.dying) {
    const ax = axe2Of(s, q);
    const low = [ax.edge, ax.horns[0], ax.horns[1]].reduce((a, b) => (b[2] < a[2] ? b : a));
    if (low[2] < 4) {
      const k = since / 0.4;
      for (let i = 0; i < 18; i++) {
        const a = hash(i, 1, 83) * Math.PI * 2;
        const sp = 10 + 22 * hash(i, 2, 83);
        const vz = 30 + 40 * hash(i, 3, 83);
        const tt = since;
        const z = Math.max(0, vz * tt - 0.5 * 260 * tt * tt);
        put('chips', 'chips', { k: 'mote', p: [low[0] + Math.cos(a) * sp * tt * 1.4, low[1] + Math.sin(a) * sp * tt * 1.4, z + 0.5], c: i % 3 === 0 ? STEEL[2] : i % 3 === 1 ? '#6a6488' : '#3b3052', size: i % 4 === 0 ? 3 : 2 });
      }
      for (let i = 0; i < 12; i++) {
        if (hash(i, 7, 83) < k * 0.9) continue;
        const a = (i / 12) * Math.PI * 2 + hash(i, 4, 83);
        const r = 3 + (8 + 8 * hash(i, 5, 83)) * Math.sqrt(k);
        const z = 0.6 + (2 + 4 * hash(i, 6, 83)) * Math.sin(Math.PI * Math.min(1, k * 1.2));
        put('dust', 'dust', { k: 'mote', p: [low[0] + Math.cos(a) * r * 1.3, low[1] + Math.sin(a) * r, z], c: i % 2 ? '#4a4266' : '#6a6488', size: 2 });
      }
      if (since < 0.08) put('chips', 'chips', { k: 'glow', p: [low[0], low[1], 2], c: FLAME[3], r: 16, a: 0.6 });
    }
  }
  void mid;
  return bits;
}
/** A way through the air smoothed: three points on the curve (Catmull-Rom) between each two it was at. */
function smoothed(pts: V3[]): V3[] {
  if (pts.length < 3) return pts;
  const out: V3[] = [];
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[Math.min(pts.length - 1, i + 2)];
    for (let k = 0; k < 3; k++) {
      const t = k / 3;
      const t2 = t * t;
      const t3 = t2 * t;
      const w0 = -0.5 * t3 + t2 - 0.5 * t;
      const w1 = 1.5 * t3 - 2.5 * t2 + 1;
      const w2 = -1.5 * t3 + 2 * t2 + 0.5 * t;
      const w3 = 0.5 * t3 - 0.5 * t2;
      out.push([0, 1, 2].map((j) => p0[j] * w0 + p1[j] * w1 + p2[j] * w2 + p3[j] * w3) as unknown as V3);
    }
  }
  out.push(pts[pts.length - 1]);
  return out;
}

// ---------------------------------------------------------------------------------------------
// HOW HE STANDS: light on his feet, side-on, his knees bent, his weight forward on the balls of his
// feet; the long axe held at its middle in his right hand, slanting up behind him over his right
// shoulder, the crescent high over his hood and its foot's spike low before him; his left hand open
// before him, low, its fingers spread. His hood low, looking at you.

export const H2_HANG = -(B2.upperArm + B2.foreArm) * 0.9;
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
export const H2_GUARD: P = {
  rhIn: 2, rhx: 2, rhy: -15, rhz: 66, re: 30,
  ...axeWay([-0.42, -0.2, 0.88], [-0.1, -1, 0]),
  lhIn: 0, lhx: 21, lhy: -1, lhz: -21, le: -52,
  draw: 1,
};
/** His guard as first drawn (his look, his yes by 17:57): his right hand where the guard puts it on the floor's own axes. */
export const H2_LOOK: Bones = resolvedRest({ ...H2_BASE, ...H2_GUARD });
