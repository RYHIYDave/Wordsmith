// FLOOR 20'S BOSS, THE MOTH: ITS MOVES (the art chat, 29 Oct 2026). A MOCK-UP: NOT IN THE GAME, behind MOTH_ON
// (art/moth.ts, off). Its look and the brief are art/moth.ts; what its moves leave on the top, art/moth_fx.ts.
//
// HIS PICK for how it moves, “Slow, heavy wingbeats”: a looming, huge thing whose wings beat slowly and heavily, the
// body bobbing with each beat. And his rules for every enemy from the Princess on: his Movement 9 (24 Oct), “Like the
// wind up and wind down are big but the actual punch is lightning quick”, and (28 Oct) “Start from now on, but every
// enemy is going to need that change eventually.  And bigger AOE to compensate for the extra time the player gets to
// evade”; and “There are big bosses that can be slow.” So: its wingbeats slow and heavy; every blow wound up big and
// held (the warning), struck in two frames smeared with its after-images, and wound down big; and what each blow
// covers, big: the top is a boss arena, an ellipse about 17 by 20 tiles.
//
// ITS MOVES (times at the game's 30 frames a second; its stand, its drift and its perch at 15):
//   HOVERING (its stand, 2.4 s, one beat): its wings hang at the top of the beat, come down heavily (the body heaving up
//     as they do), and climb slowly back; its abdomen pumping; dust sifting off it; its wing-eyes half-lidded, following
//     you, and once a beat they blink shut.
//   THE DRIFT (its walk, the same beat, in step with its stand frame for frame): leaning into its way, its dust trailing.
//   THE BUFFET (its attack): it rears back, its wings raised high over its back till they nearly meet, its abdomen curled
//     under it (the warning, held, trembling); the strike: its wings come down in two frames, smeared; the gust rolls out
//     before it over a wide cone of the top (art/moth_fx.ts); it heaves up on the stroke and climbs back.
//   DUST: its wings half raised and swept forward over the top before it, shaking hard (the warning, held); the strike:
//     one violent shake down (two frames); a cloud of its scales drifts down over the top before it (art/moth_fx.ts).
//   THE EYES: it rears upright, its wings spread wide and flat to you, its four eyes opening wide (the warning, held);
//     the strike: its wings snap forward to you (two frames) and the eyes fire their beams along the lines they stare.
//   THE SWARM: it wraps its wings forward round itself, little grey moths crawling out over them (the warning, held);
//     the strike: its wings flung open (two frames) and the swarm pours off it across the top (art/moth_fx.ts).
//   THE LANDING (its last phase): it comes down onto the last chapter, a braking downbeat, its legs reaching; its six
//     feet down round the book, its body sinking onto it; its wings spread their whole width.
//   ON THE BOOK (its stand there, 2.4 s): its wings fanning slowly over the whole top, its feet gripping the stones.
//   THE BEAT (its blow there): its wings raised high, held; slammed down to the stones in two frames; the wind rolls out
//     over the whole top (art/moth_fx.ts).
//   STRUCK, in the air and on the book.
//   ITS DEATH (on the book, where its last phase leaves it): struck, it rears and SCREAMS, its mouthparts wide, its head
//     thrown back, its wings flung up trembling, its eyes wide: the first sound it ever makes; every word it swallowed
//     pours up out of it and flies home; it falls onto the book, its wings down on the stones, and crumbles into dust.
//
// By his rulebook: every move through every check the bosses have (art/boss_checks.ts), from in front and behind, and
// the lightning strikes as his Movement 9 asks.
//   test: tsx --test tests/moth.test.ts

import type { ActorArt } from './actor_types';
import { hash } from './kit';
import { GLYPH, WORD_COLOR, WORD_GLOW } from './icons';
import { TILE3, mobSet, posedOfMob, skeletonAt } from './new_mobs3';
import type { Mob, MobMove, Moment } from './new_mobs3';
import { HUSH_DUST, LF, MOTH_BODY, MOTH_CANVAS, MOTH_REST, eyeOf, mothGeom, mothPainter, onWing, poseOf, wingRim } from './moth';
import type { MothExtra, MothGeom, MothPose, MothSay } from './moth';
import { add, lerp3, mul, solve, sub } from './skeleton';
import type { Bones, Key3, Motion, Posed, V3 } from './skeleton';
import type { WordId } from '../game/types';

type P = Partial<Bones>;
const R = MOTH_REST;
const FPS = 30;
const FR = 1 / FPS;
const clamp01 = (v: number): number => Math.max(0, Math.min(1, v));
const smooth = (a: number, b: number, t: number): number => {
  const u = clamp01((t - a) / (b - a));
  return u * u * (3 - 2 * u);
};

// =============================================================================================
// A MOVE THROUGH KEY POSES: every number through its keys smoothly (a monotone cubic: its speed carried through each key
// and stopped only where it turns back or holds), but straight through a lightning strike

