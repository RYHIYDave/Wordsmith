// FLOOR 18'S LADIES-IN-WAITING (THE GLASS GALLERY), A SMALL MOB (the art chat, 29 Oct 2026). A MOCK-UP: NOT IN THE GAME.
// Nothing of the game imports this file; `LADIES_ON` is off. Their moves are art/gallery_ladies_moves.ts; the light their
// mirrors throw on the floor, art/gallery_ladies_fx.ts.
//
// The floor, as he approved its plan: THE GLASS GALLERY, the queen's wing, long galleries of mirrors and a great glasshouse
// on the roof; its palette silver, cold blue glass, dark violet; her mirror from the Grimms' "Snow White" (1812), only from
// the book; “Enemies: ladies-in-waiting, the queen's guard, and your own reflections”; its story, “the queen gave the Hush
// every voice in her court in return for her mirror's.”
//
// HIS PICK for how they move, offered as a pop-up: “Gliding in a line, quick (Recommended)”. The rest of the brief as
// offered: the queen's ladies in silver-grey gowns with high lace collars, hair pinned up, each holding a hand mirror;
// Hushed, grey breath; the knight's size, in crowds, fun to smash; they glide in a neat line, then dart at you; known by
// the hand mirrors held up to their faces; one attack, a flash from the hand mirror, a short bright beam of cold light
// (silver, never cyan); dying, the mirror cracks, the Hush leaves them, they sink to the floor; never ghosts, never
// witches, never gory; silk rustling, a mirror's crack.
//
// THEIR LOOK: grown women of the court, the knight's height with their hair up; powdered and drained grey by the Hush,
// the cult's dull pink in their eyes, lips parted on words that make no sound, grey breath leaking out. Their gowns the
// queen's livery: silver-grey satin, a fitted bodice with a long pointed stomacher of dark violet worked with silver, sleeves
// puffed and paned at the shoulder and close to the wrist, falling lace at the cuffs; a full bell skirt to the floor over
// a farthingale, open down the front on a forepart of the same dark violet; and standing up behind the head from the
// shoulders, A HIGH FAN COLLAR OF LACE, pleated, its edge in points. Their dark hair drawn up off the face into a high
// coil at the crown, pinned with silver and pearl, a ringlet left at each temple. Each holds A HAND MIRROR up to her face:
// an oval of cold glass in a silver frame on a short handle. Not the Princess (no violet gown, no loose hair, no nettles),
// not the masque's dancers (no masks, no ribbons, no dance). Nothing cyan anywhere: the glass is a cold grey-blue.

import { BREATH_PALE, hushBreath, hushLeaves, lagOf } from './hushed';
import { INK, hash } from './kit';
import type { Ramp } from './kit';
import { FLAME } from './mkit';
import { sphere } from './new_mobs3';
import type { Bit, MobCanvas, Moment, Put } from './new_mobs3';
import { wornOn } from './skin';
import type { Ring, Skin, Stage } from './skin';
import { add, buildOf, cross, dot, lerp3, mul, norm, sub } from './skeleton';
import type { Build, Skeleton, V3 } from './skeleton';

/** THE SWITCH, OFF. Nothing of the game reads this file. */
export const LADIES_ON = { on: false };

const clamp01 = (v: number): number => Math.max(0, Math.min(1, v));

// =============================================================================================
// THEIR COLOURS: the queen's silver livery, the gallery's dark violet; nothing cyan (the glass a cold grey-blue)

/** The gown: silver-grey satin, cool. */
export const GOWN: Ramp = ['#1e2236', '#343c58', '#56607e', '#8690b0', '#bcc4dc'];
/** The forepart and the stomacher: the gallery's dark violet. */
export const VIOLET: Ramp = ['#1c1028', '#2e1c42', '#44295e', '#5e3c7e', '#7a569c'];
/** Silver thread, a pin, the mirror's frame. */
export const SILVER: Ramp = ['#34344a', '#5e5e76', '#9a9aae', '#cccce0', '#f4f4fc'];
/** Lace: white gone a little lilac in the gallery's light. */
export const LACE: Ramp = ['#6e6c86', '#a4a2b8', '#d0cedc', '#ecebf2', '#fdfcff'];
/** Their skin: powdered, and drained grey by the Hush. */
export const SKIN: Ramp = ['#5e5258', '#857880', '#a89aa0', '#c8bcbe', '#ddd2d2'];
/** Their hair, dark, drawn up. */
const HAIR: Ramp = ['#120e12', '#1e181e', '#2e242c', '#42363e', '#584852'];
/** The glass: a cold grey-blue (hue about 225; never cyan). */
export const GLASS: Ramp = ['#1a1e2c', '#2a3044', '#465068', '#727c98', '#a6aec8'];
const PEARL = '#e8e4ee';
const LIPS: Ramp = ['#3e2e36', '#523a44', '#6a4c56', '#80606a', '#94747c'];

