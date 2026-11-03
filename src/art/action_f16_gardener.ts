// FLOOR 16'S SMALL MOB, MORE ACTION: THE HUSHED GARDENER (the art chat's helper, 2 Nov 2026; docs/mockups/action_f16/README.md).
// A MOCK-UP: NOTHING OF THE GAME IMPORTS THIS FILE. His HEDGE CUT (GARDENER_HEDGE, off), in place of the shears snap, on the game's own
// figure (art/palace_hands.ts, art/palace_hands_moves.ts), all he keeps frame for frame his own.
//
// His review of every enemy for more action, 31 Oct 2026, offered and answered “Yes (Recommended)”:
//   HUSHED GARDENER (floor 16, small): “Hedge cut: three quick snips of the shears, stepping in with each, the last a scissoring leap.”
// Under his Movement 9 (24 Oct: “Like the wind up and wind down are big but the actual punch is lightning quick”; 28 Oct: “And bigger
// AOE to compensate for the extra time the player gets to evade”). Small: one attack (his rule of 9 Oct).
//
// THE HEDGE CUT: the shears up before his face and opened wide, HELD, shaking, glinting pink; in TWO FRAMES driven out at you and
// SNAPPED SHUT, a step in, smeared; flung open again at once; in TWO FRAMES the second snip, low, the other foot stepping in past; then
// crouched, the shears raised high over his hat and opened their widest, HELD; in TWO FRAMES a LEAP, his legs scissoring in the air,
// and the blades SCISSORED SHUT down into the lawn before him as he lands in a deep lunge: a burst of cut grass and turf; wrenched out
// of the turf; straightened, on where he landed.

import { Px } from '../engine/px';
import type { Light } from '../engine/px';
import type { ActorArt } from './actor_types';
import { footwork, plantBy, plantOf } from './bosses3';
import { hash } from './kit';
import { PH_BODY, PH_CANVAS, shearsOf } from './palace_hands';
import { GARDENER_REST, PALACE_GARDENER } from './palace_hands_moves';
import { TILE3, mobSet, skeletonAt } from './new_mobs3';
import type { Bit, Mob, MobMove, Moment, Put } from './new_mobs3';
import type { Stage } from './skin';
import { elbowFor, norm } from './skeleton';
import type { Bones, Key3, Posed, V3 } from './skeleton';
import { FR, TAU, blob, clamp01, f, markRing, pen, smearAlong, smooth, tileAt } from './action_f6_fx';

/** THE SWITCH, OFF. With it on, the bestiary's gardener is made by `makeHedgeArt`. */
export const GARDENER_HEDGE = { on: false };

type P = Partial<Bones>;
const B = PH_BODY;
const R = GARDENER_REST;
const L0 = plantOf(B, 'L', {}, R);
const R0 = plantOf(B, 'R', {}, R);
const PINK = ['#e0287a', '#ff7aa8', '#7a1058'] as const;
/** The lawn's cut grass and turf (the Swan Gardens' own greens, art/swangardens.ts), its earth. */
export const CLIPPINGS = ['#1c2a18', '#2e4424', '#45632f', '#5f8040', '#86a35a', '#b4c886'] as const;
const EARTH = ['#24180f', '#3a2a1c'] as const;

function elbowsTo(pose: P, wantL: V3 | null, wantR: V3 | null): P {
  const q = { ...R, ...pose } as Posed;
  const le = wantL ? elbowFor(B, q, true, norm(wantL)) : q.le;
  const re = wantR ? elbowFor(B, { ...q, le } as Posed, false, norm(wantR)) : q.re;
  return { ...pose, le, re };
}
/** The shears in both fists (as art/palace_hands_moves.ts holds them): each fist from its own shoulder, `gap` apart; pointing `el` up. */
function fists(x: number, z: number, gap: number, el: number, az = 0, dy = 0): P {
  return { lhIn: 1, lhx: x, lhy: gap / 2 - 6.6 + dy, lhz: z, rhIn: 1, rhx: x, rhy: 8.1 - gap / 2 + dy, rhz: z, wAz: az, wEl: el, wRoll: 0 };
}
const ELS: [V3, V3] = [[0.2, 1, -0.3], [0.2, -1, -0.3]];
const pose = (p: P, els: [V3, V3] = ELS): P => elbowsTo(p, els[0], els[1]);

/**
* THE HEDGE CUT'S NUMBERS (seconds from its start; tiles):
 *   wind-up   the shears up over his right shoulder and opened wide by 0.3 s; HELD, glinting pink, shaking, to 0.6 s (0.3 s; the snap's 0.22)
 *   SNIP ONE  TWO FRAMES, smeared, the left foot stepping in: slashed down and out at you and snapped shut (frame 20, 0.667 s)
 *   a beat    flung open again up over his left shoulder by 0.98 s, held to 1.067 s
 *   SNIP TWO  TWO FRAMES, smeared, the right foot stepping in past the left: the backhand, down across him (frame 34, 1.133 s)
 *   crouched  the shears up over his hat, opened their widest, crouched, by 1.6 s; HELD to 1.8 s
 *   THE LEAP  TWO FRAMES, smeared: up and on, his legs scissoring (frame 55), down, the blades SCISSORED SHUT into the lawn (frame 56,
 *             1.867 s: the clip's `hit`): a burst of cut grass and turf
 *   wind-down  wrenched at to 2.15 s; out of the turf by 2.4 s; straightened by 2.95 s, on where he landed: `travel` tiles on from
 *             where he began (the game moves him on by it as it ends)
 *   struck    by each snip, a hero in the strip before him then (`snip.fwd`, `snip.half` to either side); by the leap, a hero within
 *             `r` of where the blades go in (the burst)
 *   near, far  begun at a hero from 0 to 2.8 tiles off
 */
