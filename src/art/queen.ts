// FLOOR 18'S BOSS, THE QUEEN (THE MIRROR HALL), ON THE HEROES' BONES. A MOCK-UP: NOT IN THE GAME. Nothing of the game
// imports this file; `QUEEN_ON` is off. Her moves are art/queen_moves.ts; what her moves leave in the hall, her
// talking mirror and the hall's mirrors, art/queen_fx.ts.
//
// Floor 18, THE GLASS GALLERY: the queen's wing, long galleries of mirrors and a great glasshouse on the roof; its
// palette silver, cold blue glass, dark violet. Her mirror from the Grimms' "Snow White" (1812), drawn only from the
// book: there the queen asks her looking-glass who is fairest, and she tries to kill with a laced bodice, a poisoned
// comb and a poisoned apple. Her story: "the queen gave the Hush every voice in her court in return for her mirror's.
// It is the last thing in the palace that still speaks, and it says only what she wants to hear." When she falls:
// "her mirror cracks across and, for the first time, tells the truth: the king is dying, and something sits on his
// chest."
//
// HIS BRIEF, offered to him as a pop-up; his pick for how she moves: “Cold and slow, then sudden (Recommended)”, with
// the rest of the brief as offered: tall and cold in silver and violet, a crown of glass spikes, her poisoned comb in
// her hand; her mirror hanging at the end of the hall, talking to her the whole fight; a head and a half taller than
// the knight; a cold, slow glide, then sudden: she steps into one mirror and out of another behind you; her mark the
// crown of glass spikes; her moves a stab of the poisoned comb (her basic), Looking Glass, Reflections and Shatter;
// each phase another mirror wakes; her death, her mirror cracking across and for the first time telling the truth;
// never a cartoon witch, never gory; her sound glass, her gown, her mirror's whisper.
//
// HER LOOK: a tall woman, grown and cold, a head and a half taller than the knight, slender and very upright, her chin
// a little raised. A gown of deep violet: a fitted bodice LACED up the front in silver (the book's laced bodice), a
// square neckline, a silver chain at her throat with a drop of glass; an open overskirt of the violet over a silver
// underskirt, falling straight to the floor; fitted sleeves, puffed silver at the shoulder, flaring at the wrist into
// long hanging points lined silver. A long MANTLE of the violet lined silver from her shoulders, falling down her back
// into a long TRAIN on the floor behind her. Her face pale and fine-boned, high cheekbones, her lips a dark plum, the
// dull pink of the Hushed in her eyes; her hair blue-black, drawn back hard into a high coil, nothing loose. HER MARK:
// A CROWN OF GLASS SPIKES on a silver circlet, tall at the front and shorter round the back, pale lavender glass that
// catches the light. In her right hand HER POISONED COMB, held by its back across her fist, its long teeth out past
// her knuckles like a claw, the teeth stained violet-black. She glides: her feet never touch the floor under the gown
// (a flier, by his rule of 14 Oct). Nothing cyan anywhere: her glass is lavender and silver, her mirrors' glass a cold
// slate blue well away from the friend's hue. Not a cartoon witch: no hood, no hooked nose, no cauldron, no black cape
// with a standing collar; an original queen.

import { INK, hash } from './kit';
import type { Ramp } from './kit';
import { FLAME } from './mkit';
import { sphere } from './new_mobs3';
import type { Bit, MobCanvas, Moment, Put } from './new_mobs3';
import { wornOn } from './skin';
import type { Ring, Skin, Stage } from './skin';
import { add, buildOf, cross, dot, lerp3, mul, norm, standing, sub } from './skeleton';
import type { Bones, Build, Key3, Motion, Skeleton, V3 } from './skeleton';

/** THE SWITCH, OFF. Nothing of the game reads this file. */
export const QUEEN_ON = { on: false };

const fr = (t: number): number => t - Math.floor(t);
/** How far what hangs from her lags behind as she moves (the Hushed's own way, art/hushed.ts `lagOf`): back against the way she has come, at most `most`. */
function lagOf(m: Moment, k: number, most: number): V3 {
  const raw = mul(m.come, -k);
  const l = Math.hypot(raw[0], raw[1], raw[2]);
  return l > most ? mul(raw, most / l) : raw;
}
const clamp01 = (v: number): number => Math.max(0, Math.min(1, v));
const smooth = (a: number, b: number, t: number): number => {
  const u = clamp01((t - a) / (b - a));
  return u * u * (3 - 2 * u);
};

// =============================================================================================
// HER COLOURS: deep violet and silver; pale skin, blue-black hair; lavender glass; a cold slate-blue mirror glass

/** The gown and the mantle: a deep, cold violet. */
export const QN_GOWN: Ramp = ['#1a1029', '#2d1d45', '#47306a', '#66488e', '#8a6bb2'];
/** Silver: the lacing, the underskirt, the mantle's lining, the circlet, her comb's back. */
export const QN_SILVER: Ramp = ['#26263a', '#4c4c68', '#80809e', '#c2c2da', '#f0f0f8'];
/** Her skin: pale and cold. */
const SKIN: Ramp = ['#5a5060', '#867a88', '#ada2ae', '#cec4cc', '#e6dee2'];
/** Her hair: blue-black, drawn back hard. */
const HAIR: Ramp = ['#0a0910', '#14121c', '#1f1b2c', '#2e2840', '#433a58'];
/** Her lips: a dark plum. */
const LIPS = '#5a2440';
/** THE GLASS of her crown: pale lavender, catching the light (no glow: glass, not fire). */
export const QN_GLASS: Ramp = ['#2c2446', '#51477e', '#867cb8', '#bfb6e6', '#efeaff'];
/** Her mirrors' glass: a cold slate blue, well off the friend's cyan (its hue about 228, never 160 to 205). */
export const QN_MIRROR: Ramp = ['#161a2c', '#262d48', '#3e4970', '#64719c', '#97a2c8'];
/** Their frames: silver-gilt, a warm pale silver (no glow). */
export const QN_GILT: Ramp = ['#2c2822', '#4e4740', '#7e7564', '#ada38c', '#d6cfba'];
/** Her comb's teeth: stained violet-black with its poison. */
const TEETH: Ramp = ['#3a3450', '#6a6488', '#a29cc0', '#d4d0e8', '#f6f4fc'];
/** Their tips: stained violet-black with her poison. */
const STAIN: Ramp = ['#160a20', '#2a1440', '#44205e', '#62307e', '#8248a0'];
/** The mantle's lining: a pale grey lavender. */
const LINING: Ramp = ['#2a2638', '#4a4462', '#77709a', '#aaa3c8', '#d6d0ec'];
/** The poison: a violet mist (art/queen_fx.ts paints its cloud). */
export const QN_POISON: ReadonlyArray<string> = ['#2c1440', '#4a2066', '#6c3290', '#9452b4', '#bc84d6'];
/** A gem of dark violet glass, on her comb's back and at the front of her circlet. */
const GEM: Ramp = ['#1c0c2c', '#341848', '#52286c', '#7a4496', '#a874c0'];

// =============================================================================================
// HER BODY

