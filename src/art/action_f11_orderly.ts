// FLOOR 14'S MEDIUM MOB, MORE ACTION: THE ORDERLY (the art chat's helper, 1 Nov 2026; docs/mockups/action_f11/README.md). A MOCK-UP:
// NOTHING OF THE GAME IMPORTS THIS FILE. The orderly's MALLET BLOW BY MOVEMENT 9 (their basic blow) and THE GURNEY CHARGE (in place of
// the quake) (ORDERLY_GURNEY, off), on the game's own figure (art/orderlies.ts, art/orderlies_moves.ts), all it keeps its own.
//
// His review of every enemy for more action, 31 Oct 2026, offered and answered “Yes (Recommended)”:
//   THE ORDERLY (floor 14, medium): “Gurney charge, in place of the leap: shoves an iron gurney down a marked lane at you. It careers
//   on and crashes into whatever it hits.”
// Under his Movement 9 (24 Oct: “Like the wind up and wind down are big but the actual punch is lightning quick”; 28 Oct: “And bigger
// AOE to compensate for the extra time the player gets to evade”).
//
// THE MALLET BLOW: raised high over the head in both hands, HELD, shaking, its hoops glinting pink; in TWO FRAMES over the top and into
// the floor, smeared; bent over it; heaved back onto the shoulder. A bigger ring than the game's.
// THE GURNEY CHARGE: an iron gurney stands before him; THE LANE is marked from it, through where you stood. He swings the mallet back and
// up behind him in both hands, wound round, crouched, HELD; in TWO FRAMES he swings it down and through and its head SLAMS into the
// gurney's end, smeared; the gurney careers off down the lane, heavy, rattling, fast, and CRASHES into whatever it hits, or at the
// lane's end, flipping over in a burst of iron and splinters. He follows through, bent after it, and heaves the mallet back up.

import { Px } from '../engine/px';
import type { Light } from '../engine/px';
import type { ActorArt } from './actor_types';
import { footwork, plantBy, plantOf } from './bosses3';
import { hash } from './kit';
import type { Ramp } from './kit';
import { ENEMY_RIM } from './mkit';
import { ORDERLY_BODY, ORDERLY_CANVAS, ORDERLY_REST, malletOf, orderlyPainter } from './orderlies';
import { OD_DIES, ORDERLY } from './orderlies_moves';
import { TILE3, mobSet, paintBits, skeletonAt, sphere } from './new_mobs3';
import type { Bit, Mob, MobMove, Moment, Put } from './new_mobs3';
import { stage } from './skin';
import type { PaintView, Stage } from './skin';
import { add, elbowFor, lerp3, mul, norm } from './skeleton';
import type { Bones, Key3, Posed, V3 } from './skeleton';
import { FR, TAU, blob, clamp01, f, markRing, pen, smearAlong, smooth, tileAt } from './action_f6_fx';

/** THE SWITCH, OFF. With it on, the bestiary's orderly is made by `makeGurneyOrderlyArt`. */
export const ORDERLY_GURNEY = { on: false };

type P = Partial<Bones>;
const B = ORDERLY_BODY;
const R = ORDERLY_REST;
const L0 = plantOf(B, 'L', {}, R);
const R0 = plantOf(B, 'R', {}, R);
const PINK = ['#e0287a', '#ff7aa8', '#7a1058'] as const;
const IRON: Ramp = ['#1a1c22', '#24262e', '#4a4f59', '#727884', '#8c929c'];
const SHEET: Ramp = ['#46463f', '#6a6a60', '#9c988c', '#c4c0b2', '#d4d0c2'];
const STRAP: Ramp = ['#1a120c', '#2a1e14', '#46301e', '#5e432a', '#6e5032'];
const RUST = ['#3e2620', '#5c3624', '#7a4a2e'] as const;
const DUST = ['#4c4436', '#6e6448', '#8e815e', '#a69872'] as const;

function elbowsTo(pose: P, wantL: V3 | null, wantR: V3 | null): P {
  const q = { ...R, ...pose } as Posed;
  const le = wantL ? elbowFor(B, q, true, norm(wantL)) : q.le;
  const re = wantR ? elbowFor(B, { ...q, le } as Posed, false, norm(wantR)) : q.re;
  return { ...pose, le, re };
}
/** Both hands on the handle: the left below the right, toward the butt. */
const BOTH: P = { lhIn: 3, lhx: -4.2, lhy: 0, lhz: 0 };

