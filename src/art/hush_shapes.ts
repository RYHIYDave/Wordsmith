// FLOOR 20'S SHAPES OF THE HUSH (the art chat, 29 Oct 2026). A MOCK-UP: NOT IN THE GAME. Nothing of the game imports this
// file; `HUSHSHAPES_ON` is off. Their moves are art/hush_shapes_moves.ts.
//
// His doc's floor 20, THE QUIET TOWER, the lair that ends Act 2: the highest tower of the High City, where the torn-out last
// chapter lies; its palette “Grey fog, bone white, no colour at all”; its enemies, as he approved the floor's plan, “the
// Hush in its own shapes, the Silent Order's last masks, and shadows of the four royals.” The Hush is what steals the
// city's words and voices; the Moth makes it (its wing-dust is the Hush itself). His pick for how they move: “Drifting,
// then darting (Recommended)”. The brief as offered:
//   who: the Hush itself, taking shape: grey fog pulled into a hunched, faceless figure with long thin arms and one open,
//     silent mouth; its size, about the knight's, in swarms; it drifts slowly, then darts in fast; its mark, the open
//     silent mouth and the trailing fog; its one attack, it wraps you in its arms for a moment, a grey grip that darkens
//     your words; its death, it unravels into wisps, and a word it had swallowed flies out of it, home; never gory, never a
//     cartoon ghost with a sheet; no sound, the world goes quiet near them.
//
// WHAT IT IS, AS PAINTED: one sculpted body of the Hush's grey fog (`HS_FOG`), no cloth and no sheet: a hunched back
// swelling into a hump over narrow ribs, a waist, and below the hips no legs, the fog pouring down into a tail that trails
// behind it a hand over the floor and thins to mist (`Mob.finish`, as the Princess's steed is thinned); long thin arms of
// the same fog, knobbed at the elbow, ending in long bone-white fingers (`HS_PALE`); a head bowed forward under a heavy
// brow, with no face at all but ONE OPEN MOUTH, a dark gape rimmed bone white, the Hush's dull pink deep in its throat.
// The dark seam (`INK`) where one part ends before another, and the enemy's pink rim round it. Fog streams off its crown,
// its hump, its shoulders and elbows, and curls off its tail (laid after its edge: `Mob.grains`). Nothing cyan.

import type { Px } from '../engine/px';
import type { WordId } from '../game/types';
import { HUSH } from './crier';
import { BREATH_PALE } from './hushed';
import { GLYPH, WORD_COLOR, WORD_GLOW } from './icons';
import { INK, RIM_ALPHA, hash } from './kit';
import type { Painted, Ramp } from './kit';
import { ENEMY_RIM, FLAME } from './mkit';
import { TILE3, paintBits, sphere } from './new_mobs3';
import type { Bit, MobCanvas, Moment, Put } from './new_mobs3';
import { stage, wornOn } from './skin';
import type { GameView, Ring, Skin, Stage } from './skin';
import { add, buildOf, cross, dot, elbowFor, len, lerp3, mul, norm, standing, sub } from './skeleton';
import type { Bones, Build, Posed, Skeleton, V3 } from './skeleton';

/** THE SWITCH, OFF. Nothing of the game reads this file. */
export const HUSHSHAPES_ON = { on: false };

const TAU = Math.PI * 2;
const D = Math.PI / 180;
const fr = (t: number): number => t - Math.floor(t);
const clamp01 = (v: number): number => Math.max(0, Math.min(1, v));

// =============================================================================================
// ITS COLOURS: “Grey fog, bone white, no colour at all”; the Hush's own grey (the breath of the Hushed, art/hushed.ts)

/** Its fog: dark in its hollows, the Hush's grey, bone white where the light takes it. */
export const HS_FOG: Ramp = ['#383546', '#5c586c', '#8a8699', '#bab6c6', '#e9e5ed'];
/** Its fingers and the rim of its mouth: bone white. */
export const HS_PALE: Ramp = ['#6a6670', '#94909a', '#c6c1c4', '#e8e3dc', '#fbf7ee'];
/** The gape of its mouth: the seam's own dark, and darker in its throat. */
export const HS_THROAT = '#060509';
/** What it thins to: mist, every other pixel of it gone. */
export const HS_MIST = '#a29eb0';
/** Its smear (a lightning strike's after-images): the oldest a dark grey, the newest near white. Used for nothing else. */
export const HS_SMEAR = ['#555266', '#aca8bb', '#ece9f3'] as const;
/** The fog streaming off it: the Hush as it leaves the mouths of the Hushed (art/hushed.ts), palest first. */
const WISP = [BREATH_PALE, HUSH[4], HUSH[3], HUSH[2]] as const;

/** THE WORD IT SWALLOWED, which flies home as it dies: whichever word the game says (one of the city's words, in the pictures). */
export const HS_WORD: { id: WordId } = { id: 'pulling' };

// =============================================================================================
// ITS BODY: built on the heroes' bones (art/skeleton.ts), so every check the bosses have holds for it

/** Tall and narrow, hunched: long thin arms (well past its knees, if it had knees), a small head; no legs to speak of (they are folded away inside its tail, never painted). */
export const HS_BODY: Build = buildOf(72, 1.32, { shoulders: 0.9, chest: 0.78, depth: 0.95, waist: 0.58, hips: 0.62, arms: 1.4, limbs: 0.62, pad: 2.6 });
const B = HS_BODY;
/** Its picture: room before it for its dart (four tiles), above it for its word flying home. */
export const HS_CANVAS: MobCanvas = { w: 280, h: 256, ax: 84, ay: 166 };
/** How far its pelvis hangs below where a standing body's would be: no legs, its fog pours down from there. */
export const HS_SINK = -9;
/** How far over the floor the end of its tail drifts (the figure's own lengths). */
export const HS_TAIL_UP = 3.2;