export const HEDGE_HITS = [f(20), f(34), f(56)] as const;
export const HEDGE_STRIKES = [[f(18), f(20)], [f(32), f(34)], [f(54), f(56)]] as const;
export const HEDGE_HIT = HEDGE_HITS[2];
export const HEDGE_SMEARED = (t: number): boolean => HEDGE_STRIKES.some(([a, b]) => t > a + 1e-6 && t <= b + FR + 1e-6);
export const HEDGE = { up: 0.3, held: 0.6, beat: [0.98, f(32)] as const, crouch: 1.6, long: 2.95, travel: 30 / TILE3, snip: { fwd: [0, 2.0] as const, half: 1.0 }, r: 1.6, near: 0, far: 2.8 } as const;
const HEDGE_NAME = 'The hedge cut';

/** Up over his right shoulder, opened wide, his body wound round to the right. */
const RAISED: P = pose({ px: -1.8, pz: R.pz + 0.4, yaw: -10, twist: -14, pitch: -4, bend: -6, side: 1, roll: 0, faceUp: 16, faceTilt: 0, faceTurn: 8, ...fists(3, 14, 15, 66, -24, -2), lk: 10, rk: -10 }, [[0.3, 1, 0.1], [0.3, -1, 0.1]]);
const shake = (k: number): P => ({ ...RAISED, lhz: (RAISED.lhz as number) + (k % 2 ? 0.7 : -0.3), rhz: (RAISED.rhz as number) + (k % 2 ? -0.3 : 0.7), px: (RAISED.px as number) - 0.3 * (k % 2), faceUp: 16 + (k % 2) });
const SNIP1_MID: P = pose({ px: 2.6, pz: R.pz - 0.8, yaw: -2, twist: -4, pitch: 8, bend: 2, side: 0, roll: 0, faceUp: 12, faceTilt: 0, faceTurn: 2, ...fists(13, 4, 9, 26, -8, -1), lk: 14, rk: -8 });
const SNIP1: P = pose({ px: 5.4, pz: R.pz - 1.8, yaw: 4, twist: 6, pitch: 16, bend: 9, side: 0, roll: 0, faceUp: 10, faceTilt: 0, faceTurn: -2, ...fists(16, -9, 3.2, -16, 8, 1), lk: 20, rk: -8 }, [[0.1, 1, -0.4], [0.1, -1, -0.4]]);
const THROUGH1: P = pose({ px: 6.2, pz: R.pz - 2.1, yaw: 6, twist: 8, pitch: 18, bend: 11, side: 0, roll: 0, faceUp: 8, faceTilt: 0, faceTurn: -3, ...fists(15, -12, 3.2, -24, 12, 2), lk: 20, rk: -8 }, [[0.1, 1, -0.4], [0.1, -1, -0.4]]);
/** Flung open again, up over his left shoulder for the backhand, his body wound round to the left. */
const REOPEN: P = pose({ px: 7.6, pz: R.pz - 0.8, yaw: 8, twist: 12, pitch: 2, bend: -2, side: -1, roll: 0, faceUp: 14, faceTilt: 0, faceTurn: -6, ...fists(5, 10, 15, 58, 26, 4), lk: 14, rk: -10 }, [[0.3, 1, 0], [0.3, -1, 0]]);
const reBeat = (k: number): P => ({ ...REOPEN, lhz: (REOPEN.lhz as number) + 0.4 * k, rhz: (REOPEN.rhz as number) + 0.4 * k });
const SNIP2_MID: P = pose({ px: 11, pz: R.pz - 1.6, yaw: 2, twist: 2, pitch: 12, bend: 6, side: 0, roll: 0, faceUp: 8, faceTilt: 0, faceTurn: 0, ...fists(13, -1, 9, 18, 8, 1), lk: 16, rk: -10 });
const SNIP2: P = pose({ px: 14, pz: R.pz - 2.8, yaw: -4, twist: -6, pitch: 20, bend: 12, side: 0, roll: 0, faceUp: 6, faceTilt: 0, faceTurn: 2, ...fists(16, -12, 3.2, -24, -10, -2), lk: 18, rk: -14 }, [[0.1, 1, -0.5], [0.1, -1, -0.5]]);
const THROUGH2: P = pose({ px: 14.8, pz: R.pz - 3.2, yaw: -5, twist: -8, pitch: 23, bend: 14, side: 0, roll: 0, faceUp: 4, faceTilt: 0, faceTurn: 3, ...fists(15, -15, 3.2, -32, -14, -3), lk: 18, rk: -14 }, [[0.1, 1, -0.5], [0.1, -1, -0.5]]);
/** Crouched to leap, the shears up over his hat and opened their widest. */
const CROUCH: P = pose({ px: 14, pz: R.pz - 5, yaw: -2, twist: -4, pitch: 4, bend: -8, side: 0, roll: 0, faceUp: 20, faceTilt: 0, faceTurn: 2, ...fists(3, 15, 16, 74), lk: 26, rk: -26 }, [[0.2, 1, 0.2], [0.2, -1, 0.2]]);
const crouchShake = (k: number): P => ({ ...CROUCH, lhz: (CROUCH.lhz as number) + (k % 2 ? 0.6 : -0.2), rhz: (CROUCH.rhz as number) + (k % 2 ? -0.2 : 0.6), pz: (CROUCH.pz as number) - 0.2 * (k % 2) });
const LEAP_MID: P = pose({ px: 22, pz: R.pz + 5, yaw: 0, twist: 0, pitch: 12, bend: 0, side: 0, roll: 0, faceUp: 10, faceTilt: 0, faceTurn: 0, ...fists(10, 6, 12, 24), lk: 30, rk: -30 }, [[0.2, 1, -0.1], [0.2, -1, -0.1]]);
/** SCISSORED SHUT: landed in a deep lunge, the blades driven shut down into the lawn before him. */
const SCISSOR: P = pose({ px: 29, pz: R.pz - 10, yaw: 2, twist: 2, pitch: 32, bend: 18, side: 0, roll: 0, faceUp: -2, faceTilt: 0, faceTurn: -2, ...fists(15, -15, 3.2, -46), lk: 30, rk: -18 }, [[0.1, 1, -0.5], [0.1, -1, -0.5]]);
const tug = (dx: number, dz: number): P => ({ ...SCISSOR, px: 29 + dx * 0.6, pz: (SCISSOR.pz as number) + dz * 0.5, lhx: (SCISSOR.lhx as number) + dx * 0.3, rhx: (SCISSOR.rhx as number) + dx * 0.3, lhz: (SCISSOR.lhz as number) + dz * 0.3, rhz: (SCISSOR.rhz as number) + dz * 0.3, pitch: 32 - dx * 1.2 });
const YANK: P = pose({ px: 29, pz: R.pz - 4.5, yaw: 0, twist: -2, pitch: 16, bend: 8, side: 0, roll: 0, faceUp: 6, faceTilt: 0, faceTurn: 0, ...fists(12, -9, 6, 10), lk: 18, rk: -14 }, [[0.1, 1, -0.5], [0.1, -1, -0.5]]);
/** How far on he goes, in his own lengths. */
export const HEDGE_TRAVEL = HEDGE.travel * TILE3;
function hedgeKeys(): Key3[] {
  const [h1, h2, h3] = HEDGE_HITS;
  return [
    { at: 0, pose: {} },
    { at: HEDGE.up, pose: RAISED, ease: 'io' },
    { at: 0.38, pose: shake(1), ease: 'io' },
    { at: 0.46, pose: shake(2), ease: 'io' },
    { at: 0.54, pose: shake(3), ease: 'io' },
    { at: HEDGE_STRIKES[0][0], pose: RAISED, ease: 'io' },
    { at: f(19), pose: SNIP1_MID, ease: 'lin' },
    { at: h1, pose: SNIP1, ease: 'lin' },
    { at: h1 + 0.12, pose: THROUGH1, ease: 'out' },
    { at: HEDGE.beat[0], pose: REOPEN, ease: 'io' },
    { at: 1.02, pose: reBeat(1), ease: 'io' },
    { at: HEDGE_STRIKES[1][0], pose: reBeat(0), ease: 'io' },
    { at: f(33), pose: SNIP2_MID, ease: 'lin' },
    { at: h2, pose: SNIP2, ease: 'lin' },
    { at: h2 + 0.12, pose: THROUGH2, ease: 'out' },
    { at: HEDGE.crouch, pose: CROUCH, ease: 'io' },
    { at: 1.7, pose: crouchShake(1), ease: 'io' },
    { at: HEDGE_STRIKES[2][0], pose: CROUCH, ease: 'io' },
    { at: f(55), pose: LEAP_MID, ease: 'lin' },
    { at: h3, pose: SCISSOR, ease: 'lin' },
    { at: h3 + 0.12, pose: tug(-0.6, 0.5), ease: 'out' },
    { at: h3 + 0.28, pose: tug(-0.2, 0.2), ease: 'io' },
    { at: h3 + 0.53, pose: YANK, ease: 'io' },
    { at: HEDGE.long, pose: { px: HEDGE_TRAVEL }, ease: 'io' },
  ];
}
function hedgeFeet(): (t: number) => P {
  const [s1, s2, s3] = HEDGE_STRIKES;
  return footwork(B, {
    L: { start: L0, moves: [{ t0: s1[0] - 0.02, t1: s1[1], to: plantBy(L0, 9, 0.5, 6), lift: 2.4 }, { t0: s3[0], t1: s3[1], to: plantBy(L0, 34, 0.5, 6), lift: 6 }, { t0: 2.62, t1: 2.88, to: plantBy(L0, HEDGE_TRAVEL, 0), lift: 2 }] },
    R: { start: R0, moves: [{ t0: s2[0] - 0.02, t1: s2[1], to: plantBy(R0, 19, 0, -4), lift: 2.6 }, { t0: s3[0], t1: s3[1], to: plantBy(R0, 23, -0.5, -10), lift: 5 }, { t0: 2.4, t1: 2.64, to: plantBy(R0, HEDGE_TRAVEL, 0), lift: 2.4 }] },
  });
}
/** The glint on its blades: up as they are raised, held through all three, gone after the leap. */
const hedgeGlint = (t: number): number => (t < 0.08 || t > HEDGE_HIT + 0.25 ? 0 : t < HEDGE.up ? (t - 0.08) / (HEDGE.up - 0.08) : t <= HEDGE_HIT ? 1 : 1 - (t - HEDGE_HIT) / 0.25);
const hedgeJaw = (t: number): number => (t < 0.15 ? 0.45 + 2 * t : t < HEDGE_HIT + 0.3 ? 1 : 1 - 0.5 * Math.min(1, (t - HEDGE_HIT - 0.3) / 0.5));

