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
 * ACT 2, PART ONE, THE HUSH (floors 11 to 15), behind this switch, OFF until he has seen it from the game and said yes. His
 * plan, his doc "Wordsmith Act 2: The Hush (Levels 11–15)" (the project's claude/act2_hush.md has his words), and on 19 Oct
 * 2026, 11:01 Pacific, to the planning chat: "Get levels 11-15 into the game". The art is the art chat's (its branches
 * mockup/act2-gateward to mockup/act2-library, docs/mockups/act2_*); the floors are laid as the descent's are, each by a
 * map-maker of its own (game/act2/), painted by the descent's painter (art/terrain.ts, each floor's look), with their own
 * event in place of the strongholds, THE BELLS (game/bells.ts). Off, floor 10 is the last (home to town: the siege broken).
 * WHERE THE GAME ASKS "A FLOOR LAID AS OPEN GROUND?", floors 11 to 15 answer as the descent's do (act1Floor below); where it
 * asks "THE DESCENT'S OWN?" (its cult, its strongholds, its camp), they do not (act2Floor).
 */
export const ACT2 = { on: true };

/** The kinds of ground of the descent, in its order; then the Hush's five (ACT2). */
export type Act1LandKind = 'quarry' | 'ledge' | 'canyon' | 'pine' | 'fen';
export type Act2LandKind = 'gateward' | 'undercity' | 'millrace' | 'housequiet' | 'library';
export type LandKind = Act1LandKind | Act2LandKind;
export const LAND_KINDS: readonly LandKind[] = ['quarry', 'ledge', 'canyon', 'pine', 'fen', 'gateward', 'undercity', 'millrace', 'housequiet', 'library'];
/** The Hush's five grounds. */
export const ACT2_LANDS: readonly Act2LandKind[] = ['gateward', 'undercity', 'millrace', 'housequiet', 'library'];
export function isAct2Land(k: LandKind): k is Act2LandKind {
  return (ACT2_LANDS as readonly string[]).includes(k);
}

/** Which floor laid as open ground a depth is: 6 to 10 (the descent), and 11 to 15 (the Hush) with ACT2 on; 0 for any other. */
export function act1Floor(depth: number): number {
  const d = Math.floor(depth);
  if (!ACT1.on) return 0;
  if (d >= 6 && d <= 10) return d;
  return ACT2.on && d >= 11 && d <= 15 ? d : 0;
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
/** The last floor there is: the Hush's fifth with it on, else the descent's. */
export function lastFloor(): number {
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
};

/** The floor of the descent at a depth, or null. */
export function act1Def(depth: number): Act1FloorDef | null {
  const n = act1Floor(depth);
  return n ? ACT1_FLOORS[n] : null;
}
