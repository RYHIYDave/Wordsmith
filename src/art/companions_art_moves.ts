// THE RANGER'S SIX COMPANIONS: HOW THEY MOVE (the art chat's helper, 29 Oct 2026). A MOCK-UP: NOT IN THE GAME. Nothing of
// the game imports this file; the pictures are art/companions_art.ts, behind COMPANIONS_ART_ON, off.
//
// Each animal's moves are numbers only here: where its body is, how it is turned, where each foot or wing is, at every
// moment of its stand, its moving and its attack. art/companions_art.ts dresses those numbers in solids and paints them.
//
// THE OWNER'S RULES FOR EVERY ATTACK HERE (his art rulebook, Movement 9, 24 Oct: “Like the wind up and wind down are big
// but the actual punch is lightning quick”; its reach, his pick: “All attacks, melee most (Recommended)”): each animal
// winds up big and readable, holds the wound-up pose a moment (the warning: Monsters 4, read for a friend as its
// coiled moment), strikes in TWO frames at thirty a second, smeared (art/companions_art_fx.ts), carries through, and
// winds down big back to its stand. Movement 1: the haunches (or the coil, or the wings) get going first, then the
// chest, then the end it strikes with.
//
// UNITS: picture pixels, as the heroes' bones have them (the Ranger stands 57 high). x forward, y to the animal's left,
// z up; the floor point under the animal's middle is the origin. A tile is TILE3 of them along the floor.

import { TILE3 } from './new_mobs3';
import type { V3 } from './skeleton';

// ---------------------------------------------------------------------------------------------
// Little sums

export const cl01 = (v: number): number => Math.max(0, Math.min(1, v));
export const fr = (t: number): number => t - Math.floor(t);
export const D = Math.PI / 180;
export const TAU = Math.PI * 2;
export const add = (a: V3, b: V3): V3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
export const sub = (a: V3, b: V3): V3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
export const mul = (a: V3, k: number): V3 => [a[0] * k, a[1] * k, a[2] * k];
export const len = (a: V3): number => Math.hypot(a[0], a[1], a[2]);
export const norm = (a: V3, or: V3 = [0, 0, 1]): V3 => {
  const l = len(a);
  return l > 1e-9 ? mul(a, 1 / l) : or;
};
export const dot = (a: V3, b: V3): number => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
export const cross = (a: V3, b: V3): V3 => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
export const lerpV = (a: V3, b: V3, s: number): V3 => [a[0] + (b[0] - a[0]) * s, a[1] + (b[1] - a[1]) * s, a[2] + (b[2] - a[2]) * s];
export const mix = (a: number, b: number, k: number): number => a + (b - a) * k;
/** Smooth from 0 to 1, slow at both ends. */
export const sm = (v: number): number => {
  const c = cl01(v);
  return c * c * (3 - 2 * c);
};
/** Slow at the start only (a strike: it is at its fastest as it lands). */
export const easeIn = (v: number): number => Math.pow(cl01(v), 1.6);
/** Slow at the end only. */
export const easeOut = (v: number): number => 1 - Math.pow(1 - cl01(v), 2);
/** A swell from nothing at `a` to its fullest half way and back to nothing at `b`, smooth at both ends. */
export const bump = (t: number, a: number, b: number): number => (t <= a || t >= b ? 0 : Math.pow(Math.sin((Math.PI * (t - a)) / (b - a)), 2));

