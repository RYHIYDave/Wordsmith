// THE PHYSICIAN'S MOVES DONE THE ACTION WAY (the art chat's helper, 2 Nov 2026; docs/mockups/action_f14_physician/README.md).
// A MOCK-UP: NOTHING OF THE GAME IMPORTS THIS FILE. All of it is behind one switch, PHYSICIAN_ACTION, off: with it off the game's
// Physician is every frame as he was (art/physician.ts, art/physician_moves.ts, art/physician_shots.ts: his moves there are kept
// as they are).
//
// The owner's words: his review of every enemy for more action, 31 Oct 2026: offered Ether, he asked “Anything unique we can do?”;
// offered Diagnosis (a brass lens's light tracking you, filling a mark; break its line behind beds and pillars; full, he operates,
// one huge strike) or Stitches, he answered “Diagnosis (Recommended)”. And his rulebook's Monsters 9, Action, like a movie (his yes,
// 1 Nov): every attack Movement 9 (24 Oct, “Like the wind up and wind down are big but the actual punch is lightning quick”) with
// bigger areas (28 Oct, “Start from now on, but every enemy is going to need that change eventually.  And bigger AOE to compensate
// for the extra time the player gets to evade”).
//
// So his moves, each a big wind-up HELD (the warning), the blow in TWO FRAMES smeared with after-images, a big wind-down; and what
// he sends out bigger (art/physician_action_fx.ts):
//   THE RAP (`attack`): the cane hauled up high over his right shoulder, up on his toes, arched back, HELD trembling; brought over
//     and down in two frames at the end of a long step, the ferrule cracking the boards far before him, a star of cracks out round it.
//   THE DRAW (`draw`): side-on, sunk low en garde, the syringe levelled, the quill glinting, HELD; the fencer's lunge in two frames, a
//     long one, the quill thrust its whole reach and a needle of pink light out past it down the lane; held while the plunger is drawn
//     and the barrel fills (your word drawn out of its socket); sprung back, the syringe lifted over his head, the word pushed up out
//     of the quill to hang over his head (kept: the game's own, art/physician_shots.ts drawHeldWord).
//   DIAGNOSIS (`diagnose`, in place of the tonic): the syringe thrust through his belt, a great brass lens drawn from his coat and
//     raised before his beak at arm's length; he peers through it, his head cocking, while its beam of pale light finds you and
//     tracks you across the theatre and a mark over you fills (beds and pillars break its line: behind them the mark drains). The
//     game holds him peering (its frames DIAG_LOOP loop) until the mark is full, or lets him lower it.
//   HE OPERATES (`operate`): from the lens held so, when the mark is full: the lens flung up over his head, FLARING, his instruments
//     fanned out of his right fist round the cane, his arm hauled back, HELD, terrible; slashed down across before him in two
//     frames, the lens snapped down at you: ONE HUGE STRIKE where you are, the light focused through the lens burning a great cut
//     across the floor.
//   ROUNDS (`rounds`): drawn up tall, the cane hoisted high in his fist, HELD; rammed down on the boards three times, each in two
//     frames (a short hold between), a great ring of the Hush rolling out from each; then the cane swept round the room, pointing:
//     the patients rise (kept: the game's own).
// His stand, walk, struck and his death are the game's own (the very same moves).

import type { ActorArt } from './actor_types';
import { footwork, plantBy, plantOf } from './bosses3';
import type { BossShape, CheckThing, Handover } from './boss_checks';
import { framesOf } from './boss_checks';
import { hash } from './kit';
import type { Ramp } from './kit';
import { FLAME } from './mkit';
import { TILE3, mobSet, posedOfMob, skeletonAt, sphere } from './new_mobs3';
import type { Bit, Mob, MobCanvas, MobMove, Moment, Put, Ropes } from './new_mobs3';
import { PH_BODY, PH_REST, caneOf, physicianPainter, syringeOf } from './physician';
import { PHYSICIAN, PH_SHAPE, physicianSolids } from './physician_moves';
import type { Stage } from './skin';
import { add, cross, elbowFor, heading, len, lerp3, mul, norm, solve, sub } from './skeleton';
import type { Bones, Key3, Motion, Posed, Skeleton, V3 } from './skeleton';

/** THE SWITCH, OFF. With it on, the game's Physician is `makePhysicianActionArt` (the bestiary's to choose), his rules as the README says. */
export const PHYSICIAN_ACTION = { on: false };

type P = Partial<Bones>;
const B = PH_BODY;
const R = PH_REST;
const FR = 1 / 30;
const D = Math.PI / 180;
/** A moment on the game's frames: frame `n`, at 30 a second. */
export const f = (n: number): number => n / 30;
const clamp01 = (v: number): number => (v < 0 ? 0 : v > 1 ? 1 : v);
const sm = (v: number): number => {
  const c = clamp01(v);
  return c * c * (3 - 2 * c);
};
const rampAt = (t: number, a: number, b: number): number => clamp01((t - a) / Math.max(1e-9, b - a));
/** A small tremble (his own lengths), different each frame, on the game's frames. */
const shiver = (t: number, amp: number, seed: number): number => (hash(Math.round(t * 30), seed, 7811) - 0.5) * 2 * amp;
/** Held, trembling: 1 from `a` to `b` (eased in and out over two frames), 0 else. */
const heldIn = (a: number, b: number) => (t: number): number => rampAt(t, a, a + 2 * FR) * (1 - rampAt(t, b - 2 * FR, b));
const L0 = plantOf(B, 'L', {}, R);
const R0 = plantOf(B, 'R', {}, R);

// =============================================================================================
// BEATS: a move said as poses at moments, made into a key at every frame the game shows (and finer through a strike, so that its
// smear follows the way it truly goes); the cane's way said as an az and an el that may go on over the top (el past 90)

