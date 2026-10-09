// THE THREE HEROES PAINTED OVER THE BONES: THE GAME'S HEROES FROM VERSION 16 (begun 6 Oct 2026;
// the owner, 7 Oct 2026, 00:34: "im happy with all three.  run the tests, throw them in the
// game"). `makeHeroArt3` gives what art/heroes.ts's `makeHeroArt` gave, in the same shape, so
// nothing else in the game needs to know which it has; the first heroes are still there for a
// page opened with #heroes=old (main.ts).
//
// The owner, 6 Oct 2026, 19:17: "We have to get the characters right." A hero here is a body of
// bones (skeleton.ts), a painter that dresses it in solids (hero3_knight.ts, hero3_ranger.ts,
// hero3_mage.ts) and a set of moves (moves3.ts). This file turns a move into the frames the game
// shows: which moment of it each frame is, what was there a moment before (cloth hangs back by
// it, a blade leaves its streak from it), where the wind has got to, and the light going out of a
// hero who has fallen. THE DEV PAGES PAINT WITH THE SAME FUNCTION (`paintMove3`), so a film sent
// to the owner is, frame for frame, what the game would show.
//
// IN TOWN A HERO IS ANOTHER FIGURE (the owner, 21:33: "id like a town sprite for everyone where
// their weapons are on their backs?  this would also go in the class selection screen"): the same
// hero with a look that says so (`HeroLook.town`) stands, runs and passes the time as the town
// moves have it (moves3.ts: ktown, rtown and the rest).

import type { Light, Sprite } from '../engine/px';
import type { ClassId } from '../game/types';
import type { ActorArt, AnimSet, Clip } from './actor_types';
import { onBack } from './carried';
import { paintKnight3 } from './hero3_knight';
import { paintKnight3b } from './hero3_knight2';
import type { HeadPainter } from './hero3_knight';
import { paintMage3 } from './hero3_mage';
import { paintMage3b } from './hero3_mage2';
import type { MageLook } from './hero3_mage';
import { paintRanger3 } from './hero3_ranger';
import { paintRanger3b } from './hero3_ranger2';
import type { HeroArt, HeroLook } from './heroes';
import { REIMAGINED } from './reimagined';
import { lazyFrames, lightsOut, toSprite } from './kit';
import type { Painted } from './kit';
import { COMBO_MENDS, GREAT_BLADE, MOVES3, SETTLES, SLASH3, STAFF_UP, STRIKE3, WALKS, runWaysOf, settlesOf, startsOf, walkingOf } from './moves3';
import type { Move3 } from './moves3';
import { CANVAS3 } from './skin';
import type { GameView } from './skin';
import { add, bonesAt, mul, solve } from './skeleton';
import type { Build, Posed, V3 } from './skeleton';

export type Hero3 = 'knight' | 'ranger' | 'mage';
/** Whose move it is: the one who holds what it is made with. */
export const heroOf = (move: Move3): Hero3 => (move.held === 'bow' ? 'ranger' : move.held === 'staff' ? 'mage' : 'knight');

/** A thirtieth of a second: how far back "a moment before" is. */
const FRAME = 1 / 30;
/** How long the wind takes to go once round, where nothing else decides it (the standing loop of the first heroes was this long). */
const WIND = 1.2;

/** When a move ends, and when its loop begins (if it goes round). */
function spanOf(move: Move3): { end: number; from: number | undefined } {
  const keys = move.motion.keys;
  return { end: keys.length ? keys[keys.length - 1].at : 0, from: move.motion.loop };
}

/**
 * Where the wind has got to (0..1) at a moment of a move. In a move that goes round it goes round
 * a whole number of times in one turn of the loop, so the cloth does not jump where the loop
 * closes; in one that is played once it begins and ends at nothing, where the standing loop
 * begins, so that cloth joins the loop without a jump when the move is over.
 */
export function windAt(move: Move3, t: number): number {
  const { end, from } = spanOf(move);
  const long = from !== undefined ? end - from : end;
  if (long <= 1e-6) return 0;
  const period = long / Math.max(1, Math.round(long / WIND));
  const k = ((t - (from ?? 0)) / period) % 1;
  return k < 0 ? k + 1 : k;
}

