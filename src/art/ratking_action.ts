// THE RAT KING DONE THE ACTION WAY (the art chat's helper, 2 Nov 2026; docs/mockups/action_f12_ratking/README.md). A MOCK-UP:
// NOTHING OF THE GAME IMPORTS THIS FILE. All of it is behind one switch, RATKING_ACTION, off: with it off every frame the game shows
// of the Rat King and all it draws of his moves is as it was (art/rat_king.ts: his moves kept as they are; its insides now exported
// so that these moves are painted by its own painter).
//
// His review, 31 Oct 2026, offered “The sluices open, in place of the roll: water floods across the cistern in lanes, carrying rats
// with it. Stand on the dry ledges between”: “Yes (Recommended)”. And his rulebook's Monsters 9, Action, like a movie: every attack
// Movement 9 (24 Oct, “Like the wind up and wind down are big but the actual punch is lightning quick”; 28 Oct, “And bigger AOE to
// compensate for the extra time the player gets to evade”) with bigger areas.
//
//   THE SLUICES OPEN (`sluice`, in place of the roll): he rears up as a heap, every rat on its hind legs clawing the air, the King
//     hoisted on top, all of them SCREAMING, HELD, while the lanes are marked on the floor and the sluice gates in the cistern's wall
//     grind open; in two frames the heap SLAMS DOWN and the gates burst: water floods across the cistern in its lanes in a few
//     frames, white and black and full of tumbling rats (art/ratking_action_fx.ts), striking and carrying anyone in a lane; the
//     dry ledges between are safe. It runs three seconds and drains.
//   THE BITE (`attack`) by Movement 9: the heap rears, the front three rats up, jaws wide, HELD trembling; in two frames they LEAP
//     out to the end of their knotted tails and snap, a wedge 130 degrees across and 3.4 tiles out (old: 108 and 2.5); they bite
//     down and shake, and are hauled back by their tails.
//   STOLEN WORDS (`words`) by Movement 9: the King rears, every mouth open, a word gathers before him, its line following you
//     then LOCKING, HELD; in two frames he thrusts his head down and spits it: twice as fast, bursting twice as wide.
//   UNKNOT (`unknot`) by Movement 9: the heap swells and tenses, tails slipping loose, the King snatching the cord, HELD
//     trembling; in two frames THEY BURST OUTWARD, leaping, a ring of rats out to 2.6 tiles; they run on and are gone into the
//     cracks; the swarm, twice as many and twice as wide, streams past you, and they knot again (the game's own `knot`).
//   His stand, his scuttle, struck, knotting again and his death are the game's own.

import type { Sprite } from '../engine/px';
import type { ActorArt, AnimSet, Clip } from './actor_types';
import { hash, lazyFrames, toSprite } from './kit';
import type { Painted } from './kit';
import { ENEMY_RIM, FLAME } from './mkit';
import { TILE3, paintBits } from './new_mobs3';
import type { Bit, Put } from './new_mobs3';
import { stage } from './skin';
import type { GameView } from './skin';
import type { V3 } from './skeleton';
import { FR, f, smearAlong } from './action_f6_fx';
import {
  FUR, KNOT, KNOT_R, RATS, RK_AURA, RK_VOICE, crownBits, eyeOf, headOf, knotBits, makeRatKingArt, mixRat, placed, ratBits, running, seepOf,
} from './rat_king';
import type { KingPose, RatPose, RatRest } from './rat_king';

/** THE SWITCH, OFF. With it on, the bestiary's Rat King is `makeRatKingActionArt()`, and the rules are the main chat's (the README). */
export const RATKING_ACTION = { on: false };

