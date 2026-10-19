// THE BOOKWARDENS: THEIR MOVES (the art chat for floors 11 to 15, 19 Oct 2026). A MOCK-UP: NOT IN THE GAME, behind
// BOOKWARDENS_ON (art/bookwardens.ts, off). Their look and brief are art/bookwardens.ts: made on his word of 18 Oct,
// 21:24 Pacific, “Hey go without my say so.  If something is shit I’ll get it to it but you’re doing a great jobs. At
// least for 11-15”, the picks this chat would have marked recommended, and sent him with their films.
//
// THEIR MOVES:
//   STANDING (art/bookwardens.ts): planted wide, the flail's haft held out before them, the tome hanging from it by the
//     knee and swaying a little; breathing heavily, the masked head turning slowly to watch.
//   THE TRUDGE: heavy, wide-footed, the tome swinging on its chain.
//   THE TOME SLAM (their blow): the haft heaved up over the head and the tome whirled round above it on its chain, its
//     brass glinting pink, the body braced under it (THE WARNING); then hips first, a step in, and the tome brought over
//     the top and down to crash flat on the floor before them, the body bent over it; held there; dragged back up,
//     swinging and turning on its chain.
//   STRUCK: jolted back, the masked head snapped back, the tome swinging.
//   THEIR DEATH: rocked back, the tome swinging up; THE CHAIN SNAPS and the tome bursts open in the air, its pages
//     flying up and away, pink going pale (the words in it going free); the haft drops from their hand; down on their
//     knees, swaying; and forward onto their face.
//
// By his rulebook: every move through every check the bosses have (art/boss_checks.ts), from in front and behind.
//   test: tsx --test tests/bookwardens.test.ts

import { footwork, kneelHips, kneelSettle, plantBy, plantOf } from './bosses3';
import type { Plant } from './bosses3';
import type { BossShape, CheckLimb, CheckLump, CheckThing } from './boss_checks';
import type { ActorArt } from './actor_types';
import { TOME, WB_BODY, WB_CANVAS, WB_REST, WB_STAND_LONG, bookCorners, pagesFree, sm, tomeAt, wardenPainter, wardenStand } from './bookwardens';
import type { TomeWay } from './bookwardens';
import { FLAME } from './mkit';
import { TILE3, mobSet, skeletonAt } from './new_mobs3';
import type { Mob, MobMove, Moment } from './new_mobs3';
import { add, elbowFor, lerp3, mul, norm, solve, sub } from './skeleton';
import type { Bones, Key3, Motion, Posed, Skeleton, V3 } from './skeleton';

type P = Partial<Bones>;
const B = WB_BODY;
const R = WB_REST;
const L0 = plantOf(B, 'L', {}, R);
const R0 = plantOf(B, 'R', {}, R);
const D = Math.PI / 180;
const len3 = (v: V3): number => Math.hypot(v[0], v[1], v[2]);
const clamp01 = (v: number): number => Math.max(0, Math.min(1, v));

function elbowsTo(pose: P, wantL: V3 | null, wantR: V3 | null): P {
  const q = { ...R, ...pose } as Posed;
  const le = wantL ? elbowFor(B, q, true, norm(wantL)) : q.le;
  const re = wantR ? elbowFor(B, { ...q, le } as Posed, false, norm(wantR)) : q.re;
  return { ...pose, le, re };
}

// =============================================================================================
// THE CHAIN AT REST: hanging, swaying a little

const Y: V3 = [0, 1, 0];
const hang = (x: number, y: number): V3 => norm([x, y, -1]);
/** Standing: the tome swaying on its chain a little as they sway. */
function standChain(t: number): V3 {
  const a = (t / WB_STAND_LONG) * Math.PI * 2;
  return hang(0.1 * Math.sin(a + 1.2), 0.06 * Math.sin(a * 2));
}
const HANG0 = standChain(0);

// =============================================================================================
// THE TRUDGE

