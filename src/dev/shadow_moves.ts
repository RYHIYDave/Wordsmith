// THE LIVING SHADOW MOVING (the Warlock chat, 11 Nov 2026). A MOCK-UP; NOTHING OF THE GAME IMPORTS IT.
//
// The warlock's new demon (dev/demon_ideas.ts shadowInto: his yes to its look, 11 Nov, “Yes, the hands are right
// (Recommended)”, “I like the Smokey wings”), on the werewolf's frame (dev/demon_new.ts WOLF_B), moving as he asked, 11 Nov:
// “I like that he’s on all fours, but really only when he’s running around.  Like he’s up on two legs to do really wide
// slashes with his claws, then when running he drops down to all fours like a feral beast”. His pick of how far the new demon
// may go from the game's: “A new design, same moves”; so what is new here is only what his words above change:
//
//   STANDING        up on two legs (DEMON_UP), alive when still (new: the game's demon stands on all fours)
//   THE SLASHES     its tap, left then right as the game's rakes are (his pick of 27 Oct, “Alternating rakes (Recommended)”),
//                   up on two legs and REALLY WIDE (new); to the game's own frames (dev/demon_moves.ts RK: the blow lands
//                   on the same frame, the move is as long), so the rules need no change
//   DROPPING DOWN   from its stand onto all fours into the run (new): the game's way of setting off (art/actor_types.ts
//                   AnimSet.start: pictures chosen by how far it has gone, sixty to a second of the run)
//   RUNNING         THE GAME'S RUN, AS IT IS (dev/demon_moves.ts demonRun: every word of his on it kept), on this frame
//   REARING UP      out of the run onto two legs to stand (new): the game's way of coming to a stand (AnimSet.stops: one
//                   for each of eight moments of the run)
//
// What else stands up (Damning, the smoke step's ends, how the change and the burning out end) is asked of him as each is
// made. His art rulebook's Movement: weight first; each character its own way (its: a feral beast's, huge in the shoulder,
// its claws what it fights with); loose things follow (its wings of smoke, its tail); slick; alive when still; heavy blows
// freeze; feet grip the floor, and so do its claws; big wind-up, lightning strike. Everything at thirty a second.

import { GRIP_SPEED, UNITS_PER_TILE } from '../art/moves3';
import { bonesAt, elbowFor, lerp3, norm, solve } from '../art/skeleton';
import type { Bones, Key3, Motion, Posed, V3 } from '../art/skeleton';
import type { GameView } from '../art/skin';
import type { Drawn } from './sculpt';
import { DEMON_FOURS } from './sculpt_demon_rig';
import { FR, RK, RUN_ROUND, demonRun, track } from './demon_moves';
import { DEMON_UP, WOLF_B } from './demon_new';
import type { Moving, WingsHeld } from './demon_new';
import { shadowFrame } from './demon_ideas';

export { FR };
/** Its stance up on two legs: what its stand, its slashes and its rearing up start from and end in. */
export const SHADOW_STANCE: Bones = DEMON_UP;
/** How fast the game carries it running (its own measure a second), as the game's demon. */
export const SHADOW_CARRY = GRIP_SPEED * UNITS_PER_TILE;

/** A move of its. */
export interface ShadowMove {
  name: string;
  motion: Motion;
  long: number;
  loops: boolean;
  /** What its keys are measured from. */
  rest: Bones;
  /** How fast the game carries it across the floor through the move (tiles a second), and the same in its own measure. */
  travel?: number;
  carry?: number;
  /** Its wings of smoke at a moment. */
  wings: (t: number) => WingsHeld;
  /** Its tail swung at a moment (radians). */
  tail?: (t: number) => number;
  /** Whether its claws are its feet at a moment (down on all fours: each drawn as a claw on the floor however high it swings). */
  paws?: (t: number) => boolean;
  /** How big the fires under its claws burn at a moment (on all fours; the left claw's are 0 to 4, the right's 5 to 9; 1 as at rest). */
  fire?: (t: number, i: number) => number;
  /** A slash: which claw (1 its left, -1 its right); the way that claw's palm faces at a moment (its talons leading the sweep) and how far hooked. */
  slash?: { side: 1 | -1; palm: (t: number) => V3; grip: (t: number) => number };
  /** Its other claw's fingers through a move, and both through its stand (1 as the still's). */
  grip?: (t: number, side: 1 | -1) => number;
  /** The strike itself, from the frame before it to the last frame of the freeze after it lands: a flash (Movement 9). */
  strike?: [number, number];
  /** The moment its blow lands. */
  hit?: number;
}

/** Eased both ways, 0 to 1. */
const ease = (u: number): number => {
  const c = Math.max(0, Math.min(1, u));
  return c * c * c * (c * (c * 6 - 15) + 10);
};
/** Eased both ways, 0 to 1, more gently (its pace in the middle half as much again as a straight line's, not twice). */
const smooth = (u: number): number => {
  const c = Math.max(0, Math.min(1, u));
  return c * c * (3 - 2 * c);
};
/** A soft bump over seconds, 0 to 1 and back. */
const hump = (t: number, at: number, long: number): number => (t > at && t < at + long ? 0.5 - 0.5 * Math.cos(((t - at) / long) * Math.PI * 2) : 0);
const clampN = (v: number, lo: number, hi: number): number => Math.max(lo, Math.min(hi, v));
const TAU = Math.PI * 2;

