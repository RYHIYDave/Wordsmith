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
import { RUN_ROUND, brawlerMoves, drawBrawlerAt } from '../dev/brawler_moves';
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

function clip(t0: number, t1: number, fps: number, at: (t: number) => Sprite, hit?: number, tail = false): Clip {
  const n = Math.max(1, Math.ceil((t1 - t0) * fps - 1e-6) + 1);
  const c: Clip = { frames: lazyFrames(n, (i) => at(Math.min(t1, t0 + i / fps))), fps };
  if (hit !== undefined) c.hit = hit - t0;
  if (tail) c.tail = true;
  return c;
}
function spread(t0: number, t1: number, n: number, at: (t: number) => Sprite): Clip {
  return { frames: lazyFrames(n, (i) => at(t0 + ((t1 - t0) * i) / (n - 1))), fps: n / Math.max(1e-6, t1 - t0) };
}
function three(c: Clip): Sprite[] {
  const n = c.frames.length;
  const picks = [0, Math.min(n - 1, Math.round((c.hit ?? 0) * c.fps)), n - 1];
  return lazyFrames(3, (i) => c.frames[picks[i]]);
}

function hisSet(view: GameView): AnimSet {
  const turn = TURN[view];
  const at = (m: BrawlerMove) => (t: number): Sprite => toSprite({ px: drawBrawlerAt('front', m, t, turn).px, lights: [] }, AURA, CANVAS3.ax, CANVAS3.ay);
  const [stand, run] = brawlerMoves();
  const idle = lazyFrames(Math.round(stand.long * IDLE_FPS), (i) => at(stand)(i / IDLE_FPS));
  const walk = lazyFrames(Math.round(RUN_ROUND * RUN_FPS), (i) => at(run)(i / RUN_FPS));
  // (each run of presses: its last punch, from where the one before it was cut off to his guard)
  const punches: Record<string, Clip> = {};
  for (const key of PRESS_RUNS) {
    let made: { move: BrawlerMove; t0: number; hit: number } | null = null;
    const get = (): { move: BrawlerMove; t0: number; hit: number } => {
      if (made) return made;
      const ps = punchesOf(key);
      const c = chain(ps);
      const k = ps.length - 1;
      const t0 = k === 0 ? 0 : c.blows[k - 1].at + (ps[k - 1].cut - ps[k - 1].hit);
      const move: BrawlerMove = { name: `Combo ${key}`, motion: bake(c.motion, c.long, 60, ps.length > 1 ? 2 : 1, strikes(c.blows)), long: c.long, loops: false, blows: c.blows, air: c.air };
      made = { move, t0, hit: c.blows[k].at };
      return made;
    };
    // (its length and its blow are known without painting: the chain's numbers alone)
    const ps = punchesOf(key);
    const c = chain(ps);
    const k = ps.length - 1;
    const t0 = k === 0 ? 0 : c.blows[k - 1].at + (ps[k - 1].cut - ps[k - 1].hit);
    punches[key] = clip(t0, c.long, CLIP_FPS, (t) => at(get().move)(t), c.blows[k].at, true);
  }
  const s = slipCounter();
  const slip: BrawlerMove = { name: 'Swipe: slip and counter', motion: bake(s.motion, s.long, 60, 1, [...strikes(s.blows), s.dash]), long: s.long, loops: false, blows: s.blows, air: s.air, dash: s.dash };
  const leap = spread(SLIP_DASH[0], SLIP_DASH[1], DASH_FRAMES, at(slip));
  const land = clip(SLIP_DASH[1], s.long, CLIP_FPS, at(slip), s.blows.length ? s.blows[s.blows.length - 1].at : undefined);
  const reel = brawlerReel();
  const lurch = brawlerLurch();
  const fall = brawlerFall();
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
