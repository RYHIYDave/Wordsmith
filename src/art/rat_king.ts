// FLOOR 12'S BOSS, THE RAT KING (the art chat for floors 11 to 15, 18 and 19 Oct 2026). A MOCK-UP: NOT IN THE GAME.
// Nothing of the game imports this file; `RAT_KING_ON` is off.
//
// His doc "Wordsmith Act 2: The Hush" (the planning chat's, with his yes as ideas), level 12, THE UNDERCITY; its boss
// THE RAT KING, his floor the King's Cistern: "A knot of rats tied at the tails, swollen on jars it broke into,
// squeaking in a hundred stolen voices." Its moves: "a gnashing bite (its basic attack); Unknot, where it bursts into
// a swarm across the floor and knots back together somewhere else; the Roll, where it balls up and barrels down a
// tunnel; Stolen Words, bolts of fire, frost, lightning or poison that look like your own words." Then, to this chat,
// of floors 11 to 15, 18 Oct, 21:24 Pacific: “Hey go without my say so.  If something is shit I’ll get it to it but
// you’re doing a great jobs. At least for 11-15”. So its brief was settled here, each the pick this chat would have
// marked recommended, and he is sent its pictures and films as they are made:
// - what it is: TEN SWOLLEN SEWER RATS AND THEIR KING, their tails knotted together into one hard lump bound round
//   with the Silent Order's black cord (the Order's leash on it); the King the biggest, on top of the heap, a jar's
//   broken neck of green glass jammed on its head for a crown; all of them bloated on the voices they drank, eyes
//   burning the cult's pink. Not gory: fat, sleek, wet rats.
// - how big: a heap more than two tiles across, its King's head at the knight's chest; heavy and squirming.
// - how it moves: never still, every rat pulling its own way; it scuttles as one, the front ones hauling, the back ones
//   scrabbling backward after.
// - its moves: THE BITE (the front rats rear up, mouths wide, trembling, then the heap surges and they snap down
//   together); UNKNOT (the knot comes loose and the rats burst outward and are gone into the cracks; then they pour
//   back in from every side and knot again); THE ROLL (they curl up tails-in into a ball of rats and roll, fast); STOLEN
//   WORDS (the King rears, every mouth opens, and a stolen word gathers before it and flies: the shape of a hero's own
//   word, fire, frost, lightning or poison, but burning the enemy's pink to gold, never a friend's colour: his rulebook,
//   Colour 3).
// - its death: the King's glass crown knocked off, the Order's cord snapping, the knot coming undone; the stolen voices
//   pour up out of them, pink turning pale as they go free; the rats, thin again, scatter into the cracks; left on the
//   floor, the black cord, the crown, the corks.
// And his words of 18 Oct on the act's enemies (“I’d like no not reuse any enemies from the previous act”; “So some of
// the new enemies can be used throughout the next 10 levels.”; “But let’s keep the acts separate”): nothing of Act 1's
// in it.
//
// NOT ON THE HEROES' BONES: painted from its own solids, as the hounds are (art/hounds.ts), in the same painter.

import type { Px, Sprite } from '../engine/px';
import { hash, lazyFrames, toSprite } from './kit';
import type { Painted, Ramp } from './kit';
import { ENEMY_RIM, FLAME } from './mkit';
import { TILE3, paintBits } from './new_mobs3';
import type { ActorArt, AnimSet, Clip } from './actor_types';
import type { Bit, Put } from './new_mobs3';
import type { Skin } from './skin';
import { stage } from './skin';
import type { GameView } from './skin';
import type { V3 } from './skeleton';

/** THE SWITCH, OFF: nothing of the game reads this file. */
export const RAT_KING_ON = { on: false };

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
const cross = (a: V3, b: V3): V3 => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const dot = (a: V3, b: V3): number => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const lerp = (a: number, b: number, k: number): number => a + (b - a) * k;
const lerpV = (a: V3, b: V3, k: number): V3 => [lerp(a[0], b[0], k), lerp(a[1], b[1], k), lerp(a[2], b[2], k)];
const sm = (v: number): number => {
  const c = cl01(v);
  return c * c * (3 - 2 * c);
};
/** Turn `v` about the upright by `deg`. */
const yawed = (v: V3, deg: number): V3 => {
  const c = Math.cos(deg * D);
  const s = Math.sin(deg * D);
  return [v[0] * c - v[1] * s, v[0] * s + v[1] * c, v[2]];
};
/** Turn `v` about the unit axis `k` by `deg`. */
function about(v: V3, k: V3, deg: number): V3 {
  const c = Math.cos(deg * D);
  const s = Math.sin(deg * D);
  const x = cross(k, v);
  const d = dot(k, v);
  return [v[0] * c + x[0] * s + k[0] * d * (1 - c), v[1] * c + x[1] * s + k[1] * d * (1 - c), v[2] * c + x[2] * s + k[2] * d * (1 - c)];
}

// ---------------------------------------------------------------------------------------------
// ITS COLOURS: sewer rats, sleek and wet; the Order's black; the jars' green glass

/** The fur: a cool grey-brown, wet, dark along the back. */
const FUR: Ramp = ['#141217', '#242026', '#37302f', '#4c433e', '#655a52'];
/** The belly, swollen and paler. */
const BELLY: Ramp = ['#2e2828', '#463e3c', '#605652', '#7a6e66', '#94877c'];
/** Naked skin: tails, ears, paws, a dull mauve-grey (no glow). */
const SKIN: Ramp = ['#2e2226', '#4a3638', '#664c4c', '#806460', '#987a72'];
/** Teeth: a rat's long incisors, yellowed. */
const TEETH: Ramp = ['#4e4838', '#6a6250', '#8c8268', '#aaa084', '#c4bca0'];
/** The nose, dark. */
const NOSE: Ramp = ['#1a1214', '#1a1214', '#2c2024', '#3e2e32', '#3e2e32'];
/** The Silent Order's black cord. */
const CORD: Ramp = ['#060508', '#0c0a10', '#17141d', '#26212e', '#332c3c'];
/** The crown: a jar's broken neck of green glass. */
const GLASS: Ramp = ['#0e1712', '#1a281e', '#2a3e2e', '#3e563c', '#68845e'];
/** Cork, crumbs of it stuck in the knot. */
const CORK: Ramp = ['#382a1c', '#523e28', '#6c5436', '#886c46', '#a4885c'];
const MOUTH = '#1a1014';
/** The stolen voices: the enemy's pink burning to gold (his rulebook, Colour 3). */
const VOICE = FLAME;
/** A voice gone free, pale. */
const FREED = ['#7a7468', '#a49c8c', '#cec6b2', '#e8e2d2', '#f6f2e6'];

// ---------------------------------------------------------------------------------------------
// ITS TIMES AND ITS SIZE

/** Its canvas, and its floor point on it (picture pixels). */
export const RK_CANVAS = { w: 480, h: 340, ax: 240, ay: 236 };
const RK_AURA = { x: RK_CANVAS.ax, y: RK_CANVAS.ay - 40, r: 80, color: '#ff3a78', a: 0.1 };
/** Its stand: a loop of 3.0 s, fifteen frames a second. */
export const RK_STAND = { frames: 45, fps: 15, period: 3.0 } as const;
/** How fast it scuttles (tiles a second), and its scurry: a round of 0.25 s, six frames, painted for that pace. */
export const RK_PACE = 1.2;
export const RK_WALK = { frames: 6, fps: 24, period: 0.25 } as const;
/** THE BITE: bunched back and the front ones rearing (the warning, `warn`), the heap surging, the snap at `hit`, held a tenth. */
export const RK_BITE = { long: 1.36, warn: [0.16, 0.38], hit: 0.66, freeze: 0.1, surge: 14, fps: 30 } as const;
/** Struck. */
export const RK_REEL = { long: 0.4, fps: 30 } as const;
/**
 * THE ROLL: it curls up tails-in into a ball of rats (`curl`, the warning), rolls (a loop, `frames` at `fps`, painted
 * for ROLL_PACE so the ball's skin does not slide on the floor: the game moves it), and uncurls (`uncurl`).
 */
