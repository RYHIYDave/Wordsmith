// FLOOR 8'S MEDIUM MOBS, THE CANYON SCORPIONS OF ECHO CANYON: a mock-up (nothing of the game imports this file;
// `SCORPION_ON` is off).
//
// HIS BRIEF, asked as his art rulebook's questions for a new character (15 Oct, by 08:15, each his pick, the labels as
// he tapped them): what it is, and where it lives, “Armoured scorpion of the red rock (Recommended)”; how big, and how
// it should feel, “Knee-high, fun to smash” (not the recommended pick); how it moves, “Darting bursts, then dead still
// (Recommended)”; the one thing to know it by, “Its tail raised high, stinger glowing (Recommended)”; how it attacks,
// “Pincer snap, then a long tail strike (Recommended)”; how it dies, “Flips onto its back, legs curling (Recommended)”;
// what it must never look like, “Not cute or cartoonish (Recommended)”; its sound (sound rule 7), “Dry clicks and a
// rattling tail (Recommended)”.
//
// READ AS, NOT ASKED (the pictures are to show them): an enemy, so its eyes, its stinger and its edge are the enemy's
// pink while it lives, and nothing cyan; wild, no cult mark; knee-high to the knight, its tail raised over its back to
// about his waist; eight legs, two pincers, a tail of five segments and its sting; its shell banded as the canyon's
// rock is, but bold (Monsters 7: monsters as boldly painted as the heroes; Colour 5: never mud-brown all over): a hot
// rust-orange lit to gold over deep plum-dark bands.
//
// NOT ON THE HEROES' BONES: eight legs, pincers and a tail have no place on them, so it is painted from its own solids,
// as the cliff crawler is (art/ledge_crawlers.ts), in the same painter (art/new_mobs3.ts's paintBits).
//
// THIS FIRST STEP: its look, standing (his rulebook: a sheet of it standing, front and back, beside a hero, before
// anything moves), and its stand: dead still but for its breath, its tail swaying high over its back, its pincers
// working.

import type { Px, Sprite } from '../engine/px';
import type { ActorArt, AnimSet, Clip } from './actor_types';
import { hash, lazyFrames, toSprite } from './kit';
import type { Painted, Ramp } from './kit';
import { ENEMY_RIM, FLAME } from './mkit';
import { TILE3, paintBits } from './new_mobs3';
import type { Bit, Put } from './new_mobs3';
import type { Skin } from './skin';
import { stage } from './skin';
import type { GameView, Stage } from './skin';
import type { V3 } from './skeleton';

/** THE SWITCH, OFF: nothing of the game reads this file. */
export const SCORPION_ON = { on: false };

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
const lerpV = (a: V3, b: V3, s: number): V3 => [a[0] + (b[0] - a[0]) * s, a[1] + (b[1] - a[1]) * s, a[2] + (b[2] - a[2]) * s];

// ---------------------------------------------------------------------------------------------
// ITS COLOURS: its shell banded as the canyon's rock is, but bold and dark against the canyon's pale sand (Colour
// 5: “Neon on dark”; never mud-brown all over): deep plum-black plates, lit at their edges, and between them bands of
// hot rust-orange lit to gold, as the rock's red beds under its dark varnish; its legs dark, their joints the bands'
// orange; its pincers' fingers and its barb black at their tips; its eyes and its sting the enemy's pink burning to
// gold (FLAME). Nothing of it glows cyan.

const SHELL: Ramp = ['#0e0610', '#1e0c16', '#3c1820', '#682a26', '#9a4230'];
const BAND: Ramp = ['#4a160e', '#7a2410', '#c04818', '#f07a2a', '#ffb060'];
const LEG: Ramp = ['#0c060a', '#1a0c10', '#36161a', '#5a2620', '#7c3626'];
const TIP: Ramp = ['#060305', '#060305', '#1a0c10', '#34181a', '#4e2622'];
const HOTSTING: Ramp = ['#7a1058', '#7a1058', '#c0206a', '#ff4f8a', '#ff7aa8'];

// ---------------------------------------------------------------------------------------------
// ITS BODY, in picture units (the knight stands 58 high; his knee is about 17 up). x forward, y left, z up; its own
// frame has its middle at the origin.

/** Its middle's height over the floor, at rest: its back about 12 up, knee-high to the knight. */
const BODY_Z = 7.5;
/** Its legs, four pairs: where each comes out of its body (its own frame), front pair first. */
const HIP: V3[] = [
  [6, 6, -1], [6, -6, -1],
  [2, 7.5, -1], [2, -7.5, -1],
  [-3, 8, -1], [-3, -8, -1],
  [-8, 7.5, -1], [-8, -7.5, -1],
];
/** Its feet at rest, on the floor, splayed wide about it. */
export const SC_FEET: V3[] = [
  [16, 20, 0], [16, -20, 0],
  [7, 25, 0], [7, -25, 0],
  [-5, 25, 0], [-5, -25, 0],
  [-15, 21, 0], [-15, -21, 0],
];
/** Its tail: where it rises from (the end of its body, its own frame), each of its five segments' length, and its sting's. */
const TAIL_ROOT: V3 = [-19, 0, 1];
const SEG = [7.4, 7.2, 7.0, 6.8, 6.6];
const SEG_R = [3.5, 3.2, 3.0, 2.8, 2.6];
/** Its tail at rest: the way each segment points, degrees up from forward in the tail's plane: up off its back and curled over it, the sting pointing down and forward over its head. */
const TAIL_REST = [118, 86, 54, 22, -10];
/** Its pincers at rest: each hand's place (its own frame), held out before it, open a little. */
const HAND: V3 = [25, 12, 1.5];

// ---------------------------------------------------------------------------------------------
// ITS TIMES (seconds)