function moreBits(mob: Mob, st: Stage, m: Moment): Bit[] {
  const bits: Bit[] = [];
  const put: Put = (part, piece, shape) => {
    bits.push({ part, piece, shape });
  };
  const t = m.t;
  if (m.move !== HEDGE_NAME || !HEDGE_SMEARED(t)) return bits;
  const k = HEDGE_STRIKES.findIndex(([a, b]) => t > a + 1e-6 && t <= b + FR + 1e-6);
  const hit = HEDGE_HITS[k];
  const thin = Math.abs(t - hit - FR) < 1e-6;
  const lines: V3[][] = [[], [], [], []];
  for (let i = 0; i <= 8; i++) {
    const u = Math.min(t, hit) - (FR * 1.3 * i) / 8;
    const sk = shearsOf(skeletonAt(mob, 'attack', u));
    lines[0].push(sk.tipL);
    lines[1].push(sk.tipR);
    lines[2].push(sk.mid);
    lines[3].push(sk.pivot);
  }
  smearAlong(st, put, lines, thin, ['#3a3e48', '#6e7480', '#b8bcc6', '#eef0f4'], PINK[1]);
  return bits;
}

const PH_CANVAS2 = { w: 330, h: 250, ax: 120, ay: 178 } as const;
function hedger(base: Mob): Mob {
  const mob: Mob = {
    ...base,
    id: `${base.id}-hedge`,
    attack: { name: HEDGE_NAME, motion: { keys: hedgeKeys(), hit: HEDGE_HIT }, rest: R, feet: hedgeFeet(), glint: hedgeGlint, jaw: hedgeJaw } as MobMove,
    hit: HEDGE_HIT,
    warn: HEDGE.held - HEDGE.up,
    canvas: PH_CANVAS2,
    aura: { ...base.aura, x: base.aura.x - PH_CANVAS.ax + PH_CANVAS2.ax, y: base.aura.y - PH_CANVAS.ay + PH_CANVAS2.ay },
    bits: (st, m) => [...base.bits(st, m), ...moreBits(mob, st, m)],
  };
  return mob;
}
/** THE GARDENER WITH THE HEDGE CUT (GARDENER_HEDGE): the game's own in all but it. */
export const HEDGE_GARDENER = hedger(PALACE_GARDENER);
/** As the game holds a monster: the game's own gardener, his attack the SHEAR LUNGE (2 Nov, his pick; the hedge cut before it kept as `HEDGE_GARDENER` for the picture beside the new). */
export function makeHedgeArt(mob: Mob = LUNGE_GARDENER, pace = mob.pace): ActorArt {
  return { front: mobSet(mob, 'front', pace), back: mobSet(mob, 'back', pace) };
}

