// THE DEMON MOVING (the art chat, 27 Oct 2026). A MOCK-UP; NOTHING OF THE GAME IMPORTS IT.
//
// The warlock's demon form, on all fours (his word, 27 Oct, “Give me an all fours stance, gorilla like arms, claws flat on the
// floor burning with cyan flame and black smoke”), its face the beast's (his pick, “A, beast sharpened (Recommended)”). Its
// moves as the heroes' are: keys of its own bones (art/skeleton.ts Key3, bonesAt) from its stance (dev/sculpt_demon_rig.ts
// DEMON_FOURS), drawn by its sculpture a frame at a time. His art rulebook's Movement: weight first; each character its own
// way (its: a gorilla's, massive, its claws burning); loose things follow (its wings, the skin between their fingers); slick;
// alive when still; feet grip the floor, and so do its claws.

import { GRIP_SPEED, UNITS_PER_TILE } from '../art/moves3';
import { bonesAt, elbowFor, solve } from '../art/skeleton';
import type { Bones, Key3, Motion, Posed, V3 } from '../art/skeleton';
import type { GameView } from '../art/skin';
import type { Drawn } from './sculpt';
import { DEMON_B, DEMON_FOURS, demonFrame } from './sculpt_demon_rig';
import type { DemonWings } from './sculpt_demon_rig';

/** A frame, at thirty a second. */
export const FR = 1 / 30;
/** Its stance on all fours: what every key of its starts from. */
export const DEMON_STANCE: Bones = DEMON_FOURS;

/** A move of its. */
export interface DemonMove {
  name: string;
  motion: Motion;
  long: number;
  loops: boolean;
  /** How fast the game carries it across the floor (tiles a second), and the same in its own measure a second. */
  travel?: number;
  carry?: number;
  /** Its wings at a moment. */
  wings: (t: number) => DemonWings;
  /** How big each of its claws' fires burns at a moment (the left claw's are 0 to 4, the right's 5 to 9; 1 as at rest). */
  fire?: (t: number, i: number) => number;
  /** Its tail swung at a moment (radians: loose things follow, Movement 4). */
  tail?: (t: number) => number;
  /**
   * A claw raking: which (1 its left, -1 its right), from when to when it is up off the floor, the way it sweeps at a moment;
   * open as a raking claw only while its wrist is this high (lower, its claws spread as on the floor, so that they never go
   * down through it as it lifts and comes down).
   */
  rake?: { side: 1 | -1; up: [number, number]; way: (t: number) => V3; minZ: number };
  /** The strike itself, from the frame before it to the last frame of the freeze after it lands: a flash, not judged frame by frame (Movement 9). */
  strike?: [number, number];
  /** The moment its blow lands. */
  hit?: number;
}

/** Eased both ways, 0 to 1. */
const ease = (u: number): number => {
  const c = Math.max(0, Math.min(1, u));
  return c * c * c * (c * (c * 6 - 15) + 10);
};
/** A soft bump, 0 to 1 and back, over `long` from `at` (of a round: wrapping round it). */
const bump = (ph: number, at: number, long: number): number => {
  const d = (((ph - at) % 1) + 1) % 1;
  return d < long ? 0.5 - 0.5 * Math.cos((d / long) * Math.PI * 2) : 0;
};
/** A soft bump over seconds, not wrapping. */
const hump = (t: number, at: number, long: number): number => (t > at && t < at + long ? 0.5 - 0.5 * Math.cos(((t - at) / long) * Math.PI * 2) : 0);
/** From 0 to 1 between two moments, eased. */
const span = (t: number, a: number, b: number): number => ease((t - a) / (b - a));
const clampN = (v: number, lo: number, hi: number): number => Math.max(lo, Math.min(hi, v));

/**
 * Its elbows, turned back as a gorilla's (as DEMON_FOURS), for wherever its claws are: back along its own body, as it twists
 * and rolls; but a raking arm's (`raking`, 1 its left, -1 its right) out from its side and up, so that as the claw sweeps
 * across before it the arm swings round in front of its chest, not through it.
 */
