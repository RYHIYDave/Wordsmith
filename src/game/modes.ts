// THE TWO MODES. The owner's gameplay rulebook (approved 8 Oct 2026, 10:33: "Yes, as it is
// (Recommended)"; docs/gameplay/RULEBOOK.md, "Heroes, death and the two modes"): "Every hero is
// made in one of two modes, picked at the start and kept for life."
//   NORMAL    a death wakes the hero in town. Lost: what was found in that dungeon, and a share of
//             the gold. Kept: the hero's level, the gear worn in, the words, the talents.
//   HARDCORE  a death loses the hero; the Lexicon, the stash and the unlocks stay for the next.
//             Until now the game's only rule (`die` in game/game.ts).
// His order, 8 Oct, 10:33: after the traps, "Normal mode (Recommended)".
// PICTURES FIRST (CLAUDE.md): nothing of this is in the game until he has seen it and said yes.
// With MODES.on false every hero is made, and dies, as before.

export type HeroMode = 'normal' | 'hardcore';
export const HERO_MODES: readonly HeroMode[] = ['normal', 'hardcore'];

/** The switch: the class cards offer the two modes, and a Normal hero who dies wakes in town. */
export const MODES = { on: false };

export const NORMAL = {
  /**
   * The share of the gold carried INTO the dungeon that a Normal death costs, besides all that was
   * found there (gold too). Still open in his rulebook ("How much gold a Normal death costs"): to
   * be asked of him with the pictures.
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
