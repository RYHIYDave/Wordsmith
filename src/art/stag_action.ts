// THE HOLLOW STAG DONE THE ACTION WAY (the art chat's helper, 1 Nov 2026; docs/mockups/action_f9_stag/README.md). A MOCK-UP:
// NOTHING OF THE GAME IMPORTS THIS FILE. All of it is behind one switch, STAG_ACTION, off: with it off every frame the game shows
// of the Hollow Stag and of its roots is as it was (art/hollow_stag.ts: its moves kept as they are; its insides now exported so
// that these moves are painted by its own painter).
//
// His words, 31 Oct 2026, offered “The wood closes in, in place of the root lines: roots burst up from the clearing's edge in
// rings, closing inward until little safe ground is left, then sink away”: “I love this.  It shrinks at 3/4, 1/2, and 1/4.  And
// I’d like him to move around the arena like the horse does in the princess fight.  Really explore the space.  Not EXACTLY like
// the horse but similar”. Read as (told him so): the ring of roots closes in and STAYS at three quarters, half and a quarter of
// his life, the clearing smaller each time; and he bounds all round the arena between blows, using the whole space, like the
// Princess's steed but his own. Under his Movement 9 (24 Oct, “Like the wind up and wind down are big but the actual punch is
// lightning quick”; 28 Oct, “And bigger AOE to compensate for the extra time the player gets to evade”) and his rulebook's
// Monsters 9, Action, like a movie.
//
//   THE WOOD CLOSES IN (`close`, in place of `roots`): at 3/4, 1/2 and 1/4 of his life he draws breath and rears up BELLOWING,
//     HELD, the clearing's new edge marked on the floor; he crashes down onto his forefeet in two frames and a wall of roots and
//     thorny trunks bursts up all round the new edge (art/stag_action_fx.ts), and stays: the clearing smaller each time.
//   HE BOUNDS ROUND THE ARENA (`walk`): great stotting bounds on stiff legs, all four hoofs together, jinking as he lands,
//     leaves and earth thrown up; and STANDS TO STARE (`stare`): a heavy landing (it knocks), then still, head high, glaring.
//   THE GORE (`attack`) by Movement 9: head down, antlers cocked to one side, a forefoot pawing, HELD; in two frames he lunges and
//     hooks his antlers up and across, a sweep of 150 degrees out to 3 tiles; his head flung high after.
//   THE CHARGE (`charge`) by Movement 9: its lane marked; head down, pawing twice, HELD; he bursts off in two frames and gallops
//     down the lane at 12 tiles a second; at its end his antlers smash into the wall of roots, splintering it.
//   His stand, his bellow (the wolves answer), struck and his death are the game's own.

import type { Sprite } from '../engine/px';
import type { ActorArt, AnimSet, Clip } from './actor_types';
import { hash, lazyFrames, toSprite } from './kit';
import type { Painted } from './kit';
import { ENEMY_RIM, FLAME } from './mkit';
import { TILE3, paintBits } from './new_mobs3';
import type { Bit, Put } from './new_mobs3';
import { stage } from './skin';
import type { GameView } from './skin';
import type { V3 } from './skeleton';
import {
  ANTLER, BONE, CLOD, FOG, K0, MOSS, PIVOT, ROOT, SPLINTER, STAG_AURA, STAG_FEET, STAND0, along, antlerTip, bump, burst, cl01, easeIn, easeOut, eyeOf, fog,
  fromKey, headFrame, keyed, laid, lin, makeStagArt, pawAt, plus, reared, shiver, sm, stagBits, swell, worldOf,
} from './hollow_stag';
import type { Key, StagPose } from './hollow_stag';
import { FR, TAU, f, smearAlong } from './action_f6_fx';

/** THE SWITCH, OFF. With it on, the bestiary's Hollow Stag is `makeStagActionArt()`, and the rules are the main chat's (the README). */
export const STAG_ACTION = { on: false };

const add = (a: V3, b: V3): V3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const sub = (a: V3, b: V3): V3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const lerpV = (a: V3, b: V3, s: number): V3 => [a[0] + (b[0] - a[0]) * s, a[1] + (b[1] - a[1]) * s, a[2] + (b[2] - a[2]) * s];
const T = TILE3;
type Chip = [V3, string, number];
/** Leaves, needles and earth of the pinewood's floor, thrown up as his hoofs land. */
export const LEAVES = ['#8c6a3a', '#a8803e', '#6a4c2a', '#4c6a34', '#5e7a40', '#3e3022', '#56432f', '#c49a52'];
const DUST = ['#9a8a70', '#b4a486', '#7e6e58'];

// =============================================================================================
// THE GORE BY MOVEMENT 9

/**
 * THE GORE'S NUMBERS (seconds from its start; tiles from his floor point):
 *   wind-up    head down, antlers cocked to his right, crouched back on his haunches by `low` (0.3 s); his right forefoot pawing
 *              (`paw`: lifted 0.3, struck down 0.5); HELD, trembling, snorting, from `held` to the strike (0.33 s)
 *   strike     TWO FRAMES, smeared: his forefeet thrown a stride forward (`lunge` tiles), his antlers hooked up and across to his
 *              left (frame 27, 0.9 s: the clip's `hit`)
 *   wind-down  his head flung up high, held, to 1.4 s; his forefeet stepped back; at rest by `long` (2.0 s)
 *   area       a SWEEP before him: from `near` to `reach` tiles, `arc` degrees across (old: a strip 2.17 tiles long, 0.9 to either side)
 */