type Track = (t: number) => number;
function track(keys: ReadonlyArray<readonly [number, number]>): Track {
  const n = keys.length;
  const ts = keys.map((k) => k[0]);
  const vs = keys.map((k) => k[1]);
  const d: number[] = [];
  for (let i = 0; i < n - 1; i++) d.push((vs[i + 1] - vs[i]) / (ts[i + 1] - ts[i]));
  const m: number[] = [];
  for (let i = 0; i < n; i++) {
    if (i === 0 || i === n - 1 || d[i - 1] * d[i] <= 0) m.push(0);
    else {
      const w1 = 2 * (ts[i + 1] - ts[i]) + (ts[i] - ts[i - 1]);
      const w2 = ts[i + 1] - ts[i] + 2 * (ts[i] - ts[i - 1]);
      m.push((w1 + w2) / (w1 / d[i - 1] + w2 / d[i]));
    }
  }
  return (t: number) => {
    if (t <= ts[0]) return vs[0];
    if (t >= ts[n - 1]) return vs[n - 1];
    let i = 0;
    while (i < n - 2 && t > ts[i + 1]) i++;
    const h = ts[i + 1] - ts[i];
    const u = (t - ts[i]) / h;
    const h00 = 2 * u ** 3 - 3 * u ** 2 + 1;
    const h10 = u ** 3 - 2 * u ** 2 + u;
    const h01 = -2 * u ** 3 + 3 * u ** 2;
    const h11 = u ** 3 - u ** 2;
    return h00 * vs[i] + h10 * h * m[i] + h01 * vs[i + 1] + h11 * h * m[i + 1];
  };
}
interface Plan {
  long: number;
  keys: ReadonlyArray<readonly [number, P]>;
  /** The strike: from the last frame of its wind-up to the frame it lands on. */
  strike?: readonly [number, number];
  hit?: number;
  /** A loop (its stand, its drift, its perch): its frames a second. */
  loopFps?: number;
  /** Its keys this many a second (if not its loop's or the game's 30: its death's, at 60, so that its 20 a second fall on them too). */
  keyFps?: number;
}
function poseFn(plan: Plan, rest: Bones): (t: number) => P {
  const full = plan.keys.map(([t, p]) => [t, { ...rest, ...p } as Record<string, number>] as const);
  const fields = Object.keys(full[0][1]).filter((k) => k !== 'lhIn' && k !== 'rhIn' && typeof full[0][1][k] === 'number');
  const tracks = new Map(fields.map((k) => [k, track(full.map(([t, p]) => [t, p[k]] as const))]));
  const st = plan.strike;
  const at = (t: number): Record<string, number> | undefined => full.find(([kt]) => Math.abs(kt - t) < 1e-6)?.[1];
  const a0 = st ? at(st[0]) : undefined;
  const a1 = st ? at(st[1]) : undefined;
  return (t) => {
    const out: Record<string, number> = { lhIn: full[0][1].lhIn, rhIn: full[0][1].rhIn };
    if (st && a0 && a1 && t > st[0] && t < st[1]) {
      const k = (t - st[0]) / (st[1] - st[0]);
      for (const f of fields) out[f] = a0[f] + (a1[f] - a0[f]) * k;
    } else for (const f of fields) out[f] = (tracks.get(f) as Track)(t);
    return out as P;
  };
}
/** A move as the game holds it: a key on every frame, each carrying what of the Moth is its own (MothExtra) beside its bones. */
function motionOf(move: string, plan: Plan, rest: Bones): Motion {
  const f = poseFn(plan, rest);
  const keys: Key3[] = [];
  const fps = plan.keyFps ?? plan.loopFps ?? FPS;
  const n = Math.round(plan.long * fps);
  for (let i = 0; i <= n; i++) keys.push({ at: i / fps, pose: { ...f(i / fps), ...extraOf(move, plan, f, i / fps) } as P, ease: 'lin' });
  const m: Motion = plan.hit !== undefined ? { keys, hit: plan.hit } : { keys };
  return plan.loopFps ? { ...m, loop: 0 } : m;
}

// =============================================================================================
// HOVERING, AND THE DRIFT: one slow, heavy beat a round (his pick, “Slow, heavy wingbeats”)

/** Its stand and its drift: 36 frames at 15 a second, one beat. */
export const MOTH_BEAT = { frames: 36, fps: 15, long: 2.4 } as const;
/** Its drift, tiles a second (the knight walks 2.5): slow and looming; the game makes it faster each phase. */
export const MOTH_PACE = 3.0;
/** The beat's keys: the top (held, drifting a little higher), the heavy downstroke, the bottom, the slow climb back. */
const BEAT_KEYS: ReadonlyArray<readonly [number, number]> = [[0, 56], [0.36, 58.5], [1.2, -32], [1.38, -34], [2.4, 56]];
function beatPlan(lean: number): Plan {
  const T = MOTH_BEAT.long;
  const keys: [number, P][] = [];
  // (each number keyed where the beat turns: its body heaves up on the downstroke and sinks on the climb)
  const at = (t: number): P => {
    const ph = t / T;
    const down = smooth(0.15, 0.5, ph) - smooth(0.58, 1.0, ph);
    const blink = Math.max(0, 1 - Math.abs(ph - 0.76) / 0.05);
    return {
      wEl: track(BEAT_KEYS)(t),
      wAz: R.wAz + 7 * down,
      wRoll: R.wRoll - 26 * down,
      pz: R.pz + 9 * smooth(0.2, 0.62, ph) - 9 * smooth(0.62, 1.0, ph),
      py: 2.2 * Math.sin(ph * Math.PI * 2),
      pitch: R.pitch + lean + 2.5 * down,
      roll: 1.2 * Math.sin(ph * Math.PI * 2),
      pEl: R.pEl - 14 * down,
      draw: R.draw * (1 - Math.min(1, blink * 1.4)),
      gale: R.gale + 0.05 * down,
      faceUp: 3 * down,
    };
  };
  for (const t of [0, 0.36, 0.6, 0.8, 1.0, 1.2, 1.38, 1.5, 1.7, 1.75, 1.82, 1.9, 2.0, 2.2, 2.4]) keys.push([t, at(t)]);
  return { long: T, keys, loopFps: MOTH_BEAT.fps };
}

// =============================================================================================
// THE BUFFET (its attack)

