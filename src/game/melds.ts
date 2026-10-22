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
import { MELD_IDS, MELD_OF, RANK_IDS, RANK_OF, VOLT_MELD_IDS, WORD_IDS } from './types';
import type { Meta } from './state';
import type { BaseWordId, MeldId, RankId, WordId } from './types';

export const MELD = { on: true };

/**
 * RANK II, behind this switch (off): two of the same damage word melded at the wordsmith make that word at
 * rank II (Poison and Poison, Poison II). The owner, 18 Oct 2026, 08:49: "Please add the second level
 * (poison+poison) melding into the game"; to the planning chat's reading of it, 08:56: "Yep go". As read
 * (his rank rules of 5 and 6 Oct 2026: two of a word to rank up, rank V the top, each rank half the word
 * again): the five damage words; rank II only, for now; half as strong again as the word, the attribute
 * adding on top as now; a meld's runedust (his gold fee rising with rank comes with ranks III to V); like
 * a melded word, on attacks only (not gear, the gate or the Lexicon); a ranked word melds no further.
 * With it off nothing of this can be had, and the game is as it was.
 */
// (ON, Version 23.7: his yes to the planning chat, 18 Oct 2026, 09:32 Pacific, “Yes”, to Poison II as shown; and to putting it in,
// to the main chat, 21 Oct 2026, “Yes, put it in (Recommended)”)
export const RANK2 = { on: true };

/**
 * VOLATILE'S MELDS, behind this switch (ON since Version 23.9): a damage word melded with Volatile, the five of his page "Wordsmith: Word
 * Combinations" left out on 13 Oct 2026 by his pick “Only damage words meld”. His words to the main chat, 21 Oct 2026 (Pacific),
 * 19:29: “Can you also add the volatile melds”; 19:30: “We have info on them but I’d like them to be in the game”. Their rules as
 * his page has them (MELD_TUNE below, starting points); their looks the art chat's to draw (his pick by 19:31: “The art chat
 * (Recommended)”), pictures to him first. To a video of the five from the game, with their looks, asked to put them live with
 * Binding as Version 23.9, his words to the main chat by 07:46, 22 Oct: “Yes, put them live (Recommended)”. Off, none of them can
 * be made, and the game is as it was before.
 */
export const VOLT_MELDS = { on: true };

/** RANK II's numbers: how much each rank past the first adds of the word's own figure (half: II is one and a half times the word). */
export const RANK_TUNE = { step: 0.5 };

/** HAND_IN (game/defs.ts): the wordsmith's prompt beside him with the Meldstone. */
export const MELD_HAND_IN = 'Give the Meldstone';

/**
 * THE MELDSTONE BURSTS UP OUT OF THE FLESHMANCER'S PIT (its pictures: art/meld_drops.ts, behind MELD_DROPS,
 * on; main.ts sets `on` from it). With it on: his runedust and the Meldstone wait under the floor while he
 * is dragged down (his death, 3.0 s; the pit grinds shut from 2.75), the Meldstone `wait` seconds and the
 * runedust `dustWait`, then burst up where he fell; and the Meldstone cannot be taken for `stands` seconds
 * while it rises and comes down to hang. Off, they drop at once, as before.
 */
export const STONE_RISE = { on: true, wait: 2.6, dustWait: 2.75, stands: 1.2 };

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
  // VOLATILE'S MELDS (behind VOLT_MELDS): the kill's explosion is Volatile's (game.ts kill), its rune Volatile's (addRune). Each
  // rune's `wait` (seconds before it goes off; Volatile's own 1.2) is what the art chat's pictures want of it (render/volatile3.ts VRUNE).
  /** DEMOLITION in front: the explosions this much bigger, across and in harm; an elite or a boss explodes once at half its life, for this share of the kill's. Behind: one rune at a time, this much wider, this much harder, and slow to go off. */
  demolition: { bigger: 1.5, half: 0.5, runeWide: 2, runeHard: 2, wait: 2.4 },
  /** POWDERKEG in front: a burning one killed explodes this much harder, and its blast sets what it strikes burning (its burn this share of the blast a second, for so long). Behind: the rune leaves burning ground, this share of its blast a second, for so long. */
  powderkeg: { burning: 1.5, burn: 0.3, burnSecs: 3, ground: 0.25, groundSecs: 4, wait: 1.4 },
  /** SHATTER in front: a frozen one killed bursts into shards, this share of its life to each one this near. Behind: the rune freezes what is in it this far through its wait. */
  shatter: { share: 0.25, reach: 2.2, freezeAt: 0.4, wait: 1.4 },
  /** CHAIN REACTION in front: an explosion sends arcs to this many of the nearest within this reach, each this share of the explosion. Behind: a rune going off sets off the nearest other of the hero's own within `linkReach`, this long after, and that one the next, and so on. */
  chainreaction: { arcs: 3, reach: 3.5, share: 0.5, next: 0.12, linkReach: 6, wait: 1.2 },
  /** RUPTURE in front: a poisoned one killed bursts, its poison splashed on each one this near at this share of its poison. Behind: the rune bursts into a poison cloud, this share of its blast a second. */
  rupture: { reach: 2.0, share: 1, cloud: 0.25, wait: 1.3 },
};

/**
 * The words a hero and the Lexicon keep a count of: with MELD off the thirteen there were before the
 * melded words (so a hero, a save and everything that looks over a hero's words are as they were),
 * with it on all twenty-three. (Where MELD is switched on with a hero already made, as the tests and
 * the pictures do, a melded word's count is made when it is first needed: `meldWords`.)
 */
