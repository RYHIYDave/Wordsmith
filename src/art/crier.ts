// FLOOR 11'S BOSS, THE CRIER (the art chat for floors 11 to 15, 18 Oct 2026). A MOCK-UP: NOT IN THE GAME.
// Nothing of the game imports this file, and `CRIER.on`, the switch the main chat would put him in by, is off.
//
// His plan (the owner's doc "Wordsmith Act 2: The Hush", with his yes): the town crier of the Gate Ward, whose
// voice the Silent Order took first; the Hush speaks through his great brass speaking-trumpet, and nothing
// comes out of it but silence (a trumpet, not a bell: his "Yes", 18 Oct, 05:47 Pacific). His brief, answered
// by pop-up in the art chat, 18 Oct (Pacific):
//   what and where   (his plan) the town crier, in the Crier's Square. Friend or enemy: (his plan) the enemy.
//   size, the feel   “The act 1 boss was a big huge non-moving horror.  I think we want a smaller, quick
//                    moving, no frills fight” (read, and told him: only about a head taller than the knight,
//                    quick on his feet, a straight duel)
//   how he moves     “Heavy and pompous, then sudden (Recommended)” (a rolling, chest-out march as if leading
//                    a parade, breaking into sudden lunges)
//   at a glance      “The great brass trumpet, its throat burning pink (Recommended)”
//   his moves        “Yes, these four (Recommended)”: a swing of the trumpet; the Silent Shout; the
//                    Proclamation; the Crowd
//   his death        “The Hush pours out of him” (grey silence smoking out of the trumpet and his mouth; he
//                    sinks to his knees and falls on his face)
//   never            “Nothing gory (Recommended)”, “Not a clown or jester”
//
// SO: a stout, broad, big-bellied man a head taller than the knight, chest out and chin up, in the city's
// oxblood: a long frock coat with cream lapels and turned-back cuffs, brass buttons, a mustard waistcoat over
// his belly, a cream stock at his throat, a brass chain of office across his chest, a satchel of scrolls at
// his hip, dark breeches, black boots to the knee, a black tricorn trimmed in cream with a cream plume. His
// face a ruddy one, grizzled whiskers and a great moustache, his mouth open on a shout that makes no sound,
// his eyes burning the enemy's pink. His great brass speaking-trumpet, nearly as tall as he is, held upright
// at his side like a herald's staff, its bell up by his hat, its throat burning pink to gold. Dignified, not
// comic: no motley, no bells on him, nothing bright but the brass and the pink.
//
// He is a monster of art/new_mobs3.ts's kind (a `Mob`: posed on the heroes' bones, dressed in the heroes'
// solids, lit from the upper left, the enemy's pink edge round him), on a canvas of his own, as the redone
// Headsman is (the art chat, 17 Oct, on its branch mockup/headsman-redo, whose ways this follows).

import { INK, dim, hash } from './kit';
import type { Ramp } from './kit';
import { FLAME, SOCKET } from './mkit';
import { bandOn, sphere } from './new_mobs3';
import type { Bit, MobCanvas, Moment, Put } from './new_mobs3';
import { skirtOf, wornOn } from './skin';
import type { Ring, Skin, Stage } from './skin';
import { add, buildOf, cross, dot, heading, len, lerp3, mul, norm, standing, sub } from './skeleton';
import type { Bones, Build, Skeleton, V3 } from './skeleton';

/** THE SWITCH, OFF. Nothing of the game reads this file; the main chat puts him in by it, on the owner's yes. */
export const CRIER = { on: false };
/** For looking at him piece by piece (the dev page): what to leave off. */
export const CR_OFF: Record<string, boolean> = {};

export const D = Math.PI / 180;
export type P = Partial<Bones>;
export const clamp01 = (v: number): number => Math.max(0, Math.min(1, v));

/**
 * His body: a head taller than the knight (who is 58), stout: broad in the shoulder, a barrel of a chest, a
 * great belly, thick in the limb, his head a little bigger than life (as the heroes' are, and his hat on it).
 */
/** How much bigger than first drawn (70 tall): his word, 18 Oct, shown him at the game's size: “Bigger at game size” (offered as: keep the look, a little larger on screen). */
export const CR_K = 94 / 70;
export const CR_BODY: Build = buildOf(70 * CR_K, 1.5, { shoulders: 1.16, chest: 1.3, depth: 1.22, waist: 1.62, hips: 1.18, legs: 0.94, arms: 1.0, trunk: 1.0, limbs: 1.24, pad: 1.9 });
const B = CR_BODY;

// ---------------------------------------------------------------------------------------------
// HIS COLOURS (each from its shade to its light, as the painter takes them: two darks, a middle, two lights)

/** His coat: the city's oxblood (the herald's banners', the market's awnings'), a step cooler for the dusk. */
export const COAT: Ramp = ['#1c0a14', '#1c0a14', '#4a1824', '#7c2c36', '#7c2c36'];
/** Its lapels, its cuffs, his stock and his plume, his gloves: cream. */
export const CREAM: Ramp = ['#3c3430', '#3c3430', '#8e8270', '#cdbf9e', '#cdbf9e'];
/** His waistcoat: mustard. */
const VEST: Ramp = ['#281a10', '#281a10', '#6a4c24', '#9c7a3c', '#9c7a3c'];
/** His breeches: dark slate. */
const BREECH: Ramp = ['#100c1a', '#100c1a', '#282236', '#443c56', '#443c56'];
/** His boots, his belt, his hat: black leather and felt. */
const BLACK: Ramp = ['#0a0812', '#0a0812', '#1c1626', '#362e46', '#362e46'];
/** His satchel: brown leather. */
const SATCHEL: Ramp = ['#1c120e', '#1c120e', '#46301e', '#72502e', '#72502e'];
/** Brass: the trumpet, the buttons, the chain, the buckles. Metal, never a glow. */
export const BRASS: Ramp = ['#2e1c10', '#2e1c10', '#8a6226', '#d4a64c', '#d4a64c'];
/** His face: ruddy. */
const SKIN: Ramp = ['#3a1c22', '#3a1c22', '#8a4e44', '#c4866a', '#c4866a'];
/** His whiskers: grizzled. */
const WHISKER: Ramp = ['#221c24', '#221c24', '#5a4e56', '#948890', '#948890'];