const FIELDS = ['px', 'py', 'pz', 'yaw', 'pitch', 'roll', 'twist', 'bend', 'side', 'faceTurn', 'faceUp', 'faceTilt', 'lhx', 'lhy', 'lhz', 'rhx', 'rhy', 'rhz', 'lk', 'rk', 'gale'] as const;
type Field = (typeof FIELDS)[number];
const EASE = {
  io: (u: number) => u * u * (3 - 2 * u),
  lin: (u: number) => u,
  out: (u: number) => 1 - (1 - u) ** 2.4,
  in: (u: number) => u ** 2,
} as const;
interface Beat {
  readonly t: number;
  /** The body and both hands (each hand from its own shoulder along his own axes, as his rest has them). */
  readonly p: P;
  /** The cane's way (degrees: az to his left of forward, el up; el past 90 goes on over the top). */
  readonly az: number;
  readonly el: number;
  /** Which way each elbow points (his own axes), or as it was. */
  readonly wl?: V3;
  readonly wr?: V3;
  readonly ease?: keyof typeof EASE;
}
/** The cane's way as the bones take it, from an az and an el that may go on over the top; kept turning the way it was. */
function wayOf(az: number, el: number, was?: number): { wAz: number; wEl: number } {
  const w = heading(az, el);
  let a = Math.atan2(w[1], w[0]) / D;
  if (was !== undefined) a -= 360 * Math.round((a - was) / 360);
  return { wAz: a, wEl: Math.asin(Math.max(-1, Math.min(1, w[2]))) / D };
}
const WL0: V3 = [-0.2, 0.75, -0.6];
const WR0: V3 = [-0.4, -0.75, -0.5];
type More = Partial<Record<Field | 'az' | 'el', (t: number) => number>>;
/** The pose at `t` from the beats (the later beat's ease), and what is added over them. */
function poseAt(beats: ReadonlyArray<Beat>, more: More, t: number): { p: Record<Field, number>; az: number; el: number; wl: V3; wr: V3 } {
  let i = 0;
  while (i < beats.length - 2 && t > beats[i + 1].t) i++;
  const a = beats[i];
  const b = beats[Math.min(beats.length - 1, i + 1)];
  const u = b === a ? 1 : EASE[b.ease ?? 'io'](clamp01((t - a.t) / Math.max(1e-9, b.t - a.t)));
  const lerp = (x: number, y: number): number => x + (y - x) * u;
  const p = {} as Record<Field, number>;
  for (const k of FIELDS) p[k] = lerp((a.p[k] ?? R[k]) as number, (b.p[k] ?? R[k]) as number) + (more[k]?.(t) ?? 0);
  return { p, az: lerp(a.az, b.az) + (more.az?.(t) ?? 0), el: lerp(a.el, b.el) + (more.el?.(t) ?? 0), wl: lerp3(a.wl ?? WL0, b.wl ?? WL0, u), wr: lerp3(a.wr ?? WR0, b.wr ?? WR0, u) };
}
/** A MOVE FROM BEATS: keys at every game frame from the first beat to the last (four to a frame through each strike), from his stand into the first and back into his stand by `long`. */
function moveOf(beats: ReadonlyArray<Beat>, more: More, long: number, hit: number | undefined, strikes: ReadonlyArray<readonly [number, number]>, fromStand = true): Motion {
  const times: number[] = [];
  const n0 = Math.round(beats[0].t * 30);
  const n1 = Math.round(beats[beats.length - 1].t * 30);
  for (let n = n0; n <= n1; n++) {
    times.push(n / 30);
    if (strikes.some(([a, b]) => n / 30 >= a - 1e-6 && n / 30 < b - 1e-6)) for (const q of [0.25, 0.5, 0.75]) times.push((n + q) / 30);
  }
  let was: number | undefined = R.wAz;
  const keys: Key3[] = times.map((t) => {
    const s = poseAt(beats, more, t);
    const w = wayOf(s.az, s.el, was);
    was = w.wAz;
    const pose: P = { ...s.p, lhIn: 1, rhIn: 1, ...w, wRoll: 0 };
    const q = { ...R, ...pose } as Posed;
    const le = elbowFor(B, q, true, norm(s.wl));
    const re = elbowFor(B, { ...q, le } as Posed, false, norm(s.wr));
    return { at: t, ease: 'lin', pose: { ...pose, le, re } };
  });
  const end = (R.wAz as number) - 360 * Math.round(((R.wAz as number) - (was ?? 0)) / 360);
  return { hit, keys: [...(fromStand ? [{ at: 0, pose: {} }] : []), { ...keys[0], ease: 'io' }, ...keys.slice(1), { at: long, pose: { wAz: end }, ease: 'io' }] };
}
const REST_WAY = { az: R.wAz as number, el: R.wEl as number };
/** The same way as his rest's, said as gone on over the top (after a blow that came over it). */
const REST_OVER = { az: (R.wAz as number) + 180 - 360, el: 180 - (R.wEl as number) };

// =============================================================================================
// THE RAP: the cane hauled up over his right shoulder, HELD; over and down in two frames at the end of a long step

/** Its strike (the last frame of the wind-up to the frame it lands on), its blow, how long. */
export const RAP9_STRIKE = [f(26), f(28)] as const;
export const RAP9_HIT = f(28);
export const RAP9_LONG = f(66);
/** Held from (the floor marked from here) to the strike. */
export const RAP9_HOLD = [f(12), f(26)] as const;
const RAP_UP: Beat = { t: f(12), p: { px: -3, pz: R.pz + 1.0, yaw: -6, pitch: -4, bend: -10, twist: -16, side: 2, faceUp: 12, faceTurn: 12, rhx: -6, rhy: -4, rhz: 24, lhx: 16, lhy: 10, lhz: -2, lk: 10, rk: -12 }, az: -168, el: 45, wr: [-0.3, -0.8, 0.5], wl: [-0.2, 0.8, -0.4] };
function rapMotion(): Motion {
  const [a0, a1] = RAP9_STRIKE;
  const beats: Beat[] = [
    RAP_UP,
    { ...RAP_UP, t: a0, ease: 'lin' },
    { t: f(27), p: { px: 9, pz: R.pz - 2.5, yaw: 0, pitch: 10, bend: 3, twist: -4, side: 0, faceUp: 4, faceTurn: 4, rhx: 8, rhy: -5, rhz: 20, lhx: 12, lhy: 10, lhz: -8, lk: 14, rk: -10, gale: 0.6 }, az: -168, el: 125, wr: [0, -0.8, 0.5], ease: 'lin' },
    { t: a1, p: { px: 20, pz: R.pz - 7, yaw: 4, pitch: 22, bend: 14, twist: 6, side: -1, faceUp: -2, faceTurn: 0, rhx: 18, rhy: -3, rhz: -16, lhx: 8, lhy: 12, lhz: -12, lk: 26, rk: -8, gale: 1 }, az: -168, el: 216, wr: [0.3, -0.8, -0.4], ease: 'lin' },
    { t: f(30), p: { px: 21.5, pz: R.pz - 8.4, yaw: 4, pitch: 26, bend: 17, twist: 7, side: -1, faceUp: -4, faceTurn: 0, rhx: 18, rhy: -3, rhz: -20, lhx: 7, lhy: 12, lhz: -14, lk: 28, rk: -8, gale: 0.7 }, az: -168, el: 228, wr: [0.3, -0.8, -0.4], ease: 'out' },
    { t: f(38), p: { px: 21.5, pz: R.pz - 8.8, yaw: 4, pitch: 27, bend: 18, twist: 7, side: -1, faceUp: -3, faceTurn: 0, rhx: 18, rhy: -3, rhz: -21, lhx: 7, lhy: 12, lhz: -14, lk: 28, rk: -8, gale: 0.3 }, az: -168, el: 229, wr: [0.3, -0.8, -0.4], ease: 'io' },
    { t: f(50), p: { px: 9, pz: R.pz - 3, yaw: 2, pitch: 14, bend: 12, twist: 2, faceUp: 2, rhx: 14, rhy: -5, rhz: -20, lhx: 10, lhy: 6, lhz: -14, lk: 14, rk: -8 }, az: -240, el: 244, ease: 'io' },
  ];
  const held = heldIn(RAP9_HOLD[0] + FR, a0);
  return moveOf(beats, { rhz: (t) => shiver(t, 0.5, 1) * held(t), pz: (t) => shiver(t, 0.25, 2) * held(t), rhx: (t) => shiver(t, 0.3, 3) * held(t) }, RAP9_LONG, RAP9_HIT, [RAP9_STRIKE]);
}
function rapFeet(): (t: number) => P {
  return footwork(B, {
    L: { start: L0, moves: [{ t0: f(24), t1: f(28), to: plantBy(L0, 30, 1, 6), lift: 5 }, { t0: f(44), t1: f(56), to: L0, lift: 4 }] },
    R: { start: R0, moves: [{ t0: f(26), t1: f(29), to: { ...R0, pitch: 24 } }, { t0: f(46), t1: f(58), to: R0 }] },
  });
}

