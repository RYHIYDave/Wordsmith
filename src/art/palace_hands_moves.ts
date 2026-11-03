// FLOOR 16'S HUSHED GARDENERS AND GROOMS: THEIR MOVES (the art chat, 28 Oct 2026). A MOCK-UP: NOT IN THE GAME, behind
// PALACE_HANDS_ON (art/palace_hands.ts, off). Their look and his brief are art/palace_hands.ts.
//
// THEIR MOVES:
//   STANDING, at their work till they see you: the gardener clipping at a hedge that is not there, his shears snipping
//     at chest height, a pause, and again; the groom leaning on his pitchfork stood at his side. Both breathe and shift
//     their weight, their mouths working.
//   THE RUSH (his pick, “Rush at you”): they run at you, leaning into it, the gardener's shears held shut before him,
//     the groom's fork carried upright at his side.
//   THE GARDENER'S BLOW, THE SHEARS SNAP (his pick, “Shears snap, fork jab (Recommended)”): the shears raised high over
//     his head and opened wide, their blades glinting pink, held shaking (THE WARNING); then hips first, a step in, the
//     shears driven down and out at you and snapped shut; carried on through; back to his work.
//   THE GROOM'S BLOW, THE FORK JAB: the fork brought down level in both hands and drawn back, its tines glinting pink,
//     held shaking (THE WARNING); then hips first, a lunge, the fork jabbed out at you; carried on through; drawn back
//     and stood again.
//   STRUCK: jolted back, the head snapped back, the Hush coughed out.
//   THE HUSH LEAVES THEM (his pick, “The Hush leaves them (Recommended)”): rocked back; a gasp, the head thrown back,
//     the Hush pouring up out of them in one great grey breath; the tool drops from the hands; the knees give; they slump
//     forward onto the floor and lie still: people again.
//
// By his rulebook: every move through every check the bosses have (art/boss_checks.ts), from in front and behind.
//   test: tsx --test tests/palace_hands.test.ts

import { footwork, kneelHips, kneelSettle, plantBy, plantOf } from './bosses3';
import type { Plant } from './bosses3';
import type { BossShape, CheckLimb, CheckLump, CheckThing } from './boss_checks';
import type { ActorArt } from './actor_types';
import { poleGrip, polePlanted } from './dredgers';
import { FORK, PH_BODY, PH_CANVAS, PH_REST, forkOf, palacePainter, shearsOf } from './palace_hands';
import type { PalaceWho } from './palace_hands';
import { TILE3, mobSet } from './new_mobs3';
import type { Mob, MobMove, Moment } from './new_mobs3';
import { add, elbowFor, heading, lerp3, mul, norm, solve, sub } from './skeleton';
import type { Bones, Key3, Motion, Posed, Skeleton, V3 } from './skeleton';

type P = Partial<Bones>;
const B = PH_BODY;
const R = PH_REST;
const L0 = plantOf(B, 'L', {}, R);
const R0 = plantOf(B, 'R', {}, R);
const fr = (t: number): number => t - Math.floor(t);
const sm = (v: number): number => {
  const c = Math.max(0, Math.min(1, v));
  return c * c * (3 - 2 * c);
};

function elbowsTo(pose: P, wantL: V3 | null, wantR: V3 | null, rest: Bones = R): P {
  const q = { ...rest, ...pose } as Posed;
  const le = wantL ? elbowFor(B, q, true, norm(wantL)) : q.le;
  const re = wantR ? elbowFor(B, { ...q, le } as Posed, false, norm(wantR)) : q.re;
  return { ...pose, le, re };
}

// =============================================================================================
// HOW THEY HOLD THEIR TOOLS

/** The shears in both fists: each fist from its own shoulder (the figure's forward, left, up), the two `gap` apart across the body's middle line; pointing `el` degrees up. */
function fists(x: number, z: number, gap: number, el: number, az = 0): P {
  return { lhIn: 1, lhx: x, lhy: gap / 2 - 6.6, lhz: z, rhIn: 1, rhx: x, rhy: 8.1 - gap / 2, rhz: z, wAz: az, wEl: el, wRoll: 0 };
}
/** The fork in the groom's right fist, from the figure's place on the floor, pointing `az`, `el`; the fist `draw` of the way up it; the left fist on it `left` further along (or hanging). */
const ACROSS: V3 = [0, 1, 0];
const forkIn = (hand: V3, az: number, el: number, draw: number, left: number | null): P => poleGrip(hand, heading(az, el), ACROSS, draw, left);
/** The fork stood on its butt at his right side, his fist round it at `z`, leaning `lean` forward. */
const forkStood = (x: number, y: number, z: number, lean: number): P => polePlanted([x, y], z, lean, ACROSS);