function elbowsOf(q: Bones, raking = 0, outK = 1): Bones {
  const o = { ...q };
  const [f, l, u] = solve(DEMON_B, o as Posed).hips;
  const back = (side: number): V3 => [-12 * f[0] + side * l[0], -12 * f[1] + side * l[1], -12 * f[2] + side * l[2]];
  const out = (side: number): V3 => [side * 12 * l[0] + 6 * u[0] - 2 * f[0], side * 12 * l[1] + 6 * u[1] - 2 * f[1], side * 12 * l[2] + 6 * u[2] - 2 * f[2]];
  // (swung round from back to out as the claw lifts, `outK` of the way)
  const turned = (side: 1 | -1, left: boolean): number => {
    const b = elbowFor(DEMON_B, o as Posed, left, back(side));
    if (raking !== side || outK <= 0) return b;
    const w = elbowFor(DEMON_B, o as Posed, left, out(side));
    let d = w - b;
    while (d > 180) d -= 360;
    while (d < -180) d += 360;
    return b + d * outK;
  };
  o.le = turned(1, true);
  o.re = turned(-1, false);
  return o;
}
const S0 = DEMON_STANCE;

/** Its wings from a stroke over time: each hand trailing the stroke, the skin billowing against it. */
function wingsFrom(stroke: (t: number) => { spread: number; beat: number; sweep: number; wind?: number }): (t: number) => DemonWings {
  return (t) => {
    const now = stroke(t);
    const was = stroke(t - 0.09);
    return {
      spread: now.spread,
      beat: now.beat,
      sweep: now.sweep,
      tip: clampN((was.sweep - now.sweep) * 2.0 + (was.beat - now.beat) * 0.6, -0.8, 0.8),
      flex: 1,
      wind: clampN((now.wind ?? 0) + (was.sweep - now.sweep) * 1.6, -0.35, 0.5),
      phase: t,
    };
  };
}

// ---- STANDING: ALIVE WHEN STILL (Movement 7). A round of 4.8 s: three heavy breaths, its whole back heaving with each;
// its weight rolled onto its right claw, its left lifted, flexed and slammed down into the floor, its fire bursting up out
// from under it; a look to its left and its right over its claws; its wings mantled wide and settling.
export const STAND_LONG = 4.8;
const BREATH = 1.6;
/** The slam of its left claw, and how long the burst of its fire lasts. */
const SLAM = 1.92;
export function demonStand(): Motion {
  const keys: Key3[] = [];
  const n = 48;
  for (let i = 0; i <= n; i++) {
    const t = (i / n) * STAND_LONG;
    const br = Math.sin((t / BREATH) * Math.PI * 2);
    // (its weight onto its right claw, held while the left is up, then back)
    const shift = span(t, 0.9, 1.35) * (1 - span(t, 2.05, 2.7));
    // (the left claw: lifted, drawn up and flexed, then down hard)
    const lift = span(t, 1.3, 1.72) * (1 - span(t, 1.8, SLAM));
    // (the jolt through it as it slams down)
    const jolt = hump(t, SLAM - 0.04, 0.42);
    // (a look to its left over its claws, then its right, and home)
    const look = 18 * span(t, 2.75, 3.25) * (1 - span(t, 3.45, 3.85)) - 14 * span(t, 3.45, 3.85) * (1 - span(t, 4.15, 4.6));
    const pose: Bones = {
      ...S0,
      px: S0.px + 0.6 * jolt,
      py: -1.8 * shift,
      pz: S0.pz + 0.7 * br - 1.6 * jolt + 0.5 * lift,
      roll: 4.5 * shift - 1.5 * jolt,
      yaw: 3 * shift,
      pitch: S0.pitch + 2.5 * jolt - 1.2 * lift,
      bend: S0.bend - 1.5 * br + 2 * jolt,
      hunch: (S0.hunch ?? 0) - 2.5 * br + 3 * jolt - 2 * lift,
      shrug: (S0.shrug ?? 0) + 0.07 * br + 0.06 * lift,
      faceUp: S0.faceUp + 1.6 * br + 5 * lift - 6 * jolt,
      faceTurn: look - 6 * lift,
      faceTilt: 4 * shift,
      lhz: 7 + 6 * lift,
      lhx: S0.lhx + 1.2 * lift,
      lhy: S0.lhy + 1.0 * lift,
    };
    keys.push({ at: t, ease: 'lin', pose: elbowsOf(pose) });
  }
  return { keys, loop: 0 };
}
const standWings = wingsFrom((t) => {
  const br = Math.sin((t / BREATH) * Math.PI * 2 - 0.5);
  // (mantled: flung wide and up, held a beat, settled)
  const mantle = span(t, 3.1, 3.55) * (1 - span(t, 3.9, 4.6));
  const sl = hump(t, SLAM - 0.05, 0.5);
  return {
    spread: 1 + 0.05 * br + 0.32 * mantle - 0.05 * sl,
    beat: 0.05 * br + 0.3 * mantle + 0.1 * sl,
    sweep: 0.06 * Math.sin((t / STAND_LONG) * Math.PI * 4 + 0.7) - 0.12 * mantle + 0.08 * sl,
  };
});
const standFire = (t: number, i: number): number => {
  if (i >= 5) return 1;
  // (its left claw's fire: guttering as it lifts, bursting up as it slams down, dying back)
  const up = span(t, 1.3, 1.72) * (1 - span(t, 1.8, SLAM));
  const burst = t >= SLAM - 0.02 ? Math.exp(-(t - SLAM + 0.02) / 0.32) : 0;
  return 1 - 0.3 * up + 1.1 * burst;
};