/** The buffet's times: the warning held from `warn[0]` to `warn[1]`, the strike two frames, landing at `hit`. */
export const MOTH_BUFFET = { long: 2.1, warn: [0.45, 0.9333] as const, strike: [28 / FPS, 30 / FPS] as const, hit: 30 / FPS };
/** What the gust covers (art/moth_fx.ts): a cone before it this wide (degrees) and this long (tiles). */
export const BUFFET_CONE = { deg: 140, tiles: 9 } as const;
const COCKED: P = { wEl: 86, wAz: -14, wRoll: 8, pitch: 46, pz: 82, pEl: 32, gale: 0, draw: 0.55, faceUp: 6 };
function buffetPlan(): Plan {
  const [w0, w1] = MOTH_BUFFET.warn;
  const [s0, s1] = MOTH_BUFFET.strike;
  return {
    long: MOTH_BUFFET.long,
    strike: MOTH_BUFFET.strike,
    hit: MOTH_BUFFET.hit,
    keys: [
      [0, {}],
      [0.24, { wEl: 76, wAz: -8, wRoll: 6, pitch: 52, pz: 78, pEl: 20, gale: 0.05, draw: 0.45, faceUp: 3 }],
      [w0, COCKED],
      [0.62, { ...COCKED, wEl: 86.7, pz: 82.6 }],
      [0.78, { ...COCKED, wEl: 85.4, pz: 82.2 }],
      [s0, COCKED],
      [s1, { wEl: -46, wAz: 16, wRoll: -14, pitch: 66, pz: 76, pEl: -6, gale: 0.2, draw: 0.6, faceUp: -2 }],
      [1.3, { wEl: -53, wAz: 18, wRoll: -10, pitch: 64, pz: 95, pEl: -14, gale: 0.3, draw: 0.5, faceUp: -1 }],
      [1.7, { wEl: 12, wAz: 4, wRoll: 6, pitch: 60, pz: 80, pEl: 4, gale: 0.15, draw: 0.4 }],
      [MOTH_BUFFET.long, {}],
    ],
  };
}

// =============================================================================================
// DUST

export const MOTH_DUST = { long: 2.3, warn: [0.42, 0.9] as const, strike: [27 / FPS, 29 / FPS] as const, hit: 29 / FPS };
/** The cloud (art/moth_fx.ts): this many tiles across, its middle this far before it. */
export const DUST_CLOUD = { tiles: 7, ahead: 4.5 } as const;
const SHAKE: P = { wEl: 34, wAz: 22, wRoll: -6, pitch: 62, pz: 78, pEl: 12, draw: 0.5, gale: 0.05 };
function dustPlan(): Plan {
  const [w0, w1] = MOTH_DUST.warn;
  const [s0, s1] = MOTH_DUST.strike;
  return {
    long: MOTH_DUST.long,
    strike: MOTH_DUST.strike,
    hit: MOTH_DUST.hit,
    keys: [
      [0, {}],
      [0.2, { wEl: 50, wAz: 12, wRoll: 2, pitch: 60, pz: 76, pEl: 9, draw: 0.42 }],
      [w0, SHAKE],
      [0.54, { ...SHAKE, wEl: 35.2, wAz: 22.4 }],
      [0.66, { ...SHAKE, wEl: 33.0, wAz: 21.6 }],
      [0.78, { ...SHAKE, wEl: 35.0, wAz: 22.4 }],
      [s0, SHAKE],
      [s1, { wEl: 4, wAz: 26, wRoll: -16, pitch: 64, pz: 72, pEl: 4, draw: 0.55, gale: 0.1 }],
      [1.12, { wEl: -2, wAz: 26, wRoll: -12, pitch: 64, pz: 76, pEl: 2, draw: 0.5, gale: 0.1 }],
      [1.45, { wEl: 16, wAz: 18, wRoll: -4, pitch: 62, pz: 80, pEl: 8, draw: 0.45 }],
      [1.85, { wEl: 44, wAz: 6, wRoll: 6, pitch: 59, pz: 74, pEl: 10, draw: 0.38 }],
      [MOTH_DUST.long, {}],
    ],
  };
}

// =============================================================================================
// THE EYES

export const MOTH_EYES = { long: 2.5, warn: [0.5, 1.1] as const, strike: [33 / FPS, 35 / FPS] as const, hit: 35 / FPS };
/** The beams (art/moth_fx.ts): this long (tiles, the top's whole length), this wide; each eye's line this far round from its way (degrees, its left). */
export const EYE_BEAMS = { tiles: 20, wide: 1.2, fan: { foreL: 30, hindL: 11, hindR: -11, foreR: -30 } } as const;
const SPREAD: P = { pitch: 18, pz: 96, wEl: 8, wAz: 6, wRoll: 0, pEl: 20, draw: 0.62, faceUp: 0, gale: 0 };
function eyesPlan(): Plan {
  const [w0, w1] = MOTH_EYES.warn;
  const [s0, s1] = MOTH_EYES.strike;
  return {
    long: MOTH_EYES.long,
    strike: MOTH_EYES.strike,
    hit: MOTH_EYES.hit,
    keys: [
      [0, {}],
      [0.25, { pitch: 36, pz: 88, wEl: 30, wAz: 4, wRoll: 4, pEl: 14, draw: 0.45, gale: 0.05 }],
      [w0, SPREAD],
      [0.8, { ...SPREAD, wEl: 8.6, draw: 0.86 }],
      [s0, { ...SPREAD, draw: 1.0 }],
      [s1, { pitch: 24, pz: 92, wEl: -22, wAz: 10, wRoll: -6, pEl: 10, draw: 1.25, gale: 0 }],
      [1.5, { pitch: 25, pz: 93, wEl: -27, wAz: 11, wRoll: -8, pEl: 9, draw: 1.2, gale: 0 }],
      [1.95, { pitch: 44, pz: 84, wEl: 26, wAz: 4, wRoll: 4, pEl: 10, draw: 0.6, gale: 0.05 }],
      [MOTH_EYES.long, {}],
    ],
  };
}

// =============================================================================================
// THE SWARM

