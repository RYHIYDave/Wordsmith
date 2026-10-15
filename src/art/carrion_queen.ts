// FLOOR 7'S BOSS, THE CARRION QUEEN: a mock-up (nothing of the game imports this file; `CARRION_QUEEN_ON` is
// off).
//
// The planning chat's, with his yes (12 Oct, 18:07, "All the main ones rock.  I like them all"): a huge
// cult-bound vulture nesting on an outcrop over the drop; the ledge crumbles section by section as the fight
// goes on; a talon rake (basic), a wing gust that shoves you toward the edge, a dive along a marked line, a
// call that brings her flock. His word on the Ledge Road (13 Oct, 20:59): the boss area "on some peak where
// we can see the city".
//
// HIS BRIEF, asked as his art rulebook's questions for a new character (13 Oct, asked after 22:25): how big, “Wings
// wider than the trail (Recommended)”, offered as: huge: perched, about the Unfinished's height; wings spread,
// wider than the trail is across; menacing. The one thing to know her by, “Bone crown and cult chains
// (Recommended)”, offered as: a ruff of pale bone-white feathers like a crown, a broken cult shackle and chain
// on one leg, the cult's mark burning pink on her breast. How she moves, “Hunched hops, a blur in the air
// (Recommended)”, offered as: heavy and lurching on the ground, hopping and dragging her wings; then
// terrifyingly fast once she takes off. How she dies: “All these are great.  I think I want to see them
// all” (falls off the edge; the ledge gives way; bursts into feathers). Her sound, “A shrieking screech,
// beating wings (Recommended)”. What she must never look like, “Not like a phoenix or eagle”, offered as: no
// proud, noble bird look: ugly, a carrion eater.
//
// THIS FILE, SO FAR: how she looks, standing (pictures first). She is built as every boss is, on the heroes'
// bones (art/skeleton.ts), dressed in solids through art/new_mobs3.ts's painter, lit from the upper left, the
// indigo seam, the enemy's pink edge round her: a bird on a man's bones, her wings his arms (shoulder, elbow,
// wrist), her feathers hung from them; her legs his, the thighs lost in the feathers of her trousers, the
// shanks bare and scaled, the feet great taloned toes. She stands as vultures do, MANTLED: hunched, her wings
// held half open and drooping round her like a ragged cloak to the ground, her bare grey neck sunk into her
// crown of bone-white feathers, her hooked beak low; ugly, never noble. On her left leg the cult's shackle,
// its chain broken, dragging; on her breast the cult's mark burning; her eyes the cult's fire.

import type { Sprite } from '../engine/px';
import { shriekAt } from './floor5';
import { hash, toSprite } from './kit';
import type { Painted, Ramp } from './kit';
import { ENEMY_RIM, FLAME, IRON } from './mkit';
import { TILE3, at3, canvasOf, paintMob, sphere } from './new_mobs3';
import type { Bit, Mob, MobCanvas, MobMove, Moment, Put } from './new_mobs3';
import type { GameView, Stage } from './skin';
import { add, buildOf, cross, dot, lerp3, mul, norm, standing, sub } from './skeleton';
import type { Bones, Build, Key3, Motion, Skeleton, V3 } from './skeleton';

/** THE SWITCH, OFF: nothing of the game reads this file. */
export const CARRION_QUEEN_ON = { on: false };

const clamp01 = (v: number): number => Math.max(0, Math.min(1, v));
const fr = (t: number): number => t - Math.floor(t);
const Z: V3 = [0, 0, 1];

// ---------------------------------------------------------------------------------------------
// HER BODY: perched, about the Unfinished's height (224): a vulture's, on the bones: a great deep body, short
// legs, a long neck, a small bare head; her arms her wings, long.

export const CQ_TALL = 264;
const BASE: Build = buildOf(CQ_TALL, 0.85, { shoulders: 1.25, chest: 1.55, depth: 1.45, waist: 1.35, hips: 1.3, legs: 0.6, arms: 1.3, trunk: 1.08, limbs: 1.35, pad: 6 });
/** (her neck long, her head carried forward on it) */
export const CQ_BODY: Build = { ...BASE, neck: 0.13 * CQ_TALL, headFwd: 0.05 * CQ_TALL };
const B = CQ_BODY;

/** Her canvas: room for her standing mantled, her wings spread wider than the trail, and her fall back off the edge. */
// (80 more on the left and 80 more below than the first, 820 by 780, feet at (410, 520), where her fall backward off
// the edge reached; and 200 more above, for her dive's climb out of sight. Her feet at (490, 720))
export const CQ_CANVAS: MobCanvas = { w: 900, h: 1060, ax: 490, ay: 720 };

// ---------------------------------------------------------------------------------------------
// HER COLOURS: a figure's (her deep twice, the body, the lit, the sheen)

// REDONE 14 Oct on his words, 19:22: “Hey can you redo the carrion queen.  She kinda looks like shit and the
// animations are uninspired”; his pick for her look, 19:23: “Black-violet, raw bald head, burning crown
// (Recommended)”, offered as: deep black plumage with a violet sheen, ragged fingered wings, a bald wrinkled red
// head and neck, her bone crown and the cult's mark burning pink and gold; and, 19:23: “Make sure she hits all the
// checks in the art book rules including the wild and big animations”. (She was brown-grey all over, Colour 5's
// “never mud-brown all over”.)

/** Her plumage: black, a violet sheen where the light lies along it (Colour 5, “Neon on dark”). */
export const PLUMAGE: Ramp = ['#08060c', '#08060c', '#171122', '#2a1d44', '#58399a'];
/** The feathers cloaking her back: as her plumage, never in its sheen (they lie up into the light). */
export const MANTLE: Ramp = ['#08060c', '#08060c', '#140e1e', '#231838', '#231838'];
/** Her flight feathers: black, worn, their edges catching the violet. */
export const QUILLS: Ramp = ['#060409', '#060409', '#151021', '#271d42', '#4a3984'];
/** Her crown: the ruff of bone-white feathers. */
export const CROWN: Ramp = ['#5a4e48', '#5a4e48', '#b0a492', '#d8cdb9', '#ece4d4'];
/** Her bare head and neck: raw, wrinkled red skin, a carrion eater's (a deep crimson, never the cult's pink). */
export const BARE: Ramp = ['#3a0b12', '#3a0b12', '#8c1d2a', '#b9323c', '#dc5656'];
/** Her shanks and toes: dark grey, scaled. */
export const SCALES: Ramp = ['#1c1824', '#1c1824', '#4c4458', '#6c6278', '#8c8298'];
/** Her talons and the tip of her beak: near black, glossy. */
export const TALON: Ramp = ['#0e0c12', '#0e0c12', '#2a2632', '#48424e', '#6a6470'];
/** Her beak: pale yellowed horn. */
export const BEAK: Ramp = ['#4a3f2e', '#4a3f2e', '#bfae86', '#e0d1a8', '#f2e8c8'];

// ---------------------------------------------------------------------------------------------
// HOW SHE STANDS: MANTLED. Hunched over, her body tipped forward, her head low on her sunk neck; her wings
// held out from her sides and drooping to the floor like a ragged cloak; her feet planted, her talons spread.

const ARM = B.upperArm + B.foreArm;
export const CQ_REST: Bones = {
  ...standing(B),
  pz: -10, px: 0, yaw: 0, pitch: 28, roll: 0, twist: 0, bend: 16, side: 0,
  faceTurn: -16, faceUp: -18, faceTilt: 4,
  lfx: 2, lfy: 10, lft: 16, lk: 12, rfx: -3, rfy: -10, rft: -14, rk: -12,
  // (her wings held out and up from her hunched shoulders, a ragged cloak spread round her: the shape you dread)
  lhIn: 0, lhx: 10, lhy: ARM * 0.7, lhz: ARM * 0.02, le: 60,
  rhIn: 0, rhx: 10, rhy: -ARM * 0.7, rhz: ARM * 0.02, re: 60,
};

/**
 * HER STAND (2.6 s round): never still. Her head snakes low from side to side; her wings breathe like bellows, her
 * bulk heaving with them; her crown's fire flickers; and once a round she rouses, every feather shaken up and out a
 * moment (`rouseOf`, in her solids). As big as the handover allows: the game may start any move from any frame of it.
 */
function cqStand(): Motion {
  const R = CQ_REST;
  const T = CQ_BREATH;
  const loop = (pts: Track): ((t: number) => number) => curve(pts, T);
  const turn = loop([[0, 0], [0.65, 20], [1.3, 0], [1.95, -20]]);
  const up = loop([[0, 0], [0.65, -4], [1.3, 0], [1.95, -4]]);
  const bellows = loop([[0, 0], [0.9, 0.75], [1.3, 1], [2.0, 0.35]]);
  const sway = loop([[0, 0], [0.65, 3.5], [1.3, 0], [1.95, -3.5]]);
  const keys = byCurves(T, 10, (t) => {
    const b = bellows(t);
    return { pz: R.pz + 3 * b, py: sway(t), roll: (-1.2 * sway(t)) / 3.5, bend: R.bend - 2 * b, faceTurn: R.faceTurn + turn(t), faceUp: R.faceUp + up(t), lhz: R.lhz + 4 * b, rhz: R.rhz + 4 * b, lhy: R.lhy + 4 * b, rhy: R.rhy - 4 * b };
  });
  return { keys, loop: 0 };
}
export const CQ_BREATH = 2.6;

// ---------------------------------------------------------------------------------------------
// HER MOVES, his “Hunched hops, a blur in the air”; built anew 14 Oct to the plan he said yes to (“Yes, build these
// (Recommended)”), after “Absolutely not.  Scrap all the animations and do them differently.  Following the rules”

type Track = ReadonlyArray<readonly [number, number]>;
/**
 * A SMOOTH WAY THROUGH THESE (time, value) POINTS, easing to a stop at each turn and at its ends, never
 * overshooting (a monotone cubic); `period`, if given, the time it comes round in (the last point leading
 * on to the first).
 */
