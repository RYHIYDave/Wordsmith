// THE TINKERER'S PICTURES IN THE GAME, HER GOLEM'S AND HER CONTRAPTION'S (the main chat, 28 Oct 2026; game/tinkerer.ts,
// behind TINKERER).
//
// They are the art chat's, sculpted (src/dev/sculpt_tinkerer.ts, sculpt_golem.ts, sculpt_contraption.ts) and moved
// (src/dev/tinkerer_moves.ts, tinkerer_hold.ts, tinkerer_hits.ts, tinkerer_fall.ts; golem_moves.ts; contraption_fx.ts), each
// shown to the owner in the art chat (docs/mockups/classes/HANDBACK.md: what he said yes to, and what he has seen and not
// judged). This file only turns those moves into the frames the game shows, in the shape it holds its heroes and monsters in
// (art/actor_types.ts AnimSet), painted when first asked for (lazyFrames). Nothing here changes how they look.
//
// FROM BEHIND, AS THE CAMERA TRULY SEES THEM, NOT IN A MIRROR: his pick of 28 Oct in the art chat, “Draw them true
// (Recommended)” (his word before it: “It seems like every time we get drawings from behind the arms switch sides.  I don't
// understand why that happens”). The art chat's way: the figure drawn from in front, turned +90° (art/skeleton.ts project
// 'rear' is the same picture), so what is in her right hand is on the right of the picture. Her wrench stays on her right
// shoulder, the Golem's giant arm on its own side.
//
// HER MOMENTS:
//   standing, running              her stand (6 s, cocky, gleeful) and her quick light sprint
//   her tap (with CONTRAPTION)     the art chat's own: a Contraption thrown down (clips.tapAs)
//   her tap                        her VIAL TOSS (her tap since the owner's words of 28 Oct, by 16:31: “I think for her I’d like
//                                  her to start with golem and a vial toss”): the art chat's Contraption throw, her vial off her
//                                  belt in her fist in its place (it leaves her hand at TAP_LET_GO; the game draws its flight)
//   her tap and hold               she points the wrench, whistles her Golem on, hops for joy as its fist comes down
//   her swipe                      the blast jump: the moments she is flung laid over the swipe's time (as a leap's are),
//                                  her coming down and rising after (`land`)
//   struck, struck from behind     tinkerer_hits.ts; her fall, tinkerer_fall.ts
// THE GOLEM: standing (its pose at rest), its knuckling walk, its punch, its ground pound, its cannon, its winding down.
// THE CONTRAPTION: shut and tumbling (thrown), springing open, set up, its mortar kicked by a shot, broken.

import type { Light, Sprite } from '../engine/px';
import type { ActorArt, AnimSet, Clip } from './actor_types';
import { lazyFrames, toSprite } from './kit';
import { CANVAS3 } from './skin';
import type { GameView } from './skin';
import type { Drawn } from '../dev/sculpt';
import { BJ, FR, TAP_GRAB, TAP_LET_GO, TRUN_ROUND, TSTAND_LONG, drawTinkerAt, tinkerMoves } from '../dev/tinkerer_moves';
import type { TinkMove } from '../dev/tinkerer_moves';
import { HOLD, drawTinkerHoldAt, tinkerHold } from '../dev/tinkerer_hold';
import { tinkerLurch, tinkerReel } from '../dev/tinkerer_hits';
import { drawTinkerFallAt, tinkerFall } from '../dev/tinkerer_fall';
import { GCANNON, GDOWN, GP, GPUNCH, GUPPER, GWALK, golemCannon, golemDown, golemPunch, golemUppercut, golemWalk, groundPound } from '../dev/golem_moves';
import { GOLEM_LOOK, TINKER_TUNE } from '../game/tinkerer';
import { GOLEM_GUN, GOLEM_PICK, GOLEM_POSE, sculptGolemBuild } from '../dev/sculpt_golem';
import { CONTRAPTION_PICK, CONTRAPTION_POSE, sculptContraptionBuild } from '../dev/sculpt_contraption';
import { CDOWN, CT, contraptionDown } from '../dev/contraption_fx';
import { UNITS_PER_TILE } from './moves3';

/** Frames a second: a standing loop, a run (its feet gripping, as the heroes' runs), what is played once. */
const IDLE_FPS = 10;
const RUN_FPS = 60;
const CLIP_FPS = 30;
/** How many pictures the blast jump's flight is painted in, laid over the swipe's time. */
const FLY_FRAMES = 12;

/** Their pool of light: as the heroes' (art/heroes3.ts). */
const AURA: Light = { x: CANVAS3.ax - 4, y: CANVAS3.ay - 30, r: 46, color: '#28dcf0', a: 0.2 };
const AURA_SMALL: Light = { x: CANVAS3.ax, y: CANVAS3.ay - 10, r: 22, color: '#28dcf0', a: 0.14 };

