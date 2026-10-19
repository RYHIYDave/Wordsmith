// FLOOR 11'S MUTE WATCH HOUNDS (the art chat for floors 11 to 15, 18 Oct 2026). A MOCK-UP: NOT IN THE GAME. Nothing
// of the game imports this file; `HOUNDS_ON` is off.
//
// His picks for floor 11's monsters, 18 Oct: “Mute watch hounds”, with the Hushed townsfolk, the Hushed watch and the
// Silent Order scribes. Then, at 21:24 Pacific: “Hey go without my say so.  If something is shit I’ll get it to it but
// you’re doing a great jobs. At least for 11-15”. So their brief was settled here, the picks this chat would have
// marked recommended, and he was sent it with their pictures: the watch's own dogs, Hushed with them; the Silent
// Order's black gag wound round their muzzles, so that they make no sound; fast, in packs at the watch's heels; they
// crouch, tremble and pounce, forepaws slamming down on you; and as they die the gag slips off, they throw their
// heads back in one howl that makes no sound, the Hush pouring up out of them, and lie down on their side: dogs again.
// And his words of that afternoon on the act's enemies (“I’d like no not reuse any enemies from the previous act”; “So
// some of the new enemies can be used throughout the next 10 levels.”; “But let’s keep the acts separate”): the city's
// own, and nothing of Act 1's (no fog, no wolf: a solid, short-coated watchdog with a collar).
//
// WHAT THEY ARE: big lean hounds of the city watch, mastiff-headed, deep in the chest and tucked at the belly,
// short-coated, brindled dark grey and brown (drained, as the Hushed are), paler at the throat; cropped ears; a whip
// tail; the watch's studded leather collar with a brass tag. THEIR MARK: the Order's black gag wound round and round
// the muzzle and knotted at the nape, its ends hanging; grey breath seeping out round it; the cult's dull pink in their
// eyes. Back about the knight's hip. The enemy's pink edge round them while they live. Nothing cyan.
//
// NOT ON THE HEROES' BONES: painted from their own solids, as Act 1's deer and wolves are, in the same painter.

import type { Px, Sprite } from '../engine/px';
import { HUSH } from './crier';
import { BREATH_PALE } from './hushed';
import { hash, lazyFrames, toSprite } from './kit';
import type { Painted, Ramp } from './kit';
import { ENEMY_RIM, FLAME } from './mkit';
import { TILE3, paintBits } from './new_mobs3';
import type { ActorArt, AnimSet, Clip } from './actor_types';
import type { Bit, Put } from './new_mobs3';
import type { Skin } from './skin';
import { stage } from './skin';
import type { GameView, Stage } from './skin';
import type { V3 } from './skeleton';

/** THE SWITCH, OFF: nothing of the game reads this file. */
export const HOUNDS_ON = { on: false };

const cl01 = (v: number): number => Math.max(0, Math.min(1, v));
const fr = (t: number): number => t - Math.floor(t);
const D = Math.PI / 180;
const add = (a: V3, b: V3): V3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const sub = (a: V3, b: V3): V3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const mul = (a: V3, k: number): V3 => [a[0] * k, a[1] * k, a[2] * k];
const len = (a: V3): number => Math.hypot(a[0], a[1], a[2]);
const norm = (a: V3, or: V3 = [0, 0, 1]): V3 => {
  const l = len(a);
  return l > 1e-9 ? mul(a, 1 / l) : or;
};
const dot = (a: V3, b: V3): number => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const cross = (a: V3, b: V3): V3 => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const lerpV = (a: V3, b: V3, s: number): V3 => [a[0] + (b[0] - a[0]) * s, a[1] + (b[1] - a[1]) * s, a[2] + (b[2] - a[2]) * s];
const sm = (v: number): number => {
  const c = cl01(v);
  return c * c * (3 - 2 * c);
};
const bump = (t: number, a: number, b: number): number => (t <= a || t >= b ? 0 : Math.pow(Math.sin((Math.PI * (t - a)) / (b - a)), 2));

// ---------------------------------------------------------------------------------------------
// THEIR COLOURS: a brindled coat, drained; a paler throat; the collar's leather and iron studs and brass tag; the
// Order's black gag; their eyes the cult's dull pink (FLAME). Nothing cyan.

const COAT: Ramp = ['#16120f', '#2a221d', '#463a31', '#62544a', '#7a6c60'];
/** The brindle's darker stripes. */
const STRIPE: Ramp = ['#0e0b09', '#1a1512', '#2a221c', '#3a3028', '#4a3e34'];
const THROAT: Ramp = ['#2a2420', '#463c36', '#6e625a', '#8e8278', '#a89c90'];
const NOSE: Ramp = ['#08070a', '#08070a', '#16121a', '#262028', '#342c36'];
const PAD: Ramp = ['#0e0b0c', '#1a1416', '#2a2224', '#3a3034', '#4a3e42'];
const LEATHER: Ramp = ['#1a120e', '#1a120e', '#3e2c20', '#56402e', '#56402e'];
const IRON: Ramp = ['#1a1c22', '#1a1c22', '#464b55', '#6e7480', '#6e7480'];
const BRASS: Ramp = ['#2a1e08', '#2a1e08', '#7a5e22', '#a88a3a', '#a88a3a'];
const GAG: Ramp = ['#060508', '#060508', '#17141d', '#26212e', '#26212e'];
const MOUTH = '#1c1216';

// ---------------------------------------------------------------------------------------------
// THEIR BODY, in picture units (the knight stands 58 high). x forward, y to its left, z up; its own frame has its floor
// point under its middle at the origin. Its back about the knight's hip.