function curve(pts: Track, period = 0): (t: number) => number {
  const n = pts.length;
  const P = (i: number): readonly [number, number] => {
    if (!period) return pts[Math.max(0, Math.min(n - 1, i))];
    const k = ((i % n) + n) % n;
    return [pts[k][0] + Math.floor(i / n) * period, pts[k][1]];
  };
  const slope = pts.map((_, i) => {
    if (!period && (i === 0 || i === n - 1)) return 0;
    const [x0, y0] = P(i - 1);
    const [x1, y1] = P(i);
    const [x2, y2] = P(i + 1);
    const d0 = (y1 - y0) / (x1 - x0);
    const d1 = (y2 - y1) / (x2 - x1);
    return d0 * d1 <= 0 ? 0 : (2 * d0 * d1) / (d0 + d1);
  });
  return (t: number): number => {
    let q = t;
    if (period) q = t - Math.floor((t - pts[0][0]) / period) * period;
    if (!period && q <= pts[0][0]) return pts[0][1];
    if (!period && q >= pts[n - 1][0]) return pts[n - 1][1];
    let i = n - 1;
    while (i > 0 && pts[i][0] > q) i--;
    const [x0, y0] = P(i);
    const [x1, y1] = P(i + 1);
    const h = x1 - x0;
    const s = (q - x0) / h;
    const m0 = slope[i] * h;
    const m1 = slope[(i + 1) % n] * h;
    const s2 = s * s;
    const s3 = s2 * s;
    return (2 * s3 - 3 * s2 + 1) * y0 + (s3 - 2 * s2 + s) * m0 + (-2 * s3 + 3 * s2) * y1 + (s3 - s2) * m1;
  };
}
/** A move from smooth curves, one for each of the bones it moves: a key at every frame (`fps`) for `long` seconds. */
function byCurves(long: number, fps: number, at: (t: number) => Partial<Bones>): Key3[] {
  const keys: Key3[] = [];
  const n = Math.round(long * fps);
  for (let i = 0; i <= n; i++) keys.push({ at: i / fps, ease: 'lin', pose: at(i / fps) });
  return keys;
}
/** Both her wings at once, the left as given and the right its mirror: raised by `lift` (0 her mantle, 1 high), and as given. */
function wings(lift: number, more: { x?: number; y?: number; z?: number; e?: number } = {}): Partial<Bones> {
  const R = CQ_REST;
  const x = R.lhx - 6 * lift + (more.x ?? 0);
  const y = R.lhy + 18 * lift + (more.y ?? 0);
  const z = R.lhz + ARM * 0.42 * lift + (more.z ?? 0);
  const e = R.le + (more.e ?? 0);
  return { lhx: x, lhy: y, lhz: z, le: e, rhx: x, rhy: -y, rhz: z, re: e };
}

/** Her pace on the ground, tiles a second, and her hop: a round of sixteen frames at sixteen a second (one hop). */
export const CQ_PACE = 0.8;
export const CQ_WALK = { frames: 16, fps: 16, off: 0.3, land: 0.64 } as const;
/**
 * HER WALK, A HOP (one round, 1 s), “a blur in the air”: she gathers low, then lunges forward in a long, low bound,
 * her body level, her wings swept back like a cloak, her talons first; she lands heavy on both feet (`CQ_WALK.land`),
 * flaring her wings to brake, kicking dust off the rock, and sinks; her head held level all the while, locked on you.
 * Her feet are carried back with the rock while they are down and swung through under her in the air.
 */
function cqWalk(): Motion {
  const R = CQ_REST;
  const T = CQ_WALK.frames / CQ_WALK.fps;
  const { off, land } = CQ_WALK;
  const v = CQ_PACE * TILE3;
  const loop = (pts: Track): ((t: number) => number) => curve(pts, T);
  const pz = loop([[0, 0], [0.12, -6], [0.24, -12], [0.44, 16], [0.56, 11], [0.64, -2], [0.78, -11], [0.9, 0]]);
  const pitch = loop([[0, 0], [0.1, 6], [0.2, 10], [0.42, 16], [0.6, 13], [0.72, 12], [0.9, 0]]);
  const bend = loop([[0, 0], [0.1, 5], [0.2, 9], [0.42, 4], [0.6, 2], [0.76, 9], [0.9, 0]]);
  // (her wings flare to brake as she lands, and come down over the frames after it; she is still a beat, from 0.9 s,
  // before she gathers for the next hop)
  const lift = loop([[0, 0], [0.18, 0.3], [0.32, 0.8], [0.44, 0.55], [0.56, 0.55], [0.66, 0.9], [0.8, 0.3], [0.9, 0]]);
  const wx = loop([[0, 0], [0.2, -4], [0.36, -16], [0.54, -18], [0.66, 0], [0.8, 3], [0.9, 0]]);
  const we = loop([[0, 0], [0.36, -10], [0.54, -12], [0.66, 6], [0.8, 2], [0.9, 0]]);
  /** Her feet: carried back with the floor while down; tucked and swung through while she is in the air, talons first. */
  const feet = (t: number): Partial<Bones> => {
    const air = t > off && t < land;
    const u = (t - off) / (land - off);
    const g = u * u * u * (u * (u * 6 - 15) + 10);
    const fx = !air ? v * (t <= off ? -t : T - t) : -v * off + v * (T - land + off) * g;
    const fz = air ? 24 * Math.sin(Math.PI * u) : 0;
    const fp = air ? 26 * Math.sin(Math.PI * u) : 0;
    return { lfx: R.lfx + fx, lfz: fz, lfp: fp, rfx: R.rfx + fx, rfz: fz, rfp: fp, lk: R.lk + fp * 0.3, rk: R.rk - fp * 0.3 };
  };
  const keys = byCurves(T, CQ_WALK.fps, (t) => ({
    pz: R.pz + pz(t),
    pitch: R.pitch + pitch(t),
    bend: R.bend + bend(t),
    // (her head held level as her body tips: locked on you)
    faceUp: R.faceUp + 0.8 * pitch(t),
    ...feet(t),
    ...wings(lift(t), { x: wx(t), e: we(t) }),
  }));
  return { keys, loop: 0 };
}

/** HER TALON RAKE: how long; when her talons rake through (on a frame of the game's thirty a second); when she warns; when and where (forward) her feet come down on the spot. */
export const CQ_RAKE = { long: 1.8, hit: 27 / 30, warn: 0.42, land: 1.0, landX: 14 } as const;
/**
 * HER TALON RAKE: she bursts up off the rock in two great wingbeats and hangs there, her talons cocked up and
 * forward (THE WARNING, held and trembling); she drops, and both feet rake down and back through whoever is before
 * her (`CQ_RAKE.hit`), three burning streaks where her talons go; she comes down on the spot (`land`), rock chips and
 * dust flying, and mantles over it, her wings spread low and forward and her head down, as a vulture over its prey;
 * then she hops back to where she stood.
 */
function cqRake(): Motion {
  const R = CQ_REST;
  const { long, hit, land, landX } = CQ_RAKE;
  const c = (pts: Track): ((t: number) => number) => curve(pts);
  const pz = c([[0, 0], [0.12, -12], [0.2, -8], [0.42, 60], [0.56, 66], [0.7, 62], [0.8, 64], [hit, 22], [land, -6], [1.12, -14], [1.4, -10], [1.55, 8], [1.7, -3], [long, 0]]);
  const px = c([[0, 0], [0.2, -2], [0.42, -14], [0.8, -16], [hit, 4], [land, 16], [1.12, 24], [1.4, 22], [1.55, 10], [1.7, 1], [long, 0]]);
  const pitch = c([[0, 0], [0.12, 10], [0.2, 6], [0.42, -26], [0.8, -32], [hit, 18], [land, 30], [1.12, 36], [1.4, 32], [1.6, 10], [long, 0]]);
  const bend = c([[0, 0], [0.12, 8], [0.42, -12], [0.8, -14], [hit, 8], [land, 14], [1.12, 16], [1.4, 14], [1.6, 4], [long, 0]]);
  const faceUp = c([[0, 0], [0.12, -6], [0.42, 12], [0.8, 16], [hit, -14], [land, -26], [1.12, -30], [1.4, -26], [1.6, -6], [long, 0]]);
  const faceTurn = c([[0, 0], [0.42, 10], [0.8, 12], [hit, -4], [1.12, -8], [1.6, -2], [long, 0]]);
  // her wings: two great beats as she bursts up; held high and trembling as she hangs; beaten down as she rakes; spread
  // low and forward over the spot; up a moment as she hops back
  const lift = c([[0, 0], [0.12, 0.5], [0.3, 1.65], [0.52, 0.55], [0.72, 1.6], [0.82, 1.45], [hit, 0.15], [land, 0.35], [1.12, 0.4], [1.4, 0.4], [1.55, 0.9], [1.7, 0.2], [long, 0]]);
  const wx = c([[0, 0], [0.42, -10], [0.8, -12], [hit, 8], [land, 18], [1.12, 22], [1.4, 20], [1.6, 4], [long, 0]]);
  const we = c([[0, 0], [0.3, 14], [0.52, -6], [0.72, 16], [hit, -10], [land, -18], [1.12, -20], [1.4, -18], [1.6, -4], [long, 0]]);
  // her feet: off the rock as she bursts up (they leave it before they go forward); cocked up and forward as she hangs;
  // raked down and back through the blow; down on the spot, gripping, until she hops back
  const fx = c([[0, 0], [0.26, 0], [0.44, 30], [0.8, 32], [hit, 24], [land, landX], [1.4, landX], [1.55, 6], [1.7, 0], [long, 0]]);
  const fz = c([[0, 0], [0.2, 0], [0.42, 70], [0.8, 72], [hit, 22], [land, 0], [1.4, 0], [1.52, 16], [1.7, 0], [long, 0]]);
  const fp = c([[0, 0], [0.26, 0], [0.44, -50], [0.8, -55], [hit, 10], [land, 0], [long, 0]]);
  // (hanging there, the warning: her wings and her talons trembling)
  const shiver = (t: number): number => (t > 0.56 && t < 0.82 ? Math.sin((t - 0.56) * Math.PI * 2 * 11) * Math.sin(((t - 0.56) / 0.26) * Math.PI) : 0);
  const keys = byCurves(long, 30, (t) => ({
    px: px(t),
    pz: R.pz + pz(t),
    pitch: R.pitch + pitch(t),
    bend: R.bend + bend(t),
    faceUp: R.faceUp + faceUp(t),
    faceTurn: R.faceTurn + faceTurn(t),
    ...wings(lift(t), { x: wx(t), z: 3 * shiver(t), e: we(t) }),
    lfx: R.lfx + fx(t),
    lfz: fz(t),
    lfp: fp(t) + 2.5 * shiver(t),
    rfx: R.rfx + fx(t),
    rfz: fz(t),
    rfp: fp(t) - 2.5 * shiver(t),
  }));
  return { keys, hit };
}

// ---------------------------------------------------------------------------------------------
// HER BIG MOVES: the gust that shoves you toward the edge, the dive along a marked line, the call that brings her flock

/** HER WING GUST: how long; when the blow lands (its warning from `warn`, held). */
export const CQ_GUST = { long: 1.6, hit: 0.82, warn: 0.35 } as const;
/**
 * HER WING GUST: she rears up to her full height and draws her wings far back, trembling, her crown flaring (THE
 * WARNING); then claps them forward together in one huge stroke (`CQ_GUST.hit`), a blast of grit, torn feathers and
 * the cult's embers driven out before her and a ring of dust off the rock; her own blow rocks her back on her feet;
 * she settles back into her mantle. Her feet grip throughout.
 */
