// FLOOR 20'S RIME SHADE (the art chat, 3 Nov 2026). A MOCK-UP: NOT IN THE GAME. Nothing of the game imports this file;
// `RIME_SHADE_ON` is off. Its moves are art/rime_shade_moves.ts; its breath's line of rime on the floor, the mark before
// it and the frost closing over the hero it reaches are art/rime_shade_fx.ts.
//
// His pick, 31 Oct 2026, of where FROST should go: “The Shade, 2–5 (Recommended),The Drowned, 10,The Quiet Tower, 20”; and
// of which frost creature for the Quiet Tower, 3 Nov 2026: “Rime Shade (Recommended)”, offered as: a hunched figure of frost
// and fog, icicles for fingers; its breath sends a creeping line of rime along the floor that freezes you in place if it
// reaches you. Floor 20's palette, his doc: “Grey fog, bone white, no colour at all.” A small mob: ONE attack (his rule of
// 9 Oct). The Hush in its own shape: never undead, never gory; it comes apart into fog and frost, nothing left lying.
//
// WHAT IT IS, AS PAINTED: a hunched figure of dense grey fog (`RS_FOG`) on the heroes' bones: a bowed back curled high
// between its shoulders, broad shoulders, long arms; a hood of fog over a head that has no face, only a dull dark hollow
// where it breathes, the enemy's dull pink eyes deep in it. FROST FORMS OVER IT IN PLATES (`RS_FROST`, the game's frost:
// grey-white, a little blue, never the friend's cyan): a crust of plates over each shoulder with spikes of ice standing off
// them, a row of ice shards along its bowed back, a crust over the hump, cuffs of ice over its forearms, rime round the
// hood's edge; more of it as it draws in its breath. ITS FINGERS ARE ICICLES (`RS_ICE`): four to a hand, long, clear,
// cracked, a glint at their points. From its hips a shroud of fog hangs to its knees; below, its legs go to mist: it
// drifts low, half walking, its feet never on the floor. Fog streams up off it and trails low behind it; its cold breath
// sinks out of its hollow. The dark seam (`INK`) where one part ends before another; the enemy's pink rim round it while
// it lives. Nothing cyan.

import type { Px } from '../engine/px';
import { INK, RIM_ALPHA, hash } from './kit';
import type { Ramp } from './kit';
import { FLAME } from './mkit';
import { sphere } from './new_mobs3';
import type { Bit, MobCanvas, Moment, Put } from './new_mobs3';
import { wornOn } from './skin';
import type { Ring, Skin, Stage } from './skin';
import { add, buildOf, cross, dot, elbowFor, len, lerp3, mul, norm, standing, sub } from './skeleton';
import type { Bones, Build, Posed, Skeleton, V3 } from './skeleton';

/** THE SWITCH, OFF. Nothing of the game reads this file. */
export const RIME_SHADE_ON = { on: false };

const TAU = Math.PI * 2;
const D = Math.PI / 180;
const fr = (t: number): number => t - Math.floor(t);
const clamp01 = (v: number): number => Math.max(0, Math.min(1, v));

// =============================================================================================
// ITS COLOURS: “Grey fog, bone white, no colour at all”; the frost's faint blue only (hue 210 to 225, saturation under 0.18)

/** Its fog: a cold grey, dark in its hollows, near white where the light takes it. */
export const RS_FOG: Ramp = ['#25272c', '#3a3d44', '#53575f', '#6f737b', '#979aa2'];
/** Its arms and legs: the same fog, deeper (so that the frost on them, and its icicles, stand out of them). */
export const RS_FOG_DEEP: Ramp = ['#1c1e22', '#2a2c31', '#3e4148', '#565a62', '#73777f'];
/** The frost over it in plates (the game's frost, as the Drowned's grab and the Shade's rime: art/action_f9_fen.ts `RIME`). */
export const RS_FROST: Ramp = ['#40444e', '#686e7c', '#9ca6b8', '#cdd4de', '#eef2f6'];
/** Its icicle fingers, and the ice shards off it: clear ice, its shade grey, its light near white. */
export const RS_ICE: Ramp = ['#50555f', '#7f8796', '#b2bac8', '#dce2ea', '#f6f8fb'];
/** The dark of its hollow, where a face would be. */
export const RS_HOLLOW = '#07080b';
/** Its eyes, deep in its hollow: the enemy's dull pink (as the Hushed's), hotter as it breathes out. */
export const RS_EYE = FLAME[1];
export const RS_EYE_HOT = FLAME[2];
/** What it thins to: mist, every other pixel of it gone. */
export const RS_MIST = '#7a7e88';
/** Its smear (a lightning strike's after-images): the oldest a dark grey, the newest near white. Used for nothing else. */
export const RS_SMEAR = ['#5b616d', '#a7afbd', '#e9edf3'] as const;
/** The fog streaming off it, palest first. */
export const RS_WISP = ['#d9dce2', '#b9bdc6', '#9a9fa9', '#7c818c'] as const;
/** Its cold breath: near white, sinking. */
export const RS_COLD = ['#f2f4f8', '#d7dce5', '#b8bfcc'] as const;
/** A crack in its ice: the ice's own dark. */
export const RS_CRACK = '#3c4048';
/** The glint at an icicle's point, and on a flung shard. */
export const RS_GLINT = '#ffffff';

// =============================================================================================
// ITS BODY: on the heroes' bones (art/skeleton.ts), so every check the bosses have holds for it

/** Taller than the knight when it straightens (80 to his 58); hunched, about his height. Long arms (1.35 a man's), broad shoulders, a narrow waist; long legs that go to mist. */
export const RS_BODY: Build = buildOf(80, 1.18, { shoulders: 1.06, chest: 0.92, depth: 1.0, waist: 0.62, hips: 0.72, arms: 1.35, legs: 0.92, limbs: 1.0, pad: 2.4 });
const B = RS_BODY;
/** Its picture: room above it for its fog and as it rises to its height, before it for its breath and its smear. */
export const RS_CANVAS: MobCanvas = { w: 320, h: 280, ax: 150, ay: 206 };

