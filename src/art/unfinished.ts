// FLOOR 6'S BOSS, THE UNFINISHED: a mock-up (nothing of the game imports this file; `UNFINISHED_ON` is off).
//
// The planning chat's, with his yes (12 Oct, 18:07, "All the main ones rock.  I like them all"): a stone
// colossus the cult half-carved out of the quarry wall and woke with its chanting; fused to the wall at
// first, it tears itself free at half life; a fist slam, a rockslide, a hurled block that stays as cover,
// a stomp that cracks the terrace. His brief, asked as the art rulebook's questions for a new character
// (13 Oct, by 12:42): how big, "Twice the Warden (Recommended)" (a towering colossus, its head near the top
// of the quarry's cliff); the one thing to know it by, his own words, "One and two": HALF CARVED, HALF RAW
// ROCK (one side a finished, polished statue, the other still rough quarry stone with chisel marks and
// drill holes) AND THE CULT'S MARK BURNING (the shrieking skull cut into its chest, burning pink where the
// chanting woke it); how it moves, "Grinding and heavy (Recommended)" (a statue forced to walk, slow to
// start, every step a shudder, grit falling off it); how it dies, "Topples and shatters" (it falls like a
// felled statue and breaks into great blocks on the floor).
//
// THIS FILE, SO FAR: how it looks, standing (his order: "show you it standing before I animate anything").
// It is built as every boss is, on the heroes' bones (art/skeleton.ts) and dressed in the heroes' solids
// (art/skin.ts, through art/new_mobs3.ts's painter), lit from the upper left, the indigo seam, the enemy's
// pink edge round it. Its RIGHT side is the finished statue (smooth, pale, polished to a shine where the
// light falls full on it, its features carved: half a face with one eye, the brow, the nose, half a mouth;
// a shaped shoulder, a carved fist with its fingers and knuckles; a shaped knee and foot); its LEFT side
// is the raw stone it was coming out of (blocky, greyer, faceted where the point and the claw chisel
// roughed it, pocked, scored, rows of drill holes; a great boulder of a fist). Down its middle, where the
// carvers stopped, a groove and a line of drill holes. On its chest, across that line, the cult's mark
// cut deep and burning. Grit trickles off its raw side. Fused to the wall (phase one) a mass of the cliff's
// own rock still holds its back and its raw side.
//
// The colours are a figure's (three tones and the polish), so it stands out from the quarry, which is
// duller than every word; what glows on it is the cult's fire only (FLAME), and nothing on it is cyan.

import { Px } from '../engine/px';
import type { Sprite } from '../engine/px';
import { between, feetFor, plantBy, smooth01 } from './act1_feet';
import { HOLE, RAW, block, limbFrame, rawFace } from './act1_stone';
import type { FaceSkin } from './act1_stone';
import type { Plant } from './act1_feet';
import { shriekAt } from './floor5';
import { hash, toSprite } from './kit';
import type { Painted, Ramp } from './kit';
import { ENEMY_RIM, FLAME } from './mkit';
import { TILE3, at3, canvasOf, deathOfMob, paintBits, paintMob, sphere } from './new_mobs3';
import type { Bit, Fall, Mob, MobCanvas, MobMove, Moment, Put } from './new_mobs3';
import { stage, wornOn } from './skin';
import type { GameView, Stage } from './skin';
import { add, buildOf, cross, dot, lerp3, mul, norm, solve, standing, sub } from './skeleton';
import type { Bones, Build, Key3, Motion, Posed, Skeleton, V3 } from './skeleton';

/** THE SWITCH, OFF: nothing of the game reads this file. */
export const UNFINISHED_ON = { on: false };

const clamp01 = (v: number): number => Math.max(0, Math.min(1, v));
const fr = (t: number): number => t - Math.floor(t);
type P = Partial<Bones>;
/** A skin that is a painter (not a ramp). */
type SkinFn = (u: V3, tone: number, x: number, y: number) => string | null;

// ---------------------------------------------------------------------------------------------
// ITS BODY: twice the Warden (the Warden-sized bosses are built about 110 tall: the Headsman 112, the
// amalgamation 110); a statue's: shoulders broad as a gate, a deep chest, short heavy legs, long arms,
// limbs as thick as pillars, a head small for its bulk.

export const UF_TALL = 236;
export const UF_BODY: Build = buildOf(UF_TALL, 0.95, { shoulders: 1.55, chest: 1.45, depth: 1.3, waist: 1.2, hips: 1.25, legs: 0.84, arms: 1.24, trunk: 1.04, limbs: 2.0, pad: 5 });
const B = UF_BODY;

/** The middle of its chest, and the chest's half-sizes (its solids, and the checks'). */
export const chestOf = (s: Skeleton): V3 => add(s.ribs, add(mul(s.chest[2], B.chest * 0.44), mul(s.chest[0], 1.0)));
export const CR: V3 = [B.ribDeep + 3, B.ribHalf + 8, B.chest * 0.66];

/** Its canvas: room for it standing, a fist or a block raised over its head, the rock of the wall behind it, and it lying where it fell. */
export const UF_CANVAS: MobCanvas = { w: 600, h: 560, ax: 260, ay: 396 };

// ---------------------------------------------------------------------------------------------
// ITS STONE

/** The finished statue: the quarry's limestone dressed and rubbed smooth, a shine where the light falls full (a figure's ramp: three tones and the polish). */
export const POLISHED: Ramp = ['#4b4357', '#4b4357', '#a2978b', '#d3c8b7', '#ebe3d4'];
/** The quarry's wall as it is round the fused colossus (art/quarry.ts Q_WALL's middle row): its shade to its lit face. */
const WALL: Ramp = ['#5e5458', '#76696a', '#a29587', '#c9bdb0', '#c9bdb0'];
/** The cult's mark cut into it: the dark of the cut, where the fire is not. */
const CUT_DARK = '#2a0f22';

/** THE POLISHED SKIN, with whatever is carved in it (`carve`: a tone up or down, or a colour of its own, at u). */
function polishedSkin(carve?: (u: V3, tone: number) => number | string | null): SkinFn {
  return (u, tone) => {
    const c = carve ? carve(u, tone) : null;
    if (typeof c === 'string') return c;
    let t = tone + (typeof c === 'number' ? c : 0);
    // (the grain of the stone, faint, in the dressed face: it moves with the solid)
    if (t >= 2 && t <= 3 && hash(Math.floor((u[0] + 1) * 11), Math.floor((u[1] + 1) * 11) * 37 + Math.floor((u[2] + 1) * 11), 91) > 0.93) t -= 1;
    return POLISHED[Math.max(0, Math.min(4, t))];
  };
}
/** The raw stone on a round solid (a lump): flat facets a tone up or down, the claw's scored lines, the point's pocks. */
function rawSkin(seed: number): SkinFn {
  return (u, tone) => {
    const k = hash(Math.floor((u[0] + 1) * 2.2) * 7 + Math.floor((u[1] + 1) * 2.2), Math.floor((u[2] + 1) * 2.6), seed);
    let t = tone + (k > 0.72 ? 1 : k < 0.22 ? -1 : 0);
    if (fr((u[2] * 3.2 + u[1] * 1.6 + u[0] * 1.1) * 2.4 + seed * 0.13) < 0.1) t -= 1;
    if (hash(Math.floor((u[0] + 1) * 9), Math.floor((u[1] + 1) * 9) * 31 + Math.floor((u[2] + 1) * 9), seed + 1) > 0.94) t = Math.min(t, 1);
    return RAW[Math.max(0, Math.min(4, t))];
  };
}

// ---------------------------------------------------------------------------------------------
// ITS FEET ON THE FLOOR: a foot put down stays where it is until it lifts (art/act1_feet.ts).

const { footOn, plantOf, footwork } = feetFor(B);

// ---------------------------------------------------------------------------------------------
// HOW IT STANDS: a statue forced to stand: its feet planted wide, its knees a little bent under the
// weight, its back bowed, its head pushed forward, its arms hanging, its fists by its knees.

const HANG = -(B.upperArm + B.foreArm) * 0.95;
export const UF_REST: Bones = {
  ...standing(B),
  pz: -7, px: 0, yaw: 0, pitch: 6, roll: 0, twist: 0, bend: 12, side: 0,
  faceTurn: -18, faceUp: 4, faceTilt: 0,
  lfx: 3, lfy: 9, lft: 12, lk: 14, rfx: -2, rfy: -9, rft: -10, rk: -14,
  lhIn: 0, lhx: 12, lhy: 12, lhz: HANG * 0.92, le: -24,
  rhIn: 0, rhx: 12, rhy: -12, rhz: HANG * 0.92, re: 24,
};

/** ITS BREATH, such as a statue has: the stone heaves slowly up and settles, grinding; a shudder runs through it, and the grit falls. 2.4 s round. */
function ufStand(): Motion {
  const R = UF_REST;
  return {
    loop: 0,
    keys: [
      { at: 0, pose: {} },
      // (its weight grinding over onto its raw left leg as the stone heaves up)
      { at: 1.0, pose: { pz: R.pz + 1.6, bend: R.bend - 2, pitch: R.pitch - 1, faceUp: R.faceUp + 2, py: 2.6, roll: -0.8 }, ease: 'io' },
      // (the shudder: the weight drops back into it, and it settles, grinding)
      { at: 1.25, pose: { pz: R.pz + 0.6, bend: R.bend - 1, faceUp: R.faceUp + 1, roll: 0.4, py: 2.4 }, ease: 'in' },
      { at: 1.4, pose: { pz: R.pz + 0.2, roll: -1.0, faceTurn: R.faceTurn + 2, py: 2.0 }, ease: 'io' },
      { at: 1.6, pose: { pz: R.pz + 0.1, roll: -0.4, faceTurn: R.faceTurn + 3, py: 1.6 }, ease: 'io' },
      { at: 2.4, pose: {}, ease: 'io' },
    ],
  };
}
/** When the shudder runs through it, in its breath (grit shaken off falls from then). */
const SHUDDER = 1.25;

/** How long since it was shaken (`rally`, as the moment carries it: 0 for not shaken; else the seconds since, and a thousandth). */
const shaken = (since: number): number => (since >= 0 && since < 0.9 ? since + 0.001 : 0);

// ---------------------------------------------------------------------------------------------
// ITS WALK (his pick by 12:42, "Grinding and heavy (Recommended)": like a statue forced to walk, slow to
// start, every step a shudder, grit falling off it). Twenty frames at eight a second, painted for 0.7
// tiles a second: each foot hauled up, swung through stiff, and brought down hard; the whole bulk drops
// onto it and shudders, its head jolting, its arms swinging a little and late; the weight grinding over
// onto the foot that is down. Grit is shaken off at every step. A foot that is down stays where it is.

