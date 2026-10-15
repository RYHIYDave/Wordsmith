// FLOOR 9'S MEDIUM MOB, THE TWISTED DEER OF THE PINEWOOD: a mock-up (nothing of the game imports this file;
// `TWISTED_DEER_ON` is off).
//
// HIS DESIGN DOC: "Twisted Deer | Medium | An antler gore; a rearing stomp."
//
// HIS BRIEF, asked as his art rulebook's questions for a new character (15 Oct, by 13:17, each his pick, the labels as
// he tapped them): what it is, “A deer grown through with roots” (not the recommended pick); how big, “Pony-sized,
// dangerous in a pack (Recommended)”; how it moves, “Jerky and wrong, a fast hitching limp (Recommended)”; the one thing
// to know it by, “Its antlers grown crooked into thorns (Recommended)”; its rearing stomp, “Thorns burst from the
// ground” (not the recommended pick); how it dies, “It splits apart into roots and bark” (not the recommended pick);
// what it must never look like, “Not a cute Bambi (Recommended)”; its sound (sound rule 7), “Creaking wood, a strangled
// bleat (Recommended)”.
//
// READ AS, NOT ASKED (the pictures are to show them): an enemy, so its eyes burn the enemy's pink to gold and its edge
// is pink while it lives; nothing cyan; a deer gone to wood: its right hind leg wholly a twisted root ending in a splay
// of roots for a foot (so it limps), the others bark and root below the knee; bark plates and roots grown out along its
// back; roots burst through its sides; moss; its antlers crooked, uneven, bramble-thorned; gaunt, never soft.
//
// NOT ON THE HEROES' BONES: painted from its own solids, as the Hollow Stag is, in the same painter.
//
// THIS FIRST STEP: its look, standing (his rulebook: a sheet of it standing, front and back, beside a hero, before
// anything moves), and its stand: jerky and wrong.

import type { Px, Sprite } from '../engine/px';
import { INK, hash, lazyFrames, toSprite } from './kit';
import type { Painted, Ramp } from './kit';
import { ENEMY_RIM, FLAME } from './mkit';
import { TILE3, paintBits } from './new_mobs3';
import type { ActorArt, AnimSet, Clip } from './actor_types';
import type { Bit, Put } from './new_mobs3';
import type { Skin } from './skin';
import { stage } from './skin';
import type { GameView, Sheet, Stage } from './skin';
import type { V3 } from './skeleton';

/** THE SWITCH, OFF: nothing of the game reads this file. */
export const TWISTED_DEER_ON = { on: false };

const cl01 = (v: number): number => Math.max(0, Math.min(1, v));
const fr = (t: number): number => t - Math.floor(t);
const D = Math.PI / 180;
const add = (a: V3, b: V3): V3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const sub = (a: V3, b: V3): V3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const mul = (a: V3, k: number): V3 => [a[0] * k, a[1] * k, a[2] * k];
const len = (a: V3): number => Math.hypot(a[0], a[1], a[2]);
const norm = (a: V3, or: V3 = [0, 0, 1]): V3 => {
  const l = len(a);
  return l > 1e-9 ? mul(a, 1 / l) : or;
};
const dot = (a: V3, b: V3): number => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const cross = (a: V3, b: V3): V3 => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const lerpV = (a: V3, b: V3, s: number): V3 => [a[0] + (b[0] - a[0]) * s, a[1] + (b[1] - a[1]) * s, a[2] + (b[2] - a[2]) * s];
const sm = (v: number): number => {
  const c = cl01(v);
  return c * c * (3 - 2 * c);
};
/** A swell from nothing at `a` to its fullest half way and back to nothing at `b`, smooth at both ends. */
const bump = (t: number, a: number, b: number): number => (t <= a || t >= b ? 0 : Math.pow(Math.sin((Math.PI * (t - a)) / (b - a)), 2));

// ---------------------------------------------------------------------------------------------
// ITS COLOURS: a sickly grey-taupe hide gone patchy; dark umber bark where it has turned to wood; the swamp's dark
// violet roots (as the Stag's); moss; its antlers dead wood bleached pale, their thorns' points black; its eyes the enemy's pink
// burning to gold (FLAME). Nothing of it glows cyan; nothing soft.

const HIDE: Ramp = ['#1e181e', '#3a3036', '#5e5254', '#867872', '#a89a8e'];
const BARK: Ramp = ['#120c0c', '#241816', '#3a2820', '#58402c', '#74583a'];
const THORN: Ramp = ['#3a2e30', '#5e4e4a', '#8e7c70', '#bcae9c', '#e0d4c0'];
const POINT: Ramp = ['#120c0c', '#1e1414', '#2e201c', '#46302a', '#5e4436'];
const ROOT: Ramp = ['#120a16', '#22142a', '#3a2642', '#58405c', '#78607a'];
const MOSS: Ramp = ['#141e14', '#22341e', '#36502a', '#52703a', '#748c4c'];
const HOOF: Ramp = ['#0a070c', '#140e14', '#241a22', '#362832', '#4a3844'];
const NOSE: Ramp = ['#0a070c', '#0a070c', '#1a1218', '#2c2026', '#3e3038'];

// ---------------------------------------------------------------------------------------------
// ITS BODY, in picture units (the knight stands 58 high, his chest about 40 up). x forward, y to its left, z up; its own
// frame has its floor point under its middle at the origin. Pony-sized: its withers about 40 up, its antlers to about
// the knight's head.

const PIVOT: V3 = [0, 0, 30];
/** Its feet at rest, on the floor: its right fore, left fore, right hind (the root, with no hoof), left hind. */
export const DEER_FEET: V3[] = [
  [11, -4.6, 0],
  [11, 4.6, 0],
  [-17, -5.2, 0],
  [-17, 5, 0],
];
/** Where each leg leaves its body. */
const LEG_TOP: V3[] = [
  [12, -5.4, 29],
  [12, 5.4, 29],
  [-16, -5.4, 31],
  [-16, 5.4, 31],
];
const UPPER = [8.5, 11.5];
const HIND_UPPER = [10, 12];
/** Its lower leg, rigid from the foot up: the knee (front) or the hock (hind), and the fetlock. */
const FORE_KNEE: V3 = [-1.5, 0, 12.5];
const FORE_FET: V3 = [-1.2, 0, 4];
const HIND_HOCK: V3 = [-2.6, 0, 14];
const HIND_FET: V3 = [-0.6, 0, 4];
/** Its root leg: its right hind. */
const ROOT_LEG = 2;
const NECK_ROOT: V3 = [16, 0, 34];
const NECK_LONG = 13;
const NECK_REST: V3 = [12, 0, 5];
const SKULL_PITCH = 34;

// ---------------------------------------------------------------------------------------------
// ITS TIMES (seconds)

/** Its stand: fifteen frames a second, a loop of 2 s: jerky and wrong: its head snapping round and held, a shudder, its root leg lifted and set down. */
export const DEER_STAND = { frames: 30, fps: 15, period: 2.0 } as const;
/** In its stand: its head's two snaps, its shudder, its root leg's lift. */
export const DEER_HABITS = { snaps: [0.3, 1.2], shudder: [1.0, 1.2], lift: [0.78, 1.04] } as const;

/** The canvas it is painted on, and its floor point on it. */
export const DEER_CANVAS = { w: 280, h: 250, ax: 130, ay: 186 };
const DEER_AURA = { x: DEER_CANVAS.ax, y: DEER_CANVAS.ay - 22, r: 40, color: '#ff3a78', a: 0.08 };

// ---------------------------------------------------------------------------------------------
// ITS POSES

interface DeerPose {
  x: number;
  y: number;
  z: number;
  yaw: number;
  pitch: number;
  roll: number;
  neck: number;
  head: [number, number, number];
  ears: number;
  tail: number;
  feet: V3[];
  fold: number[];
  breath: number;
  eyes: number;
  alive: boolean;
  /** Its stomp's thorns: how long since they burst from the ground (seconds; below 0, none). */
  ring: number;
  drag: V3;
  chips: [V3, string, number][];
  flares: [V3, number, number][];
}