// ---- RUNNING: A GORILLA'S GALLOP, LONG AND LOPSIDED. His words of the first, 27 Oct, “Not wild enough (Recommended),The
// front legs move together and the back legs move together.  The motion is good but it’s too symmetrical”; of the second,
// “The wings are clipping together.  The rear leg smoke clips through the arms.  His body doesn’t move at all.”; of the
// third, “The wings are stiff again.  I think the side needs to be longer and really stretch the body and arms out.  I
// think the added force is just making his jerk around, not actually showing a stronger run”, and “Stride, not side
// sorry”. So: a long stride, its power in the stretch and the gather, not in being jerked about. Its claws land one after
// the other, a beat apart, left then right, and its legs the same, rolling through all four. Off its legs it springs into a
// long leap, stretched out from its flung-out claws to its hooves kicked out behind; its claws land far ahead, its weight
// rolls over them, and its legs swing through bunched up under it, its back arched, and land near its claws to spring
// again. A round of 0.7 s, carried at a hero's own speed (4.6 tiles a second: three tiles and more a stride); every claw
// and hoof down flat on the floor stays where it is there, lifted before it goes on (Movement 8, feet grip the floor). Its
// wings half open, beating with each stride, their hands trailing each stroke; its tail lashing.
export const RUN_ROUND = 0.7;
export const RUN_CARRY = GRIP_SPEED * UNITS_PER_TILE;
/**
 * A limb through its round: down at `land` for `on` of it, at `ahead` (forward of where it stands), going back under it as
 * fast as the game carries it; then lifted, carried on, and set down again. Returns how far forward of where it stands, how
 * high, and how far through its swing (less than nothing while it is down).
 */
