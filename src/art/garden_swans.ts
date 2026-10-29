// FLOOR 16'S SMALL MOB, THE SWANS OF THE SWAN GARDENS: a mock-up (nothing of the game imports this file; `SWAN_ON` is off).
//
// HIS DOC (the High City's, planned with him in the main chat, 28 Oct 2026), level 16's enemies: "the Hushed gardeners and
// grooms, the palace guard, and the swans".
//
// HIS BRIEF, asked as his art rulebook's questions for a new character in two pop-ups (28 Oct, the labels as he tapped them):
// what they are, “Plain swans gone wild” (not the recommended pick); how big, “Knee-high, in flocks”; how they move, “Waddle
// and charge”; the one thing to know them by, “Wings raised in threat”; their attack (small: one), “Hissing lunge, a bite”;
// how they die, “Bursts into feathers (Recommended)”; what they must never look like, “Not a goose or duck”; their sound
// (sound rule 7), “Hiss and honk”.
//
// READ AS (told him so): the court's own mute swans gone wild: no crowns, nothing of the story; white, the bill orange with
// the black knob at its base and the black of the face round it, the long neck in its S (never a goose's or a duck's);
// knee-high to the knight, coming in flocks, fun to smash; on foot, waddling on black webbed feet, charging heavily with the
// neck stretched out low; the WINGS ALWAYS ARCHED UP OVER THE BACK, the way a swan warns you off; its bite a crouch and a
// hiss, the bill open, then the neck snapping out and the bill shutting on you; knocked flat in a burst of white feathers
// that drift down. Its edge the enemy's pink while it lives; nothing cyan.
//
// NOT ON THE HEROES' BONES: built from its own solids, as the fog wolves are (art/fog_wolves.ts), painted by the figures'
// painter (art/skin.ts, art/new_mobs3.ts paintBits): a seam of ink where one part ends before another, the light from the
// upper left. Its loose feathers are laid over the picture after its edge.

import type { Px, Sprite } from '../engine/px';
import { hash, lazyFrames, toSprite } from './kit';
import type { Painted, Ramp } from './kit';
import { ENEMY_RIM } from './mkit';
import { TILE3, paintBits } from './new_mobs3';
import type { ActorArt, AnimSet, Clip } from './actor_types';
import type { Bit, Put } from './new_mobs3';
import type { Skin } from './skin';
import { stage } from './skin';
import type { GameView, Stage } from './skin';
import type { V3 } from './skeleton';

/** THE SWITCH, OFF: nothing of the game reads this file. */
export const SWAN_ON = { on: false };

const cl01 = (v: number): number => Math.max(0, Math.min(1, v));
const D = Math.PI / 180;
const TAU = Math.PI * 2;
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
const sm = (v: number): number => {
  const c = cl01(v);
  return c * c * (3 - 2 * c);
};

// ---------------------------------------------------------------------------------------------
// ITS COLOURS: swan white (a figure's, so brighter than any place's), the bill's orange, black

/** Swan white: its shade a cool violet grey, its light warm in the dawn. */
const SWAN: Ramp = ['#57516b', '#8a839b', '#bcb5c6', '#e1dbdc', '#f6f2ea'];
/** The bill, orange (a mute swan's), never the enemy's pink. */
const BILL: Ramp = ['#5a2616', '#8c3c1c', '#c45a24', '#df7a32', '#ee9a52'];
/** The knob, the face round the bill, the legs and webbed feet: black. */
const BLACK: Ramp = ['#110f15', '#1b1920', '#29262f', '#3a3641', '#4d4856'];
const EYE = '#0c0a10';
/** Its loose feathers, as they fall. */
const FEATHER = ['#f6f2ea', '#e1dbdc', '#bcb5c6', '#8a839b'];

// ---------------------------------------------------------------------------------------------
// ITS MEASURES (the figure's own lengths: one is a picture pixel of height), its canvas, its timings

/** Its canvas, and where the floor under it is on it. */
export const SWAN_CANVAS = { w: 128, h: 104, ax: 54, ay: 80 };
const SWAN_AURA = { x: SWAN_CANVAS.ax, y: SWAN_CANVAS.ay - 10, r: 22, color: '#ff3a78', a: 0.06 };
/** Its stand: never still. */
export const SWAN_STAND = { frames: 36, fps: 15, period: 2.4 } as const;
export const SWAN_HABITS = { glance: [0.8, 1.5], hiss: [1.6, 2.1] } as const;
/** Its charge, the waddle: tiles a second; a round of both feet. */
export const SWAN_PACE = 1.4;
export const SWAN_WALK = { frames: 12, fps: 30, period: 0.4 } as const;
/** Its bite: the crouch and hiss (its warning), the lunge, the bite (its blow), back. */
export const SWAN_BITE = { long: 1.05, warn: 0.2, lunge: 0.36, hit: 0.5, reach: 31, fps: 30 } as const;
export const SWAN_REEL = { long: 0.45, freeze: 0.05, fps: 30 } as const;
export const SWAN_DIE = { long: 1.6, freeze: 0.08, burst: 0.1, flat: 0.42, fps: 30 } as const;
/** How big it is built, all of it, against the lengths it is measured in below (knee-high to the knight, its head at his hip). */
export const SWAN_SIZE = 1.15;

