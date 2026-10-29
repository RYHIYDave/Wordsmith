// FLOOR 17'S MASKED DANCERS (the art chat's helper, 29 Oct 2026). A MOCK-UP: NOT IN THE GAME. Nothing of the game imports
// this file; `DANCERS_ON` is off. Their moves are art/masque_dancers_moves.ts.
//
// Floor 17, THE MASQUE: the Prince's masked ball, gone on for weeks, in a suite of seven rooms each in its own colour (blue,
// purple, green, orange, white, violet, and a black one lit red through its windows), from Poe's "The Masque of the Red
// Death" (1842), drawn only from the book. The floor's plan, approved by him: "Enemies: masked dancers who waltz until they
// notice you, footmen, and the Silent Order among the guests." Its hazard: "the great ebony clock in the black room. Every
// so often it chimes: every dancer stops dead and turns to look at you, then the music starts again and they all come at
// once."
//
// HIS PICK for how they move, offered as a pop-up: “Gliding fast, whirling (Recommended)”. THE BRIEF AS OFFERED with it:
// courtiers at the prince's ball, in gowns and frock coats of the seven rooms' colours, each in a white porcelain mask;
// Hushed, grey breath; knight's size, in crowds, fun to smash; they waltz in pairs round the room until they see you, then
// break off and whirl at you, fast; at the clock's chime they freeze and turn to look; known by the masks, and dancing in
// pairs; one attack, a whirling spin into you, skirts and coat-tails flaring; their death, the mask drops, the Hush leaves
// them, they sink down in a last bow; never clowns, never undead or gory; their sound, a faint waltz around them, silent
// dancers.
//
// WHO THEY ARE: two kinds, mixed in a crowd. A LADY in a gown (a fitted bodice; elbow sleeves with white lace falling from
// them; long white gloves; a full skirt to the floor, open at its front over a petticoat of ivory silk; her hair swept up,
// a plume in it) and a GENTLEMAN in a frock coat (its skirts to the knee, open at the front over an ivory waistcoat; deep
// turned-back cuffs; a white cravat; breeches, white stockings, black buckled shoes; his hair tied back). Each in a WHITE
// PORCELAIN MASK, a whole face, smooth and still, its brows painted in the colour of their room, tied on with a ribbon of
// it; the dull pink of the Hushed in the dark behind its eyes; the grey breath leaking from the slit of its lips. Grown
// people, the knight's height. Their clothes in the colours of the seven rooms (`ROOMS`), every one clear of the enemy's
// pink and the friend's cyan. Nothing cyan.

import { BREATH_PALE, SKIN, hushBreath, hushLeaves, lagOf } from './hushed';
import { INK, hash } from './kit';
import type { Ramp } from './kit';
import { FLAME } from './mkit';
import { sphere } from './new_mobs3';
import type { Bit, MobCanvas, Moment, Put } from './new_mobs3';
import { wornOn } from './skin';
import type { ClothLook, Ring, Skin, Stage } from './skin';
import { add, buildOf, cross, dot, lerp3, mul, norm, standing, sub } from './skeleton';
import type { Bones, Build, Skeleton, V3 } from './skeleton';

/** THE SWITCH, OFF. Nothing of the game reads this file. */
export const DANCERS_ON = { on: false };

const clamp01 = (v: number): number => Math.max(0, Math.min(1, v));
const D = Math.PI / 180;
void BREATH_PALE;

// =============================================================================================
// THEIR COLOURS: the seven rooms' (Poe: “The eastern extremity was hung, for example, in blue”, then purple, green, orange,
// white, violet, and the seventh in black with its panes “scarlet”). Each a gown or a coat's colour, with what is worn with it.

/** A room's colours on a dancer: the gown or the coat; the trim (the gown's hem and the coat's cuffs); the ribbon, the plume and the mask's painted brows. */
export interface Room {
  name: string;
  cloth: Ramp;
  trim: Ramp;
  ribbon: Ramp;
}
const IVORY_TRIM: Ramp = ['#4a4640', '#6e685e', '#a29a8a', '#cec6b4', '#e6e0d2'];
export const ROOMS: Readonly<Record<string, Room>> = {
  blue: { name: 'blue', cloth: ['#10163a', '#18224e', '#283a76', '#3c56a0', '#5876c4'], trim: IVORY_TRIM, ribbon: ['#18224e', '#18224e', '#3c56a0', '#5876c4', '#5876c4'] },
  purple: { name: 'purple', cloth: ['#181030', '#261a46', '#3c2a6a', '#563e90', '#7258b0'], trim: IVORY_TRIM, ribbon: ['#261a46', '#261a46', '#563e90', '#7258b0', '#7258b0'] },
  green: { name: 'green', cloth: ['#0a1e14', '#103020', '#1a4a30', '#286a44', '#40885a'], trim: IVORY_TRIM, ribbon: ['#103020', '#103020', '#286a44', '#40885a', '#40885a'] },
  orange: { name: 'orange', cloth: ['#2e1408', '#48200c', '#783812', '#a6561e', '#cc7a32'], trim: IVORY_TRIM, ribbon: ['#48200c', '#48200c', '#a6561e', '#cc7a32', '#cc7a32'] },
  white: { name: 'white', cloth: ['#3a3842', '#56545e', '#86848e', '#b4b0ba', '#d8d4dc'], trim: ['#2a2830', '#3a3842', '#56545e', '#76747e', '#8a8892'], ribbon: ['#2a2830', '#2a2830', '#56545e', '#76747e', '#76747e'] },
  violet: { name: 'violet', cloth: ['#22102a', '#361a42', '#562e68', '#76468e', '#9a64b0'], trim: IVORY_TRIM, ribbon: ['#361a42', '#361a42', '#76468e', '#9a64b0', '#9a64b0'] },
  black: { name: 'black', cloth: ['#0a080c', '#121014', '#201a22', '#322a34', '#443a46'], trim: ['#2e0806', '#4a0e0a', '#7c1810', '#a42818', '#c43c22'], ribbon: ['#2e0806', '#2e0806', '#7c1810', '#a42818', '#a42818'] },
};
/** The rooms in the suite's order, east to west. */
export const ROOM_ORDER = ['blue', 'purple', 'green', 'orange', 'white', 'violet', 'black'] as const;
export type RoomName = (typeof ROOM_ORDER)[number];

