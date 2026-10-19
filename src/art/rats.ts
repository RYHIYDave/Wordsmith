// FLOOR 12'S SMALL MOB, THE KING'S RATS (the art chat for floors 11 to 15, 19 Oct 2026). A MOCK-UP: NOT IN THE GAME.
// Nothing of the game imports this file; `RATS_ON` is off.
//
// His doc "Wordsmith Act 2: The Hush" (the planning chat's, with his yes as ideas), level 12, THE UNDERCITY: its
// enemies "the Hushed, the Silent Order, and things that live in the sewers"; and his word to this chat of 18 Oct,
// 21:24 Pacific: “Hey go without my say so.  If something is shit I’ll get it to it but you’re doing a great jobs. At
// least for 11-15”. So their brief is this chat's, the picks it would have marked recommended:
// - what they are: the sewer's rats, swollen on the voices the King's brood has drunk from the Order's broken jars:
//   fat, sleek, wet, the cult's dull pink in their eyes; the King's own (art/rat_king.ts), drawn the same way, free of
//   the knot. Small and fun to smash (his rulebook, Monsters 2), in packs.
// - how they move: quick and jerky: they sniff the air, rear up on their hind legs to look round (a move of its own,
//   `look`, the game's to play now and then from the stand), and scurry fast.
// - their blow: THE LEAP AND BITE: they crouch and tremble (the warning), spring at you and snap, and scramble back.
// - their death: a squeal, and they flip onto their backs, legs curling; the voice they drank goes out of them in a
//   puff of pink, going pale as it goes free (as the King's voices do), and they lie still. Not gory.
// And his words of 18 Oct on the act's enemies: Act 2's own, nothing of Act 1's (not the Fen's leeches, not a wolf).
//
// NOT ON THE HEROES' BONES: painted from their own solids, the Rat King's (art/rat_king.ts `ratBits`), in the same painter.

import type { Px, Sprite } from '../engine/px';
import { hash, lazyFrames, toSprite } from './kit';
import type { Painted } from './kit';
import { ENEMY_RIM } from './mkit';
import { TILE3, paintBits } from './new_mobs3';
import type { ActorArt, AnimSet, Clip } from './actor_types';
import type { Bit, Put } from './new_mobs3';
import { stage } from './skin';
import type { GameView } from './skin';
import type { V3 } from './skeleton';
import { FOOT_REST, RK_FREED as FREED, RK_VOICE as VOICE, frameOf, headOf, ratBits, scurryFoot } from './rat_king';
import type { RatPose } from './rat_king';

/** THE SWITCH, OFF: nothing of the game reads this file. */
export const RATS_ON = { on: false };

const cl01 = (v: number): number => Math.max(0, Math.min(1, v));
const fr = (t: number): number => t - Math.floor(t);
const D = Math.PI / 180;
const add = (a: V3, b: V3): V3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const mul = (a: V3, k: number): V3 => [a[0] * k, a[1] * k, a[2] * k];
const lerp = (a: number, b: number, k: number): number => a + (b - a) * k;
const sm = (v: number): number => {
  const c = cl01(v);
  return c * c * (3 - 2 * c);
};
/** Turn `v` about the unit axis `k` by `deg`. */
function about(v: V3, k: V3, deg: number): V3 {
  const c = Math.cos(deg * D);
  const s = Math.sin(deg * D);
  const x: V3 = [k[1] * v[2] - k[2] * v[1], k[2] * v[0] - k[0] * v[2], k[0] * v[1] - k[1] * v[0]];
  const d = k[0] * v[0] + k[1] * v[1] + k[2] * v[2];
  return [v[0] * c + x[0] * s + k[0] * d * (1 - c), v[1] * c + x[1] * s + k[1] * d * (1 - c), v[2] * c + x[2] * s + k[2] * d * (1 - c)];
}

// ---------------------------------------------------------------------------------------------
// THEIR TIMES AND SIZE