export const GORE9_STRIKE = [f(25), f(27)] as const;
export const GORE9_HIT = f(27);
export const GORE9 = { low: f(9), paw: [f(9), f(12), f(15)] as const, held: f(15), hit: GORE9_HIT, strike: GORE9_STRIKE, long: f(60), lunge: 0.45, near: 0.3, reach: 3.0, arc: 150, knock: 1.4 } as const;
export const gore9Smeared = (t: number): boolean => t > GORE9_STRIKE[0] + 1e-6 && t <= GORE9_STRIKE[1] + FR + 1e-6;
const G_COCK = keyed({ x: -9, z: -6, yaw: -8, pitch: 8, roll: -3, neck: 78, hp: 58, hy: -24, hr: -10, ears: -34, glow: 2.0 });
const G_MID = keyed({ x: 5, z: -3.5, yaw: 0, pitch: 4, roll: 0, neck: 54, hp: 34, hy: -2, hr: -2, ears: -34, glow: 2.2 });
const G_HIT = keyed({ x: 14, z: -0.5, yaw: 9, pitch: -3, roll: 3, neck: 24, hp: 8, hy: 24, hr: 12, ears: -32, glow: 2.4 });
const G_FLUNG = keyed({ x: 13, z: 2.0, yaw: 12, pitch: -7, roll: 3, neck: 0, hp: -18, hy: 30, hr: 14, ears: -22, glow: 1.9 });
const G_HIGH = keyed({ x: 11, z: 1.6, yaw: 10, pitch: -6, roll: 2, neck: 2, hp: -14, hy: 24, hr: 10, ears: -20, glow: 1.7 });
const G_BACK = keyed({ x: 4, z: 0.6, yaw: 3, pitch: -2, neck: 4, hp: -4, hy: 8, hr: 3, ears: -10, glow: 1.4 });
/** How far his forefeet are thrown forward in the lunge (his own lengths). */
const LUNGE = GORE9.lunge * T;
function goreForefoot(t: number, i: 0 | 1): { foot: V3; fold: number } {
  const [s0, s1] = GORE9_STRIKE;
  const r = STAG_FEET[i];
  if (t <= s0) {
    if (i === 0) {
      const [a, b, c] = GORE9.paw;
      const p = pawAt(t, a, b, c, 11, 72);
      if (p) return p;
    }
    return { foot: r, fold: 0 };
  }
  if (t < s1 + 1e-6) {
    const k = (t - s0) / (s1 - s0);
    return { foot: [r[0] + LUNGE * k, r[1], k < 1 ? 9 * Math.sin(Math.PI * k) + 0.01 : 0], fold: k < 1 ? 75 * Math.sin(Math.PI * k) : 0 };
  }
  // (stepped back after, the far one a moment later)
  const late = i === 1 ? 0.12 : 0;
  const b0 = 1.42 + late;
  const b1 = 1.68 + late;
  if (t < b0) return { foot: [r[0] + LUNGE, r[1], 0], fold: 0 };
  if (t < b1) {
    const k = (t - b0) / (b1 - b0);
    return { foot: [r[0] + LUNGE * (1 - sm(k)), r[1], 7 * Math.sin(Math.PI * k) + 0.01], fold: 60 * Math.sin(Math.PI * k) };
  }
  return { foot: r, fold: 0 };
}
function goreBody(t: number): StagPose {
  const [s0, s1] = GORE9_STRIKE;
  let K = along(t, [
    [0, K0, lin],
    [GORE9.low, G_COCK, swell],
    [s0, G_COCK, sm],
    [f(26), G_MID, lin],
    [s1, G_HIT, lin],
    [s1 + 0.2, G_FLUNG, easeOut],
    [1.4, G_HIGH, sm],
    [1.75, G_BACK, sm],
    [GORE9.long, K0, sm],
  ]);
  // (the paw: he dips onto it as it strikes; then the hold, trembling)
  K = plus(K, { z: -1.2 * bump(t, GORE9.paw[2] - 0.04, GORE9.paw[2] + 0.12), pitch: 1.5 * bump(t, GORE9.paw[2] - 0.04, GORE9.paw[2] + 0.14) });
  if (t > GORE9.held && t < s0) K = plus(K, shiver(t, sm((t - GORE9.held) / 0.06), 0.9));
  const f0 = goreForefoot(t, 0);
  const f1 = goreForefoot(t, 1);
  const P = fromKey(K, [f0.foot, f1.foot, STAG_FEET[2], STAG_FEET[3]], [f0.fold, f1.fold, 0, 0]);
  P.tail = [40 * bump(t, 0.1, 1.6), 8 * Math.sin(t * 24) * bump(t, GORE9.held, s0)];
  return P;
}

// =============================================================================================
// THE CHARGE BY MOVEMENT 9

/**
 * THE CHARGE'S NUMBERS (seconds from its start; tiles):
 *   aim        where the hero stands at `aim`: THE LANE is marked from him, through where the hero stood, `lane` tiles long, `half` to
 *              either side of its middle (0.87 s before he bursts off)
 *   wind-up    head down, antlers low, crouched back by `lower`; his right forefoot pawing twice (`paws`, struck down 0.44 and 0.66 s);
 *              HELD, trembling, snorting, from `held` to the strike (0.31 s)
 *   strike     TWO FRAMES, smeared: he bursts off (frame 31: carried 1.1 tiles), away (frame 32, 1.067 s: the clip's `hit`; 2.3 on)
 *   the run    galloping down the lane at `pace` tiles a second (the game carries him: `charge9Carry(t)`), head low, antlers before him
 *   THE CRASH  at `crash` (carried `CHARGE9_CARRIED` tiles): his antlers smash into what is before him (the wall of roots at the
 *              clearing's edge: it splinters there, art/stag_action_fx.ts), held `freeze`
 *   wind-down  rocked back, shaking the splinters off his antlers, his feet stepped back under him; at rest by `long` (2.8 s)
 *   struck     a hero in the lane as he comes by (`half` to either side) is run down and thrown aside; at the crash, before his antlers
 */