/** Pale silver silk: her petticoat, his waistcoat. */
const IVORY: Ramp = ['#3c3a46', '#5e5c6a', '#9896a4', '#c6c4d0', '#e2e0ea'];
/** White kid gloves; white lace. */
const GLOVE: Ramp = ['#4a4852', '#6a6874', '#9e9aa6', '#c8c4ce', '#dcd8e2'];
const LACE: Ramp = ['#4e4c56', '#76747e', '#a8a4b0', '#d0ccd6', '#e4e0e8'];
/** THE MASK: white porcelain, cool, the brightest thing on them. */
const PORCELAIN: Ramp = ['#6c6874', '#a29eaa', '#d0ccd6', '#eceaf0', '#fcfafe'];
/** Her hair, dark chestnut; his, dark brown. */
const HER_HAIR: Ramp = ['#1c1210', '#2a1a16', '#462e26', '#604034', '#74503c'];
const HIS_HAIR: Ramp = ['#141010', '#1e1818', '#342a26', '#4a3c34', '#4a3c34'];
const RIBBON_BLACK: Ramp = ['#0c0a0c', '#0c0a0c', '#201c20', '#2e282c', '#2e282c'];
/** His stockings, white; his shoes, black, a silver buckle. */
const STOCKING: Ramp = ['#4a4852', '#6c6a74', '#a09ea8', '#c6c2ca', '#c6c2ca'];
const SHOE: Ramp = ['#0e0c0e', '#0e0c0e', '#262228', '#3a343c', '#4a444c'];
const BUCKLE = '#b4b2be';
/** Her slippers: the room's own. */

// =============================================================================================
// THEIR BODIES: the knight's size (58)

/** A lady, slender, a little shorter than the knight. */
export const LADY_BODY: Build = buildOf(56, 1.4, { shoulders: 0.86, chest: 0.9, depth: 0.9, waist: 0.7, hips: 0.98, legs: 1.02, arms: 0.94, trunk: 1.0, limbs: 0.82 });
/** A gentleman, a little taller than the knight. */
export const GENT_BODY: Build = buildOf(59, 1.36, { shoulders: 1.0, chest: 0.98, depth: 0.96, waist: 0.86, hips: 0.94, legs: 1.04, arms: 1.0, trunk: 1.0, limbs: 0.88 });
/** Who: a lady, a gentleman. */
export type DancerWho = 'lady' | 'gent';
export const bodyOf = (who: DancerWho): Build => (who === 'lady' ? LADY_BODY : GENT_BODY);
/** Their picture: room for the whirl's sweep all round them, and for a pair in hold. */
export const DANCER_CANVAS: MobCanvas = { w: 300, h: 230, ax: 150, ay: 168 };

// =============================================================================================
// THEM AS SOLIDS

/** A hand in a white glove: the palm, four fingers (curled `grip`), a thumb. */
function hand(put: Put, side: 'L' | 'R', at: V3, fore: V3, cu: V3, grip: number, spread: number): void {
  const e1 = norm(sub(cu, mul(fore, dot(cu, fore))), [0, 0, 1]);
  const e2 = norm(cross(fore, e1), [0, 1, 0]);
  put(`hand${side}`, `hand${side}`, { k: 'ball', c: add(at, mul(fore, 0.3)), ax: [mul(fore, 1.25), mul(e2, 1.0), mul(e1, 0.62)], skin: GLOVE, far: true });
  for (let i = 0; i < 4; i++) {
    const fan = (i - 1.5) * (0.24 + 0.22 * spread);
    const base = add(at, add(mul(fore, 1.0), mul(e2, fan * 0.8)));
    const mid = add(base, add(mul(fore, 1.2 * (1 - 0.5 * grip)), add(mul(e1, -0.4 - 0.5 * grip), mul(e2, fan * 0.5 * spread))));
    const tip = add(mid, add(mul(fore, 0.9 * (1 - 0.8 * grip)), add(mul(e1, -0.5 - 0.35 * grip), mul(e2, fan * 0.4 * spread))));
    put(`hand${side}`, `finger${side}`, { k: 'rod', a: base, b: mid, ra: 0.36, rb: 0.32, ramp: GLOVE, far: true });
    put(`hand${side}`, `finger${side}`, { k: 'rod', a: mid, b: tip, ra: 0.32, rb: 0.24, ramp: GLOVE, far: true });
  }
  const sideK = side === 'L' ? 1 : -1;
  const tb = add(at, add(mul(fore, 0.5), mul(e2, sideK * 0.9)));
  put(`hand${side}`, `finger${side}`, { k: 'rod', a: tb, b: add(tb, add(mul(fore, 1.0), add(mul(e2, sideK * 0.5), mul(e1, -0.3)))), ra: 0.36, rb: 0.26, ramp: GLOVE, far: true });
}

/**
 * AN ARM. Hers: a sleeve of the gown to the elbow, lace falling from it in two tiers, a long white glove to the elbow.
 * His: the coat's sleeve to the wrist, a deep turned-back cuff of the trim, lace at the wrist, a white glove.
 */