/** Its elbows up on two legs: back and a little out, as DEMON_UP has them; a slashing arm's (`out`: 1 its left, -1 its right) out from its side and up, `k` of the way. */
function upElbows(q: Bones, out: 0 | 1 | -1 = 0, k = 0): Bones {
  const o = { ...q };
  const want = (side: 1 | -1): V3 => {
    const w = out === side ? Math.min(1, Math.max(0, k)) : 0;
    return [-10 * (1 - w) - 4 * w, side * (8 * (1 - w) + 10 * w), 2 * (1 - w) + 9 * w];
  };
  o.le = elbowFor(WOLF_B, o as Posed, true, want(1));
  o.re = elbowFor(WOLF_B, o as Posed, false, want(-1));
  return o;
}
/** Its elbows on all fours, back along its own body as a gorilla's (as dev/demon_moves.ts elbowsOf, on this frame's bones). */
function foursElbows(q: Bones): Bones {
  const o = { ...q };
  const [f, l] = solve(WOLF_B, o as Posed).hips;
  const back = (side: number): V3 => [-12 * f[0] + side * l[0], -12 * f[1] + side * l[1], -12 * f[2] + side * l[2]];
  o.le = elbowFor(WOLF_B, o as Posed, true, back(1));
  o.re = elbowFor(WOLF_B, o as Posed, false, back(-1));
  return o;
}
/** A pose with nothing left on it of the way it was mixed (art/skeleton.ts bonesAt). */
function plain(p: Posed): Bones {
  const o = { ...p } as Record<string, unknown>;
  for (const k of ['from', 'to', 'mixK', 'lh2', 'rh2']) delete o[k];
  return o as unknown as Bones;
}

/** Its wings from a stroke over time: their tips trailing the stroke (loose things follow). */
function wingsFrom(stroke: (t: number) => { open: number; lift: number; sweep: number }): (t: number) => WingsHeld {
  return (t) => {
    const now = stroke(t);
    const was = stroke(t - 0.1);
    return {
      open: now.open,
      lift: now.lift,
      sweep: now.sweep,
      tip: clampN((now.sweep - was.sweep) * 1.2 + (now.lift - was.lift) * 26 + (now.open - was.open) * 14, -9, 12),
    };
  };
}

// ---- STANDING, UP ON TWO LEGS: ALIVE WHEN STILL (Movement 6). A round of 3.2 s: two heavy breaths, its great shoulders and
// its back heaving with each, its claws swinging a little under them; its weight rolled from one leg to the other and back;
// its head swung slowly to its left and its right, hunting; and its habit: its claws flexed open wide and hooked shut
// again, one and then the other, itching to slash. Its wings of smoke breathe with it; its tail swishes.
export const SHADOW_STAND_LONG = 3.2;
const BREATH = 1.6;
export function shadowStand(): Motion {
  const S0 = SHADOW_STANCE;
  const keys: Key3[] = [];
  const n = Math.round(SHADOW_STAND_LONG * 30);
  for (let i = 0; i <= n; i++) {
    const t = (i / n) * SHADOW_STAND_LONG;
    // (each of these is nothing at the round's start and its end: so its slashes and its rearing up end in its stance
    // exactly, and the round comes round with no jump)
    const br = 0.5 - 0.5 * Math.cos((t / BREATH) * TAU);
    const sway = Math.sin((t / SHADOW_STAND_LONG) * TAU);
    const look = Math.sin((t / SHADOW_STAND_LONG) * TAU) * (0.5 - 0.5 * Math.cos((t / SHADOW_STAND_LONG) * TAU));
    const pose: Bones = {
      ...S0,
      py: 1.3 * sway,
      pz: S0.pz + 1.5 * br,
      roll: 1.6 * sway,
      pitch: S0.pitch - 1.2 * br,
      bend: S0.bend - 2.2 * br,
      hunch: (S0.hunch ?? 0) - 6 * br,
      shrug: (S0.shrug ?? 0) + 0.1 * br,
      faceUp: S0.faceUp + 2.5 * br,
      faceTurn: 20 * look,
      faceTilt: -3 * sway,
      // (its claws hung from its shoulders: lifted and let down with them, swung a little out as its chest fills)
      lhx: S0.lhx - 1.4 * br, lhy: S0.lhy + 1.6 * br, lhz: S0.lhz + 0.8 * br,
      rhx: S0.rhx - 1.4 * br, rhy: S0.rhy - 1.6 * br, rhz: S0.rhz + 0.8 * br,
    };
    keys.push({ at: t, ease: 'lin', pose: upElbows(pose) });
  }
  return { keys, loop: 0 };
}
const standWings = wingsFrom((t) => {
  // (a beat behind its breath, as cloth is; mantled a little wider on the second)
  const br = 0.5 - 0.5 * Math.cos(((t - 0.18) / BREATH) * TAU);
  const second = hump(t, 1.7, 1.5);
  return { open: 1 + 0.07 * br + 0.08 * second, lift: 1 + 0.05 * br + 0.05 * second, sweep: 1.5 * Math.sin(((t - 0.4) / SHADOW_STAND_LONG) * TAU) };
});
/** Its claws flexed: its right's opened wide and hooked shut in the first breath, its left's in the second. */
const standGrip = (t: number, side: 1 | -1): number => {
  const at = side < 0 ? 0.35 : 1.95;
  return 1 - 0.5 * hump(t, at, 0.7) + 0.28 * hump(t, at + 0.42, 0.5);
};
const standTail = (t: number): number => 0.25 + 0.22 * Math.sin((t / SHADOW_STAND_LONG) * TAU - 0.8);

