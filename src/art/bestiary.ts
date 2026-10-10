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
import { MONSTERS, MONSTER_ATTACKS, NEW_MONSTERS } from '../game/defs';
import type { MonsterKind } from '../game/types';
import type { ActorArt, AnimSet } from './actor_types';
import { CRAWL_OUT } from './mkit';
import { makeBatArt } from './monster_bat';
import { makeArcherArt, makeSkeletonArt } from './monster_bones';
import { makeArcherArt3, makeSkeletonArt3 } from './monster_bones3';
import { TROLL_MOVES, makeBruteArt, makeChieftainArt, makeGuardianArt } from './monster_brute';
import { makeCultistArt, makeHighPriestArt } from './monster_cultist';
import { WARDEN_MOVES, makeWardenArt } from './monster_warden';
import { NEW_MOBS, makeBonewardArt3, makeChampionArt3, makeGolemArt3, makeMarksmanArt3, makeShadeArt3, makeSkullShotArt } from './new_mobs3';
import { PACK_MARKS } from '../render/pack_marks';

/**
 * THE MONSTERS' ATTACKS (Version 19.8; game/defs.ts MONSTER_ATTACKS): the rules of the monsters' moves
 * and the art chat's pictures of them (the trolls' swing and the red troll's charge, TROLL_MOVES; the
 * Warden's swing and his calling of the dead, WARDEN_MOVES; the dead crawling out of the ground,
 * CRAWL_OUT) go on and off together. A bestiary made after this has the pictures, or not.
 */
export function useMonsterAttacks(on: boolean): void {
  MONSTER_ATTACKS.on = on;
  TROLL_MOVES.on = on;
  WARDEN_MOVES.on = on;
  CRAWL_OUT.on = on;
}
useMonsterAttacks(MONSTER_ATTACKS.on);

/**
 * THE NEW MONSTERS (Version 19.9; game/defs.ts NEW_MONSTERS): the rules that put the art chat's Shade,
 * Boneward and Ossuary Golem in the dungeons and the skeleton champion at the head of a yellow pack of
 * skeletons, their pictures (art/new_mobs3.ts NEW_MOBS), and the rings that tell blue and yellow packs
 * apart (render/pack_marks.ts PACK_MARKS) go on and off together.
 */
export function useNewMonsters(on: boolean): void {
  NEW_MONSTERS.on = on;
  NEW_MOBS.on = on;
  PACK_MARKS.on = on;
}
useNewMonsters(NEW_MONSTERS.on);

/**
 * THE SKELETON ON THE HEROES' BONES (art/monster_bones3.ts): A MOCK-UP, AND OFF. While `on` is
 * false the skeleton is today's (art/monster_bones.ts) and nothing about the game changes; a dev
 * page or a playtest that wants pictures of the other one sets it for itself (window.__dbg.skeleton3)
 * and puts it back. The owner has not seen it: nothing that changes the look goes in before his yes.
 */
export const SKELETON3 = { on: false };

/**
 * THE BONE ARCHER ON THE HEROES' BONES (art/monster_bones3.ts, `makeArcherArt3`): A MOCK-UP, AND
 * OFF, as the skeleton's. While `on` is false the bone archer is today's (art/monster_bones.ts)
 * and nothing about the game changes; a dev page or a playtest that wants pictures of the other one
 * sets it for itself (window.__dbg.archer3) and puts it back. The owner has not seen it.
 */
export const ARCHER3 = { on: false };

/** The figures there are: one for each kind of monster, and the guardian. */
export type MonsterFigure = MonsterKind | 'guardian';
/** The figures of Version 14 (painted with the painter's kit: the tests of their pictures go through these). */
export type ClassicFigure = 'skeleton' | 'archer' | 'cultist' | 'bat' | 'brute' | 'guardian' | 'warden';
export const MONSTER_FIGURES: readonly ClassicFigure[] = ['skeleton', 'archer', 'cultist', 'bat', 'brute', 'guardian', 'warden'];
/** THE NEW MONSTERS' figures (Version 19.9), the art chat's, painted on the heroes' bones (art/new_mobs3.ts). */
export const NEW_FIGURES: readonly MonsterFigure[] = ['shade', 'boneward', 'golem', 'champion', 'marksman', 'priest', 'chieftain'];

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
  // THE NEW MONSTERS (measured off their pictures as the others are: tests/new_monsters.test.ts)
  shade: { top: 26, half: 9 },
  boneward: { top: 32, half: 11 },
  golem: { top: 36, half: 21 },
  champion: { top: 35, half: 9 },
  marksman: { top: 33, half: 10 },
  priest: { top: 30, half: 9 },
  // (his antlers are of his head, as the Warden's horns are of his)
  chieftain: { top: 58, half: 23 },
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

