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
// LOOK FIRST (his rule): this file holds its look and its stand; its moves follow his yes to them.

import type { Sprite } from '../engine/px';
import type { ActorArt, AnimSet } from './actor_types';
import { hash, lazyFrames, toSprite } from './kit';
import type { Painted, Ramp } from './kit';
import { ENEMY_RIM, FLAME } from './mkit';
import { paintBits } from './new_mobs3';
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
  return add(P.E, add(mul(out, ES_R * 0.55), [0, 0, -ES_R * 0.62]));
}

/** A leg's spine: from its root out and over in an arch, down to its tip on the floor, its end curled along the floor. */
function legSpine(P: SpawnPose, i: number): V3[] {
  const root = legRoot(P, LEG_AT[i]);
  const tip = P.tips[i];
  const out = norm([tip[0] - root[0], tip[1] - root[1], 0], [1, 0, 0]);
  const side = norm(cross(UP, out), [0, 1, 0]);
  const arch = bez(root, add(root, add(mul(out, 9), [0, 0, 3])), add(tip, add(mul(out, -3), [0, 0, 12])), add(tip, [0, 0, 1.8]), 9).map((q, k) => {
    // (a tentacle, not a leg: it winds as it goes)
    const s = k / 9;
    return add(q, mul(side, 2.2 * Math.sin(Math.PI * s) * Math.sin(Math.PI * s * 2 + i * 1.9 + P.E[2] * 0.15)));
  });
  const lift = tip[2];
  const curl = i % 2 ? 1 : -1;
  arch.push(add(tip, add(mul(out, 2.6), add(mul(side, 1.2 * curl), [0, 0, 1.0]))));
  arch.push(add(tip, add(mul(out, 3.6), add(mul(side, 3.2 * curl), [0, 0, 0.8 + 0.4 * (lift > 0.5 ? 1 : 0)]))));
  return arch;
}

/** THE EYESPAWN AS SOLIDS: its legs, its flesh cupping its eye, its knotted rim and scowling brow, its eye, its lashing arms, weed hanging off it. */
function spawnBits(P: SpawnPose, t: number, put: Put): void {
  const [f, l, u] = frameOf(P.face);
  const E = P.E;
  // --- its legs ---
  for (let i = 0; i < LEG_AT.length; i++) armBits(legSpine(P, i), 4.4, 1.0, `leg${i}`, put, i * 1.3);
  // --- its flesh: a cup round the back of its eye, wrinkled, wet ---
  put('flesh', 'cup', { k: 'ball', c: add(E, add(mul(f, -8), mul(u, -2.5))), ax: [mul(f, ES_R * 0.8), mul(l, ES_R * 0.98), mul(u, ES_R * 0.82)], skin: fleshSkin(1) });
  // --- its eye ---
  const EC = add(E, mul(f, 1.5));
  put('eye', 'eye', { k: 'ball', c: EC, ax: [[ES_R, 0, 0], [0, ES_R, 0], [0, 0, ES_R]], skin: eyeSkin(P, f, u) });
  // --- the knotted rim of flesh round it, and its brow scowling down over it in a V ---
  for (let i = 0; i < 14; i++) {
    const a = (i / 14) * TAU;
    const r = ES_R * 0.93;
    const c = add(EC, add(mul(f, ES_R * 0.42), add(mul(l, Math.cos(a) * r * 0.95), mul(u, Math.sin(a) * r * 0.95))));
    const s = 1.5 + 0.7 * hash(i, 1, 901);
    put('eye', `rim${i}`, { k: 'ball', c, ax: [mul(f, s * 0.9), mul(l, s), mul(u, s)], skin: (q, tone) => (q[0] > 0.6 && tone >= 3 ? MOTTLE[tone] : BULK[Math.max(1, tone)]) });
  }
  for (const sd of [1, -1]) {
    // (just over its iris, coming down in the middle)
    const a = add(EC, mul(norm(add(add(mul(f, 0.62), mul(l, sd * 0.62)), mul(u, 0.5))), ES_R * 1.02));
    const b = add(EC, mul(norm(add(mul(f, 0.93), mul(u, 0.3))), ES_R * 1.04));
    put('eye', `brow${sd}`, { k: 'rod', a, b, ra: 2.6, rb: 2.0, ramp: MOTTLE });
  }
  // --- weed and feelers hanging from under its rim ---
  for (let i = 0; i < 5; i++) {
    const a = (-60 + i * 30) * D;
    let w = add(EC, add(add(mul(f, ES_R * 0.2), mul(l, Math.sin(a) * ES_R * 0.85)), mul(u, -ES_R * 0.75)));
    for (let k = 0; k < 3 + (i % 2); k++) {
      const next = add(w, [0.4 * Math.sin(t * 3 + i + k), 0.4 * Math.cos(t * 2.4 + i * 2 + k), -2.2]);
      put('eye', `weed${i}_${k}`, { k: 'rod', a: w, b: next, ra: 0.75 - k * 0.12, rb: 0.6 - k * 0.12, ramp: i % 2 ? WEED : ARM });
      w = next;
    }
  }
  // --- its two lashing arms ---
  P.arms.forEach((sp, i) => armBits(sp, 3.6, 0.7, `arm${i}`, put, 7 + i * 2));
  // --- its iris's light ---
  const lit = (1 - cl01(P.lid * 1.4)) * (1 - cl01((P.dark ?? 0) * 2));
  if (lit > 0.1) put('glow', 'glow', { k: 'glow', p: add(EC, mul(norm(P.look), ES_R * 1.05)), c: FLAME[3], r: 8 + 4 * lit, a: 0.3 * lit });
}