// ---- RUNNING: THE GAME'S RUN, AS IT IS (dev/demon_moves.ts demonRun: a gorilla's gallop, long and lopsided, every word of
// his on it kept), on this frame's bones: only its elbows are found again, for its longer arms and wider shoulders. Its
// wings of smoke swept back and beating once a stride, their tips trailing; its tail lashing; its fire under each claw.
export const SHADOW_RUN_ROUND = RUN_ROUND;
/** The game's run's stance (what its keys are measured from). */
const FOURS: Bones = DEMON_FOURS;
export function shadowRun(): Motion {
  const run = demonRun();
  return { keys: run.keys.map((k) => ({ ...k, pose: foursElbows({ ...FOURS, ...k.pose } as Bones) })), loop: 0 };
}
const wave = (ph: number, at: number): number => Math.cos((ph - at) * TAU);
const runWings = wingsFrom((t) => {
  const ph = (((t / RUN_ROUND) % 1) + 1) % 1;
  return { open: 0.78 + 0.16 * wave(ph, 0.8), lift: 0.8 + 0.2 * wave(ph, 0.78), sweep: 13 + 6 * wave(ph, 0.3) };
});
/** When each claw lands (of a round), as the game's run has them (dev/demon_moves.ts HANDS). */
const CLAW_LANDS = { L: 0, R: 0.1 };
const bump = (ph: number, at: number, long: number): number => {
  const d = (((ph - at) % 1) + 1) % 1;
  return d < long ? 0.5 - 0.5 * Math.cos((d / long) * TAU) : 0;
};
const runFire = (t: number, i: number): number => 0.8 + 0.7 * bump((((t / RUN_ROUND) % 1) + 1) % 1, i < 5 ? CLAW_LANDS.L : CLAW_LANDS.R, 0.22);
const runTail = (t: number): number => 0.24 * Math.sin((t / RUN_ROUND - 0.3) * TAU);

// ---- TAP: A REALLY WIDE SLASH (his word, 11 Nov: “he’s up on two legs to do really wide slashes with his claws”), its left
// claw, then its right (the game's two swings of a combo). Big wind-up, lightning strike (Movement 9): it rears up tall onto
// its back leg, its chest thrown open and wound right round, the slashing claw drawn far out to its side and back behind
// its shoulder, opened wide, its other claw up before it, its wings lifted; held a beat. Then in a flash (three frames) the
// claw comes ALL THE WAY ROUND: out wide at the full length of its arm, across before it and on past its other side, its
// hips and shoulders unwinding behind it, its whole weight thrown forward and down onto its front leg, its wings flung
// back; a freeze as it lands (Movement 7); it follows through, low over its claw, draws it back the way it went (not on
// round: his word of the first rakes, 27 Oct, “Now they do a full 360, what is that?”) and rises into its stance. To the
// game's rake's own frames (RK), so its blow lands when the game's does.
export const SLASH_HIT = RK.hit * FR;
export const SLASH_LONG = 31 * FR;
/**
 * The slashing claw's way, for its left (its right's the same, its sides swapped): from its own shoulder, how far forward, to
 * its left and up (art/skeleton.ts HandIn 1: the reach keeps its direction as the shoulder moves).
 */
const SLASH_HAND: Record<number, [number, number, number]> = {
  0: [DEMON_UP.lhx, DEMON_UP.lhy, DEMON_UP.lhz],
  [RK.lift]: [4, 31, -34],
  [RK.drawn]: [-27, 54, 8],
  [RK.held]: [-31, 54, 12],
  // (between the two it goes round its shoulder: slashHand)
  [RK.hit]: [38, -52, -15],
  [RK.freeze]: [38, -52, -15],
  [RK.through]: [48, -30, -24],
  [RK.back]: [30, 2, -38],
  [RK.down - 3]: [16, 14, -44],
  [RK.down]: [DEMON_UP.lhx, DEMON_UP.lhy, DEMON_UP.lhz],
};
const SLASH_FRAMES = Object.keys(SLASH_HAND).map(Number).sort((a, b) => a - b);
const SLASH_HOLDS = new Set([SLASH_FRAMES.indexOf(RK.held), SLASH_FRAMES.indexOf(RK.hit), SLASH_FRAMES.indexOf(RK.freeze)]);
/**
 * Where the slashing claw is at a moment. THROUGH THE SWING ITSELF it goes round its shoulder, not straight from key to key:
 * at the length of its arm all the way, the way it points turned from where it was held to where it lands (a straight cut
 * between them would pass in through its own chest).
 */
