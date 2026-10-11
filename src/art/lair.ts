// THE CRYPT'S FIFTH FLOOR, THE FLESHMANCER'S LAIR: its look (a mock-up; nothing of the game imports it).
//
// The owner, in the art chat, 11 Oct 2026, 13:00: “floor 5 is mostly dirt as you’re completely under the
// prison.  Full of cult iconography and abandoned mining equipment.  Instead of stairs at the end I’d like
// a mine shaft you ride up.” His outline of 9 Oct (the main chat): the Crypt is less finished the deeper
// it goes: “By floor 4 it’s about half dirt and rocks with discarded and rusted mining equipment around.”
//
// SO FLOOR 5 IS OUT FROM UNDER THE PRISON, IN THE MINE'S DEEPEST WORKINGS: the next step down from floor 4
// and a long one. Nine in ten of its flagstones are gone (floor 4: nine in twenty), and nine in ten of its
// walls' stones (floor 4: half): bare earth underfoot, and walls of packed earth and rock. Its earth is the
// Crypt's own dark plum (art/crypt.ts, DIRT: never a mud brown), and its rock the Crypt's grey violet with
// the earth worked into it (packed earth and stones, lumpier and warmer than the rock of the floors above),
// so that it sits as the fifth in a row with the four and is never mistaken for any of them.
//
// What dressed stone there is, the odd flagstone and a course of the wall here and there, is the CULT'S,
// not the prison's: a dark slate with a little violet in it, greyer and a step darker than the vault's
// indigo, more of it broken; never the prison's to dirty. Their arches and their gates are of it.
//
// Built as art/crypt.ts builds the four (floorTheme: VAULT, its stone, an Earth of the earth and the
// rock), a Theme of art/ground.ts's painters, `crypt5`. The game has four (CRYPT_FLOORS) and cryptFloor()
// stops at 4, so that today floor 5 looks as floor 4 there: putting this look in is the main chat's, on
// his yes (docs/mockups/floor5/README.md, "For the main chat").
//
// THE RULES IT KEEPS (his art rulebook): a step quieter than the figures (Places 2) and darker than any
// word (Colour 4); no cyan, no pink (Colour 3); light from the upper left; each place its own (Places 3,
// Colour 1).

import { DIRT, ROCK } from './crypt';
import { makeWaypointArt } from './crypt_ways';
import type { WaypointArt } from './crypt_ways';
import { VAULT, makeGroundArt } from './ground';
import type { Earth, GroundArt, Theme } from './ground';
import { mix } from './kit';
import { makeDungeonProps } from './props';
import type { DungeonProps } from './props';

/** Which of the Crypt's floors this is. */
export const LAIR_FLOOR = 5;

/** THE CULT'S STONE: a dark slate, a little violet in it. A flagstone's shaded lip, then its three tones (the last also its lit lip). */
export const CULT_SLAB = ['#151219', '#201b27', '#29232f', '#3a3346'] as const;
/** The gap between its flagstones: deep, the joints worn open. */
export const CULT_MORTAR = '#08070d';
/** Its walls' faces: the joint, a low tone, the usual, the odd stone, the lit edge; turned to screen-left (in the light), and to screen-right (in shade). */
export const CULT_LIT = ['#16131e', '#25202e', '#312b3d', '#2b2537', '#4a4259'] as const;
export const CULT_SHADE = ['#0c0a12', '#15121c', '#1e1a27', '#1a1723', '#2c2738'] as const;
/** The tops of its walls (the game's walls fade into the dark and show none: kept for a wall cut down low). */
export const CULT_CAP = ['#1e1a28', '#2f2a3c', '#3b3549', '#37314a', '#4c4560'] as const;
export const CULT_CAP_LOW = ['#1a1724', '#2a2536', '#353044', '#312b40', '#433d56'] as const;

/**
 * THE ROCK OF THE DEEP WORKINGS: the Crypt's grey violet rock (ROCK) with its earth worked into it,
 * packed earth and stones: a little warmer and lumpier than the rock above, still well clear of the
 * earth's own tones so that a stone reads in it. Its shaded side, its body, an odd one, its lit edge.
 */
export const LAIR_ROCK = [mix(ROCK[0], DIRT[1], 0.35), mix(ROCK[1], DIRT[3], 0.3), mix(ROCK[2], DIRT[3], 0.3), mix(ROCK[3], DIRT[3], 0.18)] as const;

/** What is gone of its stonework: nine in ten of its flagstones and of its walls' stones (floor 4: 0.45 and 0.5), the earth under them the Crypt's own. */
export const LAIR_EARTH: Earth = { gone: 0.9, raw: 0.9, broken: 0.34, dirt: DIRT, rock: LAIR_ROCK, dug: true };

/** THE FIFTH LOOK: the Fleshmancer's lair, as a theme of the ground's painters. */
export const LAIR: Theme = {
  ...VAULT,
  id: 'crypt5',
  mortar: CULT_MORTAR,
  slab: CULT_SLAB,
  cap: CULT_CAP,
  capLow: CULT_CAP_LOW,
  lit: CULT_LIT,
  shade: CULT_SHADE,
  earth: LAIR_EARTH,
};

let ground: GroundArt | null = null;
let props: DungeonProps | null = null;
let way: WaypointArt | null = null;

/** The lair's floor and walls (as art/crypt.ts's cryptGround(k) for the four). */
export function lairGround(): GroundArt {
  return ground ?? (ground = makeGroundArt(LAIR));
}
/** What the game stands in any dungeon, in the lair's stone (as cryptProps(k)). */
export function lairProps(): DungeonProps {
  return props ?? (props = makeDungeonProps(LAIR));
}
/** The waypoint where he comes in, in the lair's stone (as cryptWays(k).way). No stairwell: the floor's way out is the mine shaft (art/floor5.ts). */
export function lairWaypoint(): WaypointArt {
  return way ?? (way = makeWaypointArt(LAIR));
}
