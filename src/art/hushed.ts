// THE HUSHED TOWNSFOLK, THE CITY'S SMALL MOB (the art chat for floors 11 to 15, 18 Oct 2026). A MOCK-UP: NOT IN THE
// GAME. Nothing of the game imports this file; `HUSHED_ON` is off.
//
// His picks for floor 11's monsters, 18 Oct: “The Hushed townsfolk (Recommended)” (offered as: small, in crowds:
// silent townsfolk with blank faces, lips moving, shuffling and grabbing), with the Hushed watch, the Silent Order
// scribes and the mute watch hounds. Then, of the townsfolk, as his rulebook's questions for a new character (one
// pop-up):
// - what marks them as Hushed: “The Hush leaking out” (offered as: grey breath curling from their open mouths as
//   they come at you);
// - how they fight: “Shuffle, then lunge and grab (Recommended)” (offered as: slow shuffling crowds that suddenly
//   lunge to grab and claw at you);
// - how they go down: “The Hush leaves them (Recommended)” (offered as: they gasp as grey breath leaves them, and
//   slump to the ground: people, not monsters).
// And his words of the same afternoon on the act's enemies: “I’d like no not reuse any enemies from the previous
// act”; “So some of the new enemies can be used throughout the next 10 levels.”; “But let’s keep the acts
// separate”. So they are the city's own, drawn to turn up anywhere in it, and nothing of Act 1's.
//
// WHO THEY ARE: the city's ordinary people, their words stolen by the Silent Order (the planning chat's story, his
// yes as an idea: "silent townsfolk, blank faces, lips moving, not undead, not gory"). Three of them, for a crowd:
// a PORTER (a cloth cap, a short smock of dull blue, breeches, a neckerchief), a GOODWIFE (a kerchief over her hair,
// a green shawl, a long madder skirt and an apron) and a BAKER (a linen coif, his shirtsleeves rolled, a long
// floured apron). All grown men and women: no child among them. Their faces drained grey, their eyes glazed with a
// dull pink (the cult's), their mouths hanging open and working on words that make no sound, and the Hush leaking
// out of them: grey breath curling up out of their mouths. The enemy's pink edge round them while they live (the
// painter's). Nothing cyan.

import { HUSH } from './crier';
import { INK, hash } from './kit';
import type { Ramp } from './kit';
import { FLAME } from './mkit';
import { sphere } from './new_mobs3';
import type { Bit, MobCanvas, Moment, Put } from './new_mobs3';
import { wornOn } from './skin';
import type { Ring, Skin, Stage } from './skin';
import { add, buildOf, cross, dot, len, lerp3, mul, norm, standing, sub } from './skeleton';
import type { Bones, Build, Key3, Motion, Skeleton, V3 } from './skeleton';

/** THE SWITCH, OFF. Nothing of the game reads this file. */
export const HUSHED_ON = { on: false };

const fr = (t: number): number => t - Math.floor(t);
const clamp01 = (v: number): number => Math.max(0, Math.min(1, v));

// =============================================================================================
// THEIR COLOURS: a city's working clothes, dulled by the dusk; their skin drained

