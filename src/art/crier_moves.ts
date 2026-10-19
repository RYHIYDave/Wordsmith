// FLOOR 11'S BOSS, THE CRIER: HIS MOVES (the art chat for floors 11 to 15, 18 Oct 2026). A MOCK-UP: NOT IN
// THE GAME, behind CRIER (art/crier.ts, off). His look and his brief are art/crier.ts.
//
// His brief (18 Oct, Pacific): he moves “Heavy and pompous, then sudden (Recommended)”; of the fight, “I think we
// want a smaller, quick moving, no frills fight”; his moves, “Yes, these four (Recommended)”: a swing of the
// trumpet (his basic), the Silent Shout, the Proclamation, the Crowd; his death, “The Hush pours out of him”. To
// his look, made bigger at his word (“Bigger at game size”), “Yes, animate him (Recommended)”.
//
// By the art rulebook, as every boss: built on the bones; weight in every blow (a wind-up held: the warning; a
// follow-through); his feet grip the floor; his coat, plume and queue follow; alive when still; every move
// through every boss check (art/boss_checks.ts), from in front and from behind; effects as big and wild as they
// go. He is POMPOUS AND SUDDEN: he marches chest out like the head of a parade and stands rocking on his heels,
// pleased with himself; then all at once he is at you.
//
// What the moves do to the floor (the Silent Shout's cone, the Proclamation's scroll, the Crowd's call) are
// painted by art/crier_shots.ts, as the game paints a boss's shots. Every move begins and ends in his stand, where
// it began: none of them carries him (the game moves him by his walk).

import { between, footwork, kneelHips, kneelSettle, plantBy, plantOf } from './bosses3';
import type { FootTrack, Plant } from './bosses3';
import type { BossShape, CheckLimb, CheckLump, CheckThing } from './boss_checks';
import { BELL_R, CROWD_NAME, CR_BASE, CR_BODY, CR_CANVAS, CR_CROWD, CR_DIE_TIME, CR_HAT_GOES, CR_K, CR_PROCLAIM, CR_SHOUT, CR_SWING_HIT, CR_TRUMPET_GOES, D, PROCLAIM_NAME, SHOUT_NAME, SWING_NAME, TRUMPET_LEN, clamp01, coatSkirts, crierBits, trumpetOf, trumpetR, waistOf } from './crier';
export { CROWD_NAME, CR_CROWD, CR_DIE_TIME, CR_HAT_GOES, CR_PROCLAIM, CR_SHOUT, CR_SWING_HIT, CR_TRUMPET_GOES, PROCLAIM_NAME, SHOUT_NAME, SWING_NAME };
import type { P } from './crier';
import type { ActorArt } from './actor_types';
import { TILE3, mobSet } from './new_mobs3';
import type { Mob, MobMove } from './new_mobs3';
import { add, dot, elbowFor, heading, len, lerp3, mul, norm, solve, sub } from './skeleton';
import type { Bones, Key3, Motion, Posed, Skeleton, V3 } from './skeleton';

const B = CR_BODY;
const K = CR_K;

/** His elbows pointed as nearly toward these ways as his arms let them (the figure's own axes). */
function elbowsTo(pose: P, wantL: V3 | null, wantR: V3 | null, rest: Bones = CR_BASE): P {
  const q = { ...rest, ...pose } as Posed;
  const le = wantL ? elbowFor(B, q, true, norm(wantL)) : q.le;
  const re = wantR ? elbowFor(B, { ...q, le } as Posed, false, norm(wantR)) : q.re;
  return { ...pose, le, re };
}
/** The trumpet in his right hand: his hand at `hand` (on the floor's own axes, from his place), the trumpet running `way` from its mouthpiece to its bell, his hand `draw` of the way up it (0 at the mouthpiece, 1 at its middle); his left hand `left` along it from his right toward the bell, or free (null). */
function grip(hand: V3, way: V3, draw: number, left: number | null): P {
  const w = norm(way);
  return { rhIn: 2, rhx: hand[0], rhy: hand[1], rhz: hand[2], wAz: Math.atan2(w[1], w[0]) / D, wEl: Math.asin(Math.max(-1, Math.min(1, w[2]))) / D, draw, ...(left === null ? {} : { lhIn: 3 as const, lhx: left, lhy: 0, lhz: 0 }) };
}
/** A held pose trembling: his right hand (and the trumpet) up or down a little, and whatever else is said. */
const trembling = (pose: P, dz: number, more: P = {}): P => ({ ...pose, rhz: (pose.rhz as number) + dz, ...more });

// ---------------------------------------------------------------------------------------------
// A QUICK BLOW AS ONE SMOOTH SWEEP (as the Headsman's): said by the poses it goes THROUGH, and made into a key at
// every frame the game shows along one smooth curve through them (every number of the body, and the way the
// trumpet runs, as a way, not as angles), going on through each without stopping, at rest only at the first and last.

const SMOOTHED = ['px', 'py', 'pz', 'yaw', 'pitch', 'roll', 'twist', 'bend', 'side', 'faceTurn', 'faceUp', 'faceTilt', 'lhx', 'lhy', 'lhz', 'rhx', 'rhy', 'rhz', 'le', 're', 'lk', 'rk', 'draw', 'gale'] as const;
const hermite = (a: number, b: number, ma: number, mb: number, u: number): number => {
  const u2 = u * u;
  const u3 = u2 * u;
  return (2 * u3 - 3 * u2 + 1) * a + (u3 - 2 * u2 + u) * ma + (-2 * u3 + 3 * u2) * b + (u3 - u2) * mb;
};
function sweep(ctrls: ReadonlyArray<{ at: number; pose: P }>, rest: Bones): Key3[] {
  const full = ctrls.map((c) => ({ at: c.at, q: { ...rest, ...c.pose } as Bones }));
  const n = full.length;
  const slope = (vals: number[], i: number): number => (i === 0 || i === n - 1 ? 0 : (vals[i + 1] - vals[i - 1]) / (full[i + 1].at - full[i - 1].at));
  const series: Record<string, number[]> = {};
  for (const f of SMOOTHED) series[f] = full.map((c) => c.q[f] as number);
  const ways = full.map((c) => heading(c.q.wAz, c.q.wEl));
  const wseries = [0, 1, 2].map((k) => ways.map((w) => w[k]));
  const keys: Key3[] = [];
  const first = full[0].at;
  const last = full[n - 1].at;
  let lastAz: number | undefined;
  const one = (t: number): Key3 => {
    let i = 0;
    while (i < n - 2 && t > full[i + 1].at) i++;
    const T = full[i + 1].at - full[i].at;
    const u = T > 0 ? (t - full[i].at) / T : 1;
    const at = (vals: number[]): number => hermite(vals[i], vals[i + 1], slope(vals, i) * T, slope(vals, i + 1) * T, u);
    const pose: Record<string, number> = {};
    for (const f of SMOOTHED) pose[f] = at(series[f]);
    const w = norm([at(wseries[0]), at(wseries[1]), at(wseries[2])] as V3, [0, 0, 1]);
    let az = Math.atan2(w[1], w[0]) / D;
    if (lastAz !== undefined) az -= 360 * Math.round((az - lastAz) / 360);
    lastAz = az;
    return { at: t, ease: 'lin', pose: { ...(pose as P), wAz: az, wEl: Math.asin(Math.max(-1, Math.min(1, w[2]))) / D, lhIn: full[0].q.lhIn, rhIn: full[0].q.rhIn } };
  };
  for (let fi = Math.ceil(first * 30 + 1e-6); fi / 30 <= last + 1e-9; fi++) keys.push(one(Math.min(last, fi / 30)));
  if (keys.length && keys[keys.length - 1].at < last - 1e-6) keys.push(one(last));
  return keys;
}

