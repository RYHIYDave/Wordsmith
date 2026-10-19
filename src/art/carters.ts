// FLOOR 13'S MEDIUM MOB, THE SILENT ORDER'S CARTERS (the art chat for floors 11 to 15, 19 Oct 2026). A MOCK-UP: NOT IN
// THE GAME. Nothing of the game imports this file; `CARTERS_ON` is off. Their moves are art/carters_moves.ts.
//
// His doc "Wordsmith Act 2: The Hush" (the planning chat's, with his yes as ideas), level 13, THE MILLRACE: “Out a side
// gate and along the river, following the night carts”; its enemies “the Silent Order's carters, and the Hushed working
// the fields”; “carts bring the jars of voices here.” And his word to this chat of 18 Oct, 21:24 Pacific: “Hey go without
// my say so.  If something is shit I’ll get it to it but you’re doing a great jobs. At least for 11-15”. So their brief
// is this chat's, the picks it would have marked recommended, sent him with their films:
// - WHO THEY ARE: the Silent Order's carters, who drive the night carts of stolen voices out of the city to the paper
//   mill. Big, heavy men, a little over the knight's height and broad.
// - WHAT MARKS THEM: the Order's BLANK WHITE MASK (the scribes' and the dredgers'), the cult's dull pink in its eye
//   slits, under a black hood and a broad-brimmed black carter's hat; a short black shoulder-cape of the Order over a
//   long leather carter's coat; heavy gauntlets; breeches and tall boots; a hooded night-lantern at the belt, its flame
//   the enemy's pink (the stolen voices burn in it); a long carter's whip.
// - THEIR BLOW, THE WHIP CRACK: the whip swung back over the shoulder, its lash trailing out behind, its cracker
//   glinting pink, held (the warning); then the arm brought over and down, and the lash rolls out before them, straight
//   at full reach, and cracks; it falls, and is drawn back.
// - THEIR DEATH: rocked back; the hat knocked off, the lantern's flame going out, the whip dropped; they stagger and
//   topple over backward, flat on their back.
// And his words of 18 Oct on the act's enemies: Act 2's own, nothing of Act 1's.
//
// ON THE HEROES' BONES (art/skeleton.ts), as the dredgers are.

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
export const CARTERS_ON = { on: false };

const clamp01 = (v: number): number => Math.max(0, Math.min(1, v));
export const smooth = (v: number): number => {
  const c = clamp01(v);
  return c * c * (3 - 2 * c);
};

// =============================================================================================
// THEIR COLOURS: the Order's black, a carter's leather, the blank white mask

const COAT: Ramp = ['#1c120c', '#1c120c', '#3e2a1c', '#56402a', '#6a5034'];
const ROBE: Ramp = ['#0e0d13', '#0e0d13', '#2b2835', '#423e4e', '#423e4e'];
const HAT: Ramp = ['#0c0b10', '#0c0b10', '#24212c', '#38343f', '#38343f'];
const MASK: Ramp = ['#5a5660', '#5a5660', '#bcb7c2', '#e4e0e8', '#e4e0e8'];
const GLOVE: Ramp = ['#1a120e', '#1a120e', '#3e2c20', '#56402e', '#56402e'];
const BREECH: Ramp = ['#1a1814', '#1a1814', '#36322a', '#4c463a', '#4c463a'];
const BOOT: Ramp = ['#0e0c0c', '#0e0c0c', '#26201e', '#3a302c', '#3a302c'];
const IRON: Ramp = ['#1a1c22', '#1a1c22', '#464b55', '#6e7480', '#6e7480'];
/** The whip: its stock, braided leather, the lash darker toward its end. */
const STOCK: Ramp = ['#22180e', '#22180e', '#5a4630', '#7a6244', '#7a6244'];
const LASH: Ramp = ['#140e0a', '#140e0a', '#36281c', '#4c3a28', '#4c3a28'];
/** The dust thrown up as the lash cracks or falls on the field: the track's. */
const DUST = ['#5a4c36', '#7a6848', '#9a8660'];

// =============================================================================================
// THE BODY

/** A little over the knight's height (58), broad and heavy. */
export const CARTER_BODY: Build = buildOf(63, 1.2, { shoulders: 1.12, chest: 1.1, depth: 1.08, waist: 1.12, hips: 1.04, arms: 1.04, trunk: 1.0, limbs: 1.06 });
const CB = CARTER_BODY;
/** Their picture: room for the lash rolled out its whole length before them, and swung out behind. */
export const CARTER_CANVAS: MobCanvas = { w: 420, h: 300, ax: 200, ay: 210 };