export const RK_ROLL = { curl: 0.7, frames: 24, fps: 30, uncurl: 0.6 } as const;
/** UNKNOT: the knot comes loose and they burst outward and are gone into the cracks (`out`); KNOT: they pour back in and knot again (`in`). */
export const RK_UNKNOT = { out: 0.9, in: 0.95, warn: [0, 0.18], fps: 30 } as const;
/** STOLEN WORDS: the King rears, every mouth opens, a word gathers before it (the warning, `warn`) and flies at `hit`. */
export const RK_WORDS = { long: 1.6, warn: [0.22, 0.84], hit: 0.86, fps: 30 } as const;
/** ITS DEATH: rocked; the crown knocked off (`crown`); the cord snaps (`snap`); the knot comes undone; the voices pour out of them and go free (`voices`); thin again, they scatter (`scatter`) and are gone into the cracks (`gone`); still from `still`. */
export const RK_DIE = { long: 2.8, crown: 0.24, snap: 0.46, voices: [0.5, 2.1], scatter: [1.25, 2.45], gone: [2.0, 2.5], still: 2.5, fps: 30 } as const;

// ---------------------------------------------------------------------------------------------
// ITS RATS

/** One rat as it lies in the heap at rest: its heading round the knot (degrees, 0 its forward), how far out its body is, how high, how pitched, how big. */
interface RatRest {
  a: number;
  r: number;
  z: number;
  pitch: number;
  s: number;
  upper: boolean;
  king: boolean;
  seed: number;
}
/** How big its rats are against a common sewer rat's measure: swollen. */
const SC = 1.6;
/** THE HEAP AT REST: seven on the floor in a ring, three climbing over the knot, and the King on top, facing forward. */
const RATS: RatRest[] = (() => {
  const out: RatRest[] = [];
  const ring = [0, 50, 102, 154, 206, 258, 309];
  ring.forEach((a, i) => out.push({ a: a + (hash(i, 0, 6101) - 0.5) * 10, r: (19 + (hash(i, 1, 6101) - 0.5) * 3) * SC, z: 0, pitch: -4, s: (1 + (hash(i, 2, 6101) - 0.5) * 0.14) * SC, upper: false, king: false, seed: i }));
  [32, 150, 268].forEach((a, i) => out.push({ a, r: 10 * SC, z: 9.5 * SC, pitch: -14, s: 0.94 * SC, upper: true, king: false, seed: 10 + i }));
  out.push({ a: 0, r: 3 * SC, z: 16 * SC, pitch: 10, s: 1.32 * SC, upper: true, king: true, seed: 20 });
  return out;
})();
/** The knot of tails: its middle, how big. */
const KNOT: V3 = [0, 0, 9 * SC];
const KNOT_R = 6.5 * SC;

/** A rat as it is painted at one moment, in the world. */
export interface RatPose {
  /** Its body's middle; its body's way (forward), its left, its up. */
  c: V3;
  f: V3;
  l: V3;
  u: V3;
  s: number;
  /** How swollen (1 as it is; less once its voices have gone out of it). */
  belly: number;
  /** Its head turned from its body's way (degrees), and pitched up. */
  hy: number;
  hp: number;
  /** Its jaws, open (0 to 1); its eyes, burning (0 out). */
  gape: number;
  eyes: number;
  /** Its feet in the world: fore left, fore right, hind left, hind right. */
  feet: V3[];
  /** Where its tail goes into the knot, and how it bows on the way. */
  tailTo: V3;
  tailBow: V3;
  /** Gone into the cracks, 0 to 1 (it shrinks as it goes). */
  gone: number;
  king: boolean;
  seed: number;
}
export interface KingPose {
  rats: RatPose[];
  knot: V3;
  knotR: number;
  /** The Order's cord: round the knot; in the King's teeth (as they scatter and gather again); or snapped and flung, `cordT` seconds since. */
  cord: number;
  cordAt?: 'knot' | 'mouth' | 'snapped';
  cordT?: number;
  /** How much of the knot of tails there is (1 whole; 0 come apart). */
  lump?: number;
  /** Crumbs of cork spilled from the knot, lying on the floor. */
  corks?: V3[];
  /** A stolen word gathering before the King's mouth: where, and how far grown (0 to 1). */
  charge?: { at: V3; k: number } | null;
  /** The crown on the King's head (null when it has fallen: `crownAt` says where it lies). */
  crownAt: V3 | null;
  /** The stolen voices in the air (grains: where, colour, size). */
  grains: [V3, string, number][];
  alive: boolean;
}

/** A body's frame from its heading and pitch (degrees). */
function frameOf(h: number, p: number): [V3, V3, V3] {
  const f: V3 = [Math.cos(h * D) * Math.cos(p * D), Math.sin(h * D) * Math.cos(p * D), Math.sin(p * D)];
  const l: V3 = [-Math.sin(h * D), Math.cos(h * D), 0];
  return [f, l, cross(f, l)];
}

/** Its feet where they rest, in the rat's own frame (forward, left), for a rat of size `s`. */
const FOOT_REST: [number, number][] = [
  [4.2, 2.6],
  [4.2, -2.6],
  [-3.2, 3.0],
  [-3.2, -3.0],
];

/** A rat placed: at heading `a` round the knot, out `r`, up `z` (its body's floor point), pitched, turned on itself by `yaw`. */
function placed(R: RatRest, o: { a?: number; r?: number; z?: number; pitch?: number; yaw?: number; hy?: number; hp?: number; gape?: number; eyes?: number; belly?: number; dx?: number; dy?: number; gone?: number; tailBow?: V3; feet?: V3[] } = {}): RatPose {
  const a = o.a ?? R.a;
  const r = o.r ?? R.r;
  const s = R.s;
  const lift = 3.9 * s;
  // (a rat on the floor rearing up rises on its haunches: its middle lifted as it pitches up, so its rump stays off the floor)
  const rearing = R.upper ? 0 : Math.max(0, Math.sin(((o.pitch ?? R.pitch) - R.pitch) * D)) * 4.8 * s;
  const base: V3 = [Math.cos(a * D) * r + (o.dx ?? 0), Math.sin(a * D) * r + (o.dy ?? 0), (o.z ?? R.z) + rearing];
  const [f, l, u] = frameOf(a + (o.yaw ?? 0), o.pitch ?? R.pitch);
  const c = add(base, mul(u, lift));
  const feet = o.feet ?? FOOT_REST.map(([fx, fy]) => {
    const p = add(add(c, mul(f, fx * s)), mul(l, fy * s));
    return R.upper ? add(p, mul(u, -lift + 0.6)) : [p[0], p[1], 0] as V3;
  });
  const tailTo = add(KNOT, mul([Math.cos(a * D), Math.sin(a * D), 0], KNOT_R * 0.55));
  return { c, f, l, u, s, belly: o.belly ?? 1, hy: o.hy ?? 0, hp: o.hp ?? 0, gape: o.gape ?? 0, eyes: o.eyes ?? 1, feet, tailTo, tailBow: o.tailBow ?? [0, 0, -2], gone: o.gone ?? 0, king: R.king, seed: R.seed };
}

// ---------------------------------------------------------------------------------------------
// ITS MOVES

/** THE STAND: never still. Each rat squirms its own way, its head lifting to sniff and turning; one gnaws at the knot; the King looks round over the heap; their swollen bellies heave. */
function standPose(t0: number): KingPose {
  const T = RK_STAND.period;
  const t = fr(t0 / T) * T;
  const w = (k: number) => (2 * Math.PI * k) / T;
  const rats = RATS.map((R, i) => {
    const ph = R.seed * 1.7;
    const sq = Math.sin(w(1) * t + ph);
    const sniff = Math.max(0, Math.sin(w(3) * t + ph * 2)) ** 2;
    // (two of those on top of the heap gnawing at it, heads down)
    const gnaw = i === 8 || i === 9;
    const hy = R.king ? 40 * Math.sin(w(1) * t) : 28 * Math.sin(w(2) * t + ph);
    const hp = R.king ? 8 + 6 * Math.sin(w(2) * t + 1) : gnaw ? -24 + 6 * Math.sin(w(6) * t) : -6 + 20 * sniff;
    // (a rat on the floor keeps its feet where they are: its body only squirms over them)
    const rest = placed(R);
    return placed(R, {
      a: R.a + 6 * sq,
      r: R.r + 0.8 * Math.sin(w(2) * t + ph),
      pitch: R.pitch + 4 * Math.sin(w(2) * t + ph + 1),
      yaw: (gnaw ? 0 : 10 * Math.sin(w(1) * t + ph + 2)),
      hy,
      hp,
      gape: gnaw ? 0.35 + 0.35 * Math.max(0, Math.sin(w(6) * t)) : R.king ? 0.15 * Math.max(0, Math.sin(w(3) * t)) : 0,
      belly: 1 + 0.06 * Math.sin(w(2) * t + ph),
      tailBow: [Math.sin(w(1) * t + ph) * 2.5, Math.cos(w(1) * t + ph) * 2.5, -2 + Math.sin(w(2) * t + ph)],
      feet: R.upper ? undefined : rest.feet,
    });
  });
  return { rats, knot: KNOT, knotR: KNOT_R, cord: 0, crownAt: null, grains: seepOf(rats, t0), alive: true };
}