const UF_WALK_FRAMES = 24;
const UF_WALK_FPS = 8;
export const UF_PACE = 0.9;
const UF_GROUND = UF_PACE * TILE3;
const UF_STRIDE = UF_GROUND / UF_WALK_FPS;
/** Its walk at frame `j` (0 to 23: its right foot just down before it at 0, its left at 12). */
function ufWalkPose(j: number): P {
  const R = UF_REST;
  const n = UF_WALK_FRAMES;
  const d = UF_STRIDE;
  const foot = (k: number): [number, number, number] => {
    if (k <= 14) return [7 * d - d * k, 0, 0];
    const u = (k - 14) / 10;
    // (hauled up off its toes, swung through, and brought down flat and hard)
    return [-7 * d + 14 * d * smooth01(u * 1.08 - 0.04), 24 * Math.pow(Math.sin(Math.PI * u), 0.7), 14 * (1 - u) - 12 * u * (1 - u)];
  };
  const a = (j / n) * Math.PI * 2;
  const k = j % 12;
  // (the jolt of a foot coming down, dying away)
  const jolt = [1, 0.75, 0.42, 0.18, 0.05, 0, 0, 0, 0, 0, 0, 0.25][k];
  const [rx, rz, rp] = foot(j);
  const [lx, lz, lp] = foot((j + 12) % n);
  return {
    px: 1, py: -4.4 * Math.sin(a), pz: R.pz - 2 + 1.6 * Math.cos(2 * a) - 4.4 * jolt,
    yaw: R.yaw + 4 * Math.cos(a), twist: R.twist - 3 * Math.cos(a), pitch: R.pitch + 2 + 1.4 * jolt, bend: R.bend + 1 + 1.5 * jolt,
    roll: 3.2 * Math.sin(a) + 1.2 * jolt * (j < 12 ? -1 : 1), side: 1.4 * Math.sin(a),
    faceUp: R.faceUp - 2 - 6 * jolt, faceTurn: R.faceTurn - 3 * Math.cos(a), faceTilt: -2 * Math.sin(a),
    rfx: rx, rfz: rz, rfy: R.rfy, rft: R.rft, rfp: rp, rk: -14,
    lfx: lx, lfz: lz, lfy: R.lfy, lft: R.lft, lfp: lp, lk: 14,
    rhx: R.rhx - 7 * Math.cos(a - 0.5), rhz: R.rhz - 4 * jolt, lhx: R.lhx + 7 * Math.cos(a - 0.5), lhz: R.lhz - 4 * jolt,
  };
}
function ufWalk(): Motion {
  const keys: Key3[] = [];
  for (let i = 0; i <= UF_WALK_FRAMES; i++) keys.push({ at: i / UF_WALK_FPS, ease: 'lin', pose: ufWalkPose(i % UF_WALK_FRAMES) });
  return { keys, loop: 0 };
}
/** Grit shaken off at each step (a foot comes down at 0 and at half way round). */
const walkShaken = (t: number): number => shaken(t % ((UF_WALK_FRAMES / UF_WALK_FPS) / 2));

/**
 * SETTING OFF AND STOPPING ("slow to start"): it leans, its weight grinding over onto its left, and
 * hauls its right foot up and forward a stride, the game carrying it on at its pace; stopping, its left
 * comes through and down beside its right, and it settles back into its stance with a shudder.
 */
const UF_SET_OFF = Math.max(1.0, (plantOf('L', {}, UF_REST).at[0] - plantOf('L', ufWalkPose(0), UF_REST).at[0]) / UF_GROUND);
const UF_HALT = Math.max(1.0, (plantOf('R', ufWalkPose(0), UF_REST).at[0] - plantOf('R', {}, UF_REST).at[0]) / UF_GROUND);
function ufSetOff(): Motion {
  const w0 = ufWalkPose(0);
  const T = UF_SET_OFF;
  return {
    keys: [
      { at: 0, pose: {} },
      // (its weight over onto its left foot, slowly, before anything else moves)
      { at: T * 0.3, pose: { ...between({}, w0, 0.15, UF_REST), py: 3.2, roll: -2.4, pz: UF_REST.pz - 0.5 }, ease: 'io' },
      { at: T * 0.7, pose: { ...between({}, w0, 0.6, UF_REST), py: 1.5, pz: UF_REST.pz + 0.8 }, ease: 'io' },
      { at: T, pose: w0, ease: 'in' },
    ],
  };
}
function ufSetOffFeet(): (t: number) => P {
  const T = UF_SET_OFF;
  const R1 = plantOf('R', ufWalkPose(0), UF_REST);
  return footwork({
    L: { start: plantOf('L', {}, UF_REST), moves: [] },
    R: { start: plantOf('R', {}, UF_REST), moves: [{ t0: T * 0.32, t1: T - 0.02, to: plantBy(R1, UF_GROUND * T, 0), lift: 22 }] },
  }, UF_GROUND);
}
function ufHalt(): Motion {
  const w0 = ufWalkPose(0);
  const T = UF_HALT;
  return {
    keys: [
      { at: 0, pose: w0 },
      { at: T * 0.55, pose: { ...between(w0, {}, 0.55, UF_REST), pz: UF_REST.pz - 0.5 }, ease: 'io' },
      { at: T * 0.85, pose: { pz: UF_REST.pz - 2.4, bend: UF_REST.bend + 2, faceUp: UF_REST.faceUp - 3 }, ease: 'in' },
      { at: T, pose: {}, ease: 'out' },
    ],
  };
}
function ufHaltFeet(): (t: number) => P {
  const T = UF_HALT;
  const L0 = plantOf('L', {}, UF_REST);
  return footwork({
    L: { start: plantOf('L', ufWalkPose(0), UF_REST), moves: [{ t0: 0.04, t1: T * 0.85, to: plantBy(L0, UF_GROUND * T * 0.85, 0), lift: 22 }] },
    R: { start: plantOf('R', ufWalkPose(0), UF_REST), moves: [] },
  }, UF_GROUND);
}

// ---------------------------------------------------------------------------------------------
// THE FIST SLAM, its basic blow (the planning chat's, his yes 12 Oct, 18:07). It draws its carved right
// fist up and back over its head, turning away to its right, leaning back on its heels, its raw arm out
// before it; it holds it there, the stone grinding and the mark on its chest flaring (the warning); then
// its hips go, its chest comes round after them, and the fist comes over and down onto the floor before
// it with all its weight, its knees dropping (the game's freeze); the fist skids on, grinding, and grit
// and chips fly; it hauls itself up and back into its stance.

export const UF_SLAM_HIT = 1.2;
/** Where the fist comes down: before it and to its right, on the floor (from its floor point). */
const SLAM_AT: V3 = [80, -26, 27];
const SLAM_TOP: P = {
  pz: UF_REST.pz + 3, yaw: -16, twist: -14, pitch: -6, bend: -4, roll: 2, side: 2, faceUp: 14, faceTurn: 6,
  rhIn: 1, rhx: -18, rhy: -8, rhz: 92, re: 40,
  lhIn: 1, lhx: 46, lhy: 22, lhz: -60, le: -20,
  lk: 16, rk: -20,
};
function ufSlam(): Motion {
  const H = UF_SLAM_HIT;
  const R = UF_REST;
  const tremble = (dz: number, more: P = {}): P => ({ ...SLAM_TOP, rhz: (SLAM_TOP.rhz as number) + dz, ...more });
  return {
    hit: H,
    keys: [
      { at: 0, pose: {} },
      { at: 0.32, pose: { ...between({}, SLAM_TOP, 0.5, R), pz: R.pz + 1 }, ease: 'in' },
      { at: 0.62, pose: SLAM_TOP, ease: 'out' },
      // (held: the stone grinding, the fist trembling, the mark flaring)
      { at: 0.76, pose: tremble(0.8, { roll: 2.6 }), ease: 'io' },
      { at: 0.9, pose: tremble(-0.6, { roll: 1.6 }), ease: 'io' },
      { at: 0.98, pose: tremble(0.6, { yaw: -17, twist: -15 }), ease: 'io' },
      // (the hips go first: they turn into the blow while the chest and the fist stay back)
      { at: 1.04, pose: tremble(1.4, { yaw: -6, twist: -26, pz: R.pz + 1, pitch: -2 }), ease: 'in' },
      // (then the chest comes round, and the fist starts over)
      { at: 1.1, pose: { pz: R.pz - 4, yaw: 2, twist: -8, pitch: 6, bend: 6, roll: 0, side: 0, faceUp: 4, faceTurn: 0, rhIn: 2, rhx: 30, rhy: -30, rhz: 270, re: 30, lhIn: 1, lhx: 40, lhy: 26, lhz: -70, le: -20, lk: 18, rk: -22 }, ease: 'lin' },
      { at: 1.15, pose: { pz: R.pz - 12, yaw: 6, twist: 4, pitch: 18, bend: 16, faceUp: -6, rhIn: 2, rhx: 68, rhy: -28, rhz: 170, re: 22, lhIn: 1, lhx: 30, lhy: 30, lhz: -80, le: -18, lk: 20, rk: -24 }, ease: 'lin' },
      { at: H, pose: { pz: R.pz - 22, yaw: 8, twist: 8, pitch: 28, bend: 26, faceUp: -18, rhIn: 2, rhx: SLAM_AT[0], rhy: SLAM_AT[1], rhz: SLAM_AT[2], re: 16, lhIn: 1, lhx: 26, lhy: 32, lhz: -86, le: -16, lk: 22, rk: -26 }, ease: 'lin' },
      // (the fist skids on, grinding; the weight goes on down after it)
      { at: H + 0.22, pose: { pz: R.pz - 27, yaw: 9, twist: 10, pitch: 33, bend: 30, faceUp: -22, rhIn: 2, rhx: SLAM_AT[0] + 14, rhy: SLAM_AT[1] - 2, rhz: SLAM_AT[2] + 1, re: 14, lhIn: 1, lhx: 24, lhy: 32, lhz: -88, le: -16, lk: 22, rk: -26 }, ease: 'out' },
      { at: H + 0.42, pose: { pz: R.pz - 24, yaw: 8, twist: 8, pitch: 30, bend: 27, faceUp: -16, rhIn: 2, rhx: SLAM_AT[0] + 15, rhy: SLAM_AT[1] - 2, rhz: SLAM_AT[2] + 3, re: 14, lhIn: 1, lhx: 26, lhy: 32, lhz: -86, le: -16, lk: 22, rk: -26 }, ease: 'io' },
      // (hauled up and back into its stance)
      { at: H + 0.85, pose: { ...between({}, { pz: R.pz - 10, pitch: 16, bend: 14, rhIn: 1, rhx: 30, rhy: -20, rhz: -70, re: 24 }, 0.9, R), rhIn: 1 }, ease: 'io' },
      { at: H + 1.3, pose: {}, ease: 'io' },
    ],
  };
}
/** The warning: the mark flaring as it holds the fist up (0 none to 1). */
function slamGlint(t: number): number {
  return t < 0.5 ? 0 : t < 0.9 ? (t - 0.5) / 0.4 : t < UF_SLAM_HIT ? 1 : t < UF_SLAM_HIT + 0.15 ? 1 - (t - UF_SLAM_HIT) / 0.15 : 0;
}

// ---------------------------------------------------------------------------------------------
// ITS THREE BIG MOVES (the planning chat's, his yes 12 Oct, 18:07): THE STOMP that cracks the terrace,
// THE HURLED BLOCK that stays as cover, THE ROCKSLIDE that sends boulders down lanes. Each winds up and
// is held a moment, the mark on its chest flaring gold (the warning), lands with all its weight, and
// follows through. `prop` says where a blow lands, for its chips: 1 its right fist, 2 both fists, 3 its
// right foot, 4 none (a throw).

