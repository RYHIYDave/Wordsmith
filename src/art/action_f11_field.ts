// FLOOR 13'S SMALL MOB, MORE ACTION: THE HUSHED REAPER AND GLEANER (the art chat's helper, 1 Nov 2026; docs/mockups/action_f11/README.md).
// A MOCK-UP: NOTHING OF THE GAME IMPORTS THIS FILE. Their HARVEST (FIELD_HARVEST, off), in place of the sickle slash, on the game's own
// figures (art/fieldhands.ts, art/fieldhands_moves.ts), all they keep frame for frame their own.
//
// His review of every enemy for more action, 31 Oct 2026, offered and answered “Yes (Recommended)”:
//   THE HUSHED REAPER AND GLEANER (floor 13, small): “Harvest: three sweeping sickle cuts, stepping in with each. The last is a leap
//   that hooks the sickle into the ground in a burst of chaff.”
// Under his Movement 9 (24 Oct: “Like the wind up and wind down are big but the actual punch is lightning quick”; 28 Oct: “And bigger
// AOE to compensate for the extra time the player gets to evade”). Small: one attack (his rule of 9 Oct).
//
// THE HARVEST: the sickle raised over the right shoulder, HELD, glinting pink; in TWO FRAMES a sweeping cut down and across from right to
// left, a step in, smeared; carried through low; whipped up over the left shoulder, a beat; in TWO FRAMES the backhand, left to right, a
// step in past the other foot; carried through; then crouched, the sickle up high over the head, HELD; in TWO FRAMES a LEAP and the
// sickle hooked down into the ground before them in a burst of chaff; wrenched out; straightened, on where they landed.

import { Px } from '../engine/px';
import type { Light } from '../engine/px';
import type { ActorArt } from './actor_types';
import { footwork, plantBy, plantOf } from './bosses3';
import { hash } from './kit';
import { FH_BODY, FH_CANVAS, FH_REST, SICKLE, fieldPainter, sickleOf } from './fieldhands';
import type { FieldhandWho } from './fieldhands';
import { FH_DIES, FIELD_GLEANER, FIELD_REAPER } from './fieldhands_moves';
import { ENEMY_RIM } from './mkit';
import type { Ramp } from './kit';
import { TILE3, mobSet, paintBits, skeletonAt } from './new_mobs3';
import type { Bit, Mob, MobMove, Moment, Put } from './new_mobs3';
import { stage } from './skin';
import type { Stage } from './skin';
import { add, aimFor, elbowFor, heading, mul, norm } from './skeleton';
import type { Bones, Key3, Posed, Skeleton, V3 } from './skeleton';
import { FR, TAU, blob, clamp01, f, markRing, pen, smearAlong, smooth, tileAt } from './action_f6_fx';

/** THE SWITCH, OFF. With it on, the bestiary's fieldhands are made by `makeHarvestArt`. */
export const FIELD_HARVEST = { on: false };

type P = Partial<Bones>;
const B = FH_BODY;
const R = FH_REST;
const L0 = plantOf(B, 'L', {}, R);
const R0 = plantOf(B, 'R', {}, R);
const PINK = ['#e0287a', '#ff7aa8', '#7a1058'] as const;
/** The chaff: straw, husks and dust of the corn gone over (the millrace's own gold, art/millrace.ts MR_GOLD). */
export const CHAFF = ['#3a321f', '#6f5d31', '#a48b47', '#bea456', '#d6be73', '#ece0b0'] as const;

function elbowsTo(pose: P, wantL: V3 | null, wantR: V3 | null): P {
  const q = { ...R, ...pose } as Posed;
  const le = wantL ? elbowFor(B, q, true, norm(wantL)) : q.le;
  const re = wantR ? elbowFor(B, { ...q, le } as Posed, false, norm(wantR)) : q.re;
  return { ...pose, le, re };
}

/**
 * THE HARVEST'S NUMBERS (seconds from its start; tiles):
 *   wind-up   the sickle up over the right shoulder by 0.28 s; HELD, glinting pink, shaking, to 0.6 s (0.32 s)
 *   CUT ONE   TWO FRAMES, smeared, the left foot stepping in: down and across, right to left (frame 20, 0.667 s); carried through low
 *   a beat    whipped up over the left shoulder by 0.9 s, held a beat to 1.0 s
 *   CUT TWO   TWO FRAMES, smeared, the right foot stepping in past the left: the backhand, left to right (frame 32, 1.067 s); carried through
 *   crouched  the sickle up high over the head, crouched, by 1.4 s; HELD to 1.533 s
 *   THE LEAP  TWO FRAMES, smeared: up and on (frame 47), down, the sickle HOOKED INTO THE GROUND (frame 48, 1.6 s: the clip's `hit`), a
 *             burst of chaff
 *   wind-down  wrenched at to 1.85 s; wrenched out by 2.05 s; straightened by 2.6 s, on where they landed: `travel` tiles on from where
 *             they began (the game moves them on by it as it ends)
 *   struck    by each cut, a hero in the strip before them then (`cut.fwd`, `cut.half` to either side); by the hook, a hero within `r`
 *             of where it goes in (the burst of chaff)
 *   near, far  begun at a hero from 0 to 2.6 tiles off
 */