// ---------------------------------------------------------------------------------------------
// ITS POSE

/** The neck's three shapes (each its points from the breast up, then the head's middle and how far the head is tipped down). */
interface NeckShape {
  pts: V3[];
  head: V3;
  tip: number;
}
/** Standing: the S, the head held forward and down. */
const NECK_S: NeckShape = { pts: [[7.6, 0, 10.6], [9.6, 0, 15.6], [8.0, 0, 20.6], [6.8, 0, 25.2], [8.0, 0, 28.6]], head: [9.8, 0, 29.6], tip: 32 };
/** Drawn back, to hiss: low and coiled. */
const NECK_BACK: NeckShape = { pts: [[7, 0, 10.2], [7.8, 0, 13.6], [5.8, 0, 16.6], [5.0, 0, 19.2], [6.4, 0, 21.0]], head: [8.6, 0, 21.6], tip: 12 };
/** Stretched out low and forward: the charge, the lunge. */
const NECK_OUT: NeckShape = { pts: [[8.6, 0, 10.2], [12.2, 0, 11.0], [15.8, 0, 11.4], [19.4, 0, 11.6], [22.6, 0, 11.6]], head: [25.2, 0, 11.4], tip: 4 };

export interface SwanPose {
  /** The body's shift, and its turn (degrees): yaw about the upright, pitch nose down, roll onto its right side. */
  x: number;
  y: number;
  z: number;
  yaw: number;
  pitch: number;
  roll: number;
  /** How much of each of the neck's shapes: standing, drawn back, stretched out (they need not add up to one). */
  neck: readonly [number, number, number];
  /** How much further out the stretched neck reaches (the lunge). */
  reach: number;
  /** The head turned on the neck (degrees), and tipped further down. */
  look: number;
  nod: number;
  /** The bill open (0 shut, 1 wide: hissing). */
  gape: number;
  /** The wings: 0 folded flat, 1 arched up over the back (its threat), more, higher; `flap` flung out (struck, dying). */
  wings: number;
  flap: number;
  /** The tail's wag (degrees). */
  tail: number;
  /** Each foot on the floor (the figure's own space: they do not turn with the body), and how high it is lifted. */
  feet: readonly [V3, V3];
  alive: boolean;
  /** Fallen over onto its right side: that wing laid flat under it (0 standing, 1 lying). */
  lie: number;
  /** In the air (0 on the ground, 1 flying): its wings spread out wide to either side, beating `beat` up (or down). */
  fly: number;
  beat: number;
}
const FOOT_X = 1.2;
const FOOT_Y = 3.4;
const REST: SwanPose = { x: 0, y: 0, z: 0, yaw: 0, pitch: 0, roll: 0, neck: [1, 0, 0], reach: 0, look: 0, nod: 0, gape: 0, wings: 1, flap: 0, tail: 0, feet: [[FOOT_X, FOOT_Y, 0], [FOOT_X, -FOOT_Y, 0]], alive: true, lie: 0, fly: 0, beat: 0 };

/** A turn of a direction by yaw (about z), then pitch (about the body's side, nose down), then roll (about its length). */
function turnV(v: V3, yaw: number, pitch: number, roll: number): V3 {
  const [x0, y0, z0] = v;
  // roll about x
  const cr = Math.cos(roll * D);
  const sr = Math.sin(roll * D);
  const y1 = y0 * cr - z0 * sr;
  const z1 = y0 * sr + z0 * cr;
  // pitch about y (nose down for positive)
  const cp = Math.cos(pitch * D);
  const sp = Math.sin(pitch * D);
  const x2 = x0 * cp + z1 * sp;
  const z2 = -x0 * sp + z1 * cp;
  // yaw about z
  const cy = Math.cos(yaw * D);
  const sy = Math.sin(yaw * D);
  return [x2 * cy - y1 * sy, x2 * sy + y1 * cy, z2];
}
/** The body turns about its middle. */
const PIVOT: V3 = [0, 0, 8.6];
function worldOf(P: SwanPose, p: V3): V3 {
  return add(add(PIVOT, turnV(sub(p, PIVOT), P.yaw, P.pitch, P.roll)), [P.x, P.y, P.z]);
}
const turned = (P: SwanPose, v: V3): V3 => turnV(v, P.yaw, P.pitch, P.roll);