/** THE STOMP: its weight over onto its raw left leg, its carved right knee hauled up high, its arms flung out; held, trembling; then stamped down before it, toe and then heel, the whole bulk dropping after it, the terrace cracking out from under its foot. */
export const UF_STOMP_HIT = 1.3;
/** Where the stamped foot's toe comes down: a little before where it stood. */
const STOMP_AT = ((): Plant => {
  const r = plantOf('R', {}, UF_REST);
  return plantBy(r, 18, -2, 0, { pitch: 0 });
})();
function ufStomp(): Motion {
  const R = UF_REST;
  const H = UF_STOMP_HIT;
  const out: P = { lhIn: 1, lhx: 18, lhy: 64, lhz: -26, le: -50, rhIn: 1, rhx: 18, rhy: -64, rhz: -26, re: 50 };
  return {
    hit: H,
    keys: [
      { at: 0, pose: { prop: 3 } },
      // (its weight over onto its left, slowly)
      { at: 0.4, pose: { prop: 3, py: 6, roll: -3.5, pz: R.pz + 1, side: -2, lhIn: 1, lhx: 16, lhy: 40, lhz: -70, le: -30, rhIn: 1, rhx: 16, rhy: -40, rhz: -70, re: 30 }, ease: 'io' },
      // (the knee hauled up, the arms flung out, leaning back to hold it)
      { at: 0.78, pose: { prop: 3, py: 8, roll: -4, pz: R.pz + 3, side: -3, pitch: -4, bend: -2, faceUp: 10, ...out }, ease: 'out' },
      { at: 0.92, pose: { prop: 3, py: 8.4, roll: -4.4, pz: R.pz + 3.4, side: -3, pitch: -4.5, bend: -2, faceUp: 11, ...out, lhz: -24 }, ease: 'io' },
      { at: 1.06, pose: { prop: 3, py: 7.8, roll: -3.8, pz: R.pz + 2.8, side: -3, pitch: -3.5, bend: -2, faceUp: 10, ...out, rhz: -28 }, ease: 'io' },
      // (and down: the whole bulk dropping after the foot)
      { at: 1.16, pose: { prop: 3, py: 6, roll: -2, pz: R.pz + 1, side: -2, pitch: 2, bend: 4, faceUp: 4, ...out, lhz: -40, rhz: -40 }, ease: 'in' },
      { at: H, pose: { prop: 3, py: 2, roll: 1, pz: R.pz - 10, side: 0, pitch: 12, bend: 12, faceUp: -10, lhIn: 1, lhx: 20, lhy: 46, lhz: -80, le: -30, rhIn: 1, rhx: 20, rhy: -46, rhz: -80, re: 30, lk: 20, rk: -22 }, ease: 'lin' },
      { at: H + 0.2, pose: { prop: 3, py: 1, roll: 1.5, pz: R.pz - 18, pitch: 16, bend: 16, faceUp: -16, lhIn: 1, lhx: 22, lhy: 40, lhz: -92, le: -26, rhIn: 1, rhx: 22, rhy: -40, rhz: -92, re: 26, lk: 22, rk: -24 }, ease: 'out' },
      { at: H + 0.5, pose: { prop: 3, pz: R.pz - 14, pitch: 13, bend: 14, faceUp: -10, lhIn: 1, lhx: 20, lhy: 34, lhz: -90, le: -24, rhIn: 1, rhx: 20, rhy: -34, rhz: -90, re: 24, lk: 20, rk: -22 }, ease: 'io' },
      { at: 2.6, pose: { prop: 3 }, ease: 'io' },
    ],
  };
}
/** Its feet through the stomp: its left where it stands; its right hauled up, held, stamped down toe and then heel, and stepped back. */
function ufStompFeet(): (t: number) => P {
  const H = UF_STOMP_HIT;
  const r0 = plantOf('R', {}, UF_REST);
  return (t) => {
    if (t <= 0.42 || t >= 2.42) return footOn('R', r0);
    if (t < 1.16) {
      // (hauled up and forward a little, toes up, held trembling)
      const u = smooth01((t - 0.42) / 0.36);
      const tremble = t > 0.8 ? 1.2 * Math.sin((t - 0.8) * 40) : 0;
      return footOn('R', { at: [r0.at[0] + 8 * u, r0.at[1] - 2 * u], turn: r0.turn, pitch: -12 * u }, 58 * u + tremble);
    }
    if (t < H) {
      // (stamped down, fast: its toe first)
      const u = (t - 1.16) / (H - 1.16);
      const g = u * u;
      return footOn('R', { at: [r0.at[0] + 8 + (STOMP_AT.at[0] - r0.at[0] - 8) * g, r0.at[1] - 2 + (STOMP_AT.at[1] - r0.at[1] + 2) * g], turn: r0.turn, pitch: -12 + 30 * g }, 58 * (1 - g));
    }
    if (t < H + 0.08) {
      // (and the heel slammed down after it, the toe where it struck)
      const u = smooth01((t - H) / 0.08);
      return footOn('R', { ...STOMP_AT, pitch: 18 * (1 - u) });
    }
    if (t < 1.98) return footOn('R', STOMP_AT);
    // (stepped back to where it stood)
    const u = (t - 1.98) / 0.44;
    const g = smooth01((u - 0.12) / 0.76);
    return footOn('R', { at: [STOMP_AT.at[0] + (r0.at[0] - STOMP_AT.at[0]) * g, STOMP_AT.at[1] + (r0.at[1] - STOMP_AT.at[1]) * g], turn: r0.turn, pitch: 0 }, 12 * Math.pow(Math.sin(Math.PI * clamp01(u)), 0.6));
  };
}

/**
 * THE HURLED BLOCK: it stoops and drives its hands into the terrace either side of a block of it, tears
 * it up out of the floor (chips and grit bursting), heaves it up over its head and holds it there,
 * trembling, leaning back; then hurls it before it with all its weight, following through, and rises.
 * The block flies on as the game throws it, and lands and stays as cover (`hurledBlock`).
 */
export const UF_HURL_HIT = 2.0;
/** When the block is torn up out of the floor. */
export const UF_HURL_TEAR = 0.85;
/** Where the block lies in the floor before it, and its half-sizes. */
const BLOCK_AT: V3 = [72, 0, 0];
export const BLOCK_H: V3 = [24, 26, 23];
function ufHurl(): Motion {
  const R = UF_REST;
  const H = UF_HURL_HIT;
  const hands = (x: number, z: number, w = BLOCK_H[1] + 4): P => ({ rhIn: 2, rhx: x, rhy: -w, rhz: z, lhIn: 2, lhx: x, lhy: w, lhz: z });
  return {
    hit: H,
    keys: [
      { at: 0, pose: { prop: 4 } },
      // (its hands brought forward, clear of its legs, as it starts to stoop)
      { at: 0.2, pose: { prop: 4, pz: R.pz - 8, pitch: 14, bend: 10, faceUp: -6, lk: 18, rk: -18, rhIn: 1, rhx: 42, rhy: 6, rhz: -100, re: 28, lhIn: 1, lhx: 42, lhy: -6, lhz: -100, le: -28 }, ease: 'in' },
      // (stooping to it, its hands going down either side)
      { at: 0.45, pose: { prop: 4, pz: R.pz - 30, pitch: 40, bend: 30, faceUp: -18, lk: 30, rk: -30, ...hands(BLOCK_AT[0], 24), re: 30, le: -30 }, ease: 'out' },
      // (gripping, straining: it will not come)
      { at: 0.62, pose: { prop: 4, pz: R.pz - 33, pitch: 38, bend: 30, faceUp: -12, lk: 32, rk: -32, ...hands(BLOCK_AT[0] - 1, 22), re: 30, le: -30 }, ease: 'io' },
      { at: 0.76, pose: { prop: 4, pz: R.pz - 31, pitch: 36, bend: 28, faceUp: -8, lk: 32, rk: -32, ...hands(BLOCK_AT[0] - 2, 24), re: 30, le: -30 }, ease: 'io' },
      // (torn up out of the floor)
      { at: UF_HURL_TEAR + 0.08, pose: { prop: 4, pz: R.pz - 24, pitch: 26, bend: 22, faceUp: 0, lk: 26, rk: -26, ...hands(BLOCK_AT[0] + 2, 52), re: 30, le: -30 }, ease: 'out' },
      // (heaved up before it, clear of its head, and over)
      { at: 1.08, pose: { prop: 4, pz: R.pz - 6, pitch: 6, bend: 4, faceUp: 10, lk: 18, rk: -18, ...hands(88, 172), re: 34, le: -34 }, ease: 'in' },
      { at: 1.3, pose: { prop: 4, pz: R.pz + 2, pitch: -6, bend: -6, faceUp: 18, lk: 14, rk: -14, ...hands(14, 292), re: 40, le: -40 }, ease: 'out' },
      // (held, trembling, leaning back: the warning)
      { at: 1.5, pose: { prop: 4, pz: R.pz + 2.6, pitch: -8, bend: -8, faceUp: 20, lk: 14, rk: -14, ...hands(10, 294), re: 40, le: -40 }, ease: 'io' },
      { at: 1.66, pose: { prop: 4, pz: R.pz + 2, pitch: -9, bend: -9, faceUp: 19, lk: 14, rk: -14, ...hands(6, 292), re: 40, le: -40 }, ease: 'io' },
      { at: 1.8, pose: { prop: 4, pz: R.pz + 3, pitch: -12, bend: -11, faceUp: 22, lk: 14, rk: -14, ...hands(-6, 290), re: 42, le: -42 }, ease: 'io' },
      // (hurled: its weight forward after it)
      { at: 1.92, pose: { prop: 4, pz: R.pz - 2, pitch: 4, bend: 4, faceUp: 8, lk: 18, rk: -18, ...hands(40, 286), re: 36, le: -36 }, ease: 'in' },
      { at: H, pose: { prop: 4, pz: R.pz - 8, pitch: 16, bend: 14, faceUp: 0, lk: 20, rk: -20, ...hands(70, 236), re: 32, le: -32 }, ease: 'lin' },
      { at: H + 0.22, pose: { prop: 4, pz: R.pz - 14, pitch: 26, bend: 22, faceUp: -10, lk: 22, rk: -22, ...hands(84, 150, 22), re: 28, le: -28 }, ease: 'out' },
      { at: H + 0.6, pose: { prop: 4, pz: R.pz - 8, pitch: 16, bend: 16, faceUp: -6, lk: 18, rk: -18, rhIn: 1, rhx: 30, rhy: -16, rhz: -76, re: 24, lhIn: 1, lhx: 30, lhy: 16, lhz: -76, le: -24 }, ease: 'io' },
      { at: 3.2, pose: { prop: 4 }, ease: 'io' },
    ],
  };
}
/** The block in its hands: from when it grips it, till it lets it go. */
const blockHeld = (t: number): boolean => t >= 0.5 && t < UF_HURL_HIT;

/**
 * THE ROCKSLIDE: it rears up, roaring, its two fists locked together high over its head, and holds them
 * there, trembling; then brings them down on the terrace before it with everything it has, and again: the
 * whole cut shakes, and boulders come down off the cliffs and roll (`boulderRolling`: the game's lanes).
 */
