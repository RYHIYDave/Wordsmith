// THE EYESPAWN, floor 10's medium mob (the Sunken Fen), 3 to 5 a pack; they hatch from the Drowned Eye's eggs
// (art/drowned_eye.ts, spawnPainted: the game brings one out where an egg bursts). His brief, two pop-ups, 16 Oct,
// by 00:58:
// - what they are: “An eye on tentacles (Recommended)”, offered as: a pale veined eyeball as big as a barrel, hauled
//   along on a cluster of short pale tentacles: his child;
// - how big: “The knight's height (Recommended)”, offered as: 3 to 5 a pack; menacing, each one a real fight;
// - how they move: “Hauling on its tentacles (Recommended)”, offered as: heaving itself along in wet, quick lurches,
//   the eye rolling to keep on you;
// - what you know them by: “Its one staring eye (Recommended)”, offered as: his own: the pink-to-gold iris, the slit,
//   darting about and fixing on you;
// - its basic attack: “A tentacle lash (Recommended)”, offered as: it rears back and whips a tentacle across you;
// - its big attack: “A gold gaze beam (Recommended)”, offered as: its eye narrows and a line of light flickers on the
//   floor (the warning), then a short burning beam along it: his gaze, small;
// - how they die: “Its eye bursts (Recommended)”, offered as: it swells and shudders, its eye ruptures in a gush, and
//   it slumps into a slack heap of tentacles;
// - their sound: “Wet slaps and a thin shriek (Recommended)”.
// Kept from their father's brief, as I told him: “Not a cartoon googly eye (Recommended)”.
//
// Not a body of bones: its own solids, frame by frame. Its eye is his eye, small: the same white veined with the
// swamp's violet, the same iris of the enemy's fire, pink at its rim burning to gold, the same black slit; set in a
// cup of his drowned flesh, a knotted rim round it, a brow scowling down over it; under it seven of his pale arms,
// short, suckered and veined: five it stands and hauls itself on, two it lashes with. Its iris gives the enemy's gold
// light. Nothing of it glows cyan. His colours are copied here, so that nothing of the game need import his file.
//
// Its look and stand have his yes (by 08:07): “Yes, animate it (Recommended)”. Its moves: hatching out of his egg, its
// haul, its lash, its gaze beam, struck, its death.

import type { Sprite } from '../engine/px';
import type { ActorArt, AnimSet, Clip } from './actor_types';
import { hash, lazyFrames, toSprite } from './kit';
import type { Painted, Ramp } from './kit';
import { ENEMY_RIM, FLAME } from './mkit';
import { TILE3, paintBits } from './new_mobs3';
import type { Bit, Put } from './new_mobs3';
import { stage } from './skin';
import type { GameView } from './skin';
import { add, cross, dot, lerp3, mul, norm, sub } from './skeleton';
import type { V3 } from './skeleton';

/** THE SWITCH, OFF: nothing of the game reads this file. */
export const SPAWN_ON = { on: false };

const cl01 = (v: number): number => Math.max(0, Math.min(1, v));
const fr = (t: number): number => t - Math.floor(t);
const sm = (v: number): number => {
  const k = cl01(v);
  return k * k * (3 - 2 * k);
};
const TAU = Math.PI * 2;
const D = Math.PI / 180;
const UP: V3 = [0, 0, 1];

// --- HIS COLOURS (as art/drowned_eye.ts) ---
const SCLERA: Ramp = ['#4c4642', '#7c7266', '#a89c8a', '#cdc1a9', '#e9dfc6'];
const VEIN: Ramp = ['#2e1830', '#4a2448', '#6e3466', '#8c4a7a', '#a8649a'];
const BULK: Ramp = ['#0e1012', '#1a1d1e', '#2a2f2c', '#3d443d', '#545c50'];
const MOTTLE: Ramp = ['#1e2020', '#30322e', '#474a42', '#5e6256', '#767a6a'];
const ARM: Ramp = ['#2a2624', '#4a443e', '#736a5e', '#9c9282', '#c2b6a0'];
const SUCKER: Ramp = ['#3a3234', '#665a58', '#968678', '#baaa98', '#d6c8b2'];
const WEED: Ramp = ['#152014', '#21301c', '#304426', '#435a32', '#586e3e'];
const PUPIL = '#100810';
/** Its eye's iris as his: the enemy's fire. */
export const IRIS = FLAME;

// =============================================================================================
// ITS LOOK

/** Its canvas, and its floor point on it (under the middle of it). */
export const ES_CANVAS = { w: 220, h: 210, ax: 110, ay: 160 };
/** Its eye: how big (a radius, in the figure's own lengths; the knight is 58 tall), and how high its middle stands. */
export const ES_R = 15;
export const ES_HIGH = 40;
/** Its seven arms: where each grows from round under its eye (degrees round from its forward, toward its left); the first five it stands on, the last two it lashes with. */
const LEG_AT = [38, 108, 180, -108, -38];
const ARM_AT = [72, -72];
/** How far out from under it each leg's tip rests on the floor. */
const LEG_OUT = 23;

/**
 * A POSE of the eyespawn: its eye's middle; the way its eye and the flesh round it face (`face`), and the way its iris
 * looks (`look`, within a little of its face); its lids (0 open, 1 shut); its slit (how wide); where each leg's tip
 * is on the floor (or lifted); each lashing arm's spine, root first; and how dark its fire (0 burning, 1 out).
 */
export interface SpawnPose {
  E: V3;
  face: V3;
  look: V3;
  lid: number;
  slit: number;
  tips: V3[];
  arms: V3[][];
  dark?: number;
  /** How big it is (1 grown; less as it hatches) and how big its eye (its radius: ES_R grown; more as it swells to burst). */
  size: number;
  R: number;
  /** Its eye burst (0 whole, 1 torn open and emptied). */
  burst?: number;
  /** How bright its iris burns (1 as it is; more as it gathers its gaze). */
  flare?: number;
}

/** The frame its eye and flesh face: forward, its left, its up. */
function frameOf(face: V3): [V3, V3, V3] {
  const f = norm(face, [1, 0, 0]);
  const l = norm(cross(UP, f), [0, 1, 0]);
  return [f, l, cross(f, l)];
}