export const HARVEST_HITS = [f(20), f(35), f(55)] as const;
export const HARVEST_STRIKES = [[f(18), f(20)], [f(33), f(35)], [f(53), f(55)]] as const;
export const HARVEST_HIT = HARVEST_HITS[2];
export const HARVEST_SMEARED = (t: number): boolean => HARVEST_STRIKES.some(([a, b]) => t > a + 1e-6 && t <= b + FR + 1e-6);
export const HARVEST = { up: 0.28, held: 0.6, beat: [1.0, f(33)] as const, crouch: 1.62, long: 2.95, travel: 30 / TILE3, cut: { fwd: [0, 1.9] as const, half: 1.0 }, r: 1.5, near: 0, far: 2.6 } as const;
const HARVEST_NAME = 'The harvest';
/** The left hand out for balance. */
const BAL = (x: number, y: number, z: number): P => ({ lhIn: 1, lhx: x, lhy: y, lhz: z });
const RAISED: P = elbowsTo({ px: -1.6, pz: R.pz + 0.6, yaw: -8, twist: -16, pitch: -2, bend: -4, side: 2, roll: 0, faceUp: 14, faceTilt: -2, faceTurn: 8, ...BAL(6, 6, -12), rhIn: 1, rhx: -3, rhy: -8, rhz: 14, wAz: -118, wEl: 38, wRoll: 90, lk: 10, rk: -10 }, [0.4, 0.8, -0.4], [-0.3, -0.8, 0.5]);
const shake = (k: number): P => ({ ...RAISED, rhz: (RAISED.rhz as number) + (k % 2 ? 0.8 : -0.3), px: (RAISED.px as number) - 0.3 * (k % 2), faceUp: 14 + (k % 2) });
export const CUT1_MID: P = elbowsTo({ px: 3.4, pz: R.pz - 0.9, yaw: 6, twist: -2, pitch: 10, bend: 6, side: 0, roll: 0, faceUp: 10, faceTilt: 0, faceTurn: 0, ...BAL(4, 8, -13), rhIn: 1, rhx: 15, rhy: -9, rhz: 5, wAz: -25, wEl: 12, wRoll: 90, lk: 14, rk: -8 }, [0.2, 0.9, -0.4], [0, -0.9, 0.3]);
const CUT1: P = elbowsTo({ px: 6, pz: R.pz - 1.8, yaw: 10, twist: 12, pitch: 18, bend: 14, side: -2, roll: 0, faceUp: 8, faceTilt: 0, faceTurn: -6, ...BAL(3, 9, -14), rhIn: 1, rhx: 10, rhy: 9, rhz: -6, wAz: 90, wEl: -12, wRoll: 90, lk: 20, rk: -8 }, [0, 0.9, -0.4], [0.2, -0.9, -0.3]);
const THROUGH1: P = elbowsTo({ px: 6.6, pz: R.pz - 2.2, yaw: 14, twist: 20, pitch: 22, bend: 18, side: -3, roll: 0, faceUp: 6, faceTilt: 0, faceTurn: -10, ...BAL(1, 9, -16), rhIn: 1, rhx: 12, rhy: 10, rhz: -11, wAz: 100, wEl: -20, wRoll: 90, lk: 20, rk: -8 }, [0, 0.9, -0.4], [0.3, -0.6, -0.6]);
/** Whipped up over the left shoulder for the backhand: the body wound to the left, the right hand across before the chest. */
const BACKUP: P = elbowsTo({ px: 8, pz: R.pz - 0.6, yaw: 12, twist: 18, pitch: 6, bend: 2, side: -2, roll: 0, faceUp: 10, faceTilt: 0, faceTurn: -10, ...BAL(-3, 10, -12), rhIn: 1, rhx: 11, rhy: 17, rhz: 0, wAz: 120, wEl: 30, wRoll: -90, lk: 14, rk: -10 }, [-0.3, 0.9, -0.3], [0.5, 0.2, 0.3]);
const backBeat = (k: number): P => ({ ...BACKUP, rhz: (BACKUP.rhz as number) + 0.4 * k });
const CUT2_MID: P = elbowsTo({ px: 12, pz: R.pz - 1.2, yaw: 0, twist: 0, pitch: 12, bend: 8, side: 0, roll: 0, faceUp: 8, faceTilt: 0, faceTurn: 0, ...BAL(-1, 10, -13), rhIn: 1, rhx: 16, rhy: 6, rhz: -3, wAz: 15, wEl: 4, wRoll: -90, lk: 16, rk: -10 }, [-0.2, 0.9, -0.3], [0.5, 0.3, -0.2]);
const CUT2: P = elbowsTo({ px: 16, pz: R.pz - 2.0, yaw: -8, twist: -14, pitch: 18, bend: 14, side: 2, roll: 0, faceUp: 8, faceTilt: 0, faceTurn: 6, ...BAL(2, 10, -14), rhIn: 1, rhx: 15, rhy: -6, rhz: -6, wAz: -55, wEl: -12, wRoll: -90, lk: 16, rk: -14 }, [0, 0.9, -0.4], [0.3, -0.8, -0.3]);
const THROUGH2: P = elbowsTo({ px: 17, pz: R.pz - 2.4, yaw: -12, twist: -20, pitch: 22, bend: 18, side: 3, roll: 0, faceUp: 6, faceTilt: 0, faceTurn: 10, ...BAL(3, 10, -15), rhIn: 1, rhx: 13, rhy: -10, rhz: -10, wAz: -75, wEl: -20, wRoll: -90, lk: 16, rk: -14 }, [0, 0.9, -0.4], [0.2, -0.9, -0.3]);
/** Crouched to leap, the sickle up high over the head, pointing back. */
const CROUCH: P = elbowsTo({ px: 15, pz: R.pz - 5, yaw: -2, twist: -6, pitch: 6, bend: -6, side: 0, roll: 0, faceUp: 18, faceTilt: 0, faceTurn: 2, ...BAL(8, 7, -9), rhIn: 1, rhx: -2, rhy: -3, rhz: 20, wAz: 180, wEl: 45, wRoll: 90, lk: 28, rk: -28 }, [0.4, 0.8, -0.3], [-0.2, -0.7, 0.6]);
const crouchShake = (k: number): P => ({ ...CROUCH, rhz: (CROUCH.rhz as number) + (k % 2 ? 0.6 : -0.2), pz: (CROUCH.pz as number) - 0.2 * (k % 2) });
const LEAP_MID: P = elbowsTo({ px: 23, pz: R.pz + 5, yaw: 0, twist: -2, pitch: 16, bend: 6, side: 0, roll: 0, faceUp: 8, faceTilt: 0, faceTurn: 0, ...BAL(6, 10, -6), rhIn: 1, rhx: 8, rhy: -3, rhz: 18, ...aimFor(heading(0, 75), [0.97, 0, -0.26]), lk: 30, rk: -30 }, [0.3, 0.9, 0], [0.2, -0.6, 0.6]);
/** HOOKED IN: landed in a deep lunge, the sickle's blade down in the ground before them. */
const HOOK_AT: V3 = [47, -4, 10.6];
const HOOK: P = elbowsTo({ px: 29, pz: R.pz - 11, yaw: 2, twist: 2, pitch: 32, bend: 18, side: 0, roll: 0, faceUp: -2, faceTilt: 0, faceTurn: -2, ...BAL(-2, 10, -12), rhIn: 2, rhx: HOOK_AT[0], rhy: HOOK_AT[1], rhz: HOOK_AT[2], ...aimFor(heading(0, -15), [0, 0, -1]), lk: 30, rk: -18 }, [0, 0.9, -0.3], [0.2, -0.6, -0.6]);
const hookTug = (dx: number, dz: number): P => ({ ...HOOK, px: 29 + dx * 0.6, pz: (HOOK.pz as number) + dz * 0.5, rhx: HOOK_AT[0] + dx * 0.3, rhz: HOOK_AT[2] + dz * 0.3, pitch: 32 - dx * 1.2 });
const YANK: P = elbowsTo({ px: 28, pz: R.pz - 5, yaw: 0, twist: -2, pitch: 18, bend: 10, side: 0, roll: 0, faceUp: 4, faceTilt: 0, faceTurn: 0, ...BAL(2, 8, -15), rhIn: 2, rhx: 43, rhy: -7, rhz: 22, ...aimFor(heading(0, 30), [0.5, 0, -0.87]), lk: 18, rk: -14 }, [0, 0.9, -0.4], [0.1, -0.8, -0.5]);
/** How far on they go, in their own lengths. */
export const TRAVEL = HARVEST.travel * TILE3;
function harvestKeys(): Key3[] {
  const [h1, h2, h3] = HARVEST_HITS;
  return [
    { at: 0, pose: {} },
    { at: HARVEST.up, pose: RAISED, ease: 'io' },
    { at: 0.36, pose: shake(1), ease: 'io' },
    { at: 0.44, pose: shake(2), ease: 'io' },
    { at: 0.52, pose: shake(3), ease: 'io' },
    { at: HARVEST_STRIKES[0][0], pose: RAISED, ease: 'io' },
    { at: f(19), pose: CUT1_MID, ease: 'lin' },
    { at: h1, pose: CUT1, ease: 'lin' },
    { at: h1 + 0.12, pose: THROUGH1, ease: 'out' },
    { at: HARVEST.beat[0], pose: BACKUP, ease: 'io' },
    { at: 1.05, pose: backBeat(1), ease: 'io' },
    { at: HARVEST_STRIKES[1][0], pose: backBeat(0), ease: 'io' },
    { at: f(34), pose: CUT2_MID, ease: 'lin' },
    { at: h2, pose: CUT2, ease: 'lin' },
    { at: h2 + 0.12, pose: THROUGH2, ease: 'out' },
    { at: HARVEST.crouch, pose: CROUCH, ease: 'io' },
    { at: 1.69, pose: crouchShake(1), ease: 'io' },
    { at: HARVEST_STRIKES[2][0], pose: CROUCH, ease: 'io' },
    { at: f(54), pose: LEAP_MID, ease: 'lin' },
    { at: h3, pose: HOOK, ease: 'lin' },
    { at: h3 + 0.12, pose: hookTug(-0.6, 0.5), ease: 'out' },
    { at: h3 + 0.27, pose: hookTug(-0.2, 0.2), ease: 'io' },
    { at: h3 + 0.55, pose: YANK, ease: 'io' },
    { at: HARVEST.long, pose: { px: TRAVEL }, ease: 'io' },
  ];
}
function harvestFeet(): (t: number) => P {
  const [s1, s2, s3] = HARVEST_STRIKES;
  return footwork(B, {
    L: { start: L0, moves: [{ t0: s1[0], t1: s1[1], to: plantBy(L0, 9, 0.5, 6), lift: 2.4 }, { t0: s3[0], t1: s3[1], to: plantBy(L0, 34, 0.5, 6), lift: 6 }, { t0: 2.58, t1: 2.82, to: plantBy(L0, TRAVEL, 0), lift: 2 }] },
    R: { start: R0, moves: [{ t0: s2[0], t1: s2[1], to: plantBy(R0, 19, 0, -4), lift: 2.6 }, { t0: s3[0], t1: s3[1], to: plantBy(R0, 23, -0.5, -10), lift: 5 }, { t0: 2.36, t1: 2.6, to: plantBy(R0, TRAVEL, 0), lift: 2.4 }] },
  });
}
/** The glint on its blade: up as it is raised, held through all three, gone after the hook. */
const harvestGlint = (t: number): number => (t < 0.08 || t > HARVEST_HIT + 0.25 ? 0 : t < HARVEST.up ? (t - 0.08) / (HARVEST.up - 0.08) : t <= HARVEST_HIT ? 1 : 1 - (t - HARVEST_HIT) / 0.25);
const harvestJaw = (t: number): number => (t < 0.15 ? 0.45 + 2 * t : t < HARVEST_HIT + 0.3 ? 1 : 1 - 0.5 * Math.min(1, (t - HARVEST_HIT - 0.3) / 0.5));

