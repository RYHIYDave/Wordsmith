// THREE NEW CLASSES, TEN LOOKS EACH: SKETCHES TO CHOOSE FROM (the art chat, 23 Oct 2026). NOT IN THE GAME.
//
// The owner, 23 Oct 2026, 15:27 Pacific: “I’d like mockup pictures of some new classes.  I want the brawler, the warlock, and
// the apothecary.  Brawler is going to be a str/dex hybrid.  No weapon.  Warlock is str/int, will transform into a demon so
// keep that in mind, apothecary is a dex/int.  Throws potions I guess.  Give me 10 looks for each.”
//
// SKETCHES, as the ten mages were (dev/options3.ts, whose parts these use): each painted for one pose, standing, facing the
// eye, of the same solids (art/skin.ts) on the same bones (art/skeleton.ts) as the heroes, so the one he picks is most of
// the way to a hero. Faces drawn plainly, as he chose for the mage and the ranger. What glows on them is cyan, the warlock's
// demon side too: pink and gold glows are the enemy's.
//   THE BRAWLER: fists up, bare-handed (hand wraps, no weapon); broad and quick.
//   THE WARLOCK: big for a caster; each look carries the demon he becomes (horns, a clawed hand, cracks of light, a tail).
//   THE APOTHECARY: lithe; a flask in the throwing hand, more on the belt and the bandolier.

import { BONE, CYAN, GLINT, INDIGO, INK, LEAF, MAIL, PINK, PLUM, ROBE, SKIN4, SPARK, STEEL, TEAL, dim } from '../art/kit';
import type { Painted, Ramp } from '../art/kit';
import { FRIEND_RIM } from '../art/hero3_knight';
import { HEAD_B } from '../art/moves3';
import { ball, band, cloth, girdle, hidden, mid, off, rod, skirtOf, stage, thread, trunkBalls } from '../art/skin';
import type { GameView, Ring, Sheet } from '../art/skin';
import { add, buildOf, lerp3, mul, norm, solve, standing, sub } from '../art/skeleton';
import type { Bones, Build, Posed, V3 } from '../art/skeleton';
import {
  BLONDE, BROWN3 as BROWN, EYES, NIGHT3 as NIGHT, WHITE, WINE, arms, belt, bodice, braid, brimHat, bun, cloak, collar, ctxOf, curtain, dotOn, drawnBack,
  fringe, hairBall, hairline, head, hood, legs, lit, locks, mantle, onFace, plainly, pony, rope, satchel, seam, skirt, streak, tresses,
} from './options3';
import type { C, HeadLook } from './options3';

const D = Math.PI / 180;
type R4 = readonly [string, string, string, string];

// ---------------------------------------------------------------------------------------------
// Colours the kit does not have (none of them glows)

/** Skin a shade deeper (the game's skin is the style's lavender; this is its darker cousin). */
const SKIN_DEEP: R4 = ['#3e2a5c', '#62467e', '#86669e', '#a888c0'];
/** Leather: straps, a jerkin, boots. */
const LEATHER: Ramp = ['#2e1a22', '#2e1a22', '#5a3434', '#8a5446', '#8a5446'];
/** A rust red: a sash, a demon's hide (dull, never a glow). */
const RUST: Ramp = ['#3e1222', '#3e1222', '#7a2432', '#b44a44', '#b44a44'];
/** Charcoal: a warlock's coat, iron. */
const COAL: Ramp = ['#141226', '#141226', '#2a2640', '#4a4462', '#4a4462'];
/** Linen, unbleached: wraps, an apron, a shirt. */
const LINEN: Ramp = ['#5c5480', '#5c5480', '#a69ec8', '#e0daf2', '#e0daf2'];
/** Moss green: a herbalist's coat. */
const MOSS: Ramp = ['#1a3020', '#1a3020', '#36583a', '#5e8a54', '#5e8a54'];
/** Brass: a buckle, goggles' rims, a monocle (dull metal, not a glow). */
const BRASS: Ramp = ['#4a3418', '#4a3418', '#8a6a2e', '#c8a456', '#c8a456'];
/** Grey hair, a grey beard. */
const GREY: Ramp = ['#3c3a5a', '#3c3a5a', '#7a78a0', '#b6b4d4', '#b6b4d4'];
/** Black hair. */
const RAVEN: Ramp = ['#0e0c20', '#0e0c20', '#22203e', '#3e3a62', '#3e3a62'];
/** Horn: a demon's horns, claws (dark at the root, pale at the tip: `horn`). */
const HORN: Ramp = ['#1a1424', '#1a1424', '#4a3a58', '#a898b8', '#ece6f6'];

// ---------------------------------------------------------------------------------------------
// BODIES AND STANCES

/** The brawler: as tall as the ranger, as broad in the shoulder as a strong man is, thick in the arm; light on his feet. */
export const BRAWLER_BODY: Build = buildOf(57, HEAD_B, { shoulders: 1.16, chest: 1.14, waist: 0.98, hips: 0.96, depth: 1.08, arms: 1.0, limbs: 1.08, pad: 1.0 });
/** A woman who fights so: her shoulders square, her arms strong. */
export const BRAWLER_F_BODY: Build = buildOf(55, HEAD_B, { shoulders: 1.02, chest: 0.98, waist: 0.86, hips: 1.04, depth: 1.0, limbs: 1.04, pad: 1.0 });
/** The warlock: big for one who reads, the knight's height, broad. */
export const WARLOCK_BODY: Build = buildOf(58, HEAD_B, { shoulders: 1.14, chest: 1.1, waist: 1.0, hips: 1.0, depth: 1.05, limbs: 1.08, pad: 1.1 });
export const WARLOCK_F_BODY: Build = buildOf(56, HEAD_B, { shoulders: 0.98, chest: 0.98, waist: 0.88, hips: 1.08, limbs: 0.96, skirt: [2.4, 2.2] });
/** The apothecary: lithe, as the ranger is. */
export const APOTHECARY_BODY: Build = buildOf(56, HEAD_B, { shoulders: 0.96, chest: 0.92, waist: 0.84, hips: 0.92, legs: 1.02, limbs: 0.86, pad: 0.9 });
export const APOTHECARY_F_BODY: Build = buildOf(54.5, HEAD_B, { shoulders: 0.9, chest: 0.94, waist: 0.84, hips: 1.08, limbs: 0.86, skirt: [2.4, 2.2] });

/** (the guard's hands: left forward, left, up, its elbow; the right the same) */
export const GUARD = [9, 1.5, 0, 40, 7, -1.5, -1, 40];
/** THE BRAWLER'S GUARD: feet apart, knees given, turned a little; both fists up before his chin, the left out in front. */
export function guardOf(B: Build): Bones {
  const t = B.tall / 57;
  return {
    ...standing(B),
    pz: -1.6 * t, yaw: -14, twist: 6, bend: 6, faceTurn: 4, faceUp: -2,
    lfx: 3.0 * t, lfy: 2.2 * t, lft: 18, lk: 16,
    rfx: -2.6 * t, rfy: -2.4 * t, rft: -24, rk: -14,
    lhIn: 0, lhx: GUARD[0] * t, lhy: GUARD[1] * t, lhz: GUARD[2] * t, le: GUARD[3],
    rhIn: 0, rhx: GUARD[4] * t, rhy: GUARD[5] * t, rhz: GUARD[6] * t, re: GUARD[7],
  };
}
/** THE WARLOCK STANDING: square, heavy; his left hand up and open before him (the cyan fire in it), his right down at his side. */
export function castOf(B: Build): Bones {
  const t = B.tall / 58;
  return {
    ...standing(B),
    pz: -0.4 * t, yaw: -8, faceUp: 2,
    lfx: 1.2 * t, lfy: 1.6 * t, lft: 12, lk: 8,
    rfx: -1.0 * t, rfy: -1.8 * t, rft: -16, rk: -10,
    lhIn: 0, lhx: 11.5 * t, lhy: 2.0 * t, lhz: -5.0 * t, le: 30,
    rhIn: 0, rhx: 2.4 * t, rhy: -3.2 * t, rhz: -(B.upperArm + B.foreArm) * 0.94, re: 8,
  };
}
/** THE APOTHECARY READY TO THROW: weight back, a flask up by his right shoulder; his left hand out before him, aiming. */
export function throwOf(B: Build): Bones {
  const t = B.tall / 56;
  return {
    ...standing(B),
    pz: -0.8 * t, yaw: -12, twist: -6, faceTurn: 6,
    lfx: 2.6 * t, lfy: 1.8 * t, lft: 14, lk: 12,
    rfx: -2.2 * t, rfy: -2.0 * t, rft: -20, rk: -12,
    lhIn: 0, lhx: 11.0 * t, lhy: 3.0 * t, lhz: -4.0 * t, le: 20,
    rhIn: 0, rhx: -1.0 * t, rhy: -3.5 * t, rhz: 5.0 * t, re: 70,
  };
}

// ---------------------------------------------------------------------------------------------
// PARTS of their own