/** The neck's points as its shapes blend, and its head. */
function neckOf(P: SwanPose): NeckShape {
  const [a, b, c] = P.neck;
  const s = a + b + c || 1;
  const w = [a / s, b / s, c / s];
  const mix = (f: (n: NeckShape) => V3): V3 => add(add(mul(f(NECK_S), w[0]), mul(f(NECK_BACK), w[1])), mul(f(NECK_OUT), w[2]));
  const pts = NECK_S.pts.map((_, i) => {
    const p = mix((n) => n.pts[i]);
    return add(p, [P.reach * w[2] * (i / 4), 0, 0]);
  });
  const head = add(mix((n) => n.head), [P.reach * w[2], 0, 0]);
  return { pts, head, tip: NECK_S.tip * w[0] + NECK_BACK.tip * w[1] + NECK_OUT.tip * w[2] + P.nod };
}
/** A point along a smooth curve through `pts` (Catmull-Rom), `t` from 0 to 1. */
function along(pts: readonly V3[], t: number): V3 {
  const n = pts.length - 1;
  const f = Math.min(n - 1e-6, Math.max(0, t * n));
  const i = Math.floor(f);
  const u = f - i;
  const p0 = pts[Math.max(0, i - 1)];
  const p1 = pts[i];
  const p2 = pts[i + 1];
  const p3 = pts[Math.min(n, i + 2)];
  const c = (k: number): number => 0.5 * (2 * p1[k] + (-p0[k] + p2[k]) * u + (2 * p0[k] - 5 * p1[k] + 4 * p2[k] - p3[k]) * u * u + (-p0[k] + 3 * p1[k] - 3 * p2[k] + p3[k]) * u * u * u);
  return [c(0), c(1), c(2)];
}

// ---------------------------------------------------------------------------------------------
// ITS MOVES

/** Smoothly through keyed values: `keys` [time, value], eased between. */
function keyed(t: number, keys: readonly (readonly [number, number])[]): number {
  if (t <= keys[0][0]) return keys[0][1];
  for (let i = 0; i + 1 < keys.length; i++) {
    const [ta, va] = keys[i];
    const [tb, vb] = keys[i + 1];
    if (t <= tb) return va + (vb - va) * sm((t - ta) / (tb - ta));
  }
  return keys[keys.length - 1][1];
}
/** A swell from nothing at `a` to its fullest half way and back to nothing at `b`. */
const bump = (t: number, a: number, b: number): number => (t <= a || t >= b ? 0 : Math.pow(Math.sin((Math.PI * (t - a)) / (b - a)), 2));

