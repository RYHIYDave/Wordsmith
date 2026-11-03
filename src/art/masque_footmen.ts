// FLOOR 17'S FOOTMEN, THE MASQUE'S MEDIUM MOB (the art chat, 29 Oct 2026). A MOCK-UP: NOT IN THE GAME. Nothing of the game
// imports this file; `FOOTMEN_ON` is off. Their moves are art/masque_footmen_moves.ts; what they throw and what their
// candles spill, art/masque_footmen_fx.ts.
//
// Floor 17, THE MASQUE: the prince's masked ball, gone on for weeks, in a suite of seven rooms each in its own colour
// (Poe's "The Masque of the Red Death", 1842, drawn only from the book). The floor's plan, his yes: "Enemies: masked
// dancers who waltz until they notice you, footmen, and the Silent Order among the guests."
//
// HIS BRIEF FOR THEM (offered to him as a pop-up; his pick for how they move, “Brisk and stiff (Recommended)”). The brief
// as offered: FOOTMEN (floor 17, medium). Who: the palace's liveried footmen: powdered wig, braided coat, white gloves, a
// silver tray. Size: a little taller than the knight, fewer. Move: a brisk, stiff, upright march. Mark: the powdered wig
// and the silver tray. Attacks (two): the tray flung spinning like a disc; a lit candelabrum swung overhead. Death: the
// tray clatters down, they drop to their knees, the Hush leaves them. Never: not the palace guard (no armour), not comic
// butlers. Sound: the tray's clang, the candles' hiss. (Their death made new on his pick of 30 Oct, “Yes, these
// (Recommended)”: rigid a moment, then over backwards like a plank, the tray spinning to a stop on its rim; the moves file.)
//
// WHO THEY ARE: the prince's footmen, their words stolen by the Hush, still serving the ball that never ends. A little
// taller than the knight (63 to his 58), slender and upright. THE MASQUE'S LIVERY, nothing like floor 16's guard or
// grooms (no armour, no wine and white, no madder and buff): a long coat of black, its skirts to the knee, laced all
// down its fronts, round its hem, its collar and its great turned-back cuffs with gold braid; a waistcoat and breeches of
// deep crimson, gold buttons; white silk stockings, black buckled shoes; a white cravat; WHITE GLOVES; A POWDERED WIG,
// white, rolled over each ear, its queue tied at the nape with a black bow. THE SILVER TRAY, a round salver with a
// gadrooned rim, carried high on the flat of his left hand beside his head (his mark, seen from in front and behind);
// A LIT CANDELABRUM of gilt bronze, three candles burning with an honest orange flame, carried before him in his right.
// Hushed as the city's are (art/hushed.ts, whose skin and breath they share): the face drained grey, the cult's dull pink
// in the eyes, the mouth hanging open and working, grey breath leaking out of it. The enemy's pink edge round them while
// they live. Nothing cyan; nothing of the livery pink.

import { HUSH } from './crier';
import { BREATH_PALE, SKIN, hushBreath, hushLeaves, lagOf } from './hushed';
import { INK, hash } from './kit';
import type { Ramp } from './kit';
import { FLAME } from './mkit';
import { sphere } from './new_mobs3';
import type { Bit, MobCanvas, Moment, Put } from './new_mobs3';
import { wornOn } from './skin';
import type { Ring, Skin, Stage } from './skin';
import { add, buildOf, cross, dot, heading, lerp3, mul, norm, sub } from './skeleton';
import type { Build, Skeleton, V3 } from './skeleton';

/** THE SWITCH, OFF. Nothing of the game reads this file. */
export const FOOTMEN_ON = { on: false };

const clamp01 = (v: number): number => Math.max(0, Math.min(1, v));
const D = Math.PI / 180;
const len3 = (v: V3): number => Math.hypot(v[0], v[1], v[2]);
const fr = (t: number): number => t - Math.floor(t);

// =============================================================================================
// THEIR COLOURS: the Masque's livery, black and gold over deep crimson; white silk, white gloves, white powder; silver and
// gilt. (Every colour of theirs is clear of the enemy's pink, hues 300 to 350, and of the friend's cyan, 160 to 205.)

/** The coat: black, a little cool. */
export const COAT: Ramp = ['#0d0c12', '#17151e', '#322d3c', '#4a4456', '#665e74'];
/** Gold braid. */
export const LACE: Ramp = ['#3c2a0e', '#5c4216', '#94702c', '#c49a44', '#e8c672'];
/** The waistcoat, the breeches, the cuffs: deep crimson. */
export const CRIMSON: Ramp = ['#280a0c', '#3e1012', '#72201e', '#982e26', '#b84232'];
/** White silk: the stockings, the cravat. */
export const SILK: Ramp = ['#48444e', '#5a5662', '#a29eaa', '#cdc9d2', '#e9e5ec'];
/** White kid gloves. */
export const GLOVE: Ramp = ['#4c4850', '#5e5a64', '#aaa6ae', '#d6d2d8', '#f0ecf0'];
const SHOE: Ramp = ['#0a090c', '#121014', '#28232a', '#3c353e', '#4e4650'];
/** The powdered wig: white, a breath of lavender in its shade. */
export const WIG: Ramp = ['#46424e', '#58545f', '#a8a4b0', '#d0ccd6', '#ece8f0'];
const RIBBON: Ramp = ['#08070a', '#0e0c10', '#1e1b22', '#2c2832', '#3a3540'];
/** The tray: polished silver. */
export const SILVER: Ramp = ['#22242c', '#30343e', '#6e7482', '#a8aebc', '#e2e6ee'];
/** The candelabrum: gilt bronze. */
export const GILT: Ramp = ['#2e200c', '#463214', '#7c5c26', '#ae8a40', '#dcbc6c'];
/** The candles: ivory wax. */
export const WAX: Ramp = ['#3a3628', '#4e4836', '#9a9278', '#c8c0a0', '#e6dfc2'];
/** AN HONEST FLAME (his rulebook, Colour 3: as floor 16's lantern; never the enemy's pink): red at its root, orange, yellow, white at its heart. */
export const CANDLE: Ramp = ['#8a2a14', '#d0501a', '#ff8a2a', '#ffc860', '#fff3b0'];
/** The candles' light, as the game lays it over the dark: orange. */
export const CANDLE_LIGHT = '#ff9a40';
const BUCKLE = '#c8ccd6';

