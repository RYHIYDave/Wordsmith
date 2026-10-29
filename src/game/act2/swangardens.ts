// ACT 2, PART TWO, THE HIGH CITY: FLOOR 16, THE SWAN GARDENS: ITS MAP-MAKER AND ITS DRESSER (game/act2_layout.ts asks it for the
// floor, game/act2_dress.ts for its pieces). Not built yet: the descent's map-maker stands in (its open areas laid as the
// Quarry's), and the generic dresser.
//
// HIS DOC ("Wordsmith Act 2, Part Two: The High City (Levels 16–20)"), level 16: "Through the shut gates and up the hill through
// the palace's terraced gardens." Its layout "open, like the Millrace: terraces stepping up the hill joined by stairs, clipped
// hedges and a hedge maze, rose arbours, still fountains, and a long lake with a pavilion on an island"; its hazards "nettle
// beds that sting and slow whoever walks through them; the lake's deep water"; its enemies "the Hushed gardeners and grooms,
// the palace guard, and the swans"; its boss the Princess, on the Swan Pavilion. The art is the art chat's
// (docs/mockups/swan_gardens/README.md): its ground art/swangardens.ts, its 25 pieces and her vines art/floor16.ts, the High
// City's 25 art/high_city_set.ts.

import type { Act1Dress } from '../act1_dress';
import type { Laid } from '../act1_layout';
import type { Level } from '../state';

/** Whether this floor's own map-maker is built (until it is, the descent's stands in: game/act2_layout.ts). */
export const BUILT = false;

/** Lay floor 16 (null: try again with other dice). */
export function generate(_depth: number, _seed: number): Laid | null {
  return null;
}

/** Dress floor 16 with its own pieces (null: the generic dresser lays the floor's set). */
export function dress(_L: Level, _depth: number, _seed: number): Act1Dress | null {
  return null;
}