// =============================================================================================
// THE BODY

/** A grown woman of the court: slender, narrow in the waist; with her hair up, the knight's height (58). */
export const LADY_BODY: Build = buildOf(55, 1.16, { shoulders: 0.84, chest: 0.88, depth: 0.88, waist: 0.66, hips: 0.98, legs: 1.0, arms: 0.92, trunk: 1.0, limbs: 0.78 });
const B = LADY_BODY;
/** Her picture: room for her dart (two and a half tiles on) and her mirror's beam (four and a half tiles out). */
export const LADY_CANVAS: MobCanvas = { w: 256, h: 252, ax: 54, ay: 146 };

// =============================================================================================
// THE HAND MIRROR

/** Its handle from the fist to the frame; the oval's half-height (along the handle) and half-width; how thick. */
export const MIRROR = { handle: 3.8, butt: 1.8, ry: 5.2, rx: 4.1, thick: 0.65 } as const;
/**
 * The mirror as it is at a moment, from the bones: held in the right fist, its handle along the way what is held points
 * (`s.point`), its glass facing the way across it (`s.across`); its middle, its glass's face, and the line across it.
 */
export function mirrorOf(s: Skeleton): { grip: V3; up: V3; n: V3; side: V3; c: V3; face: V3; butt: V3; neck: V3 } {
  const up = s.point;
  const n = norm(sub(s.across, mul(up, dot(s.across, up))), [1, 0, 0]);
  const side = norm(cross(n, up), [0, 1, 0]);
  const grip = s.handR;
  const neck = add(grip, mul(up, MIRROR.handle));
  const c = add(neck, mul(up, MIRROR.ry));
  return { grip, up, n, side, c, face: add(c, mul(n, MIRROR.thick + 0.2)), butt: add(grip, mul(up, -MIRROR.butt)), neck };
}

/** THE MIRROR: the handle and its knob, the silver frame, the glass (or its engraved back), a glint on it as she winds up, and cracks as she dies. */
function mirror(put: Put, s: Skeleton, glint: number, crack: number, t: number): void {
  const k = mirrorOf(s);
  put('mirror', 'mirror', { k: 'rod', a: k.butt, b: add(k.neck, mul(k.up, 0.6)), ra: 0.62, rb: 0.5, ramp: SILVER });
  put('mirror', 'mirror', { k: 'ball', c: k.butt, ax: sphere(0.85), skin: SILVER });
  put('mirror', 'mirror', { k: 'ball', c: add(k.neck, mul(k.up, -0.3)), ax: [mul(k.up, 0.9), mul(k.side, 1.1), mul(k.n, 0.7)], skin: SILVER });
  // (the oval: its frame a band of silver round its edge; inside, on the glass side, the glass; on the back, engraved silver)
  const glass: Skin = (u, tone) => {
    const r = Math.hypot(u[0], u[1]);
    if (r > 0.72) {
      // (the frame, bright silver beaded every few steps round it, a dark lip at its very edge)
      const a = Math.atan2(u[1], u[0]);
      const bead = Math.cos(a * 10) > 0.4;
      return r > 0.95 ? SILVER[Math.max(0, tone - 2)] : SILVER[bead ? 4 : 3];
    }
    if (u[2] < 0) {
      // the back: a field of blued steel, an engraved star of silver across it, a bright boss at its middle
      if (r < 0.2) return SILVER[4];
      const a = Math.atan2(u[1], u[0]);
      const ray = Math.abs(Math.sin(a * 2)) < 0.2 * (1 - r) + 0.06;
      return ray ? SILVER[3] : GLASS[Math.max(1, Math.min(2, tone - 1))];
    }
    // the glass: cold, with a streak of light across it
    if (crack > 0) {
      const a = Math.atan2(u[1], u[0]);
      const spoke = Math.abs(Math.sin(a * 3.5 + 0.7));
      const ring = Math.abs(r - 0.42);
      if (r < 0.75 * crack && (spoke < 0.07 + 0.05 / Math.max(0.15, r) * 0.1 || (ring < 0.04 && crack > 0.5))) return r < 0.3 ? '#f0eef6' : INK;
      if (crack > 0.7 && r < 0.12) return '#f0eef6';
    }
    const streak = Math.abs(u[0] * 0.7 + u[1] * 0.7 - 0.15 + 0.05 * Math.sin(t * 2)) < 0.12;
    return streak ? GLASS[Math.min(4, tone + 1)] : GLASS[Math.max(1, tone)];
  };
  put('mirror', 'mirror', { k: 'ball', c: k.c, ax: [mul(k.up, MIRROR.ry), mul(k.side, MIRROR.rx), mul(k.n, MIRROR.thick)], skin: glass });
  if (glint > 0.05) put('mirror', 'glint', { k: 'glow', p: k.face, c: '#e2dcf6', r: 6 + 12 * glint, a: 0.34 * glint });
}