/** ITS REST: hunched, its back bowed high between its shoulders, its hooded head thrust out and hanging, its long arms hanging before it, icicles toward the floor; its knees bent, its feet off the floor. */
const REST0: Bones = {
  ...standing(B),
  pz: -4.5, px: 0, py: 0, yaw: 0, pitch: 13, roll: 0, twist: 0, bend: 20, side: 0, hunch: 34, shrug: 0.4,
  faceTurn: 0, faceUp: 2, faceTilt: 0,
  lhIn: 1, lhx: 16, lhy: 8, lhz: -22, le: 0,
  rhIn: 1, rhx: 14, rhy: -8.5, rhz: -23, re: 0,
  lfx: 0.5, lfy: 0.5, lfz: 6.5, lfp: 24, rfx: -1.5, rfy: -0.5, rfz: 7.2, rfp: 28, lk: 8, rk: -8,
};
/** Its elbows put as near as they go to these ways (each arm's own: forward, out to its side, up), for a pose. */
export function elbowsTo(rest: Bones, pose: Partial<Bones>, wantL: V3, wantR: V3): Partial<Bones> {
  const q = { ...rest, ...pose } as Posed;
  const le = elbowFor(B, q, true, norm(wantL));
  const re = elbowFor(B, { ...q, le } as Posed, false, norm(wantR));
  return { ...pose, le, re };
}
/** Its elbows hanging out to its sides and a little back. */
export const HANG_L: V3 = [-0.9, 0.75, -0.05];
export const HANG_R: V3 = [-0.9, -0.75, -0.05];
export const RS_REST: Bones = { ...REST0, ...elbowsTo(REST0, {}, HANG_L, HANG_R) } as Bones;

// =============================================================================================
// WHAT A MOMENT OF A MOVE SAYS OVER AND ABOVE THE BONES (art/rime_shade_moves.ts says it)

export interface RimeSay {
  /** How far its going drags its fog (its own lengths, the way the fog is left behind): its shroud's hem and its low fog trailing. */
  lag: (m: Moment) => V3;
  /** Its icicle fingers: how far spread (0 hanging together, 1 splayed wide) and curled (0 straight, 1 hooked in). */
  hands: (m: Moment) => { splay: number; curl: number };
  /** How far the frost has formed over it (0.5 or so as it drifts; 1 as it draws in its breath; less, spent). */
  frost: (m: Moment) => number;
  /** How much of it is there (1 whole; less as it comes apart; 0 gone). */
  formed: (m: Moment) => number;
  /** Torn through by a blow (0 whole, 1 torn widest). */
  tear: (m: Moment) => number;
  /** Its frost cracking, shards of it flung off (0 none; 1 the most), and how long since they were flung (seconds). */
  crack: (m: Moment) => { k: number; since: number } | null;
  /** How hard its fog streams off it (1 drifting; more as it breathes out and is spent, more as it comes apart). */
  stream: (m: Moment) => number;
  /**
   * ITS COLD BREATH: `out`, puffing out of its hollow as it breathes (0 to 1); `draw`, the fog drawn in to its hollow as it
   * fills (0 to 1); `pour`, its breath pouring out of it down onto the floor before it (0 to 1, and how far along the
   * floor it reaches, `reach`, its own lengths).
   */
  breath: (m: Moment) => { out: number; draw: number; pour: number; reach: number };
  /** THE SMEAR OF A LIGHTNING STRIKE: after-images along the way it has just come, each a line of points, the oldest first. */
  smear: (m: Moment) => V3[][] | null;
}

// =============================================================================================
// ITS SOLIDS

