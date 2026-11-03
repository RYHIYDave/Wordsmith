// THE FLESHMANCER'S MOVES DONE THE ACTION WAY (the art chat's helper, 1 Nov 2026; docs/mockups/action_f5_fleshmancer/README.md).
// A MOCK-UP: NOTHING OF THE GAME IMPORTS THIS FILE. All of it is behind one switch, FLESH_ACTION, off: with it off the game's
// Fleshmancer, his ring's hands and the mini fleshmancer are every frame as they were (art/fleshmancer.ts and art/cultists.ts: their
// moves there are kept as they are; his painter may now be told the moments another's moves spit and slam, `FmLook.timing`).
//
// The owner's words: 31 Oct 2026, in his review of every enemy for more action, the Fleshmancer offered as "Keep: rings of hands,
// fire sweeping round him, teleports: already fills his lair"; his art rulebook's Monsters 9, Action, like a movie (his yes, 1 Nov);
// and of the last two bosses' first passes, “He needs some work.  I think the action really needs to be applied to his moves” and
// “add the action to all his moves cause he is not intimidating at all”, and of a plain blow, “pretty lackluster”, “The rakes are
// lackluster”. Under his Movement 9 (24 Oct, “Like the wind up and wind down are big but the actual punch is lightning quick”) and
// his rule for the enemies (28 Oct, “Start from now on, but every enemy is going to need that change eventually.  And bigger AOE
// to compensate for the extra time the player gets to evade”).
//
// So his kit is kept, every move redone the action way: a big wind-up HELD (the warning), the blow in TWO FRAMES smeared with
// after-images, a big wind-down; and what he sends out bigger, faster, filling his lair (art/fleshmancer_action_fx.ts):
//   THE SHARDS (`attack`), a combo: he rears up, the staff hauled back over his shoulder, and the bone is dragged up out of the
//     floor before him into A FAN OF SHARDS HANGING IN THE AIR, aimed, pink-lit, trembling: HELD; the staff hammered over and down
//     in two frames and the fan flies; then the staff hauled back again, A SECOND FAN drawn up in the first one's gaps, held, and
//     hammered: the finisher.
//   THE RINGS OF HANDS (`rings`): he rises, both arms up, and the floor's cracks light pink in the rings' shapes, their gaps dark:
//     HELD; the staff driven down in two frames, and the hands burst up out of every other ring at once; his claw raised again,
//     held, slammed: the rings between burst up. Five rings, out to his lair's walls.
//   THE FIRE SWEEP (`fire`): reared back, the staff hauled back over his head, the fire gathering in the skull's jaws: HELD; thrown
//     forward in two frames and the stream bursts out, WHIPPING ROUND HIM once and more in 1.2 seconds, wider and longer than
//     before, and the floor left burning in lanes where it gouted.
//   RAISE THE DEAD (`raise`): bowed, then both arms flung up, the bone heaps of his lair shaking and lit from under: HELD; both
//     flung down at them in two frames, and the dead BURST up out of the heaps, bone and grave dirt thrown.
//   THE TELEPORT (`sink`, `rise`): seized by his dead and YANKED down into a pit of his dead in two frames; where he will rise is
//     marked on the floor first, a ring of his fire; he ERUPTS up out of it in two frames, a burst round him that hurts all round.
//   THE MINI FLESHMANCER'S FIRE (`miniActionMob`): the same way, smaller: claws cocked, held, thrust, the fire whipped across.
// His stand, his glide, setting off and stopping, struck and his death are the game's own (the very same moves).

import type { ActorArt } from './actor_types';
import { FLESHMANCER, FM_ATTACKS, FM_CANVAS, FM_LOOK, FM_REST, FM_RISING, FM_SHAPE, FM_SHAPE_UNDER, FM_SINKING, clamp01, fleshmancerBits, rampAt, sampled, shiver, staffOf, swungStaff, unwrapped, withFmLook } from './fleshmancer';
import type { FmLook } from './fleshmancer';
import { MINI_FM, MINI_FM_LOOK, MINI_REST } from './cultists';
import type { BossShape } from './boss_checks';
import { TILE3, mobSet, skeletonAt } from './new_mobs3';
import type { Bit, Mob, MobCanvas, MobMove, Moment, Ropes } from './new_mobs3';
import { add, lerp3, len, mul, norm, sub } from './skeleton';
import type { Bones, Motion, Skeleton, V3 } from './skeleton';
import { FLAME } from './mkit';

const FR = 1 / 30;
/** A moment on the game's frames: frame `n`, at 30 a second. */
export const f = (n: number): number => n / 30;

/** THE SWITCH, OFF. With it on, the game's Fleshmancer is `makeFleshmancerActionArt` and the mini fleshmancer `makeMiniActionArt` (the bestiary's to choose). */
export const FLESH_ACTION = { on: false };

// =============================================================================================
// A MOVE MADE OF BEATS: poses at moments, each reached by its own ease (so that what is held is held, and a blow is a flash)

