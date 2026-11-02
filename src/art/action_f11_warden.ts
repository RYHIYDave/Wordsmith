// FLOOR 15'S MEDIUM MOB, MORE ACTION: THE BOOKWARDEN (the art chat's helper, 1 Nov 2026; docs/mockups/action_f11/README.md). A MOCK-UP:
// NOTHING OF THE GAME IMPORTS THIS FILE. The Bookwarden's TOME SLAM BY MOVEMENT 9 (their basic blow) and THE BOOK BARRAGE (in place of
// the page storm) (WARDEN_BARRAGE, off), on the game's own figure (art/bookwardens.ts, art/bookwardens_moves.ts), all it keeps its own.
//
// His review of every enemy for more action, 31 Oct 2026: offered “Book barrage, in place of the page fan: hurls an armful of heavy books
// high, and they rain down over a marked patch where you stood”, he answered “I like the book barrage but it’s more just a rapid series
// of projectiles”. Read as: books flung at you one after another in a rapid stream, not a rain on a patch.
// Under his Movement 9 (24 Oct: “Like the wind up and wind down are big but the actual punch is lightning quick”; 28 Oct: “And bigger
// AOE to compensate for the extra time the player gets to evade”).
//
// THE TOME SLAM: the game's own whirl over the head, HELD (the body still while the tome whirls); its over-the-top, five frames in the
// game's, now TWO, smeared, flat on the floor; the rest the game's own.
// THE BOOK BARRAGE: the left hand thrown up and drawn back, and THE BOOKS rise off the floor round him, heavy, chained books torn up by
// the Hush, and wheel round him at head height, HELD, trembling, their brass glinting pink; in TWO FRAMES he thrusts his hand out at you,
// smeared, and the books are flung at you one after another, a rapid stream, each straight at where you are as it goes, a little fanned,
// smeared as it flies; you dodge across the stream. They skid and lie where they come down.

import { Px } from '../engine/px';
import type { ActorArt } from './actor_types';
import { footwork, plantBy, plantOf } from './bosses3';
import { hash } from './kit';
import { FLAME } from './mkit';
import { WB_BODY, WB_CANVAS, WB_REST, tomeAt, wardenPainter } from './bookwardens';
import type { TomeWay } from './bookwardens';
import { BOOKWARDEN, NAMES, tomeWayOf } from './bookwardens_moves';
import { TILE3, mobSet, posedOfMob, skeletonAt } from './new_mobs3';
import type { Bit, Mob, MobMove, Moment, Put } from './new_mobs3';
import type { Stage } from './skin';
import { elbowFor, lerp3, norm } from './skeleton';
import type { Bones, Key3, Posed, V3 } from './skeleton';
import { FR, TAU, clamp01, f, pen, smearAlong } from './action_f6_fx';

/** THE SWITCH, OFF. With it on, the bestiary's Bookwarden is made by `makeBarrageWardenArt`. */
export const WARDEN_BARRAGE = { on: false };

type P = Partial<Bones>;
const B = WB_BODY;
const R = WB_REST;
const L0 = plantOf(B, 'L', {}, R);
const R0 = plantOf(B, 'R', {}, R);
const PINK = ['#e0287a', '#ff7aa8', '#7a1058'] as const;
/** The books: their leather (black, oxblood, a dull green), their pages, their brass. */
const COVERS = [['#0d0a0c', '#2c2226', '#423438'], ['#2e161c', '#4a2226', '#6a302e'], ['#1a2218', '#263422', '#364830']] as const;
const LEAVES = ['#6a6250', '#b4aa92', '#cec4aa', '#e2d8c0'] as const;
const BRASSY = ['#38280f', '#7a5c2a', '#a88640', '#c8a656'] as const;

function elbowsTo(pose: P, wantL: V3 | null, wantR: V3 | null): P {
  const q = { ...R, ...pose } as Posed;
  const le = wantL ? elbowFor(B, q, true, norm(wantL)) : q.le;
  const re = wantR ? elbowFor(B, { ...q, le } as Posed, false, norm(wantR)) : q.re;
  return { ...pose, le, re };
}

// =============================================================================================
// THE TOME SLAM, BY MOVEMENT 9: the game's own, its over-the-top (frames 24 to 29 of the game's) made two frames