/** One frame of it from a pose: living (its pink edge) or not; drops of water and muck laid after. */
type Grain = [V3, string, number];
function paintSpawn(view: GameView, P: SpawnPose, t: number, grains: Grain[], living: boolean): Painted {
  const st = stage(view, ES_CANVAS.ax, ES_CANVAS.ay, ES_CANVAS);
  const bits: Bit[] = [];
  spawnBits(P, t, (part, piece, shape) => bits.push({ part, piece, shape }));
  const lights = paintBits(st, bits, P.E);
  const px = st.whole(living ? ENEMY_RIM : null);
  for (const [pt, col, size] of grains) {
    const [x, y] = st.at(pt);
    const xi = Math.round(x - 0.5);
    const yi = Math.round(y - 0.5);
    for (let dy = 0; dy < size; dy++) for (let dx = 0; dx < size; dx++) if (xi + dx >= 0 && yi + dy >= 0 && xi + dx < px.w && yi + dy < px.h) px.set(xi + dx, yi + dy, col);
  }
  return { px, lights };
}

// =============================================================================================
// ITS ARMS THAT LASH

/**
 * A lashing arm's spine: from its root on its side, out and up, curling over at its tip like a hook, an S running
 * along it; `wave` its phase, `rise` how high it rears (0 hanging, 1 reared), `reach` how far it uncoils (0 curled,
 * 1 straight out), `swing` how far round it is turned (degrees).
 */
