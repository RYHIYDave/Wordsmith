// FLOOR 14'S BOSS, THE PHYSICIAN: HIS MOVES (the art chat for floors 11 to 15, 19 Oct 2026). A MOCK-UP: NOT IN THE
// GAME, behind PHYSICIAN_ON (art/physician.ts, off). His look and brief are art/physician.ts: made on his word of 18 Oct,
// 21:24 Pacific, “Hey go without my say so.  If something is shit I’ll get it to it but you’re doing a great jobs. At
// least for 11-15”, the picks this chat would have marked recommended, and sent him with their films.
//
// HIS MOVES (his doc's four: “a rap with his cane (his basic attack); the Draw, a lunge that steals one of your words,
// which glows over his head until you beat it back out of him; Tonic, vials smashed on the floor that leave clouds of
// the Hush; Rounds, where the patients rise from their beds”):
//   STANDING (art/physician.ts): still over his cane, his beaked head cocking this way and that, as a bird's does.
//   THE WALK: a long, stalking stride, the cane set down with every other step.
//   THE RAP (his blow): the cane lifted high over his right shoulder, his head up, held trembling (THE WARNING); then
//     hips first, a step in, and brought down hard before him; held; drawn back up.
//   THE DRAW: he turns side-on, sinks low and levels the syringe at you, the quill glinting pink (THE WARNING); then a
//     fencer's lunge, the quill thrust its whole reach (THE DRAW); held there while he draws back the plunger and the
//     barrel fills, burning pink (the word drawn out of you); he springs back and lifts the syringe high over his head
//     (the game hangs your word over his head from there: art/physician_shots.ts).
//   TONIC: he thrusts the syringe through his belt, plucks three phials from it, rears back with them over his
//     shoulder, shaking (THE WARNING), and flings them (the game flies them and smashes them, and lays the clouds of
//     the Hush where they burst: art/physician_shots.ts); takes the syringe up again.
//   ROUNDS: he draws himself up, lifts his cane and his head (THE WARNING), raps the cane on the floor three times, and
//     sweeps it round the room, pointing (the game raises the patients from their beds: rings of the Hush from each rap,
//     art/physician_shots.ts).
//   STRUCK: jolted back, the beak knocked up.
//   HIS DEATH: rocked back, his hat knocked off; the cane falls from his hand, the syringe drops, and the words he drew
//     out of the city rise out of him, pink going pale as they go free; his knees give and he folds forward onto the
//     floor, long and black.
//
// By his rulebook: every move through every check the bosses have (art/boss_checks.ts), from in front and behind.
//   test: tsx --test tests/physician.test.ts

import { footwork, kneelHips, kneelSettle, plantBy, plantOf } from './bosses3';
import type { Plant } from './bosses3';
import type { BossShape, CheckLimb, CheckLump, CheckThing } from './boss_checks';
import type { ActorArt } from './actor_types';
import { hash } from './kit';
import { FLAME } from './mkit';
import { PH_BODY, PH_CANVAS, PH_REST, caneOf, clamp01, physicianPainter, physicianStand, sm, syringeOf } from './physician';
import { TILE3, mobSet } from './new_mobs3';
import type { Mob, MobMove, Moment } from './new_mobs3';
import { add, elbowFor, lerp3, mul, norm, solve, sub } from './skeleton';
import type { Bones, Key3, Motion, Posed, Skeleton, V3 } from './skeleton';

type P = Partial<Bones>;
const B = PH_BODY;
const R = PH_REST;
const L0 = plantOf(B, 'L', {}, R);
const R0 = plantOf(B, 'R', {}, R);
const fr = (t: number): number => t - Math.floor(t);

/** Elbows pointed as nearly toward these ways as the arms let them (the figure's own axes). */
function elbowsTo(pose: P, wantL: V3 | null, wantR: V3 | null): P {
  const q = { ...R, ...pose } as Posed;
  const le = wantL ? elbowFor(B, q, true, norm(wantL)) : q.le;
  const re = wantR ? elbowFor(B, { ...q, le } as Posed, false, norm(wantR)) : q.re;
  return { ...pose, le, re };
}
const glintOf = (t: number, a: number, b: number, c: number, d = 0.2): number => (t < a ? 0 : t < b ? sm((t - a) / (b - a)) : t < c ? 1 : t < c + d ? 1 - (t - c) / d : 0);

// =============================================================================================
// THE WALK: long and stalking

