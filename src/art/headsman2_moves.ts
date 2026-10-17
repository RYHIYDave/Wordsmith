// THE HEADSMAN, MADE NEW: HIS MOVES (the art chat, 17 Oct 2026). A MOCK-UP: NOT IN THE GAME, behind
// HEADSMAN2 (art/headsman2.ts, off). His look is art/headsman2.ts.
//
// His words to the main chat, 17 Oct, 11:37 (Eastern): "I’d like the headsman completely redesigned to be
// sleeker and more agile." His picks in the art chat: by 15:55, "Lean, with a long axe (Recommended)",
// "Darting dashes", "All new attacks"; by 17:51, his four attacks, "Yes, these four (Recommended)" (offered
// as: a quick LUNGE that hooks the blade across you, his basic; a BLADE WHEEL, the axe spun before him as
// he drives through you; a VAULT, up on the haft and down blade-first on a marked spot; a FLURRY, three
// darting dashes at you with a cut at each); by 17:57, to his look, "Yes, animate him (Recommended)"; and
// at 17:57, "Make sure he passes the clipping checks". So every move of his goes through every boss check
// (art/boss_checks.ts), from in front and from behind, and nothing of his goes through him or his coat;
// and, beyond what those checks see (tests/headsman2.test.ts): nothing he wears or carries in the floor
// but his blade's edge where it bites (the vault, the flurry's last cut: a little way, and stopped dead
// there), nothing of him cut off at the picture's edge, and what falls from him as he dies (his axe, his
// hood) lying clear of him.
//
// By the art rulebook, as the heroes': built on the bones; weight in every blow (a wind-up held: the
// warning; a follow-through); his feet grip the floor; his coat, hood and sash follow; alive when still;
// effects big and wild. He is QUICK: where the first Headsman was slow and terrible, he darts.
//
// HOW HE MOVES OVER THE FLOOR: his walk is a low, quick prowl (the game carries him at H2_PACE); and
// DASHES, quick bounds to his left or his right (dashL, dashR), which end where they land: the game moves
// him by their `H2_SHIFT` when they end, as it does for the blade wheel, the vault and the flurry, which
// end where he has driven to. Every move begins and ends in his guard.

import { between, footwork, kneelHips, kneelSettle, plantBy, plantOf } from './bosses3';
import type { FootTrack, Plant } from './bosses3';
import type { BossShape, CheckLimb, CheckLump, CheckThing, Handover } from './boss_checks';
import { AXE2_HOLD, AXE2_LEN, BLADE_OUT, BLADE_TALL, D, H2_AXE_GOES, WHEEL_NAME, H2_BASE, H2_HANG, H2_HOOD_GOES, H2_BODY, H2_CANVAS, FLURRY_NAME, H2_FLURRY_HITS, H2_GUARD, HAFT_TOP, SPIKE, axe2Of, axeWay, axed, clamp01, coatSkirts, headsman2Bits, resolvedRest } from './headsman2';
import type { P } from './headsman2';
import type { ActorArt } from './actor_types';
import { TILE3, mobSet, posedOfMob } from './new_mobs3';
import type { Mob, MobMove } from './new_mobs3';
import { add, dot, elbowFor, heading, len, lerp3, mul, norm, solve, sub } from './skeleton';
import type { Bones, Key3, Motion, Posed, Skeleton, V3 } from './skeleton';

const B = H2_BODY;
const FR = 1 / 30;

/** His elbows pointed as nearly toward these ways as his arms let them (the figure's own axes). */
function elbowsTo(pose: P, wantL: V3 | null, wantR: V3 | null, rest: Bones = H2_BASE): P {
  const q = { ...rest, ...pose } as Posed;
  const le = wantL ? elbowFor(B, q, true, norm(wantL)) : q.le;
  const re = wantR ? elbowFor(B, { ...q, le } as Posed, false, norm(wantR)) : q.re;
  return { ...pose, le, re };
}
/** The same pose with his right hand measured from his shoulder along his chest (`HandIn` 0): the axe goes where his chest goes. */
function onChest(pose: P, rest: Bones = H2_BASE): P {
  const s = solve(B, { ...rest, ...pose } as Posed);
  const d = sub(s.handR, s.shoulderR);
  return { ...pose, rhIn: 0, rhx: dot(d, s.chest[0]), rhy: dot(d, s.chest[1]), rhz: dot(d, s.chest[2]) };
}
/**
 * THE AXE IN HIS HANDS: his right hand at `hand` (on the floor's own axes), the haft running `pt` from its
 * foot to its head, the blade's edge facing `out`, his right hand `draw` of the way up it (0 at its foot,
 * 1 at its middle); his left hand `left` along the haft from his right (toward the head: more than
 * nothing; toward the foot: less), or free (null: as the pose has it).
 */
function grip(hand: V3, pt: V3, out: V3, draw: number, left: number | null, over = false): P {
  return { rhIn: 2, rhx: hand[0], rhy: hand[1], rhz: hand[2], ...axeWay(pt, out, over), draw, ...(left === null ? {} : { lhIn: 3 as const, lhx: left, lhy: 0, lhz: 0 }) };
}
/** The edge facing the way a blade swung round flat (about straight up, to his left: `ccw`) is going, for a haft running `pt`. */
const flatEdge = (pt: V3, ccw = true): V3 => norm(ccw ? [-pt[1], pt[0], 0] : [pt[1], -pt[0], 0], [0, 1, 0]);
/** The way the haft runs, said as going on over the top (for a key the axe goes on over the top from). */
const overOf = (way: V3): P => {
  const o = axeWay(way, [0, 0, 1], true);
  return { wAz: o.wAz, wEl: o.wEl };
};
/** A held pose trembling: its right hand (and the axe) up or down a little, and whatever else is said. */
const trembling = (pose: P, dz: number, more: P = {}): P => ({ ...pose, rhz: (pose.rhz as number) + dz, ...more });

// ---------------------------------------------------------------------------------------------
// A QUICK MOVE AS ONE SMOOTH SWEEP. A blow that whips the axe round him in a tenth of a second goes a long
// way between two of the game's frames; keyed pose to pose, it turns sharp corners at its keys and goes as
// it will between them. So a quick move is said by the poses it goes THROUGH (its controls), and is made
// into a key at every frame the game shows (thirty a second) along one smooth curve through them, every
// number of the body, and the axe's ways (the way its haft runs and the way its edge faces, as ways, not
// as angles: so that they go over the top or round as smoothly as anything else), going on through each
// control without stopping, and coming to rest only at the first and the last.

const SMOOTHED = ['px', 'py', 'pz', 'yaw', 'pitch', 'roll', 'twist', 'bend', 'side', 'faceTurn', 'faceUp', 'faceTilt', 'lhx', 'lhy', 'lhz', 'rhx', 'rhy', 'rhz', 'le', 're', 'lk', 'rk', 'draw', 'gale'] as const;
/** The way a pose's haft runs and its edge faces, as ways. */
const waysOf = (q: Bones): [V3, V3] => [heading(q.wAz, q.wEl), heading(q.pAz, q.pEl)];
/** A Hermite curve's value at `u` (0..1) between a and b, with slopes ma and mb (per unit of u). */
const hermite = (a: number, b: number, ma: number, mb: number, u: number): number => {
  const u2 = u * u;
  const u3 = u2 * u;
  return (2 * u3 - 3 * u2 + 1) * a + (u3 - 2 * u2 + u) * ma + (-2 * u3 + 3 * u2) * b + (u3 - u2) * mb;
};
/**
 * KEYS AT EVERY FRAME (thirty a second) FROM `from` TO THE LAST CONTROL, along one smooth curve through the
 * controls (each a moment and a pose; what a pose does not say, as `rest` has it). Both hands are measured as
 * the first control has them. The curve sets off from the first control and comes to rest at the last.
 */
function sweep(ctrls: ReadonlyArray<{ at: number; pose: P }>, rest: Bones = R): Key3[] {
  const full = ctrls.map((c) => ({ at: c.at, q: { ...rest, ...c.pose } as Bones }));
  const n = full.length;
  const slope = (vals: number[], i: number): number => {
    if (i === 0 || i === n - 1) return 0;
    return (vals[i + 1] - vals[i - 1]) / (full[i + 1].at - full[i - 1].at);
  };
  const series: Record<string, number[]> = {};
  for (const f of SMOOTHED) series[f] = full.map((c) => c.q[f] as number);
  const ways = full.map((c) => waysOf(c.q));
  const vec = (j: 0 | 1, k: 0 | 1 | 2): number[] => ways.map((w) => w[j][k]);
  const wseries = [0, 1].map((j) => [0, 1, 2].map((k) => vec(j as 0 | 1, k as 0 | 1 | 2)));
  const keys: Key3[] = [];
  const first = full[0].at;
  const last = full[n - 1].at;
  let lastAz: [number, number] | null = null;
  for (let fi = Math.ceil(first * 30 + 1e-6); fi / 30 <= last + 1e-9; fi++) {
    const t = Math.min(last, fi / 30);
    let i = 0;
    while (i < n - 2 && t > full[i + 1].at) i++;
    const T = full[i + 1].at - full[i].at;
    const u = T > 0 ? (t - full[i].at) / T : 1;
    const at = (vals: number[]): number => hermite(vals[i], vals[i + 1], slope(vals, i) * T, slope(vals, i + 1) * T, u);
    const pose: Record<string, number> = {};
    for (const f of SMOOTHED) pose[f] = at(series[f]);
    const [haft, edge] = [0, 1].map((j) => norm([at(wseries[j][0]), at(wseries[j][1]), at(wseries[j][2])] as V3, [0, 0, 1]));
    const sAz = (v: V3, prev: number | undefined): number => {
      let az = Math.atan2(v[1], v[0]) / D;
      if (prev !== undefined) az -= 360 * Math.round((az - prev) / 360);
      return az;
    };
    const wAz = sAz(haft, lastAz?.[0]);
    const pAz = sAz(edge, lastAz?.[1]);
    lastAz = [wAz, pAz];
    keys.push({ at: t, ease: 'lin', pose: { ...(pose as P), wAz, wEl: Math.asin(Math.max(-1, Math.min(1, haft[2]))) / D, pAz, pEl: Math.asin(Math.max(-1, Math.min(1, edge[2]))) / D, lhIn: full[0].q.lhIn, rhIn: full[0].q.rhIn } });
  }
  // (and the last control itself, where it comes to rest, when that is between two frames: a blow that stops dead on the floor stops where it was said to)
  if (keys.length && keys[keys.length - 1].at < last - 1e-6) {
    const q = full[n - 1].q;
    const [haft, edge] = waysOf(q);
    const az = (v: V3, prev: number): number => {
      const a = Math.atan2(v[1], v[0]) / D;
      return a - 360 * Math.round((a - prev) / 360);
    };
    const pose: Record<string, number> = {};
    for (const f of SMOOTHED) pose[f] = q[f] as number;
    keys.push({ at: last, ease: 'lin', pose: { ...(pose as P), wAz: az(haft, lastAz?.[0] ?? 0), wEl: Math.asin(Math.max(-1, Math.min(1, haft[2]))) / D, pAz: az(edge, lastAz?.[1] ?? 0), pEl: Math.asin(Math.max(-1, Math.min(1, edge[2]))) / D, lhIn: full[0].q.lhIn, rhIn: full[0].q.rhIn } });
  }
  return keys;
}