// =============================================================================================
// THE BODY: a little taller than the knight (58), slender and upright

export const FOOTMAN_BODY: Build = buildOf(63, 1.24, { shoulders: 1.0, chest: 0.96, depth: 0.98, waist: 0.9, hips: 0.98, arms: 1.0, trunk: 1.0, limbs: 0.94, skirt: [3.2, 3.6] });
const FB = FOOTMAN_BODY;
/** Their picture: room for the candelabrum raised high over the head and swung down before them, and the tray flung out. */
export const FOOTMAN_CANVAS: MobCanvas = { w: 300, h: 260, ax: 138, ay: 196 };

// =============================================================================================
// THE TRAY: a round salver of silver, a gadrooned rim

/** Its radius; how far above the palm its middle rides; how far in from its rim a hand grips it. */
export const TRAY = { r: 6.6, palm: 1.7, grip: 1.2 } as const;
/**
 * The tray as it is at a moment, in the left hand: its face's way (the bones' `pAz`, `pEl`: straight up when level), and
 * where it sits on the hand (`pt`: 0 balanced on the flat of the palm, its middle over it; 1 gripped at its rim, its middle
 * on along the forearm's line). Its middle, its face's way, and two ways across it.
 */
export function trayOf(s: Skeleton, q: { pAz: number; pEl: number; pt: number }): { c: V3; n: V3; u: V3; v: V3; rim: V3[] } {
  const n = norm(heading(q.pAz, q.pEl), [0, 0, 1]);
  const g = clamp01(q.pt);
  const fore = norm(sub(s.handL, s.elbowL), [1, 0, 0]);
  const flat = norm(sub(fore, mul(n, dot(fore, n))), norm(cross(n, [0, 1, 0]), [1, 0, 0]));
  const c = add(s.handL, add(mul(n, TRAY.palm * (1 - g) + 0.3 * g), mul(flat, (TRAY.r - TRAY.grip) * g)));
  const u = flat;
  const v = norm(cross(n, u), [0, 1, 0]);
  const rim: V3[] = [];
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    rim.push(add(c, add(mul(u, Math.cos(a) * TRAY.r), mul(v, Math.sin(a) * TRAY.r))));
  }
  return { c, n, u, v, rim };
}
/**
 * THE TRAY ITSELF, anywhere (in his hand, in flight, falling): its bed engraved with rings and a rosette, its rim gadrooned
 * (lobes catching the light by turns) and rolled up proud of the bed, its underside darker. `spin`: turned this far about
 * its own middle (turns: 0 to 1), so its rosette and lobes go round as it flies. `part`: the part it is painted on.
 */
export function trayBits(put: Put, part: string, c: V3, n: V3, u0: V3, spin: number, glint = 0, deep = false): void {
  const a0 = spin * Math.PI * 2;
  const v0 = norm(cross(n, u0), [0, 1, 0]);
  const u = add(mul(u0, Math.cos(a0)), mul(v0, Math.sin(a0)));
  const v = norm(cross(n, u), [0, 1, 0]);
  const R = TRAY.r;
  put(part, 'tray', {
    k: 'panel',
    c,
    u: mul(u, R),
    v: mul(v, R),
    skin: (a, b, front, tone0) => {
      const r = Math.hypot(a, b) / R;
      if (r > 1) return null;
      if (!front) return SILVER[Math.max(0, Math.min(2, tone0 - 1))];
      // (`deep`: the tray seen full face, lying or rolling on its rim, its bed a step darker so that its rim, its well, its
      // boss and the band of light across it stand out as they do on a salver, not one white disc)
      if (deep) {
        const ang = Math.atan2(b, a);
        const lit = Math.max(1, Math.min(3, tone0));
        if (r > 0.8) return Math.floor(((ang / (Math.PI * 2)) * 18 + 18) % 2) ? SILVER[4] : SILVER[Math.max(1, lit - 1)];
        if (r > 0.7) return SILVER[Math.max(1, lit - 2)];
        if (r < 0.24 && Math.cos(ang * 3) > 0.2) return SILVER[4];
        if (r < 0.3) return SILVER[Math.max(1, lit - 1)];
        return Math.abs(a / R + (b / R) * 0.4) < 0.2 ? SILVER[4] : SILVER[lit];
      }
      const tone = Math.max(2, Math.min(4, tone0 + 1));
      const ang = Math.atan2(b, a);
      // (the gadrooned rim: lobes bright and dark by turns)
      if (r > 0.8) return Math.floor(((ang / (Math.PI * 2)) * 18 + 18) % 2) ? SILVER[Math.min(4, tone + 1)] : SILVER[Math.max(2, tone - 1)];
      // (the well inside the rim, a step into shade)
      if (r > 0.72) return SILVER[Math.max(2, tone - 1)];
      // (a boss at its middle, its lobes bright: they go round as it spins)
      if (r < 0.24 && Math.cos(ang * 3) > 0.2) return SILVER[Math.min(4, tone + 1)];
      // (the polish: a broad band of light across the bed)
      return Math.abs(a / R + (b / R) * 0.4) < 0.2 ? SILVER[Math.min(4, tone + 1)] : SILVER[tone];
    },
  });
  // the rim rolled up proud of the bed, all round
  const N = 16;
  for (let i = 0; i < N; i++) {
    const a1 = (i / N) * Math.PI * 2;
    const a2 = ((i + 1) / N) * Math.PI * 2;
    const p1 = add(c, add(add(mul(u, Math.cos(a1) * R * 0.97), mul(v, Math.sin(a1) * R * 0.97)), mul(n, 0.35)));
    const p2 = add(c, add(add(mul(u, Math.cos(a2) * R * 0.97), mul(v, Math.sin(a2) * R * 0.97)), mul(n, 0.35)));
    put(part, 'tray', { k: 'rod', a: p1, b: p2, ra: 0.55, rb: 0.55, ramp: SILVER });
  }
  if (glint > 0.05) put('glint', 'tray', { k: 'glow', p: c, c: FLAME[1], r: 6 + 6 * glint, a: 0.5 * glint });
}

