// THE CHAINED ONE'S MOVES DONE THE ACTION WAY (the art chat's helper, 31 Oct 2026; docs/mockups/action_f3_chained/README.md).
// A MOCK-UP: NOTHING OF THE GAME IMPORTS THIS FILE. All of it is behind one switch, CHAINED_ACTION, off: with it off the game's
// Chained One is every frame as he was (art/bosses3.ts: his moves there are kept as they are, and what these are built on is only
// said again by name, CO_KIT).
//
// The owner's words, 31 Oct 2026, in his review of every enemy for more action (offered for him: the ball swung wide round the
// whole pit on its full chain): “He needs some work.  I think the action really needs to be applied to his moves”. Told he would
// get every move redone the action way (a huge held wind-up, a lightning-fast blow, bigger areas, a combo finisher where it fits)
// and offered a plan first: “Just draw it”. Under his rules: Movement 9, 24 Oct (“Like the wind up and wind down are big but the
// actual punch is lightning quick”), and for the enemies, 28 Oct (“Start from now on, but every enemy is going to need that change
// eventually.  And bigger AOE to compensate for the extra time the player gets to evade”).
//
// His four moves, each kept what it is, each now: a big wind-up HELD (his eyes flaring in the cage: the warning), a strike of
// TWO FRAMES smeared with its after-images, a big wind-down; and bigger areas:
//   THE LASH (`attack`), a combo: a forehand lash and a backhand lash, each stepping in, then THE FINISHER: both fists raised
//     high over his head, held, and brought down together, his chains slammed on the floor before him and a CRACK splitting the
//     floor on out along it (art/chained_action_fx.ts).
//   THE WHIRL (`whirl`): wound round and crouched, his chains GATHERED, swung round in loops at his sides, held; then he spins on
//     the ball of one foot, faster and wider than before, his chains flat out round him, a streak of fire behind their ends (the
//     game walks him after you as he spins, as before); and out of it, his fists up over his head, held a moment, and slammed down,
//     his chains crashing down round him: A RING goes out over the floor round him.
//   THE HOOK (`hook`): whirled overhead, then AIMED, his fist drawn back behind his shoulder and his other arm pointing, held; the
//     hook FLUNG in two frames and flying lightning fast (the game's to draw); the drag, two hands on the chain and two hauls;
//     and A BLOW WAITING at the end of it: his fists up over his head, held, and hammered down before him where you lie.
//   THE BALL (`ball`): taken up from behind him as before, pressed up and HELD HIGH over his head, drawn back behind it, held; then
//     WHIPPED DOWN over the top in two frames, flying low and fast to crash on the floor ahead: A BIG RING where it lands; hauled
//     back and dragged round behind him as before. (The ball swung wide round the pit on its full chain was offered and he did not
//     take it: it is not here.)
// His chains still swing as chains do, worked out through every move (art/boss_chains.ts), as he is in each of his three states.

import type { ActorArt } from './actor_types';
import { CHAINED, CHAINED_FREED, CO_KIT, CO_REST, collarRingAt, coShape, cuffAt, leaning } from './bosses3';
import type { CoChainPlan, CoFreed, CoRope } from './bosses3';
import type { BossShape, Handover } from './boss_checks';
import { SIM_KEEP } from './boss_chains';
import { TILE3, mobSet, skeletonAt } from './new_mobs3';
import type { Bit, Mob, MobMove, Moment, Ropes } from './new_mobs3';
import type { Stage } from './skin';
import { about, add, bonesAt, lerp3, mul, norm, solve, sub } from './skeleton';
import type { Bones, Key3, Motion, Posed, Skeleton, V3 } from './skeleton';
import { footOn, footwork, plantBy, plantOf } from './bosses3';
import type { FootMove, Plant } from './bosses3';

type P = Partial<Bones>;
const K = CO_KIT;
const CB2 = K.body;
const R = CO_REST;
const D = Math.PI / 180;
const FR = 1 / 30;
/** A moment on the game's frames: frame `n`, at 30 a second. */
const f = (n: number): number => n / 30;
const clamp01 = (v: number): number => (v < 0 ? 0 : v > 1 ? 1 : v);
const smooth = (u: number): number => {
  const k = clamp01(u);
  return k * k * (3 - 2 * k);
};

/** THE SWITCH, OFF. With it on, the game's Chained One is `makeChainedActionArt` (the bestiary's to choose, as the cold Shade and the Boneward's wall are). */
export const CHAINED_ACTION = { on: false };

/** His feet where he stands at rest (each foot's toe on the floor). */
const L0: Plant = plantOf(CB2, 'L', {}, R);
const R0: Plant = plantOf(CB2, 'R', {}, R);

/** His eyes as he holds a blow (0 none to 1, flaring), over each of the moves' held wind-ups: from `from`, full by `full`, until the blow at `hit`, dying after. */
function glints(...holds: ReadonlyArray<readonly [number, number, number]>): (t: number) => number {
  return (t) => Math.max(0, ...holds.map(([from, full, hit]) => (t < from ? 0 : t < full ? (t - from) / (full - from) : t < hit ? 1 : t < hit + 0.15 ? 1 - (t - hit) / 0.15 : 0)));
}
/** A pose with both hands moved a little (a held pose trembling). */
const shake = (pose: P, dz: number, both = false): P => ({ ...pose, rhz: (pose.rhz as number) + dz, ...(both ? { lhz: (pose.lhz as number) + dz } : {}) });

// =============================================================================================
// THE LASH, A COMBO: forehand, backhand, and the finisher

/**
 * THE LASH'S MOMENTS (seconds; on the game's frames). Each blow: its strike from the last frame of its wind-up to the frame it
 * lands on (two frames), the blow on its last.
 *   lift, up, held    the forehand: his fist brought up, cocked behind his head, HELD (0.43 s to his hips going)
 *   strikes, hits     the forehand at 0.867 s, the backhand at 1.733 s, the finisher at 2.933 s
 *   long              3.6 s
 */
export const LASH_STRIKES = [[f(24), f(26)], [f(50), f(52)], [f(86), f(88)]] as const;
export const LASH_HITS = [f(26), f(52), f(88)] as const;
export const LASH_LONG = f(108);
/** How far he goes over the floor in the lash (his own lengths: a step in with each blow), and so where the game is to put him at its end. */
export const LASH_TRAVEL = 40;
/** (FOR THE GAME) The same in tiles: where the game moves him as the lash ends. */
export const LASH_TRAVEL_TILES = LASH_TRAVEL / TILE3;