// =============================================================================================
// THE WHIP

/** The stock from the butt (in the hand) to its end; the lash from there to its cracker; how many pieces the lash is drawn in. */
export const WHIP = { butt: -2.5, stock: 13, lash: 62, n: 16 } as const;
/** The stock as it is at a moment: its butt and its end (where the lash is tied). */
export function stockOf(s: Skeleton): { butt: V3; end: V3 } {
  return { butt: add(s.handR, mul(s.point, WHIP.butt)), end: add(s.handR, mul(s.point, WHIP.stock)) };
}
/**
 * THE LASH as it lies, from the stock's end: `lie` is what the move says of it (points from the stock's end, each a
 * share of the lash's length along it, as the figure's own lengths from its place); this keeps each piece its length
 * (as near as a rope does) and out of the floor.
 */
export function lashFrom(end: V3, pts: ReadonlyArray<V3>): V3[] {
  const out: V3[] = [end];
  const seg = WHIP.lash / WHIP.n;
  for (let i = 1; i <= WHIP.n; i++) {
    const want = pts[Math.min(pts.length - 1, i)];
    const prev = out[i - 1];
    const d = sub(want, prev);
    const l = len(d) || 1;
    // (a rope does not stretch: each piece its own length toward where it is told; slack if it is told closer)
    const step = Math.min(seg, l);
    const p = add(prev, mul(d, step / l));
    out.push([p[0], p[1], Math.max(0.5, p[2])]);
  }
  return out;
}

// =============================================================================================
// THEM AS SOLIDS