const REST: DeerPose = { x: 0, y: 0, z: 0, yaw: 0, pitch: 0, roll: 0, neck: 0, head: [0, 0, 0], ears: 0, tail: 0, feet: DEER_FEET, fold: [0, 0, 0, 0], breath: 0, eyes: 1, alive: true, ring: -1, drag: [0, 0, 0], chips: [], flares: [] };

/** A snap of its head: wrenched round in a few hundredths of a second at `t0`, held, and let back slowly. */
function snap(t: number, t0: number): number {
  if (t < t0) return 0;
  if (t < t0 + 0.07) return sm((t - t0) / 0.07);
  if (t < t0 + 0.32) return 1;
  return 1 - sm((t - t0 - 0.32) / 0.38);
}

/**
 * Its stand, jerky and wrong (his pick): it breathes, short and quick; its head is wrenched round, held, and let back,
 * twice; a shudder runs through it; it lifts its root leg and sets it down on the spot it left, with a jolt.
 */
function standPose(t0: number): DeerPose {
  const T = DEER_STAND.period;
  const t = fr(t0 / T) * T;
  const a = (Math.PI * 2 * t) / T;
  const breath = Math.sin(2 * a);
  const [s1, s2] = DEER_HABITS.snaps;
  const k1 = snap(t, s1);
  const k2 = snap(t, s2);
  const [h0, h1] = DEER_HABITS.shudder;
  const shudder = bump(t, h0, h1) * Math.sin(t * 95);
  const [l0, l1] = DEER_HABITS.lift;
  const lift = bump(t, l0, l1);
  const jolt = bump(t, l1 - 0.02, l1 + 0.16);
  const feet = DEER_FEET.map((f) => f);
  feet[ROOT_LEG] = [DEER_FEET[ROOT_LEG][0] - 1.5 * lift, DEER_FEET[ROOT_LEG][1], 5 * lift];
  return {
    ...REST,
    y: 0.5 * Math.sin(a),
    z: 0.35 * breath - 0.9 * jolt + 0.25 * shudder,
    roll: 1.2 * Math.sin(a) + 1.6 * shudder + 1.5 * lift,
    pitch: 1.2 * jolt,
    yaw: 0.8 * Math.sin(a + 1),
    neck: -4 * k1 + 6 * k2 + 2 * Math.sin(a),
    head: [16 * k1 - 12 * k2 + 2 * shudder, -6 * k1 + 12 * k2, 12 * k1 - 8 * k2],
    ears: -25 * bump(t, 0.55, 0.75) - 15 * k2,
    tail: 30 * bump(t, 1.45, 1.7),
    feet,
    fold: [0, 0, 30 * lift, 0],
    breath,
    eyes: 1 + 0.2 * Math.sin(a * 3) + 0.4 * k1,
  };
}

// ---------------------------------------------------------------------------------------------
// ITS MOVES (his design doc's: "An antler gore; a rearing stomp"; his picks: its stomp, "Thorns burst from the ground";
// its death, "It splits apart into roots and bark")

/** How fast it goes (tiles a second). Its limp is painted for it, so each foot down stays on its spot. */
export const DEER_PACE = 1.8;
/** Its walk, a fast hitching limp (his pick): sixteen frames a second, a round of 0.5 s; its root leg down only a moment, its body dropping onto it and its head jerking. */
export const DEER_WALK = { frames: 8, fps: 16, period: 0.5 } as const;
/** Its antler gore: its head lowered, antlers aimed, held trembling (the warning) from `warn`; it lunges and hooks up through you at `hit`, held a tenth (`freeze`); `reach`: how far before its feet its antlers sweep (its own lengths). */
export const DEER_GORE = { long: 1.1, warn: 0.28, hit: 0.55, freeze: 0.1, reach: 44, fps: 30 } as const;
/** Its rearing stomp: reared up on its hind legs by `rear`, held pawing (the warning); its forefeet slammed down at `hit`, held (`freeze`), thorny roots bursting from the ground in a ring round it, out to `reach` of its own lengths, sinking back by `long`. */
export const DEER_STOMP = { long: 1.5, rear: 0.36, hit: 0.7, freeze: 0.1, reach: 40, fps: 30 } as const;
/** Struck: held a moment, knocked back, its head snapped round, bark and splinters flying off it. */
export const DEER_REEL = { long: 0.45, freeze: 0.05, fps: 30 } as const;
/** Its death (his pick): held as the blow lands (`freeze`); it convulses, cracking; it splits apart at `split` into roots and bark, its pieces falling and tumbling to lie on the floor by `down`; still from `still`. */
export const DEER_DIE = { long: 1.5, freeze: 0.1, split: 0.4, down: 0.95, still: 1.1, fps: 30 } as const;

const STAND0 = standPose(0);
const swell = (v: number): number => {
  const c = cl01(v);
  return sm(c) + 0.3 * Math.pow(Math.sin(Math.PI * c), 2) * c;
};
const easeIn = (v: number): number => Math.pow(cl01(v), 2);
const easeOut = (v: number): number => 1 - Math.pow(1 - cl01(v), 2);
interface Key {
  x: number;
  z: number;
  pitch: number;
  roll: number;
  yaw: number;
  neck: number;
  hy: number;
  hp: number;
  hr: number;
  ears: number;
  eyes: number;
}
const K0: Key = { x: STAND0.x, z: STAND0.z, pitch: STAND0.pitch, roll: STAND0.roll, yaw: STAND0.yaw, neck: STAND0.neck, hy: STAND0.head[0], hp: STAND0.head[1], hr: STAND0.head[2], ears: STAND0.ears, eyes: STAND0.eyes };
const keyed = (k: Partial<Key>): Key => ({ ...K0, ...k });
function mixKey(a: Key, b: Key, k: number): Key {
  const o = { ...a };
  for (const f of Object.keys(a) as (keyof Key)[]) o[f] = a[f] + (b[f] - a[f]) * k;
  return o;
}
function along(t: number, keys: [number, Key, (v: number) => number][]): Key {
  if (t <= keys[0][0]) return keys[0][1];
  for (let i = 1; i < keys.length; i++) {
    const [t1, k1, ease] = keys[i];
    const [t0, k0] = keys[i - 1];
    if (t < t1) return mixKey(k0, k1, ease((t - t0) / (t1 - t0)));
  }
  return keys[keys.length - 1][1];
}
function fromKey(K: Key, feet: V3[] = DEER_FEET, fold: number[] = [0, 0, 0, 0]): DeerPose {
  return { ...STAND0, x: K.x, y: 0, z: K.z, pitch: K.pitch, roll: K.roll, yaw: K.yaw, neck: K.neck, head: [K.hy, K.hp, K.hr], ears: K.ears, eyes: K.eyes, feet: feet.map((f) => f), fold: fold.slice(), chips: [], flares: [] };
}
const shiver = (t: number, k: number): Partial<Key> => ({ hy: 1.6 * Math.sin(t * 190) * k, hp: 1.2 * Math.sin(t * 150 + 1) * k, z: 0.3 * Math.sin(t * 170 + 2) * k });
const plus = (K: Key, d: Partial<Key>): Key => {
  const o = { ...K };
  for (const f of Object.keys(d) as (keyof Key)[]) o[f] += d[f] ?? 0;
  return o;
};