// (the forehand: as his old lash, but held longer, struck in two frames, and stepped into further)
const L1_COCK2: P = K.coElbows({ ...K.LASH_COCK, yaw: -38, twist: -28, side: -11, rhx: -24, rhz: 18 }, [-0.5, 0.5, -0.6], [0.3, -0.7, 0.6]);
/** The body goes: his hips turning in toward his mark while his chest and his fist stay back. */
const L1_GO: P = K.coElbows({ ...L1_COCK2, px: -2, yaw: -24, twist: -36, side: -8, rhx: -24, rhz: 20 }, [-0.5, 0.5, -0.6], [0.3, -0.7, 0.6]);
const L1_OVER: P = { ...K.LASH_OVER, px: 4, rhIn: 2, rhx: 40, rhy: -22, rhz: 120 };
const L1_SNAP: P = K.coElbows({ ...K.LASH_SNAP, px: 16, rhx: 50, rhz: -4 }, [-0.8, 0.2, -0.3], [-0.2, -0.8, -0.5]);
const L1_THROUGH: P = K.coElbows({ ...K.LASH_THROUGH, px: 20 }, [-0.8, 0.2, -0.3], [-0.3, -0.8, -0.4]);
// (the backhand: up across him to over his left shoulder, the chain swung up behind it; held; and down across to his right)
const L2_RISE: P = K.coElbows({ pz: -12, px: 17, yaw: 4, pitch: 22, roll: 0, twist: 6, bend: 28, side: 0, faceTurn: 0, faceUp: 4, faceTilt: 0, lk: 26, rk: -20, rhIn: 1, rhx: 30, rhy: 18, rhz: -12, lhIn: 1, lhx: 14, lhy: 6, lhz: -54 }, [-0.6, 0.4, -0.6], [0.3, 0.1, -0.9]);
const L2_UP: P = K.coElbows({ pz: -8, px: 14, yaw: 22, pitch: 10, roll: 0, twist: 18, bend: 14, side: 6, faceTurn: -14, faceUp: 12, faceTilt: 0, lk: 22, rk: -22, rhIn: 1, rhx: -4, rhy: 36, rhz: 26, lhIn: 1, lhx: 8, lhy: 18, lhz: -46 }, [-0.4, 0.7, -0.5], [0.4, -0.2, 0.9]);
const L2_COCK: P = K.coElbows({ ...L2_UP, yaw: 26, twist: 22, side: 8, faceTurn: -18, rhx: -8, rhy: 38, rhz: 30 }, [-0.4, 0.7, -0.5], [0.4, -0.2, 0.9]);
const L2_GO: P = K.coElbows({ ...L2_COCK, px: 16, yaw: 14, twist: 32, faceTurn: -12, rhx: -8, rhy: 37, rhz: 30 }, [-0.4, 0.7, -0.5], [0.4, -0.2, 0.9]);
const L2_OVER: P = K.coElbows({ pz: -9, px: 19, yaw: -2, pitch: 14, roll: 0, twist: 10, bend: 18, side: 2, faceTurn: -4, faceUp: 8, faceTilt: 0, lk: 24, rk: -22, rhIn: 2, rhx: 60, rhy: 8, rhz: 95, lhIn: 1, lhx: 12, lhy: 16, lhz: -48 }, [-0.4, 0.6, -0.6], [0.5, 0.3, 0.8]);
const L2_SNAP: P = K.coElbows({ pz: -13, px: 26, yaw: -14, pitch: 24, roll: 0, twist: -12, bend: 34, side: -2, faceTurn: 4, faceUp: -2, faceTilt: 0, lk: 28, rk: -20, rhIn: 1, rhx: 46, rhy: -24, rhz: -22, lhIn: 1, lhx: 16, lhy: 12, lhz: -52 }, [-0.5, 0.6, -0.6], [-0.2, -0.9, -0.3]);
const L2_THROUGH: P = K.coElbows({ pz: -18, px: 28, yaw: -20, pitch: 30, roll: 0, twist: -18, bend: 42, side: -4, faceTurn: 6, faceUp: -6, faceTilt: 0, lk: 28, rk: -20, rhIn: 1, rhx: 30, rhy: -40, rhz: -44, lhIn: 1, lhx: 16, lhy: 10, lhz: -54 }, [-0.5, 0.6, -0.6], [-0.4, -0.8, -0.3]);
// (the finisher: both fists up over his head, held, arched back; and brought down together before him)
const F_UP: P = K.coElbows({ pz: -4, px: 30, yaw: -4, pitch: -2, roll: 0, twist: 0, bend: -8, side: 0, faceTurn: 0, faceUp: 24, faceTilt: 0, lk: 20, rk: -20, lhIn: 1, lhx: -2, lhy: -14, lhz: 60, rhIn: 1, rhx: -2, rhy: 14, rhz: 60 }, [0.1, 0.8, 0.4], [0.1, -0.8, 0.4]);
const F_HOLD: P = K.coElbows({ ...F_UP, pz: -2, px: 27, pitch: -8, bend: -16, faceUp: 28, lhx: -10, lhz: 58, rhx: -10, rhz: 58 }, [0.1, 0.8, 0.4], [0.1, -0.8, 0.4]);
const F_GO: P = K.coElbows({ ...F_HOLD, px: 32, pitch: 8, bend: -32 }, [0.1, 0.8, 0.4], [0.1, -0.8, 0.4]);
const F_OVER: P = K.coElbows({ ...F_HOLD, pz: -10, px: 37, pitch: 20, bend: 4, faceUp: 8, lhx: 28, lhz: 42, rhx: 28, rhz: 42 }, [0.3, 0.8, 0.2], [0.3, -0.8, 0.2]);
const F_SLAM: P = K.coElbows({ pz: -24, px: 42, yaw: -4, pitch: 30, roll: 0, twist: 0, bend: 50, side: 0, faceTurn: 0, faceUp: -10, faceTilt: 0, lk: 30, rk: -30, lhIn: 1, lhx: 40, lhy: -8, lhz: -50, rhIn: 1, rhx: 40, rhy: 8, rhz: -50 }, [-0.3, 0.8, 0.2], [-0.3, -0.8, 0.2]);
const F_FOLD: P = K.coElbows({ ...F_SLAM, pz: -27, px: 43, pitch: 40, bend: 50, faceUp: -14, lhx: 40, lhz: -54, rhx: 40, rhz: -54 }, [-0.3, 0.8, 0.2], [-0.3, -0.8, 0.2]);
const F_HEAVE: P = K.coElbows({ ...F_FOLD, pz: -25, bend: 46, faceUp: -6, lhz: -50, rhz: -50 }, [-0.3, 0.8, 0.2], [-0.3, -0.8, 0.2]);
/** At rest where his steps have taken him. */
const AT_END: P = { px: R.px + LASH_TRAVEL };

function lashMotion(): Motion {
  return {
    hit: LASH_HITS[0],
    keys: [
      { at: 0, pose: {} },
      // THE FOREHAND: up, cocked, HELD; his hips go; two frames; through
      { at: f(8), pose: K.LASH_LIFT, ease: 'io' },
      { at: f(13), pose: K.LASH_UP, ease: 'io' },
      { at: f(16), pose: K.coShake(K.LASH_UP, 1.0), ease: 'io' },
      { at: f(19), pose: K.LASH_COCK, ease: 'io' },
      { at: f(22), pose: L1_COCK2, ease: 'io' },
      { at: f(24), pose: L1_GO, ease: 'in' },
      { at: f(25), pose: L1_OVER, ease: 'lin' },
      { at: f(26), pose: L1_SNAP, ease: 'lin' },
      { at: f(32), pose: L1_THROUGH, ease: 'out' },
      // THE BACKHAND: up across to over his left shoulder, HELD; his hips go; two frames; through
      { at: f(37), pose: L2_RISE, ease: 'io' },
      { at: f(42), pose: L2_UP, ease: 'io' },
      { at: f(45), pose: shake(L2_UP, 1.0), ease: 'io' },
      { at: f(48), pose: L2_COCK, ease: 'io' },
      { at: f(50), pose: L2_GO, ease: 'in' },
      { at: f(51), pose: L2_OVER, ease: 'lin' },
      { at: f(52), pose: L2_SNAP, ease: 'lin' },
      { at: f(58), pose: L2_THROUGH, ease: 'out' },
      // THE FINISHER: both fists up over his head, HELD longest; his hips go; two frames; folded over them, heaving; up
      { at: f(70), pose: F_UP, ease: 'io' },
      { at: f(74), pose: shake(F_UP, 1.0, true), ease: 'io' },
      { at: f(78), pose: shake(F_HOLD, -0.6, true), ease: 'io' },
      { at: f(84), pose: F_HOLD, ease: 'io' },
      { at: f(86), pose: F_GO, ease: 'in' },
      { at: f(87), pose: F_OVER, ease: 'lin' },
      { at: f(88), pose: F_SLAM, ease: 'lin' },
      { at: f(96), pose: F_FOLD, ease: 'out' },
      { at: f(100), pose: F_HEAVE, ease: 'io' },
      { at: f(108), pose: AT_END, ease: 'io' },
    ],
  };
}
/** HIS FEET THROUGH THE LASH: the left foot strides in with the forehand; the right strides through past it with the backhand; the left in again with the finisher, and he is at rest a step and more on (LASH_TRAVEL) from where he began; the heel behind comes up as he drives off it. */
function lashFeet(): (t: number) => P {
  const T = LASH_TRAVEL;
  return footwork(CB2, {
    L: { start: L0, moves: [{ t0: f(21), t1: f(26), to: plantBy(L0, 26, 0), lift: 7 }, { t0: f(82), t1: f(88), to: plantBy(L0, T, 0), lift: 8 }] },
    R: {
      start: R0,
      moves: [
        { t0: f(22), t1: f(26), to: { ...R0, pitch: 14 } },
        { t0: f(30), t1: f(36), to: R0 },
        { t0: f(45), t1: f(52), to: plantBy(R0, T, 0), lift: 8 },
      ],
    },
  });
}

// =============================================================================================
// THE WHIRL: gathered and held, the spin, and the finisher

/**
 * THE WHIRL'S MOMENTS (seconds).
 *   gather   crouched and wound round to his right by 0.567 s, his chains swung round in loops at his sides, HELD to 1.0 s
 *   spin     on the ball of his left foot from 1.0 s: at full speed (WHIRL_RATE, 4 turns a second) from 1.1 s, slowing from
 *            1.668 s, still at 1.968 s; three turns in all. The game may play `loop` round and round (two turns, 0.5 s) to make
 *            it as long as it likes, walking him after you as it does.
 *   strike   the finisher: his fists up over his head as he slows, held; two frames, 2.233 to 2.3 s: the ring
 *   long     2.9 s
 */