export const UF_SLIDE_HIT = 1.6;
function ufRockslide(): Motion {
  const R = UF_REST;
  const H = UF_SLIDE_HIT;
  const fists = (x: number, z: number, w = 8): P => ({ rhIn: 2, rhx: x, rhy: -w, rhz: z, lhIn: 2, lhx: x, lhy: w + 2, lhz: z });
  return {
    hit: H,
    keys: [
      { at: 0, pose: { prop: 2 } },
      { at: 0.5, pose: { prop: 2, pz: R.pz + 2, pitch: -8, bend: -8, faceUp: 22, ...fists(8, 296), re: 36, le: -36 }, ease: 'io' },
      // (reared up, roaring: held, trembling: the warning)
      { at: 0.9, pose: { prop: 2, pz: R.pz + 4, pitch: -13, bend: -12, faceUp: 28, ...fists(-12, 302), re: 40, le: -40 }, ease: 'out' },
      { at: 1.08, pose: { prop: 2, pz: R.pz + 4.6, pitch: -14, bend: -12.5, faceUp: 29, ...fists(-13, 304), re: 40, le: -40 }, ease: 'io' },
      { at: 1.26, pose: { prop: 2, pz: R.pz + 4, pitch: -13.5, bend: -12, faceUp: 28, ...fists(-12, 302), re: 40, le: -40 }, ease: 'io' },
      { at: 1.4, pose: { prop: 2, pz: R.pz + 4.4, pitch: -14, bend: -13, faceUp: 28, ...fists(-14, 303), re: 40, le: -40 }, ease: 'io' },
      // (down with everything it has)
      { at: 1.48, pose: { prop: 2, pz: R.pz + 1, pitch: -2, bend: -2, faceUp: 14, ...fists(18, 290), re: 34, le: -34 }, ease: 'in' },
      { at: 1.54, pose: { prop: 2, pz: R.pz - 10, pitch: 16, bend: 14, faceUp: 0, ...fists(48, 190), re: 28, le: -28 }, ease: 'lin' },
      { at: H, pose: { prop: 2, pz: R.pz - 26, pitch: 34, bend: 30, faceUp: -18, lk: 24, rk: -24, ...fists(60, 27), re: 22, le: -22 }, ease: 'lin' },
      { at: H + 0.2, pose: { prop: 2, pz: R.pz - 30, pitch: 37, bend: 32, faceUp: -22, lk: 26, rk: -26, ...fists(72, 28), re: 20, le: -20 }, ease: 'out' },
      // (and again)
      { at: H + 0.42, pose: { prop: 2, pz: R.pz - 22, pitch: 28, bend: 26, faceUp: -8, lk: 22, rk: -22, ...fists(64, 110), re: 26, le: -26 }, ease: 'io' },
      { at: H + 0.56, pose: { prop: 2, pz: R.pz - 30, pitch: 36, bend: 31, faceUp: -20, lk: 26, rk: -26, ...fists(70, 28), re: 22, le: -22 }, ease: 'in' },
      { at: H + 0.9, pose: { prop: 2, pz: R.pz - 24, pitch: 30, bend: 27, faceUp: -12, lk: 24, rk: -24, ...fists(72, 30), re: 22, le: -22 }, ease: 'out' },
      { at: H + 1.3, pose: { prop: 2, pz: R.pz - 8, pitch: 14, bend: 14, rhIn: 1, rhx: 26, rhy: -14, rhz: -76, re: 24, lhIn: 1, lhx: 26, lhy: 14, lhz: -76, le: -24 }, ease: 'io' },
      { at: 3.4, pose: { prop: 2 }, ease: 'io' },
    ],
  };
}
/** The second blow of the rockslide's (grit shaken again). */
const SLIDE_AGAIN = UF_SLIDE_HIT + 0.56;
/** The warning of a blow held from `from` to its full at `full`, and gone just after `hit`. */
function heldGlint(from: number, full: number, hit: number): (t: number) => number {
  return (t) => (t < from ? 0 : t < full ? (t - from) / (full - from) : t < hit ? 1 : t < hit + 0.15 ? 1 - (t - hit) / 0.15 : 0);
}

// ---------------------------------------------------------------------------------------------
// TEARING FREE, at half its life (the planning chat's, his yes 12 Oct, 18:07: "fused to the wall at first,
// it tears itself free at half life"): it strains forward against the wall, roaring, trembling, the stone
// between them cracking, its own fire running in the cracks; then rips itself free with a lunge, the
// wall's stone that held it breaking away behind it in great lumps; it catches itself, and stands free.
// Played by the one still in the wall (`UNFINISHED_FUSED`); it ends standing as the free one stands.

export const UF_TEAR_HIT = 1.4;
function ufTearFree(): Motion {
  const R = UF_REST;
  const H = UF_TEAR_HIT;
  const pull: P = { prop: 5, rhIn: 1, rhx: 54, rhy: -30, rhz: -40, re: 30, lhIn: 1, lhx: 54, lhy: 30, lhz: -40, le: -30 };
  const keys: Key3[] = [{ at: 0, pose: { prop: 5 } }];
  // (straining forward, trembling harder and harder)
  for (let i = 1; i <= 8; i++) {
    const t = 0.15 * i;
    if (t >= H - 0.15) break;
    const k = t / H;
    const sh = (i % 2 ? 1 : -1) * (0.6 + 1.6 * k);
    keys.push({ at: t, pose: { ...pull, pz: R.pz - 4 * k, px: 3 * k, pitch: R.pitch + 10 * k, bend: R.bend + 6 * k, faceUp: R.faceUp + 18 * k, roll: sh, py: sh * 0.8, lk: 18, rk: -18 }, ease: 'io' });
  }
  keys.push(
    // (ripped free: lunging forward, faster and faster, and on)
    { at: H - 0.08, pose: { ...pull, pz: R.pz - 5, px: 5, pitch: R.pitch + 12, bend: R.bend + 7, faceUp: R.faceUp + 19, roll: 0, py: 0, lk: 19, rk: -19, rhx: 56, lhx: 56, rhz: -36, lhz: -36 }, ease: 'io' },
    { at: H, pose: { ...pull, pz: R.pz - 8, px: 8, pitch: R.pitch + 16, bend: R.bend + 10, faceUp: R.faceUp + 18, roll: 0, py: 0, lk: 20, rk: -20, rhx: 62, lhx: 62, rhz: -32, lhz: -32 }, ease: 'in' },
    { at: H + 0.25, pose: { ...pull, pz: R.pz - 14, px: 12, pitch: R.pitch + 22, bend: R.bend + 14, faceUp: R.faceUp + 8, lk: 22, rk: -22, rhx: 72, lhx: 72, rhz: -40, lhz: -40 }, ease: 'out' },
    // (caught: it straightens, and roars, free)
    { at: H + 0.8, pose: { prop: 5, pz: R.pz + 2, px: 2, pitch: R.pitch - 8, bend: R.bend - 8, faceUp: R.faceUp + 26, lk: 14, rk: -14, rhIn: 1, rhx: 20, rhy: -60, rhz: -40, re: 50, lhIn: 1, lhx: 20, lhy: 60, lhz: -40, le: -50 }, ease: 'io' },
    { at: H + 1.2, pose: { prop: 5, pz: R.pz + 2.4, px: 1.5, pitch: R.pitch - 9, bend: R.bend - 9, faceUp: R.faceUp + 28, lk: 14, rk: -14, rhIn: 1, rhx: 20, rhy: -62, rhz: -38, re: 50, lhIn: 1, lhx: 20, lhy: 62, lhz: -38, le: -50 }, ease: 'io' },
    { at: H + 1.9, pose: { prop: 5 }, ease: 'io' },
  );
  return { hit: H, keys };
}
/** How far the stone between it and the wall has cracked as it strains (0 to 1). */
const tearStrain = (t: number): number => clamp01((t - 0.15) / (UF_TEAR_HIT - 0.25));

/** Where the wall's stone that held it was, as it stood in the wall: lumps of it break from each (its middle, how many, a seed). */
const TORN_FROM: ReadonlyArray<readonly [V3, number, number]> = ((): [V3, number, number][] => {
  const s0 = solve(B, UF_REST as Posed);
  const c = chestOf(s0);
  const [cf, cl, cu] = s0.chest;
  return [
    [add(add(c, mul(cf, -CR[0] * 1.6)), mul(cu, -CR[2] * 0.2)), 9, 201],
    [add(add(s0.shoulderL, mul(cl, B.armR[0] * 1.8)), mul(cf, -CR[0] * 0.5)), 5, 202],
    [add(lerp3(s0.hipL, s0.kneeL, 0.5), add(mul(cl, B.legR[0] * 1.6), mul(cf, -B.legR[0] * 1.0))), 4, 203],
  ];
})();

// ---------------------------------------------------------------------------------------------
// ITS DEATH (his pick by 12:42, "Topples and shatters": it falls like a felled statue and breaks into
// great blocks on the floor). Struck, it rocks back; the fire goes out of its mark and its eye; it
// teeters, stiff, grit pouring off it; and topples forward all of a piece, about its toes, faster and
// faster, like a felled statue; it strikes the floor and breaks into great blocks, the head rolling on
// furthest, dust bursting up along its length. What is left lies there (the last frame of its death).

