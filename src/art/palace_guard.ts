// FLOOR 16'S PALACE GUARD (the art chat, 28 Oct 2026). A MOCK-UP: NOT IN THE GAME. Nothing of the game imports this file;
// `GUARD_ON` is off. Their moves are art/palace_guard_moves.ts.
//
// His doc "Wordsmith Act 2, Part Two: The High City (Levels 16–20)", level 16, THE SWAN GARDENS: its enemies “the Hushed
// gardeners and grooms, the palace guard, and the swans”. His brief for them (his art rulebook, "A new character", and
// sound rule 7), his picks, 28 Oct:
// - who, and what they carry: “1 and 2” (of “Royal guards, partisans (Recommended)”, offered as: the palace's own guard,
//   words stolen, polished breastplates, tall plumed helmets, the royal colours, and a partisan, a long spear with a
//   broad, fancy blade; and “Royal guards, sword and shield”, the same guards with a sword and a tall shield bearing the
//   royal crest). Read as (told him so): two kinds of royal guard mixed in a squad, one with a partisan, one with a sword
//   and a crested shield;
// - how big: “A head taller, fewer (Recommended)” (medium, as the city watch: two attacks each);
// - how they move: “March in step (Recommended)” (stiff and drilled, marching like on parade with no one giving orders);
// - their two attacks: “Long thrust, wide sweep (Recommended)” (a quick reaching thrust; and a big sweep, wound up high,
//   that cuts wide in front of them);
// - what marks them: “Grey breath through visors (Recommended)” (closed helmets hide their faces; the grey breath leaks
//   out of the visor slits, the dull pink eyes behind);
// - their death: “To one knee, then a crash (Recommended)” (the Hush leaves them in a gasp, the weapon drops, they sink
//   to one knee, then topple in a clatter of armour);
// - never: “Not the city watch (Recommended)” (grander than the watch: polished steel, plumes, the royal colours; never
//   the watch's mail and gags);
// - their sound: “Clank and stamp (Recommended)” (armour clanking, boots stamping in step, a ring of steel on each
//   attack; no voices).
//
// WHO THEY ARE: the palace's own guard, a head taller than the knight, their words stolen. Each in a doublet of the royal
// wine, its puffed sleeves and breeches slashed to show white; a polished breastplate, pauldrons and a gorget; steel
// tassets over the thighs; tall black boots; leather gloves. A CLOSED HELMET, its visor down, a slit across the eyes
// (the cult's dull pink in the dark behind it) and the Hush leaking out of it; a tall white plume. THE PARTISAN GUARD
// carries a partisan: an ash shaft, a broad leaf blade with two curled flukes at its foot, a tassel of the royal colours.
// THE SWORD GUARD carries a sword and a heater shield quartered wine and white, rimmed in steel. Nothing cyan.

import { HUSH } from './crier';
import { BREATH_PALE, hushBreath, hushLeaves, lagOf } from './hushed';
import { WATCH_BODY, halberdGrip } from './hushed_watch';
import { INK, hash } from './kit';
import type { Ramp } from './kit';
import { FLAME } from './mkit';
import { sphere } from './new_mobs3';
import type { Bit, MobCanvas, Moment, Put } from './new_mobs3';
import { wornOn } from './skin';
import type { Ring, Stage } from './skin';
import { add, cross, dot, heading, lerp3, mul, norm, sub } from './skeleton';
import type { Bones, Skeleton, V3 } from './skeleton';

/** THE SWITCH, OFF. Nothing of the game reads this file. */
export const GUARD_ON = { on: false };

const fr = (t: number): number => t - Math.floor(t);
const clamp01 = (v: number): number => Math.max(0, Math.min(1, v));
const D = Math.PI / 180;
const len3 = (v: V3): number => Math.hypot(v[0], v[1], v[2]);

// =============================================================================================
// THEIR COLOURS: polished steel; the royal wine and white, dulled by the dawn

const STEEL: Ramp = ['#20232b', '#20232b', '#646b78', '#98a0ac', '#c8ced6'];
const EDGE: Ramp = ['#2a2c32', '#2a2c32', '#7a808a', '#aab0b8', '#c6cad0'];
const ROYAL: Ramp = ['#22101a', '#22101a', '#562a3a', '#74404e', '#74404e'];
/** The tabard's wine, a step brighter: the guard's colours, worn proud. */
const TABARD: Ramp = ['#2e1622', '#44202e', '#7a3a4e', '#9c5468', '#b8708a'];
const WHITE: Ramp = ['#46424e', '#46424e', '#9e98a6', '#c6c0ca', '#dcd6dc'];
const LEATHER: Ramp = ['#1a120e', '#1a120e', '#3e2c20', '#56402e', '#56402e'];
const BOOT: Ramp = ['#0c0b0c', '#0c0b0c', '#26201e', '#3a322e', '#3a322e'];
const ASH: Ramp = ['#22180e', '#22180e', '#5a4630', '#7a6244', '#7a6244'];

// =============================================================================================
// THE BODY: as the city watch's, a head taller than the knight

export const GUARD_BODY = WATCH_BODY;
const GB = GUARD_BODY;
/** Their picture: room for the partisan raised high over them and thrust out its whole length. */
export const GUARD_CANVAS: MobCanvas = { w: 380, h: 300, ax: 180, ay: 214 };

