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
//   SLASHING ON THE MOVE, ON TWO LEGS (his word of the film of the above, 11 Nov by 19:59: “This but I want him to be able
//                   to move around on two legs as he’s swiping”): each slash again with its legs striding under it, up
//                   on two legs, each of the four ways it may be going as it faces what it fights (new): the game's way
//                   of an attack made walking (AnimSet.clips.attackWalk, art/moves3.ts walkingOf)
//
//   ITS OTHER MOVES, ALL UP ON TWO LEGS (his word of 11 Nov by 19:59, asked of Damning, the smoke step, the change into it
//                   and burning out, offered as “up on two legs for everything but running”: “Yes, all on two legs
//                   (Recommended)”): each of the game's own (dev/demon_moves.ts, dev/warlock_change.ts, dev/warlock_hits.ts),
//                   to its own frames, beginning and ending in its stance up on two legs: DAMNING, torn up; THE SMOKE
//                   STEP's two ends; the end of THE CHANGE into it, its roar; the start of ITS BURNING OUT; STRUCK hard and
//                   from behind (the foot of this file)
//
// His art rulebook's Movement: weight first; each character its own way (its: a feral beast's, huge in the shoulder,
// its claws what it fights with); loose things follow (its wings of smoke, its tail); slick; alive when still; heavy blows
// freeze; feet grip the floor, and so do its claws; big wind-up, lightning strike. Everything at thirty a second.

import { GRIP_SPEED, UNITS_PER_TILE } from '../art/moves3';
import { TUNE } from '../game/defs';
import { bonesAt, elbowFor, lerp3, norm, solve } from '../art/skeleton';
import type { Bones, Key3, Motion, Posed, V3 } from '../art/skeleton';
import type { GameView } from '../art/skin';
import type { Drawn } from './sculpt';
import { DEMON_FOURS } from './sculpt_demon_rig';
import { BURN_OUT_LONG, DAMN_HIT, DAMN_LONG, DM, FR, RK, RUN_ROUND, SS, STEP_LONG, demonRun, stepAlongAt, stepGoneAt, track } from './demon_moves';
import { WSTRUCK } from './warlock_hits';
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
  /**
   * A move up on two legs in which its claws go down onto the floor (Damning; the smoke step's far end; its burning out):
   * each is drawn as a claw on the floor, spread flat, while its wrist is lower than PAW_BELOW, as when it runs (a claw
   * hung open that low has its talons down through the floor).
   */
  digs?: boolean;
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
  /**
   * A move made walking (a slash on the move): the way it goes as it faces its mark (degrees: 0 ahead, 90 to its left, 180
   * back, 270 to its right, as art/moves3.ts WALKS), and how far the game has carried it that way by a moment (its own measure).
   */
  way?: number;
  along?: (t: number) => number;
  /** Both claws' palms turned their own ways at a moment (a move that is no slash): its left's and its right's; not given, hung as they hang. */
  palms?: (t: number) => { L: V3; R: V3 };
  /** A move in which it goes into smoke (its swipe): how far it is gone at a moment (0 all there, 1 all smoke); and when it is off the floor altogether. */
  gone?: (t: number) => number;
  air?: [number, number];
  /** How bright what burns on it is at a moment (its eyes, its grin, its talons, the embers down its backbone): 1 as ever, 0 all but out (its burning out). */
  glow?: (t: number) => number;
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

