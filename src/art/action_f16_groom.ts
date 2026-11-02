// FLOOR 16'S SMALL MOB, MORE ACTION: THE HUSHED GROOM (the art chat's helper, 2 Nov 2026; docs/mockups/action_f16/README.md). A MOCK-UP:
// NOTHING OF THE GAME IMPORTS THIS FILE. LOOSE THE HORSE (GROOM_HORSE, off), in place of the fork jab, on the game's own figure
// (art/palace_hands.ts, art/palace_hands_moves.ts), all he keeps frame for frame his own; and THE HORSE he looses.
//
// His review of every enemy for more action, 31 Oct 2026: HUSHED GROOM (floor 16, small): offered a muck toss, “I don’t hate it but it’s
// still pretty similar to what we’ve been adding”; offered Loose the horse (he whistles and a ghostly palace horse gallops across the
// garden down a marked line, a little cousin of the Princess's steed) or a halter rope: “Loose the horse (Recommended)”. The whistle held,
// the line marked across the garden first, the horse galloping down it fast and gone; the horse a little cousin of the steed, not a copy:
// smaller, a palace cart-horse's build, the Hush's pale glow and the enemy's pink, never cyan. Small: one attack (his rule of 9 Oct).
//
// THE WHISTLE: his fork left standing at his side in his right fist, his left hand up to his mouth, two fingers in it, his head thrown up,
// and he WHISTLES, HELD, shaking, the grey breath streaming out shrill (while THE LINE is marked across the garden, from behind him at his
// left, through where you stood, on far past); in TWO FRAMES his arm flung out down the line, smeared: and THE HORSE bursts out of the
// mist behind him and gallops down the line past him, fast, through where you stood, and on, and is gone into mist at its end.
// THE HORSE: a palace cart-horse of the Hush's fog, smaller than the Princess's steed and plainer: heavy and short in the leg, a broad
// chest, a thick neck carried low and stretched out, a big plain head, feathered fetlocks streaming mist, a cropped mane, a collar of its
// harness still on it; pale where it is thick, thinning to mist at its legs; its eyes the enemy's pink.

import { Px } from '../engine/px';
import type { Light } from '../engine/px';
import type { ActorArt } from './actor_types';
import { footwork, plantBy, plantOf } from './bosses3';
import { hash } from './kit';
import type { Ramp } from './kit';
import { ENEMY_RIM, FLAME } from './mkit';
import { PH_BODY, PH_CANVAS } from './palace_hands';
import { GROOM_REST, PALACE_GROOM } from './palace_hands_moves';
import { TILE3, mobSet, paintBits, skeletonAt } from './new_mobs3';
import type { Bit, Mob, MobMove, Moment, Put } from './new_mobs3';
import { stage } from './skin';
import type { PaintView, Ring, Skin, Stage } from './skin';
import { elbowFor, norm as normS, solve } from './skeleton';
import type { Bones, Key3, Posed, V3 } from './skeleton';
import { thinSteed } from './spectral_steed';
import type { SteedPose } from './spectral_steed';
import { FR, TAU, clamp01, f, pen, smearAlong, smooth, tileAt } from './action_f6_fx';

/** THE SWITCH, OFF. With it on, the bestiary's groom is made by `makeWhistleArt`. */
export const GROOM_HORSE = { on: false };

type P = Partial<Bones>;
const B = PH_BODY;
const R = GROOM_REST;
const L0 = plantOf(B, 'L', {}, R);
const R0 = plantOf(B, 'R', {}, R);
const PINK = ['#e0287a', '#ff7aa8', '#7a1058'] as const;
const D = Math.PI / 180;

function elbowsTo(pose: P, wantL: V3 | null, wantR: V3 | null): P {
  const q = { ...R, ...pose } as Posed;
  const le = wantL ? elbowFor(B, q, true, normS(wantL)) : q.le;
  const re = wantR ? elbowFor(B, { ...q, le } as Posed, false, normS(wantR)) : q.re;
  return { ...pose, le, re };
}

// =============================================================================================
// THE WHISTLE

/**
 * THE WHISTLE'S NUMBERS (seconds from its start; tiles):
 *   wind-up   his left hand up to his mouth by 0.3 s, his head thrown up: he WHISTLES, HELD, shaking, to 0.767 s (0.47 s); the line marked
 *             from `aim` (0.3 s)
 *   strike    TWO FRAMES, smeared: his arm flung out down the line (frame 25, 0.833 s: the clip's `hit`); the horse bursts out
 *   wind-down  his arm held out after it to 1.25 s; lowered by 1.7 s; at rest 2.1 s
 *   THE LINE  from `from` (tiles behind him and to his left) through where the hero stands at `aim`, `lane` tiles long, `half` to either
 *             side of its middle
 *   THE HORSE  out of the mist at the line's start at the hit, galloping down it at `pace` tiles a second (the hero runs 4.6), gone into
 *             mist over its last `fade` tiles; a hero within `half` of the line as it comes by, and within `body` of its middle along
 *             it, is struck and knocked `knock`
 *   near, far  begun at a hero from 1.5 to 7 tiles off
 */
