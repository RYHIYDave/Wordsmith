// THE VETERAN'S PICTURES IN THE GAME (the main chat, 3 Nov 2026; behind game/veteran.ts VETERAN, which is off).
//
// He is the art chat's (art/brawler-looks, docs/mockups/brawler_looks/README.md; his pick of 2 Nov 2026, “7, the Veteran”):
// sculpted (dev/sculpt_veteran.ts) and moved (dev/veteran_moves.ts VET_MOTIONS), every move shown to the owner in the art
// chat's film. This file only turns those moves into the frames the game shows (art/actor_types.ts AnimSet), each painted the
// first time it is asked for (lazyFrames). NOTHING HERE CHANGES HOW HE LOOKS: a frame of his is the art's pose at that frame
// (vetAt), painted as the art's film paints it (paintVeteran, truly turned as the move turns him: spinAt), at the game's size.
// From in front as the game shows heroes; from behind truly, turned +90° (his pick of 28 Oct, “Draw them true
// (Recommended)”), as the art's film shows him from behind.
//
// HIS LISTS:
//   idle              his stance, bouncing on his toes: the art's 60-frame round, 30 a second
//   walk              his run: its 16-frame round (the fighter's bounce since 3 Nov 2026: VET_RUN.long), shown by the floor it covers at the hero's pace (walkStride)
//   clips.vet         each move a press makes, by the art's id (game/veteran.ts VetBlowId): `long` frames, frame f the art's
//                     frame f (the game shows Math.floor(vet.move.f))
//   clips.vetHalves   each strike's half-frames, from its held wind-up's last frame to its last blow (its after-images: the
//                     art's film lays him half a frame back and a whole frame back along the strike)
//   clips.reel        struck (the art's 'hurt'); clips.fall, his fall
//   clips.vetFx       each move's action lines (art/veteran_fx_art.ts), its `long` and VET_FX_AFTER frames more, in three
//                     layers: on the floor, behind him at height, over everything
//
// HIS FRAMES ARE THE SIDE PAINTER'S IN A GAME: a frame of his is a few tenths of a second to paint (the old Brawler's were a
// tenth: his word, 1 Nov 2026, 10:19, “I had some stutter issues with the brawler loading his hold ability”). So every list of
// his is HEAVY (art/kit.ts): where the game is played a frame not painted yet is shown as the nearest of its list that is,
// and a list with none painted yet stands on his stance (a strike's half-frames on its move's own frames); the painter's
// worker (render/painter.ts) paints the first frame of every list of his first, then his stance and run whole, then the
// rest, every move coarse to fine.

import type { Light, Sprite } from '../engine/px';
import type { VetBlowId } from '../game/veteran';
import type { ActorArt, AnimSet, Clip } from './actor_types';
import { asking } from './asked';
import { lazyFrames, toSprite } from './kit';
import type { GameView } from './skin';
import { EIGHT_MORE, MORE_SIDES, MORE_TURN } from './sides_more';
import type { MoreSide } from './sides_more';
import { VET_CANVAS, paintVeteran } from '../dev/sculpt_veteran';
import type { VetPose } from '../dev/sculpt_veteran';
import { VET_RUN, VET_STAND, VET_TILE, VFPS, carryAt, motionById, spinAt, vetAt } from '../dev/veteran_moves';
import type { VetMotion } from '../dev/veteran_moves';
import { VET_FX_AFTER, paintVetFx, vetFxFrames } from './veteran_fx_art';
import type { VetFxLayer } from './veteran_fx_art';

/** The pool of light behind him, as behind every hero (the friend's cyan). */
const AURA: Light = { x: VET_CANVAS.ax - 4, y: VET_CANVAS.ay - 30, r: 46, color: '#28dcf0', a: 0.2 };
/** From in front as the game shows heroes; from behind truly, turned +90° (as the art's film). */
export const VET_TURN: Record<GameView, number> = { front: 0, back: 90 };
/**
 * A SIDE OF HIS: the two the game has always had, or one of the six more he has from all eight sides (art/sides_more.ts
 * EIGHT_MORE.brawler; the Tinkerer chat, 11 Nov 2026): the same figure at the same frame, truly turned (MORE_TURN: `front` and
 * `back` are VET_TURN's own 0 and 90, so those two are the same pictures to the pixel).
 */
