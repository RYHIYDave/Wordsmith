// THE MINE SHAFT, floor 5's way out (a mock-up; nothing of the game imports it).
//
// The owner, in the art chat, 11 Oct 2026, 13:00: “floor 5 is mostly dirt as you’re completely under the
// prison.  Full of cult iconography and abandoned mining equipment.  Instead of stairs at the end I’d like
// a mine shaft you ride up.” Asked which way the cage takes you, his pick by 13:05: “Up, out to town”
// (offered as: the Crypt is done, the cage hauls you up to the surface, and the next five floors start
// from town).
//
// SO: THE MINERS' SHAFT, at the bottom of its run, in the fleshmancer's hall: four great posts of squared
// timber standing round a square hole in the floor and going straight up into the dark, two guides of
// timber down its sides for the cage to run on, beams across its back sides, a collar of timber round the
// hole; the hole dark, the shaft going on down past the landing into the sump. Until he dies the cage is
// up at the top, out of sight: nothing hangs in the shaft. AS HE DIES THE CAGE COMES DOWN (its moment, in
// place of the stairwell opening on the four floors above): grit and stones rain down the shaft, the
// cage plunges out of the dark, its shoes shrieking down the guides in sparks, and slams onto the catches
// at the landing, bouncing, dust bursting out round it; its gate rattles open. Then THE RIDE UP: the
// hero steps in, the gate slams shut, the cable snaps taut and the cage lurches, and is hauled up the shaft
// into the dark, faster and faster, grit falling past it.
//
// THE CAGE: an iron cage a tile across and taller than a hero, iron corners and rails, bars down its sides,
// an iron roof with its bridle chains up to the cable; its gate on the side toward the room (+y), a gate of
// bars that slides back. For the game it comes as two layers, what is behind the hero standing in it and
// what is in front of him, and how far up it is: the main chat draws the hero between them.
//
// Measures as the game's (art/isokit.ts): picture pixels, two to a game pixel; things built in the world
// in picture pixels across the floor, KT (40) to a tile; painted in depth with floor 4's painter.
// Anchored at the middle of the shaft, on the floor.

import { Px } from '../engine/px';
import type { Sprite } from '../engine/px';
import { OLD_IRON, TIMBER } from './crypt';
import { BEYOND, DEEP, fastBlit, flame } from './floorkit';
import type { Moment, Track } from './floorkit';
import { Scene, XYZ, cloud, paintClouds, timberFace, toneAt, trackAt } from './floor4';
import type { Cloud, V3 } from './floor4';
import { TOWARD } from './floor2';
import { GRAIN, compose, hash, mix } from './kit';
import type { Ramp } from './kit';
import { EMBER } from './props';

export const IRONS: Ramp = OLD_IRON;
export const SMALL_IRON: Ramp = ['#1c1a3a', '#1c1a3a', '#4c4884', '#8480bc', '#a8a4dc'];
export const DIM_IRON: Ramp = ['#16142c', '#16142c', '#34305e', '#4c4880', '#4c4880'];
/** The cable: wire rope, dark, a dull glint along it. */
export const CABLE: Ramp = ['#100e1e', '#100e1e', '#2a2840', '#4a4664', '#5a5678'];
export const TIMBER_DIM: Ramp = [TIMBER[0], TIMBER[1], TIMBER[2], TIMBER[3], TIMBER[3]];
/** Grit and small stones off the shaft's sides (the deep workings' rock). */
export const GRIT: Ramp = ['#16122a', '#221c34', '#35304e', '#4a4266', '#5e5478'];

const add = (a: V3, b: V3): V3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const mul = (a: V3, k: number): V3 => [a[0] * k, a[1] * k, a[2] * k];
const dot = (a: readonly number[], b: readonly number[]): number => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const clamp01 = (t: number): number => Math.max(0, Math.min(1, t));
const ease = (t: number): number => {
  const k = clamp01(t);
  return k * k * (3 - 2 * k);
};

/** The shaft's measures: half its hole; where its posts stand (their middles); how high its posts go before the dark has them; the cage's half size and height; where its shoes ride. */
export const SHAFT = { hole: 23, post: 27, top: 104, cage: 19, cageH: 64, rider: 78 };
/** Where the dark takes what is up the shaft, as it takes the walls (art/ground.ts): from SOLID (56) to TALL (80), and nothing past this. */
export const DARK_FROM = 56;
export const DARK_GONE = 98;

/** How the cage is: its floor's height over the landing; its sway (a turn about its cable); its gate (0 open, 1 shut); the cable over it slack (0 taut, 1 thrown in loops) and its whip. */
export interface CagePose { z: number; sway: number; tilt: number; gate: number; slack: number; whip: number }
export const CAGE_DOWN: CagePose = { z: 0, sway: 0, tilt: 0, gate: 0, slack: 0, whip: 0 };