/** Its stand: ten frames a second, a loop of 1.6 s: dead still but for its breath, its tail and its pincers. */
export const SC_STAND = { frames: 16, fps: 10, period: 1.6 } as const;
/** Its walk, a fast scuttle: four feet down at a time, sixteen frames a second, one cycle of 0.5 s (eight frames). Its darting (short dashes, then a stop) is how the game moves it. */
export const SC_WALK = { frames: 8, fps: 16, period: 0.5 } as const;
/** How fast it scuttles (tiles a second): its walk is painted for it, so each foot down stays on its spot. */
export const SC_PACE = 2.0;
/** Its basic blow, the pincer snap: reared, pincers wide (the warning, held and trembling) to `warn`; they snap shut through you at `hit`. */
export const SC_SNAP = { long: 0.7, warn: 0.18, hit: 0.3, fps: 30 } as const;
/** Its big move, the tail strike: the tail drawn back high, rattling (the warning) from `warn`; it whips over its head and stabs at `hit`, held a tenth (`freeze`); a jet of its venom bursts on the floor `reach` before where it stood. */
export const SC_STING = { long: 1.35, warn: 0.42, hit: 0.66, freeze: 0.1, reach: 78, fps: 30 } as const;
/** Struck: frozen a moment, knocked back and rocked, its shell chipping; back on its stand by `long`. */
export const SC_REEL = { long: 0.45, freeze: 0.08, fps: 30 } as const;
/** Its death: frozen a tenth; thrown up and rolled onto its back (`flipped`); its legs kicking, then curling in; its sting's glow and its eyes out by `out`; still from `still`. */
export const SC_DIE = { long: 1.1, freeze: 0.1, flipped: 0.5, out: 0.6, still: 0.95, fps: 30 } as const;

/** The canvas it is painted on, and its floor point on it (room for its venom's splash, two tiles on, and its throw as it dies). */
export const SC_CANVAS = { w: 280, h: 200, ax: 140, ay: 130 };
/** Its pool of light while it lives (the enemy's pink, faint). */
const SC_AURA = { x: SC_CANVAS.ax, y: SC_CANVAS.ay - 8, r: 30, color: '#ff3a78', a: 0.08 };

// ---------------------------------------------------------------------------------------------
// ITS POSES

/** One moment of it. */
interface ScPose {
  /** Its middle, forward and to its left and up, from its floor point; and how it is turned (degrees: to its left, nose down, rolled to its right). */
  x: number;
  y: number;
  z: number;
  yaw: number;
  pitch: number;
  roll: number;
  /** Each foot's place on the floor's own grid (on the floor when z is 0), and how high each knee arches over its leg. */
  feet: V3[];
  knee: number[];
  /** Its tail: the way each segment points (degrees, as `TAIL_REST`), and the tail's plane turned to its left (degrees). */
  tail: number[];
  tailYaw: number;
  /** Each pincer's hand (its own frame), and how far each is open (0 shut, 1 wide). */
  hands: [V3, V3];
  pinch: [number, number];
  /** How bright its sting burns, and its eyes (0 out). */
  sting: number;
  eyes: number;
  /** Still living: its pink edge is painted round it. */
  alive: boolean;
  /** What its moves throw off, laid over its picture: flakes of its shell, dust, its venom (each its place, colour and size); and lights of its venom. */
  chips: [V3, string, number][];
  flares: [V3, number, number][];
}

/** Its stand: dead still, its feet where they are; it breathes; its tail sways slowly high over its back, curling and uncurling a little; its pincers open and shut by turns; its sting pulses. */
function standPose(t: number): ScPose {
  const a = (Math.PI * 2 * t) / SC_STAND.period;
  return {
    x: 0,
    y: 0,
    z: BODY_Z + 0.35 * Math.sin(a),
    yaw: 0,
    pitch: 0,
    roll: 0,
    feet: SC_FEET.map((f) => f),
    knee: SC_FEET.map(() => 7),
    tail: TAIL_REST.map((d, i) => d + 4 * Math.sin(a + i * 0.5) * (i / 4)),
    tailYaw: 7 * Math.sin(a + 0.4),
    hands: [[HAND[0], HAND[1], HAND[2]], [HAND[0], -HAND[1], HAND[2]]],
    pinch: [0.25 + 0.25 * Math.max(0, Math.sin(a)), 0.25 + 0.25 * Math.max(0, Math.sin(a + Math.PI))],
    sting: 1 + 0.25 * Math.sin(2 * a),
    eyes: 1,
    alive: true,
    chips: [],
    flares: [],
  };
}

const sm = (v: number): number => {
  const c = cl01(v);
  return c * c * (3 - 2 * c);
};
/** Ease out with a little overshoot that settles (a follow-through). */
const backOut = (v: number): number => {
  const c = cl01(v) - 1;
  return 1 + 2.5 * c * c * c + 1.5 * c * c;
};
const mixN = (a: number[], b: number[], k: number): number[] => a.map((v, i) => v + (b[i] - v) * k);
const STAND0 = standPose(0);

/** Its flakes of shell: thrown out from `origin` at `t0`, falling, gone `life` seconds after. */
function flakes(origin: V3, t0: number, t: number, n: number, seed: number, speed: number, up: number, life = 0.5): [V3, string, number][] {
  const s = t - t0;
  if (s < 0 || s >= life - 1e-9) return [];
  const out: [V3, string, number][] = [];
  for (let i = 0; i < n; i++) {
    const a = hash(i, 1, seed) * Math.PI * 2;
    const v = speed * (0.6 + 0.8 * hash(i, 2, seed));
    const sh = Math.min(s, 0.25);
    const z = Math.max(0.6, origin[2] + up * (0.5 + hash(i, 3, seed)) * s - 150 * s * s);
    out.push([[origin[0] + Math.cos(a) * v * sh, origin[1] + Math.sin(a) * v * sh, z], i % 3 ? BAND[3] : SHELL[2], i % 4 ? 2 : 3]);
  }
  return out;
}
/** Dust kicked off the canyon's sand from `c`, thrown out and settling. */
function dust(c: V3, t0: number, t: number, n: number, seed: number, reach: number, life = 0.4): [V3, string, number][] {
  const k = (t - t0) / life;
  if (k < 0 || k >= 1) return [];
  const out: [V3, string, number][] = [];
  const go = 1 - (1 - k) * (1 - k);
  for (let i = 0; i < n; i++) {
    if (hash(i, 7, seed) < k * 0.9) continue;
    const a = hash(i, 1, seed) * Math.PI * 2;
    const r = reach * go * (0.4 + 0.6 * hash(i, 2, seed));
    out.push([[c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r, 1 + 8 * go * hash(i, 3, seed)], ['#cc9a74', '#dcb08a', '#b88462'][i % 3], 2]);
  }
  return out;
}

