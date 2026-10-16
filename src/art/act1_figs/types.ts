// ACT 1, THE DESCENT: A KIND'S PICTURES AS THE GAME HOLDS A MONSTER'S (art/bestiary.ts): the art chat's, each
// with his yes, through the maker it hands over ("makeXArt(), as the game holds a monster").

import type { ActorArt } from '../actor_types';

export interface Act1Fig {
  /** Its pictures: stand (idle), walk, and its clips (attack, die, reel, and its moves by name, which its acts name). Made the first time it is asked for. */
  make(): ActorArt;
  /** How big it stands, in game pixels from the floor point under it (art/bestiary.ts FIGURE_SIZE): the top of its head, and half its width at the body. */
  size: { top: number; half: number };
  /** Heavy to paint and to hold (a boss): made for its floor, let go of after (art/bestiary.ts HEAVY_FIGURES). */
  heavy?: boolean;
  /** The art chat's switches for it (each off while it was a mock-up): on while it is in the game. */
  switches?: readonly { on: boolean }[];
}