export const UF_DIE_TIME = 3.0;
/** When it strikes the floor and shatters. */
export const UF_FALLS = 1.75;
const FELL_FROM = 0.9;
/** Its front toes: what it topples about. */
const FALL_TOE = Math.max(plantOf('L', {}, UF_REST).at[0], plantOf('R', {}, UF_REST).at[0]);
/** Its back heels: what it rocks back about. */
const FALL_HEEL = Math.min(plantOf('L', {}, UF_REST, 'heel').at[0], plantOf('R', {}, UF_REST, 'heel').at[0]);
const S0 = solve(B, UF_REST as Posed);
/** Its pose toppled `deg` degrees forward about its front toes, all of a piece. */
function toppled(deg: number, out: number): P {
  const R = UF_REST;
  const a = (deg * Math.PI) / 180;
  // (forward about its front toes; rocked back, about its heels)
  const back = deg < 0;
  const pivot = back ? FALL_HEEL : FALL_TOE;
  const rot = (p: V3): V3 => {
    const x = p[0] - pivot;
    return [pivot + x * Math.cos(a) + p[2] * Math.sin(a), p[1], -x * Math.sin(a) + p[2] * Math.cos(a)];
  };
  const pv = rot(S0.pelvis);
  // each foot set where its toe (or heel) is carried round to, tipped as the body is
  const foot = (side: 'L' | 'R'): P => {
    const on = back ? 'heel' : 'toe';
    const p0 = plantOf(side, {}, R, on);
    const q = rot([p0.at[0], p0.at[1], 0]);
    return footOn(side, { at: [q[0], q[1]], turn: p0.turn, pitch: deg, on }, Math.max(0, q[2]));
  };
  // (its arms held a little out from its sides, stiff, as a statue's are)
  return { px: R.px + pv[0] - S0.pelvis[0], pz: R.pz + pv[2] - S0.pelvis[2], pitch: R.pitch + deg, faceUp: R.faceUp - deg, ...foot('L'), ...foot('R'), lhy: R.lhy + 5, rhy: R.rhy - 5, out };
}
/** As far as it topples before it strikes the floor: as far as it can go with its knees, elbows and hands still clear of the floor. */
const FELL_TO = ((): number => {
  let best = 50;
  for (let d = 50; d <= 86; d++) {
    const s = solve(B, { ...UF_REST, ...toppled(d, 1) } as Posed);
    // (and its trunk and head, as solids, not into the floor)
    const under = (c: V3, rot: readonly [V3, V3, V3], h: V3): number => c[2] - Math.hypot(h[0] * rot[0][2], h[1] * rot[1][2], h[2] * rot[2][2]);
    const solids = Math.min(
      under(chestOf(s), s.chest, CR),
      under(lerp3(s.waist, s.ribs, 0.4), s.belly, [B.waistDeep + 5, B.waistHalf + 6, B.ribs * 0.9]),
      under(add(s.pelvis, mul(s.hips[2], B.waist * 0.2)), s.hips, [B.pelvisDeep + 4, B.pelvisHalf + 6, B.waist * 0.95]),
      under(s.head, s.face, [B.headR[0] * 1.25, B.headR[1] * 1.28, B.headR[2] * 1.2]),
    );
    const ok = solids > 1 && Math.min(s.kneeL[2], s.kneeR[2]) > B.legR[1] + 2 && Math.min(s.handL[2], s.handR[2]) > B.armR[2] + 2 && Math.min(s.elbowL[2], s.elbowR[2]) > B.armR[1] + 2;
    if (ok) best = d;
  }
  return best;
})();
function ufDying(): Motion {
  const keys: Key3[] = [];
  const FPS = 20;
  const n = Math.round(UF_DIE_TIME * FPS);
  for (let i = 0; i <= n; i++) {
    const t = i / FPS;
    let deg: number;
    let out: number;
    let more: P = {};
    if (t < 0.12) {
      // (rocked back by the blow)
      deg = -5 * (t / 0.12);
      out = 0.3 * (t / 0.12);
      more = { faceUp: UF_REST.faceUp + 8 * (t / 0.12) };
    } else if (t < FELL_FROM) {
      // (teetering, stiff, the fire going out of it)
      const k = (t - 0.12) / (FELL_FROM - 0.12);
      deg = -5 + 9 * smooth01(k);
      out = 0.3 + 0.7 * smooth01(k);
    } else {
      // (toppling all of a piece, faster and faster, about its toes)
      const k = Math.min(1, (t - FELL_FROM) / (UF_FALLS - FELL_FROM));
      deg = 4 + (FELL_TO - 4) * Math.pow(k, 2.2);
      out = 1;
    }
    const pose = toppled(deg, out);
    keys.push({ at: t, ease: 'lin', pose: { ...pose, faceUp: (pose.faceUp as number) + ((more.faceUp as number) ?? UF_REST.faceUp) - UF_REST.faceUp } });
  }
  return { keys };
}
/** How each piece of it breaks away as it strikes the floor: the head rolling on furthest, the rest lying along where it fell, a little apart. */
function ufFall(piece: string): Fall | null {
  if (/^(grit|dust|chips|glow|eye|crackGlow|wall|block)/.test(piece)) return null;
  let h = 0;
  for (let i = 0; i < piece.length; i++) h = (h * 31 + piece.charCodeAt(i)) | 0;
  const a = hash(h, 1, 11);
  const b = hash(h, 2, 11);
  const from = UF_FALLS + a * 0.06;
  if (piece === 'head' || piece === 'headRaw') return { from, to: [56 + 10 * b, -14 + 8 * a], spin: 70, lay: 'keep', hop: 6, rise: 8 };
  const side = /L$|Raw$/.test(piece) ? 1 : -1;
  const rod = /^(thighR|shinR|upperR|foreR|footL|footR|thighL|shinL|upperL|foreL)$/.test(piece);
  return { from, to: [(b - 0.3) * 24, side * (6 + 16 * a)], spin: (a - 0.5) * 50, lay: rod ? 'axis' : 'keep', hop: 2 + 3 * b };
}

/** STRUCK: it barely gives: a jolt back through the stone, its head knocked up, chips flying; then it grinds back. */
function ufStruck(): Motion {
  const R = UF_REST;
  return {
    keys: [
      { at: 0, pose: {} },
      { at: 0.07, pose: { px: -2.6, pz: R.pz - 0.6, pitch: R.pitch - 4, bend: R.bend - 4, faceUp: R.faceUp + 8, faceTilt: -4, roll: 1.2 }, ease: 'out' },
      { at: 0.2, pose: { px: -1.4, pz: R.pz - 0.8, pitch: R.pitch - 1.5, bend: R.bend - 1.5, faceUp: R.faceUp + 3, roll: 0.4 }, ease: 'io' },
      { at: 0.4, pose: {}, ease: 'io' },
    ],
  };
}

// ---------------------------------------------------------------------------------------------
// ITS SOLIDS

/** What makes one picture of it: as it stands, and whether it is still one with the wall behind it. */
export interface UfLook {
  fused: boolean;
}


