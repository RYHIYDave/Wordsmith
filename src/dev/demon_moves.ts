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
  rake?: { side: 1 | -1 | 0; up: [number, number]; minZ: number };
  /** The strike itself, from the frame before it to the last frame of the freeze after it lands: a flash, not judged frame by frame (Movement 9). */
  strike?: [number, number];
  /** The moment its blow lands. */
  hit?: number;
  /** A move that takes it across the floor (its swipe): how far forward it has gone at a moment (its own measure). */
  along?: (t: number) => number;
  /** When it is off the floor altogether (a leap; or gone into smoke): from when to when. */
  air?: [number, number];
  /** A move in which it goes into smoke: how far it is gone at a moment (0 all there, 1 all smoke). */
  gone?: (t: number) => number;
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
 * and rolls; but a raking arm's (`raking`, 1 its left, -1 its right, 2 both) out from its side and up, so that as the claw sweeps
 * across before it the arm swings round in front of its chest, not through it.
 */
function elbowsOf(q: Bones, raking = 0, outK = 1): Bones {
  const o = { ...q };
  const [f, l, u] = solve(DEMON_B, o as Posed).hips;
  const back = (side: number): V3 => [-12 * f[0] + side * l[0], -12 * f[1] + side * l[1], -12 * f[2] + side * l[2]];
  const out = (side: number): V3 => [side * 12 * l[0] + 6 * u[0] - 2 * f[0], side * 12 * l[1] + 6 * u[1] - 2 * f[1], side * 12 * l[2] + 6 * u[2] - 2 * f[2]];
  // (swung round from back to out as the claw lifts, `outK` of the way: the way it points eased from the one to the other,
  // not its angle, which goes the short way round or the long way by turns)
  const turned = (side: 1 | -1, left: boolean): number => {
    const k = (raking === side || raking === 2) && outK > 0 ? Math.min(1, outK) : 0;
    const b = back(side);
    const w = out(side);
    return elbowFor(DEMON_B, o as Posed, left, [b[0] * (1 - k) + w[0] * k, b[1] * (1 - k) + w[1] * k, b[2] * (1 - k) + w[2] * k]);
  };
  o.le = turned(1, true);
  o.re = turned(-1, false);
  return o;
}
const S0 = DEMON_STANCE;
/**
 * Its face kept where its neck can tell which way it is turned (found making its swipes, 27 Oct): short of as far up off its
 * back as its neck lets it look (DEMON_B.neckUp), and never behind its back's own forward, as it is when that back is curled
 * over far, its head down between its shoulders. Past either the solver can no longer tell, and the head swings round from
 * one side to the other. Its face lowered as far as it must be to keep there; no further.
 */
const NECK_SAFE = 81;
const NECK_AHEAD = 0.2;
function neckSafe(q: Bones): Bones {
  const s = solve(DEMON_B, q as Posed);
  const D = Math.PI / 180;
  const t = (q.faceTurn ?? 0) * D;
  // (where its face looks, `fu` up and turned `t`, against its upper back's forward and its up: a cos(fu - phase))
  const wave = (ax: V3): { r: number; ph: number } => {
    const A = ax[0] * Math.cos(t) + ax[1] * Math.sin(t);
    const B = ax[2];
    return { r: Math.hypot(A, B), ph: Math.atan2(B, A) };
  };
  const f = wave(s.upper[0]);
  const u = wave(s.upper[2]);
  let most = Infinity;
  // (ahead of its back's forward: r cos(fu - ph) at least NECK_AHEAD)
  if (f.r > NECK_AHEAD) most = Math.min(most, f.ph + Math.acos(NECK_AHEAD / f.r));
  // (short of its back's up: r cos(fu - ph) no more than sin NECK_SAFE, coming up to it from below)
  const sn = Math.sin(NECK_SAFE * D);
  if (u.r > sn) most = Math.min(most, u.ph - Math.acos(sn / u.r));
  const fu = q.faceUp * D;
  return fu > most ? { ...q, faceUp: most / D } : q;
}

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
    rake: { side, up: [RK.lift * FR, (RK.down - 2) * FR], minZ: 20 },
    strike: [(RK.held - 1) * FR, (RK.freeze + 1) * FR],
    hit: RAKE_HIT,
  };
}

