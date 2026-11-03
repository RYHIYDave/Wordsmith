// THE PRINCESS'S SPECTRAL STEED (floor 16's boss, her ultimate). A MOCK-UP: NOT IN THE GAME. Nothing of the game imports
// this file; it is behind PRINCESS_ON (art/princess.ts, off).
//
// His words, 28 Oct, 20:29: “I was gonna say a spectral steed from the guys with pitchforks to kinda tie it all
// together.  Maybe one of her moves a spectral steed forms under her and she does like dressage jumps all over the arena
// that you have to dodge”; and “It’s her ultimate ability so it can slot into whatever that might have been.  I want it
// to last a while and you have to really dodge around a bit to not get hit.”; her sound, “Silent, but vines and hooves
// (Recommended)”.
//
// WHAT IT IS: a horse of the palace stables (the grooms' charge) made of the Hush's grey fog, as the fog wolves of the
// Pinewood are (art/fog_wolves.ts): a tall, proud horse, its neck arched high and its head drawn in as a dressage horse
// carries it; churning fog, dense at its chest and shoulders and thinning to mist at its legs, its belly and its tail;
// its mane and tail streaming off it as smoke; its eyes the enemy's pink; its hooves faint and pale. It carries her side-
// saddle, her gown falling down its left flank. Painted from its own solids, in the same painter as the swans and the
// wolves; its loose fog laid grain by grain after its edge.

import type { Px } from '../engine/px';
import { INK, RIM_ALPHA, hash } from './kit';
import type { Ramp } from './kit';
import { FLAME } from './mkit';
import type { Bit, Put } from './new_mobs3';
import type { Ring, Skin, Stage } from './skin';
import type { V3 } from './skeleton';

const D = Math.PI / 180;
const TAU = Math.PI * 2;
const fr = (t: number): number => t - Math.floor(t);
const add = (a: V3, b: V3): V3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const sub = (a: V3, b: V3): V3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const mul = (a: V3, k: number): V3 => [a[0] * k, a[1] * k, a[2] * k];
const len = (a: V3): number => Math.hypot(a[0], a[1], a[2]);
const norm = (a: V3, or: V3 = [0, 0, 1]): V3 => {
  const l = len(a);
  return l > 1e-9 ? mul(a, 1 / l) : or;
};
const cross = (a: V3, b: V3): V3 => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];

/** Its fog: the Hush's own grey-violet (the grey breath that leaks from the grooms), pale where it is thick. */
const FOG: Ramp = ['#3c3852', '#56506e', '#767090', '#9a94b6', '#bfbad4'];
const HOOF: Ramp = ['#4a4660', '#68647e', '#8c88a2', '#b2aec6', '#d6d2e2'];
/** The mist it thins to. */
const MIST = '#b6b0cc';
/** Its mane and tail, smoke paler than its body. */
const MANE: Ramp = ['#6c668c', '#8c86aa', '#aca6c6', '#c8c4da', '#e0dcee'];
const WISP = ['#dcd8ea', '#c8c2dc', '#b0aacb', '#9890b4', '#7e7898'];

/** ITS SIZE: a tall horse, its withers about as high as her head standing. */
export const STEED_SIZE = 1.15;
const S = STEED_SIZE;

// =============================================================================================
// ITS POSE

