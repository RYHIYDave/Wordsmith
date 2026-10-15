// FLOOR 8'S SMALL MOBS, THE DUST DEVILS OF ECHO CANYON: a mock-up (nothing of the game imports this file; `DEVIL_ON`
// is off).
//
// HIS BRIEF, asked as his art rulebook's questions for a new character (15 Oct, the first four by 08:51, the rest by
// 09:00, each his pick, the labels as he tapped them): what it is, “Red sand whirlwind, a cult bell inside
// (Recommended)”; how big, “Waist-high, thin and tall (Recommended)”; how it moves, “Weaving, never still
// (Recommended)”; its one attack, “Lashes you with a whip of sand (Recommended)”; how it dies, “The wind dies, the bell
// drops and cracks (Recommended)”; when it is hit, “Flickers and stutters” (not the recommended pick); what it must not
// look like, “Not a cartoon tornado with a face (Recommended)”; its sound (sound rule 7), “Howling wind, hissing sand,
// its bell (Recommended)”.
//
// READ AS, NOT ASKED (the pictures are to show them): an enemy, so its bell's glow and its edge are the enemy's pink
// while it lives, and nothing cyan; its sand the canyon's red rock, but darker and bolder than the pale floor it spins
// on (Colour 5: “Neon on dark”), so it reads against it; no face and no eyes: its bell's glow is all the face it has;
// it has no feet, so it glides, and it weaves in its own swaying as well as in how the game steers it.
//
// NOT ON THE HEROES' BONES: a whirlwind has none. It is painted from its own solids, as the scorpion is
// (art/canyon_scorpions.ts), in the same painter (art/new_mobs3.ts's paintBits): bands of its sand wound round it,
// rising as they go round; its bell tumbling in the hollow at its heart; grit flung round it.
//
// THIS FIRST STEP: its look, standing (his rulebook: a sheet of it standing, front and back, beside a hero, before
// anything moves), and its stand: never still, spinning, its sand rising, swaying and weaving where it stands.

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
export const DEVIL_ON = { on: false };

const cl01 = (v: number): number => Math.max(0, Math.min(1, v));
const sm = (v: number): number => {
  const u = cl01(v);
  return u * u * (3 - 2 * u);
};
const fr = (t: number): number => t - Math.floor(t);
const TAU = Math.PI * 2;
const add = (a: V3, b: V3): V3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const sub = (a: V3, b: V3): V3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const mul = (a: V3, k: number): V3 => [a[0] * k, a[1] * k, a[2] * k];
const dot = (a: V3, b: V3): number => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const len = (a: V3): number => Math.hypot(a[0], a[1], a[2]);
const norm = (a: V3, or: V3 = [0, 0, 1]): V3 => {
  const l = len(a);
  return l > 1e-9 ? mul(a, 1 / l) : or;
};
const cross = (a: V3, b: V3): V3 => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];

// ---------------------------------------------------------------------------------------------
// ITS COLOURS: the canyon's red rock ground to dust, but darker and hotter than the pale sand of the floor (Colour 5:
// “Neon on dark”; never mud-brown all over): the near side of its sand a deep rust-red lit to hot orange where the
// light falls; the far side, seen through the gaps, nearly black-red, and where its bell lights it from inside, the
// cult's pink; its bell old bronze, its mouth burning the cult's pink to gold (FLAME); grit dark and pale. Nothing cyan.

const DUST: Ramp = ['#2a0a10', '#5a1414', '#9a2a1a', '#d4502a', '#ff8a40'];
const DEEP: Ramp = ['#10050a', '#1e0910', '#33111a', '#4c1a22', '#66282a'];
const HEART: Ramp = ['#2a0818', '#4a0e2c', '#7c1846', '#b42a60', '#e64c86'];
const BRONZE: Ramp = ['#3a1c08', '#7a4410', '#c07a1a', '#f0b030', '#fff0a0'];
const GRIT = ['#2a0c0e', '#5a1e16', '#e8a868', '#ffdca0'] as const;
/** The heap of its sand it leaves: its red dust, lit on top. */
const HEAP: Ramp = ['#3a1010', '#6a1e16', '#9a3420', '#c4502c', '#e07a44'];

// ---------------------------------------------------------------------------------------------
// ITS BODY, in picture units (the knight stands 58 high; his waist is about 30 up). x forward, y left, z up; its foot
// on the floor at the origin.

/** How high its funnel stands: waist-high to the knight, and thin. */
const DD_HIGH = 32;
/** Its funnel's girth: a thin neck on the floor, widening as it rises; its top spilling out. */
const R_FOOT = 1.2;
const R_TOP = 8.2;
/** How many bands of its sand are wound round it at once. */
/** How far up its funnel its bell tumbles (a share of its height). */
const BELL_UP = 0.46;
/** Its bell: how long from its crown to its mouth, and how wide its mouth. */
const BELL_LONG = 9.6;
const BELL_MOUTH = 4.8;

/** Its stand: sixteen frames a second, a round of 1.5 s; never still. */
export const DD_STAND = { frames: 24, fps: 16, period: 1.5 } as const;

/** The canvas it is painted on, and its floor point on it. */
export const DD_CANVAS = { w: 180, h: 150, ax: 90, ay: 110 };
/** Its pool of light while it lives (the enemy's pink, faint, round its bell). */
const DD_AURA = { x: DD_CANVAS.ax, y: DD_CANVAS.ay - 14, r: 26, color: '#ff3a78', a: 0.08 };

// ---------------------------------------------------------------------------------------------
// ITS POSES

