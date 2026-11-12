// THE TEN NEW WORDS' SOUNDS: the sound chat's SIXTH BATCH (assets/sound/README.md, "Sixth batch: the ten new words"; his word in
// the sound chat, 9 Nov 2026, by 20:20 Eastern, shown them on try-out 11: “All good, hand over (Recommended)”). 26 sounds, two
// takes each (<name>_1, _2: engine/audio.ts sfxNamed), each made to begin with its event, its big moment on the art chat's beat.
// Here: the switch, each sound's loudness and the least time between two of it, and which word's each is (so that a word's
// sounds are fetched as it comes into play: wordSoundsOf). The rules play them at their moments (game/game.ts `wordRec`); two are
// the pictures' own moments and are played as the looks say (render/words7.ts soundsW7: the mirror's pane growing up; main.ts);
// the Lexicon's page turn is the Lexicon's (ui/lexicon28.ts, main.ts).
//
// THE THREE (Lasting, Fleeting, Vast) are recorded 3 to 4 dB quieter on purpose, to lie on top of the sound of the ability they
// change: their `vol` is 1.

import type { WordId } from './types';

/** The switch: off, the ten new words make no sound of their own (as on the branch they were built on). */
export const WORD_SOUNDS = { on: true };

interface WordSoundDef {
  /** The word whose sound it is. */
  word: WordId;
  /** How loud, before its take's own level (engine/audio.ts RECORDED_GAIN). */
  vol: number;
  /** The least time between two of it, seconds (a flurry is not a din). */
  gap: number;
}

export const WORD_SOUND = {
  // PIERCING: in front, the bolt through what it pierces (`pierceLine`); behind, the lance: light along the crack, the spear at 0.5 s (`lance`)
  pierce_shot: { word: 'piercing', vol: 0.8, gap: 0.12 },
  pierce_lance: { word: 'piercing', vol: 0.9, gap: 0.3 },
  // BLEEDING: a wound opening (`bleedOn`; `heroBleed`, a monster's slash on him); the briars bursting up (the zone 'thorns' laid); one walking in them cut (no more than three a second)
  bleed_open: { word: 'bleeding', vol: 0.7, gap: 0.15 },
  bleed_thorns: { word: 'bleeding', vol: 0.8, gap: 0.25 },
  bleed_cut: { word: 'bleeding', vol: 0.55, gap: 0.34 },
  // REAPING: a soul torn out and taken (`reapSoul`); the little grey Shade rising (`spirit`; rising away, softer); its claw rake (`spiritHit`); a corpse lurching up (`rise`)
  reap_soul: { word: 'reaping', vol: 0.7, gap: 0.5 },
  reap_spirit: { word: 'reaping', vol: 0.8, gap: 0.4 },
  reap_rake: { word: 'reaping', vol: 0.6, gap: 0.12 },
  reap_rise: { word: 'reaping', vol: 0.9, gap: 0.3 },
  // CULLING: the scythe's sweep (`culled`: the monster's own death sound still plays after it); the reaper's mark taking one (`culled` with `mark`); a monster's fire kindling as he comes low
  cull_kill: { word: 'culling', vol: 0.9, gap: 0.2 },
  cull_mark: { word: 'culling', vol: 0.9, gap: 0.2 },
  cull_kindle: { word: 'culling', vol: 0.8, gap: 3 },
  // SURGING: his shockwave, and out of his dodge (`surge`); a monster's warning ring, its beat quickening; that monster's wave, as its warning ends
  surge_wave: { word: 'surging', vol: 0.9, gap: 0.2 },
  surge_warn: { word: 'surging', vol: 0.8, gap: 0.3 },
  surge_foe: { word: 'surging', vol: 0.9, gap: 0.2 },
  // PLUNDERING: coins spraying (`goldSpray`, `goldBurst`; and out of one that dies carrying his gold); gold arcing into his purse (`goldBurst`); coins snatched (`goldStolen`)
  plunder_spray: { word: 'plundering', vol: 0.7, gap: 0.25 },
  plunder_stream: { word: 'plundering', vol: 0.7, gap: 0.5 },
  plunder_steal: { word: 'plundering', vol: 0.9, gap: 0.3 },
  // MIRRORING: his reflection's glass swing (`reflection`; the pane's, `mirrorCast`); the pane growing up (the look's moment), his reflection forming, softer (`reflection`); the pane cracking and shattering (after `mirrorCast`); a monster cracking like a mirror, the shards flying back (`mirrorBack`)
  mirror_swing: { word: 'mirroring', vol: 0.7, gap: 0.15 },
  mirror_rise: { word: 'mirroring', vol: 0.8, gap: 0.2 },
  mirror_break: { word: 'mirroring', vol: 0.9, gap: 0.2 },
  mirror_back: { word: 'mirroring', vol: 0.9, gap: 0.3 },
  // THE THREE, on top of the ability they change: a long shimmer as Lasting extends something; Fleeting's quick rising flick; Vast's broad whoomph (and a monster's Vast warning, softer)
  word_lasting: { word: 'lasting', vol: 1, gap: 1.6 },
  word_fleeting: { word: 'fleeting', vol: 1, gap: 0.6 },
  word_vast: { word: 'vast', vol: 1, gap: 0.5 },
} as const satisfies Record<string, WordSoundDef>;

export type WordSound = keyof typeof WORD_SOUND;
export const WORD_SOUND_NAMES = Object.keys(WORD_SOUND) as WordSound[];

/** How much softer the second of a sound's two uses is: his reflection forming (the pane's rise is the first), the Shade rising away, a monster's Vast warning. */
export const WORD_SOUND_SOFT = { reflection: 0.7, spiritAway: 0.5, vastWarn: 0.6 } as const;

/**
 * WHEN, after its event, a sound that waits for the picture begins (seconds; the art chat's beats, render/words7.ts W7_TIME, held
 * to them by tests/words10_live.test.ts): the mirror's pane cracking and shattering, once it has made his attack again
 * (`mirrorCast`, then its `cast`); and how long before the rules stand a monster with Reaping up again its body begins to rise
 * in its picture (0.2 s of the enemy's fire catching, then its `rise`).
 */
export const WORD_AT = { mirrorBreak: 0.38, riseLead: 1.0 } as const;

/** THE LEXICON'S PAGE TURN, as one of its tabs is tapped (“As quiet as the menu sounds”: made at their level). */
export const PAGE_TURN = { name: 'page_turn', vol: 1 } as const;

/** The sounds of these words (to fetch as they come into play: what his abilities carry, what the place's monsters carry). */
export function wordSoundsOf(words: Iterable<WordId | null | undefined>): string[] {
  if (!WORD_SOUNDS.on) return [];
  const have = new Set<WordId>();
  for (const w of words) if (w) have.add(w);
  return WORD_SOUND_NAMES.filter((n) => have.has(WORD_SOUND[n].word));
}