export interface Paint3 {
  /** The body to paint it on, if not the move's own (a page that tries heads of other sizes). */
  build?: Build;
  /** The crisp edge of light round the figure: a colour, or null for none. The painter's own (a friend's cyan) if not given. */
  rim?: string | null;
  /** Another head for the knight or the ranger, painted in place of their own (heads to choose from: dev/options3.ts). */
  head?: HeadPainter;
  /** Which mage (art/hero3_mage.ts): the one in robes if not said. */
  mage?: MageLook;
}

/**
 * ONE FRAME OF A MOVE: the hero at the moment `t` of it (seconds from its start; in a move that
 * goes round, any moment past its end is the same moment of a later turn), seen from in front or
 * from behind. The light that has gone out of a fallen hero has gone out of the painting.
 */
export function paintMove3(move: Move3, t: number, view: GameView, opts: Paint3 = {}): Painted {
  const hero = heroOf(move);
  const build = opts.build ?? move.build;
  const { end, from } = spanOf(move);
  const long = from !== undefined ? end - from : 0;
  /** A moment of the move, folded into its loop if it has one. */
  const fold = (when: number): number => (from !== undefined && long > 1e-6 && when >= end ? from + ((when - from) % long) : when);
  const now = fold(Math.max(0, t));
  /** The pose a little while before now: in a loop, a moment before its beginning is a moment before its end. */
  const posed = (back: number): Posed => {
    let when = now - back;
    if (from !== undefined && long > 1e-6 && now >= from && when < from) when += long;
    return bonesAt(move.motion.keys, move.rest, Math.max(0, when));
  };
  const q = posed(0);
  const s = solve(build, q);
  const prev = solve(build, posed(FRAME));
  const wind = windAt(move, now);
  const kit: { rim?: string | null; head?: HeadPainter } = opts.rim === undefined ? {} : { rim: opts.rim };
  if (opts.head && hero !== 'mage') kit.head = opts.head;
  let f: Painted;
  // (the ranger reimagined, the Wind-runner, only while his switch is on: art/reimagined.ts. It is off.)
  if (hero === 'ranger') f = (REIMAGINED.ranger ? paintRanger3b : paintRanger3)(s, q, view, { build, ...kit }, { prev, wind });
  else {
    // what a swing leaves its streak from, newest first: a blade from guard to point, a staff
    // from half way up to its crystal. (A sword that was on his back a moment ago was THERE.)
    const trail: [V3, V3][] = [];
    for (let i = 0; i <= 8; i++) {
      const then = i === 0 ? q : posed((FRAME * i) / 8);
      const sk = i === 0 ? s : solve(build, then);
      const away = hero === 'knight' && then.stow > 0.5 ? onBack(build, sk, 'sword') : null;
      const hand = away ? away.grip : sk.handR;
      const point = away ? away.point : sk.point;
      trail.push([add(hand, mul(point, hero === 'mage' ? STAFF_UP * 0.5 : 1.3)), add(hand, mul(point, hero === 'mage' ? STAFF_UP : 1.3 + GREAT_BLADE))]);
    }
    // (the knight and the mage reimagined, the Boar Knight and the Storm-witch, only while their switches are on: art/reimagined.ts. They are off.)
    if (hero === 'mage') f = REIMAGINED.mage && !opts.mage ? paintMage3b(s, q, view, { build, ...kit }, { prev, trail, wind }) : paintMage3(s, q, view, { build, ...kit, ...(opts.mage ? { look: opts.mage } : {}) }, { prev, trail, wind });
    else f = (REIMAGINED.knight ? paintKnight3b : paintKnight3)(s, q, view, { build, twoHanded: true, ...kit }, { prev, trail: streakShown(move, now) ? trail : [], wind });
  }
  return q.out > 0.01 ? lightsOut(f, q.out) : f;
}

/**
 * Whether a frame of a move may show the streak its blade leaves. STRIKE'S COMBO MENDED (art/moves3.ts,
 * COMBO_MENDS, on since Version 19.2, on his yes): the two swings show it only through the cut,
 * their third to fifth frames, so that the way up and the way back show a clean blade.
 */
