// FLOOR 19'S BOSS, THE KING (THE KEEP, THE THRONE HALL), ON THE HEROES' BONES. A MOCK-UP: NOT IN THE GAME. Nothing of
// the game imports this file; `KING_ON` is off. His moves are art/king_moves.ts; what his blows leave on the floor, and
// the clockwork songbird, art/king_fx.ts.
//
// His floor, from the plan he said yes to: the Keep, the old castle at the hill's crown, where the king lies dying; its
// palette cold stone, royal blue, old gold. Its story from Andersen's "The Nightingale" (1843), drawn only from the book:
// Death sits on the dying emperor's chest wearing his crown and holding his sword and banner, and the faces of his good
// and evil deeds peer from the folds of the bed curtains; the artificial bird lies broken. In the plan: "the king is
// dying. The Hush sits on his chest wearing his crown, holding his sword, and the faces of everything he ever did look
// out at him from the bed curtains (as Death does in "The Nightingale"). His clockwork songbird lies broken on the floor."
//
// HIS BRIEF, offered to him as a pop-up; his pick for how he moves: “Slow and heavy, huge reach (Recommended)”, with the
// brief as offered: the old king in his armour, raised from his deathbed with the Hush riding on his back, its fog in his
// crown, his great sword dragging on the stones; huge, twice the knight's height with the Hush on his back; slow and
// heavy, but every blow reaches across the hall; his mark the Hush riding his back, its fog in his crown; his moves a
// sweep of the great sword (basic), the Decree, the Crown, the Curtains; his last phase, the Hush climbs off him and
// fights at his side; his death, the clockwork songbird winds itself up and sings, and the door to the Quiet Tower
// opens; never a skeleton or zombie, never gory; his sound the sword's drag, armour, the bird's song.
//
// HIS LOOK: an old, gaunt, white-bearded king, alive, grey and dying (not undead), bowed under what rides him: old
// ornate plate enamelled royal blue and edged in old gold (gold that never glows), great pauldrons, gold gauntlets and
// sabatons; a royal blue mantle down his back to the floor, its collar ermine; a gold crown of tall points set with
// sapphires, grey fog curling up through it. ON HIS BACK THE HUSH: a grey fog-shape lying along his back, its long arms
// over his shoulders (one hand gripping his sword arm, the other clutching at his breast), its own faint face looming
// over his head; the Hush is the one with the dull pink eyes. His GREAT SWORD in his right hand, taller than the knight,
// its point dragging on the stones behind him. Nothing cyan anywhere (his blue stays out of hue 160 to 205).

import { BREATH_PALE, lagOf } from './hushed';
import { INK, hash } from './kit';
import type { Ramp } from './kit';
import { FLAME } from './mkit';
import { sphere } from './new_mobs3';
import type { Bit, MobCanvas, Moment, Put, Shape } from './new_mobs3';
import { wornOn } from './skin';
import type { Ring, Skin, Stage } from './skin';
import { add, buildOf, cross, dot, len, lerp3, mul, norm, standing, sub } from './skeleton';
import type { Bones, Build, Rot, Skeleton, V3 } from './skeleton';

/** THE SWITCH, OFF. Nothing of the game reads this file. */
export const KING_ON = { on: false };

const clamp01 = (v: number): number => Math.max(0, Math.min(1, v));
const fr = (t: number): number => t - Math.floor(t);
/** The one beat everything loose keeps (1.8 s round: his stand goes round twice in it, his walk once), so that loops close. */
const W2 = (Math.PI * 2) / 1.8;

// =============================================================================================
// HIS COLOURS: cold stone's royal blue and old gold; his old grey skin and white hair; the Hush's fog

/** His plate: enamelled royal blue (hue about 230: well clear of the friend's cyan). */
export const ROYAL: Ramp = ['#0c1030', '#18205a', '#28348a', '#3c4cb4', '#5a6cd0'];
/** His mantle: a deeper royal blue velvet. */
export const MANTLE: Ramp = ['#0a0c26', '#121844', '#1e2a6c', '#2c3c94', '#4252b2'];
/** Old gold: his crown, the edges of his plate, his gauntlets, his sword's hilt. Dull and worn: it never glows. */
export const GOLD: Ramp = ['#2a200e', '#4a3a18', '#76602c', '#a08646', '#c2a866'];
/** His great sword's blade: old steel. */
export const BLADE: Ramp = ['#262838', '#44465c', '#6c6e86', '#9a9cb0', '#c6c8d6'];
const EDGE = '#e2e2ea';
/** Sapphires in his crown and his pommel. */
export const SAPPHIRE: Ramp = ['#0a0e3a', '#1a2280', '#2a3ac0', '#5a70e8', '#a0b0ff'];
/** His skin: old, grey, dying. */
const SKIN: Ramp = ['#382c30', '#584644', '#7a6660', '#9c847a', '#b49a8c'];
/** His hair and beard: white. */
const WHITE: Ramp = ['#56566a', '#82828e', '#acacb6', '#d2d2d6', '#ececee'];
/** The ermine of his collar, and its black tails. */
const ERMINE: Ramp = ['#6e6c78', '#9c9aa4', '#c8c6cc', '#e2e0e2', '#f2f0ee'];
const ERMINE_TAIL = '#16141c';
/** THE HUSH: its fog (the Hush's own colour, as the city's Hushed breathe it), its mask of a face. */
export const FOG: Ramp = ['#221e2c', '#3a3650', '#5a5472', '#847e9e', '#ada7c4'];
const MASK: Ramp = ['#6a6478', '#9690a6', '#bcb6ca', '#dcd8e6', '#f0eef4'];
/** The inside of its hood: dark, so that its mask shows. */
const COWL: Ramp = ['#100e18', '#1a1726', '#2a2638', '#3e3a52', '#575270'];
const HOLLOW = '#0c0a14';

// =============================================================================================
// HIS BODY

/** Huge: a hundred tall standing straight (the knight is 58), the Hush's head over his crown making him twice the knight; broad in his plate, long in the arm. */
export const KING_BODY: Build = buildOf(100, 1.32, { shoulders: 1.24, chest: 1.12, depth: 1.08, waist: 0.92, hips: 1.02, legs: 1.0, arms: 1.12, trunk: 1.02, limbs: 1.3, pad: 2.8 });
const B = KING_BODY;
/** His picture: room for his sword swept round him at full reach, raised over his head, and him at the top of his leap. */
export const KING_CANVAS: MobCanvas = { w: 340, h: 400, ax: 170, ay: 316 };

/** HIS GREAT SWORD (his own lengths): from his fist back to the pommel; the guard before it; the blade; its half-width at the guard. Taller than the knight. */
export const SWORD = { pommel: 12.5, guard: 2.6, blade: 62, half: 3.4, quillon: 9 } as const;
/** How long the whole sword is, pommel to point. */
export const SWORD_LONG = SWORD.pommel + SWORD.guard + SWORD.blade;
/** His sword at a moment: where the pommel, the guard and the point are, the way it points and the line across its flat. */
export function swordOf(s: Skeleton): { pommel: V3; guard: V3; tip: V3; way: V3; across: V3; at: (k: number) => V3 } {
  const way = s.point;
  const across = norm(sub(s.across, mul(way, dot(s.across, way))), [0, 1, 0]);
  const guard = add(s.handR, mul(way, SWORD.guard));
  const tip = add(guard, mul(way, SWORD.blade));
  return { pommel: add(s.handR, mul(way, -SWORD.pommel)), guard, tip, way, across, at: (k) => add(guard, mul(way, SWORD.blade * k)) };
}
/** Where his left hand holds the grip below his right, when it does (`lhIn` 3: along the sword from his right fist). */
export const LEFT_ON_GRIP = -6.4;

/** His rest: bowed under the Hush, his knees bent with its weight, his chest sunk forward; his face lifted from under his brows; his left arm hanging heavy; his sword low in his right hand, its point on the stones behind him. */
export const KING_REST: Bones = {
  ...standing(B),
  pz: -4.2, px: 0, py: 0, yaw: -6, pitch: 7, roll: 0, twist: 4, bend: 17, side: 0,
  faceTurn: 2, faceUp: 12, faceTilt: 0,
  lfx: 6, lfy: 3, lft: 12, lk: 10, rfx: -5, rfy: -4, rft: -16, rk: -14,
  lhIn: 1, lhx: 3, lhy: 4, lhz: -38, le: -12,
  rhIn: 1, rhx: 4, rhy: -9, rhz: -36, re: 14,
  wAz: -152, wEl: -40, wRoll: 0, draw: 0, out: 0,
} as Bones;