// =============================================================================================
// THE CANDELABRUM: gilt bronze, three lights; held by its stem in the right hand

/** Its lengths along its stem from the hand (up toward the candles): its foot below; where its branches spring; the side cups and the middle one; the candles; how far out each side cup stands. */
export const CANDELABRUM = { foot: -6.0, spring: 3.2, cup: 5.6, top: 7.0, candle: 4.4, out: 4.8 } as const;
/** The candelabrum as it is at a moment: its stem's way (from foot to candles), the way its branches spread, its foot, its cups and the tops of its candles (where the flames are), and its middle (what strikes). */
export function candelabrumOf(s: Skeleton): { way: V3; across: V3; foot: V3; at: (k: number) => V3; cups: V3[]; wicks: V3[]; mid: V3; top: V3 } {
  const way = s.point;
  const across = norm(sub(s.across, mul(way, dot(s.across, way))), [0, 1, 0]);
  const at = (k: number): V3 => add(s.handR, mul(way, k));
  const C = CANDELABRUM;
  const cups = [add(at(C.cup), mul(across, -C.out)), at(C.top), add(at(C.cup), mul(across, C.out))];
  const wicks = cups.map((p) => add(p, mul(way, C.candle + 0.4)));
  return { way, across, foot: at(C.foot), at, cups, wicks, mid: at(C.cup), top: wicks[1] };
}
/** THE CANDELABRUM: a domed foot, a turned stem with a knop under the hand, two branches curling out and up to their cups, the middle cup on the stem; drip pans; the three candles. (Their flames are laid after the edge: `flamesOf`.) */
function candelabrum(put: Put, s: Skeleton, glint: number): void {
  const k = candelabrumOf(s);
  const C = CANDELABRUM;
  const side = norm(cross(k.way, k.across), [1, 0, 0]);
  // the foot: a dome on a flat rim
  put('candelabrum', 'candelabrum', { k: 'ball', c: add(k.foot, mul(k.way, 0.9)), ax: [mul(k.across, 2.5), mul(side, 2.5), mul(k.way, 1.3)], skin: GILT });
  put('candelabrum', 'candelabrum', { k: 'rod', a: add(k.foot, mul(k.way, 0.3)), b: add(k.foot, mul(k.way, 0.8)), ra: 2.7, rb: 2.7, ramp: GILT });
  // the stem, a knop below the hand and one above it
  put('candelabrum', 'candelabrum', { k: 'rod', a: add(k.foot, mul(k.way, 1.6)), b: k.at(C.top - 0.6), ra: 0.7, rb: 0.6, ramp: GILT });
  put('candelabrum', 'candelabrum', { k: 'ball', c: k.at(-2.4), ax: [mul(k.across, 1.1), mul(side, 1.1), mul(k.way, 0.8)], skin: GILT });
  put('candelabrum', 'candelabrum', { k: 'ball', c: k.at(C.spring), ax: [mul(k.across, 1.0), mul(side, 1.0), mul(k.way, 0.7)], skin: GILT });
  // the branches: out from where they spring, curling up to their cups
  for (const sgn of [-1, 1]) {
    const pts: V3[] = [];
    for (let i = 0; i <= 5; i++) {
      const u = i / 5;
      const out = C.out * Math.sin((Math.PI / 2) * u) ** 0.8;
      const up = C.spring + (C.cup - 0.9 - C.spring) * u * u - 1.6 * Math.sin(Math.PI * u);
      pts.push(add(k.at(up), mul(k.across, sgn * out)));
    }
    for (let i = 0; i < 5; i++) put('candelabrum', 'candelabrum', { k: 'rod', a: pts[i], b: pts[i + 1], ra: 0.55, rb: 0.5, ramp: GILT });
  }
  // the cups with their drip pans, and the candles
  for (const cup of k.cups) {
    put('candelabrum', 'candelabrum', { k: 'ball', c: cup, ax: [mul(k.across, 1.4), mul(side, 1.4), mul(k.way, 0.45)], skin: GILT });
    put('candelabrum', 'candelabrum', { k: 'rod', a: add(cup, mul(k.way, -0.7)), b: add(cup, mul(k.way, 0.3)), ra: 0.75, rb: 0.9, ramp: GILT });
    put('candelabrum', 'candelabrum', { k: 'rod', a: add(cup, mul(k.way, 0.3)), b: add(cup, mul(k.way, C.candle)), ra: 0.72, rb: 0.68, ramp: WAX });
  }
  if (glint > 0.05) put('glint', 'candelabrum', { k: 'glow', p: k.mid, c: FLAME[1], r: 6 + 6 * glint, a: 0.5 * glint });
}
/**
 * THE CANDLES' FLAMES, laid after the edge (so they keep their own colour and get no pink edge): from each wick, a tongue
 * of flame rising, blown back by the air (`wind`: which way and how hard the air goes past them, the figure's own lengths;
 * nothing, still), flickering; and the light they throw. `burn`: how much of them there is (0 out, 1 burning, more: flared).
 */
