// THE HUSHED WATCH, THE CITY'S WATCHMEN (the art chat for floors 11 to 15, 18 Oct 2026). A MOCK-UP: NOT IN THE GAME.
// Nothing of the game imports this file; `WATCH_ON` is off. Their moves are art/hushed_watch_moves.ts.
//
// His picks for floor 11's monsters, 18 Oct: “The Hushed watch (Recommended)”, with the Hushed townsfolk, the Silent
// Order scribes and the mute watch hounds. Then, of the watch, as his rulebook's questions for a new character (one
// pop-up), his picks:
// - how they fight: “Halberd sweep (Recommended)” (offered as: they advance slowly, raise the long halberd high and
//   shaking (the warning), then sweep it wide in front of them);
// - what marks them out: “The Order's black gags (Recommended)” (offered as: the Silent Order has bound black cloth
//   over their mouths; grey breath leaks out around the gag);
// - how big: “A head taller, menacing (Recommended)” (offered as: broad men in mail and iron helmets, a head taller
//   than the knight; fewer of them than the townsfolk);
// - how they go down: “Gag falls, they kneel (Recommended)” (offered as: the gag slips off, the Hush leaves them in a
//   gasp, the halberd drops, and they sink to their knees and slump down, people again).
// Then, at 21:24 Pacific: “Hey go without my say so.  If something is shit I’ll get it to it but you’re doing a great
// jobs. At least for 11-15”. So their look and moves were made and filmed without waiting for his yes, and sent him.
// And his words of that afternoon on the act's enemies (“I’d like no not reuse any enemies from the previous act”;
// “So some of the new enemies can be used throughout the next 10 levels.”; “But let’s keep the acts separate”): they
// are the city's own, and nothing of Act 1's.
//
// WHO THEY ARE: the city's own watch, taken by the Silent Order and set to keep its silence: men who kept the gates
// and the streets, a head taller than the knight and broad, walking slow. Two of them, for a squad: a WATCHMAN
// (clean-shaven) and a SERGEANT (a grizzled beard, a brass badge, a cord across his breast). Each in a mail shirt
// to mid-thigh with sleeves to the wrist, over it a tabard in the city's colours (slate blue on his left, ochre on
// his right), the Order's ink blotted across it; a leather belt; hose, and boots to the knee; leather gloves; an
// iron kettle helmet, its brim wide. THEIR MARK: THE ORDER'S BLACK GAG bound over the mouth, knotted behind the
// head, its ends hanging; their lips work under it on words that make no sound, and grey breath leaks out round it
// at either cheek. Their eyes glazed with the cult's dull pink, under the brim. THEIR HALBERD, taller than they
// are: an ash staff shod in iron, an iron head with a broad axe-blade, a back spike and a long top spike, a ribbon
// of the city's colours under it. The enemy's pink edge round them while they live (the painter's). Nothing cyan.
// Nothing of Act 1 in them (no bone, no cult robe): men of the city, bound.

import { HUSH } from './crier';
import { BREATH_PALE, GREY_HAIR, HAIR, INKBLOT, SKIN, hushBreath, hushLeaves, lagOf } from './hushed';
import { INK, hash } from './kit';
import type { Ramp } from './kit';
import { FLAME } from './mkit';
import { sphere } from './new_mobs3';
import type { Bit, MobCanvas, Moment, Put } from './new_mobs3';
import { wornOn } from './skin';
import type { Ring, Skin, Stage } from './skin';
import { add, buildOf, cross, dot, elbowFor, lerp3, mul, norm, standing, sub } from './skeleton';
import type { Bones, Build, Key3, Motion, Posed, Skeleton, V3 } from './skeleton';

/** THE SWITCH, OFF. Nothing of the game reads this file. */
export const WATCH_ON = { on: false };

const fr = (t: number): number => t - Math.floor(t);
const clamp01 = (v: number): number => Math.max(0, Math.min(1, v));

// =============================================================================================
// THEIR COLOURS: iron, mail, the city's colours dulled by the dusk; the Order's black