// ---------------------------------------------------------------------------------------------
// HIS STAND, whence every move begins and where it ends.

export const CR_READY: Bones = { ...CR_BASE };
const R = CR_READY;
const L0 = plantOf(B, 'L', {}, R);
const R0 = plantOf(B, 'R', {}, R);

/** How the trumpet's throat flares as he holds a blow (0 its glow to 1 blazing): up as it is held, full just before it goes, dying after. */
function heldBurn(from: number, full: number, hit: number, after = 0.25): (t: number) => number {
  return (t) => (t < from ? 0.2 : t < full ? 0.2 + (0.8 * (t - from)) / (full - from) : t < hit + after ? 1 : t < hit + after + 0.3 ? 1 - (0.8 * (t - hit - after)) / 0.3 : 0.2);
}

// STANDING, PLEASED WITH HIMSELF: his chest swelling with his breath, rocking up onto his toes and back down,
// his chin going up; his eyes going over the crowd that is not there. Three seconds round.

export const CR_STAND = 3.0;
function crStand(): Motion {
  return {
    loop: 0,
    keys: [
      { at: 0, pose: {} },
      { at: 0.75, pose: { pz: R.pz + 1.4, py: 1.3 * K, bend: R.bend - 2.5, pitch: R.pitch - 1.5, faceUp: R.faceUp + 4, faceTurn: R.faceTurn - 10, lfp: -9, rfp: -9 }, ease: 'io' },
      { at: 1.5, pose: { pz: R.pz - 0.5, roll: 0.8, faceTurn: R.faceTurn + 4 }, ease: 'io' },
      { at: 2.25, pose: { pz: R.pz + 0.4, py: -1.3 * K, bend: R.bend - 1.2, roll: -0.8, faceUp: R.faceUp + 2, faceTurn: R.faceTurn + 12 }, ease: 'io' },
      { at: CR_STAND, pose: {}, ease: 'io' },
    ],
  };
}
/** His feet as he rocks onto his toes: the toe of each stays where it stands as its heel comes up. */
function crStandFeet(): (t: number) => P {
  return footwork(B, {
    L: { start: L0, moves: [{ t0: 0.05, t1: 0.75, to: { ...L0, pitch: 9 } }, { t0: 0.75, t1: 1.45, to: L0 }] },
    R: { start: R0, moves: [{ t0: 0.05, t1: 0.75, to: { ...R0, pitch: 9 } }, { t0: 0.75, t1: 1.45, to: R0 }] },
  });
}

// ---------------------------------------------------------------------------------------------
// HIS MARCH (“Heavy and pompous”): as at the head of a parade, chest out, chin up, his knees coming up high and
// his boots stamping down, his belly bouncing with each, rolling from side to side; his free arm swinging stiffly
// across him; the trumpet carried upright, swinging a little with his step. Twelve frames at fifteen a second,
// painted for CR_PACE tiles a second (quick for all that: “quick moving”). Each foot is down seven frames of the
// twelve and stays where it came down.

export const CR_WALK_FRAMES = 12;
export const CR_WALK_FPS = 15;
export const CR_PACE = 1.7;
const CR_GROUND = CR_PACE * TILE3;
const STRIDE = CR_GROUND / CR_WALK_FPS;
function crWalkPose(j: number): P {
  const n = CR_WALK_FRAMES;
  const d = STRIDE;
  const SW = [0.1, 0.32, 0.6, 0.86, 0.98];
  const SZ = [6, 13, 14, 8, 2.5].map((v) => v * K);
  const SP = [20, 6, -10, -16, -4];
  // (the foot that is down, from 3.5 strides before to 2.5 behind; then up, a high step, and down again)
  const foot = (k: number): [number, number, number] => (k <= 6 ? [3.5 * d - d * k, 0, 0] : [-2.5 * d + 6 * d * SW[k - 7], SZ[k - 7], SP[k - 7]]);
  const a = (j / n) * Math.PI * 2;
  const [rx, rz, rp] = foot(j);
  const [lx, lz, lp] = foot((j + 6) % n);
  return {
    px: 1, py: -2.2 * K * Math.sin(a), pz: R.pz - 1.4 * K + 2.2 * K * Math.cos(2 * a),
    yaw: R.yaw + 4 * Math.cos(a), twist: R.twist - 5 * Math.cos(a), pitch: R.pitch - 2, bend: R.bend - 2 + 1.5 * Math.cos(2 * a),
    roll: 4 * Math.sin(a), side: 2 * Math.sin(a),
    faceTurn: R.faceTurn - 3 * Math.cos(a), faceUp: R.faceUp + 4 - 2 * Math.cos(2 * a), faceTilt: -2 * Math.sin(a),
    rfx: rx, rfz: rz, rfy: R.rfy, rft: R.rft, rk: -10, rfp: rp,
    lfx: lx, lfz: lz, lfy: R.lfy, lft: R.lft, lk: 10, lfp: lp,
    // (his left arm swinging stiffly across him with his stride; the trumpet carried upright, swaying with it)
    lhIn: 0, lhx: 6 * K + 7 * K * Math.cos(a), lhy: 6 * K + 2 * K * Math.cos(a), lhz: -26 * K + 3 * K * Math.cos(2 * a), le: -40,
    rhIn: 0, rhx: (R.rhx as number) - 2 * K * Math.cos(a), rhy: R.rhy, rhz: (R.rhz as number) + 1.5 * K * Math.cos(2 * a), re: R.re,
    wAz: R.wAz, wEl: R.wEl - 4 * Math.cos(a), draw: R.draw,
  };
}
function crWalk(): Motion {
  const keys: Key3[] = [];
  for (let i = 0; i <= CR_WALK_FRAMES; i++) keys.push({ at: i / CR_WALK_FPS, ease: 'lin', pose: crWalkPose(i % CR_WALK_FRAMES) });
  return { keys, loop: 0 };
}
/**
 * SETTING OFF AND STOPPING (as the Headsman's). Setting off, the game carries him at his pace from its first
 * moment: his right foot is lifted and set down a stride ahead, his left stays where it stood until he has gone
 * over it. Stopping, from the first frame of his march, still carried: his left foot comes through and is set
 * down where his stand has it, and he is in his stand where the game stops him.
 */
