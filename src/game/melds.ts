// WORDMELDING: two damage words fused at the wordsmith into one melded word.
//
// His plan, 12 Oct 2026, 17:21 (the planning chat): "Oh and let’s have the last room, if that’s either
// a boss or some really hard mobs drop some sort of runedust that you use to wordmeld.  And we’ll add a
// drop to the cultist boss that opens the wordmeld menu at the wordsmith.  And we’ll have to add in the
// melded words that we have so far". The melded words and their rules are his page "Wordsmith: Word
// Combinations" and his answers to it (his doc "Wordsmith Act 1: The Descent", "Wordmelding"): two words
// and runedust go in and one melded word comes out, both words used up; it does what both words did,
// and a twist of its own, in front and behind; no recipes are shown, every melded word is found by
// trying; a melded word can't be melded again; for now on attacks only, and only from the wordsmith.
// His picks of 13 Oct 2026, 12:36 (asked as pop-ups, after "Can you begin adding the melded words?" at
// 12:15): a melded word takes its side's one damage-word place ("Yes, it takes that place
// (Recommended)"); only damage words meld ("Only damage words meld": Volatile's five are left out);
// until the strongholds of floors 6 to 10 are built only the fleshmancer drops runedust ("Only the
// fleshmancer drops it"); his drop that opens melding is the Meldstone ("The Meldstone (Recommended)").
//
// All of it behind MELD, which is off: with it off nothing of this can be had, and the game is as it was.
// The numbers below are starting points, to be tuned once he has played them.

import { WORDS } from './defs';
import { ALL_WORD_IDS, MELD_IDS, MELD_OF, WORD_IDS } from './types';
import type { Meta } from './state';
import type { MeldId, WordId } from './types';

export const MELD = { on: true };

/** HAND_IN (game/defs.ts): the wordsmith's prompt beside him with the Meldstone. */
export const MELD_HAND_IN = 'Give the Meldstone';

/**
 * THE MELDSTONE BURSTS UP OUT OF THE FLESHMANCER'S PIT (its pictures: art/meld_drops.ts, behind MELD_DROPS,
 * off; main.ts sets `on` from it). With it on: his runedust and the Meldstone wait under the floor while he
 * is dragged down (his death, 3.0 s; the pit grinds shut from 2.75), the Meldstone `wait` seconds and the
 * runedust `dustWait`, then burst up where he fell; and the Meldstone cannot be taken for `stands` seconds
 * while it rises and comes down to hang. Off, they drop at once, as before.
 */
export const STONE_RISE = { on: false, wait: 2.6, dustWait: 2.75, stands: 1.2 };

/** The colour runedust is told in (what glows on a friend is cyan, his rule). */
export const MELD_DUST_COLOR = '#5ce8f8';

export const MELD_TUNE = {
  /** Runedust a meld costs. */
  cost: 1,
  /** Runedust the fleshmancer drops each time he dies (his pick: only he drops it, for now). */
  fleshmancerDust: 3,
  /** ERUPTION in front: the molten pool its blast leaves (radius in tiles; burns for this share of the hit a second; seconds). Behind: heat, one a hit, and at full heat the next hit erupts round what it struck for this share of the hit. */
  eruption: { pool: 0.9, poolDps: 0.3, poolDur: 3, heat: 5, blast: 1.5, blastR: 2.0 },
  /** AVALANCHE in front: how far it shoves (tiles); one shoved into a wall or another is frozen. Behind: a hit on a chilled enemy, this much more. */
  avalanche: { shove: 1.2, chilled: 0.3 },
  /** THUNDER in front: no arcs; the one bolt this much harder, and it stuns this long. Behind: every so many hits, a thunderclap round the hero for this share of the hit. */
  thunder: { bolt: 0.5, stun: 0.5, every: 4, clap: 0.8, clapR: 2.4 },
  /** BLIGHT in front: the poison bites up to this many times harder as the enemy's life runs out. Behind: a poisoned enemy it has touched takes this much more from everything, for so long. */
  blight: { most: 2, more: 0.2, secs: 5 },
  /** SCALD in front: the crack, this share of the hit, no more often than this on one enemy. Behind: steam, hurting for this share a second and slowing; the hero standing in it is hidden, nothing sees him to attack. */
  scald: { crack: 0.6, again: 1, steamDps: 0.25, slow: 0.3, dur: 4 },
  /** WILDFIRE behind: the burning ground throws a spark this far, this often, for this share of the hit. */
  wildfire: { reach: 2.5, every: 0.6, spark: 0.3 },
  /** FUMES in front: the toxic cloud of an enemy both burning and poisoned (radius, seconds, no more often than this on one). Behind: the cloud explodes for this many seconds' worth of its poison when anything burning comes into it. */
  fumes: { cloud: 1.5, dur: 3, again: 2, blast: 4 },
  /** HAILSTORM in front: a frozen enemy passes the arc on to this many more. Behind: the storm slows by this much. */
  hailstorm: { passOn: 1, slow: 0.4 },
  /** FROSTBITE in front: a chilled enemy loses this share of the hit a second while chilled, a frozen one twice that. */
  frostbite: { bite: 0.15 },
  /** CONTAGION behind: the cloud's shock, this many times its poison, every half second, to one in it. */
  contagion: { shock: 2 },
};