export const CHARGE9_STRIKE = [f(30), f(32)] as const;
export const CHARGE9_HIT = f(32);
const RUN9 = 0.47;
export const CHARGE9 = { aim: 0.2, lower: 0.25, paws: [[0.28, 0.36, 0.44], [0.5, 0.58, 0.66]] as const, held: 0.69, hit: CHARGE9_HIT, strike: CHARGE9_STRIKE, launch: [1.1, 2.3] as const, pace: 12, run: RUN9, crash: CHARGE9_HIT + RUN9, freeze: 0.12, long: f(84), lane: 9.6, half: 0.9, knock: 1.8 } as const;
export const charge9Smeared = (t: number): boolean => t > CHARGE9_STRIKE[0] + 1e-6 && t <= CHARGE9_STRIKE[1] + FR + 1e-6;
/** How far the game has carried him down his lane, `t` seconds into the charge (tiles). */
export function charge9Carry(t: number): number {
  const [s0, s1] = CHARGE9_STRIKE;
  const [l0, l1] = CHARGE9.launch;
  if (t <= s0) return 0;
  if (t < s0 + FR) return l0 * ((t - s0) / FR);
  if (t < s1) return l0 + (l1 - l0) * ((t - s0 - FR) / FR);
  return l1 + CHARGE9.pace * Math.min(RUN9, t - s1);
}
/** How far he has gone when he crashes (tiles): 7.94. */
export const CHARGE9_CARRIED = charge9Carry(CHARGE9.crash + 1);
/** The seconds into the charge he has been carried `d` tiles. */
export function charge9At(d: number): number {
  if (d >= CHARGE9_CARRIED) return CHARGE9.crash;
  let lo = 0;
  let hi = CHARGE9.crash;
  for (let i = 0; i < 40; i++) {
    const m = (lo + hi) / 2;
    if (charge9Carry(m) < d) lo = m;
    else hi = m;
  }
  return hi;
}
// HIS GALLOP, painted to the way he is carried: each hoof down on its own spot of the floor while the floor goes by under him.
const STRIDE = 2.9 * T;
const SPAN = 0.24 * STRIDE;
const FIRST = CHARGE9.launch[1] * T;
const ORDER = [0, 0.1, 0.46, 0.56];
const plantAt = (i: number, k: number): number => FIRST + (k + ORDER[i]) * STRIDE;
function gallopFoot(i: number, c: number): { foot: V3; fold: number } {
  const r = STAG_FEET[i];
  const half = SPAN / 2;
  const fore = i < 2;
  const p0 = plantAt(i, 0);
  if (c < p0 - half) {
    // (bursting off: his forelegs flung forward, his hind legs thrust back, all four off the floor)
    const v = cl01(c / (p0 - half));
    const reach = fore ? 9 * Math.sin(Math.PI * v) : -16 * Math.sin(Math.PI * Math.min(1, v * 1.6));
    return { foot: [r[0] + half * sm(v) + reach, r[1], (fore ? 9 : 11) * Math.sin(Math.PI * v) + 0.01], fold: (fore ? 80 : 25) * Math.sin(Math.PI * v) };
  }
  const kf = (c - p0 + half) / STRIDE;
  const k = Math.floor(kf);
  const u = (kf - k) * STRIDE;
  if (u < SPAN) return { foot: [r[0] + (plantAt(i, k) - c), r[1], 0], fold: 0 };
  const v = (u - SPAN) / (STRIDE - SPAN);
  const reach = fore ? 8 * Math.sin(Math.PI * v) : -6 * Math.sin(Math.PI * v);
  return { foot: [r[0] - half + 2 * half * sm(v) + reach, r[1], (fore ? 15 : 11) * Math.sin(Math.PI * v) + 0.01], fold: (fore ? 88 : 36) * Math.sin(Math.PI * v) };
}
/** Where each hoof is as he crashes: held through the crash, then stepped back under him. */
const CRASHED = [0, 1, 2, 3].map((i) => gallopFoot(i, CHARGE9_CARRIED * T));
const SETTLE9 = ((): { from: V3; at: number }[] => {
  let j = 0;
  // (on the charge's own clock: the crash's freeze taken out)
  const e = CHARGE9.crash;
  return CRASHED.map((s, i) => {
    const up = s.foot[2] > 0.05;
    const off = Math.abs(s.foot[0] - STAG_FEET[i][0]) > 1.5;
    return { from: s.foot, at: up ? e : off ? e + 0.12 + 0.16 * j++ : -1 };
  });
})();
const C_LOW = keyed({ x: -8, z: -5.5, pitch: 7, neck: 66, hp: 52, hy: -3, ears: -40, glow: 2.0 });
const C_FLY = keyed({ x: 4, z: 5, pitch: -3, neck: 54, hp: 44, ears: -44, glow: 2.2 });
const C_RUN = keyed({ x: 2, z: -1, pitch: 4, neck: 58, hp: 48, ears: -44, glow: 2.2 });
const C_SMASH = keyed({ x: 6, z: -3.5, pitch: 9, neck: 68, hp: 56, ears: -44, glow: 2.5 });
const C_RECOIL = keyed({ x: -5, z: 1.5, pitch: -5, neck: 12, hp: 2, ears: -14, glow: 1.6 });
/** The charge's own clock: stopped through the crash's freeze, running on after it from where it stopped. */
const crashClock = (t: number): number => (t < CHARGE9.crash ? t : t < CHARGE9.crash + CHARGE9.freeze ? CHARGE9.crash : t - CHARGE9.freeze);
function chargeBody(t0: number): StagPose {
  const t = crashClock(t0);
  const [s0, s1] = CHARGE9_STRIKE;
  const E = CHARGE9.crash;
  const F = CHARGE9.freeze;
  let K = along(t, [
    [0, K0, lin],
    [CHARGE9.lower, C_LOW, swell],
    [s0, C_LOW, sm],
    [f(31), C_FLY, lin],
    [s1, C_RUN, lin],
    [E - 0.04, C_RUN, sm],
    [E, C_SMASH, easeIn],
    [E + 0.2, C_RECOIL, easeOut],
    [2.3 - F, C_RECOIL, sm],
    [CHARGE9.long - F, K0, swell],
  ]);
  const c = charge9Carry(t) * T;
  if (t > s1 && t < E - 0.04) {
    // (the gallop's rocking, by how far he has gone)
    const ph = TAU * ((c - FIRST) / STRIDE);
    const on = sm((t - s1) / 0.08);
    K = plus(K, { z: 2.6 * Math.cos(ph) * on, pitch: 5 * Math.sin(ph) * on, neck: -3 * Math.cos(ph) * on, hp: 2.5 * Math.sin(ph + 0.5) * on });
  }
  // (his paws: he dips onto each; then held, trembling)
  for (const [, , c0] of CHARGE9.paws) K = plus(K, { z: -1.1 * bump(t, c0 - 0.03, c0 + 0.12), hy: 2.5 * bump(t, c0 - 0.02, c0 + 0.14) });
  if (t > CHARGE9.held && t < s0) K = plus(K, shiver(t, sm((t - CHARGE9.held) / 0.05), 0.8));
  // (shaking the splinters off his antlers)
  const shake = bump(t, E + 0.25, E + 0.8);
  K = plus(K, { hy: 13 * Math.sin((t - E) * 28) * shake, hr: 7 * Math.sin((t - E) * 28 + 0.6) * shake });
  const feet: V3[] = [];
  const fold: number[] = [];
  for (let i = 0; i < 4; i++) {
    let ft: V3 = STAG_FEET[i];
    let fd = 0;
    if (i === 0 && t < s0) {
      for (const [a, b, cc] of CHARGE9.paws) {
        const p = pawAt(t, a, b, cc, 10, 70);
        if (p) {
          ft = p.foot;
          fd = p.fold;
        }
      }
    } else if (t > s0 && t <= E + 1e-9) {
      const g = gallopFoot(i, c);
      ft = g.foot;
      fd = g.fold;
    } else if (t > E) {
      const S = SETTLE9[i];
      ft = S.at < 0 ? CRASHED[i].foot : S.from;
      fd = S.at < 0 ? 0 : CRASHED[i].fold;
      if (S.at >= 0 && t > S.at) {
        const k = cl01((t - S.at) / 0.22);
        const h = S.from[2] > 0.05 ? S.from[2] * (1 - k) : 0;
        ft = [S.from[0] + (STAG_FEET[i][0] - S.from[0]) * sm(k), STAG_FEET[i][1], k < 1 ? h + 6 * Math.sin(Math.PI * k) + 0.01 : 0];
        fd = (i < 2 ? 55 : 25) * Math.sin(Math.PI * k) + (1 - k) * (S.from[2] > 0.05 ? CRASHED[i].fold : 0);
      }
    }
    feet.push(ft);
    fold.push(fd);
  }
  const P = fromKey(K, feet, fold);
  P.tail = t > s0 && t < E ? [50, 10 * Math.sin(t * 22)] : [36 * bump(t, 0.1, 1.1) + 30 * bump(t, E, CHARGE9.long - F), 0];
  return P;
}