const WALK0 = crWalkPose(0);
export const CR_SET_OFF = Math.max(0.2, (L0.at[0] - plantOf(B, 'L', WALK0, R).at[0]) / CR_GROUND);
export const CR_HALT = Math.max(0.2, (plantOf(B, 'R', WALK0, R).at[0] - R0.at[0]) / CR_GROUND);
function crSetOff(): Motion {
  const T = CR_SET_OFF;
  return { keys: [{ at: 0, pose: {} }, { at: T * 0.5, pose: { ...between(R, WALK0, 0.5, R), pz: (R.pz + (WALK0.pz as number)) / 2 + 1 } }, { at: T, pose: WALK0, ease: 'io' }] };
}
function crSetOffFeet(): (t: number) => P {
  const T = CR_SET_OFF;
  const R1 = plantOf(B, 'R', WALK0, R);
  return footwork(B, {
    L: { start: L0, moves: [] },
    R: { start: R0, moves: [{ t0: 0.03, t1: T - 0.02, to: plantBy(R1, CR_GROUND * T, 0), lift: 10 * K }] },
  }, CR_GROUND);
}
function crHalt(): Motion {
  const T = CR_HALT;
  return { keys: [{ at: 0, pose: WALK0 }, { at: T * 0.55, pose: { ...between(WALK0, R, 0.55, R), pz: (R.pz + (WALK0.pz as number)) / 2 + 0.8 }, ease: 'io' }, { at: T, pose: {}, ease: 'io' }] };
}
function crHaltFeet(): (t: number) => P {
  const T = CR_HALT;
  const L1 = plantOf(B, 'L', WALK0, R);
  const R1 = plantOf(B, 'R', WALK0, R);
  return footwork(B, {
    L: { start: L1, moves: [{ t0: 0.02, t1: T - 0.02, to: plantBy(L0, CR_GROUND * T, 0), lift: 10 * K }] },
    R: { start: R1, moves: [] },
  }, CR_GROUND);
}

// ---------------------------------------------------------------------------------------------
// STRUCK: rocked back on his heels, his chin knocked up, his belly and his coat jolting, his hat jolted; back.

function crStruck(): Motion {
  return {
    keys: [
      { at: 0, pose: {} },
      { at: 0.06, pose: { px: -3 * K, pz: R.pz - 0.8, pitch: R.pitch - 9, bend: R.bend - 6, faceUp: R.faceUp + 14, faceTilt: -6, gale: 0.7 }, ease: 'out' },
      { at: 0.16, pose: { px: -1.4 * K, pitch: R.pitch - 3, bend: R.bend - 2, faceUp: R.faceUp + 5, gale: 0.25 }, ease: 'io' },
      { at: 0.3, pose: {}, ease: 'io' },
    ],
  };
}
const struckBurn = (t: number): number => (t < 0.05 ? 0.2 + t / 0.05 * 0.6 : Math.max(0.2, 0.8 - (t - 0.05) / 0.2));

// ---------------------------------------------------------------------------------------------
// THE SWING, his basic blow. From his stand he takes the trumpet by its mouthpiece end and heaves it up and
// back over his head in both hands, its bell hanging behind him, leaning back on his heels (held, trembling, its
// throat flaring: the warning). Then all at once, his hips first, he lunges a long stride and brings it over the
// top and down before him, bell first, slamming it down at the floor at full reach (the blow): a burst of the
// Hush where it lands. It bounces; he heaves it back up and plants it upright at his side again.