export type VetSide = MoreSide;
/** His moves made by a press, in the order the painter paints them (the most thrown first). */
export const VET_LISTS: readonly VetBlowId[] = ['jab', 'cross', 'hook', 'roundkick', 'dodge', 'push', 'elbow', 'uppercut', 'knee', 'spinkick', 'spinkickClose'];
/** How far his run's round carries him, tiles (its 12 frames at the game's hero pace). */
export const VET_RUN_STRIDE = carryAt(VET_RUN, VET_RUN.long)[0] / VET_TILE;
/** Every list of his is the side painter's (art/kit.ts HEAVY). */
const HEAVY_HIM = true;

/**
 * THE HALF-FRAMES OF A MOVE'S STRIKE (its after-images): from the held wind-up's last frame and a half to its last blow and a
 * half (the art's: dev/veteran_scene.ts lays him half a frame back from every frame after the wind-up is let go, to one after
 * its last blow lands). [first half-frame, how many]; none for a move with no strike.
 */
export function vetHalvesOf(m: VetMotion): [number, number] | null {
  if (!m.strikes.length) return null;
  const from = Math.min(...m.strikes.map((s) => s.from));
  const last = Math.max(...m.strikes.map((s) => Math.max(s.at, ...s.hits.map((h) => h.f))));
  return [from + 0.5, last - from + 1];
}

/**
 * Him at a frame of a move (fractional frames for the half-frames), in a view: THE ART'S POSE PAINTED AS THE ART PAINTS IT.
 * The same pose is the same picture, painted once (the first frame of every move is his stance, still).
 */
const madeIn = new Map<VetSide, Map<string, Sprite>>();
const num = (v: unknown): string =>
  typeof v === 'number' ? (Object.is(v, -0) ? '-0' : String(v)) : Array.isArray(v) ? `[${v.map(num).join(',')}]` : v && typeof v === 'object' ? `{${Object.keys(v).sort().map((k) => `${k}:${num((v as Record<string, unknown>)[k])}`).join(',')}}` : JSON.stringify(v) ?? 'undefined';
/** The pose and the turn a frame of his is painted from (the art's: vetAt, and the move's whole turn on the view's). */
export function vetPoseAt(view: VetSide, m: VetMotion, f: number): { pose: VetPose; turn: number } {
  const p = vetAt(m, f);
  return { pose: p, turn: MORE_TURN[view] + spinAt(m, f) };
}
/** Him painted at a frame of a move, as a frame of the game's (a Sprite at the game's grain, his floor point its anchor). */
export function vetFrame(view: VetSide, m: VetMotion, f: number): Sprite {
  let made = madeIn.get(view);
  if (!made) madeIn.set(view, (made = new Map()));
  const { pose, turn } = vetPoseAt(view, m, f);
  const key = num({ b: pose.bones, t: pose.trail, r: pose.ripple, p: pose.phase, a: !!pose.air, l: pose.palmL, h: pose.palmR, turn });
  let s = made.get(key);
  if (!s) made.set(key, (s = toSprite({ px: paintVeteran(pose, turn).px, lights: [] }, AURA, VET_CANVAS.ax, VET_CANVAS.ay)));
  return s;
}

/** A list that reads another's frames (no frame of its own: each read goes to the other list as it is then). */
function readsOf(list: () => readonly Sprite[], picks: readonly number[]): Sprite[] {
  const out: Sprite[] = new Array<Sprite>(picks.length);
  picks.forEach((k, i) => Object.defineProperty(out, i, { configurable: true, enumerable: true, get: () => list()[k] }));
  return out;
}