const IRON: Ramp = ['#1a1c22', '#1a1c22', '#464b55', '#6e7480', '#6e7480'];
/** A halberd's edge, ground bright. */
const EDGE: Ramp = ['#2a2c32', '#2a2c32', '#7a808a', '#aab0b8', '#aab0b8'];
const MAIL: Ramp = ['#1c1e22', '#1c1e22', '#484c54', '#666b74', '#666b74'];
/** The city's colours, halved on the tabard: slate blue on his left, ochre on his right. */
const CITY_BLUE: Ramp = ['#161c2c', '#161c2c', '#2e3a58', '#445378', '#445378'];
const CITY_OCHRE: Ramp = ['#2e2210', '#2e2210', '#6a5224', '#8a6c34', '#8a6c34'];
const LEATHER: Ramp = ['#1a120e', '#1a120e', '#3e2c20', '#56402e', '#56402e'];
const BOOT: Ramp = ['#0e0c0c', '#0e0c0c', '#2a2220', '#3e3430', '#3e3430'];
const HOSE: Ramp = ['#1c1a1e', '#1c1a1e', '#3a3640', '#4e4a56', '#4e4a56'];
/** The Silent Order's black: their gags. */
const GAG: Ramp = ['#060508', '#060508', '#17141d', '#26212e', '#26212e'];
/** The halberd's staff: ash, dark with handling. */
const ASH: Ramp = ['#22180e', '#22180e', '#5a4630', '#7a6244', '#7a6244'];
const BRASS: Ramp = ['#2a1e08', '#2a1e08', '#7a5e22', '#a88a3a', '#a88a3a'];
/** The sergeant's cord, the city's red. */
const CORD: Ramp = ['#2a0e0e', '#2a0e0e', '#5e2222', '#7a3030', '#7a3030'];

// =============================================================================================
// THE BODY

/** A big man of the city's watch, a head taller than the knight (58), broad in the shoulder and chest. */
export const WATCH_BODY: Build = buildOf(66, 1.3, { shoulders: 1.14, chest: 1.12, depth: 1.08, waist: 1.08, hips: 1.04, arms: 1.04, trunk: 1.0, limbs: 1.02 });
const WB = WATCH_BODY;
/** Their picture: room for the halberd raised high over them and swept wide before them. */
export const WATCH_CANVAS: MobCanvas = { w: 360, h: 300, ax: 180, ay: 214 };

// =============================================================================================
// THE HALBERD

/** Its length from the iron of its butt to the point of its top spike, and where along it its head is. */
export const HALBERD = { long: 88, socket: 60, bladeLo: 61.5, bladeHi: 71.5, spike: 72 } as const;
/** Where their right hand holds it, from the butt: `draw` 0 down by the butt (to sweep it at full reach), 1 high up its staff (to carry it). */
export const HALBERD_HOLD = (draw: number): number => 6 + 44 * clamp01(draw);
/** The halberd as it is at a moment: its butt, the way it runs (butt to point), the line its blade stands out along, and a place this far along it. */
export function halberdOf(s: Skeleton, q: { draw: number }): { butt: V3; way: V3; across: V3; at: (k: number) => V3; tip: V3; edge: V3 } {
  const way = s.point;
  const across = norm(sub(s.across, mul(way, dot(s.across, way))), [0, 1, 0]);
  const butt = add(s.handR, mul(way, -HALBERD_HOLD(q.draw)));
  const at = (k: number): V3 => add(butt, mul(way, k));
  const mid = (HALBERD.bladeLo + HALBERD.bladeHi) / 2;
  return { butt, way, across, at, tip: at(HALBERD.long), edge: add(at(mid), mul(across, 8.2)) };
}
/**
 * The halberd held in their right hand at `hand` (from their place on the floor, along their own forward, left
 * and up), pointing `way` (from the butt), its blade standing out along `across`, the hand `draw` of the way up
 * it; their left hand `left` along it from the right toward the head, or free (null).
 */
export function halberdGrip(hand: V3, way: V3, across: V3, draw: number, left: number | null): Partial<Bones> {
  const w = norm(way);
  const D = 180 / Math.PI;
  const wAz = Math.atan2(w[1], w[0]) * D;
  const wEl = Math.asin(Math.max(-1, Math.min(1, w[2]))) * D;
  // (the roll about its line that stands its blade out along `across`, measured as the skeleton measures it)
  let flat = sub([0, 0, 1], mul(w, w[2]));
  if (Math.hypot(...flat) < 1e-3) flat = [-1, 0, 0];
  flat = norm(flat);
  const ac = norm(sub(across, mul(w, dot(across, w))), flat);
  const wRoll = Math.atan2(dot(cross(flat, ac), w), dot(flat, ac)) * D;
  return { rhIn: 2, rhx: hand[0], rhy: hand[1], rhz: hand[2], wAz, wEl, wRoll, draw, ...(left === null ? {} : { lhIn: 3 as const, lhx: left, lhy: 0, lhz: 0 }) };
}
/** The halberd stood on its butt at their right side, their right hand round it at `z`, leaning `lean` degrees forward from upright. */
export function halberdPlanted(hand: [number, number], z: number, lean: number, across: V3 = [0, -1, 0]): Partial<Bones> {
  const el = (90 - lean) * (Math.PI / 180);
  const way: V3 = [Math.cos(el), 0, Math.sin(el)];
  // (so far up it that its butt just rests on the floor: the iron of its butt is 1.0 thick)
  const hold = (z - 1.05) / way[2];
  return halberdGrip([hand[0], hand[1], z], way, across, (hold - 6) / 44, null);
}

