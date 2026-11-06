// THE QUEST LINE OF FLOORS 1 TO 5 (behind QUESTS15: ON since his yes, 6 Nov 2026, “Yes, put it in (Recommended)”).
//
// His words, 4 Nov 2026, 00:27 (Eastern): “I want a quest given to go to the chained one’s area and turn off the furnace.  Maybe
// by the armorer when you turn in the first runestone quest.  You go down to level 3, and there will be a side area you go into,
// it can be pretty short, then a flamey boss guy who drops a missing gear to the forge crank to turn it off, allowing you access
// to the chained one’s boss area which was blocked by fire, and then you get a reward from the armorer.  Probably another word.
// Gives you a reason to quest deeper, and gives you a reason to go back into town after level 3 for a quest to find the cultist
// stronghold under the ossuary, get the meldstone, and push the cultists out of the prison so you can leave back down the
// mountain, which the wordsmith will unbar the door once you turn in the meldstone.  That’s how I’d like quest progression to go
// for 1-5.” Read back to him in six steps: “Yes, that's it (Recommended)”. The reward: “What?  No just a word that’s already in
// the game.  I thought you were going to give me choices per class.  It doesn’t matter that much just throw whatever word in”;
// “Not a word they get from the first wordsmith quest”. 4 Nov, 08:22: “Turning in the meld stone should give you two words and a
// tutorial on how to meld.  Put that in with the quests”. Fri 6 Nov, 13:02: “Go”.
//
// So:
// 1. THE ARMOURER'S QUEST: once the wordsmith's ring is lit, the armourer, used, asks the hero to put out floor 3's furnace.
// 2. THE FIRE: on floor 3, while the furnace burns, fire bars the way into the Chained One's hall (its portcullis held down,
//    fire before it).
// 3. THE FURNACE ROOM: a short side room of floor 3, the forge crank in it (its gear missing) and its keeper, a boss of fire:
//    killed, he drops the gear.
// 4. THE CRANK: the gear set in and turned, the furnace goes out, the fire with it, the hall's way open.
// 5. THE ARMOURER'S REWARD: a word already in the game, by class, none the class's first word.
// 6. THE WORDSMITH'S QUEST: then the wordsmith asks for the Meldstone from the cultists' stronghold under the ossuary (floor 5);
//    the gate down the mountain stays barred until it is brought (not when the Fleshmancer falls), and bringing it gives two
//    words and a lesson in melding.
// A hero who has been down past floor 3 already has the furnace out; past floor 5 with the Meldstone given, the gate open.
// The flame boss, his room, the crank, its gear and the fire are the art chat's: THE STOKER (art/stoker.ts, his rules
// game/act1_rules/stoker.ts), handed over 6 Nov 2026, 16:28 (“Yes, hand it over (Recommended)”); his arena at the end of a short
// open hallway (his word, 16:29: “The stoker and his area is done.  I’d like a little hallway leading to his arena tho.  Not a door
// into it like a stronghold.”: game/furnace_arena.ts). The stand-ins (a fire champion, the Fire word's burning ground) are
// what is left where the art is not to be had (its switch off).

import type { ClassId, MonsterKind, WordId } from './types';

// ON, at his yes, 6 Nov 2026, shown the Stoker in the game (stoker_in_game.png), asked whether the whole quest line should go in the
// next update with him in it: “Yes, put it in (Recommended)”.
export const QUESTS15 = { on: true };

/** Where the hero stands in the furnace quest: asked; carrying the gear; the furnace put out; rewarded. */
export type FurnaceStep = 'asked' | 'gear' | 'out' | 'done';

/** The armourer's reward, by class: a word already in the game, none the class's first (defs.ts FIRST_WORD). */
export const FURNACE_WORD: Record<ClassId, WordId> = {
  warrior: 'heavy',
  ranger: 'precise',
  mage: 'frost',
  warlock: 'poison',
  tinkerer: 'lightning',
  brawler: 'swift',
};

/** The two words the wordsmith gives for the Meldstone, and the meld they make together (shown in his lesson). */
export const MELDSTONE_WORDS: readonly [WordId, WordId] = ['fire', 'frost'];

/** The furnace's keeper (a stand-in until the art chat's flame boss is in): its kind, how much more life than its kind's, and a name. */
export const KEEPER = { kind: 'firepot' as MonsterKind, life: 9, name: 'THE STOKER' };

/** How often the stand-in fire before the hall's way is laid afresh, and how long each lies (seconds). */
export const FIRE = { every: 0.9, lies: 1.3 };

/**
 * THE CRANK TURNED, IN ORDER (seconds from when it is turned; art/stoker_room.ts): the crank turning (CRANK_TURN.long); then the
 * furnace going out (FURNACE_OUT.long) and, in the Chained One's gateway, the fire going out (FIRE_WALL.long); the way open once
 * the fire is gone.
 */
export const CRANK_TIMES = { turn: 1.2, furnaceOut: 1.6, fireOut: 1.5 } as const;
/** The way into the hall is open again this long after the crank is turned. */
export const FIRE_GONE = CRANK_TIMES.turn + CRANK_TIMES.fireOut;

export const QUEST_TEXT = {
  furnaceAsk: 'The armourer: "The prison\'s furnace roars again, and its fire bars the Chained One\'s hall. Its crank lost a gear. Find it on floor 3 and shut the furnace down."',
  furnaceAskPrompt: 'Armourer: a task',
  fireSeen: 'Fire bars the way into the hall. The furnace feeds it.',
  crankNoGear: 'The forge crank: a gear is missing from it.',
  gearTaken: 'You take the CRANK GEAR. Set it in the forge crank.',
  stokerSeen: 'THE STOKER tends the furnace. The crank\'s gear is in him.',
  furnaceOut: 'The gear bites. The furnace dies, and the fire with it.',
  rewardPrompt: 'Armourer: the furnace is out',
  reward: (word: string) => `The armourer: "The forge breathes easy again. Take this." He gives you a word: ${word}.`,
  meldAsk: 'The wordsmith: "The cult holds the prison yet. Under the ossuary lies their stronghold, and in it the MELDSTONE. Bring it to me, and I will unbar the gate down the mountain."',
  meldAskPrompt: 'Wordsmith: a task',
  meldWords: (a: string, b: string) => `He gives you two words, ${a} and ${b}, to meld.`,
  lesson: [
    'MELDING: two damage words made one. Open the wordsmith, then MELD.',
    'Tap a word, then a hollow; then the other word, the other hollow. MELD makes them one word, for runedust.',
  ],
  gateUnbarred: 'The wordsmith unbars the gate down the mountain.',
};