// ---- TAP AND HOLD: DAMNING, TORN UP. His word of the first (it reared up, slammed down, and chains dragged its foes under the
// floor), 27 Oct: “Nope.  Uh you can’t just take the enemies away, what if it doesn’t do enough damage to kill them?  And
// that animation is bad anyway.  Gonna have to go back to the drawing board for DAMN.  What were the other options for
// possible attacks?”; of four new ways, “Cash-in eruption (Recommended)”; what was worst of the first, “The rear-up and slam
// (Recommended),The effects”; its own move, “Tear it up (Recommended)”. So: it drives both claws down into the floor and
// they bite into it; it heaves back against them, straining, its wings mantled over it, as its fire builds (the hold); then
// in a flash (Movement 9) it rips them up out of the floor and up before its chest, roaring, its wings snapped open, and
// freezes (Movement 6); as it does, the ground bursts open under every one cursed or burning, all their burns at once,
// knocking them up and back (dev/demon_fx.ts damningLight); it brings its claws down where they stood and settles.
/** Its frames, at thirty a second. */
export const DM = { raise: 5, dig: 8, strain: 14, heave: 21, held: 22, rip: 24, freeze: 26, down: 35, settled: 46 };
export const DAMN_HIT = DM.rip * FR;
export const DAMN_LONG = 48 * FR;
function damningMotion(): Motion {
  const at = [0, DM.raise, DM.dig, DM.strain, DM.heave, DM.held, DM.rip, DM.freeze, DM.down, DM.settled];
  // (still at the top of its raise, where it digs in and where it holds against them, as it lands from the rip, as its claws
  // come down and as it settles)
  const holds = new Set([1, 2, 5, 6, 7, 8, 9]);
  const key = (vals: number[], t: number): number => track(at.map((f, i) => [f * FR, vals[i]] as const), t, holds);
  /** Each claw: raised a little, driven down into the floor ahead of where it stands, held there; ripped up before its chest; down where it stood. */
  const claw = (side: 1 | -1, k: 0 | 1 | 2, t: number): number => {
    const own = side > 0 ? [S0.lhx, S0.lhy, 7] : [S0.rhx, S0.rhy, 7];
    const dug = [own[0] + 7, own[1] + side * 3, 7];
    const raised = [own[0] + 4, own[1] + side * 2, 21];
    const ripped = [own[0] - 2, own[1] + side * 9, 52];
    const pts = [own, raised, dug, dug, dug, dug, ripped, ripped, own, own];
    return track(at.map((f, i) => [f * FR, pts[i][k]] as const), t, holds);
  };
  // (straining: a tremble through it as it heaves against its own claws)
  const shake = (t: number): number => {
    const f = t / FR;
    return f > DM.strain && f < DM.held ? Math.sin(f * 2.9) * Math.sin((Math.PI * (f - DM.strain)) / (DM.held - DM.strain)) : 0;
  };
  const keys: Key3[] = [];
  for (let f = 0; f <= 48; f++) {
    const t = f * FR;
    const pose: Bones = {
      ...S0,
      // (driving down onto its claws; heaving back against them, its back arched up, its head down between its shoulders;
      // ripped up and back, its chest thrown up, its head flung up roaring; down onto its claws again)
      px: S0.px + key([0, 1, 3, -2, -5, -5, -4, -4, 1, 0], t) + 0.6 * shake(t),
      pz: S0.pz + key([0, 0.5, -2.5, -1, 0.5, 0.5, 5, 5, -2, 0], t),
      pitch: S0.pitch + key([0, 1, 4, 0, -3, -3, -10, -10, 3, 0], t),
      roll: 1.2 * shake(t),
      bend: S0.bend + key([0, 1, 4, 8, 11, 11, -8, -8, 4, 0], t),
      hunch: (S0.hunch ?? 0) + key([0, 2, 6, 10, 13, 13, -22, -22, 3, 0], t),
      shrug: (S0.shrug ?? 0) + key([0, 0.05, 0.15, 0.2, 0.25, 0.25, -0.15, -0.15, 0.05, 0], t),
      faceUp: S0.faceUp + key([0, 1, -4, -8, -10, -10, 20, 20, 2, 0], t),
      lhIn: 2, lhx: claw(1, 0, t), lhy: claw(1, 1, t), lhz: claw(1, 2, t),
      rhIn: 2, rhx: claw(-1, 0, t), rhy: claw(-1, 1, t), rhz: claw(-1, 2, t),
    };
    keys.push({ at: t, ease: 'lin', pose: elbowsOf(pose) });
  }
  return { keys, hit: DAMN_HIT };
}
const damnWings = wingsFrom((t) => {
  const f = t / FR;
  const at = [0, DM.dig, DM.strain, DM.heave, DM.held, DM.rip, DM.freeze, DM.down, DM.settled, 48];
  const k = (vals: number[]): number => track(at.map((g, i) => [g, vals[i]] as const), f, new Set([4, 6]));
  // (mantled up and forward over it as it strains, quivering; snapped wide open as it rips; settling)
  const quiver = f > DM.strain && f < DM.held ? 0.04 * Math.sin(f * 3.3) : 0;
  return {
    spread: k([1, 1.05, 1.2, 1.25, 1.25, 1.55, 1.55, 1.2, 1, 1]),
    beat: k([0, 0.05, 0.3, 0.38, 0.38, 0.5, 0.5, 0.1, 0, 0]) + quiver,
    sweep: k([0, -0.05, -0.3, -0.38, -0.38, 0.15, 0.15, 0.05, 0, 0]),
  };
});
const damnFire = (t: number, i: number): number => {
  const f = t / FR;
  // (its claws' fire building as it strains against them; its talons burning from the fire they are torn out of, and going out)
  if (i >= 10) return track([[DM.rip, 1.5], [DM.freeze + 1, 1.1], [DM.freeze + 6, 0.3]], f);
  // (under its palms, the fire held down as they bite into the floor, its heat running out into the cracks; flaring as it rips them up)
  return track([[0, 1], [DM.dig, 1.0], [DM.held, 1.5], [DM.rip, 2.2], [DM.down, 1.2], [DM.settled, 1]], f);
};
function damningMove(): DemonMove {
  return {
    name: 'Tap and hold: Damning',
    motion: damningMotion(),
    long: DAMN_LONG,
    loops: false,
    wings: damnWings,
    fire: damnFire,
    tail: (t) => {
      const f = t / FR;
      return 0.2 * Math.sin(f * 0.25) * (f < DM.rip ? 0.5 : 1) + (f > DM.rip ? 0.25 * Math.exp(-(f - DM.rip) / 8) : 0);
    },
    rake: { side: 0, up: [(DM.rip - 0.5) * FR, (DM.down - 2) * FR], minZ: 30 },
    strike: [(DM.held - 1) * FR, (DM.freeze + 1) * FR],
    hit: DAMN_HIT,
  };
}