type Field = keyof Bones | 'phi' | 'lean';
type Pose = Partial<Record<Field, number>>;
type Ease = 'io' | 'lin' | 'out';
/** A beat: the moment, the pose (what it does not say is as it was), and how it is reached from the beat before. */
type Beat = readonly [number, Pose, Ease?];
const EASE: Record<Ease, (u: number) => number> = {
  io: (u) => u * u * (3 - 2 * u),
  lin: (u) => u,
  // (thrown on from a blow, slowing: the follow-through)
  out: (u) => 1 - (1 - u) ** 2.4,
};
const FIELDS: readonly Field[] = ['pz', 'px', 'py', 'yaw', 'pitch', 'roll', 'bend', 'twist', 'side', 'faceUp', 'faceTurn', 'faceTilt', 'rhx', 'rhy', 'rhz', 're', 'lhx', 'lhy', 'lhz', 'le', 'draw', 'pAz', 'pt', 'gale', 'out', 'phi', 'lean'];
/** A track of one field through the beats. */
function trackOf(beats: ReadonlyArray<Beat>, field: Field, rest: Pose): (t: number) => number {
  const pts: [number, number, Ease][] = [];
  let v = rest[field] as number;
  for (const [t, pose, e] of beats) {
    if (pose[field] !== undefined) v = pose[field] as number;
    pts.push([t, v, e ?? 'io']);
  }
  return (t) => {
    if (t <= pts[0][0]) return pts[0][1];
    for (let i = 1; i < pts.length; i++) {
      const [t1, v1, e] = pts[i];
      if (t <= t1) {
        const [t0, v0] = pts[i - 1];
        return v0 + (v1 - v0) * EASE[e](clamp01((t - t0) / Math.max(1e-9, t1 - t0)));
      }
    }
    return pts[pts.length - 1][1];
  };
}
/** HIS REST, as beats know it: his pose at rest and his staff upright at his side. */
const REST_POSE: Pose = { ...(FM_REST as unknown as Pose), phi: 90, lean: -0.156 };
/** A move from beats (`rest` first and last), with what is added over them (a tremble, a heave after the fire), and what is fixed (which of his attacks it is). */
function beatMove(long: number, beats: ReadonlyArray<Beat>, more: Partial<Record<Field, (t: number) => number>>, fixed: Partial<Bones>, rest: Pose = REST_POSE, staff = true, ends: { start?: Pose; end?: Pose } = {}): Motion {
  const tr: Partial<Record<Field, (t: number) => number>> = {};
  const start: Pose = { ...rest, ...ends.start };
  const end: Pose = { ...rest, ...ends.end };
  for (const k of FIELDS) {
    const base = trackOf([[0, start], ...beats, [long, end]], k, start);
    const add2 = more[k];
    tr[k] = add2 ? (t) => base(t) + add2(t) : base;
  }
  const fields: Partial<Record<keyof Bones, (t: number) => number>> = {};
  for (const k of FIELDS) if (k !== 'phi' && k !== 'lean') fields[k] = tr[k] as (t: number) => number;
  if (staff) {
    fields.wAz = (t) => swungStaff((tr.phi as (t: number) => number)(t), (tr.lean as (t: number) => number)(t)).wAz;
    fields.wEl = (t) => swungStaff((tr.phi as (t: number) => number)(t), (tr.lean as (t: number) => number)(t)).wEl;
  }
  return { keys: staff ? unwrapped(sampled(long, fields, fixed)) : sampled(long, fields, fixed) };
}
/** Held, trembling: 1 from `a` to `b` (eased in and out over two frames), 0 else. */
const heldIn = (a: number, b: number) => (t: number): number => rampAt(t, a, a + 2 * FR) * (1 - rampAt(t, b - 2 * FR, b));
const R = REST_POSE as Required<Pose>;

// =============================================================================================
// THE SHARDS, A COMBO: two fans, the second in the first one's gaps

/** Its strikes (the last frame of the wind-up to the frame it lands on) and its blows (the fans fly). */
export const SHARD_STRIKES = [[f(24), f(26)], [f(50), f(52)]] as const;
export const SHARD_HITS = [f(26), f(52)] as const;
export const SHARD_LONG = f(80);
/** When each fan is drawn up out of the floor, and hangs (from, to: seconds into the move); it flies at its hit. */
export const SHARD_DRAW = [[f(3), f(14)], [f(34), f(44)]] as const;
/** Cocked: risen, reared back and turned away, the staff hauled back over his right shoulder, his claw thrust out and up at you. */
const COCKED = (k: number): Pose => ({
  pz: R.pz + 7 * k, px: -2.5, yaw: R.yaw - 16 * k, pitch: R.pitch - 8 * k, bend: R.bend - 13 * k, twist: R.twist - 20 * k, faceUp: R.faceUp + 10, faceTurn: R.faceTurn + 6,
  rhx: R.rhx - 5.5, rhy: R.rhy + 2.5, rhz: R.rhz + 21, re: 62, phi: 26, lean: 0.2,
  lhx: 14, lhy: 7.5, lhz: 7, le: 20, draw: 0.08, pAz: 1.8, pt: 0.9, gale: 0.3,
});
/** Hammered: the staff over and down until the skull points at you, his body thrown into it. */
const HAMMERED: Pose = {
  pz: R.pz - 1.5, px: 2.8, yaw: R.yaw + 10, pitch: R.pitch + 5, bend: R.bend + 11, twist: R.twist + 10, faceUp: R.faceUp - 6, faceTurn: R.faceTurn - 2,
  rhx: R.rhx + 8, rhy: R.rhy + 2, rhz: R.rhz + 6, re: 40, phi: 178,
  lhx: 9, lhy: 10, lhz: 3, le: 34, draw: 0.3, pAz: 1.2, pt: 1, gale: 1,
};
/** Carried on past it, the skull dipping. */
const DIPPED: Pose = { pz: R.pz - 2.6, px: 3.8, yaw: R.yaw + 13, pitch: R.pitch + 7, bend: R.bend + 14, twist: R.twist + 15, faceUp: R.faceUp - 3, rhx: R.rhx + 10, rhz: R.rhz + 3, phi: 198, re: 38, lhx: 3, lhy: 13.5, lhz: 0, le: 46, gale: 0.8 };
function shardsMotion(): Motion {
  const [[a0, a1], [b0, b1]] = SHARD_STRIKES;
  const held = (t: number): number => heldIn(f(14), a0)(t) + heldIn(f(44), b0)(t);
  const m = beatMove(SHARD_LONG, [
    [f(14), COCKED(1)],
    [a0, COCKED(1), 'lin'],
    [a1, HAMMERED, 'lin'],
    [f(34), DIPPED, 'out'],
    [f(44), COCKED(0.9)],
    [b0, COCKED(0.9), 'lin'],
    [b1, HAMMERED, 'lin'],
    [f(60), DIPPED, 'out'],
  ], {
    pz: (t) => shiver(t, 0.3, 1) * held(t),
    rhz: (t) => shiver(t, 0.25, 2) * held(t),
    lhz: (t) => shiver(t, 0.3, 3) * held(t),
  }, { prop: FM_ATTACKS.shards, pEl: 0 });
  return { ...m, hit: SHARD_HITS[0] };
}

