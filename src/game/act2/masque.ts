// ACT 2, PART TWO, THE HIGH CITY: FLOOR 17, THE MASQUE: ITS MAP-MAKER AND ITS DRESSER (game/act2_layout.ts asks it for the
// floor, game/act2_dress.ts for its pieces). The plan: docs/high_city_build.md, "Floor 17".
//
// HIS DOC, level 17: "Into the palace, where the prince's masked ball has gone on for weeks."; "indoors: a winding suite of seven
// great rooms, each in its own colour (blue, purple, green, orange, white, violet, and a black one lit red through its windows),
// with galleries, card rooms and servants' passages between."; its hazard "the great ebony clock in the black room. Every so
// often it chimes: every dancer stops dead and turns to look at you, then the music starts again and they all come at once."
// The art is the art chat's (docs/mockups/masque/README.md): its ground art/masque.ts, its 25 pieces art/floor17.ts, the High
// City's 25 art/high_city_set.ts.

import type { Act1Dress } from '../act1_dress';
import type { Laid } from '../act1_layout';
import type { Level } from '../state';

/** Whether this floor's own map-maker is built (until it is, the descent's stands in: game/act2_layout.ts). */
export const BUILT = false;

/** Lay floor 17 (null: try again with other dice). */
export function generate(_depth: number, _seed: number): Laid | null {
  return null;
}

/** Dress floor 17 with its own pieces (null: the generic dresser lays the floor's set). */
export function dress(_L: Level, _depth: number, _seed: number): Act1Dress | null {
  return null;
}