/**
 * THE ROYAL SWAN (his pick, asked whether the King should have a mark of his own: “Keep the royal swan”): the High City's
 * crest, as floor 16's palace guard wear it (art/palace_guard.ts, `swanCrest`, drawn the same here): a white swan, its
 * wings raised, its neck in its S, its head to its left; on him in old gold. `a` across it and `b` up it, -1 to 1.
 */
export function royalSwan(a: number, b: number): boolean {
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
/** The royal swan in old gold on a thin shell just proud of what it is on: at `c`, its face out along `out`, `up` its up, `w` and `h` its half-sizes (`mirror` for one on his back, so that it reads the right way from behind). */
function swanOn(put: Put, part: string, c: V3, out: V3, side: V3, up: V3, w: number, h: number, mirror: boolean): void {
  put(part, 'crest', {
    k: 'ball', c, ax: [mul(out, 1.2), mul(side, mirror ? w : -w), mul(up, h)],
    skin: (u, tone) => (u[0] > 0.15 && royalSwan(u[1], u[2]) ? GOLD[tone >= 2 ? 4 : 3] : null),
  });
}

// =============================================================================================
// HIM AS SOLIDS

/** A leg in plate: a royal blue cuisse, a gold poleyn over the knee with its fan, a royal greave, a pointed gold sabaton. */
function leg(put: Put, s: Skeleton, side: 'L' | 'R'): void {
  const L = side === 'L';
  const hip = L ? s.hipL : s.hipR;
  const knee = L ? s.kneeL : s.kneeR;
  const ankle = L ? s.ankleL : s.ankleR;
  const heel = L ? s.heelL : s.heelR;
  const toe = L ? s.toeL : s.toeR;
  const [rH, rK, rA] = B.legR;
  const thigh = norm(sub(knee, hip), [0, 0, -1]);
  const before = norm(cross(thigh, s.hips[1]), s.hips[0]);
  put(`leg${side}`, `leg${side}`, { k: 'rod', a: hip, b: knee, ra: rH * 1.1, rb: rK * 1.12, ramp: ROYAL, far: true });
  // (a gold rim round the cuisse's foot, above the knee)
  put(`leg${side}`, `leg${side}`, { k: 'rod', a: lerp3(hip, knee, 0.8), b: lerp3(hip, knee, 0.86), ra: rK * 1.22, rb: rK * 1.22, ramp: GOLD, far: true });
  // THE POLEYN: a gold cop over the front of the knee, a pointed wing off its outside
  const kside = norm(cross(before, thigh), [0, 1, 0]);
  put(`leg${side}`, `knee${side}`, { k: 'ball', c: add(knee, mul(before, rK * 0.6)), ax: [mul(before, rK * 0.62), mul(kside, rK * 0.95), mul(thigh, rK * 0.9)], skin: (u, tone) => (Math.abs(u[2]) > 0.55 ? ROYAL[tone] : GOLD[tone]), far: true });
  const shin = norm(sub(ankle, knee), [0, 0, -1]);
  put(`shin${side}`, `shin${side}`, { k: 'rod', a: add(knee, mul(shin, 1.6)), b: ankle, ra: rK * 1.16, rb: rA * 1.3, ramp: ROYAL, far: true });
  // (the greave's gold ridge down its front)
  const sb = norm(cross(shin, s.hips[1]), s.hips[0]);
  put(`shin${side}`, `shin${side}`, { k: 'rod', a: add(add(knee, mul(shin, 3)), mul(sb, rK * 1.05)), b: add(lerp3(knee, ankle, 0.85), mul(sb, rA * 1.2)), ra: 0.75, rb: 0.6, ramp: GOLD, far: true });
  // THE SABATON: long and pointed, of overlapping gold lames
  const fwd = norm(sub(toe, heel), [1, 0, 0]);
  const side3 = norm(Math.abs(fwd[2]) < 0.95 ? [-fwd[1], fwd[0], 0] : cross(s.hips[2], fwd), [0, 1, 0]);
  const up3 = norm(cross(fwd, side3), [0, 0, 1]);
  const mid = add(lerp3(heel, toe, 0.42), mul(up3, 2.3));
  put(`foot${side}`, `foot${side}`, {
    k: 'ball', c: mid, ax: [mul(fwd, 6.6), mul(side3, 2.7), mul(up3, 2.2)],
    skin: (u, tone) => (u[0] > -0.6 && fr(u[0] * 2.2 + 0.1) < 0.14 ? GOLD[Math.max(0, tone - 1)] : GOLD[tone]),
    far: true,
  });
  put(`foot${side}`, `foot${side}`, { k: 'rod', a: add(lerp3(heel, toe, 0.82), mul(up3, 1.6)), b: add(toe, add(mul(fwd, 2.6), mul(up3, 0.9))), ra: 1.7, rb: 0.6, ramp: GOLD, far: true });
}

/** An arm in plate: a great layered pauldron, royal rerebrace and vambrace, a gold couter, a gold gauntlet, its fingers closed round what it holds (`curl` 1) or hanging loose. */
function arm(put: Put, s: Skeleton, side: 'L' | 'R', curl: number): void {
  const L = side === 'L';
  const sh = L ? s.shoulderL : s.shoulderR;
  const el = L ? s.elbowL : s.elbowR;
  const hand = L ? s.handL : s.handR;
  const [cf, cl, cu] = s.chest;
  const [r0, r1, r2] = B.armR;
  const fore = norm(sub(hand, el), [0, 0, -1]);
  const out = mul(cl, L ? 1 : -1);
  // THE PAULDRON: a broad, flattened plate over the shoulder, and two gold-edged lames stepping down over the arm
  const lame = (dz: number, dOut: number, k: number, top: boolean): void => {
    put(`arm${side}`, `pauldron${side}`, {
      k: 'ball', c: add(add(sh, mul(cu, dz)), mul(out, dOut)), ax: [mul(cf, r0 * 1.62 * k), mul(cl, r0 * 1.7 * k), mul(cu, r0 * (top ? 0.95 : 0.7) * k)],
      skin: (u, tone) => {
        if (u[2] < -0.5) return null;
        if (u[2] < -0.3) return GOLD[Math.min(4, tone + 1)];
        if (top && Math.abs(u[1] * (L ? 1 : -1) - 0.1) < 0.08 && u[2] > 0.2) return GOLD[tone];
        return ROYAL[tone];
      },
      far: true,
    });
  };
  lame(2.0, 1.0, 1, true);
  lame(-1.6, 3.0, 0.88, false);
  lame(-4.6, 4.6, 0.74, false);
  put(`arm${side}`, `arm${side}`, { k: 'rod', a: sh, b: el, ra: r0 * 1.12, rb: r1 * 1.1, ramp: ROYAL, far: true });
  // THE COUTER: a gold cup over the elbow
  put(`fore${side}`, `couter${side}`, { k: 'ball', c: el, ax: sphere(r1 * 1.3), skin: GOLD, far: true });
  const wrist = add(hand, mul(fore, -1.6));
  put(`fore${side}`, `fore${side}`, { k: 'rod', a: el, b: wrist, ra: r1 * 1.1, rb: r2 * 1.12, ramp: ROYAL, far: true });
  // THE GAUNTLET: a flared gold cuff, the back of the hand, plated fingers
  put(`fore${side}`, `cuff${side}`, { k: 'rod', a: lerp3(el, wrist, 0.74), b: add(wrist, mul(fore, 0.2)), ra: r2 * 1.14, rb: r2 * 1.3, ramp: ROYAL, far: true });
  put(`fore${side}`, `cuff${side}`, { k: 'rod', a: add(wrist, mul(fore, -0.3)), b: add(wrist, mul(fore, 0.4)), ra: r2 * 1.36, rb: r2 * 1.36, ramp: GOLD, far: true });
  const e1 = norm(sub(cu, mul(fore, dot(cu, fore))), [0, 0, 1]);
  const e2 = norm(cross(fore, e1), [0, 1, 0]);
  put(`hand${side}`, `hand${side}`, { k: 'ball', c: add(hand, mul(fore, 0.4)), ax: [mul(fore, 2.3), mul(e2, 2.1), mul(e1, 1.35)], skin: GOLD, far: true });
  for (let i = 0; i < 4; i++) {
    const spread = (i - 1.5) * 0.46;
    const base = add(hand, add(mul(fore, 1.9), mul(e2, spread * 1.0)));
    const midF = add(base, add(mul(fore, 1.8 * (1 - 0.45 * curl)), mul(e1, -1.3 * curl)));
    const tip = add(midF, add(mul(fore, 1.5 * (1 - 0.85 * curl)), mul(e1, -1.7 * curl)));
    put(`hand${side}`, `finger${side}`, { k: 'rod', a: base, b: midF, ra: 0.7, rb: 0.62, ramp: GOLD, far: true });
    put(`hand${side}`, `finger${side}`, { k: 'rod', a: midF, b: tip, ra: 0.62, rb: 0.45, ramp: GOLD, far: true });
  }
}

/** The breastplate: royal blue from his waist to under his arms, swelling over the chest. */
function cuirassRings(s: Skeleton): Ring[] {
  const [cf, cl] = s.chest;
  const be = s.belly;
  const waistC = add(s.pelvis, mul(s.hips[2], B.waist * 0.5));
  return [
    { c: waistC, u: mul(be[0], B.waistDeep + 2.6), v: mul(be[1], B.waistHalf + 2.6) },
    { c: lerp3(waistC, s.ribs, 0.55), u: mul(be[0], B.waistDeep + 3.2), v: mul(be[1], B.waistHalf + 2.9) },
    { c: s.ribs, u: mul(cf, B.ribDeep + 3.0), v: mul(cl, B.ribHalf + 2.6) },
    { c: lerp3(s.ribs, s.neck, 0.62), u: mul(cf, B.ribDeep + 2.0), v: mul(cl, B.shoulderHalf + 0.6) },
    { c: add(s.neck, mul(s.chest[2], -1.2)), u: mul(cf, 5.4), v: mul(cl, 6.4) },
  ];
}
/** The fauld: a skirt of royal lames from the waist over the tops of his thighs, each edged in gold. */
function fauldRings(s: Skeleton, lag: V3): Ring[] {
  const f = norm([s.hips[0][0], s.hips[0][1], 0], [1, 0, 0]);
  const l: V3 = [-f[1], f[0], 0];
  const a = lerp3(s.hipL, s.kneeL, 0.36);
  const b = lerp3(s.hipR, s.kneeR, 0.36);
  const c = lerp3(a, b, 0.5);
  const spanF = Math.abs(dot(sub(a, b), f));
  const spanL = Math.abs(dot(sub(a, b), l));
  const rT = B.legR[0] * 1.25;
  const waistC = add(s.pelvis, mul(s.hips[2], B.waist * 0.5));
  return [
    { c: add(c, mul(lag, 0.5)), u: mul(f, Math.max(B.pelvisDeep + 3.4, spanF / 2 + rT + 1.6)), v: mul(l, Math.max(B.pelvisHalf + 3.2, spanL / 2 + rT + 1.4)) },
    { c: add(s.pelvis, mul(s.hips[2], -1)), u: mul(s.hips[0], B.pelvisDeep + 3.2), v: mul(s.hips[1], B.pelvisHalf + 3.0) },
    { c: waistC, u: mul(s.belly[0], B.waistDeep + 2.9), v: mul(s.belly[1], B.waistHalf + 2.8) },
  ];
}

/** THE MANTLE: royal blue velvet from his shoulders down his back to the stones, trailing behind him; its rings from its hem up. */
function mantleRings(s: Skeleton, lag: V3, wind: number): Ring[] {
  const [cf, cl, cu] = s.chest;
  const f = norm([s.hips[0][0], s.hips[0][1], 0], [1, 0, 0]);
  const l: V3 = [-f[1], f[0], 0];
  const sw = Math.sin(wind * Math.PI * 2);
  const knees = lerp3(s.kneeL, s.kneeR, 0.5);
  // (it falls from his hips on past his knees the way his thighs go, to the stones: standing, to the floor behind his
  // heels; crouched, it lies on the stones behind him; in the air, it hangs below his knees; lying down, along his legs)
  const on = add(knees, mul(sub(knees, s.pelvis), 1.0));
  const hemZ = Math.max(1.4, on[2] - 10);
  const back = add(s.pelvis, mul(f, -4));
  const hem: Ring = { c: add([on[0] * 0.4 + back[0] * 0.6 - 6 * f[0] + lag[0] * 2.2, on[1] * 0.4 + back[1] * 0.6 - 6 * f[1] + lag[1] * 2.2, hemZ], mul(l, sw * 0.8)), u: mul(f, B.pelvisDeep + 14), v: mul(l, B.pelvisHalf + 15) };
  const midC: V3 = [s.pelvis[0] * 0.5 + hem.c[0] * 0.5 - 3 * f[0] + lag[0] * 1.2, s.pelvis[1] * 0.5 + hem.c[1] * 0.5 - 3 * f[1] + lag[1] * 1.2, Math.max(hemZ + 4, (knees[2] + s.pelvis[2]) / 2 - 6)];
  return [
    hem,
    { c: midC, u: mul(f, B.pelvisDeep + 9), v: mul(l, B.pelvisHalf + 10) },
    { c: add(s.waist, mul(f, -1)), u: mul(s.belly[0], B.waistDeep + 5.5), v: mul(s.belly[1], B.waistHalf + 6.5) },
    { c: s.ribs, u: mul(cf, B.ribDeep + 4.6), v: mul(cl, B.ribHalf + 5.4) },
    { c: add(s.neck, mul(cu, -2)), u: mul(cf, B.ribDeep + 2.4), v: mul(cl, B.shoulderHalf + 5.2) },
  ];
}

/** His face's ways and where it is (for the crown, the beard, the Hush over him). */
interface HeadAt {
  ff: V3;
  fl: V3;
  fu: V3;
  hc: V3;
  hr: V3;
}
/** HIS HEAD: old and gaunt, hollow-cheeked, deep-eyed, white brows; his long white hair behind; his white beard down over his breastplate; the gold crown, grey fog curling up through it. */
function head(put: Put, st: Stage, s: Skeleton, t: number, lag: V3, fog: [V3, string, number][], crownOn: boolean): HeadAt {
  const [ff, fl, fu] = wornOn(st, s, 14);
  const hr: V3 = [B.headR[0] * 0.98, B.headR[1] * 0.98, B.headR[2] * 1.0];
  const hc = add(s.head, mul(fu, -0.2));
  const skin: Skin = (u, tone) => {
    const fwd = u[0];
    const side = Math.abs(u[1]);
    // his hair, white, over the top of his head and down the back
    if (fwd < -0.25 || u[2] > 0.62) return WHITE[Math.max(1, tone)];
    if (side > 0.88 && u[2] > -0.2) return WHITE[Math.max(1, tone - 1)];
    // his white beard round his jaw and chin
    if (u[2] < -0.52 + 0.35 * Math.max(0, side - 0.5) && fwd > -0.25) return WHITE[Math.min(4, tone + 1)];
    // his eyes, sunk deep under the brows: a dark hollow
    if (fwd > 0.45 && side > 0.14 && side < 0.56 && u[2] > -0.12 && u[2] < 0.14) return u[2] > 0.06 ? SKIN[1] : SKIN[0];
    // his brows, white, heavy, drawn down at the middle
    if (fwd > 0.4 && side < 0.6 && u[2] >= 0.14 && u[2] < 0.26 - 0.1 * side) return WHITE[Math.min(4, tone + 1)];
    // the hollow of his cheeks, under the cheekbones
    if (fwd > 0.35 && side > 0.42 && u[2] < -0.16 && u[2] > -0.44) return SKIN[Math.max(0, tone - 1)];
    // his long nose, lit down its ridge
    if (fwd > 0.86 && side < 0.12 && u[2] > -0.3 && u[2] < 0.12) return SKIN[Math.min(4, tone + 1)];
    // the lines across his brow
    if (fwd > 0.5 && side < 0.42 && (Math.abs(u[2] - 0.36) < 0.025 || Math.abs(u[2] - 0.46) < 0.02)) return SKIN[Math.max(0, tone - 1)];
    return SKIN[Math.max(1, tone)];
  };
  put('head', 'head', { k: 'ball', c: hc, ax: [mul(ff, hr[0]), mul(fl, hr[1]), mul(fu, hr[2])], skin });
  // his eyes: pale, tired, his own (the pink is the Hush's, not his)
  for (const k of [-1, 1]) {
    const e = add(hc, add(mul(ff, hr[0] * 0.86), add(mul(fl, k * hr[1] * 0.34), mul(fu, -hr[2] * 0.02))));
    put('head', 'eyes', { k: 'dot', p: e, c: '#d2ced8', facing: ff, c2: '#4a4454' });
  }
  // his long nose standing off his face
  put('head', 'nose', { k: 'rod', a: add(hc, add(mul(ff, hr[0] * 0.92), mul(fu, hr[2] * 0.08))), b: add(hc, add(mul(ff, hr[0] * 1.1), mul(fu, -hr[2] * 0.26))), ra: 1.0, rb: 1.15, ramp: SKIN });
  // the moustache, drooping long into the beard
  for (const k of [-1, 1]) {
    const a = add(hc, add(mul(ff, hr[0] * 1.0), add(mul(fl, k * hr[1] * 0.1), mul(fu, -hr[2] * 0.36))));
    const b = add(hc, add(mul(ff, hr[0] * 0.95), add(mul(fl, k * hr[1] * 0.5), mul(fu, -hr[2] * 0.6))));
    const c = add(b, add(mul(ff, 0.6), add(mul(fl, k * 0.8), mul(fu, -3.6))));
    put('head', 'beard', { k: 'rod', a, b, ra: 1.05, rb: 0.95, ramp: WHITE });
    put('head', 'beard', { k: 'rod', a: b, b: c, ra: 0.95, rb: 0.45, ramp: WHITE });
  }
  // THE BEARD: long, white and full, from his jaw down over his breastplate to a point at his belly, its locks
  // waving; it falls plumb from his chin, lying on his chest, and sways
  const [cf, cl, cu] = s.chest;
  const sway = Math.sin(t * W2) * 0.6;
  const jaw = add(hc, add(mul(ff, hr[0] * 0.5), mul(fu, -hr[2] * 0.78)));
  const onChest = (k: number): V3 => add(lerp3(lerp3(s.neck, s.ribs, 0.35), lerp3(s.ribs, s.waist, 0.55), k), mul(cf, B.ribDeep + 4.4 - 1.4 * k));
  const mid = add(onChest(0.25), add(mul(cl, sway * 0.6), mul(lag, 0.3)));
  const low = add(onChest(0.8), add(mul(cl, sway * 1.5), mul(lag, 0.7)));
  const tip = add(onChest(1.05), add(mul(cl, sway * 2.0), add(mul(lag, 0.9), mul(cf, 0.6))));
  // (its locks: from his jaw and cheeks, waving down over the breastplate, gathering to a point)
  for (let j = -2; j <= 2; j++) {
    const own = hash(j + 9, 4, 7704);
    const top = add(jaw, add(mul(fl, j * hr[1] * 0.2), add(mul(fu, Math.abs(j) * 0.9), mul(ff, -Math.abs(j) * 0.6))));
    const m1 = add(mid, add(mul(cl, j * 1.25), mul(cf, 0.6 - 0.25 * Math.abs(j))));
    const m2 = add(lerp3(mid, low, 0.6), add(mul(cl, j * 0.85 + Math.sin(t * W2 + j) * 0.4), mul(cf, 0.5 - 0.2 * Math.abs(j))));
    const end = add(lerp3(low, tip, 0.35 + 0.45 * own - 0.15 * Math.abs(j)), mul(cl, j * 0.4));
    const r = 2.0 - 0.25 * Math.abs(j);
    put('beard', 'beard', { k: 'rod', a: top, b: m1, ra: r * 0.9, rb: r, ramp: WHITE });
    put('beard', 'beard', { k: 'rod', a: m1, b: m2, ra: r, rb: r * 0.8, ramp: WHITE });
    put('beard', 'beard', { k: 'rod', a: m2, b: end, ra: r * 0.8, rb: 0.45, ramp: WHITE });
  }
  // HIS HAIR, long and white, down his back under the crown, over the mantle's collar
  const crownC = add(hc, mul(fu, hr[2] * 0.5));
  for (let j = -3; j <= 3; j++) {
    const at = add(hc, add(mul(ff, -hr[0] * 0.72), add(mul(fl, j * hr[1] * 0.28), mul(fu, -hr[2] * 0.15))));
    const pts: V3[] = [add(crownC, add(mul(fl, j * hr[1] * 0.25), mul(ff, -hr[0] * 0.3))), at];
    for (let i = 1; i <= 3; i++) {
      const k = i / 3;
      pts.push(add(at, add([0, 0, -6 * i], add(mul(ff, -1.6 * k), add(mul(lag, 1.2 * k), mul(fl, j * 0.6 * k + Math.sin(t * W2 + j + k * 2) * 0.4 * k))))));
    }
    for (let i = 1; i < pts.length; i++) put('head', 'hair', { k: 'rod', a: pts[i - 1], b: pts[i], ra: 1.5 - 0.14 * i, rb: 1.4 - 0.14 * i, ramp: WHITE });
  }
  if (crownOn) crown(put, hc, ff, fl, fu, hr, t, fog);
  void cu;
  return { ff, fl, fu, hc, hr };
}

/** THE CROWN: a broad gold band at his brow set with sapphires, tall pointed fleurons standing up off it all round; and the Hush's grey fog curling up through it. */
function crown(put: Put, hc: V3, ff: V3, fl: V3, fu: V3, hr: V3, t: number, fog: [V3, string, number][]): void {
  const ring: Ring = { c: add(hc, add(mul(fu, hr[2] * 0.84), mul(ff, -hr[0] * 0.12))), u: mul(ff, hr[0] * 0.8), v: mul(fl, hr[1] * 0.86) };
  put('crown', 'crown', { k: 'band', ring, ramp: GOLD, rows: 2 });
  const N = 8;
  for (let i = 0; i < N; i++) {
    const a = (i / N) * Math.PI * 2;
    const ca = Math.cos(a);
    const sa = Math.sin(a);
    const base = add(ring.c, add(mul(ring.u, ca), mul(ring.v, sa)));
    const outw = norm(add(mul(ff, ca), mul(fl, sa)), ff);
    const tall = i % 2 === 0 ? 8.4 : 5.4;
    const tip = add(base, add(mul(fu, tall), mul(outw, 0.9)));
    // a fleuron: a tapering gold point, two leaves curling off it, and a sapphire at its foot on the band
    put('crown', 'crown', { k: 'rod', a: add(base, mul(fu, 0.6)), b: tip, ra: 1.3, rb: 0.35, ramp: GOLD });
    const side = norm(cross(fu, outw), fl);
    for (const k of [-1, 1]) put('crown', 'crown', { k: 'rod', a: add(base, mul(fu, tall * 0.42)), b: add(base, add(mul(fu, tall * 0.62), mul(side, k * 1.7))), ra: 0.6, rb: 0.3, ramp: GOLD });
    put('crown', 'gem', { k: 'ball', c: add(base, add(mul(outw, 0.7), mul(fu, 0.2))), ax: sphere(i % 2 === 0 ? 1.05 : 0.8), skin: SAPPHIRE });
  }
  // THE FOG IN HIS CROWN: the Hush's grey curling up through it from inside, rising and thinning
  for (let i = 0; i < 18; i++) {
    const life = fr(t / 1.8 + i / 18 + 0.31 * hash(i, 3, 7701));
    const a = hash(i, 4, 7701) * Math.PI * 2 + life * 2.4;
    const r = (hr[1] * 0.55) * (0.4 + 0.6 * hash(i, 5, 7701)) * (1 - 0.4 * life);
    const p = add(ring.c, add(add(mul(ff, Math.cos(a) * r), mul(fl, Math.sin(a) * r)), mul(fu, 1.5 + life * 13)));
    if (life > 0.85) continue;
    fog.push([p, life < 0.25 ? BREATH_PALE : life < 0.55 ? FOG[4] : FOG[3], life < 0.45 ? 2 : 1]);
  }
}

/** HIS GREAT SWORD in his right hand: a gold pommel set with a sapphire, a long grip bound in royal blue, a broad gold cross with down-curved quillons, a broad blade of old steel with a fuller, bright edges. */
function sword(put: Put, s: Skeleton, glint: number): void {
  const w = swordOf(s);
  const flatN = norm(cross(w.way, w.across), [0, 0, 1]);
  put('hilt', 'sword', { k: 'ball', c: w.pommel, ax: [mul(w.way, 2.4), mul(w.across, 2.8), mul(flatN, 1.6)], skin: GOLD });
  put('hilt', 'sword', { k: 'ball', c: add(w.pommel, mul(flatN, 1.3)), ax: sphere(1.0), skin: SAPPHIRE });
  put('hilt', 'sword', { k: 'rod', a: add(w.pommel, mul(w.way, 1.6)), b: add(w.guard, mul(w.way, -0.6)), ra: 1.25, rb: 1.25, ramp: MANTLE });
  for (let k = 0.18; k < 0.95; k += 0.2) put('hilt', 'sword', { k: 'rod', a: lerp3(w.pommel, w.guard, k), b: lerp3(w.pommel, w.guard, k + 0.035), ra: 1.45, rb: 1.45, ramp: GOLD });
  // the cross: out either side, the quillons curving down toward the blade, knobbed
  const Q = SWORD.quillon;
  for (const k of [-1, 1]) {
    const a = add(w.guard, mul(w.across, k * 1.5));
    const b = add(w.guard, add(mul(w.across, k * Q * 0.75), mul(w.way, 0.6)));
    const c = add(w.guard, add(mul(w.across, k * Q), mul(w.way, 2.8)));
    put('hilt', 'sword', { k: 'rod', a, b, ra: 1.5, rb: 1.2, ramp: GOLD });
    put('hilt', 'sword', { k: 'rod', a: b, b: c, ra: 1.2, rb: 0.9, ramp: GOLD });
    put('hilt', 'sword', { k: 'ball', c, ax: sphere(1.3), skin: GOLD });
  }
  put('hilt', 'sword', { k: 'ball', c: w.guard, ax: [mul(w.way, 2.0), mul(w.across, 2.6), mul(flatN, 1.8)], skin: GOLD });
  // the blade: broad at the guard, a ricasso, a fuller down two thirds of it, tapering to the point; its edges bright
  const half = SWORD.half;
  const Lb = SWORD.blade;
  put('blade', 'sword', {
    k: 'panel',
    c: add(w.guard, mul(w.way, Lb / 2 + 0.4)),
    u: mul(w.across, half),
    v: mul(w.way, Lb / 2),
    skin: (a0, b0, front, tone0) => {
      const tone = Math.max(1, Math.min(4, front ? tone0 : tone0 - 1));
      const b = (b0 + Lb / 2) / Lb;
      const wdt = b < 0.06 ? 0.82 : b < 0.78 ? 1 - 0.18 * (b - 0.06) / 0.72 : 0.82 * Math.max(0, (1 - b) / 0.22) ** 0.8;
      const a = Math.abs(a0) / half;
      if (a > wdt) return null;
      if (a > wdt - 0.24) return glint > 0.5 && hash(Math.round(b0), 1, 7702) < 0.5 ? FLAME[3] : b < 0.06 ? BLADE[tone] : EDGE;
      if (b > 0.08 && b < 0.68 && a < 0.2) return BLADE[Math.max(0, tone - 2)];
      // (nicks and old stains along it)
      if (hash(Math.round(b0 / 2.5), Math.round(a0 * 1.2), 7703) < 0.06) return BLADE[Math.max(0, tone - 1)];
      return BLADE[tone];
    },
  });
  if (glint > 0.05) put('glint', 'sword', { k: 'glow', p: w.at(0.55), c: FLAME[1], r: 8 + 10 * glint, a: 0.45 * glint });
}

// =============================================================================================
// THE HUSH: riding his back, and (in his last phase) climbed off to fight at his side

/** THE HUSH AT A MOMENT: where each part of it is (its head and its face's ways, its shoulders, elbows and hands, the middle of its chest, its waist, and the end of the fog it trails), how it hangs back, and how far it has unwound into nothing (0 whole, 1 gone). */
export interface HushPose {
  head: V3;
  face: Rot;
  shL: V3;
  shR: V3;
  elL: V3;
  elR: V3;
  handL: V3;
  handR: V3;
  /** The way each hand's fingers reach (from its wrist). */
  gripL: V3;
  gripR: V3;
  chest: V3;
  /** Its own forward, left and up at its chest. */
  rot: Rot;
  waist: V3;
  tail: V3;
  lag: V3;
  gone: number;
  /** How thick its fog is (1 as it stands; a little thinner riding him, its bulk flattened along his back). */
  bulk: number;
}
/** Two poses of the Hush mixed (`k` of the way from `a` to `b`), each of its ways kept a unit. */
export function hushMix(a: HushPose, b: HushPose, k: number): HushPose {
  const L = (p: V3, q: V3): V3 => lerp3(p, q, k);
  const R = (p: Rot, q: Rot): Rot => {
    const f = norm(L(p[0], q[0]), p[0]);
    const u0 = norm(L(p[2], q[2]), p[2]);
    const u = norm(sub(u0, mul(f, dot(u0, f))), [0, 0, 1]);
    return [f, cross(u, f), u];
  };
  return {
    head: L(a.head, b.head), face: R(a.face, b.face), shL: L(a.shL, b.shL), shR: L(a.shR, b.shR), elL: L(a.elL, b.elL), elR: L(a.elR, b.elR),
    handL: L(a.handL, b.handL), handR: L(a.handR, b.handR), gripL: norm(L(a.gripL, b.gripL)), gripR: norm(L(a.gripR, b.gripR)),
    chest: L(a.chest, b.chest), rot: R(a.rot, b.rot), waist: L(a.waist, b.waist), tail: L(a.tail, b.tail), lag: L(a.lag, b.lag),
    gone: a.gone + (b.gone - a.gone) * k, bulk: a.bulk + (b.bulk - a.bulk) * k,
  };
}
/** The same pose moved along the floor by `by`. */
export function hushMoved(h: HushPose, by: V3): HushPose {
  const M = (p: V3): V3 => add(p, by);
  return { ...h, head: M(h.head), shL: M(h.shL), shR: M(h.shR), elL: M(h.elL), elR: M(h.elR), handL: M(h.handL), handR: M(h.handR), chest: M(h.chest), waist: M(h.waist), tail: M(h.tail) };
}

/**
 * THE HUSH RIDING HIM, from his bones at a moment: lying along his back over the mantle, its shoulders above and behind
 * his, its head looming over his crown and looking out over it the way he faces (turning a little, slowly), its long
 * right arm over his right shoulder and its hand gripping his sword arm above the elbow, its left over his left
 * shoulder and down, its hand clutching at his breast; the fog of it trailing down behind his back to his knees.
 */
export function hushRiding(s: Skeleton, t: number, lag: V3): HushPose {
  const [cf, cl, cu] = s.chest;
  const n = s.neck;
  const breathe = Math.sin(t * W2);
  const look = Math.sin(t * W2 * 0.5);
  // (its head behind his crown and above it, leaning out over him)
  const head = add(n, add(mul(cf, -13.5 + 0.8 * breathe), add(mul(cu, 33 + 1.0 * breathe), mul(cl, 2.6 * look))));
  // (its face out over his head the way he faces, tipped down at you; turning slowly from side to side)
  const ffw = norm(add(add(mul(cf, 1), mul(cu, -0.1)), mul(cl, 0.3 * look)), cf);
  const fu = norm(sub(cu, mul(ffw, dot(cu, ffw))), [0, 0, 1]);
  const face: Rot = [ffw, cross(fu, ffw), fu];
  // (its shoulders hunched up behind his head, above his own)
  const shL = add(n, add(mul(cf, -B.ribDeep - 7), add(mul(cu, 15), mul(cl, 11))));
  const shR = add(n, add(mul(cf, -B.ribDeep - 7), add(mul(cu, 15), mul(cl, -11))));
  // (over his pauldrons: its elbows up on them)
  const elR = add(s.shoulderR, add(mul(cu, B.armR[0] * 2.0 + 3.4), add(mul(cf, 1.5), mul(cl, -2.5))));
  const elL = add(s.shoulderL, add(mul(cu, B.armR[0] * 2.0 + 3.4), add(mul(cf, 2.0), mul(cl, 2.5))));
  // (its right hand round his sword arm above the elbow, on its outside; its left at his breast, at the beard's edge)
  const upperR = norm(sub(s.elbowR, s.shoulderR), [0, 0, -1]);
  const outR = norm(sub(mul(cl, -1), mul(upperR, dot(mul(cl, -1), upperR))), mul(cl, -1));
  const handR = add(lerp3(s.shoulderR, s.elbowR, 0.6), mul(outR, B.armR[0] * 1.12 + 2.4));
  const handL = add(s.ribs, add(mul(cf, B.ribDeep + 5.0), add(mul(cl, B.ribHalf * 0.72), mul(cu, 6.5))));
  const rot: Rot = [cf, cl, cu];
  const chest = add(n, add(mul(cf, -B.ribDeep - 10), mul(cu, 4)));
  const waist = add(s.waist, add(mul(cf, -B.waistDeep - 11), mul(cu, -1)));
  const tail = add(s.pelvis, add(mul(cf, -B.pelvisDeep - 13), add([0, 0, -30], mul(lag, 2.5))));
  return {
    head, face, shL, shR, elL, elR, handL, handR,
    gripR: norm(add(mul(upperR, 0.3), mul(outR, -1))), gripL: norm(add(mul(cf, -1), mul(cu, -0.6))),
    chest, rot, waist, tail, lag, gone: 0, bulk: 0.92,
  };
}

/** THE HUSH STANDING ON ITS OWN, from its own bones (its last phase, beside him). */
export function hushStanding(s: Skeleton, lag: V3, gone = 0): HushPose {
  const [cf, cl, cu] = s.chest;
  return {
    head: s.head, face: s.face, shL: s.shoulderL, shR: s.shoulderR, elL: s.elbowL, elR: s.elbowR, handL: s.handL, handR: s.handR,
    gripL: norm(sub(s.handL, s.elbowL), [0, 0, -1]), gripR: norm(sub(s.handR, s.elbowR), [0, 0, -1]),
    chest: lerp3(s.ribs, s.neck, 0.35), rot: [cf, cl, cu], waist: s.pelvis, tail: add(s.pelvis, add([0, 0, -50], mul(lag, 3))), lag, gone, bulk: 1,
  };
}

/**
 * A LOBE OF FOG: a rounded drift whose edge, where it turns away from the eye, is eaten into in ragged holes (so that a
 * body of them has a torn, drifting outline, never a ball's), its face streaked with darker swirls.
 */
function lobe(put: Put, part: string, c: V3, ax: readonly [V3, V3, V3], eye: V3, seed: number, ramp: Ramp = FOG, ragged = 0.46, open?: (u: V3) => boolean): void {
  const L = ax.map((v) => Math.max(1e-3, len(v)));
  const hat = ax.map((v, i) => mul(v, 1 / L[i]));
  put(part, part, {
    k: 'ball', c, ax,
    skin: (u, tone) => {
      if (open && open(u)) return null;
      const n = norm(add(add(mul(hat[0], u[0] / L[0]), mul(hat[1], u[1] / L[1])), mul(hat[2], u[2] / L[2])));
      const rim = dot(n, eye);
      const q = hash(Math.round(u[0] * 4.2 + seed * 3), Math.round(u[1] * 4.2) + 9 * Math.round(u[2] * 4.2), 7721 + seed);
      if (rim < ragged && q < (ragged - rim) * 2.6) return null;
      const swirl = fr(u[0] * 1.3 + u[2] * 2.1 + Math.sin(u[1] * 3 + seed) * 0.5 + seed * 0.37);
      if (swirl < 0.16) return ramp[Math.max(0, tone - 1)];
      if (swirl > 0.9 && tone >= 2) return ramp[Math.min(4, tone + 1)];
      return ramp[tone];
    },
  });
}
export function hushParts(put: Put, H: HushPose, t: number, fog: [V3, string, number][], seed = 0, eye: V3 = [0.6, 0.6, 0.5]): void {
  const gone = clamp01(H.gone);
  if (gone >= 0.999) return;
  const thin = 1 - 0.85 * gone;
  const [hf, hl, hu] = H.face;
  // ITS BODY: a hunched drift of fog lobes along its spine, broad at the shoulders, narrowing to a tattered point below
  const [bf, bl] = H.rot;
  const k = (1 - 0.92 * clamp01(H.gone * 1.4)) * H.bulk;
  const shM = lerp3(H.shL, H.shR, 0.5);
  const wide = len(sub(H.shL, H.shR)) / 2;
  const sway = Math.sin(t * W2) * 1.2;
  const lowP = add(H.tail, add(mul(H.lag, 0.5), mul(bl, sway * 0.6)));
  const spine: [V3, number, number][] = [
    [lerp3(shM, H.head, 0.32), 4.6, 5.4],
    [shM, 5.2, wide + 1.6],
    [H.chest, 5.4, wide + 1.2],
    [H.waist, 4.6, 8],
    [add(lerp3(H.waist, lowP, 0.42), mul(bl, sway * 0.3)), 3.4, 5.2],
  ];
  if (gone < 0.8) {
    for (let i = 0; i < spine.length; i++) {
      const [c, deep, w] = spine[i];
      const prev = spine[Math.max(0, i - 1)][0];
      const next = spine[Math.min(spine.length - 1, i + 1)][0];
      const along = norm(sub(prev, next), [0, 0, 1]);
      const tall = Math.max(3, len(sub(prev, next)) * 0.62);
      const f2 = norm(sub(bf, mul(along, dot(bf, along))), bf);
      const l2 = norm(cross(along, f2), bl);
      lobe(put, 'hush', c, [mul(f2, deep * k), mul(l2, w * k), mul(along, tall * k)], eye, seed + i);
    }
    // (its shoulders hunched up either side of its head)
    for (const sh of [H.shL, H.shR]) lobe(put, 'hush', add(sh, mul(H.rot[2], 1.5)), [mul(bf, 4.4 * k), mul(bl, 4.8 * k), mul(H.rot[2], 4.0 * k)], eye, seed + 11);
    // (tattered tongues of it hanging below, swaying)
    for (let j = 0; j < 7; j++) {
      const at = add(lerp3(H.waist, lowP, 0.12 + 0.05 * (j % 3)), mul(bl, (j - 3) * 2.2 * k));
      const sw = Math.sin(t * W2 + j * 1.7);
      const long = len(sub(lowP, H.waist)) * (0.75 + 0.35 * hash(j, seed, 7724));
      const mid = add(at, add([0, 0, -long * 0.5], add(mul(H.lag, 1.2), mul(bl, sw * 1.2))));
      const end = add(at, add([0, 0, -long], add(mul(H.lag, 2.4), add(mul(bl, sw * 2.2 + (j - 3) * 0.8), mul(bf, -1.5)))));
      put('hush', 'hush', { k: 'rod', a: at, b: mid, ra: 2.3 * k, rb: 1.6 * k, ramp: FOG });
      put('hush', 'hush', { k: 'rod', a: mid, b: end, ra: 1.6 * k, rb: 0.35, ramp: FOG });
    }
  }
  // ITS ARMS: long and thin, a little thicker at the shoulder; long fingers, curled to grip
  const arms: ['L' | 'R', V3, V3, V3, V3][] = [['L', H.shL, H.elL, H.handL, H.gripL], ['R', H.shR, H.elR, H.handR, H.gripR]];
  for (const [side, sh, el, hand, grip] of arms) {
    if (gone > 0.6 + (side === 'L' ? 0 : 0.08)) continue;
    const part = `hushArm${side}`;
    put(part, part, { k: 'rod', a: sh, b: el, ra: 3.2 * thin, rb: 2.3 * thin, ramp: FOG });
    put(part, part, { k: 'ball', c: el, ax: sphere(2.4 * thin), skin: FOG });
    put(part, part, { k: 'rod', a: el, b: hand, ra: 2.3 * thin, rb: 1.5 * thin, ramp: FOG });
    // (the hand: a narrow palm, four long fingers curling round what it grips, pale at their tips)
    const fore = norm(sub(hand, el), [0, 0, -1]);
    const g = norm(grip, fore);
    const across = norm(cross(fore, g), hl);
    put(part, part, { k: 'ball', c: add(hand, mul(fore, 0.8)), ax: [mul(fore, 2.0 * thin), mul(across, 1.8 * thin), mul(g, 1.0 * thin)], skin: FOG });
    // (rags of fog hanging off its forearm, swaying)
    for (let j = 0; j < 2; j++) {
      const at = lerp3(el, hand, 0.3 + 0.35 * j);
      const sw = Math.sin(t * W2 + j * 2 + (side === 'L' ? 0 : 1.3));
      const end = add(at, add([0, 0, -(6 + 3 * j) * thin], add(mul(H.lag, 1.5), [sw * 1.2, -sw * 0.8, 0])));
      put(part, part, { k: 'rod', a: at, b: end, ra: 1.2 * thin, rb: 0.35, ramp: FOG });
    }
    for (let i = 0; i < 4; i++) {
      const sp = (i - 1.5) * 0.85;
      const base = add(hand, add(mul(fore, 2.2), mul(across, sp)));
      const m1 = add(base, add(mul(fore, 2.4), mul(g, 1.6)));
      const tip = add(m1, add(mul(fore, 0.8), mul(g, 2.6)));
      put(part, part, { k: 'rod', a: base, b: m1, ra: 0.75 * thin, rb: 0.6 * thin, ramp: FOG });
      put(part, part, { k: 'rod', a: m1, b: tip, ra: 0.6 * thin, rb: 0.35, ramp: MASK });
    }
  }
  // ITS HEAD: a hood of fog, the mask of a face hung in it
  if (gone < 0.9) {
    const hr: V3 = [6.4 * thin, 6.0 * thin, 9.4 * thin];
    const hc = H.head;
    // (the hood: a cowl of fog round the mask, drooping back into its body)
    lobe(put, 'hushHead', add(hc, add(mul(hf, -3.6), mul(hu, 1.8))), [mul(hf, hr[0] * 1.0), mul(hl, hr[1] * 1.22), mul(hu, hr[2] * 1.04)], eye, seed + 21, COWL, 0.22, (u) => u[0] > 0.05 && Math.abs(u[1]) < 0.74 && u[2] < 0.66);
    lobe(put, 'hushHead', add(hc, add(mul(hf, -7.5), mul(hu, -3.5))), [mul(hf, hr[0] * 0.85), mul(hl, hr[1] * 1.05), mul(hu, hr[2] * 0.85)], eye, seed + 22, COWL, 0.22);
    put('hushHead', 'mask', {
      k: 'ball', c: add(hc, add(mul(hf, 0.6), mul(hu, -0.8))), ax: [mul(hf, hr[0] * 0.82), mul(hl, hr[1] * 0.84), mul(hu, hr[2] * 0.96)],
      skin: (u, tone) => {
        if (u[0] < 0.2) return null;
        const side = Math.abs(u[1]);
        // its eyes: two long hollows slanting down outward
        const ey = 0.18 - 0.22 * side;
        if (side > 0.14 && side < 0.58 && Math.abs(u[2] - ey) < 0.12 + 0.06 * (0.58 - side)) return HOLLOW;
        // its mouth: a long dark gape, narrow, from under the nose down the long chin
        if (side < 0.13 - 0.05 * Math.max(0, -u[2] - 0.5) && u[2] < -0.22 && u[2] > -0.78) return HOLLOW;
        // the cheekbones high and sharp, the cheeks fallen in beneath them
        if (side > 0.36 && u[2] < -0.06 && u[2] > -0.42) return MASK[Math.max(0, tone - 1)];
        if (u[0] > 0.85 && side < 0.1 && u[2] > -0.16 && u[2] < 0.18) return MASK[Math.min(4, tone + 1)];
        return MASK[tone];
      },
    });
    // the dull pink in its hollows: the Hush's eyes (going out last as it unwinds)
    if (gone < 0.85) {
      for (const k of [-1, 1]) {
        const e = add(hc, add(mul(hf, 0.6 + hr[0] * 0.82 * 0.86), add(mul(hl, k * hr[1] * 0.84 * 0.36), mul(hu, -0.8 + hr[2] * 0.96 * 0.1))));
        put('hushHead', 'eyes', { k: 'dot', p: e, c: FLAME[1], facing: hf, c2: FLAME[2] });
      }
    }
  }
  // ITS FOG: wisps streaming off it and up, many more as it unwinds, spiralling up into nothing
  const N = Math.round(30 + 40 * gone);
  const from = [H.head, H.chest, H.waist, H.tail, H.shL, H.shR, H.handL, H.handR];
  for (let i = 0; i < N; i++) {
    const life = fr(t * (1 / 1.8 + 0.6 * gone) + i / N + 0.29 * hash(i, seed, 7711));
    if (life > 0.82) continue;
    const at = from[i % from.length];
    const a = hash(i, seed + 1, 7711) * Math.PI * 2 + life * (2 + 6 * gone);
    const r = (2 + 6 * hash(i, seed + 2, 7711)) * (1 + 2.5 * gone * life);
    const p = add(at, [Math.cos(a) * r - H.lag[0] * 2 * life, Math.sin(a) * r - H.lag[1] * 2 * life, life * (8 + 22 * gone)]);
    fog.push([p, life < 0.2 ? BREATH_PALE : life < 0.5 ? FOG[4] : FOG[3], life < 0.35 ? 2 : 1]);
  }
}

// =============================================================================================
// HIS PAINTER

/** What a moment of a move says of him over and above the bones. */
export interface KingSay {
  /** The Hush as it is now: riding him (`'riding'`), somewhere else on his picture (climbing off), or not with him (null). */
  hush: (m: Moment) => 'riding' | HushPose | null;
  /** How far the Hush has unwound into nothing (his death). */
  unwind?: (m: Moment) => number;
  /** Whether his sword has fallen from his hand, and where it lies then (its pommel, the way it points, its flat). */
  dropped?: (m: Moment) => { pommel: V3; way: V3; across: V3 } | null;
  /** Whether his crown is on his head; if not, where it lies. */
  crown?: (m: Moment) => { c: V3; up: V3; fwd: V3 } | null;
  /** THE SMEAR OF A LIGHTNING STRIKE (his Movement 9): after-images of what strikes, each a line of points, the oldest first. */
  smear?: (m: Moment) => V3[][] | null;
  /** Grains of his own move laid after his edge (sparks off his sword's point, the stones kicked up). */
  more?: (m: Moment) => [V3, string, number][];
}

/** The smear's after-images: the oldest a dull violet-grey, the newest near white. */
export const SMEAR = ['#6e6a8a', '#aeaac4', '#eeecf4'];

const FOGGED = new WeakMap<Moment, [V3, string, number][]>();
function kingBits(st: Stage, m: Moment, say: KingSay): Bit[] {
  const { s } = m;
  const bits: Bit[] = [];
  const fog: [V3, string, number][] = [];
  FOGGED.set(m, fog);
  // (nothing of him into the stones: what he wears and holds lies on them, pressed flat where it would go in, as his
  // mantle, his beard and his plate do as he lies down)
  const put: Put = (part, piece, shape) => bits.push({ part, piece, shape: onTheStones(shape) });
  const lag = lagOf(m, 1.6, 6);
  const t = m.t;
  const [cf, cl, cu] = s.chest;
  for (const side of ['L', 'R'] as const) leg(put, s, side);
  // THE MANTLE, down his back to the stones (its inside shows either side of him from in front)
  put('mantle', 'mantle', { k: 'cloth', rings: mantleRings(s, lag, m.wind), ramp: MANTLE, look: { arc: [96, 264], folds: [130, 155, 180, 205, 230], lift: 0.06, lining: 0.42 } });
  // THE FAULD, THE BREASTPLATE, the gold edging and ridge, the gorget and the belt
  put('fauld', 'fauld', { k: 'cloth', rings: fauldRings(s, lag), ramp: ROYAL, look: { folds: [0, 30, -30, 65, -65, 110, -110, 150, -150, 180], lift: 0.08 } });
  const fr0 = fauldRings(s, lag);
  for (const k of [0.0, 0.5]) put('fauld', 'fauldGold', { k: 'band', ring: { c: lerp3(fr0[0].c, fr0[1].c, k), u: mul(lerp3(fr0[0].u, fr0[1].u, k), 1.02), v: mul(lerp3(fr0[0].v, fr0[1].v, k), 1.02) }, ramp: GOLD, rows: 1 });
  const cr = cuirassRings(s);
  put('body', 'cuirass', { k: 'cloth', rings: cr, ramp: ROYAL, look: { folds: [0], lift: 0.04 } });
  put('body', 'trim', { k: 'band', ring: { ...cr[0], u: mul(cr[0].u, 1.04), v: mul(cr[0].v, 1.04) }, ramp: GOLD, rows: 2 });
  put('body', 'trim', { k: 'band', ring: { ...cr[3], u: mul(cr[3].u, 1.03), v: mul(cr[3].v, 1.03) }, ramp: GOLD, rows: 2 });
  // (the gold ridge down its front, and gold scrolls either side of it at the breast)
  for (let i = 0; i < 3; i++) {
    const a = lerp3(cr[i].c, cr[i + 1].c, 0);
    const b = cr[i + 1].c;
    put('body', 'trim', { k: 'rod', a: add(a, mul(i === 0 ? s.belly[0] : cf, len(cr[i].u) + 0.35)), b: add(b, mul(cf, len(cr[i + 1].u) + 0.35)), ra: 0.9, rb: 0.9, ramp: GOLD });
  }
  for (const k of [-1, 1]) {
    for (let j = 0; j < 5; j++) {
      const a0 = (j / 4) * 1.6 - 0.2;
      const p = add(add(lerp3(s.ribs, s.neck, 0.18 + 0.1 * Math.sin(a0 * 2)), mul(cl, k * (B.ribHalf * 0.38 + 3.2 * Math.cos(a0)))), mul(cf, B.ribDeep + 3.1));
      put('body', 'trim', { k: 'ball', c: p, ax: sphere(0.85), skin: GOLD });
    }
  }
  put('neck', 'gorget', { k: 'band', ring: { c: add(s.neck, mul(cu, -0.4)), u: mul(cf, 5.6), v: mul(cl, 6.6) }, ramp: GOLD, rows: 3 });
  put('neck', 'neck', { k: 'rod', a: add(s.neck, mul(cu, -1)), b: lerp3(s.neck, s.head, 0.5), ra: 3.4, rb: 3.0, ramp: SKIN });
  const waistC = add(s.pelvis, mul(s.hips[2], B.waist * 0.5));
  put('body', 'belt', { k: 'band', ring: { c: waistC, u: mul(s.belly[0], B.waistDeep + 3.1), v: mul(s.belly[1], B.waistHalf + 3.1) }, ramp: GOLD, rows: 2 });
  // THE ROYAL SWAN in old gold: on the fauld before him, under his beard; and large on his mantle's back (hidden while the Hush rides him)
  swanOn(put, 'mantle', add(add(s.ribs, mul(cf, -(B.ribDeep + 7.6))), mul(cu, -4)), mul(cf, -1), cl, cu, 8.5, 9.0, true);
  // THE ERMINE COLLAR of the mantle over his shoulders, its black tails
  const col: Ring[] = [
    { c: add(lerp3(s.ribs, s.neck, 0.78), mul(cf, -1)), u: mul(cf, B.ribDeep + 3.6), v: mul(cl, B.shoulderHalf + 2.2) },
    { c: add(s.neck, mul(cu, 1.0)), u: mul(cf, 6.6), v: mul(cl, 8.0) },
  ];
  put('collar', 'collar', { k: 'cloth', rings: col, ramp: ERMINE, look: { arc: [70, 290], lift: 0.25 } });
  for (let i = 0; i < 9; i++) {
    const a = ((80 + (i * 200) / 8) * Math.PI) / 180;
    const r = col[0];
    const p = add(lerp3(r.c, col[1].c, 0.45), add(mul(r.u, Math.cos(a) * 0.93), mul(r.v, Math.sin(a) * 0.93)));
    put('collar', 'tails', { k: 'ball', c: p, ax: [mul(cu, 1.1), mul(cl, 0.5), mul(cf, 0.5)], skin: [ERMINE_TAIL, ERMINE_TAIL, ERMINE_TAIL, '#2a2632', '#2a2632'] });
  }
  // HIS ARMS: the right fist closed on his sword's grip (if he holds it); the left closed on it too, or hanging
  const fallen = say.dropped?.(m) ?? null;
  arm(put, s, 'L', m.q.lhIn === 3 ? 1 : 0.35);
  arm(put, s, 'R', fallen ? 0.3 : 1);
  const crownLies = say.crown?.(m) ?? null;
  const hd = head(put, st, s, t, lag, fog, !crownLies);
  if (crownLies) {
    const up = crownLies.up;
    const fwd = norm(sub(crownLies.fwd, mul(up, dot(crownLies.fwd, up))), [1, 0, 0]);
    crown(put, crownLies.c, fwd, cross(up, fwd), up, hd.hr, t, []);
  }
  // HIS GREAT SWORD
  if (!fallen) sword(put, s, clamp01(m.glint));
  else {
    const fake = { ...s, handR: add(fallen.pommel, mul(fallen.way, SWORD.pommel)), point: fallen.way, across: fallen.across } as Skeleton;
    sword(put, fake, 0);
  }
  // THE HUSH, riding his back or beside him
  const h = say.hush(m);
  if (h) {
    const H = h === 'riding' ? hushRiding(s, t, lag) : h;
    const un = say.unwind?.(m) ?? 0;
    hushParts(put, un > 0 ? { ...H, gone: Math.max(H.gone, un) } : H, t, fog, 0, st.eye);
  }
  // THE SMEAR of a lightning strike
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
  fog.push(...(say.more?.(m) ?? []));
  void INK;
  return bits;
}

/** A solid kept out of the stones (its lowest just on them): a rod's ends lifted, a ball or a ring lifted or pressed flat. */
const ABOVE = 0.4;
function onTheStones(sh: Shape): Shape {
  const up = (p: V3, r: number): V3 => (p[2] - r < ABOVE ? [p[0], p[1], r + ABOVE] : p);
  const flat = (r: Ring): Ring => {
    const down = Math.hypot(r.u[2], r.v[2]);
    if (r.c[2] - down >= ABOVE) return r;
    const k = Math.max(0, Math.min(1, (r.c[2] - ABOVE) / Math.max(1e-6, down)));
    const c: V3 = r.c[2] < ABOVE ? [r.c[0], r.c[1], ABOVE] : r.c;
    return { ...r, c, u: [r.u[0], r.u[1], r.u[2] * k], v: [r.v[0], r.v[1], r.v[2] * k] };
  };
  switch (sh.k) {
    case 'rod':
      return sh.a[2] - sh.ra < ABOVE || sh.b[2] - sh.rb < ABOVE ? { ...sh, a: up(sh.a, sh.ra), b: up(sh.b, sh.rb) } : sh;
    case 'ball': {
      const down = Math.hypot(sh.ax[0][2], sh.ax[1][2], sh.ax[2][2]);
      return sh.c[2] - down < ABOVE ? { ...sh, c: [sh.c[0], sh.c[1], down + ABOVE] } : sh;
    }
    case 'band':
      return { ...sh, ring: flat(sh.ring) };
    case 'cloth':
      return { ...sh, rings: sh.rings.map(flat) };
    case 'panel': {
      const down = Math.abs(sh.u[2]) + Math.abs(sh.v[2]);
      return sh.c[2] - down < ABOVE ? { ...sh, c: [sh.c[0], sh.c[1], down + ABOVE] } : sh;
    }
    default:
      return sh;
  }
}

/** HIM AS THE PAINTER TAKES HIM. */
export function kingPainter(say: KingSay): { bits: (st: Stage, m: Moment) => Bit[]; grains: (st: Stage, m: Moment) => ReadonlyArray<readonly [V3, string, number]> } {
  return { bits: (st, m) => kingBits(st, m, say), grains: (_st, m) => FOGGED.get(m) ?? [] };
}

// =============================================================================================
// THE HUSH ON ITS OWN BONES (his last phase: climbed off him, at his side)

/** Tall, gaunt, its arms long past its knees; it has no legs to speak of: below its waist it is a drift of fog that never touches the floor. */
export const HUSH_BODY: Build = buildOf(104, 1.0, { shoulders: 0.92, chest: 0.72, depth: 0.7, waist: 0.55, hips: 0.6, legs: 1.0, arms: 1.42, trunk: 1.12, limbs: 0.72, pad: 1.2 });
export const HUSH_CANVAS: MobCanvas = { w: 200, h: 220, ax: 100, ay: 196 };
/** How far it hovers: the tip of its fog off the floor by a hand. */
export const HUSH_HOVER = 9;
/** Its rest: hovering, hunched forward, its head pushed out low before it, its long arms hanging, its fingers loose. */
export const HUSH_REST: Bones = {
  ...standing(HUSH_BODY),
  pz: HUSH_HOVER, pitch: 3, bend: 9, faceUp: 2, faceTurn: 0, faceTilt: 4,
  lfx: 0, lfy: 0, lfz: HUSH_HOVER, rfx: 0, rfy: 0, rfz: HUSH_HOVER, lk: 10, rk: -10,
  lhIn: 0, lhx: 9, lhy: 5, lhz: -51, le: -8, rhIn: 0, rhx: 9, rhy: -5, rhz: -51, re: 8,
} as Bones;

const HUSH_FOG = new WeakMap<Moment, [V3, string, number][]>();
/** THE HUSH ON ITS OWN, as the painter takes it (`gone`: how far it has unwound, by the moment). */
export function hushPainter(gone: (m: Moment) => number): { bits: (st: Stage, m: Moment) => Bit[]; grains: (st: Stage, m: Moment) => ReadonlyArray<readonly [V3, string, number]> } {
  return {
    bits: (st, m) => {
      const bits: Bit[] = [];
      const fog: [V3, string, number][] = [];
      HUSH_FOG.set(m, fog);
      const put: Put = (part, piece, shape) => bits.push({ part, piece, shape });
      hushParts(put, hushStanding(m.s, lagOf(m, 1.6, 6), gone(m)), m.t, fog, 3, st.eye);
      return bits;
    },
    grains: (_st, m) => HUSH_FOG.get(m) ?? [],
  };
}