/** Each frame of a move, frame 0 to `long` - 1, at 30 a second; while none is painted where the game is played, `stand`. */
function moveClip(view: VetSide, m: VetMotion, stand: () => readonly Sprite[] | undefined): Clip {
  // (`asking`: his moves are kept packed where he is baked from eight sides, render/baked.ts PACKS: a frame asked for and not
  // there tells the bake, which unpacks the move; art/asked.ts)
  const c: Clip = { frames: asking(lazyFrames(m.long, (i) => vetFrame(view, m, i), HEAVY_HIM, stand)), fps: VFPS };
  const at = m.strikes.length ? Math.min(...m.strikes.map((s) => s.at)) : undefined;
  if (at !== undefined) c.hit = at / VFPS;
  return c;
}

/** Him standing and running, in a view: one list of each for each view, his class card's and the game's alike. */
const standRuns = new Map<VetSide, { idle: Sprite[]; walk: Sprite[] }>();
function standRun(view: VetSide): { idle: Sprite[]; walk: Sprite[] } {
  const had = standRuns.get(view);
  if (had) return had;
  const idle = lazyFrames(VET_STAND.long, (i) => vetFrame(view, VET_STAND, i), HEAVY_HIM);
  const walk = lazyFrames(VET_RUN.long, (i) => vetFrame(view, VET_RUN, i), HEAVY_HIM, () => idle);
  const made = { idle, walk };
  standRuns.set(view, made);
  return made;
}

function hisSet(view: VetSide): AnimSet {
  const { idle, walk } = standRun(view);
  const stand = (): readonly Sprite[] => idle;
  const vet: Record<string, Clip> = {};
  const vetHalves: Record<string, { from: number; frames: Sprite[] }> = {};
  const vetFx: Record<string, Record<VetFxLayer, Sprite[]>> = {};
  for (const id of VET_LISTS) {
    const m = motionById(id);
    const c = moveClip(view, m, stand);
    vet[id] = c;
    const hv = vetHalvesOf(m);
    if (hv) {
      const [from, n] = hv;
      // (while none of them is painted, the move's own frame half a frame on stands in)
      const own = readsOf(() => c.frames, Array.from({ length: n }, (_, k) => Math.min(m.long - 1, Math.ceil(from + k))));
      vetHalves[id] = { from, frames: asking(lazyFrames(n, (k) => vetFrame(view, m, from + k), HEAVY_HIM, () => own)) };
    }
    const fxOf = (layer: VetFxLayer): Sprite[] => vetFxFrames(m.long + VET_FX_AFTER, (i) => paintVetFx(m, i, view, layer));
    vetFx[id] = { ground: fxOf('ground'), behind: fxOf('behind'), front: fxOf('front') };
  }
  const reel = moveClip(view, motionById('hurt'), stand);
  const fall = moveClip(view, motionById('fall'), stand);
  const three = (c: Clip): Sprite[] => readsOf(() => c.frames, [0, Math.round((c.hit ?? 0) * c.fps), c.frames.length - 1]);
  return {
    idle,
    walk,
    attack: three(vet.jab),
    heavy: three(vet.roundkick),
    idleFps: VFPS,
    walkFps: VFPS,
    walkStride: VET_RUN_STRIDE,
    clips: { attack: vet.jab, heavy: vet.roundkick, reel, fall, vet, vetHalves, vetFx },
  };
}

/**
 * The Veteran's pictures: both views; with art/sides_more.ts EIGHT_MORE.brawler on, ALL EIGHT SIDES, each truly painted and none
 * a mirror (art/sides.ts: the game then shows the side for the way he faces, as it does the Warrior's). His class card keeps
 * its two: a card shows him from in front.
 */
export function makeVeteranArt(): ActorArt {
  if (!EIGHT_MORE.brawler) return { front: hisSet('front'), back: hisSet('back') };
  const all = {} as Record<VetSide, AnimSet>;
  for (const side of MORE_SIDES) all[side] = hisSet(side);
  return all;
}
/** HIM ON HIS CLASS CARD (ui/panels.ts): standing and running, all a card shows. */
export function makeVeteranCardArt(): ActorArt {
  const set = (view: GameView): AnimSet => {
    const { idle, walk } = standRun(view);
    return { idle, walk, attack: idle, idleFps: VFPS, walkFps: VFPS, walkStride: VET_RUN_STRIDE };
  };
  return { front: set('front'), back: set('back') };
}