/** A direction turned by yaw (to the left), pitch (nose down) and roll (to the right), in degrees: roll first, then pitch, then yaw. */
export function turn(v: V3, yaw: number, pitch: number, roll: number): V3 {
  const cy = Math.cos(yaw * D);
  const sy = Math.sin(yaw * D);
  const cp = Math.cos(pitch * D);
  const sp = Math.sin(pitch * D);
  const cr = Math.cos(roll * D);
  const sr = Math.sin(roll * D);
  const r1: V3 = [v[0], v[1] * cr - v[2] * sr, v[1] * sr + v[2] * cr];
  const r2: V3 = [r1[0] * cp + r1[2] * sp, r1[1], -r1[0] * sp + r1[2] * cp];
  return [r2[0] * cy - r2[1] * sy, r2[0] * sy + r2[1] * cy, r2[2]];
}
/** A direction turned about an axis (a unit), by `deg`. */
export function about(v: V3, axis: V3, deg: number): V3 {
  const c = Math.cos(deg * D);
  const s = Math.sin(deg * D);
  return add(add(mul(v, c), mul(cross(axis, v), s)), mul(axis, dot(axis, v) * (1 - c)));
}
/** The middle joint of a limb from `a` to `c`, its two lengths `l1` and `l2`, bent toward `hint`. */
export function joint(a: V3, c: V3, l1: number, l2: number, hint: V3): V3 {
  const d0 = sub(c, a);
  const d = Math.max(Math.abs(l1 - l2) + 0.01, Math.min(l1 + l2 - 0.01, len(d0)));
  const n = norm(d0);
  const alongD = (l1 * l1 - l2 * l2 + d * d) / (2 * d);
  const h = Math.sqrt(Math.max(0, l1 * l1 - alongD * alongD));
  const side = norm(sub(hint, mul(n, dot(hint, n))), [0, 0, 1]);
  return add(add(a, mul(n, alongD)), mul(side, h));
}

/** Keys of a move: at each time, a set of numbers; between them each number is eased by the later key's easing. */
export type Ease = (v: number) => number;
export function keyed<K extends Record<string, number>>(t: number, keys: ReadonlyArray<readonly [number, K, Ease]>): K {
  if (t <= keys[0][0]) return { ...keys[0][1] };
  for (let i = 1; i < keys.length; i++) {
    const [t1, k1, ease] = keys[i];
    const [t0, k0] = keys[i - 1];
    if (t < t1) {
      const k = ease((t - t0) / (t1 - t0));
      const o = { ...k0 } as Record<string, number>;
      for (const f of Object.keys(k1)) o[f] = k0[f] + (k1[f] - k0[f]) * k;
      return o as K;
    }
  }
  return { ...keys[keys.length - 1][1] };
}

// ---------------------------------------------------------------------------------------------
// THEIR TIMES: one set for all six, as the game asks a companion's pictures

/** Standing: fifteen frames a second (as the floors' animals stand), a loop of 2.4 seconds. The two that fly hover at thirty, their wings being quick. */
export const COMP_STAND = { fps: 15, period: 2.4, flyFps: 30 } as const;
/** Moving: thirty frames a second (as the heroes run), a loop of each one's own length (COMP_GAIT). */
export const COMP_MOVE_FPS = 30;
/**
 * THE ATTACK, the same beats for all six (his rule, Movement 9): the wind-up from 0 to `coiled`; the warning held to
 * `strike`; THE STRIKE, two frames, from `strike` to `hit` (where the blow lands); carried through to `through`; the
 * wind-down to `long`, back on its stand. Thirty frames a second.
 *   (The game's own numbers for a bite, game/companions.ts COMPANION_TUNE.bite, are its first guesses, the blow at 8/30 and
 *   the end at 18/30: the main chat would set them to these, `hit` 12/30 and `long` 24/30, as it brings these in.)
 */
export const COMP_ATTACK = { coiled: 0.2, strike: 10 / 30, hit: 12 / 30, through: 0.53, long: 0.8, fps: 30 } as const;

/**
 * HOW FAST EACH IS PAINTED TO GO (tiles a second; the Ranger runs at 4.6, the game's companions at 5.4: COMPANION_TUNE.speed)
 * and how long one turn of its going is (seconds). A foot that is down stays on its spot of the floor at that pace; at
 * another the same frames go faster or slower (`moveFpsAt`), or are chosen by the ground covered (`strideOf`: the game's
 * AnimSet.walkStride), so that they still grip. THE TORTOISE IS PAINTED SLOW AND STEADY: at the companions' 5.4 its
 * steps go 2.25 times as fast (see the README: his to decide).
 */