/** A foot as the walk puts it, `u` the phase in its cycle (0 to 1): down for the first half, carried back as the body goes over it; swung through the air for the second. */
const HALF = (SC_PACE * TILE3 * SC_WALK.period) / 2;
const LIFT = 4.5;
/** The two sets of four that take turns: its left first, right second, left third and right fourth legs together; then the others, half a cycle behind. */
const OFF = [0, 0.5, 0.5, 0, 0, 0.5, 0.5, 0];
function stepFoot(i: number, u: number): V3 {
  const r = SC_FEET[i];
  if (u < 0.5) return [r[0] + HALF * (0.5 - 2 * u), r[1], 0];
  const v = (u - 0.5) * 2;
  return [r[0] + HALF * (-0.5 + sm(v)), r[1], LIFT * Math.sin(Math.PI * v)];
}

/** Its walk, a fast scuttle: its four sets of legs taking turns, its middle bobbing twice a cycle, its tail swaying high over it with the stride, its pincers held out before it. */
function walkPose(t: number): ScPose {
  const ph = fr(t / SC_WALK.period);
  const a = Math.PI * 2 * ph;
  const feet = SC_FEET.map((_, i) => stepFoot(i, fr(ph + OFF[i])));
  return {
    ...STAND0,
    z: BODY_Z + 0.8 * Math.pow(Math.sin(a), 2),
    yaw: 3 * Math.sin(a),
    roll: 2 * Math.sin(a),
    feet,
    knee: feet.map((f) => 7 + 0.5 * f[2]),
    tail: TAIL_REST.map((d, i) => d + 3 * Math.sin(2 * a + i * 0.6) * (i / 4)),
    tailYaw: 6 * Math.sin(a + 0.8),
    hands: [[HAND[0] + 1, HAND[1] - 1, HAND[2] + 0.8 * Math.sin(a)], [HAND[0] + 1, -HAND[1] + 1, HAND[2] - 0.8 * Math.sin(a)]],
    pinch: [0.3, 0.3],
    sting: 1,
  };
}

/** When its pincers start to snap shut, after their warning's tremble. */
const SNAP_AT = 0.24;
/**
 * The pincer snap, its basic blow: it rears, its pincers drawn back and spread wide and open (the warning, held and
 * trembling); then it lunges and both pincers snap shut through whoever is before it (`hit`), and squeeze on a moment;
 * then it settles back onto its stand. Its feet do not move: its legs stretch with the lunge.
 */
function snapPose(t: number): ScPose {
  const P: ScPose = { ...STAND0, feet: STAND0.feet, hands: [STAND0.hands[0], STAND0.hands[1]], pinch: [STAND0.pinch[0], STAND0.pinch[1]], chips: [], flares: [] };
  const WIDE: V3 = [13, 22, 9];
  const SHUT: V3 = [34, 5, 2];
  const ON: V3 = [37, 3.5, 2.5];
  const pair = (v: V3): [V3, V3] => [[v[0], v[1], v[2]], [v[0], -v[1], v[2]]];
  const tremble = (k: number): number => 0.7 * Math.sin(t * 170 + k);
  if (t < SC_SNAP.warn) {
    const w = backOut(t / SC_SNAP.warn);
    const h = pair(lerpV(HAND, WIDE, w));
    P.hands = h;
    P.pinch = [STAND0.pinch[0] + (1 - STAND0.pinch[0]) * w, STAND0.pinch[1] + (1 - STAND0.pinch[1]) * w];
    P.z = BODY_Z + 4 * sm(t / SC_SNAP.warn);
    P.pitch = -12 * sm(t / SC_SNAP.warn);
    P.tail = mixN(STAND0.tail, TAIL_REST.map((d) => d + 6), sm(t / SC_SNAP.warn));
    P.sting = 1.3;
  } else if (t < SNAP_AT) {
    const h = pair(WIDE);
    P.hands = [[h[0][0], h[0][1] + tremble(1), h[0][2] + tremble(2)], [h[1][0], h[1][1] - tremble(3), h[1][2] + tremble(4)]];
    P.pinch = [1, 1];
    P.z = BODY_Z + 4;
    P.pitch = -12;
    P.tail = TAIL_REST.map((d) => d + 6);
    P.sting = 1.4;
  } else if (t < SC_SNAP.hit) {
    // (the snap: it lunges, its pincers swung in and shut)
    const k = sm((t - SNAP_AT) / (SC_SNAP.hit - SNAP_AT));
    P.hands = pair(lerpV(WIDE, SHUT, k));
    P.pinch = [1 - k, 1 - k];
    P.x = 7 * k;
    P.z = BODY_Z + 4 - 5 * k;
    P.pitch = -12 + 18 * k;
    P.tail = mixN(TAIL_REST.map((d) => d + 6), TAIL_REST.map((d, i) => d - 4 * i), k);
    P.sting = 1.4;
  } else if (t < 0.42) {
    // (the squeeze: on through, shut tight, its body pressed low)
    const k = sm((t - SC_SNAP.hit) / 0.12);
    P.hands = pair(lerpV(SHUT, ON, k));
    P.pinch = [0, 0];
    P.x = 7 + 1.5 * k;
    P.z = BODY_Z - 1 - 0.5 * k;
    P.pitch = 6 + 1 * k;
    P.tail = TAIL_REST.map((d, i) => d - 4 * i - 2 * k * i);
    P.sting = 1.2;
  } else {
    // (back onto its stand, overshooting a little and settling)
    const u = (t - 0.42) / (SC_SNAP.long - 0.42);
    const o = backOut(u);
    const k = sm(u);
    const h = pair(lerpV(ON, HAND, o));
    const lift = 4 * Math.sin(Math.PI * k);
    P.hands = [[h[0][0], h[0][1], h[0][2] + lift], [h[1][0], h[1][1], h[1][2] + lift]];
    P.pinch = [STAND0.pinch[0] * k, STAND0.pinch[1] * k];
    P.x = 8.5 * (1 - o);
    P.z = BODY_Z - 1.5 + (BODY_Z - (BODY_Z - 1.5)) * o + (STAND0.z - BODY_Z) * k;
    P.pitch = 7 * (1 - o);
    P.tail = mixN(TAIL_REST.map((d, i) => d - 6 * i), STAND0.tail, o);
    P.sting = 1.2 - 0.2 * k + (STAND0.sting - 1) * k;
  }
  // (the snap kicks up the sand under its front feet as it lunges)
  P.chips = [...dust([SC_FEET[0][0], 0, 0], SNAP_AT + 0.02, t, 14, 61, 22)];
  // (the snap: a click of pale sparks where the fingers meet, for two frames)
  if (t >= SC_SNAP.hit && t < SC_SNAP.hit + 0.07) {
    const at = worldOf(P, [SHUT[0] + 7, 0, SHUT[2] + 1]);
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      const r = 3 + 6 * ((t - SC_SNAP.hit) / 0.07);
      P.chips.push([[at[0] + Math.cos(a) * r * 0.6, at[1] + Math.sin(a) * r, Math.max(0.6, at[2] + Math.cos(a) * r * 0.5)], i % 2 ? '#fff0d8' : '#ffd0a0', 2]);
    }
  }
  return P;
}