/** Which part of the picture a thing is: behind a hero standing in the cage, or in front of him. */
type Layer = 'back' | 'front';

/**
 * THE SHAFT: its hole, collar, posts, guides and beams; `shake` its jump as the cage strikes. Each part
 * into the layer it is in (all in `back` when there is no hero to stand between).
 */
export function paintShaft(S: { back: Scene; front: Scene }, shake: number): void {
  const { hole, post, top } = SHAFT;
  const j: V3 = [shake * 0.3, -shake * 0.2, 0];
  const B = S.back;
  // the hole: dark, going on down; its far lips lit where the light falls into it
  B.quad([[-hole, -hole, 0.1], [hole, -hole, 0.1], [hole, hole, 0.1], [-hole, hole, 0.1]], (u, v) => (u < 0.05 || v < 0.05 ? '#141024' : DEEP), 1);
  // the collar round it: squared timbers
  for (const [c, r] of [[[0, -hole - 1.6, 1.2], [hole + 3.2, 1.6, 1.2]], [[-hole - 1.6, 0, 1.2], [1.6, hole, 1.2]], [[0, hole + 1.6, 1.2], [hole + 3.2, 1.6, 1.2]], [[hole + 1.6, 0, 1.2], [1.6, hole, 1.2]]] as [V3, V3][]) {
    const front = c[0] > 0 || c[1] > 0;
    (front ? S.front : B).box(add(c, j), XYZ, r, timberFace, 2);
  }
  // the posts, at the corners, up into the dark
  for (const [x, y] of [[-post, -post], [post, -post], [-post, post], [post, post]] as const) {
    const front = x > 0 && y > 0;
    (front ? S.front : B).box(add([x, y, top / 2], j), XYZ, [2.6, 2.6, top / 2], timberFace, 3);
  }
  // the guides down the shaft's two sides (along x), for the cage's shoes
  for (const x of [-hole + 0.8, hole - 0.8]) (x > 0 ? S.front : B).box(add([x, 0, top / 2], j), XYZ, [1.2, 2.2, top / 2], (f, _u, v, n) => (f === 4 ? TIMBER[3] : f < 2 ? TIMBER[1] : Math.abs(((v * 9) % 1) - 0.5) < 0.04 ? TIMBER[0] : toneAt(n, TIMBER_DIM, -0.1)), 4);
  // the beams across its back sides, one over another; its front sides open (nothing across them: it is
  // a shaft going up, never a frame or a box)
  // (the beams in the shaft's own shadow, their faces dark: the light falls past them into the shaft)
  const inShaft = (f: number, u: number, _v: number): string => (f === 4 ? TIMBER[2] : Math.abs(((u * 6) % 1) - 0.5) < 0.05 ? TIMBER[0] : TIMBER[1]);
  for (const z of [30, 62]) {
    B.box(add([0, -post, z], j), XYZ, [post + 2.6, 1.6, 2.2], inShaft, 5);
    B.box(add([-post, 0, z], j), XYZ, [1.6, post + 2.6, 2.2], inShaft, 5);
  }
  // the onsetter's candle, on a spike out of the post at the shaft's left corner (the light he signalled by)
  B.rod(add([-post + 2, post + 2, 30], j), add([-post + 4.6, post + 5.2, 31], j), 0.6, 0.5, SMALL_IRON, 8);
  B.rod(add([-post + 4.6, post + 5.2, 31.2], j), add([-post + 4.6, post + 5.2, 36], j), 1.1, 1, ['#2a2418', '#3a3224', '#5a5040', '#7a705a', '#867c64'], 8);
  // the catches the cage comes down on, either side of the hole
  for (const x of [-hole + 3, hole - 3]) (x > 0 ? S.front : B).box(add([x, 0, 1.6], j), XYZ, [2.6, 4.4, 1], (f, _u, _v, n) => (f === 4 ? SMALL_IRON[3] : f < 2 ? IRONS[1] : toneAt(n, IRONS, 0.1)), 7);
}

/**
 * THE CAGE, as it is (`k`), its floor `k.z` over the landing: its floor, its iron frame, bars down its
 * sides, its gate on its +y side (slid back to its +x end as it opens), its roof, its bridle chains, the
 * cable up from its shackle (slack in loops if `k.slack`), and its shoes on the guides.
 */
