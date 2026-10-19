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
  /**
   * (ACT 2, THE HUSH) ITS OTHER LOOKS: a kind the art chat drew in more than one (the Hushed townsfolk's crowd, the porter
   * its own and the goodwife and the baker these; the Hushed watch's sergeant). Each is a figure of its own, named for
   * its kind and its look (Act1Look: look `n` is `${kind}${n}`, its pictures `looks[n - 1]`), as the Chained One's forms
   * are 'chained1' and 'chained2'; which look one of them has is Monster.form, given by its rules as it comes into the
   * world (Act1Rules.spawned), and art/bestiary.ts figureOf shows it so.
   */
  looks?: readonly Act1Fig[];
}

/** (ACT 2, THE HUSH) The figures of the kinds' other looks (Act1Fig.looks): the Hushed goodwife and baker, the watch's sergeant. */
export type Act1Look = 'hushed1' | 'hushed2' | 'watch1';