export const WHISTLE_HIT = f(25);
export const WHISTLE_STRIKE = [f(23), f(25)] as const;
export const WHISTLE_SMEARED = (t: number): boolean => t > WHISTLE_STRIKE[0] + 1e-6 && t <= WHISTLE_STRIKE[1] + FR + 1e-6;
export const LOOSE = { up: 0.3, aim: 0.3, long: 2.1, from: [-2.6, 1.3] as const, lane: 14, half: 0.95, pace: 11, fade: 2.5, body: 0.9, knock: 0.8, near: 1.5, far: 7 } as const;
const WHISTLE_NAME = 'Loose the horse';
/** Where his mouth is as he whistles (his own lengths, on the floor's own axes): two fingers there. */
function mouthAt(body: P): V3 {
  const s = solve(B, { ...R, ...body } as Posed);
  const [ff, , fu] = s.face;
  return [s.head[0] + ff[0] * (B.headR[0] + 0.8) - fu[0] * 2.4, s.head[1] + ff[1] * (B.headR[0] + 0.8) - fu[1] * 2.4 + 0.6, s.head[2] + ff[2] * (B.headR[0] + 0.8) - fu[2] * 2.4];
}
function whistleKeys(): Key3[] {
  const body: P = { px: -1.0, pz: R.pz + 0.3, pitch: -6, bend: -10, yaw: 6, twist: 8, side: -1, roll: 0, faceUp: 24, faceTilt: -4, faceTurn: 10 };
  const m = mouthAt(body);
  const WHISTLE: P = elbowsTo({ ...body, lhIn: 2, lhx: m[0], lhy: m[1], lhz: m[2] }, [0.1, 1, -0.6], null);
  const shake = (k: number): P => ({ ...WHISTLE, pz: (WHISTLE.pz as number) + (k % 2 ? 0.25 : -0.1), faceUp: 24 + (k % 2 ? 1.5 : 0), lhz: (WHISTLE.lhz as number) + (k % 2 ? 0.25 : -0.1) });
  // (the hips set going first, then the arm flung out and down the line, pointing)
  const HIPS: P = { ...WHISTLE, yaw: 1, twist: 12 };
  const FLING_MID: P = elbowsTo({ px: 1.0, pz: R.pz - 0.6, pitch: 4, bend: -2, yaw: -4, twist: 2, side: 0, roll: 0, faceUp: 10, faceTilt: 0, faceTurn: 4, lhIn: 1, lhx: 12, lhy: 6, lhz: 4 }, [-0.2, 1, -0.3], null);
  const FLUNG: P = elbowsTo({ px: 2.6, pz: R.pz - 1.4, pitch: 9, bend: 3, yaw: -8, twist: -4, side: 0, roll: 0, faceUp: 6, faceTilt: 0, faceTurn: 2, lhIn: 1, lhx: 19, lhy: 5, lhz: 1 }, [0, 1, -0.3], null);
  const ON: P = elbowsTo({ ...FLUNG, px: 3.6, pz: R.pz - 1.7, pitch: 11, lhx: 23, lhy: 3.5, lhz: 2.5 }, [0, 1, -0.3], null);
  return [
    { at: 0, pose: {} },
    { at: 0.14, pose: elbowsTo({ px: -0.4, pz: R.pz, pitch: -2, bend: -4, yaw: 3, twist: 4, faceUp: 12, faceTurn: 6, lhIn: 1, lhx: 6, lhy: -4, lhz: 0 }, [0, 1, -0.6], null), ease: 'io' },
    { at: LOOSE.up, pose: WHISTLE, ease: 'out' },
    { at: 0.4, pose: shake(1), ease: 'io' },
    { at: 0.5, pose: shake(2), ease: 'io' },
    { at: 0.6, pose: shake(3), ease: 'io' },
    { at: 0.7, pose: shake(4), ease: 'io' },
    { at: WHISTLE_STRIKE[0] - FR, pose: WHISTLE, ease: 'io' },
    { at: WHISTLE_STRIKE[0], pose: HIPS, ease: 'in' },
    { at: f(24), pose: FLING_MID, ease: 'lin' },
    { at: WHISTLE_HIT, pose: FLUNG, ease: 'lin' },
    { at: WHISTLE_HIT + 0.14, pose: ON, ease: 'out' },
    { at: 1.25, pose: { ...ON, lhz: 2.5, pz: R.pz - 1.3 }, ease: 'io' },
    { at: 1.7, pose: elbowsTo({ px: 0.8, pz: R.pz - 0.4, pitch: 3, bend: 0, yaw: 0, twist: 0, faceUp: 4, faceTurn: 2, lhIn: 1, lhx: 7, lhy: 3, lhz: -12 }, [-0.2, 1, -0.5], null), ease: 'io' },
    { at: LOOSE.long, pose: {}, ease: 'io' },
  ];
}
function whistleFeet(): (t: number) => P {
  return footwork(B, {
    L: { start: L0, moves: [{ t0: WHISTLE_STRIKE[0] - 0.06, t1: WHISTLE_HIT, to: plantBy(L0, 7, 1.5, 8), lift: 2.6 }, { t0: 1.6, t1: 1.86, to: L0, lift: 2.2 }] },
    R: { start: R0, moves: [{ t0: WHISTLE_STRIKE[0], t1: WHISTLE_HIT, to: { ...R0, pitch: 16 } }, { t0: 1.62, t1: 1.82, to: R0 }] },
  });
}
const whistleGlint = (t: number): number => (t < 0.2 || t > WHISTLE_HIT + 0.1 ? 0 : clamp01((t - 0.2) / 0.1));
const whistleJaw = (t: number): number => (t < 0.25 ? 0.4 : t < WHISTLE_HIT ? 0.15 : t < WHISTLE_HIT + 0.4 ? 0.9 : 0.5);

