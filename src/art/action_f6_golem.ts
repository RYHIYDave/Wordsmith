// FLOOR 6'S QUARRY GOLEM, MORE ACTION (the art chat's helper, 1 Nov 2026; docs/mockups/action_f6/README.md). A MOCK-UP: NOTHING OF
// THE GAME IMPORTS THIS FILE. Its BOULDER ROLL in place of its thrown chunk, and its hammer made by Movement 9, behind GOLEM_BOULDER
// (off), on the game's own golem (art/floor6_mobs.ts QUARRY_GOLEM), all it keeps frame for frame its own.
//
// His review of every enemy for more action, 31 Oct 2026, offered and answered “Yes (Recommended)”: “Boulder roll, in place of the
// throw: tears a boulder off the quarry wall and sends it rolling down a marked lane. It bounces and smashes on whatever it hits.”
// A medium mob keeps two attacks (his rule of 9 Oct): its hammer, tightened by Movement 9 (24 Oct: “Like the wind up and wind down
// are big but the actual punch is lightning quick”; 28 Oct: “And bigger AOE to compensate for the extra time the player gets to
// evade”).
//
// So: THE BOULDER ROLL: it bends and drives both fists down into the quarry's rock before it, and TEARS A BOULDER UP OUT OF IT in a
// burst of rubble (the rock cracked open round where it was); hauls it up before its chest and HEAVES IT UP OVER ITS HEAD, and HOLDS
// it there, trembling, its mark flaring (the warning: the lane is marked on the floor from you to past you as it heaves it up); in
// TWO FRAMES it bowls it down onto the floor before it, smeared, and stays bent over after it. The boulder ROLLS down the lane, fast,
// bouncing twice, and SMASHES on whatever it hits (or at the lane's end): a burst of rock. THE HAMMER: both fists raised over its
// head and HELD, then down in TWO FRAMES, smeared, onto the floor: the floor cracks and a ring of dust and stone goes out round it.
//
// (His words say off the quarry WALL: a golem fights out on the quarry floor more often than by a wall, so it is drawn tearing the
// boulder up out of the quarry's rock at its feet; the same move by a wall is the main chat's, and the owner's to say.)

import { Px } from '../engine/px';
import type { Light, Sprite } from '../engine/px';
import type { ActorArt, Clip } from './actor_types';
import { block } from './act1_stone';
import { CUT, K as QG_K, QG_BODY, QG_PACE, QG_REST, QUARRY_GOLEM, cutFace } from './floor6_mobs';
import { hash, lazyFrames, toSprite } from './kit';
import type { Ramp } from './kit';
import { ENEMY_RIM, FLAME } from './mkit';
import { TILE3, mobSet, paintBits, skeletonAt, sphere } from './new_mobs3';
import type { Bit, Mob, MobMove, Moment, Put } from './new_mobs3';
import { stage } from './skin';
import type { GameView, Stage } from './skin';
import { add, lerp3, mul, norm, sub } from './skeleton';
import type { Bones, Key3, V3 } from './skeleton';
import { FR, TAU, blob, clamp01, f, markRing, pen, smearAlong, smooth, tileAt } from './action_f6_fx';

/** THE SWITCH, OFF. With it on, the bestiary's quarry golem is BOULDER_GOLEM (made by makeBoulderGolemArt). */
export const GOLEM_BOULDER = { on: false };

type P = Partial<Bones>;
const R = QG_REST;
const B = QG_BODY;
/** Its fists, from its place on the floor (as art/floor6_mobs.ts's hammer has them): forward, half apart, up. */
const fists = (x: number, z: number, w = 6): P => ({ rhIn: 2, rhx: x * QG_K, rhy: -w * QG_K, rhz: z, lhIn: 2, lhx: x * QG_K, lhy: w * QG_K, lhz: z });
/** The stone of the quarry's own rock, rough (not dressed: no tooling), the enemy's pink round it as it flies. */
const ROCK: Ramp = ['#2e2430', '#2e2430', '#6e5648', '#9c7c62', '#c49e7e'];

// =============================================================================================
// THE HAMMER, BY MOVEMENT 9

/**
 * THE HAMMER'S NUMBERS (seconds from its start; tiles):
 *   wind-up  both fists raised over its head by 0.45 s; HELD, trembling, leaning back, its mark flaring, to 0.9 s (0.45 s)
 *   strike   TWO FRAMES, smeared: over and down (frame 28), on the floor (frame 29, 0.967 s: the clip's `hit`)
 *   wind-down  crouched over its fists, heaving, to 1.45 s; hauled up, at rest 2.0 s
 *   at, r    its fists strike the floor `at` tiles before it; a hero within `r` of there is struck and knocked back (the game's: 1.215
 *            and 0.8); the floor cracks and a ring of dust goes out to `r` in 0.18 s
 */