/** A tall woman, a head and a half taller than the knight (58, his head 9.8 from chin to crown): slender, long in the limb, very upright. */
export const QUEEN_BODY: Build = buildOf(73, 1.12, { shoulders: 0.84, chest: 0.84, depth: 0.86, waist: 0.64, hips: 0.92, legs: 1.04, arms: 0.94, trunk: 1.02, limbs: 0.74 });
const B = QUEEN_BODY;
/** Her picture: room for her lunge and her comb at its reach, for her mirror beside her, and for her flung arms. */
export const QN_CANVAS: MobCanvas = { w: 372, h: 300, ax: 150, ay: 232 };
/** How far above the floor she glides (her feet, under the gown). */
export const QN_HOVER = 1.6;

/** Her rest: tall and very upright, her chin a little raised, her head turned a touch; her left hand before her waist, its fingers loose; her right low at her side, the comb in it, its teeth down. */
export const QUEEN_REST: Bones = {
  ...standing(B),
  pz: QN_HOVER, pitch: -2, bend: -2, roll: 0, side: 0, faceUp: 5, faceTilt: -3, faceTurn: -8,
  lfx: 1.0, lfy: 0.8, lfz: QN_HOVER + 2.4, lfp: 10, lft: 8, lk: 8, rfx: -1.2, rfy: -0.8, rfz: QN_HOVER + 2.8, rfp: 14, rft: -8, rk: -8,
  lhIn: 1, lhx: 7.2, lhy: -1.4, lhz: -17.5, le: -12,
  rhIn: 1, rhx: 2.4, rhy: -3.6, rhz: -24.5, re: 10,
  out: 0,
} as Bones;

// =============================================================================================
// WHAT SHE IS PAINTED WITH, frame by frame (set as each frame is painted)

/** How far her glass crown has cracked and broken (her death: 0 whole, 1 every spike snapped). */
let CRACK = 0;
/** What falls off her as this frame is painted (shards of her crown): grains. */
let FALLEN: [V3, string, number][] = [];

// =============================================================================================
// HER AS SOLIDS

/** The frame of a hand: along the forearm (`fore`), across the knuckles (`e2`), and out of the back of the hand (`e1`). */
function handFrame(s: Skeleton, side: 'L' | 'R', cu: V3): { hand: V3; fore: V3; e1: V3; e2: V3 } {
  const el = side === 'L' ? s.elbowL : s.elbowR;
  const hand = side === 'L' ? s.handL : s.handR;
  const fore = norm(sub(hand, el), [0, 0, -1]);
  const e1 = norm(sub(cu, mul(fore, dot(cu, fore))), [0, 0, 1]);
  const e2 = norm(cross(fore, e1), [0, 1, 0]);
  return { hand, fore, e1, e2 };
}

/** A sleeve: puffed silver at the shoulder, fitted violet to the wrist, flaring there into a long hanging point lined silver; a long pale hand, its fingers loose or closed on her comb. */
function arm(put: Put, s: Skeleton, side: 'L' | 'R', cu: V3, grip: number, t: number, m: Moment): void {
  const sh = side === 'L' ? s.shoulderL : s.shoulderR;
  const el = side === 'L' ? s.elbowL : s.elbowR;
  const { hand, fore, e1, e2 } = handFrame(s, side, cu);
  const [r0, r1, r2] = B.armR;
  // the sleeve full at the shoulder and narrowing to the elbow, a band of silver round its top
  const up = norm(sub(el, sh), [0, 0, -1]);
  const a1 = norm(cross(up, Math.abs(up[2]) < 0.9 ? [0, 0, 1] : [1, 0, 0]));
  const a2 = cross(up, a1);
  put(`arm${side}`, `arm${side}`, { k: 'ball', c: add(sh, mul(up, 0.6)), ax: [mul(up, r0 * 1.5), mul(a1, r0 * 1.32), mul(a2, r0 * 1.32)], skin: QN_GOWN, far: true });
  put(`arm${side}`, `arm${side}`, { k: 'rod', a: add(sh, mul(up, 0.8)), b: el, ra: r0 * 1.28, rb: r1 * 1.05, ramp: QN_GOWN, far: true });
  put(`arm${side}`, `trim${side}`, { k: 'band', ring: { c: add(sh, mul(up, 2.2)), u: mul(a1, r0 * 1.36), v: mul(a2, r0 * 1.36) }, ramp: QN_SILVER, rows: 1 });
  put(`fore${side}`, `fore${side}`, { k: 'ball', c: el, ax: sphere(r1 * 1.08), skin: QN_GOWN, far: true });
  const wrist = add(hand, mul(fore, -1.1));
  put(`fore${side}`, `fore${side}`, { k: 'rod', a: el, b: lerp3(el, wrist, 0.7), ra: r1 * 1.04, rb: r2 * 1.08, ramp: QN_GOWN, far: true });
  // THE CUFF: flaring from the forearm to the wrist, lined silver, and its long point hanging from under the wrist,
  // trailing as she moves (loose things follow)
  put(`fore${side}`, `cuff${side}`, { k: 'rod', a: lerp3(el, wrist, 0.62), b: add(wrist, mul(fore, 0.3)), ra: r2 * 1.15, rb: r1 * 1.55, ramp: QN_GOWN, far: true });
  put(`fore${side}`, `cuff${side}`, { k: 'rod', a: add(wrist, mul(fore, 0.15)), b: add(wrist, mul(fore, 0.55)), ra: r1 * 1.5, rb: r1 * 1.58, ramp: QN_SILVER, far: true });
  {
    const lag = lagOf(m, 1.3, 4);
    const sway = Math.sin(t * 1.3 + (side === 'L' ? 0 : 1.9)) * 0.5;
    // (the point hangs from the under side of the wrist: down, whatever the arm does, and back as she moves)
    const under = norm(sub(mul(e1, -1), mul(fore, 0.2)), [0, 0, -1]);
    const top = add(wrist, add(mul(under, r1 * 1.1), mul(fore, 0.2)));
    const mid = add(top, [lag[0] * 0.5 + sway * 0.3, lag[1] * 0.5 + sway, -5.5]);
    const end = add(mid, [lag[0] * 1.1 - 0.6, lag[1] * 1.1 + sway * 0.6, -6]);
    put(`fore${side}`, `point${side}`, { k: 'rod', a: top, b: mid, ra: r1 * 1.2, rb: r1 * 1.05, ramp: QN_GOWN, far: true });
    put(`fore${side}`, `point${side}`, { k: 'rod', a: mid, b: end, ra: r1 * 1.05, rb: 0.3, ramp: QN_GOWN, far: true });
  }
  // the hand, long-fingered
  put(`hand${side}`, `hand${side}`, { k: 'ball', c: add(hand, mul(fore, 0.4)), ax: [mul(fore, 1.6), mul(e2, 1.3), mul(e1, 0.75)], skin: SKIN, far: true });
  for (let i = 0; i < 4; i++) {
    const spread = (i - 1.5) * 0.32;
    const base = add(hand, add(mul(fore, 1.3), mul(e2, spread * 0.8)));
    const mid = add(base, add(mul(fore, 1.6 * (1 - 0.45 * grip)), mul(e1, -0.6 - 0.5 * grip)));
    const tip = add(mid, add(mul(fore, 1.3 * (1 - 0.8 * grip)), mul(e1, -0.7 - 0.5 * grip)));
    put(`hand${side}`, `finger${side}`, { k: 'rod', a: base, b: mid, ra: 0.42, rb: 0.36, ramp: SKIN, far: true });
    put(`hand${side}`, `finger${side}`, { k: 'rod', a: mid, b: tip, ra: 0.36, rb: 0.24, ramp: SKIN, far: true });
  }
}