export function flamesOf(wicks: ReadonlyArray<V3>, wind: V3, t: number, burn: number, seed: number): { grains: [V3, string, number][]; light: V3 | null } {
  const grains: [V3, string, number][] = [];
  if (burn <= 0.02) return { grains, light: null };
  const w = len3(wind);
  const blow = w > 1e-6 ? mul(wind, Math.min(1.6, w / 4) / w) : ([0, 0, 0] as V3);
  wicks.forEach((p, i) => {
    const flick = 0.75 + 0.25 * Math.sin(t * 23 + i * 2.1 + seed) + 0.15 * (hash(Math.floor(t * 30), i, seed + 7600) - 0.5);
    const tall = (3.2 + 2.2 * Math.min(1.6, w / 4)) * flick * Math.min(1.4, burn);
    const up = norm(add([0, 0, 1], blow), [0, 0, 1]);
    const sway = 0.35 * Math.sin(t * 9 + i * 1.3 + seed);
    for (let k = 0; k <= 5; k++) {
      const h = (k / 5) * tall;
      const q = add(p, add(mul(up, h + 0.3), [sway * (k / 5), sway * 0.6 * (k / 5), 0]));
      // (red at its root, then orange, yellow at its middle, a white heart low in it; its tip a lick of orange)
      const c = k === 0 ? CANDLE[1] : k === 1 ? CANDLE[4] : k === 2 ? CANDLE[3] : k === 3 ? CANDLE[3] : k === 4 ? CANDLE[2] : CANDLE[1];
      grains.push([q, c, k <= 2 ? 2 : 1]);
    }
  });
  const light = lerp3(wicks[0], wicks[wicks.length - 1], 0.5);
  return { grains, light: add(light, [0, 0, 2]) };
}

// =============================================================================================
// THEM AS SOLIDS

/** A leg: crimson breeches buckled below the knee; a white silk stocking; a black shoe with a silver buckle. */
function leg(put: Put, s: Skeleton, side: 'L' | 'R'): void {
  const hip = side === 'L' ? s.hipL : s.hipR;
  const knee = side === 'L' ? s.kneeL : s.kneeR;
  const ankle = side === 'L' ? s.ankleL : s.ankleR;
  const heel = side === 'L' ? s.heelL : s.heelR;
  const toe = side === 'L' ? s.toeL : s.toeR;
  const [rH, rK, rA] = FB.legR;
  const shin = norm(sub(ankle, knee), [0, 0, -1]);
  put(`leg${side}`, `leg${side}`, { k: 'rod', a: hip, b: knee, ra: rH * 1.14, rb: rK * 1.16, ramp: CRIMSON, far: true });
  put(`leg${side}`, `leg${side}`, { k: 'ball', c: knee, ax: sphere(rK * 1.16), skin: CRIMSON, far: true });
  // (the breeches' band below the knee, its gold buckle on the outside)
  const band = add(knee, mul(shin, 1.6));
  put(`shin${side}`, `garter${side}`, { k: 'rod', a: add(band, mul(shin, -0.6)), b: add(band, mul(shin, 0.6)), ra: rK * 1.22, rb: rK * 1.2, ramp: CRIMSON, far: true });
  const outSide = norm(cross(shin, s.hips[0]), [0, side === 'L' ? 1 : -1, 0]);
  const out = mul(outSide, (side === 'L' ? 1 : -1) * (dot(outSide, s.hips[1]) >= 0 ? 1 : -1));
  put(`shin${side}`, `garter${side}`, { k: 'ball', c: add(band, mul(out, rK * 1.15)), ax: sphere(0.75), skin: LACE, far: true });
  put(`shin${side}`, `shin${side}`, { k: 'rod', a: add(knee, mul(shin, 2.0)), b: ankle, ra: rK * 1.02, rb: rA * 1.04, ramp: SILK, far: true });
  // (the calf, its swell behind the shin)
  const calf = lerp3(knee, ankle, 0.34);
  const back = norm(sub(mul(s.hips[0], -1), mul(shin, dot(mul(s.hips[0], -1), shin))), [-1, 0, 0]);
  put(`shin${side}`, `shin${side}`, { k: 'ball', c: add(calf, mul(back, 0.6)), ax: [mul(shin, 4.6), mul(back, rK * 1.12), mul(norm(cross(shin, back), [0, 1, 0]), rK * 1.06)], skin: SILK, far: true });
  // the shoe: low, black, square-toed, a silver buckle over its instep
  const fwd = norm(sub(toe, heel), [1, 0, 0]);
  const side3 = norm(Math.abs(fwd[2]) < 0.95 ? [-fwd[1], fwd[0], 0] : cross(s.hips[2], fwd), [0, 1, 0]);
  const up3 = norm(cross(fwd, side3), [0, 0, 1]);
  put(`foot${side}`, `foot${side}`, { k: 'ball', c: add(lerp3(heel, toe, 0.5), mul(up3, 1.5)), ax: [mul(fwd, 4.8), mul(side3, 1.9), mul(up3, 1.55)], skin: SHOE, far: true });
  put(`foot${side}`, `buckle${side}`, { k: 'ball', c: add(lerp3(heel, toe, 0.62), mul(up3, 2.9)), ax: [mul(fwd, 0.7), mul(side3, 1.1), mul(up3, 0.45)], skin: [BUCKLE, BUCKLE, BUCKLE, BUCKLE, '#eef0f4'], far: true });
}