/** A man's trunk in one cloth (or bare skin): ribs, waist, the line of the shoulders; `hips`: the pelvis too. No bust. */
function torso(c: C, ramp: Ramp, hips: Ramp | null = null, more = 0.6): Sheet {
  const { st, s, trunk } = c;
  const body = st.part(s.ribs);
  const balls = trunkBalls(trunk, more);
  ball(body, st, balls[0].c, balls[0].axes, ramp);
  ball(body, st, balls[1].c, balls[1].axes, ramp);
  if (hips) ball(body, st, balls[2].c, balls[2].axes, hips);
  rod(body, st, off(c.s.shoulderL, s.chest, 0, -0.8, 0.2), off(c.s.shoulderR, s.chest, 0, 0.8, 0.2), 2.3, 2.3, ramp);
  return body;
}
/** A bare chest's muscle: the line under each breast muscle and down the middle, a shade of the skin. */
function pecs(c: C, body: Sheet, skin: Ramp): void {
  if (c.fromBehind) return;
  const { st, s, B } = c;
  for (const side of [1, -1]) {
    const a = off(s.chest[2] ? s.neck : s.neck, s.chest, B.ribDeep + 0.6, side * 0.3, -6.2);
    const b = off(s.neck, s.chest, B.ribDeep + 0.2, side * B.ribHalf * 0.82, -5.6);
    lineOn(c, body, a, b, skin[1]);
  }
  lineOn(c, body, off(s.neck, s.chest, B.ribDeep + 0.7, 0, -6.4), off(s.waist, s.hips, B.waistDeep + 0.7, 0, 0.6), skin[1], 0.0, 0.85);
}
/** A line drawn flat on a sheet between two points of the figure (from and to: shares of the way). */
function lineOn(c: C, sheet: Sheet, a: V3, b: V3, color: string, from = 0, to = 1): void {
  const [x0, y0] = c.st.at(a);
  const [x1, y1] = c.st.at(b);
  const n = Math.max(1, Math.ceil(Math.hypot(x1 - x0, y1 - y0)));
  for (let i = Math.round(n * from); i <= n * to; i++) sheet.mark(x0 + ((x1 - x0) * i) / n - 0.5, y0 + ((y1 - y0) * i) / n - 0.5, color);
}
/** A strap across the chest from one shoulder to the other hip (`left`: from the left shoulder). `ramp` its leather; `bits`: things on it every so far. */
function strap(c: C, body: Sheet, ramp: Ramp, left = false, bits: ((at: V3, i: number) => void) | null = null, n = 4): void {
  const { s, B, trunk } = c;
  const side = left ? 1 : -1;
  const top = off(left ? s.shoulderL : s.shoulderR, s.chest, 0.4, -side * 2.4, 1.2);
  const mids = c.fromBehind ? off(trunk[0].c, s.chest, -B.ribDeep - 0.7, 0, 0) : off(trunk[0].c, s.chest, B.ribDeep + 0.7, 0, -0.5);
  const end = off(s.waist, s.hips, (c.fromBehind ? -1 : 1) * (B.waistDeep + 0.6), side * -B.waistHalf * 0.9, -0.4);
  for (const [a, b] of [[top, mids], [mids, end]] as [V3, V3][]) {
    lineOn(c, body, a, b, ramp[1]);
    const [x0, y0] = c.st.at(a);
    const [x1, y1] = c.st.at(b);
    const m = Math.max(1, Math.ceil(Math.hypot(x1 - x0, y1 - y0)));
    for (let i = 0; i <= m; i++) body.mark(x0 + ((x1 - x0) * i) / m + 0.5, y0 + ((y1 - y0) * i) / m - 0.5, ramp[3]);
  }
  if (bits && !c.fromBehind) for (let i = 0; i < n; i++) bits(lerp3(top, end, 0.18 + (0.64 * i) / Math.max(1, n - 1)), i);
}
/** Arms bare to the shoulder (or in sleeves to `sleeve`, 0..1 down the upper arm and on), forearms wrapped to `wrap` of the way from the wrist, fists. */
function fighterArms(c: C, o: { skin: Ramp; sleeve?: Ramp | null; to?: number; wrap?: Ramp | null; wrapUp?: number; fist?: Ramp; cuff?: Ramp | null; thick?: number }): void {
  const { st, s, B, mine } = c;
  const [aS, aE, aW] = B.armR;
  const k = (o.thick ?? 0.7) * 0.3;
  for (const side of ['L', 'R'] as const) {
    const sh = side === 'L' ? s.shoulderL : s.shoulderR;
    const el = side === 'L' ? s.elbowL : s.elbowR;
    const hand = side === 'L' ? s.handL : s.handR;
    const upper = st.part(mid(sh, el));
    rod(upper, st, sh, el, aS + k + 0.2, aE + k, mine(o.skin, el));
    if (o.sleeve) {
      const to = lerp3(sh, el, o.to ?? 0.45);
      rod(upper, st, add(sh, [0, 0, 0.2]), to, aS + k + 0.7, aS + k + 0.55, mine(o.sleeve, el));
      if ((o.to ?? 0.45) > 1) rod(upper, st, el, lerp3(el, hand, (o.to ?? 1) - 1), aE + k + 0.5, aE + k + 0.4, mine(o.sleeve, hand));
    }
    const fore = st.part(mid(el, hand, 0.6));
    rod(fore, st, el, hand, aE + k, aW + k * 0.8, mine(o.skin, hand));
    if (o.wrap) {
      const from = lerp3(hand, el, o.wrapUp ?? 0.55);
      rod(fore, st, from, hand, aE + k * 0.8 + 0.35, aW + k * 0.8 + 0.4, mine(o.wrap, hand), { links: true });
    }
    if (o.cuff) rod(fore, st, lerp3(hand, el, 0.3), lerp3(hand, el, 0.05), aW + k + 0.7, aW + k + 0.7, mine(o.cuff, hand));
    // (the fist: a knot of knuckles, bigger than a hand that hangs)
    const fist = st.part(st.near(hand) + 0.25);
    const r = aW + 0.85 + k * 0.4;
    ball(fist, st, hand, [[r, 0, 0], [0, r, 0], [0, 0, r * 0.95]], mine(o.fist ?? o.wrap ?? o.skin, hand));
  }
}
/** Trousers (or breeches to `to` of the shin, 0 the knee), bare shins or boots. */
function trousers(c: C, cloth_: Ramp, boot: Ramp | null, o: { to?: number; wide?: number; shin?: Ramp; wrap?: Ramp | null } = {}): void {
  const { st, s, B, mine } = c;
  const [lH, lK, lA] = B.legR;
  const w = o.wide ?? 0.5;
  for (const side of ['L', 'R'] as const) {
    const hip = side === 'L' ? s.hipL : s.hipR;
    const knee = side === 'L' ? s.kneeL : s.kneeR;
    const ankle = side === 'L' ? s.ankleL : s.ankleR;
    const heel = side === 'L' ? s.heelL : s.heelR;
    const toe = side === 'L' ? s.toeL : s.toeR;
    const thigh = st.part(mid(hip, knee));
    rod(thigh, st, hip, knee, lH + w, lK + w, mine(cloth_, knee), { shade: 0.12 });
    const shin = st.part(mid(knee, ankle));
    const end = lerp3(knee, ankle, o.to ?? 1);
    rod(shin, st, knee, end, lK + w, lK + w * 0.8 + (o.to ?? 1) * 0.4, mine(cloth_, ankle));
    if ((o.to ?? 1) < 1) rod(shin, st, end, ankle, lK + 0.1, lA + 0.3, mine(o.shin ?? lit(SKIN4), ankle));
    if (o.wrap) rod(shin, st, lerp3(knee, ankle, 0.55), ankle, lK + 0.35, lA + 0.6, mine(o.wrap, ankle), { links: true });
    const foot = boot ?? o.shin ?? lit(SKIN4);
    rod(shin, st, add(heel, [0, 0, 1.6]), add(toe, [0, 0, 1.2]), 1.8, 1.4, mine(foot, ankle), { shade: 0.15 });
    if (boot) rod(shin, st, lerp3(knee, ankle, 0.5), ankle, lK + w + 0.3, lA + 0.7, mine(boot, ankle));
  }
}
/** A sash knotted at the waist, its ends hanging at his left hip. */
function sash(c: C, ramp: Ramp, len = 8): void {
  const { st, s, B, trunk } = c;
  band(st.part(s.waist), st, girdle(trunk[1], -0.1, 1.1), ramp, 3);
  if (c.fromBehind) return;
  const a = off(s.waist, s.hips, B.waistDeep + 1.2, B.waistHalf * 0.6, -0.6);
  const p = st.part(st.near(a) + 0.5);
  rod(p, st, a, add(a, [0.4, 0.6, -len]), 1.3, 1.0, ramp);
  rod(p, st, a, add(a, [0.8, 1.8, -len * 0.75]), 1.2, 0.9, ramp);
}
/** A beard: under the jaw and round the chin, down `len` (picture lengths). */
function beard(c: C, ramp: Ramp, len = 2.5, wide = 1.0): void {
  const { st, s, hf, hl, hu, R } = c;
  const at = add(s.head, add(mul(hf, R[0] * 0.55), mul(hu, -R[2] * 0.62)));
  const tip = add(at, add(mul(hu, -len), mul(hf, 0.6)));
  const p = st.part(st.near(s.head) + 0.45);
  ball(p, st, lerp3(at, tip, 0.35), [mul(hf, R[0] * 0.55), mul(hl, R[1] * 0.78 * wide), mul(hu, len * 0.7 + 1.2)], hairBall(ramp));
}
/** A moustache: a pixel or two either side under the nose. */
function moustache(c: C, sheet: Sheet, color: string): void {
  const up = -0.24;
  dotOn(c, sheet, EYES[0] + 6, up, color);
  dotOn(c, sheet, EYES[1] - 6, up, color);
  dotOn(c, sheet, (EYES[0] + EYES[1]) / 2, up + 0.04, color);
  dotOn(c, sheet, (EYES[0] + EYES[1]) / 2, up + 0.04, color, -1, 0);
}
/** Horns: dark at the root, pale at the tip. */
const IVORY: Ramp = ['#2a2236', '#2a2236', '#8a7c96', '#d6cce2', '#f4f0fa'];
type HornKind = 'swept' | 'ram' | 'up' | 'wide' | 'small';
/** A pair of horns from the temples: swept back, curled round as a ram's, straight up, out wide as a bull's, or small nubs. `long` their length, `thick` at the root. */
function horns(c: C, kind: HornKind, o: { long?: number; thick?: number; ramp?: Ramp; up?: number } = {}): void {
  const { st, s, hf, hl, hu, R } = c;
  const L = o.long ?? 7;
  const t = o.thick ?? 1.6;
  const ramp = o.ramp ?? IVORY;
  for (const side of [1, -1]) {
    const v = (f: number, l: number, u: number): V3 => add(add(mul(hf, f * L), mul(hl, side * l * L)), mul(hu, u * L));
    const small = kind === 'small';
    const root = add(s.head, add(add(mul(hf, R[0] * (small ? 0.55 : 0.2)), mul(hl, side * R[1] * (small ? 0.45 : 0.66))), mul(hu, R[2] * (o.up ?? (small ? 0.5 : 0.58)))));
    let steps: V3[];
    if (kind === 'swept') steps = [v(-0.1, 0.45, 0.2), v(-0.4, 0.3, 0.12), v(-0.45, 0.05, -0.05)];
    else if (kind === 'ram') steps = [v(-0.25, 0.35, 0.25), v(-0.3, 0.3, -0.2), v(0.25, 0.15, -0.3), v(0.25, -0.05, 0.05)];
    else if (kind === 'up') steps = [v(0.05, 0.4, 0.2), v(0.05, 0.12, 0.35), v(0.02, -0.12, 0.22)];
    else if (kind === 'wide') steps = [v(0.05, 0.5, 0.1), v(0.05, 0.25, 0.35), v(0.1, -0.05, 0.3)];
    else steps = [v(0.1, 0.3, 0.25), v(-0.05, 0.12, 0.28)];
    const pts = [root];
    for (const d of steps) pts.push(add(pts[pts.length - 1], d));
    const p = st.part(st.near(root) + 0.4);
    const n = pts.length - 1;
    for (let i = 0; i < n; i++) {
      const r0 = t * (1 - (i / n) * 0.75);
      const r1 = i === n - 1 ? 0.25 : t * (1 - ((i + 1) / n) * 0.75);
      rod(p, st, pts[i], pts[i + 1], r0, r1, i === 0 ? [ramp[1], ramp[1], ramp[2], ramp[3], ramp[3]] : ramp);
    }
  }
}
/** A flask: a round bottle, its neck, a cork; what is in it lit (`liquid`: its ramp). `r`: the bottle's half width. */
function flask(c: C, at0: V3, liquid: Ramp = SPARK, r0 = 2.0, tip: V3 = [0, 0, 1]): void {
  const { st } = c;
  const r = r0 * 1.3;
  const at = add(at0, [0, 0, r * 0.8]);
  const p = st.part(st.near(at) + 0.7);
  ball(p, st, at, [[r, 0, 0], [0, r, 0], [0, 0, r]], (u, tone) => (u[2] > 0.25 ? (tone >= 3 ? '#ffffff' : LINEN[2]) : tone >= 3 ? liquid[3] : liquid[tone >= 2 ? 2 : 1]));
  const neck = add(at, mul(norm(tip), r + 1.2));
  rod(p, st, add(at, mul(norm(tip), r * 0.6)), neck, 0.8, 0.7, LINEN);
  ball(p, st, add(neck, mul(norm(tip), 0.6)), [[0.9, 0, 0], [0, 0.9, 0], [0, 0, 0.8]], LEATHER);
}
/** A bottle hung on a belt or a strap, smaller. */
function vial(c: C, at: V3, liquid: Ramp): void {
  const { st } = c;
  const p = st.part(st.near(at) + 0.6);
  rod(p, st, add(at, [0, 0, -1.4]), add(at, [0, 0, 1.0]), 1.0, 0.9, [liquid[1], liquid[1], liquid[2], liquid[3], liquid[3]]);
  rod(p, st, add(at, [0, 0, 1.0]), add(at, [0, 0, 1.9]), 0.55, 0.5, LEATHER);
}
/** Cyan fire in a hand: tongues of it rising off the palm (over everything: it glows). */
function handFire(c: C, hand: V3, big = 1): void {
  const { st } = c;
  const [x, y] = st.at(hand);
  const tongues = [[-2, 7], [0, 10], [2, 8], [-1, 5], [1, 6], [3, 5], [-3, 4]] as const;
  for (const [dx, h] of tongues) {
    const hh = Math.round(h * big);
    for (let j = 0; j < hh; j++) {
      const k = j / hh;
      const wob = Math.round(Math.sin(j * 0.9 + dx) * 0.8 * k);
      const col = k < 0.35 ? '#ffffff' : k < 0.7 ? SPARK[3] : SPARK[2];
      st.over.set(Math.round(x) + dx + wob, Math.round(y) - 2 - j, col);
      if (k < 0.5) st.over.set(Math.round(x) + dx + wob + 1, Math.round(y) - 2 - j, k < 0.25 ? '#ffffff' : SPARK[3]);
    }
  }
  for (let i = -3; i <= 3; i++) st.under.set(Math.round(x) + i, Math.round(y) - 1, SPARK[2]);
}
/** Claws on a hand: dark talons out past the fingers. */
function claws(c: C, hand: V3, elbow: V3): void {
  const { st } = c;
  const dir = norm(sub(hand, elbow));
  const p = st.part(st.near(hand) + 0.6);
  for (const k of [-1.4, 0, 1.4]) {
    const a = add(hand, add(mul(dir, 1.2), [k * 0.6, k * 0.4, 0]));
    const b = add(a, add(mul(dir, 3.2), [0, 0, -1.6]));
    rod(p, st, a, b, 0.6, 0.2, HORN);
  }
}
/** Cracks of light over a part of the skin: a few jagged lines of cyan (the demon showing through). */
function cracks(c: C, sheet: Sheet, from: V3, to: V3, n = 3, seed = 1): void {
  if (c.fromBehind) return;
  const [x0, y0] = c.st.at(from);
  const [x1, y1] = c.st.at(to);
  for (let k = 0; k < n; k++) {
    let x = x0 + ((x1 - x0) * k) / Math.max(1, n - 1) + (((seed * 7 + k * 3) % 5) - 2);
    let y = y0 + ((y1 - y0) * k) / Math.max(1, n - 1);
    for (let j = 0; j < 6; j++) {
      c.st.over.set(Math.round(x), Math.round(y), j % 3 === 0 ? '#ffffff' : SPARK[2]);
      x += ((seed + j + k) % 3) - 1;
      y += 1;
    }
  }
}
/** A tail from the small of the back, down and out to the side, a barbed tip. */
function tail(c: C, ramp: Ramp, side = 1): void {
  const { st, s, B } = c;
  const root = off(s.pelvis, s.hips, -B.pelvisDeep - 0.5, 0, 1);
  const a = add(root, add(mul(s.hips[0], -4), add(mul(s.hips[1], side * 3), [0, 0, -6])));
  const b = add(a, add(mul(s.hips[1], side * 7), [0, 0, -5]));
  const e = add(b, add(mul(s.hips[1], side * 4), [0, 0, 2.5]));
  const p = st.part(st.near(a) - 0.2);
  rod(p, st, root, a, 1.6, 1.3, ramp);
  rod(p, st, a, b, 1.3, 1.0, ramp);
  rod(p, st, b, e, 1.0, 0.6, ramp);
  const tip = st.part(st.near(e) + 0.2);
  rod(tip, st, e, add(e, add(mul(s.hips[1], side * 2.2), [0, 0, 1.4])), 1.5, 0.2, HORN);
}
/** A hat with a tall flat crown and a narrow brim (an apothecary's top hat). */
function topHat(c: C, ramp: Ramp, tall = 7, band_: Ramp = CYAN): void {
  const { st, s, hu, hf, hl, R } = c;
  const hat = st.part(st.near(s.head) + 0.8);
  const C0 = add(s.head, mul(hu, R[2] * 0.78));
  ball(hat, st, C0, [mul(hf, R[0] * 1.7), mul(hl, R[1] * 1.8), mul(hu, 0.8)], ramp);
  const rings: Ring[] = [
    { c: add(C0, mul(hu, tall)), u: mul(hf, R[0] * 1.08), v: mul(hl, R[1] * 1.1) },
    { c: add(C0, mul(hu, 0.6)), u: mul(hf, R[0] * 1.02), v: mul(hl, R[1] * 1.04) },
  ];
  cloth(hat, st, rings, ramp, { lift: 0.4 });
  ball(hat, st, add(C0, mul(hu, tall)), [mul(hf, R[0] * 1.08), mul(hl, R[1] * 1.1), mul(hu, 0.4)], ramp);
  band(hat, st, { c: add(C0, mul(hu, 1.6)), u: mul(hf, R[0] * 1.05), v: mul(hl, R[1] * 1.07) }, band_, 2, 0.5);
}
/** A beaked mask over the face (the plague doctors' kind), two round lenses; worn under a hat or a hood. */
function beak(c: C, ramp: Ramp, lens: Ramp = BRASS, long = 6): Sheet {
  const { st, s, hf, hu, R } = c;
  const hd = head(c, { blind: true, paint: (f, l, up, tone) => (f > -0.3 ? ramp[tone] : undefined), neck: ramp, hairAt: () => true, hair: ramp });
  const root = add(s.head, add(mul(hf, R[0] * 0.75), mul(hu, -R[2] * 0.2)));
  const tip = add(s.head, add(mul(hf, R[0] * 0.75 + long), mul(hu, -R[2] * 0.2 - long * 0.55)));
  const p = st.part(st.near(tip) + 0.5);
  rod(p, st, root, tip, 2.4, 0.5, ramp);
  for (const turn of EYES) {
    dotOn(c, hd, turn, 0.2, lens[3]);
    dotOn(c, hd, turn, 0.2, lens[2], 1, 0);
    dotOn(c, hd, turn, 0.2, lens[2], 0, 1);
    dotOn(c, hd, turn, 0.2, GLINT, 1, 1);
  }
  return hd;
}
/** Goggles: a band round the head and two round lenses (`up`: pushed up on the brow). */
function goggles(c: C, hd: Sheet, up = false): void {
  const { st, s, hf, hl, hu, R } = c;
  const h = up ? 0.5 : 0.14;
  band(hd, st, { c: add(s.head, mul(hu, R[2] * h)), u: mul(hf, R[0] * 1.02), v: mul(hl, R[1] * 1.02) }, LEATHER, 2, 0.3);
  for (const turn of EYES) {
    for (const [dx, dy, col] of [[0, 0, BRASS[3]], [1, 0, BRASS[2]], [0, -1, BRASS[2]], [1, -1, BRASS[3]], [-1, 0, BRASS[1]], [0, 1, BRASS[1]], [1, 1, CYAN[2]], [-1, -1, BRASS[1]]] as const) dotOn(c, hd, turn, h + 0.02, col, dx, dy);
  }
  void onFace;
}
/** An apron from the chest to the knee, a strap round the neck (over whatever is worn): a panel down his front. */
function apron(c: C, ramp: Ramp, drop = 0.75, sheet: Sheet | null = null): void {
  const { st, s, B, trunk } = c;
  if (c.fromBehind) return;
  const lap = off(s.pelvis, s.hips, B.pelvisDeep + 0.9, 0, -B.thigh * drop * 0.42);
  ball(st.part(st.near(lap) + 0.3), st, lap, [mul(s.hips[0], 1.2), mul(s.hips[1], B.pelvisHalf + 0.8), mul(s.hips[2], B.thigh * drop * 0.62 + 1.5)], ramp);
  const bib = sheet ?? st.part(st.near(s.ribs) + 0.4);
  ball(bib, st, off(trunk[0].c, s.chest, B.ribDeep * 0.55, 0, -0.4), [mul(s.chest[0], 2.4), mul(s.chest[1], B.ribHalf * 0.6), mul(s.chest[2], 4.2)], ramp);
  void girdle;
}
/** A belt hung with bottles (`n` of them, `colours` turn about). */
function bottleBelt(c: C, leather: Ramp, colours: Ramp[], n = 4, buckle: Ramp | null = BRASS): void {
  const { s, B, trunk } = c;
  belt(c, leather, buckle, 2);
  if (c.fromBehind) return;
  for (let i = 0; i < n; i++) {
    const a = ((i + 0.5) / n - 0.5) * 150 * D + 15 * D;
    const g = girdle(trunk[1], -0.25, 1.4);
    const at = add(add(g.c, add(mul(g.u, Math.cos(a)), mul(g.v, Math.sin(a)))), [0, 0, -2.2]);
    void s;
    void B;
    vial(c, at, colours[i % colours.length]);
  }
}
/** A heavy pauldron on a shoulder (`side` 1 left, -1 right), with a spike if wanted. */
function pauldron(c: C, ramp: Ramp, side: number, spike = false): void {
  const { st, s, B, mine } = c;
  const sh = side > 0 ? s.shoulderL : s.shoulderR;
  const aS = B.armR[0];
  const p = st.part(st.near(sh) + 0.6);
  const at = off(sh, s.chest, 0, side * 0.6, 1.3);
  ball(p, st, at, [mul(s.chest[0], aS + 2.0), mul(s.chest[1], aS + 2.1), mul(s.chest[2], aS + 0.9)], mine(ramp, sh));
  if (spike) {
    const top = off(at, s.chest, 0, side * 0.8, aS + 0.5);
    rod(p, st, top, off(top, s.chest, 0, side * 2.4, 4.2), 1.4, 0.2, HORN);
  }
}
/** Chains: a line of links between two points (dark iron, a lit pixel every other). */
function chain(c: C, sheet: Sheet, a: V3, b: V3): void {
  const [x0, y0] = c.st.at(a);
  const [x1, y1] = c.st.at(b);
  const n = Math.max(1, Math.ceil(Math.hypot(x1 - x0, y1 - y0)));
  for (let i = 0; i <= n; i++) sheet.mark(x0 + ((x1 - x0) * i) / n - 0.5, y0 + ((y1 - y0) * i) / n - 0.5, i % 2 ? STEEL[2] : COAL[1]);
}
/** A book at the hip on a chain from the belt (the warlock's pact). */
function grimoire(c: C, cover: Ramp = RUST): void {
  const { st, s, B } = c;
  const at = off(s.hipR, s.hips, 1.8, -B.pelvisHalf * 0.55 - 4.4, -4.6);
  const p = st.part(st.near(at) + 1.4);
  ball(p, st, at, [mul(s.hips[0], 3.4), mul(s.hips[1], 1.6), [0, 0, 4.0]], cover);
  const [bx, by] = st.at(at);
  for (let j = -3; j <= 3; j++) p.mark(Math.round(bx) - 3, Math.round(by) + j, LINEN[3]);
  p.mark(Math.round(bx), Math.round(by) - 1, CYAN[3]);
  p.mark(Math.round(bx), Math.round(by), CYAN[2]);
  p.mark(Math.round(bx) + 1, Math.round(by), CYAN[2]);
  chain(c, p, off(s.waist, s.hips, B.waistDeep + 0.6, -B.waistHalf * 0.7, -0.8), add(at, [0, 0, 3.6]));
}
/** A ragged half-cape that hangs from the shoulders like folded wings (two points either side). */
function wingCape(c: C, ramp: Ramp, drop: number): void {
  const { st, s, B } = c;
  const f = norm([s.chest[0][0], s.chest[0][1], 0], [1, 0, 0]);
  const l = norm([s.chest[1][0], s.chest[1][1], 0], [0, 1, 0]);
  const full = B.shoulderHalf + B.armR[0] + 1.6;
  const top: Ring = { c: add(s.neck, add(mul(s.chest[2], 1.6), mul(f, -0.6))), u: mul(f, B.ribDeep + 1.6), v: mul(l, full + 1.2) };
  const middle: Ring = { c: add(mid(s.neck, s.ribs), mul(f, -1.4)), u: mul(f, B.ribDeep + 3.0), v: mul(l, full + 3.2) };
  const hem: Ring = { c: add(add(s.ribs, [0, 0, -drop]), mul(f, -2.4)), u: mul(f, B.ribDeep + 4.0), v: mul(l, full + 2.2) };
  cloth(st.part(mid(s.ribs, s.neck)), st, [top, middle, hem], ramp, { arc: [96, 264], lining: 0.4, ragged: true, folds: [180, 150, -150, 120, -120] });
  // (the two "wing" spars: a bone rib up past each shoulder)
  for (const side of [1, -1]) {
    const a = off(side > 0 ? s.shoulderL : s.shoulderR, s.chest, -2.4, side * 1.0, 1.2);
    const b = off(a, s.chest, -1.2, side * 4.2, 5.2);
    rod(st.part(st.near(a) - 0.5), st, a, b, 1.1, 0.35, HORN);
  }
}