// =============================================================================================
// THE DRAW: en garde, HELD; the fencer's lunge in two frames; held as he draws; sprung back, the word pushed up over his head

export const DRAW9_STRIKE = [f(30), f(32)] as const;
export const DRAW9_HIT = f(32);
export const DRAW9_LONG = f(100);
/** En garde (the lane marked from here), held to the strike. */
export const DRAW9_HOLD = [f(10), f(30)] as const;
/** The plunger drawn (the barrel filling) while he holds the lunge; sprung back; held high; the plunger pushed home (the word comes up out of the quill: from `push[0]` it hangs over his head, as the game's own). */
export const DRAW9 = { fill: [f(34), f(48)] as const, back: f(58), up: f(66), push: [f(68), f(76)] as const } as const;
const GUARD: Beat = { t: f(10), p: { px: -3, pz: R.pz - 6, yaw: -40, twist: -14, pitch: 6, bend: 4, side: 1, faceTurn: 36, faceUp: 4, lhx: 9, lhy: 4, lhz: -4, rhx: -5, rhy: -7, rhz: -18, lk: 22, rk: -16 }, az: -150, el: -40, wl: [-0.2, 0.6, -0.8], wr: [-0.6, -0.6, -0.5] };
const LUNGE: Beat = { t: f(32), p: { px: 21, pz: R.pz - 14, yaw: -32, twist: -8, pitch: 14, bend: 6, side: 0, faceTurn: 28, faceUp: 4, lhx: 29, lhy: 1, lhz: -1, rhx: -12, rhy: -7, rhz: -8, lk: 40, rk: -6, gale: 1 }, az: -168, el: -16, wl: [0, 1, -0.3], wr: [-0.6, -0.6, -0.3], ease: 'lin' };
function drawMotion(): Motion {
  const [a0] = DRAW9_STRIKE;
  const HIGH: P = { px: -1, pz: R.pz + 1.0, yaw: -10, twist: -4, pitch: -6, bend: -8, side: 1, faceUp: 26, faceTurn: 8, faceTilt: 4, lhx: 3, lhy: 3, lhz: 17, rhx: 8, rhy: -6, rhz: -24, lk: 6, rk: -6 };
  const beats: Beat[] = [
    { ...GUARD, t: f(5), p: { ...GUARD.p, px: -1.5, pz: R.pz - 3, faceTurn: 20, lhx: 10, lhz: -8 } },
    GUARD,
    { ...GUARD, t: a0, ease: 'lin' },
    { ...LUNGE, t: f(31), p: { ...LUNGE.p, px: 8, pz: R.pz - 9, pitch: 10, lhx: 20, lhz: -2, rhx: -9, rhz: -12, gale: 0.6 }, az: -160, el: -28 },
    LUNGE,
    { ...LUNGE, t: f(36), p: { ...LUNGE.p, px: 21.6, pz: R.pz - 14.4, lhx: 29.4, gale: 0.5 }, ease: 'out' },
    { ...LUNGE, t: DRAW9.fill[1], p: { ...LUNGE.p, px: 20.4, pz: R.pz - 13.8, lhx: 26.5, lhz: 0, faceUp: 6, gale: 0.1 }, ease: 'io' },
    { t: DRAW9.back, p: { ...HIGH, px: 3, pz: R.pz - 2.5, faceUp: 14, lhz: 6, lhx: 9 }, az: -14, el: -72, wl: [-0.2, 0.9, 0], ease: 'in' },
    { t: DRAW9.up, p: HIGH, az: -14, el: -72, wl: [-0.2, 0.9, 0.2], ease: 'out' },
    { t: f(72), p: { ...HIGH, lhz: 17.6, faceTilt: 8 }, az: -14, el: -72, wl: [-0.2, 0.9, 0.2] },
    { t: DRAW9.push[1], p: { ...HIGH, faceTilt: 2 }, az: -14, el: -72, wl: [-0.2, 0.9, 0.2] },
  ];
  const held = heldIn(DRAW9_HOLD[0] + FR, a0);
  return moveOf(beats, { lhz: (t) => shiver(t, 0.35, 11) * held(t), lhx: (t) => shiver(t, 0.25, 12) * held(t), pz: (t) => shiver(t, 0.2, 13) * held(t) }, DRAW9_LONG, DRAW9_HIT, [DRAW9_STRIKE]);
}
function drawFeet(): (t: number) => P {
  const G_L = plantBy(L0, 6, 1, -28);
  const G_R = plantBy(R0, -6, -1.5, -38);
  return footwork(B, {
    L: { start: L0, moves: [{ t0: f(2), t1: f(9), to: G_L, lift: 3 }, { t0: f(28), t1: f(32), to: plantBy(L0, 46, 1, -24), lift: 4 }, { t0: f(50), t1: DRAW9.back + f(2), to: plantBy(L0, 2, 0.5, -8), lift: 4 }, { t0: f(80), t1: f(90), to: L0, lift: 2.5 }] },
    R: { start: R0, moves: [{ t0: f(3), t1: f(9), to: G_R, lift: 2.5 }, { t0: f(30), t1: f(33), to: { ...G_R, pitch: 18 } }, { t0: f(52), t1: DRAW9.back + f(4), to: plantBy(R0, -1, -0.5, -10), lift: 3 }, { t0: f(82), t1: f(92), to: R0, lift: 2.5 }] },
  });
}
/** The plunger drawn back, and the barrel filling, as he holds the lunge; pushed home over his head. */
const drawPlunger = (t: number): number => (t < DRAW9.push[0] ? sm((t - DRAW9.fill[0]) / (DRAW9.fill[1] - DRAW9.fill[0])) : 1 - sm((t - DRAW9.push[0]) / (DRAW9.push[1] - DRAW9.push[0])));
/** The syringe at the wrist: cocked up at rest, straight along his arm en garde and in the lunge, up to the sky held high. */
const drawCock = (t: number): number => (t < f(8) ? 1.6 * (1 - sm(t / f(8))) : t < DRAW9.fill[1] ? 0 : t < DRAW9.push[1] ? 0.8 * sm((t - DRAW9.fill[1]) / 0.4) : 0.8 + 0.8 * sm((t - DRAW9.push[1]) / (DRAW9_LONG - DRAW9.push[1])));