function paintCage(S: { back: Scene; front: Scene }, k: CagePose, id0: number): void {
  const h = SHAFT.cage;
  const H = SHAFT.cageH;
  const z0 = k.z;
  // (its sway: turned a little about its cable, and tipped)
  const turn = (p: V3): V3 => {
    const c = Math.cos(k.sway);
    const s = Math.sin(k.sway);
    const q: V3 = [p[0] * c - p[1] * s, p[0] * s + p[1] * c, p[2]];
    return [q[0] + k.tilt * (q[2] - z0) * 0.08, q[1], q[2]];
  };
  const P = (x: number, y: number, z: number): V3 => turn([x, y, z0 + z]);
  const layer = (x: number, y: number): Scene => (x > 0.5 * h || y > 0.5 * h ? S.front : S.back);
  // its floor: planks on an iron frame
  S.back.quad([P(-h, -h, 1), P(h, -h, 1), P(h, h, 1), P(-h, h, 1)], (u, v) => (u < 0.06 || u > 0.94 || v < 0.06 || v > 0.94 ? IRONS[2] : Math.abs(((u * 5) % 1) - 0.5) < 0.06 ? TIMBER[0] : TIMBER[2]), id0);
  // its four corners, iron
  for (const [x, y] of [[-h, -h], [h, -h], [-h, h], [h, h]] as const) layer(x, y).rod(P(x, y, 0), P(x, y, H), 1.2, 1.2, IRONS, id0 + 1);
  // its rails: round its foot, its waist, its top
  for (const z of [1, H * 0.5, H]) {
    for (const [a, b] of [[[-h, -h], [h, -h]], [[-h, -h], [-h, h]], [[-h, h], [h, h]], [[h, -h], [h, h]]] as const) {
      const sc = layer((a[0] + b[0]) / 2, (a[1] + b[1]) / 2);
      sc.rod(P(a[0], a[1], z), P(b[0], b[1], z), 0.9, 0.9, IRONS, id0 + 2);
    }
  }
  // the bars down its back and its +x side, and its gate on its +y side
  const BARS = 7;
  for (let i = 1; i < BARS; i++) {
    const t = -h + (2 * h * i) / BARS;
    S.back.rod(P(t, -h, 1), P(t, -h, H), 0.55, 0.55, DIM_IRON, id0 + 3);
    S.back.rod(P(-h, t, 1), P(-h, t, H), 0.55, 0.55, DIM_IRON, id0 + 3);
    S.front.rod(P(h, t, 1), P(h, t, H), 0.55, 0.55, DIM_IRON, id0 + 4);
    // (the gate's bars slid together toward its +x end as it opens)
    const g = -h + (2 * h * i) / BARS;
    const gx = h - (h - g) * (0.12 + 0.88 * k.gate);
    S.front.rod(P(gx, h, 2), P(gx, h, H - 2), 0.55, 0.55, SMALL_IRON, id0 + 5);
  }
  // the gate's top and foot bars, as far as it has slid
  const gx0 = h - 2 * h * (0.12 + 0.88 * k.gate);
  for (const z of [3, H - 3]) S.front.rod(P(gx0, h, z), P(h, h, z), 0.6, 0.6, SMALL_IRON, id0 + 5);
  // its roof: iron plate, its edge lit
  S.back.quad([P(-h, -h, H + 0.5), P(h, -h, H + 0.5), P(h, h, H + 0.5), P(-h, h, H + 0.5)], (u, v) => (u > 0.95 || v > 0.95 ? IRONS[3] : Math.abs(((u * 4) % 1) - 0.5) < 0.05 ? IRONS[1] : IRONS[2]), id0 + 6);
  // the crosshead over it, the bridle chains up to the shackle
  S.front.box(P(0, 0, H + 3), [turn([1, 0, 0]).map((v, i) => v - (i === 2 ? 0 : 0)) as V3, [0, 1, 0], [0, 0, 1]], [h, 1.6, 1.6], (f, _u, _v, n) => (f === 4 ? IRONS[3] : toneAt(n, IRONS, 0.1)), id0 + 7);
  const shackle = P(0, 0, H + 13);
  for (const [x, y] of [[-h + 2, 0], [h - 2, 0]] as const) {
    const a = P(x, y, H + 4.6);
    for (let i = 0; i <= 6; i++) {
      const t = i / 6;
      const q = add(mul(a, 1 - t), mul(shackle, t));
      S.front.egg(q, XYZ, [0.9, 0.9, 1.2], (n) => toneAt(n, IRONS, 0.2), id0 + 8);
    }
  }
  S.front.ball(shackle, 1.6, SMALL_IRON, id0 + 8);
  // its shoes on the guides
  for (const x of [-h - 1.8, h + 1.8]) for (const z of [8, H - 8]) (x > 0 ? S.front : S.back).box(P(x, 0, z), XYZ, [1.4, 3, 3], (f, _u, _v, n) => (f === 4 ? SMALL_IRON[3] : toneAt(n, IRONS, 0.1)), id0 + 9);
  // the cable up from the shackle into the dark: straight, or thrown slack in loops and whipping
  let prev = shackle;
  for (let i = 1; i <= 24; i++) {
    const t = i / 24;
    const up = t * 140;
    const loop = k.slack * Math.sin(t * Math.PI * 3 + k.whip) * 9 * (1 - t * 0.5);
    const q: V3 = add(shackle, [loop * 0.7, loop * 0.7, up - k.slack * 24 * Math.sin(t * Math.PI) * 0.8]);
    S.front.rod(prev, q, 1.15, 1.15, CABLE, id0 + 10);
    prev = q;
  }
}