// =============================================================================================
// THE RINGS OF HANDS: two slams, every other ring at each

export const RING_STRIKES = [[f(34), f(36)], [f(58), f(60)]] as const;
export const RING_HITS = [f(36), f(60)] as const;
export const RING_LONG = f(92);
function ringsMotion(): Motion {
  const [[a0, a1], [b0, b1]] = RING_STRIKES;
  const held = (t: number): number => heldIn(f(16), a0)(t) + heldIn(f(52), b0)(t);
  const UP: Pose = { pz: R.pz + 12, px: -1.8, yaw: R.yaw - 7, pitch: R.pitch - 7, bend: R.bend - 10, twist: R.twist - 5, faceUp: R.faceUp + 15, rhx: R.rhx + 2, rhy: R.rhy + 1.5, rhz: R.rhz + 25, re: 70, phi: 96, lean: 0.12, lhx: 5.5, lhy: 11, lhz: 23, le: 80, draw: 0.05, pAz: 2, pt: 0.85, gale: 0.2 };
  const SLAM: Pose = { pz: R.pz - 3.5, px: 2.4, yaw: R.yaw + 3, pitch: R.pitch + 8, bend: R.bend + 14, twist: R.twist + 4, faceUp: R.faceUp - 9, rhx: R.rhx + 5, rhy: R.rhy + 1, rhz: R.rhz - 5, re: 34, phi: 94, lhx: 12, lhy: 9, lhz: -12, le: 18, draw: 0.15, pAz: 1.4, pt: 1, gale: 1 };
  const PRESS: Pose = { pz: R.pz - 6, pitch: R.pitch + 10, bend: R.bend + 18, lhz: -19, lhx: 13, rhz: R.rhz - 6.5, gale: 0.7 };
  const LIFT: Pose = { pz: R.pz + 4, pitch: R.pitch - 3, bend: R.bend + 1, faceUp: R.faceUp + 10, lhx: 6, lhy: 11, lhz: 19, le: 76, draw: 0.05, pAz: 2, pt: 0.9, gale: 0.3 };
  const SLAM2: Pose = { pz: R.pz - 4, pitch: R.pitch + 10, bend: R.bend + 16, faceUp: R.faceUp - 9, lhx: 13, lhy: 9, lhz: -13, le: 16, draw: 0.15, pt: 1, gale: 1 };
  const PRESS2: Pose = { pz: R.pz - 6, bend: R.bend + 19, lhz: -19, lhx: 13.5, gale: 0.7 };
  const m = beatMove(RING_LONG, [
    // (his staff leant out clear of his arm first, then hauled up)
    [f(6), { lean: 0.12, phi: 100 }],
    [f(16), UP],
    [a0, UP, 'lin'],
    [a1, SLAM, 'lin'],
    [f(42), PRESS, 'out'],
    [f(52), LIFT],
    [b0, LIFT, 'lin'],
    [b1, SLAM2, 'lin'],
    [f(66), PRESS2, 'out'],
  ], {
    pz: (t) => shiver(t, 0.35, 2) * held(t),
    rhz: (t) => shiver(t, 0.3, 3) * held(t),
    lhz: (t) => shiver(t, 0.35, 4) * held(t),
  }, { prop: FM_ATTACKS.rings, pEl: 0 });
  return { ...m, hit: RING_HITS[0] };
}

// =============================================================================================
// THE FIRE SWEEP: held, burst, whipped round