const T = TILE3;
const D = Math.PI / 180;
const cl01 = (v: number): number => (v < 0 ? 0 : v > 1 ? 1 : v);
const sm = (v: number): number => {
  const c = cl01(v);
  return c * c * (3 - 2 * c);
};
const lerp = (a: number, b: number, k: number): number => a + (b - a) * k;
const add = (a: V3, b: V3): V3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const mul = (a: V3, k: number): V3 => [a[0] * k, a[1] * k, a[2] * k];
const lerpV = (a: V3, b: V3, k: number): V3 => [lerp(a[0], b[0], k), lerp(a[1], b[1], k), lerp(a[2], b[2], k)];
const bump = (t: number, a: number, b: number): number => (t <= a || t >= b ? 0 : Math.sin(Math.PI * ((t - a) / (b - a))));
const easeOut = (v: number): number => 1 - (1 - cl01(v)) ** 2;
/** The way out from his middle along a rat's heading (level). */
const outWay = (R: RatRest): V3 => [Math.cos(R.a * D), Math.sin(R.a * D), 0];
/** Is this rat one of the front three (on the floor, facing forward)? */
const FRONT = new Set(RATS.map((R, i) => (!R.upper && Math.cos(R.a * D) > 0.5 ? i : -1)).filter((i) => i >= 0));
const KING_I = RATS.findIndex((R) => R.king);
const FLOOR_RATS = RATS.map((R, i) => (R.upper ? -1 : i)).filter((i) => i >= 0);
/** A floor rat's forefoot held up before its chest (clawing the air), from its pose: `side` 1 its left, -1 its right. */
function airFoot(P: RatPose, side: number, claw = 0): V3 {
  const s = P.s;
  return add(add(add(P.c, mul(P.f, (4.4 + 0.8 * claw) * s)), mul(P.l, side * 2.1 * s)), mul(P.u, (-1.2 + 1.4 * claw) * s));
}
/** Its feet as at rest, each moved `by` along the floor and lifted `up`. */
const restFeet = (R: RatRest, by: V3 = [0, 0, 0], up: number[] = [0, 0, 0, 0]): V3[] => placed(R).feet.map((p, k) => [p[0] + by[0], p[1] + by[1], up[k]] as V3);
const shake = (t: number, k: number, seed: number): V3 => [Math.sin(t * 150 + seed) * 0.6 * k, Math.cos(t * 131 + seed * 2) * 0.45 * k, 0];

// =============================================================================================
// THE BITE BY MOVEMENT 9

/**
 * THE BITE'S NUMBERS (seconds from its start; tiles from his floor point):
 *   wind-up    the heap bunched back and REARING: the front three rats up on their hind legs, jaws wide, eyes flaring, by `rear`
 *              (0.4 s); HELD, trembling, squealing, to the strike (0.5 s); the wedge marked on the floor from `mark`
 *   strike     TWO FRAMES, smeared: the front three LEAP out `lunge` tiles to the end of their knotted tails and SNAP SHUT (frame 29,
 *              0.967 s: the clip's `hit`); the heap surges `surge` tiles after them
 *   wind-down  biting down and shaking to `bite`; HAULED BACK by their tails, off their feet, by `back`; the heap settled by `long`
 *   area       a WEDGE before him: from `near` to `reach` tiles, `arc` degrees across (old: out to 2.5, 108 degrees)
 */