// ---- SLASHING ON THE MOVE, ON TWO LEGS (his word of the film, 11 Nov by 19:59: “This but I want him to be able to move
// around on two legs as he’s swiping”). The game lets a hero walk through an attack, slowed for its first moment
// (game/defs.ts TUNE.attackSlow for attackSlowTime) and at its own pace after, and has the attack again for each of four ways
// the hero may be going as it faces its mark, its legs stepping that way (art/moves3.ts WALKS, walkingMotion). So each slash
// again, its chest, arms, head, wings and claws as they are standing, and under them TWO GREAT STRIDES, UP ON TWO LEGS, to
// the slash's own beat (weight first, Movement 1: “A blow plants the feet, turns the hips and carries through”):
//   as it winds up, its front hoof stays where it stands and its rear hoof comes up off the floor and swings through, the
//   way it goes;
//   it springs off its front hoof as the claw is held, and is off the floor as it swings;
//   ITS REAR HOOF COMES DOWN AS THE BLOW LANDS, far ahead, and takes its weight through the freeze and the follow-through;
//   as it draws its claw back its front hoof swings through and lands, its rear hoof gathers in behind it, and it is in its
//   stance again as the slash ends: legs and all, so that the next slash, its stand or its dropping down takes it up with
//   no jump.
// A hoof on the floor stays where it is on the floor (Movement 8), the floor going back under it as fast as the game
// carries it and the way it goes; it is lifted straight up before it goes anywhere and set straight down.
/** The four ways it may be going as it slashes (degrees to its left of the way it faces), as the heroes'. */
export const SLASH_WAYS = [0, 90, 180, 270];
/** When its hooves lift and land through a slash made walking (frames): the hoof that stays (`front`: going ahead, its front hoof, its left); the hoof that steps (`rear`), which lands as the blow does. */
const WALK_STEPS = { front: { lift: 9.4, land: 27.2 }, rear: { land: 13.3, lift: 23.3, gather: 29.5 } };
/** How far the stepping hoof lands on from where it stood, the way it goes (its own measure); how high a hoof is swung. */
const REAR_AHEAD = 38;
const STEP_HIGH = 11;
/** How far the game has carried it by a moment of an attack made walking: slowed for its first moment, at its own pace after. */
export function slashAlong(t: number): number {
  return SHADOW_CARRY * (TUNE.attackSlow * Math.min(t, TUNE.attackSlowTime) + Math.max(0, t - TUNE.attackSlowTime));
}
function walkingSlashMotion(side: 1 | -1, way: number): Motion {
  const S0 = SHADOW_STANCE;
  const slash = slashMotion(side);
  const c = Math.cos((way * Math.PI) / 180);
  const sn = Math.sin((way * Math.PI) / 180);
  const G = slashAlong(SLASH_LONG);
  const at = (f: number): number => slashAlong(f * FR);
  type P2 = readonly [number, number];
  /** A place on the floor, so much further gone by under it. */
  const back = (p: P2, g: number): P2 => [p[0] - g * c, p[1] - g * sn];
  /** A hoof swung from one place to another, `u` of the way through: forward, to its left, up, tipped. Straight up first and straight down last. */
  const swung = (a: P2, b: P2, u: number): [number, number, number, number] => {
    const k = smooth((u - 0.12) / 0.76);
    return [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, STEP_HIGH * Math.pow(Math.sin(Math.PI * clampN(u, 0, 1)), 0.8), 22 * Math.sin(Math.PI * clampN(u, 0, 1)) * c];
  };
  const down = (p: P2): [number, number, number, number] => [p[0], p[1], 0, 0];
  /** The hoof that stays where it stands through the wind-up, then swings through and lands as it comes back into its stance. */
  const stays = (home: P2, g: number): [number, number, number, number] => {
    // (backing away it is lifted a little sooner: its hips thrown back as it winds up leave it less room)
    const g1 = at(WALK_STEPS.front.lift - (c < -0.5 ? 1.2 : 0));
    const g2 = at(WALK_STEPS.front.land);
    if (g <= g1) return down(back(home, g));
    // (set down where, the floor gone back under it to the slash's end, it stands in its stance)
    const lands = back(home, -(G - g2));
    if (g < g2) return swung(back(home, g1), lands, (g - g1) / (g2 - g1));
    return down(back(lands, g - g2));
  };
  /** The hoof that steps at once, lands as the blow lands, and gathers in to where it stands as the slash ends. */
  const steps = (home: P2, g: number): [number, number, number, number] => {
    const g1 = at(WALK_STEPS.rear.land);
    const g2 = at(WALK_STEPS.rear.lift);
    const g3 = at(WALK_STEPS.rear.gather);
    // (backing away or going across, not so far: it lands behind or beside hips thrown forward into the blow, and going
    // across it has crossed under them)
    const ahead = back(home, -(c < 0.5 ? REAR_AHEAD * 0.74 : REAR_AHEAD));
    if (g < g1) return swung(home, ahead, g / g1);
    if (g <= g2) return down(back(ahead, g - g1));
    const lands = back(home, -(G - g3));
    if (g < g3) return swung(back(ahead, g2 - g1), lands, (g - g2) / (g3 - g2));
    return down(back(lands, g - g3));
  };
  // (WHICH HOOF STAYS: the one further on the way it is going, which has the room to be left behind as it goes; the other,
  // behind it, steps past it. Going ahead or to its left that is its front hoof, its left; backing away or going to its
  // right, its rear)
  const L: P2 = [S0.lfx, S0.lfy];
  const R: P2 = [S0.rfx, S0.rfy];
  const leftStays = L[0] * c + L[1] * sn >= R[0] * c + R[1] * sn;
  const frontAt = (g: number): [number, number, number, number] => (leftStays ? stays(L, g) : steps(L, g));
  const rearAt = (g: number): [number, number, number, number] => (leftStays ? steps(R, g) : stays(R, g));
  const keys: Key3[] = slash.keys.map((k) => {
    const t = k.at;
    const f = t / FR;
    const A = { ...S0, ...k.pose } as Bones;
    const g = slashAlong(t);
    const l = frontAt(g);
    const r = rearAt(g);
    // (into the going, and out of it into its stance as the slash ends)
    const w = smooth(f / 5) * (1 - smooth((f - 27) / 4));
    // (off the floor between its front hoof's leaving it and its rear's landing, and again as it gathers)
    const air = (a: number, b: number): number => (f > a && f < b ? Math.sin((Math.PI * (f - a)) / (b - a)) : 0);
    const pose: Bones = {
      ...A,
      lfx: l[0], lfy: l[1], lfz: l[2], lfp: l[3],
      rfx: r[0], rfy: r[1], rfz: r[2], rfp: r[3],
      // (its hips: lower on its bent legs as it goes; the slash's own throw back, forward and down kept, a little less of it)
      px: A.px * 0.7,
      pz: S0.pz - 2.5 * w + (A.pz - S0.pz) * 0.6 + 3 * air(WALK_STEPS.front.lift, WALK_STEPS.rear.land) + 2 * air(WALK_STEPS.rear.lift, WALK_STEPS.front.land),
      // (leaning the way it goes)
      pitch: A.pitch + 5 * c * w,
      roll: A.roll - 3 * sn * w,
    };
    return { at: t, ease: 'lin', pose: upElbows(pose, side, track([[0, 0], [RK.drawn * FR, 1], [RK.freeze * FR, 1], [RK.down * FR, 0]], t)) };
  });
  return { keys, hit: SLASH_HIT };
}
const WAY_NAMES: Record<number, string> = { 0: 'going ahead', 90: 'going to its left', 180: 'backing away', 270: 'going to its right' };
function walkingSlashMove(side: 1 | -1, way: number): ShadowMove {
  const still = slashMove(side);
  return {
    ...still,
    name: `${still.name}, ${WAY_NAMES[way]} on two legs`,
    motion: walkingSlashMotion(side, way),
    // (its wings a little back with the going)
    wings: (t) => {
      const w = still.wings(t);
      const k = smooth(t / (5 * FR)) * (1 - smooth((t / FR - 27) / 4));
      return { ...w, sweep: w.sweep + 4 * k * Math.cos((way * Math.PI) / 180) };
    },
    way,
    along: slashAlong,
  };
}

// =====================================================================================================================
// ITS OTHER MOVES, ALL UP ON TWO LEGS (his word, 11 Nov by 19:59, asked of Damning, the smoke step, the change into it and
// burning out, offered as “up on two legs for everything but running”: “Yes, all on two legs (Recommended)”). Each is the
// game's own move (his “A new design, same moves”), to the game's own frames, so the rules need no change; what is new is
// only that each begins and ends in its stance up on two legs, and what a body up on two legs must do differently to make
// the same move.