const PIVOT: V3 = [0, 0, 23];
/** Its feet at rest, on the floor: its right fore, left fore, right hind, left hind. */
export const HOUND_FEET: V3[] = [
  [10, -3.8, 0],
  [10, 3.8, 0],
  [-14, -4.0, 0],
  [-14, 4.0, 0],
];
/** Where each leg leaves its body: the shoulder, the hip. */
const LEG_TOP: V3[] = [
  [10.5, -4.0, 21.5],
  [10.5, 4.0, 21.5],
  [-13, -4.2, 23.5],
  [-13, 4.2, 23.5],
];
/** Its upper legs: the foreleg's upper arm and forearm, the hind leg's thigh and shank. */
const FORE_UPPER = [7.5, 11];
const HIND_UPPER = [9, 9.5];
/** Its lower leg, rigid from the foot up: the wrist (front) or the hock (hind). */
const FORE_WRIST: V3 = [0.6, 0, 4.2];
const HIND_HOCK: V3 = [-2.6, 0, 7.8];
const NECK_ROOT: V3 = [14, 0, 26.5];
const NECK_LONG = 9;
const NECK_REST: V3 = [10, 0, 8];
const SKULL_PITCH = 18;

// ---------------------------------------------------------------------------------------------
// THEIR TIMES (seconds)

/** Their stand: fifteen frames a second, a loop of 2.4 s: restless, panting under the gag, looking round. */
export const HOUND_STAND = { frames: 36, fps: 15, period: 2.4 } as const;
/** In its stand: its head turned to look (and back), its ears pricked, a shake of its head at the gag. */
export const HOUND_HABITS = { look: [0.3, 1.1], prick: [1.2, 1.5], shake: [1.6, 2.0] } as const;
/** The canvas it is painted on, and its floor point on it. */
export const HOUND_CANVAS = { w: 200, h: 150, ax: 96, ay: 112 };
const HOUND_AURA = { x: HOUND_CANVAS.ax, y: HOUND_CANVAS.ay - 18, r: 30, color: '#ff3a78', a: 0.08 };
/** How fast it goes (tiles a second): fast, in packs at the watch's heels. Its lope is painted for it, so each foot down stays on its spot. */
export const HOUND_PACE = 2.4;
/** Its lope: sixteen frames a second, a round of 0.5 s. */
export const HOUND_WALK = { frames: 8, fps: 16, period: 0.5 } as const;
/** Its pounce: it crouches, held trembling (the warning) from `warn` to `spring`; it springs and its forepaws slam down `reach` before them at `hit`, held a tenth (`freeze`); it pushes itself back and settles. */
export const HOUND_POUNCE = { long: 1.2, warn: 0.2, spring: 0.42, hit: 0.6, freeze: 0.1, reach: 20, fps: 30 } as const;
/** Struck: held a moment, knocked back, its head snapped round, the Hush coughed out round the gag. */
export const HOUND_REEL = { long: 0.45, freeze: 0.05, fps: 30 } as const;
/** Its death: held as the blow lands; it shakes its head and the gag slips off (`slip`); it throws its head back in one howl that makes no sound (`howl`), the Hush pouring out; its legs fold (`fold`) and it lies down on its side (`down`); still from `still`. */
export const HOUND_DIE = { long: 2.0, freeze: 0.1, slip: [0.14, 0.42], howl: [0.46, 1.0], fold: 1.0, down: 1.55, still: 1.7, fps: 30 } as const;

// ---------------------------------------------------------------------------------------------
// ITS POSES

interface HoundPose {
  x: number;
  y: number;
  z: number;
  yaw: number;
  pitch: number;
  roll: number;
  neck: number;
  head: [number, number, number];
  ears: number;
  tail: number;
  gape: number;
  feet: V3[];
  fold: number[];
  breath: number;
  eyes: number;
  alive: boolean;
  /** The gag: 0 wound on its muzzle; past 0, slipping off and flung away (seconds since it came off, as 1 + those). */
  gag: number;
  /** How hard the Hush seeps out of it (0 to 1), and the great breath of it as it leaves (seconds into it; below 0, none). */
  seep: number;
  leave: number;
  drag: V3;
}
const REST: HoundPose = { x: 0, y: 0, z: 0, yaw: 0, pitch: 0, roll: 0, neck: 0, head: [0, 0, 0], ears: 0, tail: 0, gape: 0, feet: HOUND_FEET, fold: [0, 0, 0, 0], breath: 0, eyes: 1, alive: true, gag: 0, seep: 0.4, leave: -1, drag: [0, 0, 0] };

/** Its stand: restless: panting under the gag, its sides heaving; it turns its head to look and back; its ears prick; it shakes its head at the gag; its tail stiff and low, twitching. Its feet stay where they stand. */
function standPose(t0: number): HoundPose {
  const T = HOUND_STAND.period;
  const t = fr(t0 / T) * T;
  const a = (Math.PI * 2 * t) / T;
  const pant = Math.sin(a * 6);
  const look = bump(t, HOUND_HABITS.look[0], HOUND_HABITS.look[1]);
  const prick = bump(t, HOUND_HABITS.prick[0], HOUND_HABITS.prick[1]);
  const shake = bump(t, HOUND_HABITS.shake[0], HOUND_HABITS.shake[1]) * Math.sin((t - HOUND_HABITS.shake[0]) * 50);
  return {
    ...REST,
    y: 0.4 * Math.sin(a),
    z: 0.35 * pant,
    roll: 0.8 * Math.sin(a) + 3 * shake,
    pitch: 0.6 * Math.sin(a + 1),
    yaw: 1.2 * Math.sin(a + 0.5),
    neck: 2 * Math.sin(a) - 4 * prick,
    head: [26 * look + 14 * shake, -4 * prick + 2 * Math.sin(a * 2), 10 * shake],
    ears: 30 * prick - 10 * look,
    tail: 6 * Math.sin(a * 3),
    breath: pant,
    eyes: 1 + 0.3 * look,
    seep: 0.4 + 0.3 * Math.max(0, pant),
  };
}