export const BITE9_STRIKE = [f(27), f(29)] as const;
export const BITE9_HIT = f(29);
export const BITE9 = { mark: f(3), rear: f(12), held: f(12), hit: BITE9_HIT, strike: BITE9_STRIKE, bite: f(33), back: f(44), long: f(66), lunge: 1.4, surge: 0.3, near: 0.6, reach: 3.4, arc: 130 } as const;
export const bite9Smeared = (t: number): boolean => t > BITE9_STRIKE[0] + 1e-6 && t <= BITE9_STRIKE[1] + FR + 1e-6;
const LUNGE = BITE9.lunge * T;
/** How far forward the heap has surged (his own lengths). */
function biteSurge(t: number): number {
  const [s0, s1] = BITE9_STRIKE;
  if (t < s0) return -5 * sm(t / BITE9.rear);
  if (t < s1) return lerp(-5, BITE9.surge * T, (t - s0) / (s1 - s0));
  return BITE9.surge * T * (1 - sm((t - BITE9.back) / (BITE9.long - 0.25 - BITE9.back)));
}
/** One of the front three through the bite: how far it has leapt out, how high, and its pose. */
function biteFront(R: RatRest, t: number, i: number): RatPose {
  const [s0, s1] = BITE9_STRIKE;
  const way = outWay(R);
  const k1 = sm(t / BITE9.rear);
  const held = t > BITE9.held && t < s0 ? sm((t - BITE9.held) / 0.06) : 0;
  const late = (i % 3) * 0.02;
  if (t <= s0) {
    // REARED, jaws wide, trembling; its forefeet up clawing; bunched back over its hind feet
    const P = placed(R, { r: R.r - 3 * k1, pitch: R.pitch + 32 * k1, hp: 18 * k1, hy: 6 * Math.sin(t * 9 + i) * k1, gape: k1, eyes: 1 + k1, dx: shake(t, held, i)[0], dy: shake(t, held, i)[1] });
    const rest = restFeet(R);
    const claw = held * (0.5 + 0.5 * Math.sin(t * 22 + i * 2));
    P.feet = [lerpV(rest[0], airFoot(P, 1, claw), k1), lerpV(rest[1], airFoot(P, -1, claw), k1), rest[2], rest[3]];
    return P;
  }
  if (t < s1 + 1e-6) {
    // THE LEAP: out along its way, low over the floor, its jaws snapping shut as it lands
    const u = (t - s0) / (s1 - s0);
    const d = LUNGE * u;
    const P = placed(R, { r: R.r - 3 + 3 * u + d, z: 6 * Math.sin(Math.PI * u) + 3.5 * u, pitch: lerp(R.pitch + 32, R.pitch - 10, u), hp: lerp(18, -20, u), gape: 1 - u, eyes: 2 });
    P.feet = restFeet(R, mul(way, d), [10 * Math.sin(Math.PI * u), 10 * Math.sin(Math.PI * u), 7 * Math.sin(Math.PI * u), 7 * Math.sin(Math.PI * u)]);
    if (u > 0 && u < 1) P.feet = P.feet.map((p, k) => (k < 2 ? lerpV(p, airFoot(P, k === 0 ? 1 : -1, 1), 0.6) : p));
    return P;
  }
  if (t < BITE9.bite + late) {
    // BITING DOWN: its head driven on into what it bit, shaking it; its feet where it landed
    const k = sm((t - s1) / (BITE9.bite + late - s1));
    const P = placed(R, { r: R.r + LUNGE + 12 * k, z: 3.5, pitch: R.pitch - 10 - 2 * k, hp: -20 - 4 * k, hy: 14 * Math.sin((t - s1) * 60) * (1 - k * 0.5), gape: 0.15 + 0.15 * Math.sin((t - s1) * 70), eyes: 2 });
    P.feet = restFeet(R, mul(way, LUNGE));
    return P;
  }
  const b0 = BITE9.bite + late;
  const b1 = BITE9.back + late;
  if (t < b1) {
    // HAULED BACK by its tail, off its feet, squealing
    const k = (t - b0) / (b1 - b0);
    const e = sm(k);
    const P = placed(R, { r: R.r + (LUNGE + 12) * (1 - e), z: 3.5 * (1 - e) + 7 * Math.sin(Math.PI * k), pitch: lerp(R.pitch - 12, R.pitch, e) + 12 * Math.sin(Math.PI * k), hp: lerp(-24, 0, e) + 16 * Math.sin(Math.PI * k), gape: 0.6 * Math.sin(Math.PI * k) + 0.1, eyes: lerp(2, 1, e) });
    const up = 5 * Math.sin(Math.PI * k);
    P.feet = restFeet(R, mul(way, LUNGE * (1 - e)), [up, up, up * 0.8, up * 0.8]);
    return P;
  }
  // settled, heaving, glaring
  const k = sm((t - b1) / (BITE9.long - b1));
  const P = placed(R, { pitch: R.pitch + 4 * bump(t, b1, BITE9.long), hp: 8 * bump(t, b1, BITE9.long), gape: 0.25 * (1 - k), eyes: 1 + 0.4 * (1 - k) });
  P.feet = restFeet(R);
  return P;
}
export function bite9Pose(t: number): KingPose {
  const x = biteSurge(t);
  const rats = RATS.map((R, i) => {
    if (FRONT.has(i)) return biteFront(R, t, i);
    const rear = sm(t / BITE9.rear) * (1 - sm((t - BITE9.hit - 0.2) / 0.6));
    const sh = shake(t, t > BITE9.held && t < BITE9.hit ? 1 : 0, i);
    if (R.upper) {
      const king = R.king;
      return placed(R, {
        z: R.z + (king ? 5 : 2) * rear,
        pitch: R.pitch + (king ? 26 : 10) * rear - (king ? 14 : 0) * bump(t, BITE9_STRIKE[0], BITE9.hit + 0.3),
        hp: (king ? 16 : 20) * rear - 10 * bump(t, BITE9_STRIKE[0], BITE9.hit + 0.3),
        hy: king ? 0 : 14 * Math.sin(t * 7 + i),
        gape: king ? 0.8 * rear : 0.3 + 0.4 * rear * (0.5 + 0.5 * Math.sin(t * 23 + i)),
        eyes: 1 + rear,
        dx: x + sh[0],
        dy: sh[1],
      });
    }
    return placed(R, { dx: x * 0.6 + sh[0] * 0.5, pitch: R.pitch + 10 * rear, hp: 22 * rear, hy: 12 * Math.sin(t * 7 + i), gape: 0.2 + 0.5 * rear * (0.5 + 0.5 * Math.sin(t * 23 + i)), eyes: 1 + 0.5 * rear, feet: restFeet(R) });
  });
  const loud = t > BITE9.rear * 0.5 && t < BITE9.hit + 0.3;
  return { rats, knot: add(KNOT, [x * 0.8, 0, 0]), knotR: KNOT_R, cord: 0, crownAt: null, grains: seepOf(rats, t, loud ? 0.85 : 0.3), alive: true };
}

// =============================================================================================
// THE SLUICES OPEN: the summons