/**
 * HER POISONED COMB as it lies, from her right hand: its back across her fist (its two ends out past the sides of it,
 * curled, a violet gem at its middle), its long teeth straight out past her knuckles along her forearm's line. In the
 * figure's own lengths; `teeth` the comb's tips, for the checks and the glints.
 */
export interface CombAt {
  back: [V3, V3];
  teeth: [V3, V3][];
  tip: V3;
  face: V3;
}
export const COMB = { half: 4.4, long: 12.5, teeth: 6 } as const;
export function combAt(s: Skeleton): CombAt {
  const cu = s.chest[2];
  const { hand, fore, e1, e2 } = handFrame(s, 'R', cu);
  const fist = add(hand, add(mul(fore, 1.6), mul(e1, -0.3)));
  const back: [V3, V3] = [add(fist, mul(e2, -COMB.half)), add(fist, mul(e2, COMB.half))];
  const teeth: [V3, V3][] = [];
  for (let i = 0; i < COMB.teeth; i++) {
    const k = (i / (COMB.teeth - 1) - 0.5) * 2;
    const a = add(fist, add(mul(e2, k * COMB.half * 0.86), mul(fore, 0.9)));
    // (the teeth a touch longer in the middle: the comb's edge curved)
    teeth.push([a, add(a, mul(fore, COMB.long * (1 - 0.1 * k * k)))]);
  }
  return { back, teeth, tip: add(fist, mul(fore, COMB.long + 0.9)), face: e1 };
}
function comb(put: Put, s: Skeleton, part: string): void {
  const c = combAt(s);
  const [a, b] = c.back;
  // its back: a bar of silver, its ends curled up into knobs, a gem at its middle
  put(part, 'comb', { k: 'rod', a, b, ra: 1.25, rb: 1.25, ramp: QN_SILVER });
  // (its ends curled back over the fist: the comb's carved top)
  const back = norm(sub(lerp3(a, b, 0.5), c.tip));
  for (const [e, sd] of [[a, -1], [b, 1]] as const) {
    const out = norm(sub(e, lerp3(a, b, 0.5)));
    const curl = add(e, add(mul(back, 2.2), mul(out, 0.8)));
    put(part, 'comb', { k: 'rod', a: e, b: curl, ra: 1.1, rb: 0.75, ramp: QN_SILVER });
    put(part, 'comb', { k: 'rod', a: curl, b: add(curl, add(mul(back, 0.6), mul(out, -1.4 * 1))), ra: 0.75, rb: 0.5, ramp: QN_SILVER });
    void sd;
  }
  put(part, 'comb', { k: 'ball', c: add(lerp3(a, b, 0.5), mul(c.face, 0.6)), ax: sphere(1.2), skin: GEM });
  for (const [t0, t1] of c.teeth) {
    const m = lerp3(t0, t1, 0.6);
    put(part, 'combteeth', { k: 'rod', a: t0, b: m, ra: 0.62, rb: 0.5, ramp: TEETH });
    put(part, 'combteeth', { k: 'rod', a: m, b: t1, ra: 0.5, rb: 0.3, ramp: STAIN });
  }
}
/** Her comb lying on the floor where it fell (her death): its back and teeth flat on the floor at `at`, pointing `deg`. */
function combOnFloor(put: Put, at: V3, deg: number): void {
  const f: V3 = [Math.cos((deg * Math.PI) / 180), Math.sin((deg * Math.PI) / 180), 0];
  const l: V3 = [-f[1], f[0], 0];
  const z = 1.1;
  const a = add([at[0], at[1], z], mul(l, -COMB.half));
  const b = add([at[0], at[1], z], mul(l, COMB.half));
  put('fallencomb', 'comb', { k: 'rod', a, b, ra: 0.9, rb: 0.9, ramp: QN_SILVER });
  for (const e of [a, b]) put('fallencomb', 'comb', { k: 'ball', c: e, ax: sphere(1.0), skin: QN_SILVER });
  for (let i = 0; i < COMB.teeth; i++) {
    const k = (i / (COMB.teeth - 1) - 0.5) * 2;
    const p = add([at[0], at[1], 0.8], mul(l, k * COMB.half * 0.86));
    put('fallencomb', 'combteeth', { k: 'rod', a: add(p, mul(f, 0.8)), b: add(p, mul(f, COMB.long)), ra: 0.45, rb: 0.3, ramp: TEETH });
  }
}