/** One leg: its upper bone's swing from hanging straight down (degrees, + forward), its lower bone's bend from the upper's line (+ forward), and its pastern's from the lower's (+ forward; 35 standing). */
export type LegPose = readonly [number, number] | readonly [number, number, number];
export interface SteedPose {
  /** Where its middle is over the floor (forward, left, up), and its turn: yaw, pitch nose up, roll onto its right. */
  x: number;
  y: number;
  z: number;
  yaw: number;
  pitch: number;
  roll: number;
  /** Its neck: arched up and in (1, a dressage horse's carriage) or stretched out (0); its head turned. */
  arch: number;
  look: number;
  /** Its legs: near fore, off fore, near hind, off hind (near: its left). */
  legs: readonly [LegPose, LegPose, LegPose, LegPose];
  /** Its tail lifted (degrees), its churn (0 to 1 round), how much of it is there (1 whole; 0 not yet formed, or gone). */
  tail: number;
  churn: number;
  formed: number;
  /**
   * WHERE ITS HOOVES ARE PLANTED (each leg's sole on the floor, where it is: so that a hoof that is down stays where it came
   * down), and how far each leg is held to it (1 planted, 0 its own swing as `legs` says; between, on its way off the
   * floor or down onto it).
   */
  plant?: readonly [V3, V3, V3, V3];
  grip?: readonly [number, number, number, number];
}
/** (its own lengths, before its size: a horse 50 at the withers) */
const LEG_TOP: readonly V3[] = [[14, 5.0, 33], [14, -5.0, 33], [-15, 5.4, 36], [-15, -5.4, 36]];
const LEG_LONG: readonly (readonly [number, number, number])[] = [[15, 11.5, 4.6], [15, 11.5, 4.6], [17.5, 13.6, 4.6], [17.5, 13.6, 4.6]];
/** Standing square: its fore legs straight down, its hind legs angled back to the hock and straight down from it. */
export const STEED_STAND: SteedPose = {
  x: 0, y: 0, z: 0, yaw: 0, pitch: 0, roll: 0, arch: 1, look: 0,
  legs: [[-2, -1, 30], [-2, -1, 30], [-20, 24], [-20, 24]],
  tail: 0, churn: 0, formed: 1,
};
/** IN THE AIR, A LEAP (a capriole): its fore legs folded up tight under its chest, its hind legs kicked straight out behind; its body lifted, level. */
export const STEED_LEAP: SteedPose = {
  x: 0, y: 0, z: 18, yaw: 0, pitch: 4, roll: 0, arch: 0.8, look: 0,
  legs: [[78, -150, -40], [70, -142, -40], [-78, 8, 20], [-70, 4, 20]],
  tail: 70, churn: 0, formed: 1,
};