/**
 * THE GOLEM'S SKULL IN FLIGHT (art/new_mobs3.ts makeSkullShotArt), kept with the Golem's pictures as one
 * of its moves, `skull`, going round as it tumbles: so it is painted ahead with them.
 */
function withSkulls(art: ActorArt): ActorArt {
  const skull = { frames: makeSkullShotArt(), fps: 16, loop: 0 };
  for (const set of [art.front, art.back]) if (set.clips) set.clips.moves = { ...(set.clips.moves ?? {}), skull };
  return art;
}

export function makeBestiary(): Bestiary {
  const made = new Map<MonsterFigure, ActorArt>();
  /** The skeleton on the bones, made the first time it is asked for with its switch on. */
  let bones3: ActorArt | null = null;
  /** The bone archer on the bones, likewise. */
  let archer3: ActorArt | null = null;
  const of = (figure: MonsterFigure): ActorArt => {
    if (figure === 'skeleton' && SKELETON3.on) {
      if (!bones3) bones3 = makeSkeletonArt3();
      return bones3;
    }
    if (figure === 'archer' && ARCHER3.on) {
      if (!archer3) archer3 = makeArcherArt3();
      return archer3;
    }
    let art = made.get(figure);
    if (!art) {
      art =
        figure === 'skeleton' ? makeSkeletonArt()
        : figure === 'archer' ? makeArcherArt()
        : figure === 'cultist' ? makeCultistArt()
        : figure === 'bat' ? makeBatArt()
        : figure === 'brute' ? makeBruteArt()
        : figure === 'guardian' ? makeGuardianArt()
        : figure === 'warden' ? makeWardenArt()
        // THE NEW MONSTERS: their walks shown at the paces the rules give them
        : figure === 'shade' ? makeShadeArt3(MONSTERS.shade.speed)
        : figure === 'boneward' ? makeBonewardArt3(MONSTERS.boneward.speed)
        : figure === 'golem' ? withSkulls(makeGolemArt3(MONSTERS.golem.speed))
        : figure === 'champion' ? makeChampionArt3(MONSTERS.champion.speed)
        : figure === 'marksman' ? makeMarksmanArt3(MONSTERS.marksman.speed)
        : figure === 'priest' ? makeHighPriestArt()
        : makeChieftainArt();
      made.set(figure, art);
    }
    return art;
  };
  /**
   * For each figure, what is still to be painted, in the order it will be wanted: standing (the
   * first thing seen of a monster), walking, then its attacks from start to finish. The last of
   * `left` is the next to paint.
   */
  const todo = new Map<MonsterFigure, { left: (() => Sprite)[]; done: number; art: ActorArt }>();
  const listOf = (figure: MonsterFigure): { left: (() => Sprite)[]; done: number; art: ActorArt } => {
    const art = of(figure);
    let list = todo.get(figure);
    // (made again if the figure's pictures are others than they were: the skeleton's switch, SKELETON3, or the archer's, ARCHER3, was thrown)
    if (!list || list.art !== art) {
      list = { left: [], done: 0, art };
      // (and last its death: by the time one of them is killed, how it falls is painted; and before
      // it, a monster's other moves, THE MONSTERS' ATTACKS: art/actor_types.ts, AnimSet.clips.moves.
      // Each pick gives lists of frames, which are only counted here, never read: READING A FRAME IS
      // WHAT PAINTS IT (lazyFrames in kit.ts), and a list of them all read at once, made by joining
      // the moves' lists, painted them all in one frame of the game: a pause of a fifth of a second,
      // the first time a troll was met)
      const picks: ((a: AnimSet) => readonly (readonly Sprite[])[])[] = [
        (a) => [a.idle],
        (a) => [a.walk],
        (a) => [a.clips?.attack?.frames ?? a.attack],
        (a) => [a.clips?.heavy?.frames ?? a.heavy ?? []],
        (a) => Object.values(a.clips?.moves ?? {}).map((c) => c.frames),
        (a) => [a.clips?.die?.frames ?? []],
      ];
      for (const pick of picks) {
        for (const set of [art.front, art.back]) {
          for (const frames of pick(set)) for (let i = 0; i < frames.length; i++) list.left.push(() => (warmed = frames[i]));
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
      let next: { left: (() => Sprite)[]; done: number; art: ActorArt } | null = null;
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