function slashHand(t: number): V3 {
  const f = t / FR;
  const at = (k: 0 | 1 | 2): number => track(SLASH_FRAMES.map((g) => [g * FR, SLASH_HAND[g][k]] as const), t, SLASH_HOLDS);
  if (f <= RK.held || f >= RK.hit) return [at(0), at(1), at(2)];
  // (round its shoulder: how far round from behind-left, by its left, before it, to its right; how high; how far out)
  const u = (f - RK.held) / (RK.hit - RK.held);
  const pol = (p: [number, number, number]): [number, number, number] => [Math.atan2(p[1], p[0]), p[2], Math.hypot(p[0], p[1])];
  const a = pol(SLASH_HAND[RK.held]);
  const b = pol(SLASH_HAND[RK.hit]);
  // (the long way round, by its front: from 2.1 round to -0.94)
  const w = u * u * (3 - 2 * u) * 0.35 + u * 0.65;
  const ang = a[0] + (b[0] - a[0]) * w;
  // (flung out to the full length of its arm in the middle of it)
  const r = a[2] + (b[2] - a[2]) * w + 4 * Math.sin(Math.PI * w);
  const z = a[1] + (b[1] - a[1]) * w - 3 * Math.sin(Math.PI * w);
  return [r * Math.cos(ang), r * Math.sin(ang), z];
}
/** The frames its body's keys are at: at rest, lifting, wound up, held, swinging, swinging, landed, held, through, drawing back, at rest. */
const SLASH_AT = [0, RK.lift, RK.drawn, RK.held, RK.swung, RK.swung2, RK.hit, RK.freeze, RK.through, RK.back, RK.down];
const slashBody = (vals: number[], t: number): number => track(SLASH_AT.map((f, i) => [f * FR, vals[i]] as const), t, new Set([3, 6, 7]));
function slashMotion(side: 1 | -1): Motion {
  const S0 = SHADOW_STANCE;
  const sgn = side;
  // (keys a frame apart, but four to a frame through the swing itself, so it sweeps its arc and not three straight cuts)
  const times: number[] = [];
  for (let f = 0; f <= 31; f++) {
    times.push(f * FR);
    if (f >= RK.held && f < RK.hit) for (let q = 1; q < 4; q++) times.push((f + q / 4) * FR);
  }
  const keys: Key3[] = [];
  for (const t of times) {
    const h = slashHand(t);
    // (the slashing claw's place is from its own rest: its right's rest is not its left's turned over)
    const own = sgn > 0 ? [S0.lhx, S0.lhy, S0.lhz] : [S0.rhx, S0.rhy, S0.rhz];
    const hand: V3 = [own[0] + (h[0] - SLASH_HAND[0][0]), own[1] + sgn * (h[1] - SLASH_HAND[0][1]), own[2] + (h[2] - SLASH_HAND[0][2])];
    // (its other claw: up before its chest as it winds up, a guard; thrown back and out behind it as it slashes)
    const oth = sgn > 0 ? [S0.rhx, S0.rhy, S0.rhz] : [S0.lhx, S0.lhy, S0.lhz];
    const ox = slashBody([0, 3, 9, 10, 2, -12, -22, -22, -12, -4, 0], t);
    const oy = slashBody([0, 2, 7, 8, 2, -8, -14, -14, -8, -2, 0], t);
    const oz = slashBody([0, 3, 13, 14, 8, 4, 6, 6, 4, 1, 0], t);
    const other: V3 = [oth[0] + ox, oth[1] + sgn * oy, oth[2] + oz];
    const pose: Bones = {
      ...S0,
      // (wound up: back onto its rear leg, drawn up tall, its chest open and turned right round toward the claw; the blow:
      // its hips and its shoulders thrown round the other way, forward and down onto its front leg)
      px: S0.px + slashBody([0, -1.5, -4, -4.5, 0, 7, 11, 11, 6, 1, 0], t),
      py: S0.py - sgn * slashBody([0, 1, 3, 3.5, 1, -1, -2.5, -2.5, -1, 0, 0], t),
      pz: S0.pz + slashBody([0, 1, 2.2, 2.5, 0, -4.5, -7, -7, -3.5, -1, 0], t),
      yaw: sgn * slashBody([0, 4, 10, 11, 3, -8, -15, -15, -8, -2, 0], t),
      twist: sgn * slashBody([0, 12, 32, 36, 12, -22, -46, -46, -26, -8, 0], t),
      pitch: S0.pitch + slashBody([0, -2, -6, -7, 2, 9, 13, 13, 7, 2, 0], t),
      roll: sgn * slashBody([0, 2, 5, 6, 0, -5, -8, -8, -4, -1, 0], t),
      bend: S0.bend + slashBody([0, -3, -7, -8, 0, 6, 10, 10, 5, 1, 0], t),
      hunch: (S0.hunch ?? 0) + slashBody([0, -6, -16, -18, -5, 4, 9, 9, 4, 0, 0], t),
      shrug: (S0.shrug ?? 0) + slashBody([0, 0.02, 0.08, 0.1, 0.05, 0, -0.05, -0.05, 0, 0, 0], t),
      // (its eyes on what it slashes all the while: its head lifted as it rears, thrust down and out as it lands)
      faceUp: S0.faceUp + slashBody([0, 3, 7, 8, 1, -5, -8, -8, -4, 0, 0], t),
      faceTurn: sgn * slashBody([0, 3, 6, 7, 2, -5, -10, -10, -5, -1, 0], t),
      faceTilt: sgn * slashBody([0, -2, -5, -6, 0, 5, 8, 8, 4, 0, 0], t),
      ...(sgn > 0
        ? { lhIn: 1, lhx: hand[0], lhy: hand[1], lhz: hand[2], rhIn: 1, rhx: other[0], rhy: other[1], rhz: other[2] }
        : { rhIn: 1, rhx: hand[0], rhy: hand[1], rhz: hand[2], lhIn: 1, lhx: other[0], lhy: other[1], lhz: other[2] }),
    };
    // (the slashing arm's elbow out from its side and up while the claw is off its hip: its arm swings round in front of
    // its chest, not through it)
    keys.push({ at: t, ease: 'lin', pose: upElbows(pose, sgn, track([[0, 0], [RK.drawn * FR, 1], [RK.freeze * FR, 1], [RK.down * FR, 0]], t)) });
  }
  return { keys, hit: SLASH_HIT };
}
/** The way the slashing claw's palm faces (for its left; forward, to its left, up): hung; turned to its foe, opened wide, as it winds up; leading the sweep; hung again. */
const HUNG: V3 = norm([-0.8, -0.55, -0.15]);
const SLASH_PALM: [number, V3][] = [
  [0, HUNG],
  [RK.lift, [-0.2, -0.7, -0.5]],
  [RK.drawn, [0.9, -0.4, 0.1]],
  [RK.held, [0.9, -0.35, 0.15]],
  [RK.swung, [0.55, -0.8, -0.1]],
  [RK.swung2, [-0.1, -1, -0.2]],
  [RK.hit, [-0.55, -0.75, -0.3]],
  [RK.freeze, [-0.55, -0.75, -0.3]],
  [RK.through, [-0.7, -0.6, -0.3]],
  [RK.back, HUNG],
  [31, HUNG],
];
const slashPalm = (side: 1 | -1) => (t: number): V3 => {
  const at = (k: 0 | 1 | 2): number => track(SLASH_PALM.map(([f, v]) => [f * FR, v[k]] as const), t);
  return norm([at(0), side * at(1), at(2)]);
};
const slashGrip = (t: number): number => track([[0, 1], [RK.lift * FR, 0.9], [RK.drawn * FR, 0.5], [RK.held * FR, 0.45], [RK.swung2 * FR, 1.0], [RK.hit * FR, 1.15], [RK.through * FR, 1.1], [RK.down * FR, 1]], t);
const slashWings = wingsFrom((t) => {
  const f = t / FR;
  const k = (vals: number[]): number => track(SLASH_AT.map((g, i) => [g, vals[i]] as const).concat([[31, vals[vals.length - 1]]]), f, new Set([3, 6, 7]));
  // (lifted and spread as it rears; flung back as it throws itself in; settling)
  return { open: k([1, 1.06, 1.22, 1.26, 1.2, 1.05, 0.92, 0.92, 1.0, 1.02, 1]), lift: k([1, 1.05, 1.2, 1.24, 1.12, 0.95, 0.82, 0.82, 0.94, 1.0, 1]), sweep: k([0, -1, -4, -5, 2, 10, 15, 15, 8, 2, 0]) };
});
function slashMove(side: 1 | -1): ShadowMove {
  return {
    name: side > 0 ? 'Tap: a wide slash, its left claw' : 'Tap again: a wide slash, its right claw',
    motion: slashMotion(side),
    long: SLASH_LONG,
    loops: false,
    rest: SHADOW_STANCE,
    wings: slashWings,
    tail: (t) => 0.25 - side * 0.45 * slashBody([0, 0.3, 0.8, 0.9, 0.2, -0.6, -1, -1, -0.5, -0.1, 0], t - 0.06),
    slash: { side, palm: slashPalm(side), grip: slashGrip },
    // (its other claw clenched as it guards, flung open as it is thrown back)
    grip: (t) => track([[0, 1], [RK.drawn * FR, 1.2], [RK.held * FR, 1.2], [RK.hit * FR, 0.7], [RK.back * FR, 1]], t),
    strike: [(RK.held - 1) * FR, (RK.freeze + 1) * FR],
    hit: SLASH_HIT,
  };
}