function standPose(t: number): SwanPose {
  const ph = (t / SWAN_STAND.period) * TAU;
  // (it breathes; its raised wings ruffle; it glances aside; now and then it hisses)
  const glance = bump(t % SWAN_STAND.period, SWAN_HABITS.glance[0], SWAN_HABITS.glance[1]);
  const hiss = bump(t % SWAN_STAND.period, SWAN_HABITS.hiss[0], SWAN_HABITS.hiss[1]);
  return {
    ...REST,
    z: 0.3 * Math.sin(ph),
    pitch: -1.2 * Math.sin(ph),
    wings: 1 + 0.06 * Math.sin(ph + 0.8) + 0.1 * hiss,
    // (its neck in its S, leaning forward at you: a swan warning you off)
    neck: [0.8, 0.12 + 0.3 * hiss, 0.08],
    look: -20 * glance,
    nod: 2 * Math.sin(ph * 2),
    gape: 0.55 * hiss,
    tail: 4 * Math.sin(ph * 2 + 0.4),
  };
}
/** THE CHARGE: a heavy waddle, rocking from foot to foot, its neck stretched out low before it, its wings up. */
function walkPose(t: number): SwanPose {
  const per = SWAN_WALK.period;
  const ph = ((t / per) % 1 + 1) % 1;
  // (each foot down for half the round, carried back under it as it goes; then lifted and swung forward)
  // (in its own lengths, before it is built SWAN_SIZE big: so that on the floor its feet are carried back at its pace)
  const v = (SWAN_PACE * TILE3) / SWAN_SIZE;
  const stride = (v * per) / 2;
  const foot = (p: number, side: number): V3 => {
    const q = ((p % 1) + 1) % 1;
    if (q < 0.5) return [FOOT_X + stride / 2 - stride * (q / 0.5), side * FOOT_Y, 0];
    const s = (q - 0.5) / 0.5;
    return [FOOT_X - stride / 2 + stride * sm(s), side * FOOT_Y, 2.2 * Math.sin(Math.PI * s)];
  };
  const rock = Math.sin(ph * TAU);
  return {
    ...REST,
    z: -0.5 * Math.abs(Math.cos(ph * TAU)),
    pitch: 5,
    roll: 7 * rock,
    yaw: 3 * rock,
    neck: [0.68, 0, 0.32],
    reach: -3,
    nod: -2,
    wings: 1.15 + 0.08 * Math.abs(rock),
    tail: -6 * rock,
    feet: [foot(ph, 1), foot(ph + 0.5, -1)],
  };
}
/** THE BITE: it crouches and hisses, the bill open, the neck drawn back (its warning); then the neck snaps out and the bill shuts on you; back. */
function bitePose(t: number): SwanPose {
  const B = SWAN_BITE;
  const coil = keyed(t, [[0, 0], [0.22, 1], [B.lunge, 1], [B.hit - 0.02, 0], [B.long, 0]]);
  const out = keyed(t, [[0, 0], [B.lunge, 0], [B.hit - 0.02, 1], [0.56, 1], [B.long, 0]]);
  const S0 = standPose(0);
  const shiver = t > 0.22 && t < B.lunge ? 0.35 * Math.sin(t * 90) : 0;
  // (its near foot steps into the lunge and stays there)
  const step = keyed(t, [[0, 0], [B.lunge, 0], [B.hit, 1], [0.7, 1], [B.long, 0]]);
  const lift = bump(t, B.lunge, B.hit) * 1.8 + bump(t, 0.7, B.long) * 1.8;
  return {
    ...S0,
    x: -1.5 * coil + 3.5 * out,
    z: S0.z - 1 * coil - 0.5 * out,
    pitch: S0.pitch + 4 * coil - 10 * out,
    neck: [S0.neck[0] * Math.max(0, 1 - coil - out), S0.neck[1] * Math.max(0, 1 - coil - out) + coil, S0.neck[2] * Math.max(0, 1 - coil - out) + out],
    reach: 3 * out,
    look: S0.look + shiver,
    nod: S0.nod - 5 * coil,
    gape: keyed(t, [[0, 0], [0.18, 0.85], [B.lunge, 0.9], [B.hit - 0.02, 1], [B.hit, 0], [B.long, 0]]),
    wings: S0.wings + 0.4 * coil + 0.2 * out,
    tail: S0.tail * (1 - coil) + 8 * coil,
    feet: [[FOOT_X + 4 * step, FOOT_Y, lift], [FOOT_X, -FOOT_Y, 0]],
  };
}
/** STRUCK: knocked back on its heels, its wings flung up, its neck jerked back; and settling. */
function reelPose(t: number): SwanPose {
  const R = SWAN_REEL;
  const k = t < R.freeze ? 1 : keyed(t, [[R.freeze, 1], [R.long, 0]]);
  const S0 = standPose(0);
  return { ...S0, x: -2 * k, pitch: -9 * k, neck: [S0.neck[0] * (1 - k), S0.neck[1] * (1 - k) + k, S0.neck[2] * (1 - k)], gape: 0.5 * k, wings: S0.wings + 0.3 * k, flap: 0.7 * k, tail: 10 * k };
}
/** ITS DEATH: struck, then knocked flat over onto its side, its wings flung out and laid limp, its neck down along the floor; its feathers burst from it. */
function deathPose(t: number): SwanPose {
  const Dd = SWAN_DIE;
  if (t < Dd.freeze) return { ...reelPose(SWAN_REEL.freeze), alive: true };
  const k = sm((t - Dd.freeze) / (Dd.flat - Dd.freeze));
  const settle = sm((t - Dd.flat) / 0.4);
  return {
    ...REST,
    x: -3 - 2 * k,
    // (over onto its side: its body's half-width now its height)
    roll: 78 * k,
    z: -2.6 * k,
    pitch: -12 * (1 - k) + 4 * k,
    neck: [0, 1 - k, k],
    reach: -4 * k,
    nod: 30 * k,
    gape: 0.5 * (1 - k) + 0.2 * k,
    wings: 1.3 * (1 - k) + 0.2 * k,
    flap: 0.8 + 0.2 * k - 0.6 * settle,
    tail: 10 * (1 - k),
    feet: [[FOOT_X - 2 * k, FOOT_Y + 2 * k, 3 * k], [FOOT_X - 1 * k, -FOOT_Y + 3 * k, 5 * k]],
    alive: false,
    lie: k,
  };
}
/** IN THE AIR (the Princess's swans, circling her): its wings spread wide and beating, its neck stretched out straight before it, its feet tucked back under its tail. One wingbeat a round. */
export const SWAN_FLY = { period: 0.6 } as const;
function flyPose(t: number): SwanPose {
  const ph = (t / SWAN_FLY.period) * TAU;
  return {
    ...REST,
    z: 1.2 * Math.sin(ph),
    pitch: -3 + 2 * Math.sin(ph),
    neck: [0.12, 0, 0.88],
    reach: 1,
    nod: -6,
    wings: 1,
    fly: 1,
    beat: 12 * Math.cos(ph),
    tail: 0,
    feet: [[-7.5, 1.8, 6.5], [-7.5, -1.8, 6.5]],
  };
}
function poseOf(which: string, t: number): SwanPose {
  if (which === 'fly') return flyPose(t);
  if (which === 'walk') return walkPose(t);
  if (which === 'attack') return bitePose(t);
  if (which === 'reel') return reelPose(t);
  if (which === 'dying') return deathPose(t);
  return standPose(t);
}
/** How long a move lasts (seconds). */
export function swanLong(which: string): number {
  return which === 'fly' ? SWAN_FLY.period : which === 'walk' ? SWAN_WALK.period : which === 'attack' ? SWAN_BITE.long : which === 'reel' ? SWAN_REEL.long : which === 'dying' ? SWAN_DIE.long : SWAN_STAND.period;
}