/** How the figure's going drags what hangs off it. */
export function lagOf(m: Moment, k: number, most: number): V3 {
  const raw = mul(m.come, -k);
  const l = len(raw);
  return l > most ? mul(raw, most / l) : raw;
}
/** A coat sleeve from shoulder to wrist, a leather gauntlet with a wide cuff, its fingers closed (round the whip) or half curled. */
function arm(put: Put, s: Skeleton, side: 'L' | 'R', cu: V3, curl: number): void {
  const sh = side === 'L' ? s.shoulderL : s.shoulderR;
  const el = side === 'L' ? s.elbowL : s.elbowR;
  const hand = side === 'L' ? s.handL : s.handR;
  const [r0, r1, r2] = CB.armR;
  const fore = norm(sub(hand, el), [0, 0, -1]);
  put(`arm${side}`, `arm${side}`, { k: 'ball', c: sh, ax: sphere(r0 * 1.24), skin: COAT, far: true });
  put(`arm${side}`, `arm${side}`, { k: 'rod', a: sh, b: el, ra: r0 * 1.2, rb: r1 * 1.2, ramp: COAT, far: true });
  put(`fore${side}`, `fore${side}`, { k: 'ball', c: el, ax: sphere(r1 * 1.2), skin: COAT, far: true });
  const wrist = add(hand, mul(fore, -1.3));
  put(`fore${side}`, `fore${side}`, { k: 'rod', a: el, b: lerp3(el, wrist, 0.6), ra: r1 * 1.16, rb: r2 * 1.2, ramp: COAT, far: true });
  put(`fore${side}`, `cuff${side}`, { k: 'rod', a: lerp3(el, wrist, 0.5), b: wrist, ra: r1 * 1.4, rb: r2 * 1.2, ramp: GLOVE, far: true });
  const e1 = norm(sub(cu, mul(fore, dot(cu, fore))), [0, 0, 1]);
  const e2 = norm(cross(fore, e1), [0, 1, 0]);
  put(`hand${side}`, `hand${side}`, { k: 'ball', c: add(hand, mul(fore, 0.4)), ax: [mul(fore, 1.9), mul(e2, 1.7), mul(e1, 1.15)], skin: GLOVE, far: true });
  for (let i = 0; i < 4; i++) {
    const spread = (i - 1.5) * 0.36;
    const base = add(hand, add(mul(fore, 1.5), mul(e2, spread * 0.9)));
    const mid = add(base, add(mul(fore, 1.4 * (1 - 0.4 * curl)), mul(e1, -1.1 * curl)));
    const tip = add(mid, add(mul(fore, 1.0 * (1 - 0.8 * curl)), mul(e1, -1.4 * curl)));
    put(`hand${side}`, `finger${side}`, { k: 'rod', a: base, b: mid, ra: 0.6, rb: 0.52, ramp: GLOVE, far: true });
    put(`hand${side}`, `finger${side}`, { k: 'rod', a: mid, b: tip, ra: 0.52, rb: 0.4, ramp: GLOVE, far: true });
  }
}
/** A leg in breeches, a tall boot to the knee, its top turned down. */
function leg(put: Put, s: Skeleton, side: 'L' | 'R'): void {
  const hip = side === 'L' ? s.hipL : s.hipR;
  const knee = side === 'L' ? s.kneeL : s.kneeR;
  const ankle = side === 'L' ? s.ankleL : s.ankleR;
  const heel = side === 'L' ? s.heelL : s.heelR;
  const toe = side === 'L' ? s.toeL : s.toeR;
  const [rH, rK, rA] = CB.legR;
  put(`leg${side}`, `leg${side}`, { k: 'rod', a: hip, b: knee, ra: rH * 1.1, rb: rK * 1.12, ramp: BREECH, far: true });
  put(`leg${side}`, `leg${side}`, { k: 'ball', c: knee, ax: sphere(rK * 1.16), skin: BOOT, far: true });
  const shin = norm(sub(ankle, knee), [0, 0, -1]);
  put(`shin${side}`, `shin${side}`, { k: 'rod', a: knee, b: ankle, ra: rK * 1.16, rb: rA * 1.3, ramp: BOOT, far: true });
  put(`shin${side}`, `turn${side}`, { k: 'rod', a: add(knee, mul(shin, 0.6)), b: add(knee, mul(shin, 2.4)), ra: rK * 1.36, rb: rK * 1.3, ramp: BOOT, far: true });
  const fwd = norm(sub(toe, heel), [1, 0, 0]);
  const side3 = norm(Math.abs(fwd[2]) < 0.95 ? [-fwd[1], fwd[0], 0] : cross(s.hips[2], fwd), [0, 1, 0]);
  const up3 = norm(cross(fwd, side3), [0, 0, 1]);
  put(`foot${side}`, `foot${side}`, { k: 'ball', c: add(lerp3(heel, toe, 0.5), mul(up3, 1.8)), ax: [mul(fwd, 5.0), mul(side3, 2.3), mul(up3, 1.9)], skin: BOOT, far: true });
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
  const rT = CB.legR[0] * 1.1;
  return { c: add(c, mul(lag, 0.7)), u: mul(f, Math.max(CB.pelvisDeep + 2.0, spanF / 2 + rT + 1.2) + pad), v: mul(l, Math.max(CB.pelvisHalf + 2.2, spanL / 2 + rT + 1.2) + pad) };
}
/** The torso as rings from the throat down to `hem`. */
function torsoRings(s: Skeleton, pad: number, hem: Ring): Ring[] {
  const [cf, cl, cu] = s.chest;
  const be = s.belly;
  const waistC = add(s.pelvis, mul(s.hips[2], CB.waist * 0.6));
  return [
    hem,
    { c: add(s.pelvis, mul(s.hips[2], -1.4)), u: mul(s.hips[0], CB.pelvisDeep + 2.2 + pad), v: mul(s.hips[1], CB.pelvisHalf + 2.4 + pad) },
    { c: waistC, u: mul(be[0], CB.waistDeep + 1.8 + pad), v: mul(be[1], CB.waistHalf + 1.8 + pad) },
    { c: s.ribs, u: mul(cf, CB.ribDeep + 1.9 + pad), v: mul(cl, CB.ribHalf + 2.0 + pad) },
    { c: lerp3(s.ribs, s.neck, 0.72), u: mul(cf, CB.ribDeep + 1.3 + pad), v: mul(cl, CB.shoulderHalf + 0.8 + pad) },
    { c: add(s.neck, mul(cu, 0.4)), u: mul(cf, 4.2 + pad * 0.5), v: mul(cl, 4.8 + pad * 0.5) },
  ];
}