function cqGust(): Motion {
  const R = CQ_REST;
  const { long, warn, hit } = CQ_GUST;
  const c = (pts: Track): ((t: number) => number) => curve(pts);
  // (the hold ends at 0.66; the clap gathers over the five frames to the blow, and carries on through it)
  const pz = c([[0, 0], [warn, 14], [0.66, 16], [hit, 9], [0.95, 3], [1.15, 2], [long, 0]]);
  const px = c([[0, 0], [0.66, 2], [hit, 0], [0.98, -12], [1.15, -12], [1.4, -3], [long, 0]]);
  const pitch = c([[0, 0], [warn, -22], [0.66, -24], [hit, 4], [0.95, 14], [1.15, 8], [long, 0]]);
  const bend = c([[0, 0], [warn, -12], [0.66, -12], [hit, 2], [0.95, 7], [long, 0]]);
  const faceUp = c([[0, 0], [warn, 16], [0.66, 18], [hit, -4], [0.98, -10], [1.25, -2], [long, 0]]);
  // her wings: drawn far back and held; clapped forward together; swept back out to her mantle
  const lift = c([[0, 0], [warn, 1.3], [0.66, 1.35], [hit, 0.65], [0.95, 0.4], [1.15, 0.45], [1.35, 0.15], [long, 0]]);
  const wx = c([[0, 0], [warn, -26], [0.66, -28], [hit, 14], [0.95, 28], [1.08, 24], [1.35, 6], [long, 0]]);
  const wy = c([[0, 0], [warn, 10], [0.66, 12], [hit, -12], [0.95, -22], [1.08, -18], [1.35, -5], [long, 0]]);
  const we = c([[0, 0], [warn, 12], [0.66, 14], [hit, -4], [0.95, -14], [1.15, -8], [long, 0]]);
  // (held, trembling: the warning)
  const shiver = (t: number): number => (t > warn + 0.04 && t < 0.66 ? Math.sin((t - warn) * Math.PI * 2 * 11) * Math.sin(((t - warn) / (0.66 - warn)) * Math.PI) : 0);
  const keys = byCurves(long, 30, (t) => ({
    px: px(t),
    pz: R.pz + pz(t),
    pitch: R.pitch + pitch(t),
    bend: R.bend + bend(t),
    faceUp: R.faceUp + faceUp(t),
    ...wings(lift(t), { x: wx(t), y: wy(t), z: 2.6 * shiver(t), e: we(t) }),
  }));
  return { keys, hit };
}

/** HER DIVE: how long; when she launches; when she warns (out of sight above); when she stoops; when her talons strike (the blow, held `freeze`); where they strike, forward. */
export const CQ_DIVE = { long: 2.3, launch: 0.18, warn: 0.55, stoop: 0.78, hit: 1.08, freeze: 0.1, strikeX: 92 } as const;
/**
 * HER DIVE: she crouches and launches straight up, beating hard, a downdraft of dust off the rock (`launch`), and
 * climbs out of sight above (the warning is the game's mark on the line, from `warn`); then she plunges back in a
 * steep stoop (`stoop`), her wings folded back and a streak behind her, levelling out at the last to strike
 * talons-first at the line's far end, at her fastest (`hit`): a heavy blow, held a tenth (`freeze`); then she rips
 * free, her talons dragged on through the rock as she lifts, chips and dust flying, and beats back up and home.
 */
function cqDive(): Motion {
  const R = CQ_REST;
  const { long, launch, stoop, hit, freeze, strikeX } = CQ_DIVE;
  const c = (pts: Track): ((t: number) => number) => curve(pts);
  const back = hit + freeze;
  /** How high she climbs: out of sight above the screen. */
  const TOP = 240;
  /** Where her body is as her talons strike (they reach out before her). */
  const BX = strikeX - 26;
  const kOf = (t: number): number => clamp01((t - stoop) / (hit - stoop));
  const smooth = (k: number): number => k * k * (3 - 2 * k);
  const climbZ = c([[0, 0], [0.12, -10], [launch, -6], [0.42, TOP - 24], [0.62, TOP + 4], [stoop, TOP]]);
  const homeZ = c([[back, 12], [1.45, 64], [1.8, 76], [2.05, 40], [long, 0]]);
  // (down steeply, then levelling out: her height falls smoothly; her way forward gathers to its fastest at the strike)
  const pz = (t: number): number => (t < stoop ? climbZ(t) : t < hit ? TOP + (12 - TOP) * smooth(kOf(t)) : t < back ? 12 : homeZ(t));
  const climbX = c([[0, 0], [0.3, 0], [stoop, -6]]);
  const homeX = c([[back, BX], [1.45, BX + 14], [1.8, 30], [2.0, 0], [long, 0]]);
  const px = (t: number): number => (t < stoop ? climbX(t) : t < hit ? -6 + (BX + 6) * kOf(t) * kOf(t) : t < back ? BX : homeX(t));
  const climbP = c([[0, 0], [0.12, 8], [launch, 4], [0.42, -18], [0.62, -14], [stoop, -10]]);
  const stoopP = c([[stoop, -10], [0.9, 66], [hit, 24]]);
  const homeP = c([[back, 24], [1.45, -14], [1.8, -8], [2.1, 2], [long, 0]]);
  const pitch = (t: number): number => (t < stoop ? climbP(t) : t < hit ? stoopP(t) : t < back ? 24 : homeP(t));
  const climbL = c([[0, 0], [0.12, 0.3], [0.34, 1.4], [0.56, 0.75], [0.72, 1.25], [stoop, 1.2]]);
  const stoopL = c([[stoop, 1.2], [0.9, -0.4], [hit, -0.45]]);
  const homeL = c([[back, -0.45], [1.42, 1.5], [1.72, 0.4], [1.98, 1.2], [2.18, 0.3], [long, 0]]);
  const lift = (t: number): number => (t < stoop ? climbL(t) : t < hit ? stoopL(t) : t < back ? -0.45 : homeL(t));
  const wxT = c([[0, 0], [stoop, -8], [0.9, -22], [hit, -22], [back, -22], [1.42, -4], [long, 0]]);
  const wx = (t: number): number => (t >= hit && t < back ? -22 : wxT(t));
  const faceT = c([[0, 0], [launch, -4], [0.6, 10], [stoop, 6], [0.9, -30], [hit, -12], [back, -12], [1.45, 6], [long, 0]]);
  const faceUp = (t: number): number => (t >= hit && t < back ? -12 : faceT(t));
  // her feet: down until her body has risen out of their reach, then hanging under her; thrust out before her and down
  // in the stoop, striking the rock at the blow; held through the freeze; dragged on through the rock and lifted as she
  // rips free; then hanging under her as she flies home, down where they began
  const ease = (k: number): number => smooth(clamp01(k));
  const feet = (t: number): [number, number] => {
    if (t < stoop) return [px(t), Math.max(0, pz(t) - 36)];
    if (t < hit) {
      const k = kOf(t);
      return [px(t) + 26 * k, Math.max(0, pz(t) - 12 - 36 * (1 - k))];
    }
    if (t < back) return [strikeX, 0];
    const e = ease((t - back) / 0.3);
    const dragged: [number, number] = [strikeX + 20 * e, 14 * e];
    const h = ease((t - back - 0.3) / 0.25);
    return [dragged[0] + (px(t) - dragged[0]) * h, dragged[1] + (Math.max(0, pz(t) - 36) - dragged[1]) * h];
  };
  // (her toes: tucked as she climbs, thrust out for the strike, flat at the end)
  const footP = (t: number): number => (t < launch ? 0 : t < stoop ? 24 * ease((t - 0.28) / 0.15) : t < hit ? 24 - 34 * kOf(t) : t < back ? -10 : (-10 + 34 * ease((t - back) / 0.4)) * ease((2.0 - t) / 0.3));
  const keys = byCurves(long, 30, (t) => {
    const [fx, fz] = feet(t);
    return {
      px: px(t),
      pz: R.pz + pz(t),
      pitch: R.pitch + pitch(t),
      faceUp: R.faceUp + faceUp(t),
      ...wings(lift(t), { x: wx(t) }),
      lfx: R.lfx + fx,
      lfz: fz,
      lfp: footP(t),
      rfx: R.rfx + fx,
      rfz: fz,
      rfp: footP(t),
    };
  });
  return { keys, hit };
}

/** HER CALL: how long; when each ring of the cult's fire pulses out from her. (It brings her flock: the flock is the game's.) */
export const CQ_CALL = { long: 2.0, rings: [0.45, 0.85, 1.25] } as const;
/**
 * HER CALL: she rears up to her full height, her wings flung wide and held trembling, her head thrown back and her beak
 * open to the sky: the screech. Her crown and her mark blaze (`crownHeat`), embers rise off her crown, and rings of the
 * cult's fire pulse out from her over the rock (`CQ_CALL.rings`); then she folds her wings and settles. Her feet grip.
 */
function cqCall(): Motion {
  const R = CQ_REST;
  const { long } = CQ_CALL;
  const c = (pts: Track): ((t: number) => number) => curve(pts);
  const pz = c([[0, 0], [0.35, 24], [0.6, 28], [1.5, 28], [1.75, 10], [long, 0]]);
  const pitch = c([[0, 0], [0.35, -36], [0.6, -40], [1.5, -40], [1.75, -10], [long, 0]]);
  const bend = c([[0, 0], [0.35, -18], [0.6, -20], [1.5, -20], [1.75, -6], [long, 0]]);
  const faceUp = c([[0, 0], [0.35, 46], [0.6, 58], [1.5, 56], [1.75, 12], [long, 0]]);
  const lift = c([[0, 0], [0.35, 1.45], [0.6, 1.6], [1.5, 1.6], [1.75, 0.6], [long, 0]]);
  const wy = c([[0, 0], [0.35, 18], [0.6, 22], [1.5, 22], [1.75, 6], [long, 0]]);
  const shiver = (t: number): number => (t > 0.6 && t < 1.5 ? Math.sin((t - 0.6) * Math.PI * 2 * 11) * Math.sin(((t - 0.6) / 0.9) * Math.PI) : 0);
  const keys = byCurves(long, 30, (t) => ({
    pz: R.pz + pz(t),
    pitch: R.pitch + pitch(t),
    bend: R.bend + bend(t),
    faceUp: R.faceUp + faceUp(t),
    ...wings(lift(t), { y: wy(t), z: 3 * shiver(t) }),
  }));
  return { keys };
}

/** STRUCK: her head whips back and her wings snap open, she is knocked back on her feet, her feathers bursting from her (her solids); then her head snaps forward again, low, to glare. */
function cqReel(): Motion {
  const R = CQ_REST;
  return {
    keys: [
      { at: 0, pose: {} },
      { at: 0.08, pose: { pitch: R.pitch - 16, bend: R.bend - 10, px: -14, pz: R.pz + 4, faceUp: R.faceUp + 40, faceTurn: R.faceTurn + 24, faceTilt: R.faceTilt - 16, lhz: R.lhz + 60, rhz: R.rhz + 60, lhy: R.lhy + 24, rhy: R.rhy - 24 }, ease: 'out' },
      { at: 0.22, pose: { pitch: R.pitch + 6, bend: R.bend + 4, px: -8, pz: R.pz + 1, faceUp: R.faceUp - 12, faceTurn: R.faceTurn + 4, lhz: R.lhz + 22, rhz: R.rhz + 22, lhy: R.lhy + 8, rhy: R.rhy - 8 }, ease: 'io' },
      { at: CQ_REEL_LONG, pose: {}, ease: 'io' },
    ],
  };
}
/** How long she is struck for (seconds). */
export const CQ_REEL_LONG = 0.45;