const LUNGE_STEP = 26 * K;
const INTO_WIND: P = elbowsTo({ px: -1, pz: R.pz - 1, yaw: R.yaw - 10, pitch: R.pitch - 3, twist: -6, bend: R.bend - 4, faceTurn: 10, faceUp: R.faceUp + 6, lk: 18, rk: -16, ...grip([13, -20, 94], heading(-40, 84), 0, null), lhIn: 0, lhx: 6 * K, lhy: 10 * K, lhz: -20 * K, le: -40 }, null, [0, -0.7, -0.6]);
/** On the way up: the trumpet swung up his right side by its mouthpiece end, his left hand coming up clear of his belly to take it. */
const INTO: P = elbowsTo({ px: -2, pz: R.pz - 1, yaw: R.yaw - 10, pitch: R.pitch - 5, twist: -7, bend: R.bend - 6, faceTurn: 10, faceUp: R.faceUp + 8, lk: 18, rk: -18, ...grip([4, -26, 98], heading(-110, 62), 0, null), lhIn: 0, lhx: 16 * K, lhy: 10 * K, lhz: -8 * K, le: -40 }, [0.2, 0.8, -0.4], [0, -0.8, -0.2]);
const WIND_BODY: P = { px: -4 * K, pz: R.pz - 2, yaw: R.yaw - 16, pitch: R.pitch - 9, twist: -12, bend: R.bend - 9, faceTurn: 14, faceUp: R.faceUp + 12, lk: 20, rk: -20 };
const WIND: P = elbowsTo({ ...WIND_BODY, ...grip([-6, -22, 106], heading(-168, -36), 0, null), lhIn: 0, lhx: 20 * K, lhy: 9 * K, lhz: -5 * K, le: -36 }, [0.2, 0.8, -0.4], [0.3, -0.8, 0.4]);
/** Coming up: the trumpet straight up over his head, his hips already turning. */
const UP: P = elbowsTo({ px: 0, pz: R.pz - 2, yaw: R.yaw - 10, pitch: R.pitch - 2, twist: -8, bend: R.bend - 3, faceTurn: 10, faceUp: R.faceUp + 8, lk: 24, rk: -18, ...grip([8, -22, 110], heading(-170, 86), 0, null), lhIn: 0, lhx: 14 * K, lhy: 11 * K, lhz: -10 * K, le: -34 }, [0.1, 0.8, -0.4], [0.3, -0.8, 0.3]);
const OVER_BODY: P = { px: 4 * K, pz: R.pz - 4, yaw: R.yaw - 4, pitch: R.pitch + 6, twist: -2, bend: R.bend + 4, faceTurn: 6, faceUp: R.faceUp, lk: 30, rk: -14 };
const OVER: P = elbowsTo({ ...OVER_BODY, ...grip([34, -10, 92], heading(-2, 20), 0, null), lhIn: 0, lhx: 4 * K, lhy: 12 * K, lhz: -14 * K, le: -32 }, [0, 0.8, -0.5], [0.3, -0.7, 0.2]);
const SLAM_BODY: P = { px: 12 * K, pz: R.pz - 9 * K, yaw: R.yaw + 10, pitch: R.pitch + 14, twist: 8, bend: R.bend + 24, faceTurn: -2, faceUp: R.faceUp - 16, lk: 42, rk: -8 };
const SLAM: P = elbowsTo({ ...SLAM_BODY, ...grip([50, -9, 54], heading(4, -40), 0, null), lhIn: 0, lhx: -6 * K, lhy: 13 * K, lhz: -19 * K, le: -30 }, [-0.2, 0.7, -0.5], [-0.2, -0.7, -0.5]);
const BOUNCE: P = elbowsTo({ ...SLAM_BODY, pz: R.pz - 8 * K, pitch: R.pitch + 20, bend: R.bend + 15, ...grip([48, -9, 59], heading(4, -30), 0, null), lhIn: 0, lhx: -6 * K, lhy: 13 * K, lhz: -19 * K, le: -30 }, [-0.2, 0.7, -0.5], [-0.2, -0.7, -0.5]);
/** At rest on the floor after its bounce, a little nearer. */
const REST: P = elbowsTo({ ...SLAM_BODY, pz: R.pz - 8.5 * K, pitch: R.pitch + 22, bend: R.bend + 16, ...grip([46, -9, 52], heading(4, -38), 0, null), lhIn: 0, lhx: -6 * K, lhy: 13 * K, lhz: -19 * K, le: -30 }, [-0.2, 0.7, -0.5], [-0.2, -0.7, -0.5]);
const HEAVE: P = elbowsTo({ px: 5 * K, pz: R.pz - 4 * K, yaw: R.yaw + 2, pitch: R.pitch + 8, twist: 2, bend: R.bend + 6, faceTurn: 4, faceUp: R.faceUp - 4, lk: 30, rk: -14, ...grip([32, -16, 88], heading(-30, 70), 0.3, null), lhIn: 0, lhx: 8 * K, lhy: 12 * K, lhz: -18 * K, le: -50 }, null, [0, -0.7, -0.6]);
function crSwing(): Motion {
  const H = CR_SWING_HIT;
  // (held: the bell hanging behind him, trembling; then his hips turn first, the trumpet still held back)
  const hold = trembling(WIND, -0.6, { twist: -13 });
  const turn = { ...trembling(WIND, 0.3, { twist: -9 }), yaw: (WIND.yaw as number) + 12, pitch: R.pitch - 5, bend: R.bend - 5, px: -3.6 * K };
  const up = { ...UP, yaw: R.yaw + 4, twist: -3, pitch: R.pitch + 3, bend: R.bend + 4 };
  const over = { ...OVER, yaw: R.yaw + 8, twist: 3, pitch: R.pitch + 8, bend: R.bend + 12 };
  return {
    hit: H,
    keys: [
      { at: 0, pose: {} },
      { at: 0.16, pose: INTO, ease: 'in' },
      { at: 0.3, pose: WIND, ease: 'out' },
      { at: 0.37, pose: trembling(WIND, 0.8), ease: 'hold' },
      { at: H - 0.3, pose: hold, ease: 'hold' },
      // (his hips turning, then up, over the top and down: one smooth sweep, the bell slamming at the floor,
      // bouncing, and coming to rest on it)
      ...sweep([{ at: H - 0.3, pose: hold }, { at: H - 0.22, pose: turn }, { at: H - 0.12, pose: up }, { at: H - 0.06, pose: over }, { at: H, pose: SLAM }, { at: H + 0.12, pose: BOUNCE }, { at: H + 0.26, pose: REST }], R),
      { at: H + 0.5, pose: HEAVE, ease: 'io' },
      { at: H + 0.86, pose: {}, ease: 'io' },
    ],
  };
}
function crSwingFeet(): (t: number) => P {
  const H = CR_SWING_HIT;
  return footwork(B, {
    L: { start: L0, moves: [{ t0: H - 0.1, t1: H - 0.01, to: plantBy(L0, LUNGE_STEP, 2 * K, 6), lift: 7 * K }, { t0: H + 0.3, t1: H + 0.6, to: L0, lift: 7 * K }] },
    R: { start: R0, moves: [{ t0: H - 0.08, t1: H + 0.04, to: { ...R0, pitch: 30 } }, { t0: H + 0.36, t1: H + 0.62, to: R0 }] },
  });
}

// ---------------------------------------------------------------------------------------------
// THE SILENT SHOUT. He puts the trumpet to his lips, its bell at you, and draws a great breath: leaning back,
// his chest swelling, the trumpet tipping up, its throat flaring brighter and brighter (the warning). Then he
// throws himself into the shout: and nothing comes out of it but the Hush, a cone of dead silence rolling out of
// the bell over the floor before him (art/crier_shots.ts), his coat thrown back, the trumpet shaking in his
// hands, for most of a second. Then he lowers it.