/** One moment of it. */
interface DdPose {
  /** Its foot on the floor, forward and to its left. */
  x: number;
  y: number;
  /** How high its funnel stands, and its girth (1 as it stands). */
  high: number;
  girth: number;
  /** Where its top has swayed to (forward, left), and the snaking up its length: how far, and where along it. */
  top: [number, number];
  snake: number;
  snakeAt: number;
  /** How far round its sand has spun (radians, its left way round, seen from above), and how far up it has flowed (in heights). */
  spin: number;
  rise: number;
  /** How much of its sand there is (1 all; 0 none). */
  sand: number;
  /** Its bell: where it is from its funnel's middle at its height, which way its mouth faces, and how bright it burns (0 out). */
  bellOff: V3;
  bellDown: V3;
  burn: number;
  /** Still living: its pink edge is painted round it. */
  alive: boolean;
  /** Grit and flung sand laid over its picture (each its place, colour and size); lights of its bell. */
  chips: [V3, string, number][];
  flares: [V3, number, number][];
  /** Its stutter as it is struck: how far its rings are jolted, every other one the other way (0 none), and which way this frame. */
  jolt: number;
  joltSide: number;
  /** Its whip of sand: the points of it from its root on its side to its tip, and how thick at its root (none: not lashing). */
  whip: V3[] | null;
  whipThick: number;
  /** The heap of its sand on the floor as it dies (0 none, 1 all of it). */
  heap: number;
  /** Its bell once it has dropped out of it: where it is, which way its mouth faces; how far it has cracked (0 whole, 1 split). */
  bellAt: V3 | null;
  crack: number;
  /** Rings of sound in the air (its bell ringing once as it lands): where, how long since, how long they last. */
  rings: [V3, number, number][];
}

/** The middle of its funnel at `h` (a share of its height). */
function middleAt(P: DdPose, h: number): V3 {
  const k = Math.pow(cl01(h), 1.4);
  const s = P.snake * Math.sin(TAU * 1.1 * h - P.snakeAt) * h;
  const c = P.snake * Math.cos(TAU * 1.1 * h - P.snakeAt) * h;
  return [P.x + P.top[0] * k + s, P.y + P.top[1] * k + 0.7 * c, h * P.high];
}
/** Its funnel's girth at `h`: a thin neck on the floor widening as it rises, its top spilling out. */
function girthAt(P: DdPose, h: number): number {
  const spill = 1.4 * Math.pow(sm((h - 0.8) / 0.25), 2);
  return P.girth * (R_FOOT + (R_TOP - R_FOOT) * Math.pow(cl01(h), 1.1) + spill);
}

/** Its stand: it never stops spinning, its sand rising up it; it sways, its top wandering and a snake running up it; its foot weaves on the spot; its bell tumbles in its heart. */
function standPose(t: number): DdPose {
  const ph = fr(t / DD_STAND.period);
  const a = TAU * ph;
  return {
    x: 1.0 * Math.sin(a),
    y: 1.4 * Math.sin(2 * a),
    high: DD_HIGH * (1 + 0.03 * Math.sin(2 * a + 0.6)),
    girth: 1 - 0.035 * Math.sin(2 * a + 0.6),
    top: [2.4 * Math.sin(a + 1.3), 3.0 * Math.sin(2 * a + 0.4)],
    snake: 1.3,
    snakeAt: 2 * a,
    spin: TAU * 2 * ph,
    rise: ph,
    sand: 1,
    bellOff: [0.9 * Math.cos(a), 0.9 * Math.sin(a), 0.6 * Math.sin(2 * a)],
    bellDown: norm([0.45 * Math.sin(2 * a), 0.45 * Math.cos(a + 0.5), -1]),
    burn: 1 + 0.25 * Math.sin(3 * a),
    alive: true,
    chips: [],
    flares: [],
    jolt: 0,
    joltSide: 1,
    whip: null,
    whipThick: 0,
    heap: 0,
    bellAt: null,
    crack: 0,
    rings: [],
  };
}

/** Its weave as the game carries it: sixteen frames a second, a round of 1.0 s (one swerve each way). */
export const DD_WALK = { frames: 16, fps: 16, period: 1.0 } as const;
/** The pace its trail of dust is painted for (tiles a second); at any other the trail drifts a little. */
export const DD_PACE = 2.4;
/** ITS LASH, its one attack: it spins up taller and thinner (to `warn`), held trembling, its whip of sand curled at its side (the warning, to `throw`); the whip cracks out and lashes `reach` before it (THE BLOW, `hit`); it snaps on past, coils back into it, and it settles by `long`. Light: no freeze. */
export const DD_LASH = { long: 0.9, warn: 0.28, throw: 0.42, hit: 0.5, reach: 50, fps: 30 } as const;
/** STRUCK, his pick: it flickers and stutters: its spin stalls, its rings jolting this way and that, its bell's pink flickering, knocked back a little (to `stutter`); it is spinning on its stand again by `long`. */
export const DD_REEL = { long: 0.45, stutter: 0.26, fps: 30 } as const;
/** ITS DEATH, his pick: the wind dies: struck and stuttering (to `freeze`), its spin dying, it sags and pours down into a heap of its sand; its bell drops out of it (`drop`), lands on the heap and rings once (`land`), cracks (`crack`) and its pink goes out (by `out`); still from `still`. */
export const DD_DIE = { long: 1.4, freeze: 0.1, drop: 0.46, land: 0.72, crack: 0.88, out: 1.12, still: 1.2, fps: 30 } as const;

/** A stand as fast as `rate` stand rounds a second, `t` in: the stand's own moment `tau` along. */
function stood(tau: number): DdPose {
  return standPose(((tau % DD_STAND.period) + DD_STAND.period) % DD_STAND.period);
}
/** A curve from 0 to 1, eased in and out. */
const ease = (v: number): number => sm(v);
/** Of the stand's frames a second, the 30 a second of a move: which frame it is (for its stutter's flicker). */
const frameOf = (t: number): number => Math.round(t * 30);