/** THE GOWN'S RINGS: the bodice from the waist to the square neckline; the skirt from the waist to the floor, falling straight; the mantle from her shoulders down her back into its train. */
function gownRings(s: Skeleton, m: Moment): { bodice: Ring[]; skirt: Ring[]; under: Ring[]; mantle: Ring[]; lining: Ring[]; f: V3; l: V3 } {
  const [cf, cl] = s.chest;
  const ph = m.wind * Math.PI * 2;
  const f = norm([s.hips[0][0], s.hips[0][1], 0], [1, 0, 0]);
  const l: V3 = [-f[1], f[0], 0];
  const lag = lagOf(m, 1.7, 8);
  const waistC = add(s.pelvis, mul(s.hips[2], B.waist * 0.62));
  const be = s.belly;
  const footMid = lerp3(lerp3(s.heelL, s.toeL, 0.5), lerp3(s.heelR, s.toeR, 0.5), 0.5);
  const kneeMid = lerp3(s.kneeL, s.kneeR, 0.5);
  const hemZ = Math.max(0.9, Math.min(s.toeL[2], s.toeR[2], s.heelL[2], s.heelR[2]) - 0.7);
  // (on her knees, her skirt pooled round her knees on the floor)
  const knelt = clamp01((16 - kneeMid[2]) / 10);
  const under: V3 = lerp3(footMid, [kneeMid[0] * 0.5 + s.pelvis[0] * 0.5, kneeMid[1] * 0.5 + s.pelvis[1] * 0.5, 0], knelt);
  const hemC: V3 = [under[0] + lag[0] * 0.9 - 0.6, under[1] + lag[1] * 0.9, hemZ];
  const hemDeep = B.pelvisDeep + 5.6 + 3.5 * knelt;
  const hemWide = B.pelvisHalf + 5.2 + 3.0 * knelt;
  const hemPts = (k: number, back: number): V3[] => {
    const out: V3[] = [];
    for (let i = 0; i < 24; i++) {
      const a = (i / 24) * Math.PI * 2;
      const rear = Math.max(0, -Math.cos(a));
      const p = add(hemC, add(mul(f, Math.cos(a) * (hemDeep * k + rear * rear * back)), mul(l, Math.sin(a) * hemWide * k)));
      out.push(add(p, add([0, 0, Math.max(0, Math.sin(ph * 2 + a * 3) * 0.3) + rear * 0.1], mul(lag, rear * 0.8))));
    }
    return out;
  };
  const bodice: Ring[] = [
    { c: s.ribs, u: mul(cf, B.ribDeep + 1.1), v: mul(cl, B.ribHalf + 1.1) },
    { c: lerp3(waistC, s.ribs, 0.5), u: mul(be[0], B.waistDeep + 1.3), v: mul(be[1], B.waistHalf + 1.2) },
    { c: waistC, u: mul(be[0], B.waistDeep + 1.1), v: mul(be[1], B.waistHalf + 1.0) },
  ].reverse();
  bodice.push({ c: lerp3(s.ribs, s.neck, 0.42), u: mul(cf, B.ribDeep + 0.8), v: mul(cl, B.shoulderHalf * 0.84) });
  const kneeRing = (k: number): Ring => ({ c: [kneeMid[0] * 0.55 + hemC[0] * 0.45 + lag[0] * 0.4, kneeMid[1] * 0.55 + hemC[1] * 0.45 + lag[1] * 0.4, Math.max(hemZ + 3, kneeMid[2] - 2)], u: mul(f, (B.pelvisDeep + 3.6) * k), v: mul(l, (B.pelvisHalf + 3.2) * k) });
  const skirt: Ring[] = [
    { c: hemC, u: mul(f, hemDeep), v: mul(l, hemWide), pts: hemPts(1, 3) },
    kneeRing(1),
    { c: [s.pelvis[0], s.pelvis[1], s.pelvis[2] - 1.0], u: mul(f, B.pelvisDeep + 2.4), v: mul(l, B.pelvisHalf + 2.2) },
    { c: waistC, u: mul(be[0], B.waistDeep + 1.4), v: mul(be[1], B.waistHalf + 1.3) },
  ];
  // the silver underskirt, a little inside the overskirt
  const underSk: Ring[] = [
    { c: add(hemC, mul(f, 0.4)), u: mul(f, hemDeep * 0.93), v: mul(l, hemWide * 0.93), pts: hemPts(0.93, 0).map((p) => add(p, mul(f, 0.4))) },
    kneeRing(0.92),
    { c: [s.pelvis[0], s.pelvis[1], s.pelvis[2] - 1.0], u: mul(f, B.pelvisDeep + 1.8), v: mul(l, B.pelvisHalf + 1.6) },
    { c: waistC, u: mul(be[0], B.waistDeep + 1.0), v: mul(be[1], B.waistHalf + 0.9) },
  ];
  // THE MANTLE: from her shoulders, down her back, out into its train on the floor behind her (it trails as she glides)
  const neckC = lerp3(s.ribs, s.neck, 0.78);
  const train = 15 + 3.5 * knelt;
  const mantleRings = (k: number, inset: number): Ring[] => {
    const hemM: V3[] = [];
    const c0: V3 = add(hemC, mul(f, -2.5));
    for (let i = 0; i < 24; i++) {
      const a = (i / 24) * Math.PI * 2;
      const rear = Math.max(0, -Math.cos(a));
      const p = add(c0, add(mul(f, Math.cos(a) * (hemDeep + 3) * k - rear * rear * train * k), mul(l, Math.sin(a) * (hemWide + 2.2) * k)));
      hemM.push(add(p, add([0, 0, 0.15 + Math.max(0, Math.sin(ph * 2 + a * 2) * 0.4) * rear], mul(lag, 0.6 + rear * 1.6))));
    }
    return [
      { c: add(add(neckC, mul(cf, -0.8)), [0, 0, 0.6]), u: mul(cf, (B.ribDeep + 1.9 - inset) * k), v: mul(cl, (B.shoulderHalf + 1.6 - inset) * k) },
      { c: add(add(waistC, mul(f, -1.4)), mul(lag, 0.25)), u: mul(f, (B.waistDeep + 3.6 - inset) * k), v: mul(l, (B.ribHalf + 3.8 - inset) * k) },
      { c: add(kneeRing(1).c, add(mul(f, -1.8), mul(lag, 0.4))), u: mul(f, (B.pelvisDeep + 5.6 - inset) * k), v: mul(l, (B.pelvisHalf + 6.2 - inset) * k) },
      { c: c0, u: mul(f, (hemDeep + 3) * k), v: mul(l, (hemWide + 2.2) * k), pts: hemM },
    ];
  };
  return { bodice, skirt, under: underSk, mantle: mantleRings(1, 0), lining: mantleRings(0.97, 0.3), f, l };
}

