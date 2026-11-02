// THE BRAWLER'S PICTURES IN THE GAME (the main chat, 28 Oct 2026; game/brawler.ts, behind BRAWLER).
//
// He is the art chat's, sculpted (src/dev/sculpt_classes.ts) and moved (src/dev/brawler_moves.ts, brawler_punches.ts,
// brawler_hits.ts, brawler_fall.ts), each move shown to the owner in the art chat (docs/mockups/classes/HANDBACK.md). This
// file only turns those moves into the frames the game shows (art/actor_types.ts AnimSet), painted when first asked for
// (lazyFrames). Nothing here changes how he looks. From behind he is drawn truly (the figure in front turned +90°), at the
// owner's pick of 28 Oct in the art chat, “Draw them true (Recommended)”.
//
// HIS PUNCHES, AS COMBOS: each press's punch is played as the art chat's combo plays it (dev/brawler_punches.ts chain: each
// punch wound up from where the one before carried through, the last seen out to his guard), from where the punch before
// it was cut off. So for every run of presses there can be (tap or hold, one to three of them: fourteen) the clip of its
// last punch is kept, by the presses' letters (T a tap, H a hold): AnimSet clips.punches.
//
// HIS MOMENTS:
//   standing, running              his boxer's habits (the stand) and his run
//   his taps and holds             the punch of each place of a combo (clips.punches); attack and heavy, his jab and cross
//   his swipe                      the slip: his weaving dash laid over the swipe's time (`leap`); the counter hook after (`land`)
//   struck, struck from behind     brawler_hits.ts; his fall, brawler_fall.ts (down on his knees)

import type { Light, Sprite } from '../engine/px';
import type { ActorArt, AnimSet, Clip } from './actor_types';
import { lazyFrames, toSprite } from './kit';
import { CANVAS3 } from './skin';
import type { GameView } from './skin';
import { GRIP_SPEED } from './moves3';
import { RUN_ROUND, brawlerAt, brawlerMoves, drawBrawlerOf } from '../dev/brawler_moves';
import type { BrawlerMove } from '../dev/brawler_moves';
import { SLIP_DASH, bake, chain, punchFor, slipCounter, strikes } from '../dev/brawler_punches';
import type { Punch } from '../dev/brawler_punches';
import { brawlerLurch, brawlerReel } from '../dev/brawler_hits';
import { brawlerFall } from '../dev/brawler_fall';

const IDLE_FPS = 10;
const RUN_FPS = 60;
const CLIP_FPS = 30;
/** How many pictures his weaving dash is painted in, laid over the swipe's time. */
const DASH_FRAMES = 8;

const AURA: Light = { x: CANVAS3.ax - 4, y: CANVAS3.ay - 30, r: 46, color: '#28dcf0', a: 0.2 };
/** From in front as the game shows heroes; from behind truly, turned +90°. */
const TURN: Record<GameView, number> = { front: 0, back: 90 };

/** Every run of presses a combo can have been so far: T a tap, H a hold, one to three of them. */
export const PRESS_RUNS: readonly string[] = (() => {
  const out: string[] = [];
  const go = (s: string): void => {
    if (s.length) out.push(s);
    if (s.length < 3) {
      go(s + 'T');
      go(s + 'H');
    }
  };
  go('');
  return out;
})();

/** The punches a run of presses makes (the art chat's comboOf, for a run of any length). */
function punchesOf(run: string): Punch[] {
  const out: Punch[] = [];
  let before: Punch['hand'] | null = null;
  let holds = 0;
  [...run].forEach((c, i) => {
    const hold = c === 'H';
    const p = punchFor(i as 0 | 1 | 2, hold, before, holds);
    out.push(p);
    before = p.hand;
    if (hold) holds++;
  });
  return out;
}

/**
 * HIS FRAMES ARE THE SIDE PAINTER'S IN A GAME (his word, 1 Nov 2026, 10:19: “I had some stutter issues with the brawler loading
 * his hold ability”): a frame of his is a tenth of a second and more to paint, and a combo's first frame seconds (its move made
 * then: comboMove). So where the game is played a frame of his not painted yet is shown as the nearest of its list that is
 * (art/kit.ts HEAVY), as the Warlock's are; the painter's worker paints the first frame of every list of his first
 * (render/painter.ts), then the rest.
 */
