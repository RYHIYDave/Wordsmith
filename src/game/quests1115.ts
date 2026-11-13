// THE QUEST LINE OF FLOORS 11 TO 15 (QUESTS1115: OFF until his yes to its pictures; pictures first, his rule).
//
// Planned with him 13 Nov 2026 (Eastern), in a chat of his of that day, and written into his doc "Wordsmith Act 2: The Hush
// (Levels 11–15)" (https://claude.ai/artifact/MRXBE78NUCTvSnZJNeCPE1), its sections "The quest line: The Unstruck Pages" and
// "Side quest: The Stolen Clapper". His words: asked to plan quests for 11 to 20, 17:38, “Can you help me plan out quests for
// levels 11-20”; of the plan read back to him, “Yes, that's it (Recommended)”; 18:03, “Yeah we want quests pertaining to the
// encounter for the level set.  So a bell quest and a stronghold quest”; of the bell quest, “Just one clapper, I dont want the
// player to be forced to do all of them if they don’t like the mechanic, but I want them to at least try it out.  So one
// clapper, rewards a fully modded rare gloves boots or helm”; asked whether to build it now, “Build 11–15 now (Recommended)”.
//
// THE UNSTRUCK PAGES (the mystic):
// 1. THE MYSTIC'S ASK: once floor 11 is cleared, the mystic in the camp, used, asks for the Crier's voice, bottled by the
//    Silent Order. (Planned as kept in a side room of the sewers; the art chat had already drawn it and laid it in the Rat
//    King's nest in his cistern, floor 12 (game/act2/undercity.ts CRIERS_JAR, art/floor12.ts criersJar): it is taken from
//    there.) Walked up to on floor 12, the jar is his, asked for or not (as the Queen's feather is).
// 2. THE JAR BROUGHT: she uncorks it; the Crier's voice tells of the book and of the three pages written before the Hush that
//    the Censor cannot strike out. Her reward: a word, one of the city's five (DEEP_WORD_IDS) at random (the main chat's
//    pick of which, for him to change).
// 3. THE PAGES (once the jar is brought, each once): the Palimpsest (13) drops the oldest as it falls; the Physician (14) a
//    page of his ledger; the third lies chained in a side area of the library (15), its stacks.
// 4. IN THE CENSOR'S FIGHT: his ink fills the floor as the fight goes (act1_rules/censor.ts CENSOR_FIGHT, which took the place
//    of the floor blacked out at half his life). With a page in hand, the use button lays it down and ALL HIS INK LYING ON
//    THE FLOOR DRIES AWAY at once: three pages, three clean floors, when the player picks. A page laid is spent for that
//    fight; dead and come again, he has them all again (as the ward-stone's pieces).
//
// THE STOLEN CLAPPER (the armourer):
// 1. THE ARMOURER'S ASK: once floor 10 is cleared (in the camp, before the Hush's floors), the armourer, used, says the Silent
//    Order tore the clappers out of the city's bells.
// 2. ONE CLAPPER: the first time he rings every bell in time on any of floors 11 to 15, the clapper falls with the explosion
//    (asked for or not).
// 3. BROUGHT: the armourer hangs it in the camp's bell (its picture the art chat's, behind the switch), and lays out three
//    fully modded rares, gloves, boots and a helm: he takes one, the others go back. Until one is taken they are kept for
//    him (Hero.laidOut), and laid out again each time he comes into the camp.

import type { Item, WordId } from './types';
import { DEEP_WORD_IDS } from './types';

export const QUESTS1115 = { on: false };

/** Where the hero stands in a quest of these: asked; carrying the thing; brought. */
export type Step1115 = 'asked' | 'got' | 'given';

/** What of these lies on the floor as a drop ('quest' drops): one of the three pages, or the clapper. */
export type QuestThing = 'page' | 'clapper';

export const PAGES = {
  /** How near the hero walks to the Crier's jar to take it (tiles from its middle). */
  jarReach: 1.2,
  /** Tiles of the Censor's ink that must lie on the floor before a page may be laid (none wasted on a clean floor). */
  least: 4,
};

/** The three fully modded rares the armourer lays out, and how far apart, before him (tiles). */
export const CLAPPER_REWARD = {
  slots: ['gloves', 'boots', 'helm'] as const,
  apart: 1.6,
  before: 1.8,
};

/** The jar's reward: one of the city's words (the main chat's pick, his to change). */
export function jarWords(): readonly WordId[] {
  return DEEP_WORD_IDS;
}

/** How many of the three pages a hero has taken (Hero.pages, a bit each: 1 the Palimpsest's, 2 the Physician's, 4 the stacks'). */
export function pagesTaken(bits: number | undefined): number {
  const b = bits ?? 0;
  return (b & 1) + ((b >> 1) & 1) + ((b >> 2) & 1);
}

/** The pages a hero still has in hand on this floor: taken, less those laid here. */
export function pagesInHand(bits: number | undefined, used: number | undefined): number {
  return Math.max(0, pagesTaken(bits) - (used ?? 0));
}

/** A kept offer, as read from a save: up to three items, each through `clean`. */
export function cleanOffer(v: unknown, clean: (it: Item) => Item): Item[] | undefined {
  if (!Array.isArray(v)) return undefined;
  const out = v.filter((it) => !!it && typeof it === 'object').slice(0, 3).map((it) => clean(it as Item));
  return out.length ? out : undefined;
}

export const QUEST1115_TEXT = {
  jarAsk: 'The mystic: "Every voice in this city is gone, and I cannot hear a thing in it. The Silent Order bottles what it steals. Bring me one of their jars from the sewers, and let us hear what it says."',
  jarAskPrompt: 'Mystic: a task',
  jarHere: 'Find the Crier\'s voice.',
  jarGot: 'You take the CRIER\'S VOICE.',
  jarLabel: 'The Crier\'s voice',
  jarGivePrompt: 'Mystic: the Crier\'s voice',
  jarGiven: (word: string) => `The mystic uncorks the jar. The Crier: "They bind our words into a book in the library. The Censor strikes out every page but those written before the Hush. Three survive: one under the Palimpsest, one in the Physician's ledger, one chained in the stacks." She gives you ${word}.`,
  pagesHere: (_floor: number) => 'An unstruck page is on this floor.',
  pageGot: (k: number) => `UNSTRUCK PAGE (${k} of 3).`,
  pageLabel: 'Unstruck page',
  pagePrompt: (left: number) => `Unstruck page: wipe away the ink (${left} left)`,
  pageLaid: (left: number) => `The page drinks up his ink (${left} left).`,
  clapperAsk: 'The armourer: "The Silent Order tore the clappers out of every bell in the city. A bell with no tongue. If you ever get one ringing again, bring me what\'s left of it."',
  clapperAskPrompt: 'Armourer: a task',
  clapperGot: 'You take the CLAPPER.',
  clapperLabel: 'Bell clapper',
  clapperGivePrompt: 'Armourer: the clapper',
  clapperGiven: 'The armourer hangs the clapper in the camp\'s bell, and it rings. "For your trouble. Take your pick of the three."',
  offerAgain: 'Your pick is laid out by the forge.',
  offerTaken: 'The armourer takes the others back.',
};