/** ITS REST: hovering, hunched far forward, its head thrust out and bowed, its long arms hanging before it; its legs folded up into its tail. */
const REST0: Bones = {
  ...standing(B),
  pz: HS_SINK, px: 0, py: 0, yaw: 0, pitch: 14, roll: 0, twist: 0, bend: 36, side: 0,
  faceTurn: 0, faceUp: 14, faceTilt: 0,
  lhIn: 1, lhx: 9, lhy: 4.5, lhz: -20, le: 0,
  rhIn: 1, rhx: 7, rhy: -5.5, rhz: -22, re: 0,
  lfx: -6, lfy: 0, lfz: 9.5, lfp: 30, rfx: -6, rfy: 0, rfz: 9.5, rfp: 30, lk: 20, rk: -20,
};
/** Its elbows put as near as they go to these ways (each arm's own: out to its side, back, up), for a pose. */
export function elbowsTo(rest: Bones, pose: Partial<Bones>, wantL: V3, wantR: V3): Partial<Bones> {
  const q = { ...rest, ...pose } as Posed;
  const le = elbowFor(B, q, true, norm(wantL));
  const re = elbowFor(B, { ...q, le } as Posed, false, norm(wantR));
  return { ...pose, le, re };
}
/** Its elbows hanging out to its sides and a little back. */
export const HANG_L: V3 = [-0.4, 1, -0.2];
export const HANG_R: V3 = [-0.4, -1, -0.2];
export const HS_REST: Bones = { ...REST0, ...elbowsTo(REST0, {}, HANG_L, HANG_R) } as Bones;

// =============================================================================================
// WHAT A MOMENT OF A MOVE SAYS OVER AND ABOVE THE BONES (art/hush_shapes_moves.ts says it)

export interface HushSay {
  /** How far its going drags its fog (the figure's own lengths, the way the fog is left behind): its tail trailing, its wisps streaming. */
  lag: (m: Moment) => V3;
  /** Its fingers: how far spread (0 hanging together, 1 splayed wide) and curled (0 straight, 1 closed round). */
  hands: (m: Moment) => { splay: number; curl: number };
  /** How much of it is there (1 whole; less as it unravels; 0 gone). */
  formed: (m: Moment) => number;
  /** Torn through by a blow (0 whole, 1 torn widest). */
  tear: (m: Moment) => number;
  /** How hard its fog streams off it (1 drifting; more as it darts, more as it unravels). */
  stream: (m: Moment) => number;
  /** THE SMEAR OF A LIGHTNING STRIKE: after-images of it along the way it has just come, each a line of points, the oldest first. */
  smear: (m: Moment) => V3[][] | null;
  /** THE WORD IT SWALLOWED, as it dies: where it is, how far it has its own colour again (0 the Hush's pink, 1 its own), how big a cell of its rune is (picture pixels), how much of it is still there (0 to 1). */
  word: (m: Moment) => { p: V3; own: number; cell: number; left: number } | null;
}

// =============================================================================================
// ITS SOLIDS

/** A smooth churn of noise, for its fog's streaks and hollows. */
function noise2(x: number, y: number, seed: number): number {
  const xi = Math.floor(x);
  const yi = Math.floor(y);
  const fx = x - xi;
  const fy = y - yi;
  const s = (v: number): number => v * v * (3 - 2 * v);
  const h = (i: number, j: number): number => hash(xi + i, yi + j, seed);
  const a = h(0, 0) + (h(1, 0) - h(0, 0)) * s(fx);
  const b = h(0, 1) + (h(1, 1) - h(0, 1)) * s(fx);
  return a + (b - a) * s(fy);
}
/** Its fog on a round part: pale streaks drawn back along it as it churns, and hollows where it is thin. */
function fogSkin(seed: number, churn: number, ramp: Ramp = HS_FOG): Skin {
  return (u, tone) => {
    const streak = fr(u[2] * 1.1 + u[0] * 0.5 + churn + 0.25 * Math.sin(u[1] * 3 + seed));
    const hollow = noise2(u[0] * 2.2 + seed + churn * 2, u[2] * 2.2 + u[1] * 1.4, 7911) > 0.78;
    return ramp[Math.max(0, Math.min(4, tone + (streak < 0.16 ? 1 : 0) - (hollow ? 1 : 0)))];
  };
}

/**
 * THE HEAD: bowed forward under a heavy brow of fog; no eyes, no nose, no face: ONE OPEN MOUTH, a dark gape rimmed bone
 * white, the lower head drawn down as it gapes wider (`jaw`), the Hush's dull pink deep in the throat (hotter in its
 * warning, `glint`). The mouth is drawn toward whoever looks (as the eyes of every face are: art/skin.ts `eyesToward`), so
 * it is never lost on the edge of the head. Returns the mouth, and the way it faces.
 */