function moreBits(mob: Mob, st: Stage, m: Moment): Bit[] {
  const bits: Bit[] = [];
  const put: Put = (part, piece, shape) => {
    bits.push({ part, piece, shape });
  };
  const t = m.t;
  if (m.move !== HARVEST_NAME || !HARVEST_SMEARED(t)) return bits;
  const k = HARVEST_STRIKES.findIndex(([a, b]) => t > a + 1e-6 && t <= b + FR + 1e-6);
  const hit = HARVEST_HITS[k];
  const thin = Math.abs(t - hit - FR) < 1e-6;
  const lines: V3[][] = [[], [], [], []];
  for (let i = 0; i <= 8; i++) {
    const u = Math.min(t, hit) - (FR * 1.3 * i) / 8;
    const sk = sickleOf(skeletonAt(mob, 'attack', u));
    lines[0].push(sk.tip);
    lines[1].push(sk.blade[6]);
    lines[2].push(sk.mid);
    lines[3].push(sk.blade[2]);
  }
  smearAlong(st, put, lines, thin, ['#3a3e48', '#6e7480', '#b8bcc6', '#eef0f4'], PINK[1]);
  return bits;
}

const FH_CANVAS2 = { w: 330, h: 250, ax: 120, ay: 178 } as const;
function harvester(base: Mob): Mob {
  const mob: Mob = {
    ...base,
    id: `${base.id}-harvest`,
    attack: { name: HARVEST_NAME, motion: { keys: harvestKeys(), hit: HARVEST_HIT }, rest: R, feet: harvestFeet(), glint: harvestGlint, jaw: harvestJaw } as MobMove,
    hit: HARVEST_HIT,
    warn: HARVEST.held - HARVEST.up,
    canvas: FH_CANVAS2,
    aura: { ...base.aura, x: base.aura.x - FH_CANVAS.ax + FH_CANVAS2.ax, y: base.aura.y - FH_CANVAS.ay + FH_CANVAS2.ay },
    bits: (st, m) => [...base.bits(st, m), ...moreBits(mob, st, m)],
  };
  return mob;
}
/** THE REAPER AND THE GLEANER WITH THE HARVEST (FIELD_HARVEST): the game's own in all but it. */
export const HARVEST_REAPER = harvester(FIELD_REAPER);
export const HARVEST_GLEANER = harvester(FIELD_GLEANER);
/** As the game holds a monster: the game's own reaper or gleaner, the SICKLE BOOMERANG as its `attack` (2 Nov; the harvest before it kept as `HARVEST_REAPER` for the picture beside the new). */
export function makeHarvestArt(mob: Mob = BOOM_REAPER, pace = mob.pace): ActorArt {
  return { front: mobSet(mob, 'front', pace), back: mobSet(mob, 'back', pace) };
}