/** HER HEAD: a pale face, fine-boned, high in the cheek; the dull pink in her eyes; her lips a dark plum; her hair blue-black drawn back into a high coil; her CROWN OF GLASS SPIKES. */
function head(put: Put, st: Stage, s: Skeleton, lit: number, t: number): { ff: V3; fl: V3; fu: V3; hc: V3 } {
  const [ff, fl, fu] = wornOn(st, s, 8);
  const hr: V3 = [B.headR[0] * 0.98, B.headR[1] * 0.98, B.headR[2] * 1.04];
  const hc = add(s.head, mul(fu, -0.2));
  const skin: Skin = (u, tone) => {
    const fwd = u[0];
    const side = Math.abs(u[1]);
    // her lips: a short line of dark plum
    if (fwd > 0.8 && side < 0.2 && u[2] < -0.44 && u[2] > -0.53) return LIPS;
    // the hollow under her cheekbones, and the bone itself lit
    if (fwd > 0.42 && fwd < 0.74 && side > 0.46 && side < 0.72 && u[2] < -0.18 && u[2] > -0.52) return SKIN[Math.max(0, tone - 1)];
    if (fwd > 0.45 && fwd < 0.78 && side > 0.42 && side < 0.66 && u[2] > -0.16 && u[2] < -0.02) return SKIN[Math.min(4, tone + 1)];
    // the ridge of her nose
    if (fwd > 0.9 && side < 0.12 && u[2] > -0.32 && u[2] < 0.06) return SKIN[Math.min(4, tone + 1)];
    // her hair: drawn back from a high brow, close over the top and round the back and sides
    if (fwd < 0.05 || u[2] > 0.5) return HAIR[Math.min(4, tone)];
    if (side > 0.8 && u[2] > -0.25) return HAIR[tone];
    return SKIN[tone];
  };
  put('head', 'head', { k: 'ball', c: hc, ax: [mul(ff, hr[0]), mul(fl, hr[1]), mul(fu, hr[2])], skin });
  // her brows: thin, dark and arched
  for (const k of [-1, 1]) {
    const a = add(hc, add(mul(ff, hr[0] * 0.9), add(mul(fl, k * hr[1] * 0.12), mul(fu, hr[2] * 0.26))));
    const b = add(hc, add(mul(ff, hr[0] * 0.7), add(mul(fl, k * hr[1] * 0.6), mul(fu, hr[2] * 0.36))));
    put('head', 'brows', { k: 'rod', a, b, ra: 0.42, rb: 0.32, ramp: HAIR });
  }
  for (const k of [-1, 1]) {
    const e = add(hc, add(mul(ff, hr[0] * 0.93), add(mul(fl, k * hr[1] * 0.34), mul(fu, hr[2] * 0.08))));
    put('head', 'eyes', { k: 'dot', p: e, c: lit > 0.4 ? FLAME[1] : '#3a2a34', facing: ff, c2: lit > 0.4 ? FLAME[2] : '#2a1e26' });
  }
  // HER HAIR'S COIL: high at the back of her head, wound round, a silver pin through it
  const coil = add(hc, add(mul(ff, -hr[0] * 0.78), mul(fu, hr[2] * 0.55)));
  const coilSkin: Skin = (u, tone) => (Math.abs(Math.sin(Math.atan2(u[1], u[2]) * 2 + u[0] * 3)) < 0.22 ? HAIR[Math.max(0, tone - 1)] : HAIR[Math.min(4, tone + 1)]);
  put('head', 'coil', { k: 'ball', c: coil, ax: [mul(ff, 2.6), mul(fl, 3.0), mul(fu, 2.7)], skin: coilSkin });
  put('head', 'coil', { k: 'rod', a: add(coil, mul(fl, 4.4)), b: add(coil, mul(fl, -4.2)), ra: 0.42, rb: 0.42, ramp: QN_SILVER });
  // THE CROWN OF GLASS SPIKES: a silver circlet round her brow, spikes of glass standing up off it all round, tallest at
  // the front, splayed a little; cracked and snapped one by one as she dies
  const ring: Ring = { c: add(hc, mul(fu, hr[2] * 0.38)), u: mul(ff, hr[0] * 1.04), v: mul(fl, hr[1] * 1.06) };
  put('head', 'circlet', { k: 'band', ring, ramp: QN_SILVER, rows: 2 });
  const N = 9;
  for (let i = 0; i < N * 2; i++) {
    const big = i % 2 === 0;
    const a = (i / (N * 2)) * Math.PI * 2;
    const front = (1 + Math.cos(a)) / 2;
    const base = add(ring.c, add(mul(ring.u, Math.cos(a) * 0.98), mul(ring.v, Math.sin(a) * 0.98)));
    // (splayed out from her head like the points of a star, the front ones most upright)
    const out = norm(add(fu, add(mul(ff, Math.cos(a) * (0.22 + 0.25 * (1 - front))), mul(fl, Math.sin(a) * (0.5 + 0.2 * (1 - front))))));
    // (uneven, as ice is: the middle one at the front tallest)
    const odd = [1, 0.72, 0.9, 0.62, 0.8, 0.8, 0.62, 0.9, 0.72][(i / 2) % 9];
    const h = big ? (5.0 + 10.5 * front ** 1.4) * odd : 2.2 + 2.4 * front ** 1.5;
    const ra = big ? 1.25 : 0.65;
    const top = add(base, add(mul(out, h), mul(fl, Math.sin(i * 2.3) * 0.25)));
    // (as she dies, each spike cracks in its own time and snaps: its top falls, its stump stays)
    const own = hash(i, 5, 7701);
    const snapped = big ? clamp01((CRACK * 1.5 - own * 0.5 - 0.15) * 4) : clamp01((CRACK * 1.4 - own * 0.4) * 3);
    if (snapped > 0) {
      const stump = add(base, mul(out, h * (0.35 + 0.15 * own)));
      put('head', 'crown', { k: 'rod', a: base, b: stump, ra, rb: ra * 0.75, ramp: QN_GLASS });
      // (the top falls: a few shards on their way to the floor, then lying there)
      const fall = clamp01(snapped);
      const from = lerp3(stump, top, 0.5);
      const land: V3 = [from[0] + Math.cos(a) * (6 + 8 * own), from[1] + Math.sin(a) * (6 + 8 * own), 0.5];
      for (let j = 0; j < 3; j++) {
        const p = lerp3(from, land, fall);
        const arc = Math.sin(Math.PI * fall) * 4;
        FALLEN.push([add(p, [j * 0.9 - 0.9, (j % 2) * 0.8, arc + (fall < 1 ? j * 1.2 : 0)]), j === 1 ? QN_GLASS[4] : QN_GLASS[2 + (j % 2)], fall < 1 ? 2 : 1]);
      }
    } else {
      put('head', 'crown', { k: 'rod', a: base, b: top, ra, rb: 0.16, ramp: QN_GLASS });
      // (a glint of light down the glass, on the side toward the eye)
      if (big) put('head', 'crown', { k: 'dot', p: lerp3(base, top, 0.42), c: QN_GLASS[4], facing: norm(sub(base, hc)) });
      // (a crack running up it, dark, before it snaps)
      const cracking = big ? clamp01((CRACK * 1.5 - own * 0.5 + 0.2) * 4) : 0;
      if (cracking > 0.3) put('head', 'crown', { k: 'rod', a: lerp3(base, top, 0.2), b: lerp3(base, top, 0.2 + 0.5 * cracking), ra: 0.3, rb: 0.3, ramp: [INK, INK, QN_GLASS[0], QN_GLASS[0], QN_GLASS[1]] });
    }
  }
  // the gem at its front: a drop of dark violet glass
  const gemAt = add(ring.c, add(mul(ring.u, 1.05), mul(fu, 0.8)));
  put('head', 'crown', { k: 'ball', c: gemAt, ax: [mul(ff, 0.8), mul(fl, 1.1), mul(fu, 1.4)], skin: GEM });
  void t;
  return { ff, fl, fu, hc };
}

// =============================================================================================
// HER LOOKING-GLASS (art/queen_moves.ts, Looking Glass): a tall mirror that forms beside her out of shards, which she
// steps into and out of. Also what the hall's mirrors are built from (art/queen_fx.ts).

/**
 * A MIRROR as one of her moves has it: its glass the plane `y` = `at[1]` facing along -y (toward whoever stands before
 * it), its middle along x at `at[0]`, its foot on the floor; `half` its half-width, `tall` its glass's height.
 */
