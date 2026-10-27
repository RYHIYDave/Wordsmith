// THE WARLOCK'S DEMON ON A MOVING SKELETON (the art chat, 26 Oct 2026). A MOCK-UP; NOTHING OF THE GAME IMPORTS IT.
//
// His words of the first change into the demon, 26 Oct: “Well let’s see.  I’d like a little bit of an actual transition
// from one to the other.  Not just a smoke cloud obscuring the change.  Also he’s facing one way and the demon is facing
// the other.  That might just be because that’s the only drawing of the demon you have”. So the demon he said yes to
// (dev/sculpt_demon.ts, a still, its every part placed by hand) is built here on the heroes' bones (art/skeleton.ts),
// on a build of its own, so that it can face as he faces, move, and be changed into.
//
// HOW ITS LOOK IS KEPT: its rest pose (DEMON_REST) puts its joints where the still has them; each part of the still is
// carried by the bone it belongs to (its belly by the belly, its chest by the chest, its hump, wings and spines by the top of
// its back, its head, horns and jaws by its head, its hips, rag and tail by its hips): where the part lies from that bone at
// rest, it lies from it in any pose. Its limbs are built on its limbs' joints, as the still builds them. At rest it is the
// still, turned as the still is turned.

import type { Ramp } from '../art/kit';
import { CYAN } from '../art/kit';
import { FRIEND_RIM } from '../art/hero3_knight';
import type { GameView, PaintView, Stage } from '../art/skin';
import { add, buildOf, cross, elbowFor, lerp3, mul, norm, solve, standing, sub } from '../art/skeleton';
import type { Bones, Build, Posed, Rot, Skeleton, V3 } from '../art/skeleton';
import { Px } from '../engine/px';
import { Sculpt, draw, onCone } from './sculpt';
import type { Cone, Drawn, Hit, Prim } from './sculpt';
import { HULK_CANVAS, HULK_HIDES, drawAura } from './demon_hulk';
import type { Aura } from './demon_hulk';
import { IVORY, STEEL5, handFire } from './sculpt_warlock';
import { demonHand, five, lifted, tone5 } from './sculpt_demon';

/** ITS BUILD: a hulking brute on goat legs (its hock the rig's ankle, its hoof the rig's toe), long arms, a short thick neck. */
export const DEMON_B: Build = {
  ...buildOf(95, 1),
  ankle: 13, shank: 22.5, thigh: 20.5, hipHalf: 10, stance: 13.5,
  waist: 9, ribs: 9, chest: 20, shoulderHalf: 21, shoulderDrop: 3,
  neck: 7, headUp: -5, headFwd: 15, headR: [10.6, 11.2, 11.2],
  // (a beast's neck: on all fours, its back pitched down before it, it lifts its face to look ahead, as a man's neck cannot)
  neckUp: 85,
  // (A GORILLA'S ARMS, long and massive, its forearms the thickest of them: his word, 27 Oct, “Give me an all fours stance,
  // gorilla like arms, claws flat on the floor burning with cyan flame and black smoke”)
  upperArm: 32, foreArm: 34, heel: 2, ball: 9,
  ribHalf: 16, ribDeep: 12.5, waistHalf: 11, waistDeep: 10.5, pelvisHalf: 11, pelvisDeep: 9.5,
  armR: [7.6, 7.6, 6.0], legR: [8, 5.8, 3.8], pad: 1.4,
};

/** Where the still has its joints, in its own measure (forward, its left, up from the floor under it). */
const STILL = { elbowL: [18, 40, 66] as V3, elbowR: [14, -36, 44] as V3 };

/** ITS REST: crouched low and forward as the still is, its right claw raised with the fire in it, its left planted on the floor. */
export const DEMON_REST: Bones = (() => {
  const q: Bones = {
    ...standing(DEMON_B),
    px: -2, pz: -13, pitch: 0, bend: 8, hunch: 46, shrug: 0, faceUp: -4,
    lhIn: 2, lhx: 38, lhy: 36, lhz: 84, le: 0,
    rhIn: 2, rhx: 24, rhy: -30, rhz: 36, re: 0,
    lfx: -6, lfy: 0, lfz: 0, rfx: -8, rfy: 0, rfz: 0, lk: 10, rk: -10,
  } as Bones;
  const s0 = solve(DEMON_B, q as Posed);
  q.le = elbowFor(DEMON_B, q as Posed, true, sub(STILL.elbowL, lerp3(s0.shoulderL, s0.handL, 0.5)));
  q.re = elbowFor(DEMON_B, q as Posed, false, sub(STILL.elbowR, lerp3(s0.shoulderR, s0.handR, 0.5)));
  return q;
})();
const REST = solve(DEMON_B, DEMON_REST as Posed);

/**
 * ON ALL FOURS (his word, 27 Oct: “Give me an all fours stance, gorilla like arms, claws flat on the floor burning with cyan
 * flame and black smoke”): bowed far over, its shoulders hunched up high and its head low and thrust out between them, its
 * long arms down before it, elbows out, both claws flat on the floor; its goat legs bent under it.
 */
export const DEMON_FOURS: Bones = (() => {
  const q: Bones = {
    ...DEMON_REST,
    // (its face lifted to glare straight ahead, over its claws: its neck a beast's, `DEMON_B.neckUp`; so its face is seen,
    // his 27 Oct, “I’m not sure about the demon’s face”)
    px: 2, pz: -22, pitch: 6, bend: 26, hunch: 50, shrug: 0.7, faceUp: 2, faceTurn: 0,
    lhIn: 2, lhx: 28, lhy: 21, lhz: 7, le: 0,
    rhIn: 2, rhx: 26, rhy: -22, rhz: 7, re: 0,
    lfx: -10, rfx: -6, lk: 14, rk: -14,
  } as Bones;
  const s0 = solve(DEMON_B, q as Posed);
  // (its elbows pointing back, its arms straight down under its shoulders, a gorilla's: his word, 27 Oct, “Nah the elbows
  // stick out way too much and the hands are both facing in”)
  q.le = elbowFor(DEMON_B, q as Posed, true, [-12, 1, 0]);
  q.re = elbowFor(DEMON_B, q as Posed, false, [-12, -1, 0]);
  return q;
})();

/** The bones its parts are carried by: where each is, and how it is turned. */
type Region = 'hips' | 'belly' | 'chest' | 'upper' | 'head';
const regionOf = (s: Skeleton, r: Region): { at: V3; rot: Rot } =>
  r === 'hips' ? { at: s.pelvis, rot: s.hips } : r === 'belly' ? { at: s.waist, rot: s.belly } : r === 'chest' ? { at: s.ribs, rot: s.chest } : r === 'upper' ? { at: s.back, rot: s.upper } : { at: s.head, rot: s.face };
const dot = (a: V3, b: V3): number => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const len = (a: V3): number => Math.hypot(a[0], a[1], a[2]);

// ITS HIDE, NOT A SMOOTH SHAPE (his word of the change seen happening, 26 Oct: “The demon is looking a little shapey.  Can we
// make sure he’s not just shapes?”; his rulebook's How art is made and approved, rule 9, “Real shapes, not circles and
// squares”, and its Never, “plastic 3D (a smooth, shiny computer-render look)”): a hide wrinkled and mottled, rough where the
// light is on it; the texture lies on each part of it, so it moves with it and does not crawl as it moves.
const hash3 = (x: number, y: number, z: number): number => {
  const h = Math.sin(x * 127.1 + y * 311.7 + z * 74.7) * 43758.5453;
  return h - Math.floor(h);
};
/** A smooth noise in three dimensions, 0 to 1. */
export function noise3(x: number, y: number, z: number): number {
  const xi = Math.floor(x);
  const yi = Math.floor(y);
  const zi = Math.floor(z);
  const e = (t: number): number => t * t * (3 - 2 * t);
  const u = e(x - xi);
  const v = e(y - yi);
  const w = e(z - zi);
  const c = (dx: number, dy: number, dz: number): number => hash3(xi + dx, yi + dy, zi + dz);
  const L = (a: number, b: number, t: number): number => a + (b - a) * t;
  return L(L(L(c(0, 0, 0), c(1, 0, 0), u), L(c(0, 1, 0), c(1, 1, 0), u), v), L(L(c(0, 0, 1), c(1, 0, 1), u), L(c(0, 1, 1), c(1, 1, 1), u), v), w);
}
/** Where a point is on a part of it, in that part's own reckoning (so a mark on it goes where the part goes). */
export function onPart(p: Prim, q: V3): V3 {
  if (p.k === 'cone') {
    const d = norm(sub(p.b, p.a));
    const v = sub(q, p.a);
    const r1 = norm(cross(d, Math.abs(d[2]) < 0.9 ? [0, 0, 1] : [1, 0, 0]));
    return [dot(v, d), dot(v, r1), dot(v, cross(d, r1))];
  }
  if (p.k === 'tri') return sub(q, p.a);
  const v = sub(q, p.c);
  return [dot(v, norm(p.axes[0])), dot(v, norm(p.axes[1])), dot(v, norm(p.axes[2]))];
}
/** A point of the still (its own measure), carried by a bone into a pose: where it lies from the bone at rest, it lies from it now. */
function carrier(s: Skeleton, k: () => number = () => 1) {
  const at = (r: Region, p: V3): V3 => {
    const a = regionOf(REST, r);
    const b = regionOf(s, r);
    const d = mul(sub(p, a.at), k());
    const o: V3 = [dot(d, a.rot[0]), dot(d, a.rot[1]), dot(d, a.rot[2])];
    return add(b.at, add(add(mul(b.rot[0], o[0]), mul(b.rot[1], o[1])), mul(b.rot[2], o[2])));
  };
  const way = (r: Region, v: V3): V3 => {
    const a = regionOf(REST, r).rot;
    const b = regionOf(s, r).rot;
    const o: V3 = [dot(v, a[0]), dot(v, a[1]), dot(v, a[2])];
    return add(add(mul(b[0], o[0]), mul(b[1], o[1])), mul(b[2], o[2]));
  };
  return { at, way };
}

export interface DemonLook {
  aura?: Aura;
  hide?: number;
  /**
   * Its face (his 27 Oct, “I’m not sure about the demon’s face”; of a beast's in a snarl and bare bone, “A is better, try a
   * couple more”; of the beast's made sharper, a brute's and a bat's, “A, beast sharpened (Recommended)”): the beast's, his
   * pick, unless another is asked for (as it was, a brute's, a bat's, bare bone: the faces he was shown).
   */
  face?: 'was' | 'beast' | 'brute' | 'bat' | 'skull';
  /** Its tail swung to its left (radians at its root; more along it, a whip), as it moves. */
  tail?: number;
}
/**
 * HOW FAR GROWN each part of it is (1 grown; less, smaller, and nearer the bone it grows from; 0 not there): for its
 * change out of the warlock (dev/warlock_change.ts), where it grows out of him.
 */
