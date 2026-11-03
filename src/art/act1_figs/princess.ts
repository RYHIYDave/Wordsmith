// ACT 2, PART TWO, THE HIGH CITY: FLOOR 16'S BOSS: THE PRINCESS: her pictures as the game holds a monster (art/act1_figs/types.ts):
// the art chat's (art/princess.ts, princess_moves.ts, princess_ride.ts, spectral_steed.ts; his yes to her look, “Yes, that's her
// (Recommended)”, her steed, “Yes, that's the steed (Recommended)”, her horse “The horse is perfect”, her whip's look “Yes, lock
// it (Recommended)”), as handed over: makePrincessArt3(), on the heroes' bones (mobSet, in front and from behind): her hover
// (stand), her glide (walk, painted for four tiles a second), the nettle vine lash (attack), struck (reel), her death (she sinks
// to her knees, her nettles withering), and in clips.moves the vine snare (snare), the Eleven (eleven), the Vow (vow), and her
// ultimate's three, the steed forming (rideForm), a leap (rideLeap) and the steed fading (rideEnd).
//
// HER THINGS (`princessThings`): what her casting leaves and sends, the art chat's too (art/princess_fx.ts, art/garden_swans.ts):
// the snare's cage through its life (bursting up, holding at each of its stages of life, shaking as each blow lands, withering,
// bursting apart), each frame in two halves (what is behind the floor point under its middle and what is before it, so that
// the hero inside it stands among its vines: render/act1_fx/princess.ts); the Vow's ring (bursting, held, thinning); her
// garden's swans in the air, circling her (the art's `fly`), and diving (the Eleven: `dive`), from in front and from behind.
// Tens of thousandths of a second each to paint: the painter makes them ahead as her floor is come to (art/films.ts
// things:princess), so that none is painted in her fight; where it has not, the first time each is wanted.
//
// HEAVY: a boss, on a canvas of 570 by 510 of the art's pixels (PR_CANVAS): painted for floor 16 by the painter (render/
// painter.ts), beside the game, and let go of after (art/bestiary.ts HEAVY_FIGURES). What her frames take: PRINCESS_COST.
//
// The art chat's switches, PRINCESS_ON and SWAN_ON, are left as it has them, off: nothing of the game draws her while HIGH_CITY
// is off (game/act1.ts).

import { toSprite } from '../kit';
import type { Painted } from '../kit';
import { swanFrame } from '../garden_swans';
import { makePrincessArt3 } from '../princess_moves';
import { SNARE_CANVAS, SNARE_FX, VOW_CANVAS, VOW_FX, snarePainted, vowPainted } from '../princess_fx';
import type { SnareState } from '../princess_fx';
import type { GameView } from '../skin';
import type { Sprite } from '../../engine/px';
import type { Act1Fig } from './types';

/** What her frames take, as measured (30 Oct 2026: every frame of both her views painted once, under the tests' paintWithoutCanvas, on this container's two shared cores): frames, megabytes held (four bytes a pixel, at the art's grain), seconds of painting. */
export const PRINCESS_COST = { frames: 892, mb: 25.0, seconds: 44 };
/** And her things' (princessThings, measured so): frames, megabytes, seconds. */
export const THINGS_COST = { frames: 208, mb: 20.8, seconds: 5 };

export const FIG: Act1Fig | null = {
  make: () => makePrincessArt3(),
  // (measured off her stand as tests/act2_princess.test.ts measures it)
  size: { top: 38, half: 10 },
  heavy: true,
};

// ---------------------------------------------------------------------------------------------
// HER THINGS