export const MOTH_SWARM = { long: 2.5, warn: [0.5, 1.1] as const, strike: [33 / FPS, 35 / FPS] as const, hit: 35 / FPS };
/** The swarm (art/moth_fx.ts): this many little moths, in a stream this wide (tiles), across this much of the top (tiles), over this long (seconds). */
export const SWARM = { n: 150, wide: 5, tiles: 18, long: 3.2 } as const;
const CLOAKED: P = { wEl: 18, wAz: 34, wRoll: 20, pitch: 52, pz: 76, pEl: 26, draw: 0.2, gale: 0 };
function swarmPlan(): Plan {
  const [w0, w1] = MOTH_SWARM.warn;
  const [s0, s1] = MOTH_SWARM.strike;
  return {
    long: MOTH_SWARM.long,
    strike: MOTH_SWARM.strike,
    hit: MOTH_SWARM.hit,
    keys: [
      [0, {}],
      [0.25, { wEl: 40, wAz: 20, wRoll: 12, pitch: 55, pz: 75, pEl: 18, draw: 0.28, gale: 0.04 }],
      [w0, CLOAKED],
      [0.8, { ...CLOAKED, wEl: 18.8, wAz: 34.6 }],
      [s0, CLOAKED],
      [s1, { wEl: 48, wAz: -16, wRoll: -6, pitch: 50, pz: 86, pEl: -10, draw: 0.8, gale: 0.1 }],
      [1.5, { wEl: 55, wAz: -21, wRoll: -4, pitch: 50, pz: 92, pEl: -14, draw: 0.7, gale: 0.1 }],
      [2.0, { wEl: 60, wAz: -7, wRoll: 8, pitch: 55, pz: 78, pEl: 4, draw: 0.45, gale: 0.1 }],
      [MOTH_SWARM.long, {}],
    ],
  };
}

// =============================================================================================
// ITS LAST PHASE: THE LANDING, ON THE BOOK, THE BEAT

/** On the book: its pelvis this far up (from the bones' own 143 standing), its body 20 degrees up from level. */
const PERCH_PZ = -44;
const PERCH: P = { pz: PERCH_PZ, pitch: 72, wEl: 18, wAz: 2, wRoll: 4, pEl: -4, draw: 0.35, gale: 1, faceUp: -2 };
/** The last chapter: where it lies under it (the figure's floor), and how big it is open (its own lengths). */
export const BOOK = { at: [48, 0] as const, w: 74, d: 52 } as const;
export const MOTH_LAND = { long: 2.2, touch: 1.25, plant: [1.02, 1.25] as const };
function landPlan(): Plan {
  return {
    long: MOTH_LAND.long,
    keys: [
      [0, {}],
      [0.5, { pz: 44, pitch: 62, wEl: 72, wAz: -4, wRoll: 8, pEl: 12, gale: 0.5, draw: 0.4 }],
      [0.9, { pz: 4, pitch: 66, wEl: -22, wAz: 8, wRoll: -12, pEl: 2, gale: 0.92, draw: 0.4 }],
      [MOTH_LAND.touch, { pz: PERCH_PZ + 6, pitch: 71, wEl: 26, wAz: 2, wRoll: 6, pEl: 0, gale: 1, draw: 0.38 }],
      [1.5, { ...PERCH, pz: PERCH_PZ - 7, wEl: 12, pEl: -1 }],
      [1.85, { ...PERCH, pz: PERCH_PZ - 1, wEl: 20 }],
      [MOTH_LAND.long, PERCH],
    ],
  };
}
/** On the book: its stand there, 36 frames at 15 a second; its wings fanning slowly over the whole top. */
function perchPlan(): Plan {
  const T = MOTH_BEAT.long;
  const at = (t: number): P => {
    const ph = t / T;
    const up = smooth(0.0, 0.45, ph) - smooth(0.45, 1.0, ph);
    const blink = Math.max(0, 1 - Math.abs(ph - 0.3) / 0.05);
    return {
      ...PERCH,
      wEl: 18 + 18 * up,
      wAz: 2 - 3 * up,
      wRoll: 4 + 6 * up,
      pz: PERCH_PZ + 2.2 * Math.sin(ph * Math.PI * 2),
      py: 1.4 * Math.sin(ph * Math.PI * 2 + 0.6),
      pEl: 4 + 6 * up,
      draw: 0.35 * (1 - Math.min(1, blink * 1.4)),
    };
  };
  const keys: [number, P][] = [];
  for (const t of [0, 0.3, 0.6, 0.66, 0.72, 0.78, 0.84, 0.9, 1.08, 1.4, 1.7, 2.0, 2.2, 2.4]) keys.push([t, at(t)]);
  return { long: T, keys, loopFps: MOTH_BEAT.fps };
}
export const MOTH_BEAT_BLOW = { long: 2.3, warn: [0.5, 1.0] as const, strike: [30 / FPS, 32 / FPS] as const, hit: 32 / FPS };
/** What the beat covers (art/moth_fx.ts): the wind rolls out round it this far (tiles): the whole top. */
export const BEAT_RING = { tiles: 11 } as const;
const RAISED: P = { ...PERCH, wEl: 84, wAz: -8, wRoll: 8, pz: PERCH_PZ + 12, pitch: 65, pEl: -14, draw: 0.55 };
function beatBlowPlan(perch0: P): Plan {
  const [w0, w1] = MOTH_BEAT_BLOW.warn;
  const [s0, s1] = MOTH_BEAT_BLOW.strike;
  return {
    long: MOTH_BEAT_BLOW.long,
    strike: MOTH_BEAT_BLOW.strike,
    hit: MOTH_BEAT_BLOW.hit,
    keys: [
      [0, perch0],
      [0.25, { ...PERCH, wEl: 58, wAz: -4, wRoll: 7, pz: PERCH_PZ + 6, pitch: 68, pEl: -9, draw: 0.45 }],
      [w0, RAISED],
      [0.68, { ...RAISED, wEl: 84.8 }],
      [0.84, { ...RAISED, wEl: 83.4 }],
      [w1, RAISED],
      [s1, { ...PERCH, wEl: -12, wAz: 14, wRoll: -14, pz: PERCH_PZ + 4, pitch: 76, pEl: -6, draw: 0.6 }],
      [1.35, { ...PERCH, wEl: -14.5, wAz: 16, wRoll: -10, pz: PERCH_PZ + 8, pitch: 76, pEl: -9, draw: 0.5 }],
      [1.8, { ...PERCH, wEl: 6, wAz: 8, wRoll: 0, pz: PERCH_PZ + 1, pitch: 73, pEl: -5, draw: 0.4 }],
      [MOTH_BEAT_BLOW.long, perch0],
    ],
  };
}