export interface DemonGrowth {
  body: number;
  head: number;
  horns: number;
  wings: number;
  tail: number;
  spines: number;
  plates: number;
  shackles: number;
  hands: number;
  rag: number;
}
export const GROWN: DemonGrowth = { body: 1, head: 1, horns: 1, wings: 1, tail: 1, spines: 1, plates: 1, shackles: 1, hands: 1, rag: 1 };
/**
 * ITS WINGS ALIVE (his word of the change seen happening, 26 Oct: “I like everything but the wings, they seem too stiff”;
 * shown them folding, opening and beating up and down: “Still too stiff”, read as flat boards swung in their own plane):
 * how far open they are (`spread`: 0 folded up behind its back like a cloak, the hand of each high over its shoulder and its
 * fingers hanging down; 1 half open as it stands; more, flung wide); how far they are raised (`beat`, radians, up from the
 * root of each; less than nothing, lowered); how far they are swung back (`sweep`, radians, about the upright through the
 * root; less than nothing, forward: the stroke of a wingbeat, out of the wing's own plane); how far the hand of each lags
 * behind the stroke (`tip`, radians back: the forearm bent by half of it at the elbow, the fingers by the rest at the
 * wrist); and the skin between its fingers (`flex`: 0 flat, as the still; 1 sagging between them, its torn edge scalloped
 * and rippling, at the moment `phase`, seconds), billowing back as the air catches it (`wind`: more than nothing, back).
 */
export interface DemonWings {
  spread: number;
  beat: number;
  sweep: number;
  tip: number;
  flex: number;
  wind: number;
  phase: number;
}
export const WINGS_REST: DemonWings = { spread: 1, beat: 0, sweep: 0, tip: 0, flex: 0, wind: 0, phase: 0 };

export type T3 = readonly [number, number, number];
/** A wing's joints as it stands, half open (in the still's own reckoning: forward, out from its back, up). */
export const WING_OPEN = { root: [-12, 12, 82] as T3, elbow: [-22, 34, 104] as T3, wrist: [-26, 50, 128] as T3, tips: [[-28, 64, 124], [-30, 78, 102], [-28, 74, 72], [-24, 60, 48]] as T3[], flank: [-12, 22, 54] as T3, thumb: [-24, 52, 136] as T3 };
/** The ways its bones lie folded: the arm up and back, the forearm up over its shoulder, the fingers hanging down its back, a little fanned. */
const WING_FOLD = { upper: [-8, 6, 12] as T3, fore: [2, 1, 6] as T3, tips: [[-0.55, 0.02, -1], [-0.6, 0.05, -1], [-0.65, 0.08, -1], [-0.7, 0.1, -1]] as T3[], thumb: [1, 0, 8] as T3, flank: [-16, 12, 72] as T3 };
/** A wing's joints, `w` as open and beating as it is. */
export function wingJoints(w: DemonWings): typeof WING_OPEN {
  if (w.spread === 1 && w.beat === 0 && w.sweep === 0 && w.tip === 0) return WING_OPEN;
  const d = (a: T3, b: T3): T3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
  const plus = (a: T3, b: T3): T3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
  const len = (a: T3): number => Math.hypot(a[0], a[1], a[2]);
  // (a bone's way between folded and open, its length kept)
  const way = (open: T3, fold: T3): T3 => {
    const lo = len(open);
    const lf = len(fold);
    const m: T3 = [fold[0] / lf + (open[0] / lo - fold[0] / lf) * w.spread, fold[1] / lf + (open[1] / lo - fold[1] / lf) * w.spread, fold[2] / lf + (open[2] / lo - fold[2] / lf) * w.spread];
    const k = lo / (len(m) || 1);
    return [m[0] * k, m[1] * k, m[2] * k];
  };
  // (raised about the line through `o` running forward: up, by `ang`, out from its back)
  const raise = (p: T3, o: T3, ang: number): T3 => {
    const l = p[1] - o[1];
    const u = p[2] - o[2];
    return [p[0], o[1] + l * Math.cos(ang) - u * Math.sin(ang), o[2] + l * Math.sin(ang) + u * Math.cos(ang)];
  };
  // (swung about the upright through `o`: back, by `ang`, what is out from its back)
  const swing = (p: T3, o: T3, ang: number): T3 => {
    const f = p[0] - o[0];
    const l = p[1] - o[1];
    return [o[0] + f * Math.cos(ang) - l * Math.sin(ang), o[1] + f * Math.sin(ang) + l * Math.cos(ang), p[2]];
  };
  const O = WING_OPEN;
  const root = O.root;
  let elbow = plus(root, way(d(O.elbow, O.root), WING_FOLD.upper));
  let wrist = plus(elbow, way(d(O.wrist, O.elbow), WING_FOLD.fore));
  let tips = O.tips.map((t, i) => plus(wrist, way(d(t, O.wrist), WING_FOLD.tips[i])));
  let thumb = plus(wrist, way(d(O.thumb, O.wrist), WING_FOLD.thumb));
  const flank: T3 = [WING_FOLD.flank[0] + (O.flank[0] - WING_FOLD.flank[0]) * w.spread, WING_FOLD.flank[1] + (O.flank[1] - WING_FOLD.flank[1]) * w.spread, O.flank[2]];
  // (raised and swung from its root)
  const whole = (p: T3): T3 => swing(raise(p, root, w.beat), root, w.sweep);
  elbow = whole(elbow);
  wrist = whole(wrist);
  tips = tips.map(whole);
  thumb = whole(thumb);
  // (the hand lagging behind the stroke: bent at the elbow, and the fingers again at the wrist)
  wrist = swing(wrist, elbow, w.tip * 0.5);
  tips = tips.map((t) => swing(t, elbow, w.tip * 0.5));
  thumb = swing(thumb, elbow, w.tip * 0.5);
  tips = tips.map((t) => swing(t, wrist, w.tip * 0.5));
  return { root, elbow, wrist, tips, flank, thumb };
}
/**
 * A BAT'S WING, REAL (his word of the ten demons, 26 Oct: “I really don’t like the wings too.  They just seem like two big
 * flat sails.  Like how the carrion queen felt before the redo”; the Queen was remade with a bird's real wings, each
 * feather its own, art/carrion_queen2.ts): an arm and a forearm of muscle with a knob at the elbow and the wrist; a clawed
 * thumb; four long fingers, each in three bones with a knuckle between and bowed back; and between them the skin, not a
 * flat sheet but loose, sagging back between the bones, its torn edge cut deep in a scallop between each fingertip, a vein
 * down each panel; torn through in places (ragged: more); or only rags of it left on bare bone. Its joints as
 * dev/sculpt_demon_rig.ts wingJoints has them (open, folded, beating), at `root` in the frame `frame` (forward, its left,
 * up), on its `side`, `size` big. Returns where its wrist is.
 */