/** The tail drawn back high (cocked), and whipped over its head in the stab, each segment's way. */
const TAIL_COCKED = [140, 122, 98, 66, 26];
const TAIL_STAB = [90, 66, 36, 4, -36];
/** The tail's plane at the stab, turned off to its right a little, so that the tail comes over its shoulder and not over its back. */
const STAB_YAW = -34;
/**
 * The tail strike, its big move: it crouches and draws its tail back high over itself, its pincers raised and open,
 * and holds it there, the tail rattling and its sting burning (THE WARNING); then whips the tail over its head and
 * stabs down before it as it lunges (`hit`), held a tenth: a jet of its venom shoots on from the sting and bursts on
 * the floor two tiles before where it stood (`reach`), a splash of the cult's pink; then it draws the tail back and
 * settles. Its feet do not move.
 */
function stingPose(t: number): ScPose {
  const S = SC_STING;
  const tt = t >= S.hit && t < S.hit + S.freeze ? S.hit : t;
  const P: ScPose = { ...STAND0, feet: STAND0.feet, chips: [], flares: [] };
  const RAISED: V3 = [20, 15, 9];
  const pair = (v: V3): [V3, V3] => [[v[0], v[1], v[2]], [v[0], -v[1], v[2]]];
  const rattle = (i: number): number => (tt > 0.3 && tt < 0.58 ? 3.2 * Math.sin(tt * 260 + i * 1.3) * (i / 4) : 0);
  if (tt < 0.3) {
    const k = sm(tt / 0.3);
    P.tail = mixN(STAND0.tail, TAIL_COCKED, backOut(tt / 0.3));
    P.tailYaw = STAND0.tailYaw * (1 - k);
    P.z = BODY_Z - 1.5 * k;
    P.x = -4 * k;
    P.pitch = -5 * k;
    P.hands = pair(lerpV(HAND, RAISED, k));
    P.pinch = [STAND0.pinch[0] + (1 - STAND0.pinch[0]) * k, STAND0.pinch[1] + (1 - STAND0.pinch[1]) * k];
    P.sting = 1 + 0.6 * k;
  } else if (tt < 0.58) {
    P.tail = TAIL_COCKED.map((d, i) => d + rattle(i));
    P.tailYaw = 0;
    P.z = BODY_Z - 1.5;
    P.x = -4;
    P.pitch = -5;
    P.hands = pair(RAISED);
    P.pinch = [1, 1];
    P.sting = 1.6 + 0.2 * Math.sin(tt * 90);
  } else if (tt < S.hit) {
    // (the whip: fast, the tail flung over its head as its body lunges in under it)
    const k = Math.pow((tt - 0.58) / (S.hit - 0.58), 1.6);
    P.tail = mixN(TAIL_COCKED, TAIL_STAB, k);
    P.tailYaw = STAB_YAW * k;
    P.z = BODY_Z - 1.5 - 1.5 * k;
    P.x = -4 + 14 * k;
    P.pitch = -5 + 11 * k;
    P.hands = pair(lerpV(RAISED, [24, 15, 3], k));
    P.pinch = [1, 1];
    P.sting = 1.8;
  } else if (tt < S.hit + S.freeze + 1e-9) {
    P.tail = TAIL_STAB;
    P.tailYaw = STAB_YAW;
    P.z = BODY_Z - 3;
    P.x = 10;
    P.pitch = 6;
    P.hands = pair([24, 15, 3]);
    P.pinch = [1, 1];
    P.sting = 1.8;
  } else {
    // (the tail drawn back, overshooting its stand a little, and settling; its body back with it)
    const u = (t - S.hit - S.freeze) / (S.long - S.hit - S.freeze);
    const o = backOut(u);
    const k = sm(u);
    P.tail = mixN(TAIL_STAB, STAND0.tail, o);
    P.tailYaw = STAB_YAW + (STAND0.tailYaw - STAB_YAW) * k;
    P.z = BODY_Z - 3 + (STAND0.z - BODY_Z + 3) * o;
    P.x = 10 * (1 - o);
    P.pitch = 6 * (1 - o);
    P.hands = [lerpV([24, 15, 3], STAND0.hands[0], k), lerpV([24, -15, 3], STAND0.hands[1], k)];
    P.pinch = [1 + (STAND0.pinch[0] - 1) * k, 1 + (STAND0.pinch[1] - 1) * k];
    P.sting = 1.8 + (STAND0.sting - 1.8) * k;
  }
  // its venom: after the freeze, a jet from the sting to the floor two tiles on, and a splash of the cult's pink there;
  // the sting flaring as it stabs
  if (t >= S.hit) {
    const from = stingTip(P);
    const to: V3 = [S.reach, 0, 0];
    const tau = t - S.hit - S.freeze;
    if (t < S.hit + S.freeze) {
      P.flares.push([from, 18, 0.6]);
      // (the sting's flash as it stabs: a burst of the cult's pink round its barb, held with the freeze)
      for (let i = 0; i < 10; i++) {
        const a = (i / 10) * Math.PI * 2;
        P.chips.push([[from[0] + Math.cos(a) * 4, from[1] + Math.sin(a) * 4, Math.max(0.6, from[2] + Math.sin(a * 2) * 3)], i % 2 ? FLAME[2] : FLAME[3], 2]);
      }
    }
    if (tau >= 0 && tau < 0.16) {
      // (the jet: a stream of the venom flying along a low arc, its head reaching the floor at 0.1 s)
      const head = Math.min(1, tau / 0.1);
      for (let j = 0; j < 14; j++) {
        const k = head - j * 0.05;
        if (k < 0 || k > 1) continue;
        const p = lerpV(from, to, k);
        P.chips.push([[p[0], p[1], p[2] + 10 * Math.sin(Math.PI * k)], j < 3 ? FLAME[3] : j < 8 ? FLAME[2] : FLAME[1], j < 8 ? 4 : 2]);
      }
    }
    if (tau >= 0.1 && tau < 0.55) {
      const k = (tau - 0.1) / 0.45;
      for (let i = 0; i < 40; i++) {
        if (hash(i, 9, 77) < k * 0.9) continue;
        const a = (i / 40) * Math.PI * 2;
        const r = 4 + 22 * (1 - (1 - k) * (1 - k)) * (0.6 + 0.4 * hash(i, 1, 77));
        const up = 18 * Math.sin(Math.PI * Math.min(1, k * 1.6)) * hash(i, 2, 77);
        P.chips.push([[to[0] + Math.cos(a) * r, Math.sin(a) * r, 0.6 + up], i % 3 ? FLAME[2] : FLAME[3], i % 3 ? 2 : 4]);
      }
      P.flares.push([to, 20, 0.5 * (1 - k)]);
    }
  }
  return P;
}
/** Where its sting's barb ends, in the floor's own grid. */
function stingTip(P: ScPose): V3 {
  const { pts, dir } = tailJoints(P);
  const end = pts[pts.length - 1];
  const bulbC = add(end, mul(dir, 3.4));
  const downish = norm(add(mul(dir, 0.4), [0, 0, -1]));
  const barbA = add(bulbC, mul(dir, 2.6));
  return worldOf(P, add(barbA, mul(norm(add(dir, mul(downish, 1.2))), 5)));
}

