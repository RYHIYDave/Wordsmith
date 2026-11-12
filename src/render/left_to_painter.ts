// A FRAME LEFT TO THE PAINTER: reading a figure's frames where the game is played without painting one there as it is shown, and
// a figure's death wherever its art keeps it. (Here, not in art/kit.ts or art/bestiary.ts: those are in the bakes' own code, and
// a change to them is a new bake: tools/bake_monsters.mjs monsterBakeCode.)

import { LEFT_TO_PAINTER } from '../art/kit';
import type { AnimSet } from '../art/actor_types';
import type { Sprite } from '../engine/px';

/** Whether frame `i` of a list is painted already (reading it will not paint it: art/kit.ts lazyFrames). A list that is not lazy is all painted. */
export function isPainted(list: readonly Sprite[], i: number): boolean {
  const d = Object.getOwnPropertyDescriptor(list, i);
  return !!d && 'value' in d && !!d.value;
}

/**
 * Read frames of a list the painter is painting (render/painter.ts) with what is not painted yet left to it: a frame not painted
 * yet is the nearest of its list that is (art/kit.ts LEFT_TO_PAINTER), never painted where the game is played as it is shown, as
 * a fallen monster's are (render/render.ts fallenSprite). `left` false: read as ever.
 */
export function leftToPainter<T>(left: boolean, read: () => T): T {
  if (!left) return read();
  const was = LEFT_TO_PAINTER.on;
  LEFT_TO_PAINTER.on = true;
  try {
    return read();
  } finally {
    LEFT_TO_PAINTER.on = was;
  }
}

/**
 * A FIGURE'S DEATH, seen one way round: its `die`, or where one of the descent's figures keeps its death among its moves for its
 * effects to play and has no `die` of its own (the Carrion Queen's fall off the eyrie: art/act1_figs/queen.ts, `fall`), that.
 * What the painter paints first as a boss nears its end (render/painter.ts dieFirst). Found 12 Nov 2026 (the queue's
 * fix-boss-death-stall-and-rime-shade): the Queen's fall was never painted first, and was painted where the game is played as it
 * was shown, three seconds of painting in the five after she died.
 */
export function deathOf(set: AnimSet): Sprite[] | undefined {
  const die = set.clips?.die?.frames;
  if (die && die.length) return die;
  const fall = set.clips?.moves?.fall?.frames;
  return fall && fall.length ? fall : die;
}