// --- ITS LIMP ---
/** Each foot's share of the round on the floor (its root leg down only a moment), and when each comes down. */
const LIMP_DUTY = [0.56, 0.56, 0.3, 0.56];
const LIMP_DOWN = [0.5, 0, 0.62, 0.25];
function limpFoot(i: number, ph: number): { foot: V3; fold: number } {
  const r = DEER_FEET[i];
  const front = i < 2;
  const duty = LIMP_DUTY[i];
  const span = DEER_PACE * TILE3 * DEER_WALK.period;
  const half = (span * duty) / 2;
  const u = fr(ph - LIMP_DOWN[i]);
  if (u < duty) return { foot: [r[0] + half - span * u, r[1], 0], fold: 0 };
  const v = (u - duty) / (1 - duty);
  const up = i === 2 ? 3 : front ? 5 : 4;
  return { foot: [r[0] - half + 2 * half * sm(v), r[1], up * Math.sin(Math.PI * v)], fold: (front ? 55 : 22) * Math.sin(Math.PI * v) };
}
/** Its limp: fast, hitching: it drops onto its root leg for a moment, its body lurching to that side and its head jerking, and springs off it again. */
function limpPose(t: number): DeerPose {
  const ph = fr(t / DEER_WALK.period);
  const a = Math.PI * 2 * ph;
  const fs = [0, 1, 2, 3].map((i) => limpFoot(i, ph));
  // (the hitch: while its root leg is down, its body drops onto it and rolls that way)
  const lame = fr(ph - LIMP_DOWN[2]);
  const hitch = lame < LIMP_DUTY[2] ? Math.sin((Math.PI * lame) / LIMP_DUTY[2]) : 0;
  return {
    ...STAND0,
    x: 0,
    y: -0.9 * hitch,
    z: 0.6 * Math.cos(2 * a) - 3.4 * hitch,
    yaw: 2 * Math.sin(a),
    pitch: 1.5 * Math.sin(a) + 3.5 * hitch,
    roll: 8 * hitch - 1.5 * Math.sin(a),
    neck: 3 * Math.sin(2 * a) + 7 * hitch,
    head: [5 * Math.sin(a) - 4 * hitch, 11 * hitch - 2 * Math.sin(2 * a), -12 * hitch],
    ears: -10,
    tail: 10 * Math.sin(2 * a),
    feet: fs.map((f) => f.foot),
    fold: fs.map((f) => f.fold),
    breath: Math.sin(a),
    eyes: 1.2,
    chips: [],
    flares: [],
  };
}

// --- ITS ANTLER GORE ---
const G_LOW = keyed({ x: -4.5, z: -2.4, pitch: 5, neck: 40, hp: 34, hy: -8, hr: -4, ears: -30, eyes: 1.6 });
const G_HIT = keyed({ x: 8.5, z: -0.4, pitch: 0, neck: 10, hp: -6, hy: 8, hr: 6, ears: -30, eyes: 1.8 });
const G_UP = keyed({ x: 4, z: 1, pitch: -5, neck: -6, hp: -22, hy: 11, hr: 8, ears: -20, eyes: 1.4 });
/** Its antler gore: it drops its head, its thorned antlers aimed at you, and holds there trembling (the warning); then it lunges and hooks up through you (`hit`), its head flung up after; it settles. Its feet stay where they stand. */
/** The gore's own clock: stopped through the freeze as its blow lands, and running on after it. */
function goreClock(t: number): number {
  const G = DEER_GORE;
  return t < G.hit ? t : t < G.hit + G.freeze ? G.hit : t - G.freeze;
}
function gorePose(t: number): DeerPose {
  const G = DEER_GORE;
  const tt = goreClock(t);
  const end = G.long - G.freeze;
  let K = along(tt, [
    [0, K0, sm],
    [G.warn, G_LOW, swell],
    [0.44, G_LOW, sm],
    [G.hit, G_HIT, easeIn],
    [0.72, G_UP, easeOut],
    [end, K0, swell],
  ]);
  if (tt > G.warn && tt < 0.44) K = plus(K, shiver(tt, sm((tt - G.warn) / 0.06)));
  const P = fromKey(K);
  P.tail = 25 * Math.sin(Math.PI * cl01(tt / end));
  return P;
}

// --- ITS REARING STOMP ---
const HIPS: V3 = [-16, 0, 31];
function reared(K: Key, deg: number): Key {
  const rel = sub(HIPS, PIVOT);
  const r = turn(rel, K.yaw, K.pitch - deg, K.roll);
  const r0 = turn(rel, K.yaw, K.pitch, K.roll);
  return { ...K, pitch: K.pitch - deg, x: K.x + (r0[0] - r[0]), z: K.z + (r0[2] - r[2]) };
}
const S_GATHER = keyed({ z: -2, pitch: 3, neck: 8, hp: 10, ears: -15, eyes: 1.4 });
const S_UP = keyed({ neck: -12, hp: -18, hy: 6, hr: 5, ears: -30, eyes: 1.9 });
const S_SLAM = keyed({ z: -1.2, neck: 12, hp: 18, hy: -4, ears: -30, eyes: 2 });
/** Its rearing stomp: it gathers, rears up on its hind legs, its forelegs pawing the air, held (the warning); it slams its forefeet down on the spots they left (`hit`), held; thorny roots burst up out of the ground in a ring round it, and sink back; it settles. */
function stompPose(t: number): DeerPose {
  const S = DEER_STOMP;
  const tt = t >= S.hit && t < S.hit + S.freeze ? S.hit : t;
  let K = along(tt, [
    [0, K0, sm],
    [0.14, S_GATHER, sm],
    [S.rear, S_UP, swell],
    [0.58, S_UP, sm],
    [S.hit, S_SLAM, (v) => Math.pow(cl01(v), 1.6)],
    [S.hit + S.freeze, S_SLAM, sm],
    [1.05, keyed({ neck: 6, hp: 10, eyes: 1.6 }), sm],
    [S.long, K0, swell],
  ]);
  if (tt > S.rear && tt < 0.58) K = plus(K, shiver(tt, sm((tt - S.rear) / 0.06)));
  const top = 38 + 2 * Math.sin((0.58 - S.rear) * 22);
  const deg = tt < 0.14 ? 0 : tt < S.rear ? 38 * swell((tt - 0.14) / (S.rear - 0.14)) : tt < 0.58 ? 38 + 2 * Math.sin((tt - S.rear) * 22) : tt < S.hit ? top * (1 - Math.pow((tt - 0.58) / (S.hit - 0.58), 1.6)) : 0;
  K = reared(K, deg);
  const P = fromKey(K);
  for (const i of [0, 1]) {
    const F = DEER_FEET[i];
    if (tt <= 0.16 || tt >= S.hit) continue;
    const paddle = Math.sin((tt - S.rear) * 24 + i * 2.4) * bump(tt, S.rear - 0.04, 0.62);
    const hang = worldOf(P, [15 + 2 * paddle, F[1], 10 + 2 * paddle]);
    const lifted = sm((tt - 0.16) / 0.16);
    const down = Math.pow(cl01((tt - 0.58) / (S.hit - 0.58)), 1.6);
    const air = lerpV(lerpV(F, hang, lifted), F, down);
    P.feet[i] = [air[0], air[1], Math.max(air[2], 0.01 * (1 - down))];
    P.fold[i] = (90 + 18 * paddle) * lifted * (1 - down) - 12 * Math.sin(Math.PI * down);
  }
  P.ring = t >= S.hit ? (t < S.hit + S.freeze ? 0.0001 : t - S.hit - S.freeze + 0.0001) : -1;
  P.tail = 35 * bump(tt, 0.1, 1.1);
  return P;
}

// --- STRUCK ---
/** Struck: held a moment; knocked back, its head snapped round, its body rocked; bark, splinters and moss fly off it; back on its stand by its end. */
function reelPose(t: number): DeerPose {
  const R = DEER_REEL;
  if (t < R.freeze) return { ...STAND0, eyes: 1.8, chips: [], flares: [] };
  const k = cl01((t - R.freeze) / (R.long - R.freeze));
  const kk = cl01(k / 0.75);
  const arc = Math.sin(Math.PI * (1 - (1 - kk) * (1 - kk)));
  const K = plus(K0, { x: -3.5 * arc, z: 1 * arc, pitch: -5 * arc, roll: 4 * Math.sin(3 * Math.PI * kk) * (1 - kk), neck: -6 * arc, hp: -12 * arc, hy: 14 * arc, hr: 9 * arc, ears: -30 * arc, eyes: 0.6 * (1 - k) });
  const P = fromKey(K);
  P.tail = 30 * arc;
  return P;
}