// =============================================================================================
// STANDING: AT THEIR WORK

export const PH_STAND_LONG = 2.4;
/** Two snips, from his rest's opening and back to it, smooth at both ends. */
function snipWave(v: number): number {
  const env = Math.sin(Math.PI * v);
  return env * env * 0.5 * Math.sin(v * 4 * Math.PI);
}
/** How open the gardener's shears are as he clips (0 shut, 1 wide): two snips, then held a little open. */
function snipOpen(t: number): number {
  const u = fr(t / PH_STAND_LONG);
  // (from his rest's opening, shut, wide, shut, wide, back; then held there)
  return u < 0.5 ? SNIP_HOLD + snipWave(u / 0.5) : SNIP_HOLD;
}
/** The gardener's rest: his shears held before him at chest height, a little open, pointing up and out. */
const SNIP_HOLD = 0.35;
const snipFists = (o: number, a = 0): P => fists(9.6 + 0.5 * o, -12.8 + 0.6 * Math.sin(a) + 0.8 * o, 3.2 + 7 * o, 24);
export const GARDENER_REST: Bones = { ...R, ...elbowsTo({ ...snipFists(SNIP_HOLD) }, [0.1, 1, -0.5], [0.1, -1, -0.5]) } as Bones;
function gardenerStand(): Motion {
  const T = PH_STAND_LONG;
  const keys: Key3[] = [];
  const N = 48;
  for (let i = 0; i <= N; i++) {
    const t = (i / N) * T;
    const a = (t / T) * Math.PI * 2;
    const o = snipOpen(t);
    keys.push({
      at: t,
      ease: 'lin',
      pose: elbowsTo({
        pz: R.pz + 0.9 * Math.sin(a), py: 1.3 * Math.sin(a + 0.6), roll: R.roll + 2 * Math.sin(a + 0.6), side: R.side + 1.5 * Math.sin(a + 0.6),
        pitch: R.pitch - 3, bend: R.bend - 4 - 1.5 * Math.sin(a),
        faceUp: R.faceUp + 12 + 2 * Math.sin(a * 2), faceTilt: R.faceTilt + 6 + 3 * Math.sin(a + 1.2), faceTurn: R.faceTurn + 4 * Math.sin(a + 0.4),
        ...snipFists(o, a),
      }, [0.1, 1, -0.5], [0.1, -1, -0.5], GARDENER_REST),
    });
  }
  return { loop: 0, keys };
}
/** The groom leans on his fork stood at his right side, shifting his weight from foot to foot. */
const GROOM_STOOD = forkStood(6.2, -10.6, 33.5, 5);
export const GROOM_REST: Bones = { ...R, ...GROOM_STOOD } as Bones;
function groomStand(): Motion {
  const T = PH_STAND_LONG;
  const keys: Key3[] = [];
  const N = 24;
  for (let i = 0; i <= N; i++) {
    const t = (i / N) * T;
    const a = (t / T) * Math.PI * 2;
    keys.push({
      at: t,
      ease: 'lin',
      pose: elbowsTo({
        ...GROOM_STOOD,
        pz: R.pz + 0.9 * Math.sin(a), py: -0.6 + 1.4 * Math.sin(a + 0.6), roll: R.roll + 2.4 * Math.sin(a + 0.6), side: R.side + 1.6 * Math.sin(a + 0.6),
        pitch: R.pitch - 2, bend: R.bend - 3 - 1.5 * Math.sin(a),
        faceUp: R.faceUp + 4 + 2 * Math.sin(a * 2), faceTilt: R.faceTilt + 4 * Math.sin(a + 1.2), faceTurn: R.faceTurn + 6 * Math.sin(a + 0.4),
        lhIn: 1, lhx: R.lhx + 0.6 * Math.sin(a), lhy: R.lhy, lhz: R.lhz + 0.4 * Math.sin(a),
      }, null, [-0.4, -0.6, -1], GROOM_REST),
    });
  }
  return { loop: 0, keys };
}
/** Their mouths, working on words that make no sound. */
export function palaceJaw(t: number): number {
  const u = fr(t / PH_STAND_LONG);
  return 0.3 + 0.5 * Math.max(0, Math.sin(u * Math.PI * 6)) * (u < 0.7 ? 1 : 0.3);
}

// =============================================================================================
// THE RUSH (his pick, “Rush at you”)