/** ITS WEAVE: spinning twice as fast as it stands; its foot swerving to one side and the other and surging; leaning into its way, its top swerving after its foot; dust kicked back off the floor behind it. */
function walkPose(t: number): DdPose {
  const ph = fr(t / DD_WALK.period);
  const a = TAU * ph;
  const P = stood(fr(ph * 2) * DD_STAND.period);
  P.x = 1.4 * Math.sin(2 * a);
  P.y = 6 * Math.sin(a);
  // (its top leaning forward into its way, and swerving after its foot, a beat late)
  P.top = [5.5 + 1.4 * Math.sin(2 * a - 0.9), 6 * Math.sin(a - 1.1) - P.y];
  P.snake = 1.8;
  P.chips = trailOf(t);
  return P;
}
/** The dust it kicks back off the floor as it goes, left behind on the sand at its pace. */
function trailOf(t: number): [V3, string, number][] {
  const out: [V3, string, number][] = [];
  const N = 18;
  const life = 0.5;
  const v = DD_PACE * TILE3;
  for (let j = 0; j < N; j++) {
    const age = fr(j / N + t / life) * life;
    const born = t - age;
    const fx = 1.4 * Math.sin(2 * TAU * fr(born / DD_WALK.period));
    const fy = 6 * Math.sin(TAU * fr(born / DD_WALK.period));
    const side = (hash(j, 1, 61) - 0.5) * 2;
    const up = 10 + 10 * hash(j, 2, 61);
    const z = Math.max(0.6, 0.8 + up * age - 60 * age * age);
    if (age > life * (0.6 + 0.4 * hash(j, 3, 61))) continue;
    out.push([[fx - v * age - 3 - 8 * age, fy + side * (2 + 14 * age), z], j % 3 === 0 ? GRIT[2] : j % 3 === 1 ? DUST[2] : DUST[3], 2]);
  }
  return out;
}

