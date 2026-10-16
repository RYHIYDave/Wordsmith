// FLOOR 10'S BOSS, THE DROWNED EYE OF THE SUNKEN FEN, THE ACT'S BOSS: a mock-up (nothing of the game imports this file;
// `EYE_ON` is off).
//
// HIS DESIGN DOC ("Wordsmith Act 1: The Descent (Levels 6–10)", the planning chat's, Level 10): the Act 1 finale, the
// eldritch being in the ancient swamp powering the cult's siege of the town. The look of his pick of 13 Oct: "The
// Drowned Eye has risen close under the pool's surface: a pale, veined eyeball with a burning gold iris and a slit
// pupil. Its arms coil out under the water past the ruin, and two curl up out of it." Three phases: under the water,
// tentacles bursting up round the player while chanters shield it; surfaced, "a huge eye and maw rising out of the
// ruins", spawning smaller horrors from the muck; desperate, pulling the siege magic back into itself, the arena
// turning hostile.
//
// HIS BRIEF, his art rulebook's questions in two pop-ups (15 Oct, by 16:04, each his pick, the labels as he tapped
// them): how big, “Huge: its eye as wide as the pool (Recommended)”; what rises when it surfaces, “The eye splits open
// into a maw” (not the recommended pick); its arms, “Pale veined tentacles, as in the plan's picture (Recommended)”;
// under the water, “Its eye glowing gold under the water (Recommended)”; in phase 3, “The obelisks' pink lines bend
// into it; its veins blaze (Recommended)”; how it dies, “It sinks, its eye going dark, as the dome shatters
// (Recommended)”; what it must never look like, “Not a cartoon googly eye (Recommended)”; its sound (sound rule 7), “A
// deep drowned groan, wet slaps, the chant (Recommended)”.
//
// HIS WORDS, 15 Oct: 16:02, “Remember the drowned eye is the Act Boss.  I’d like him to have a couple of different
// phases, and a significant moveset”; 16:04, “And I want the fight to be engaging and long and exciting a very cool.
// Lots of tentacle dodging and spells”. His moves, picked by 16:12: tentacles bursting up from glowing cracks, sweeping
// the ring, slamming down in a line; his gold gaze beam; the siege's pink bolts raining down; bile spat in arcs;
// breathing in, then biting; spewing eyespawn; and, his own words, “I like the water idea for the roar, but instead it
// picks its bulk up and splashes down”. Three phases (docs/mockups/act1_fen/README.md has it all).
//
// READ AS, NOT ASKED (the pictures are to show them): an enemy, so its iris burns the enemy's pink to gold and its edge
// is pink while it lives; nothing cyan. Not a googly eye: the eye is set deep in a great bulk of drowned flesh, under
// heavy lids, a fringe of feelers along them, barnacled and hung with weed; it looks at you. Its arms pale, veined with
// the swamp's violet, suckers along their inner side. What of it is under the water shows through the water, darker
// the deeper, and only within the pool (beyond its rim is the ruin's paving).
//
// NOT ON THE HEROES' BONES: painted from its own solids, as the Hollow Stag is, in the same painter.
//
// THIS FIRST STEP: its look (his rulebook: a sheet of it, front and back, beside a hero, before anything moves): risen;
// under the water; torn open into its maw; blazing.

import type { Px, Sprite } from '../engine/px';
import { INK, hash, toSprite } from './kit';
import type { Painted, Ramp } from './kit';
import { ENEMY_RIM, FLAME } from './mkit';
import { TILE3, paintBits } from './new_mobs3';
import type { Bit, Put } from './new_mobs3';
import type { Sheet, Skin, Stage } from './skin';
import { stage } from './skin';
import type { GameView } from './skin';
import type { V3 } from './skeleton';

/** THE SWITCH, OFF: nothing of the game reads this file. */
export const EYE_ON = { on: false };

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
const dot = (a: readonly number[], b: readonly number[]): number => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const cross = (a: V3, b: V3): V3 => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const lerp = (a: number, b: number, k: number): number => a + (b - a) * k;

// ---------------------------------------------------------------------------------------------
// ITS COLOURS. Its eye's white pale and wet, veined with the swamp's violet; its iris the enemy's fire, pink at its rim
// burning to gold, a black slit; its bulk the drowned dark of the fen, grey-green, mottled paler, barnacled, hung with
// weed; its arms pale, veined violet, their suckers paler rings; its maw's lining a deep wet violet, its teeth old
// ivory, its gullet burning deep inside. Nothing cyan.

const SCLERA: Ramp = ['#4c4642', '#7c7266', '#a89c8a', '#cdc1a9', '#e9dfc6'];
const VEIN: Ramp = ['#2e1830', '#4a2448', '#6e3466', '#8c4a7a', '#a8649a'];
const BULK: Ramp = ['#0e1012', '#1a1d1e', '#2a2f2c', '#3d443d', '#545c50'];
const MOTTLE: Ramp = ['#1e2020', '#30322e', '#474a42', '#5e6256', '#767a6a'];
const ARM: Ramp = ['#2a2624', '#4a443e', '#736a5e', '#9c9282', '#c2b6a0'];
const SUCKER: Ramp = ['#3a3234', '#665a58', '#968678', '#baaa98', '#d6c8b2'];
const MAW: Ramp = ['#120812', '#24102a', '#3a1a40', '#552858', '#723a70'];
const TOOTH: Ramp = ['#4a4436', '#7a705a', '#aea286', '#d4caae', '#efe7cf'];
const WEED: Ramp = ['#152014', '#21301c', '#304426', '#435a32', '#586e3e'];
/** Its spines and hooks: old horn and bone. */
const HORN: Ramp = ['#1c1418', '#33262a', '#54443e', '#7a6a5a', '#a6947c'];
const BARNACLE: Ramp = ['#38383a', '#58585a', '#7e7c7a', '#a4a09a', '#c6c2ba'];
/** Its pupil: a black slit. */
const PUPIL = '#100810';
/** The fen's water, that what of it is under the surface is seen through (art/fen.ts's, at the pool), and its light where it breaks the surface. */
const WATER: V3 = [0x18, 0x24, 0x1d];
const WATER_DEEP: V3 = [0x10, 0x18, 0x14];
const FOAM = '#5c7060';
/** The enemy's fire, which shows through the water brighter than the rest of it. */
const BURNS = new Set<string>([...FLAME].map((c) => c.toLowerCase()));

// ---------------------------------------------------------------------------------------------
// ITS MEASURES, in its own lengths (TILE3 to a tile)

/** Its eye's radius: his pick, “Huge: its eye as wide as the pool”. */
export const EYE_R = 70;
/** Its eye's middle over the water when it has risen, and under it when it lurks (phase 1), staring up through it. */
export const EYE_HIGH = 38;
export const EYE_DEEP = -82;
/**
 * The pool it lives in: the planning chat's fen had its rim at 1.95 tiles across x and 1.62 across y, the ruin's ring of
 * paving out to 3.5 and 3.0; his word, 15 Oct, 16:35, “The ring should be bigger, outer ring and inner ring.  He looks
 * squished in the middle and the warrior needs room to maneuver”: the pool half again as wide, 2.9 by 2.5, the paving
 * out to 6.0 by 5.2, about three tiles of it to fight on (the level's own pool and ring are the main chat's). Wider again
 * on his word, 15 Oct, 20:23: “Can the ring be wider?  I think the inner circle is a good size but it just needs to be
 * wider for more movement”: the pool as it was, the paving out to 8.0 by 7.0, about five tiles of it. What of it is
 * under the water is seen only within the pool.
 */
export const EYE_POOL = { rx: 2.9 * TILE3, ry: 2.5 * TILE3 };
/** The ruin's ring of paving round the pool, out to its edge (as above). */
export const EYE_RING = { rx: 8.0 * TILE3, ry: 7.0 * TILE3 };
/** How deep under the water anything of it is still seen. */
const SEEN_DEEP = 40;
/** Its canvas, and where on it the middle of the pool is, at the water. */
export const EYE_CANVAS = { w: 860, h: 790, ax: 430, ay: 500 };
const EYE_AURA = { x: EYE_CANVAS.ax, y: EYE_CANVAS.ay - 80, r: 190, color: '#ff3a78', a: 0.07 };

/** Its own way: forward (toward whoever stands before the pool), its left, up; in the figure's own space, facing the eye when seen from in front. */
const FW: V3 = [Math.SQRT1_2, -Math.SQRT1_2, 0];
const LF: V3 = [Math.SQRT1_2, Math.SQRT1_2, 0];
const UP: V3 = [0, 0, 1];
/** A point of it in its own measures (forward, left, up) in the figure's space. */
const W = (f: number, l: number, u: number): V3 => add(add(mul(FW, f), mul(LF, l)), mul(UP, u));
/** Turned round its up by `deg` (toward its left). */
const yawed = (v: V3, deg: number): V3 => {
  const c = Math.cos(deg * D);
  const s = Math.sin(deg * D);
  const f = dot(v, FW);
  const l = dot(v, LF);
  return add(add(mul(FW, f * c - l * s), mul(LF, f * s + l * c)), mul(UP, v[2]));
};
/** Turned about the line through `o` along `k` (a unit) by `deg`. */
function turnedAbout(p: V3, o: V3, k: V3, deg: number): V3 {
  const v = sub(p, o);
  const c = Math.cos(deg * D);
  const s = Math.sin(deg * D);
  return add(o, add(add(mul(v, c), mul(cross(k, v), s)), mul(k, dot(k, v) * (1 - c))));
}

// ---------------------------------------------------------------------------------------------
// ITS POSE

/** One of its arms: where it leaves its bulk (`a` degrees round from forward, toward its left; `r0` out; `z0` high), how long and thick, how it rises (`rise` degrees over level at its root, turning `bend` degrees along it and `curl` more toward its tip; less than level, back down), and how it waves side to side. */
export interface ArmPose {
  a: number;
  r0: number;
  z0: number;
  long: number;
  thick: number;
  rise: number;
  bend: number;
  curl: number;
  wave: number;
  phase: number;
  /** Its veins burning with the enemy's fire as it gathers to strike (0 to 1). */
  burn?: number;
  /** How far its tip trails round sideways, degrees (an arm whipped round, its tip lagging). */
  yaw?: number;
}

export interface EyePose {
  /** Its eye's middle, how high (over the water, or under it). */
  zE: number;
  /** Its bulk's shift as it heaves. */
  heave: V3;
  /** Which way the face of it is turned: degrees up from forward (looking up through the water, under it). */
  tilt: number;
  /** Its lids: 0 open, 1 shut. */
  lid: number;
  /** How far its eye is torn open into its maw: 0 whole, 1 wide. */
  split: number;
  /** Where its eye looks, in the eye's own measures (forward, left, up). */
  look: V3;
  /** Its pupil's slit: how wide (a share of its iris). */
  slit: number;
  /** Its veins burning with the siege's magic (phase 3): 0 to 1. */
  blaze: number;
  /** How hard its iris burns. */
  glow: number;
  arms: ArmPose[];
  alive: boolean;
  /** Water falling off it: where each drop is, its colour and size (laid over all, no seam). */
  drops?: [V3, string, number][];
  /** Rings spreading on the water's surface: their middles (on the surface), and how far out each ring is. */
  ripples?: [V3, number][];
  /** Marks on the ruin's floor under it: a slam's shadow falling (the warning), the stones cracked along its line. */
  marks?: FloorMark[];
  /** His gaze: a fan of light from his eye (`from`) down onto the floor along a line (`a` to `b`), `k` how strong. */
  beams?: { from: V3; a: V3; b: V3; k: number; t: number }[];
  /** The stones his gaze has swept, from `from` degrees round to `to`: how long since it passed each (`age`), all of it fading as `fade` falls. */
  burnt?: { from: number; to: number; age: (deg: number) => number; fade: number };
  /** Streaks through the air (the draught of his breath): each a line through its points, its head first, laid over all. */
  streaks?: { pts: V3[]; c: string }[];
  /** How far his face is turned round from his forward, toward his left, in degrees (none if not given). */
  turn?: number;
  /** Globs of his bile in flight: where each is, which way it flies, how big. */
  globs?: { at: V3; dir: V3; r: number; ramp?: Ramp }[];
  /** His splash's wave: `r` of the way from the pool's rim across the ring, `h` high (his lengths), `t` the time (for its foam). */
  wave?: { r: number; h: number; t: number };
  /** Eyespawn's eggs flung through the air: where each is, how far it has tumbled (radians), how big. */
  eggs?: { at: V3; spin: number; r: number }[];
}
/** A mark on the floor: a shadow along a line, `w` wide, `k` how dark (0 to 1); or the cracks it leaves, `k` how fresh. */
export interface FloorMark {
  kind: 'shadow' | 'crack' | 'scorch' | 'aim' | 'spot';
  a: V3;
  b: V3;
  w: number;
  k: number;
  seed: number;
}

/** ITS CROWN OF ARMS, risen: seven rearing high round its eye, their tips curling; four more coiled out under the water. */
const ARMS_RISEN: ArmPose[] = [
  { a: 40, r0: 62, z0: -30, long: 270, thick: 17, rise: 70, bend: 18, curl: -175, wave: 9, phase: 0.3 },
  { a: -44, r0: 62, z0: -30, long: 256, thick: 16.5, rise: 68, bend: 22, curl: -185, wave: 10, phase: 2.1 },
  { a: 82, r0: 66, z0: -32, long: 318, thick: 18.5, rise: 76, bend: 10, curl: -150, wave: 12, phase: 1.2 },
  { a: -88, r0: 66, z0: -32, long: 300, thick: 18, rise: 77, bend: 8, curl: -160, wave: 12, phase: 4.4 },
  { a: 128, r0: 68, z0: -34, long: 340, thick: 19, rise: 80, bend: 4, curl: 140, wave: 10, phase: 3.7 },
  { a: -134, r0: 68, z0: -34, long: 326, thick: 19, rise: 81, bend: 4, curl: 150, wave: 10, phase: 0.9 },
  { a: 178, r0: 70, z0: -34, long: 290, thick: 18, rise: 84, bend: 2, curl: 160, wave: 8, phase: 5.1 },
  { a: 18, r0: 70, z0: -28, long: 170, thick: 14, rise: 0, bend: 2, curl: 50, wave: 20, phase: 0.8 },
  { a: -20, r0: 70, z0: -28, long: 166, thick: 14, rise: 0, bend: 2, curl: -50, wave: 19, phase: 3.0 },
  { a: 156, r0: 72, z0: -30, long: 150, thick: 13, rise: 0, bend: 2, curl: 40, wave: 18, phase: 2.6 },
  { a: -158, r0: 72, z0: -30, long: 150, thick: 13, rise: 0, bend: 2, curl: -40, wave: 18, phase: 5.6 },
];
/** UNDER THE WATER: its arms coiled out under it, two breaking the surface in arcs, like a serpent's back. */
const ARMS_UNDER: ArmPose[] = [
  { a: 40, r0: 62, z0: -22, long: 132, thick: 16, rise: 64, bend: -170, curl: 0, wave: 10, phase: 0.3 },
  { a: -70, r0: 62, z0: -22, long: 124, thick: 15.5, rise: 66, bend: -175, curl: 0, wave: 9, phase: 2.1 },
  { a: 110, r0: 68, z0: -22, long: 170, thick: 14, rise: 0, bend: 2, curl: 50, wave: 20, phase: 1.2 },
  { a: -120, r0: 68, z0: -22, long: 170, thick: 14, rise: 0, bend: 2, curl: -50, wave: 20, phase: 4.4 },
  { a: 175, r0: 70, z0: -22, long: 150, thick: 13, rise: 0, bend: 2, curl: 40, wave: 18, phase: 5.1 },
  { a: 5, r0: 70, z0: -20, long: 160, thick: 13, rise: 0, bend: 2, curl: -40, wave: 20, phase: 0.8 },
];

/** Where it looks to look at you: toward the eye of whoever looks from in front, a little down. */
const AT_YOU: V3 = norm([0.9, 0, 0.36]);

/** Its poses for its look: risen (phase 2), lurking under the water (phase 1), torn open into its maw, blazing (phase 3). */
export type EyeLook = 'risen' | 'under' | 'maw' | 'blaze';
export function lookPose(kind: EyeLook): EyePose {
  const P: EyePose = { zE: EYE_HIGH, heave: [0, 0, 0], tilt: 14, lid: 0.22, split: 0, look: AT_YOU, slit: 0.09, blaze: 0, glow: 1, arms: ARMS_RISEN, alive: true };
  if (kind === 'under') return { ...P, zE: EYE_DEEP, tilt: 72, look: norm([1, 0, 0.12]), lid: 0.1, glow: 1.4, arms: ARMS_UNDER };
  if (kind === 'maw') return { ...P, zE: EYE_HIGH + 6, lid: 0, split: 1, slit: 0.07, glow: 1.3 };
  if (kind === 'blaze') return { ...P, lid: 0.1, blaze: 1, slit: 0.13, glow: 1.7 };
  return P;
}

// ---------------------------------------------------------------------------------------------
// ITS STANDS: never still (his words, 16:43: “We want really wild and big for these animations.  Lots of motion”)

/** RISEN (phases 2 and 3): heaving, its arms thrashing and writhing all through, its eye darting, blinking once; water pouring off it. */
export const EYE_STAND = { frames: 45, fps: 15, period: 3.0 } as const;
/** UNDER THE WATER (phase 1): its eye glowing up through the pool, pulsing, roving; its arms rolling at the surface; rings spreading. */
export const EYE_LURK = { frames: 45, fps: 15, period: 3.0 } as const;
/** Its blink, in its stand. */
export const EYE_HABITS = { blink: [2.2, 2.52], dart: [1.05, 1.7] } as const;

const TAU = Math.PI * 2;
/** A swell from nothing at `a` to its fullest half way and back to nothing at `b`, smooth at both ends. */
const bump = (t: number, a: number, b: number): number => (t <= a || t >= b ? 0 : Math.pow(Math.sin((Math.PI * (t - a)) / (b - a)), 2));
/** An arm in motion: its base pose stirred by `t` seconds of a round of `T` (whole turns only, so the round closes); `wild` how hard. */
function writhing(A: ArmPose, i: number, t: number, T: number, wild: number): ArmPose {
  const w = (TAU * t) / T;
  if (A.rise <= 10) {
    // lying under the water: coiling and uncoiling sideways, rolling along the bottom
    return { ...A, a: A.a + 7 * wild * Math.sin(w + i), curl: A.curl + 45 * wild * Math.sin(w + 1.7 * i), wave: A.wave * (1 + 0.4 * Math.sin(2 * w + i)), phase: A.phase + 2 * w };
  }
  return {
    ...A,
    a: A.a + 9 * wild * Math.sin(w + 0.9 * i),
    rise: A.rise + 9 * wild * Math.sin(w + 1.3 * i),
    bend: A.bend + 30 * wild * Math.sin(2 * w + 0.7 * i),
    curl: A.curl + 70 * wild * Math.sin(w + 2.1 * i) * Math.sign(A.curl || 1),
    wave: A.wave * (1 + 0.6 * Math.sin(w + i)),
    phase: A.phase + (i % 2 ? 2 : 1) * w,
  };
}
/** Drops of water falling off its arms and brow: `n` of them through a round, each from where it let go, falling. */
function dripping(P0: (t: number) => EyePose, t: number, T: number, n: number): [V3, string, number][] {
  const out: [V3, string, number][] = [];
  const LIFE = 0.55;
  for (let i = 0; i < n; i++) {
    const t0 = fr(i * 0.618 + 0.11) * T;
    const dt = fr((t - t0) / T) * T;
    if (dt > LIFE) continue;
    const P = P0(t0);
    const rearing = P.arms.filter((A) => A.rise > 10);
    if (!rearing.length) continue;
    const A = rearing[i % rearing.length];
    const sp = armSpine(P, A, 26);
    const at = sp[Math.floor(8 + hash(i, 1, 99) * 15)];
    const from = add(at.p, mul(at.inner, -at.r * 0.9));
    const p: V3 = [from[0], from[1], from[2] - 0.5 * 620 * dt * dt];
    if (p[2] < 0) continue;
    out.push([p, hash(i, 2, 99) > 0.5 ? '#8c9e92' : '#b4c0b6', 2]);
    // (a long fall streaks)
    if (dt > 0.2) out.push([[p[0], p[1], p[2] + 3 + dt * 8], '#6e8076', 2]);
  }
  return out;
}