// =============================================================================================
// WHERE THE BLADES GO IN, AND THE BURST OF CUT GRASS

/** Where the blades go into the lawn at the leap (tiles before where he began, to his left). */
export function scissorAt(): [number, number] {
  const k = shearsOf(skeletonAt(HEDGE_GARDENER, 'attack', HEDGE_HIT));
  return [k.mid[0] / TILE3, k.mid[1] / TILE3];
}
/** The pelvis's place `t` seconds in (tiles on from where he began): for where each snip strikes from. */
export function hedgeOn(t: number): number {
  return skeletonAt(HEDGE_GARDENER, 'attack', t).pelvis[0] / TILE3;
}
/** Whether a hero `x` tiles before where he began and `y` to his left is struck by blow `k` (0, 1: the snips; 2: the leap). */
export function hedgeStrikes(k: 0 | 1 | 2, x: number, y: number): boolean {
  if (k === 2) {
    const [hx, hy] = scissorAt();
    return Math.hypot(x - hx, y - hy) <= HEDGE.r;
  }
  const on = hedgeOn(HEDGE_HITS[k]);
  return x - on >= HEDGE.snip.fwd[0] && x - on <= HEDGE.snip.fwd[1] && Math.abs(y) <= HEDGE.snip.half;
}

/** The burst's canvas (its anchor where the blades go in). */
export const CLIP_CANVAS = { w: 300, h: 240, ax: 150, ay: 150 } as const;
/**
 * THE BURST OF CUT GRASS, `t` seconds after the blades go in (`big` 1: the leap's; less, a snip's spray of it where they shut):
 *   floor  the turf torn where they went in; a ring of cut grass rolling out to `HEDGE.r`, its leading edge the enemy's pink; the
 *          clippings lying strewn, fading by 1.8 s
 *   air    blades of grass and clods of turf flung up and out in a fountain, tumbling, drifting down; gone by 1.4 s. By halves
 *          (`side`): 'behind' before a figure there, 'before' after.
 */