// ---- SWIPE: ITS ESCAPE, SIX TILES THE WAY YOU SWIPE (as far as the other heroes' swipes). His word, 25 Oct: “I think smoke
// step but it’s much more violent.  But maybe pounce.  Let’s see both.”; of Damning, 27 Oct, “Good, on to the swipe
// (Recommended)”. Both here, each its own move.
export const SWIPE_REACH = 6 * UNITS_PER_TILE;
/** Keys of a body channel over frames, through `track`. */
const keyed = (at: readonly number[], holds: ReadonlySet<number>) => (vals: readonly number[], f: number): number => track(at.map((g, i) => [g, vals[i]] as const), f, holds);

// THE POUNCE. Big wind-up (Movement 9): it sinks down low on its haunches, its claws drawn in under it, its head down, its
// wings mantled tight, its haunches wriggling as a cat's do before it springs; still a beat. Then it springs: its legs
// fling it off the floor and it flies, stretched out long from its claws flung out ahead to its hooves kicked out behind,
// its wings snapped wide and beating down once, six tiles in a third of a second; its claws come down first and slam into
// the floor (its blow: the floor breaks under them), its weight drives down onto them, its hooves land behind; it skids a
// little on, crouched low over its claws, and rises roaring, its wings settling.
export const PN = { load: 6, coiled: 11, spring: 12, off: 14, apex: 19, reach: 23, land: 24, hold: 26, low: 28, roar: 33, up: 38, settled: 44 };
export const POUNCE_LONG = 46 * FR;
/** How high its leap takes it (its own measure), and how far it skids on as it lands. */
const POUNCE_HIGH = 64;
const SKID = 12;
/** When its hooves leave the floor and when it lands (frames). */
const LEAVE = 13;
/** How high it is off the floor in its leap at a frame. */
function pounceAir(f: number): number {
  const u = (f - LEAVE) / (PN.land - LEAVE);
  return u > 0 && u < 1 ? 4 * POUNCE_HIGH * u * (1 - u) : 0;
}
/** How far forward it has gone at a frame: pushed off over two frames, flying at one pace, skidding to a stop as it lands. */
export function pounceAlong(f: number): number {
  const v = (SWIPE_REACH - SKID) / (PN.land - PN.off + 1);
  if (f <= PN.spring) return 0;
  if (f <= PN.off) {
    const s = f - PN.spring;
    return (v / 4) * s * s;
  }
  if (f <= PN.land) return v + v * (f - PN.off);
  const u = Math.min(1, (f - PN.land) / 8);
  return SWIPE_REACH - SKID + SKID * (1 - (1 - u) * (1 - u));
}
function pounceMotion(): Motion {
  const at = [0, PN.load, PN.coiled, PN.spring, PN.off, PN.apex, PN.reach, PN.land, PN.hold, PN.low, PN.roar, PN.up, PN.settled];
  const k = keyed(at, new Set([2, 3, 7, 8, 9]));
  /** A claw: down where it stands until it springs; flung out ahead through the air; down on the floor ahead (where it then stays, as it skids on over it). */
  const claw = (side: 1 | -1, f: number): V3 => {
    const own = side > 0 ? { x: S0.lhx, y: S0.lhy } : { x: S0.rhx, y: S0.rhy };
    const down = side > 0 ? PN.land : PN.land + 1;
    // (where on the floor it comes down: where, once it has skidded on, it stands)
    const lands = SWIPE_REACH + own.x;
    if (f <= PN.spring + 0.5) return [own.x, own.y, 7];
    if (f >= down) return [lands - pounceAlong(f), own.y, 7];
    // (over where it comes down a frame before it does, and straight down onto it: never sliding as it lands)
    const over = down - 1;
    if (f >= over) return [lands - pounceAlong(f), own.y, 7 + (down - f) * 5];
    const x = track([[PN.spring + 0.5, own.x], [PN.off + 0.5, own.x + 12], [PN.apex, own.x + 32], [over, lands - pounceAlong(over)]], f);
    const y = own.y + side * track([[PN.spring + 0.5, 0], [PN.apex, -2], [over, 0]], f);
    const rel = track([[PN.spring + 0.5, 7], [PN.off + 0.5, 16], [PN.apex, 14], [over, 12 - pounceAir(over)]], f);
    return [x, y, Math.max(8, pounceAir(f) + rel)];
  };
  /** A hoof: down where it stands until it springs (its push); kicked out behind through the air; down again behind its claws. */
  const hoof = (side: 1 | -1, f: number): { x: number; z: number; p: number } => {
    const rest = side > 0 ? S0.lfx : S0.rfx;
    const down = side > 0 ? PN.hold : PN.hold + 1;
    const off = LEAVE + 0.5;
    if (f <= off) return { x: rest - pounceAlong(f), z: 0, p: 0 };
    if (f >= down) return { x: SWIPE_REACH + rest - pounceAlong(f), z: 0, p: 0 };
    // (over where it comes down a frame and a half before it does, flat, and straight down onto it)
    const over = down - 1.5;
    if (f >= over) return { x: SWIPE_REACH + rest - pounceAlong(f), z: 5 * ((down - f) / 1.5), p: 0 };
    const x = track([[off, rest - pounceAlong(off)], [PN.off + 2, rest - 26], [PN.apex + 1, rest - 18], [over, SWIPE_REACH + rest - pounceAlong(over)]], f);
    const rel = track([[off, 0], [PN.off + 2, 16], [PN.apex + 1, 12], [over, 5 - pounceAir(over)]], f);
    // (tipped down as it kicks back, only once it is up off the floor, and flat again before it comes down)
    const v = (f - off) / (over - off);
    return { x, z: Math.max(0, pounceAir(f) + rel), p: 30 * Math.sin(Math.PI * Math.min(1, v / 0.85)) * ease(v / 0.25) };
  };
  // (its haunches wriggling before it springs, as a cat's do: twice, side to side, dying away into the coil)
  const wriggle = (f: number): number => (f > 3 && f < PN.coiled ? Math.sin(((f - 3) / (PN.coiled - 3)) * Math.PI * 2) * Math.sin(((f - 3) / (PN.coiled - 3)) * Math.PI) : 0);
  const keys: Key3[] = [];
  for (let i = 0; i <= 46 * 2; i++) {
    const f = i / 2;
    const L = claw(1, f);
    const R = claw(-1, f);
    const lf = hoof(1, f);
    const rf = hoof(-1, f);
    const pose: Bones = {
      ...S0,
      px: S0.px + k([0, -5, -9, -9, 6, 10, 8, 6, 3, 3, 0, 0, 0], f),
      py: 2 * wriggle(f),
      pz: S0.pz + k([0, -8, -15, -15, 2, 4, 0, -8, -14, -14, -3, -1, 0], f) + pounceAir(f),
      // (sunk back on its haunches as it coils, its chest up, its eyes on where it will land)
      pitch: S0.pitch + k([0, -3, -6, -6, 0, 3, 4, 0, -2, -2, -6, -2, 0], f),
      roll: 4 * wriggle(f),
      twist: -3 * wriggle(f),
      bend: S0.bend + k([0, 3, 6, 6, -26, -24, -10, 4, 10, 10, 2, 0, 0], f),
      hunch: (S0.hunch ?? 0) + k([0, 1, 2, 2, -16, -14, -4, 4, 6, 6, -6, -2, 0], f),
      shrug: (S0.shrug ?? 0) + k([0, 0.1, 0.16, 0.16, 0.3, 0.25, 0.1, -0.05, 0.1, 0.1, 0.05, 0, 0], f),
      // (its eyes on where it will land as it sinks down, a cat's before it springs)
      faceUp: S0.faceUp + k([0, 1, 2, 2, 8, 6, 2, -2, -3, -3, 16, 4, 0], f),
      lhIn: 2, lhx: L[0], lhy: L[1], lhz: L[2],
      rhIn: 2, rhx: R[0], rhy: R[1], rhz: R[2],
      lfx: lf.x, lfz: lf.z, lfp: lf.p,
      rfx: rf.x, rfz: rf.z, rfp: rf.p,
    };
    keys.push({ at: f * FR, ease: 'lin', pose: elbowsOf(neckSafe(pose)) });
  }
  return { keys, hit: PN.land * FR };
}
const pounceWings = wingsFrom((t) => {
  const f = t / FR;
  const k = keyed([0, 6, 11, 12, 14, 17, 21, 24, 26, 33, 44], new Set([2, 3]));
  return {
    spread: k([1, 0.85, 0.75, 0.75, 1.55, 1.6, 1.35, 1.45, 1.4, 1.15, 1], f),
    beat: k([0, -0.05, -0.1, -0.1, 0.55, -0.25, 0.15, 0.4, 0.35, 0.1, 0], f),
    sweep: k([0, -0.15, -0.25, -0.25, 0.1, 0.25, 0.05, 0.3, 0.25, 0.05, 0], f),
    wind: f > PN.off && f < PN.land ? 0.3 : 0,
  };
});
function pounceMove(): DemonMove {
  return {
    name: 'Swipe: the pounce',
    motion: pounceMotion(),
    long: POUNCE_LONG,
    loops: false,
    wings: pounceWings,
    fire: (t, i) => (i >= 10 ? 1 : track([[0, 1], [PN.coiled * FR, 1.3], [PN.off * FR, 0.8], [PN.reach * FR, 0.9], [PN.land * FR, 2.2], [(PN.land + 6) * FR, 1.3], [PN.settled * FR, 1]], t)),
    tail: (t) => track([[0, 0], [6 * FR, 0.3], [9 * FR, -0.3], [11 * FR, 0.25], [14 * FR, -0.1], [24 * FR, 0], [26 * FR, 0.35], [32 * FR, -0.15], [44 * FR, 0]], t),
    // (the leap itself, from its spring to its landing, is the flash: Movement 9)
    strike: [(PN.coiled) * FR, (PN.hold + 1) * FR],
    hit: PN.land * FR,
    along: (t) => pounceAlong(t / FR),
    air: [LEAVE * FR, PN.land * FR],
  };
}