const STAND0 = standPose(0);
const easeOut = (v: number): number => 1 - Math.pow(1 - cl01(v), 2);
const swell = (v: number): number => {
  const c = cl01(v);
  return sm(c) + 0.3 * Math.pow(Math.sin(Math.PI * c), 2) * c;
};
interface Key {
  x: number;
  z: number;
  pitch: number;
  roll: number;
  yaw: number;
  neck: number;
  hy: number;
  hp: number;
  hr: number;
  ears: number;
  eyes: number;
  tail: number;
  gape: number;
}
const K0: Key = { x: STAND0.x, z: STAND0.z, pitch: STAND0.pitch, roll: STAND0.roll, yaw: STAND0.yaw, neck: STAND0.neck, hy: STAND0.head[0], hp: STAND0.head[1], hr: STAND0.head[2], ears: STAND0.ears, eyes: STAND0.eyes, tail: STAND0.tail, gape: 0 };
const keyed = (k: Partial<Key>): Key => ({ ...K0, ...k });
function mixKey(a: Key, b: Key, k: number): Key {
  const o = { ...a };
  for (const f of Object.keys(a) as (keyof Key)[]) o[f] = a[f] + (b[f] - a[f]) * k;
  return o;
}
function along(t: number, keys: [number, Key, (v: number) => number][]): Key {
  if (t <= keys[0][0]) return keys[0][1];
  for (let i = 1; i < keys.length; i++) {
    const [t1, k1, ease] = keys[i];
    const [t0, k0] = keys[i - 1];
    if (t < t1) return mixKey(k0, k1, ease((t - t0) / (t1 - t0)));
  }
  return keys[keys.length - 1][1];
}
function fromKey(K: Key, feet: V3[] = HOUND_FEET, fold: number[] = [0, 0, 0, 0]): HoundPose {
  return { ...STAND0, x: K.x, y: 0, z: K.z, pitch: K.pitch, roll: K.roll, yaw: K.yaw, neck: K.neck, head: [K.hy, K.hp, K.hr], ears: K.ears, eyes: K.eyes, tail: K.tail, gape: K.gape, feet: feet.map((f) => f), fold: fold.slice() };
}
const shiver = (t: number, k: number): Partial<Key> => ({ hy: 1.6 * Math.sin(t * 170) * k, x: 0.5 * Math.sin(t * 130) * k, z: 0.6 * Math.sin(t * 190 + 2) * k, roll: 1.6 * Math.sin(t * 150 + 1) * k });
const plus = (K: Key, d: Partial<Key>): Key => {
  const o = { ...K };
  for (const f of Object.keys(d) as (keyof Key)[]) o[f] += d[f] ?? 0;
  return o;
};

// --- ITS LOPE ---
/** Each foot's share of the round on the floor, and when each comes down (a rotary lope: hind, hind, fore, fore, then a moment in the air). */
const LOPE_DUTY = [0.36, 0.36, 0.36, 0.36];
const LOPE_DOWN = [0.62, 0.5, 0.12, 0.0];
function lopeFoot(i: number, ph: number): { foot: V3; fold: number } {
  const r = HOUND_FEET[i];
  const front = i < 2;
  const duty = LOPE_DUTY[i];
  const span = HOUND_PACE * TILE3 * HOUND_WALK.period;
  const half = (span * duty) / 2;
  const u = fr(ph - LOPE_DOWN[i]);
  if (u < duty) return { foot: [r[0] + half - span * u, r[1], 0], fold: 0 };
  const v = (u - duty) / (1 - duty);
  const up = front ? 7 : 5.5;
  return { foot: [r[0] - half + 2 * half * sm(v), r[1], up * Math.sin(Math.PI * v)], fold: (front ? 80 : 40) * Math.sin(Math.PI * v) };
}
/** Its lope: fast and low, its back flexing, its head held level and forward, rising and dipping with each bound. */
function lopePose(t: number): HoundPose {
  const ph = fr(t / HOUND_WALK.period);
  const a = Math.PI * 2 * ph;
  const fs = [0, 1, 2, 3].map((i) => lopeFoot(i, ph));
  return {
    ...STAND0,
    x: 0,
    y: 0.4 * Math.sin(a),
    z: 1.6 * Math.sin(a + 0.6) - 0.6,
    yaw: 1.2 * Math.sin(a),
    pitch: 4.5 * Math.sin(a + 1.2),
    roll: 1.4 * Math.sin(a),
    neck: 10 - 4 * Math.sin(a + 1.2),
    head: [2 * Math.sin(a), -8 - 3 * Math.sin(a + 0.3), 0],
    ears: -25,
    tail: 10 + 8 * Math.sin(a * 2),
    gape: 0,
    feet: fs.map((f) => f.foot),
    fold: fs.map((f) => f.fold),
    breath: Math.sin(2 * a),
    eyes: 1.2,
    seep: 0.7,
  };
}

