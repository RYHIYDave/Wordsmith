// THE WARLOCK'S SPELLS AS A MAN (the art chat, 25 Oct 2026). A MOCK-UP; NOTHING OF THE GAME IMPORTS IT.
//
// His design, 25 Oct (Pacific), asked his kit in pop-ups: his tap, “Hellfire bolt (Recommended)”; his tap+hold, “I was
// thinking tap does a single target shot that hits an enemy and does a relatively strong DOT.  The tap and hold is an AOE
// that curses all enemies with a smaller DOT.  If a cursed enemy dies, it spreads all DOTs to other enemies in range.  So
// the play pattern is: try to get the tap DOT to spread via the curse.”; his swipe, “I like smoke step, and we can have
// that apply the curse as well”. His art rulebook's Movement 9, big wind-up, lightning strike: every attack winds up big
// and winds down big, the strike itself a flash.

import type { Bones, Key3, Motion } from '../art/skeleton';
import { FR, STANCE, T, WARLOCK_B, clamp, clutch, curl } from './warlock_moves';
import type { WarlockMove } from './warlock_moves';

/** His demon arm's whole reach, shoulder to claws. */
const L = WARLOCK_B.upperArm + WARLOCK_B.foreArm;

/**
 * THE HELLFIRE BOLT (his tap): a single shot at one enemy, setting it burning, a strong burn. HE HAULS THE DEMON ARM BACK
 * AND OUT, low at his side (the fire out beside him, not over him: Animations 4), curling over it, his right hand clutching
 * it high by its shoulder, the fire in its claws swelling and trembling; then in a flash HURLS it: the
 * arm flung straight out at the enemy, his back uncurling, his right hand thrown back; the bolt is gone from its claws. The recoil rocks him back; he sags over the spent arm,
 * heaving, the fire licking back up, and takes hold of it again.
 */
export const BOLT_HIT = 16 * FR;
export const BOLT_LONG = 44 * FR;
export function hellfireBolt(): Motion {
  const keys: Key3[] = [];
  /** a key, his right hand holding the demon arm (as it is held in his stance) */
  const held = (at: number, pose: Partial<Bones>, ease: Key3['ease'] = 'io'): void => {
    keys.push({ at: at * FR, ease, pose: { ...pose, ...clamp(pose) } });
  };
  /** a key, his right hand clutching the demon arm high, by its shoulder, as it is hauled away from him (as he holds it running) */
  const brace = (at: number, pose: Partial<Bones>, ease: Key3['ease'] = 'io'): void => {
    keys.push({ at: at * FR, ease, pose: { ...pose, ...clutch(pose) } });
  };
  /** a key, his right hand let go of it, thrown back behind him */
  const free = (at: number, pose: Partial<Bones>, ease: Key3['ease'] = 'io'): void => {
    keys.push({ at: at * FR, ease, pose: { rhIn: 1, rhx: -4 * T, rhy: -3 * T, rhz: -15 * T, re: 30, ...pose } });
  };
  /** the demon arm, its claws this far from his left shoulder: forward, to his left, up (the figure's own way, his lengths) */
  const claws = (x: number, y: number, z: number, e: number): Partial<Bones> => ({ lhIn: 1, lhx: x * T, lhy: y * T, lhz: z * T, le: e });
  held(0, {});
  // (THE WIND-UP: hauled back and down, curling over it, his eyes on the enemy)
  brace(5, { ...curl(8), twist: STANCE.twist + 12, yaw: STANCE.yaw + 4, px: -0.6 * T, pz: STANCE.pz - 0.5 * T, ...claws(1.0, 8.0, -18, 30), faceTurn: STANCE.faceTurn + 10 });
  brace(11, { ...curl(16), twist: STANCE.twist + 22, yaw: STANCE.yaw + 6, px: -1.2 * T, pz: STANCE.pz - 1.0 * T, ...claws(0.0, 9.5, -19, 22), faceTurn: -4, faceUp: STANCE.faceUp + 4 });
  // (held there, trembling)
  brace(12.5, { ...curl(16), twist: STANCE.twist + 21, yaw: STANCE.yaw + 6, px: -1.2 * T, pz: STANCE.pz - 1.0 * T, ...claws(0.3, 9.2, -18.6, 23), faceTurn: -4, faceUp: STANCE.faceUp + 4 }, 'lin');
  brace(14, { ...curl(16), twist: STANCE.twist + 22, yaw: STANCE.yaw + 6, px: -1.2 * T, pz: STANCE.pz - 1.0 * T, ...claws(0.0, 9.5, -19, 22), faceTurn: -4, faceUp: STANCE.faceUp + 4 }, 'lin');
  // (THE STRIKE, a flash: flung straight out at the enemy, his back uncurling)
  free(16, { ...curl(-10), twist: STANCE.twist - 20, yaw: STANCE.yaw - 4, px: 1.4 * T, pz: STANCE.pz + 0.3 * T, ...claws(20, -0.5, -0.5, 70), faceTurn: 0, faceUp: STANCE.faceUp }, 'lin');
  free(18, { ...curl(-12), twist: STANCE.twist - 26, yaw: STANCE.yaw - 5, px: 1.8 * T, pz: STANCE.pz + 0.4 * T, ...claws(20.5, -1.5, 1.5, 72), faceTurn: 0, faceUp: STANCE.faceUp + 2 }, 'out');
  // (THE RECOIL rocks him back; he sags over the spent arm, heaving)
  free(24, { ...curl(6), twist: STANCE.twist - 14, yaw: STANCE.yaw - 2, px: 0.6 * T, pz: STANCE.pz - 0.8 * T, ...claws(16, 0, 4, 60), faceTurn: -2, faceUp: STANCE.faceUp - 4 });
  free(32, { ...curl(12), twist: STANCE.twist - 4, px: 0.2 * T, pz: STANCE.pz - 1.0 * T, ...claws(12, 2, -6, 45), faceTurn: STANCE.faceTurn + 6, faceUp: STANCE.faceUp - 6 });
  // (and takes hold of it again)
  held(44, {});
  return { keys, hit: BOLT_HIT };
}
/** The fire in his claws through the bolt: swelling as he winds up, gone with the bolt, licking back up. */
export const BOLT_FIRE: [number, number][] = [[0, 4.0], [5 * FR, 4.8], [11 * FR, 5.6], [14 * FR, 6.0], [BOLT_HIT, 0.8], [24 * FR, 0.6], [34 * FR, 2.2], [BOLT_LONG, 4.0]];