/** Who: the partisan guard, the sword guard. */
export type GuardWho = 'partisan' | 'sword';

// =============================================================================================
// THE PARTISAN

/** Its length from the butt to the point of its blade; where its socket is; the blade's foot and widest. */
export const PARTISAN = { long: 86, socket: 64, foot: 66, wide: 70, half: 3.4 } as const;
/** Where their right hand holds it, from the butt: `draw` 0 just above its shoe, 1 high up the shaft. */
export const PARTISAN_HOLD = (draw: number): number => 2 + 44 * clamp01(draw);
/** The partisan as it is at a moment: its butt, the way it runs, the way its blade's flat lies across, a place this far along it, its point, and the middle of its blade (what strikes in a sweep). */
export function partisanOf(s: Skeleton, q: { draw: number }): { butt: V3; way: V3; across: V3; at: (k: number) => V3; tip: V3; blade: V3 } {
  const way = s.point;
  const across = norm(sub(s.across, mul(way, dot(s.across, way))), [0, 1, 0]);
  const butt = add(s.handR, mul(way, -PARTISAN_HOLD(q.draw)));
  const at = (k: number): V3 => add(butt, mul(way, k));
  return { butt, way, across, at, tip: at(PARTISAN.long), blade: at((PARTISAN.foot + PARTISAN.long) / 2) };
}
/** The partisan in their right hand (from their place on the floor), pointing `way`, its blade's flat across `across`, held `draw` of the way up; the left hand `left` further along it (or free). */
export const partisanGrip = halberdGrip;
/** The partisan stood on its butt at their right side, the right hand round it at `z`, leaning `lean` degrees forward. */
export function partisanPlanted(hand: [number, number], z: number, lean: number): Partial<Bones> {
  const el = (90 - lean) * D;
  const way: V3 = [Math.cos(el), 0, Math.sin(el)];
  const hold = (z - 1.05) / way[2];
  return halberdGrip([hand[0], hand[1], z], way, [0, 1, 0], (hold - 2) / 44, null);
}
/** THE PARTISAN: an ash shaft shod in steel; a steel socket; two flukes curled out and up at the blade's foot; the broad leaf blade, its edges ground bright; a tassel of wine and white under it; a pink glint on the blade in the warning. */
function partisan(put: Put, s: Skeleton, q: { draw: number }, lag: V3, glint: number): void {
  const h = partisanOf(s, q);
  const { at, across, way } = h;
  const P = PARTISAN;
  put('staff', 'partisan', { k: 'rod', a: at(0.6), b: at(P.socket), ra: 0.95, rb: 0.88, ramp: ASH });
  put('butt', 'partisan', { k: 'rod', a: h.butt, b: at(3.0), ra: 1.05, rb: 1.0, ramp: STEEL });
  put('socket', 'partisan', { k: 'rod', a: at(P.socket - 1), b: at(P.foot + 0.5), ra: 1.25, rb: 1.05, ramp: STEEL });
  // the flukes: out from the blade's foot either side, curling up toward the point
  for (const k of [-1, 1]) {
    const a0 = add(at(P.foot), mul(across, k * 1.0));
    const a1 = add(at(P.foot - 0.6), mul(across, k * 3.6));
    const a2 = add(at(P.foot + 2.2), mul(across, k * 5.0));
    put('flukes', 'partisan', { k: 'rod', a: a0, b: a1, ra: 0.9, rb: 0.7, ramp: STEEL });
    put('flukes', 'partisan', { k: 'rod', a: a1, b: a2, ra: 0.7, rb: 0.25, ramp: STEEL });
  }
  // the leaf blade: broadest low, tapering to its point; a ridge down its middle
  const mid = (P.foot + P.long) / 2;
  const half = (P.long - P.foot) / 2;
  put('blade', 'partisan', {
    k: 'panel',
    c: at(mid),
    u: mul(across, P.half),
    v: mul(way, half),
    skin: (a0, b0, _front, tone0) => {
      const tone = Math.max(2, tone0);
      const a = Math.abs(a0) / P.half;
      const b = b0 / half;
      // (its outline: from the foot out to its widest a third of the way up, then in to the point)
      const w = b < -0.4 ? 0.45 + 0.55 * (b + 1) / 0.6 : 1 - (b + 0.4) / 1.4;
      if (a > w) return null;
      if (a > w - 0.28) return EDGE[Math.min(4, tone + 1)];
      if (a < 0.12) return STEEL[Math.min(4, tone + 1)];
      return STEEL[tone];
    },
  });
  // the tassel, tied under the socket, hanging and streaming back
  const tie = at(P.socket - 1.5);
  const side = norm(cross(way, across), [0, 0, 1]);
  put('tassel', 'partisan', { k: 'ball', c: tie, ax: sphere(1.2), skin: ROYAL });
  for (const k of [-1, 0, 1]) {
    const end = add(tie, add([0, 0, -5.5], add(mul(lag, 1.5), add(mul(side, k * 0.6), mul(across, k * 0.6)))));
    put('tassel', 'partisan', { k: 'rod', a: tie, b: end, ra: 0.6, rb: 0.45, ramp: k === 0 ? WHITE : ROYAL });
  }
  if (glint > 0.05) put('glint', 'partisan', { k: 'glow', p: h.blade, c: FLAME[1], r: 6 + 6 * glint, a: 0.5 * glint });
}