function turn(v: V3, yaw: number, pitch: number, roll: number): V3 {
  const [x0, y0, z0] = v;
  const cr = Math.cos(roll * D), sr = Math.sin(roll * D);
  const y1 = y0 * cr - z0 * sr;
  const z1 = y0 * sr + z0 * cr;
  // (pitch: nose up for positive)
  const cp = Math.cos(pitch * D), sp = Math.sin(pitch * D);
  const x2 = x0 * cp - z1 * sp;
  const z2 = x0 * sp + z1 * cp;
  const cy = Math.cos(yaw * D), sy = Math.sin(yaw * D);
  return [x2 * cy - y1 * sy, x2 * sy + y1 * cy, z2];
}
/** A point of its body (its own lengths, before its size, about its middle 40 up) where it is now. */
const PIVOT: V3 = [0, 0, 40];
export function steedAt(P: SteedPose, p: V3): V3 {
  return add(add(turn(mul(sub(p, PIVOT), S), P.yaw, P.pitch, P.roll), mul(PIVOT, S)), [P.x, P.y, P.z]);
}
const turned = (P: SteedPose, v: V3): V3 => turn(v, P.yaw, P.pitch, P.roll);
/** Where a rider sits on it: the middle of its back, just behind its withers, and its own forward, left and up there. */
export function seatOf(P: SteedPose): { at: V3; f: V3; l: V3; u: V3 } {
  return { at: steedAt(P, [3, 0, 49.5]), f: turned(P, [1, 0, 0]), l: turned(P, [0, 1, 0]), u: turned(P, [0, 0, 1]) };
}
/** Its hoof: how far it reaches down from the end of its pastern, and how thick it is at its sole. */
const HOOF_LONG = 1.0 * S;
const HOOF_R = 1.65 * S;
/** How high the end of a pastern is over the sole of a hoof planted flat. */
const HOOF_UP = HOOF_LONG + HOOF_R;
/** Each leg's joints: its top, its knee or hock, its fetlock, the end of its pastern; and the way its hoof points (down its middle). */
function legOf(P: SteedPose, i: number): { top: V3; knee: V3; fet: V3; end: V3; down: V3 } {
  const [a1, a2, a3 = 35] = P.legs[i];
  const [l1, l2, l3] = LEG_LONG[i];
  const top = steedAt(P, LEG_TOP[i]);
  const dir = (a: number): V3 => turned(P, turn([0, 0, -1], 0, a, 0));
  const knee = add(top, mul(dir(a1), l1 * S));
  const fet = add(knee, mul(dir(a1 + a2), l2 * S));
  const end = add(fet, mul(dir(a1 + a2 + a3), l3 * S));
  const down = norm(lerp(dir(a1 + a2 + a3), turned(P, [0, 0, -1]), 0.6), [0, 0, -1]);
  const g = P.plant && P.grip ? P.grip[i] : 0;
  if (g <= 0 || !P.plant) return { top, knee, fet, end, down };
  // (planted: the hoof flat on the floor where it is, the pastern sloping up and back from it, the knee or hock bent to
  // reach; on its way off the floor or down onto it, lifted straight up off its spot or set straight down onto it before
  // its own swing takes it, so that it never goes along the floor)
  const sole: V3 = [P.plant[i][0], P.plant[i][1], P.plant[i][2] + (1 - g) * 9];
  const gw = Math.min(1, g / 0.7);
  const w = gw * gw * (3 - 2 * gw);
  const fw0 = turned(P, [1, 0, 0]);
  const fw = norm([fw0[0], fw0[1], 0], [1, 0, 0]);
  const pEnd: V3 = [sole[0], sole[1], sole[2] + HOOF_UP];
  const pFet = add(pEnd, add(mul(fw, -Math.sin(35 * D) * l3 * S), [0, 0, Math.cos(35 * D) * l3 * S]));
  const L1 = l1 * S;
  const L2 = l2 * S;
  const v = sub(pFet, top);
  const d = Math.max(Math.abs(L1 - L2) + 0.01, Math.min(L1 + L2 - 0.01, len(v)));
  const u = norm(v, [0, 0, -1]);
  // (a fore knee bends forward, a hind hock back)
  const want = mul(fw, i < 2 ? 1 : -1);
  const n = norm(sub(want, mul(u, want[0] * u[0] + want[1] * u[1] + want[2] * u[2])), want);
  const ca = (L1 * L1 + d * d - L2 * L2) / (2 * L1 * d);
  const sa = Math.sqrt(Math.max(0, 1 - ca * ca));
  const pKnee = add(top, add(mul(u, L1 * ca), mul(n, L1 * sa)));
  const fetIK = add(top, mul(u, d));
  const endIK = add(fetIK, sub(pEnd, pFet));
  return { top, knee: lerp(knee, pKnee, w), fet: lerp(fet, fetIK, w), end: lerp(end, endIK, w), down: norm(lerp(down, [0, 0, -1], w), [0, 0, -1]) };
}
/** WHERE EACH HOOF'S SOLE IS (near fore, off fore, near hind, off hind): its lowest point. */
export function solesOf(P: SteedPose): V3[] {
  return [0, 1, 2, 3].map((i) => {
    const L = legOf(P, i);
    return add(add(L.end, mul(L.down, HOOF_LONG)), [0, 0, -HOOF_R]);
  });
}
/** The points of it the checks follow from frame to frame: its muzzle, its poll, its chest, its croup, its hooves. */
export function steedPoints(P: SteedPose): Record<string, V3> {
  const N = neckOf(P);
  const out: Record<string, V3> = { muzzle: add(N.poll, mul(N.hd, 16 * S)), poll: N.poll, chest: steedAt(P, [20, 0, 40]), croup: steedAt(P, [-20, 0, 48]) };
  solesOf(P).forEach((p, i) => (out[`hoof${i}`] = p));
  return out;
}
/** Where a planted hoof stands under it as it stands square (each leg's own spot on the floor), it standing as `P` says (its place and its turn). */
export function squareSoles(P: Pick<SteedPose, 'x' | 'y' | 'yaw'>): [V3, V3, V3, V3] {
  const at = (fx: number, ly: number): V3 => {
    const c = Math.cos(P.yaw * D), sn = Math.sin(P.yaw * D);
    return [P.x + (fx * c - ly * sn) * S, P.y + (fx * sn + ly * c) * S, 0];
  };
  return [at(15, 5.6), at(15, -5.6), at(-17, 6.0), at(-17, -6.0)];
}
/** Its neck: its crest (top line) and its throat (under line), from the withers to the poll; its poll; its head's way (poll to muzzle). */
function neckOf(P: SteedPose): { crest: V3[]; throat: V3[]; poll: V3; hd: V3 } {
  const a = P.arch;
  const mix = (p: V3, q: V3): V3 => [p[0] * a + q[0] * (1 - a), p[1] * a + q[1] * (1 - a), p[2] * a + q[2] * (1 - a)];
  // (arched: a dressage horse's carriage, its poll the highest point; stretched: reaching forward)
  const crestA: V3[] = [[12, 0, 50], [19, 0, 55.5], [24.5, 0, 60], [29, 0, 63.2], [32.5, 0, 64.8]];
  const crestS: V3[] = [[12, 0, 50], [20, 0, 54.5], [27, 0, 57.5], [33, 0, 59.5], [37.5, 0, 60.5]];
  const throatA: V3[] = [[23, 0, 37], [26.5, 0, 44.5], [29.5, 0, 50.5], [31.5, 0, 55], [33.5, 0, 58]];
  const throatS: V3[] = [[23, 0, 37], [28, 0, 43], [32.5, 0, 47.5], [36.5, 0, 51], [39.5, 0, 53]];
  const crest = crestA.map((p, i) => steedAt(P, mix(p, crestS[i])));
  const throat = throatA.map((p, i) => steedAt(P, mix(p, throatS[i])));
  const poll = crest[crest.length - 1];
  // (its head: drawn in near upright, a dressage horse's; stretched out, reaching)
  const hd = turned(P, turn(norm([0.3 * a + 0.75 * (1 - a), 0, -0.95 * a - 0.66 * (1 - a)]), P.look, 0, 0));
  return { crest, throat, poll, hd };
}