/** His claws through the bolt: curled round the fire, flung wide as he hurls it, curling back round it as it licks up again. */
export const BOLT_OPEN: [number, number][] = [[0, 0], [14 * FR, 0], [BOLT_HIT, 1], [26 * FR, 1], [38 * FR, 0]];

/**
 * THE CURSE (his tap+hold): every enemy in range cursed, a smaller burn on each. His picks, 25 Oct: how he casts it, “Chains
 * of brand” (offered as: he thrusts the claw out and lashes of cyan fire whip to each enemy in range, branding them); how a
 * cursed one looks, “Smoke only” (black smoke and cyan embers seeping off it, no mark). AS HE HOLDS IT he hauls the demon
 * claw up before him, its claws splaying, his back uncurling, his eyes up on it, his right hand clutching the arm as it
 * strains, the fire in it swelling, trembling while it is held; then in a flash THRUSTS it down and out at them, claws flung
 * wide, and chains of black smoke snake and whip out of it to every one, slack and swinging; he HAULS BACK on them as
 * they brand, snapping them taut, binding them; they burn away, and he sags over the arm and takes hold of it again (his
 * word of the first: “Too fast, let them whip,Too straight,How about Smokey black chains”).
 */
export const CURSE_HIT = 24 * FR;
export const CURSE_LONG = 66 * FR;
export function theCurse(): Motion {
  const keys: Key3[] = [];
  const held = (at: number, pose: Partial<Bones>, ease: Key3['ease'] = 'io'): void => {
    keys.push({ at: at * FR, ease, pose: { ...pose, ...clamp(pose) } });
  };
  const brace = (at: number, pose: Partial<Bones>, ease: Key3['ease'] = 'io'): void => {
    keys.push({ at: at * FR, ease, pose: { ...pose, ...clutch(pose) } });
  };
  const free = (at: number, pose: Partial<Bones>, ease: Key3['ease'] = 'io'): void => {
    keys.push({ at: at * FR, ease, pose: { rhIn: 1, rhx: -4 * T, rhy: -4 * T, rhz: -14 * T, re: 30, ...pose } });
  };
  const claws = (x: number, y: number, z: number, e: number): Partial<Bones> => ({ lhIn: 1, lhx: x * T, lhy: y * T, lhz: z * T, le: e });
  held(0, {});
  // (THE WIND-UP, held: the claw hauled up before him, his back uncurling, his eyes up on it)
  brace(8, { ...curl(-8), twist: STANCE.twist + 8, pz: STANCE.pz + 0.2 * T, ...claws(7, 7, 4, 40), faceTurn: -6, faceUp: STANCE.faceUp + 10 });
  brace(16, { ...curl(-14), twist: STANCE.twist + 12, yaw: STANCE.yaw + 2, pz: STANCE.pz + 0.4 * T, px: -0.4 * T, ...claws(5, 6, 10, 46), faceTurn: -4, faceUp: STANCE.faceUp + 16 });
  // (held, trembling, straining)
  brace(18, { ...curl(-13), twist: STANCE.twist + 11, yaw: STANCE.yaw + 2, pz: STANCE.pz + 0.4 * T, px: -0.4 * T, ...claws(5.4, 6.2, 10.4, 47), faceTurn: -4, faceUp: STANCE.faceUp + 16 }, 'lin');
  brace(20, { ...curl(-14), twist: STANCE.twist + 12, yaw: STANCE.yaw + 2, pz: STANCE.pz + 0.4 * T, px: -0.4 * T, ...claws(5, 6, 10, 46), faceTurn: -4, faceUp: STANCE.faceUp + 16 }, 'lin');
  brace(22, { ...curl(-13), twist: STANCE.twist + 11, yaw: STANCE.yaw + 2, pz: STANCE.pz + 0.4 * T, px: -0.4 * T, ...claws(5.4, 6.2, 10.4, 47), faceTurn: -4, faceUp: STANCE.faceUp + 16 }, 'lin');
  // (THE STRIKE, a flash: thrust down and out at them, the claws flung wide)
  free(24, { ...curl(6), twist: STANCE.twist - 18, yaw: STANCE.yaw - 4, px: 1.4 * T, pz: STANCE.pz - 0.6 * T, ...claws(18.5, 1, -5, 70), faceTurn: 0, faceUp: STANCE.faceUp - 2 }, 'lin');
  free(27, { ...curl(8), twist: STANCE.twist - 22, yaw: STANCE.yaw - 5, px: 1.7 * T, pz: STANCE.pz - 0.8 * T, ...claws(19, 0, -6.5, 72), faceTurn: 0, faceUp: STANCE.faceUp - 2 }, 'out');
  // (held out as the chains snake out to them)
  free(36, { ...curl(8), twist: STANCE.twist - 20, yaw: STANCE.yaw - 5, px: 1.5 * T, pz: STANCE.pz - 0.8 * T, ...claws(18.5, 0.5, -6, 70), faceTurn: 0, faceUp: STANCE.faceUp - 2 });
  // (HE HAULS BACK ON THE CHAINS as they brand them, snapping them taut)
  free(42, { ...curl(10), twist: STANCE.twist - 6, yaw: STANCE.yaw - 2, px: -0.6 * T, pz: STANCE.pz - 0.9 * T, ...claws(12, 3, -1, 55), faceTurn: -2, faceUp: STANCE.faceUp }, 'out');
  // (they burn away; he sags over the arm)
  free(54, { ...curl(14), twist: STANCE.twist - 2, px: 0, pz: STANCE.pz - 1.0 * T, ...claws(10, 4, -6, 45), faceTurn: STANCE.faceTurn + 6, faceUp: STANCE.faceUp - 6 });
  held(66, {});
  return { keys, hit: CURSE_HIT };
}
/** The fire in his claws through the Curse: swelling as he holds it, torn out of them into the chains, licking back up. */
export const CURSE_FIRE: [number, number][] = [[0, 4.0], [8 * FR, 4.8], [16 * FR, 5.8], [22 * FR, 6.2], [CURSE_HIT, 1.6], [42 * FR, 1.0], [56 * FR, 2.6], [CURSE_LONG, 4.0]];
/** His claws through the Curse: splaying as he raises them, flung wide as he thrusts, curling back round the fire. */
export const CURSE_OPEN: [number, number][] = [[0, 0], [8 * FR, 0.4], [16 * FR, 0.6], [22 * FR, 0.6], [CURSE_HIT, 1], [36 * FR, 1], [42 * FR, 0.7], [56 * FR, 0]];

export function warlockSpells(): WarlockMove[] {
  return [
    { name: 'Tap: hellfire bolt', motion: hellfireBolt(), long: BOLT_LONG, loops: false, fire: BOLT_FIRE, open: BOLT_OPEN, blows: [{ at: BOLT_HIT, hand: 'left', size: 18, strike: 2 * FR }] },
    { name: 'Tap and hold: the Curse', motion: theCurse(), long: CURSE_LONG, loops: false, fire: CURSE_FIRE, open: CURSE_OPEN, blows: [{ at: CURSE_HIT, hand: 'left', size: 18, strike: 2 * FR }] },
  ];
}