// =============================================================================================
// THE MALLET BLOW, BY MOVEMENT 9

/**
 * THE BLOW'S NUMBERS (seconds from its start; tiles):
 *   wind-up  lifted off the shoulder and raised high over the head by 0.36 s, the left foot stepped in; HELD, shaking, its hoops
 *            glinting pink, to 0.8 s (0.44 s)
 *   strike   TWO FRAMES, smeared: over the top (frame 25), IN THE FLOOR (frame 26, 0.867 s: the clip's `hit`)
 *   wind-down  bent over it to 1.4 s; heaved up by 1.8 s; on the shoulder by 2.3 s
 *   THE RING  a hero within `r` of where its head goes into the floor (`at` before him), or in its way there (from `from`, `half` to
 *            either side), is struck and knocked back `knock`; its dust ring and cracks the game's own mark (render/act1_fx/orderly.ts)
 */
export const BLOW_HIT = f(26);
export const BLOW_STRIKE = [f(24), f(26)] as const;
export const BLOW_SMEARED = (t: number): boolean => t > BLOW_STRIKE[0] + 1e-6 && t <= BLOW_STRIKE[1] + FR + 1e-6;
export const BLOW9 = { hit: BLOW_HIT, strike: BLOW_STRIKE, raised: 0.36, long: 2.3, r: 1.5, from: 0.3, half: 0.7, knock: 0.6 } as const;
const BLOW_NAME = 'The mallet blow, by Movement 9';
const RAISED: P = elbowsTo({ px: -2.6, pz: R.pz + 0.6, yaw: -4, twist: -6, pitch: -6, bend: -12, roll: 0, side: 0, faceUp: 16, faceTilt: 0, faceTurn: 0, rhIn: 1, rhx: 1.5, rhy: 3.0, rhz: 21, wAz: 0, wEl: 128, wRoll: 0, ...BOTH, lk: 12, rk: -10 }, [0.4, 1, 0.4], [0.4, -1, 0.4]);
const shake = (k: number): P => ({ ...RAISED, rhz: (RAISED.rhz as number) + (k % 2 ? 0.7 : -0.3), px: (RAISED.px as number) - 0.3 * (k % 2), roll: k % 2 ? 1 : -1 });
const OVER: P = elbowsTo({ ...RAISED, px: 3.2, pz: R.pz - 0.6, yaw: 3, twist: -2, pitch: 15, bend: -2, faceUp: 8, rhx: 10, rhy: 1.5, rhz: 14, wEl: 62 }, [0.6, 1, -0.2], [0.6, -1, -0.2]);
const FLOOR: P = elbowsTo({ px: 6.5, pz: R.pz - 8.5, yaw: 4, twist: 2, pitch: 38, bend: 21, roll: 0, side: 0, faceUp: -10, faceTilt: 0, faceTurn: 0, rhIn: 1, rhx: 14.5, rhy: 2.0, rhz: -25, wAz: 0, wEl: -18, wRoll: 0, ...BOTH, lk: 16, rk: -10 }, [0.2, 1, -0.6], [0.2, -1, -0.6]);
const HEAVE: P = elbowsTo({ px: 1.5, pz: R.pz - 0.4, yaw: 0, twist: -4, pitch: 2, bend: 0, roll: 0, side: 0, faceUp: 6, faceTilt: 0, faceTurn: 0, rhIn: 1, rhx: 8, rhy: 1.0, rhz: 2, wAz: 0, wEl: 80, wRoll: 0, ...BOTH, lk: 12, rk: -10 }, [0.3, 1, -0.6], [0.3, -1, -0.6]);
function blowKeys(): Key3[] {
  return [
    { at: 0, pose: {} },
    { at: 0.16, pose: elbowsTo({ px: -1.0, pitch: 0, bend: -2, faceUp: 8, rhIn: 1, rhx: 6, rhy: 1.5, rhz: 6, wAz: 182, wEl: 50, ...BOTH }, [0.4, 1, -0.2], [0.4, -1, -0.2]), ease: 'io', as: { wAz: 2, wEl: 130 } },
    { at: BLOW9.raised, pose: RAISED, ease: 'io' },
    { at: 0.44, pose: shake(1), ease: 'io' },
    { at: 0.52, pose: shake(2), ease: 'io' },
    { at: 0.6, pose: shake(3), ease: 'io' },
    { at: 0.7, pose: shake(4), ease: 'io' },
    { at: BLOW_STRIKE[0], pose: RAISED, ease: 'io' },
    { at: f(25), pose: OVER, ease: 'lin' },
    { at: BLOW_HIT, pose: FLOOR, ease: 'lin' },
    { at: 1.0, pose: { ...FLOOR, pz: (FLOOR.pz as number) - 0.4, pitch: 39 }, ease: 'out' },
    { at: 1.4, pose: { ...FLOOR, pz: (FLOOR.pz as number) + 0.3, pitch: 36, bend: 19, faceUp: -6 }, ease: 'io' },
    { at: 1.8, pose: HEAVE, ease: 'io', as: { wAz: 180, wEl: 100 } },
    { at: BLOW9.long, pose: {}, ease: 'io' },
  ];
}
function blowFeet(): (t: number) => P {
  return footwork(B, {
    L: { start: L0, moves: [{ t0: 0.16, t1: 0.36, to: plantBy(L0, 9, 0.5, 6), lift: 3.2 }, { t0: 1.75, t1: 2.05, to: L0, lift: 2.8 }] },
    R: { start: R0, moves: [{ t0: BLOW_STRIKE[0], t1: BLOW_HIT, to: { ...R0, pitch: 18 } }, { t0: 1.75, t1: 2.0, to: R0 }] },
  });
}
const blowGlint = (t: number): number => (t < 0.12 || t > BLOW_HIT + 0.05 ? 0 : t < BLOW9.raised ? (t - 0.12) / (BLOW9.raised - 0.12) : 1);
/** How hard it has just struck the floor (the painter's dust and splinters): 1 as it goes in, falling away. */
const slam9 = (t: number): number => {
  const u = (t - BLOW_HIT) / 0.6;
  return u >= 0 && u < 1 ? 1 - u : 0;
};