/** The voices leaking out of their mouths as they squeak: a few pink grains rising off the heap now and then. */
function seepOf(rats: RatPose[], t: number, much = 0.3): [V3, string, number][] {
  const out: [V3, string, number][] = [];
  rats.forEach((P, i) => {
    if (P.gone > 0.5) return;
    const H = headOf(P);
    for (let k = 0; k < 3; k++) {
      const life = 0.9;
      const born = fr(t / life + hash(i, k, 6111)) * life;
      if (hash(i, Math.floor(t / life + hash(i, k, 6111)), 6112 + k) > much) continue;
      if (born < 0.12) continue;
      const p = add(H.mouth, [born * 4 * Math.sin(i + k), born * 3 * Math.cos(i * 2 + k), 3 + born * 18]);
      out.push([p, born < 0.45 ? VOICE[2] : VOICE[1], born < 0.5 ? 2 : 1]);
    }
  });
  return out;
}

/** A foot of a scurry of `n` frames over `period`: down (on the floor, carried back under the heap at its pace) for the first half of its round, lifted and swung through for the rest. Offset along the way it goes, and lift. */
function scurryFoot(u: number, stroke: number): [number, number] {
  const duty = 0.5;
  if (u < duty) return [stroke / 2 - stroke * (u / duty), 0];
  const v = (u - duty) / (1 - duty);
  return [-stroke / 2 + stroke * sm(v), 2.2 * Math.sin(Math.PI * v)];
}

/** THE SCUTTLE: the heap goes as one, along its forward (+x), each rat's feet pattering, diagonal pairs together; the front ones hauling, the ones behind scrabbling backward after; the heap bobbing. */
function walkPose(t: number): KingPose {
  const T = RK_WALK.period;
  const u0 = fr(t / T);
  const stroke = RK_PACE * TILE3 * T * 0.5;
  const bob = 0.7 * Math.abs(Math.sin(u0 * Math.PI * 2));
  const rats = RATS.map((R, i) => {
    const facing = Math.cos(R.a * D);
    const rest = placed(R, { z: R.z + bob * 0.6 });
    const feet = rest.feet.map((p, k) => {
      const diag = k === 0 || k === 3 ? 0 : 0.5;
      const [off, lift] = scurryFoot(fr(u0 + diag + R.seed * 0.13), stroke);
      return R.upper ? add(p, [off * 0.4, 0, lift * 0.5]) : ([p[0] + off, p[1], lift] as V3);
    });
    return placed(R, {
      z: R.z + bob * 0.6,
      // (the front ones stretched out hauling, the back ones dragged, scrabbling)
      r: R.r + 1.6 * facing,
      pitch: R.pitch + (facing > 0.3 ? -6 : 4),
      hy: 10 * Math.sin(u0 * Math.PI * 2 + i),
      hp: facing > 0.3 ? 4 : -4 + 6 * Math.sin(u0 * Math.PI * 4 + i),
      belly: 1,
      tailBow: [-3 * facing, Math.sin(u0 * Math.PI * 2 + i) * 2, -2],
      feet,
    });
  });
  return { rats, knot: add(KNOT, [0, 0, bob * 0.4]), knotR: KNOT_R, cord: 0, crownAt: null, grains: seepOf(rats, t, 0.15), alive: true };
}

/** THE BITE. */
function bitePose(t: number): KingPose {
  const B = RK_BITE;
  // (the picture held still a tenth as the jaws snap shut)
  const tt = t < B.hit ? t : t < B.hit + B.freeze ? B.hit : t - B.freeze;
  const end = B.long - B.freeze;
  // the heap: bunched back through the warning, surging forward to the snap, drawn back after
  const back = -4;
  const x = tt < B.warn[0] ? back * sm(tt / B.warn[0]) : tt < B.warn[1] ? back : tt < B.hit ? lerp(back, B.surge, sm((tt - B.warn[1]) / (B.hit - B.warn[1]))) ** 1 : lerp(B.surge, 0, sm((tt - B.hit - 0.08) / (end - B.hit - 0.18)));
  const tremble = tt > B.warn[0] && tt < B.warn[1] ? Math.sin(tt * 150) * sm((tt - B.warn[0]) / 0.06) : 0;
  const rear = tt < B.warn[0] ? sm(tt / B.warn[0]) : tt < B.warn[1] ? 1 : tt < B.hit ? 1 - 2.2 * sm((tt - B.warn[1]) / (B.hit - B.warn[1])) : -1.2 * (1 - sm((tt - B.hit) / 0.3));
  const rats = RATS.map((R, i) => {
    const facing = Math.cos(R.a * D);
    const front = facing > 0.2 && !R.upper ? cl01((facing - 0.2) / 0.5) : R.king ? 0.45 : 0;
    // (every rat's feet stay where they stand, but the front ones step forward with the surge)
    const rest = placed(R);
    const step = sm((tt - B.warn[1]) / (B.hit - B.warn[1] - 0.04)) - sm((tt - B.hit - 0.15) / 0.35);
    const feet = rest.feet.map((p, k) => {
      if (R.upper) return add(p, [x, 0, 0]);
      const moves = front > 0 && k < 2;
      const dx = moves ? B.surge * cl01(step) : 0;
      const lift = moves ? 3 * Math.sin(Math.PI * cl01(step)) * (step > 0 && step < 1 ? 1 : 0) : 0;
      return [p[0] + dx, p[1], lift] as V3;
    });
    return placed(R, {
      dx: x * (front > 0 ? 1 : 0.6) + tremble * 0.5 * front,
      pitch: R.pitch + front * (rear > 0 ? 34 * rear : 5 * rear),
      hp: front * (rear > 0 ? 18 * rear : 10 * rear),
      hy: front ? 0 : 14 * Math.sin(tt * 9 + i),
      gape: front > 0 ? (tt < B.hit - 0.12 ? cl01(tt / B.warn[0]) : tt < B.hit ? 1 - (tt - (B.hit - 0.12)) / 0.12 : 0.2 * (1 - sm((tt - B.hit) / 0.4))) : 0.2,
      eyes: front > 0 && tt > B.warn[0] && tt < B.hit + 0.2 ? 2 : 1,
      tailBow: [-x * 0.3, 0, -2],
      feet,
    });
  });
  return { rats, knot: add(KNOT, [x * 0.7, 0, 0]), knotR: KNOT_R, cord: 0, crownAt: null, grains: seepOf(rats, t, tt > B.warn[0] && tt < B.hit + 0.3 ? 0.8 : 0.3), alive: true };
}

/** STRUCK: the heap flinches back, every head snapping up, eyes flaring; a squeal of voices. */
function reelPose(t: number): KingPose {
  const k = Math.sin(Math.PI * cl01(t / RK_REEL.long)) * (1 - 0.5 * cl01(t / RK_REEL.long));
  const rats = RATS.map((R, i) => {
    const rest = placed(R);
    return placed(R, { r: R.r - 2.2 * k, pitch: R.pitch + 12 * k, hp: 24 * k, hy: 20 * k * Math.sin(i * 2.1), gape: 0.8 * k, eyes: 1 + k, feet: R.upper ? undefined : rest.feet });
  });
  return { rats, knot: add(KNOT, [-1.5 * k, 0, 0.6 * k]), knotR: KNOT_R, cord: 0, crownAt: null, grains: seepOf(rats, t, 0.9 * k), alive: true };
}

