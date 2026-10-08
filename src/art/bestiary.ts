// The monsters' pictures (Version 14).
//
// The owner, 4 Oct 2026: "we need the dungeons and mobs brought up to the level of the character
// models". So every monster is painted the way the heroes are: a rig of its own, built with the
// painter's kit at the heroes' grain, that stands, walks and attacks as timelines of key poses:
//   monster_bones.ts    the skeleton and the bone archer (one set of bones)
//   monster_cultist.ts  the cultist, and the fire in its hand
//   monster_bat.ts      the cave bat
//   monster_brute.ts    the brute, and the guardian (the same beast, a third bigger, in iron)
//   monster_warden.ts   the Warden, the boss: two attacks
// What each looks like is the painting he said yes to when he chose his art style
// (previews/art_styles_1_and_6.png shows the skeleton, the cultist, the bat and the brute in it);
// the colours of what is hostile, and the two helpers every rig is put together with, are in
// mkit.ts.
//
// This file is where the game gets them: which figure a monster is shown as, how big that figure
// stands (for the bar over its head, and for a finger put on it), and the painting of frames
// ahead of need. The art of the first builds (monsters.ts, and the Warden in boss.ts) is no
// longer in the game.

import type { Sprite } from '../engine/px';
import type { MonsterKind } from '../game/types';
import type { ActorArt, AnimSet } from './actor_types';
import { makeBatArt } from './monster_bat';
import { makeArcherArt, makeSkeletonArt } from './monster_bones';
import { makeBruteArt, makeGuardianArt } from './monster_brute';
import { makeCultistArt } from './monster_cultist';
import { makeWardenArt } from './monster_warden';

/** The figures there are: one for each kind of monster, and the guardian. */
export type MonsterFigure = MonsterKind | 'guardian';
export const MONSTER_FIGURES: readonly MonsterFigure[] = ['skeleton', 'archer', 'cultist', 'bat', 'brute', 'guardian', 'warden'];

/** The figure a monster is shown as. (In the rules a guardian is a brute, and more.) */
export function figureOf(m: { kind: MonsterKind; champion: boolean }): MonsterFigure {
  return m.kind === 'warden' ? 'warden' : m.champion ? 'guardian' : m.kind;
}

/**
 * How big each figure stands, in GAME pixels from the floor point under it. `top` is the top of
 * its head (not of a club or a sword held over it): the bar of its life, its name and the rune it
 * carries hang from there. `half` is half its width at the body. A finger or a pointer inside
 * that box is on the monster. (Held against the pictures themselves in tests/monsters.test.ts.)
 */
export const FIGURE_SIZE: Readonly<Record<MonsterFigure, { top: number; half: number }>> = {
  skeleton: { top: 26, half: 9 },
  archer: { top: 28, half: 10 },
  cultist: { top: 30, half: 9 },
  bat: { top: 21, half: 12 },
  brute: { top: 28, half: 16 },
  guardian: { top: 36, half: 21 },
  warden: { top: 61, half: 22 },
};

export interface Bestiary {
  /** The pictures of a figure. (Making them is quick: a frame is painted when it is first shown.) */
  of(figure: MonsterFigure): ActorArt;
  /**
   * Paint one more frame, of one of these figures, that has not been painted yet; false when
   * they are all done. Called once each time the world is drawn with the figures in the dungeon,
   * it has their pictures ready a few seconds after the dungeon is entered, a thousandth or two
   * of a second at a time, instead of in the middle of the first fight (when five monsters that
   * begin their attacks together would each want thirty new frames).
   */
  warm(figures: ReadonlyArray<MonsterFigure>): boolean;
}

/** The last frame painted ahead of need. Kept only so that the reading of it cannot be optimised away. */
export let warmed: Sprite | undefined;

export function makeBestiary(): Bestiary {
  const made = new Map<MonsterFigure, ActorArt>();
  const of = (figure: MonsterFigure): ActorArt => {
    let art = made.get(figure);
    if (!art) {
      art =
        figure === 'skeleton' ? makeSkeletonArt()
        : figure === 'archer' ? makeArcherArt()
        : figure === 'cultist' ? makeCultistArt()
        : figure === 'bat' ? makeBatArt()
        : figure === 'brute' ? makeBruteArt()
        : figure === 'guardian' ? makeGuardianArt()
        : makeWardenArt();
      made.set(figure, art);
    }
    return art;
  };
  /**
   * For each figure, what is still to be painted, in the order it will be wanted: standing (the
   * first thing seen of a monster), walking, then its attacks from start to finish. The last of
   * `left` is the next to paint.
   */
  const todo = new Map<MonsterFigure, { left: (() => Sprite)[]; done: number }>();
  const listOf = (figure: MonsterFigure): { left: (() => Sprite)[]; done: number } => {
    let list = todo.get(figure);
    if (!list) {
      list = { left: [], done: 0 };
      const art = of(figure);
      // (and last its death: by the time one of them is killed, how it falls is painted)
      for (const pick of [(a: AnimSet) => a.idle, (a: AnimSet) => a.walk, (a: AnimSet) => a.clips?.attack?.frames ?? a.attack, (a: AnimSet) => a.clips?.heavy?.frames ?? a.heavy ?? [], (a: AnimSet) => a.clips?.die?.frames ?? []]) {
        for (const set of [art.front, art.back]) {
          const frames = pick(set);
          // (reading a frame is what paints it: see lazyFrames in kit.ts)
          for (let i = 0; i < frames.length; i++) list.left.push(() => (warmed = frames[i]));
        }
      }
      list.left.reverse();
      todo.set(figure, list);
    }
    return list;
  };
  return {
    of,
    warm(figures: ReadonlyArray<MonsterFigure>): boolean {
      // Whichever of them has had the fewest painted goes next: so all of them can stand and
      // walk (forty frames each) before any of them has every frame of its attack.
      let next: { left: (() => Sprite)[]; done: number } | null = null;
      for (const f of figures) {
        const list = listOf(f);
        if (list.left.length > 0 && (!next || list.done < next.done)) next = list;
      }
      const paint = next ? next.left.pop() : undefined;
      if (!next || !paint) return false;
      next.done++;
      paint();
      return true;
    },
  };
}