// =============================================================================================
// THE GURNEY CHARGE

/**
 * THE CHARGE'S NUMBERS (seconds from its start; tiles):
 *   the gurney  stands before him, its middle `at` tiles on, `long` long and `wide` across (its end `at - long/2` before him)
 *   its aim    where the hero stands at `aim`: THE LANE marked from then, `lane` long from him, `half` to either side of its middle
 *   wind-up    both hands on the mallet, swung back and up behind him, wound round, crouched, by 0.5 s; HELD, its hoops glinting, to 0.9 s
 *   strike     TWO FRAMES, smeared: swung down past his hip (frame 28), its head SLAMMED into the gurney's end (frame 29, 0.967 s: `hit`)
 *   its run    off down the lane at `pace` tiles a second at once, rattling, slowing a little (`gurneyGone(t)`); a hero in the lane as it
 *              comes by is struck and it CRASHES on him; else it crashes at the lane's end (or a wall)
 *   THE CRASH  a hero within `r` of where it crashes is struck and knocked back `knock`; its wreck lies `lies` s
 *   wind-down  bent after it to 1.3 s; heaved up by 1.75 s; on the shoulder by 2.3 s
 *   near, far  begun at a hero from 2.5 to 8 tiles off
 */
export const GURNEY_HIT = f(29);
export const GURNEY_STRIKE = [f(27), f(29)] as const;
export const GURNEY_SMEARED = (t: number): boolean => t > GURNEY_STRIKE[0] + 1e-6 && t <= GURNEY_STRIKE[1] + FR + 1e-6;
export const GURNEY = { hit: GURNEY_HIT, strike: GURNEY_STRIKE, at: 65.5 / TILE3, long: 58 / TILE3, wide: 24 / TILE3, aim: 0.3, lane: 10, half: 0.8, up: 0.5, pace: 9, slow: 0.25, r: 1.5, knock: 1.0, lies: 1.6, near: 2.5, far: 8, long0: 2.3 } as const;
const GURNEY_NAME = 'The gurney charge';
/** How far the gurney has gone from where it stood, `t` seconds after it is struck (tiles): off at its pace at once, slowing a little. */
export const gurneyGone = (t: number): number => (t <= 0 ? 0 : GURNEY.pace * t * (1 - GURNEY.slow * Math.min(1, t / 1.2) * 0.5));
/** The mallet as he swings it: both hands at `hand` (from the pelvis's place), the handle pointing `az`, `el`. */
const swing = (body: P, hand: V3, az: number, el: number, want: [V3, V3]): P => elbowsTo({ ...body, rhIn: 2, rhx: hand[0] + ((body.px as number) ?? 0), rhy: hand[1], rhz: hand[2], wAz: az, wEl: el, wRoll: 0, ...BOTH }, want[0], want[1]);
const BACKSWING_BODY: P = { px: -3.0, pz: R.pz - 3.0, yaw: -14, twist: -18, pitch: 4, bend: 2, side: 2, roll: 0, faceUp: 4, faceTilt: 0, faceTurn: 10, lk: 18, rk: -16 };
const BACKSWING: P = swing(BACKSWING_BODY, [-5, -15, 46], 200, 38, [[0.3, 1, -0.4], [-0.4, -1, 0.2]]);
const backShake = (k: number): P => ({ ...BACKSWING, rhz: (BACKSWING.rhz as number) + (k % 2 ? 0.6 : -0.3), pz: (BACKSWING.pz as number) - 0.25 * (k % 2) });
const DOWNSWING: P = swing({ px: 1.5, pz: R.pz - 3.6, yaw: -4, twist: -10, pitch: 12, bend: 6, side: 1, roll: 0, faceUp: 2, faceTilt: 0, faceTurn: 4, lk: 20, rk: -14 }, [4, -9, 42], 185, -45, [[0.3, 1, -0.5], [-0.2, -1, -0.3]]);
const SLAMMED: P = swing({ px: 5.5, pz: R.pz - 4.4, yaw: 6, twist: 4, pitch: 22, bend: 12, side: 0, roll: 0, faceUp: -2, faceTilt: 0, faceTurn: -2, lk: 22, rk: -12 }, [14, -3, 44], 180, -110, [[0.3, 1, -0.6], [0.1, -1, -0.5]]);
const FOLLOW: P = swing({ px: 7.0, pz: R.pz - 4.8, yaw: 8, twist: 6, pitch: 26, bend: 14, side: 0, roll: 0, faceUp: -4, faceTilt: 0, faceTurn: -2, lk: 24, rk: -12 }, [19, -2, 37], 180, -128, [[0.3, 1, -0.6], [0.1, -1, -0.5]]);
function gurneyKeys(): Key3[] {
  return [
    { at: 0, pose: {} },
    // (the left hand to the handle, the mallet lowered off the shoulder behind him)
    { at: 0.2, pose: swing({ px: -1.2, pz: R.pz - 1.0, yaw: -6, twist: -8, pitch: 4, bend: 2, side: 1, roll: 0, faceUp: 2, faceTurn: 4, lk: 12, rk: -12 }, [2, -12, 44], 196, 46, [[0.3, 1, -0.4], [-0.4, -1, 0]]), ease: 'io' },
    { at: GURNEY.up, pose: BACKSWING, ease: 'out' },
    { at: 0.6, pose: backShake(1), ease: 'io' },
    { at: 0.7, pose: backShake(2), ease: 'io' },
    { at: 0.8, pose: backShake(3), ease: 'io' },
    { at: GURNEY_STRIKE[0], pose: BACKSWING, ease: 'io' },
    { at: f(28), pose: DOWNSWING, ease: 'lin' },
    { at: GURNEY_HIT, pose: SLAMMED, ease: 'lin' },
    { at: GURNEY_HIT + 0.14, pose: FOLLOW, ease: 'out', as: { wAz: 0, wEl: -52 } },
    { at: 1.3, pose: swing({ px: 6.4, pz: R.pz - 4.2, yaw: 6, twist: 4, pitch: 24, bend: 13, side: 0, roll: 0, faceUp: 4, faceTilt: 0, faceTurn: -2, lk: 22, rk: -12 }, [19, -3, 37], 0, -48, [[0.3, 1, -0.6], [0.1, -1, -0.5]]), ease: 'io' },
    { at: 1.75, pose: HEAVE, ease: 'io', as: { wAz: 180, wEl: 100 } },
    { at: GURNEY.long0, pose: {}, ease: 'io' },
  ];
}
function gurneyFeet(): (t: number) => P {
  return footwork(B, {
    L: { start: L0, moves: [{ t0: 0.2, t1: 0.42, to: plantBy(L0, 6, 1.5, 4), lift: 3 }, { t0: 1.7, t1: 2.0, to: L0, lift: 2.8 }] },
    R: { start: R0, moves: [{ t0: 0.12, t1: 0.34, to: plantBy(R0, -6, -1.5, -16), lift: 3 }, { t0: GURNEY_STRIKE[0], t1: GURNEY_HIT, to: plantBy(R0, -6, -1.5, -10, { pitch: 22 }) }, { t0: 1.5, t1: 1.8, to: R0, lift: 2.6 }] },
  });
}
const gurneyGlint = (t: number): number => (t < 0.12 || t > GURNEY_HIT + 0.05 ? 0 : t < GURNEY.up ? (t - 0.12) / (GURNEY.up - 0.12) : 1);