/** A body's numbers over frames, smooth through each key and still at its holds (dev/demon_moves.ts track). */
const keyed = (at: readonly number[], holds: ReadonlySet<number> = new Set()) => (vals: readonly number[], f: number): number => track(at.map((g, i) => [g, vals[i]] as const), f, holds);
/** A place over frames, each of its three numbers so. */
const placed = (at: readonly number[], holds: ReadonlySet<number>, pts: readonly V3[], f: number): V3 => [0, 1, 2].map((k) => track(at.map((g, i) => [g, pts[i][k]] as const), f, holds)) as unknown as V3;
/** Where its claws hang in its stance (its own measure, from its place on the floor). */
const HANG = (() => {
  const s = solve(WOLF_B, SHADOW_STANCE as Posed);
  return { L: s.handL as V3, R: s.handR as V3 };
})();
/** A place for its left claw, the same for its right (its sides swapped). */
const mirror = (p: V3, side: 1 | -1): V3 => [p[0], side * p[1], p[2]];
/**
 * A pose of its up on two legs from its stance: its body's numbers changed by `body`, its claws at places of their own on the
 * floor's measure (art/skeleton.ts HandIn 2: a claw driven into the floor stays there whatever its body does), its elbows
 * found for where they are: back and a little out as it stands; out to its sides and up as it crouches over claws on the
 * floor (`low`, 0 to 1); out and down under arms flung up (`high`, 0 to 1).
 */
function upPose(body: Partial<Bones>, L: V3, R: V3, low = 0, high = 0): Bones {
  const q = { ...SHADOW_STANCE, ...body, lhIn: 2, lhx: L[0], lhy: L[1], lhz: L[2], rhIn: 2, rhx: R[0], rhy: R[1], rhz: R[2] } as Bones;
  const lo = clampN(low, 0, 1);
  const hi = clampN(high, 0, 1 - lo);
  const st = 1 - lo - hi;
  const want = (side: 1 | -1): V3 => [-10 * st - 7 * lo - 8 * hi, side * (8 * st + 12 * lo + 12 * hi), 2 * st + 8 * lo + 0 * hi];
  q.le = elbowFor(WOLF_B, q as Posed, true, want(1));
  q.re = elbowFor(WOLF_B, q as Posed, false, want(-1));
  return q;
}
/** The way a claw's palm faces through a move (for its left; its right's the same, its sides swapped): keys of frames and ways. */
const palmsOf = (keys: readonly (readonly [number, V3])[]) => (t: number): { L: V3; R: V3 } => {
  const at = (k: 0 | 1 | 2): number => track(keys.map(([f, v]) => [f * FR, v[k]] as const), t);
  const p: V3 = [at(0), at(1), at(2)];
  return { L: norm(p), R: norm([p[0], -p[1], p[2]]) };
};
/** Palm down and a little forward, its talons out ahead: a claw about to be driven into the floor. */
const PALM_DOWN: V3 = [0.3, -0.35, -0.9];
/** Palm to its foe, its talons up: a claw flung up open. */
const PALM_OUT: V3 = [0.9, -0.3, -0.15];
/** How far it is sunk from its stance at which it is as low as it crouches (its own measure). */
const CROUCH = 15;
/** How wide its knees are turned out as it crouches (degrees more than in its stance). */
const KNEES_OUT = 16;