/**
 * ITS NUMBERS (seconds from its start):
 *   wind-up    HE REARS UP AS A HEAP by `rise` (0.5 s): every rat on the floor up on its hind legs, its forefeet clawing the air, the
 *              three on the knot climbing higher, the King hoisted on top, every mouth wide, SCREAMING (the stolen voices pouring up
 *              out of them); HELD, trembling, to the strike (1.0 s). The lanes marked on the floor from `mark`; the sluice gates grind
 *              open from `gates` (art/ratking_action_fx.ts)
 *   strike     TWO FRAMES, smeared: the heap SLAMS DOWN, forefeet onto the floor, the King flung down on top (frame 47, 1.567 s: the
 *              clip's `hit`): THE GATES BURST, the flood is loosed
 *   wind-down  squashed flat to `squash`; heaving back up, forefeet stepped back under them, the King shaking his head; on his stand
 *              by `long` (3.2 s). The flood runs on (art/ratking_action_fx.ts FLOOD) while he stands.
 */
export const SLUICE_STRIKE = [f(45), f(47)] as const;
export const SLUICE_HIT = f(47);
export const SLUICE = { mark: f(6), gates: f(9), rise: f(15), held: f(15), hit: SLUICE_HIT, strike: SLUICE_STRIKE, squash: f(52), long: f(96) } as const;
export const sluiceSmeared = (t: number): boolean => t > SLUICE_STRIKE[0] + 1e-6 && t <= SLUICE_STRIKE[1] + FR + 1e-6;
/** How far up the heap is reared (0 to 1), and how far slammed down (0 to 1). */
function sluiceUp(t: number): { up: number; slam: number } {
  const [s0, s1] = SLUICE_STRIKE;
  if (t <= s0) return { up: sm(t / SLUICE.rise), slam: 0 };
  if (t < s1) {
    const u = (t - s0) / (s1 - s0);
    return { up: 1 - u, slam: u };
  }
  const deep = 1 + 0.6 * easeOut((t - s1) / (SLUICE.squash - s1));
  return { up: 0, slam: t < SLUICE.squash ? deep : 1.6 * (1 - sm((t - SLUICE.squash) / (SLUICE.long - 0.35 - SLUICE.squash))) };
}
function sluiceRat(R: RatRest, t: number, i: number): RatPose {
  const [s0, s1] = SLUICE_STRIKE;
  const { up, slam } = sluiceUp(t);
  const held = t > SLUICE.held && t < s0 ? sm((t - SLUICE.held) / 0.08) : 0;
  const sh = shake(t, held, i);
  const scream = up * (0.82 + 0.18 * Math.sin(t * 31 + i * 1.7));
  const way = outWay(R);
  if (R.upper) {
    const king = R.king;
    return placed(R, {
      z: R.z + (king ? 22 : 12) * up - (king ? 5 : 4) * slam,
      pitch: R.pitch + (king ? 42 : 30) * up - (king ? 20 : 12) * slam,
      hp: (king ? 26 : 20) * up - (king ? 24 : 26) * slam,
      hy: king ? 10 * Math.sin(t * 6) * up + 18 * Math.sin((t - s1) * 24) * bump(t, SLUICE.squash, SLUICE.squash + 0.9) : 16 * Math.sin(t * 8 + i) * up,
      gape: king ? Math.max(scream, 0.35 * Math.min(1, slam)) : Math.max(scream, 0.2),
      eyes: 1 + Math.max(up, Math.min(1, slam)),
      belly: 1 + 0.12 * up,
      dx: sh[0],
      dy: sh[1],
    });
  }
  // (a rat on the floor: reared on its hind legs, forefeet clawing; slammed down onto them a step out, then stepping them back)
  const reach = 5;
  const P = placed(R, {
    r: R.r - 2 * up + 2 * Math.min(1, slam),
    pitch: R.pitch + 40 * up - 6 * Math.min(1, slam),
    hp: 22 * up - 12 * Math.min(1, slam),
    hy: 12 * Math.sin(t * 7 + i) * up,
    gape: Math.max(scream, 0.3 * Math.min(1, slam)),
    eyes: 1 + Math.max(up, Math.min(1, slam)),
    belly: 1 + 0.1 * up + 0.06 * Math.sin(t * 9 + i) * (1 - up),
    dx: sh[0],
    dy: sh[1],
  });
  const rest = restFeet(R);
  const claw = held * (0.5 + 0.5 * Math.sin(t * 20 + i * 2.3));
  const down = restFeet(R, mul(way, reach));
  // the forefeet: up clawing; slammed down a step out; stepped back in their turn
  const step0 = 2.0 + 0.06 * (i % 4);
  const fore = (side: number, k: number): V3 => {
    if (t <= s0) return lerpV(rest[k], airFoot(P, side, claw), up);
    if (t < s1 + 1e-6) {
      const u = (t - s0) / (s1 - s0);
      const air = airFoot(P, side, 0.3);
      return [lerp(air[0], down[k][0], u), lerp(air[1], down[k][1], u), lerp(air[2], 0, u)];
    }
    const s = cl01((t - step0 - k * 0.1) / 0.24);
    if (s <= 0) return down[k];
    if (s >= 1) return rest[k];
    return [lerp(down[k][0], rest[k][0], sm(s)), lerp(down[k][1], rest[k][1], sm(s)), 3 * Math.sin(Math.PI * s)];
  };
  P.feet = [fore(1, 0), fore(-1, 1), rest[2], rest[3]];
  return P;
}
export function sluicePose(t: number): KingPose {
  const { up, slam } = sluiceUp(t);
  const rats = RATS.map((R, i) => sluiceRat(R, t, i));
  // the stolen voices pouring up out of every mouth as they scream
  const grains = seepOf(rats, t, up > 0.3 ? 0.95 : 0.3);
  if (up > 0.3) {
    rats.forEach((P, i) => {
      const m = headOf(P).mouth;
      for (let j = 0; j < 4; j++) {
        const q = (t * 1.7 + j / 4 + hash(i, j, 6301)) % 1;
        grains.push([add(m, [Math.sin(q * 9 + i) * 4 * q, Math.cos(q * 7 + j) * 4 * q, 4 + 46 * q]), q < 0.4 ? RK_VOICE[3] : RK_VOICE[2], q < 0.5 ? 2 : 1]);
      }
    });
  }
  return { rats, knot: add(KNOT, [0, 0, 8 * up - 3 * slam]), knotR: KNOT_R, cord: 0, crownAt: null, grains, alive: true };
}