// ---- DROPPING DOWN ONTO ALL FOURS INTO THE RUN (his word, 11 Nov: “then when running he drops down to all fours like a
// feral beast”). The game's way of setting off (AnimSet.start): pictures sixty to a second of the run, chosen by how far it
// has gone, the game carrying it at its run's own pace from the first; so it is all thrown forward at once. It pitches
// forward off its back leg, its claws flung out ahead of it and down, its hooves driving it off the floor one after the
// other (each where it stood until it leaves it: feet grip the floor), and is in the run's own leap, stretched out long;
// its left claw lands, then its right, as the run's do, and the run goes on from there.
/** How many pictures (sixty to a second of the run), and the moment of the run's round it leads into: both claws just down (the run's seventh picture of its forty-two). */
export const DROP_PICTURES = 18;
export const DROP_INTO = 6 / 42;
export const DROP_LONG = DROP_PICTURES / 60;
/** The picture each hoof leaves the floor at (its rear, its right, first; then its front), and how many it takes to be the run's. */
const DROP_LEAVES = { R: 4, L: 7, join: 5 };
export function shadowDrop(): Motion {
  const run = shadowRun();
  const S0 = SHADOW_STANCE;
  const P = RUN_ROUND;
  const runAt = (ph: number): Bones => plain(bonesAt(run.keys, FOURS, ((((ph % 1) + 1) % 1) * P)));
  const S = solve(WOLF_B, S0 as Posed);
  const BODY = ['px', 'py', 'pz', 'yaw', 'pitch', 'roll', 'twist', 'bend', 'side', 'faceTurn', 'faceUp', 'faceTilt', 'lk', 'rk'] as const;
  const keys: Key3[] = [];
  for (let i = 0; i <= DROP_PICTURES; i++) {
    const t = i / 60;
    const ph = DROP_INTO - (DROP_PICTURES - i) / (P * 60);
    const r = runAt(ph);
    const R = solve(WOLF_B, r as Posed);
    // (its body from its stance into the run's over the first two thirds of it; its claws a little ahead of its body)
    const w = ease(i / (DROP_PICTURES * 0.66));
    const wh = ease(i / (DROP_PICTURES * 0.56));
    const pose: Bones = { ...r };
    for (const f of BODY) pose[f] = S0[f] + (r[f] - S0[f]) * w;
    pose.hunch = (S0.hunch ?? 0) + ((r.hunch ?? 0) - (S0.hunch ?? 0)) * w;
    pose.shrug = (S0.shrug ?? 0) + ((r.shrug ?? 0) - (S0.shrug ?? 0)) * w;
    // (a lurch as it goes over: up off its back leg and forward before it falls onto its claws)
    const lurch = Math.sin(Math.PI * Math.min(1, i / (DROP_PICTURES * 0.5)));
    pose.pz += 3.5 * lurch * (1 - w);
    pose.pitch += 5 * lurch;
    // (its claws: from where they hang to where the run has them, flung out forward on the way and not let down early)
    const l = lerp3(S.handL, R.handL, wh);
    const rr = lerp3(S.handR, R.handR, wh);
    const fling = Math.sin(Math.PI * wh) * (1 - 0.35 * wh);
    Object.assign(pose, { lhIn: 2, lhx: l[0] + 9 * fling, lhy: l[1] + 3 * fling, lhz: l[2] + 7 * fling, rhIn: 2, rhx: rr[0] + 9 * fling, rhy: rr[1] - 3 * fling, rhz: rr[2] + 7 * fling });
    // (its hooves: each where it stood, the floor going back under it as fast as the game carries it, until it leaves the
    // floor; then into the run's own swing)
    const hoof = (left: boolean): void => {
      const leaves = left ? DROP_LEAVES.L : DROP_LEAVES.R;
      const x0 = left ? S0.lfx : S0.rfx;
      const y0 = left ? S0.lfy : S0.rfy;
      const gone = (SHADOW_CARRY * Math.min(i, leaves)) / 60;
      const k = ease((i - leaves) / DROP_LEAVES.join);
      const rx = left ? r.lfx : r.rfx;
      const ry = left ? r.lfy : r.rfy;
      const rz = left ? r.lfz : r.rfz;
      const rp = left ? r.lfp : r.rfp;
      // (flat on the floor while it is on it, so it does not slide; kicked up behind, its toes down, as it leaves it)
      const push = i <= leaves ? 0 : 18 * Math.sin(Math.PI * Math.min(1, k * 1.4)) * (1 - k);
      const x = x0 - gone + (rx - (x0 - gone)) * k;
      const z = rz * k + (i > leaves ? 6 * Math.sin(Math.PI * k) : 0);
      if (left) Object.assign(pose, { lfx: x, lfy: y0 + (ry - y0) * k, lfz: z, lfp: push + rp * k });
      else Object.assign(pose, { rfx: x, rfy: y0 + (ry - y0) * k, rfz: z, rfp: push + rp * k });
    };
    hoof(true);
    hoof(false);
    keys.push({ at: t, ease: 'lin', pose: w < 0.5 ? upElbows(pose) : foursElbows(pose) });
  }
  return { keys };
}
const dropWings = wingsFrom((t) => {
  const u = t / DROP_LONG;
  const run = runWings(DROP_INTO * RUN_ROUND - (DROP_LONG - t));
  const w = ease(u / 0.7);
  // (thrown up and open as it goes over, then swept back as the run has them)
  const up = Math.sin(Math.PI * Math.min(1, u / 0.6));
  return { open: 1 + (run.open - 1) * w + 0.2 * up, lift: 1 + (run.lift - 1) * w + 0.15 * up, sweep: run.sweep * w - 3 * up };
});