// THE SMOKE STEP, VIOLENT. Big wind-up: it hunkers down, its claws gouging the floor, its fire roaring up and its smoke boiling
// thick off its back, its shoulders rolling; then it BURSTS into smoke (in two frames, not melting away as the man does: a
// blast of smoke and fire where it stood), and a storm of black smoke and hellfire tears six tiles along the floor, raking
// and cursing whatever it passes through (dev/demon_swipe_fx.ts); at the far end it bursts out of the smoke, slamming its
// claws down, its wings snapped open, crouched low; and rises roaring, its wings settling.
export const SS = { coil: 5, coiled: 9, burst: 10, gone: 12, out: 20, slam: 22, hold: 24, low: 27, roar: 32, up: 37, settled: 44 };
export const STEP_LONG = 46 * FR;
/** How far along it has gone at a frame: across in the smoke, eased in and out. */
export function stepAlongAt(f: number): number {
  return SWIPE_REACH * ease((f - SS.burst) / (SS.slam - 0.5 - SS.burst));
}
/** How far it is gone into smoke at a frame. */
export function stepGoneAt(f: number): number {
  if (f < SS.coiled) return 0;
  if (f < SS.gone) return ease((f - SS.coiled) / (SS.gone - SS.coiled));
  if (f < SS.out) return 1;
  return 1 - ease((f - SS.out) / (SS.slam + 0.5 - SS.out));
}
function smokeStepMotion(): Motion {
  const at = [0, SS.coil, SS.coiled, SS.burst, SS.gone, SS.out, SS.slam, SS.hold, SS.low, SS.roar, SS.up, SS.settled];
  const k = keyed(at, new Set([2, 6, 7]));
  // (its shoulders rolling as it hunkers down: a menace)
  const prowl = (f: number): number => (f < SS.burst ? Math.sin((f / SS.burst) * Math.PI * 2) * Math.sin((f / SS.burst) * Math.PI) : 0);
  /** A claw: down where it stands as it coils; gone with it (lifted, in the smoke); raised as it bursts out, slammed down where it stands. */
  const claw = (side: 1 | -1, f: number): V3 => {
    const own = side > 0 ? { x: S0.lhx, y: S0.lhy } : { x: S0.rhx, y: S0.rhy };
    const slam = side > 0 ? SS.slam : SS.slam + 0.5;
    if (f <= SS.coiled + 0.5 || f >= slam) return [own.x, own.y, 7];
    const x = own.x + track([[SS.coiled + 0.5, 0], [SS.gone + 1, 6], [SS.out, 9], [slam, 0]], f);
    const z = track([[SS.coiled + 0.5, 7], [SS.gone + 1, 16], [SS.out, 22], [slam, 7]], f);
    return [x, own.y, z];
  };
  const hoofUp = (f: number): number => track([[SS.coiled + 0.5, 0], [SS.gone + 1, 6], [SS.out, 5], [SS.slam + 1.5, 0]], f, new Set([3]));
  const keys: Key3[] = [];
  for (let i = 0; i <= 46 * 2; i++) {
    const f = i / 2;
    const L = claw(1, f);
    const R = claw(-1, f);
    const pose: Bones = {
      ...S0,
      px: S0.px + k([0, -2, -4, -4, 0, 4, 4, 4, 2, 0, 0, 0], f),
      pz: S0.pz + k([0, -6, -10, -10, -4, 0, -6, -6, -11, -3, -1, 0], f),
      pitch: S0.pitch + k([0, -1, -2, -2, 0, 0, 0, 0, -2, -6, -2, 0], f),
      roll: 4 * prowl(f),
      twist: 6 * prowl(f),
      bend: S0.bend + k([0, 8, 14, 14, 0, -10, 4, 4, 10, 2, 0, 0], f),
      hunch: (S0.hunch ?? 0) + k([0, 8, 14, 14, 0, -6, 6, 6, 12, -6, -2, 0], f),
      shrug: (S0.shrug ?? 0) + k([0, 0.12, 0.2, 0.2, 0.1, 0.1, -0.05, -0.05, 0.1, 0.05, 0, 0], f) + 0.08 * Math.abs(prowl(f)),
      faceUp: S0.faceUp + k([0, -5, -9, -9, 0, 4, -4, -4, -6, 16, 4, 0], f),
      faceTurn: 8 * prowl(f),
      lhIn: 2, lhx: L[0], lhy: L[1], lhz: L[2],
      rhIn: 2, rhx: R[0], rhy: R[1], rhz: R[2],
      lfz: hoofUp(f), rfz: hoofUp(f - 0.5),
    };
    keys.push({ at: f * FR, ease: 'lin', pose: elbowsOf(neckSafe(pose)) });
  }
  return { keys, hit: SS.slam * FR };
}
const stepWings = wingsFrom((t) => {
  const f = t / FR;
  const k = keyed([0, 5, 9, 12, 20, 22, 24, 32, 44], new Set([2, 5, 6]));
  return {
    spread: k([1, 0.85, 0.75, 0.9, 1.4, 1.55, 1.5, 1.15, 1], f),
    beat: k([0, -0.05, -0.12, 0.1, 0.4, 0.5, 0.45, 0.1, 0], f),
    sweep: k([0, -0.2, -0.3, 0, 0.2, 0.3, 0.25, 0.05, 0], f),
  };
});
function smokeStepMove(): DemonMove {
  return {
    name: 'Swipe: the smoke step',
    motion: smokeStepMotion(),
    long: STEP_LONG,
    loops: false,
    wings: stepWings,
    fire: (t, i) => (i >= 10 ? 1 : track([[0, 1], [SS.coiled * FR, 1.8], [SS.burst * FR, 2.2], [SS.slam * FR, 2.2], [(SS.slam + 6) * FR, 1.3], [SS.settled * FR, 1]], t)),
    tail: (t) => track([[0, 0], [4 * FR, 0.3], [8 * FR, -0.3], [SS.burst * FR, 0], [SS.slam * FR, 0.3], [30 * FR, -0.12], [44 * FR, 0]], t),
    // (its bursting into smoke, the storm across and its bursting out of it are the flash: Movement 9)
    strike: [(SS.coiled - 1) * FR, (SS.hold + 1) * FR],
    hit: SS.slam * FR,
    along: (t) => stepAlongAt(t / FR),
    air: [(SS.coiled + 1) * FR, (SS.slam - 0.5) * FR],
    gone: (t) => stepGoneAt(t / FR),
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
    damningMove(),
    pounceMove(),
    smokeStepMove(),
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
  const wrist = m.rake ? (m.rake.side > 0 ? pose.lhz : m.rake.side < 0 ? pose.rhz : Math.min(pose.lhz, pose.rhz)) : 0;
  const raking = m.rake && tt >= m.rake.up[0] && tt <= m.rake.up[1] && wrist >= m.rake.minZ ? { side: m.rake.side } : undefined;
  // (a raking claw below the height it rakes at is drawn as a claw on the floor, lifted: its claws spread, clear of it)
  // (carried across the floor: its smoke streaming off behind it as it goes, as fast as it goes, but no further back than a run's: kept
  // inside its picture)
  const speed = m.along ? Math.min(RUN_CARRY, Math.abs(m.along(tt + FR / 2) - m.along(tt - FR / 2)) / FR) : 0;
  return demonFrame(view, pose as Bones, turn, { tail: m.tail?.(tt), paws: !!m.carry || !!m.rake || !!m.along, rake: raking }, m.wings(tt), t, fires, m.carry ?? speed);
}