// ---------------------------------------------------------------------------------------------
// THE LOOKS

export interface ClassLook {
  /** Its label on the sheet, if not its place in the list. */
  n?: string;
  name: string;
  /** Which body (a man's or a woman's of the class) */
  f?: boolean;
  paint: (c: C) => void;
}

/** A face as he chose them drawn: two dark pixels for each eye, a mouth of one; `o` as dev/options3.ts head(). */
const face = (c: C, o: HeadLook): Sheet => head(c, { mouth: INK, ...o });
const SK = lit(SKIN4);
const DEEP = lit(SKIN_DEEP);
/** The left fist and the right (for what is in or on them). */
const handsOf = (c: C): [V3, V3] => [c.s.handL, c.s.handR];

export const BRAWLERS: ClassLook[] = [
  {
    name: 'Pit fighter: bare chest, wraps',
    paint: (c) => {
      trousers(c, INDIGO, null, { to: 0.55, shin: DEEP, wrap: LINEN });
      const body = torso(c, DEEP, INDIGO);
      pecs(c, body, DEEP);
      sash(c, CYAN, 7);
      fighterArms(c, { skin: DEEP, wrap: LINEN, wrapUp: 0.6 });
      face(c, { skin: SKIN_DEEP, hairAt: (f, l, up) => f < -0.1 || up > 0.55, hair: RAVEN });
      // (a topknot)
      bun(c, RAVEN, 2.2);
    },
  },
  {
    name: 'Street boxer: vest and flat cap',
    paint: (c) => {
      trousers(c, MAIL, LEATHER, { wide: 0.7 });
      const body = torso(c, LINEN, MAIL);
      // (the vest over the shirt: open down the front)
      const v = c.st.part(c.st.near(c.s.ribs) + 0.3);
      const balls = trunkBalls(c.trunk, 1.0);
      ball(v, c.st, balls[0].c, balls[0].axes, (u, t) => (Math.abs(u[1]) < 0.22 && u[0] > 0 ? null : PLUM[t]));
      ball(v, c.st, balls[1].c, balls[1].axes, (u, t) => (Math.abs(u[1]) < 0.22 && u[0] > 0 ? null : PLUM[t]));
      void body;
      belt(c, LEATHER, BRASS, 2);
      fighterArms(c, { skin: SK, sleeve: LINEN, to: 0.7, wrap: LINEN, wrapUp: 0.3, fist: LINEN });
      const hd = face(c, { hairAt: (f, l, up) => f < -0.2, hair: BROWN });
      moustache(c, hd, BROWN[1]);
      // (the flat cap: a low crown and a short peak over the brow)
      const { st, s, hf, hl, hu, R } = c;
      const capP = st.part(st.near(s.head) + 0.7);
      ball(capP, st, add(s.head, add(mul(hu, R[2] * 0.62), mul(hf, R[0] * 0.08))), [mul(hf, R[0] * 1.18), mul(hl, R[1] * 1.14), mul(hu, R[2] * 0.52)], MAIL);
      ball(capP, st, add(s.head, add(mul(hu, R[2] * 0.42), mul(hf, R[0] * 1.0))), [mul(hf, 2.4), mul(hl, R[1] * 0.9), mul(hu, 0.6)], dim(MAIL));
    },
  },
  {
    name: 'Wrestler: strap singlet, big beard',
    paint: (c) => {
      trousers(c, RUST, LEATHER, { to: 0.15, shin: DEEP });
      const body = torso(c, DEEP, RUST);
      pecs(c, body, DEEP);
      // (the singlet's strap over his left shoulder, and its body from the chest down)
      const sg = c.st.part(c.st.near(c.s.ribs) + 0.2);
      const balls = trunkBalls(c.trunk, 0.75);
      ball(sg, c.st, balls[1].c, balls[1].axes, RUST);
      ball(sg, c.st, balls[0].c, balls[0].axes, (u, t) => (u[2] < -0.1 || u[1] > 0.45 ? RUST[t] : null));
      belt(c, LEATHER, CYAN, 3);
      fighterArms(c, { skin: DEEP, cuff: LEATHER, thick: 1.0 });
      face(c, { skin: SKIN_DEEP, hairAt: () => false, hair: BROWN });
      beard(c, BROWN, 4.5, 1.15);
    },
  },
  {
    name: 'Monk: sleeveless robe, beads',
    paint: (c) => {
      const { B } = c;
      trousers(c, TEAL, null, { shin: SK, wrap: LINEN });
      skirt(c, TEAL, { drop: B.thigh * 0.55, wide: 2.4, deep: 2.2, hem: CYAN, folds: [0, 180, 90, -90], arc: [40, 320] });
      const body = torso(c, TEAL, TEAL);
      seam(c, body, CYAN[2]);
      sash(c, PLUM, 9);
      fighterArms(c, { skin: SK, wrap: TEAL, wrapUp: 0.3 });
      face(c, { hairAt: () => false });
      // (prayer beads round his neck, big ones, down his chest)
      const { st, s } = c;
      const r: Ring = { c: off(s.neck, s.chest, 0.6, 0, -3.0), u: mul(s.chest[0], c.B.ribDeep + 1.3), v: mul(s.chest[1], 3.6) };
      for (let i = 0; i < 14; i++) {
        const a = (i / 14) * Math.PI * 2;
        const at = add(r.c, add(add(mul(r.u, Math.cos(a)), mul(r.v, Math.sin(a))), mul(s.chest[2], -Math.max(0, Math.cos(a)) * 3)));
        ball(st.part(st.near(at) + 0.3), st, at, [[0.9, 0, 0], [0, 0.9, 0], [0, 0, 0.9]], i === 0 ? CYAN : BROWN);
      }
    },
  },
  {
    name: 'Scrapper: tank top, ponytail',
    f: true,
    paint: (c) => {
      trousers(c, MAIL, LEATHER, { wide: 0.6, wrap: null });
      const body = bodice(c, TEAL, 0.6, MAIL);
      void body;
      belt(c, LEATHER, CYAN, 2);
      fighterArms(c, { skin: SK, wrap: RUST, wrapUp: 0.45, thick: 0.45 });
      face(c, { hairAt: drawnBack, hair: WINE, blush: true, mouth: PINK[1] });
      pony(c, WINE, 12);
    },
  },
  {
    name: 'Sailor: striped shirt, bandana',
    paint: (c) => {
      trousers(c, NIGHT, null, { to: 0.6, shin: DEEP, wide: 0.9 });
      const body = torso(c, LINEN, NIGHT);
      // (the stripes, round him)
      const st_ = c.st.part(c.st.near(c.s.ribs) + 0.05);
      const balls = trunkBalls(c.trunk, 0.62);
      for (const o of balls.slice(0, 2)) ball(st_, c.st, o.c, o.axes, (u, t) => (Math.floor((u[2] + 1) * 5) % 2 === 0 ? INDIGO[Math.max(1, t)] : null));
      void body;
      sash(c, RUST, 6);
      fighterArms(c, { skin: DEEP, sleeve: LINEN, to: 0.55, wrap: null, thick: 0.9 });
      const hd = face(c, { skin: SKIN_DEEP, hairAt: (f, l, up) => up > 0.38 || f < -0.15, hair: RUST, paint: (f, l, up, t) => (up > 0.38 || f < -0.15 ? RUST[t] : undefined) });
      void hd;
      // (the knot of the bandana at the back and its ends)
      const { st, s, hf, hu, R } = c;
      const k = add(s.head, add(mul(hf, -R[0] * 0.95), mul(hu, R[2] * 0.3)));
      rod(st.part(st.near(k) - 0.1), st, k, add(k, add(mul(hf, -2.6), [0, 0, -3.6])), 1.0, 0.6, RUST);
      beard(c, BROWN, 1.6, 0.9);
    },
  },
  {
    name: 'Iron knuckles: bracers and a crest',
    paint: (c) => {
      trousers(c, LEATHER, COAL, { wide: 0.6 });
      const body = torso(c, SK, LEATHER);
      pecs(c, body, SK);
      strap(c, body, LEATHER, false);
      belt(c, COAL, CYAN, 3);
      fighterArms(c, { skin: SK, wrap: STEEL, wrapUp: 0.7, fist: STEEL, thick: 0.85 });
      pauldron(c, LEATHER, 1);
      // (a crest of hair, the sides shaved)
      face(c, { hairAt: (f, l, up) => Math.abs(l) < 0.28 && up > 0.3, hair: TEAL });
      const { st, s, hf, hu, R } = c;
      const a = add(s.head, add(mul(hf, R[0] * 0.5), mul(hu, R[2] * 0.9)));
      const b = add(s.head, add(mul(hf, -R[0] * 1.0), mul(hu, R[2] * 0.75)));
      rod(st.part(st.near(s.head) + 0.5), st, a, b, 1.6, 1.0, TEAL);
    },
  },
  {
    name: 'Masked wrestler: half mask, cape',
    paint: (c) => {
      const { B } = c;
      cloak(c, CYAN, B.ankle + B.shank * 0.9, B.pelvisHalf + 5.0);
      trousers(c, NIGHT, ROBE, { wide: 0.4 });
      const body = torso(c, DEEP, NIGHT);
      pecs(c, body, DEEP);
      belt(c, ROBE, CYAN, 3);
      fighterArms(c, { skin: DEEP, cuff: ROBE, thick: 0.95 });
      // (the mask over the top half of his face, a pale star of stitching round each eye)
      const hd = face(c, { skin: SKIN_DEEP, blind: true, paint: (f, l, up, t) => (up > -0.15 || f < 0 ? ROBE[Math.max(1, t)] : undefined) });
      for (const turn of EYES) {
        dotOn(c, hd, turn, 0.14, WHITE[3]);
        dotOn(c, hd, turn, 0.14, WHITE[3], 0, 1);
        dotOn(c, hd, turn, 0.14, INK, 1, 0);
        dotOn(c, hd, turn, 0.14, INK, 1, 1);
      }
    },
  },
  {
    name: 'Hooded: scarf over the mouth',
    f: true,
    paint: (c) => {
      trousers(c, NIGHT, LEATHER, { wide: 0.5, wrap: LINEN });
      const body = bodice(c, PLUM, 0.6, NIGHT);
      void body;
      sash(c, TEAL, 8);
      fighterArms(c, { skin: SK, sleeve: PLUM, to: 1.25, wrap: LINEN, wrapUp: 0.35, thick: 0.45 });
      mantle(c, NIGHT, { drop: 5.5, ragged: true });
      face(c, { hairAt: hairline, hair: BLONDE, paint: (f, l, up, t) => (up < -0.18 && f > -0.4 ? TEAL[Math.max(1, t)] : undefined), mouth: null });
      hood(c, NIGHT, 0.55);
    },
  },
  {
    name: 'Veteran: grey beard, open jerkin',
    paint: (c) => {
      trousers(c, MAIL, LEATHER, { wide: 0.6 });
      const body = torso(c, SK, MAIL);
      pecs(c, body, SK);
      // (the jerkin, open down the front: leather, its collar up)
      const j = c.st.part(c.st.near(c.s.ribs) + 0.3);
      const balls = trunkBalls(c.trunk, 1.05);
      for (const o of balls.slice(0, 2)) ball(j, c.st, o.c, o.axes, (u, t) => (Math.abs(u[1]) < 0.3 && u[0] > 0 ? null : LEATHER[t]));
      belt(c, LEATHER, BRASS, 3);
      fighterArms(c, { skin: SK, sleeve: LEATHER, to: 0.45, wrap: BROWN, wrapUp: 0.35 });
      const hd = face(c, { hairAt: (f, l, up) => f < -0.25 || (Math.abs(l) > 0.85 && up < 0.4), hair: GREY });
      // (a scar across his eye)
      dotOn(c, hd, EYES[0], 0.36, SKIN4[1]);
      dotOn(c, hd, EYES[0], 0.36, SKIN4[1], 1, 1);
      dotOn(c, hd, EYES[0], 0.36, SKIN4[1], 2, 2);
      beard(c, GREY, 3.0, 1.05);
    },
  },
];