/** A sleeve of the black coat; its great turned-back cuff of crimson laced with gold; a ruffle of white at the wrist; the white glove, its fingers closed round what it holds (`curl` 1) or laid flat under the tray (0). */
function arm(put: Put, s: Skeleton, side: 'L' | 'R', cu: V3, curl: number, under: V3 | null = null): void {
  const sh = side === 'L' ? s.shoulderL : s.shoulderR;
  const el = side === 'L' ? s.elbowL : s.elbowR;
  const hand = side === 'L' ? s.handL : s.handR;
  const [r0, r1, r2] = FB.armR;
  const fore = norm(sub(hand, el), [0, 0, -1]);
  const upper = norm(sub(el, sh), [0, 0, -1]);
  put(`arm${side}`, `arm${side}`, { k: 'ball', c: add(sh, mul(upper, 0.6)), ax: sphere(r0 * 1.28), skin: COAT, far: true });
  put(`arm${side}`, `arm${side}`, { k: 'rod', a: sh, b: el, ra: r0 * 1.2, rb: r1 * 1.16, ramp: COAT, far: true });
  put(`fore${side}`, `fore${side}`, { k: 'ball', c: el, ax: sphere(r1 * 1.16), skin: COAT, far: true });
  const wrist = add(hand, mul(fore, -1.4));
  put(`fore${side}`, `fore${side}`, { k: 'rod', a: el, b: wrist, ra: r1 * 1.1, rb: r2 * 1.1, ramp: COAT, far: true });
  // (the cuff: turned back, wide, crimson, its top edge laced gold)
  const c0 = lerp3(el, wrist, 0.5);
  const c1 = lerp3(el, wrist, 0.92);
  put(`fore${side}`, `cuff${side}`, { k: 'rod', a: c0, b: c1, ra: r1 * 1.5, rb: r1 * 1.38, ramp: CRIMSON, far: true });
  put(`fore${side}`, `cuff${side}`, { k: 'rod', a: lerp3(c0, c1, -0.02), b: lerp3(c0, c1, 0.08), ra: r1 * 1.56, rb: r1 * 1.56, ramp: LACE, far: true });
  // (the white ruffle at the wrist)
  put(`fore${side}`, `ruffle${side}`, { k: 'rod', a: add(wrist, mul(fore, -0.3)), b: add(wrist, mul(fore, 0.7)), ra: r2 * 1.5, rb: r2 * 1.25, ramp: SILK, far: true });
  // the glove: closed round what it holds; or, under the tray, laid flat beneath it, its fingers spread along it
  const along = under ? norm(sub(fore, mul(under, dot(fore, under))), fore) : fore;
  const e1 = under ? under : norm(sub(cu, mul(fore, dot(cu, fore))), [0, 0, 1]);
  const e2 = norm(cross(along, e1), [0, 1, 0]);
  const palm = under ? add(hand, mul(under, -0.2)) : hand;
  put(`hand${side}`, `hand${side}`, { k: 'ball', c: add(palm, mul(along, 0.4)), ax: [mul(along, 1.8), mul(e2, 1.55), mul(e1, 1.0)], skin: GLOVE, far: true });
  for (let i = 0; i < 4; i++) {
    const spread = (i - 1.5) * (0.34 + 0.16 * (1 - curl));
    const base = add(palm, add(mul(along, 1.45), mul(e2, spread * 0.9)));
    const mid = add(base, add(mul(along, 1.4 * (1 - 0.4 * curl)), add(mul(e2, spread * 0.3), mul(e1, -1.1 * curl))));
    const tip = add(mid, add(mul(along, 1.0 * (1 - 0.8 * curl)), mul(e1, -1.4 * curl)));
    put(`hand${side}`, `finger${side}`, { k: 'rod', a: base, b: mid, ra: 0.56, rb: 0.48, ramp: GLOVE, far: true });
    put(`hand${side}`, `finger${side}`, { k: 'rod', a: mid, b: tip, ra: 0.48, rb: 0.36, ramp: GLOVE, far: true });
  }
  // (the thumb, on the inside of the hand)
  const thumbSide = side === 'L' ? 1 : -1;
  const tb = add(palm, add(mul(along, 0.6), mul(e2, thumbSide * 1.3)));
  const tt = add(tb, add(mul(along, 1.3), add(mul(e2, thumbSide * 0.6), mul(e1, -0.9 * curl))));
  put(`hand${side}`, `finger${side}`, { k: 'rod', a: tb, b: tt, ra: 0.56, rb: 0.42, ramp: GLOVE, far: true });
}

/** A point kept `r` above the floor, if it would be lower (what lies under his head as he lies on his back). Higher, it is as it is. */
const onFloor = (p: V3, r: number): V3 => (p[2] < r ? [p[0], p[1], r] : p);

/** A ring about the trunk at `c` along its forward `f` and left `l`, so far out each way. */
const ringAt = (c: V3, f: V3, l: V3, df: number, dl: number): Ring => ({ c, u: mul(f, df), v: mul(l, dl) });
/** A point on a ring `deg` round from its forward toward its left, `out` beyond it. */
function onRing(r: Ring, deg: number, out: number): V3 {
  const t = deg * D;
  return add(r.c, add(mul(r.u, Math.cos(t) * (1 + out / Math.max(1e-6, len3(r.u)))), mul(r.v, Math.sin(t) * (1 + out / Math.max(1e-6, len3(r.v))))));
}

/**
 * THE COAT AS RINGS, from its hem up to its collar: its skirts round both thighs, to just above the knee, hanging plumb
 * whatever the legs do (knelt, they lie on the floor round him), flaring, hanging back as he goes; its body close to the
 * trunk to the collar.
 */