/** THE UNFINISHED AS SOLIDS. */
function ufBits(st: Stage, m: Moment, look: UfLook): Bit[] {
  const { s, q } = m;
  const bits: Bit[] = [];
  const put: Put = (part, piece, shape) => {
    bits.push({ part, piece, shape });
  };
  const [cf, cl, cu] = s.chest;
  const lit = 1 - clamp01(q.out);
  const frame = Math.floor(m.t * 8);
  const P = polishedSkin();

  // --- THE LEGS: the right finished (the thigh's muscle, the kneecap, the calf, a carved foot and its toes); the left the raw block, roughed to a column ---
  for (const side of ['L', 'R'] as const) {
    const hip = side === 'L' ? s.hipL : s.hipR;
    const knee = side === 'L' ? s.kneeL : s.kneeR;
    const ankle = side === 'L' ? s.ankleL : s.ankleR;
    const heel = side === 'L' ? s.heelL : s.heelR;
    const toe = side === 'L' ? s.toeL : s.toeR;
    const [rH, rK, rA] = B.legR;
    const fwd = norm(sub(toe, heel), [1, 0, 0]);
    const across: V3 = norm([-fwd[1], fwd[0], 0], [0, 1, 0]);
    if (side === 'R') {
      const tf = limbFrame(hip, knee, fwd);
      put('legR', 'thighR', { k: 'rod', a: hip, b: knee, ra: rH * 0.88, rb: rK * 0.78, ramp: POLISHED, far: true });
      put('legR', 'thighR', { k: 'ball', c: add(lerp3(hip, knee, 0.55), mul(tf[0], rH * 0.32)), ax: [mul(tf[0], rH * 0.62), mul(tf[1], rH * 0.66), mul(tf[2], len3(hip, knee) * 0.36)], skin: P, far: true });
      put('legR', 'kneeR', { k: 'ball', c: add(knee, mul(tf[0], rK * 0.42)), ax: sphere(rK * 0.72), skin: P, far: true });
      const sf = limbFrame(knee, ankle, fwd);
      put('legR', 'shinR', { k: 'rod', a: knee, b: ankle, ra: rK * 0.76, rb: rA * 0.82, ramp: POLISHED, far: true });
      put('legR', 'shinR', { k: 'ball', c: add(lerp3(knee, ankle, 0.3), mul(sf[0], -rK * 0.3)), ax: [mul(sf[0], rK * 0.6), mul(sf[1], rK * 0.7), mul(sf[2], len3(knee, ankle) * 0.3)], skin: P, far: true });
      put('legR', 'shinR', { k: 'ball', c: ankle, ax: sphere(rA * 0.9), skin: P, far: true });
      const fc = add(lerp3(heel, toe, 0.48), [0, 0, rA * 0.42]);
      put('legR', 'footR', { k: 'ball', c: fc, ax: [mul(fwd, B.ball * 0.84), mul(across, rA * 1.05), [0, 0, rA * 0.52]], skin: P, far: true });
      for (const k of [-1.5, -0.5, 0.5, 1.5]) put('legR', 'footR', { k: 'ball', c: add(add(toe, mul(across, k * rA * 0.42)), [0, 0, rA * 0.28]), ax: sphere(rA * 0.27), skin: P, far: true });
    } else {
      const holes = (face: number, a: number, b: number): boolean => face === 0 && Math.abs(a - 1.5) < 1.6 && fr(b / 7.5) < 0.3;
      const tf = limbFrame(hip, knee, fwd);
      block(put, 'legL', 'thighL', lerp3(hip, knee, 0.48), tf, [rH * 1.0, rH * 1.0, len3(hip, knee) * 0.56], rawFace(11, holes));
      const kf = limbFrame(add(knee, [0, 0, 4]), sub(knee, [0, 0, 4]), fwd);
      block(put, 'legL', 'kneeL', add(knee, mul(fwd, rK * 0.25)), kf, [rK * 1.0, rK * 0.95, rK * 0.9], rawFace(12));
      const sf = limbFrame(knee, ankle, fwd);
      block(put, 'legL', 'shinL', lerp3(knee, ankle, 0.5), sf, [rK * 0.95, rK * 0.92, len3(knee, ankle) * 0.52], rawFace(13, holes));
      const ff: [V3, V3, V3] = [fwd, across, [0, 0, 1]];
      block(put, 'legL', 'footL', add(lerp3(heel, toe, 0.45), [0, 0, rA * 0.7]), ff, [B.ball * 0.95, rA * 1.3, rA * 0.72], rawFace(14));
    }
  }

  // --- THE HIPS, THE BELLY, THE CHEST: the right half finished (a carved belt, the belly's muscles, the breast), the left half still the block; the cult's mark cut across the middle of its chest, burning ---
  const [hf, hl, hu] = s.hips;
  const pc = add(s.pelvis, mul(hu, B.waist * 0.2));
  const PH: V3 = [B.pelvisDeep + 4, B.pelvisHalf + 6, B.waist * 0.95];
  put('hips', 'hips', { k: 'ball', c: pc, ax: [mul(hf, PH[0]), mul(hl, PH[1]), mul(hu, PH[2])], skin: polishedSkin((u) => (u[2] > 0.36 && u[2] < 0.62 ? (u[2] > 0.5 ? 1 : -1) : null)) });
  block(put, 'hips', 'hipsRaw', add(pc, mul(hl, PH[1] * 0.5)), s.hips, [PH[0] * 1.02, PH[1] * 0.56, PH[2] * 0.98], rawFace(21));
  const be = s.belly;
  const bc = lerp3(s.waist, s.ribs, 0.4);
  const BH: V3 = [B.waistDeep + 5, B.waistHalf + 6, B.ribs * 0.9];
  put('belly', 'belly', { k: 'ball', c: bc, ax: [mul(be[0], BH[0]), mul(be[1], BH[1]), mul(be[2], BH[2])], skin: polishedSkin((u) => (u[0] > 0.4 && (Math.abs(u[1] + 0.24) < 0.04 || Math.abs(fr((u[2] + 1) * 1.6) - 0.5) > 0.46) ? -1 : null)) });
  block(put, 'belly', 'bellyRaw', add(bc, mul(be[1], BH[1] * 0.5)), be, [BH[0] * 1.03, BH[1] * 0.56, BH[2] * 1.0], rawFace(22));
  const chestC = chestOf(s);
  // THE CULT'S MARK, cut deep across the middle of its chest and burning: where a point of the chest is on it
  const mc = add(chestC, add(mul(cf, CR[0] * 0.9), mul(cu, CR[2] * 0.05)));
  const MW = CR[1] * 0.62;
  const MH = CR[2] * 0.82;
  const markAt = (p: V3): string | null => {
    const d = sub(p, mc);
    if (dot(d, cf) < -CR[0] * 0.6) return null;
    const mk = shriekAt(-dot(d, cl) / MW, dot(d, cu) / MH);
    if (mk === 'dark') return CUT_DARK;
    if (mk !== 'bone') return null;
    if (lit < 0.08) return CUT_DARK;
    if (lit < 0.3) return FLAME[0];
    // (burning: hottest at the heart of each stroke, the fire's tongues licking up it by turns)
    const x = -dot(d, cl) / MW;
    const y = dot(d, cu) / MH;
    const edge = shriekAt(x + 0.07, y) !== 'bone' || shriekAt(x - 0.07, y) !== 'bone' || shriekAt(x, y + 0.06) !== 'bone' || shriekAt(x, y - 0.06) !== 'bone';
    if (edge) return m.glint > 0.6 ? FLAME[3] : FLAME[2];
    return fr(y * 3 - frame * 0.25 + hash(Math.floor(x * 6), 1, 93) * 0.5) < 0.3 + 0.5 * m.glint ? FLAME[4] : FLAME[3];
  };
  const chestSkin = polishedSkin((u) => {
    // (the carved breast: its lower edge, curving)
    if (u[0] > 0.3 && u[1] < -0.06 && Math.abs(u[2] + 0.28 - 0.3 * (u[1] + 0.5) ** 2) < 0.05) return -2;
    return null;
  });
  put('chest', 'chest', { k: 'ball', c: chestC, ax: [mul(cf, CR[0]), mul(cl, CR[1]), mul(cu, CR[2])], skin: chestSkin });
  block(put, 'chest', 'chestRaw', add(chestC, add(mul(cl, CR[1] * 0.52), mul(cu, CR[2] * 0.05))), s.chest, [CR[0] * 1.02, CR[1] * 0.58, CR[2] * 1.02], rawFace(23, (face, a, b) => face === 4 && Math.abs(b) < 1.2 && fr(a / 6) < 0.3));
  // the mark itself: cut into the face the carvers dressed flat for it across the middle of the chest, its own part
  put('mark', 'chest', { k: 'panel', c: add(mc, mul(cf, CR[0] * 0.14 + 0.8)), u: mul(cl, MW), v: mul(cu, MH), skin: (a, b, front) => (front ? markAt(add(mc, add(mul(cl, a), mul(cu, b)))) : null) });
  // the groove where the carvers stopped, drilled, from its belt to its collar
  for (let i = 0; i < 9; i++) {
    const k = i / 8;
    const p = add(lerp3(add(pc, mul(hf, PH[0] * 0.98)), add(chestC, add(mul(cf, CR[0] * 0.96), mul(cu, CR[2] * 0.8))), k), mul(cl, CR[1] * -0.02));
    if (k > 0.45 && k < 0.88) continue; // (the mark is there)
    put('chest', 'chest', { k: 'dot', p, c: HOLE, facing: cf, c2: HOLE });
  }
  // its light
  put('glow', 'glow', { k: 'glow', p: add(mc, mul(cf, 6)), c: FLAME[2], r: 54 + 30 * m.glint, a: (0.36 + 0.3 * m.glint) * lit });
  put('glow', 'glow', { k: 'glow', p: add(mc, mul(cf, 6)), c: FLAME[3], r: 18 + 14 * m.glint, a: (0.32 + 0.3 * m.glint) * lit });

  // --- THE SHOULDERS: the right a carved shoulder; the left a great block of the stone, unshaped ---
  {
    const [r0] = B.armR;
    put('shoulderR', 'shoulderR', { k: 'ball', c: add(s.shoulderR, add(mul(cu, r0 * 0.2), mul(cl, r0 * 0.15))), ax: [mul(cf, r0 * 1.0), mul(cl, r0 * 1.05), mul(cu, r0 * 0.92)], skin: P, far: true });
    block(put, 'shoulderL', 'shoulderL', add(s.shoulderL, add(mul(cu, r0 * 0.4), mul(cl, r0 * 0.2))), s.chest, [r0 * 1.25, r0 * 1.3, r0 * 1.1], rawFace(31));
  }

  // --- THE ARMS: the right finished down to a carved fist; the left the raw block, a great square fist ---
  for (const side of ['L', 'R'] as const) {
    const sh = side === 'L' ? s.shoulderL : s.shoulderR;
    const el = side === 'L' ? s.elbowL : s.elbowR;
    const hand = side === 'L' ? s.handL : s.handR;
    const fore = norm(sub(hand, el), [0, 0, -1]);
    const [r0, r1, r2] = B.armR;
    const palmUp = norm(sub(cf, mul(fore, dot(cf, fore))), cu);
    const acrossF = norm(cross(fore, palmUp), cl);
    if (side === 'R') {
      const uf = limbFrame(sh, el, cf);
      put('armR', 'upperR', { k: 'rod', a: sh, b: el, ra: r0 * 0.9, rb: r1 * 0.82, ramp: POLISHED, far: true });
      put('armR', 'upperR', { k: 'ball', c: add(lerp3(sh, el, 0.55), mul(uf[0], r0 * 0.36)), ax: [mul(uf[0], r0 * 0.6), mul(uf[1], r0 * 0.66), mul(uf[2], len3(sh, el) * 0.3)], skin: P, far: true });
      put('foreR', 'elbowR', { k: 'ball', c: el, ax: sphere(r1 * 0.88), skin: P, far: true });
      const ff = limbFrame(el, hand, cf);
      put('foreR', 'foreR', { k: 'rod', a: el, b: hand, ra: r1 * 0.86, rb: r2 * 0.8, ramp: POLISHED, far: true });
      put('foreR', 'foreR', { k: 'ball', c: add(lerp3(el, hand, 0.28), mul(ff[1], r1 * 0.2)), ax: [mul(ff[0], r1 * 0.72), mul(ff[1], r1 * 0.78), mul(ff[2], len3(el, hand) * 0.3)], skin: P, far: true });
      // the fist: knuckles forward, the fingers curled under, the thumb across them
      const fc = add(hand, mul(fore, r2 * 0.9));
      put('fistR', 'fistR', { k: 'ball', c: fc, ax: [mul(fore, r2 * 1.15), mul(acrossF, r2 * 1.2), mul(palmUp, r2 * 0.98)], skin: P, far: true });
      for (let i = 0; i < 4; i++) {
        const k = (i - 1.5) / 1.5;
        const kn = add(add(fc, mul(fore, r2 * 0.9)), mul(acrossF, k * r2 * 0.84));
        put('fistR', 'fistR', { k: 'ball', c: add(kn, mul(palmUp, -r2 * 0.12)), ax: sphere(r2 * 0.38), skin: P, far: true });
      }
      put('fistR', 'fistR', { k: 'rod', a: add(add(fc, mul(acrossF, -r2 * 1.0)), mul(palmUp, -r2 * 0.3)), b: add(add(fc, mul(fore, r2 * 0.5)), mul(palmUp, -r2 * 0.8)), ra: r2 * 0.38, rb: r2 * 0.32, ramp: POLISHED, far: true });
    } else {
      const holes = (face: number, a: number, b: number): boolean => face === 0 && Math.abs(a) < 1.6 && fr(b / 7) < 0.32;
      block(put, 'armL', 'upperL', lerp3(sh, el, 0.5), limbFrame(sh, el, cf), [r0 * 1.05, r0 * 1.05, len3(sh, el) * 0.56], rawFace(41, holes));
      block(put, 'foreL', 'elbowL', el, limbFrame(sh, el, cf), [r1 * 1.0, r1 * 1.0, r1 * 0.9], rawFace(42));
      block(put, 'foreL', 'foreL', lerp3(el, hand, 0.5), limbFrame(el, hand, palmUp), [r1 * 1.15, r1 * 1.1, len3(el, hand) * 0.55], rawFace(43, holes));
      // the fist: a square block as big as a man's chest, a crack across it
      block(put, 'fistL', 'fistL', add(hand, mul(fore, r2 * 1.3)), limbFrame(el, hand, palmUp), [r2 * 1.5, r2 * 1.55, r2 * 1.45], rawFace(44, (face, a, b) => face % 2 === 0 && Math.abs(a * 0.5 + b * 0.8 - 1) < 0.6));
    }
  }

  // --- THE NECK AND THE HEAD: half a face, finished (a band round the brow, the brow, a blank eye with the cult's fire waking in it, the nose, half the mouth, the jaw); the other half the raw block ---
  put('neck', 'head', { k: 'rod', a: s.neck, b: s.skull, ra: B.headR[1] * 0.95, rb: B.headR[1] * 0.85, ramp: RAW });
  {
    const face = wornOn(st, s, 6);
    const [ff, fl, fu] = face;
    const hr: V3 = [B.headR[0] * 1.25, B.headR[1] * 1.28, B.headR[2] * 1.2];
    const carved = (u: V3, tone: number): number | string | null => {
      if (u[2] > 0.34 && u[2] < 0.52) return u[2] > 0.45 ? 1 : 0; // the band round the brow
      if (u[0] < 0.25) return null;
      // the eye: a deep socket under the brow, the blank eye in it, the cult's fire waking in it
      const ex = (u[1] + 0.42) / 0.24;
      const ez = (u[2] - 0.06) / 0.15;
      if (ex * ex + ez * ez < 1) {
        if (ex * ex * 2.2 + ez * ez * 2.2 < 1) return lit > 0.3 ? (hash(frame, 2, 77) > 0.4 ? FLAME[3] : FLAME[2]) : lit > 0.08 ? FLAME[0] : POLISHED[0];
        return POLISHED[0];
      }
      if (u[2] > 0.2 && u[2] < 0.32 && u[1] < -0.1) return 1; // the brow's ridge, in the light
      if (u[1] > -0.14 && u[2] < 0.2 && u[2] > -0.3) return tone >= 2 ? 1 : 0; // the nose, its ridge
      if (u[1] > -0.24 && u[2] < -0.3 && u[2] > -0.38) return -1; // under the nose
      if (u[2] < -0.48 && u[2] > -0.57 && u[1] > -0.42) return -2; // the mouth
      return null;
    };
    put('head', 'head', { k: 'ball', c: s.head, ax: [mul(ff, hr[0]), mul(fl, hr[1]), mul(fu, hr[2])], skin: polishedSkin(carved) });
    block(put, 'head', 'headRaw', at3(s.head, face, 0, hr[1] * 0.55, hr[2] * 0.05), face, [hr[0] * 1.04, hr[1] * 0.56, hr[2] * 1.06], rawFace(52));
    if (lit > 0.3) put('eye', 'eye', { k: 'glow', p: at3(s.head, face, hr[0] * 0.9, -hr[1] * 0.42, hr[2] * 0.06), c: FLAME[2], r: 12, a: 0.42 * lit });
  }

  // --- FUSED TO THE WALL (the fight's first half): the cliff's own rock still holds its back and its raw side ---
  // (tearing free: `jaw` how far the stone between it and the wall has cracked, its own fire in the cracks; once it has torn free, `since`, the wall's stone that held it falls away)
  const torn = q.prop === 5 && m.since !== undefined && m.since >= 0;
  const strain = q.prop === 5 ? (m.jaw ?? 0) : 0;
  if (look.fused && !torn) {
    // (the cliff's own stone, in its benches: the wall it is still part of, behind it and holding its raw side)
    const cliff = (seed: number): FaceSkin => {
      const raw = rawFace(seed);
      return (face, a, b, tone) => {
        if (strain > 0 && face < 4) {
          // the cracks running through it, wider as it strains
          const c = Math.abs(fr((a * 0.35 + b * 0.8 + 7 * Math.sin(a * 0.11 + b * 0.05 + seed) + hash(face, seed, 7) * 30) / 34) - 0.5);
          const c2 = Math.abs(fr((a * 0.9 - b * 0.3 + 9 * Math.sin(b * 0.09 - a * 0.04 + seed * 2) + hash(face, seed, 8) * 30) / 47) - 0.5);
          if (c < 0.03 * strain || c2 < 0.025 * strain) return strain > 0.6 && hash(Math.floor(a), Math.floor(b), seed + frame) > 0.5 ? FLAME[3] : FLAME[2];
          if (c < 0.06 * strain || c2 < 0.05 * strain) return CUT_DARK;
        }
        if (face < 4 && fr((b + 40) / 13.5) < 0.09) return WALL[Math.max(0, tone - 1)];
        if (face === 4 || face === 5) return raw(face, a, b, tone);
        const c = raw(face, a, b, tone);
        return c === HOLE ? c : WALL[Math.max(0, Math.min(4, tone))];
      };
    };
    const back = add(chestC, mul(cf, -CR[0] * 1.6));
    block(put, 'wall', 'wall', add(back, mul(cu, -CR[2] * 0.2)), s.chest, [CR[0] * 0.8, CR[1] * 2.1, CR[2] * 2.5], cliff(61));
    block(put, 'wall', 'wall2', add(add(s.shoulderL, mul(cl, B.armR[0] * 1.8)), mul(cf, -CR[0] * 0.5)), s.chest, [CR[0] * 1.0, B.armR[0] * 1.5, CR[2] * 2.3], cliff(62));
    block(put, 'wall', 'wall3', add(lerp3(s.hipL, s.kneeL, 0.5), add(mul(cl, B.legR[0] * 1.6), mul(cf, -B.legR[0] * 1.0))), s.hips, [B.legR[0] * 1.3, B.legR[0] * 1.3, B.thigh * 1.0], cliff(63));
    if (strain > 0.2) put('glow', 'crackGlow', { k: 'glow', p: add(chestC, mul(cf, -CR[0] * 1.2)), c: FLAME[2], r: 40 + 40 * strain, a: 0.3 * strain });
  }
  if (look.fused && torn && (m.since as number) < 1.4) {
    // (the wall's stone that held it, broken off as it tears free, falling away behind it in great lumps, and dust)
    const k = m.since as number;
    for (const [c0, n, seed] of TORN_FROM) {
      for (let i = 0; i < n; i++) {
        const off: V3 = [(hash(i, 1, seed) - 0.7) * 50, (hash(i, 2, seed) - 0.5) * 80, (hash(i, 3, seed) - 0.5) * 120];
        const v: V3 = [-30 - hash(i, 4, seed) * 50, (hash(i, 5, seed) - 0.5) * 50, hash(i, 6, seed) * 12];
        // (each lump falls, strikes the floor, and crumbles)
        const land = Math.sqrt((2 * Math.max(1, c0[2] + off[2])) / 520);
        const r = (7 + hash(i, 7, seed) * 9) * (k < land + 0.15 ? 1 : Math.max(0, 1 - (k - land - 0.15) / 0.35));
        if (r < 2.5) continue;
        const z0 = c0[2] + off[2];
        const z = Math.max(r * 0.8, z0 + v[2] * k - 520 * k * k);
        const c: V3 = [c0[0] + off[0] + v[0] * k, c0[1] + off[1] + v[1] * k, z];
        const spin = k * (hash(i, 8, seed) - 0.5) * 6;
        const A: [V3, V3, V3] = [[Math.cos(spin), 0, -Math.sin(spin)], [0, 1, 0], [Math.sin(spin), 0, Math.cos(spin)]];
        block(put, `lump${seed}${i}`, `lump${seed}${i}`, c, A, [r, r * 1.1, r * 0.9], rawFace(seed + i));
      }
    }
    if (k < 0.9) {
      for (let i = 0; i < 26; i++) {
        const a = hash(i, 9, 77) * Math.PI * 2;
        const rr = 30 + k * 120 * hash(i, 10, 77);
        put('dust', 'dust', { k: 'mote', p: [TORN_FROM[0][0][0] + Math.cos(a) * rr, Math.sin(a) * rr, 2 + hash(i, 11, 77) * 30 * (1 - k)], c: i % 2 ? WALL[3] : RAW[3], size: 3 });
      }
    }
  }

  // --- GRIT, trickling off its raw side, and shaken off after the shudder ---
  {
    const n = 6;
    // (how long since it was last shaken: its shudder, a step coming down, a blow landing: `rally`, the move's own)
    const after = m.rally > 0 ? m.rally - 0.001 : -1;
    for (let i = 0; i < n; i++) {
      const ph = fr(m.t * 0.9 + i / n);
      const from = i % 3 === 0 ? s.shoulderL : i % 3 === 1 ? s.elbowL : lerp3(s.handL, s.elbowL, 0.3);
      const off: V3 = [(hash(i, 1, 81) - 0.5) * 10, (hash(i, 2, 81) - 0.2) * 12, 0];
      const p = add(add(from, off), [0, 0, -ph * ph * 60]);
      if (p[2] > 1) put('grit', 'grit', { k: 'mote', p, c: i % 2 ? RAW[2] : RAW[3], size: 2 });
    }
    if (after >= 0 && after < 0.9) {
      for (let i = 0; i < 8; i++) {
        const from = i % 2 ? s.shoulderL : s.head;
        const off: V3 = [(hash(i, 3, 82) - 0.5) * 18, (hash(i, 4, 82) - 0.3) * 20, 0];
        const p = add(add(from, off), [0, 0, -after * after * 120 - hash(i, 5, 82) * 6]);
        if (p[2] > 1) put('grit', 'grit', { k: 'mote', p, c: i % 2 ? RAW[2] : RAW[3], size: 2 });
      }
    }
  }
  // --- DYING: grit pouring off it as its fire goes out, and the dust of its fall ---
  if (m.dying) {
    const t = m.t;
    if (t < UF_FALLS) {
      for (let i = 0; i < 10; i++) {
        const ph = fr(t * 1.4 + i / 10);
        const from = i % 3 === 0 ? s.shoulderL : i % 3 === 1 ? s.head : s.elbowL;
        const p = add(add(from, [(hash(i, 1, 85) - 0.5) * 16, (hash(i, 2, 85) - 0.5) * 16, 0]), [0, 0, -ph * ph * 80]);
        if (p[2] > 1) put('grit', 'grit', { k: 'mote', p, c: i % 2 ? RAW[2] : RAW[3], size: 2 });
      }
    } else if (t < UF_FALLS + 1.1) {
      const k = t - UF_FALLS;
      for (let i = 0; i < 80; i++) {
        const a = hash(i, 3, 85) * Math.PI * 2;
        const along = hash(i, 4, 85) * 240 - 20;
        const rr = 14 + Math.sqrt(k) * 80 * hash(i, 5, 85);
        if (hash(i, 6, 85) < k * 0.9) continue;
        const z = 2 + (10 + 50 * hash(i, 7, 85)) * Math.sin(Math.PI * Math.min(1, k * 1.2));
        put('dust', 'dust', { k: 'mote', p: [FALL_TOE + along + Math.cos(a) * rr, Math.sin(a) * rr * 1.4, z], c: i % 3 ? POLISHED[3] : RAW[3], size: i % 4 ? 4 : 3 });
      }
    }
  }
  // --- THE BLOCK IN ITS HANDS (the hurled block's): gripped by its sides ---
  if (m.skull) {
    // (lying on the floor till it is torn up; then between its hands, rising from where it lay)
    const lift = smooth01((m.t - UF_HURL_TEAR) / 0.1);
    const bc = m.t < UF_HURL_TEAR ? ([BLOCK_AT[0] - 2, BLOCK_AT[1], BLOCK_H[2]] as V3) : add(lerp3(s.handL, s.handR, 0.5), [0, 0, -4 * (1 - lift)]);
    const across = norm(sub(s.handL, s.handR), cl);
    const fwd = norm(cross(across, [0, 0, 1]), cf);
    block(put, 'block', 'block', bc, [fwd, across, cross(fwd, across)], BLOCK_H, rawFace(71, (face, a, b) => face === 4 && Math.abs(a - 2) < 1.4 && fr(b / 6) < 0.3));
  }
  // --- A BLOW LANDING: chips of the stone flung up from where it strikes the floor (its fist, both fists, its foot; a block torn up), and a ring of dust running out ---
  const landsAt = (): V3 | null => {
    if (m.charge > 0) return [BLOCK_AT[0], BLOCK_AT[1], 0];
    if (m.since === undefined || m.since < 0 || m.since >= 0.7) return null;
    if (q.prop === 4 || q.prop === 5 || m.dying) return null;
    if (q.prop === 3) return [s.toeR[0] - 6, s.toeR[1], 0];
    if (q.prop === 2) return lerp3(add(s.handL, [6, 0, 0]), add(s.handR, [6, 0, 0]), 0.5);
    return q.rhIn === 2 && s.handR[2] < 50 ? [s.handR[0] + 6, s.handR[1], 0] : null;
  };
  const at1 = landsAt();
  if (at1) {
    const k = m.charge > 0 ? m.charge - 0.001 : (m.since as number);
    const at0: V3 = [at1[0], at1[1], 0];
    for (let i = 0; i < 22; i++) {
      const a = hash(i, 1, 83) * Math.PI * 2;
      const v = 50 + hash(i, 2, 83) * 90;
      const up = 90 + hash(i, 3, 83) * 140;
      const p: V3 = [at0[0] + Math.cos(a) * v * k, at0[1] + Math.sin(a) * v * k, Math.max(0, up * k - 320 * k * k)];
      if (p[2] <= 0 && k > 0.25) continue;
      put('chips', 'chips', { k: 'mote', p, c: i % 3 ? POLISHED[3] : RAW[2], size: i % 3 === 0 ? 4 : 3 });
    }
    // (the ring of dust running out over the floor, and up)
    if (k < 0.6) {
      const r = 16 + Math.sqrt(k) * 70;
      for (let i = 0; i < 30; i++) {
        if (hash(i, 7, 84) < k * 1.2) continue;
        const a = (i / 30) * Math.PI * 2 + hash(i, 4, 84) * 0.2;
        const z = 1 + (3 + 8 * hash(i, 6, 84)) * Math.sin(Math.PI * Math.min(1, k * 1.6));
        put('dust', 'dust', { k: 'mote', p: [at0[0] + Math.cos(a) * r * 1.2, at0[1] + Math.sin(a) * r, z], c: i % 2 ? POLISHED[3] : RAW[3], size: 3 });
      }
    }
  }
  void rawSkin;
  return bits;
}