const HEAVY_HIM = true;

/** Each run of presses' move (its chain baked: seconds), made the first time a frame of it is painted, once for both views. */
const combos = new Map<string, { move: BrawlerMove }>();
function comboMove(key: string): { move: BrawlerMove } {
  let made = combos.get(key);
  if (made) return made;
  const ps = punchesOf(key);
  const c = chain(ps);
  made = { move: { name: `Combo ${key}`, motion: bake(c.motion, c.long, 60, ps.length > 1 ? 2 : 1, strikes(c.blows)), long: c.long, loops: false, blows: c.blows, air: c.air } };
  combos.set(key, made);
  return made;
}

function clip(t0: number, t1: number, fps: number, at: (t: number) => Sprite, hit?: number, tail = false, heavy = HEAVY_HIM, stand?: () => readonly Sprite[] | undefined): Clip {
  const n = Math.max(1, Math.ceil((t1 - t0) * fps - 1e-6) + 1);
  const c: Clip = { frames: lazyFrames(n, (i) => at(Math.min(t1, t0 + i / fps)), heavy, stand), fps };
  if (hit !== undefined) c.hit = hit - t0;
  if (tail) c.tail = true;
  return c;
}
function spread(t0: number, t1: number, n: number, at: (t: number) => Sprite): Clip {
  return { frames: lazyFrames(n, (i) => at(t0 + ((t1 - t0) * i) / (n - 1)), HEAVY_HIM), fps: n / Math.max(1e-6, t1 - t0) };
}
function three(c: Clip): Sprite[] {
  const n = c.frames.length;
  const picks = [0, Math.min(n - 1, Math.round((c.hit ?? 0) * c.fps)), n - 1];
  return lazyFrames(3, (i) => c.frames[picks[i]]);
}

/**
 * Him at a moment of a move, in a view. THE SAME MOMENT IS THE SAME PICTURE (the art chat's helper, 1 Nov 2026;
 * docs/cheap_heroes.md): all that a moment of his is drawn from is his pose and how his coat swings and lies
 * (dev/brawler_moves.ts brawlerAt), so a moment alike to one painted already, to the last bit (his guard as each punch, struck,
 * struck from behind and his fall begin; his standing breath coming round), is not painted again.
 */
const madeIn = new Map<GameView, Map<string, Sprite>>();
const num = (v: unknown): string =>
  typeof v === 'number' ? (Object.is(v, -0) ? '-0' : String(v)) : Array.isArray(v) ? `[${v.map(num).join(',')}]` : v && typeof v === 'object' ? `{${Object.keys(v).sort().map((k) => `${k}:${num((v as Record<string, unknown>)[k])}`).join(',')}}` : JSON.stringify(v) ?? 'undefined';
const atIn = (view: GameView) => (m: BrawlerMove) => (t: number): Sprite => {
  let made = madeIn.get(view);
  if (!made) madeIn.set(view, (made = new Map()));
  const at = brawlerAt(m, t);
  const key = num(at);
  let s = made.get(key);
  if (!s) made.set(key, (s = toSprite({ px: drawBrawlerOf('front', at, TURN[view]).px, lights: [] }, AURA, CANVAS3.ax, CANVAS3.ay)));
  return s;
};
/**
 * Him standing and running, in a view (his moves for these made at once: a few thousandths of a second). One list of each for
 * each view, his class card's and the game's alike: what is painted for the card is not painted again in the game.
 */