function head(put: Put, st: Stage, s: Skeleton, jaw: number, glint: number, churn: number): { mouth: V3; facing: V3 } {
  const [ff, fl, fu] = wornOn(st, s, 10);
  const hr = B.headR;
  const ext = 2.4 * jaw;
  const c = add(add(s.head, mul(fu, -ext * 0.5)), mul(ff, 0.3));
  const r2 = hr[2] + ext * 0.5;
  // WHERE ITS GAPE IS ON ITS HEAD (the head's own forward, left, up; on its ball): low on its face, and drawn round toward
  // whoever looks while they can see its face at all, so it is not lost on the edge of the head
  const e: V3 = [dot(st.eye, ff), dot(st.eye, fl), dot(st.eye, fu)];
  const toward = clamp01(e[0] * 1.6);
  const d = norm(add(mul(norm([1, 0, -0.62]), 1 - 0.55 * toward), mul(norm(e), 0.55 * toward)), [1, 0, 0]);
  const across = norm(sub([0, 1, 0], mul(d, d[1])), [0, 1, 0]);
  const upward = cross(d, across);
  const mw = 0.42 + 0.06 * jaw;
  const mh = 0.36 + 0.3 * jaw;
  const skin: Skin = (u, tone) => {
    const n = norm(u, [1, 0, 0]);
    const f = dot(n, d);
    // (a howl, not an eye: taller than it is wide, sagging wider toward its lower lip)
    const b = dot(n, upward) / mh;
    const a = dot(n, across) / (mw * (1 + 0.28 * Math.max(-1, Math.min(1, -b))));
    const q = a * a + b * b;
    if (f > 0.3 && q < 1) return q < 0.42 ? HS_THROAT : INK;
    // (its upper lip bone white; its lower lip only fog in shadow)
    if (f > 0.3 && q < 1.8 && b > -0.35) return HS_PALE[Math.max(1, Math.min(4, tone + 1))];
    if (f > 0.3 && q < 1.6) return HS_FOG[Math.max(0, tone - 1)];
    return fogSkin(21, churn)(u, tone, 0, 0);
  };
  put('head', 'head', { k: 'ball', c, ax: [mul(ff, hr[0]), mul(fl, hr[1]), mul(fu, r2)], skin });
  // the brow: a hood of fog over the back and top of the head, drooping; its rim over the brow in shadow
  const bc = add(s.head, add(mul(ff, -hr[0] * 0.15), mul(fu, hr[2] * 0.45)));
  put('head', 'brow', { k: 'ball', c: bc, ax: [mul(norm(add(ff, mul(fu, -0.2))), hr[0] * 0.98), mul(fl, hr[1] * 1.05), mul(norm(add(fu, mul(ff, 0.2))), hr[2] * 0.62)], skin: (u, tone) => (u[2] < -0.25 && u[0] > 0.3 ? HS_FOG[Math.max(0, tone - 1)] : fogSkin(23, churn)(u, tone, 0, 0)) });
  // the Hush's dull pink, deep in the throat
  const dir = norm(add(add(mul(ff, d[0]), mul(fl, d[1])), mul(fu, d[2])));
  const mouth = add(c, add(add(mul(ff, d[0] * hr[0] * 0.9), mul(fl, d[1] * hr[1] * 0.9)), mul(fu, d[2] * r2 * 0.9)));
  const hot = glint > 0.5 ? FLAME[2] : FLAME[1];
  // (low in the gape, where a throat would go down)
  const low3 = add(add(mul(ff, upward[0]), mul(fl, upward[1])), mul(fu, upward[2]));
  put('head', 'throat', { k: 'dot', p: add(mouth, mul(low3, -mh * r2 * 0.45)), c: hot, facing: dir, c2: glint > 0.85 ? FLAME[3] : hot });
  if (glint > 0.05 && dot(dir, st.eye) > 0.05) put('glint', 'glint', { k: 'glow', p: mouth, c: FLAME[2], r: 5 + 7 * glint, a: Math.min(0.7, 0.45 * glint) });
  return { mouth, facing: dir };
}

/** Its fingers as they are at a moment: where each rises from the hand, its knuckle and its tip; hanging together or splayed wide (`splay`), straight or closed round (`curl`). */
export function fingersOf(s: Skeleton, side: 'L' | 'R', splay: number, curl: number): { base: V3[]; knuckles: V3[]; tips: V3[]; e1: V3; e2: V3 } {
  const el = side === 'L' ? s.elbowL : s.elbowR;
  const hand = side === 'L' ? s.handL : s.handR;
  const fore = norm(sub(hand, el), [0, 0, -1]);
  // (the hand's back to the chest's up)
  const cu = s.chest[2];
  const e1 = norm(sub(cu, mul(fore, dot(cu, fore))), s.chest[0]);
  const e2 = norm(cross(fore, e1), [0, 1, 0]);
  const base: V3[] = [];
  const knuckles: V3[] = [];
  const tips: V3[] = [];
  for (let i = 0; i < 4; i++) {
    const k = i - 1.5;
    const b = add(hand, add(mul(fore, 2.2), mul(e2, k * 0.62)));
    // (splayed: fanned out across the hand; closed: bent round toward the palm)
    const fan = k * (6 + 18 * splay) * D;
    const way = norm(add(mul(fore, Math.cos(fan)), mul(e2, Math.sin(fan))));
    const bend1 = (4 + 44 * curl) * D;
    const bend2 = (8 + 60 * curl) * D;
    const d1 = norm(add(mul(way, Math.cos(bend1)), mul(e1, -Math.sin(bend1))));
    const d2 = norm(add(mul(way, Math.cos(bend1 + bend2)), mul(e1, -Math.sin(bend1 + bend2))));
    const long = i === 0 || i === 3 ? 0.84 : 1;
    const kn = add(b, mul(d1, 4.4 * long));
    base.push(b);
    knuckles.push(kn);
    tips.push(add(kn, mul(d2, 4.2 * long)));
  }
  return { base, knuckles, tips, e1, e2 };
}