// =============================================================================================
// THE WOOD CLOSES IN: the held bellow, reared; crashed down, and the wall bursts up round the new edge

/**
 * ITS NUMBERS (seconds from its start; tiles):
 *   wind-up    he draws in his breath, his ribs swelling, by `breath`; rears up on his hind legs, his head thrown up, his jaw open,
 *              BELLOWING from `roar` (rings of fog rolling from his mouth); HELD, reared, trembling, his forelegs pawing the air, to
 *              the strike (0.63 s). The new edge is marked on the floor from the move's start (`mark`: 1.4 s before it rises)
 *   strike     TWO FRAMES, smeared: he crashes down onto his forefeet, his head flung down (frame 42, 1.4 s: the clip's `hit`):
 *              THE WALL BURSTS UP round the whole new edge, each clump within `rise` of the blow
 *   wind-down  glaring, heaving, the fog pouring out of his ribs over the ground, by `long` (3.0 s)
 *   the clearing  an ellipse; at 3/4, 1/2 and 1/4 of his life (`at`) its edge moves in to `stages` of the arena across
 *              (17 by 20 tiles: 13.6 by 16, 10.2 by 12, 6.8 by 8), and stays
 *   the wall   `band` to either side of the new edge, `high` of his lengths (the knight is 58): whoever is in it or outside it as it
 *              rises is struck and thrown in, to `throwIn` tiles inside the new edge
 */
export const CLOSE_STRIKE = [f(40), f(42)] as const;
export const CLOSE_HIT = f(42);
export const CLOSE = { breath: 0.35, roar: 0.55, rear: 0.7, hit: CLOSE_HIT, strike: CLOSE_STRIKE, long: f(90), mark: 0, rise: 0.3, at: [0.75, 0.5, 0.25] as const, stages: [1, 0.8, 0.6, 0.4] as const, band: 0.5, high: 76, throwIn: 1.0, knock: 2.0 } as const;
export const closeSmeared = (t: number): boolean => t > CLOSE_STRIKE[0] + 1e-6 && t <= CLOSE_STRIKE[1] + FR + 1e-6;
const W_IN = keyed({ z: 1, pitch: -2, neck: 8, hp: 16, ears: -12, glow: 1.6, breath: 2.4 });
const W_UP = keyed({ z: 0.5, neck: -16, hp: -40, hy: 3, ears: -38, glow: 2.2, jaw: 1, breath: 1.2 });
const W_SLAM = keyed({ z: -3.5, pitch: 3, neck: 22, hp: 18, hy: -2, ears: -40, glow: 2.5, jaw: 0.85, breath: -1.6 });
const W_DIP = keyed({ z: -5, pitch: 5, neck: 42, hp: 36, hy: -3, ears: -36, glow: 2.3, jaw: 0.5, breath: -1.8 });
const W_GLARE = keyed({ z: -1, pitch: 1, neck: 16, hp: 14, ears: -24, glow: 1.9, jaw: 0, breath: -1 });
/** How far he is reared (degrees about his hind hips). */
function closeRear(t: number): number {
  const [s0, s1] = CLOSE_STRIKE;
  const TOP = 42;
  if (t < CLOSE.breath) return 0;
  if (t < CLOSE.rear) return TOP * swell((t - CLOSE.breath) / (CLOSE.rear - CLOSE.breath));
  if (t <= s0) return TOP + 1.5 * Math.sin((t - CLOSE.rear) * 18);
  if (t < s1) return (TOP + 1.5 * Math.sin((s0 - CLOSE.rear) * 18)) * 0.42;
  return 0;
}
function closeBody(t: number): StagPose {
  const [s0, s1] = CLOSE_STRIKE;
  let K = along(t, [
    [0, K0, lin],
    [CLOSE.breath, W_IN, sm],
    [CLOSE.rear, W_UP, swell],
    [s0, W_UP, sm],
    [f(41), plus(W_UP, { z: -3, neck: 6, hp: -10 }), lin],
    [s1, W_SLAM, lin],
    [s1 + 0.2, W_DIP, easeOut],
    [2.0, W_GLARE, sm],
    [2.4, W_GLARE, lin],
    [CLOSE.long, K0, sm],
  ]);
  if (t > CLOSE.rear && t < s0) K = plus(plus(K, shiver(t, sm((t - CLOSE.rear) / 0.08), 1.2)), { roll: 0.8 * Math.sin(t * 70) * sm((t - CLOSE.rear) / 0.1) });
  K = plus(K, { breath: 1.4 * Math.sin(t * 14) * bump(t, s1 + 0.2, 2.6) });
  K = reared(K, closeRear(t));
  const P = fromKey(K);
  // his forefeet: lifted off their spots as he rears, hanging folded and pawing the air, crashed down onto the spots they left
  for (const i of [0, 1]) {
    const F0 = STAG_FEET[i];
    if (t <= CLOSE.breath + 0.02 || t >= s1) continue;
    const paddle = Math.sin((t - CLOSE.rear) * 20 + i * 2.4) * bump(t, CLOSE.rear - 0.08, s0 + 0.02);
    const hang = worldOf(P, [24 + 3 * paddle, F0[1], 16 + 3 * paddle]);
    const lifted = sm((t - CLOSE.breath - 0.02) / 0.22);
    const down = t <= s0 ? 0 : (t - s0) / (s1 - s0);
    const air = lerpV(lerpV(F0, hang, lifted), F0, down);
    P.feet[i] = [air[0], air[1], Math.max(air[2], 0.01 * (1 - down))];
    P.fold[i] = (95 + 18 * paddle) * lifted * (1 - down);
  }
  P.tail = [42 * bump(t, 0.2, 2.2), 0];
  return P;
}

// =============================================================================================
// HE BOUNDS ROUND THE ARENA: the great stot (his walk), and standing to stare

/**
 * THE GREAT STOT (his walk; seconds; tiles): a round of two bounds, `bound` seconds each; in each, all four hoofs come down together
 * and stay down `down` (the floor going by under them, so that they stay on their spots), sinking onto his stiff legs and
 * springing off; in the air, `high` of his lengths up at the top, his legs stiff and straight under him, his back arched, his head
 * high. As he lands he JINKS: his body twisted `jink` degrees one way (the first bound) and the other (the second), his head
 * whipped the other way, shoved aside; leaves, needles and earth thrown up round his hoofs. The game carries him `pace` tiles a
 * second (old: 3, bounds of 1.1 tiles 16 high); `bound * pace` tiles a bound (3.3). Where he bounds is the game's (the README: his
 * way round the arena), turning as he lands.
 */
