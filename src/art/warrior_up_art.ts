// THE WARRIOR BROUGHT UP, AS THE GAME HOLDS HIM (the art chat's helper, 6 Nov 2026; behind art/warrior_up.ts WARRIOR_UP, off).
//
// The same lists, in the same shape, as art/heroes3.ts gives the knight (so the game, the side painter and the baking need
// nothing new), from his moves (art/warrior_up_moves.ts) painted by his sculpted painter (art/warrior_up.ts). HE MOVES AS HE
// USED TO where the owner asked it (7 Nov 2026: “Just make him move like he used to.”; “Nothing about town needed to change.”):
// his run, his run in town, his town stance and looking about him are THE GAME'S OWN, at the game's own rates and as many
// pictures (art/heroes3.ts: a run 30 a second by the clock, a standing loop 10, looking about him 20); like the game's knight he
// has no stops and no setting off. The rest at 30 pictures a second, as the owner approved them (6 Nov):
//   idle        his rear stance, alive: 60 pictures (2 s) at 30     in town and on his card: the game's town stance, 12 at 10
//   walk        the game's run: 15 pictures at 30 (0.5 s), by the clock     in town: the game's town run, the same
//   attack, attack2, heavy    Strike's two swings and the Slam, by Movement 9 (their numbers: warrior_up_moves.ts)
//   leap, land  the Lunge's dive (16 pictures by how far through) and its landing   whirl: the Whirlwind, once round in 12
//   reel, lurch, fall         struck from in front and from behind (7 frames), his fall (46)
//   idleA       (from in front, in town and on his card) looking about him, the game's: 73 pictures at 20 (3.6 s)
//   ready       (the same) drawing his sword when picked: 41 pictures at 30 (to the stance and 0.3 s held)
// A list that is the same in a dungeon, in town and on his card (all but standing, running and their stops and start) is ONE
// list, painted once, as the Warlock's are (docs/cheap_heroes.md): fewer pictures to paint, hold and bake.

import type { Light, Sprite } from '../engine/px';
import type { ActorArt, AnimSet, Clip } from './actor_types';
import { lazyFrames, lightsOut, toSprite } from './kit';
import type { Move3 } from './moves3';
import { CANVAS3 } from './skin';
import { add, bonesAt, mul, solve } from './skeleton';
import type { Posed, Skeleton, V3 } from './skeleton';
import { GREAT_BLADE } from './moves3';
import { onBack } from './carried';
import { paintWarriorUp } from './warrior_up';
import type { WuFrame, WuSide } from './warrior_up';
import { WU_SIDES } from './warrior_up';
import { WU_DRAW3, WU_FALL3, WU_LOOK3, WU_LURCH3, WU_REAR3, WU_REEL3, WU_RUN3, WU_SLAM3, WU_SLASH3, WU_STRIKE3, WU_THRUST3, WU_TOWN3, WU_TOWN_RUN3, WU_WHIRL3 } from './warrior_up_moves';

const FPS = 30;
/** The game's own rates (art/heroes3.ts IDLE_FPS3, RUN_FPS3, GESTURE_FPS3), for the lists that move as the game's do. */
export const WU_GAME_FPS = { idle: 10, run: 30, gesture: 20 } as const;
const FRAME = 1 / 30;
const LEAP_FRAMES = 16;
const READY_HELD = 0.3;
const READY_LEAST = 1;
/** The pool of light behind him, as behind every hero (art/heroes3.ts AURA3: the friend's cyan). */
const AURA: Light = { x: CANVAS3.ax - 4, y: CANVAS3.ay - 30, r: 46, color: '#28dcf0', a: 0.2 };

/**
 * THE SMEAR OF EACH STRIKE (Movement 9): the frames of a move whose blade is drawn smeared, with its after-images, from where it
 * was two frames before (seconds, from-to, inclusive); outside them the blade is clean. The Whirlwind is smeared all round.
 */
export const WU_SMEARS: Readonly<Record<string, readonly [number, number]>> = {
  [WU_STRIKE3.name]: [9 * FRAME, 11 * FRAME],
  [WU_SLASH3.name]: [9 * FRAME, 11 * FRAME],
  [WU_SLAM3.name]: [14 * FRAME, 16 * FRAME],
  [WU_WHIRL3.name]: [0, 1],
};

function spanOf(m: Move3): { end: number; from: number | undefined } {
  const k = m.motion.keys;
  return { end: k.length ? k[k.length - 1].at : 0, from: m.motion.loop };
}

/** Where the wind is (0..1) at a moment of a move: whole turns in a loop (art/heroes3.ts windAt's way). */
function windOf(m: Move3, t: number): number {
  const { end, from } = spanOf(m);
  const long = from !== undefined ? end - from : end;
  if (long <= 1e-6) return 0;
  const period = long / Math.max(1, Math.round(long / 1.2));
  const k = ((t - (from ?? 0)) / period) % 1;
  return k < 0 ? k + 1 : k;
}