function limb(ph: number, land: number, on: number, ahead: number, high: number, S: number): { x: number; z: number; v: number } {
  const q = (((ph - land) % 1) + 1) % 1;
  if (q < on) return { x: ahead - S * q, z: 0, v: -1 };
  const v = (q - on) / (1 - on);
  // (lifted first, where it is on the floor, still going back under it as the floor does; carried on; set down where it
  // lands, going back with the floor as it comes down to it: never sliding over it, however long the stride)
  const go = ease((v - 0.12) / 0.76);
  return { x: ahead - S * q + S * go, z: high * Math.pow(Math.sin(Math.PI * v), 0.8), v };
}
/** When each claw and hoof lands (of a round), and for how long it is down: a beat between left and right. */
const HANDS = { L: { land: 0, on: 0.27 }, R: { land: 0.1, on: 0.27 } };
const FEET = { L: { land: 0.4, on: 0.27 }, R: { land: 0.5, on: 0.27 } };
/** How far ahead of its shoulders its claws land (flung far out), and how high a claw and a hoof are swung. */
const REACH = 22;
const CLAW_UP = 10;
const HOOF_UP = 11;
/** Once round its stride, smoothly: 1 at `at` of it, -1 half a round from it. */
const wave = (ph: number, at: number): number => Math.cos((ph - at) * Math.PI * 2);
export function demonRun(): Motion {
  const P = RUN_ROUND;
  const S = RUN_CARRY * P;
  const keys: Key3[] = [];
  const n = Math.round(P * 60);
  for (let i = 0; i <= n; i++) {
    const ph = i / n;
    const aheadH = S * HANDS.L.on * 0.5;
    const aheadF = S * FEET.L.on * 0.62;
    const lh = limb(ph, HANDS.L.land, HANDS.L.on, aheadH, CLAW_UP, S);
    const rh = limb(ph, HANDS.R.land, HANDS.R.on, aheadH, CLAW_UP, S);
    const lf = limb(ph, FEET.L.land, FEET.L.on, aheadF, HOOF_UP, S);
    const rf = limb(ph, FEET.R.land, FEET.R.on, aheadF, HOOF_UP, S);
    // (once round a stride, smoothly: STRETCHED out long in the leap, its back flat and long, high off the floor; BUNCHED
    // up as its legs swing through under it, its back arched; its front down as its claws take it, up as its legs do)
    const stretch = wave(ph, 0.86);
    const front = wave(ph, 0.14);
    // (the lean of it over to whichever side is down, a little, not a jolt)
    const lean = Math.sin((ph - 0.05) * Math.PI * 2);
    const pose: Bones = {
      ...S0,
      px: S0.px + 4 * stretch,
      py: 1.6 * lean,
      pz: S0.pz + 1.5 + 5.5 * stretch,
      pitch: S0.pitch + 7 * front,
      roll: 3 * lean,
      yaw: 2 * Math.sin((ph - 0.5) * Math.PI * 2),
      twist: 4 * lean,
      bend: S0.bend - 17 * stretch,
      hunch: (S0.hunch ?? 0) - 7 * stretch,
      shrug: (S0.shrug ?? 0) + 0.18 * Math.max(0, stretch),
      // (its head thrust on as it stretches, held level as its body rocks under it)
      faceUp: S0.faceUp - 3 - 4 * front,
      faceTurn: 3 * lean,
      // (each claw lands far ahead of its shoulder, its arm flung out straight, and is lifted as it passes back under it)
      lhIn: 2, lhx: S0.lhx + REACH + lh.x - aheadH, lhy: S0.lhy - 2 * Math.max(0, lh.z / CLAW_UP), lhz: 7 + lh.z,
      rhIn: 2, rhx: S0.rhx + REACH + rh.x - aheadH, rhy: S0.rhy + 2 * Math.max(0, rh.z / CLAW_UP), rhz: 7 + rh.z,
      // (each hoof tipped down as it swings, only once it is up off the floor, and flat again before it comes down: so it
      // does not slide)
      lfx: S0.lfx + lf.x, lfz: lf.z, lfp: lf.v < 0 ? 0 : 26 * Math.sin(Math.PI * Math.min(1, lf.v / 0.85)) * ease(lf.v / 0.3),
      rfx: S0.rfx + rf.x, rfz: rf.z, rfp: rf.v < 0 ? 0 : 26 * Math.sin(Math.PI * Math.min(1, rf.v / 0.85)) * ease(rf.v / 0.3),
    };
    keys.push({ at: ph * P, ease: 'lin', pose: elbowsOf(pose) });
  }
  return { keys, loop: 0 };
}
// (half open and beating once a stride, their hands trailing each stroke and the skin billowing: loose, not held; his word
// of the third run, “The wings are stiff again.”; never swung back so far that one passes behind the other, “The wings are
// clipping together.”)
const runWings = wingsFrom((t) => {
  const ph = (((t / RUN_ROUND) % 1) + 1) % 1;
  return {
    spread: 0.62 + 0.18 * wave(ph, 0.8),
    beat: 0.08 + 0.3 * wave(ph, 0.78),
    sweep: 0.08 + 0.2 * wave(ph, 0.55),
    wind: 0.25,
  };
});
const runFire = (t: number, i: number): number => {
  const ph = (((t / RUN_ROUND) % 1) + 1) % 1;
  // (each claw's fire flaring as it lands on the floor, streaming as it swings)
  const h = i < 5 ? HANDS.L : HANDS.R;
  return 0.8 + 0.7 * bump(ph, h.land, 0.22);
};