/** ITS EYE'S SKIN: its white veined, its iris burning, its slit; its lids closing over it; its back its flesh. */
function eyeSkin(P: SpawnPose, f: V3, u0: V3): (u: V3, tone: number) => string | null {
  const L = norm(P.look);
  const h = norm(cross(UP, L), [0, 1, 0]);
  const v = cross(L, h);
  const IR = 0.47;
  const upper = 1 - 2 * cl01(P.lid);
  const lower = -1 + 0.55 * cl01(P.lid);
  const dark = P.dark ?? 0;
  return (u, tone) => {
    const n = norm(u);
    if (dot(n, f) < -0.35) return MOTTLE[Math.max(0, tone - 1)];
    const lv = dot(n, u0);
    if (lv > upper || lv < lower) {
      const edge = lv > upper ? lv - upper : lower - lv;
      if (edge < 0.07) return BULK[0];
      return MOTTLE[Math.max(0, Math.min(4, tone))];
    }
    const c = dot(n, L);
    const a = dot(n, h);
    const b = dot(n, v);
    const r = Math.hypot(a, b);
    if (c > 0 && r < IR) {
      const k = r / IR;
      const half = P.slit * IR * Math.sqrt(Math.max(0, 1 - (b / IR) ** 2));
      if (Math.abs(a) < half) return PUPIL;
      if (Math.abs(a) < half + 0.03) return dark > 0.5 ? BULK[1] : FLAME[1];
      const ray = Math.abs(Math.sin(Math.atan2(b, a) * 11 + k * 6)) < 0.32;
      const fire = (i: number): string => (dark > 0.12 + 0.17 * i ? MOTTLE[Math.min(4, i)] : IRIS[i]);
      if (k > 0.9) return fire(0);
      if (k > 0.75) return ray ? fire(1) : fire(2);
      if (k > 0.5) return ray ? fire(2) : fire(3);
      if (k > 0.2) return ray ? fire(3) : fire(4);
      return fire(4);
    }
    const ang = Math.atan2(b, a);
    const away = Math.acos(Math.max(-1, Math.min(1, c)));
    const meander = Math.sin(ang * 5 + 3.0 * Math.sin(away * 4 + ang * 2));
    const twig = Math.sin(ang * 12 + away * 9 + 1.7 * Math.sin(away * 11));
    if ((Math.abs(meander) < 0.15 && away > 0.55) || (Math.abs(twig) < 0.1 && away > 0.9)) return VEIN[Math.min(3, 1 + Math.max(0, tone - 2))];
    if (dot(n, norm([0.75, -0.4, 0.95])) > 0.975) return '#fffaee';
    return SCLERA[Math.max(0, tone - (away > 1.4 ? 1 : 0))];
  };
}

/** What gushes out of its eye as it bursts: its pale jelly, its dark ichor. */
const GUSH_C = ['#d8cfa6', '#b8ae84', '#8a8058', '#4a2448', '#2e1830'];
/** ITS EYE, BURST: torn open across its face, emptied, the white slack and greying, the torn edge ragged. */
function tornSkin(P: SpawnPose, f: V3, burst: number): (u: V3, tone: number, x: number, y: number) => string | null {
  return (u, tone, x, y) => {
    const n = norm(u);
    const c = dot(n, f);
    const ragged = 0.15 * Math.sin(Math.atan2(n[2], n[1]) * 7 + 1.3) + 0.08 * Math.sin(Math.atan2(n[2], n[1]) * 17);
    if (c > 0.72 - 0.2 * burst + ragged) return c > 0.9 - 0.12 * burst + ragged ? '#140a12' : hash(x, y, 907) > 0.6 ? VEIN[1] : '#2a1424';
    if (c > 0.6 - 0.2 * burst + ragged) return hash(x, y, 909) > 0.5 ? SCLERA[Math.max(0, tone - 2)] : GUSH_C[1];
    if (dot(n, f) < -0.35) return MOTTLE[Math.max(0, tone - 1)];
    return hash(Math.floor(x / 2), Math.floor(y / 2), 908) > 0.85 ? VEIN[2] : SCLERA[Math.max(0, tone - 1)];
  };
}

/** Its flesh: the drowned dark of the fen, wet, mottled paler, wrinkled. */
function fleshSkin(seed: number): (u: V3, tone: number, x: number, y: number) => string | null {
  return (u, tone, x, y) => {
    // (his veins of the swamp's violet over it, branching)
    if (Math.abs(Math.sin(u[1] * 4.5 + 2.2 * Math.sin(u[2] * 3.5 + seed))) < 0.07 || Math.abs(Math.sin(u[2] * 7 + u[1] * 3 + seed)) < 0.04) return VEIN[Math.min(3, Math.max(1, tone - 1))];
    if (fr(u[2] * 4 + 0.45 * Math.sin(u[1] * 6 + seed)) < 0.14) return BULK[Math.max(0, tone - 1)];
    if (hash(Math.floor(x / 3), Math.floor(y / 3), 900 + seed) > 0.62) return MOTTLE[tone];
    return BULK[tone];
  };
}

/** One of its arms as solids along its spine (root first): pale, veined along its outer side, suckers along its under side. */
function armBits(spine: V3[], r0: number, r1: number, name: string, put: Put, seed: number): void {
  const n = spine.length - 1;
  for (let k = 0; k < n; k++) {
    const a = spine[k];
    const b = spine[k + 1];
    const ra = r0 + (r1 - r0) * (k / n);
    const rb = r0 + (r1 - r0) * ((k + 1) / n);
    put(name, `${name}_${k}`, { k: 'rod', a, b, ra, rb, ramp: ARM });
    const t = norm(sub(b, a), [1, 0, 0]);
    const side = norm(cross(UP, t), [0, 1, 0]);
    const top = norm(cross(t, side), UP);
    // (a vein winding along its top)
    if (k < n - 1) {
      const w0 = Math.sin(k * 0.9 + seed) * 0.6;
      const w1 = Math.sin((k + 1) * 0.9 + seed) * 0.6;
      put(name, `${name}_v${k}`, { k: 'rod', a: add(a, mul(norm(add(top, mul(side, w0))), ra * 0.85)), b: add(b, mul(norm(add(top, mul(side, w1))), rb * 0.85)), ra: 0.7, rb: 0.7, ramp: VEIN });
    }
    // (its suckers under it, paler rings)
    if (k > 0 && k < n - 1 && k % 2 === 0) {
      const c = add(lerp3(a, b, 0.5), mul(top, -ra * 0.85));
      const s = Math.max(0.8, ra * 0.42);
      put(name, `${name}_s${k}`, { k: 'ball', c, ax: [mul(top, -s * 0.5), mul(t, s), mul(side, s)], skin: (q, tone) => (q[0] > 0.4 && Math.hypot(q[1], q[2]) < 0.5 ? SUCKER[0] : SUCKER[tone]) });
    }
  }
}

/** A curve from `a` to `d` by way of `b` and `c` (Bezier), as `n` + 1 points. */
function bez(a: V3, b: V3, c: V3, d: V3, n: number): V3[] {
  const out: V3[] = [];
  for (let i = 0; i <= n; i++) {
    const s = i / n;
    const m = 1 - s;
    out.push(add(add(mul(a, m * m * m), mul(b, 3 * m * m * s)), add(mul(c, 3 * m * s * s), mul(d, s * s * s))));
  }
  return out;
}

/** Where a leg grows from, under its eye: round its underside, `deg` round from where its flesh faces. */
function legRoot(P: SpawnPose, deg: number): V3 {
  const [f, l] = frameOf(P.face);
  const out = add(mul(f, Math.cos(deg * D)), mul(l, Math.sin(deg * D)));
  const R = ES_R * P.size;
  return add(P.E, add(mul(out, R * 0.55), [0, 0, -R * 0.62]));
}

/** A leg's spine: from its root out and over in an arch, down to its tip on the floor, its end curled along the floor. */
function legSpine(P: SpawnPose, i: number): V3[] {
  const root = legRoot(P, LEG_AT[i]);
  const tip = P.tips[i];
  const out = norm([tip[0] - root[0], tip[1] - root[1], 0], [1, 0, 0]);
  const side = norm(cross(UP, out), [0, 1, 0]);
  const z = P.size;
  const arch = bez(root, add(root, add(mul(out, 9 * z), [0, 0, 3 * z])), add(tip, add(mul(out, -3 * z), [0, 0, 12 * z])), add(tip, [0, 0, 1.8 * z]), 9).map((q, k) => {
    // (a tentacle, not a leg: it winds as it goes)
    const s = k / 9;
    return add(q, mul(side, 2.2 * z * Math.sin(Math.PI * s) * Math.sin(Math.PI * s * 2 + i * 1.9 + P.E[2] * 0.15)));
  });
  const lift = tip[2];
  const curl = i % 2 ? 1 : -1;
  arch.push(add(tip, add(mul(out, 2.6 * z), add(mul(side, 1.2 * curl * z), [0, 0, 1.0 * z]))));
  arch.push(add(tip, add(mul(out, 3.6 * z), add(mul(side, 3.2 * curl * z), [0, 0, (0.8 + 0.4 * (lift > 0.5 ? 1 : 0)) * z]))));
  return arch;
}