export const HAMMER_HIT = f(29);
export const HAMMER_STRIKE = [f(27), f(29)] as const;
export const HAMMER_SMEARED = (t: number): boolean => t > HAMMER_STRIKE[0] + 1e-6 && t <= HAMMER_STRIKE[1] + FR + 1e-6;
export const HAMMER = { hit: HAMMER_HIT, strike: HAMMER_STRIKE, long: 2.0, at: 1.3, r: 1.5, knock: 0.8 } as const;
const HAMMER_NAME = 'The quarry golem raises both fists, held, and hammers the floor';
function hammerKeys(): Key3[] {
  const up: P = { pz: R.pz + 2.2, pitch: -9, bend: -7, faceUp: 19, ...fists(-6, 112 * QG_K), re: 34, le: -34 };
  const shake = (d: number): P => ({ ...up, pz: (up.pz ?? 0) + d * 0.3, pitch: (up.pitch ?? 0) - d, faceUp: (up.faceUp ?? 0) + d });
  const down: P = { pz: R.pz - 15, pitch: 18, bend: 16, faceUp: -2, lk: 34, rk: -34, ...fists(38, B.armR[2] + 7), re: 14, le: -14 };
  return [
    { at: 0, pose: {} },
    { at: 0.45, pose: up, ease: 'io' },
    { at: 0.6, pose: shake(0.8), ease: 'io' },
    { at: 0.75, pose: shake(-0.6), ease: 'io' },
    { at: HAMMER_STRIKE[0], pose: shake(0.4), ease: 'io' },
    { at: f(28), pose: { pz: R.pz - 4, pitch: 7, bend: 7, faceUp: 6, lk: 20, rk: -20, ...fists(26, 84 * QG_K), re: 24, le: -24 }, ease: 'lin' },
    { at: HAMMER_HIT, pose: down, ease: 'lin' },
    { at: HAMMER_HIT + 0.2, pose: { ...down, pz: R.pz - 17, pitch: 20, bend: 18, ...fists(40, B.armR[2] + 7.5) }, ease: 'out' },
    { at: 1.45, pose: { ...down, pz: R.pz - 13, pitch: 16, bend: 15, faceUp: 0, lk: 30, rk: -30, ...fists(40, B.armR[2] + 9) }, ease: 'io' },
    { at: HAMMER.long, pose: {}, ease: 'io' },
  ];
}
const HAMMER_KEYS = hammerKeys();
const hammerGlint = (t: number): number => (t < 0.25 ? 0 : t < 0.5 ? (t - 0.25) / 0.25 : t < HAMMER_HIT ? 1 : t < HAMMER_HIT + 0.12 ? 1 - (t - HAMMER_HIT) / 0.12 : 0);
const shaken = (since: number): number => (since >= 0 && since < 0.7 ? since + 0.001 : 0);

// =============================================================================================
// THE BOULDER ROLL

/**
 * THE ROLL'S NUMBERS (seconds from its start; tiles):
 *   tear     both fists down into the rock before it by 0.42 s; the boulder torn up out of it in a burst of rubble, 0.42 to 0.5 s
 *   haul     hauled up before its chest by 0.85 s; heaved up over its head by 1.2 s (the lane marked from 0.85 s: `BOULDER.aim`)
 *   hold     HELD over its head, trembling, its mark flaring, to 1.533 s (0.33 s)
 *   strike   TWO FRAMES, smeared: over and down (frame 47), bowled onto the floor before it (frame 48, 1.6 s: the clip's `hit`)
 *   wind-down  bent over after it, heaving, to 2.15 s; at rest 2.7 s
 */