// ---------------------------------------------------------------------------------------------
// THE SWAN AS SOLIDS

/** Its feathers: soft white, the shade a cool grey; on a wing, rows of the feathers' ends a step darker. */
type Painter = (u: V3, tone: number, x: number, y: number) => string | null;
function plumage(rows: number, seed: number): Painter {
  return (u, tone) => {
    let k = tone;
    if (rows > 0) {
      const r = (u[0] + 1) * rows + 0.35 * Math.sin(u[2] * 3 + seed);
      if (r - Math.floor(r) < 0.16 && tone > 1) k -= 1;
    }
    return SWAN[Math.max(0, Math.min(4, k))];
  };
}
const BODY_SKIN = plumage(0, 1);
/**
 * A raised wing, one sail of feathers: each slice of it (`a0` how far along the wing, `da` how much of it the slice spans)
 * painted so that its rows of feathers' ends run on unbroken from one slice to the next, scalloped, along the whole wing;
 * its inside, turned in to the back, a step into shade.
 */
function wingSkin(a0: number, da: number): Painter {
  return (u, tone) => {
    const A = a0 + u[0] * da;
    let k = u[1] < -0.2 ? Math.max(0, tone - 1) : tone;
    // (u[2] from the wing's root on the body, -1, to its top edge, 1: two rows of the feathers' ends, scalloped)
    const sc = 0.16 * Math.abs(Math.sin(Math.PI * A * 7));
    for (const row of [-0.05, 0.45]) if (Math.abs(u[2] - row - sc) < 0.1 && k > 1) k -= 1;
    return SWAN[Math.max(0, Math.min(4, k))];
  };
}

