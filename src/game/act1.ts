// ACT 1, THE DESCENT: FLOORS 6 TO 10, OUT OF THE PRISON AND DOWN THE MOUNTAIN. What each floor is.
//
// The owner's plan, in his doc "Wordsmith Act 1: The Descent (Levels 6–10)" (the project's
// claude/act1_descent.md has his words): 12 Oct 2026, 12:27, "I’d like to leave the Prison, which is at the
// top of a mountain, and head down the mountain to a big town at the bottom ... I’d like the first to be a
// quarry, second a mountain side cliff where you go along the cliffs edge with blue sky around you, through
// a canyon, then couple more"; 12:37, "It would be on level 10.  And that’s the Act 1 Boss so it’s a bigger
// event than the cultists at the bottom of the prison"; 17:01, "Let’s say the cult has put the town under
// siege with some magic that is being power by some eldritch being in this ancient swamp.  So you kinda come
// down behind enemy lines and kill the eldritch horror and break the siege". And on 16 Oct 2026, 11:21, to
// the main chat: "Read all relevant chats and put levels 6-10 into the game".
//
// The art is the art chat's, every part with his yes (its branches mockup/act1-quarry to mockup/act1-fen and
// mockup/queen-redo; the Chat Board's posts of 13 to 16 Oct). HOW EACH FLOOR IS LAID, WHAT IS IN IT, WHAT
// EACH THING DOES are the main chat's: game/act1_layout.ts (the map-maker), game/act1_dress.ts (its pieces),
// game/act1_mobs.ts and game/act1_bosses.ts (the fights).

import type { MonsterKind } from './types';

/** ACT 1 IN THE GAME: floors 6 to 10 are the descent. Off, a floor past the fifth is the deep Crypt, as up to Version 21.1. */
export const ACT1 = { on: true };

/**
 * ACT 2, PART ONE, THE HUSH (floors 11 to 15), behind this switch: ON SINCE VERSION 23.0 (his words to the main chat, 19 Oct
 * 2026, 14:39 Pacific: "Please read the main chat and get the game updated up to level 15"; the game's films of it sent him
 * that day). His
 * plan, his doc "Wordsmith Act 2: The Hush (Levels 11–15)" (the project's claude/act2_hush.md has his words), and on 19 Oct
 * 2026, 11:01 Pacific, to the planning chat: "Get levels 11-15 into the game". The art is the art chat's (its branches
 * mockup/act2-gateward to mockup/act2-library, docs/mockups/act2_*); the floors are laid as the descent's are, each by a
 * map-maker of its own (game/act2/), painted by the descent's painter (art/terrain.ts, each floor's look), with their own
 * event in place of the strongholds, THE BELLS (game/bells.ts). Off, floor 10 is the last (home to town: the siege broken).
 * WHERE THE GAME ASKS "A FLOOR LAID AS OPEN GROUND?", floors 11 to 15 answer as the descent's do (act1Floor below); where it
 * asks "THE DESCENT'S OWN?" (its cult, its strongholds, its camp), they do not (act2Floor).
 */
export const ACT2 = { on: true };

/**
 * ACT 2, PART TWO, THE HIGH CITY (floors 16 to 20), behind this switch: OFF until the owner has seen each floor in play and said
 * yes. His plan, his doc "Wordsmith Act 2, Part Two: The High City (Levels 16–20)" (https://claude.ai/artifact/Vk5k8RPTdwyMhdpSUd4fuX),
 * planned with him in the main chat, 28 Oct 2026; the art the art chat's (its branch mockup/high-city-all, every part with his
 * yes: docs/mockups/high_city/HANDBACK.md); his word to the main chat, 29 Oct, 18:09: “Levels are ready to add”, and his picks
 * then: the floors built “One floor at a time”; the camp inside Vellum's gate the town still, “The camp stays the town
 * (Recommended)”; his event, the Royal Cards, “With floor 16 (Recommended)”. Built as the Hush's floors were (docs/act2_build.md,
 * its frame): each floor a LandKind of its own with its own map-maker and dresser (game/act2/), its own kinds (the empty files
 * registered for them, filled as each is built). `built` is how many of its five are in so far: floor 16, the Swan Gardens, first.
 * The Hush's own event, THE BELLS, is floors 11 to 15's (act2Floor); these floors have the Royal Cards (game/royal_cards.ts).
 */