/** How big one is against a common sewer rat's measure: swollen, near as big as the King's own. */
export const RAT_S = 2.0;
/** Its canvas, and its floor point on it. */
export const RAT_CANVAS = { w: 170, h: 130, ax: 80, ay: 96 };
const RAT_AURA = { x: RAT_CANVAS.ax, y: RAT_CANVAS.ay - 10, r: 22, color: '#ff3a78', a: 0.08 };
/** Its stand: a loop of 2.4 s at fifteen a second: sniffing, its nose working, its head turning. */
export const RAT_STAND = { frames: 36, fps: 15, period: 2.4 } as const;
/** LOOKING ROUND, a move of its own the game plays now and then from its stand: up on its hind legs, forepaws drawn up, its head turning, and down again. */
export const RAT_LOOK = { long: 1.3, up: 0.26, fps: 30 } as const;
/** How fast it scurries (tiles a second): six frames at twenty-four a second, painted for that pace. */
export const RAT_PACE = 2.8;
export const RAT_WALK = { frames: 6, fps: 24, period: 0.25 } as const;
/** THE LEAP AND BITE: crouched, its rump wiggling as a cat's does before it pounces (the warning, `warn`); it springs (`spring`) and snaps at `hit` (`reach` on), held a tenth; it scrambles back. */
export const RAT_BITE = { long: 1.0, warn: [0.12, 0.34], spring: 0.36, hit: 0.5, freeze: 0.1, reach: 24, fps: 30 } as const;
/** Struck. */
export const RAT_REEL = { long: 0.35, fps: 30 } as const;
/** Its death: a squeal; flipped onto its back (`flip`); the voice going out of it (`voice`); still from `still`. */
export const RAT_DIE = { long: 1.5, flip: [0.08, 0.42], voice: [0.25, 1.05], still: 1.1, fps: 30 } as const;

// ---------------------------------------------------------------------------------------------
// ITS POSES

/** One rat at (x, y) facing +x, pitched, rolled about its own length, its feet where they are. */
function rat(o: { x?: number; z?: number; pitch?: number; roll?: number; yaw?: number; hy?: number; hp?: number; gape?: number; eyes?: number; feet?: V3[]; belly?: number; tailBow?: V3 }): RatPose {
  const s = RAT_S;
  let [f, l, u] = frameOf(o.yaw ?? 0, o.pitch ?? -3);
  if (o.roll) {
    l = about(l, f, o.roll);
    u = about(u, f, o.roll);
  }
  const lift = 3.9 * s;
  const rearing = Math.max(0, Math.sin(((o.pitch ?? -3) + 3) * D)) * 5.4 * s;
  const c: V3 = add([o.x ?? 0, 0, (o.z ?? 0) + rearing], mul(u, lift));
  const feet = o.feet ?? FOOT_REST.map(([fx, fy]) => [(o.x ?? 0) + fx * s, fy * s, 0] as V3);
  // (its tail trailing behind it along the floor, a little to one side)
  const tailTo: V3 = [c[0] - 15 * s, c[1] + 3 * s, 0.8 * s];
  return { c, f, l, u, s, belly: o.belly ?? 1, hy: o.hy ?? 0, hp: o.hp ?? 0, gape: o.gape ?? 0, eyes: o.eyes ?? 1, feet, tailTo, tailBow: o.tailBow ?? [0, -2 * s, 0], gone: 0, king: false, seed: 31 };
}
/** Its feet at rest. */
const REST_FEET: V3[] = FOOT_REST.map(([fx, fy]) => [fx * RAT_S, fy * RAT_S, 0] as V3);
const lifted = (p: V3, dx: number, dz: number): V3 => [p[0] + dx, p[1], p[2] + dz];

interface Pose {
  P: RatPose;
  grains: [V3, string, number][];
  alive: boolean;
}

/** THE STAND: sniffing, the nose working, the head turning. LOOKING ROUND (`up` 1): up on its hind legs, forepaws drawn up, its nose high. */
function standPose(t0: number, up = 0): Pose {
  const T = RAT_STAND.period;
  const t = fr(t0 / T) * T;
  const w = (k: number): number => (2 * Math.PI * k) / T;
  const sniff = Math.sin(w(12) * t) * (1 - up * 0.5);
  // (its forepaws drawn up; its hind paws, tipped up with it on its heels, a little off the floor)
  const feet = REST_FEET.map((p, i) => (up <= 0 ? p : i < 2 ? lifted(p, -3.5 * up * RAT_S, 5 * up * RAT_S) : lifted(p, 0, 0.4 * up * RAT_S)));
  const P = rat({
    pitch: -3 + 62 * up,
    hy: 24 * Math.sin(w(2) * t) + 34 * up * Math.sin(w(2.5) * t),
    hp: 6 + 5 * sniff - 38 * up,
    gape: 0.05 + 0.08 * Math.max(0, sniff),
    belly: 1 + 0.05 * Math.sin(w(4) * t),
    tailBow: [Math.sin(w(1) * t) * 3, -2 * RAT_S + Math.cos(w(1) * t) * 3, 0],
    feet,
  });
  return { P, grains: [], alive: true };
}