function moreBits(mob: Mob, st: Stage, m: Moment): Bit[] {
  const bits: Bit[] = [];
  const put: Put = (part, piece, shape) => {
    bits.push({ part, piece, shape });
  };
  const t = m.t;
  const which = m.move === BLOW_NAME && BLOW_SMEARED(t) ? 'attack' : m.move === GURNEY_NAME && GURNEY_SMEARED(t) ? 'gurney' : null;
  if (!which) return bits;
  const hit = which === 'attack' ? BLOW_HIT : GURNEY_HIT;
  const thin = Math.abs(t - hit - FR) < 1e-6;
  const lines: V3[][] = [[], [], [], []];
  for (let i = 0; i <= 8; i++) {
    const u = Math.min(t, hit) - (FR * 1.3 * i) / 8;
    const k = malletOf(skeletonAt(mob, which, u));
    lines[0].push(k.head);
    lines[1].push(k.faceA);
    lines[2].push(k.faceB);
    lines[3].push(k.neck);
  }
  smearAlong(st, put, lines, thin, ['#2a2014', '#5e432a', '#9c845e', '#e8e0d0'], PINK[1]);
  return bits;
}

const OD_CANVAS2 = { w: 420, h: 330, ax: 180, ay: 230 } as const;
function gurneyOrderly(): Mob {
  const paint = orderlyPainter({
    mallet: (m: Moment) => !(m.dying && m.t >= OD_DIES.drop),
    slam: (m: Moment) => (m.move === BLOW_NAME ? slam9(m.t) : 0),
  });
  const base = ORDERLY;
  const mv = (name: string, keys: Key3[], hit: number, more: Partial<MobMove>): MobMove => ({ name, motion: { keys, hit }, rest: R, ...more });
  const mob: Mob = {
    ...base,
    id: 'orderly-gurney',
    attack: mv(BLOW_NAME, blowKeys(), BLOW_HIT, { feet: blowFeet(), glint: blowGlint }),
    hit: BLOW_HIT,
    warn: BLOW_STRIKE[0] - BLOW9.raised,
    more: { gurney: mv(GURNEY_NAME, gurneyKeys(), GURNEY_HIT, { feet: gurneyFeet(), glint: gurneyGlint }) },
    canvas: OD_CANVAS2,
    aura: { ...base.aura, x: base.aura.x - ORDERLY_CANVAS.ax + OD_CANVAS2.ax, y: base.aura.y - ORDERLY_CANVAS.ay + OD_CANVAS2.ay },
    bits: (st, m) => [...paint.bits(st, m), ...moreBits(mob, st, m)],
    grains: paint.grains,
  };
  return mob;
}
/** THE ORDERLY WITH THE MALLET BLOW BY MOVEMENT 9 AND THE GURNEY CHARGE (ORDERLY_GURNEY): the game's own in all but these two. */
export const GURNEY_ORDERLY = gurneyOrderly();
/** As the game holds a monster: the blow as `attack`, the gurney charge as `moves.gurney` (in place of `quake`). */
export function makeGurneyOrderlyArt(pace = GURNEY_ORDERLY.pace): ActorArt {
  return { front: mobSet(GURNEY_ORDERLY, 'front', pace), back: mobSet(GURNEY_ORDERLY, 'back', pace) };
}
/** Where the mallet's head goes into the floor at the blow (tiles before him, to his left). */
export function blowAt(): [number, number] {
  const k = malletOf(skeletonAt(GURNEY_ORDERLY, 'attack', BLOW_HIT));
  return [k.head[0] / TILE3, k.head[1] / TILE3];
}
/** Whether the blow strikes a hero `x` tiles before him and `y` to his left. */
export function blowStrikes(x: number, y: number): boolean {
  const [bx, by] = blowAt();
  return Math.hypot(x - bx, y - by) <= BLOW9.r || (x >= BLOW9.from && x <= bx && Math.abs(y - by) <= BLOW9.half);
}
/** Whether the gurney, `d` tiles on from where it stood, strikes a hero `x` tiles before the orderly and `y` across the lane. */
export const gurneyStrikes = (d: number, x: number, y: number): boolean => Math.abs(y) <= GURNEY.half && Math.abs(x - (GURNEY.at + d)) <= GURNEY.long / 2 + 0.2;