/** Its fog: pale streaks streaming back along it, churning, and darker hollows where it is thin. */
function patch(u: V3, k: number, seed: number): number {
  const x = u[0] * k + 7.3, y = u[1] * k + 3.1, z = u[2] * k + 5.7;
  const xi = Math.floor(x), yi = Math.floor(y), zi = Math.floor(z);
  const fx = x - xi, fy = y - yi, fz = z - zi;
  const s = (v: number): number => v * v * (3 - 2 * v);
  const h = (i: number, j: number, m: number): number => hash(xi + i + 101 * (zi + m), yi + j, seed);
  const lx = (j: number, m: number): number => h(0, j, m) + (h(1, j, m) - h(0, j, m)) * s(fx);
  const ly = (m: number): number => lx(0, m) + (lx(1, m) - lx(0, m)) * s(fy);
  return ly(0) + (ly(1) - ly(0)) * s(fz);
}
function fogSkin(seed: number, churn: number, thin: number): Skin {
  const wob = Math.sin(TAU * churn * 0.5);
  return (u, tone) => {
    const streak = fr(u[0] * 0.9 + churn + 0.3 * Math.sin(u[2] * 2.6 + u[1] * 2 + seed));
    const hollow = thin > 0 && patch([u[0] + 0.35 * wob, u[1], u[2] - 0.25 * wob], 1.6, seed) > 1 - thin;
    const t = tone + (streak < 0.25 ? 1 : 0) - (hollow ? 1 : 0);
    return FOG[Math.max(0, Math.min(4, t))];
  };
}
const EYE_SKIN: Skin = (u) => {
  const r = Math.hypot(u[1], u[2]);
  return r < 0.55 ? FLAME[3] : FLAME[2];
};