// ---- REARING UP OUT OF THE RUN (the game's way of coming to a stand, AnimSet.stops: one for each of eight moments of the
// run, each from that moment into the first picture of its stand). Heavy, so slow to stop (Movement 1): its hooves bite,
// its claws come up off the floor as it throws its weight back and up, past where it stands (reared up tall, its head
// back, its wings thrown wide to brake), and it sinks into its stance, its claws swinging down to hang. A hoof on the
// floor stays where it is until it is lifted and set where it stands (never slid).
export const REARS = 8;
export const REAR_LONG = 14 * FR;
export function shadowRear(phase: number): Motion {
  const run = shadowRun();
  const S0 = SHADOW_STANCE;
  const from = plain(bonesAt(run.keys, FOURS, (((phase % 1) + 1) % 1) * RUN_ROUND));
  const R = solve(WOLF_B, from as Posed);
  const S = solve(WOLF_B, S0 as Posed);
  const BODY = ['px', 'py', 'pz', 'yaw', 'pitch', 'roll', 'twist', 'bend', 'side', 'faceTurn', 'faceUp', 'faceTilt', 'lk', 'rk'] as const;
  const n = Math.round(REAR_LONG / FR);
  // (which hoof steps first: one in the air comes straight down where it stands; of two on the floor, the further from its place)
  const off = (left: boolean): number => Math.hypot((left ? from.lfx - S0.lfx : from.rfx - S0.rfx), (left ? from.lfy - S0.lfy : from.rfy - S0.rfy));
  const up = (left: boolean): boolean => (left ? from.lfz : from.rfz) > 0.6;
  const leftFirst = up(true) !== up(false) ? up(true) : off(true) >= off(false);
  const keys: Key3[] = [];
  for (let f = 0; f <= n; f++) {
    const u = f / n;
    // (slow to start and slow to stop: a third of the way up before it is half way through)
    const w = smooth(u / 0.86);
    // (reared up past its stance and settling back into it)
    const over = (0.5 - 0.5 * Math.cos(TAU * clampN((u - 0.3) / 0.7, 0, 1))) * (1 - 0.3 * u);
    const pose: Bones = { ...from };
    for (const k of BODY) pose[k] = from[k] + (S0[k] - from[k]) * w;
    pose.hunch = (from.hunch ?? 0) + ((S0.hunch ?? 0) - (from.hunch ?? 0)) * w - 9 * over;
    pose.shrug = (from.shrug ?? 0) + ((S0.shrug ?? 0) - (from.shrug ?? 0)) * w;
    pose.pz += 3.5 * over;
    pose.px -= 2.5 * over;
    pose.pitch -= 6 * over;
    pose.bend -= 4 * over;
    pose.faceUp += 7 * over;
    // (its claws: up off the floor where they are, swung up and back to where they hang)
    const wh = smooth((u - 0.03) / 0.9);
    const l = lerp3(R.handL, S.handL, wh);
    const r = lerp3(R.handR, S.handR, wh);
    const swing = Math.sin(Math.PI * wh);
    Object.assign(pose, { lhIn: 2, lhx: l[0] + 4 * swing, lhy: l[1] + 5 * swing, lhz: l[2] + 9 * swing * (1 - wh), rhIn: 2, rhx: r[0] + 4 * swing, rhy: r[1] - 5 * swing, rhz: r[2] + 9 * swing * (1 - wh) });
    const hoof = (left: boolean): void => {
      const first = left === leftFirst;
      const [a, b] = first ? [0.0, 0.42] : [0.4, 0.82];
      const q = clampN((u - a) / (b - a), 0, 1);
      const fx = left ? from.lfx : from.rfx;
      const fy = left ? from.lfy : from.rfy;
      const fz = left ? from.lfz : from.rfz;
      const fp = left ? from.lfp : from.rfp;
      const tx = left ? S0.lfx : S0.rfx;
      const ty = left ? S0.lfy : S0.rfy;
      // (lifted straight up off the floor before it goes anywhere, and over its place before it comes straight down onto
      // it: never slid, lifting or landing; one already in the air goes at once)
      const k = fz > 0.6 ? smooth(q / 0.86) : smooth((q - 0.14) / 0.72);
      const z = fz * (1 - smooth(q)) + 4.5 * Math.sin(Math.PI * q);
      if (left) Object.assign(pose, { lfx: fx + (tx - fx) * k, lfy: fy + (ty - fy) * k, lfz: z, lfp: fp * (1 - k) + 8 * Math.sin(Math.PI * k) });
      else Object.assign(pose, { rfx: fx + (tx - fx) * k, rfy: fy + (ty - fy) * k, rfz: z, rfp: fp * (1 - k) + 8 * Math.sin(Math.PI * k) });
    };
    hoof(true);
    hoof(false);
    keys.push({ at: f * FR, ease: 'lin', pose: f === n ? { ...S0 } : w < 0.5 ? foursElbows(pose) : upElbows(pose) });
  }
  return { keys };
}
const rearWings = (phase: number): ((t: number) => WingsHeld) =>
  wingsFrom((t) => {
    const u = clampN(t / REAR_LONG, 0, 1);
    const run = runWings(phase * RUN_ROUND);
    const w = ease(u / 0.7);
    // (thrown wide and high to brake as it rears; settling)
    const brake = Math.sin(Math.PI * clampN((u - 0.1) / 0.9, 0, 1));
    return { open: run.open + (1 - run.open) * w + 0.3 * brake, lift: run.lift + (1 - run.lift) * w + 0.18 * brake, sweep: run.sweep * (1 - w) - 5 * brake };
  });