// =============================================================================================
// WHERE IT GOES IN, AND THE CHAFF

/** Where the sickle's tip goes into the ground (tiles before where they began, to their left). */
export function hookAt(): [number, number] {
  const k = sickleOf(skeletonAt(HARVEST_REAPER, 'attack', HARVEST_HIT));
  return [k.tip[0] / TILE3, k.tip[1] / TILE3];
}
/** The pelvis's place `t` seconds in (tiles on from where they began): for where each cut strikes from. */
export function harvestOn(t: number): number {
  return skeletonAt(HARVEST_REAPER, 'attack', t).pelvis[0] / TILE3;
}
/** Whether a hero `x` tiles before where they began and `y` to their left is struck by blow `k` (0, 1: the cuts; 2: the hook). */
export function harvestStrikes(k: 0 | 1 | 2, x: number, y: number): boolean {
  if (k === 2) {
    const [hx, hy] = hookAt();
    return Math.hypot(x - hx, y - hy) <= HARVEST.r;
  }
  const on = harvestOn(HARVEST_HITS[k]);
  return x - on >= HARVEST.cut.fwd[0] && x - on <= HARVEST.cut.fwd[1] && Math.abs(y) <= HARVEST.cut.half;
}

/** The chaff's canvas (its anchor where the sickle goes in). */
export const CHAFF_CANVAS = { w: 300, h: 240, ax: 150, ay: 150 } as const;
/**
 * THE BURST OF CHAFF, `t` seconds after the sickle hooks in:
 *   floor  the ground torn where it went in; a ring of chaff and dust rolling out to `HARVEST.r`, its leading edge the enemy's pink; the
 *          chaff lying strewn, fading by 1.8 s
 *   air    straw, husks and grain flung up and out in a fountain, tumbling, drifting down; a cloud of the corn's dust; gone by 1.4 s.
 *          By halves (`side`): 'behind' before a figure there, 'before' after.
 */