function arm(put: Put, s: Skeleton, B: Build, who: DancerWho, side: 'L' | 'R', room: Room, cu: V3, grip: number, spread: number, lag: V3): void {
  const sh = side === 'L' ? s.shoulderL : s.shoulderR;
  const el = side === 'L' ? s.elbowL : s.elbowR;
  const hd = side === 'L' ? s.handL : s.handR;
  const [r0, r1, r2] = B.armR;
  const fore = norm(sub(hd, el), [0, 0, -1]);
  const upper = norm(sub(el, sh), [0, 0, -1]);
  const wrist = add(hd, mul(fore, -1.1));
  put(`arm${side}`, `arm${side}`, { k: 'ball', c: sh, ax: sphere(r0 * (who === 'gent' ? 1.25 : 1.18)), skin: room.cloth, far: true });
  put(`arm${side}`, `arm${side}`, { k: 'rod', a: sh, b: el, ra: r0 * (who === 'gent' ? 1.2 : 1.12), rb: r1 * 1.12, ramp: room.cloth, far: true });
  if (who === 'lady') {
    put(`fore${side}`, `fore${side}`, { k: 'ball', c: el, ax: sphere(r1 * 1.1), skin: GLOVE, far: true });
    put(`fore${side}`, `fore${side}`, { k: 'rod', a: el, b: wrist, ra: r1 * 1.0, rb: r2 * 1.05, ramp: GLOVE, far: true });
    // (the sleeve's end at the elbow, a band of the trim; and the lace falling from it, in two tiers, hanging down and back)
    put(`arm${side}`, `cuff${side}`, { k: 'rod', a: lerp3(sh, el, 0.82), b: add(el, mul(upper, 0.4)), ra: r1 * 1.3, rb: r1 * 1.42, ramp: room.trim, far: true });
    const hang = norm(add(add([0, 0, -1], mul(upper, 0.6)), mul(lag, 0.12)), [0, 0, -1]);
    for (const [k, long, w] of [[0, 3.6, 1.25]] as const) {
      const top = add(el, mul(upper, -0.4 - 0.9 * k));
      put(`arm${side}`, `lace${side}`, { k: 'rod', a: top, b: add(top, mul(hang, long)), ra: r1 * w, rb: r1 * (w + 0.35), ramp: LACE, far: true });
    }
  } else {
    put(`fore${side}`, `fore${side}`, { k: 'ball', c: el, ax: sphere(r1 * 1.16), skin: room.cloth, far: true });
    put(`fore${side}`, `fore${side}`, { k: 'rod', a: el, b: lerp3(el, wrist, 0.6), ra: r1 * 1.12, rb: r2 * 1.25, ramp: room.cloth, far: true });
    // (the deep cuff, turned back, flaring toward the elbow; the lace at the wrist)
    put(`fore${side}`, `cuff${side}`, { k: 'rod', a: lerp3(el, wrist, 0.5), b: lerp3(el, wrist, 0.98), ra: r1 * 1.55, rb: r2 * 1.35, ramp: room.trim, far: true });
    put(`fore${side}`, `lace${side}`, { k: 'rod', a: lerp3(el, wrist, 0.95), b: add(wrist, mul(fore, 0.7)), ra: r2 * 1.35, rb: r2 * 1.6, ramp: LACE, far: true });
  }
  hand(put, side, hd, fore, cu, grip, spread);
}

/** A leg. Hers: a stocking and a slipper of her room's colour (seen only as her skirt flies). His: breeches to below the knee, a white stocking, a black shoe with a silver buckle. */
function leg(put: Put, s: Skeleton, B: Build, who: DancerWho, side: 'L' | 'R', room: Room): void {
  const hip = side === 'L' ? s.hipL : s.hipR;
  const knee = side === 'L' ? s.kneeL : s.kneeR;
  const ankle = side === 'L' ? s.ankleL : s.ankleR;
  const heel = side === 'L' ? s.heelL : s.heelR;
  const toe = side === 'L' ? s.toeL : s.toeR;
  const [rH, rK, rA] = B.legR;
  if (who === 'gent') {
    const breeches: Ramp = [room.cloth[0], room.cloth[0], room.cloth[1], room.cloth[2], room.cloth[2]];
    put(`leg${side}`, `leg${side}`, { k: 'rod', a: hip, b: knee, ra: rH * 1.12, rb: rK * 1.14, ramp: breeches, far: true });
    put(`leg${side}`, `leg${side}`, { k: 'ball', c: knee, ax: sphere(rK * 1.14), skin: breeches, far: true });
    put(`shin${side}`, `garter${side}`, { k: 'rod', a: lerp3(knee, ankle, 0.04), b: lerp3(knee, ankle, 0.16), ra: rK * 1.16, rb: rK * 1.12, ramp: room.trim, far: true });
    put(`shin${side}`, `shin${side}`, { k: 'rod', a: lerp3(knee, ankle, 0.12), b: ankle, ra: rK * 1.04, rb: rA * 1.05, ramp: STOCKING, far: true });
  } else {
    put(`leg${side}`, `leg${side}`, { k: 'rod', a: hip, b: knee, ra: rH * 1.04, rb: rK * 1.05, ramp: STOCKING, far: true });
    put(`shin${side}`, `shin${side}`, { k: 'rod', a: knee, b: ankle, ra: rK * 1.04, rb: rA * 1.0, ramp: STOCKING, far: true });
  }
  // the shoe: a slender slipper or a buckled shoe, on its heel and its ball
  const fwd = norm(sub(toe, heel), [1, 0, 0]);
  const side3 = norm(Math.abs(fwd[2]) < 0.95 ? [-fwd[1], fwd[0], 0] : cross(s.hips[2], fwd), [0, 1, 0]);
  const up3 = norm(cross(fwd, side3), [0, 0, 1]);
  const shoe = who === 'gent' ? SHOE : ([room.cloth[0], room.cloth[1], room.cloth[2], room.cloth[3], room.cloth[3]] as Ramp);
  put(`foot${side}`, `foot${side}`, { k: 'ball', c: add(lerp3(heel, toe, 0.55), mul(up3, 1.25)), ax: [mul(fwd, who === 'gent' ? 4.6 : 4.2), mul(side3, who === 'gent' ? 1.8 : 1.5), mul(up3, who === 'gent' ? 1.4 : 1.15)], skin: shoe, far: true });
  if (who === 'gent') put(`foot${side}`, `buckle${side}`, { k: 'dot', p: add(lerp3(heel, toe, 0.62), mul(up3, 2.5)), c: BUCKLE, facing: up3 });
}

/** The torso from the waist up to the bust or the throat, padded out by what is worn (`pad`); `top`: how high it is closed. */
function torso(s: Skeleton, B: Build, pad: number, waistLow: number): Ring[] {
  const [cf, cl, cu] = s.chest;
  const be = s.belly;
  const waistC = add(s.pelvis, mul(s.hips[2], B.waist * waistLow));
  return [
    { c: waistC, u: mul(be[0], B.waistDeep + 1.0 + pad), v: mul(be[1], B.waistHalf + 1.0 + pad) },
    { c: lerp3(waistC, s.ribs, 0.55), u: mul(be[0], B.waistDeep + 1.4 + pad), v: mul(be[1], B.waistHalf + 1.5 + pad) },
    { c: s.ribs, u: mul(cf, B.ribDeep + 1.4 + pad), v: mul(cl, B.ribHalf + 1.5 + pad) },
    { c: lerp3(s.ribs, s.neck, 0.7), u: mul(cf, B.ribDeep + 0.9 + pad), v: mul(cl, B.shoulderHalf + 0.2 + pad) },
    { c: add(s.neck, mul(cu, -0.8)), u: mul(cf, 3.0 + pad * 0.5), v: mul(cl, 3.6 + pad * 0.5) },
  ];
}