export interface Glass {
  at: readonly [number, number];
  half: number;
  tall: number;
  /** 0: not there; to 1: gathered whole out of its shards (each pane of it come in its own time), its frame drawn up from its foot. */
  form: number;
  /** 0: whole; to 1: burst into shards and gone. */
  gone: number;
  /** Ripples running out across its glass: where each began (across from its middle, and up from its foot) and how long ago (seconds). */
  ripples: ReadonlyArray<readonly [number, number, number]>;
  /** How it trembles (0 still, 1 shaking hard: the hall's mirrors before they burst). */
  shake?: number;
  /** Cracks across it (0 none, 1 crazed all over). */
  crazed?: number;
  /** Its frame stays when its glass has burst (a mirror of the hall); if not, the frame goes with it (her looking-glass). */
  keepFrame?: boolean;
  /** Cut away above this height (a mirror on the hall's near side, cut away as the game cuts what stands between the eye and the fight). */
  cut?: number;
  t: number;
}
/** A mirror's glass and frame as solids: the panes that have come, the frame drawn up as far as it has come. */
export function glassBits(put: Put, g: Glass, part = 'glass'): { shards: [V3, string, number][] } {
  const shards: [V3, string, number][] = [];
  if (g.form <= 0.001 || (g.gone >= 0.999 && !g.keepFrame)) return { shards };
  const W = g.half;
  const Hh = g.tall / 2;
  const foot = 1.8;
  const shake = g.shake ?? 0;
  const jx = shake * Math.sin(g.t * 71) * 0.9;
  const jz = shake * Math.cos(g.t * 53) * 0.5;
  const c: V3 = [g.at[0] + jx, g.at[1], foot + Hh + jz];
  const arch = W;
  const inGlass = (a: number, b: number): boolean => b <= Hh - arch || a * a + (b - (Hh - arch)) ** 2 <= arch * arch;
  // (its panes: each a cell of the glass, come in its own time as it forms, gone in its own as it bursts)
  const PANE = 5.5;
  const paneOf = (a: number, b: number): [number, number] => {
    const i = Math.floor((a + W) / PANE + 0.35 * Math.sin(b * 0.4));
    const j = Math.floor((b + Hh) / PANE + 0.3 * Math.sin(a * 0.5 + 1));
    return [i, j];
  };
  const comeAt = (i: number, j: number): number => 0.25 + 0.7 * hash(i, j, 7711);
  const crazed = g.crazed ?? 0;
  const cut = g.cut ?? Infinity;
  const skin = (a: number, b: number, front: boolean, tone: number): string | null => {
    if (!inGlass(a, b)) return null;
    if (c[2] + b > cut) return null;
    const [i, j] = paneOf(a, b);
    if (g.form < 1 && comeAt(i, j) > g.form) return null;
    if (g.gone > 0 && hash(i, j, 7712) < g.gone * 1.05) return null;
    if (!front) return (Math.floor((a + W) / 6) % 2 ? '#1a1720' : '#1e1b25');
    let k = Math.max(1, Math.min(3, tone));
    // a sheen across it, the light from the upper left
    const sheen = (a * 0.55 + b + 400) % 34;
    if (sheen < 3) k = Math.min(4, k + 1);
    else if (sheen < 5) k = Math.min(4, k + 2);
    // the ripples: a bright ring running out, fading as it goes
    for (const [ra, rb, age] of g.ripples) {
      if (age < 0) continue;
      // (its middle given up from the floor)
      const d = Math.hypot(a - ra, (b + Hh + foot - rb) * 0.9);
      for (const lag of [0, 0.14, 0.28]) {
        const r = 34 * (age - lag);
        if (r < 0) continue;
        const fade = 1 - clamp01((age - lag) / 0.9);
        if (fade > 0 && Math.abs(d - r) < 1.1 + 0.6 * fade) k = Math.min(4, k + (lag === 0 ? 2 : 1));
      }
    }
    // a pane just come or just going: its edge catches the light
    if (g.form < 1 && comeAt(i, j) > g.form - 0.08) k = 4;
    // crazed: dark cracks across it
    if (crazed > 0) {
      const cr = Math.abs(Math.sin(a * 0.9 + Math.sin(b * 0.31) * 2.4) * Math.cos(b * 0.23 - a * 0.2));
      if (cr < 0.05 * crazed) return QN_MIRROR[0];
      if (hash(i, j, 7713) < crazed * 0.6 && Math.abs(((a + W) % PANE) - PANE / 2) > PANE / 2 - 0.45) return INK;
    }
    return QN_MIRROR[k];
  };
  put(part, 'pane', { k: 'panel', c, u: [W, 0, 0], v: [0, 0, Hh], skin });
  // THE FRAME: silver-gilt round its glass, up from its foot as it forms; a finial at its crown, scrolls either side
  const F = 1.5;
  const outline: V3[] = [];
  const y = g.at[1] + 0.6;
  // (from its foot at the left, up its side, round its arch, down its other side)
  outline.push([c[0] - W - F * 0.6, y, foot]);
  outline.push([c[0] - W - F * 0.6, y, c[2] + Hh - arch]);
  for (let i = 1; i <= 8; i++) {
    const a = Math.PI - (i / 8) * Math.PI;
    outline.push([c[0] + Math.cos(a) * (arch + F * 0.6), y, c[2] + Hh - arch + Math.sin(a) * (arch + F * 0.6)]);
  }
  outline.push([c[0] + W + F * 0.6, y, foot]);
  const drawn = g.keepFrame ? 1 : clamp01((g.form - 0.05) / 0.75) * (1 - smooth(0.2, 0.9, g.gone));
  // (drawn up both sides from the foot at once)
  const seg = outline.length - 1;
  for (let i = 0; i < seg; i++) {
    const mid = Math.min(i + 0.5, seg - i - 0.5) / (seg / 2);
    if (mid > drawn + 0.02) continue;
    let [p0, p1] = [outline[i], outline[i + 1]];
    if (Math.min(p0[2], p1[2]) > cut) continue;
    if (p1[2] > cut) p1 = lerp3(p0, p1, (cut - p0[2]) / (p1[2] - p0[2]));
    if (p0[2] > cut) p0 = lerp3(p1, p0, (cut - p1[2]) / (p0[2] - p1[2]));
    put(part, 'frame', { k: 'rod', a: p0, b: p1, ra: F, rb: F, ramp: QN_GILT });
  }
  // the foot: a rail along the floor, and two feet
  if (drawn > 0.05) {
    put(part, 'frame', { k: 'rod', a: [c[0] - W - F, y, foot], b: [c[0] + W + F, y, foot], ra: F * 1.05, rb: F * 1.05, ramp: QN_GILT });
    for (const sx of [-1, 1]) put(part, 'frame', { k: 'rod', a: [c[0] + sx * (W - 2), y, foot], b: [c[0] + sx * (W + 3.5), y - 3.5, 1.4], ra: 1.3, rb: 1.0, ramp: QN_GILT });
  }
  if (drawn > 0.97 && cut === Infinity) {
    const top: V3 = [c[0], y, c[2] + Hh + F * 0.6];
    put(part, 'frame', { k: 'rod', a: top, b: add(top, [0, 0, 7]), ra: 1.5, rb: 0.3, ramp: QN_GILT });
    put(part, 'frame', { k: 'ball', c: add(top, [0, 0, 1.6]), ax: sphere(1.5), skin: QN_GILT });
    for (const sx of [-1, 1]) {
      const s0: V3 = [c[0] + sx * (arch * 0.62), y, c[2] + Hh - arch * 0.2];
      put(part, 'frame', { k: 'rod', a: s0, b: add(s0, [sx * 3.2, 0, 3.6]), ra: 1.1, rb: 0.6, ramp: QN_GILT });
      put(part, 'frame', { k: 'ball', c: add(s0, [sx * 3.4, 0, 4.0]), ax: sphere(1.15), skin: QN_GILT });
    }
  }
  // THE SHARDS: flying in to their panes as it forms, flung out and falling as it bursts
  if (g.form < 1) {
    for (let n = 0; n < 46; n++) {
      const a = (hash(n, 1, 7714) - 0.5) * 2 * W * 0.9;
      const b = (hash(n, 2, 7714) - 0.5) * 2 * Hh * 0.9;
      const [i, j] = paneOf(a, b);
      const at = comeAt(i, j);
      const k = clamp01((g.form - (at - 0.3)) / 0.3);
      if (k <= 0 || k >= 1) continue;
      const ang = hash(n, 3, 7714) * Math.PI * 2;
      const far = 26 + 22 * hash(n, 4, 7714);
      const from: V3 = [c[0] + a + Math.cos(ang) * far, g.at[1] - 8 - Math.abs(Math.sin(ang)) * far * 0.6, c[2] + b + Math.sin(ang) * far * 0.7];
      const to: V3 = [c[0] + a, g.at[1] - 0.5, c[2] + b];
      const e = k * k;
      const p = lerp3(from, to, e);
      if (p[2] > cut) continue;
      shards.push([p, n % 3 === 0 ? QN_GLASS[4] : n % 3 === 1 ? QN_MIRROR[4] : QN_GLASS[3], 2]);
      shards.push([lerp3(from, to, Math.max(0, e - 0.12)), QN_MIRROR[3], 1]);
    }
  }
  if (g.gone > 0) {
    for (let n = 0; n < 60; n++) {
      const a = (hash(n, 5, 7714) - 0.5) * 2 * W * 0.9;
      const b = (hash(n, 6, 7714) - 0.5) * 2 * Hh * 0.9;
      const [i, j] = paneOf(a, b);
      const go = hash(i, j, 7712) / 1.05;
      const k = clamp01((g.gone - go) / 0.45);
      if (k <= 0 || k >= 1) continue;
      const out = 10 + 16 * hash(n, 7, 7714);
      const side = (hash(n, 8, 7714) - 0.5) * 18;
      const z0 = c[2] + b;
      const z = Math.max(0.6, z0 + 14 * k - (z0 + 18) * k * k);
      shards.push([[c[0] + a + side * k, g.at[1] - out * k, z], n % 2 ? QN_GLASS[4] : QN_MIRROR[4], k < 0.6 ? 2 : 1]);
    }
  }
  return { shards };
}