/** THE SWAN, AS SOLIDS. */
function swanBits(P: SwanPose, put: Put, st: Stage): void {
  const W = (p: V3): V3 => worldOf(P, p);
  const ax3 = (a: V3, b: V3, c: V3): [V3, V3, V3] => [turned(P, a), turned(P, b), turned(P, c)];
  // ITS BODY: a boat of white, the breast full and round before it, the tail tipped up behind
  put('body', 'body', { k: 'ball', c: W([0, 0, 8.4]), ax: ax3([10.6, 0, 0], [0, 5.9, 0], [0, 0, 4.9]), skin: BODY_SKIN });
  put('body', 'breast', { k: 'ball', c: W([6.2, 0, 8.4]), ax: ax3([4.6, 0, 0], [0, 5.0, 0], [0, 0, 4.7]), skin: BODY_SKIN });
  const tl = turnV([1, 0, 0], P.tail, -16, 0);
  put('body', 'tail', { k: 'ball', c: W([-10.2, 0, 10.4]), ax: ax3(mul(tl, 3.6), mul(norm(cross([0, 0, 1], tl)), 2.8), [0, 0, 1.5]), skin: BODY_SKIN });
  // ITS NECK: up from the breast in its S (or coiled, or stretched out), thick at its root
  const N = neckOf(P);
  const chain = [...N.pts, N.head];
  for (let i = 0; i < 11; i++) {
    const k = i / 10;
    const r = 2.5 - 1.05 * k;
    put('neck', `neck${i}`, { k: 'ball', c: W(along(chain, k * 0.92)), ax: ax3([r, 0, 0], [0, r, 0], [0, 0, r]), skin: BODY_SKIN });
  }
  // ITS HEAD: forward and tipped down; the black of its face round the bill's root, the knob over it, the eye
  const look = P.look;
  const f = turned(P, turnV([1, 0, 0], look, N.tip, 0));
  const l = norm(cross([0, 0, 1], f), [0, 1, 0]);
  const u = norm(cross(f, l));
  const H = W(N.head);
  const hp = (a: number, b: number, c: number): V3 => add(H, add(mul(f, a), add(mul(l, b), mul(u, c))));
  put('neck', 'head', { k: 'ball', c: H, ax: [mul(f, 3.1), mul(l, 1.9), mul(u, 2)], skin: BODY_SKIN });
  put('neck', 'lores', { k: 'ball', c: hp(1.9, 0, -0.15), ax: [mul(f, 1.3), mul(l, 1.3), mul(u, 1)], skin: BLACK });
  put('neck', 'knob', { k: 'ball', c: hp(2.7, 0, 1.15), ax: [mul(f, 1), mul(l, 0.85), mul(u, 0.9)], skin: BLACK });
  // its bill: the upper half, and the lower, opening as it hisses; its dark mouth between
  const gape = P.gape;
  const up = norm(add(mul(f, Math.cos(gape * 16 * D)), mul(u, Math.sin(gape * 16 * D))));
  const lo = norm(add(mul(f, Math.cos(gape * 24 * D)), mul(u, -Math.sin(gape * 24 * D))));
  const root = hp(2.4, 0, 0.1);
  put('bill', 'upper', { k: 'rod', a: root, b: add(root, mul(up, 4.3)), ra: 1.1, rb: 0.55, ramp: BILL });
  put('bill', 'nail', { k: 'ball', c: add(root, mul(up, 4.3)), ax: [mul(up, 0.55), mul(l, 0.5), mul(u, 0.45)], skin: BLACK });
  if (gape > 0.08) {
    put('bill', 'lower', { k: 'rod', a: hp(2.3, 0, -0.5), b: add(hp(2.3, 0, -0.5), mul(lo, 3.6)), ra: 0.8, rb: 0.4, ramp: BILL });
    put('bill', 'mouth', { k: 'ball', c: add(root, mul(f, 1.6)), ax: [mul(f, 1.5), mul(l, 0.5), mul(u, 0.25 + 0.7 * gape)], skin: ['#1a0c10', '#1a0c10', '#2a1216', '#3a1a1c', '#3a1a1c'] });
  }
  for (const s of [1, -1]) put('neck', `eye${s}`, { k: 'dot', p: hp(0.9, s * 1.75, 0.55), c: EYE, facing: add(mul(l, s), mul(f, 0.3)) });
  // ITS WINGS ARCHED UP OVER ITS BACK (its threat): each a fan of feathers rising from its shoulder, cupped, its ends notched;
  // flung out when it is struck; the long flight feathers folded along its side under them
  const near = st.near(W([0, 3, 9])) > st.near(W([0, -3, 9])) ? 1 : -1;
  for (const s of [1, -1]) {
    const part = s === near ? 'wingNear' : 'wingFar';
    const far = s !== near;
    // (fallen on its right side, that wing laid flat under it)
    const keep = s < 0 ? 1 - P.lie : 1;
    const fl = P.flap * keep;
    // (the down side's tucked in under it as it lies)
    const tuck = s < 0 ? 1 - 0.4 * P.lie : 1;
    // (the sail: from its root along the body's back, at the shoulder and on back to the tail, up to its top edge arched over
    // the back; one piece, laid as slices side by side along it, each from the root up to the edge)
    const H2 = (7.4 * P.wings + 3 * fl) * keep;
    const spread = 0.9 * P.wings * keep + 5 * fl;
    const root = (a: number): V3 => [4.2 - 13.4 * a, s * (4.5 - 1.4 * a) * tuck, 10.2 + 1.2 * a];
    const edge = (a: number): V3 => {
      const b = Math.sin(Math.PI * Math.pow(a, 0.8));
      const ground: V3 = [4.2 - 14.2 * a, s * (4.6 - 0.8 * a + spread * b) * tuck, 11.4 + H2 * b + 0.4 * a];
      if (P.fly <= 0) return ground;
      // (in the air: the wing reaching far out to the side, broad at its root, its tip swept back, beating up and down)
      const bf = Math.sin(Math.PI * Math.pow(a, 0.7));
      const air: V3 = [3.0 - 12 * a - 4 * bf * bf, s * (4.6 + 20 * bf), 10.6 + P.beat * bf];
      return [ground[0] + (air[0] - ground[0]) * P.fly, ground[1] + (air[1] - ground[1]) * P.fly, ground[2] + (air[2] - ground[2]) * P.fly];
    };
    const N = P.fly > 0 ? 17 : 11;
    const da = 0.5 / (N - 1);
    for (let i = 0; i < N; i++) {
      const a = 0.04 + (0.92 * i) / (N - 1);
      const r0 = root(a);
      const e0 = edge(a);
      const m = mul(add(r0, e0), 0.5);
      // (cupped: its middle bowed out from the body)
      const c: V3 = [m[0], m[1] + s * 0.5 * Math.sin(Math.PI * a) * keep, m[2]];
      const span = Math.hypot(e0[0] - r0[0], e0[1] - r0[1], e0[2] - r0[2]);
      const upw = norm(turned(P, sub(e0, r0)), [0, 0, 1]);
      const tang = norm(turned(P, sub(add(root(a + 0.05), edge(a + 0.05)), add(root(a - 0.05), edge(a - 0.05)))));
      const side = turned(P, [0, s, 0]);
      let thick = norm(cross(upw, tang));
      if (thick[0] * side[0] + thick[1] * side[1] + thick[2] * side[2] < 0) thick = mul(thick, -1);
      put(part, `wing${s}_${i}`, { k: 'ball', c: W(c), ax: [mul(tang, 1.25 + 0.55 * Math.sin(Math.PI * a) + 0.5 * P.fly), mul(thick, 1.15), mul(upw, span / 2 + 0.7)], skin: wingSkin(a, da * 1.6), far });
    }
  }
  // ITS LEGS: short, black, the knees hidden in its belly; its webbed feet flat on the floor (or lifted, stepping)
  for (const [i, s] of [[0, 1], [1, -1]] as const) {
    const foot = P.feet[i];
    const hip = W([0.2, s * 3.0, 4.6]);
    const ankle: V3 = [foot[0] - 1.1, foot[1], foot[2] + 1.4];
    put('legs', `shank${s}`, { k: 'rod', a: hip, b: ankle, ra: 0.9, rb: 0.75, ramp: BLACK, far: s !== near });
    const fwd = norm([1, 0, 0.6 * P.lie]);
    put('legs', `foot${s}`, { k: 'ball', c: [foot[0] + 0.5, foot[1], foot[2] + 0.35], ax: [mul(fwd, 2.7), [0, 2.1, 0], [0, 0, 0.35]], skin: BLACK, far: s !== near });
  }
}