// --- ITS DEATH ---
/** Its death, before it splits: held as the blow lands; it convulses, its head thrown up, its back arched, its legs splaying; at the split, held in that pose for its pieces to fall from. */
function deathPose(t: number): DeerPose {
  const Dd = DEER_DIE;
  if (t < Dd.freeze) return { ...STAND0, alive: false, eyes: 1.8, chips: [], flares: [] };
  const tt = Math.min(t, Dd.split);
  const k = sm((tt - Dd.freeze) / (Dd.split - Dd.freeze));
  const K = plus(K0, { z: -1.5 * k + 0.6 * Math.sin(tt * 80) * k, pitch: -4 * k, roll: 6 * k, neck: -10 * k, hp: -22 * k, hy: 10 * k + 3 * Math.sin(tt * 70) * k, hr: 8 * k, ears: -35 * k, eyes: 1.8 });
  const P = fromKey(K);
  P.alive = false;
  P.eyes = t < Dd.split ? 1.8 : Math.max(0, 1.8 * (1 - (t - Dd.split) / 0.12));
  return P;
}

function basePose(which: string, t: number): DeerPose {
  if (which === 'stand') return standPose(t);
  if (which === 'walk') return limpPose(t);
  if (which === 'attack') return gorePose(t);
  if (which === 'stomp') return stompPose(t);
  if (which === 'reel') return reelPose(t);
  return deathPose(t);
}
/** A move's length (its stand and walk: once round). */
export function deerLong(which: string): number {
  return ({ stand: DEER_STAND.period, walk: DEER_WALK.period, attack: DEER_GORE.long, stomp: DEER_STOMP.long, reel: DEER_REEL.long, dying: DEER_DIE.long } as Record<string, number>)[which];
}
/** Its stomp's thorny roots: how many burst up round it. */
const SPIKES = 9;
/** Where each of its stomp's thorny roots bursts up (on the floor round it, out to `reach`), how tall it stands, which way it leans out, and how late after the first it comes. */
function spikeOf(i: number): { base: V3; tall: number; out: V3; late: number } {
  const a = (i / SPIKES) * Math.PI * 2 + 0.35 * (hash(i, 1, 221) - 0.5);
  const r = DEER_STOMP.reach * (0.62 + 0.38 * hash(i, 2, 221));
  return { base: [-2 + Math.cos(a) * r * 1.15, Math.sin(a) * r * 0.9, 0], tall: 17 + 9 * hash(i, 3, 221), out: [Math.cos(a) * 0.5, Math.sin(a) * 0.5, 0], late: 0.05 * hash(i, 4, 221) };
}
/** How far up out of the ground a thorny root is, `s` seconds after it bursts (-1 before it bursts and after it has gone): shot up, held, sunk back. */
function spikeUp(s: number): number {
  if (s < 0 || s > 0.64) return -1;
  return s < 0.08 ? 1 - Math.pow(1 - s / 0.08, 2) : s < 0.32 ? 1 : 1 - sm((s - 0.32) / 0.3);
}
/** Bark, splinters and moss: what flies off it. */
const CHIPS_OF = [BARK[3], BARK[2], '#cbb07c', MOSS[3], HIDE[3]];
const CLOD = ['#4c3c30', '#5e4a3a', '#3e4c2c', '#56663a'];
function burst(c: V3, t0: number, t: number, n: number, seed: number, cols: string[], o: { speed?: number; up?: number; ahead?: V3; life?: number; size?: number } = {}): [V3, string, number][] {
  const life = o.life ?? 0.4;
  const s = t - t0;
  if (s < 0 || s >= life) return [];
  const out: [V3, string, number][] = [];
  const ahead = o.ahead ?? [0, 0, 0];
  for (let i = 0; i < n; i++) {
    const ang = hash(i, 1, seed) * Math.PI * 2;
    const v = (o.speed ?? 26) * (0.45 + 0.75 * hash(i, 2, seed));
    const up = (o.up ?? 30) * (0.4 + 0.9 * hash(i, 3, seed));
    const z = c[2] + up * s - 190 * s * s;
    if (z < 0.6 && s > 0.06) continue;
    out.push([[c[0] + (Math.cos(ang) + ahead[0]) * v * s, c[1] + (Math.sin(ang) + ahead[1]) * v * s, Math.max(0.6, z)], cols[i % cols.length], o.size ?? (i % 3 ? 2 : 3)]);
  }
  return out;
}
function poseOf(which: string, t: number): DeerPose {
  const P = basePose(which, t);
  // (what hangs from it swings with how it has been moving a tenth of a second before, by the move's own clock: held
  // still, as everything is, through a blow's freeze, and swinging on after it as it was)
  const F = which === 'stomp' ? DEER_STOMP : which === 'attack' ? DEER_GORE : null;
  const clock = (u: number): number => (!F || u < F.hit ? u : u < F.hit + F.freeze ? F.hit : u - F.freeze);
  const unclock = (c: number): number => (!F || c <= F.hit ? c : c + F.freeze);
  const before = basePose(which, unclock(clock(t) - 0.1));
  P.drag = sub(worldOf(P, [0, 0, 30]), worldOf(before, [0, 0, 30]));
  if (which === 'walk') {
    // (a puff of the forest floor where its root foot drags as it comes down)
    const tt = fr(t / DEER_WALK.period) * DEER_WALK.period;
    P.chips = burst([DEER_FEET[2][0] + 4, DEER_FEET[2][1], 0.6], LIMP_DOWN[2] * DEER_WALK.period, tt, 6, 201, CLOD, { speed: 18, up: 10, life: 0.2 });
  } else if (which === 'attack') {
    // (its antlers rake up the earth before it; its hind feet kick it up behind as it lunges)
    P.chips = [...burst([32, 0, 0.6], 0.5, goreClock(t), 20, 203, CLOD, { speed: 34, up: 40, ahead: [0.9, 0, 0], life: 0.45, size: 3 }), ...burst([DEER_FEET[2][0] - 2, 0, 0.6], 0.44, goreClock(t), 10, 204, CLOD, { speed: 22, up: 18, ahead: [-0.9, 0, 0], life: 0.3 })];
  } else if (which === 'stomp') {
    const S = DEER_STOMP;
    const s = P.ring;
    if (s > 0) {
      P.chips = [...burst(DEER_FEET[0], 0, s, 12, 205, CLOD, { speed: 30, up: 36, life: 0.45 }), ...burst(DEER_FEET[1], 0, s, 12, 207, CLOD, { speed: 30, up: 36, life: 0.45 })];
      // (earth flung up round each thorny root as it bursts out of the ground)
      for (let i = 0; i < SPIKES; i++) {
        const K = spikeOf(i);
        P.chips.push(...burst(add(K.base, [0, 0, 1]), K.late, s, 6, 241 + i, CLOD, { speed: 20, up: 44, life: 0.42 }));
      }
    }
    void S;
  } else if (which === 'reel') {
    P.chips = burst(worldOf(P, [-2, 0, 36]), DEER_REEL.freeze, t, 14, 209, CHIPS_OF, { speed: 30, up: 30, life: DEER_REEL.long - DEER_REEL.freeze - 0.02 });
  } else if (which === 'dying') {
    P.chips = [...burst([0, 0, 30], DEER_DIE.split, t, 30, 211, CHIPS_OF, { speed: 40, up: 34, life: 0.6 }), ...burst([0, 0, 0.6], DEER_DIE.down - 0.15, t, 16, 213, CLOD, { speed: 30, up: 18, life: 0.35 })];
  }
  return P;
}

// ---------------------------------------------------------------------------------------------
// ITS PAINTER