export const FIRE_STRIKE = [f(30), f(32)] as const;
export const FIRE_HIT = f(32);
/** When it stops pouring; the move's whole length. */
export const FIRE_STOP = f(68);
export const FIRE_LONG = f(102);
/** THE WHIP: where it starts (radians to his left of the way he faces: off to his right), how far round it goes (a turn and more), thrown round fastest at first and slowing. */
export const WHIP = { from: -0.75, round: (385 * Math.PI) / 180, ease: 1.45 } as const;
/** Which way the stream pours `t` seconds into his fire (radians to his left of his face), or null while it does not. */
export function fireWay(t: number): number | null {
  if (t < FIRE_HIT - 1e-6 || t > FIRE_STOP + 1e-6) return null;
  const k = clamp01((t - FIRE_HIT) / (FIRE_STOP - FIRE_HIT));
  return WHIP.from + WHIP.round * (1 - (1 - k) ** WHIP.ease);
}
function fireMotion(): Motion {
  const [a0, a1] = FIRE_STRIKE;
  const S = FIRE_STOP;
  const held = heldIn(f(14), a0);
  const pouring = (t: number): number => rampAt(t, a1, a1 + 6 * FR) * (1 - rampAt(t, S - 6 * FR, S));
  const turn = (t: number): number => fireWay(Math.min(S, Math.max(a1, t))) ?? WHIP.from;
  const REAR: Pose = { pz: R.pz + 9, px: -1.6, pitch: R.pitch - 8, bend: R.bend - 11, faceUp: R.faceUp + 14, rhx: R.rhx + 1, rhy: R.rhy - 1.5, rhz: R.rhz + 26, re: 74, phi: 58, lean: 0.2, lhx: 9, lhy: 10, lhz: 10, le: 40, draw: 0.85, pAz: 2, pt: 0.9, gale: 0.25 };
  const BURST: Pose = { pz: R.pz + 6, px: 1.6, pitch: R.pitch + 6, bend: R.bend + 8, faceUp: R.faceUp + 1, rhx: R.rhx + 3, rhz: R.rhz + 24, re: 72, phi: 118, lhx: 13, lhy: 9, lhz: 5, le: 28, draw: 0.1, pAz: 1.6, pt: 1, gale: 1 };
  const POUR: Pose = { pz: R.pz + 7, px: 0.6, pitch: R.pitch - 2, bend: R.bend - 3, faceUp: R.faceUp + 2, phi: 104, lhx: 12, lhz: 6, le: 30, gale: 0.7 };
  const m = beatMove(FIRE_LONG, [
    [f(14), REAR],
    [a0, REAR, 'lin'],
    [a1, BURST, 'lin'],
    [f(40), POUR, 'out'],
    [S, POUR],
  ], {
    pz: (t) => shiver(t, 0.35, 5) * held(t) + 1.0 * Math.sin(t * 11) * pouring(t),
    rhz: (t) => shiver(t, 0.3, 6) * held(t),
    px: (t) => 1.6 * Math.cos(turn(t)) * pouring(t),
    py: (t) => 1.6 * Math.sin(turn(t)) * pouring(t),
    pitch: (t) => 3 * Math.cos(turn(t)) * pouring(t),
    roll: (t) => -3 * Math.sin(turn(t)) * pouring(t),
    bend: (t) => 3.5 * Math.cos(turn(t)) * pouring(t),
    twist: (t) => 14 * Math.sin(turn(t)) * pouring(t),
    side: (t) => -3.5 * Math.sin(turn(t)) * pouring(t),
    faceTurn: (t) => 24 * Math.sin(turn(t)) * pouring(t),
    lhx: (t) => 3 * Math.cos(turn(t)) * pouring(t),
    lhy: (t) => 3 * Math.sin(turn(t)) * pouring(t),
    gale: (t) => 0.25 * Math.sin(t * 17) * pouring(t),
  }, { prop: FM_ATTACKS.fire, pEl: 0 });
  return { ...m, hit: FIRE_HIT };
}

// =============================================================================================
// RAISE THE DEAD: the summoning held, the call thrown down at the heaps

export const RAISE_STRIKE = [f(40), f(42)] as const;
export const RAISE_HIT = f(42);
export const RAISE_LONG = f(84);
/** The summoning: from his arms flung up (the heaps begin to shake) to the call. */
export const RAISE_HOLD = [f(22), f(40)] as const;
function raiseMotion(): Motion {
  const [a0, a1] = RAISE_STRIKE;
  const held = heldIn(RAISE_HOLD[0], a0);
  const BOW: Pose = { pz: R.pz - 3, px: 1.2, pitch: R.pitch + 7, bend: R.bend + 16, faceUp: R.faceUp - 15, rhx: R.rhx + 6, rhy: R.rhy + 2, rhz: R.rhz - 4.5, re: 20, phi: 108, lean: 0.15, lhx: 9.5, lhy: 8, lhz: -14, le: 12, draw: 0.85, pAz: 1.3, pt: 0.3, gale: 0.1 };
  const UP: Pose = { pz: R.pz + 10, px: -2, yaw: R.yaw - 2, pitch: R.pitch - 7, bend: R.bend - 13, twist: R.twist - 2, faceUp: R.faceUp + 22, rhx: R.rhx, rhy: R.rhy + 2.5, rhz: R.rhz + 27, re: 78, phi: 97, lhx: 3, lhy: 8.5, lhz: 25, le: 70, draw: 0.05, pAz: 1.9, pt: 1, gale: 0.75 };
  const CALL: Pose = { pz: R.pz - 1, px: 2.5, yaw: R.yaw + 2, pitch: R.pitch + 8, bend: R.bend + 13, twist: R.twist + 3, faceUp: R.faceUp - 6, rhx: R.rhx + 9, rhy: R.rhy + 2, rhz: R.rhz + 2, re: 40, phi: 165, lhx: 14, lhy: 9, lhz: -6, le: 30, draw: 0, pAz: 2, pt: 1, gale: 1 };
  const FOLLOW: Pose = { pz: R.pz - 2, px: 3, pitch: R.pitch + 10, bend: R.bend + 15, rhx: R.rhx + 10, rhz: R.rhz, phi: 180, lhx: 13, lhz: -9, le: 36, gale: 0.8 };
  const m = beatMove(RAISE_LONG, [
    [f(10), BOW],
    [RAISE_HOLD[0], UP],
    [a0, UP, 'lin'],
    [a1, CALL, 'lin'],
    [f(50), FOLLOW, 'out'],
  ], {
    pz: (t) => shiver(t, 0.4, 5) * held(t),
    bend: (t) => shiver(t, 0.6, 6) * held(t),
    rhz: (t) => shiver(t, 0.4, 7) * held(t),
    lhz: (t) => shiver(t, 0.5, 8) * held(t),
  }, { prop: FM_ATTACKS.raise, pEl: 0 });
  return { ...m, hit: RAISE_HIT };
}