export const PH_PACE = 1.6;
export const PH_RUN = { frames: 10, fps: 15 } as const;
function stepFoot(k: number, n: number, step: number, lift: number): [number, number, number] {
  const half = n / 2;
  if (k <= half) return [step * (half / 2 - k), 0, 0];
  const u = (k - half) / half;
  const g = u * u * (3 - 2 * u);
  return [-step * (half / 2) + step * half * g, lift * Math.sin(Math.PI * u), 14 * Math.sin(Math.PI * u) * (1 - u) - 6 * Math.sin(Math.PI * u) * u];
}
function run(who: PalaceWho): Motion {
  const n = PH_RUN.frames;
  const d = (PH_PACE * TILE3) / PH_RUN.fps;
  const keys: Key3[] = [];
  for (let i = 0; i <= n; i++) {
    const j = i % n;
    const a = (j / n) * Math.PI * 2;
    const [lx, lz, lp] = stepFoot(j, n, d, 4.2);
    const [rx, rz, rp] = stepFoot((j + n / 2) % n, n, d, 4.2);
    // (driving off each foot, bobbing, leaning into the going; the head up, the tool held as they go)
    const bob = Math.abs(Math.cos(a));
    const body: P = {
      pz: R.pz - 1.4 + 1.6 * bob, py: 1.2 * Math.sin(a), roll: R.roll + 3 * Math.sin(a), yaw: 5 * Math.cos(a), twist: -4 * Math.cos(a), side: R.side + 1.2 * Math.sin(a),
      bend: R.bend - 2 + 1.5 * (1 - bob), pitch: R.pitch + 2, faceUp: R.faceUp + 12 - 2 * bob, faceTilt: R.faceTilt + 6 + 3 * Math.sin(a), faceTurn: R.faceTurn + 3 * Math.cos(a),
      lfx: lx, lfz: lz, lfp: lp, lfy: R.lfy, lft: R.lft, lk: 9,
      rfx: rx, rfz: rz, rfp: rp, rfy: R.rfy, rft: R.rft, rk: -9,
    };
    const pose: P =
      who === 'gardener'
        ? elbowsTo({ ...body, ...fists(9.0 + 0.8 * Math.cos(a), -13.6 + 1.2 * bob, 4.2, 17) }, [0.1, 1, -0.5], [0.1, -1, -0.5], GARDENER_REST)
        : elbowsTo({ ...body, ...forkIn([7.2 + 1.0 * Math.sin(a), -10.6, 35.5 - 0.8 * bob], 0, 80, 0.62, null), lhIn: 1, lhx: R.lhx + 3.5 * Math.sin(a + Math.PI), lhy: R.lhy, lhz: R.lhz + 1.0 * bob }, null, [-0.4, -0.6, -1], GROOM_REST);
    keys.push({ at: i / PH_RUN.fps, ease: 'lin', pose });
  }
  return { keys, loop: 0 };
}
const runJaw = (t: number): number => 0.5 + 0.3 * Math.max(0, Math.sin((t / (PH_RUN.frames / PH_RUN.fps)) * Math.PI * 4));

// =============================================================================================
// THE GARDENER'S BLOW: THE SHEARS SNAP