/** THE EYESPAWN AS SOLIDS: its legs, its flesh cupping its eye, its knotted rim and scowling brow, its eye, its lashing arms, weed hanging off it. */
function spawnBits(P: SpawnPose, t: number, put: Put): void {
  const [f, l, u] = frameOf(P.face);
  const E = P.E;
  const z = P.size;
  const R0 = ES_R * z;
  const R = P.R;
  const burst = cl01(P.burst ?? 0);
  // --- its legs ---
  for (let i = 0; i < LEG_AT.length; i++) armBits(legSpine(P, i), 4.4 * z, 1.0 * z, `leg${i}`, put, i * 1.3);
  // --- its flesh: a cup round the back of its eye, wrinkled, wet ---
  put('flesh', 'cup', { k: 'ball', c: add(E, add(mul(f, -8 * z), mul(u, -2.5 * z))), ax: [mul(f, R0 * 0.8), mul(l, R0 * 0.98), mul(u, R0 * 0.82 * (1 - 0.35 * burst))], skin: fleshSkin(1) });
  // --- its eye (burst: torn open, emptied, fallen in) ---
  const EC = add(E, mul(f, 1.5 * z));
  if (burst < 0.02) put('eye', 'eye', { k: 'ball', c: EC, ax: [[R, 0, 0], [0, R, 0], [0, 0, R]], skin: eyeSkin(P, f, u) });
  else put('eye', 'eye', { k: 'ball', c: add(EC, [0, 0, -R * 0.35 * burst]), ax: [mul(f, R * (1 - 0.3 * burst)), mul(l, R * (1 + 0.1 * burst)), mul(u, R * (1 - 0.55 * burst))], skin: tornSkin(P, f, burst) });
  // --- the knotted rim of flesh round it, and its brow scowling down over it in a V ---
  for (let i = 0; i < 14; i++) {
    const a = (i / 14) * TAU;
    const r = R * 0.93;
    const c = add(EC, add(mul(f, R * 0.42), add(mul(l, Math.cos(a) * r * 0.95), mul(u, Math.sin(a) * r * 0.95 * (1 - 0.5 * burst)))));
    const s = (1.5 + 0.7 * hash(i, 1, 901)) * z;
    put('eye', `rim${i}`, { k: 'ball', c, ax: [mul(f, s * 0.9), mul(l, s), mul(u, s)], skin: (q, tone) => (q[0] > 0.6 && tone >= 3 ? MOTTLE[tone] : BULK[Math.max(1, tone)]) });
  }
  for (const sd of [1, -1]) {
    // (just over its iris, coming down in the middle)
    const a = add(EC, mul(norm(add(add(mul(f, 0.62), mul(l, sd * 0.62)), mul(u, 0.5 * (1 - burst)))), R * 1.02));
    const b = add(EC, mul(norm(add(mul(f, 0.93), mul(u, 0.3 * (1 - burst)))), R * 1.04));
    put('eye', `brow${sd}`, { k: 'rod', a, b, ra: 2.6 * z, rb: 2.0 * z, ramp: MOTTLE });
  }
  // --- weed and feelers hanging from under its rim ---
  for (let i = 0; i < 5; i++) {
    const a = (-60 + i * 30) * D;
    let w = add(EC, add(add(mul(f, R0 * 0.2), mul(l, Math.sin(a) * R0 * 0.85)), mul(u, -R0 * 0.75)));
    for (let k = 0; k < 3 + (i % 2); k++) {
      const next = add(w, [0.4 * Math.sin(t * 3 + i + k), 0.4 * Math.cos(t * 2.4 + i * 2 + k), -2.2 * z]);
      if (next[2] < 0.5) break;
      put('eye', `weed${i}_${k}`, { k: 'rod', a: w, b: next, ra: (0.75 - k * 0.12) * z, rb: (0.6 - k * 0.12) * z, ramp: i % 2 ? WEED : ARM });
      w = next;
    }
  }
  // --- its two lashing arms ---
  P.arms.forEach((sp, i) => armBits(sp, 3.6 * z, 0.7 * z, `arm${i}`, put, 7 + i * 2));
  // --- its iris's light ---
  const lit = (1 - cl01(P.lid * 1.4)) * (1 - cl01((P.dark ?? 0) * 2)) * (1 - burst);
  if (lit > 0.1) put('glow', 'glow', { k: 'glow', p: add(EC, mul(norm(P.look), R * 1.05)), c: FLAME[3], r: (8 + 4 * lit) * (0.6 + 0.4 * z) * (P.flare ?? 1), a: Math.min(0.7, 0.3 * lit * (P.flare ?? 1)) });
}

/** One frame of it from a pose: living (its pink edge) or not; drops of water and muck laid after. */
type Grain = [V3, string, number];
function paintSpawn(view: GameView, P: SpawnPose, t: number, grains: Grain[], living: boolean, under: Grain[] = [], burning: V3[] = []): Painted {
  const st = stage(view, ES_CANVAS.ax, ES_CANVAS.ay, ES_CANVAS);
  const bits: Bit[] = [];
  spawnBits(P, t, (part, piece, shape) => bits.push({ part, piece, shape }));
  for (const p of burning) bits.push({ part: 'glow', piece: 'burn', shape: { k: 'glow', p, c: FLAME[3], r: 18, a: 0.45 } });
  const lights = paintBits(st, bits, P.E);
  const px = st.whole(living ? ENEMY_RIM : null);
  // (what lies on the floor goes under it: only where nothing of it is painted)
  const lay = (pt: V3, col: string, size: number, onTop: boolean): void => {
    const [x, y] = st.at(pt);
    const xi = Math.round(x - 0.5);
    const yi = Math.round(y - 0.5);
    for (let dy = 0; dy < size; dy++) for (let dx = 0; dx < size; dx++) {
      const X = xi + dx;
      const Y = yi + dy;
      if (X < 0 || Y < 0 || X >= px.w || Y >= px.h) continue;
      if (!onTop && px.d[(Y * px.w + X) * 4 + 3] > 0) continue;
      px.set(X, Y, col);
    }
  };
  for (const [pt, col, size] of under) lay(pt, col, size, false);
  for (const [pt, col, size] of grains) lay(pt, col, size, true);
  return { px, lights };
}

// =============================================================================================
// ITS ARMS THAT LASH

/**
 * A lashing arm's spine: from its root on its side, out and up, curling over at its tip like a hook, an S running
 * along it; `wave` its phase, `rise` how high it rears (0 level, 1 reared), `reach` how far it uncoils (0 curled,
 * 1 straight out), `swing` how far round it is turned (degrees), `lag` how far its tip trails behind as it swings
 * (degrees, at its tip).
 */