const REST0: Bones = {
  ...standing(WB),
  pz: -0.6, pitch: 3, bend: 4, roll: 1, side: 0, faceUp: -2, faceTilt: -6, faceTurn: 2,
  lfx: 1.0, lfy: 1.6, lft: 12, lk: 8, rfx: -0.6, rfy: -1.6, rft: -10, rk: -8,
  lhIn: 1, lhx: 3.5, lhy: 2.6, lhz: -23, le: -8,
  ...halberdPlanted([4.2, -12.4], 43, 4),
  pt: 0, out: 0,
} as Bones;
/** Their rest: a sentry gone slack at his post; the halberd stood at his right side, his right elbow down by his side, his left arm hanging; the head up. */
export const WATCH_REST: Bones = { ...REST0, re: elbowFor(WB, REST0 as Posed, false, norm([-0.7, -0.05, -1])) };

/** Who: a watchman, a sergeant. */
export type WatchWho = 'watchman' | 'sergeant';

// =============================================================================================
// THEM AS SOLIDS

/** A mail sleeve from shoulder to wrist, a leather glove with a flared cuff, its fingers closed round what it holds or hanging half-curled. */
function arm(put: Put, s: Skeleton, side: 'L' | 'R', cu: V3, curl: number): void {
  const sh = side === 'L' ? s.shoulderL : s.shoulderR;
  const el = side === 'L' ? s.elbowL : s.elbowR;
  const hand = side === 'L' ? s.handL : s.handR;
  const [r0, r1, r2] = WB.armR;
  const fore = norm(sub(hand, el), [0, 0, -1]);
  put(`arm${side}`, `arm${side}`, { k: 'ball', c: sh, ax: sphere(r0 * 1.22), skin: MAIL, far: true });
  put(`arm${side}`, `arm${side}`, { k: 'rod', a: sh, b: el, ra: r0 * 1.16, rb: r1 * 1.14, ramp: MAIL, far: true });
  put(`fore${side}`, `fore${side}`, { k: 'ball', c: el, ax: sphere(r1 * 1.14), skin: MAIL, far: true });
  const wrist = add(hand, mul(fore, -1.3));
  put(`fore${side}`, `fore${side}`, { k: 'rod', a: el, b: lerp3(el, wrist, 0.7), ra: r1 * 1.1, rb: r2 * 1.12, ramp: MAIL, far: true });
  // the glove's cuff, flared over the mail
  put(`fore${side}`, `cuff${side}`, { k: 'rod', a: lerp3(el, wrist, 0.62), b: wrist, ra: r1 * 1.34, rb: r2 * 1.08, ramp: LEATHER, far: true });
  const e1 = norm(sub(cu, mul(fore, dot(cu, fore))), [0, 0, 1]);
  const e2 = norm(cross(fore, e1), [0, 1, 0]);
  put(`hand${side}`, `hand${side}`, { k: 'ball', c: add(hand, mul(fore, 0.4)), ax: [mul(fore, 1.9), mul(e2, 1.7), mul(e1, 1.1)], skin: LEATHER, far: true });
  for (let i = 0; i < 4; i++) {
    const spread = (i - 1.5) * 0.36;
    const base = add(hand, add(mul(fore, 1.5), mul(e2, spread * 0.9)));
    const mid = add(base, add(mul(fore, 1.4 * (1 - 0.4 * curl)), mul(e1, -1.1 * curl)));
    const tip = add(mid, add(mul(fore, 1.0 * (1 - 0.8 * curl)), mul(e1, -1.4 * curl)));
    put(`hand${side}`, `finger${side}`, { k: 'rod', a: base, b: mid, ra: 0.58, rb: 0.5, ramp: LEATHER, far: true });
    put(`hand${side}`, `finger${side}`, { k: 'rod', a: mid, b: tip, ra: 0.5, rb: 0.38, ramp: LEATHER, far: true });
  }
}