export const COMP_GAIT = {
  hawk: { pace: 5.4, period: 0.5 },
  snake: { pace: 5.4, period: 0.4 },
  wolf: { pace: 5.4, period: 0.4 },
  bat: { pace: 5.4, period: 0.3 },
  fox: { pace: 5.4, period: 0.3 },
  tortoise: { pace: 2.4, period: 0.8 },
} as const;
export type Kind = keyof typeof COMP_GAIT;
export const KINDS: readonly Kind[] = ['hawk', 'snake', 'wolf', 'bat', 'fox', 'tortoise'];
/** How far it goes in one turn of its going, in tiles (the game's AnimSet.walkStride). */
export function strideOf(k: Kind): number {
  return COMP_GAIT[k].pace * COMP_GAIT[k].period;
}
/** The frames a second its going is shown at, at `pace` tiles a second, so that what grips the floor still grips. */
export function moveFpsAt(k: Kind, pace: number): number {
  return (COMP_MOVE_FPS * pace) / COMP_GAIT[k].pace;
}
/** How many frames one turn of its going has. */
export function moveFrames(k: Kind): number {
  return Math.round(COMP_GAIT[k].period * COMP_MOVE_FPS);
}
/** How fast the floor goes by under it as it goes, in its own lengths a second. */
export function groundOf(k: Kind): number {
  return COMP_GAIT[k].pace * TILE3;
}
/** A move's length in seconds: its stand and its going once round. */
export function moveLong(k: Kind, which: string): number {
  if (which === 'stand') return COMP_STAND.period;
  if (which === 'walk') return moveFrames(k) / COMP_MOVE_FPS;
  return COMP_ATTACK.long;
}
/** Frames a second of a move. */
export function moveFps(k: Kind, which: string): number {
  if (which === 'stand') return k === 'hawk' || k === 'bat' ? COMP_STAND.flyFps : COMP_STAND.fps;
  return COMP_MOVE_FPS;
}
/** The beats of the attack, by name, at `t`: before, held, striking, through, after. */
export function beatOf(t: number): 'wind' | 'held' | 'strike' | 'through' | 'down' {
  const A = COMP_ATTACK;
  return t < A.coiled ? 'wind' : t < A.strike - 1e-9 ? 'held' : t <= A.hit + 1e-9 ? 'strike' : t < A.through ? 'through' : 'down';
}
/** A tremble, for the held warning: a few tenths of a picture pixel, quick, ramped in over `k`. */
export const shiver = (t: number, seed: number): number => Math.sin(t * 160 + seed) * 0.5 + Math.sin(t * 237 + seed * 2) * 0.3;

// =============================================================================================
// THE WOLF AND THE FOX: FOUR LEGS (one rig, two bodies)

export interface QuadPose {
  /** The body moved from its stand (forward, to its left, up). */
  x: number;
  y: number;
  z: number;
  /** The haunches: turned to the left, tipped nose down, rolled to the right (degrees). */
  yaw: number;
  pitch: number;
  roll: number;
  /** The chest over the haunches: tipped nose down (`bend`) and turned to the left (`twist`). */
  bend: number;
  twist: number;
  /** The neck lowered (degrees; raised if less than 0). */
  neck: number;
  /** The head on the neck: turned to the left, tipped down, rolled. */
  head: readonly [number, number, number];
  /** The jaw open (0 shut, 1 wide); the tongue out (0 in, 1 lolling); the ears (0 up, 1 pricked forward, -1 flat back); the lips drawn back off the teeth (0 to 1). */
  gape: number;
  tongue: number;
  ears: number;
  snarl: number;
  /** The tail raised (degrees from its rest), and wagged to its left. */
  tail: readonly [number, number];
  /** Each foot (right fore, left fore, right hind, left hind), and how far its lower leg is folded up (degrees). */
  feet: V3[];
  fold: number[];
  /** Its chest swelling (-1 to 1); its eyes (1 open, 0 shut). */
  breath: number;
  eyes: number;
}

/** A four-legged one's frame: its feet at rest, and how it goes. */
export interface QuadSpec {
  kind: 'wolf' | 'fox';
  /** Where the body turns about (the middle of its back, low). */
  pivot: V3;
  feet: readonly V3[];
  /** Its going: each foot's share of the turn on the floor; when each comes down; how high a fore and a hind foot are lifted, and folded. */
  duty: number;
  down: readonly number[];
  lift: readonly [number, number];
  folds: readonly [number, number];
  /** How its body rises and pitches, and its back flexes, through a turn of its going (picture pixels, degrees). */
  rise: number;
  rock: number;
  flex: number;
}