/** Their blows: how long; when it lands (a frame of the game's thirty a second); the warning, held from and to. */
export const PH_BLOW = { long: 1.3, hit: 18 / 30, warn: [0.26, 0.48] } as const;
const H = PH_BLOW.hit;
/** Raised high over his head and opened wide, leaning back, the head up. */
const RAISED: P = elbowsTo({ px: -1.4, pz: R.pz + 0.6, yaw: -4, twist: -4, pitch: -1, bend: -6, side: 0, roll: 0, faceUp: 18, faceTilt: 0, faceTurn: 2, ...fists(3, 16, 14, 72), lk: 9, rk: -9 }, [0.2, 1, 0.2], [0.2, -1, 0.2]);
/** On the way up: lifted before his face, the blades turned up. */
const LIFTING: P = elbowsTo({ px: -0.6, pz: R.pz + 0.3, yaw: -2, twist: -2, pitch: 3, bend: 0, faceUp: 10, ...fists(13, 1, 7, 78) }, [0.2, 1, -0.3], [0.2, -1, -0.3]);
const shakeR = (k: number): P => ({ ...RAISED, lhz: (RAISED.lhz as number) + (k % 2 ? 0.6 : -0.3), rhz: (RAISED.rhz as number) + (k % 2 ? -0.3 : 0.6), px: (RAISED.px as number) - 0.2 * (k % 2) });
/** Hips first: the body coming forward, the shears still up. */
const DRIVE_S: P = elbowsTo({ ...RAISED, px: 1.4, pz: R.pz - 0.2, yaw: 4, twist: -6, pitch: 8, bend: -4, faceUp: 14, ...fists(3.5, 15.5, 13, 66) }, [0.2, 1, 0.2], [0.2, -1, 0.2]);
/** THE SNAP: driven down and out at you, snapped shut, a step in. */
const SNAP: P = elbowsTo({ px: 5.5, pz: R.pz - 1.8, yaw: 2, twist: 2, pitch: 16, bend: 10, side: 0, roll: 0, faceUp: 12, faceTilt: 0, faceTurn: 0, ...fists(13.5, -3, 3.2, 4), lk: 18, rk: -8 }, [0.1, 1, -0.4], [0.1, -1, -0.4]);
/** Carried on through, low. */
const THROUGH_S: P = elbowsTo({ px: 6.2, pz: R.pz - 2.4, yaw: 2, twist: 3, pitch: 20, bend: 14, side: 0, faceUp: 8, faceTurn: 0, ...fists(14.5, -8.5, 3.0, -12), lk: 20, rk: -8 }, [0.1, 1, -0.5], [0.1, -1, -0.5]);
function gardenerSnap(): Motion {
  return {
    hit: H,
    keys: [
      { at: 0, pose: {} },
      { at: 0.14, pose: LIFTING, ease: 'in' },
      { at: PH_BLOW.warn[0], pose: RAISED, ease: 'out' },
      { at: 0.33, pose: shakeR(1), ease: 'io' },
      { at: 0.4, pose: shakeR(2), ease: 'io' },
      { at: PH_BLOW.warn[1], pose: shakeR(3), ease: 'io' },
      { at: H - 0.08, pose: DRIVE_S, ease: 'in' },
      { at: H, pose: SNAP, ease: 'lin' },
      { at: H + 0.14, pose: THROUGH_S, ease: 'out' },
      { at: 0.95, pose: { ...THROUGH_S, px: 3.5, pz: R.pz - 1.2, pitch: 10, bend: 6, ...fists(12, -10, 3.4, 0) }, ease: 'io' },
      { at: PH_BLOW.long, pose: {}, ease: 'io' },
    ],
  };
}

// =============================================================================================
// THE GROOM'S BLOW: THE FORK JAB