// =============================================================================================
// DIAGNOSIS: the syringe to his belt, the great brass lens drawn from his coat and raised before his beak; peering through it

export const DIAG = {
  /** The syringe through his belt from `belt`; his hand into his coat, the lens out of it at `lens`; raised before his beak by `up`. */
  belt: f(6),
  lens: f(12),
  up: f(22),
  /** THE LOOK: the frames the game loops while the beam tracks you (the pose at both ends the same); then lowered, the lens back into his coat at `away`, the syringe taken up again at `unbelt`. */
  loop: [f(22), f(70)] as const,
  away: f(80),
  unbelt: f(88),
  long: f(98),
} as const;
const LOOK: Beat = { t: DIAG.up, p: { px: 1.5, pz: R.pz - 1.0, yaw: -6, twist: -6, pitch: 9, bend: 12, side: 0, faceUp: 4, faceTurn: 4, faceTilt: 0, lhx: 25, lhy: 5, lhz: 9, rhx: 8.5, rhy: -6, rhz: -24, lk: 8, rk: -6 }, az: -14, el: -72, wl: [-0.3, 0.8, -0.3] };
function diagnoseMotion(): Motion {
  const [l0, l1] = DIAG.loop;
  const P_ = l1 - l0;
  const beats: Beat[] = [
    { t: f(5), p: { pz: R.pz - 0.3, pitch: 7, bend: 11, faceUp: -8, faceTurn: -8, lhx: 2.5, lhy: 3.2, lhz: -23 }, ...REST_WAY, wl: [-0.4, 0.8, -0.3] },
    { t: f(11), p: { pz: R.pz - 0.3, pitch: 6, bend: 10, faceUp: -4, faceTurn: -4, twist: 4, lhx: 7, lhy: -1, lhz: -8 }, ...REST_WAY, wl: [-0.3, 0.9, -0.2] },
    LOOK,
    { ...LOOK, t: l1, ease: 'lin' },
    { t: DIAG.away, p: { pz: R.pz - 0.3, pitch: 6, bend: 10, faceUp: -2, faceTurn: -4, twist: 4, lhx: 7, lhy: -1, lhz: -8 }, ...REST_WAY, wl: [-0.3, 0.9, -0.2] },
    { t: DIAG.unbelt, p: { pz: R.pz - 0.3, pitch: 7, bend: 11, faceUp: -8, faceTurn: -8, lhx: 2.5, lhy: 3.2, lhz: -23 }, ...REST_WAY, wl: [-0.4, 0.8, -0.3] },
  ];
  // (peering: his beaked head cocked this way and that as a bird's, held, sharply turned; the lens trembling; a breath; all of it
  // round once in the loop, so that its two ends are the same)
  const inLoop = (t: number): number => (t > l0 && t < l1 ? 1 : 0);
  const ph = (t: number): number => ((t - l0) / P_) * Math.PI * 2;
  return moveOf(beats, {
    faceTilt: (t) => inLoop(t) * 12 * Math.tanh(3 * Math.sin(ph(t))),
    faceTurn: (t) => inLoop(t) * 6 * Math.tanh(2.5 * Math.sin(2 * ph(t))),
    faceUp: (t) => inLoop(t) * 2 * Math.sin(ph(t) * 3),
    pz: (t) => inLoop(t) * 0.5 * Math.sin(ph(t) * 2),
    bend: (t) => inLoop(t) * -0.8 * Math.sin(ph(t) * 2),
    lhz: (t) => inLoop(t) * 0.4 * Math.sin(ph(t) * 4),
    lhy: (t) => inLoop(t) * 0.3 * Math.sin(ph(t) * 3),
  }, DIAG.long, undefined, []);
}

// =============================================================================================
// HE OPERATES: the lens flung up over his head, flaring; his instruments fanned out round the cane; HELD; slashed down in two frames

export const OP_STRIKE = [f(40), f(42)] as const;
export const OP_HIT = f(42);
export const OP_LONG = f(110);
/** Wound up (the field over you marked, the lens gathering its light) from the first, held to the strike. */
export const OP_HOLD = [f(12), f(40)] as const;
/** The fan of instruments opening out of his fist, and closing again; the lens back into his coat; the syringe taken up again. */
export const OP = { fan: [f(3), f(12)] as const, shut: [f(62), f(70)] as const, away: f(86), unbelt: f(94) } as const;
const OP_UP: Beat = { t: f(12), p: { px: -4, pz: R.pz + 0.8, yaw: -10, pitch: -6, bend: -12, twist: -18, side: 2, faceUp: 16, faceTurn: 14, faceTilt: 0, lhx: 6, lhy: 10, lhz: 26, rhx: -8, rhy: -6, rhz: 18, lk: 12, rk: -14 }, az: -160, el: 30, wl: [-0.2, 0.9, 0.3], wr: [-0.3, -0.8, 0.5] };
function operateMotion(): Motion {
  const [a0, a1] = OP_STRIKE;
  const beats: Beat[] = [
    { ...LOOK, t: 0 },
    OP_UP,
    { ...OP_UP, t: a0, ease: 'lin' },
    { t: f(41), p: { px: 10, pz: R.pz - 4, yaw: -2, pitch: 12, bend: 4, twist: -2, side: 0, faceUp: 4, faceTurn: 4, lhx: 18, lhy: 8, lhz: 6, rhx: 12, rhy: -6, rhz: 16, lk: 20, rk: -10, gale: 0.7 }, az: -170, el: 120, wl: [-0.1, 0.9, -0.1], wr: [0, -0.8, 0.4], ease: 'lin' },
    { t: a1, p: { px: 20, pz: R.pz - 9, yaw: 10, pitch: 24, bend: 16, twist: 14, side: -2, faceUp: -2, faceTurn: -4, lhx: 24, lhy: 6, lhz: -4, rhx: 16, rhy: 4, rhz: -12, lk: 30, rk: -8, gale: 1 }, az: -150, el: 215, wl: [0, 1, -0.3], wr: [0.3, -0.7, -0.4], ease: 'lin' },
    { t: f(46), p: { px: 21, pz: R.pz - 10, yaw: 12, pitch: 26, bend: 18, twist: 17, side: -2, faceUp: -2, faceTurn: -4, lhx: 24.5, lhy: 6, lhz: -6, rhx: 15, rhy: 7, rhz: -15, lk: 30, rk: -8, gale: 0.6 }, az: -140, el: 222, wl: [0, 1, -0.3], wr: [0.3, -0.7, -0.4], ease: 'out' },
    { t: f(64), p: { px: 20.5, pz: R.pz - 9.6, yaw: 11, pitch: 25, bend: 17, twist: 16, side: -2, faceUp: 0, faceTurn: -4, lhx: 24, lhy: 6, lhz: -5, rhx: 15, rhy: 7, rhz: -15, lk: 30, rk: -8, gale: 0.2 }, az: -140, el: 221, wl: [0, 1, -0.3], wr: [0.3, -0.7, -0.4], ease: 'io' },
    { t: f(78), p: { px: 6, pz: R.pz - 2, yaw: 2, pitch: 10, bend: 10, twist: 4, faceUp: 0, faceTurn: 0, lhx: 12, lhy: 2, lhz: -8, rhx: 10, rhy: -6, rhz: -22, lk: 12, rk: -8 }, az: -220, el: 250, wl: [-0.3, 0.9, -0.2], ease: 'io' },
    { t: OP.away, p: { pz: R.pz - 0.3, pitch: 6, bend: 10, faceUp: -2, faceTurn: -4, twist: 4, lhx: 7, lhy: -1, lhz: -8 }, ...REST_OVER, wl: [-0.3, 0.9, -0.2] },
    { t: OP.unbelt, p: { pz: R.pz - 0.3, pitch: 7, bend: 11, faceUp: -8, faceTurn: -8, lhx: 2.5, lhy: 3.2, lhz: -23 }, ...REST_OVER, wl: [-0.4, 0.8, -0.3] },
  ];
  const held = heldIn(OP_HOLD[0] + FR, a0);
  // (terrible: the whole of him trembling with it, ever harder, the lens shaking over his head)
  const grow = (t: number): number => 0.6 + 0.8 * rampAt(t, OP_HOLD[0], a0);
  return moveOf(beats, {
    rhz: (t) => shiver(t, 0.5, 21) * held(t) * grow(t),
    lhz: (t) => shiver(t, 0.6, 22) * held(t) * grow(t),
    lhy: (t) => shiver(t, 0.4, 23) * held(t) * grow(t),
    pz: (t) => shiver(t, 0.25, 24) * held(t) * grow(t),
  }, OP_LONG, OP_HIT, [OP_STRIKE], false);
}
function operateFeet(): (t: number) => P {
  return footwork(B, {
    L: { start: L0, moves: [{ t0: f(37), t1: f(42), to: plantBy(L0, 28, 2, 10), lift: 5 }, { t0: f(70), t1: f(82), to: L0, lift: 4 }] },
    R: { start: R0, moves: [{ t0: f(40), t1: f(43), to: { ...R0, pitch: 26 } }, { t0: f(72), t1: f(84), to: R0 }] },
  });
}