export const WB_PACE = 0.85;
export const WB_WALK = { frames: 12, fps: 8 } as const;
function stepFoot(k: number, n: number, step: number, lift: number): [number, number, number] {
  const half = n / 2;
  if (k <= half) return [step * (half / 2 - k), 0, 0];
  const u = (k - half) / half;
  const g = u * u * (3 - 2 * u);
  return [-step * (half / 2) + step * half * g, lift * Math.sin(Math.PI * u), 14 * Math.sin(Math.PI * u) * (1 - u) - 6 * Math.sin(Math.PI * u) * u];
}
function wardenWalk(): Motion {
  const n = WB_WALK.frames;
  const d = (WB_PACE * TILE3) / WB_WALK.fps;
  const keys: Key3[] = [];
  for (let i = 0; i <= n; i++) {
    const j = i % n;
    const a = (j / n) * Math.PI * 2;
    const [lx, lz, lp] = stepFoot(j, n, d, 3.4);
    const [rx, rz, rp] = stepFoot((j + n / 2) % n, n, d, 3.4);
    const sag = Math.abs(Math.sin(a));
    keys.push({
      at: i / WB_WALK.fps,
      ease: 'lin',
      pose: {
        pz: R.pz - 1.2 * sag, py: 1.6 * Math.sin(a), roll: R.roll + 4 * Math.sin(a), yaw: 4 * Math.cos(a), side: 1.6 * Math.sin(a),
        bend: R.bend + 2 * sag, pitch: R.pitch + 3, faceUp: R.faceUp - 2 * sag, faceTilt: R.faceTilt + 4 * Math.sin(a), faceTurn: R.faceTurn + 3 * Math.cos(a),
        lfx: lx, lfz: lz, lfp: lp, lfy: R.lfy, lft: R.lft,
        rfx: rx, rfz: rz, rfp: rp, rfy: R.rfy, rft: R.rft,
        lhx: (R.lhx as number) + 3.0 * Math.sin(a + Math.PI), lhz: (R.lhz as number) + 0.6 * sag,
        rhz: R.rhz + 0.8 * sag, rhx: R.rhx + 1.0 * Math.sin(a), wEl: R.wEl + 3 * Math.sin(a * 2),
      },
    });
  }
  return { keys, loop: 0 };
}
/** Walking: the tome swinging on its chain with their stride, trailing a little. */
function walkChain(t: number): V3 {
  const a = (t / (WB_WALK.frames / WB_WALK.fps)) * Math.PI * 2;
  return hang(-0.1 * Math.sin(a + 0.8) - 0.0, 0.05 * Math.cos(a));
}

// =============================================================================================
// THE TOME SLAM

/**
 * Their blow: the haft overhead by `up`; the warning (the tome whirling over their head, glinting); the tome over the
 * top, the blow at `hit` (a frame of the game's thirty a second); flat on the floor at `floor`, about 1.6 tiles before
 * them; held there to `held`; dragged back up and hanging again by `long`.
 */