function turn(v: V3, yaw: number, pitch: number, roll: number): V3 {
  const cy = Math.cos(yaw * D), sy = Math.sin(yaw * D);
  const cp = Math.cos(pitch * D), sp = Math.sin(pitch * D);
  const cr = Math.cos(roll * D), sr = Math.sin(roll * D);
  const r1: V3 = [v[0], v[1] * cr - v[2] * sr, v[1] * sr + v[2] * cr];
  const r2: V3 = [r1[0] * cp + r1[2] * sp, r1[1], -r1[0] * sp + r1[2] * cp];
  return [r2[0] * cy - r2[1] * sy, r2[0] * sy + r2[1] * cy, r2[2]];
}
function worldOf(P: DeerPose, p: V3): V3 {
  return add(add([P.x, P.y, P.z], PIVOT), turn(sub(p, PIVOT), P.yaw, P.pitch, P.roll));
}
function turned(P: DeerPose, v: V3): V3 {
  return turn(v, P.yaw, P.pitch, P.roll);
}
interface HeadFrame {
  at: V3;
  f: V3;
  l: V3;
  u: V3;
  p: (v: V3) => V3;
  q: (v: V3) => V3;
}
function headFrame(P: DeerPose): HeadFrame {
  const root = worldOf(P, NECK_ROOT);
  const along = turned(P, turn(norm(NECK_REST), 0, P.neck, 0));
  const at = add(root, mul(along, NECK_LONG));
  const [hy, hp, hr] = P.head;
  const skull = (v: V3): V3 => turned(P, turn(turn(v, 0, SKULL_PITCH, 0), hy, hp, hr));
  const crown = (v: V3): V3 => turned(P, turn(v, hy, hp, hr));
  return { at, f: skull([1, 0, 0]), l: skull([0, 1, 0]), u: skull([0, 0, 1]), p: (v) => add(at, skull(v)), q: (v) => add(at, crown(v)) };
}
function joint(a: V3, c: V3, l1: number, l2: number, hint: V3): V3 {
  const d0 = sub(c, a);
  const d = Math.max(Math.abs(l1 - l2) + 0.01, Math.min(l1 + l2 - 0.01, len(d0)));
  const n = norm(d0);
  const along = (l1 * l1 - l2 * l2 + d * d) / (2 * d);
  const h = Math.sqrt(Math.max(0, l1 * l1 - along * along));
  const side = norm(sub(hint, mul(n, dot(hint, n))), [0, 0, 1]);
  return add(add(a, mul(n, along)), mul(side, h));
}
const lowerOf = (foot: V3, v: V3, fold: number): V3 => add(foot, turn(v, 0, fold, 0));
function patch(u: V3, k: number, seed: number): number {
  const x = u[0] * k + 7.3;
  const y = u[1] * k + 3.1;
  const z = u[2] * k + 5.7;
  const xi = Math.floor(x), yi = Math.floor(y), zi = Math.floor(z);
  const fx = x - xi, fy = y - yi, fz = z - zi;
  const s = (v: number): number => v * v * (3 - 2 * v);
  const h = (i: number, j: number, m: number): number => hash(xi + i + 101 * (zi + m), yi + j, seed);
  const lx = (j: number, m: number): number => h(0, j, m) + (h(1, j, m) - h(0, j, m)) * s(fx);
  const ly = (m: number): number => lx(0, m) + (lx(1, m) - lx(0, m)) * s(fy);
  return ly(0) + (ly(1) - ly(0)) * s(fz);
}
/** Its hide, gone patchy: grey hair lying in streaks, bark broken through it in patches, moss on the bark where it faces up. */
function hideSkin(seed: number, barked: number): Skin {
  return (u, tone) => {
    const n = patch(u, 2.8, seed);
    if (n > 1 - barked) {
      if (u[2] > 0.35 && patch(u, 5, seed + 3) > 0.62) return MOSS[Math.max(1, Math.min(4, tone))];
      const grain = fr(u[2] * 5 + u[0] * 2.4 + 0.5 * Math.sin(u[1] * 7 + seed)) < 0.28;
      return BARK[Math.max(0, Math.min(4, tone - (grain ? 1 : 0)))];
    }
    const streak = fr(u[2] * 4 + u[0] * 1.2 + 0.3 * Math.sin(u[1] * 6 + seed)) < 0.22;
    return HIDE[Math.max(0, Math.min(4, tone - (streak ? 1 : 0)))];
  };
}
/** Bark: dark wood, its grain running along it, knotted. */
function barkSkin(seed: number): Skin {
  return (u, tone) => {
    const grain = fr(u[0] * 3.2 + 0.4 * Math.sin(u[1] * 5 + u[2] * 4 + seed)) < 0.3;
    if (u[2] > 0.5 && patch(u, 4, seed) > 0.68) return MOSS[Math.max(1, Math.min(4, tone))];
    return BARK[Math.max(0, Math.min(4, tone - (grain ? 1 : 0)))];
  };
}

const VIEWS = new Map<GameView, V3>();
function eyeOf(view: GameView): V3 {
  let e = VIEWS.get(view);
  if (!e) VIEWS.set(view, (e = stage(view, 0, 0, { w: 2, h: 2 }).eye));
  return e;
}

/** A crooked line through points (its antlers, its roots): each stretch a rod, tapering from `r0` to `r1`. */
function crooked(put: Put, part: string, piece: string, pts: V3[], r0: number, r1: number, ramp: Ramp): void {
  for (let i = 0; i < pts.length - 1; i++) {
    const k0 = i / (pts.length - 1);
    const k1 = (i + 1) / (pts.length - 1);
    put(part, `${piece}${i}`, { k: 'rod', a: pts[i], b: pts[i + 1], ra: r0 + (r1 - r0) * k0, rb: r0 + (r1 - r0) * k1, ramp });
  }
}
/** Thorns along a crooked line: short, sharp, pointing every way off it, of `wood` with `point`s. */
function thorns(put: Put, part: string, piece: string, pts: V3[], each: number, long: number, seed: number, wood: Ramp, point: Ramp, r0 = 1, r1 = 0.5): void {
  for (let i = 0; i < pts.length - 1; i++) {
    const dir = norm(sub(pts[i + 1], pts[i]));
    const s1 = norm(cross(dir, [0, 0, 1]), [0, 1, 0]);
    const s2 = norm(cross(dir, s1));
    for (let j = 0; j < each; j++) {
      const k = (j + 0.5 + 0.4 * (hash(i, j, seed) - 0.5)) / each;
      const a = hash(i, j + 7, seed) * Math.PI * 2;
      const out = norm(add(add(mul(s1, Math.cos(a)), mul(s2, Math.sin(a))), mul(dir, 0.45)));
      // (from its surface: the line's own thickness there)
      const rr = r0 + (r1 - r0) * ((i + k) / (pts.length - 1));
      const at = add(lerpV(pts[i], pts[i + 1], k), mul(out, rr * 0.7));
      const tip = add(at, mul(out, long * (0.75 + 0.5 * hash(i, j + 3, seed))));
      const mid = lerpV(at, tip, 0.55);
      put(part, `${piece}${i}_${j}a`, { k: 'rod', a: at, b: mid, ra: 0.95, rb: 0.65, ramp: wood });
      put(part, `${piece}${i}_${j}b`, { k: 'rod', a: mid, b: tip, ra: 0.65, rb: 0.25, ramp: point });
    }
  }
}