// =============================================================================================
// THE GURNEY: an iron trolley of the House of Quiet, its bed and sheet and straps, four legs on casters, a push-bar at its end

/** Its canvas (its anchor the floor under its middle). */
export const GURNEY_CANVAS = { w: 200, h: 150, ax: 100, ay: 92 } as const;
function gurneyBits(put: Put, pitch: number, roll: number, lift: number, jig: number, turn: number, wrecked: number): void {
  const L = (GURNEY.long * TILE3) / 2;
  const W = (GURNEY.wide * TILE3) / 2;
  const H = 21;
  // (tipped over its front end by `pitch`, onto its side by `roll`, raised `lift`: as it crashes)
  const cp = Math.cos(pitch);
  const sp = Math.sin(pitch);
  const cr = Math.cos(roll);
  const sr = Math.sin(roll);
  const pivot: V3 = [L, 0, 0];
  const at = (x: number, y: number, z: number): V3 => {
    // roll about its length, then pitch about its front axle
    const y1 = y * cr - z * sr;
    const z1 = y * sr + z * cr;
    const dx = x - pivot[0];
    const x2 = pivot[0] + dx * cp + z1 * sp;
    const z2 = -dx * sp + z1 * cp;
    return [x2, y1 + jig * 0.4, z2 + lift + jig];
  };
  // the bed: an iron frame, the sheet over it, straps across
  const c = at(0, 0, H + 1.5);
  const ax: V3 = norm(add(at(1, 0, H + 1.5), mul(c, -1)));
  const ay: V3 = norm(add(at(0, 1, H + 1.5), mul(c, -1)));
  put('gurney', 'bed', { k: 'panel', c: at(0, 0, H + 2.2), u: mul(ax, L - 2), v: mul(ay, W - 1.5), skin: (a, b, _front, tone) => {
    const strap = [-0.45, 0.05, 0.55].some((s) => Math.abs(a / (L - 2) - s) < 0.05);
    if (strap) return STRAP[Math.min(4, tone + 1)];
    if (Math.abs(b) > W - 3.5) return SHEET[Math.max(0, tone - 1)];
    // (a stain on the sheet, and its folds)
    if (hash(Math.floor(a / 3), Math.floor(b / 3), 1301) > 0.9) return SHEET[Math.max(0, tone - 1)];
    return SHEET[tone];
  } });
  for (const sd of [-1, 1]) {
    put('gurney', 'frame', { k: 'rod', a: at(-L, sd * W, H), b: at(L, sd * W, H), ra: 1.2, rb: 1.2, ramp: IRON });
    put('gurney', 'frame', { k: 'rod', a: at(-L + 4, sd * W, H + 5), b: at(L - 4, sd * W, H + 5), ra: 0.7, rb: 0.7, ramp: IRON });
    for (const xx of [-L + 4, 0, L - 4]) put('gurney', 'frame', { k: 'rod', a: at(xx, sd * W, H), b: at(xx, sd * W, H + 5), ra: 0.55, rb: 0.55, ramp: IRON });
  }
  for (const xx of [-L, L]) put('gurney', 'frame', { k: 'rod', a: at(xx, -W, H), b: at(xx, W, H), ra: 1.2, rb: 1.2, ramp: IRON });
  // the push-bar at its end
  for (const sd of [-1, 1]) put('gurney', 'frame', { k: 'rod', a: at(-L, sd * W * 0.8, H), b: at(-L - 3, sd * W * 0.8, H + 9), ra: 0.9, rb: 0.9, ramp: IRON });
  put('gurney', 'frame', { k: 'rod', a: at(-L - 3, -W * 0.8, H + 9), b: at(-L - 3, W * 0.8, H + 9), ra: 1.1, rb: 1.1, ramp: IRON });
  // its legs, braced, on casters
  for (const xx of [-L + 3, L - 3]) for (const sd of [-1, 1]) {
    if (wrecked > 0.5 && xx > 0 && sd > 0) continue;
    put('gurney', 'legs', { k: 'rod', a: at(xx, sd * (W - 1), H), b: at(xx, sd * (W - 1), 5), ra: 1.0, rb: 0.9, ramp: IRON });
    const w = at(xx, sd * (W - 1), 3);
    put('gurney', 'wheels', { k: 'ball', c: w, ax: [[0, 0, 3], [0, 1.4, 0], [3, 0, 0]], skin: (u, tone) => {
      const spoke = Math.abs(Math.sin(Math.atan2(u[2], u[0]) * 2 + turn)) < 0.25;
      return Math.hypot(u[0], u[2]) > 0.75 ? IRON[1] : spoke ? IRON[4] : IRON[Math.min(3, tone)];
    } });
  }
  for (const sd of [-1, 1]) put('gurney', 'legs', { k: 'rod', a: at(-L + 3, sd * (W - 1), 10), b: at(L - 3, sd * (W - 1), 10), ra: 0.6, rb: 0.6, ramp: IRON });
  // rust on its iron
  put('gurney', 'rust', { k: 'ball', c: at(L - 3, -(W - 1), 12), ax: sphere(1.1), skin: [RUST[0], RUST[0], RUST[1], RUST[2], RUST[2]] as unknown as Ramp });
}
/**
 * THE GURNEY, `t` seconds after it is struck (before: standing), drawn as the orderly faces in `view` (its middle on the anchor): standing
 * still; struck, careering on, rattling (shaking on its casters, its wheels spinning); `crash` seconds after it crashes (if it has):
 * pitched up over its front end and flung onto its side, a wreck. Its pink edge, as the enemy's.
 */