/** Where its whip's tip is, `u` along its throw (0 cocked at its side, high; 1 the blow, before it; on past to 1.4, below and beyond). */
function whipTip(u: number): V3 {
  const R = DD_LASH.reach;
  const keys: [number, V3][] = [
    [0, [-4, 9, 36]],
    [0.35, [6, 6, 44]],
    [0.7, [R * 0.62, 2, 34]],
    [1, [R, 0, 12]],
    [1.2, [R + 6, -5, 3]],
    [1.4, [R + 2, -9, 2]],
  ];
  for (let i = 1; i < keys.length; i++) {
    if (u <= keys[i][0] || i === keys.length - 1) {
      const [u0, a] = keys[i - 1];
      const [u1, b] = keys[i];
      const k = cl01((u - u0) / (u1 - u0));
      const w = k * k * (3 - 2 * k);
      return [a[0] + (b[0] - a[0]) * w, a[1] + (b[1] - a[1]) * w, a[2] + (b[2] - a[2]) * w];
    }
  }
  return keys[0][1];
}
/** ITS LASH: spun up taller, thinner and faster, leaning back, trembling, its bell burning brighter, its whip of sand curling up at its side; the whip cracks out over and down onto what is before it; it lunges after it, the whip snaps on past and coils back into it. */
function lashPose(t: number): DdPose {
  const L = DD_LASH;
  // (its spin: a whole round of its stand, but most of it in the wind-up and the throw: it spins up)
  const spun = t < L.hit ? 0.75 * ease(t / L.hit) : 0.75 + 0.25 * ease((t - L.hit) / (L.long - L.hit));
  const P = stood(spun * DD_STAND.period * 2);
  const up = t < L.warn ? ease(t / L.warn) : t < L.hit ? 1 : 1 - ease((t - L.hit) / (L.long - 0.2 - L.hit));
  const lunge = t < L.throw ? 0 : t < L.hit + 0.06 ? ease((t - L.throw) / (L.hit + 0.06 - L.throw)) : 1 - ease((t - L.hit - 0.06) / (L.long - L.hit - 0.06));
  const shake = t >= L.warn && t < L.throw ? Math.sin(t * 190) * 0.9 : 0;
  P.high *= 1 + 0.28 * up;
  P.girth *= 1 - 0.22 * up;
  // (leaning back as it winds up; thrown forward after its whip)
  P.top = [P.top[0] * (1 - up) - 6 * up * (1 - lunge) + 9 * lunge, P.top[1] * (1 - up) + shake];
  P.x += 3 * lunge;
  P.y += shake * 0.5;
  P.burn = P.burn * (1 - up) + 1.7 * up;
  // its whip: curled up at its side through the warning; cracked out from `throw`; coiled back in from just after the blow
  const root = add(middleAt(P, 0.72), [0, girthAt(P, 0.72) * 0.7, 0]);
  let u = 0;
  let out = 0;
  if (t < L.warn) out = 0.45 * ease((t - 0.1) / (L.warn - 0.1));
  else if (t < L.throw) out = 0.45 + 0.05 * Math.sin(t * 120);
  else if (t < L.hit) {
    u = ease((t - L.throw) / (L.hit - L.throw));
    out = 1;
  } else {
    u = 1 + 0.4 * ease((t - L.hit) / 0.14);
    out = 1 - ease((t - L.hit - 0.08) / 0.26);
  }
  if (out > 0.02) {
    const tip = whipTip(u);
    // (a curve from its root, up off its side, to its tip; only `out` of it out of it as it curls up and coils back)
    const c1 = add(root, [2, 8, 10]);
    const c2: V3 = [(c1[0] + tip[0]) / 2, (c1[1] + tip[1]) / 2, Math.max(c1[2], tip[2]) + 6 * (1 - Math.min(1, u))];
    const pts: V3[] = [];
    const n = 16;
    for (let i = 0; i <= n; i++) {
      const k = (i / n) * out;
      const a1 = 1 - k;
      const p: V3 = [
        a1 * a1 * a1 * root[0] + 3 * a1 * a1 * k * c1[0] + 3 * a1 * k * k * c2[0] + k * k * k * tip[0],
        a1 * a1 * a1 * root[1] + 3 * a1 * a1 * k * c1[1] + 3 * a1 * k * k * c2[1] + k * k * k * tip[1],
        a1 * a1 * a1 * root[2] + 3 * a1 * a1 * k * c1[2] + 3 * a1 * k * k * c2[2] + k * k * k * tip[2],
      ];
      // (as it curls up before the throw, the whip winds round on itself)
      const curl = (1 - Math.min(1, u * 3)) * (i / n) * 9;
      pts.push([p[0] + Math.sin(i * 0.9 + t * 30) * curl * 0.4, p[1], Math.max(0.8, p[2] + Math.cos(i * 0.9 + t * 30) * curl * 0.4)]);
    }
    P.whip = pts;
    P.whipThick = 3.4;
    // (grit streaming off it as it flies)
    if (u > 0.05) for (let j = 0; j < 10; j++) {
      const q = pts[2 + Math.floor(hash(j, 1, 73) * (pts.length - 3))];
      const d = 2 + 4 * hash(j, 2, 73);
      P.chips.push([[q[0] - d * 0.6, q[1] + (hash(j, 3, 73) - 0.5) * 2 * d, Math.max(1, q[2] + (hash(j, 4, 73) - 0.3) * d)], j % 3 === 0 ? GRIT[3] : j % 3 === 1 ? DUST[3] : GRIT[2], 2]);
    }
  }
  // grit sucked up off the floor into it as it spins up; the crack: a burst of grit and sand where it lands, and a flash of the cult's pink
  if (t < L.throw) {
    for (let j = 0; j < 14; j++) {
      const k = fr(j / 14 + t * 2.2);
      const th = P.spin * 1.4 + j * 2.4;
      const r = (9 - 7 * k) * (0.6 + 0.4 * up);
      const m = middleAt(P, 0);
      if (up > 0.15 && hash(j, 1, 63) < up) P.chips.push([[m[0] + Math.cos(th) * r, m[1] + Math.sin(th) * r, 0.8 + 16 * k * k], j % 2 ? DUST[3] : GRIT[2], 2]);
    }
  }
  if (t >= L.hit && t < L.hit + 0.3) {
    const tau = t - L.hit;
    const at: V3 = [L.reach, 0, 12];
    if (tau < 0.08) P.flares.push([at, 22, 0.8]);
    // (the crack: a star of the cult's fire where its tip snaps)
    if (tau < 0.07) for (const [dx, dy, dz] of [[0, 0, 0], [0, 2, 0], [0, -2, 0], [0, 0, 2], [0, 0, -2], [0, 4, 0], [0, -4, 0], [0, 0, 4], [0, 0, -4]] as const) P.chips.push([[at[0] + dx, at[1] + dy, at[2] + dz], Math.abs(dy) + Math.abs(dz) > 2 ? FLAME[2] : FLAME[4], 2]);
    for (let j = 0; j < 34; j++) {
      if (hash(j, 9, 65) < tau / 0.3) continue;
      const th = hash(j, 1, 65) * TAU;
      const v = 50 + 80 * hash(j, 2, 65);
      const r = v * Math.min(tau, 0.2);
      const z = Math.max(0.8, at[2] + (hash(j, 3, 65) - 0.4) * 50 * tau - 120 * tau * tau);
      P.chips.push([[at[0] + Math.cos(th) * r * 0.6, at[1] + Math.sin(th) * r, z], j < 4 ? FLAME[3] : j < 8 ? FLAME[2] : j % 2 ? DUST[3] : GRIT[2], j < 3 && tau < 0.1 ? 4 : 2]);
    }
  }
  return P;
}

/** STRUCK: it flickers and stutters (his pick): frozen in its spin, its rings jolted this way and that a frame at a time, its bell's pink flickering; knocked back and squashed down a little, grit spat off it; then spinning again on its stand. */
function reelPose(t: number): DdPose {
  const R = DD_REEL;
  const k = t < R.stutter ? 1 - ease(t / R.stutter) * 0.4 : 0.6 * (1 - ease((t - R.stutter) / (R.long - R.stutter)));
  const back = t < 0.06 ? ease(t / 0.06) : 1 - ease((t - 0.06) / (R.long - 0.06));
  // (its spin stalls: barely turning, and jerking back and on, until it catches again)
  const f = frameOf(t);
  const stall = t < R.stutter ? (f % 2 ? -0.03 : 0.02) : 0;
  const P = stood(stall);
  P.jolt = t < R.stutter ? 3.6 * k : 0;
  P.joltSide = f % 2 ? 1 : -1;
  P.x -= 7 * back;
  P.top = [P.top[0] - 5 * back, P.top[1]];
  P.high *= 1 - 0.2 * back;
  P.girth *= 1 + 0.16 * back;
  P.burn = t < R.stutter ? (f % 2 ? 1.8 : 0.25) : 1;
  // grit spat off it where it was struck
  if (t < 0.32) {
    for (let j = 0; j < 12; j++) {
      const th = Math.PI * (0.6 + 0.8 * hash(j, 1, 67)) * (j % 2 ? 1 : -1);
      const v = 30 + 40 * hash(j, 2, 67);
      const z = Math.max(0.8, 10 + 18 * hash(j, 3, 67) + 30 * t - 140 * t * t);
      if (hash(j, 4, 67) < t / 0.32) continue;
      P.chips.push([[3 + Math.cos(th) * v * t, Math.sin(th) * v * t, z], j % 3 === 0 ? GRIT[3] : j % 3 === 1 ? DUST[3] : GRIT[1], 2]);
    }
  }
  return P;
}