// ---- TAP AND HOLD: DAMNING, TORN UP (the game's: dev/demon_moves.ts damningMove; his pick of its move, 27 Oct, “Tear it up
// (Recommended)”; and what was worst of the first Damning, “The rear-up and slam (Recommended),The effects”: so NO REAR-UP AND
// SLAM here either). From its stance up on two legs it gathers itself a moment, its claws drawn up and opened; then DROPS
// into a crouch, driving both claws down into the floor before it, and they bite; it heaves back against them, straining,
// its back arched up and its head down between its shoulders, its wings mantled up and forward over it, quivering, as its
// fire builds under its palms (the hold); then in a flash (Movement 9) it TEARS THEM UP OUT OF THE FLOOR AND IS UP ON TWO
// LEGS AGAIN, risen tall, its claws flung up and wide and open, its chest thrown open, its head flung back roaring, its
// wings snapped open, and freezes (Movement 7); and it lets its arms down and settles into its stance. To the game's own
// frames (DM): its claws bite, it holds and its blow lands when the game's do.
/** Where its claws bite into the floor (its own measure, forward and to its left; its right's the same, its sides swapped). */
export const DAMN_DIG: V3 = [44, 20, 7];
const DAMN_AT = [0, DM.raise, DM.dig, DM.strain, DM.heave, DM.held, DM.rip, DM.freeze, DM.down, DM.settled, 48];
/** (still as it gathers, where it digs in, where it holds against them, through the freeze, and settled) */
const DAMN_HOLDS = new Set([1, 2, 5, 6, 7, 9, 10]);
function shadowDamningMotion(): Motion {
  const S0 = SHADOW_STANCE;
  const k = keyed(DAMN_AT, DAMN_HOLDS);
  const claw = (side: 1 | -1, f: number): V3 => {
    const own = side > 0 ? HANG.L : HANG.R;
    const gathered: V3 = [own[0] - 5, own[1] * 0.92, own[2] + 12];
    const dug = mirror(DAMN_DIG, side);
    // (flung up and out to its sides, a V over its head: not out before it, where from in front they are lost against its chest)
    const torn = mirror([-2, 58, 124], side);
    const let_: V3 = [own[0] - 6, own[1] * 1.3, own[2] + 26];
    return placed(DAMN_AT, DAMN_HOLDS, [own, gathered, dug, dug, dug, dug, torn, torn, let_, own, own], f);
  };
  // (straining: a tremble through it as it heaves against its own claws)
  const shake = (f: number): number => (f > DM.strain && f < DM.held ? Math.sin(f * 2.9) * Math.sin((Math.PI * (f - DM.strain)) / (DM.held - DM.strain)) : 0);
  const keys: Key3[] = [];
  for (let f = 0; f <= 48; f++) {
    if (f === 0 || f === 48) {
      keys.push({ at: f * FR, ease: 'lin', pose: { ...S0 } });
      continue;
    }
    const sunk = k([0, -1.5, 17, 15.5, 13, 13, -2, -2, -0.5, 0, 0], f);
    const L = claw(1, f);
    const R = claw(-1, f);
    const body: Partial<Bones> = {
      // (thrown forward and down onto its claws; heaving back against them; torn up and back onto its legs, tall)
      px: S0.px + k([0, -1.5, 5, 2, -3, -3, -2, -2, 0, 0, 0], f) + 0.6 * shake(f),
      pz: S0.pz - sunk,
      pitch: S0.pitch + k([0, -3, 26, 23, 17, 17, -11, -11, -1, 0, 0], f),
      roll: 1.2 * shake(f),
      bend: S0.bend + k([0, -3, 20, 26, 31, 31, -14, -14, -2, 0, 0], f),
      hunch: (S0.hunch ?? 0) + k([0, -8, 8, 14, 18, 18, -30, -30, -5, 0, 0], f),
      shrug: (S0.shrug ?? 0) + k([0, 0.05, 0.1, 0.15, 0.2, 0.2, -0.35, -0.35, -0.05, 0, 0], f),
      // (its eyes on its claws as they bite; its head down between its shoulders as it strains; flung up roaring)
      faceUp: S0.faceUp + k([0, 5, -10, -16, -20, -20, 24, 24, 4, 0, 0], f),
      lk: S0.lk + KNEES_OUT * clampN(sunk / CROUCH, 0, 1),
      rk: S0.rk - KNEES_OUT * clampN(sunk / CROUCH, 0, 1),
    };
    keys.push({ at: f * FR, ease: 'lin', pose: upPose(body, L, R, sunk / CROUCH, (Math.min(L[2], R[2]) - 70) / 30) });
  }
  return { keys, hit: DAMN_HIT };
}
const damningWings = wingsFrom((t) => {
  const f = t / FR;
  const k = keyed([0, DM.raise, DM.dig, DM.strain, DM.heave, DM.held, DM.rip, DM.freeze, DM.down, DM.settled, 48], new Set([5, 6, 7, 9, 10]));
  // (mantled up and forward over it as it strains, quivering; snapped wide open as it tears them up; settling)
  const quiver = f > DM.strain && f < DM.held ? 0.035 * Math.sin(f * 3.3) : 0;
  return {
    open: k([1, 1.04, 0.96, 1.12, 1.2, 1.2, 1.42, 1.42, 1.12, 1, 1], f),
    lift: k([1, 1.05, 0.92, 1.12, 1.2, 1.2, 1.32, 1.32, 1.06, 1, 1], f) + quiver,
    sweep: k([0, 1, 2, -6, -9, -9, 8, 8, 3, 0, 0], f),
  };
});
function shadowDamningMove(): ShadowMove {
  return {
    name: 'Tap and hold: Damning, up on two legs',
    digs: true,
    motion: shadowDamningMotion(),
    long: DAMN_LONG,
    loops: false,
    rest: SHADOW_STANCE,
    wings: damningWings,
    tail: (t) => {
      const f = t / FR;
      return 0.25 + 0.2 * Math.sin(f * 0.25) * (f < DM.rip ? 0.5 : 1) * (1 - ease((f - DM.down) / 11)) + (f > DM.rip ? 0.25 * Math.exp(-(f - DM.rip) / 8) : 0);
    },
    // (his fire under its palms, held down as they bite into the floor, building as it strains against them)
    fire: (t) => track([[0, 1], [DM.dig, 1.0], [DM.held, 1.6], [DM.rip, 2.2]], t / FR),
    // (its claws opened wide as it gathers them and as it tears them up; hung again as it settles)
    // (and shut and turned back to hang as soon as they come down past its chest: held open there, from in front, its near claw is taken for one laid on its chest)
    grip: (t) => track([[0, 1], [DM.raise, 0.5], [DM.dig, 0.6], [DM.held, 0.6], [DM.rip, 0.42], [DM.freeze, 0.42], [DM.freeze + 4, 0.95], [DM.down, 1], [DM.settled, 1]], t / FR),
    palms: palmsOf([[0, HUNG], [DM.raise, PALM_DOWN], [DM.held, PALM_DOWN], [DM.rip, PALM_OUT], [DM.freeze, PALM_OUT], [DM.freeze + 2, [0.1, -0.5, -0.85]], [DM.freeze + 5, HUNG], [DM.settled, HUNG], [48, HUNG]]),
    strike: [(DM.held - 1) * FR, (DM.freeze + 1) * FR],
    hit: DAMN_HIT,
  };
}