// =============================================================================================
// STOLEN WORDS BY MOVEMENT 9

/**
 * ITS NUMBERS (seconds from its start; tiles):
 *   wind-up    the King REARS by `rear` (0.4 s), every mouth open; THE WORD GATHERS before him from `gather` (0.2 s), the voices drawn
 *              in from every mouth; its line on the floor FOLLOWS YOU until `lock` (1.0 s), then holds; HELD, trembling, from `held`
 *   strike     TWO FRAMES, smeared: he thrusts his head down and forward and SPITS it (frame 41, 1.367 s: the clip's `hit`)
 *   wind-down  his head driven on, then recoiling, shaking; down by `long` (2.6 s)
 *   the word   flies at `speed` tiles a second (old 7) as far as `reach` (old 10), bursting on whoever it passes within `r` (old 0.5),
 *              or where it ends; its burst `burst` tiles round (old 1.0), seen `burstFor` (old 0.5) (art/ratking_action_fx.ts)
 */
export const WORDS9_STRIKE = [f(39), f(41)] as const;
export const WORDS9_HIT = f(41);
export const WORDS9 = { rear: f(12), gather: f(6), aim: f(6), lock: f(30), held: f(18), hit: WORDS9_HIT, strike: WORDS9_STRIKE, long: f(78), speed: 14, reach: 12, r: 0.7, burst: 2.0, burstFor: 0.7 } as const;
export const words9Smeared = (t: number): boolean => t > WORDS9_STRIKE[0] + 1e-6 && t <= WORDS9_STRIKE[1] + FR + 1e-6;
/** The King's thrust (0 reared back, 1 thrust down and forward), and how far reared. */
function wordsKing(t: number): { up: number; thrust: number } {
  const [s0, s1] = WORDS9_STRIKE;
  const up = t <= s0 + 1e-9 ? sm(t / WORDS9.rear) : 0;
  if (t <= s0) return { up, thrust: 0 };
  if (t < s1) return { up: 1 - (t - s0) / (s1 - s0), thrust: (t - s0) / (s1 - s0) };
  const on = 1 + 0.5 * easeOut((t - s1) / 0.14);
  return { up: 0, thrust: t < s1 + 0.14 ? on : 1.5 * (1 - sm((t - s1 - 0.14) / (WORDS9.long - 0.3 - s1 - 0.14))) - 0.25 * bump(t, s1 + 0.2, s1 + 0.7) };
}
export function words9Pose(t: number): KingPose {
  const [s0] = WORDS9_STRIKE;
  const { up, thrust } = wordsKing(t);
  const held = t > WORDS9.held && t < s0 ? sm((t - WORDS9.held) / 0.06) : 0;
  const loud = t < s0 ? sm(t / WORDS9.rear) : Math.max(0, 1 - sm((t - s0) / 0.6));
  const rats = RATS.map((R, i) => {
    const sh = shake(t, held, i);
    if (R.king) {
      return placed(R, {
        z: R.z + 8 * up + 2 * Math.min(1, thrust) - 6 * Math.max(0, thrust - 1),
        pitch: R.pitch + 34 * up - 16 * thrust,
        hp: 18 * up - 16 * thrust,
        gape: Math.max(up, Math.min(1, thrust)),
        eyes: 1 + Math.max(up, Math.min(1, thrust)),
        belly: 1 + 0.14 * up,
        dx: sh[0] - 3 * up + 11 * thrust,
        dy: sh[1],
      });
    }
    const rest = placed(R);
    return placed(R, { pitch: R.pitch + 14 * loud, hp: 30 * loud - 8 * Math.min(1, thrust), hy: 12 * Math.sin(t * 7 + i), gape: loud * (0.6 + 0.4 * Math.sin(t * 23 + i * 2)), eyes: 1 + 0.6 * loud, dx: sh[0] * 0.5, feet: R.upper ? undefined : rest.feet });
  });
  const king = rats[KING_I];
  const H = headOf(king);
  // THE WORD gathering before his mouth, bigger as it grows; pulled after his head as he spits it; gone as it flies
  const grow = t < WORDS9.gather ? 0 : t <= s0 + 1e-6 ? sm((t - WORDS9.gather) / (s0 - WORDS9.gather)) : 0;
  const charge = grow > 0 ? { at: add(H.mouth, mul(H.f, 8 + 7 * grow)), k: grow } : null;
  const grains: [V3, string, number][] = [];
  if (charge) {
    rats.forEach((P, i) => {
      if (P.king) return;
      const m = headOf(P).mouth;
      for (let j = 0; j < 4; j++) {
        const q = (t * 2.4 + j / 4 + i * 0.13) % 1;
        grains.push([lerpV(m, charge.at, q), q > 0.6 ? RK_VOICE[3] : RK_VOICE[2], q > 0.5 ? 2 : 1]);
      }
    });
  } else grains.push(...seepOf(rats, t, 0.4));
  return { rats, knot: KNOT, knotR: KNOT_R, cord: 0, crownAt: null, grains, alive: true, charge };
}