function lashSpine(P: SpawnPose, i: number, A: ArmSpec): V3[] {
  const [f, l] = frameOf(P.face);
  const sd = i === 0 ? 1 : -1;
  const deg = ARM_AT[i] + A.swing;
  const out = add(mul(f, Math.cos(deg * D)), mul(l, Math.sin(deg * D)));
  const z = P.size;
  const root = add(P.E, add(mul(out, ES_R * 0.8 * z), [0, 0, -ES_R * 0.2 * z]));
  const side = norm(cross(UP, out), [0, 1, 0]);
  const pts: V3[] = [root];
  const n = 13;
  const step = 2.6 * z;
  let p = root;
  for (let k = 0; k < n; k++) {
    const s = (k + 0.5) / n;
    // (out and up from its root, curling over at its tip; uncoiling, it straightens)
    const calm = 1 - 0.6 * sm((A.reach - 0.35) / 0.65);
    const pitch = (-20 + A.rise * 70 + (1 - A.reach) * 150 * s * s + 16 * Math.sin(A.wave + s * 5) * calm) * D;
    const yaw = (sd * (14 * Math.sin(A.wave * 0.7 + s * 4 + i * 2) * calm + 25 * s * (1 - A.reach)) + A.lag * s * s) * D;
    const h = add(mul(out, Math.cos(yaw)), mul(side, Math.sin(yaw)));
    p = add(p, mul(add(mul(h, Math.cos(pitch)), mul(UP, Math.sin(pitch))), step));
    pts.push([p[0], p[1], Math.max(p[2], 1.2 * z)]);
  }
  return pts;
}

// =============================================================================================
// HOW IT IS POSED: a few numbers, eased from one to the next, then built

/** One lashing arm: its writhing phase, how high it rears, how far it uncoils, how far round it swings, how far its tip trails. */
export interface ArmSpec {
  wave: number;
  rise: number;
  reach: number;
  swing: number;
  lag: number;
}
/** Its pose as numbers: its eye's middle; which way its flesh faces and its iris looks (degrees round toward its left, and up); its lids, slit; its legs' tips; its two arms; how big; its eye swollen; its fire; its eye burst; how bright its iris. */
export interface Spec {
  E: V3;
  fy: number;
  fp: number;
  ly: number;
  lp: number;
  lid: number;
  slit: number;
  tips: V3[];
  arms: ArmSpec[];
  size: number;
  swell: number;
  dark: number;
  burst: number;
  flare: number;
}
/** Two poses as numbers, eased from the one (`k` 0) to the other (`k` 1). */
function mix(a: Spec, b: Spec, k: number): Spec {
  const w = cl01(k);
  const m = (x: number, y: number): number => x + (y - x) * w;
  return {
    E: lerp3(a.E, b.E, w),
    fy: m(a.fy, b.fy),
    fp: m(a.fp, b.fp),
    ly: m(a.ly, b.ly),
    lp: m(a.lp, b.lp),
    lid: m(a.lid, b.lid),
    slit: m(a.slit, b.slit),
    tips: a.tips.map((q, i) => lerp3(q, b.tips[i], w)),
    arms: a.arms.map((q, i) => ({ wave: m(q.wave, b.arms[i].wave), rise: m(q.rise, b.arms[i].rise), reach: m(q.reach, b.arms[i].reach), swing: m(q.swing, b.arms[i].swing), lag: m(q.lag, b.arms[i].lag) })),
    size: m(a.size, b.size),
    swell: m(a.swell, b.swell),
    dark: m(a.dark, b.dark),
    burst: m(a.burst, b.burst),
    flare: m(a.flare, b.flare),
  };
}
/** Its pose built from its numbers. */
function build(S: Spec): SpawnPose {
  const look = gaze(S.ly, S.lp);
  const face = norm([Math.cos(S.fy * D), Math.sin(S.fy * D), S.fp]);
  const P: SpawnPose = { E: S.E, face, look, lid: S.lid, slit: S.slit, tips: S.tips, arms: [], size: S.size, R: ES_R * S.size * S.swell, dark: S.dark, burst: S.burst, flare: S.flare };
  P.arms = S.arms.map((A, i) => lashSpine(P, i, A));
  return P;
}

// =============================================================================================
// ITS STAND

/** How far its eye is turned toward its right standing (degrees; toward one who sees it from in front, the hero it faces). */
const ES_TURN = -22;
/** Its stand: a 2.4 s round. */
export const ES_STAND = 2.4;
/** When it blinks, and where its eye darts, in its stand. */
export const ES_HABITS = { blink: [1.95, 2.25], dart: [0.6, 1.5] } as const;
/** Its legs' tips where it stands. */
function restTips(): V3[] {
  return LEG_AT.map((a) => [Math.cos(a * D) * LEG_OUT, Math.sin(a * D) * LEG_OUT * 0.95, 0] as V3);
}
/** Where its eye looks, `yaw` and `pitch` (degrees) from straight before it (a little down, at you). */
function gaze(yaw: number, pitch: number): V3 {
  const y = yaw * D;
  const p = (pitch - 8) * D;
  return [Math.cos(p) * Math.cos(y), Math.cos(p) * Math.sin(y), Math.sin(p)];
}
/**
 * ITS STAND: it heaves on its legs, swaying; its two arms writhing; one leg lifting and setting down again, shifting
 * its weight; its eye darting about, then fixing on you; a blink.
 */
export function standSpec(t: number): Spec {
  const k = fr(t / ES_STAND);
  const a = k * TAU;
  const heave = 1.8 * Math.sin(2 * a) + 0.8 * Math.sin(a + 0.6);
  const E: V3 = [1.0 * Math.sin(a + 0.4), 0.9 * Math.sin(a), ES_HIGH + heave];
  // (its eye darting: left, right and up, then fixing on you again)
  const T = k * ES_STAND;
  const darts: [number, number, number][] = [[0, 0, 0], [0.6, 28, 4], [0.85, -24, 10], [1.15, 10, -6], [1.5, 0, 0]];
  let yaw = 0;
  let pitch = 0;
  for (let i = 0; i < darts.length; i++) {
    const [t0, y1, p1] = darts[i];
    if (T >= t0) {
      const prev = darts[Math.max(0, i - 1)];
      const s = sm((T - t0) / 0.07);
      yaw = prev[1] + (y1 - prev[1]) * s;
      pitch = prev[2] + (p1 - prev[2]) * s;
    }
  }
  const blink = T > ES_HABITS.blink[0] && T < ES_HABITS.blink[1] ? Math.sin((Math.PI * (T - ES_HABITS.blink[0])) / (ES_HABITS.blink[1] - ES_HABITS.blink[0])) : 0;
  const tips = restTips();
  // (its front left leg lifted and set down a little further on, and back)
  const lift = T > 0.3 && T < 0.9 ? Math.sin((Math.PI * (T - 0.3)) / 0.6) : 0;
  tips[0] = add(tips[0], [2.5 * lift, 1.0 * lift, 5 * lift]);
  return {
    E,
    fy: ES_TURN + yaw * 0.4,
    fp: 0.16 + 0.04 * Math.sin(a),
    ly: ES_TURN + yaw,
    lp: pitch,
    lid: blink,
    slit: 0.2 + 0.05 * Math.sin(a * 3),
    tips,
    arms: [
      { wave: a * 2 + 0.3, rise: 0.55 + 0.15 * Math.sin(a), reach: 0.2 + 0.12 * Math.sin(a * 2), swing: 0, lag: 0 },
      { wave: a * 2 + 2.4, rise: 0.5 + 0.15 * Math.sin(a + 2), reach: 0.2 + 0.12 * Math.sin(a * 2 + 2), swing: 0, lag: 0 },
    ],
    size: 1,
    swell: 1,
    dark: 0,
    burst: 0,
    flare: 1,
  };
}
export function standPose(t: number): SpawnPose {
  return build(standSpec(t));
}
/** Water and muck dripping off it. */
function drips(P: SpawnPose, t: number): Grain[] {
  const out: Grain[] = [];
  for (let i = 0; i < 6; i++) {
    const k = fr(t * (0.9 + 0.2 * (i % 3)) + hash(i, 1, 905));
    const from = i < 3 ? add(P.E, [(hash(i, 2, 905) - 0.5) * 14 * P.size, (hash(i, 3, 905) - 0.5) * 14 * P.size, -ES_R * 0.8 * P.size]) : P.arms[i % 2][4 + (i % 4)];
    const z = from[2] * (1 - k * k);
    if (z < 0.3) continue;
    out.push([[from[0], from[1], z], i % 2 ? '#6f8a80' : '#4a5a50', 1]);
  }
  return out;
}