// ---------------------------------------------------------------------------------------------
// HER SOLIDS

/** The middle of her chest and its half-sizes (her solids, and the checks'). */
export const chestOf = (s: Skeleton): V3 => add(s.ribs, add(mul(s.chest[2], B.chest * 0.3), mul(s.chest[0], 4)));
export const CR: V3 = [B.ribDeep + 10, B.ribHalf + 10, B.chest * 0.8];

/**
 * A FEATHER, as a long flat panel: from `root` along `dir`, `len` long and `w` half-wide, its face across
 * `across`; its shaft a tone up, its vane a tone down at its edges, its tip worn ragged (by `seed`).
 */
function feather(put: Put, part: string, root: V3, dir: V3, across: V3, len: number, w0: number, ramp: Ramp, seed: number, shaft = true, floor = -Infinity): void {
  let d = norm(dir, [0, 0, -1]);
  // (her rouse: every feather shaken up and out a moment, each its own way)
  let w = w0;
  if (ROUSE > 0) {
    d = norm(add(d, mul([hash(seed, 1, 4101) - 0.5, hash(seed, 2, 4101) - 0.5, hash(seed, 3, 4101) - 0.2], 0.7 * ROUSE)), d);
    w = w0 * (1 + 0.3 * ROUSE);
  }
  // (one that would reach under the rock lies along it instead, its tip bent out over the floor: never through it)
  // (its edges as well as its middle: its tip kept a half-width above the rock)
  const lim = floor + w;
  if (floor > -Infinity && root[2] + d[2] * len < lim) {
    // (a feather already down on the rock lies flat along it)
    const dz = root[2] > lim ? Math.max(-1, (lim - root[2]) / len) : 0;
    const level: V3 = [d[0], d[1], 0];
    const h = Math.hypot(level[0], level[1]) > 1e-3 ? norm(level) : norm([across[0], across[1], 0], [1, 0, 0]);
    d = norm(add(mul(h, Math.sqrt(1 - dz * dz)), [0, 0, dz]));
  }
  const a0 = norm(sub(across, mul(d, dot(across, d))), [0, 1, 0]);
  const c = add(root, mul(d, len / 2));
  // (a feather lying flat, as when her wings are raised and spread, faces up into the light: never in its
  // sheen, as the feathers cloaking her back are not, so that her raised wings stay dark and never noble)
  const flat = Math.abs(cross(d, a0)[2]) > 0.55;
  put(part, part, {
    k: 'panel',
    c,
    u: mul(d, len / 2),
    v: mul(a0, w),
    skin: (a, b, _front, tone) => {
      const along = (a + len / 2) / len; // 0 at its root, 1 at its tip
      const half = w * (along > 0.8 ? 1 - (along - 0.8) * 3.2 : 1); // (its tip rounding off)
      if (Math.abs(b) > half) return null;
      // ragged: a notch out of its worn tip, by the feather
      if (along > 0.86 && hash(seed, Math.floor(b * 0.8 + 9), 3101) > 0.62) return null;
      const t = flat ? Math.min(tone, 2) : tone;
      if (shaft && Math.abs(b) < 0.7 && along < 0.9) return ramp[Math.min(flat ? 3 : 4, t + 1)]; // its shaft
      if (Math.abs(b) > half - 1.1) return ramp[Math.max(0, t - 1)]; // its edge
      return ramp[t];
    },
  });
}

/** Her moves' names, as the painter is told them (what is torn from her differs by move). */
const NAME_STAND = 'The Carrion Queen, mantled';
const NAME_HOP = 'The Carrion Queen hops';
const NAME_RAKE = 'The Carrion Queen rakes with her talons';
const NAME_REEL = 'The Carrion Queen is struck';
const NAME_GUST = 'The Carrion Queen beats her wings';
const NAME_DIVE = 'The Carrion Queen dives';
const NAME_CALL = 'The Carrion Queen calls';
const NAME_EDGE = 'The Carrion Queen topples off the edge';

/**
 * FEATHERS TORN FROM HER (what flies off her is her own: Hits 4): `n` from `origin`, from `t0`, thrown out along
 * `toward` and spread round it, turning as they go; quick at first, then the air takes them, and they fall (or,
 * `fall` below 0, are carried up). Each a feather as her own. Gone `life` seconds after `t0`.
 */
function featherSpray(put: Put, origin: V3, toward: V3, t: number, t0: number, n: number, seed: number, o: { speed: number; spread: number; life: number; fall: number; part: string }): void {
  const tau = t - t0;
  if (tau < 0 || tau >= o.life) return;
  const way = norm(toward, Z);
  const side = norm(cross(way, Z), [0, 1, 0]);
  const up = norm(cross(side, way), Z);
  for (let i = 0; i < n; i++) {
    const r = (k: number): number => hash(i, k, seed);
    const a = r(1) * Math.PI * 2;
    const off = o.spread * Math.sqrt(r(2));
    const dir = norm(add(way, add(mul(side, Math.cos(a) * off), mul(up, Math.sin(a) * off))), way);
    const v = o.speed * (0.6 + 0.8 * r(3));
    const go = (1 - Math.exp(-tau * 5)) / 5;
    const p = add(origin, add(mul(dir, v * go), [0, 0, -o.fall * tau * tau]));
    const spin = tau * (5 + r(4) * 7) + r(5) * 6;
    const d = norm([Math.cos(spin) * 0.8, Math.sin(spin) * 0.8, Math.sin(spin * 0.7) * 0.6], Z);
    feather(put, `${o.part}${i}`, [p[0], p[1], Math.max(p[2], 6.5)], d, norm(cross(d, Z), [1, 0, 0]), 18 + r(6) * 10, 4.2, i % 3 === 0 ? QUILLS : PLUMAGE, seed + i, false, 2);
  }
}

// ---------------------------------------------------------------------------------------------
// HER EFFECTS (Animations 3: her own way of being wild is feathers, grit and the cult's fire; Animations 5: her power
// shows in her crown and her mark; Animations 8: effects are crisp pixel art, each a mote of whole pixels)

/** The Ledge Road's dust and rock (floor 7's own colours), for what her blows kick off it. */
const DUST: Ramp = ['#4e4850', '#6d666a', '#8e867f', '#aca397', '#c4bcaf'];
const CHIP: Ramp = ['#3d3648', '#4f4962', '#6e6680', '#8c8494', '#a39ca8'];
/** The cult's fire, as a ramp: pink burning to gold. */
const FIRE: Ramp = [FLAME[1], FLAME[1], FLAME[2], FLAME[3], FLAME[4]];

/** DUST KICKED OFF THE ROCK: a ring of it from `c`, thrown out to `reach` and rising a little, thinning as it settles; gone `life` after `t0`. */
function dustRing(put: Put, c: V3, t: number, t0: number, life: number, n: number, reach: number, seed: number): void {
  const k = (t - t0) / life;
  if (k < 0 || k >= 1) return;
  const go = 1 - (1 - k) * (1 - k);
  for (let i = 0; i < n; i++) {
    if (hash(i, 7, seed) < k * 0.95) continue;
    const a = (i / n) * Math.PI * 2 + (hash(i, 1, seed) - 0.5) * 0.5;
    const r = reach * go * (0.5 + 0.5 * hash(i, 2, seed));
    const z = 3 + 26 * go * hash(i, 3, seed) * (1 - 0.6 * k);
    put('dust', 'dust', { k: 'mote', p: [c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r, z], c: i % 3 ? DUST[3] : DUST[2], size: hash(i, 4, seed) < 0.35 ? 4 : 2 });
  }
}

/** CHIPS OF THE ROCK: flung up from `c` at `t0`, falling, and lying where they land until `life` is out. */
function rockChips(put: Put, c: V3, t: number, t0: number, life: number, n: number, seed: number, speed: number, up: number): void {
  const s = t - t0;
  if (s < 0 || s >= life) return;
  for (let i = 0; i < n; i++) {
    const a = hash(i, 1, seed) * Math.PI * 2;
    const v = speed * (0.5 + hash(i, 2, seed));
    const sh = Math.min(s, 0.4);
    const z = Math.max(2, c[2] + up * (0.6 + 0.8 * hash(i, 3, seed)) * s - 420 * s * s);
    put('chips', 'chips', { k: 'mote', p: [c[0] + Math.cos(a) * v * sh, c[1] + Math.sin(a) * v * sh, z], c: CHIP[2 + (i % 3)], size: i % 4 === 0 ? 4 : 2 });
  }
}

/** BURNING STREAKS where the points of `m.trails` have just been (her talons raking, her body in the stoop): newest brightest. */
function streaks(put: Put, m: Moment, ramp: Ramp, glow: boolean): void {
  if (!m.trails) return;
  for (const tr of m.trails) {
    for (let i = 1; i < tr.length; i++) {
      const a = tr[i - 1];
      const b = tr[i];
      const n = Math.max(1, Math.ceil(Math.hypot(b[0] - a[0], b[1] - a[1], b[2] - a[2]) / 2));
      for (let j = 0; j < n; j++) {
        const p = lerp3(a, b, j / n);
        if (p[2] < 2) continue;
        put('streak', 'streak', { k: 'mote', p, c: i < tr.length / 3 ? ramp[4] : i < (tr.length * 2) / 3 ? ramp[3] : ramp[2], size: 2 });
      }
    }
    if (glow && tr[0][2] > 2) put('glow', 'glow', { k: 'glow', p: tr[0], c: FLAME[2], r: 12, a: 0.3 });
  }
}

/**
 * THE BLAST OF HER GUST: from `origin`, out along `way` (level), from `t0`: grit off the rock and streaks of driven air
 * in the rock's pale dust, and the cult's embers, flung out and slowing; gone `life` after.
 */
function blast(put: Put, origin: V3, way: V3, t: number, t0: number, life: number, seed: number): void {
  const k = (t - t0) / life;
  if (k < 0 || k >= 1) return;
  const w = norm([way[0], way[1], 0], [1, 0, 0]);
  const side: V3 = [-w[1], w[0], 0];
  const go = (1 - Math.exp(-k * 4)) / (1 - Math.exp(-4));
  // grit and embers
  for (let i = 0; i < 46; i++) {
    if (hash(i, 9, seed) < k * 0.9) continue;
    const reach = (70 + 210 * hash(i, 1, seed)) * go;
    const off = (hash(i, 2, seed) - 0.5) * (60 + 200 * go);
    const z = Math.max(3, origin[2] * (0.3 + 0.9 * hash(i, 3, seed)) - 40 * k + 10 * Math.sin(k * 7 + i));
    const p: V3 = [origin[0] + w[0] * reach + side[0] * off, origin[1] + w[1] * reach + side[1] * off, z];
    const ember = i % 5 === 0;
    put('blast', 'blast', { k: 'mote', p, c: ember ? (i % 10 === 0 ? FLAME[4] : FLAME[3]) : i % 2 ? DUST[3] : DUST[2], size: ember || hash(i, 4, seed) < 0.3 ? 4 : 2 });
    if (ember && i % 15 === 0) put('glow', 'glow', { k: 'glow', p, c: FLAME[2], r: 9, a: 0.3 * (1 - k) });
  }
  // the driven air: short streaks along `way`, racing out ahead of the grit
  for (let j = 0; j < 9; j++) {
    if (hash(j, 9, seed + 1) < k) continue;
    const reach = (50 + 230 * hash(j, 1, seed + 1)) * go + 30;
    const off = (hash(j, 2, seed + 1) - 0.5) * (80 + 220 * go);
    const z = 12 + origin[2] * hash(j, 3, seed + 1);
    const len = 30 * (1 - k) + 6;
    for (let q = 0; q < len; q += 2) {
      put('blast', 'blast', { k: 'mote', p: [origin[0] + w[0] * (reach - q) + side[0] * off, origin[1] + w[1] * (reach - q) + side[1] * off, z], c: DUST[4], size: 2 });
    }
  }
}