// =============================================================================================
// THE GOWN

/** A sleeve: puffed and paned at the shoulder (silver, the violet showing through its slashes), close to the wrist; falling lace at the cuff; a slender grey hand, loose or closed on the mirror's handle. */
function arm(put: Put, s: Skeleton, side: 'L' | 'R', cu: V3, grip: number): void {
  const sh = side === 'L' ? s.shoulderL : s.shoulderR;
  const el = side === 'L' ? s.elbowL : s.elbowR;
  const hand = side === 'L' ? s.handL : s.handR;
  const [r0, r1, r2] = B.armR;
  const upper = norm(sub(el, sh), [0, 0, -1]);
  const fore = norm(sub(hand, el), [0, 0, -1]);
  // (the puff: round the top of the arm, its panes running down it, the violet between them)
  const pa = norm(cross(upper, Math.abs(upper[2]) < 0.9 ? [0, 0, 1] : [1, 0, 0]), [1, 0, 0]);
  const pb = norm(cross(upper, pa), [0, 1, 0]);
  const paned: Skin = (u, tone) => {
    const a = Math.atan2(u[2], u[1]);
    return Math.cos(a * 4) > 0.55 && u[0] > -0.7 ? VIOLET[Math.min(4, tone + 1)] : GOWN[tone];
  };
  put(`arm${side}`, `puff${side}`, { k: 'ball', c: add(sh, mul(upper, r0 * 1.2)), ax: [mul(upper, r0 * 2.4), mul(pa, r0 * 2.15), mul(pb, r0 * 2.15)], skin: paned, far: true });
  put(`arm${side}`, `arm${side}`, { k: 'rod', a: add(sh, mul(upper, r0 * 1.6)), b: el, ra: r0 * 1.12, rb: r1 * 1.08, ramp: GOWN, far: true });
  put(`fore${side}`, `fore${side}`, { k: 'ball', c: el, ax: sphere(r1 * 1.1), skin: GOWN, far: true });
  const wrist = add(hand, mul(fore, -1.2));
  put(`fore${side}`, `fore${side}`, { k: 'rod', a: el, b: wrist, ra: r1 * 1.05, rb: r2 * 1.12, ramp: GOWN, far: true });
  // the falling lace at the wrist, flaring out over the back of the hand
  put(`fore${side}`, `cuff${side}`, { k: 'rod', a: lerp3(el, wrist, 0.8), b: add(wrist, mul(fore, 0.35)), ra: r2 * 1.15, rb: r2 * 1.7, ramp: LACE, far: true });
  // the hand, long-fingered (one put down on the floor lies flat on it, its fingers spread along it)
  const flat = clamp01((4.5 - hand[2]) / 2.5);
  const way = flat > 0 ? norm(lerp3(fore, norm([fore[0], fore[1], 0], [1, 0, 0]), flat), fore) : fore;
  const up0 = norm(sub(cu, mul(way, dot(cu, way))), [0, 0, 1]);
  const e1 = flat > 0 ? norm(lerp3(up0, [0, 0, 1], flat), up0) : up0;
  const e2 = norm(cross(way, e1), [0, 1, 0]);
  const onFloor = (p: V3): V3 => (flat > 0 ? [p[0], p[1], Math.max(p[2], 0.8)] : p);
  put(`hand${side}`, `hand${side}`, { k: 'ball', c: onFloor(add(hand, mul(way, 0.4))), ax: [mul(way, 1.55), mul(e2, 1.25), mul(e1, 0.72)], skin: SKIN, far: true });
  for (let i = 0; i < 4; i++) {
    const spread = (i - 1.5) * (0.3 + 0.15 * flat);
    const base = onFloor(add(hand, add(mul(way, 1.25), mul(e2, spread * 0.8))));
    const mid = onFloor(add(base, add(mul(way, 1.4 * (1 - 0.45 * grip)), mul(e1, -0.6 - 0.5 * grip))));
    const tip = onFloor(add(mid, add(mul(way, 1.1 * (1 - 0.8 * grip)), mul(e1, -0.7 - 0.5 * grip))));
    put(`hand${side}`, `finger${side}`, { k: 'rod', a: base, b: mid, ra: 0.4, rb: 0.34, ramp: SKIN, far: true });
    put(`hand${side}`, `finger${side}`, { k: 'rod', a: mid, b: tip, ra: 0.34, rb: 0.25, ramp: SKIN, far: true });
  }
}