// =============================================================================================
// STRUCK, AND ITS DEATH

export const MOTH_REEL = 0.45;
function reelPlan(): Plan {
  return { long: MOTH_REEL, keys: [[0, {}], [0.1, { wEl: 74, wAz: -6, pitch: 50, pz: 78, pEl: -10, gale: 0.3, draw: 0.6, faceUp: 8 }], [MOTH_REEL, {}]] };
}
function perchReelPlan(perch0: P): Plan {
  return { long: MOTH_REEL, keys: [[0, perch0], [0.1, { ...PERCH, wEl: 32, wAz: -6, pitch: 67, pz: PERCH_PZ + 4, pEl: -12, draw: 0.6, faceUp: 6 }], [0.16, { ...PERCH, wEl: 31, wAz: -6, pitch: 67.5, pz: PERCH_PZ + 4, pEl: -11.5, draw: 0.58, faceUp: 6 }], [MOTH_REEL, perch0]] };
}
/** Its death: struck; it screams (`scream`); the words pour out (`words`); it falls onto the book (`fall`); it crumbles (`crumble`). */
export const MOTH_DIES = { long: 4.8, scream: [0.45, 1.75] as const, words: [0.7, 3.4] as const, fall: [1.75, 2.9] as const, crumble: [2.3, 4.5] as const };
function diesPlan(perch0: P): Plan {
  const SCREAM: P = { ...PERCH, pitch: 54, pz: PERCH_PZ + 20, wEl: 80, wAz: -4, wRoll: 10, pEl: -46, pAz: 1, draw: 1.05, faceUp: 10, gale: 0.55 };
  const SPENT: P = { ...PERCH, pitch: 78, pz: PERCH_PZ - 20, wEl: -13, wAz: 8, wRoll: -6, pEl: 0, pAz: 0.2, draw: 0, out: 1, gale: 1 };
  return {
    long: MOTH_DIES.long,
    keyFps: 60,
    keys: [
      [0, perch0],
      [0.16, { ...PERCH, wEl: 40, pitch: 66, pz: PERCH_PZ + 6, pEl: -14, draw: 0.8, gale: 0.85 }],
      [0.6, SCREAM],
      [1.1, { ...SCREAM, pitch: 50, pz: PERCH_PZ + 22, wEl: 83, pEl: -50, draw: 1.1 }],
      [MOTH_DIES.scream[1], { ...SCREAM, pitch: 58, pz: PERCH_PZ + 14, wEl: 60, pEl: -36, pAz: 0.85, draw: 0.7, gale: 0.7 }],
      [2.4, { ...PERCH, pitch: 74, pz: PERCH_PZ - 14, wEl: -8, wAz: 6, wRoll: -4, pEl: -4, pAz: 0.35, draw: 0.1, out: 0.8 }],
      [MOTH_DIES.fall[1], SPENT],
      [MOTH_DIES.long, SPENT],
    ],
  };
}

// =============================================================================================
// THE MOTH, AS THE GAME HOLDS A MONSTER

/** (its strikes by move, for its keys' trembling; the same as MOTH_STRIKES) */
const MOTH_STRIKES_AT: Readonly<Record<string, readonly [number, number]>> = { attack: MOTH_BUFFET.strike, dust: MOTH_DUST.strike, eyes: MOTH_EYES.strike, swarm: MOTH_SWARM.strike, beat: MOTH_BEAT_BLOW.strike };

export const MOTH_NAMES = {
  stand: 'The Moth hovers',
  walk: 'The Moth drifts',
  attack: 'The buffet',
  dust: 'Dust',
  eyes: 'The Eyes',
  swarm: 'The Swarm',
  land: 'The Moth comes down on the last chapter',
  perch: 'The Moth on the book',
  beat: 'The beat',
  reel: 'The Moth is struck',
  perchReel: 'The Moth is struck on the book',
  dying: 'It dies screaming',
} as const;
type MoveName = keyof typeof MOTH_NAMES;
const byName: Record<string, MoveName> = Object.fromEntries(Object.entries(MOTH_NAMES).map(([k, v]) => [v, k as MoveName]));

const PERCH_PLAN = perchPlan();
const PERCH0 = poseFn(PERCH_PLAN, R)(0);
const PLANS: Record<string, Plan> = {
  stand: beatPlan(0),
  walk: beatPlan(0),
  attack: buffetPlan(),
  dust: dustPlan(),
  eyes: eyesPlan(),
  swarm: swarmPlan(),
  land: landPlan(),
  perch: PERCH_PLAN,
  beat: beatBlowPlan(PERCH0),
  reel: reelPlan(),
  perchReel: perchReelPlan(PERCH0),
  dying: diesPlan(PERCH0),
};
/** The strikes, by move: from the last frame of the wind-up to the frame it lands on. */
export const MOTH_STRIKES: Readonly<Record<string, readonly [number, number]>> = MOTH_STRIKES_AT;
/** Whether a frame of a move shows its strike's smear: from the frame after its wind-up ends to the frame after it lands (thinning then). */
export function smearedAt(move: string, t: number): boolean {
  const s = MOTH_STRIKES[move];
  return !!s && t > s[0] + 1e-6 && t <= s[1] + FR + 1e-6;
}
/** The moves on the book (its last phase): its feet down round it. */
const ON_BOOK = new Set(['perch', 'beat', 'perchReel', 'dying']);
/** How long a move is (seconds). */
export function mothLong(move: string): number {
  return PLANS[move].long;
}