// ---- SWIPE: THE SMOKE STEP'S TWO ENDS (the game's: dev/demon_moves.ts smokeStepMove; six tiles the way you swipe; between
// its ends it is the game's own storm of smoke and hellfire, dev/demon_swipe_fx.ts, not made again here). WHERE IT SETS OFF:
// from its stance it hunkers down on its haunches, its shoulders rolling, its claws drawn back beside them and clenched,
// its wings wrapped in round it; still a beat; and springs forward into smoke, its claws flung out ahead (it BURSTS into
// smoke, in two frames). WHERE IT COMES OUT: it bursts out of the smoke coming down, its claws raised, and SLAMS them into
// the floor before it (its blow), crouched low over them, its wings snapped open; a freeze; and it rises off them onto two
// legs, roaring, its claws flung out wide, and settles into its stance. To the game's own frames (SS).
/** Where its claws come down as it bursts out (its own measure, from where it then stands; its right's the same, its sides swapped). */
export const STEP_SLAM: V3 = [44, 20, 7];
const STEP_AT = [0, SS.coil, SS.coiled, SS.burst, SS.gone, SS.out, SS.slam, SS.hold, SS.low, SS.roar, SS.up, SS.settled, 46];
const STEP_HOLDS = new Set([2, 6, 7, 11, 12]);
function shadowStepMotion(): Motion {
  const S0 = SHADOW_STANCE;
  const k = keyed(STEP_AT, STEP_HOLDS);
  // (its shoulders rolling as it hunkers down: a menace)
  const prowl = (f: number): number => (f < SS.burst ? Math.sin((f / SS.burst) * Math.PI * 2) * Math.sin((f / SS.burst) * Math.PI) : 0);
  /** A claw: drawn back beside its haunches as it coils; flung out ahead as it goes; raised as it bursts out; slammed down (its right's half a frame after its left's); flung wide as it roars; hung. */
  const claw = (side: 1 | -1, f: number): V3 => {
    const own = side > 0 ? HANG.L : HANG.R;
    const slam = side > 0 ? SS.slam : SS.slam + 0.5;
    const at = [0, SS.coil, SS.coiled, SS.burst, SS.gone, SS.out, slam, SS.hold + 0.5, SS.low, SS.roar, SS.up, SS.settled, 46];
    const m = (p: V3): V3 => mirror(p, side);
    const down = m(STEP_SLAM);
    // (still, too, until it lifts them off the floor)
    return placed(at, new Set([...STEP_HOLDS, 8]), [own, m([12, 35, 32]), m([0, 38, 29]), m([4, 38, 31]), m([50, 26, 48]), m([40, 27, 64]), down, down, down, m([4, 63, 66]), m([24, 47, 50]), own, own], f);
  };
  /** A hoof: where it stands until it springs; drawn up under it while it is smoke; down again a frame and a half after its claws. */
  const hoof = (f: number): { z: number; p: number } => {
    const z = track([[SS.coiled + 0.5, 0], [SS.gone + 1, 8], [SS.out, 7], [SS.slam + 1.5, 0]], f, new Set([3]));
    return { z, p: 22 * Math.sin(Math.PI * clampN((f - SS.coiled - 0.5) / (SS.slam + 1 - SS.coiled), 0, 1)) * clampN(z / 3, 0, 1) };
  };
  const keys: Key3[] = [];
  for (let i = 0; i <= 46 * 2; i++) {
    const f = i / 2;
    if (i === 0 || i === 92) {
      keys.push({ at: f * FR, ease: 'lin', pose: { ...S0 } });
      continue;
    }
    const sunk = k([0, 8, 13, 13, 5, 8, 18, 18, 19.5, -2.5, -1, 0, 0], f);
    const L = claw(1, f);
    const R = claw(-1, f);
    const lf = hoof(f);
    const rf = hoof(f - 0.5);
    const body: Partial<Bones> = {
      px: S0.px + k([0, -2, -4, -4, 5, 6, 5, 5, 4, -1, 0, 0, 0], f),
      pz: S0.pz - sunk,
      pitch: S0.pitch + k([0, 6, 10, 10, 24, 22, 27, 27, 25, -10, -2, 0, 0], f),
      roll: 4 * prowl(f),
      twist: 6 * prowl(f),
      bend: S0.bend + k([0, 8, 14, 14, 4, 12, 22, 22, 26, -13, -3, 0, 0], f),
      hunch: (S0.hunch ?? 0) + k([0, 6, 12, 12, -4, 6, 10, 10, 15, -28, -6, 0, 0], f),
      shrug: (S0.shrug ?? 0) + k([0, 0.1, 0.2, 0.2, 0, 0, 0.05, 0.05, 0.1, -0.32, -0.06, 0, 0], f) + 0.08 * Math.abs(prowl(f)),
      faceUp: S0.faceUp + k([0, -4, -7, -7, 4, -6, -12, -12, -15, 24, 6, 0, 0], f),
      faceTurn: 8 * prowl(f),
      lfz: lf.z, lfp: lf.p, rfz: rf.z, rfp: rf.p,
      lk: S0.lk + KNEES_OUT * clampN(sunk / CROUCH, 0, 1),
      rk: S0.rk - KNEES_OUT * clampN(sunk / CROUCH, 0, 1),
    };
    // (crouched over its claws while they are on the floor; its elbows out under arms flung up as it roars)
    const low = f >= SS.slam ? sunk / CROUCH : 0;
    keys.push({ at: f * FR, ease: 'lin', pose: upPose(body, L, R, low, f > SS.low ? (Math.min(L[2], R[2]) - 52) / 14 : 0) });
  }
  return { keys, hit: SS.slam * FR };
}
const stepWings = wingsFrom((t) => {
  const f = t / FR;
  const k = keyed([0, SS.coil, SS.coiled, SS.gone, SS.out, SS.slam, SS.hold, SS.roar, SS.settled, 46], new Set([2, 5, 6]));
  // (wrapped in round it as it coils; thrown back as it springs; snapped open as it bursts out and slams down; flung wide as it roars; settling)
  return {
    open: k([1, 0.84, 0.72, 0.9, 1.4, 1.5, 1.45, 1.4, 1, 1], f),
    lift: k([1, 0.92, 0.84, 1.0, 1.3, 1.25, 1.2, 1.32, 1, 1], f),
    sweep: k([0, -3, -5, 14, 6, 3, 2, -3, 0, 0], f),
  };
});
function shadowStepMove(): ShadowMove {
  return {
    name: "Swipe: the smoke step's two ends, up on two legs",
    digs: true,
    motion: shadowStepMotion(),
    long: STEP_LONG,
    loops: false,
    rest: SHADOW_STANCE,
    wings: stepWings,
    tail: (t) => 0.25 + track([[0, 0], [4 * FR, 0.3], [8 * FR, -0.3], [SS.burst * FR, 0], [SS.slam * FR, 0.3], [30 * FR, -0.12], [44 * FR, 0]], t),
    // (his fire bursting up under its claws as they slam down, and dying back)
    fire: (t) => track([[SS.slam, 2.2], [SS.slam + 6, 1.3], [SS.roar - 1, 1]], t / FR),
    // (clenched as it coils; flung open as it goes, as it comes down and as it roars)
    grip: (t) => track([[0, 1], [SS.coiled, 1.3], [SS.gone, 0.6], [SS.out, 0.5], [SS.slam, 0.6], [SS.low, 0.6], [SS.roar, 0.42], [SS.up, 0.8], [SS.settled, 1]], t / FR),
    palms: palmsOf([[0, HUNG], [SS.coiled, HUNG], [SS.gone, PALM_DOWN], [SS.low, PALM_DOWN], [SS.roar, PALM_OUT], [SS.up, [-0.3, -0.6, -0.45]], [SS.settled, HUNG], [46, HUNG]]),
    // (its bursting into smoke, the storm across and its bursting out of it are the flash: Movement 9)
    strike: [(SS.coiled - 1) * FR, (SS.hold + 1) * FR],
    hit: SS.slam * FR,
    along: (t) => stepAlongAt(t / FR),
    air: [(SS.coiled + 1) * FR, (SS.slam - 0.5) * FR],
    gone: (t) => stepGoneAt(t / FR),
  };
}