export function chaffPainted(t: number, layer: 'floor' | 'air', side: 'behind' | 'before' | 'all' = 'all'): { px: Px; lights: Light[] } {
  const C = CHAFF_CANVAS;
  const px = new Px(C.w, C.h);
  const lights: Light[] = [];
  if (t < 0 || t > 1.8) return { px, lights };
  const dot2 = pen(px);
  const under = pen(px, true);
  const at = (x: number, y: number): [number, number] => tileAt(C.ax, C.ay, x, y);
  const onSide = (y: number): boolean => side === 'all' || (y > C.ay) === (side === 'before');
  if (layer === 'floor') {
    const fade = 1 - smooth((t - 1.2) / 0.6);
    // (the ground torn where it went in)
    for (let i = 0; i < 40; i++) {
      const a = hash(i, 1, 1201) * TAU;
      const d = 0.3 * Math.sqrt(hash(i, 2, 1201));
      const [x, y] = at(Math.cos(a) * d, Math.sin(a) * d);
      if (hash(i, 3, 1201) > fade) continue;
      dot2(x, y, i % 3 ? '#2a2018' : '#3a2c22');
    }
    // the ring rolling out, its leading edge pink
    if (t < 0.5) {
      const k = 1 - (1 - clamp01(t / 0.22)) ** 2;
      markRing(px, C.ax, C.ay, HARVEST.r * k, 1, [PINK[0], PINK[1], PINK[2]], 0.4);
      for (let i = 0; i < 140; i++) {
        const a = hash(i, 4, 1201) * TAU;
        const d = HARVEST.r * k * (0.7 + 0.3 * Math.sqrt(hash(i, 5, 1201)));
        const [x, y] = at(Math.cos(a) * d, Math.sin(a) * d);
        if (hash(i, 6, 1201) < t / 0.5) continue;
        under(x, y, i % 3 ? CHAFF[3] : CHAFF[2]);
      }
    }
    // the chaff lying strewn over the ground
    for (let i = 0; i < 160; i++) {
      const land = 0.25 + 0.6 * hash(i, 7, 1201);
      if (t < land || hash(i, 8, 1201) > fade) continue;
      const a = hash(i, 9, 1201) * TAU;
      const d = HARVEST.r * Math.sqrt(hash(i, 10, 1201)) * 1.05;
      const [x, y] = at(Math.cos(a) * d, Math.sin(a) * d);
      const L = 1 + Math.round(2 * hash(i, 11, 1201));
      for (let q = 0; q < L; q++) under(x + q, y + (i % 2 ? 0 : q * 0.5), CHAFF[2 + (i % 3)]);
    }
    return { px, lights };
  }
  if (t > 1.4) return { px, lights };
  // the flash of the blade going in
  if (t < 0.06 && side !== 'behind') {
    blob(dot2, C.ax, C.ay - 2, 3 + 3 * (1 - t / 0.06), '#fff6e8');
    lights.push({ x: C.ax, y: C.ay - 4, r: 40, color: CHAFF[5], a: 0.3 });
  }
  // straw, husks and grain flung up in a fountain, tumbling and drifting down
  for (let i = 0; i < 150; i++) {
    const a = hash(i, 1, 1203) * TAU;
    const sp = 0.6 + 1.6 * hash(i, 2, 1203);
    const t0 = 0.04 * hash(i, 3, 1203);
    const s = t - t0;
    if (s < 0) continue;
    const drag = 1 - Math.exp(-3.2 * s);
    const d = Math.min(HARVEST.r * 1.1, (sp * drag) / 1.6);
    const [x, y] = at(Math.cos(a) * d, Math.sin(a) * d);
    if (!onSide(y)) continue;
    const up = (70 + 70 * hash(i, 4, 1203)) * drag * 0.55 - 34 * s * s * (0.5 + hash(i, 5, 1203));
    if (up < 0 || hash(i, 6, 1203) < (t - 0.9) / 0.5) continue;
    const spin = s * (8 + 8 * hash(i, 7, 1203)) + i;
    const L = i % 3 === 0 ? 3 : i % 3 === 1 ? 2 : 1;
    for (let q = 0; q < L; q++) dot2(x + Math.cos(spin) * q + Math.sin(s * 3 + i) * 3 * s, y - up + Math.sin(spin) * q, i % 11 === 0 ? PINK[1] : CHAFF[2 + ((i + q) % 4)]);
  }
  // the corn's dust, rolling up and drifting
  for (let i = 0; i < 40; i++) {
    const a = hash(i, 1, 1205) * TAU;
    const d = HARVEST.r * 0.7 * Math.sqrt(hash(i, 2, 1205)) * clamp01(t / 0.3);
    const [x, y] = at(Math.cos(a) * d, Math.sin(a) * d);
    if (!onSide(y)) continue;
    const u = t / 1.4;
    if (hash(i, 3, 1205) < u) continue;
    blob(under, x, y - 4 - 20 * u * hash(i, 4, 1205), 2 + 3 * u, i % 2 ? CHAFF[1] : CHAFF[2], 0.45, 1207);
  }
  return { px, lights };
}

// =============================================================================================
// THE SICKLE BOOMERANG (2 Nov 2026): IN PLACE OF THE HARVEST
//
// The owner, 2 Nov 2026, 07:32: “Okay now I need you to look at how many enemies do a small hit, small hit, slam combo.  I feel like you
// over corrected to that a little too much.” Asked which keep it: “Chained One and troll (Recommended)”. So the harvest (cut, cut, a
// leaping hook) goes; asked what in its place, his pick: “Sickle boomerang (Recommended)”, offered as: the sickle thrown spinning out in a
// wide curve and back to the hand. Dodge it going out and coming back. By his Movement 9 and Monsters 9. Their one attack.
//
// THE SICKLE BOOMERANG: the sickle DRAWN BACK far behind them at the shoulder, the body wound right round, the left hand pointed at you,
// the way it will fly MARKED ON THE GROUND (a loop out to the left, round, and back on the right): HELD, shaking, glinting pink; in TWO
// FRAMES FLUNG, the arm whipped round and across, smeared; the sickle SPINNING OUT along the marked curve, crisp, glinting pink, a blur of
// its blade round it, about six tiles out; round; and BACK; caught, the reaper staggering a step back with the catch; straightened.

/**
 * THE SICKLE BOOMERANG'S NUMBERS (seconds from its start; tiles from where they stand, before them and to their left):
 *   drawn back   by 0.32 s; the curve marked from 0.12 s
 *   HELD         shaking, glinting pink, to 0.7 s (0.38 s)
 *   THE THROW    TWO FRAMES, smeared (frames 21 to 23): flung; it leaves the hand at frame 23 (0.767 s: the clip's `hit`)
 *   its flight   `fly` seconds out along the curve and back: out to `out` tiles before them, `wide` to either side; spinning `spin`
 *                turns a second
 *   the catch    at `hit` + `fly`; staggered a step back with it; straightened by `long`
 *   struck       a hero within `r` of it (its place on the floor) as it goes out, and again as it comes back (`boomStrikes`)
 *   near, far    thrown at a hero from 2 to 6 tiles off
 */
