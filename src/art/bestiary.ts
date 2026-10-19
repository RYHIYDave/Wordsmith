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

import { releaseSprite } from '../engine/px';
import type { Sprite } from '../engine/px';
import { BOSSES5 } from '../game/bosses';
import { CULT, MONSTERS, MONSTER_ATTACKS, NEW_MONSTERS } from '../game/defs';
import type { MonsterKind } from '../game/types';
import type { ActorArt, AnimSet } from './actor_types';
import { BOSSES, makeAmalgamArt3, makeBoneBeastArt3, makeChainedArt3, makeHeadsmanArt3 } from './bosses3';
import { CULTISTS_SWITCH, makeDaggerCultistArt3, makeMiniFleshmancerArt3 } from './cultists';
import { FLESHMANCER_SWITCH, makeFleshmancerArt3 } from './fleshmancer';
import { HEADSMAN2 } from './headsman2';
import { makeHeadsman2Art } from './headsman2_moves';
import { CRAWL_OUT } from './mkit';
import { makeBatArt } from './monster_bat';
import { makeArcherArt, makeSkeletonArt } from './monster_bones';
import { makeArcherArt3, makeSkeletonArt3 } from './monster_bones3';
import { TROLL_MOVES, makeBruteArt, makeChieftainArt, makeGuardianArt } from './monster_brute';
import { makeCultistArt, makeHighPriestArt } from './monster_cultist';
import { WARDEN_MOVES, makeWardenArt } from './monster_warden';
import { NEW_MOBS, makeBonewardArt3, makeChampionArt3, makeGolemArt3, makeMarksmanArt3, makeShadeArt3, makeSkullShotArt } from './new_mobs3';
import { PACK_MARKS } from '../render/pack_marks';
import { ACT1 } from '../game/act1';
import { ACT1_KINDS, ACT2_KINDS } from '../game/types';
import { ACT1_FIGS, act1Fig } from './act1_figs/index';

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

/**
 * THE FIRST FIVE FLOORS (game/bosses.ts BOSSES5, game/defs.ts CULT): the art chat's own switches for the
 * bosses of floors 2 to 5, the Fleshmancer and the cult's two fighters (off while each was a mock-up
 * nothing of the game used) go on and off with the rules that put them in the game.
 */
export function useFirstFive(bosses: boolean, cult: boolean): void {
  BOSSES5.on = bosses;
  BOSSES.on = bosses;
  FLESHMANCER_SWITCH.on = bosses;
  CULT.on = cult;
  CULTISTS_SWITCH.on = cult;
}
useFirstFive(BOSSES5.on, CULT.on);

/**
 * ACT 1, THE DESCENT (game/act1.ts): the art chat's switches for each of its kinds (off while each was a
 * mock-up nothing of the game used) go on and off with the descent (art/act1_figs/).
 */
export function useAct1Figs(on: boolean): void {
  for (const f of Object.values(ACT1_FIGS)) for (const sw of f?.switches ?? []) sw.on = on;
}
useAct1Figs(ACT1.on);

/** The figures there are: one for each kind of monster, and the guardian; and the Chained One as he is with his left chain broken, and free of the ball too. */
export type MonsterFigure = MonsterKind | 'guardian' | 'chained1' | 'chained2';
/** The figures of Version 14 (painted with the painter's kit: the tests of their pictures go through these). */
export type ClassicFigure = 'skeleton' | 'archer' | 'cultist' | 'bat' | 'brute' | 'guardian' | 'warden';
export const MONSTER_FIGURES: readonly ClassicFigure[] = ['skeleton', 'archer', 'cultist', 'bat', 'brute', 'guardian', 'warden'];
/** THE NEW MONSTERS' figures (Version 19.9), the art chat's, painted on the heroes' bones (art/new_mobs3.ts). */
export const NEW_FIGURES: readonly MonsterFigure[] = ['shade', 'boneward', 'golem', 'champion', 'marksman', 'priest', 'chieftain'];

/** THE FIRST FIVE FLOORS' figures: the bosses of floors 2 to 5 (the Chained One in each of his three states), the bone beast, and the cult's two. */
// (ACT 2, THE HUSH: its kinds as the descent's, once their pictures are in: art/act1_figs/; a heavy one, a boss, painted by the painter as the descent's are)
export const FIRST5_FIGURES: readonly MonsterFigure[] = ['headsman', 'chained', 'chained1', 'chained2', 'amalgam', 'beast', 'fleshmancer', 'dagger', 'minifm', ...ACT1_KINDS.filter((k) => act1Fig(k) !== null), ...ACT2_KINDS.filter((k) => act1Fig(k) !== null)];
/** Those of them that are heavy to paint and to hold (art/bosses3.ts: seconds of painting, tens of megabytes): made for the floor they are on, and let go of after it (Bestiary.forget). */
export const HEAVY_FIGURES: readonly MonsterFigure[] = ['headsman', 'chained', 'chained1', 'chained2', 'amalgam', 'fleshmancer', ...ACT1_KINDS.filter((k) => act1Fig(k)?.heavy), ...ACT2_KINDS.filter((k) => act1Fig(k)?.heavy)];