/** His mouth (the figure's own space) in a pose: where the trumpet's mouthpiece goes. */
function mouthOf(pose: P): V3 {
  const s = solve(B, { ...R, ...pose } as Posed);
  const f = s.face;
  return add(s.head, add(mul(f[0], B.headR[0] * 1.0), mul(f[2], -B.headR[2] * 0.42)));
}
/** The trumpet to his lips, running `way`: his right hand on it `draw` of the way up (his left as the body says: one hand is enough for a man so pleased with himself). */
function toLips(body: P, way: V3, draw = 0.24): P {
  const m = mouthOf(body);
  const w = norm(way);
  const hold = (4 + 22 * draw) * K;
  return elbowsTo({ ...body, ...grip(add(m, mul(w, hold + 1.2)), w, draw, null) }, null, [0.1, -0.8, -0.5]);
}
/** On the way to his lips (and from them): the trumpet lifted upright, out before him and to his right, clear of his belly. */
const LIFT: P = elbowsTo({ ...grip([30 * K, -20 * K, 58 * K], heading(-20, 74), 0.6, null), lhIn: 0, lhx: -2 * K, lhy: 9 * K, lhz: -22 * K, le: -70, faceUp: 4 }, null, [0.2, -0.8, -0.4]);
/** His left fist on his hip (his stand's), or his left arm flung out wide (as he shouts). */
const FIST_ON_HIP: P = { lhIn: 0, lhx: -2 * K, lhy: 9 * K, lhz: -22 * K, le: -70 };
const FLUNG_WIDE: P = { lhIn: 0, lhx: 4 * K, lhy: 26 * K, lhz: -6 * K, le: -10 };
const SH_RAISE_BODY: P = { ...FIST_ON_HIP, px: 0, yaw: R.yaw + 8, pitch: R.pitch - 2, twist: 0, bend: R.bend - 2, faceTurn: 0, faceUp: 2, lk: 16, rk: -14 };
const SH_BREATH_BODY: P = { ...FLUNG_WIDE, px: -3 * K, pz: R.pz + 1.6, yaw: R.yaw + 8, pitch: R.pitch - 9, twist: 0, bend: R.bend - 11, faceTurn: 0, faceUp: 12, lk: 18, rk: -18 };
const SH_SHOUT_BODY: P = { ...FLUNG_WIDE, lhx: -4 * K, lhz: -10 * K, px: 4 * K, pz: R.pz - 2, yaw: R.yaw + 10, pitch: R.pitch + 8, twist: 2, bend: R.bend + 4, faceTurn: -2, faceUp: -2, lk: 34, rk: -10, gale: 0.7 };
function crShout(): Motion {
  const { hit, end, long } = CR_SHOUT;
  const RAISE = toLips(SH_RAISE_BODY, heading(-6, 0));
  const BREATH = toLips(SH_BREATH_BODY, heading(-4, 14));
  const SHOUT = toLips(SH_SHOUT_BODY, heading(-6, -4));
  const shake = (k: number): P => toLips({ ...SH_SHOUT_BODY, px: (SH_SHOUT_BODY.px as number) + (k % 2 ? 0.6 : -0.6), faceTilt: k % 2 ? 2 : -2 }, heading(-6 + (k % 2 ? 1.2 : -1.2), -4 + (k % 2 ? -1 : 1)));
  return {
    hit,
    keys: [
      { at: 0, pose: {} },
      { at: 0.12, pose: LIFT, ease: 'in' },
      { at: 0.26, pose: RAISE, ease: 'out' },
      { at: 0.5, pose: BREATH, ease: 'io' },
      { at: 0.62, pose: { ...BREATH, pz: (BREATH.pz as number) + 0.6 }, ease: 'io' },
      { at: hit - 0.08, pose: { ...BREATH, pz: (BREATH.pz as number) + 1.0, bend: (BREATH.bend as number) - 1 }, ease: 'io' },
      { at: hit, pose: SHOUT, ease: 'in' },
      { at: hit + 0.12, pose: shake(1), ease: 'io' },
      { at: hit + 0.26, pose: shake(2), ease: 'io' },
      { at: hit + 0.4, pose: shake(3), ease: 'io' },
      { at: hit + 0.54, pose: shake(4), ease: 'io' },
      { at: end, pose: { ...SHOUT, gale: 0.2 }, ease: 'io' },
      { at: end + 0.2, pose: RAISE, ease: 'io' },
      { at: end + 0.38, pose: LIFT, ease: 'in' },
      { at: long, pose: {}, ease: 'out' },
    ],
  };
}
function crShoutFeet(): (t: number) => P {
  const { hit, end } = CR_SHOUT;
  return footwork(B, {
    L: { start: L0, moves: [{ t0: hit - 0.06, t1: hit + 0.04, to: plantBy(L0, 8 * K, 0, 0), lift: 4 * K }, { t0: end + 0.1, t1: end + 0.4, to: L0, lift: 4 * K }] },
    R: { start: R0, moves: [] },
  });
}

// ---------------------------------------------------------------------------------------------
// THE PROCLAMATION. His left hand goes to the satchel at his hip and draws out a great scroll, sealed in the
// city's oxblood; he holds it up high over his hat, leaning back, the seal burning the cult's pink to gold (the
// warning); and flings it down before him: it lands and unrolls down the street, a giant sheet of blank paper
// sweeping all before it (art/crier_shots.ts). He points the trumpet after it, as at something proclaimed.


/** His trumpet as he proclaims: lifted upright out before him and to his right (clear of his belly and the scroll), then pointed after the scroll. */
const PR_TRUMPET: P = grip([30 * K, -22 * K, 60 * K], heading(-22, 74), 0.6, null);
const PR_TRUMPET_TIP: P = grip([30 * K, -24 * K, 58 * K], heading(-10, 36), 0, null);
const PR_REACH: P = elbowsTo({ ...PR_TRUMPET, px: 0, yaw: R.yaw + 10, pitch: R.pitch + 2, twist: 10, bend: R.bend + 2, faceTurn: -8, faceUp: R.faceUp - 6, lk: 16, rk: -12, lhIn: 2, lhx: 1 * K, lhy: 21 * K, lhz: 42 * K }, [-0.3, 0.8, -0.4], [0.2, -0.8, -0.4]);
const PR_DRAW: P = elbowsTo({ ...PR_REACH, lhIn: 2, lhx: 4 * K, lhy: 20 * K, lhz: 64 * K, prop: 1 }, [-0.2, 0.9, -0.3], [0.2, -0.8, -0.4]);
const PR_HIGH: P = elbowsTo({ ...PR_TRUMPET, px: -3 * K, pz: R.pz + 1, yaw: R.yaw + 4, pitch: R.pitch - 8, twist: 6, bend: R.bend - 10, faceTurn: 0, faceUp: 22, lk: 18, rk: -18, lhIn: 2, lhx: 3, lhy: 16, lhz: 124, prop: 1 }, [0, 0.9, 0.2], [0.2, -0.8, -0.4]);
const PR_FLING: P = elbowsTo({ ...PR_TRUMPET_TIP, px: 8 * K, pz: R.pz - 5 * K, yaw: R.yaw + 6, pitch: R.pitch + 20, twist: -4, bend: R.bend + 14, faceTurn: 0, faceUp: -10, lk: 36, rk: -8, lhIn: 2, lhx: 34 * K, lhy: 8 * K, lhz: 46 * K, prop: 1 }, [0.1, 0.8, -0.5], [0.2, -0.8, -0.4]);
const PR_POINT: P = elbowsTo({ px: 4 * K, pz: R.pz - 2 * K, yaw: R.yaw + 8, pitch: R.pitch + 6, twist: 4, bend: R.bend + 2, faceTurn: -4, faceUp: R.faceUp - 2, lk: 30, rk: -12, ...grip([31 * K, -22 * K, 60 * K], heading(-4, 14), 0, null), lhIn: 0, lhx: -2 * K, lhy: 9 * K, lhz: -22 * K, le: -70 }, null, [0.2, -0.8, -0.4]);
function crProclaim(): Motion {
  const { hit, long } = CR_PROCLAIM;
  return {
    hit,
    keys: [
      { at: 0, pose: {} },
      { at: 0.18, pose: PR_REACH, ease: 'io' },
      { at: 0.24, pose: PR_REACH, ease: 'hold' },
      { at: 0.36, pose: PR_DRAW, ease: 'in' },
      { at: 0.6, pose: PR_HIGH, ease: 'out' },
      { at: 0.7, pose: { ...PR_HIGH, lhz: (PR_HIGH.lhz as number) + 1.2 }, ease: 'hold' },
      { at: hit - 0.1, pose: { ...PR_HIGH, lhz: (PR_HIGH.lhz as number) - 1, px: (PR_HIGH.px as number) - 1 }, ease: 'hold' },
      { at: hit, pose: PR_FLING, ease: 'in' },
      { at: hit + 0.06, pose: { ...PR_FLING, prop: 0 }, ease: 'out' },
      { at: hit + 0.36, pose: PR_POINT, ease: 'io' },
      { at: hit + 0.8, pose: { ...PR_POINT, pitch: (PR_POINT.pitch as number) - 2, faceUp: (PR_POINT.faceUp as number) + 4 }, ease: 'io' },
      { at: long, pose: {}, ease: 'io' },
    ],
  };
}
function crProclaimFeet(): (t: number) => P {
  const { hit } = CR_PROCLAIM;
  return footwork(B, {
    L: { start: L0, moves: [{ t0: hit - 0.1, t1: hit, to: plantBy(L0, 16 * K, 1 * K, 4), lift: 6 * K }, { t0: hit + 0.7, t1: hit + 1.05, to: L0, lift: 6 * K }] },
    R: { start: R0, moves: [{ t0: hit - 0.08, t1: hit + 0.04, to: { ...R0, pitch: 22 } }, { t0: hit + 0.72, t1: hit + 1.0, to: R0 }] },
  });
}