/** Brought down level in both hands, the right at the butt end by his hip, the left on along the shaft. */
const TAKE: P = elbowsTo({ px: -0.4, pz: R.pz, yaw: -4, twist: -4, pitch: 6, bend: 4, side: 0, roll: 0, faceUp: 8, faceTilt: -2, faceTurn: 4, lk: 9, rk: -9, ...forkIn([1.5, -7.5, 30.5], 6, 8, 0, 13) }, [0.1, 0.7, -0.7], [-0.6, -0.6, -0.5], GROOM_REST);
/** Drawn back, the body wound round to the right. */
const DRAWN: P = elbowsTo({ px: -2.6, pz: R.pz + 0.3, yaw: -12, twist: -8, pitch: 2, bend: 0, side: 1, roll: -1, faceUp: 10, faceTilt: 0, faceTurn: 8, lk: 12, rk: -12, ...forkIn([-7.5, -8.5, 31], 6, 6, 0, 13) }, [0.1, 0.7, -0.7], [-0.7, -0.5, -0.4], GROOM_REST);
const shakeD = (k: number): P => ({ ...DRAWN, rhz: (DRAWN.rhz as number) + (k % 2 ? 0.6 : -0.3), rhy: (DRAWN.rhy as number) + (k % 2 ? -0.3 : 0.2), px: (DRAWN.px as number) - 0.2 * (k % 2), rhx: (DRAWN.rhx as number) - 0.2 * (k % 2) });
/** Hips first: the body coming round and forward, the fork still back. */
const DRIVE_F: P = elbowsTo({ px: 2.0, pz: R.pz - 0.8, yaw: 2, twist: -12, pitch: 8, bend: 2, side: 1, roll: 0, faceUp: 8, faceTilt: 0, faceTurn: 4, lk: 14, rk: -8, ...forkIn([-4.5, -8.2, 31], 5, 4, 0, 13) }, [0.1, 0.7, -0.7], [-0.7, -0.5, -0.4], GROOM_REST);
/** THE JAB: lunged out its whole length at you. */
const JAB: P = elbowsTo({ px: 8.0, pz: R.pz - 2.8, yaw: 8, twist: 6, pitch: 16, bend: 8, side: -1, roll: 1, faceUp: 10, faceTilt: 0, faceTurn: -2, lk: 26, rk: -4, ...forkIn([8.5, -5.2, 33], 3, -3, 0, 13) }, [0, 0.6, -0.8], [-0.3, -0.7, -0.6], GROOM_REST);
const OVER: P = elbowsTo({ px: 8.8, pz: R.pz - 3.0, yaw: 9, twist: 8, pitch: 18, bend: 10, side: -1, roll: 1, faceUp: 10, faceTurn: -2, lk: 28, rk: -3, ...forkIn([13, -4.8, 32.5], 2, -5, 0, 13) }, [0, 0.6, -0.8], [-0.2, -0.7, -0.6], GROOM_REST);
const BACK: P = elbowsTo({ px: 3.0, pz: R.pz - 1.0, yaw: 2, twist: 0, pitch: 8, bend: 4, side: 0, roll: 0, faceUp: 6, faceTilt: -2, faceTurn: 2, lk: 12, rk: -9, ...forkIn([4, -8.5, 31.5], 3, 30, 0.2, 13) }, [0.1, 0.7, -0.7], [-0.6, -0.6, -0.5], GROOM_REST);
function groomJab(): Motion {
  return {
    hit: H,
    keys: [
      { at: 0, pose: {} },
      { at: 0.16, pose: TAKE, ease: 'io' },
      { at: PH_BLOW.warn[0], pose: DRAWN, ease: 'out' },
      { at: 0.33, pose: shakeD(1), ease: 'io' },
      { at: 0.4, pose: shakeD(2), ease: 'io' },
      { at: PH_BLOW.warn[1], pose: shakeD(3), ease: 'io' },
      { at: H - 0.08, pose: DRIVE_F, ease: 'in' },
      { at: H, pose: JAB, ease: 'lin' },
      { at: H + 0.1, pose: OVER, ease: 'out' },
      { at: 0.92, pose: BACK, ease: 'io' },
      { at: PH_BLOW.long, pose: {}, ease: 'io' },
    ],
  };
}
function blowFeet(who: PalaceWho): (t: number) => P {
  if (who === 'gardener') {
    return footwork(B, {
      L: { start: L0, moves: [{ t0: H - 0.12, t1: H - 0.01, to: plantBy(L0, 7, 0.5, 4), lift: 2.6 }, { t0: 0.95, t1: 1.2, to: L0, lift: 2.2 }] },
      R: { start: R0, moves: [{ t0: H - 0.06, t1: H + 0.04, to: { ...R0, pitch: 18 } }, { t0: 0.96, t1: 1.16, to: R0 }] },
    });
  }
  return footwork(B, {
    L: { start: L0, moves: [{ t0: H - 0.14, t1: H - 0.02, to: plantBy(L0, 9, 1, 8), lift: 3.0 }, { t0: 0.95, t1: 1.2, to: L0, lift: 2.4 }] },
    R: { start: R0, moves: [{ t0: 0.12, t1: 0.26, to: plantBy(R0, -1.5, -1, -12), lift: 2.2 }, { t0: 0.98, t1: 1.22, to: R0, lift: 2.4 }] },
  });
}
/** The warning: the blades or the tines glinting pink, from as they are raised or drawn back to just after the blow. */
function blowGlint(t: number): number {
  if (t < 0.08 || t > H + 0.2) return 0;
  return t < PH_BLOW.warn[0] ? (t - 0.08) / (PH_BLOW.warn[0] - 0.08) : t <= H ? 1 : 1 - (t - H) / 0.2;
}
const blowJaw = (t: number): number => (t < 0.12 ? 0.45 + 2 * t : t < H + 0.2 ? 1 : 1 - 0.5 * Math.min(1, (t - H - 0.2) / 0.5));

// =============================================================================================
// STRUCK

function reel(): Motion {
  return {
    keys: [
      { at: 0, pose: {} },
      { at: 0.06, pose: { px: -2.6, pz: R.pz + 0.4, pitch: -2, bend: -4, faceUp: R.faceUp + 26, faceTilt: R.faceTilt + 10, out: 0.1 }, ease: 'out' },
      { at: 0.18, pose: { px: -1.2, pitch: 5, bend: 6, faceUp: R.faceUp + 8 }, ease: 'io' },
      { at: 0.4, pose: {}, ease: 'io' },
    ],
  };
}
const reelJaw = (t: number): number => (t < 0.25 ? 1 : 0.45);

// =============================================================================================
// THE HUSH LEAVES THEM (as floor 13's fieldhands, art/fieldhands_moves.ts)

