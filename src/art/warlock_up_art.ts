// THE WARLOCK BROUGHT UP, THE MAN, AS THE GAME HOLDS HIM (the queue's finish-mage-and-warlock-eight-sides, step 4, 12 Nov 2026;
// docs/mockups/warlock_up2/README.md, "The man"). Behind art/warlock_up.ts WARLOCK_UP, OFF: art/warlock_art.ts takes these lists
// only with it on.
//
// The same lists, in the same shape, as art/warlock_art.ts gives the man (so the game, the side painter and the baking need nothing
// new: a hero painted from eight sides is one they know, art/sides.ts), from HIS OWN MOVES AS THE GAME HAS THEM (dev/warlock_moves.ts,
// warlock_spells.ts, warlock_hits.ts, art/warlock_fall.ts: the same keys, the same lengths, the same moments his spells go),
// painted by his own sculptor with his coat, boots and bones brought up (art/warlock_up.ts), FROM ALL EIGHT SIDES, each truly
// painted (art/warrior_up.ts WU_SPIN; none mirrored), EVERY LIST AT 30 PICTURES A SECOND (his run, which grips the floor, at 60,
// a picture for each of the game's steps, as before):
//   idle            his stand, hunched and pained (6.6 s: 198 pictures; it was 66 at ten a second); with his pact full, blazing
//   walk            his run, gripping (13 pictures at 60... as the game's); with his pact full, blazing
//   attack, heavy   the Hellfire Bolt and the Curse, the game's own
//   leap, land      the smoke step: the moments he is smoke laid over the step, his forming out of it after
//   reel, lurch     struck from in front and from behind
//   fall            his fall
//   ready           (on his card, from in front) his arm blazing up
//   change          (in a dungeon) the change into his demon: into the Living Shadow while art/shadow_art.ts LIVING_SHADOW is on,
//                   into the game's demon while it is off; at 30 a second either way, from his side
// A list the same in two places (a dungeon, town, his card) is ONE list, painted once (art/warlock_art.ts WarlockShare).

import type { Light, Sprite } from '../engine/px';
import type { ActorArt, AnimSet, Clip } from './actor_types';
import { HEAVY, lazyFrames, toSprite } from './kit';
import { CANVAS3 } from './skin';
import type { GameView } from './skin';
import { GRIP_SPEED } from './moves3';
import type { Bones } from './skeleton';
import type { Drawn } from '../dev/sculpt';
import { drawWarlockSculpt, warlockSculpt } from '../dev/sculpt_warlock';
import { FR, RUN_ROUND, STAND_LONG, drawWarlockAt, warlockMoves, warlockPose, withWarlockAt } from '../dev/warlock_moves';
import type { WarlockMove } from '../dev/warlock_moves';
import { BOLT_HIT, CURSE_HIT, STEP_GONE, STEP_LONG, warlockSpells } from '../dev/warlock_spells';
import { warlockLurch, warlockReel } from '../dev/warlock_hits';
import { CHANGE_ALL, changeFrame } from '../dev/warlock_change';
import { CHANGE_SCENE } from '../dev/warlock_fx';
import { warlockFall } from './warlock_fall';
import { WU_SPIN } from './warrior_up';
import type { WuSide } from './warrior_up';
import { EIGHT_ORDER } from './sides';
import { WARLOCK_UP } from './warlock_up';
import { LIVING_SHADOW, shadowChangeClipOf } from './shadow_art';

/** Every list at thirty a second; his run sixty, as the game shows a run. */
export const WL_FPS = { lists: 30, run: 60 };
/** The smoke step's pictures laid over its time as smoke (art/warlock_art.ts STEP_FRAMES: 10 over its 10 frames, thirty a second). */
const STEP_FRAMES = 10;

/** His pool of light: as the heroes' (art/warlock_art.ts AURA_MAN), on his canvas; the same, mirrored, for a side that faces left. */
const AURA_MAN: Light = { x: CANVAS3.ax - 4, y: CANVAS3.ay - 30, r: 46, color: '#28dcf0', a: 0.2 };
const AURA_SCENE: Light = { x: CHANGE_SCENE.ax, y: CHANGE_SCENE.ay - 50, r: 70, color: '#28dcf0', a: 0.18 };