// =============================================================================================
// THE SWORD AND THE SHIELD

/** The sword: its pommel behind the fist, its guard before it, its blade's length. */
export const SWORD = { pommel: 3.4, guard: 1.6, blade: 30 } as const;
/** The sword as it is at a moment: the pommel, the guard, the point, the way it points and its flat across; the middle of the blade's edge (what strikes in a sweep). */
export function swordOf(s: Skeleton): { pommel: V3; guard: V3; tip: V3; way: V3; across: V3; mid: V3 } {
  const way = s.point;
  const across = norm(sub(s.across, mul(way, dot(s.across, way))), [0, 1, 0]);
  const guard = add(s.handR, mul(way, SWORD.guard));
  const tip = add(guard, mul(way, SWORD.blade));
  return { pommel: add(s.handR, mul(way, -SWORD.pommel)), guard, tip, way, across, mid: add(guard, mul(way, SWORD.blade * 0.66)) };
}
/** The sword in their right fist at `hand` (from their place on the floor), pointing `way`, its flat across `across`. */
export function swordGrip(hand: V3, way: V3, across: V3): Partial<Bones> {
  const g = halberdGrip(hand, way, across, 0, null);
  return { rhIn: 2, rhx: g.rhx, rhy: g.rhy, rhz: g.rhz, wAz: g.wAz, wEl: g.wEl, wRoll: g.wRoll };
}
function sword(put: Put, s: Skeleton, glint: number): void {
  const w = swordOf(s);
  const flat = norm(cross(w.way, w.across), [0, 0, 1]);
  put('hilt', 'sword', { k: 'ball', c: w.pommel, ax: sphere(1.05), skin: STEEL });
  put('hilt', 'sword', { k: 'rod', a: w.pommel, b: w.guard, ra: 0.7, rb: 0.7, ramp: LEATHER });
  put('hilt', 'sword', { k: 'rod', a: add(w.guard, mul(w.across, -3.8)), b: add(w.guard, mul(w.across, 3.8)), ra: 0.6, rb: 0.6, ramp: STEEL });
  for (const k of [-1, 1]) put('hilt', 'sword', { k: 'ball', c: add(w.guard, mul(w.across, k * 3.9)), ax: sphere(0.75), skin: STEEL });
  // the blade: broad at the guard, tapering to the point, its edges bright
  put('blade', 'sword', {
    k: 'panel',
    c: add(w.guard, mul(w.way, SWORD.blade / 2)),
    u: mul(w.across, 1.5),
    v: mul(w.way, SWORD.blade / 2),
    skin: (a0, b0, _front, tone0) => {
      const tone = Math.max(2, tone0);
      const b = b0 / (SWORD.blade / 2);
      const wdt = b < 0.6 ? 1 - 0.25 * (b + 1) / 1.6 : 0.75 * (1 - (b - 0.6) / 0.4);
      const a = Math.abs(a0) / 1.5;
      if (a > wdt) return null;
      if (a > wdt - 0.35) return EDGE[Math.min(4, tone + 1)];
      if (a < 0.2 && b < 0.4) return STEEL[Math.max(1, tone - 1)];
      return STEEL[tone];
    },
  });
  void flat;
  if (glint > 0.05) put('glint', 'sword', { k: 'glow', p: w.mid, c: FLAME[1], r: 5 + 6 * glint, a: 0.5 * glint });
}

/** The heater shield: half its width, half its height; how far before the left fist its face is. */
export const SHIELD = { w: 7.8, h: 10.4, out: 1.8 } as const;
/** The shield as it is at a moment: its middle, the way its face looks, its up and across (from the pose's pAz, pEl). */
export function shieldOf(s: Skeleton, q: { pAz: number; pEl: number }): { c: V3; n: V3; up: V3; across: V3; rim: V3[] } {
  const n = heading(q.pAz, 0);
  const up = norm(add([0, 0, 1], mul(n, -Math.tan(q.pEl * D))));
  const across = norm(cross(up, n));
  const c = add(add(s.handL, mul(n, SHIELD.out)), mul(up, -0.6));
  const rim: V3[] = [];
  for (const [a, b] of [[-1, 1], [0, 1], [1, 1], [1, 0], [0.62, -0.62], [0, -1], [-0.62, -0.62], [-1, 0]] as const) rim.push(add(c, add(mul(across, a * SHIELD.w), mul(up, b * SHIELD.h))));
  return { c, n, up, across, rim };
}
/** Inside the heater's outline (`a` across, `b` up, the shield's own lengths from its middle)? A straight top; straight sides to the middle; curving in below to the point. */
function heater(a: number, b: number): number {
  const x = Math.abs(a) / SHIELD.w;
  const y = b / SHIELD.h;
  if (y > 1) return -1;
  if (y >= 0) return 1 - x;
  return Math.sqrt(Math.max(0, 1 - y * y)) - x;
}
function shield(put: Put, s: Skeleton, q: { pAz: number; pEl: number }): void {
  const sh = shieldOf(s, q);
  put('shield', 'shield', {
    k: 'panel',
    c: sh.c,
    u: mul(sh.across, SHIELD.w),
    v: mul(sh.up, SHIELD.h),
    skin: (a, b, front, tone0) => {
      const inside = heater(a, b);
      if (inside < 0) return null;
      if (!front) return LEATHER[Math.max(0, tone0 - 1)];
      const tone = Math.max(2, Math.min(3, tone0 + 1));
      // (its steel rim)
      if (inside < 0.1 || b > SHIELD.h - 0.8) return STEEL[Math.min(4, tone + 1)];
      // (quartered: white in the first and fourth quarters, wine in the second and third; a steel boss at its middle)
      if (Math.hypot(a, b - 0.4) < 1.3) return STEEL[Math.min(4, tone + 1)];
      const white = (a < 0) === (b > 0.4);
      return white ? WHITE[tone] : ROYAL[Math.min(4, tone + 1)];
    },
  });
  put('shieldback', 'shield', { k: 'panel', c: add(sh.c, mul(sh.n, -0.9)), u: mul(sh.across, SHIELD.w), v: mul(sh.up, SHIELD.h), skin: (a, b) => (heater(a, b) < 0.02 ? null : LEATHER[0]) });
}