export const WHIRL_RATE = 1440;
export const WHIRL_SPIN = 1.0;
const SPIN_UP = 0.15;
const SPIN_DOWN = 0.28;
/** How many times round he spins. */
const TURNS = 5;
/** How far round he spins (degrees): from wound round to his right, round four times to face as he began. */
const SPIN_ALL = 360 * TURNS + (R.yaw - K.whirlW0);
const SPIN_FULL = WHIRL_SPIN + SPIN_UP;
const SPIN_SLOW = SPIN_FULL + (SPIN_ALL - (WHIRL_RATE * (SPIN_UP + SPIN_DOWN)) / 2) / WHIRL_RATE;
export const WHIRL_STILL = SPIN_SLOW + SPIN_DOWN;
export const WHIRL_LOOP = { at: f(47), span: 720 / WHIRL_RATE } as const;
/** The finisher's frame: his hips go on the frame before it. */
const WF = 82;
export const WHIRL_STRIKE = [f(WF), f(WF + 2)] as const;
export const WHIRL_HIT = f(WF + 2);
export const WHIRL_LONG = f(WF + 20);
/** How far round he has spun from wound up, `t` seconds in (degrees). */
export function whirlTurned(t: number): number {
  const w = WHIRL_RATE;
  if (t <= WHIRL_SPIN) return 0;
  if (t <= SPIN_FULL) return (w * (t - WHIRL_SPIN) ** 2) / (2 * SPIN_UP);
  const a = (w * SPIN_UP) / 2;
  if (t <= SPIN_SLOW) return a + w * (t - SPIN_FULL);
  const b = a + w * (SPIN_SLOW - SPIN_FULL);
  const u = Math.min(SPIN_DOWN, t - SPIN_SLOW);
  return b + w * u - (w * u * u) / (2 * SPIN_DOWN);
}
/** Where the ball of his left foot is, spinning on it: under his hips; and where his hips are over the floor as he spins. */
const PIVOT: readonly [number, number] = [R.px + 3, 3];
const SPUN_AT: readonly [number, number] = [PIVOT[0] - 1, PIVOT[1] - 3];
/** How each knee points over its foot (as he stands: the game's own whirl's). */
const KNEE_L = R.lk - R.lft;
const KNEE_R = R.rk - R.rft;
/** The spin `turn` degrees round from wound up, his arms out wide (`up` 0) or coming up over his head (to 1). */
function spinAt(turn: number, up = 0): P {
  const yaw = K.whirlW0 + turn;
  const u = smooth(up);
  const tw = -6 * (1 - u);
  return {
    px: SPUN_AT[0], py: SPUN_AT[1], pz: -16 + 10 * u, yaw, twist: tw, ...leaning(yaw, 8 * (1 - u) - 4 * u, 10 * (1 - u) - 8 * u, tw),
    faceTurn: yaw + 12 * (1 - u), faceUp: 4 + 20 * u, faceTilt: 0,
    lhIn: 0, lhx: 4 - 8 * u, lhy: 44 - 58 * u, lhz: -34 + 92 * u, le: -30, rhIn: 0, rhx: 4 - 8 * u, rhy: -44 + 58 * u, rhz: -34 + 92 * u, re: 30,
    lk: L0.turn + (yaw - R.yaw) + KNEE_L, rk: R0.turn + (yaw - R.yaw) + KNEE_R,
  };
}
const W_CROUCH: P = K.coElbows({ pz: -14, px: -2, yaw: -20, pitch: 12, twist: -10, bend: 20, faceTurn: 0, faceUp: 12, lk: 26, rk: -26, lhIn: 1, lhx: 6, lhy: 30, lhz: -42, rhIn: 1, rhx: 6, rhy: -30, rhz: -42 }, [0, 0.6, -0.6], [0, -0.6, -0.6]);
/** Wound round to his right, crouched, his arms out low at his sides, each hand a little way round a ring (`a`, degrees: the chains swung round in loops beside him). */
function gathered(a: number, r: number, deep = 0): P {
  const c = Math.cos(a * D);
  const sn = Math.sin(a * D);
  const tw = -28 - deep;
  return {
    px: R.px - 1, py: 0, pz: -15 - deep, yaw: K.whirlW0, twist: tw, ...leaning(K.whirlW0, 8, 12 + deep, tw), faceTurn: K.whirlW0 + 40, faceUp: 10, faceTilt: 0,
    lhIn: 0, lhx: 6 + r * c, lhy: 40, lhz: -14 + r * sn, le: -30, rhIn: 0, rhx: 6 - r * c, rhy: -40, rhz: -14 - r * sn, re: 30,
  };
}
function whirlMotion(): Motion {
  const keys: Key3[] = [
    { at: 0, pose: {} },
    { at: f(9), pose: W_CROUCH, ease: 'io' },
    { at: f(17), pose: gathered(0, 0), ease: 'io' },
  ];
  // THE GATHERING, HELD: his body still, his hands swinging his chains round in loops beside him, faster
  for (let i = 1; i <= 13; i++) {
    const t = f(17 + i);
    const u = i / 13;
    keys.push({ at: t, pose: gathered(360 * (0.5 * u + 0.75 * u * u), 9 * smooth(u * 2) * (1 - smooth((u - 0.7) / 0.3)), 2 * u), ease: 'lin' });
  }
  // THE SPIN: two keys a frame
  for (let t = WHIRL_SPIN + 1 / 60; t <= WHIRL_STILL + 1e-9; t += 1 / 60) {
    const up = (t - (SPIN_SLOW - 0.05)) / (WHIRL_STILL - (SPIN_SLOW - 0.05));
    const g = clamp01((t - WHIRL_SPIN) / 0.15);
    const pose = spinAt(whirlTurned(t), up);
    // (out of the gathering: his arms swing out wide as he goes)
    const from = gathered(360 * 1.25, 9, 2);
    keys.push({ at: t, pose: g < 1 ? K.between(from, pose, smooth(g)) : pose, ease: 'lin' });
  }
  // THE FINISHER: held up there, his chains round over him; his hips go; two frames; folded; up, three times round
  const round = (pose: P): P => ({ ...pose, yaw: (pose.yaw ?? R.yaw) + 360 * TURNS, faceTurn: (pose.faceTurn ?? R.faceTurn) + 360 * TURNS });
  const up = (pose: P): P => ({ ...pose, lk: R.lk + 360 * TURNS, rk: R.rk + 360 * TURNS });
  const top = spinAt(SPIN_ALL, 1);
  const HOLD: P = up({ ...top, pz: -7, ...leaning(top.yaw as number, -6, -12, 0) });
  const GO: P = up({ ...HOLD, pz: -8, ...leaning(top.yaw as number, 3, -21, 0) });
  const OVER: P = up(K.coElbows({ ...HOLD, pz: -12, ...leaning(top.yaw as number, 16, 6, 0), faceUp: 6, lhIn: 1, lhx: 26, lhy: -14, lhz: 40, rhIn: 1, rhx: 26, rhy: 14, rhz: 40 }, [0.3, 0.8, 0.2], [0.3, -0.8, 0.2]));
  const SLAM: P = up(K.coElbows({ ...HOLD, pz: -26, px: SPUN_AT[0] + 2, ...leaning(top.yaw as number, 32, 46, 0), faceUp: -12, lhIn: 1, lhx: 40, lhy: -8, lhz: -50, rhIn: 1, rhx: 40, rhy: 8, rhz: -50 }, [-0.3, 0.8, 0.2], [-0.3, -0.8, 0.2]));
  const FOLD: P = up(K.coElbows({ ...SLAM, pz: -28, pitch: 38, bend: 48, lhz: -54, rhz: -54 }, [-0.3, 0.8, 0.2], [-0.3, -0.8, 0.2]));
  keys.push(
    { at: f(WF - 6), pose: shake(HOLD, 0.8, true), ease: 'io' },
    { at: f(WF - 1), pose: HOLD, ease: 'io' },
    { at: f(WF), pose: GO, ease: 'in' },
    { at: f(WF + 1), pose: OVER, ease: 'lin' },
    { at: f(WF + 2), pose: SLAM, ease: 'lin' },
    { at: f(WF + 8), pose: FOLD, ease: 'out' },
    { at: f(WF + 12), pose: { ...FOLD, pz: -26, bend: 45 }, ease: 'io' },
    { at: f(WF + 20), pose: up(round({})), ease: 'io' },
  );
  return { hit: WHIRL_HIT, keys };
}
/**
 * HIS FEET THROUGH THE WHIRL: at rest as he crouches, winds and gathers; his left foot stepped in under his hips as he goes, and
 * he spins on its ball (its heel up, the spot under its ball where it is), his right foot off the floor, carried round, its knee
 * bent; slowing, his right foot set down wide and his left heel down; and when he has slammed his chains down, each foot stepped
 * back where it stood, three times round.
 */