/** THE STEED AS SOLIDS (`part` names are its own, prefixed `steed`). */
export function steedBits(P: SteedPose, put: Put, near: number): void {
  const W = (p: V3): V3 => steedAt(P, p);
  const ax = (a: V3, b: V3, c: V3): [V3, V3, V3] => [turned(P, mul(a, S)), turned(P, mul(b, S)), turned(P, mul(c, S))];
  const c = P.churn;
  const ball = (part: string, piece: string, at: V3, a: V3, b: V3, cc: V3, seed: number, thin: number): void =>
    put(part, piece, { k: 'ball', c: W(at), ax: ax(a, b, cc), skin: fogSkin(seed, c, thin) });
  // ITS BODY: its barrel; its deep chest and the point of its shoulder; its withers; its round haunch, its croup and its
  // buttock
  ball('steedBody', 'barrel', [-1, 0, 40], [18, 0, 0], [0, 8.6, 0], [0, 0, 9.4], 1, 0.22);
  ball('steedBody', 'chest', [15, 0, 41], [9.5, 0, 0], [0, 8.4, 0], [0, 0, 10.6], 2, 0.06);
  ball('steedBody', 'breast', [22, 0, 41.5], [4.6, 0, 0], [0, 7.0, 0], [0, 0, 7.4], 3, 0.04);
  ball('steedBody', 'withers', [10, 0, 47.5], [8, 0, 0], [0, 5.4, 0], [0, 0, 4.4], 4, 0.08);
  ball('steedBody', 'haunch', [-17, 0, 42], [10.5, 0, 0], [0, 9.2, 0], [0, 0, 10.8], 5, 0.28);
  ball('steedBody', 'croup', [-14, 0, 48], [9.5, 0, 0], [0, 7.2, 0], [0, 0, 4.4], 6, 0.24);
  ball('steedBody', 'buttock', [-24, 0, 42], [4.8, 0, 0], [0, 7.4, 0], [0, 0, 8.4], 7, 0.3);
  // ITS NECK, arched high, deep at its root (from its withers down to its breast), slender at its throat
  const N = neckOf(P);
  const wide = [6.4, 5.6, 4.8, 4.2, 3.7];
  const side = turned(P, [0, 1, 0]);
  // (one smooth tube through rings from its root, buried in its chest, to its poll, buried in its head)
  const rings: Ring[] = [];
  for (let i = 0; i < N.crest.length; i++) {
    const cc = lerp(N.crest[i], N.throat[i], 0.5);
    rings.push({ c: cc, u: mul(sub(N.crest[i], N.throat[i]), 0.5), v: mul(side, wide[i] * S) });
  }
  put('steedBody', 'neck', { k: 'cloth', rings, ramp: FOG, look: { folds: [], lift: 0.04 }, rigid: true });
  // ITS HEAD, long and fine: its broad cheek and jaw under its poll, its long face, its muzzle; its ears pricked; its
  // eyes the enemy's pink
  const hd = N.hd;
  const face = norm(cross(hd, side), [1, 0, 0]);
  const at = (along: number, fwd: number, out: number): V3 => add(N.poll, add(mul(hd, along * S), add(mul(face, fwd * S), mul(side, out * S))));
  put('steedBody', 'head', { k: 'ball', c: at(5.2, -1.0, 0), ax: [mul(hd, 5.6 * S), mul(side, 3.4 * S), mul(face, 4.6 * S)], skin: fogSkin(16, c, 0) });
  put('steedBody', 'head', { k: 'ball', c: at(10.5, 0.6, 0), ax: [mul(hd, 6.2 * S), mul(side, 2.7 * S), mul(face, 3.2 * S)], skin: fogSkin(17, c, 0) });
  put('steedBody', 'muzzle', { k: 'ball', c: at(16.2, 0.8, 0), ax: [mul(hd, 2.8 * S), mul(side, 2.6 * S), mul(face, 2.9 * S)], skin: fogSkin(18, c, 0) });
  put('steedBody', 'nostrils', { k: 'dot', p: at(17.4, 2.6, 0), c: FOG[0], facing: face });
  for (const k of [-1, 1]) {
    // its ears, pricked forward
    const base = at(0.6, 0.6, k * 1.6);
    const up = norm(add(mul(hd, -0.85), add(mul(face, 0.45), mul(side, k * 0.15))));
    put('steedBody', 'ears', { k: 'rod', a: base, b: add(base, mul(up, 3.4 * S)), ra: 0.95 * S, rb: 0.2 * S, ramp: FOG });
    // its eyes, burning
    put('steedBody', 'eyes', { k: 'ball', c: at(4.2, 1.2, k * 3.1), ax: [mul(hd, 0.9 * S), mul(side, 0.5 * S), mul(face, 0.7 * S)], skin: EYE_SKIN });
  }
  // ITS LEGS: strong at the forearm and the gaskin, fine below the knee and the hock; fog, thinning toward its pale hooves
  for (let i = 0; i < 4; i++) {
    const { top, knee, fet, end, down } = legOf(P, i);
    const part = `steedLeg${i}`;
    const far = (i % 2 === 0 ? 1 : -1) !== near;
    const hind = i >= 2;
    // (the muscle at its top, blending into its body: its forearm's, its thigh's)
    const mass = hind ? lerp(top, knee, 0.22) : lerp(top, knee, 0.2);
    const md = norm(sub(knee, top), [0, 0, -1]);
    const mf = norm(cross(side, md), [1, 0, 0]);
    put(part, 'leg', { k: 'ball', c: mass, ax: [mul(md, (hind ? 6.4 : 5.2) * S), mul(side, (hind ? 3.4 : 2.9) * S), mul(mf, (hind ? 4.4 : 3.4) * S)], skin: fogSkin(30 + i, c, 0.2), far });
    put(part, 'leg', { k: 'rod', a: top, b: knee, ra: (hind ? 3.4 : 2.9) * S, rb: 1.55 * S, ramp: FOG, far });
    put(part, 'leg', { k: 'ball', c: knee, ax: [[1.75 * S, 0, 0], [0, 1.65 * S, 0], [0, 0, 1.9 * S]], skin: FOG, far });
    put(part, 'leg', { k: 'rod', a: knee, b: fet, ra: 1.35 * S, rb: 1.25 * S, ramp: FOG, far });
    put(part, 'leg', { k: 'ball', c: fet, ax: [[1.55 * S, 0, 0], [0, 1.45 * S, 0], [0, 0, 1.55 * S]], skin: FOG, far });
    put(part, 'leg', { k: 'rod', a: fet, b: end, ra: 1.2 * S, rb: 1.15 * S, ramp: FOG, far });
    // (the hoof: a short cone, its sole flat to the floor when it is down)
    put(part, 'hoof', { k: 'rod', a: add(end, mul(down, -0.4 * S)), b: add(end, mul(down, HOOF_LONG)), ra: 1.3 * S, rb: HOOF_R, ramp: HOOF, far });
  }
  // ITS TAIL: a plume of smoke from its dock, set high on its croup; strands falling and streaming, waving
  const ph = TAU * P.churn;
  const dock = W([-25, 0, 47]);
  const tdir = norm(turned(P, turn([-1, 0, 0], 0, 62 - P.tail, 0)), [-1, 0, -1]);
  const tdown = norm(turned(P, turn([-1, 0, 0], 0, 84 - P.tail, 0)), [-1, 0, -1]);
  for (let j = 0; j < 5; j++) {
    const spread = (j - 2) * 0.55;
    let prev = dock;
    for (let i = 1; i <= 6; i++) {
      const k = i / 6;
      const dir = norm(lerp(tdir, tdown, k * k));
      const wave = Math.sin(ph + k * 4 + j * 1.1) * 1.4 * k;
      const p = add(add(dock, mul(dir, (3 + 22 * k - Math.abs(spread) * 3 * k) * S)), mul(side, (spread * (1 + 4 * k) + wave) * S));
      put('steedTail', 'tail', { k: 'rod', a: prev, b: p, ra: (2.0 - 1.3 * (k - 1 / 6)) * S, rb: (2.0 - 1.3 * k) * S, ramp: MANE });
      prev = p;
    }
  }
  // ITS MANE: a ridge of smoke along its crest, a few long locks streaming back off it
  const back = turned(P, norm([-1, 0, 0.3]));
  for (let i = 0; i + 1 < N.crest.length; i++) {
    const up = mul(norm(sub(N.crest[i], N.throat[i])), 0.7 * S);
    put('steedMane', 'mane', { k: 'rod', a: add(N.crest[i], up), b: add(N.crest[i + 1], up), ra: 1.9 * S, rb: 1.7 * S, ramp: MANE });
  }
  for (let i = 0; i < 4; i++) {
    const f = (i + 0.6) / 4.2;
    const seg = Math.min(N.crest.length - 2, Math.floor(f * (N.crest.length - 1)));
    const ff = f * (N.crest.length - 1) - seg;
    const base = lerp(N.crest[seg], N.crest[seg + 1], ff);
    const up = norm(sub(N.crest[seg], N.throat[seg]));
    const wave = Math.sin(ph * 1.3 + i * 1.9);
    const a = add(base, mul(up, 1.2 * S));
    const b = add(a, add(mul(back, (6.5 + 1.2 * wave) * S), add(mul(up, 1.4 * S), mul(side, (i % 2 ? 1 : -1) * 0.8 * S))));
    put('steedMane', 'mane', { k: 'rod', a, b, ra: 1.8 * S, rb: 0.35 * S, ramp: MANE });
  }
}

