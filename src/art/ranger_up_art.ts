// THE RANGER BROUGHT UP, AS THE GAME HOLDS HIM (the art chat's helper, 7 Nov 2026; behind art/ranger_up.ts RANGER_UP, off).
//
// The same lists, in the same shape, as art/heroes3.ts gives the Ranger (so the game, the side painter and the baking need
// nothing new), from his new moves (art/ranger_up_moves.ts) painted by his sculpted painter (art/ranger_up.ts), EVERY LIST AT 30
// PICTURES A SECOND (his runs, which grip the floor, at 60: a picture for each of the game's steps), FROM ALL EIGHT SIDES, each
// truly painted (art/warrior_up.ts WuSide; none mirrored):
//   idle        his guard, alive: 72 pictures (2.4 s)           in town and on his card: his town stance, alive, 72
//   walk        his run, gripping: 25 pictures at 60 (`walkStride` 1.92 tiles)     in town: his town run, the same
//   walkWays    (a dungeon) his run backing away and going across (moves3.ts runWaysOf, on his run)
//   stops       coming to a stand out of the run, 8 of them        start: setting off into the run (60 a second)
//   attack, heavy           the Shot and the Volley, by Movement 9 (their numbers: ranger_up_moves.ts)
//   attackWalk, heavyWalk   (a dungeon) each shot as he makes it walking, four ways (moves3.ts walkingOf)
//   roll, land  the roll (14 pictures by how far through) and coming up out of it
//   reel, lurch, fall       struck from in front and from behind (7 frames, with their walking four ways), his fall (46)
//   idleA, idleB  (from in front) the squirrel and the sighting; in town and on his card the town ones
//   ready         (from in front, in town and on his card) unslinging his bow when picked, into his guard
// A list the same in two places is ONE list, painted once.

import type { Light, Sprite } from '../engine/px';
import type { ActorArt, AnimSet, Clip } from './actor_types';
import { lazyFrames, lightsOut, toSprite } from './kit';
import { SETTLES, runWaysOf, walkingOf } from './moves3';
import type { Move3 } from './moves3';
import { CANVAS3 } from './skin';
import { bonesAt, solve } from './skeleton';
import type { Posed, Skeleton } from './skeleton';
import { paintRangerUp } from './ranger_up';
import type { RuFrame, RuSide } from './ranger_up';
import { WU_SIDES } from './warrior_up';
import { RU_DRAW3, RU_FALL3, RU_LURCH3, RU_REEL3, RU_ROLL3, RU_RUN3, RU_SHOT3, RU_SIGHTING3, RU_SQUIRREL3, RU_STAND3, RU_TOWN3, RU_TOWN_RUN3, RU_TSIGHTING3, RU_TSQUIRREL3, RU_VOLLEY3, RU_SHOT_HIT, RU_VOLLEY_HIT, ruSettle, ruStart } from './ranger_up_moves';

const FPS = 30;
const GRIP_FPS = 60;
const FRAME = 1 / 30;
const ROLL_FRAMES = 14;
const READY_HELD = 0.3;
const READY_LEAST = 1;
const AURA: Light = { x: CANVAS3.ax - 4, y: CANVAS3.ay - 30, r: 46, color: '#28dcf0', a: 0.2 };

/**
 * THE RELEASE OF EACH SHOT (Movement 9): the one frame in which the arrow goes, drawn with its after-image (the string and the
 * arrow where they were the frame before, left as ghosts: art/ranger_up.ts). From the frame before it to it (seconds).
 */
export const RU_SMEARS: Readonly<Record<string, readonly [number, number]>> = {
  [RU_SHOT3.name]: [RU_SHOT_HIT - FRAME, RU_SHOT_HIT],
  [RU_VOLLEY3.name]: [RU_VOLLEY_HIT - FRAME, RU_VOLLEY_HIT],
};
/** Whether a moment of a move is its release, drawn with its after-image. (The shots made walking keep their moves' names.) */
export function ruSmeared(m: Move3, t: number): boolean {
  const name = m.name.replace(/, walking$/, '');
  const w = RU_SMEARS[name];
  return !!w && t > w[0] + 1e-6 && t <= w[1] + 1e-6;
}