// ---------------------------------------------------------------------------------------------
// HIS GUARD, whence every move begins and where it ends: as his look (art/headsman2.ts H2_GUARD), his right
// hand measured from his chest so that the axe goes with him as he breathes and bounces.

export const H2_READY: Bones = resolvedRest({ ...H2_BASE, ...onChest(H2_GUARD) });
const R = H2_READY;
/** Where his feet stand in his guard. */
const L0 = plantOf(B, 'L', {}, R);
const R0 = plantOf(B, 'R', {}, R);

/** The glint on his edge and the flare in his hood as he holds a blow (0 none to 1): up as it is held, full just before it goes. */
function heldGlint(from: number, full: number, hit: number): (t: number) => number {
  return (t) => (t < from ? 0 : t < full ? (t - from) / (full - from) : t < hit ? 1 : t < hit + 0.12 ? 1 - (t - hit) / 0.12 : 0);
}

// ---------------------------------------------------------------------------------------------
// STANDING: light on his feet, bouncing a little on his knees, his weight going from foot to foot; his
// hood turning to keep you in it. Two seconds round.

export const H2_STAND = 2.0;
function h2Stand(): Motion {
  return {
    loop: 0,
    keys: [
      { at: 0, pose: {} },
      { at: 0.5, pose: { pz: R.pz - 1.8, py: 1.3, roll: -1, bend: R.bend + 1.5, faceTurn: R.faceTurn - 8 }, ease: 'io' },
      { at: 1.0, pose: { pz: R.pz + 0.2, faceTurn: R.faceTurn + 6 }, ease: 'io' },
      { at: 1.5, pose: { pz: R.pz - 1.8, py: -1.3, roll: 1, bend: R.bend + 1.5, faceTurn: R.faceTurn + 2 }, ease: 'io' },
      { at: H2_STAND, pose: {}, ease: 'io' },
    ],
  };
}

// ---------------------------------------------------------------------------------------------
// HIS WALK, A LOW QUICK PROWL: ten frames at fifteen a second, painted for H2_PACE tiles a second; bent
// low and forward, his axe held in his guard, his coat flying behind him. Each foot is down six frames
// of the ten and stays where it came down.

export const H2_WALK_FRAMES = 10;
export const H2_WALK_FPS = 15;
export const H2_PACE = 1.6;
const H2_GROUND = H2_PACE * TILE3;
const STRIDE = H2_GROUND / H2_WALK_FPS;
/** HIS BODY AS HE PROWLS (the middle of it), and the axe as he carries it so: up beside his right shoulder, the head high behind him and its foot before him, clear of his legs as they go. */
const WALK_BODY: P = { px: 2, pz: R.pz - 4, yaw: -20, twist: 4, pitch: R.pitch + 9, bend: R.bend + 3, faceTurn: 8, faceUp: R.faceUp + 4 };
const WALK_AXE: P = onChest(elbowsTo({ ...WALK_BODY, ...grip([10, -19, 82], [-0.72, -0.2, 0.66], [-0.55, -0.15, -0.8], 0.95, null) }, null, [-0.5, -0.5, -0.7]), H2_BASE);
function h2WalkPose(j: number): P {
  const n = H2_WALK_FRAMES;
  const d = STRIDE;
  const SW = [0.15, 0.42, 0.72, 0.94];
  const SZ = [5, 8.5, 7.5, 3.5];
  const SP = [18, 8, -4, -10];
  const foot = (k: number): [number, number, number] => (k <= 5 ? [3 * d - d * k, 0, 0] : [-2 * d + 5 * d * SW[k - 6], SZ[k - 6], SP[k - 6]]);
  const a = (j / n) * Math.PI * 2;
  const [rx, rz, rp] = foot(j);
  const [lx, lz, lp] = foot((j + 5) % n);
  return {
    px: 2, py: -1.6 * Math.sin(a), pz: R.pz - 4 - 1.8 * Math.cos(2 * a),
    yaw: -20 + 6 * Math.cos(a), twist: 4 - 5 * Math.cos(a), pitch: R.pitch + 9 + 1.5 * Math.cos(2 * a), bend: R.bend + 3 + 1.5 * Math.cos(2 * a),
    roll: 3 * Math.sin(a), side: 1.5 * Math.sin(a),
    faceTurn: 8 - 3 * Math.cos(a), faceUp: R.faceUp + 4 - 2 * Math.cos(2 * a), faceTilt: -2 * Math.sin(a),
    rfx: rx, rfz: rz, rfy: R.rfy, rft: R.rft, rk: -16, rfp: rp,
    lfx: lx, lfz: lz, lfy: R.lfy, lft: R.lft, lk: 14, lfp: lp,
    // (his left arm swinging with his stride; the axe as WALK_AXE has it, rocking with his steps)
    lhIn: 0, lhx: 12 + 5 * Math.cos(a), lhy: 7, lhz: H2_HANG + 10, le: -34,
    ...WALK_AXE, rhz: (WALK_AXE.rhz as number) + 1.2 * Math.cos(2 * a), wEl: (WALK_AXE.wEl as number) + 2 * Math.cos(2 * a),
  };
}
function h2Walk(): Motion {
  const keys: Key3[] = [];
  for (let i = 0; i <= H2_WALK_FRAMES; i++) keys.push({ at: i / H2_WALK_FPS, ease: 'lin', pose: h2WalkPose(i % H2_WALK_FRAMES) });
  return { keys, loop: 0 };
}
/**
 * SETTING OFF AND STOPPING. Setting off, the game carries him on at his pace from its first moment: his
 * back (right) foot is lifted and set down a stride ahead, his left stays where it stood until he has gone
 * over it and turns on its ball as he goes. Stopping, from the first frame of his walk (the game lets it
 * come round to it), still carried: his left foot comes through and is set down before him where his guard
 * has it, his right turns on its ball behind him, and he is in his guard where the game stops him.
 */
const WALK0 = h2WalkPose(0);
export const H2_SET_OFF = (L0.at[0] - plantOf(B, 'L', WALK0, R).at[0]) / H2_GROUND;
export const H2_HALT = (plantOf(B, 'R', WALK0, R).at[0] - R0.at[0]) / H2_GROUND;
function h2SetOff(): Motion {
  const T = H2_SET_OFF;
  return { keys: [{ at: 0, pose: {} }, { at: T * 0.5, pose: { ...between(R, WALK0, 0.5, R), pz: (R.pz + (WALK0.pz as number)) / 2 - 1.5 }, ease: 'io' }, { at: T, pose: WALK0, ease: 'io' }] };
}
function h2SetOffFeet(): (t: number) => P {
  const T = H2_SET_OFF;
  const R1 = plantOf(B, 'R', WALK0, R);
  return footwork(B, {
    L: { start: L0, moves: [] },
    R: { start: R0, moves: [{ t0: 0.03, t1: T - 0.02, to: plantBy(R1, H2_GROUND * T, 0), lift: 7 }] },
  }, H2_GROUND);
}
function h2Halt(): Motion {
  const T = H2_HALT;
  return { keys: [{ at: 0, pose: WALK0 }, { at: T * 0.55, pose: { ...between(WALK0, R, 0.55, R), pz: (R.pz + (WALK0.pz as number)) / 2 - 1.2 }, ease: 'io' }, { at: T, pose: {}, ease: 'io' }] };
}
function h2HaltFeet(): (t: number) => P {
  const T = H2_HALT;
  const L1 = plantOf(B, 'L', WALK0, R);
  const R1 = plantOf(B, 'R', WALK0, R);
  return footwork(B, {
    L: { start: L1, moves: [{ t0: 0.02, t1: T - 0.02, to: plantBy(L0, H2_GROUND * T, 0), lift: 7 }] },
    R: { start: R1, moves: [] },
  }, H2_GROUND);
}

// ---------------------------------------------------------------------------------------------
// STRUCK: rocked back a step's worth on his toes, his hood knocked back, his coat flaring, the fire in it
// flaring; and back into his guard.