function whirlFeet(motion: Motion): (t: number) => P {
  const yawAt = (t: number): number => bonesAt(motion.keys, R, t).yaw;
  const pivot: Plant = { at: PIVOT, turn: L0.turn, pitch: 0, on: 'toe' };
  const lift = 9;
  const T0 = WHIRL_SPIN - 0.02;
  const T1 = WHIRL_SPIN + 0.1;
  const down = WHIRL_STILL - 0.1;
  // (his right foot, carried round under his hip as he turns, off the floor)
  const rOff: readonly [number, number] = [R0.at[0] - R.px, R0.at[1]];
  const rAt = (yaw: number): Plant => {
    const a = (yaw - R.yaw) * D;
    return { at: [SPUN_AT[0] + (rOff[0] * Math.cos(a) - rOff[1] * Math.sin(a)) * 0.8, SPUN_AT[1] + (rOff[0] * Math.sin(a) + rOff[1] * Math.cos(a)) * 0.8], turn: R0.turn + (yaw - R.yaw), pitch: 26 };
  };
  const ALL = 360 * TURNS;
  const rDown: Plant = (() => {
    const p = rAt(R.yaw + ALL);
    return { ...p, at: [p.at[0] - 4, p.at[1] - 10], pitch: 0, turn: R0.turn + ALL };
  })();
  const L1080: Plant = { ...L0, turn: L0.turn + ALL };
  const R1080: Plant = { ...R0, turn: R0.turn + ALL };
  const before = footwork(CB2, { L: { start: L0, moves: [{ t0: T0, t1: T1, to: { ...pivot, turn: L0.turn + (yawAt(T1) - R.yaw), pitch: 18 }, lift: 6 }] }, R: { start: R0, moves: [] } });
  const after = footwork(CB2, {
    L: { start: { ...pivot, turn: L0.turn + ALL, pitch: 18 }, moves: [{ t0: down, t1: WHIRL_STILL, to: { ...pivot, turn: L0.turn + ALL, pitch: 0 } }, { t0: f(WF + 9), t1: f(WF + 15), to: L1080, lift: 7 }], knee: KNEE_L },
    R: { start: rDown, moves: [{ t0: f(WF + 12), t1: f(WF + 19), to: R1080, lift: 7 }], knee: KNEE_R },
  });
  return (t) => {
    if (t <= T1) {
      const out = before(t);
      // (his right foot leaves the floor as he goes: lifted from where it stood, and carried round)
      if (t > T0) {
        const k = smooth((t - T0) / (T1 - T0));
        const at = rAt(yawAt(t));
        const from = R0;
        const p: Plant = { at: [from.at[0] + (at.at[0] - from.at[0]) * k, from.at[1] + (at.at[1] - from.at[1]) * k], turn: from.turn + (at.turn - from.turn) * k, pitch: (at.pitch ?? 0) * k };
        Object.assign(out, footOn(CB2, 'R', p, lift * Math.sin((Math.PI / 2) * k)));
      }
      return out;
    }
    if (t < down) {
      // (spinning on the ball of his left foot: turned as he is turned; his right off the floor, round with him)
      const yaw = yawAt(t);
      return { ...footOn(CB2, 'L', { ...pivot, turn: L0.turn + (yaw - R.yaw), pitch: 18 }), ...footOn(CB2, 'R', rAt(yaw), lift), lk: L0.turn + (yaw - R.yaw) + KNEE_L, rk: R0.turn + (yaw - R.yaw) + KNEE_R };
    }
    if (t < WHIRL_STILL) {
      const yaw = yawAt(t);
      const k = smooth((t - down) / (WHIRL_STILL - down));
      const a = rAt(yaw);
      const p: Plant = { at: [a.at[0] + (rDown.at[0] - a.at[0]) * k, a.at[1] + (rDown.at[1] - a.at[1]) * k], turn: a.turn + (rDown.turn - a.turn) * k, pitch: (a.pitch ?? 0) * (1 - k) };
      return { ...footOn(CB2, 'L', { ...pivot, turn: L0.turn + (yaw - R.yaw), pitch: 18 * (1 - k) }), ...footOn(CB2, 'R', p, lift * (1 - k)) };
    }
    return after(t);
  };
}

// =============================================================================================
// THE HOOK: whirled, aimed and held, flung, the drag, and the blow waiting

/**
 * THE HOOK'S MOMENTS (seconds).
 *   aim      whirled over his head 0.3 to 0.9 s; drawn back behind his shoulder, his left arm pointing, by 1.1 s; HELD to 1.5 s
 *   let      flung in two frames (1.567 to 1.633 s): it leaves his hand at HOOK_LET; it bites (catches you, or the floor) at
 *            HOOK_BITE, three frames later, however far it flies
 *   pulls    each of his two hauls on the chain (when it begins and ends); it is back at his feet at HOOK_BACK
 *   blow     the blow waiting: his fists up over his head by 2.733 s, HELD to 3.0 s; two frames (3.0 to 3.067 s)
 *   long     3.7 s
 */
export const HOOK_STRIKE = [f(47), f(49)] as const;
export const HOOK_LET = f(49);
export const HOOK_BITE = f(52);
export const HOOK_PULLS = [[f(58), f(63)], [f(68), f(74)]] as const;
export const HOOK_BACK = f(74);
export const HOOK_BLOW_STRIKE = [f(90), f(92)] as const;
export const HOOK_BLOW = f(92);
export const HOOK_LONG = f(111);
/** Whether the hook is out across the room (the game's to draw, with its chain from his right cuff). */
export const hookOut = (t: number): boolean => t >= HOOK_LET && t < HOOK_BACK;

const HOOK_AIM: P = K.coElbows({ pz: -8, px: -5, yaw: -26, pitch: 4, roll: 0, twist: -18, bend: 8, side: -4, faceTurn: 30, faceUp: 8, faceTilt: 0, lk: 18, rk: -22, rhIn: 1, rhx: -28, rhy: -12, rhz: 22, lhIn: 1, lhx: 44, lhy: 10, lhz: 8 }, [-0.1, 0.4, -0.9], [0.1, -0.6, 0.8]);
const HOOK_GO: P = K.coElbows({ ...HOOK_AIM, px: -3, yaw: -14, twist: -30, faceTurn: 18, rhx: -28, rhz: 23 }, [-0.1, 0.4, -0.9], [0.1, -0.6, 0.8]);
const HOOK_OVER: P = K.coElbows({ pz: -8, px: 2, yaw: -4, pitch: 10, roll: 0, twist: -6, bend: 14, side: 0, faceTurn: 4, faceUp: 6, faceTilt: 0, lk: 22, rk: -20, rhIn: 1, rhx: 8, rhy: -10, rhz: 36, lhIn: 1, lhx: 10, lhy: 14, lhz: -40 }, [-0.3, 0.5, -0.8], [0.4, -0.5, 0.7]);
const HOOK_FLUNG: P = K.coElbows({ ...K.HOOK_THROW, px: 9, rhIn: 2, rhx: 84, rhy: -26, rhz: 80 }, [-0.3, 0.3, -0.9], [-0.3, -0.7, -0.6]);
const HOOK_AFTER: P = K.coElbows({ ...K.HOOK_THROW, px: 10, pz: -12, pitch: 24, bend: 30, rhIn: 2, rhx: 86, rhy: -26, rhz: 62, faceUp: -2 }, [-0.3, 0.3, -0.9], [-0.3, -0.7, -0.6]);
const HAMMER_UP: P = K.coElbows({ pz: -6, px: 0, yaw: -4, pitch: -2, roll: 0, twist: 0, bend: -8, side: 0, faceTurn: 0, faceUp: 20, faceTilt: 0, lk: 22, rk: -22, lhIn: 1, lhx: 0, lhy: -14, lhz: 58, rhIn: 1, rhx: 0, rhy: 14, rhz: 58 }, [0.1, 0.8, 0.4], [0.1, -0.8, 0.4]);
const HAMMER_HOLD: P = K.coElbows({ ...HAMMER_UP, pz: -4, px: -2, pitch: -7, bend: -15, faceUp: 22, lhx: -8, rhx: -8 }, [0.1, 0.8, 0.4], [0.1, -0.8, 0.4]);
const HAMMER_GO: P = K.coElbows({ ...HAMMER_HOLD, px: 2, pitch: 8, bend: -30 }, [0.1, 0.8, 0.4], [0.1, -0.8, 0.4]);
const HAMMER_OVER: P = K.coElbows({ ...HAMMER_HOLD, pz: -10, px: 6, pitch: 20, bend: 4, faceUp: 6, lhx: 26, lhz: 40, rhx: 26, rhz: 40 }, [0.3, 0.8, 0.2], [0.3, -0.8, 0.2]);
const HAMMER_DOWN: P = K.coElbows({ pz: -24, px: 10, yaw: -4, pitch: 30, roll: 0, twist: 0, bend: 50, side: 0, faceTurn: 0, faceUp: -10, faceTilt: 0, lk: 30, rk: -30, lhIn: 1, lhx: 40, lhy: -8, lhz: -50, rhIn: 1, rhx: 40, rhy: 8, rhz: -50 }, [-0.3, 0.8, 0.2], [-0.3, -0.8, 0.2]);
const HAMMER_FOLD: P = K.coElbows({ ...HAMMER_DOWN, pz: -27, px: 11, pitch: 40, bend: 50, lhz: -54, rhz: -54 }, [-0.3, 0.8, 0.2], [-0.3, -0.8, 0.2]);