// =============================================================================================
// THE TELEPORT: yanked down into a pit of his dead; the mark where he will rise; erupting out of it

/** How far under the floor he is when he is nowhere (his own lengths: as the game's). */
const DEEP = 155;
export const SINK_STRIKE = [f(18), f(20)] as const;
export const SINK_HIT = f(20);
export const SINK_LONG = f(30);
/** Out of reach from here (seconds into his going): his head under the floor. */
export const SINK_GONE = f(20);
export const RISE_STRIKE = [f(18), f(20)] as const;
export const RISE_HIT = f(20);
export const RISE_LONG = f(42);
/** Seized: arms flung up, his dead's hands on him (rising a little as he fights them). */
const SEIZED: Pose = { pz: R.pz + 5, px: -1.5, pitch: R.pitch - 8, bend: R.bend - 10, faceUp: R.faceUp + 10, rhx: R.rhx + 1, rhy: R.rhy - 1.5, rhz: R.rhz + 24, re: 72, phi: 100, lean: 0.14, lhx: 4, lhy: 9, lhz: 24, le: 70, draw: 0.7, pAz: 2, pt: 1, gale: 0.8 };
function sinkMotion(): Motion {
  const [a0, a1] = SINK_STRIKE;
  const fight = heldIn(f(10), a0);
  const m = beatMove(SINK_LONG, [
    [f(10), SEIZED],
    [a0, SEIZED, 'lin'],
    [a1, { pz: R.pz - 118, pitch: R.pitch + 6, bend: R.bend + 8, faceUp: R.faceUp - 4, gale: 1 }, 'lin'],
    [f(28), { pz: R.pz - 150 }, 'out'],
  ], {
    pitch: (t) => 2.2 * Math.sin(t * 22) * fight(t),
    twist: (t) => 6 * Math.sin(t * 13) * fight(t),
    roll: (t) => 2.5 * Math.sin(t * 15 + 2) * fight(t),
    rhz: (t) => shiver(t, 0.4, 9) * fight(t),
    lhz: (t) => shiver(t, 0.5, 10) * fight(t),
  }, { prop: FM_SINKING, pEl: 0 }, REST_POSE, true, { end: { ...SEIZED, pz: R.pz - DEEP, pitch: R.pitch + 6, bend: R.bend + 8, faceUp: R.faceUp - 4, gale: 1 } });
  // (its last frame is under the floor: nothing of him; the rules hold him there, `blink`)
  return { ...m, hit: SINK_HIT };
}
function riseMotion(): Motion {
  const [a0, a1] = RISE_STRIKE;
  const UNDER: Pose = { ...SEIZED, pz: R.pz - DEEP };
  const OUT: Pose = { pz: R.pz + 13, px: 1, pitch: R.pitch - 10, bend: R.bend - 12, faceUp: R.faceUp + 12, rhz: R.rhz + 26, re: 74, phi: 100, lhx: 4, lhy: 13, lhz: 22, le: 74, draw: 0.02, pAz: 2, pt: 1, gale: 1 };
  const OVER: Pose = { pz: R.pz + 17, pitch: R.pitch - 11, bend: R.bend - 13, gale: 1 };
  // (it begins as he is under the floor: nothing of him; where he will rise is marked on the floor)
  const m = beatMove(RISE_LONG, [
    [a0, UNDER, 'lin'],
    [a1, OUT, 'lin'],
    [f(27), OVER, 'out'],
  ], {}, { prop: FM_RISING, pEl: 0 }, REST_POSE, true, { start: UNDER });
  return { ...m, hit: RISE_HIT };
}
/** His painter's own pit and his dead's hands (art/fleshmancer.ts teleportBits) are timed for the game's going and coming back: these moments of the new ones are those of the old (seconds). */
const SINK_OLD: ReadonlyArray<readonly [number, number]> = [[0, 0], [f(10), 0.24], [SINK_STRIKE[0], 0.3], [SINK_HIT, 0.6], [f(26), 0.74], [SINK_LONG, 1.0]];
const RISE_OLD: ReadonlyArray<readonly [number, number]> = [[0, 0.02], [RISE_STRIKE[0], 0.4], [RISE_HIT, 0.58], [f(27), 0.75], [RISE_LONG, 1.2]];
const along = (keys: ReadonlyArray<readonly [number, number]>, t: number): number => {
  if (t <= keys[0][0]) return keys[0][1];
  for (let i = 1; i < keys.length; i++) if (t <= keys[i][0]) return keys[i - 1][1] + ((keys[i][1] - keys[i - 1][1]) * (t - keys[i - 1][0])) / (keys[i][0] - keys[i - 1][0]);
  return keys[keys.length - 1][1];
};

// =============================================================================================
// THE STRIKES, AND THEIR SMEAR: after-images of what strikes along the way it came