/** The dark taking what is up the shaft: everything over DARK_FROM mixed toward the dark in steps as the walls are, and nothing past DARK_GONE. What gives off light is left as it is. */
export function intoTheDark(S: Scene): void {
  const shine = new Set<string>(EMBER);
  for (let i = 0; i < S.id.length; i++) {
    if (S.id[i] < 0) continue;
    const z = S.hz[i];
    if (z <= DARK_FROM) continue;
    const x = i % S.p.w;
    const y = Math.floor(i / S.p.w);
    if (z > DARK_GONE) {
      S.p.erase(x, y);
      S.id[i] = -1;
      continue;
    }
    const c = S.p.get(x, y)!;
    if (shine.has(c)) continue;
    S.p.set(x, y, mix(c, BEYOND, z < 64 ? 0.2 : z < 72 ? 0.42 : z < 80 ? 0.66 : 0.9));
  }
}

/**
 * THE HERO RIDING UP IS TAKEN BY THE DARK WITH THE CAGE: how far a pixel of him is mixed toward the dark
 * (floorkit's BEYOND, as the cage's own pixels are; 1: not drawn at all), `h` its height over his feet as
 * a share of his height (0 his feet, 1 the top of his head), the cage's floor `lift` over the landing
 * (cageUp().layers.lift). Standing at the landing he is untouched; the dark comes down over him from his
 * head as the cage rises, in the cage's own steps, and he is gone into it as the cage is.
 */
export function riderDark(lift: number, h: number): number {
  const z = lift + Math.max(0, Math.min(1, h)) * DARK_FROM;
  if (z <= DARK_FROM) return 0;
  if (z > DARK_GONE) return 1;
  return z < 64 ? 0.2 : z < 72 ? 0.42 : z < 80 ? 0.66 : 0.9;
}

/** The picture's size and its anchor (the shaft's middle on the floor). */
export const SHAFT_W = 196;
export const SHAFT_H = 196;
const AX = 98;
const AY = 146;

/** A frame of the shaft: its two layers, painted. `extra` adds what else is in it (grit, dust, sparks) to each. */
/** Where the onsetter's candle burns, on the picture. */
const CANDLE_TIP: V3 = [-SHAFT.post + 4.6, SHAFT.post + 5.2, 37];
const candleAt = (shake: number): [number, number] => [Math.round(AX + (CANDLE_TIP[0] - CANDLE_TIP[1]) * 0.8 + shake * 0.4), Math.round(AY + (CANDLE_TIP[0] + CANDLE_TIP[1]) * 0.4 - CANDLE_TIP[2])];
function shaftFrame(cage: CagePose | null, shake: number, extra?: (S: { back: Scene; front: Scene }) => void, flick = 0): { back: Px; front: Px } {
  const S = { back: new Scene(new Px(SHAFT_W, SHAFT_H), AX, AY), front: new Scene(new Px(SHAFT_W, SHAFT_H), AX, AY) };
  paintShaft(S, shake);
  if (cage) paintCage(S, cage, 100);
  if (extra) extra(S);
  for (const sc of [S.back, S.front]) {
    sc.seams();
    intoTheDark(sc);
  }
  // the candle's flame (an honest fire's: never faded, never shaded)
  const [cx, cy] = candleAt(shake);
  flame(S.back.p, cx, cy, 6 + (flick % 2), 1.4, [0, 1, 0, -1][flick % 4]);
  return { back: S.back.p, front: S.front.p };
}
/** The candle's light, as the game adds a prop's. */
const withLight = (s: Sprite): Sprite => {
  const [cx, cy] = candleAt(0);
  s.lights = [{ x: cx / GRAIN, y: (cy - 4) / GRAIN, r: 14, color: EMBER[2], a: 0.42 }];
  return s;
};
const whole = (f: { back: Px; front: Px }): Px => {
  const p = compose(f.back, [], null);
  fastBlit(p, f.front, 0, 0);
  return p;
};