/** Their skin, the colour gone out of it: greyed, not dead. */
const SKIN: Ramp = ['#3a302e', '#3a302e', '#7e6e66', '#aa968a', '#aa968a'];
const HAIR: Ramp = ['#1c1818', '#1c1818', '#3e3430', '#5a4c42', '#5a4c42'];
const GREY_HAIR: Ramp = ['#2c2a2c', '#2c2a2c', '#5e5a5c', '#827e7e', '#827e7e'];
const LINEN: Ramp = ['#3e3a34', '#3e3a34', '#8a8476', '#b4ac9a', '#b4ac9a'];
const SMOCK: Ramp = ['#1a2030', '#1a2030', '#3a4660', '#566484', '#566484'];
const CAP: Ramp = ['#1c1816', '#1c1816', '#3e3630', '#57493e', '#57493e'];
const BREECH: Ramp = ['#1c1a18', '#1c1a18', '#3a342c', '#514a3e', '#514a3e'];
const STOCKING: Ramp = ['#26242a', '#26242a', '#4e4a52', '#68646c', '#68646c'];
const SHOE: Ramp = ['#100e10', '#100e10', '#2a2426', '#3e3638', '#3e3638'];
const NECKER: Ramp = ['#2e1414', '#2e1414', '#5e2a28', '#7a3a34', '#7a3a34'];
const SKIRT: Ramp = ['#2a1418', '#2a1418', '#5a2e30', '#7a4440', '#7a4440'];
const SHAWL: Ramp = ['#1c281c', '#1c281c', '#3c503e', '#546a54', '#546a54'];
const KERCHIEF: Ramp = ['#382e1e', '#382e1e', '#7a6a44', '#9a8a5c', '#9a8a5c'];
const SHIRT: Ramp = ['#34322e', '#34322e', '#6e6a60', '#928c7e', '#928c7e'];
/** The baker's apron, floured: paler than linen. */
const APRON: Ramp = ['#4a4640', '#4a4640', '#9a9484', '#c2baa6', '#c2baa6'];
/** The Hush as it first leaves a mouth, palest. */
const BREATH_PALE = '#b6b0cc';
/** The Order's mark on what they wear: blots of its black ink. */
const INKBLOT = '#16131c';

// =============================================================================================
// THE BODY

/** A grown man or woman of the city, the knight's height (58). */
export const HUSHED_BODY: Build = buildOf(58, 1.22, { shoulders: 0.98, chest: 0.98, depth: 1.02, waist: 1.0, hips: 1.02, arms: 1.0, trunk: 1.0, limbs: 0.94 });
const HB = HUSHED_BODY;
export const HUSHED_CANVAS: MobCanvas = { w: 200, h: 200, ax: 100, ay: 150 };

/** Their rest: slack, as if half asleep on their feet; shoulders dropped, head hung a little and to one side, arms hanging; mouth open. */
export const HUSHED_REST: Bones = {
  ...standing(HB),
  pz: -0.8, pitch: 9, bend: 12, roll: 2, side: 1, faceUp: -8, faceTilt: -10, faceTurn: 3,
  lfx: 0.6, lfy: 1.6, lft: 10, lk: 7, rfx: -0.8, rfy: -1.6, rft: -12, rk: -7,
  lhIn: 1, lhx: 4.0, lhy: 3.0, lhz: -20, le: -8,
  rhIn: 1, rhx: 3.4, rhy: -3.2, rhz: -20.5, re: 8,
};

/** Who: a porter, a goodwife, a baker. */
export type HushedWho = 'porter' | 'goodwife' | 'baker';

// =============================================================================================
// THE HUSHED AS SOLIDS

/** How the figure's going drags what hangs off it. */
function lagOf(m: Moment, k: number, most: number): V3 {
  const raw = mul(m.come, -k);
  const l = len(raw);
  return l > most ? mul(raw, most / l) : raw;
}

