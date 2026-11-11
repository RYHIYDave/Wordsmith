// THE MAGE BROUGHT UP, AS THE GAME HOLDS HER (the art chat's helper, 7 Nov 2026, a moment of a move painted; her lists by the
// Mage chat, 11 Nov 2026; behind art/mage_up.ts MAGE_UP, off).
//
// The same lists, in the same shape, as art/heroes3.ts gives the Mage (so the game, the side painter and the baking need
// nothing new), from HER OWN MOVES AS THE GAME HAS THEM on her new bones (art/mage_up_moves.ts), painted by her sculpted painter
// (art/mage_up.ts), FROM ALL EIGHT SIDES, each truly painted (art/warrior_up.ts WuSide; none mirrored), EVERY LIST AT 30
// PICTURES A SECOND (her runs, which grip the floor, at 60: a picture for each of the game's steps, as before):
//   idle        her guard, alive: 72 pictures (2.4 s; it was 24 at ten a second)      in town and on her card: her town stance, 72
//   walk        her run, gripping: 23 pictures at 60                                  in town: her town run, the same
//   stops       coming to a stand out of the run, 8 of them        start: setting off into the run (60 a second)
//   attack, heavy           the Wave and the Orb, the game's own (the Wave of 8 Oct is his measure of big and wild: untouched)
//   hold, holdStart, release  the Beam held, begun from her guard (a dungeon), and let go
//   reel, lurch, fall       struck from in front and from behind, her fall
//   idleA, idleB  (from in front) the mage light and the power getting away from her; in town the light and her reading, at 30
//                 (they were at 20)
//   ready         (from in front, in town and on her card) making ready when picked
// A list the same in two places is ONE list, painted once.

import type { Light, Sprite } from '../engine/px';
import type { ActorArt, AnimSet, Clip } from './actor_types';
import { lazyFrames, lightsOut, toSprite } from './kit';
import { STAFF_UP, settlesOf, startsOf } from './moves3';
import type { Move3 } from './moves3';
import { CANVAS3 } from './skin';
import { add, bonesAt, mul, solve } from './skeleton';
import type { Posed, Skeleton, V3 } from './skeleton';
import { paintMageUp } from './mage_up';
import type { MuFrame, MuSide } from './mage_up';
import { MU_MOVES } from './mage_up_moves';
import { WU_SIDES } from './warrior_up';

const FPS = 30;
const GRIP_FPS = 60;
const FRAME = 1 / 30;
/** How long the wind takes to go once round, where nothing else decides it (as art/heroes3.ts WIND). */
const WIND = 1.2;
/** As art/heroes3.ts: how long her stance is held at the end of making ready, and the least the whole of it lasts. */
const READY_HELD = 0.3;
const READY_LEAST = 1;
/** The pool of light behind her, on the painters' canvas (art/heroes3.ts AURA3). */
const AURA: Light = { x: CANVAS3.ax - 4, y: CANVAS3.ay - 30, r: 46, color: '#28dcf0', a: 0.2 };

function spanOf(m: Move3): { end: number; from: number | undefined } {
  const k = m.motion.keys;
  return { end: k.length ? k[k.length - 1].at : 0, from: m.motion.loop };
}
/** Where the wind has got to (0..1): as art/heroes3.ts windAt, so the cloth does not jump where a loop closes. */
function windOf(m: Move3, t: number): number {
  const { end, from } = spanOf(m);
  const long = from !== undefined ? end - from : end;
  if (long <= 1e-6) return 0;
  const period = long / Math.max(1, Math.round(long / WIND));
  const k = ((t - (from ?? 0)) / period) % 1;
  return k < 0 ? k + 1 : k;
}
/** A moment of a move, folded into its loop if it has one (as art/heroes3.ts paintMove3). */
function fold(m: Move3, t: number): number {
  const { end, from } = spanOf(m);
  const long = from !== undefined ? end - from : 0;
  const when = Math.max(0, t);
  return from !== undefined && long > 1e-6 && when >= end ? from + ((when - from) % long) : when;
}
export function muPosed(m: Move3, t: number): { q: Posed; s: Skeleton } {
  const q = bonesAt(m.motion.keys, m.rest, fold(m, t));
  return { q, s: solve(m.build, q) };
}
/** The moment `back` before a moment of a move: in a loop, a moment before its beginning is a moment before its end. */
function before(m: Move3, t: number, back: number): number {
  const { end, from } = spanOf(m);
  const long = from !== undefined ? end - from : 0;
  const now = fold(m, t);
  let w = now - back;
  if (from !== undefined && long > 1e-6 && now >= from && w < from && end > from) w += long;
  return Math.max(0, w);
}