/** The way the hips face, flat on the floor; and to their left. */
function hipsFlat(s: Skeleton): { f: V3; l: V3 } {
  const f = norm([s.hips[0][0], s.hips[0][1], 0], [1, 0, 0]);
  return { f, l: [-f[1], f[0], 0] };
}

/** What a moment says of a dancer over and above the bones (art/masque_dancers_moves.ts). */
export interface DancerSay {
  /** How fast they are turning about themselves now (turns a second, to their left; less than nothing, to their right): the skirt and the coat's skirts flare out with it. */
  spin: (m: Moment) => number;
  /** Their room. */
  room: Room;
  /** THE SMEAR OF A LIGHTNING STRIKE (his Movement 9): after-images along the way it has just come, each a line of points, the oldest first. */
  smear?: (m: Moment) => V3[][] | null;
  /** Grains of their own move laid after their edge (the grey breath whipped round the whirl, glints through the warning). */
  more?: (m: Moment) => [V3, string, number][];
  /** How bright the warning burns in the mask's eyes (0 the Hushed's dull pink; 1 hot pink). */
  burn?: (m: Moment) => number;
  /** Whether the Hush has left them (their death, from when the mask drops): no pink in the eyes, the face their own. */
  freed?: (m: Moment) => boolean;
  /** How hard the Hush leaks from them now (1 as they stand; more as they wind up). */
  puff?: (m: Moment) => number;
  /** As they die, from when to when the Hush pours out of them. */
  leaving?: readonly [number, number];
}

/**
 * HER GOWN'S SKIRT: from the waist, full, to the floor; it flares out as she whirls (`flare`, 0 still to 1 flying), its hem
 * lifting and widening, rippling in waves that trail round behind the way she turns, and it streams back as she glides.
 * On her knees it pools round her on the floor.
 */
function skirtRings(s: Skeleton, B: Build, m: Moment, flare: number, turnDir: number, extra: number): { rings: Ring[]; hemC: V3; f: V3; l: V3 } {
  const { f, l } = hipsFlat(s);
  const lag = lagOf(m, 1.4, 7);
  const waistC = add(s.pelvis, mul(s.hips[2], B.waist * 0.62));
  const footMid = lerp3(lerp3(s.heelL, s.toeL, 0.5), lerp3(s.heelR, s.toeR, 0.5), 0.5);
  const kneeMid = lerp3(s.kneeL, s.kneeR, 0.5);
  const knelt = clamp01((14 - kneeMid[2]) / 10);
  const under: V3 = lerp3([s.pelvis[0] * 0.6 + footMid[0] * 0.4, s.pelvis[1] * 0.6 + footMid[1] * 0.4, 0], [kneeMid[0] * 0.5 + s.pelvis[0] * 0.5, kneeMid[1] * 0.5 + s.pelvis[1] * 0.5, 0], knelt);
  // (to the floor; lifted as it flies out)
  const hemZ = 1.0 + 12 * flare * flare + extra * 0.4;
  const hemC: V3 = [under[0] + lag[0] * 1.1, under[1] + lag[1] * 1.1, hemZ];
  const deep = B.pelvisDeep + 9.5 + 9 * flare + 3.5 * knelt + extra;
  const wide = B.pelvisHalf + 9.0 + 10 * flare + 3.0 * knelt + extra;
  const ph = m.wind * Math.PI * 2;
  const pts: V3[] = [];
  const N = 28;
  for (let i = 0; i < N; i++) {
    const a = (i / N) * Math.PI * 2;
    // (its waves: six godets, trailing round behind the way she turns, deeper as it flies)
    const wave = Math.sin(a * 6 - turnDir * ph * 2 + 0.6) * (0.35 + 1.6 * flare);
    const r = 1 + wave * 0.045;
    const p = add(hemC, add(mul(f, Math.cos(a) * deep * r), mul(l, Math.sin(a) * wide * r)));
    pts.push(add(p, [0, 0, Math.max(-hemZ + 0.8, wave * (0.25 + 1.4 * flare))]));
  }
  const kneeRing: Ring = {
    c: [kneeMid[0] * 0.5 + hemC[0] * 0.5 + lag[0] * 0.3, kneeMid[1] * 0.5 + hemC[1] * 0.5 + lag[1] * 0.3, Math.max(hemZ + 3, Math.min(kneeMid[2], s.pelvis[2] - 9) - 1)],
    u: mul(f, B.pelvisDeep + 5.8 + 5 * flare + 1.5 * knelt + extra * 0.6),
    v: mul(l, B.pelvisHalf + 5.4 + 5.5 * flare + 1.5 * knelt + extra * 0.6),
  };
  const rings: Ring[] = [
    { c: hemC, u: mul(f, deep), v: mul(l, wide), pts },
    kneeRing,
    { c: [s.pelvis[0], s.pelvis[1], s.pelvis[2] - 1.2], u: mul(f, B.pelvisDeep + 3.0 + extra * 0.3), v: mul(l, B.pelvisHalf + 2.8 + extra * 0.3) },
    { c: waistC, u: mul(s.belly[0], B.waistDeep + 1.6 + extra * 0.2), v: mul(s.belly[1], B.waistHalf + 1.5 + extra * 0.2) },
  ];
  return { rings, hemC, f, l };
}

/**
 * HIS COAT'S SKIRTS: from the waist to the knee, open at the front over his waistcoat; they swing out as he whirls (`flare`),
 * the coat-tails flying, and trail back as he glides.
 */