export const ROLL_HIT = f(48);
export const ROLL_STRIKE = [f(46), f(48)] as const;
export const ROLL_SMEARED = (t: number): boolean => t > ROLL_STRIKE[0] + 1e-6 && t <= ROLL_STRIKE[1] + FR + 1e-6;
const ROLL_GRIP = 0.42;
const ROLL_UP = 0.5;
const ROLL_LONG = 2.7;
const ROLL_NAME = 'The quarry golem tears up a boulder, holds it overhead, and bowls it down a lane';
/** The boulder: its half across (the figure's lengths; 0.92 tiles across: the knight is 1.5 tall). */
export const BOULDER_R = 20;
/** How far apart its fists are as they hold the boulder between them (from its middle line). */
const GRIP_W = (BOULDER_R + 6) / QG_K;
function rollKeys(): Key3[] {
  const held: P = { pz: R.pz + 2.2, pitch: -9, bend: -7, faceUp: 19, ...fists(-3, 104, GRIP_W), re: 40, le: -40 };
  const shake = (d: number): P => ({ ...held, pz: (held.pz ?? 0) + d * 0.3, pitch: (held.pitch ?? 0) - d, faceUp: (held.faceUp ?? 0) + d, rhz: 104 + d, lhz: 104 + d });
  const bowled: P = { pz: R.pz - 15, pitch: 20, bend: 18, faceUp: -2, lk: 34, rk: -34, ...fists(42, BOULDER_R + 2, GRIP_W), re: 20, le: -20 };
  return [
    { at: 0, pose: {} },
    // (bent over, both fists driven down into the rock before it)
    { at: 0.3, pose: { pz: R.pz - 12, pitch: 26, bend: 24, faceUp: 4, lk: 30, rk: -30, ...fists(42, 30, GRIP_W), re: 30, le: -30 }, ease: 'io' },
    { at: ROLL_GRIP, pose: { pz: R.pz - 15, pitch: 30, bend: 28, faceUp: 2, lk: 34, rk: -34, ...fists(44, BOULDER_R - 2, GRIP_W), re: 26, le: -26 }, ease: 'in' },
    // (wrenched up out of it)
    { at: ROLL_UP + 0.06, pose: { pz: R.pz - 10, pitch: 16, bend: 12, faceUp: 8, lk: 28, rk: -28, ...fists(46, 36, GRIP_W), re: 30, le: -30 }, ease: 'out' },
    // (swung up and over at arm's length, out before its chest and up over its head: never against it)
    { at: 0.74, pose: { pz: R.pz - 3, pitch: 4, bend: 3, faceUp: 12, ...fists(38, 58, GRIP_W), re: 36, le: -36 }, ease: 'io' },
    { at: 0.92, pose: { pz: R.pz + 0.5, pitch: -5, bend: -4, faceUp: 15, ...fists(30, 84, GRIP_W), re: 40, le: -40 }, ease: 'in' },
    { at: 1.2, pose: held, ease: 'out' },
    { at: 1.31, pose: shake(0.8), ease: 'io' },
    { at: 1.42, pose: shake(-0.6), ease: 'io' },
    { at: ROLL_STRIKE[0], pose: shake(0.3), ease: 'io' },
    { at: f(47), pose: { pz: R.pz - 4, pitch: 8, bend: 8, faceUp: 6, lk: 20, rk: -20, ...fists(28, 74, GRIP_W), re: 30, le: -30 }, ease: 'lin' },
    { at: ROLL_HIT, pose: bowled, ease: 'lin' },
    { at: ROLL_HIT + 0.2, pose: { ...bowled, pz: R.pz - 17, pitch: 22, bend: 19, ...fists(45, BOULDER_R + 1, GRIP_W + 1) }, ease: 'out' },
    { at: 2.15, pose: { ...bowled, pz: R.pz - 13, pitch: 17, bend: 15, faceUp: 0, lk: 30, rk: -30, ...fists(43, BOULDER_R + 4, GRIP_W) }, ease: 'io' },
    { at: ROLL_LONG, pose: {}, ease: 'io' },
  ];
}
const ROLL_KEYS = rollKeys();
const rollGlint = (t: number): number => (t < 0.85 ? 0 : t < 1.2 ? (t - 0.85) / 0.35 : t < ROLL_HIT ? 1 : t < ROLL_HIT + 0.12 ? 1 - (t - ROLL_HIT) / 0.12 : 0);
/** Where the boulder is in its fists, `t` seconds into the roll (null before it is torn up, and once it is bowled): between them. */
export function boulderHeld(t: number): V3 | null {
  if (t < ROLL_GRIP + 0.02 || t >= ROLL_HIT - 1e-6) return null;
  const s = skeletonAt(BOULDER_GOLEM, 'throw', t);
  const c = lerp3(s.handL, s.handR, 0.5);
  // (torn up: from sitting in its hole, its top out of the rock, to up between its fists)
  const k = smooth((t - ROLL_GRIP) / (ROLL_UP - ROLL_GRIP + 0.1));
  return [c[0], c[1], Math.max(BOULDER_R * 0.98, c[2] * k + BOULDER_R * (1 - k))];
}
/** The boulder's tumble as it is held and swung (a turn about its own left, so that it is not still in its fists). */
const heldTurn = (t: number): number => 0.15 * Math.sin(t * 3.1) + (t > ROLL_UP ? (t - ROLL_UP) * 0.25 : 0);