/** A rat in a frame of its own (a ball's), its body's middle at `c`, its way `f`, its back `u`; its feet tucked under it. */
function framed(R: RatRest, c: V3, f0: V3, u0: V3, o: { hy?: number; hp?: number; gape?: number; eyes?: number; tailTo?: V3; belly?: number; tuck?: number } = {}): RatPose {
  const u = norm(u0);
  const f = norm(sub(f0, mul(u, dot(f0, u))), [1, 0, 0]);
  const l = cross(u, f);
  const s = R.s;
  const tuck = o.tuck ?? 1;
  const feet = FOOT_REST.map(([fx, fy]) => add(add(add(c, mul(f, fx * s * (1 - 0.35 * tuck))), mul(l, fy * s * (1 - 0.3 * tuck))), mul(u, -3.6 * s * (1 - 0.35 * tuck))));
  return { c, f, l, u, s, belly: o.belly ?? 1, hy: o.hy ?? 0, hp: o.hp ?? -20, gape: o.gape ?? 0, eyes: o.eyes ?? 1, feet, tailTo: o.tailTo ?? sub(c, mul(u, 6 * s)), tailBow: mul(u, -1.5), gone: 0, king: R.king, seed: R.seed };
}
type Quat = [number, number, number, number];
/** A frame (forward, left, up) as a turn from the world's (x, y, z). */
function quatOf(f: V3, l: V3, u: V3): Quat {
  const m00 = f[0], m01 = l[0], m02 = u[0];
  const m10 = f[1], m11 = l[1], m12 = u[1];
  const m20 = f[2], m21 = l[2], m22 = u[2];
  const tr = m00 + m11 + m22;
  let q: Quat;
  if (tr > 0) {
    const S = Math.sqrt(tr + 1) * 2;
    q = [0.25 * S, (m21 - m12) / S, (m02 - m20) / S, (m10 - m01) / S];
  } else if (m00 > m11 && m00 > m22) {
    const S = Math.sqrt(1 + m00 - m11 - m22) * 2;
    q = [(m21 - m12) / S, 0.25 * S, (m01 + m10) / S, (m02 + m20) / S];
  } else if (m11 > m22) {
    const S = Math.sqrt(1 + m11 - m00 - m22) * 2;
    q = [(m02 - m20) / S, (m01 + m10) / S, 0.25 * S, (m12 + m21) / S];
  } else {
    const S = Math.sqrt(1 + m22 - m00 - m11) * 2;
    q = [(m10 - m01) / S, (m02 + m20) / S, (m12 + m21) / S, 0.25 * S];
  }
  const n = Math.hypot(...q);
  return [q[0] / n, q[1] / n, q[2] / n, q[3] / n];
}
function slerp(a: Quat, b0: Quat, k: number): Quat {
  let b = b0;
  let d = a[0] * b[0] + a[1] * b[1] + a[2] * b[2] + a[3] * b[3];
  if (d < 0) {
    b = [-b[0], -b[1], -b[2], -b[3]];
    d = -d;
  }
  if (d > 0.9995) {
    const q: Quat = [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k, a[3] + (b[3] - a[3]) * k];
    const n = Math.hypot(...q);
    return [q[0] / n, q[1] / n, q[2] / n, q[3] / n];
  }
  const th = Math.acos(d);
  const sa = Math.sin((1 - k) * th) / Math.sin(th);
  const sb = Math.sin(k * th) / Math.sin(th);
  return [a[0] * sa + b[0] * sb, a[1] * sa + b[1] * sb, a[2] * sa + b[2] * sb, a[3] * sa + b[3] * sb];
}
function frameOfQuat(q: Quat): [V3, V3, V3] {
  const [w, x, y, z] = q;
  const f: V3 = [1 - 2 * (y * y + z * z), 2 * (x * y + w * z), 2 * (x * z - w * y)];
  const l: V3 = [2 * (x * y - w * z), 1 - 2 * (x * x + z * z), 2 * (y * z + w * x)];
  const u: V3 = [2 * (x * z + w * y), 2 * (y * z - w * x), 1 - 2 * (x * x + y * y)];
  return [f, l, u];
}

/** Two poses of a rat mixed `k` of the way (its frame turned between them). */
function mixRat(a: RatPose, b: RatPose, k: number): RatPose {
  if (k <= 0) return a;
  if (k >= 1) return b;
  // (its body's frame turned from the one to the other the short way round, evenly: never through nothing)
  const q = slerp(quatOf(a.f, a.l, a.u), quatOf(b.f, b.l, b.u), k);
  const [f, , u] = frameOfQuat(q);
  return {
    ...b,
    c: lerpV(a.c, b.c, k),
    f,
    u,
    l: cross(u, f),
    belly: lerp(a.belly, b.belly, k),
    hy: lerp(a.hy, b.hy, k),
    hp: lerp(a.hp, b.hp, k),
    gape: lerp(a.gape, b.gape, k),
    eyes: lerp(a.eyes, b.eyes, k),
    feet: a.feet.map((p, i) => lerpV(p, b.feet[i], k)),
    tailTo: lerpV(a.tailTo, b.tailTo, k),
    tailBow: lerpV(a.tailBow, b.tailBow, k),
    gone: lerp(a.gone, b.gone, k),
  };
}

// --- THE ROLL ---
/** The ball of rats: its rats' backs out, tails in to its middle; its radius to their backs; how high its middle rides (a little over that, their heads and ears tucked under them). */
const BALL_R = 14.5 * SC;
const BALL_Z = BALL_R + 2;
/** Each rat's place on the ball: a spread of directions (a golden spiral), and the way it lies along the ball. */
const BALL_AT: V3[] = RATS.map((_, i) => {
  const n = RATS.length;
  const y = 1 - (2 * (i + 0.5)) / n;
  const r = Math.sqrt(1 - y * y);
  const a = i * 2.39996;
  return [Math.cos(a) * r, y, Math.sin(a) * r] as V3;
});
/** How fast it rolls (tiles a second): one turn of the ball in a loop of RK_ROLL.frames, so its rats do not slide on the floor. */
export const ROLL_PACE = (2 * Math.PI * BALL_Z) / ((RK_ROLL.frames / RK_ROLL.fps) * TILE3);
/** The ball turned forward by `ang` (degrees) about its own middle: each rat on it. */
function ballPose(ang: number, k = 1): RatPose[] {
  const C: V3 = [0, 0, BALL_Z];
  return RATS.map((R, i) => {
    const d0 = BALL_AT[i];
    const d = norm(about(d0, [0, 1, 0], ang));
    const s = R.s;
    const c = add(C, mul(d, BALL_R - 3.7 * s));
    // (each lies along the ball, round it: its way square to its back, turned with the ball)
    const along0 = norm(cross(d0, [0.3, 0.2, 0.93]), [1, 0, 0]);
    const along = norm(about(along0, [0, 1, 0], ang));
    return framed(R, c, along, d, { hp: -46, tailTo: lerpV(C, c, 0.25), gape: 0.2 * k });
  });
}
function rollingPose(t: number): KingPose {
  const T = RK_ROLL.frames / RK_ROLL.fps;
  const ang = (fr(t / T) * 360);
  const rats = ballPose(ang);
  return { rats, knot: [0, 0, BALL_Z], knotR: KNOT_R * 0.6, cord: 0, crownAt: null, grains: [], alive: true, lump: 0.6 };
}
function curlPose(t: number, out: boolean): KingPose {
  const long = out ? RK_ROLL.uncurl : RK_ROLL.curl;
  const k0 = cl01(t / long);
  // curling: a shudder through the warning, then pulled in; uncurling: flung open
  const k = out ? 1 - sm(k0) : sm(k0 * 1.15);
  const st = standPose(out ? 0 : 0);
  const ball = ballPose(0);
  // (each springs up into its place on the ball, turning over in the air, so none turns through the floor)
  const hop = (r: RatPose, R: RatRest): RatPose => {
    const up: V3 = [0, 0, 9 * R.s * Math.sin(Math.PI * k)];
    return { ...r, c: add(r.c, up), feet: r.feet.map((p) => add(p, up)), tailTo: add(r.tailTo, mul(up, 0.5)) };
  };
  const rats = st.rats.map((r, i) => hop(mixRat(r, ball[i], k), RATS[i]));
  if (!out) rats.forEach((r) => (r.c = add(r.c, [Math.sin(t * 90) * 0.5 * (1 - k), 0, 0])));
  return { rats, knot: lerpV(KNOT, [0, 0, BALL_Z], k), knotR: lerp(KNOT_R, KNOT_R * 0.6, k), cord: 0, crownAt: null, grains: [], alive: true, lump: lerp(1, 0.6, k) };
}