function coatRings(s: Skeleton, lag: V3): Ring[] {
  const [cf, cl, cu] = s.chest;
  const be = s.belly;
  const f = norm([s.hips[0][0], s.hips[0][1], 0], [1, 0, 0]);
  const l: V3 = [-f[1], f[0], 0];
  const waistC = add(s.pelvis, mul(s.hips[2], FB.waist * 0.55));
  // (the skirts: their middle between the thighs, where they reach down to; the hem a skirt's length under the waist, never in the floor)
  const thigh = (k: number): V3 => lerp3(lerp3(s.hipL, s.kneeL, k), lerp3(s.hipR, s.kneeR, k), 0.5);
  const spanF = (k: number): number => Math.abs(dot(sub(lerp3(s.hipL, s.kneeL, k), lerp3(s.hipR, s.kneeR, k)), f));
  const spanL = (k: number): number => Math.abs(dot(sub(lerp3(s.hipL, s.kneeL, k), lerp3(s.hipR, s.kneeR, k)), l));
  const rT = FB.legR[0] * 1.16;
  const LONG = 20.5;
  const hemZ = Math.max(1.4, waistC[2] - LONG);
  const midZ = Math.max(hemZ + 4, (waistC[2] + hemZ) / 2);
  const t1 = thigh(0.45);
  const t2 = thigh(0.85);
  const hemC: V3 = [t2[0] + lag[0] * 1.2, t2[1] + lag[1] * 1.2, hemZ];
  const midC: V3 = [t1[0] + lag[0] * 0.6, t1[1] + lag[1] * 0.6, midZ];
  return [
    ringAt(hemC, f, l, Math.max(FB.pelvisDeep + 4.2, spanF(0.85) / 2 + rT + 2.2), Math.max(FB.pelvisHalf + 3.6, spanL(0.85) / 2 + rT + 2.0)),
    ringAt(midC, f, l, Math.max(FB.pelvisDeep + 3.6, spanF(0.45) / 2 + rT + 1.6), Math.max(FB.pelvisHalf + 3.4, spanL(0.45) / 2 + rT + 1.4)),
    ringAt(add(s.pelvis, mul(s.hips[2], -0.6)), s.hips[0], s.hips[1], FB.pelvisDeep + 2.5, FB.pelvisHalf + 2.5),
    ringAt(waistC, be[0], be[1], FB.waistDeep + 2.0, FB.waistHalf + 2.0),
    ringAt(s.ribs, cf, cl, FB.ribDeep + 2.2, FB.ribHalf + 2.2),
    ringAt(lerp3(s.ribs, s.neck, 0.72), cf, cl, FB.ribDeep + 1.6, FB.shoulderHalf + 1.0),
    ringAt(add(s.neck, mul(cu, -0.6)), cf, cl, 4.0, 4.6),
  ];
}
/** The waistcoat: crimson, from the top of the thighs to the throat, close to the trunk. */
function waistcoatRings(s: Skeleton): Ring[] {
  const [cf, cl, cu] = s.chest;
  const be = s.belly;
  const waistC = add(s.pelvis, mul(s.hips[2], FB.waist * 0.55));
  return [
    ringAt(add(s.pelvis, mul(s.hips[2], -2.4)), s.hips[0], s.hips[1], FB.pelvisDeep + 1.7, FB.pelvisHalf + 1.7),
    ringAt(waistC, be[0], be[1], FB.waistDeep + 1.4, FB.waistHalf + 1.4),
    ringAt(s.ribs, cf, cl, FB.ribDeep + 1.6, FB.ribHalf + 1.6),
    ringAt(lerp3(s.ribs, s.neck, 0.72), cf, cl, FB.ribDeep + 1.0, FB.shoulderHalf + 0.4),
    ringAt(add(s.neck, mul(cu, -0.8)), cf, cl, 3.4, 4.0),
  ];
}
/** Where the coat opens at the front: this many degrees either side of its middle. */
const OPEN = 34;

/**
 * THE HEAD: the drained face, the dull pink in the eyes, the mouth hanging open and working; and THE POWDERED WIG, white:
 * close over the crown and the back of the head, two rolls of curls over each ear, its queue tied at the nape with a
 * black bow, hanging back as he goes. Returns the mouth, and the face's ways.
 */
function head(put: Put, st: Stage, s: Skeleton, jaw: number, lit: number, lag: V3): { mouth: V3; ff: V3; fl: V3; fu: V3 } {
  const [ff, fl, fu] = wornOn(st, s, 8);
  const hr: V3 = [FB.headR[0] * 1.0, FB.headR[1] * 1.04, FB.headR[2] * 1.0];
  const hc = add(s.head, mul(fu, -0.3));
  const skin: Skin = (u, tone) => {
    const fwd = u[0];
    const side = Math.abs(u[1]);
    const open = 0.08 + 0.2 * jaw;
    if (fwd > 0.7 && side < 0.22 && u[2] < -0.32 && u[2] > -0.32 - open * 1.5) return u[2] > -0.38 ? '#22161a' : INK;
    if (fwd > 0.45 && fwd < 0.75 && side > 0.42 && side < 0.7 && u[2] < -0.1 && u[2] > -0.5) return SKIN[Math.max(0, tone - 1)];
    if (fwd > 0.88 && side < 0.13 && u[2] > -0.26 && u[2] < 0.1) return SKIN[Math.min(4, tone + 1)];
    return SKIN[tone];
  };
  put('head', 'head', { k: 'ball', c: hc, ax: [mul(ff, hr[0]), mul(fl, hr[1]), mul(fu, hr[2])], skin });
  // brows, dark under the white of the wig
  for (const k of [-1, 1]) {
    const a = add(hc, add(mul(ff, hr[0] * 0.9), add(mul(fl, k * hr[1] * 0.12), mul(fu, hr[2] * 0.3))));
    const b = add(hc, add(mul(ff, hr[0] * 0.74), add(mul(fl, k * hr[1] * 0.58), mul(fu, hr[2] * 0.26))));
    put('head', 'brows', { k: 'rod', a, b, ra: 0.7, rb: 0.55, ramp: ['#1a1618', '#1a1618', '#3a3234', '#4e4446', '#4e4446'] });
  }
  for (const k of [-1, 1]) {
    const e = add(hc, add(mul(ff, hr[0] * 0.92), add(mul(fl, k * hr[1] * 0.34), mul(fu, hr[2] * 0.1))));
    put('head', 'eyes', { k: 'dot', p: e, c: lit > 0.4 ? FLAME[1] : '#3a2a30', facing: ff });
  }
  // THE WIG: close over the crown and back, its edge high on the brow and behind the ears; powdered curls in rows
  const curl = (u: V3, tone: number): string => WIG[hash(Math.round(u[1] * 7 + 9), Math.round(u[2] * 6 + u[0] * 3 + 9), 7701) < 0.22 ? Math.max(1, tone - 1) : tone];
  put('wig', 'wig', {
    k: 'ball',
    c: add(hc, add(mul(fu, 0.7), mul(ff, -0.5))),
    ax: [mul(ff, hr[0] * 1.08), mul(fl, hr[1] * 1.1), mul(fu, hr[2] * 1.0)],
    skin: (u, tone) => (u[0] > 0.3 && u[2] < 0.42 + 0.2 * Math.abs(u[1]) ? null : u[2] < -0.55 ? null : curl(u, tone)),
  });
  // the rolls over each ear: two, one above the other, running front to back
  for (const k of [-1, 1]) {
    for (const [up, fwd0, r] of [[0.22, -0.12, 1.25], [-0.16, -0.2, 1.2]] as const) {
      const c = add(hc, add(mul(fl, k * hr[1] * 0.98), add(mul(fu, hr[2] * up), mul(ff, hr[0] * fwd0))));
      put('wig', 'rolls', { k: 'ball', c, ax: [mul(ff, 2.6), mul(fl, r), mul(fu, r * 0.95)], skin: (u, tone) => WIG[Math.abs(u[0]) > 0.82 ? Math.max(1, tone - 1) : Math.cos(u[2] * 3 + u[1]) > 0.7 ? Math.max(1, tone - 1) : tone] });
    }
  }
  // the queue, from the nape, tied with a black bow, hanging back as he goes (lying on his back: on the floor, not in it)
  const nape = onFloor(add(hc, add(mul(ff, -hr[0] * 1.12), mul(fu, -hr[2] * 0.42))), 1.3);
  const end = onFloor(add(add(nape, add(mul(ff, -1.8), mul(fu, -6.2))), mul(lag, 0.7)), 0.8);
  put('wig', 'queue', { k: 'rod', a: nape, b: end, ra: 1.3, rb: 0.8, ramp: WIG });
  const bow = onFloor(add(lerp3(nape, end, 0.08), mul(ff, -0.6)), 1.9);
  for (const k of [-1, 1]) put('wig', 'bow', { k: 'ball', c: add(bow, mul(fl, k * 1.8)), ax: [mul(ff, 0.9), mul(fl, 1.9), mul(fu, 1.45)], skin: RIBBON });
  put('wig', 'bow', { k: 'rod', a: bow, b: onFloor(add(add(bow, mul(fu, -2.6)), mul(lag, 0.4)), 0.45), ra: 0.55, rb: 0.45, ramp: RIBBON });
  const mouth = add(hc, add(mul(ff, hr[0] * 1.02), mul(fu, -hr[2] * 0.4)));
  return { mouth, ff, fl, fu };
}