// ---------------------------------------------------------------------------------------------
// ITS LOOSE FEATHERS: torn off it when it is struck; bursting from it as it dies, and drifting down

type Grain = [V3, string, number];
function feathers(which: string, t: number): Grain[] {
  const out: Grain[] = [];
  const burst = (t0: number, n: number, seed: number, speed: number, from: V3): void => {
    const s = t - t0;
    if (s < 0) return;
    for (let i = 0; i < n; i++) {
      const a = hash(i, 1, seed) * TAU;
      const up = 0.3 + 0.9 * hash(i, 2, seed);
      const v = speed * (0.4 + 0.8 * hash(i, 3, seed));
      // (out fast, slowed by the air, then drifting down, rocking side to side as a feather does)
      const far = (v * (1 - Math.exp(-4 * s))) / 4;
      const fall = Math.max(0, s - 0.12) * (11 + 9 * hash(i, 4, seed));
      const rock = 1.6 * Math.sin(s * (6 + 3 * hash(i, 5, seed)) + i);
      const z0 = from[2] + 6 * hash(i, 6, seed);
      const z = Math.max(0.3, z0 + up * far - fall);
      const p: V3 = [from[0] + Math.cos(a) * far + rock, from[1] + Math.sin(a) * far, z];
      const big = hash(i, 7, seed) < 0.4;
      out.push([p, FEATHER[Math.floor(hash(i, 8, seed) * (z <= 0.3 ? 4 : 3))], big ? 2 : 1]);
    }
  };
  if (which === 'reel') burst(SWAN_REEL.freeze, 6, 301, 26, [1, 0, 12]);
  if (which === 'dying') {
    burst(SWAN_DIE.burst, 54, 303, 46, [0, 0, 9]);
    burst(SWAN_DIE.burst + 0.06, 18, 305, 30, [-4, 0, 13]);
  }
  return out;
}