let still: { empty: Sprite; down: Sprite } | null = null;
/** THE SHAFT AS IT STANDS: empty, the cage up out of sight (`empty`), and with the cage come down to the landing, its gate open (`down`). */
export function shaftStill(): { empty: Sprite; down: Sprite } {
  if (still) return still;
  return (still = { empty: withLight(whole(shaftFrame(null, 0)).sprite(AX, AY, GRAIN)), down: withLight(whole(shaftFrame(CAGE_DOWN, 0)).sprite(AX, AY, GRAIN)) });
}

// =================================================================================================
// THE CAGE COMES DOWN, AND GOES UP

/** A stone or a clot of grit falling down the shaft: from out of the dark at the top, at `f0`, at (x, y) over the hole; down past the landing into the hole, and gone into its dark (the shaft goes on down to its sump). */
interface Grit { f0: number; x: number; y: number; r: number; vz: number; seed: number }
function gritAt(g: Grit, f: number): { p: V3; shown: number } | null {
  const k = f - g.f0;
  if (k < 0) return null;
  // (a little drift as it falls, off the shaft's sides)
  const z = DARK_GONE + 6 + g.vz * k - 0.5 * k * (k + 1);
  if (z < -3 * g.r) return null;
  const x = g.x + (hash(g.seed, 1, 900) - 0.5) * 0.08 * k;
  const y = g.y + (hash(g.seed, 2, 900) - 0.5) * 0.08 * k;
  return { p: [x, y, z], shown: clamp01((z + 2 * g.r) / (2.4 * g.r)) };
}
const paintGrit = (S: Scene, g: Grit, p: V3, id: number): void => S.egg(p, [[1, 0, 0], [0, 1, 0], [0, 0, 1]], [g.r * 1.2, g.r, g.r * 0.8], (n) => toneAt(n, GRIT, 0.05), id);

/**
 * THE CAGE COMES DOWN, as the fleshmancer dies (in place of the stairwell opening on the floors above).
 * The empty shaft (`before`). A rumble: grit trickles and then stones rain down the shaft out of the dark,
 * striking the landing and bouncing. Then the cage: out of the dark it plunges, fast and faster, its shoes
 * grinding down the guides in streams of sparks, the cable racing down with it; it SLAMS onto the catches
 * (the first jolt): the shaft jumps, dust bursts out round its foot and blows out across the floor, stones
 * jump; it bounces up and comes down again (the second jolt), the cable slumping over its roof in loops
 * and whipping; it rocks on its chains, settles; its gate rattles back, open (`after`). 30 a second.
 */