// =============================================================================================
// ROUNDS: drawn up, the cane hoisted high, HELD; rammed down on the boards three times, each in two frames; the sweep round the room

export const ROUNDS9_STRIKES = [[f(26), f(28)], [f(44), f(46)], [f(62), f(64)]] as const;
export const ROUNDS9_HITS = [f(28), f(46), f(64)] as const;
export const ROUNDS9_LONG = f(116);
/** Drawn up and held (the rings' reach marked from here); between the raps, hoisted again (in a third of a second) and held a breath. */
export const ROUNDS9_HOLD = [f(10), f(26)] as const;
export const ROUNDS9_SWEEP = [f(76), f(100)] as const;
const HOIST = (t: number, k = 0): Beat => ({ t, p: { px: -1.5, pz: R.pz + 1.4 - 0.3 * k, yaw: -2, pitch: -5 + 2 * k, bend: -9 + 2 * k, twist: -4, faceUp: 18 - 3 * k, faceTurn: 2, lhx: 5, lhy: 14, lhz: 4, rhx: 14, rhy: -6, rhz: 22 - k, lk: 10, rk: -10 }, az: -8, el: -60, wl: [-0.3, 0.9, 0.3], wr: [-0.3, -0.8, 0.4] });
const RAMMED = (t: number, k: number, deep = 0): Beat => ({ t, p: { px: 4 + k, pz: R.pz - 5.5 - deep, yaw: 0, pitch: 14 + deep, bend: 12 + deep, twist: 2, faceUp: -2, faceTurn: 0, lhx: 8, lhy: 15, lhz: -4, rhx: 15, rhy: -6, rhz: -14 - 0.6 * deep, lk: 16, rk: -10, gale: 1 }, az: -8, el: -84, wr: [0.2, -0.8, -0.3], ease: 'lin' });
function roundsMotion(): Motion {
  const [[a0], [b0], [c0]] = ROUNDS9_STRIKES;
  const [h1, h2, h3] = ROUNDS9_HITS;
  // (half way down: the hips and the body there first, most of the way, the cane only half)
  const mid = (t: number, k: number, deep = 0): Beat => ({ ...HOIST(t, k), p: { ...HOIST(t, k).p, px: 3 + k, pz: R.pz - 3.5 - deep, pitch: 11 + deep, bend: 6, rhz: 6 }, el: -70, ease: 'lin' });
  const after = (t: number, k: number, deep = 0): Beat => ({ ...RAMMED(t, k, deep), p: { ...RAMMED(t, k, deep).p, pz: R.pz - 7 - deep, pitch: 17 + deep, rhz: -18 - 0.2 * deep, gale: 0.5 }, ease: 'out' });
  const POINT = (t: number, side: number): Beat => ({ t, p: { px: 2, pz: R.pz - 0.4, yaw: side * 26, twist: side * 20, pitch: 6, bend: 4, faceUp: 8, faceTurn: side * 28, lhx: 9, lhy: 4, lhz: -14, rhx: 18, rhy: -5 + side * 5, rhz: 1, lk: 8, rk: -8 }, az: side * 52, el: -8, wr: [-0.2, -0.9, -0.2] });
  const beats: Beat[] = [
    HOIST(ROUNDS9_HOLD[0]),
    { ...HOIST(a0), ease: 'lin' },
    mid(f(27), 0),
    RAMMED(h1, 0),
    after(f(30), 0),
    { ...HOIST(f(40), 1), ease: 'io' },
    { ...HOIST(b0, 1), ease: 'lin' },
    mid(f(45), 1),
    RAMMED(h2, 1),
    after(f(48), 1),
    { ...HOIST(f(58), 2), ease: 'io' },
    { ...HOIST(c0, 2), ease: 'lin' },
    mid(f(63), 2, 2),
    RAMMED(h3, 2, 2),
    after(f(66), 2, 2),
    { ...after(f(72), 2, 2), ease: 'io' },
    POINT(ROUNDS9_SWEEP[0] + f(4), -1),
    POINT(f(90), 0),
    POINT(ROUNDS9_SWEEP[1], 1),
  ];
  const held = (t: number): number => heldIn(ROUNDS9_HOLD[0] + FR, a0)(t) + heldIn(f(41), b0)(t) + heldIn(f(59), c0)(t);
  return moveOf(beats, { rhz: (t) => shiver(t, 0.4, 31) * held(t), pz: (t) => shiver(t, 0.2, 32) * held(t), lhz: (t) => shiver(t, 0.4, 33) * held(t) }, ROUNDS9_LONG, ROUNDS9_HITS[0], ROUNDS9_STRIKES);
}
function roundsFeet(): (t: number) => P {
  return footwork(B, {
    L: { start: L0, moves: [{ t0: f(22), t1: f(27), to: plantBy(L0, 10, 1, 4), lift: 4 }, { t0: f(100), t1: f(110), to: L0, lift: 3 }] },
    R: { start: R0, moves: [{ t0: h(0), t1: h(0) + f(2), to: { ...R0, pitch: 14 } }, { t0: f(100), t1: f(110), to: R0 }] },
  });
}
const h = (i: number): number => ROUNDS9_HITS[i] - f(1);