// ---------------------------------------------------------------------------------------------
// WHAT OF IT IS ITS OWN AT A MOMENT: its hindwings a moment behind its forewings; its abdomen and antennae swung behind its
// way; its feet; where its eyes look; how far it has crumbled

/** How far behind its forewings its hindwings come (seconds: a frame of the game's, so that a strike's lag is in its strike). */
const HIND_LAG = 1 / 30;
/** What of it is its own at a moment of a move, worked out from the move itself (carried on its keys: MothExtra). */
function extraOf(move: string, plan: Plan, f: (t: number) => P, t: number): MothExtra {
  const T = plan.long;
  const wrap = (u: number): number => (plan.loopFps ? ((u % T) + T) % T : Math.max(0, Math.min(T, u)));
  const qh = f(wrap(t - HIND_LAG));
  // (its abdomen and antennae swing behind its way: the way its body has been going this last third of a second, the
  // nearest the most; so that after a strike they swing back over a few frames, never at once)
  const at = (u: number) => solve(MOTH_BODY, { ...R, ...f(wrap(u)) } as Posed);
  const dt = 1 / 30;
  let vp: V3 = [0, 0, 0];
  let vn: V3 = [0, 0, 0];
  let wsum = 0;
  let prev = at(t);
  for (let j = 0; j < 9; j++) {
    const was = at(t - (j + 1) * dt);
    const w = Math.pow(0.72, j);
    vp = add(vp, mul(sub(prev.pelvis, was.pelvis), w / dt));
    vn = add(vn, mul(sub(prev.neck, was.neck), w / dt));
    wsum += w;
    prev = was;
  }
  // (drifting, the air it goes through combs them back a little more)
  const ground: V3 = [move === 'walk' ? MOTH_PACE * TILE3 * 0.12 : 0, 0, 0];
  // (and a move that is played once lets them settle as it ends, into its stand's own)
  const env = plan.loopFps ? 1 : 1 - smooth(T - 0.3, T, t);
  const cap = (v: V3, most: number): V3 => {
    const l = Math.hypot(v[0], v[1], v[2]);
    return l > most ? mul(v, most / l) : v;
  };
  const sway = cap(mul(add(mul(vp, 1 / wsum), ground), -0.22 * env), 34);
  const ant = cap(mul(add(mul(vn, 1 / wsum), ground), -0.24 * env), 36);
  // (on the book, its feet down where they were put; coming down onto it, put down as it lands)
  const plant = ON_BOOK.has(move) ? 1 : move === 'land' ? smooth(MOTH_LAND.plant[0], MOTH_LAND.plant[1], t) : 0;
  // (where its eyes look: at you, five tiles before it at your chest; as it screams, they roll up)
  const look = move === 'dying' ? lerp3([5 * TILE3, 0, 20], [2 * TILE3, 0, 900], smooth(0.6, 1.6, t)) : ([5 * TILE3, 0, 20] as V3);
  const strike = MOTH_STRIKES_AT[move];
  return {
    m_hb: (qh.wEl as number) - 3,
    m_hs: qh.wAz as number,
    m_sx: sway[0],
    m_sy: sway[1],
    m_sz: sway[2],
    m_ax: ant[0],
    m_ay: ant[1],
    m_az: ant[2],
    m_plant: plant,
    // (dying, its forelegs come up off the top as it rears and screams, and down again where they were as it falls)
    m_pf: move === 'dying' ? clamp01(1 - smooth(0.12, 0.42, t) + smooth(1.95, 2.55, t)) : plant,
    m_lx: look[0],
    m_ly: look[1],
    m_lz: look[2],
    m_cr: move === 'dying' ? smooth(MOTH_DIES.crumble[0], MOTH_DIES.crumble[1], t) : 0,
    m_sh: strike && t > strike[0] - 0.5 && t < strike[0] ? 1 : 0,
  };
}
let MOB: Mob | null = null;
/** Its pose at a moment of a move, its own numbers and all. */
export function mothPoseAt(move: string, t: number): MothPose {
  return poseOf(posedOfMob(MOB as Mob, move, t));
}
/** Where every part of it is at a moment of a move. */
export function mothGeomAt(move: string, t: number): MothGeom {
  const mob = MOB as Mob;
  return mothGeom(skeletonAt(mob, move, t), poseOf(posedOfMob(mob, move, t)));
}
/** Where the Eyes' beams go: from each eye, along the line it stares, out across the top (the figure's floor). */
export function beamLines(G: MothGeom): { from: V3; to: V3; name: string }[] {
  const out: { from: V3; to: V3; name: string }[] = [];
  for (const w of G.wings) {
    const name = `${w.hind ? 'hind' : 'fore'}${w.side === 1 ? 'L' : 'R'}`;
    const deg = (EYE_BEAMS.fan as Record<string, number>)[name] * (Math.PI / 180);
    const from = eyeOf(w);
    const far = EYE_BEAMS.tiles * TILE3;
    out.push({ from, to: [Math.cos(deg) * far, Math.sin(deg) * far, 0], name });
  }
  return out;
}

// ---------------------------------------------------------------------------------------------
// THE SMEAR, AND WHAT IS LAID AFTER ITS EDGE