export function gurneyPainted(t: number, view: PaintView, crash = -1): { px: Px; lights: Light[] } {
  const C = GURNEY_CANVAS;
  const st = stage(view, C.ax, C.ay, C);
  const bits: Bit[] = [];
  const d = gurneyGone(t);
  const turn = (d * TILE3) / 3;
  const rolling = t > 0 && crash < 0;
  const jig = rolling ? 0.8 * Math.sin(t * 80) * Math.abs(Math.sin(t * 23)) + 0.6 * (hash(Math.floor(t * 30), 1, 1311) - 0.5) : 0;
  let pitch = 0;
  let roll = 0;
  let lift = 0;
  if (crash >= 0) {
    // (pitched up over its front end, flung onto its side, lying)
    const k = clamp01(crash / 0.35);
    pitch = 1.1 * Math.sin(Math.PI * Math.min(1, k * 1.2)) * (1 - k * 0.3);
    roll = 1.45 * smooth(crash / 0.4);
    lift = 10 * Math.sin(Math.PI * k);
  }
  gurneyBits((part, piece, shape) => bits.push({ part, piece, shape }), pitch, roll, lift, jig, turn, crash >= 0 ? 1 : 0);
  const lights = paintBits(st, bits, [0, 0, 10]);
  return { px: st.whole(ENEMY_RIM), lights };
}
/** The gurney's own canvas offset of its middle when standing before the orderly (tiles before him). */
export const gurneyStands = (): number => GURNEY.at;