export const PH_DIES = { long: 2.2, gasp: 0.3, drop: 0.34, knees: 0.85, down: 1.85 } as const;
const DIE_FEET = ((): Record<'L' | 'R', Plant> => ({ L: plantBy(L0, R0.at[0] - L0.at[0] + 3, 0), R: R0 }))();
const TUCK = 56;
const KNEE_DOWN = B.legR[1] * 1.3;
const kneeling = (lean: number, body: P): P => kneelSettle(B, R, { ...kneelHips(B, R, DIE_FEET, TUCK, KNEE_DOWN, lean), ...body }, DIE_FEET, TUCK, KNEE_DOWN);
const HANG = -(B.upperArm + B.foreArm) * 0.9;
const HANGING: P = { lhIn: 0, lhx: 3, lhy: 8, lhz: HANG + 4, le: -10, rhIn: 0, rhx: 3, rhy: -8, rhz: HANG + 4, re: 10 };
function limp(body: P, back: number, out: number): P {
  const s = solve(B, { ...R, ...body, lhIn: 0, rhIn: 0 } as Posed);
  const at = (sh: V3, side: number): V3 => [sh[0] - back, sh[1] + side * out, 2.6];
  const Lh = at(s.shoulderL, 1);
  const Rh = at(s.shoulderR, -1);
  const q = { ...R, ...body, lhIn: 2, lhx: Lh[0], lhy: Lh[1], lhz: Lh[2], rhIn: 2, rhx: Rh[0], rhy: Rh[1], rhz: Rh[2] } as Posed;
  const le = elbowFor(B, q, true, norm([0, 1, -0.4]));
  const re = elbowFor(B, { ...q, le } as Posed, false, norm([0, -1, -0.4]));
  return { ...body, lhIn: 2, lhx: Lh[0], lhy: Lh[1], lhz: Lh[2], rhIn: 2, rhx: Rh[0], rhy: Rh[1], rhz: Rh[2], le, re };
}
const lifted = (p: P, dz: number): P => ({ ...p, pz: (p.pz as number) + dz });
const ON_KNEES: P = kneeling(6, { yaw: 0, pitch: 2, roll: 2, twist: 0, bend: 4, side: 1, faceTurn: 0, faceUp: 4, faceTilt: 10, ...HANGING });
const FOLD: P = kneeling(14, { yaw: 4, pitch: 28, roll: 3, twist: 0, bend: 22, side: 1, faceTurn: 6, faceUp: -30, faceTilt: 8, ...HANGING });
const SLUMP: P = limp(kneeling(30, { yaw: 6, pitch: 62, roll: 2, twist: 0, bend: 24, side: 0, faceTurn: 14, faceUp: -48, faceTilt: 14 }), 8, 10);
const PRONE: P = { ...limp(lifted(kneeling(66, { yaw: 8, pitch: 80, roll: 6, twist: 0, bend: 8, side: 0, faceTurn: 30, faceUp: -36, faceTilt: 22 }), 2.2), 22, 9), out: 1 };
function dying(who: PalaceWho): Motion {
  // (the gardener's fists stay out before him, the shears in them, till they drop; then fall to his sides)
  // (the groom's right fist stays on his fork, lifting it off the floor as he rears back, till it drops)
  const hands0: P = who === 'gardener' ? elbowsTo({ ...fists(9.5, -12, 6, 16) }, [0.1, 1, -0.5], [0.1, -1, -0.5], GARDENER_REST) : { rhIn: 2, rhx: 4.5, rhy: -10.6, rhz: 35.5 };
  const handsG: P = who === 'gardener' ? elbowsTo({ ...fists(8.5, -11, 9, 30) }, [0.1, 1, -0.5], [0.1, -1, -0.5], GARDENER_REST) : { lhIn: 1, lhx: -1, lhy: 6.5, lhz: -16, rhIn: 2, rhx: 1.5, rhy: -10.4, rhz: 37.5 };
  return {
    keys: [
      { at: 0, pose: {} },
      { at: 0.08, pose: { px: -2.4, pz: R.pz, pitch: -3, bend: -5, faceUp: R.faceUp + 20, ...hands0, out: 0.15 }, ease: 'out' },
      { at: PH_DIES.gasp, pose: { px: -2.2, pz: R.pz + 0.8, pitch: -9, bend: -15, faceUp: 42, faceTilt: 0, faceTurn: 0, ...handsG, out: 0.45 }, ease: 'out' },
      { at: 0.5, pose: { px: -2.0, pz: R.pz + 0.5, pitch: -8, bend: -13, faceUp: 38, faceTilt: 4, lhIn: 1, lhx: -0.6, lhy: 6, lhz: -17, rhIn: 1, rhx: -0.6, rhy: -6, rhz: -17, out: 0.85 }, ease: 'io' },
      { at: 0.66, pose: { px: -0.6, pz: R.pz - 5, pitch: 2, bend: 2, faceUp: 14, lk: 26, rk: -26, ...HANGING, out: 1 }, ease: 'in' },
      { at: PH_DIES.knees, pose: { ...ON_KNEES, out: 1 }, ease: 'out' },
      { at: 1.05, pose: { ...ON_KNEES, pz: (ON_KNEES.pz as number) + 0.6, pitch: -2, roll: -3, faceUp: 10, out: 1 }, ease: 'io' },
      { at: 1.3, pose: { ...ON_KNEES, pitch: 8, roll: 4, faceUp: -6, out: 1 }, ease: 'io' },
      { at: 1.5, pose: { ...FOLD, out: 1 }, ease: 'in' },
      { at: 1.66, pose: { ...SLUMP, out: 1 }, ease: 'lin' },
      { at: PH_DIES.down, pose: PRONE, ease: 'out' },
      { at: PH_DIES.long, pose: PRONE, ease: 'io' },
    ],
  };
}
function dyingFeet(): (t: number) => P {
  const F = DIE_FEET;
  return footwork(B, {
    L: { start: L0, moves: [{ t0: 0.04, t1: 0.26, to: F.L, lift: 2.4 }, { t0: 0.5, t1: 0.82, to: { ...F.L, pitch: TUCK } }] },
    R: { start: F.R, moves: [{ t0: 0.5, t1: 0.82, to: { ...F.R, pitch: TUCK } }] },
  });
}
const dieJaw = (t: number): number => (t < 0.1 ? 0.6 : t < 1.0 ? 1 : 1 - 0.6 * Math.min(1, (t - 1.0) / 0.6));