/** ITS STAND, risen: `t` seconds in. */
export function standPose(t0: number): EyePose {
  const T = EYE_STAND.period;
  const t = fr(t0 / T) * T;
  const w = (TAU * t) / T;
  const base = lookPose('risen');
  const pose = (tt: number): EyePose => {
    const ww = (TAU * tt) / T;
    const dart = bump(tt, EYE_HABITS.dart[0], EYE_HABITS.dart[1]);
    return {
      ...base,
      heave: [3 * Math.sin(ww) * FW[0] + 4 * Math.sin(ww) * LF[0], 3 * Math.sin(ww) * FW[1] + 4 * Math.sin(ww) * LF[1], 6 * Math.sin(2 * ww + 0.6)],
      zE: EYE_HIGH + 6 * Math.sin(2 * ww + 0.6),
      tilt: base.tilt + 5 * Math.sin(ww + 0.4),
      look: norm([0.9, 0.22 * Math.sin(ww) + 0.38 * dart, 0.36 + 0.12 * Math.sin(2 * ww)]),
      lid: base.lid + (1 - base.lid) * bump(tt, EYE_HABITS.blink[0], EYE_HABITS.blink[1]) + 0.12 * Math.sin(2 * ww),
      slit: 0.09 + 0.03 * Math.sin(2 * ww + 1),
      glow: 1 + 0.25 * Math.sin(2 * ww),
      arms: base.arms.map((A, i) => writhing(A, i, tt, T, 1)),
    };
  };
  const P = pose(t);
  P.drops = dripping(pose, t, T, 26);
  // rings where its arms break the water, and round its bulk
  P.ripples = [];
  for (let k = 0; k < 3; k++) P.ripples.push([[0, 0, 0], EYE_R * 0.9 + 60 * fr(t / T * 2 + k / 3)]);
  void w;
  return P;
}

/** ITS LURK, under the water: `t` seconds in. */
export function lurkPose(t0: number): EyePose {
  const T = EYE_LURK.period;
  const t = fr(t0 / T) * T;
  const w = (TAU * t) / T;
  const base = lookPose('under');
  const P: EyePose = {
    ...base,
    heave: [0, 0, 3 * Math.sin(w)],
    zE: EYE_DEEP + 3 * Math.sin(w),
    tilt: base.tilt + 6 * Math.sin(w + 1),
    look: norm([1, 0.3 * Math.sin(w), 0.12 + 0.15 * Math.sin(2 * w)]),
    glow: 1.4 + 0.45 * Math.sin(2 * w),
    slit: 0.09 + 0.04 * Math.sin(2 * w + 1),
    arms: base.arms.map((A, i) => (A.rise > 10 ? { ...A, rise: A.rise + 12 * Math.sin(w + i * 2), bend: A.bend + 25 * Math.sin(w + i * 2 + 1), a: A.a + 10 * Math.sin(w + i), phase: A.phase + 2 * w, wave: A.wave * (1 + 0.5 * Math.sin(w)) } : writhing(A, i, t, T, 1.2))),
  };
  // rings spreading over its eye, and where its arms break the surface
  P.ripples = [];
  const iris = W(18, 0, 0);
  for (let k = 0; k < 3; k++) P.ripples.push([iris, 70 * fr(t / T * 2 + k / 3)]);
  return P;
}

// ---------------------------------------------------------------------------------------------
// HIS TENTACLE MOVES (his picks, by 16:12): “Rear up high and slam down in a line”, “Sweep across the whole ring”, and
// (painted on its own, below) “Burst up under you from glowing cracks”. Each from either stand: risen, or under the
// water (phase 1), its arms coming up out of the pool. `aim`: the way the blow goes, degrees round from his forward
// toward his left (the game aims it at you).

/** THE SLAM: an arm rears up out of the pool, towering, held high and trembling as its shadow falls along its line (the warning); it falls like a tree and slams the stones along the line, cracking them, rubble flying; held; it drags back into the pool. `reach` in tiles, from the pool's middle. */
export const EYE_SLAM = { long: 2.4, rear: 0.7, fall: 1.15, hit: 1.3, freeze: 0.12, drag: [1.62, 2.2], length: 250, fps: 30 } as const;
/** THE SWEEP: an arm rises out of the pool to one side and coils back, cocked and trembling (the warning); it whips round the ring low over the stones through `arc` degrees, centred on its aim, spray and rubble flying, overshoots, and sinks back. */
export const EYE_SWEEP = { long: 2.4, cock: 0.6, sweep: [1.0, 1.42], over: 1.68, back: [1.75, 2.3], arc: 170, reach: 6.2, fps: 30 } as const;

const sm = (v: number): number => {
  const c = cl01(v);
  return c * c * (3 - 2 * c);
};
const easeIn = (v: number): number => cl01(v) * cl01(v) * cl01(v);
/** Where along the floor `r` of its lengths out on the line `aim` lies (on the floor). */
const onLine = (aim: number, r: number): V3 => W(Math.cos(aim * D) * r, Math.sin(aim * D) * r, 0);
/** The pool's rim on the line `aim` (in its own lengths). */
function rimOn(aim: number): number {
  const d = onLine(aim, 1);
  return 1 / Math.hypot(d[0] / EYE_POOL.rx, d[1] / EYE_POOL.ry);
}
/** The ring's outer edge on the line `aim` (in its own lengths). */
function ringOn(aim: number): number {
  const d = onLine(aim, 1);
  return 1 / Math.hypot(d[0] / EYE_RING.rx, d[1] / EYE_RING.ry);
}
/** Degrees round from `from`, wrapped to within half a turn of it. */
const near180 = (deg: number, from: number): number => from + ((((deg - from) % 360) + 540) % 360) - 180;
/** Flung things: `n` of them from `at` (a point or a spread of points) from `t0`, flying `speed` out and up, falling, `life` long. */
function flung(t: number, t0: number, n: number, from: (i: number) => V3, speed: number, up: number, life: number, cols: string[], seed: number, size = 2): [V3, string, number][] {
  const out: [V3, string, number][] = [];
  const dt = t - t0;
  if (dt < 0 || dt > life) return out;
  for (let i = 0; i < n; i++) {
    const a = hash(i, 1, seed) * TAU;
    const v = speed * (0.4 + 0.8 * hash(i, 2, seed));
    const vz = up * (0.5 + 0.8 * hash(i, 3, seed));
    const o = from(i);
    const p: V3 = [o[0] + Math.cos(a) * v * dt, o[1] + Math.sin(a) * v * dt, o[2] + vz * dt - 0.5 * 700 * dt * dt];
    if (p[2] < 0) continue;
    out.push([p, cols[i % cols.length], hash(i, 4, seed) > 0.7 ? size + 1 : size]);
  }
  return out;
}
/** Water thrown up: its colours. */
const SPRAY = ['#9aaaa0', '#c0cac2', '#748a7e', '#dfe6e0'];
/** The ruin's stones broken: their colours. */
const RUBBLE = ['#4e4a56', '#64606c', '#7c7884', '#3a3741', '#2e3a22'];
/** His bile: a sickly yellow-green, dull (it gives no light). */
const BILE: Ramp = ['#262a0e', '#424a16', '#646e20', '#8c982e', '#b6bf52'];
const BILE_DROPS = [BILE[2], BILE[3], BILE[1], BILE[4]];
/** The muck of the fen's bottom he spews up: near black, green in its sheen. */
const MUCK: Ramp = ['#0c100a', '#1e2616', '#303c20', '#4a582e', '#6e7c46'];
const MUCK_DROPS = [MUCK[1], MUCK[2], MUCK[3], MUCK[0]];
/** An eyespawn's egg: a pale sac, as the fen's eggs (floor10.ts). */
const EGG: Ramp = ['#3e3a32', '#555043', '#6d6654', '#857c66', '#9a9078'];

/** The arm that strikes, from where it leaves the pool on `aim`. */
function striker(aim: number, long: number, thick: number, rise: number, bend: number, curl: number, wave: number, phase: number, z0 = -24, r0 = 42): ArmPose {
  return { a: aim, r0, z0, long, thick, rise, bend, curl, wave, phase };
}

function slamPose(t: number, under: boolean, aim: number, clock = 0): EyePose {
  const S = EYE_SLAM;
  const base = under ? lurkPose(clock + t) : standPose(clock + t);
  // (it comes up out of the pool just inside its rim, clear of his bulk, the greatest of his arms: towering, and as long on the stones)
  const r0 = rimOn(aim) - 20;
  const long = S.length;
  const reach = r0 + long;
  let A: ArmPose | null = null;
  let lean = 0;
  if (t < S.rear) {
    const e = sm(t / S.rear);
    // (it rears up and out over you like a cobra, its tip hooked down at you)
    A = { ...striker(aim, 40 + (long - 40) * e, 30, 40 + 32 * e, 34 * e, -175 * e, 8, t * 9, -30 + 8 * e, r0), burn: 0.5 * e };
    lean = e;
  } else if (t < S.fall) {
    // held high, trembling, coiled to strike
    const tr = Math.sin(t * 46) * (0.3 + 0.7 * (t - S.rear) / (S.fall - S.rear));
    A = { ...striker(aim, long, 30, 72 + 1.5 * tr, 34, -175 + 5 * tr, 3, S.rear * 9 + (t - S.rear) * 3, -22, r0), burn: 0.5 + 0.5 * (t - S.rear) / (S.fall - S.rear) };
    lean = 1;
  } else if (t < S.hit) {
    // it falls like a tree, faster and faster, its tip lagging and then cracking down
    const f = easeIn((t - S.fall) / (S.hit - S.fall));
    A = { ...striker(aim, long, 30, 72 - 68 * f, 34 - 42 * f, -175 * (1 - f) + 60 * Math.sin(Math.PI * f), 4, t * 9, -22 + 18 * f, r0), burn: 1 };
    // (his bulk comes down with it, but heavily, not in one leap)
    lean = 1 - 0.45 * sm((t - S.fall) / (S.hit - S.fall));
  } else if (t < S.hit + 0.3) {
    lean = 0.55 * (1 - sm((t - S.hit) / 0.3));
  }
  if (t >= S.hit && t < S.drag[0]) {
    // slammed down along its line, bouncing, writhing on the stones
    const k = (t - S.hit) / (S.drag[0] - S.hit);
    const bounce = 7 * Math.exp(-6 * k) * Math.sin(k * 26);
    A = { ...striker(aim, long, 30, 4 + Math.max(0, bounce), -8, 0, 5 + 6 * k, t * 14, -4, r0), burn: 1 - k };
  } else if (t >= S.drag[0] && t < S.drag[1]) {
    // dragged back into the pool, rising off the stones as it goes
    const k = sm((t - S.drag[0]) / (S.drag[1] - S.drag[0]));
    A = striker(aim, long - (long - 30) * k, 30, 4 + 26 * k, -8 + 8 * k, 0, 9, t * 14, -4 - 26 * k, r0);
  }
  const P: EyePose = { ...base, arms: A && A.long > 32 ? [...base.arms, A] : base.arms };
  // its whole bulk rears back as the arm rears, and jolts down at the slam
  const jolt = t >= S.hit && t < S.hit + 0.3 ? -7 * Math.pow(Math.sin((Math.PI * (t - S.hit)) / 0.3), 2) : 0;
  P.heave = add(base.heave, add(mul(FW, -10 * lean), [0, 0, 4 * lean + jolt]));
  P.zE = base.zE + 4 * lean * (under ? 0 : 1) + jolt;
  P.look = norm([Math.cos(aim * D), Math.sin(aim * D), under ? 0.1 : 0.15]);
  P.glow = base.glow + 0.8 * lean + (t >= S.hit && t < S.hit + 0.3 ? 0.8 : 0);
  P.slit = 0.05 + 0.04 * (1 - lean);
  P.lid = under ? base.lid : 0.12;
  const rim = rimOn(aim);
  const from = onLine(aim, rim);
  const to = onLine(aim, reach);
  P.marks = [];
  // its shadow falling along its line as it rears (the warning), darkening, widest as it falls
  if (t > S.rear * 0.6 && t < S.hit) P.marks.push({ kind: 'shadow', a: from, b: to, w: 16 + 22 * sm((t - S.rear * 0.6) / (S.hit - S.rear * 0.6)), k: sm((t - S.rear * 0.6) / (S.fall - S.rear * 0.6)), seed: 1 });
  // the stones cracked along its line
  if (t >= S.hit) P.marks.push({ kind: 'crack', a: onLine(aim, rim + 4), b: onLine(aim, reach + 8), w: 10, k: 1 - cl01((t - 2.0) / 0.4), seed: 7 });
  if (t >= S.hit) for (const side of [-1, 1]) P.marks.push({ kind: 'crack', a: add(onLine(aim, rim + 20), onLine(aim + 90 * side, 14)), b: add(onLine(aim, reach - 20), onLine(aim + 90 * side, 18)), w: 8, k: 1 - cl01((t - 2.0) / 0.4), seed: 8 + side });
  // water thrown up where it leaves the pool, rubble and dust flung along the line at the slam
  const drops = [...(base.drops ?? [])];
  drops.push(...flung(t, 0.05, 26, () => onLine(aim, r0 + 30), 90, 260, 0.75, SPRAY, 41));
  drops.push(...flung(t, S.hit, 90, (i) => onLine(aim, rim + ((reach - rim) * (i + 0.5)) / 90), 80, 300, 0.75, RUBBLE, 43, 4));
  drops.push(...flung(t, S.hit, 70, (i) => onLine(aim, rim + ((reach - rim) * (i + 0.5)) / 70), 40, 120, 0.5, ['#5e5a52', '#7a7468', '#46423e'], 44, 3));
  drops.push(...flung(t, S.hit, 40, (i) => onLine(aim, rim + ((reach - rim) * (i + 0.5)) / 40), 140, 180, 0.5, SPRAY, 45, 3));
  drops.push(...flung(t, S.drag[0], 18, () => onLine(aim, rim), 80, 220, 0.6, SPRAY, 47));
  P.drops = drops;
  return P;
}

function sweepPose(t: number, under: boolean, aim: number, clock = 0): EyePose {
  const S = EYE_SWEEP;
  const base = under ? lurkPose(clock + t) : standPose(clock + t);
  const reach = S.reach * TILE3;
  // (it rises out of the pool on the side before you, coils back, and whips round past you and on behind)
  const a0 = aim + S.arc / 2;
  const a1 = aim - S.arc / 2;
  const way = Math.sign(a1 - a0);
  const r0 = rimOn(a0) - 22;
  const long = reach - r0;
  let A: ArmPose | null = null;
  let cock = 0;
  let speed = 0;
  let ang = a0;
  if (t < S.cock) {
    const e = sm(t / S.cock);
    A = { ...striker(a0 - 14 * way * e, 40 + (long - 40) * e, 27, 40 + 20 * e, 22 * e, -130 * e, 8, t * 9, -26 + 18 * e, r0), burn: 0.4 * e };
    cock = e;
  } else if (t < S.sweep[0]) {
    // cocked back, coiled high and trembling, drawn round further, burning (the warning)
    const k = (t - S.cock) / (S.sweep[0] - S.cock);
    const tr = Math.sin(t * 46) * (0.3 + 0.7 * k);
    A = { ...striker(a0 - (14 + 12 * sm(k)) * way, long, 27, 60 + 1.5 * tr, 22, -130 + 5 * tr, 4, S.cock * 9 + (t - S.cock) * 3, -8, r0), burn: 0.4 + 0.6 * k };
    cock = 1;
    ang = a0 - (14 + 12 * sm(k)) * way;
  } else if (t < S.sweep[1]) {
    // THE SWEEP: whipped round the ring, low over the stones, its tip trailing
    const k = (t - S.sweep[0]) / (S.sweep[1] - S.sweep[0]);
    const e = k < 0.5 ? 2 * k * k : 1 - 2 * (1 - k) * (1 - k);
    ang = a0 - 26 * way + (a1 + 12 * way - (a0 - 26 * way)) * e;
    speed = Math.sin(Math.PI * k);
    cock = 1 - sm(k * 1.5);
    const flat = sm(k * 4);
    A = { ...striker(ang, long, 27, 60 - 46 * flat, 22 - 34 * flat, -130 * (1 - flat), 3, t * 9, -8 + 4 * flat, r0), yaw: -70 * way * speed * flat, burn: 1 - k * 0.5 };
  } else if (t < S.over) {
    // overshoot, slowing, its tip whipping on round
    const k = (t - S.sweep[1]) / (S.over - S.sweep[1]);
    ang = a1 + (12 + 14 * sm(k)) * way;
    A = { ...striker(ang, long, 27, 14 + 6 * k, -12, 0, 5, t * 9, -4, r0), yaw: 50 * way * Math.sin(Math.PI * k), burn: 0.5 * (1 - k) };
  } else if (t < S.back[1]) {
    const k = sm((t - S.back[0]) / (S.back[1] - S.back[0]));
    ang = a1 + 26 * way;
    A = striker(ang, long - (long - 30) * k, 27, 20 + 20 * k, -12 + 12 * k, 0, 8, t * 9, -4 - 24 * k, r0);
  }
  const P: EyePose = { ...base, arms: A && A.long > 32 ? [...base.arms, A] : base.arms };
  P.heave = add(base.heave, add(mul(W(Math.cos(a0 * D), Math.sin(a0 * D), 0), -8 * cock), [0, 0, 5 * cock]));
  const seen = Math.max(-70, Math.min(70, ang));
  P.look = norm([Math.cos(seen * D), Math.sin(seen * D), under ? 0.1 : 0.15]);
  P.glow = base.glow + 0.6 * cock + 0.8 * speed;
  P.slit = 0.05 + 0.04 * (1 - cock);
  P.lid = under ? base.lid : 0.1;
  // spray where it rises; spray and rubble flung off the stones along its path, streaks of water behind it
  const drops = [...(base.drops ?? [])];
  drops.push(...flung(t, 0.05, 24, () => onLine(a0, r0 + 24), 90, 240, 0.7, SPRAY, 51));
  if (speed > 0.15) {
    for (let i = 0; i < 30; i++) {
      const r = rimOn(ang) + ((reach - rimOn(ang)) * (i + 0.5)) / 30;
      const behind = ang - (6 + 30 * hash(i, 1, 53)) * way;
      const lift = 8 + 30 * hash(i, 2, 53) * speed;
      drops.push([add(onLine(behind, r), [0, 0, lift]), SPRAY[i % SPRAY.length], hash(i, 3, 53) > 0.6 ? 3 : 2]);
      if (i % 3 === 0) drops.push([add(onLine(ang - 5 * way, r), [0, 0, 4 + 18 * hash(i, 4, 53)]), RUBBLE[i % RUBBLE.length], 3]);
    }
  }
  P.drops = drops;
  return P;
}

/**
 * HIS GAZE (his pick, “His gaze: a gold beam sweeping the arena”). The warning: he rears, his arms spreading out of its
 * way, his eye narrowing on where it will fall, the light gathering into his slit, sparks drawn into it, and a line of
 * his light flickering on the stones where it will start, pink brightening to gold. Then a fan of his gold light falls
 * from his eye onto the floor along a line from the pool's rim to the ring's edge, and sweeps round through `arc`
 * degrees centred on its aim (`gaze` toward his left, `gazeBack` toward his right), the stones burning along it, flames
 * and sparks off them, the stones it has passed glowing, then smouldering, then scorched; it dies; he blinks hard.
 * Where it hurts, at any time: the line from the pool's rim to the ring's edge at its angle (`gazeAngle`).
 */