function h2Struck(): Motion {
  return {
    keys: [
      { at: 0, pose: {} },
      { at: 0.06, pose: { px: -3, pz: R.pz - 1, pitch: R.pitch - 8, bend: R.bend - 7, faceUp: R.faceUp + 14, faceTilt: -6, gale: 0.8 }, ease: 'out' },
      { at: 0.16, pose: { px: -1.5, pz: R.pz - 0.8, pitch: R.pitch - 3, bend: R.bend - 3, faceUp: R.faceUp + 6, gale: 0.3 }, ease: 'io' },
      { at: 0.3, pose: {}, ease: 'io' },
    ],
  };
}
const struckGlint = (t: number): number => (t < 0.05 ? t / 0.05 : Math.max(0, 1 - (t - 0.05) / 0.2));

// ---------------------------------------------------------------------------------------------
// THE LUNGE, his basic blow ("a quick LUNGE that hooks the blade across you"). From his guard he coils:
// his weight back on his right foot, his body wound to his right, the axe swung down and back low behind
// him in both hands at its foot, the blade trailing (held, trembling: the warning). Then all at once his
// left foot shoots a long stride forward, his hips turn, his chest after them, and the blade comes round
// flat and low at full reach and hooks across before him (the blow), on round to his left. He springs back
// onto his guard's feet and brings the axe back up behind his shoulder.

export const H2_LUNGE_HIT = 0.6;
const LUNGE_STEP = 30;
/** Coiled: his weight back, wound to his right, the axe back low behind his right hip, the blade trailing, both hands at its foot. */
const COIL_BODY: P = { px: -6, pz: R.pz - 6, yaw: -58, pitch: 8, twist: -18, bend: 12, faceTurn: 52, faceUp: -6, lk: 30, rk: -28 };
const COIL: P = elbowsTo({ ...COIL_BODY, ...grip([-2, -24, 50], heading(-150, 8), flatEdge(heading(-150, 8)), 0.08, -6) }, [-0.3, 0.6, -0.7], [-0.4, -0.5, -0.7]);
/** Coming round: his hips gone first, the blade still out to his right. */
const ROUND_BODY: P = { px: 6, pz: R.pz - 10, yaw: -24, pitch: 16, twist: -20, bend: 12, faceTurn: 22, faceUp: -12, lk: 40, rk: -14 };
const ROUND: P = elbowsTo({ ...ROUND_BODY, ...grip([22, -24, 52], heading(-82, 2), flatEdge(heading(-82, 2)), 0.06, -6) }, [-0.2, 0.6, -0.7], [-0.2, -0.7, -0.6]);
/** THE BLOW: lunged long and low, his arms out before him, the blade hooking across at full reach. */
const HOOK_BODY: P = { px: 16, pz: R.pz - 14, yaw: -2, pitch: 24, twist: 6, bend: 14, faceTurn: 4, faceUp: -18, lk: 48, rk: -6 };
const HOOK: P = elbowsTo({ ...HOOK_BODY, ...grip([44, -4, 46], heading(16, -4), flatEdge(heading(16, -4)), 0.04, -6) }, [-0.2, 0.7, -0.6], [-0.2, -0.7, -0.6]);
/** On round to his left, his body wound after it. */
const FOLLOW_BODY: P = { px: 14, pz: R.pz - 12, yaw: 10, pitch: 18, twist: 22, bend: 12, faceTurn: -6, faceUp: -14, lk: 44, rk: -8 };
const FOLLOW: P = elbowsTo({ ...FOLLOW_BODY, ...grip([36, 16, 48], heading(82, -6), flatEdge(heading(82, -6)), 0.06, -6) }, [-0.3, 0.6, -0.6], [0.1, -0.8, -0.5]);
/** Springing back: the axe swung up before him, upright, in both hands at its foot, the head high; on its way back behind his shoulder. */
const LIFT_BODY: P = { px: 4, pz: R.pz - 8, yaw: -26, pitch: 10, twist: 2, bend: 9, faceTurn: 20, faceUp: -8, lk: 26, rk: -22 };
const LIFT: P = elbowsTo({ ...LIFT_BODY, ...grip([30, -6, 70], [0.42, -0.36, 0.83], [-0.6, -0.6, 0], 0.08, -6) }, [-0.3, 0.6, -0.7], [-0.3, -0.7, -0.6]);
/** Settling: the axe behind his right shoulder as his guard has it, his right hand still low on it, sliding up to its middle. */
const SETTLE: P = { ...grip([4, -16, 74], [-0.42, -0.2, 0.88], [-0.1, -1, 0], 0.5, null), lhIn: 0, lhx: 21, lhy: -1, lhz: -21, le: -52, re: 30 };
/** On the way into the coil: his hands slid to the foot of the haft, the head going down behind him. */
const INTO_COIL: P = elbowsTo({ ...between(R, COIL_BODY, 0.5, R), ...grip([0, -21, 58], heading(-152, 36), flatEdge(heading(-152, 36)), 0.08, -6) }, [-0.3, 0.6, -0.7], [-0.4, -0.5, -0.7]);
function h2Lunge(): Motion {
  const H = H2_LUNGE_HIT;
  return {
    hit: H,
    keys: [
      { at: 0, pose: {} },
      { at: 0.13, pose: INTO_COIL, ease: 'in' },
      { at: 0.26, pose: COIL, ease: 'out' },
      { at: 0.36, pose: trembling(COIL, 0.6), ease: 'hold' },
      { at: 0.44, pose: trembling(COIL, -0.5, { twist: -20 }), ease: 'hold' },
      { at: H - 0.1, pose: trembling(COIL, 0.5, { px: -7, twist: -21 }), ease: 'hold' },
      { at: H - 0.05, pose: ROUND, ease: 'in' },
      { at: H, pose: HOOK, ease: 'lin' },
      { at: H + 0.14, pose: FOLLOW, ease: 'out' },
      { at: H + 0.28, pose: { ...FOLLOW, pz: R.pz - 13, twist: 24 }, ease: 'io' },
      { at: H + 0.46, pose: LIFT, ease: 'in' },
      { at: H + 0.68, pose: SETTLE, ease: 'out' },
      { at: H + 0.9, pose: {}, ease: 'io' },
    ],
  };
}
function h2LungeFeet(): (t: number) => P {
  const H = H2_LUNGE_HIT;
  return footwork(B, {
    L: { start: L0, moves: [{ t0: H - 0.1, t1: H - 0.01, to: plantBy(L0, LUNGE_STEP, 2, 6), lift: 6 }, { t0: H + 0.32, t1: H + 0.56, to: L0, lift: 6 }] },
    R: { start: R0, moves: [{ t0: H - 0.08, t1: H + 0.04, to: { ...R0, pitch: 30 } }, { t0: H + 0.36, t1: H + 0.6, to: R0 }] },
  });
}

// ---------------------------------------------------------------------------------------------
// THE FLURRY ("three darting dashes at you with a cut at each"). He coils, the axe cocked high behind his
// right shoulder in both hands at its foot (held, trembling: the warning); then he darts: forward and to
// his left, the blade coming down across him from high on his right to low on his left (the first cut);
// forward and to his right, the blade round behind his left shoulder, over the top and down across him from
// his left to his right (the second); and straight on, the axe brought over his head and down before him (the
// third, the heaviest), its blade biting the floor and stopped dead there. Then wrenched up out of it and
// into his guard where he has come to: H2_SHIFT.flurry on from where he began.