// --- ITS POUNCE ---
const P_CROUCH = keyed({ x: -3.5, z: -4.2, pitch: 4, neck: 16, hp: 8, hy: 0, ears: -40, eyes: 1.7, tail: 6 });
const P_SPRING = keyed({ x: 6.5, z: 5, pitch: -6, neck: 6, hp: 2, hy: 0, ears: -50, eyes: 1.9, tail: 30 });
const P_SLAM = keyed({ x: 9.5, z: -2.6, pitch: 8, neck: 16, hp: 12, hy: 4, hr: 4, ears: -45, eyes: 2, tail: 24 });
const P_PUSH = keyed({ x: 2.5, z: 0.4, pitch: -4, neck: 4, hp: -4, ears: -20, eyes: 1.5, tail: 10 });
/** The pounce's own clock: stopped through the freeze as its blow lands, and running on after it. */
function pounceClock(t: number): number {
  const P = HOUND_POUNCE;
  return t < P.hit ? t : t < P.hit + P.freeze ? P.hit : t - P.freeze;
}
/** Where its forefeet are in the pounce: down on their spots; lifted as it springs; down `reach` on, slammed; lifted and stepped back after. */
function pounceFoot(i: number, tt: number): { foot: V3; fold: number } {
  const P = HOUND_POUNCE;
  const r = HOUND_FEET[i];
  const end = P.long - P.freeze;
  const ahead: V3 = [r[0] + P.reach, r[1], 0];
  if (tt <= P.spring) return { foot: r, fold: 0 };
  if (tt < P.hit) {
    const v = (tt - P.spring) / (P.hit - P.spring);
    const g = Math.pow(v, 1.4);
    return { foot: [r[0] + P.reach * g, r[1], 13 * Math.sin(Math.PI * Math.pow(v, 0.8))], fold: 80 * Math.sin(Math.PI * v) };
  }
  const back0 = 0.78 + (i === 0 ? 0 : 0.06);
  const back1 = back0 + 0.16;
  if (tt < back0) return { foot: ahead, fold: 0 };
  if (tt < back1) {
    const v = (tt - back0) / (back1 - back0);
    return { foot: [ahead[0] - P.reach * sm(v), r[1], 4 * Math.sin(Math.PI * v)], fold: 50 * Math.sin(Math.PI * v) };
  }
  void end;
  return { foot: r, fold: 0 };
}
/** Its pounce: it crouches, its haunches bunched, its head low, and holds there trembling (the warning); it springs, its forepaws reaching, and slams them down before it (`hit`), its gagged muzzle driven down after them; held; it pushes itself back up off them, steps back, and settles. Its hind feet stay where they stand. */
function pouncePose(t: number): HoundPose {
  const P = HOUND_POUNCE;
  const tt = pounceClock(t);
  const end = P.long - P.freeze;
  let K = along(tt, [
    [0, K0, sm],
    [P.warn, P_CROUCH, swell],
    [P.spring, P_CROUCH, sm],
    [0.53, P_SPRING, sm],
    [P.hit, P_SLAM, (v) => Math.pow(cl01(v), 1.5)],
    [0.8, P_SLAM, sm],
    [0.98, P_PUSH, sm],
    [end, K0, swell],
  ]);
  if (tt > P.warn && tt < P.spring) K = plus(K, shiver(tt, sm((tt - P.warn) / 0.05)));
  const fs = [0, 1].map((i) => pounceFoot(i, tt));
  const P2 = fromKey(K, [fs[0].foot, fs[1].foot, HOUND_FEET[2], HOUND_FEET[3]], [fs[0].fold, fs[1].fold, 0, 0]);
  P2.seep = tt > P.warn && tt < P.hit + 0.2 ? 1 : 0.5;
  return P2;
}

// --- STRUCK ---
function reelPose(t: number): HoundPose {
  const R = HOUND_REEL;
  if (t < R.freeze) return { ...STAND0, eyes: 1.8 };
  const k = cl01((t - R.freeze) / (R.long - R.freeze));
  const kk = cl01(k / 0.75);
  const arc = Math.sin(Math.PI * (1 - (1 - kk) * (1 - kk)));
  const K = plus(K0, { x: -3 * arc, z: 0.8 * arc, pitch: -4 * arc, roll: 3 * Math.sin(3 * Math.PI * kk) * (1 - kk), neck: -6 * arc, hp: -14 * arc, hy: 18 * arc, hr: 10 * arc, ears: -40 * arc, eyes: 0.6 * (1 - k), tail: -14 * arc });
  const P = fromKey(K);
  P.seep = 0.4 + 1.2 * arc;
  return P;
}

// --- ITS DEATH ---
const D_SHAKE = keyed({ x: -1.5, z: 0.4, pitch: -2, neck: 6, hp: 6, ears: -30, eyes: 1.6 });
const D_HOWL = keyed({ x: -2.5, z: 1.4, pitch: -9, neck: -26, hp: -46, hy: 0, hr: 0, ears: -60, eyes: 1, tail: -18, gape: 1 });
const D_SINK = keyed({ x: -2.5, z: -9, pitch: 2, neck: 14, hp: 16, hy: -10, ears: -10, eyes: 0, tail: -24, gape: 0.4 });
/** Lying on its side: rolled over onto its right, its head on the floor, its legs out. */
const D_DOWN = keyed({ x: -2, z: -14.5, pitch: 0, roll: -72, yaw: 6, neck: 18, hp: 24, hy: -14, hr: -10, ears: 0, eyes: 0, tail: -20, gape: 0.25 });
function deathPose(t: number): HoundPose {
  const Dd = HOUND_DIE;
  if (t < Dd.freeze) return { ...STAND0, alive: false, eyes: 1.8 };
  const tt = Math.min(t, Dd.still);
  let K = along(tt, [
    [Dd.freeze, K0, sm],
    [Dd.slip[0], D_SHAKE, sm],
    [Dd.slip[1], D_SHAKE, sm],
    [0.62, D_HOWL, easeOut],
    [Dd.howl[1], D_HOWL, sm],
    [1.28, D_SINK, sm],
    [Dd.down, D_DOWN, sm],
  ]);
  // (shaking its head, hard, to throw the gag off)
  if (tt > Dd.slip[0] - 0.02 && tt < Dd.slip[1] + 0.04) K = plus(K, { hy: 22 * Math.sin((tt - Dd.slip[0]) * 42) * bump(tt, Dd.slip[0] - 0.02, Dd.slip[1] + 0.04), hr: 12 * Math.sin((tt - Dd.slip[0]) * 42 + 1) * bump(tt, Dd.slip[0] - 0.02, Dd.slip[1] + 0.04) });
  // (its legs fold under it as it sinks, and splay out as it rolls onto its side: off the floor once it lies)
  const sink = sm((tt - Dd.howl[1]) / (Dd.down - Dd.howl[1]));
  const roll = sm((tt - 1.28) / (Dd.down - 1.28));
  const feet = HOUND_FEET.map((f, i) => {
    const front = i < 2;
    // (lying on its right: its legs out before it on the floor beside it, its upper legs (its left) above them)
    const left = f[1] > 0;
    const out: V3 = [f[0] + (front ? 6 : -4), f[1] * 0.4 - 9, left ? 6 : 1.2];
    // (and its paws tucked up off the floor as its legs fold under it)
    const tucked: V3 = [f[0], f[1], 2.4 * sink];
    return roll > 0 ? lerpV(tucked, out, roll) : sink > 0 ? tucked : f;
  });
  const fold = HOUND_FEET.map((_, i) => (i < 2 ? 70 : 30) * sink * (1 - roll));
  const P = fromKey(K, feet, fold);
  P.alive = false;
  P.gag = tt < Dd.slip[0] ? 0 : tt < Dd.slip[1] ? (tt - Dd.slip[0]) / (Dd.slip[1] - Dd.slip[0]) : 1 + (tt - Dd.slip[1]);
  P.eyes = tt < Dd.howl[0] ? 1.8 : Math.max(0, 1.8 * (1 - (tt - Dd.howl[0]) / 0.3));
  P.seep = 0;
  P.leave = tt - Dd.howl[0];
  return P;
}