/**
 * The words a hero and the Lexicon keep a count of: with MELD off the thirteen there were before the
 * melded words (so a hero, a save and everything that looks over a hero's words are as they were),
 * with it on all twenty-three. (Where MELD is switched on with a hero already made, as the tests and
 * the pictures do, a melded word's count is made when it is first needed: `meldWords`.)
 */
export function wordIds(): readonly WordId[] {
  return MELD.on ? ALL_WORD_IDS : WORD_IDS;
}

/** Is this word a melded one? */
export function isMeld(w: WordId): w is MeldId {
  return WORDS[w].kind === 'meld';
}

/** A damage word or a melded one: what takes a side's one damage-word place. */
export function isDamageWord(w: WordId): boolean {
  const k = WORDS[w].kind;
  return k === 'damage' || k === 'meld';
}

/** The words a word does the work of: a melded word's two, or the word itself. */
export function partsOf(w: WordId): readonly WordId[] {
  return isMeld(w) ? MELD_OF[w] : [w];
}

/**
 * The words on one side of an attack as its rules and looks go by them: each melded word, and after
 * it the two words it does the work of (so a hit with Eruption in front is a hit with Power and Flame).
 */
export function withParts(side: readonly (WordId | null)[]): WordId[] {
  const out: WordId[] = [];
  for (const w of side) if (w !== null) out.push(...(isMeld(w) ? [w, ...MELD_OF[w]] : [w]));
  return out;
}

/** What two words make when melded, or null if they don't meld (the same word twice, a shaping word, a melded word). */
export function meldOf(a: WordId, b: WordId): MeldId | null {
  if (a === b) return null;
  for (const m of MELD_IDS) {
    const [x, y] = MELD_OF[m];
    if ((x === a && y === b) || (x === b && y === a)) return m;
  }
  return null;
}

/** Why two words can't be melded, or null if they can. */
export function meldProblem(a: WordId | null, b: WordId | null): string | null {
  if (!a || !b) return 'Two words go in';
  if (a === b) return 'Two different words';
  if (isMeld(a) || isMeld(b)) return 'A melded word melds no further';
  if (WORDS[a].kind !== 'damage' || WORDS[b].kind !== 'damage') return 'Only damage words meld';
  return meldOf(a, b) ? null : 'These do not meld';
}

/** What of a record of words is written to a save: with MELD off, nothing of the melded words, so a save is as it was before them. */
export function savedWords<T>(rec: Record<WordId, T>): Record<WordId, T> {
  if (MELD.on) return rec;
  const out: Partial<Record<WordId, T>> = { ...rec };
  for (const m of MELD_IDS) delete out[m];
  return out as Record<WordId, T>;
}

/** The Lexicon and stash as written to a save (savedWords on its words). */
export function savedMeta(meta: Meta): Meta {
  if (MELD.on) return meta;
  const { meld: _m, ...rest } = meta;
  return { ...rest, lexicon: savedWords(meta.lexicon), known: savedWords(meta.known) };
}
