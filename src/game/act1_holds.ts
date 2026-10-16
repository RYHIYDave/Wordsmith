// ACT 1, THE DESCENT: THE CULT'S STRONGHOLDS, what they do (where they stand and how they look are
// game/act1_layout.ts, game/act1_dress.ts and render/act1_pieces.ts: the art chat's, with his yes).
//
// His doc's "Side areas: cultist strongholds" (the planning chat's, kept with his yes): "Every level from 6 to 10
// has a cultist stronghold off the main path: always one, never more than two. Each ends in a big fight that
// drops runedust, the material for wordmelding. The guards: A couple of rare mobs guard the door. The door: It
// opens only when the player sacrifices a word to it. Up to three words can go in, and each is used up. The
// stakes: Each word past the first makes the mobs inside harder and the rewards richer. The last room: A boss or
// a room of very hard mobs. It drops runedust." And its look (his yes, 13 Oct): "In front of it stands an altar
// with three empty hollows shaped like rune stones, one for each word given... The two guards are rare and shown
// the way the game shows a yellow pack's leader"; the last room, "a yellow pack of four quarry golems" round the
// half-cut obelisk.
//
// SO (the main chat's reading, as told him):
//   THE GUARDS: two of the cult, rare (a yellow pack's leader, each alone), before the door: a mini fleshmancer
//     and a dagger cultist, as the mock-up stood them. One of them always carries a word: the word the door asks
//     for can be won at its foot.
//   THE ALTAR: standing at it, the use button opens it beside the inventory, as the town's gate was (ui/hold.ts):
//     up to three of the hero's spare words laid in its hollows (taken back free until the door is opened);
//     OPEN THE DOOR burns them, and the door's seal breaks.
//   THE DOOR, once open: walking into it, the screen darkens and he is in the hall; walking out of the hall by
//     the way he came (its threshold, at the middle of its near side), he is back before the door.
//   THE LAST ROOM: the first time he comes in, a yellow pack of four of the floor's own medium kind round the
//     obelisk (its leader and three minions), every one with the words he burned (as a word burned into a
//     dungeon at the gate is every monster's), and harder for each word past the first (HOLD_TUNE.life).
//   THE REWARD, once all four are dead: runedust (HOLD_TUNE.dust by how many words were burned), and pieces of gear.

import type { MonsterKind, WordId } from './types';

export const HOLD_TUNE = {
  /** How near the altar (tiles, to its middle) the hero must stand to use it. */
  near: 1.9,
  /** Words the altar takes, at most. */
  most: 3,
  /** The last room's pack: how many. */
  pack: 4,
  /** Its life, times as much for each word burned past the first. */
  life: 0.25,
  /** Runedust it gives, by how many words were burned (1, 2, 3). */
  dust: [0, 2, 4, 6] as readonly number[],
  /** Pieces of gear it gives, by how many words were burned. */
  items: [0, 1, 2, 3] as readonly number[],
  /** How far into the hall's threshold (tiles from its near side) he must walk to go out. */
  out: 0.55,
};

/** The floor's own medium kind (the last room's pack): the quarry golems, the cliff crawlers, the canyon scorpions, the twisted deer, the Eyespawn. */
export const HOLD_PACK: Readonly<Record<number, MonsterKind>> = { 6: 'qgolem', 7: 'crawler', 8: 'scorpion', 9: 'deer', 10: 'spawn' };
/** The two guards, as the mock-up stood them. */
export const HOLD_GUARDS: readonly MonsterKind[] = ['minifm', 'dagger'];

/** A stronghold of the level, as it stands now. */
export interface HoldState {
  /** The words laid on its altar (taken from the hero's; given back if he goes before the door is opened). */
  words: WordId[];
  /** Its door is open (its words burned). */
  open: boolean;
  /** He has been in its hall (its last fight is there). */
  entered: boolean;
  /** Its last fight is won, and its reward given. */
  won: boolean;
  /** The pack of its last room (Monster.packId). */
  pack: number;
}

/** The packId of a stronghold's last room's pack, and of its guards (each alone). */
export const HOLD_PACK_ID = (n: number): number => 9000 + n;
export const HOLD_GUARD_ID = (n: number, k: number): number => 9100 + n * 2 + k;