function basePose(which: string, t: number): HoundPose {
  if (which === 'stand') return standPose(t);
  if (which === 'walk') return lopePose(t);
  if (which === 'attack') return pouncePose(t);
  if (which === 'reel') return reelPose(t);
  return deathPose(t);
}
/** A move's length (its stand and lope: once round). */
export function houndLong(which: string): number {
  return ({ stand: HOUND_STAND.period, walk: HOUND_WALK.period, attack: HOUND_POUNCE.long, reel: HOUND_REEL.long, dying: HOUND_DIE.long } as Record<string, number>)[which];
}
function poseOf(which: string, t: number): HoundPose {
  const P = basePose(which, t);
  // (what hangs from it, the gag's ends and the tag, swings with how it has been moving a tenth of a second before)
  const F = which === 'attack' ? HOUND_POUNCE : null;
  const clock = (u: number): number => (!F || u < F.hit ? u : u < F.hit + F.freeze ? F.hit : u - F.freeze);
  const unclock = (c: number): number => (!F || c <= F.hit ? c : c + F.freeze);
  const before = basePose(which, unclock(clock(t) - 0.1));
  P.drag = sub(worldOf(P, NECK_ROOT), worldOf(before, NECK_ROOT));
  return P;
}

// ---------------------------------------------------------------------------------------------
// ITS PAINTER

function turn(v: V3, yaw: number, pitch: number, roll: number): V3 {
  const cy = Math.cos(yaw * D), sy = Math.sin(yaw * D);
  const cp = Math.cos(pitch * D), sp = Math.sin(pitch * D);
  const cr = Math.cos(roll * D), sr = Math.sin(roll * D);
  const r1: V3 = [v[0], v[1] * cr - v[2] * sr, v[1] * sr + v[2] * cr];
  const r2: V3 = [r1[0] * cp + r1[2] * sp, r1[1], -r1[0] * sp + r1[2] * cp];
  return [r2[0] * cy - r2[1] * sy, r2[0] * sy + r2[1] * cy, r2[2]];
}
function worldOf(P: HoundPose, p: V3): V3 {
  return add(add([P.x, P.y, P.z], PIVOT), turn(sub(p, PIVOT), P.yaw, P.pitch, P.roll));
}
function turned(P: HoundPose, v: V3): V3 {
  return turn(v, P.yaw, P.pitch, P.roll);
}
interface HeadFrame {
  at: V3;
  f: V3;
  l: V3;
  u: V3;
  p: (v: V3) => V3;
}
function headFrame(P: HoundPose): HeadFrame {
  const root = worldOf(P, NECK_ROOT);
  const alongN = turned(P, turn(norm(NECK_REST), 0, P.neck, 0));
  const at = add(root, mul(alongN, NECK_LONG));
  const [hy, hp, hr] = P.head;
  const skull = (v: V3): V3 => turned(P, turn(turn(v, 0, SKULL_PITCH, 0), hy, hp, hr));
  return { at, f: skull([1, 0, 0]), l: skull([0, 1, 0]), u: skull([0, 0, 1]), p: (v) => add(at, skull(v)) };
}
function joint(a: V3, c: V3, l1: number, l2: number, hint: V3): V3 {
  const d0 = sub(c, a);
  const d = Math.max(Math.abs(l1 - l2) + 0.01, Math.min(l1 + l2 - 0.01, len(d0)));
  const n = norm(d0);
  const alongD = (l1 * l1 - l2 * l2 + d * d) / (2 * d);
  const h = Math.sqrt(Math.max(0, l1 * l1 - alongD * alongD));
  const side = norm(sub(hint, mul(n, dot(hint, n))), [0, 0, 1]);
  return add(add(a, mul(n, alongD)), mul(side, h));
}
const lowerOf = (foot: V3, v: V3, fold: number): V3 => add(foot, turn(v, 0, fold, 0));
/** Its brindled coat: dark stripes running round it, broken; paler at its throat and chest below. */
function coat(seed: number, pale = 0): Skin {
  return (u, tone) => {
    if (pale > 0 && u[0] > 0.3 && u[2] < -0.1) return THROAT[tone];
    const s = fr(u[0] * 3.6 + 0.5 * Math.sin(u[2] * 7 + u[1] * 5 + seed) + 0.25 * Math.sin(u[1] * 11 + seed));
    if (s < 0.22) return STRIPE[tone];
    return COAT[tone];
  };
}
const VIEWS = new Map<GameView, V3>();
function eyeOf(view: GameView): V3 {
  let e = VIEWS.get(view);
  if (!e) VIEWS.set(view, (e = stage(view, 0, 0, { w: 2, h: 2 }).eye));
  return e;
}