// =============================================================================================
// THEM AS SOLIDS

/** An arm: a puffed sleeve of wine slashed white to the elbow; a sleeve to the wrist; a leather glove with a flared cuff; the fingers closed round what it holds. */
function arm(put: Put, s: Skeleton, side: 'L' | 'R', cu: V3, curl: number): void {
  const sh = side === 'L' ? s.shoulderL : s.shoulderR;
  const el = side === 'L' ? s.elbowL : s.elbowR;
  const hand = side === 'L' ? s.handL : s.handR;
  const [r0, r1, r2] = GB.armR;
  const fore = norm(sub(hand, el), [0, 0, -1]);
  // (striped wine and white, the stripes running down the arm)
  const puff = (u: V3, tone: number): string => (Math.floor((Math.atan2(u[2], u[1]) + Math.PI) / (Math.PI / 4)) % 2 ? WHITE[Math.max(3, Math.min(4, tone + 1))] : TABARD[Math.max(1, Math.min(4, tone + 1))]);
  const upper = norm(sub(el, sh), [0, 0, -1]);
  // (its round made about the arm's own line, from whichever of the chest's ways lies least along it, so that it never folds flat)
  const ref = Math.abs(dot(upper, s.chest[0])) > 0.7 ? s.chest[2] : s.chest[0];
  const across = norm(cross(upper, ref), s.chest[1]);
  const across2 = norm(cross(across, upper), s.chest[0]);
  put(`arm${side}`, `arm${side}`, { k: 'ball', c: lerp3(sh, el, 0.38), ax: [mul(upper, Math.hypot(...sub(el, sh)) * 0.42), mul(across, r0 * 1.36), mul(across2, r0 * 1.36)], skin: puff, far: true });
  put(`arm${side}`, `arm${side}`, { k: 'rod', a: sh, b: el, ra: r0 * 1.18, rb: r1 * 1.12, ramp: ROYAL, far: true });
  // (the pauldron, a steel cup over the shoulder)
  put(`arm${side}`, `pauldron${side}`, { k: 'ball', c: add(sh, mul(cu, 0.9)), ax: [mul(s.chest[0], r0 * 1.55), mul(s.chest[1], r0 * 1.55), mul(cu, r0 * 1.2)], skin: (u, tone) => (u[2] < -0.35 ? null : STEEL[Math.abs(u[2] - 0.2) < 0.09 ? Math.max(1, tone - 1) : tone]), far: true });
  put(`fore${side}`, `fore${side}`, { k: 'ball', c: el, ax: sphere(r1 * 1.12), skin: ROYAL, far: true });
  const wrist = add(hand, mul(fore, -1.3));
  put(`fore${side}`, `fore${side}`, { k: 'rod', a: el, b: lerp3(el, wrist, 0.7), ra: r1 * 1.08, rb: r2 * 1.1, ramp: ROYAL, far: true });
  put(`fore${side}`, `cuff${side}`, { k: 'rod', a: lerp3(el, wrist, 0.6), b: wrist, ra: r1 * 1.34, rb: r2 * 1.1, ramp: LEATHER, far: true });
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
/** A leg: puffed breeches of wine slashed white; a steel tasset over the thigh; a tall black boot to the knee. */
function leg(put: Put, s: Skeleton, side: 'L' | 'R'): void {
  const hip = side === 'L' ? s.hipL : s.hipR;
  const knee = side === 'L' ? s.kneeL : s.kneeR;
  const ankle = side === 'L' ? s.ankleL : s.ankleR;
  const heel = side === 'L' ? s.heelL : s.heelR;
  const toe = side === 'L' ? s.toeL : s.toeR;
  const [rH, rK, rA] = GB.legR;
  const thigh = norm(sub(knee, hip), [0, 0, -1]);
  // (striped wine and white down the thigh, as the sleeves)
  const slash = (u: V3, tone: number): string => (Math.floor((Math.atan2(u[2], u[1]) + Math.PI) / (Math.PI / 4)) % 2 ? WHITE[Math.max(3, Math.min(4, tone + 1))] : TABARD[Math.max(1, Math.min(4, tone + 1))]);
  // (the thigh's own ways: out before it, and across it, about the hips' left, which a thigh swings round: never folding flat)
  const before = norm(cross(thigh, s.hips[1]), s.hips[0]);
  const lat = norm(cross(before, thigh), s.hips[1]);
  put(`leg${side}`, `leg${side}`, { k: 'rod', a: hip, b: knee, ra: rH * 1.1, rb: rK * 1.08, ramp: ROYAL, far: true });
  put(`leg${side}`, `breech${side}`, { k: 'ball', c: lerp3(hip, knee, 0.42), ax: [mul(thigh, rH * 2.5), mul(before, rH * 1.38), mul(lat, rH * 1.38)], skin: slash, far: true });
  put(`leg${side}`, `leg${side}`, { k: 'ball', c: knee, ax: sphere(rK * 1.1), skin: ROYAL, far: true });
  const shin = norm(sub(ankle, knee), [0, 0, -1]);
  put(`shin${side}`, `shin${side}`, { k: 'rod', a: add(knee, mul(shin, 0.6)), b: ankle, ra: rK * 1.2, rb: rA * 1.22, ramp: BOOT, far: true });
  put(`shin${side}`, `bootTop${side}`, { k: 'rod', a: add(knee, mul(shin, 0.2)), b: add(knee, mul(shin, 2.6)), ra: rK * 1.4, rb: rK * 1.32, ramp: BOOT, far: true });
  const fwd = norm(sub(toe, heel), [1, 0, 0]);
  const side3 = norm(Math.abs(fwd[2]) < 0.95 ? [-fwd[1], fwd[0], 0] : cross(s.hips[2], fwd), [0, 1, 0]);
  const up3 = norm(cross(fwd, side3), [0, 0, 1]);
  put(`foot${side}`, `foot${side}`, { k: 'ball', c: add(lerp3(heel, toe, 0.5), mul(up3, 1.7)), ax: [mul(fwd, 5.0), mul(side3, 2.2), mul(up3, 1.8)], skin: BOOT, far: true });
  // (the tasset: a steel plate hung from the breastplate's skirt over the front of the thigh)
  const top = add(lerp3(hip, knee, 0.08), mul(before, rH * 1.25 + 1.4));
  const low = add(lerp3(hip, knee, 0.5), mul(before, rH * 1.3 + 1.6));
  put(`leg${side}`, `tasset${side}`, { k: 'panel', c: lerp3(top, low, 0.5), u: mul(lat, rH * 1.25), v: mul(sub(low, top), -0.5), skin: (a, b, front, tone) => (front ? STEEL[Math.abs(b) > 0 && fr((b + 10) / 2.6) < 0.18 ? Math.max(1, tone - 1) : Math.max(2, tone)] : STEEL[1]) });
}

/** The torso: the doublet from the throat to below the hips. */
function torsoRings(s: Skeleton, pad: number, hemDrop: number, lag: V3): Ring[] {
  const [cf, cl, cu] = s.chest;
  const be = s.belly;
  const waistC = add(s.pelvis, mul(s.hips[2], GB.waist * 0.6));
  return [
    { c: add(add(s.pelvis, mul(s.hips[2], -hemDrop)), mul(lag, 0.5)), u: mul(s.hips[0], GB.pelvisDeep + 2.1 + pad), v: mul(s.hips[1], GB.pelvisHalf + 2.3 + pad) },
    { c: waistC, u: mul(be[0], GB.waistDeep + 1.6 + pad), v: mul(be[1], GB.waistHalf + 1.6 + pad) },
    { c: s.ribs, u: mul(cf, GB.ribDeep + 1.7 + pad), v: mul(cl, GB.ribHalf + 1.9 + pad) },
    { c: lerp3(s.ribs, s.neck, 0.72), u: mul(cf, GB.ribDeep + 1.1 + pad), v: mul(cl, GB.shoulderHalf + 0.6 + pad) },
    { c: add(s.neck, mul(cu, -0.8)), u: mul(cf, 3.6 + pad * 0.5), v: mul(cl, 4.2 + pad * 0.5) },
  ];
}
/** The breastplate: polished steel from the waist to under the arms, its ridge down the middle. */
function cuirassRings(s: Skeleton): Ring[] {
  const [cf, cl] = s.chest;
  const be = s.belly;
  const waistC = add(s.pelvis, mul(s.hips[2], GB.waist * 0.5));
  return [
    { c: waistC, u: mul(be[0], GB.waistDeep + 2.6), v: mul(be[1], GB.waistHalf + 2.5) },
    { c: lerp3(waistC, s.ribs, 0.55), u: mul(be[0], GB.waistDeep + 3.0), v: mul(be[1], GB.waistHalf + 2.6) },
    { c: s.ribs, u: mul(cf, GB.ribDeep + 2.9), v: mul(cl, GB.ribHalf + 2.6) },
    { c: lerp3(s.ribs, s.neck, 0.62), u: mul(cf, GB.ribDeep + 2.0), v: mul(cl, GB.shoulderHalf + 0.9) },
  ];
}

/** A ring round both thighs `down` of the way from the hips to the knees, hanging back as they go (the tabard's hem). */
function thighRing(s: Skeleton, down: number, pad: number, lag: V3): Ring {
  const f = norm([s.hips[0][0], s.hips[0][1], 0], [1, 0, 0]);
  const l: V3 = [-f[1], f[0], 0];
  const a = lerp3(s.hipL, s.kneeL, down);
  const b = lerp3(s.hipR, s.kneeR, down);
  const c = lerp3(a, b, 0.5);
  const spanF = Math.abs(dot(sub(a, b), f));
  const spanL = Math.abs(dot(sub(a, b), l));
  const rT = GB.legR[0] * 1.38;
  return { c: add(c, mul(lag, 0.7)), u: mul(f, Math.max(GB.pelvisDeep + 2.4, spanF / 2 + rT + 1.2) + pad), v: mul(l, Math.max(GB.pelvisHalf + 2.2, spanL / 2 + rT + 1.0) + pad) };
}
/** THE TABARD: its front and its back, from the shoulders to the thighs, over the breastplate; its sides open, the steel showing. */
function tabardRings(s: Skeleton, lag: V3): Ring[] {
  const [cf, cl, cu] = s.chest;
  const be = s.belly;
  const waistC = add(s.pelvis, mul(s.hips[2], GB.waist * 0.5));
  return [
    thighRing(s, 0.42, 1.0, lag),
    { c: add(add(s.pelvis, mul(s.hips[2], -1.6)), mul(lag, 0.4)), u: mul(s.hips[0], GB.pelvisDeep + 3.2), v: mul(s.hips[1], GB.pelvisHalf + 3.0) },
    { c: waistC, u: mul(be[0], GB.waistDeep + 3.2), v: mul(be[1], GB.waistHalf + 2.9) },
    { c: s.ribs, u: mul(cf, GB.ribDeep + 3.3), v: mul(cl, GB.ribHalf + 2.9) },
    { c: lerp3(s.ribs, s.neck, 0.7), u: mul(cf, GB.ribDeep + 2.4), v: mul(cl, GB.shoulderHalf + 1.0) },
    { c: add(s.neck, mul(cu, -0.6)), u: mul(cf, 4.6), v: mul(cl, 5.2) },
  ];
}
/**
 * THE ROYAL CREST (an original mark): a white swan, its wings raised, its neck in its S, its head turned to its left;
 * `a` across the crest and `b` up it, from -1 to 1. Inside it: true.
 */
function swanCrest(a: number, b: number): boolean {
  const e = (x: number, y: number, cx: number, cy: number, rx: number, ry: number): boolean => ((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2 <= 1;
  // its body, low, a boat with its tail tipped up behind
  if (e(a, b, 0.12, -0.5, 0.62, 0.26)) return true;
  if (e(a, b, 0.68, -0.32, 0.16, 0.12)) return true;
  // its wing raised over its back, its top edge notched into feathers
  if (b > -0.5 && e(a, b, 0.28, -0.12, 0.42, 0.42)) {
    const notch = b > 0.12 && Math.abs(((a - 0.28) * 4 + 8) % 1 - 0.5) < 0.12;
    if (!notch) return true;
  }
  // its neck: up from the breast in an S
  for (let i = 0; i <= 12; i++) {
    const t = i / 12;
    const x = -0.36 - 0.16 * Math.sin(Math.PI * 1.6 * t) + 0.06 * t;
    const y = -0.38 + 0.98 * t;
    if (Math.hypot(a - x, b - y) < 0.1 - 0.02 * t) return true;
  }
  // its head, and its bill to the left
  if (e(a, b, -0.28, 0.62, 0.14, 0.11)) return true;
  if (b < 0.64 && b > 0.52 && a < -0.38 && a > -0.62 + (0.64 - b) * 0.6) return true;
  return false;
}
/** The crest on the tabard's breast, and on its back (turned about so that it reads the right way from behind): painted on a thin shell just proud of the cloth. */
function crests(put: Put, s: Skeleton): void {
  const [cf, cl, cu] = s.chest;
  const W = 7.0;
  const H = 7.4;
  for (const k of [1, -1]) {
    const c = add(lerp3(s.ribs, s.neck, 0.3), mul(cf, k * (GB.ribDeep + 3.6)));
    put('crest', 'crest', {
      k: 'ball',
      c,
      ax: [mul(cf, k * 1.4), mul(cl, -k * W), mul(cu, H)],
      skin: (u, tone) => (u[0] > 0.15 && swanCrest(u[1], u[2]) ? WHITE[tone >= 2 ? 4 : 3] : null),
    });
  }
}

/**
 * THE HEAD IN ITS CLOSED HELMET: polished steel round the whole head, a comb over its crown, the visor down, a dark slit
 * across the eyes with the cult's dull pink behind it, breaths pierced below; a gorget at the throat; a tall white plume
 * from the crest, swaying back as they go. Returns where the Hush leaks out of the slit, and the face's ways.
 */
function head(put: Put, st: Stage, s: Skeleton, lit: number, lag: V3, sway: number, sag: number): { slit: V3; ff: V3; fl: V3; fu: V3 } {
  const [ff, fl, fu] = wornOn(st, s, 8);
  const hr: V3 = [GB.headR[0] * 1.1, GB.headR[1] * 1.12, GB.headR[2] * 1.06];
  const hc = add(s.head, mul(fu, 0.2));
  const SLIT = 0.16;
  put('helm', 'helm', {
    k: 'ball',
    c: hc,
    ax: [mul(ff, hr[0]), mul(fl, hr[1]), mul(fu, hr[2])],
    skin: (u, tone) => {
      // the slit: a dark band across the front at the eyes
      if (u[0] > 0.42 && Math.abs(u[2] - SLIT) < 0.1 && Math.abs(u[1]) < 0.66) return INK;
      // the visor's edge, a line round the face below the slit
      if (u[0] > 0.3 && Math.abs(u[2] + 0.42) < 0.05) return STEEL[Math.max(1, tone - 1)];
      // its breaths: pierced holes on the right cheek
      if (u[0] > 0.5 && u[1] < -0.12 && u[1] > -0.5 && u[2] < -0.05 && u[2] > -0.34 && hash(Math.round(u[1] * 14), Math.round(u[2] * 14), 7431) < 0.35) return INK;
      // the gorget's lip at its foot
      if (u[2] < -0.86) return STEEL[Math.max(1, tone - 1)];
      return STEEL[tone];
    },
  });
  // the comb over the crown, front to back
  put('helm', 'comb', { k: 'rod', a: add(hc, add(mul(ff, hr[0] * 0.6), mul(fu, hr[2] * 0.86))), b: add(hc, add(mul(ff, -hr[0] * 0.7), mul(fu, hr[2] * 0.84))), ra: 0.7, rb: 0.6, ramp: STEEL });
  // the eyes: the cult's dull pink in the dark of the slit (going out as the Hush leaves them)
  for (const k of [-1, 1]) {
    const e = add(hc, add(mul(ff, hr[0] * 0.97), add(mul(fl, k * hr[1] * 0.3), mul(fu, hr[2] * SLIT))));
    put('helm', 'eyes', { k: 'dot', p: e, c: lit > 0.4 ? FLAME[1] : '#2a1e24', facing: ff, c2: lit > 0.4 ? FLAME[2] : '#2a1e24' });
  }
  // the plume: rising from the crest at the back, arching over and falling behind, swaying
  const root = add(hc, add(mul(ff, -hr[0] * 0.35), mul(fu, hr[2] * 0.98)));
  const pts: V3[] = [];
  for (let i = 0; i <= 5; i++) {
    const k = i / 5;
    const back = 1.5 + 7.5 * k;
    const up = 8.5 * Math.sin(Math.PI * 0.62 * k) - 1.0 * k;
    const p = add(root, add(mul(ff, -back), add(mul(fu, up), add(mul(lag, 1.2 * k), mul(fl, sway * k)))));
    // (once they lie on the floor, it flops over and lies along it)
    pts.push([p[0], p[1], p[2] - sag * Math.max(0, p[2] - root[2] - 0.5) * 0.9]);
  }
  for (let i = 0; i <= 5; i++) {
    const k = i / 5;
    const r = 2.8 * Math.sin(Math.PI * (0.25 + 0.6 * k)) + 0.7;
    put('plume', 'plume', { k: 'ball', c: pts[i], ax: sphere(r), skin: (u, tone) => WHITE[hash(Math.round(u[0] * 5 + i * 3), Math.round(u[2] * 5), 7432) < 0.25 ? Math.max(1, tone - 1) : tone] });
  }
  const slit = add(hc, add(mul(ff, hr[0] * 1.02), mul(fu, hr[2] * SLIT)));
  return { slit, ff, fl, fu };
}

/** The Hush leaking out of them at each moment, laid after their edge (Mob.grains). */
const BREATH = new WeakMap<Moment, [V3, string, number][]>();
/**
 * THE HUSH SEEPING OUT OF THE VISOR'S SLIT: short grey wisps pushed out of the dark either side of the face, curling up
 * past the helmet; more and further as they wind up a blow (`hard`, 0 to 1).
 */
function slitSeep(put: Put, at: V3, out: V3, ff: V3, t: number, seed: number, hard: number): void {
  const N = Math.round(7 + 6 * hard);
  for (let i = 0; i < N; i++) {
    const life = fr(t * (0.8 + 0.5 * hard) + i / N + 0.17 * hash(i, seed, 2321));
    if (life > 0.55 + 0.4 * hard) continue;
    const curl = life * 5 + seed;
    const p = add(at, add(mul(out, (0.6 + life * (2.6 + 2.4 * hard)) * (0.8 + 0.4 * hash(i, seed, 2322))), add(mul(ff, 0.6 + Math.sin(curl) * (0.4 + life * 1.4)), [0, 0, life * (6 + 6 * hard)])));
    const c = life < 0.2 ? BREATH_PALE : life < 0.45 ? HUSH[4] : HUSH[3];
    put('hush', 'hush', { k: 'mote', p, c, size: life < 0.3 ? 3 : 2 });
  }
}
export interface GuardSay {
  /** Whether what they carry has fallen from their hands. */
  dropped: (m: Moment) => boolean;
}
function guardBits(who: GuardWho, st: Stage, m: Moment, say: GuardSay): Bit[] {
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
  const seed = who === 'partisan' ? 21 : 22;
  const held = !say.dropped(m);
  for (const side of ['L', 'R'] as const) leg(put, s, side);
  // THE DOUBLET of the royal wine, to below the hips; THE BREASTPLATE over it; the gorget; the belt
  put('body', 'doublet', { k: 'cloth', rings: torsoRings(s, 0.4, 3.0, lag), ramp: ROYAL, look: { folds: [0, 30, -30, 70, -70, 120, -120, 160, -160], lift: 0.05 } });
  put('body', 'cuirass', { k: 'cloth', rings: cuirassRings(s), ramp: STEEL, look: { folds: [0], lift: 0.02 } });
  // THE TABARD of the royal wine over it, front and back, edged white; the royal crest on its breast and its back
  const tab = tabardRings(s, lag);
  for (const [a0, a1] of [[318, 402], [138, 222]] as const) {
    put('tabard', 'tabard', { k: 'cloth', rings: tab, ramp: TABARD, look: { folds: [0, 180], lift: 0.05, arc: [a0, a1] } });
    // its edges piped in white: down each side, and along its hem
    const at = (r: Ring, deg: number, out: number): V3 => {
      const t = deg * D;
      return add(r.c, add(mul(r.u, Math.cos(t) * (1 + out / len3(r.u))), mul(r.v, Math.sin(t) * (1 + out / len3(r.v)))));
    };
    for (const deg of [a0 + 1.5, a1 - 1.5]) {
      for (let i = 0; i + 1 < tab.length - 1; i++) put('tabard', 'piping', { k: 'rod', a: at(tab[i], deg, 0.35), b: at(tab[i + 1], deg, 0.35), ra: 0.7, rb: 0.7, ramp: WHITE });
    }
    for (let d = a0 + 1.5; d < a1 - 1.5; d += 10) put('tabard', 'piping', { k: 'rod', a: at(tab[0], d, 0.35), b: at(tab[0], Math.min(a1 - 1.5, d + 10), 0.35), ra: 0.75, rb: 0.75, ramp: WHITE });
  }
  crests(put, s);
  put('neck', 'gorget', { k: 'band', ring: { c: add(s.neck, mul(cu, -0.6)), u: mul(cf, 4.4), v: mul(cl, 5.0) }, ramp: STEEL, rows: 2 });
  const waistC = add(s.pelvis, mul(s.hips[2], GB.waist * 0.45));
  put('body', 'belt', { k: 'band', ring: { c: waistC, u: mul(s.belly[0], GB.waistDeep + 2.8), v: mul(s.belly[1], GB.waistHalf + 2.7) }, ramp: LEATHER, rows: 1 });
  // the arms: the right fist closed round what it carries; the left round the partisan too, or the shield's grip
  arm(put, s, 'L', cu, who === 'sword' ? (held ? 1 : 0.5) : q.lhIn === 3 ? 1 : 0.5);
  arm(put, s, 'R', cu, held ? 1 : 0.45);
  put('neck', 'neck', { k: 'rod', a: add(s.neck, mul(cu, -1.5)), b: lerp3(s.neck, s.head, 0.5), ra: 3.0, rb: 2.8, ramp: STEEL });
  const sway = Math.sin(m.wind * Math.PI * 2) * 0.8;
  const hd = head(put, st, s, lit, lag, sway, m.dying ? clamp01((m.t - 1.8) / 0.5) : 0);
  const glint = held ? clamp01(m.glint) : 0;
  if (who === 'partisan') partisan(put, s, q, lag, glint);
  else {
    sword(put, s, glint);
    shield(put, s, q);
  }
  // THE HUSH LEAKING OUT OF THE SLIT, either side of the face; as they die it pours out of it in one great breath
  if (!m.dying || m.t < 0.3) {
    const hard = clamp01(m.glint);
    hushBreath(put, add(hd.slit, mul(hd.ff, 0.6)), hd.ff, hd.fl, m.t, 0.35 + 0.5 * hard, seed);
    slitSeep(put, add(hd.slit, mul(hd.fl, 2.2)), hd.fl, hd.ff, m.t, seed, hard);
    slitSeep(put, add(hd.slit, mul(hd.fl, -2.2)), mul(hd.fl, -1), hd.ff, m.t + 0.41, seed + 5, hard);
  } else {
    hushBreath(put, hd.slit, hd.ff, hd.fl, m.t, Math.max(0, 2.2 * (1 - clamp01((m.t - 0.4) / 1.1))), seed);
  }
  if (m.dying) hushLeaves(put, hd.slit, hd.ff, hd.fl, m.t, seed, GUARD_EXHALE[0], GUARD_EXHALE[1]);
  return bits;
}
/** When the Hush pours out of them as they die (seconds). */
export const GUARD_EXHALE: readonly [number, number] = [0.3, 1.9];

/** THE GUARD AS THE PAINTER TAKES THEM. */
export function guardPainter(who: GuardWho, say: GuardSay): { bits: (st: Stage, m: Moment) => Bit[]; grains: (st: Stage, m: Moment) => ReadonlyArray<readonly [V3, string, number]> } {
  return { bits: (st, m) => guardBits(who, st, m, say), grains: (_st, m) => BREATH.get(m) ?? [] };
}