/** A leg in hose, a boot to the knee with its top turned down. */
function leg(put: Put, s: Skeleton, side: 'L' | 'R'): void {
  const hip = side === 'L' ? s.hipL : s.hipR;
  const knee = side === 'L' ? s.kneeL : s.kneeR;
  const ankle = side === 'L' ? s.ankleL : s.ankleR;
  const heel = side === 'L' ? s.heelL : s.heelR;
  const toe = side === 'L' ? s.toeL : s.toeR;
  const [rH, rK, rA] = WB.legR;
  put(`leg${side}`, `leg${side}`, { k: 'rod', a: hip, b: knee, ra: rH * 1.08, rb: rK * 1.06, ramp: HOSE, far: true });
  put(`leg${side}`, `leg${side}`, { k: 'ball', c: knee, ax: sphere(rK * 1.08), skin: HOSE, far: true });
  const shin = norm(sub(ankle, knee), [0, 0, -1]);
  put(`shin${side}`, `shin${side}`, { k: 'rod', a: add(knee, mul(shin, 1.4)), b: ankle, ra: rK * 1.14, rb: rA * 1.2, ramp: BOOT, far: true });
  // the boot's top, turned down below the knee
  put(`shin${side}`, `bootTop${side}`, { k: 'rod', a: add(knee, mul(shin, 1.2)), b: add(knee, mul(shin, 3.6)), ra: rK * 1.42, rb: rK * 1.36, ramp: LEATHER, far: true });
  const fwd = norm(sub(toe, heel), [1, 0, 0]);
  const side3 = norm(Math.abs(fwd[2]) < 0.95 ? [-fwd[1], fwd[0], 0] : cross(s.hips[2], fwd), [0, 1, 0]);
  const up3 = norm(cross(fwd, side3), [0, 0, 1]);
  put(`foot${side}`, `foot${side}`, { k: 'ball', c: add(lerp3(heel, toe, 0.5), mul(up3, 1.7)), ax: [mul(fwd, 5.0), mul(side3, 2.2), mul(up3, 1.8)], skin: BOOT, far: true });
}

/** The torso as rings from the throat down: to the waist, the hips, or on below them to `hem` (a ring round both thighs). */
function torsoRings(s: Skeleton, pad: number, hem: Ring | null): Ring[] {
  const [cf, cl, cu] = s.chest;
  const be = s.belly;
  const waistC = add(s.pelvis, mul(s.hips[2], WB.waist * 0.6));
  const rings: Ring[] = [];
  if (hem) rings.push(hem);
  rings.push(
    { c: add(s.pelvis, mul(s.hips[2], -1.4)), u: mul(s.hips[0], WB.pelvisDeep + 1.9 + pad), v: mul(s.hips[1], WB.pelvisHalf + 2.1 + pad) },
    { c: waistC, u: mul(be[0], WB.waistDeep + 1.6 + pad), v: mul(be[1], WB.waistHalf + 1.6 + pad) },
    { c: s.ribs, u: mul(cf, WB.ribDeep + 1.7 + pad), v: mul(cl, WB.ribHalf + 1.9 + pad) },
    { c: lerp3(s.ribs, s.neck, 0.72), u: mul(cf, WB.ribDeep + 1.1 + pad), v: mul(cl, WB.shoulderHalf + 0.6 + pad) },
    { c: add(s.neck, mul(cu, -0.8)), u: mul(cf, 3.6 + pad * 0.5), v: mul(cl, 4.2 + pad * 0.5) },
  );
  return rings;
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
  const rT = WB.legR[0] * 1.08;
  return {
    c: add(c, mul(lag, 0.6)),
    u: mul(f, Math.max(WB.pelvisDeep + 1.6, spanF / 2 + rT + 1.0) + pad),
    v: mul(l, Math.max(WB.pelvisHalf + 1.8, spanL / 2 + rT + 1.0) + pad),
  };
}

/**
 * THE HEAD: a drained face, its eyes glazed with the cult's dull pink; an iron kettle helmet, its brim wide; and THE
 * ORDER'S BLACK GAG bound over the mouth (`slip` 0) and knotted behind, its ends hanging; as the Hush leaves them it
 * slips down off the mouth to the throat (`slip` 1), and the mouth gapes (`jaw`). Returns the mouth, and where the
 * breath leaks out round the gag at either cheek.
 */