function moreBits(mob: Mob, st: Stage, m: Moment): Bit[] {
  const bits: Bit[] = [];
  const put: Put = (part, piece, shape) => {
    bits.push({ part, piece, shape });
  };
  const t = m.t;
  if (m.move !== WHISTLE_NAME) return bits;
  // the whistle: the grey breath shrilling out past his fingers, in a thin streaming jet, as he holds it
  if (t > LOOSE.up - 0.05 && t < WHISTLE_STRIKE[0] + 0.05) {
    const s = m.s;
    const [ff, , fu] = s.face;
    const from: V3 = [s.head[0] + ff[0] * (B.headR[0] + 2) - fu[0] * 2, s.head[1] + ff[1] * (B.headR[0] + 2) - fu[1] * 2, s.head[2] + ff[2] * (B.headR[0] + 2) - fu[2] * 2];
    for (let i = 0; i < 16; i++) {
      const life = (t * 3.2 + i / 16) % 1;
      const wob = Math.sin(life * 9 + i) * 0.8;
      const p: V3 = [from[0] + ff[0] * 14 * life + fu[0] * 6 * life, from[1] + ff[1] * 14 * life + wob, from[2] + ff[2] * 14 * life + fu[2] * 6 * life + 3 * life];
      put('whistle', 'breath', { k: 'mote', p, c: life < 0.3 ? '#dcd8ea' : life < 0.65 ? '#b0aacb' : PINK[1], size: life < 0.5 ? 2 : 1 });
    }
  }
  if (!WHISTLE_SMEARED(t)) return bits;
  const thin = Math.abs(t - WHISTLE_HIT - FR) < 1e-6;
  const lines: V3[][] = [[], []];
  for (let i = 0; i <= 8; i++) {
    const u = Math.min(t, WHISTLE_HIT) - (FR * 1.3 * i) / 8;
    const s = skeletonAt(mob, 'attack', u);
    lines[0].push(s.handL);
    lines[1].push(s.elbowL);
  }
  smearAlong(st, put, lines, thin, ['#4a4458', '#7e7898', '#c8c2dc', '#f2eef8'], PINK[1]);
  return bits;
}
const PH_CANVAS2 = { w: 300, h: 240, ax: 140, ay: 172 } as const;
function whistler(base: Mob): Mob {
  const mob: Mob = {
    ...base,
    id: `${base.id}-whistle`,
    attack: { name: WHISTLE_NAME, motion: { keys: whistleKeys(), hit: WHISTLE_HIT }, rest: R, feet: whistleFeet(), glint: whistleGlint, jaw: whistleJaw } as MobMove,
    hit: WHISTLE_HIT,
    warn: WHISTLE_STRIKE[0] - LOOSE.up,
    canvas: PH_CANVAS2,
    aura: { ...base.aura, x: base.aura.x - PH_CANVAS.ax + PH_CANVAS2.ax, y: base.aura.y - PH_CANVAS.ay + PH_CANVAS2.ay },
    bits: (st, m) => [...base.bits(st, m), ...moreBits(mob, st, m)],
  };
  return mob;
}
/** THE GROOM WITH LOOSE THE HORSE (GROOM_HORSE): the game's own in all but it. */
export const WHISTLE_GROOM = whistler(PALACE_GROOM);
/** As the game holds a monster: the game's own groom, the whistle as its `attack`. */
export function makeWhistleArt(mob: Mob = WHISTLE_GROOM, pace = mob.pace): ActorArt {
  return { front: mobSet(mob, 'front', pace), back: mobSet(mob, 'back', pace) };
}

// =============================================================================================
// THE LINE AND THE HORSE ON IT (tiles; the groom's own place: before him, to his left)