export const EYE_GAZE = { long: 3.4, gather: 1.0, sweep: [1.05, 2.45], arc: 120, fade: 2.62, fps: 30 } as const;

/** Where his gaze falls at time `t` (degrees round from his front), or null when it is not burning. */
export function gazeAngle(t: number, aim: number, back = false): number | null {
  const G = EYE_GAZE;
  if (t < G.sweep[0] || t > G.fade) return null;
  const [a0, a1] = back ? [aim + G.arc / 2, aim - G.arc / 2] : [aim - G.arc / 2, aim + G.arc / 2];
  return a0 + (a1 - a0) * sm((t - G.sweep[0]) / (G.sweep[1] - G.sweep[0]));
}

function gazePose(t: number, aim: number, clock = 0, blaze = 0, back = false): EyePose {
  const G = EYE_GAZE;
  const base = standPose(clock + t);
  const P: EyePose = { ...base };
  const [a0, a1] = back ? [aim + G.arc / 2, aim - G.arc / 2] : [aim - G.arc / 2, aim + G.arc / 2];
  const span = G.sweep[1] - G.sweep[0];
  const k = t < G.sweep[0] ? 0 : sm((t - G.sweep[0]) / span);
  const ang = a0 + (a1 - a0) * k;
  const gather = sm(t / G.gather);
  // (it bursts on, burns, and dies)
  const strong = t < G.sweep[0] ? 0 : t < G.sweep[1] ? Math.min(1, (t - G.sweep[0]) / 0.06) : Math.max(0, 1 - (t - G.sweep[1]) / (G.fade - G.sweep[1]));
  const narrow = t < G.fade ? Math.max(gather, strong > 0 ? 1 : 0) : Math.max(0, 1 - (t - G.fade) / 0.3);
  const rim = rimOn(ang);
  const reach = ringOn(ang) - 3;
  // he rears, his bulk lifting as it burns
  P.heave = add(base.heave, [0, 0, 16 * narrow]);
  P.tilt = base.tilt + 6 * narrow;
  const E: V3 = add([0, 0, P.zE], P.heave);
  const mid = onLine(ang, rim + (reach - rim) * 0.55);
  const toward = norm(sub(mid, E));
  const lv: V3 = [dot(toward, FW), dot(toward, LF), dot(toward, UP)];
  P.look = norm(add(mul(base.look, 1 - narrow), mul(lv, narrow)));
  const blink = bump(t, G.fade, G.fade + 0.42);
  P.lid = base.lid * (1 - narrow) + 0.5 * narrow + (1 - 0.5 * narrow) * blink;
  P.slit = base.slit * (1 - narrow) + 0.02 * narrow;
  // (a flash as it bursts on)
  P.glow = base.glow + 1.3 * narrow + 1.5 * bump(t, G.sweep[0] - 0.04, G.sweep[0] + 0.2);
  P.blaze = blaze;
  // his arms spread out of its way, those by where it will start swung aside (its light falls over the rest); never
  // back over his eye
  P.arms = base.arms.map((A) => {
    if (A.rise <= 10) return A;
    const d0 = near180(A.a, a0) - a0;
    const aside = Math.abs(d0) < 70 ? Math.tanh(d0 / 10) * (1 - Math.abs(d0) / 70) * 70 * narrow : 0;
    return { ...A, rise: Math.min(A.rise + 10 * narrow, Math.max(A.rise, 80)), curl: A.curl * (1 - (0.5 * Math.abs(aside)) / 70), yaw: (A.yaw ?? 0) + aside };
  });
  const iris = add(E, mul(toward, EYE_R * 0.98));
  const drops = [...(base.drops ?? [])];
  // the light drawn into his slit as he gathers: sparks streaming in from all round
  if (gather > 0.04 && t < G.sweep[0] + 0.05) for (let i = 0; i < 22; i++) {
    const f = fr(t * 1.4 + hash(i, 5, 121));
    const a = (i / 22) * TAU + t * 1.5;
    const r = (30 + 120 * hash(i, 6, 121)) * (1 - f) * gather;
    drops.push([add(iris, [Math.cos(a) * r, Math.sin(a) * r * 0.7, Math.sin(a * 2 + i) * r * 0.5]), f > 0.7 ? FLAME[4] : FLAME[3], f > 0.7 ? 3 : 2]);
  }
  // sparks and steam flying off where it falls
  if (strong > 0.2) for (let i = 0; i < 26; i++) {
    const f = fr(t * 2.6 + hash(i, 3, 121));
    const at = onLine(ang + (hash(i, 1, 121) - 0.5) * 5, rim + (reach - rim) * hash(i, 2, 121));
    const out = (hash(i, 4, 121) - 0.5) * 30 * f;
    drops.push([add(at, [out, out * 0.5, 3 + 46 * f]), f < 0.35 ? FLAME[4] : f < 0.65 ? FLAME[3] : '#8c8890', f < 0.35 ? 3 : 2]);
  }
  P.drops = drops;
  P.beams = strong > 0 ? [{ from: iris, a: onLine(ang, rim + 2), b: onLine(ang, reach), k: strong, t }] : [];
  // the warning on the stones: a line of his light where it will start, flickering, pink brightening to gold
  P.marks = [];
  if (t < G.sweep[0]) {
    const w = sm((t - 0.15) / (G.gather - 0.15));
    if (w > 0) P.marks.push({ kind: 'aim', a: onLine(a0, rimOn(a0) + 3), b: onLine(a0, ringOn(a0) - 3), w: 1 + 2.4 * w, k: w, seed: Math.floor(t * 20) });
  }
  // the stones it has swept: glowing, smouldering, scorched; all of it gone as he settles
  if (t > G.sweep[0]) {
    const lo = Math.min(a0, a1);
    const hi = Math.max(a0, a1);
    P.burnt = {
      from: a0,
      to: ang,
      fade: 1 - sm((t - (G.long - 0.55)) / 0.5),
      age: (deg: number): number => {
        const d = near180(deg, aim);
        if (d < lo || d > hi) return -1;
        const kk = (d - a0) / (a1 - a0);
        if (kk > k) return -1;
        // (when it passed there: the sweep's easing turned back)
        const u = 0.5 - Math.sin(Math.asin(Math.max(-1, Math.min(1, 1 - 2 * kk))) / 3);
        return t - (G.sweep[0] + u * span);
      },
    };
  }
  return P;
}

/**
 * HIS CALL (his pick, “The siege's pink bolts raining down”): he rears and lifts his arms high, his eye rolled up to
 * the dome, his veins catching the siege's fire, its sparks streaming up off him; held while the bolts fall (each
 * painted on its own, `boltPainted`, laid by the game where it falls); he sinks back.
 */
export const EYE_CALL = { long: 2.4, raise: 0.6, hold: [0.6, 1.8], fps: 30 } as const;

function callPose(t: number, clock = 0): EyePose {
  const C = EYE_CALL;
  const base = standPose(clock + t);
  const P: EyePose = { ...base };
  const up = t < C.hold[1] ? sm(t / C.raise) : 1 - sm((t - C.hold[1]) / (C.long - C.hold[1]));
  const throb = 0.5 + 0.5 * Math.sin(t * 9);
  P.heave = add(base.heave, [0, 0, 14 * up]);
  P.zE = base.zE + 10 * up;
  P.tilt = base.tilt - 10 * up;
  // his eye rolled up to the dome, wide, burning
  P.look = norm(add(mul(base.look, 1 - up), mul(norm([0.35, 0, 1]) as V3, up)));
  P.lid = base.lid * (1 - up) + 0.04 * up;
  P.slit = base.slit * (1 - up) + 0.05 * up;
  P.glow = base.glow + up * (0.8 + 0.5 * throb);
  P.blaze = up * (0.55 + 0.25 * throb);
  // his arms lifted high, writhing
  // (high, but never back over his eye)
  P.arms = base.arms.map((A, i) => (A.rise <= 10 ? A : { ...A, rise: A.rise + (Math.max(A.rise, 82) - A.rise) * up, bend: A.bend - 10 * up, curl: A.curl * (1 - 0.6 * up), wave: A.wave + 4 * up, phase: A.phase + up * Math.sin(t * 5 + i) * 0.8 }));
  // the siege's sparks streaming up off him to the dome
  const drops = [...(base.drops ?? [])];
  if (up > 0.05) for (let i = 0; i < 26; i++) {
    const f = fr(t * 0.9 + hash(i, 1, 151));
    const a = hash(i, 2, 151) * TAU;
    const r = 30 + 60 * hash(i, 3, 151);
    const z = P.zE + 40 + 300 * f;
    if (f > 0.92) continue;
    drops.push([[Math.cos(a) * r * (1 - 0.6 * f), Math.sin(a) * r * (1 - 0.6 * f), z], f < 0.5 ? FLAME[2] : f < 0.8 ? FLAME[1] : FLAME[0], up > 0.5 && f < 0.3 ? 3 : 2]);
  }
  P.drops = drops;
  return P;
}

/**
 * HIS BILE (his pick, “Bile spat in arcs, leaving pools”): he rears back, his eye splitting half open into his maw,
 * bile drooling off its lips (the warning); he lurches forward three times, spitting a glob of it each time, high
 * over the ring, its shadow on the stones where it will land growing and darkening as it falls; each splashes down
 * (its pool painted on its own, `bilePainted`, laid by the game where it lands, `bileLanding`); his maw closes.
 */
export const EYE_SPIT = { long: 2.6, open: 0.7, spits: [0.85, 1.12, 1.39], fly: 0.8, close: [1.6, 2.2], fps: 30 } as const;
/** Where each glob lands: degrees off its aim, and how far out across the ring (0 its inner edge, 1 its outer). */
const SPIT_AT: [number, number][] = [[0, 0.42], [-22, 0.75], [24, 0.18]];

/** Where glob `i` of a spit aimed `aim` lands, on the floor (the figure's own measures). */
export function bileLanding(aim: number, i: number): V3 {
  const [off, far] = SPIT_AT[i % SPIT_AT.length];
  const a = aim + off;
  const rim = rimOn(a) + 8;
  return onLine(a, rim + (ringOn(a) - 8 - rim) * far);
}
/** Where a glob spat at time `ts` flies, `t` into the spit (null before it leaves his maw or once it has landed). */
function globAt(t: number, ts: number, from: V3, to: V3, high: number): V3 | null {
  const s = (t - ts) / EYE_SPIT.fly;
  if (s < 0 || s >= 1) return null;
  return add(add(from, mul(sub(to, from), s)), [0, 0, 4 * high * s * (1 - s)]);
}

function spitPose(t: number, aim: number, clock = 0): EyePose {
  const S = EYE_SPIT;
  const base = standPose(clock + t);
  const P: EyePose = { ...base };
  const open = t < S.close[0] ? sm(t / S.open) : 1 - sm((t - S.close[0]) / (S.close[1] - S.close[0]));
  // each spit: a lurch forward, his maw gaping wider
  let lurch = 0;
  for (const ts of S.spits) lurch = Math.max(lurch, bump(t, ts - 0.12, ts + 0.22));
  const F = norm(add(mul(FW, Math.cos(base.tilt * D)), mul(UP, Math.sin(base.tilt * D))));
  P.heave = add(add(base.heave, mul(FW, -10 * open + 16 * lurch)), [0, 0, 6 * open - 4 * lurch]);
  P.tilt = base.tilt + 8 * open - 6 * lurch;
  P.split = Math.min(1, 0.72 * open + 0.28 * lurch);
  P.lid = base.lid * (1 - open);
  P.glow = base.glow + 0.4 * open;
  P.arms = base.arms.map((A, i) => (A.rise <= 10 ? A : { ...A, rise: A.rise - 12 * lurch, phase: A.phase + 0.4 * lurch * Math.sin(i) }));
  const E: V3 = add([0, 0, base.zE], P.heave);
  const M = add(E, mul(F, EYE_R * 0.95));
  const drops = [...(base.drops ?? [])];
  // bile drooling off his lips as his maw opens
  if (open > 0.2) for (let i = 0; i < 10; i++) {
    const f = fr(t * 1.3 + hash(i, 1, 181));
    const x = (hash(i, 2, 181) - 0.5) * EYE_R * 0.9;
    drops.push([add(add(M, mul(LF, x)), [0, 0, -14 - 70 * f * f]), BILE_DROPS[i % 4], f < 0.3 ? 3 : 2]);
  }
  // THE GLOBS, flying high, dripping; and their splash as they land
  P.marks = [];
  S.spits.forEach((ts, i) => {
    const to = bileLanding(aim, i);
    const high = 120 + 40 * i;
    const g = globAt(t, ts, M, to, high);
    // (its shadow where it will land: from as it leaves, growing, darkening)
    const s = (t - ts) / S.fly;
    if (s > -0.15 && s < 1) P.marks!.push({ kind: 'spot', a: to, b: to, w: EYE_BILE.reach * TILE3, k: cl01(s), seed: i });
    if (g) {
      drops.push([g, BILE[3], 4]);
      for (let k = 1; k <= 4; k++) {
        const back = globAt(t - k * 0.035, ts, M, to, high);
        if (back) drops.push([add(back, [0, 0, -2 * k]), BILE_DROPS[k % 4], k < 3 ? 3 : 2]);
      }
      P.globs = [...(P.globs ?? []), { at: g, dir: norm(sub(globAt(t + 0.02, ts, M, to, high) ?? to, g)), r: 15 - i }];
    }
    drops.push(...flung(t, ts + S.fly, 18, () => add(to, [0, 0, 2]), 70, 160, 0.38, BILE_DROPS, 183 + i, 2));
  });
  P.drops = drops;
  return P;
}

/**
 * HIS BREATH AND BITE (his pick, “Breathes in, pulling you close, then bites”): he turns his face on you and his eye
 * tears open into his maw, wide; he rears back and breathes in, a great draught, water, stones, weed and the air
 * itself streaming across the ring into his maw, his gullet burning brighter (the warning, and the pull); he lunges at
 * you out of the pool, and his maw slams shut (THE BITE), held; he draws back and his eye heals shut, his face turning
 * back. Where it hurts: in front of his maw at the snap, out to `reach` tiles past the pool's rim along the aim.
 */
export const EYE_BITE = { long: 3.3, open: 0.45, inhale: [0.45, 1.95], snap: 2.1, hold: 0.12, back: [2.3, 3.1], lunge: 58, reach: 1.6, fps: 30 } as const;

function bitePose(t: number, aim: number, clock = 0): EyePose {
  const B = EYE_BITE;
  const base = standPose(clock + t);
  const P: EyePose = { ...base };
  const toward = near180(aim, 0);
  const face = t < B.back[0] ? sm(t / 0.5) : 1 - sm((t - B.back[0]) / (B.back[1] - B.back[0]));
  P.turn = toward * face;
  // his maw: torn open wide, slammed shut at the bite
  P.split = t < B.snap - 0.08 ? sm(t / B.open) : t < B.snap ? 1 - (t - (B.snap - 0.08)) / 0.08 : 0;
  P.lid = base.lid * (1 - face);
  // the breath: rearing back and swelling as he draws it in
  const breath = t < B.inhale[1] ? sm((t - B.inhale[0]) / 0.3) : Math.max(0, 1 - (t - B.inhale[1]) / 0.1);
  // the lunge: out at you, held through the bite, drawn back
  const lunge = t < B.inhale[1] ? 0 : t < B.snap ? easeIn((t - B.inhale[1]) / (B.snap - B.inhale[1])) : t < B.snap + B.hold ? 1 : 1 - sm((t - B.snap - B.hold) / (B.back[1] - B.snap - B.hold));
  const dir = onLine(aim, 1);
  P.heave = add(add(base.heave, mul(dir, -14 * breath + B.lunge * lunge)), [0, 0, 12 * breath - 10 * lunge]);
  P.tilt = base.tilt + 10 * breath - 8 * lunge;
  P.glow = base.glow + 0.6 * breath;
  // his arms braced out wide as he breathes in, whipped forward with the bite
  P.arms = base.arms.map((A, i) => (A.rise <= 10 ? A : { ...A, rise: A.rise - 16 * breath - 8 * lunge, wave: A.wave + 6 * breath, phase: A.phase + 0.6 * breath * Math.sin(t * 7 + i) }));
  const E: V3 = add([0, 0, base.zE], P.heave);
  const T = P.turn * D;
  const F = norm(add(mul(add(mul(FW, Math.cos(T)), mul(LF, Math.sin(T))), Math.cos(P.tilt * D)), mul(UP, Math.sin(P.tilt * D))));
  const M = add(E, mul(F, EYE_R * 0.5));
  const drops = [...(base.drops ?? [])];
  // THE DRAUGHT: across the ring and into his maw, faster as it nears it, each a streak
  if (t > B.inhale[0] && t < B.inhale[1] + 0.12) {
    const kinds = [SPRAY[1], SPRAY[0], RUBBLE[2], WEED[3], SPRAY[3], RUBBLE[1]];
    P.streaks = [];
    for (let i = 0; i < 64; i++) {
      const f = fr((t - B.inhale[0]) * 1.4 + hash(i, 1, 211));
      const born = t - f / 1.4;
      if (born < B.inhale[0] || born > B.inhale[1] - 0.15) continue;
      const a = toward + (hash(i, 2, 211) - 0.5) * 150;
      const r = rimOn(a) + (ringOn(a) - rimOn(a)) * (0.15 + 0.85 * hash(i, 3, 211));
      const from = add(onLine(a, r), [0, 0, 2 + 26 * hash(i, 4, 211)]);
      const side = hash(i, 5, 211) > 0.5 ? 1 : -1;
      const at = (q: number): V3 => {
        const e = Math.pow(q, 1.7);
        const p = add(from, mul(sub(M, from), e));
        const across = norm(cross(sub(M, from), UP), LF);
        return add(p, mul(across, side * 26 * Math.sin(q * Math.PI)));
      };
      const c = kinds[i % kinds.length];
      const size = c === RUBBLE[2] || c === RUBBLE[1] ? 4 : 3;
      drops.push([at(f), c, size]);
      // (its streak behind it, the longer the faster it goes)
      const pts: V3[] = [];
      for (let k = 0; k <= 5; k++) {
        const q = f - k * 0.06 * (0.5 + f);
        if (q > 0) pts.push(at(q));
      }
      if (pts.length > 1) P.streaks.push({ pts, c: i % 3 === 0 ? SPRAY[3] : SPRAY[1] });
    }
    // water torn up off the pool's face into it
    for (let i = 0; i < 16; i++) {
      const f = fr(t * 1.8 + i / 16);
      const a = toward + (hash(i, 6, 211) - 0.5) * 80;
      const from = onLine(a, rimOn(a) * (0.75 + 0.2 * hash(i, 7, 211)));
      drops.push([add(from, mul(sub(M, from), f * f)), f > 0.6 ? SPRAY[3] : SPRAY[1], 2]);
    }
  }
  // THE BITE: spray and spittle flung from his jaws as they slam
  drops.push(...flung(t, B.snap, 30, () => add(M, mul(F, 20)), 120, 140, 0.5, SPRAY, 213, 2));
  drops.push(...flung(t, B.snap, 12, () => add(M, mul(F, 20)), 90, 90, 0.4, [MAW[4], SCLERA[3]], 215, 2));
  P.drops = drops;
  return P;
}

/**
 * HIS EYESPAWN (his pick, “Spews eyespawn out of the muck”): he turns his face on you, heaving and retching, his maw
 * tearing open, the fen's muck welling up and bubbling at its lips (the warning); he spews a torrent of the muck out
 * across the ring before him, reaching further as he heaves, eggs tumbling out in it, flung in arcs (each landing
 * painted on its own, `spawnPainted`, laid by the game where it lands, `spawnLanding`); his maw shuts and he turns back.
 */
