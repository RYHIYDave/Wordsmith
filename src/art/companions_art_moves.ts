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
 * AnimSet.walkStride), so that they still grip. THE TORTOISE KEEPS UP WITH HIM (his pick, 30 Oct: “Keep up with me”):
 * a determined trundle at the companions' pace, long reaching strides by diagonal pairs, its shell rocking, its head
 * out low and steady before it.
 */
export const COMP_GAIT = {
  hawk: { pace: 5.4, period: 16 / 30 },
  snake: { pace: 5.4, period: 6 / 30 },
  wolf: { pace: 5.4, period: 10 / 30 },
  bat: { pace: 5.4, period: 12 / 30 },
  fox: { pace: 5.4, period: 7 / 30 },
  tortoise: { pace: 5.4, period: 6 / 30 },
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
    [9.5, -2.9, 0],
    [9.5, 2.9, 0],
    [-10.5, -4.0, 0],
    [-10.5, 4.0, 0],
  ],
  // (a lope: the hind feet one after the other, then the fore, then a long moment in the air, gathered)
  duty: 0.3,
  down: [0.36, 0.44, 0.0, 0.08],
  lift: [6.5, 5],
  folds: [95, 55],
  rise: 1.8,
  rock: 6,
  flex: 9,
};
export const FOX_SPEC: QuadSpec = {
  kind: 'fox',
  pivot: [0, 0, 10.5],
  feet: [
    [6.8, -2.0, 0],
    [6.8, 2.0, 0],
    [-7.2, -2.9, 0],
    [-7.2, 2.9, 0],
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
    neck: (wolf ? 8 : 10) - 4 * Math.sin(a + 0.6),
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
const mixK = <T extends Record<string, number>>(a: T, b: T, k: number): T => {
  const o = { ...a } as Record<string, number>;
  for (const f of Object.keys(a)) o[f] = a[f] + (b[f] - a[f]) * k;
  return o as T;
};
const midK = <T extends Record<string, number>>(a: T, b: T): T => {
  const o = { ...a } as Record<string, number>;
  for (const f of Object.keys(a)) o[f] = (a[f] + b[f]) / 2;
  return o as T;
};
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
    const CROUCH = K({ x: -4.2, z: -3.6, pitch: 3, bend: 6, neck: 24, hy: 0, hp: 14, hr: 0, gape: 0.18, ears: -1, snarl: 1, tl: -8, tw: 0, tongue: 0, fx: 0, fl: 0, hx: -1.5 });
    const SNAP = K({ x: 11, z: 0.3, pitch: -3, bend: -2, neck: 4, hy: 0, hp: 6, hr: 0, gape: 0.02, ears: -0.6, snarl: 1, tl: 8, tw: 0, tongue: 0, fx: 12, fl: 0, hx: 9 });
    const OPEN = { ...midK(CROUCH, SNAP), gape: 1 };
    const TUG = K({ x: 16.5, z: -0.4, pitch: 1, bend: 2, neck: 10, hy: 0, hp: 10, hr: 0, gape: 0.02, ears: -0.4, snarl: 1, tl: 10, tw: 0, tongue: 0, fx: 12, fl: 0, hx: 11 });
    const BACK = K({ x: 4, z: 0.4, pitch: 1, bend: -1, neck: 0, hy: 0, hp: -4, hr: 0, gape: 0.25, ears: 0.4, snarl: 0, tl: 8, tw: 6, tongue: 0.6, fx: 2, fl: 0, hx: 0.5 });
    k = keyed(t, [
      [0, K0, sm],
      [A.coiled, CROUCH, sm],
      [A.strike, CROUCH, sm],
      [A.strike + 1 / 30, OPEN, easeIn],
      [A.hit, SNAP, (v) => v],
      [A.through, TUG, easeOut],
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
    const DOWN = K({ x: 12, z: 2.2, pitch: 18, bend: 10, neck: 12, hy: 0, hp: 18, hr: 0, gape: 0.05, ears: 0.6, snarl: 0.6, tl: 30, tw: 0, tongue: 0, fx: 14, fl: 0, hx: 11 });
    const OVER = { ...midK(REAR, DOWN), z: (REAR.z + DOWN.z) / 2 + 2.5, gape: 0.5 };
    const PRESS = K({ x: 18, z: 0.8, pitch: 24, bend: 12, neck: 16, hy: 0, hp: 22, hr: 0, gape: 0.05, ears: 0.4, snarl: 0.6, tl: 26, tw: -20, tongue: 0, fx: 14, fl: 0, hx: 12.5 });
    const DART = K({ x: 1.5, z: 0.6, pitch: -2, bend: -2, neck: -2, hy: -10, hp: -2, hr: 0, gape: 0, ears: 0.2, snarl: 0, tl: 14, tw: 30, tongue: 0, fx: 0, fl: 0, hx: -1.5 });
    k = keyed(t, [
      [0, K0, sm],
      [A.coiled, REAR, sm],
      [A.strike, REAR, sm],
      [A.strike + 1 / 30, OVER, easeIn],
      [A.hit, DOWN, (v) => v],
      [A.through, PRESS, easeOut],
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
    const reach = front ? (wolf ? 16 : 18) : wolf ? 10.5 : 12;
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

// =============================================================================================
// THE TORTOISE: a domed shell on four stout legs

export interface TortPose {
  x: number;
  y: number;
  z: number;
  yaw: number;
  pitch: number;
  roll: number;
  /** How far its neck is out of its shell (0 drawn in, 1 out, more: stretched); its head turned, tipped down, rolled. */
  neck: number;
  head: readonly [number, number, number];
  gape: number;
  feet: V3[];
  /** How far each foot is lifted off the floor's line from its shoulder (its leg bent, degrees). */
  fold: number[];
  eyes: number;
}
export const TORT_FEET: readonly V3[] = [
  [11, -9.4, 0],
  [11, 9.4, 0],
  [-11, -9.0, 0],
  [-11, 9.0, 0],
];
const TREST: TortPose = { x: 0, y: 0, z: 0, yaw: 0, pitch: 0, roll: 0, neck: 0.85, head: [0, 0, 0], gape: 0, feet: TORT_FEET.map((f) => f), fold: [0, 0, 0, 0], eyes: 1 };

/** THE TORTOISE STANDING: its head out, swinging slowly to look about it and up at him; its shell rising and settling as it breathes; its weight shifting; a slow blink. */
function tortStand(t0: number): TortPose {
  const T = COMP_STAND.period;
  const t = fr(t0 / T) * T;
  const a = (TAU * t) / T;
  const look = bump(t, 0.3, 1.4);
  return {
    ...TREST,
    x: 0.75 * Math.sin(a + 1),
    z: 0.65 * Math.sin(a),
    pitch: -1.2 * Math.sin(a),
    roll: 1.2 * Math.sin(a + 0.5),
    neck: 0.85 + 0.12 * Math.sin(a * 2) + 0.15 * look,
    head: [32 * look * Math.sin(Math.PI * cl01((t - 0.3) / 1.1) * 1.5), -16 * look, 0],
    eyes: 1 - bump(t, 1.75, 1.95),
  };
}
/** THE TORTOISE'S TRUNDLE, KEEPING UP WITH HIM (his pick): determined: long reaching strides by diagonal pairs, two feet always down, each foot lifted high and planted; its shell rocking from side to side and bobbing; its head out low and steady before it. */
function tortMove(t: number): TortPose {
  const P = COMP_GAIT.tortoise.period;
  const ph = fr(t / P);
  const a = TAU * ph;
  const span = groundOf('tortoise') * P;
  // (each pair down a little over a third of the turn, so that each foot has time to be lifted and swung through)
  const duty = 0.38;
  const downAt = [0, 0.5, 0.5, 0];
  const feet: V3[] = [];
  const fold: number[] = [];
  for (let i = 0; i < 4; i++) {
    const r = TORT_FEET[i];
    const half = (span * duty) / 2;
    const u = fr(ph - downAt[i]);
    if (u < duty) {
      feet.push([r[0] + half - span * u, r[1], 0]);
      fold.push(0);
    } else {
      const v = (u - duty) / (1 - duty);
      feet.push([r[0] - half + 2 * half * sm(v), r[1], 4 * Math.sin(Math.PI * v)]);
      fold.push(40 * Math.sin(Math.PI * v));
    }
  }
  return { ...TREST, z: 0.7 * Math.sin(2 * a) + 0.3, roll: 4.5 * Math.sin(a), yaw: 2 * Math.sin(a), pitch: 1.2 * Math.sin(2 * a + 1), neck: 1.05, head: [-2 * Math.sin(a), 8, 0], feet, fold };
}
/**
 * THE TORTOISE'S SHELL-RAM (its gift, Guarding: each hit it lands gives him a brief shield). Slow to start, quick to
 * strike, as he asked of it: it draws its head into its shell and rocks back on its hind legs, the front of its shell
 * rising (the warning, held); THE STRIKE: it throws itself forward, its shell coming down hard, its head shooting out to
 * snap on what is before it; and the shield of its plates flashes up over it (art/companions_art_fx.ts). It steps back
 * and settles.
 */
function tortAttack(t: number): TortPose {
  const A = COMP_ATTACK;
  const S0 = tortStand(0);
  type K = { x: number; z: number; pitch: number; neck: number; hy: number; hp: number; gape: number };
  const K0: K = { x: S0.x, z: S0.z, pitch: S0.pitch, neck: S0.neck, hy: S0.head[0], hp: S0.head[1], gape: 0 };
  const WIND: K = { x: -2.2, z: 1.8, pitch: -14, neck: 0.05, hy: 0, hp: -8, gape: 0 };
  const SNAP: K = { x: 6.5, z: 0.1, pitch: 5, neck: 1.35, hy: 0, hp: 6, gape: 0.05 };
  const OUT: K = { ...midK(WIND, SNAP), gape: 0.9 };
  const THRU: K = { x: 10.5, z: 0, pitch: 4, neck: 1.6, hy: 0, hp: 9, gape: 0 };
  const BACK: K = { x: 3.5, z: 0.3, pitch: -1, neck: 0.95, hy: 0, hp: 0, gape: 0 };
  let k = keyed(t, [
    [0, K0, sm],
    [A.coiled, WIND, sm],
    [A.strike, WIND, sm],
    [A.strike + 1 / 30, OUT, easeIn],
    [A.hit, SNAP, (v) => v],
    [A.through, THRU, easeOut],
    [0.66, BACK, sm],
    [A.long, K0, sm],
  ]);
  if (t > A.coiled - 0.04 && t < A.strike) {
    const w = sm((t - (A.coiled - 0.04)) / 0.05);
    k = { ...k, x: k.x + 0.25 * shiver(t, 5) * w, z: k.z + 0.15 * shiver(t, 6) * w };
  }
  const feet: V3[] = [];
  const fold: number[] = [];
  for (let i = 0; i < 4; i++) {
    const front = i < 2;
    const r = TORT_FEET[i];
    const reach = front ? 10.5 : 8;
    const lag = i % 2 === 0 ? 0 : 0.03;
    const out0 = A.strike + (front ? -0.005 : 0.02 + lag);
    const out1 = A.hit + (front ? 0 : 0.06 + lag);
    const b0 = (front ? 0.6 : 0.64) + lag;
    const b1 = b0 + 0.14;
    let x = r[0];
    let z = 0;
    let f = 0;
    if (t >= out0 && t < out1) {
      const v = (t - out0) / (out1 - out0);
      x = r[0] + reach * Math.pow(v, 1.2);
      z = 2.4 * Math.sin(Math.PI * v);
      f = 30 * Math.sin(Math.PI * v);
    } else if (t >= out1 && t < b0) x = r[0] + reach;
    else if (t >= b0 && t < b1) {
      const v = sm((t - b0) / (b1 - b0));
      x = r[0] + reach * (1 - v);
      z = 2 * Math.sin(Math.PI * v);
      f = 25 * Math.sin(Math.PI * v);
    }
    feet.push([x, r[1], z]);
    fold.push(f);
  }
  return { ...S0, x: k.x, z: k.z, pitch: k.pitch, neck: k.neck, head: [k.hy, k.hp, 0], gape: k.gape, feet, fold };
}
export function tortPose(which: string, t: number): TortPose {
  return which === 'stand' ? tortStand(t) : which === 'walk' ? tortMove(t) : tortAttack(t);
}

// =============================================================================================
// THE SNAKE: one long body, lying along its own path

/** How many points down its spine, and how far apart (it is SNAKE_N * SNAKE_DS long, head to tail). */
export const SNAKE_N = 40;
export const SNAKE_DS = 1.2;
/** Its thickness down its length, `s` from its head (0) to the tip of its tail (1). */
export function snakeR(s: number): number {
  if (s < 0.05) return 1.55;
  if (s < 0.1) return mix(1.55, 1.25, (s - 0.05) / 0.05);
  if (s < 0.3) return mix(1.25, 2.1, sm((s - 0.1) / 0.2));
  if (s < 0.6) return 2.1;
  return mix(2.1, 0.35, Math.pow((s - 0.6) / 0.4, 1.3));
}
/** Its S on the floor: how wide and how long a wave. Its going: the wave stays on its spot of the floor as it slides along it. */
export const SNAKE_WAVE = { amp: 3.6, long: COMP_GAIT.snake.pace * TILE3 * COMP_GAIT.snake.period } as const;

export interface SnakePose {
  /** Its spine, head first, SNAKE_N points SNAKE_DS apart along it. */
  spine: V3[];
  /** Where its head points and which way is up for it. */
  look: V3;
  /** Its jaw open (0 to 1); its tongue out (0 to 1, flickering); how far its fangs are bared. */
  gape: number;
  tongue: number;
  /** Where the floor's S has got to (its going: the floor gone by, in its own lengths). */
  slide: number;
  /** Its head's own sway, for the review (degrees turned, tipped up). */
  hy: number;
  hp: number;
}
/** Points along a path given as a dense line, taken SNAKE_DS apart from its start. */
function resample(line: V3[]): V3[] {
  const out: V3[] = [line[0]];
  let need = SNAKE_DS;
  let i = 1;
  let from = line[0];
  while (out.length < SNAKE_N && i < line.length) {
    const seg = sub(line[i], from);
    const l = len(seg);
    if (l >= need) {
      const p = add(from, mul(seg, need / l));
      out.push(p);
      from = p;
      need = SNAKE_DS;
    } else {
      need -= l;
      from = line[i];
      i++;
    }
  }
  while (out.length < SNAKE_N) out.push(out[out.length - 1]);
  return out;
}
function bez(a: V3, b: V3, c: V3, d: V3, n: number): V3[] {
  const out: V3[] = [];
  for (let i = 0; i <= n; i++) {
    const u = i / n;
    const v = 1 - u;
    out.push(add(add(mul(a, v * v * v), mul(b, 3 * v * v * u)), add(mul(c, 3 * v * u * u), mul(d, u * u * u))));
  }
  return out;
}
/** Its body from its head `H` (where its head points: `look`) down through its raised neck to the floor at `x0`, and on along the floor's S (moved on by `slide`), lying on the floor. */
function snakeLine(H: V3, look: V3, x0: number, slide: number, bendBack: number): V3[] {
  const W = SNAKE_WAVE;
  const floorY = (x: number): number => W.amp * Math.sin((TAU * (x + slide)) / W.long);
  const floorAt = (x: number, r: number): V3 => [x, floorY(x), r];
  const r0 = snakeR(0.25);
  const A = floorAt(x0, r0);
  const A2 = floorAt(x0 - 0.5, r0);
  const tanA = norm(sub(A, A2));
  // (the neck: down from the head and back, in a curve that meets the floor going the way the floor's S goes)
  const neck = bez(H, add(H, mul(look, -bendBack)), add(A, add(mul(tanA, 5), [0, 0, 3])), A, 24);
  const floor: V3[] = [];
  for (let x = x0 - 0.25; x > x0 - 70; x -= 0.25) floor.push(floorAt(x, 0));
  const line = [...neck, ...floor];
  const pts = resample(line);
  // (each point of it on the floor lies on it: its middle as high as it is thick there)
  return pts.map((p, i) => (i > 0 && p[2] < snakeR(i / (SNAKE_N - 1)) ? [p[0], p[1], snakeR(i / (SNAKE_N - 1))] : p));
}

/** THE SNAKE AT REST: lying in an easy S, the front of it raised in a curve, its head up and swaying, its tongue flickering out and in. A snake has no eyelids: it never blinks. */
function snakeStand(t0: number): SnakePose {
  const T = COMP_STAND.period;
  const t = fr(t0 / T) * T;
  const a = (TAU * t) / T;
  const sway = Math.sin(a);
  const hy = 14 * Math.sin(a + 0.4) + 18 * bump(t, 1.3, 2.0);
  const hp = 6 * Math.sin(a * 2);
  const H: V3 = [8.5 + 0.5 * Math.sin(a * 2), 1.4 * sway, 9.6 + 0.8 * Math.sin(a * 2 + 0.6)];
  const look = norm(turn([1, 0, 0], hy, -hp, 0));
  const flick = Math.max(bump(t, 0.2, 0.42), bump(t, 0.5, 0.72), bump(t, 1.55, 1.77));
  return { spine: snakeLine(H, look, 1.5, 0, 4.5), look, gape: 0, tongue: flick, slide: 0, hy, hp };
}
/** THE SNAKE'S GOING: fast, its body sliding along its own S on the floor (the S staying where it is on the floor as it goes along it), its head held up off the floor, steady, looking ahead, its tongue tasting the air. */
function snakeMove(t: number): SnakePose {
  const P = COMP_GAIT.snake.period;
  const ph = fr(t / P);
  const slide = groundOf('snake') * P * ph;
  const W = SNAKE_WAVE;
  const x0 = 6;
  const yH = W.amp * Math.sin((TAU * (x0 + 5 + slide)) / W.long) * 0.35;
  const H: V3 = [12, yH, 5.5];
  const look = norm([1, -yH * 0.05, -0.08]);
  return { spine: snakeLine(H, look, x0, slide, 3), look, gape: 0, tongue: ph < 0.5 ? Math.sin(Math.PI * ph * 2) : 0, slide, hy: 0, hp: 0 };
}
/**
 * THE SNAKE'S STRIKE (its gift, Poison: a dose with each bite). It draws its head back into a tight S, low and cocked,
 * its jaw shut, its tail-end still on the floor (the warning, held, its head quite still); THE STRIKE: the S throws
 * straight and its head shoots out, its jaws gaping wide and its fangs swung down, and it bites (`hit`), its body
 * dragged forward along its path after it; it holds a moment as the venom goes in, and draws back into its rest.
 */
function snakeAttack(t: number): SnakePose {
  const A = COMP_ATTACK;
  const S0 = snakeStand(0);
  type K = { hx: number; hy: number; hz: number; bend: number; x0: number; gape: number; lp: number };
  const H0 = S0.spine[0];
  const K0: K = { hx: H0[0], hy: H0[1], hz: H0[2], bend: 4.5, x0: 1.5, gape: 0, lp: -S0.hp };
  const COIL: K = { hx: 0.5, hy: 0.4, hz: 8.2, bend: -5.5, x0: -0.5, gape: 0, lp: 10 };
  const BITE: K = { hx: 18.5, hy: 0, hz: 4.2, bend: 6, x0: 5, gape: 0.55, lp: 14 };
  const OPEN: K = { ...mixK(COIL, BITE, 0.62), gape: 1 };
  const HOLD: K = { hx: 24.5, hy: 0, hz: 3.4, bend: 6.5, x0: 9.5, gape: 0.5, lp: 16 };
  const BACK: K = { hx: 9.5, hy: 0.3, hz: 8.5, bend: 4.5, x0: 2.2, gape: 0, lp: 0 };
  let k = keyed(t, [
    [0, K0, sm],
    [A.coiled, COIL, sm],
    [A.strike, COIL, sm],
    [A.strike + 1 / 30, OPEN, easeIn],
    [A.hit, BITE, (v) => v],
    [A.through, HOLD, easeOut],
    [0.68, BACK, sm],
    [A.long, K0, sm],
  ]);
  if (t > A.coiled - 0.04 && t < A.strike) {
    const w = sm((t - (A.coiled - 0.04)) / 0.05);
    k = { ...k, hx: k.hx + 0.2 * shiver(t, 7) * w, hz: k.hz + 0.15 * shiver(t, 8) * w };
  }
  const look = norm(turn([1, 0, 0], 0, k.lp, 0));
  const H: V3 = [k.hx, k.hy, k.hz];
  return { spine: snakeLine(H, look, k.x0, 0, k.bend), look, gape: k.gape, tongue: 0, slide: 0, hy: 0, hp: -k.lp };
}
export function snakePose(which: string, t: number): SnakePose {
  return which === 'stand' ? snakeStand(t) : which === 'walk' ? snakeMove(t) : snakeAttack(t);
}

// =============================================================================================
// THE HAWK AND THE BAT: wings

export interface WingPose {
  /** The body's middle (from its floor point), and how it is turned: tipped nose down, rolled, turned to the left. */
  at: V3;
  pitch: number;
  roll: number;
  yaw: number;
  /** Each wing (its left, its right): raised (degrees up from level), swept back (degrees), folded at the wrist (0 spread to 1 folded), its hand bent down (degrees). */
  lift: readonly [number, number];
  sweep: number;
  fold: number;
  droop: number;
  /** Its tail fanned (0 to 1) and tipped down (degrees); its legs thrown forward (0 tucked to 1), its talons or claws open (0 to 1). */
  fan: number;
  tailDown: number;
  legs: number;
  open: number;
  /** Its head on its body: turned, tipped down; its beak or jaw open; its ears (the bat's) laid back. */
  hy: number;
  hp: number;
  gape: number;
  ears: number;
}
/** How high each flies, standing (its body's middle). */
export const FLY_HIGH = { hawk: 31, bat: 27 } as const;
/**
 * THE TWO THAT FLY ARE TURNED TOWARD YOU (his pick, 30 Oct: “Fix the hawk and bat (Recommended)”, offered as: wings
 * spread wide toward you from in front): in every move they keep their body turned this far to their right (degrees),
 * three-quarters to the eye rather than flying across it, so that from in front both wings are spread broadside, the
 * face, beak and tail fan to be seen, and from behind the whole back and both wings. Their bodies are held level, a
 * little nose-down (a hawk hanging on the wind looking down at its prey), so that the eye in front looks onto the tops
 * of their wings, as the eye behind does. Each turns to face its prey as it winds up its attack, and back as it winds down.
 */
export const FLY_FACE = { hawk: -38, bat: -38 } as const;

/** A wing beat: its downstroke quick and strong, its upstroke lighter, the wrist folding a little on the way up. `ph` 0 to 1. */
function beat(ph: number, top: number, bottom: number): { lift: number; fold: number; sweep: number } {
  const a = TAU * ph;
  // (down from 0 to 0.45 of the beat, up from there)
  const s = ph < 0.45 ? Math.cos((Math.PI * ph) / 0.45) : -Math.cos((Math.PI * (ph - 0.45)) / 0.55);
  const lift = mix(bottom, top, (s + 1) / 2);
  const fold = ph < 0.45 ? 0.05 : 0.35 * Math.sin((Math.PI * (ph - 0.45)) / 0.55);
  return { lift, fold, sweep: 6 * Math.sin(a) };
}

/** THE HAWK HOVERING by him: its body tipped up, quick beats holding it on the air, its tail fanned and working, its head dead still and looking; now and then it looks round at him. THE BAT FLUTTERING: never still: quick deep beats, its body bobbing and drifting in a small loop. */
function wingStand(k: 'hawk' | 'bat', t0: number): WingPose {
  const T = COMP_STAND.period;
  const t = fr(t0 / T) * T;
  const a = (TAU * t) / T;
  if (k === 'hawk') {
    // (kiting: hung on the wind by him, its wings spread wide and all but still, working a little; its tail fanned
    // and twisting to hold it there; it rises and sinks on the air; its head dead still, then turned to look at him)
    const look = bump(t, 1.0, 1.7);
    const work = Math.sin(a * 3);
    return { at: [0.7 * Math.sin(a), 0.5 * Math.sin(a * 2), FLY_HIGH.hawk + 1.2 * Math.sin(a) + 0.3 * Math.sin(a * 4)], pitch: 7 + 3 * Math.sin(a), roll: 4 * Math.sin(a + 0.6), yaw: FLY_FACE.hawk, lift: [12 + 5 * work, 12 + 5 * work], sweep: -4 + 3 * Math.sin(a * 2), fold: 0.05 + 0.05 * Math.sin(a * 3 + 1), droop: 8 + 3 * work, fan: 0.9, tailDown: 16 + 6 * Math.sin(a * 3), legs: 0.1, open: 0.2, hy: 30 * look, hp: 30 - 10 * look, gape: 0, ears: 0 };
  }
  const b0 = beat(fr(t / 0.4 + 0.225), 22, -4);
  const b = { ...b0, fold: b0.fold * 0.3, sweep: b0.sweep * 0.4 };
  return { at: [0.7 * Math.sin(a), 0.6 * Math.sin(a * 2), FLY_HIGH.bat + 1.0 * Math.sin(a * 2 + 1) + 0.6 * Math.sin(TAU * fr(t / 0.4) + 1)], pitch: 6 + 3 * Math.sin(a * 2), roll: 3 * Math.sin(a), yaw: FLY_FACE.bat + 3 * Math.sin(a + 1), lift: [b.lift, b.lift], sweep: b.sweep, fold: b.fold, droop: 5, fan: 0.5, tailDown: 0, legs: 0.2, open: 0, hy: 14 * Math.sin(a * 2), hp: 10, gape: 0, ears: 0.2 * Math.sin(a * 4) };
}
/** THE HAWK FLYING: level and fast, two deep beats and a glide in each turn, its tail closed, its head steady. THE BAT FLYING: quick beats, pitched into its flight, jinking from side to side. */
function wingMove(k: 'hawk' | 'bat', t: number): WingPose {
  const P = COMP_GAIT[k].period;
  const ph = fr(t / P);
  const a = TAU * ph;
  if (k === 'hawk') {
    // (two beats in 0.4 of the turn... and a glide, its wings held a little up)
    const flap = ph < 0.6;
    // (the glide: its wings let down level from the top of the beat, held, and lifted again for the next)
    const g = ph < 0.75 ? mix(36, 12, sm((ph - 0.6) / 0.15)) : ph < 0.86 ? 12 : mix(12, 36, sm((ph - 0.86) / 0.14));
    const b = flap ? beat(ph / 0.6, 36, -2) : { lift: g, fold: 0.05, sweep: 0 };
    return { at: [0, 0, FLY_HIGH.hawk - 1 + (flap ? 0.8 * Math.sin(TAU * ph / 0.6) : 0.8 * Math.sin(TAU * (ph - 0.6) / 0.8))], pitch: 5, roll: 2 * Math.sin(a), yaw: FLY_FACE.hawk, lift: [b.lift, b.lift], sweep: b.sweep + 2, fold: b.fold, droop: 4, fan: 0.15, tailDown: 4, legs: 0, open: 0, hy: 0, hp: 18, gape: 0, ears: 0 };
  }
  const b0 = beat(fr(ph + 0.225), 22, -4);
  const b = { ...b0, fold: b0.fold * 0.3, sweep: b0.sweep * 0.4 };
  return { at: [0, 0.8 * Math.sin(a), FLY_HIGH.bat - 1 + 1.0 * Math.sin(a + 1)], pitch: 5, roll: 4 * Math.sin(a), yaw: FLY_FACE.bat + 4 * Math.sin(a), lift: [b.lift, b.lift], sweep: b.sweep + 4, fold: b.fold, droop: 4, fan: 0.3, tailDown: 0, legs: 0, open: 0, hy: 0, hp: 18, gape: 0, ears: 0.6 };
}
/**
 * THE HAWK'S STOOP (its gift, Precise: it marks its prey, his next hit on it a sure critical). It climbs and rears back,
 * its wings mantled high over it, its head down and fixed on its prey (the warning, held); THE STRIKE: it folds and
 * drops, and its talons are flung forward and strike (`hit`); it brakes, wings thrown wide, and beats back up to its
 * place by him.
 * THE BAT'S SWOOP (its gift, Leeching: its bite heals him): it flits up and back and hangs there, its wings spread wide
 * and its jaws open (the warning); THE STRIKE: it drops on its prey, wings swept back, and bites (`hit`); it clings,
 * wings wrapped forward, as what it draws off rises from the bite; and flutters back up.
 */
function wingAttack(k: 'hawk' | 'bat', t: number): WingPose {
  const A = COMP_ATTACK;
  const S0 = wingStand(k, 0);
  type K = { x: number; z: number; pitch: number; lift: number; sweep: number; fold: number; legs: number; open: number; hp: number; gape: number; fan: number; tailDown: number };
  const K0: K = { x: S0.at[0], z: S0.at[2], pitch: S0.pitch, lift: S0.lift[0], sweep: S0.sweep, fold: S0.fold, legs: S0.legs, open: S0.open, hp: S0.hp, gape: S0.gape, fan: S0.fan, tailDown: S0.tailDown };
  const hawk = k === 'hawk';
  const H = FLY_HIGH[k];
  let keys: [number, K, Ease][];
  if (hawk) {
    const MANTLE: K = { x: -4, z: H + 6, pitch: -58, lift: 72, sweep: -4, fold: 0.15, legs: 0.15, open: 0.4, hp: 62, gape: 0.4, fan: 1, tailDown: 30 };
    const STRIKE: K = { x: 14, z: H - 19, pitch: 8, lift: 30, sweep: 40, fold: 0.6, legs: 1, open: 0.05, hp: 30, gape: 0.6, fan: 0.6, tailDown: 25 };
    const DROP: K = { ...midK(MANTLE, STRIKE), fold: 0.7, sweep: 45 };
    const BRAKE: K = { x: 20.5, z: H - 22.5, pitch: -30, lift: 40, sweep: -22, fold: 0, legs: 1, open: 0, hp: 40, gape: 0.5, fan: 1, tailDown: 40 };
    const RISE: K = { x: 6, z: H - 6, pitch: -40, lift: 10, sweep: -6, fold: 0.1, legs: 0.3, open: 0.2, hp: 40, gape: 0, fan: 0.9, tailDown: 25 };
    keys = [
      [0, K0, sm],
      [A.coiled, MANTLE, sm],
      [A.strike, MANTLE, sm],
      [A.strike + 1 / 30, DROP, easeIn],
      [A.hit, STRIKE, (v) => v],
      [A.through, BRAKE, easeOut],
      [0.67, RISE, (v) => v],
      [A.long, K0, easeOut],
    ];
  } else {
    const HANG: K = { x: -3, z: H + 5, pitch: -40, lift: 70, sweep: -10, fold: 0, legs: 0.3, open: 0.6, hp: 28, gape: 1, fan: 0.6, tailDown: 0 };
    const BITE: K = { x: 13.5, z: H - 15, pitch: 22, lift: 18, sweep: 35, fold: 0.45, legs: 0.6, open: 0.6, hp: 22, gape: 0.1, fan: 0.4, tailDown: 0 };
    const DIVE: K = { ...midK(HANG, BITE), gape: 0.9 };
    const CLING: K = { x: 19.5, z: H - 17.5, pitch: 18, lift: 4, sweep: -24, fold: 0.2, legs: 0.8, open: 0.2, hp: 26, gape: 0.1, fan: 0.4, tailDown: 0 };
    const UP: K = { x: 5, z: H - 4, pitch: -30, lift: 50, sweep: 0, fold: 0.1, legs: 0.3, open: 0, hp: 12, gape: 0, fan: 0.5, tailDown: 0 };
    keys = [
      [0, K0, sm],
      [A.coiled, HANG, sm],
      [A.strike, HANG, sm],
      [A.strike + 1 / 30, DIVE, easeIn],
      [A.hit, BITE, (v) => v],
      [A.through, CLING, easeOut],
      [0.67, UP, sm],
      [A.long, K0, sm],
    ];
  }
  let kk = keyed(t, keys);
  // (the warning: hung on the air, its wings working a little to hold it there)
  if (t > A.coiled - 0.04 && t < A.strike) {
    const w = sm((t - (A.coiled - 0.04)) / 0.05);
    kk = { ...kk, z: kk.z + 0.25 * shiver(t, 9) * w, lift: kk.lift + 4 * Math.sin(t * 70) * w };
  }
  // (on the way back up after its blow, its wings beat again, into its stand's beat)
  if (t > 0.58 && t < 0.78) {
    const w = bump(t, 0.58, 0.78);
    const b = beat(fr((t - 0.58) / 0.2), hawk ? 58 : 46, hawk ? 0 : 14);
    kk = { ...kk, lift: mix(kk.lift, b.lift, (hawk ? 0.5 : 0.3) * w) };
  }
  const toPrey = t < 0.4 ? sm(t / A.coiled) : 1 - sm((t - 0.6) / (A.long - 0.6));
  return { ...S0, at: [kk.x, 0, kk.z], pitch: kk.pitch, roll: 0, yaw: S0.yaw * (1 - toPrey), lift: [kk.lift, kk.lift], sweep: kk.sweep, fold: kk.fold, legs: kk.legs, open: kk.open, hp: kk.hp, hy: 0, gape: kk.gape, fan: kk.fan, tailDown: kk.tailDown };
}
export function wingPose(k: 'hawk' | 'bat', which: string, t: number): WingPose {
  return which === 'stand' ? wingStand(k, t) : which === 'walk' ? wingMove(k, t) : wingAttack(k, t);
}
/** A steady number from 0 to 1 for a seed (the same every time). */
export function hash01(i: number, k: number): number {
  const x = Math.sin(i * 127.1 + k * 311.7) * 43758.5453;
  return x - Math.floor(x);
}