// ---------------------------------------------------------------------------------------------
// THE CROWD. He throws his head back and lifts the trumpet to the sky, its bell up, and draws breath (the
// warning: its throat flaring); then he blows a call that makes no sound: rings of the Hush roll up out of the
// bell and away over the rooftops, the trumpet shaking, and the Hushed come out of the alleys to him (the game's).


const CW_RAISE_BODY: P = { ...FIST_ON_HIP, px: -1, yaw: R.yaw + 6, pitch: R.pitch - 6, twist: 0, bend: R.bend - 8, faceTurn: 0, faceUp: 38, lk: 16, rk: -14 };
const CW_BREATH_BODY: P = { ...FIST_ON_HIP, px: -4 * K, pz: R.pz + 1.4, yaw: R.yaw + 6, pitch: R.pitch - 16, twist: 0, bend: R.bend - 18, faceTurn: 0, faceUp: 46, lk: 18, rk: -18 };
const CW_BLOW_BODY: P = { ...FIST_ON_HIP, px: 2 * K, pz: R.pz - 1, yaw: R.yaw + 6, pitch: R.pitch - 8, twist: 0, bend: R.bend - 10, faceTurn: 0, faceUp: 44, lk: 24, rk: -16, gale: 0.35 };
function crCrowd(): Motion {
  const { hit, end, long } = CR_CROWD;
  const RAISE = toLips(CW_RAISE_BODY, heading(-6, 66));
  const BREATH = toLips(CW_BREATH_BODY, heading(-6, 74));
  const BLOW = toLips(CW_BLOW_BODY, heading(-6, 76));
  const shake = (k: number): P => toLips({ ...CW_BLOW_BODY, ...FLUNG_WIDE, lhz: 8 * K, roll: k % 2 ? 1.5 : -1.5 }, heading(-6 + (k % 2 ? 2 : -2), 76));
  return {
    hit,
    keys: [
      { at: 0, pose: {} },
      { at: 0.12, pose: LIFT, ease: 'in' },
      { at: 0.28, pose: RAISE, ease: 'out' },
      { at: 0.5, pose: BREATH, ease: 'io' },
      { at: hit - 0.12, pose: { ...BREATH, pz: (BREATH.pz as number) + 0.8 }, ease: 'io' },
      { at: hit, pose: BLOW, ease: 'in' },
      { at: hit + 0.16, pose: shake(1), ease: 'out' },
      { at: hit + 0.32, pose: shake(2), ease: 'io' },
      { at: hit + 0.48, pose: shake(3), ease: 'io' },
      { at: end, pose: { ...BLOW, ...shake(4) }, ease: 'io' },
      { at: end + 0.24, pose: RAISE, ease: 'io' },
      { at: end + 0.42, pose: LIFT, ease: 'in' },
      { at: long, pose: {}, ease: 'out' },
    ],
  };
}

// ---------------------------------------------------------------------------------------------
// HIS DEATH (“The Hush pours out of him”): struck back on his heels; the pink goes out of the trumpet's throat
// and his eyes, and the Hush pours out of him, grey smoke rolling out of the trumpet's bell and his open mouth;
// the trumpet slips from his hand and falls; he clutches at his chest, his knees give and he sinks onto them,
// swaying, the Hush still pouring up out of him; he folds forward and falls on his face, his hat tumbling off;
// the last of it rises from him and thins away.