/** What a moment of a move says over and above the bones. */
export interface FootmanSay {
  /** Whether the tray is on his hand (not flung, not fallen). */
  trayHeld: (m: Moment) => boolean;
  /** Whether the candelabrum is in his hand (not fallen), and how much its flames burn (0 out). */
  candleHeld: (m: Moment) => boolean;
  burn: (m: Moment) => number;
  /** The air going past the candles at a moment (which way and how hard), for their flames. */
  wind: (m: Moment) => V3;
  /** THE SMEAR OF A LIGHTNING STRIKE (his Movement 9): after-images of what strikes, along the way it has just come, each a line of points, the oldest first; and the fire's streak along it. */
  smear: (m: Moment) => { lines: V3[][]; fire: V3[][] } | null;
  /** Grains laid after the edge in a move (glints, smoke). */
  more: (m: Moment) => [V3, string, number][];
  /** THE TRAY LOOSE OF HIM as he dies (flown from his hand, rolling round on its rim, lying still): its middle, its face's way and a way across it; null while it is on his hand. */
  loose: (m: Moment) => { c: V3; n: V3; u: V3 } | null;
  /** AS HE DIES: how hard the Hush leaks out of him `t` seconds in, and when it leaves him in one great grey breath (seconds). */
  dies: { puff: (t: number) => number; breath: readonly [number, number] };
}

/** The Hush, the flames and the rest laid after their edge at each moment (Mob.grains). */
const GRAINS = new WeakMap<Moment, [V3, string, number][]>();
/** The smear's after-images: the oldest a dull grey-violet, the newest near white. */
export const SMEAR = ['#7a7488', '#bcb6c8', '#eeeaf2'] as const;