// =============================================================================================
// HER, FRAME BY FRAME

/** What a moment of a move says of her over and above the bones. */
export interface QueenSay {
  /** Her looking-glass beside her (Looking Glass), as it is now (null: none). */
  glass?: (m: Moment) => Glass | null;
  /** Whether she is through the glass and not here at all (Looking Glass: between stepping in and stepping out). */
  away?: (m: Moment) => boolean;
  /** How far her crown has cracked (her death: 0 whole, 1 every spike snapped). */
  crack?: (m: Moment) => number;
  /** Whether her comb has fallen from her hand, and where it lies (her death). */
  dropped?: (m: Moment) => { at: V3; deg: number; fall: number } | null;
  /** THE SMEAR OF A LIGHTNING STRIKE (his Movement 9): after-images of what strikes along the way it has just come, each a line of points, the oldest first. */
  smear?: (m: Moment) => V3[][] | null;
  /** Grains of her own move laid after her edge (her comb's teeth glinting, its poison, her glass's shards, her breath). */
  more?: (m: Moment) => [V3, string, number][];
}
/** The smear's after-images: the oldest a dull lavender, the newest near white. Her own; nothing else of hers is painted in them. */
export const QN_SMEAR = ['#857cae', '#cfc8ea', '#f6f2ff'] as const;