export const HIGH_CITY = { on: false, built: 3 };

/** The kinds of ground of the descent, in its order; then the Hush's five (ACT2); then the High City's (HIGH_CITY). */
export type Act1LandKind = 'quarry' | 'ledge' | 'canyon' | 'pine' | 'fen';
export type Act2LandKind = 'gateward' | 'undercity' | 'millrace' | 'housequiet' | 'library' | HighLandKind;
export type HighLandKind = 'swangardens' | 'masque' | 'glassgallery';
export type LandKind = Act1LandKind | Act2LandKind;
export const LAND_KINDS: readonly LandKind[] = ['quarry', 'ledge', 'canyon', 'pine', 'fen', 'gateward', 'undercity', 'millrace', 'housequiet', 'library', 'swangardens', 'masque', 'glassgallery'];
/** The Hush's five grounds. */
export const ACT2_LANDS: readonly Act2LandKind[] = ['gateward', 'undercity', 'millrace', 'housequiet', 'library'];
export function isAct2Land(k: LandKind): k is Act2LandKind {
  return (ACT2_LANDS as readonly string[]).includes(k);
}

/** Which floor laid as open ground a depth is: 6 to 10 (the descent), and 11 to 15 (the Hush) with ACT2 on, and the High City's built with HIGH_CITY on; 0 for any other. */
export function act1Floor(depth: number): number {
  const d = Math.floor(depth);
  if (!ACT1.on) return 0;
  if (d >= 6 && d <= 10) return d;
  if (highFloor(d)) return d;
  return ACT2.on && d >= 11 && d <= 15 ? d : 0;
}
/** Which floor of the High City a depth is (16 on, as many as are built, with HIGH_CITY on), 0 for any other. */
export function highFloor(depth: number): number {
  const d = Math.floor(depth);
  return ACT1.on && ACT2.on && HIGH_CITY.on && d >= 16 && d < 16 + HIGH_CITY.built ? d : 0;
}
/** A floor of the city with a map-maker, a dresser and kinds of its own: the Hush's (11 to 15) and the High City's; 0 for any other. */
export function cityFloor(depth: number): number {
  return act2Floor(depth) || highFloor(depth);
}
/** Which floor of the Hush a depth is (11 to 15, with ACT2 on), 0 for any other. */
export function act2Floor(depth: number): number {
  const d = Math.floor(depth);
  return ACT1.on && ACT2.on && d >= 11 && d <= 15 ? d : 0;
}
/** Which floor of the descent itself a depth is (6 to 10), 0 for any other (the Hush's too). */
export function descentFloor(depth: number): number {
  const d = Math.floor(depth);
  return ACT1.on && d >= 6 && d <= 10 ? d : 0;
}
/** The last floor there is: the High City's last built with it on, else the Hush's fifth with it on, else the descent's. */
export function lastFloor(): number {
  if (ACT1.on && ACT2.on && HIGH_CITY.on) return 15 + HIGH_CITY.built;
  return ACT1.on && ACT2.on ? 15 : 10;
}
/** The ground of a floor laid as open ground (null for any other floor). */
export function landOf(depth: number): LandKind | null {
  const n = act1Floor(depth);
  return n ? LAND_KINDS[n - 6] : null;
}

/** One floor of the descent: its names, its boss, its mobs, its light. */
export interface Act1FloorDef {
  depth: number;
  land: LandKind;
  /** The place (his doc's "Setting"), and the floor's name, the boss's (his doc). */
  place: string;
  name: string;
  /** Who ends it (his doc; his yes at 18:07 on 12 Oct to the four main picks). */
  boss: MonsterKind;
  /**
   * The light of the place (his doc: "Time of day could run with the descent: leave the Prison at dawn and
   * reach the swamp at dusk"): how thick the dark laid over the world is (0 none), its colour, and how strong
   * the screen's darkened corners. A dungeon's is 0.88 with a pool of light round the hero; outdoors the day.
   */
  light: { dark: number; tint: readonly [number, number, number]; vignette: number; pool: number };
}