// =============================================================================================
// UNKNOT BY MOVEMENT 9

/**
 * ITS NUMBERS (seconds from its start; tiles):
 *   wind-up    the heap SWELLS AND TENSES by `swell` (0.4 s), bellies swollen, eyes flaring; the tails slipping loose from the knot from
 *              `loose`, the King snatching the Order's cord in his teeth at `cord`; HELD, trembling harder, to the strike (0.6 s)
 *   strike     TWO FRAMES, smeared: THEY BURST OUTWARD, every rat leaping out from the heap (frame 32, 1.067 s: the clip's `hit`): a ring
 *              of rats out to `ring` tiles from his floor point (old: none, they ran)
 *   then       landing at `leap` tiles out by `land`; running on, gone into the cracks by `out` (1.6 s)
 *   the swarm  (art/ratking_action_fx.ts SWARM9) then streams past you to where they knot again; the knot the game's own
 */
export const UNKNOT9_STRIKE = [f(30), f(32)] as const;
export const UNKNOT9_HIT = f(32);
export const UNKNOT9 = { swell: f(12), held: f(12), loose: f(14), cord: f(20), hit: UNKNOT9_HIT, strike: UNKNOT9_STRIKE, land: f(36), out: f(48), burst: 1.3, leap: 1.6, ring: 2.6 } as const;
export const unknot9Smeared = (t: number): boolean => t > UNKNOT9_STRIKE[0] + 1e-6 && t <= UNKNOT9_STRIKE[1] + FR + 1e-6;
/** How far each has come out from its place (its own lengths), and how high it is in the air. */
function burstOut(t: number, R: RatRest): { d: number; z: number } {
  const [s0, s1] = UNKNOT9_STRIKE;
  if (t <= s0) return { d: 0, z: 0 };
  const big = UNKNOT9.burst * T;
  const leap = UNKNOT9.leap * T;
  const late = hash(R.seed, 3, 6311) * 0.04;
  if (t < s1) {
    const u = (t - s0) / (s1 - s0);
    return { d: big * u, z: 14 * Math.sin((Math.PI / 2) * u) };
  }
  const land = UNKNOT9.land + late;
  if (t < land) {
    const u = (t - s1) / (land - s1);
    return { d: lerp(big, leap, easeOut(u)), z: 14 * Math.cos((Math.PI / 2) * u) };
  }
  const run = t - land;
  return { d: leap + 2.6 * T * run * Math.min(1, run / 0.15 + 0.4), z: 0 };
}
export function unknot9Pose(t: number): KingPose {
  const [s0] = UNKNOT9_STRIKE;
  const sw = sm(t / UNKNOT9.swell);
  const held = t > UNKNOT9.held && t < s0 ? sm((t - UNKNOT9.held) / 0.06) * (1 + (t - UNKNOT9.held) * 1.5) : 0;
  const free = sm((t - UNKNOT9.loose) / (s0 - UNKNOT9.loose));
  const rats = RATS.map((R, i) => {
    const sh = shake(t, held, i);
    if (t <= s0) {
      const st = placed(R, { r: R.r - 3 * sw, z: R.z + (R.upper ? 2 * sw : 0), pitch: R.pitch + 6 * sw, hp: 10 * sw, gape: 0.2 + 0.4 * sw, eyes: 1 + sw, belly: 1 + 0.16 * sw, dx: sh[0], dy: sh[1], feet: R.upper ? undefined : restFeet(R) });
      return { ...st, tailTo: lerpV(st.tailTo, add(st.c, mul(st.f, -15 * R.s)), free) };
    }
    const { d, z } = burstOut(t, R);
    const run = running(R, d, { gone: sm((t - UNKNOT9.land - 0.08 - hash(R.seed, 4, 6311) * 0.1) / 0.32), tailFree: 1, gape: 0.45, eyes: 1.8, belly: 1.08 });
    if (z <= 0) return run;
    // (in the air, flung: its body lifted, its feet tucked under it)
    const lift: V3 = [0, 0, z];
    return { ...run, c: add(run.c, lift), feet: run.feet.map((p) => add(p, [0, 0, z * 0.85 + 1])), tailTo: add(run.tailTo, mul(lift, 0.6)) };
  });
  return { rats, knot: KNOT, knotR: KNOT_R, cord: 0, cordAt: t > UNKNOT9.cord ? 'mouth' : 'knot', crownAt: null, grains: [], alive: true, lump: 1 - free, charge: null, corks: [] };
}