/** THE HEAD: the Order's black hood, the blank white mask with the pink in its eye slits, a broad-brimmed carter's hat over all. */
function head(put: Put, st: Stage, s: Skeleton, lit: number, lag: V3, hat: boolean): void {
  const [ff, fl, fu] = wornOn(st, s, 8);
  const hr: V3 = [CB.headR[0], CB.headR[1] * 1.06, CB.headR[2]];
  const hc = add(s.head, mul(fu, -0.3));
  put('head', 'head', { k: 'ball', c: hc, ax: [mul(ff, hr[0]), mul(fl, hr[1]), mul(fu, hr[2])], skin: ROBE });
  put('hood', 'hood', {
    k: 'ball', c: add(hc, add(mul(ff, -0.7), mul(fu, 0.4))), ax: [mul(ff, hr[0] * 1.3), mul(fl, hr[1] * 1.34), mul(fu, hr[2] * 1.2)],
    skin: (u, tone) => (u[0] > 0.28 && Math.abs(u[1]) < 0.8 && u[2] < 0.62 ? null : ROBE[tone]),
  });
  const mc = add(hc, mul(ff, hr[0] * 0.42));
  const skin: Skin = (u, tone) => {
    if (u[0] < 0.05) return null;
    if (Math.abs(u[1]) > 0.16 && Math.abs(u[1]) < 0.52 && u[2] > 0.02 && u[2] < 0.22) return '#18141e';
    if (Math.abs(u[1]) < 0.22 && u[2] < -0.42 && u[2] > -0.46 && u[0] > 0.6) return MASK[1];
    // (road dust on it)
    return hash(Math.floor(u[1] * 8 + 9), Math.floor(u[2] * 8 + 9), 7501) < 0.12 ? MASK[Math.max(1, tone - 1)] : MASK[Math.min(4, tone + 1)];
  };
  put('mask', 'mask', { k: 'ball', c: mc, ax: [mul(ff, hr[0] * 0.86), mul(fl, hr[1] * 0.98), mul(fu, hr[2] * 1.04)], skin });
  for (const k of [-1, 1]) {
    const e = add(mc, add(mul(ff, hr[0] * 0.86 * 0.92), add(mul(fl, k * hr[1] * 0.98 * 0.34), mul(fu, hr[2] * 1.04 * 0.12))));
    put('head', 'eyes', { k: 'dot', p: e, c: lit > 0.4 ? FLAME[1] : '#18141e', facing: ff });
  }
  if (hat) {
    // the hat: a low round crown, a broad flat brim, a band
    const top = add(hc, mul(fu, hr[2] * 0.75));
    put('hat', 'hat', { k: 'ball', c: add(top, mul(fu, 0.9)), ax: [mul(ff, hr[0] * 1.05), mul(fl, hr[1] * 1.05), mul(fu, hr[2] * 0.55)], skin: (u, tone) => (u[2] < -0.3 ? null : u[2] < -0.05 ? HAT[Math.max(0, tone - 1)] : HAT[tone]) });
    put('hat', 'hat', { k: 'ball', c: add(top, mul(fu, -0.6)), ax: [mul(norm(add(ff, mul(fu, -0.1))), hr[0] * 2.2), mul(fl, hr[1] * 2.1), mul(fu, 0.5)], skin: HAT });
    void lag;
  }
}

/** Where the lantern hangs at their left hip, and how it swings. */
export function lanternOf(s: Skeleton, lag: V3): { hook: V3; c: V3 } {
  const waistC = add(s.pelvis, mul(s.hips[2], CB.waist * 0.6));
  const hook = add(add(waistC, mul(s.belly[1], CB.waistHalf + 2.6)), mul(s.belly[0], 0.8));
  return { hook, c: add(add(hook, [0, 0, -4.2]), mul(lag, 0.8)) };
}
/** THE NIGHT-LANTERN at the left hip: an iron frame and hood, its glass and its flame the enemy's pink, the stolen voices burning in it; out as they die. */
function lantern(put: Put, s: Skeleton, lag: V3, lit: number): void {
  const { hook, c } = lanternOf(s, lag);
  put('lantern', 'lantern', { k: 'rod', a: hook, b: add(c, [0, 0, 2.2]), ra: 0.35, rb: 0.35, ramp: IRON });
  put('lantern', 'lantern', { k: 'ball', c: add(c, [0, 0, 2.2]), ax: [[1.6, 0, 0], [0, 1.6, 0], [0, 0, 0.8]], skin: IRON });
  put('lantern', 'lantern', { k: 'ball', c, ax: [[1.5, 0, 0], [0, 1.5, 0], [0, 0, 2.0]], skin: (u, tone) => (Math.abs(u[0]) > 0.75 || Math.abs(u[1]) > 0.75 ? IRON[tone] : lit > 0.3 ? (u[2] > -0.2 && u[2] < 0.5 ? FLAME[tone >= 3 ? 3 : 2] : FLAME[1]) : '#26222a') });
  put('lantern', 'lantern', { k: 'ball', c: add(c, [0, 0, -2.0]), ax: [[1.4, 0, 0], [0, 1.4, 0], [0, 0, 0.5]], skin: IRON });
  if (lit > 0.3) put('lantern', 'glow', { k: 'glow', p: c, c: FLAME[1], r: 9, a: 0.35 * lit });
}