/** AN ARM: a knob of fog at the shoulder, the long thin upper arm, the elbow's knob, the long forearm narrowing to the wrist; a narrow hand and four long bone-white fingers. */
function arm(put: Put, s: Skeleton, side: 'L' | 'R', splay: number, curl: number, churn: number): void {
  const sh = side === 'L' ? s.shoulderL : s.shoulderR;
  const el = side === 'L' ? s.elbowL : s.elbowR;
  const hand = side === 'L' ? s.handL : s.handR;
  const [r0, r1, r2] = B.armR;
  const part = `arm${side}`;
  const fore = norm(sub(hand, el), [0, 0, -1]);
  const upper = norm(sub(el, sh), [0, 0, -1]);
  put(part, part, { k: 'ball', c: add(sh, mul(upper, 0.6)), ax: [mul(upper, r0 * 1.45), mul(norm(cross(upper, s.chest[0]), s.chest[1]), r0 * 1.3), mul(s.chest[0], r0 * 1.3)], skin: fogSkin(side === 'L' ? 31 : 33, churn), far: true });
  put(part, part, { k: 'rod', a: sh, b: el, ra: r0 * 1.0, rb: r1 * 0.85, ramp: HS_FOG, far: true });
  put(part, part, { k: 'ball', c: el, ax: sphere(r1 * 1.02), skin: HS_FOG, far: true });
  const wrist = add(hand, mul(fore, -0.6));
  put(part, part, { k: 'rod', a: el, b: wrist, ra: r1 * 0.88, rb: r2 * 0.62, ramp: HS_FOG, far: true });
  const f = fingersOf(s, side, splay, curl);
  put(part, part, { k: 'ball', c: add(hand, mul(fore, 0.9)), ax: [mul(fore, 2.0), mul(f.e2, 1.45), mul(f.e1, 0.7)], skin: HS_PALE, far: true });
  for (let i = 0; i < 4; i++) {
    put(part, part, { k: 'rod', a: f.base[i], b: f.knuckles[i], ra: 0.6, rb: 0.5, ramp: HS_PALE, far: true });
    put(part, part, { k: 'rod', a: f.knuckles[i], b: f.tips[i], ra: 0.5, rb: 0.26, ramp: HS_PALE, far: true });
  }
}

/** Where its tail runs at a moment: from under its hips down and back to its end, a hand over the floor, trailing as it goes, churning. Each: its middle, and its half-widths across and fore and aft. */
export function tailOf(s: Skeleton, lag: V3, t: number): { c: V3; across: number; deep: number }[] {
  const f = norm([s.hips[0][0], s.hips[0][1], 0], [1, 0, 0]);
  const l: V3 = [-f[1], f[0], 0];
  const P = s.pelvis;
  const top = add(P, mul(s.hips[2], -0.4));
  const tipZ = HS_TAIL_UP + 0.8 * Math.sin((t * TAU) / 1.2);
  const out: { c: V3; across: number; deep: number }[] = [];
  const N = 6;
  for (let i = 0; i <= N; i++) {
    const k = i / N;
    // (down from under its hips and streaming away behind it over the floor, curling: a comet's tail of fog, not a leg)
    const z = top[2] + (tipZ - top[2]) * (1 - (1 - k) ** 1.4);
    const sway = Math.sin((t * TAU) / 1.2 + k * 3.4) * 2.0 * k;
    const back = mul(f, -(1 + 7 * k ** 1.6));
    const c = add(add(add([top[0], top[1], z], back), mul(lag, k ** 1.2)), mul(l, sway));
    out.push({ c: [c[0], c[1], Math.max(HS_TAIL_UP - 0.6, c[2])], across: (B.pelvisHalf + 4.6) * (1 - 0.55 * k) + 0.8, deep: (B.pelvisDeep + 3.8) * (1 - 0.55 * k) + 0.8 });
  }
  return out;
}

/** The bones' own body rings, from the hips up to the throat (what the checks also see): narrow at the waist, swelling at the ribs, broad and hunched at the shoulders. */
function bodyRings(s: Skeleton): Ring[] {
  const [cf, cl, cu] = s.chest;
  return [
    { c: add(s.pelvis, mul(s.hips[2], 0.8)), u: mul(s.hips[0], B.pelvisDeep + 3.4), v: mul(s.hips[1], B.pelvisHalf + 3.8) },
    { c: s.waist, u: mul(s.belly[0], B.waistDeep + 2.4), v: mul(s.belly[1], B.waistHalf + 2.4) },
    { c: add(s.ribs, mul(cf, 0.3)), u: mul(cf, B.ribDeep + 2.4), v: mul(cl, B.ribHalf + 2.4) },
    { c: add(add(lerp3(s.ribs, s.neck, 0.6), mul(cf, -0.3)), mul(cu, 0.2)), u: mul(cf, B.ribDeep + 2.6), v: mul(cl, B.shoulderHalf + 1.0) },
    { c: add(add(s.neck, mul(cu, -0.2)), mul(cf, -0.6)), u: mul(cf, B.ribDeep + 1.2), v: mul(cl, B.shoulderHalf * 0.78) },
    { c: add(add(s.neck, mul(cu, 1.4)), mul(cf, 0.5)), u: mul(cf, 2.1), v: mul(cl, 2.3) },
  ];
}
/** The hump: the top of its back swelling up between its shoulders, over its bowed head. */
export function humpOf(s: Skeleton): { c: V3; ax: [V3, V3, V3] } {
  const [cf, cl, cu] = s.chest;
  return { c: add(add(lerp3(s.ribs, s.neck, 0.78), mul(cf, -(B.ribDeep * 0.7))), mul(cu, 2.0)), ax: [mul(cf, B.ribDeep + 1.6), mul(cl, B.shoulderHalf * 0.82), mul(cu, 5.6)] };
}