/**
 * Struck: frozen a moment as the blow lands; then knocked back and up, its nose thrown up, its pincers flung wide, its
 * tail lashing, its front feet kicked up off the floor and set down where they were; flakes of its shell fly; it rocks,
 * and is back on its stand by its end. Fun to smash: a big reaction for its size.
 */
function reelPose(t: number): ScPose {
  const R = SC_REEL;
  if (t < R.freeze) return { ...STAND0, eyes: 1.5, chips: [], flares: [] };
  const k = cl01((t - R.freeze) / (R.long - R.freeze));
  const kk = cl01(k / 0.75);
  const arc = Math.sin(Math.PI * (1 - (1 - kk) * (1 - kk)));
  const pair = (v: V3): [V3, V3] => [[v[0], v[1], v[2]], [v[0], -v[1], v[2]]];
  return {
    ...STAND0,
    x: -10 * arc,
    z: BODY_Z + 6 * arc,
    pitch: -20 * arc,
    roll: 10 * Math.sin(3 * Math.PI * kk) * (1 - kk),
    hands: [lerpV(STAND0.hands[0], [20, 20, 9], arc), lerpV(STAND0.hands[1], [20, -20, 9], arc)],
    pinch: [STAND0.pinch[0] + (1 - STAND0.pinch[0]) * arc, STAND0.pinch[1] + (1 - STAND0.pinch[1]) * arc],
    tail: mixN(STAND0.tail, TAIL_REST.map((d, i) => d + 14 - 6 * i), arc),
    tailYaw: STAND0.tailYaw + 14 * Math.sin(2 * Math.PI * kk) * (1 - kk),
    feet: SC_FEET.map((f, i): V3 => [f[0], f[1], (i < 2 ? 9 : i < 4 ? 4 : 0) * arc]),
    knee: SC_FEET.map(() => 7 + 3 * arc),
    eyes: 1.5 - 0.5 * k,
    sting: 1 + 0.6 * (1 - k),
    chips: flakes([3, 0, 14], R.freeze, t, 14, 31, 50, 22, R.long - R.freeze),
    flares: [],
  };
  void pair;
}

/** Its feet in its own frame, at rest (its middle at the origin). */
const FEET_OWN: V3[] = SC_FEET.map((f) => [f[0], f[1], f[2] - BODY_Z]);
/**
 * Its death: frozen a tenth as the blow lands; then thrown up and rolled over onto its back, its legs drawn in, its tail
 * gone limp and straight behind it (0.1 to 0.5 s); it comes down on its back with a bounce; its legs kick in the air
 * (to 0.75 s), then curl in over its belly (to 0.95 s); its sting's glow and its eyes go out by 0.6 s; its tail curls
 * up off the floor behind it; still from 0.95 s. Nothing of it goes under the rock.
 */