/** Each move's strikes, and what of him strikes in each (the skull, his claw). */
export const FM_ACT_STRIKES: Readonly<Record<string, ReadonlyArray<{ s: readonly [number, number]; by: ReadonlyArray<'skull' | 'claw' | 'staff'> }>>> = {
  attack: [{ s: SHARD_STRIKES[0], by: ['skull', 'staff'] }, { s: SHARD_STRIKES[1], by: ['skull', 'staff'] }],
  rings: [{ s: RING_STRIKES[0], by: ['claw', 'staff'] }, { s: RING_STRIKES[1], by: ['claw'] }],
  fire: [{ s: FIRE_STRIKE, by: ['skull', 'claw'] }],
  raise: [{ s: RAISE_STRIKE, by: ['skull', 'claw'] }],
  sink: [{ s: SINK_STRIKE, by: ['skull'] }],
  rise: [{ s: RISE_STRIKE, by: ['skull', 'claw'] }],
};
/** Whether a frame of a move shows a strike's smear: from the frame after its wind-up ends to the frame after it lands. */
export function fmSmeared(move: string, t: number): boolean {
  return (FM_ACT_STRIKES[move] ?? []).some(({ s }) => t > s[0] + 1e-6 && t <= s[1] + FR + 1e-6);
}
const pointOf = (s: Skeleton, by: 'skull' | 'claw' | 'staff'): V3 => (by === 'skull' ? staffOf(s).skull : by === 'claw' ? s.handL : lerp3(staffOf(s).top, staffOf(s).skull, 0.2));
/** The smear's lines (oldest first), as ropes `smear...`, for a move of the mob `of()`. */
function smearRopes(of: () => Mob, move: string, t: number, strikes = FM_ACT_STRIKES[move] ?? []): Ropes {
  const out: Record<string, V3[]> = {};
  for (const { s, by } of strikes) {
    if (!(t > s[0] + 1e-6 && t <= s[1] + FR + 1e-6)) continue;
    const from = t > s[1] + 1e-6 ? s[1] - FR * 0.6 : s[0] - FR * 0.3;
    const to = Math.min(t, s[1]);
    const N = 14;
    by.forEach((b, j) => {
      const pts: V3[] = [];
      for (let k = 0; k <= N; k++) pts.push(pointOf(skeletonAt(of(), move, from + ((to - from) * k) / N), b));
      out[`smear${j}`] = pts;
    });
  }
  return out;
}
/** The smear's after-images: the oldest the enemy's fire, dull; the newest near white; the thickest at the newest. */
const SMEAR = [FLAME[1], FLAME[2], FLAME[3], '#fff0e6'] as const;
function smearBits(m: Moment): Bit[] {
  const bits: Bit[] = [];
  if (!m.ropes) return bits;
  for (const [k, line] of Object.entries(m.ropes)) {
    if (!k.startsWith('smear') || line.length < 2) continue;
    for (let i = 1; i < line.length; i++) {
      const age = i / (line.length - 1);
      const n = Math.max(1, Math.ceil(len(sub(line[i], line[i - 1])) / 1.2));
      for (let j = 0; j < n; j++) {
        const p = lerp3(line[i - 1], line[i], j / n);
        bits.push({ part: 'smear', piece: 'smear', shape: { k: 'mote', p: [p[0], p[1], Math.max(0.8, p[2])], c: age > 0.85 ? SMEAR[3] : age > 0.6 ? SMEAR[2] : age > 0.3 ? SMEAR[1] : SMEAR[0], size: age > 0.45 ? 2 : 1 } });
      }
    }
  }
  return bits;
}

// =============================================================================================
// HIS LOOK FOR THESE MOVES: the master's, told these moves' moments (when the skull spits and he slams, when it shrieks and pours)

/** How hot the skull's mouth burns (0 to 1), `t` seconds into one of these moves (by `prop`). */
export function actMaw(prop: number, t: number): number {
  switch (prop) {
    case FM_ATTACKS.shards: {
      // (blazing as it spits each fan, roaring between)
      const [h1, h2] = SHARD_HITS;
      const spit = (h: number): number => (t < h - 0.04 ? 0 : 1 - rampAt(t, h + 0.15, h + 0.45));
      return Math.max(0.55 * rampAt(t, f(4), f(14)) * (1 - rampAt(t, h2 + 0.3, SHARD_LONG - 0.1)), spit(h1), spit(h2));
    }
    case FM_ATTACKS.rings:
      return 0.6 * rampAt(t, f(8), f(20)) * (1 - rampAt(t, f(66), f(84)));
    case FM_ATTACKS.raise:
      return rampAt(t, f(14), RAISE_HOLD[0]) * (1 - rampAt(t, f(56), f(72)));
    case FM_ATTACKS.fire:
      return rampAt(t, f(4), f(16)) * (1 - rampAt(t, FIRE_STOP, FIRE_STOP + 0.3));
    default:
      return 0;
  }
}
/** How far the skull's jaw hangs open (picture pixels), `t` seconds into one of these moves. */
export function actJaw(prop: number, t: number): number {
  switch (prop) {
    case FM_ATTACKS.shards:
      return 3 * rampAt(t, f(4), f(14)) + 1 * rampAt(t, SHARD_HITS[0] - 0.02, SHARD_HITS[0]) - 4 * rampAt(t, f(62), f(76));
    case FM_ATTACKS.rings:
      return 2 * rampAt(t, f(8), f(16)) + 2 * rampAt(t, RING_HITS[0] - 0.05, RING_HITS[0]) - 4 * rampAt(t, f(70), f(86));
    case FM_ATTACKS.raise:
      return 4 * rampAt(t, f(14), RAISE_HOLD[0]) * (1 - rampAt(t, f(56), f(72))) + (t > RAISE_HOLD[0] && t < RAISE_HIT ? Math.round(0.5 + 0.5 * Math.sin(t * 40)) : 0);
    case FM_ATTACKS.fire:
      return 4 * rampAt(t, f(6), f(14)) * (1 - rampAt(t, FIRE_STOP, FIRE_STOP + 0.3));
    default:
      return 0;
  }
}
export const FM_ACT_LOOK: FmLook = {
  ...FM_LOOK,
  timing: { raiseShriek: f(24), raiseHold: f(44), fireBurst: FIRE_HIT, fireStop: FIRE_STOP, shardHits: SHARD_HITS, ringHits: RING_HITS },
  maw: actMaw,
  jaw: actJaw,
};