/** THE BOULDER AS SOLIDS: a great rough lump of the quarry's rock, knobbed and cracked (never a ball), `turn` of the way round its roll. */
function boulderBits(put: Put, c: V3, turn: number, part = 'boulder'): void {
  const a = turn * TAU;
  // (it rolls about its own left: its forward and up turned over)
  const F: V3 = [Math.cos(a), 0, -Math.sin(a)];
  const U: V3 = [Math.sin(a), 0, Math.cos(a)];
  const L: V3 = [0, 1, 0];
  const rock = (seed: number) => (u: V3, tone: number): string => {
    let t = tone;
    const cr = Math.abs(Math.sin(u[0] * 5.1 + u[1] * 3.3 + seed) + Math.cos(u[2] * 4.4 - u[1] * 2.1)) < 0.08;
    if (cr) t = 0;
    else if (hash(Math.floor((u[0] + 1) * 5), Math.floor((u[2] + 1) * 5) + Math.floor((u[1] + 1) * 5) * 11, seed) > 0.8) t = Math.max(0, t - 1);
    return ROCK[Math.max(0, Math.min(4, t))];
  };
  const r = BOULDER_R;
  put(part, `${part}0`, { k: 'ball', c, ax: [mul(F, r), mul(L, r * 0.93), mul(U, r * 0.86)], skin: rock(1) });
  // (knobs and shoulders of rock out of it, so that it is a lump and not a ball)
  const KN: Array<[number, number, number, number]> = [[0.6, 0.2, 0.45, 0.55], [-0.5, 0.45, 0.3, 0.5], [0.15, -0.6, 0.4, 0.5], [-0.3, -0.35, -0.55, 0.5], [0.55, 0.1, -0.45, 0.48], [-0.6, -0.1, 0.2, 0.46], [0.05, 0.55, -0.4, 0.44]];
  KN.forEach(([x, y, z, k], i) => {
    const p = add(c, add(add(mul(F, x * r), mul(L, y * r)), mul(U, z * r)));
    put(part, `${part}k${i}`, { k: 'ball', c: p, ax: [mul(F, r * k), mul(L, r * k * 0.9), mul(U, r * k * 0.8)], skin: rock(3 + i) });
  });
}
/** The rubble and dust of the rock torn open where it is wrenched up, and the cracks in it (laid on the floor), from `ROLL_GRIP - 0.06`. */
function tornRock(put: Put, t: number, at: V3): void {
  const k = t - (ROLL_GRIP - 0.06);
  if (k < 0) return;
  const fade = 1 - smooth((t - 1.9) / 0.7);
  if (fade <= 0) return;
  // cracks, out from where it was, on the floor
  for (let i = 0; i < 7; i++) {
    const a0 = (i / 7) * TAU + hash(i, 1, 1301);
    const L = (BOULDER_R + 6 + 14 * hash(i, 2, 1301)) * Math.min(1, k / 0.1);
    let p: V3 = [at[0] + Math.cos(a0) * BOULDER_R * 0.8, at[1] + Math.sin(a0) * BOULDER_R * 0.8, 0.3];
    for (let s = 0; s < 6; s++) {
      const a = a0 + (hash(i, s + 3, 1301) - 0.5) * 0.9;
      const q: V3 = [p[0] + (Math.cos(a) * L) / 6, p[1] + (Math.sin(a) * L) / 6, 0.3];
      for (let j = 0; j < 4; j++) if (hash(i * 7 + s, j, 1303) < fade) put('cracks', 'cracks', { k: 'mote', p: lerp3(p, q, j / 4), c: '#140f1c', size: 2 });
      p = q;
    }
  }
  // the rim of broken rock round where it came up: chunks lying
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * TAU + hash(i, 4, 1301) * 0.4;
    const d = BOULDER_R * (0.95 + 0.35 * hash(i, 5, 1301));
    if (hash(i, 6, 1301) > fade) continue;
    put('rubble', `rubble${i}`, { k: 'ball', c: [at[0] + Math.cos(a) * d, at[1] + Math.sin(a) * d, 1.6], ax: sphere(1.8 + 1.6 * hash(i, 7, 1301)), skin: (_u, tone) => ROCK[Math.min(4, tone)] });
  }
  // the burst of chips and dust as it comes up out of it
  if (k < 0.6) for (let i = 0; i < 26; i++) {
    const a = hash(i, 8, 1301) * TAU;
    const v = 30 + 50 * hash(i, 9, 1301);
    const p: V3 = [at[0] + Math.cos(a) * (BOULDER_R * 0.8 + v * k), at[1] + Math.sin(a) * (BOULDER_R * 0.8 + v * k), (40 + 50 * hash(i, 10, 1301)) * k - 220 * k * k];
    if (p[2] > 0.5) put('chips', 'chips', { k: 'mote', p, c: i % 3 ? ROCK[3] : ROCK[2], size: i % 4 ? 2 : 3 });
  }
}
/** The smear of a strike: the fists (and the boulder between them), from a frame and a fifth back to now. */
function smash9Smear(st: Stage, put: Put, t: number, move: 'attack' | 'throw', hit: number): void {
  const thin = Math.abs(t - hit - FR) < 1e-6;
  const lines: V3[][] = [[], [], [], []];
  for (let i = 0; i <= 8; i++) {
    const u = Math.min(t, hit - 0.002) - (FR * 1.2 * i) / 8;
    const s = skeletonAt(BOULDER_GOLEM, move, u);
    const c = lerp3(s.handL, s.handR, 0.5);
    lines[0].push(move === 'throw' ? add(c, [0, 0, BOULDER_R]) : add(c, [0, 0, 6]));
    lines[1].push(s.handL);
    lines[2].push(s.handR);
    lines[3].push(move === 'throw' ? add(c, [BOULDER_R, 0, 0]) : c);
  }
  smearAlong(st, put, lines, thin, [CUT[1], CUT[2], CUT[3], '#fff8ec']);
}
function golemMoreBits(st: Stage, m: Moment): Bit[] {
  const bits: Bit[] = [];
  const put: Put = (part, piece, shape) => {
    bits.push({ part, piece, shape });
  };
  if (m.move === ROLL_NAME) {
    const c = boulderHeld(m.t);
    if (c) boulderBits(put, c, heldTurn(m.t));
    const s0 = skeletonAt(BOULDER_GOLEM, 'throw', ROLL_GRIP);
    tornRock(put, m.t, lerp3(s0.handL, s0.handR, 0.5));
    if (ROLL_SMEARED(m.t)) smash9Smear(st, put, m.t, 'throw', ROLL_HIT);
  } else if (m.move === HAMMER_NAME && HAMMER_SMEARED(m.t)) smash9Smear(st, put, m.t, 'attack', HAMMER_HIT);
  return bits;
}
const QG_CANVAS2 = { w: 340, h: 320, ax: 170, ay: 236 } as const;
const old = QUARRY_GOLEM.more ?? {};
/** THE QUARRY GOLEM WITH ITS BOULDER ROLL (GOLEM_BOULDER): the game's own in all but its hammer (by Movement 9) and its throw (the roll). */
export const BOULDER_GOLEM: Mob = {
  ...QUARRY_GOLEM,
  id: 'quarry-golem-boulder',
  attack: { name: HAMMER_NAME, motion: { keys: HAMMER_KEYS, hit: HAMMER_HIT }, rest: R, glint: hammerGlint, rally: (t) => shaken(t - HAMMER_HIT) } as MobMove,
  hit: HAMMER_HIT,
  warn: 0.45,
  more: {
    setOff: old.setOff as MobMove,
    halt: old.halt as MobMove,
    throw: { name: ROLL_NAME, motion: { keys: ROLL_KEYS, hit: ROLL_HIT }, rest: R, glint: rollGlint, rally: (t) => (t >= ROLL_HIT ? shaken(t - ROLL_HIT) : shaken(t - ROLL_GRIP)) } as MobMove,
  },
  canvas: QG_CANVAS2,
  aura: { ...QUARRY_GOLEM.aura, x: QUARRY_GOLEM.aura.x - QUARRY_GOLEM.canvas!.ax + QG_CANVAS2.ax, y: QUARRY_GOLEM.aura.y - QUARRY_GOLEM.canvas!.ay + QG_CANVAS2.ay },
  bits: (st, m) => [...QUARRY_GOLEM.bits(st, m), ...golemMoreBits(st, m)],
};