/** The line from its start through where the hero stood (`hx`, `hy`): its start, its unit way, its length. */
export function lineOf(hx: number, hy: number): { x0: number; y0: number; dx: number; dy: number; long: number } {
  const [x0, y0] = LOOSE.from;
  const L = Math.hypot(hx - x0, hy - y0) || 1;
  return { x0, y0, dx: (hx - x0) / L, dy: (hy - y0) / L, long: LOOSE.lane };
}
/** How far down the line the horse is, `t` seconds after it bursts out (tiles from its start). */
export const horseGone = (t: number): number => Math.max(0, t) * LOOSE.pace;
/** How much of it is there: forming out of the mist as it bursts out, gone into mist over the line's last tiles. */
export const horseFormed = (t: number): number => Math.min(clamp01(t / 0.18), clamp01((LOOSE.lane - horseGone(t)) / LOOSE.fade));
/** Whether the horse, `t` seconds out, strikes a hero `x` tiles before the groom and `y` to his left (the line through `hx`, `hy`). */
export function horseStrikes(t: number, hx: number, hy: number, x: number, y: number): boolean {
  const L = lineOf(hx, hy);
  const along = (x - L.x0) * L.dx + (y - L.y0) * L.dy;
  const across = Math.abs(-(x - L.x0) * L.dy + (y - L.y0) * L.dx);
  return horseFormed(t) > 0.3 && across <= LOOSE.half && Math.abs(along - horseGone(t)) <= LOOSE.body;
}

// =============================================================================================
// THE HORSE: a palace cart-horse of the Hush's fog (the Princess's steed's little cousin: art/spectral_steed.ts is its making)