export function streakShown(move: Move3, t: number): boolean {
  if (!COMBO_MENDS.on || (move !== STRIKE3 && move !== SLASH3)) return true;
  return t >= 3 * FRAME - 1e-6 && t <= 5 * FRAME + 1e-6;
}

/** How far the light has gone out of a hero at a moment of a move (0 = none of it: all but the last of a fall). */
function outAt(move: Move3, t: number): number {
  return bonesAt(move.motion.keys, move.rest, Math.max(0, t)).out;
}

/** The pool of light behind a hero, on the painters' canvas (as kit.ts has it on the first heroes'). */
const AURA3: Light = { x: CANVAS3.ax - 4, y: CANVAS3.ay - 30, r: 46, color: '#28dcf0', a: 0.2 };

/** A frame of a move as the game holds it: cut down to the figure, with its lights, its pool of light and where its tails are fixed. */
export function spriteOf3(move: Move3, t: number, view: GameView): Sprite {
  const out = outAt(move, t);
  const pool = out >= 0.98 ? null : out > 0.01 ? { ...AURA3, a: (AURA3.a ?? 1) * (1 - out) } : AURA3;
  return toSprite(paintMove3(move, t, view), pool, CANVAS3.ax, CANVAS3.ay);
}

// ---------------------------------------------------------------------------------------------
// Which move is which of the game's animations

/** The moves of one hero in one place, each by its short name in MOVES3. */
export interface Plan {
  idle: string;
  walk: string;
  attack: string;
  /** (Strike's combo) the second swing, where the hero has one. */
  attack2?: string;
  heavy: string;
  /** A leap and its landing, as one move (its `arc.until` is where the one ends and the other begins). */
  leap?: string;
  roll?: string;
  hold?: string;
  release?: string;
  whirl?: string;
  fall?: string;
  reel?: string;
  lurch?: string;
  /** What they do when left standing. */
  idleA?: string;
  idleB?: string;
  /** The move in which they draw the weapon and stand ready (its `ready` moment is where the stance is reached): what a class card shows when they are picked. */
  ready?: string;
}

const KNIGHT: Plan = { idle: 'rear', walk: 'krun', attack: 'strike', attack2: 'kslash', heavy: 'slam', leap: 'leap', whirl: 'whirl', fall: 'kfall', reel: 'kreel', lurch: 'klurch' };
const RANGER: Plan = { idle: 'rstand', walk: 'rrun', attack: 'shot', heavy: 'volley', roll: 'roll', fall: 'rfall', reel: 'rreel', lurch: 'rlurch', idleA: 'squirrel', idleB: 'sighting' };
const MAGE: Plan = { idle: 'mstand', walk: 'mrun', attack: 'wave', heavy: 'orb', hold: 'beam', release: 'beamend', fall: 'mfall', reel: 'mreel', lurch: 'mlurch', idleA: 'mlight', idleB: 'reading' };
/**
 * In town: how they stand and run with their weapons on their backs, and what they do there when
 * left standing. What a hero does in a fight is the same wherever they are (there is nothing to
 * fight in town). The mage has no other figure: her staff is her walking stick.
 *   DRAWING THE WEAPON INTO THE BATTLE STANCE IS NOT ONE OF THE THINGS THEY DO TO PASS THE TIME
 *   IN TOWN, since Version 18.8 (the owner, 7 Oct 2026, 23:09: "Don’t use the battle stance as
 *   an idle animations while in town stance"), as it is not on a class card (6 Oct, 22:58:
 *   "lets not have the battle stance be an idle animation during the character select screen.
 *   that way its something different when you select them"). Until 18.8 it was the first of
 *   their two in town (6 Oct, 21:34: "then you can add as another idle animation them drawing
 *   their weapons and getting into their battle stance"). It is kept for the moment they are
 *   picked (`ready`).
 */