/** THE DEER AS SOLIDS. */
function deerBits(P: DeerPose, put: Put, view: GameView): void {
  const W = (p: V3): V3 => worldOf(P, p);
  const axes = (a: V3, b: V3, c: V3): [V3, V3, V3] => [turned(P, a), turned(P, b), turned(P, c)];
  void view;
  const breathe = 1 + 0.04 * P.breath;

  // ITS BODY: a gaunt deer's barrel, its chest and its haunch; its hide patchy, bark broken through it
  put('body', 'barrel', { k: 'ball', c: W([-2, 0, 31]), ax: axes([16, 0, 0], [0, 6.2 * breathe, 0], [0, 0, 7.6 * breathe]), skin: hideSkin(3, 0.45) });
  put('body', 'chest', { k: 'ball', c: W([10, 0, 31.5]), ax: axes([7.5, 0, 0], [0, 6, 0], [0, 0, 8.4]), skin: hideSkin(5, 0.2) });
  put('haunch', 'haunch', { k: 'ball', c: W([-14, 0, 32]), ax: axes([8, 0, 0], [0, 6.6, 0], [0, 0, 8.4]), skin: hideSkin(7, 0.55) });
  // ITS BACK: a ridge of bark plates along its spine, and roots grown up out of it, crooked and thorned, swaying
  for (let i = 0; i < 7; i++) {
    const x = 13 - i * 4.6;
    put('ridge', `plate${i}`, { k: 'ball', c: W([x, 0, 38.6 + 0.6 * Math.sin((i / 6) * Math.PI)]), ax: axes([2.8, 0, 0], [0, 2.3, 0], [0, 0, 1.9]), skin: barkSkin(i) });
  }
  const sway = (k: number): V3 => mul(P.drag, -0.9 * k);
  ([[6, 1, 13, -4], [-4, -1, 16, -8], [-13, 1, 12, -10]] as const).forEach(([x, s, high, lean], i) => {
    const base = W([x, s * 1.2, 39]);
    const pts: V3[] = [base];
    for (let j = 1; j <= 5; j++) {
      const k = j / 5;
      const jag = (hash(i, j, 61) - 0.5) * 2.2;
      pts.push(add(W([x + lean * k * k + jag, s * (1.2 + 3.4 * k * k), 39 + high * Math.sin((k * Math.PI) / 2)]), sway(k)));
    }
    crooked(put, `backroot${i}`, `backroot${i}_`, pts, 1.5, 0.35, BARK);
    thorns(put, `backroot${i}`, `bthorn${i}_`, pts, 1, 2.6, 63 + i, BARK, POINT, 1.5, 0.35);
  });
  // ITS SIDES: roots burst out through its hide and back in, both sides
  for (const s of [1, -1]) {
    ([[6, 33, -6, 26], [-6, 36, -15, 28]] as const).forEach(([x0, z0, x1, z1], i) => {
      const a = W([x0, s * 6.4, z0]);
      const b = W([x1, s * 6.6, z1]);
      const m = add(lerpV(a, b, 0.5), turned(P, [0, s * 3, 0.5]));
      put(`side${s}`, `side${s}_${i}a`, { k: 'rod', a, b: m, ra: 1.6, rb: 1.4, ramp: ROOT });
      put(`side${s}`, `side${s}_${i}b`, { k: 'rod', a: m, b, ra: 1.4, rb: 0.9, ramp: ROOT });
    });
  }

  // ITS NECK AND HEAD: a thin neck; a gaunt deer's head, bark across its brow; long ears, one torn; its eyes burning
  const H = headFrame(P);
  const root = W(NECK_ROOT);
  const along = norm(sub(H.at, root));
  const nl = turned(P, [0, 1, 0]);
  const nu = norm(cross(along, nl));
  put('neck', 'neckroot', { k: 'ball', c: root, ax: axes([5, 0, 0], [0, 5, 0], [0, 0, 6]), skin: hideSkin(11, 0.3) });
  ([[0.4, 5, 4.2, 4.4], [0.85, 3.8, 3.2, 3.4]] as const).forEach(([k, ra, rl, ru], i) => {
    put('neck', `neck${i}`, { k: 'ball', c: lerpV(root, H.at, k), ax: [mul(along, ra), mul(nl, rl), mul(nu, ru)], skin: hideSkin(13 + i, 0.25) });
  });
  // (its face masked in bark, grown over its brow and round its eyes; the hide of its cheeks showing beneath)
  const face: Skin = (u, tone) => {
    if (u[2] > -0.35 || u[0] > 0.45) {
      const grain = fr(u[0] * 3 + 0.5 * Math.sin(u[1] * 6 + u[2] * 3)) < 0.3;
      return BARK[Math.max(0, Math.min(4, tone + 1 - (grain ? 1 : 0)))];
    }
    return HIDE[Math.max(0, Math.min(4, tone))];
  };
  put('head', 'cranium', { k: 'ball', c: H.p([2, 0, 1.6]), ax: [mul(H.f, 4.4), mul(H.l, 3.3), mul(H.u, 3.5)], skin: face });
  put('muzzle', 'muzzle', { k: 'rod', a: H.p([4.5, 0, 0.4]), b: H.p([12.5, 0, -0.8]), ra: 2.3, rb: 1.4, ramp: HIDE });
  put('muzzle', 'nose', { k: 'ball', c: H.p([12.9, 0, -0.7]), ax: [mul(H.f, 1.3), mul(H.l, 1.3), mul(H.u, 1.1)], skin: NOSE });
  put('head', 'jaw', { k: 'rod', a: H.p([2.5, 0, -2]), b: H.p([10.5, 0, -2.3]), ra: 1.6, rb: 1.0, ramp: HIDE });
  for (const s of [1, -1]) {
    const e = H.p([4.2, s * 2.6, 2.3]);
    if (P.eyes > 0.05) {
      put('head', `eye${s}`, { k: 'dot', p: e, c: FLAME[2], c2: FLAME[3], facing: norm(add(mul(H.l, s), mul(H.f, 0.4))) });
      if (dot(norm(add(mul(H.l, s), mul(H.f, 0.4))), eyeOf(view)) > 0) put('glow', `eyeglow${s}`, { k: 'glow', p: e, c: FLAME[2], r: 5 * Math.min(1.5, P.eyes), a: Math.min(0.5, 0.3 * P.eyes) });
    }
    const base = H.p([-0.5, s * 2.8, 3]);
    const tip = add(base, mul(norm(add(add(mul(H.f, -0.9), mul(H.l, s * 1.2)), mul(H.u, 0.4 - P.ears / 60))), s > 0 ? 6.5 : 4.6));
    put('head', `ear${s}`, { k: 'rod', a: base, b: tip, ra: 1.5, rb: s > 0 ? 0.7 : 1.0, ramp: HIDE });
  }
  // ITS ANTLERS: grown crooked into thorns: its left long and twisting, its right short and bent aside; forked, barbed
  // all along like brambles, pale dead wood, their points black
  for (const s of [1, -1]) {
    const at = (v: V3): V3 => H.q([0.5 + v[0], s * (1.8 + v[1]), 3.8 + v[2]]);
    const beam: V3[] = s > 0
      ? [[0, 0, 0], [-2.2, 2.6, 6.4], [2.4, 4.8, 11], [-1.6, 6.6, 16], [3.2, 9.2, 20.4], [0, 11, 25.4], [3.4, 12.4, 29.4]]
      : [[0, 0, 0], [-2.4, 2.8, 5.2], [1.6, 5.6, 8.6], [-1.8, 8.6, 10.6], [1.4, 10.6, 14.6], [-1.6, 12, 18.4]];
    const pts = beam.map(at);
    const part = `antler${s}`;
    crooked(put, part, `beam${s}_`, pts, 2.4, 0.8, THORN);
    put(part, `burr${s}`, { k: 'ball', c: pts[0], ax: [mul(H.f, 1.7), mul(H.l, 1.7), mul(H.u, 1.0)], skin: BARK });
    const forks: [number, V3][] = s > 0 ? [[1, [7.6, 5.4, 11]], [3, [7, 8.8, 22.6]], [4, [-5.6, 13.6, 25.6]]] : [[2, [7.4, 7.4, 13.8]], [3, [-6.2, 12.4, 13.2]]];
    forks.forEach(([i, to], j) => {
      const fp = [pts[i], lerpV(pts[i], at(to), 0.55), at(to)];
      crooked(put, part, `fork${s}_${j}_`, fp, 1.4, 0.45, THORN);
      thorns(put, part, `fthorn${s}_${j}_`, fp, 1, 3.2, 71 + j + (s > 0 ? 0 : 5), THORN, POINT, 1.4, 0.45);
    });
    thorns(put, part, `thorn${s}_`, pts, 2, 3.8, s > 0 ? 73 : 79, THORN, POINT, 2.4, 0.8);
  }

  // ITS LEGS: deer legs, bark and root below the knee; its right hind wholly a twisted root, a splay of roots for a foot
  P.feet.forEach((foot, i) => {
    const front = i < 2;
    const s = i % 2 === 0 ? -1 : 1;
    const top = W(LEG_TOP[i]);
    const fold = P.fold[i];
    const low = lowerOf(foot, front ? FORE_KNEE : HIND_HOCK, fold);
    const fet = lowerOf(foot, front ? FORE_FET : HIND_FET, fold);
    const [l1, l2] = front ? UPPER : HIND_UPPER;
    const mid = joint(top, low, l1, l2, turned(P, front ? [-1, s * 0.15, 0] : [1, s * 0.1, 0]));
    const part = `leg${i}`;
    if (i === ROOT_LEG) {
      // (wholly root: a braid of two roots twisting down from its hip, knotted at the joints, splayed out on the floor)
      put(part, 'rthigh', { k: 'rod', a: top, b: mid, ra: 4.2, rb: 2.4, ramp: BARK, far: true });
      put(part, 'rknot', { k: 'ball', c: mid, ax: [[2.6, 0, 0], [0, 2.4, 0], [0, 0, 2.6]], skin: barkSkin(23), far: true });
      for (const w of [0, 1]) {
        const pts: V3[] = [];
        for (let j = 0; j <= 4; j++) {
          const k = j / 4;
          const c = lerpV(mid, low, k);
          const a = k * Math.PI * 2.2 + w * Math.PI;
          pts.push(add(c, turned(P, [Math.cos(a) * 1.1, Math.sin(a) * 1.1, 0])));
        }
        crooked(put, part, `rshank${w}_`, pts, 1.5, 1.2, w ? ROOT : BARK);
      }
      put(part, 'rhock', { k: 'ball', c: low, ax: [[2.2, 0, 0], [0, 2.1, 0], [0, 0, 2.2]], skin: barkSkin(29), far: true });
      put(part, 'rcannon', { k: 'rod', a: low, b: add(foot, [0, 0, 1.4]), ra: 1.8, rb: 1.6, ramp: ROOT, far: true });
      for (let j = 0; j < 4; j++) {
        const a = (-0.9 + j * 0.6) * Math.PI;
        const toe = add(foot, [Math.cos(a) * 3.6, Math.sin(a) * 3.2, foot[2] > 0.5 ? -0.6 : 0.6]);
        put(part, `rtoe${j}`, { k: 'rod', a: add(foot, [0, 0, 1.2]), b: toe, ra: 1.2, rb: 0.5, ramp: ROOT, far: true });
      }
      return;
    }
    if (front) {
      put(part, `arm${i}`, { k: 'rod', a: top, b: mid, ra: 3.4, rb: 2.1, ramp: HIDE, far: true });
      put(part, `fore${i}`, { k: 'rod', a: mid, b: low, ra: 1.8, rb: 1.3, ramp: HIDE, far: true });
    } else {
      put(part, `thigh${i}`, { k: 'rod', a: top, b: mid, ra: 4.2, rb: 2.6, ramp: HIDE, far: true });
      put(part, `shank${i}`, { k: 'rod', a: mid, b: low, ra: 2.2, rb: 1.3, ramp: HIDE, far: true });
    }
    put(part, `knob${i}`, { k: 'ball', c: low, ax: [[1.6, 0, 0], [0, 1.5, 0], [0, 0, 1.6]], skin: barkSkin(31 + i), far: true });
    put(part, `cannon${i}`, { k: 'rod', a: low, b: fet, ra: 1.2, rb: 1.0, ramp: BARK, far: true });
    // (a root wound round the bark of its cannon)
    for (let j = 0; j < 3; j++) {
      const ring = (k: number): V3 => {
        const c = lerpV(low, fet, 0.1 + 0.8 * k);
        const a = k * Math.PI * 3 + i;
        return add(c, [Math.cos(a) * 1.4, Math.sin(a) * 1.4, 0]);
      };
      put(part, `wrap${i}_${j}`, { k: 'rod', a: ring(j / 3), b: ring((j + 1) / 3), ra: 0.55, rb: 0.55, ramp: ROOT, far: true });
    }
    const hoofUp = lowerOf(foot, [0.4, 0, 1.8], fold);
    put(part, `pastern${i}`, { k: 'rod', a: fet, b: hoofUp, ra: 1.0, rb: 1.15, ramp: BARK, far: true });
    put(part, `hoof${i}`, { k: 'ball', c: lowerOf(foot, [0.7, 0, 1.2], fold), ax: [turn([2.0, 0, 0], 0, fold, 0), [0, 1.5, 0], turn([0, 0, 1.2], 0, fold, 0)], skin: HOOF, far: true });
  });

  // ITS STOMP'S THORNS: thorny roots bursting up out of the ground in a ring round it, one a beat after another, then
  // sinking back into it (what of them is still under the ground the floor swallows)
  if (P.ring >= 0) {
    for (let i = 0; i < SPIKES; i++) {
      const K = spikeOf(i);
      const up = spikeUp(P.ring - K.late);
      if (up < 0) continue;
      const sunk: V3 = [0, 0, -(1 - up) * (K.tall + 3)];
      const pts: V3[] = [];
      for (let j = 0; j <= 4; j++) {
        const k = j / 4;
        const jag = (hash(i, j + 5, 223) - 0.5) * 2.4 * k;
        pts.push(add(add(K.base, sunk), [K.out[0] * K.tall * k * k + jag, K.out[1] * K.tall * k * k - jag, K.tall * k]));
      }
      crooked(put, `spike${i}`, `spikelow${i}_`, pts.slice(0, 3), 3.3, 1.9, ROOT);
      crooked(put, `spike${i}`, `spikehigh${i}_`, pts.slice(2), 1.9, 0.4, THORN);
      thorns(put, `spike${i}`, `spikethorn${i}_`, pts, 1, 2.2, 225 + i, THORN, POINT, 2.4, 0.5);
      // (the earth broken and heaved up round it, settling as it sinks)
      const heave = Math.min(1, (P.ring - K.late) / 0.04) * (0.5 + 0.5 * up);
      put(`spike${i}`, `spikebase${i}`, { k: 'ball', c: add(K.base, [0, 0, 0.2]), ax: [[4.4 * heave, 0, 0], [0, 4.4 * heave, 0], [0, 0, 1.8 * heave]], skin: barkSkin(227 + i) });
    }
  }

  // ITS TAIL: a twig, a tuft of moss on it, flicking
  const tr = W([-22, 0, 35]);
  const td = turned(P, turn(norm([-0.6, 0, -0.8]), 0, -P.tail, 0));
  put('tail', 'tail', { k: 'rod', a: tr, b: add(tr, mul(td, 4.5)), ra: 1.3, rb: 0.6, ramp: BARK });
  put('tail', 'tuft', { k: 'ball', c: add(tr, mul(td, 4.2)), ax: [[1.6, 0, 0], [0, 1.4, 0], [0, 0, 1.4]], skin: MOSS });
  void INK;
}