export const EYE_SPEW = { long: 3.0, retch: 0.85, spew: [0.9, 1.5], eggs: [0.98, 1.16, 1.34], fly: 0.6, close: [1.65, 2.3], fps: 30 } as const;
/** Where each egg lands: degrees off its aim, and how far out across the ring (0 its inner edge, 1 its outer). */
const SPAWN_AT: [number, number][] = [[-14, 0.3], [10, 0.55], [-4, 0.82]];

/** Where egg `i` of a spew aimed `aim` lands, on the floor (the figure's own measures). */
export function spawnLanding(aim: number, i: number): V3 {
  const [off, far] = SPAWN_AT[i % SPAWN_AT.length];
  const a = aim + off;
  const rim = rimOn(a) + 8;
  return onLine(a, rim + (ringOn(a) - 8 - rim) * far);
}

function spewPose(t: number, aim: number, clock = 0): EyePose {
  const S = EYE_SPEW;
  const base = standPose(clock + t);
  const P: EyePose = { ...base };
  const toward = near180(aim, 0);
  const face = t < S.close[1] ? sm(t / 0.5) : 1 - sm((t - S.close[1]) / (S.long - 0.15 - S.close[1]));
  P.turn = toward * face;
  // retching: his bulk heaving in jerks, harder as it comes up
  const retch = t < S.spew[0] ? sm(t / S.retch) : t < S.spew[1] ? 1 : Math.max(0, 1 - (t - S.spew[1]) / 0.5);
  const heaving = retch * (0.6 + 0.4 * Math.sin(t * 9)) * Math.sin(t * 15);
  const spewing = t < S.spew[0] ? 0 : t < S.spew[1] ? sm((t - S.spew[0]) / 0.2) : Math.max(0, 1 - (t - S.spew[1]) / 0.2);
  const dir = onLine(aim, 1);
  P.heave = add(add(base.heave, mul(dir, 10 * spewing - 6 * retch * (1 - spewing))), [0, 0, 5 * heaving + 8 * retch]);
  P.tilt = base.tilt + 4 * heaving - 6 * spewing;
  P.split = t < S.spew[0] ? 0.55 * sm(t / S.retch) : t < S.close[0] ? Math.min(1, 0.55 + 0.45 * sm((t - S.spew[0]) / 0.12)) : 1 - sm((t - S.close[0]) / (S.close[1] - S.close[0]));
  P.lid = base.lid * (1 - face);
  P.arms = base.arms.map((A, i) => (A.rise <= 10 ? A : { ...A, rise: A.rise - 6 * retch + 4 * heaving * Math.sin(i), phase: A.phase + 0.5 * heaving }));
  const E: V3 = add([0, 0, base.zE], P.heave);
  const T = P.turn * D;
  const F = norm(add(mul(add(mul(FW, Math.cos(T)), mul(LF, Math.sin(T))), Math.cos(P.tilt * D)), mul(UP, Math.sin(P.tilt * D))));
  const M = add(add(E, mul(F, EYE_R * 0.55)), [0, 0, -EYE_R * 0.2]);
  const drops = [...(base.drops ?? [])];
  // the muck welling up, bubbling at his lips and drooling off them
  if (retch > 0.1 && P.split > 0.2) for (let i = 0; i < 12; i++) {
    const f = fr(t * 1.6 + hash(i, 1, 221));
    const x = (hash(i, 2, 221) - 0.5) * EYE_R * 1.1;
    const side = norm(cross(UP, F), LF);
    drops.push([add(add(M, mul(side, x)), [0, 0, -6 - 60 * f * f]), MUCK_DROPS[i % 4], f < 0.3 ? 4 : 3]);
  }
  // THE TORRENT: from his maw out across the ring, reaching further as he heaves it up
  const reachAt = (when: number): V3 => {
    const k = cl01((when - S.spew[0]) / (S.spew[1] - S.spew[0]));
    const rim = rimOn(aim) + 10;
    return onLine(aim + 6 * Math.sin(when * 7), rim + (ringOn(aim) - 30 - rim) * (0.15 + 0.75 * k));
  };
  P.globs = [];
  const N = 44;
  for (let i = 0; i < N; i++) {
    const q = fr(t * 2.6 + i / N);
    const sent = t - q / 2.6;
    if (sent < S.spew[0] || sent > S.spew[1]) continue;
    const to = reachAt(sent);
    const wob = mul(norm(cross(sub(to, M), UP), LF), 5 * Math.sin(i * 2.3));
    const p = add(add(add(M, mul(sub(to, M), q)), [0, 0, 4 * 52 * q * (1 - q)]), mul(wob, q));
    const ahead = add(add(M, mul(sub(to, M), q + 0.03)), [0, 0, 4 * 52 * (q + 0.03) * (1 - q - 0.03)]);
    P.globs.push({ at: p, dir: norm(sub(ahead, p)), r: 15 - 6 * q + 2 * hash(i, 3, 223), ramp: MUCK });
    // (dripping off it as it goes)
    if (i % 3 === 0 && q > 0.2) drops.push([add(p, [0, 0, -10 - 30 * fr(q * 3 + i)]), MUCK_DROPS[i % 4], 3]);
  }
  // where it comes down: the muck splashing up
  if (spewing > 0 && t > S.spew[0] + 0.38) for (let i = 0; i < 24; i++) {
    const f = fr(t * 3 + i / 24);
    const a = hash(i, 4, 223) * TAU;
    const at = reachAt(t - 0.38);
    drops.push([add(at, [Math.cos(a) * 34 * f, Math.sin(a) * 34 * f, 4 + 60 * f * (1 - f)]), MUCK_DROPS[i % 4], i % 3 ? 3 : 4]);
  }
  // THE EGGS, tumbling out in it, flung high
  P.eggs = [];
  S.eggs.forEach((te, i) => {
    const s2 = (t - te) / S.fly;
    if (s2 < 0 || s2 >= 1) return;
    const to = spawnLanding(aim, i);
    const at = add(add(M, mul(sub(to, M), s2)), [0, 0, 4 * (70 + 20 * i) * s2 * (1 - s2) + 10 * (1 - s2)]);
    P.eggs!.push({ at, spin: (t - te) * (7 + 2 * i) + i, r: 13 });
  });
  P.drops = drops;
  return P;
}

/**
 * HIS SPLASH (his words, “I like the water idea for the roar, but instead it picks its bulk up and splashes down”):
 * he sinks down, gathering; he heaves his whole bulk up out of the pool, water pouring off him in sheets, his arms
 * hanging and writhing; he hangs there at the top, trembling (the warning); he crashes down into the pool, a crown of
 * water bursting up round him; a wave rolls out from the pool's rim across the ring to its edge, knee-high, foaming (to
 * jump or dash through); he bobs and settles. Where it hurts: the wave's front, `waveAt(t)` of the way across the ring.
 */
export const EYE_SPLASH = { long: 3.6, sink: 0.25, rise: [0.25, 1.0], hang: [1.0, 1.4], crash: 1.62, wave: [1.62, 2.85], high: 125, waveHigh: 34, fps: 30 } as const;

/** How far across the ring his splash's wave has rolled at time `t` (0 at the pool's rim, 1 at the ring's edge), or null when there is none. */
export function waveAt(t: number): number | null {
  const S = EYE_SPLASH;
  if (t < S.wave[0] || t > S.wave[1]) return null;
  const k = (t - S.wave[0]) / (S.wave[1] - S.wave[0]);
  // (fast off the rim, slowing as it spreads)
  return 1 - Math.pow(1 - k, 1.6);
}

function splashPose(t: number, clock = 0): EyePose {
  const S = EYE_SPLASH;
  const base = standPose(clock + t);
  const P: EyePose = { ...base };
  // how high he is: sunk, heaved up, hung, crashed down, bobbing back
  let z: number;
  if (t < S.rise[0]) z = -14 * sm(t / S.sink);
  else if (t < S.rise[1]) z = -14 + (S.high + 14) * (1 - Math.pow(1 - (t - S.rise[0]) / (S.rise[1] - S.rise[0]), 2.2));
  else if (t < S.hang[1]) z = S.high + 6 * Math.sin((t - S.hang[0]) * 7) * sm((t - S.hang[0]) / 0.1);
  else if (t < S.crash) z = S.high + 6 * Math.sin((S.hang[1] - S.hang[0]) * 7) - (S.high + 30) * easeIn((t - S.hang[1]) / (S.crash - S.hang[1]));
  else {
    const k = t - S.crash;
    const z0 = S.high + 6 * Math.sin((S.hang[1] - S.hang[0]) * 7) - (S.high + 30);
    z = z0 * Math.exp(-k * 2.6) * Math.cos(k * 6) * (1 - sm((t - (S.long - 0.6)) / 0.6));
  }
  const up = cl01(z / S.high);
  // (trembling at the top, held)
  const tremble = t > S.hang[0] && t < S.hang[1] ? Math.sin(t * 47) * 1.6 : 0;
  P.heave = add(base.heave, [tremble, -tremble * 0.6, z]);
  P.tilt = base.tilt - 8 * up + (t > S.crash ? 6 * Math.exp(-(t - S.crash) * 3) * (1 - sm((t - (S.long - 0.6)) / 0.6)) : 0);
  P.lid = base.lid * (1 - up) + 0.02 * up;
  P.glow = base.glow + 0.5 * up;
  // his arms hanging down off him as he rises, writhing, flung up as he crashes; those under the water stay down there
  P.arms = base.arms.map((A, i) => {
    if (A.rise <= 10) return { ...A, z0: A.z0 - Math.max(0, z) };
    return { ...A, rise: Math.max(11, A.rise - 40 * up), bend: A.bend - 100 * up, curl: A.curl * (1 - 0.7 * up), wave: A.wave + 8 * up, phase: A.phase + up * Math.sin(t * 6 + i) * 1.2 };
  });
  const drops = [...(base.drops ?? [])];
  // water pouring off him in sheets as he rises and hangs
  if (z > 10) for (let i = 0; i < 46; i++) {
    const f = fr(t * 1.7 + hash(i, 1, 241));
    const a = hash(i, 2, 241) * TAU;
    const r = EYE_R * (0.5 + 0.7 * hash(i, 3, 241));
    const top = z + EYE_HIGH - EYE_R * 0.6;
    const at: V3 = [Math.cos(a) * r, Math.sin(a) * r, top - (top + 4) * f * f];
    if (at[2] > 0) drops.push([at, i % 3 ? SPRAY[2] : SPRAY[1], i % 4 ? 2 : 3]);
  }
  // THE CRASH: a crown of water bursting up round him
  drops.push(...flung(t, S.crash, 120, (i) => onLine((i / 120) * 360, rimOn((i / 120) * 360) * 0.9), 90, 360, 1.0, SPRAY, 243, 3));
  drops.push(...flung(t, S.crash, 80, (i) => onLine((i / 80) * 360 + 4, rimOn((i / 80) * 360) * 0.6), 50, 460, 1.15, SPRAY, 245, 3));
  drops.push(...flung(t, S.crash, 60, (i) => onLine((i / 60) * 360 + 2, rimOn((i / 60) * 360) * 0.3), 30, 520, 1.2, ['#dfe6e0', SPRAY[1]], 247, 4));
  P.drops = drops;
  // rings on the pool as he hangs over it, dripping, and as he crashes
  P.ripples = [...(base.ripples ?? [])];
  if (t > S.crash) for (let k = 0; k < 3; k++) {
    const r = (t - S.crash - k * 0.12) * 160;
    if (r > 2 && r < 140) P.ripples.push([[0, 0, 0], r]);
  }
  // THE WAVE
  const w = waveAt(t);
  if (w !== null) {
    P.wave = { r: w, h: S.waveHigh * (1 - 0.5 * w) * Math.min(1, (t - S.wave[0]) / 0.08), t };
    // spray off its crest
    for (let i = 0; i < 40; i++) {
      const a = hash(i, Math.floor(t * 15), 253) * 360;
      const r = rimOn(a) + (ringOn(a) - rimOn(a)) * w;
      const f = fr(t * 4 + i / 40);
      drops.push([add(onLine(a, r + 6 * f), [0, 0, P.wave.h + 16 * f * (1 - f) * 2]), f < 0.5 ? '#dfe6e0' : SPRAY[1], 2]);
    }
  }
  return P;
}

/** How long each of its moves lasts (a stand: its round). */
export function eyeLong(which: string): number {
  if (which === 'stand') return EYE_STAND.period;
  if (which === 'lurk') return EYE_LURK.period;
  if (which.startsWith('slam')) return EYE_SLAM.long;
  if (which.startsWith('sweep')) return EYE_SWEEP.long;
  if (which.startsWith('gaze')) return EYE_GAZE.long;
  if (which === 'call') return EYE_CALL.long;
  if (which === 'spit') return EYE_SPIT.long;
  if (which === 'bite') return EYE_BITE.long;
  if (which === 'spew') return EYE_SPEW.long;
  if (which === 'splash') return EYE_SPLASH.long;
  return 1;
}
/**
 * Its pose: `which` (stand, lurk; slam and sweep, risen; slamUnder and sweepUnder, from under the water), `t` seconds
 * in, `aim` the way its blow goes; `clock` where its stand (or lurk) was when the move began (its own clock, so that
 * the move starts from the stand as it was, and hands back to it as it will be: the stand runs on under the move).
 */
export function poseOf(which: string, t: number, aim = 0, clock = 0): EyePose {
  if (which === 'lurk') return lurkPose(clock + t);
  if (which === 'slam' || which === 'slamUnder') return slamPose(t, which === 'slamUnder', aim, clock);
  if (which === 'sweep' || which === 'sweepUnder') return sweepPose(t, which === 'sweepUnder', aim, clock);
  if (which === 'gaze' || which === 'gazeBack') return gazePose(t, aim, clock, 0, which === 'gazeBack');
  if (which === 'call') return callPose(t, clock);
  if (which === 'spit') return spitPose(t, aim, clock);
  if (which === 'bite') return bitePose(t, aim, clock);
  if (which === 'spew') return spewPose(t, aim, clock);
  if (which === 'splash') return splashPose(t, clock);
  return standPose(clock + t);
}
/** Where the tips of its arms are, and its eye's middle, at one moment (for the tests). */
export function eyeMarks(which: string, t: number, aim = 0, clock = 0): { tips: V3[]; eye: V3 } {
  const P = poseOf(which, t, aim, clock);
  return { tips: P.arms.map((A) => {
    const sp = armSpine(P, A);
    return sp[sp.length - 1].p;
  }), eye: add([0, 0, P.zE], P.heave) };
}

// ---------------------------------------------------------------------------------------------
// ITS SKINS

/** A soft noise of the figure's space (for mottling), 0 to 1. */
function patch(p: V3, k: number, seed: number): number {
  const x = p[0] * k;
  const y = p[1] * k;
  const z = p[2] * k;
  const xi = Math.floor(x);
  const yi = Math.floor(y);
  const zi = Math.floor(z);
  const sx = x - xi;
  const sy = y - yi;
  const sz = z - zi;
  const h = (a: number, b: number, c: number): number => hash(xi + a, yi + b, seed * 131 + zi + c);
  const l = (a: number, b: number, t: number): number => a + (b - a) * t * t * (3 - 2 * t);
  return l(l(l(h(0, 0, 0), h(1, 0, 0), sx), l(h(0, 1, 0), h(1, 1, 0), sx), sy), l(l(h(0, 0, 1), h(1, 0, 1), sx), l(h(0, 1, 1), h(1, 1, 1), sx), sy), sz);
}

/** Where the light from the upper left glints on its eye for one who looks from in front (its own measures). */
const SHEEN: V3 = norm([0.8, -0.45, 0.95]);

/** ITS EYE'S SKIN, given where on the eye (its own measures, on the ball, the eye's face toward `face`): its white veined, its iris burning, its slit. */
function eyeSkin(P: EyePose, look: V3, face: V3, up?: V3): (u: V3, tone: number) => string | null {
  const L = norm(look);
  const back = bulkSkin(5, 6, P.blaze) as (u: V3, tone: number, x: number, y: number) => string | null;
  const h = norm(cross(UP, L), LF);
  const v = cross(L, h);
  const IR = 0.46;
  const faceUp = up ?? norm(cross(face, [0, 1, 0]));
  const upper = 1 - 2 * cl01(P.lid);
  const lower = -1 + 0.55 * cl01(P.lid);
  return (u, tone) => {
    const n = norm(u);
    // (its back half sunk in its flesh)
    if (dot(n, face) < 0.2) return back(n, tone, 0, 0);
    // its lids: the upper one heavy over it, sliding down to shut it, the lower one rising a little to meet it
    const lv = dot(n, faceUp);
    if (lv > upper || lv < lower) {
      const edge = lv > upper ? lv - upper : lower - lv;
      if (edge < 0.06) return BULK[0];
      if (fr(edge * 9 + 0.3 * Math.sin(dot(n, [0, 1, 0]) * 8)) < 0.2) return BULK[Math.max(0, tone - 1)];
      return MOTTLE[Math.max(0, Math.min(4, tone))];
    }
    const c = dot(n, L);
    const a = dot(n, h);
    const b = dot(n, v);
    const r = Math.hypot(a, b);
    if (c > 0 && r < IR) {
      // its pupil: a black slit, up and down, burning at its lips
      const k = r / IR;
      const half = P.slit * IR * Math.sqrt(Math.max(0, 1 - (b / IR) ** 2));
      if (Math.abs(a) < half) return PUPIL;
      if (Math.abs(a) < half + 0.025) return FLAME[1];
      // its iris: dark at its rim, a ring of pink, then gold burning to its heart, in rays
      const ray = Math.abs(Math.sin(Math.atan2(b, a) * 13 + k * 6)) < 0.32;
      if (k > 0.93) return FLAME[0];
      if (k > 0.8) return ray ? FLAME[1] : FLAME[2];
      if (k > 0.55) return ray ? FLAME[2] : FLAME[3];
      if (k > 0.22) return ray ? FLAME[3] : FLAME[4];
      return FLAME[4];
    }
    // its white: veined, the veins running in toward its iris, branching
    const ang = Math.atan2(b, a);
    const away = Math.acos(Math.max(-1, Math.min(1, c)));
    const meander = Math.sin(ang * 6 + 3.2 * Math.sin(away * 4 + ang * 2));
    const twig = Math.sin(ang * 15 + away * 10 + 1.7 * Math.sin(away * 12));
    const vein = (Math.abs(meander) < 0.13 && away > 0.54) || (Math.abs(twig) < 0.09 && away > 0.85);
    if (vein) {
      if (P.blaze > 0.5) return away < 1.0 ? FLAME[3] : FLAME[2];
      return VEIN[Math.min(3, 1 + Math.max(0, tone - 2))];
    }
    // its wet sheen, where the light from the upper left meets your eye
    if (dot(n, SHEEN) > 0.982) return '#fffaee';
    // its white yellowing into the dark toward its edges
    return SCLERA[Math.max(0, tone - (away > 1.5 ? 1 : 0))];
  };
}

/** ITS BULK'S SKIN: the drowned dark of the fen, wet, mottled paler, its folds deeper, barnacles crusted on its top. */
function bulkSkin(seed: number, wrinkle: number, blaze = 0): Skin {
  return (u, tone) => {
    const m = patch(u as V3, 3.2, seed);
    // (blazing: the siege's magic burning through it in cracks)
    if (blaze > 0.5 && Math.abs(patch(u as V3, 2.6, seed + 9) - 0.5) < 0.022) return tone > 3 ? FLAME[3] : FLAME[2];
    if (u[2] > 0.3 && patch(u as V3, 12, seed + 5) > 0.84) return BARNACLE[Math.max(1, tone - 1)];
    if (fr(u[2] * wrinkle + 0.45 * Math.sin(u[1] * 7 + seed)) < 0.13) return BULK[Math.max(0, tone - 1)];
    if (m > 0.64) return MOTTLE[tone];
    return BULK[tone];
  };
}

// ---------------------------------------------------------------------------------------------
// ITS ARMS