function coatSkirtRings(s: Skeleton, B: Build, m: Moment, flare: number, turnDir: number): Ring[] {
  const { f, l } = hipsFlat(s);
  const lag = lagOf(m, 1.6, 7);
  const waistC = add(s.pelvis, mul(s.hips[2], B.waist * 0.5));
  const kneeZ = Math.max(4, Math.min(s.kneeL[2], s.kneeR[2]) + 1.5);
  const ph = m.wind * Math.PI * 2;
  const drop = s.pelvis[2] - kneeZ;
  const hemZ = kneeZ + drop * 0.55 * flare * flare;
  const kneeMid = lerp3(s.kneeL, s.kneeR, 0.5);
  const hemC: V3 = [s.pelvis[0] * 0.55 + kneeMid[0] * 0.45 + lag[0] * 1.4, s.pelvis[1] * 0.55 + kneeMid[1] * 0.45 + lag[1] * 1.4, hemZ];
  const deep = B.pelvisDeep + 5.0 + 7 * flare;
  const wide = B.pelvisHalf + 4.6 + 7 * flare;
  const pts: V3[] = [];
  const N = 24;
  for (let i = 0; i < N; i++) {
    const a = (i / N) * Math.PI * 2;
    const back = Math.max(0, -Math.cos(a));
    const wave = Math.sin(a * 4 - turnDir * ph * 2) * (0.3 + 1.2 * flare);
    // (the tails behind hang longer than the fronts)
    const p = add(hemC, add(mul(f, Math.cos(a) * deep * (1 + wave * 0.04)), mul(l, Math.sin(a) * wide * (1 + wave * 0.04))));
    pts.push(add(p, add([0, 0, -back * 2.2 * (1 - flare) + wave * 0.6 * flare], mul(lag, back * 0.6))));
  }
  return [
    { c: hemC, u: mul(f, deep), v: mul(l, wide), pts },
    { c: [s.pelvis[0] + lag[0] * 0.3, s.pelvis[1] + lag[1] * 0.3, s.pelvis[2] - 1.5], u: mul(f, B.pelvisDeep + 2.6 + 2 * flare), v: mul(l, B.pelvisHalf + 2.6 + 2 * flare) },
    { c: waistC, u: mul(s.belly[0], B.waistDeep + 2.0), v: mul(s.belly[1], B.waistHalf + 2.0) },
  ];
}

/** THE MASK: white porcelain, a whole face, its brows painted in the room's colour, the eyes dark (the dull pink of the Hushed in them), the lips a dark slit; tied on with a ribbon of the room. Returns its mouth. */
function mask(put: Put, hc: V3, ff: V3, fl: V3, fu: V3, hr: V3, room: Room, burn: number, freed: boolean): V3 {
  const skin: Skin = (u, tone) => {
    if (u[0] < 0.05) return null;
    const side = Math.abs(u[1]);
    // the eyes: almond holes, dark, a little up from the middle
    const ex = (side - 0.36) / 0.17;
    const ey = (u[2] - 0.08) / 0.085;
    if (ex * ex + ey * ey < 1) return INK;
    // the brows painted over them, a sweep of the room's colour
    const by = u[2] - 0.29 - 0.1 * (1 - ((side - 0.34) / 0.3) ** 2);
    if (side > 0.12 && side < 0.62 && Math.abs(by) < 0.045) return room.ribbon[3];
    // the lips: a thin dark slit, a touch of the room's colour round it
    if (u[0] > 0.8 && side < 0.17 && u[2] < -0.43 && u[2] > -0.5) return '#2a2230';
    if (u[0] > 0.78 && side < 0.2 && u[2] < -0.4 && u[2] > -0.54) return room.ribbon[2];
    // the line of the nose, catching the light; its edge, and the hollow of the cheeks a step darker
    if (u[0] > 0.9 && side < 0.1 && u[2] > -0.28 && u[2] < 0.16) return PORCELAIN[Math.min(4, tone + 1)];
    if (u[0] < 0.3) return PORCELAIN[Math.max(0, tone - 1)];
    if (side > 0.42 && side < 0.66 && u[2] < -0.12 && u[2] > -0.46) return PORCELAIN[Math.max(1, tone - 1)];
    return PORCELAIN[Math.max(1, tone)];
  };
  const c = add(hc, mul(ff, 0.35));
  put('mask', 'mask', { k: 'ball', c, ax: [mul(ff, hr[0] * 1.04), mul(fl, hr[1] * 1.1), mul(fu, hr[2] * 1.07)], skin });
  // the dull pink in the dark behind its eyes (hot, through the warning); none once the Hush has gone and the mask has dropped
  for (const k of freed ? [] : [-1, 1]) {
    const e = add(c, add(mul(ff, hr[0] * 0.95), add(mul(fl, k * hr[1] * 0.38), mul(fu, hr[2] * 0.08))));
    put('mask', 'mask', { k: 'dot', p: e, c: burn > 0.5 ? FLAME[2] : FLAME[1], facing: ff });
    if (burn > 0.05) put('mask', 'glint', { k: 'glow', p: e, c: FLAME[2], r: 4 + 5 * burn, a: 0.4 * burn });
  }
  return add(c, add(mul(ff, hr[0] * 1.04), mul(fu, -hr[2] * 0.46)));
}

/** A FACE, theirs, under the mask: drained, the lips parted; the eyes shut once the Hush has left them. */
function face(put: Put, hc: V3, ff: V3, fl: V3, fu: V3, hr: V3, freed: boolean): void {
  const skin: Skin = (u, tone) => {
    const side = Math.abs(u[1]);
    if (u[0] > 0.78 && side < 0.18 && u[2] < -0.42 && u[2] > -0.5) return '#3a2a2e';
    if (u[0] > 0.6 && side > 0.25 && side < 0.5 && Math.abs(u[2] - 0.06) < 0.05) return freed ? SKIN[1] : INK;
    if (u[0] > 0.9 && side < 0.1 && u[2] > -0.3 && u[2] < 0.1) return SKIN[Math.min(4, tone + 1)];
    return SKIN[tone];
  };
  put('head', 'face', { k: 'ball', c: add(hc, mul(ff, 0.2)), ax: [mul(ff, hr[0] * 0.97), mul(fl, hr[1] * 1.0), mul(fu, hr[2] * 1.0)], skin });
  if (!freed) for (const k of [-1, 1]) put('head', 'eyes', { k: 'dot', p: add(hc, add(mul(ff, hr[0] * 0.95), add(mul(fl, k * hr[1] * 0.36), mul(fu, hr[2] * 0.06)))), c: FLAME[1], facing: ff });
}