export const PH_PACE = 1.0;
export const PH_WALK = { frames: 12, fps: 8 } as const;
function stepFoot(k: number, n: number, step: number, lift: number): [number, number, number] {
  const half = n / 2;
  if (k <= half) return [step * (half / 2 - k), 0, 0];
  const u = (k - half) / half;
  const g = u * u * (3 - 2 * u);
  return [-step * (half / 2) + step * half * g, lift * Math.sin(Math.PI * u), 16 * Math.sin(Math.PI * u) * (1 - u) - 6 * Math.sin(Math.PI * u) * u];
}
function physicianWalk(): Motion {
  const n = PH_WALK.frames;
  const d = (PH_PACE * TILE3) / PH_WALK.fps;
  const keys: Key3[] = [];
  for (let i = 0; i <= n; i++) {
    const j = i % n;
    const a = (j / n) * Math.PI * 2;
    const [lx, lz, lp] = stepFoot(j, n, d, 3.6);
    const [rx, rz, rp] = stepFoot((j + n / 2) % n, n, d, 3.6);
    const sag = Math.abs(Math.sin(a));
    keys.push({
      at: i / PH_WALK.fps,
      ease: 'lin',
      pose: {
        pz: R.pz - 1.1 * sag, py: 0.8 * Math.sin(a), roll: R.roll + 2 * Math.sin(a), yaw: 3 * Math.cos(a), side: 1.0 * Math.sin(a),
        bend: R.bend + 1.5 * sag, pitch: R.pitch + 2, faceUp: R.faceUp - 2 * sag, faceTurn: R.faceTurn + 6 * Math.sin(a * 0.5),
        lfx: lx, lfz: lz, lfp: lp, lfy: R.lfy, lft: R.lft,
        rfx: rx, rfz: rz, rfp: rp, rfy: R.rfy, rft: R.rft,
        // (the cane swung forward with his left foot and set down with it)
        rhx: R.rhx + 3.2 * Math.sin(a + Math.PI), wEl: (R.wEl as number) + 10 * Math.sin(a + Math.PI), lhz: R.lhz + 0.5 * sag,
      },
    });
  }
  return { keys, loop: 0 };
}

// =============================================================================================
// THE RAP

/** His blow: how long; the warning; the rap (a frame of the game's thirty a second). */
export const PH_RAP = { long: 1.5, warn: [0.26, 0.48], hit: 18 / 30 } as const;
const RH = PH_RAP.hit;
/** The cane lifted high over his right shoulder, its tip back over his head; up on his toes, his head up. */
const LIFTED: P = elbowsTo({ px: -1.2, pz: R.pz + 1.2, yaw: -8, twist: -10, pitch: -3, bend: -4, side: 1, faceUp: 6, faceTurn: 4, rhIn: 1, rhx: -1, rhy: -6, rhz: 16, wAz: 160, wEl: 52, wRoll: 0 }, null, [-0.3, -0.8, 0.5]);
const lifted = (k: number): P => ({ ...LIFTED, rhz: (LIFTED.rhz as number) + (k % 2 ? 0.6 : -0.3), pz: (LIFTED.pz as number) + (k % 2 ? 0.2 : 0) });
/** Hips first: the body coming forward, the cane still up. */
const DRIVE: P = elbowsTo({ ...LIFTED, px: 1.2, pz: R.pz + 0.2, yaw: 4, twist: -6, pitch: 8, bend: 2, faceUp: -2, rhx: 1, rhz: 16, wAz: 175, wEl: 64 }, null, [-0.3, -0.8, 0.5]);
/** Over the top: the cane come up over his head on its way down. */
const OVER: P = elbowsTo({ px: 2.9, pz: R.pz - 1.4, yaw: 5, twist: 1, pitch: 14, bend: 8, side: 0, faceUp: 0, faceTurn: 0, rhIn: 1, rhx: 8, rhy: -5, rhz: 10, wAz: 0, wEl: 74, wRoll: 0, lk: 15, rk: -8 }, null, [0, -0.8, 0.4]);
/** THE RAP: the cane brought down hard before him, his body bent over it. */
const RAP: P = elbowsTo({ px: 4.6, pz: R.pz - 3.0, yaw: 6, twist: 8, pitch: 20, bend: 14, side: -1, faceUp: 2, faceTurn: -4, rhIn: 1, rhx: 17, rhy: -3, rhz: -6, wAz: 0, wEl: -20, wRoll: 0, lk: 18, rk: -8 }, null, [0.3, -0.8, -0.4]);
const RAPPED: P = elbowsTo({ ...RAP, px: 5.6, pz: R.pz - 5.6, pitch: 30, bend: 20, rhx: 17.5, rhz: -17, wEl: -70 }, null, [0.3, -0.8, -0.4]);
const RAPPED2: P = elbowsTo({ ...RAPPED, pz: R.pz - 5.7, rhz: -17.5, wEl: -73 }, null, [0.3, -0.8, -0.4]);
function physicianRap(): Motion {
  return {
    hit: RH,
    keys: [
      { at: 0, pose: {} },
      { at: PH_RAP.warn[0], pose: LIFTED, ease: 'io' },
      { at: 0.33, pose: lifted(1), ease: 'io' },
      { at: 0.41, pose: lifted(2), ease: 'io' },
      { at: PH_RAP.warn[1], pose: lifted(3), ease: 'io' },
      { at: RH - 0.08, pose: DRIVE, ease: 'in' },
      { at: RH - 0.04, pose: OVER, ease: 'lin' },
      { at: RH, pose: RAP, ease: 'lin' },
      { at: RH + 0.04, pose: RAPPED, ease: 'out' },
      { at: RH + 0.12, pose: RAPPED2, ease: 'out' },
      { at: 0.94, pose: { ...RAPPED2, pz: R.pz - 2.2, pitch: 16, bend: 12, rhx: 14, rhz: -16, wEl: -66 }, ease: 'io' },
      { at: PH_RAP.long, pose: {}, ease: 'io' },
    ],
  };
}
function physicianRapFeet(): (t: number) => P {
  return footwork(B, {
    L: { start: L0, moves: [{ t0: RH - 0.12, t1: RH - 0.01, to: plantBy(L0, 8, 0.5, 4), lift: 3 }, { t0: 1.06, t1: 1.34, to: L0, lift: 2.6 }] },
    R: { start: R0, moves: [{ t0: RH - 0.06, t1: RH + 0.04, to: { ...R0, pitch: 16 } }, { t0: 1.08, t1: 1.3, to: R0 }] },
  });
}
const rapGlint = (t: number): number => glintOf(t, 0.1, PH_RAP.warn[0], RH);