/** What a moment of a move says over and above the bones: where the lash lies; whether the hat, the whip, the lantern are still theirs; dust thrown up. */
export interface CarterSay {
  lash: (m: Moment, end: V3) => V3[];
  hat: (m: Moment) => boolean;
  whip: (m: Moment) => boolean;
  lantern: (m: Moment) => boolean;
  /** The crack at the lash's end (0 none, 1 at its brightest). */
  crack: (m: Moment) => number;
}
/** The dust and sparks at each moment, laid after their edge (Mob.grains). */
const GRAINS = new WeakMap<Moment, [V3, string, number][]>();
function carterBits(st: Stage, m: Moment, say: CarterSay): Bit[] {
  const { s, q } = m;
  const bits: Bit[] = [];
  const grains: [V3, string, number][] = [];
  GRAINS.set(m, grains);
  const put: Put = (part, piece, shape) => bits.push({ part, piece, shape });
  const [cf, cl, cu] = s.chest;
  const lit = 1 - clamp01(q.out);
  const lag = lagOf(m, 1.5, 3.0);
  for (const side of ['L', 'R'] as const) leg(put, s, side);
  // THE LONG LEATHER COAT, to the knee, its skirts swinging
  put('body', 'coat', { k: 'cloth', rings: torsoRings(s, 0.6, thighRing(s, 0.9, 1.2, lag)), ramp: COAT, look: { folds: [0, 25, -25, 60, -60, 100, -100, 145, -145, 180], lift: 0.06 } });
  // the belt, its iron buckle
  const waistC = add(s.pelvis, mul(s.hips[2], CB.waist * 0.6));
  put('body', 'belt', { k: 'band', ring: { c: waistC, u: mul(s.belly[0], CB.waistDeep + 2.9), v: mul(s.belly[1], CB.waistHalf + 2.9) }, ramp: GLOVE, rows: 2 });
  put('body', 'buckle', { k: 'ball', c: add(waistC, mul(s.belly[0], CB.waistDeep + 3.2)), ax: [mul(s.belly[0], 0.5), mul(s.belly[1], 1.3), mul(s.belly[2], 1.1)], skin: IRON });
  // THE ORDER'S SHORT BLACK CAPE over the shoulders
  {
    const top: Ring = { c: add(s.neck, mul(cu, -0.2)), u: mul(cf, 4.6), v: mul(cl, 5.2) };
    const mid: Ring = { c: add(lerp3(s.ribs, s.neck, 0.72), mul(cu, 0.6)), u: mul(cf, CB.ribDeep + 3.2), v: mul(cl, CB.shoulderHalf + 3.0) };
    const hem: Ring = { c: add(lerp3(s.ribs, s.neck, 0.35), add(mul(cf, -0.6), mul(lag, 0.5))), u: mul(cf, CB.ribDeep + 3.6), v: mul(cl, CB.shoulderHalf + 3.6) };
    put('cape', 'cape', { k: 'cloth', rings: [top, mid, hem], ramp: ROBE, look: { folds: [40, -40, 110, -110, 170, -170], lift: 0.08 }, torn: [1, 0, 2, 1, 0, 1, 2, 0, 1, 2, 0, 1] });
  }
  arm(put, s, 'L', cu, 0.5);
  arm(put, s, 'R', cu, say.whip(m) ? 1 : 0.45);
  put('neck', 'neck', { k: 'rod', a: add(s.neck, mul(cu, -1.5)), b: lerp3(s.neck, s.head, 0.5), ra: 3.0, rb: 2.7, ramp: ROBE });
  // (the hat and the whip are painted even once they are gone from them: as they die each falls as a piece of its own, Mob.fall)
  head(put, st, s, lit, lag, true);
  if (say.lantern(m)) lantern(put, s, lag, lit);
  // THE WHIP: its stock in the right hand, its lash as the move lays it
  {
    const k = stockOf(s);
    put('whip', 'whip', { k: 'rod', a: k.butt, b: k.end, ra: 0.9, rb: 0.6, ramp: STOCK });
    put('whip', 'whip', { k: 'ball', c: k.butt, ax: sphere(1.0), skin: IRON });
    const pts = lashFrom(k.end, say.lash(m, k.end));
    for (let i = 0; i + 1 < pts.length; i++) {
      const r = 0.55 - (0.3 * i) / pts.length;
      put('whip', 'whip', { k: 'rod', a: pts[i], b: pts[i + 1], ra: r, rb: Math.max(0.24, r - 0.02), ramp: LASH });
    }
    // the cracker at its end, glinting pink as it is swung back to strike; and the crack, a burst of pink sparks
    const tip = pts[pts.length - 1];
    const glint = say.whip(m) ? clamp01(m.glint) : 0;
    if (glint > 0.05) put('whip', 'glint', { k: 'glow', p: tip, c: FLAME[1], r: 5 + 6 * glint, a: 0.45 * glint });
    const crack = clamp01(say.crack(m));
    if (crack > 0.02) {
      for (let i = 0; i < 14; i++) {
        const a = i * 2.39996;
        const r = 1 + 7 * crack * (0.5 + hash(i, 1, 7511));
        grains.push([add(tip, [Math.cos(a) * r, Math.sin(a) * r, Math.sin(a * 1.7) * r * 0.6]), i % 3 === 0 ? FLAME[4] : FLAME[2], crack > 0.5 ? 2 : 1]);
      }
      put('whip', 'crack', { k: 'glow', p: tip, c: FLAME[2], r: 10 * crack, a: 0.6 * crack });
    }
    // dust where the lash lies on the field
    for (let i = 2; i < pts.length; i += 3) if (pts[i][2] < 0.8 && hash(i, Math.floor(m.t * 15), 7512) < 0.25) grains.push([add(pts[i], [0, 0, 1 + hash(i, 2, 7512) * 2]), DUST[i % 3], 1]);
  }
  return bits;
}

