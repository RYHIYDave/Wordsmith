// THE SILENT ORDER'S CARTERS: THEIR MOVES (the art chat for floors 11 to 15, 19 Oct 2026). A MOCK-UP: NOT IN THE GAME,
// behind CARTERS_ON (art/carters.ts, off). Their look and brief are art/carters.ts: made on his word of 18 Oct, 21:24
// Pacific, “Hey go without my say so.  If something is shit I’ll get it to it but you’re doing a great jobs. At least for
// 11-15”, the picks this chat would have marked recommended, and sent him with their films.
//
// THEIR MOVES:
//   STANDING (art/carters.ts): planted, the whip's stock at the hip, the lash trailing on the ground; the masked head
//     turning slowly; the stock tapped against the boot once a round.
//   THE TRUDGE: heavy, steady, the lash dragged along the ground behind.
//   THE WHIP CRACK (their blow): the whip swung back over the right shoulder, the body wound round, the lash streaming out
//     behind, its cracker glinting pink, held (THE WARNING); then hips first, a step in, the arm brought over and down,
//     and the lash rolls out before them, straight at full reach, and CRACKS (pink sparks); it falls on the ground, and
//     is drawn back.
//   STRUCK: jolted back, the masked head snapped back, the lash flicking.
//   THEIR DEATH: rocked back, the hat knocked off; the lantern's flame going out; the whip dropped; a stagger back, the
//     knees going, down onto the ground and over onto their back.
//
// By his rulebook: every move through every check the bosses have (art/boss_checks.ts), from in front and behind.
//   test: tsx --test tests/carters.test.ts

import { footwork, plantBy, plantOf } from './bosses3';
import type { BossShape, CheckLimb, CheckLump, CheckThing } from './boss_checks';
import type { ActorArt } from './actor_types';
import { CARTER_BODY, CARTER_CANVAS, CARTER_REST, WHIP, carterPainter, carterStand, lagOf, lashFrom, smooth, stockOf } from './carters';
import { TILE3, mobSet } from './new_mobs3';
import type { Mob, MobMove, Moment } from './new_mobs3';
import { add, elbowFor, lerp3, mul, norm, solve, sub } from './skeleton';
import type { Bones, Key3, Motion, Posed, Skeleton, V3 } from './skeleton';

type P = Partial<Bones>;
const B = CARTER_BODY;
const R = CARTER_REST;
const L0 = plantOf(B, 'L', {}, R);
const R0 = plantOf(B, 'R', {}, R);
const N = WHIP.n;
const len3 = (v: V3): number => Math.hypot(v[0], v[1], v[2]);

function elbowsTo(pose: P, wantL: V3 | null, wantR: V3 | null): P {
  const q = { ...R, ...pose } as Posed;
  const le = wantL ? elbowFor(B, q, true, norm(wantL)) : q.le;
  const re = wantR ? elbowFor(B, { ...q, le } as Posed, false, norm(wantR)) : q.re;
  return { ...pose, le, re };
}

// =============================================================================================
// THE LASH'S SHAPES (points from the stock's end, node 1 to N, the figure's own lengths from its place)

/** Trailing on the ground beside and behind them, a lazy S, dragged back by their going. */
function trailing(end: V3, t: number, lag: V3 = [0, 0, 0]): V3[] {
  const pts: V3[] = [end];
  for (let i = 1; i <= N; i++) {
    const f = i / N;
    pts.push([end[0] - 6 - 40 * f + lag[0] * 4 * f, end[1] - 5 - 16 * f + 4 * Math.sin(5 * f + t * 1.3) * f + lag[1] * 4 * f, Math.max(0.5, end[2] * (1 - f * 4))]);
  }
  return pts;
}
/** Streaming out behind them, up and back over the shoulder. */
function behind(end: V3, t: number, quiver: number): V3[] {
  const pts: V3[] = [end];
  for (let i = 1; i <= N; i++) {
    const f = i / N;
    pts.push([end[0] - 50 * f, end[1] - 12 * f + quiver * 0.6 * Math.sin(t * 50 + f * 6) * f, end[2] + 10 * f - 30 * f * f]);
  }
  return pts;
}
/** Rolled out straight before them, falling a little toward its end. */
function before(end: V3): V3[] {
  const pts: V3[] = [end];
  const L = WHIP.lash;
  for (let i = 1; i <= N; i++) {
    const f = i / N;
    pts.push([end[0] + L * f * 0.97, end[1] + 2 * f, end[2] - (end[2] - 22) * f]);
  }
  return pts;
}
/** Lying on the ground before them where it fell. */
function fallen(end: V3, k: number): V3[] {
  const b = before(end);
  return b.map((p, i) => {
    const f = i / N;
    const e = smooth((k - (1 - f) * 0.35) / 0.65);
    return [p[0] - 2 * e * f, p[1], p[2] + (0.5 - p[2]) * e * Math.min(1, f * 3)];
  });
}
const mix = (a: V3[], b: V3[], k: (f: number) => number, lift: (f: number, e: number) => number = () => 0): V3[] =>
  a.map((p, i) => {
    const f = i / N;
    const e = k(f);
    const q = lerp3(p, b[i], e);
    return [q[0], q[1], q[2] + lift(f, e)];
  });