/** A RING OF THE CULT'S FIRE pulsing out over the rock from `c`, from `t0`: wider and thinner as it goes; gone `life` after. */
function fireRing(put: Put, c: V3, t: number, t0: number, life: number, reach: number, seed: number): void {
  const k = (t - t0) / life;
  if (k < 0 || k >= 1) return;
  const r = 30 + reach * (1 - (1 - k) * (1 - k));
  const n = Math.min(120, Math.ceil((Math.PI * 2 * r) / 6));
  for (let i = 0; i < n; i++) {
    if (hash(i, 5, seed) < k * 0.8) continue;
    const a = (i / n) * Math.PI * 2;
    const p: V3 = [c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r, 3];
    put('ring', 'ring', { k: 'mote', p, c: hash(i, 6, seed) < 0.25 ? FLAME[3] : FLAME[2], size: k < 0.4 ? 4 : 2 });
    if (i % Math.ceil(n / 6) === 0) put('glow', 'glow', { k: 'glow', p, c: FLAME[2], r: 16, a: 0.28 * (1 - k) });
  }
}

/** EMBERS OF HER CROWN: rising off its burning points and drifting, while it burns hot (`heat` 0 to 1). */
function crownEmbers(put: Put, root: V3, t: number, heat: number, seed: number): void {
  const n = Math.round(14 * heat);
  for (let i = 0; i < n; i++) {
    const ph = fr(t * (0.9 + 0.5 * hash(i, 1, seed)) + hash(i, 2, seed));
    const a = hash(i, 3, seed) * Math.PI * 2;
    const p: V3 = [root[0] + Math.cos(a) * (14 + 10 * ph), root[1] + Math.sin(a) * (14 + 10 * ph), root[2] + 30 + 70 * ph];
    put('embers', 'embers', { k: 'mote', p, c: ph < 0.5 ? FLAME[4] : FLAME[3], size: ph < 0.3 ? 4 : 2 });
  }
}

/** HOW HOT HER CROWN BURNS in a move, 0 to 1 (and her mark with it): flaring with each warning and her call; guttering out as she dies. */
function crownHeat(move: string | undefined, t: number): number {
  const up = (a: number, b: number): number => clamp01((t - a) / (b - a));
  if (move === NAME_CALL) return up(0.2, 0.45) * (1 - up(1.5, 1.8));
  if (move === NAME_GUST) return 0.75 * up(0.2, 0.4) * (1 - up(0.82, 0.95));
  if (move === NAME_RAKE) return 0.5 * up(0.3, 0.45) * (1 - up(0.9, 1.0));
  if (move === NAME_DIVE) return 0.5 * up(0.45, 0.6) * (1 - up(1.05, 1.15));
  if (move === NAME_EDGE) return 1 - up(0.15, 0.8);
  return 0;
}

/** HER ROUSE (standing): every feather shaken up and out a moment, as vultures do; 0 to 1. */
function rouseOf(move: string | undefined, t: number): number {
  if (move !== NAME_STAND) return 0;
  const k = (t - 1.85) / 0.45;
  return k > 0 && k < 1 ? Math.sin(Math.PI * k) : 0;
}
/** (the rouse of the moment being painted: read by every feather) */
let ROUSE = 0;

/** HER WING on one side, hung from the arm's bones: coverts over the arm, the secondaries down from the forearm, the primaries fanned from the wrist; `spread` 0 drooping (mantled) to 1 spread (to come). */
function wing(put: Put, s: Skeleton, side: 'L' | 'R', cf: V3, floor: number): void {
  const sh = side === 'L' ? s.shoulderL : s.shoulderR;
  const el = side === 'L' ? s.elbowL : s.elbowR;
  const wr = side === 'L' ? s.handL : s.handR;
  const sgn = side === 'L' ? 1 : -1;
  const part = side === 'L' ? 'wingL' : 'wingR';
  const out = norm(sub(wr, sh), [0, sgn, 0]);
  // HOW SPREAD: drooping (her mantle, 0) the feathers hang; raised (1) they trail back from the arm and out from
  // the wrist, as a wing beats and flies
  const spread = clamp01((wr[2] - sh[2]) / (ARM * 0.3) + 0.7);
  const back = norm(sub(mul(cf, -1), mul(out, dot(mul(cf, -1), out))), mul(cf, -1));
  const toward = (hang: V3, trail: V3): V3 => norm(add(mul(hang, 1 - spread), mul(trail, spread)));
  // (the way the feathers hang: down, drooping, a little back, as a mantle hangs; or trailing, spread)
  const hangDir = (k: number): V3 => toward(norm(add(add(mul(Z, -1), mul(cf, -0.12 - 0.22 * k)), mul(out, 0.12 * (1 - k)))), norm(add(back, mul(Z, -0.25))));
  const base = side === 'L' ? 3000 : 3100;
  // the primaries, from the wrist, the longest: the vulture's fingers, fanned wide and each one apart at its end
  for (let i = 0; i < 6; i++) {
    const k = i / 5;
    // (fanned like a hand's fingers, from out at the wing's tip to down, a gap between each two)
    const dir = toward(norm(add(add(mul(Z, -1), mul(cf, -0.16 * k)), mul(out, 1.3 - k * 1.15))), norm(add(add(mul(out, 1 - k * 0.75), mul(back, 0.15 + k * 0.85)), mul(Z, -0.2 + k * 0.1))));
    feather(put, part, add(wr, add(mul(out, 4 - k * 6), mul(cf, -k * 4))), dir, out, 112 - k * 12, 7.5, QUILLS, base + i, true, floor);
  }
  // the secondaries, down from the forearm, broad and overlapping, their ragged ends a saw along the wing's edge
  for (let i = 0; i < 7; i++) {
    const k = i / 6;
    const root = lerp3(wr, el, k);
    const dir = hangDir(k);
    feather(put, part, root, dir, out, 98 - k * 10 + (i % 2) * 8, 11, QUILLS, base + 20 + i, false, floor);
  }
  // the tertials, from the elbow in toward the body
  for (let i = 0; i < 4; i++) {
    const k = i / 3;
    const root = lerp3(el, sh, k * 0.65);
    const dir = norm(add(hangDir(1), mul(cf, -0.3)));
    feather(put, part, root, dir, out, 74 - k * 10, 10, PLUMAGE, base + 40 + i, false, floor);
  }
  // the leading edge over the bones: a thick feathered edge (rows of small round feathers), not a bare arm
  for (let i = 0; i <= 12; i++) {
    const k = i / 12;
    const p = k < 0.45 ? lerp3(sh, el, k / 0.45) : lerp3(el, wr, (k - 0.45) / 0.55);
    const r = (B.armR[0] * (1 - k) + B.armR[2] * k) * 0.8 + 1;
    put(part, part, { k: 'ball', c: add(p, mul(Z, -r * 0.3)), ax: [mul(cf, r), mul(out, r * 1.1), mul(Z, r * 1.15)], skin: plumed });
  }
  for (let row = 0; row < 2; row++) {
    for (let i = 0; i < 8; i++) {
      const k = i / 7;
      const root = add(lerp3(wr, sh, k * 0.9), mul(Z, 6 - row * 12));
      const dir = hangDir(k);
      feather(put, part, root, dir, out, 34 - row * 4, 8.5, PLUMAGE, base + 60 + row * 10 + i, false, floor);
    }
  }
}

/** Where the tips of her three forward talons are on one foot (for the streaks of her rake). */
function talonTips(s: Skeleton, side: 'L' | 'R'): V3[] {
  const ankle = side === 'L' ? s.ankleL : s.ankleR;
  const heel = side === 'L' ? s.heelL : s.heelR;
  const toe = side === 'L' ? s.toeL : s.toeR;
  const rA = B.legR[2];
  const fwd = norm(sub(toe, heel), [1, 0, 0]);
  const acr: V3 = norm([-fwd[1], fwd[0], 0], [0, 1, 0]);
  return ([[-0.55, 30], [0, 36], [0.55, 30]] as [number, number][]).map(([ang, len]) => {
    const dir = norm(add(mul(fwd, Math.cos(ang)), mul(acr, Math.sin(ang))));
    return add(ankle, add(mul(dir, len + 7), [0, 0, -rA * 0.4 - 2]));
  });
}