function hookMotion(): Motion {
  const keys: Key3[] = [
    { at: 0, pose: {} },
    { at: f(9), pose: K.HOOK_UP, ease: 'io' },
  ];
  // (round and round over his head, faster, from his raised fist: brought round behind him, going to his right)
  const STEPS = 18;
  const from = f(9);
  const to = f(27);
  const span = to - from;
  const W0 = 1.4 * 360;
  const W1 = 2.4 * 360;
  const all = ((W0 + W1) / 2) * span;
  const start = 200 - all;
  for (let i = 1; i <= STEPS; i++) {
    const u = (span * i) / STEPS;
    const turned = W0 * u + ((W1 - W0) * u * u) / (2 * span);
    keys.push({ at: from + u, pose: K.hookWhirl(start + turned, 26 * smooth(u / 0.2) * (1 - 0.4 * smooth((u - span + 0.12) / 0.12))), ease: 'lin' });
  }
  keys.push(
    // AIMED: drawn back behind his shoulder, his other arm pointing; HELD; his hips go; FLUNG in two frames; on after it
    { at: f(33), pose: HOOK_AIM, ease: 'out' },
    { at: f(37), pose: shake(HOOK_AIM, 1.0), ease: 'io' },
    { at: f(41), pose: shake(HOOK_AIM, -0.6), ease: 'io' },
    { at: f(45), pose: HOOK_AIM, ease: 'io' },
    { at: f(47), pose: HOOK_GO, ease: 'in' },
    { at: f(48), pose: HOOK_OVER, ease: 'lin' },
    { at: f(49), pose: HOOK_FLUNG, ease: 'lin' },
    { at: f(54), pose: HOOK_AFTER, ease: 'out' },
    // THE DRAG: both hands on the chain, three hauls, leaning back on braced legs
    { at: f(58), pose: K.hookHaul(30, 22, 0), ease: 'in' },
    { at: f(63), pose: K.hookHaul(0, 34, 12), ease: 'out' },
    { at: f(68), pose: K.hookHaul(32, 4, 5), ease: 'io' },
    { at: f(74), pose: K.hookHaul(0, 6, 12), ease: 'io' },
    // THE BLOW WAITING: the chain let fall, his fists up over his head, HELD; his hips go; two frames; folded; up
    { at: f(82), pose: HAMMER_UP, ease: 'io' },
    { at: f(85), pose: shake(HAMMER_UP, 0.8, true), ease: 'io' },
    { at: f(88), pose: HAMMER_HOLD, ease: 'io' },
    { at: f(90), pose: HAMMER_GO, ease: 'in' },
    { at: f(91), pose: HAMMER_OVER, ease: 'lin' },
    { at: f(92), pose: HAMMER_DOWN, ease: 'lin' },
    { at: f(99), pose: HAMMER_FOLD, ease: 'out' },
    { at: f(111), pose: {}, ease: 'io' },
  );
  return { hit: HOOK_LET, keys };
}
/** HIS FEET THROUGH THE HOOK: his weight back on his right as he aims; his left foot striding in as he flings it, his right heel up behind; his right heel down as he braces to haul; his left foot back as he brings his fists down. */
function hookFeet(): (t: number) => P {
  return footwork(CB2, {
    L: { start: L0, moves: [{ t0: f(45), t1: f(49), to: plantBy(L0, 14, 0), lift: 7 }, { t0: f(100), t1: f(109), to: L0, lift: 6 }] },
    R: { start: R0, moves: [{ t0: f(46), t1: f(49), to: { ...R0, pitch: 14 } }, { t0: f(54), t1: f(58), to: R0 }] },
  });
}

// =============================================================================================
// THE BALL: taken up, held high, drawn back, whipped down

/**
 * THE BALL'S MOMENTS (seconds).
 *   up       turned round to it, taken up and heaved to his chest as before (by 1.16 s); pressed up over his head and HELD HIGH,
 *            1.5 to 1.9 s; drawn back behind his head, arched, by 2.1 s, HELD to 2.2 s
 *   let      whipped over the top and down in two frames (2.233 to 2.3 s): it leaves his hands at BALL_LET
 *   land     it comes down BALL_REACH tiles before him at BALL_LAND, five frames later: the ring
 *   back     hauled back on its chain from 2.633 s, at his feet at BALL_BACK; dragged round behind him; long 4.483 s
 */
export const BALL_STRIKE = [f(67), f(69)] as const;
export const BALL_LET = f(69);
export const BALL_LAND = f(74);
const BALL_HAUL = f(79);
/** How much later than in the game's ball throw the hauling and what follows come (seconds). */
const BALL_LATER = BALL_HAUL - 2.26;
export const BALL_BACK = 3.26 + BALL_LATER;
export const BALL_LONG = BALL_BACK + 0.85;
export const BALL_REACH = 4.5;
export const ballOut = (t: number): boolean => t >= BALL_LET && t < BALL_BACK;
/** The ball overhead, high; drawn back behind his head; whipped over the top; down before him. */
const BALL_HIGH: P = K.onBall({ pz: -6, px: -3, yaw: -4, pitch: -6, roll: 0, twist: -2, bend: -14, side: 0, faceTurn: 0, faceUp: 30, faceTilt: 0, lk: 22, rk: -22 }, [-4, 0, 160]);
const BALL_DRAWN: P = K.onBall({ pz: -8, px: -6, yaw: -4, pitch: -12, roll: 0, twist: -2, bend: -22, side: 0, faceTurn: 0, faceUp: 34, faceTilt: 0, lk: 24, rk: -22 }, [-22, 0, 150]);
const BALL_GO: P = K.onBall({ pz: -8, px: -2, yaw: -4, pitch: -5, roll: 0, twist: -2, bend: -28, side: 0, faceTurn: 0, faceUp: 34, faceTilt: 0, lk: 24, rk: -22 }, [-20, 0, 151]);
const BALL_OVER2: P = K.onBall({ pz: -9, px: 5, yaw: -2, pitch: 8, roll: 0, twist: 0, bend: 0, side: 0, faceTurn: 0, faceUp: 12, faceTilt: 0, lk: 26, rk: -21 }, [30, 0, 140]);
const BALL_WHIP: P = K.onBall({ pz: -16, px: 12, yaw: 4, pitch: 28, roll: 0, twist: 4, bend: 38, side: 0, faceTurn: 0, faceUp: 0, faceTilt: 0, lk: 30, rk: -20 }, [52, 0, 86]);
const BALL_AFTER: P = K.coElbows({ ...BALL_WHIP, pz: -18, pitch: 34, bend: 46, rhIn: 1, rhx: 34, rhy: 4, rhz: -46, lhIn: 1, lhx: 34, lhy: -4, lhz: -46, faceUp: 2 }, [-0.5, 0.4, -0.75], [-0.5, -0.4, -0.75]);