/** The moves of his the game shows (the game's own, every one). */
export type WlKey = 'stand' | 'run' | 'bolt' | 'curse' | 'step' | 'reel' | 'lurch' | 'fall' | 'back';
let MOVES: Record<WlKey, WarlockMove> | undefined;
const byName = (list: readonly WarlockMove[], start: string): WarlockMove => {
  const m = list.find((x) => x.name.startsWith(start));
  if (!m) throw new Error(`warlock_up_art: no move "${start}"`);
  return m;
};
export function WL_MOVES(): Record<WlKey, WarlockMove> {
  if (MOVES) return MOVES;
  const [stand, run] = warlockMoves();
  const spells = warlockSpells();
  return (MOVES = {
    stand,
    run,
    bolt: byName(spells, 'Tap: hellfire bolt'),
    curse: byName(spells, 'Tap and hold: the Curse'),
    step: byName(spells, 'Swipe: the smoke step'),
    reel: warlockReel(),
    lurch: warlockLurch(),
    fall: warlockFall(),
    back: byName(spells, 'Meter dry: he comes back'),
  });
}

/** A blazing copy of a move of his (his pact full: as art/warlock_art.ts blazing). */
const blazing = (m: WarlockMove): WarlockMove => ({ ...m, blaze: [[0, 1], [m.long, 1]] });

/**
 * HIM AT A MOMENT OF A MOVE, BROUGHT UP, from one of his eight sides: his own sculpture on his own bones as the move has them
 * (dev/warlock_moves.ts withWarlockAt: his skirts trailing, the fire in his claws), dressed as art/warlock_up.ts dresses him,
 * truly turned (WU_SPIN), the three sides that face left laid with his floor point 98 across his canvas. The switch is turned on
 * for it (and put back as it was).
 */
export function paintWarlockUp(m: WarlockMove, t: number, side: WuSide): Drawn {
  const { spin, ax } = WU_SPIN[side];
  const was = WARLOCK_UP.on;
  WARLOCK_UP.on = true;
  try {
    return withWarlockAt(m, t, spin, () => drawWarlockSculpt(warlockSculpt('front', warlockPose(m.motion, t) as unknown as Bones, spin), undefined, { ...CANVAS3, ax }));
  } finally {
    WARLOCK_UP.on = was;
  }
}
/** As the game paints him for a side today (for the pictures' before): from in front, or truly from behind; never turned. */
export function paintWarlockGame(m: WarlockMove, t: number, side: WuSide): Drawn {
  const view: GameView = side === 'back' || side === 'away' || side === 'backL' || side === 'side' ? 'back' : 'front';
  const was = WARLOCK_UP.on;
  WARLOCK_UP.on = false;
  try {
    return drawWarlockAt(view, m, t);
  } finally {
    WARLOCK_UP.on = was;
  }
}

/** A frame of a move as the game holds it: his pool of light under him, mirrored with his floor point for a side that faces left. */
function manSprite(m: WarlockMove, t: number, side: WuSide): Sprite {
  const d = paintWarlockUp(m, t, side);
  const ax = WU_SPIN[side].ax;
  const aura = { ...AURA_MAN, x: ax + (ax === CANVAS3.ax ? AURA_MAN.x - CANVAS3.ax : CANVAS3.ax - AURA_MAN.x) };
  return toSprite({ px: d.px, lights: [] }, aura, ax, CANVAS3.ay);
}

// (the game's own ways of laying a move out as frames, as art/warlock_art.ts has them; every frame heavy, left to the side painter)
function round(long: number, fps: number, at: (t: number) => Sprite): Sprite[] {
  const n = Math.max(1, Math.round(long * fps));
  return lazyFrames(n, (i) => at(i / fps), true);
}
function clip(t0: number, t1: number, fps: number, at: (t: number) => Sprite, hit?: number, tail = false): Clip {
  const n = Math.max(1, Math.ceil((t1 - t0) * fps - 1e-6) + 1);
  const c: Clip = { frames: lazyFrames(n, (i) => at(Math.min(t1, t0 + i / fps)), true), fps };
  if (hit !== undefined) c.hit = hit - t0;
  if (tail) c.tail = true;
  return c;
}
function spread(t0: number, t1: number, n: number, at: (t: number) => Sprite): Clip {
  return { frames: lazyFrames(n, (i) => at(t0 + ((t1 - t0) * i) / (n - 1)), true), fps: n / Math.max(1e-6, t1 - t0) };
}
/** Its first frame, the blow's and its last (as art/warlock_art.ts three). */
function three(c: Clip): Sprite[] {
  const n = c.frames.length;
  const picks = [0, Math.min(n - 1, Math.round((c.hit ?? 0) * c.fps)), n - 1];
  return lazyFrames(3, (i) => {
    const was = HEAVY.defer;
    HEAVY.defer = false;
    try {
      return c.frames[picks[i]];
    } finally {
      HEAVY.defer = was;
    }
  });
}