// ---- TAP: A CLAW RAKE (his pick, 27 Oct, “Alternating rakes (Recommended)”: each tap, one claw rakes wide across in a big
// arc, left then right, as it leans onto the other claw; each cursing what it hits, his word of 25 Oct, “So I think the tap
// claw rake has to apply the curse as well”). His rulebook's Movement 9, big wind-up, lightning strike: it rolls its weight
// onto the other claw and draws the raking one up, back and out, its shoulder wound back and its wings lifting, and holds
// it there a beat; then in a flash, a single frame, it rakes it across before its face and down, its body unwinding hard
// behind it and lunging in, its wings flung; a freeze as it lands (Movement 6, heavy blows freeze); then it follows
// through, draws the claw back and sets it down where it stood, flat and still on the floor.
/** A frame-by-frame track through keys (seconds, value), smooth through each (its pace carried through), still at a hold. */
function track(keys: readonly (readonly [number, number])[], t: number, holds: ReadonlySet<number> = new Set()): number {
  if (t <= keys[0][0]) return keys[0][1];
  const last = keys[keys.length - 1];
  if (t >= last[0]) return last[1];
  let i = 0;
  while (i < keys.length - 2 && t >= keys[i + 1][0]) i++;
  const [t0, v0] = keys[i];
  const [t1, v1] = keys[i + 1];
  // (the pace through a key: from the key before to the key after; none at the ends, nor where it holds)
  const pace = (j: number): number => (j <= 0 || j >= keys.length - 1 || holds.has(j) ? 0 : (keys[j + 1][1] - keys[j - 1][1]) / (keys[j + 1][0] - keys[j - 1][0]));
  const h = t1 - t0;
  const u = (t - t0) / h;
  const m0 = pace(i) * h;
  const m1 = pace(i + 1) * h;
  const u2 = u * u;
  const u3 = u2 * u;
  return (2 * u3 - 3 * u2 + 1) * v0 + (u3 - 2 * u2 + u) * m0 + (-2 * u3 + 3 * u2) * v1 + (u3 - u2) * m1;
}
/** Its frames, at thirty a second: the rake's wind-up, held; the swing (three frames, wide out and across); the blow, the freeze; the follow-through; the claw down. */
export const RK = { lift: 3, drawn: 9, held: 11, swung: 12, swung2: 13, hit: 14, freeze: 16, through: 19, back: 23, down: 28 };
export const RAKE_HIT = RK.hit * FR;
export const RAKE_LONG = 31 * FR;
/**
 * The raking claw's way (for its left; its right the same, its sides swapped): from where it stands, how far forward, to
 * its left and up. Drawn back and far out to its side; swung WIDE, out round the front of it and ACROSS its body to its
 * other side (his word of the first rakes, 27 Oct, “Hard to see the swipe,The swing should come wide out to across the
 * body.  The cyan streaks should follow the claws”); followed through low on that side; drawn back; set down.
 */