/** Its body as it dies (its bell aside): struck and stuttering; the wind dies, its spin running down; it sags and pours down into a heap of its sand. */
function dyingBody(t: number): DdPose {
  const D0 = DD_DIE;
  const f = frameOf(t);
  // (its spin running down: a quarter of a stand's round, slowing to nothing)
  const run = t < D0.freeze ? 0 : 1 - Math.pow(1 - cl01((t - D0.freeze) / 0.65), 2);
  const P = stood(0.25 * DD_STAND.period * run);
  P.alive = false;
  const sag = ease((t - D0.freeze) / (0.7 - D0.freeze));
  P.high *= 1 - 0.72 * sag;
  P.girth *= 1 + 0.35 * sag;
  P.sand = 1 - ease((t - 0.2) / 0.55);
  P.heap = ease((t - 0.15) / 0.6);
  P.top = [P.top[0] * (1 - sag), P.top[1] * (1 - sag) + 3 * sag];
  P.jolt = t < D0.freeze ? 2.6 : 0;
  P.joltSide = f % 2 ? 1 : -1;
  return P;
}
/** How high the heap of its sand is at its top. */
const HEAP_TOP = 2.8;
/** ITS DEATH: its body dying (above); its bell, with it as it sags, drops out of it, lands on the heap with a bounce, rings once, rolls onto its side, cracks, and its pink goes out. */
function deathPose(t: number): DdPose {
  const D0 = DD_DIE;
  const P = dyingBody(t);
  const f = frameOf(t);
  P.burn = t < D0.freeze ? (f % 2 ? 1.8 : 0.3) : t < D0.crack ? 1.2 : t < D0.crack + 0.06 ? 2 : Math.max(0, 1.4 * (1 - (t - D0.crack - 0.06) / (D0.out - D0.crack - 0.06)));
  if (t >= D0.out) P.burn = 0;
  // its sand pouring down out of it into the heap
  if (t > 0.15 && t < 0.85) {
    for (let j = 0; j < 26; j++) {
      const k = fr(j / 26 + t * 2.4);
      const h = 0.15 + 0.7 * hash(j, 1, 69);
      const th = hash(j, 2, 69) * TAU + P.spin;
      const m = middleAt(P, h);
      const g = girthAt(P, h) * (0.4 + 0.6 * hash(j, 3, 69));
      const z = m[2] * (1 - k * k);
      if (hash(j, 4, 69) > P.sand + 0.2) continue;
      P.chips.push([[m[0] + Math.cos(th) * g, m[1] + Math.sin(th) * g, Math.max(1, z)], j % 3 === 0 ? GRIT[2] : j % 3 === 1 ? DUST[2] : DUST[3], 2]);
    }
  }
  // (its bell held up where it was by the last of the wind as the rest of it sags away under it, trembling)
  const held = (u: number): V3 => {
    const B = stood(0);
    const c = add(middleAt(B, BELL_UP), B.bellOff);
    const k = ease((u - D0.freeze) / (D0.drop - D0.freeze));
    return [c[0] * (1 - 0.5 * k), c[1] * (1 - 0.5 * k) + (u > D0.freeze ? 0.5 * Math.sin(u * 140) * k : 0), c[2] + 1.5 * k];
  };
  if (t < D0.drop) P.bellAt = held(t);
  if (t >= D0.drop) {
    // (where it was as it dropped, and how it falls from there: landing on the heap at `land`, sunk a little into it)
    const from = held(D0.drop);
    const roll = ease((t - D0.land - 0.06) / 0.16);
    const down = norm([Math.sin(roll * 1.45) * 0.3, Math.sin(roll * 1.45), -Math.cos(roll * 1.45)]);
    const restOf = (d: V3): number => 1.6 - bellLow(d);
    const rest0 = restOf([0, 0, -1]);
    const fall = D0.land - D0.drop;
    const gAcc = (2 * (from[2] - rest0)) / (fall * fall);
    const b = t - D0.land;
    const z = t < D0.land ? from[2] - 0.5 * gAcc * (t - D0.drop) * (t - D0.drop) : restOf(down) + (b < 0.14 ? 2.2 * Math.sin((Math.PI * b) / 0.14) : 0);
    const k = ease((t - D0.drop) / fall);
    P.bellAt = [from[0] * (1 - k) + 1.5 * roll, from[1] * (1 - k) + 2 * roll, z];
    P.bellDown = down;
    const rest = rest0;
    P.crack = ease((t - D0.crack) / 0.08);
    if (t >= D0.land) P.rings.push([[P.bellAt[0], P.bellAt[1], rest + 2], t - D0.land, 0.4]);
    if (t >= D0.crack && t < D0.crack + 0.12) P.flares.push([P.bellAt, 14, 0.6]);
    // (a chip of bronze off it as it cracks, and a spark of its pink)
    if (t >= D0.crack && t < D0.crack + 0.3) {
      const tau = t - D0.crack;
      P.chips.push([[P.bellAt[0] + 22 * tau, P.bellAt[1] - 10 * tau, Math.max(1, P.bellAt[2] + 20 * tau - 120 * tau * tau)], BRONZE[3], 2]);
      P.chips.push([[P.bellAt[0] - 14 * tau, P.bellAt[1] + 16 * tau, Math.max(1, P.bellAt[2] + 14 * tau - 120 * tau * tau)], FLAME[2], 2]);
    }
  }
  return P;
}