// ---------------------------------------------------------------------------------------------
// HIS GREAT SPEAKING-TRUMPET: a long cone of brass, nearly as tall as he is, from its mouthpiece to the
// rim of its bell; three bands round it; the bell flaring wide, its throat burning the enemy's pink to gold.

/** From the mouthpiece to the bell's rim; the bell's radius at its rim. */
export const TRUMPET_LEN = 56 * CR_K;
export const BELL_R = 9.5 * CR_K;
/** Where his right hand holds it, from the mouthpiece: `draw` 0 at the mouthpiece (to his lips, or to swing it at full reach), 1 at its middle (to carry it). */
export const TRUMPET_HOLD = (draw: number): number => (4 + 22 * clamp01(draw)) * CR_K;

/** The trumpet's radius `k` of the way from its mouthpiece to its rim: a long slow cone, then the flare. */
export function trumpetR(k: number): number {
  const cone = (1.3 + 3.2 * k) * CR_K;
  const flare = k > 0.7 ? Math.pow((k - 0.7) / 0.3, 2.4) * (BELL_R - 4.5 * CR_K) : 0;
  return cone + flare;
}

/** WHERE HIS TRUMPET IS: its mouthpiece, the middle of its rim, the way it runs (mouthpiece to bell). */
export function trumpetOf(s: Skeleton, q: { draw: number }): { mouth: V3; rim: V3; way: V3 } {
  const way = s.point;
  const mouth = add(s.handR, mul(way, -TRUMPET_HOLD(q.draw)));
  return { mouth, rim: add(mouth, mul(way, TRUMPET_LEN)), way };
}

/** The trumpet as solids: its cone and bell (a tube of brass through rings), its bands, its mouthpiece, and its throat burning (`burn`: 0 a glow, 1 blazing). */
function trumpetSolids(put: Put, mouth: V3, way: V3, burn: number, eye: V3, lit: number): void {
  const e1 = norm(cross(way, Math.abs(way[2]) < 0.9 ? [0, 0, 1] : [1, 0, 0]));
  const e2 = cross(way, e1);
  const at = (k: number): V3 => add(mouth, mul(way, TRUMPET_LEN * k));
  const rings: Ring[] = [];
  for (const k of [0, 0.25, 0.5, 0.66, 0.74]) rings.push({ c: at(k), u: mul(e1, trumpetR(k)), v: mul(e2, trumpetR(k)) });
  put('trumpet', 'trumpet', { k: 'cloth', rings, ramp: BRASS, look: { folds: [], lift: 0 }, rigid: true });
  // the bell, flaring: ring on ring of brass (the half of each toward the eye), so that the eye sees into it
  for (let k = 0.74; k <= 0.995; k += 0.018) put('trumpet', 'trumpet', { k: 'band', ring: { c: at(k), u: mul(e1, trumpetR(k)), v: mul(e2, trumpetR(k)) }, ramp: BRASS, rows: 2 });
  // its mouthpiece, a little cup; its bands; the rolled rim of its bell
  put('trumpet', 'trumpet', { k: 'rod', a: add(mouth, mul(way, -2.4)), b: add(mouth, mul(way, 1)), ra: 1.9, rb: 1.3, ramp: BRASS });
  for (const k of [0.22, 0.48, 0.7]) put('trumpet', 'trumpet', { k: 'band', ring: { c: at(k), u: mul(e1, trumpetR(k) + 0.8), v: mul(e2, trumpetR(k) + 0.8) }, ramp: BRASS, rows: 2 });
  put('trumpet', 'trumpet', { k: 'band', ring: { c: at(1), u: mul(e1, BELL_R + 0.6), v: mul(e2, BELL_R + 0.6) }, ramp: BRASS, rows: 2 });
  // ITS THROAT, BURNING: seen into the bell, the cult's fire, gold at its heart, pink to its rim
  const inside = add(at(1), mul(way, -1.6));
  const heat = lit * (0.9 + 0.3 * burn);
  put('throat', 'trumpet', {
    k: 'ball', c: inside, ax: [mul(way, 0.4), mul(e1, BELL_R - 0.6), mul(e2, BELL_R - 0.6)],
    skin: (u) => {
      // (only where it is seen into: its face toward the way out of the bell)
      const r = Math.hypot(u[1], u[2]);
      if (heat < 0.05) return r < 0.7 ? INK : BRASS[0];
      return r < 0.3 + 0.2 * burn ? FLAME[4] : r < 0.6 + 0.1 * burn ? FLAME[3] : r < 0.84 ? FLAME[2] : FLAME[1];
    },
  });
  if (heat > 0.05 && dot(way, eye) > -0.2) put('throat', 'trumpet', { k: 'glow', p: add(at(1), mul(way, 3)), c: SOCKET, r: 12 + 10 * burn, a: Math.min(0.85, 0.4 + 0.4 * burn) });
}

// ---------------------------------------------------------------------------------------------
// HIS BODY AS SOLIDS

/** A skirt's rings kept close to the leg it goes round (as the Headsman's): no ring deeper or wider than `deep` and `wide`, nor further out from under the waist than `off`. */
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
/** A skirt's rings kept on the floor, not in it. */
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
/** A vector no longer than `most`. */
function capped(v: V3, most: number): V3 {
  const l = len(v);
  return l > most ? mul(v, most / l) : v;
}

/** Where his waist is (the coat's and the belt's line round it). */
export const waistOf = (s: Skeleton): V3 => add(s.pelvis, mul(s.hips[2], B.waist * 0.55));

/**
 * HIS FROCK COAT'S SKIRTS at a moment, from his waist to his knees, one round each leg (the coat open in
 * front below his belly and split behind), kept close to the leg; hanging back by `lag`, in the wind. For his
 * painter and for the checks (nothing goes through his coat).
 */