// ---- THE END OF THE CHANGE INTO IT: ITS ROAR, UP ON TWO LEGS (the game's: dev/warlock_change.ts, the 1.4 s after he has
// become it, the demon heaving up off its claws and roaring; the change itself, him becoming it, is to be made on this
// frame with its eight sides). It has come up onto two legs in its stance; it gathers a moment, and ROARS: reared up
// tall, its chest thrown open, its arms flung out wide and back, its claws spread, its head thrust up and out, its wings
// thrown back and up and beaten forward and down hard, back, and forward again (as the game's, dev/warlock_change.ts
// wingsAt), shaking with it; and it sinks into its stance, its wings settling.
export const ROAR_LONG = 42 * FR;
const ROAR_F = { gather: 3, up: 7, held: 17, easing: 27, down: 37 };
const ROAR_KEYS = [0, ROAR_F.gather, ROAR_F.up, ROAR_F.held, ROAR_F.easing, ROAR_F.down, 42];
const ROAR_HOLDS = new Set([2, 3, 5, 6]);
function shadowRoarMotion(): Motion {
  const S0 = SHADOW_STANCE;
  const k = keyed(ROAR_KEYS, ROAR_HOLDS);
  const claw = (side: 1 | -1, f: number): V3 => {
    const own = side > 0 ? HANG.L : HANG.R;
    const wide = mirror([-3, 64, 52], side);
    return placed(ROAR_KEYS, ROAR_HOLDS, [own, [own[0] - 6, own[1] * 0.86, own[2] + 5], wide, wide, mirror([16, 55, 45], side), own, own], f);
  };
  // (shaking with its roar while it is held)
  const shake = (f: number): number => (f > ROAR_F.up - 1 && f < ROAR_F.easing ? Math.sin(f * 3.1) * Math.sin((Math.PI * (f - ROAR_F.up + 1)) / (ROAR_F.easing - ROAR_F.up + 1)) : 0);
  const keys: Key3[] = [];
  for (let f = 0; f <= 42; f++) {
    if (f === 0 || f === 42) {
      keys.push({ at: f * FR, ease: 'lin', pose: { ...S0 } });
      continue;
    }
    const L = claw(1, f);
    const R = claw(-1, f);
    const body: Partial<Bones> = {
      px: S0.px + k([0, 1, -2.5, -2.5, -1, 0, 0], f),
      pz: S0.pz + k([0, -3, 3.2, 3.2, 1.2, 0, 0], f),
      pitch: S0.pitch + k([0, 5, -12, -12, -4, 0, 0], f),
      roll: 1.0 * shake(f),
      bend: S0.bend + k([0, 4, -15, -15, -5, 0, 0], f),
      hunch: (S0.hunch ?? 0) + k([0, 6, -30, -30, -10, 0, 0], f),
      shrug: (S0.shrug ?? 0) + k([0, 0.1, -0.35, -0.35, -0.1, 0, 0], f),
      faceUp: S0.faceUp + k([0, -5, 22, 22, 8, 0, 0], f) + 1.5 * shake(f),
      faceTilt: 3 * shake(f),
    };
    keys.push({ at: f * FR, ease: 'lin', pose: upPose(body, L, R, 0, k([0, 0, 0.7, 0.7, 0.3, 0, 0], f)) });
  }
  return { keys };
}
const roarWings = wingsFrom((t) => {
  // (thrown back and up; beaten forward and down hard, back, forward again; settling: the game's own strokes at its roar)
  const tr = (keys: readonly (readonly [number, number])[]): number => track(keys, t - ROAR_F.gather * FR);
  const sweep = tr([[-0.05, 0], [0.2, 0.55], [0.38, -0.6], [0.58, 0.4], [0.76, -0.35], [0.98, 0.12], [1.15, 0]]);
  const beat = tr([[-0.05, 0], [0.2, 0.5], [0.38, -0.35], [0.58, 0.25], [0.76, -0.15], [1.15, 0]]);
  const open = tr([[-0.05, 1], [0.2, 1.4], [0.38, 1.22], [0.76, 1.12], [1.15, 1]]);
  return { open, lift: 1 + 0.55 * beat + 0.12 * (open - 1), sweep: 15 * sweep };
});
function shadowRoarMove(): ShadowMove {
  return {
    name: 'The change into it ends: it roars, up on two legs',
    motion: shadowRoarMotion(),
    long: ROAR_LONG,
    loops: false,
    rest: SHADOW_STANCE,
    wings: roarWings,
    tail: (t) => 0.25 + 0.35 * hump(t, ROAR_F.gather * FR, 0.5) - 0.2 * hump(t, 0.5, 0.6),
    grip: (t) => track([[0, 1], [ROAR_F.gather, 1.2], [ROAR_F.up, 0.42], [ROAR_F.held, 0.42], [ROAR_F.down, 1]], t / FR),
    palms: palmsOf([[0, HUNG], [ROAR_F.gather, HUNG], [ROAR_F.up, [0.75, 0.45, -0.2]], [ROAR_F.held, [0.75, 0.45, -0.2]], [ROAR_F.down, HUNG], [42, HUNG]]),
  };
}