const RAKE_HAND: Record<string, [number, number, number]> = {
  0: [0, 0, 0],
  // (lifted straight up off the floor first, so it does not slide on it)
  2: [0, 0.2, 3.2],
  [RK.lift + 1]: [-3, 8, 13],
  [RK.drawn]: [-13, 36, 34],
  [RK.held]: [-14, 39, 37],
  [RK.swung]: [20, 31, 33],
  [RK.swung2]: [42, -1, 25],
  [RK.hit]: [44, -30, 18],
  [RK.freeze]: [44, -30, 18],
  // (after the blow, back the way it came, not on round: his word of the rakes, 27 Oct, “Now they do a full 360, what is that?”)
  [RK.through]: [30, -16, 15],
  [RK.back]: [14, -5, 9],
  [RK.down - 3]: [0.2, -0.4, 3],
  [RK.down]: [0, 0, 0],
};
const RAKE_FRAMES = Object.keys(RAKE_HAND).map(Number).sort((a, b) => a - b);
const RAKE_HOLDS = new Set([RAKE_FRAMES.indexOf(RK.held), RAKE_FRAMES.indexOf(RK.hit), RAKE_FRAMES.indexOf(RK.freeze), RAKE_FRAMES.indexOf(RK.down - 3)]);
/** Where the raking claw is at a moment, from where it stands (forward, to its left for its left, up). */
const rakeHand = (k: 0 | 1 | 2, t: number): number => track(RAKE_FRAMES.map((f) => [f * FR, RAKE_HAND[f][k]] as const), t, RAKE_HOLDS);
function rakeMotion(side: 1 | -1): Motion {
  const sgn = side;
  /** The body's keys: at rest, lifting, wound up, held, swinging, swinging, landed, held, through, settling, at rest. */
  const at = [0, RK.lift, RK.drawn, RK.held, RK.swung, RK.swung2, RK.hit, RK.freeze, RK.through, RK.back, RK.down];
  const body = (vals: number[], t: number): number => track(at.map((f, i) => [f * FR, vals[i]] as const), t, new Set([3, 6, 7]));
  // (keys a frame apart, but four to a frame through the swing itself, so it sweeps its arc and not three straight cuts)
  const times: number[] = [];
  for (let f = 0; f <= RK.down + 3; f++) {
    times.push(f * FR);
    if (f >= RK.held && f < RK.hit) for (let q = 1; q < 4; q++) times.push((f + q / 4) * FR);
  }
  const keys: Key3[] = [];
  for (const t of times) {
    const hx = rakeHand(0, t);
    const hy = rakeHand(1, t) * sgn;
    const hz = rakeHand(2, t);
    const own = sgn > 0 ? { x: S0.lhx, y: S0.lhy } : { x: S0.rhx, y: S0.rhy };
    const lean = body([0, 4, 6, 6.5, 3, 0, -3, -3, -1, 0, 0], t) * sgn;
    const pose: Bones = {
      ...S0,
      // (its weight rolled onto the other claw as it winds up, its shoulders wound round; thrown the other way, and on, as
      // it rakes, its whole body unwinding behind the claw)
      roll: lean,
      py: -0.5 * lean,
      twist: body([0, 8, 16, 17, 6, -8, -18, -18, -9, -2, 0], t) * sgn,
      px: S0.px + body([0, -1, -2, -2, 2, 5, 7, 7, 3, 1, 0], t),
      pitch: S0.pitch + body([0, -1, -2.5, -2.5, 1, 3, 5, 5, 3, 1, 0], t),
      pz: S0.pz + body([0, 0.5, 1.2, 1.2, 0, -1.5, -2.5, -2.5, -1, 0, 0], t),
      shrug: (S0.shrug ?? 0) + body([0, 0.06, 0.12, 0.12, 0.08, 0.04, 0, 0, 0, 0, 0], t),
      faceUp: S0.faceUp + body([0, 2, 3, 3, 1, 0, -2, -2, -1, 0, 0], t),
      faceTurn: body([0, 3, 6, 6, 2, -3, -6, -6, -3, 0, 0], t) * sgn,
      ...(sgn > 0 ? { lhIn: 2, lhx: own.x + hx, lhy: own.y + hy, lhz: 7 + hz } : { rhIn: 2, rhx: own.x + hx, rhy: own.y + hy, rhz: 7 + hz }),
    };
    // (the raking arm's elbow swung out and up as it lifts off the floor, and back as it comes down again)
    // (and kept out while the claw is across before it, so that the arm stays round in front of its chest)
    keys.push({ at: t, ease: 'lin', pose: elbowsOf(pose, sgn, track([[0, 0], [RK.drawn * FR, 1], [RK.freeze * FR, 1], [RK.down * FR, 0]], t)) });
  }
  return { keys, hit: RAKE_HIT };
}
/** The way the raking claw's talons hook at a moment: at what it is about to rake as it winds up; the way it sweeps as it rakes. */
const rakeWay = (side: 1 | -1) => (t: number): V3 => {
  // (and held so as it comes back, not turned round in its hand)
  const a = track([[0, 0.3], [RK.drawn * FR, -0.4], [RK.held * FR, -0.6], [RK.swung * FR, -1.0], [RK.swung2 * FR, -1.35], [RK.hit * FR, -1.8], [RK.back * FR, -1.8], [RK.down * FR, -1.4]], t);
  return [Math.cos(a), Math.sin(a) * side, -0.2];
};
const rakeWings = wingsFrom((t) => {
  const f = t / FR;
  const up = track([[0, 0], [RK.drawn, 0.6], [RK.held, 0.7], [RK.swung2, 1], [RK.hit, 1], [RK.through, 0.6], [RK.down, 0], [31, 0]], f);
  return { spread: 1 + 0.15 * Math.min(up, 0.7) / 0.7 + 0.25 * Math.max(0, up - 0.7) / 0.3, beat: 0.12 * up + 0.2 * Math.max(0, up - 0.7) / 0.3, sweep: 0.08 * up - 0.18 * Math.max(0, up - 0.7) / 0.3 };
});
const rakeFire = (t: number, i: number): number => {
  if (i < 10) return 1;
  // (its talons' fire: kindling as it winds up, roaring as it rakes, dying back)
  return track([[0, 0.7], [RK.held * FR, 1.1], [RK.hit * FR, 1.4], [RK.through * FR, 1.0], [RK.down * FR, 0.7]], t);
};
function rakeMove(side: 1 | -1): DemonMove {
  return {
    name: side > 0 ? 'Tap: claw rake, its left' : 'Tap again: claw rake, its right',
    motion: rakeMotion(side),
    long: RAKE_LONG,
    loops: false,
    wings: rakeWings,
    fire: rakeFire,
    tail: (t) => 0.2 * Math.sin((t / RAKE_LONG) * Math.PI * 2) * side,
    rake: { side, up: [RK.lift * FR, (RK.down - 2) * FR], way: rakeWay(side), minZ: 20 },
    strike: [(RK.held - 1) * FR, (RK.freeze + 1) * FR],
    hit: RAKE_HIT,
  };
}