export const WB_SLAM = { long: 2.2, up: 0.3, warn: [0.32, 0.8], hit: 27 / 30, floor: 29 / 30, held: 1.3 } as const;
const H = WB_SLAM.hit;
const F = WB_SLAM.floor;
/** How fast it whirls (degrees a second): round over their heads, and over the top. */
const WHIRL = 720;
const OVER = 1890;
/** Where round it is at the floor (degrees: in the last of its ways round, forward and down). */
const PHI_FLOOR = -50;
const omega = (t: number): number => {
  if (t < 0.34) return WHIRL * sm(t / 0.34);
  if (t < 0.78) return WHIRL;
  if (t < 0.9) return WHIRL + (OVER - WHIRL) * sm((t - 0.78) / 0.12);
  return OVER;
};
/** How far round it is at each moment (degrees; going the other way round from its start: front, right, back, left). */
const PHI_TABLE = ((): number[] => {
  const n = Math.round(F * 1000);
  const out = new Array<number>(n + 1);
  out[n] = PHI_FLOOR;
  for (let i = n - 1; i >= 0; i--) out[i] = out[i + 1] + (omega((i + 0.5) / 1000) * 1) / 1000;
  return out;
})();
function phiAt(t: number): number {
  if (t >= F) return PHI_FLOOR;
  const x = Math.max(0, t) * 1000;
  const i = Math.floor(x);
  const k = x - i;
  return PHI_TABLE[i] + (PHI_TABLE[Math.min(PHI_TABLE.length - 1, i + 1)] - PHI_TABLE[i]) * k;
}
/** How far the way round it goes has tipped from flat over their heads to upright before them (degrees): in its last way round, from their right to behind them. */
const tauOf = (phi: number): number => 90 * sm((300 - phi) / 140);
/** How far it hangs below that way round: hanging straight down at first, then whirling out flat. */
const betaOf = (t: number, tau: number): number => (14 + 76 * (1 - sm(t / 0.36))) * (1 - sm(tau / 90));
/** The way round it goes as a ring: square to `n`. */
function ringOf(tau: number): { n: V3; e2: V3 } {
  const c = Math.cos(tau * D);
  const s = Math.sin(tau * D);
  return { n: [0, -s, c], e2: [0, c, s] };
}
/** The chain's way from the haft's end at a moment of the slam, and the way the book's spine faces. */
function slamChain(t: number): TomeWay {
  if (t <= F) {
    const phi = phiAt(t);
    const tau = tauOf(phi);
    const beta = betaOf(t, tau);
    const { n, e2 } = ringOf(tau);
    const cb = Math.cos(beta * D);
    const d = norm(add(mul(add(mul([1, 0, 0], Math.cos(phi * D)), mul(e2, Math.sin(phi * D))), cb), mul(n, -Math.sin(beta * D))));
    // (from hanging, its spine to their left, to its spine square to the way it whirls)
    const k = sm((90 - beta) / 60);
    const bs = norm(lerp3(Y, n, k));
    // (at first, still near hanging as at their stand)
    const cd = t < 0.15 ? norm(lerp3(HANG0, d, sm(t / 0.15))) : d;
    return { cd, bs, whole: true };
  }
  // dragged back up off the floor: swinging under the haft, and turning on its chain to hang as at their stand
  const d0 = ((): V3 => {
    if (t < WB_SLAM.held) return [Math.cos(PHI_FLOOR * D), 0, Math.sin(PHI_FLOOR * D)];
    const u = (t - WB_SLAM.held) / (WB_SLAM.long - WB_SLAM.held);
    // (lifted off the floor and swinging back under, then a smaller swing on)
    const phi = PHI_FLOOR + (-90 - PHI_FLOOR) * sm(u / 0.35) - 26 * Math.sin(Math.PI * clamp01((u - 0.25) / 0.5)) * (1 - sm((u - 0.5) / 0.5)) * 0.8;
    return [Math.cos(phi * D), 0, Math.sin(phi * D)];
  })();
  const back = sm((t - 1.8) / 0.4);
  const cd = norm(lerp3(d0, HANG0, back));
  const turn = Math.PI * sm((t - 1.55) / 0.6);
  const bs: V3 = [Math.sin(turn), -Math.cos(turn), 0];
  return { cd, bs, whole: true };
}