function poseOf(which: string, t: number): DdPose {
  if (which === 'stand') return standPose(t);
  if (which === 'walk') return walkPose(t);
  if (which === 'attack') return lashPose(t);
  if (which === 'reel') return reelPose(t);
  return deathPose(t);
}

// ---------------------------------------------------------------------------------------------
// ITS PAINTER

/** A ring of its sand: where its streaks start round, how far round each goes, how thick they are, and how much they climb as they go. */
function bandOf(i: number): { from: number; arc: number; thick: number; climb: number } {
  return {
    from: i * 2.39996 + hash(i, 1, 51) * 0.8,
    arc: (LOOK.arc[0] + LOOK.arc[1] * hash(i, 2, 51)) * (Math.PI / 180),
    thick: LOOK.thick[0] + LOOK.thick[1] * hash(i, 3, 51),
    climb: LOOK.climb[0] + LOOK.climb[1] * hash(i, 4, 51),
  };
}
/** How its sand is wound (for trying looks): rings up it, streaks to a ring, each streak's arc (degrees), thickness, climb (in heights), and how thin its far side goes toward its top. */
export const LOOK = { rings: 8, streaks: 2, arc: [170, 60], thick: [1.3, 0.4], climb: [0.14, 0.06], farTop: 0.2 };

/** THE DUST DEVIL AS SOLIDS: the streaks of its sand (the near side, a ring to a part; the far side as one, dark, lit pink by its bell), the light of its bell behind it, its bell. `eye`: the way to the eye. */
function devilBits(P: DdPose, put: Put, eye: V3): void {
  const flat = norm([eye[0], eye[1], 0], [1, 0, 0]);
  // its sand: rings of streaks up it, each streak sweeping round its left way (seen from above), rising a little as
  // it goes; the rings flowing up it and spilling off its top; thinnest at their ends, thinned to nothing at its foot
  // and its top
  const bellH = BELL_UP;
  const side = norm(cross([0, 0, 1], flat), [0, 1, 0]);
  for (let i = 0; i < LOOK.rings; i++) {
    const b = bandOf(i);
    const h0 = fr(i / LOOK.rings + P.rise);
    for (let a = 0; a < LOOK.streaks; a++) {
      const K = 12;
      let prev: { p: V3; r: number; near: boolean } | null = null;
      for (let k = 0; k <= K; k++) {
        const s = k / K;
        const h = h0 + s * b.climb;
        const th = P.spin + b.from + (a * TAU) / LOOK.streaks + s * b.arc;
        const out: V3 = [Math.cos(th), Math.sin(th), 0];
        const g = girthAt(P, h);
        const p0 = add(middleAt(P, h), mul(out, g));
        const facing = dot(out, flat);
        const near = facing > -0.05;
        // (thin at its ends, and fading in off the floor and out at its top)
        let r = b.thick * Math.pow(Math.sin(Math.PI * s), 0.55) * sm(h / 0.07) * (1 - sm((h - 0.82) / 0.16)) * P.sand;
        // (a window before its bell: the streaks passing before it there are thinned away, so the bell is seen)
        if (near) r *= 1 - (1 - sm((Math.abs(h - bellH) - 0.1) / 0.08)) * sm((facing - 0.1) / 0.35);
        // (its far side thinner toward its top, so that its open top is not a lid)
        else r *= 1 - (1 - LOOK.farTop) * sm((h - 0.55) / 0.3);
        // (never into the rock; struck, each ring jolted aside, every other one the other way)
        const j = P.jolt * P.joltSide * (i % 2 ? 1 : -1);
        const p: V3 = [p0[0] + side[0] * j, p0[1] + side[1] * j, Math.max(p0[2], r)];
        if (prev && prev.r > 0.25 && r > 0.25) {
          const bothNear = prev.near && near;
          const ramp = bothNear ? DUST : Math.abs(h - bellH) < 0.2 && P.burn > 0.2 ? HEART : DEEP;
          put(bothNear ? `band${i}` : 'far', bothNear ? `band${i}.${a}.${k}` : `far${i}.${a}.${k}`, { k: 'rod', a: prev.p, b: p, ra: prev.r, rb: r, ramp });
        }
        prev = { p, r, near };
      }
    }
  }
  // the light of its bell on the far side of its hollow, behind it: a glow of the cult's pink round it
  if (P.burn > 0.2 && P.sand > 0.35 && !P.bellAt) {
    const g = girthAt(P, bellH);
    const c = sub(add(middleAt(P, bellH), P.bellOff), mul(flat, g * 0.75));
    const hot: Skin = (u, tone) => HEART[Math.max(2, Math.min(4, tone + (P.burn > 0.9 ? 1 : 0)))];
    put('heart', 'heart', { k: 'ball', c, ax: [mul(flat, g * 0.3), mul(side, g * 0.95), [0, 0, BELL_LONG * 0.95]], skin: hot });
  }
  // its whip of sand: thick at its root on its side, thinning to its tip
  if (P.whip) {
    const n = P.whip.length - 1;
    for (let k = 1; k <= n; k++) {
      const ra = P.whipThick * (1 - (0.8 * (k - 1)) / n);
      const rb = P.whipThick * (1 - (0.8 * k) / n);
      put('whip', `whip${k}`, { k: 'rod', a: P.whip[k - 1], b: P.whip[k], ra, rb, ramp: DUST });
    }
  }
  // the heap of its sand on the floor, as it dies
  if (P.heap > 0.02) {
    const w = 3 + 5.5 * Math.sqrt(P.heap);
    const hz = (HEAP_TOP * P.heap) / 2;
    const foot = middleAt(P, 0);
    put('heap', 'heap', { k: 'ball', c: [foot[0], foot[1], hz], ax: [[w, 0, 0], [0, w * 0.9, 0], [0, 0, hz]], skin: HEAP });
  }
  // its bell: old bronze, tumbling in the hollow at its heart, its mouth burning the cult's pink
  bellBits(P, put);
}