/** LOOKING ROUND: up, a look round, down again, its stand going on under it. */
function lookPose(t: number): Pose {
  const L = RAT_LOOK;
  return standPose(t, sm(t / L.up) - sm((t - (L.long - L.up)) / L.up));
}

/** THE SCURRY: quick and low, its feet pattering, diagonal pairs together, its body bobbing; its tail swinging behind. */
function walkPose(t: number): Pose {
  const T = RAT_WALK.period;
  const u0 = fr(t / T);
  const stroke = RAT_PACE * TILE3 * T * 0.5;
  const bob = 1.0 * Math.abs(Math.sin(u0 * Math.PI * 2));
  const feet = REST_FEET.map((p, k) => {
    const diag = k === 0 || k === 3 ? 0 : 0.5;
    const [off, up] = scurryFoot(fr(u0 + diag), stroke);
    return [p[0] + off, p[1], up] as V3;
  });
  const P = rat({ z: bob * 0.5, pitch: -6 + 3 * Math.sin(u0 * Math.PI * 4), hy: 6 * Math.sin(u0 * Math.PI * 2), hp: 2, feet, tailBow: [0, -2 * RAT_S + 4 * Math.sin(u0 * Math.PI * 2), 1] });
  return { P, grains: [], alive: true };
}

/** THE LEAP AND BITE. */
function bitePose(t: number): Pose {
  const B = RAT_BITE;
  const tt = t < B.hit ? t : t < B.hit + B.freeze ? B.hit : t - B.freeze;
  const end = B.long - B.freeze;
  const crouch = tt < B.warn[0] ? sm(tt / B.warn[0]) : tt < B.spring ? 1 : 1 - sm((tt - B.spring) / 0.06);
  // (its rump wiggling side to side, its feet planted, as a cat's before it pounces)
  const wiggle = tt > B.warn[0] && tt < B.spring ? Math.sin((tt - B.warn[0]) * 60) * sm((tt - B.warn[0]) / 0.05) : 0;
  // the leap: off the floor at `spring`, landing `reach` on at `hit`; then two scrambling steps back to where it was
  const q = cl01((tt - B.spring) / (B.hit - B.spring));
  const back = sm((tt - B.hit - 0.1) / (end - B.hit - 0.2));
  const x = tt < B.spring ? -2 * crouch : tt < B.hit ? lerp(-2, B.reach, sm(q)) : B.reach * (1 - back);
  const air = tt > B.spring && tt < B.hit ? 13 * Math.sin(Math.PI * q) : 0;
  // its feet: planted; in the leap all off the floor, stretched out, forepaws reaching, hind legs flung back; down
  // again `reach` on; stepped back after, a pair at a time
  const reachOut = Math.sin(Math.PI * q);
  const feet = REST_FEET.map((p, k) => {
    if (tt <= B.spring) return p;
    if (tt < B.hit) return [p[0] + B.reach * sm(q) + (k < 2 ? 3.2 : -3.0) * RAT_S * reachOut, p[1], air * 0.6 + (k < 2 ? 2.5 : 1.5) * reachOut] as V3;
    const pair = k === 0 || k === 3 ? 0 : 0.5;
    const s0 = B.hit + 0.1 + pair * (end - B.hit - 0.2) * 0.5;
    const s1 = s0 + (end - B.hit - 0.2) * 0.5;
    const st = sm((tt - s0) / (s1 - s0));
    return [p[0] + B.reach * (1 - st), p[1], st > 0 && st < 1 ? 2.5 * Math.sin(Math.PI * st) : 0] as V3;
  });
  const P = rat({
    x,
    z: air - 0.15 * crouch * RAT_S,
    yaw: 9 * wiggle,
    pitch: -3 - 4 * crouch + (tt > B.spring && tt < B.hit ? 14 * Math.sin(Math.PI * q) - 10 * q : 0),
    hp: 10 * crouch - 16 * (sm((tt - (B.hit - 0.1)) / 0.08) - sm((tt - (B.hit + 0.08)) / 0.14)),
    gape: tt < B.warn[0] ? 0.2 : tt < B.hit - 0.06 ? 1 : tt < B.hit ? 1 - (tt - (B.hit - 0.06)) / 0.06 : 0.15 * (1 - back),
    eyes: tt > B.warn[0] && tt < B.hit + 0.15 ? 1.8 : 1,
    feet,
  });
  return { P, grains: [], alive: true };
}