/** The haft held up overhead, the hand going round a little ahead of the tome (driving it round). */
const UP_HAND = { x: 2.0, y: -1.5, z: 20.5 } as const;
const WHIRLING = (t: number): P => {
  const phi = phiAt(t) * D - Math.PI / 2;
  const r = 1.4 * sm((t - 0.2) / 0.2);
  return elbowsTo(
    { px: -1.2, py: 0.6, pz: R.pz + 0.5, yaw: -3, twist: -4, pitch: -1, bend: -5, roll: -1.5, side: 0, faceUp: 8, faceTilt: 0, faceTurn: 0, rhIn: 1, rhx: UP_HAND.x + r * Math.cos(phi), rhy: UP_HAND.y + r * Math.sin(phi), rhz: UP_HAND.z, wAz: 0, wEl: 84, wRoll: 0, lhIn: 1, lhx: 9, lhy: 11, lhz: -12, lk: 12, rk: -12 },
    [-0.2, 1, -0.6],
    [0.1, -1, 0.1],
  );
};
/** Over the top, a frame of the game's at a time, gathering speed all the way down: the hips first, then the chest, then the arm and the tome. */
const SLAM_KEYS = ((): [number, P][] => {
  const base = WHIRLING(0.78);
  const f = (k: number): number => H + (k - 27) / 30;
  return [
    [f(24), elbowsTo({ ...base, px: 0.6, pz: R.pz + 0.2, yaw: 3, twist: -6, pitch: 6, bend: -8, roll: 0, faceUp: 8, rhx: -0.5, rhy: -1.5, rhz: 21.5, wEl: 100 }, [-0.2, 1, -0.6], [0, -1, 0.2])],
    [f(25), elbowsTo({ ...base, px: 2.6, pz: R.pz - 0.6, yaw: 6, twist: -2, pitch: 12, bend: -4, roll: 0, faceUp: 6, rhx: 3, rhy: -2.0, rhz: 20.5, wEl: 95, lhx: 4, lhy: 12, lhz: -14 }, [-0.3, 1, -0.6], [0.2, -1, 0.2])],
    [f(26), elbowsTo({ ...base, px: 4.6, pz: R.pz - 1.8, yaw: 8, twist: 4, pitch: 18, bend: 2, roll: 0, faceUp: 2, rhx: 9, rhy: -2.5, rhz: 16, wEl: 72, lhx: 0, lhy: 12, lhz: -16 }, [-0.5, 1, -0.4], [0.3, -1, -0.1])],
    [f(27), elbowsTo({ ...base, px: 6.4, pz: R.pz - 3.4, yaw: 9, twist: 8, pitch: 25, bend: 8, roll: 0, faceUp: -2, rhx: 16, rhy: -3.0, rhz: 6, wEl: 35, lhx: -4, lhy: 11, lhz: -16 }, [-0.6, 1, -0.2], [0.3, -1, -0.4])],
    [f(28), elbowsTo({ ...base, px: 7.8, pz: R.pz - 5.8, yaw: 9, twist: 9, pitch: 34, bend: 15, roll: 0, faceUp: -6, rhx: 21, rhy: -3.5, rhz: -10, wEl: -2, lhx: -7, lhy: 10, lhz: -14 }, [-0.6, 1, -0.1], [0.2, -1, -0.5])],
    [f(29), elbowsTo({ ...base, px: 8.6, pz: R.pz - 7.6, yaw: 8, twist: 8, pitch: 39, bend: 19, roll: 0, faceUp: -8, rhx: 22, rhy: -3.5, rhz: -18, wEl: -22, lhx: -8, lhy: 10, lhz: -13 }, [-0.6, 1, -0.1], [0.2, -1, -0.5])],
  ];
})();
const DOWN = SLAM_KEYS[SLAM_KEYS.length - 1][1];
/** Hauling it back: upright again, the haft before them, the tome swinging under it. */
const HAUL: P = elbowsTo({ px: 2.0, pz: R.pz - 0.6, yaw: 2, twist: 0, pitch: 8, bend: 4, roll: 0, side: 0, faceUp: 0, faceTilt: 0, faceTurn: 0, rhIn: 1, rhx: 11, rhy: -4.5, rhz: -12, wAz: 2, wEl: 34, wRoll: 0, lhIn: 1, lhx: 2, lhy: 6, lhz: -22, lk: 10, rk: -10 }, [-0.2, 0.6, -0.8], [-0.3, -0.8, -0.5]);
function wardenSlam(): Motion {
  const keys: Key3[] = [{ at: 0, pose: {} }];
  // (heaved up overhead, the tome lifting out on its chain and whirling: frame by frame from as it goes round)
  keys.push({ at: 0.12, pose: elbowsTo({ px: -0.6, pz: R.pz + 0.2, pitch: 1, bend: 0, faceUp: 4, rhIn: 1, rhx: 9, rhy: -5, rhz: 2, wAz: 2, wEl: 56, lhIn: 1, lhx: 6, lhy: 8, lhz: -18 }, [-0.2, 0.8, -0.6], [-0.2, -1, -0.4]), ease: 'in' });
  for (let i = 9; i < 24; i++) {
    const t = H + (i - 27) / 30;
    keys.push({ at: t, pose: i < 10 ? { ...WHIRLING(t), rhx: UP_HAND.x, rhy: UP_HAND.y } : WHIRLING(t), ease: i === 9 ? 'out' : 'lin' });
  }
  for (const [t, p] of SLAM_KEYS) keys.push({ at: t, pose: p, ease: 'lin' });
  keys.push({ at: WB_SLAM.held, pose: { ...DOWN, pz: (DOWN.pz as number) + 0.3, pitch: 37, bend: 18, faceUp: -4 }, ease: 'io' });
  keys.push({ at: 1.62, pose: HAUL, ease: 'io' });
  keys.push({ at: WB_SLAM.long, pose: {}, ease: 'io' });
  return { hit: H, keys };
}
function wardenSlamFeet(): (t: number) => P {
  return footwork(B, {
    L: { start: L0, moves: [{ t0: 0.76, t1: 0.88, to: plantBy(L0, 10, 0.5, 6), lift: 3.2 }, { t0: 1.5, t1: 1.84, to: L0, lift: 2.8 }] },
    R: { start: R0, moves: [{ t0: 0.86, t1: 0.96, to: { ...R0, pitch: 18 } }, { t0: 1.5, t1: 1.75, to: R0 }] },
  });
}
/** The warning: the brass on the tome glinting pink, from as it whirls up to the blow. */
function slamGlint(t: number): number {
  if (t < 0.16 || t > H + 0.05) return 0;
  return t < WB_SLAM.warn[0] ? (t - 0.16) / (WB_SLAM.warn[0] - 0.16) : 1;
}
/** How hard it has just struck the floor: 1 as it lands, falling away as the dust settles. */
export function slamAt(t: number): number {
  const u = (t - F) / 0.6;
  return u >= 0 && u < 1 ? 1 - u : 0;
}