/** THE SMEAR: after-images of its wings' edges along the way they have come since the wind-up ended. */
function smearOf(move: string, t: number): V3[][] | null {
  if (!smearedAt(move, t)) return null;
  const [s0, s1] = MOTH_STRIKES[move];
  const to = Math.min(t, s1);
  const out: V3[][] = [];
  const n = 5;
  for (let i = 0; i <= n; i++) {
    const u = s0 - FR * 0.5 + ((to - (s0 - FR * 0.5)) * i) / n;
    const G = mothGeomAt(move, u);
    for (const w of G.wings) out.push(wingRim(w.hind, 18).map(([x, y]) => onWing(w, x * w.len, y * w.len)));
  }
  // (and after it has landed, thinned: the oldest gone)
  return t > s1 + 1e-6 ? out.slice(Math.floor(out.length / 2)) : out;
}
/** The dust sifting off its wings: grains falling from under them to the top, round and round with the beat; more as they shake. */
function dustGrains(move: string, t: number, G: MothGeom, heavy: number): [V3, string, number][] {
  const out: [V3, string, number][] = [];
  const loop = move === 'stand' || move === 'walk' || move === 'perch';
  const T = loop ? MOTH_BEAT.long : 2.4;
  const n = Math.round(46 + 120 * heavy);
  for (let i = 0; i < n; i++) {
    const life = (((t / T + hash(i, 1, 9801)) % 1) + 1) % 1;
    // (from a point under one of its wings, falling and drifting)
    const w = G.wings[i % 4];
    const x = (0.25 + 0.65 * hash(i, 2, 9801)) * w.len;
    const y = (0.1 + 0.35 * hash(i, 3, 9801)) * w.len;
    const from = onWing(w, x, y);
    const fall = life * life * 220 + life * 60;
    const z = from[2] - fall;
    if (z < 2 || life > 0.92) continue;
    const drift: V3 = [Math.sin(life * 6 + i) * 10 * life - (move === 'walk' ? 60 * life : 0), Math.cos(life * 5 + i) * 10 * life, 0];
    const p = add([from[0], from[1], z], drift);
    out.push([p, HUSH_DUST[life < 0.3 ? 3 : life < 0.6 ? 2 : 1], hash(i, 4, 9801) < 0.3 ? 2 : 1]);
  }
  return out;
}
/** THE WORDS IT SWALLOWED, pouring up out of it as it dies: the game's own glyphs in their own colours, rising and spreading. */
export const MOTH_WORDS: readonly WordId[] = ['power', 'swift', 'fire', 'lightning', 'leech', 'volatile', 'poison', 'heavy', 'frenzied', 'guarding', 'binding'];
export function wordGrains(t: number, mouth: V3, body: V3): [V3, string, number][] {
  const out: [V3, string, number][] = [];
  const [w0, w1] = MOTH_DIES.words;
  if (t < w0) return out;
  const N = 60;
  for (let i = 0; i < N; i++) {
    const born = w0 + (w1 - w0 - 0.6) * hash(i, 1, 9901);
    const age = t - born;
    if (age < 0 || age > 1.1) continue;
    const word = MOTH_WORDS[i % MOTH_WORDS.length];
    const rows = GLYPH[word];
    if (!rows || !rows.length) continue;
    const from = hash(i, 2, 9901) < 0.55 ? mouth : body;
    const a = hash(i, 3, 9901) * Math.PI * 2;
    const sp = 60 + 90 * hash(i, 4, 9901);
    const p: V3 = add(from, [Math.cos(a) * sp * age * 0.8, Math.sin(a) * sp * age * 0.8, 40 * age + 160 * age * age]);
    // (each pixel of its glyph a game pixel: two of the picture's)
    const fade = age > 0.85;
    for (let gy = 0; gy < rows.length; gy++) {
      for (let gx = 0; gx < rows[gy].length; gx++) {
        const ch = rows[gy].charAt(gx);
        if (ch === '.' || (fade && (gx + gy) % 2)) continue;
        out.push([[p[0], p[1], p[2] - gy * 2] as V3, ch === 'o' ? WORD_GLOW[word] : WORD_COLOR[word], 2]);
        // (laid across the picture: each glyph pixel two across)
        out[out.length - 1][0] = add(out[out.length - 1][0], mul([0.61, 0.61, 0], gx * 2 * 0.82));
      }
    }
  }
  return out;
}
/** Its dust as it crumbles: falling off it in flakes, gathering in a heap on the top under it. */
function crumbleGrains(t: number, G: MothGeom): [V3, string, number][] {
  const out: [V3, string, number][] = [];
  const k = smooth(MOTH_DIES.crumble[0], MOTH_DIES.crumble[1], t);
  if (k <= 0) return out;
  const N = 260;
  for (let i = 0; i < N; i++) {
    const born = MOTH_DIES.crumble[0] + (MOTH_DIES.crumble[1] - MOTH_DIES.crumble[0]) * hash(i, 1, 9951);
    const age = t - born;
    if (age < 0) continue;
    // (from a wing or its body; drifting down to lie on the top)
    const w = G.wings[i % 4];
    const fromBody = i % 3 === 0;
    const src = fromBody ? (G.ab[(i * 7) % G.ab.length] ?? G.TC) : onWing(w, (0.3 + 0.65 * hash(i, 2, 9951)) * w.len, (0.1 + 0.4 * hash(i, 3, 9951)) * w.len);
    const fall = Math.min(src[2] - 1.5, age * age * 140 + age * 30);
    const p: V3 = [src[0] + Math.sin(age * 3 + i) * 8 * Math.min(1, age), src[1] + Math.cos(age * 2.6 + i) * 8 * Math.min(1, age), src[2] - fall];
    const settled = p[2] <= 1.6;
    out.push([p, settled ? (i % 3 ? HUSH_DUST[1] : '#8a847c') : HUSH_DUST[i % 2 ? 2 : 3], settled ? 2 : hash(i, 4, 9951) < 0.4 ? 2 : 1]);
  }
  // (the heap: its dust lying on the top where it fell)
  const heap = Math.round(140 * k);
  for (let i = 0; i < heap; i++) {
    const a = hash(i, 5, 9951) * Math.PI * 2;
    const r = Math.sqrt(hash(i, 6, 9951));
    const p: V3 = [BOOK.at[0] - 30 + Math.cos(a) * r * 120, Math.sin(a) * r * 160, 1.2 + 6 * (1 - r) * hash(i, 7, 9951)];
    out.push([p, i % 4 === 0 ? '#a49c90' : i % 4 === 1 ? HUSH_DUST[2] : i % 4 === 2 ? HUSH_DUST[1] : '#6e6862', 2]);
  }
  return out;
}
/** WHAT IS LAID AFTER ITS EDGE: its dust, the shaken scales, the words, its crumbling. */
function moreOf(move: string, m: Moment): [V3, string, number][] {
  const t = m.t;
  const G = mothGeomAt(move, t);
  if (move === 'dying') {
    const alive = t < MOTH_DIES.fall[0];
    const mouth = add(G.HC, mul(G.hF, 24));
    return [...(alive ? dustGrains(move, t, G, 0.2) : []), ...wordGrains(t, mouth, G.TC), ...crumbleGrains(t, G)];
  }
  const shaking = move === 'dust' ? smooth(0.3, 0.6, t) * (1 - smooth(1.3, 1.9, t)) : move === 'attack' || move === 'beat' ? smooth(0.4, 0.8, t) * (1 - smooth(1.3, 1.8, t)) : 0;
  return dustGrains(move, t, G, shaking);
}
/** Little moths crawling out over its wings as it wraps them round itself (the Swarm's warning): more and more, crawling. */
function crawlersOf(move: string, t: number): [number, number, number, number][] {
  if (move !== 'swarm') return [];
  const k = smooth(0.25, 1.0, t) * (1 - smooth(MOTH_SWARM.strike[0], MOTH_SWARM.strike[1] + 0.05, t));
  if (k <= 0) return [];
  const out: [number, number, number, number][] = [];
  const n = Math.round(56 * k);
  for (let i = 0; i < n; i++) {
    const wi = i % 4;
    const hind = wi % 2 === 1;
    const x0 = 0.3 + 0.5 * hash(i, 1, 9971);
    const y0 = 0.08 + (hind ? 0.5 : 0.3) * hash(i, 2, 9971);
    const a = hash(i, 3, 9971) * Math.PI * 2;
    const x = x0 + Math.cos(a) * 0.05 * t;
    const y = y0 + Math.sin(a) * 0.05 * t;
    out.push([wi, x, y, 3.2 + 1.6 * hash(i, 4, 9971)]);
  }
  return out;
}