// =============================================================================================
// THE TRUDGE

export const CT_PACE = 0.85;
export const CT_WALK = { frames: 12, fps: 8 } as const;
function stepFoot(k: number, n: number, step: number, lift: number): [number, number, number] {
  const half = n / 2;
  if (k <= half) return [step * (half / 2 - k), 0, 0];
  const u = (k - half) / half;
  const g = u * u * (3 - 2 * u);
  return [-step * (half / 2) + step * half * g, lift * Math.sin(Math.PI * u), 14 * Math.sin(Math.PI * u) * (1 - u) - 6 * Math.sin(Math.PI * u) * u];
}
function carterWalk(): Motion {
  const n = CT_WALK.frames;
  const d = (CT_PACE * TILE3) / CT_WALK.fps;
  const keys: Key3[] = [];
  for (let i = 0; i <= n; i++) {
    const j = i % n;
    const a = (j / n) * Math.PI * 2;
    const [lx, lz, lp] = stepFoot(j, n, d, 3.2);
    const [rx, rz, rp] = stepFoot((j + n / 2) % n, n, d, 3.2);
    const sag = Math.abs(Math.sin(a));
    keys.push({
      at: i / CT_WALK.fps,
      ease: 'lin',
      pose: {
        pz: R.pz - 1.0 * sag, py: 1.2 * Math.sin(a), roll: R.roll + 3 * Math.sin(a), yaw: 4 * Math.cos(a), side: 1.4 * Math.sin(a),
        bend: R.bend + 2 * sag, pitch: R.pitch + 3, faceUp: R.faceUp - 2 * sag, faceTilt: R.faceTilt + 4 * Math.sin(a), faceTurn: R.faceTurn + 3 * Math.cos(a),
        lfx: lx, lfz: lz, lfp: lp, lfy: R.lfy, lft: R.lft,
        rfx: rx, rfz: rz, rfp: rp, rfy: R.rfy, rft: R.rft,
        rhx: R.rhx + 2.4 * Math.sin(a), lhx: R.lhx + 1.2 * Math.sin(a + Math.PI), rhz: R.rhz + 0.6 * sag,
      },
    });
  }
  return { keys, loop: 0 };
}

// =============================================================================================
// THE WHIP CRACK