/** STRUCK: knocked back on its haunches, its head snapped up, a squeal. */
function reelPose(t: number): Pose {
  const k = Math.sin(Math.PI * cl01(t / RAT_REEL.long)) * (1 - 0.4 * cl01(t / RAT_REEL.long));
  const P = rat({ x: -1.5 * k, pitch: -3 + 18 * k, hp: 20 * k, gape: 0.9 * k, eyes: 1 + k, feet: REST_FEET.map((p, i) => (i < 2 ? lifted(p, -1.5 * k, 3 * k) : p)) });
  return { P, grains: [], alive: true };
}

/** ITS DEATH: a squeal, the head thrown back; flipped over onto its back, its legs curling up; the voice it drank going out of it in a puff of pink, going pale as it goes free (as the King's do); still. */
function dyingPose(t0: number): Pose {
  const Dd = RAT_DIE;
  const t = Math.min(t0, Dd.still);
  const flip = sm((t - Dd.flip[0]) / (Dd.flip[1] - Dd.flip[0]));
  const s = RAT_S;
  // (on its back, a little over to one side: its body's middle as high as its back is round, a hop as it flips; its
  // feet curled up off the floor, toward its belly; its head lolled over onto its cheek)
  const roll = 160 * flip;
  const P0 = rat({ pitch: -3 + 10 * Math.sin(Math.PI * flip), roll, hy: -20 * flip, hp: 28 * (1 - flip) - 50 * flip, gape: t < Dd.voice[1] ? 0.9 : 0.4, eyes: Math.max(0, 1 - (t - Dd.voice[0]) / 0.4), belly: 1 - 0.18 * sm((t - Dd.voice[0]) / 0.6) });
  const c: V3 = [P0.c[0], P0.c[1], lerp(3.9 * s, 3.8 * s, flip) + 6 * Math.sin(Math.PI * flip)];
  const curl = sm((t - Dd.flip[1] + 0.1) / 0.4);
  const feet = REST_FEET.map((p, i) => {
    if (flip <= 0) return p;
    const fore = i < 2;
    const side = i % 2 === 0 ? 1 : -1;
    const root = add(add(add(c, mul(P0.f, (fore ? 3.0 : -3.2) * s)), mul(P0.l, side * (fore ? 2.0 : 2.3) * s)), mul(P0.u, -1.4 * s));
    const out = add(root, add(mul(P0.u, -(4.5 - 2.5 * curl) * s), mul(P0.f, (fore ? 1 : -1) * (1 + 1.5 * curl) * s)));
    // (kicked up off the floor as it goes over, never dragged along it)
    return flip < 1 ? ([lerp(p[0], out[0], flip), lerp(p[1], out[1], flip), Math.max(0, lerp(p[2], out[2], flip)) + 2.5 * s * Math.sin(Math.PI * flip)] as V3) : out;
  });
  const P: RatPose = { ...P0, c, feet, tailTo: [c[0] - 15 * s, c[1] + 4 * s, 0.8 * s], tailBow: [0, -2 * s, 1] };
  // the voice going out of it: a puff of pink rising off its open mouth, turning gold, gone
  const grains: [V3, string, number][] = [];
  if (t0 > Dd.voice[0] && t0 < Dd.voice[1]) {
    const m = headOf(P).mouth;
    for (let j = 0; j < 22; j++) {
      const born = Dd.voice[0] + (j / 22) * 0.4;
      const age = t0 - born;
      if (age < 0 || age > 0.42) continue;
      const q = age / 0.42;
      // (out in a puff, then rising, wavering; pink, going pale as it goes free, as the King's do)
      const out = Math.sqrt(q) * (5 + 4 * hash(j, 0, 6301));
      const a = j * 2.4;
      grains.push([add(m, [Math.cos(a) * out, Math.sin(a) * out * 0.7, 2 + 30 * q * q + 6 * q + Math.sin(q * 9 + j) * 1.2]), q < 0.3 ? VOICE[2] : q < 0.55 ? VOICE[3] : FREED[q < 0.8 ? 3 : 4], q < 0.45 ? 2 : 1]);
    }
  }
  return { P, grains, alive: false };
}