/** HER HAIR: swept up off the neck into a knot high at the back of the head, curls at her temples; a plume of the room's colour standing from it and streaming back. */
function herHair(put: Put, hc: V3, ff: V3, fl: V3, fu: V3, hr: V3, room: Room, lag: V3, t: number): void {
  const skin: Skin = (u, tone) => (u[0] > -0.1 && u[2] < 0.45 ? null : HER_HAIR[tone]);
  put('hair', 'hair', { k: 'ball', c: add(hc, add(mul(fu, 0.6), mul(ff, -0.7))), ax: [mul(ff, hr[0] * 1.0), mul(fl, hr[1] * 1.0), mul(fu, hr[2] * 1.0)], skin });
  // the knot, high at the back
  const knot = add(hc, add(mul(fu, hr[2] * 0.95), mul(ff, -hr[0] * 0.55)));
  put('hair', 'knot', { k: 'ball', c: knot, ax: [mul(ff, 2.3), mul(fl, 2.6), mul(fu, 2.4)], skin: HER_HAIR });
  // two curls at the nape
  for (const k of [-1, 1]) {
    const a = add(hc, add(mul(fl, k * hr[1] * 0.7), add(mul(ff, -hr[0] * 0.5), mul(fu, -hr[2] * 0.4))));
    put('hair', 'curls', { k: 'rod', a, b: add(a, add([0, 0, -3.2], add(mul(fl, k * 0.5), mul(lag, 0.3)))), ra: 0.85, rb: 0.6, ramp: HER_HAIR });
  }
  // THE PLUME: three slender feathers from the knot, curving up and back, swaying, streaming as she goes
  for (let j = 0; j < 3; j++) {
    const base = add(knot, add(mul(fl, (j - 1) * 0.7), mul(fu, 0.8)));
    let prev = base;
    const long = j === 1 ? 1.0 : 0.78;
    for (let i = 1; i <= 6; i++) {
      const k = i / 6;
      const sway = Math.sin(t * 2.2 + j * 1.3 + k * 2) * 0.7 * k;
      const p = add(base, add(mul(fu, 1.8 * i * long * (1 - 0.5 * k)), add(mul(ff, -(0.8 + 0.3 * (j === 1 ? 1 : 0)) * i * k * long - 0.25 * i), add(mul(fl, (j - 1) * 0.75 * i * k + sway), mul(lag, 0.5 * i * k)))));
      const w = 0.42 + 0.42 * Math.sin(Math.PI * Math.min(1, k * 1.1));
      put('plume', 'plume', { k: 'rod', a: prev, b: p, ra: w, rb: Math.max(0.25, w - 0.1), ramp: j === 1 ? room.trim : room.ribbon });
      prev = p;
    }
  }
}

/** HIS HAIR: dark, drawn back from the brow and tied at the nape in a short queue with a black ribbon. */
function hisHair(put: Put, hc: V3, ff: V3, fl: V3, fu: V3, hr: V3, lag: V3): void {
  const skin: Skin = (u, tone) => (u[0] > -0.05 && u[2] < 0.5 ? null : HIS_HAIR[tone]);
  put('hair', 'hair', { k: 'ball', c: add(hc, add(mul(fu, 0.45), mul(ff, -0.6))), ax: [mul(ff, hr[0] * 1.0), mul(fl, hr[1] * 1.0), mul(fu, hr[2] * 1.0)], skin });
  const nape = add(hc, add(mul(ff, -hr[0] * 0.92), mul(fu, -hr[2] * 0.25)));
  const end = add(add(nape, add(mul(ff, -1.4), mul(fu, -4.6))), mul(lag, 0.6));
  put('hair', 'queue', { k: 'rod', a: nape, b: end, ra: 1.15, rb: 0.6, ramp: HIS_HAIR });
  put('hair', 'ribbon', { k: 'ball', c: lerp3(nape, end, 0.12), ax: [mul(ff, 0.9), mul(fl, 1.6), mul(fu, 0.9)], skin: RIBBON_BLACK });
}

/** The ribbon that ties the mask on: round the head over the ears, its two ends hanging from the knot behind and streaming. */
function maskRibbon(put: Put, hc: V3, ff: V3, fl: V3, fu: V3, hr: V3, room: Room, lag: V3, t: number): void {
  // (round the sides and back of the head only: at the front it is under the mask)
  put('hair', 'mask', { k: 'band', ring: { c: add(hc, add(mul(fu, hr[2] * 0.12), mul(ff, -0.6))), u: mul(ff, hr[0] * 0.92), v: mul(fl, hr[1] * 1.08) }, ramp: room.ribbon, rows: 1 });
  const knot = add(hc, add(mul(ff, -hr[0] * 1.06), mul(fu, hr[2] * 0.12)));
  for (const k of [-1, 1]) {
    let prev = knot;
    for (let i = 1; i <= 3; i++) {
      const sway = Math.sin(t * 3 + k + i) * 0.5;
      const p = add(knot, add(mul(ff, -0.8 * i), add(mul(fl, k * 0.7 * i + sway), add([0, 0, -2.2 * i], mul(lag, 0.6 * i)))));
      put('hair', 'mask', { k: 'rod', a: prev, b: p, ra: 0.55, rb: 0.5, ramp: room.ribbon });
      prev = p;
    }
  }
}

/**
 * CLOTH IN GORES: a skirt (or a coat's skirts) as `n` panels side by side from `from` to `to` degrees round it, each its
 * own hem: as it flies out they lift and drop by turns (`amp`), so its hem rolls in waves that run round it (`phase`).
 */