/** Its fog: the Hush's grey-violet, paler than the steed's where it is thick (it glows pale); its feathers and mane, smoke. */
const FOG: Ramp = ['#46415e', '#625c7e', '#847e9e', '#aaa4c2', '#cec9e0'];
const HOOF: Ramp = ['#4a4660', '#68647e', '#8c88a2', '#b2aec6', '#d6d2e2'];
const MANE: Ramp = ['#706a90', '#908aae', '#b0aaca', '#ccc8de', '#e4e0f0'];
const COLLAR: Ramp = ['#3e3854', '#56506e', '#6e6888', '#8a84a4', '#a29cbc'];
const BRASS: Ramp = ['#3a3020', '#5a4a2e', '#7c6a44', '#9c8a5e', '#b4a476'];
const WISP = ['#e4e0f0', '#cec9e0', '#b0aacb', '#9890b4', '#7e7898'];
/** ITS SIZE: smaller than the steed (1.15), about the knight's height at its head. */
export const HORSE_SIZE = 0.86;
const S = HORSE_SIZE;
const add = (a: V3, b: V3): V3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const sub = (a: V3, b: V3): V3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const mul = (a: V3, k: number): V3 => [a[0] * k, a[1] * k, a[2] * k];
const len = (a: V3): number => Math.hypot(a[0], a[1], a[2]);
const norm = (a: V3, or: V3 = [0, 0, 1]): V3 => {
  const l = len(a);
  return l > 1e-9 ? mul(a, 1 / l) : or;
};
const cross = (a: V3, b: V3): V3 => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const lerp = (a: V3, b: V3, k: number): V3 => [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k];
const fr = (t: number): number => t - Math.floor(t);
/** (its own lengths, before its size: a cart-horse, heavy and short in the leg, 46 at the withers) */
const LEG_TOP: readonly V3[] = [[13, 5.6, 29], [13, -5.6, 29], [-15, 6.0, 32], [-15, -6.0, 32]];
const LEG_LONG: readonly (readonly [number, number, number])[] = [[13.2, 10.0, 4.2], [13.2, 10.0, 4.2], [15.6, 11.8, 4.2], [15.6, 11.8, 4.2]];
const HOOF_LONG = 1.1 * S;
const HOOF_R = 2.0 * S;
const HOOF_UP = HOOF_LONG + HOOF_R;
/** Its pose: where its middle is, its pitch (nose up), each sole on the floor (forward, left, up: its own place at its size). */
interface HorsePose {
  x: number;
  z: number;
  pitch: number;
  soles: readonly [V3, V3, V3, V3];
  neck: number;
  tail: number;
  churn: number;
  formed: number;
}
const PIVOT: V3 = [0, 0, 36];
function turnP(v: V3, pitch: number): V3 {
  const c = Math.cos(pitch * D);
  const s = Math.sin(pitch * D);
  return [v[0] * c - v[2] * s, v[1], v[0] * s + v[2] * c];
}
const horseAt = (P: HorsePose, p: V3): V3 => add(add(turnP(mul(sub(p, PIVOT), S), P.pitch), mul(PIVOT, S)), [P.x, 0, P.z]);
/** A leg's joints, reaching from its top to its sole (a fore knee bending forward, a hind hock back). */
function legOf(P: HorsePose, i: number): { top: V3; knee: V3; fet: V3; end: V3 } {
  const [l1, l2, l3] = LEG_LONG[i];
  const top = horseAt(P, LEG_TOP[i]);
  const sole = P.soles[i];
  const fw: V3 = [1, 0, 0];
  const pEnd: V3 = [sole[0], sole[1], sole[2] + HOOF_UP];
  // (a hoof up off the floor folds back under; one down stands on its pastern, sloping)
  const up = clamp01(sole[2] / 8);
  const pa = (35 + 55 * up) * D;
  const pFet = add(pEnd, add(mul(fw, (i < 2 ? -1 : -1) * Math.sin(pa) * l3 * S * (i < 2 ? 1 - 2 * up : 1)), [0, 0, Math.cos(pa) * l3 * S]));
  const L1 = l1 * S;
  const L2 = l2 * S;
  const v = sub(pFet, top);
  const d = Math.max(Math.abs(L1 - L2) + 0.01, Math.min(L1 + L2 - 0.01, len(v)));
  const u = norm(v, [0, 0, -1]);
  const want = mul(fw, i < 2 ? 1 : -1);
  const n = norm(sub(want, mul(u, want[0] * u[0] + want[1] * u[1] + want[2] * u[2])), want);
  const ca = (L1 * L1 + d * d - L2 * L2) / (2 * L1 * d);
  const sa = Math.sqrt(Math.max(0, 1 - ca * ca));
  const knee = add(top, add(mul(u, L1 * ca), mul(n, L1 * sa)));
  const fet = add(top, mul(u, d));
  return { top, knee, fet, end: add(fet, sub(pEnd, pFet)) };
}
/** THE GALLOP: a stride every `HORSE_STRIDE` seconds; each hoof down for `DOWN` of it, going back under it as fast as it gallops (so a hoof that is down grips). */
export const HORSE_STRIDE = 0.32;
const DOWN = 0.16;
/** When in the stride each hoof comes down (near fore, off fore, near hind, off hind): the hinds, then the fores, then all up. */
const LEAD_AT = [0.36, 0.48, 0.0, 0.1] as const;
/** The horse at `phase` (0 to 1) of its stride, galloping at `pace` tiles a second. */
export function gallopPose(phase: number, pace = LOOSE.pace, formed = 1, t = 0): HorsePose {
  const v = pace * TILE3;
  const reach = v * HORSE_STRIDE * DOWN;
  const soles = [0, 1, 2, 3].map((i) => {
    const top = LEG_TOP[i];
    const x0 = top[0] * S + (i < 2 ? 3 : -1) * S;
    const u = fr(phase - LEAD_AT[i]);
    if (u < DOWN) return [x0 + reach / 2 - (u / DOWN) * reach, top[1] * S, 0] as V3;
    const w = (u - DOWN) / (1 - DOWN);
    const g = w * w * (3 - 2 * w);
    // (up: swung forward to where it comes down, lifted, a fore hoof folded high)
    return [x0 - reach / 2 + g * reach, top[1] * S, (i < 2 ? 13 : 9) * S * Math.pow(Math.sin(Math.PI * w), 0.8)] as V3;
  }) as unknown as [V3, V3, V3, V3];
  const a = TAU * phase;
  return { x: 0, z: 1.6 * S * Math.sin(a * 2 - 0.6), pitch: 3 * Math.sin(a - 0.8), soles, neck: 0.5 + 0.5 * Math.sin(a - 1.2), tail: 58 + 8 * Math.sin(a), churn: fr(t * 1.5), formed };
}
function patch(u: V3, k: number, seed: number): number {
  const x = u[0] * k + 7.3, y = u[1] * k + 3.1, z = u[2] * k + 5.7;
  const xi = Math.floor(x), yi = Math.floor(y), zi = Math.floor(z);
  const fx = x - xi, fy = y - yi, fz = z - zi;
  const s = (v: number): number => v * v * (3 - 2 * v);
  const h = (i: number, j: number, m: number): number => hash(xi + i + 101 * (zi + m), yi + j, seed);
  const lx = (j: number, m: number): number => h(0, j, m) + (h(1, j, m) - h(0, j, m)) * s(fx);
  const ly = (m: number): number => lx(0, m) + (lx(1, m) - lx(0, m)) * s(fy);
  return ly(0) + (ly(1) - ly(0)) * s(fz);
}
function fogSkin(seed: number, churn: number, thin: number): Skin {
  return (u, tone) => {
    const streak = fr(u[0] * 0.9 + churn + 0.3 * Math.sin(u[2] * 2.6 + u[1] * 2 + seed));
    const hollow = thin > 0 && patch([u[0] + churn, u[1], u[2]], 1.6, seed) > 1 - thin;
    const t2 = tone + (streak < 0.25 ? 1 : 0) - (hollow ? 1 : 0);
    return FOG[Math.max(0, Math.min(4, t2))];
  };
}
const EYE_SKIN: Skin = (u) => (Math.hypot(u[1], u[2]) < 0.55 ? FLAME[3] : FLAME[2]);
/** THE HORSE AS SOLIDS (`near`: 1 its left side toward us, -1 its right). */
function horseBits(P: HorsePose, put: Put, near: number): void {
  const W = (p: V3): V3 => horseAt(P, p);
  const ax = (a: V3, b: V3, c: V3): [V3, V3, V3] => [turnP(mul(a, S), P.pitch), turnP(mul(b, S), P.pitch), turnP(mul(c, S), P.pitch)];
  const c = P.churn;
  const ball = (part: string, piece: string, at: V3, a: V3, b: V3, cc: V3, seed: number, thin: number): void => put(part, piece, { k: 'ball', c: W(at), ax: ax(a, b, cc), skin: fogSkin(seed, c, thin) });
  // ITS BODY: a deep round barrel, a broad chest, a heavy round rump: a worker's
  ball('horseBody', 'barrel', [-1, 0, 37], [18, 0, 0], [0, 10.2, 0], [0, 0, 10.6], 1, 0.2);
  ball('horseBody', 'chest', [14, 0, 37.5], [9.5, 0, 0], [0, 10.0, 0], [0, 0, 11.4], 2, 0.06);
  ball('horseBody', 'breast', [21, 0, 37], [5.0, 0, 0], [0, 8.6, 0], [0, 0, 8.0], 3, 0.04);
  ball('horseBody', 'withers', [9, 0, 44], [8, 0, 0], [0, 6.4, 0], [0, 0, 4.6], 4, 0.08);
  ball('horseBody', 'haunch', [-17, 0, 39], [10.5, 0, 0], [0, 10.6, 0], [0, 0, 10.8], 5, 0.26);
  ball('horseBody', 'croup', [-14, 0, 44.5], [10, 0, 0], [0, 8.8, 0], [0, 0, 4.6], 6, 0.22);
  ball('horseBody', 'buttock', [-24, 0, 39], [5, 0, 0], [0, 8.6, 0], [0, 0, 8.6], 7, 0.3);
  // ITS NECK: thick, carried low and stretched out at the gallop
  const k = P.neck;
  const crest: V3[] = ([[11, 0, 46], [18, 0, 53 + k], [23, 0, 58.5 + k], [27, 0, 62.5 + k], [30.5, 0, 64.5 + k]] as V3[]).map(W);
  const throat: V3[] = ([[22, 0, 33], [26, 0, 40], [29.5, 0, 46], [32.5, 0, 51], [35, 0, 55]] as V3[]).map(W);
  const wide = [8.0, 7.2, 6.4, 5.6, 5.0];
  const side: V3 = [0, 1, 0];
  const rings: Ring[] = [];
  for (let i = 0; i < crest.length; i++) rings.push({ c: lerp(crest[i], throat[i], 0.5), u: mul(sub(crest[i], throat[i]), 0.5), v: mul(side, wide[i] * S) });
  put('horseBody', 'neck', { k: 'cloth', rings, ramp: FOG, look: { folds: [], lift: 0.04 }, rigid: true });
  // its collar, of its harness still on it: a thick padded ring round the root of its neck, the brass hames on it
  const cc = lerp(lerp(crest[0], throat[0], 0.5), lerp(crest[1], throat[1], 0.5), 0.55);
  const cu = norm(sub(lerp(crest[0], crest[1], 0.55), lerp(throat[0], throat[1], 0.55)));
  const cw = norm(cross(side, cu));
  const half = len(sub(lerp(crest[0], crest[1], 0.55), lerp(throat[0], throat[1], 0.55))) / 2 + 1.6 * S;
  let prev: V3 | null = null;
  for (let i = 0; i <= 14; i++) {
    const a = (i / 14) * TAU;
    const p = add(add(cc, mul(cu, Math.cos(a) * half * 1.06)), add(mul(side, Math.sin(a) * (wide[0] * 0.92 + 1.6) * S), mul(cw, 0.6)));
    if (prev) put('horseCollar', 'collar', { k: 'rod', a: prev, b: p, ra: 1.3 * S, rb: 1.3 * S, ramp: COLLAR });
    prev = p;
  }
  for (const sd of [-1, 1]) put('horseCollar', 'hames', { k: 'rod', a: add(add(cc, mul(cu, half * 0.9)), mul(side, sd * (wide[0] * 0.95 + 2.4) * S)), b: add(add(cc, mul(cu, -half * 0.5)), mul(side, sd * (wide[0] * 0.95 + 2.6) * S)), ra: 0.8 * S, rb: 0.7 * S, ramp: BRASS });
  // ITS HEAD: big and plain, a long straight face, a broad muzzle; its ears; its eyes the enemy's pink
  const poll = crest[crest.length - 1];
  const hd = norm(turnP([0.62, 0, -0.78], P.pitch));
  const face = norm(cross(hd, side), [1, 0, 0]);
  const at = (along: number, fwd: number, out: number): V3 => add(poll, add(mul(hd, along * S), add(mul(face, fwd * S), mul(side, out * S))));
  put('horseBody', 'head', { k: 'ball', c: at(5.4, -1.0, 0), ax: [mul(hd, 6.4 * S), mul(side, 4.0 * S), mul(face, 5.2 * S)], skin: fogSkin(16, c, 0) });
  put('horseBody', 'head', { k: 'ball', c: at(11.5, 0.8, 0), ax: [mul(hd, 6.8 * S), mul(side, 3.3 * S), mul(face, 3.8 * S)], skin: fogSkin(17, c, 0) });
  put('horseBody', 'muzzle', { k: 'ball', c: at(17.4, 1.0, 0), ax: [mul(hd, 3.4 * S), mul(side, 3.2 * S), mul(face, 3.4 * S)], skin: fogSkin(18, c, 0) });
  put('horseBody', 'nostrils', { k: 'dot', p: at(19.2, 3.0, 0), c: FOG[0], facing: face });
  for (const kk of [-1, 1]) {
    const base = at(0.8, 0.4, kk * 2.0);
    const up = norm(add(mul(hd, -0.7), add(mul(face, 0.2), mul(side, kk * 0.35))));
    put('horseBody', 'ears', { k: 'rod', a: base, b: add(base, mul(up, 3.4 * S)), ra: 1.05 * S, rb: 0.25 * S, ramp: FOG });
    put('horseBody', 'eyes', { k: 'ball', c: at(4.4, 1.4, kk * 3.7), ax: [mul(hd, 1.0 * S), mul(side, 0.55 * S), mul(face, 0.8 * S)], skin: EYE_SKIN });
  }
  // ITS LEGS: heavy, fog thinning toward its hooves; feathers of mist at its fetlocks
  for (let i = 0; i < 4; i++) {
    const { top, knee, fet, end } = legOf(P, i);
    const part = `horseLeg${i}`;
    const far = (i % 2 === 0 ? 1 : -1) !== near;
    const hind = i >= 2;
    const mass = lerp(top, knee, 0.22);
    const md = norm(sub(knee, top), [0, 0, -1]);
    const mf = norm(cross(side, md), [1, 0, 0]);
    put(part, 'leg', { k: 'ball', c: mass, ax: [mul(md, (hind ? 6.8 : 5.6) * S), mul(side, (hind ? 3.9 : 3.4) * S), mul(mf, (hind ? 4.8 : 3.9) * S)], skin: fogSkin(30 + i, c, 0.2), far });
    put(part, 'leg', { k: 'rod', a: top, b: knee, ra: (hind ? 3.9 : 3.4) * S, rb: 2.0 * S, ramp: FOG, far });
    put(part, 'leg', { k: 'ball', c: knee, ax: [[2.2 * S, 0, 0], [0, 2.0 * S, 0], [0, 0, 2.3 * S]], skin: FOG, far });
    put(part, 'leg', { k: 'rod', a: knee, b: fet, ra: 1.8 * S, rb: 1.7 * S, ramp: FOG, far });
    // (the feather: a tuft of mist round the fetlock and down over the hoof)
    put(part, 'feather', { k: 'ball', c: add(fet, [0, 0, -1.4 * S]), ax: [[2.8 * S, 0, 0], [0, 2.5 * S, 0], [0, 0, 3.0 * S]], skin: (u, tone) => MANE[Math.max(0, Math.min(4, tone + (u[2] < -0.3 ? 1 : 0)))], far });
    put(part, 'leg', { k: 'rod', a: fet, b: end, ra: 1.6 * S, rb: 1.6 * S, ramp: FOG, far });
    put(part, 'hoof', { k: 'rod', a: add(end, [0, 0, 0.4 * S]), b: add(end, [0, 0, -HOOF_LONG]), ra: 1.7 * S, rb: HOOF_R, ramp: HOOF, far });
  }
  // ITS TAIL, streaming out behind it, and its cropped mane
  const ph = TAU * P.churn;
  const dock = W([-25, 0, 44]);
  const tdir = norm(turnP([-1, 0, 0.0 + Math.sin((P.tail - 60) * D)], P.pitch), [-1, 0, 0]);
  for (let j = 0; j < 4; j++) {
    const spread = (j - 1.5) * 0.55;
    let pv = dock;
    for (let i = 1; i <= 6; i++) {
      const kk = i / 6;
      const wave = Math.sin(ph * 2 + kk * 4 + j * 1.1) * 1.6 * kk;
      const p = add(add(dock, mul(tdir, (3 + 15 * kk) * S)), add(mul(side, (spread * (1 + 3 * kk) + wave) * S), [0, 0, (-11 * kk * kk + Math.sin(ph + j) * kk) * S]));
      put('horseTail', 'tail', { k: 'rod', a: pv, b: p, ra: (2.2 - 1.4 * (kk - 1 / 6)) * S, rb: (2.2 - 1.4 * kk) * S, ramp: MANE });
      pv = p;
    }
  }
  for (let i = 0; i + 1 < crest.length; i++) {
    const up = mul(norm(sub(crest[i], throat[i])), 1.0 * S);
    put('horseMane', 'mane', { k: 'rod', a: add(crest[i], up), b: add(crest[i + 1], up), ra: 1.6 * S, rb: 1.4 * S, ramp: MANE });
  }
}
/** Its loose mist: streaming back off it as it gallops (its feathers, its tail, its back). */
function horseGrains(P: HorsePose, t: number): [V3, string, number][] {
  const out: [V3, string, number][] = [];
  for (let i = 0; i < 4; i++) {
    const { fet } = legOf(P, i);
    for (let j = 0; j < 4; j++) {
      const life = fr(t * 3 + j * 0.25 + i * 0.13);
      out.push([add(fet, [-life * 16 * S, (hash(i, j, 1971) - 0.5) * 3, life * 3]), WISP[1 + Math.min(3, Math.floor(life * 4))], life < 0.4 ? 2 : 1]);
    }
  }
  for (let i = 0; i < 10; i++) {
    const life = fr(t * 2.2 + i / 10);
    const p = horseAt(P, [-26 - life * 26, (hash(i, 1, 1973) - 0.5) * 10, 40 + 6 * hash(i, 2, 1973) - life * 6]);
    if (life < 0.8) out.push([p, WISP[Math.min(4, 1 + Math.floor(life * 4))], 2]);
  }
  return out;
}
/** Its canvas (its anchor the floor under its middle). */
export const HORSE_CANVAS = { w: 300, h: 210, ax: 150, ay: 150 } as const;
/**
 * THE HORSE, `t` seconds after it bursts out, galloping (its stride's phase from `t`), drawn as the groom faces in `view` (it gallops
 * the way it is drawn facing: down its line); `formed` how much of it is there (forming out of the mist; gone into it). Its pink edge.
 */