/**
 * THE GOWN'S LINES: the bodice from the waist up to its square neckline; the skirt from the waist out over the farthingale
 * to the floor, a full bell; its hem under her feet (drawn back and swung as she goes), or pooled round her knees.
 */
export function gownRings(s: Skeleton, m: Moment): { bodice: Ring[]; skirt: Ring[]; hemC: V3; f: V3; l: V3; waistC: V3 } {
  const [cf, cl] = s.chest;
  const ph = m.wind * Math.PI * 2;
  const f = norm([s.hips[0][0], s.hips[0][1], 0], [1, 0, 0]);
  const l: V3 = [-f[1], f[0], 0];
  const lag = lagOf(m, 1.7, 8);
  const waistC = add(s.pelvis, mul(s.hips[2], B.waist * 0.62));
  const be = s.belly;
  const footMid = lerp3(lerp3(s.heelL, s.toeL, 0.5), lerp3(s.heelR, s.toeR, 0.5), 0.5);
  const kneeMid = lerp3(s.kneeL, s.kneeR, 0.5);
  // (to the floor; on her knees, pooled round them on the floor)
  const hemZ = 0.9;
  const knelt = clamp01((15 - kneeMid[2]) / 9);
  const under: V3 = lerp3([footMid[0] * 0.6 + s.pelvis[0] * 0.4, footMid[1] * 0.6 + s.pelvis[1] * 0.4, 0], [kneeMid[0] * 0.55 + s.pelvis[0] * 0.45, kneeMid[1] * 0.55 + s.pelvis[1] * 0.45, 0], knelt);
  const hemC: V3 = [under[0] + lag[0] * 1.1, under[1] + lag[1] * 1.1, hemZ];
  const hemDeep = B.pelvisDeep + 9.0 + 3.5 * knelt;
  const hemWide = B.pelvisHalf + 9.2 + 3.0 * knelt;
  const hemPts: V3[] = [];
  for (let i = 0; i < 28; i++) {
    const a = (i / 28) * Math.PI * 2;
    const rear = Math.max(0, -Math.cos(a));
    // (a short train behind; the hem rippling as it sweeps)
    const p = add(hemC, add(mul(f, Math.cos(a) * (hemDeep + rear * rear * 2.5)), mul(l, Math.sin(a) * hemWide)));
    hemPts.push(add(p, add([0, 0, Math.max(0, Math.sin(ph * 2 + a * 4) * 0.4) * (1 - knelt)], mul(lag, rear * 0.9))));
  }
  const bodice: Ring[] = [
    { c: waistC, u: mul(be[0], B.waistDeep + 1.0), v: mul(be[1], B.waistHalf + 0.9) },
    { c: lerp3(waistC, s.ribs, 0.5), u: mul(be[0], B.waistDeep + 1.3), v: mul(be[1], B.waistHalf + 1.2) },
    { c: s.ribs, u: mul(cf, B.ribDeep + 1.2), v: mul(cl, B.ribHalf + 1.1) },
    // (the neckline: square across the breast)
    { c: lerp3(s.ribs, s.neck, 0.42), u: mul(cf, B.ribDeep + 0.9), v: mul(cl, B.shoulderHalf * 0.88) },
  ];
  const skirt: Ring[] = [
    { c: hemC, u: mul(f, hemDeep), v: mul(l, hemWide), pts: hemPts },
    { c: [kneeMid[0] * 0.5 + hemC[0] * 0.5 + lag[0] * 0.4, kneeMid[1] * 0.5 + hemC[1] * 0.5 + lag[1] * 0.4, Math.max(hemZ + 3, kneeMid[2] - 3)], u: mul(f, B.pelvisDeep + 7.4 + 2 * knelt), v: mul(l, B.pelvisHalf + 7.8 + 2 * knelt) },
    // (over the farthingale's roll at the hips: the bell's shoulder, standing out from the narrow waist)
    { c: [s.pelvis[0], s.pelvis[1], s.pelvis[2] + 0.6], u: mul(f, B.pelvisDeep + 5.0), v: mul(l, B.pelvisHalf + 5.8) },
    { c: waistC, u: mul(be[0], B.waistDeep + 1.1), v: mul(be[1], B.waistHalf + 1.0) },
  ];
  return { bodice, skirt, hemC, f, l, waistC };
}