// =============================================================================================
// THE DRAW

/** The Draw: how long; the warning; the quill thrust home (a frame of the game's thirty a second); the plunger drawn while he holds there; sprung back; the syringe held high from `up`, its plunger pushed home (`push`), the word sent up out of the quill to hang over his head. */
export const PH_DRAW = { long: 2.9, warn: [0.3, 0.76], hit: 27 / 30, draw: [1.0, 1.4], back: 1.62, up: 1.9, push: [2.02, 2.3] } as const;
const DH = PH_DRAW.hit;
/** Side-on, low, the syringe levelled at you in his left hand, the cane back and down for balance. */
const LEVEL: P = elbowsTo({ px: -1.5, pz: R.pz - 3.2, yaw: -34, twist: -14, pitch: 6, bend: 6, side: 1, roll: 0, faceUp: 4, faceTurn: 30, faceTilt: 0, lhIn: 1, lhx: 13, lhy: 3, lhz: -4, rhIn: 1, rhx: -5, rhy: -7, rhz: -20, wAz: -150, wEl: -40, wRoll: 0, lk: 18, rk: -14 }, [-0.2, 0.6, -0.8], [-0.6, -0.6, -0.5]);
const level = (k: number): P => ({ ...LEVEL, lhx: (LEVEL.lhx as number) + (k % 2 ? 0.5 : -0.3), lhz: (LEVEL.lhz as number) + (k % 2 ? 0.3 : -0.2) });
/** The lunge's drive: the hips going first, the arm still drawn. */
const LUNGE_DRIVE: P = elbowsTo({ ...LEVEL, px: 3, pz: R.pz - 4, pitch: 10, lhx: 14, lhz: -3 }, [-0.2, 0.6, -0.8], [-0.6, -0.6, -0.5]);
/** THE DRAW: the long lunge, the arm and the syringe thrust out their whole length. */
const LUNGE: P = elbowsTo({ px: 15, pz: R.pz - 7.5, yaw: -30, twist: -10, pitch: 16, bend: 8, side: 0, roll: 0, faceUp: 4, faceTurn: 26, lhIn: 1, lhx: 26, lhy: 1, lhz: -1, rhIn: 1, rhx: -9, rhy: -8, rhz: -16, wAz: -160, wEl: -30, wRoll: 0, lk: 34, rk: -6 }, [0, 1, -0.3], [-0.6, -0.6, -0.4]);
const LUNGED: P = elbowsTo({ ...LUNGE, px: 15.4, pz: R.pz - 7.8, lhx: 26.4 }, [0, 1, -0.3], [-0.6, -0.6, -0.4]);
/** Holding there as he draws: the hand drawn back a little toward him, the plunger drawn. */
const DRAWING: P = elbowsTo({ ...LUNGE, px: 14.6, pz: R.pz - 7.4, lhx: 25, lhz: 0, faceUp: 6 }, [0, 1, -0.3], [-0.6, -0.6, -0.4]);
/** Sprung back up, the syringe lifted high over his head, the quill to the sky. */
const HIGH: P = elbowsTo({ px: -1, pz: R.pz + 1.0, yaw: -10, twist: -4, pitch: -6, bend: -8, side: 1, faceUp: 26, faceTurn: 8, faceTilt: 4, lhIn: 1, lhx: 3, lhy: 3, lhz: 17, rhIn: 1, rhx: 8, rhy: -6, rhz: -24, wAz: -14, wEl: -72, wRoll: 0, lk: 6, rk: -6 }, [-0.2, 0.9, 0.2], [-0.4, -0.75, -0.5]);
const high = (k: number): P => ({ ...HIGH, lhz: (HIGH.lhz as number) + (k % 2 ? 0.6 : 0), faceTilt: (HIGH.faceTilt as number) + (k % 2 ? 4 : -2) });
function physicianDraw(): Motion {
  return {
    hit: DH,
    keys: [
      { at: 0, pose: {} },
      { at: PH_DRAW.warn[0], pose: LEVEL, ease: 'io' },
      { at: 0.42, pose: level(1), ease: 'io' },
      { at: 0.54, pose: level(2), ease: 'io' },
      { at: 0.66, pose: level(3), ease: 'io' },
      { at: PH_DRAW.warn[1], pose: level(4), ease: 'io' },
      { at: DH - 0.08, pose: LUNGE_DRIVE, ease: 'in' },
      { at: DH, pose: LUNGE, ease: 'lin' },
      { at: PH_DRAW.draw[0], pose: LUNGED, ease: 'out' },
      { at: PH_DRAW.draw[1], pose: DRAWING, ease: 'io' },
      { at: PH_DRAW.back, pose: { ...HIGH, px: 2, pz: R.pz - 1.5, faceUp: 14, lhz: 8, lhx: 8 }, ease: 'io' },
      { at: PH_DRAW.up, pose: HIGH, ease: 'out' },
      { at: 2.12, pose: high(1), ease: 'io' },
      { at: PH_DRAW.push[1], pose: high(2), ease: 'io' },
      { at: PH_DRAW.long, pose: {}, ease: 'io' },
    ],
  };
}
function physicianDrawFeet(): (t: number) => P {
  return footwork(B, {
    L: { start: L0, moves: [{ t0: 0.08, t1: 0.3, to: plantBy(L0, 2, 0.5, -26), lift: 2.4 }, { t0: DH - 0.12, t1: DH - 0.01, to: plantBy(L0, 22, 1, -24), lift: 3.4 }, { t0: PH_DRAW.draw[1] + 0.02, t1: PH_DRAW.back + 0.06, to: plantBy(L0, 1, 0.5, -8), lift: 3.2 }, { t0: 2.44, t1: 2.74, to: L0, lift: 2 }] },
    R: { start: R0, moves: [{ t0: 0.12, t1: 0.3, to: plantBy(R0, -3, -1, -34), lift: 2.2 }, { t0: DH - 0.06, t1: DH + 0.04, to: { ...plantBy(R0, -3, -1, -34), pitch: 20 } }, { t0: PH_DRAW.draw[1] + 0.06, t1: PH_DRAW.back + 0.1, to: plantBy(R0, -1, -0.5, -10), lift: 2.6 }, { t0: 2.48, t1: 2.78, to: R0, lift: 2 }] },
  });
}
const drawGlint = (t: number): number => glintOf(t, 0.14, PH_DRAW.warn[0], DH);
/** The plunger drawn back, and the barrel filling, as he holds the lunge; pushed home over his head. */
const drawPlunger = (t: number): number => (t < PH_DRAW.push[0] ? sm((t - PH_DRAW.draw[0]) / (PH_DRAW.draw[1] - PH_DRAW.draw[0])) : 1 - sm((t - PH_DRAW.push[0]) / (PH_DRAW.push[1] - PH_DRAW.push[0])));