const DIE_FEET = ((): Record<'L' | 'R', Plant> => ({ L: plantBy(L0, R0.at[0] - L0.at[0] + 6 * K, 0), R: R0 }))();
const TUCK = 58;
// (his knee down on the floor: the turned-down top of his boot resting on it)
const KNEE_DOWN = B.legR[1] * 1.48;
const kneeling = (lean: number, body: P): P => kneelSettle(B, R, { ...kneelHips(B, R, DIE_FEET, TUCK, KNEE_DOWN, lean), ...body }, DIE_FEET, TUCK, KNEE_DOWN);
const HANG = -(B.upperArm + B.foreArm) * 0.9;
/** His arms hanging at his sides, clear of his coat and his belly. */
const HANGING: P = { lhIn: 0, lhx: 8 * K, lhy: 11 * K, lhz: HANG + 6, le: -14, rhIn: 0, rhx: 9 * K, rhy: -11 * K, rhz: HANG + 6, re: 14 };
/** His left hand clutching at his chest. */
const CLUTCH: P = { lhIn: 0, lhx: 12 * K, lhy: -4 * K, lhz: -10 * K, le: -40 };
/** His arms limp, laid where his body puts them as it goes down: each hand on the floor `back` behind its shoulder and `out` to its side. */
function limp(body: P, back: number, out: number): P {
  const s = solve(B, { ...CR_BASE, ...body, lhIn: 0, rhIn: 0 } as Posed);
  const at = (sh: V3, side: number): V3 => [sh[0] - back, sh[1] + side * out, 7.5 * K];
  const L = at(s.shoulderL, 1);
  const Rr = at(s.shoulderR, -1);
  return elbowsTo({ ...body, lhIn: 2, lhx: L[0], lhy: L[1], lhz: L[2], rhIn: 2, rhx: Rr[0], rhy: Rr[1], rhz: Rr[2] }, [0, 1, -0.4], [0, -1, -0.4], { ...CR_BASE, ...body } as Bones);
}
const ON_KNEES: P = kneeling(8, { yaw: R.yaw + 6, pitch: 4, roll: 2, twist: 0, bend: 6, side: 2, faceTurn: 0, faceUp: 10, faceTilt: 6, ...HANGING, ...CLUTCH });
const FOLD: P = kneeling(14, { yaw: R.yaw + 6, pitch: 30, roll: 2, twist: 0, bend: 26, side: 1, faceTurn: 0, faceUp: -40, faceTilt: 4, ...HANGING });
const SLUMP: P = limp(kneeling(26, { yaw: R.yaw + 6, pitch: 66, roll: 0, twist: 0, bend: 30, side: 0, faceTurn: 8, faceUp: -60, faceTilt: 10 }), 12 * K, 14 * K);
/** Lifted `dz` (his belly is what he comes down on). */
const lifted = (p: P, dz: number): P => ({ ...p, pz: (p.pz as number) + dz });
const GOING: P = limp(kneeling(52, { yaw: R.yaw + 6, pitch: 78, roll: 0, twist: 0, bend: 16, side: 0, faceTurn: 10, faceUp: -50, faceTilt: 12 }), 24 * K, 13 * K);
const PRONE: P = { ...limp(lifted(kneeling(70, { yaw: R.yaw + 6, pitch: 80, roll: 6, twist: 0, bend: 6, side: 0, faceTurn: 10, faceUp: -36, faceTilt: 14 }), 6.5), 36 * K, 12 * K), out: 1 };
function crDying(): Motion {
  return {
    keys: [
      { at: 0, pose: {} },
      { at: 0.12, pose: { px: -3 * K, pz: R.pz - 1, pitch: R.pitch - 8, bend: R.bend - 6, faceUp: R.faceUp + 16, gale: 0.6, out: 0.5 }, ease: 'out' },
      { at: CR_TRUMPET_GOES, pose: { px: -2 * K, pz: R.pz - 3, pitch: R.pitch - 2, bend: R.bend - 2, faceUp: R.faceUp + 20, gale: 0.4, out: 1, rhIn: 0, rhx: (R.rhx as number) + 2, rhy: (R.rhy as number) - 2 * K, rhz: (R.rhz as number) - 4 * K, ...CLUTCH }, ease: 'io' },
      { at: 0.58, pose: { px: -1.5 * K, pz: R.pz - 6 * K, pitch: R.pitch + 2, bend: R.bend + 2, faceUp: R.faceUp + 18, lk: 30, rk: -30, gale: 0.3, out: 1, ...HANGING, ...CLUTCH }, ease: 'out' },
      { at: 0.9, pose: { ...ON_KNEES, out: 1 }, ease: 'in' },
      { at: 1.05, pose: { ...ON_KNEES, pz: (ON_KNEES.pz as number) + 1, pitch: 0, side: -2, roll: -2, out: 1 }, ease: 'out' },
      { at: 1.36, pose: { ...ON_KNEES, pitch: 12, roll: 3, out: 1 }, ease: 'io' },
      { at: 1.58, pose: { ...FOLD, out: 1 }, ease: 'in' },
      { at: 1.72, pose: { ...SLUMP, out: 1 }, ease: 'in' },
      { at: 1.8, pose: { ...SLUMP, pz: (SLUMP.pz as number) + 1, out: 1 }, ease: 'out' },
      { at: 2.06, pose: { ...GOING, out: 1 }, ease: 'in' },
      { at: 2.26, pose: PRONE, ease: 'out' },
      { at: CR_DIE_TIME, pose: PRONE, ease: 'io' },
    ],
  };
}
function crDyingFeet(): (t: number) => P {
  const F = DIE_FEET;
  return footwork(B, {
    L: { start: L0, moves: [{ t0: 0.06, t1: 0.3, to: F.L, lift: 5 * K }, { t0: 0.6, t1: 0.88, to: { ...F.L, pitch: TUCK } }, { t0: 2.02, t1: 2.24, to: { ...F.L, pitch: TUCK, at: [F.L.at[0] + 2.2, F.L.at[1] - 2.2] }, lift: 2 }] },
    R: { start: F.R, moves: [{ t0: 0.6, t1: 0.88, to: { ...F.R, pitch: TUCK } }] },
  });
}

// ---------------------------------------------------------------------------------------------
// HIM, AS THE GAME HOLDS A MONSTER

const mv = (name: string, motion: Motion, more: Partial<MobMove> = {}): MobMove => ({ name, motion, rest: R, ...more });
/** The points of his trumpet whose way through the air is streaked: round its rim and its middle. */
function trailOf(s: Skeleton, q: Posed): V3[] {
  const t = trumpetOf(s, q);
  const e1 = norm(sub(heading(q.wAz + 90, 0), mul(t.way, dot(heading(q.wAz + 90, 0), t.way))), [0, 1, 0]);
  return [add(t.rim, mul(e1, BELL_R)), t.rim, add(t.rim, mul(e1, -BELL_R)), lerp3(t.mouth, t.rim, 0.55)];
}
export const CRIER_MOB: Mob = {
  id: 'crier',
  name: 'The Crier',
  size: 'a boss: half again the knight’s height, stout',
  build: B,
  stand: mv('The Crier stands, pleased with himself', crStand(), { feet: crStandFeet(), glint: () => 0.2 }),
  attack: mv(SWING_NAME, crSwing(), { feet: crSwingFeet(), glint: heldBurn(0.3, 0.46, CR_SWING_HIT, 0.1), trail: trailOf, trailSpan: 4, trailOver: (t) => t > CR_SWING_HIT - 0.07 && t < CR_SWING_HIT + 0.06 }),
  idleFrames: 30,
  idleFps: 10,
  walk: mv('The Crier marches', crWalk(), { period: CR_WALK_FRAMES / CR_WALK_FPS, ground: CR_GROUND, glint: () => 0.2 }),
  walkFrames: CR_WALK_FRAMES,
  walkFps: CR_WALK_FPS,
  pace: CR_PACE,
  more: {
    setOff: mv('The Crier sets off', crSetOff(), { ground: CR_GROUND, feet: crSetOffFeet(), glint: () => 0.2 }),
    halt: mv('The Crier stops', crHalt(), { ground: CR_GROUND, feet: crHaltFeet(), glint: () => 0.2 }),
    shout: mv(SHOUT_NAME, crShout(), { feet: crShoutFeet(), glint: heldBurn(0.3, CR_SHOUT.hit - 0.04, CR_SHOUT.hit, CR_SHOUT.end - CR_SHOUT.hit) }),
    proclaim: mv(PROCLAIM_NAME, crProclaim(), { feet: crProclaimFeet(), glint: heldBurn(0.4, CR_PROCLAIM.hit - 0.06, CR_PROCLAIM.hit, 0.05) }),
    crowd: mv(CROWD_NAME, crCrowd(), { glint: heldBurn(0.3, CR_CROWD.hit - 0.04, CR_CROWD.hit, CR_CROWD.end - CR_CROWD.hit) }),
  },
  reel: mv('The Crier is struck', crStruck(), { glint: struckBurn }),
  reelTime: 0.3,
  hit: CR_SWING_HIT,
  warn: 0.3,
  dieTime: CR_DIE_TIME,
  dying: mv('The Hush pours out of him', crDying(), { feet: crDyingFeet() }),
  aura: { x: CR_CANVAS.ax - 2, y: CR_CANVAS.ay - 54, r: 84, color: '#ff3a78', a: 0.15 },
  shadow: 26,
  canvas: CR_CANVAS,
  trueBack: true,
  bits: (st, m) => crierBits(st, m),
  // (each comes to lie clear of him, as he lies)
  fall(piece) {
    if (piece === 'trumpet') return { from: CR_TRUMPET_GOES, to: [8, -46], spin: -58, lay: 'axis', hop: 1.6 };
    if (piece === 'hat') return { from: CR_HAT_GOES, to: [70, 26], spin: 80, lay: 'keep', hop: 2.0 };
    return null;
  },
};