/**
 * THE SLAM'S NUMBERS (seconds from its start; tiles):
 *   wind-up  the game's own: heaved up by 0.3 s, the tome whirling over the head, the body HELD, glinting pink, to 0.8 s (0.5 s)
 *   strike   TWO FRAMES, smeared: over the top (frame 25), FLAT ON THE FLOOR (frame 26, 0.867 s: the clip's `hit`; the game's took five
 *            frames from 0.8 s, its blow at 0.9 s and on the floor at 0.967 s)
 *   wind-down  the game's own, from the floor: held there to 1.2 s, hauled up by 1.52 s, hanging again by 2.1 s
 *   THE DUST  a hero in the dust it shoves out is struck: `reach` round the book's middle (the game's 1.2), `side` of that out of its
 *            sides and `along` of it along their way (the game's stretch)
 */
export const SLAM_HIT = f(26);
export const SLAM_STRIKE = [f(24), f(26)] as const;
export const SLAM_SMEARED = (t: number): boolean => t > SLAM_STRIKE[0] + 1e-6 && t <= SLAM_STRIKE[1] + FR + 1e-6;
export const SLAM9 = { hit: SLAM_HIT, strike: SLAM_STRIKE, long: 2.2 - (f(29) - f(26)), reach: 1.7, side: 1.15, along: 0.8, knock: 0.6 } as const;
/** The game's own moment for a moment of this one: the same to the strike; its five frames over the top in two; after, three frames on. */
export function slamWarp(t: number): number {
  const [a, b] = SLAM_STRIKE;
  // (its whirl a breath slower, so that the game's speeding over the top, from 0.78 s, is all in the strike)
  const a0 = 0.78;
  if (t <= a) return t * (a0 / a);
  if (t <= b) return a0 + ((t - a) / (b - a)) * (f(29) - a0);
  return t + (f(29) - b);
}
const SLAM_NAME = 'The tome slam, by Movement 9';
function slamKeys(): Key3[] {
  const keys: Key3[] = [];
  const n = Math.round(SLAM9.long * 60);
  for (let i = 0; i <= n; i++) {
    const t = i / 60;
    keys.push({ at: t, pose: posedOfMob(BOOKWARDEN, 'attack', slamWarp(t)) as unknown as P, ease: 'lin' });
  }
  return keys;
}
const slamGlint = (t: number): number => (t < 0.16 || t > SLAM_HIT + 0.05 ? 0 : t < 0.32 ? (t - 0.16) / 0.16 : 1);

// =============================================================================================
// THE BOOK BARRAGE

/**
 * THE BARRAGE'S NUMBERS (seconds from its start; tiles):
 *   wind-up   the left hand thrown up and drawn back by 0.4 s; THE BOOKS rise off the floor round him (`n` of them, from `lie` tiles out,
 *             each a little after the one before) to wheel round him `ring` tiles out at head height by 0.6 s; HELD, trembling, glinting,
 *             to 1.0 s
 *   strike    TWO FRAMES, smeared: his hand thrust out at you (frame 32, 1.067 s: the clip's `hit`)
 *   THE STREAM  from the hit, a book flung every `every` s (the last at 1.067 + 8 × 0.08 = 1.707 s), each straight at where the hero is
 *             as it goes (tracking him), fanned up to `fan` degrees off it, at `pace` tiles a second, to `far` tiles; then it comes down,
 *             skids and lies `lies` s
 *   struck    a hero within `r` of a book's way as it comes by is struck by it (each book a blow of its own: the rules' how hard)
 *   wind-down  his hand out, trembling, to 1.75 s; lowered by 2.1 s; at rest 2.5 s
 *   near, far  begun at a hero from 2 to 8 tiles off
 */