/** Every solid of one moment of it, as seen from `view`: as it stands, or (its death, once split) its pieces falling apart. */
function bitsOf(which: string, t: number, view: GameView): { P: DeerPose; bits: Bit[] } {
  const P = poseOf(which, t);
  const bits: Bit[] = [];
  const Dd = DEER_DIE;
  if (which === 'dying' && t > Dd.split) {
    const at = poseOf('dying', Dd.split);
    deerBits({ ...at, eyes: P.eyes }, (part, piece, shape) => {
      if (shape.k !== 'glow') bits.push({ part, piece, shape });
    }, view);
    return { P, bits: fallApart(bits, Math.min(t, Dd.still)) };
  }
  deerBits(P, (part, piece, shape) => {
    bits.push({ part, piece, shape });
  }, view);
  return { P, bits };
}
/** The lowest point of a solid. */
function lowOf(sh: Bit['shape']): number {
  if (sh.k === 'rod') return Math.min(sh.a[2] - sh.ra, sh.b[2] - sh.rb);
  if (sh.k === 'ball') return sh.c[2] - Math.hypot(sh.ax[0][2], sh.ax[1][2], sh.ax[2][2]);
  return Infinity;
}
/** A solid turned about `o` by `rot` and moved by `by`. */
function moved(sh: Bit['shape'], o: V3, rot: (v: V3) => V3, by: V3): Bit['shape'] {
  const pt = (p: V3): V3 => add(add(o, rot(sub(p, o))), by);
  if (sh.k === 'rod') return { ...sh, a: pt(sh.a), b: pt(sh.b) };
  if (sh.k === 'ball') return { ...sh, c: pt(sh.c), ax: [rot(sh.ax[0]), rot(sh.ax[1]), rot(sh.ax[2])] };
  if (sh.k === 'dot') return { ...sh, p: pt(sh.p), facing: rot(sh.facing) };
  return sh;
}
/**
 * It splits apart into roots and bark (his pick): each piece of it (its body, its haunch, its back's roots and ridge,
 * its neck, its head, each antler, each leg, its tail) breaks away, falling, tumbling and thrown a little apart, and lies
 * on the floor, a bounce as it lands. Nothing of it below the floor.
 */