/** Its spine down its back, from the root of its neck to its hips: each knob, how big, and the way out of its back there. */
export function spineOf(s: Skeleton): [V3, number, V3][] {
  const out: [V3, number, V3][] = [];
  const back = (k: number): { p: V3; out: V3; deep: number } => {
    // (up its back: over the hips, the waist, the ribs, to the neck)
    if (k < 0.33) {
      const u = k / 0.33;
      return { p: lerp3(add(s.pelvis, mul(s.hips[2], 0.8)), s.waist, u), out: norm(lerp3(mul(s.hips[0], -1), mul(s.belly[0], -1), u)), deep: B.pelvisDeep + 3.4 + (B.waistDeep + 2.4 - B.pelvisDeep - 3.4) * u };
    }
    if (k < 0.6) {
      const u = (k - 0.33) / 0.27;
      return { p: lerp3(s.waist, s.ribs, u), out: norm(lerp3(mul(s.belly[0], -1), mul(s.chest[0], -1), u)), deep: B.waistDeep + 2.4 + 0.1 * u };
    }
    const u = (k - 0.6) / 0.4;
    return { p: lerp3(s.ribs, lerp3(s.ribs, s.neck, 0.95), u), out: mul(s.chest[0], -1), deep: B.ribDeep + 2.6 };
  };
  for (let i = 0; i < 9; i++) {
    const k = 0.1 + (i / 8) * 0.85;
    const b = back(k);
    out.push([add(b.p, mul(b.out, b.deep - 0.6)), 1.2 + 0.35 * Math.sin(Math.PI * k), b.out]);
  }
  return out;
}

/** What a moment paints over and above its solids, kept for its grains and its thinning. */
const MORE = new WeakMap<Moment, { grains: [V3, string, number][]; tailTip: V3; ribs: V3; pelvis: V3 }>();