export { H2_FLURRY_HITS };
const FL_STEP = 30;
const FL_SIDE = 20;
/** Where he is after each dart (his own lengths: forward, to his left). */
const FL_AT: ReadonlyArray<readonly [number, number]> = [[0, 0], [FL_STEP, FL_SIDE], [2 * FL_STEP, -FL_SIDE], [3 * FL_STEP, 0]];
/** The edge facing the way the blade goes from where the haft ran a moment before to where it runs a moment after. */
const cutEdge = (pt: V3, before: V3, after: V3): V3 => {
  const p = norm(pt);
  const d = sub(norm(after), norm(before));
  return norm(sub(d, mul(p, dot(d, p))), [0, 0, -1]);
};
/** A key of the flurry: his body (at `at`, one of FL_AT, and as `body` has it), the axe in both hands at its foot, its haft running `pt` (its edge facing the way from `before` to `after`), his right hand at `hand` from where he is. */
function flKey(at: readonly [number, number], body: P, hand: V3, pt: V3, before: V3, after: V3, wantL: V3, wantR: V3): P {
  const h: V3 = [at[0] + hand[0], at[1] + hand[1], hand[2]];
  return elbowsTo({ ...body, px: at[0] + ((body.px as number | undefined) ?? 0), py: at[1] + ((body.py as number | undefined) ?? 0), ...grip(h, pt, cutEdge(pt, before, after), 0, -4) }, wantL, wantR);
}
// (the ways the haft runs through the three cuts, a figure of eight: down across him from his right to his
// left, round behind his left shoulder and over the top, down across him from his left to his right, round
// behind his right shoulder and over the top, and straight down before him: the edge always leading)
const FW_COCK = heading(-130, 35);
const FW_HIGH1 = heading(-23, 46);
const FW_CUT1 = heading(30, -12);
const FW_FOLLOW1 = heading(38, -14);
const FW_LOW1 = heading(100, -24);
const FW_BACK1 = heading(165, 28);
const FW_TOP1 = heading(150, 82);
const FW_CUT2 = heading(-35, -12);
const FW_FOLLOW2 = heading(-50, -16);
const FW_LOW2 = heading(-100, -24);
const FW_BACK2 = heading(-165, 28);
const FW_TOP2 = heading(-150, 82);
const FW_CUT3 = heading(0, -6);
const FW_DOWN3 = heading(2, -14);
const COCK_BODY: P = { px: -4, pz: R.pz - 6, yaw: -46, pitch: 4, twist: -14, bend: 8, faceTurn: 40, faceUp: -4, lk: 28, rk: -24 };
const mid2 = (a: readonly [number, number], b: readonly [number, number], k = 0.5): [number, number] => [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k];
const FL_COCK = flKey(FL_AT[0], COCK_BODY, [10, -24, 80], FW_COCK, FW_COCK, FW_HIGH1, [-0.2, 0.6, -0.7], [-0.4, -0.6, -0.6]);
const FL_HIGH1 = flKey(mid2(FL_AT[0], FL_AT[1], 0.45), { px: 4, pz: R.pz - 8, yaw: -18, pitch: 10, twist: -2, bend: 10, faceTurn: 10, faceUp: -10, lk: 30, rk: -20 }, [27, -14, 84], FW_HIGH1, FW_COCK, FW_CUT1, [-0.2, 0.6, -0.7], [-0.3, -0.7, -0.6]);
const CUT_BODY: P = { px: -4, pz: R.pz - 12, yaw: -10, pitch: 20, twist: 10, bend: 14, faceTurn: 6, faceUp: -16, lk: 40, rk: -14 };
const FL_CUT1 = flKey(FL_AT[1], CUT_BODY, [34, 6, 64], FW_CUT1, FW_HIGH1, FW_FOLLOW1, [-0.2, 0.7, -0.6], [-0.2, -0.7, -0.6]);
const FL_FOLLOW1 = flKey(FL_AT[1], { ...CUT_BODY, yaw: -6, twist: 14, faceTurn: 2 }, [35, 10, 63], FW_FOLLOW1, FW_CUT1, FW_LOW1, [-0.2, 0.7, -0.6], [-0.1, -0.8, -0.6]);
const FL_LOW1 = flKey(FL_AT[1], { ...CUT_BODY, yaw: 0, twist: 18, faceTurn: -4 }, [30, 20, 66], FW_LOW1, FW_FOLLOW1, FW_BACK1, [-0.2, 0.7, -0.6], [0, -0.8, -0.5]);
const FL_BACK1 = flKey(mid2(FL_AT[1], FL_AT[2], 0.3), { px: -2, pz: R.pz - 8, yaw: -6, pitch: 10, twist: 20, bend: 8, faceTurn: -6, faceUp: -4, lk: 34, rk: -18 }, [14, 24, 84], FW_BACK1, FW_LOW1, FW_TOP1, [0, 0.8, -0.5], [0.3, -0.6, -0.7]);
const FL_TOP1 = flKey(mid2(FL_AT[1], FL_AT[2], 0.65), { px: 0, pz: R.pz - 6, yaw: -14, pitch: 4, twist: 6, bend: 2, faceTurn: 4, faceUp: 6, lk: 32, rk: -20 }, [18, 8, 104], FW_TOP1, FW_BACK1, FW_CUT2, [0.2, 0.8, -0.3], [0.2, -0.8, -0.3]);
const FL_CUT2 = flKey(FL_AT[2], { ...CUT_BODY, yaw: -26, twist: -12, faceTurn: 20 }, [30, -6, 60], FW_CUT2, FW_TOP1, FW_FOLLOW2, [-0.2, 0.7, -0.6], [-0.2, -0.7, -0.6]);
const FL_FOLLOW2 = flKey(FL_AT[2], { ...CUT_BODY, yaw: -28, twist: -16, faceTurn: 22 }, [31, -10, 60], FW_FOLLOW2, FW_CUT2, FW_LOW2, [-0.2, 0.7, -0.6], [-0.2, -0.7, -0.6]);
const FL_LOW2 = flKey(FL_AT[2], { ...CUT_BODY, yaw: -34, twist: -20, faceTurn: 28 }, [28, -22, 66], FW_LOW2, FW_FOLLOW2, FW_BACK2, [-0.1, 0.7, -0.6], [-0.2, -0.8, -0.5]);
const FL_BACK2 = flKey(mid2(FL_AT[2], FL_AT[3], 0.3), { px: -2, pz: R.pz - 8, yaw: -40, pitch: 8, twist: -18, bend: 8, faceTurn: 34, faceUp: -4, lk: 34, rk: -18 }, [12, -26, 84], FW_BACK2, FW_LOW2, FW_TOP2, [0.2, 0.6, -0.7], [-0.2, -0.8, -0.5]);
const FL_TOP2 = flKey(mid2(FL_AT[2], FL_AT[3], 0.65), { px: 0, pz: R.pz - 6, yaw: -24, pitch: 4, twist: -6, bend: 2, faceTurn: 16, faceUp: 6, lk: 32, rk: -20 }, [18, -8, 104], FW_TOP2, FW_BACK2, FW_CUT3, [0.2, 0.8, -0.3], [0.2, -0.8, -0.3]);
const FL_CUT3 = flKey(FL_AT[3], { px: -6, pz: R.pz - 13, yaw: -8, pitch: 20, twist: 0, bend: 15, faceTurn: 6, faceUp: -18, lk: 44, rk: -12 }, [34, -4, 64], FW_CUT3, FW_TOP2, FW_DOWN3, [-0.1, 0.6, -0.8], [-0.1, -0.6, -0.8]);
// (the third bites the floor before him, its edge a little way into the stone, and stops dead there: and stays
// bitten while he sinks into it, his hands where it stopped)
const FL_DOWN3 = flKey(FL_AT[3], { px: -6, pz: R.pz - 15, yaw: -8, pitch: 24, twist: 0, bend: 17, faceTurn: 6, faceUp: -22, lk: 44, rk: -12 }, [36, -4, 53], FW_DOWN3, FW_CUT3, FW_DOWN3, [-0.1, 0.6, -0.8], [-0.1, -0.6, -0.8]);
const FL_DEEP3 = flKey(FL_AT[3], { px: -5, pz: R.pz - 16, yaw: -8, pitch: 26, twist: 0, bend: 18, faceTurn: 6, faceUp: -24, lk: 44, rk: -12 }, [36, -4, 53], FW_DOWN3, FW_CUT3, FW_DOWN3, [-0.1, 0.6, -0.8], [-0.1, -0.6, -0.8]);
/** Up out of it: the axe raised before him, upright, on its way back behind his shoulder. */
const FL_UP = elbowsTo({ px: FL_AT[3][0] + 2, py: FL_AT[3][1], pz: R.pz - 8, yaw: -26, pitch: 10, twist: 2, bend: 9, faceTurn: 20, faceUp: -8, lk: 26, rk: -22, ...grip([FL_AT[3][0] + 30, FL_AT[3][1] - 6, 70], [0.42, -0.36, 0.83], [0.3, -0.9, -0.2], 0.08, -6) }, [-0.3, 0.6, -0.7], [-0.3, -0.7, -0.6]);
/** Home: his guard where he has come to, his left hand still on the haft below his right (it lets go as he settles). */
const FL_HOME: P = elbowsTo({ px: FL_AT[3][0], py: FL_AT[3][1], ...grip([FL_AT[3][0] + 2, FL_AT[3][1] - 15, 66], [-0.42, -0.2, 0.88], [-0.1, -1, 0], 1, -22) }, [-0.3, 0.6, -0.7], null);
const FL_SETTLE: P = { px: FL_AT[3][0], py: FL_AT[3][1], ...grip([FL_AT[3][0] + 4, FL_AT[3][1] - 16, 74], [-0.42, -0.2, 0.88], [-0.1, -1, 0], 0.5, null), lhIn: 0, lhx: 21, lhy: -1, lhz: -21, le: -52, re: 30 };
function h2Flurry(): Motion {
  const [H1, H2, H3] = H2_FLURRY_HITS;
  const go = 0.42;
  const tremble = trembling(FL_COCK, 0.4, { twist: -16 });
  return {
    hit: H1,
    keys: [
      { at: 0, pose: {} },
      { at: 0.22, pose: FL_COCK, ease: 'io' },
      { at: 0.29, pose: trembling(FL_COCK, 0.6), ease: 'hold' },
      { at: 0.36, pose: trembling(FL_COCK, -0.5, { twist: -15 }), ease: 'hold' },
      { at: go, pose: tremble, ease: 'hold' },
      ...sweep([
        { at: go, pose: tremble },
        // (his hips turn first, the axe still back)
        { at: 0.48, pose: { ...trembling(FL_COCK, 0.2, { twist: -24 }), yaw: -32 } },
        { at: H1 - 0.065, pose: FL_HIGH1 },
        { at: H1, pose: FL_CUT1 },
        { at: H1 + 0.14, pose: FL_FOLLOW1 },
      ]).slice(1),
      // (caught, and round behind his left shoulder and over the top into the second; and on round behind his right and over the top into the third, the heaviest)
      ...sweep([
        { at: H1 + 0.14, pose: FL_FOLLOW1 },
        { at: H1 + 0.21, pose: FL_LOW1 },
        { at: H1 + 0.28, pose: FL_BACK1 },
        { at: H1 + 0.37, pose: FL_TOP1 },
        { at: H2, pose: FL_CUT2 },
        { at: H2 + 0.12, pose: FL_FOLLOW2 },
        { at: H2 + 0.2, pose: FL_LOW2 },
        { at: H2 + 0.28, pose: FL_BACK2 },
        { at: H2 + 0.37, pose: FL_TOP2 },
        { at: H3, pose: FL_CUT3 },
        { at: H3 + 0.08, pose: FL_DOWN3 },
      ]).slice(1),
      { at: H3 + 0.2, pose: FL_DEEP3, ease: 'out' },
      // (wrenched out of the floor and up, and into his guard)
      ...sweep([
        { at: H3 + 0.2, pose: FL_DEEP3 },
        { at: H3 + 0.42, pose: FL_UP },
        { at: H3 + 0.64, pose: FL_HOME },
      ]).slice(1),
      { at: H3 + 0.84, pose: { px: FL_AT[3][0], py: FL_AT[3][1] }, ease: 'io' },
    ],
  };
}
function h2FlurryFeet(): (t: number) => P {
  const [H1, H2, H3] = H2_FLURRY_HITS;
  const by = (p: Plant, i: number): Plant => plantBy(p, FL_AT[i][0], FL_AT[i][1]);
  return footwork(B, {
    L: { start: L0, moves: [{ t0: H1 - 0.15, t1: H1 - 0.02, to: by(L0, 1), lift: 7 }, { t0: H2 - 0.15, t1: H2 - 0.02, to: by(L0, 2), lift: 7 }, { t0: H3 - 0.15, t1: H3 - 0.02, to: by(L0, 3), lift: 7 }] },
    R: { start: R0, moves: [{ t0: H1 - 0.1, t1: H1 + 0.05, to: by(R0, 1), lift: 6 }, { t0: H2 - 0.1, t1: H2 + 0.05, to: by(R0, 2), lift: 6 }, { t0: H3 - 0.1, t1: H3 + 0.05, to: by(R0, 3), lift: 6 }] },
  });
}