export const BARRAGE_HIT = f(32);
export const BARRAGE_STRIKE = [f(30), f(32)] as const;
export const BARRAGE_SMEARED = (t: number): boolean => t > BARRAGE_STRIKE[0] + 1e-6 && t <= BARRAGE_STRIKE[1] + FR + 1e-6;
export const BARRAGE = { hit: BARRAGE_HIT, strike: BARRAGE_STRIKE, up: 0.4, rise: [0.12, 0.6] as const, n: 9, lie: 1.25, ring: 1.05, every: 0.08, pace: 11, fan: 4, far: 8.5, r: 0.5, lies: 1.2, long: 2.5, near: 2, far0: 8 } as const;
const BARRAGE_NAME = 'The book barrage';
const lhand = (x: number, y: number, z: number): P => ({ lhIn: 1, lhx: x, lhy: y, lhz: z });
const SUMMON_BODY: P = { px: -2.0, pz: R.pz + 0.4, yaw: 8, twist: 12, pitch: -6, bend: -8, side: -2, roll: 0, faceUp: 14, faceTilt: 0, faceTurn: -4, lk: 10, rk: -10 };
const SUMMON: P = elbowsTo({ ...SUMMON_BODY, ...lhand(-6, 9, 18) }, [-0.3, 0.8, 0.4], null);
const summonShake = (k: number): P => ({ ...SUMMON, lhz: 18 + (k % 2 ? 0.8 : -0.4), lhx: -6 - 0.3 * (k % 2), pz: (SUMMON.pz as number) - 0.2 * (k % 2) });
const THRUST_MID: P = elbowsTo({ px: 1.4, pz: R.pz - 0.4, yaw: 0, twist: 0, pitch: 4, bend: 0, side: 0, roll: 0, faceUp: 8, faceTilt: 0, faceTurn: 0, lk: 12, rk: -10, ...lhand(10, 4, 12) }, [0, 0.9, 0.4], null);
const THRUST: P = elbowsTo({ px: 4.2, pz: R.pz - 1.4, yaw: -8, twist: -12, pitch: 10, bend: 6, side: 0, roll: 0, faceUp: 6, faceTilt: 0, faceTurn: 4, lk: 16, rk: -10, ...lhand(24, -1, 3) }, [0, 0.8, 0.2], null);
const held = (k: number): P => ({ ...THRUST, px: 5.0, pitch: 11, lhx: 25.5 + 0.4 * (k % 2), lhz: 3 + 0.5 * (k % 2) });
function barrageKeys(): Key3[] {
  return [
    { at: 0, pose: {} },
    { at: 0.18, pose: elbowsTo({ px: -0.8, pz: R.pz, yaw: 4, twist: 6, pitch: 0, bend: -2, side: -1, faceUp: 6, faceTurn: -2, ...lhand(2, 10, -4) }, [-0.2, 0.9, 0], null), ease: 'io' },
    { at: BARRAGE.up, pose: SUMMON, ease: 'out' },
    { at: 0.5, pose: summonShake(1), ease: 'io' },
    { at: 0.6, pose: summonShake(2), ease: 'io' },
    { at: 0.7, pose: summonShake(3), ease: 'io' },
    { at: 0.8, pose: summonShake(4), ease: 'io' },
    { at: 0.9, pose: summonShake(5), ease: 'io' },
    { at: BARRAGE_STRIKE[0], pose: SUMMON, ease: 'io' },
    { at: f(31), pose: THRUST_MID, ease: 'lin' },
    { at: BARRAGE_HIT, pose: THRUST, ease: 'lin' },
    { at: 1.2, pose: held(1), ease: 'out' },
    { at: 1.4, pose: held(2), ease: 'io' },
    { at: 1.6, pose: held(3), ease: 'io' },
    { at: 1.75, pose: held(4), ease: 'io' },
    { at: 2.1, pose: elbowsTo({ px: 1.6, pz: R.pz - 0.4, yaw: -2, twist: -2, pitch: 6, bend: 4, side: 0, faceUp: 0, ...lhand(8, 6, -18) }, [-0.2, 0.9, -0.3], null), ease: 'io' },
    { at: BARRAGE.long, pose: {}, ease: 'io' },
  ];
}
function barrageFeet(): (t: number) => P {
  return footwork(B, {
    L: { start: L0, moves: [{ t0: BARRAGE_STRIKE[0], t1: BARRAGE_HIT, to: plantBy(L0, 7, 0.5, 4), lift: 3 }, { t0: 2.0, t1: 2.3, to: L0, lift: 2.6 }] },
    R: { start: R0, moves: [{ t0: 0.1, t1: 0.32, to: plantBy(R0, -4, -1, -6), lift: 2.6 }, { t0: 2.1, t1: 2.4, to: R0, lift: 2.4 }] },
  });
}
const barrageGlint = (t: number): number => (t < 0.12 || t > 1.8 ? 0 : t < BARRAGE.up ? (t - 0.12) / (BARRAGE.up - 0.12) : 1);

// =============================================================================================
// THE BOOKS: where each is (tiles before him and to his left, and how high: figure units), turning over as it goes