function hushBits(st: Stage, m: Moment, say: HushSay): Bit[] {
  const { s } = m;
  const bits: Bit[] = [];
  const put: Put = (part, piece, shape) => bits.push({ part, piece, shape });
  const t = m.t;
  const churn = fr(t / 1.2);
  const lag = say.lag(m);
  const jaw = clamp01((m.jaw ?? 0.5) / 1.3) * 1.3;
  const { splay, curl } = say.hands(m);
  // ITS BODY: one length of fog from the end of its tail up through its hips, its narrow waist and ribs, the swell of its
  // shoulders, to its throat; the hump over it; its neck
  const tail = tailOf(s, lag, t);
  const f = norm([s.hips[0][0], s.hips[0][1], 0], [1, 0, 0]);
  const l: V3 = [-f[1], f[0], 0];
  const rings: Ring[] = [];
  for (let i = tail.length - 1; i >= 1; i--) {
    // (its edge ragged and churning, more toward its end)
    const u = mul(f, tail[i].deep);
    const v = mul(l, tail[i].across);
    const pts: V3[] = [];
    for (let j = 0; j < 16; j++) {
      const a = (j / 16) * TAU;
      const rag = 1 + (0.12 + 0.3 * (i / tail.length)) * (noise2(j * 0.9 + i * 3.1, t * 2.5 + i, 7951) - 0.45) * 2;
      pts.push(add(tail[i].c, add(mul(u, Math.cos(a) * rag), mul(v, Math.sin(a) * rag))));
    }
    rings.push({ c: tail[i].c, u, v, pts });
  }
  rings.push(...bodyRings(s));
  put('body', 'body', { k: 'cloth', rings, ramp: HS_FOG, look: { folds: [0, 35, -35, 80, -80, 135, -135, 180], lift: 0.1 } });
  const hump = humpOf(s);
  put('body', 'hump', { k: 'ball', c: hump.c, ax: hump.ax, skin: fogSkin(11, churn) });
  put('body', 'neck', { k: 'rod', a: add(s.neck, mul(s.chest[2], -0.5)), b: lerp3(s.neck, s.skull, 0.85), ra: 2.4, rb: 1.9, ramp: HS_FOG });
  // its shoulder blades standing out of the fog of its back: a body, not a sheet
  for (const k of [-1, 1]) {
    const [cf, cl, cu] = s.chest;
    const c = add(add(lerp3(s.ribs, s.neck, 0.55), mul(cf, -(B.ribDeep + 2.0))), mul(cl, k * B.shoulderHalf * 0.5));
    put('body', 'blade', { k: 'ball', c, ax: [mul(cf, 1.4), mul(cl, 2.6), mul(norm(add(cu, mul(cl, -k * 0.35))), 3.8)], skin: fogSkin(41 + k, churn) });
  }
  // ITS ARMS
  arm(put, s, 'L', splay, curl, churn);
  arm(put, s, 'R', splay, curl, churn);
  // ITS HEAD
  const glint = clamp01(m.glint);
  const { mouth, facing } = head(put, st, s, jaw, glint, churn);
  // THE WORD IT SWALLOWED: its light
  const w = say.word(m);
  if (w && w.left > 0.05) put('word', 'word', { k: 'glow', p: w.p, c: WORD_GLOW[HS_WORD.id], r: 10 + 8 * w.left, a: 0.4 * w.left });
  // ITS FOG STREAMING OFF IT (laid after its edge)
  const grains: [V3, string, number][] = [];
  const formed = clamp01(say.formed(m));
  const stream = say.stream(m);
  const lagN = len(lag) > 0.5 ? norm(lag) : mul(f, -1);
  const back = norm(add(mul(lagN, 0.8), [0, 0, 0.55]));
  const tip = tail[tail.length - 1].c;
  const emitters: [V3, number, number][] = [
    [add(s.head, mul(s.face[2], B.headR[2] * 0.8)), 5, 2],
    [add(hump.c, mul(s.chest[2], 4.5)), 8, 3],
    [s.shoulderL, 4, 4],
    [s.shoulderR, 4, 5],
    [s.elbowL, 3, 6],
    [s.elbowR, 3, 7],
    [tail[2].c, 6, 8],
    [tail[4].c, 7, 9],
    [tip, 9, 10],
  ];
  for (const [at, n0, seed] of emitters) {
    const n = Math.round(n0 * Math.min(2.2, 0.6 + 0.4 * stream) * (0.4 + 0.6 * formed));
    for (let i = 0; i < n; i++) {
      const life = fr(t * (0.55 + 0.2 * stream) + i / n + 0.37 * hash(i, seed, 7921));
      if (life > 0.8) continue;
      const a = hash(i, seed, 7922) * TAU;
      const r0 = 1 + 2.5 * hash(i, seed, 7923);
      const go = (2 + 8 * life) * (0.7 + 0.3 * stream);
      const curl = a + life * 4;
      const p = add(add(at, mul(back, go)), [Math.cos(a) * r0 + Math.cos(curl) * 2 * life, Math.sin(a) * r0 + Math.sin(curl) * 2 * life, life * 3]);
      grains.push([p, WISP[Math.min(3, Math.floor(life * 4))], life < 0.4 ? 2 : 1]);
    }
  }
  // UNRAVELLING: strands of it drawn up off every part of it and away, as much as has come away
  if (formed < 0.999) {
    const gone = 1 - formed;
    const from: V3[] = [s.head, hump.c, s.ribs, s.waist, s.pelvis, tail[1].c, tail[2].c, tail[3].c, s.elbowL, s.elbowR, s.handL, s.handR, lerp3(s.shoulderL, s.elbowL, 0.5), lerp3(s.shoulderR, s.elbowR, 0.5)];
    from.forEach((at, j) => {
      const n = Math.round(10 * Math.sin(Math.PI * Math.min(1, gone * 1.15)));
      for (let i = 0; i < n; i++) {
        const life = fr(t * 0.9 + i / Math.max(1, n) + 0.31 * hash(i, j, 7961));
        const a = hash(i, j, 7962) * TAU;
        const p = add(at, [Math.cos(a) * (1.5 + 4 * life) + Math.sin(life * 6 + j) * 1.5, Math.sin(a) * (1.5 + 4 * life), 3 + 18 * life * (0.6 + 0.4 * hash(i, j, 7963))]);
        // (each a thread of two or three pixels, pale where it has just come away)
        grains.push([p, WISP[Math.min(3, Math.floor(life * 4))], life < 0.5 ? 2 : 1]);
        if (life < 0.6) grains.push([add(p, [0, 0, -1.6]), WISP[Math.min(3, 1 + Math.floor(life * 4))], 1]);
      }
    });
  }
  // (a little of the Hush curling out of its open mouth)
  for (let i = 0; i < 6; i++) {
    const life = fr(t * 0.7 + i / 6);
    if (life > 0.7) continue;
    const p = add(add(mouth, mul(facing, 1.2 + 4 * life)), [Math.sin(life * 5 + i) * 1.2 * life, 0, 1 + 7 * life]);
    grains.push([p, WISP[Math.min(3, Math.floor(life * 4))], life < 0.35 ? 2 : 1]);
  }
  // THE WORD IT SWALLOWED, flying out of it, home: its rune cell by cell, the Hush's dull pink going out of it and its own colour coming back, a dark seam under it
  if (w && w.left > 0.02) {
    const rows = GLYPH[HS_WORD.id];
    const H = rows.length;
    const W = rows[0].length;
    const own = WORD_COLOR[HS_WORD.id];
    const glow = WORD_GLOW[HS_WORD.id];
    const [cx, cy] = st.at(w.p);
    const C = Math.max(2, Math.round(w.cell / 2) * 2) / 2;
    const x0 = Math.round((cx - (W * C) / 2) / 2) * 2;
    const y0 = Math.round((cy - (H * C) / 2) / 2) * 2;
    const back3 = st.back;
    // (a picture pixel back into the figure's own space: grains are laid where their point falls)
    const toFig = (x: number, y: number): V3 => {
      const dx = x - st.at([0, 0, 0])[0];
      const dy = y - st.at([0, 0, 0])[1];
      return [back3[0][0] * dx + back3[0][1] * dy, back3[1][0] * dx + back3[1][1] * dy, back3[2][0] * dx + back3[2][1] * dy];
    };
    for (let r = 0; r < H; r++) {
      for (let c = 0; c < W; c++) {
        if (rows[r][c] === '.') continue;
        if (hash(r * 7 + c, Math.floor(m.t * 20), 7931) > w.left * 1.15) continue;
        grains.push([toFig(x0 + c * C + C / 2, y0 + r * C + C / 2 + C), INK, C]);
      }
    }
    for (let r = 0; r < H; r++) {
      for (let c = 0; c < W; c++) {
        const ch = rows[r][c];
        if (ch === '.') continue;
        if (hash(r * 7 + c, Math.floor(m.t * 20), 7931) > w.left * 1.15) continue;
        const col = w.own < 0.35 ? FLAME[1] : w.own < 0.7 ? (ch === 'o' ? FLAME[3] : own) : ch === 'o' ? glow : own;
        grains.push([toFig(x0 + c * C + C / 2, y0 + r * C + C / 2), col, C]);
      }
    }
  }
  // THE SMEAR of a lightning strike: its after-images (laid after its edge, so no rim of their own), the oldest thinned to every other point
  const sm = say.smear(m);
  if (sm) {
    sm.forEach((line, j) => {
      const k = j / Math.max(1, sm.length - 1);
      for (let i = 1; i < line.length; i++) {
        const [x0, y0] = st.at(line[i - 1]);
        const [x1, y1] = st.at(line[i]);
        const n = Math.max(1, Math.ceil(Math.hypot(x1 - x0, y1 - y0) / 2));
        for (let e = 0; e < n; e++) {
          if (k < 0.5 && (e + i) % 2) continue;
          grains.push([lerp3(line[i - 1], line[i], e / n), k > 0.7 ? HS_SMEAR[2] : k > 0.35 ? HS_SMEAR[1] : HS_SMEAR[0], 2]);
        }
      }
    });
  }
  MORE.set(m, { grains, tailTip: tip, ribs: s.ribs, pelvis: s.pelvis });
  return bits;
}

// =============================================================================================
// ITS FOG THINNED (Mob.finish): its tail to mist below; torn through by a blow; unravelled as it dies