function head(put: Put, st: Stage, s: Skeleton, who: WatchWho, jaw: number, lit: number, lag: V3, slip: number): { mouth: V3; cheeks: [V3, V3]; ff: V3; fl: V3 } {
  const [ff, fl, fu] = wornOn(st, s, 8);
  const hr: V3 = [WB.headR[0] * 1.02, WB.headR[1] * 1.1, WB.headR[2] * 1.0];
  const hc = add(s.head, mul(fu, -0.3));
  const bearded = who === 'sergeant';
  const skin: Skin = (u, tone) => {
    const fwd = u[0];
    const side = Math.abs(u[1]);
    // the mouth, once the gag is off it: open and dark
    if (slip > 0.5) {
      const open = 0.1 + 0.24 * jaw;
      if (fwd > 0.7 && side < 0.26 && u[2] < -0.32 && u[2] > -0.32 - open * 1.5) return u[2] > -0.38 ? '#22161a' : INK;
    }
    // the sergeant's grizzled beard, round the jaw
    if (bearded && fwd > 0.2 && u[2] < -0.36 && !(slip > 0.5 && fwd > 0.7 && side < 0.26 && u[2] > -0.62)) return GREY_HAIR[tone];
    // hollow cheeks, a heavy nose
    if (fwd > 0.45 && fwd < 0.75 && side > 0.42 && side < 0.7 && u[2] < -0.1 && u[2] > -0.5) return SKIN[Math.max(0, tone - 1)];
    if (fwd > 0.88 && side < 0.15 && u[2] > -0.26 && u[2] < 0.1) return SKIN[Math.min(4, tone + 1)];
    // cropped hair below the helmet, at the back and sides
    if (fwd < 0.15 && u[2] > -0.5) return (bearded ? GREY_HAIR : HAIR)[tone];
    return SKIN[tone];
  };
  put('head', 'head', { k: 'ball', c: hc, ax: [mul(ff, hr[0]), mul(fl, hr[1]), mul(fu, hr[2])], skin });
  for (const k of [-1, 1]) {
    const a = add(hc, add(mul(ff, hr[0] * 0.88), add(mul(fl, k * hr[1] * 0.12), mul(fu, hr[2] * 0.28))));
    const b = add(hc, add(mul(ff, hr[0] * 0.7), add(mul(fl, k * hr[1] * 0.62), mul(fu, hr[2] * 0.22))));
    put('head', 'brows', { k: 'rod', a, b, ra: 0.8, rb: 0.65, ramp: bearded ? GREY_HAIR : HAIR });
  }
  // the eyes: glazed, the cult's dull pink in them (going out as the Hush leaves them)
  for (const k of [-1, 1]) {
    const e = add(hc, add(mul(ff, hr[0] * 0.92), add(mul(fl, k * hr[1] * 0.34), mul(fu, hr[2] * 0.08))));
    put('head', 'eyes', { k: 'dot', p: e, c: lit > 0.4 ? FLAME[1] : '#3a2a30', facing: ff, c2: lit > 0.4 ? FLAME[2] : '#2a1e24' });
  }
  // THE KETTLE HELMET: an iron bowl over the crown, a brim round it standing out level, the brow and eyes below it
  const crown = add(hc, mul(fu, hr[2] * 0.36));
  put('helm', 'helm', { k: 'ball', c: crown, ax: [mul(ff, hr[0] * 1.1), mul(fl, hr[1] * 1.08), mul(fu, hr[2] * 0.82)], skin: (u, tone) => (u[2] < 0.0 ? null : IRON[tone]) });
  const brimC = add(hc, mul(fu, hr[2] * 0.38));
  put('brim', 'helm', { k: 'ball', c: brimC, ax: [mul(ff, hr[0] * 1.24), mul(fl, hr[1] * 1.26), mul(fu, 0.45)], skin: (u, tone) => (Math.hypot(u[0], u[1]) > 0.9 ? IRON[Math.min(4, tone + 1)] : IRON[tone]) });
  // a rib over the crown, front to back
  put('helm', 'helm', { k: 'rod', a: add(crown, add(mul(ff, hr[0] * 0.9), mul(fu, hr[2] * 0.42))), b: add(crown, add(mul(ff, -hr[0] * 0.9), mul(fu, hr[2] * 0.42))), ra: 0.65, rb: 0.65, ramp: IRON });

  // THE ORDER'S GAG: a band of black cloth round the head at the mouth, bunched over it, knotted behind; slipping
  // down to the throat as the Hush leaves them
  const mouthAt = add(hc, add(mul(ff, hr[0] * 1.0), mul(fu, -hr[2] * 0.46)));
  const k = clamp01(slip);
  const gagC = lerp3(add(hc, mul(fu, -hr[2] * 0.5)), add(s.neck, mul(fu, 1.6)), k);
  const r = (a: number): number => a * (1 - k) + 3.0 * k;
  const gu = mul(ff, r(hr[0] * 0.87 + 0.45));
  const gv = mul(fl, r(hr[1] * 0.87 + 0.45));
  // (the band runs a little lower at the back, where it is knotted)
  const gagRing: Ring = { c: add(gagC, mul(ff, -0.2)), u: gu, v: gv };
  put('gag', 'gag', { k: 'band', ring: gagRing, ramp: GAG, rows: 2 });
  const front = add(gagC, mul(ff, r(hr[0] * 0.87 + 0.45) + 0.1));
  // (bunched over the mouth, working as the mouth works under it)
  if (k < 0.6) put('gag', 'gag', { k: 'ball', c: front, ax: [mul(ff, 0.8 + 0.4 * jaw), mul(fl, 2.2), mul(fu, 1.2 + 0.4 * jaw)], skin: GAG });
  const knot = add(gagC, mul(ff, -(r(hr[0] * 0.87 + 0.45) + 0.4)));
  put('gag', 'gagKnot', { k: 'ball', c: knot, ax: sphere(1.3), skin: GAG });
  for (const side of [-1, 1]) {
    const end = add(knot, add(add([0, 0, -5.6], mul(fl, side * 1.2)), add(mul(ff, -1.0), mul(lag, 0.9))));
    put('gag', 'gagEnds', { k: 'rod', a: knot, b: end, ra: 0.9, rb: 0.55, ramp: GAG });
  }
  const cheeks: [V3, V3] = [add(add(gagC, mul(fl, r(hr[1] * 0.87) + 0.6)), add(mul(ff, 2.2), mul(fu, 0.6))), add(add(gagC, mul(fl, -(r(hr[1] * 0.87) + 0.6))), add(mul(ff, 2.2), mul(fu, 0.6)))];
  return { mouth: mouthAt, cheeks, ff, fl };
}