/** THE HOUND AS SOLIDS. */
function houndBits(P: HoundPose, put: Put, view: GameView, grains: [V3, string, number][], t: number): void {
  const W = (p: V3): V3 => worldOf(P, p);
  const axes = (a: V3, b: V3, c: V3): [V3, V3, V3] => [turned(P, a), turned(P, b), turned(P, c)];
  const breathe = 1 + 0.05 * P.breath;
  // ITS BODY: a deep chest, a tucked belly, a lean haunch
  put('body', 'chest', { k: 'ball', c: W([9, 0, 22]), ax: axes([7.6, 0, 0], [0, 6.0 * breathe, 0], [0, 0, 7.4 * breathe]), skin: coat(3, 1) });
  put('body', 'barrel', { k: 'ball', c: W([-2, 0, 23.4]), ax: axes([11.5, 0, 0], [0, 5.2 * breathe, 0], [0, 0, 5.4]), skin: coat(5) });
  put('haunch', 'haunch', { k: 'ball', c: W([-12.5, 0, 23.6]), ax: axes([6.8, 0, 0], [0, 5.6, 0], [0, 0, 6.4]), skin: coat(7) });
  // its spine's ridge, and its shoulders
  put('body', 'withers', { k: 'ball', c: W([8, 0, 27.6]), ax: axes([6, 0, 0], [0, 4.6, 0], [0, 0, 2.6]), skin: coat(9) });

  // ITS NECK AND HEAD: a thick neck, the watch's studded collar on it; a broad, square, mastiff's head
  const H = headFrame(P);
  const root = W(NECK_ROOT);
  const alongN = norm(sub(H.at, root));
  const nl = turned(P, [0, 1, 0]);
  const nu = norm(cross(alongN, nl));
  put('neck', 'neckroot', { k: 'ball', c: root, ax: axes([5, 0, 0], [0, 4.8, 0], [0, 0, 5.4]), skin: coat(11, 1) });
  put('neck', 'neck', { k: 'ball', c: lerpV(root, H.at, 0.55), ax: [mul(alongN, 5.2), mul(nl, 4.0), mul(nu, 4.2)], skin: coat(13, 1) });
  // the collar, its iron studs, its brass tag hanging at the throat
  const cc = lerpV(root, H.at, 0.42);
  put('collar', 'collar', { k: 'band', ring: { c: cc, u: mul(nu, 4.6), v: mul(nl, 4.4) }, ramp: LEATHER, rows: 2 });
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2 + 0.3;
    put('collar', 'stud', { k: 'ball', c: add(cc, add(mul(nu, Math.cos(a) * 4.9), mul(nl, Math.sin(a) * 4.7))), ax: [[0.6, 0, 0], [0, 0.6, 0], [0, 0, 0.6]], skin: IRON });
  }
  const throat = add(cc, mul(nu, -4.8));
  const tag = add(add(throat, [0, 0, -2.2]), mul(P.drag, -0.6));
  put('collar', 'tag', { k: 'rod', a: throat, b: tag, ra: 0.3, rb: 0.3, ramp: IRON });
  put('collar', 'tag', { k: 'ball', c: tag, ax: [[1.1, 0, 0], [0, 1.1, 0], [0, 0, 1.3]], skin: BRASS });

  put('head', 'cranium', { k: 'ball', c: H.p([0, 0, 0.6]), ax: [mul(H.f, 5.2), mul(H.l, 5.0), mul(H.u, 4.6)], skin: coat(17) });
  // the brow's heavy ridge, and its cheeks
  put('head', 'brow', { k: 'ball', c: H.p([3.0, 0, 3.4]), ax: [mul(H.f, 2.4), mul(H.l, 4.0), mul(H.u, 1.4)], skin: coat(19) });
  // the muzzle: short and broad, square at its end; its nose black
  const m0 = H.p([3.8, 0, -1.8]);
  const m1 = H.p([9.2, 0, -2.4]);
  put('muzzle', 'muzzle', { k: 'rod', a: m0, b: m1, ra: 3.0, rb: 2.7, ramp: STRIPE });
  put('muzzle', 'nose', { k: 'ball', c: H.p([9.8, 0, -1.2]), ax: [mul(H.f, 1.2), mul(H.l, 1.7), mul(H.u, 1.2)], skin: NOSE });
  // its lower jaw, hinged under its ears: shut under the gag; gaping in its howl once the gag is off
  const hinge = H.p([0.6, 0, -3.2]);
  const jawWay = norm(add(mul(H.f, Math.cos(P.gape * 40 * D)), mul(H.u, -Math.sin(P.gape * 40 * D))));
  const jawTip = add(hinge, mul(jawWay, 7.6));
  put('jaw', 'jaw', { k: 'rod', a: hinge, b: jawTip, ra: 2.0, rb: 1.6, ramp: STRIPE });
  if (P.gape > 0.1) {
    // (its mouth open: dark inside, the teeth showing)
    put('jaw', 'mouth', { k: 'ball', c: lerpV(lerpV(m0, m1, 0.6), jawTip, 0.5), ax: [mul(H.f, 2.6), mul(H.l, 1.6), mul(H.u, 1.6 * P.gape)], skin: () => MOUTH });
    for (const s of [1, -1]) put('jaw', 'fang', { k: 'rod', a: add(m1, mul(H.l, s * 1.4)), b: add(add(m1, mul(H.l, s * 1.4)), mul(H.u, -1.6)), ra: 0.45, rb: 0.2, ramp: ['#5e5a52', '#5e5a52', '#bcb6a8', '#dcd6c8', '#dcd6c8'] });
  }
  // its eyes: the cult's dull pink, sunk under its brow (going out as it dies)
  for (const s of [1, -1]) {
    const e = H.p([4.0, s * 2.6, 2.3]);
    if (P.eyes > 0.05) {
      put('head', `eye${s}`, { k: 'dot', p: e, c: FLAME[1], c2: FLAME[2], facing: norm(add(mul(H.l, s * 0.7), H.f)) });
      if (dot(norm(add(mul(H.l, s * 0.7), H.f)), eyeOf(view)) > 0) put('glow', `eyeglow${s}`, { k: 'glow', p: e, c: FLAME[1], r: 4 * Math.min(1.5, P.eyes), a: Math.min(0.45, 0.28 * P.eyes) });
    }
    // its ears: cropped short, pricked or laid back
    const base = H.p([-1.2, s * 3.4, 3.2]);
    const tip = add(base, mul(norm(add(add(mul(H.f, -0.5 - P.ears / 80), mul(H.l, s * 0.5)), mul(H.u, 1 + P.ears / 60))), 4.2));
    put('head', `ear${s}`, { k: 'rod', a: base, b: tip, ra: 1.5, rb: 0.5, ramp: STRIPE });
  }

  // THE ORDER'S GAG: black cloth wound three times round its muzzle, knotted at its nape, the ends hanging; as it dies
  // the gag works loose, slides off its muzzle and is flung away to lie on the floor
  const g = P.gag;
  if (g < 1) {
    const slide = mul(H.f, 6 * sm(g));
    for (let i = 0; i < 3; i++) {
      const c = add(lerpV(m0, m1, 0.15 + 0.35 * i), slide);
      put('gag', 'gag', { k: 'band', ring: { c, u: mul(H.u, 3.4 + 0.6 * g), v: mul(H.l, 3.3 + 0.6 * g) }, ramp: GAG, rows: 2 });
    }
    // the strap over the skull to the knot, while it holds
    if (g < 0.4) {
      const knot = H.p([-3.4, 0, 1.0]);
      put('gag', 'gagstrap', { k: 'rod', a: add(lerpV(m0, m1, 0.15), mul(H.u, 3.0)), b: knot, ra: 0.8, rb: 0.8, ramp: GAG });
      put('gag', 'gagknot', { k: 'ball', c: knot, ax: [[1.3, 0, 0], [0, 1.3, 0], [0, 0, 1.3]], skin: GAG });
      for (const s of [1, -1]) {
        const end = add(add(knot, [0, 0, -4.4]), add(mul(H.l, s * 1.0), mul(P.drag, -1.0)));
        put('gag', 'gagends', { k: 'rod', a: knot, b: end, ra: 0.8, rb: 0.5, ramp: GAG });
      }
    }
  } else {
    // (flung off as it shook its head: arcing away to its left and down, and lying on the floor)
    const s = Math.min(1, (g - 1) / 0.35);
    const from = HOUND_GAG_FROM;
    const to: V3 = [from[0] + 8, from[1] + 14, 1.2];
    const p: V3 = [from[0] + (to[0] - from[0]) * s, from[1] + (to[1] - from[1]) * s, from[2] + (to[2] - from[2]) * s + 10 * s * (1 - s)];
    const spin = s * 2.6;
    const u: V3 = [Math.cos(spin) * 2.8, Math.sin(spin) * 2.8, 0];
    const v: V3 = [-Math.sin(spin) * 2.6, Math.cos(spin) * 2.6, 0];
    for (let i = 0; i < 2; i++) put('gag', 'gag', { k: 'band', ring: { c: add(p, [0.6 * i, 0, 0.5 + 0.3 * i]), u, v }, ramp: GAG, rows: 1 });
    put('gag', 'gagends', { k: 'rod', a: add(p, [0, 0, 0.6]), b: add(p, [-4.5, 2, 0.6]), ra: 0.7, rb: 0.4, ramp: GAG });
  }

  // ITS LEGS: lean, the forelegs straight, the hind legs angled at the hock; broad paws
  P.feet.forEach((foot, i) => {
    const front = i < 2;
    const s = i % 2 === 0 ? -1 : 1;
    const top = W(LEG_TOP[i]);
    const fold = P.fold[i];
    const low = lowerOf(foot, front ? FORE_WRIST : HIND_HOCK, fold);
    const [l1, l2] = front ? FORE_UPPER : HIND_UPPER;
    const mid = joint(top, low, l1, l2, turned(P, front ? [-1, s * 0.1, 0] : [1, s * 0.1, 0]));
    const part = `leg${i}`;
    if (front) {
      put(part, `upper${i}`, { k: 'rod', a: top, b: mid, ra: 3.0, rb: 2.0, ramp: COAT, far: true });
      put(part, `fore${i}`, { k: 'rod', a: mid, b: low, ra: 1.7, rb: 1.3, ramp: COAT, far: true });
    } else {
      put(part, `thigh${i}`, { k: 'rod', a: top, b: mid, ra: 3.6, rb: 2.2, ramp: COAT, far: true });
      put(part, `shank${i}`, { k: 'rod', a: mid, b: low, ra: 1.9, rb: 1.3, ramp: COAT, far: true });
    }
    put(part, `joint${i}`, { k: 'ball', c: low, ax: [[1.4, 0, 0], [0, 1.3, 0], [0, 0, 1.4]], skin: COAT, far: true });
    const pawUp = lowerOf(foot, [0.6, 0, 1.6], fold);
    put(part, `pastern${i}`, { k: 'rod', a: low, b: pawUp, ra: 1.25, rb: 1.2, ramp: COAT, far: true });
    put(part, `paw${i}`, { k: 'ball', c: lowerOf(foot, [1.4, 0, 1.15], fold), ax: [turn([2.4, 0, 0], 0, fold, 0), [0, 1.8, 0], turn([0, 0, 1.15], 0, fold, 0)], skin: (u, tone) => (u[2] < -0.5 ? PAD[tone] : COAT[tone]), far: true });
  });

  // ITS TAIL: a whip, held low and stiff
  const tr = W([-18.5, 0, 25]);
  let tp = tr;
  for (let j = 0; j < 4; j++) {
    const td = turned(P, turn(norm([-0.55, 0, -0.8]), 0, P.tail - 6 * j, 0));
    const nx = add(add(tp, mul(td, 3.2)), mul(P.drag, -0.12 * j));
    put('tail', `tail${j}`, { k: 'rod', a: tp, b: nx, ra: 1.3 - 0.25 * j, rb: 1.05 - 0.25 * j, ramp: COAT });
    tp = nx;
  }

  // THE HUSH SEEPING OUT round the gag (grains, laid after its edge), harder as it pounces; and as it dies, one great
  // grey breath of it out of its open jaws, rising and thinning
  const seepFrom = (k: number): V3 => add(lerpV(m0, m1, 0.55 + 0.35 * k), mul(H.u, -1.2 - 1.6 * k));
  if (P.seep > 0.02 && g < 0.5) {
    const N = Math.round(5 + 10 * P.seep);
    for (let i = 0; i < N; i++) {
      const life = fr(t * (0.9 + 0.6 * P.seep) + i / N + 0.21 * hash(i, 5, 2601));
      if (life > 0.4 + 0.5 * P.seep) continue;
      const side = i % 2 ? 1 : -1;
      const from = add(seepFrom(hash(i, 6, 2601)), mul(H.l, side * 4.2));
      const p = add(from, add(mul(H.l, side * (1.0 + 4 * life)), add(mul(H.f, 0.8 * life), [0, 0, 8 * life])));
      grains.push([p, life < 0.2 ? HUSH[4] : life < 0.45 ? HUSH[3] : HUSH[2], life < 0.14 ? 2 : 1]);
    }
  }
  if (P.leave >= 0 && P.leave < 1.15) {
    const mouth = lerpV(m1, jawTip, 0.5);
    const k = P.leave / 1.15;
    for (let i = 0; i < 40; i++) {
      const born = 0.45 * hash(i, 7, 2603);
      const age = (k - born) / 0.55;
      if (age <= 0 || age >= 1) continue;
      const a = hash(i, 8, 2603) * Math.PI * 2;
      const spread = (1.5 + 9 * Math.sqrt(age)) * (0.5 + 0.5 * hash(i, 9, 2603));
      const up = 3 + 26 * Math.sqrt(age) * (0.6 + 0.4 * hash(i, 10, 2603));
      if (age > 0.8 && hash(i, Math.floor(t * 30), 2605) < (age - 0.8) * 4) continue;
      grains.push([add(mouth, [Math.cos(a) * spread, Math.sin(a) * spread, up]), age < 0.25 ? BREATH_PALE : age < 0.5 ? HUSH[4] : age < 0.75 ? HUSH[3] : HUSH[2], age < 0.6 ? 3 : 2]);
    }
  }
}
/** Where its gag is flung from as it dies (its muzzle, as it shakes it off). */
const HOUND_GAG_FROM: V3 = ((): V3 => {
  const P = basePose('dying', HOUND_DIE.slip[1]);
  const H = headFrame(P);
  return H.p([8, 0, -1.2]);
})();