// =============================================================================================
// STRUCK

export const WB_REEL = 0.4;
function wardenReel(): Motion {
  return {
    keys: [
      { at: 0, pose: {} },
      { at: 0.06, pose: { px: -2.6, pz: R.pz + 0.5, pitch: -2, bend: -4, faceUp: R.faceUp + 22, faceTilt: R.faceTilt + 8, lhx: 1, lhy: 6, lhz: -18, rhz: R.rhz + 2, rhx: R.rhx - 1.5, wEl: R.wEl + 10, out: 0.1 }, ease: 'out' },
      { at: 0.18, pose: { px: -1.0, pitch: 6, bend: 8, faceUp: R.faceUp + 6, wEl: R.wEl - 4 }, ease: 'io' },
      { at: WB_REEL, pose: {}, ease: 'io' },
    ],
  };
}
function reelChain(t: number): V3 {
  const u = clamp01(t / WB_REEL);
  return hang(HANG0[0] / -HANG0[2] + 0.34 * Math.sin(Math.PI * u) * (1 - u) * 1.6, HANG0[1] / -HANG0[2]);
}

// =============================================================================================
// THEIR DEATH

/** How long; when the chain snaps and the tome bursts; when the haft drops; the pages flying; on their knees; down on their face. */
export const WB_DIES = { long: 2.6, burst: 0.3, drop: 0.5, pages: [0.3, 2.1], knees: 1.05, down: 1.95 } as const;
const DIE_FEET = ((): Record<'L' | 'R', Plant> => ({ L: plantBy(L0, R0.at[0] - L0.at[0] + 3, 0), R: R0 }))();
const TUCK = 56;
const KNEE_DOWN = B.legR[1] * 1.3;
const kneeling = (lean: number, body: P): P => kneelSettle(B, R, { ...kneelHips(B, R, DIE_FEET, TUCK, KNEE_DOWN, lean), ...body }, DIE_FEET, TUCK, KNEE_DOWN);
const HANG = -(B.upperArm + B.foreArm) * 0.9;
const HANGING: P = { lhIn: 0, lhx: 3, lhy: 8, lhz: HANG + 4, le: -10, rhIn: 0, rhx: 3, rhy: -8, rhz: HANG + 4, re: 10 };
/** Their arms laid on the floor where their body puts them: each hand `back` behind its shoulder and `out` to its side. */
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
function wardenDying(): Motion {
  return {
    keys: [
      { at: 0, pose: {} },
      { at: 0.08, pose: { px: -2.8, pz: R.pz + 0.5, pitch: -4, bend: -6, faceUp: R.faceUp + 24, rhx: R.rhx + 1, rhz: R.rhz + 4, wEl: R.wEl + 16, out: 0.15 }, ease: 'out' },
      // (the haft jerked up as the chain snaps, the tome bursting)
      { at: WB_DIES.burst, pose: elbowsTo({ px: -2.6, pz: R.pz + 0.7, pitch: -7, bend: -12, faceUp: 30, faceTilt: 0, faceTurn: 0, rhIn: 1, rhx: 10, rhy: -6, rhz: -2, wAz: 4, wEl: 64, lhIn: 1, lhx: 2, lhy: 7, lhz: -16, out: 0.4 }, [-0.2, 0.6, -0.8], [-0.4, -0.8, -0.3]), ease: 'out' },
      { at: 0.46, pose: elbowsTo({ px: -2.3, pz: R.pz + 0.6, pitch: -7, bend: -12, faceUp: 32, faceTilt: 4, faceTurn: 0, rhIn: 1, rhx: 6, rhy: -6.5, rhz: -12, wAz: 4, wEl: 30, lhIn: 1, lhx: 1.6, lhy: 6.5, lhz: -18, out: 0.6 }, [-0.2, 0.6, -0.8], [-0.4, -0.7, -0.5]), ease: 'io' },
      { at: 0.64, pose: { px: -2.0, pz: R.pz + 0.4, pitch: -6, bend: -10, faceUp: 28, faceTilt: 6, lhIn: 1, lhx: 1.4, lhy: 6.5, lhz: -18, rhIn: 1, rhx: 1.4, rhy: -6.5, rhz: -18, out: 0.85 }, ease: 'io' },
      { at: 0.84, pose: { px: -0.6, pz: R.pz - 5.5, pitch: 2, bend: 2, faceUp: 12, lk: 26, rk: -26, ...HANGING, out: 1 }, ease: 'in' },
      { at: WB_DIES.knees, pose: { ...ON_KNEES, out: 1 }, ease: 'out' },
      { at: 1.3, pose: { ...ON_KNEES, pz: (ON_KNEES.pz as number) + 0.6, pitch: -2, roll: -3, faceUp: 10, out: 1 }, ease: 'io' },
      { at: 1.52, pose: { ...ON_KNEES, pitch: 8, roll: 4, faceUp: -6, out: 1 }, ease: 'io' },
      { at: 1.68, pose: { ...FOLD, out: 1 }, ease: 'in' },
      { at: 1.82, pose: { ...SLUMP, out: 1 }, ease: 'lin' },
      { at: WB_DIES.down, pose: PRONE, ease: 'out' },
      { at: WB_DIES.long, pose: PRONE, ease: 'io' },
    ],
  };
}
function wardenDyingFeet(): (t: number) => P {
  const Fe = DIE_FEET;
  return footwork(B, {
    L: { start: L0, moves: [{ t0: 0.04, t1: 0.26, to: Fe.L, lift: 2.4 }, { t0: 0.68, t1: 1.0, to: { ...Fe.L, pitch: TUCK } }] },
    R: { start: Fe.R, moves: [{ t0: 0.68, t1: 1.0, to: { ...Fe.R, pitch: TUCK } }] },
  });
}
/** As they die: the tome swung up as they are rocked back; at the burst, the chain's broken end hanging from the haft. */
function dyingChain(t: number): TomeWay {
  if (t < WB_DIES.burst) {
    // (swung up and out before them as the haft is jerked up, near level as the chain snaps)
    const u = sm(clamp01(t / WB_DIES.burst));
    return { cd: norm(lerp3(HANG0, [0.92, 0, 0.2], u)), bs: Y, whole: true };
  }
  const u = clamp01((t - WB_DIES.burst) / 0.5);
  return { cd: hang(0.8 * (1 - sm(u)) - 0.3 * Math.sin(Math.PI * u), 0.1), bs: Y, whole: false };
}