export const WARLOCKS: ClassLook[] = [
  {
    name: 'Horned hood, long coat',
    paint: (c) => {
      const { B } = c;
      legs(c, COAL, LEATHER, true);
      skirt(c, COAL, { drop: B.thigh + B.shank * 0.7, wide: 4.0, deep: 3.6, hem: RUST, folds: [0, 180, 90, -90], arc: [26, 334] });
      const body = torso(c, COAL, COAL);
      seam(c, body, RUST[3]);
      belt(c, LEATHER, CYAN, 2);
      grimoire(c);
      arms(c, { upper: COAL, fore: COAL, hand: SK, bell: 0.4 });
      face(c, { hairAt: () => true, hair: RAVEN, shade: 0.2, blind: true });
      for (const turn of EYES) dotOn(c, c.st.part(c.st.near(c.s.head) + 0.9), turn, 0.14, GLINT);
      hood(c, COAL, 0.8);
      horns(c, 'swept', { long: 8, up: 0.8 });
      handFire(c, handsOf(c)[0]);
    },
  },
  {
    name: 'Pact arm: the demon\'s arm',
    paint: (c) => {
      const { B } = c;
      legs(c, NIGHT, LEATHER, true);
      skirt(c, NIGHT, { drop: B.thigh * 0.85, wide: 3.2, deep: 3.0, hem: CYAN, folds: [0, 180] });
      const body = torso(c, NIGHT, NIGHT);
      seam(c, body, CYAN[2]);
      sash(c, RUST, 9);
      // (his right arm in its sleeve; his left bare, the demon's: dark and red, clawed, cracked with light)
      const { st, s, mine } = c;
      const [aS, aE, aW] = B.armR;
      rod(st.part(mid(s.shoulderR, s.elbowR)), st, s.shoulderR, s.elbowR, aS + 0.7, aE + 0.6, mine(NIGHT, s.elbowR));
      rod(st.part(mid(s.elbowR, s.handR, 0.6)), st, s.elbowR, s.handR, aE + 0.6, aW + 1.2, mine(NIGHT, s.handR));
      ball(st.part(st.near(s.handR) + 0.2), st, s.handR, [[aW + 0.7, 0, 0], [0, aW + 0.7, 0], [0, 0, aW + 0.7]], SK);
      const up = st.part(mid(s.shoulderL, s.elbowL));
      rod(up, st, s.shoulderL, s.elbowL, aS + 1.3, aE + 1.1, RUST);
      const fo = st.part(mid(s.elbowL, s.handL, 0.6));
      rod(fo, st, s.elbowL, s.handL, aE + 1.2, aW + 1.0, RUST);
      ball(st.part(st.near(s.handL) + 0.2), st, s.handL, [[aW + 1.4, 0, 0], [0, aW + 1.4, 0], [0, 0, aW + 1.3]], RUST);
      claws(c, s.handL, s.elbowL);
      cracks(c, fo, s.elbowL, s.handL, 2, 3);
      cracks(c, up, s.shoulderL, s.elbowL, 2, 5);
      pauldron(c, COAL, 1, true);
      face(c, { hairAt: (f, l, up) => f < -0.1 || up > 0.6, hair: GREY });
      horns(c, 'small', { long: 6, thick: 1.4 });
      handFire(c, s.handL, 0.8);
    },
  },
  {
    name: 'Plated: spiked pauldrons, cape',
    paint: (c) => {
      const { B } = c;
      cloak(c, RUST, B.ankle + 1.5, B.pelvisHalf + 6.5);
      legs(c, MAIL, COAL, true);
      skirt(c, COAL, { drop: B.thigh * 0.7, wide: 3.0, deep: 2.8, hem: RUST, ragged: true, folds: [0, 180, 90, -90] });
      const body = torso(c, COAL, COAL, 1.0);
      seam(c, body, CYAN[2]);
      belt(c, LEATHER, CYAN, 3);
      arms(c, { upper: MAIL, fore: COAL, hand: COAL, bell: 0.2 });
      claws(c, c.s.handL, c.s.elbowL);
      pauldron(c, COAL, 1, true);
      pauldron(c, COAL, -1, true);
      const hd = face(c, { hairAt: (f, l, up) => f < 0.02 || up > 0.45, hair: RAVEN, blind: true });
      for (const turn of EYES) dotOn(c, hd, turn, 0.14, GLINT);
      beard(c, RAVEN, 2.0, 0.9);
      horns(c, 'wide', { long: 8, thick: 1.8 });
      handFire(c, c.s.handL);
    },
  },
  {
    name: 'Iron crown, burning eyes',
    paint: (c) => {
      const { B } = c;
      legs(c, COAL, LEATHER, true);
      skirt(c, RUST, { drop: B.thigh + B.shank * 0.85, wide: 4.6, deep: 4.0, hem: COAL, folds: [0, 180, 90, -90, 140, -140] });
      const body = torso(c, RUST, RUST);
      seam(c, body, BRASS[2]);
      belt(c, COAL, CYAN, 2);
      arms(c, { upper: RUST, fore: COAL, hand: SK, bell: 1.0 });
      mantle(c, COAL, { drop: 6.0, ragged: true, out: 0.6 });
      curtain(c, WHITE, 10, B.shoulderHalf + 1.0);
      const hd = face(c, { hairAt: (f, l, up) => f < 0.0 || up > 0.55, hair: WHITE, blind: true });
      for (const turn of EYES) {
        dotOn(c, hd, turn, 0.14, '#ffffff');
        dotOn(c, hd, turn, 0.14, SPARK[2], 0, 1);
      }
      // (the crown: a ring of iron spikes, each a little different)
      const { st, s, hf, hl, hu, R } = c;
      const cr = st.part(st.near(s.head) + 0.7);
      band(cr, st, { c: add(s.head, mul(hu, R[2] * 0.62)), u: mul(hf, R[0] * 1.06), v: mul(hl, R[1] * 1.06) }, STEEL, 2, 0.4);
      for (let i = 0; i < 7; i++) {
        const a = ((i / 7) * 360 - 90) * D;
        const at = add(s.head, add(add(mul(hf, Math.cos(a) * R[0] * 1.02), mul(hl, Math.sin(a) * R[1] * 1.02)), mul(hu, R[2] * 0.7)));
        rod(cr, st, at, add(at, mul(hu, 2.4 + (i % 3) * 0.9)), 0.8, 0.15, STEEL);
      }
      handFire(c, s.handL, 1.1);
    },
  },
  {
    name: 'Swept horns, high collar',
    f: true,
    paint: (c) => {
      collar(c, RUST, 9, c.B.shoulderHalf + 2.8);
      const { B } = c;
      legs(c, NIGHT, COAL, true);
      skirt(c, NIGHT, { drop: B.thigh + B.shank * 0.8, wide: 5.0, deep: 4.2, hem: RUST, folds: [0, 180, 90, -90], arc: [22, 338] });
      const body = bodice(c, NIGHT);
      seam(c, body, CYAN[2]);
      belt(c, RUST, CYAN, 2);
      grimoire(c, COAL);
      arms(c, { upper: NIGHT, fore: NIGHT, hand: SK, bell: 1.2 });
      face(c, { hairAt: drawnBack, hair: WINE, mouth: RUST[2], blind: true });
      for (const turn of EYES) dotOn(c, c.st.part(c.st.near(c.s.head) + 0.9), turn, 0.14, GLINT);
      curtain(c, WINE, 14, B.shoulderHalf + 1.0);
      horns(c, 'swept', { long: 9, thick: 1.7 });
      handFire(c, c.s.handL);
    },
  },
  {
    name: 'Demon mask, red robe',
    paint: (c) => {
      const { B } = c;
      legs(c, COAL, COAL, true);
      skirt(c, RUST, { drop: B.thigh + B.shank * 0.85, wide: 4.2, deep: 3.8, hem: COAL, folds: [0, 180, 90, -90] });
      const body = torso(c, RUST, RUST);
      seam(c, body, COAL[3]);
      sash(c, COAL, 10);
      arms(c, { upper: RUST, fore: RUST, hand: COAL, bell: 1.1 });
      // (the mask: the whole face, bone pale, a snarl carved into it, two slits of light; horns of its own)
      const hd = face(c, { blind: true, paint: (f, l, up, t) => (f > -0.25 ? BONE[Math.max(2, t)] : RAVEN[t]), neck: COAL, more: 0.08 });
      for (const turn of EYES) {
        dotOn(c, hd, turn, 0.16, GLINT);
        dotOn(c, hd, turn, 0.16, GLINT, 1, 0);
      }
      for (let d = -20; d <= 20; d += 7) dotOn(c, hd, (EYES[0] + EYES[1]) / 2 + d, -0.45, INK);
      horns(c, 'up', { long: 7, thick: 1.5, ramp: RUST });
      hood(c, COAL, 0.4);
      handFire(c, c.s.handL);
    },
  },
  {
    name: 'Cracked skin: bare chest, light within',
    paint: (c) => {
      trousers(c, COAL, LEATHER, { wide: 0.8 });
      const body = torso(c, DEEP, COAL);
      pecs(c, body, DEEP);
      cracks(c, body, off(c.s.neck, c.s.chest, c.B.ribDeep, 1.5, -3), off(c.s.waist, c.s.hips, c.B.waistDeep, -1.5, 1), 4, 2);
      sash(c, RUST, 11);
      fighterArms(c, { skin: DEEP, cuff: COAL, thick: 0.8 });
      claws(c, c.s.handL, c.s.elbowL);
      chain(c, c.st.part(c.st.near(c.s.handR) + 0.5), c.s.handR, add(c.s.handR, [0.5, 0.5, -9]));
      const hd = face(c, { hairAt: (f, l, up) => f < -0.1 || up > 0.5, hair: RAVEN, skin: SKIN_DEEP, blind: true });
      for (const turn of EYES) dotOn(c, hd, turn, 0.14, GLINT);
      cracks(c, hd, onFace(c, EYES[0] - 10, 0.5), onFace(c, EYES[0] - 10, -0.2), 1, 4);
      horns(c, 'up', { long: 8, thick: 1.6 });
      handFire(c, c.s.handL, 0.7);
    },
  },
  {
    name: 'Tail and hooves under the robe',
    paint: (c) => {
      const { B } = c;
      tail(c, RUST, -1);
      legs(c, COAL, HORN, false);
      skirt(c, PLUM, { drop: B.thigh + B.shank * 0.55, wide: 4.0, deep: 3.6, hem: RUST, ragged: true, folds: [0, 180, 90, -90] });
      const body = torso(c, PLUM, PLUM);
      seam(c, body, CYAN[2]);
      belt(c, LEATHER, CYAN, 2);
      grimoire(c, NIGHT);
      arms(c, { upper: PLUM, fore: PLUM, hand: SK, bell: 0.9 });
      mantle(c, NIGHT, { drop: 4.6, hem: RUST });
      face(c, { hairAt: () => false });
      beard(c, WINE, 2.6, 0.75);
      horns(c, 'small', { long: 5, thick: 1.2, up: 0.7 });
      handFire(c, c.s.handL);
    },
  },
  {
    name: 'Wing cloak: ragged, ribbed',
    paint: (c) => {
      const { B } = c;
      wingCape(c, NIGHT, 26);
      legs(c, COAL, LEATHER, true);
      skirt(c, COAL, { drop: B.thigh * 0.9, wide: 3.4, deep: 3.0, hem: CYAN, ragged: true, folds: [0, 180] });
      const body = torso(c, COAL, COAL);
      seam(c, body, CYAN[2]);
      strap(c, body, LEATHER, true);
      belt(c, LEATHER, CYAN, 2);
      arms(c, { upper: COAL, fore: LEATHER, hand: SK, bell: 0.3 });
      face(c, { hairAt: (f, l, up) => f < 0.05 || up > 0.4, hair: GREY });
      locks(c, GREY, 4.5);
      horns(c, 'swept', { long: 10, thick: 1.7 });
      handFire(c, c.s.handL);
    },
  },
  {
    name: 'Chained: shackles broken',
    f: true,
    paint: (c) => {
      const { B } = c;
      legs(c, NIGHT, LEATHER, true);
      skirt(c, COAL, { drop: B.thigh * 0.8, wide: 3.4, deep: 3.0, hem: RUST, ragged: true, folds: [0, 180, 90, -90] });
      const body = bodice(c, RUST, 0.6, COAL);
      // (chains wound round her: over the chest and the arms, ending in broken shackles at her wrists)
      chain(c, body, off(c.s.shoulderL, c.s.chest, B.ribDeep * 0.7, -1.5, 0.5), off(c.s.waist, c.s.hips, B.waistDeep + 0.5, -B.waistHalf, 0));
      chain(c, body, off(c.s.shoulderR, c.s.chest, B.ribDeep * 0.7, 1.5, 0.5), off(c.s.waist, c.s.hips, B.waistDeep + 0.5, B.waistHalf, 0));
      belt(c, COAL, CYAN, 2);
      fighterArms(c, { skin: SK, cuff: COAL, thick: 0.4, fist: SK });
      const { st, s } = c;
      chain(c, st.part(st.near(s.handR) + 0.5), lerp3(s.handR, s.elbowR, 0.2), add(s.handR, [0, 0, -7]));
      face(c, { hairAt: hairline, hair: TEAL, blind: true });
      for (const turn of EYES) dotOn(c, c.st.part(c.st.near(c.s.head) + 0.9), turn, 0.14, GLINT);
      tresses(c, TEAL, 11);
      horns(c, 'ram', { long: 6, thick: 1.5 });
      handFire(c, s.handL);
    },
  },
];