/**
 * MORE FOG THAN BODY BELOW: gaps through its tail you see the floor by, more toward its end; its head, its arms and its
 * hump whole while it lives. Torn by a blow, a gash through its chest that closes again. Unravelling (`formed` under 1),
 * all of it thinning to nothing.
 */
function thinHush(px: Px, st: Stage, m: Moment, partAt: (k: number) => string | null, say: HushSay): void {
  const more = MORE.get(m);
  if (!more) return;
  const formed = clamp01(say.formed(m));
  const tear = clamp01(say.tear(m));
  const [xP, yP] = st.at(more.pelvis);
  const [xT, yT] = st.at(more.tailTip);
  const [rx, ry] = st.at(more.ribs);
  // (how far along its tail a pixel is, as the picture shows it: 0 at its hips, 1 at its end)
  const tx = xT - xP;
  const ty = yT - yP;
  const t2 = Math.max(16, tx * tx + ty * ty);
  const ang = TAU * fr(m.t / 1.2);
  const ox = 1.7 * Math.cos(ang);
  const oy = 1.7 * Math.sin(ang);
  const W = px.w;
  const H = px.h;
  const ir = parseInt(INK.slice(1, 3), 16);
  const ig = parseInt(INK.slice(3, 5), 16);
  const ib = parseInt(INK.slice(5, 7), 16);
  const ours = (part: string | null): boolean => part === 'body' || part === 'head' || part === 'armL' || part === 'armR' || part === 'spine';
  const edgeAt = (i: number): boolean => px.d[i + 3] === RIM_ALPHA || (px.d[i] === ir && px.d[i + 1] === ig && px.d[i + 2] === ib);
  const cut = new Uint8Array(W * H);
  // (the gash: across its chest, slanting, opened `tear` wide)
  const ta = -28 * D;
  const tc = Math.cos(ta);
  const ts = Math.sin(ta);
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const k = y * W + x;
      const i = k * 4;
      if (px.d[i + 3] === 0) continue;
      const part = partAt(k);
      if (!ours(part) || edgeAt(i)) continue;
      const low = part === 'body' ? clamp01((((x + 0.5 - xP) * tx + (y + 0.5 - yP) * ty) / t2 - 0.5) / 0.55) : 0;
      let thr = 1.06 - 1.2 * Math.pow(low, 1.3) - 1.12 * (1 - formed);
      if (tear > 0) {
        const d = Math.abs((x + 0.5 - rx) * ts - (y + 0.5 - ry) * tc);
        const along = Math.abs((x + 0.5 - rx) * tc + (y + 0.5 - ry) * ts);
        if (along < 16 + 6 * tear) thr -= 1.4 * tear * clamp01(1 - d / (1.5 + 4.5 * tear));
      }
      // (its body comes apart in streaks running down it, as fog does; elsewhere in patches)
      const n = part === 'body' && low > 0 ? 0.7 * noise2(x * 0.34 + ox, y * 0.075 + oy * 0.5, 7945) + 0.3 * noise2(x * 0.6 - oy, y * 0.3 + ox, 7943) : 0.74 * noise2(x * 0.16 + ox, y * 0.22 + oy, 7941) + 0.26 * noise2(x * 0.5 - oy, y * 0.55 + ox, 7943);
      cut[k] = n > thr + 0.1 ? 2 : n > thr - 0.12 ? 1 : 0;
    }
  }
  // (its edge goes with what is gone beside it: the seam on it, and the pink rim round it)
  for (let pass = 0; pass < 2; pass++) {
    const was = cut.slice();
    for (let y = 0; y < H; y++) {
      for (let x = 0; x < W; x++) {
        const k = y * W + x;
        const i = k * 4;
        if (cut[k] || px.d[i + 3] === 0 || !edgeAt(i)) continue;
        const part = partAt(k);
        if (part !== null && !ours(part)) continue;
        let gone = 0;
        for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
          const xx = x + dx;
          const yy = y + dy;
          if (xx >= 0 && yy >= 0 && xx < W && yy < H && was[yy * W + xx] === 2) gone++;
        }
        if (gone) cut[k] = 2;
      }
    }
  }
  const mr = parseInt(HS_MIST.slice(1, 3), 16);
  const mg = parseInt(HS_MIST.slice(3, 5), 16);
  const mb = parseInt(HS_MIST.slice(5, 7), 16);
  for (let k = 0; k < W * H; k++) {
    const i = k * 4;
    if (cut[k] === 2 || (cut[k] === 1 && ((k % W) + Math.floor(k / W)) % 2 === 1)) px.d[i + 3] = 0;
    else if (cut[k] === 1) {
      px.d[i] = mr;
      px.d[i + 1] = mg;
      px.d[i + 2] = mb;
      px.d[i + 3] = 255;
    }
  }
}

/** IT AS THE PAINTER TAKES IT. */
export function hushPainter(say: HushSay): {
  bits: (st: Stage, m: Moment) => Bit[];
  grains: (st: Stage, m: Moment) => ReadonlyArray<readonly [V3, string, number]>;
  finish: (px: Px, st: Stage, m: Moment, partAt: (k: number) => string | null) => void;
} {
  return {
    bits: (st, m) => hushBits(st, m, say),
    grains: (_st, m) => MORE.get(m)?.grains ?? [],
    finish: (px, st, m, partAt) => thinHush(px, st, m, partAt, say),
  };
}

// =============================================================================================
// ITS GRIP, ROUND WHOEVER IT CAUGHT (drawn by the game where its arms close, from the moment the blow lands)

/** Its picture, the floor point under the middle of the grip at (`ax`, `ay`). */
export const GRIP_CANVAS = { w: 240, h: 200, ax: 120, ay: 140 } as const;
/**
 * Its times (seconds from the blow landing): the snap (two frames), the hold (whoever it caught wrapped in grey), the
 * loosening and unravelling; how wide the coils wrap (`r`), and the area the arms sweep shut on (`area`), each the
 * figure's own lengths (TILE3 a tile).
 */