export function horsePainted(t: number, view: PaintView, formed = horseFormed(t)): { px: Px; lights: Light[] } {
  const C = HORSE_CANVAS;
  const st = stage(view, C.ax, C.ay, C);
  const bits: Bit[] = [];
  const P = gallopPose(fr(t / HORSE_STRIDE), LOOSE.pace, formed, t);
  const near = st.near([0, -3, 30]) > st.near([0, 3, 30]) ? -1 : 1;
  horseBits(P, (part, piece, shape) => bits.push({ part, piece, shape }), near);
  for (const [p, c2, size] of horseGrains(P, t)) if (hash(Math.round(p[0] * 7), Math.round(p[2] * 7), 7521) < formed) bits.push({ part: 'mist', piece: 'mist', shape: { k: 'mote', p, c: c2, size } });
  const lights = paintBits(st, bits, [0, 0, 30]);
  const px = st.whole(ENEMY_RIM);
  // (more fog than horse below, as its cousin the steed: thinned to mist at its legs; forming and fading)
  const sp: SteedPose = { x: 0, y: 0, z: P.z - 24, yaw: 0, pitch: P.pitch, roll: 0, arch: 0, look: 0, legs: [[0, 0], [0, 0], [0, 0], [0, 0]], tail: 0, churn: P.churn, formed: clamp01(formed) };
  thinSteed(px, st, sp, () => true);
  lights.push({ x: C.ax, y: C.ay - 40, r: 50, color: '#cec9e0', a: 0.12 * formed });
  return { px, lights };
}
/** Where its hooves are on the floor (its own place), for the checks: each sole at `phase`. */
export function horseSoles(phase: number): readonly V3[] {
  return gallopPose(phase).soles;
}