/** Every solid of one moment of it, as seen from `view`, and the Hush's grains. */
function bitsOf(which: string, t: number, view: GameView): { P: HoundPose; bits: Bit[]; grains: [V3, string, number][] } {
  const P = poseOf(which, t);
  const bits: Bit[] = [];
  const grains: [V3, string, number][] = [];
  houndBits(P, (part, piece, shape) => {
    bits.push({ part, piece, shape });
  }, view, grains, t);
  return { P, bits, grains };
}

/** One frame of the hound: `which` (stand, walk: its lope, attack: its pounce, reel, dying), `t` seconds in, from in front or behind. */
export function houndPainted(which: string, t: number, view: GameView = 'front'): Painted {
  eyeOf(view);
  const { P, bits, grains } = bitsOf(which, t, view);
  const st = stage(view, HOUND_CANVAS.ax, HOUND_CANVAS.ay, HOUND_CANVAS);
  const lights = paintBits(st, bits, worldOf(P, PIVOT));
  const px = st.whole(P.alive ? ENEMY_RIM : null);
  for (const [pt, col, size] of grains) laid(px, st, pt, col, size);
  return { px, lights };
}
function laid(px: Px, st: Stage, p: V3, col: string, size: number): void {
  const [x, y] = st.at(p);
  const xi = Math.round(x - size / 2);
  const yi = Math.round(y - size / 2);
  for (let dy = 0; dy < size; dy++) for (let dx = 0; dx < size; dx++) if (xi + dx >= 0 && yi + dy >= 0 && xi + dx < px.w && yi + dy < px.h) px.set(xi + dx, yi + dy, col);
}
/** Its feet at one moment (for the tests). */
export function houndFeet(which: string, t: number): V3[] {
  return poseOf(which, t).feet;
}
/** The same frame as the game holds a figure. */
export function houndFrame(which: string, t: number, view: GameView = 'front'): Sprite {
  return toSprite(houndPainted(which, t, view), which === 'dying' ? null : HOUND_AURA, HOUND_CANVAS.ax, HOUND_CANVAS.ay);
}
/** Every solid of one moment of it, as the tests read them. */
export function houndSolids(which: string, t: number, view: GameView = 'front'): Bit[] {
  eyeOf(view);
  return bitsOf(which, t, view).bits;
}
/** The Hush's grains at one moment (for the tests). */
export function houndGrains(which: string, t: number): [V3, string, number][] {
  return bitsOf(which, t, 'front').grains;
}