/** ITS LOOSE FOG: its mane streaming back off its crest, its tail off its croup, mist curling off its legs. As grains: [where, colour, size]. */
export function steedGrains(P: SteedPose, t: number, wind: V3): [V3, string, number][] {
  const out: [V3, string, number][] = [];
  const N = neckOf(P);
  const back = norm(add(turned(P, [-1, 0, 0.2]), mul(wind, 0.6)), [-1, 0, 0]);
  const side = turned(P, [0, 1, 0]);
  // (its tail's end, wisping off)
  const dock = steedAt(P, [-25, 0, 47]);
  const tdown = norm(add(turned(P, turn([-1, 0, 0], 0, 84 - P.tail, 0)), mul(wind, 0.5)), [-1, 0, -1]);
  for (let i = 0; i < 14; i++) {
    const life = fr(t * 0.8 + i / 14 + 0.17 * hash(i, 3, 7601));
    const p = add(add(dock, mul(tdown, (22 + life * 8) * S)), add(mul(side, (hash(i, 5, 7602) - 0.5) * 9 * S), [0, 0, life * 3]));
    if (life > 0.8) continue;
    out.push([p, WISP[Math.min(4, 1 + Math.floor(life * 4))], 2]);
  }
  // mist curling off its legs
  for (let i = 0; i < 4; i++) {
    const { knee, fet, end } = legOf(P, i);
    for (let j = 0; j < 5; j++) {
      const life = fr(t * 0.7 + j * 0.2 + i * 0.13);
      if (life > 0.6 || j % 2) continue;
      const p = add(j < 3 ? lerp(knee, fet, 0.3 + 0.3 * j) : lerp(fet, end, j - 3), add(mul(back, life * 6 * S), [0, 0, life * 3]));
      out.push([p, WISP[1 + (j % 4)], 2]);
    }
  }
  return out;
}
const lerp = (a: V3, b: V3, k: number): V3 => [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k];