export function clippingsPainted(t: number, layer: 'floor' | 'air', side: 'behind' | 'before' | 'all' = 'all', big = 1): { px: Px; lights: Light[] } {
  const C = CLIP_CANVAS;
  const px = new Px(C.w, C.h);
  const lights: Light[] = [];
  if (t < 0 || t > 1.8) return { px, lights };
  const dot2 = pen(px);
  const under = pen(px, true);
  const at = (x: number, y: number): [number, number] => tileAt(C.ax, C.ay, x, y);
  const onSide = (y: number): boolean => side === 'all' || (y > C.ay) === (side === 'before');
  const r = HEDGE.r * big;
  if (layer === 'floor') {
    if (big < 1) return { px, lights };
    const fade = 1 - smooth((t - 1.2) / 0.6);
    // (the turf torn where they went in: two gashes, the blades')
    for (let i = 0; i < 46; i++) {
      const a = (i % 2 ? 0.35 : -0.35) + (hash(i, 1, 1601) - 0.5) * 0.3;
      const d = 0.42 * hash(i, 2, 1601);
      const [x, y] = at(Math.cos(a) * d, Math.sin(a) * d);
      if (hash(i, 3, 1601) > fade) continue;
      dot2(x, y, i % 3 ? EARTH[0] : EARTH[1]);
    }
    // the ring rolling out, its leading edge pink
    if (t < 0.5) {
      const k = 1 - (1 - clamp01(t / 0.22)) ** 2;
      markRing(px, C.ax, C.ay, r * k, 1, [PINK[0], PINK[1], PINK[2]], 0.4);
      for (let i = 0; i < 150; i++) {
        const a = hash(i, 4, 1601) * TAU;
        const d = r * k * (0.7 + 0.3 * Math.sqrt(hash(i, 5, 1601)));
        const [x, y] = at(Math.cos(a) * d, Math.sin(a) * d);
        if (hash(i, 6, 1601) < t / 0.5) continue;
        under(x, y, i % 3 ? CLIPPINGS[4] : CLIPPINGS[3]);
      }
    }
    // the clippings lying strewn over the lawn
    for (let i = 0; i < 170; i++) {
      const land = 0.25 + 0.6 * hash(i, 7, 1601);
      if (t < land || hash(i, 8, 1601) > fade) continue;
      const a = hash(i, 9, 1601) * TAU;
      const d = r * Math.sqrt(hash(i, 10, 1601)) * 1.05;
      const [x, y] = at(Math.cos(a) * d, Math.sin(a) * d);
      const L = 1 + Math.round(2 * hash(i, 11, 1601));
      for (let q = 0; q < L; q++) under(x + q, y + (i % 2 ? 0 : q * 0.5), CLIPPINGS[2 + (i % 4)]);
    }
    return { px, lights };
  }
  if (t > 1.4) return { px, lights };
  // the flash of the blades meeting
  if (t < 0.06 && side !== 'behind') {
    blob(dot2, C.ax, C.ay - 2, 3 + 3 * (1 - t / 0.06) * big, '#fff6e8');
    lights.push({ x: C.ax, y: C.ay - 4, r: 40 * big, color: '#ffe8f0', a: 0.3 });
  }
  // blades of grass and clods of turf flung up in a fountain, tumbling and drifting down
  const n = Math.round(160 * big);
  for (let i = 0; i < n; i++) {
    const a = hash(i, 1, 1603) * TAU;
    const sp = 0.6 + 1.6 * hash(i, 2, 1603);
    const t0 = 0.04 * hash(i, 3, 1603);
    const s = t - t0;
    if (s < 0) continue;
    const drag = 1 - Math.exp(-3.2 * s);
    const d = Math.min(r * 1.1, (sp * drag * big) / 1.6);
    const [x, y] = at(Math.cos(a) * d, Math.sin(a) * d);
    if (!onSide(y)) continue;
    const up = (70 + 70 * hash(i, 4, 1603)) * drag * 0.55 * big - 34 * s * s * (0.5 + hash(i, 5, 1603));
    if (up < 0 || hash(i, 6, 1603) < (t - 0.9) / 0.5) continue;
    const spin = s * (8 + 8 * hash(i, 7, 1603)) + i;
    if (i % 9 === 0) {
      // (a clod of turf: earth, grass on its top)
      dot2(x, y - up, EARTH[1]);
      dot2(x + 1, y - up, EARTH[0]);
      dot2(x, y - up - 1, CLIPPINGS[3]);
      continue;
    }
    const L = i % 3 === 0 ? 3 : 2;
    for (let q = 0; q < L; q++) dot2(x + Math.cos(spin) * q + Math.sin(s * 3 + i) * 3 * s, y - up + Math.sin(spin) * q, i % 13 === 0 ? PINK[1] : CLIPPINGS[2 + ((i + q) % 4)]);
  }
  return { px, lights };
}