// =============================================================================================
// TONIC

/** Tonic: how long; the syringe to his belt and the phials plucked; the warning (reared back with them); flung (a frame of the game's thirty a second); the syringe taken up again. */
export const PH_TONIC = { long: 2.0, stow: [0.06, 0.2], pluck: 0.32, warn: [0.44, 0.72], hit: 25 / 30, unstow: [1.5, 1.72] } as const;
const TH = PH_TONIC.hit;
const AT_BELT: P = elbowsTo({ pz: R.pz - 0.4, yaw: 6, twist: 6, pitch: 8, bend: 10, faceUp: -10, faceTurn: -10, lhIn: 1, lhx: 2.5, lhy: 3.2, lhz: -24 }, [-0.4, 0.8, -0.3], null);
const PLUCKED: P = elbowsTo({ ...AT_BELT, lhx: 4, lhy: 4, lhz: -18, faceUp: -2 }, [-0.4, 0.8, -0.3], null);
/** Reared back, the phials over his left shoulder in his hand, his body wound round. */
const REARED: P = elbowsTo({ px: -3, pz: R.pz + 1.0, yaw: 20, twist: 22, pitch: -9, bend: -12, side: -1.5, faceUp: 14, faceTurn: -10, lhIn: 1, lhx: -7, lhy: 9, lhz: 21, rhIn: 1, rhx: 9, rhy: -7, rhz: -22, wAz: -10, wEl: -70, wRoll: 0, lk: 4, rk: -14 }, [-0.4, 0.7, 0.4], [-0.4, -0.75, -0.5]);
const reared = (k: number): P => ({ ...REARED, lhz: (REARED.lhz as number) + (k % 2 ? 0.6 : -0.3), twist: (REARED.twist as number) + (k % 2 ? 1.5 : 0) });
const THROW_DRIVE: P = elbowsTo({ ...REARED, px: 0.5, yaw: 8, twist: 12, pitch: 4, bend: -2, lhx: -4, lhz: 21 }, [-0.4, 0.7, 0.4], [-0.4, -0.75, -0.5]);
/** FLUNG: his arm come over and out before him, the phials leaving his hand. */
const FLUNG: P = elbowsTo({ px: 5.5, pz: R.pz - 2.6, yaw: -12, twist: -14, pitch: 18, bend: 14, side: 0, faceUp: 8, faceTurn: 6, lhIn: 1, lhx: 21, lhy: 1, lhz: 8, rhIn: 1, rhx: 7, rhy: -7, rhz: -24, wAz: -14, wEl: -70, wRoll: 0, lk: 18, rk: -8 }, [0, 0.9, -0.3], [-0.4, -0.75, -0.5]);
const THROUGH: P = elbowsTo({ ...FLUNG, px: 5, pz: R.pz - 2.6, pitch: 20, bend: 14, lhx: 15, lhy: -2, lhz: -10, twist: -18 }, [0, 0.9, -0.4], [-0.4, -0.75, -0.5]);
function physicianTonic(): Motion {
  return {
    hit: TH,
    keys: [
      { at: 0, pose: {} },
      { at: PH_TONIC.stow[1], pose: AT_BELT, ease: 'io' },
      { at: PH_TONIC.pluck, pose: PLUCKED, ease: 'io' },
      { at: PH_TONIC.warn[0], pose: REARED, ease: 'out' },
      { at: 0.54, pose: reared(1), ease: 'io' },
      { at: 0.63, pose: reared(2), ease: 'io' },
      { at: PH_TONIC.warn[1], pose: reared(3), ease: 'io' },
      { at: TH - 0.07, pose: THROW_DRIVE, ease: 'in' },
      { at: TH, pose: FLUNG, ease: 'lin' },
      { at: TH + 0.16, pose: THROUGH, ease: 'out' },
      { at: 1.3, pose: { ...THROUGH, px: 2.5, pz: R.pz - 1.2, pitch: 10, bend: 10, lhx: 10, lhz: -12 }, ease: 'io' },
      { at: PH_TONIC.unstow[0], pose: AT_BELT, ease: 'io' },
      { at: PH_TONIC.long, pose: {}, ease: 'io' },
    ],
  };
}
function physicianTonicFeet(): (t: number) => P {
  return footwork(B, {
    L: { start: L0, moves: [{ t0: TH - 0.12, t1: TH - 0.01, to: plantBy(L0, 8, 0.5, 2), lift: 3 }, { t0: 1.24, t1: 1.5, to: L0, lift: 2.4 }] },
    R: { start: R0, moves: [{ t0: 0.36, t1: 0.46, to: { ...R0, turn: R0.turn + 14 } }, { t0: TH - 0.06, t1: TH + 0.04, to: { ...R0, pitch: 16 } }, { t0: 1.26, t1: 1.48, to: R0 }] },
  });
}