function cageComesDown(): { m: Moment; layers: { back: Sprite[]; front: Sprite[] } } {
  const RUMBLE = 26;
  const FALL = 24;
  const HIT = RUMBLE + FALL;
  const N = 129;
  const START = DARK_GONE + 8;
  // its height, frame by frame: out of the dark, faster and faster; a hard landing, a bounce, a second, settling
  const zAt = (f: number): number => {
    if (f < RUMBLE) return START + 60;
    if (f < HIT) {
      const t = (f - RUMBLE) / FALL;
      return START * (1 - t * t * (0.55 + 0.45 * t));
    }
    const u = f - HIT;
    if (u < 10) return Math.max(0, 9 * Math.sin((Math.PI * u) / 10));
    if (u < 16) return Math.max(0, 2.4 * Math.sin((Math.PI * (u - 10)) / 6));
    return 0;
  };
  const BOUNCE2 = HIT + 10;
  const settle = (f: number): number => (f < HIT ? 0 : Math.exp(-(f - HIT) / 14) * clamp01((N - 1 - f) / 24));
  const poseAt = (f: number): CagePose => {
    const s = settle(f);
    const gateT = clamp01((f - (N - 18)) / 17);
    return {
      z: zAt(f),
      sway: f < HIT ? 0.03 * Math.sin(f * 1.3) : 0.09 * s * Math.sin((f - HIT) * 0.55),
      tilt: f < HIT ? 0 : 0.6 * s * Math.sin((f - HIT) * 0.7),
      gate: 1 - ease(gateT) + (gateT > 0 && gateT < 1 ? 0.03 * Math.sin(f * 2.6) : 0),
      slack: f < HIT ? 0 : f < HIT + 6 ? (f - HIT) / 6 : Math.max(0, 1 - (f - HIT - 6) / 46),
      whip: f * 0.9,
    };
  };
  const shakeAt = (f: number): number => (f < HIT ? (f > 6 && f < RUMBLE ? 0.5 * Math.sin(f * 2.1) : 0) : 3 * Math.exp(-(f - HIT) / 4) * Math.cos((f - HIT) * 1.8) + (f >= BOUNCE2 ? 1.4 * Math.exp(-(f - BOUNCE2) / 3) * Math.cos((f - BOUNCE2) * 2.2) : 0));
  // the grit and stones, raining down the shaft: a few as it rumbles, more as the cage comes
  const grits: Grit[] = [];
  for (let i = 0; i < 16; i++) {
    const f0 = 4 + Math.floor(hash(i, 1, 901) * (RUMBLE + 4));
    grits.push({ f0, x: (hash(i, 2, 901) - 0.5) * 34, y: (hash(i, 3, 901) - 0.5) * 34, r: 1.3 + hash(i, 4, 901) * (i < 6 ? 0.6 : 1.6), vz: -3 - hash(i, 5, 901) * 2, seed: i });
  }
  // the dust: bursting out round its foot as it strikes, blown out over the floor; a little more at the bounce
  const clouds: Cloud[] = [
    cloud(HIT, [SHAFT.cage + 4, 4, 3], [3.4, 1.4, 0.6], 15, 1, N - HIT - 4, 16, 24),
    cloud(HIT, [4, SHAFT.cage + 4, 3], [1.4, 3.4, 0.6], 15, 2, N - HIT - 6, 16, 24),
    cloud(HIT, [SHAFT.cage + 2, SHAFT.cage + 2, 3], [2.4, 2.4, 0.5], 12, 6, N - HIT - 8, 14, 22),
    cloud(HIT, [-SHAFT.cage, SHAFT.cage - 4, 4], [-1.8, 2.8, 0.7], 11, 3, N - HIT - 10, 12, 20),
    cloud(HIT + 1, [SHAFT.cage - 4, -SHAFT.cage, 4], [2.8, -1.8, 0.7], 11, 4, N - HIT - 12, 12, 20),
    cloud(BOUNCE2, [SHAFT.cage + 2, SHAFT.cage + 2, 2], [1.6, 1.6, 0.3], 8, 5, 40, 8, 14),
  ];
  // the sparks off its shoes as they grind down the guides, and a spray as it strikes
  interface Spark { f0: number; p: V3; v: V3; life: number }
  const sparks: Spark[] = [];
  for (let f0 = RUMBLE + 6; f0 < HIT; f0++) {
    for (const sx of [-1, 1]) {
      for (let j = 0; j < 3; j++) {
        const z = zAt(f0) + (j === 0 ? 8 : j === 1 ? SHAFT.cageH - 8 : 30);
        if (z > DARK_GONE - 4) continue;
        // (streaming up off the shoes as they grind down: the cage goes down, its sparks fly up and out)
        sparks.push({ f0, p: [sx * (SHAFT.cage + 2), (hash(f0, j, 902) - 0.5) * 4, z], v: [sx * (1 + hash(f0, j + 2, 902) * 2.2), (hash(f0, j + 4, 902) - 0.5) * 4, 3 + hash(f0, j + 6, 902) * 4], life: 4 + ((f0 + j) % 3) });
      }
    }
  }
  for (let j = 0; j < 36; j++) sparks.push({ f0: HIT + (j % 4), p: [(j % 2 ? 1 : -1) * (SHAFT.hole - 3), (hash(j, 1, 903) - 0.5) * 12, 2], v: [(j % 2 ? 1 : -1) * (1.4 + hash(j, 2, 903) * 3.2), (hash(j, 3, 903) - 0.5) * 7, 2.6 + hash(j, 4, 903) * 4.4], life: 5 + (j % 4) });
  const sparkAt = (s: Spark, k: number): V3 => [s.p[0] + s.v[0] * k, s.p[1] + s.v[1] * k, Math.max(0.5, s.p[2] + s.v[2] * k - 0.6 * k * k)];
  // (the stones falling down the shaft are small and go fast into the hole's dark, never tracked: they leave by going in)
  const tracks: Track[] = [{ name: 'the cage', fromEdge: true, at: [] }];
  const back: Sprite[] = [];
  const front: Sprite[] = [];
  const frames: Sprite[] = [];
  let prevCage: V3 = [0, 0, zAt(0) + SHAFT.cageH / 2];
  for (let f = 0; f < N; f++) {
    const k = poseAt(f);
    const showCage = k.z < DARK_GONE + 4;
    const fr = shaftFrame(showCage ? k : null, shakeAt(f), (S) => {
      grits.forEach((g, i) => {
        const a = gritAt(g, f);
        if (a && a.p[2] < DARK_GONE) paintGrit(Math.abs(a.p[0]) > SHAFT.cage * 0.5 || Math.abs(a.p[1]) > SHAFT.cage * 0.5 ? S.front : S.back, g, a.p, 300 + i);
      });
      // its smear as it plunges: streaks up off its corners and its roof's edge, as long as it goes in a frame
      const v = f > 0 && f <= HIT ? zAt(f - 1) - zAt(f) : 0;
      if (showCage && v > 4) {
        const h = SHAFT.cage;
        for (const [x, y] of [[-h, -h], [h, -h], [-h, h], [h, h]] as const) {
          const sc = x > 0.5 * h || y > 0.5 * h ? S.front : S.back;
          sc.rod([x, y, k.z + SHAFT.cageH], [x, y, k.z + SHAFT.cageH + v * 1.3], 0.9, 0.5, DIM_IRON, 450);
        }
        S.front.rod([0, 0, k.z + SHAFT.cageH + 13], [0, 0, k.z + SHAFT.cageH + 13 + v * 1.6], 1.1, 0.6, CABLE, 451);
      }
      paintClouds(S.front, clouds, f);
    }, f % 4);
    const fire = new Px(SHAFT_W, SHAFT_H);
    const at = (w: V3): [number, number] => [AX + (w[0] - w[1]) * 0.8, AY + (w[0] + w[1]) * 0.4 - w[2]];
    for (const s of sparks) {
      const kk = f - s.f0;
      if (kk < 0 || kk >= s.life) continue;
      const [x0, y0] = at(sparkAt(s, Math.max(0, kk - 0.8)));
      const [x1, y1] = at(sparkAt(s, kk));
      fire.line(Math.round(x0), Math.round(y0), Math.round(x1), Math.round(y1), kk < 2 ? EMBER[4] : EMBER[3]);
    }
    fastBlit(fr.front, fire, 0, 0);
    back.push(fr.back.sprite(AX, AY, GRAIN));
    front.push(fr.front.sprite(AX, AY, GRAIN));
    frames.push(withLight(whole(fr).sprite(AX, AY, GRAIN)));
    // the tracks: the cage's middle, as much of it as is out of the dark; each stone
    const mid: V3 = [0, 0, k.z + SHAFT.cageH / 2];
    const tc = trackAt((a, b, z) => [a, b, z], mid, prevCage, 30);
    const shown = clamp01((DARK_GONE - k.z) / SHAFT.cageH);
    tracks[0].at.push(showCage ? { ...tc, shown } : null);
    prevCage = mid;
  }
  const { empty } = shaftStill();
  // (its first frame what was there: the empty shaft; its last what is left, the cage down, its gate open)
  return { m: { name: 'the cage comes down', frames, fps: 30, before: [empty], after: [shaftStill().down], tracks, jolts: [HIT, BOUNCE2], holds: [] }, layers: { back, front } };
}