/** How far round the skirt's front (degrees either side) it opens on the forepart. */
const OPEN = 17;
/** A point on the skirt's rings: `k` of the way down from the waist (0) to the hem (1), `deg` round from its front, `out` off it. */
function onSkirt(rings: ReadonlyArray<Ring>, k: number, deg: number, out = 0): { p: V3; n: V3 } {
  // (the rings run hem, knee, hips, waist: k 0 is the waist's, 1 the hem's)
  const u = clamp01(k) * (rings.length - 1);
  const j = Math.min(rings.length - 2, Math.floor(u));
  const A = rings[rings.length - 1 - j];
  const Bq = rings[rings.length - 2 - j];
  const f = u - j;
  const a = (deg * Math.PI) / 180;
  const at = (r: Ring): V3 => add(r.c, add(mul(r.u, Math.cos(a)), mul(r.v, Math.sin(a))));
  const p = lerp3(at(A), at(Bq), f);
  const ru = lerp3(A.u, Bq.u, f);
  const rv = lerp3(A.v, Bq.v, f);
  const n = norm(add(mul(norm(ru), Math.cos(a)), mul(norm(rv), Math.sin(a))), [1, 0, 0]);
  return { p: add(p, mul(n, out)), n };
}
/** THE FOREPART: where the skirt opens down its front, the dark violet underskirt, worked with a lattice of silver knots and edged with silver. */
function forepart(put: Put, g: ReturnType<typeof gownRings>): void {
  put('forepart', 'forepart', { k: 'cloth', rings: g.skirt, ramp: VIOLET, look: { arc: [-OPEN, OPEN], lift: 0.1, folds: [0], hem: SILVER } });
  // (a row of pearls down its middle; its two edges piped with silver)
  for (let i = 1; i <= 9; i++) {
    const { p, n } = onSkirt(g.skirt, i / 10, 0, 0.2);
    put('forepart', 'pearls', { k: 'dot', p, c: PEARL, facing: n });
  }
  for (const side of [-1, 1]) {
    for (let i = 0; i <= 40; i++) {
      const { p, n } = onSkirt(g.skirt, 0.03 + (i / 40) * 0.95, side * (OPEN - 2), 0.2);
      put('forepart', 'edge', { k: 'dot', p, c: SILVER[3], facing: n });
    }
  }
}

/** THE STOMACHER: down the bodice's front from the neckline to a long point below the waist, dark violet, laced across with silver, edged with pearls. */
function stomacher(put: Put, s: Skeleton, waistC: V3): void {
  const [cf, cl] = s.chest;
  const top = add(lerp3(s.ribs, s.neck, 0.4), mul(cf, B.ribDeep + 1.05));
  const low = add(add(waistC, mul(s.belly[0], B.waistDeep + 1.3)), mul(s.hips[2], -1.4));
  const c = add(lerp3(top, low, 0.5), mul(lerp3(cf, s.belly[0], 0.5), 1.25));
  const v = mul(sub(top, low), 0.5);
  const lv = Math.hypot(v[0], v[1], v[2]);
  const W = B.ribHalf * 0.62;
  put('stomacher', 'stomacher', {
    k: 'panel', c, u: mul(cl, W), v,
    skin: (x, y, _front, tone) => {
      const k = (y / lv + 1) / 2;
      const half = W * (0.12 + 0.88 * Math.pow(k, 0.7));
      if (Math.abs(x) > half) return null;
      if (Math.abs(x) > half - 0.6) return (Math.round(y * 1.4) % 2 === 0 ? PEARL : SILVER[3]);
      // (laced across: silver bars in pairs down it)
      const bar = Math.abs(((y + 40) % 2.2) - 1.1) < 0.28;
      return bar ? SILVER[Math.min(4, tone)] : VIOLET[Math.max(1, Math.min(4, tone))];
    },
  });
}

/**
 * THE HIGH FAN COLLAR: standing up from the shoulders behind the head, two halves meeting behind the neck and wrapping
 * a little round, tipped back; pleated lace on wires, its edge in points; its inside a shade darker.
 */