/** An arm's spine: points from its root to its tip, each with its thickness and the side it turns toward (its inner side). */
export function armSpine(P: EyePose, A: ArmPose, n = 26): { p: V3; r: number; inner: V3 }[] {
  const out: { p: V3; r: number; inner: V3 }[] = [];
  const rh: V3 = W(Math.cos(A.a * D), Math.sin(A.a * D), 0);
  const sd: V3 = W(-Math.sin(A.a * D), Math.cos(A.a * D), 0);
  let p = add(add(mul(rh, A.r0), [0, 0, A.z0]), P.heave);
  const step = A.long / n;
  for (let i = 0; i <= n; i++) {
    const s = i / n;
    const flat = A.rise <= 10;
    const ang = (A.rise + A.bend * s + (flat ? 0 : A.curl * Math.pow(s, 3)) + (flat ? 0 : 14 * Math.sin(s * Math.PI * 2 + A.phase) * s)) * D;
    // (an arm lying under the water coils sideways, along the bottom)
    const yaw = (flat ? A.curl : A.yaw ?? 0) * Math.pow(s, 2) * D;
    const rhs = add(mul(rh, Math.cos(yaw)), mul(sd, Math.sin(yaw)));
    const dir = add(mul(rhs, Math.cos(ang)), mul(UP, Math.sin(ang)));
    const left = add(mul(rhs, -Math.sin(ang)), mul(UP, Math.cos(ang)));
    const wob = mul(sd, A.wave * Math.sin(s * Math.PI * 2.2 + A.phase) * Math.min(1, s * 3));
    out.push({ p: add(p, wob), r: A.thick * Math.pow(1 - 0.92 * s, 1.25) + 0.55, inner: A.rise > 10 && A.curl >= 0 ? left : mul(left, -1) });
    p = add(p, mul(dir, step));
  }
  return out;
}

function armBits(P: EyePose, A: ArmPose, i: number, put: Put): void {
  const sp = armSpine(P, A);
  const part = `arm${i}`;
  for (let k = 0; k + 1 < sp.length; k++) {
    const a = sp[k];
    const b = sp[k + 1];
    put(part, `${part}_${k}`, { k: 'rod', a: a.p, b: b.p, ra: a.r, rb: b.r, ramp: ARM });
    const t1 = norm(sub(b.p, a.p));
    // its veins along its outer side, winding, standing a little proud of its skin
    if (k < sp.length - 4) {
      const tw = Math.sin(k * 0.8 + i * 1.7) * 0.7;
      const side = cross(a.inner, t1);
      const o0 = mul(norm(add(mul(a.inner, -1), mul(side, tw))), a.r * 0.88);
      const tw1 = Math.sin((k + 1) * 0.8 + i * 1.7) * 0.7;
      const o1 = mul(norm(add(mul(b.inner, -1), mul(cross(b.inner, t1), tw1))), b.r * 0.88);
      const burning = P.blaze > 0.5 || (A.burn ?? 0) > fr(k * 0.37 + 0.2);
      put(part, `${part}_v${k}`, { k: 'rod', a: add(a.p, o0), b: add(b.p, o1), ra: burning && A.burn ? 1.3 : 0.95, rb: burning && A.burn ? 1.3 : 0.95, ramp: burning ? BLAZING : VEIN });
      if ((A.burn ?? 0) > 0.3 && k % 6 === 2) put(part, `${part}_g${k}`, { k: 'glow', p: a.p, c: FLAME[2], r: 26 * (A.burn ?? 0), a: 0.35 * (A.burn ?? 0) });
    }
    // bone hooks along its outer side, raked toward its tip
    if (A.rise > 10 && k > 2 && k < sp.length - 5 && k % 3 === 1) {
      const outer = mul(a.inner, -1);
      const base = add(a.p, mul(outer, a.r * 0.85));
      const hl = a.r * 0.95 + 2;
      const tip = add(base, add(mul(outer, hl * 0.75), mul(t1, hl * 0.7)));
      put(`${part}h`, `${part}_h${k}`, { k: 'rod', a: base, b: tip, ra: Math.max(1.4, a.r * 0.24), rb: 0.35, ramp: HORN });
    }
    // its suckers along its inner side, paler rings, smaller toward its tip
    if (k > 2 && k < sp.length - 3) {
      const c = add(a.p, mul(a.inner, a.r * 0.9));
      const s = a.r * 0.3;
      const nrm = a.inner;
      const t2 = cross(nrm, t1);
      put(part, `${part}_s${k}`, { k: 'ball', c, ax: [mul(nrm, s * 0.55), mul(t1, s), mul(t2, s)], skin: (u, tone) => (u[0] > 0.5 && Math.hypot(u[1], u[2]) < 0.5 ? SUCKER[0] : SUCKER[tone]) });
    }
  }
}
/** Its veins burning with the siege's magic. */
const BLAZING: Ramp = [FLAME[0], FLAME[1], FLAME[2], FLAME[3], FLAME[4]];

// ---------------------------------------------------------------------------------------------
// ITS SOLIDS

/** THE DROWNED EYE AS SOLIDS: its bulk, the knotted rim of flesh round its eye, its eye (whole, or torn in two, its maw behind), the weed and feelers hanging from it, and its arms. */
/** An eyespawn's egg: a pale sac `r` across, turned `spin` about its long way, squashed by `squash` (0 none), the eye curled in it showing through as a shadow (looking about by `look`), veins of the sickness up it. */
function eggBits(put: Put, part: string, c: V3, r: number, spin: number, squash: number, seed: number, look = 0): void {
  const a1: V3 = [Math.cos(spin), 0, Math.sin(spin)];
  const a3: V3 = [-Math.sin(spin), 0, Math.cos(spin)];
  const EYE: V3 = norm([0.7 * Math.cos(look), 0.7 * Math.sin(look) + 0.2, 0.45]);
  put(part, 'egg', { k: 'ball', c, ax: [mul(a1, r * (1 + 0.25 * squash)), [0, r * (1 + 0.25 * squash), 0], mul(a3, r * 1.15 * (1 - 0.3 * squash))], skin: (u, tone) => {
    const n = norm(u as V3);
    const d = Math.hypot(n[0] - EYE[0], n[1] - EYE[1], n[2] - EYE[2]);
    if (d < 0.55) return d < 0.22 ? '#231b18' : d < 0.38 ? '#5c4d33' : EGG[Math.max(0, tone - 1)];
    if (Math.abs(Math.sin(Math.atan2(n[1], n[0]) * 2.5 + n[2] * 3 + seed * 1.7)) < 0.22) return VEIN[n[2] > 0.3 ? 3 : 2];
    return EGG[tone];
  } });
}
function eyeBits(P: EyePose, put: Put): void {
  const R = EYE_R;
  const E: V3 = add([0, 0, P.zE], P.heave);
  // the way its face is turned (round toward its left by its turn, up from forward by its tilt), and its own across
  // and up for that face
  const T = (P.turn ?? 0) * D;
  const FWt: V3 = P.turn ? add(mul(FW, Math.cos(T)), mul(LF, Math.sin(T))) : FW;
  const LFt: V3 = P.turn ? add(mul(LF, Math.cos(T)), mul(FW, -Math.sin(T))) : LF;
  const F = norm(add(mul(FWt, Math.cos(P.tilt * D)), mul(UP, Math.sin(P.tilt * D))));
  const U = norm(cross(F, LFt));
  const Lx = LFt;
  // its look, in the eye's own measures, turned with its face
  const look = norm(add(add(mul(F, P.look[0]), mul(Lx, P.look[1])), mul(U, P.look[2])));
  const lookLocal: V3 = [dot(look, FW), dot(look, LF), dot(look, UP)];
  // ITS BULK, behind its eye and round it, the most of it under the water
  put('bulk', 'bulk', { k: 'ball', c: add(E, add(mul(F, -R * 0.92), mul(U, R * 0.05))), ax: [mul(F, R * 1.0), mul(Lx, R * 1.32), mul(U, R * 1.22)], skin: bulkSkin(3, 6, P.blaze) });
  // ITS HOOD: a great cowl of its flesh towering behind its eye, a ridge of spines along its crown
  const hoodC = add(E, add(mul(F, -R * 0.85), mul(U, R * 0.62)));
  put('bulk', 'hood', { k: 'ball', c: hoodC, ax: [mul(F, R * 0.66), mul(Lx, R * 1.05), mul(U, R * 0.95)], skin: bulkSkin(17, 7, P.blaze) });
  for (let k = -3; k <= 3; k++) {
    const th = (k / 3) * 70 * D;
    const base = add(hoodC, add(mul(Lx, Math.sin(th) * R * 0.98), add(mul(U, Math.cos(th) * R * 0.88), mul(F, -R * 0.1))));
    const out = norm(add(mul(Lx, Math.sin(th)), add(mul(U, Math.cos(th)), mul(F, -0.35))));
    const long = R * (0.7 + 0.4 * Math.cos(th)) * (0.9 + 0.2 * hash(k, 4, 85));
    // (each a horn raked back, thick at its root, hooked at its tip)
    const mid = add(base, add(mul(out, long * 0.55), mul(F, -long * 0.1)));
    const tip = add(mid, add(mul(out, long * 0.25), mul(F, -long * 0.45)));
    put(`spine${k}`, 'spine', { k: 'rod', a: base, b: mid, ra: 6.5, rb: 3.6, ramp: HORN });
    put(`spine${k}`, 'spineTip', { k: 'rod', a: mid, b: tip, ra: 3.6, rb: 0.5, ramp: HORN });
  }
  // ITS RIM: a ring of knotted flesh round the face of its eye, heaviest over it (its brow), its lids
  const rimC = add(E, mul(F, R * 0.5));
  const rimR = R * 0.9;
  const lidDrop = P.lid * R * 0.55;
  for (let k = 0; k < 28; k++) {
    const th = (k / 28) * Math.PI * 2;
    const up = Math.sin(th);
    const across = Math.cos(th);
    const heavy = up > 0 ? 0.26 + 0.14 * up : 0.18 - 0.03 * up;
    // (its scowl: the brow dropping toward its middle over the eye, a V)
    const scowl = up > 0 ? R * 0.26 * (1 - P.split) * up * Math.max(0, 1 - Math.abs(across) * 1.3) : 0;
    const c = add(add(rimC, mul(Lx, across * rimR)), mul(U, up * rimR - (up > 0 ? lidDrop * up : 0) - scowl));
    const out = norm(add(mul(Lx, across), mul(U, up)));
    const r = R * heavy * (0.85 + 0.3 * hash(k, 1, 81));
    if (P.split > 0.001 && Math.abs(across) < 0.3) continue;
    put('rim', `rim${k}`, { k: 'ball', c, ax: [mul(F, r * 0.9), mul(out, r * 1.05), mul(norm(cross(F, out)), r * 1.25)], skin: bulkSkin(11 + (k % 3), 8, P.blaze) });
    // its feelers, a fringe along the rim, curling out
    if (k % 2 === 0) {
      const base = add(c, add(mul(out, r * 0.8), mul(F, r * 0.4)));
      const long = 8 + 6 * hash(k, 2, 83);
      const mid = add(base, add(mul(out, long * 0.6), mul(F, long * 0.4)));
      const tip = add(mid, add(mul(out, long * 0.2), mul(U, -long * 0.5)));
      put('rim', `feeler${k}a`, { k: 'rod', a: base, b: mid, ra: 1.3, rb: 0.8, ramp: MOTTLE });
      put('rim', `feeler${k}b`, { k: 'rod', a: mid, b: tip, ra: 0.8, rb: 0.35, ramp: MOTTLE });
    }
  }
  // ITS EYE: whole, or torn open down its slit, each half swung out on a hinge at its outer edge like a door
  const sk = eyeSkin(P, lookLocal, [dot(F, FW), dot(F, LF), dot(F, UP)], P.turn ? [dot(U, FW), dot(U, LF), dot(U, UP)] : undefined);
  const inLocal = (u: V3, ax: readonly [V3, V3, V3]): V3 => {
    const wv = add(add(mul(norm(ax[0]), u[0]), mul(norm(ax[1]), u[1])), mul(norm(ax[2]), u[2]));
    return [dot(wv, FW), dot(wv, LF), dot(wv, UP)];
  };
  if (P.split <= 0.001) {
    const ax: [V3, V3, V3] = [mul(F, R), mul(Lx, R), mul(U, R)];
    put('eye', 'eye', { k: 'ball', c: E, ax, skin: (u, tone) => sk(inLocal(u as V3, ax), tone) });
  } else {
    const grow = cl01((P.split - 0.15) / 0.6);
    for (const s of [1, -1]) {
      const deg = -s * P.split * 38;
      const hinge = add(E, add(mul(Lx, s * R * 0.96), mul(F, -R * 0.1)));
      const c = turnedAbout(E, hinge, U, deg);
      const F2 = norm(sub(turnedAbout(add(E, F), hinge, U, deg), c));
      const L2 = norm(sub(turnedAbout(add(E, Lx), hinge, U, deg), c));
      const ax: [V3, V3, V3] = [mul(F2, R), mul(L2, R), mul(U, R)];
      // (its skin as it was before it tore, carried with the half: the iris torn in two with it)
      put(`eye${s}`, 'half', { k: 'ball', c, ax, skin: (u, tone) => (u[1] * s < 0 ? null : sk(inLocal(u as V3, [mul(F, R), mul(Lx, R), mul(U, R)]), tone)) });
      // the inside of the half: a wet violet lining, ridged
      put(`lining${s}`, 'lining', { k: 'ball', c: add(c, mul(L2, s * 0.5)), ax: [mul(F2, R * 0.97), mul(L2, 1.2), mul(U, R * 0.97)], skin: (u, tone) => (Math.abs(Math.sin(Math.atan2(u[2], u[0]) * 9)) < 0.25 ? MAW[Math.max(0, tone - 2)] : MAW[Math.max(0, tone - 1)]) });
      // its teeth along the tear, hooked inward
      for (let k = -10; k <= 10; k++) {
        const phi = k * 15 * D;
        const rim = add(c, add(mul(F2, R * 0.95 * Math.cos(phi)), mul(U, R * 0.95 * Math.sin(phi))));
        const inward = norm(sub(c, rim));
        const tip = add(rim, mul(norm(add(mul(L2, -s), mul(inward, 0.5))), (8 + 7 * hash(k, s, 71)) * grow));
        if (grow > 0.05 && Math.cos(phi) > -0.6) put(`teeth${s}`, `tooth${k}`, { k: 'rod', a: rim, b: tip, ra: 2.6, rb: 0.3, ramp: TOOTH });
      }
    }
    // ITS MAW: rings on rings of teeth going down into its gullet, burning at the bottom
    const g = add(E, mul(F, -R * 0.15));
    put('gullet', 'gullet', { k: 'ball', c: g, ax: [mul(F, R * 0.62), mul(Lx, R * 0.96), mul(U, R * 0.96)], skin: (u, tone) => {
      if (u[0] < 0) return MAW[0];
      const rr = Math.hypot(u[1], u[2]);
      // its gullet burning at the bottom
      if (rr < 0.1) return FLAME[4];
      if (rr < 0.18) return FLAME[3];
      if (rr < 0.25) return FLAME[2];
      if (rr < 0.3) return FLAME[1];
      // rings on rings of teeth going down into it, each a hooked fang pointing in, the gaps between them dark
      const band = Math.floor((rr - 0.3) / 0.175);
      const f = fr((rr - 0.3) / 0.175);
      const n = 10 + band * 5;
      const ang = Math.atan2(u[2], u[1]) + band * 0.37;
      const wedge = Math.abs(Math.sin((ang * n) / 2));
      if (f > 0.22 && wedge < (f - 0.22) * 1.15) return TOOTH[Math.max(1, Math.min(4, tone + (f > 0.75 ? 0 : 1)))];
      if (f < 0.22) return MAW[0];
      return MAW[Math.max(0, Math.min(3, tone - 1))];
    } });
    put('gullet', 'fire', { k: 'glow', p: add(g, mul(F, R * 0.5)), c: FLAME[3], r: 60 * P.split, a: 0.55 });
  }
  // THE WEED hanging from its brow, dripping
  for (let k = 0; k < 11; k++) {
    const l = (k - 5) * 9.5;
    const top = add(add(rimC, mul(Lx, l)), mul(U, rimR * Math.sqrt(Math.max(0, 1 - (l / rimR) ** 2)) + R * 0.12 - lidDrop));
    const long = 12 + 16 * hash(k, 3, 75);
    put('weed', `weed${k}`, { k: 'rod', a: add(top, mul(F, 6)), b: add(add(top, mul(F, 9)), [0.8 * Math.sin(k), 0.6 * Math.cos(k), -long]), ra: 1.3, rb: 0.5, ramp: WEED });
  }
  // ITS ARMS
  P.arms.forEach((A, i) => armBits(P, A, i, put));
  // THE WATER pouring off it
  for (const [p, c, size] of P.drops ?? []) put('drops', 'drop', { k: 'mote', p, c, size });
  // GLOBS OF HIS BILE, stretched the way they fly, blotched, a dull sheen on them
  (P.globs ?? []).forEach((g, i) => {
    const side = norm(Math.abs(g.dir[2]) > 0.95 ? cross(g.dir, LF) : cross(g.dir, UP));
    const up2 = norm(cross(side, g.dir));
    const ramp = g.ramp ?? BILE;
    put(`glob${i}`, 'glob', { k: 'ball', c: g.at, ax: [mul(g.dir, g.r * 1.35), mul(side, g.r), mul(up2, g.r * 0.9)], skin: (u, tone) => {
      if (u[2] > 0.55 && u[1] > -0.2 && u[1] < 0.45) return ramp[4];
      const blot = Math.sin(u[0] * 7 + i) * Math.sin(u[1] * 6 - i) > 0.45;
      return ramp[Math.max(0, Math.min(4, tone - (blot ? 1 : 0)))];
    } });
  });
  // EYESPAWN'S EGGS tumbling through the air: pale sacs, the sickness's veins up them, the eye curled in each a shadow
  (P.eggs ?? []).forEach((g, i) => eggBits(put, `egg${i}`, g.at, g.r, g.spin, 0, i));
  // ITS IRIS'S LIGHT, the enemy's fire (under the water, less)
  const iris = add(E, mul(look, R));
  if (P.alive && P.split < 0.5) put('eye', 'glow', { k: 'glow', p: iris, c: FLAME[3], r: 48 * P.glow, a: (P.zE < 0 ? 0.45 : 0.5) * Math.min(1.2, P.glow) });
  if (P.blaze > 0) for (let k = 0; k < 5; k++) put('bulk', `blaze${k}`, { k: 'glow', p: add(E, W(-10, (k - 2) * 34, 20 + (k % 2) * 30)), c: FLAME[2], r: 60, a: 0.28 * P.blaze });
}

// ---------------------------------------------------------------------------------------------
// THE WATER: what of it is under the surface seen through it, darker the deeper; nothing beyond the pool