/** A smooth churn of noise, for its fog's streaks and hollows. */
export function noise2(x: number, y: number, seed: number): number {
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
const tone5 = (v: number): number => Math.max(0, Math.min(4, v));
/** Its fog on a round part: pale streaks drawn up along it as it churns, and hollows where it is thin; frost crusted on what faces up, the more the more it has formed (`frost`). */
function fogSkin(seed: number, churn: number, frost: number, up: V3 | null = null): (u: V3, tone: number) => string {
  return (u, tone) => {
    const streak = fr(u[2] * 1.2 + u[0] * 0.45 + churn + 0.25 * Math.sin(u[1] * 3 + seed));
    const hollow = noise2(u[0] * 2.2 + seed + churn * 2, u[2] * 2.2 + u[1] * 1.4, 8911) > 0.8;
    // (the frost: on what faces up, its edge feathered)
    if (up && frost > 0.05) {
      const n = norm(u, [0, 0, 1]);
      const face = dot(n, up);
      const edge = 0.75 - 0.95 * frost + 0.22 * (noise2(u[0] * 5 + seed, u[1] * 5 + u[2] * 3, 8913) - 0.5);
      if (face > edge) return frostAt(u, tone, seed);
      if (face > edge - 0.09) return RS_FROST[tone5(tone)];
    }
    return RS_FOG[tone5(tone + (streak < 0.15 ? 1 : 0) - (hollow ? 1 : 0))];
  };
}
/** Frost in plates: facets of the crust, each its own tone, their seams dark. */
function frostAt(u: V3, tone: number, seed: number): string {
  const k = 2.6;
  const cx = Math.floor(u[0] * k + 7);
  const cy = Math.floor(u[1] * k + 7);
  const cz = Math.floor(u[2] * k + 7);
  const h = hash(cx + 31 * cz, cy, seed + 8917);
  // (a seam between plates)
  const fx = fr(u[0] * k + 7);
  const fy = fr(u[1] * k + 7);
  const fz = fr(u[2] * k + 7);
  const seam = Math.min(fx, fy, fz, 1 - fx, 1 - fy, 1 - fz) < 0.07;
  if (seam) return RS_FROST[tone5(tone - 1)];
  return RS_FROST[tone5(tone + (h > 0.66 ? 1 : h < 0.22 ? -1 : 0))];
}
const frostSkin = (seed: number): Skin => (u, tone) => frostAt(u, tone, seed);

/**
 * THE HEAD AND ITS HOOD: a hood of fog drooping over its brow, rime along its edge; within it no face, only a dull dark
 * hollow where it breathes, the enemy's dull pink eyes deep in it, and (as it draws in its breath, `glint`) the cold
 * gathering pale in the hollow's heart. The hollow faces down and out, before it. Returns where it breathes from, and
 * the way it faces.
 */
function head(put: Put, st: Stage, s: Skeleton, glint: number, churn: number, frost: number): { mouth: V3; facing: V3 } {
  const [ff, fl, fu] = wornOn(st, s, 10);
  const hr = B.headR;
  const c = add(s.head, mul(ff, 0.2));
  // (the way the hollow faces: forward, and down a little, as a hood's opening; drawn round toward whoever looks while they
  // can see its face at all, so that it is not lost on the edge of the hood, as the eyes of every face are, art/skin.ts)
  const d0 = norm(add(ff, mul(fu, -0.22)));
  const toward = clamp01(dot(st.eye, ff) * 1.6);
  const d = norm(add(mul(d0, 1 - 0.45 * toward), mul(st.eye, 0.45 * toward)), d0);
  const across = norm(sub(fl, mul(d, dot(fl, d))), fl);
  const upward = norm(cross(d, across), fu);
  // the head inside: all of its front the hollow, dark; the cold's light at its heart as it fills
  const skin: Skin = (u, tone) => {
    const n = norm(u, [1, 0, 0]);
    const w = add(add(mul(ff, n[0]), mul(fl, n[1])), mul(fu, n[2]));
    const f = dot(w, d);
    if (f > -0.15) {
      const a = dot(w, across) / 0.5;
      const b = (dot(w, upward) + 0.05) / 0.7;
      const q = a * a + b * b;
      if (glint > 0.05 && q < 0.3 * glint) return q < 0.12 * glint ? RS_FROST[4] : RS_FROST[3];
      if (glint > 0.05 && q < 0.5 * glint) return RS_FROST[1];
      return q < 0.8 ? RS_HOLLOW : INK;
    }
    return RS_FOG[tone5(tone - 1)];
  };
  put('head', 'head', { k: 'ball', c, ax: [mul(ff, hr[0]), mul(fl, hr[1]), mul(fu, hr[2])], skin });
  // the hood: a deep cowl of fog over the head and out before its brow, open before the hollow; rime round its edge; its
  // point drooping behind
  const hc = add(add(c, mul(ff, hr[0] * 0.22)), mul(fu, hr[2] * 0.16));
  const H0 = hr[0] * 1.5;
  const H1 = hr[1] * 1.42;
  const H2 = hr[2] * 1.28;
  const hood: Skin = (u, tone) => {
    const n = norm(u, [1, 0, 0]);
    const w = add(add(mul(ff, n[0]), mul(fl, n[1])), mul(fu, n[2]));
    const f = dot(w, d);
    const a = dot(w, across) / 0.52;
    const b = (dot(w, upward) + 0.08) / 0.74;
    const q = a * a + b * b;
    if (f > 0.25 && q < 1) return null;
    if (f > 0.12 && q < 1.45) return q < 1.22 ? RS_FROST[tone5(tone + 1)] : RS_FROST[tone5(tone)];
    // (its fog streaked; a crust of frost on its crown as the frost forms over it)
    if (dot(w, fu) > 1.05 - 0.4 * frost) return frostAt(u, tone, 57);
    return RS_FOG[tone5(tone - 1 + (fr(u[2] * 1.3 + u[0] * 0.4 + churn) < 0.16 ? 1 : 0))];
  };
  put('head', 'hood', { k: 'ball', c: hc, ax: [mul(ff, H0), mul(fl, H1), mul(fu, H2)], skin: hood });
  // the cowl's point, drooping down behind the head onto its hump
  const pk = add(add(hc, mul(ff, -H0 * 0.62)), mul(fu, H2 * 0.25));
  const back = norm(add(mul(ff, -0.7), mul(fu, -0.6)));
  put('head', 'cowl', { k: 'rod', a: pk, b: add(pk, mul(back, 6.5)), ra: 3.4, rb: 1.0, ramp: RS_FOG });
  // its eyes, deep in the hollow: the enemy's dull pink
  const mouth = add(c, mul(d, hr[0] * 0.92));
  const eye = glint > 0.85 ? RS_EYE_HOT : RS_EYE;
  for (const k of [-1, 1]) put('head', 'eye', { k: 'dot', p: add(add(c, mul(d, hr[0] * 0.97)), add(mul(across, k * hr[1] * 0.24), mul(upward, hr[2] * 0.22))), c: eye, facing: d, c2: eye });
  if (glint > 0.05 && dot(d, st.eye) > 0.05) put('glint', 'glint', { k: 'glow', p: mouth, c: RS_FROST[3], r: 6 + 9 * glint, a: Math.min(0.5, 0.4 * glint) });
  return { mouth, facing: d };
}

/** Its icicle fingers as they are at a moment: where each rises from the hand, its knuckle and its point; hanging together or splayed wide (`splay`), straight or hooked in (`curl`). */
export function fingersOf(s: Skeleton, side: 'L' | 'R', splay: number, curl: number): { base: V3[]; knuckles: V3[]; tips: V3[]; e1: V3; e2: V3 } {
  const el = side === 'L' ? s.elbowL : s.elbowR;
  const hand = side === 'L' ? s.handL : s.handR;
  const fore = norm(sub(hand, el), [0, 0, -1]);
  const cu = s.chest[2];
  const e1 = norm(sub(cu, mul(fore, dot(cu, fore))), s.chest[0]);
  const e2 = norm(cross(fore, e1), [0, 1, 0]);
  const base: V3[] = [];
  const knuckles: V3[] = [];
  const tips: V3[] = [];
  for (let i = 0; i < 4; i++) {
    const k = i - 1.5;
    const b = add(hand, add(mul(fore, 2.0), mul(e2, k * 0.7)));
    const fan = k * (5 + 16 * splay) * D;
    const way = norm(add(mul(fore, Math.cos(fan)), mul(e2, Math.sin(fan))));
    const bend1 = (3 + 26 * curl) * D;
    const bend2 = (4 + 34 * curl) * D;
    const d1 = norm(add(mul(way, Math.cos(bend1)), mul(e1, -Math.sin(bend1))));
    const d2 = norm(add(mul(way, Math.cos(bend1 + bend2)), mul(e1, -Math.sin(bend1 + bend2))));
    const long = i === 0 || i === 3 ? 0.84 : 1;
    const kn = add(b, mul(d1, 5.2 * long));
    base.push(b);
    knuckles.push(kn);
    tips.push(add(kn, mul(d2, 10.5 * long)));
  }
  return { base, knuckles, tips, e1, e2 };
}

/** AN ARM: a crust of frost plates over the shoulder with spikes of ice off it, the long upper arm of fog, the elbow, the forearm with its cuff of ice, a hand of ice and its four long icicle fingers. */
function arm(put: Put, s: Skeleton, side: 'L' | 'R', splay: number, curl: number, churn: number, frost: number): void {
  const L = side === 'L';
  const sh = L ? s.shoulderL : s.shoulderR;
  const el = L ? s.elbowL : s.elbowR;
  const hand = L ? s.handL : s.handR;
  const [r0, r1, r2] = B.armR;
  const part = `arm${side}`;
  const fore = norm(sub(hand, el), [0, 0, -1]);
  const upper = norm(sub(el, sh), [0, 0, -1]);
  const [uf, ul, uu] = s.upper;
  const out = mul(ul, L ? 1 : -1);
  put(part, part, { k: 'ball', c: add(sh, mul(upper, 0.8)), ax: [mul(upper, r0 * 1.5), mul(norm(cross(upper, uf), ul), r0 * 1.35), mul(uf, r0 * 1.35)], skin: fogSkin(L ? 31 : 33, churn, frost, [0, 0, 1]), far: true });
  put(part, part, { k: 'rod', a: sh, b: el, ra: r0 * 1.12, rb: r1 * 0.95, ramp: RS_FOG_DEEP, far: true });
  put(part, part, { k: 'ball', c: el, ax: sphere(r1 * 1.1), skin: RS_FOG_DEEP, far: true });
  const wrist = add(hand, mul(fore, -0.4));
  put(part, part, { k: 'rod', a: el, b: wrist, ra: r1 * 0.95, rb: r2 * 0.8, ramp: RS_FOG_DEEP, far: true });
  // the cuff of ice over the forearm, from half way down it to the wrist (more of it, the more the frost has formed)
  const cuffFrom = lerp3(el, wrist, 0.62 - 0.22 * frost);
  put(part, `${part}cuff`, { k: 'rod', a: cuffFrom, b: add(wrist, mul(fore, 0.4)), ra: r1 * 0.95 + 0.7, rb: r2 * 0.8 + 0.9, ramp: RS_FROST, far: true });
  // the shoulder's crust: a plate of frost over it, spikes of ice standing up and out off it
  const pc = add(add(sh, mul(uu, 2.2)), mul(out, 0.6));
  put(part, `${part}plate`, { k: 'ball', c: pc, ax: [mul(uf, 4.6 + 0.6 * frost), mul(out, 4.4 + 0.8 * frost), mul(uu, 2.4 + 0.5 * frost)], skin: frostSkin(L ? 61 : 63), far: true });
  for (let j = 0; j < 3; j++) {
    const hk = hash(j, L ? 1 : 2, 8931);
    const base = add(add(pc, mul(uf, (j - 1) * 2.6)), add(mul(out, 1.5 + 0.8 * hk), mul(uu, 1.2)));
    const way = norm(add(add(mul(uu, 1), mul(out, 0.55 + 0.3 * hk)), mul(uf, (j - 1) * 0.35 - 0.25)));
    const long = (3.2 + 2.6 * hk + (j === 1 ? 1.6 : 0)) * (0.55 + 0.6 * frost);
    put(part, `${part}spike`, { k: 'rod', a: base, b: add(base, mul(way, long)), ra: 1.15, rb: 0.2, ramp: RS_ICE, far: true });
  }
  // the hand: a knot of ice, and the icicles
  const f = fingersOf(s, side, splay, curl);
  put(part, `${part}hand`, { k: 'ball', c: add(hand, mul(fore, 0.9)), ax: [mul(fore, 2.2), mul(f.e2, 1.9), mul(f.e1, 1.0)], skin: frostSkin(L ? 65 : 67), far: true });
  for (let i = 0; i < 4; i++) {
    put(part, `${part}ice`, { k: 'rod', a: f.base[i], b: f.knuckles[i], ra: 1.15, rb: 0.88, ramp: RS_ICE, far: true });
    put(part, `${part}ice`, { k: 'rod', a: f.knuckles[i], b: f.tips[i], ra: 0.88, rb: 0.16, ramp: RS_ICE, far: true });
  }
}

/** The bones' own body rings, from the hips up to the neck (what the checks also see): a narrow waist, the ribs, the upper back curled high over them, broad hunched shoulders. */
function bodyRings(s: Skeleton): Ring[] {
  const [cf, cl] = s.chest;
  const [uf, ul, uu] = s.upper;
  return [
    { c: add(s.pelvis, mul(s.hips[2], 1.0)), u: mul(s.hips[0], B.pelvisDeep + 2.6), v: mul(s.hips[1], B.pelvisHalf + 2.8) },
    { c: s.waist, u: mul(s.belly[0], B.waistDeep + 2.2), v: mul(s.belly[1], B.waistHalf + 2.2) },
    { c: add(s.ribs, mul(cf, 0.3)), u: mul(cf, B.ribDeep + 2.4), v: mul(cl, B.ribHalf + 2.4) },
    { c: add(s.back, mul(uf, 0.1)), u: mul(uf, B.ribDeep + 2.6), v: mul(ul, B.ribHalf + 3.2) },
    { c: add(add(lerp3(s.back, s.neck, 0.6), mul(uf, -0.4)), mul(uu, 0.2)), u: mul(uf, B.ribDeep + 2.2), v: mul(ul, B.shoulderHalf + 1.4) },
    { c: add(add(s.neck, mul(uu, -0.6)), mul(uf, -0.4)), u: mul(uf, B.ribDeep + 0.6), v: mul(ul, B.shoulderHalf * 0.8) },
    { c: add(add(s.neck, mul(uu, 1.0)), mul(uf, 0.6)), u: mul(uf, 2.6), v: mul(ul, 2.8) },
  ];
}
/** The hump: the top of its back swelling up between its shoulders, over its bowed head. */
export function humpOf(s: Skeleton): { c: V3; ax: [V3, V3, V3] } {
  const [uf, ul, uu] = s.upper;
  return { c: add(add(lerp3(s.back, s.neck, 0.62), mul(uf, -(B.ribDeep * 0.62))), mul(uu, 1.6)), ax: [mul(uf, B.ribDeep + 1.4), mul(ul, B.shoulderHalf * 0.84), mul(uu, 5.8)] };
}
/** The ice shards along its bowed back, each where it stands off it and its point (as many as there are of them: four, down from between its shoulders). */
export function spinesOf(s: Skeleton, frost: number): { a: V3; b: V3; r: number }[] {
  const [uf, ul, uu] = s.upper;
  const hump = humpOf(s);
  const out: { a: V3; b: V3; r: number }[] = [];
  for (let j = 0; j < 4; j++) {
    const k = j / 3;
    const hk = hash(j, 5, 8941);
    // (from high on the hump down the curve of its back)
    const at = add(add(hump.c, mul(uu, 4.6 - 7.5 * k)), add(mul(uf, -(2.2 + 2.6 * k)), mul(ul, (hk - 0.5) * 2.4)));
    const way = norm(add(add(mul(uu, 1.0 - 0.6 * k), mul(uf, -0.55 - 0.5 * k)), mul(ul, (hk - 0.5) * 0.5)));
    const long = (8.5 - 2.4 * k + 2.4 * hk) * (0.5 + 0.65 * frost);
    out.push({ a: at, b: add(at, mul(way, long)), r: 1.9 - 0.4 * k });
  }
  return out;
}
/** Its shroud of fog, from its hips down past its knees to a hand over the floor (bottom first), going to mist below its knees: each ring's middle and its half-widths, trailing as it goes. */
export function shroudOf(s: Skeleton, lag: V3): { c: V3; u: V3; v: V3 }[] {
  const f = norm([s.hips[0][0], s.hips[0][1], 0], [1, 0, 0]);
  const l: V3 = [-f[1], f[0], 0];
  const top = add(s.pelvis, mul(s.hips[2], 0.6));
  const knees = add(lerp3(s.kneeL, s.kneeR, 0.5), [0, 0, 2]);
  const ankles = lerp3(s.ankleL, s.ankleR, 0.5);
  // (spread fore and aft over the knees as they step)
  const apart = Math.abs(dot(sub(s.kneeL, s.kneeR), f));
  const levels: [number, V3][] = [
    [1, [ankles[0], ankles[1], 2.4]],
    [0.72, lerp3(knees, ankles, 0.5)],
    [0.42, knees],
    [0, top],
  ];
  return levels.map(([k, c0]) => {
    const c = add(c0, mul(lag, 0.7 * k ** 1.3));
    const deep = B.pelvisDeep + 2.8 + 3.4 * k + 0.55 * apart * Math.min(1, k * 2);
    const across = B.pelvisHalf + 2.8 + 3.6 * k;
    return { c: [c[0], c[1], Math.max(2.4, c[2])] as V3, u: mul(f, deep), v: mul(l, across) };
  });
}

/** What a moment paints over and above its solids, kept for its grains and its thinning. */
const MORE = new WeakMap<Moment, { grains: [V3, string, number][]; ribs: V3; pelvis: V3; hem: V3; knees: [V3, V3]; ankles: [V3, V3] }>();

function rimeBits(st: Stage, m: Moment, say: RimeSay): Bit[] {
  const { s } = m;
  const bits: Bit[] = [];
  const put: Put = (part, piece, shape) => bits.push({ part, piece, shape });
  const t = m.t;
  const churn = fr(t / 1.2);
  const lag = say.lag(m);
  const frost = clamp01(say.frost(m));
  const { splay, curl } = say.hands(m);
  const f = norm([s.hips[0][0], s.hips[0][1], 0], [1, 0, 0]);
  const l: V3 = [-f[1], f[0], 0];
  // ITS LEGS: fog, going to mist below its knees (`thin`), its feet never painted
  for (const side of ['L', 'R'] as const) {
    const hip = side === 'L' ? s.hipL : s.hipR;
    const knee = side === 'L' ? s.kneeL : s.kneeR;
    const ankle = side === 'L' ? s.ankleL : s.ankleR;
    const [r0, r1, r2] = B.legR;
    put(`leg${side}`, `leg${side}`, { k: 'rod', a: hip, b: knee, ra: r0 * 1.15, rb: r1 * 1.15, ramp: RS_FOG_DEEP });
    put(`leg${side}`, `leg${side}`, { k: 'rod', a: knee, b: ankle, ra: r1 * 1.15, rb: r2 * 1.1, ramp: RS_FOG_DEEP });
  }
  // ITS SHROUD of fog, from its hips down to a hand over the floor, going to mist below its knees, ragged at its hem
  const sh = shroudOf(s, lag);
  const shRings: Ring[] = sh.map((r, i) => {
    const pts: V3[] = [];
    const rag = i === 0 ? 0.3 : i === 1 ? 0.16 : i === 2 ? 0.06 : 0.03;
    for (let j = 0; j < 18; j++) {
      const a = (j / 18) * TAU;
      const k = 1 + rag * (noise2(j * 0.9 + i * 3.1, t * 2.2 + i, 8951) - 0.45) * 2;
      // (its hem cut into ragged tongues, longer behind)
      const drop = i === 0 ? Math.min(r.c[2] - 0.8, (1.2 + 1.4 * Math.max(0, -Math.cos(a))) * noise2(j * 1.7, t * 1.6, 8953)) : 0;
      pts.push(add(r.c, add(add(mul(r.u, Math.cos(a) * k), mul(r.v, Math.sin(a) * k)), [0, 0, -drop])));
    }
    return { ...r, pts };
  });
  put('shroud', 'shroud', { k: 'cloth', rings: shRings, ramp: RS_FOG, look: { folds: [0, 40, -40, 95, -95, 150, -150], lift: 0.05 } });
  // ITS BODY: one length of fog from its hips up through its narrow waist and ribs, its back curled high, its shoulders, to its neck; the hump over it
  put('body', 'body', { k: 'cloth', rings: bodyRings(s), ramp: RS_FOG, look: { folds: [0, 35, -35, 80, -80, 135, -135, 180], lift: 0.1 } });
  const hump = humpOf(s);
  put('body', 'hump', { k: 'ball', c: hump.c, ax: hump.ax, skin: fogSkin(11, churn, frost, [0, 0, 1]) });
  put('body', 'neck', { k: 'rod', a: add(s.neck, mul(s.upper[2], -0.5)), b: lerp3(s.neck, s.skull, 0.8), ra: 2.8, rb: 2.2, ramp: RS_FOG });
  // its shoulder blades standing out of the fog of its back
  for (const k of [-1, 1]) {
    const [uf, ul, uu] = s.upper;
    const c = add(add(lerp3(s.back, s.neck, 0.45), mul(uf, -(B.ribDeep + 1.6))), mul(ul, k * B.shoulderHalf * 0.52));
    put('body', 'blade', { k: 'ball', c, ax: [mul(uf, 1.6), mul(ul, 3.0), mul(norm(add(uu, mul(ul, -k * 0.35))), 4.2)], skin: fogSkin(41 + k, churn, frost, [0, 0, 1]) });
  }
  // the frost over its chest, in two plates under its collar (seen from in front)
  for (const k of [-1, 1]) {
    const [cf, cl, cu] = s.chest;
    const c = add(add(lerp3(s.ribs, s.neck, 0.55), mul(cf, B.ribDeep + 1.2)), mul(cl, k * B.ribHalf * 0.45));
    put('body', 'breast', { k: 'ball', c, ax: [mul(cf, 1.4 + 0.5 * frost), mul(cl, 3.2 + 0.8 * frost), mul(cu, 2.6 + 0.9 * frost)], skin: frostSkin(71 + k) });
  }
  // the shards of ice along its bowed back
  for (const sp of spinesOf(s, frost)) put('body', 'spine', { k: 'rod', a: sp.a, b: sp.b, ra: sp.r, rb: 0.22, ramp: RS_ICE });
  // ITS ARMS
  arm(put, s, 'L', splay, curl, churn, frost);
  arm(put, s, 'R', splay, curl, churn, frost);
  // ITS HEAD AND HOOD
  const glint = clamp01(m.glint);
  const { mouth, facing } = head(put, st, s, glint, churn, frost);
  // ITS FOG AND ITS BREATH (laid after its edge)
  const grains: [V3, string, number][] = [];
  const formed = clamp01(say.formed(m));
  const stream = say.stream(m);
  // (fog rising off it, from its crown, its hump, its shoulders, its elbows and its shroud's hem)
  const hem = sh[0].c;
  const emitters: [V3, number, number][] = [
    [add(s.head, [0, 0, B.headR[2] * 1.1]), 4, 2],
    [add(hump.c, mul(s.upper[2], 4.5)), 7, 3],
    [s.shoulderL, 4, 4],
    [s.shoulderR, 4, 5],
    [s.elbowL, 3, 6],
    [s.elbowR, 3, 7],
    [add(hem, mul(f, -3)), 5, 8],
  ];
  const lagN = len(lag) > 0.5 ? norm(lag) : mul(f, -1);
  const back = norm(add(mul(lagN, 0.5), [0, 0, 0.8]));
  for (const [at, n0, seed] of emitters) {
    const n = formed < 0.02 ? 0 : Math.round(n0 * Math.min(2.4, 0.6 + 0.4 * stream) * (0.4 + 0.6 * formed));
    for (let i = 0; i < n; i++) {
      const life = fr(t * (0.5 + 0.18 * stream) + i / n + 0.37 * hash(i, seed, 8961));
      if (life > 0.8) continue;
      const a = hash(i, seed, 8962) * TAU;
      const r0 = 1 + 2.5 * hash(i, seed, 8963);
      const go = (2 + 9 * life) * (0.7 + 0.3 * stream);
      const cu = a + life * 4;
      const p = add(add(at, mul(back, go)), [Math.cos(a) * r0 + Math.cos(cu) * 2 * life, Math.sin(a) * r0 + Math.sin(cu) * 2 * life, life * 2.5]);
      grains.push([p, RS_WISP[Math.min(3, Math.floor(life * 4))], life < 0.4 ? 2 : 1]);
    }
  }
  // (fog trailing low off its legs, lying along the floor behind it: left behind the way it goes, along the floor)
  const lagH: V3 = Math.hypot(lag[0], lag[1]) > 0.3 ? norm([lag[0], lag[1], 0]) : mul(f, -1);
  for (const [ankle, seed] of [[s.ankleL, 11], [s.ankleR, 12]] as const) {
    const n = formed < 0.02 ? 0 : Math.round(7 * (0.5 + 0.5 * Math.min(2, stream)) * (0.3 + 0.7 * formed));
    for (let i = 0; i < n; i++) {
      const life = fr(t * 0.6 + i / n + 0.29 * hash(i, seed, 8964));
      if (life > 0.85) continue;
      const a = hash(i, seed, 8965) * TAU;
      const p = add(add([ankle[0], ankle[1], Math.max(0.6, ankle[2] * (1 - life) * 0.6)], mul(lagH, 3 + 12 * life)), [Math.cos(a) * (1.5 + 3 * life), Math.sin(a) * (1.5 + 3 * life), 0.8 * life]);
      grains.push([p, RS_WISP[Math.min(3, 1 + Math.floor(life * 3))], life < 0.45 ? 2 : 1]);
    }
  }
  // ITS COLD BREATH: puffing out of its hollow and sinking; drawn in as it fills; pouring down onto the floor before it
  const br = say.breath(m);
  if (br.out > 0.02) {
    for (let i = 0; i < 7; i++) {
      const life = fr(t * 0.8 + i / 7);
      if (life > 0.75 * br.out + 0.05) continue;
      const p = add(add(mouth, mul(facing, 1.5 + 6 * life)), [Math.sin(life * 5 + i) * 1.4 * life, Math.cos(life * 4 + i) * 1.2 * life, -5 * life * life]);
      grains.push([p, RS_COLD[Math.min(2, Math.floor(life * 3))], life < 0.35 ? 2 : 1]);
    }
  }
  if (br.draw > 0.02) {
    // (the fog round it drawn in to its hollow: wisps coming in from all round, faster as they come)
    for (let i = 0; i < 30; i++) {
      const life = fr(t * 1.6 + i / 30 + 0.31 * hash(i, 1, 8966));
      const a = hash(i, 2, 8966) * TAU;
      const e = (hash(i, 3, 8966) - 0.3) * 1.2;
      const r = (26 + 12 * hash(i, 4, 8966)) * (1 - life) ** 1.5 * br.draw;
      // (each a streak along the way it is drawn in)
      for (const k of [0, 0.08]) {
        const rr = r * (1 + k);
        const p = add(mouth, [Math.cos(a + k * 3) * Math.cos(e) * rr, Math.sin(a + k * 3) * Math.cos(e) * rr, Math.sin(e) * rr]);
        grains.push([p, k ? RS_WISP[Math.min(3, 1 + Math.floor((1 - life) * 3))] : life > 0.6 ? RS_COLD[1] : RS_WISP[Math.min(3, Math.floor((1 - life) * 3))], life > 0.5 && !k ? 2 : 1]);
      }
    }
  }
  if (br.pour > 0.02) {
    // (a heavy plume of it billowing out of its hollow and down onto the floor before it, widening as it falls, rolling out
    // along the floor where it lands)
    const land: V3 = [Math.max(br.reach, mouth[0] + 6), mouth[1] * 0.3, 0.6];
    const n = Math.round(120 * br.pour);
    for (let i = 0; i < n; i++) {
      const u = fr(t * 2.4 + i / n + 0.23 * hash(i, 5, 8967));
      const spread = 3 + 14 * u;
      const a = hash(i, 6, 8967) * TAU;
      const r = Math.sqrt(hash(i, 7, 8967));
      const mid = lerp3(mouth, land, Math.min(1, u * 1.15));
      const roll = Math.max(0, u - 0.8) * 5 * 12;
      const p = add(mid, [Math.cos(a) * spread * r * 0.8 + roll, Math.sin(a) * spread * r * 1.1, Math.sin(a * 2) * spread * r * 0.3]);
      grains.push([[p[0], p[1], Math.max(0.6, p[2])], RS_COLD[Math.min(2, Math.floor(u * 2.6))], u < 0.75 ? 2 : 1]);
    }
    // (and pooling where it lands, rolling out along the floor before it, down the line)
    for (let i = 0; i < Math.round(40 * br.pour); i++) {
      const life = fr(t * 1.5 + i / 40 + 0.17 * hash(i, 8, 8967));
      const a = hash(i, 9, 8967) * TAU;
      const p: V3 = [land[0] + 30 * life + Math.cos(a) * (4 + 8 * life), land[1] + Math.sin(a) * (5 + 6 * life), 0.8 + 3 * life * (1 - life)];
      if (life < 0.85) grains.push([p, life < 0.4 ? RS_COLD[0] : RS_COLD[1], 2]);
    }
  }
  // ITS ICICLES: a crack or two in each, a glint at the points
  {
    for (const side of ['L', 'R'] as const) {
      const fg = fingersOf(s, side, splay, curl);
      for (let i = 0; i < 4; i++) {
        const k = 0.35 + 0.3 * hash(i, side === 'L' ? 1 : 2, 8971);
        grains.push([lerp3(fg.knuckles[i], fg.tips[i], k), RS_CRACK, 1]);
        grains.push([lerp3(fg.knuckles[i], fg.tips[i], k + 0.06), RS_CRACK, 1]);
        if (fr(t * 0.9 + i * 0.27 + (side === 'L' ? 0 : 0.5)) < 0.22) grains.push([lerp3(fg.knuckles[i], fg.tips[i], 0.82), RS_GLINT, 1]);
      }
    }
  }
  // ITS FROST CRACKING: shards of ice flung off it, glinting, falling, gone before they reach the floor
  const cr = say.crack(m);
  if (cr && cr.k > 0.01) {
    const from: V3[] = [s.shoulderL, s.shoulderR, hump.c, s.elbowL, s.elbowR, s.handL, s.handR, add(s.head, [0, 0, 3]), s.ribs];
    const n = Math.round(5 * cr.k);
    from.forEach((at, j) => {
      for (let i = 0; i < n; i++) {
        const a = hash(i, j, 8981) * TAU;
        const sp = 30 + 34 * hash(i, j, 8982);
        const T = cr.since * (0.7 + 0.5 * hash(i, j, 8983));
        const p = add(at, [Math.cos(a) * sp * T - 10 * T, Math.sin(a) * sp * T, (22 + 18 * hash(i, j, 8984)) * T - 120 * T * T]);
        if (p[2] < 1 || T > 0.6) continue;
        grains.push([p, i % 3 === 0 ? RS_GLINT : i % 3 === 1 ? RS_ICE[3] : RS_FROST[2], T < 0.25 ? 2 : 1]);
      }
    });
  }
  // COMING APART: strands of its fog drawn up off every part of it, flakes of its frost falling and gone
  if (formed < 0.999) {
    const gone = 1 - formed;
    const ups: V3[] = [s.head, hump.c, s.ribs, s.waist, s.pelvis, hem, s.kneeL, s.kneeR, s.elbowL, s.elbowR, s.handL, s.handR, lerp3(s.shoulderL, s.elbowL, 0.5), lerp3(s.shoulderR, s.elbowR, 0.5)];
    ups.forEach((at, j) => {
      const n = Math.round(9 * Math.sin(Math.PI * Math.min(1, gone * 1.15)));
      for (let i = 0; i < n; i++) {
        const life = fr(t * 0.9 + i / Math.max(1, n) + 0.31 * hash(i, j, 8991));
        const a = hash(i, j, 8992) * TAU;
        const p = add(at, [Math.cos(a) * (1.5 + 4 * life) + Math.sin(life * 6 + j) * 1.5, Math.sin(a) * (1.5 + 4 * life), 3 + 18 * life * (0.6 + 0.4 * hash(i, j, 8993))]);
        grains.push([p, RS_WISP[Math.min(3, Math.floor(life * 4))], life < 0.5 ? 2 : 1]);
        // (and its frost, flaking off and falling, melting to nothing on the way down)
        if (i % 2 === 0) {
          const q = add(at, [Math.cos(a + 1) * (2 + 3 * life), Math.sin(a + 1) * (2 + 3 * life), -12 * life * life]);
          if (q[2] > 1.5 && life < 0.7) grains.push([q, life < 0.3 ? RS_GLINT : RS_FROST[3], 1]);
        }
      }
    });
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
          grains.push([lerp3(line[i - 1], line[i], e / n), k > 0.7 ? RS_SMEAR[2] : k > 0.35 ? RS_SMEAR[1] : RS_SMEAR[0], 2]);
        }
      }
    });
  }
  MORE.set(m, { grains, ribs: s.ribs, pelvis: s.pelvis, hem, knees: [s.kneeL, s.kneeR], ankles: [s.ankleL, s.ankleR] });
  return bits;
}