function spanOf(m: Move3): { end: number; from: number | undefined } {
  const k = m.motion.keys;
  return { end: k.length ? k[k.length - 1].at : 0, from: m.motion.loop };
}
function windOf(m: Move3, t: number): number {
  const { end, from } = spanOf(m);
  const long = from !== undefined ? end - from : end;
  if (long <= 1e-6) return 0;
  const period = long / Math.max(1, Math.round(long / 1.2));
  const k = ((t - (from ?? 0)) / period) % 1;
  return k < 0 ? k + 1 : k;
}
export function ruPosed(m: Move3, t: number): { q: Posed; s: Skeleton } {
  const { end, from } = spanOf(m);
  const long = from !== undefined ? end - from : 0;
  let when = Math.max(0, t);
  if (from !== undefined && long > 1e-6 && when >= end) when = from + ((when - from) % long);
  const q = bonesAt(m.motion.keys, m.rest, when);
  return { q, s: solve(m.build, q) };
}
function before(m: Move3, t: number, back: number): number {
  const { end, from } = spanOf(m);
  const long = from !== undefined ? end - from : 0;
  let w = t - back;
  if (from !== undefined && long > 1e-6 && w < from && end > from) w += long;
  return Math.max(0, w);
}

/** HIM AT A MOMENT OF A MOVE, painted: with the figure a frame and three frames before (cloth follows), the wind, and at a
 * release the string and the arrow of the frame before as its after-image. */
export function paintRuMove(m: Move3, t: number, view: RuSide, rim: string | null | undefined = undefined): RuFrame {
  const { q, s } = ruPosed(m, t);
  const prev = ruPosed(m, before(m, t, FRAME));
  const past = ruPosed(m, before(m, t, 3 * FRAME)).s;
  const ghost = ruSmeared(m, t) ? { q: prev.q, s: prev.s } : undefined;
  const f = paintRangerUp(s, q, view, m.build, { prev: prev.s, past, wind: windOf(m, t), ghost }, rim === undefined ? undefined : rim);
  if (q.out > 0.01) return { ...f, ...lightsOut(f, q.out) };
  return f;
}

/** A frame of a move as the game holds it: cut down to him, with his lights, his pool of light and where his feather is fixed. */
export function ruSprite(m: Move3, t: number, view: RuSide): Sprite {
  const f = paintRuMove(m, t, view);
  const out = ruPosed(m, t).q.out;
  const aura = { ...AURA, x: f.ax + (f.ax === CANVAS3.ax ? AURA.x - CANVAS3.ax : CANVAS3.ax - AURA.x) };
  const pool = out >= 0.98 ? null : out > 0.01 ? { ...aura, a: (aura.a ?? 1) * (1 - out) } : aura;
  return toSprite(f, pool, f.ax, f.ay);
}

// ---------------------------------------------------------------------------------------------

type Shared = Map<string, Sprite[]>;

/** His coming to a stand out of a run, from each of 8 moments of its turn; and setting off into it. */
export function ruStops(stand: Move3, runM: Move3): Move3[] {
  return Array.from({ length: SETTLES }, (_, i) => ({ ...stand, name: `${stand.name}: coming to a stand ${i}`, motion: ruSettle(runM, i / SETTLES, stand.rest) }));
}
export function ruStartOf(stand: Move3, runM: Move3): { move: Move3; phase: number } {
  const st = ruStart(runM, stand.rest);
  return { move: { ...runM, name: `${runM.name}: setting off`, motion: st.motion, stride: undefined }, phase: st.phase };
}