export function batWing(sc: Sculpt, m: { hide: number; horn: number; bone: number; leather: number }, root: V3, frame: readonly [V3, V3, V3], side: 1 | -1, size: number, wp: DemonWings, kind: 'bat' | 'ragged' | 'bone', G: number): V3 {
  const J = wingJoints(wp);
  const O = WING_OPEN.root;
  const [WF, WL, WU] = frame;
  const Wj = (p: T3): V3 => add(root, add(mul(WF, (p[0] - O[0]) * size), add(mul(WL, side * (p[1] - O[1]) * size), mul(WU, (p[2] - O[2]) * size))));
  const elbow0 = Wj(J.elbow);
  const wrist = Wj(J.wrist);
  // (its arm arched up between its shoulder and its wrist)
  const elbow = add(elbow0, mul(WU, 0.2 * len(sub(elbow0, root))));
  const tips = J.tips.map(Wj);
  const flank = Wj(J.flank);
  const thumb = Wj(J.thumb);
  // (the back of the wing: the side of it away from the way the body faces)
  let n = norm(cross(sub(tips[0], wrist), sub(tips[3], wrist)));
  if (dot(n, WF) > 0) n = mul(n, -1) as V3;
  // THE FINGERS: three bones each, a knuckle between, each CURVED in a long arc sweeping back toward its tip, so the wing is
  // a cupped, curved thing and not a flat sail (his word, 27 Oct: “Really bad.  I like the original size but they’re too flat.
  // Curve them.”); the middle fingers curved the most
  const CURVE = [0.62, 0.74, 0.7, 0.56];
  const fingers: V3[][] = tips.map((t, i) => {
    const L0 = len(sub(t, wrist));
    const b = CURVE[i] * L0;
    // (each bone curved two ways: swept back out of the wing's plane, cupping it; and bowed down within it like a scythe)
    const d0 = norm(sub(t, wrist));
    let side0 = norm(cross(n, d0));
    if (dot(side0, WU) > 0) side0 = mul(side0, -1) as V3;
    const at = (u: number): V3 => add(lerp3(wrist, t, u), add(mul(n, b * Math.pow(u, 1.5)), mul(side0, 0.26 * L0 * Math.sin(Math.PI * u))));
    return [wrist, at(0.36), at(0.7), at(1)];
  });
  sc.cone(m.hide, 'wings', root, elbow, 3.4 * size, 2.5 * size, 1.0 * G, { tag: 'wingarm' });
  sc.cone(m.hide, 'wings', elbow, wrist, 2.3 * size, 1.8 * size, 0.8 * G, { tag: 'wingarm' });
  sc.ell(m.hide, 'wings', elbow, [mul(WF, 2.7 * size), mul(WL, 2.7 * size), mul(WU, 2.7 * size)], 0.6 * G, { tag: 'knob' });
  sc.ell(m.hide, 'wings', wrist, [mul(WF, 2.2 * size), mul(WL, 2.2 * size), mul(WU, 2.2 * size)], 0.5 * G, { tag: 'knob' });
  const r = [1.4, 1.05, 0.8, 0.3];
  for (const f of fingers) {
    for (let j = 0; j < 3; j++) sc.cone(m.hide, 'wings', f[j], f[j + 1], r[j] * size, r[j + 1] * size, 0.3 * G, { tag: 'finger' });
    for (let j = 1; j < 3; j++) sc.ell(m.hide, 'wings', f[j], [mul(WF, r[j] * 1.3 * size), mul(WL, r[j] * 1.3 * size), mul(WU, r[j] * 1.3 * size)], 0.2 * G, { tag: 'knuckle' });
    sc.cone(m.bone, 'wings', f[3], add(f[3], add(mul(norm(sub(f[3], f[2])), 2.4 * size), mul(n, -1.2 * size))), 0.55 * size, 0.05, 0.1, { tag: 'tipclaw' });
  }
  // (its thumb, a hooked claw)
  sc.cone(m.hide, 'wings', wrist, thumb, 1.5 * size, 1.0 * size, 0.4 * G, { tag: 'thumb' });
  sc.cone(m.bone, 'wings', thumb, add(thumb, add(mul(norm(sub(thumb, wrist)), 2.2 * size), mul(WF, 2.0 * size))), 0.95 * size, 0.06, 0.12, { tag: 'thumbclaw' });
  // THE SKIN between two of its bones (`A` and `B`, each four points from the wrist out): rows across it at the knuckles,
  // sagging back between the bones (most in the middle and toward the edge), its edge cut in a deep scallop; bare bone has
  // only the first of it left, in rags
  const panel = (A: V3[], B: V3[], seed: number): void => {
    const rows = kind === 'bone' ? 2 : 4;
    const span = len(sub(A[3], B[3]));
    const reach = (len(sub(A[3], A[0])) + len(sub(B[3], B[0]))) / 2;
    const cols = [0, 0.25, 0.5, 0.75, 1];
    const shut = Math.max(0, 1 - wp.spread);
    const sag = (rr: number): number => [0, 0.08, 0.13, 0.1][rr] * reach * (1 + 0.6 * Math.sin(seed * 2.1)) * (1 + 2.5 * wp.wind) * (1 - shut) + [0, 0.06, 0.1, 0.1][rr] * reach * shut * (seed % 2 ? 1 : -1);
    const P: V3[][] = [];
    for (let rr = 0; rr < rows; rr++) {
      const row: V3[] = [];
      for (const v of cols) {
        let p = lerp3(A[rr], B[rr], v);
        // (its edge cut deep between the fingertips, back toward the first knuckles: the bat's scallop; a ragged one deeper,
        // and torn unevenly)
        if (rr === 3) p = lerp3(p, lerp3(A[1], B[1], 0.5), (kind === 'ragged' ? 0.7 : 0.58) * Math.pow(Math.sin(Math.PI * v), 0.8) * (kind === 'ragged' ? 0.8 + 0.4 * Math.sin(seed * 5.3 + v * 9) : 1));
        row.push(add(p, mul(n, sag(rr) * Math.sin(Math.PI * v) + (rr === 3 ? Math.sin(wp.phase * Math.PI * 2 * 1.6 + seed * 1.3 + v * 3) * 0.04 * reach * wp.flex : 0))));
      }
      P.push(row);
    }
    if (kind === 'bone') {
      // (rags of it: the inner row and a torn tongue or two hanging)
      const mid = lerp3(A[1], B[1], 0.5);
      P.push([lerp3(A[1], A[2], 0.4), lerp3(mid, A[2], 0.5), add(lerp3(mid, lerp3(A[2], B[2], 0.5), 0.8), mul(WU, -2 * size)), lerp3(mid, B[2], 0.3), lerp3(B[1], B[2], 0.25)]);
    }
    const tri = (a: V3, b: V3, c: V3): void => {
      if (len(sub(a, b)) < 0.05 || len(sub(b, c)) < 0.05 || len(sub(a, c)) < 0.05) return;
      sc.tri(m.leather, 'wings', a, b, c, 0.6 * G, 0.5 * G, { tag: 'membrane' });
    };
    for (let rr = 0; rr + 1 < P.length; rr++) {
      for (let c = 0; c + 1 < cols.length; c++) {
        tri(P[rr][c], P[rr][c + 1], P[rr + 1][c + 1]);
        tri(P[rr][c], P[rr + 1][c + 1], P[rr + 1][c]);
      }
    }
    if (kind === 'bone') return;
    // (a vein down it, from the knuckle row to the edge)
    const v0 = lerp3(P[1][1], P[1][2], 0.5);
    const v1 = lerp3(P[3][2], P[2][2], 0.35);
    sc.cone(m.leather, 'wings', add(v0, mul(n, 0.4 * size)), add(v1, mul(n, 0.4 * size)), 0.5 * size, 0.3 * size, 0.3 * G, { tag: 'vein' });
    // (a ragged one torn: a long rent up into it from its edge, never a round hole)
    if (kind === 'ragged' && seed % 2) {
      const a = P[3][1];
      const b = lerp3(P[2][2], P[1][2], 0.3);
      sc.cone(m.leather, 'wings', a, b, span * 0.07, 0.3, 0.1, { carve: true });
    }
  };
  for (let i = 0; i < 3; i++) panel(fingers[i], fingers[i + 1], i + 1);
  // (from its last finger back to its body)
  panel(fingers[3], [elbow, lerp3(elbow, flank, 0.35), lerp3(elbow, flank, 0.7), flank], 5);
  // (the skin before its arm, from its shoulder to its wrist)
  if (kind !== 'bone') sc.tri(m.leather, 'wings', root, elbow, lerp3(elbow, wrist, 0.85), 0.6 * G, 0.5 * G, { tag: 'membrane' });
  return wrist;
}

/**
 * A HAND OF CLAWS, hanging or reaching (not raised with the fire, not planted): a broad palm, four long fingers bent at
 * each knuckle and curling in toward its front, each ending in a hooked claw, a thumb; `S` how big.
 */
export function clawHand(sc: Sculpt, hide: number, bone: number, piece: string, ha: V3, el: V3, F: V3, S: number): void {
  const U: V3 = [0, 0, 1];
  const fd = norm(sub(ha, el));
  const side0 = norm(cross(fd, Math.abs(dot(fd, U)) > 0.95 ? F : U));
  let n = norm(cross(fd, side0));
  if (dot(n, F) < 0) n = mul(n, -1) as V3;
  const palm = add(ha, mul(fd, 2.2 * S));
  sc.ell(hide, piece, palm, [mul(fd, 3.6 * S), mul(side0, 3.4 * S), mul(n, 1.7 * S)], 1.0 * S, { tag: 'palm' });
  const bend = (v: V3, a: number): V3 => norm(add(mul(v, Math.cos(a)), mul(n, Math.sin(a))));
  const fingers: [number, number][] = [[1.3, 1.0], [0.45, 1.12], [-0.45, 1.05], [-1.3, 0.85]];
  for (const [off, l0] of fingers) {
    const base = add(palm, add(mul(fd, 3.0 * S), mul(side0, off * 1.6 * S)));
    const d1 = norm(add(fd, mul(side0, off * 0.18)));
    const k1 = add(base, mul(d1, 2.8 * S * l0));
    const d2 = bend(d1, 0.55);
    const k2 = add(k1, mul(d2, 2.4 * S * l0));
    const d3 = bend(d1, 1.2);
    const tip = add(k2, mul(d3, 2.8 * S * l0));
    sc.cone(hide, piece, base, k1, 1.05 * S, 0.9 * S, 0.5 * S, { tag: 'finger' });
    sc.cone(hide, piece, k1, k2, 0.9 * S, 0.75 * S, 0.4 * S, { tag: 'finger' });
    sc.cone(bone, piece, k2, tip, 0.72 * S, 0.06, 0.12, { tag: 'claw' });
  }
  const tb = add(palm, mul(side0, 2.8 * S));
  const t1 = add(tb, add(mul(side0, 1.6 * S), add(mul(fd, 1.6 * S), mul(n, 1.2 * S))));
  sc.cone(hide, piece, tb, t1, 1.1 * S, 0.85 * S, 0.5 * S, { tag: 'thumb' });
  sc.cone(bone, piece, t1, add(t1, add(mul(n, 2.2 * S), mul(fd, 1.0 * S))), 0.7 * S, 0.06, 0.12, { tag: 'claw' });
}

/** What the demon's sculpture needs drawn with it: where the fire in its raised claw is, and where its smoke pours from. */
export interface DemonBuilt {
  seat: V3;
  /** The claws flat on the floor, each burning (its hellfire). */
  fires: V3[];
  aura: { from: V3[]; horns: V3[]; jaw: V3; claws: V3[]; feet: V3[]; behind: boolean; time?: number };
}

/** THE DEMON on its bones, in a pose, from in front or behind (behind as the camera truly sees it, as the warlock), turned `turn` on the spot. */
/** Its picture: room for it, its wings, its smoke, and its claws before it. */
export const RIG_CANVAS = { w: 360, h: 320, ax: 180, ay: 276 };
/** How high its wrist is over the floor when its claw stands flat on it (DEMON_FOURS). */
const PLANT_Z = 7;
export function sculptDemonRig(view: GameView, pose: Bones = DEMON_REST, turn = 0, look: DemonLook = {}, wings: DemonWings = WINGS_REST): Drawn {
  return demonFrame(view, pose, turn, look, wings);
}
/**
 * THE DEMON AT A MOMENT OF A MOVE: on its bones in a pose, its wings as they are; its fires flickering as at the moment `t`
 * (seconds), each `fireK` as big as it burns at rest (a claw's five fires in turn: the left's first, if both are down); its
 * smoke rising as at `t` (none given: the still's fire and smoke).
 */
export function demonFrame(view: GameView, pose: Bones = DEMON_REST, turn = 0, look: DemonLook = {}, wings: DemonWings = WINGS_REST, t?: number, fireK: (i: number) => number = () => 1): Drawn {
  const pv: PaintView = view === 'back' ? 'rear' : view;
  const s = solve(DEMON_B, pose as Posed);
  const sc = new Sculpt();
  sc.spin = turn;
  const built = demonInto(sc, s, pv, turn, look, 1, GROWN, wings);
  const d = draw(sc, pv, RIG_CANVAS.ax, RIG_CANVAS.ay, RIG_CANVAS, (st) => {
    if (!built.fires.length) handFire(st, sc.at(built.seat), 4.0, t ?? 2);
  }, FRIEND_RIM);
  built.fires.forEach((p, i) => fireBehind(d, p, (3.7 - (i % 2) * 0.7) * fireK(i), (t ?? 2) + i * 0.41, 12));
  demonAura(d, t === undefined ? built : { ...built, aura: { ...built.aura, time: t } }, look.aura ?? 'smoke');
  return d;
}

/**
 * A FIRE ON ITS DRAWN PICTURE, hidden where any of it is nearer the eye than the fire (a claw burning on the floor behind its
 * wing is not seen through the wing): its hellfire (dev/sculpt_warlock.ts handFire) at `p` (its own space, turned), `size`
 * big, at the moment `t`.
 */
export function fireBehind(d: Drawn, p: V3, size: number, t: number, deep = 7): void {
  const { w, h } = d.px;
  const layer = new Px(w, h);
  handFire({ at: (q: V3) => d.st.at(q), over: layer } as unknown as Stage, p, size, t);
  const near = d.st.near(p) + deep;
  for (let i = 0; i < w * h; i++) {
    if (!layer.d[i * 4 + 3]) continue;
    if (d.px.d[i * 4 + 3] > 0 && d.z[i] > near) continue;
    for (let c = 0; c < 4; c++) d.px.d[i * 4 + c] = layer.d[i * 4 + c];
  }
}