/** How high its wrist is when the claw under it is a claw on the floor (the game's run lifts it to 17): lower than this it is its foot. */
const PAW_BELOW = 24;

export function shadowMoves(): ShadowMove[] {
  const stand: ShadowMove = { name: 'The Living Shadow standing', motion: shadowStand(), long: SHADOW_STAND_LONG, loops: true, rest: SHADOW_STANCE, wings: standWings, tail: standTail, grip: standGrip };
  const run: ShadowMove = { name: 'The Living Shadow running', motion: shadowRun(), long: RUN_ROUND, loops: true, rest: FOURS, travel: GRIP_SPEED, carry: SHADOW_CARRY, wings: runWings, tail: runTail, paws: () => true, fire: runFire };
  const drop: ShadowMove = {
    name: 'Setting off: it drops onto all fours',
    motion: shadowDrop(),
    long: DROP_LONG,
    loops: false,
    rest: FOURS,
    travel: GRIP_SPEED,
    carry: SHADOW_CARRY,
    wings: dropWings,
    tail: (t) => 0.25 * (1 - ease(t / DROP_LONG)) + runTail(DROP_INTO * RUN_ROUND - (DROP_LONG - t)) * ease(t / DROP_LONG),
    // (its fire bursting up under each claw as it lands)
    fire: (t, i) => {
      const lands = DROP_LONG - ((DROP_INTO - (i < 5 ? CLAW_LANDS.L : CLAW_LANDS.R)) * RUN_ROUND);
      return t < lands ? 0.5 : 0.9 + 1.2 * Math.exp(-(t - lands) / 0.09);
    },
  };
  return [stand, run, slashMove(1), slashMove(-1), drop, ...Array.from({ length: REARS }, (_, i) => rearMove(i / REARS))];
}
function rearMove(phase: number): ShadowMove {
  return {
    name: `Coming to a stand: it rears up (from ${Math.round(phase * 100)}% of its stride)`,
    motion: shadowRear(phase),
    long: REAR_LONG,
    loops: false,
    rest: FOURS,
    wings: rearWings(phase),
    tail: (t) => runTail(phase * RUN_ROUND) * (1 - ease(t / REAR_LONG)) + (0.25 + 0.3 * hump(t, 0.05, 0.3)) * ease(t / REAR_LONG),
    fire: (t) => Math.max(0.25, 1 - t / (REAR_LONG * 0.5)),
  };
}