/** A sleeve or a bare arm from shoulder to wrist, and the hand: its fingers curled, or spread and clawing (`open`). */
function arm(put: Put, s: Skeleton, side: 'L' | 'R', upper: Ramp, lower: Ramp, cuff: Ramp | null, open: number, cu: V3): void {
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
  // the hand: its back, and four fingers, curled slack or spread to claw
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

/** A leg in breeches to the knee, stockings below, a plain shoe. */
function leg(put: Put, s: Skeleton, side: 'L' | 'R', breech: Ramp): void {
  const hip = side === 'L' ? s.hipL : s.hipR;
  const knee = side === 'L' ? s.kneeL : s.kneeR;
  const ankle = side === 'L' ? s.ankleL : s.ankleR;
  const heel = side === 'L' ? s.heelL : s.heelR;
  const toe = side === 'L' ? s.toeL : s.toeR;
  const [rH, rK, rA] = HB.legR;
  put(`leg${side}`, `leg${side}`, { k: 'rod', a: hip, b: knee, ra: rH * 1.08, rb: rK * 1.08, ramp: breech, far: true });
  put(`leg${side}`, `leg${side}`, { k: 'ball', c: knee, ax: sphere(rK * 1.1), skin: breech, far: true });
  put(`shin${side}`, `shin${side}`, { k: 'rod', a: knee, b: ankle, ra: rK * 1.0, rb: rA * 1.05, ramp: STOCKING, far: true });
  shoe(put, s, side, heel, toe);
}
function shoe(put: Put, s: Skeleton, side: 'L' | 'R', heel: V3, toe: V3): void {
  const fwd = norm(sub(toe, heel), [1, 0, 0]);
  const side3 = norm(Math.abs(fwd[2]) < 0.95 ? [-fwd[1], fwd[0], 0] : cross(s.hips[2], fwd), [0, 1, 0]);
  const up3 = norm(cross(fwd, side3), [0, 0, 1]);
  put(`foot${side}`, `foot${side}`, { k: 'ball', c: add(lerp3(heel, toe, 0.5), mul(up3, 1.5)), ax: [mul(fwd, 4.6), mul(side3, 2.0), mul(up3, 1.6)], skin: SHOE, far: true });
}

/** The torso's garment: from the throat down to `down` (the waist, or below the hips), as rings. */
function torsoRings(s: Skeleton, down: 'waist' | 'hips', pad: number): Ring[] {
  const [cf, cl, cu] = s.chest;
  const be = s.belly;
  const waistC = add(s.pelvis, mul(s.hips[2], HB.waist * 0.6));
  const rings: Ring[] = [];
  if (down === 'hips') rings.push({ c: add(s.pelvis, mul(s.hips[2], -1.6)), u: mul(s.hips[0], HB.pelvisDeep + 1.8 + pad), v: mul(s.hips[1], HB.pelvisHalf + 2.0 + pad) });
  rings.push(
    { c: waistC, u: mul(be[0], HB.waistDeep + 1.4 + pad), v: mul(be[1], HB.waistHalf + 1.4 + pad) },
    { c: s.ribs, u: mul(cf, HB.ribDeep + 1.6 + pad), v: mul(cl, HB.ribHalf + 1.8 + pad) },
    { c: lerp3(s.ribs, s.neck, 0.72), u: mul(cf, HB.ribDeep + 1.0 + pad), v: mul(cl, HB.shoulderHalf + 0.4 + pad) },
    { c: add(s.neck, mul(cu, -0.8)), u: mul(cf, 3.2), v: mul(cl, 3.8) },
  );
  return rings;
}

/** A long skirt from the waist to the floor, round both legs, dragging behind as they go (the goodwife's). */
function skirt(put: Put, s: Skeleton, lag: V3, ph: number, ramp: Ramp): { hemC: V3; f: V3; l: V3; hemDeep: number; hemWide: number } {
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
  put('skirt', 'skirt', { k: 'cloth', rings, ramp, look: { folds: [25, -25, 70, -70, 120, -120, 165, -165], lift: 0.05 } });
  return { hemC, f, l, hemDeep, hemWide };
}

/**
 * THE HEAD: a drained face, its brows heavy, its eyes glazed with the cult's dull pink, its mouth hanging open and
 * working (`jaw`, 0 shut to 1 wide), and the hair or headgear of who it is. Returns the mouth, where the Hush comes out.
 */
function head(put: Put, st: Stage, s: Skeleton, who: HushedWho, jaw: number, lit: number, lag: V3): V3 {
  const [ff, fl, fu] = wornOn(st, s, 8);
  const hr: V3 = [HB.headR[0] * 1.02, HB.headR[1] * 1.08, HB.headR[2] * 1.0];
  const hc = add(s.head, mul(fu, -0.3));
  const hairOf = who === 'baker' ? GREY_HAIR : HAIR;
  const skin: Skin = (u, tone) => {
    const fwd = u[0];
    const side = Math.abs(u[1]);
    // the mouth: open, dark, slack
    const open = 0.08 + 0.2 * jaw;
    if (fwd > 0.7 && side < 0.24 && u[2] < -0.32 && u[2] > -0.32 - open * 1.5) return u[2] > -0.38 ? '#22161a' : INK;
    // hollow cheeks under the cheekbones
    if (fwd > 0.45 && fwd < 0.75 && side > 0.42 && side < 0.7 && u[2] < -0.1 && u[2] > -0.5) return SKIN[Math.max(0, tone - 1)];
    // the nose
    if (fwd > 0.88 && side < 0.14 && u[2] > -0.24 && u[2] < 0.1) return SKIN[Math.min(4, tone + 1)];
    // hair: the porter's cropped under his cap, the goodwife's under her kerchief, the baker's grey round his ears
    if (fwd < 0.1 && u[2] > -0.45 && (who !== 'baker' || u[2] < 0.25)) return hairOf[tone];
    if (who === 'porter' && fwd < 0.5 && u[2] > 0.2) return hairOf[tone];
    return SKIN[tone];
  };
  put('head', 'head', { k: 'ball', c: hc, ax: [mul(ff, hr[0]), mul(fl, hr[1]), mul(fu, hr[2])], skin });
  // brows, drawn and heavy
  for (const k of [-1, 1]) {
    const a = add(hc, add(mul(ff, hr[0] * 0.88), add(mul(fl, k * hr[1] * 0.12), mul(fu, hr[2] * 0.3))));
    const b = add(hc, add(mul(ff, hr[0] * 0.72), add(mul(fl, k * hr[1] * 0.6), mul(fu, hr[2] * 0.24))));
    put('head', 'brows', { k: 'rod', a, b, ra: 0.75, rb: 0.6, ramp: hairOf });
  }
  // the eyes: glazed, the cult's dull pink in them (going out as the Hush leaves them)
  for (const k of [-1, 1]) {
    const e = add(hc, add(mul(ff, hr[0] * 0.92), add(mul(fl, k * hr[1] * 0.34), mul(fu, hr[2] * 0.1))));
    put('head', 'eyes', { k: 'dot', p: e, c: lit > 0.4 ? FLAME[1] : '#3a2a30', facing: ff });
  }
  // WHO IT IS, by what is on the head
  if (who === 'porter') {
    // a flat cloth cap, its peak over the brow
    const top = add(hc, mul(fu, hr[2] * 0.62));
    put('hat', 'cap', { k: 'ball', c: add(top, mul(ff, -0.4)), ax: [mul(ff, hr[0] * 1.08), mul(fl, hr[1] * 1.06), mul(fu, hr[2] * 0.48)], skin: (u, tone) => (u[2] < -0.3 ? null : CAP[tone]) });
    put('hat', 'cap', { k: 'ball', c: add(add(top, mul(ff, hr[0] * 0.9)), mul(fu, -0.8)), ax: [mul(ff, 2.2), mul(fl, hr[1] * 0.8), mul(fu, 0.6)], skin: CAP });
  } else if (who === 'goodwife') {
    // a kerchief over her hair, knotted at her nape, its ends hanging
    const top = add(hc, mul(fu, hr[2] * 0.22));
    put('hat', 'kerchief', { k: 'ball', c: add(top, mul(ff, -1.0)), ax: [mul(ff, hr[0] * 1.06), mul(fl, hr[1] * 1.1), mul(fu, hr[2] * 0.9)], skin: (u, tone) => (u[0] > 0.3 && u[2] < 0.5 ? null : u[2] < -0.5 ? null : KERCHIEF[tone]) });
    const knot = add(hc, add(mul(ff, -hr[0] * 1.05), mul(fu, -hr[2] * 0.35)));
    put('hat', 'kerchief', { k: 'ball', c: knot, ax: sphere(1.4), skin: KERCHIEF });
    for (const k of [-1, 1]) put('hat', 'kerchief', { k: 'rod', a: knot, b: add(knot, add(add(mul(fu, -3.6), mul(fl, k * 1.2)), mul(lag, 0.5))), ra: 0.9, rb: 0.5, ramp: KERCHIEF });
  } else {
    // a linen coif, close on the crown
    const top = add(hc, mul(fu, hr[2] * 0.5));
    put('hat', 'coif', { k: 'ball', c: add(top, mul(ff, -0.6)), ax: [mul(ff, hr[0] * 1.02), mul(fl, hr[1] * 1.04), mul(fu, hr[2] * 0.62)], skin: (u, tone) => (u[2] < -0.35 ? null : LINEN[tone]) });
  }
  return add(hc, add(mul(ff, hr[0] * 1.02), mul(fu, -hr[2] * 0.4)));
}

/**
 * THE HUSH LEAKING OUT OF THEM: grey breath curling up out of the open mouth and thinning away (`puff`: how hard,
 * 1 as they breathe, more as they lunge; out to nothing as it has left them).
 */
function hushBreath(put: Put, mouth: V3, ff: V3, fl: V3, t: number, puff: number, seed: number): void {
  if (puff <= 0.02) return;
  // (a thread of it out of the mouth, curling up and over the head, swaying, widening and thinning as it goes:
  // more of it, and further, as it comes harder)
  const N = Math.round(14 + 10 * Math.min(2, puff));
  const reach = 16 + 10 * Math.min(2, puff);
  for (let i = 0; i < N; i++) {
    const life = fr(t * (0.7 + 0.25 * puff) + i / N + 0.13 * hash(i, seed, 2201));
    if (life > 0.4 + 0.6 * Math.min(1, puff)) continue;
    const curl = life * 4.2 + seed;
    const out = (1.4 + life * 5) * (0.75 + 0.25 * Math.min(2, puff));
    const p = add(mouth, add(mul(ff, out), add(mul(fl, Math.sin(curl) * (0.5 + life * 4.5)), [0, 0, life * reach + Math.cos(curl * 0.7) * life * 2])));
    const c = life < 0.25 ? BREATH_PALE : life < 0.5 ? HUSH[4] : life < 0.75 ? HUSH[3] : HUSH[2];
    put('hush', 'hush', { k: 'mote', p, c, size: life < 0.5 ? 3 : 2 });
    // (a wisp is wide where it is thick, its edge darker)
    if (life < 0.6) put('hush', 'hush', { k: 'mote', p: add(p, add(mul(fl, 1.4), [0, 0, 0.8])), c: life < 0.3 ? HUSH[4] : HUSH[3], size: 2 });
  }
}

/** The Hush leaking out of them at each moment, laid after their edge (Mob.grains): breath, not a solid of them. */
const BREATH = new WeakMap<Moment, [V3, string, number][]>();
/** THE HUSHED AS SOLIDS: who it is in their working clothes, their arms and clawing hands, their drained face and open mouth, the Hush leaking out of it. */
function hushedBits(who: HushedWho, st: Stage, m: Moment): Bit[] {
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
  const open = clamp01(q.pt);
  const jaw = clamp01(m.jaw ?? 0.4);
  const seed = who === 'porter' ? 1 : who === 'goodwife' ? 2 : 3;

  if (who === 'porter') {
    // A PORTER: breeches and stockings, a short smock of dull blue to his hips, belted with a cord; a red
    // neckerchief; his sleeves to the wrist; a cloth cap
    for (const side of ['L', 'R'] as const) leg(put, s, side, BREECH);
    put('body', 'smock', { k: 'cloth', rings: torsoRings(s, 'hips', 0.6), ramp: SMOCK, look: { folds: [0, 40, -40, 90, -90], lift: 0.05 } });
    const waistC = add(s.pelvis, mul(s.hips[2], HB.waist * 0.6));
    put('body', 'cord', { k: 'band', ring: { c: waistC, u: mul(s.belly[0], HB.waistDeep + 2.2), v: mul(s.belly[1], HB.waistHalf + 2.2) }, ramp: BREECH, rows: 2 });
    // the Order's ink blotted across his smock, where they marked him
    put('body', 'ink', { k: 'ball', c: add(add(s.ribs, mul(cf, HB.ribDeep + 1.9)), mul(cl, -1.5)), ax: [mul(cf, 0.5), mul(cl, 2.2), mul(cu, 1.6)], skin: () => INKBLOT });
    put('neck', 'neckerchief', { k: 'ball', c: add(add(s.neck, mul(cu, -1.2)), mul(cf, 2.2)), ax: [mul(cf, 2.2), mul(cl, 3.6), mul(cu, 1.8)], skin: NECKER });
    for (const side of ['L', 'R'] as const) arm(put, s, side, SMOCK, SMOCK, null, open, cu);
  } else if (who === 'goodwife') {
    // A GOODWIFE: a long madder skirt to the floor, a linen apron over it; a linen blouse, a green shawl round her
    // shoulders, crossed over her breast; her sleeves pushed to the elbow; a kerchief over her hair
    for (const side of ['L', 'R'] as const) shoe(put, s, side, side === 'L' ? s.heelL : s.heelR, side === 'L' ? s.toeL : s.toeR);
    const sk = skirt(put, s, lag, ph, SKIRT);
    put('body', 'blouse', { k: 'cloth', rings: torsoRings(s, 'waist', 0.4), ramp: LINEN, look: { folds: [0, 50, -50], lift: 0.04 } });
    // the apron: down the front of the skirt from her waist, nearly to the hem
    {
      const waistC = add(s.pelvis, mul(s.hips[2], HB.waist * 0.55));
      const front = add(waistC, mul(sk.f, HB.waistDeep + 2.3));
      const low = add(sk.hemC, add(mul(sk.f, sk.hemDeep + 0.3), [0, 0, 4.5]));
      const mid = lerp3(front, low, 0.5);
      const down = mul(sub(low, front), 0.5);
      put('skirt', 'apron', { k: 'panel', c: add(mid, mul(sk.f, 1.2)), u: mul(sk.l, HB.waistHalf + 0.8), v: mul(down, -1), skin: (_a, b, frontSide, tone) => (frontSide ? LINEN[Math.min(4, tone + (b > 0.85 ? -1 : 0))] : LINEN[Math.max(0, tone - 1)]) });
    }
    // the shawl: round her shoulders and down her back, its ends crossed over her breast
    {
      const top = add(s.neck, mul(cu, -0.6));
      const ring1: Ring = { c: top, u: mul(cf, 3.6), v: mul(cl, 4.4) };
      const ring2: Ring = { c: add(lerp3(s.ribs, s.neck, 0.7), mul(cf, -0.4)), u: mul(cf, HB.ribDeep + 2.4), v: mul(cl, HB.shoulderHalf + 2.2) };
      const ring3: Ring = { c: add(lerp3(s.ribs, s.neck, 0.3), mul(cf, -0.8)), u: mul(cf, HB.ribDeep + 2.6), v: mul(cl, HB.ribHalf + 3.0) };
      put('shawl', 'shawl', { k: 'cloth', rings: [ring1, ring2, ring3], ramp: SHAWL, look: { folds: [60, -60, 150, -150], lift: 0.06 }, torn: [2, 0, 3, 1, 0, 2, 3, 1, 2, 0, 1, 3, 0, 2, 1, 3] });
      for (const k of [-1, 1]) {
        const a = add(add(lerp3(s.ribs, s.neck, 0.8), mul(cl, k * HB.shoulderHalf * 0.7)), mul(cf, HB.ribDeep * 0.6));
        const b = add(add(lerp3(s.ribs, s.neck, 0.15), mul(cl, -k * HB.ribHalf * 0.5)), mul(cf, HB.ribDeep + 2.6));
        put('shawl', 'shawl', { k: 'rod', a, b, ra: 1.8, rb: 1.6, ramp: SHAWL });
      }
    }
    for (const side of ['L', 'R'] as const) arm(put, s, side, LINEN, SKIN, LINEN, open, cu);
  } else {
    // A BAKER: breeches and stockings, a grey shirt, his sleeves rolled to the elbow, a long floured apron from his
    // chest to his shins, tied about him; a linen coif
    for (const side of ['L', 'R'] as const) leg(put, s, side, BREECH);
    put('body', 'shirt', { k: 'cloth', rings: torsoRings(s, 'waist', 0.4), ramp: SHIRT, look: { folds: [0, 45, -45], lift: 0.04 } });
    {
      const f = norm([s.hips[0][0], s.hips[0][1], 0], [1, 0, 0]);
      const l: V3 = [-f[1], f[0], 0];
      const chest = add(lerp3(s.ribs, s.neck, 0.35), mul(cf, HB.ribDeep + 1.9));
      const waistC = add(s.pelvis, mul(s.hips[2], HB.waist * 0.6));
      const belly = add(waistC, mul(s.belly[0], HB.waistDeep + 2.0));
      const kneeMid = lerp3(s.kneeL, s.kneeR, 0.5);
      const shins = add(add(lerp3(kneeMid, lerp3(s.ankleL, s.ankleR, 0.5), 0.4), mul(f, HB.legR[1] + 2.0)), mul(lag, 0.6));
      // its bib over his chest, and its skirt from his waist to his shins, before his legs
      put('body', 'apron', { k: 'panel', c: add(lerp3(chest, belly, 0.5), mul(cf, 0.4)), u: mul(cl, HB.ribHalf * 0.72), v: mul(sub(chest, belly), 0.5), skin: (_a, b, frontSide, tone) => (frontSide ? APRON[Math.min(4, tone + (b > 0.8 ? -1 : 0))] : APRON[Math.max(0, tone - 1)]) });
      put('body', 'apron', { k: 'panel', c: add(lerp3(belly, shins, 0.5), mul(f, 0.8)), u: mul(l, HB.waistHalf + 2.2), v: mul(sub(belly, shins), 0.5), skin: (a, b, frontSide, tone) => (frontSide ? (hash(Math.round(a * 6), Math.round(b * 8), 2203) > 0.9 ? APRON[4] : APRON[tone]) : APRON[Math.max(0, tone - 1)]) });
      put('body', 'apron', { k: 'band', ring: { c: waistC, u: mul(s.belly[0], HB.waistDeep + 2.3), v: mul(s.belly[1], HB.waistHalf + 2.3) }, ramp: APRON, rows: 2 });
      // the Order's ink across the apron
      put('body', 'ink', { k: 'ball', c: add(lerp3(belly, shins, 0.35), mul(f, 1.6)), ax: [mul(f, 0.5), mul(l, 2.6), [0, 0, 1.4]], skin: () => INKBLOT });
    }
    for (const side of ['L', 'R'] as const) arm(put, s, side, SHIRT, SKIN, SHIRT, open, cu);
  }

  // the neck
  put('neck', 'neck', { k: 'rod', a: add(s.neck, mul(cu, -1.5)), b: lerp3(s.neck, s.head, 0.5), ra: 2.2, rb: 2.0, ramp: SKIN });
  const mouth = head(put, st, s, who, jaw, lit, lag);
  // THE HUSH LEAKING OUT OF THEM: always a little; harder as they lunge; a great breath of it as it leaves them
  const [ff, fl] = wornOn(st, s, 8);
  const puff = m.dying ? Math.max(0, 2.2 * (1 - clamp01((m.t - 0.15) / 1.1))) : 0.7 + 0.8 * clamp01(m.glint);
  hushBreath(put, mouth, ff, fl, m.t, puff, seed);
  // THE HUSH LEAVING THEM (their death): one great grey breath out of the open mouth, billowing up and out over
  // them as it goes, and thinning away
  if (m.dying && m.t > 0.12 && m.t < 1.7) {
    const k = (m.t - 0.12) / 1.58;
    for (let i = 0; i < 64; i++) {
      // (each puff of it loosed a little after the last, flying up and out, slowing, swelling, thinning)
      const born = 0.45 * hash(i, seed, 2207);
      const age = (k - born) / 0.55;
      if (age <= 0 || age >= 1) continue;
      const a = hash(i, seed + 3, 2207) * Math.PI * 2;
      const spread = (2 + 14 * Math.sqrt(age)) * (0.5 + 0.5 * hash(i, seed + 4, 2207));
      const up = 4 + 34 * Math.sqrt(age) * (0.6 + 0.4 * hash(i, seed + 5, 2207));
      const p = add(mouth, add(mul(ff, 2 + spread * 0.5 * Math.cos(a)), add(mul(fl, spread * Math.sin(a)), [0, 0, up])));
      const c = age < 0.25 ? BREATH_PALE : age < 0.5 ? HUSH[4] : age < 0.75 ? HUSH[3] : HUSH[2];
      if (age > 0.8 && hash(i, Math.floor(m.t * 30), 2209) < (age - 0.8) * 4) continue;
      put('hush', 'hush', { k: 'mote', p, c, size: age < 0.6 ? 3 : 2 });
    }
  }
  return bits;
}

// =============================================================================================
// THEIR STAND

/** Their stand: 2.8 s round. Swaying on their feet; breathing shallow; the head lolling and lifting; the mouth working on words that make no sound. */
export const HUSHED_STAND_LONG = 2.8;
function hushedStand(): Motion {
  const R = HUSHED_REST;
  const T = HUSHED_STAND_LONG;
  const keys: Key3[] = [];
  const N = 28;
  for (let i = 0; i <= N; i++) {
    const t = (i / N) * T;
    const a = (t / T) * Math.PI * 2;
    const breath = Math.sin(a * 2 - 0.5);
    keys.push({
      at: t,
      ease: 'lin',
      pose: {
        pz: R.pz + 0.6 * breath,
        py: 1.3 * Math.sin(a),
        roll: R.roll + 2.6 * Math.sin(a),
        bend: R.bend - 1.8 * breath,
        pitch: R.pitch + 1.4 * Math.sin(a + 1.2),
        faceUp: R.faceUp + 7 * Math.sin(a + 0.4),
        faceTilt: R.faceTilt + 7 * Math.sin(a + 2.0),
        faceTurn: R.faceTurn + 10 * Math.sin(a * 0.5 + 0.8),
        lhx: R.lhx + 1.2 * Math.sin(a + 0.4),
        rhx: R.rhx + 1.2 * Math.sin(a + 2.6),
        lhz: R.lhz + 0.6 * breath,
        rhz: R.rhz + 0.6 * breath,
      },
    });
  }
  return { loop: 0, keys };
}
/** Their mouth, working on words that make no sound: two or three tries a round, each a gape and a shutting. */
function standJaw(t: number): number {
  const u = fr(t / HUSHED_STAND_LONG);
  return 0.3 + 0.5 * Math.max(0, Math.sin(u * Math.PI * 6)) * (u < 0.7 ? 1 : 0.3);
}

/** THE HUSHED AS THE PAINTER TAKES THEM: who it is, painted at a moment; the Hush leaking out of them at that moment, laid after their edge. */
export function hushedPainter(who: HushedWho): { bits: (st: Stage, m: Moment) => Bit[]; grains: (st: Stage, m: Moment) => ReadonlyArray<readonly [V3, string, number]> } {
  return { bits: (st, m) => hushedBits(who, st, m), grains: (_st, m) => BREATH.get(m) ?? [] };
}
export { hushedStand, standJaw };