export const WOLF_SPEC: QuadSpec = {
  kind: 'wolf',
  pivot: [0, 0, 15],
  feet: [
    [9.5, -3.1, 0],
    [9.5, 3.1, 0],
    [-10.5, -3.3, 0],
    [-10.5, 3.3, 0],
  ],
  // (a lope: the hind feet one after the other, then the fore, then a long moment in the air, gathered)
  duty: 0.3,
  down: [0.36, 0.44, 0.0, 0.08],
  lift: [6.5, 5],
  folds: [95, 55],
  rise: 2.2,
  rock: 6,
  flex: 9,
};
export const FOX_SPEC: QuadSpec = {
  kind: 'fox',
  pivot: [0, 0, 10.5],
  feet: [
    [6.8, -2.2, 0],
    [6.8, 2.2, 0],
    [-7.2, -2.4, 0],
    [-7.2, 2.4, 0],
  ],
  // (a quick bound: the hind feet nearly together, then the fore, a long moment in the air)
  duty: 0.28,
  down: [0.38, 0.44, 0.0, 0.05],
  lift: [5, 4],
  folds: [100, 60],
  rise: 1.8,
  rock: 7,
  flex: 11,
};

const QREST = (S: QuadSpec): QuadPose => ({
  x: 0, y: 0, z: 0, yaw: 0, pitch: 0, roll: 0, bend: 0, twist: 0, neck: 0, head: [0, 0, 0],
  gape: 0, tongue: 0, ears: 0, snarl: 0, tail: [0, 0], feet: S.feet.map((f) => f), fold: [0, 0, 0, 0], breath: 0, eyes: 1,
});

/**
 * THE WOLF STANDING: at ease by him, alert and glad of it. Panting, its tongue out, its chest heaving; its weight shifting
 * from its fore legs to its hind and back; its tail held up and wagging slowly; it looks up at him (to its left and up),
 * its ears pricking forward, and back; one ear flicks; it blinks. Its feet stay where they stand.
 * THE FOX STANDING: quick and watchful: its brush swept from side to side, its ears swivelling, a tilt of its head (the
 * fox's listening tilt), a glance back over its shoulder; it sinks and rises a little on its legs, never quite still.
 */
function quadStand(S: QuadSpec, t0: number): QuadPose {
  const T = COMP_STAND.period;
  const t = fr(t0 / T) * T;
  const a = (TAU * t) / T;
  const P = QREST(S);
  if (S.kind === 'wolf') {
    const pant = Math.sin(a * 8);
    const look = bump(t, 0.45, 1.35);
    const flick = bump(t, 1.6, 1.8);
    const blink = bump(t, 2.0, 2.12);
    return {
      ...P,
      x: 0.75 * Math.sin(a + 1),
      z: 0.55 * Math.sin(a) + 0.18 * pant,
      pitch: 1.2 * Math.sin(a + 1),
      bend: -1.5 * Math.sin(a + 1),
      neck: -4 * look + 1.5 * Math.sin(a),
      head: [26 * look, -14 * look + 2 * Math.sin(a * 2), 8 * look],
      gape: 0.32 + 0.1 * pant - 0.2 * look,
      tongue: 1 - 0.6 * look,
      ears: 0.4 + 0.6 * look - 0.8 * flick,
      tail: [6 + 3 * Math.sin(a * 2), 13 * Math.sin(a * 4)],
      breath: pant,
      eyes: 1 - blink,
    };
  }
  const tilt = bump(t, 0.3, 1.0);
  const glance = bump(t, 1.25, 1.85);
  const swivel = bump(t, 1.95, 2.3);
  return {
    ...P,
    x: 0.7 * Math.sin(a),
    z: 0.65 * Math.sin(a * 2 + 0.4),
    pitch: 1.4 * Math.sin(a),
    bend: -1.2 * Math.sin(a + 0.7),
    neck: -6 * tilt + 3 * glance,
    head: [-38 * glance + 6 * Math.sin(a), -6 * tilt, 22 * tilt],
    ears: 0.6 + 0.4 * tilt - 0.5 * swivel,
    tail: [10 + 4 * Math.sin(a * 2), 16 * Math.sin(a * 3 + 0.5)],
    breath: Math.sin(a * 4),
    eyes: 1 - bump(t, 2.1, 2.22),
  };
}

