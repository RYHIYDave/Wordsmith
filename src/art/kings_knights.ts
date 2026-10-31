// FLOOR 19'S KING'S KNIGHTS (the art chat, 29 Oct 2026). A MOCK-UP: NOT IN THE GAME. Nothing of the game imports this
// file; `KNIGHTS_ON` is off. Their moves are art/kings_knights_moves.ts; what their blows leave on the floor,
// art/kings_knights_fx.ts.
//
// His doc's floor 19, THE KEEP: the old castle at the hill's crown, where the king lies dying; its palette cold stone,
// royal blue and old gold; from Andersen's "The Nightingale" (1843), only from the book. The floor's plan, approved by
// him: "Enemies: the king's knights, still loyal and silent in their armour, crossbowmen on the walls, and the Silent
// Order's last."
//
// HIS BRIEF, first offered as a pop-up ("THE KING'S KNIGHTS (medium, two attacks): still loyal, silent in their armour.
// How should they move?"); his first pick, “Quick for their armour”, built and approved (“Yes, that's them
// (Recommended)”). THEN HIS CHANGE, 30 Oct, asked how they should change so they are not just another armoured guard:
// “Huge and slow, one each”, offered as "Fewer and much bigger: one or two at a time, a head and a half taller than you,
// a huge two-handed sword, slow, wide sweeping blows." It replaces “Quick for their armour”.
//
// WHO THEY ARE NOW: the old king's knights, a head and a half taller than the knight and far broader (massive layered
// pauldrons, a deep chest, thick legs), in old heavy plate: a GREAT HELM, a flat-topped barrel of steel with a flat face
// plate, a cross of old gold over its face (the sight's slits either side of its upright, its brow band across), its
// breaths pierced on the right cheek, the dull pink of the Hushed in the dark of the sight, and on its crown A SMALL
// CIRCLET OF OLD GOLD (the king's own crown, “his golden crown”, the book's); couters and poleyns with their fans,
// gauntlets, greaves, pointed sabatons. Over the plate A SURCOAT OF ROYAL BLUE to the knee, split before and behind,
// bordered in old gold, the royal swan in gold on its breast (his pick for the King's mark, “Keep the royal swan”); a
// sword belt with a gold buckle. NO SHIELD: A GREATSWORD in both hands, as long as the knight is tall, its long grip
// wound in leather, a broad steel cross with gold ends, a pear pommel of old gold. Cold steel, royal blue, old gold:
// nothing glows but the Hush's dull pink; the royal blue is well clear of the friend's cyan (its hue 226 to 228
// degrees; cyan is 160 to 205). Alive, not undead. Unlike the King himself (floor 19's boss: twice the knight's height,
// old and gaunt and bearded, a mantle, the Hush riding his back): younger men, faceless in their helms, no mantle, no
// rider, smaller than he.

import { HUSH } from './crier';
import { BREATH_PALE, hushBreath, hushLeaves, lagOf } from './hushed';
import { INK, hash } from './kit';
import type { Ramp } from './kit';
import { FLAME } from './mkit';
import { sphere } from './new_mobs3';
import type { Bit, MobCanvas, Moment, Put } from './new_mobs3';
import { wornOn } from './skin';
import type { Ring, Stage } from './skin';
import { add, buildOf, cross, dot, heading, lerp3, mul, norm, sub } from './skeleton';
import type { Build, Posed, Skeleton, V3 } from './skeleton';

/** THE SWITCH, OFF. Nothing of the game reads this file. */
export const KNIGHTS_ON = { on: false };

const fr = (t: number): number => t - Math.floor(t);
const clamp01 = (v: number): number => Math.max(0, Math.min(1, v));
const D = Math.PI / 180;
const len3 = (v: V3): number => Math.hypot(v[0], v[1], v[2]);

// =============================================================================================
// THEIR COLOURS: cold old steel; the king's royal blue and old gold

/** Old plate, cold and dark, a step duller than the palace guard's polish. */
export const STEEL: Ramp = ['#1a1d27', '#1a1d27', '#525a6c', '#7e879a', '#adb5c5'];
const STEEL_DARK: Ramp = ['#14161e', '#14161e', '#3c4250', '#5a6172', '#727a8c'];
/** The royal blue of their surcoats (hue about 227 degrees: never the friend's cyan). */
export const BLUE: Ramp = ['#0e1230', '#141a40', '#22306e', '#33479a', '#4a62b8'];
/** Old gold: worn and dull, never glowing. */
export const GOLD: Ramp = ['#2a1e0c', '#3e2e12', '#6e5424', '#9a7a3a', '#bc9c54'];
const LEATHER: Ramp = ['#1a120e', '#1a120e', '#3e2c20', '#56402e', '#56402e'];
const MAIL: Ramp = ['#14161c', '#14161c', '#353a46', '#4e5462', '#4e5462'];

// =============================================================================================
// THE BODY: a head and a half taller than the knight (58 tall, his head about 10), and far broader: his shoulders half as
// wide again as the knight's, a deep chest, thick limbs