function fanCollar(put: Put, s: Skeleton, lag: V3): void {
  const [cf, cl, cu] = s.chest;
  // (its foot round the base of her neck, from her left shoulder round the back to her right; its top a half-round fan
  // standing up behind her head, leaning back a little, from out over her left shoulder over the top to out over her right)
  const footC = add(add(s.neck, mul(cf, -0.7)), mul(cu, -1.5));
  const topC = add(add(add(s.neck, mul(cf, -2.4)), mul(cu, 0.2)), mul(lag, 0.1));
  const up = norm(add(cu, mul(cf, -0.3)));
  const W = 6.8;
  const H = 12.6;
  const footAt = (a: number): V3 => add(footC, add(mul(cf, 3.0 * Math.cos(a)), mul(cl, 4.2 * Math.sin(a))));
  const topAt = (a: number, pleat: number): V3 => add(topC, add(mul(cl, W * Math.sin(a)), add(mul(up, -H * Math.cos(a)), mul(cf, pleat))));
  const N = 11;
  const a0 = (92 * Math.PI) / 180;
  const a1 = (268 * Math.PI) / 180;
  for (let i = 0; i < N; i++) {
    const aa = a0 + ((a1 - a0) * i) / N;
    const ab = a0 + ((a1 - a0) * (i + 1)) / N;
    // (pleated: each fold's edge back or forward of the last by turns)
    const P0 = footAt(aa);
    const P1 = footAt(ab);
    const Q0 = topAt(aa, i % 2 ? 0.55 : -0.55);
    const Q1 = topAt(ab, i % 2 ? -0.55 : 0.55);
    const bot = lerp3(P0, P1, 0.5);
    const tip = lerp3(Q0, Q1, 0.5);
    const c = lerp3(bot, tip, 0.5);
    const v = mul(sub(tip, bot), 0.5);
    const lv = Math.hypot(v[0], v[1], v[2]);
    const across = sub(add(Q1, P1), add(Q0, P0));
    const hb = Math.hypot(...sub(P1, P0)) / 2;
    const ht = Math.hypot(...sub(Q1, Q0)) / 2;
    const lu = Math.max(hb, ht) * 1.04;
    // (so that each fold's face is toward her front: its lining is what is seen from in front)
    const uDir = norm(across, cl);
    put('collar', 'collar', {
      k: 'panel', c, u: mul(uDir, lu), v,
      skin: (x, y, front, tone) => {
        const k = (y / lv + 1) / 2;
        const half = hb + (ht - hb) * k;
        if (Math.abs(x) > half * 1.02) return null;
        // (its top in a point: the fan's edge scalloped all round)
        const q = Math.abs(x) / Math.max(0.3, half);
        if (y > lv - 1.6 * q * q) return null;
        const t0 = Math.max(0, Math.min(4, (front ? tone : tone - 1) + (k < 0.18 ? -1 : 0)));
        // (open-work: a row of holes under its edge; the wire up its middle)
        if (k > 0.66 && k < 0.84 && Math.abs(x) > half * 0.25 && Math.abs(x) < half * 0.7) return LACE[Math.max(0, t0 - 2)];
        if (Math.abs(x) < 0.32) return LACE[Math.min(4, t0 + 1)];
        return LACE[Math.max(1, t0)];
      },
    });
  }
}

// =============================================================================================
// THE HEAD