export const APOTHECARIES: ClassLook[] = [
  {
    name: 'Beak mask, wide hat, long coat',
    paint: (c) => {
      const { B } = c;
      legs(c, COAL, LEATHER, true);
      skirt(c, NIGHT, { drop: B.thigh + B.shank * 0.65, wide: 3.6, deep: 3.2, hem: TEAL, folds: [0, 180, 90, -90], arc: [24, 336] });
      const body = torso(c, NIGHT, NIGHT);
      strap(c, body, LEATHER, false, (at, i) => vial(c, at, [SPARK, LEAF][i % 2]), 4);
      bottleBelt(c, LEATHER, [SPARK, LEAF, ROBE], 3);
      arms(c, { upper: NIGHT, fore: NIGHT, hand: LEATHER, bell: 0.5 });
      beak(c, BONE, BRASS, 6);
      brimHat(c, NIGHT, { wide: 0.22, tip: 18 });
      flask(c, c.s.handR, SPARK, 2.2);
    },
  },
  {
    name: 'Herbalist: apron, headscarf',
    f: true,
    paint: (c) => {
      const { B } = c;
      legs(c, MAIL, LEATHER, false);
      skirt(c, MOSS, { drop: B.thigh + B.shank * 0.6, wide: 4.2, deep: 3.6, hem: LEAF, folds: [0, 180, 90, -90] });
      const body = bodice(c, MOSS);
      apron(c, LINEN, 1.2, body);
      bottleBelt(c, LEATHER, [LEAF, SPARK], 2, null);
      satchel(c, body);
      arms(c, { upper: LINEN, fore: SK, hand: SK, bell: 0 });
      face(c, { hairAt: (f, l, up) => up > 0.25 || f < 0, hair: TEAL, paint: (f, l, up, t) => (up > 0.25 || f < 0 ? TEAL[t] : undefined), blush: true, mouth: PINK[1] });
      braid(c, BROWN, 1, 9);
      flask(c, c.s.handR, LEAF, 2.0);
    },
  },
  {
    name: 'Tinkerer: goggles, bandolier',
    paint: (c) => {
      trousers(c, LEATHER, COAL, { wide: 0.6 });
      const body = torso(c, LINEN, LEATHER);
      apron(c, LEATHER, 0.9, body);
      strap(c, body, LEATHER, false, (at, i) => vial(c, at, [SPARK, ROBE, LEAF][i % 3]), 5);
      belt(c, LEATHER, BRASS, 2);
      fighterArms(c, { skin: SK, sleeve: LINEN, to: 0.9, wrap: null, thick: 0.1, fist: LEATHER });
      const hd = face(c, { hairAt: (f, l, up) => f < 0 || up > 0.45, hair: RUST });
      goggles(c, hd, true);
      flask(c, c.s.handR, SPARK, 2.0);
    },
  },
  {
    name: 'Hooded, a cloth over the mouth',
    paint: (c) => {
      const { B } = c;
      cloak(c, MOSS, B.ankle + B.shank * 0.5, B.pelvisHalf + 5.0);
      trousers(c, NIGHT, LEATHER, { wide: 0.4 });
      const body = torso(c, MOSS, NIGHT);
      seam(c, body, CYAN[2]);
      bottleBelt(c, LEATHER, [SPARK, ROBE], 4, CYAN);
      arms(c, { upper: MOSS, fore: LEATHER, hand: LEATHER, bell: 0.2 });
      face(c, { hairAt: hairline, hair: RAVEN, paint: (f, l, up, t) => (up < -0.15 ? LINEN[Math.max(2, t)] : undefined), mouth: null });
      hood(c, MOSS, 0.9);
      flask(c, c.s.handR, SPARK, 2.2);
    },
  },
  {
    name: 'Waistcoat, braid, satchel',
    f: true,
    paint: (c) => {
      trousers(c, PLUM, LEATHER, { wide: 0.5 });
      const body = bodice(c, LINEN, 0.6, PLUM);
      // (the waistcoat over her blouse)
      const v = c.st.part(c.st.near(c.s.ribs) + 0.3);
      const balls = trunkBalls(c.trunk, 0.95);
      ball(v, c.st, balls[1].c, balls[1].axes, TEAL);
      ball(v, c.st, balls[0].c, balls[0].axes, (u, t) => (u[2] > 0.35 && Math.abs(u[1]) < 0.5 && u[0] > 0 ? null : TEAL[t]));
      satchel(c, body);
      bottleBelt(c, LEATHER, [ROBE, SPARK, LEAF], 3);
      arms(c, { upper: LINEN, fore: LINEN, hand: SK, bell: 0.5 });
      face(c, { hairAt: hairline, hair: BLONDE, blush: true, mouth: PINK[1] });
      braid(c, BLONDE, -1, 10);
      flask(c, c.s.handR, ROBE, 2.0);
    },
  },
  {
    name: 'Top hat, monocle, tails',
    paint: (c) => {
      const { B } = c;
      trousers(c, MAIL, COAL, { wide: 0.3 });
      // (the coat's tails, behind)
      skirt(c, INDIGO, { drop: B.thigh + B.shank * 0.35, wide: 3.0, deep: 3.0, folds: [180, 140, -140], arc: [80, 280] });
      const body = torso(c, INDIGO, INDIGO);
      seam(c, body, BRASS[3]);
      bottleBelt(c, LEATHER, [SPARK, LEAF], 2, BRASS);
      arms(c, { upper: INDIGO, fore: INDIGO, hand: WHITE, bell: 0.1 });
      const hd = face(c, { hairAt: (f, l, up) => f < -0.2, hair: GREY });
      moustache(c, hd, GREY[3]);
      // (the monocle on his right eye)
      for (const [dx, dy] of [[-1, -1], [0, -1], [1, -1], [-1, 0], [1, 0], [-1, 1], [0, 1], [1, 1]] as const) dotOn(c, hd, EYES[1], 0.14, BRASS[3], dx, dy);
      topHat(c, COAL, 7.5, CYAN);
      flask(c, c.s.handR, SPARK, 2.2);
    },
  },
  {
    name: 'Bomber: scarf mask, thigh straps',
    f: true,
    paint: (c) => {
      trousers(c, NIGHT, LEATHER, { wide: 0.5 });
      // (straps round the thighs, a vial on each)
      for (const side of ['L', 'R'] as const) {
        const hip = side === 'L' ? c.s.hipL : c.s.hipR;
        const knee = side === 'L' ? c.s.kneeL : c.s.kneeR;
        const at = lerp3(hip, knee, 0.55);
        band(c.st.part(c.st.near(at) + 0.3), c.st, { c: at, u: mul(c.s.hips[0], c.B.legR[0] + 0.9), v: mul(c.s.hips[1], c.B.legR[0] + 0.9) }, LEATHER, 2, 0.3);
        vial(c, add(at, mul(c.s.hips[0], c.B.legR[0] + 1.2)), side === 'L' ? SPARK : ROBE);
      }
      const body = bodice(c, LEATHER, 0.6, NIGHT);
      strap(c, body, BROWN, true, (at, i) => vial(c, at, [SPARK, LEAF][i % 2]), 3);
      belt(c, BROWN, CYAN, 2);
      arms(c, { upper: LEATHER, fore: LEATHER, hand: LEATHER, bell: 0 });
      mantle(c, RUST, { drop: 5.0, ragged: true });
      face(c, { hairAt: hairline, hair: RAVEN, paint: (f, l, up, t) => (up < -0.1 && f > -0.5 ? RUST[Math.max(1, t)] : undefined), mouth: null });
      rope(c, RAVEN, 8);
      flask(c, c.s.handR, SPARK, 2.3);
    },
  },
  {
    name: 'Elder: spectacles, white beard',
    paint: (c) => {
      const { B } = c;
      legs(c, MAIL, LEATHER, false);
      skirt(c, TEAL, { drop: B.thigh + B.shank * 0.85, wide: 4.4, deep: 3.8, hem: CYAN, folds: [0, 180, 90, -90] });
      const body = torso(c, TEAL, TEAL);
      seam(c, body, CYAN[2]);
      bottleBelt(c, LEATHER, [LEAF, ROBE, SPARK], 3);
      satchel(c, body, true);
      arms(c, { upper: TEAL, fore: TEAL, hand: SK, bell: 1.1 });
      const hd = face(c, { hairAt: (f, l, up) => f < -0.2 || (Math.abs(l) > 0.85 && up < 0.3), hair: WHITE, blind: true });
      for (const turn of EYES) {
        dotOn(c, hd, turn, 0.14, '#ffffff');
        dotOn(c, hd, turn, 0.14, CYAN[2], 0, 1);
      }
      dotOn(c, hd, (EYES[0] + EYES[1]) / 2, 0.16, INK);
      beard(c, WHITE, 6, 1.0);
      flask(c, c.s.handR, LEAF, 2.0);
    },
  },
  {
    name: 'Apprentice: a pack of bottles',
    paint: (c) => {
      trousers(c, BROWN, LEATHER, { to: 0.6, shin: MAIL, wide: 0.6 });
      const body = torso(c, TEAL, BROWN);
      // (the pack on his back: a wooden frame, bottles standing in it over his shoulders)
      const { st, s, B } = c;
      const back = off(s.ribs, s.chest, -B.ribDeep - 3.2, 0, 1);
      const pack = st.part(st.near(back));
      ball(pack, st, back, [mul(s.chest[0], 3.0), mul(s.chest[1], B.ribHalf + 1.0), mul(s.chest[2], 7.0)], BROWN);
      for (const [k, liq] of [[-1, SPARK], [0, LEAF], [1, ROBE]] as const) flask(c, off(back, s.chest, 0, k * 3.2, 8.5), liq, 1.7);
      strap(c, body, LEATHER, false);
      bottleBelt(c, LEATHER, [SPARK], 2, CYAN);
      arms(c, { upper: TEAL, fore: TEAL, hand: SK, bell: 0.1 });
      face(c, { hairAt: hairline, hair: BLONDE, blush: true });
      flask(c, c.s.handR, SPARK, 2.0);
    },
  },
  {
    name: 'Turban and sash: gourd flasks',
    paint: (c) => {
      const { B } = c;
      trousers(c, LINEN, LEATHER, { wide: 1.2, to: 0.85, shin: LEATHER });
      skirt(c, ROBE, { drop: B.thigh * 0.85, wide: 3.0, deep: 2.6, hem: CYAN, folds: [0, 180], arc: [30, 330] });
      const body = torso(c, ROBE, ROBE);
      seam(c, body, CYAN[2]);
      sash(c, TEAL, 9);
      // (gourds on the sash)
      const { st, s } = c;
      for (const k of [1, -1]) {
        const at = off(s.waist, s.hips, B.waistDeep + 1.0, k * B.waistHalf * 0.95, -4.0);
        ball(st.part(st.near(at) + 1.0), st, at, [[1.7, 0, 0], [0, 1.7, 0], [0, 0, 2.1]], BRASS);
      }
      arms(c, { upper: ROBE, fore: LINEN, hand: DEEP, bell: 0.2 });
      face(c, { skin: SKIN_DEEP, hairAt: (f, l, up) => up > 0.25 || f < -0.2, hair: LINEN, paint: (f, l, up, t) => (up > 0.25 || f < -0.2 ? LINEN[t] : undefined) });
      // (the turban's wound bulk over the top of the head)
      const { hf, hl, hu, R } = c;
      ball(st.part(st.near(s.head) + 0.5), st, add(s.head, mul(hu, R[2] * 0.62)), [mul(hf, R[0] * 1.2), mul(hl, R[1] * 1.22), mul(hu, R[2] * 0.6)], LINEN);
      beard(c, RAVEN, 1.8, 0.85);
      flask(c, c.s.handR, SPARK, 2.0);
    },
  },
];

