// THE QUEST LINE OF FLOORS 16 TO 20 (QUESTS1620: OFF until his yes to its pictures; pictures first, his rule).
//
// Planned with him 13 Nov 2026 (Eastern), and written into his doc "Wordsmith Act 2, Part Two: The High City (Levels 16–20)"
// (https://claude.ai/artifact/Vk5k8RPTdwyMhdpSUd4fuX), its section "The quest line: The Clockwork Songbird". His words: of the
// songbird, “I like it but I’d like another couple of side quests in there”; the bird required to open the tower, “Yes, required
// (Recommended)”; of the two side quests offered, “Only The Whole Court”; the Captain's Voice in the other's place, “Yes, add it
// (Recommended)”; asked what next, “Yes, build 16–20 now (Recommended)”; told the captain's jar could not be gone back down to
// floor 12 for (the waypoint takes him only to the furthest floor reached), his pick: “Pick it up on floor 12”.
//
// THE CLOCKWORK SONGBIRD (the armourer; REQUIRED):
// 1. ASKED: once the Princess (16) has fallen, the armourer, used, tells of the King's clockwork songbird, the one thing that could
//    sing over the Hush; it is broken.
// 2. ITS PARTS, each once (Hero.birdParts, a bit each; asked for or not): the Prince (17) drops its KEY as he falls, the Queen (18)
//    its SPRING; the bird itself lies broken before the King's throne (19; the art chat's piece, art/floor19.ts songbird), taken
//    by walking up to it once he has fallen.
// 3. MENDED: the three brought, the armourer mends it (a word for it, one of the deepest, from 16: the main chat's pick, his to
//    change). ITS SONG OPENS THE QUIET TOWER: from floor 19 the way on takes a hero whose bird is not mended home to the camp
//    instead (the tower's door shut), and once it is mended (the King fallen) the camp's waypoint takes him on to the tower, 20.
//    A hero who has been up the tower before (his waypoint past 19) is not stopped.
// 4. AGAINST THE MOTH (20): once each of its phases, the use button: the bird sings; every cloud of its dust blows away, his words
//    come back (the Hush lifted from him), and the Moth is stunned `stun` seconds.
//
// THE WHOLE COURT (the stranger; a side quest): once he holds a royal's card, the stranger asks for one card of each royal; brought
// (one of each, taken from his hand), not a poker hand, so he pays more than any hand does: a unique of his pool (UNIQUES).
//
// THE CAPTAIN'S VOICE (a side quest): on floor 12 a second bottled voice lies in a side chamber of the sewers, the knight-captain's
// (the Crier's jar's picture, labelled), taken by walking up to it; if passed by, it is gone (but in endless). On floor 19 the
// King's knight-captain stands silent in the barracks (the knights' lair) and does not fight; brought his voice, he speaks, his
// knights stand down (gone from the floor, and on it every time after), and he gives a weapon of the King's armoury: a unique for
// the hero's hand (his pool's, UNIQUES), or a fully modded rare where there is none.

import type { WordId } from './types';
import { LAST_WORD_IDS } from './types';

export const QUESTS1620 = { on: false };

/** The songbird's parts, a bit each (Hero.birdParts). */
export const BIRD_KEY = 1;
export const BIRD_SPRING = 2;
export const BIRD_BODY = 4;
export const BIRD_ALL = 7;

export const SONG = {
  /** How long the Moth is stunned by the song (seconds). */
  stun: 3,
  /** How near the hero walks to the broken bird, or the captain's jar, to take it (tiles). */
  reach: 1.2,
  /** How near the knight-captain he stands to speak to him (tiles). */
  captainNear: 1.8,
};

/** The mended bird's reward: one of the deepest words (the main chat's pick, his to change). */
export function birdWords(): readonly WordId[] {
  return LAST_WORD_IDS;
}

/** The parts of the songbird a hero has taken. */
export function birdPartsTaken(bits: number | undefined): number {
  const b = bits ?? 0;
  return (b & 1) + ((b >> 1) & 1) + ((b >> 2) & 1);
}

/** The name the second jar of floor 12 has (the Crier's jar's picture: game/act2/undercity.ts CRIERS_JAR, `variant` 1). */
export const CAPTAIN_JAR_VARIANT = 1;

/** The knight-captain's label over him. */
export const CAPTAIN_NAME = 'KNIGHT-CAPTAIN';
/** The broken songbird before the King's throne, floor 19 (game/act2/keep.ts; game/act1_rules/gking.ts brokenBird). */
export const BROKEN_BIRD = 'the clockwork songbird, broken';
/** Under "Return to the KNIGHT-CAPTAIN": where he stands. */
export const CAPTAIN_WHERE = "In the Keep's barracks, floor 19.";

export const QUEST1620_TEXT = {
  birdAsk: 'The armourer: "The King had a clockwork songbird, the finest thing I ever saw made. They say it could sing over any silence. It\'s broken now. Bring me its key, its spring and the bird, and I\'ll make it sing again."',
  birdAskPrompt: 'Armourer: a task',
  partGot: (what: string, k: number) => `You take ${what === 'body' ? 'the songbird' : `the songbird's ${what}`} (${k} of 3).`,
  birdGivePrompt: 'Armourer: the songbird',
  birdMended: (word: string, tower: boolean) =>
    `The armourer winds the songbird, and it sings. "That song will open any door." He gives you ${word}.${tower ? ' The waypoint will take you up to the Quiet Tower.' : ''}`,
  towerShut: 'The door to the Quiet Tower stays shut. It opens only to a song.',
  songPrompt: 'Songbird: sing',
  sang: 'The songbird sings. The dust blows away.',
  keyLabel: 'Songbird\'s key',
  springLabel: 'Songbird\'s spring',
  courtAsk: 'The stranger: "Royal cards, eh? Bring me one of each. Princess, Prince, Queen and King. A whole court is worth more than any hand."',
  courtAskPrompt: 'Stranger: a task',
  courtGivePrompt: 'Stranger: the whole court',
  courtGiven: 'The stranger takes the four cards and grins. "A whole court. Here, this is worth more than any hand."',
  captainJarLabel: "The captain's voice",
  captainJarGot: "You take a jar marked with the King's crest: the KNIGHT-CAPTAIN'S VOICE.",
  captainSilent: 'The knight-captain stands at his post, silent. The Silent Order took his voice.',
  captainPrompt: 'Knight-captain',
  captainGivePrompt: 'Knight-captain: his voice',
  captainSpeaks: 'The knight-captain drinks his voice back: "Stand down!" His knights lower their swords. "The King\'s armoury is yours. Take this."',
  captainAgain: 'The knight-captain: "My knights are with you."',
};