/** HER HEAD: a powdered grey face, the cult's dull pink in her eyes, her lips parted on no sound; her dark hair drawn up into a high coil, pinned with silver and pearl, a ringlet at each temple. Returns her mouth. */
function head(put: Put, st: Stage, s: Skeleton, jaw: number, lit: number, lag: V3, t: number): { mouth: V3; ff: V3; fl: V3 } {
  const [ff, fl, fu] = wornOn(st, s, 8);
  const hr: V3 = [B.headR[0], B.headR[1] * 1.02, B.headR[2]];
  const hc = add(s.head, mul(fu, -0.2));
  const skin: Skin = (u, tone) => {
    const fwd = u[0];
    const side = Math.abs(u[1]);
    // her lips, parted on words that make no sound
    const open = 0.05 + 0.1 * jaw;
    if (fwd > 0.8 && side < 0.2 && u[2] < -0.4 && u[2] > -0.48 - open) return u[2] > -0.44 && u[2] < -0.42 - open * 0.3 && jaw > 0.35 ? '#20161c' : LIPS[Math.min(4, tone)];
    // the hollow of her cheeks, the light down her nose
    if (fwd > 0.45 && fwd < 0.75 && side > 0.45 && side < 0.72 && u[2] < -0.1 && u[2] > -0.52) return SKIN[Math.max(0, tone - 1)];
    if (fwd > 0.9 && side < 0.11 && u[2] > -0.3 && u[2] < 0.05) return SKIN[Math.min(4, tone + 1)];
    // her hair, drawn back off the brow and up: the back and the top, a sweep over the temples
    if (fwd < 0.0) return HAIR[Math.max(0, tone - (Math.sin(u[1] * 14 + u[2] * 3) > 0.6 ? 1 : 0))];
    if (u[2] > 0.66 - 0.14 * side) return HAIR[Math.max(0, tone - (Math.sin(u[1] * 16) > 0.55 ? 1 : 0))];
    if (side > 0.84 && u[2] > 0.05) return HAIR[tone];
    return SKIN[tone];
  };
  put('head', 'head', { k: 'ball', c: hc, ax: [mul(ff, hr[0]), mul(fl, hr[1]), mul(fu, hr[2])], skin });
  for (const k of [-1, 1]) {
    const a = add(hc, add(mul(ff, hr[0] * 0.9), add(mul(fl, k * hr[1] * 0.13), mul(fu, hr[2] * 0.3))));
    const b = add(hc, add(mul(ff, hr[0] * 0.74), add(mul(fl, k * hr[1] * 0.56), mul(fu, hr[2] * 0.32))));
    put('head', 'brows', { k: 'rod', a, b, ra: 0.42, rb: 0.32, ramp: HAIR });
  }
  for (const k of [-1, 1]) {
    const e = add(hc, add(mul(ff, hr[0] * 0.93), add(mul(fl, k * hr[1] * 0.34), mul(fu, hr[2] * 0.1))));
    put('head', 'eyes', { k: 'dot', p: e, c: lit > 0.4 ? FLAME[1] : '#3a2a30', facing: ff });
  }
  // THE COIL: her hair drawn up into a high coil at the crown, a little back; its strands wound round it
  const coilC = add(hc, add(mul(fu, hr[2] * 0.78), mul(ff, -hr[0] * 0.36)));
  const coilUp = norm(add(fu, mul(ff, -0.25)));
  const coilSkin: Skin = (u, tone) => {
    const a = Math.atan2(u[1], u[0]);
    const wound = Math.sin(a * 2 + u[2] * 7) > 0.4;
    return HAIR[Math.max(0, Math.min(4, tone + (wound ? 1 : 0) - (u[2] < -0.6 ? 1 : 0)))];
  };
  put('head', 'coil', { k: 'ball', c: coilC, ax: [mul(ff, hr[0] * 0.62), mul(fl, hr[1] * 0.66), mul(coilUp, hr[2] * 0.5)], skin: coilSkin });
  // pins of silver through it, pearls at their heads; a string of pearls round its foot
  for (const k of [-1, 1]) {
    const a = add(coilC, add(mul(fl, k * hr[1] * 0.95), mul(coilUp, hr[2] * 0.25)));
    const b = add(coilC, add(mul(fl, -k * hr[1] * 0.35), add(mul(coilUp, -hr[2] * 0.15), mul(ff, -hr[0] * 0.3))));
    put('head', 'pins', { k: 'rod', a, b, ra: 0.28, rb: 0.22, ramp: SILVER });
    put('head', 'pins', { k: 'ball', c: a, ax: sphere(0.62), skin: [SILVER[2], SILVER[3], PEARL, PEARL, PEARL] });
  }
  put('head', 'pearls', { k: 'band', ring: { c: add(coilC, mul(coilUp, -hr[2] * 0.42)), u: mul(ff, hr[0] * 0.66), v: mul(fl, hr[1] * 0.74) }, ramp: [SILVER[2], SILVER[3], LACE[3], PEARL, PEARL], rows: 1 });
  // a ringlet left at each temple, falling before the ear, swinging a little
  for (const k of [-1, 1]) {
    const top = add(hc, add(mul(fl, k * hr[1] * 0.86), add(mul(ff, hr[0] * 0.2), mul(fu, hr[2] * 0.15))));
    let prev = top;
    for (let i = 1; i <= 6; i++) {
      const q = i / 6;
      const a = q * Math.PI * 3 + k;
      const p = add(top, add(mul(fu, -5.2 * q), add(mul(fl, k * (0.5 + 0.55 * Math.cos(a))), add(mul(ff, 0.55 * Math.sin(a)), mul(lag, 0.5 * q + 0.15 * Math.sin(t * 2.4 + k) * q)))));
      put('head', 'ringlet', { k: 'rod', a: prev, b: p, ra: 0.62 - 0.05 * i, rb: 0.58 - 0.05 * i, ramp: HAIR });
      prev = p;
    }
  }
  return { mouth: add(hc, add(mul(ff, hr[0] * 1.0), mul(fu, -hr[2] * 0.44))), ff, fl };
}

// =============================================================================================
// HER, AS THE PAINTER TAKES HER