const GRAINS = new WeakMap<Moment, [V3, string, number][]>();
function queenBits(st: Stage, m: Moment, say: QueenSay): Bit[] {
  const { s, q } = m;
  const bits: Bit[] = [];
  const grains: [V3, string, number][] = [];
  GRAINS.set(m, grains);
  const put: Put = (part, piece, shape) => bits.push({ part, piece, shape });
  CRACK = clamp01(say.crack?.(m) ?? 0);
  FALLEN = [];
  // HER LOOKING-GLASS beside her
  const G = say.glass?.(m) ?? null;
  if (G) grains.push(...glassBits(put, G).shards);
  const away = say.away?.(m) ?? false;
  if (!away) {
    const [cf, cl, cu] = s.chest;
    const lit = 1 - clamp01(q.out);
    const t = m.t;
    // (her feet, under the gown, never seen: small slippers in case a step shows)
    for (const side of ['L', 'R'] as const) {
      const heel = side === 'L' ? s.heelL : s.heelR;
      const toe = side === 'L' ? s.toeL : s.toeR;
      put(`foot${side}`, `foot${side}`, { k: 'rod', a: add(heel, [0, 0, 1.0]), b: add(toe, [0, 0, 0.8]), ra: 1.0, rb: 0.8, ramp: QN_SILVER, far: true });
    }
    const g = gownRings(s, m);
    // THE MANTLE down her back and its train, lined silver; the silver underskirt; the violet overskirt open over it
    put('mantle', 'mantle', { k: 'cloth', rings: g.mantle, ramp: QN_GOWN, look: { folds: [130, 155, 180, 205, 230], lift: 0.05, hem: QN_SILVER, arc: [92, 268], lining: 0.2 } });
    put('mantleIn', 'mantle', { k: 'cloth', rings: g.lining, ramp: LINING, look: { lift: 0.05, arc: [96, 264], lining: 0.1 } });
    put('under', 'underskirt', { k: 'cloth', rings: g.under, ramp: QN_SILVER, look: { folds: [0, 14, -14], lift: 0.05 } });
    put('skirt', 'skirt', { k: 'cloth', rings: g.skirt, ramp: QN_GOWN, look: { folds: [60, -60, 90, -90, 125, -125, 160, -160], lift: 0.05, hem: QN_SILVER, arc: [38, 322], lining: 0.3 } });
    put('body', 'bodice', { k: 'cloth', rings: g.bodice, ramp: QN_GOWN, look: { folds: [40, -40], lift: 0.03 } });
    // THE LACED BODICE (the book's): a stomacher of silver down its front, broad at the neckline and narrowing to the
    // waist, a dark violet lace crossing and crossing again up it
    put('body', 'stomacher', { k: 'cloth', rings: g.bodice.map((r) => ({ c: r.c, u: mul(r.u, 1.04), v: mul(r.v, 1.04) })), ramp: QN_SILVER, look: { lift: 0.03, arc: [-34, 34], lining: 0.4 } });
    {
      const rings = g.bodice;
      const rows = 4;
      // (a point on the stomacher, `k` of the way up it from the waist, `sd` across it, on its face)
      const at = (k: number, sd: number): V3 => {
        const u = k * (rings.length - 1);
        const j = Math.min(rings.length - 2, Math.floor(u));
        const f = u - j;
        const c = lerp3(rings[j].c, rings[j + 1].c, f);
        const ru = lerp3(rings[j].u, rings[j + 1].u, f);
        const rv = lerp3(rings[j].v, rings[j + 1].v, f);
        const a = sd * 0.36;
        return add(c, add(mul(ru, Math.cos(a) * 1.1), mul(rv, Math.sin(a) * 1.1)));
      };
      // (laced across, row over row, as a stay is: dark bars across the silver, an eyelet of silver either end)
      for (let i = 0; i < rows; i++) {
        const k = 0.12 + (0.78 * i) / (rows - 1);
        put('body', 'lace', { k: 'rod', a: at(k, -0.8), b: at(k + 0.04, 0.8), ra: 0.36, rb: 0.36, ramp: QN_GOWN });
      }
      void cf;
      const waistC = add(s.pelvis, mul(s.hips[2], B.waist * 0.62));
      // a silver girdle at her waist, its end hanging down the front of the skirt
      put('body', 'girdle', { k: 'band', ring: { c: waistC, u: mul(s.belly[0], B.waistDeep + 1.45), v: mul(s.belly[1], B.waistHalf + 1.35) }, ramp: QN_SILVER, rows: 1 });
      const knot = add(waistC, mul(s.belly[0], B.waistDeep + 1.6));
      const lag = lagOf(m, 1.4, 5);
      let prev = knot;
      for (let i = 1; i <= 5; i++) {
        const p = add(knot, [lag[0] * 0.4 * (i / 5) + 0.45 * i * s.hips[0][0], lag[1] * 0.4 * (i / 5) + 0.45 * i * s.hips[0][1], -3.4 * i]);
        const p2: V3 = p[2] < 1.4 ? [p[0], p[1], 1.4] : p;
        put('skirt', 'girdle', { k: 'rod', a: prev, b: p2, ra: 0.42, rb: 0.38, ramp: QN_SILVER });
        prev = p2;
      }
      put('skirt', 'girdle', { k: 'ball', c: prev, ax: sphere(0.95), skin: QN_GLASS });
    }
    // her throat and the square of her breast above the neckline; a silver chain with a drop of glass
    put('neck', 'neck', { k: 'rod', a: add(lerp3(s.ribs, s.neck, 0.4), mul(cu, 0.4)), b: lerp3(s.neck, s.head, 0.55), ra: 1.85, rb: 1.5, ramp: SKIN });
    put('neck', 'collar', { k: 'ball', c: add(lerp3(s.ribs, s.neck, 0.62), mul(cf, 0.5)), ax: [mul(cf, B.ribDeep * 0.72), mul(cl, B.shoulderHalf * 0.78), mul(cu, 2.1)], skin: SKIN });
    {
      const nc = add(lerp3(s.ribs, s.neck, 0.7), mul(cf, 0.2));
      put('neck', 'chain', { k: 'band', ring: { c: nc, u: mul(cf, B.ribDeep * 0.82), v: mul(cl, B.shoulderHalf * 0.5) }, ramp: QN_SILVER, rows: 1 });
      const drop = add(nc, add(mul(cf, B.ribDeep * 0.86), mul(cu, -2.4)));
      put('neck', 'chain', { k: 'ball', c: drop, ax: [mul(cf, 0.7), mul(cl, 0.75), mul(cu, 1.2)], skin: QN_GLASS });
    }
    // THE ARMS: the left hand loose, the right closed on her comb
    const dropped = say.dropped?.(m) ?? null;
    arm(put, s, 'L', cu, 0.3, t, m);
    arm(put, s, 'R', cu, dropped ? 0.35 : 1, t, m);
    if (!dropped) comb(put, s, 'handR');
    else if (dropped.fall >= 1) combOnFloor(put, dropped.at, dropped.deg);
    else {
      // (falling from her hand to the floor)
      const c = combAt(s);
      const k = dropped.fall;
      const from = lerp3(c.back[0], c.back[1], 0.5);
      const p = lerp3(from, dropped.at, k);
      const z = from[2] * (1 - k * k);
      const f = norm(sub(c.tip, from));
      const dir: V3 = norm([f[0], f[1], f[2] * (1 - k)]);
      const l = norm(cross([0, 0, 1], dir), [0, 1, 0]);
      const at: V3 = [p[0], p[1], Math.max(1.2, z)];
      put('fallencomb', 'comb', { k: 'rod', a: add(at, mul(l, -COMB.half)), b: add(at, mul(l, COMB.half)), ra: 0.9, rb: 0.9, ramp: QN_SILVER });
      put('fallencomb', 'combteeth', { k: 'rod', a: at, b: add(at, mul(dir, COMB.long)), ra: 1.0, rb: 0.5, ramp: TEETH });
    }
    head(put, st, s, lit, t);
    // THE SMEAR of a lightning strike: its after-images, pale, the oldest thinned to every other point
    const sm = say.smear?.(m);
    if (sm) {
      sm.forEach((line, j) => {
        const k = j / Math.max(1, sm.length - 1);
        for (let i = 1; i < line.length; i++) {
          const [x0, y0] = st.at(line[i - 1]);
          const [x1, y1] = st.at(line[i]);
          const n = Math.max(1, Math.ceil(Math.hypot(x1 - x0, y1 - y0)));
          for (let e = 0; e < n; e++) {
            if (k < 0.5 && (e + i) % 2) continue;
            put('smear', 'smear', { k: 'mote', p: lerp3(line[i - 1], line[i], e / n), c: k > 0.7 ? QN_SMEAR[2] : k > 0.35 ? QN_SMEAR[1] : QN_SMEAR[0], size: k > 0.7 ? 2 : 1 });
          }
        }
      });
    }
  } else {
    // (through the glass: only what follows her in, the smear of her going, is left)
    const sm = say.smear?.(m);
    if (sm) {
      sm.forEach((line, j) => {
        const k = j / Math.max(1, sm.length - 1);
        for (let i = 1; i < line.length; i++) {
          const [x0, y0] = st.at(line[i - 1]);
          const [x1, y1] = st.at(line[i]);
          const n = Math.max(1, Math.ceil(Math.hypot(x1 - x0, y1 - y0)));
          for (let e = 0; e < n; e++) {
            if (k < 0.5 && (e + i) % 2) continue;
            put('smear', 'smear', { k: 'mote', p: lerp3(line[i - 1], line[i], e / n), c: k > 0.7 ? QN_SMEAR[2] : k > 0.35 ? QN_SMEAR[1] : QN_SMEAR[0], size: k > 0.7 ? 2 : 1 });
          }
        }
      });
    }
  }
  grains.push(...FALLEN, ...(say.more?.(m) ?? []));
  return bits;
}

/** HER STAND: 2.8 s round. Cold and still, but alive: she breathes slowly, rising and sinking a hair on the air, her gown stirring; her head turns a little, as if listening to her mirror; her left hand drifts; her comb turns in her fingers. */
export const QN_STAND_LONG = 2.8;
export function queenStand(): Motion {
  const R = QUEEN_REST;
  const T = QN_STAND_LONG;
  const keys: Key3[] = [];
  const N = 28;
  for (let i = 0; i <= N; i++) {
    const t = (i / N) * T;
    const a = (t / T) * Math.PI * 2;
    keys.push({
      at: t,
      ease: 'lin',
      pose: {
        pz: R.pz + 0.9 * Math.sin(a),
        py: 1.3 * Math.sin(a + 0.6),
        px: 0.4 * Math.sin(a + 2.2),
        roll: R.roll + 1.8 * Math.sin(a + 0.6),
        side: R.side + 1.1 * Math.sin(a + 0.6),
        bend: R.bend - 1.6 * Math.sin(a),
        faceTurn: R.faceTurn + 9 * Math.sin(a + 0.4),
        faceTilt: R.faceTilt + 3 * Math.sin(a * 2),
        faceUp: R.faceUp + 1.5 * Math.sin(a + 1.2),
        lhx: R.lhx + 1.0 * Math.sin(a + 0.8), lhy: R.lhy + 0.8 * Math.sin(a + 1.4), lhz: R.lhz + 0.9 * Math.sin(a + 0.8),
        rhz: R.rhz + 0.6 * Math.sin(a), rhx: R.rhx + 0.5 * Math.sin(a + 2),
        lfz: R.lfz + 0.9 * Math.sin(a), rfz: R.rfz + 0.9 * Math.sin(a),
      },
    });
  }
  return { loop: 0, keys };
}

/** HER AS THE PAINTER TAKES HER. */
export function queenPainter(say: QueenSay): { bits: (st: Stage, m: Moment) => Bit[]; grains: (st: Stage, m: Moment) => ReadonlyArray<readonly [V3, string, number]> } {
  return { bits: (st, m) => queenBits(st, m, say), grains: (_st, m) => GRAINS.get(m) ?? [] };
}
void fr;