// =============================================================================================
// THE STRIKES' SMEAR, AND HIS PICTURES

/** His new moves. */
export type Move9 = 'attack' | 'sluice' | 'words' | 'unknot';
export const MOVES9: readonly Move9[] = ['attack', 'sluice', 'words', 'unknot'];
export function pose9(which: Move9, t: number): KingPose {
  if (which === 'attack') return bite9Pose(t);
  if (which === 'sluice') return sluicePose(t);
  if (which === 'words') return words9Pose(t);
  return unknot9Pose(t);
}
export const STRIKES9: Record<Move9, readonly [number, number]> = { attack: BITE9_STRIKE, sluice: SLUICE_STRIKE, words: WORDS9_STRIKE, unknot: UNKNOT9_STRIKE };
export const HITS9: Record<Move9, number> = { attack: BITE9_HIT, sluice: SLUICE_HIT, words: WORDS9_HIT, unknot: UNKNOT9_HIT };
export const smeared9 = (which: Move9, t: number): boolean => t > STRIKES9[which][0] + 1e-6 && t <= STRIKES9[which][1] + FR + 1e-6;
/** His moves' lengths. */
export const LONG9: Record<Move9, number> = { attack: BITE9.long, sluice: SLUICE.long, words: WORDS9.long, unknot: UNKNOT9.out };
/** The end each move strikes with: the front rat's jaws (the bite); the King's head (the slam); the King's jaws (the word spat); the front rat's head (the burst). */
export function tipOf(which: Move9, K: KingPose): V3 | null {
  if (which === 'attack') return headOf(K.rats[0]).mouth;
  if (which === 'sluice' || which === 'words') return which === 'words' ? headOf(K.rats[KING_I]).mouth : headOf(K.rats[KING_I]).at;
  return K.rats[0].gone > 0.5 ? null : headOf(K.rats[0]).at;
}
/** The smear of a strike: after-images along the way it came of what strikes (the leaping rats; the slammed heap; the King's head; every rat bursting out). */
function smear9(st: ReturnType<typeof stage>, put: Put, which: Move9, t: number): void {
  if (!smeared9(which, t)) return;
  const [, hit] = STRIKES9[which];
  const thin = Math.abs(t - hit - FR) < 1e-6;
  const back = FR * 1.5;
  const pts: ((K: KingPose) => V3)[] =
    which === 'attack'
      ? [...FRONT].flatMap((i) => [(K: KingPose) => headOf(K.rats[i]).mouth, (K: KingPose) => headOf(K.rats[i]).at, (K: KingPose) => K.rats[i].c])
      : which === 'sluice'
        ? [(K) => headOf(K.rats[KING_I]).at, (K) => headOf(K.rats[KING_I]).mouth, ...FLOOR_RATS.map((i) => (K: KingPose) => headOf(K.rats[i]).at), (K) => K.rats[0].feet[0], (K) => K.rats[0].feet[1]]
        : which === 'words'
          ? [(K) => headOf(K.rats[KING_I]).mouth, (K) => headOf(K.rats[KING_I]).at, (K) => headOf(K.rats[KING_I]).p([-1, 0, 3])]
          : RATS.map((_, i) => (K: KingPose) => headOf(K.rats[i]).at);
  const lines: V3[][] = pts.map(() => []);
  for (let i = 0; i <= 8; i++) {
    const K = pose9(which, Math.min(t, hit) - (back * i) / 8);
    pts.forEach((pt, j) => lines[j].push(pt(K)));
  }
  smearAlong(st, put, lines, thin, [FUR[2], FUR[3], FUR[4], '#efe4d6'], FLAME[2]);
}
/** His canvas for these: room for the leap of the front three, the heap reared high, his smear, and the ring of rats bursting out. */
export const RK9_CANVAS = { w: 700, h: 520, ax: 350, ay: 340 } as const;
/** His pose as solids (the game's own painter's pieces). */
export function solids9(which: Move9, t: number, view: GameView = 'front'): { K: KingPose; bits: Bit[] } {
  eyeOf(view);
  const K = pose9(which, t);
  const bits: Bit[] = [];
  const put: Put = (part, piece, shape) => bits.push({ part, piece, shape });
  knotBits(put, K);
  K.rats.forEach((P, i) => ratBits(P, put, String(i), view));
  const king = K.rats[KING_I];
  if (king.gone < 0.5) crownBits(put, king, null);
  if (K.cordAt === 'mouth' && king.gone < 0.9) {
    const H = headOf(king);
    let prev = H.mouth;
    for (let j = 1; j <= 6; j++) {
      const p = add(H.mouth, add(mul(king.f, -2.4 * j * king.s * (1 - king.gone)), [0, Math.sin(j * 1.3) * 1.5, -0.9 * j]));
      const q: V3 = [p[0], p[1], Math.max(0.6 * 2, p[2])];
      put('cord', 'cord', { k: 'rod', a: prev, b: q, ra: 1.2, rb: 1.2, ramp: ['#060508', '#0c0a10', '#17141d', '#26212e', '#332c3c'] });
      prev = q;
    }
  }
  if (K.charge) {
    // THE WORD gathering: a knot of the enemy's fire, bigger than the old, its sparks drawn in
    const { at, k } = K.charge;
    put('glow', 'charge', { k: 'glow', p: at, c: FLAME[2], r: 14 + 24 * k, a: 0.4 + 0.3 * k });
    const r = 2.5 + 5 * k;
    put('charge', 'charge', { k: 'ball', c: at, ax: [[r, 0, 0], [0, r, 0], [0, 0, r]], skin: (u, tone) => (u[2] > 0.3 ? RK_VOICE[4] : tone > 2 ? RK_VOICE[3] : RK_VOICE[2]) });
  }
  for (const [p, c, size] of K.grains) put('voices', 'voice', { k: 'mote', p, c, size });
  return { K, bits };
}
/** One frame of one of his new moves, from in front or behind. */
export function king9Painted(which: Move9, t: number, view: GameView = 'front'): Painted {
  const C = RK9_CANVAS;
  const st = stage(view, C.ax, C.ay, C);
  const { K, bits } = solids9(which, t, view);
  const put: Put = (part, piece, shape) => bits.push({ part, piece, shape });
  smear9(st, put, which, t);
  const lights = paintBits(st, bits, KNOT);
  return { px: st.whole(K.alive ? ENEMY_RIM : null), lights };
}
const frame9 = (which: Move9, t: number, view: GameView): Sprite => toSprite(king9Painted(which, t, view), RK_AURA, RK9_CANVAS.ax, RK9_CANVAS.ay);