/** Their blow: wound back by `back`; the warning; the lash cast (`cast`), cracking at `hit` (a frame of the game's thirty a second), on the ground by `lie`, drawn back over `draw`. */
export const CT_WHIP = { long: 1.9, back: 0.34, warn: [0.36, 0.58], cast: [0.6, 0.9], hit: 25 / 30, lie: 1.12, draw: [1.15, 1.75] } as const;
const H = CT_WHIP.hit;
const WOUND: P = elbowsTo({ px: -2.2, pz: R.pz + 0.4, yaw: -8, twist: -16, pitch: -2, bend: -4, side: 2, roll: 0, faceUp: 8, faceTurn: 10, lhIn: 1, lhx: 10, lhy: 6, lhz: -10, rhIn: 1, rhx: -7, rhy: -7, rhz: 11, wAz: 170, wEl: 38, wRoll: 0, lk: 10, rk: -12 }, [0.2, 0.8, -0.6], [-0.4, -0.7, 0.6]);
const shake = (k: number): P => ({ ...WOUND, rhz: (WOUND.rhz as number) + (k % 2 ? 0.5 : -0.2), px: (WOUND.px as number) - 0.2 * (k % 2) });
const DRIVE: P = elbowsTo({ ...WOUND, px: 0.6, yaw: 4, twist: -12, pitch: 6, bend: 0, faceTurn: 2, rhx: -5, rhz: 12, wAz: 175, wEl: 50 }, [0.2, 0.8, -0.6], [-0.4, -0.7, 0.6]);
const OVER: P = elbowsTo({ px: 3, pz: R.pz - 0.6, yaw: 6, twist: 0, pitch: 8, bend: 4, side: 0, faceUp: 6, faceTurn: 0, lhIn: 1, lhx: 6, lhy: 8, lhz: -14, rhIn: 1, rhx: 6, rhy: -6, rhz: 14, wAz: 30, wEl: 70, wRoll: 0, lk: 14, rk: -10 }, [0.2, 0.8, -0.6], [0.2, -0.8, 0.4]);
const STROKE: P = elbowsTo({ px: 5, pz: R.pz - 1.4, yaw: 8, twist: 12, pitch: 12, bend: 8, side: -2, faceUp: 4, faceTurn: -4, lhIn: 1, lhx: 4, lhy: 9, lhz: -16, rhIn: 1, rhx: 16, rhy: -4, rhz: -2, wAz: 0, wEl: 2, wRoll: 0, lk: 18, rk: -8 }, [0.2, 0.8, -0.6], [0.4, -0.8, -0.2]);
const FOLLOW: P = elbowsTo({ ...STROKE, px: 5.4, pz: R.pz - 1.6, pitch: 14, bend: 10, rhx: 17, rhz: -5, wEl: -8 }, [0.2, 0.8, -0.6], [0.4, -0.8, -0.2]);
function carterWhip(): Motion {
  return {
    hit: H,
    keys: [
      { at: 0, pose: {} },
      // (swung out to the side and up, the stock clear of them)
      { at: 0.17, pose: elbowsTo({ px: -1, yaw: -4, twist: -8, rhIn: 1, rhx: 0, rhy: -15, rhz: -2, wAz: -110, wEl: 15, wRoll: 0, lhIn: 1, lhx: 7, lhy: 5, lhz: -13 }, [0.2, 0.8, -0.6], [-0.3, -0.9, 0.1]), ease: 'io' },
      { at: CT_WHIP.back, pose: WOUND, ease: 'io' },
      { at: 0.44, pose: shake(1), ease: 'io' },
      { at: 0.52, pose: shake(2), ease: 'io' },
      { at: CT_WHIP.warn[1], pose: shake(3), ease: 'io' },
      { at: 0.64, pose: DRIVE, ease: 'in' },
      { at: 0.67, pose: OVER, ease: 'lin' },
      { at: 0.79, pose: STROKE, ease: 'out' },
      { at: 0.9, pose: FOLLOW, ease: 'io' },
      { at: 1.15, pose: { ...FOLLOW, pz: R.pz - 1.0, pitch: 8, bend: 6, rhx: 12, rhz: -10, wEl: -20 }, ease: 'io' },
      { at: 1.6, pose: { px: 1, rhIn: 1, rhx: 7, rhy: -4, rhz: -18, wAz: -10, wEl: -30, lhIn: 1, lhx: 5, lhy: 5, lhz: -16 }, ease: 'io' },
      { at: CT_WHIP.long, pose: {}, ease: 'io' },
    ],
  };
}
function carterWhipFeet(): (t: number) => P {
  return footwork(B, {
    L: { start: L0, moves: [{ t0: 0.62, t1: 0.74, to: plantBy(L0, 8, 0.5, 6), lift: 3 }, { t0: 1.5, t1: 1.8, to: L0, lift: 2.6 }] },
    R: { start: R0, moves: [{ t0: 0.66, t1: 0.78, to: { ...R0, pitch: 16 } }, { t0: 1.52, t1: 1.76, to: R0 }] },
  });
}
/** The lash through the blow. */
function whipLash(t: number, end: V3): V3[] {
  const [c0, c1] = CT_WHIP.cast;
  if (t < CT_WHIP.back) return mix(trailing(end, t), behind(end, t, 0), (f) => smooth((t / CT_WHIP.back - f * 0.3) / 0.7), (f, e) => 12 * Math.sin(Math.PI * e) * f);
  if (t < c0) return behind(end, t, t > CT_WHIP.warn[0] ? 1 : 0);
  if (t < CT_WHIP.lie) {
    // (rolled out from its stock to its end, the nearer first, looping up over their head as it goes)
    const k = (t - c0) / (c1 - c0);
    const cast = mix(behind(end, t, 0), before(end), (f) => smooth((k - 0.5 * f) / 0.5), (f, e) => 26 * Math.sin(Math.PI * e) * (0.4 + f));
    if (t < c1) return cast;
    return fallen(end, (t - c1) / (CT_WHIP.lie - c1));
  }
  if (t < CT_WHIP.draw[0]) return fallen(end, 1);
  const k = (t - CT_WHIP.draw[0]) / (CT_WHIP.draw[1] - CT_WHIP.draw[0]);
  return mix(fallen(end, 1), trailing(end, t), (f) => smooth((k - 0.3 * (1 - f)) / 0.7));
}
/** The cracker glinting pink from the swing back to the crack. */
function whipGlint(t: number): number {
  if (t < 0.1 || t > H + 0.05) return 0;
  return t < CT_WHIP.warn[0] ? (t - 0.1) / (CT_WHIP.warn[0] - 0.1) : 1;
}
const whipCrack = (t: number): number => (t < H - 0.02 || t > H + 0.2 ? 0 : 1 - (t - (H - 0.02)) / 0.22);

// =============================================================================================
// THE DRIVER'S LASH (their second blow, the bigger: his rule of 9 Oct, a medium monster two attacks, the bigger hit cooling down longer)

/**
 * The driver's lash: the whip raised over the head by `up` and the lash whirled round above it, its cracker glinting pink
 * (the warning, `warn`); then three cracks, a step in with each, the lash's end striking the floor `reach` tiles before
 * where they stood at `cracks` (frames of the game's thirty a second; the blow, `hit`, the first); the lash lying, drawn
 * back over `draw`, and the feet stepped back to where they stood by `long`.
 */