// =============================================================================================
// ROUNDS

/** Rounds: how long; the warning (drawn up, cane lifted); the three raps of the cane on the floor; the sweep round the room. */
export const PH_ROUNDS = { long: 2.4, warn: [0.18, 0.46], raps: [0.62, 0.92, 1.22], sweep: [1.36, 2.0] } as const;
/** Drawn up tall, his head up, the cane lifted up before him in his fist, upright. */
const DRAWN_UP: P = elbowsTo({ px: -0.8, pz: R.pz + 1.6, pitch: -5, bend: -8, faceUp: 22, faceTurn: 0, rhIn: 1, rhx: 8, rhy: -6, rhz: 8, wAz: -4, wEl: 62, wRoll: 0, lhz: (R.lhz as number) + 2 }, null, [-0.4, -0.8, -0.2]);
const drawnUp = (k: number): P => ({ ...DRAWN_UP, pz: (DRAWN_UP.pz as number) + (k % 2 ? 0.3 : 0), faceTilt: k % 2 ? 6 : -4, rhz: (DRAWN_UP.rhz as number) + (k % 2 ? 0.6 : 0) });
/** The cane rapped down on the floor before his right foot, his body dipping with it. */
const RAPDOWN: P = elbowsTo({ px: 1.2, pz: R.pz - 1.6, pitch: 10, bend: 8, faceUp: 4, rhIn: 1, rhx: 13, rhy: -6, rhz: -21, wAz: -6, wEl: -82, wRoll: 0, lk: 10, rk: -8 }, null, [-0.4, -0.8, -0.4]);
/** Lifted again between the raps, the cane up off the floor before him. */
const RAPUP: P = elbowsTo({ px: 0, pz: R.pz + 0.8, pitch: 0, bend: -2, faceUp: 14, rhIn: 1, rhx: 9, rhy: -6, rhz: 2, wAz: -4, wEl: 30, wRoll: 0 }, null, [-0.4, -0.8, -0.3]);
/** The sweep: the cane pointed round the room at arm's length, from his right to his left. */
const POINT = (side: number): P => elbowsTo({ px: 2, pz: R.pz - 0.4, yaw: side * 26, twist: side * 20, pitch: 6, bend: 4, faceUp: 8, faceTurn: side * 28, rhIn: 1, rhx: 18, rhy: -5 + side * 5, rhz: 1, wAz: side * 52, wEl: -8, wRoll: 0, lk: 8, rk: -8 }, null, [-0.2, -0.9, -0.2]);
function physicianRounds(): Motion {
  const [r1, r2, r3] = PH_ROUNDS.raps;
  return {
    keys: [
      { at: 0, pose: {} },
      { at: PH_ROUNDS.warn[0], pose: DRAWN_UP, ease: 'io' },
      { at: 0.32, pose: drawnUp(1), ease: 'io' },
      { at: PH_ROUNDS.warn[1], pose: drawnUp(2), ease: 'io' },
      { at: r1, pose: RAPDOWN, ease: 'in' },
      { at: r1 + 0.15, pose: RAPUP, ease: 'out' },
      { at: r2, pose: RAPDOWN, ease: 'in' },
      { at: r2 + 0.15, pose: RAPUP, ease: 'out' },
      { at: r3, pose: RAPDOWN, ease: 'in' },
      { at: r3 + 0.08, pose: { ...RAPDOWN, pz: R.pz - 1.9, pitch: 11, rhz: -21.5 }, ease: 'out' },
      { at: PH_ROUNDS.sweep[0], pose: POINT(-1), ease: 'io' },
      { at: 1.68, pose: POINT(0), ease: 'io' },
      { at: PH_ROUNDS.sweep[1], pose: POINT(1), ease: 'io' },
      { at: PH_ROUNDS.long, pose: {}, ease: 'io' },
    ],
  };
}

// =============================================================================================
// STRUCK

export const PH_REEL = 0.4;
function physicianReel(): Motion {
  return {
    keys: [
      { at: 0, pose: {} },
      { at: 0.06, pose: { px: -2.6, pz: R.pz + 0.4, pitch: -4, bend: -6, faceUp: R.faceUp + 26, faceTilt: R.faceTilt + 8, lhx: (R.lhx as number) - 2, lhz: (R.lhz as number) + 2, rhx: (R.rhx as number) - 2, out: 0.1 }, ease: 'out' },
      { at: 0.18, pose: { px: -1.0, pitch: 3, bend: 6, faceUp: R.faceUp + 8 }, ease: 'io' },
      { at: PH_REEL, pose: {}, ease: 'io' },
    ],
  };
}

// =============================================================================================
// HIS DEATH