export interface BookAt {
  x: number;
  y: number;
  z: number;
  /** How far it has turned over (radians), and whether it is flying at you, how long since it went, and whether it lies on the floor. */
  spin: number;
  flying: boolean;
  since: number;
  lying: boolean;
  /** Its colours (which of the covers). */
  cover: number;
  /** Where it goes (tiles): set as it goes. */
  to?: [number, number];
}
/** When book `i` goes (seconds into the barrage). */
export const bookGoes = (i: number): number => BARRAGE_HIT + i * BARRAGE.every;
/** Where book `i` wheels round him (before it goes), `t` seconds in. */
function wheeling(i: number, t: number): BookAt {
  const n = BARRAGE.n;
  const a0 = (i / n) * TAU + 0.4;
  const rise = clamp01((t - BARRAGE.rise[0] - i * 0.025) / (BARRAGE.rise[1] - BARRAGE.rise[0] - n * 0.025));
  const k = rise * rise * (3 - 2 * rise);
  // (lying on the floor round him; torn up and wheeling round at head height, faster as it is held)
  const a = a0 + 1.6 * Math.max(0, t - BARRAGE.rise[0]) + 0.6 * Math.max(0, t - BARRAGE.up) ** 2;
  const r = BARRAGE.lie + (BARRAGE.ring - BARRAGE.lie) * k;
  const z = 2 + (52 + 14 * Math.sin(i * 2.3) - 2) * k + (k > 0.99 ? 1.4 * Math.sin(t * 31 + i * 1.7) : 0);
  return { x: Math.cos(a) * r, y: Math.sin(a) * r, z, spin: k * (2 + i) + t * 3 * k, flying: false, since: 0, lying: false, cover: i % 3 };
}
/**
 * WHERE BOOK `i` IS `t` seconds into the barrage; `aim(when)`: where the hero is then (tiles before him and to his left: it is flung at
 * the place he is as it goes, a little fanned).
 */
export function bookAt(i: number, t: number, aim: (when: number) => [number, number]): BookAt {
  const go = bookGoes(i);
  if (t < go) return wheeling(i, t);
  const from = wheeling(i, go);
  const [ax, ay] = aim(go);
  const fan = ((hash(i, 1, 1401) - 0.5) * 2 * BARRAGE.fan * Math.PI) / 180;
  const base = Math.atan2(ay - from.y, ax - from.x) + fan;
  const s = t - go;
  const d = Math.min(BARRAGE.far, s * BARRAGE.pace);
  const dx = Math.cos(base);
  const dy = Math.sin(base);
  const flyLong = BARRAGE.far / BARRAGE.pace;
  const to: [number, number] = [from.x + dx * BARRAGE.far, from.y + dy * BARRAGE.far];
  if (s < flyLong) {
    // (dropping a little as it flies, from head height to a man's chest)
    const z = from.z - 18 * (s / flyLong) ** 2;
    return { x: from.x + dx * d, y: from.y + dy * d, z, spin: from.spin + s * 22, flying: true, since: s, lying: false, cover: from.cover, to };
  }
  // (come down: skidding a little, lying)
  const u = s - flyLong;
  const sk = Math.min(0.5, u * 3) * (1 - Math.min(1, u * 2) / 2);
  const z = Math.max(1.5, from.z - 18 - 160 * u * u);
  return { x: to[0] + dx * sk, y: to[1] + dy * sk, z, spin: from.spin + flyLong * 22 + Math.min(u, 0.25) * 12, flying: false, since: s, lying: z <= 1.6, cover: from.cover, to };
}
/** Whether book `i`, `t` seconds in, strikes a hero `x`, `y` tiles from him (within `r` of where it is, flying). */
export function bookStrikes(i: number, t: number, aim: (when: number) => [number, number], x: number, y: number): boolean {
  const b = bookAt(i, t, aim);
  return b.flying && Math.hypot(x - b.x, y - b.y) <= BARRAGE.r;
}
/** The whole barrage is done (every book lain and gone) by this long after it begins. */
export const BARRAGE_DONE = bookGoes(BARRAGE.n - 1) + BARRAGE.far / BARRAGE.pace + 0.3 + BARRAGE.lies;