export const STOT9 = { pace: 5.5, bound: 0.6, down: 0.13, high: 46, jink: 16, period: 1.2, fps: 30 } as const;
/** His lengths a bound, and the landing's half length (his hoofs come down `S` before where they stand at rest, and leave `S` behind it). */
const S_LAND = (STOT9.pace * T * STOT9.down) / 2;
/** The great stot `t` seconds into a round (the game carrying him on at its pace): the round begins in the middle of a landing, his hoofs under him. */
export function stot9Pose(t: number): StagPose {
  return stotAt(t + STOT9.down / 2);
}
/** The great stot `tau` seconds from a landing (his hoofs coming down at 0 and at `bound`). */
export function stotAt(t0: number): StagPose {
  const P0 = STOT9.period;
  const tt = ((t0 % P0) + P0) % P0;
  const B = STOT9.bound;
  const dn = STOT9.down;
  const bound = tt < B ? 0 : 1;
  const l = bound * B;
  const V = STOT9.pace * T;
  const sgn = bound ? 1 : -1;
  let lift = 0;
  let fwd: number;
  let squash = 0;
  let v = 0;
  const landed = tt < l + dn;
  if (landed) {
    const c = (tt - l) / dn;
    fwd = S_LAND - V * (tt - l);
    squash = Math.sin(Math.PI * c);
  } else {
    v = (tt - l - dn) / (B - dn);
    lift = STOT9.high * 4 * v * (1 - v);
    fwd = -S_LAND + 2 * S_LAND * sm(v);
  }
  const air = landed ? 0 : Math.sin(Math.PI * v);
  // (the jink: snapped round as he lands, held through the spring, eased off by the top of the bound)
  const since = landed ? (tt - l) / dn : 1 + v;
  const jinkK = landed ? Math.sin((Math.PI / 2) * since) ** 3 : Math.max(0, 1 - sm(v / 0.6));
  const feet = STAG_FEET.map((f0, i): V3 => [f0[0] + fwd + (i < 2 ? 2 : -2) * air, f0[1], lift]);
  const fold = [5 * air, 5 * air, 3 * air, 3 * air];
  const rock = landed ? -3 + 7 * (1 - sm((tt - l) / dn)) : -3 + 7 * sm(v);
  const ph = (TAU * tt) / P0;
  return {
    ...STAND0,
    x: 0,
    y: sgn * 3.5 * jinkK,
    z: lift - 4 * squash,
    yaw: sgn * STOT9.jink * jinkK,
    pitch: rock * 0.9 + 1 * squash,
    roll: -sgn * 5 * jinkK,
    neck: -8 + 9 * squash,
    head: [-sgn * 11 * jinkK, -8 + 8 * squash + 3 * air, -sgn * 5 * jinkK],
    ears: -18,
    tail: [55, 10 * Math.sin(ph * 2)],
    feet,
    fold,
    breath: Math.sin(ph),
    look: [0, 0],
    lid: 0,
    glow: 1.5 + 0.2 * squash,
    chips: [],
    flares: [],
  };
}
/** How far the game has carried him `t` seconds into his stot (tiles). */
export const stot9Carry = (t: number): number => STOT9.pace * t;
/**
 * STANDING TO STARE (`stare`; seconds): it begins as a bound lands (his walk's landing, the game stopping him): a HEAVY LANDING, his
 * body run on over his planted hoofs as he stops (`stareCarry`: the game carries him the landing's last `S_LAND`), sinking deep,
 * leaves and earth thrown and a ring of dust out to `knock` tiles (whoever is in it is knocked: the rules'); then he rises and
 * stands stiff, his head high, his ears pricked, his eye flaring, STARING, still but for his breath, from `still`; he stamps his
 * right forefoot (`stamp`) and snorts (`snort`); and he is ready to bound again by `long`.
 */
export const STARE = { deep: 0.1, up: 0.45, still: 0.5, stamp: [0.95, 1.05, 1.16] as const, snort: 1.24, long: 1.8, knock: 1.2 } as const;
export const stareCarry = (t: number): number => {
  const k = cl01(t / STOT9.down);
  return (S_LAND * (1 - (1 - k) * (1 - k))) / T;
};
const S_DEEP = keyed({ z: -9, pitch: 4, neck: 6, hp: 6, ears: -24, glow: 1.9 });
const S_TALL = keyed({ z: 1.2, pitch: -2, neck: -24, hp: -14, hy: 6, hr: 4, ears: 12, glow: 2.4 });
const S_HOLD = keyed({ z: 1.0, pitch: -2, neck: -23, hp: -13, hy: 7, hr: 4, ears: 14, glow: 2.3 });
export function starePose(t: number): StagPose {
  const L = stotAt(0);
  const K1: Key = { x: 0, y: L.y, z: L.z, yaw: L.yaw, pitch: L.pitch, roll: L.roll, neck: L.neck, hy: L.head[0], hp: L.head[1], hr: L.head[2], ears: L.ears, glow: L.glow, jaw: 0, breath: L.breath };
  let K = along(t, [
    [0, K1, lin],
    [STARE.deep, S_DEEP, easeOut],
    [STARE.up, S_TALL, swell],
    [STARE.still, S_HOLD, sm],
    [1.3, S_HOLD, lin],
    [STARE.long, K0, swell],
  ]);
  K = plus(K, { z: -0.9 * bump(t, STARE.stamp[2] - 0.03, STARE.stamp[2] + 0.12), breath: 0.8 * Math.sin(t * 9) });
  // (his hoofs where they came down, the floor stopping under them as the game stops him)
  const c = stareCarry(t) * T;
  const feet = STAG_FEET.map((f0): V3 => [f0[0] + S_LAND - c, f0[1], 0]);
  const p = pawAt(t, STARE.stamp[0], STARE.stamp[1], STARE.stamp[2], 9, 66);
  if (p) feet[0] = [p.foot[0], p.foot[1], p.foot[2]];
  const P = fromKey(K, feet, [p ? p.fold : 0, 0, 0, 0]);
  P.tail = [55 * (1 - sm((t - 0.3) / 0.6)) + 20 * bump(t, 1.2, 1.7), 0];
  P.look = [0, 0];
  return P;
}

// =============================================================================================
// WHAT HANGS FROM HIM, WHAT FLIES OFF HIM