// =============================================================================================
// THE GREAT BRASS LENS, AND HIS INSTRUMENTS

const BRASS: Ramp = ['#38280f', '#5a4218', '#a07a36', '#d0a656', '#ecca7c'];
const STEEL: Ramp = ['#2c2e34', '#4a4e56', '#8c929c', '#c4c8d0', '#e8eaee'];
const EBONY: Ramp = ['#0d0b0b', '#0d0b0b', '#2a2320', '#3e3530', '#4c423c'];
/** The pale light it gives (warm, never the friend's cyan); its flare, burning to the enemy's gold. */
export const LIGHT = { pale: '#f4ecd2', warm: '#ffe4a6', gold: FLAME[3], white: '#fff8e6' } as const;
/** The lens: its glass's half-width (his own lengths), its brass handle. */
export const LENS = { r: 8.2, handle: 7 } as const;
/** Where the lens is (in his left hand), which way it faces, and its own two axes across it. */
export function lensOf(s: Skeleton): { c: V3; n: V3; u: V3; v: V3; grip: V3 } {
  const fore = norm(sub(s.handL, s.elbowL), [1, 0, 0]);
  // (its handle up out of his fist, along his forearm's line turned up toward the sky; its glass facing forward, the way his chest faces)
  const up = norm(add(mul(fore, 0.35), [0, 0, 1]), [0, 0, 1]);
  const grip = add(s.handL, mul(up, 0.8));
  const c = add(s.handL, mul(up, LENS.handle + LENS.r));
  const f0 = norm([s.chest[0][0], s.chest[0][1], 0], [1, 0, 0]);
  const n = norm(sub(f0, mul(up, f0[0] * up[0] + f0[1] * up[1] + f0[2] * up[2])), f0);
  const u = norm(cross(up, n), [0, 1, 0]);
  const v = norm(cross(n, u), [0, 0, 1]);
  return { c, n, u, v, grip };
}
/** The fan of instruments in his right fist round the cane: each one's root and point (`k`: how far it is fanned out, 0 to 1). */
export function fanOf(s: Skeleton, k: number): { a: V3; b: V3; kind: number }[] {
  if (k <= 0.01) return [];
  const p = s.point;
  // (fanned in the plane of the cane and the way across his fist)
  const across = norm(cross(p, s.chest[2]), [0, 1, 0]);
  const out: { a: V3; b: V3; kind: number }[] = [];
  const ANG = [-48, -32, -16, 16, 32, 48];
  const LEN = [17, 20, 22, 22, 19, 16];
  ANG.forEach((g, i) => {
    const a = g * k * D;
    const w = norm(add(mul(p, Math.cos(a)), mul(across, Math.sin(a))), p);
    const root = add(s.handR, mul(w, 1.8));
    out.push({ a: root, b: add(root, mul(w, LEN[i] * (0.35 + 0.65 * k))), kind: i });
  });
  return out;
}
function lensBits(put: Put, m: Moment, flare: number): void {
  const L = lensOf(m.s);
  // the handle and its knob
  put('lens', 'handle', { k: 'rod', a: add(m.s.handL, mul(L.v, -1.6)), b: add(L.c, mul(L.v, -LENS.r)), ra: 0.75, rb: 0.75, ramp: BRASS });
  put('lens', 'handle', { k: 'ball', c: add(m.s.handL, mul(L.v, -1.8)), ax: sphere(1.0), skin: BRASS });
  // the glass: pale, a glare across it; flaring, burning white-gold
  const glass = (a0: number, b0: number, _front: boolean, tone: number): string | null => {
    // (its skin is told where on it in his own lengths from its middle)
    const a = a0 / LENS.r;
    const b = b0 / LENS.r;
    const r2 = a * a + b * b;
    if (r2 > 1) return null;
    if (flare > 0.5) return r2 < 0.3 ? LIGHT.white : r2 < 0.65 ? LIGHT.warm : LIGHT.gold;
    const glare = Math.abs(a + b - 0.5) < 0.18 && r2 < 0.7;
    return glare ? '#f6f0dc' : r2 > 0.75 ? ['#5c5848', '#6e6a58', '#8a8670', '#a29e86', '#b8b49c'][tone] : ['#7a7864', '#8e8c76', '#a8a690', '#c0bea6', '#d4d2bc'][tone];
  };
  put('lens', 'glass', { k: 'panel', c: L.c, u: mul(L.u, LENS.r), v: mul(L.v, LENS.r), skin: glass });
  // the brass rim round it
  const N = 18;
  for (let i = 0; i < N; i++) {
    const a0 = (i / N) * Math.PI * 2;
    const a1 = ((i + 1) / N) * Math.PI * 2;
    const p0 = add(L.c, add(mul(L.u, Math.cos(a0) * LENS.r), mul(L.v, Math.sin(a0) * LENS.r)));
    const p1 = add(L.c, add(mul(L.u, Math.cos(a1) * LENS.r), mul(L.v, Math.sin(a1) * LENS.r)));
    put('lens', 'rim', { k: 'rod', a: p0, b: p1, ra: 0.95, rb: 0.95, ramp: BRASS });
  }
  if (flare > 0.05) put('lens', 'flare', { k: 'glow', p: add(L.c, mul(L.n, 1)), c: LIGHT.warm, r: 10 + 26 * flare, a: 0.25 + 0.5 * flare });
  else put('lens', 'flare', { k: 'glow', p: add(L.c, mul(L.n, 1)), c: LIGHT.pale, r: 9, a: 0.25 });
}
function fanBits(put: Put, m: Moment, k: number, glint: number): void {
  for (const x of fanOf(m.s, k)) {
    const w = norm(sub(x.b, x.a));
    const hilt = add(x.a, mul(w, 4.5));
    put('fan', 'hilts', { k: 'rod', a: x.a, b: hilt, ra: 0.75, rb: 0.65, ramp: EBONY });
    // (the bone saw broad, the scalpels and lancets thin to a point)
    const broad = x.kind === 1;
    put('fan', 'blades', { k: 'rod', a: hilt, b: x.b, ra: broad ? 1.1 : 0.6, rb: broad ? 0.8 : 0.12, ramp: STEEL });
    if (glint > 0.3 && (x.kind === 2 || x.kind === 4)) put('fan', 'glint', { k: 'mote', p: x.b, c: glint > 0.7 ? LIGHT.white : FLAME[3], size: 2 });
  }
}

// =============================================================================================
// THE STRIKES, AND THEIR SMEAR