// =============================================================================================
// THE SHEAR LUNGE (2 Nov 2026): IN PLACE OF THE HEDGE CUT
//
// The owner, 2 Nov 2026, 07:32: “Okay now I need you to look at how many enemies do a small hit, small hit, slam combo.  I feel like you
// over corrected to that a little too much.” Asked which keep it: “Chained One and troll (Recommended)”. So the gardener's hedge cut
// (snip, snip, a scissoring leap) goes; asked what in its place, his pick: “Shear lunge”, offered as: a long held crouch, then one lunge 3
// tiles across the lawn, the open shears snapping shut on you. By his Movement 9 (a big held wind-up, a strike of 1 to 2 frames, a big
// wind-down) and Monsters 9 (big areas, readable marks). Their one attack.
//
// THE SHEAR LUNGE: he sinks into a deep crouch, the shears thrust out before him low and OPENED THEIR WIDEST, the lane marked before
// him across the lawn: HELD long, shaking, the blades glinting pink; in TWO FRAMES he LUNGES, flung low and long through the air three
// tiles down the lane, smeared (after-images of him and the blades all the way), the blades SNAPPING SHUT at its end in a spray of cut
// grass; THE WIND-DOWN: carried on, stumbling, bent double, the shut shears dragged along the turf, a second stumbling step, and only
// then straightened, on where he stopped.

/**
 * THE SHEAR LUNGE'S NUMBERS (seconds from its start; tiles):
 *   crouch    sunk into it by 0.35 s, the shears out low before him opened their widest; the lane marked from 0.15 s
 *   HELD      shaking, glinting pink, 0.35 to 1.1 s (0.75 s)
 *   THE LUNGE TWO FRAMES, smeared (frames 33 to 35): flung three tiles down the lane; the blades snapped shut at its end (frame 35,
 *             1.167 s: the clip's `hit`)
 *   wind-down stumbling on, the shut shears dragged on the turf, to 1.85 s; straightened by 2.4 s; his stand by 2.8 s, `travel` tiles on
 *             from where he began (the game moves him on by it as it ends)
 *   struck    a hero in the lane as he goes through it (`lane` long, `half` to either side), or within `snap` of where the blades shut
 *   near, far begun at a hero from 1.5 to 3.6 tiles off
 */
export const LUNGE_HIT = f(35);
export const LUNGE_STRIKE = [f(33), f(35)] as const;
export const LUNGE_SMEARED = (t: number): boolean => t > LUNGE_STRIKE[0] + 1e-6 && t <= LUNGE_STRIKE[1] + FR + 1e-6;
export const LUNGE = { crouch: 0.35, mark: 0.15, held: LUNGE_STRIKE[0], long: 2.8, lunge: 3.0, lane: 3.8, half: 0.85, snap: 1.2, near: 1.5, far: 3.6 } as const;
const LUNGE_NAME = 'The shear lunge';
/** How far he is flung in the lunge, in his own lengths (the pelvis's), and how far on he stumbles after it. */
const FLUNG = LUNGE.lunge * TILE3;
const STUMBLE = 14;
/** How far on he is when it ends (his own lengths, and tiles). */
export const LUNGE_TRAVEL = FLUNG + STUMBLE;
export const LUNGE_TRAVEL_TILES = LUNGE_TRAVEL / TILE3;