// =============================================================================================
// ITS HAUL

/** How fast it hauls itself along (tiles a second; its haul is painted for it), its frames and their rate. */
export const ES_PACE = 1.1;
export const ES_WALK = { frames: 12, fps: 15 } as const;
const ES_ROUND = ES_WALK.frames / ES_WALK.fps;
/** Its legs in two sets, by turns: while one set grips the floor, the other swings on. */
const SET_A = [0, 2, 4];
/**
 * ITS HAUL (his pick: hauling on its tentacles, in wet quick lurches, its eye rolling to keep on you): each leg grips
 * the floor where it came down until it lifts, the game carrying it on at its pace; it heaves itself on twice a round,
 * surging forward and down, its flesh rocking; its eye kept on you as it rocks; its arms trailing, writhing.
 */
export function haulSpec(t: number): Spec {
  const V = ES_PACE * TILE3;
  const T = ES_ROUND;
  const ph = fr(t / T);
  const a = ph * TAU;
  const half = (V * T) / 2;
  const rest = restTips();
  const tips = rest.map((q, i) => {
    const u = fr(ph + (SET_A.includes(i) ? 0 : 0.5));
    // (down: gripping, carried back under it as it goes on; up: swung on, curling up off the floor)
    if (u < 0.5) return [q[0] + half / 2 - (u / 0.5) * half, q[1], 0] as V3;
    const v = (u - 0.5) / 0.5;
    const g = v * v * (3 - 2 * v);
    return [q[0] - half / 2 + g * half, q[1] * (1 + 0.15 * Math.sin(Math.PI * v)), 7 * Math.sin(Math.PI * v)] as V3;
  });
  // (twice a round it heaves itself on: surging forward and dropping as it pulls, rising as it gathers)
  const surge = Math.sin(2 * a);
  const E: V3 = [3.5 * surge, 1.2 * Math.sin(a), ES_HIGH - 2 + 2.6 * Math.cos(2 * a)];
  return {
    E,
    fy: 0 + 4 * Math.sin(a),
    fp: 0.16 - 0.14 * surge,
    // (its eye kept on you while its flesh rocks)
    ly: ES_TURN * 0.5,
    lp: -2,
    lid: 0,
    slit: 0.18,
    tips,
    arms: [
      { wave: a * 2 + 0.3, rise: 0.35 + 0.15 * Math.cos(2 * a), reach: 0.35, swing: 35, lag: -30 * surge },
      { wave: a * 2 + 2.4, rise: 0.3 + 0.15 * Math.cos(2 * a + 1), reach: 0.35, swing: -35, lag: -30 * surge },
    ],
    size: 1,
    swell: 1,
    dark: 0,
    burst: 0,
    flare: 1,
  };
}
/** Muck flung off its legs as they lift. */
function haulGrains(S: Spec, t: number): Grain[] {
  const out: Grain[] = [];
  S.tips.forEach((q, i) => {
    if (q[2] < 0.5 || q[2] > 5) return;
    for (let j = 0; j < 2; j++) out.push([[q[0] - 2 - j * 2, q[1] + (hash(i, j, 911) - 0.5) * 4, q[2] * 0.5 + j], j ? '#4a5a50' : '#30402c', 1]);
  });
  void t;
  return out;
}

// =============================================================================================
// ITS LASH, ITS BASIC ATTACK

/** ITS LASH (his pick): how long; when its arm whips through before it (a frame of the game's thirty a second); its warning; how far it reaches (tiles). */
export const ES_LASH = { long: 1.1, hit: 16 / 30, warn: [0.25, 0.42], reach: 1.15 } as const;
/**
 * It rears back on its legs, its eye narrowing, and coils its left arm back and up behind it, trembling (the
 * warning); it lunges and whips the arm across before it, low, from its left round to its right, its tip trailing and
 * then cracking past; it recoils, and its arm writhes back.
 */
export function lashSpec(t: number): Spec {
  const s0 = standSpec(0);
  const H = ES_LASH.hit;
  const cocked: Spec = { ...s0, E: [-4.5, 2, ES_HIGH + 4], fy: 28, fp: 0.3, ly: 6, lp: -4, lid: 0.3, slit: 0.1, arms: [{ wave: 1.2, rise: 1.0, reach: 0.25, swing: 30, lag: 50 }, { ...s0.arms[1], rise: 0.25, swing: -20 }] };
  const struck: Spec = { ...s0, E: [6, -0.5, ES_HIGH - 3.5], fy: -12, fp: 0.02, ly: -8, lp: -6, lid: 0.15, slit: 0.08, arms: [{ wave: 2.0, rise: 0.05, reach: 1, swing: -72, lag: 40 }, { ...s0.arms[1], rise: 0.6, swing: -30 }] };
  const past: Spec = { ...struck, E: [4, -1.5, ES_HIGH - 2], fy: -38, arms: [{ wave: 2.6, rise: 0.15, reach: 0.85, swing: -150, lag: -60 }, struck.arms[1]] };
  const end = standSpec(0);
  if (t < ES_LASH.warn[0]) return mix(s0, cocked, sm(t / ES_LASH.warn[0]));
  if (t < ES_LASH.warn[1]) {
    // (held, trembling)
    const q = Math.sin(t * TAU * 16);
    const c = { ...cocked, arms: [{ ...cocked.arms[0], wave: cocked.arms[0].wave + 0.25 * q, swing: cocked.arms[0].swing + 3 * q }, cocked.arms[1]] };
    return { ...c, E: add(c.E, [0.4 * q, 0, 0.3 * q]) };
  }
  if (t < H) {
    const u = (t - ES_LASH.warn[1]) / (H - ES_LASH.warn[1]);
    return mix(cocked, struck, u * u);
  }
  if (t < H + 0.1) return mix(struck, past, (t - H) / 0.1);
  return mix(past, end, sm((t - H - 0.1) / (ES_LASH.long - H - 0.1)));
}
/** Spray off its arm as it whips, and a smear of its tip's path. */
function lashGrains(P: SpawnPose, t: number): Grain[] {
  const out: Grain[] = [];
  if (t > ES_LASH.warn[1] && t < ES_LASH.hit + 0.12) {
    for (let j = 1; j <= 7; j++) {
      const back = build(lashSpec(t - j * 0.01)).arms[0];
      for (let k = 5; k < back.length; k++) out.push([back[k], j < 3 ? '#c2b6a0' : j < 5 ? '#9c9282' : '#6f6656', 1]);
    }
  }
  if (t > ES_LASH.hit - 0.03 && t < ES_LASH.hit + 0.3) {
    const s = t - ES_LASH.hit + 0.03;
    const tip = P.arms[0][P.arms[0].length - 1];
    for (let i = 0; i < 8; i++) out.push([[tip[0] + (hash(i, 1, 913) - 0.3) * 30 * s, tip[1] - 40 * s * hash(i, 2, 913), Math.max(0.3, tip[2] + 30 * s - 120 * s * s)], i % 2 ? '#6f8a80' : '#9aaaa0', 1]);
  }
  return out;
}