/** One frame of it, painted. */
function paintPose(P: EyePose, view: GameView): Painted {
  const st0 = stage(view, EYE_CANVAS.ax, EYE_CANVAS.ay, EYE_CANVAS);
  const sheets: Sheet[] = [];
  const st: Stage = { ...st0, part: (where) => { const sh = st0.part(where); sheets.push(sh); return sh; } };
  const bits: Bit[] = [];
  eyeBits(P, (part, piece, shape) => {
    bits.push({ part, piece, shape });
  });
  const lights = paintBits(st, bits, [0, 0, P.zE]);
  // where each pixel of it is, how high: the nearest skin's
  const { w, h } = EYE_CANVAS;
  const zAt = new Float32Array(w * h).fill(NaN);
  const near = new Float32Array(w * h).fill(-Infinity);
  for (const sh of sheets) {
    for (let k = 0; k < w * h; k++) {
      if (sh.d[k * 4 + 3] === 0) continue;
      const n = sh.z[k] !== sh.z[k] ? sh.near : sh.z[k];
      if (n < near[k]) continue;
      near[k] = n;
    }
  }
  const b = st0.back;
  for (let k = 0; k < w * h; k++) {
    if (near[k] === -Infinity) continue;
    const sx = (k % w) + 0.5 - EYE_CANVAS.ax;
    const sy = Math.floor(k / w) + 0.5 - EYE_CANVAS.ay;
    zAt[k] = b[2][0] * sx + b[2][1] * sy + b[2][2] * near[k];
  }
  const px = st0.whole(P.alive ? ENEMY_RIM : null);
  if (P.marks && P.marks.length) floorMarks(st0, px, P.marks);
  if (P.burnt) burntFloor(st0, px, P.burnt);
  for (const m of P.marks ?? []) {
    if (m.kind !== 'aim') continue;
    for (let i = 0; i <= 3; i++) {
      const [x, y] = st0.at(add(m.a, mul(sub(m.b, m.a), i / 3)));
      lights.push({ x, y, r: 36, color: m.k > 0.7 ? FLAME[3] : FLAME[2], a: 0.45 * m.k });
    }
  }
  lastUnder = drown(px, zAt, st0, view);
  if (P.ripples && P.ripples.length) ripple(px, st0, view, P.ripples, zAt);
  if (P.wave) waveOf(px, st0, P.wave);
  for (const S of P.streaks ?? []) {
    for (let i = 0; i + 1 < S.pts.length; i++) {
      const [x0, y0] = st0.at(S.pts[i]);
      const [x1, y1] = st0.at(S.pts[i + 1]);
      const steps = Math.ceil(Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0)));
      for (let k = 0; k <= steps; k++) {
        const x = Math.round(x0 + ((x1 - x0) * k) / Math.max(1, steps));
        const y = Math.round(y0 + ((y1 - y0) * k) / Math.max(1, steps));
        // (solid at its head, broken toward its tail)
        if (x < 0 || y < 0 || x >= px.w || y >= px.h || (i >= 2 && (x + y) % 2 === 1)) continue;
        px.set(x, y, i === 0 ? S.c : SPRAY[0]);
      }
    }
  }
  for (const B of P.beams ?? []) {
    beam(px, st0, B);
    // its light: at his eye, and all along where it falls
    for (let i = 0; i <= 6; i++) {
      const [x, y] = st0.at(add(B.a, mul(sub(B.b, B.a), i / 6)));
      lights.push({ x, y, r: 48 * B.k, color: FLAME[3], a: 0.5 * B.k });
    }
    // (and down the fan)
    for (let i = 1; i <= 3; i++) {
      const [x, y] = st0.at(add(B.from, mul(sub(add(B.a, mul(sub(B.b, B.a), 0.55)), B.from), i / 4)));
      lights.push({ x, y, r: 40 * B.k, color: FLAME[3], a: 0.35 * B.k });
    }
    const [x, y] = st0.at(B.from);
    lights.push({ x, y, r: 80 * B.k, color: FLAME[4], a: 0.6 * B.k });
  }
  for (const L of lights) if (L.y > EYE_CANVAS.ay - 2 && P.zE < 0) L.a = (L.a ?? 0.5) * 0.7;
  return { px, lights };
}

/** Whether a point of the water's surface (the figure's own floor) lies within the pool. */
function inPool(x: number, y: number, view: GameView): boolean {
  const [a, c] = view === 'front' ? [x, y] : [y, x];
  return (a / EYE_POOL.rx) ** 2 + (c / EYE_POOL.ry) ** 2 < 1;
}

/** Under the water: each pixel of it that is under the surface seen through the water, darker the deeper; none deeper than SEEN_DEEP, or beyond the pool's rim; no edge round what is under; a line of the water's light where it breaks the surface. */
function drown(px: Px, zAt: Float32Array, st: Stage, view: GameView): Uint8Array {
  const { w, h } = EYE_CANVAS;
  const b = st.back;
  const under = new Uint8Array(w * h);
  const gone = new Uint8Array(w * h);
  for (let k = 0; k < w * h; k++) {
    const z = zAt[k];
    if (z !== z || z >= 0) continue;
    under[k] = 1;
    const sx = (k % w) + 0.5 - EYE_CANVAS.ax;
    const sy = Math.floor(k / w) + 0.5 - EYE_CANVAS.ay;
    // the surface over it, along the eye's line
    const n0 = -(b[2][0] * sx + b[2][1] * sy) / b[2][2];
    const fx = b[0][0] * sx + b[0][1] * sy + b[0][2] * n0;
    const fy = b[1][0] * sx + b[1][1] * sy + b[1][2] * n0;
    if (-z > SEEN_DEEP || !inPool(fx, fy, view)) {
      gone[k] = 1;
      continue;
    }
  }
  const d = px.d;
  // the edge and the seam round what is under: gone with it, unless what is over the water is as near
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const k = y * w + x;
      if (zAt[k] === zAt[k] || d[k * 4 + 3] === 0) continue;
      let wet = 0;
      let dry = 0;
      for (let dy = -2; dy <= 2; dy++) {
        for (let dx = -2; dx <= 2; dx++) {
          const X = x + dx;
          const Y = y + dy;
          if (X < 0 || Y < 0 || X >= w || Y >= h) continue;
          const j = Y * w + X;
          if (zAt[j] !== zAt[j]) continue;
          if (under[j]) wet++;
          else dry++;
        }
      }
      if (wet && !dry) gone[k] = 1;
    }
  }
  for (let k = 0; k < w * h; k++) {
    if (gone[k]) {
      d[k * 4 + 3] = 0;
      continue;
    }
    if (!under[k]) continue;
    const depth = cl01(-zAt[k] / SEEN_DEEP);
    const i = k * 4;
    const hex = '#' + [d[i], d[i + 1], d[i + 2]].map((v) => v.toString(16).padStart(2, '0')).join('');
    const burning = BURNS.has(hex);
    const water = depth > 0.55 ? WATER_DEEP : WATER;
    const m = burning ? 0.28 + 0.45 * depth : 0.68 + 0.28 * depth;
    for (let c = 0; c < 3; c++) d[i + c] = Math.round(d[i + c] + (water[c] - d[i + c]) * m);
    // the surface's ripples over it, streaks of the water's light
    const x = k % w;
    const y = Math.floor(k / w);
    if ((y * 3 + Math.floor(x / 11) * 7) % 13 === 0 && hash(x >> 3, y, 91) > 0.35) {
      const f = rgbOf(FOAM);
      for (let c = 0; c < 3; c++) d[i + c] = Math.round(d[i + c] + (f[c] - d[i + c]) * 0.6);
    }
  }
  // where it breaks the surface: a line of the water's light under what stands out of it
  for (let y = 0; y + 1 < h; y++) {
    for (let x = 0; x < w; x++) {
      const k = y * w + x;
      const j = k + w;
      if (zAt[k] !== zAt[k] || under[k] || !under[j] || gone[j]) continue;
      const i = j * 4;
      const v = rgbOf(FOAM);
      d[i] = v[0];
      d[i + 1] = v[1];
      d[i + 2] = v[2];
    }
  }
  for (let k = 0; k < w * h; k++) if (gone[k]) under[k] = 0;
  return under;
}
/** RINGS ON THE WATER: spreading out on the pool's surface round where it stirs the water, a line of the water's light on what of it is under the surface or on the bare water, never on what stands out of it. */
function ripple(px: Px, st: Stage, view: GameView, rings: [V3, number][], zAt: Float32Array): void {
  const { w, h } = EYE_CANVAS;
  const b = st.back;
  const d = px.d;
  const lit = rgbOf(FOAM);
  const pale = rgbOf('#71867a');
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const k = y * w + x;
      // (what stands out of the water is over the rings)
      if (zAt[k] === zAt[k] && zAt[k] >= 0) continue;
      const sx = x + 0.5 - EYE_CANVAS.ax;
      const sy = y + 0.5 - EYE_CANVAS.ay;
      const n0 = -(b[2][0] * sx + b[2][1] * sy) / b[2][2];
      const fx = b[0][0] * sx + b[0][1] * sy + b[0][2] * n0;
      const fy = b[1][0] * sx + b[1][1] * sy + b[1][2] * n0;
      if (!inPool(fx, fy, view)) continue;
      for (const [c, r] of rings) {
        if (r <= 1) continue;
        const dd = Math.hypot(fx - c[0], fy - c[1]);
        if (Math.abs(dd - r) > 1.3) continue;
        // (broken, and fading as it spreads)
        const a = Math.atan2(fy - c[1], fx - c[0]);
        if (hash(Math.floor((a + 4) * 5), Math.floor(r / 6), 97) < 0.25 + r / 120) continue;
        const col = r < 24 ? pale : lit;
        const i = k * 4;
        d[i] = col[0];
        d[i + 1] = col[1];
        d[i + 2] = col[2];
        d[i + 3] = 255;
        break;
      }
    }
  }
}
/** MARKS ON THE FLOOR, laid under it (no seam): a shadow falling along a line, crisp, every other pixel dark, the darker the nearer it comes; the stones cracked along a line, a dark crack lit along its upper edge, branching. */
function floorMarks(st: Stage, px: Px, marks: FloorMark[]): void {
  // (only where nothing of it is: under it)
  const p = { w: px.w, h: px.h, set: (x: number, y: number, c: string): void => {
    if (x < 0 || y < 0 || x >= px.w || y >= px.h || px.d[(y * px.w + x) * 4 + 3] > 0) return;
    px.set(x, y, c);
  } };
  for (const m of marks) {
    if (m.kind === 'spot') {
      // where a glob will land: a ring of its bile's colour round where it will spread (`w` out), dashed, then whole;
      // its shadow in it, growing and darkening as it falls, solid in its middle as it nears
      const [x0, y0] = st.at(m.a);
      const R2 = m.w * 1.155;
      const r = R2 * (0.3 + 0.55 * m.k);
      for (let y = Math.floor(y0 - R2 * 0.6) - 1; y <= Math.ceil(y0 + R2 * 0.6) + 1; y++) {
        for (let x = Math.floor(x0 - R2) - 1; x <= Math.ceil(x0 + R2) + 1; x++) {
          const ex = (x + 0.5 - x0) / R2;
          const ey = (y + 0.5 - y0) / (R2 * 0.5);
          const D2 = Math.hypot(ex, ey);
          if (Math.abs(D2 - 1) < 0.07 && (m.k > 0.5 || fr(Math.atan2(ey, ex) / TAU * 20) < 0.6)) {
            p.set(x, y, m.k > 0.75 ? BILE[3] : BILE[2]);
            continue;
          }
          const d = Math.hypot((x + 0.5 - x0) / r, (y + 0.5 - y0) / (r * 0.5));
          if (d > 1) continue;
          if ((d < 0.6 && m.k > 0.6) || (x + y) % 2 === 0) p.set(x, y, m.k > 0.5 ? '#050604' : '#0c0f0b');
        }
      }
      continue;
    }
    const L = len(sub(m.b, m.a));
    if (L < 1) continue;
    const along = norm(sub(m.b, m.a));
    const across: V3 = [-along[1], along[0], 0];
    if (m.kind === 'aim') {
      // where a spell will fall: a line of his light flickering on the stones, dashed, pink brightening to gold
      const [x0, y0] = st.at(m.a);
      const [x1, y1] = st.at(m.b);
      const steps = Math.ceil(Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0)));
      const col = m.k > 0.7 ? FLAME[3] : m.k > 0.35 ? FLAME[2] : FLAME[1];
      for (let k = 0; k <= steps; k++) {
        if ((k + m.seed * 3) % 9 >= 6 && m.k < 0.85) continue;
        const x = Math.round(x0 + ((x1 - x0) * k) / Math.max(1, steps));
        const y = Math.round(y0 + ((y1 - y0) * k) / Math.max(1, steps));
        const half = Math.floor(Math.round(m.w) / 2);
        for (let d = -half; d < Math.round(m.w) - half; d++) p.set(x, y + d, d === 0 && m.k > 0.6 ? (m.k > 0.85 ? FLAME[4] : FLAME[3]) : col);
      }
      continue;
    }
    if (m.kind === 'scorch') {
      // the stones burnt along a line: glowing while fresh (`k` near 1), then dark
      const [x0, y0] = st.at(m.a);
      const [x1, y1] = st.at(m.b);
      const steps = Math.ceil(Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0)));
      const col = m.k > 0.75 ? FLAME[2] : m.k > 0.5 ? FLAME[1] : m.k > 0.25 ? FLAME[0] : '#140c14';
      for (let k = 0; k <= steps; k++) {
        const x = Math.round(x0 + ((x1 - x0) * k) / Math.max(1, steps));
        const y = Math.round(y0 + ((y1 - y0) * k) / Math.max(1, steps));
        for (let d = -Math.round(m.w); d <= Math.round(m.w); d++) p.set(x, y + d, Math.abs(d) <= 1 && m.k > 0.5 ? (m.k > 0.85 ? FLAME[3] : col) : (x + y + d) % 2 === 0 ? col : '#120a10');
      }
      continue;
    }
    if (m.kind === 'shadow') {
      const [x0, y0] = st.at(m.a);
      const [x1, y1] = st.at(m.b);
      const minX = Math.floor(Math.min(x0, x1) - m.w * 1.6);
      const maxX = Math.ceil(Math.max(x0, x1) + m.w * 1.6);
      const minY = Math.floor(Math.min(y0, y1) - m.w * 1.6);
      const maxY = Math.ceil(Math.max(y0, y1) + m.w * 1.6);
      const b = st.back;
      for (let y = Math.max(0, minY); y <= Math.min(p.h - 1, maxY); y++) {
        for (let x = Math.max(0, minX); x <= Math.min(p.w - 1, maxX); x++) {
          const sx = x + 0.5 - EYE_CANVAS.ax;
          const sy = y + 0.5 - EYE_CANVAS.ay;
          const n0 = -(b[2][0] * sx + b[2][1] * sy) / b[2][2];
          const f: V3 = [b[0][0] * sx + b[0][1] * sy + b[0][2] * n0, b[1][0] * sx + b[1][1] * sy + b[1][2] * n0, 0];
          const q = sub(f, m.a);
          const t = dot(q, along) / L;
          if (t < 0 || t > 1) continue;
          const off = Math.abs(dot(q, across));
          // (wider toward its tip, as the arm's shadow is)
          const half = m.w * (0.55 + 0.45 * t);
          if (off > half) continue;
          // (every other pixel, the darker the nearer it comes; its middle solid only as it falls)
          const solid = off < half * 0.4 && m.k > 0.92;
          if (solid || (x + y) % 2 === 0) p.set(x, y, m.k > 0.5 ? '#060807' : '#0e1411');
        }
      }
    } else {
      // the crack: jagged along the line, branching, its upper edge catching the light
      const pts: V3[] = [];
      const n = Math.max(2, Math.round(L / 7));
      for (let i = 0; i <= n; i++) {
        const t = i / n;
        const jag = (hash(i, 1, m.seed) - 0.5) * m.w;
        pts.push(add(add(m.a, mul(along, L * t)), mul(across, jag)));
      }
      const line = (a: V3, c: V3, dark: string, lit: string): void => {
        const [xa, ya] = st.at(a);
        const [xb, yb] = st.at(c);
        const steps = Math.ceil(Math.max(Math.abs(xb - xa), Math.abs(yb - ya)));
        for (let k = 0; k <= steps; k++) {
          const x = Math.round(xa + ((xb - xa) * k) / Math.max(1, steps));
          const y = Math.round(ya + ((yb - ya) * k) / Math.max(1, steps));
          p.set(x, y, dark);
          p.set(x + 1, y, dark);
          if (m.k > 0.3) p.set(x, y - 1, lit);
        }
      };
      const dark = '#0a090e';
      const lit = '#8a8692';
      for (let i = 0; i + 1 < pts.length; i++) {
        line(pts[i], pts[i + 1], dark, lit);
        if (hash(i, 2, m.seed) > 0.55) {
          const side = hash(i, 3, m.seed) > 0.5 ? 1 : -1;
          const twig = add(pts[i], add(mul(across, side * m.w * (1 + hash(i, 4, m.seed))), mul(along, 4)));
          line(pts[i], twig, dark, lit);
        }
      }
    }
  }
}
/**
 * HIS GAZE, painted over all of him, crisp: rays of his gold light fanning from his eye down to the line where it falls,
 * dashed and running outward, its two edges solid; its heart a thick shaft of white gold; a star of light at his eye;
 * where it falls, a burning line with flames licking up off it and a flare at its far end.
 */
function beam(px: Px, st: Stage, B: { from: V3; a: V3; b: V3; k: number; t: number }): void {
  if (B.k <= 0.02) return;
  const [ix, iy] = st.at(B.from);
  const [ax, ay] = st.at(B.a);
  const [bx, by] = st.at(B.b);
  const set = (x: number, y: number, c: string): void => {
    x = Math.round(x);
    y = Math.round(y);
    if (x >= 0 && y >= 0 && x < px.w && y < px.h) px.set(x, y, c);
  };
  const tick = Math.floor(B.t * 30);
  // a line from (x0, y0) to (x1, y1), each pixel's colour asked of `col` (how far along, 0 to 1; its step), or none
  const line = (x0: number, y0: number, x1: number, y1: number, col: (f: number, k: number) => string | null): void => {
    const steps = Math.ceil(Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0)));
    for (let k = 0; k <= steps; k++) {
      const f = k / Math.max(1, steps);
      const c = col(f, k);
      if (c) set(x0 + (x1 - x0) * f, y0 + (y1 - y0) * f, c);
    }
  };
  // THE FAN: rays to the line where it falls, dashed, running outward
  const N = 10;
  for (let i = 1; i < N; i++) {
    const ex = ax + ((bx - ax) * i) / N;
    const ey = ay + ((by - ay) * i) / N;
    line(ix, iy, ex, ey, (f, k) => (f < 0.08 || (k - tick * 3 + i * 5) % 10 >= 6 + Math.round(3 * B.k) ? null : f > 0.8 ? FLAME[4] : FLAME[3]));
  }
  // its edges, solid
  for (const [ex, ey] of [[ax, ay], [bx, by]] as [number, number][]) {
    line(ix, iy, ex, ey, (f) => (f < 0.05 ? null : FLAME[3]));
    line(ix + 1, iy, ex + 1, ey, (f) => (f < 0.05 ? null : FLAME[2]));
  }
  // ITS HEART: a thick shaft of white gold from his eye to where it falls
  const mx = ax + (bx - ax) * 0.55;
  const my = ay + (by - ay) * 0.55;
  const lx = mx - ix;
  const ly = my - iy;
  const ll = Math.hypot(lx, ly) || 1;
  const heart = 1.5 + 3.5 * B.k;
  const minX = Math.floor(Math.min(ix, mx)) - 12;
  const maxX = Math.ceil(Math.max(ix, mx)) + 12;
  const minY = Math.floor(Math.min(iy, my)) - 12;
  const maxY = Math.ceil(Math.max(iy, my)) + 12;
  for (let y = Math.max(0, minY); y <= Math.min(px.h - 1, maxY); y++) {
    for (let x = Math.max(0, minX); x <= Math.min(px.w - 1, maxX); x++) {
      const cx = x + 0.5;
      const cy = y + 0.5;
      const along = ((cx - ix) * lx + (cy - iy) * ly) / (ll * ll);
      if (along < 0 || along > 1.01) continue;
      const off = Math.abs((cx - ix) * ly - (cy - iy) * lx) / ll;
      const half = heart * (0.7 + 0.7 * along) * (1 + 0.12 * Math.sin(along * 40 - B.t * 50));
      if (off > half + 1) continue;
      set(x, y, off < half * 0.5 ? FLAME[4] : off < half ? FLAME[3] : FLAME[2]);
    }
  }
  // WHERE IT FALLS: a burning line, white gold at its heart, flames licking up off it
  const steps = Math.ceil(Math.max(Math.abs(bx - ax), Math.abs(by - ay)));
  for (let k = 0; k <= steps; k++) {
    const x = Math.round(ax + ((bx - ax) * k) / Math.max(1, steps));
    const y = Math.round(ay + ((by - ay) * k) / Math.max(1, steps));
    for (let d = -2; d <= 2; d++) set(x, y + d, Math.abs(d) <= 1 ? FLAME[4] : FLAME[3]);
    set(x, y + 3, FLAME[2]);
    const lick = hash(x, tick, 131);
    if (lick > 0.55) {
      const hgt = Math.round((3 + 9 * (lick - 0.55) / 0.45) * B.k);
      for (let u = 3; u <= hgt + 2; u++) set(x, y - u, u > hgt ? FLAME[2] : u > hgt * 0.5 ? FLAME[3] : FLAME[4]);
    }
  }
  // a flare at its far end, and a star of light at his eye
  const flare = (x: number, y: number, r: number): void => {
    for (let d = -r; d <= r; d++) {
      const c = Math.abs(d) < r * 0.4 ? FLAME[4] : FLAME[3];
      set(x + d, y, c);
      set(x, y + d * 0.6, c);
      if (Math.abs(d) < r * 0.5) {
        set(x + d * 0.7, y + d * 0.42, FLAME[3]);
        set(x + d * 0.7, y - d * 0.42, FLAME[3]);
      }
    }
  };
  flare(bx, by, Math.round((5 + 3 * hash(tick, 1, 132)) * B.k));
  flare(ix, iy, Math.round((10 + 6 * hash(tick, 2, 132)) * B.k));
}
/**
 * HIS SPLASH'S WAVE, rolling out over the ring: a wall of water `h` high, its crest foaming and spitting spray, its
 * face dark, the water washing over the stones behind it; behind him only where nothing of him is, before him over all.
 */