/** A book's picture (its middle on the anchor): a heavy closed book turned `spin`, its cover, its pages' edge, brass at its corners. */
export const BOOK_CANVAS = { w: 48, h: 48, ax: 24, ay: 24 } as const;
export function bookPainted(spin: number, cover: number, lying = false, glint = 0): Px {
  const C = BOOK_CANVAS;
  const px = new Px(C.w, C.h);
  const dot2 = pen(px);
  const cv = COVERS[cover % 3];
  const ca = Math.cos(spin);
  const sa = Math.sin(spin);
  // (seen turning over: its cover's face as wide as it is turned to the eye, its thickness the rest)
  const W = 9;
  const H = lying ? 3.4 : 6.2;
  const T = lying ? 1.2 : 2.6 * Math.abs(sa) + 1;
  const face = Math.abs(ca);
  for (let v = -H; v <= H; v += 0.5) {
    for (let u = -W; u <= W; u += 0.5) {
      const tilt = lying ? 0 : 0.35;
      const X = C.ax + u * (lying ? 1 : Math.cos(tilt * Math.sin(spin * 0.5))) + v * (lying ? 0.4 : 0);
      const Y = C.ay + v * (face * 0.8 + 0.2) - u * 0.15;
      const corner = Math.abs(u) > W - 1.6 && Math.abs(v) > H - 1.6;
      dot2(X, Y, corner ? (glint > 0.4 ? FLAME[2] : BRASSY[2]) : Math.abs(v) > H - 0.6 || Math.abs(u) > W - 0.6 ? cv[0] : u < -W + 2 ? cv[1] : cv[2]);
    }
  }
  // (its pages' edge, under the cover as it is turned)
  for (let u = -W + 1; u <= W - 0.5; u += 0.5) for (let k = 0; k < T; k += 0.5) dot2(C.ax + u, C.ay + H * (face * 0.8 + 0.2) + k + 0.5 - u * 0.15, k < 0.6 ? LEAVES[0] : (Math.round(u * 2) % 3 ? LEAVES[2] : LEAVES[1]));
  return px;
}
/** The streak of a book in flight: after-images along the way it came, `dx`, `dy` picture pixels a frame (oldest dull and broken, its leading edge the enemy's pink). */
export function bookStreak(px: Px, x: number, y: number, dx: number, dy: number, seed: number): void {
  const dot2 = pen(px);
  const L = Math.hypot(dx, dy);
  if (L < 1) return;
  const n = Math.ceil(L * 1.6);
  for (let k = 2; k < n; k++) {
    const u = k / n;
    for (const off of [-4, -2, 0, 2, 4]) {
      if (u > 0.6 && (k + off) % 2) continue;
      const X = x - (dx / L) * k + (-dy / L) * off;
      const Y = y - (dy / L) * k + (dx / L) * off;
      dot2(X, Y, u < 0.25 ? (off === -1 ? PINK[1] : '#e2d8c0') : u < 0.55 ? '#a69c88' : hash(k, off, seed) > 0.5 ? '#5e5850' : '#3a3630');
    }
  }
}

// =============================================================================================
// THEM, WITH THESE TWO

function moreBits(mob: Mob, st: Stage, m: Moment): Bit[] {
  const bits: Bit[] = [];
  const put: Put = (part, piece, shape) => {
    bits.push({ part, piece, shape });
  };
  const t = m.t;
  if (m.move === SLAM_NAME && SLAM_SMEARED(t)) {
    const thin = Math.abs(t - SLAM_HIT - FR) < 1e-6;
    const lines: V3[][] = [[], [], []];
    for (let i = 0; i <= 8; i++) {
      const u = Math.min(t, SLAM_HIT) - (FR * 1.3 * i) / 8;
      const k = tomeAt(skeletonAt(mob, 'attack', u), tomeWayOf('attack', slamWarp(u)));
      lines[0].push(k.mid);
      lines[1].push(k.tie);
      lines[2].push(lerp3(k.end, k.tie, 0.5));
    }
    smearAlong(st, put, lines, thin, ['#1c1924', '#423438', '#a69c88', '#e2d8c0'], PINK[1]);
  }
  if (m.move === BARRAGE_NAME) {
    if (BARRAGE_SMEARED(t)) {
      const thin = Math.abs(t - BARRAGE_HIT - FR) < 1e-6;
      const lines: V3[][] = [[], []];
      for (let i = 0; i <= 8; i++) {
        const u = Math.min(t, BARRAGE_HIT) - (FR * 1.3 * i) / 8;
        const s = skeletonAt(mob, 'barrage', u);
        lines[0].push(s.handL);
        lines[1].push(lerp3(s.handL, s.elbowL, 0.5));
      }
      smearAlong(st, put, lines, thin, ['#1c1924', '#423438', '#a69c88', '#e2d8c0'], PINK[1]);
    }
    // (the Hush pouring from his raised hand into the books: grey breath and pink sparks)
    if (t > 0.2 && t < 1.8) {
      const h = m.s.handL;
      for (let i = 0; i < 10; i++) {
        const u = (t * 2 + i / 10) % 1;
        const a = hash(i, Math.floor(t * 2 + i / 10), 1411) * TAU;
        put('fx', 'fx', { k: 'mote', p: [h[0] + Math.cos(a) * 9 * u, h[1] + Math.sin(a) * 9 * u, h[2] + 2 + 6 * u], c: i % 4 === 0 ? PINK[1] : u < 0.5 ? '#cac6d0' : '#8a8694', size: u < 0.3 ? 2 : 1 });
      }
    }
  }
  return bits;
}