function len3(a: V3, b: V3): number {
  return Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
}

// ---------------------------------------------------------------------------------------------
// THE UNFINISHED AS A MONSTER OF THE BONES: its stand, its walk (and setting off and stopping), its fist
// slam, and struck; its other moves (the rockslide, the hurled block, the stomp, tearing free) and its
// death are still to come (until then its stand, not for use).

function ufMob(look: UfLook): Mob {
  const stand: MobMove = { name: 'The Unfinished stands, grinding', motion: ufStand(), rest: UF_REST, rally: (t) => shaken(t - SHUDDER) };
  return {
    id: look.fused ? 'unfinished-fused' : 'unfinished',
    name: 'The Unfinished',
    size: 'a boss: twice the Warden',
    build: B,
    stand,
    attack: { name: 'The fist slam', motion: ufSlam(), rest: UF_REST, glint: slamGlint, rally: (t) => shaken(t - UF_SLAM_HIT) },
    idleFrames: 24,
    idleFps: 10,
    walk: { name: 'The Unfinished walks, grinding', motion: ufWalk(), rest: UF_REST, period: UF_WALK_FRAMES / UF_WALK_FPS, ground: UF_GROUND, rally: walkShaken },
    walkFrames: UF_WALK_FRAMES,
    walkFps: UF_WALK_FPS,
    pace: UF_PACE,
    more: {
      setOff: { name: 'The Unfinished sets off', motion: ufSetOff(), rest: UF_REST, ground: UF_GROUND, feet: ufSetOffFeet() },
      halt: { name: 'The Unfinished stops', motion: ufHalt(), rest: UF_REST, ground: UF_GROUND, feet: ufHaltFeet(), rally: (t) => shaken(t - UF_HALT) },
      stomp: { name: 'The stomp', motion: ufStomp(), rest: UF_REST, feet: ufStompFeet(), glint: heldGlint(0.5, 0.85, UF_STOMP_HIT), rally: (t) => shaken(t - UF_STOMP_HIT) },
      hurl: { name: 'The hurled block', motion: ufHurl(), rest: UF_REST, glint: heldGlint(1.2, 1.55, UF_HURL_HIT), skull: blockHeld, rally: (t) => shaken(t - UF_HURL_TEAR), charge: (t) => shaken(t - UF_HURL_TEAR) },
      rockslide: { name: 'The rockslide', motion: ufRockslide(), rest: UF_REST, glint: heldGlint(0.6, 0.95, UF_SLIDE_HIT), rally: (t) => (t >= SLIDE_AGAIN ? shaken(t - SLIDE_AGAIN) : shaken(t - UF_SLIDE_HIT)) },
      ...(look.fused ? { tearFree: { name: 'The Unfinished tears itself free', motion: ufTearFree(), rest: UF_REST, jaw: tearStrain, glint: heldGlint(0.4, 1.2, UF_TEAR_HIT), rally: (t: number) => shaken(t - UF_TEAR_HIT) } } : {}),
    },
    reel: { name: 'The Unfinished is struck', motion: ufStruck(), rest: UF_REST, rally: (t) => shaken(t) },
    reelTime: 0.4,
    hit: UF_SLAM_HIT,
    warn: 0.6,
    dieTime: UF_DIE_TIME,
    dying: { name: 'The Unfinished topples and shatters', motion: ufDying(), rest: UF_REST },
    fall: ufFall,
    aura: { x: UF_CANVAS.ax, y: UF_CANVAS.ay - 120, r: 140, color: '#ff3a78', a: 0.18 },
    shadow: 64,
    canvas: UF_CANVAS,
    bits: (st, m) => ufBits(st, m, look),
  };
}
/** THE UNFINISHED, free of the wall (the fight's second half). */
export const UNFINISHED: Mob = ufMob({ fused: false });
/** THE UNFINISHED, still one with the wall (the fight's first half). */
export const UNFINISHED_FUSED: Mob = ufMob({ fused: true });