/** The snare's stages of life (its life in blows: game/act1_rules/princess.ts PRINCESS.snare.life, held equal by the tests). */
export const SNARE_STAGES = 3;
/**
 * WHICH OF THE SNARE'S FRAMES ARE PAINTED (seconds from her blow, as SNARE_FX has them): its rising (`rise`: the floor heaving,
 * then the burst's two frames); held, a loop of `hold` frames round its writhing (`loop` seconds, from `from`) at each stage of
 * its life; shaken as a blow lands (`struck`: how long since) at each; withering and sinking (`wither`, from SNARE_FX.sink, at
 * `fps`) at each; bursting apart (`breaks` frames at `fps`), from its last stage.
 */
export const SNARE_FRAMES = { rise: [1 / 30, 2 / 30, 0.1 + 1 / 30, 1 / 6] as const, hold: 10, from: 0.2, loop: Math.PI / 2, struck: [0.03, 0.09] as const, wither: 6, breaks: 14, fps: 10, breakFps: 15 };
/** Which of the Vow's: bursting (`burst`), held (a loop of `hold` round its breathing edge, `loop` seconds, from `from`), thinning (`fade` at `fps`, from VOW_FX.hold). */
export const VOW_FRAMES = { burst: [1 / 30, 2 / 30] as const, hold: 16, from: 0.1, loop: (2 * Math.PI) / 3, fade: 6, fps: 10 };
/** Her swans in the air (the art's `fly`, one wingbeat a round, SWAN_FLY 0.6 s) and diving (`dive`, SWAN_DIVE 0.4 s): frames a second. */
export const SWAN_FRAMES = { fly: 12, dive: 8, fps: 20 };

/** One frame of the snare: when (from her blow), and its state (art/princess_fx.ts SnareState). */
interface SnareShot {
  t: number;
  st: SnareState;
}
const stageHp = (k: number): number => (SNARE_STAGES - k) / SNARE_STAGES;
/** Every frame of the snare that is painted, in order: rising; then for each stage, held, shaken, withering; then bursting apart. */
export function snareShots(): SnareShot[] {
  const F = SNARE_FRAMES;
  const out: SnareShot[] = F.rise.map((t) => ({ t, st: {} }));
  for (let k = 0; k < SNARE_STAGES; k++) {
    const hp = stageHp(k);
    for (let i = 0; i < F.hold; i++) out.push({ t: F.from + (i / F.hold) * F.loop, st: { hp } });
    for (const ago of F.struck) out.push({ t: F.from, st: { hp, hitAgo: ago } });
    for (let i = 0; i < F.wither; i++) out.push({ t: SNARE_FX.sink[0] + i / F.fps, st: { hp } });
  }
  for (let i = 0; i < F.breaks; i++) out.push({ t: F.from, st: { hp: stageHp(SNARE_STAGES - 1), brokenAgo: i / F.breakFps } });
  return out;
}
/**
 * Which frame of the snare shows it `t` seconds after her blow, as much of it left as `hp` (1 to 0), struck `hitAgo` seconds ago
 * (none: not lately), broken `brokenAgo` seconds ago (none: not broken); -1 before it has begun to heave.
 */
export function snareFrameAt(t: number, hp: number, hitAgo?: number, brokenAgo?: number): number {
  const F = SNARE_FRAMES;
  const per = F.hold + F.struck.length + F.wither;
  const base = F.rise.length;
  if (brokenAgo !== undefined) return base + SNARE_STAGES * per + Math.min(F.breaks - 1, Math.max(0, Math.floor(brokenAgo * F.breakFps)));
  if (t < 0) return -1;
  if (t < SNARE_FX.burst[1] - 1e-6) return t < 0.05 ? 0 : t < SNARE_FX.burst[0] ? 1 : t < (SNARE_FX.burst[0] + SNARE_FX.burst[1]) / 2 ? 2 : 3;
  const k = Math.max(0, Math.min(SNARE_STAGES - 1, Math.round((1 - hp) * SNARE_STAGES)));
  const at = base + k * per;
  if (t >= SNARE_FX.sink[0]) return at + F.hold + F.struck.length + Math.min(F.wither - 1, Math.floor((t - SNARE_FX.sink[0]) * F.fps));
  if (hitAgo !== undefined && hitAgo < SNARE_FX.hit) return at + F.hold + (hitAgo < (F.struck[0] + F.struck[1]) / 2 ? 0 : 1);
  const u = (((t - F.from) % F.loop) + F.loop) % F.loop;
  return at + Math.min(F.hold - 1, Math.floor((u / F.loop) * F.hold));
}