/**
 * THE BOULDER ON ITS WAY (seconds; tiles):
 *   aim      where the hero stands at `aim` (as it hauls the boulder up, 0.75 s before it is bowled): the lane is marked from it,
 *            through where he stood, to `long` tiles from the golem (or a wall)
 *   from     bowled onto the floor this far before the golem (its middle), at the strike
 *   pace     it rolls this many tiles a second down the lane
 *   bounce   it hops as it comes down out of its fists and twice more on its way: each hop's height (game pixels) and when (tiles on)
 *   half     the lane's half width; a hero whose middle is within it as the boulder comes by is struck, and it SMASHES on him
 *   r        THE SMASH: a hero within this many tiles of where it smashes is struck (by it, or by its rock), and knocked back
 *   long     the lane's length from the golem; it smashes at its end if it hits nothing first
 *   near, far  bowled at a hero from 2.5 to 8 tiles off (the old chunk's: 2.6 to 8)
 */
export const BOULDER = { hit: ROLL_HIT, strike: ROLL_STRIKE, aim: 0.85, from: 1.1, pace: 7, half: 0.75, r: 1.5, long: 9, near: 2.5, far: 8, hops: [[0.4, 18], [2.6, 9], [4.6, 4]] as ReadonlyArray<readonly [number, number]>, rubble: 1.6 } as const;
/** How far it has rolled from where it was bowled, `t` seconds after it was (tiles). */
export const boulderGone = (t: number): number => Math.max(0, t) * BOULDER.pace;
/** How high it is over the floor, `d` tiles from where it was bowled (game pixels): its hops, each a little arc. */
export function boulderHop(d: number): number {
  let prev = 0;
  for (const [at, h] of BOULDER.hops) {
    if (d < at) {
      const u = (d - prev) / (at - prev);
      return h * 4 * u * (1 - u) * (prev === 0 ? 1 : 1);
    }
    prev = at;
  }
  return 0;
}
/** Whether the boulder, `d` tiles down its lane, strikes a hero `x` tiles down it and `y` across it. */
export const boulderStrikes = (d: number, x: number, y: number): boolean => Math.abs(y) <= BOULDER.half && Math.abs(x - d) <= BOULDER_R / TILE3 + 0.3;
/** Whether the smash strikes a hero `x`, `y` tiles from where it smashes. */
export const smashStrikes = (x: number, y: number, r: number = BOULDER.r): boolean => Math.hypot(x, y) <= r;