// ---------------------------------------------------------------------------------------------
// THE BLADE WHEEL ("the axe spun before him as he drives through you"). He squares up and raises the axe
// upright before him in his right hand, at its middle, his left arm back (held, the edge glinting: the
// warning); then he spins it like a staff, a wheel of steel before him, faster and faster, and drives
// forward behind it, H2_WHEEL.drive tiles, running; the wheel slows, and he brings the axe round and up
// behind his shoulder into his guard where he has come to (H2_SHIFT.wheel).

export const H2_WHEEL = {
  /** How long it is; the warning held; the spin, going and stopping (seconds). */
  long: 2.36,
  warnFrom: 0.24,
  spin: 0.5,
  full: 0.78,
  slow: 1.62,
  stop: 1.86,
  /** The first time its blade comes down before him (the blow: it strikes each time it comes round, the rules' to say how often). */
  hit: 0.8,
  /** How far he drives (tiles), from when to when (seconds); turns a second at full spin. */
  drive: 2.5,
  driveFrom: 0.6,
  driveTo: 1.7,
  turns: 30 / 11,
};
/** Where his right hand holds the wheel, before him (from where he is), and how he leans into it. */
const WH_HAND: V3 = [38, -4, 82];
const WH_BODY: P = { pz: R.pz - 6, yaw: -6, pitch: 12, roll: 0, twist: -2, bend: 10, side: 0, faceTurn: 4, faceUp: -6, lk: 30, rk: -22, lhIn: 0, lhx: -8, lhy: 10, lhz: -34, le: -20, gale: 0.2 };
/** The way the haft runs and the edge faces at `phi` degrees round the wheel (0: the head out to his left, 90: straight up), the wheel square before him. */
const wheelWays = (phi: number): [V3, V3] => {
  const a = phi * D;
  return [[0, Math.cos(a), Math.sin(a)], [0, -Math.sin(a), Math.cos(a)]];
};
/** How far round the wheel has gone (degrees) `t` seconds into the move. */
function wheelAngle(t: number): number {
  const W = H2_WHEEL;
  const top = W.turns * 360;
  // (its speed: none to the full, eased, from `spin` to `full`; held; and down again from `slow` to `stop`)
  const up = W.full - W.spin;
  const down = W.stop - W.slow;
  if (t <= W.spin) return 90;
  // (the angle is the speed's integral: a smooth ramp up is half its length at full speed, and so on)
  const ramp = (u: number): number => u * u * u * (1 - u / 2);
  if (t <= W.full) return 90 + top * up * ramp((t - W.spin) / up);
  const a1 = 90 + top * up * 0.5;
  if (t <= W.slow) return a1 + top * (t - W.full);
  const a2 = a1 + top * (W.slow - W.full);
  if (t <= W.stop) {
    const u = (t - W.slow) / down;
    return a2 + top * down * (u - ramp(u));
  }
  return a2 + top * down * 0.5;
}
/** Where he is (his own lengths forward) `t` seconds in, driving. */
function wheelAt(t: number): number {
  const W = H2_WHEEL;
  return W.drive * TILE3 * smooth01Of((t - W.driveFrom) / (W.driveTo - W.driveFrom));
}
const smooth01Of = (u: number): number => {
  const k = clamp01(u);
  return k * k * (3 - 2 * k);
};
function h2Wheel(): Motion {
  const W = H2_WHEEL;
  const keys: Key3[] = [{ at: 0, pose: {} }];
  // (squared up, the axe raised upright before him in his right hand: the start of the wheel)
  const raise = (t: number, dz = 0): P => {
    const [haft, edge] = wheelWays(wheelAngle(t));
    const x = wheelAt(t);
    return elbowsTo({ ...WH_BODY, px: x + 4, ...grip([x + WH_HAND[0], WH_HAND[1], WH_HAND[2] + dz], haft, edge, 1, null) }, null, [0, -0.6, -0.8]);
  };
  // (the axe brought forward first, still leaning back, clear of his shoulder and his hood; then upright)
  keys.push({ at: 0.12, pose: elbowsTo({ ...between(R, WH_BODY, 0.5, R), px: 2, ...grip([20, -20, 74], [-0.18, -0.25, 0.95], [0, -1, 0], 1, null) }, null, [0, -0.6, -0.8]), ease: 'in' });
  keys.push({ at: 0.24, pose: raise(0), ease: 'out' });
  keys.push({ at: 0.32, pose: raise(0, 0.6), ease: 'hold' });
  keys.push({ at: 0.4, pose: raise(0, -0.5), ease: 'hold' });
  keys.push({ at: W.spin, pose: raise(0, 0.3), ease: 'hold' });
  // (the wheel: a key every frame, the axe round as far as its speed has taken it, he driving forward behind it, bobbing as he runs)
  for (let i = Math.round(W.spin * 30) + 1; i / 30 <= W.stop + 1e-9; i++) {
    const t = i / 30;
    const run = clamp01((t - W.driveFrom) / (W.driveTo - W.driveFrom));
    const bob = run > 0 && run < 1 ? Math.sin(run * Math.PI * 4) : 0;
    const p = raise(t);
    // (and the wheel of fire, as fast as it spins: carried on `gale`, which also blows his coat back)
    const spin = t < W.full ? smooth01Of((t - W.spin) / (W.full - W.spin)) : t < W.slow ? 1 : 1 - smooth01Of((t - W.slow) / (W.stop - W.slow));
    keys.push({ at: t, ease: 'lin', pose: { ...p, pz: (WH_BODY.pz as number) - 2 * Math.abs(bob), pitch: (WH_BODY.pitch as number) + 6 * Math.sin(run * Math.PI), gale: 0.2 + 0.8 * spin } });
  }
  // (and round and up behind his shoulder, his guard where he has come to)
  const x = wheelAt(W.stop);
  const home: P = { px: x, ...grip([x + 2, -15, 66], [-0.42, -0.2, 0.88], [-0.1, -1, 0], 1, null), lhIn: 0, lhx: 21, lhy: -1, lhz: -21, le: -52, re: 30 };
  keys.push({ at: W.stop + 0.1, pose: elbowsTo({ ...WH_BODY, px: x + 2, ...grip([x + 22, -20, 78], [-0.18, -0.25, 0.95], [0, -1, 0], 1, null) }, null, [0, -0.6, -0.8]), ease: 'in' });
  keys.push({ at: W.stop + 0.2, pose: elbowsTo({ px: x + 1, ...grip([x + 12, -24, 70], [-0.32, -0.3, 0.9], [-0.05, -1, 0], 1, null), lhIn: 0, lhx: 21, lhy: -1, lhz: -21, le: -52 }, null, [-0.4, -0.7, -0.5]), ease: 'lin' });
  keys.push({ at: W.stop + 0.3, pose: home, ease: 'out' });
  keys.push({ at: W.long, pose: { px: x }, ease: 'io' });
  return { hit: W.hit, keys };
}
function h2WheelFeet(): (t: number) => P {
  const W = H2_WHEEL;
  const step = (W.drive * TILE3) / 2;
  const T = (W.driveTo - W.driveFrom) / 4;
  const t0 = W.driveFrom;
  return footwork(B, {
    L: { start: L0, moves: [{ t0, t1: t0 + T, to: plantBy(L0, step * 0.5, 0), lift: 8 }, { t0: t0 + T * 2 - 0.02, t1: t0 + T * 3, to: plantBy(L0, step * 1.5, 0), lift: 8 }, { t0: t0 + T * 3.2, t1: W.driveTo + 0.06, to: plantBy(L0, step * 2, 0), lift: 6 }] },
    R: { start: R0, moves: [{ t0: t0 + T - 0.02, t1: t0 + T * 2, to: plantBy(R0, step, 0), lift: 8 }, { t0: t0 + T * 3 - 0.02, t1: W.driveTo + 0.1, to: plantBy(R0, step * 2, 0), lift: 8 }] },
  });
}

// ---------------------------------------------------------------------------------------------
// THE VAULT ("up on the haft and down blade-first on a marked spot"). He drives the spike at the axe's
// foot into the floor before him and to his right, crouches behind it gripping the haft high (held, the
// edge glinting high over him: the warning; the game marks the spot), springs up off it, pushing himself
// up and over on the haft, tears it out of the floor at the top of his leap and swings it up over his head,
// and comes down with it, blade first, onto the spot; lands crouched, the blade bitten into the floor; wrenches
// it out and is in his guard where he landed (H2_SHIFT.vault).