export const KNIGHT_BODY: Build = buildOf(74, 1.15, { shoulders: 1.55, chest: 1.45, depth: 1.3, waist: 1.3, hips: 1.25, arms: 1.08, trunk: 1.0, limbs: 1.4, pad: 1.9 });
const KB = KNIGHT_BODY;
/** His picture: room for the greatsword raised high over him and brought down before him, and swept round him. */
export const KN_CANVAS: MobCanvas = { w: 400, h: 340, ax: 200, ay: 236 };

// =============================================================================================
// THE GREATSWORD: as long as the knight is tall; the right fist under the cross, the left on the grip behind it

/** From the right fist: the cross before it; the blade's length; the pommel behind it; where the left hand holds the grip (along it toward the pommel). Pommel to point, 58.5 (and the pommel itself): the knight is 58 tall. */
export const SWORD = { cross: 2.0, blade: 46, pommel: 10.5, lower: -5.6 } as const;
/** The sword as it is at a moment: the pommel, the cross, the point, the way it points and its flat across; the middle of the blade's edge. */
export function swordOf(s: Skeleton): { pommel: V3; cross: V3; tip: V3; way: V3; across: V3; mid: V3 } {
  const way = s.point;
  const across = norm(sub(s.across, mul(way, dot(s.across, way))), [0, 1, 0]);
  const crossAt = add(s.handR, mul(way, SWORD.cross));
  const tip = add(crossAt, mul(way, SWORD.blade));
  return { pommel: add(s.handR, mul(way, -SWORD.pommel)), cross: crossAt, tip, way, across, mid: add(crossAt, mul(way, SWORD.blade * 0.62)) };
}
function sword(put: Put, s: Skeleton, glint: number): void {
  const w = swordOf(s);
  const side = norm(cross(w.way, w.across), [0, 0, 1]);
  // the long grip, wound in leather, a steel ring between the hands; the pear pommel, old gold
  put('hilt', 'sword', { k: 'rod', a: add(w.pommel, mul(w.way, 1.2)), b: add(w.cross, mul(w.way, -0.5)), ra: 1.0, rb: 0.9, ramp: LEATHER });
  put('hilt', 'sword', { k: 'ball', c: add(s.handR, mul(w.way, -3.4)), ax: [mul(w.way, 0.7), mul(w.across, 1.35), mul(side, 1.35)], skin: STEEL });
  put('hilt', 'sword', { k: 'ball', c: w.pommel, ax: [mul(w.way, 1.9), mul(w.across, 1.75), mul(side, 1.75)], skin: (u, tone) => (u[0] < -0.55 || Math.hypot(u[1], u[2]) < 0.35 ? GOLD[Math.min(4, tone + 1)] : GOLD[tone]) });
  // the broad cross, steel, its ends swept toward the blade and capped in gold
  put('hilt', 'sword', { k: 'rod', a: add(w.cross, mul(w.across, -7.4)), b: add(w.cross, mul(w.across, 7.4)), ra: 0.95, rb: 0.95, ramp: STEEL });
  for (const k of [-1, 1]) put('hilt', 'sword', { k: 'ball', c: add(add(w.cross, mul(w.across, k * 7.8)), mul(w.way, 0.7)), ax: sphere(1.15), skin: GOLD });
  put('hilt', 'sword', { k: 'ball', c: add(w.cross, mul(w.way, 0.7)), ax: [mul(w.way, 1.1), mul(w.across, 2.0), mul(side, 1.1)], skin: STEEL });
  // the blade: broad at the cross, a plain ricasso, tapering to a hard point; its fuller dark down the middle, its edges ground bright
  put('blade', 'sword', {
    k: 'panel',
    c: add(w.cross, mul(w.way, SWORD.blade / 2)),
    u: mul(w.across, 2.5),
    v: mul(w.way, SWORD.blade / 2),
    skin: (a0, b0, _front, tone0) => {
      const tone = Math.max(2, tone0);
      const b = b0 / (SWORD.blade / 2);
      const wdt = b < -0.82 ? 0.78 : b < 0.6 ? 1 - 0.28 * (b + 0.82) / 1.42 : 0.72 * (1 - (b - 0.6) / 0.4);
      const a = Math.abs(a0) / 2.5;
      if (a > wdt) return null;
      if (b < -0.82) return STEEL[Math.max(2, tone - (a > 0.55 ? 1 : 0))];
      if (a > wdt - 0.24) return STEEL[Math.min(4, tone + 1)];
      if (a < 0.14 && b < 0.5) return STEEL_DARK[Math.max(1, tone - 1)];
      return STEEL[tone];
    },
  });
  if (glint > 0.05) put('glint', 'sword', { k: 'glow', p: w.mid, c: FLAME[1], r: 7 + 8 * glint, a: 0.5 * glint });
}

/**
 * THE ROYAL CREST: the royal swan, its wings raised, its neck in its S, its head turned to its left (the crest floor 16's
 * palace guard wear, art/palace_guard.ts `swanCrest`, the same mark: his pick for the King's own, “Keep the royal swan”),
 * here in old gold on the king's royal blue. `a` across the crest and `b` up it, from -1 to 1. Inside it: true.
 */