/** His pose at a moment of a move (a loop folded into its turn), and the bones of it. */
export function wuPosed(m: Move3, t: number): { q: Posed; s: Skeleton } {
  const { end, from } = spanOf(m);
  const long = from !== undefined ? end - from : 0;
  let when = Math.max(0, t);
  if (from !== undefined && long > 1e-6) {
    if (when >= end) when = from + ((when - from) % long);
    if (when < from) when = Math.max(0, when);
  }
  const q = bonesAt(m.motion.keys, m.rest, when);
  return { q, s: solve(m.build, q) };
}
/** A moment `back` seconds before `t` (in a loop, before its beginning is before its end). */
function before(m: Move3, t: number, back: number): number {
  const { end, from } = spanOf(m);
  const long = from !== undefined ? end - from : 0;
  let w = t - back;
  if (from !== undefined && long > 1e-6 && w < from) w += long;
  return Math.max(0, w);
}

/** The blade's guard and point at a moment (on his back, where it is put away). */
function bladeAt(m: Move3, t: number): readonly [V3, V3] {
  const { q, s } = wuPosed(m, t);
  const away = q.stow > 0.5 ? onBack(m.build, s, 'sword') : null;
  const grip = away ? away.grip : s.handR;
  const point = away ? away.point : s.point;
  return [add(grip, mul(point, 1.3)), add(grip, mul(point, 1.3 + GREAT_BLADE))];
}

/** Whether a moment of a move is drawn smeared (its strike). */
export function wuSmeared(m: Move3, t: number): boolean {
  const w = WU_SMEARS[m.name];
  return !!w && t >= w[0] - 1e-6 && t <= w[1] + 1e-6;
}

/** HIM AT A MOMENT OF A MOVE, painted: with the figure a frame and three frames before (cloth follows), the wind, and his smear. */
export function paintWu(m: Move3, t: number, view: WuSide, rim: string | null | undefined = undefined): WuFrame {
  const { q, s } = wuPosed(m, t);
  const prev = wuPosed(m, before(m, t, FRAME)).s;
  const past = wuPosed(m, before(m, t, 3 * FRAME)).s;
  let trail: (readonly [V3, V3])[] | undefined;
  const smeared = wuSmeared(m, t);
  if (smeared) {
    // (where the blade has been over the last two frames, newest first; the Whirlwind's over the last one)
    const span = m === WU_WHIRL3 ? FRAME : 2 * FRAME;
    trail = [];
    for (let i = 0; i <= 10; i++) trail.push(bladeAt(m, before(m, t, (span * i) / 10)));
  }
  const f = paintWarriorUp(s, q, view, m.build, { prev, past, trail, smear: smeared ? 1 : 0, wind: windOf(m, t) }, rim === undefined ? undefined : rim);
  if (q.out > 0.01) {
    const o = lightsOut(f, q.out);
    return { ...f, ...o };
  }
  return f;
}

/** A frame of a move as the game holds it: cut down to him, with his lights, his pool of light and where his scarf's ends are fixed. */
export function wuSprite(m: Move3, t: number, view: WuSide): Sprite {
  const f = paintWu(m, t, view);
  const out = wuPosed(m, t).q.out;
  // (his pool of light where it is under every hero, by his feet: on a side that faces left, as far the other way)
  const aura = { ...AURA, x: f.ax + (f.ax === CANVAS3.ax ? AURA.x - CANVAS3.ax : CANVAS3.ax - AURA.x) };
  const pool = out >= 0.98 ? null : out > 0.01 ? { ...aura, a: (aura.a ?? 1) * (1 - out) } : aura;
  return toSprite(f, pool, f.ax, f.ay);
}

// ---------------------------------------------------------------------------------------------

/** The lists, made once for each view and shared by every place that shows the same (one HeroArt's worth). */
type Shared = Map<string, Sprite[]>;