export const GRIP_FX = { long: 0.8, snap: [0, 2 / 30] as const, hold: [2 / 30, 0.4] as const, loose: [0.4, 0.8] as const, r: 0.42 * TILE3, area: 0.85 * TILE3 } as const;
/** The coils of the grip `t` seconds after the blow lands: three bands of its fog wound round whoever stands there. Each band: points round it, and how thick. */
export function gripCoils(t: number): { pts: V3[]; ra: number }[] {
  const out: { pts: V3[]; ra: number }[] = [];
  if (t < 0 || t >= GRIP_FX.long) return out;
  const R = GRIP_FX.r;
  const snap = t <= GRIP_FX.snap[1] ? t / GRIP_FX.snap[1] : 1;
  const loose = clamp01((t - GRIP_FX.loose[0]) / (GRIP_FX.loose[1] - GRIP_FX.loose[0]));
  const squeeze = t > GRIP_FX.snap[1] && t < GRIP_FX.loose[0] ? 0.08 * Math.sin(((t - GRIP_FX.snap[1]) / 0.11) * Math.PI) : 0;
  const r = R * (1.9 - 0.9 * snap - 0.1 * clamp01((t - GRIP_FX.snap[1]) / 0.12) - squeeze + 0.5 * loose);
  const N = 30;
  [[13, 14, 0.3], [24, -10, 1.9], [35, 12, 3.6]].forEach(([h, tilt, ph], j) => {
    const pts: V3[] = [];
    // (unravelling: each band comes away from one end, rising)
    const keep = Math.ceil(N * (1 - loose));
    for (let i = 0; i <= Math.min(N, keep); i++) {
      const a = (i / N) * TAU + ph + 0.9 * t;
      const wob = 1 + 0.09 * Math.sin(a * 3 + t * 9 + j);
      pts.push([Math.cos(a) * r * wob, Math.sin(a) * r * wob, h + Math.sin(a) * tilt * 0.35 + 10 * loose * (i / N) + Math.sin(a * 2 + t * 6) * 0.8]);
    }
    if (pts.length > 1) out.push({ pts, ra: (1.9 + 0.5 * Math.sin(j + t * 7)) * (1 - 0.5 * loose) });
  });
  return out;
}
/** THE GRIP `t` seconds after the blow lands, from in front or from behind: `half` 'far' (behind whoever it holds: the game draws it under them), 'near' (in front of them: over them), or 'all'. */
export function gripPainted(t: number, view: GameView = 'front', half: 'far' | 'near' | 'all' = 'all'): Painted {
  const can = GRIP_CANVAS;
  const st = stage(view === 'back' ? 'rear' : view, can.ax, can.ay, can);
  const bits: Bit[] = [];
  const mid: V3 = [0, 0, 24];
  const zMid = st.near(mid);
  for (const { pts, ra } of gripCoils(t)) {
    for (let i = 1; i < pts.length; i++) {
      const a = pts[i - 1];
      const b = pts[i];
      const near = st.near(lerp3(a, b, 0.5)) >= zMid;
      if (half === 'far' && near) continue;
      if (half === 'near' && !near) continue;
      const k = i / pts.length;
      bits.push({ part: near ? 'coilNear' : 'coilFar', piece: 'coil', shape: { k: 'rod', a, b, ra: ra * (0.75 + 0.25 * Math.sin(k * Math.PI)), rb: ra * (0.75 + 0.25 * Math.sin((k + 1 / pts.length) * Math.PI)), ramp: HS_FOG } });
    }
  }
  const lights = paintBits(st, bits, mid);
  const px = st.whole(bits.length ? ENEMY_RIM : null);
  const lay = (p: V3, c: string, size: number): void => {
    const [x, y] = st.at(p);
    const xi = Math.round(x - size / 2);
    const yi = Math.round(y - size / 2);
    for (let dy = 0; dy < size; dy++) for (let dx = 0; dx < size; dx++) if (xi + dx >= 0 && yi + dy >= 0 && xi + dx < px.w && yi + dy < px.h) px.set(xi + dx, yi + dy, c);
  };
  // the snap: the fog swept in across the floor from the edge of the area it shuts on, and the coils' after-images (on the floor: under whoever it holds)
  if (half !== 'near' && t >= 0 && t <= GRIP_FX.snap[1] + 1 / 30 + 1e-6) {
    const k = clamp01(t / GRIP_FX.snap[1]);
    const n = 64;
    for (let i = 0; i < n; i++) {
      const a = (i / n) * TAU;
      for (let j = 0; j < 4; j++) {
        const rr = GRIP_FX.area - (GRIP_FX.area - GRIP_FX.r) * k * (j / 3);
        if ((i + j) % 2 && j < 2) continue;
        lay([Math.cos(a) * rr, Math.sin(a) * rr, 0.4], j === 3 ? HS_SMEAR[2] : j === 2 ? HS_SMEAR[1] : HS_SMEAR[0], j === 3 ? 2 : 1);
      }
    }
  }
  // the Hush seeping off the coils while they hold, and coming away as they unravel
  if (t >= 0 && t < GRIP_FX.long) {
    for (const { pts } of gripCoils(t)) {
      pts.forEach((p, i) => {
        if (i % 3) return;
        const near = st.near(p) >= zMid;
        if ((half === 'far' && near) || (half === 'near' && !near)) return;
        const life = fr(t * 1.4 + i * 0.137);
        lay(add(p, [0, 0, 2 + 6 * life]), WISP[Math.min(3, Math.floor(life * 4))], life < 0.4 ? 2 : 1);
      });
    }
  }
  return { px, lights };
}