// ---- THE METER RUNS DRY: IT BURNS OUT, FROM UP ON TWO LEGS (the game's: dev/demon_moves.ts burnOutMove; his picks, 27 Oct,
// “Burns out (Recommended)”, “Meter runs dry (Recommended)”). A last heavy breath; what burns on it gutters, flaring once
// and dying (its eyes, its grin, its talons, the embers down its backbone: it has no other fire up on two legs); and it
// SAGS DOWN OFF ITS LEGS ONTO ONE KNEE, its rear knee coming down onto the floor before the hoof that stays where it
// stands, its front knee left up, its head dropping, its shoulders slumping, its arms let down until its claws lie on
// the floor by its knees, its wings drooping and folding: where he is on one knee as it crumbles away from round him
// (dev/demon_return.ts crumble; dev/warlock_spells.ts comeBack: the game's own, as they are). As long as the game's.
const BURN_AT = [0, 10, 18, 30, 40, 52];
const BURN_HOLDS = new Set([4, 5]);
/** How far down it sinks onto its rear knee (its own measure), and how high that knee's joint is when it is on the floor. */
const KNEEL = { sink: 31, knee: 3.4 };
function shadowBurnOutMotion(): Motion {
  const S0 = SHADOW_STANCE;
  const k = keyed(BURN_AT, BURN_HOLDS);
  // (where its rear knee is in its stance, and where it rests on the floor: before its hock, as far from it as its shank is long)
  const st = solve(WOLF_B, S0 as Posed);
  const KNEE = { from: st.kneeR as V3, to: [st.ankleR[0] + Math.sqrt(WOLF_B.shank ** 2 - (WOLF_B.ankle - KNEEL.knee) ** 2), st.ankleR[1], KNEEL.knee] as V3 };
  const claw = (side: 1 | -1, f: number): V3 => {
    const own = side > 0 ? HANG.L : HANG.R;
    // (let down until they lie on the floor by its knees, and there they stay)
    return placed(BURN_AT, new Set([3, 4, 5]), [own, [own[0], own[1], own[2] + 1], [own[0] - 2, own[1] * 0.98, own[2] - 7], mirror([14, 40, 7], side), mirror([14, 40, 7], side), mirror([14, 40, 7], side)], f);
  };
  const keys: Key3[] = [];
  for (let f = 0; f <= 52; f++) {
    if (f === 0) {
      keys.push({ at: 0, ease: 'lin', pose: { ...S0 } });
      continue;
    }
    // (a last heavy breath before it goes)
    const br = f < 16 ? Math.sin((f / 16) * Math.PI) : 0;
    const sink = k([0, -0.5, 5, 21, KNEEL.sink, KNEEL.sink], f) - 1.2 * br;
    const down = clampN(sink / KNEEL.sink, 0, 1);
    const body: Partial<Bones> = {
      px: S0.px + k([0, 0, -0.5, -1, 0, 0], f),
      pz: S0.pz - sink,
      pitch: S0.pitch + k([0, 0, 3, 9, 12, 12], f),
      roll: k([0, 0, 1, 3, 4, 4], f),
      bend: S0.bend + k([0, 0, 6, 15, 20, 20], f) - 2 * br,
      hunch: (S0.hunch ?? 0) + k([0, 0, 5, 12, 16, 16], f) - 3 * br,
      shrug: (S0.shrug ?? 0) + k([0, 0, -0.15, -0.4, -0.5, -0.5], f) + 0.08 * br,
      faceUp: S0.faceUp + k([0, 1, -6, -18, -24, -24], f) + 3 * br,
      faceTilt: k([0, 0, 2, 6, 8, 8], f),
      lk: S0.lk + 8 * down,
    };
    const pose = upPose(body, claw(1, f), claw(-1, f), 0.25 * down);
    // (ITS REAR KNEE, its right: brought down onto the floor as it sinks, its hoof where it stands: the knee pointed, from
    // between its hip and its hock, at a place that goes from where the knee is in its stance to where it rests on the floor)
    const s = solve(WOLF_B, pose as Posed);
    const at = lerp3(KNEE.from, KNEE.to, smooth((down - 0.1) / 0.85));
    const mid = lerp3(s.hipR, s.ankleR, 0.5);
    const way: V3 = [at[0] - mid[0], at[1] - mid[1], at[2] - mid[2]];
    const D = 180 / Math.PI;
    keys.push({ at: f * FR, ease: 'lin', pose: { ...pose, rk: Math.atan2(way[1], way[0]) * D, rkUp: Math.atan2(way[2], Math.hypot(way[0], way[1])) * D } });
  }
  return { keys };
}
const burnOutWings = wingsFrom((t) => {
  const f = t / FR;
  const k = keyed(BURN_AT, BURN_HOLDS);
  // (drooping and folding in round it)
  return { open: k([1, 1.02, 0.92, 0.76, 0.66, 0.66], f), lift: k([1, 1.03, 0.9, 0.7, 0.6, 0.6], f), sweep: k([0, 0, 2, 5, 6, 6], f) };
});
function shadowBurnOutMove(): ShadowMove {
  return {
    name: 'Meter dry: it burns out, from up on two legs',
    digs: true,
    motion: shadowBurnOutMotion(),
    long: BURN_OUT_LONG,
    loops: false,
    rest: SHADOW_STANCE,
    wings: burnOutWings,
    tail: (t) => 0.25 * (1 - ease(t / BURN_OUT_LONG)) + 0.1 * Math.sin((t / BURN_OUT_LONG) * TAU) * (1 - t / BURN_OUT_LONG),
    // (its claws curled in as they are let down; no fire under them where they lie: it is going out)
    grip: (t) => track([[0, 1], [18, 1.1], [28, 1.35]], t / FR),
    fire: () => 0,
    // (what burns on it guttering: flaring once, and dying; as the game's demon's fire does)
    glow: (t) => {
      const f = t / FR;
      return clampN(track([[0, 1], [10, 0.8], [14, 1.0], [20, 0.55], [30, 0.3], [40, 0.12], [52, 0.1]], f) * (1 + 0.15 * Math.sin(f * 2.3)), 0, 1);
    },
  };
}