// =============================================================================================
// ITS GAZE BEAM, ITS BIG ATTACK

/**
 * ITS GOLD GAZE BEAM (his pick): how long; its warning (its eye narrowing, a line of light flickering on the floor
 * where it will burn); when its beam burns (it strikes the floor before its legs and runs out along the line to its
 * reach); how far it reaches (tiles); when the burnt line is gone.
 */
export const ES_GAZE = { long: 2.2, warn: [0.15, 0.95], beam: [1.0, 1.65], near: 0.4, reach: 2.6, clear: 2.2 } as const;
/** Where its beam strikes the floor, `t` seconds in (null when it does not burn): along its forward, from `near` to `reach` tiles. */
export function beamAt(t: number): V3 | null {
  if (t < ES_GAZE.beam[0] || t > ES_GAZE.beam[1]) return null;
  const u = (t - ES_GAZE.beam[0]) / (ES_GAZE.beam[1] - ES_GAZE.beam[0]);
  const x = (ES_GAZE.near + (ES_GAZE.reach - ES_GAZE.near) * sm(u)) * TILE3;
  return [x, 0, 0];
}
export function gazeSpec(t: number): Spec {
  const s0 = standSpec(0);
  const G = ES_GAZE;
  // (reared up, braced, its arms spread up and wide, its face on the line, its eye narrowing to a slit)
  const reared: Spec = { ...s0, E: [-2.5, 0, ES_HIGH + 5], fy: 0, fp: 0.05, ly: 0, lp: -14, lid: 0.32, slit: 0.06, flare: 2.2, tips: restTips().map((q) => [q[0] * 1.15, q[1] * 1.15, 0] as V3), arms: [{ wave: 0.8, rise: 1.2, reach: 0.6, swing: 25, lag: 0 }, { wave: 2.6, rise: 1.2, reach: 0.6, swing: -25, lag: 0 }] };
  if (t < G.warn[0]) return mix(s0, reared, sm(t / G.warn[0]));
  if (t < G.beam[0]) {
    // (gathering: trembling harder and harder, its arms writhing)
    const k = (t - G.warn[0]) / (G.beam[0] - G.warn[0]);
    const q = Math.sin(t * TAU * (10 + 10 * k)) * (0.3 + 0.9 * k);
    return { ...reared, E: add(reared.E, [0.4 * q, 0.3 * q, 0.3 * q]), arms: reared.arms.map((A, i) => ({ ...A, wave: A.wave + t * 9 + i, rise: A.rise + 0.15 * q })), flare: 2.2 + 1.2 * k };
  }
  if (t < G.beam[1]) {
    // (BURNING: its eye wide, its beam running out along the line, the beam's force rocking it back)
    const u = (t - G.beam[0]) / (G.beam[1] - G.beam[0]);
    const hit = beamAt(t) ?? [G.reach * TILE3, 0, 0];
    const lp = -Math.atan2(ES_HIGH + 5, hit[0] + 2.5) / D + 8;
    const q = Math.sin(t * TAU * 22);
    return { ...reared, E: add(reared.E, [-1.5 - 1.0 * u + 0.4 * q, 0, 0.3 * q]), lid: 0.05, slit: 0.04, lp, flare: 3.6, arms: reared.arms.map((A, i) => ({ ...A, wave: A.wave + t * 12 + i, rise: A.rise + 0.2, reach: 0.8 })) };
  }
  // (spent: its eye squeezed shut hard, then open; settling back)
  const u = (t - G.beam[1]) / (G.long - G.beam[1]);
  const shut = u < 0.45 ? Math.sin(Math.PI * Math.min(1, u / 0.45)) : 0;
  const m = mix({ ...reared, lp: -40, flare: 1 }, s0, sm(u));
  return { ...m, lid: Math.max(m.lid, shut) };
}
/** The beam itself, the line of its warning and the burning line it leaves, laid on its picture: under it (on the floor) and over it (its beam). */
function gazeMarks(t: number, P: SpawnPose): { under: Grain[]; over: Grain[]; lights: V3[] } {
  const G = ES_GAZE;
  const under: Grain[] = [];
  const over: Grain[] = [];
  const lights: V3[] = [];
  const x0 = G.near * TILE3;
  const x1 = G.reach * TILE3;
  // THE WARNING: a line of light flickering on the floor where it will burn, pink to gold as it comes
  if (t > G.warn[0] && t < G.beam[0]) {
    const k = (t - G.warn[0]) / (G.beam[0] - G.warn[0]);
    const flick = hash(Math.floor(t * 20), 1, 915);
    for (let x = x0; x <= x1; x += 0.8) {
      if (hash(Math.floor(x * 2), Math.floor(t * 20), 916) > 0.45 + 0.5 * k) continue;
      const w = 0.6 * Math.sin(x * 0.7 + t * 9);
      const c = k > 0.6 && flick > 0.3 ? FLAME[3] : k > 0.3 ? FLAME[2] : FLAME[1];
      under.push([[x, w, 0.1], c, 2]);
      if (k > 0.5 && hash(Math.floor(x * 2), 3, 916) > 0.6) under.push([[x, w + 1.6, 0.1], FLAME[1], 1]);
    }
    // (sparks drawn into its iris)
    const iris = add(add(P.E, mul(P.face, 1.5)), mul(P.look, P.R * 1.02));
    for (let i = 0; i < 10; i++) {
      const v = fr(t * 2.2 + i / 10);
      const from: V3 = add(iris, [Math.cos(i * 2.3) * 18, Math.sin(i * 2.3) * 18, Math.sin(i * 1.7) * 12]);
      over.push([lerp3(from, iris, v * v), v > 0.6 ? FLAME[4] : FLAME[2], 1]);
    }
  }
  // THE BURNING LINE: scorched where its beam has run, embers glowing in it, flames licking up; fading by its end
  const hit = beamAt(t);
  const ran = hit ? hit[0] : t >= G.beam[1] ? x1 : 0;
  if (ran > x0) {
    const cool = t > G.beam[1] ? cl01((t - G.beam[1]) / (G.clear - G.beam[1])) : 0;
    for (let x = x0; x <= ran; x += 0.8) {
      for (const y of [-2.2, -1.1, 0, 1.1, 2.2]) {
        const h = hash(Math.floor(x * 3), y + 3, 917);
        if (h < cool) continue;
        const hot = x > ran - 8 && !cool;
        const glow = hash(Math.floor(x * 3), Math.floor(t * 12) + y, 918);
        under.push([[x, y + 0.5 * Math.sin(x * 0.5), 0.1], hot ? FLAME[4] : glow > 0.7 - 0.5 * cool ? '#1a1012' : glow > 0.4 ? FLAME[1] : FLAME[2], 1]);
      }
      // (flames licking up off it)
      if (hash(Math.floor(x * 2), 1, 919) > 0.45 && cool < 0.7) {
        const life = fr(t * 3 + hash(Math.floor(x * 2), 2, 919));
        over.push([[x, (hash(Math.floor(x * 2), 3, 919) - 0.5) * 3, 1 + 9 * life * (1 - cool)], life < 0.35 ? FLAME[4] : life < 0.7 ? FLAME[3] : FLAME[1], life < 0.3 ? 2 : 1]);
      }
    }
  }
  // ITS BEAM: from its iris to where it strikes, a white-gold core in a burning sheath; sparks and stones flung where it strikes
  if (hit) {
    const iris = add(add(P.E, mul(P.face, 1.5)), mul(P.look, P.R * 1.02));
    const d = Math.hypot(...sub(hit, iris));
    const nseg = Math.ceil(d / 0.5);
    for (let i = 0; i <= nseg; i++) {
      const p = lerp3(iris, hit, i / nseg);
      const w = 1.6 + 2.2 * (i / nseg);
      over.push([p, '#fff6d8', 2]);
      for (const o of [-1, 1]) {
        over.push([add(p, [0, o * w * 0.55, o * w * 0.3]), FLAME[4], 1]);
        over.push([add(p, [0, o * w, o * w * 0.5]), hash(i, o + 2 + Math.floor(t * 30), 921) > 0.5 ? FLAME[3] : FLAME[2], 1]);
      }
    }
    for (let i = 0; i < 10; i++) {
      const v = fr(t * 4 + i / 10);
      over.push([add(hit, [(hash(i, 1, 923) - 0.5) * 14 * v, (hash(i, 2, 923) - 0.5) * 14 * v, 2 + 14 * v - 16 * v * v]), i % 3 ? FLAME[3] : '#3a3846', i % 4 ? 1 : 2]);
    }
    lights.push(hit, iris);
  }
  return { under, over, lights };
}