function footmanBits(st: Stage, m: Moment, say: FootmanSay): Bit[] {
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
  const [cf, cl, cu] = s.chest;
  const lit = 1 - clamp01(q.out);
  const lag = lagOf(m, 1.6, 3.4);
  const jaw = clamp01(m.jaw ?? 0.4);
  const seed = 17;
  for (const side of ['L', 'R'] as const) leg(put, s, side);
  // THE WAISTCOAT, crimson, gold buttons down its front
  put('body', 'waistcoat', { k: 'cloth', rings: waistcoatRings(s), ramp: CRIMSON, look: { folds: [0, 40, -40, 100, -100], lift: 0.04 } });
  const waistC = add(s.pelvis, mul(s.hips[2], FB.waist * 0.55));
  for (let i = 0; i < 6; i++) {
    const k = i / 5;
    const c = lerp3(lerp3(s.ribs, s.neck, 0.62), add(s.pelvis, mul(s.hips[2], -1.4)), k);
    const deep = k < 0.5 ? FB.ribDeep + 1.6 - 0.5 * k : FB.waistDeep + 1.5 + 0.4 * (k - 0.5);
    put('body', 'buttons', { k: 'ball', c: add(c, mul(k < 0.5 ? cf : s.belly[0], deep + 0.25)), ax: sphere(0.6), skin: LACE });
  }
  // THE COAT, black, its skirts to the knee, open down the front; laced with gold down both its fronts and round its hem
  const coat = coatRings(s, lag);
  put('coat', 'coat', { k: 'cloth', rings: coat, ramp: COAT, look: { folds: [70, -70, 110, -110, 150, -150, 180], lift: 0.06, arc: [OPEN, 360 - OPEN] } });
  for (const deg of [OPEN + 2, 360 - OPEN - 2]) {
    for (let i = 0; i + 1 < coat.length - 1; i++) put('coat', 'lace', { k: 'rod', a: onRing(coat[i], deg, 0.3), b: onRing(coat[i + 1], deg, 0.3), ra: 0.8, rb: 0.8, ramp: LACE });
  }
  for (let d = OPEN + 2; d < 360 - OPEN - 2; d += 9) put('coat', 'lace', { k: 'rod', a: onRing(coat[0], d, 0.2), b: onRing(coat[0], Math.min(360 - OPEN - 2, d + 9), 0.2), ra: 0.62, rb: 0.62, ramp: LACE });
  // (behind: the vent down the middle of the skirts, laced, and two gold buttons at the top of its pleats)
  for (let i = 0; i < 2; i++) put('coat', 'lace', { k: 'rod', a: onRing(coat[i], 180, 0.25), b: onRing(coat[i + 1], 180, 0.25), ra: 0.6, rb: 0.6, ramp: LACE });
  for (const deg of [168, 192]) put('coat', 'buttons', { k: 'ball', c: onRing(coat[2], deg, 0.5), ax: sphere(0.75), skin: LACE });
  // (the pocket flaps on the skirts, laced: one each side, at the hips)
  for (const k of [-1, 1]) {
    const r = coat[1];
    const a = onRing(r, k * 62 + (k > 0 ? 0 : 360), 0.4);
    const b = onRing(r, k * 92 + (k > 0 ? 0 : 360), 0.4);
    const up: V3 = [0, 0, 1.2];
    put('coat', 'lace', { k: 'rod', a: add(a, up), b: add(b, up), ra: 0.7, rb: 0.7, ramp: LACE });
    put('coat', 'lace', { k: 'rod', a: add(a, [0, 0, -1.4]), b: add(b, [0, 0, -1.4]), ra: 0.6, rb: 0.6, ramp: LACE });
  }
  // the collar: a band of black laced gold; the white cravat and its fall of lace
  put('neck', 'collar', { k: 'band', ring: { c: add(s.neck, mul(cu, -0.4)), u: mul(cf, 4.2), v: mul(cl, 4.8) }, ramp: LACE, rows: 2 });
  put('neck', 'cravat', { k: 'ball', c: add(add(s.neck, mul(cu, -1.0)), mul(cf, 3.2)), ax: [mul(cf, 1.6), mul(cl, 2.4), mul(cu, 1.8)], skin: SILK });
  put('neck', 'cravat', { k: 'ball', c: add(lerp3(s.neck, s.ribs, 0.42), mul(cf, FB.ribDeep + 2.0)), ax: [mul(cf, 0.9), mul(cl, 1.7), mul(cu, 3.2)], skin: (u, tone) => SILK[Math.cos(u[2] * 6) > 0.6 ? Math.max(1, tone - 1) : tone] });
  const trayOn = say.trayHeld(m);
  const candleOn = say.candleHeld(m);
  const flatUnder = trayOn && clamp01(q.pt) < 0.5 ? trayOf(s, q).n : null;
  arm(put, s, 'L', cu, trayOn ? (flatUnder ? 0.05 : 0.7) : 0.5, flatUnder);
  arm(put, s, 'R', cu, candleOn ? 1 : 0.45);
  put('neck', 'neck', { k: 'rod', a: add(s.neck, mul(cu, -1.5)), b: lerp3(s.neck, s.head, 0.5), ra: 2.1, rb: 1.9, ramp: SKIN });
  const hd = head(put, st, s, jaw, lit, lag);
  // WHAT HE CARRIES: the tray (as he dies, flown from his hand: where it is loose of him)
  const glint = clamp01(m.glint);
  const loose = m.dying ? say.loose(m) : null;
  if (loose) trayBits(put, 'tray', loose.c, loose.n, loose.u, 0, 0, true);
  else if (trayOn) {
    const tr = trayOf(s, q);
    trayBits(put, 'tray', tr.c, tr.n, tr.u, 0, trayOn && m.move !== undefined && /tray/i.test(m.move) ? glint : 0);
  }
  candelabrum(put, s, candleOn && m.move !== undefined && /candelabrum/i.test(m.move) ? glint : 0);
  // THE FLAMES, laid after the edge, and their light
  const burn = candleOn ? say.burn(m) : 0;
  if (burn > 0.02) {
    const k = candelabrumOf(s);
    const fl = flamesOf(k.wicks, say.wind(m), m.t, burn, seed);
    grains.push(...fl.grains);
    if (fl.light) put('light', 'candelabrum', { k: 'glow', p: fl.light, c: CANDLE_LIGHT, r: 16 + 6 * Math.min(1, burn), a: 0.24 });
  }
  // THE SMEAR of a lightning strike: after-images (pale, the oldest thinned), and the fire's streak along them
  const sm = say.smear(m);
  if (sm) {
    sm.lines.forEach((line, j) => {
      const k = j / Math.max(1, sm.lines.length - 1);
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
    sm.fire.forEach((line, j) => {
      const k = j / Math.max(1, sm.fire.length - 1);
      for (let i = 1; i < line.length; i++) {
        const [x0, y0] = st.at(line[i - 1]);
        const [x1, y1] = st.at(line[i]);
        const n = Math.max(1, Math.ceil(Math.hypot(x1 - x0, y1 - y0)));
        for (let e = 0; e < n; e++) grains.push([lerp3(line[i - 1], line[i], e / n), k > 0.6 ? CANDLE[3] : k > 0.3 ? CANDLE[2] : CANDLE[1], k > 0.6 ? 2 : 1]);
      }
    });
  }
  // THE HUSH LEAKING OUT OF HIM: always a little; harder as he winds up; a great breath of it as it leaves him
  const puff = m.dying ? say.dies.puff(m.t) : 0.6 + 0.7 * glint;
  hushBreath(put, hd.mouth, hd.ff, hd.fl, m.t, puff, seed);
  if (m.dying) hushLeaves(put, hd.mouth, hd.ff, hd.fl, m.t, seed, say.dies.breath[0], say.dies.breath[1]);
  grains.push(...say.more(m));
  void BREATH_PALE;
  void HUSH;
  void fr;
  return bits;
}

/** THE FOOTMAN AS THE PAINTER TAKES HIM. */
export function footmanPainter(say: FootmanSay): { bits: (st: Stage, m: Moment) => Bit[]; grains: (st: Stage, m: Moment) => ReadonlyArray<readonly [V3, string, number]> } {
  return { bits: (st, m) => footmanBits(st, m, say), grains: (_st, m) => GRAINS.get(m) ?? [] };
}