/** A pose with what hangs from it swung by how it has been moving a tenth of a second before (and how far the game has carried him then). */
function withDrag(base: (t: number) => StagPose, carry: (t: number) => number, t: number, clock: (t: number) => number = (x) => x): StagPose {
  const P = base(t);
  const tb = clock(t) - 0.1;
  const before = base(tb);
  const dc = (carry(clock(t)) - carry(tb)) * T;
  const a = worldOf(P, [0, 0, 40]);
  const b = worldOf(before, [0, 0, 40]);
  const w = Math.min(14, dc * 0.25);
  P.drag = [a[0] - b[0] + w, a[1] - b[1], a[2] - b[2]];
  const ha = headFrame(P).at;
  const hb = headFrame(before).at;
  P.dragHead = [ha[0] - hb[0] + w, ha[1] - hb[1], ha[2] - hb[2]];
  return P;
}
const none = (): number => 0;
const nose = (P: StagPose): [V3, V3] => {
  const H = headFrame(P);
  return [H.p([19.5, 1.2, -1.2]), H.p([19.5, -1.2, -1.2])];
};
const snortOf = (P: StagPose, at: number, t: number, seed: number, life = 0.4): Chip[] => {
  const H = headFrame(P);
  return fog(nose(P), [H.f[0], H.f[1], H.f[2] - 0.5], at, t, seed, life);
};
/** A ring of dust going out over the floor from `c`, `r` tiles at its widest. */
function dustRing(c: V3, t0: number, t: number, r: number, n: number, seed: number, life = 0.5): Chip[] {
  const k = (t - t0) / life;
  if (k < 0 || k >= 1) return [];
  const out: Chip[] = [];
  for (let i = 0; i < n; i++) {
    if (hash(i, 5, seed) < k * 0.9) continue;
    const a = (i / n) * TAU;
    const rr = 10 + (r * T - 10) * easeOut(k);
    out.push([[c[0] + Math.cos(a) * rr, c[1] + Math.sin(a) * rr * 0.9, 1 + 3 * hash(i, 6, seed)], DUST[i % 3], i % 4 === 0 ? 3 : 2]);
  }
  return out;
}
/** THE GORE: his pose, the earth his antlers rake and fling, his snort. */
export function gore9Pose(t: number): StagPose {
  const P = withDrag(goreBody, none, t);
  const [, s1] = GORE9_STRIKE;
  const chips: Chip[] = [...snortOf(P, GORE9.paw[2] + 0.04, t, 401, 0.45), ...burst([STAG_FEET[0][0] + 1, STAG_FEET[0][1], 0.6], GORE9.paw[2], t, 10, 403, CLOD, { speed: 22, up: 28, life: 0.35 })];
  // (the earth raked up along the sweep, flung out over the arc before him, out to its reach)
  for (let i = 0; i < 9; i++) {
    const a = ((-GORE9.arc / 2 + (GORE9.arc * i) / 8) * Math.PI) / 180;
    const r = 1.6 * T;
    chips.push(...burst([STAG_FEET[0][0] + Math.cos(a) * r * 0.6, Math.sin(a) * r * 0.6, 0.6], s1 - FR * (1 - i / 8), t, 7, 405 + i, [...CLOD, '#6a5a3a', '#4c6a34'], { speed: 46, up: 40, ahead: [Math.cos(a) * 1.1, Math.sin(a) * 1.1, 0], life: 0.55, size: 3 }));
  }
  chips.push(...burst([STAG_FEET[0][0] + LUNGE, 0, 0.6], s1, t, 14, 415, CLOD, { speed: 28, up: 22, life: 0.32 }));
  chips.push(...dustRing([STAG_FEET[0][0] + LUNGE, 0, 0], s1, t, 1.0, 30, 417, 0.45));
  // (moss torn off his antlers by the throw)
  chips.push(...burst(antlerTip(P, 1), s1 + 0.1, t, 10, 419, [MOSS[3], MOSS[2], MOSS[4]], { speed: 24, up: 32, ahead: [-0.6, 0, 0], life: 0.45 }));
  P.chips = chips;
  P.flares = t > GORE9.held - 0.1 && t < s1 + 0.2 ? [[headFrame(P).p([4, 0, 2]), 18, 0.32 * cl01((t - GORE9.held + 0.1) / 0.15)]] : [];
  if (t >= s1 && t < s1 + 0.12) P.flares.push([lerpV(antlerTip(P, 1), antlerTip(P, -1), 0.5), 34, 0.55 * (1 - (t - s1) / 0.12)]);
  return P;
}
/** THE CHARGE: his pose, the earth he tears up, the crash. */
export function charge9Pose(t: number): StagPose {
  const P = withDrag(chargeBody, charge9Carry, t, crashClock);
  const tc = crashClock(t);
  const c = charge9Carry(tc) * T;
  const chips: Chip[] = [];
  for (const [j, [, , s]] of CHARGE9.paws.entries()) chips.push(...burst([STAG_FEET[0][0] + 2, STAG_FEET[0][1], 0.6], s, t, 12, 431 + j, CLOD, { speed: 24, up: 30, ahead: [-0.5, 0, 0], life: 0.34 }));
  chips.push(...snortOf(P, CHARGE9.held - 0.02, t, 433, 0.4));
  // (bursting off: earth flung back off his hind feet; it stays where it was thrown, he gone on from it)
  for (const [j, s] of [[2, 435], [3, 436]] as const) {
    for (const ch of burst([STAG_FEET[j][0] - 3, STAG_FEET[j][1], 0.6], CHARGE9_STRIKE[0], t, 16, s, CLOD, { speed: 46, up: 34, ahead: [-1.3, 0, 0], life: 0.4, size: 3 })) {
      const p: V3 = [ch[0][0] - c, ch[0][1], ch[0][2]];
      if (p[0] > -140) chips.push([p, ch[1], ch[2]]);
    }
  }
  // (galloping: earth and needles off each hoof as it comes down, left where it was)
  if (t > CHARGE9_STRIKE[1] && t < CHARGE9.crash + 0.35) {
    for (let i = 0; i < 4; i++) {
      for (let k = 0; k < 4; k++) {
        const down = plantAt(i, k) - SPAN / 2;
        if (down > Math.min(c, CHARGE9_CARRIED * T)) continue;
        const t0 = charge9At(down / T);
        const spot = STAG_FEET[i][0] + SPAN / 2 + down - c;
        if (spot < -140) continue;
        for (const ch of burst([0, STAG_FEET[i][1], 0.6], t0, tc, 5, 441 + i * 7 + k, LEAVES, { speed: 18, up: 16, ahead: [-0.6, 0, 0], life: 0.24, size: 2 })) chips.push([[ch[0][0] + spot, ch[0][1], ch[0][2]], ch[1], ch[2]]);
      }
    }
  }
  // (THE CRASH: splinters of the wall's trunks and roots burst from before his antlers, held with the blow, then flying)
  const E = CHARGE9.crash;
  const s = t < E ? -1 : t < E + CHARGE9.freeze ? 0.02 : t - E - CHARGE9.freeze + 0.02;
  if (s >= 0) {
    const hitAt: V3 = [62, 0, 48];
    const WOOD = [...SPLINTER, ROOT[3], ROOT[2], ROOT[4], BONE[3]];
    chips.push(...burst(hitAt, 0, s, 80, 451, WOOD, { speed: 86, up: 58, ahead: [0.6, 0, 0], life: 0.8, spread: 1.2, size: 3 }), ...burst([64, 0, 26], 0, s, 34, 452, WOOD, { speed: 54, up: 30, ahead: [0.4, 0, 0], life: 0.7, size: 4 }));
    chips.push(...dustRing([28, 0, 0], E, t < E + CHARGE9.freeze ? E + 0.02 : t - CHARGE9.freeze + 0.02, 1.2, 30, 453, 0.5));
  }
  if (t >= E && t < E + CHARGE9.freeze + 0.06) P.flares.push([[60, 0, 46], 40, 0.6]);
  // (the splinters shaken off his antlers as he tosses his head)
  chips.push(...burst(antlerTip(P, -1), E + 0.45, t, 8, 455, SPLINTER, { speed: 24, up: 26, life: 0.4, size: 2 }), ...burst(antlerTip(P, 1), E + 0.55, t, 8, 456, SPLINTER, { speed: 24, up: 26, life: 0.38, size: 2 }));
  P.chips = chips;
  if (t > CHARGE9.lower && t < E) P.flares.push([headFrame(P).p([4, 0, 2]), 18, 0.32 * cl01((t - CHARGE9.lower) / 0.15)]);
  return P;
}
/** THE WOOD CLOSES IN: his pose, his bellow's fog, the earth his forefeet burst. */
export function closePose(t: number): StagPose {
  const P = withDrag(closeBody, none, t);
  const [, s1] = CLOSE_STRIKE;
  const chips: Chip[] = [];
  const H = headFrame(P);
  // (his bellow: rings of fog rolling from his mouth, one every fifth of a second from the roar to the slam, and a last great one with it)
  const mouth = H.p([17, 0, -2.5]);
  const up: V3 = [H.u[0], H.u[1], H.u[2]];
  const rings: number[] = [];
  for (let r0 = CLOSE.roar; r0 < s1 - 0.1; r0 += 0.2) rings.push(r0);
  for (const [j, t0] of rings.entries()) {
    const s = t - t0;
    const big = t0 === s1;
    const life = big ? 0.8 : 0.55;
    if (s < 0 || s >= life) continue;
    const k = s / life;
    const P0 = closeBody(t0);
    const H0 = headFrame(P0);
    const m0 = H0.p([17, 0, -2.5]);
    const r = (big ? 8 : 5) + (big ? 40 : 24) * easeOut(k);
    const c = add(m0, [H0.f[0] * (8 + (big ? 56 : 36) * easeOut(k)), H0.f[1] * (8 + (big ? 56 : 36) * easeOut(k)), H0.f[2] * (8 + (big ? 56 : 36) * easeOut(k))]);
    const n = Math.round((big ? 44 : 30) * (1 - 0.4 * k));
    for (let i = 0; i < n; i++) {
      const a = (i / n) * TAU + j;
      chips.push([[c[0] + H0.l[0] * Math.cos(a) * r + H0.u[0] * Math.sin(a) * r, c[1] + H0.l[1] * Math.cos(a) * r + H0.u[1] * Math.sin(a) * r, Math.max(0.6, c[2] + H0.l[2] * Math.cos(a) * r + H0.u[2] * Math.sin(a) * r)], FOG[k < 0.4 ? 0 : 1], k < 0.3 ? 3 : 2]);
    }
  }
  void mouth;
  void up;
  // (the fog pouring out over the ground round him after the slam, rolling out, thinning)
  const s = t - s1;
  if (s >= 0 && t < CLOSE.long - 0.04) {
    const k = cl01(s / (CLOSE.long - 0.04 - s1));
    for (let i = 0; i < 150; i++) {
      if (hash(i, 7, 461) < k * 1.05 - 0.1) continue;
      const a = hash(i, 1, 461) * TAU;
      const r = 14 + 80 * easeOut(cl01(s / 1.0)) * (0.35 + 0.65 * hash(i, 2, 461));
      chips.push([[-3 + Math.cos(a) * r * 1.2, Math.sin(a) * r, 1 + 7 * hash(i, 3, 461) * (1 - 0.5 * k)], FOG[Math.min(2, Math.floor(k * 2.2 + hash(i, 4, 461)))], k < 0.5 && i % 3 === 0 ? 4 : 3]);
    }
  }
  // (the earth bursting under his forefeet as they crash down; a ring of dust)
  chips.push(...burst(STAG_FEET[0], s1, t, 20, 463, CLOD, { speed: 38, up: 46, life: 0.55 }), ...burst(STAG_FEET[1], s1, t, 20, 464, CLOD, { speed: 38, up: 46, life: 0.55 }));
  chips.push(...dustRing([19, 0, 0], s1, t, 1.5, 40, 465, 0.6));
  P.chips = chips;
  P.flares = t > CLOSE.roar && t < s1 + 0.3 ? [[H.p([8, 0, 0]), 22, 0.35 * cl01((t - CLOSE.roar) / 0.2)]] : [];
  if (t >= s1 && t < s1 + 0.1) P.flares.push([[20, 0, 6], 40, 0.5]);
  return P;
}
/** THE GREAT STOT: his pose, and the leaves and earth thrown up round his hoofs at each landing (left where they were thrown). */
export function bound9Pose(t: number): StagPose {
  const P = withDrag(stot9Pose, stot9Carry, t);
  const P0 = STOT9.period;
  const tt = (((t + STOT9.down / 2) % P0) + P0) % P0;
  const chips: Chip[] = [];
  // (the landings of this round and the last: what flies stays on the floor where it was thrown, he carried on from it)
  for (const l of [-STOT9.bound, 0, STOT9.bound]) {
    const s = tt - l;
    if (s < 0 || s >= 0.4) continue;
    const back = STOT9.pace * T * s;
    STAG_FEET.forEach((f0, i) => {
      for (const ch of burst([f0[0] + S_LAND, f0[1], 0.6], 0, s, 13, 471 + i * 7 + Math.round(l * 10), LEAVES, { speed: 44, up: 40, life: 0.4, size: 3 })) chips.push([[ch[0][0] - back, ch[0][1], ch[0][2]], ch[1], ch[2]]);
    });
  }
  P.chips = chips;
  return P;
}
/** STANDING TO STARE: the heavy landing's leaves, earth and ring of dust; his snort. */
export function stare9Pose(t: number): StagPose {
  const P = withDrag(starePose, stareCarry, t);
  const c = stareCarry(t) * T;
  const chips: Chip[] = [];
  STAG_FEET.forEach((f0, i) => {
    for (const ch of burst([f0[0] + S_LAND, f0[1], 0.6], 0, t, 12, 481 + i * 5, LEAVES, { speed: 40, up: 36, life: 0.45, size: i % 2 ? 2 : 3 })) chips.push([[ch[0][0] - c, ch[0][1], ch[0][2]], ch[1], ch[2]]);
  });
  chips.push(...dustRing([-4 - c + S_LAND, 0, 0], 0.02, t, STARE.knock, 44, 483, 0.5));
  chips.push(...burst([STAG_FEET[0][0], STAG_FEET[0][1], 0.6], STARE.stamp[2], t, 10, 485, CLOD, { speed: 22, up: 26, life: 0.32 }));
  chips.push(...snortOf(P, STARE.snort, t, 487, 0.45));
  P.chips = chips;
  P.flares = t > 0.3 && t < 1.5 ? [[headFrame(P).p([4, 0, 2]), 20, 0.4 * bump(t, 0.3, 1.5)]] : [];
  return P;
}