/** What is the same in every place he is shown in, made once (art/warlock_art.ts WarlockShare). */
type Share = Map<string, unknown>;
function shared<T>(share: Share | undefined, key: string, make: () => T): T {
  if (!share) return make();
  if (!share.has(key)) share.set(key, make());
  return share.get(key) as T;
}
const own = (c: Clip): Clip => ({ ...c });

/**
 * THE CHANGE INTO HIS DEMON from a side of his, laid over the rules' time for it, thirty a second: into the Living Shadow
 * (art/shadow_art.ts) while it is on, into the game's demon (dev/warlock_change.ts, its own length) while it is off; both at
 * his turn for the side, on the change's scene (it is wide enough for every side: its floor point is its middle).
 */
function changeClip(side: WuSide): Clip {
  const { spin } = WU_SPIN[side];
  if (LIVING_SHADOW.on) return shadowChangeClipOf(spin);
  const n = Math.round(CHANGE_ALL * WL_FPS.lists) + 1;
  return spread(0, CHANGE_ALL, n, (t) => toSprite({ px: changeFrame('front', t, spin).d.px, lights: [] }, AURA_SCENE, CHANGE_SCENE.ax, CHANGE_SCENE.ay));
}

/** HIM, a man, from one side, in a place (with his pact full, `blaze`). */
function manSet(side: WuSide, place: 'dungeon' | 'town' | 'card', blaze: boolean, share?: Share): AnimSet {
  const M = WL_MOVES();
  const stand = blaze ? blazing(M.stand) : M.stand;
  const run = blaze ? blazing(M.run) : M.run;
  const F = WL_FPS.lists;
  const at = (m: WarlockMove) => (t: number): Sprite => manSprite(m, t, side);
  const key = `up:${side}:`;
  const idle = shared(share, `${key}${blaze ? 'blaze:' : ''}idle`, () => round(STAND_LONG, F, at(stand)));
  const walk = shared(share, `${key}${blaze ? 'blaze:' : ''}walk`, () => round(RUN_ROUND, WL_FPS.run, at(run)));
  const attack = shared(share, key + 'attack', () => clip(0, M.bolt.long, F, at(M.bolt), BOLT_HIT, true));
  const heavy = shared(share, key + 'heavy', () => clip(0, M.curse.long, F, at(M.curse), CURSE_HIT, true));
  // (the smoke step: from bursting into smoke to the first of his forming, over the step; his forming after)
  const leap = shared(share, key + 'leap', () => spread(STEP_GONE[0] - 1 * FR, STEP_GONE[1] + 1 * FR, STEP_FRAMES, at(M.step)));
  const land = shared(share, key + 'land', () => clip(STEP_GONE[1] + 1 * FR, STEP_LONG, F, at(M.step)));
  const reel = shared(share, key + 'reel', () => clip(0, M.reel.long, F, at(M.reel)));
  const lurch = shared(share, key + 'lurch', () => clip(0, M.lurch.long, F, at(M.lurch)));
  const fall = shared(share, key + 'fall', () => clip(0, M.fall.long, F, at(M.fall)));
  const set: AnimSet = {
    idle,
    walk,
    attack: shared(share, key + 'attack3', () => three(attack)),
    heavy: shared(share, key + 'heavy3', () => three(heavy)),
    idleFps: F,
    walkFps: WL_FPS.run,
    walkStride: GRIP_SPEED * RUN_ROUND,
    clips: { attack: own(attack), heavy: own(heavy), leap: own(leap), land: own(land), reel: own(reel), lurch: own(lurch), fall: own(fall) },
  };
  if (place !== 'dungeon') {
    // (on his class card, picked: his arm blazes up, from in front, as the game's: art/warlock_art.ts)
    if (place === 'card' && side === 'front') set.clips!.ready = clip(0, 1.4, F, at(blazing(M.stand)));
    return set;
  }
  // (CHANGING INTO THE DEMON: the same with his arm blazing or not; into the Living Shadow or the game's demon as its switch says)
  set.clips!.change = own(shared(share, `up:change:${LIVING_SHADOW.on ? 'shadow' : 'demon'}:${side}`, () => changeClip(side)));
  return set;
}

/** THE WARLOCK, A MAN, BROUGHT UP: from all eight sides (art/sides.ts EightArt), in a place, his arm blazing or not. */
export function makeWarlockUpArt(look: { place: 'dungeon' | 'town' | 'card'; blaze?: boolean }, share?: Share): ActorArt {
  const out: Record<string, AnimSet> = {};
  for (const side of EIGHT_ORDER) out[side] = manSet(side, look.place, !!look.blaze, share);
  return out as unknown as ActorArt;
}