// ---------------------------------------------------------------------------------------------
// THE SECOND ROUND (his picks of the first, 23 Oct (Pacific; by 18:43): "Can I get a few more like 3" (the brawler); "A few
// more like 1 and 2" (the warlock); "Few more like 2, 3, and 7" (the apothecary)). Each sheet begins with the ones he named.

/** A singlet: its body from the chest down, and one strap (over the left shoulder) or two. */
function singlet(c: C, ramp: Ramp, two = false, stripes: Ramp | null = null): void {
  const sg = c.st.part(c.st.near(c.s.ribs) + 0.2);
  const balls = trunkBalls(c.trunk, 0.75);
  const striped = (u: V3, t: number): string => (stripes && Math.floor((u[2] + 1) * 4) % 2 === 0 ? stripes[t] : ramp[t]);
  ball(sg, c.st, balls[1].c, balls[1].axes, striped);
  ball(sg, c.st, balls[0].c, balls[0].axes, (u, t) => (u[2] < -0.1 || u[1] > 0.45 || (two && u[1] < -0.45) ? striped(u, t) : null));
}
/** A band round the head, across the brow. */
function headband(c: C, hd: Sheet, ramp: Ramp, up = 0.42): void {
  band(hd, c.st, { c: add(c.s.head, mul(c.hu, c.R[2] * up)), u: mul(c.hf, c.R[0] * 1.02), v: mul(c.hl, c.R[1] * 1.02) }, ramp, 2, 0.3);
}
/** Pads over the knees. */
function kneePads(c: C, ramp: Ramp): void {
  const { st, s, B } = c;
  for (const knee of [s.kneeL, s.kneeR]) ball(st.part(st.near(knee) + 0.4), st, add(knee, mul(s.hips[0], 0.6)), [[B.legR[1] + 1.1, 0, 0], [0, B.legR[1] + 1.1, 0], [0, 0, B.legR[1] + 1.3]], c.mine(ramp, knee));
}
/** A great belt, a plate on its front (a champion's). */
function plateBelt(c: C, ramp: Ramp, plate: Ramp = BRASS): void {
  const { st, s, B, trunk } = c;
  band(st.part(s.waist), st, girdle(trunk[1], -0.15, 1.3), ramp, 4);
  if (c.fromBehind) return;
  const at = off(s.waist, s.hips, B.waistDeep + 1.4, 0, -0.6);
  ball(st.part(st.near(at) + 0.5), st, at, [mul(s.hips[0], 0.9), mul(s.hips[1], 3.0), mul(s.hips[2], 2.2)], (u, t) => (Math.abs(u[1]) < 0.3 && Math.abs(u[2]) < 0.3 ? CYAN[3] : plate[t]));
}
/** A beard in two forks, each tied. */
function forkedBeard(c: C, ramp: Ramp, len = 4.5): void {
  const { st, s, hf, hl, hu, R } = c;
  beard(c, ramp, 1.8, 1.0);
  for (const side of [1, -1]) {
    const a = add(s.head, add(add(mul(hf, R[0] * 0.65), mul(hl, side * R[1] * 0.3)), mul(hu, -R[2] * 0.85)));
    const b = add(a, add(mul(hu, -len), add(mul(hf, 0.6), mul(hl, side * 0.6))));
    const p = st.part(st.near(a) + 0.5);
    rod(p, st, a, b, 1.7, 1.0, ramp);
    ball(p, st, lerp3(a, b, 0.75), [[1.2, 0, 0], [0, 1.2, 0], [0, 0, 0.8]], CYAN);
  }
}
/** THE DEMON'S ARM (the left: the one with the fire in it): its hide to the shoulder, clawed, cracked with light; `chains` wound round it. */
function demonArm(c: C, hide: Ramp, o: { chains?: boolean; spike?: boolean; plate?: Ramp; to?: number } = {}): void {
  const { st, s, B } = c;
  const [aS, aE, aW] = B.armR;
  const up = st.part(mid(s.shoulderL, s.elbowL));
  rod(up, st, s.shoulderL, s.elbowL, aS + 1.3, aE + 1.1, hide);
  const fo = st.part(mid(s.elbowL, s.handL, 0.6));
  rod(fo, st, s.elbowL, s.handL, aE + 1.2, aW + 1.0, hide);
  ball(st.part(st.near(s.handL) + 0.2), st, s.handL, [[aW + 1.4, 0, 0], [0, aW + 1.4, 0], [0, 0, aW + 1.3]], hide);
  claws(c, s.handL, s.elbowL);
  cracks(c, fo, s.elbowL, s.handL, 2, 3);
  cracks(c, up, s.shoulderL, s.elbowL, 2, 5);
  // (spines down the back of the forearm)
  for (let i = 1; i <= 3; i++) {
    const at = lerp3(s.elbowL, s.handL, i * 0.22);
    rod(fo, st, at, add(at, [0, 0, 2.2]), 0.7, 0.15, IVORY);
  }
  if (o.chains) for (let i = 0; i < 4; i++) chain(c, st.part(st.near(s.elbowL) + 0.6), lerp3(s.shoulderL, s.handL, 0.2 + i * 0.18), add(lerp3(s.shoulderL, s.handL, 0.28 + i * 0.18), [0, 0, -2]));
  if (o.spike) pauldron(c, o.plate ?? COAL, 1, true);
}
/** The other arm (the right) in its sleeve, a hand at its end. */
function sleeveArm(c: C, ramp: Ramp, hand: Ramp, bell = 1.0): void {
  const { st, s, B, mine } = c;
  const [aS, aE, aW] = B.armR;
  rod(st.part(mid(s.shoulderR, s.elbowR)), st, s.shoulderR, s.elbowR, aS + 0.7, aE + 0.6, mine(ramp, s.elbowR));
  rod(st.part(mid(s.elbowR, s.handR, 0.6)), st, s.elbowR, lerp3(s.elbowR, s.handR, 0.86), aE + 0.6, aW + 0.4 + bell, mine(ramp, s.handR));
  ball(st.part(st.near(s.handR) + 0.2), st, s.handR, [[aW + 0.7, 0, 0], [0, aW + 0.7, 0], [0, 0, aW + 0.7]], hand);
}
/** A long coat: its skirts to the ankle, open at the front. */
function longCoat(c: C, ramp: Ramp, hem: Ramp | null = RUST, drop = 0.75): void {
  const { B } = c;
  skirt(c, ramp, { drop: B.thigh + B.shank * drop, wide: 4.0, deep: 3.6, hem: hem ?? undefined, folds: [0, 180, 90, -90], arc: [26, 334] });
}
/** Straps round both thighs, a vial on each. */
function thighStraps(c: C, colours: Ramp[]): void {
  for (const side of ['L', 'R'] as const) {
    const hip = side === 'L' ? c.s.hipL : c.s.hipR;
    const knee = side === 'L' ? c.s.kneeL : c.s.kneeR;
    const at = lerp3(hip, knee, 0.55);
    band(c.st.part(c.st.near(at) + 0.3), c.st, { c: at, u: mul(c.s.hips[0], c.B.legR[0] + 0.9), v: mul(c.s.hips[1], c.B.legR[0] + 0.9) }, LEATHER, 2, 0.3);
    vial(c, add(at, mul(c.s.hips[0], c.B.legR[0] + 1.2)), colours[side === 'L' ? 0 : 1 % colours.length]);
  }
}
/** A cloth over the mouth and nose, on a face. */
const masked = (ramp: Ramp) => (f: number, l: number, up: number, t: number): string | undefined => (up < -0.1 && f > -0.5 ? ramp[Math.max(1, t)] : undefined);