// =============================================================================================
// THEM, AS THE GAME HOLDS A MONSTER

export const NAMES = { stand: 'The Bookwardens stand, watching', walk: 'The Bookwardens trudge', attack: 'The tome slam', reel: 'The Bookwardens are struck', dying: 'The Bookwardens fall, their tomes bursting' } as const;
const KEY_OF = new Map<string, string>(Object.entries(NAMES).map(([k, v]) => [v, k]));
/** How the chain and the book lie at a moment of a move (its key: stand, walk, attack, reel, dying). */
export function tomeWayOf(move: string, t: number): TomeWay {
  switch (move) {
    case 'walk':
      return { cd: walkChain(t), bs: Y, whole: true };
    case 'attack':
      return slamChain(t);
    case 'reel':
      return { cd: reelChain(t), bs: Y, whole: true };
    case 'dying':
      return dyingChain(t);
    default:
      return { cd: standChain(t), bs: Y, whole: true };
  }
}
const keyOf = (m: Moment): string => (m.dying ? 'dying' : KEY_OF.get(m.move ?? '') ?? 'stand');

/** Where the tome burst (its middle as the chain snapped), as they die. */
let BURST_AT: V3 | null = null;
function burstAt(mob: Mob): V3 {
  if (!BURST_AT) {
    const s = skeletonAt(mob, 'dying', WB_DIES.burst - 1 / 60);
    BURST_AT = tomeAt(s, dyingChain(WB_DIES.burst - 1 / 60)).mid;
  }
  return BURST_AT;
}