function setOf(view: RuSide, place: 'dungeon' | 'town' | 'card', shared: Shared): AnimSet {
  const list = (key: string, make: () => Sprite[]): Sprite[] => {
    const k = `${view}:${key}`;
    let l = shared.get(k);
    if (!l) shared.set(k, (l = make()));
    return l;
  };
  const at = (m: Move3, t: number): Sprite => ruSprite(m, t, view);
  const round = (m: Move3, fps: number): Sprite[] =>
    list(`round:${m.name}:${fps}`, () => {
      const { end, from } = spanOf(m);
      const t0 = from ?? 0;
      const n = Math.max(1, Math.round((end - t0) * fps));
      return lazyFrames(n, (i) => at(m, t0 + i / fps));
    });
  const clip = (m: Move3, fps: number, t0 = 0, t1 = spanOf(m).end, tag = ''): Clip => {
    const n = Math.max(1, Math.ceil((t1 - t0) * fps - 1e-6) + 1);
    const c: Clip = { frames: list(`clip:${m.name}${tag}:${fps}:${t0}:${t1}`, () => lazyFrames(n, (i) => at(m, Math.min(t1, t0 + i / fps)))), fps };
    if (m.motion.hit !== undefined && m.motion.hit >= t0 && m.motion.hit <= t1) c.hit = m.motion.hit - t0;
    if (m.motion.loop !== undefined) c.loop = m.motion.loop - t0;
    if (m.tail) c.tail = true;
    if (m.poise !== undefined && m.poise >= t0 && m.poise <= t1) c.poise = m.poise - t0;
    return c;
  };
  const spread = (m: Move3, n: number, t0: number, t1: number): Clip => ({ frames: list(`spread:${m.name}:${n}`, () => lazyFrames(n, (i) => at(m, t0 + ((t1 - t0) * i) / (n - 1)))), fps: n / Math.max(1e-6, t1 - t0) });
  const three = (c: Clip): Sprite[] => {
    const n = c.frames.length;
    const pick = (seconds: number): number => Math.max(0, Math.min(n - 1, Math.round(seconds * c.fps)));
    const hit = c.hit ?? (n - 1) / c.fps / 2;
    const picks = [pick(hit * 0.7), pick(hit + 0.035), pick(((n - 1) / c.fps + hit) / 2)];
    return lazyFrames(3, (i) => c.frames[picks[i]]);
  };
  const fights = place === 'dungeon';
  const stand = fights ? RU_STAND3 : RU_TOWN3;
  const runM = fights ? RU_RUN3 : RU_TOWN_RUN3;
  const attack = clip(RU_SHOT3, FPS);
  const heavy = clip(RU_VOLLEY3, FPS);
  const set: AnimSet = {
    idle: round(stand, FPS),
    walk: round(runM, GRIP_FPS),
    attack: three(attack),
    heavy: three(heavy),
    idleFps: FPS,
    walkFps: GRIP_FPS,
    walkStride: runM.stride,
    clips: { attack, heavy },
  };
  set.stops = ruStops(stand, runM).map((m) => clip(m, FPS));
  const start = ruStartOf(stand, runM);
  set.start = clip(start.move, GRIP_FPS);
  set.startAt = start.phase;
  const clips = set.clips as NonNullable<AnimSet['clips']>;
  if (fights) {
    set.walkWays = runWaysOf(runM).map((m, i) => list(`way:${i}`, () => {
      const { end, from } = spanOf(m);
      const t0 = from ?? 0;
      const n = Math.max(1, Math.round((end - t0) * GRIP_FPS));
      return lazyFrames(n, (k) => at(m, t0 + k / GRIP_FPS));
    }));
    clips.attackWalk = walkingOf(RU_SHOT3, runM).map((m, i) => clip(m, FPS, 0, spanOf(m).end, `:${i}`));
    clips.heavyWalk = walkingOf(RU_VOLLEY3, runM).map((m, i) => clip(m, FPS, 0, spanOf(m).end, `:${i}`));
    clips.reelWalk = walkingOf(RU_REEL3, runM, false).map((m, i) => clip(m, FPS, 0, spanOf(m).end, `:${i}`));
    clips.lurchWalk = walkingOf(RU_LURCH3, runM, false).map((m, i) => clip(m, FPS, 0, spanOf(m).end, `:${i}`));
  }
  const until = RU_ROLL3.tumble ?? spanOf(RU_ROLL3).end;
  clips.roll = spread(RU_ROLL3, ROLL_FRAMES, 0, until);
  if (spanOf(RU_ROLL3).end > until + 1e-6) clips.land = clip(RU_ROLL3, FPS, until);
  clips.fall = clip(RU_FALL3, FPS);
  clips.reel = clip(RU_REEL3, FPS);
  clips.lurch = clip(RU_LURCH3, FPS);
  if (view === 'front') {
    clips.idleA = clip(fights ? RU_SQUIRREL3 : RU_TSQUIRREL3, FPS);
    clips.idleB = clip(fights ? RU_SIGHTING3 : RU_TSIGHTING3, FPS);
    if (!fights) {
      const end = spanOf(RU_DRAW3).end;
      clips.ready = clip(RU_DRAW3, FPS, 0, Math.min(end, Math.max(READY_LEAST, (RU_DRAW3.ready ?? end) + READY_HELD)));
    }
  }
  return set;
}

/** HIS PICTURES FROM ALL EIGHT SIDES, each an AnimSet of the very same lists (as art/warrior_up_art.ts WuActorArt). */
export type RuActorArt = ActorArt & { toward: AnimSet; frontL: AnimSet; sideL: AnimSet; backL: AnimSet; away: AnimSet; side: AnimSet };

/** THE RANGER'S PICTURES, BROUGHT UP, for a place: what art/heroes3.ts gives in his place while RANGER_UP is on. */
export function makeRangerUpArt(place: 'dungeon' | 'town' | 'card', shared: Shared = new Map()): RuActorArt {
  const out = {} as Record<RuSide, AnimSet>;
  for (const side of WU_SIDES) Object.defineProperty(out, side, { enumerable: true, configurable: true, get: () => {
    const set = setOf(side, place, shared);
    Object.defineProperty(out, side, { value: set, enumerable: true });
    return set;
  } });
  return out as RuActorArt;
}