/** HER LEG on one side: the thigh lost in the feathers of her trousers, the bare scaled shank, the foot's great toes and talons; on her left the cult's shackle, its chain broken and dragging. */
function leg(put: Put, s: Skeleton, side: 'L' | 'R', cf: V3): void {
  const hip = side === 'L' ? s.hipL : s.hipR;
  const knee = side === 'L' ? s.kneeL : s.kneeR;
  const ankle = side === 'L' ? s.ankleL : s.ankleR;
  const heel = side === 'L' ? s.heelL : s.heelR;
  const toe = side === 'L' ? s.toeL : s.toeR;
  const part = side === 'L' ? 'legL' : 'legR';
  const [rH, rK, rA] = B.legR;
  // the trousers: shaggy feathers over the thigh, to below the knee
  const tc = lerp3(hip, knee, 0.62);
  const tu = norm(sub(hip, knee), Z);
  const tf = norm(sub(cf, mul(tu, dot(cf, tu))), [1, 0, 0]);
  put(part, part, { k: 'ball', c: tc, ax: [mul(tf, rH * 1.35), mul(cross(tu, tf), rH * 1.3), mul(tu, (Math.hypot(...sub(hip, knee)) / 2) * 1.25)], skin: plumed });
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2;
    const r = add(lerp3(hip, knee, 0.95), add(mul(tf, Math.cos(a) * rH * 0.9), mul(cross(tu, tf), Math.sin(a) * rH * 0.9)));
    feather(put, part, r, norm(add(mul(tu, -1), mul(tf, Math.cos(a) * 0.3))), cross(tu, tf), 18, 5, PLUMAGE, 3200 + i + (side === 'L' ? 0 : 10));
  }
  // the bare shank, scaled
  put(part, part, { k: 'rod', a: lerp3(knee, ankle, 0.15), b: ankle, ra: rK * 0.55, rb: rA * 0.62, ramp: SCALES });
  put(part, part, { k: 'ball', c: ankle, ax: sphere(rA * 0.75), skin: SCALES });
  // the foot: three great toes forward, spread, one back; each a black talon hooked down at its end
  const fwd = norm(sub(toe, heel), [1, 0, 0]);
  const acr: V3 = norm([-fwd[1], fwd[0], 0], [0, 1, 0]);
  const toes: [number, number][] = [[-0.55, 30], [0, 36], [0.55, 30], [Math.PI, 16]];
  toes.forEach(([ang, len]) => {
    const dir = norm(add(mul(fwd, Math.cos(ang)), mul(acr, Math.sin(ang))));
    const a = add(ankle, mul(Z, -rA * 0.4));
    // (her toes rest on the rock, their undersides on it, never sunk into it; each talon hooks down to touch it)
    const kn = add(a, add(mul(dir, len * 0.55), [0, 0, -rA * 0.15]));
    const end = add(kn, add(mul(dir, len * 0.45), [0, 0, -0.5]));
    put(part, part, { k: 'rod', a, b: kn, ra: rA * 0.42, rb: rA * 0.36, ramp: SCALES });
    put(part, part, { k: 'rod', a: kn, b: end, ra: rA * 0.36, rb: rA * 0.3, ramp: SCALES });
    put(part, part, { k: 'rod', a: end, b: add(end, add(mul(dir, 7), [0, 0, -1.6])), ra: rA * 0.32, rb: 0.6, ramp: TALON });
  });
  // the cult's shackle on her left leg, its chain broken, dragging on the floor
  if (side === 'L') {
    const su = norm(sub(knee, ankle), Z);
    const sf = norm(sub(cf, mul(su, dot(cf, su))), [1, 0, 0]);
    const rc = lerp3(ankle, knee, 0.22);
    put('shackle', 'shackle', { k: 'ball', c: rc, ax: [mul(sf, rK * 0.82), mul(cross(su, sf), rK * 0.82), mul(su, 3.4)], skin: IRON });
    // (the chain hangs from the shackle, swinging below her foot when she is in the air, and lies back along the rock
    // where it reaches it: never through the rock)
    const back = norm([-cf[0], -cf[1], 0], [-1, 0, 0]);
    const high = Math.max(0, rc[2] - 2.2);
    for (let i = 0; i < 9; i++) {
      const along = ((i + 1) / 9) * 46;
      const hang = Math.min(along, high);
      const lie = along - hang;
      put('shackle', 'shackle', { k: 'ball', c: add(rc, [back[0] * (hang * 0.3 + lie), back[1] * (hang * 0.3 + lie), -hang]), ax: sphere(2.1), skin: IRON });
    }
  }
}

/** Her bare head's half-sizes: big, a carrion eater's, lumpen (her solids, and the checks'). */
export const CQ_HEAD: V3 = [B.headR[0] * 1.55, B.headR[1] * 1.25, B.headR[2] * 1.15];

/** Where her head is: low, forward of the root of her neck (in her crown), turned as her face is. */
export const headOf = (s: Skeleton): V3 => {
  const f = s.face[0];
  const flat = norm([f[0], f[1], 0], [1, 0, 0]);
  return add(add(s.neck, mul(s.chest[0], 2)), add(mul(flat, 33), [0, 0, 4 + f[2] * 10]));
};

/**
 * Her plumage on a round solid: shaggy, never in tidy rings. Each small feather a long ragged point hanging down
 * her, of its own length and set at its own place; their tips dark; the violet sheen where the light lies on them.
 */
const plumed = (u: V3, tone: number): string => {
  // (the feathers in loose columns round her, each column's points at their own heights, so no ring runs round her)
  const around = (Math.atan2(u[1], u[0]) + Math.PI) * 5.5;
  const col = Math.floor(around);
  const cx = fr(around) - 0.5;
  const len = 0.28 + 0.2 * hash(col, 1, 3901);
  const fy = fr((u[2] + 1) / len + hash(col, 2, 3901) * 3);
  // a point: wide at its root, narrowing to its tip at the bottom of each feather
  const point = Math.abs(cx) < 0.5 * (1 - fy * 0.9);
  if (!point) return PLUMAGE[Math.max(0, tone - 2)];
  if (fy > 0.82) return PLUMAGE[Math.max(0, tone - 1)];
  return PLUMAGE[tone];
};