/** Its pose at a moment of a move. */
export function shadowPose(m: ShadowMove, t: number): Posed {
  return bonesAt(m.motion.keys, m.rest, t);
}
/** What a move asks its picture to be drawn with at a moment (dev/demon_new.ts Moving). */
export function shadowMoving(m: ShadowMove, t: number, pose: Posed): { paws: boolean; more: Moving } {
  const lowest = Math.min(solve(WOLF_B, pose).handL[2], solve(WOLF_B, pose).handR[2]);
  const paws = m.paws ? m.paws(t) : m.carry !== undefined || m.rest === FOURS ? lowest < PAW_BELOW : false;
  const more: Moving = { wings: m.wings(t) };
  if (m.slash) {
    const way = m.slash.palm(t);
    more.palm = m.slash.side > 0 ? { L: way } : { R: way };
  }
  const own = m.slash ? m.slash.grip(t) : undefined;
  const g = (side: 1 | -1): number | undefined => (m.slash && m.slash.side === side ? own : m.grip?.(t, side));
  more.grip = { L: g(1), R: g(-1) };
  if (m.fire) more.fire = (i) => (m.fire as NonNullable<ShadowMove['fire']>)(t, i);
  if (m.carry) more.carry = m.carry;
  return { paws, more };
}
/** Its picture at a moment of a move, from in front or behind, turned `turn`. */
export function drawShadowAt(view: GameView, m: ShadowMove, t: number, turn = 0, built?: Moving['built']): Drawn {
  const tt = m.loops ? ((t % m.long) + m.long) % m.long : Math.max(0, Math.min(m.long, t));
  const pose = shadowPose(m, tt);
  const { paws, more } = shadowMoving(m, tt, pose);
  return shadowFrame(view, pose as Bones, turn, t, m.tail ? m.tail(tt) : 0.25, paws, { ...more, built });
}