function gored(put: Put, part: string, piece: string, rings: ReadonlyArray<Ring>, ramp: Ramp, look: ClothLook, from: number, to: number, n: number, amp: number, phase: number): void {
  const hem = rings[0];
  for (let k = 0; k < n; k++) {
    const a0 = from + ((to - from) * k) / n;
    const a1 = from + ((to - from) * (k + 1)) / n;
    const w = Math.sin(((a0 + a1) / 2) * D * 4 + phase);
    const dr = amp * 0.07 * w;
    const dz = Math.max(0.8 - hem.c[2], amp * 2.6 * w);
    const r0: Ring = { c: add(hem.c, [0, 0, dz]), u: mul(hem.u, 1 + dr), v: mul(hem.v, 1 + dr) };
    put(part, piece, { k: 'cloth', rings: [r0, ...rings.slice(1)], ramp, look: { ...look, folds: [a0 + 1, (a0 + a1) / 2], arc: [a0 - 0.6, a1 + 0.6] } });
  }
}

/** The Hush leaking from them at each moment, and what their moves lay after their edge (Mob.grains). */
const GRAINS = new WeakMap<Moment, [V3, string, number][]>();

function dancerBits(who: DancerWho, st: Stage, m: Moment, say: DancerSay): Bit[] {
  const { s } = m;
  const B = bodyOf(who);
  const room = say.room;
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
  const [cf, cl, cu] = s.chest;
  const lag = lagOf(m, 1.5, 6);
  const spin = say.spin(m);
  const flare = clamp01((Math.abs(spin) - 0.3) / 2.2);
  const turnDir = spin >= 0 ? 1 : -1;
  const freed = say.freed?.(m) ?? false;
  for (const side of ['L', 'R'] as const) leg(put, s, B, who, side, room);
  const waistC = add(s.pelvis, mul(s.hips[2], B.waist * 0.62));
  if (who === 'lady') {
    // HER GOWN: the petticoat of ivory silk, whole; over it the gown's skirt, open at the front; the bodice, its front a
    // stomacher of ivory pointed at the waist; a square neckline
    const ph = -turnDir * m.wind * Math.PI * 4;
    const sk = skirtRings(s, B, m, flare, turnDir, 0);
    gored(put, 'skirt', 'petticoat', sk.rings, IVORY, { lift: 0.06 + 0.25 * flare, hem: LACE }, -40, 40, 2, flare, ph);
    const over = skirtRings(s, B, m, flare, turnDir, 0.7);
    gored(put, 'skirt', 'skirt', over.rings, room.cloth, { lift: 0.06 + 0.25 * flare, hem: room.trim }, 30, 330, 8, flare, ph);
    const bodice = torso(s, B, 0.4, 0.62);
    put('body', 'bodice', { k: 'cloth', rings: bodice.slice(0, 4), ramp: room.cloth, look: { folds: [0, 50, -50], lift: 0.03 } });
    // the stomacher: an ivory point down the front of the bodice
    const top = add(lerp3(s.ribs, s.neck, 0.55), mul(cf, B.ribDeep + 1.6));
    const low = add(waistC, mul(s.belly[0], B.waistDeep + 1.65));
    put('body', 'stomacher', {
      k: 'panel', c: lerp3(top, low, 0.5), u: mul(cl, B.ribHalf * 0.55), v: mul(sub(top, low), 0.5),
      skin: (a, b, front, tone) => (front && Math.abs(a) < B.ribHalf * 0.55 * (0.25 + 0.75 * clamp01((b / (0.5 * Math.hypot(top[0] - low[0], top[1] - low[1], top[2] - low[2])) + 1) / 2)) ? IVORY[Math.max(2, tone)] : null),
    });
    // her neck and shoulders above the neckline
    put('neck', 'neck', { k: 'rod', a: add(lerp3(s.ribs, s.neck, 0.45), mul(cu, 0.4)), b: lerp3(s.neck, s.head, 0.55), ra: 1.9, rb: 1.6, ramp: SKIN });
    put('neck', 'collar', { k: 'ball', c: add(lerp3(s.ribs, s.neck, 0.66), mul(cf, 0.5)), ax: [mul(cf, B.ribDeep * 0.78), mul(cl, B.shoulderHalf * 0.82), mul(cu, 2.2)], skin: SKIN });
    put('neck', 'necklace', { k: 'band', ring: { c: lerp3(s.neck, s.head, 0.12), u: mul(cf, 2.2), v: mul(cl, 2.1) }, ramp: room.ribbon, rows: 1 });
  } else {
    // HIS COAT: the ivory waistcoat over his shirt to the hips; the frock coat over it, open down the front, its skirts to
    // the knee; a white cravat at his throat
    const flat = hipsFlat(s);
    const wcoat = torso(s, B, 0.6, 0.35);
    wcoat.unshift({ c: add(s.pelvis, add(mul(s.hips[2], -0.5), mul(flat.f, 0.6))), u: mul(flat.f, B.pelvisDeep + 1.6), v: mul(flat.l, B.pelvisHalf + 1.5) });
    put('body', 'waistcoat', { k: 'cloth', rings: wcoat, ramp: IVORY, look: { folds: [0], lift: 0.04 } });
    put('body', 'coat', { k: 'cloth', rings: torso(s, B, 1.25, 0.4).slice(0, 5), ramp: room.cloth, look: { folds: [70, -70, 140, -140, 180], lift: 0.04, arc: [26, 334] } });
    const cs = coatSkirtRings(s, B, m, flare, turnDir);
    const ph = -turnDir * m.wind * Math.PI * 4;
    // (its two halves, parted at the vent behind: the coat-tails)
    gored(put, 'coatskirt', 'coatskirt', cs, room.cloth, { lift: 0.05 + 0.3 * flare, hem: room.trim }, 48, 172, 3, flare, ph);
    gored(put, 'coatskirt', 'coatskirt', cs, room.cloth, { lift: 0.05 + 0.3 * flare, hem: room.trim }, 188, 312, 3, flare, ph + 1.3);
    // the coat's buttons down its fronts, silver
    for (let i = 0; i < 3; i++) {
      const c = lerp3(lerp3(s.ribs, s.neck, 0.4), waistC, i / 2.4);
      for (const k of [-1, 1]) put('body', 'buttons', { k: 'dot', p: add(add(c, mul(i < 2 ? cf : s.belly[0], (i < 2 ? B.ribDeep : B.waistDeep) + 2.6)), mul(cl, k * 2.2)), c: BUCKLE, facing: cf });
    }
    put('neck', 'neck', { k: 'rod', a: add(s.neck, mul(cu, -1.2)), b: lerp3(s.neck, s.head, 0.5), ra: 2.2, rb: 2.0, ramp: SKIN });
    // the cravat: wound round the throat, its ends falling in a froth of white down his front
    put('neck', 'cravat', { k: 'band', ring: { c: lerp3(s.neck, s.head, 0.15), u: mul(cf, 2.6), v: mul(cl, 2.5) }, ramp: LACE, rows: 2 });
    const jab = add(add(s.neck, mul(cf, B.ribDeep * 0.55 + 1.2)), mul(cu, -1.6));
    put('neck', 'jabot', { k: 'ball', c: jab, ax: [mul(cf, 1.3), mul(cl, 1.7), mul(cu, 2.6)], skin: LACE });
    put('neck', 'jabot', { k: 'rod', a: add(jab, mul(cu, -1.5)), b: add(add(jab, mul(cu, -4.2)), mul(cf, 0.4 + 0.2 * lag[0])), ra: 1.5, rb: 1.0, ramp: LACE });
  }
  // THE ARMS
  const g = say.burn?.(m) ?? 0;
  arm(put, s, B, who, 'L', room, cu, 0.35, 0.3 + 0.7 * g, lag);
  arm(put, s, B, who, 'R', room, cu, 0.35, 0.3 + 0.7 * g, lag);
  // THE HEAD: the face under, the mask over it (it drops as they die: a piece of its own, Mob.fall), the hair, the ribbon
  const [ff, fl, fu] = wornOn(st, s, 8);
  const hr: V3 = [B.headR[0], B.headR[1] * 1.04, B.headR[2]];
  const hc = add(s.head, mul(fu, -0.2));
  face(put, hc, ff, fl, fu, hr, freed);
  const mouth = mask(put, hc, ff, fl, fu, hr, room, g, freed);
  if (who === 'lady') herHair(put, hc, ff, fl, fu, hr, room, lag, m.t);
  else hisHair(put, hc, ff, fl, fu, hr, lag);
  maskRibbon(put, hc, ff, fl, fu, hr, room, lag, m.t);
  // THE HUSH: leaking from the mask's lips; harder through the warning; pouring out as they die
  const seed = who === 'lady' ? 11 : 12;
  if (!m.dying) hushBreath(put, mouth, ff, fl, m.t, say.puff?.(m) ?? 0.8, seed);
  else if (say.leaving) {
    const [a, b] = say.leaving;
    hushBreath(put, mouth, ff, fl, m.t, Math.max(0, 1.6 * (1 - clamp01((m.t - a * 0.5) / (b - a * 0.5)))), seed);
    hushLeaves(put, mouth, ff, fl, m.t, seed, a, b);
  }
  // THE SMEAR of a lightning strike: its after-images (the oldest thinned to every other point)
  const sm = say.smear?.(m);
  if (sm) {
    sm.forEach((line, j) => {
      const k = j / Math.max(1, sm.length - 1);
      const cols = smearColours(room);
      for (let i = 1; i < line.length; i++) {
        const [x0, y0] = st.at(line[i - 1]);
        const [x1, y1] = st.at(line[i]);
        const n = Math.max(1, Math.ceil(Math.hypot(x1 - x0, y1 - y0)));
        for (let e = 0; e < n; e++) {
          if (k < 0.5 && (e + i) % 2) continue;
          put('smear', 'smear', { k: 'mote', p: lerp3(line[i - 1], line[i], e / n), c: k > 0.7 ? cols[2] : k > 0.35 ? cols[1] : cols[0], size: k > 0.7 ? 2 : 1 });
        }
      }
    });
  }
  grains.push(...(say.more?.(m) ?? []));
  void hash;
  void D;
  return bits;
}
/** The smear's newest after-image: near white. */
export const SMEAR_PALE = '#f2eef6';
/** THE SMEAR'S COLOURS in a room's clothes: its brightest tone washed a third and two thirds toward white, the oldest first, and near white (none of them anywhere else on them). */
export function smearColours(room: Room): [string, string, string] {
  const wash = (c: string, k: number): string => {
    const n = parseInt(c.slice(1), 16);
    const ch = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => Math.round(v + (250 - v) * k) | 1);
    return `#${ch.map((v) => v.toString(16).padStart(2, '0')).join('')}`;
  };
  return [wash(room.cloth[4], 0.3), wash(room.cloth[4], 0.62), SMEAR_PALE];
}