export const PH_DIES = { long: 2.8, hat: 0.16, cane: 0.3, syringe: 0.42, words: [0.3, 2.3], knees: 1.05, down: 2.1 } as const;
const DIE_FEET = ((): Record<'L' | 'R', Plant> => ({ L: plantBy(L0, R0.at[0] - L0.at[0] + 3, 0), R: R0 }))();
const TUCK = 56;
const KNEE_DOWN = B.legR[1] * 1.3;
const kneeling = (lean: number, body: P): P => kneelSettle(B, R, { ...kneelHips(B, R, DIE_FEET, TUCK, KNEE_DOWN, lean), ...body }, DIE_FEET, TUCK, KNEE_DOWN);
const HANG = -(B.upperArm + B.foreArm) * 0.9;
const HANGING: P = { lhIn: 0, lhx: 3, lhy: 8, lhz: HANG + 4, le: -10, rhIn: 0, rhx: 3, rhy: -8, rhz: HANG + 4, re: 10 };
/** His arms laid on the floor where his body puts them: each hand `back` behind its shoulder and `out` to its side. */
function limp(body: P, back: number, out: number): P {
  const s = solve(B, { ...R, ...body, lhIn: 0, rhIn: 0 } as Posed);
  const at = (sh: V3, side: number): V3 => [sh[0] - back, sh[1] + side * out, 2.4];
  const Lh = at(s.shoulderL, 1);
  const Rh = at(s.shoulderR, -1);
  const q = { ...R, ...body, lhIn: 2, lhx: Lh[0], lhy: Lh[1], lhz: Lh[2], rhIn: 2, rhx: Rh[0], rhy: Rh[1], rhz: Rh[2] } as Posed;
  const le = elbowFor(B, q, true, norm([0, 1, -0.4]));
  const re = elbowFor(B, { ...q, le } as Posed, false, norm([0, -1, -0.4]));
  return { ...body, lhIn: 2, lhx: Lh[0], lhy: Lh[1], lhz: Lh[2], rhIn: 2, rhx: Rh[0], rhy: Rh[1], rhz: Rh[2], le, re };
}
const lifted2 = (p: P, dz: number): P => ({ ...p, pz: (p.pz as number) + dz });
const ON_KNEES: P = kneeling(6, { yaw: 0, pitch: 2, roll: 2, twist: 0, bend: 4, side: 1, faceTurn: 0, faceUp: 6, faceTilt: 10, ...HANGING });
const FOLD: P = kneeling(14, { yaw: 4, pitch: 28, roll: 3, twist: 0, bend: 22, side: 1, faceTurn: 6, faceUp: -26, faceTilt: 8, ...HANGING });
const SLUMP: P = limp(kneeling(30, { yaw: 6, pitch: 62, roll: 2, twist: 0, bend: 24, side: 0, faceTurn: 14, faceUp: -40, faceTilt: 14 }), 8, 10);
const PRONE: P = { ...limp(lifted2(kneeling(66, { yaw: 8, pitch: 80, roll: 6, twist: 0, bend: 8, side: 0, faceTurn: 30, faceUp: -30, faceTilt: 22 }), 2.2), 22, 9), out: 1 };
function physicianDying(): Motion {
  return {
    keys: [
      { at: 0, pose: {} },
      { at: 0.08, pose: { px: -2.6, pz: R.pz + 0.4, pitch: -4, bend: -6, faceUp: R.faceUp + 26, out: 0.15 }, ease: 'out' },
      { at: 0.36, pose: { px: -2.4, pz: R.pz + 0.8, pitch: -8, bend: -14, faceUp: 34, faceTilt: 0, faceTurn: 0, lhIn: 1, lhx: 1, lhy: 7, lhz: -16, rhIn: 1, rhx: 1, rhy: -7, rhz: -16, out: 0.45 }, ease: 'out' },
      { at: 0.62, pose: { px: -2.0, pz: R.pz + 0.4, pitch: -7, bend: -12, faceUp: 30, faceTilt: 6, lhIn: 1, lhx: 1.4, lhy: 6.5, lhz: -18, rhIn: 1, rhx: 1.4, rhy: -6.5, rhz: -18, out: 0.85 }, ease: 'io' },
      { at: 0.82, pose: { px: -0.6, pz: R.pz - 5.5, pitch: 2, bend: 2, faceUp: 12, lk: 26, rk: -26, ...HANGING, out: 1 }, ease: 'in' },
      { at: PH_DIES.knees, pose: { ...ON_KNEES, out: 1 }, ease: 'out' },
      { at: 1.3, pose: { ...ON_KNEES, pz: (ON_KNEES.pz as number) + 0.6, pitch: -2, roll: -3, faceUp: 10, out: 1 }, ease: 'io' },
      { at: 1.56, pose: { ...ON_KNEES, pitch: 8, roll: 4, faceUp: -6, out: 1 }, ease: 'io' },
      { at: 1.76, pose: { ...FOLD, out: 1 }, ease: 'in' },
      { at: 1.92, pose: { ...SLUMP, out: 1 }, ease: 'lin' },
      { at: PH_DIES.down, pose: PRONE, ease: 'out' },
      { at: PH_DIES.long, pose: PRONE, ease: 'io' },
    ],
  };
}
function physicianDyingFeet(): (t: number) => P {
  const F = DIE_FEET;
  return footwork(B, {
    L: { start: L0, moves: [{ t0: 0.04, t1: 0.26, to: F.L, lift: 2.4 }, { t0: 0.66, t1: 0.98, to: { ...F.L, pitch: TUCK } }] },
    R: { start: F.R, moves: [{ t0: 0.66, t1: 0.98, to: { ...F.R, pitch: TUCK } }] },
  });
}
/** THE WORDS GOING FREE as he dies: grains of the enemy's pink rising out of his syringe and his phials, going pale as they rise. */
const FREED = ['#7a7468', '#a49c8c', '#cec6b2', '#e8e2d2', '#f6f2e6'];
function wordsFree(out: [V3, string, number][], s: Skeleton, t: number): void {
  const [a, b] = PH_DIES.words;
  if (t < a || t > b) return;
  const pour = sm((t - a) / 0.3) * (1 - sm((t - (b - 0.5)) / 0.5));
  const N = Math.round(60 * pour);
  const from = [lerp3(s.ribs, s.neck, 0.3), add(s.pelvis, mul(s.hips[2], 3))];
  for (let i = 0; i < N; i++) {
    const life = fr(t * 0.7 + i / 60 + 0.19 * hash(i, 3, 7651));
    const o = from[i % 2];
    const ang = i * 2.39996;
    const r = (2 + 8 * hash(i, 4, 7651)) * (1 + life);
    const p: V3 = [o[0] + Math.cos(ang + life * 2) * r, o[1] + Math.sin(ang + life * 2) * r, o[2] + life * 50 + Math.sin(life * 9 + i) * 1.5];
    const pale = life > 0.6 - 0.4 * sm((t - a) / 1.2);
    out.push([p, pale ? FREED[life > 0.85 ? 4 : 3] : life < 0.25 ? FLAME[3] : FLAME[2], life < 0.4 ? 2 : 1]);
  }
}

