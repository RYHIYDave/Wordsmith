// THE TWO MODES. The owner's gameplay rulebook (approved 8 Oct 2026, 10:33: "Yes, as it is
// (Recommended)"; docs/gameplay/RULEBOOK.md, "Heroes, death and the two modes"): "Every hero is
// made in one of two modes, picked at the start and kept for life."
//   NORMAL    a death wakes the hero in town. Lost: what was found in that dungeon, and a share of
//             the gold. Kept: the hero's level, the gear worn in, the words, the talents.
//   HARDCORE  a death loses the hero; the Lexicon, the stash and the unlocks stay for the next.
//             Until now the game's only rule (`die` in game/game.ts).
// His order, 8 Oct, 10:33: after the traps, "Normal mode (Recommended)".
// PICTURES FIRST (CLAUDE.md): he was sent its pictures at 13:34 (normal_cards.png, normal_fell.png,
// normal_town.png, made by tools/scenarios/modes_look.mjs), with "Put Normal mode into the game, as
// in the pictures?" and "How much of your own gold should a Normal death cost? (On top of
// everything found in that dungeon.)". HIS ANSWERS, 13:35: "Yes, as it is (Recommended)" and "A
// quarter (Recommended)". In the game from Version 19.1. With MODES.on false every hero is made,
// and dies, as before.

export type HeroMode = 'normal' | 'hardcore';
export const HERO_MODES: readonly HeroMode[] = ['normal', 'hardcore'];

/** The switch: the class cards offer the two modes, and a Normal hero who dies wakes in town. On, on his yes (13:35). */
export const MODES = { on: true };

export const NORMAL = {
  /**
   * The share of the gold carried INTO the dungeon that a Normal death costs, besides all that was
   * found there (gold too). His answer, 8 Oct 2026, 13:35: "A quarter (Recommended)".
   */
  goldShare: 0.25,
};

/**
 * A hero saved before there were modes (no mode in the save): Normal. Nobody loses a hero to a
 * rule they never picked.
 */
export const MODE_BEFORE: HeroMode = 'normal';

/** What the class cards say of each mode, under the cards. */
export const MODE_LINE: Record<HeroMode, string> = {
  normal: 'Normal: a death sends the hero back to town, without what was found in that dungeon.',
  hardcore: 'Hardcore: a death is the end of the hero. The Lexicon and the stash stay.',
};