// =============================================================================================
// HIM, WITH THESE MOVES

/** His canvas for these: room for him risen higher, his staff overhead, and the smear of its sweep. */
export const FM_ACT_CANVAS: MobCanvas = { w: 340, h: 330, ax: 170, ay: 252 };
let MOB: Mob | null = null;
const mobNow = (): Mob => (MOB ??= fleshmancerActionMob());
const withSmear = (mv: MobMove, move: string): MobMove => ({ ...mv, ropes: (t) => smearRopes(mobNow, move, t) });

/** THE FLESHMANCER WITH HIS MOVES DONE THE ACTION WAY: his stand, glide, setting off and stopping, struck and death the game's own. */
export function fleshmancerActionMob(): Mob {
  if (MOB) return MOB;
  const G = FLESHMANCER;
  const more = G.more as Readonly<Record<string, MobMove>>;
  const skullTrail = (s: Skeleton): V3[] => [staffOf(s).skull];
  MOB = {
    ...G,
    attack: withSmear({ name: 'The Fleshmancer draws a fan of bone shards up out of the floor, and hammers it at you: twice', motion: shardsMotion(), rest: FM_REST, trail: skullTrail, trailOver: (t) => SHARD_STRIKES.some(([a, b]) => t > a - 0.1 && t < b + 0.06), trailSpan: 2.4 }, 'attack'),
    hit: SHARD_HITS[0],
    canvas: FM_ACT_CANVAS,
    aura: { ...(G.aura as NonNullable<Mob['aura']>), x: FM_ACT_CANVAS.ax - 2, y: FM_ACT_CANVAS.ay - 44 },
    bits: (st, m) =>
      withFmLook(FM_ACT_LOOK, () => {
        const prop = m.q.prop;
        const t = prop === FM_SINKING ? along(SINK_OLD, m.t) : prop === FM_RISING ? along(RISE_OLD, m.t) : m.t;
        return [...fleshmancerBits(st, t === m.t ? m : { ...m, t }), ...smearBits(m)];
      }),
    more: {
      ...more,
      rings: withSmear({ name: 'The Fleshmancer lights the rings in the floor, and slams up his dead: every other ring, then the rest', motion: ringsMotion(), rest: FM_REST }, 'rings'),
      raise: withSmear({ name: 'The Fleshmancer summons, and his dead burst up out of the bone heaps', motion: raiseMotion(), rest: FM_REST }, 'raise'),
      fire: withSmear({ name: 'The Fleshmancer whips his fire round the lair', motion: fireMotion(), rest: FM_REST }, 'fire'),
      sink: withSmear({ name: 'The Fleshmancer is yanked down into a pit of his dead (his teleport: going)', motion: sinkMotion(), rest: FM_REST }, 'sink'),
      rise: withSmear({ name: 'The Fleshmancer erupts up out of the pit (his teleport: coming back)', motion: riseMotion(), rest: FM_REST }, 'rise'),
    },
  };
  return MOB;
}
/** The moves these redo (the rest are the game's own). */
export const FM_ACT_MOVES: ReadonlyArray<string> = ['attack', 'rings', 'raise', 'fire', 'sink', 'rise'];

/** HIM AS THE CHECKS SEE HIM, with these moves: as the game's (FM_SHAPE), each blow of a combo its own, the strikes and the smear. */
export const FM_ACT_SHAPE: BossShape = {
  ...FM_SHAPE,
  blows: {
    attack: [{ hit: SHARD_HITS[0], strike: SHARD_STRIKES[0], from: 0, until: f(36) }, { hit: SHARD_HITS[1], strike: SHARD_STRIKES[1], from: f(36) }],
    rings: [{ hit: RING_HITS[0], strike: RING_STRIKES[0], from: 0, until: f(44) }, { hit: RING_HITS[1], strike: RING_STRIKES[1], from: f(44) }],
  },
  strikes: { fire: FIRE_STRIKE, raise: RAISE_STRIKE },
  smeared: fmSmeared,
};
/** And as he goes and comes back (dragged under the floor and pushed up through it, as the game's FM_SHAPE_UNDER). */
export const FM_ACT_SHAPE_UNDER: BossShape = { ...FM_SHAPE_UNDER, strikes: { sink: SINK_STRIKE, rise: RISE_STRIKE }, smeared: fmSmeared };

/** HIM AS THE GAME WOULD HOLD HIM WITH FLESH_ACTION ON. */
export function makeFleshmancerActionArt(pace = FLESHMANCER.pace): ActorArt {
  const mob = fleshmancerActionMob();
  return { front: mobSet(mob, 'front', pace), back: mobSet(mob, 'back', pace) };
}
/** Where the skull is (his own lengths), and its tiles before him and to his left, `t` seconds into one of these moves. */
export function skullAt(move: string, t: number): V3 {
  return staffOf(skeletonAt(fleshmancerActionMob(), move, t)).skull;
}
export const tilesOf = (p: V3): [number, number] => [p[0] / TILE3, p[1] / TILE3];

// =============================================================================================
// THE MINI FLESHMANCER'S FIRE, THE SAME WAY, SMALLER (his call stays as it is)