// =============================================================================================
// STRUCK, AND ITS DEATH

/** STRUCK: how long. Its eye squeezed shut, knocked back, its arms flung out, a spurt off it; back as it stood. */
export const ES_REEL = 0.4;
export function reelSpec(t: number): Spec {
  const s0 = standSpec(0);
  const u = cl01(t / ES_REEL);
  const k = u < 0.2 ? sm(u / 0.2) : 1 - sm((u - 0.2) / 0.8);
  const hit: Spec = { ...s0, E: [-5, 1, ES_HIGH + 1.5], fy: ES_TURN + 25, fp: 0.35, ly: ES_TURN + 25, lp: 15, lid: 0.95, slit: 0.3, arms: [{ wave: 3, rise: 1.3, reach: 0.9, swing: 30, lag: -50 }, { wave: 1, rise: 1.2, reach: 0.9, swing: -30, lag: 50 }] };
  return mix(s0, hit, k);
}
/** ITS DEATH (his pick: its eye bursts): how long; when its eye bursts; when it lies slumped. */
export const ES_DIE = { long: 1.8, burst: 0.45, slump: [0.45, 1.3] } as const;
const GUSH = GUSH_C;
export function dyingSpec(t: number): Spec {
  const s0 = standSpec(0);
  const B = ES_DIE.burst;
  if (t < B) {
    // (it swells and shudders, its eye bulging, its arms thrashing, its fire flaring wild)
    const u = t / B;
    const q = Math.sin(t * TAU * 18);
    const thrash: Spec = { ...s0, E: [q * 1.2, -q, ES_HIGH + 4 * u], fp: 0.25, lid: 0, slit: 0.35 + 0.3 * u, flare: 1 + 1.5 * u, swell: 1 + 0.32 * u * u, arms: [{ wave: t * 30, rise: 1.2 + 0.3 * q, reach: 0.7, swing: 40 * q, lag: 40 * q }, { wave: t * 30 + 2, rise: 1.1 - 0.3 * q, reach: 0.7, swing: -40 * q, lag: -40 * q }] };
    return mix(s0, thrash, sm(u * 3));
  }
  // (IT BURSTS: its eye torn open and emptied, its fire out; it slumps into a slack heap, its legs splayed, its arms flopped down)
  const u = sm((t - B) / (ES_DIE.slump[1] - B));
  const heap: Spec = {
    ...s0,
    E: [-1, 0, 12],
    fy: ES_TURN,
    fp: 0.6,
    lid: 0,
    slit: 0.5,
    swell: 0.9,
    dark: 1,
    burst: 1,
    flare: 0,
    tips: restTips().map((q) => [q[0] * 1.35, q[1] * 1.35, 0] as V3),
    arms: [{ wave: 4, rise: -0.6, reach: 0.95, swing: 30, lag: 30 }, { wave: 5, rise: -0.6, reach: 0.95, swing: -30, lag: -30 }],
  };
  const at: Spec = { ...dyingSpec(B - 0.001), burst: 0, dark: 0 };
  const m = mix(at, heap, u);
  // (its eye bursts at once, its fire going out over a moment)
  return { ...m, burst: sm((t - B) / 0.12), dark: sm((t - B) / 0.25) };
}
/** The gush of its eye bursting, and the puddle it leaves. */
function dyingGrains(t: number, P: SpawnPose): { under: Grain[]; over: Grain[] } {
  const under: Grain[] = [];
  const over: Grain[] = [];
  const B = ES_DIE.burst;
  if (t < B) return { under, over };
  const s = t - B;
  const [f] = frameOf(P.face);
  const from = add(P.E, mul(f, ES_R));
  // (the gush: flung forward and up, falling, splashing where it lands)
  for (let i = 0; i < 72; i++) {
    const a = (hash(i, 1, 925) - 0.5) * 2.6;
    const dir: V3 = norm(add(mul(f, Math.cos(a)), [Math.sin(a) * f[1] * -1, Math.sin(a) * f[0], 0]), f);
    const sp = 30 + 55 * hash(i, 2, 925);
    const up = 15 + 40 * hash(i, 3, 925);
    const g = 200;
    const z0 = 34;
    const land = (up + Math.sqrt(up * up + 2 * g * z0)) / g;
    const fl = Math.min(s, land);
    const p: V3 = [from[0] + dir[0] * sp * fl, from[1] + dir[1] * sp * fl, s < land ? Math.max(0.2, z0 + up * fl - (g / 2) * fl * fl) : 0.1];
    const col = GUSH[i % 5];
    if (s < land) over.push([p, col, i % 2 ? 1 : 2]);
    else if (i % 2) under.push([p, col, 1]);
  }
  // (the puddle of it spreading under it)
  const r = 26 * sm(s / 0.8);
  for (let y = -r; y <= r; y += 1.0) for (let x = -r; x <= r; x += 1.0) {
    const d = Math.hypot(x, y * 1.2) / Math.max(1, r);
    if (d > 1 - 0.15 * hash(Math.floor(x), Math.floor(y), 927)) continue;
    under.push([[x + 6, y, 0.1], d < 0.5 ? (hash(Math.floor(x), Math.floor(y), 928) > 0.7 ? GUSH[1] : GUSH[2]) : hash(Math.floor(x), Math.floor(y), 929) > 0.6 ? GUSH[3] : GUSH[4], 1]);
  }
  return { under, over };
}

// =============================================================================================
// HATCHING OUT OF HIS EGG

/** HATCHING (out of the Eye's egg, where it bursts: EYE_SPAWN.hatch): how long; when it unfurls; when its eye opens. */
export const ES_HATCH = { long: 1.3, unfurl: [0.15, 0.75], open: [0.75, 0.95] } as const;
/**
 * A wet curled ball in the burst egg, shivering, its arms and legs wrapped round its shut eye; it unfurls, its legs
 * flung out and slapping down, rising, growing to its height; its eye snaps open and its iris lights, with a shriek;
 * it settles into its stand.
 */