function setOf(view: WuSide, place: 'dungeon' | 'town' | 'card', shared: Shared): AnimSet {
  const list = (key: string, make: () => Sprite[]): Sprite[] => {
    const k = `${view}:${key}`;
    let l = shared.get(k);
    if (!l) shared.set(k, (l = make()));
    return l;
  };
  const at = (m: Move3, t: number): Sprite => wuSprite(m, t, view);
  const round = (m: Move3, fps: number): Sprite[] =>
    list(`round:${m.name}:${fps}`, () => {
      const { end, from } = spanOf(m);
      const t0 = from ?? 0;
      const n = Math.max(1, Math.round((end - t0) * fps));
      return lazyFrames(n, (i) => at(m, t0 + i / fps));
    });
  const clip = (m: Move3, fps: number, t0 = 0, t1 = spanOf(m).end): Clip => {
    const n = Math.max(1, Math.ceil((t1 - t0) * fps - 1e-6) + 1);
    const c: Clip = { frames: list(`clip:${m.name}:${fps}:${t0}:${t1}`, () => lazyFrames(n, (i) => at(m, Math.min(t1, t0 + i / fps)))), fps };
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
  const town = place !== 'dungeon';
  const stand = town ? WU_TOWN3 : WU_REAR3;
  const runM = town ? WU_TOWN_RUN3 : WU_RUN3;
  const attack = clip(WU_STRIKE3, FPS);
  const attack2 = clip(WU_SLASH3, FPS);
  const heavy = clip(WU_SLAM3, FPS);
  // (his town stance at the game's own rate; his rear stance, alive, at 30; his runs the game's, by the clock, at its 30, with no
  // stride to grip by and, as the game's knight, no stops and no setting off)
  const idleFps = town ? WU_GAME_FPS.idle : FPS;
  const set: AnimSet = {
    idle: round(stand, idleFps),
    walk: round(runM, WU_GAME_FPS.run),
    attack: three(attack),
    heavy: three(heavy),
    idleFps,
    walkFps: WU_GAME_FPS.run,
    clips: { attack, attack2, heavy },
  };
  if (runM.stride !== undefined) set.walkStride = runM.stride;
  const clips = set.clips as NonNullable<AnimSet['clips']>;
  const until = WU_THRUST3.arc ? WU_THRUST3.arc.until : spanOf(WU_THRUST3).end;
  clips.leap = spread(WU_THRUST3, LEAP_FRAMES, 0, until);
  const leap = clips.leap;
  set.leap = lazyFrames(3, (i) => leap.frames[Math.round([0.05, 0.45, 0.9][i] * (LEAP_FRAMES - 1))]);
  clips.land = clip(WU_THRUST3, FPS, until);
  clips.whirl = { ...clip(WU_WHIRL3, FPS), turns: true };
  clips.fall = clip(WU_FALL3, FPS);
  clips.reel = clip(WU_REEL3, FPS);
  clips.lurch = clip(WU_LURCH3, FPS);
  if (view === 'front' && town) {
    clips.idleA = clip(WU_LOOK3, WU_GAME_FPS.gesture);
    const end = spanOf(WU_DRAW3).end;
    clips.ready = clip(WU_DRAW3, FPS, 0, Math.min(end, Math.max(READY_LEAST, (WU_DRAW3.ready ?? end) + READY_HELD)));
  }
  return set;
}

/**
 * THE WARRIOR'S PICTURES, BROUGHT UP, for a place (a dungeon, town, his class card): what art/heroes3.ts gives in his place while
 * WARRIOR_UP is on. `shared`: one map for every place of one HeroArt, so that a list the same in two places is one list.
 */
export function makeWarriorUpArt(place: 'dungeon' | 'town' | 'card', shared: Shared = new Map()): WuActorArt {
  const out = {} as Record<WuSide, AnimSet>;
  // (each side's lists made when first asked for: a set of lists is cheap, its frames are painted when first read)
  for (const side of WU_SIDES) Object.defineProperty(out, side, { enumerable: true, configurable: true, get: () => {
    const set = setOf(side, place, shared);
    Object.defineProperty(out, side, { value: set, enumerable: true });
    return set;
  } });
  return out as WuActorArt;
}

/**
 * HIS PICTURES FROM ALL EIGHT SIDES (art/warrior_up.ts WuSide), each an AnimSet of the very same lists, each truly painted:
 * `front` and `back` where the game has always looked for a hero's two (`back` now truly turned, his sword in his right hand),
 * and `toward`, `frontL`, `sideL`, `backL`, `away` and `side` beside them. The game, while it knows only front and back, reads
 * those two and mirrors as it always has; to show him in eight facings it takes the side `wuFacing` gives and never mirrors it
 * (docs/mockups/warrior_up/README.md, "His eight facings").
 */
export type WuActorArt = ActorArt & { toward: AnimSet; frontL: AnimSet; sideL: AnimSet; backL: AnimSet; away: AnimSet; side: AnimSet };

/**
 * THE SIDE FOR A FACING, as the game should choose it for eight (the main chat's to wire in; while it is not, the game chooses
 * front or back and mirrors as it always has): (fx, fy) the way he faces on the game's floor. Never a mirror: each of the eight
 * is painted.
 */
export function wuFacing(fx: number, fy: number): WuSide {
  const a = (Math.atan2(fy, fx) * 180) / Math.PI;
  const k = ((Math.round(a / 45) % 8) + 8) % 8;
  // (0: down and to the right; then round by 45 degrees: down, down-left, left, up-left, up, up-right, right)
  return (['front', 'toward', 'frontL', 'sideL', 'backL', 'away', 'back', 'side'] as const)[k];
}

/** The way the game's tails (his scarf's ends, engine/tails.ts) should take him to face for a side: +1 to the right of the screen,
 * -1 to the left (straight up or down the screen: +1, as the game has it where fx - fy is 0). His frame's roots are never
 * mirrored now: each side's are where that side is painted. */
export function wuTailsFacing(side: WuSide): 1 | -1 {
  return side === 'frontL' || side === 'sideL' || side === 'backL' ? -1 : 1;
}