function waveOf(px: Px, st: Stage, W0: { r: number; h: number; t: number }): void {
  const { ay } = EYE_CANVAS;
  const free = (x: number, y: number): boolean => px.d[(y * px.w + x) * 4 + 3] === 0;
  const set = (x: number, y: number, c: string, front: boolean): void => {
    if (x < 0 || y < 0 || x >= px.w || y >= px.h) return;
    if (!front && !free(x, y)) return;
    px.set(x, y, c);
  };
  const tick = Math.floor(W0.t * 20);
  for (let i = 0; i < 1440; i++) {
    const a = i / 4;
    const rim = rimOn(a);
    const r = rim + (ringOn(a) - rim) * W0.r;
    const base = onLine(a, r);
    const [xb, yb] = st.at(base);
    const front = yb > ay;
    const hh = W0.h * (0.8 + 0.2 * Math.sin(a * 0.31 + W0.t * 9) + 0.15 * (hash(Math.floor(a / 3), tick, 251) - 0.5));
    const [, yt] = st.at(add(base, [0, 0, hh]));
    const x = Math.round(xb);
    // the wash behind it, over the stones: dithered water
    const [xw, yw] = st.at(onLine(a, Math.max(rim, r - 46)));
    for (let k = 0; k <= 10; k++) {
      const wx = Math.round(xw + ((xb - xw) * k) / 10);
      const wy = Math.round(yw + ((yb - yw) * k) / 10);
      if ((wx + wy) % 2 === 0 || k > 7) set(wx, wy, k > 7 ? '#3e544a' : k > 4 ? '#2e3e36' : '#1e2a24', front);
    }
    // its face, its crest foaming, a streak of light along it
    for (let y = Math.round(yt); y <= Math.round(yb); y++) {
      const f = (y - yt) / Math.max(1, yb - yt);
      set(x, y, f < 0.18 ? '#dfe6e0' : f < 0.32 ? SPRAY[1] : f < 0.42 ? '#8a9e92' : f < 0.7 ? '#4e6a60' : f < 0.88 ? '#3a5048' : '#24322c', front);
    }
  }
}
/** The stones his gaze has swept, under him: glowing just behind it, then smouldering (a scatter of embers), then scorched (a dark scatter), all of it fading as `fade` falls. */
function burntFloor(st: Stage, px: Px, B: NonNullable<EyePose['burnt']>): void {
  if (B.fade <= 0) return;
  const { ax, ay } = EYE_CANVAS;
  const b = st.back;
  const span = Math.hypot(EYE_RING.rx, EYE_RING.ry) * 0.83;
  for (let y = Math.max(0, Math.floor(ay - span * 0.55)); y <= Math.min(px.h - 1, Math.ceil(ay + span * 0.55)); y++) {
    for (let x = Math.max(0, Math.floor(ax - span * 1.05)); x <= Math.min(px.w - 1, Math.ceil(ax + span * 1.05)); x++) {
      if (px.d[(y * px.w + x) * 4 + 3] > 0) continue;
      const sx = x + 0.5 - ax;
      const sy = y + 0.5 - ay;
      const n0 = -(b[2][0] * sx + b[2][1] * sy) / b[2][2];
      const f: V3 = [b[0][0] * sx + b[0][1] * sy + b[0][2] * n0, b[1][0] * sx + b[1][1] * sy + b[1][2] * n0, 0];
      if (Math.hypot(f[0] / EYE_POOL.rx, f[1] / EYE_POOL.ry) < 1.02) continue;
      if (Math.hypot(f[0] / EYE_RING.rx, f[1] / EYE_RING.ry) > 0.99) continue;
      const deg = Math.atan2(dot(f, LF), dot(f, FW)) / D;
      const age = B.age(deg);
      if (age < 0) continue;
      const h = hash(x, y, 141);
      const odd = (x + y) % 2 === 0;
      let c: string | null = null;
      if (age < 0.06) c = odd ? FLAME[3] : h < 0.4 ? FLAME[2] : null;
      else if (age < 0.3) c = odd && h < 0.8 * (1 - (age - 0.06) / 0.24) ? (h < 0.2 ? FLAME[2] : FLAME[1]) : null;
      if (!c) {
        const ember = (age < 1.2 ? 0.03 : 0.012) * B.fade;
        if (h < ember) c = age < 0.7 ? FLAME[2] : FLAME[1];
        else if (odd && h < ember + 0.5 * B.fade) c = h < ember + 0.25 ? '#0c070a' : '#1a1216';
      }
      if (c) px.set(x, y, c);
    }
  }
}
const rgbOf = (c: string): V3 => [parseInt(c.slice(1, 3), 16), parseInt(c.slice(3, 5), 16), parseInt(c.slice(5, 7), 16)];

// ---------------------------------------------------------------------------------------------
// THE BURST (his pick, “Burst up under you from glowing cracks”), painted on its own so that the game lays it where you
// stand, several at once: the paving cracks, the cracks glowing the enemy's pink and brightening to gold (the warning);
// it bursts open, an arm shooting up through it, stones flung; the arm thrashes; it is drawn back down; the broken
// stones are left, their glow dying.

/** Its own canvas, and where on it the middle of the burst is, on the floor. */
export const BURST_CANVAS = { w: 340, h: 420, ax: 170, ay: 320 };
export const EYE_BURST = { long: 2.0, burst: 0.8, up: 0.94, sink: [1.48, 1.84], fps: 30, reach: 1.0 } as const;

/** One frame of a burst: `t` seconds in, `seed` to make each one its own. */
export function burstPainted(t: number, view: GameView = 'front', seed = 0): Painted {
  const B = EYE_BURST;
  const st0 = stage(view, BURST_CANVAS.ax, BURST_CANVAS.ay, BURST_CANVAS);
  const sheets: Sheet[] = [];
  const st: Stage = { ...st0, part: (where) => { const sh = st0.part(where); sheets.push(sh); return sh; } };
  const bits: Bit[] = [];
  const put: Put = (part, piece, shape) => bits.push({ part, piece, shape });
  const P: EyePose = { ...lookPose('risen'), arms: [] };
  // THE ARM: shooting up out of the floor, thrashing, drawn back down
  let long = 0;
  if (t >= B.burst && t < B.sink[1]) {
    if (t < B.up) long = 200 * sm((t - B.burst) / (B.up - B.burst));
    else if (t < B.sink[0]) long = 200;
    else long = 200 * (1 - sm((t - B.sink[0]) / (B.sink[1] - B.sink[0])));
  }
  if (long > 6) {
    const k = cl01((t - B.burst) / 0.7);
    const thrash = Math.sin(t * 13 + seed) * (0.4 + 0.6 * k);
    const A: ArmPose = { a: hash(seed, 1, 101) * 360, r0: 0, z0: -46, long: long + 46, thick: 17, rise: 86 + 6 * thrash, bend: 30 * Math.sin(t * 9 + seed), curl: (hash(seed, 2, 101) > 0.5 ? 1 : -1) * (110 + 70 * thrash), wave: 6, phase: t * 11, burn: t < B.up + 0.15 ? 1 : 0.4 };
    armBits(P, A, 0, put);
  }
  // stones flung from it as it bursts, and dust
  const drops: [V3, string, number][] = [];
  drops.push(...flung(t, B.burst, 34, () => [0, 0, 2], 70, 280, 0.8, RUBBLE, 103 + seed, 4));
  drops.push(...flung(t, B.burst, 26, () => [0, 0, 2], 110, 120, 0.5, ['#6a6460', '#857e76', '#4c4844'], 105 + seed, 3));
  // the glow of the cracks before it bursts: sparks rising
  if (t > 0.3 && t < B.burst) for (let i = 0; i < 8; i++) {
    const f = fr(t * 2.2 + i / 8);
    const a = (i / 8) * TAU + seed;
    drops.push([[Math.cos(a) * 14 * (1 - f), Math.sin(a) * 14 * (1 - f), 4 + 40 * f], i % 2 ? FLAME[3] : FLAME[2], 2]);
  }
  for (const [p, c, size] of drops) put('drops', 'drop', { k: 'mote', p, c, size });
  // the cracks' light
  const glowing = t < B.burst ? sm(t / B.burst) : Math.max(0, 1 - (t - B.burst) / 0.5);
  if (glowing > 0.05) put('drops', 'light', { k: 'glow', p: [0, 0, 2], c: t < B.burst * 0.6 ? FLAME[2] : FLAME[3], r: 40 + 50 * glowing, a: 0.6 * glowing });
  const lights = paintBits(st, bits, [0, 0, 40]);
  // the floor swallows what of the arm is below it
  const b = st0.back;
  for (const sh of sheets) {
    for (let y = 0; y < sh.h; y++) {
      for (let x = 0; x < sh.w; x++) {
        if (!sh.has(x, y)) continue;
        const k = y * sh.w + x;
        const n = sh.z[k] !== sh.z[k] ? sh.near : sh.z[k];
        const sx = x + 0.5 - BURST_CANVAS.ax;
        const sy = y + 0.5 - BURST_CANVAS.ay;
        if (b[2][0] * sx + b[2][1] * sy + b[2][2] * n < 0) {
          sh.erase(x, y);
          sh.z[k] = NaN;
        }
      }
    }
  }
  const px = st0.whole(ENEMY_RIM);
  // THE CRACKS, on the floor under all of it: spreading out from where it will burst, glowing pink, then gold, the
  // stones heaved open round a dark hole while the arm is up, then dark and dying
  const grow = sm(t / (B.burst * 0.85));
  const R = B.reach * TILE3;
  const free = (x: number, y: number): boolean => x >= 0 && y >= 0 && x < px.w && y < px.h && px.d[(y * px.w + x) * 4 + 3] === 0;
  const set = (pt: V3, c: string, w2 = false): void => {
    const [x, y] = st0.at(pt);
    const xi = Math.round(x - 0.5);
    const yi = Math.round(y - 0.5);
    if (free(xi, yi)) px.set(xi, yi, c);
    if (w2 && free(xi + 1, yi)) px.set(xi + 1, yi, c);
  };
  const hot = t < B.burst ? (t < B.burst * 0.5 ? FLAME[1] : t < B.burst * 0.85 ? FLAME[2] : FLAME[3]) : t < B.burst + 0.35 ? FLAME[2] : t < B.burst + 0.7 ? FLAME[0] : '#0a090e';
  const core = t < B.burst ? FLAME[Math.min(4, 2 + Math.floor(grow * 2.5))] : hot;
  for (let i = 0; i < 9; i++) {
    let a = (i / 9) * TAU + hash(i, 1, 107 + seed) * 0.5;
    const long2 = R * (0.55 + 0.45 * hash(i, 2, 107 + seed)) * grow;
    let p: V3 = [0, 0, 0];
    const steps = Math.max(1, Math.round(long2 / 2));
    for (let k = 0; k < steps; k++) {
      a += (hash(i, k, 109 + seed) - 0.5) * 0.35;
      p = add(p, [Math.cos(a) * 2, Math.sin(a) * 2, 0]);
      set(p, k < steps * 0.4 ? core : hot, true);
      if (k < steps * 0.3) set(add(p, [0.8, -0.8, 0]), core, true);
      if (k === Math.floor(steps * 0.5) && hash(i, 3, 107 + seed) > 0.4) {
        let q = p;
        let b2 = a + (hash(i, 4, 107 + seed) > 0.5 ? 0.8 : -0.8);
        for (let j = 0; j < steps * 0.4; j++) {
          b2 += (hash(i, j, 111 + seed) - 0.5) * 0.4;
          q = add(q, [Math.cos(b2) * 2, Math.sin(b2) * 2, 0]);
          set(q, hot);
        }
      }
    }
  }
  // the hole it bursts from, while it is up, and the heaved stones round it
  if (t >= B.burst && t < B.sink[1] + 0.1) {
    for (let y = 0; y < px.h; y++) for (let x = 0; x < px.w; x++) {
      if (!free(x, y)) continue;
      const sx = x + 0.5 - BURST_CANVAS.ax;
      const sy = y + 0.5 - BURST_CANVAS.ay;
      const n0 = -(b[2][0] * sx + b[2][1] * sy) / b[2][2];
      const fx = b[0][0] * sx + b[0][1] * sy + b[0][2] * n0;
      const fy = b[1][0] * sx + b[1][1] * sy + b[1][2] * n0;
      const d = Math.hypot(fx, fy);
      if (d < 19) px.set(x, y, d < 16 ? '#050605' : '#2e2a32');
    }
  }
  return { px, lights };
}
/** The same, as the game holds it. */
export function burstFrame(t: number, view: GameView = 'front', seed = 0): Sprite {
  return toSprite(burstPainted(t, view, seed), null, BURST_CANVAS.ax, BURST_CANVAS.ay);
}

// ---------------------------------------------------------------------------------------------
// THE SIEGE'S BOLTS (his pick, “The siege's pink bolts raining down”), each painted on its own so that the game lays
// it where it falls, several at once while he calls: a circle of the siege's runes opens on the stones where it will
// fall, filling and brightening, pink to gold (the warning), a tear opening in the dome high above it; a bolt of pink
// lightning cracks down; a blast of fire, sparks and stones; the stones left scorched, smouldering, then clean.

/** Its own canvas, and where on it the middle of where it falls is, on the floor. */
export const BOLT_CANVAS = { w: 260, h: 480, ax: 130, ay: 400 };
export const EYE_BOLT = { long: 1.9, strike: 1.0, fps: 30, reach: 0.9, sky: 340 } as const;

