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

export function warlockSpells(): WarlockMove[] {
  return [
    { name: 'Tap: hellfire bolt', motion: hellfireBolt(), long: BOLT_LONG, loops: false, fire: BOLT_FIRE, open: BOLT_OPEN, blows: [{ at: BOLT_HIT, hand: 'left', size: 18, strike: 2 * FR }] },
  ];
}