// ---------------------------------------------------------------------------------------------
// ITS PICTURES

const big = (p: V3): V3 => mul(p, SWAN_SIZE);
function bitsOf(which: string, t: number, st: Stage): { P: SwanPose; bits: Bit[] } {
  const P = poseOf(which, t);
  const bits: Bit[] = [];
  const K = SWAN_SIZE;
  swanBits(P, (part, piece, shape) => {
    const sh = shape.k === 'ball' ? { ...shape, c: big(shape.c), ax: [big(shape.ax[0]), big(shape.ax[1]), big(shape.ax[2])] as [V3, V3, V3] } : shape.k === 'rod' ? { ...shape, a: big(shape.a), b: big(shape.b), ra: shape.ra * K, rb: shape.rb * K } : shape.k === 'dot' ? { ...shape, p: big(shape.p) } : shape;
    bits.push({ part, piece, shape: sh });
  }, st);
  return { P, bits };
}
/** A grain laid on a finished picture (after its pink edge), on whole game pixels. */
function laid(px: Px, st: Stage, p: V3, col: string, size: number): void {
  const [x, y] = st.at(p);
  const xi = Math.round((x - size / 2) / 2) * 2;
  const yi = Math.round((y - size / 2) / 2) * 2;
  const s = size === 1 ? 2 : 4;
  const h = size === 1 ? 2 : 2;
  for (let dy = 0; dy < h; dy++) for (let dx = 0; dx < s; dx++) if (xi + dx >= 0 && yi + dy >= 0 && xi + dx < px.w && yi + dy < px.h) px.set(xi + dx, yi + dy, col);
}
/** One frame of the swan: `which` (stand, walk: its charge, attack: its bite, reel, dying), `t` seconds in, from in front or behind. */
export function swanPainted(which: string, t: number, view: GameView = 'front'): Painted {
  const st = stage(view, SWAN_CANVAS.ax, SWAN_CANVAS.ay, SWAN_CANVAS);
  const { P, bits } = bitsOf(which, t, st);
  const lights = paintBits(st, bits, big(worldOf(P, PIVOT)));
  const px = st.whole(P.alive ? ENEMY_RIM : null);
  for (const [pt, col, size] of feathers(which, t)) laid(px, st, [pt[0] * SWAN_SIZE, pt[1] * SWAN_SIZE, pt[2]], col, size);
  return { px, lights };
}
/** The same frame as the game holds a figure. */
export function swanFrame(which: string, t: number, view: GameView = 'front'): Sprite {
  return toSprite(swanPainted(which, t, view), SWAN_AURA, SWAN_CANVAS.ax, SWAN_CANVAS.ay);
}
/** Every solid of one moment of it, as the tests read them. */
export function swanSolids(which: string, t: number, view: GameView = 'front'): Bit[] {
  const st = stage(view, SWAN_CANVAS.ax, SWAN_CANVAS.ay, SWAN_CANVAS);
  return bitsOf(which, t, st).bits;
}
/** Its pose at one moment (for the tests: where its feet are). */
export function swanPose(which: string, t: number): SwanPose {
  return poseOf(which, t);
}

/** THE SWAN, as the game holds a monster's pictures: its stand, its charge (walk), its bite (attack), struck, and its death. */
export function makeSwanArt(): ActorArt {
  const set = (view: GameView): AnimSet => {
    const frame = (which: string, t: number): Sprite => swanFrame(which, t, view);
    const clip = (which: string, long: number, fps: number, hit?: number): Clip => {
      const c: Clip = { frames: lazyFrames(Math.round(long * fps) + 1, (i) => frame(which, i / fps)), fps };
      if (hit !== undefined) c.hit = hit;
      return c;
    };
    const attack = clip('attack', SWAN_BITE.long, SWAN_BITE.fps, SWAN_BITE.hit);
    return {
      idle: lazyFrames(SWAN_STAND.frames, (i) => frame('stand', i / SWAN_STAND.fps)),
      walk: lazyFrames(SWAN_WALK.frames, (i) => frame('walk', i / SWAN_WALK.fps)),
      attack: lazyFrames(3, (i) => attack.frames[[7, 13, 15][i]]),
      idleFps: SWAN_STAND.fps,
      walkFps: SWAN_WALK.fps,
      clips: { attack, die: clip('dying', SWAN_DIE.long, SWAN_DIE.fps), reel: clip('reel', SWAN_REEL.long, SWAN_REEL.fps) },
    };
  };
  return { front: set('front'), back: set('back') };
}
