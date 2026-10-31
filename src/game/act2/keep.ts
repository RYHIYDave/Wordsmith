// ACT 2, PART TWO, THE HIGH CITY: FLOOR 19, THE KEEP: ITS MAP-MAKER AND ITS DRESSER (game/act2_layout.ts asks it for the floor,
// game/act2_dress.ts for its pieces). The plan: docs/high_city_build.md, "Floor 19".
//
// HIS DOC, level 19: "The old castle at the hill's crown, where the king lies dying."; "walls and towers: battlements, a
// gatehouse, the barracks and the armoury, the throne hall, and the king's bedchamber at the top of the keep."; its hazards
// "murder holes that drop pitch, and portcullises that slam down to cut a hall in two." The art is the art chat's
// (docs/mockups/keep/README.md): its ground art/keep.ts, its 25 pieces art/floor19.ts, the High City's 25 art/high_city_set.ts.

import type { Act1Dress } from '../act1_dress';
import type { Laid } from '../act1_layout';
import type { Level } from '../state';

/** Whether this floor's own map-maker is built (until it is, the descent's stands in: game/act2_layout.ts). */
export const BUILT = false;

/** What the map-maker laid, for the dresser and the rules. */
export interface KeepPlan {
  /** Each room: its rectangle (x0, y0, x1, y1; x1, y1 not in it), what it is, its place along the way (-1 off it), its room id. */
  rooms: { r: [number, number, number, number]; role: string; path: number; room: number }[];
}

/** Lay floor 19 (null: try again with other dice). */
export function generate(_depth: number, _seed: number): Laid | null {
  return null;
}

/** Dress floor 19 with its own pieces (null: the generic dresser lays the floor's set). */
export function dress(_L: Level, _depth: number, _seed: number): Act1Dress | null {
  return null;
}
