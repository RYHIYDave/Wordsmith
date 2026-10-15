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
 * out to 6.0 by 5.2, about three tiles of it to fight on (the level's own pool and ring are the main chat's). What of it
 * is under the water is seen only within the pool.
 */
export const EYE_POOL = { rx: 2.9 * TILE3, ry: 2.5 * TILE3 };
/** The ruin's ring of paving round the pool, out to its edge (as above). */
export const EYE_RING = { rx: 6.0 * TILE3, ry: 5.2 * TILE3 };
/** How deep under the water anything of it is still seen. */
const SEEN_DEEP = 40;
/** Its canvas, and where on it the middle of the pool is, at the water. */
export const EYE_CANVAS = { w: 760, h: 700, ax: 380, ay: 500 };
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

/** How long each of its moves lasts (a stand: its round). */
export function eyeLong(which: string): number {
  if (which === 'stand') return EYE_STAND.period;
  if (which === 'lurk') return EYE_LURK.period;
  return 1;
}
function poseOf(which: string, t: number): EyePose {
  if (which === 'lurk') return lurkPose(t);
  return standPose(t);
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
function eyeSkin(P: EyePose, look: V3, face: V3): (u: V3, tone: number) => string | null {
  const L = norm(look);
  const back = bulkSkin(5, 6, P.blaze) as (u: V3, tone: number, x: number, y: number) => string | null;
  const h = norm(cross(UP, L), LF);
  const v = cross(L, h);
  const IR = 0.46;
  const faceUp = norm(cross(face, [0, 1, 0]));
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
    const yaw = flat ? A.curl * Math.pow(s, 2) * D : 0;
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
      put(part, `${part}_v${k}`, { k: 'rod', a: add(a.p, o0), b: add(b.p, o1), ra: 0.95, rb: 0.95, ramp: P.blaze > 0.5 ? BLAZING : VEIN });
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
function eyeBits(P: EyePose, put: Put): void {
  const R = EYE_R;
  const E: V3 = add([0, 0, P.zE], P.heave);
  // the way its face is turned (up from forward by its tilt), and its own across and up for that face
  const F = norm(add(mul(FW, Math.cos(P.tilt * D)), mul(UP, Math.sin(P.tilt * D))));
  const U = norm(cross(F, LF));
  const Lx = LF;
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
  const sk = eyeSkin(P, lookLocal, [dot(F, FW), dot(F, LF), dot(F, UP)]);
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
  lastUnder = drown(px, zAt, st0, view);
  if (P.ripples && P.ripples.length) ripple(px, st0, view, P.ripples, zAt);
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
const rgbOf = (c: string): V3 => [parseInt(c.slice(1, 3), 16), parseInt(c.slice(3, 5), 16), parseInt(c.slice(5, 7), 16)];

// ---------------------------------------------------------------------------------------------
// WHAT THE PAGES AND TESTS ASK OF IT

let lastUnder: Uint8Array = new Uint8Array(0);
/** One frame of it: `which` (stand, lurk; its moves to come), `t` seconds in, from in front or behind. */
export function eyePainted(which: string, t: number, view: GameView = 'front'): Painted {
  return paintPose(poseOf(which, t), view);
}
/** The same, as the game holds a figure. */
export function eyeFrame(which: string, t: number, view: GameView = 'front'): Sprite {
  return toSprite(eyePainted(which, t, view), EYE_AURA, EYE_CANVAS.ax, EYE_CANVAS.ay);
}
/** Every solid of one moment of it, as the tests read them. */
export function eyeSolids(which: string, t: number): Bit[] {
  const bits: Bit[] = [];
  eyeBits(poseOf(which, t), (part, piece, shape) => {
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