/** The boulder rolling, on a canvas of its own (its middle on the anchor), `turn` (0 to 1) of the way round, rolling down the screen and right (from in front; the game turns it as it turns the figures). */
export const ROLLING_CANVAS = { w: 96, h: 96, ax: 48, ay: 52 } as const;
export const ROLLING_FRAMES = 12;
export function paintRolling(turn: number, view: GameView = 'front'): { px: Px; lights: Light[] } {
  const C = ROLLING_CANVAS;
  const st = stage(view, C.ax, C.ay, C);
  const bits: Bit[] = [];
  boulderBits((part, piece, shape) => bits.push({ part, piece, shape }), [0, 0, 0], turn);
  const lights = paintBits(st, bits, [0, 0, 0]);
  return { px: st.whole(ENEMY_RIM), lights };
}
/** It rolls once round in this long (its round's length over its pace). */
export const ROLL_ROUND = (TAU * BOULDER_R) / TILE3 / BOULDER.pace;
export function makeRollingArt(view: GameView = 'front'): Clip {
  return { frames: lazyFrames(ROLLING_FRAMES, (i) => toSprite(paintRolling(i / ROLLING_FRAMES, view), null, ROLLING_CANVAS.ax, ROLLING_CANVAS.ay)), fps: ROLLING_FRAMES / ROLL_ROUND, loop: 0 };
}