export const BOOM_HIT = f(23);
export const BOOM_STRIKE = [f(21), f(23)] as const;
export const BOOM_SMEARED = (t: number): boolean => t > BOOM_STRIKE[0] + 1e-6 && t <= BOOM_STRIKE[1] + FR + 1e-6;
export const BOOM = { drawn: 0.32, mark: 0.12, fly: 1.5, out: 6.0, wide: 1.9, dip: 10, spin: 5, r: 0.75, stagger: 0.42, long: 3.0, near: 2, far: 6 } as const;
/** When it is caught. */
export const BOOM_CATCH = BOOM_HIT + BOOM.fly;
const BOOM_NAME = 'The sickle boomerang';
/** Drawn far back behind them at the shoulder, the body wound right round, the left hand pointed at you. */
const B_DRAWN: P = elbowsTo({ px: -2.4, pz: R.pz - 0.6, yaw: -26, twist: -24, pitch: 2, bend: -2, side: 3, roll: 0, faceUp: 10, faceTilt: 0, faceTurn: 22, ...BAL(13, 4, -2), rhIn: 1, rhx: -9, rhy: -11, rhz: 1, wAz: -170, wEl: 6, wRoll: 90, lk: 4, rk: -22 }, [0.2, 0.9, -0.4], [-0.4, -0.7, -0.3]);
const bShake = (k: number): P => ({ ...B_DRAWN, rhz: (B_DRAWN.rhz as number) + (k % 2 ? 0.6 : -0.2), rhx: (B_DRAWN.rhx as number) - 0.3 * (k % 2), px: (B_DRAWN.px as number) - 0.2 * (k % 2) });
/** Half way through the throw: the arm whipping round, the body unwinding. */
const B_WHIP: P = elbowsTo({ px: 1.2, pz: R.pz - 1.2, yaw: -4, twist: -4, pitch: 8, bend: 3, side: 1, roll: 0, faceUp: 10, faceTilt: 0, faceTurn: 6, ...BAL(8, 9, -10), rhIn: 1, rhx: 8, rhy: -12, rhz: 0, wAz: -80, wEl: 4, wRoll: 90, lk: 10, rk: -14 }, [0, 0.9, -0.4], [0.1, -0.9, -0.2]);
/** FLUNG: the arm out before them across to the left, the body turned through, the sickle away. */
const B_FLUNG: P = elbowsTo({ px: 4.2, pz: R.pz - 1.8, yaw: 20, twist: 18, pitch: 14, bend: 8, side: -2, roll: 0, faceUp: 8, faceTilt: 0, faceTurn: -12, ...BAL(-2, 10, -14), rhIn: 1, rhx: 14, rhy: 6, rhz: -3, wAz: 30, wEl: 0, wRoll: 90, lk: 18, rk: -6 }, [0, 0.9, -0.4], [0.2, -0.6, -0.5]);
/** Carried on across and down. */
const B_THROUGH: P = elbowsTo({ px: 5.2, pz: R.pz - 2.4, yaw: 30, twist: 26, pitch: 18, bend: 11, side: -3, roll: 0, faceUp: 6, faceTilt: 0, faceTurn: -20, ...BAL(-4, 10, -16), rhIn: 1, rhx: 9, rhy: 13, rhz: -11, wAz: 80, wEl: -20, wRoll: 90, lk: 22, rk: -6 }, [0, 0.9, -0.4], [0.3, -0.4, -0.7]);
/** Watching it go round, upright again, the right hand loose before them. */
const B_WATCH: P = elbowsTo({ px: 2.2, pz: R.pz - 0.6, yaw: 6, twist: 4, pitch: 4, bend: 1, side: 0, roll: 0, faceUp: 14, faceTilt: 0, faceTurn: 4, ...BAL(4, 8, -15), rhIn: 1, rhx: 6, rhy: -6, rhz: -12, wAz: 0, wEl: -30, wRoll: 90, lk: 12, rk: -12 }, [0, 0.9, -0.4], [0.1, -0.8, -0.5]);
/** Reaching for it: the right hand up and out to their right, open. */
const B_REACH: P = elbowsTo({ px: 1.6, pz: R.pz - 0.8, yaw: -10, twist: -10, pitch: 2, bend: 0, side: 1, roll: 0, faceUp: 14, faceTilt: 0, faceTurn: 14, ...BAL(5, 8, -14), rhIn: 1, rhx: 9, rhy: -10, rhz: -2, wAz: -40, wEl: 10, wRoll: 90, lk: 10, rk: -14 }, [0, 0.9, -0.4], [0, -0.9, -0.3]);
/** CAUGHT, knocked back with it: the arm flung back, the body rocked back on its heels, a step back. */
const B_CAUGHT: P = elbowsTo({ px: -3.4, pz: R.pz - 1.6, yaw: -22, twist: -20, pitch: -8, bend: -6, side: 2, roll: 0, faceUp: 6, faceTilt: 0, faceTurn: 10, ...BAL(9, 7, -6), rhIn: 1, rhx: -4, rhy: -12, rhz: -1, wAz: -150, wEl: 12, wRoll: 90, lk: 8, rk: -18 }, [0.2, 0.9, -0.3], [-0.3, -0.8, -0.4]);
const B_STEADY: P = elbowsTo({ px: -4.6, pz: R.pz - 1.0, yaw: -10, twist: -8, pitch: 2, bend: 1, side: 1, roll: 0, faceUp: 8, faceTilt: 0, faceTurn: 6, ...BAL(5, 8, -14), rhIn: 1, rhx: 2, rhy: -8, rhz: -12, wAz: -60, wEl: -20, wRoll: 90, lk: 10, rk: -14 }, [0.1, 0.9, -0.4], [0, -0.8, -0.5]);
function boomKeys(): Key3[] {
  const [s0] = BOOM_STRIKE;
  const c = BOOM_CATCH;
  return [
    { at: 0, pose: {} },
    { at: BOOM.drawn, pose: B_DRAWN, ease: 'io' },
    { at: 0.4, pose: bShake(1), ease: 'io' },
    { at: 0.48, pose: bShake(2), ease: 'io' },
    { at: 0.56, pose: bShake(3), ease: 'io' },
    { at: s0 - 0.034, pose: B_DRAWN, ease: 'io' },
    { at: s0, pose: { ...B_DRAWN, yaw: -23, twist: -22 }, ease: 'in' },
    { at: f(22), pose: B_WHIP, ease: 'lin' },
    { at: BOOM_HIT, pose: B_FLUNG, ease: 'lin' },
    { at: BOOM_HIT + 0.15, pose: B_THROUGH, ease: 'out' },
    { at: 1.25, pose: B_WATCH, ease: 'io' },
    { at: 1.7, pose: { ...B_WATCH, yaw: -2, faceTurn: 10, px: 2.0 }, ease: 'io' },
    { at: c - 0.2, pose: B_REACH, ease: 'io' },
    { at: c, pose: { ...B_REACH, px: 1.2, rhx: 8.6 }, ease: 'lin' },
    { at: c + 0.14, pose: B_CAUGHT, ease: 'out' },
    { at: c + BOOM.stagger, pose: B_STEADY, ease: 'io' },
    { at: BOOM.long, pose: { px: -5 }, ease: 'io' },
  ];
}
/** Back where they stand at the end (their own lengths): the stagger's step. */
export const BOOM_BACK = -5;
function boomFeet(): (t: number) => P {
  const [s0, s1] = BOOM_STRIKE;
  const c = BOOM_CATCH;
  return footwork(B, {
    L: { start: L0, moves: [{ t0: 0.05, t1: 0.28, to: plantBy(L0, 5, 0.5, 6), lift: 2.2 }, { t0: c + 0.1, t1: c + 0.34, to: plantBy(L0, -2, 0.5, 2), lift: 2.0 }, { t0: 2.62, t1: 2.86, to: plantBy(L0, BOOM_BACK, 0), lift: 1.6 }] },
    R: { start: R0, moves: [{ t0: 0.1, t1: 0.3, to: plantBy(R0, -4, -0.5, -20), lift: 2.0 }, { t0: s0, t1: s1, to: plantBy(R0, -4, -0.5, -20, { pitch: 20 }) }, { t0: BOOM_HIT + 0.08, t1: 1.12, to: plantBy(R0, 1, -0.5, -4), lift: 2.0 }, { t0: c + 0.04, t1: c + 0.26, to: plantBy(R0, -9, -1, -12), lift: 2.4 }, { t0: 2.4, t1: 2.64, to: plantBy(R0, BOOM_BACK, 0), lift: 1.6 }] },
  });
}
/** Whether it is away from the hand `t` seconds in. */
export const boomAway = (t: number): boolean => t > BOOM_HIT + 1e-6 && t < BOOM_CATCH - 1e-6;
const boomGlint = (t: number): number => (t < 0.06 ? 0 : t < BOOM.drawn ? (t - 0.06) / (BOOM.drawn - 0.06) : t <= BOOM_HIT ? 1 : boomAway(t) ? 0 : t < BOOM_CATCH + 0.4 ? 1 - (t - BOOM_CATCH) / 0.4 : 0);
const boomJaw = (t: number): number => (t < 0.15 ? 0.45 + 2 * t : t < BOOM_CATCH + 0.3 ? 1 : 1 - 0.5 * Math.min(1, (t - BOOM_CATCH - 0.3) / 0.5));
const BOOM_CANVAS = { w: 300, h: 250, ax: 140, ay: 178 } as const;