// =============================================================================================
// THE STRIKES' SMEAR, AND HIS PICTURES

/** His new moves. */
export type Move9 = 'attack' | 'charge' | 'close' | 'walk' | 'stare';
export const MOVES9: readonly Move9[] = ['attack', 'charge', 'close', 'walk', 'stare'];
export function pose9(which: Move9, t: number): StagPose {
  if (which === 'attack') return gore9Pose(t);
  if (which === 'charge') return charge9Pose(t);
  if (which === 'close') return closePose(t);
  if (which === 'walk') return bound9Pose(t);
  return stare9Pose(t);
}
/** Each move's own body (before what flies off it), the way the game carries it, and its strike. */
const BODY: Record<Move9, (t: number) => StagPose> = { attack: goreBody, charge: chargeBody, close: closeBody, walk: stot9Pose, stare: starePose };
const CARRY: Record<Move9, (t: number) => number> = { attack: none, charge: charge9Carry, close: none, walk: stot9Carry, stare: stareCarry };
export const STRIKES9: Partial<Record<Move9, readonly [number, number]>> = { attack: GORE9_STRIKE, charge: CHARGE9_STRIKE, close: CLOSE_STRIKE };
export const smeared9 = (which: Move9, t: number): boolean => (which === 'attack' ? gore9Smeared(t) : which === 'charge' ? charge9Smeared(t) : which === 'close' ? closeSmeared(t) : false);
/** The muzzle (the end his bellow is flung with). */
export const muzzleOf = (P: StagPose): V3 => headFrame(P).p([17, 0, -2.5]);
/** Between his antlers' tips (the end he gores and charges with). */
export const antlersOf = (P: StagPose): V3 => lerpV(antlerTip(P, 1), antlerTip(P, -1), 0.5);
/** The smear of a strike: after-images of his antlers (or his muzzle and forefeet, crashing down), along the way they came; and running, of his body. */
function smear9(st: ReturnType<typeof stage>, put: Put, which: Move9, t: number): void {
  const s = STRIKES9[which];
  if (!s) return;
  const hit = s[1];
  const on = smeared9(which, t);
  const running = which === 'charge' && t > CHARGE9_HIT + FR && t < CHARGE9.crash - 0.02;
  if (!on && !running) return;
  const thin = Math.abs(t - hit - FR) < 1e-6 || running;
  const back = running ? FR * 0.8 : FR * 1.5;
  const body = BODY[which];
  const carry = CARRY[which];
  const pts: ((P: StagPose) => V3)[] =
    which === 'close'
      ? [muzzleOf, (P) => headFrame(P).q([1.5 + 5, 2.6 + 40, 5.4 + 61]), (P) => headFrame(P).q([1.5 + 5, -2.6 - 40, 5.4 + 61]), (P) => P.feet[0], (P) => P.feet[1]]
      : [(P) => antlerTip(P, 1), (P) => antlerTip(P, -1), (P) => headFrame(P).p([8, 0, 0])];
  if (which === 'charge') pts.push((P) => worldOf(P, [20, 0, 66]), (P) => worldOf(P, [-6, 0, 64]), (P) => worldOf(P, [-30, 0, 60]), (P) => worldOf(P, [8, 0, 36]));
  const now = carry(t);
  const lines: V3[][] = pts.map(() => []);
  for (let i = 0; i <= 8; i++) {
    const u = Math.min(t, running ? t : hit) - (back * i) / 8;
    const P = body(u);
    const dx = (carry(u) - now) * T;
    pts.forEach((pt, j) => {
      const p = pt(P);
      lines[j].push([p[0] + dx, p[1], p[2]]);
    });
  }
  smearAlong(st, put, lines, thin, [ANTLER[1], ANTLER[2], ANTLER[3], '#fff0d8'], FLAME[2]);
}
/** His canvas for these: room for his lunge, his antlers reared high, his smear, and what his crash and his landings throw. */
export const STAG9_CANVAS = { w: 520, h: 440, ax: 250, ay: 336 } as const;
/** One frame of one of his new moves, from in front or behind. */
export function stag9Painted(which: Move9, t: number, view: GameView = 'front'): Painted {
  eyeOf(view);
  const P = pose9(which, t);
  const C = STAG9_CANVAS;
  const st = stage(view, C.ax, C.ay, C);
  const bits: Bit[] = [];
  const put: Put = (part, piece, shape) => {
    bits.push({ part, piece, shape });
  };
  stagBits(P, put, view);
  smear9(st, put, which, t);
  const lights = paintBits(st, bits, worldOf(P, PIVOT));
  for (const [p, r, a] of P.flares) {
    const [x, y] = st.at(p);
    lights.push({ x, y, r, color: FLAME[3], a });
  }
  const px = st.whole(ENEMY_RIM);
  for (const [pt, col, size] of P.chips) laid(px, st, pt, col, size);
  return { px, lights };
}
const frame9 = (which: Move9, t: number, view: GameView): Sprite => toSprite(stag9Painted(which, t, view), STAG_AURA, STAG9_CANVAS.ax, STAG9_CANVAS.ay);
/** His moves' lengths (his walk: once round). */
export const LONG9: Record<Move9, number> = { attack: GORE9.long, charge: CHARGE9.long, close: CLOSE.long, walk: STOT9.period, stare: STARE.long };