/** THE CARRION QUEEN AS SOLIDS. */
function cqBits(st: Stage, m: Moment, opts: { burst?: boolean } = {}): Bit[] {
  void st;
  const { s, q } = m;
  const bits: Bit[] = [];
  const put: Put = (part, piece, shape) => {
    bits.push({ part, piece, shape });
  };
  const [cf, cl, cu] = s.chest;
  const lit = 1 - clamp01(q.out);
  const frame = Math.floor(m.t * 8);
  // (the rock her feathers may not pass through: none in her deaths, where she goes over the edge into the drop)
  const floorZ = m.dying ? -Infinity : 2;
  // (her rouse, read by every feather; how hot her crown and mark burn in this moment)
  ROUSE = rouseOf(m.move, m.t);
  const heat = crownHeat(m.move, m.t);

  // --- HER LEGS ---
  leg(put, s, 'L', cf);
  leg(put, s, 'R', cf);

  // --- HER TAIL: a short fan of worn feathers down behind her ---
  const [hf, hl, hu] = s.hips;
  for (let i = 0; i < 7; i++) {
    const k = (i - 3) / 3;
    const root = add(s.pelvis, add(mul(hf, -B.pelvisDeep - 6), mul(hl, k * 10)));
    const dir = norm(add(add(mul(hf, -0.7), mul(hu, -0.75)), mul(hl, k * 0.3)));
    feather(put, 'tail', root, dir, hl, 46 - Math.abs(k) * 6, 7, QUILLS, 3300 + i, true, floorZ);
  }

  // --- HER BODY: the belly, the great chest, her back's mantle of feathers ---
  const chestC = chestOf(s);
  // (one great body, from her tail to the root of her neck: never two balls)
  const spineUp = norm(sub(add(chestC, mul(cu, CR[2] * 0.6)), s.pelvis), cu);
  const bodyF = norm(sub(cf, mul(spineUp, dot(cf, spineUp))), cf);
  const bodyL = norm(cross(spineUp, bodyF), cl);
  const bodyLen = Math.hypot(...sub(add(chestC, mul(cu, CR[2] * 0.6)), s.pelvis));
  put('body', 'body', { k: 'ball', c: lerp3(s.pelvis, add(chestC, mul(cu, CR[2] * 0.6)), 0.5), ax: [mul(bodyF, (CR[0] + 2) * (1 + 0.06 * ROUSE)), mul(bodyL, CR[1] * 0.84 * (1 + 0.08 * ROUSE)), mul(spineUp, bodyLen * 0.62)], skin: plumed });
  // the scapulars: long feathers from over each shoulder lying back down over the root of the wing, so the wing grows out of her back
  for (const side of [1, -1]) {
    const sh = side > 0 ? s.shoulderL : s.shoulderR;
    for (let i = 0; i < 5; i++) {
      const k = i / 4;
      const root = add(add(sh, mul(cl, -side * (4 + k * 10))), add(mul(cu, 6 - k * 4), mul(cf, -k * 6)));
      const dir = norm(add(add(mul(cf, -0.7), mul(Z, -1)), mul(cl, side * 0.25)));
      feather(put, 'body', root, dir, cl, 58 - k * 8, 9, PLUMAGE, 3700 + i + (side > 0 ? 0 : 10));
    }
  }
  // THE CULT'S MARK on her breast, burning: where a point of her chest is on it
  // (on her upper breast, under her crown, where it faces forward and up into the light whatever her hunch)
  const mn = norm(add(cf, mul(cu, 0.5)));
  const mup = norm(cross(cl, mn));
  const mc = add(chestC, mul(mn, Math.hypot(CR[0] * 0.89, CR[2] * 0.45) + 1.4));
  const MW = CR[1] * 0.56;
  const MH = CR[2] * 0.52;
  const markAt = (p: V3): string | null => {
    const d = sub(p, mc);
    const x = -dot(d, cl) / MW;
    const y = dot(d, mup) / MH;
    const mk = shriekAt(x, y);
    if (mk === 'dark') return PLUMAGE[0];
    if (mk !== 'bone') return null;
    if (lit < 0.3) return FLAME[0];
    const edge = shriekAt(x + 0.07, y) !== 'bone' || shriekAt(x - 0.07, y) !== 'bone' || shriekAt(x, y + 0.06) !== 'bone' || shriekAt(x, y - 0.06) !== 'bone';
    if (edge) return FLAME[2];
    return fr(y * 3 - frame * 0.25 + hash(Math.floor(x * 6), 1, 3401) * 0.5) < 0.3 ? FLAME[4] : FLAME[3];
  };
  // the cult's mark on her breast, burning
  const mr = mul(cl, -1);
  put('mark', 'mark', { k: 'panel', c: mc, u: mul(mr, MW), v: mul(mup, MH), skin: (a, b, front) => (front ? markAt(add(mc, add(mul(mr, a), mul(mup, b)))) : null) });
  put('glow', 'glow', { k: 'glow', p: add(mc, mul(mn, 8)), c: FLAME[2], r: 66 * (1 + 0.8 * heat), a: Math.min(0.75, (0.42 + 0.3 * heat) * lit) });

  // --- HER WINGS, mantled round her ---
  wing(put, s, 'L', cf, floorZ);
  wing(put, s, 'R', cf, floorZ);

  // --- HER CROWN: the ruff of bone-white feathers round the root of her neck, standing up and out like a crown ---
  const nr = add(s.neck, mul(cf, 2));
  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * Math.PI * 2;
    const radial = norm(add(mul(cf, Math.cos(a)), mul(cl, Math.sin(a))));
    const root = add(nr, mul(radial, 12));
    // (stiff and standing, a crown's points, the longest behind and at the sides, raked out and back)
    const dir = norm(add(mul(radial, 0.5), Z));
    const long = 40 + (i % 2) * 16 - Math.max(0, Math.cos(a)) * 14;
    feather(put, 'crown', root, dir, cross(dir, radial), long, 4.2, CROWN, 3500 + i);
    // (THE CROWN BURNING: each long point's tip alight with the cult's fire, pink burning to gold)
    // (each tongue of fire licking up off a point, flickering, never a round ball on a stick)
    if (i % 2 === 1) {
      const tip = add(root, mul(dir, long - 6));
      const lick = norm(add(add(dir, mul(Z, 1.2)), mul(radial, 0.25 * Math.sin(m.t * 9 + i))));
      // (it flares with her warnings and her call, and gutters out as she dies)
      const fl = (13 + 4 * Math.sin(m.t * 13 + i * 2.1)) * (1 + 1.4 * heat) * lit;
      if (fl > 2) put('crown', 'crown', { k: 'rod', a: tip, b: add(tip, mul(lick, fl)), ra: 3.4 * Math.min(1, 0.4 + lit), rb: 0.5, ramp: FIRE });
      if (lit > 0.3) put('glow', 'glow', { k: 'glow', p: add(tip, mul(lick, 5)), c: FLAME[2], r: 16 * (1 + 0.6 * heat), a: 0.4 * lit });
    }
  }
  put('crown', 'crown', { k: 'ball', c: add(nr, mul(cu, 2)), ax: [mul(cf, 15), mul(cl, 15), mul(cu, 8)], skin: (u, tone) => (fr((u[0] + 3) * 4 + (u[1] + 3) * 3) < 0.2 ? CROWN[Math.max(0, tone - 1)] : CROWN[tone]) });

  // --- HER BARE NECK, sunk and curving forward out of the crown, wrinkled; HER HEAD, small and bare; HER HOOKED BEAK; her eyes the cult's fire ---
  const [ff, fl, fu] = s.face;
  const hr: V3 = CQ_HEAD;
  // (sunk: her head carried low, forward of her crown, on the curve of her bare neck; turned as her face is)
  const head = headOf(s);
  const mid = add(lerp3(nr, head, 0.5), mul(Z, 9));
  // raw skin, wrinkled in folds and lumped with warts, a carrion eater's
  const wrinkled = (u: V3, tone: number): string => {
    const wart = hash(Math.floor((u[0] + 2) * 7), Math.floor((u[1] + 2) * 7) + Math.floor((u[2] + 2) * 7) * 40, 3903) > 0.88;
    if (wart) return BARE[Math.min(4, tone + 1)];
    return fr((u[2] + 1) * 7 + u[0] * 2 + 0.3 * Math.sin(u[1] * 9)) < 0.2 ? BARE[Math.max(0, tone - 1)] : BARE[tone];
  };
  put('neck', 'neck', { k: 'rod', a: add(nr, mul(cu, 4)), b: mid, ra: 9, rb: 7.4, ramp: BARE });
  put('neck', 'neck', { k: 'rod', a: mid, b: head, ra: 7.4, rb: 6.6, ramp: BARE });
  // (the bare neck's wattles: loose folds of skin hanging under it)
  for (let i = 0; i < 3; i++) put('neck', 'neck', { k: 'ball', c: add(lerp3(mid, head, 0.2 + i * 0.25), mul(Z, -6)), ax: sphere(4.2 - i * 0.6), skin: wrinkled });
  put('head', 'head', { k: 'ball', c: head, ax: [mul(ff, hr[0]), mul(fl, hr[1]), mul(fu, hr[2])], skin: wrinkled });
  // her brow, a heavy ridge over the eye (a scowl, never a noble look)
  put('head', 'head', { k: 'ball', c: at3(head, s.face, hr[0] * 0.25, 0, hr[2] * 0.62), ax: [mul(ff, hr[0] * 0.7), mul(fl, hr[1] * 1.02), mul(fu, hr[2] * 0.32)], skin: BARE });
  // her beak: deep at its root, hooked down hard at its tip, the tip dark
  // (the beak sized from a smaller head than hers, so that her raw head, not her beak, is what you see)
  const bk: V3 = [B.headR[0] * 1.3, B.headR[1] * 1.05, B.headR[2] * 0.95];
  const b0 = at3(head, s.face, hr[0] * 0.7, 0, 0);
  const b1 = at3(head, s.face, hr[0] + bk[0] * 0.62, 0, bk[2] * 0.05);
  const b2 = at3(head, s.face, hr[0] + bk[0] * 0.98, 0, -bk[2] * 0.85);
  put('beak', 'beak', { k: 'rod', a: b0, b: b1, ra: bk[2] * 0.66, rb: bk[2] * 0.52, ramp: BEAK });
  put('beak', 'beak', { k: 'ball', c: b1, ax: [mul(ff, bk[2] * 0.5), mul(fl, bk[2] * 0.45), mul(fu, bk[2] * 0.55)], skin: BEAK });
  put('beak', 'beak', { k: 'rod', a: add(b1, mul(ff, bk[2] * 0.3)), b: b2, ra: bk[2] * 0.42, rb: 1, ramp: TALON });
  // the lower beak under it, and the dark gape between
  put('beak', 'beak', { k: 'rod', a: at3(head, s.face, hr[0] * 0.75, 0, -bk[2] * 0.5), b: at3(head, s.face, hr[0] + bk[0] * 0.5, 0, -bk[2] * 0.5), ra: bk[2] * 0.3, rb: bk[2] * 0.22, ramp: BEAK });
  // her eyes, burning
  for (const sgn of [1, -1]) {
    const e = at3(head, s.face, hr[0] * 0.5, sgn * hr[1] * 0.78, hr[2] * 0.3);
    put('head', 'eye', { k: 'dot', p: e, c: lit > 0.3 ? FLAME[3] : BARE[1], facing: add(mul(fl, sgn), mul(ff, 0.6)), c2: lit > 0.3 ? FLAME[2] : undefined });
    if (lit > 0.3) put('glow', 'glow', { k: 'glow', p: e, c: FLAME[2], r: 16, a: 0.6 * lit });
  }
  if (opts.burst && m.dying) cqBurst(put, s, m.t);
  // WHAT IS TORN FROM HER (Hits 4; Animations 1): struck, her feathers burst from her breast; her gust's beat throws
  // feathers off her wingtips, forward on the wind she makes; going over the edge, her feathers burst from her and
  // swirl up after her as she falls (her brief's own words for that death)
  if (m.move === NAME_REEL) featherSpray(put, chestOf(s), add(mul(cf, 0.7), [0, 0, 0.7]), m.t, 0, 10, 3950, { speed: 420, spread: 0.9, life: 0.4, fall: 160, part: 'torn' });
  if (m.move === NAME_GUST && m.since !== undefined) {
    for (const [hand, seed] of [[s.handL, 3970], [s.handR, 3990]] as const) featherSpray(put, hand, add(cf, [0, 0, -0.2]), m.t, CQ_GUST.hit, 7, seed, { speed: 520, spread: 0.6, life: CQ_GUST.long - CQ_GUST.hit, fall: 60, part: `blown${seed}` });
  }
  if (m.move === NAME_EDGE) featherSpray(put, chestOf(s), Z, m.t, CQ_DIE_OVER, 16, 4010, { speed: 300, spread: 1.3, life: CQ_DIE_LONG - CQ_DIE_OVER, fall: -24, part: 'swirl' });
  // WHAT HER OTHER MOVES THROW OFF (her own way of being wild: grit, feathers and the cult's fire)
  const between: V3 = [(s.toeL[0] + s.toeR[0]) / 2, (s.toeL[1] + s.toeR[1]) / 2, 0];
  if (heat > 0.15) crownEmbers(put, nr, m.t, heat, 4201);
  if (m.move === NAME_HOP) dustRing(put, between, m.t, CQ_WALK.land, 0.3, 24, 80, 4301);
  if (m.move === NAME_RAKE) {
    streaks(put, m, FIRE, true);
    const spot: V3 = [CQ_RAKE.landX, 0, 0];
    dustRing(put, spot, m.t, CQ_RAKE.land, 0.5, 30, 100, 4311);
    rockChips(put, spot, m.t, CQ_RAKE.land, 0.6, 14, 4313, 160, 150);
  }
  if (m.move === NAME_GUST) {
    blast(put, add(chestOf(s), mul(cf, 40)), cf, m.t, CQ_GUST.hit, CQ_GUST.long - CQ_GUST.hit, 4321);
    dustRing(put, between, m.t, CQ_GUST.hit, 0.55, 30, 130, 4323);
  }
  if (m.move === NAME_DIVE) {
    // (the downdraft as she launches; the speed-streak of her stoop; the crater where her talons strike, after the freeze)
    dustRing(put, [0, 0, 0], m.t, CQ_DIVE.launch, 0.5, 30, 140, 4331);
    streaks(put, m, [QUILLS[2], QUILLS[2], QUILLS[3], QUILLS[4], PLUMAGE[4]], false);
    const strike: V3 = [CQ_DIVE.strikeX, 0, 0];
    dustRing(put, strike, m.t, CQ_DIVE.hit + CQ_DIVE.freeze, 0.6, 36, 160, 4333);
    rockChips(put, strike, m.t, CQ_DIVE.hit + CQ_DIVE.freeze, 0.9, 24, 4335, 220, 190);
  }
  if (m.move === NAME_CALL) for (const at of CQ_CALL.rings) fireRing(put, between, m.t, at, 0.6, 230, 4341 + Math.round(at * 10));
  return bits;
}

// ---------------------------------------------------------------------------------------------
// THE CARRION QUEEN AS A MONSTER OF THE BONES (her stand, her hop, her talon rake, her flinch, her wing gust, her
// dive and her call; her death is his pick: she topples off the edge)

function cqMove(name: string, motion: Motion): MobMove {
  return { name, motion, rest: CQ_REST };
}

// ---------------------------------------------------------------------------------------------
// HER DEATHS: three, for him to pick (her brief, “All these are great.  I think I want to see them all”). Each is
// a variant of her with her own dying move (`dieTime` seconds). Nothing of them is in the game yet.

/** How long each of her deaths is (seconds). */
export const CQ_DIE_LONG = 2.0;
/** When the feathers burst from her, in her death (seconds). */
const BURST_AT = 0.6;
const BURST_N = 34;

/**
 * THE BURST (her feathers, a storm of them, as the cult's mark flares and she bursts): from `BURST_AT`, feathers
 * fly out of her breast all round, turning as they go, slowing and falling, and lie on the floor where they land
 * (each one solid, the same panels as her own).
 */
function cqBurst(put: Put, s: Skeleton, t: number): void {
  const tau = t - BURST_AT;
  if (tau < 0) return;
  const c0 = chestOf(s);
  for (let i = 0; i < BURST_N; i++) {
    const r = (k: number): number => fr(Math.sin((i + 1) * 12.9898 + k * 78.233) * 43758.5453);
    const a = r(1) * Math.PI * 2;
    const up = 0.25 + r(2) * 0.75;
    const out = Math.sqrt(1 - up * up);
    const dir: V3 = [out * Math.cos(a), out * Math.sin(a), up];
    const v = 90 + r(3) * 110;
    const tt = Math.min(tau, 1.4);
    const root = add(c0, add(mul(dir, v * tt), [0, 0, (-260 * tt * tt) / 2]));
    const spin = tau * (4 + r(4) * 6);
    const d = norm(add(mul(dir, 0.6), [Math.cos(a + spin) * 0.7, Math.sin(a + spin) * 0.7, -0.2]), [0, 0, 1]);
    const across = norm(cross(d, Z), [1, 0, 0]);
    const lying: V3 = [root[0], root[1], Math.max(root[2], 2)];
    feather(put, `burst${i}`, lying, d, across, 24 + r(5) * 9, 4.6, i % 3 === 0 ? QUILLS : PLUMAGE, 3800 + i);
  }
}

