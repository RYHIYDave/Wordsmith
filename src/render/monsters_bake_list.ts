// THE FLOORS' MONSTERS BAKED: WHAT IS BAKED, AND THE SHAPE OF ITS FILES (render/monsters_baked.ts says why, and takes them in).
// Kept apart from the taking in so that the bake's page (src/dev/bake_monsters_page.ts), whose code is the bake's mark, holds
// only what says which pictures are made: a change to how the game takes them in is no new bake.

import { FIRST5_FIGURES, MONSTER_FIGURES, NEW_FIGURES, framesOf } from '../art/bestiary';
import type { MonsterFigure } from '../art/bestiary';
import type { ActorArt } from '../art/actor_types';
import type { Sprite } from '../engine/px';
import { COLOSSUS } from '../game/colossus_fight';

/**
 * THE FIGURES THAT ARE BAKED: every one the bestiary has pictures of its own for (art/bestiary.ts: Version 14's, the new
 * monsters, the first five floors', the descent's, the Hush's and the High City's, each kind's other looks, and the bone
 * mite). The bake's page and the game both go by this list, so the game asks only for files that were made.
 * NOT THE DROWNED EYE while the Swamp Colossus is floor 10's boss (game/colossus_fight.ts COLOSSUS): the Colossus and his arms
 * are monsters of the eye's kind, drawn from his own baked pictures (render/colossus_baked.ts), and the eye's own (676 frames,
 * 320 MB, art/act1_figs/eye.ts) are never shown.
 * NOR ONE TOO BIG TO HOLD WHOLE (`TOO_BIG`): it is left as it was, painted beside the game a frame at a time.
 */
export function bakedFigures(): MonsterFigure[] {
  const all: MonsterFigure[] = [...MONSTER_FIGURES, ...NEW_FIGURES, ...FIRST5_FIGURES, 'mite'];
  return all.filter((f, i) => all.indexOf(f) === i && !(f === 'eye' && COLOSSUS.on) && !TOO_BIG.includes(f));
}

/**
 * THE MOST OF ONE FIGURE'S PICTURES THAT IS TAKEN IN AT ONCE, megabytes in hand (four bytes a pixel): a baked figure comes
 * whole, under the loading screen, where the painter's worker hands its frames over one after another. The bake's tool
 * (tools/bake_monsters.mjs) stops at a figure over this, to be named in `TOO_BIG`. As measured at the bake of 11 Nov 2026: the
 * Carrion Queen 387 and the Flame Unfinished 380, the two biggest under it (each is in hand whole today too, a minute or two
 * after its floor is come into, from the painter); the others' bosses 20 to 125; a floor's ordinary kinds 1 to 15 each.
 */
export const HOLD_MOST_MB = 400;
/**
 * TOO BIG TO HOLD WHOLE: THE MOTH, floor 20's (art/act1_figs/moth.ts: 1,304 frames of up to 832 by 824, 1,984 MB in hand were
 * they all held). Not baked, not taken in: as before.
 */
export const TOO_BIG: readonly MonsterFigure[] = ['moth'];

/** A figure's name as its files have it ('fieldhand:1', a kind's other look, is fieldhand_1): <name>.json, <name>-<n>.png. */
export function bakeName(figure: MonsterFigure): string {
  return figure.replace(':', '_');
}

/** The lengths of a figure's lists, the front's then the back's (to know the baked pictures are of the figure as the game has it now). */
export function figureLens(art: ActorArt): number[][] {
  return [framesOf(art.front), framesOf(art.back)].map((lists) => lists.map((l) => l.length));
}

/** A figure's file: its sheets, its frames on them, and where each frame goes. */
export interface MonsterBakeFile {
  mark: string;
  figure: string;
  /** Each sheet's file (a PNG), beside this one. */
  sheets: string[];
  /** Each frame: [sheet, x, y, width, height, the index of its other parts in `parts`]. */
  frames: [number, number, number, number, number, number][];
  /** A frame's other parts (Sprite without its picture: its size, anchor, lights...), shared by the frames that have the same. */
  parts: Omit<Sprite, 'img'>[];
  /** The lengths of the figure's lists as they were baked, the front's then the back's (figureLens). */
  lens: number[][];
  /** Where its frames go, flat, as: which way round, which list, which frame (art/bestiary.ts paintOrder), the frame's index; in the order they are wanted. */
  at: number[];
}