/**
 * HER AT A MOMENT OF A MOVE, painted: with the figure a frame and three frames before (cloth follows), the wind, and where the
 * head of her staff has been over the last frame (the streak of light a swung crystal leaves: art/heroes3.ts paintMove3, the
 * same eight moments, from half way up her staff to its crystal).
 */
export function paintMuMove(m: Move3, t: number, view: MuSide, rim: string | null | undefined = undefined): MuFrame {
  const { q, s } = muPosed(m, t);
  const prev = muPosed(m, before(m, t, FRAME));
  const past = muPosed(m, before(m, t, 3 * FRAME)).s;
  const trail: [V3, V3][] = [];
  for (let i = 0; i <= 8; i++) {
    const sk = i === 0 ? s : muPosed(m, before(m, t, (FRAME * i) / 8)).s;
    trail.push([add(sk.handR, mul(sk.point, STAFF_UP * 0.5)), add(sk.handR, mul(sk.point, STAFF_UP))]);
  }
  const f = paintMageUp(s, q, view, m.build, { prev: prev.s, past, wind: windOf(m, t), trail }, rim === undefined ? undefined : rim);
  if (q.out > 0.01) return { ...f, ...lightsOut(f, q.out) };
  return f;
}

/** A frame of a move as the game holds it: cut down to her, with her lights, her pool of light and where her braids are fixed. */
export function muSprite(m: Move3, t: number, view: MuSide): Sprite {
  const f = paintMuMove(m, t, view);
  const out = muPosed(m, t).q.out;
  // (the three sides that face left are painted with her floor point 98 across the canvas: her pool of light goes with it)
  const aura = { ...AURA, x: f.ax + (f.ax === CANVAS3.ax ? AURA.x - CANVAS3.ax : CANVAS3.ax - AURA.x) };
  const pool = out >= 0.98 ? null : out > 0.01 ? { ...aura, a: (aura.a ?? 1) * (1 - out) } : aura;
  return toSprite(f, pool, f.ax, f.ay);
}

// ---------------------------------------------------------------------------------------------

type Shared = Map<string, Sprite[]>;