// =============================================================================================
// ITS FOG THINNED (Mob.finish): its legs to mist below its knees and its shroud's hem; torn through by a blow; coming apart as it dies

function thinRime(px: Px, st: Stage, m: Moment, partAt: (k: number) => string | null, say: RimeSay): void {
  const more = MORE.get(m);
  if (!more) return;
  const formed = clamp01(say.formed(m));
  const tear = clamp01(say.tear(m));
  const [rx, ry] = st.at(more.ribs);
  const [xP, yP] = st.at(more.pelvis);
  const [xH, yH] = st.at(more.hem);
  const legs = [0, 1].map((i) => ({ k: st.at(more.knees[i]), a: st.at(more.ankles[i]) }));
  const ang = TAU * fr(m.t / 1.2);
  const ox = 1.7 * Math.cos(ang);
  const oy = 1.7 * Math.sin(ang);
  const W = px.w;
  const H = px.h;
  const ir = parseInt(INK.slice(1, 3), 16);
  const ig = parseInt(INK.slice(3, 5), 16);
  const ib = parseInt(INK.slice(5, 7), 16);
  const fogPart = (part: string | null): boolean => part === 'body' || part === 'shroud' || part === 'legL' || part === 'legR';
  const ours = (part: string | null): boolean => part !== null && part !== 'glint';
  const edgeAt = (i: number): boolean => px.d[i + 3] === RIM_ALPHA || (px.d[i] === ir && px.d[i + 1] === ig && px.d[i + 2] === ib);
  const cut = new Uint8Array(W * H);
  const [X0, Y0] = st.at([0, 0, 0]);
  const ta = -28 * D;
  const tc = Math.cos(ta);
  const ts = Math.sin(ta);
  const along = (x: number, y: number, a: readonly [number, number], b: readonly [number, number]): number => {
    const dx = b[0] - a[0];
    const dy = b[1] - a[1];
    return ((x - a[0]) * dx + (y - a[1]) * dy) / Math.max(9, dx * dx + dy * dy);
  };
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const k = y * W + x;
      const i = k * 4;
      if (px.d[i + 3] === 0) continue;
      const part = partAt(k);
      if (!ours(part) || edgeAt(i)) continue;
      // (how far down toward the mist it is: its shins toward its ankles; the shroud toward its hem)
      let low = 0;
      if (part === 'legL' || part === 'legR') {
        const g = legs[part === 'legL' ? 0 : 1];
        low = clamp01((along(x + 0.5, y + 0.5, g.k, g.a) + 0.1) / 0.8);
      } else if (part === 'shroud') low = clamp01((along(x + 0.5, y + 0.5, [xP, yP], [xH, yH]) - 0.4) / 0.6);
      let thr = 1.06 - 1.25 * Math.pow(low, 1.2) - 1.12 * (1 - formed);
      if (tear > 0 && fogPart(part)) {
        const d = Math.abs((x + 0.5 - rx) * ts - (y + 0.5 - ry) * tc);
        const al = Math.abs((x + 0.5 - rx) * tc + (y + 0.5 - ry) * ts);
        if (al < 18 + 6 * tear) thr -= 1.4 * tear * clamp01(1 - d / (1.5 + 4.5 * tear));
      }
      // (its fog comes apart in streaks running down it, as fog does; elsewhere in patches; its churn laid from its floor point)
      const fx = x - X0;
      const fy = y - Y0;
      const n = low > 0 ? 0.7 * noise2(fx * 0.34 + ox, fy * 0.08 + oy * 0.5, 8945) + 0.3 * noise2(fx * 0.6 - oy, fy * 0.3 + ox, 8943) : 0.74 * noise2(fx * 0.16 + ox, fy * 0.22 + oy, 8941) + 0.26 * noise2(fx * 0.5 - oy, fy * 0.55 + ox, 8943);
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
  const mr = parseInt(RS_MIST.slice(1, 3), 16);
  const mg = parseInt(RS_MIST.slice(3, 5), 16);
  const mb = parseInt(RS_MIST.slice(5, 7), 16);
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
export function rimePainter(say: RimeSay): {
  bits: (st: Stage, m: Moment) => Bit[];
  grains: (st: Stage, m: Moment) => ReadonlyArray<readonly [V3, string, number]>;
  finish: (px: Px, st: Stage, m: Moment, partAt: (k: number) => string | null) => void;
} {
  return {
    bits: (st, m) => rimeBits(st, m, say),
    grains: (_st, m) => MORE.get(m)?.grains ?? [],
    finish: (px, st, m, partAt) => thinRime(px, st, m, partAt, say),
  };
}