/** A frame of its death, `t` seconds in (as the game holds a death: no edge of light, no pool of light). */
export function unfinishedDeath(t: number, view: GameView = 'front'): Sprite {
  const can = canvasOf(UNFINISHED);
  return toSprite(deathOfMob(UNFINISHED, Math.min(1, t / UF_DIE_TIME), view), null, can.ax, can.ay);
}
/** One frame of one of its moves, as the game holds a figure (cut down, its lights in game pixels; no pool of light). */
export function unfinishedFrame(which: string, t: number, view: GameView = 'front', fused = false): Sprite {
  const mob = fused ? UNFINISHED_FUSED : UNFINISHED;
  const can = canvasOf(mob);
  return toSprite(paintMob(mob, which, t, view, ENEMY_RIM), null, can.ax, can.ay);
}
/** One picture of it standing, `t` seconds into its breath, as the game holds a figure (cut down, its lights in game pixels; no pool of light). */
export function unfinishedStanding(t: number, view: GameView = 'front', fused = false): Sprite {
  const mob = fused ? UNFINISHED_FUSED : UNFINISHED;
  const can = canvasOf(mob);
  return toSprite(paintMob(mob, 'stand', t, view, ENEMY_RIM), null, can.ax, can.ay);
}
/** The same, as painted (for the checks). */
export function unfinishedPainted(t: number, view: GameView = 'front', fused = false): Painted {
  return paintMob(fused ? UNFINISHED_FUSED : UNFINISHED, 'stand', t, view, ENEMY_RIM);
}

/** ITS BREATH'S ROUND, in seconds (for its frames). */
export const UF_BREATH = 2.4;

// ---------------------------------------------------------------------------------------------
// WHAT ITS BIG MOVES LEAVE: for the game to draw where its rules say (the main chat's)

/** A solid painted alone, as the figures are (lit, the seam), with no pink edge: a thing of the place now. */
function paintAlone(w: number, h: number, ax: number, ay: number, make: (put: Put) => void): Sprite {
  const st = stage('front', ax, ay, { w, h });
  const bits: Bit[] = [];
  make((part, piece, shape) => bits.push({ part, piece, shape }));
  const lights = paintBits(st, bits, [0, 0, 20]);
  return toSprite({ px: st.whole(null), lights }, null, ax, ay);
}

/**
 * THE HURLED BLOCK: as it flies, tumbling end over end (`frame` 0 to 3, an eighth of a turn each), its
 * middle at the anchor; and `landed` (frame 4), come to rest on the floor where it fell, a block of the
 * terrace as cover, dust settling round its foot. 160 x 168 at (80, 124).
 */
export function hurledBlock(frame: number): Sprite {
  return paintAlone(160, 168, 80, 124, (put) => {
    if (frame >= 4) {
      block(put, 'block', 'block', [0, 0, BLOCK_H[2]], [norm([1, 0.25, 0]), norm([-0.25, 1, 0]), [0, 0, 1]], BLOCK_H, rawFace(71, (face, a, b) => face === 4 && Math.abs(a - 2) < 1.4 && fr(b / 6) < 0.3));
      for (let i = 0; i < 10; i++) {
        const a = (i / 10) * Math.PI * 2;
        put('dust', 'dust', { k: 'mote', p: [Math.cos(a) * (BLOCK_H[0] + 6), Math.sin(a) * (BLOCK_H[1] + 6), 1], c: i % 2 ? POLISHED[3] : RAW[3], size: 2 });
      }
      return;
    }
    const ang = frame * (Math.PI / 4);
    const F: V3 = [Math.cos(ang), 0, -Math.sin(ang)];
    const U: V3 = [Math.sin(ang), 0, Math.cos(ang)];
    block(put, 'block', 'block', [0, 0, BLOCK_FLY_Z], [F, [0, 1, 0], U], BLOCK_H, rawFace(71, (face, a, b) => face === 4 && Math.abs(a - 2) < 1.4 && fr(b / 6) < 0.3));
  });
}
/** In a flying frame of the hurled block, how far its middle is above the anchor (figure's lengths). */
export const BLOCK_FLY_Z = 44;
/** Where the hurled block's middle is in the air as it flies, `k` from 0 (let go) to 1 (down), from where it was let go to where it lands (figure's lengths, on its floor). */
export function blockFlight(from: V3, to: V3, k: number): V3 {
  const p = lerp3(from, to, k);
  return [p[0], p[1], p[2] + 70 * Math.sin(Math.PI * k)];
}

/** A BOULDER OF THE ROCKSLIDE, rolling (`frame` 0 to 7, an eighth of a turn each, rolling toward the lower left): a great round lump of the quarry's raw stone, faceted. 96 x 96 at (48, 80). */
export function boulderRolling(frame: number): Sprite {
  return paintAlone(96, 96, 48, 80, (put) => {
    const R = 24;
    const ang = (frame / 8) * Math.PI * 2;
    // (rolling toward +y: turned about x)
    const A: [V3, V3, V3] = [[1, 0, 0], [0, Math.cos(ang), Math.sin(ang)], [0, -Math.sin(ang), Math.cos(ang)]];
    put('boulder', 'boulder', { k: 'ball', c: [0, 0, R * 0.92], ax: [mul(A[0], R), mul(A[1], R * 0.95), mul(A[2], R * 0.9)], skin: rawSkin(91) });
    put('boulder', 'boulder', { k: 'ball', c: add([0, 0, R * 0.92], mul(A[2], R * 0.55)), ax: [mul(A[0], R * 0.6), mul(A[1], R * 0.55), mul(A[2], R * 0.5)], skin: rawSkin(92) });
  });
}

/**
 * THE STOMP'S CRACKS in the terrace, run out from under its foot (`k` 0 to 3: the cracks growing; 3, as
 * they stay): dark splits in the stone, their lips knocked pale, wandering out in eight ways, branching.
 * A floor piece, its middle where the foot came down: 320 x 160 at (160, 80).
 */
export function stompCracks(k: number): Sprite {
  const W = 320;
  const H = 160;
  const p = new Px(W, H);
  const reach = [0.35, 0.6, 0.85, 1][Math.max(0, Math.min(3, k))];
  const crack = (x0: number, y0: number, ang: number, len: number, seed: number, depth: number): void => {
    let x = x0;
    let y = y0;
    let a = ang;
    const steps = Math.round(len * reach);
    for (let i = 0; i < steps; i++) {
      a += (hash(i, seed, 95) - 0.5) * 0.7;
      x += Math.cos(a) * 1.6;
      y += Math.sin(a) * 0.8;
      const xi = Math.round(x);
      const yi = Math.round(y);
      const wide = i < steps * 0.55 - depth * 6 ? 1 : 0;
      p.set(xi, yi, '#2a2330').set(xi + wide, yi, '#2a2330').set(xi, yi + wide, '#2a2330');
      p.set(xi, yi - 1, '#cfc5b6');
      if (depth < 2 && hash(i, seed, 96) > 0.93) crack(x, y, a + (hash(i, seed, 97) > 0.5 ? 0.9 : -0.9), (len - i) * 0.5, seed * 7 + i, depth + 1);
    }
  };
  for (let j = 0; j < 9; j++) crack(W / 2, H / 2, (j / 9) * Math.PI * 2 + hash(j, 1, 98) * 0.4, 62 + hash(j, 2, 98) * 40, j + 1, 0);
  // the hollow it stamped
  for (let y = -10; y <= 10; y++) for (let x = -22; x <= 22; x++) if ((x / 22) ** 2 + (y / 10) ** 2 < 1) p.set(W / 2 + x, H / 2 + y, (x / 22) ** 2 + (y / 10) ** 2 > 0.6 ? '#5e5458' : '#76696a');
  return p.sprite(W / 2, H / 2, 2);
}
