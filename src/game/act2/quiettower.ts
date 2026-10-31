// ACT 2, PART TWO, THE HIGH CITY: FLOOR 20, THE QUIET TOWER: ITS MAP-MAKER AND ITS DRESSER (game/act2_layout.ts asks it for the
// floor, game/act2_dress.ts for its pieces). The plan: docs/high_city_build.md, "Floor 20".
//
// HIS DOC, level 20: "The lair floor that ends Act 2: the highest tower of the High City, where the last chapter was taken.";
// "a climb up the tower's spiralling floors (a scriptorium, a bell-less belfry, rooms the fog has filled) to the open top under
// the sky." The art is the art chat's (docs/mockups/quiet_tower/README.md): its two grounds art/quiettower.ts, its 25 pieces
// art/floor20.ts, the High City's 25 art/high_city_set.ts.

import type { Act1Dress } from '../act1_dress';
import type { Laid } from '../act1_layout';
import type { Level } from '../state';

/** Whether this floor's own map-maker is built (until it is, the descent's stands in: game/act2_layout.ts). */
export const BUILT = false;

/** What the map-maker laid, for the look, the dresser and the rules. */
export interface TowerPlan {
  /** Each room: its rectangle (x0, y0, x1, y1; x1, y1 not in it), what it is, its place along the way (-1 off it), its room id. */
  rooms: { r: [number, number, number, number]; role: string; path: number; room: number }[];
}

/** Lay floor 20 (null: try again with other dice). */
export function generate(_depth: number, _seed: number): Laid | null {
  return null;
}

/** Dress floor 20 with its own pieces (null: the generic dresser lays the floor's set). */
export function dress(_L: Level, _depth: number, _seed: number): Act1Dress | null {
  return null;
}