/** One frame of a bolt: `t` seconds in, `seed` to make each one its own. Where it hurts: within `reach` tiles of its middle, the moment it strikes. */
export function boltPainted(t: number, view: GameView = 'front', seed = 0): Painted {
  const B = EYE_BOLT;
  const st0 = stage(view, BOLT_CANVAS.ax, BOLT_CANVAS.ay, BOLT_CANVAS);
  const bits: Bit[] = [];
  const put: Put = (part, piece, shape) => bits.push({ part, piece, shape });
  const R = B.reach * TILE3;
  const since = t - B.strike;
  // sparks and stones flung up as it strikes, smoke after
  const drops: [V3, string, number][] = [];
  drops.push(...flung(t, B.strike, 30, () => [0, 0, 3], 120, 200, 0.6, [FLAME[4], FLAME[3], FLAME[2]], 161 + seed, 2));
  drops.push(...flung(t, B.strike, 16, () => [0, 0, 2], 70, 220, 0.75, RUBBLE, 163 + seed, 3));
  if (since > 0.25) for (let i = 0; i < 10; i++) {
    const f = fr((since - 0.25) * 0.8 + i / 10);
    // (thinning away as it ends)
    if (hash(i, 3, 165 + seed) > 1.4 * (1 - (since - 0.25) / (B.long - B.strike - 0.3))) continue;
    const a = hash(i, 1, 165 + seed) * TAU;
    const r = R * 0.6 * hash(i, 2, 165 + seed);
    if (since - 0.25 < f * 1.25) continue;
    drops.push([[Math.cos(a) * r, Math.sin(a) * r, 6 + 70 * f], f < 0.4 ? '#4a4248' : '#2e2a30', f < 0.5 ? 3 : 2]);
  }
  // the tear in the dome, sparking as it opens
  const tear = t < B.strike ? sm((t - 0.2) / (B.strike - 0.2)) : Math.max(0, 1 - since / 0.4);
  if (tear > 0) for (let i = 0; i < 8; i++) {
    const a = (i / 8) * TAU + t * 4 + seed;
    const r = (4 + 14 * hash(i, Math.floor(t * 20), 167)) * tear;
    drops.push([[Math.cos(a) * r, Math.sin(a) * r * 0.5, B.sky + Math.sin(a) * r * 0.4], i % 2 ? FLAME[2] : FLAME[3], 2]);
  }
  for (const [p, c, size] of drops) put('drops', 'drop', { k: 'mote', p, c, size });
  const lights = paintBits(st0, bits, [0, 0, 20]);
  const px = st0.whole(null);
  const { w, h } = BOLT_CANVAS;
  const set = (x: number, y: number, c: string): void => {
    x = Math.round(x);
    y = Math.round(y);
    if (x >= 0 && y >= 0 && x < w && y < h) px.set(x, y, c);
  };
  const free = (x: number, y: number): boolean => px.d[(y * w + x) * 4 + 3] === 0;
  // THE FLOOR: the runes' circle, filling as it nears; the blast's fire; the scorch
  const b = st0.back;
  const grow = sm(t / 0.3);
  const fill = cl01(t / B.strike);
  const spin = t * 1.6 + seed;
  const ring = t < B.strike * 0.45 ? FLAME[1] : t < B.strike * 0.8 ? FLAME[2] : FLAME[3];
  const blast = since < 0 ? 0 : since < 0.12 ? since / 0.12 : Math.max(0, 1 - (since - 0.12) / 0.35);
  const scorch = since < 0 ? 0 : since < B.long - B.strike - 0.5 ? 1 : Math.max(0, 1 - (since - (B.long - B.strike - 0.5)) / 0.45);
  const [cx0, cy0] = st0.at([0, 0, 0]);
  const span = R * 1.5;
  for (let y = Math.max(0, Math.floor(cy0 - span)); y <= Math.min(h - 1, Math.ceil(cy0 + span)); y++) {
    for (let x = Math.max(0, Math.floor(cx0 - span * 1.25)); x <= Math.min(w - 1, Math.ceil(cx0 + span * 1.25)); x++) {
      if (!free(x, y)) continue;
      const sx = x + 0.5 - BOLT_CANVAS.ax;
      const sy = y + 0.5 - BOLT_CANVAS.ay;
      const n0 = -(b[2][0] * sx + b[2][1] * sy) / b[2][2];
      const fx = b[0][0] * sx + b[0][1] * sy + b[0][2] * n0;
      const fy = b[1][0] * sx + b[1][1] * sy + b[1][2] * n0;
      const d = Math.hypot(fx, fy) / R;
      const ang = Math.atan2(fy, fx);
      const odd = (x + y) % 2 === 0;
      const hh = hash(x, y, 169 + seed);
      let c: string | null = null;
      if (since < 0) {
        // its runes: an outer ring, dashed and turning; an inner ring turning the other way, its marks between; filling from its middle
        const g = d / Math.max(0.05, grow);
        if (Math.abs(g - 1) < 0.06) c = fr((ang / TAU) * 24 + spin) < 0.75 ? ring : null;
        else if (Math.abs(g - 0.72) < 0.045) c = fr((ang / TAU) * 6 - spin * 1.5) < 0.82 ? ring : null;
        else if (g > 0.76 && g < 0.95) {
          // (its runes: little bars across the band, six of them, turning)
          const q = fr((ang / TAU) * 6 + spin * 0.7);
          if (q > 0.42 && q < 0.58 && (g < 0.8 || g > 0.91 || Math.abs(q - 0.5) < 0.03)) c = ring;
        }
        if (!c && g < 1 && d < fill * grow && odd) c = fill > 0.75 ? FLAME[2] : FLAME[1];
        if (!c && d < 0.07 && fill > 0.3) c = FLAME[3];
      } else {
        // the blast's fire spreading out, then the stones scorched, smouldering
        const fire = 1.3 * Math.min(1, since / 0.12);
        if (blast > 0 && d < fire) {
          const edge = fire - d;
          c = edge < 0.12 ? FLAME[2] : d < 0.45 * blast ? FLAME[4] : odd || blast > 0.6 ? FLAME[3] : null;
        }
        if (!c && scorch > 0 && d < 1.05) {
          const ember = (since < 0.8 ? 0.045 : 0.02) * scorch;
          if (hh < ember) c = since < 0.6 ? FLAME[2] : FLAME[1];
          else if (hh < ember + 0.55 * scorch * (1 - 0.35 * d) && odd) c = d < 0.5 ? '#0c070a' : '#1a1216';
        }
      }
      if (c) px.set(x, y, c);
    }
  }
  // THE BOLT: cracking down from the tear to the stones, jagged, re-forking each frame
  const [tx, ty] = st0.at([0, 0, B.sky]);
  const bolt = since < 0 ? 0 : since < 0.2 ? 1 : Math.max(0, 1 - (since - 0.2) / 0.12);
  if (bolt > 0) {
    const tick = Math.floor(t * 30);
    const N = 14;
    const pts: [number, number][] = [];
    for (let i = 0; i <= N; i++) {
      const f = i / N;
      const jag = i === 0 || i === N ? 0 : (hash(i, tick, 171 + seed) - 0.5) * 22;
      pts.push([tx + (cx0 - tx) * f + jag, ty + (cy0 - ty) * f]);
    }
    const seg = (a: [number, number], c2: [number, number], wd: number, col: (o: number) => string): void => {
      const steps = Math.ceil(Math.max(Math.abs(c2[0] - a[0]), Math.abs(c2[1] - a[1])));
      for (let k = 0; k <= steps; k++) {
        const x = a[0] + ((c2[0] - a[0]) * k) / Math.max(1, steps);
        const y = a[1] + ((c2[1] - a[1]) * k) / Math.max(1, steps);
        for (let o = -wd; o <= wd; o++) set(x + o, y, col(Math.abs(o)));
      }
    };
    const wd = Math.round(1 + 2.5 * bolt);
    for (let i = 0; i < N; i++) seg(pts[i], pts[i + 1], wd, (o) => (o <= wd - 2 ? FLAME[4] : o < wd ? FLAME[2] : FLAME[1]));
    // its forks
    for (let j = 0; j < 3; j++) {
      const at = 3 + Math.floor(hash(j, tick, 173 + seed) * (N - 5));
      let p = pts[at];
      const side = hash(j, tick, 175 + seed) > 0.5 ? 1 : -1;
      for (let k = 0; k < 4; k++) {
        const q: [number, number] = [p[0] + side * (6 + 8 * hash(j * 5 + k, tick, 177)), p[1] + 8 + 6 * hash(j * 5 + k, tick, 179)];
        seg(p, q, 0, () => (k < 2 ? FLAME[2] : FLAME[1]));
        p = q;
      }
    }
  }
  // the tear itself: a slit of the siege's fire high above
  if (tear > 0) {
    const half = Math.round(4 + 12 * tear);
    for (let o = -half; o <= half; o++) {
      const thick = Math.round((1 - Math.abs(o) / (half + 1)) * 3 * tear);
      for (let d = -thick; d <= thick; d++) set(tx + o, ty + d, Math.abs(d) < thick || thick === 0 ? (Math.abs(o) < half * 0.4 ? FLAME[4] : FLAME[2]) : FLAME[1]);
    }
  }
  // its lights: the runes', the tear's, the bolt's, the blast's
  if (since < 0) lights.push({ x: cx0, y: cy0, r: 36 + 20 * fill, color: fill > 0.8 ? FLAME[3] : FLAME[2], a: 0.25 + 0.3 * fill });
  if (tear > 0) lights.push({ x: tx, y: ty, r: 30 * tear, color: FLAME[2], a: 0.5 * tear });
  if (bolt > 0) for (let i = 0; i <= 4; i++) lights.push({ x: tx + ((cx0 - tx) * i) / 4, y: ty + ((cy0 - ty) * i) / 4, r: 46, color: FLAME[2], a: 0.5 * bolt });
  if (blast > 0) lights.push({ x: cx0, y: cy0, r: 80 * blast + 20, color: FLAME[3], a: 0.7 * blast });
  return { px, lights };
}
/** The same, as the game holds it. */
export function boltFrame(t: number, view: GameView = 'front', seed = 0): Sprite {
  return toSprite(boltPainted(t, view, seed), null, BOLT_CANVAS.ax, BOLT_CANVAS.ay);
}

// ---------------------------------------------------------------------------------------------
// HIS BILE'S POOLS (his pick, “Bile spat in arcs, leaving pools”), each painted on its own so that the game lays it
// where a glob lands (`bileLanding`): splashing out, a ragged pool of it, blotched, bubbling and steaming, lasting;
// drying away, a stain, then nothing. Dull: it gives no light.

/** Its own canvas, and where on it the middle of the pool is, on the floor. */
export const BILE_CANVAS = { w: 260, h: 190, ax: 130, ay: 120 };
/** Where it hurts: within `reach` tiles of its middle, from `form` till `dry[0]`. */
export const EYE_BILE = { long: 6.0, form: 0.25, dry: [5.0, 6.0], reach: 1.0, fps: 15 } as const;

/** One frame of a pool of his bile: `t` seconds after its glob lands, `seed` to make each one its own. */
export function bilePainted(t: number, view: GameView = 'front', seed = 0): Painted {
  const B = EYE_BILE;
  const st0 = stage(view, BILE_CANVAS.ax, BILE_CANVAS.ay, BILE_CANVAS);
  const bits: Bit[] = [];
  const put: Put = (part, piece, shape) => bits.push({ part, piece, shape });
  const R = B.reach * TILE3;
  const size = t < B.form ? 0.35 + 0.65 * sm(t / B.form) : t < B.dry[0] ? 1 : 1 - 0.3 * sm((t - B.dry[0]) / (B.dry[1] - B.dry[0]));
  const dry = t < B.dry[0] ? 0 : sm((t - B.dry[0]) / (B.dry[1] - B.dry[0]));
  // its ragged edge, its own
  const s1 = hash(seed, 1, 191) * TAU;
  const s2 = hash(seed, 2, 191) * TAU;
  const edge = (a: number): number => R * size * (0.88 + 0.12 * Math.sin(3 * a + s1) + 0.08 * Math.sin(5 * a + s2) + 0.05 * Math.sin(9 * a + s1 * 2));
  // its splash as it lands; its bubbles rising and bursting; its steam
  const drops: [V3, string, number][] = [];
  drops.push(...flung(t, 0, 16, () => [0, 0, 2], 90, 110, 0.4, BILE_DROPS, 193 + seed, 2));
  if (t > B.form && dry < 0.8) {
    for (let i = 0; i < 6; i++) {
      const per = 0.9 + 0.7 * hash(i, 3, 195 + seed);
      const ph = fr(t / per + hash(i, 4, 195 + seed));
      const n = Math.floor(t / per + hash(i, 4, 195 + seed));
      const a = hash(i, n, 197 + seed) * TAU;
      const r = edge(a) * 0.7 * Math.sqrt(hash(i, n + 1, 197 + seed));
      const at: V3 = [Math.cos(a) * r, Math.sin(a) * r, 0];
      if (ph < 0.75) {
        // (a bubble swelling)
        const br = 1.5 + 3 * (ph / 0.75);
        put(`bub${i}`, 'bubble', { k: 'ball', c: add(at, [0, 0, br * 0.3]), ax: [[br, 0, 0], [0, br, 0], [0, 0, br * 0.8]], skin: (u, tone) => (u[2] > 0.5 && u[0] < 0 ? BILE[4] : BILE[Math.min(4, tone + 1)]) });
      } else if (ph < 0.9) {
        // (bursting)
        for (let k = 0; k < 5; k++) {
          const b2 = (k / 5) * TAU;
          const f = (ph - 0.75) / 0.15;
          drops.push([add(at, [Math.cos(b2) * 5 * f, Math.sin(b2) * 5 * f, 3 + 8 * f * (1 - f)]), BILE_DROPS[k % 4], 2]);
        }
      }
    }
    for (let i = 0; i < 7; i++) {
      const f = fr(t * 0.45 + i / 7);
      const a = hash(i, 5, 199 + seed) * TAU;
      const r = R * 0.6 * hash(i, 6, 199 + seed);
      drops.push([[Math.cos(a) * r + 6 * Math.sin(f * 5 + i), Math.sin(a) * r, 4 + 46 * f], f < 0.5 ? '#6e7258' : '#4c5040', f < 0.4 ? 3 : 2]);
    }
  }
  for (const [p, c, sz] of drops) put('drops', 'drop', { k: 'mote', p, c, size: sz });
  paintBits(st0, bits, [0, 0, 6]);
  const px = st0.whole(null);
  // THE POOL, on the floor under its bubbles
  const b = st0.back;
  const { w, h, ax, ay } = BILE_CANVAS;
  const free = (x: number, y: number): boolean => px.d[(y * w + x) * 4 + 3] === 0;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (!free(x, y)) continue;
      const sx = x + 0.5 - ax;
      const sy = y + 0.5 - ay;
      const n0 = -(b[2][0] * sx + b[2][1] * sy) / b[2][2];
      const fx = b[0][0] * sx + b[0][1] * sy + b[0][2] * n0;
      const fy = b[1][0] * sx + b[1][1] * sy + b[1][2] * n0;
      const a = Math.atan2(fy, fx);
      const d = Math.hypot(fx, fy) / edge(a);
      const hh = hash(x, y, 201 + seed);
      let c: string | null = null;
      if (d < 1) {
        // (its rim dark, a swirl of lighter and darker in it, a dull sheen on its far side)
        const swirl = Math.sin(fx * 0.22 + Math.sin(fy * 0.18 + seed) * 2 + t * 0.6) + Math.sin(fy * 0.25 - t * 0.4 + seed);
        c = d > 0.86 ? BILE[1] : swirl > 1.1 ? BILE[3] : swirl < -1.1 ? BILE[1] : BILE[2];
        if (d < 0.7 && fy - fx > R * 0.25 * size && fy - fx < R * 0.4 * size && hh < 0.5) c = BILE[4];
        // (drying: darkening to a stain, the stain gone)
        if (dry > 0) c = hh < dry ? null : d > 0.8 || hh < dry + 0.3 ? '#1e200e' : BILE[1];
      } else if (d < 1.25 && t < B.dry[0]) {
        // (its spatter round it)
        const sp = hash(Math.round(fx / 3), Math.round(fy / 3), 203 + seed);
        if (sp > 0.82 + (d - 1) * 0.6) c = sp > 0.93 ? BILE[3] : BILE[1];
      }
      if (c) px.set(x, y, c);
    }
  }
  return { px, lights: [] };
}
/** The same, as the game holds it. */
export function bileFrame(t: number, view: GameView = 'front', seed = 0): Sprite {
  return toSprite(bilePainted(t, view, seed), null, BILE_CANVAS.ax, BILE_CANVAS.ay);
}

// ---------------------------------------------------------------------------------------------
// HIS EYESPAWN'S EGGS, LANDED (his pick, “Spews eyespawn out of the muck”), each painted on its own so that the game
// lays it where an egg lands (`spawnLanding`): it thuds down into a splat of the muck, squashing and bouncing; it sits
// rocking, the eye in it looking about; it shakes harder and bulges (the warning: it is about to hatch); it bursts
// (the game brings out the eyespawn there at `hatch`), its shell flung, its slime splashing; the torn shell sinks.

/** Its own canvas, and where on it the middle of where it lands is, on the floor. */
export const SPAWN_CANVAS = { w: 180, h: 150, ax: 90, ay: 110 };
export const EYE_SPAWN = { long: 3.0, hatch: 2.5, fps: 15 } as const;

/** One frame of a landed egg: `t` seconds after it lands, `seed` to make each one its own. */
export function spawnPainted(t: number, view: GameView = 'front', seed = 0): Painted {
  const H = EYE_SPAWN;
  const st0 = stage(view, SPAWN_CANVAS.ax, SPAWN_CANVAS.ay, SPAWN_CANVAS);
  const bits: Bit[] = [];
  const put: Put = (part, piece, shape) => bits.push({ part, piece, shape });
  const r = 13;
  const drops: [V3, string, number][] = [];
  // its muck, splashed up as it lands
  drops.push(...flung(t, 0, 14, () => [0, 0, 2], 60, 90, 0.4, MUCK_DROPS, 231 + seed, 2));
  if (t < H.hatch) {
    const squash = bump(t, 0, 0.22) - 0.4 * bump(t, 0.22, 0.42);
    const hop = 7 * bump(t, 0.12, 0.36);
    const shake = t < 2.0 ? 0.14 * Math.sin(t * 6 + seed) * cl01(t / 0.4) : 0.32 * Math.sin(t * 31 + seed) * sm((t - 2.0) / 0.2);
    const bulge = t > 2.0 ? 0.35 * Math.max(0, Math.sin(t * 17 + seed)) * sm((t - 2.0) / 0.3) : 0;
    // (the eye in it darting about, stopping, darting again)
    const look = seed + Math.floor(t * 2.2) * 1.3 + 0.6 * sm(fr(t * 2.2) * 4);
    eggBits(put, 'egg', [Math.sin(shake) * r * 0.5, 0, r * 1.1 * (1 - 0.25 * squash + 0.12 * bulge) + hop], r, shake, squash - bulge, seed, look);
  } else {
    // THE HATCH: its shell burst, flung; its slime splashing; the torn lower half left, sinking into the muck
    drops.push(...flung(t, H.hatch, 16, () => [0, 0, r], 80, 160, 0.45, [EGG[3], EGG[2], EGG[4], '#5c4d33'], 233 + seed, 3));
    drops.push(...flung(t, H.hatch, 14, () => [0, 0, r * 0.8], 60, 120, 0.4, [MUCK[3], MUCK[2], BILE[2]], 235 + seed, 2));
    const sink = sm((t - H.hatch - 0.15) / (H.long - H.hatch - 0.2));
    // (sinking: flattening down into the muck)
    const k = 1 - 0.85 * sink;
    if (sink < 0.97) put('shell', 'shell', { k: 'ball', c: [0, 0, r * 0.35 * k], ax: [[r * 1.05 * (0.6 + 0.4 * k), 0, 0], [0, r * 1.05 * (0.6 + 0.4 * k), 0], [0, 0, r * 0.6 * k]], skin: (u, tone) => {
      const n = norm(u as V3);
      if (n[2] > 0.25 + 0.3 * fr(Math.atan2(n[1], n[0]) * 1.3 + seed)) return null;
      return n[2] > 0.1 ? MUCK[2] : EGG[Math.max(0, tone - 1)];
    } });
  }
  for (const [p, c, size] of drops) put('drops', 'drop', { k: 'mote', p, c, size });
  paintBits(st0, bits, [0, 0, 12]);
  // (the floor swallows what of it is below the floor: its shell sinking into the muck)
  const px = st0.whole(ENEMY_RIM);
  const b = st0.back;
  const { w, h, ax, ay } = SPAWN_CANVAS;
  // ITS MUCK, under it: a ragged splat, wet, a sheen on it; gone as the shell sinks
  const R0 = 0.6 * TILE3 * sm(t / 0.2) * (t > H.hatch ? 1 - 0.6 * sm((t - H.hatch) / (H.long - H.hatch)) : 1);
  const gone = t > H.hatch ? sm((t - H.hatch - 0.1) / (H.long - H.hatch - 0.1)) : 0;
  const s1 = hash(seed, 1, 237) * TAU;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (px.d[(y * w + x) * 4 + 3] > 0) continue;
      const sx = x + 0.5 - ax;
      const sy = y + 0.5 - ay;
      const n0 = -(b[2][0] * sx + b[2][1] * sy) / b[2][2];
      const fx = b[0][0] * sx + b[0][1] * sy + b[0][2] * n0;
      const fy = b[1][0] * sx + b[1][1] * sy + b[1][2] * n0;
      const a = Math.atan2(fy, fx);
      const edge = R0 * (0.85 + 0.15 * Math.sin(3 * a + s1) + 0.1 * Math.sin(7 * a - s1));
      const d = Math.hypot(fx, fy) / Math.max(1, edge);
      const hh = hash(x, y, 239 + seed);
      if (d < 1 && hh >= gone) px.set(x, y, d > 0.85 ? MUCK[0] : Math.sin(fx * 0.3 + fy * 0.2 + seed) > 0.75 ? MUCK[3] : hh < 0.12 ? MUCK[2] : MUCK[1]);
    }
  }
  return { px, lights: [] };
}
/** The same, as the game holds it. */
export function spawnFrame(t: number, view: GameView = 'front', seed = 0): Sprite {
  return toSprite(spawnPainted(t, view, seed), null, SPAWN_CANVAS.ax, SPAWN_CANVAS.ay);
}

// ---------------------------------------------------------------------------------------------
// WHAT THE PAGES AND TESTS ASK OF IT

let lastUnder: Uint8Array = new Uint8Array(0);
/** One frame of it: `which` (stand, lurk, slam, slamUnder, sweep, sweepUnder), `t` seconds in, from in front or behind; `aim` the way its blow goes (degrees round from its forward, toward its left). */
export function eyePainted(which: string, t: number, view: GameView = 'front', aim = 0, clock = 0): Painted {
  return paintPose(poseOf(which, t, aim, clock), view);
}
/** The same, as the game holds a figure. */
export function eyeFrame(which: string, t: number, view: GameView = 'front', aim = 0, clock = 0): Sprite {
  return toSprite(eyePainted(which, t, view, aim, clock), EYE_AURA, EYE_CANVAS.ax, EYE_CANVAS.ay);
}
/** Every solid of one moment of it, as the tests read them. */
export function eyeSolids(which: string, t: number, aim = 0): Bit[] {
  const bits: Bit[] = [];
  eyeBits(poseOf(which, t, aim), (part, piece, shape) => {
    bits.push({ part, piece, shape });
  });
  return bits;
}
/** Which pixels of one of its looks are of it under the water, seen through it (for the tests). */
export function eyeLookUnder(kind: EyeLook, view: GameView = 'front'): Uint8Array {
  paintPose(lookPose(kind), view);
  return lastUnder;
}
/** One of its looks, painted (for the look sheet and the tests). */
export function eyeLookPainted(kind: EyeLook, view: GameView = 'front'): Painted {
  return paintPose(lookPose(kind), view);
}
/** The same, as the game holds a figure. */
export function eyeLookFrame(kind: EyeLook, view: GameView = 'front'): Sprite {
  return toSprite(eyeLookPainted(kind, view), EYE_AURA, EYE_CANVAS.ax, EYE_CANVAS.ay);
}
/** Every solid of one of its looks, as the tests read them. */
export function eyeLookSolids(kind: EyeLook): Bit[] {
  const bits: Bit[] = [];
  eyeBits(lookPose(kind), (part, piece, shape) => {
    bits.push({ part, piece, shape });
  });
  return bits;
}
void INK;