/** THE LANE, from the golem's front to its end, along the way `dx`, `dy` (tiles, a unit way), laid on a picture: its anchor where the golem stands. */
export function lanePainted(dx: number, dy: number, k: number, gone: number, long: number = BOULDER.long, half: number = BOULDER.half): { px: Px; ax: number; ay: number } {
  const [X1, Y1] = tileAt(0, 0, dx * long, dy * long);
  const pad = 70;
  const minX = Math.min(0, X1) - pad;
  const minY = Math.min(0, Y1) - pad;
  const px = new Px(Math.ceil(Math.abs(X1) + 2 * pad), Math.ceil(Math.abs(Y1) + 2 * pad));
  const ax = -minX;
  const ay = -minY;
  const dot2 = pen(px, true);
  const nx = -dy;
  const ny = dx;
  const at = (a: number, b: number): [number, number] => tileAt(ax, ay, dx * a + nx * b, dy * a + ny * b);
  const start = 0.8;
  // (laid out from the golem down its way as it is marked: `k` of its length; where the boulder has been, broken up)
  const upTo = start + (long - start) * clamp01(k);
  for (let a = start; a <= upTo; a += 0.06) {
    const passed = a < gone;
    const i = Math.round(a / 0.06);
    // its edges: dashed, the enemy's pink
    if (i % 5 < 3 && !(passed && i % 2)) {
      for (const sd of [1, -1]) {
        const [x, y] = at(a, sd * half);
        dot2(x, y, '#ff7aa8');
        dot2(x + 1, y, '#e0287a');
        dot2(x, y + 1, '#e0287a');
        dot2(x + 1, y + 1, '#7a1058');
      }
    }
  }
  // its chevrons, pointing down it, every tile
  for (let a = start + 0.6; a <= upTo - 0.2; a += 1.0) {
    if (a < gone) continue;
    for (let s = -1; s <= 1; s += 0.08) {
      const [x, y] = at(a - Math.abs(s) * 0.35, s * half * 0.6);
      dot2(x, y, '#ff7aa8');
      dot2(x + 1, y, '#e0287a');
      dot2(x, y + 1, '#e0287a');
    }
  }
  return { px, ax, ay };
}
/** The smash's canvas (its anchor where it smashes). */
export const SMASH_CANVAS = { w: 240, h: 200, ax: 120, ay: 130 } as const;
/**
 * THE SMASH, `t` seconds after it (where the boulder smashes; or the hammer's fists strike the floor, `quake`): the flash; a ring of
 * dust and grit going out over the floor to `r` in 0.18 s, the enemy's pink at its leading edge; the floor cracked; for the boulder,
 * its rock flung out all round in chunks, tumbling, landing within `r`, lying a moment, crumbling; a cloud of stone dust. By halves
 * (`side`) in the air: 'behind' before a figure there, 'before' after it. Gone by `BOULDER.rubble`.
 */