/** THE HALBERD: an ash staff shod in iron; its iron head: langets down the staff, a broad axe-blade, a back spike, a long top spike; the city's ribbon under it. */
function halberd(put: Put, s: Skeleton, q: { draw: number }, lag: V3, glint: number): void {
  const h = halberdOf(s, q);
  const { at, across, way } = h;
  put('staff', 'halberd', { k: 'rod', a: at(0.6), b: at(HALBERD.socket), ra: 0.95, rb: 0.88, ramp: ASH });
  put('butt', 'halberd', { k: 'rod', a: h.butt, b: at(3.2), ra: 1.05, rb: 1.0, ramp: IRON });
  const side = norm(cross(way, across));
  for (const k of [-1, 1]) put('langets', 'halberd', { k: 'rod', a: add(at(51), mul(side, k * 0.75)), b: add(at(HALBERD.socket + 1), mul(side, k * 0.9)), ra: 0.45, rb: 0.5, ramp: IRON });
  put('socket', 'halberd', { k: 'rod', a: at(HALBERD.socket - 1), b: at(HALBERD.spike + 0.5), ra: 1.25, rb: 1.1, ramp: IRON });
  // the blade: from the staff out to its edge, its edge a shallow curve, its top raked up toward the spike
  const lo = HALBERD.bladeLo;
  const hi = HALBERD.bladeHi;
  const midK = (lo + hi) / 2;
  const half = (hi - lo) / 2 + 1.2;
  const out = 4.2;
  put('blade', 'halberd', {
    k: 'panel',
    c: add(at(midK), mul(across, 1.0 + out)),
    u: mul(across, out),
    v: mul(way, half),
    skin: (a0, b0, _front, tone0) => {
      // (steel catches the light whichever way it is turned: never as dark as the iron of its socket)
      const tone = Math.max(2, tone0);
      // (a: -1 at the staff, 1 at the edge; b: -1 toward the butt, 1 toward the point)
      const a = a0 / out;
      const b = b0 / half;
      const x = (a + 1) / 2;
      const top = 0.62 + 0.38 * x;
      const bot = -0.6 - 0.4 * x * x;
      if (b > top || b < bot) return null;
      const edgeAt = 1 - 0.16 * b * b;
      if (a > edgeAt) return null;
      if (a > edgeAt - 0.34) return EDGE[Math.min(4, tone + 1)];
      // (a rivet through it, by the staff)
      if (a < -0.55 && a > -0.8 && Math.abs(b) < 0.14) return IRON[0];
      return IRON[tone];
    },
  });
  // the back spike, bent a little toward the butt
  put('fluke', 'halberd', { k: 'rod', a: add(at(midK + 1), mul(across, -1.0)), b: add(at(midK - 1.6), mul(across, -7.6)), ra: 1.15, rb: 0.25, ramp: IRON });
  // the top spike
  put('spike', 'halberd', { k: 'rod', a: at(HALBERD.spike), b: at(HALBERD.long), ra: 1.05, rb: 0.18, ramp: IRON });
  // the city's ribbon, tied under the head, its two ends hanging and streaming back
  const tie = at(HALBERD.socket - 2);
  for (const k of [0, 1]) {
    const end = add(tie, add([0, 0, -6.5], add(mul(lag, 1.6), mul(side, (k ? 1 : -1) * 0.8))));
    put('ribbon', 'halberd', { k: 'rod', a: tie, b: end, ra: 0.75, rb: 0.6, ramp: k ? CITY_OCHRE : CITY_BLUE });
  }
  // a pink glint along its edge as they raise it (the warning)
  if (glint > 0.05) put('glint', 'halberd', { k: 'glow', p: h.edge, c: FLAME[1], r: 6 + 6 * glint, a: 0.5 * glint });
}