// --- UNKNOT AND KNOT ---
/** A rat running out along its heading `d` units from its place, its feet pattering (stance feet held where they fell). */
function running(R: RatRest, d: number, o: { gone?: number; belly?: number; gape?: number; eyes?: number; tailFree?: number } = {}): RatPose {
  const a = R.a;
  const s = R.s;
  const lift = R.upper ? 0 : 0;
  // (one on top of the heap jumps down to the floor as it goes)
  const z = R.upper ? R.z * (1 - sm(d / (12 * s))) : 0;
  const r = R.upper ? R.r + d : R.r + d;
  const base = placed(R, { r, z, pitch: R.upper ? lerp(R.pitch, -6, sm(d / (12 * s))) : -6, hp: 6, gape: o.gape ?? 0.3, eyes: o.eyes ?? 1, belly: o.belly ?? 1, gone: o.gone ?? 0 });
  const Lc = 9 * s;
  // (along the floor: its way out and its left, level; each foot from where it rested, carried back under it while down)
  const fh: V3 = [Math.cos(a * D), Math.sin(a * D), 0];
  const lh: V3 = [-Math.sin(a * D), Math.cos(a * D), 0];
  const at0: V3 = [Math.cos(a * D) * r, Math.sin(a * D) * r, 0];
  // (a rat on the floor: from exactly where its feet rest, as the heap's; one off the heap, under it where it lands)
  const rest = R.upper ? null : placed(R).feet;
  const feet = FOOT_REST.map(([fx, fy], k) => {
    const diag = k === 0 || k === 3 ? 0 : 0.5;
    const [off, up] = scurryFoot(fr(d / Lc + diag), Lc * 0.5);
    const off0 = scurryFoot(diag, Lc * 0.5)[0];
    const p = rest ? add(rest[k], mul(fh, d + off - off0)) : add(add(at0, mul(fh, fx * s + off - off0)), mul(lh, fy * s));
    return [p[0], p[1], Math.max(0, z) + up + lift] as V3;
  });
  const free = o.tailFree ?? 0;
  const tailTo = lerpV(base.tailTo, add(base.c, mul(base.f, -15 * s)), free);
  return { ...base, feet, tailTo, tailBow: lerpV(base.tailBow, [0, 0, 0.5], free) };
}
/** UNKNOT: tensed, eyes flaring (the warning); the tails slip loose from the knot and the King snatches the Order's cord in its teeth; then they burst outward every way and are gone into the cracks. */
function unknotPose(t: number): KingPose {
  const U = RK_UNKNOT;
  const free = sm((t - 0.12) / 0.2);
  const run = (tt: number): number => 72 * Math.max(0, tt - 0.26) ** 1.6 / Math.pow(U.out - 0.26, 1.6);
  const rats = RATS.map((R) => {
    if (t < 0.26) {
      const st = placed(R, { r: R.r - 1.5 * sm(t / 0.18), gape: 0.5, eyes: 2, feet: R.upper ? undefined : placed(R).feet });
      return { ...st, c: add(st.c, [Math.sin(t * 160 + R.seed) * 0.6, 0, 0]), tailTo: lerpV(st.tailTo, add(st.c, mul(st.f, -15 * R.s)), free) };
    }
    const d = run(t);
    return running(R, d, { gone: sm((d - 34) / 34), tailFree: 1, gape: R.king ? 0.35 : 0.4, eyes: 1.6 });
  });
  const king = rats.find((r) => r.king)!;
  return { rats, knot: KNOT, knotR: KNOT_R, cord: 0, cordAt: t > 0.2 ? 'mouth' : 'knot', crownAt: null, grains: [], alive: true, lump: 1 - free, charge: null, corks: [], ...(king ? {} : {}) };
}
/** KNOT: out of the cracks on every side they pour back in, the King with the cord in its teeth, and their tails wind together and the cord is bound round them; they settle. */
function knotPose(t: number): KingPose {
  const U = RK_UNKNOT;
  const k = cl01(t / (U.in - 0.25));
  const d = 72 * (1 - sm(k)) ** 1.2;
  const wind = sm((t - (U.in - 0.4)) / 0.3);
  const settle = sm((t - (U.in - 0.25)) / 0.25);
  const rats = RATS.map((R) => {
    const r = running(R, d, { gone: sm((d - 34) / 34), tailFree: 1 - wind, gape: 0.4, eyes: 1.6 });
    const st = placed(R);
    return settle > 0 ? mixRat(r, { ...st, tailTo: lerpV(add(st.c, mul(st.f, -15 * R.s)), st.tailTo, wind) }, settle) : r;
  });
  return { rats, knot: KNOT, knotR: KNOT_R, cord: 0, cordAt: wind > 0.7 ? 'knot' : 'mouth', crownAt: null, grains: [], alive: true, lump: wind };
}

// --- STOLEN WORDS ---
function wordsPose(t: number): KingPose {
  const W = RK_WORDS;
  const up = t < W.warn[0] ? sm(t / W.warn[0]) : t < W.hit ? 1 : t < W.hit + 0.12 ? 1 + 0.25 * Math.sin(((t - W.hit) / 0.12) * Math.PI) : 1 - sm((t - W.hit - 0.12) / (W.long - W.hit - 0.2));
  const shake = t > W.warn[0] && t < W.hit ? Math.sin(t * 140) * 0.7 : 0;
  const rats = RATS.map((R, i) => {
    if (R.king) return placed(R, { z: R.z + 7 * up, pitch: R.pitch + 34 * up, hp: 16 * up, gape: up, eyes: 1 + up, dx: shake - (t > W.hit && t < W.hit + 0.15 ? 3 : 0), belly: 1 + 0.12 * up });
    const rest = placed(R);
    return placed(R, { pitch: R.pitch + 14 * up, hp: 30 * up, hy: 12 * Math.sin(t * 7 + i), gape: up * (0.6 + 0.4 * Math.sin(t * 23 + i * 2)), eyes: 1 + 0.6 * up, feet: R.upper ? undefined : rest.feet });
  });
  const king = rats.find((r) => r.king)!;
  const H = headOf(king);
  const grow = t < W.warn[0] ? 0 : t < W.hit ? sm((t - W.warn[0]) / (W.hit - W.warn[0])) : 0;
  const charge = grow > 0 ? { at: add(H.mouth, mul(H.f, 7 + 5 * grow)), k: grow } : null;
  // the voices drawn in from every mouth toward it
  const grains: [V3, string, number][] = [];
  if (charge) {
    rats.forEach((P, i) => {
      if (P.king) return;
      const m = headOf(P).mouth;
      for (let j = 0; j < 3; j++) {
        const q = fr(t * 2.2 + j / 3 + i * 0.13);
        grains.push([lerpV(m, charge.at, q), q > 0.6 ? VOICE[3] : VOICE[2], q > 0.5 ? 2 : 1]);
      }
    });
  }
  return { rats, knot: KNOT, knotR: KNOT_R, cord: 0, crownAt: null, grains, alive: true, charge };
}