/** How far below its middle the lowest of its bell is, its mouth facing `down` (a negative number). */
function bellLow(down: V3): number {
  const d = norm(down, [0, 0, -1]);
  const e1 = norm(cross(d, [1, 0, 0]), [0, 1, 0]);
  const e2 = norm(cross(d, e1));
  let low = Infinity;
  for (let k = 0; k <= 7; k++) {
    const t = k / 7;
    const r = BELL_MOUTH * (0.42 + 0.22 * t + 0.36 * Math.pow(t, 4));
    const z = d[2] * (t * BELL_LONG - BELL_LONG * 0.5) - r * Math.hypot(e1[2], e2[2]) - 0.8 * Math.abs(d[2]);
    low = Math.min(low, z);
  }
  // (its clapper, just out of its mouth)
  return Math.min(low, d[2] * (BELL_LONG * 0.5 + 0.7) - 0.9);
}
/** ITS BELL: a crown and its loop, the bell flaring to its mouth, the mouth's rim, the pink burning inside it, and its clapper. */
function bellBits(P: DdPose, put: Put): void {
  const c = P.bellAt ?? add(middleAt(P, BELL_UP), P.bellOff);
  const down = norm(P.bellDown, [0, 0, -1]);
  const e1 = norm(cross(down, [1, 0, 0]), [0, 1, 0]);
  const e2 = norm(cross(down, e1));
  const crown = add(c, mul(down, -BELL_LONG * 0.5));
  // the loop it hung by
  put('bell', 'loop', { k: 'rod', a: add(crown, mul(down, -0.4)), b: add(crown, mul(down, -1.6)), ra: 0.7, rb: 0.7, ramp: BRONZE });
  const burning: Skin = () => (P.burn > 0.3 ? FLAME[P.burn > 1.2 ? 3 : 2] : '#120a14');
  for (let k = 0; k <= 7; k++) {
    const t = k / 7;
    const at = add(crown, mul(down, t * BELL_LONG));
    const r = BELL_MOUTH * (0.42 + 0.22 * t + 0.36 * Math.pow(t, 4));
    put('bell', `bell${k}`, { k: 'ball', c: at, ax: [mul(e1, r), mul(e2, r), mul(down, 0.8)], skin: k === 7 ? burning : BRONZE });
  }
  // its clapper, hanging just out of its mouth
  put('bell', 'clapper', { k: 'ball', c: add(crown, mul(down, BELL_LONG + 0.7)), ax: [[0.9, 0, 0], [0, 0.9, 0], [0, 0, 0.9]], skin: BRONZE });
  if (P.burn > 0.3) put('glow', 'glow', { k: 'glow', p: add(crown, mul(down, BELL_LONG)), c: FLAME[2], r: 12 + 6 * Math.min(1.5, P.burn), a: 0.3 + 0.2 * Math.min(1, P.burn) });
  // cracked: a crooked split down its side from its crown to its mouth, its pink burning through it until it goes out
  if (P.crack > 0) {
    const upSide = norm(cross(down, e1)[2] >= 0 ? cross(down, e1) : mul(cross(down, e1), -1));
    const zig = [0, 0.3, 0.55, 0.8, 1].map((t, k): V3 => {
      const r = BELL_MOUTH * (0.42 + 0.22 * t + 0.36 * Math.pow(t, 4)) + 0.15;
      return add(add(crown, mul(down, t * BELL_LONG * P.crack)), add(mul(upSide, r), mul(e1, (k % 2 ? 0.9 : -0.6) * P.crack)));
    });
    const lit: Ramp = P.burn > 0.3 ? [FLAME[1], FLAME[1], FLAME[2], FLAME[3], FLAME[3]] : ['#120a14', '#120a14', '#120a14', '#2a1a10', '#2a1a10'];
    for (let k = 1; k < zig.length; k++) put('bell', `crack${k}`, { k: 'rod', a: zig[k - 1], b: zig[k], ra: 0.5, rb: 0.45, ramp: lit });
  }
}

/** GRIT flung round it as it spins: dark specks and pale ones, rising with its sand, a few pebbles among them. */
function gritOf(P: DdPose): [V3, string, number][] {
  const out: [V3, string, number][] = [];
  const n = Math.round(22 * P.sand);
  for (let j = 0; j < n; j++) {
    const h = fr(j / 22 + P.rise * (0.8 + 0.4 * hash(j, 1, 57)) + hash(j, 2, 57));
    const th = P.spin * (1.1 + 0.3 * hash(j, 3, 57)) + hash(j, 4, 57) * TAU;
    const g = girthAt(P, h) + 1.4 + 2.6 * hash(j, 5, 57);
    const m = middleAt(P, h);
    const pebble = j % 4 === 0 && hash(j, 6, 57) < 0.3;
    out.push([[m[0] + Math.cos(th) * g, m[1] + Math.sin(th) * g, Math.max(1, m[2])], GRIT[j % 4], pebble ? 4 : 2]);
  }
  // (the dust it whirls along the floor round its foot: a ring of grains skimming the sand, wider than its neck)
  const foot = middleAt(P, 0);
  const m = Math.round(16 * P.sand);
  for (let j = 0; j < m; j++) {
    const th = P.spin * 1.25 + (j / 16) * TAU + 0.3 * hash(j, 1, 59);
    const g = (4.5 + 4 * hash(j, 2, 59)) * P.girth;
    const z = 0.6 + 2.2 * hash(j, 3, 59);
    out.push([[foot[0] + Math.cos(th) * g, foot[1] + Math.sin(th) * g, z], j % 3 === 0 ? GRIT[2] : j % 3 === 1 ? DUST[2] : DUST[3], 2]);
  }
  return out;
}