/** What pours off it (its smoke, or a damage word's), and no pixel left alone, on its drawn picture. */
export function demonAura(d: Drawn, built: DemonBuilt, aura: Aura): void {
  drawAura(d.st, d.px, aura, built.aura);
  // NO PIXEL ALONE (his rulebook's Pixels 1): as the still (dev/sculpt_demon.ts)
  const { w, h, d: px } = d.px;
  const solid = (x: number, y: number): boolean => x >= 0 && y >= 0 && x < w && y < h && px[(y * w + x) * 4 + 3] === 255;
  for (let y = 0; y < h - 1; y++) {
    for (let x = 0; x < w; x++) {
      if (!solid(x, y) || solid(x - 1, y) || solid(x + 1, y) || solid(x, y - 1) || solid(x, y + 1)) continue;
      const i = (y * w + x) * 4;
      const j = ((y + 1) * w + x) * 4;
      if (px[j + 3] === 0) {
        px[j] = px[i];
        px[j + 1] = px[i + 1];
        px[j + 2] = px[i + 2];
        px[j + 3] = 255;
      } else px[i + 3] = 0;
    }
  }
}

/**
 * THE DEMON'S PARTS, added to a sculpture `sc` on a skeleton `s` (its own, or another's, as in the change): `scale` how big
 * it is against its own build (its parts' lengths and girths, and how far each lies from its bone); `grow` how far grown
 * each part is.
 */