export function swanIn(a: number, b: number): boolean {
  const e = (x: number, y: number, cx: number, cy: number, rx: number, ry: number): boolean => ((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2 <= 1;
  if (e(a, b, 0.12, -0.5, 0.62, 0.26)) return true;
  if (e(a, b, 0.68, -0.32, 0.16, 0.12)) return true;
  if (b > -0.5 && e(a, b, 0.28, -0.12, 0.42, 0.42)) {
    const notch = b > 0.12 && Math.abs(((a - 0.28) * 4 + 8) % 1 - 0.5) < 0.12;
    if (!notch) return true;
  }
  for (let i = 0; i <= 12; i++) {
    const t = i / 12;
    const x = -0.36 - 0.16 * Math.sin(Math.PI * 1.6 * t) + 0.06 * t;
    const y = -0.38 + 0.98 * t;
    if (Math.hypot(a - x, b - y) < 0.1 - 0.02 * t) return true;
  }
  if (e(a, b, -0.28, 0.62, 0.14, 0.11)) return true;
  if (b < 0.64 && b > 0.52 && a < -0.38 && a > -0.62 + (0.64 - b) * 0.6) return true;
  return false;
}

// =============================================================================================
// HIM AS SOLIDS

/** An arm in plate: the pauldron's layered lames over the shoulder, edged gold; the rerebrace; the couter and its fan; the vambrace; the gauntlet, its flared cuff and its fingers of plate. */
function arm(put: Put, s: Skeleton, side: 'L' | 'R', cu: V3, curl: number): void {
  const sh = side === 'L' ? s.shoulderL : s.shoulderR;
  const el = side === 'L' ? s.elbowL : s.elbowR;
  const hand = side === 'L' ? s.handL : s.handR;
  const [r0, r1, r2] = KB.armR;
  const fore = norm(sub(hand, el), [0, 0, -1]);
  const upper = norm(sub(el, sh), [0, 0, -1]);
  const out = norm(sub(sh, lerp3(s.shoulderL, s.shoulderR, 0.5)), s.chest[1]);
  // (mail at the armpit, under the plate)
  put(`arm${side}`, `arm${side}`, { k: 'ball', c: lerp3(sh, el, 0.18), ax: sphere(r0 * 1.12), skin: MAIL, far: true });
  put(`arm${side}`, `arm${side}`, { k: 'rod', a: lerp3(sh, el, 0.2), b: el, ra: r0 * 1.2, rb: r1 * 1.2, ramp: STEEL, far: true });
  // THE PAULDRON: a domed cap over the shoulder, a raised ridge over it; under it three lames stepping down the arm,
  // each a little wider and further out, each one's lower edge in shadow; the last edged in old gold
  const cup = add(sh, add(mul(cu, 1.3), mul(out, 1.4)));
  // (its own ways, square to each other whatever the arm does: down the arm, out from it, and across it)
  const outA = norm(sub(out, mul(upper, dot(out, upper))), norm(cross(upper, s.chest[0]), out));
  const across = norm(cross(upper, outA), s.chest[0]);
  const upD = norm(sub(cu, mul(out, dot(cu, out))), [0, 0, 1]);
  const acrossD = norm(cross(out, upD), s.chest[0]);
  const lames: [number, number, number, number][] = [[1, 2.6, 1.0, 0.6], [2, 4.8, 1.08, 1.1], [3, 7.0, 1.14, 1.55]];
  for (const [i, down, r, outBy] of lames) {
    const c = add(cup, add(mul(upper, down), mul(out, outBy - 0.5)));
    put(`arm${side}`, `pauldron${side}`, {
      k: 'ball',
      c,
      ax: [mul(across, r0 * 1.7 * r), mul(outA, r0 * 1.6 * r), mul(upper, -r0 * 0.8)],
      skin: (u, tone) => {
        // (a band: its top tucked under the lame above, its lower edge rolled and dark, the last one's gold)
        if (u[2] < -0.42 || u[2] > 0.55) return null;
        if (u[2] < -0.18) return i === 3 ? GOLD[Math.max(2, Math.min(4, tone))] : STEEL_DARK[Math.max(1, tone - 1)];
        return STEEL[Math.min(4, tone + (u[2] > 0.3 ? 1 : 0))];
      },
      far: true,
    });
  }
  put(`arm${side}`, `pauldron${side}`, {
    k: 'ball',
    c: cup,
    ax: [mul(acrossD, r0 * 1.8), mul(out, r0 * 1.7), mul(upD, r0 * 1.15)],
    skin: (u, tone) => (u[2] < -0.25 ? null : u[2] < -0.08 ? STEEL_DARK[Math.max(1, tone - 1)] : STEEL[Math.abs(u[0]) < 0.11 && u[2] > 0.1 ? Math.min(4, tone + 1) : tone]),
    far: true,
  });
  // THE COUTER: a cop over the elbow, its fan on the outside
  put(`fore${side}`, `couter${side}`, { k: 'ball', c: el, ax: sphere(r1 * 1.35), skin: STEEL, far: true });
  const fanOut = norm(sub(out, mul(fore, dot(out, fore))), out);
  put(`fore${side}`, `couter${side}`, { k: 'ball', c: add(el, mul(fanOut, r1 * 1.1)), ax: [mul(fanOut, 0.7), mul(norm(cross(fore, fanOut), [0, 0, 1]), r1 * 1.7), mul(fore, r1 * 1.5)], skin: (u, tone) => STEEL[Math.abs(u[1]) > 0.8 ? Math.max(1, tone - 1) : tone], far: true });
  const wrist = add(hand, mul(fore, -1.4));
  put(`fore${side}`, `fore${side}`, { k: 'rod', a: el, b: wrist, ra: r1 * 1.2, rb: r2 * 1.25, ramp: STEEL, far: true });
  // THE GAUNTLET: a flared cuff, the back of the hand in plate, the fingers in their lames
  put(`fore${side}`, `cuff${side}`, { k: 'rod', a: add(wrist, mul(fore, -2.4)), b: add(wrist, mul(fore, 0.5)), ra: r2 * 1.35, rb: r2 * 1.75, ramp: STEEL, far: true });
  const e1 = norm(sub(cu, mul(fore, dot(cu, fore))), [0, 0, 1]);
  const e2 = norm(cross(fore, e1), [0, 1, 0]);
  put(`hand${side}`, `hand${side}`, { k: 'ball', c: add(hand, mul(fore, 0.4)), ax: [mul(fore, 2.0), mul(e2, 1.85), mul(e1, 1.25)], skin: STEEL_DARK, far: true });
  for (let i = 0; i < 4; i++) {
    const spread = (i - 1.5) * 0.4;
    const base = add(hand, add(mul(fore, 1.6), mul(e2, spread * 0.95)));
    const mid = add(base, add(mul(fore, 1.5 * (1 - 0.4 * curl)), mul(e1, -1.2 * curl)));
    const tip = add(mid, add(mul(fore, 1.1 * (1 - 0.8 * curl)), mul(e1, -1.4 * curl)));
    put(`hand${side}`, `finger${side}`, { k: 'rod', a: base, b: mid, ra: 0.66, rb: 0.58, ramp: STEEL_DARK, far: true });
    put(`hand${side}`, `finger${side}`, { k: 'rod', a: mid, b: tip, ra: 0.58, rb: 0.45, ramp: STEEL_DARK, far: true });
  }
}
/** A leg in plate: the cuisse over the thigh; the poleyn and its fan at the knee; the greave; the pointed sabaton. */
function leg(put: Put, s: Skeleton, side: 'L' | 'R'): void {
  const hip = side === 'L' ? s.hipL : s.hipR;
  const knee = side === 'L' ? s.kneeL : s.kneeR;
  const ankle = side === 'L' ? s.ankleL : s.ankleR;
  const heel = side === 'L' ? s.heelL : s.heelR;
  const toe = side === 'L' ? s.toeL : s.toeR;
  const [rH, rK, rA] = KB.legR;
  const thigh = norm(sub(knee, hip), [0, 0, -1]);
  const shin = norm(sub(ankle, knee), [0, 0, -1]);
  // (the knee's own ways: out before it, about the hips' left, which a leg swings round: never folding flat)
  const before = norm(cross(thigh, s.hips[1]), s.hips[0]);
  const lat = norm(cross(before, thigh), s.hips[1]);
  put(`leg${side}`, `leg${side}`, { k: 'rod', a: hip, b: knee, ra: rH * 1.12, rb: rK * 1.15, ramp: STEEL, far: true });
  // (the cuisse's lames: a darker line across it every few lengths)
  for (const k of [0.3, 0.55]) put(`leg${side}`, `lame${side}`, { k: 'band', ring: { c: lerp3(hip, knee, k), u: mul(before, rH * 1.16), v: mul(lat, rH * 1.16) }, ramp: STEEL_DARK, rows: 1 });
  // THE POLEYN: a cop over the knee, its fan out to the side
  const kc = add(knee, mul(before, 0.6));
  put(`leg${side}`, `poleyn${side}`, { k: 'ball', c: kc, ax: [mul(before, rK * 1.1), mul(lat, rK * 1.4), mul(lerp3(thigh, shin, 0.5), -rK * 1.3)], skin: (u, tone) => STEEL[u[0] > 0.7 ? Math.min(4, tone + 1) : tone], far: true });
  const outSide = mul(lat, side === 'L' ? 1 : -1);
  put(`leg${side}`, `poleyn${side}`, { k: 'ball', c: add(kc, mul(outSide, rK * 1.15)), ax: [mul(outSide, 0.7), mul(before, rK * 1.5), mul(norm(sub(thigh, shin), [0, 0, 1]), rK * 1.5)], skin: STEEL, far: true });
  // (the greave stops short of the ankle by as much as it is thicker than the ankle is high: the sabaton covers it)
  put(`shin${side}`, `shin${side}`, { k: 'rod', a: add(knee, mul(shin, 1.2)), b: add(ankle, mul(shin, -(Math.max(0, rA * 1.32 - KB.ankle) + 0.3))), ra: rK * 1.28, rb: rA * 1.32, ramp: STEEL, far: true });
  // THE SABATON: a pointed foot of plate in lames
  const fwd = norm(sub(toe, heel), [1, 0, 0]);
  const side3 = norm(Math.abs(fwd[2]) < 0.95 ? [-fwd[1], fwd[0], 0] : cross(s.hips[2], fwd), [0, 1, 0]);
  const up3 = norm(cross(fwd, side3), [0, 0, 1]);
  put(`foot${side}`, `foot${side}`, { k: 'ball', c: add(lerp3(heel, toe, 0.48), mul(up3, 1.8)), ax: [mul(fwd, 5.6), mul(side3, 2.3), mul(up3, 1.9)], skin: (u, tone) => STEEL[fr((u[0] + 2) * 2.2) < 0.16 && u[2] > -0.2 ? Math.max(1, tone - 1) : tone], far: true });
}

/** The breastplate under the surcoat: steel from the hips to the throat. */
function cuirassRings(s: Skeleton): Ring[] {
  const [cf, cl] = s.chest;
  const be = s.belly;
  const waistC = add(s.pelvis, mul(s.hips[2], KB.waist * 0.5));
  return [
    { c: add(s.pelvis, mul(s.hips[2], -1.0)), u: mul(s.hips[0], KB.pelvisDeep + 2.3), v: mul(s.hips[1], KB.pelvisHalf + 2.3) },
    { c: waistC, u: mul(be[0], KB.waistDeep + 2.5), v: mul(be[1], KB.waistHalf + 2.4) },
    { c: s.ribs, u: mul(cf, KB.ribDeep + 2.8), v: mul(cl, KB.ribHalf + 2.5) },
    { c: lerp3(s.ribs, s.neck, 0.66), u: mul(cf, KB.ribDeep + 1.9), v: mul(cl, KB.shoulderHalf + 0.6) },
  ];
}
/** A ring round both thighs `down` of the way from the hips to the knees, hanging back as he goes (the surcoat's skirts). */
function thighRing(s: Skeleton, down: number, pad: number, lag: V3, flare: number): Ring {
  const f = norm([s.hips[0][0], s.hips[0][1], 0], [1, 0, 0]);
  const l: V3 = [-f[1], f[0], 0];
  const a = lerp3(s.hipL, s.kneeL, down);
  const b = lerp3(s.hipR, s.kneeR, down);
  const c = lerp3(a, b, 0.5);
  const spanF = Math.abs(dot(sub(a, b), f));
  const spanL = Math.abs(dot(sub(a, b), l));
  const rT = KB.legR[0] * 1.3;
  return { c: add(c, mul(lag, 1.0 * down)), u: mul(f, Math.max(KB.pelvisDeep + 2.6, spanF / 2 + rT + 1.4) + pad + flare), v: mul(l, Math.max(KB.pelvisHalf + 2.4, spanL / 2 + rT + 1.2) + pad + flare * 0.5) };
}
/** THE SURCOAT'S BODY: royal blue from the shoulders to the hips, over the breastplate. */
function surcoatRings(s: Skeleton): Ring[] {
  const [cf, cl, cu] = s.chest;
  const be = s.belly;
  const waistC = add(s.pelvis, mul(s.hips[2], KB.waist * 0.5));
  return [
    { c: add(s.pelvis, mul(s.hips[2], -1.4)), u: mul(s.hips[0], KB.pelvisDeep + 3.0), v: mul(s.hips[1], KB.pelvisHalf + 2.9) },
    { c: waistC, u: mul(be[0], KB.waistDeep + 3.0), v: mul(be[1], KB.waistHalf + 2.8) },
    { c: s.ribs, u: mul(cf, KB.ribDeep + 3.3), v: mul(cl, KB.ribHalf + 2.9) },
    { c: lerp3(s.ribs, s.neck, 0.7), u: mul(cf, KB.ribDeep + 2.4), v: mul(cl, KB.shoulderHalf + 0.8) },
    { c: add(s.neck, mul(cu, -0.6)), u: mul(cf, 4.9), v: mul(cl, 5.6) },
  ];
}
/** THE SURCOAT'S SKIRTS: from the hips to the knee, split before and behind (for the saddle), each flying back as he goes. */
function skirtRings(s: Skeleton, lag: V3, flare: number): Ring[] {
  return [
    thighRing(s, 0.98, 1.4, lag, flare * 1.6),
    thighRing(s, 0.62, 1.2, lag, flare),
    thighRing(s, 0.25, 1.0, lag, flare * 0.4),
    { c: add(s.pelvis, mul(s.hips[2], -1.4)), u: mul(s.hips[0], KB.pelvisDeep + 3.1), v: mul(s.hips[1], KB.pelvisHalf + 3.0) },
  ];
}
/** A point round a ring, `deg` round from its first line, `out` beyond it. */
function onRing(r: Ring, deg: number, out: number): V3 {
  const t = deg * D;
  return add(r.c, add(mul(r.u, Math.cos(t) * (1 + out / len3(r.u))), mul(r.v, Math.sin(t) * (1 + out / len3(r.v)))));
}
/** The royal swan in old gold on the surcoat's breast: painted on a thin shell just proud of the cloth. */
function charge(put: Put, s: Skeleton): void {
  const [cf, cl, cu] = s.chest;
  const c = add(lerp3(s.ribs, s.neck, 0.18), mul(cf, KB.ribDeep + 3.75));
  put('charge', 'charge', { k: 'ball', c, ax: [mul(cf, 1.4), mul(cl, -6.4), mul(cu, 6.4)], skin: (u, tone) => (u[0] > 0.15 && swanIn(u[1], u[2]) ? GOLD[tone >= 2 ? 4 : 3] : null) });
}

/**
 * THE GREAT HELM: a barrel of steel over the whole head, a little narrower at its flat top; its face a flat plate with a
 * cross of old gold over it (the sight's two slits either side of its upright, the brow band across over them), the
 * breaths pierced on the right cheek; the dull pink of the Hushed in the dark of the sight; and round its crown the small
 * circlet of old gold, five points standing up off it. Returns where the Hush leaks out of the sight, and the helm's ways.
 */
function head(put: Put, st: Stage, s: Skeleton, lit: number): { sight: V3; ff: V3; fl: V3; fu: V3; top: V3 } {
  const [ff, fl, fu] = wornOn(st, s, 8);
  const hc = add(s.head, mul(fu, 0.1));
  const HD = KB.headR[0] * 1.17;
  const HW = KB.headR[1] * 1.36;
  const lo = -KB.headR[2] * 1.3;
  const hi = KB.headR[2] * 1.12;
  const ring = (z: number, k: number): Ring => ({ c: add(hc, mul(fu, z)), u: mul(ff, HD * k), v: mul(fl, HW * k) });
  // the barrel, a little flared at its foot and narrower at its top
  put('helm', 'helm', { k: 'cloth', rings: [ring(lo, 1.05), ring(lo * 0.4, 1.02), ring(hi * 0.5, 1.0), ring(hi, 0.93)], ramp: STEEL, look: { folds: [0], lift: 0.02 } });
  // its flat top
  put('helm', 'helm', { k: 'ball', c: add(hc, mul(fu, hi)), ax: [mul(ff, HD * 0.93), mul(fl, HW * 0.93), mul(fu, 0.8)], skin: (u, tone) => STEEL[u[2] > 0.5 ? Math.min(4, tone + 1) : tone] });
  // ITS FACE, drawn on the barrel's front: the gold cross over it, the sight's slits, the breaths, the plate's edge
  const SLIT = 1.6;
  const zc = (lo + hi) / 2 - 0.2;
  const kAt = (z: number): number => (z < lo * 0.4 ? 1.05 + (1.02 - 1.05) * (z - lo) / (lo * 0.4 - lo) : z < hi * 0.5 ? 1.02 + (1.0 - 1.02) * (z - lo * 0.4) / (hi * 0.5 - lo * 0.4) : 1.0 + (0.93 - 1.0) * (z - hi * 0.5) / (hi * 0.5));
  const W = HW * 0.8;
  const faceCol = (a: number, b: number): string | null => {
    const x = Math.abs(a);
    // (the sight: two slits either side of the cross's upright)
    if (Math.abs(b - SLIT) < 0.55 && x > 0.85 && x < W - 0.6) return INK;
    // (the cross of old gold: its upright down the middle, the brow band across over the sight)
    if (x < 0.85 && b < SLIT + 2.0 && b > -4.8) return x < 0.35 ? GOLD[4] : GOLD[3];
    if (b > SLIT + 0.55 && b < SLIT + 1.6 && x < W) return GOLD[3];
    // (the breaths, pierced on his right cheek)
    if (a < -1.5 && a > -W + 0.6 && b < SLIT - 1.7 && b > -3.9 && fr(a * 0.9 + 0.25) < 0.45 && fr(b * 0.9 + 0.25) < 0.45) return INK;
    // (the face plate's edge, a darker lip round it)
    if ((x > W - 0.45 && x < W + 0.2 && b < SLIT + 2.2 && b > -5.6) || (Math.abs(b + 5.6) < 0.35 && x < W)) return STEEL_DARK[2];
    return null;
  };
  for (let b = -6.0; b <= SLIT + 2.4; b += 0.42) {
    const z = zc + b;
    const k = kAt(z);
    for (let a = -W - 0.2; a <= W + 0.2; a += 0.42) {
      const c = faceCol(a, b);
      if (!c) continue;
      const yy = a / (HW * k);
      if (Math.abs(yy) >= 0.98) continue;
      const xx = Math.sqrt(1 - yy * yy);
      const p = add(hc, add(mul(ff, HD * k * xx * 1.02), add(mul(fl, a), mul(fu, z))));
      const nrm = norm(add(mul(ff, xx / (HD * k)), mul(fl, yy / (HW * k))), ff);
      put('helm', 'face', { k: 'dot', p, c, facing: nrm });
    }
  }
  // the eyes: the cult's dull pink in the dark of the sight (going out as the Hush leaves him)
  for (const k of [-1, 1]) {
    const yy = (k * HW * 0.42) / (HW * kAt(zc + SLIT));
    const e = add(hc, add(mul(ff, HD * kAt(zc + SLIT) * Math.sqrt(1 - yy * yy) * 1.02), add(mul(fl, k * HW * 0.42), mul(fu, zc + SLIT))));
    put('helm', 'eyes', { k: 'dot', p: e, c: lit > 0.4 ? FLAME[1] : '#2a1e24', facing: ff, c2: lit > 0.4 ? FLAME[2] : '#2a1e24' });
  }
  // THE CIRCLET OF OLD GOLD round its crown, five points standing up off it, the one before taller
  const top = add(hc, mul(fu, hi - 0.6));
  put('crown', 'crown', { k: 'band', ring: { c: top, u: mul(ff, HD * 0.97), v: mul(fl, HW * 0.97) }, ramp: GOLD, rows: 2 });
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2;
    const base = add(top, add(mul(ff, Math.cos(a) * HD * 0.95), mul(fl, Math.sin(a) * HW * 0.95)));
    const tall = i === 0 ? 3.3 : 2.5;
    const tipP = add(base, add(mul(fu, tall), add(mul(ff, Math.cos(a) * 0.4), mul(fl, Math.sin(a) * 0.4))));
    put('crown', 'crown', { k: 'rod', a: base, b: tipP, ra: 0.95, rb: 0.35, ramp: GOLD });
    put('crown', 'crown', { k: 'ball', c: add(tipP, mul(fu, 0.4)), ax: sphere(0.62), skin: GOLD });
  }
  const sight = add(hc, add(mul(ff, HD * 1.12), mul(fu, (lo + hi) / 2 - 0.2 + SLIT)));
  return { sight, ff, fl, fu, top };
}

/** The Hush leaking out of him at each moment, laid after his edge (Mob.grains). */
const BREATH = new WeakMap<Moment, [V3, string, number][]>();
/** THE HUSH SEEPING OUT OF THE SIGHT'S ENDS: short grey wisps pushed out of the dark either side of the face, curling up past the helm; more and further as he winds up a blow (`hard`, 0 to 1). */
function slitSeep(put: Put, at: V3, out: V3, ff: V3, t: number, seed: number, hard: number): void {
  const N = Math.round(7 + 7 * hard);
  for (let i = 0; i < N; i++) {
    const life = fr(t * (0.8 + 0.6 * hard) + i / N + 0.17 * hash(i, seed, 7711));
    if (life > 0.55 + 0.4 * hard) continue;
    const curl = life * 5 + seed;
    const p = add(at, add(mul(out, (0.6 + life * (2.6 + 2.8 * hard)) * (0.8 + 0.4 * hash(i, seed, 7712))), add(mul(ff, 0.6 + Math.sin(curl) * (0.4 + life * 1.4)), [0, 0, life * (6 + 7 * hard)])));
    const c = life < 0.2 ? BREATH_PALE : life < 0.45 ? HUSH[4] : HUSH[3];
    put('hush', 'hush', { k: 'mote', p, c, size: life < 0.3 ? 3 : 2 });
  }
}

/** What a moment of a move says of him over and above the bones. */
export interface KnightSay {
  /** Whether his sword has fallen from his hands (as he dies). */
  dropped: (m: Moment) => boolean;
  /** How hard the Hush comes out of him (0 to 1: harder as he winds up a blow). */
  hard?: (m: Moment) => number;
  /** THE SMEAR OF A LIGHTNING STRIKE (his Movement 9): after-images of what strikes along the way it has just come, each a line of points, the oldest first. */
  smear?: (m: Moment) => V3[][] | null;
  /** Grains of his own move laid after his edge (the blade's pink glints in a warning). */
  more?: (m: Moment) => [V3, string, number][];
}
/** The smear's after-images: the oldest a cold steel blue, the newest near white (no cyan: their hue about 228 degrees, and pale). */
export const SMEAR = ['#4c5680', '#a4accc', '#eceef8'] as const;

function knightBits(st: Stage, m: Moment, say: KnightSay): Bit[] {
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
  const lag = lagOf(m, 1.4, 5.0);
  const held = !say.dropped(m);
  for (const side of ['L', 'R'] as const) leg(put, s, side);
  // THE BREASTPLATE, and the fauld's lames below it at the hips
  put('body', 'cuirass', { k: 'cloth', rings: cuirassRings(s), ramp: STEEL, look: { folds: [0], lift: 0.02 } });
  // THE SURCOAT: its body over the breastplate; its skirts before and behind, flying back as he goes
  put('surcoat', 'surcoat', { k: 'cloth', rings: surcoatRings(s), ramp: BLUE, look: { folds: [0, 35, -35, 90, -90, 145, -145, 180], lift: 0.04 } });
  const flare = Math.min(2.4, len3(lag) * 0.35);
  const sk = skirtRings(s, lag, flare);
  for (const [a0, a1] of [[300, 420], [120, 240]] as const) {
    put('skirt', 'surcoat', { k: 'cloth', rings: sk, ramp: BLUE, look: { folds: [(a0 + a1) / 2 - 360 * Math.floor(((a0 + a1) / 2) / 360), (a0 + a1) / 2 - 30, (a0 + a1) / 2 + 30], lift: 0.06, arc: [a0, a1] } });
    // its border of old gold: down each edge of the split, and along the hem
    for (const deg of [a0 + 1.5, a1 - 1.5]) for (let i = 0; i + 1 < sk.length - 1; i++) put('skirt', 'border', { k: 'rod', a: onRing(sk[i], deg, 0.35), b: onRing(sk[i + 1], deg, 0.35), ra: 0.72, rb: 0.72, ramp: GOLD });
    for (let d = a0 + 1.5; d < a1 - 1.5; d += 10) put('skirt', 'border', { k: 'rod', a: onRing(sk[0], d, 0.35), b: onRing(sk[0], Math.min(a1 - 1.5, d + 10), 0.35), ra: 0.85, rb: 0.85, ramp: GOLD });
  }
  charge(put, s);
  // the gold border at the surcoat's neck, the gorget over it
  const sc = surcoatRings(s);
  put('neck', 'gorget', { k: 'band', ring: { c: add(s.neck, mul(cu, -0.2)), u: mul(cf, 5.0), v: mul(cl, 5.7) }, ramp: STEEL, rows: 2 });
  put('surcoat', 'border', { k: 'band', ring: { c: sc[4].c, u: mul(sc[4].u, 1.04), v: mul(sc[4].v, 1.04) }, ramp: GOLD, rows: 1 });
  // the sword belt, its gold buckle
  const waistC = add(s.pelvis, mul(s.hips[2], KB.waist * 0.42));
  const belt: Ring = { c: waistC, u: mul(s.belly[0], KB.waistDeep + 3.35), v: mul(s.belly[1], KB.waistHalf + 3.15) };
  put('surcoat', 'belt', { k: 'band', ring: belt, ramp: LEATHER, rows: 1 });
  put('surcoat', 'buckle', { k: 'ball', c: onRing(belt, 0, 0.5), ax: [mul(s.belly[0], 0.7), mul(s.belly[1], 1.5), mul(s.belly[2], 1.2)], skin: GOLD });
  // the arms: the right fist closed round the grip; the left round it too, or loose
  arm(put, s, 'L', cu, q.lhIn === 3 ? 1 : 0.6);
  arm(put, s, 'R', cu, held ? 1 : 0.45);
  put('neck', 'neck', { k: 'rod', a: add(s.neck, mul(cu, -1.5)), b: lerp3(s.neck, s.head, 0.45), ra: 3.2, rb: 3.0, ramp: MAIL });
  const hd = head(put, st, s, lit);
  const glint = held ? clamp01(m.glint) : 0;
  sword(put, s, glint);
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
          put('smear', 'smear', { k: 'mote', p: lerp3(line[i - 1], line[i], e / n), c: k > 0.7 ? SMEAR[2] : k > 0.35 ? SMEAR[1] : SMEAR[0], size: k > 0.7 ? 2 : 1 });
        }
      }
    });
  }
  // THE HUSH LEAKING OUT OF THE SIGHT, out of its middle and seeping from its ends; as he dies it pours out in one great breath
  const hard = clamp01(say.hard?.(m) ?? m.glint);
  if (!m.dying || m.t < 0.4) {
    hushBreath(put, add(hd.sight, add(mul(hd.ff, 2.6), mul(hd.fu, 1.2))), hd.ff, hd.fl, m.t, 0.22 + 0.7 * hard, 31);
    slitSeep(put, add(hd.sight, mul(hd.fl, 2.4)), hd.fl, hd.ff, m.t, 31, hard);
    slitSeep(put, add(hd.sight, mul(hd.fl, -2.4)), mul(hd.fl, -1), hd.ff, m.t + 0.41, 36, hard);
  } else if (m.t < KN_EXHALE[1]) {
    hushBreath(put, hd.sight, hd.ff, hd.fl, m.t, Math.max(0, 2.2 * (1 - clamp01((m.t - KN_EXHALE[0]) / 1.3))), 31);
  }
  if (m.dying) hushLeaves(put, hd.sight, hd.ff, hd.fl, m.t, 31, KN_EXHALE[0], KN_EXHALE[1]);
  for (const g of say.more?.(m) ?? []) breath.push(g);
  return bits;
}
/** When the Hush pours out of him as he dies (seconds). */
export const KN_EXHALE: readonly [number, number] = [0.9, 2.5];

/** THE KNIGHT AS THE PAINTER TAKES HIM. */
export function knightPainter(say: KnightSay): { bits: (st: Stage, m: Moment) => Bit[]; grains: (st: Stage, m: Moment) => ReadonlyArray<readonly [V3, string, number]> } {
  return { bits: (st, m) => knightBits(st, m, say), grains: (_st, m) => BREATH.get(m) ?? [] };
}