export const CT_LASHES = { long: 3.05, up: 0.3, warn: [0.36, 0.94], cracks: [33 / 30, 45 / 30, 57 / 30], reach: [1.3, 1.95, 2.55], hit: 33 / 30, draw: [2.2, 2.65] } as const;
const LH = CT_LASHES.hit;
const [C1, C2, C3] = CT_LASHES.cracks;
/** How fast the lash goes round over their head (turns a second), and how wide. */
const WHIRL_TURNS = 1.2;
const WHIRL_R = 26;
/** Where each crack strikes the floor (the figure's own lengths from where they stood), a little to their right, under the whip hand. */
const TARGET: V3[] = CT_LASHES.reach.map((r) => [r * TILE3, -3, 0.5] as V3);
/** The lash whirled round over their head: a circle above the stock's end, the lash trailing round behind its cracker. */
function whirl(end: V3, t: number): V3[] {
  const phi = -2 * Math.PI * WHIRL_TURNS * (t - CT_LASHES.up) - Math.PI;
  const pts: V3[] = [end];
  for (let i = 1; i <= N; i++) {
    const f = i / N;
    const a = phi + 1.1 * f;
    const r = WHIRL_R * Math.sqrt(f);
    pts.push([end[0] + Math.cos(a) * r, end[1] + Math.sin(a) * r, end[2] + 6 * f - 4 * f * f]);
  }
  return pts;
}
/** The lash from the stock's end to a point of the floor, its slack thrown up in a loop over the way (as a whip's is as it cracks). */
function toward(end: V3, target: V3): V3[] {
  const L = WHIP.lash;
  const shape = (h: number): V3[] => {
    const out: V3[] = [];
    for (let i = 0; i <= N; i++) {
      const f = i / N;
      const p = lerp3(end, target, f);
      out.push([p[0], p[1], p[2] + h * Math.sin(Math.PI * f) * (1 - 0.3 * f)]);
    }
    return out;
  };
  const length = (pts: V3[]): number => pts.slice(1).reduce((a, p, i) => a + len3(sub(p, pts[i])), 0);
  let lo = 0;
  let hi = 60;
  for (let i = 0; i < 24; i++) {
    const m = (lo + hi) / 2;
    if (length(shape(m)) < L) lo = m;
    else hi = m;
  }
  return shape(lo);
}
/** Lying where it struck: its loop fallen to the floor. */
function lying(end: V3, target: V3, k: number): V3[] {
  const a = toward(end, target);
  return a.map((p, i) => {
    const f = i / N;
    const e = smooth((k - (1 - f) * 0.3) / 0.7);
    return [p[0], p[1], p[2] + (Math.max(0.5, lerp3(end, target, f)[2] * (1 - f * 2)) - p[2]) * e];
  });
}
/** The lash through the driver's lash. */
function lashesLash(t: number, end: V3): V3[] {
  const up = CT_LASHES.up;
  const cast = (from: V3[], t0: number, t1: number, target: V3): V3[] => {
    const k = (t - t0) / (t1 - t0);
    return mix(from, toward(end, target), (f) => smooth((k - 0.5 * f) / 0.5), (f, e) => 24 * Math.sin(Math.PI * e) * (0.4 + f));
  };
  const back = (from: V3[], t0: number, t1: number): V3[] => {
    const k = (t - t0) / (t1 - t0);
    return mix(from, behind(end, t, 0), (f) => smooth((k - 0.3 * (1 - f)) / 0.7), (f, e) => 18 * Math.sin(Math.PI * e) * f);
  };
  if (t < up) return mix(trailing(end, t), whirl(end, t), (f) => smooth((t / up - f * 0.3) / 0.7), (f, e) => 10 * Math.sin(Math.PI * e) * f);
  if (t < C1 - 0.16) return whirl(end, t);
  if (t < C1) return cast(whirl(end, C1 - 0.16), C1 - 0.16, C1, TARGET[0]);
  if (t < C1 + 0.08) return lying(end, TARGET[0], (t - C1) / 0.08);
  if (t < C2 - 0.13) return back(lying(end, TARGET[0], 1), C1 + 0.08, C2 - 0.13);
  if (t < C2 - 0.1) return behind(end, t, 0);
  if (t < C2) return cast(behind(end, t, 0), C2 - 0.1, C2, TARGET[1]);
  if (t < C2 + 0.08) return lying(end, TARGET[1], (t - C2) / 0.08);
  if (t < C3 - 0.17) return back(lying(end, TARGET[1], 1), C2 + 0.08, C3 - 0.17);
  if (t < C3 - 0.11) return behind(end, t, 0);
  if (t < C3) return cast(behind(end, t, 0), C3 - 0.11, C3, TARGET[2]);
  if (t < CT_LASHES.draw[0]) return lying(end, TARGET[2], (t - C3) / 0.1);
  const k = (t - CT_LASHES.draw[0]) / (CT_LASHES.draw[1] - CT_LASHES.draw[0]);
  return mix(lying(end, TARGET[2], 1), trailing(end, t), (f) => smooth((k - 0.3 * (1 - f)) / 0.7));
}
/** The whip raised, the hand going round a little ahead of the lash, driving it round. */
const RAISED_WHIP = (t: number): P => {
  const phi = -2 * Math.PI * WHIRL_TURNS * (t - CT_LASHES.up) - Math.PI - Math.PI / 2;
  return elbowsTo({ px: -1.2, pz: R.pz + 0.3, yaw: -4, twist: -6, pitch: -2, bend: -4, side: 0, roll: 0, faceUp: 10, faceTurn: 4, lhIn: 1, lhx: 8, lhy: 8, lhz: -12, rhIn: 1, rhx: 2 + 1.6 * Math.cos(phi), rhy: -4 + 1.6 * Math.sin(phi), rhz: 20, wAz: 0, wEl: 76, wRoll: 0, lk: 10, rk: -10 }, [0.2, 0.8, -0.6], [0.1, -1, 0.1]);
};
/** Cocked between the cracks: the arm back over the shoulder, the hips square. */
const cocked = (px: number): P => elbowsTo({ px, pz: R.pz + 0.2, yaw: -6, twist: -12, pitch: 2, bend: -2, side: 1, roll: 0, faceUp: 6, faceTurn: 6, lhIn: 1, lhx: 9, lhy: 7, lhz: -11, rhIn: 1, rhx: -5, rhy: -7, rhz: 13, wAz: 172, wEl: 44, wRoll: 0, lk: 12, rk: -12 }, [0.2, 0.8, -0.6], [-0.4, -0.7, 0.6]);
/** A crack: the arm brought over and down before them, the body driving in after it. */
const struck = (px: number, deep: number): P => elbowsTo({ px, pz: R.pz - 1.2 - deep, yaw: 8, twist: 12, pitch: 12 + 4 * deep, bend: 8 + 3 * deep, side: -2, faceUp: 4, faceTurn: -4, lhIn: 1, lhx: 4, lhy: 9, lhz: -16, rhIn: 1, rhx: 16, rhy: -4, rhz: -2 - deep, wAz: 0, wEl: 0, wRoll: 0, lk: 18, rk: -10 }, [0.2, 0.8, -0.6], [0.4, -0.8, -0.2]);
const driving = (px: number): P => elbowsTo({ px, pz: R.pz - 0.4, yaw: 4, twist: -4, pitch: 7, bend: 2, side: 0, faceUp: 6, faceTurn: 2, lhIn: 1, lhx: 7, lhy: 8, lhz: -13, rhIn: 1, rhx: 3, rhy: -6, rhz: 16, wAz: 40, wEl: 70, wRoll: 0, lk: 14, rk: -10 }, [0.2, 0.8, -0.6], [0.2, -0.8, 0.4]);
function carterLashes(): Motion {
  const keys: Key3[] = [{ at: 0, pose: {} }];
  keys.push({ at: 0.15, pose: elbowsTo({ px: -0.8, yaw: -2, twist: -4, rhIn: 1, rhx: 4, rhy: -8, rhz: 6, wAz: -40, wEl: 50, wRoll: 0, lhIn: 1, lhx: 7, lhy: 6, lhz: -13 }, [0.2, 0.8, -0.6], [-0.1, -1, 0.1]), ease: 'in' });
  // (the lash whirled round over the head, the hand driving it: frame by frame)
  for (let i = 9; i <= Math.round((C1 - 0.16) * 30); i++) keys.push({ at: i / 30, pose: RAISED_WHIP(i / 30), ease: i === 9 ? 'out' : 'lin' });
  // THE FIRST CRACK: hips first, a step in, the arm over and down
  keys.push({ at: C1 - 2 / 30, pose: driving(0.8), ease: 'in' });
  keys.push({ at: C1 - 1 / 30, pose: elbowsTo({ ...driving(2.5), pitch: 10, bend: 6, twist: 6, yaw: 6, rhx: 9, rhz: 8, wAz: 10, wEl: 40 }, [0.2, 0.8, -0.6], [0.3, -0.8, 0.1]), ease: 'lin' });
  keys.push({ at: C1, pose: struck(4.5, 0), ease: 'lin' });
  keys.push({ at: C1 + 0.06, pose: struck(5.2, 0.5), ease: 'out' });
  // (cocked again, and the second, another step in)
  keys.push({ at: C2 - 0.12, pose: cocked(5.0), ease: 'io' });
  keys.push({ at: C2 - 2 / 30, pose: driving(6.5), ease: 'in' });
  keys.push({ at: C2 - 1 / 30, pose: elbowsTo({ ...driving(8.4), pitch: 12, bend: 5, rhx: 9, rhz: 8, wAz: 10, wEl: 40 }, [0.2, 0.8, -0.6], [0.3, -0.8, 0.1]), ease: 'lin' });
  keys.push({ at: C2, pose: struck(9.8, 0.3), ease: 'lin' });
  keys.push({ at: C2 + 0.06, pose: struck(10.6, 1), ease: 'out' });
  // (and the third, the hardest, lunging in after it)
  keys.push({ at: C3 - 0.17, pose: cocked(10.2), ease: 'io' });
  keys.push({ at: C3 - 0.12, pose: cocked(10.5), ease: 'io' });
  keys.push({ at: C3 - 2 / 30, pose: driving(12.4), ease: 'in' });
  keys.push({ at: C3 - 1 / 30, pose: elbowsTo({ ...driving(14.2), pitch: 14, bend: 7, pz: R.pz - 1.2, rhx: 9, rhz: 8, wAz: 10, wEl: 40 }, [0.2, 0.8, -0.6], [0.3, -0.8, 0.1]), ease: 'lin' });
  keys.push({ at: C3, pose: struck(15.6, 1.1), ease: 'lin' });
  keys.push({ at: C3 + 0.08, pose: { ...struck(16.2, 2.2), wEl: -8 }, ease: 'out' });
  keys.push({ at: CT_LASHES.draw[0], pose: { ...struck(15.5, 1.5), pitch: 10, rhx: 12, rhz: -10, wEl: -20 }, ease: 'io' });
  // (drawing the lash back, stepping back to where they stood)
  keys.push({ at: 2.6, pose: { px: 6, rhIn: 1, rhx: 7, rhy: -4, rhz: -18, wAz: -10, wEl: -30, lhIn: 1, lhx: 5, lhy: 5, lhz: -16 }, ease: 'io' });
  keys.push({ at: CT_LASHES.long, pose: {}, ease: 'io' });
  return { hit: LH, keys };
}
function carterLashesFeet(): (t: number) => P {
  return footwork(B, {
    L: { start: L0, moves: [{ t0: C1 - 0.14, t1: C1 - 0.02, to: plantBy(L0, 7, 0.4, 6), lift: 3 }, { t0: C3 - 0.14, t1: C3 - 0.02, to: plantBy(L0, 17, 0.4, 8), lift: 3.2 }, { t0: 2.6, t1: 2.9, to: L0, lift: 3 }] },
    R: { start: R0, moves: [{ t0: C2 - 0.14, t1: C2 - 0.02, to: plantBy(R0, 12, 0.2, -2), lift: 3 }, { t0: 2.35, t1: 2.65, to: R0, lift: 3 }] },
  });
}
/** The cracker glinting pink from the raising of the whip to the last crack. */
function lashesGlint(t: number): number {
  if (t < 0.1 || t > C3 + 0.05) return 0;
  return t < CT_LASHES.warn[0] ? (t - 0.1) / (CT_LASHES.warn[0] - 0.1) : 1;
}
/** Each crack's burst of pink sparks. */
const lashesCrack = (t: number): number => Math.max(...CT_LASHES.cracks.map((c) => (t < c - 0.02 || t > c + 0.2 ? 0 : 1 - (t - (c - 0.02)) / 0.22)));

