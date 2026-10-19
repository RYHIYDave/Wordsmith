// ACT 2, THE HUSH: FLOOR 15, THE GREAT LIBRARY: ITS MAP-MAKER (game/act2_layout.ts asks it for the floor; until it lays one, null,
// the descent's map-maker stands in: game/act1_layout.ts, its open areas with this floor's ground painted over them).
//
// His doc ("Wordsmith Act 2: The Hush"): the lair floor: tall halls of shelves, the stacks' narrow aisles, galleries, the scriptorium, and the Reading Room, the Censor's (Land.zones, LB_ZONE).
// The art: art/library.ts (greatLibraryLook), art/floor15.ts, art/floor15_moments.ts; src/dev/preview_library.ts; docs/mockups/act2_library/README.md.
//
// WHAT IT GIVES: a Floor as the rest of the game knows one (its tiles, its rooms, its packs, its props, where the hero
// starts and the boss waits) and a Land (game/act1_layout.ts; what only the Hush's floors have, game/act2_types.ts),
// by the floor's own dice: the same depth and seed give the same floor, here and in the painter's worker.

import type { Act1Dress } from '../act1_dress';
import type { Laid } from '../act1_layout';
import type { Level } from '../state';

/** Whether this map-maker lays the floor yet (false: the descent's stands in). */
export const BUILT = false;

/** Lay floor 15, or null (not laid this time: the dice are rolled again, or the stand-in is laid). */
export function generate(depth: number, seed: number): Laid | null {
  void depth;
  void seed;
  return null;
}

/**
 * Dress the floor (its pieces, its floor tiles, its traps, its Bells' pieces where Land.bells has them, its quest), as
 * game/act1_dress.ts dresses the descent's; or null: not built yet, the descent's own dresser lays its set (act1_dress.ts,
 * ACT1_SETS) over the floor's open areas.
 */
export function dress(L: Level, depth: number, seed: number): Act1Dress | null {
  void L;
  void depth;
  void seed;
  return null;
}