/** THEM AS THE PAINTER TAKES THEM. */
export function dancerPainter(who: DancerWho, say: DancerSay): { bits: (st: Stage, m: Moment) => Bit[]; grains: (st: Stage, m: Moment) => ReadonlyArray<readonly [V3, string, number]> } {
  return { bits: (st, m) => dancerBits(who, st, m, say), grains: (_st, m) => GRAINS.get(m) ?? [] };
}

/** Their rests: upright and proud, the chin up. Hers, the left hand lifted before her as if to be taken, the right holding her skirt out a little at her side; his, the right hand on his hip, the left drawn back in a flourish. */
export const LADY_REST: Bones = {
  ...standing(LADY_BODY),
  pz: -0.3, pitch: -2, bend: -3, roll: 0, side: 0, faceUp: 6, faceTilt: 6, faceTurn: -8,
  lfx: 1.4, lfy: 0.4, lft: 18, lk: 12, rfx: -1.0, rfy: -0.6, rft: -22, rk: -16,
  lhIn: 1, lhx: 9.0, lhy: 3.0, lhz: -6.5, le: -20,
  rhIn: 1, rhx: 3.0, rhy: -7.5, rhz: -20, re: 14,
  out: 0,
} as Bones;
export const GENT_REST: Bones = {
  ...standing(GENT_BODY),
  pz: -0.2, pitch: -3, bend: -3, roll: 0, side: 0, faceUp: 6, faceTilt: -4, faceTurn: 6,
  lfx: 2.0, lfy: 1.0, lft: 24, lk: 18, rfx: -1.2, rfy: -0.6, rft: -14, rk: -12,
  lhIn: 1, lhx: -1.0, lhy: 9.0, lhz: -16, le: -30,
  rhIn: 1, rhx: 1.0, rhy: -6.4, rhz: -13.5, re: 50,
  out: 0,
} as Bones;