// =============================================================================================
// THEIR STAND

/** Their rest: broad and planted, the whip's stock in the right hand at the hip, its lash trailing on the ground beside them; the left thumb hooked in the belt; the masked head watching. */
const REST0: Bones = {
  ...standing(CB),
  pz: -0.6, pitch: 3, bend: 4, roll: 1, side: 0, faceUp: 4, faceTilt: -4, faceTurn: 2,
  lfx: 1.2, lfy: 2.2, lft: 14, lk: 9, rfx: -1.0, rfy: -2.4, rft: -14, rk: -9,
  lhIn: 1, lhx: 4.5, lhy: 4.2, lhz: -17, le: -14,
  rhIn: 1, rhx: 5.5, rhy: -3.6, rhz: -20, wAz: -20, wEl: -35, wRoll: 0,
  pt: 0, out: 0,
} as Bones;
export const CARTER_REST: Bones = { ...REST0, re: elbowFor(CB, REST0 as Posed, false, norm([-0.5, -0.7, -0.6])) };

/** Their stand: 3.2 s round. Planted, breathing; the masked head turning slowly; the whip's stock tapping against the boot once a round. */
export const CARTER_STAND_LONG = 3.2;
export function carterStand(): Motion {
  const R = CARTER_REST;
  const T = CARTER_STAND_LONG;
  const keys: Key3[] = [];
  const N = 32;
  for (let i = 0; i <= N; i++) {
    const t = (i / N) * T;
    const a = (t / T) * Math.PI * 2;
    const breath = Math.sin(a * 2 - 0.5);
    const tap = Math.max(0, Math.sin((a - 4.2) * 3)) * (a > 4.2 && a < 4.2 + Math.PI / 3 ? 1 : 0);
    keys.push({
      at: t,
      ease: 'lin',
      pose: {
        pz: R.pz + 0.7 * breath,
        py: 0.9 * Math.sin(a),
        roll: R.roll + 2.0 * Math.sin(a),
        bend: R.bend - 1.6 * breath,
        pitch: R.pitch + 1.0 * Math.sin(a + 1.2),
        faceUp: R.faceUp + 3 * Math.sin(a + 0.4),
        faceTurn: R.faceTurn + 18 * Math.sin(a + 0.8),
        rhx: R.rhx - 1.2 * tap,
        wEl: (R.wEl as number) - 6 * tap,
        lhz: R.lhz + 0.4 * breath,
      },
    });
  }
  return { loop: 0, keys };
}

/** THE CARTERS AS THE PAINTER TAKES THEM. */
export function carterPainter(say: CarterSay): { bits: (st: Stage, m: Moment) => Bit[]; grains: (st: Stage, m: Moment) => ReadonlyArray<readonly [V3, string, number]> } {
  return { bits: (st, m) => carterBits(st, m, say), grains: (_st, m) => GRAINS.get(m) ?? [] };
}
