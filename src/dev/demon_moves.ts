// THE DEMON MOVING (the art chat, 27 Oct 2026). A MOCK-UP; NOTHING OF THE GAME IMPORTS IT.
//
// The warlock's demon form, on all fours (his word, 27 Oct, “Give me an all fours stance, gorilla like arms, claws flat on the
// floor burning with cyan flame and black smoke”), its face the beast's (his pick, “A, beast sharpened (Recommended)”). Its
// moves as the heroes' are: keys of its own bones (art/skeleton.ts Key3, bonesAt) from its stance (dev/sculpt_demon_rig.ts
// DEMON_FOURS), drawn by its sculpture a frame at a time. His art rulebook's Movement: weight first; each character its own
// way (its: a gorilla's, massive, its claws burning); loose things follow (its wings, the skin between their fingers); slick;
// alive when still; feet grip the floor, and so do its claws.

import { GRIP_SPEED, UNITS_PER_TILE } from '../art/moves3';
import { bonesAt, elbowFor } from '../art/skeleton';
import type { Bones, Key3, Motion, Posed } from '../art/skeleton';
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

/** Its elbows, turned back as a gorilla's (as DEMON_FOURS), for wherever its claws are. */
function elbowsOf(q: Bones): Bones {
  const o = { ...q };
  o.le = elbowFor(DEMON_B, o as Posed, true, [-12, 1, 0]);
  o.re = elbowFor(DEMON_B, o as Posed, false, [-12, -1, 0]);
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

// ---- RUNNING: A GORILLA'S GALLOP. Two claws reach and land, one a beat after the other, and its weight vaults over them;
// its legs swing through under it and land behind them; it springs off them into the air, its claws already reaching for
// the next. A round of 0.5 s, carried at a hero's own speed (4.6 tiles a second); every claw and hoof down flat on the floor
// stays where it is there, lifted before it goes on (Movement 8, feet grip the floor). Its wings half folded and swept
// back, lifting as it leaps; its head held level, looking ahead.
export const RUN_ROUND = 0.5;
export const RUN_CARRY = GRIP_SPEED * UNITS_PER_TILE;
/**
 * A limb through its round: down at `land` for `on` of it, at `ahead` (forward of where it stands), going back under it as
 * fast as the game carries it; then lifted, carried on, and set down again. Returns how far forward of where it stands, and
 * how high.
 */
function limb(ph: number, land: number, on: number, ahead: number, high: number, S: number): { x: number; z: number; v: number } {
  const q = (((ph - land) % 1) + 1) % 1;
  const back = S * on;
  if (q < on) return { x: ahead - S * q, z: 0, v: -1 };
  const v = (q - on) / (1 - on);
  // (lifted first, where it is; carried on; set down where it lands: no slide)
  const go = ease((v - 0.1) / 0.8);
  return { x: ahead - back + back * go, z: high * Math.pow(Math.sin(Math.PI * v), 0.8), v };
}
const HANDS = { L: { land: 0, on: 0.34 }, R: { land: 0.07, on: 0.34 } };
const FEET = { L: { land: 0.47, on: 0.32 }, R: { land: 0.53, on: 0.32 } };
export function demonRun(): Motion {
  const P = RUN_ROUND;
  const S = RUN_CARRY * P;
  const keys: Key3[] = [];
  const n = 30;
  for (let i = 0; i <= n; i++) {
    const ph = i / n;
    const lh = limb(ph, HANDS.L.land, HANDS.L.on, S * 0.17, 6.4, S);
    const rh = limb(ph, HANDS.R.land, HANDS.R.on, S * 0.17, 6.4, S);
    const lf = limb(ph, FEET.L.land, FEET.L.on, S * 0.15, 9, S);
    const rf = limb(ph, FEET.R.land, FEET.R.on, S * 0.15, 9, S);
    // (its weight: sunk onto its claws as they land, vaulting over them; sunk onto its legs; sprung off them into the air)
    const onHands = bump(ph, 0.02, 0.36);
    const onFeet = bump(ph, 0.5, 0.32);
    const leap = bump(ph, 0.76, 0.32);
    // (its back gathered as its legs swing through under it; stretched out long in the leap)
    const gather = bump(ph, 0.24, 0.4);
    const pose: Bones = {
      ...S0,
      px: S0.px + 1.5 * onHands - 1.0 * gather + 1.5 * leap,
      pz: S0.pz - 2.6 * onHands - 1.8 * onFeet + 3.2 * leap + 1.2 * gather,
      pitch: S0.pitch + 6 * onHands - 5 * onFeet - 2 * leap,
      roll: 2 * Math.sin((ph - 0.05) * Math.PI * 2),
      yaw: 2.5 * Math.sin((ph - 0.1) * Math.PI * 2),
      bend: S0.bend + 9 * gather - 5 * leap,
      hunch: (S0.hunch ?? 0) - 4 * leap + 3 * onHands,
      shrug: (S0.shrug ?? 0) + 0.12 * leap - 0.05 * onHands,
      // (its head held level as its body rocks under it)
      faceUp: S0.faceUp - 3 - 0.6 * (6 * onHands - 5 * onFeet - 2 * leap),
      faceTurn: 0,
      // (each claw lands well ahead of its shoulder, and is lifted as it passes back under it)
      lhIn: 2, lhx: S0.lhx + 12 + lh.x - S * 0.17, lhy: S0.lhy - 1.6 * Math.max(0, lh.z / 6.4), lhz: 7 + lh.z,
      rhIn: 2, rhx: S0.rhx + 12 + rh.x - S * 0.17, rhy: S0.rhy + 1.6 * Math.max(0, rh.z / 6.4), rhz: 7 + rh.z,
      // (each hoof tipped down as it swings, only once it is up off the floor: so it does not slide as it lifts)
      lfx: S0.lfx + lf.x, lfz: lf.z, lfp: lf.v < 0 ? 0 : 18 * Math.sin(Math.PI * lf.v) * ease(lf.v / 0.3),
      rfx: S0.rfx + rf.x, rfz: rf.z, rfp: rf.v < 0 ? 0 : 18 * Math.sin(Math.PI * rf.v) * ease(rf.v / 0.3),
    };
    keys.push({ at: ph * P, ease: 'lin', pose: elbowsOf(pose) });
  }
  return { keys, loop: 0 };
}
const runWings = wingsFrom((t) => {
  const ph = (((t / RUN_ROUND) % 1) + 1) % 1;
  const leap = bump(ph, 0.74, 0.34);
  const land = bump(ph, 0.02, 0.3);
  return { spread: 0.5 + 0.18 * leap, beat: -0.08 + 0.26 * leap - 0.1 * land, sweep: 0.42 - 0.12 * leap + 0.06 * land, wind: 0.3 };
});
const runFire = (t: number, i: number): number => {
  const ph = (((t / RUN_ROUND) % 1) + 1) % 1;
  // (each claw's fire flaring as it lands on the floor)
  const h = i < 5 ? HANDS.L : HANDS.R;
  return 0.85 + 0.6 * bump(ph, h.land, 0.22);
};

// (its tail: a slow swish as it stands, lashing as its claw slams down; swung after its body as it runs)
const standTail = (t: number): number => 0.22 * Math.sin((t / 2.4) * Math.PI * 2) + 0.18 * hump(t, SLAM, 0.6);
const runTail = (t: number): number => 0.16 * Math.sin((t / RUN_ROUND - 0.3) * Math.PI * 2);

export function demonMoves(): DemonMove[] {
  return [
    { name: 'The demon standing', motion: demonStand(), long: STAND_LONG, loops: true, wings: standWings, fire: standFire, tail: standTail },
    { name: 'The demon running', motion: demonRun(), long: RUN_ROUND, loops: true, travel: GRIP_SPEED, carry: RUN_CARRY, wings: runWings, fire: runFire, tail: runTail },
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
  return demonFrame(view, demonPose(m.motion, tt) as Bones, turn, { tail: m.tail?.(tt) }, m.wings(tt), t, fires);
}