function ballMotion(): Motion {
  const Rr = R;
  const held = (body: P, up = 0): P => K.onBall(body, K.ballBefore(body, up), true);
  const later = (k: Key3): Key3 => ({ ...k, at: k.at + BALL_LATER });
  const K0 = 3.26;
  return {
    hit: BALL_LET,
    keys: [
      // (taken up from behind him, as the game's ball throw)
      { at: 0, pose: {} },
      { at: 0.12, pose: { pz: -12, pitch: 20, bend: 30, yaw: Rr.yaw + 6, twist: 10, faceTurn: Rr.faceTurn + 70, faceUp: 10 }, ease: 'io' },
      { at: 0.21, pose: K.turnedTo({ pz: -5, pitch: 16, bend: 24, twist: 6, faceTurn: Rr.faceTurn + 40, faceUp: 4 }, K.ballTurn / 2, K.halfway), ease: 'in' },
      { at: 0.29, pose: K.turnedTo({ pz: -18, pitch: 22, bend: 36, twist: 4, faceTurn: Rr.faceTurn + 8, faceUp: -10 }, K.ballTurn), ease: 'lin' },
      { at: 0.5, pose: K.BALL_STOOP, ease: 'out' },
      { at: 0.6, pose: { ...K.BALL_STOOP, pz: -43 }, ease: 'io' },
      { at: 0.73, pose: K.onBall(K.BALL_RISE_BODY, K.ballLow(K.BALL_RISE_BODY), false, 0.45), ease: 'in' },
      { at: 0.86, pose: held(K.BALL_CHEST_BODY), ease: 'out' },
      { at: 1.0, pose: held(K.BALL_HOP_BODY), ease: 'in' },
      { at: 1.08, pose: held(K.BALL_BACK_BODY), ease: 'out' },
      { at: 1.16, pose: held({ ...K.BALL_BACK_BODY, pz: -17, pitch: 12 }), ease: 'out' },
      // PRESSED UP AND HELD HIGH, trembling; drawn back behind his head, arched, HELD
      { at: 1.3, pose: K.onBall(K.BALL_FACE_BODY, K.ballBeforeFace(K.BALL_FACE_BODY)), ease: 'in' },
      { at: f(45), pose: BALL_HIGH, ease: 'out' },
      { at: f(49), pose: shake(BALL_HIGH, -0.8, true), ease: 'io' },
      { at: f(53), pose: shake(BALL_HIGH, 0.6, true), ease: 'io' },
      { at: f(57), pose: BALL_HIGH, ease: 'io' },
      { at: f(63), pose: BALL_DRAWN, ease: 'io' },
      { at: f(66), pose: shake(BALL_DRAWN, -0.6, true), ease: 'io' },
      // his hips go; WHIPPED over the top and down in two frames; folded on down after it
      { at: f(67), pose: BALL_GO, ease: 'in' },
      { at: f(68), pose: BALL_OVER2, ease: 'lin' },
      { at: f(69), pose: BALL_WHIP, ease: 'lin' },
      { at: f(75), pose: BALL_AFTER, ease: 'out' },
      // (hauled in and dragged round behind him, as the game's ball throw, later)
      later({ at: 2.26, pose: K.ballHaul(30, 22, 0), ease: 'io' }),
      later({ at: 2.26 + 0.18, pose: K.ballHaul(0, 34, 10), ease: 'out' }),
      later({ at: 2.26 + 0.38, pose: K.ballHaul(32, 4, 5), ease: 'io' }),
      later({ at: 2.26 + 0.56, pose: K.ballHaul(0, 34, 9), ease: 'io' }),
      later({ at: 2.26 + 0.76, pose: K.ballHaul(30, 2, 5), ease: 'io' }),
      later({ at: K0 - 0.02, pose: K.ballHaul(0, 6, 10), ease: 'io' }),
      later({ at: K0 + 0.3, pose: K.coElbows({ pz: -12, px: -4, yaw: 30, pitch: 14, twist: 30, bend: 20, faceTurn: 50, faceUp: 4, lk: 26, rk: -26, rhIn: 1, rhx: -6, rhy: 30, rhz: -36, lhIn: 1, lhx: -12, lhy: 14, lhz: -40 }, [-0.5, 0.6, -0.6], [-0.4, -0.3, -0.85]), ease: 'io' }),
      later({ at: K0 + 0.55, pose: K.coElbows({ pz: -10, px: -2, yaw: 6, pitch: 18, twist: 4, bend: 28, lk: 22, rk: -22, lhIn: 1, lhx: 10, lhy: 6, lhz: -54, rhIn: 1, rhx: 10, rhy: -6, rhz: -54 }, [-0.5, 0.3, -0.8], [-0.5, -0.3, -0.8]), ease: 'io' }),
      later({ at: K0 + 0.85, pose: {}, ease: 'io' }),
    ],
  };
}
/** HIS FEET THROUGH THE BALL: as the game's ball throw (both off the floor as he wheels round to it, and back), his left foot striding in as he whips it down, his right heel up behind it and down again, his left foot back when he has dragged it round. */
function ballFeet(): (t: number) => P {
  const Lt = BALL_LET;
  const Kb = BALL_BACK;
  const piv = K.ballPivot;
  const near = K.ballNear;
  const round = (p: Plant, deg: number): Plant => {
    const a = deg * D;
    const x = p.at[0] - piv[0];
    const y = p.at[1] - piv[1];
    return { ...p, at: [near[0] + x * Math.cos(a) - y * Math.sin(a), near[1] + x * Math.sin(a) + y * Math.cos(a)], turn: p.turn + deg };
  };
  const hop = (p: Plant, high: number): FootMove[] => [
    { t0: 0.13, t1: 0.29, to: round(p, K.ballTurn), lift: high, about: piv, aboutTo: near, wide: high > 8 ? 9 : 0 },
    { t0: 0.88, t1: 1.08, to: p, lift: 5, about: near, aboutTo: piv },
  ];
  return footwork(CB2, {
    L: { start: L0, moves: [...hop(L0, 12), { t0: f(65), t1: Lt, to: plantBy(L0, 14, 0), lift: 7 }, { t0: Kb + 0.5, t1: Kb + 0.78, to: L0, lift: 6 }], knee: R.lk - R.lft },
    R: { start: R0, moves: [...hop(R0, 6), { t0: f(66), t1: Lt, to: { ...R0, pitch: 14 } }, { t0: Lt + 0.24, t1: Lt + 0.4, to: R0 }], knee: R.rk - R.rft },
  });
}
/** Where the ball is while it is his, `t` seconds in (null: out across the room, the game's to draw). */
function ballHeld(s: Skeleton, t: number): V3 | null {
  if (t < 0.5) return K.ballAt;
  if (t < BALL_LET) return lerp3(s.handL, s.handR, 0.5);
  if (t < BALL_BACK) return null;
  const k = clamp01((t - BALL_BACK) / 0.55);
  const e = k * k * (3 - 2 * k);
  const drag = K.ballDrag;
  const u = e * (drag.length - 1);
  const i = Math.min(drag.length - 2, Math.floor(u));
  return lerp3(drag[i], drag[i + 1], u - i);
}

// =============================================================================================
// THE SMEAR OF EACH STRIKE (his Movement 9): after-images of what strikes, along the way it has just come

/** Each move's strikes: from the last frame of its wind-up to the frame it lands on. */
export const CO_ACT_STRIKES: Readonly<Record<string, ReadonlyArray<readonly [number, number]>>> = {
  attack: LASH_STRIKES,
  whirl: [WHIRL_STRIKE],
  hook: [HOOK_STRIKE, HOOK_BLOW_STRIKE],
  ball: [BALL_STRIKE],
};
/** Whether a frame of a move shows a strike's smear: from the frame after its wind-up ends to the frame after it lands (thinning then). */
export function coSmeared(move: string, t: number): boolean {
  return (CO_ACT_STRIKES[move] ?? []).some((s) => t > s[0] + 1e-6 && t <= s[1] + FR + 1e-6);
}
/** The strike a frame is the smear of. */
const strikeOf = (move: string, t: number): readonly [number, number] | null => (CO_ACT_STRIKES[move] ?? []).find((s) => t > s[0] + 1e-6 && t <= s[1] + FR + 1e-6) ?? null;
/** The smear's after-images: the oldest a dull grey-violet, the newest near white, with the enemy's pink in it (his iron's and his skin's own tones, lit). */
const SMEAR = ['#6a5e80', '#b4a8c8', '#f6e8f0'] as const;
/** What a move's smear is made of at a moment of its strike `u` (its bones then, its chains then): lines of points. */
type SmearOf = (s: Skeleton, look: (name: CoRope, t: number) => ReadonlyArray<V3> | null, u: number) => V3[][];
const chainLines = (names: ReadonlyArray<CoRope>): SmearOf => (s, look, u) => {
  const out: V3[][] = [];
  for (const n of names) {
    const r = look(n, u);
    if (r) out.push(r.filter((_, i) => i >= 3 && i % 2 === 1));
  }
  return out;
};
const arms = (which: 'L' | 'R' | 'both'): SmearOf => (s) => {
  const out: V3[][] = [];
  if (which !== 'L') out.push([s.elbowR, s.handR]);
  if (which !== 'R') out.push([s.elbowL, s.handL]);
  return out;
};
const ballRing = (): SmearOf => (s) => {
  const c = lerp3(s.handL, s.handR, 0.5);
  const r = K.ballR;
  const out: V3[] = [];
  for (let i = 0; i <= 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    out.push(add(c, [Math.cos(a) * r, 0, Math.sin(a) * r]));
  }
  return [out];
};
/** A move's smear: after-images of each of `of` at moments from just before its wind-up ended to now (or its landing), as lines; keyed `smear0` (the oldest) on. */
function smearExtra(move: string, motion: Motion, feet: (t: number) => P, of: (strike: number) => SmearOf[]): (t: number, look: (name: CoRope, t: number) => ReadonlyArray<V3> | null) => Record<string, V3[]> {
  return (t, look) => {
    const s = strikeOf(move, t);
    if (!s) return {};
    const k = CO_ACT_STRIKES[move].indexOf(s);
    const to = Math.min(t, s[1]);
    const out: Record<string, V3[]> = {};
    const N = 6;
    let j = 0;
    for (let i = 0; i <= N; i++) {
      const u = s[0] - FR * 0.5 + ((to - (s[0] - FR * 0.5)) * i) / N;
      const sk = solve(CB2, { ...bonesAt(motion.keys, R, u), ...feet(u) } as Posed);
      for (const o of of(k)) for (const line of o(sk, look, u)) if (line.length > 1) out[`smear${String(j++).padStart(3, '0')}:${i}`] = line;
    }
    return out;
  };
}
/** The smear's lines as a frame has them (`ropes`, by the age of each: 0 the oldest, `N` the newest). */
function smearLines(r: Ropes): { line: ReadonlyArray<V3>; age: number }[] {
  const out: { line: ReadonlyArray<V3>; age: number }[] = [];
  for (const [k, v] of Object.entries(r)) {
    if (!k.startsWith('smear')) continue;
    out.push({ line: v, age: Number(k.split(':')[1]) / 6 });
  }
  return out;
}
/** THE SMEAR, painted: pale motes along each after-image, the oldest thinned to every other one. */
function smearBits(m: Moment): Bit[] {
  const bits: Bit[] = [];
  if (!m.ropes) return bits;
  for (const { line, age } of smearLines(m.ropes)) {
    if (age >= 0.999) continue;
    for (let i = 1; i < line.length; i++) {
      const a = line[i - 1];
      const b = line[i];
      const n = Math.max(1, Math.ceil(Math.hypot(b[0] - a[0], b[1] - a[1], b[2] - a[2]) / 2.2));
      for (let e = 0; e < n; e++) {
        if (age < 0.5 && (e + i) % 2) continue;
        const p = lerp3(a, b, e / n);
        bits.push({ part: 'smear', piece: 'smear', shape: { k: 'mote', p: [p[0], p[1], Math.max(0.8, p[2])], c: age > 0.7 ? SMEAR[2] : age > 0.35 ? SMEAR[1] : SMEAR[0], size: age > 0.6 ? 2 : 1 } });
      }
    }
  }
  return bits;
}