const KNIGHT_TOWN: Plan = { ...KNIGHT, idle: 'ktown', walk: 'ktownrun', idleA: 'klook', idleB: undefined, ready: 'kdraw' };
const RANGER_TOWN: Plan = { ...RANGER, idle: 'rtown', walk: 'rtownrun', idleA: 'tsquirrel', idleB: 'tsighting', ready: 'rdraw' };
const MAGE_TOWN: Plan = { ...MAGE, idleA: 'mlight', idleB: 'reading', ready: 'mready' };
/** `card`: ON A CLASS CARD they are as in town (since 18.8 they pass the time there as in town as well). */
export const PLANS: Record<ClassId, { dungeon: Plan; town: Plan; card: Plan }> = {
  warrior: { dungeon: KNIGHT, town: KNIGHT_TOWN, card: { ...KNIGHT_TOWN } },
  ranger: { dungeon: RANGER, town: RANGER_TOWN, card: { ...RANGER_TOWN } },
  mage: { dungeon: MAGE, town: MAGE_TOWN, card: { ...MAGE_TOWN } },
};

/** Frames a second: of a standing loop, a run, anything played once, and what a hero does when left standing. */
const IDLE_FPS3 = 10;
const RUN_FPS3 = 30;
/** A run whose feet grip (moves3.ts GRIP): a picture for each of the game's steps, on a phone at sixty a second. */
const GRIP_FPS3 = 60;
const CLIP_FPS3 = 30;
const GESTURE_FPS3 = 20;
/** How long the stance is held at the end of making ready (`clips.ready`), in seconds; and the least the whole of it lasts (one who is quickly ready holds the stance longer, so that it is seen). */
const READY_HELD3 = 0.3;
const READY_LEAST3 = 1;
/** How many pictures a leap and a roll are laid out in (the game shows them by how far through the hero is, not by the clock). */
const LEAP_FRAMES3 = 16;
const ROLL_FRAMES3 = 14;