/** What a moment of a move says of her over and above the bones. */
export interface LadySay {
  /** Whether the mirror has gone from her hand (dying: it falls as a piece of its own, Mob.fall). */
  dropped?: (m: Moment) => boolean;
  /** How far her mirror has cracked (0 whole, 1 shattered across). */
  crack?: (m: Moment) => number;
  /** Grains of her own move, laid after her edge: the beam, its smear, the glint's star, glass falling. */
  more?: (m: Moment) => [V3, string, number][];
  /** How hard the Hush comes out of her now (her breath); and whether it is leaving her (dying). */
  puff?: (m: Moment) => number;
  /** The light she gives off with her own move (the flash at her mirror). */
  lights?: (m: Moment) => { p: V3; c: string; r: number; a: number }[];
}
const GRAINS = new WeakMap<Moment, [V3, string, number][]>();
function ladyBits(st: Stage, m: Moment, say: LadySay): Bit[] {
  const { s, q } = m;
  const bits: Bit[] = [];
  const grains: [V3, string, number][] = [];
  GRAINS.set(m, grains);
  const put: Put = (part, piece, shape) => {
    if (shape.k === 'mote' && part === 'hush') {
      grains.push([shape.p, shape.c, shape.size]);
      return;
    }
    bits.push({ part, piece, shape });
  };
  const [, , cu] = s.chest;
  const lit = 1 - clamp01(q.out);
  const lag = lagOf(m, 1.6, 7);
  const t = m.t;
  const jaw = clamp01(m.jaw ?? 0.4);
  // (her slippers, under the hem: a step shows the toe)
  for (const side of ['L', 'R'] as const) {
    const heel = side === 'L' ? s.heelL : s.heelR;
    const toe = side === 'L' ? s.toeL : s.toeR;
    put(`foot${side}`, `foot${side}`, { k: 'rod', a: add(heel, [0, 0, 1.1]), b: add(toe, [0, 0, 0.85]), ra: 1.15, rb: 0.85, ramp: SILVER, far: true });
  }
  // THE GOWN
  const g = gownRings(s, m);
  put('skirt', 'skirt', { k: 'cloth', rings: g.skirt, ramp: GOWN, look: { arc: [OPEN, 360 - OPEN], folds: [40, -40, 66, -66, 94, -94, 124, -124, 150, -150, 180], lift: 0.1, hem: LACE } });
  forepart(put, g);
  // the skirt's guards: two bands of silver round it above the hem
  for (const k of [0.8, 0.9]) {
    const r0 = g.skirt[0];
    const r1 = g.skirt[1];
    const u = (1 - k) / 0.5;
    const ring: Ring = { c: lerp3(r0.c, r1.c, u * 0.5), u: mul(lerp3(r0.u, r1.u, u * 0.5), 1.01), v: mul(lerp3(r0.v, r1.v, u * 0.5), 1.01) };
    put('skirt', 'guard', { k: 'band', ring, ramp: SILVER, rows: 1 });
  }
  put('body', 'bodice', { k: 'cloth', rings: g.bodice, ramp: GOWN, look: { folds: [30, -30, 70, -70], lift: 0.03 } });
  stomacher(put, s, g.waistC);
  // her throat and the top of her breast above the neckline, edged with lace
  const [cf, cl] = s.chest;
  put('neck', 'neck', { k: 'rod', a: add(lerp3(s.ribs, s.neck, 0.4), mul(cu, 0.4)), b: lerp3(s.neck, s.head, 0.55), ra: 1.9, rb: 1.5, ramp: SKIN });
  put('neck', 'breast', { k: 'ball', c: add(lerp3(s.ribs, s.neck, 0.6), mul(cf, 0.5)), ax: [mul(cf, B.ribDeep * 0.72), mul(cl, B.shoulderHalf * 0.78), mul(cu, 2.0)], skin: SKIN });
  put('body', 'lace', { k: 'band', ring: g.bodice[3], ramp: LACE, rows: 1 });
  put('body', 'girdle', { k: 'band', ring: { c: g.waistC, u: mul(s.belly[0], B.waistDeep + 1.25), v: mul(s.belly[1], B.waistHalf + 1.15) }, ramp: SILVER, rows: 1 });
  fanCollar(put, s, lag);
  // THE ARMS: the left hand loose, the right closed on the mirror
  const held = !(say.dropped?.(m) ?? false);
  arm(put, s, 'L', cu, 0.3);
  arm(put, s, 'R', cu, held ? 1 : 0.4);
  const hd = head(put, st, s, jaw, lit, lag, t);
  // THE MIRROR (painted even once dropped: as she dies it falls from her as a piece of its own, Mob.fall)
  mirror(put, s, held ? clamp01(m.glint) : 0, clamp01(say.crack?.(m) ?? 0), t);
  // THE HUSH, leaking out of her as she breathes; pouring out of her as it leaves her
  const puff = say.puff?.(m) ?? 0.8;
  hushBreath(put, hd.mouth, hd.ff, hd.fl, t, puff, 18);
  if (m.dying) hushLeaves(put, hd.mouth, hd.ff, hd.fl, t, 18, 0.32, 1.75);
  for (const l of say.lights?.(m) ?? []) put('mirror', 'flash', { k: 'glow', p: l.p, c: l.c, r: l.r, a: l.a });
  grains.push(...(say.more?.(m) ?? []));
  return bits;
}

/** HER AS THE PAINTER TAKES HER. */
export function ladyPainter(say: LadySay): { bits: (st: Stage, m: Moment) => Bit[]; grains: (st: Stage, m: Moment) => ReadonlyArray<readonly [V3, string, number]> } {
  return { bits: (st, m) => ladyBits(st, m, say), grains: (_st, m) => GRAINS.get(m) ?? [] };
}
void BREATH_PALE;
void hash;