/** One frame of the dust devil: `which` (stand, walk: its weave, attack: its lash, reel, dying), `t` seconds in, from in front or behind. */
export function devilPainted(which: string, t: number, view: GameView = 'front'): Painted {
  const st = stage(view, DD_CANVAS.ax, DD_CANVAS.ay, DD_CANVAS);
  const P = poseOf(which, t);
  const bits: Bit[] = [];
  devilBits(P, (part, piece, shape) => {
    bits.push({ part, piece, shape });
  }, st.eye);
  const lights = paintBits(st, bits, [P.x, P.y, 12]);
  for (const [p, r, a] of P.flares) {
    const [x, y] = st.at(p);
    lights.push({ x, y, r, color: FLAME[2], a });
  }
  const px = st.whole(P.alive ? ENEMY_RIM : null);
  // its grit: laid over it where it flies before it; behind it, only where nothing of it is
  const mid = middleAt(P, 0.5);
  const flat = norm([st.eye[0], st.eye[1], 0], [1, 0, 0]);
  for (const [pt, col, size] of gritOf(P)) {
    const before = dot(sub(pt, mid), flat) > 0;
    laid(px, st, pt, col, size, !before);
  }
  for (const [pt, col, size] of P.chips) laid(px, st, pt, col, size, false);
  for (const [c, tau, life] of P.rings) airRing(px, st, c, tau, life);
  return { px, lights };
}
/** A RING OF SOUND in the air (its bell ringing once): a circle of the cult's pink round `c`, growing and thinning, `tau` after it rang, on whole game pixels. */
function airRing(px: Px, st: Stage, c: V3, tau: number, life: number): void {
  const u = tau / life;
  if (u < 0 || u >= 1) return;
  const [cx, cy] = st.at(c);
  const r = 4 + 22 * (1 - (1 - u) * (1 - u));
  const n = Math.min(80, Math.ceil((Math.PI * 2 * r) / 4));
  for (let i = 0; i < n; i++) {
    if (hash(i, 3, 71) < u * 0.8) continue;
    const a = (i / n) * Math.PI * 2;
    const x = 2 * Math.round((cx + Math.cos(a) * r - 1) / 2);
    const y = 2 * Math.round((cy + Math.sin(a) * r * 0.55 - 1) / 2);
    const col = hash(i, 4, 71) < 0.3 ? FLAME[2] : FLAME[1];
    for (let dy = 0; dy < 2; dy++) for (let dx = 0; dx < 2; dx++) if (x + dx >= 0 && y + dy >= 0 && x + dx < px.w && y + dy < px.h) px.set(x + dx, y + dy, col);
  }
}
/** A grain laid on a finished picture (after its pink edge, so that it stays its own colour), on whole game pixels; `behind`: only where nothing is painted. */
function laid(px: Px, st: Stage, p: V3, col: string, size: number, behind: boolean): void {
  const [x, y] = st.at(p);
  const xi = 2 * Math.round((x - size / 2) / 2);
  const yi = 2 * Math.round((y - size / 2) / 2);
  for (let dy = 0; dy < size; dy++) {
    for (let dx = 0; dx < size; dx++) {
      const X = xi + dx;
      const Y = yi + dy;
      if (X < 0 || Y < 0 || X >= px.w || Y >= px.h) continue;
      if (behind && px.d[(Y * px.w + X) * 4 + 3] > 0) continue;
      px.set(X, Y, col);
    }
  }
}
/** The same frame as the game holds a figure (its pool of light behind it while it lives). */
export function devilFrame(which: string, t: number, view: GameView = 'front'): Sprite {
  return toSprite(devilPainted(which, t, view), which === 'dying' ? null : DD_AURA, DD_CANVAS.ax, DD_CANVAS.ay);
}
/** Every solid of one moment of it, as the tests read them. */
export function devilSolids(which: string, t: number, eye: V3 = [1, -1, 1]): Bit[] {
  const bits: Bit[] = [];
  devilBits(poseOf(which, t), (part, piece, shape) => {
    bits.push({ part, piece, shape });
  }, norm(eye));
  return bits;
}

/** THE DUST DEVIL, as the game holds a monster's pictures: its stand, its weave (`walk`), its lash (`attack`), its flinch and its death. */
export function makeDevilArt(): ActorArt {
  const set = (view: GameView): AnimSet => {
    const frame = (which: string, t: number): Sprite => devilFrame(which, t, view);
    const clip = (which: string, long: number, fps: number, hit?: number): Clip => {
      const c: Clip = { frames: lazyFrames(Math.round(long * fps) + 1, (i) => frame(which, i / fps)), fps };
      if (hit !== undefined) c.hit = hit;
      return c;
    };
    const attack = clip('attack', DD_LASH.long, DD_LASH.fps, DD_LASH.hit);
    return {
      idle: lazyFrames(DD_STAND.frames, (i) => frame('stand', i / DD_STAND.fps)),
      walk: lazyFrames(DD_WALK.frames, (i) => frame('walk', i / DD_WALK.fps)),
      attack: lazyFrames(3, (i) => attack.frames[[10, 15, 21][i]]),
      idleFps: DD_STAND.fps,
      walkFps: DD_WALK.fps,
      clips: { attack, die: clip('dying', DD_DIE.long, DD_DIE.fps), reel: clip('reel', DD_REEL.long, DD_REEL.fps) },
    };
  };
  return { front: set('front'), back: set('back') };
}