export const MINI_STRIKE = [f(24), f(26)] as const;
export const MINI_HIT = f(26);
export const MINI_STOP = f(44);
export const MINI_LONG = f(68);
/** His whip: from well off to his right across before him to well off to his left (radians), in 0.6 s, thrown fastest at first. */
export const MINI_WHIP = { from: -1.3, round: 2.6, ease: 1.35 } as const;
export function miniWay(t: number): number | null {
  if (t < MINI_HIT - 1e-6 || t > MINI_STOP + 1e-6) return null;
  const k = clamp01((t - MINI_HIT) / (MINI_STOP - MINI_HIT));
  return MINI_WHIP.from + MINI_WHIP.round * (1 - (1 - k) ** MINI_WHIP.ease);
}
const MR = { ...(MINI_REST as unknown as Pose) } as Required<Pose>;
function miniFireMotion(): Motion {
  const [a0, a1] = MINI_STRIKE;
  const held = heldIn(f(12), a0);
  const pouring = (t: number): number => rampAt(t, a1, a1 + 4 * FR) * (1 - rampAt(t, MINI_STOP - 4 * FR, MINI_STOP));
  const turn = (t: number): number => miniWay(Math.min(MINI_STOP, Math.max(a1, t))) ?? MINI_WHIP.from;
  const deg = (t: number): number => (turn(t) * 180) / Math.PI;
  const COCK: Pose = { pz: MR.pz + 2.6, px: -2, yaw: MR.yaw - 20, twist: MR.twist - 26, pitch: MR.pitch - 7, bend: MR.bend - 10, faceUp: MR.faceUp + 7, rhx: -3.6, rhy: -9.5, rhz: 4, lhx: -0.6, lhy: -11, lhz: 6, le: 40, re: 40, draw: 0.88, pAz: 2, pt: 0.65, gale: 0.2 };
  const THRUST: Pose = { pz: MR.pz - 1, px: 2.8, yaw: MR.yaw, twist: MR.twist + 4, pitch: MR.pitch + 8, bend: MR.bend + 12, faceUp: MR.faceUp - 6, rhx: 13, rhy: 5, rhz: -3, lhx: 13, lhy: -5, lhz: -2, le: 20, re: 20, draw: 0.2, pAz: 1.4, pt: 1, gale: 1 };
  const POUR: Pose = { px: 1.4, rhx: 15, lhx: 15, pitch: MR.pitch + 6, bend: MR.bend + 9, gale: 0.7 };
  const m = beatMove(MINI_LONG, [
    [f(12), COCK],
    [a0, COCK, 'lin'],
    [a1, THRUST, 'lin'],
    [f(32), POUR, 'out'],
    [MINI_STOP, POUR],
  ], {
    pz: (t) => shiver(t, 0.6, 1) * held(t) + 0.7 * Math.sin(t * 9) * pouring(t),
    rhz: (t) => shiver(t, 0.8, 5) * held(t),
    lhz: (t) => shiver(t, 0.8, 6) * held(t),
    yaw: (t) => deg(t) * 0.35 * pouring(t),
    twist: (t) => deg(t) * 0.4 * pouring(t),
    faceTurn: (t) => deg(t) * 0.3 * pouring(t),
    rhy: (t) => 2 * Math.sin(turn(t)) * pouring(t),
    lhy: (t) => 2 * Math.sin(turn(t)) * pouring(t),
  }, { prop: 4, pEl: 0 }, MR, false);
  return { ...m, hit: MINI_HIT };
}
/** His look for it: his own, told its moments. */
export const MINI_ACT_LOOK: FmLook = {
  ...MINI_FM_LOOK,
  timing: { ...(MINI_FM_LOOK.timing as NonNullable<FmLook['timing']>), fireBurst: MINI_HIT, fireStop: MINI_STOP },
  maw: (prop, t) => (prop === 4 ? rampAt(t, f(4), f(14)) * (1 - rampAt(t, MINI_STOP, MINI_STOP + 0.25)) : (MINI_FM_LOOK.maw as (p: number, t: number) => number)(prop, t)),
};
export const MINI_ACT_STRIKES = { attack: MINI_STRIKE } as const;
/** Where the fire between his claws is (his own lengths). */
export const miniHands = (s: Skeleton): V3 => add(lerp3(s.handL, s.handR, 0.5), [0, 0, 1]);
let MINI: Mob | null = null;
export function miniActionMob(): Mob {
  if (MINI) return MINI;
  const ropes = (t: number): Ropes => {
    const [s0, s1] = MINI_STRIKE;
    if (!(t > s0 + 1e-6 && t <= s1 + FR + 1e-6)) return {};
    const from = t > s1 + 1e-6 ? s1 - FR * 0.6 : s0 - FR * 0.3;
    const to = Math.min(t, s1);
    const pts: V3[] = [];
    const ptsR: V3[] = [];
    for (let k = 0; k <= 12; k++) {
      const s = skeletonAt(miniActionMob(), 'attack', from + ((to - from) * k) / 12);
      pts.push(s.handL);
      ptsR.push(s.handR);
    }
    return { smear0: pts, smear1: ptsR };
  };
  MINI = {
    ...MINI_FM,
    attack: { name: 'The mini fleshmancer cocks his claws, holds, and whips his fire across the floor', motion: miniFireMotion(), rest: MINI_REST, ropes },
    hit: MINI_HIT,
    bits: (st, m) => withFmLook(MINI_ACT_LOOK, () => [...fleshmancerBits(st, m), ...smearBits(m)]),
  };
  return MINI;
}
export function makeMiniActionArt(pace = MINI_FM.pace): ActorArt {
  const mob = miniActionMob();
  return { front: mobSet(mob, 'front', pace), back: mobSet(mob, 'back', pace) };
}
export const miniSmeared = (move: string, t: number): boolean => move === 'attack' && t > MINI_STRIKE[0] + 1e-6 && t <= MINI_STRIKE[1] + FR + 1e-6;
void norm;
void mul;
void FM_CANVAS;