function noise2(x: number, y: number, seed: number): number {
  const xi = Math.floor(x), yi = Math.floor(y);
  const fx = x - xi, fy = y - yi;
  const s = (v: number): number => v * v * (3 - 2 * v);
  const h = (i: number, j: number): number => hash(xi + i, yi + j, seed);
  const a = h(0, 0) + (h(1, 0) - h(0, 0)) * s(fx);
  const b = h(0, 1) + (h(1, 1) - h(0, 1)) * s(fx);
  return a + (b - a) * s(fy);
}
/**
 * MORE FOG THAN HORSE BELOW: gaps through it you can see the ground through, few at its chest and neck, more toward its
 * belly and its haunch, most at its legs; its eyes stay whole. `isSteed(i)`: whether a pixel of the picture is its (a
 * rider's are left alone). `formed`: 1 whole; less, thinner, to nothing (forming under her; fading as she dies).
 */
export function thinSteed(px: Px, st: Stage, P: SteedPose, isSteed: (i: number) => boolean | null): void {
  const [cx, cy] = st.at(steedAt(P, [8, 0, 47]));
  const [, by] = st.at(steedAt(P, [0, 0, 38]));
  const ang = Math.PI * P.churn;
  const ox = 1.6 * Math.cos(ang), oy = 1.6 * Math.sin(ang);
  const keep = new Set(FLAME.map((c) => c.toLowerCase()));
  const [ir, ig, ib] = [parseInt(INK.slice(1, 3), 16), parseInt(INK.slice(3, 5), 16), parseInt(INK.slice(5, 7), 16)];
  const W = px.w;
  const cut = new Uint8Array(W * px.h);
  const edgeAt = (i: number): boolean => px.d[i + 3] === RIM_ALPHA || (px.d[i] === ir && px.d[i + 1] === ig && px.d[i + 2] === ib);
  for (let y = 0; y < px.h; y++) {
    for (let x = 0; x < W; x++) {
      const k = y * W + x;
      const i = k * 4;
      if (px.d[i + 3] === 0 || isSteed(k) !== true || (edgeAt(i) && P.formed >= 1)) continue;
      const hex = '#' + [px.d[i], px.d[i + 1], px.d[i + 2]].map((v) => v.toString(16).padStart(2, '0')).join('');
      if (keep.has(hex) && P.formed > 0.5) continue;
      // (lower is thinner: its legs mostly mist)
      const low = Math.max(0, Math.min(1.6, (y - by) / (14 * S)));
      const far = Math.min(1, Math.hypot(x - cx, y - cy) / (60 * S));
      const thr = 1.05 - 0.5 * low - 0.04 * far - 1.2 * (1 - P.formed);
      const n = 0.78 * noise2(x * 0.17 + ox, y * 0.24 + oy, 71) + 0.22 * noise2(x * 0.5 - oy, y * 0.6 + ox, 73);
      cut[k] = n > thr + 0.1 ? 2 : n > thr - 0.12 ? 1 : 0;
    }
  }
  for (let pass = 0; pass < 2; pass++) {
    const was = cut.slice();
    for (let y = 0; y < px.h; y++) {
      for (let x = 0; x < W; x++) {
        const k = y * W + x;
        const i = k * 4;
        // (its edge goes with it: the dark seam on it, and the pink rim round it that is no part's own)
        if (cut[k] || px.d[i + 3] === 0 || !edgeAt(i) || isSteed(k) === false) continue;
        let gone = 0;
        for (const [ax2, ay2] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
          const xx = x + ax2, yy = y + ay2;
          if (xx >= 0 && yy >= 0 && xx < W && yy < px.h && was[yy * W + xx] === 2) gone++;
        }
        if (gone) cut[k] = 2;
      }
    }
  }
  for (let k = 0; k < W * px.h; k++) {
    const i = k * 4;
    if (cut[k] === 2 || (cut[k] === 1 && ((k % W) + Math.floor(k / W)) % 2 === 1)) px.d[i + 3] = 0;
    else if (cut[k] === 1) {
      px.d[i] = parseInt(MIST.slice(1, 3), 16);
      px.d[i + 1] = parseInt(MIST.slice(3, 5), 16);
      px.d[i + 2] = parseInt(MIST.slice(5, 7), 16);
      px.d[i + 3] = 255;
    }
  }
}
export type { Bit };