export const H2_VAULT = {
  /** How long it is (seconds); the warning; when he leaves the floor, is at the top, the blade bites, he lands. */
  long: 2.0,
  warnFrom: 0.26,
  off: 0.56,
  top: 0.84,
  hit: 1.12,
  land: 1.1,
  /** How far he goes (his own lengths forward), and how high his hips go. */
  far: 60,
  high: 42,
};
/** Where the spike is driven in (his own lengths: forward, to his left, up), and the way the haft leans from it. */
const VT_SPIKE: V3 = [36, -40, 6];
const VT_PT: V3 = norm([-0.14, -0.12, 0.98]);
/** His hands on the planted haft: his right at its middle, his left above it. */
const VT_HAND: V3 = add(VT_SPIKE, mul(VT_PT, AXE2_HOLD(1)));
const VT_PLANT = (body: P): P => elbowsTo({ ...body, ...grip(VT_HAND, VT_PT, [0, -1, 0], 1, null), lhIn: 0, lhx: 16, lhy: 10, lhz: -18, le: -40 }, null, [0.2, -0.9, -0.3]);
/** Where his right hand is as the blade bites (his own lengths from where he set out), and the way the haft runs then: its edge a little way into the floor, no more (tests/headsman2.test.ts). */
const VT_BITE_HAND: V3 = [H2_VAULT.far + 36, -4, 62];
const VT_BITE_WAY: V3 = heading(0, -19);
/** How far the blade drives on into the stone after it strikes it (the blow's follow-through: game pixels, near enough). */
const VT_BITE = 5;
const VT_CROUCH: P = { px: 4, pz: R.pz - 16, yaw: -16, pitch: 22, twist: -6, bend: 16, faceTurn: 10, faceUp: 4, lk: 46, rk: -30 };
function h2Vault(): Motion {
  const V = H2_VAULT;
  const F = V.far;
  const crouch = VT_PLANT(VT_CROUCH);
  // (on the way: the axe swung forward and down, its foot going to the floor)
  const swing = elbowsTo({ ...between(R, VT_CROUCH, 0.5, R), ...grip([26, -24, 62], norm([-0.28, -0.16, 0.95]), [0, -1, 0], 1, null) }, null, [0.2, -0.9, -0.3]);
  // (pushing up off the haft, his hands still on it where it stands)
  const push = VT_PLANT({ px: 18, pz: R.pz + 6, yaw: -12, pitch: 26, twist: -4, bend: 10, faceTurn: 6, faceUp: -4, lk: 30, rk: -20 });
  // (going up: torn out of the floor, the axe lifted up and out to his right, both hands coming to its foot)
  const lift = elbowsTo({ px: F * 0.4, pz: R.pz + V.high * 0.8, yaw: -12, pitch: 10, twist: -6, bend: 4, faceTurn: 6, faceUp: 0, lk: 46, rk: -36, ...grip([F * 0.4 + 28, -30, 112], norm([-0.25, -0.35, 0.9]), [0, -1, 0], 0.3, -6) }, [0.3, 0.9, -0.2], [0.2, -0.9, -0.3]);
  // (at the top: torn out of the floor and swung up over his head, its head back over his right shoulder, both hands at its foot)
  const top = elbowsTo({ px: F * 0.6, pz: R.pz + V.high, yaw: -10, pitch: -4, twist: -4, bend: -6, faceTurn: 4, faceUp: 6, lk: 50, rk: -40, ...grip([F * 0.6 + 26, -6, 128], heading(-170, 42), [0, 0, 1], 0, -4) }, [0.3, 0.9, 0], [0.3, -0.9, 0]);
  // (over the top, coming down)
  const over = elbowsTo({ px: F * 0.85, pz: R.pz + V.high * 0.5, yaw: -6, pitch: 4, twist: 0, bend: 2, faceTurn: 2, faceUp: 0, lk: 40, rk: -36, ...grip([F * 0.85 + 36, -6, 110], heading(-10, 64), [1, 0, 0], 0, -4) }, [0.4, 0.9, -0.1], [0.4, -0.9, -0.1]);
  // (THE BLOW: down, blade first, onto the spot, its edge bitten a little way into the stone and stopped
  // dead there; he lands crouched behind it, his arms out straight; and it stays bitten while he sinks onto his
  // heels, his hands still on the haft where it stopped)
  const bite = elbowsTo({ px: F, pz: R.pz - 16, yaw: -4, pitch: 16, twist: 0, bend: 10, faceTurn: 2, faceUp: -20, lk: 40, rk: -24, ...grip(add(VT_BITE_HAND, [0, 0, VT_BITE]), VT_BITE_WAY, [-0.53, 0, -0.85], 0, -4) }, [-0.1, 0.6, -0.8], [-0.1, -0.6, -0.8]);
  const held = elbowsTo({ ...bite, pz: R.pz - 18, pitch: 18, faceUp: -22, ...grip(VT_BITE_HAND, VT_BITE_WAY, [-0.53, 0, -0.85], 0, -4) }, [-0.1, 0.6, -0.8], [-0.1, -0.6, -0.8]);
  // (wrenched out, raised before him; and into his guard)
  const up = elbowsTo({ px: F + 2, pz: R.pz - 8, yaw: -26, pitch: 10, twist: 2, bend: 9, faceTurn: 20, faceUp: -8, lk: 26, rk: -22, ...grip([F + 30, -6, 76], [0.42, -0.36, 0.83], [-0.6, -0.6, 0], 0.08, -6) }, [-0.3, 0.6, -0.7], [-0.3, -0.7, -0.6]);
  const home = elbowsTo({ px: F, ...grip([F + 2, -15, 66], [-0.42, -0.2, 0.88], [-0.1, -1, 0], 1, -22) }, [-0.3, 0.6, -0.7], null);
  return {
    hit: V.hit,
    keys: [
      { at: 0, pose: {} },
      { at: 0.12, pose: swing, ease: 'in' },
      { at: 0.24, pose: crouch, ease: 'out' },
      { at: 0.32, pose: { ...crouch, pz: (crouch.pz as number) - 0.6 }, ease: 'hold' },
      { at: 0.4, pose: { ...crouch, pz: (crouch.pz as number) + 0.4 }, ease: 'hold' },
      { at: 0.48, pose: { ...crouch, pz: (crouch.pz as number) - 1.2, bend: 17 }, ease: 'hold' },
      ...sweep([
        { at: 0.48, pose: { ...crouch, pz: (crouch.pz as number) - 1.2, bend: 17 } },
        { at: V.off, pose: push },
        { at: (V.off + V.top) / 2 + 0.02, pose: lift },
        { at: V.top, pose: top },
        { at: V.top + 0.14, pose: over },
        { at: V.hit, pose: bite },
      ]).slice(1),
      { at: V.hit + 0.12, pose: held, ease: 'out' },
      { at: V.hit + 0.3, pose: { ...held, pz: R.pz - 19 }, ease: 'io' },
      { at: V.hit + 0.5, pose: up, ease: 'in' },
      { at: V.hit + 0.64, pose: { px: F, ...grip([F + 4, -16, 74], [-0.42, -0.2, 0.88], [-0.1, -1, 0], 0.5, null), lhIn: 0, lhx: 21, lhy: -1, lhz: -21, le: -52, re: 30 }, ease: 'out' },
      { at: V.hit + 0.78, pose: home, ease: 'io' },
      { at: V.long, pose: { px: F }, ease: 'io' },
    ],
  };
}
function h2VaultFeet(): (t: number) => P {
  const V = H2_VAULT;
  return footwork(B, {
    L: { start: L0, moves: [{ t0: V.off - 0.02, t1: V.land, to: plantBy(L0, V.far, 0), lift: 34 }] },
    R: { start: R0, moves: [{ t0: V.off - 0.06, t1: V.land + 0.03, to: plantBy(R0, V.far, 0), lift: 30 }] },
  });
}

// ---------------------------------------------------------------------------------------------
// HIS DASHES (his pick by 15:55, "Darting dashes": quick sideways dashes and sudden lunges). A quick bound
// to his left (dashL) or his right (dashR), low, H2_DASH tiles: he dips, pushes off the far foot, flies
// low with both feet up, his coat streaming after him, lands on the near foot and then the other, and is
// in his guard where he landed. The game moves him by H2_SHIFT when it ends.

export const H2_DASH = 1.5;
export const H2_DASH_TIME = 0.5;
function h2Dash(left: boolean): Motion {
  const D2 = (left ? 1 : -1) * H2_DASH * TILE3;
  const s = left ? 1 : -1;
  return {
    keys: [
      { at: 0, pose: {} },
      // (he dips, his weight going over onto the near foot)
      { at: 0.08, pose: { py: s * 2, pz: R.pz - 4, roll: -s * 3, bend: R.bend + 3, faceTurn: R.faceTurn + s * 6, draw: 0.6, rhz: (R.rhz as number) + 4 }, ease: 'io' },
      // (off: low and long through the air, leaning into it)
      { at: 0.2, pose: { py: D2 * 0.45, pz: R.pz - 1, roll: -s * 8, side: -s * 4, bend: R.bend + 4, faceTurn: R.faceTurn - s * 4, gale: 0.4, draw: 0.5, rhz: (R.rhz as number) + 6 }, ease: 'in' },
      { at: 0.31, pose: { py: D2 * 0.86, pz: R.pz - 5, roll: -s * 5, side: -s * 3, bend: R.bend + 5, gale: 0.3, draw: 0.5, rhz: (R.rhz as number) + 6 }, ease: 'lin' },
      // (down on the near foot, sinking into it; the other comes down)
      { at: 0.4, pose: { py: D2 * 0.98, pz: R.pz - 7, roll: s * 2, bend: R.bend + 4, faceTurn: R.faceTurn + s * 3, gale: 0.1, draw: 0.7, rhz: (R.rhz as number) + 3 }, ease: 'out' },
      { at: H2_DASH_TIME, pose: { py: D2 }, ease: 'io' },
    ],
  };
}
function h2DashFeet(left: boolean): (t: number) => P {
  const D2 = (left ? 1 : -1) * H2_DASH * TILE3;
  const near = left ? 'L' : 'R';
  const far = left ? 'R' : 'L';
  const start = { L: L0, R: R0 };
  const tracks: Partial<Record<'L' | 'R', FootTrack>> = {
    [near]: { start: start[near], moves: [{ t0: 0.1, t1: 0.33, to: plantBy(start[near], 0, D2), lift: 9 }] },
    [far]: { start: start[far], moves: [{ t0: 0.16, t1: 0.42, to: plantBy(start[far], 0, D2), lift: 7 }] },
  };
  return footwork(B, tracks);
}