/** Where one foot is at a moment of its going: on the floor going back under it, or lifted and swung on. */
function goFoot(S: QuadSpec, i: number, ph: number, span: number): { foot: V3; fold: number } {
  const r = S.feet[i];
  const front = i < 2;
  const half = (span * S.duty) / 2;
  const u = fr(ph - S.down[i]);
  if (u < S.duty) return { foot: [r[0] + half - span * u, r[1], 0], fold: 0 };
  const v = (u - S.duty) / (1 - S.duty);
  const up = front ? S.lift[0] : S.lift[1];
  // (lifted quick off the floor, reached forward, and put down: the reach eased so the foot lands slow)
  return { foot: [r[0] - half + 2 * half * sm(v), r[1], up * Math.sin(Math.PI * Math.pow(v, 0.85))], fold: (front ? S.folds[0] : S.folds[1]) * Math.sin(Math.PI * Math.pow(v, 0.7)) };
}

/**
 * THE WOLF'S LOPE: long, easy bounds: its hind feet come down one after the other, then its fore, then it is in the air,
 * gathered; its back flexes (rounded as it gathers, flat as it reaches), its head steady and forward, its ears up, its
 * tail streaming level behind. THE FOX'S DART: the same bound, quicker and lower, its brush out straight behind it.
 */
function quadMove(S: QuadSpec, t: number): QuadPose {
  const k: Kind = S.kind;
  const ph = fr(t / COMP_GAIT[k].period);
  const a = TAU * ph;
  const span = groundOf(k) * COMP_GAIT[k].period;
  const fs = [0, 1, 2, 3].map((i) => goFoot(S, i, ph, span));
  const P = QREST(S);
  const wolf = S.kind === 'wolf';
  return {
    ...P,
    x: 0,
    y: 0,
    z: S.rise * Math.sin(a - 0.9) - 0.6,
    pitch: S.rock * Math.sin(a + 0.6),
    bend: -S.flex * Math.sin(a - 0.4),
    neck: (wolf ? 14 : 12) - 5 * Math.sin(a + 0.6),
    head: [0, -10 - 5 * Math.sin(a + 1.0), 0],
    gape: wolf ? 0.22 : 0.05,
    tongue: wolf ? 0.6 : 0,
    ears: wolf ? 0.1 : -0.3,
    tail: [wolf ? -2 + 6 * Math.sin(a + 2) : 4 + 4 * Math.sin(a + 2), 3 * Math.sin(a)],
    feet: fs.map((f) => f.foot),
    fold: fs.map((f) => f.fold),
    breath: Math.sin(2 * a),
  };
}

// --- THE ATTACKS ---

type QK = { x: number; z: number; pitch: number; bend: number; neck: number; hy: number; hp: number; hr: number; gape: number; ears: number; snarl: number; tl: number; tw: number; tongue: number; fx: number; fl: number; hx: number };
const qkOf = (P: QuadPose): QK => ({ x: P.x, z: P.z, pitch: P.pitch, bend: P.bend, neck: P.neck, hy: P.head[0], hp: P.head[1], hr: P.head[2], gape: P.gape, ears: P.ears, snarl: P.snarl, tl: P.tail[0], tw: P.tail[1], tongue: P.tongue, fx: 0, fl: 0, hx: 0 });