function deathPose(t: number): ScPose {
  const Dd = SC_DIE;
  if (t < Dd.freeze) return { ...STAND0, eyes: 1.5, alive: false, chips: [], flares: [] };
  const k = cl01((t - Dd.freeze) / (Dd.flipped - Dd.freeze));
  const flip = sm(k);
  const land = cl01((t - Dd.flipped) / 0.12);
  const kick = t > Dd.flipped && t < 0.75 ? Math.sin((t - Dd.flipped) * 46) * (1 - cl01((t - 0.65) / 0.1)) : 0;
  const curl = sm((t - 0.75) / 0.2);
  const tuck = sm(k / 0.4);
  const ownFeet = FEET_OWN.map((f, i): V3 => {
    const drawn: V3 = [f[0] * 0.75, f[1] * 0.55, -4];
    const curled: V3 = [HIP[i][0] * 0.7, HIP[i][1] * 0.8, -3.5];
    const base = lerpV(lerpV(f, drawn, tuck), curled, curl);
    const kz = 2.2 * kick * Math.sin(i * 1.9) * (1 - curl);
    return [base[0] + kz * 0.6, base[1], base[2] - Math.abs(kz)];
  });
  // (thrown up as it rolls, high enough that nothing of it touches the rock on the way over; then down on its back, a bounce)
  const BACK_Z = 5.2;
  const zDown = BACK_Z + 2.2 * Math.sin(Math.PI * land) * (1 - land);
  const P: ScPose = {
    ...STAND0,
    x: -8 * flip,
    z: t < Dd.flipped ? BACK_Z + (BODY_Z - BACK_Z) * (1 - k) + 20 * Math.sin(Math.PI * k) * (1 - 0.3 * k) : zDown,
    roll: 180 * flip,
    pitch: 0,
    yaw: 12 * flip,
    feet: [],
    knee: SC_FEET.map(() => 5 - 2 * curl),
    // (its tail flung straight out behind it as it goes over, then curling up over its belly as it dies)
    tail: mixN(mixN(STAND0.tail, [182, 185, 188, 191, 194], sm(k / 0.6)), [200, 232, 262, 290, 316], 0.3 * sm((t - Dd.flipped) / 0.2) + 0.7 * curl),
    tailYaw: STAND0.tailYaw * (1 - sm(k / 0.6)),
    // (its pincers drawn in as it goes over, then limp)
    hands: [lerpV(lerpV(STAND0.hands[0], [18, 6, 0], sm(k / 0.4)), [20, 10, -2], land), lerpV(lerpV(STAND0.hands[1], [18, -6, 0], sm(k / 0.4)), [20, -10, -2], land)],
    pinch: [0.6 * (1 - curl) + 0.1, 0.6 * (1 - curl) + 0.1],
    sting: 1.5 * (1 - sm((t - Dd.freeze) / (Dd.out - Dd.freeze))),
    eyes: 1.5 * (1 - sm((t - Dd.freeze) / (Dd.out - Dd.freeze))),
    alive: false,
    chips: [...flakes([0, 0, 12], Dd.freeze, t, 16, 41, 60, 26), ...dust([-8, 0, 0], Dd.flipped, t, 18, 43, 24)],
    flares: [],
  };
  P.feet = ownFeet.map((f) => worldOf(P, f));
  return P;
}

function basePose(which: string, t: number): ScPose {
  if (which === 'stand') return standPose(t);
  if (which === 'walk') return walkPose(t);
  if (which === 'attack') return snapPose(t);
  if (which === 'sting') return stingPose(t);
  if (which === 'reel') return reelPose(t);
  return deathPose(t);
}
function poseOf(which: string, t: number): ScPose {
  return basePose(which, t);
}

// ---------------------------------------------------------------------------------------------
// ITS PAINTER

/** A point of its own frame, where it is: turned and moved with its body. */
function worldOf(P: ScPose, p: V3): V3 {
  const cy = Math.cos(P.yaw * D), sy = Math.sin(P.yaw * D);
  const cp = Math.cos(P.pitch * D), sp = Math.sin(P.pitch * D);
  const cr = Math.cos(P.roll * D), sr = Math.sin(P.roll * D);
  // roll about its length, then pitch (nose down), then yaw
  const r1: V3 = [p[0], p[1] * cr - p[2] * sr, p[1] * sr + p[2] * cr];
  const r2: V3 = [r1[0] * cp + r1[2] * sp, r1[1], -r1[0] * sp + r1[2] * cp];
  const r3: V3 = [r2[0] * cy - r2[1] * sy, r2[0] * sy + r2[1] * cy, r2[2]];
  return [P.x + r3[0], P.y + r3[1], P.z + r3[2]];
}
/** A direction of its own frame, where it points. */
function turned(P: ScPose, v: V3): V3 {
  return sub(worldOf(P, v), worldOf(P, [0, 0, 0]));
}

/** Its shell, banded across as the canyon's rock is: its plates lit, the seams between them in its deep bands; its edges darker. */
function bandedSkin(bands: number, seed: number): Skin {
  return (u, tone) => {
    const b = fr(u[0] * bands * 0.5 + 0.5 + seed);
    const seam = b < 0.32;
    const rim = Math.abs(u[1]) > 0.78;
    let t = tone + (Math.abs(u[1]) < 0.12 && u[2] > 0.3 ? 1 : 0);
    if (rim) t -= 1;
    return (seam ? BAND : SHELL)[Math.max(0, Math.min(4, t))];
  };
}