// ---------------------------------------------------------------------------------------------
// HIS HOOD FALLS EMPTY (his death, as the first Headsman's, which the owner said yes to: by 16:46 on 9 Oct,
// "His hood falls empty"; of its fall, by 21:33, "Yes, keep it (Recommended)", the elbows never up):
// rocked back, the fire in his hood flaring; the axe slips from his hands and falls; his knees give and he
// sinks onto them, swaying, the fire guttering out; he folds forward and topples onto his face; his hood
// slides off his shoulders and falls by itself, empty, the last of the pink rising out of his collar.

export const H2_DIE_TIME = 2.6;
const DIE_FEET = ((): Record<'L' | 'R', Plant> => ({ L: plantBy(L0, R0.at[0] - L0.at[0] + 6, 0), R: R0 }))();
const TUCK = 58;
const KNEE_DOWN = B.legR[1] * 1.05;
const kneeling = (lean: number, body: P): P => kneelSettle(B, R, { ...kneelHips(B, R, DIE_FEET, TUCK, KNEE_DOWN, lean), ...body }, DIE_FEET, TUCK, KNEE_DOWN);
/** His arms hanging at his sides, clear of his coat. */
const HANGING: P = { lhIn: 0, lhx: 6, lhy: 10, lhz: H2_HANG + 4, le: -8, rhIn: 0, rhx: 7, rhy: -10, rhz: H2_HANG + 4, re: 8 };
/** HIS ARMS LIMP, laid where his body puts them as it goes down: each hand on the floor `back` behind its shoulder and `out` to its side, the elbow out and down, never up. */
function limp(body: P, back: number, out: number): P {
  const s = solve(B, { ...H2_BASE, ...body, lhIn: 0, rhIn: 0 } as Posed);
  const at = (sh: V3, side: number): V3 => [sh[0] - back, sh[1] + side * out, 6.5];
  const L = at(s.shoulderL, 1);
  const Rr = at(s.shoulderR, -1);
  return elbowsTo({ ...body, lhIn: 2, lhx: L[0], lhy: L[1], lhz: L[2], rhIn: 2, rhx: Rr[0], rhy: Rr[1], rhz: Rr[2] }, [0, 1, -0.4], [0, -1, -0.4], { ...H2_BASE, ...body } as Bones);
}
const ON_KNEES: P = kneeling(8, { yaw: -10, pitch: 8, roll: 2, twist: 0, bend: 12, side: 2, faceTurn: 0, faceUp: -14, faceTilt: 6, ...HANGING });
const FOLD: P = kneeling(12, { yaw: -10, pitch: 32, roll: 2, twist: 0, bend: 28, side: 1, faceTurn: 0, faceUp: -48, faceTilt: 4, lhIn: 1, lhx: 4, lhy: 2, lhz: -38, le: -10, rhIn: 1, rhx: 4, rhy: -2, rhz: -38, re: 10 });
const SLUMP: P = limp(kneeling(24, { yaw: -10, pitch: 70, roll: 0, twist: 0, bend: 34, side: 0, faceTurn: 10, faceUp: -70, faceTilt: 10 }), 12, 12);
const GOING: P = limp(kneeling(52, { yaw: -10, pitch: 80, roll: 0, twist: 0, bend: 18, side: 0, faceTurn: 12, faceUp: -56, faceTilt: 12 }), 26, 11);
const PRONE: P = { ...limp(kneeling(76, { yaw: -10, pitch: 86, roll: 0, twist: 0, bend: 6, side: 0, faceTurn: 12, faceUp: -40, faceTilt: 14 }), 40, 10), out: 1 };
/** His hands where his guard has them, let fall `down` and opened `out` to his sides: letting go of the axe. */
const LETTING = ((): ((down: number, out: number) => P) => {
  const s = solve(B, R as Posed);
  const rel = (h: V3, sh: V3): V3 => {
    const d = sub(h, sh);
    return [dot(d, s.chest[0]), dot(d, s.chest[1]), dot(d, s.chest[2])];
  };
  const Lh = rel(s.handL, s.shoulderL);
  const Rh = rel(s.handR, s.shoulderR);
  return (down, out) => ({ lhIn: 0, lhx: Lh[0], lhy: Lh[1] + out, lhz: Lh[2] - down, rhIn: 0, rhx: Rh[0], rhy: Rh[1] - out, rhz: Rh[2] - down });
})();
function h2Dying(): Motion {
  return {
    keys: [
      { at: 0, pose: {} },
      { at: 0.12, pose: { px: -3, pz: R.pz - 1, pitch: -6, bend: -6, faceUp: 14, gale: 0.6 }, ease: 'out' },
      { at: H2_AXE_GOES, pose: { px: -2, pz: R.pz - 3, pitch: 0, bend: 2, faceUp: 8, gale: 0.4, ...LETTING(6, 3) }, ease: 'in' },
      { at: 0.38, pose: { px: -1.5, pz: R.pz - 5, pitch: 3, bend: 5, faceUp: 4, gale: 0.3, lhIn: 0, lhx: 7, lhy: 12, lhz: H2_HANG + 8, le: -8, rhIn: 0, rhx: 9, rhy: -12, rhz: H2_HANG + 10, re: 8 }, ease: 'lin' },
      { at: 0.48, pose: { px: -1, pz: R.pz - 9, pitch: 4, bend: 6, faceUp: 4, lk: 30, rk: -30, gale: 0.2, ...HANGING }, ease: 'out' },
      { at: 0.8, pose: { ...ON_KNEES, out: 0.3 }, ease: 'in' },
      { at: 0.95, pose: { ...ON_KNEES, pz: (ON_KNEES.pz as number) + 1, pitch: 4, side: -2, roll: -2, out: 0.5 }, ease: 'out' },
      { at: 1.2, pose: { ...ON_KNEES, pitch: 14, roll: 3, out: 1 }, ease: 'io' },
      { at: 1.42, pose: { ...FOLD, out: 1 }, ease: 'in' },
      { at: 1.56, pose: { ...SLUMP, out: 1 }, ease: 'in' },
      { at: 1.64, pose: { ...SLUMP, pz: (SLUMP.pz as number) + 1, out: 1 }, ease: 'out' },
      { at: 1.9, pose: { ...GOING, out: 1 }, ease: 'in' },
      { at: 2.1, pose: PRONE, ease: 'out' },
      { at: H2_DIE_TIME, pose: PRONE, ease: 'io' },
    ],
  };
}
function h2DyingFeet(): (t: number) => P {
  const F = DIE_FEET;
  return footwork(B, {
    // (and as he goes over onto his face his left foot is dragged a little after him, its toes lifted off the floor)
    L: { start: L0, moves: [{ t0: 0.06, t1: 0.3, to: F.L, lift: 5 }, { t0: 0.5, t1: 0.78, to: { ...F.L, pitch: TUCK } }, { t0: 1.86, t1: 2.08, to: { ...F.L, pitch: TUCK, at: [F.L.at[0] + 2.2, F.L.at[1] - 2.2] }, lift: 2 }] },
    R: { start: F.R, moves: [{ t0: 0.5, t1: 0.78, to: { ...F.R, pitch: TUCK } }] },
  });
}

// ---------------------------------------------------------------------------------------------
// THE MOVES' NAMES AND WHERE THEY END (the game moves him by `H2_SHIFT` when one of these ends: forward,
// and to his left, in tiles).

export const H2_SHIFT: Readonly<Record<string, readonly [number, number]>> = { dashL: [0, H2_DASH], dashR: [0, -H2_DASH], flurry: [(3 * 30) / TILE3, 0], wheel: [H2_WHEEL.drive, 0], vault: [H2_VAULT.far / TILE3, 0] };

// ---------------------------------------------------------------------------------------------
// HIM, AS THE GAME HOLDS A MONSTER

