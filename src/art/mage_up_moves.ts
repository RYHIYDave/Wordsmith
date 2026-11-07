// THE MAGE BROUGHT UP: HER MOVES (the art chat's helper, 7 Nov 2026; behind art/mage_up.ts MAGE_UP, off).
// STAGE 1 (the owner asked to see the Ranger as a still before the whole job, 6 Nov 19:21: “Can you show me the ranger redone
// before you go too crazy with the drawings?”, then “Just a still of him”; the Mage the same): only enough of her moves to pose
// the still. Her guard with her legs true; her guard alive (one frame of it is the still); a held cast to show her staff raised.
// The rest of her lists come in stage 2, on his yes.

import { MOVES3 } from './moves3';
import type { Move3 } from './moves3';
import type { Bones } from './skeleton';

/** The game's Mage, as she is (moves3.ts, with MAGE_STANCES and WILD on, as the game has them). */
export const MU_GAME = MOVES3;

/**
 * HER GUARD WITH HER LEGS TRUE (the owner, of the Ranger's still: “Can you make sure his leg ratio is correct cause it seems like
 * all these guys have long upper legs and short legs below the knee”; and of mending every hero: “Yes, every hero
 * (Recommended)”). Her guard is low and side-on (moves3.ts MAGE_GUARD_POSE), its knees bent toward the camera: from in front her
 * lower legs read 0.71 of her thighs, from toward the camera 0.61. Her body, arms, staff and the depth of her crouch as they
 * were; only her feet and knees placed again: her front foot further forward (14.5; it was 7) and a little out, its knee over
 * it; her back foot further back (-13.5; it was -7.5) and a little out, its knee less turned in, the foot less turned out. A
 * longer guard, as low: each shin is seen at its length from every side (tools/legs_measure.ts; tests/mage_up.test.ts).
 */
export const MU_GUARD_SEEN: Bones = MOVES3.mstand.rest;
export const MU_GUARD_LEGS = { lfx: 14.5, lfy: 2.5, lk: -4, lft: 2, rfx: -13.5, rfy: -4.5, rk: -23, rft: -18 } as const;
/**
 * HER STAFF SEEN FROM EVERY SIDE (the art chat, 7 Nov 2026: from toward you her staff pointed at the eye, only its crystal seen):
 * held as the game holds it, level in both hands and pointed at what is ahead, but carried out at her right side (her hands 5.5
 * further out; it was across her front, at her hip) and swung a little out (4 degrees) and laid level (2 degrees up; it was 14):
 * a clear length of its pole, and its crystal, from all eight sides (tests/mage_up.test.ts).
 */
export const MU_GUARD_STAFF = { rhy: -5, wAz: 176, wEl: 178 } as const;
export const MU_GUARD: Bones = { ...MU_GUARD_SEEN, ...MU_GUARD_LEGS, ...MU_GUARD_STAFF };

/** HER GUARD, ALIVE: the game's own (two breaths, her weight going over and back, twice in the round the crystal surging and a
 * gust off it), on her new legs. Its keys move her hips, back and crystal only: her feet stay where her guard has them. */
export const MU_STAND3: Move3 = { ...MOVES3.mstand, name: 'The mage, standing (brought up)', rest: MU_GUARD };

/**
 * A HELD CAST (Movement 9's held wind-up, as her Wave's will be in stage 2): from her guard, her staff swung up and back over her
 * right shoulder, high, the crystal blazing and a wind off it lifting her cape and braids; her free hand thrust out at her mark,
 * fingers spread; her body coiled away onto her back foot; held. On her guard's feet.
 */
export const MU_CAST_POSE: Partial<Bones> = {
  px: -2.8, pz: MU_GUARD.pz + 1.1, yaw: -50, twist: -30, pitch: -4, bend: -8, faceTurn: 12, faceUp: 4,
  rhIn: 0, rhx: -5, rhy: -6, rhz: 12.5, re: 0, lhIn: 0, lhx: 11, lhy: 3.5, lhz: 2.5, le: 8,
  wAz: 162, wEl: 52, draw: 2.7, gale: 0.9,
};
export const MU_CAST_HELD3: Move3 = {
  ...MOVES3.wave,
  name: 'The mage holds a cast (brought up)',
  rest: MU_GUARD,
  motion: { keys: [{ at: 0, pose: MU_CAST_POSE }, { at: 0.4, pose: MU_CAST_POSE }] },
};

/** Her moves brought up, by the game's short names (stage 1: her guard; and the held cast for the still). */
export const MU_MOVES: Record<string, Move3> = { mstand: MU_STAND3, cast: MU_CAST_HELD3 };
