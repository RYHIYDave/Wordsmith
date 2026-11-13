// (QUESTS1115, game/quests1115.ts) THE CENSOR'S INK, as the game asks after it: how many tiles of a level lie under it, and dry it
// all away. Set by his rules as they load (act1_rules/censor.ts), so that the game reaches them without importing his rules
// (which import the game's own: a ring of imports).
import type { Level } from './state';

export const INK = {
  /** How many tiles of the level lie under his ink, laid to stay and not drying. */
  count: (_L: Level): number => 0,
  /** All his ink lying on the level's floor dries away at once. */
  wipe: (_L: Level): void => {},
};