export const BRAWLERS2: ClassLook[] = [
  { ...BRAWLERS[2], n: '3' },
  {
    n: 'A',
    name: 'Bald, forked beard, two straps',
    paint: (c) => {
      trousers(c, TEAL, LEATHER, { to: 0.15, shin: DEEP });
      const body = torso(c, DEEP, TEAL);
      pecs(c, body, DEEP);
      singlet(c, TEAL, true);
      belt(c, LEATHER, CYAN, 3);
      fighterArms(c, { skin: DEEP, cuff: LEATHER, thick: 1.0 });
      face(c, { skin: SKIN_DEEP, hairAt: () => false });
      forkedBeard(c, BLONDE, 6);
    },
  },
  {
    n: 'B',
    name: 'Mane, beard, a fur',
    paint: (c) => {
      trousers(c, LEATHER, BROWN, { to: 0.2, shin: SK, wrap: null });
      const body = torso(c, SK, LEATHER);
      pecs(c, body, SK);
      singlet(c, RUST);
      belt(c, BROWN, CYAN, 3);
      curtain(c, BROWN, 12, c.B.shoulderHalf + 1.6);
      fighterArms(c, { skin: SK, cuff: BROWN, thick: 1.0 });
      mantle(c, GREY, { drop: 4.4, ragged: true, out: 1.0, folds: [20, -20, 150, -150, 90, -90] });
      face(c, { hairAt: hairline, hair: BROWN });
      beard(c, BROWN, 5.0, 1.2);
    },
  },
  {
    n: 'C',
    name: 'Crest and side whiskers',
    paint: (c) => {
      trousers(c, NIGHT, LEATHER, { to: 0.2, shin: SK });
      const body = torso(c, SK, NIGHT);
      pecs(c, body, SK);
      singlet(c, RUST, false);
      belt(c, LEATHER, BRASS, 3);
      fighterArms(c, { skin: SK, cuff: LEATHER, thick: 1.0 });
      // (a crest of hair, the sides shaved; thick whiskers down his cheeks to the jaw)
      face(c, { hairAt: (f, l, up) => (Math.abs(l) < 0.28 && up > 0.3) || (Math.abs(l) > 0.55 && up < 0.3 && up > -0.6 && f > -0.35), hair: RUST });
      const { st, s, hf, hu, R } = c;
      const a0 = add(s.head, add(mul(hf, R[0] * 0.5), mul(hu, R[2] * 0.95)));
      const b0 = add(s.head, add(mul(hf, -R[0] * 1.1), mul(hu, R[2] * 0.7)));
      rod(st.part(st.near(s.head) + 0.5), st, a0, b0, 1.8, 1.1, RUST);
    },
  },
  {
    n: 'D',
    name: 'Champion: plate belt, headband',
    paint: (c) => {
      trousers(c, RUST, LEATHER, { to: 0.15, shin: DEEP });
      kneePads(c, LEATHER);
      const body = torso(c, DEEP, RUST);
      pecs(c, body, DEEP);
      singlet(c, RUST);
      plateBelt(c, LEATHER);
      fighterArms(c, { skin: DEEP, cuff: CYAN, thick: 1.0 });
      const hd = face(c, { skin: SKIN_DEEP, hairAt: (f, l, up) => f < -0.1 || up > 0.5, hair: RAVEN });
      headband(c, hd, CYAN);
      beard(c, RAVEN, 2.2, 1.0);
    },
  },
  {
    n: 'E',
    name: 'Old bear: grey beard, knee pads',
    paint: (c) => {
      trousers(c, MAIL, LEATHER, { to: 0.15, shin: SK });
      kneePads(c, BROWN);
      const body = torso(c, SK, MAIL);
      pecs(c, body, SK);
      singlet(c, MAIL);
      belt(c, LEATHER, CYAN, 3);
      fighterArms(c, { skin: SK, wrap: LINEN, wrapUp: 0.35, thick: 1.0 });
      face(c, { hairAt: (f, l, up) => f < -0.25 && up < 0.3, hair: GREY });
      beard(c, GREY, 6.0, 1.25);
    },
  },
  {
    n: 'F',
    name: 'She-wrestler: two straps, braids',
    f: true,
    paint: (c) => {
      trousers(c, PLUM, LEATHER, { to: 0.15, shin: SK });
      kneePads(c, PLUM);
      bodice(c, PLUM, 0.6, PLUM);
      belt(c, LEATHER, CYAN, 3);
      fighterArms(c, { skin: SK, cuff: LEATHER, thick: 0.6 });
      face(c, { hairAt: hairline, hair: BLONDE, blush: true, mouth: PINK[1] });
      braid(c, BLONDE, 1, 10);
      braid(c, BLONDE, -1, 10);
    },
  },
];

export const WARLOCKS2: ClassLook[] = [
  { ...WARLOCKS[0], n: '1' },
  { ...WARLOCKS[1], n: '2' },
  {
    n: 'A',
    name: 'Horned hood, the demon\'s arm',
    paint: (c) => {
      legs(c, COAL, LEATHER, true);
      longCoat(c, COAL, RUST);
      const body = torso(c, COAL, COAL);
      seam(c, body, RUST[3]);
      belt(c, LEATHER, CYAN, 2);
      grimoire(c);
      sleeveArm(c, COAL, SK, 0.6);
      demonArm(c, RUST);
      face(c, { hairAt: () => true, hair: RAVEN, shade: 0.2, blind: true });
      for (const turn of EYES) dotOn(c, c.st.part(c.st.near(c.s.head) + 0.9), turn, 0.14, GLINT);
      hood(c, COAL, 0.8);
      horns(c, 'swept', { long: 8, up: 0.8 });
      handFire(c, c.s.handL);
    },
  },
  {
    n: 'B',
    name: 'High collar, the arm in chains',
    paint: (c) => {
      collar(c, COAL, 8.5, c.B.shoulderHalf + 2.6);
      legs(c, NIGHT, LEATHER, true);
      longCoat(c, NIGHT, CYAN);
      const body = torso(c, NIGHT, NIGHT);
      seam(c, body, CYAN[2]);
      sash(c, RUST, 9);
      sleeveArm(c, NIGHT, SK, 0.8);
      demonArm(c, RUST, { chains: true });
      face(c, { hairAt: (f, l, up) => f < -0.1 || up > 0.6, hair: GREY });
      horns(c, 'swept', { long: 9, thick: 1.6 });
      handFire(c, c.s.handL);
    },
  },
  {
    n: 'C',
    name: 'Ram horns, spiked shoulder',
    paint: (c) => {
      legs(c, COAL, COAL, true);
      longCoat(c, PLUM, COAL);
      const body = torso(c, PLUM, PLUM);
      seam(c, body, CYAN[2]);
      belt(c, COAL, CYAN, 2);
      grimoire(c, COAL);
      sleeveArm(c, PLUM, SK, 0.6);
      demonArm(c, RUST, { spike: true });
      face(c, { hairAt: () => true, hair: RAVEN, shade: 0.2, blind: true });
      for (const turn of EYES) dotOn(c, c.st.part(c.st.near(c.s.head) + 0.9), turn, 0.14, GLINT);
      hood(c, PLUM, 0.8);
      horns(c, 'ram', { long: 7, thick: 1.8 });
      handFire(c, c.s.handL);
    },
  },
  {
    n: 'D',
    name: 'Red hood, coal-black arm',
    paint: (c) => {
      legs(c, COAL, LEATHER, true);
      longCoat(c, RUST, COAL);
      const body = torso(c, RUST, RUST);
      seam(c, body, COAL[3]);
      belt(c, COAL, CYAN, 2);
      sleeveArm(c, RUST, SK, 0.8);
      demonArm(c, COAL);
      face(c, { hairAt: () => true, hair: RAVEN, shade: 0.2, blind: true });
      for (const turn of EYES) dotOn(c, c.st.part(c.st.near(c.s.head) + 0.9), turn, 0.14, GLINT);
      hood(c, RUST, 0.9);
      horns(c, 'up', { long: 7, thick: 1.6 });
      handFire(c, c.s.handL, 1.2);
    },
  },
  {
    n: 'E',
    name: 'One horn broken, a clawed hand',
    paint: (c) => {
      legs(c, MAIL, LEATHER, true);
      longCoat(c, INDIGO, RUST);
      const body = torso(c, INDIGO, INDIGO);
      seam(c, body, CYAN[2]);
      strap(c, body, LEATHER, false);
      belt(c, LEATHER, CYAN, 2);
      grimoire(c, RUST);
      arms(c, { upper: INDIGO, fore: INDIGO, hand: RUST, bell: 0.4 });
      claws(c, c.s.handL, c.s.elbowL);
      cracks(c, c.st.part(c.st.near(c.s.handL) + 0.5), c.s.elbowL, c.s.handL, 1, 2);
      face(c, { hairAt: hairline, hair: RAVEN });
      beard(c, RAVEN, 2.0, 0.9);
      hood(c, INDIGO, 0.5);
      // (one horn whole, swept back; the other snapped off short)
      const { st, s, hf, hl, hu, R } = c;
      horns(c, 'swept', { long: 8 });
      const stub = add(s.head, add(add(mul(hf, R[0] * 0.2), mul(hl, -R[1] * 0.66)), mul(hu, R[2] * 0.58)));
      rod(st.part(st.near(stub) + 0.6), st, stub, add(stub, add(mul(hl, -2.2), mul(hu, 1.6))), 2.0, 1.6, IVORY);
      handFire(c, s.handL);
    },
  },
  {
    n: 'F',
    name: 'She-warlock: the demon\'s arm',
    f: true,
    paint: (c) => {
      legs(c, NIGHT, COAL, true);
      longCoat(c, COAL, RUST, 0.8);
      const body = bodice(c, COAL);
      seam(c, body, RUST[3]);
      belt(c, RUST, CYAN, 2);
      sleeveArm(c, COAL, SK, 1.1);
      demonArm(c, RUST);
      face(c, { hairAt: hairline, hair: WINE, blind: true });
      for (const turn of EYES) dotOn(c, c.st.part(c.st.near(c.s.head) + 0.9), turn, 0.14, GLINT);
      locks(c, WINE, 6);
      hood(c, COAL, 0.6);
      horns(c, 'swept', { long: 8, thick: 1.5 });
      handFire(c, c.s.handL);
    },
  },
];

