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

/** The five kinds of ground of the descent, in its order. */
export type LandKind = 'quarry' | 'ledge' | 'canyon' | 'pine' | 'fen';
export const LAND_KINDS: readonly LandKind[] = ['quarry', 'ledge', 'canyon', 'pine', 'fen'];

/** Which floor of the descent a depth is: 6 to 10; 0 for any other. */
export function act1Floor(depth: number): number {
  const d = Math.floor(depth);
  return ACT1.on && d >= 6 && d <= 10 ? d : 0;
}
/** The ground of a floor of the descent (null for any other floor). */
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
};

/** The floor of the descent at a depth, or null. */
export function act1Def(depth: number): Act1FloorDef | null {
  const n = act1Floor(depth);
  return n ? ACT1_FLOORS[n] : null;
}