/** The figure a monster is shown as. (In the rules a guardian is a brute, and more; the Chained One is one monster, as free as he is: `form`.) */
export function figureOf(m: { kind: MonsterKind; champion: boolean; form?: number }): MonsterFigure {
  if (m.kind === 'chained') return m.form === 1 ? 'chained1' : m.form && m.form >= 2 ? 'chained2' : 'chained';
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
  // THE FIRST FIVE FLOORS (measured off their pictures as the others are: tests/first5_bosses.test.ts)
  headsman: { top: 61, half: 18 },
  // (hunched: the top of his head, not of his shoulders behind it)
  chained: { top: 48, half: 20 },
  chained1: { top: 48, half: 20 },
  chained2: { top: 48, half: 20 },
  amalgam: { top: 34, half: 46 },
  beast: { top: 14, half: 17 },
  // (he floats: his hood, not the skull on his staff over it)
  fleshmancer: { top: 35, half: 14 },
  dagger: { top: 28, half: 9 },
  minifm: { top: 30, half: 11 },
  // ACT 1, THE DESCENT (game/act1.ts): the art chat's; measured off their pictures as they come in
  chanter: { top: 30, half: 9 },
  firepot: { top: 30, half: 10 },
  qgolem: { top: 44, half: 16 },
  rubbling: { top: 12, half: 7 },
  vulture: { top: 26, half: 14 },
  crawler: { top: 24, half: 16 },
  scorpion: { top: 22, half: 18 },
  devil: { top: 28, half: 10 },
  deer: { top: 40, half: 14 },
  wolf: { top: 22, half: 12 },
  drowned: { top: 28, half: 9 },
  leech: { top: 12, half: 8 },
  spawn: { top: 36, half: 16 },
  unfinished: { top: 110, half: 40 },
  queen: { top: 110, half: 50 },
  cantor: { top: 70, half: 16 },
  stag: { top: 80, half: 30 },
  eye: { top: 120, half: 60 },
  // ACT 2, THE HUSH: from the art chat's notes (the knight 58 picture pixels, 28 of the game's), until each comes in
  hushed: { top: 28, half: 9 },
  watch: { top: 34, half: 12 },
  scribe: { top: 28, half: 9 },
  hound: { top: 16, half: 12 },
  rat: { top: 8, half: 7 },
  dredger: { top: 28, half: 11 },
  fieldhand: { top: 28, half: 9 },
  carter: { top: 30, half: 11 },
  patient: { top: 28, half: 9 },
  orderly: { top: 32, half: 12 },
  inkling: { top: 15, half: 9 },
  bookwarden: { top: 32, half: 12 },
  crier: { top: 40, half: 16 },
  ratking: { top: 28, half: 40 },
  palimpsest: { top: 55, half: 24 },
  physician: { top: 35, half: 12 },
  censor: { top: 41, half: 16 },
  // (each as its pictures stand, once they are in: art/act1_figs/)
  ...Object.fromEntries([...ACT1_KINDS, ...ACT2_KINDS].flatMap((k) => { const f = act1Fig(k); return f ? [[k, f.size]] : []; })),
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
  /**
   * THE FIRST FIVE FLOORS: let go of a figure's pictures (the boss of a floor that has been left: tens of
   * megabytes each). They are made again, frame by frame as they are wanted, if it is ever asked for again.
   */
  forget(figure: MonsterFigure): void;
  /**
   * ACT 1, THE DESCENT: let go of every figure's pictures but these (a new place is come into: the last one's
   * monsters, ten to thirty megabytes a floor, were kept until now, and five floors of them are more than a phone
   * gives a page for its canvases). Any of them met again is painted again, a frame at a time, as it is wanted.
   */
  forgetOthers(keep: ReadonlySet<MonsterFigure>): void;
  /** How many frames of these figures are still to be painted ahead (for the painting ahead, and its tests). */
  left(figures: ReadonlyArray<MonsterFigure>): number;
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
      // (ACT 1, THE DESCENT: its own kinds' pictures, as the art chat hands them over: art/act1_figs/)
      const a1 = act1Fig(figure);
      art =
        a1 ? a1.make()
        : figure === 'skeleton' ? makeSkeletonArt()
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
        // THE FIRST FIVE FLOORS: the bosses, the beast and the mini fleshmancer at their pictures' own
        // paces (the rules carry them by a clock of their own: game/bosses.ts, Monster.gait); the dagger
        // cultist's run at the pace the rules give him
        // (THE HEADSMAN MADE NEW: his new look and moves, with HEADSMAN2 on: art/headsman2.ts)
        : figure === 'headsman' ? (HEADSMAN2.on ? makeHeadsman2Art() : makeHeadsmanArt3())
        : figure === 'chained' ? makeChainedArt3(undefined, 0)
        : figure === 'chained1' ? makeChainedArt3(undefined, 1)
        : figure === 'chained2' ? makeChainedArt3(undefined, 2)
        : figure === 'amalgam' ? makeAmalgamArt3()
        : figure === 'beast' ? makeBoneBeastArt3()
        : figure === 'fleshmancer' ? makeFleshmancerArt3()
        : figure === 'dagger' ? makeDaggerCultistArt3(MONSTERS.dagger.speed)
        : figure === 'minifm' ? makeMiniFleshmancerArt3()
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
        // (its flinch as it is struck, which is most of the time once it is fought: Version 22.1, it was painted only as it
        // was first shown, and a boss's frame takes a frame's whole time and more to paint)
        (a) => [a.clips?.reel?.frames ?? []],
        // (but a move that is pictures only and never played: the Headsman's `holds`, art/bosses3.ts)
        (a) => Object.entries(a.clips?.moves ?? {}).filter(([name]) => name !== 'holds').map(([, c]) => c.frames),
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
    forget(figure: MonsterFigure): void {
      const art = made.get(figure);
      made.delete(figure);
      todo.delete(figure);
      if (art) for (const set of [art.front, art.back]) for (const frames of framesOf(set)) freeFrames(frames);
    },
    forgetOthers(keep: ReadonlySet<MonsterFigure>): void {
      for (const figure of [...made.keys()]) if (!keep.has(figure)) this.forget(figure);
    },
    left(figures: ReadonlyArray<MonsterFigure>): number {
      let n = 0;
      for (const f of figures) n += listOf(f).left.length;
      return n;
    },
  };
}