const keyOf = (m: Moment): MoveName => byName[m.move ?? ''] ?? (m.dying ? 'dying' : 'stand');
const SAY: MothSay = {
  smear: (m) => smearOf(keyOf(m), m.t),
  more: (m) => moreOf(keyOf(m), m),
  crawlers: (m) => crawlersOf(keyOf(m), m.t),
};

function mothMob(): Mob {
  const paint = mothPainter(SAY);
  const mv = (name: string, motion: Motion, more: Partial<MobMove> = {}): MobMove => ({ name, motion, rest: R, ...more });
  const glow = (warn: readonly [number, number]) => (t: number): number => (t >= warn[0] && t <= warn[1] ? 1 : 0);
  const M = (k: string): Motion => motionOf(k, PLANS[k], R);
  return {
    id: 'moth',
    name: 'The Moth',
    size: 'a boss: the biggest thing in the game, its wings as wide as the top is long',
    build: MOTH_BODY,
    stand: mv(MOTH_NAMES.stand, M('stand')),
    attack: mv(MOTH_NAMES.attack, M('attack'), { glint: glow(MOTH_BUFFET.warn) }),
    more: {
      dust: mv(MOTH_NAMES.dust, M('dust'), { glint: glow(MOTH_DUST.warn) }),
      eyes: mv(MOTH_NAMES.eyes, M('eyes'), { glint: glow(MOTH_EYES.warn) }),
      swarm: mv(MOTH_NAMES.swarm, M('swarm'), { glint: glow(MOTH_SWARM.warn) }),
      land: mv(MOTH_NAMES.land, M('land')),
      perch: mv(MOTH_NAMES.perch, M('perch')),
      beat: mv(MOTH_NAMES.beat, M('beat'), { glint: glow(MOTH_BEAT_BLOW.warn) }),
      perchReel: mv(MOTH_NAMES.perchReel, M('perchReel')),
    },
    idleFrames: MOTH_BEAT.frames,
    idleFps: MOTH_BEAT.fps,
    walk: mv(MOTH_NAMES.walk, M('walk'), { period: MOTH_BEAT.long, ground: MOTH_PACE * TILE3 }),
    walkFrames: MOTH_BEAT.frames,
    walkFps: MOTH_BEAT.fps,
    pace: MOTH_PACE,
    reel: mv(MOTH_NAMES.reel, M('reel')),
    reelTime: MOTH_REEL,
    hit: MOTH_BUFFET.hit,
    warn: MOTH_BUFFET.warn[1] - MOTH_BUFFET.warn[0],
    dieTime: MOTH_DIES.long,
    dying: mv(MOTH_NAMES.dying, M('dying')),
    aura: { x: MOTH_CANVAS.ax, y: MOTH_CANVAS.ay - 250, r: 150, color: '#9890b4', a: 0.07 },
    shadow: 150,
    canvas: MOTH_CANVAS,
    trueBack: true,
    bits: paint.bits,
    grains: paint.grains,
  };
}
export const MOTH: Mob = (MOB = mothMob());
export function makeMothArt3(mob: Mob = MOTH): ActorArt {
  return { front: mobSet(mob, 'front', mob.pace), back: mobSet(mob, 'back', mob.pace) };
}
void LF;