// =============================================================================================
// HIM, AS FREE AS HE IS, WITH THESE MOVES

/** A rope set moved along the floor (his chains as his stand has them, where his steps have taken him). */
const movedRopes = (r: Ropes, dx: number): Ropes => Object.fromEntries(Object.entries(r).map(([k, v]) => [k, v.map((p) => [p[0] + dx, p[1], p[2]] as V3)]));
/** Sparks and dust where his chains slam the stone: the points of them lying on the floor a moment after the blow. */
function slamsAt(look: (name: CoRope, t: number) => ReadonlyArray<V3> | null, names: ReadonlyArray<CoRope>, hit: number, t: number, seed: number, strong = 1): Record<string, V3[]> {
  const since = t - hit;
  if (since < 0 || since > 0.6) return {};
  const at: V3[] = [];
  for (const n of names) {
    const r = look(n, hit + 2 * FR);
    if (r) at.push(...r.filter((q, i) => i > 3 && q[2] < 4));
  }
  return K.slamBurst(at, since, seed, strong);
}
const merge = (...rs: Record<string, V3[]>[]): Record<string, V3[]> => {
  const out: Record<string, V3[]> = {};
  for (const r of rs) for (const [k, v] of Object.entries(r)) out[k] = [...(out[k] ?? []), ...v];
  return out;
};

/**
 * THE SPIN'S STRETCH THE GAME PLAYS ROUND AND ROUND (WHIRL_LOOP), CLOSED ON ITSELF: his chains fly as chains do, never twice the
 * same, so where the stretch comes round again they would leap. So over the second half of the stretch they are drawn, little by
 * little, to how they were a stretch before (two turns: his body and his hands just as they are now), and are so at its end; and
 * after it, over as long again, back to how they are. Played straight through or round and round, nothing leaps.
 */
function closedSpin(raw: (t: number) => Ropes): (t: number) => Ropes {
  const A = WHIRL_LOOP.at;
  const S = WHIRL_LOOP.span;
  const h = S / 2;
  const out = Math.min(h, SPIN_SLOW - (A + S));
  return (t) => {
    const w = t > A + h && t < A + S ? smooth((t - (A + h)) / h) : t >= A + S && t < A + S + out ? 1 - smooth((t - (A + S)) / out) : 0;
    if (w <= 1e-6) return raw(t);
    const a = raw(t);
    const b = raw(t - S);
    const r: Record<string, ReadonlyArray<V3>> = { ...a };
    for (const [k, v] of Object.entries(a)) {
      const u = b[k];
      if (u && u.length === v.length) r[k] = v.map((p, i) => lerp3(p, u[i], w));
    }
    return r;
  };
}

const MADE: Partial<Record<CoFreed, Mob>> = {};
/** THE CHAINED ONE, as free as he is, with his moves done the action way: his stand, his walk, struck, his death and his chains breaking the game's own (the same moves, every frame as they are); his lash, his whirl, his hook and his ball these. Made the first time it is asked for. */
export function chainedActionMob(freed: CoFreed): Mob {
  const made = MADE[freed];
  if (made) return made;
  const base = freed === 0 ? CHAINED : CHAINED_FREED[freed];
  const names = K.ropesOf(freed);
  const standAt0 = (): Ropes => base.stand.ropes!(0);
  const mv = (name: string, motion: Motion, plan: CoChainPlan, more: Partial<MobMove>): MobMove => K.coMove(name, motion, { start: standAt0, end: standAt0, ...plan }, more, names);
  const wrists = names.filter((n) => n !== 'ball');

  // THE LASH
  const lash = lashMotion();
  const lFeet = lashFeet();
  const lSmear = smearExtra('attack', lash, lFeet, (k) => (k < 2 ? [chainLines(['R']), arms('R')] : [chainLines(wrists), arms('both')]));
  const lashBall = (t: number): number => {
    // (the ball dragged after him over the floor as he steps in, a little behind him)
    const px = bonesAt(lash.keys, R, Math.max(0, t - 0.2)).px - R.px;
    return Math.max(0, Math.min(LASH_TRAVEL, px));
  };
  const attack = mv('The Chained One lashes, lashes and slams', lash, {
    hold: (name, s, t) => (name === 'ball' ? { from: collarRingAt(s), held: [[K.spec.ball.n, add(K.ballAt, [t >= LASH_LONG - 0.25 ? LASH_TRAVEL : lashBall(t), 0, 0])]] } : undefined),
    end: () => movedRopes(standAt0(), LASH_TRAVEL),
    extra: (t, look) => merge(lSmear(t, look), slamsAt(look, ['R'], LASH_HITS[0], t, 61), slamsAt(look, ['R'], LASH_HITS[1], t, 62), slamsAt(look, wrists, LASH_HITS[2], t, 63, 1.3)),
  }, { glint: glints([f(9), f(18), LASH_HITS[0]], [f(38), f(46), LASH_HITS[1]], [f(60), f(76), LASH_HITS[2]]), feet: lFeet });

  // THE WHIRL
  const whirl = whirlMotion();
  const wFeet = whirlFeet(whirl);
  const wSmear = smearExtra('whirl', whirl, wFeet, () => [chainLines(wrists), arms('both')]);
  const whirlRaw = mv('The chain whirl, and the slam', whirl, {
    hold: (name, s, t) => {
      if (name !== 'ball') return undefined;
      // (the ball dragged round after him on the floor as he spins, a little behind his turning)
      const turned = bonesAt(whirl.keys, R, Math.max(0, t - 0.18)).yaw - R.yaw;
      return { from: collarRingAt(s), held: [[K.spec.ball.n, [...about([K.ballAt[0], K.ballAt[1], 0], [0, 0, 1], turned).slice(0, 2), K.ballR] as unknown as V3]] };
    },
    extra: (t, look) => {
      const out: Record<string, V3[]> = {};
      // (a streak of fire behind the ends of his chains as they whirl round)
      if (t >= WHIRL_SPIN + 0.05 && t <= WHIRL_STILL + 0.05) {
        for (const side of wrists) {
          const pts: V3[] = [];
          for (let k = 0; k < 12; k++) {
            const r = look(side, t - k * 0.01);
            if (r) pts.push(r[r.length - 1]);
          }
          if (pts.length > 1) out[`trail${side}`] = pts;
        }
      }
      return merge(out, wSmear(t, look), slamsAt(look, wrists, WHIRL_HIT, t, 64, 1.3));
    },
  }, { glint: glints([f(9), f(20), WHIRL_SPIN + 0.1], [WHIRL_STILL - 0.2, WHIRL_STILL, WHIRL_HIT]), feet: wFeet });
  const whirlMv: MobMove = { ...whirlRaw, ropes: closedSpin(whirlRaw.ropes!) };

  // THE HOOK
  const hook = hookMotion();
  const hFeet = hookFeet();
  const hSmear = smearExtra('hook', hook, hFeet, (k) => (k === 0 ? [chainLines(['R']), arms('R')] : [chainLines(wrists), arms('both')]));
  const hookMv = mv('Hook, drag and the blow', hook, {
    hold: (name, _s, t) => (name === 'R' && hookOut(t) ? 'out' : undefined),
    back: (name, s1) => (name === 'R' ? K.hookBack(s1) : K.restChains(s1)[name]),
    extra: (t, look) => merge(hSmear(t, look), slamsAt(look, wrists, HOOK_BLOW, t, 65)),
  }, { glint: glints([f(9), f(33), HOOK_LET], [f(77), f(85), HOOK_BLOW]), feet: hFeet });

  const more: Record<string, MobMove> = { ...base.more!, whirl: whirlMv, hook: hookMv };
  if (freed < 2) {
    const ball = ballMotion();
    const bFeet = ballFeet();
    const bSmear = smearExtra('ball', ball, bFeet, () => [ballRing(), arms('both')]);
    more.ball = mv('The ball held high and whipped down', ball, {
      hold: (name, s, t) => {
        if (name !== 'ball') return undefined;
        if (ballOut(t)) return 'out';
        const b = ballHeld(s, t);
        const haul = t >= BALL_BACK - 0.02 && t < BALL_BACK + 0.32;
        const held: (readonly [number, V3])[] = [[K.spec.ball.n, b ?? K.ballAt]];
        if (haul) held.push([14, lerp3(s.handL, s.handR, 0.5)]);
        return { from: collarRingAt(s), held };
      },
      back: (name, s1) => (name === 'ball' ? [collarRingAt(s1), lerp3(s1.handL, s1.handR, 0.5), K.ballDrag[0]] : K.restChains(s1)[name]),
      air: 0.997,
      extra: (t, look) => bSmear(t, look),
    }, { glint: glints([1.0, 1.5, BALL_LET]), feet: bFeet });
  }
  const mob: Mob = {
    ...base,
    id: `${base.id}+action`,
    attack,
    hit: LASH_HITS[0],
    more,
    bits: (st: Stage, m: Moment) => [...base.bits(st, m), ...smearBits(m)],
  };
  MADE[freed] = mob;
  return mob;
}

