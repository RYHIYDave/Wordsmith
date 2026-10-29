// THE RANGER'S SIX COMPANIONS: THE SMEAR OF A STRIKE, AND EACH ONE'S GIFT WHERE IT BITES (the art chat's helper, 29 Oct
// 2026). A MOCK-UP: NOT IN THE GAME; nothing of the game imports this file.

import type { V3 } from './skeleton';
import type { Kind } from './companions_art_moves';

/** The smear's tones: the friend's wind, pale (the Ranger's own way, his rulebook's Animations 3: “wind, not energy”), newest to oldest. */
export function smearColours(): readonly [string, string, string] {
  return ['#d6f6f4', '#9ad8dc', '#5aa0b0'];
}

/** What is laid after its edge at `t` of its attack for its gift (filled in below). */
export function giftOf(k: Kind, t: number, tipAt: (t: number) => V3 | null): [V3, string, number][] {
  void k;
  void t;
  void tipAt;
  return [];
}