const standRuns = new Map<GameView, { idle: Sprite[]; walk: Sprite[] }>();
function standRun(view: GameView): { idle: Sprite[]; walk: Sprite[] } {
  const had = standRuns.get(view);
  if (had) return had;
  const at = atIn(view);
  const [stand, run] = brawlerMoves();
  const made = {
    idle: lazyFrames(Math.round(stand.long * IDLE_FPS), (i) => at(stand)(i / IDLE_FPS), HEAVY_HIM),
    walk: lazyFrames(Math.round(RUN_ROUND * RUN_FPS), (i) => at(run)(i / RUN_FPS), HEAVY_HIM),
  };
  standRuns.set(view, made);
  return made;
}
/** Made the first time it is wanted, and only once (for both views). */
function once<T>(make: () => T): () => T {
  let made: T | undefined;
  return () => (made ??= make());
}
/**
 * HIS MOVES THAT TAKE SECONDS TO MAKE (every key of them steadied: his slip and counter, struck, struck from behind, his fall),
 * made once for both views (they were made for each: twice the wait), as his whole set is first wanted (in the game; not for
 * his class card, makeBrawlerCardArt). Made with the set, not when first painted: in the game the page paints many of his
 * frames itself, and a second's wait the first time he is struck, or seconds as he falls, would be felt in a fight.
 */
const slipNumbers = once(slipCounter);
const slipMove = once((): BrawlerMove => {
  const s = slipNumbers();
  return { name: 'Swipe: slip and counter', motion: bake(s.motion, s.long, 60, 1, [...strikes(s.blows), s.dash]), long: s.long, loops: false, blows: s.blows, air: s.air, dash: s.dash };
});
const reelMove = once(brawlerReel);
const lurchMove = once(brawlerLurch);
const fallMove = once(brawlerFall);

function hisSet(view: GameView): AnimSet {
  const at = atIn(view);
  const { idle, walk } = standRun(view);
  // (each run of presses: its last punch, from where the one before it was cut off to his guard)
  const punches: Record<string, Clip> = {};
  for (const key of PRESS_RUNS) {
    const get = (): { move: BrawlerMove } => comboMove(key);
    // (its length and its blow are known without painting: the chain's numbers alone)
    const ps = punchesOf(key);
    const c = chain(ps);
    const k = ps.length - 1;
    const t0 = k === 0 ? 0 : c.blows[k - 1].at + (ps[k - 1].cut - ps[k - 1].hit);
    // (while none of a combo is painted in a game, its last press's own punch stands in for it, and for a jab or a cross his
    // standing: never seconds of a combo made where the game is played; the painter makes them, a jab and a cross first)
    const last = key[key.length - 1];
    punches[key] = clip(t0, c.long, CLIP_FPS, (t) => at(get().move)(t), c.blows[k].at, true, true, () => (key.length > 1 ? punches[last]?.frames : idle));
  }
  const s = slipNumbers();
  const slip = slipMove();
  const reel = reelMove();
  const lurch = lurchMove();
  const fall = fallMove();
  const leap = spread(SLIP_DASH[0], SLIP_DASH[1], DASH_FRAMES, at(slip));
  const land = clip(SLIP_DASH[1], s.long, CLIP_FPS, at(slip), s.blows.length ? s.blows[s.blows.length - 1].at : undefined);
  return {
    idle,
    walk,
    attack: three(punches.T),
    heavy: three(punches.H),
    idleFps: IDLE_FPS,
    walkFps: RUN_FPS,
    walkStride: GRIP_SPEED * RUN_ROUND,
    clips: {
      attack: punches.T,
      heavy: punches.H,
      punches,
      leap,
      land,
      reel: clip(0, reel.long, CLIP_FPS, at(reel)),
      lurch: clip(0, lurch.long, CLIP_FPS, at(lurch)),
      fall: clip(0, fall.long, CLIP_FPS, at(fall)),
    },
  };
}

/** The Brawler's pictures, both views. */
export function makeBrawlerArt(): ActorArt {
  return { front: hisSet('front'), back: hisSet('back') };
}
/**
 * HIM ON HIS CLASS CARD (ui/panels.ts): standing and running, all a card shows, made at once. (His whole set waits on the moves
 * that take seconds to make, slipMove and the rest: the start screen stood still while they were, and his card with it. The owner, 31 Oct
 * 2026, 18:23: "Can you animate the tinkerer and the brawler on the character select screen in the test version".)
 */
export function makeBrawlerCardArt(): ActorArt {
  const set = (view: GameView): AnimSet => {
    const { idle, walk } = standRun(view);
    return { idle, walk, attack: idle, idleFps: IDLE_FPS, walkFps: RUN_FPS, walkStride: GRIP_SPEED * RUN_ROUND };
  };
  return { front: set('front'), back: set('back') };
}