function wardenMob(): Mob {
  let self: Mob | null = null;
  const paint = wardenPainter({
    tome: (m) => tomeWayOf(keyOf(m), m.t),
    flash: (m) => {
      if (!m.dying || !self) return null;
      const u = (m.t - WB_DIES.burst) / 0.24;
      return u >= 0 && u < 1 ? { p: burstAt(self), a: 1 - u } : null;
    },
    grains: (m, out) => {
      if (m.dying && self) pagesFree(out, burstAt(self), m.t, WB_DIES.pages[0], WB_DIES.pages[1]);
    },
  });
  const mv = (name: string, motion: Motion, more: Partial<MobMove> = {}): MobMove => ({ name, motion, rest: R, ...more });
  const mob: Mob = {
    id: 'bookwarden',
    name: 'A Bookwarden of the Silent Order',
    size: 'medium: a head over the knight',
    build: B,
    stand: mv(NAMES.stand, wardenStand()),
    attack: mv(NAMES.attack, wardenSlam(), { feet: wardenSlamFeet(), glint: slamGlint, trail: (s: Skeleton) => { const k = tomeAt(s, slamChain(H)); return [k.tie, k.mid, add(k.mid, mul(k.frame[0], TOME.long))]; }, trailSpan: 2.4 }),
    idleFrames: 32,
    idleFps: 10,
    walk: mv(NAMES.walk, wardenWalk(), { period: WB_WALK.frames / WB_WALK.fps, ground: WB_PACE * TILE3 }),
    walkFrames: WB_WALK.frames,
    walkFps: WB_WALK.fps,
    pace: WB_PACE,
    reel: mv(NAMES.reel, wardenReel()),
    reelTime: WB_REEL,
    hit: H,
    warn: WB_SLAM.warn[1] - WB_SLAM.warn[0],
    dieTime: WB_DIES.long,
    dying: mv(NAMES.dying, wardenDying(), { feet: wardenDyingFeet() }),
    aura: { x: WB_CANVAS.ax, y: WB_CANVAS.ay - 50, r: 40, color: '#5a1838', a: 0.07 },
    shadow: 13,
    canvas: WB_CANVAS,
    trueBack: true,
    bits: paint.bits,
    grains: paint.grains,
    // (the haft drops from their hand, the chain's broken end on it, and falls before them to their right)
    fall(piece) {
      if (piece === 'flail') return { from: WB_DIES.drop, to: [10, -12], spin: 40, lay: 'axis', hop: 1.0 };
      return null;
    },
  };
  self = mob;
  return mob;
}
export const BOOKWARDEN = wardenMob();
export function makeBookwardenArt3(pace = BOOKWARDEN.pace): ActorArt {
  return { front: mobSet(BOOKWARDEN, 'front', pace), back: mobSet(BOOKWARDEN, 'back', pace) };
}

// =============================================================================================
// THEM AS THE CHECKS SEE THEM (art/boss_checks.ts)