export function wordIds(): readonly WordId[] {
  if (!MELD.on) return WORD_IDS;
  // (VOLATILE'S MELDS, with VOLT_MELDS on)
  const melds = VOLT_MELDS.on ? [...MELD_IDS, ...VOLT_MELD_IDS] : MELD_IDS;
  return RANK2.on ? [...WORD_IDS, ...melds, ...RANK_IDS] : [...WORD_IDS, ...melds];
}

/** Is this word a ranked one (rank II)? */
export function isRank(w: WordId): w is RankId {
  return WORDS[w].kind === 'rank';
}

/** The word a ranked word is a rank of, or the word itself. */
export function rankBase(w: WordId): WordId {
  return isRank(w) ? RANK_OF[w].word : w;
}

/** A word's rank: 2 for a rank II word, 1 for any other. */
export function rankOf(w: WordId): number {
  return isRank(w) ? RANK_OF[w].rank : 1;
}

/** The word one rank up from this one, or null (not a damage word, or already as high as ranks go for now). */
export function rankUp(w: WordId): RankId | null {
  for (const r of RANK_IDS) if (RANK_OF[r].word === (w as BaseWordId) && RANK_OF[r].rank === rankOf(w) + 1) return r;
  return null;
}

/** Is this word a melded one? */
export function isMeld(w: WordId): w is MeldId {
  return WORDS[w].kind === 'meld';
}

/** A damage word or a melded one: what takes a side's one damage-word place. */
export function isDamageWord(w: WordId): boolean {
  const k = WORDS[w].kind;
  return k === 'damage' || k === 'meld' || k === 'rank';
}

/** The words a word does the work of: a melded word's two, or the word itself. */
export function partsOf(w: WordId): readonly WordId[] {
  return isMeld(w) ? MELD_OF[w] : isRank(w) ? [RANK_OF[w].word] : [w];
}

/**
 * The words on one side of an attack as its rules and looks go by them: each melded word, and after
 * it the two words it does the work of (so a hit with Eruption in front is a hit with Power and Flame).
 */
export function withParts(side: readonly (WordId | null)[]): WordId[] {
  const out: WordId[] = [];
  // (RANK II: a ranked word looks and acts as its word; how much stronger is the rules' business, words.ts)
  for (const w of side) if (w !== null) out.push(...(isMeld(w) ? [w, ...MELD_OF[w]] : isRank(w) ? [RANK_OF[w].word] : [w]));
  return out;
}

/** What two words make when melded, or null if they don't meld (a shaping word, a melded word; the same word twice, unless RANK2 is on: then that word a rank up). */
export function meldOf(a: WordId, b: WordId): MeldId | RankId | null {
  if (a === b) return RANK2.on && WORDS[a].kind === 'damage' ? rankUp(a) : null;
  for (const m of VOLT_MELDS.on ? [...MELD_IDS, ...VOLT_MELD_IDS] : MELD_IDS) {
    const [x, y] = MELD_OF[m];
    if ((x === a && y === b) || (x === b && y === a)) return m;
  }
  return null;
}

/** Why two words can't be melded, or null if they can. */
export function meldProblem(a: WordId | null, b: WordId | null): string | null {
  if (!a || !b) return 'Two words go in';
  if (RANK2.on && (isRank(a) || isRank(b))) return a === b ? 'Rank II is the top, for now' : 'A ranked word melds no further';
  if (a === b && !RANK2.on) return 'Two different words';
  if (isMeld(a) || isMeld(b)) return 'A melded word melds no further';
  // (VOLATILE'S MELDS: with VOLT_MELDS on, Volatile melds with a damage word too)
  const volt = VOLT_MELDS.on && ((a === 'volatile' && WORDS[b].kind === 'damage') || (b === 'volatile' && WORDS[a].kind === 'damage'));
  if (!volt && (WORDS[a].kind !== 'damage' || WORDS[b].kind !== 'damage')) return VOLT_MELDS.on ? 'Only damage words and Volatile meld' : 'Only damage words meld';
  return meldOf(a, b) ? null : 'These do not meld';
}

/** What of a record of words is written to a save: with MELD off, nothing of the melded words, so a save is as it was before them. */
export function savedWords<T>(rec: Record<WordId, T>): Record<WordId, T> {
  if (MELD.on && RANK2.on && VOLT_MELDS.on) return rec;
  const out: Partial<Record<WordId, T>> = { ...rec };
  // (VOLATILE'S MELDS: with VOLT_MELDS off, nothing of them)
  if (!MELD.on || !VOLT_MELDS.on) for (const m of VOLT_MELD_IDS) delete out[m];
  if (MELD.on && RANK2.on) return out as Record<WordId, T>;
  if (!MELD.on) for (const m of MELD_IDS) delete out[m];
  // (RANK II: with RANK2 off, nothing of the ranked words either)
  for (const r of RANK_IDS) delete out[r];
  return out as Record<WordId, T>;
}

/** The Lexicon and stash as written to a save (savedWords on its words). */
export function savedMeta(meta: Meta): Meta {
  if (MELD.on && RANK2.on) return meta;
  if (MELD.on) return { ...meta, lexicon: savedWords(meta.lexicon), known: savedWords(meta.known) };
  const { meld: _m, ...rest } = meta;
  return { ...rest, lexicon: savedWords(meta.lexicon), known: savedWords(meta.known) };
}