// =============================================================================================
// THEM, AS THE GAME HOLDS A MONSTER

function palaceMob(who: PalaceWho): Mob {
  const paint = palacePainter(who, { dropped: (m: Moment) => !!m.dying && m.t >= PH_DIES.drop });
  const rest = who === 'gardener' ? GARDENER_REST : GROOM_REST;
  const mv = (name: string, motion: Motion, more: Partial<MobMove> = {}): MobMove => ({ name, motion, rest, ...more });
  const tool = who === 'gardener' ? 'shears' : 'fork';
  return {
    id: `palace-${who}`,
    name: who === 'gardener' ? 'A Hushed gardener' : 'A Hushed groom',
    size: "small: the knight's height",
    build: B,
    stand: mv(who === 'gardener' ? 'The gardener clips at nothing' : 'The groom leans on his fork', who === 'gardener' ? gardenerStand() : groomStand(), { jaw: palaceJaw }),
    attack:
      who === 'gardener'
        ? mv('The shears snap', gardenerSnap(), { feet: blowFeet(who), glint: blowGlint, jaw: blowJaw, trail: (s: Skeleton) => { const k = shearsOf(s); return [k.pivot, k.mid]; }, trailSpan: 2.2 })
        : mv('The fork jab', groomJab(), { feet: blowFeet(who), glint: blowGlint, jaw: blowJaw, trail: (s: Skeleton, q?: Posed) => { const f = forkOf(s, (q ?? { draw: 0 }) as { draw: number }); return [f.at(FORK.bar), f.tip]; }, trailSpan: 2.2 }),
    idleFrames: 24,
    idleFps: 10,
    walk: mv('The Hushed rush at you', run(who), { period: PH_RUN.frames / PH_RUN.fps, ground: PH_PACE * TILE3, jaw: runJaw }),
    walkFrames: PH_RUN.frames,
    walkFps: PH_RUN.fps,
    pace: PH_PACE,
    reel: mv('The Hushed are struck', reel(), { jaw: reelJaw, glint: (t) => (t < 0.3 ? 1 - t / 0.3 : 0) }),
    reelTime: 0.4,
    hit: H,
    warn: PH_BLOW.warn[1] - PH_BLOW.warn[0],
    dieTime: PH_DIES.long,
    dying: mv('The Hush leaves them', dying(who), { feet: dyingFeet(), jaw: dieJaw }),
    aura: { x: PH_CANVAS.ax, y: PH_CANVAS.ay - 40, r: 34, color: '#9890b4', a: 0.06 },
    shadow: 11,
    canvas: PH_CANVAS,
    trueBack: true,
    bits: paint.bits,
    grains: paint.grains,
    // (the tool drops from the hands and falls clear to their right)
    fall(piece) {
      if (piece === tool) return who === 'gardener' ? { from: PH_DIES.drop, to: [-11, -32], spin: 70, lay: 'axis', hop: 1.4 } : { from: PH_DIES.drop, to: [-4, -30], spin: 40, lay: 'axis', hop: 1.2 };
      return null;
    },
  };
}
export const PALACE_GARDENER = palaceMob('gardener');
export const PALACE_GROOM = palaceMob('groom');
export const PALACE_ALL: readonly Mob[] = [PALACE_GARDENER, PALACE_GROOM];
export function makePalaceArt3(mob: Mob = PALACE_GARDENER, pace = mob.pace): ActorArt {
  return { front: mobSet(mob, 'front', pace), back: mobSet(mob, 'back', pace) };
}