function poseOf(which: string, t: number): Pose {
  switch (which) {
    case 'walk':
      return walkPose(t);
    case 'attack':
      return bitePose(t);
    case 'reel':
      return reelPose(t);
    case 'dying':
      return dyingPose(t);
    case 'look':
      return lookPose(t);
    default:
      return standPose(t);
  }
}
export function ratLong(which: string): number {
  return ({ stand: RAT_STAND.period, walk: RAT_WALK.period, attack: RAT_BITE.long, reel: RAT_REEL.long, look: RAT_LOOK.long, dying: RAT_DIE.long } as Record<string, number>)[which] ?? 1;
}

// ---------------------------------------------------------------------------------------------
// ITS PAINTER

function bitsOf(which: string, t: number, view: GameView): { K: Pose; bits: Bit[] } {
  const K = poseOf(which, t);
  const bits: Bit[] = [];
  const put: Put = (part, piece, shape) => bits.push({ part, piece, shape });
  ratBits(K.P, put, '0', view);
  for (const [p, c, size] of K.grains) put('voices', 'voice', { k: 'mote', p, c, size });
  return { K, bits };
}
export function ratPainted(which: string, t: number, view: GameView = 'front'): Painted {
  const { K, bits } = bitsOf(which, t, view);
  const st = stage(view, RAT_CANVAS.ax, RAT_CANVAS.ay, RAT_CANVAS);
  const lights = paintBits(st, bits, K.P.c);
  const px: Px = st.whole(K.alive ? ENEMY_RIM : null);
  return { px, lights };
}
export function ratFrame(which: string, t: number, view: GameView = 'front'): Sprite {
  return toSprite(ratPainted(which, t, view), which === 'dying' ? null : RAT_AURA, RAT_CANVAS.ax, RAT_CANVAS.ay);
}
export function ratPose(which: string, t: number): RatPose {
  return poseOf(which, t).P;
}
export function ratGrains(which: string, t: number): [V3, string, number][] {
  return poseOf(which, t).grains;
}
export function ratSolids(which: string, t: number, view: GameView = 'front'): Bit[] {
  return bitsOf(which, t, view).bits;
}

/** THE KING'S RATS, as the game holds a monster's pictures. */
export function makeRatArt(): ActorArt {
  const set = (view: GameView): AnimSet => {
    const frame = (which: string, t: number): Sprite => ratFrame(which, t, view);
    const clip = (which: string, long: number, fps: number, hit?: number): Clip => {
      const c: Clip = { frames: lazyFrames(Math.round(long * fps) + 1, (i) => frame(which, i / fps)), fps };
      if (hit !== undefined) c.hit = hit;
      return c;
    };
    const attack = clip('attack', RAT_BITE.long, RAT_BITE.fps, RAT_BITE.hit);
    return {
      idle: lazyFrames(RAT_STAND.frames, (i) => frame('stand', i / RAT_STAND.fps)),
      walk: lazyFrames(RAT_WALK.frames, (i) => frame('walk', i / RAT_WALK.fps)),
      attack: lazyFrames(3, (i) => attack.frames[[8, 14, 18][i]]),
      idleFps: RAT_STAND.fps,
      walkFps: RAT_WALK.fps,
      clips: { attack, die: clip('dying', RAT_DIE.long, RAT_DIE.fps), reel: clip('reel', RAT_REEL.long, RAT_REEL.fps), moves: { look: clip('look', RAT_LOOK.long, RAT_LOOK.fps) } },
    };
  };
  return { front: set('front'), back: set('back') };
}