/**
 * THE RAT KING AS THE GAME WOULD HOLD HIM WITH RATKING_ACTION ON: his stand, his scuttle, struck, knotting again and his death the
 * game's own; his bite, his stolen words and his unknotting by Movement 9; THE SLUICES OPEN (`moves.sluice`) in place of his roll
 * (no `curl`, `roll`, `uncurl`).
 */
export function makeRatKingActionArt(): ActorArt {
  const art = makeRatKingArt();
  for (const [set, view] of [[art.front, 'front'], [art.back, 'back']] as const) {
    const clip = (which: Move9, hit?: number): Clip => {
      const c: Clip = { frames: lazyFrames(Math.round(LONG9[which] * 30) + 1, (i) => frame9(which, i / 30, view)), fps: 30 };
      if (hit !== undefined) c.hit = hit;
      return c;
    };
    const attack = clip('attack', BITE9_HIT);
    (set as AnimSet).attack = lazyFrames(3, (i) => attack.frames[[12, 28, 36][i]]);
    if (set.clips) {
      set.clips.attack = attack;
      const moves = { ...(set.clips.moves ?? {}) };
      delete moves.curl;
      delete moves.roll;
      delete moves.uncurl;
      set.clips.moves = { ...moves, sluice: clip('sluice', SLUICE_HIT), words: clip('words', WORDS9_HIT), unknot: clip('unknot', UNKNOT9_HIT) };
    }
  }
  return art;
}
void mixRat;