/** `fights`: the hero may fight where this look is worn (a dungeon): the pictures only a fight shows (made walking) are made only then. */
function animSet3(plan: Plan, view: GameView, fights = true): AnimSet {
  const of = (key: string): Move3 => {
    const m = MOVES3[key];
    if (!m) throw new Error(`heroes3: no move called ${key}`);
    return m;
  };
  const at = (m: Move3, t: number): Sprite => spriteOf3(m, t, view);
  /** A move that goes round, as a list of frames to be shown one after another for ever (its last frame is not its first again). */
  const round = (m: Move3, fps: number): Sprite[] => {
    const { end, from } = spanOf(m);
    const t0 = from ?? 0;
    const n = Math.max(1, Math.round((end - t0) * fps));
    return lazyFrames(n, (i) => at(m, t0 + i / fps));
  };
  /** A move, or a piece of one from `t0` to `t1`, played by the clock. */
  const clip = (m: Move3, fps: number, t0 = 0, t1 = spanOf(m).end): Clip => {
    const n = Math.max(1, Math.ceil((t1 - t0) * fps - 1e-6) + 1);
    const c: Clip = { frames: lazyFrames(n, (i) => at(m, Math.min(t1, t0 + i / fps))), fps };
    if (m.motion.hit !== undefined && m.motion.hit >= t0 && m.motion.hit <= t1) c.hit = m.motion.hit - t0;
    if (m.motion.loop !== undefined) c.loop = m.motion.loop - t0;
    return c;
  };
  /** A piece of a move laid out in `n` pictures, first to last, to be shown by how far through it the hero is. */
  const spread = (m: Move3, n: number, t0: number, t1: number): Clip => ({ frames: lazyFrames(n, (i) => at(m, t0 + ((t1 - t0) * i) / (n - 1))), fps: n / Math.max(1e-6, t1 - t0) });
  /** The three frames older code asks an attack for (wound up, the blow, after it), taken from its clip. */
  const three = (c: Clip): Sprite[] => {
    const n = c.frames.length;
    const pick = (seconds: number): number => Math.max(0, Math.min(n - 1, Math.round(seconds * c.fps)));
    const hit = c.hit ?? (n - 1) / c.fps / 2;
    const picks = [pick(hit * 0.7), pick(hit + 0.035), pick(((n - 1) / c.fps + hit) / 2)];
    return lazyFrames(3, (i) => c.frames[picks[i]]);
  };
  const attack = clip(of(plan.attack), CLIP_FPS3);
  // (Strike's combo: the second swing, where there is one)
  const attack2 = plan.attack2 ? clip(of(plan.attack2), CLIP_FPS3) : undefined;
  const heavy = clip(of(plan.heavy), CLIP_FPS3);
  // (a run whose feet grip the floor, moves3.ts GRIP: its frame by how far the hero has gone)
  const walkStride = of(plan.walk).stride;
  const walkFps = walkStride !== undefined ? GRIP_FPS3 : RUN_FPS3;
  const set: AnimSet = { idle: round(of(plan.idle), IDLE_FPS3), walk: round(of(plan.walk), walkFps), attack: three(attack), heavy: three(heavy), idleFps: IDLE_FPS3, walkFps, clips: { attack, heavy } };
  if (walkStride !== undefined) set.walkStride = walkStride;
  // (coming to a stand out of the run, where the hero has that: moves3.ts, settlesOf)
  const stops = settlesOf(of(plan.walk), of(plan.idle));
  if (stops.length) set.stops = stops.map((m) => clip(m, CLIP_FPS3));
  // (the run the other ways, for a hero turned to a mark: moves3.ts, runWaysOf)
  // (only where there is fighting: in town nothing is faced while walking, and nothing is attacked)
  const ways = fights ? runWaysOf(of(plan.walk)) : [];
  if (ways.length) set.walkWays = ways.map((m) => round(m, walkFps));
  // (the attacks made walking, the run's legs under them: moves3.ts, walkingOf)
  const attackWalk = fights ? walkingOf(of(plan.attack), of(plan.walk)) : [];
  if (attackWalk.length) (set.clips as NonNullable<AnimSet['clips']>).attackWalk = attackWalk.map((m) => clip(m, CLIP_FPS3));
  const heavyWalk = fights ? walkingOf(of(plan.heavy), of(plan.walk)) : [];
  if (heavyWalk.length) (set.clips as NonNullable<AnimSet['clips']>).heavyWalk = heavyWalk.map((m) => clip(m, CLIP_FPS3));
  // (and setting off from the stance into it: moves3.ts, startsOf)
  const start = startsOf(of(plan.walk), of(plan.idle));
  if (start) {
    set.start = clip(start.move, GRIP_FPS3);
    set.startAt = start.phase;
  }
  const clips = set.clips as NonNullable<AnimSet['clips']>;
  if (attack2) clips.attack2 = attack2;
  if (plan.leap) {
    // (a leap is one move here, the going up and the coming down: the game carries the hero
    // through the air for the first of it, and shows the rest if they are left standing where they land)
    const m = of(plan.leap);
    const until = m.arc ? m.arc.until : spanOf(m).end;
    clips.leap = spread(m, LEAP_FRAMES3, 0, until);
    const leap = clips.leap;
    set.leap = lazyFrames(3, (i) => leap.frames[Math.round([0.05, 0.45, 0.9][i] * (LEAP_FRAMES3 - 1))]);
    if (spanOf(m).end > until + 1e-6) clips.land = clip(m, CLIP_FPS3, until);
  }
  if (plan.roll) {
    // (a roll the game carries along the floor for the first `tumble` of it: the rest is coming up,
    // shown as a leap's landing is, if the hero is then left standing)
    const m = of(plan.roll);
    const until = m.tumble ?? spanOf(m).end;
    clips.roll = spread(m, ROLL_FRAMES3, 0, until);
    if (m.tumble !== undefined && spanOf(m).end > until + 1e-6) clips.land = clip(m, CLIP_FPS3, until);
  }
  if (plan.hold) clips.hold = clip(of(plan.hold), CLIP_FPS3);
  if (plan.release) clips.release = clip(of(plan.release), CLIP_FPS3);
  // (a whirlwind on the bones is the hero turning all the way round, seen from one place: the
  // figure is not to be turned for it as well)
  if (plan.whirl) clips.whirl = { ...clip(of(plan.whirl), CLIP_FPS3), turns: true };
  if (plan.fall) clips.fall = clip(of(plan.fall), CLIP_FPS3);
  if (plan.reel) clips.reel = clip(of(plan.reel), CLIP_FPS3);
  if (plan.lurch) clips.lurch = clip(of(plan.lurch), CLIP_FPS3);
  // (and walking: moves3.ts, walkingOf; where there is fighting)
  if (plan.reel && fights) {
    const w = walkingOf(of(plan.reel), of(plan.walk), false);
    if (w.length) clips.reelWalk = w.map((m) => clip(m, CLIP_FPS3));
  }
  if (plan.lurch && fights) {
    const w = walkingOf(of(plan.lurch), of(plan.walk), false);
    if (w.length) clips.lurchWalk = w.map((m) => clip(m, CLIP_FPS3));
  }
  // (what a hero does when left standing is painted facing the camera only: the game turns them round for it)
  if (view === 'front') {
    if (plan.idleA) clips.idleA = clip(of(plan.idleA), GESTURE_FPS3);
    if (plan.idleB) clips.idleB = clip(of(plan.idleB), GESTURE_FPS3);
    if (plan.ready) {
      const m = of(plan.ready);
      clips.ready = clip(m, CLIP_FPS3, 0, Math.min(spanOf(m).end, Math.max(READY_LEAST3, (m.ready ?? spanOf(m).end) + READY_HELD3)));
    }
  }
  return set;
}