/** THE MIST it bursts out of, at the line's start, `t` seconds after (and as it goes at the line's end): a burst of the Hush's grey, its pink flecks. */
export const MIST_CANVAS = { w: 220, h: 170, ax: 110, ay: 120 } as const;
export function mistPainted(t: number): { px: Px; lights: Light[] } {
  const C = MIST_CANVAS;
  const px = new Px(C.w, C.h);
  if (t < 0 || t > 0.9) return { px, lights: [] };
  const dot2 = pen(px);
  const at = (x: number, y: number): [number, number] => tileAt(C.ax, C.ay, x, y);
  for (let i = 0; i < 110; i++) {
    const a = hash(i, 1, 1981) * TAU;
    const d = (0.3 + 0.9 * hash(i, 2, 1981)) * smooth(t / 0.4);
    const [x, y] = at(Math.cos(a) * d, Math.sin(a) * d);
    const up = 50 * hash(i, 3, 1981) * (0.4 + t);
    if (hash(i, 4, 1981) < t / 0.9) continue;
    dot2(x, y - up, i % 9 === 0 ? PINK[1] : WISP[1 + (i % 4)]);
    if (i % 3 === 0) dot2(x + 1, y - up, WISP[2]);
  }
  return { px, lights: [{ x: C.ax, y: C.ay - 30, r: 50, color: '#cec9e0', a: 0.2 * (1 - t / 0.9) }] };
}
export { smooth as smooth01 };