function setOf(view: MuSide, place: 'dungeon' | 'town' | 'card', shared: Shared): AnimSet {
  const list = (key: string, make: () => Sprite[]): Sprite[] => {
    const k = `${view}:${key}`;
    let l = shared.get(k);
    if (!l) shared.set(k, (l = make()));
    return l;
  };
  const at = (m: Move3, t: number): Sprite => muSprite(m, t, view);
  /** A move that goes round, as a list of frames to be shown one after another for ever. */
  const round = (m: Move3, fps: number): Sprite[] =>
    list(`round:${m.name}:${fps}`, () => {
      const { end, from } = spanOf(m);
      const t0 = from ?? 0;
      const n = Math.max(1, Math.round((end - t0) * fps));
      return lazyFrames(n, (i) => at(m, t0 + i / fps));
    });
  /** A move, or a piece of one from `t0` to `t1`, played by the clock. */
  const clip = (m: Move3, fps: number, t0 = 0, t1 = spanOf(m).end, tag = ''): Clip => {
    const n = Math.max(1, Math.ceil((t1 - t0) * fps - 1e-6) + 1);
    const c: Clip = { frames: list(`clip:${m.name}${tag}:${fps}:${t0}:${t1}`, () => lazyFrames(n, (i) => at(m, Math.min(t1, t0 + i / fps)))), fps };
    if (m.motion.hit !== undefined && m.motion.hit >= t0 && m.motion.hit <= t1) c.hit = m.motion.hit - t0;
    if (m.motion.loop !== undefined) c.loop = m.motion.loop - t0;
    if (m.tail) c.tail = true;
    if (m.poise !== undefined && m.poise >= t0 && m.poise <= t1) c.poise = m.poise - t0;
    return c;
  };
  /** The three frames older code asks an attack for (wound up, the blow, after it), taken from its clip. */
  const three = (c: Clip): Sprite[] => {
    const n = c.frames.length;
    const pick = (seconds: number): number => Math.max(0, Math.min(n - 1, Math.round(seconds * c.fps)));
    const hit = c.hit ?? (n - 1) / c.fps / 2;
    const picks = [pick(hit * 0.7), pick(hit + 0.035), pick(((n - 1) / c.fps + hit) / 2)];
    return lazyFrames(3, (i) => c.frames[picks[i]]);
  };
  const fights = place === 'dungeon';
  const M = MU_MOVES;
  const stand = fights ? M.mstand : M.mtown;
  const runM = fights ? M.mrun : M.mtownrun;
  const attack = clip(M.wave, FPS);
  const heavy = clip(M.orb, FPS);
  const set: AnimSet = {
    idle: round(stand, FPS),
    walk: round(runM, GRIP_FPS),
    attack: three(attack),
    heavy: three(heavy),
    idleFps: FPS,
    walkFps: GRIP_FPS,
    clips: { attack, heavy },
  };
  if (runM.stride !== undefined) set.walkStride = runM.stride;
  // (coming to a stand out of the run, and setting off into it: the game's own, moves3.ts settlesOf and startsOf, on her bones)
  const stops = settlesOf(runM, stand);
  if (stops.length) set.stops = stops.map((m, i) => clip(m, FPS, 0, spanOf(m).end, `:${i}`));
  const start = startsOf(runM, stand);
  if (start) {
    set.start = clip(start.move, GRIP_FPS);
    set.startAt = start.phase;
  }
  const clips = set.clips as NonNullable<AnimSet['clips']>;
  // (the Beam: held, and let go; begun from her guard only where there is fighting, as art/heroes3.ts has it)
  clips.hold = clip(M.beam, FPS);
  if (fights) clips.holdStart = clip(M.beamstart, FPS);
  clips.release = clip(M.beamend, FPS);
  clips.fall = clip(M.mfall, FPS);
  clips.reel = clip(M.mreel, FPS);
  clips.lurch = clip(M.mlurch, FPS);
  // (what she does when left standing is painted facing the camera only: the game turns her round for it)
  if (view === 'front') {
    clips.idleA = clip(fights ? M.mlight : M.tmlight, FPS);
    clips.idleB = clip(fights ? M.reading : M.treading, FPS);
    if (!fights) {
      const end = spanOf(M.mready).end;
      clips.ready = clip(M.mready, FPS, 0, Math.min(end, Math.max(READY_LEAST, (M.mready.ready ?? end) + READY_HELD)));
    }
  }
  return set;
}

/** HER PICTURES FROM ALL EIGHT SIDES, each an AnimSet of the very same lists (as art/warrior_up_art.ts WuActorArt). */
export type MuActorArt = ActorArt & { toward: AnimSet; frontL: AnimSet; sideL: AnimSet; backL: AnimSet; away: AnimSet; side: AnimSet };

/** THE MAGE'S PICTURES, BROUGHT UP, for a place: what art/heroes3.ts gives in her place while MAGE_UP is on. */
export function makeMageUpArt(place: 'dungeon' | 'town' | 'card', shared: Shared = new Map()): MuActorArt {
  const out = {} as Record<MuSide, AnimSet>;
  for (const side of WU_SIDES) Object.defineProperty(out, side, { enumerable: true, configurable: true, get: () => {
    const set = setOf(side, place, shared);
    Object.defineProperty(out, side, { value: set, enumerable: true });
    return set;
  } });
  return out as MuActorArt;
}