// --- ITS DEATH ---
/** Where the King's crown comes to lie, on its side, its rim's half-height up. */
const CROWN_REST: V3 = [26, -20, 0];
const CROWN_LIE = 2.6 * 1.32 * SC + 0.8;
function dyingPose(t0: number): KingPose {
  const Dd = RK_DIE;
  const t = Math.min(t0, Dd.still);
  const rock = Math.sin(Math.PI * cl01(t / 0.24)) * 1;
  const free = sm((t - Dd.snap) / 0.55);
  const thin = 1 - 0.3 * sm((t - 0.6) / 1.0);
  const startOf = (R: RatRest): number => Dd.scatter[0] + hash(R.seed, 1, 6131) * 0.25;
  const flee = (R: RatRest): number => {
    const t1 = startOf(R);
    return 64 * Math.max(0, (t - t1) / (Dd.scatter[1] - t1)) ** 1.5;
  };
  const rats = RATS.map((R, i) => {
    const rest = placed(R, { feet: R.upper ? undefined : placed(R).feet });
    const lie = placed(R, {
      r: R.r - 2 * rock,
      pitch: R.pitch + 14 * rock - (R.king ? 20 * sm((t - 0.3) / 0.6) : 0),
      hp: 30 * rock + (t > 0.5 && t < 1.4 ? 20 : 0),
      gape: t < 0.5 ? 0.8 * rock : t < 2.0 ? 0.9 : 0.3,
      eyes: t < Dd.voices[0] ? 1.6 : Math.max(0, 1 - (t - Dd.voices[0]) / 0.5),
      belly: thin,
      tailBow: [0, 0, -2],
      feet: rest.feet,
    });
    const d = flee(R);
    const lain = { ...lie, tailTo: lerpV(lie.tailTo, add(lie.c, mul(lie.f, -15 * R.s)), free) };
    if (d <= 0) return lain;
    const r = running(R, d, { gone: Math.max(sm((d - 30) / 30), sm((t - Dd.gone[0] - hash(R.seed, 2, 6131) * 0.2) / 0.3)), belly: thin, gape: 0.4, eyes: 0, tailFree: 1 });
    // (turning from where it lay into its run over a few frames)
    return mixRat(lain, r, sm((t - startOf(R)) / 0.2));
  });
  // THE CROWN knocked off the King's head: flung, bouncing, lying
  let crownAt: V3 | null = null;
  if (t > Dd.crown) {
    const king = placed(RATS[RATS.length - 1]);
    const from = headOf(king).p([-0.4, 0, 2.6]);
    const q = cl01((t - Dd.crown) / 0.36);
    const hop = q < 1 ? 14 * 4 * q * (1 - q) : (t - Dd.crown - 0.36 < 0.16 ? 3 * Math.sin(((t - Dd.crown - 0.36) / 0.16) * Math.PI) : 0);
    crownAt = add(lerpV(from, CROWN_REST, q), [0, 0, hop + CROWN_LIE * q]);
    if (q >= 1) crownAt = add(CROWN_REST, [0, 0, CROWN_LIE + hop]);
  }
  // THE VOICES pouring up out of them, pink going pale as they rise, and gone
  const grains: [V3, string, number][] = [];
  if (t > Dd.voices[0] && t < Dd.voices[1] + 0.6) {
    rats.forEach((P, i) => {
      if (P.gone > 0.6) return;
      const m = headOf(P).mouth;
      for (let j = 0; j < 9; j++) {
        const born = Dd.voices[0] + ((j + hash(i, j, 6141)) / 9) * (Dd.voices[1] - Dd.voices[0]);
        const age = t - born;
        if (age < 0 || age > 0.8) continue;
        const q = age / 0.8;
        // (a stream out of each mouth, swirling as it rises, pink going gold going pale)
        const sw = Math.sin(q * 7 + i + j) * 5 * q;
        const p = add(m, [sw + Math.sin(i + j * 2) * 4 * q, Math.cos(i * 3 + j) * 4 * q, 3 + 78 * q]);
        const col = q < 0.25 ? VOICE[2] : q < 0.5 ? VOICE[3] : FREED[q < 0.75 ? 3 : 4];
        grains.push([p, col, q < 0.35 ? 3 : q < 0.7 ? 2 : 1]);
        if (q > 0.08) grains.push([add(p, [0, 0, -4]), q < 0.4 ? VOICE[1] : FREED[2], 1]);
      }
    });
  }
  // the corks spilled out of the knot as it comes undone
  const corks: V3[] = t > Dd.snap + 0.2 ? Array.from({ length: 9 }, (_, i) => [Math.cos(i * 2.3) * (8 + 10 * hash(i, 0, 6151)) * SC * 0.6, Math.sin(i * 2.3) * (8 + 10 * hash(i, 1, 6151)) * SC * 0.6, 0.9 * SC] as V3) : [];
  return { rats, knot: lerpV(KNOT, [0, 0, 2.5 * SC], free), knotR: KNOT_R, cord: free, cordAt: t > Dd.snap ? 'snapped' : 'knot', cordT: Math.max(0, t - Dd.snap), crownAt, grains, alive: false, lump: 1 - free, corks };
}

function poseOf(which: string, t: number): KingPose {
  switch (which) {
    case 'walk':
      return walkPose(t);
    case 'attack':
      return bitePose(t);
    case 'reel':
      return reelPose(t);
    case 'curl':
      return curlPose(t, false);
    case 'roll':
      return rollingPose(t);
    case 'uncurl':
      return curlPose(t, true);
    case 'unknot':
      return unknotPose(t);
    case 'knot':
      return knotPose(t);
    case 'words':
      return wordsPose(t);
    case 'dying':
      return dyingPose(t);
    default:
      return standPose(t);
  }
}
export function ratKingLong(which: string): number {
  return (
    {
      stand: RK_STAND.period,
      walk: RK_WALK.period,
      attack: RK_BITE.long,
      reel: RK_REEL.long,
      curl: RK_ROLL.curl,
      roll: RK_ROLL.frames / RK_ROLL.fps,
      uncurl: RK_ROLL.uncurl,
      unknot: RK_UNKNOT.out,
      knot: RK_UNKNOT.in,
      words: RK_WORDS.long,
      dying: RK_DIE.long,
    } as Record<string, number>
  )[which] ?? 1;
}

// ---------------------------------------------------------------------------------------------
// ITS PAINTER

interface Head {
  at: V3;
  f: V3;
  l: V3;
  u: V3;
  mouth: V3;
  p: (v: V3) => V3;
}
/** A rat's head: on its neck before its body, turned and pitched. */
function headOf(P: RatPose): Head {
  const s = P.s;
  const neck = add(add(P.c, mul(P.f, 4.6 * s)), mul(P.u, 0.6 * s));
  const f = norm(about(about(P.f, P.u, P.hy), P.l, -P.hp));
  const l = norm(cross(P.u, f), P.l);
  const u = cross(f, l);
  const at = add(neck, mul(f, 2.4 * s));
  const p = (v: V3): V3 => add(at, add(mul(f, v[0] * s), add(mul(l, v[1] * s), mul(u, v[2] * s))));
  return { at, f, l, u, mouth: p([4.6, 0, -0.6]), p };
}

/** Wet fur: darker down the spine, paler and swollen at the belly; a sleek wet sheen along the back in the light. */
function fur(seed: number, belly: number): Skin {
  return (u, tone) => {
    if (u[2] < -0.3 + 0.15 * (belly - 1)) return BELLY[Math.min(4, tone)];
    // (the spine's dark line; the wet catching the light in a streak beside it)
    if (Math.abs(u[1]) < 0.18 && u[2] > 0.55) return FUR[Math.max(0, tone - 1)];
    if (u[2] > 0.5 && u[1] > 0.2 && u[1] < 0.42 && tone >= 3) return FUR[4];
    // (clumped, wet: a few darker clumps)
    if (fr(u[0] * 3.1 + Math.sin(u[1] * 7 + seed) * 0.4) < 0.08) return FUR[Math.max(0, tone - 1)];
    return FUR[tone];
  };
}
/** A naked tail, in rings. */
const tailSkin: Ramp = SKIN;