/** Sunk into the crouch: down low, leaning in, the shears out low before him OPENED THEIR WIDEST, his eyes on you. */
const L_CROUCH: P = pose({ px: -3, pz: R.pz - 7, yaw: -4, twist: -6, pitch: 16, bend: 6, side: 0, roll: 0, faceUp: 22, faceTilt: 0, faceTurn: 2, ...fists(12, -4, 17, 2, 0, 0), lk: 24, rk: -30 }, [[0.1, 1, -0.2], [0.1, -1, -0.2]]);
const lShake = (k: number): P => ({ ...L_CROUCH, lhz: (L_CROUCH.lhz as number) + (k % 2 ? 0.5 : -0.2), rhz: (L_CROUCH.rhz as number) + (k % 2 ? -0.2 : 0.5), pz: (L_CROUCH.pz as number) - 0.25 * (k % 2), px: (L_CROUCH.px as number) - 0.2 * (k % 2) });
/** Coiled the last frame before it: down a hair lower, drawn back a hair. */
const L_COIL: P = { ...L_CROUCH, px: -4, pz: R.pz - 7.6, pitch: 18 };
/** Half way: flung low and long through the air, the shears thrust out ahead, still open. */
const L_FLY: P = pose({ px: FLUNG * 0.5, pz: R.pz + 2, yaw: 0, twist: 0, pitch: 34, bend: 8, side: 0, roll: 0, faceUp: 26, faceTilt: 0, faceTurn: 0, ...fists(17, 0, 15, 0), lk: 20, rk: -20 }, [[0.2, 1, -0.2], [0.2, -1, -0.2]]);
/** Landed, three tiles on: deep in a lunge, the blades SNAPPED SHUT, thrust out and down. */
const L_SNAP: P = pose({ px: FLUNG, pz: R.pz - 8, yaw: 2, twist: 2, pitch: 28, bend: 12, side: 0, roll: 0, faceUp: 12, faceTilt: 0, faceTurn: -2, ...fists(17, -8, 3.2, -14), lk: 22, rk: -20 }, [[0.1, 1, -0.4], [0.1, -1, -0.4]]);
/** Carried on, stumbling, bent double over the shut shears, their points on the turf. */
const L_STUMBLE: P = pose({ px: FLUNG + 8, pz: R.pz - 9.5, yaw: 4, twist: 4, pitch: 36, bend: 16, side: -1, roll: 0, faceUp: 4, faceTilt: 0, faceTurn: -4, ...fists(15, -15, 3.2, -40, 6, 1), lk: 22, rk: -16 }, [[0.1, 1, -0.5], [0.1, -1, -0.5]]);
/** The second stumbling step: still bent, the shears dragged along the turf beside him. */
const L_DRAG: P = pose({ px: FLUNG + 12, pz: R.pz - 7, yaw: -3, twist: -4, pitch: 30, bend: 14, side: 1, roll: 0, faceUp: 6, faceTilt: 0, faceTurn: 4, ...fists(13, -17, 3.2, -52, -8, -1), lk: 18, rk: -18 }, [[0.1, 1, -0.5], [0.1, -1, -0.5]]);
/** Heaving himself up. */
const L_UP: P = pose({ px: FLUNG + 13.5, pz: R.pz - 2.5, yaw: 0, twist: -2, pitch: 12, bend: 6, side: 0, roll: 0, faceUp: 8, faceTilt: 0, faceTurn: 0, ...fists(10, -10, 4, -10), lk: 14, rk: -14 }, [[0.1, 1, -0.5], [0.1, -1, -0.5]]);
function lungeKeys(): Key3[] {
  const [s0] = LUNGE_STRIKE;
  return [
    { at: 0, pose: {} },
    { at: LUNGE.crouch, pose: L_CROUCH, ease: 'io' },
    { at: 0.45, pose: lShake(1), ease: 'io' },
    { at: 0.55, pose: lShake(2), ease: 'io' },
    { at: 0.65, pose: lShake(3), ease: 'io' },
    { at: 0.75, pose: lShake(4), ease: 'io' },
    { at: 0.85, pose: lShake(5), ease: 'io' },
    { at: 0.95, pose: lShake(6), ease: 'io' },
    { at: s0 - 0.034, pose: L_CROUCH, ease: 'io' },
    { at: s0, pose: L_COIL, ease: 'in' },
    { at: f(34), pose: L_FLY, ease: 'lin' },
    { at: LUNGE_HIT, pose: L_SNAP, ease: 'lin' },
    { at: LUNGE_HIT + 0.2, pose: L_STUMBLE, ease: 'out' },
    { at: 1.45, pose: { ...L_STUMBLE, px: FLUNG + 9.5, pz: R.pz - 9 }, ease: 'io' },
    { at: 1.7, pose: L_DRAG, ease: 'io' },
    { at: 1.85, pose: { ...L_DRAG, px: FLUNG + 12.5, pz: R.pz - 6.5 }, ease: 'io' },
    { at: 2.25, pose: L_UP, ease: 'io' },
    { at: LUNGE.long, pose: { px: LUNGE_TRAVEL }, ease: 'io' },
  ];
}
function lungeFeet(): (t: number) => P {
  const [s0, s1] = LUNGE_STRIKE;
  // (the crouch: the left foot out before him, the right drawn back; flung through the air, both off the lawn; down three tiles on,
  // the left first; stumbling on, the right, then the left; set side by side as he straightens)
  const Lc = plantBy(L0, 7, 0.5, 8);
  const Rc = plantBy(R0, -7, -0.5, -14);
  return footwork(B, {
    L: { start: L0, moves: [{ t0: 0.04, t1: 0.3, to: Lc, lift: 2.4 }, { t0: s0, t1: s1, to: plantBy(L0, FLUNG + 9, 0.5, 6), lift: 9 }, { t0: 1.62, t1: 1.84, to: plantBy(L0, FLUNG + 21, 0.5, 2), lift: 2.4 }, { t0: 2.36, t1: 2.6, to: plantBy(L0, LUNGE_TRAVEL, 0), lift: 1.6 }] },
    R: { start: R0, moves: [{ t0: 0.08, t1: 0.32, to: Rc, lift: 2.2 }, { t0: s0, t1: s1, to: plantBy(R0, FLUNG - 7, -0.5, -8), lift: 7 }, { t0: 1.24, t1: 1.46, to: plantBy(R0, FLUNG + 14, -1, -4), lift: 2.6 }, { t0: 2.1, t1: 2.34, to: plantBy(R0, LUNGE_TRAVEL, 0), lift: 1.8 }] },
  });
}
/** The glint on its blades: up as he sinks into the crouch, held, gone after the snap. */
const lungeGlint = (t: number): number => (t < 0.06 || t > LUNGE_HIT + 0.25 ? 0 : t < LUNGE.crouch ? (t - 0.06) / (LUNGE.crouch - 0.06) : t <= LUNGE_HIT ? 1 : 1 - (t - LUNGE_HIT) / 0.25);
const lungeJaw = (t: number): number => (t < 0.2 ? 0.45 + 2 * t : t < LUNGE_HIT + 0.4 ? 1 : 1 - 0.5 * Math.min(1, (t - LUNGE_HIT - 0.4) / 0.5));
/** THE LUNGE'S SMEAR: after-images of the blades and of HIM, all the way he was flung (his head, his hands, his hips, his knees). */
function lungeBits(mob: Mob, st: Stage, m: Moment): Bit[] {
  const bits: Bit[] = [];
  const put: Put = (part, piece, shape) => {
    bits.push({ part, piece, shape });
  };
  const t = m.t;
  if (m.move !== LUNGE_NAME || !LUNGE_SMEARED(t)) return bits;
  const thin = Math.abs(t - LUNGE_HIT - FR) < 1e-6;
  const blades: V3[][] = [[], [], [], []];
  const him: V3[][] = [[], [], [], [], []];
  for (let i = 0; i <= 12; i++) {
    const u = Math.min(t, LUNGE_HIT) - (FR * 1.6 * i) / 12;
    const s = skeletonAt(mob, 'attack', Math.max(0, u));
    const sk = shearsOf(s);
    blades[0].push(sk.tipL);
    blades[1].push(sk.tipR);
    blades[2].push(sk.mid);
    blades[3].push(sk.pivot);
    him[0].push(s.head);
    him[1].push(s.neck);
    him[2].push(s.pelvis);
    him[3].push(s.kneeL);
    him[4].push(s.kneeR);
  }
  smearAlong(st, put, him, thin, ['#2a2c34', '#4a4e5a', '#7e8494', '#b6bccb'], '#9aa0b0');
  smearAlong(st, put, blades, thin, ['#3a3e48', '#6e7480', '#b8bcc6', '#eef0f4'], PINK[1]);
  return bits;
}
const PH_CANVAS3 = { w: 380, h: 280, ax: 120, ay: 186 } as const;
function lunger(base: Mob): Mob {
  const mob: Mob = {
    ...base,
    id: `${base.id}-lunge`,
    attack: { name: LUNGE_NAME, motion: { keys: lungeKeys(), hit: LUNGE_HIT }, rest: R, feet: lungeFeet(), glint: lungeGlint, jaw: lungeJaw } as MobMove,
    hit: LUNGE_HIT,
    warn: LUNGE.held - LUNGE.crouch,
    canvas: PH_CANVAS3,
    aura: { ...base.aura, x: base.aura.x - PH_CANVAS.ax + PH_CANVAS3.ax, y: base.aura.y - PH_CANVAS.ay + PH_CANVAS3.ay },
    bits: (st, m) => [...base.bits(st, m), ...lungeBits(mob, st, m)],
  };
  return mob;
}
/** THE GARDENER WITH THE SHEAR LUNGE (GARDENER_HEDGE): the game's own in all but it. */
export const LUNGE_GARDENER = lunger(PALACE_GARDENER);

/** Where the blades snap shut (tiles before where he began, to his left). */
export function snapAt(): [number, number] {
  const k = shearsOf(skeletonAt(LUNGE_GARDENER, 'attack', LUNGE_HIT));
  return [k.mid[0] / TILE3, k.mid[1] / TILE3];
}
/** Where he is `t` seconds in (the pelvis's place, tiles on from where he began). */
export function lungeOn(t: number): number {
  return skeletonAt(LUNGE_GARDENER, 'attack', t).pelvis[0] / TILE3;
}
/**
 * Whether the lunge strikes a hero `x` tiles before where he began and `y` to his left: in THE LANE as he goes through it (from where he
 * was to the end of it, `half` to either side: at the strike's frames), or within `snap` of where the blades snap shut (at the hit).
 */
export function lungeStrikes(x: number, y: number): boolean {
  const [sx, sy] = snapAt();
  return (x >= 0 && x <= LUNGE.lane && Math.abs(y) <= LUNGE.half) || Math.hypot(x - sx, y - sy) <= LUNGE.snap;
}