/** From in front as the game shows heroes; from behind truly (the figure turned +90°: see the head of this file). */
const TURN: Record<GameView, number> = { front: 0, back: 90 };
/**
 * THE GOLEM is built facing the eye, a little to the left (dev/sculpt_golem.ts: turned 0, it is the Golem he picked); the
 * game's pictures from in front face down the screen and to the right (turned 45), and truly from behind, up it and to the
 * right (turned 135, as the art chat's films show it from behind: tests/golem_moves.test.ts). Both turns are among the
 * eight its checks are run on.
 */
const GOLEM_TURN: Record<GameView, number> = { front: 45, back: 135 };
/** THE CONTRAPTION is built throwing to the picture's right (dev/sculpt_contraption.ts): turned to throw down and to the right, and up and to the right. */
const CON_TURN: Record<GameView, number> = { front: 315, back: 45 };

const asSprite = (d: Drawn, aura: Light, tall = 0): Sprite => toSprite({ px: d.px, lights: [] }, aura, CANVAS3.ax, CANVAS3.ay + tall);

function round(long: number, fps: number, at: (t: number) => Sprite): Sprite[] {
  const n = Math.max(1, Math.round(long * fps));
  return lazyFrames(n, (i) => at(i / fps));
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
/** Its first frame, the blow's and its last, each painted only when asked for. */
function three(c: Clip): Sprite[] {
  const n = c.frames.length;
  const picks = [0, Math.min(n - 1, Math.round((c.hit ?? 0) * c.fps)), n - 1];
  return lazyFrames(3, (i) => c.frames[picks[i]]);
}
const byName = (list: readonly TinkMove[], start: string): TinkMove => {
  const m = list.find((x) => x.name.startsWith(start));
  if (!m) throw new Error(`tinkerer_art: no move "${start}"`);
  return m;
};

// ---- HER ---------------------------------------------------------------------------------------

function herSet(view: GameView): AnimSet {
  const turn = TURN[view];
  const moves = tinkerMoves();
  const stand = byName(moves, 'Standing');
  const run = byName(moves, 'Running');
  const jump = byName(moves, 'Swipe');
  const tap = byName(moves, 'Tap');
  const hold = tinkerHold();
  const reel = tinkerReel();
  const lurch = tinkerLurch();
  const fall = tinkerFall();
  const at = (m: TinkMove, draw = drawTinkerAt) => (t: number): Sprite => asSprite(draw('front', m, t, turn), AURA, m.tall ?? 0);
  const idle = round(TSTAND_LONG, IDLE_FPS, at(stand));
  const walk = round(TRUN_ROUND, RUN_FPS, at(run));
  // (her Vial Toss: the throw with a vial of hers in her fist, from when she has it off her belt to when she lets it go)
  const toss: TinkMove = { ...tap, name: 'Tap: a vial tossed', hold: (t) => ({ wrench: 0, twirl: false, spin: 0, vial: t >= TAP_GRAB && t < TAP_LET_GO ? 1 : 0, held: null }) };
  const attack = clip(0, tap.long, CLIP_FPS, at(toss), TAP_LET_GO, true);
  // (her Contraption thrown down, the art chat's own tap: her tap with the talent that swaps it in, CONTRAPTION on her tree)
  const throwDown = clip(0, tap.long, CLIP_FPS, at(tap), TAP_LET_GO, true);
  // (her whistle: the game shows her picture's wind-up as her own, up to her whistle; and from then on at its own pace, so
  // that she springs for joy as her Golem's blow lands, TINKER_TUNE.golem.pound's lead and hit after her whistle)
  const P = TINKER_TUNE.golem.pound;
  const heavy = clip(0, hold.long, CLIP_FPS, at(hold, drawTinkerHoldAt), (HOLD.blow - Math.round((P.lead + P.hit) * 30)) * FR, true);
  // (the blast jump: from the blast to her coming down, over the swipe; her crouch and rising after)
  const leap = spread(BJ.boom * FR, BJ.land * FR, FLY_FRAMES, at(jump));
  const land = clip(BJ.land * FR, jump.long, CLIP_FPS, at(jump));
  const struck = clip(0, reel.long, CLIP_FPS, at(reel));
  const struckBehind = clip(0, lurch.long, CLIP_FPS, at(lurch));
  const down = clip(0, fall.long, CLIP_FPS, at(fall, drawTinkerFallAt));
  return {
    idle,
    walk,
    attack: three(attack),
    heavy: three(heavy),
    idleFps: IDLE_FPS,
    walkFps: RUN_FPS,
    walkStride: TRUN_ROUND * (run.travel ?? 0),
    clips: { attack, tapAs: { contraption: throwDown }, heavy, leap, land, reel: struck, lurch: struckBehind, fall: down },
  };
}

/** The Tinkerer's pictures, both views. */
export function makeTinkererArt(): ActorArt {
  return { front: herSet('front'), back: herSet('back') };
}

// ---- HER GOLEM ---------------------------------------------------------------------------------

type GolemPose = Partial<typeof GOLEM_POSE>;
const REST: typeof GOLEM_POSE = { swing: 0, fold: 0, lean: 0, bob: 0, feet: [0, 0, 0, 0], level: 0, dim: 0, crumple: 0 };

/** The Golem posed so, drawn (its pose put back after). `aim` and `kick`: its cannon's. */
function golemAt(view: GameView, pose: GolemPose & { aim?: number; kick?: number }): Sprite {
  Object.assign(GOLEM_POSE, REST, pose);
  try {
    return asSprite(sculptGolemBuild('front', GOLEM_PICK.build, GOLEM_TURN[view], -14, GOLEM_PICK.giant, GOLEM_GUN.gun, pose.aim ?? 0, pose.kick ?? 0), AURA);
  } finally {
    Object.assign(GOLEM_POSE, REST);
  }
}
/** A move of the Golem's, by its frames (30 a second): `pose(f)` its pose at frame f. */
function golemClip(view: GameView, end: number, pose: (f: number) => GolemPose & { aim?: number; kick?: number }, hit?: number): Clip {
  return clip(0, end * FR, CLIP_FPS, (t) => golemAt(view, pose(Math.round(t / FR))), hit === undefined ? undefined : hit * FR, true);
}

function golemSet(view: GameView): AnimSet {
  const walk = lazyFrames(GWALK.round, (i) => golemAt(view, golemWalk(i)));
  // (its uppercut, GOLEM_LOOK, the main chat's at his word of 28 Oct, 20:26, his yes by 21:41; off, its old punch)
  const punch = GOLEM_LOOK.uppercut ? golemClip(view, GUPPER.end, golemUppercut, GUPPER.hit) : golemClip(view, GPUNCH.end, golemPunch, GPUNCH.hit);
  const pound = golemClip(view, GP.end, groundPound, GP.hit);
  const cannon = golemClip(view, GCANNON.end, golemCannon, GCANNON.fire);
  const down = golemClip(view, GDOWN.end, golemDown);
  return {
    // (standing: as he picked it, at rest; TO BE MADE ALIVE WHEN STILL by the art chat, as every figure is)
    idle: lazyFrames(1, () => golemAt(view, {})),
    walk,
    attack: three(punch),
    heavy: three(pound),
    idleFps: IDLE_FPS,
    walkFps: CLIP_FPS,
    // (its fist and feet gripping the floor: GWALK.speed is in her measure a second)
    walkStride: ((GWALK.round / CLIP_FPS) * GWALK.speed) / UNITS_PER_TILE,
    clips: { attack: punch, heavy: pound, attack2: cannon, fall: down },
  };
}

/** Her Golem's pictures, both views. */
export function makeGolemArt(): ActorArt {
  return { front: golemSet('front'), back: golemSet('back') };
}

// ---- HER CONTRAPTION ---------------------------------------------------------------------------

/** The tripod mortar posed so, drawn (its pose put back after). */
function contraptionAt(view: GameView, pose: Partial<typeof CONTRAPTION_POSE>, spin = 0): Sprite {
  const was = { ...CONTRAPTION_POSE };
  Object.assign(CONTRAPTION_POSE, pose);
  try {
    return asSprite(sculptContraptionBuild('front', CONTRAPTION_PICK, (CON_TURN[view] + spin) % 360), AURA_SMALL);
  } finally {
    Object.assign(CONTRAPTION_POSE, was);
  }
}

/** Its pictures in one view: shut and tumbling (eight turns of it), springing open, set up, kicked by a shot, broken. */
export interface ContraptionArt {
  /** Shut, as it flies and bounces: turned round in eighths. */
  tumble: Sprite[];
  /** Springing open, shut to set up (CT.open0 to CT.open1). */
  open: Clip;
  /** Set up, its lamp lit (one picture). */
  stand: Sprite[];
  /** A shot: its mortar kicked down its barrel at once, easing back up. */
  shot: Clip;
  /** Broken: its end. */
  broke: Clip;
}

function contraptionSet(view: GameView): ContraptionArt {
  const KICK = 10;
  return {
    tumble: lazyFrames(8, (i) => contraptionAt(view, { open: 0, kick: 0, lit: 0, broke: 0 }, i * 45)),
    open: spread(0, (CT.open1 - CT.open0) * FR, CT.open1 - CT.open0 + 1, (t) => contraptionAt(view, { open: t / ((CT.open1 - CT.open0) * FR), kick: 0, lit: 0, broke: 0 })),
    stand: lazyFrames(1, () => contraptionAt(view, { open: 1, kick: 0, lit: 1, broke: 0 })),
    shot: clip(0, KICK * FR, CLIP_FPS, (t) => contraptionAt(view, { open: 1, kick: Math.exp(-t / FR / 2.5), lit: 1, broke: 0 })),
    broke: clip(0, CDOWN.end * FR, CLIP_FPS, (t) => contraptionAt(view, contraptionDown(Math.round(t / FR)))),
  };
}

/** Her Contraption's pictures, both views. */
export function makeContraptionArt(): { front: ContraptionArt; back: ContraptionArt } {
  return { front: contraptionSet('front'), back: contraptionSet('back') };
}