/** The crash's canvas (its anchor where it crashes). */
export const CRASH_CANVAS = { w: 300, h: 220, ax: 150, ay: 140 } as const;
/**
 * THE CRASH, `t` seconds after it (where the gurney crashes):
 *   floor  a ring of dust and grit going out to `GURNEY.r`, its leading edge the enemy's pink; the boards scored
 *   air    the flash and sparks of iron on stone; a caster, bolts and splinters flung, tumbling; the sheet's tatters; dust; gone by 0.9 s.
 *          By halves (`side`): 'behind' before a figure there, 'before' after.
 */
export function crashPainted(t: number, layer: 'floor' | 'air', side: 'behind' | 'before' | 'all' = 'all'): { px: Px; lights: Light[] } {
  const C = CRASH_CANVAS;
  const px = new Px(C.w, C.h);
  const lights: Light[] = [];
  if (t < 0 || t > 1.2) return { px, lights };
  const dot2 = pen(px);
  const under = pen(px, true);
  const at = (x: number, y: number): [number, number] => tileAt(C.ax, C.ay, x, y);
  const onSide = (y: number): boolean => side === 'all' || (y > C.ay) === (side === 'before');
  if (layer === 'floor') {
    if (t < 0.5) {
      const k = 1 - (1 - clamp01(t / 0.22)) ** 2;
      markRing(px, C.ax, C.ay, GURNEY.r * k, 1, [PINK[0], PINK[1], PINK[2]], 0.2);
      for (let i = 0; i < 150; i++) {
        const a = hash(i, 1, 1321) * TAU;
        const d = GURNEY.r * k * (0.65 + 0.35 * Math.sqrt(hash(i, 2, 1321)));
        const [x, y] = at(Math.cos(a) * d, Math.sin(a) * d);
        if (hash(i, 3, 1321) < t / 0.5) continue;
        under(x, y, i % 3 ? DUST[3] : DUST[2]);
      }
    }
    for (let i = 0; i < 6; i++) {
      const a = hash(i, 4, 1321) * TAU;
      for (let u = 0.1; u < 0.9; u += 0.02) {
        const [x, y] = at(Math.cos(a) * u, Math.sin(a) * u);
        if (hash(Math.round(x), Math.round(y), 1323) < t / 1.2) continue;
        dot2(x, y, '#1a1410');
      }
    }
    return { px, lights };
  }
  if (t > 0.9) return { px, lights };
  if (t < 0.08 && side !== 'behind') {
    blob(dot2, C.ax, C.ay - 14, 5 + 6 * (1 - t / 0.08), '#fff6e8');
    for (let i = 0; i < 16; i++) {
      const a = -Math.PI * hash(i, 1, 1325);
      const L = 10 + 22 * hash(i, 2, 1325);
      for (let s = 3; s < L; s++) dot2(C.ax + Math.cos(a) * s, C.ay - 14 + Math.sin(a) * s * 0.8, s < L * 0.4 ? '#fff6e8' : i % 3 ? '#ffc070' : PINK[1]);
    }
    lights.push({ x: C.ax, y: C.ay - 14, r: 70, color: '#ffc070', a: 0.45 });
  }
  // a caster, bolts and splinters flung and tumbling; tatters of the sheet
  for (let i = 0; i < 40; i++) {
    const a = hash(i, 1, 1327) * TAU;
    const sp = 1.2 + 1.6 * hash(i, 2, 1327);
    const d = Math.min(GURNEY.r * 1.2, sp * t);
    const [x, y] = at(Math.cos(a) * d, Math.sin(a) * d);
    if (!onSide(y)) continue;
    const up = (90 + 70 * hash(i, 3, 1327)) * t - 240 * t * t;
    if (up < 0) continue;
    const c = i === 0 ? IRON[3] : i % 5 === 0 ? SHEET[3] : i % 4 === 0 ? PINK[1] : i % 2 ? IRON[2] : '#7a6448';
    const sz = i === 0 ? 3 : i % 5 === 0 ? 3 : i % 3 === 0 ? 2 : 1;
    for (let q = 0; q < sz * sz; q++) dot2(x + (q % sz), y - up + Math.floor(q / sz), q === 0 && sz > 1 ? IRON[4] : c);
  }
  for (let i = 0; i < 30; i++) {
    const a = hash(i, 1, 1329) * TAU;
    const d = GURNEY.r * 0.8 * Math.sqrt(hash(i, 2, 1329)) * clamp01(t / 0.3);
    const [x, y] = at(Math.cos(a) * d, Math.sin(a) * d);
    if (!onSide(y)) continue;
    const u = t / 0.9;
    if (hash(i, 3, 1329) < u) continue;
    blob(under, x, y - 4 - 16 * u * hash(i, 4, 1329), 2 + 3 * u, i % 2 ? DUST[1] : DUST[2], 0.45, 1331);
  }
  return { px, lights };
}
void lerp3;