export type ActMove = 'attack' | 'draw' | 'diagnose' | 'operate' | 'rounds';
export const PH_ACT_MOVES: ReadonlyArray<ActMove> = ['attack', 'draw', 'diagnose', 'operate', 'rounds'];
export const PH_ACT_STRIKES: Readonly<Record<string, ReadonlyArray<readonly [number, number]>>> = {
  attack: [RAP9_STRIKE],
  draw: [DRAW9_STRIKE],
  operate: [OP_STRIKE],
  rounds: ROUNDS9_STRIKES,
};
/** Whether a frame of a move shows a strike's smear: from the frame after its wind-up ends to the frame after it lands. */
export function phSmeared(move: string, t: number): boolean {
  return (PH_ACT_STRIKES[move] ?? []).some((s) => t > s[0] + 1e-6 && t <= s[1] + FR + 1e-6);
}
const fanAt = (t: number): number => sm(rampAt(t, OP.fan[0], OP.fan[1])) * (1 - sm(rampAt(t, OP.shut[0], OP.shut[1])));
/** What of him strikes: along the cane (and the outermost of his instruments as he operates), or the quill and the barrel. */
function struckPoints(move: string, s: Skeleton, t: number): V3[] {
  if (move === 'draw') {
    const sy = syringeOf(s, drawCock(t));
    return [sy.tip, sy.mouth];
  }
  const c = caneOf(s);
  const pts = [c.tip, lerp3(c.knob, c.tip, 0.55)];
  if (move === 'operate') for (const x of fanOf(s, fanAt(t))) if (x.kind === 0 || x.kind === 5) pts.push(x.b);
  return pts;
}
function smearRopes(of: () => Mob, move: string, t: number): Ropes {
  const out: Record<string, V3[]> = {};
  for (const st of PH_ACT_STRIKES[move] ?? []) {
    if (!(t > st[0] + 1e-6 && t <= st[1] + FR + 1e-6)) continue;
    const from = t > st[1] + 1e-6 ? st[1] - FR * 0.6 : st[0] - FR * 0.3;
    const to = Math.min(t, st[1]);
    const N = 16;
    const lines: V3[][] = [];
    for (let k = 0; k <= N; k++) {
      const tt = from + ((to - from) * k) / N;
      struckPoints(move, skeletonAt(of(), move, tt), tt).forEach((p, j) => (lines[j] ??= []).push(p));
    }
    lines.forEach((l, j) => (out[`smear${j}`] = l));
  }
  return out;
}
/** The smear's after-images: the oldest the enemy's dull pink, the newest near white; the cane's middle a line of brass. */
const SMEAR = [FLAME[1], FLAME[2], FLAME[3], FLAME[4], '#fff4e8'] as const;
function smearBits(m: Moment): Bit[] {
  const bits: Bit[] = [];
  if (!m.ropes) return bits;
  for (const [k, line] of Object.entries(m.ropes)) {
    if (!k.startsWith('smear') || line.length < 2) continue;
    const mid = k === 'smear1';
    for (let i = 1; i < line.length; i++) {
      const age = i / (line.length - 1);
      const n = Math.max(1, Math.ceil(len(sub(line[i], line[i - 1])) / 1.2));
      for (let j = 0; j < n; j++) {
        const p = lerp3(line[i - 1], line[i], j / n);
        const c = age > 0.88 ? SMEAR[4] : age > 0.66 ? SMEAR[3] : age > 0.42 ? SMEAR[2] : age > 0.2 ? SMEAR[1] : SMEAR[0];
        bits.push({ part: 'smear', piece: 'smear', shape: { k: 'mote', p: [p[0], p[1], Math.max(0.8, p[2])], c: mid && age < 0.6 ? BRASS[3] : c, size: age > 0.4 && !mid ? 2 : 1 } });
      }
    }
  }
  return bits;
}

// =============================================================================================
// HIM, WITH THESE MOVES

/** His canvas for these: room for the cane hauled up over his head, the long lunge, the lens flung up and the fan of instruments. */
export const PH_ACT_CANVAS: MobCanvas = { w: 560, h: 480, ax: 270, ay: 350 };
/** The names these moves go by (none of the game's own, so that his painter says of them what these say). */
export const ACT_NAMES = {
  attack: 'The Physician raps his cane down hard',
  draw: 'The Physician lunges and draws a word',
  diagnose: 'The Physician diagnoses you through his lens',
  operate: 'The Physician operates',
  rounds: 'The Physician makes his rounds, rapping',
} as const;
const KEY = new Map<string, ActMove>(Object.entries(ACT_NAMES).map(([k, v]) => [v, k as ActMove]));
const keyOfM = (m: Moment): ActMove | null => KEY.get(m.move ?? '') ?? null;
/** How far the lens is flaring, `t` into his operation: gathering through the wind-up, blazing at the strike, dying after. */
export const flareAt = (t: number): number => (t < OP_HOLD[0] ? 0.3 * rampAt(t, 0, OP_HOLD[0]) : t < OP_HIT ? 0.55 + 0.45 * rampAt(t, OP_HOLD[0], OP_STRIKE[0]) : 1 - 0.85 * rampAt(t, OP_HIT + 0.1, OP_HIT + 0.9));
/** When the lens is in his hand (and the syringe in his belt), in Diagnosis and as he operates. */
const lensIn = (key: ActMove, t: number): boolean => (key === 'diagnose' ? t >= DIAG.lens - 1e-6 && t < DIAG.away : key === 'operate' ? t < OP.away : false);
const inBelt = (key: ActMove, t: number): boolean => (key === 'diagnose' ? t >= DIAG.belt - 1e-6 && t < DIAG.unbelt : key === 'operate' ? t < OP.unbelt : false);
const PAINT = physicianPainter({
  cane: () => true,
  syringe: (m) => {
    const k = keyOfM(m);
    return k && inBelt(k, m.t) ? 'belt' : 'hand';
  },
  plunger: (m) => (keyOfM(m) === 'draw' ? drawPlunger(m.t) : 0),
  fill: (m) => (keyOfM(m) === 'draw' ? drawPlunger(m.t) : 0),
  inHand: () => 0,
  onBelt: () => 5,
  hat: () => true,
  cock: (m) => (keyOfM(m) === 'draw' ? drawCock(m.t) : 1.6),
  glintOn: (m) => (keyOfM(m) === 'draw' ? 'syringe' : 'cane'),
});
function actionBits(st: Stage, m: Moment): Bit[] {
  const key = keyOfM(m);
  if (!key) return PHYSICIAN.bits(st, m);
  const bits = PAINT.bits(st, m);
  const put: Put = (part, piece, shape) => bits.push({ part, piece, shape });
  if (lensIn(key, m.t)) lensBits(put, m, key === 'operate' ? flareAt(m.t) : 0);
  if (key === 'operate') fanBits(put, m, fanAt(m.t), m.glint);
  return [...bits, ...smearBits(m)];
}
const glintOf = (pts: ReadonlyArray<readonly [number, number, number]>) => (t: number): number => {
  let g = 0;
  for (const [from, hit, after] of pts) {
    if (t < from || t > hit + after + 0.3) continue;
    g = Math.max(g, t < hit ? 0.2 + 0.8 * rampAt(t, from, hit - 0.1) : t < hit + after ? 1 : 1 - rampAt(t, hit + after, hit + after + 0.3));
  }
  return g;
};
let MOB: Mob | null = null;
const mobNow = (): Mob => (MOB ??= physicianActionMob());
const withSmear = (mv: MobMove, move: string): MobMove => ({ ...mv, ropes: (t) => smearRopes(mobNow, move, t) });