/** The throw's smear: after-images of the sickle (its tip, its blade, its handle) and the hand, along the way they came. */
function boomBits(mob: Mob, st: Stage, m: Moment): Bit[] {
  const bits: Bit[] = [];
  const put: Put = (part, piece, shape) => {
    bits.push({ part, piece, shape });
  };
  const t = m.t;
  if (m.move !== BOOM_NAME || !BOOM_SMEARED(t)) return bits;
  const thin = Math.abs(t - BOOM_HIT - FR) < 1e-6;
  const lines: V3[][] = [[], [], [], []];
  for (let i = 0; i <= 10; i++) {
    const u = Math.min(t, BOOM_HIT) - (FR * 1.5 * i) / 10;
    const s = skeletonAt(mob, 'attack', u);
    const sk = sickleOf(s);
    lines[0].push(sk.tip);
    lines[1].push(sk.mid);
    lines[2].push(sk.top);
    lines[3].push(s.handR);
  }
  smearAlong(st, put, lines, thin, ['#3a3e48', '#6e7480', '#b8bcc6', '#eef0f4'], PINK[1]);
  return bits;
}
function boomer(who: FieldhandWho, base: Mob): Mob {
  // (the game's own painter, its hand let go of the sickle while it is away: then the sickle is not theirs to paint, but the flight's)
  const paint = fieldPainter(who, { dropped: (m: Moment) => (!!m.dying && m.t >= FH_DIES.drop) || (m.move === BOOM_NAME && boomAway(m.t)) });
  const mob: Mob = {
    ...base,
    id: `${base.id}-boomerang`,
    attack: { name: BOOM_NAME, motion: { keys: boomKeys(), hit: BOOM_HIT }, rest: R, feet: boomFeet(), glint: boomGlint, jaw: boomJaw } as MobMove,
    hit: BOOM_HIT,
    warn: BOOM_STRIKE[0] - BOOM.drawn,
    canvas: BOOM_CANVAS,
    aura: { ...base.aura, x: base.aura.x - FH_CANVAS.ax + BOOM_CANVAS.ax, y: base.aura.y - FH_CANVAS.ay + BOOM_CANVAS.ay },
    bits: (st, m) => {
      const own = paint.bits(st, m);
      const away = m.move === BOOM_NAME && boomAway(m.t);
      return [...(away ? own.filter((b) => b.piece !== 'sickle') : own), ...boomBits(mob, st, m)];
    },
    grains: paint.grains,
  };
  return mob;
}
/** THE REAPER AND THE GLEANER WITH THE SICKLE BOOMERANG (FIELD_HARVEST): the game's own in all but it. */
export const BOOM_REAPER = boomer('reaper', FIELD_REAPER);
export const BOOM_GLEANER = boomer('gleaner', FIELD_GLEANER);

// ---------------------------------------------------------------------------------------------
// ITS FLIGHT: out along the curve and back

/** Where the sickle is `t` seconds into the move while it is away: its place on the floor (tiles before them, to their left) and its height (their own lengths). */
export function boomAt(t: number): { x: number; y: number; z: number; u: number } | null {
  if (!boomAway(t)) return null;
  const u = (t - BOOM_HIT) / BOOM.fly;
  const a = sickleOf(skeletonAt(BOOM_REAPER, 'attack', BOOM_HIT)).mid;
  const b = sickleOf(skeletonAt(BOOM_REAPER, 'attack', BOOM_CATCH)).mid;
  const ax = a[0] / TILE3;
  const ay = a[1] / TILE3;
  const bx = b[0] / TILE3;
  const by = b[1] / TILE3;
  const mx = (ax + bx) / 2;
  return {
    x: ax + (bx - ax) * u + (BOOM.out - mx) * Math.sin(Math.PI * u),
    y: ay + (by - ay) * u + BOOM.wide * Math.sin(2 * Math.PI * u),
    z: a[2] + (b[2] - a[2]) * u - BOOM.dip * Math.sin(Math.PI * u),
    u,
  };
}
/** The whole curve on the floor (tiles), `n` + 1 points from the throw to the catch: for its mark. */
export function boomCurve(n = 120): [number, number][] {
  const out: [number, number][] = [];
  for (let i = 0; i <= n; i++) {
    const p = boomAt(BOOM_HIT + 1e-4 + ((BOOM.fly - 2e-4) * i) / n) as { x: number; y: number };
    out.push([p.x, p.y]);
  }
  return out;
}
/** Whether the sickle strikes a hero `x` tiles before them and `y` to their left at `t` (going out: the first half of its flight; coming back: the second). */
export function boomStrikes(t: number, x: number, y: number): 'out' | 'back' | null {
  const p = boomAt(t);
  if (!p || Math.hypot(x - p.x, y - p.y) > BOOM.r) return null;
  return p.u < 0.5 ? 'out' : 'back';
}