function lashSpine(P: SpawnPose, i: number, wave: number, rise: number, reach = 0.3, swing = 0): V3[] {
  const [f, l] = frameOf(P.face);
  const sd = i === 0 ? 1 : -1;
  const deg = ARM_AT[i] + swing;
  const out = add(mul(f, Math.cos(deg * D)), mul(l, Math.sin(deg * D)));
  const root = add(P.E, add(mul(out, ES_R * 0.8), [0, 0, -ES_R * 0.2]));
  const side = norm(cross(UP, out), [0, 1, 0]);
  const pts: V3[] = [root];
  const n = 13;
  const step = 2.6;
  let p = root;
  for (let k = 0; k < n; k++) {
    const s = (k + 0.5) / n;
    // (out and up from its root, curling over at its tip; uncoiling, it straightens)
    const pitch = (-20 + rise * 70 + (1 - reach) * 150 * s * s + 16 * Math.sin(wave + s * 5)) * D;
    const yaw = (sd * (14 * Math.sin(wave * 0.7 + s * 4 + i * 2) + 25 * s * (1 - reach))) * D;
    const h = add(mul(out, Math.cos(yaw)), mul(side, Math.sin(yaw)));
    p = add(p, mul(add(mul(h, Math.cos(pitch)), mul(UP, Math.sin(pitch))), step));
    pts.push(p);
  }
  return pts;
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
export function standPose(t: number): SpawnPose {
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
  const look = gaze(ES_TURN + yaw, pitch);
  const face = norm([Math.cos((ES_TURN + yaw * 0.4) * D), Math.sin((ES_TURN + yaw * 0.4) * D), 0.16 + 0.04 * Math.sin(a)]);
  const blink = T > ES_HABITS.blink[0] && T < ES_HABITS.blink[1] ? Math.sin((Math.PI * (T - ES_HABITS.blink[0])) / (ES_HABITS.blink[1] - ES_HABITS.blink[0])) : 0;
  const tips = restTips();
  // (its front left leg lifted and set down a little further on, and back)
  const lift = T > 0.3 && T < 0.9 ? Math.sin((Math.PI * (T - 0.3)) / 0.6) : 0;
  tips[0] = add(tips[0], [2.5 * lift, 1.0 * lift, 5 * lift]);
  const P: SpawnPose = { E, face, look, lid: blink, slit: 0.2 + 0.05 * Math.sin(a * 3), tips, arms: [] };
  P.arms = [lashSpine(P, 0, a * 2 + 0.3, 0.55 + 0.15 * Math.sin(a), 0.2 + 0.12 * Math.sin(a * 2)), lashSpine(P, 1, a * 2 + 2.4, 0.5 + 0.15 * Math.sin(a + 2), 0.2 + 0.12 * Math.sin(a * 2 + 2))];
  return P;
}
/** Water and muck dripping off it. */
function drips(P: SpawnPose, t: number): Grain[] {
  const out: Grain[] = [];
  for (let i = 0; i < 6; i++) {
    const k = fr(t * (0.9 + 0.2 * (i % 3)) + hash(i, 1, 905));
    const from = i < 3 ? add(P.E, [(hash(i, 2, 905) - 0.5) * 14, (hash(i, 3, 905) - 0.5) * 14, -ES_R * 0.8]) : P.arms[i % 2][4 + (i % 4)];
    const z = from[2] * (1 - k * k);
    if (z < 0.3) continue;
    out.push([[from[0], from[1], z], i % 2 ? '#6f8a80' : '#4a5a50', 1]);
  }
  return out;
}

/** One frame of the eyespawn: `which` (stand), `t` seconds in, from in front or behind. */
export function eyespawnPainted(which: string, t: number, view: GameView = 'front'): Painted {
  void which;
  const P = standPose(t);
  return paintSpawn(view, P, t, drips(P, t), true);
}
/** One frame, as the game holds a figure. */
export function eyespawnFrame(which: string, t: number, view: GameView = 'front'): Sprite {
  return toSprite(eyespawnPainted(which, t, view), null, ES_CANVAS.ax, ES_CANVAS.ay);
}
/** Its stand's frames: 24 at ten a second. */
export const ES_IDLE = { frames: 24, fps: 10 } as const;

/** THE EYESPAWN, as the game holds a monster's pictures (its stand only, for now). */
export function makeEyespawnArt(): ActorArt {
  const set = (view: GameView): AnimSet => {
    const frame = (which: string, t: number): Sprite => toSprite(eyespawnPainted(which, t, view), { x: ES_CANVAS.ax, y: ES_CANVAS.ay - 30, r: 30, color: '#ff3a78', a: 0.08 }, ES_CANVAS.ax, ES_CANVAS.ay);
    const idle = lazyFrames(ES_IDLE.frames, (i) => frame('stand', i / ES_IDLE.fps));
    return { idle, walk: idle, attack: idle, idleFps: ES_IDLE.fps, walkFps: ES_IDLE.fps, clips: {} };
  };
  return { front: set('front'), back: set('back') };
}
