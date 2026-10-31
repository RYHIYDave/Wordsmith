// ACT 2, THE HUSH: WHO IS ON EACH FLOOR OF IT, AND IN WHAT PACKS (game/act1_mobs.ts asks, for floors 11 to 15).
//
// His words to the art chat, 18 Oct 2026: 15:47 Pacific, "I’d like no not reuse any enemies from the previous act"; the same
// minute, "So some of the new enemies can be used throughout the next 10 levels."; 15:48, "But let’s keep the acts separate".
// So nothing of Act 1 fights here; each floor has the art chat's own for it, and the city's own (floor 11's) come again where
// they fit: the Hushed townsfolk on every floor (his doc: "the act's common mob"), the Silent Order's scribes in the sewers
// (his doc's floor 12: "the Hushed, the Silent Order, and things that live in the sewers") and in force in the library.
//
// HOW OFTEN EACH COMES (the planning chat's, as the main chat's for the descent): the floor's own most, the city's a little.
// A lair's guardian pack is the floor's medium kind (the descent's was the brute: an Act 1 kind).

import type { RNG } from '../engine/rng';
import { cityFloor } from './act1';
import { act1Rules } from './act1_rules/index';
import { KNIGHT_TUNE } from './act1_rules/kknight';
import { SWAN } from './act1_rules/swan';
import { PACK_BY_SIZE, sizeOf } from './defs';
import type { MonsterKind } from './types';

export interface Act2Mob {
  kind: MonsterKind;
  weight: number;
}

export const ACT2_OWN: Readonly<Record<number, readonly Act2Mob[]>> = {
  11: [
    { kind: 'hushed', weight: 6 },
    { kind: 'watch', weight: 4 },
    { kind: 'scribe', weight: 3 },
    { kind: 'hound', weight: 4 },
  ],
  12: [
    { kind: 'rat', weight: 5 },
    { kind: 'dredger', weight: 5 },
    { kind: 'hushed', weight: 2 },
    { kind: 'scribe', weight: 1.5 },
  ],
  13: [
    { kind: 'fieldhand', weight: 6 },
    { kind: 'carter', weight: 5 },
    { kind: 'hushed', weight: 1 },
  ],
  14: [
    { kind: 'patient', weight: 6 },
    { kind: 'orderly', weight: 5 },
    { kind: 'hushed', weight: 1 },
  ],
  15: [
    { kind: 'inkling', weight: 6 },
    { kind: 'bookwarden', weight: 5 },
    { kind: 'scribe', weight: 2 },
    // (the city's own on every floor of the Hush, as told him on 19 Oct: "floor 11's Hushed townsfolk on later floors too")
    { kind: 'hushed', weight: 1 },
  ],
  // ACT 2, PART TWO, THE HIGH CITY (game/act1.ts HIGH_CITY): floor 16, the Swan Gardens (his doc: "the Hushed gardeners and
  // grooms, the palace guard, and the swans"); nothing of the Hush's floors (his "let’s keep the acts separate" held for the
  // two parts too: the High City's Hushed are the court's own)
  16: [
    { kind: 'swan', weight: 5 },
    { kind: 'gardener', weight: 4 },
    { kind: 'groom', weight: 4 },
    { kind: 'pguard', weight: 3 },
  ],
  // floor 17, the Masque (his doc: "masked dancers who waltz until they notice you, footmen, and the Silent Order among the
  // guests"): the dancers the most, in crowds
  17: [
    { kind: 'dancer', weight: 6 },
    { kind: 'footman', weight: 3 },
    { kind: 'order', weight: 3 },
  ],
  // floor 18, the Glass Gallery (his doc: "ladies-in-waiting, the queen's guard, and your own reflections, which step out of
  // the mirrors and fight with your class's moves")
  18: [
    { kind: 'reflection', weight: 4 },
    { kind: 'lady', weight: 5 },
    { kind: 'qguard', weight: 3 },
  ],
  // floor 19, the Keep (his doc: "the king's knights, still loyal and silent in their armour, crossbowmen on the walls, and the
  // Silent Order's last"): the knights few (his word to the art chat: “huge and slow, one or two at a time”)
  19: [
    { kind: 'xbow', weight: 5 },
    { kind: 'order', weight: 4 },
    { kind: 'kknight', weight: 2 },
  ],
};
/** Each floor's guardian (its lair's big one and its own): its medium kind. */
export const ACT2_GUARD: Readonly<Record<number, MonsterKind>> = { 11: 'watch', 12: 'dredger', 13: 'carter', 14: 'orderly', 15: 'bookwarden', 16: 'pguard', 17: 'footman', 18: 'qguard', 19: 'kknight' };
/** The tiny ones, never a yellow pack (they are not led). */
const TINY = new Set<MonsterKind>(['rat']);

/** Whether a kind of the Hush is in the game yet (its rules built: game/act1_rules/, its pictures with them). */
export function act2Ready(k: MonsterKind): boolean {
  return act1Rules(k) !== null;
}
/** What stands in for one not yet: the Hushed, once they are; until then the cult's dagger cultist (while the act is built only). */
function standIn(k: MonsterKind): MonsterKind {
  return act2Ready(k) ? k : act2Ready('hushed') ? 'hushed' : 'dagger';
}
/** A pack for a floor of the Hush: its kind, and how many. A lair's is its guardian's: one big one and its own. */
export function act2Pack(depth: number, rng: RNG, tier: 'normal' | 'elite' | 'champion'): { kind: MonsterKind; size: number } {
  const n = cityFloor(depth) || 11;
  // (THE HIGH CITY, FLOOR 19: the king's knights come one at a time, his pick to the art chat, “Huge and slow, one each”; their
  // lair, the barracks, two: game/act1_rules/kknight.ts KNIGHT_TUNE)
  const knight = (k: MonsterKind): boolean => k === 'kknight' && act2Ready('kknight');
  if (tier === 'champion') return { kind: standIn(ACT2_GUARD[n]), size: knight(ACT2_GUARD[n]) ? KNIGHT_TUNE.lair : rng.int(3, 4) };
  const list = ACT2_OWN[n].filter((m) => !(tier === 'elite' && TINY.has(m.kind)));
  const pick = rng.weighted(list, (m) => m.weight);
  const kind = standIn(pick.kind);
  // (THE HIGH CITY, FLOOR 16: the swans come in flocks, his “Knee-high, in flocks”: a pack of them bigger than another small
  // kind's, SWAN.flock, game/act1_rules/swan.ts)
  if (knight(kind)) return { kind, size: KNIGHT_TUNE.pack };
  const [lo, hi] = kind === 'swan' ? SWAN.flock : PACK_BY_SIZE[sizeOf(kind)];
  return { kind, size: rng.int(lo, hi) };
}