export function coatSkirts(s: Skeleton, lag: V3 = [0, 0, 0], wind = 0, gale = 0): ['L' | 'R', Ring[]][] {
  const waistC = waistOf(s);
  return (['L', 'R'] as const).map((side) => {
    const sgn = side === 'L' ? 1 : -1;
    const one: Skeleton = side === 'L' ? { ...s, hipR: s.hipL, kneeR: s.kneeL, ankleR: s.ankleL, heelR: s.heelL, toeR: s.toeL } : { ...s, hipL: s.hipR, kneeL: s.kneeR, ankleL: s.ankleR, heelL: s.heelR, toeL: s.toeR };
    const top: Ring = { c: add(waistC, mul(s.hips[1], sgn * B.waistHalf * 0.4)), u: mul(s.hips[0], B.waistDeep + 2.2), v: mul(s.hips[1], B.waistHalf * 0.68 + 2.2) };
    return [side, offFloor(hugged(skirtOf(one, B, { top, drop: B.thigh * 1.08, wide: B.pelvisHalf * 0.62 + 4, deep: B.pelvisDeep + 5, lag, wind, gale, pad: 1.4 }), top.c, B.pelvisDeep + 6.5, B.pelvisHalf * 0.62 + 5.5, 7))];
  });
}

/** How his trumpet burns at a moment (0 a glow, 1 blazing): as the move says (`glint`). */
const burnOf = (m: Moment): number => clamp01(m.glint);