/** Every list of frames a figure seen one way round has. */
export function framesOf(set: AnimSet): Sprite[][] {
  const out: Sprite[][] = [set.idle, set.walk];
  const c = set.clips;
  if (c) {
    for (const clip of [c.attack, c.heavy, c.die, c.reel]) if (clip) out.push(clip.frames);
    for (const clip of Object.values(c.moves ?? {})) out.push(clip.frames);
  }
  return out;
}

/**
 * A figure's frames in the order they are painted ahead of need, each as [which way round (0 the front, 1
 * the back), which list (its place in `framesOf`), which frame]: standing (the first thing seen of a
 * monster), walking, its attacks from start to finish, its flinch as it is struck, its other moves (THE MONSTERS' ATTACKS:
 * art/actor_types.ts, AnimSet.clips.moves; but not one that is pictures only and never played: the
 * Headsman's `holds`, art/bosses3.ts), and last its death: by the time one of them is killed, how it falls
 * is painted: the order of the game's own painting ahead (Bestiary.warm). The painter (render/painter.ts)
 * goes by it, and so a frame is the same frame to the painter and to the game.
 */
export function paintOrder(art: ActorArt): [number, number, number][] {
  const sets = [art.front, art.back];
  const lists = sets.map(framesOf);
  const picks: ((a: AnimSet) => readonly (readonly Sprite[])[])[] = [
    (a) => [a.idle],
    (a) => [a.walk],
    (a) => [a.clips?.attack?.frames ?? []],
    (a) => [a.clips?.heavy?.frames ?? a.heavy ?? []],
    (a) => [a.clips?.reel?.frames ?? []],
    (a) => Object.entries(a.clips?.moves ?? {}).filter(([name]) => name !== 'holds').map(([, c]) => c.frames),
    (a) => [a.clips?.die?.frames ?? []],
  ];
  const out: [number, number, number][] = [];
  for (const pick of picks) {
    for (let v = 0; v < sets.length; v++) {
      for (const frames of pick(sets[v])) {
        const l = lists[v].indexOf(frames as Sprite[]);
        if (l < 0) continue;
        for (let i = 0; i < frames.length; i++) out.push([v, l, i]);
      }
    }
  }
  return out;
}

/**
 * Give back the room the frames of a list take, those that have been painted (one that has not been is
 * left unpainted: reading it is what would paint it, art/kit.ts lazyFrames), and that of their mirror
 * images (engine/px.ts releaseSprite).
 */
export function freeFrames(frames: Sprite[]): void {
  for (let i = 0; i < frames.length; i++) {
    const d = Object.getOwnPropertyDescriptor(frames, i);
    const s = d && 'value' in d ? (d.value as Sprite | undefined) : undefined;
    if (s) releaseSprite(s);
  }
}

/**
 * THE PAINTER (render/painter.ts) has painted a frame of a figure: it is the figure's, unless the game
 * has painted that frame itself meanwhile (then false, and the picture is not wanted).
 */
export function giveFrame(art: ActorArt, v: number, l: number, i: number, s: Sprite): boolean {
  const frames = framesOf(v === 0 ? art.front : art.back)[l];
  if (!frames || i < 0 || i >= frames.length) return false;
  const d = Object.getOwnPropertyDescriptor(frames, i);
  if (!d || typeof d.get !== 'function') return false;
  Object.defineProperty(frames, i, { value: s, writable: true, configurable: true, enumerable: true });
  return true;
}