/** A move. */
const mv = (name: string, motion: Motion, more: Partial<MobMove> = {}): MobMove => ({ name, motion: axed(motion, R), rest: R, ...more });
/** The points of his blade whose way through the air is streaked: its edge's two horns and its middle, and the eye. */
function trailOf(s: Skeleton, q: Posed): V3[] {
  const a = axe2Of(s, q);
  return [a.horns[0], a.edge, a.horns[1], a.eye];
}
export const HEADSMAN_2: Mob = {
  id: 'headsman',
  name: 'The Headsman',
  size: 'a boss: the Warden’s height, lean',
  build: B,
  stand: mv('The Headsman, on his toes, his axe up behind him', h2Stand()),
  attack: mv('The lunge', h2Lunge(), { feet: h2LungeFeet(), glint: heldGlint(0.26, 0.44, H2_LUNGE_HIT), trail: trailOf, trailSpan: 4, trailOver: (t) => t > H2_LUNGE_HIT - 0.06 && t < H2_LUNGE_HIT + 0.12 }),
  idleFrames: 20,
  idleFps: 10,
  walk: mv('The Headsman prowls, low and quick', h2Walk(), { period: H2_WALK_FRAMES / H2_WALK_FPS, ground: H2_GROUND }),
  walkFrames: H2_WALK_FRAMES,
  walkFps: H2_WALK_FPS,
  pace: H2_PACE,
  more: {
    setOff: mv('The Headsman sets off', h2SetOff(), { ground: H2_GROUND, feet: h2SetOffFeet() }),
    halt: mv('The Headsman stops', h2Halt(), { ground: H2_GROUND, feet: h2HaltFeet() }),
    flurry: mv(FLURRY_NAME, h2Flurry(), { feet: h2FlurryFeet(), glint: heldGlint(0.22, 0.36, H2_FLURRY_HITS[0]), trail: trailOf, trailSpan: 4, trailOver: (t) => H2_FLURRY_HITS.some((h) => t > h - 0.07 && t < h + 0.1) }),
    wheel: mv(WHEEL_NAME, h2Wheel(), { feet: h2WheelFeet(), glint: heldGlint(H2_WHEEL.warnFrom, 0.42, H2_WHEEL.hit), trail: trailOf, trailSpan: 6, trailOver: (t) => t > H2_WHEEL.full - 0.05 && t < H2_WHEEL.slow + 0.1 }),
    vault: mv('The vault', h2Vault(), { feet: h2VaultFeet(), glint: heldGlint(H2_VAULT.warnFrom, 0.4, H2_VAULT.hit), trail: trailOf, trailSpan: 4, trailOver: (t) => t > H2_VAULT.hit - 0.12 && t < H2_VAULT.hit + 0.06 }),
    dashL: mv('The Headsman dashes to his left', h2Dash(true), { feet: h2DashFeet(true) }),
    dashR: mv('The Headsman dashes to his right', h2Dash(false), { feet: h2DashFeet(false) }),
  },
  reel: mv('The Headsman is struck', h2Struck(), { glint: struckGlint }),
  reelTime: 0.3,
  hit: H2_LUNGE_HIT,
  warn: 0.3,
  dieTime: H2_DIE_TIME,
  dying: mv('The Headsman’s hood falls empty', h2Dying(), { feet: h2DyingFeet() }),
  aura: { x: H2_CANVAS.ax - 2, y: H2_CANVAS.ay - 56, r: 84, color: '#ff3a78', a: 0.15 },
  shadow: 24,
  canvas: H2_CANVAS,
  trueBack: true,
  bits: (st, m) => headsman2Bits(st, m),
  // (each comes to lie clear of him, as he lies, from in front and from behind: tests/headsman2.test.ts)
  fall(piece) {
    if (piece === 'axe') return { from: H2_AXE_GOES, to: [-6, -38], spin: -24, lay: 'flat', hop: 1.4 };
    if (piece === 'hood') return { from: H2_HOOD_GOES, to: [42, -50], spin: -60, lay: 'axis', hop: 2.2 };
    return null;
  },
};

export function makeHeadsman2Art(pace = HEADSMAN_2.pace): ActorArt {
  return { front: mobSet(HEADSMAN_2, 'front', pace), back: mobSet(HEADSMAN_2, 'back', pace) };
}

// ---------------------------------------------------------------------------------------------
// HIM AS THE CHECKS SEE HIM (art/boss_checks.ts): his outside as painted, by name (his legs, his boots,
// his sleeves, his hood where a head would be; his trunk in his coat; THE SKIRTS OF HIS COAT, each round
// its leg), and his axe while it is his: the haft from the spike's point to its cap, the iron collar of its
// head, its blade. His fists are round the haft, so it may lie in his forearms; nothing else of him.

export function h2Solids(s: Skeleton): { limbs: CheckLimb[]; lumps: CheckLump[] } {
  const [rH, rK] = B.legR;
  const [r0, r1] = B.armR;
  const limbs: CheckLimb[] = [];
  for (const side of ['L', 'R'] as const) {
    const L = side === 'L';
    limbs.push(
      { name: `leg${side}`, a: L ? s.hipL : s.hipR, b: L ? s.kneeL : s.kneeR, r: rH * 1.05 },
      { name: `shin${side}`, a: L ? s.kneeL : s.kneeR, b: L ? s.ankleL : s.ankleR, r: rK * 1.16 },
      { name: `foot${side}`, a: add(L ? s.heelL : s.heelR, [0, 0, 2.0]), b: add(L ? s.toeL : s.toeR, [0, 0, 2.0]), r: 2.4 },
      { name: `upper${side}`, a: L ? s.shoulderL : s.shoulderR, b: L ? s.elbowL : s.elbowR, r: r0 * 1.12 },
      { name: `fore${side}`, a: L ? s.elbowL : s.elbowR, b: L ? s.handL : s.handR, r: r1 * 1.1 },
    );
  }
  limbs.push({ name: 'neck', a: s.neck, b: s.skull, r: 5.0 });
  // (the skirts of his coat: from ring to ring of each, as thick as the ring is narrow)
  for (const [side, rings] of coatSkirts(s)) {
    for (let i = 1; i < rings.length; i++) {
      const a = rings[i - 1];
      const b = rings[i];
      const r = Math.min(len(a.u), len(a.v), len(b.u), len(b.v));
      limbs.push({ name: `coat${side}`, a: a.c, b: b.c, r: Math.max(2, r - 1) });
    }
  }
  const waistC = add(s.pelvis, mul(s.hips[2], B.waist * 0.55));
  const lumps: CheckLump[] = [
    { name: 'hood', c: s.head, rot: s.face, h: [8.6, 8.0, 9.6] },
    { name: 'chest', c: lerp3(s.ribs, s.neck, 0.3), rot: s.chest, h: [B.ribDeep + 2.6, B.ribHalf + 2.8, len(sub(s.neck, s.ribs)) * 0.55] },
    { name: 'belly', c: lerp3(waistC, s.ribs, 0.5), rot: s.belly, h: [B.waistDeep + 2.3, B.waistHalf + 2.3, Math.max(4, len(sub(s.ribs, waistC)) * 0.6)] },
    { name: 'hips', c: add(s.pelvis, mul(s.hips[2], B.waist * 0.2)), rot: s.hips, h: [B.pelvisDeep + 2.4, B.pelvisHalf + 2.4, B.waist * 0.75] },
  ];
  return { limbs, lumps };
}
/** The moves that end where he has gone to, and how far (his own lengths: forward, to his left). */
const shiftOf = (move: string): readonly [number, number] => {
  const sh = H2_SHIFT[move];
  return sh ? [sh[0] * TILE3, sh[1] * TILE3] : [0, 0];
};
export const H2_SHAPE: BossShape = {
  body: h2Solids,
  tip: (move, t, s, q) => (move === 'dying' && t >= H2_AXE_GOES ? null : axe2Of(s, q).edge),
  handovers: [
    { from: 'stand', at: 0, to: 'setOff', toAt: 0 },
    { from: 'setOff', at: 'end', to: 'walk', toAt: 0 },
    { from: 'walk', at: 0, to: 'halt', toAt: 0 },
    { from: 'halt', at: 'end', to: 'stand', toAt: 0 },
    ...(['attack', 'reel', 'dashL', 'dashR', 'flurry', 'wheel', 'vault'] as const).flatMap((m): Handover[] => [
      { from: 'stand', at: 0, to: m, toAt: 0 },
      { from: 'halt', at: 'end', to: m, toAt: 0 },
      { from: m, at: 'end', to: 'stand', toAt: 0, shift: shiftOf(m) },
      { from: m, at: 'end', to: 'setOff', toAt: 0, shift: shiftOf(m) },
      { from: m, at: 'end', to: 'dying', toAt: 0, shift: shiftOf(m) },
    ]),
    { from: 'stand', at: 0, to: 'dying', toAt: 0 },
    { from: 'halt', at: 'end', to: 'dying', toAt: 0 },
  ],
  things: (move, t, s, q) => {
    if (move === 'dying' && t >= H2_AXE_GOES) return [];
    const a = axe2Of(s, q);
    const pt = norm(sub(a.eye, a.butt));
    const top = add(a.eye, mul(pt, HAFT_TOP));
    const haft: V3[] = [];
    const from = add(a.butt, mul(pt, -SPIKE + 2));
    const n = Math.ceil(len(sub(top, from)) / 3);
    for (let i = 0; i <= n; i++) haft.push(lerp3(from, top, i / n));
    const blade: V3[] = [];
    for (const u of [0.2, 0.55, 0.9]) for (const v of [-0.8, 0, 0.8]) blade.push(add(add(a.eye, mul(a.out, (BLADE_OUT + 1) * u)), mul(pt, 1.5 + v * (BLADE_TALL / 2 - 1) * Math.min(1, u * 1.3))));
    const onHaft = (h: V3): boolean => {
      const ab = sub(top, from);
      const k = Math.max(0, Math.min(1, dot(sub(h, from), ab) / Math.max(1e-6, dot(ab, ab))));
      return len(sub(h, add(from, mul(ab, k)))) < B.armR[2] * 1.1 + 3;
    };
    const may = [...(q.lhIn === 3 || onHaft(s.handL) ? ['foreL'] : []), ...(onHaft(s.handR) ? ['foreR'] : [])];
    const things: CheckThing[] = [
      { name: 'haft', pts: haft, r: 1.55, may },
      { name: 'collar', pts: [add(a.eye, mul(pt, -5)), a.eye, add(a.eye, mul(pt, 6))], r: 2.8, may },
      { name: 'blade', pts: blade, r: 1.0, may },
    ];
    void move;
    void t;
    return things;
  },
};
void AXE2_HOLD;
void AXE2_LEN;
void D;
void clamp01;
void posedOfMob;
export type { FootTrack, Plant };