/** Its tail's joints, from its root to its sting's base, and the way its last segment points (its own frame). */
export function tailJoints(P: Pick<ScPose, 'tail' | 'tailYaw'>): { pts: V3[]; dir: V3 } {
  const pts: V3[] = [TAIL_ROOT];
  const cy = Math.cos(P.tailYaw * D), sy = Math.sin(P.tailYaw * D);
  let p = TAIL_ROOT;
  let dir: V3 = [1, 0, 0];
  P.tail.forEach((a, i) => {
    dir = [Math.cos(a * D) * cy, Math.cos(a * D) * sy, Math.sin(a * D)];
    p = add(p, mul(dir, SEG[i]));
    pts.push(p);
  });
  return { pts, dir };
}

/** THE SCORPION AS SOLIDS: its body, its tail and sting, its pincers, its eight legs, its eyes. */
function scorpionBits(P: ScPose, put: Put): void {
  const W = (p: V3): V3 => worldOf(P, p);
  const axes = (a: V3, b: V3, c: V3): [V3, V3, V3] => [turned(P, a), turned(P, b), turned(P, c)];
  // its body: the head-plate before, the long banded back behind it
  put('body', 'back', { k: 'ball', c: W([-8, 0, 0]), ax: axes([13, 0, 0], [0, 9, 0], [0, 0, 4.6]), skin: bandedSkin(6, 0.1) });
  put('body', 'head', { k: 'ball', c: W([6.5, 0, 0.6]), ax: axes([8, 0, 0], [0, 8, 0], [0, 0, 4.2]), skin: bandedSkin(1, 0.6) });
  // its tail: five segments rising off the end of its back and curled over it, each banded at its joint; then its sting
  const { pts, dir } = tailJoints(P);
  for (let i = 0; i < SEG.length; i++) {
    const a = W(pts[i]);
    const b = W(pts[i + 1]);
    put('tail', `seg${i}`, { k: 'rod', a, b, ra: SEG_R[i], rb: SEG_R[i] * 0.92, ramp: SHELL });
    put('tail', `joint${i}`, { k: 'ball', c: b, ax: [[SEG_R[i] * 0.95, 0, 0], [0, SEG_R[i] * 0.95, 0], [0, 0, SEG_R[i] * 0.95]], skin: BAND });
  }
  // the sting: a swollen bulb, its venom burning the cult's pink through it, and the curved barb
  const end = pts[pts.length - 1];
  const bulbC = add(end, mul(dir, 3.4));
  const downish = norm(add(mul(dir, 0.4), [0, 0, -1]));
  const barbA = add(bulbC, mul(dir, 2.6));
  const barbB = add(barbA, mul(norm(add(dir, mul(downish, 1.2))), 5));
  const hot = Math.min(1.8, P.sting);
  // (its venom burning through its skin: all of the bulb but a dark cap along its top, brightest where the light falls)
  const venom: Skin = (u, tone) => (hot > 0.3 && u[2] < 0.72 ? HOTSTING[Math.max(2, Math.min(4, tone + 1))] : SHELL[Math.max(1, Math.min(4, tone))]);
  const bAx = norm(dir);
  const bSide = norm(cross(bAx, [0, 0, 1]), [0, 1, 0]);
  const bUp = norm(cross(bSide, bAx));
  put('sting', 'bulb', { k: 'ball', c: W(bulbC), ax: axes(mul(bAx, 4.8), mul(bSide, 3.8), mul(bUp, 4.0)), skin: venom });
  put('sting', 'barb', { k: 'rod', a: W(barbA), b: W(barbB), ra: 1.6, rb: 0.45, ramp: TIP });
  if (hot > 0.3) put('glow', 'glow', { k: 'glow', p: W(bulbC), c: FLAME[2], r: 10 + 8 * hot, a: 0.35 + 0.25 * Math.min(1, hot) });
  // its pincers: a long arm from each side of its head, an elbow out wide, a heavy hand and two fingers that open
  for (const [k, side] of [[0, 1], [1, -1]] as const) {
    const sh: V3 = [11, side * 5, 0];
    const hand = P.hands[k];
    const elbow: V3 = [(sh[0] + hand[0]) / 2 - 3, (sh[1] + hand[1]) / 2 + side * 7, Math.max(sh[2], hand[2]) + 3];
    put(`arm${k}`, `upper${k}`, { k: 'rod', a: W(sh), b: W(elbow), ra: 2.0, rb: 1.9, ramp: LEG });
    put(`arm${k}`, `fore${k}`, { k: 'rod', a: W(elbow), b: W(hand), ra: 1.9, rb: 2.2, ramp: SHELL });
    put(`arm${k}`, `elbow${k}`, { k: 'ball', c: W(elbow), ax: axes([2.1, 0, 0], [0, 2.1, 0], [0, 0, 2.1]), skin: BAND });
    const fwd = norm(sub(hand, elbow), [1, 0, 0]);
    const inward = norm(cross([0, 0, side], fwd), [0, -side, 0]);
    const up = norm(cross(fwd, inward));
    put(`arm${k}`, `hand${k}`, { k: 'ball', c: W(hand), ax: axes(mul(fwd, 4.6), mul(inward, 3.2), mul(up, 2.9)), skin: bandedSkin(2, 0.3) });
    // (the fixed finger on the inside, the moving one on the outside, swung out as it opens)
    const root = add(hand, mul(fwd, 3.6));
    const open = P.pinch[k];
    const fixedTip = add(add(root, mul(fwd, 6.5)), mul(inward, 1.2));
    const moveDir = norm(add(fwd, mul(inward, -0.25 - 1.1 * open)));
    const moveTip = add(add(root, mul(inward, -1.4)), mul(moveDir, 6.5));
    put(`arm${k}`, `fixed${k}`, { k: 'rod', a: W(add(root, mul(inward, 1.2))), b: W(fixedTip), ra: 1.4, rb: 0.5, ramp: TIP });
    put(`arm${k}`, `moving${k}`, { k: 'rod', a: W(add(root, mul(inward, -1.4))), b: W(moveTip), ra: 1.4, rb: 0.5, ramp: TIP });
  }
  // its eight legs: a hip under its body, the knee arched high, the foot down on the rock, pointed
  P.feet.forEach((foot, i) => {
    const hip = W(HIP[i]);
    const side = Math.sign(HIP[i][1]);
    const mid = lerpV(hip, foot, 0.45);
    const outward = norm([foot[0] - hip[0], foot[1] - hip[1], 0], [0, side, 0]);
    const knee: V3 = [mid[0] + outward[0] * 1.5, mid[1] + outward[1] * 1.5, Math.max(hip[2], foot[2]) + P.knee[i]];
    const toe: V3 = [foot[0], foot[1], foot[2] + 0.7];
    put(`leg${i}`, `thigh${i}`, { k: 'rod', a: hip, b: knee, ra: 1.7, rb: 1.4, ramp: LEG });
    put(`leg${i}`, `shin${i}`, { k: 'rod', a: knee, b: toe, ra: 1.4, rb: 0.6, ramp: LEG });
    put(`leg${i}`, `knee${i}`, { k: 'ball', c: knee, ax: [[1.6, 0, 0], [0, 1.6, 0], [0, 0, 1.6]], skin: BAND });
  });
  // its eyes: two small ones high on its head-plate, and a few at its front corners, the enemy's pink (none once out)
  if (P.eyes > 0.3) {
    for (const s of [1, -1]) {
      put('body', `eye${s}`, { k: 'dot', p: W([9.5, s * 1.6, 4.2]), c: FLAME[2], facing: turned(P, [0.3, 0, 1]), c2: FLAME[3] });
      put('body', `side${s}`, { k: 'dot', p: W([12.6, s * 5.2, 2.2]), c: FLAME[2], facing: turned(P, [0.6, s * 0.6, 0.5]) });
    }
    put('glow', 'eyes', { k: 'glow', p: W([10, 0, 4]), c: FLAME[2], r: 5, a: 0.25 * Math.min(1, P.eyes) });
  }
}