/** THE CRIER AS SOLIDS: boots, breeches, the frock coat and waistcoat, stock, chain and satchel, sleeves and gloves, his face and whiskers, his tricorn and plume, his trumpet. */
export function crierBits(st: Stage, m: Moment): Bit[] {
  const { s, q } = m;
  const bits: Bit[] = [];
  const put: Put = (part, piece, shape) => {
    if (CR_OFF[part] || CR_OFF[piece]) return;
    bits.push({ part, piece, shape });
  };
  const [cf, cl, cu] = s.chest;
  const lit = 1 - clamp01(q.out);
  const lag = capped(mul(m.come, -1.6), 4.2);
  const wave = m.wind * Math.PI * 2;

  // --- his legs: dark breeches to the knee; black boots to the knee, their tops turned down, a brass buckle on each ---
  for (const side of ['L', 'R'] as const) {
    const hip = side === 'L' ? s.hipL : s.hipR;
    const knee = side === 'L' ? s.kneeL : s.kneeR;
    const ankle = side === 'L' ? s.ankleL : s.ankleR;
    const heel = side === 'L' ? s.heelL : s.heelR;
    const toe = side === 'L' ? s.toeL : s.toeR;
    const [rH, rK, rA] = B.legR;
    put(`leg${side}`, `leg${side}`, { k: 'rod', a: hip, b: knee, ra: rH * 1.08, rb: rK * 1.04, ramp: BREECH, far: true });
    put(`leg${side}`, `leg${side}`, { k: 'ball', c: knee, ax: sphere(rK * 1.08), skin: BREECH, far: true });
    const top = lerp3(knee, ankle, 0.04);
    put(`boot${side}`, `boot${side}`, { k: 'rod', a: top, b: ankle, ra: rK * 1.22, rb: rA * 1.14, ramp: BLACK, far: true });
    // the turned-down top of the boot
    const shin = norm(sub(ankle, knee), [0, 0, -1]);
    const e1 = norm(cross(shin, [0, 0, 1]), [0, 1, 0]);
    const e2 = cross(shin, e1);
    put(`boot${side}`, `boot${side}`, { k: 'band', ring: { c: lerp3(knee, ankle, 0.12), u: mul(e1, rK * 1.42), v: mul(e2, rK * 1.42) }, ramp: BLACK, rows: 3 });
    const fwd = norm(sub(toe, heel), [1, 0, 0]);
    const side3 = norm(Math.abs(fwd[2]) < 0.95 ? [-fwd[1], fwd[0], 0] : cross(s.hips[2], fwd), [0, 1, 0]);
    const steep = clamp01((Math.abs(fwd[2]) - 0.35) / 0.4);
    const up3 = norm(add(mul([0, 0, 1], 1 - steep), mul(cross(fwd, side3), steep)), [0, 0, 1]);
    put(`boot${side}`, `foot${side}`, { k: 'ball', c: add(lerp3(heel, toe, 0.5), mul(up3, 2.1)), ax: [mul(fwd, 7.6), mul(side3, 3.4), mul(up3, 2.4)], skin: BLACK, far: true });
    // its brass buckle on the instep
    put(`boot${side}`, `foot${side}`, { k: 'ball', c: add(lerp3(heel, toe, 0.62), mul(up3, 4.2)), ax: [mul(fwd, 1.2), mul(side3, 1.8), mul(up3, 1.0)], skin: BRASS });
  }

  // --- HIS FROCK COAT: the city's oxblood, from his throat to his knees, its skirts parted before and behind ---
  const waistC = waistOf(s);
  const be = s.belly;
  for (const [side, rings] of coatSkirts(s, mul(lag, 1.3), m.wind, q.gale)) put(`coat${side}`, 'coat', { k: 'cloth', rings, ramp: COAT, look: { folds: [30, -30, 100, -100, 160, -160], lift: 0.1 } });
  const torso: Ring[] = [
    { c: waistC, u: mul(be[0], B.waistDeep + 2.2), v: mul(be[1], B.waistHalf + 2.2) },
    { c: add(lerp3(waistC, s.ribs, 0.5), mul(be[0], 1.5)), u: mul(be[0], B.waistDeep + 5.0), v: mul(be[1], B.waistHalf + 2.8) },
    { c: s.ribs, u: mul(cf, B.ribDeep + 2.6), v: mul(cl, B.ribHalf + 2.8) },
    { c: lerp3(s.ribs, s.neck, 0.72), u: mul(cf, B.ribDeep + 2.0), v: mul(cl, B.shoulderHalf + 0.6) },
    { c: add(s.neck, mul(cu, -1.2)), u: mul(cf, 4.6), v: mul(cl, 5.4) },
  ];
  put('body', 'body', { k: 'cloth', rings: torso, ramp: COAT, look: { folds: [0, 60, -60], lift: 0.04 } });
  // his waistcoat over his belly, showing between the coat's fronts, its brass buttons down it
  const bellyC = add(lerp3(waistC, s.ribs, 0.42), mul(be[0], B.waistDeep * 0.42));
  const bellyR: V3 = [B.waistDeep + 4.6, B.waistHalf * 0.6, (B.ribs + B.waist) * 0.6];
  put('body', 'vest', {
    k: 'ball', c: bellyC, ax: [mul(be[0], bellyR[0]), mul(be[1], bellyR[1]), mul(be[2], bellyR[2])],
    skin: (u, tone) => {
      if (u[0] < 0.35) return null;
      if (Math.abs(u[1]) < 0.07 && Math.abs((u[2] * 5 + 10) % 2 - 1) < 0.28 && u[2] < 0.8) return BRASS[Math.min(4, tone + 1)];
      return VEST[tone];
    },
  });
  // the coat's cream lapels, turned back down his chest either side of the waistcoat
  for (const k of [-1, 1]) {
    const from = add(add(s.neck, mul(cu, -1)), add(mul(cl, k * 5.2), mul(cf, 3.6)));
    const to = add(add(lerp3(s.ribs, waistC, 0.35), mul(cl, k * B.waistHalf * 0.58)), mul(be[0], B.waistDeep + 3.2));
    const midP = add(lerp3(from, to, 0.5), add(mul(cf, B.ribDeep * 0.6), mul(cl, k * 3.4)));
    put('lapel', 'lapel', { k: 'rod', a: from, b: midP, ra: 1.6, rb: 2.6, ramp: CREAM });
    put('lapel', 'lapel', { k: 'rod', a: midP, b: to, ra: 2.6, rb: 1.2, ramp: CREAM });
    // a row of brass buttons down the coat's front beside it
    for (let i = 0; i < 3; i++) put('lapel', 'lapel', { k: 'ball', c: add(lerp3(midP, to, 0.2 + i * 0.32), add(mul(cl, k * 3.0), mul(cf, 0.6))), ax: sphere(1.05), skin: BRASS });
  }
  // his stock at his throat: cream linen, tied full
  put('stock', 'stock', { k: 'ball', c: add(add(s.neck, mul(cu, -1.4)), mul(cf, 3.6)), ax: [mul(cf, 2.4), mul(cl, 3.4), mul(cu, 2.8)], skin: CREAM });
  put('stock', 'stock', { k: 'ball', c: add(add(s.neck, mul(cu, -4.6)), mul(cf, 5.0)), ax: [mul(cf, 1.8), mul(cl, 2.2), mul(cu, 3.0)], skin: CREAM });
  // his belt of black leather under his belly, its great brass buckle
  {
    const beltC = add(waistC, mul(s.hips[2], -0.8));
    put('belt', 'belt', { k: 'band', ring: { c: beltC, u: mul(be[0], B.waistDeep + 2.9), v: mul(be[1], B.waistHalf + 2.9) }, ramp: BLACK, rows: 3 });
    put('belt', 'buckle', { k: 'ball', c: add(beltC, mul(be[0], B.waistDeep + 3.4)), ax: [mul(be[0], 0.9), mul(be[1], 2.8), mul(s.hips[2], 2.2)], skin: (u, tone) => (Math.abs(u[1]) < 0.45 && Math.abs(u[2]) < 0.4 ? BLACK[1] : BRASS[Math.min(4, tone + 1)]) });
  }
  // HIS CHAIN OF OFFICE: brass links hung from shoulder to shoulder over his chest, a medallion at its foot
  {
    const sL = add(add(lerp3(s.ribs, s.neck, 0.86), mul(cl, B.shoulderHalf * 0.62)), mul(cf, B.ribDeep * 0.55));
    const sR = add(add(lerp3(s.ribs, s.neck, 0.86), mul(cl, -B.shoulderHalf * 0.62)), mul(cf, B.ribDeep * 0.55));
    const foot = add(add(lerp3(s.ribs, s.neck, 0.18), mul(cf, B.ribDeep + 3.6)), lag);
    const n = 12;
    for (let i = 0; i <= n; i++) {
      const t = i / n;
      const a = t < 0.5 ? lerp3(sL, foot, t * 2) : lerp3(foot, sR, t * 2 - 1);
      const bow = Math.sin(t * Math.PI) * 1.4;
      put('chain', 'chain', { k: 'ball', c: add(a, mul(cf, 1.2 + bow)), ax: sphere(i % 2 ? 0.8 : 1.0), skin: BRASS });
    }
    put('chain', 'chain', { k: 'ball', c: add(foot, mul(cf, 2.2)), ax: [mul(cf, 1.0), mul(cl, 3.0), mul(cu, 3.0)], skin: (u, tone) => (Math.hypot(u[1], u[2]) < 0.45 ? BRASS[Math.max(0, tone - 1)] : BRASS[Math.min(4, tone + 1)]) });
  }
  // HIS SATCHEL OF SCROLLS at his left hip on a strap from his right shoulder, its flap down, the ends of rolled proclamations standing out of it
  {
    const bag = add(add(waistC, mul(be[1], B.waistHalf + 4.2)), add(mul(be[0], -1.0), mul(s.hips[2], -5.5)));
    const bagAx: [V3, V3, V3] = [mul(be[0], 6.4 * CR_K), mul(be[1], 2.6 * CR_K), mul(s.hips[2], 5.2 * CR_K)];
    put('satchel', 'satchel', { k: 'ball', c: bag, ax: bagAx, skin: (u, tone) => (u[2] > 0.2 && u[1] > 0 ? SATCHEL[Math.min(4, tone + 1)] : SATCHEL[tone]) });
    for (const [x, h] of [[-2.6, 7], [0.4, 9], [3.0, 6]] as const) {
      const a = add(bag, add(mul(be[0], x), mul(s.hips[2], 3.6)));
      put('satchel', 'scrolls', { k: 'rod', a, b: add(a, add(mul(s.hips[2], h), mul(be[0], -1.2))), ra: 1.5, rb: 1.5, ramp: CREAM });
    }
    const from = add(add(lerp3(s.ribs, s.neck, 0.92), mul(cl, -B.shoulderHalf * 0.55)), mul(cf, B.ribDeep * 0.4));
    const across = add(add(lerp3(s.ribs, waistC, 0.2), mul(cf, B.ribDeep + 2.4)), mul(cl, B.ribHalf * 0.25));
    put('strap', 'strap', { k: 'rod', a: from, b: across, ra: 1.1, rb: 1.1, ramp: SATCHEL });
    put('strap', 'strap', { k: 'rod', a: across, b: add(bag, mul(s.hips[2], 4.6)), ra: 1.1, rb: 1.1, ramp: SATCHEL });
  }

  // --- his arms: the coat's sleeves, full, with deep cream cuffs turned back and a brass button on each; cream gloves ---
  for (const side of ['L', 'R'] as const) {
    const sh = side === 'L' ? s.shoulderL : s.shoulderR;
    const el = side === 'L' ? s.elbowL : s.elbowR;
    const hand = side === 'L' ? s.handL : s.handR;
    const fore = norm(sub(hand, el), [0, 0, -1]);
    const [r0, r1, r2] = B.armR;
    put(`arm${side}`, `arm${side}`, { k: 'ball', c: sh, ax: sphere(r0 * 1.2), skin: COAT, far: true });
    put(`arm${side}`, `arm${side}`, { k: 'rod', a: sh, b: el, ra: r0 * 1.16, rb: r1 * 1.14, ramp: COAT, far: true });
    put(`fore${side}`, `fore${side}`, { k: 'ball', c: el, ax: sphere(r1 * 1.16), skin: COAT, far: true });
    const cuff = lerp3(el, hand, 0.5);
    put(`fore${side}`, `fore${side}`, { k: 'rod', a: el, b: cuff, ra: r1 * 1.1, rb: r1 * 1.16, ramp: COAT, far: true });
    // the cuff: deep, cream, turned back, flaring
    put(`fore${side}`, `cuff${side}`, { k: 'rod', a: cuff, b: lerp3(cuff, hand, 0.62), ra: r1 * 1.5, rb: r1 * 1.66, ramp: CREAM, far: true });
    const e1 = norm(cross(fore, cu), cl);
    const e2 = norm(cross(fore, e1), cf);
    put(`fore${side}`, `cuff${side}`, { k: 'ball', c: add(lerp3(cuff, hand, 0.3), mul(e2, r1 * 1.55)), ax: sphere(0.95), skin: BRASS });
    // the glove
    put(`fore${side}`, `fore${side}`, { k: 'rod', a: lerp3(cuff, hand, 0.6), b: add(hand, mul(fore, -1.0)), ra: r1 * 1.0, rb: r2 * 1.18, ramp: CREAM, far: true });
    const fist = add(hand, mul(fore, 1.6));
    const flat = norm(sub(cf, mul(fore, dot(cf, fore))), cu);
    const across = norm(sub(cl, mul(fore, dot(cl, fore))), cl);
    put(`fore${side}`, `fist${side}`, { k: 'ball', c: fist, ax: [mul(fore, 3.4), mul(across, 2.9), mul(flat, 2.6)], skin: CREAM, far: true });
  }

  // --- HIS HEAD: a broad ruddy face, grizzled mutton-chop whiskers, a great moustache, heavy brows; his mouth open on a shout that makes no sound; his eyes burning pink ---
  const face = wornOn(st, s, 8);
  const [ff, fl, fu] = face;
  const hr: V3 = [B.headR[0] * 1.05, B.headR[1] * 1.12, B.headR[2] * 1.0];
  const hc = add(s.head, mul(fu, -0.5));
  const jaw = clamp01(m.jaw ?? 0.35);
  const headSkin: Skin = (u, tone) => {
    // u: on his head's own axes (forward, left, up), from its middle
    const fwd = u[0];
    const side = Math.abs(u[1]);
    // his mouth: open, dark, under the moustache
    const mouthH = 0.08 + 0.16 * jaw;
    if (fwd > 0.72 && side < 0.26 && u[2] < -0.3 && u[2] > -0.3 - mouthH * 1.6) return u[2] > -0.36 ? '#2a1218' : INK;
    // his whiskers: mutton chops down his cheeks to his jaw, and his chin's stubble, grizzled
    if (fwd > -0.1 && fwd < 0.8 && side > 0.55 && u[2] < 0.2) return WHISKER[Math.max(0, tone - (hash(Math.round(u[1] * 30), Math.round(u[2] * 30), 3) < 0.3 ? 1 : 0))];
    if (fwd > 0.55 && u[2] < -0.62) return WHISKER[Math.max(0, tone - 1)];
    // his nose, ruddier
    if (fwd > 0.86 && side < 0.16 && u[2] > -0.22 && u[2] < 0.12) return SKIN[Math.min(4, tone + 1)];
    // the hair at the back of his head, under the hat: grizzled, tied
    if (fwd < -0.3 && u[2] > -0.5) return WHISKER[tone];
    return SKIN[tone];
  };
  put('head', 'head', { k: 'ball', c: hc, ax: [mul(ff, hr[0]), mul(fl, hr[1]), mul(fu, hr[2])], skin: headSkin });
  // the queue of his hair, tied with a black ribbon, behind
  put('head', 'queue', { k: 'rod', a: add(hc, add(mul(ff, -hr[0] * 0.8), mul(fu, -hr[2] * 0.3))), b: add(hc, add(mul(ff, -hr[0] * 1.1), add(mul(fu, -hr[2] * 1.1), lag))), ra: 1.6, rb: 1.0, ramp: WHISKER });
  // his brows, heavy and drawn down
  for (const k of [-1, 1]) {
    const a = add(hc, add(mul(ff, hr[0] * 0.86), add(mul(fl, k * hr[1] * 0.12), mul(fu, hr[2] * 0.26))));
    const b = add(hc, add(mul(ff, hr[0] * 0.7), add(mul(fl, k * hr[1] * 0.62), mul(fu, hr[2] * 0.36))));
    put('head', 'brows', { k: 'rod', a, b, ra: 1.25, rb: 1.0, ramp: WHISKER });
  }
  // his moustache: great, swept out and curled up at its ends
  for (const k of [-1, 1]) {
    const root = add(hc, add(mul(ff, hr[0] * 0.98), add(mul(fl, k * hr[1] * 0.08), mul(fu, -hr[2] * 0.22))));
    const out1 = add(hc, add(mul(ff, hr[0] * 0.86), add(mul(fl, k * hr[1] * 0.62), mul(fu, -hr[2] * 0.34))));
    const curl = add(hc, add(mul(ff, hr[0] * 0.62), add(mul(fl, k * hr[1] * 1.02), mul(fu, -hr[2] * 0.12))));
    put('head', 'moustache', { k: 'rod', a: root, b: out1, ra: 1.9, rb: 1.4, ramp: WHISKER });
    put('head', 'moustache', { k: 'rod', a: out1, b: curl, ra: 1.4, rb: 0.6, ramp: WHISKER });
  }
  // his eyes: the enemy's pink burning in them
  if (lit > 0.05) {
    for (const k of [-1, 1]) {
      const e = add(hc, add(mul(ff, hr[0] * 0.9), add(mul(fl, k * hr[1] * 0.36), mul(fu, hr[2] * 0.1))));
      const heat = lit * (1 + 0.6 * burnOf(m));
      put('head', 'eyes', { k: 'dot', p: e, c: heat > 1.25 ? FLAME[4] : SOCKET, facing: ff, c2: heat > 1.25 ? FLAME[3] : FLAME[2] });
      if (dot(ff, st.eye) > 0.1) put('head', 'eyes', { k: 'glow', p: e, c: SOCKET, r: 3 + 3 * burnOf(m), a: Math.min(0.6, 0.28 * heat) });
    }
  }
  // HIS TRICORN: black felt, worn pushed back on his head (pompous), its brim turned up in three, cream braid
  // round it, a cream plume curling back off it
  {
    const back = 18 * D;
    const hu = norm(add(mul(fu, Math.cos(back)), mul(ff, -Math.sin(back))));
    const hf = norm(sub(ff, mul(hu, dot(ff, hu))), ff);
    const hl = cross(hu, hf);
    const crownC = add(hc, mul(hu, hr[2] * 1.02));
    put('hat', 'hat', { k: 'ball', c: crownC, ax: [mul(hf, hr[0] * 0.96), mul(hl, hr[1] * 0.94), mul(hu, hr[2] * 0.6)], skin: (u, tone) => (u[2] < -0.2 ? null : BLACK[tone]) });
    const brimBase = add(add(hc, mul(hu, hr[2] * 0.92)), mul(hf, -hr[0] * 0.08));
    const inner: V3[] = [];
    const outer: V3[] = [];
    const N = 24;
    for (let i = 0; i < N; i++) {
      const a = (i / N) * Math.PI * 2;
      const dir = add(mul(hf, Math.cos(a)), mul(hl, Math.sin(a)));
      // three corners: before him, and back to either side
      const corner = Math.pow(Math.max(0, Math.cos(3 * a)), 6);
      inner.push(add(brimBase, mul(dir, hr[0] * 0.98)));
      const reach = hr[0] * (1.28 + 0.42 * corner);
      outer.push(add(add(brimBase, mul(dir, reach)), mul(hu, 3.6 + 2.4 * (1 - corner))));
    }
    const ring = (pts: V3[]): Ring => {
      const c = pts.reduce((a2, p) => add(a2, mul(p, 1 / pts.length)), [0, 0, 0] as V3);
      return { c, u: mul(hf, hr[0]), v: mul(hl, hr[1]), pts };
    };
    put('hat', 'hat', { k: 'cloth', rings: [ring(inner), ring(outer)], ramp: BLACK, look: { folds: [], lift: 0 }, rigid: true });
    // the cream braid along the brim's edge
    for (let i = 0; i < N; i++) put('hat', 'hat', { k: 'rod', a: outer[i], b: outer[(i + 1) % N], ra: 0.7, rb: 0.7, ramp: CREAM });
    // the plume: from the left corner, curling back over the crown, swaying
    const root = add(brimBase, add(mul(hl, hr[1] * 1.0), add(mul(hf, -hr[0] * 0.5), mul(hu, 4))));
    let prev = root;
    for (let i = 1; i <= 6; i++) {
      const t = i / 6;
      const p = add(root, add(mul(hf, -t * 11 * CR_K), add(mul(hu, (1 + Math.sin(t * Math.PI) * 3) * CR_K), add(mul(hl, -t * 4 * CR_K), mul(lag, t * 1.2)))));
      const sway = Math.sin(wave * 2 + t * 2) * 0.6 * t;
      const pp = add(p, mul(hl, sway));
      put('plume', 'hat', { k: 'rod', a: prev, b: pp, ra: 1.5 - t * 0.6, rb: 1.3 - t * 0.8, ramp: CREAM });
      prev = pp;
    }
  }

  // --- HIS GREAT SPEAKING-TRUMPET ---
  const tr = trumpetOf(s, q);
  if (!m.bare) trumpetSolids(put, tr.mouth, tr.way, burnOf(m), st.eye, lit);

  // --- THE PROCLAMATION'S SCROLL in his left hand: a great roll of paper, its seal of oxblood burning as he holds it up ---
  if (q.prop === 1) {
    const [lf, ll] = [norm(sub(s.handL, s.elbowL), [0, 0, -1]), cl];
    const across = norm(cross(lf, cu), ll);
    const c = add(s.handL, mul(lf, 2.4));
    const half = 13 * CR_K;
    put('scroll', 'scroll', { k: 'rod', a: add(c, mul(across, -half)), b: add(c, mul(across, half)), ra: 3.6 * CR_K, rb: 3.6 * CR_K, ramp: CREAM });
    for (const k of [-1, 1]) put('scroll', 'scroll', { k: 'ball', c: add(c, mul(across, k * half)), ax: [mul(across, 0.8), mul(cu, 3.7 * CR_K), mul(cf, 3.7 * CR_K)], skin: (u, tone) => (Math.hypot(u[1], u[2]) < 0.35 ? CREAM[0] : CREAM[Math.max(0, tone - 1)]) });
    const seal = add(c, mul(norm(add(cu, cf)), 3.9 * CR_K));
    put('scroll', 'scroll', { k: 'ball', c: seal, ax: sphere(2.2 * CR_K), skin: (u, tone) => (m.glint > 0.5 ? (Math.hypot(u[0], u[1]) < 0.5 ? FLAME[4] : FLAME[3]) : COAT[Math.min(4, tone + 1)]) });
    if (m.glint > 0.3) {
      put('scroll', 'scroll', { k: 'glow', p: seal, c: SOCKET, r: 8 + 10 * m.glint, a: 0.5 * m.glint });
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * Math.PI * 2 + m.t * 9;
        put('sparks', 'sparks', { k: 'mote', p: add(seal, [Math.cos(a) * 4 * CR_K, Math.sin(a) * 4 * CR_K, 2 + ((m.t * 40 + i * 3) % 7)]), c: i % 2 ? FLAME[3] : FLAME[2], size: 2 });
      }
    }
  }

  // --- THE WEIGHT OF HIS SWING: the way the bell went through the air, a band of the cult's fire along it, widest and hottest just behind the bell ---
  if (m.trails && m.trails.length >= 4 && lit > 0.1) {
    const rimT = smoothed(m.trails[1]);
    const midT = smoothed(m.trails[3]);
    const n = rimT.length - 1;
    for (let i = 1; i <= n; i++) {
      const age0 = (i - 1) / n;
      const age1 = i / n;
      const long = Math.max(1, Math.ceil(Math.hypot(...(st.at(rimT[i]).map((v, k) => v - st.at(rimT[i - 1])[k]) as [number, number])) / 1.2));
      for (let j = 0; j < long; j++) {
        const f2 = j / long;
        const age = age0 + (age1 - age0) * f2;
        const e = lerp3(rimT[i - 1], rimT[i], f2);
        const y = lerp3(midT[i - 1], midT[i], f2);
        const w = 0.7 * (1 - age) + 0.08;
        const across = Math.max(1, Math.ceil(Math.hypot(...(st.at(lerp3(e, y, w)).map((v, k) => v - st.at(e)[k]) as [number, number])) / 1.2));
        for (let k = 0; k <= across; k++) {
          const u = (k / across) * w;
          if (age > 0.45 && hash(i * 97 + j, k, 79) < (age - 0.45) * 1.6) continue;
          const c = u < 0.06 ? (age < 0.3 ? FLAME[4] : FLAME[3]) : age < 0.22 ? FLAME[3] : age < 0.5 ? FLAME[2] : FLAME[1];
          put('streak', 'streak', { k: 'mote', p: lerp3(e, y, u), c, size: age > 0.4 ? 2 : 1 });
        }
      }
    }
    put('streak', 'streak', { k: 'glow', p: rimT[Math.min(2, n)], c: FLAME[3], r: 20, a: 0.34 });
  }

  // --- WHERE HIS SWING SLAMS DOWN: a burst of the Hush off the bell: a flash of the cult's fire, rings of dead grey air thrown out low over the floor, chips of stone ---
  if (m.move === SWING_NAME && m.since !== undefined && m.since >= 0 && m.since < 0.5 && !m.dying) {
    const k = m.since / 0.5;
    const at: V3 = [tr.rim[0], tr.rim[1], Math.max(1, tr.rim[2] - BELL_R * 0.6)];
    for (const [r0, ramp] of [[0, HUSH[4]], [6, HUSH[3]], [12, HUSH[2]]] as const) {
      const r = (r0 + 34 * Math.sqrt(k)) * CR_K;
      const n = Math.round(10 + r * 1.2);
      for (let i = 0; i < n; i++) {
        const a = (i / n) * Math.PI * 2;
        if (hash(i, Math.floor(r0), 61) < k * 0.8) continue;
        put('hush', 'hush', { k: 'mote', p: [at[0] + Math.cos(a) * r * 1.2, at[1] + Math.sin(a) * r, 1 + (1 - k) * 4], c: ramp, size: 2 });
      }
    }
    for (let i = 0; i < 14; i++) {
      const a = hash(i, 1, 83) * Math.PI * 2;
      const sp = (12 + 20 * hash(i, 2, 83)) * CR_K;
      const vz = (34 + 40 * hash(i, 3, 83)) * CR_K;
      const tt = m.since;
      const z = Math.max(0, vz * tt - 0.5 * 300 * tt * tt);
      put('chips', 'chips', { k: 'mote', p: [at[0] + Math.cos(a) * sp * tt * 1.4, at[1] + Math.sin(a) * sp * tt * 1.4, z + 0.5], c: i % 3 === 0 ? '#9a8e88' : i % 3 === 1 ? '#6a5e60' : '#463e48', size: i % 4 === 0 ? 3 : 2 });
    }
    if (m.since < 0.1) put('hush', 'hush', { k: 'glow', p: [at[0], at[1], 4], c: FLAME[3], r: 26, a: 0.7 });
  }

  // --- THE SILENT SHOUT AT THE BELL: the dead air boiling out of it, grey and violet, shot through with the pink ---
  if (m.move === SHOUT_NAME && m.since !== undefined && m.since >= 0 && m.since < CR_SHOUT.end - CR_SHOUT.hit + 0.1 && lit > 0.1) {
    for (let i = 0; i < 28; i++) {
      const life = (m.since * 2.6 + hash(i, 1, 91)) % 1;
      const a = hash(i, 2, 91) * Math.PI * 2;
      const e1 = norm(cross(tr.way, [0, 0, 1]), [0, 1, 0]);
      const e2 = cross(tr.way, e1);
      const spread = BELL_R * (0.5 + life * 2.6);
      const p = add(add(tr.rim, mul(tr.way, life * 34 * CR_K)), add(mul(e1, Math.cos(a) * spread), mul(e2, Math.sin(a) * spread * 0.6)));
      put('hush', 'hush', { k: 'mote', p, c: life < 0.25 ? FLAME[2] : life < 0.6 ? HUSH[4] : HUSH[3], size: life < 0.5 ? 3 : 2 });
    }
  }

  // --- THE CROWD'S CALL: rings of the Hush rolling up out of the bell and away overhead, soundless ---
  if (m.move === CROWD_NAME && m.since !== undefined && m.since >= 0 && m.since < CR_CROWD.end - CR_CROWD.hit + 0.5 && lit > 0.1) {
    const e1 = norm(cross(tr.way, [1, 0, 0]), [0, 1, 0]);
    const e2 = cross(tr.way, e1);
    for (let j = 0; j < 4; j++) {
      const age = m.since * 1.3 - j * 0.24;
      if (age < 0 || age > 1 || m.since > CR_CROWD.end - CR_CROWD.hit + 0.5 - (1 - age) * 0.3 + 0.3) continue;
      const r = BELL_R * (1 + age * 2.6);
      const c = add(tr.rim, mul(tr.way, (4 + age * 46) * CR_K));
      const n = Math.round(14 + r * 1.4);
      for (let i = 0; i < n; i++) {
        const a = (i / n) * Math.PI * 2;
        if (age > 0.55 && hash(i, j, 93) < (age - 0.55) * 1.8) continue;
        put('hush', 'hush', { k: 'mote', p: add(c, add(mul(e1, Math.cos(a) * r), mul(e2, Math.sin(a) * r))), c: age < 0.3 ? HUSH[4] : age < 0.65 ? HUSH[3] : HUSH[2], size: 2 });
      }
    }
  }

  // --- HIS DEATH: THE HUSH POURING OUT OF HIM, grey smoke rolling up out of the trumpet's bell while he holds it and out of his open mouth, thinning to nothing ---
  if (m.dying && m.t > 0.06 && m.t < CR_DIE_TIME) {
    // (thick at first, pouring; then thinning away as the last of it rises off him)
    const fade = m.t < 1.9 ? 1 : Math.max(0, 1 - (m.t - 1.9) / 0.9);
    const mouth = add(hc, add(mul(ff, hr[0] * 0.95), mul(fu, -hr[2] * 0.4)));
    const back = add(s.neck, mul(s.chest[2], -4 * CR_K));
    // where it pours from: his open mouth, the trumpet's bell while he holds it, and (once he is down) out of his back
    const from: V3[] = m.t < CR_TRUMPET_GOES ? [mouth, tr.rim, mouth] : m.t < 1.0 ? [mouth, mouth, back] : [mouth, back, back];
    const N = 46;
    for (let i = 0; i < N; i++) {
      if (hash(i, 9, 95) > fade) continue;
      const src = from[i % from.length];
      const life = (m.t * 0.75 + hash(i, 1, 95)) % 1;
      // (each puff curls as it rises, and spreads)
      const a = hash(i, 2, 95) * Math.PI * 2 + life * 3.2;
      const r = (1 + life * 13) * CR_K;
      const rise = (3 + life * 46) * CR_K;
      const drift: V3 = [-life * 8 * CR_K, life * 5 * CR_K, 0];
      const c: V3 = add(src, add(drift, [Math.cos(a) * r, Math.sin(a) * r, rise]));
      const col = life < 0.25 ? HUSH[4] : life < 0.55 ? HUSH[3] : life < 0.8 ? HUSH[2] : HUSH[1];
      const big = life < 0.7 ? 4 : 3;
      put('hush', 'hush', { k: 'mote', p: c, c: col, size: big });
      // (a puff is a little cloud of specks, wider as it goes)
      if (life > 0.15) {
        const w = (1.5 + life * 4) * CR_K;
        put('hush', 'hush', { k: 'mote', p: add(c, [w, -w * 0.4, -w * 0.5]), c: HUSH[Math.max(1, HUSH.indexOf(col) - 1)], size: big - 1 });
        put('hush', 'hush', { k: 'mote', p: add(c, [-w * 0.6, w, w * 0.3]), c: col, size: big - 1 });
      }
    }
  }
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
// HOW HE STANDS: pompous: square on to you, his chest out and his belly before him, his chin up; his left
// fist on his hip, its elbow out; his great trumpet held upright at his right side by its middle, like a
// herald's staff, its foot by his boot and its bell up by his hat, its throat toward you.