// ---- STRUCK HARD, AND STRUCK FROM BEHIND, UP ON TWO LEGS (the game's: dev/warlock_hits.ts demonStruck; 13 frames, the game
// showing a hit only a moment). STRUCK HARD: rocked back on its legs, its head snapped up and round, its arms thrown wide,
// its wings snapping open, its tail lashing; it comes back down into its stance, its head low. STRUCK FROM BEHIND: driven
// forward over its front leg, its wings flung wide, its head whipped up; it snaps its head round to glare back over its
// shoulder. Its hooves stay where they stand (Movement 8).
const HIT_HOLDS = new Set([1, 5]);
const hitKey = (vals: readonly number[], f: number): number => track(WSTRUCK.at.map((a, i) => [a, vals[i]] as const), f, HIT_HOLDS);
function shadowStruckMove(behind: boolean): ShadowMove {
  const S0 = SHADOW_STANCE;
  const long = WSTRUCK.end * FR;
  const keys: Key3[] = [];
  const n = Math.round(long * 60);
  const b = behind;
  for (let i = 0; i <= n; i++) {
    const t = Math.min(long, i / 60);
    const f = t / FR;
    if (i === 0 || i === n) {
      keys.push({ at: t, ease: 'lin', pose: { ...S0 } });
      continue;
    }
    // (its arms thrown by the blow: from its shoulders, the way they are flung kept as its body rocks; art/skeleton.ts HandIn 1)
    const ax = b ? hitKey([0, 0, 6, 4, 1.5, 0], f) : hitKey([0, 0, -9, -5, -1.5, 0], f);
    const ay = b ? hitKey([0, 0, 7, 4, 1, 0], f) : hitKey([0, 0, 9, 4, 1, 0], f);
    const az = b ? hitKey([0, 0, 15, 9, 2, 0], f) : hitKey([0, 0, 11, 4, 1, 0], f);
    const pose: Bones = {
      ...S0,
      px: S0.px + (b ? hitKey([0, 0, 3.6, 4.2, 1.5, 0], f) : hitKey([0, 0, -3.6, -4.2, -1.5, 0], f)),
      pz: S0.pz + (b ? hitKey([0, 0, -2.2, -3, -1, 0], f) : hitKey([0, 0, 1.8, -1.8, -0.5, 0], f)),
      pitch: S0.pitch + (b ? hitKey([0, 0, 9, 5, 1, 0], f) : hitKey([0, 0, -10, -3, 1, 0], f)),
      bend: S0.bend + (b ? hitKey([0, 0, 8, 4, 1, 0], f) : hitKey([0, 0, -9, 2, 1, 0], f)),
      hunch: (S0.hunch ?? 0) + (b ? hitKey([0, 0, 8, 3, 0, 0], f) : hitKey([0, 0, -14, 4, 2, 0], f)),
      roll: S0.roll + (b ? hitKey([0, 0, -2, 2, 1, 0], f) : hitKey([0, 0, 3, 1, 0, 0], f)),
      faceUp: S0.faceUp + (b ? hitKey([0, 0, 12, 2, 4, 0], f) : hitKey([0, 0, 16, -6, 4, 0], f)),
      faceTurn: S0.faceTurn + (b ? hitKey([0, 0, 6, -34, -52, 0], f) : hitKey([0, 0, -18, -6, 4, 0], f)),
      faceTilt: S0.faceTilt + (b ? hitKey([0, 0, 4, -6, -8, 0], f) : hitKey([0, 0, -10, -4, 0, 0], f)),
      lhx: S0.lhx + ax, lhy: S0.lhy + ay, lhz: S0.lhz + az,
      rhx: S0.rhx + ax, rhy: S0.rhy - ay, rhz: S0.rhz + az,
    };
    keys.push({ at: t, ease: 'lin', pose: upElbows(pose) });
  }
  return {
    name: behind ? 'The Living Shadow struck from behind' : 'The Living Shadow struck hard',
    motion: { keys, loop: 0 },
    long,
    loops: false,
    rest: SHADOW_STANCE,
    wings: wingsFrom((t) => {
      const f = t / FR;
      return b
        ? { open: hitKey([1, 1, 1.5, 1.38, 1.14, 1], f), lift: hitKey([1, 1, 1.22, 1.12, 1.03, 1], f), sweep: hitKey([0, 0, -8, -3, 0, 0], f) }
        : { open: hitKey([1, 1, 1.42, 1.28, 1.1, 1], f), lift: hitKey([1, 1, 1.28, 1.14, 1.04, 1], f), sweep: hitKey([0, 0, 9, 3, 0, 0], f) };
    }),
    tail: (t) => 0.25 + (b ? hitKey([0, 0, -0.5, 0.35, -0.1, 0], t / FR) : hitKey([0, 0, 0.45, -0.3, 0.1, 0], t / FR)),
    // (its claws flung open with the blow)
    grip: (t) => hitKey([1, 1, 0.55, 0.75, 0.95, 1], t / FR),
    strike: [(WSTRUCK.hit - 1) * FR, (WSTRUCK.snapped + 1) * FR],
  };
}

/** Its other moves, all up on two legs, in this order: Damning; the smoke step; the end of the change into it (its roar); its burning out; struck hard; struck from behind. */
export const OTHER_MOVES = ['damning', 'step', 'roar', 'burnout', 'reel', 'lurch'] as const;
export function shadowOthers(): ShadowMove[] {
  return [shadowDamningMove(), shadowStepMove(), shadowRoarMove(), shadowBurnOutMove(), shadowStruckMove(false), shadowStruckMove(true)];
}

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
  return [
    stand, run, slashMove(1), slashMove(-1), drop,
    ...Array.from({ length: REARS }, (_, i) => rearMove(i / REARS)),
    ...SLASH_WAYS.map((way) => walkingSlashMove(1, way)),
    ...SLASH_WAYS.map((way) => walkingSlashMove(-1, way)),
    // (its other moves, all up on two legs: after the rest, so that each of those is where it was in this list)
    ...shadowOthers(),
  ];
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
  const paws = m.paws ? m.paws(t) : m.carry !== undefined || m.rest === FOURS || m.digs ? lowest < PAW_BELOW : false;
  const more: Moving = { wings: m.wings(t) };
  if (m.slash) {
    const way = m.slash.palm(t);
    more.palm = m.slash.side > 0 ? { L: way } : { R: way };
  } else if (m.palms) more.palm = m.palms(t);
  if (m.glow) more.glow = m.glow(t);
  const own = m.slash ? m.slash.grip(t) : undefined;
  const g = (side: 1 | -1): number | undefined => (m.slash && m.slash.side === side ? own : m.grip?.(t, side));
  more.grip = { L: g(1), R: g(-1) };
  if (m.fire) more.fire = (i) => (m.fire as NonNullable<ShadowMove['fire']>)(t, i);
  if (m.carry) more.carry = m.carry;
  // (made walking: its smoke in its wake as fast as it is going then)
  else if (m.along) {
    more.carry = (m.along(t + FR / 2) - m.along(Math.max(0, t - FR / 2))) / (t < FR / 2 ? t + FR / 2 : FR);
    more.carryWay = m.way ?? 0;
  }
  return { paws, more };
}
/** Its picture at a moment of a move, from in front or behind, turned `turn`. */
export function drawShadowAt(view: GameView, m: ShadowMove, t: number, turn = 0, built?: Moving['built']): Drawn {
  const tt = m.loops ? ((t % m.long) + m.long) % m.long : Math.max(0, Math.min(m.long, t));
  const pose = shadowPose(m, tt);
  const { paws, more } = shadowMoving(m, tt, pose);
  return shadowFrame(view, pose as Bones, turn, t, m.tail ? m.tail(tt) : 0.25, paws, { ...more, built });
}