export function hatchSpec(t: number): Spec {
  const s0 = standSpec(0);
  const H = ES_HATCH;
  const curled: Spec = { ...s0, E: [0, 0, 7.5], fp: 0.9, ly: 0, lp: 30, lid: 1, slit: 0.2, size: 0.5, tips: restTips().map((q) => [q[0] * 0.45, q[1] * 0.45, 2.5] as V3), arms: [{ wave: 0, rise: 0.2, reach: 0, swing: 80, lag: 60 }, { wave: 1, rise: 0.2, reach: 0, swing: -80, lag: -60 }] };
  const flung: Spec = { ...s0, E: [0, 0, ES_HIGH + 4], fp: 0.3, lid: 1, size: 1, tips: restTips().map((q) => [q[0] * 1.15, q[1] * 1.15, 0] as V3), arms: [{ wave: 2, rise: 1.4, reach: 0.9, swing: 20, lag: -30 }, { wave: 3, rise: 1.4, reach: 0.9, swing: -20, lag: 30 }] };
  if (t < H.unfurl[0]) {
    const q = Math.sin(t * TAU * 14);
    return { ...curled, E: add(curled.E, [0.5 * q, 0.4 * q, 0]) };
  }
  if (t < H.unfurl[1]) {
    const u = (t - H.unfurl[0]) / (H.unfurl[1] - H.unfurl[0]);
    // (its legs flung out first, slapping down; it rises after them)
    const m = mix(curled, flung, sm(u));
    const legs = curled.tips.map((q, i) => {
      const v = cl01(u * 1.6 - i * 0.08);
      const g = sm(v);
      const p = lerp3(q, flung.tips[i], g);
      return [p[0], p[1], p[2] * (1 - g) + 9 * Math.sin(Math.PI * v) * (1 - g * 0.5)] as V3;
    });
    return { ...m, tips: legs.map((p) => [p[0], p[1], Math.max(0, p[2])] as V3) };
  }
  if (t < H.open[1]) {
    // (its eye snaps open)
    const u = (t - H.open[0]) / (H.open[1] - H.open[0]);
    return { ...flung, lid: 1 - sm(u * 1.5), flare: 1 + 1.8 * Math.sin(Math.PI * u) };
  }
  return mix({ ...flung, lid: 0 }, s0, sm((t - H.open[1]) / (H.long - H.open[1])));
}
function hatchGrains(t: number, P: SpawnPose): Grain[] {
  const out: Grain[] = [];
  // (slime and muck flung off it as it unfurls, dripping off it)
  if (t > ES_HATCH.unfurl[0] && t < ES_HATCH.unfurl[1] + 0.3) {
    const s = t - ES_HATCH.unfurl[0];
    for (let i = 0; i < 18; i++) {
      const a = hash(i, 1, 931) * TAU;
      const sp = 20 + 30 * hash(i, 2, 931);
      const up = 20 + 30 * hash(i, 3, 931);
      const z = 6 + up * s - 100 * s * s;
      if (z < 0.2) continue;
      out.push([[Math.cos(a) * sp * s, Math.sin(a) * sp * s, z], i % 3 ? '#6e7c46' : '#b6bf52', 1]);
    }
  }
  return [...out, ...drips(P, t)];
}

// =============================================================================================
// ITS PICTURES

/** One frame of the eyespawn: `which` (stand, walk, attack (its lash), gaze, reel, dying, hatch), `t` seconds in, from in front or behind. */
export function eyespawnPainted(which: string, t: number, view: GameView = 'front'): Painted {
  if (which === 'walk') {
    const S = haulSpec(t);
    const P = build(S);
    return paintSpawn(view, P, t, [...haulGrains(S, t), ...drips(P, t)], true);
  }
  if (which === 'attack') {
    const P = build(lashSpec(t));
    return paintSpawn(view, P, t, [...lashGrains(P, t), ...drips(P, t)], true);
  }
  if (which === 'gaze') {
    const P = build(gazeSpec(t));
    const m = gazeMarks(t, P);
    return paintSpawn(view, P, t, [...m.over, ...drips(P, t)], true, m.under, m.lights);
  }
  if (which === 'reel') {
    const P = build(reelSpec(t));
    const spurt: Grain[] = [];
    for (let i = 0; i < 8; i++) {
      const s = t;
      spurt.push([add(P.E, [-(4 + 18 * hash(i, 1, 933)) * s * 2, (hash(i, 2, 933) - 0.5) * 30 * s, Math.max(-P.E[2] + 0.3, 6 + 30 * s - 150 * s * s)]), i % 2 ? '#6f8a80' : '#b8ae84', 1]);
    }
    return paintSpawn(view, P, t, [...spurt, ...drips(P, t)], true);
  }
  if (which === 'dying') {
    const P = build(dyingSpec(t));
    const g = dyingGrains(t, P);
    return paintSpawn(view, P, t, g.over, false, g.under);
  }
  if (which === 'hatch') {
    const P = build(hatchSpec(t));
    return paintSpawn(view, P, t, hatchGrains(t, P), true);
  }
  const P = standPose(t);
  return paintSpawn(view, P, t, drips(P, t), true);
}
/** Its pose at a moment of a move (for the tests and the game's own reckoning of where its arm and beam are). */
export function eyespawnPose(which: string, t: number): SpawnPose {
  const spec = which === 'walk' ? haulSpec(t) : which === 'attack' ? lashSpec(t) : which === 'gaze' ? gazeSpec(t) : which === 'reel' ? reelSpec(t) : which === 'dying' ? dyingSpec(t) : which === 'hatch' ? hatchSpec(t) : standSpec(t);
  return build(spec);
}
/** One frame, as the game holds a figure. */
export function eyespawnFrame(which: string, t: number, view: GameView = 'front'): Sprite {
  return toSprite(eyespawnPainted(which, t, view), null, ES_CANVAS.ax, ES_CANVAS.ay);
}
/** Its stand's frames: 24 at ten a second. */
export const ES_IDLE = { frames: 24, fps: 10 } as const;

/** THE EYESPAWN, as the game holds a monster's pictures: its stand, its haul (painted for ES_PACE), its lash (its basic attack), its gaze beam (its big attack, a move of its own), struck, its death; and hatching. */
export function makeEyespawnArt(): ActorArt {
  const set = (view: GameView): AnimSet => {
    const frame = (which: string, t: number): Sprite => toSprite(eyespawnPainted(which, t, view), which === 'dying' ? null : { x: ES_CANVAS.ax, y: ES_CANVAS.ay - 30, r: 30, color: '#ff3a78', a: 0.08 }, ES_CANVAS.ax, ES_CANVAS.ay);
    const clip = (which: string, long: number, fps: number, hit?: number): Clip => ({ frames: lazyFrames(Math.round(long * fps) + 1, (i) => frame(which, i / fps)), fps, ...(hit === undefined ? {} : { hit }) });
    const attack = clip('attack', ES_LASH.long, 30, ES_LASH.hit);
    return {
      idle: lazyFrames(ES_IDLE.frames, (i) => frame('stand', i / ES_IDLE.fps)),
      walk: lazyFrames(ES_WALK.frames, (i) => frame('walk', i / ES_WALK.fps)),
      attack: lazyFrames(3, (i) => attack.frames[[9, 16, 24][i]]),
      idleFps: ES_IDLE.fps,
      walkFps: ES_WALK.fps,
      clips: { attack, die: clip('dying', ES_DIE.long, 20), reel: clip('reel', ES_REEL, 30), moves: { gaze: clip('gaze', ES_GAZE.long, 30, ES_GAZE.beam[0]), hatch: clip('hatch', ES_HATCH.long, 30) } },
    };
  };
  return { front: set('front'), back: set('back') };
}