/** ONE RAT AS SOLIDS. */
function ratBits(P: RatPose, put: Put, id: string, view: GameView): void {
  const k = 1 - P.gone;
  if (k <= 0.02) return;
  const s = P.s * k;
  const S = { ...P, s };
  const body = 'r' + id;
  const sw = P.belly;
  // its body: swollen, a rump behind
  put(body, 'body', { k: 'ball', c: add(S.c, mul(P.f, 0.6 * s)), ax: [mul(P.f, 5.0 * s), mul(P.l, 3.5 * s * sw), mul(P.u, 3.3 * s * sw)], skin: fur(P.seed, sw) });
  put(body, 'rump', { k: 'ball', c: add(add(S.c, mul(P.f, -3.2 * s)), mul(P.u, 0.2 * s)), ax: [mul(P.f, 3.9 * s), mul(P.l, 4.0 * s * sw), mul(P.u, 3.8 * s)], skin: fur(P.seed + 1, sw) });
  // its head: a long tapering snout, its nose, its teeth; round ears; its eyes the cult's pink
  const H = headOf(S);
  put(body, 'head', { k: 'ball', c: H.at, ax: [mul(H.f, 2.7 * s), mul(H.l, 2.4 * s), mul(H.u, 2.3 * s)], skin: fur(P.seed + 2, 1) });
  // (its snout's tip meets the floor rather than going into it, as it snaps down)
  const offF = (p: V3, r: number): V3 => [p[0], p[1], Math.max(r + 0.1, p[2])];
  put(body, 'snout', { k: 'rod', a: H.p([1.0, 0, -0.1]), b: offF(H.p([4.6, 0, -0.8]), 0.75 * s), ra: 1.8 * s, rb: 0.75 * s, ramp: FUR });
  put(body, 'nose', { k: 'ball', c: offF(H.p([5.0, 0, -0.6]), 0.75 * s), ax: [mul(H.f, 0.6 * s), mul(H.l, 0.7 * s), mul(H.u, 0.55 * s)], skin: SKIN });
  // its lower jaw, open as it squeaks or snaps
  const jaw = norm(add(mul(H.f, Math.cos(P.gape * 45 * D)), mul(H.u, -Math.sin(P.gape * 45 * D))));
  const hinge = H.p([1.0, 0, -1.3]);
  // (its jaw's tip meets the floor rather than going into it)
  const off = (p: V3, r: number): V3 => [p[0], p[1], Math.max(r + 0.1, p[2])];
  const jawTip = off(add(hinge, mul(jaw, 3.2 * s)), 0.45 * s);
  put(body, 'jaw', { k: 'rod', a: hinge, b: jawTip, ra: 0.9 * s, rb: 0.45 * s, ramp: FUR });
  if (P.gape > 0.15) put(body, 'mouth', { k: 'ball', c: off(lerpV(H.p([3.0, 0, -0.9]), lerpV(hinge, jawTip, 0.7), 0.5), 0.8 * s), ax: [mul(H.f, 1.3 * s), mul(H.l, 0.7 * s), mul(H.u, 0.7 * s * P.gape)], skin: () => MOUTH });
  // the incisors, long and yellow, top and bottom
  put(body, 'teeth', { k: 'rod', a: off(H.p([4.3, 0, -0.9]), 0.42 * s), b: off(H.p([4.5, 0, -1.9]), 0.3 * s), ra: 0.42 * s, rb: 0.3 * s, ramp: TEETH });
  if (P.gape > 0.15) put(body, 'teeth', { k: 'rod', a: off(lerpV(hinge, jawTip, 0.94), 0.36 * s), b: off(add(lerpV(hinge, jawTip, 0.94), mul(H.u, 0.9 * s)), 0.26 * s), ra: 0.36 * s, rb: 0.26 * s, ramp: TEETH });
  for (const sd of [1, -1]) {
    put(body, 'ear', { k: 'ball', c: H.p([-0.9, sd * 2.0, 2.1]), ax: [mul(H.f, 0.55 * s), mul(norm(add(H.l, mul(H.u, 0.3 * sd))), 1.6 * s), mul(H.u, 1.7 * s)], skin: (u, tone) => (u[0] > 0.3 ? SKIN[Math.min(4, tone + 1)] : SKIN[tone]) });
    if (P.eyes > 0.05) {
      const e = H.p([1.9, sd * 1.35, 0.85]);
      const facing = norm(add(mul(H.l, sd * 0.8), H.f));
      put(body, 'eyes', { k: 'dot', p: e, c: P.eyes > 1.4 ? FLAME[2] : FLAME[1], c2: FLAME[1], facing });
      if (dot(facing, eyeOf(view)) > 0 && P.eyes > 0.5) put('glow', 'eyeglow', { k: 'glow', p: e, c: FLAME[1], r: 3 * Math.min(1.6, P.eyes), a: Math.min(0.4, 0.2 * P.eyes) });
    }
  }
  // its legs: short, its paws pink-grey, on the floor (or on the heap)
  P.feet.forEach((foot, i) => {
    const fore = i < 2;
    const side = i % 2 === 0 ? 1 : -1;
    const root = add(add(add(S.c, mul(P.f, (fore ? 3.0 : -3.2) * s)), mul(P.l, side * (fore ? 2.0 : 2.3) * s)), mul(P.u, -1.4 * s));
    const ft = k < 1 ? lerpV(root, foot, k) : foot;
    put(body, fore ? 'foreleg' : 'hindleg', { k: 'rod', a: root, b: add(ft, [0, 0, 0.7 * s]), ra: (fore ? 0.85 : 1.1) * s, rb: 0.5 * s, ramp: FUR });
    put(body, 'paw', { k: 'ball', c: add(ft, [0, 0, 0.5 * s]), ax: [mul(P.f, 0.95 * s), mul(P.l, 0.6 * s), [0, 0, 0.45 * s]], skin: SKIN });
  });
  // its tail, from its rump to the knot, in rings, bowed as it squirms
  const root = add(S.c, mul(P.f, -6.4 * s));
  const to = k < 1 ? lerpV(root, P.tailTo, k) : P.tailTo;
  const mid = add(lerpV(root, to, 0.5), P.tailBow);
  const N = 6;
  let prev = root;
  for (let j = 1; j <= N; j++) {
    const q = j / N;
    const p = add(add(mul(root, (1 - q) * (1 - q)), mul(mid, 2 * (1 - q) * q)), mul(to, q * q));
    put('tail' + id, 'tail', { k: 'rod', a: prev, b: p, ra: lerp(1.2, 0.7, (j - 1) / N) * s, rb: lerp(1.2, 0.7, j / N) * s, ramp: tailSkin });
    prev = p;
  }
}

const VIEWS = new Map<GameView, V3>();
function eyeOf(view: GameView): V3 {
  let e = VIEWS.get(view);
  if (!e) VIEWS.set(view, (e = stage(view, 0, 0, { w: 2, h: 2 }).eye));
  return e;
}

/** THE KING'S CROWN: a jar's broken neck of green glass jammed on its head, its jagged rim up. */
function crownBits(put: Put, P: RatPose, lying: V3 | null): void {
  let c: V3;
  let up: V3;
  let f: V3;
  if (lying) {
    // (fallen on its side: its rim upright)
    c = lying;
    up = norm([0.9, 0.35, 0.05]);
    f = [0, 0, 1];
  } else {
    const H = headOf(P);
    c = H.p([-0.4, 0, 2.6]);
    up = norm(add(H.u, mul(H.f, -0.25)));
    f = H.f;
  }
  const l = norm(cross(up, f), [0, 1, 0]);
  const R = 2.6 * P.s;
  for (let k = 0; k < 14; k++) {
    const a0 = (k / 14) * Math.PI * 2;
    const a1 = ((k + 1) / 14) * Math.PI * 2;
    const h0 = (k % 2 ? 2.6 : 1.2) * P.s;
    const pa = add(c, add(mul(f, Math.cos(a0) * R), mul(l, Math.sin(a0) * R)));
    const pb = add(c, add(mul(f, Math.cos(a1) * R), mul(l, Math.sin(a1) * R)));
    put('crown', 'crown', { k: 'rod', a: pa, b: add(pb, mul(up, 0)), ra: 0.55 * P.s, rb: 0.55 * P.s, ramp: GLASS });
    put('crown', 'crown', { k: 'rod', a: pa, b: add(pa, mul(up, h0)), ra: 0.5 * P.s, rb: 0.25 * P.s, ramp: GLASS });
  }
}