/** When she goes over the edge, in her death (seconds): her feathers burst from her and swirl up after her from then. */
export const CQ_DIE_OVER = 0.85;
/**
 * HER DEATH, HIS PICK (“Topples off the edge (Recommended)”): struck, she screams, her head thrown back and her wings
 * flung up (to 0.15 s); she staggers back two steps, each foot lifted and set down behind her (0.15 to 0.5 s); she
 * claws at the rock, her feet scrabbling, each lifted and set down again where it was (to `CQ_DIE_OVER`); then she
 * topples backward off the edge, her wings flailing, into the drop. Her mark flares and gutters out and her crown's fire
 * goes out with her (`out`; `crownHeat`); her feathers burst from her and swirl up after her as she goes over.
 */
function cqDieEdge(): Motion {
  const R = CQ_REST;
  const c = (pts: Track): ((t: number) => number) => curve(pts);
  const L = CQ_DIE_LONG;
  const O = CQ_DIE_OVER;
  const pitch = c([[0, 0], [0.12, -24], [0.35, -20], [0.55, -26], [O, -34], [1.2, -88], [1.6, -110], [L, -116]]);
  const px = c([[0, 0], [0.12, -4], [0.35, -16], [0.55, -30], [O, -34], [1.2, -62], [1.6, -86], [L, -100]]);
  const pz = c([[0, 0], [0.12, 2], [0.55, 0], [O, -4], [1.2, -32], [1.6, -70], [L, -105]]);
  const roll = c([[0, 0], [0.55, 4], [O, -4], [1.4, 10], [L, 2]]);
  const bend = c([[0, 0], [0.12, -8], [O, -10], [1.4, -26], [L, -34]]);
  const faceUp = c([[0, 0], [0.1, 40], [0.3, 30], [O, 24], [1.2, 36], [L, 42]]);
  const lift = c([[0, 0], [0.12, 1.5], [0.4, 0.8], [0.62, 1.3], [O, 0.7], [1.15, 1.55], [1.45, 0.6], [1.75, 1.0], [L, 0.5]]);
  const wx = c([[0, 0], [0.12, -8], [O, -10], [L, -16]]);
  const out = c([[0, 0], [0.15, 0], [0.8, 0.55], [1.3, 1], [L, 1]]);
  // her feet: the left lifted and set down a step back (0.15 to 0.32), then the right (0.32 to 0.5); each scrabbling,
  // lifted and set down where it was; then off the rock as she goes over
  const lfx = c([[0, 0], [0.15, 0], [0.32, -24], [O, -24], [L, -40]]);
  const lfz = c([[0, 0], [0.15, 0], [0.24, 14], [0.32, 0], [0.58, 0], [0.64, 9], [0.7, 0], [O, 0], [1.1, 30], [L, 40]]);
  const rfx = c([[0, 0], [0.32, 0], [0.5, -24], [O, -24], [L, -36]]);
  const rfz = c([[0, 0], [0.32, 0], [0.41, 14], [0.5, 0], [0.66, 0], [0.72, 9], [0.78, 0], [O, 0], [1.1, 26], [L, 36]]);
  return {
    keys: byCurves(L, 30, (t) => ({
      px: px(t), pz: R.pz + pz(t), pitch: R.pitch + pitch(t), roll: roll(t), bend: R.bend + bend(t), faceUp: R.faceUp + faceUp(t), out: out(t),
      ...wings(lift(t), { x: wx(t) }),
      lfx: R.lfx + lfx(t), lfz: lfz(t), rfx: R.rfx + rfx(t), rfz: rfz(t),
    })),
  };
}
function cqDieLedge(): Motion {
  const R = CQ_REST;
  const c = (pts: Track): ((t: number) => number) => curve(pts);
  const L = CQ_DIE_LONG;
  // the eyrie's rock gives way under her: one foot slips off the edge, she lurches and rocks, and goes down with it
  const pz = c([[0, 0], [0.3, -3], [0.55, -8], [0.8, -22], [1.2, -50], [L, -96]]);
  const px = c([[0, 0], [0.4, 0], [0.7, -6], [1.0, -14], [1.5, -22], [L, -26]]);
  const pitch = c([[0, 0], [0.35, 0], [0.55, -10], [0.8, -22], [1.2, -42], [L, -64]]);
  const roll = c([[0, 0], [0.35, 4], [0.6, 8], [0.9, 3], [1.25, 14], [1.6, -10], [L, 20]]);
  const bend = c([[0, 0], [0.3, -2], [0.8, 4], [L, 14]]);
  const faceUp = c([[0, 0], [0.12, 8], [0.5, 14], [1.0, 20], [L, 26]]);
  const lift = c([[0, 0], [0.25, 0.6], [0.55, 1.1], [0.85, 0.9], [1.2, 0.45], [1.6, 0], [L, -0.2]]);
  const wx = c([[0, 0], [0.5, -6], [1.0, -10], [L, -14]]);
  // (her right foot lifts off the rock as it sinks, and scrabbles at the air)
  const rfz = c([[0, 0], [0.3, 0], [0.45, 4], [0.7, 8], [L, 20]]);
  // (her foot held where it is as her body leans, until it lifts; then it scrabbles at the air)
  const rfx = c([[0, 0], [0.4, 0], [0.6, -6], [0.8, 4], [1.2, -8], [1.6, 6], [L, -2]]);
  const lfz = c([[0, 0], [1.0, 0], [1.3, 12], [L, 24]]);
  return {
    keys: byCurves(L, 30, (t) => ({
      px: px(t), pz: R.pz + pz(t), pitch: R.pitch + pitch(t), roll: roll(t), bend: R.bend + bend(t), faceUp: R.faceUp + faceUp(t),
      ...wings(lift(t), { x: wx(t) }),
      lfz: lfz(t), rfz: rfz(t), rfx: R.rfx + rfx(t),
    })),
  };
}
function cqDieFeathers(): Motion {
  const R = CQ_REST;
  const c = (pts: Track): ((t: number) => number) => curve(pts);
  const L = CQ_DIE_LONG;
  // struck, she shudders and her chest heaves; the cult's mark flares; she bursts (the feathers, `cqBurst`) and
  // sinks to her knees, her wings collapsing down round her, and lies there hunched
  const pitch = c([[0, 0], [0.15, -8], [0.3, -4], [0.5, 6], [0.6, 12], [0.75, 14], [1.0, 20], [L, 22]]);
  const pz = c([[0, 0], [0.4, 2], [0.6, -6], [1.0, -18], [L, -22]]);
  const bend = c([[0, 0], [0.5, 4], [0.6, 14], [1.0, 22], [L, 24]]);
  const faceUp = c([[0, 0], [0.15, 14], [0.4, 18], [0.6, 6], [1.0, -8], [L, -10]]);
  const lift = c([[0, 0], [0.2, 1.3], [0.4, 1.5], [0.55, 1.4], [0.65, -0.3], [1.0, -0.8], [L, -0.9]]);
  return {
    keys: byCurves(L, 30, (t) => ({
      pz: R.pz + pz(t), pitch: R.pitch + pitch(t), bend: R.bend + bend(t), faceUp: R.faceUp + faceUp(t),
      ...wings(lift(t)),
    })),
  };
}

/** HER MOB, with the death it is given (her one picked death goes in `dying`; the other two are variants of her). */
function queenAs(dying: MobMove, dieTime: number, burst: boolean): Mob {
  return queenBody(dying, dieTime, burst);
}
export const CQ_DEATHS = {
  edge: queenAs(cqMove(NAME_EDGE, cqDieEdge()), CQ_DIE_LONG, false),
  ledge: queenAs(cqMove('The Carrion Queen goes down with the ledge', cqDieLedge()), CQ_DIE_LONG, false),
  feathers: queenAs(cqMove('The Carrion Queen bursts into feathers', cqDieFeathers()), CQ_DIE_LONG, true),
};

function queenBody(dying: MobMove, dieTime: number, burst: boolean): Mob {
  const stand = cqMove(NAME_STAND, cqStand());
  const walk: MobMove = { ...cqMove(NAME_HOP, cqWalk()), period: CQ_WALK.frames / CQ_WALK.fps, ground: CQ_PACE * TILE3 };
  // (her rake leaves three burning streaks where her right foot's talons go through the air)
  const attack: MobMove = { ...cqMove(NAME_RAKE, cqRake()), trail: (sk) => talonTips(sk, 'R'), trailOver: (t) => t > CQ_RAKE.hit - 0.16 && t <= CQ_RAKE.hit + 0.1, trailSpan: 4 };
  return {
    id: 'carrion-queen',
    name: 'The Carrion Queen',
    size: 'a boss: perched, about the Unfinished; her wings wider than the trail',
    build: B,
    stand,
    attack,
    idleFrames: 26,
    idleFps: 10,
    walk,
    walkFrames: CQ_WALK.frames,
    walkFps: CQ_WALK.fps,
    pace: CQ_PACE,
    reel: cqMove(NAME_REEL, cqReel()),
    more: {
      gust: cqMove(NAME_GUST, cqGust()),
      // (her stoop leaves a streak behind her head and her wrists)
      dive: { ...cqMove(NAME_DIVE, cqDive()), trail: (sk) => [sk.head, sk.handL, sk.handR], trailOver: (t) => t > CQ_DIVE.stoop + 0.05 && t <= CQ_DIVE.hit, trailSpan: 5 },
      call: cqMove(NAME_CALL, cqCall()),
    },
    reelTime: CQ_REEL_LONG,
    hit: CQ_RAKE.hit,
    warn: CQ_RAKE.warn,
    dieTime,
    dying,
    aura: { x: CQ_CANVAS.ax, y: CQ_CANVAS.ay - 120, r: 150, color: '#ff3a78', a: 0.16 },
    shadow: 80,
    canvas: CQ_CANVAS,
    bits: (st, m) => cqBits(st, m, { burst }),
  };
}
/** HER MOB, as she is for the game: her death is his pick (14 Oct: "Topples off the edge (Recommended)"), she topples backward off the edge. */
export const CARRION_QUEEN: Mob = queenAs(cqMove(NAME_EDGE, cqDieEdge()), CQ_DIE_LONG, false);

/** One picture of her in a move, `t` seconds in, as the game holds a figure. */
export function queenFrame(move: string, t: number, view: GameView = 'front'): Sprite {
  const can = canvasOf(CARRION_QUEEN);
  return toSprite(paintMob(CARRION_QUEEN, move, t, view, ENEMY_RIM), null, can.ax, can.ay);
}

/** One picture of her standing, `t` seconds into her breath, as the game holds a figure. */
export function queenStanding(t: number, view: GameView = 'front'): Sprite {
  const can = canvasOf(CARRION_QUEEN);
  return toSprite(paintMob(CARRION_QUEEN, 'stand', t, view, ENEMY_RIM), null, can.ax, can.ay);
}
/** The same, or in a move, as painted (for the checks). */
export function queenPainted(t: number, view: GameView = 'front', move = 'stand'): Painted {
  return paintMob(CARRION_QUEEN, move, t, view, ENEMY_RIM);
}