/** The Vow's frames that are painted (seconds from her blow), in order. */
export function vowShots(): number[] {
  const F = VOW_FRAMES;
  const out: number[] = [...F.burst];
  for (let i = 0; i < F.hold; i++) out.push(F.from + (i / F.hold) * F.loop);
  for (let i = 0; i < F.fade; i++) out.push(VOW_FX.hold + i / F.fps);
  return out;
}
/** Which frame of the Vow shows it `t` seconds after her blow (-1 before, and once thinned away). */
export function vowFrameAt(t: number): number {
  const F = VOW_FRAMES;
  if (t < 0 || t >= VOW_FX.hold + VOW_FX.fade) return -1;
  if (t < F.from) return t < 0.05 ? 0 : 1;
  if (t < VOW_FX.hold) {
    const u = (t - F.from) % F.loop;
    return F.burst.length + Math.min(F.hold - 1, Math.floor((u / F.loop) * F.hold));
  }
  return F.burst.length + F.hold + Math.min(F.fade - 1, Math.floor((t - VOW_FX.hold) * F.fps));
}

/** A painting cut in two at its floor point's row: what lies behind it (above that row) and what before it (below). */
function halves(f: Painted, ax: number, ay: number): [Sprite, Sprite] {
  const cut = Math.round(ay);
  const far = f.px.clone();
  far.d.fill(0, cut * far.w * 4);
  const near = f.px.clone();
  near.d.fill(0, 0, cut * near.w * 4);
  return [toSprite({ px: far, lights: f.lights }, null, ax, ay), toSprite({ px: near, lights: [] }, null, ax, ay)];
}

/** The `i`th frame of the snare (snareShots), its two halves: behind its middle, and before it. */
export function snareFrame(i: number): [Sprite, Sprite] {
  const s = snareShots()[i];
  return halves(snarePainted(s.t, 'front', s.st), SNARE_CANVAS.ax, SNARE_CANVAS.ay);
}
/** The `i`th frame of the Vow (vowShots), drawn to the ten tiles across the game gives it (VOW_FX.r: the art's own). */
export function vowFrame(i: number): Sprite {
  return toSprite(vowPainted(vowShots()[i], 'front', VOW_FX.r), null, VOW_CANVAS.ax, VOW_CANVAS.ay);
}
/** The `i`th frame of one of her swans in the air (`fly`) or diving (`dive`), from in front or behind. */
export function swanThing(which: 'fly' | 'dive', view: GameView, i: number): Sprite {
  return swanFrame(which, i / SWAN_FRAMES.fps, view);
}

/** HER THINGS, painted ahead (art/films.ts things:princess), by name: as render/act1_fx/princess.ts asks for them. */
export function princessThings(): Record<string, Sprite[]> {
  const snare = snareShots().map((_, i) => snareFrame(i));
  const list = (n: number, f: (i: number) => Sprite): Sprite[] => Array.from({ length: n }, (_, i) => f(i));
  return {
    snareFar: snare.map((s) => s[0]),
    snareNear: snare.map((s) => s[1]),
    vow: vowShots().map((_, i) => vowFrame(i)),
    flyFront: list(SWAN_FRAMES.fly, (i) => swanThing('fly', 'front', i)),
    flyBack: list(SWAN_FRAMES.fly, (i) => swanThing('fly', 'back', i)),
    diveFront: list(SWAN_FRAMES.dive, (i) => swanThing('dive', 'front', i)),
    diveBack: list(SWAN_FRAMES.dive, (i) => swanThing('dive', 'back', i)),
  };
}