// =============================================================================================
// STRUCK

function carterReel(): Motion {
  return {
    keys: [
      { at: 0, pose: {} },
      { at: 0.06, pose: { px: -2.6, pz: R.pz + 0.5, pitch: -3, bend: -4, faceUp: R.faceUp + 22, faceTilt: R.faceTilt + 8, lhx: 2, lhy: 6, lhz: -15, rhx: 3, rhz: -18, out: 0.1 }, ease: 'out' },
      { at: 0.18, pose: { px: -1.0, pitch: 5, bend: 6, faceUp: R.faceUp + 6 }, ease: 'io' },
      { at: 0.4, pose: {}, ease: 'io' },
    ],
  };
}

// =============================================================================================
// THEIR DEATH: OVER ONTO THEIR BACK

export const CT_DIES = { long: 2.6, hat: 0.14, drop: 0.36, sit: 1.05, down: 1.6 } as const;
/** The pose `body` let down until the lowest of it rests on the ground. */
function settled(body: P, clear = 0.6, feet: P = {}): P {
  const lowOf = (pz: number): number => {
    const s = solve(B, { ...R, ...body, ...feet, pz } as Posed);
    const c = carterSolids(s);
    let low = Infinity;
    for (const o of c.lumps) low = Math.min(low, o.c[2] - Math.hypot(o.h[0] * o.rot[0][2], o.h[1] * o.rot[1][2], o.h[2] * o.rot[2][2]));
    for (const l of c.limbs) if (/^(upper|neck)/.test(l.name)) low = Math.min(low, Math.min(l.a[2], l.b[2]) - l.r);
    low = Math.min(low, s.kneeL[2] - B.legR[1] * 1.3, s.kneeR[2] - B.legR[1] * 1.3);
    return low;
  };
  let lo = -80;
  let hi = 20;
  for (let i = 0; i < 40; i++) {
    const m = (lo + hi) / 2;
    if (lowOf(m) < clear) lo = m;
    else hi = m;
  }
  return { ...body, pz: hi };
}
/** Their feet at a moment of their death (as its footwork puts them). */
const feetAt = (t: number): P => carterDyingFeet()(t);
const SPRAWL_FEET = { L: plantBy(L0, 8, 5, 10), R: plantBy(R0, 4, -6, -14) };
const BACK_STEP = plantBy(R0, -9, -1, -6);
/** Sitting down hard, the knees up, the arms going back. */
const SIT: P = settled({ px: -14, yaw: -4, pitch: -24, roll: 2, twist: 0, bend: 6, side: 0, faceUp: 10, faceTurn: 6, faceTilt: 6, lk: 30, rk: -30, lhIn: 1, lhx: -10, lhy: 9, lhz: -12, rhIn: 1, rhx: -10, rhy: -9, rhz: -12, out: 1 }, 0.6, feetAt(CT_DIES.sit));
/** Going over onto the back. */
const OVER_BACK: P = settled({ ...SIT, pitch: -50, faceUp: 0, lhz: -6, rhz: -6, lhx: -6, rhx: -6 }, 1.4, feetAt(1.3));
/** Their arms laid on the ground where their body puts them as it lies: each hand `ahead` of its shoulder (toward their feet) and `out` to its side. */
function flung(body: P, ahead: number, out: number): P {
  const s = solve(B, { ...R, ...body, lhIn: 0, rhIn: 0 } as Posed);
  const Lh: V3 = [s.shoulderL[0] + ahead, s.shoulderL[1] + out, 2.8];
  const Rh: V3 = [s.shoulderR[0] + ahead * 0.6, s.shoulderR[1] - out, 2.8];
  const q = { ...R, ...body, lhIn: 2, lhx: Lh[0], lhy: Lh[1], lhz: Lh[2], rhIn: 2, rhx: Rh[0], rhy: Rh[1], rhz: Rh[2] } as Posed;
  const le = elbowFor(B, q, true, norm([0, 1, 0.2]));
  const re = elbowFor(B, { ...q, le } as Posed, false, norm([0, -1, 0.2]));
  return { ...body, lhIn: 2, lhx: Lh[0], lhy: Lh[1], lhz: Lh[2], rhIn: 2, rhx: Rh[0], rhy: Rh[1], rhz: Rh[2], le, re };
}
/** Flat on the back, the legs out before them, the arms flung out on the ground. */
const SUPINE: P = flung(settled({ px: -26, yaw: -6, pitch: -86, roll: 3, twist: 0, bend: -2, side: 0, faceUp: -20, faceTurn: 20, faceTilt: 10, lk: 10, rk: -14, lhIn: 1, lhx: 4, lhy: 18, lhz: 0, rhIn: 1, rhx: 2, rhy: -18, rhz: 0, out: 1 }, 0.6, feetAt(CT_DIES.long)), 6, 12);
function carterDying(): Motion {
  return {
    keys: [
      { at: 0, pose: {} },
      { at: 0.08, pose: { px: -2.6, pz: R.pz + 0.4, pitch: -6, bend: -8, faceUp: R.faceUp + 24, out: 0.15 }, ease: 'out' },
      { at: 0.36, pose: { px: -5, pz: R.pz - 0.5, pitch: -8, bend: -6, roll: -3, faceUp: 18, lhIn: 1, lhx: 2, lhy: 9, lhz: -12, rhIn: 1, rhx: 2, rhy: -9, rhz: -12, out: 0.5 }, ease: 'io' },
      { at: 0.62, pose: { px: -8, pz: R.pz - 6, pitch: -10, bend: 0, roll: 2, faceUp: 14, lk: 22, rk: -22, lhIn: 1, lhx: -2, lhy: 10, lhz: -12, rhIn: 1, rhx: -2, rhy: -10, rhz: -12, out: 0.85 }, ease: 'in' },
      { at: CT_DIES.sit, pose: SIT, ease: 'out' },
      { at: 1.3, pose: OVER_BACK, ease: 'in' },
      { at: CT_DIES.down, pose: SUPINE, ease: 'out' },
      { at: CT_DIES.long, pose: SUPINE, ease: 'io' },
    ],
  };
}
function carterDyingFeet(): (t: number) => P {
  return footwork(B, {
    L: { start: L0, moves: [{ t0: 1.62, t1: 2.0, to: SPRAWL_FEET.L, lift: 4 }] },
    R: { start: R0, moves: [{ t0: 0.2, t1: 0.42, to: BACK_STEP, lift: 2.6 }, { t0: 1.66, t1: 2.04, to: SPRAWL_FEET.R, lift: 4 }] },
  });
}