/** The last frame painted ahead of need. Kept only so that the reading of it cannot be optimised away. */
export let painted3: Sprite | undefined;

/** The three heroes painted over the bones, in the shape the game holds its heroes in (art/heroes.ts). */
export function makeHeroArt3(): HeroArt {
  const made = new Map<string, ActorArt>();
  const todo = new Map<ActorArt, (() => Sprite)[]>();
  const of = (cls: ClassId, look: HeroLook): ActorArt => {
    // (one figure of each hero in each place: the knight with the great sword, whatever he carries, until he is painted with a sword and a shield)
    const place = look.card ? 'card' : look.town ? 'town' : 'dungeon';
    const key = `${cls}:${place}`;
    let art = made.get(key);
    if (!art) {
      const plan = PLANS[cls][place];
      art = { front: animSet3(plan, 'front', place === 'dungeon'), back: animSet3(plan, 'back', place === 'dungeon') };
      made.set(key, art);
    }
    return art;
  };
  return {
    of,
    warm(cls: ClassId, look: HeroLook): boolean {
      const art = of(cls, look);
      let list = todo.get(art);
      if (!list) {
        list = [];
        // (standing and running first, then the attacks from start to finish, then the rest; what
        // a hero does when left standing is painted as it is shown, which is slowly enough)
        const picks: ((a: AnimSet) => Sprite[])[] = [(a) => a.idle, (a) => a.start?.frames ?? [], (a) => a.walk, ...[0, 1, 2].map((k) => (a: AnimSet) => a.walkWays?.[k] ?? []), ...Array.from({ length: SETTLES }, (_, k) => (a: AnimSet) => a.stops?.[k]?.frames ?? []), (a) => a.clips?.attack?.frames ?? [], ...WALKS.map((_, k) => (a: AnimSet) => a.clips?.attackWalk?.[k]?.frames ?? []), (a) => a.clips?.attack2?.frames ?? [], (a) => a.clips?.heavy?.frames ?? [], ...WALKS.map((_, k) => (a: AnimSet) => a.clips?.heavyWalk?.[k]?.frames ?? []), (a) => a.clips?.leap?.frames ?? [], (a) => a.clips?.roll?.frames ?? [],
          (a) => a.clips?.hold?.frames ?? [], (a) => a.clips?.release?.frames ?? [], (a) => a.clips?.whirl?.frames ?? [], (a) => a.clips?.land?.frames ?? [], (a) => a.clips?.reel?.frames ?? [], (a) => a.clips?.lurch?.frames ?? [], ...WALKS.map((_, k) => (a: AnimSet) => a.clips?.reelWalk?.[k]?.frames ?? []), ...WALKS.map((_, k) => (a: AnimSet) => a.clips?.lurchWalk?.[k]?.frames ?? [])];
        for (const pick of picks) {
          for (const set of [art.front, art.back]) {
            const frames = pick(set);
            for (let i = 0; i < frames.length; i++) list.push(() => (painted3 = frames[i]));
          }
        }
        list.reverse();
        todo.set(art, list);
      }
      const next = list.pop();
      if (!next) return false;
      next();
      return true;
    },
  };
}