/**
 * THE WOLF'S BITE (its gift, Binding: it holds what it bites). It drops into a crouch, its haunches bunched under it, its
 * head low and drawn back, its ears flat, its lips drawn off its fangs; held, trembling (the warning). THE STRIKE: its
 * haunches drive it forward, its fore feet thrown out before it, its jaws flung wide and SNAPPED SHUT on what is before
 * it (`hit`), all in two frames. It holds on: its head wrenches to one side and the other, tugging; and lets go, steps
 * back and settles on its stand.
 * THE FOX'S POUNCE (its gift, Swift: its bite gives him speed): the fox's own way of taking a mouse. It rears up on its
 * hind legs, ears pricked at what it is after, its brush up for balance (the warning: up, still, listening); THE STRIKE:
 * it springs up and over and comes down nose first, its fore paws pinning (`hit`); and it darts back out, its brush
 * whipping round, quick, onto its stand.
 */
function quadAttack(S: QuadSpec, t: number): QuadPose {
  const A = COMP_ATTACK;
  const P0 = quadStand(S, 0);
  const K0 = qkOf(P0);
  const K = (k: Partial<QK>): QK => ({ ...K0, ...k });
  const wolf = S.kind === 'wolf';
  let k: QK;
  if (wolf) {
    const CROUCH = K({ x: -2.6, z: -3.4, pitch: 3, bend: 6, neck: 18, hy: 0, hp: 10, hr: 0, gape: 0.18, ears: -1, snarl: 1, tl: -8, tw: 0, tongue: 0, fx: 0, fl: 0, hx: -1.5 });
    const OPEN = K({ x: 5.5, z: -0.2, pitch: -5, bend: -6, neck: 2, hy: 0, hp: 0, hr: 0, gape: 1, ears: -1, snarl: 1, tl: 4, tw: 0, tongue: 0, fx: 9, fl: 6, hx: 5 });
    const SNAP = K({ x: 9.5, z: 0.3, pitch: -3, bend: -2, neck: 4, hy: 0, hp: 6, hr: 0, gape: 0.02, ears: -0.6, snarl: 1, tl: 8, tw: 0, tongue: 0, fx: 12, fl: 0, hx: 9 });
    const TUG = K({ x: 11, z: 0.2, pitch: -1, bend: 2, neck: 6, hy: 0, hp: 8, hr: 0, gape: 0.02, ears: -0.4, snarl: 1, tl: 10, tw: 0, tongue: 0, fx: 12, fl: 0, hx: 11 });
    const BACK = K({ x: 1.5, z: 0.4, pitch: 1, bend: -1, neck: 0, hy: 0, hp: -4, hr: 0, gape: 0.25, ears: 0.4, snarl: 0, tl: 8, tw: 6, tongue: 0.6, fx: 2, fl: 0, hx: 0.5 });
    k = keyed(t, [
      [0, K0, sm],
      [A.coiled, CROUCH, easeOut],
      [A.strike, CROUCH, sm],
      [A.strike + 1 / 30, OPEN, easeIn],
      [A.hit, SNAP, (v) => v],
      [A.through, TUG, sm],
      [0.64, BACK, sm],
      [A.long, K0, sm],
    ]);
    // (holding on: its head wrenched to one side and the other, its body with it)
    if (t > A.hit && t < A.through + 0.04) {
      const w = bump(t, A.hit, A.through + 0.04);
      const s = Math.sin(((t - A.hit) / (A.through + 0.04 - A.hit)) * TAU * 1.5);
      k = { ...k, hy: k.hy + 26 * s * w, hr: k.hr - 14 * s * w, x: k.x + 0.5 * s * w, tw: k.tw - 10 * s * w };
    }
  } else {
    const REAR = K({ x: -2.2, z: 5.5, pitch: -38, bend: -10, neck: -10, hy: 0, hp: 18, hr: 0, gape: 0, ears: 1, snarl: 0, tl: 24, tw: 0, tongue: 0, fx: 0, fl: 7, hx: -1 });
    const OVER = K({ x: 7, z: 9.5, pitch: 22, bend: 14, neck: 8, hy: 0, hp: 20, hr: 0, gape: 0.5, ears: 1, snarl: 0.4, tl: 30, tw: 0, tongue: 0, fx: 9, fl: 5, hx: 7 });
    const DOWN = K({ x: 11, z: 1.2, pitch: 34, bend: 12, neck: 14, hy: 0, hp: 22, hr: 0, gape: 0.05, ears: 0.6, snarl: 0.6, tl: 36, tw: 0, tongue: 0, fx: 14, fl: 0, hx: 11 });
    const PRESS = K({ x: 12.5, z: 0.4, pitch: 26, bend: 10, neck: 16, hy: 0, hp: 18, hr: 0, gape: 0.05, ears: 0.4, snarl: 0.6, tl: 26, tw: -20, tongue: 0, fx: 14, fl: 0, hx: 12.5 });
    const DART = K({ x: -1.5, z: 0.6, pitch: -2, bend: -2, neck: -2, hy: -10, hp: -2, hr: 0, gape: 0, ears: 0.2, snarl: 0, tl: 14, tw: 30, tongue: 0, fx: 0, fl: 0, hx: -1.5 });
    k = keyed(t, [
      [0, K0, sm],
      [A.coiled, REAR, easeOut],
      [A.strike, REAR, sm],
      [A.strike + 1 / 30, OVER, easeIn],
      [A.hit, DOWN, (v) => v],
      [A.through, PRESS, sm],
      [0.66, DART, sm],
      [A.long, K0, sm],
    ]);
  }
  // (the warning: still, but alive in every hair of it)
  if (t > A.coiled - 0.04 && t < A.strike) {
    const w = sm((t - (A.coiled - 0.04)) / 0.05);
    k = { ...k, x: k.x + 0.25 * shiver(t, 1) * w, z: k.z + 0.2 * shiver(t, 2) * w, hy: k.hy + 1.5 * shiver(t, 3) * w };
  }
  // ITS FEET, each down on its spot or lifted and stepping (Movement 8): the fore feet thrown forward in the strike and
  // put down before it; the hind ones (the wolf's a short step, the fox's the whole spring) after them; each stepped
  // back in the wind-down. The fox's fore feet are off the floor and tucked as it rears.
  const feet: V3[] = [];
  const fold: number[] = [];
  for (let i = 0; i < 4; i++) {
    const front = i < 2;
    const r = S.feet[i];
    const reach = front ? (wolf ? 12 : 14) : wolf ? 4 : 9;
    const lag = i % 2 === 0 ? 0 : 0.025;
    const out0 = A.strike - (front ? 0.005 : -0.01) + (front ? 0 : lag);
    const out1 = A.hit + (front ? 0 : 0.05 + lag);
    const back0 = (front ? 0.6 : 0.63) + lag;
    const back1 = back0 + 0.15;
    let x = r[0];
    let z = 0;
    let f = 0;
    if (t >= out0 && t < out1) {
      const v = (t - out0) / (out1 - out0);
      x = r[0] + reach * Math.pow(v, front ? 1.2 : 1.5);
      z = (front ? 5 : 3.5) * Math.sin(Math.PI * Math.pow(v, 0.8));
      f = (front ? 75 : 45) * Math.sin(Math.PI * v);
    } else if (t >= out1 && t < back0) x = r[0] + reach;
    else if (t >= back0 && t < back1) {
      const v = sm((t - back0) / (back1 - back0));
      x = r[0] + reach * (1 - v);
      z = 3 * Math.sin(Math.PI * v);
      f = 45 * Math.sin(Math.PI * v);
    }
    // (the fox, reared on its hind legs: its fore feet up off the floor, tucked to its chest)
    if (!wolf && front && t < out0) {
      const up = cl01(k.fl / 7);
      x = r[0] - 1.5 * up;
      z = Math.max(z, k.fl);
      f = Math.max(f, 95 * up);
    }
    feet.push([x, r[1], z]);
    fold.push(f);
  }
  return {
    ...P0,
    x: k.x,
    z: k.z,
    pitch: k.pitch,
    bend: k.bend,
    neck: k.neck,
    head: [k.hy, k.hp, k.hr],
    gape: k.gape,
    ears: k.ears,
    snarl: k.snarl,
    tail: [k.tl, k.tw],
    tongue: k.tongue,
    feet,
    fold,
    breath: 0,
  };
}
export function quadPose(S: QuadSpec, which: string, t: number): QuadPose {
  if (which === 'stand') return quadStand(S, t);
  if (which === 'walk') return quadMove(S, t);
  return quadAttack(S, t);
}