/**
 * THE HUSH SEEPING OUT ROUND THE GAG at one cheek: short grey wisps pushed out sideways from under the cloth, curling
 * up and thinning away by the helmet's brim; more and further as they raise the halberd (`hard`, 0 to 1).
 */
function gagSeep(put: Put, at: V3, out: V3, ff: V3, t: number, seed: number, hard: number): void {
  const N = Math.round(7 + 6 * hard);
  for (let i = 0; i < N; i++) {
    const life = fr(t * (0.8 + 0.5 * hard) + i / N + 0.17 * hash(i, seed, 2311));
    if (life > 0.55 + 0.4 * hard) continue;
    const curl = life * 5 + seed;
    const p = add(at, add(mul(out, (0.8 + life * (3.4 + 3 * hard)) * (0.8 + 0.4 * hash(i, seed, 2312))), add(mul(ff, Math.sin(curl) * (0.4 + life * 1.6)), [0, 0, life * (6 + 6 * hard)])));
    const c = life < 0.2 ? BREATH_PALE : life < 0.45 ? HUSH[4] : HUSH[3];
    put('hush', 'hush', { k: 'mote', p, c, size: life < 0.3 ? 3 : 2 });
  }
}

/** The Hush leaking out of them at each moment, laid after their edge (Mob.grains): breath, not a solid of them. */
const BREATH = new WeakMap<Moment, [V3, string, number][]>();

/** What a moment says of them: how far their gag has slipped (0 on, 1 at the throat), how far the halberd is gone from their hand (`bare`). */
export interface WatchSay {
  slip: (t: number) => number;
}

/** THE WATCH AS SOLIDS: mail and tabard, belt and boots, gloves; the helmet, the gag and the drained face; the halberd while it is theirs; the Hush leaking out round the gag. */
function watchBits(who: WatchWho, st: Stage, m: Moment, say: WatchSay): Bit[] {
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
  const lag = lagOf(m, 1.5, 3.0);
  const jaw = clamp01(m.jaw ?? 0.4);
  const seed = who === 'watchman' ? 11 : 12;
  const slip = m.dying ? clamp01(say.slip(m.t)) : 0;

  for (const side of ['L', 'R'] as const) leg(put, s, side);
  // THE MAIL SHIRT, to mid-thigh, its sleeves to the wrist
  put('body', 'mail', { k: 'cloth', rings: torsoRings(s, 0.2, thighRing(s, 0.5, 0.4, lag)), ramp: MAIL, look: { folds: [0, 30, -30, 60, -60, 90, -90, 120, -120, 150, -150, 180], lift: 0.04 } });
  // THE TABARD over it, in the city's colours halved (blue on his left, ochre on his right), a little shorter
  {
    const rings = torsoRings(s, 0.7, thighRing(s, 0.34, 1.0, lag));
    put('body', 'tabard', { k: 'cloth', rings, ramp: CITY_BLUE, look: { folds: [20, 70, 160], lift: 0.05, arc: [0, 180] } });
    put('body', 'tabard', { k: 'cloth', rings, ramp: CITY_OCHRE, look: { folds: [-20, -70, -160], lift: 0.05, arc: [180, 360] } });
  }
  // the Order's ink blotted across it, where they marked him
  put('body', 'ink', { k: 'ball', c: add(add(s.ribs, mul(cf, WB.ribDeep + 2.6)), add(mul(cl, 1.8), mul(cu, -1.0))), ax: [mul(cf, 0.5), mul(cl, 2.8), mul(cu, 2.0)], skin: () => INKBLOT });
  // the belt
  const waistC = add(s.pelvis, mul(s.hips[2], WB.waist * 0.6));
  put('body', 'belt', { k: 'band', ring: { c: waistC, u: mul(s.belly[0], WB.waistDeep + 2.6), v: mul(s.belly[1], WB.waistHalf + 2.6) }, ramp: LEATHER, rows: 2 });
  put('body', 'buckle', { k: 'ball', c: add(waistC, mul(s.belly[0], WB.waistDeep + 2.9)), ax: [mul(s.belly[0], 0.5), mul(s.belly[1], 1.2), mul(s.belly[2], 1.0)], skin: IRON });
  if (who === 'sergeant') {
    // his cord across his breast, left shoulder to right hip, and his brass badge
    const a = add(add(lerp3(s.ribs, s.neck, 0.85), mul(cl, WB.shoulderHalf * 0.75)), mul(cf, WB.ribDeep * 0.5));
    const b = add(add(waistC, mul(cl, -(WB.waistHalf + 1.6))), mul(cf, WB.waistDeep * 0.6));
    put('body', 'cord', { k: 'rod', a: add(a, mul(cf, 1.9)), b: add(lerp3(a, b, 0.5), mul(cf, WB.ribDeep + 2.6)), ra: 0.8, rb: 0.8, ramp: CORD });
    put('body', 'cord', { k: 'rod', a: add(lerp3(a, b, 0.5), mul(cf, WB.ribDeep + 2.6)), b: add(b, mul(cf, 2.6)), ra: 0.8, rb: 0.8, ramp: CORD });
    put('body', 'badge', { k: 'ball', c: add(add(lerp3(s.ribs, s.neck, 0.5), mul(cf, WB.ribDeep + 2.4)), mul(cl, -2.6)), ax: [mul(cf, 0.5), mul(cl, 1.3), mul(cu, 1.5)], skin: BRASS });
  }
  // the arms: the right hand closed round the halberd, the left half-curled (closed too when on it)
  arm(put, s, 'L', cu, q.lhIn === 3 ? 1 : 0.5);
  arm(put, s, 'R', cu, m.bare ? 0.45 : 1);
  // the neck: a mail collar
  put('neck', 'neck', { k: 'rod', a: add(s.neck, mul(cu, -1.5)), b: lerp3(s.neck, s.head, 0.5), ra: 3.0, rb: 2.7, ramp: MAIL });
  const hd = head(put, st, s, who, jaw, lit, lag, slip);
  // THE HALBERD, while it is in his hand
  if (!m.bare) halberd(put, s, q, lag, clamp01(m.glint));
  // THE HUSH LEAKING OUT ROUND THE GAG: two thin threads at the cheeks, harder as they raise the halberd; once the
  // gag is off, the Hush pours out of the open mouth in one great breath
  if (slip < 0.5) {
    const hard = clamp01(m.glint);
    gagSeep(put, hd.cheeks[0], hd.fl, hd.ff, m.t, seed, hard);
    gagSeep(put, hd.cheeks[1], mul(hd.fl, -1), hd.ff, m.t + 0.41, seed + 5, hard);
  } else if (m.dying) {
    hushBreath(put, hd.mouth, hd.ff, hd.fl, m.t, Math.max(0, 2.2 * (1 - clamp01((m.t - 0.4) / 1.1))), seed);
  }
  if (m.dying) hushLeaves(put, hd.mouth, hd.ff, hd.fl, m.t, seed, WATCH_EXHALE[0], WATCH_EXHALE[1]);
  return bits;
}
/** When the Hush pours out of them as they die (seconds): after the gag has slipped. */
export const WATCH_EXHALE: readonly [number, number] = [0.3, 1.9];