// =============================================================================================
// THEM, AS THE GAME HOLDS A MONSTER

const NAMES = { stand: 'The carters stand, watching', walk: 'The carters trudge', attack: 'The whip crack', lashes: "The driver's lash", reel: 'The carters are struck', dying: 'The carters go over' } as const;
function carterMob(): Mob {
  const paint = carterPainter({
    lash: (m: Moment, end: V3) => {
      const lag = lagOf(m, 1.5, 3.0);
      if (m.dying) return trailing(end, 0.3, lag);
      if (m.move === NAMES.attack) return whipLash(m.t, end);
      if (m.move === NAMES.lashes) return lashesLash(m.t, end);
      if (m.move === NAMES.reel) return trailing(end, m.t * 6, lag);
      return trailing(end, m.t, lag);
    },
    hat: (m) => !(m.dying && m.t >= CT_DIES.hat),
    whip: (m) => !(m.dying && m.t >= CT_DIES.drop),
    lantern: () => true,
    crack: (m) => (m.move === NAMES.attack ? whipCrack(m.t) : m.move === NAMES.lashes ? lashesCrack(m.t) : 0),
  });
  const mv = (name: string, motion: Motion, more: Partial<MobMove> = {}): MobMove => ({ name, motion, rest: R, ...more });
  return {
    id: 'carter',
    name: 'A carter of the Silent Order',
    size: "medium: a little over the knight's height, broad",
    build: B,
    stand: mv(NAMES.stand, carterStand()),
    attack: mv(NAMES.attack, carterWhip(), { feet: carterWhipFeet(), glint: whipGlint }),
    idleFrames: 32,
    idleFps: 10,
    walk: mv(NAMES.walk, carterWalk(), { period: CT_WALK.frames / CT_WALK.fps, ground: CT_PACE * TILE3 }),
    walkFrames: CT_WALK.frames,
    walkFps: CT_WALK.fps,
    pace: CT_PACE,
    // (their second blow, the bigger: the game names it 'lashes')
    more: {
      lashes: mv(NAMES.lashes, carterLashes(), { feet: carterLashesFeet(), glint: lashesGlint, blurAt: LH }),
    },
    reel: mv(NAMES.reel, carterReel(), { glint: (t) => (t < 0.3 ? 1 - t / 0.3 : 0) }),
    reelTime: 0.4,
    hit: H,
    warn: CT_WHIP.warn[1] - CT_WHIP.warn[0],
    dieTime: CT_DIES.long,
    dying: mv(NAMES.dying, carterDying(), { feet: carterDyingFeet() }),
    aura: { x: CARTER_CANVAS.ax, y: CARTER_CANVAS.ay - 40, r: 36, color: '#9890b4', a: 0.06 },
    shadow: 12,
    canvas: CARTER_CANVAS,
    trueBack: true,
    bits: paint.bits,
    grains: paint.grains,
    // (the hat knocked off behind them; the whip dropped to their right, where it lies)
    fall(piece) {
      if (piece === 'hat') return { from: CT_DIES.hat, to: [14, 46], spin: 120, lay: 'keep', hop: 2.4, rise: 8 };
      if (piece === 'whip') return { from: CT_DIES.drop, to: [36, -40], spin: 20, lay: 'keep', hop: 0.8 };
      return null;
    },
  };
}
export const CARTER = carterMob();
export function makeCarterArt3(mob: Mob = CARTER, pace = mob.pace): ActorArt {
  return { front: mobSet(mob, 'front', pace), back: mobSet(mob, 'back', pace) };
}