export function makeCrierArt(pace = CRIER_MOB.pace): ActorArt {
  return { front: mobSet(CRIER_MOB, 'front', pace), back: mobSet(CRIER_MOB, 'back', pace) };
}

// ---------------------------------------------------------------------------------------------
// HIM AS THE CHECKS SEE HIM (art/boss_checks.ts): his outside as painted, by name, and his trumpet while it is his.

export function crSolids(s: Skeleton): { limbs: CheckLimb[]; lumps: CheckLump[] } {
  const [rH, rK] = B.legR;
  const [r0, r1] = B.armR;
  const limbs: CheckLimb[] = [];
  for (const side of ['L', 'R'] as const) {
    const L = side === 'L';
    limbs.push(
      { name: `leg${side}`, a: L ? s.hipL : s.hipR, b: L ? s.kneeL : s.kneeR, r: rH * 1.08 },
      { name: `shin${side}`, a: L ? s.kneeL : s.kneeR, b: L ? s.ankleL : s.ankleR, r: rK * 1.22 },
      { name: `foot${side}`, a: add(L ? s.heelL : s.heelR, [0, 0, 2.1]), b: add(L ? s.toeL : s.toeR, [0, 0, 2.1]), r: 2.4 },
      { name: `upper${side}`, a: L ? s.shoulderL : s.shoulderR, b: L ? s.elbowL : s.elbowR, r: r0 * 1.16 },
      { name: `fore${side}`, a: L ? s.elbowL : s.elbowR, b: L ? s.handL : s.handR, r: r1 * 1.1 },
    );
  }
  limbs.push({ name: 'neck', a: s.neck, b: s.skull, r: 5.0 * K });
  for (const [side, rings] of coatSkirts(s)) {
    for (let i = 1; i < rings.length; i++) {
      const a = rings[i - 1];
      const b = rings[i];
      const r = Math.min(len(a.u), len(a.v), len(b.u), len(b.v));
      limbs.push({ name: `coat${side}`, a: a.c, b: b.c, r: Math.max(2, r - 1) });
    }
  }
  const waistC = waistOf(s);
  const lumps: CheckLump[] = [
    { name: 'head', c: s.head, rot: s.face, h: [B.headR[0] * 1.05, B.headR[1] * 1.12, B.headR[2]] },
    { name: 'chest', c: lerp3(s.ribs, s.neck, 0.3), rot: s.chest, h: [B.ribDeep + 2.6, B.ribHalf + 2.8, len(sub(s.neck, s.ribs)) * 0.55] },
    { name: 'belly', c: add(lerp3(waistC, s.ribs, 0.45), mul(s.belly[0], 1.5)), rot: s.belly, h: [B.waistDeep + 4.2, B.waistHalf + 2.6, Math.max(4, len(sub(s.ribs, waistC)) * 0.6)] },
    { name: 'hips', c: add(s.pelvis, mul(s.hips[2], B.waist * 0.2)), rot: s.hips, h: [B.pelvisDeep + 2.4, B.pelvisHalf + 2.4, B.waist * 0.75] },
  ];
  return { limbs, lumps };
}
export const CR_SHAPE: BossShape = {
  body: crSolids,
  // (what he strikes with: the trumpet's bell; but as he proclaims, the scroll in his left hand)
  tip: (move, t, s, q) => (move === 'dying' && t >= CR_TRUMPET_GOES ? null : move === 'proclaim' ? s.handL : trumpetOf(s, q).rim),
  handovers: [
    { from: 'stand', at: 0, to: 'setOff', toAt: 0 },
    { from: 'setOff', at: 'end', to: 'walk', toAt: 0 },
    { from: 'walk', at: 0, to: 'halt', toAt: 0 },
    { from: 'halt', at: 'end', to: 'stand', toAt: 0 },
    ...(['attack', 'reel', 'shout', 'proclaim', 'crowd'] as const).flatMap((m) => [
      { from: 'stand', at: 0, to: m, toAt: 0 },
      { from: 'halt', at: 'end' as const, to: m, toAt: 0 },
      { from: m, at: 'end' as const, to: 'stand', toAt: 0 },
      { from: m, at: 'end' as const, to: 'setOff', toAt: 0 },
      { from: m, at: 'end' as const, to: 'dying', toAt: 0 },
    ]),
    { from: 'stand', at: 0, to: 'dying', toAt: 0 },
    { from: 'halt', at: 'end', to: 'dying', toAt: 0 },
  ],
  things: (move, t, s, q) => {
    if (move === 'dying' && t >= CR_TRUMPET_GOES) return [];
    const tr = trumpetOf(s, q);
    const onIt = (h: V3): boolean => {
      const ab = sub(tr.rim, tr.mouth);
      const k = Math.max(0, Math.min(1, dot(sub(h, tr.mouth), ab) / Math.max(1e-6, dot(ab, ab))));
      return len(sub(h, add(tr.mouth, mul(ab, k)))) < trumpetR(k) + B.armR[2] * 1.1 + 3;
    };
    const may = [...(q.lhIn === 3 || onIt(s.handL) ? ['foreL'] : []), ...(onIt(s.handR) ? ['foreR'] : [])];
    // its throat may touch his lips (the mouthpiece is put to them): his head, then
    const lips = move === 'shout' || move === 'crowd' ? ['head', 'neck'] : [];
    const cone: V3[] = [];
    for (let i = 0; i <= 10; i++) cone.push(lerp3(tr.mouth, tr.rim, (i / 10) * 0.72));
    const bell: V3[] = [];
    for (const k of [0.8, 0.88, 0.94, 1]) bell.push(lerp3(tr.mouth, tr.rim, k));
    const things: CheckThing[] = [
      { name: 'trumpet', pts: cone, r: trumpetR(0.4), may: [...may, ...lips] },
      { name: 'bell', pts: bell, r: trumpetR(0.9) * 0.8, may },
    ];
    void t;
    return things;
  },
};
void TRUMPET_LEN;
void clamp01;
export type { FootTrack };