// =============================================================================================
// WHAT EACH MOVE TELLS HIS PAINTER

/** His moves' names, as the game holds them (a moment says which move it is of by its name). */
export const NAMES = { stand: 'The Physician stands, watching', walk: 'The Physician stalks', attack: 'The rap of his cane', draw: 'The Draw', tonic: 'Tonic', rounds: 'Rounds', reel: 'The Physician is struck', dying: 'The Physician falls' } as const;
const KEY_OF = new Map<string, string>(Object.entries(NAMES).map(([k, v]) => [v, k]));
const keyOf = (m: Moment): string => (m.dying ? 'dying' : KEY_OF.get(m.move ?? '') ?? '');

/** How the syringe sits in his hand: cocked up at rest, straight along his arm as he thrusts it, up to the sky held high. */
function cockOf(m: Moment): number {
  const t = m.t;
  switch (keyOf(m)) {
    case 'draw':
      return t < PH_DRAW.warn[0] ? 1.6 * (1 - sm(t / PH_DRAW.warn[0])) : t < PH_DRAW.draw[1] ? 0 : t < PH_DRAW.push[1] ? 0.8 * sm((t - PH_DRAW.draw[1]) / 0.4) : 0.8 + 0.8 * sm((t - PH_DRAW.push[1]) / (PH_DRAW.long - PH_DRAW.push[1]));
    default:
      return 1.6;
  }
}

function physicianMob(): Mob {
  const paint = physicianPainter({
    cane: (m) => !(m.dying && m.t >= PH_DIES.cane),
    syringe: (m) => (keyOf(m) === 'tonic' && m.t >= PH_TONIC.stow[0] + 0.08 && m.t < PH_TONIC.unstow[1] ? 'belt' : 'hand'),
    plunger: (m) => (keyOf(m) === 'draw' ? drawPlunger(m.t) : 0),
    fill: (m) => (keyOf(m) === 'draw' ? drawPlunger(m.t) : 0),
    inHand: (m) => (keyOf(m) === 'tonic' && m.t >= PH_TONIC.pluck - 0.04 && m.t < TH ? 3 : 0),
    onBelt: (m) => (keyOf(m) === 'tonic' && m.t >= PH_TONIC.pluck - 0.04 && m.t < PH_TONIC.long - 0.06 ? 2 : 5),
    hat: (m) => !(m.dying && m.t >= PH_DIES.hat),
    cock: cockOf,
    glintOn: (m) => (keyOf(m) === 'draw' ? 'syringe' : 'cane'),
    grains: (m, out) => {
      if (m.dying) wordsFree(out, m.s, m.t);
    },
  });
  const mv = (name: string, motion: Motion, more: Partial<MobMove> = {}): MobMove => ({ name, motion, rest: R, ...more });
  return {
    id: 'physician',
    name: 'The Physician',
    size: "a boss: tall and thin, a head taller than the knight",
    build: B,
    stand: mv(NAMES.stand, physicianStand()),
    attack: mv(NAMES.attack, physicianRap(), { feet: physicianRapFeet(), glint: rapGlint }),
    idleFrames: 32,
    idleFps: 10,
    walk: mv(NAMES.walk, physicianWalk(), { period: PH_WALK.frames / PH_WALK.fps, ground: PH_PACE * TILE3 }),
    walkFrames: PH_WALK.frames,
    walkFps: PH_WALK.fps,
    pace: PH_PACE,
    more: {
      draw: mv(NAMES.draw, physicianDraw(), { feet: physicianDrawFeet(), glint: drawGlint }),
      tonic: mv(NAMES.tonic, physicianTonic(), { feet: physicianTonicFeet() }),
      rounds: mv(NAMES.rounds, physicianRounds()),
    },
    reel: mv(NAMES.reel, physicianReel(), { glint: (t) => (t < 0.3 ? 1 - t / 0.3 : 0) }),
    reelTime: PH_REEL,
    hit: RH,
    warn: PH_RAP.warn[1] - PH_RAP.warn[0],
    dieTime: PH_DIES.long,
    dying: mv(NAMES.dying, physicianDying(), { feet: physicianDyingFeet() }),
    aura: { x: PH_CANVAS.ax, y: PH_CANVAS.ay - 60, r: 70, color: '#ff3a78', a: 0.1 },
    shadow: 14,
    canvas: PH_CANVAS,
    trueBack: true,
    bits: paint.bits,
    grains: paint.grains,
    // (his hat knocked off behind him; the cane fallen to his right; the syringe dropped before him to his left)
    fall(piece) {
      if (piece === 'hat') return { from: PH_DIES.hat, to: [-30, 18], spin: 140, lay: 'keep', hop: 2.6, rise: 8 };
      if (piece === 'cane') return { from: PH_DIES.cane, to: [10, -34], spin: 30, lay: 'axis', hop: 1.0 };
      if (piece === 'syringe') return { from: PH_DIES.syringe, to: [26, 30], spin: 60, lay: 'axis', hop: 1.2 };
      return null;
    },
  };
}
export const PHYSICIAN = physicianMob();
export function makePhysicianArt(mob: Mob = PHYSICIAN, pace = mob.pace): ActorArt {
  return { front: mobSet(mob, 'front', pace), back: mobSet(mob, 'back', pace) };
}