/**
 * THE HOLLOW STAG AS THE GAME WOULD HOLD HIM WITH STAG_ACTION ON: his stand, his bellow, struck and his death the game's own; his
 * walk the great stot; his gore and his charge by Movement 9; the wood closing in (`moves.close`) in place of his roots; and
 * standing to stare (`moves.stare`).
 */
export function makeStagActionArt(): ActorArt {
  const art = makeStagArt();
  for (const [set, view] of [[art.front, 'front'], [art.back, 'back']] as const) {
    const clip = (which: Move9, hit?: number): Clip => {
      const c: Clip = { frames: lazyFrames(Math.round(LONG9[which] * 30) + 1, (i) => frame9(which, i / 30, view)), fps: 30 };
      if (hit !== undefined) c.hit = hit;
      return c;
    };
    const attack = clip('attack', GORE9_HIT);
    (set as AnimSet).attack = lazyFrames(3, (i) => attack.frames[[15, 26, 33][i]]);
    set.walk = lazyFrames(Math.round(STOT9.period * STOT9.fps), (i) => frame9('walk', i / STOT9.fps, view));
    set.walkFps = STOT9.fps;
    if (set.clips) {
      set.clips.attack = attack;
      const moves = { ...(set.clips.moves ?? {}) };
      delete moves.roots;
      set.clips.moves = { ...moves, charge: clip('charge', CHARGE9.crash), close: clip('close', CLOSE_HIT), stare: clip('stare', STOT9.down) };
    }
  }
  return art;
}
void easeIn;
void sub;