// =============================================================================================
// THEM AS THE CHECKS SEE THEM (art/boss_checks.ts)

const len3 = (v: V3): number => Math.hypot(v[0], v[1], v[2]);
export function palaceSolids(s: Skeleton): { limbs: CheckLimb[]; lumps: CheckLump[] } {
  const [rH, rK, rA] = B.legR;
  const [r0, r1] = B.armR;
  const limbs: CheckLimb[] = [];
  for (const side of ['L', 'R'] as const) {
    const L = side === 'L';
    limbs.push(
      { name: `leg${side}`, a: L ? s.hipL : s.hipR, b: L ? s.kneeL : s.kneeR, r: rH * 1.08 },
      { name: `shin${side}`, a: L ? s.kneeL : s.kneeR, b: L ? s.ankleL : s.ankleR, r: Math.max(rK, rA) * 1.15 },
      { name: `foot${side}`, a: add(L ? s.heelL : s.heelR, [0, 0, 1.6]), b: add(L ? s.toeL : s.toeR, [0, 0, 1.6]), r: 1.9 },
      { name: `upper${side}`, a: L ? s.shoulderL : s.shoulderR, b: L ? s.elbowL : s.elbowR, r: r0 * 1.12 },
      { name: `fore${side}`, a: L ? s.elbowL : s.elbowR, b: L ? s.handL : s.handR, r: r1 * 1.08 },
    );
  }
  limbs.push({ name: 'neck', a: s.neck, b: lerp3(s.neck, s.head, 0.5), r: 2.2 });
  const waistC = add(s.pelvis, mul(s.hips[2], B.waist * 0.6));
  const lumps: CheckLump[] = [
    { name: 'head', c: s.head, rot: s.face, h: [B.headR[0] * 1.05, B.headR[1] * 1.1, B.headR[2]] },
    { name: 'chest', c: lerp3(s.ribs, s.neck, 0.3), rot: s.chest, h: [B.ribDeep + 1.6, B.ribHalf + 1.8, len3(sub(s.neck, s.ribs)) * 0.55] },
    { name: 'belly', c: lerp3(waistC, s.ribs, 0.45), rot: s.belly, h: [B.waistDeep + 1.4, B.waistHalf + 1.4, Math.max(3, len3(sub(s.ribs, waistC)) * 0.6)] },
    { name: 'hips', c: add(s.pelvis, mul(s.hips[2], B.waist * 0.2)), rot: s.hips, h: [B.pelvisDeep + 1.8, B.pelvisHalf + 2.0, B.waist * 0.75] },
  ];
  return { limbs, lumps };
}
function toolThings(who: PalaceWho, s: Skeleton, q: Posed): CheckThing[] {
  if (who === 'gardener') {
    const k = shearsOf(s);
    return [
      { name: 'shears handle L', pts: [k.gripL, lerp3(k.gripL, k.pivot, 0.5), k.pivot], r: 0.7, may: ['foreL', 'foreR'] },
      { name: 'shears handle R', pts: [k.gripR, lerp3(k.gripR, k.pivot, 0.5), k.pivot], r: 0.7, may: ['foreL', 'foreR'] },
      { name: 'shears blades', pts: [k.pivot, k.tipL, k.pivot, k.tipR], r: 0.6, may: [] },
    ];
  }
  const f = forkOf(s, q as unknown as { draw: number });
  return [
    { name: 'fork shaft', pts: [f.butt, f.at(FORK.socket * 0.33), f.at(FORK.socket * 0.66), f.at(FORK.socket)], r: 0.85, may: ['foreR', 'foreL'] },
    { name: 'fork tines', pts: [f.at(FORK.bar), f.tip], r: 2.8, may: [] },
  ];
}
export function palaceShape(who: PalaceWho): BossShape {
  const tip = (s: Skeleton, q: Posed): V3 => (who === 'gardener' ? shearsOf(s).mid : forkOf(s, q as unknown as { draw: number }).tip);
  return {
    body: palaceSolids,
    tip: (move, t, s, q) => (move === 'dying' && t >= PH_DIES.drop ? null : tip(s, q)),
    things: (move, t, s, q) => (move === 'dying' && t >= PH_DIES.drop ? [] : toolThings(who, s, q)),
  };
}
export const PH_SHAPE_GARDENER = palaceShape('gardener');
export const PH_SHAPE_GROOM = palaceShape('groom');