export const APOTHECARIES2: ClassLook[] = [
  { ...APOTHECARIES[1], n: '2' },
  { ...APOTHECARIES[2], n: '3' },
  { ...APOTHECARIES[6], n: '7' },
  {
    n: 'A',
    name: 'Herbalist with goggles',
    paint: (c) => {
      trousers(c, MOSS, LEATHER, { wide: 0.6 });
      const body = torso(c, LINEN, MOSS);
      apron(c, LEATHER, 1.0, body);
      strap(c, body, LEATHER, false, (at, i) => vial(c, at, [LEAF, SPARK][i % 2]), 4);
      belt(c, LEATHER, BRASS, 2);
      fighterArms(c, { skin: SK, sleeve: LINEN, to: 0.9, wrap: null, thick: 0.1, fist: SK });
      const hd = face(c, { hairAt: (f, l, up) => up > 0.25 || f < 0, hair: MOSS, paint: (f, l, up, t) => (up > 0.25 || f < 0 ? MOSS[t] : undefined) });
      goggles(c, hd, true);
      beard(c, BROWN, 1.8, 0.9);
      flask(c, c.s.handR, LEAF, 2.0);
    },
  },
  {
    n: 'B',
    name: 'Goggled bomber, bandolier',
    paint: (c) => {
      trousers(c, NIGHT, LEATHER, { wide: 0.5 });
      thighStraps(c, [SPARK, ROBE]);
      const body = torso(c, LEATHER, NIGHT);
      strap(c, body, BROWN, false, (at, i) => vial(c, at, [SPARK, LEAF, ROBE][i % 3]), 5);
      belt(c, BROWN, CYAN, 2);
      fighterArms(c, { skin: SK, sleeve: LEATHER, to: 1.6, wrap: null, thick: 0.1, fist: LEATHER });
      const hd = face(c, { hairAt: hairline, hair: RUST, paint: masked(TEAL), mouth: null });
      goggles(c, hd, false);
      flask(c, c.s.handR, SPARK, 2.3);
    },
  },
  {
    n: 'C',
    name: 'Hooded herbalist, masked',
    f: true,
    paint: (c) => {
      const { B } = c;
      legs(c, MAIL, LEATHER, false);
      skirt(c, MOSS, { drop: B.thigh + B.shank * 0.45, wide: 3.8, deep: 3.4, hem: LEAF, folds: [0, 180, 90, -90] });
      const body = bodice(c, MOSS);
      apron(c, LINEN, 1.0, body);
      satchel(c, body);
      bottleBelt(c, LEATHER, [LEAF, SPARK], 3, null);
      arms(c, { upper: MOSS, fore: LINEN, hand: SK, bell: 0 });
      mantle(c, MOSS, { drop: 5.2, ragged: true });
      face(c, { hairAt: hairline, hair: BROWN, paint: masked(LINEN), mouth: null });
      hood(c, MOSS, 0.7);
      flask(c, c.s.handR, LEAF, 2.1);
    },
  },
  {
    n: 'D',
    name: 'Tinkerer: goggles down, thigh straps',
    f: true,
    paint: (c) => {
      trousers(c, LEATHER, COAL, { wide: 0.5 });
      thighStraps(c, [SPARK, LEAF]);
      const body = bodice(c, LINEN, 0.6, LEATHER);
      apron(c, LEATHER, 0.8, body);
      belt(c, LEATHER, BRASS, 2);
      fighterArms(c, { skin: SK, sleeve: LINEN, to: 0.9, wrap: null, thick: 0.05, fist: LEATHER });
      const hd = face(c, { hairAt: drawnBack, hair: WINE, blush: true, mouth: PINK[1] });
      goggles(c, hd, false);
      pony(c, WINE, 10);
      flask(c, c.s.handR, SPARK, 2.1);
    },
  },
  {
    n: 'E',
    name: 'Long apron, vials all over',
    paint: (c) => {
      legs(c, NIGHT, LEATHER, true);
      longCoat(c, LEATHER, BROWN, 0.6);
      const body = torso(c, RUST, LEATHER);
      strap(c, body, BROWN, false, (at, i) => vial(c, at, [SPARK, ROBE, LEAF][i % 3]), 5);
      strap(c, body, BROWN, true, (at, i) => vial(c, at, [LEAF, SPARK][i % 2]), 4);
      bottleBelt(c, BROWN, [SPARK, ROBE, LEAF], 4, CYAN);
      arms(c, { upper: RUST, fore: LEATHER, hand: LEATHER, bell: 0.2 });
      const hd = face(c, { hairAt: (f, l, up) => f < 0 || up > 0.45, hair: RAVEN, paint: masked(RUST), mouth: null });
      goggles(c, hd, true);
      flask(c, c.s.handR, ROBE, 2.3);
    },
  },
  {
    n: 'F',
    name: 'Herbalist: bandana, beard',
    paint: (c) => {
      trousers(c, BROWN, LEATHER, { wide: 0.7 });
      const body = torso(c, MOSS, BROWN);
      apron(c, LINEN, 1.0, body);
      satchel(c, body);
      sash(c, LEAF, 7);
      const { st, s, B } = c;
      for (const k of [1, -1]) {
        const at = off(s.waist, s.hips, B.waistDeep + 1.0, k * B.waistHalf * 1.05, -3.6);
        ball(st.part(st.near(at) + 1.0), st, at, [[1.6, 0, 0], [0, 1.6, 0], [0, 0, 2.0]], BRASS);
      }
      arms(c, { upper: MOSS, fore: SK, hand: SK, bell: 0 });
      face(c, { hairAt: (f, l, up) => up > 0.38 || f < -0.15, hair: LEAF, paint: (f, l, up, t) => (up > 0.38 || f < -0.15 ? LEAF[t] : undefined) });
      beard(c, BROWN, 3.6, 1.05);
      flask(c, c.s.handR, LEAF, 2.0);
    },
  },
];

// ---------------------------------------------------------------------------------------------
// HIS PICKS (23 Oct (Pacific; by 18:43), of the second sheets): "3 with a yellow beard" (the brawler); "A with the spiked pauldron" (the warlock);
// "B with D’s hair, and I don’t like the jeweled knee pads.  I’d like either a belt with vials, and bandolier with vials, or a
// side satchel" (the apothecary: both ways, to choose between). Then, asked "Are the brawler and the warlock right as shown?",
// "Yes, both (Recommended)" (offered as: next, each drawn from front and back, then the warlock's demon form); and asked
// "Which apothecary kit?", "Vial belt + bandolier (Recommended)".

export const BRAWLER_PICK: ClassLook[] = [
  {
    n: '3',
    name: 'Brawler: yellow beard',
    paint: (c) => {
      trousers(c, RUST, LEATHER, { to: 0.15, shin: DEEP });
      const body = torso(c, DEEP, RUST);
      pecs(c, body, DEEP);
      singlet(c, RUST);
      belt(c, LEATHER, CYAN, 3);
      fighterArms(c, { skin: DEEP, cuff: LEATHER, thick: 1.0 });
      face(c, { skin: SKIN_DEEP, hairAt: () => false });
      beard(c, BLONDE, 4.5, 1.15);
    },
  },
];
export const WARLOCK_PICK: ClassLook[] = [
  {
    n: 'A',
    name: 'Warlock: spiked pauldron',
    paint: (c) => {
      legs(c, COAL, LEATHER, true);
      longCoat(c, COAL, RUST);
      const body = torso(c, COAL, COAL);
      seam(c, body, RUST[3]);
      belt(c, LEATHER, CYAN, 2);
      grimoire(c);
      sleeveArm(c, COAL, SK, 0.6);
      demonArm(c, RUST, { spike: true, plate: STEEL });
      face(c, { hairAt: () => true, hair: RAVEN, shade: 0.2, blind: true });
      for (const turn of EYES) dotOn(c, c.st.part(c.st.near(c.s.head) + 0.9), turn, 0.14, GLINT);
      hood(c, COAL, 0.8);
      horns(c, 'swept', { long: 8, up: 0.8 });
      handFire(c, c.s.handL);
    },
  },
];
/** A leather satchel on his right hip (the side toward the eye), its flap buckled, its strap across him from the left shoulder. */
function sideBag(c: C, body: Sheet): void {
  const { st, s, B } = c;
  const bag = off(s.hipR, s.hips, 1.6, -B.pelvisHalf * 0.4 - 4.2, -3.0);
  const layer = st.part(st.near(bag) + 1.5);
  ball(layer, st, bag, [mul(s.hips[0], 4.2), mul(s.hips[1], 2.4), [0, 0, 4.0]], BROWN);
  ball(layer, st, add(bag, [0, 0, 1.6]), [mul(s.hips[0], 4.4), mul(s.hips[1], 2.6), [0, 0, 1.8]], LEATHER);
  const [bx, by] = st.at(add(bag, [0, 0, 0.6]));
  layer.mark(Math.round(bx), Math.round(by), BRASS[3]);
  layer.mark(Math.round(bx) - 1, Math.round(by), BRASS[2]);
  // (a vial's neck and a sprig sticking out of it)
  const top = add(bag, [0, 0, 4.4]);
  rod(st.part(st.near(top) + 1.2), st, add(top, [0, 0, -1]), add(top, [0, 0, 1.6]), 0.7, 0.6, [SPARK[1], SPARK[1], SPARK[2], SPARK[3], SPARK[3]]);
  strap(c, body, LEATHER, true);
}
/** The goggled bomber with the tinkerer's red ponytail: `kit` his belt of vials and bandolier of vials, or a satchel at his side. */
function bomberPick(kit: 'vials' | 'satchel'): (c: C) => void {
  return (c) => {
    trousers(c, NIGHT, LEATHER, { wide: 0.5 });
    const body = torso(c, LEATHER, NIGHT);
    if (kit === 'vials') {
      strap(c, body, BROWN, false, (at, i) => vial(c, at, [SPARK, LEAF, ROBE][i % 3]), 5);
      bottleBelt(c, BROWN, [SPARK, ROBE, LEAF], 4, CYAN);
    } else {
      belt(c, BROWN, CYAN, 2);
      sideBag(c, body);
    }
    fighterArms(c, { skin: SK, sleeve: LEATHER, to: 1.6, wrap: null, thick: 0.1, fist: LEATHER });
    const hd = face(c, { hairAt: drawnBack, hair: WINE, paint: masked(TEAL), mouth: null });
    goggles(c, hd, false);
    pony(c, WINE, 10);
    flask(c, c.s.handR, SPARK, 2.3);
  };
}
export const APOTHECARY_PICKS: ClassLook[] = [
  { n: 'B', name: 'Apothecary: vials', paint: bomberPick('vials') },
  { n: 'B', name: 'Apothecary: satchel', paint: bomberPick('satchel') },
];

void [CYAN, curtain, fringe, rope, streak, tresses, satchel, MOSS, GREY, collar, hidden, thread, braid, PINK, BRASS, brimHat];

/** The class sheets: which body, which stance, which looks. */
export const CLASSES = {
  brawler: { title: 'The brawler', body: BRAWLER_BODY, bodyF: BRAWLER_F_BODY, pose: guardOf, looks: BRAWLERS },
  warlock: { title: 'The warlock', body: WARLOCK_BODY, bodyF: WARLOCK_F_BODY, pose: castOf, looks: WARLOCKS },
  apothecary: { title: 'The apothecary', body: APOTHECARY_BODY, bodyF: APOTHECARY_F_BODY, pose: throwOf, looks: APOTHECARIES },
  brawler2: { title: 'The brawler: more like 3', body: BRAWLER_BODY, bodyF: BRAWLER_F_BODY, pose: guardOf, looks: BRAWLERS2 },
  warlock2: { title: 'The warlock: more like 1 and 2', body: WARLOCK_BODY, bodyF: WARLOCK_F_BODY, pose: castOf, looks: WARLOCKS2 },
  apothecary2: { title: 'The apothecary: more like 2, 3 and 7', body: APOTHECARY_BODY, bodyF: APOTHECARY_F_BODY, pose: throwOf, looks: APOTHECARIES2 },
  brawler3: { title: 'The brawler', body: BRAWLER_BODY, bodyF: BRAWLER_F_BODY, pose: guardOf, looks: BRAWLER_PICK },
  warlock3: { title: 'The warlock', body: WARLOCK_BODY, bodyF: WARLOCK_F_BODY, pose: castOf, looks: WARLOCK_PICK },
  apothecary3: { title: 'The apothecary', body: APOTHECARY_BODY, bodyF: APOTHECARY_F_BODY, pose: throwOf, looks: APOTHECARY_PICKS },
} as const;
export type ClassId = keyof typeof CLASSES;

/** One look of a class, standing as its class stands. */
export function paintClassLook(id: ClassId, k: number, view: GameView = 'front', pose?: Bones): Painted {
  const cl = CLASSES[id];
  const look = cl.looks[k];
  const B = look.f ? cl.bodyF : cl.body;
  const q = (pose ?? cl.pose(B)) as Posed;
  const s = solve(B, q);
  plainly(true);
  const st = stage(view);
  look.paint(ctxOf(st, s, q, B));
  plainly(false);
  return { px: st.whole(FRIEND_RIM), lights: [], tails: [] };
}
