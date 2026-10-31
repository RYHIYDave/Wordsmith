// ACT 2, PART TWO, THE HIGH CITY: FLOOR 18, THE GLASS GALLERY: ITS MAP-MAKER AND ITS DRESSER (game/act2_layout.ts asks it
// for the floor, game/act2_dress.ts for its pieces). The plan: docs/high_city_build.md, "Floor 18".
//
// HIS DOC, level 18: "The queen's wing: long galleries of mirrors and a great glasshouse on the roof."; "indoors and up:
// mirrored halls and dressing rooms, a chapel of stained glass, and the glasshouse of dead orchids under a roof of panes.";
// its hazards "mirrors that crack and burst into shards when anything strikes near them; skylights to fall through to the
// floor below." The art is the art chat's (docs/mockups/glass_gallery/README.md): its ground art/glassgallery.ts, its 25
// pieces art/floor18.ts, the High City's 25 art/high_city_set.ts.

import type { Act1Dress } from '../act1_dress';
import type { Laid } from '../act1_layout';
import type { Level } from '../state';

/** Whether this floor's own map-maker is built (until it is, the descent's stands in: game/act2_layout.ts). */
export const BUILT = false;

/** What the map-maker laid, for the look, the dresser and the rules. */
export interface GalleryPlan {
  /** The runners down the galleries and across the Mirror Hall (tiles: x, y, w, h). */
  runners: { x: number; y: number; w: number; h: number }[];
  /** 1 on a skylight broken through (a pit: the hall below seen down it), by tile; the floor's width. */
  holes: Uint8Array;
  w: number;
}

/** Lay floor 18 (null: try again with other dice). */
export function generate(_depth: number, _seed: number): Laid | null {
  return null;
}

/** Dress floor 18 with its own pieces (null: the generic dresser lays the floor's set). */
export function dress(_L: Level, _depth: number, _seed: number): Act1Dress | null {
  return null;
}