/** The sickle in flight's canvas (its anchor the floor point under it). */
export const SPIN_CANVAS = { w: 120, h: 140, ax: 60, ay: 110 } as const;
const S_HANDLE: Ramp = ['#22180e', '#22180e', '#56402a', '#74583a', '#74583a'];
const S_IRON: Ramp = ['#1a1c22', '#1a1c22', '#4e535d', '#7a808c', '#9aa0aa'];
/**
 * THE SICKLE IN FLIGHT, `t` seconds into the move, drawn as the reaper faces in `view`, at its height over the floor point that is the
 * canvas's anchor: spinning flat (tipped a little toward you), the worn handle and the crescent blade crisp, the blade glinting the
 * enemy's pink; a blur of its blade's edge round it where it has just been; its pink edge, the enemy's.
 */
export function sicklePainted(t: number, view: 'front' | 'back'): { px: Px; lights: Light[] } {
  const C = SPIN_CANVAS;
  const st = stage(view, C.ax, C.ay, C);
  const p = boomAt(t);
  if (!p) return { px: st.whole(ENEMY_RIM), lights: [] };
  const bits: Bit[] = [];
  const put: Put = (part, piece, shape) => void bits.push({ part, piece, shape });
  const tilt = 0.42;
  const turn = (a: number): { way: V3; across: V3 } => {
    const w: V3 = norm([Math.cos(a), Math.sin(a), tilt * Math.sin(a)]);
    const c: V3 = norm([-Math.sin(a), Math.cos(a), tilt * Math.cos(a)]);
    return { way: w, across: c };
  };
  const a = -(t - BOOM_HIT) * BOOM.spin * TAU;
  const o = turn(a);
  const centre: V3 = [0, 0, p.z];
  const hand = add(centre, mul(o.way, -SICKLE.handle * 0.75));
  const fake = { handR: hand, point: o.way, across: o.across } as unknown as Skeleton;
  const k = sickleOf(fake);
  // THE BLUR of its blade where it has just been: its edge's way round, a third of a turn back, fading
  for (let j = 1; j <= 24; j++) {
    const b = turn(a + (j / 24) * TAU * 0.7);
    const hb = add(centre, mul(b.way, -SICKLE.handle * 0.75));
    const kb = sickleOf({ handR: hb, point: b.way, across: b.across } as unknown as Skeleton);
    for (const q of [kb.tip, kb.blade[7], kb.blade[6], kb.mid, kb.butt]) put('blur', 'blur', { k: 'mote', p: q, c: j < 6 ? '#eef0f4' : j < 12 ? '#b8bcc6' : j < 18 ? PINK[1] : PINK[0], size: j < 14 ? 2 : 1 });
  }
  put('sickle', 'sickle', { k: 'rod', a: k.butt, b: k.top, ra: 0.85, rb: 0.75, ramp: S_HANDLE });
  put('sickle', 'sickle', { k: 'rod', a: add(k.top, mul(o.way, -1.0)), b: add(k.top, mul(o.way, 0.4)), ra: 0.95, rb: 0.9, ramp: S_IRON });
  for (let i = 0; i + 1 < k.blade.length; i++) {
    const r0 = 1.25 - 0.95 * (i / (k.blade.length - 1));
    put('sickle', 'sickle', { k: 'rod', a: k.blade[i], b: k.blade[i + 1], ra: Math.max(0.35, r0), rb: Math.max(0.28, r0 - 0.1), ramp: S_IRON });
  }
  put('glint', 'sickle', { k: 'glow', p: k.mid, c: PINK[0], r: 8, a: 0.5 });
  put('glint', 'sickle', { k: 'mote', p: k.blade[5], c: '#fff6ff', size: 2 });
  const lights = paintBits(st, bits, [0, 0, p.z]);
  return { px: st.whole(ENEMY_RIM), lights: [...lights, { x: C.ax, y: C.ay - p.z, r: 34, color: PINK[1], a: 0.45 }] };
}
/** The curve marked on the ground, `k` (0 to 1) of it laid, on a canvas whose anchor is where the reaper stands (its ax, ay). */
export const CURVE_CANVAS = { w: 640, h: 380, ax: 120, ay: 190 } as const;
export function curvePainted(k: number, view: 'front' | 'back', gone = 0): Px {
  const C = CURVE_CANVAS;
  const px = new Px(C.w, C.h);
  const dot2 = pen(px, true);
  const pts = boomCurve(240);
  const side = (x: number, y: number): [number, number] => (view === 'front' ? tileAt(C.ax, C.ay, x, -y) : tileAt(C.ax, C.ay, y, -x));
  const n = Math.round(pts.length * clamp01(k));
  for (let i = Math.round(pts.length * clamp01(gone)); i < n; i++) {
    const [x, y] = pts[i];
    const nx = pts[Math.min(pts.length - 1, i + 1)];
    const dx = nx[0] - x;
    const dy = nx[1] - y;
    const L = Math.hypot(dx, dy) || 1;
    // (its middle dashed in the enemy's pink, darker under; its edges, `r` either side, dotted)
    if (i % 6 < 4) {
      const [X, Y] = side(x, y);
      dot2(X, Y, i % 6 === 1 ? PINK[1] : PINK[0]);
      dot2(X + 1, Y, PINK[0]);
      dot2(X, Y + 1, PINK[2]);
    }
    if (i % 4 === 0) {
      for (const sgn of [-1, 1]) {
        const [X, Y] = side(x - (dy / L) * BOOM.r * sgn, y + (dx / L) * BOOM.r * sgn);
        dot2(X, Y, PINK[2]);
      }
    }
  }
  return px;
}