const WB_CANVAS2 = { w: 460, h: 380, ax: 210, ay: 270 } as const;
function barrageWarden(): Mob {
  const base = BOOKWARDEN;
  const KEY: Record<string, string> = { [NAMES.stand]: 'stand', [NAMES.walk]: 'walk', [NAMES.reel]: 'reel', [NAMES.dying]: 'dying' };
  const wayOf = (m: Moment): TomeWay => {
    if (m.move === SLAM_NAME) return tomeWayOf('attack', slamWarp(m.t));
    if (m.move === BARRAGE_NAME) return tomeWayOf('stand', m.t);
    return tomeWayOf(m.dying ? 'dying' : KEY[m.move ?? ''] ?? 'stand', m.t);
  };
  const paint = wardenPainter({ tome: wayOf });
  const own = BOOKWARDEN.bits;
  const mv = (name: string, keys: Key3[], hit: number, more: Partial<MobMove>): MobMove => ({ name, motion: { keys, hit }, rest: R, ...more });
  const mob: Mob = {
    ...base,
    id: 'bookwarden-barrage',
    attack: mv(SLAM_NAME, slamKeys(), SLAM_HIT, { glint: slamGlint }),
    hit: SLAM_HIT,
    warn: SLAM_STRIKE[0] - 0.32,
    more: { barrage: mv(BARRAGE_NAME, barrageKeys(), BARRAGE_HIT, { feet: barrageFeet(), glint: barrageGlint }) },
    canvas: WB_CANVAS2,
    aura: { ...base.aura, x: base.aura.x - WB_CANVAS.ax + WB_CANVAS2.ax, y: base.aura.y - WB_CANVAS.ay + WB_CANVAS2.ay },
    // (the game's own painter for its own moves, frame for frame; for these two, the same painter told where the tome is)
    bits: (st, m) => (m.move === SLAM_NAME || m.move === BARRAGE_NAME ? [...paint.bits(st, m), ...moreBits(mob, st, m)] : own(st, m)),
    grains: (st, m) => (m.move === SLAM_NAME || m.move === BARRAGE_NAME ? paint.grains(st, m) : base.grains?.(st, m) ?? []),
  };
  return mob;
}
/** THE BOOKWARDEN WITH THE TOME SLAM BY MOVEMENT 9 AND THE BOOK BARRAGE (WARDEN_BARRAGE): the game's own in all but these two. */
export const BARRAGE_WARDEN = barrageWarden();
/** As the game holds a monster: the slam as `attack`, the barrage as `moves.barrage` (in place of `storm`). */
export function makeBarrageWardenArt(pace = BARRAGE_WARDEN.pace): ActorArt {
  return { front: mobSet(BARRAGE_WARDEN, 'front', pace), back: mobSet(BARRAGE_WARDEN, 'back', pace) };
}
/** Where the tome lies flat on the floor at the slam (tiles before him, to his left). */
export function slamAt9(): [number, number] {
  const k = tomeAt(skeletonAt(BARRAGE_WARDEN, 'attack', SLAM_HIT), tomeWayOf('attack', slamWarp(SLAM_HIT)));
  return [k.mid[0] / TILE3, k.mid[1] / TILE3];
}
/** Whether a hero `x` tiles before him and `y` to his left is in the slam's dust. */
export function slamStrikes(x: number, y: number): boolean {
  const [bx, by] = slamAt9();
  const u = (x - bx) / (SLAM9.reach * SLAM9.along);
  const v = (y - by) / (SLAM9.reach * SLAM9.side);
  return u * u + v * v <= 1;
}