export function wardenSolids(s: Skeleton): { limbs: CheckLimb[]; lumps: CheckLump[] } {
  const [rH, rK, rA] = B.legR;
  const [r0, r1] = B.armR;
  const limbs: CheckLimb[] = [];
  for (const side of ['L', 'R'] as const) {
    const L = side === 'L';
    limbs.push(
      { name: `leg${side}`, a: L ? s.hipL : s.hipR, b: L ? s.kneeL : s.kneeR, r: rH * 1.08 },
      { name: `shin${side}`, a: L ? s.kneeL : s.kneeR, b: L ? s.ankleL : s.ankleR, r: Math.max(rK, rA) * 1.2 },
      { name: `foot${side}`, a: add(L ? s.heelL : s.heelR, [0, 0, 1.9]), b: add(L ? s.toeL : s.toeR, [0, 0, 1.9]), r: 2.1 },
      { name: `upper${side}`, a: L ? s.shoulderL : s.shoulderR, b: L ? s.elbowL : s.elbowR, r: r0 * 1.22 },
      { name: `fore${side}`, a: L ? s.elbowL : s.elbowR, b: L ? s.handL : s.handR, r: r1 * 1.2 },
    );
  }
  limbs.push({ name: 'neck', a: s.neck, b: lerp3(s.neck, s.head, 0.5), r: 3.2 });
  const waistC = add(s.pelvis, mul(s.hips[2], B.waist * 0.6));
  const lumps: CheckLump[] = [
    { name: 'head', c: s.head, rot: s.face, h: [B.headR[0] * 1.3, B.headR[1] * 1.4, B.headR[2] * 1.2] },
    { name: 'chest', c: lerp3(s.ribs, s.neck, 0.3), rot: s.chest, h: [B.ribDeep + 2.3, B.ribHalf + 2.1, len3(sub(s.neck, s.ribs)) * 0.55] },
    { name: 'belly', c: lerp3(waistC, s.ribs, 0.45), rot: s.belly, h: [B.waistDeep + 2.2, B.waistHalf + 1.8, Math.max(3, len3(sub(s.ribs, waistC)) * 0.6)] },
    { name: 'hips', c: add(s.pelvis, mul(s.hips[2], B.waist * 0.2)), rot: s.hips, h: [B.pelvisDeep + 2.2, B.pelvisHalf + 2.4, B.waist * 0.75] },
  ];
  return { limbs, lumps };
}
const MOVE_KEYS = ['stand', 'walk', 'attack', 'reel', 'dying'] as const;
function tomeThings(move: string, t: number, s: Skeleton): CheckThing[] {
  if (move === 'dying' && t >= WB_DIES.drop) return [];
  const w = tomeWayOf(move, t);
  const k = tomeAt(s, w);
  const out: CheckThing[] = [
    // (the haft in the right hand; the chain from its end)
    { name: 'haft', pts: [k.butt, lerp3(k.butt, k.end, 0.33), lerp3(k.butt, k.end, 0.66), k.end], r: 1.1, may: ['foreR'] },
    { name: 'chain', pts: k.links, r: 0.9, may: [] },
  ];
  if (w.whole) {
    const [d, sd] = k.frame;
    out.push({ name: 'tome', pts: [k.tie, k.mid, add(k.mid, mul(d, TOME.long * 0.9)), add(k.mid, mul(sd, TOME.wide * 0.7)), add(k.mid, mul(sd, -TOME.wide * 0.7))], r: TOME.thick, may: [] });
  }
  return out;
}
export const WB_SHAPE: BossShape = {
  body: wardenSolids,
  // (what they strike with: the tome, while it is whole)
  tip: (move, t, s) => {
    const w = tomeWayOf(move, t);
    return w.whole ? tomeAt(s, w).mid : null;
  },
  things: (move, t, s) => tomeThings(move, t, s),
};
/** The tome's lowest corner at a moment of a move (for the checks: never in the floor). */
export function tomeLow(move: (typeof MOVE_KEYS)[number], t: number, s: Skeleton): number {
  const w = tomeWayOf(move, t);
  if (!w.whole) return Infinity;
  return Math.min(...bookCorners(tomeAt(s, w)).map((p) => p[2]));
}
void FLAME;