function fallApart(bits: Bit[], t: number): Bit[] {
  const Dd = DEER_DIE;
  const k = Math.pow(cl01((t - Dd.split) / (Dd.down - Dd.split)), 1.6);
  const bounce = t > Dd.down ? 2.2 * Math.sin(Math.PI * cl01((t - Dd.down) / 0.15)) : 0;
  const groupOf = (part: string): string => (part === 'muzzle' ? 'head' : part);
  const groups = new Map<string, Bit[]>();
  for (const b of bits) {
    const g = groupOf(b.part);
    if (!groups.has(g)) groups.set(g, []);
    groups.get(g)!.push(b);
  }
  const out: Bit[] = [];
  let n = 0;
  for (const [g, gb] of groups) {
    n++;
    // (its middle, and how it was lying before it fell)
    let c: V3 = [0, 0, 0];
    let cn = 0;
    for (const b of gb) {
      const sh = b.shape;
      const p = sh.k === 'rod' ? lerpV(sh.a, sh.b, 0.5) : sh.k === 'ball' ? sh.c : sh.k === 'dot' ? sh.p : null;
      if (p) {
        c = add(c, p);
        cn++;
      }
    }
    c = mul(c, 1 / Math.max(1, cn));
    const low0 = Math.max(0, Math.min(...gb.map((b) => lowOf(b.shape))));
    const seed = g.split('').reduce((h, ch) => h * 31 + ch.charCodeAt(0), 7) % 997;
    const axA = hash(seed, 1, 231) * Math.PI * 2;
    const axis: V3 = [Math.cos(axA), Math.sin(axA), 0];
    // (its big pieces, its body, haunch, neck and ridge, only tip as they drop; its small ones, its antlers, legs, roots,
    // head and tail, are flung tumbling)
    const big = /^(body|haunch|neck|ridge)$/.test(g);
    const angle = (big ? 10 + 18 * hash(seed, 2, 231) : 60 + 60 * hash(seed, 2, 231)) * (hash(seed, 3, 231) < 0.5 ? -1 : 1) * D;
    const away = norm([c[0] + 0.01 * n, c[1] + (hash(seed, 4, 231) - 0.5) * 6, 0], [1, 0, 0]);
    const scatter = mul(away, (big ? 2 + 4 * hash(seed, 5, 231) : 10 + 10 * hash(seed, 5, 231)) * k);
    const turnBy = (th: number) => (v: V3): V3 => {
      // (Rodrigues: v turned `th` about the axis)
      const cs = Math.cos(th), sn = Math.sin(th);
      return add(add(mul(v, cs), mul(cross(axis, v), sn)), mul(axis, dot(axis, v) * (1 - cs)));
    };
    const rot = turnBy(angle * k);
    const turnedBits = gb.map((b) => moved(b.shape, c, rot, scatter));
    const lowNow = Math.min(...turnedBits.map(lowOf));
    // (its lowest point comes down from where it was to the floor, never under it)
    const lift = (1 - k) * low0 - lowNow + bounce * (hash(seed, 6, 231) * 0.6 + 0.4);
    turnedBits.forEach((sh, i) => out.push({ part: gb[i].part, piece: gb[i].piece, shape: moved(sh, [0, 0, 0], (v) => v, [0, 0, lift]) }));
  }
  return out;
}

/** One frame of the deer: `which` (stand, walk: its limp, attack: its gore, stomp, reel, dying), `t` seconds in, from in front or behind. */
export function deerPainted(which: string, t: number, view: GameView = 'front'): Painted {
  eyeOf(view);
  const { P, bits } = bitsOf(which, t, view);
  const st = stage(view, DEER_CANVAS.ax, DEER_CANVAS.ay, DEER_CANVAS);
  const ref = worldOf(P, PIVOT);
  const lights = paintBits(st, bits.filter((b) => !/^spike/.test(b.part)), ref);
  // (its stomp's thorny roots burst up out of the ground: what of them is still under it, the floor swallows)
  const spikes = bits.filter((b) => /^spike/.test(b.part));
  if (spikes.length) {
    const sheets: Sheet[] = [];
    lights.push(...paintBits({ ...st, part: (where) => { const sh = st.part(where); sheets.push(sh); return sh; } }, spikes, ref));
    for (const sh of sheets) swallow(sh, st);
  }
  for (const [p, r, a] of P.flares) {
    const [x, y] = st.at(p);
    lights.push({ x, y, r, color: FLAME[3], a });
  }
  const px = st.whole(P.alive ? ENEMY_RIM : null);
  for (const [pt, col, size] of P.chips) laid(px, st, pt, col, size);
  return { px, lights };
}
/** The floor swallows what is under it: every pixel of a sheet whose surface there is below the floor is taken away. */
function swallow(sh: Sheet, st: Stage): void {
  const b = st.back;
  for (let y = 0; y < sh.h; y++) {
    for (let x = 0; x < sh.w; x++) {
      if (!sh.has(x, y)) continue;
      const k = y * sh.w + x;
      const n = sh.z[k] !== sh.z[k] ? sh.near : sh.z[k];
      const z = b[2][0] * (x + 0.5 - DEER_CANVAS.ax) + b[2][1] * (y + 0.5 - DEER_CANVAS.ay) + b[2][2] * n;
      if (z < 0) {
        sh.erase(x, y);
        sh.z[k] = NaN;
      }
    }
  }
}
function laid(px: Px, st: Stage, p: V3, col: string, size: number): void {
  const [x, y] = st.at(p);
  const xi = Math.round(x - size / 2);
  const yi = Math.round(y - size / 2);
  for (let dy = 0; dy < size; dy++) for (let dx = 0; dx < size; dx++) if (xi + dx >= 0 && yi + dy >= 0 && xi + dx < px.w && yi + dy < px.h) px.set(xi + dx, yi + dy, col);
}
/** Its feet at one moment (for the tests). */
export function deerFeet(which: string, t: number): V3[] {
  return poseOf(which, t).feet;
}
/** The same frame as the game holds a figure. */
export function deerFrame(which: string, t: number, view: GameView = 'front'): Sprite {
  return toSprite(deerPainted(which, t, view), which === 'dying' ? null : DEER_AURA, DEER_CANVAS.ax, DEER_CANVAS.ay);
}
/** Every solid of one moment of it, as the tests read them. */
export function deerSolids(which: string, t: number, view: GameView = 'front'): Bit[] {
  eyeOf(view);
  return bitsOf(which, t, view).bits;
}
/** How many grains its moves throw off at one moment (for the tests). */
export function deerChipCount(which: string, t: number): number {
  return poseOf(which, t).chips.length;
}

/** THE TWISTED DEER, as the game holds a monster's pictures: its stand, its limp (walk), its gore (attack), its rearing stomp (clips.moves.stomp), struck, and its death. */
export function makeDeerArt(): ActorArt {
  const set = (view: GameView): AnimSet => {
    const frame = (which: string, t: number): Sprite => deerFrame(which, t, view);
    const clip = (which: string, long: number, fps: number, hit?: number): Clip => {
      const c: Clip = { frames: lazyFrames(Math.round(long * fps) + 1, (i) => frame(which, i / fps)), fps };
      if (hit !== undefined) c.hit = hit;
      return c;
    };
    const attack = clip('attack', DEER_GORE.long, DEER_GORE.fps, DEER_GORE.hit);
    return {
      idle: lazyFrames(DEER_STAND.frames, (i) => frame('stand', i / DEER_STAND.fps)),
      walk: lazyFrames(DEER_WALK.frames, (i) => frame('walk', i / DEER_WALK.fps)),
      attack: lazyFrames(3, (i) => attack.frames[[12, 17, 22][i]]),
      idleFps: DEER_STAND.fps,
      walkFps: DEER_WALK.fps,
      clips: { attack, die: clip('dying', DEER_DIE.long, DEER_DIE.fps), reel: clip('reel', DEER_REEL.long, DEER_REEL.fps), moves: { stomp: clip('stomp', DEER_STOMP.long, DEER_STOMP.fps, DEER_STOMP.hit) } },
    };
  };
  return { front: set('front'), back: set('back') };
}