export function demonInto(sc: Sculpt, s: Skeleton, pv: PaintView, turn: number, look: DemonLook = {}, scale = 1, grow: DemonGrowth = GROWN, wings: DemonWings = WINGS_REST): DemonBuilt {
  /** (the part being built now: how big against its own build, as it is grown) */
  let G = 1;
  const K = (): number => scale * G;
  const C = carrier(s, K);
  /** the sculpture, every girth and blend of a part made as big as it is grown */
  const Z = {
    cone: (m: number, piece: string, a: V3, b: V3, ra: number, rb: number, blend: number, o?: Parameters<Sculpt['cone']>[7]): void => {
      if (K() > 0.02) sc.cone(m, piece, a, b, ra * K(), rb * K(), blend * K(), o);
    },
    ell: (m: number, piece: string, c: V3, axes: readonly [V3, V3, V3], blend: number, o?: Parameters<Sculpt['ell']>[5]): void => {
      if (K() > 0.02) sc.ell(m, piece, c, axes, blend * K(), o);
    },
    box: (m: number, piece: string, c: V3, axes: readonly [V3, V3, V3], round: number, blend: number, o?: Parameters<Sculpt['box']>[6]): void => {
      if (K() > 0.02) sc.box(m, piece, c, axes, round * K(), blend * K(), o);
    },
    tri: (m: number, piece: string, a: V3, b: V3, c: V3, thick: number, blend: number, o?: Parameters<Sculpt['tri']>[7]): void => {
      if (K() > 0.02) sc.tri(m, piece, a, b, c, thick * K(), blend * K(), o);
    },
  };
  const F0: V3 = [1, 0, 0];
  const L0: V3 = [0, 1, 0];
  const U: V3 = [0, 0, 1];
  const P = (f: number, l: number, u: number): V3 => [f, l, u];
  /** a part's axes, carried by its bone */
  const X = (r: Region, rf: number, rl: number, ru: number): readonly [V3, V3, V3] => [mul(C.way(r, F0), rf * K()), mul(C.way(r, L0), rl * K()), mul(C.way(r, U), ru * K())];
  const at = C.at;
  const hide5 = lifted(five(HULK_HIDES[look.hide ?? 0].hide));
  /** Is a point on its far side from the eye (a step darker, as the heroes' far limbs are). */
  const a = ((turn ?? 0) * Math.PI) / 180;
  const spun = (p: V3): V3 => [p[0] * Math.cos(a) - p[1] * Math.sin(a), p[0] * Math.sin(a) + p[1] * Math.cos(a), p[2]];
  const nearOf = (p: V3): number => {
    const q = spun(p);
    return pv === 'front' ? 0.612 * (q[0] - q[1]) + 0.5 * q[2] : pv === 'rear' ? 0.612 * (-q[0] - q[1]) + 0.5 * q[2] : 0.612 * (q[1] - q[0]) + 0.5 * q[2];
  };
  const farL = nearOf(add(s.pelvis, [0, 20, 6])) < nearOf(s.pelvis);
  const farPiece = (piece: string): boolean => (piece.endsWith('L') ? farL : piece.endsWith('R') ? !farL : false);
  const chestRef = at('chest', P(18, 6, 62));
  // (each part of it its own seed, so the texture differs from part to part: by its place among the parts)
  const seeds = new Map<Prim, number>();
  const rough = (h: Hit): number => {
    if (!seeds.size) sc.prims.forEach((q, i) => seeds.set(q, i));
    const sd = (seeds.get(h.prim) ?? 0) * 7.31;
    const [a, b, c] = onPart(h.prim, h.p);
    // (only where the light is on it: in its shadow it is shadow, not dirt)
    if (h.tone < 2) return 0;
    // (the light catching the crest of each muscle, so its swell reads)
    if (h.tone === 3 && h.nl > 0.82) return 1;
    // (rough: lighter flecks where the light is full on it, catching the grain of the hide)
    if (h.tone >= 3 && noise3(a * 0.55 + sd, b * 0.55 + 9, c * 0.55) > 0.74) return 1;
    // (wrinkles and cracks: thin lines where a noise crosses its middle)
    if (Math.abs(noise3(a * 0.3 + sd, b * 0.3, c * 0.3) - 0.5) < 0.022) return -1;
    // (old scars and blotches, few)
    if (noise3(a * 0.16 + 40 + sd, b * 0.16, c * 0.16) > 0.8) return -1;
    return 0;
  };
  const face = look.face ?? 'beast';
  const FACE_LIT = new Set(['brow', 'snout', 'nose', 'cheek', 'chin', 'jaw', 'crest', 'leaf', 'jowl']);
  /** (where its eyes burn: the hide round them lit by them) */
  const eyeSpill: { c: V3; r: number }[] = [];
  const hide = sc.mat({
    ramp: hide5,
    crease: 0.8,
    paint: (h) => {
      const p = h.prim;
      for (const e of eyeSpill) {
        const d = len(sub(h.p, e.c)) / e.r;
        if (d < 1) return d < 0.75 ? CYAN[0] : '#123c4e';
      }
      // (the pact's cracks of light on its LEFT arm only, his demon arm, as on him)
      if (p.k === 'cone' && (p.tag === 'fore' || p.tag === 'upper') && p.piece === 'armL') {
        const { t, around } = onCone(p, h.p, U);
        const zig = Math.sin(t * 20 + around * 1.3) * 0.32;
        if (Math.abs(around - 0.5 - zig) < 0.14) return h.tone >= 2 ? CYAN[3] : CYAN[2];
      }
      if (p.tag === 'chest') {
        // a crack branching down over its heart
        const v = sub(h.p, chestRef);
        const cu = C.way('chest', U);
        const cl = C.way('chest', L0);
        const down = -dot(v, cu);
        const across = dot(v, cl);
        if (down > -1 && down < 12 && Math.abs(across - Math.sin(down * 0.7) * 1.6 - down * 0.25) < 0.55) return h.tone >= 2 ? CYAN[3] : CYAN[2];
      }
      // (the ridges of its face catching the light, so the face reads at its size: its brow, its muzzle, its cheekbones)
      if (face !== 'was' && p.tag && FACE_LIT.has(p.tag) && h.tone >= 2 && h.nl > 0.62) return tone5(hide5, h.tone + 1);
      const r = rough(h) + (farPiece(p.piece) ? -1 : 0);
      return r ? tone5(hide5, h.tone + r) : null;
    },
  });
  const headU = C.way('head', U);
  const horn = sc.mat({
    ramp: IVORY,
    paint: (h) => {
      if (h.prim.k !== 'cone') return null;
      const { t } = onCone(h.prim as Cone, h.p, headU);
      return Math.floor(t * 3.4 + (h.prim.tag === 'ring' ? 0.5 : 0)) % 2 === 0 ? tone5(IVORY, h.tone - 1) : null;
    },
  });
  const bone = sc.mat({ ramp: IVORY });
  const steel = sc.mat({ ramp: STEEL5 });
  const mouth = sc.mat({ ramp: ['#120206', '#2a0610', '#3e0a16', '#5a1220', '#7a1c2a'] });
  const plate = sc.mat({ ramp: ['#100c16', '#241e2c', '#3e3646', '#6e6478', '#9a90a6'] });
  const shagMat = (h: { x: number; y: number; tone: number }): string | null => ((h.x * 2 + (h.y >> 1)) % 5 === 0 ? tone5(hide5, h.tone - 2) : (h.x + h.y * 3) % 7 === 0 ? tone5(hide5, h.tone - 1) : null);

  // ---- THE TRUNK (carried by its belly, chest, the top of its back and its hips)
  // (one body, its muscles grown into each other with a groove where each meets the next, not balls stuck together: rule 9)
  G = grow.body;
  Z.ell(hide, 'torso', at('belly', P(5, 0, 50)), X('belly', 10.5, 11, 10), 2.2, { tag: 'belly' });
  Z.ell(hide, 'torso', at('chest', P(9, 0, 62)), X('chest', 12.5, 16, 12), 2.4, { tag: 'chest' });
  for (const side of [1, -1]) {
    // its breast: slabs over the ribs, a groove down between them, their outer edge rolling up into the armpit
    Z.ell(hide, 'torso', at('chest', P(17.5, side * 8.2, 64.5)), X('chest', 4.6, 8.4, 6.2), 0.9, { tag: 'chest' });
    Z.cone(hide, 'torso', at('chest', P(16, side * 12, 63)), at('chest', P(12, side * 17.5, 69)), 4.2, 3.2, 1.0, { tag: 'chest' });
    // the collarbone, a ridge from the throat out to the shoulder
    Z.cone(hide, 'torso', at('chest', P(19, side * 2.5, 72)), at('chest', P(13, side * 17, 75)), 1.7, 1.4, 0.8, { tag: 'clavicle' });
    // fingers of muscle down its flanks under the breast, the flanks' slabs, the lats flaring under the arms
    for (let i = 0; i < 3; i++) Z.ell(hide, 'torso', at('chest', P(12.5 - i * 0.8, side * (14.8 - i * 0.4), 57 - i * 4)), X('chest', 2.4, 2.0, 1.6), 0.5, { tag: 'serratus' });
    Z.ell(hide, 'torso', at('belly', P(6, side * 11, 45)), X('belly', 5.5, 3.6, 6.5), 1.2, { tag: 'oblique' });
    Z.ell(hide, 'torso', at('upper', P(-5, side * 14, 62)), X('upper', 6, 4.2, 10), 1.4, { tag: 'lat' });
  }
  // its belly, three rows of muscle, a groove between each
  for (const up of [41.5, 47.5, 53.5]) for (const side of [1, -1]) Z.ell(hide, 'torso', at('belly', P(14.4 - (53.5 - up) * 0.05, side * 4.3, up)), X('belly', 2.8, 3.8, 2.7), 0.6, { tag: 'abs' });
  Z.ell(hide, 'torso', at('upper', P(-3, 0, 75)), X('upper', 8.5, 13, 7), 2.4, { tag: 'hump' });
  for (const side of [1, -1]) Z.ell(hide, 'torso', at('upper', P(2, side * 12, 75)), X('upper', 7, 7.5, 6.5), 1.6, { tag: 'trap' });
  // the knuckles of its backbone down the hump, under its spines
  for (let i = 0; i < 5; i++) Z.ell(hide, 'torso', at('upper', P(-11.5 + i * 0.2, 0, 80 - i * 4.5)), X('upper', 2.2, 2.6, 2.0), 0.6, { tag: 'backbone' });
  Z.ell(hide, 'hips', at('hips', P(-2, 0, 44)), X('hips', 9.5, 11, 8), 2.2, { tag: 'pelvis' });
  G = grow.spines;
  for (let i = 0; i < 6; i++) {
    const r: Region = i < 3 ? 'upper' : 'chest';
    const p0 = P(-14 - i * 0.6, 0, 78 - i * 6.6);
    const tip = add(p0, add(mul(F0, -9 + i * 0.6), mul(U, 6 - i * 0.6)));
    Z.cone(bone, 'spines', at(r, p0), at(r, tip), 3.0 - i * 0.25, 0.2, 0.6, { tag: 'spine' });
  }
  // a rag of his coat round its loins, its red hem
  G = grow.rag;
  const rag = sc.mat({ ramp: ['#0a0816', '#161226', '#262040', '#3c345a', '#58507c'], paint: (h) => (dot(sub(h.p, s.pelvis), C.way('hips', U)) < -11 ? ['#22040c', '#420a16', '#6e1420', '#a02a2c', '#c84a3e'][Math.max(0, Math.min(4, h.tone))] : null) });
  const hipU = C.way('hips', U);
  Z.cone(rag, 'hips', at('hips', P(-1, 0, 48)), at('hips', P(1, 0, 30)), 13.5, 16.5, 1.6, { tag: 'rag', cuts: [{ n: mul(hipU, -1) as V3, o: -dot(hipU, at('hips', P(1, 0, 30))) }] });
  Z.ell(rag, 'hips', at('hips', P(-1, 0, 46)), X('hips', 12.5, 13.5, 4), 1.0, { tag: 'rag' });
  for (let i = 0; i < 14; i++) {
    const ang = (i / 14) * Math.PI * 2;
    const deep = 3 + ((i * 7) % 5);
    Z.ell(rag, 'hips', at('hips', P(Math.cos(ang) * 15.5, Math.sin(ang) * 17.5, 30)), X('hips', 2.2, 2.2, deep), 0.3, { carve: true });
  }

  // ---- THE HEAD (carried by its head): hung low and forward under the hump
  const HK = 1.18;
  G = grow.head;
  Z.cone(hide, 'head', at('upper', P(10, 0, 74)), at('head', P(28, 0, 72)), 8, 6.5, 2.6, { tag: 'neck' });
  // the cords of its neck, from behind its jaw down to its throat
  for (const side of [1, -1]) Z.cone(hide, 'head', at('head', P(25, side * 6.5, 66)), at('chest', P(18, side * 3, 70)), 3.0, 2.2, 1.2, { tag: 'neckcord' });
  /** a line of the head's own (forward, left, up), carried by the head */
  const hw = (f: number, l: number, u: number): V3 => C.way('head', norm([f, l, u]));
  const glow = sc.mat({ ramp: CYAN, paint: (h) => (h.tone >= 2 ? '#e8ffff' : CYAN[2]) });
  const earSkin = sc.mat({ ramp: ['#120408', '#2a0a12', '#45121c', '#6c242a', '#94403a'] });
  const gum = sc.mat({ ramp: ['#2a0610', '#5a1220', '#8a2030', '#b83a44', '#d8606a'] });
  /** (its face a size bigger than the head that was: its face is what is looked at) */
  const FACE_K = 1.25;
  /** an eye burning in its socket: a slanted lens of the friend's cyan, its outer corner up (a scowl), a white-hot core */
  const eyeAt = (side: number, c: V3, long: number, tall: number, slant: number): void => {
    Z.ell(glow, 'head', at('head', c), [mul(hw(1, 0, 0), 0.9 * K()), mul(hw(0, side, slant), long * K()), mul(hw(0, -side * slant, 1), tall * K())], 0.05, { tag: 'eye' });
    eyeSpill.push({ c: at('head', c), r: (long + 0.9) * K() });
    sc.mark(at('head', add(c, P(0.9, side * 0.4, 0))), '#ffffff', 1, 1, 0, 0, 2.5);
  };
  if (face === 'was') {
    Z.ell(hide, 'head', at('head', P(28, 0, 72)), X('head', 9 * HK, 9.5 * HK, 9.5 * HK), 2.0, { tag: 'skull' });
    Z.ell(hide, 'head', at('head', P(34, 0, 75.5)), X('head', 4.6, 10, 3), 0.8, { tag: 'brow' });
    Z.box(hide, 'head', at('head', P(35, 0, 67.5)), X('head', 6, 7.6, 4.0), 2.2, 1.0, { tag: 'snout' });
    Z.box(hide, 'jaw', at('head', P(35, 0, 59.5)), X('head', 7, 8.6, 3.0), 1.8, 1.0, { tag: 'jaw' });
    for (const side of [1, -1]) Z.ell(hide, 'head', at('head', P(31, side * 8.5, 70)), X('head', 4, 3, 4.5), 1.0, { tag: 'cheek' });
    Z.ell(mouth, 'jaw', at('head', P(37, 0, 63.8)), X('head', 5.2, 6.4, 2.4), 0.6, { tag: 'maw' });
    for (const [fx, fl, up] of [[41.5, 4, 1], [41.5, -4, 1], [39, 6, 1], [39, -6, 1], [42, 2, -1], [42, -2, -1], [40, 5, -1], [40, -5, -1]] as const) {
      const root = P(fx, fl, up > 0 ? 66 : 61.5);
      Z.cone(bone, 'jaw', at('head', root), at('head', add(root, mul(U, -up * 3.2))), 0.9, 0.05, 0.1, { tag: 'fang' });
    }
    for (const side of [1, -1]) Z.cone(hide, 'head', at('head', P(22, side * 8, 76)), at('head', P(16, side * 15, 80)), 2.2, 0.3, 0.8, { tag: 'ear' });
    for (const side of [1, -1]) {
      sc.mark(at('head', P(37, side * 4.6, 72.6)), '#ffffff', 2, 1, side > 0 ? 0 : -1, 0, 3);
      sc.mark(at('head', P(37, side * 4.6, 72.6)), CYAN[3], 2, 1, side > 0 ? 2 : -3, -1, 3);
    }
  } else if (face === 'beast') {
    // A BEAST'S FACE IN A SNARL: a skull swept back, a heavy brow in a V over eyes burning deep under it, cheekbones like
    // blades, a long muzzle wrinkled back off its teeth, its jaws wide, tusks up out of the underjaw, hellfire in its throat
    G = grow.head * FACE_K;
    Z.ell(hide, 'head', at('head', P(26, 0, 73.5)), X('head', 8.6 * HK, 8.8 * HK, 8.4 * HK), 2.0, { tag: 'skull' });
    for (const side of [1, -1]) {
      // the brow, a shelf of bone under the hide, low at the bridge and high at the temple: a scowl
      Z.cone(hide, 'head', at('head', P(33.5, side * 10, 78.8)), at('head', P(40.2, side * 1.8, 74.6)), 3.2, 2.5, 1.0, { tag: 'brow' });
      // its socket, dug in under the brow
      Z.ell(hide, 'head', at('head', P(39.4, side * 4.8, 72.2)), X('head', 2.5, 3.0, 1.9), 0.4, { carve: true });
      // the cheekbone, a blade from under the ear to under the eye
      Z.cone(hide, 'head', at('head', P(31.5, side * 10.2, 70.5)), at('head', P(39.5, side * 6.4, 69.2)), 2.6, 1.4, 0.9, { tag: 'cheek' });
    }
    Z.ell(hide, 'head', at('head', P(40.2, 0, 74.4)), X('head', 2.2, 2.6, 2.0), 0.8, { tag: 'brow' });
    // the muzzle, long, tapering to a flat nose, wrinkled back across its bridge in the snarl, its nostrils flared
    Z.cone(hide, 'head', at('head', P(34, 0, 70)), at('head', P(48, 0, 67.8)), 6.2, 3.6, 1.6, { tag: 'snout' });
    Z.ell(hide, 'head', at('head', P(48.6, 0, 68.6)), X('head', 2.4, 3.6, 2.3), 0.9, { tag: 'nose' });
    for (const side of [1, -1]) Z.ell(hide, 'head', at('head', P(50.6, side * 1.7, 68.4)), X('head', 1.0, 0.9, 0.7), 0.2, { carve: true });
    for (const [fx, fz] of [[41.4, 73], [43.5, 72.2], [45.6, 71.4]] as const) Z.ell(hide, 'head', at('head', P(fx, 0, fz)), X('head', 0.55, 4.2, 0.7), 0.2, { carve: true });
    // the underjaw dropped wide open, heavy, a chin like a fist, spurs of bone back along its edge
    Z.cone(hide, 'jaw', at('head', P(31, 0, 62)), at('head', P(46, 0, 57.4)), 4.8, 2.9, 1.0, { tag: 'jaw' });
    Z.ell(hide, 'jaw', at('head', P(46.2, 0, 56.6)), X('head', 2.5, 3.3, 2.3), 0.8, { tag: 'chin' });
    for (const side of [1, -1]) for (const [fx, ln] of [[36, 4.2], [31.5, 3.4]] as const) Z.cone(bone, 'jaw', at('head', P(fx, side * 5.6, 57.8)), at('head', P(fx - ln * 0.8, side * 7.4, 57.8 - ln)), 1.0, 0.1, 0.3, { tag: 'spur' });
    // the maw between, its gums raw, the fire in its throat
    Z.ell(mouth, 'jaw', at('head', P(40.5, 0, 61.6)), X('head', 6.2, 4.6, 3.2), 0.6, { tag: 'maw' });
    Z.ell(gum, 'head', at('head', P(43.5, 0, 64.6)), X('head', 5.2, 3.9, 1.1), 0.4, { tag: 'gum' });
    Z.ell(glow, 'jaw', at('head', P(36.8, 0, 62)), X('head', 1.8, 2.6, 1.6), 0.3, { tag: 'throat' });
    // its teeth: great fangs down from the upper jaw, tusks up from the lower, outside its lip
    const toothFrom = (root: V3, tip: V3, r: number): void => Z.cone(bone, 'jaw', at('head', root), at('head', tip), r, 0.05, 0.1, { tag: 'fang' });
    for (const side of [1, -1]) {
      toothFrom(P(46, side * 3.2, 65), P(46.6, side * 3.0, 59.2), 1.15);
      toothFrom(P(43.4, side * 4.2, 64.8), P(43.7, side * 4.1, 61.8), 0.8);
      toothFrom(P(40.8, side * 4.8, 64.6), P(41, side * 4.8, 62.4), 0.65);
      toothFrom(P(48, side * 1.2, 65), P(48.2, side * 1.1, 63.2), 0.6);
      toothFrom(P(46.8, side * 3.9, 58.2), P(48, side * 4.6, 64.6), 1.2);
      toothFrom(P(43.6, side * 4.5, 59.2), P(43.8, side * 4.6, 61.8), 0.7);
      toothFrom(P(41, side * 4.8, 59.8), P(41.2, side * 4.9, 62), 0.6);
    }
    // ears swept back like blades
    for (const side of [1, -1]) Z.cone(hide, 'head', at('head', P(25, side * 8.6, 77)), at('head', P(13, side * 15.5, 81)), 2.5, 0.3, 0.8, { tag: 'ear' });
    for (const side of [1, -1]) eyeAt(side, P(38.4, side * 4.8, 72.1), 2.4, 1.1, 0.45);
  } else if (face === 'brute') {
    // A BRUTE'S FACE, THE APE'S OF ITS BODY: a crest along its skull, one great bar of brow over small eyes burning deep, a
    // broad flat nose with flared nostrils, a jutting underjaw, two tusks up past its nose, spines bristling under its chin
    G = grow.head * FACE_K;
    Z.ell(hide, 'head', at('head', P(25, 0, 74)), X('head', 8.4 * HK, 9.6 * HK, 8.4 * HK), 2.0, { tag: 'skull' });
    Z.cone(hide, 'head', at('head', P(17, 0, 83)), at('head', P(33, 0, 81)), 2.2, 1.0, 1.0, { tag: 'crest' });
    for (const side of [1, -1]) {
      Z.cone(hide, 'head', at('head', P(35, side * 11.4, 78.4)), at('head', P(41.4, side * 0.6, 76.6)), 3.2, 2.8, 1.0, { tag: 'brow' });
      Z.ell(hide, 'head', at('head', P(40.6, side * 4.6, 72.8)), X('head', 2.2, 2.6, 1.6), 0.4, { carve: true });
      // heavy pads of cheek either side of the nose
      Z.ell(hide, 'head', at('head', P(37.5, side * 8.4, 68.4)), X('head', 3.4, 3.2, 3.6), 1.0, { tag: 'cheek' });
    }
    Z.ell(hide, 'head', at('head', P(41.6, 0, 76.2)), X('head', 2.6, 3.0, 2.4), 0.8, { tag: 'brow' });
    // the broad flat nose, its bridge wrinkled back, its nostrils great flared holes
    Z.ell(hide, 'head', at('head', P(42.5, 0, 69)), X('head', 4.4, 6.2, 4.2), 1.2, { tag: 'snout' });
    Z.ell(hide, 'head', at('head', P(46.2, 0, 68.6)), X('head', 2.2, 4.8, 2.6), 0.8, { tag: 'nose' });
    for (const side of [1, -1]) Z.ell(hide, 'head', at('head', P(48, side * 2.3, 68.2)), X('head', 1.4, 1.4, 1.1), 0.2, { carve: true });
    for (const fz of [72.6, 71.2]) Z.ell(hide, 'head', at('head', P(43.6, 0, fz)), X('head', 0.5, 4.6, 0.6), 0.2, { carve: true });
    // the underjaw, broad and jutting past the upper, a chin like an anvil
    Z.cone(hide, 'jaw', at('head', P(30, 0, 61.6)), at('head', P(46.6, 0, 60.4)), 5.2, 4.2, 1.0, { tag: 'jaw' });
    Z.ell(hide, 'jaw', at('head', P(47.2, 0, 60)), X('head', 2.6, 5.6, 2.8), 0.8, { tag: 'chin' });
    for (const side of [-1, 0, 1]) Z.cone(bone, 'jaw', at('head', P(44, side * 2.6, 57.2)), at('head', P(42, side * 3.2, 52.8)), 1.0, 0.1, 0.3, { tag: 'spur' });
    // the maw, wide; the gums of its upper jaw; the fire in its throat
    Z.ell(mouth, 'jaw', at('head', P(43.6, 0, 63.6)), X('head', 3.4, 5.8, 1.3), 0.4, { tag: 'maw' });
    const toothFrom = (root: V3, tip: V3, r: number): void => Z.cone(bone, 'jaw', at('head', root), at('head', tip), r, 0.05, 0.1, { tag: 'fang' });
    for (const side of [1, -1]) {
      // the tusks, up out of the underjaw outside its lip, hooked in at the tip
      Z.cone(bone, 'jaw', at('head', P(47.2, side * 4.8, 60.6)), at('head', P(48.8, side * 5.8, 65.4)), 1.7, 1.1, 0.3, { tag: 'tusk' });
      Z.cone(bone, 'jaw', at('head', P(48.8, side * 5.8, 65.4)), at('head', P(48.2, side * 5.0, 70.2)), 1.1, 0.1, 0.2, { tag: 'tusk' });
      for (const l of [0.9, 2.5]) toothFrom(P(48.4, side * l, 61.8), P(48.6, side * l, 64.2), 0.75);
      for (const l of [1.0, 2.7, 4.3]) toothFrom(P(46.6 - l * 0.35, side * l, 65.6), P(46.8 - l * 0.35, side * l, 63.2), 0.75);
    }
    for (const side of [1, -1]) Z.cone(hide, 'head', at('head', P(28, side * 10, 74)), at('head', P(21, side * 14.5, 76.5)), 2.2, 0.3, 0.8, { tag: 'ear' });
    for (const side of [1, -1]) eyeAt(side, P(39.8, side * 4.6, 72.8), 2.0, 0.95, 0.35);
  } else if (face === 'bat') {
    // A BAT'S FACE, THE BAT OF ITS WINGS: great ears swept back, a pug snout with a leaf of hide standing up off its nose,
    // wrinkled jowls, its jaws gaping, long needle fangs
    G = grow.head * FACE_K;
    Z.ell(hide, 'head', at('head', P(25, 0, 74)), X('head', 8.2 * HK, 8.8 * HK, 8.6 * HK), 2.0, { tag: 'skull' });
    for (const side of [1, -1]) {
      // the ears: tall, pointed, swept back and out, their hollows facing forward
      const tip = P(22, side * 13, 100);
      const e0 = P(30, side * 5, 80.5);
      const e1 = P(24.5, side * 10.5, 79);
      Z.tri(earSkin, 'head', at('head', e0), at('head', e1), at('head', tip), 0.8, 0.6, { tag: 'ear' });
      Z.cone(hide, 'head', at('head', e0), at('head', tip), 1.9, 0.3, 0.8, { tag: 'ear' });
      Z.cone(hide, 'head', at('head', e1), at('head', tip), 1.7, 0.3, 0.8, { tag: 'ear' });
      Z.cone(hide, 'head', at('head', P(33.5, side * 10, 78.8)), at('head', P(40, side * 1.8, 74.4)), 2.8, 2.2, 1.0, { tag: 'brow' });
      Z.ell(hide, 'head', at('head', P(39.2, side * 4.8, 72.4)), X('head', 2.6, 3.0, 2.0), 0.4, { carve: true });
      // the jowls, wrinkled, drawn back off its teeth
      Z.ell(hide, 'head', at('head', P(37, side * 7.4, 66.6)), X('head', 3.2, 2.8, 3.4), 1.0, { tag: 'jowl' });
    }
    // the pug snout, short and upturned; the leaf of hide standing up off its nose like a spearhead; its nostrils
    Z.ell(hide, 'head', at('head', P(41, 0, 68.6)), X('head', 4, 5, 3.8), 1.2, { tag: 'snout' });
    Z.tri(hide, 'head', at('head', P(44.8, 3.0, 69.4)), at('head', P(44.8, -3.0, 69.4)), at('head', P(43.6, 0, 78.4)), 0.8, 0.6, { tag: 'leaf' });
    Z.cone(hide, 'head', at('head', P(44.9, 0, 69.6)), at('head', P(43.7, 0, 77.6)), 1.3, 0.3, 0.6, { tag: 'leaf' });
    for (const side of [1, -1]) Z.ell(hide, 'head', at('head', P(45.2, side * 1.4, 68.2)), X('head', 0.9, 0.9, 0.8), 0.2, { carve: true });
    // the underjaw dropped wide, gaping
    Z.cone(hide, 'jaw', at('head', P(30, 0, 62.4)), at('head', P(43.6, 0, 56.4)), 4.4, 2.6, 1.0, { tag: 'jaw' });
    Z.ell(hide, 'jaw', at('head', P(43.8, 0, 55.8)), X('head', 2.2, 3.0, 2.0), 0.8, { tag: 'chin' });
    Z.ell(mouth, 'jaw', at('head', P(39.4, 0, 61.2)), X('head', 4.8, 4.6, 4.2), 0.6, { tag: 'maw' });
    Z.ell(gum, 'head', at('head', P(41.6, 0, 65.2)), X('head', 3.6, 4.2, 1.0), 0.4, { tag: 'gum' });
    Z.ell(glow, 'jaw', at('head', P(36.4, 0, 61.4)), X('head', 1.8, 2.6, 2.0), 0.3, { tag: 'throat' });
    const toothFrom = (root: V3, tip: V3, r: number): void => Z.cone(bone, 'jaw', at('head', root), at('head', tip), r, 0.05, 0.1, { tag: 'fang' });
    for (const side of [1, -1]) {
      toothFrom(P(43.4, side * 2.8, 65.6), P(43.8, side * 2.6, 59.4), 1.0);
      toothFrom(P(42.4, side * 3.1, 57.2), P(42.9, side * 3.2, 62.6), 0.9);
      for (const [f, l] of [[44.6, 1.0], [41.2, 3.9], [39.2, 4.6]] as const) toothFrom(P(f, side * l, 65.2), P(f + 0.1, side * l, 63.2), 0.5);
      for (const [f, l] of [[43.8, 1.1], [40.4, 3.8], [38.4, 4.4]] as const) toothFrom(P(f - 0.6, side * l, 57.8 + (44 - f) * 0.35), P(f - 0.5, side * l, 59.8 + (44 - f) * 0.35), 0.5);
    }
    for (const side of [1, -1]) eyeAt(side, P(38.4, side * 4.8, 72.6), 2.3, 1.2, 0.5);
  } else {
    // A FACE OF BARE BONE: the skull of a beast through its hide, the sockets deep and burning, no lips, all its teeth
    G = grow.head * FACE_K;
    Z.ell(hide, 'head', at('head', P(26, 0, 73.5)), X('head', 8.6 * HK, 9 * HK, 8.6 * HK), 2.0, { tag: 'skull' });
    for (const side of [1, -1]) {
      // the brow in a V, the cheekbone under the socket, the socket dug deep between them
      Z.cone(bone, 'head', at('head', P(33.5, side * 10, 78.6)), at('head', P(40.4, side * 1.6, 74.8)), 2.8, 2.3, 0.9, { tag: 'mask' });
      Z.cone(bone, 'head', at('head', P(31.5, side * 10.2, 70.5)), at('head', P(40.2, side * 5.4, 68.2)), 2.5, 1.7, 0.9, { tag: 'mask' });
      Z.cone(bone, 'head', at('head', P(34, side * 9.8, 77.6)), at('head', P(32.5, side * 10.4, 71.4)), 2.0, 2.0, 0.9, { tag: 'mask' });
      Z.ell(bone, 'head', at('head', P(39.8, side * 4.8, 72.4)), X('head', 2.8, 3.0, 2.3), 0.4, { carve: true });
    }
    // the long bone of its snout, the hole of its nose at the end
    Z.cone(bone, 'head', at('head', P(36, 0, 71.6)), at('head', P(48, 0, 67.6)), 4.4, 2.5, 1.2, { tag: 'mask' });
    Z.ell(bone, 'head', at('head', P(48.4, 0, 69.2)), X('head', 1.5, 1.3, 1.3), 0.2, { carve: true });
    // its jaw of bone, open; the maw dark behind its teeth
    Z.cone(bone, 'jaw', at('head', P(31, 0, 61.6)), at('head', P(46.5, 0, 57.8)), 3.8, 2.3, 0.9, { tag: 'mask' });
    Z.ell(mouth, 'jaw', at('head', P(40, 0, 62.2)), X('head', 6, 4.4, 3), 0.6, { tag: 'maw' });
    Z.ell(glow, 'jaw', at('head', P(36.8, 0, 62.4)), X('head', 1.8, 2.6, 1.6), 0.3, { tag: 'throat' });
    for (let i = 0; i < 5; i++) {
      for (const side of [1, -1]) {
        const f = 47.4 - i * 1.9;
        const l = side * (1.2 + Math.min(i, 2) * 1.3 + Math.max(0, i - 2) * 0.35);
        const long = i === 1 ? 1.5 : 1;
        Z.cone(bone, 'jaw', at('head', P(f, l, 65.4)), at('head', P(f + 0.2, l, 65.4 - 2.6 * long)), 0.75 * Math.sqrt(long), 0.1, 0.1, { tag: 'fang' });
        Z.cone(bone, 'jaw', at('head', P(f - 0.6, l * 0.96, 58.8 + i * 0.4)), at('head', P(f - 0.3, l * 0.96, 61.2 + i * 0.4 + (i === 1 ? 1.6 : 0))), 0.7, 0.1, 0.1, { tag: 'fang' });
      }
    }
    for (const side of [1, -1]) Z.cone(hide, 'head', at('head', P(25, side * 8.6, 77)), at('head', P(13, side * 15.5, 81)), 2.5, 0.3, 0.8, { tag: 'ear' });
    for (const side of [1, -1]) {
      eyeAt(side, P(38.8, side * 4.8, 72.3), 1.9, 1.4, 0.25);
      // the fire in each socket licking up out of it
      sc.mark(at('head', P(40, side * 4.8, 74.8)), CYAN[2], 1, 1, 0, 0, 1.5);
      sc.mark(at('head', P(40, side * 4.4, 76.4)), CYAN[3], 1, 1, 0, -1, 1.5);
    }
  }
  G = grow.horns;
  for (const side of [1, -1]) {
    const pts = [P(27, side * 7, 80), P(27, side * 15, 84), P(33, side * 22, 88), P(43, side * 23, 88), P(51, side * 19, 84)].map((p) => at('head', p));
    let r = 4.4;
    for (let i = 0; i < pts.length - 1; i++) {
      Z.cone(horn, 'horns', pts[i], pts[i + 1], r, Math.max(0.3, r - 1.05), 0.8, { tag: i % 2 ? 'ring' : 'h' });
      r = Math.max(0.3, r - 1.05);
    }
  }

  // ---- THE ARMS, on its arms' joints: a shoulder like a boulder under a crest of bone plates and a spike; forearms like
  // trunks, spines and plates down them; a broken shackle at each wrist; hands like shovels; long hooked claws
  let fireAt: V3 | null = null;
  const floorFires: V3[] = [];
  const back = C.way('upper', mul(F0, -1) as V3);
  for (const side of [1, -1] as const) {
    const piece = side > 0 ? 'armL' : 'armR';
    // (its fire in its LEFT claw, raised, as his is; its right planted: his word, 26 Oct, “Also I think we want the plant
    // are to be the right arm.  That keeps the flame in the left for both transformations”)
    const raised = side > 0 && (side > 0 ? s.handL : s.handR)[2] >= 14;
    const sh = side > 0 ? s.shoulderL : s.shoulderR;
    const el = side > 0 ? s.elbowL : s.elbowR;
    const ha = side > 0 ? s.handL : s.handR;
    G = grow.body;
    // (each length of the arm's own ways: down it, forward off it, out from the body)
    const Fw = C.way('upper', F0);
    const outA = C.way('upper', mul(L0, side) as V3);
    const frame = (a: V3, b: V3): [V3, V3, V3] => {
      const d = norm(sub(b, a));
      const fw = norm(sub(Fw, mul(d, dot(Fw, d))));
      const o = cross(d, fw);
      return [d, fw, dot(o, outA) < 0 ? (mul(o, -1) as V3) : o];
    };
    const [ad, f1, o1] = frame(sh, el);
    const [fd, f2, o2] = frame(el, ha);
    const k = K();
    // the shoulder: a boulder of muscle wrapping over the top of the arm, its heads to the side and the front
    Z.ell(hide, piece, sh, X('upper', 7.2, 7.4, 7.0), 1.6, { tag: 'delt' });
    Z.ell(hide, piece, add(sh, add(mul(ad, 5 * k), mul(o1, 3.2 * k))), [mul(ad, 7 * k), mul(o1, 4.6 * k), mul(f1, 6.2 * k)], 1.0, { tag: 'delt' });
    Z.ell(hide, piece, add(sh, add(mul(ad, 3.5 * k), mul(f1, 4.2 * k))), [mul(ad, 6 * k), mul(o1, 4.4 * k), mul(f1, 4 * k)], 0.9, { tag: 'delt' });
    // the upper arm, its biceps in front and triceps behind, a groove between
    Z.cone(hide, piece, sh, lerp3(sh, el, 0.5), 6.0, 6.4, 1.4, { tag: 'upper' });
    Z.cone(hide, piece, lerp3(sh, el, 0.5), el, 6.4, 5.2, 1.4, { tag: 'upper' });
    Z.ell(hide, piece, add(lerp3(sh, el, 0.55), mul(f1, 3.4 * k)), [mul(ad, 8.5 * k), mul(o1, 4.6 * k), mul(f1, 4.2 * k)], 0.8, { tag: 'bicep' });
    Z.ell(hide, piece, add(lerp3(sh, el, 0.42), mul(f1, -3.6 * k)), [mul(ad, 9.5 * k), mul(o1, 4.8 * k), mul(f1, 4.4 * k)], 0.8, { tag: 'tricep' });
    // the point of the elbow, bone under the hide
    Z.cone(hide, piece, add(el, mul(f1, -3 * k)), add(el, add(mul(f1, -7.5 * k), mul(ad, 1.5 * k))), 3.0, 0.8, 0.8, { tag: 'elbowpoint' });
    // the forearm, thick under the elbow, its muscles twisting down to the wrist
    Z.cone(hide, piece, el, lerp3(el, ha, 0.35), 5.8, 6.8, 1.4, { tag: 'fore' });
    Z.cone(hide, piece, lerp3(el, ha, 0.35), ha, 6.8, 4.6, 1.4, { tag: 'fore' });
    Z.ell(hide, piece, add(lerp3(el, ha, 0.28), add(mul(o2, 3.2 * k), mul(f2, 2 * k))), [mul(fd, 8 * k), mul(o2, 4.2 * k), mul(f2, 4.2 * k)], 0.8, { tag: 'foreBulge' });
    Z.ell(hide, piece, add(lerp3(el, ha, 0.32), add(mul(o2, -3 * k), mul(f2, -1.6 * k))), [mul(fd, 7.5 * k), mul(o2, 3.6 * k), mul(f2, 3.8 * k)], 0.8, { tag: 'foreBulge' });
    // ITS SHOULDERS: curved spikes of horn growing up and back out of each, hooked at the tip (his word, 26 Oct: “And the
    // lumpy things on his shoulders”: the crest of plates is gone)
    const shRest = side > 0 ? REST.shoulderL : REST.shoulderR;
    G = grow.plates;
    const over = (p: V3): V3 => add(sh, C.way('upper', mul(sub(p, shRest), K())));
    for (const [up, out, back, lng, rad] of [[6, 2, 0, 1.0, 2.7], [4.5, 6, -2, 0.72, 2.0], [6.5, -1.5, 4, 0.62, 1.8]] as const) {
      const b0 = add(shRest, add(mul(U, up), add(mul(L0, side * out), mul(F0, -back))));
      const w = norm(add(U, add(mul(L0, side * 0.5), mul(F0, -0.6))));
      const m0 = add(b0, mul(w, 6.5 * lng));
      const tip = add(m0, add(mul(w, 4 * lng), add(mul(F0, -4 * lng), mul(U, -1 * lng))));
      Z.cone(horn, piece, over(b0), over(m0), rad, rad * 0.55, 0.6, { tag: 'spike' });
      Z.cone(horn, piece, over(m0), over(tip), rad * 0.55, 0.12, 0.3, { tag: 'spike' });
    }
    // spines and plates down the forearm
    const out = C.way('upper', mul(L0, side) as V3);
    for (let i = 1; i <= 3; i++) {
      const p = lerp3(el, ha, 0.15 + i * 0.2);
      G = grow.spines;
      Z.cone(bone, piece, add(p, mul(back, 4.8 * K())), add(p, add(mul(back, (11.5 - i * 2) * K()), mul(U, 2 * K()))), 2.0, 0.2, 0.5, { tag: 'spine' });
      G = grow.plates;
      Z.ell(plate, piece, add(lerp3(el, ha, 0.2 + i * 0.2), mul(out, 6.8 * K())), X('upper', 3.8, 2.1, 3.2), 0.6, { tag: 'plate' });
    }
    // the broken shackle and its chain
    G = grow.shackles;
    const cuff = lerp3(ha, el, 0.2);
    const fa = norm(sub(ha, el));
    // (a cuff of iron, not a plain ring (rule 9): flared to its hand, riveted round, a hinge on one side and its latch
    // snapped open on the other)
    Z.cone(steel, piece, add(cuff, mul(fa, -1.8 * K())), add(cuff, mul(fa, 1.8 * K())), 6.1, 6.7, 0.4, { tag: 'shackle' });
    {
      const k = K();
      const r1 = norm(cross(fa, Math.abs(fa[2]) < 0.9 ? U : F0));
      const r2 = cross(fa, r1);
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * Math.PI * 2 + 0.5;
        const d = add(mul(r1, Math.cos(a)), mul(r2, Math.sin(a)));
        Z.ell(steel, piece, add(cuff, mul(d, 6.5 * k)), [mul(d, 0.8 * k), mul(fa, 0.9 * k), mul(cross(fa, d), 0.9 * k)], 0.2, { tag: 'rivet' });
      }
      Z.cone(steel, piece, add(cuff, add(mul(r1, 6.9 * k), mul(fa, -2.1 * k))), add(cuff, add(mul(r1, 6.9 * k), mul(fa, 2.1 * k))), 1.5, 1.5, 0.3, { tag: 'hinge' });
      Z.cone(steel, piece, add(cuff, mul(r1, -6.3 * k)), add(cuff, add(mul(r1, -9.4 * k), add(mul(fa, 1.4 * k), mul(r2, 1.2 * k)))), 1.5, 0.6, 0.3, { tag: 'latch' });
    }
    const fwd = C.way('upper', F0);
    // (its broken chain hanging from the cuff; where it reaches the floor, lying along it, not through it)
    const flatF = norm([fwd[0], fwd[1], 0], F0);
    for (let i = 0; i < 3; i++) {
      let p = add(cuff, add(mul(U, -(i * 4.6 + 3) * K()), mul(fwd, (3 + i * 0.8) * K())));
      const low = 2.8 * K() + 0.3;
      if (p[2] < low) p = add([p[0], p[1], low], mul(flatF, (low - p[2]) * 0.7));
      Z.ell(steel, piece, p, X('upper', 1.6, i % 2 ? 0.9 : 2.2, 2.6), 0, { tag: 'link' });
    }
    // THE HAND, BUILT AS A HAND (dev/sculpt_demon.ts demonHand)
    G = grow.hands;
    // (a hand off the floor, not raised with the fire: a hand of claws, open; one on the floor planted, its claws spread on it)
    const planted = !raised && ha[2] < 14;
    const fh = norm([s.hips[0][0], s.hips[0][1], 0], F0);
    // (a claw lifted off the floor as it goes, low: its claws spread as on the floor, lifted with it; its fire with it)
    const up = planted ? Math.max(0, ha[2] - PLANT_Z) : 0;
    const fire = K() > 0.05 ? (raised || ha[2] < 14 ? demonHand(sc, hide, bone, piece, ha, el, raised, K(), planted ? fh : undefined, planted && side < 0, up) : (clawHand(sc, hide, bone, piece, ha, el, C.way('upper', F0), K() * 2.7), null)) : null;
    if (fire) fireAt = fire;
    // (a claw flat on the floor burns with its hellfire)
    // (its hellfire burning UNDER its palm and licking out between its fingers along the floor: his word, 27 Oct, “Can we get
    // flames looking like they’re coming out between the fingers from the palm under side”; between each two fingers, and
    // at the edges of its hand, as demonHand lays its fingers out)
    if (planted && K() > 0.05) {
      const S = 1.45 * K();
      const acr = norm(cross(U, fh));
      const thumbW = side < 0 ? acr : (mul(acr, -1) as V3);
      const fan = (deg: number): V3 => norm(add(mul(fh, Math.cos((deg * Math.PI) / 180)), mul(thumbW, Math.sin((deg * Math.PI) / 180))));
      const palmC = add(ha, mul(fh, 1.5 * S));
      for (const g of [48, 22.5, -0.5, -23.5, -48]) floorFires.push(add(palmC, add(mul(fan(g), 6.0 * S), [0, 0, 2.2 + up - palmC[2]])));
    }
  }

  // ---- THE LEGS, on its legs' joints: a goat's, short and thick, coarse hair from the thigh down, a cloven hoof, spurs of
  // bone at the hock
  const shag = sc.mat({ ramp: hide5, paint: shagMat });
  const feet: V3[] = [];
  G = grow.body;
  for (const side of [1, -1] as const) {
    const piece = side > 0 ? 'legL' : 'legR';
    const hip = side > 0 ? s.hipL : s.hipR;
    const knee = side > 0 ? s.kneeL : s.kneeR;
    const hock = side > 0 ? s.ankleL : s.ankleR;
    const toe = side > 0 ? s.toeL : s.toeR;
    const heel = side > 0 ? s.heelL : s.heelR;
    const hoof: V3 = [toe[0], toe[1], toe[2] + 3.4];
    const ff = norm([toe[0] - heel[0], toe[1] - heel[1], 0], F0);
    // the thigh: its great muscle in front, the hamstring behind, the buttock over it, a groove between each
    Z.cone(hide, piece, hip, knee, 7.6, 5.6, 1.6, { tag: 'thigh' });
    {
      const k = K();
      const td = norm(sub(knee, hip));
      const Fh = C.way('hips', F0);
      const f3 = norm(sub(Fh, mul(td, dot(Fh, td))));
      const o3 = cross(td, f3);
      Z.ell(hide, piece, add(lerp3(hip, knee, 0.48), mul(f3, 3.2 * k)), [mul(td, 10 * k), mul(o3, 5 * k), mul(f3, 4.6 * k)], 0.9, { tag: 'quad' });
      Z.ell(hide, piece, add(lerp3(hip, knee, 0.4), mul(f3, -3.4 * k)), [mul(td, 9 * k), mul(o3, 4.6 * k), mul(f3, 4.4 * k)], 0.9, { tag: 'ham' });
      Z.ell(hide, piece, add(hip, add(mul(f3, -5 * k), mul(td, -1 * k))), [mul(td, 6.5 * k), mul(o3, 5.5 * k), mul(f3, 6 * k)], 1.4, { tag: 'glute' });
    }
    Z.cone(shag, piece, knee, hock, 6.0, 3.8, 1.4, { tag: 'shank' });
    Z.cone(shag, piece, hock, hoof, 3.6, 2.8, 1.2, { tag: 'pastern' });
    Z.box(horn, piece, add(hoof, add(mul(ff, 2.0 * K()), [0, 0, 0.3])), [mul(ff, 5.2 * K()), mul(norm(cross(U, ff)), 3.8 * K()), mul(U, 2.7 * K())], 1.4, 0.6, { tag: 'hoof' });
    G = grow.spines;
    Z.cone(bone, piece, add(hock, mul(ff, -2 * K())), add(hock, add(mul(ff, -9 * K()), mul(U, 2 * K()))), 2.0, 0.2, 0.4, { tag: 'spur' });
    G = grow.body;
    feet.push(hoof);
  }
  // ---- THE TAIL (carried by its hips): heavy, from the small of its back down to the floor and away, a hooked spike at its end
  G = grow.tail;
  {
    // (swung from its root, each length of it a little further than the one before: a whip, `look.tail`)
    const sw = look.tail ?? 0;
    const swing = (p: V3, i: number): V3 => {
      const a = sw * (0.5 + i * 0.3);
      const x = p[0] + 14;
      return [-14 + x * Math.cos(a) - p[1] * Math.sin(a), x * Math.sin(a) + p[1] * Math.cos(a), p[2]];
    };
    const pts = [P(-14, 0, 44), P(-26, -6, 30), P(-30, -18, 12), P(-22, -32, 6), P(-12, -40, 10)].map((p, i) => at('hips', swing(p, i)));
    // (lying along the floor where it reaches it, not through it: each joint of it as high as it is thick, at the least)
    const thick = (i: number): number => Math.max(i > 0 ? 3.7 - (i - 1) * 0.85 : 0, i < 4 ? 4.6 - i * 0.9 : 2.4);
    for (let i = 0; i < pts.length; i++) pts[i] = [pts[i][0], pts[i][1], Math.max(pts[i][2], thick(i) * K() + 0.3)];
    for (let i = 0; i + 1 < pts.length; i++) Z.cone(hide, 'tail', pts[i], pts[i + 1], 4.6 - i * 0.9, 3.7 - i * 0.85, 1.4, { tag: 'tail' });
    const tip = at('hips', swing(P(-4, -44, 18), 5));
    Z.cone(horn, 'tail', pts[4], [tip[0], tip[1], Math.max(tip[2], pts[4][2] + 4)], 2.4, 0.2, 0.4, { tag: 'tailspike' });
  }
  // ---- THE WINGS (carried by the top of its back): a bat's, real (batWing: his word of the ten demons, “I really don’t like
  // the wings too.  They just seem like two big flat sails.  Like how the carrion queen felt before the redo”; then “Let’s just
  // keep the one we have for now and work on the wings”)
  const leather = sc.mat({
    ramp: ['#120408', '#2a0a12', '#45121c', '#6c242a', '#94403a'] as Ramp,
    paint: (h) => (h.prim.tag === 'vein' ? tone5(['#0a0306', '#170609', '#260b12', '#3c141b', '#561f24'], h.tone) : null),
  });
  G = grow.wings;
  if (K() > 0.02) {
    // (its wings stand up off its back however far it is bowed over, as on all fours: held in the frame of the way it
    // faces, upright, not tipped forward with the top of its back)
    const f0 = C.way('upper', F0);
    const fh = norm([f0[0], f0[1], 0], F0);
    const way: readonly [V3, V3, V3] = [fh, norm(cross(U, fh)), U];
    for (const side of [1, -1] as const) {
      const root = at('upper', P(WING_OPEN.root[0], side * WING_OPEN.root[1], WING_OPEN.root[2]));
      // (the far wing swung back a little, so the eye sees its face and its curve, not its edge as a stick)
      const farW = nearOf(root) < nearOf(at('upper', P(WING_OPEN.root[0], -side * WING_OPEN.root[1], WING_OPEN.root[2])));
      batWing(sc, { hide, horn, bone, leather }, root, way, side, K(), farW ? { ...wings, sweep: wings.sweep + 0.45 } : wings, 'bat', K());
    }
  }

  const seat = fireAt ?? s.handL;
  const behind = nearOf(C.way('hips', F0)) < nearOf([0, 0, 0]);
  const ups = (p: V3): V3 => sc.at(p);
  G = grow.body;
  return {
    seat,
    fires: floorFires.map(ups),
    aura: {
      from: [at('upper', P(-6, 0, 88)), at('upper', P(0, 20, 86)), at('upper', P(0, -20, 86)), at('upper', P(-12, 12, 82)), at('upper', P(-12, -12, 82)), lerp3(s.elbowR, s.handR, 0.4), lerp3(s.elbowL, s.handL, 0.6), at('upper', P(-2, 0, 70)), ...floorFires.filter((_, i) => i % 5 === 2)].map(ups),
      horns: [P(51, 19, 84), P(51, -19, 84), P(43, 23, 88), P(43, -23, 88)].map((p) => ups(at('head', p))),
      jaw: ups(at('head', P(40, 0, 62))),
      claws: [ups(seat), ups(s.handL)],
      feet: feet.map(ups),
      behind,
    },
  };
}