// =============================================================================================
// THEM AS THE CHECKS SEE THEM (art/boss_checks.ts)

export function carterSolids(s: Skeleton): { limbs: CheckLimb[]; lumps: CheckLump[] } {
  const [rH, rK, rA] = B.legR;
  const [r0, r1] = B.armR;
  const limbs: CheckLimb[] = [];
  for (const side of ['L', 'R'] as const) {
    const L = side === 'L';
    limbs.push(
      { name: `leg${side}`, a: L ? s.hipL : s.hipR, b: L ? s.kneeL : s.kneeR, r: rH * 1.1 },
      { name: `shin${side}`, a: L ? s.kneeL : s.kneeR, b: L ? s.ankleL : s.ankleR, r: Math.max(rK, rA) * 1.16 },
      { name: `foot${side}`, a: add(L ? s.heelL : s.heelR, [0, 0, 1.8]), b: add(L ? s.toeL : s.toeR, [0, 0, 1.8]), r: 2.1 },
      { name: `upper${side}`, a: L ? s.shoulderL : s.shoulderR, b: L ? s.elbowL : s.elbowR, r: r0 * 1.2 },
      { name: `fore${side}`, a: L ? s.elbowL : s.elbowR, b: L ? s.handL : s.handR, r: r1 * 1.16 },
    );
  }
  limbs.push({ name: 'neck', a: s.neck, b: lerp3(s.neck, s.head, 0.5), r: 3.0 });
  const waistC = add(s.pelvis, mul(s.hips[2], B.waist * 0.6));
  const lumps: CheckLump[] = [
    { name: 'head', c: s.head, rot: s.face, h: [B.headR[0] * 1.3, B.headR[1] * 1.3, B.headR[2] * 1.2] },
    { name: 'chest', c: lerp3(s.ribs, s.neck, 0.3), rot: s.chest, h: [B.ribDeep + 2.2, B.ribHalf + 2.4, len3(sub(s.neck, s.ribs)) * 0.55] },
    { name: 'belly', c: lerp3(waistC, s.ribs, 0.45), rot: s.belly, h: [B.waistDeep + 2.0, B.waistHalf + 2.0, Math.max(3, len3(sub(s.ribs, waistC)) * 0.6)] },
    { name: 'hips', c: add(s.pelvis, mul(s.hips[2], B.waist * 0.2)), rot: s.hips, h: [B.pelvisDeep + 2.4, B.pelvisHalf + 2.6, B.waist * 0.75] },
  ];
  return { limbs, lumps };
}
/** The whip as the checks see it: its stock (held), and its lash as it lies at that moment of that move. */
function whipThings(move: string, t: number, s: Skeleton): CheckThing[] {
  const k = stockOf(s);
  const m = { dying: move === 'dying', move: (NAMES as Record<string, string>)[move], t, come: [0, 0, 0] as V3 } as unknown as Moment;
  const lash = lashFrom(k.end, move === 'attack' ? whipLash(t, k.end) : move === 'lashes' ? lashesLash(t, k.end) : trailing(k.end, move === 'reel' ? t * 6 : t, lagOf(m, 1.5, 3.0)));
  return [
    { name: 'whip stock', pts: [k.butt, lerp3(k.butt, k.end, 0.5), k.end], r: 0.8, may: ['foreR'] },
    { name: 'whip lash', pts: lash.slice(2), r: 0.5, may: [] },
  ];
}
export const CT_SHAPE: BossShape = {
  body: carterSolids,
  // (what they strike with: the lash's end, the cracker, while the whip is theirs)
  tip: (move, t, s) => {
    if (move === 'dying' && t >= CT_DIES.drop) return null;
    const k = stockOf(s);
    if (move !== 'attack' && move !== 'lashes') return null;
    const lash = lashFrom(k.end, move === 'lashes' ? lashesLash(t, k.end) : whipLash(t, k.end));
    return lash[lash.length - 1];
  },
  things: (move, t, s) => (move === 'dying' && t >= CT_DIES.drop ? [] : whipThings(move, t, s)),
};