export const ACT1_FLOORS: Readonly<Record<number, Act1FloorDef>> = {
  6: { depth: 6, land: 'quarry', place: 'The Quarry', name: 'The Unfinished Cut', boss: 'unfinished', light: { dark: 0.03, tint: [40, 30, 60], vignette: 0.26, pool: 0 } },
  7: { depth: 7, land: 'ledge', place: 'The Ledge Road', name: "The Queen's Eyrie", boss: 'queen', light: { dark: 0, tint: [30, 30, 60], vignette: 0.26, pool: 0 } },
  8: { depth: 8, land: 'canyon', place: 'Echo Canyon', name: "The Cantor's Gorge", boss: 'cantor', light: { dark: 0.03, tint: [50, 24, 30], vignette: 0.26, pool: 0 } },
  9: { depth: 9, land: 'pine', place: 'The Pinewood', name: 'The Hollow Wood', boss: 'stag', light: { dark: 0.06, tint: [30, 22, 40], vignette: 0.3, pool: 0.04 } },
  10: { depth: 10, land: 'fen', place: 'The Sunken Fen', name: 'The Drowned Eye', boss: 'eye', light: { dark: 0.1, tint: [14, 10, 26], vignette: 0.32, pool: 0.08 } },
  // ACT 2, THE HUSH (ACT2): his doc's places and each boss's floor. The light the art chat's pictures were made for: the Gate
  // Ward at a lantern-warm dusk, the Millrace at night under the moon, the sewers, the infirmary and the library in the dark of
  // the dungeon (its pool of light round the hero), their own lamps and candles lighting them.
  11: { depth: 11, land: 'gateward', place: 'The Gate Ward', name: "The Crier's Square", boss: 'crier', light: { dark: 0.3, tint: [40, 24, 44], vignette: 0.3, pool: 0.12 } },
  12: { depth: 12, land: 'undercity', place: 'The Undercity', name: "The King's Cistern", boss: 'ratking', light: { dark: 0.82, tint: [6, 10, 12], vignette: 0.34, pool: 0.5 } },
  13: { depth: 13, land: 'millrace', place: 'The Millrace', name: 'The Pulping Floor', boss: 'palimpsest', light: { dark: 0.34, tint: [16, 22, 44], vignette: 0.3, pool: 0.14 } },
  14: { depth: 14, land: 'housequiet', place: 'The House of Quiet', name: "The Physician's Theatre", boss: 'physician', light: { dark: 0.72, tint: [10, 16, 12], vignette: 0.32, pool: 0.42 } },
  15: { depth: 15, land: 'library', place: 'The Great Library', name: 'The Reading Room', boss: 'censor', light: { dark: 0.8, tint: [12, 8, 6], vignette: 0.34, pool: 0.46 } },
  // ACT 2, PART TWO, THE HIGH CITY (HIGH_CITY): his doc's places and each boss's floor; the Swan Gardens at dawn (his doc's palette
  // "Dawn rose, swan white, deep hedge green"; the art chat's ground painted for a low sun from the upper left)
  16: { depth: 16, land: 'swangardens', place: 'The Swan Gardens', name: 'The Swan Pavilion', boss: 'princess', light: { dark: 0.06, tint: [58, 32, 52], vignette: 0.28, pool: 0 } },
  // (floor 17, the Masque: indoors, the seven rooms lit only through their windows, as in Poe, his pick by the art chat, “As
  // drawn, true to the book (Recommended)”: dark as the House of Quiet, a little warmer; the Prince's floor the Black Room)
  17: { depth: 17, land: 'masque', place: 'The Masque', name: 'The Black Room', boss: 'prince', light: { dark: 0.7, tint: [20, 12, 22], vignette: 0.32, pool: 0.42 } },
  // (floor 18, the Glass Gallery: the queen's wing by day, the candles lit (the art chat's look): lighter than the Masque, a cold
  // blue in its dark; the Queen's floor the Mirror Hall)
  18: { depth: 18, land: 'glassgallery', place: 'The Glass Gallery', name: 'The Mirror Hall', boss: 'gqueen', light: { dark: 0.6, tint: [14, 14, 26], vignette: 0.3, pool: 0.42 } },
};

/** The floor of the descent at a depth, or null. */
export function act1Def(depth: number): Act1FloorDef | null {
  const n = act1Floor(depth);
  return n ? ACT1_FLOORS[n] : null;
}