/** THE MUTE WATCH HOUNDS, as the game holds a monster's pictures: their stand, their lope (walk), their pounce (attack), struck, and their death. */
export function makeHoundArt(): ActorArt {
  const set = (view: GameView): AnimSet => {
    const frame = (which: string, t: number): Sprite => houndFrame(which, t, view);
    const clip = (which: string, long: number, fps: number, hit?: number): Clip => {
      const c: Clip = { frames: lazyFrames(Math.round(long * fps) + 1, (i) => frame(which, i / fps)), fps };
      if (hit !== undefined) c.hit = hit;
      return c;
    };
    const attack = clip('attack', HOUND_POUNCE.long, HOUND_POUNCE.fps, HOUND_POUNCE.hit);
    return {
      idle: lazyFrames(HOUND_STAND.frames, (i) => frame('stand', i / HOUND_STAND.fps)),
      walk: lazyFrames(HOUND_WALK.frames, (i) => frame('walk', i / HOUND_WALK.fps)),
      attack: lazyFrames(3, (i) => attack.frames[[12, 16, 19][i]]),
      idleFps: HOUND_STAND.fps,
      walkFps: HOUND_WALK.fps,
      clips: { attack, die: clip('dying', HOUND_DIE.long, HOUND_DIE.fps), reel: clip('reel', HOUND_REEL.long, HOUND_REEL.fps) },
    };
  };
  return { front: set('front'), back: set('back') };
}