// (its tail: a slow swish as it stands, lashing as its claw slams down; swung after its body as it runs)
const standTail = (t: number): number => 0.22 * Math.sin((t / 2.4) * Math.PI * 2) + 0.18 * hump(t, SLAM, 0.6);
const runTail = (t: number): number => 0.24 * Math.sin((t / RUN_ROUND - 0.3) * Math.PI * 2);

export function demonMoves(): DemonMove[] {
  return [
    { name: 'The demon standing', motion: demonStand(), long: STAND_LONG, loops: true, wings: standWings, fire: standFire, tail: standTail },
    { name: 'The demon running', motion: demonRun(), long: RUN_ROUND, loops: true, travel: GRIP_SPEED, carry: RUN_CARRY, wings: runWings, fire: runFire, tail: runTail },
    rakeMove(1),
    rakeMove(-1),
  ];
}

/** Its pose at a moment of a move. */
export function demonPose(m: Motion, t: number): Posed {
  return bonesAt(m.keys, DEMON_STANCE, t);
}
/** Its picture at a moment of a move. */
export function drawDemonAt(view: GameView, m: DemonMove, t: number, turn = 0): Drawn {
  const tt = m.loops ? ((t % m.long) + m.long) % m.long : t;
  const fires = (i: number): number => (m.fire ? m.fire(tt, i) : 1);
  const pose = demonPose(m.motion, tt);
  const wrist = m.rake ? (m.rake.side > 0 ? pose.lhz : pose.rhz) : 0;
  const raking = m.rake && tt >= m.rake.up[0] && tt <= m.rake.up[1] && wrist >= m.rake.minZ ? { side: m.rake.side, way: m.rake.way(tt) } : undefined;
  // (a raking claw below the height it rakes at is drawn as a claw on the floor, lifted: its claws spread, clear of it)
  return demonFrame(view, pose as Bones, turn, { tail: m.tail?.(tt), paws: !!m.carry || !!m.rake, rake: raking }, m.wings(tt), t, fires, m.carry ?? 0);
}