// =============================================================================================
// THEIR STAND

/** Their stand: 3.2 s round. A sentry gone slack at his post, swaying a little on his feet against his halberd; the head lolling and lifting; the lips working under the gag. */
export const WATCH_STAND_LONG = 3.2;
export function watchStand(): Motion {
  const R = WATCH_REST;
  const T = WATCH_STAND_LONG;
  const keys: Key3[] = [];
  const N = 32;
  for (let i = 0; i <= N; i++) {
    const t = (i / N) * T;
    const a = (t / T) * Math.PI * 2;
    const breath = Math.sin(a * 2 - 0.5);
    keys.push({
      at: t,
      ease: 'lin',
      pose: {
        pz: R.pz + 0.8 * breath,
        py: 0.9 * Math.sin(a),
        roll: R.roll + 2.0 * Math.sin(a),
        bend: R.bend - 2.2 * breath,
        pitch: R.pitch + 1.2 * Math.sin(a + 1.2),
        faceUp: R.faceUp + 5 * Math.sin(a + 0.4),
        faceTilt: R.faceTilt + 6 * Math.sin(a + 2.0),
        faceTurn: R.faceTurn + 9 * Math.sin(a * 0.5 + 0.8),
        lhx: R.lhx + 1.0 * Math.sin(a + 0.4),
        lhz: R.lhz + 0.5 * breath,
      },
    });
  }
  return { loop: 0, keys };
}
/** Their lips under the gag, working on words that make no sound: the cloth stirs. */
export function watchStandJaw(t: number): number {
  const u = fr(t / WATCH_STAND_LONG);
  return 0.3 + 0.6 * Math.max(0, Math.sin(u * Math.PI * 6)) * (u < 0.7 ? 1 : 0.3);
}

/** THE WATCH AS THE PAINTER TAKES THEM: who it is, painted at a moment; the Hush leaking out of them at that moment, laid after their edge. */
export function watchPainter(who: WatchWho, say: WatchSay): { bits: (st: Stage, m: Moment) => Bit[]; grains: (st: Stage, m: Moment) => ReadonlyArray<readonly [V3, string, number]> } {
  return { bits: (st, m) => watchBits(who, st, m, say), grains: (_st, m) => BREATH.get(m) ?? [] };
}