/** THE CHAINED ONE WITH THESE MOVES, as the game holds a monster: as free as he is. */
export function makeChainedActionArt(pace = CHAINED.pace, freed: CoFreed = 0): ActorArt {
  const mob = chainedActionMob(freed);
  return { front: mobSet(mob, 'front', pace), back: mobSet(mob, 'back', pace) };
}

/**
 * HIM AS THE CHECKS SEE HIM (art/boss_checks.ts), with these moves: his solids and his chains as the game's (art/bosses3.ts
 * coShape); the end he strikes with (his right fist in the lash's first two blows and the hook's fling; both fists, between
 * them, in the finishers and the ball); each move's blows (a combo's, each its own: its strike, its drawing back, its held
 * warning, its follow-through), smeared; and where his moves hand over: from his stand into each and back, the lash ending where
 * his steps have taken him (`shift`), the whirl's stretch the game plays round and round closing on itself.
 */
export function coActionShape(mob: Mob): BossShape {
  const own = coShape(mob);
  const both = (s: Skeleton): V3 => lerp3(s.handL, s.handR, 0.5);
  const blows: Record<string, { hit: number; strike: readonly [number, number]; from: number; until?: number }[]> = {
    attack: [
      { hit: LASH_HITS[0], strike: LASH_STRIKES[0], from: 0, until: f(32) },
      { hit: LASH_HITS[1], strike: LASH_STRIKES[1], from: f(32), until: f(58) },
      { hit: LASH_HITS[2], strike: LASH_STRIKES[2], from: f(58) },
    ],
    whirl: [{ hit: WHIRL_HIT, strike: WHIRL_STRIKE, from: WHIRL_SPIN }],
    hook: [
      { hit: HOOK_LET, strike: HOOK_STRIKE, from: 0, until: f(55) },
      { hit: HOOK_BLOW, strike: HOOK_BLOW_STRIKE, from: HOOK_BACK },
    ],
  };
  if (mob.more?.ball) blows.ball = [{ hit: BALL_LET, strike: BALL_STRIKE, from: 1.16 }];
  const handovers: Handover[] = [
    ...(own.handovers ?? []).filter((h) => !(h.from === 'attack' && h.at === 'end')),
    { from: 'attack', at: 'end', to: 'stand', toAt: 0, shift: [LASH_TRAVEL, 0] },
    { from: 'whirl', at: WHIRL_LOOP.at + WHIRL_LOOP.span, to: 'whirl', toAt: WHIRL_LOOP.at },
  ];
  return {
    ...own,
    thingsOf: (other) => coActionShape(other).things,
    tip: (move, t, s, q) => {
      if (move === 'attack') return s.handR;
      if (move === 'whirl') return t >= SPIN_SLOW ? both(s) : null;
      if (move === 'hook') return s.handR;
      if (move === 'ball') return t >= 1.16 && t < BALL_BACK ? both(s) : null;
      return own.tip?.(move, t, s, q) ?? null;
    },
    blows,
    smeared: coSmeared,
    handovers,
  };
}

// =============================================================================================
// FOR THE GAME: where what he flings is, and the numbers of his moves

const tilesOf = (p: V3): [number, number, number] => [p[0] / TILE3, p[1] / TILE3, p[2] / 2];
/**
 * HIS HOOK OUT ACROSS THE ROOM, `t` seconds into it (while `hookOut`), flung `reach` tiles: where it is (tiles before him, to his
 * left, its height in the game's pixels) and whether it is flying. From where it leaves his hand it flies out low and lightning
 * fast, to bite at `reach` at HOOK_BITE (what it catches there is the rules'); then it is hauled back, a jerk with each of his
 * three pulls, along the floor to where it falls at his feet.
 */
export function actHookPath(t: number, reach = 4.5): { at: [number, number, number]; flying: boolean } | null {
  if (!hookOut(t)) return null;
  const from = tilesOf(cuffAt(skeletonAt(chainedActionMob(0), 'hook', HOOK_LET), 'R'));
  const to: [number, number, number] = [reach, from[1] * 0.3, 1];
  if (t < HOOK_BITE) {
    const k = (t - HOOK_LET) / (HOOK_BITE - HOOK_LET);
    return { at: [from[0] + (to[0] - from[0]) * k, from[1] + (to[1] - from[1]) * k, from[2] + (to[2] - from[2]) * k + 6 * Math.sin(Math.PI * k)], flying: true };
  }
  const back = tilesOf(K.hookBack(skeletonAt(chainedActionMob(0), 'hook', HOOK_BACK)).slice(-1)[0]);
  const k = hauledBy(t, HOOK_PULLS);
  return { at: [to[0] + (back[0] - to[0]) * k, to[1] + (back[1] - to[1]) * k, 1], flying: false };
}
/** How far along its way back a thing he hauls in is: a jerk with each pull. */
function hauledBy(t: number, pulls: ReadonlyArray<readonly [number, number]>): number {
  let done = 0;
  for (const [a, b] of pulls) {
    if (t >= b) done += 1;
    else if (t > a) done += smooth((t - a) / (b - a));
  }
  return done / pulls.length;
}
const BALL_PULLS: ReadonlyArray<readonly [number, number]> = [[BALL_HAUL, BALL_HAUL + 0.18], [BALL_HAUL + 0.38, BALL_HAUL + 0.56], [BALL_HAUL + 0.56, BALL_HAUL + 0.76], [BALL_HAUL + 0.76, BALL_BACK - 0.02]];
/**
 * HIS BALL OUT ACROSS THE ROOM, `t` seconds into it (while `ballOut`): where it is and whether it is flying. Whipped down from
 * over his head, it flies out fast and low, dropping, to crash down BALL_REACH tiles before him at BALL_LAND (the ring); it lies
 * there; then it is hauled back, a jerk with each pull, along the floor to before him.
 */
export function actBallPath(t: number, reach = BALL_REACH): { at: [number, number, number]; flying: boolean } | null {
  if (!ballOut(t)) return null;
  const s = skeletonAt(chainedActionMob(0), 'ball', BALL_LET);
  const from = tilesOf(lerp3(s.handL, s.handR, 0.5));
  const to: [number, number, number] = [reach, 0, K.ballR / 2];
  if (t < BALL_LAND) {
    const k = (t - BALL_LET) / (BALL_LAND - BALL_LET);
    // (thrown down: it drops faster as it goes)
    return { at: [from[0] + (to[0] - from[0]) * k, from[1] + (to[1] - from[1]) * k, from[2] + (to[2] - from[2]) * (0.4 * k + 0.6 * k * k) + 8 * Math.sin(Math.PI * k)], flying: true };
  }
  const back = tilesOf(K.ballDrag[0]);
  const k = hauledBy(t, BALL_PULLS);
  return { at: [to[0] + (back[0] - to[0]) * k, to[1] + (back[1] - to[1]) * k, K.ballR / 2], flying: false };
}
/**
 * HOW FAR EACH OF THE LASH'S BLOWS STRIKES (tiles before where he stood as it began): the furthest any link of his chains goes
 * below a man's waist (20 game pixels) in the third of a second from its blow. (The finisher's crack runs on further: CRACK.)
 */
export function LASH_REACH(mob: Mob): [number, number, number] {
  const out: [number, number, number] = [0, 0, 0];
  LASH_HITS.forEach((h, i) => {
    for (let t = h; t <= h + 0.3 + 1e-9; t += 1 / 60) {
      const r = mob.attack.ropes!(t);
      for (const n of ['L', 'R'] as const) for (const q of r[n] ?? []) if (q[2] < 40) out[i] = Math.max(out[i], Math.hypot(q[0], q[1]) / TILE3);
    }
  });
  return out;
}
/** Where a chain's end is at a moment of a move (tiles before him, to his left; how high, in game pixels): where it strikes. */
export function chainEndAt(mob: Mob, move: string, name: CoRope, t: number): [number, number, number] | null {
  const m = move === 'attack' ? mob.attack : mob.more?.[move];
  const r = m?.ropes?.(t)[name];
  return r ? tilesOf(r[r.length - 1]) : null;
}
/** (FOR THE GAME: the main chat's, as it brought these moves in) Where his right cuff is at a moment of one of these moves (his hook's chain runs out from it), in his own space (render/bossfx.ts takes it as coCuffAt). */
export const actCuffAt = (move: string, t: number): V3 => cuffAt(skeletonAt(chainedActionMob(0), move, t), 'R');
/** (FOR THE GAME) Where the ring of his collar is at a moment of one of these moves (the ball's chain runs out from it), in his own space. */
export const actCollarAt = (move: string, t: number): V3 => collarRingAt(skeletonAt(chainedActionMob(0), move, t));
void sub;
void norm;
void mul;
void SIM_KEEP;
