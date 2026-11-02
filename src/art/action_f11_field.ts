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
import { FH_BODY, FH_CANVAS, FH_REST, sickleOf } from './fieldhands';
import { FIELD_GLEANER, FIELD_REAPER } from './fieldhands_moves';
import { TILE3, mobSet, skeletonAt } from './new_mobs3';
import type { Bit, Mob, MobMove, Moment, Put } from './new_mobs3';
import type { Stage } from './skin';
import { aimFor, elbowFor, heading, norm } from './skeleton';
import type { Bones, Key3, Posed, V3 } from './skeleton';
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
/** As the game holds a monster: the game's own reaper or gleaner, the harvest as its `attack`. */
export function makeHarvestArt(mob: Mob = HARVEST_REAPER, pace = mob.pace): ActorArt {
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