export const CR_HANG = -(B.upperArm + B.foreArm) * 0.9;
export const CR_BASE: Bones = {
  ...standing(B),
  pz: -1.5 * CR_K, px: 0, yaw: -16, pitch: -4, roll: 0, twist: 4, bend: -7, side: 0,
  faceTurn: 6, faceUp: 10, faceTilt: 0,
  lfx: 4 * CR_K, lfy: 6 * CR_K, lft: 22, lk: 14, rfx: -3 * CR_K, rfy: -6 * CR_K, rft: -20, rk: -12,
  lhIn: 0, lhx: -2 * CR_K, lhy: 9 * CR_K, lhz: -22 * CR_K, le: -70,
  rhIn: 0, rhx: 7 * CR_K, rhy: -17 * CR_K, rhz: -21 * CR_K, re: 34,
  wAz: -60, wEl: 80, wRoll: 0, draw: 0.95, pt: 0, out: 0, prop: 0, gale: 0,
};
/** His look as first drawn. */
export const CR_LOOK: Bones = { ...CR_BASE };

// ---------------------------------------------------------------------------------------------
// HIS MOVES' NAMES AND MOMENTS (art/crier_moves.ts makes the moves; his painter draws what each does to him)

export const SWING_NAME = 'The swing';
export const CR_SWING_HIT = 0.72;
export const SHOUT_NAME = 'The Silent Shout';
/** The Silent Shout: when the silence pours out of the bell, when it stops, how long the move is (seconds). */
export const CR_SHOUT = { hit: 0.82, end: 1.62, long: 2.2 };
export const PROCLAIM_NAME = 'The Proclamation';
/** The Proclamation: when the scroll leaves his hand; how long the move is. */
export const CR_PROCLAIM = { hit: 0.92, long: 2.2 };
export const CROWD_NAME = 'The Crowd';
/** The Crowd: when the call goes up, when it stops, how long the move is. */
export const CR_CROWD = { hit: 0.74, end: 1.56, long: 2.2 };
/** His death: how long; when the trumpet slips from his hand; when his hat tumbles off. */
export const CR_DIE_TIME = 2.8;
export const CR_TRUMPET_GOES = 0.46;
export const CR_HAT_GOES = 2.0;
/** The Hush's colours: the dead grey-violet of a silence (as the watch's horn, art/floor11.ts). */
export const HUSH: Ramp = ['#14121e', '#262234', '#3e3852', '#625a7a', '#9890b4'];

/** His canvas: room for the trumpet swung round him at full reach and his feet in a lunge (kept by the tests). */
export const CR_CANVAS: MobCanvas = { w: 470, h: 450, ax: 224, ay: 330 };

void heading;
void dim;