/**
 * THE CAGE GOES UP, the ride to town. The cage at the landing, its gate open (`before`), the hero stepped
 * in (the main chat draws him between its layers). The gate SLAMS shut (a jolt), rattling; a beat; the
 * cable snaps taut over the roof and the cage LURCHES (a second jolt), jerking up and dropping back on its
 * chains; then it is hauled up, slow, then faster and faster, swaying, grit and stones knocked loose
 * falling past it and bouncing on the landing, up into the dark and gone; the empty shaft (`after`). Its
 * `lift`, frame by frame: how far its floor is over the landing, in picture pixels of the world (the hero
 * stands on it).
 */
function cageGoesUp(): { m: Moment; layers: { back: Sprite[]; front: Sprite[]; lift: number[] } } {
  const SLAM = 10;
  const LURCH = 30;
  const N = 101;
  const zAt = (f: number): number => {
    if (f < LURCH) return 0;
    const u = f - LURCH;
    if (u < 8) return 4.5 * Math.sin((Math.PI * u) / 8);
    const v = u - 8;
    return 0.07 * v * v + 0.0026 * v * v * v;
  };
  const poseAt = (f: number): CagePose => ({
    z: zAt(f),
    sway: f < LURCH ? 0 : 0.05 * Math.sin((f - LURCH) * 0.4) * Math.min(1, (f - LURCH) / 10),
    tilt: f < LURCH ? (f >= SLAM ? 0.25 * Math.exp(-(f - SLAM) / 5) * Math.sin((f - SLAM) * 1.6) : 0) : 0.4 * Math.exp(-(f - LURCH) / 8) * Math.sin((f - LURCH) * 0.9),
    gate: f < SLAM ? ease(f / SLAM) ** 2 : 1 - (f < SLAM + 8 ? 0.04 * Math.exp(-(f - SLAM) / 3) * Math.abs(Math.sin((f - SLAM) * 2)) : 0),
    slack: f < SLAM ? 0 : f < SLAM + 8 ? 0.5 * ((f - SLAM) / 8) : f < LURCH - 6 ? 0.5 : f < LURCH ? 0.5 * (1 - (f - (LURCH - 6)) / 6) : 0,
    whip: f * 0.6,
  });
  const shakeAt = (f: number): number => (f >= SLAM && f < SLAM + 8 ? 1.2 * Math.exp(-(f - SLAM) / 2.5) * Math.cos((f - SLAM) * 2) : f >= LURCH && f < LURCH + 10 ? 2 * Math.exp(-(f - LURCH) / 3) * Math.cos((f - LURCH) * 1.8) : 0);
  const grits: Grit[] = [];
  // (grit knocked loose as it passes, trickling down the shaft after it into the hole, the last of it gone as the picture ends)
  for (let i = 0, f0 = LURCH + 10; ; i++, f0 += 4 + Math.floor(hash(i, 1, 904) * 4)) {
    const g: Grit = { f0, x: (hash(i, 2, 904) - 0.5) * 34, y: (hash(i, 3, 904) - 0.5) * 34, r: 1.3 + hash(i, 4, 904) * (i % 3 ? 0.6 : 1.4), vz: -2 - hash(i, 5, 904) * 2, seed: 40 + i };
    if (gritAt(g, N - 1) !== null) {
      // (the last: timed so that it is gone into the hole on the last frame and no sooner)
      let last = f0;
      while (gritAt({ ...g, f0: last }, N - 1) !== null) last--;
      grits.push({ ...g, f0: last });
      break;
    }
    grits.push(g);
  }
  // (and the dust shaken down the shaft after it, settling on the landing as the last of it)
  const dust: Cloud[] = [cloud(LURCH + 22, [0, 0, 70], [0, 0, -2.2], 10, 7, N - 1 - (LURCH + 22), 18, 26), cloud(LURCH + 30, [6, -4, 74], [0.3, 0, -2.4], 8, 8, N - 1 - (LURCH + 30), 14, 22)];
  const tracks: Track[] = [{ name: 'the cage', at: [] }];
  const back: Sprite[] = [];
  const front: Sprite[] = [];
  const frames: Sprite[] = [];
  const lift: number[] = [];
  let prevCage: V3 = [0, 0, SHAFT.cageH / 2];
  for (let f = 0; f < N; f++) {
    const k = poseAt(f);
    const showCage = k.z < DARK_GONE + 2;
    const fr = shaftFrame(showCage ? k : null, shakeAt(f), (S) => {
      grits.forEach((g, i) => {
        const a = gritAt(g, f);
        if (a && a.p[2] < DARK_GONE) paintGrit(Math.abs(a.p[0]) > SHAFT.cage * 0.5 || Math.abs(a.p[1]) > SHAFT.cage * 0.5 ? S.front : S.back, g, a.p, 300 + i);
      });
      paintClouds(S.front, dust, f);
    }, f % 4);
    back.push(fr.back.sprite(AX, AY, GRAIN));
    front.push(fr.front.sprite(AX, AY, GRAIN));
    frames.push(withLight(whole(fr).sprite(AX, AY, GRAIN)));
    lift.push(k.z);
    const mid: V3 = [0, 0, k.z + SHAFT.cageH / 2];
    const tc = trackAt((a, b, z) => [a, b, z], mid, prevCage, 30);
    tracks[0].at.push(showCage ? { ...tc, shown: clamp01((DARK_GONE - k.z) / SHAFT.cageH) } : null);
    prevCage = mid;
  }
  return { m: { name: 'the cage goes up', frames, fps: 30, before: [shaftStill().down], after: [shaftStill().empty], tracks, jolts: [SLAM, LURCH], holds: [] }, layers: { back, front, lift } };
}

let downFilm: ReturnType<typeof cageComesDown> | null = null;
let upFilm: ReturnType<typeof cageGoesUp> | null = null;
/** THE CAGE COMES DOWN as he dies: the moment, and its two layers frame by frame (for a hero to stand between: none stands in it as it comes). */
export function cageDown(): ReturnType<typeof cageComesDown> {
  return downFilm ?? (downFilm = cageComesDown());
}
/** THE RIDE UP: the moment (no hero in it), its two layers, and how far up the cage's floor is, frame by frame: the hero is drawn between the layers, lifted as far. */
export function cageUp(): ReturnType<typeof cageGoesUp> {
  return upFilm ?? (upFilm = cageGoesUp());
}