/** THE KNOT: the tails wound into one hard lump, crumbs of cork and wax in it, bound round with the Order's black cord. */
function knotBits(put: Put, K: KingPose): void {
  const c = K.knot;
  const lump = K.lump ?? 1;
  const R = K.knotR * Math.max(0.05, lump);
  // the corks spilled on the floor
  for (const p of K.corks ?? []) put('corks', 'cork', { k: 'ball', c: p, ax: [[1.1 * SC, 0, 0], [0, 0.9 * SC, 0], [0, 0, 0.8 * SC]], skin: CORK });
  // the cord snapped: its two pieces flung off and lying in loops
  if (K.cordAt === 'snapped') {
    const q = cl01((K.cordT ?? 0) / 0.3);
    for (const sd of [1, -1]) {
      const end: V3 = [sd * 18 * SC * 0.6, -sd * 6, 0.6];
      const at = add(lerpV(c, end, q), [0, 0, 8 * 4 * q * (1 - q)]);
      for (let j = 0; j < 7; j++) {
        const a = j * 0.9 + sd;
        const p0 = add(at, [Math.cos(a) * 3 * SC * 0.6, Math.sin(a) * 3 * SC * 0.6, 0]);
        const p1 = add(at, [Math.cos(a + 0.9) * 3 * SC * 0.6, Math.sin(a + 0.9) * 3 * SC * 0.6, 0]);
        put('cord', 'cord', { k: 'rod', a: p0, b: p1, ra: 0.6 * SC, rb: 0.6 * SC, ramp: CORD });
      }
    }
  }
  if (lump < 0.05) return;
  // the lump of tails: coils of ringed skin
  for (let i = 0; i < 9; i++) {
    const a = i * 0.7;
    const ax: V3 = norm([Math.cos(a * 3.1), Math.sin(a * 2.3), Math.cos(a * 1.7) * 0.6]);
    const p0 = add(c, mul(ax, R * 0.55));
    const p1 = add(c, mul(norm(about(ax, [0, 0, 1], 120)), R * 0.55));
    put('knot', 'knot', { k: 'rod', a: p0, b: p1, ra: 1.4 * SC, rb: 1.2 * SC, ramp: SKIN });
  }
  put('knot', 'knot', { k: 'ball', c, ax: [[R * 0.7, 0, 0], [0, R * 0.7, 0], [0, 0, R * 0.6]], skin: (u, tone) => (fr(u[0] * 4 + u[2] * 3) < 0.18 ? SKIN[Math.max(0, tone - 1)] : SKIN[tone]) });
  // crumbs of cork and the Order's wax stuck in it
  for (let i = 0; i < 6; i++) {
    const p = add(c, mul(norm([Math.cos(i * 2.2), Math.sin(i * 2.2), 0.4]), R * 0.72));
    put('knot', 'cork', { k: 'ball', c: p, ax: [[0.9 * SC, 0, 0], [0, 0.9 * SC, 0], [0, 0, 0.7 * SC]], skin: CORK });
  }
  // the cord, wound round it twice, its ends hanging
  if ((K.cordAt ?? 'knot') === 'knot' && K.cord < 1) {
    for (const tilt of [25, -35]) {
      const ax = norm(about([0, 0, 1], [1, 0, 0], tilt));
      const u = norm(cross(ax, [0, 1, 0]), [1, 0, 0]);
      const v = cross(ax, u);
      put('cord', 'cord', { k: 'band', ring: { c, u: mul(u, R * 0.78), v: mul(v, R * 0.78) }, ramp: CORD, rows: 2 });
    }
  }
}

function bitsOf(which: string, t: number, view: GameView): { K: KingPose; bits: Bit[] } {
  eyeOf(view);
  const K = poseOf(which, t);
  const bits: Bit[] = [];
  const put: Put = (part, piece, shape) => bits.push({ part, piece, shape });
  knotBits(put, K);
  K.rats.forEach((P, i) => ratBits(P, put, String(i), view));
  const king = K.rats.find((r) => r.king);
  if (king && (K.crownAt || king.gone < 0.5)) crownBits(put, king, K.crownAt);
  // the Order's cord in the King's teeth, trailing
  if (king && K.cordAt === 'mouth' && king.gone < 0.9) {
    const H = headOf(king);
    let prev = H.mouth;
    for (let j = 1; j <= 6; j++) {
      const p = add(H.mouth, add(mul(king.f, -2.4 * j * king.s * (1 - king.gone)), [0, Math.sin(j * 1.3) * 1.5, -0.9 * j]));
      const q: V3 = [p[0], p[1], Math.max(0.6, p[2])];
      put('cord', 'cord', { k: 'rod', a: prev, b: q, ra: 0.6 * SC, rb: 0.6 * SC, ramp: CORD });
      prev = q;
    }
  }
  // a stolen word gathering before the King's mouth: a knot of the enemy's fire, its sparks drawn in
  if (K.charge) {
    const { at, k } = K.charge;
    put('glow', 'charge', { k: 'glow', p: at, c: FLAME[2], r: 10 + 16 * k, a: 0.35 + 0.3 * k });
    put('charge', 'charge', { k: 'ball', c: at, ax: [[2 + 3 * k, 0, 0], [0, 2 + 3 * k, 0], [0, 0, 2 + 3 * k]], skin: (u, tone) => (u[2] > 0.3 ? VOICE[4] : tone > 2 ? VOICE[3] : VOICE[2]) });
  }
  for (const [p, c, size] of K.grains) put('voices', 'voice', { k: 'mote', p, c, size });
  return { K, bits };
}

/** One moment of it painted. */
export function ratKingPainted(which: string, t: number, view: GameView = 'front'): Painted {
  const { K, bits } = bitsOf(which, t, view);
  const st = stage(view, RK_CANVAS.ax, RK_CANVAS.ay, RK_CANVAS);
  const lights = paintBits(st, bits, KNOT);
  const px: Px = st.whole(K.alive ? ENEMY_RIM : null);
  return { px, lights };
}
export function ratKingFrame(which: string, t: number, view: GameView = 'front'): Sprite {
  return toSprite(ratKingPainted(which, t, view), which === 'dying' ? null : RK_AURA, RK_CANVAS.ax, RK_CANVAS.ay);
}
/** Its pose at one moment (for the tests). */
export function ratKingPose(which: string, t: number): KingPose {
  return poseOf(which, t);
}
export function ratKingSolids(which: string, t: number, view: GameView = 'front'): Bit[] {
  return bitsOf(which, t, view).bits;
}

/** THE RAT KING, as the game holds a monster's pictures. */
export function makeRatKingArt(): ActorArt {
  const set = (view: GameView): AnimSet => {
    const frame = (which: string, t: number): Sprite => ratKingFrame(which, t, view);
    const clip = (which: string, long: number, fps: number, hit?: number): Clip => {
      const c: Clip = { frames: lazyFrames(Math.round(long * fps) + 1, (i) => frame(which, i / fps)), fps };
      if (hit !== undefined) c.hit = hit;
      return c;
    };
    const attack = clip('attack', RK_BITE.long, RK_BITE.fps, RK_BITE.hit);
    return {
      idle: lazyFrames(RK_STAND.frames, (i) => frame('stand', i / RK_STAND.fps)),
      walk: lazyFrames(RK_WALK.frames, (i) => frame('walk', i / RK_WALK.fps)),
      attack: lazyFrames(3, (i) => attack.frames[[10, 18, 22][i]]),
      idleFps: RK_STAND.fps,
      walkFps: RK_WALK.fps,
      clips: {
        attack,
        reel: clip('reel', RK_REEL.long, RK_REEL.fps),
        die: clip('dying', RK_DIE.long, RK_DIE.fps),
        moves: {
          curl: clip('curl', RK_ROLL.curl, RK_ROLL.fps),
          roll: { ...clip('roll', (RK_ROLL.frames - 1) / RK_ROLL.fps, RK_ROLL.fps), loop: 0 },
          uncurl: clip('uncurl', RK_ROLL.uncurl, RK_ROLL.fps),
          unknot: clip('unknot', RK_UNKNOT.out, RK_UNKNOT.fps),
          knot: clip('knot', RK_UNKNOT.in, RK_UNKNOT.fps),
          words: clip('words', RK_WORDS.long, RK_WORDS.fps, RK_WORDS.hit),
        },
      },
    };
  };
  return { front: set('front'), back: set('back') };
}

export { VOICE as RK_VOICE, FREED as RK_FREED };