/** One frame of the scorpion: `which` (stand, walk, attack: the pincer snap, sting: the tail strike, reel, dying), `t` seconds in, from in front or behind. */
export function scorpionPainted(which: string, t: number, view: GameView = 'front'): Painted {
  const st = stage(view, SC_CANVAS.ax, SC_CANVAS.ay, SC_CANVAS);
  const P = poseOf(which, t);
  const bits: Bit[] = [];
  scorpionBits(P, (part, piece, shape) => {
    bits.push({ part, piece, shape });
  });
  const lights = paintBits(st, bits, [P.x, P.y, P.z]);
  for (const [p, r, a] of P.flares) {
    const [x, y] = st.at(p);
    lights.push({ x, y, r, color: FLAME[2], a });
  }
  const px = st.whole(P.alive ? ENEMY_RIM : null);
  for (const [pt, col, size] of P.chips) laid(px, st, pt, col, size);
  return { px, lights };
}
/** A grain laid on a finished picture (after its pink edge, so that it stays its own colour), on whole game pixels. */
function laid(px: Px, st: Stage, p: V3, col: string, size: number): void {
  const [x, y] = st.at(p);
  const xi = Math.round(x - size / 2);
  const yi = Math.round(y - size / 2);
  for (let dy = 0; dy < size; dy++) for (let dx = 0; dx < size; dx++) if (xi + dx >= 0 && yi + dy >= 0 && xi + dx < px.w && yi + dy < px.h) px.set(xi + dx, yi + dy, col);
}
/** How many grains its moves throw off at one moment (for the tests). */
export function scorpionChipCount(which: string, t: number): number {
  return poseOf(which, t).chips.length;
}
/** Its feet at one moment (for the tests). */
export function scorpionFeet(which: string, t: number): V3[] {
  return poseOf(which, t).feet;
}
/** The same frame as the game holds a figure (its pool of light behind it while it lives). */
export function scorpionFrame(which: string, t: number, view: GameView = 'front'): Sprite {
  return toSprite(scorpionPainted(which, t, view), which === 'dying' ? null : SC_AURA, SC_CANVAS.ax, SC_CANVAS.ay);
}
/** Every solid of one moment of it, as the tests read them. */
export function scorpionSolids(which: string, t: number): Bit[] {
  const bits: Bit[] = [];
  scorpionBits(poseOf(which, t), (part, piece, shape) => {
    bits.push({ part, piece, shape });
  });
  return bits;
}

/** THE SCORPION, as the game holds a monster's pictures: its stand, its scuttle, its pincer snap (`attack`), its tail strike (`clips.moves.sting`), its flinch and its death. */
export function makeScorpionArt(): ActorArt {
  const set = (view: GameView): AnimSet => {
    const frame = (which: string, t: number): Sprite => scorpionFrame(which, t, view);
    const clip = (which: string, long: number, fps: number, hit?: number): Clip => {
      const c: Clip = { frames: lazyFrames(Math.round(long * fps) + 1, (i) => frame(which, i / fps)), fps };
      if (hit !== undefined) c.hit = hit;
      return c;
    };
    const attack = clip('attack', SC_SNAP.long, SC_SNAP.fps, SC_SNAP.hit);
    return {
      idle: lazyFrames(SC_STAND.frames, (i) => frame('stand', i / SC_STAND.fps)),
      walk: lazyFrames(SC_WALK.frames, (i) => frame('walk', i / SC_WALK.fps)),
      attack: lazyFrames(3, (i) => attack.frames[[5, 9, 12][i]]),
      idleFps: SC_STAND.fps,
      walkFps: SC_WALK.fps,
      clips: { attack, die: clip('dying', SC_DIE.long, SC_DIE.fps), reel: clip('reel', SC_REEL.long, SC_REEL.fps), moves: { sting: clip('sting', SC_STING.long, SC_STING.fps, SC_STING.hit) } },
    };
  };
  return { front: set('front'), back: set('back') };
}