// =============================================================================================
// HIM AS THE CHECKS SEE HIM (art/boss_checks.ts)

const len3 = (v: V3): number => Math.hypot(v[0], v[1], v[2]);
export function physicianSolids(s: Skeleton): { limbs: CheckLimb[]; lumps: CheckLump[] } {
  const [rH, rK, rA] = B.legR;
  const [r0, r1] = B.armR;
  const limbs: CheckLimb[] = [];
  for (const side of ['L', 'R'] as const) {
    const L = side === 'L';
    limbs.push(
      { name: `leg${side}`, a: L ? s.hipL : s.hipR, b: L ? s.kneeL : s.kneeR, r: rH * 1.1 },
      { name: `shin${side}`, a: L ? s.kneeL : s.kneeR, b: L ? s.ankleL : s.ankleR, r: Math.max(rK, rA) * 1.2 },
      { name: `foot${side}`, a: add(L ? s.heelL : s.heelR, [0, 0, 1.6]), b: add(L ? s.toeL : s.toeR, [0, 0, 1.6]), r: 1.8 },
      { name: `upper${side}`, a: L ? s.shoulderL : s.shoulderR, b: L ? s.elbowL : s.elbowR, r: r0 * 1.24 },
      { name: `fore${side}`, a: L ? s.elbowL : s.elbowR, b: L ? s.handL : s.handR, r: r1 * 1.24 },
    );
  }
  limbs.push({ name: 'neck', a: s.neck, b: lerp3(s.neck, s.head, 0.5), r: 2.6 });
  const waistC = add(s.pelvis, mul(s.hips[2], B.waist * 0.6));
  const lumps: CheckLump[] = [
    { name: 'head', c: s.head, rot: s.face, h: [B.headR[0] * 1.3, B.headR[1] * 1.3, B.headR[2] * 1.2] },
    { name: 'chest', c: lerp3(s.ribs, s.neck, 0.3), rot: s.chest, h: [B.ribDeep + 2.0, B.ribHalf + 2.0, len3(sub(s.neck, s.ribs)) * 0.55] },
    { name: 'belly', c: lerp3(waistC, s.ribs, 0.45), rot: s.belly, h: [B.waistDeep + 1.8, B.waistHalf + 1.8, Math.max(3, len3(sub(s.ribs, waistC)) * 0.6)] },
    { name: 'hips', c: add(s.pelvis, mul(s.hips[2], B.waist * 0.2)), rot: s.hips, h: [B.pelvisDeep + 2.2, B.pelvisHalf + 2.2, B.waist * 0.75] },
  ];
  return { limbs, lumps };
}
/** His cane and syringe as the checks see them, while they are his. */
function heldThings(move: string, t: number, s: Skeleton): CheckThing[] {
  const out: CheckThing[] = [];
  if (!(move === 'dying' && t >= PH_DIES.cane)) {
    const c = caneOf(s);
    out.push({ name: 'cane', pts: [c.knob, lerp3(c.knob, c.tip, 0.33), lerp3(c.knob, c.tip, 0.66), c.tip], r: 0.7, may: ['foreR'] });
  }
  const inBelt = move === 'tonic' && t >= PH_TONIC.stow[0] + 0.08 && t < PH_TONIC.unstow[1];
  if (!inBelt && !(move === 'dying' && t >= PH_DIES.syringe)) {
    const m = { dying: move === 'dying', move: (NAMES as Record<string, string>)[move], t } as unknown as Moment;
    const sy = syringeOf(s, cockOf(m));
    out.push({ name: 'syringe', pts: [sy.back, lerp3(sy.back, sy.mouth, 0.5), sy.mouth, sy.tip], r: 1.4, may: ['foreL'] });
  }
  return out;
}
export const PH_SHAPE: BossShape = {
  body: physicianSolids,
  // (what he strikes with: the cane's ferrule in his rap)
  tip: (move, _t, s) => (move === 'attack' ? caneOf(s).tip : null),
  things: heldThings,
};
void clamp01;