/** THE PHYSICIAN WITH HIS MOVES DONE THE ACTION WAY: his stand, walk, struck and death the game's own. */
export function physicianActionMob(): Mob {
  if (MOB) return MOB;
  const G = PHYSICIAN;
  const { tonic: _old, ...more } = G.more as Readonly<Record<string, MobMove>>;
  void _old;
  MOB = {
    ...G,
    attack: withSmear({ name: ACT_NAMES.attack, motion: rapMotion(), rest: R, feet: rapFeet(), glint: glintOf([[f(4), RAP9_HIT, 0.1]]) }, 'attack'),
    hit: RAP9_HIT,
    warn: RAP9_STRIKE[0] - RAP9_HOLD[0],
    canvas: PH_ACT_CANVAS,
    aura: { ...G.aura, x: PH_ACT_CANVAS.ax, y: PH_ACT_CANVAS.ay - 60 },
    bits: actionBits,
    grains: (st, m) => (keyOfM(m) ? [] : G.grains!(st, m)),
    more: {
      ...more,
      draw: withSmear({ name: ACT_NAMES.draw, motion: drawMotion(), rest: R, feet: drawFeet(), glint: glintOf([[f(4), DRAW9_HIT, 0.1]]) }, 'draw'),
      diagnose: { name: ACT_NAMES.diagnose, motion: diagnoseMotion(), rest: R },
      operate: withSmear({ name: ACT_NAMES.operate, motion: operateMotion(), rest: R, feet: operateFeet(), glint: glintOf([[f(4), OP_HIT, 0.15]]) }, 'operate'),
      rounds: withSmear({ name: ACT_NAMES.rounds, motion: roundsMotion(), rest: R, feet: roundsFeet(), glint: glintOf([[f(4), ROUNDS9_HITS[0], 0.05], [f(34), ROUNDS9_HITS[1], 0.05], [f(52), ROUNDS9_HITS[2], 0.1]]) }, 'rounds'),
    },
  };
  return MOB;
}

// =============================================================================================
// HIM AS THE CHECKS SEE HIM

function actionThings(move: string, t: number, s: Skeleton, q: Posed): CheckThing[] {
  if (!(PH_ACT_MOVES as ReadonlyArray<string>).includes(move)) return PH_SHAPE.things!(move, t, s, q);
  const key = move as ActMove;
  const out: CheckThing[] = [];
  const c = caneOf(s);
  out.push({ name: 'cane', pts: [c.knob, lerp3(c.knob, c.tip, 0.33), lerp3(c.knob, c.tip, 0.66), c.tip], r: 0.7, may: ['foreR'] });
  if (!inBelt(key, t)) {
    const sy = syringeOf(s, key === 'draw' ? drawCock(t) : 1.6);
    out.push({ name: 'syringe', pts: [sy.back, lerp3(sy.back, sy.mouth, 0.5), sy.mouth, sy.tip], r: 1.4, may: ['foreL'] });
  }
  if (lensIn(key, t)) {
    const L = lensOf(s);
    const rim = [0, 1, 2, 3, 4, 5, 6, 7].map((i) => add(L.c, add(mul(L.u, Math.cos((i / 8) * Math.PI * 2) * LENS.r), mul(L.v, Math.sin((i / 8) * Math.PI * 2) * LENS.r))));
    out.push({ name: 'lens', pts: [L.grip, add(L.c, mul(L.v, -LENS.r)), L.c, ...rim], r: 1.0, may: ['foreL'] });
  }
  if (key === 'operate') for (const x of fanOf(s, fanAt(t))) out.push({ name: `blade${x.kind}`, pts: [x.a, lerp3(x.a, x.b, 0.5), x.b], r: 0.6, may: ['foreR'] });
  return out;
}
/** Where his moves hand over: his stand into each and back (and into his walk and out of it); and from any frame of Diagnosis's look into his operation. */
function handovers(mob: Mob): Handover[] {
  const all = ['attack', 'draw', 'diagnose', 'operate', 'rounds', 'reel', 'dying'];
  const out: Handover[] = [];
  for (const m of all) {
    if (m !== 'operate') out.push({ from: 'stand', at: 0, to: m, toAt: 0 });
    if (m !== 'dying') out.push({ from: m, at: 'end', to: 'stand', toAt: 0 });
  }
  out.push({ from: 'stand', at: 0, to: 'walk', toAt: 0 });
  for (const t of framesOf(mob, 'walk')) out.push({ from: 'walk', at: t, to: 'stand', toAt: 0 });
  for (let n = Math.round(DIAG.loop[0] * 30); n <= Math.round(DIAG.loop[1] * 30); n++) out.push({ from: 'diagnose', at: n / 30, to: 'operate', toAt: 0 });
  return out;
}
export const PH_ACT_SHAPE: BossShape = {
  body: physicianSolids,
  tip: (move, t, s) => (move === 'draw' ? syringeOf(s, drawCock(t)).tip : move === 'attack' || move === 'operate' || move === 'rounds' ? caneOf(s).tip : null),
  things: actionThings,
  blows: {
    rounds: [
      { hit: ROUNDS9_HITS[0], strike: ROUNDS9_STRIKES[0], from: 0, until: f(34) },
      { hit: ROUNDS9_HITS[1], strike: ROUNDS9_STRIKES[1], from: f(32), until: f(52) },
      { hit: ROUNDS9_HITS[2], strike: ROUNDS9_STRIKES[2], from: f(50), until: f(74) },
    ],
  },
  strikes: { attack: RAP9_STRIKE, draw: DRAW9_STRIKE, operate: OP_STRIKE },
  smeared: phSmeared,
  get handovers() {
    return handovers(physicianActionMob());
  },
};

/** HIM AS THE GAME WOULD HOLD HIM WITH PHYSICIAN_ACTION ON. */
export function makePhysicianActionArt(pace = PHYSICIAN.pace): ActorArt {
  const mob = physicianActionMob();
  return { front: mobSet(mob, 'front', pace), back: mobSet(mob, 'back', pace) };
}
/** Where the end he strikes with is (his own lengths) `t` seconds into a move: the cane's ferrule, or the quill. */
export function tipAt(move: ActMove, t: number): V3 {
  const mob = physicianActionMob();
  const s = skeletonAt(mob, move, t);
  return move === 'draw' ? syringeOf(s, drawCock(t)).tip : caneOf(s).tip;
}
/** Where the lens is (his own lengths) `t` seconds into Diagnosis or his operation. */
export function lensAt(move: 'diagnose' | 'operate', t: number): V3 {
  return lensOf(skeletonAt(physicianActionMob(), move, t)).c;
}
export const tilesOf = (p: V3): [number, number] => [p[0] / TILE3, p[1] / TILE3];
void posedOfMob;
void solve;