export function smashPainted(t: number, layer: 'floor' | 'air', r: number, quake = false, side: 'behind' | 'before' | 'all' = 'all'): { px: Px; lights: Light[] } {
  const C = SMASH_CANVAS;
  const px = new Px(C.w, C.h);
  const lights: Light[] = [];
  if (t < 0 || t > BOULDER.rubble) return { px, lights };
  const at = (x: number, y: number): [number, number] => tileAt(C.ax, C.ay, x, y);
  const onSide = (y: number): boolean => side === 'all' || (y > C.ay) === (side === 'before');
  const dot2 = pen(px);
  const under = pen(px, true);
  const fr = Math.floor(t * 30 + 1e-6);
  if (layer === 'floor') {
    // the cracks it opens, dark, red-hot at their lips at first (the golem's fire)
    const crackK = 1 - smooth((t - 0.9) / 0.6);
    for (let i = 0; i < (quake ? 9 : 6); i++) {
      const a0 = (i / (quake ? 9 : 6)) * TAU + hash(i, 1, 1311);
      let x = 0;
      let y = 0;
      const L = r * (0.45 + 0.4 * hash(i, 2, 1311)) * Math.min(1, t / 0.08);
      for (let s = 0; s < 8; s++) {
        const a = a0 + (hash(i, s + 3, 1311) - 0.5) * 0.8;
        const nx = x + (Math.cos(a) * L) / 8;
        const ny = y + (Math.sin(a) * L) / 8;
        for (let j = 0; j < 5; j++) {
          const [X, Y] = at(x + ((nx - x) * j) / 5, y + ((ny - y) * j) / 5);
          if (hash(i * 9 + s, j, 1313) > crackK) continue;
          dot2(X, Y, t < 0.35 && s < 4 ? FLAME[1] : '#0b0a11');
          dot2(X + 1, Y, '#0b0a11');
        }
        x = nx;
        y = ny;
      }
    }
    // the ring of dust going out to its edge, the enemy's pink at its leading edge
    const reach = r * (1 - (1 - clamp01(t / 0.18)) ** 3);
    const left = 1 - clamp01((t - 0.18) / 0.35);
    if (left > 0) {
      const n = Math.round(r * 70);
      for (let k = 0; k < n; k++) {
        const a = (k / n) * TAU;
        if (t <= 0.26 && k % 2 === 0) {
          const [x, y] = at(Math.cos(a) * reach, Math.sin(a) * reach);
          dot2(x, y, '#ff7aa8');
        }
        for (let b = 0; b < 3; b++) {
          const rr = reach - 0.3 * r * (b / 3) * (0.6 + 0.4 * hash(k, b, 1315));
          if (rr < 0.2 || hash(k, b + fr * 7, 1317) > left * (1 - b * 0.22)) continue;
          const [x, y] = at(Math.cos(a) * rr, Math.sin(a) * rr);
          under(x, y, b === 0 ? CUT[3] : CUT[2]);
        }
      }
    }
    // the rock it breaks into, lying where it fell, crumbling
    if (!quake) for (let i = 0; i < 16; i++) {
      const fly = 0.22 + 0.2 * hash(i, 3, 1319);
      if (t < fly) continue;
      const gone = 0.9 + 0.6 * hash(i, 4, 1319);
      if (t > gone) continue;
      const a = (i / 16) * TAU + hash(i, 1, 1319) * 0.4;
      const d = r * (0.3 + 0.62 * hash(i, 2, 1319));
      const [x, y] = at(Math.cos(a) * d, Math.sin(a) * d);
      const s = 3 + 4 * hash(i, 5, 1319) * (1 - smooth((t - gone + 0.2) / 0.2));
      blob(dot2, x, y - s * 0.6, s, i % 3 ? ROCK[2] : ROCK[3]);
      dot2(x - s, y - s * 1.2, ROCK[4]);
      blob(under, x, y + 1, s, ROCK[0]);
    }
    return { px, lights };
  }
  // --- the air ---
  if (t < 0.08 && side !== 'behind') {
    blob(dot2, C.ax, C.ay - (quake ? 4 : 14), (quake ? 5 : 8) * (1 - t / 0.08) + 2, '#fff8ec');
    lights.push({ x: C.ax, y: C.ay - 12, r: 80, color: FLAME[3], a: 0.35 });
  }
  // (the rock flung out, tumbling; chips)
  const n = quake ? 18 : 30;
  for (let i = 0; i < n; i++) {
    const fly = (quake ? 0.18 : 0.22) + 0.2 * hash(i, 3, 1319);
    if (t > fly) continue;
    const u = t / fly;
    const a = (i / n) * TAU + hash(i, 1, 1319) * 0.4;
    const d = r * (quake ? 0.2 + 0.5 * hash(i, 2, 1319) : 0.3 + 0.62 * hash(i, 2, 1319)) * (1 - (1 - u) * (1 - u));
    const [x, y] = at(Math.cos(a) * d, Math.sin(a) * d);
    if (!onSide(y)) continue;
    const up = (quake ? 22 : 40) * (0.4 + hash(i, 6, 1319)) * 4 * u * (1 - u) + (quake ? 4 : 16) * (1 - u);
    const s = quake ? 1 : 3 + 4 * hash(i, 5, 1319);
    blob(dot2, x, y - up, s, i % 3 ? ROCK[2] : ROCK[3]);
    if (s > 1) dot2(x - s + 1, y - up - s + 1, ROCK[4]);
  }
  // (the cloud of stone dust, settling, behind the rock)
  const settle = 1 - clamp01((t - 0.1) / 0.9);
  if (settle > 0) for (let i = 0; i < 26; i++) {
    const a = hash(i, 1, 1321) * TAU;
    const d = (0.2 + 0.6 * hash(i, 2, 1321)) * r * Math.min(1, 0.4 + t / 0.25);
    const [x, y] = at(Math.cos(a) * d, Math.sin(a) * d);
    if (!onSide(y)) continue;
    blob(under, x, y - 5 - 12 * hash(i, 3, 1321) * (1 - settle * 0.4), 2 + 3 * hash(i, 4, 1321), i % 3 ? CUT[2] : CUT[1], 0.5 + 0.4 * (1 - settle), i);
  }
  return { px, lights };
}

/** As the game holds a monster: the game's own golem in all it keeps (stand, walk, setting off, stopping, struck, death), its hammer by Movement 9, and the roll as its `throw` (the boulder rolling as `moves.rolling`). */
export function makeBoulderGolemArt(pace = QG_PACE): ActorArt {
  const art = { front: mobSet(QUARRY_GOLEM, 'front', pace), back: mobSet(QUARRY_GOLEM, 'back', pace) };
  for (const [set, view] of [[art.front, 'front'], [art.back, 'back']] as const) {
    const own = mobSet(BOULDER_GOLEM, view, pace);
    set.attack = own.attack;
    if (set.clips && own.clips) {
      set.clips.attack = own.clips.attack;
      set.clips.moves = { ...(set.clips.moves ?? {}), throw: (own.clips.moves ?? {}).throw, rolling: makeRollingArt(view) };
    }
  }
  return art;
}
void block;
void cutFace;
void norm;
void sub;
export type { Sprite };
