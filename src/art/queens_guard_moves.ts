// FLOOR 18'S QUEEN'S GUARD, THE MIRROR DUELLISTS: THEIR MOVES (the art chat, 30 Oct 2026). A MOCK-UP: NOT IN THE GAME,
// behind QGUARD_ON (art/queens_guard.ts, off). Their look and his pick as offered are art/queens_guard.ts; what their blows
// leave on the floor, art/queens_guard_fx.ts.
//
// HIS PICK, 30 Oct: “Mirror duellists (Recommended)”: "Move: they don't charge. They step into a mirror and step out of
// another beside you (the Queen's trick, smaller). Attacks: a fast double slash with the glass blades; a thrown fan of glass
// shards (ranged). Death: they shatter like a mirror." And his rulebook's Movement 9 (24 Oct: “Like the wind up and wind
// down are big but the actual punch is lightning quick”; for the enemies, 28 Oct: “Start from now on, but every enemy is
// going to need that change eventually.  And bigger AOE to compensate for the extra time the player gets to evade”): each
// blow winds up big and is held (the warning), strikes in two frames smeared with its after-images, and winds down big.
//
// THEIR MOVES:
//   STANDING: the duellist's guard, a glass blade in each hand, the blades crossed low before them, their points near the
//     floor; breathing, the weight shifting, the helm turning slowly, the Hush seeping out under it.
//   THE GLIDE (`walk`): long, smooth, level steps (`QG_GLIDE` tiles a second), each foot set down toe first, hardly a bob;
//     the blades kept crossed low, the cape streaming.
//   THE MIRROR STEP (two moves, the game's to put between): INTO THE GLASS (`stepIn`): a mirror-ripple opens out of the
//     air at their left; they gather, and in two frames are gone into it, smeared; it ripples hard and closes, throwing
//     off glints. OUT OF THE GLASS (`stepOut`, wherever the game puts them, beside you): a ripple opens, something stirs
//     in it, and in two frames they are out of it in a crouch, smeared; it closes behind them and they rise on guard.
//   THE DOUBLE SLASH (`attack`): both blades drawn back high over the shoulders, a step in, held there shaking, the glass
//     glinting pink (THE WARNING); then hips first, in two frames, the right blade slashed down across from high right to
//     low left, and at once, in two frames more, the left from high left to low right: an X of glass light before them,
//     two tiles out (art/queens_guard_fx.ts marks it on the floor); held crossed, then back on guard.
//   THE SHARD FAN (`more.fan`): the blades crossed high before the helm, five shards of glass gathering at the cross, held
//     there shaking, glinting pink (THE WARNING); then hips first, in two frames, the blades flung apart and the shards
//     thrown out in a fan sixty degrees wide, each flying eight tiles, smeared (art/queens_guard_fx.ts); held, then back.
//   STRUCK: jolted back, the helm snapped back, the blades flung out, the Hush coughed out.
//   THEIR DEATH (his pick: they shatter like a mirror): jolted rigid; cracks race over every plate of them; the head goes
//     back and the Hush leaves them in one grey breath, the pink going out behind the helm; then they shatter into
//     mirror shards that fall, lie glinting on the floor, and fade. Nothing gory.
//
// By his rulebook: every move through every check the bosses have (art/boss_checks.ts), from in front and behind, and the
// lightning strikes as his Movement 9 asks.
//   test: tsx --test tests/queens_guard.test.ts

import type { ActorArt } from './actor_types';
import type { BossShape, CheckLimb, CheckLump, CheckThing, Handover } from './boss_checks';
import { footwork, plantBy, plantOf } from './bosses3';
import type { Plant } from './bosses3';
import { hash } from './kit';
import { TILE3, mobSet } from './new_mobs3';
import type { Mob, MobMove, Moment } from './new_mobs3';
import { QG_BLADE, QG_BODY, QG_CANVAS, QG_RIPPLE, QG_XLIGHT, bladeGrip, bladeL, bladeR, breastAxes, qguardPainter } from './queens_guard';
import type { QGShard, QGuardSay, Ripple } from './queens_guard';
import { about, add, cross, heading, lerp3, mul, norm, solve, standing, sub } from './skeleton';
import type { Bones, Key3, Motion, Posed, Skeleton, V3 } from './skeleton';

type P = Partial<Bones>;
const B = QG_BODY;
const FPS = 30;
const FR = 1 / FPS;
const D = Math.PI / 180;
const clamp01 = (v: number): number => Math.max(0, Math.min(1, v));
const smooth = (a: number, b: number, t: number): number => {
  const u = clamp01((t - a) / (b - a));
  return u * u * (3 - 2 * u);
};
const len3 = (v: V3): number => Math.hypot(v[0], v[1], v[2]);

// =============================================================================================
// A VALUE THROUGH KEYS: smooth through each (a monotone cubic: it does not overshoot, and stops only where it turns back or holds)

type Track = (t: number) => number;
function track(keys: ReadonlyArray<readonly [number, number]>): Track {
  const n = keys.length;
  const ts = keys.map((k) => k[0]);
  const vs = keys.map((k) => k[1]);
  const d: number[] = [];
  for (let i = 0; i < n - 1; i++) d.push((vs[i + 1] - vs[i]) / (ts[i + 1] - ts[i]));
  const m: number[] = [];
  for (let i = 0; i < n; i++) {
    if (i === 0 || i === n - 1 || d[i - 1] * d[i] <= 0) m.push(0);
    else {
      const w1 = 2 * (ts[i + 1] - ts[i]) + (ts[i] - ts[i - 1]);
      const w2 = ts[i + 1] - ts[i] + 2 * (ts[i] - ts[i - 1]);
      m.push((w1 + w2) / (w1 / d[i - 1] + w2 / d[i]));
    }
  }
  return (t: number) => {
    if (t <= ts[0]) return vs[0];
    if (t >= ts[n - 1]) return vs[n - 1];
    let i = 0;
    while (i < n - 2 && t > ts[i + 1]) i++;
    const h = ts[i + 1] - ts[i];
    const u = (t - ts[i]) / h;
    const h00 = 2 * u ** 3 - 3 * u ** 2 + 1;
    const h10 = u ** 3 - 2 * u ** 2 + u;
    const h01 = -2 * u ** 3 + 3 * u ** 2;
    const h11 = u ** 3 - u ** 2;
    return h00 * vs[i] + h10 * h * m[i] + h01 * vs[i + 1] + h11 * h * m[i + 1];
  };
}

// =============================================================================================
// A POSE AS THEIR MOVES ARE WRITTEN: the bones, and the two blades said plainly
//   hx, hy, hz: the right fist (forward of the pelvis, to its left, up from the floor); bAz, bEl: the way its blade points;
//     bRoll: its edges turned about it from standing in the plane it would cut straight down in;
//   gx, gy, gz: the left fist, the same; cAz, cEl: the way its blade points.

interface Blades {
  hx: number;
  hy: number;
  hz: number;
  bAz: number;
  bEl: number;
  bRoll: number;
  gx: number;
  gy: number;
  gz: number;
  cAz: number;
  cEl: number;
}
type K = P & Partial<Blades>;
const BLADE_KEYS = ['hx', 'hy', 'hz', 'bAz', 'bEl', 'bRoll', 'gx', 'gy', 'gz', 'cAz', 'cEl'] as const;

/** The way a blade's edges stand: square to it, in the plane it would cut straight down in, turned `roll` about it. */
function edgeWay(way: V3, az: number, el: number, roll: number): V3 {
  const perp: V3 = [Math.sin(el * D) * Math.cos(az * D), Math.sin(el * D) * Math.sin(az * D), -Math.cos(el * D)];
  return about(perp, way, roll);
}
/** A written pose as the bones' own fields: both fists where they are, the right blade as the bones' weapon, the left as their pointing thing. */
function bonesOf(k: K & Bones): Bones {
  const out: Record<string, number> = {};
  for (const [f, v] of Object.entries(k)) if (!(BLADE_KEYS as readonly string[]).includes(f)) out[f] = v as number;
  const way = heading(k.bAz as number, k.bEl as number);
  const hand: V3 = [(k.hx as number) + k.px, (k.hy as number) + k.py, k.hz as number];
  Object.assign(out, bladeGrip(hand, way, edgeWay(way, k.bAz as number, k.bEl as number, k.bRoll as number)));
  Object.assign(out, { lhIn: 2, lhx: (k.gx as number) + k.px, lhy: (k.gy as number) + k.py, lhz: k.gz as number, pAz: k.cAz as number, pEl: k.cEl as number });
  return out as unknown as Bones;
}

// =============================================================================================
// THEIR REST: THE DUELLIST'S GUARD, the blades crossed low

const BASE = {
  ...standing(B),
  pz: -1.2, pitch: 4, bend: 3, roll: 0, side: 0, yaw: -4, twist: 2, faceUp: 2, faceTilt: 0, faceTurn: 0,
  lfx: 4.5, lfy: 0.8, lft: 8, lk: 7, lfp: 0, rfx: -4.0, rfy: -1.0, rft: -14, rk: -9, rfp: 0,
  le: 14, re: 14, pt: 0, out: 0,
} as Bones;
const G0: Blades = { hx: 12, hy: -9.5, hz: 40, bAz: 38, bEl: -40, bRoll: 0, gx: 12.5, gy: 9.5, gz: 39, cAz: -40, cEl: -42 };
export const QG_REST_K: K & Bones = { ...BASE, ...G0 } as K & Bones;
export const QG_REST: Bones = bonesOf(QG_REST_K);
const R = QG_REST_K;
const L0: Plant = plantOf(B, 'L', {}, QG_REST);
const R0: Plant = plantOf(B, 'R', {}, QG_REST);

// =============================================================================================
// A MOVE THROUGH WRITTEN KEYS: every field through its keys smoothly, but straight through a lightning strike (bowed out
// at its middle by `bow`, so that what is swung goes round, not through them); one key a frame, at the frames the game shows

interface Plan {
  long: number;
  keys: ReadonlyArray<readonly [number, K]>;
  /** The strike: from the last frame of its wind-up to the frame it lands on. */
  strike?: readonly [number, number];
  bow?: K;
  hit?: number;
  fps?: number;
  loop?: boolean;
}
function poseFn(plan: Plan): (t: number) => K & Bones {
  const full = plan.keys.map(([t, p]) => [t, { ...R, ...p } as Record<string, number>] as const);
  const fields = Object.keys(full[0][1]).filter((k) => k !== 'lhIn' && k !== 'rhIn' && typeof full[0][1][k] === 'number');
  const tracks = new Map(fields.map((k) => [k, track(full.map(([t, p]) => [t, p[k]] as const))]));
  const st = plan.strike;
  const at = (t: number): Record<string, number> | undefined => full.find(([kt]) => Math.abs(kt - t) < 1e-6)?.[1];
  const a0 = st ? at(st[0]) : undefined;
  const a1 = st ? at(st[1]) : undefined;
  if (st && (!a0 || !a1)) throw new Error('a strike must begin and end on keys');
  const bow = (plan.bow ?? {}) as Record<string, number>;
  return (t) => {
    const out: Record<string, number> = { lhIn: full[0][1].lhIn, rhIn: full[0][1].rhIn };
    if (st && a0 && a1 && t > st[0] && t < st[1]) {
      const k = (t - st[0]) / (st[1] - st[0]);
      for (const f of fields) out[f] = a0[f] + (a1[f] - a0[f]) * k + (bow[f] ?? 0) * Math.sin(Math.PI * k);
    } else for (const f of fields) out[f] = (tracks.get(f) as Track)(t);
    return out as unknown as K & Bones;
  };
}
function motionOf(plan: Plan): Motion {
  const f = poseFn(plan);
  const fps = plan.fps ?? FPS;
  const keys: Key3[] = [];
  const n = Math.round(plan.long * fps);
  for (let i = 0; i <= n; i++) {
    const t = i / fps;
    keys.push({ at: t, pose: bonesOf(f(t)), ease: 'lin' });
  }
  const m: Motion = { keys };
  if (plan.hit !== undefined) m.hit = plan.hit;
  if (plan.loop) m.loop = 0;
  return m;
}

// =============================================================================================
// STANDING: on guard, breathing, the helm turning slowly

export const QG_STAND = { frames: 32, fps: 10 } as const;
function standPlan(): Plan {
  const T = QG_STAND.frames / QG_STAND.fps;
  const keys: [number, K][] = [];
  for (let i = 0; i <= 32; i++) {
    const t = (i / 32) * T;
    const a = (t / T) * Math.PI * 2;
    const breath = Math.sin(a * 2 - 0.5);
    keys.push([t, {
      pz: R.pz + 0.8 * breath,
      py: 0.9 * Math.sin(a),
      roll: 1.4 * Math.sin(a),
      bend: R.bend - 1.8 * breath,
      pitch: R.pitch + 0.7 * Math.sin(a + 1.2),
      faceUp: R.faceUp + 2 * Math.sin(a + 0.4),
      faceTilt: 2 * Math.sin(a + 2.0),
      faceTurn: 8 * Math.sin(a + 0.8),
      hz: (R.hz as number) + 0.6 * breath,
      gz: (R.gz as number) + 0.6 * breath,
      hx: (R.hx as number) + 0.4 * Math.sin(a + 0.4),
      gx: (R.gx as number) + 0.4 * Math.sin(a + 0.9),
      bAz: (R.bAz as number) + 2 * Math.sin(a + 0.4),
      cAz: (R.cAz as number) - 2 * Math.sin(a + 0.9),
    }]);
  }
  return { long: T, keys, fps: QG_STAND.fps, loop: true };
}

// =============================================================================================
// THE GLIDE: a loop, painted for its pace, its feet gripping the floor

/** The glide: 20 frames at 20 a second (1 s round). */
export const QG_WALK = { frames: 20, fps: 20 } as const;
/** THE GLIDE, tiles a second: smooth and level, two long steps to the round (the knight walks 2.5). */
export const QG_GLIDE = 1.2;
/** A FOOT THROUGH THE GLIDE at `phase` (0 as it comes down): down, it goes straight back under them at the floor's pace; lifted, it comes low and forward, toe pointed, and is set down toe first. */
function glideFoot(phase: number): [number, number, number] {
  const down = 0.54;
  const T = QG_WALK.frames / QG_WALK.fps;
  const S = QG_GLIDE * TILE3 * down * T;
  const p = phase - Math.floor(phase);
  if (p <= down) return [S / 2 - (S * p) / down, 0, 0];
  const u = (p - down) / (1 - down);
  const e = u * u * (3 - 2 * u);
  const x = -S / 2 + S * e;
  const z = 3.2 * Math.pow(Math.sin(Math.PI * u), 0.8);
  const tip = 16 * Math.sin(Math.PI * Math.min(1, u * 1.2)) * (1 - u);
  return [x, z, tip];
}
function glidePlan(): Plan {
  const n = QG_WALK.frames;
  const keys: [number, K][] = [];
  for (let i = 0; i <= n; i++) {
    const t = i / QG_WALK.fps;
    const ph = i / n;
    const [lx, lz, lp] = glideFoot(ph);
    const [rx, rz, rp] = glideFoot(ph + 0.5);
    const a = ph * Math.PI * 2;
    const sink = Math.cos(a * 2 - 0.4);
    keys.push([t, {
      pz: R.pz - 2.0 + 0.5 * sink, py: 0.9 * Math.sin(a + 0.4), roll: 1.4 * Math.sin(a + 0.4), yaw: R.yaw + 1.6 * Math.cos(a), twist: R.twist - 1.0 * Math.cos(a), side: 0.5 * Math.sin(a),
      pitch: 5, bend: 3, faceUp: 3, faceTilt: 1.5 * Math.sin(a), faceTurn: -2 * Math.cos(a),
      lfx: 1.2 + lx, lfz: lz, lfp: lp, lfy: 1.2, lft: 4,
      rfx: -0.8 + rx, rfz: rz, rfp: rp, rfy: -1.2, rft: -6,
      lk: 6, rk: -6,
      hz: (R.hz as number) + 0.5 * sink, gz: (R.gz as number) + 0.5 * sink, hx: (R.hx as number) + 0.6 * Math.sin(a), gx: (R.gx as number) - 0.6 * Math.sin(a),
    }]);
  }
  return { long: n / QG_WALK.fps, keys, fps: QG_WALK.fps, loop: true };
}

// =============================================================================================
// THE MIRROR STEP (his pick: “They step into a mirror and step out of another beside you (the Queen's trick, smaller)”):
// into the glass at their left in two frames, and out of another in two frames; the game puts them where they come out

/** How far through the glass they go (their own lengths, to their left): through it, and out of sight behind it. */
export const QG_THROUGH = 54;
/** INTO THE GLASS: the ripple opening, the strike (two frames: gone), the ripple closing. */
export const QG_STEP_IN = { long: 0.6, open: [0, 0.2] as const, strike: [10 / FPS, 12 / FPS] as const, close: [0.42, 0.6] as const } as const;
/** OUT OF THE GLASS: the ripple opening, the strike (two frames: out of it), the ripple closing behind them. */
export const QG_STEP_OUT = { long: 0.6, open: [0, 0.18] as const, strike: [8 / FPS, 10 / FPS] as const, close: [0.36, 0.56] as const } as const;
function stepInPlan(): Plan {
  const [s0, s1] = QG_STEP_IN.strike;
  const gather: K = { pz: R.pz - 3.6, py: -1.8, roll: 4, bend: 6, pitch: 6, faceTurn: 34, faceUp: 4, hx: 11, hz: 41, gx: 11.5, gz: 40 };
  return {
    long: QG_STEP_IN.long,
    strike: QG_STEP_IN.strike,
    keys: [
      [0, {}],
      [0.16, { ...gather, pz: R.pz - 2.4, py: -1.2, roll: 2.6, faceTurn: 26 }],
      [s0, gather],
      [s1, { py: QG_THROUGH - 4, pz: R.pz - 3, roll: -6, bend: 4, pitch: 5, faceTurn: 14 }],
      [0.5, { py: QG_THROUGH - 0.6, pz: R.pz - 1.2, roll: -1 }],
      [QG_STEP_IN.long, { py: QG_THROUGH }],
    ],
  };
}
function stepInFeet(): (t: number) => P {
  const [s0, s1] = QG_STEP_IN.strike;
  return footwork(B, {
    L: { start: L0, moves: [{ t0: s0, t1: s1, to: plantBy(L0, 0, QG_THROUGH + 0.6), lift: 6 }] },
    R: { start: R0, moves: [{ t0: s0, t1: s1, to: plantBy(R0, 0, QG_THROUGH - 0.6), lift: 5 }] },
  });
}
function stepOutPlan(): Plan {
  const [s0, s1] = QG_STEP_OUT.strike;
  const gather: K = { py: QG_THROUGH + 1, pz: R.pz - 3.6, roll: -4, bend: 6, pitch: 6, faceTurn: -10, faceUp: 4 };
  return {
    long: QG_STEP_OUT.long,
    strike: QG_STEP_OUT.strike,
    keys: [
      [0, { py: QG_THROUGH }],
      [0.16, { ...gather, py: QG_THROUGH + 0.6, pz: R.pz - 2.4, roll: -2.6 }],
      [s0, gather],
      [s1, { py: 4.5, pz: R.pz - 5, roll: 6, bend: 8, pitch: 7, faceTurn: 6, faceUp: 6, hx: 14, hy: -6, hz: 40, gx: 14, gy: 6, gz: 39 }],
      [0.45, { py: 1.2, pz: R.pz - 2.4, roll: 1.4, bend: 4, pitch: 5, faceTurn: 2 }],
      [QG_STEP_OUT.long, {}],
    ],
  };
}
function stepOutFeet(): (t: number) => P {
  const [s0, s1] = QG_STEP_OUT.strike;
  return footwork(B, {
    L: { start: plantBy(L0, 0, QG_THROUGH), moves: [{ t0: s0, t1: s1, to: plantBy(L0, 0, 4.4), lift: 6 }, { t0: 0.4, t1: 0.54, to: L0, lift: 2.4 }] },
    R: { start: plantBy(R0, 0, QG_THROUGH), moves: [{ t0: s0, t1: s1, to: plantBy(R0, 0, 3.4), lift: 5 }, { t0: 0.44, t1: 0.58, to: R0, lift: 2.2 }] },
  });
}
/** Whether they are through the glass, and not here (none of them painted): from the middle of the step in, and until they are out. */
export function awayAt(move: string, t: number): boolean {
  if (move === 'stepIn') return t > QG_STEP_IN.strike[0] + 1e-6;
  if (move === 'stepOut') return t < QG_STEP_OUT.strike[1] - 1e-6;
  return false;
}
/** THE MIRROR-RIPPLE through each step: opening out of the air, rippling as they go into it or come out of it, closing. */
export function rippleOf(move: string, t: number): Ripple | null {
  const base = { x: 0, y: QG_RIPPLE.y, half: QG_RIPPLE.half, tall: QG_RIPPLE.tall };
  if (move === 'stepIn') {
    const S = QG_STEP_IN;
    const open = smooth(S.open[0], S.open[1], t) * (1 - smooth(S.close[0], S.close[1], t));
    return open > 0.01 ? { ...base, open, ripples: [[0, 44, t - 0.12], [0, 44, t - S.strike[0]], [0, 40, t - S.strike[1]], [0, 40, t - S.strike[1] - 0.1]] } : null;
  }
  if (move === 'stepOut') {
    const S = QG_STEP_OUT;
    const open = smooth(S.open[0], S.open[1], t) * (1 - smooth(S.close[0], S.close[1], t));
    return open > 0.01 ? { ...base, open, ripples: [[0, 44, t - 0.1], [0, 44, t - 0.2], [0, 40, t - S.strike[1] + FR], [0, 40, t - S.strike[1] - 0.1]] } : null;
  }
  return null;
}

// =============================================================================================
// THE DOUBLE SLASH (their first blow): both blades drawn back high, held; two slashes of two frames each, an X

/**
 * Its times (seconds): the warning held; the first slash (the strike: from the last frame of its wind-up to the frame it
 * lands on), the second at once after it (two frames more); its reach (tiles: the X of glass light from `from` to `reach`
 * before them, `wide` across, art/queens_guard_fx.ts).
 */
export const QG_SLASH = { long: 1.7, warn: [0.48, 0.9] as const, strike: [27 / FPS, 29 / FPS] as const, hit: 29 / FPS, second: [30 / FPS, 32 / FPS] as const, from: 0.4, reach: 2.0, wide: 1.8 };
/** Drawn back: both blades high over the shoulders and back, the body leaning back and coiled to its right, a step in. */
const S_DRAWN: K = { px: 1.4, pz: R.pz - 1.8, yaw: -14, twist: -10, pitch: -3, bend: -6, roll: 0, side: 0, faceUp: 8, faceTurn: 10, hx: -3, hy: -13.5, hz: 66, bAz: -150, bEl: 34, bRoll: 0, gx: -2, gy: 13, gz: 64.5, cAz: 150, cEl: 32 };
const shakeS = (k: number): K => ({ ...S_DRAWN, hz: (S_DRAWN.hz as number) + (k % 2 ? 0.5 : -0.25), gz: (S_DRAWN.gz as number) + (k % 2 ? -0.3 : 0.4), bEl: (S_DRAWN.bEl as number) + (k % 2 ? 0.8 : -0.4), cEl: (S_DRAWN.cEl as number) + (k % 2 ? -0.5 : 0.7), pz: (S_DRAWN.pz as number) - 0.12 * (k % 2) });
/** Hips first: the hips already round, the chest and the blades still back. */
const S_HIPS: K = { ...S_DRAWN, yaw: 0, twist: -24, px: 2.8, bend: -7 };
/** The first slash landed: the right blade down across to low left, lunged in; the left still high. */
const S_ONE: K = { px: 8, pz: R.pz - 5, yaw: 10, twist: 12, pitch: 11, bend: 7, roll: 0, side: 0, faceUp: 2, faceTurn: -6, hx: 17, hy: 6, hz: 39, bAz: 40, bEl: -42, bRoll: 0, gx: -1.5, gy: 13.5, gz: 63.5, cAz: 150, cEl: 31 };
const S_ONE2: K = { ...S_ONE, px: 8.5, hx: 17.6, hy: 6.8, hz: 38.6, bAz: 42, bEl: -43, gx: -1, gz: 63.5 };
/** The second slash, through its middle (over the top before the helm), and landed: the left blade down across to low right; an X. */
const S_MID2: K = { ...S_ONE2, px: 9, pz: R.pz - 5.3, twist: 8, hx: 17.9, hy: 7.2, hz: 38.3, bAz: 43, bEl: -43.6, gx: 13, gy: 6, gz: 58, cAz: 30, cEl: 72 };
const S_TWO: K = { ...S_ONE2, px: 9.4, pz: R.pz - 5.6, yaw: 9, twist: 4, pitch: 12, bend: 8, faceTurn: 0, hx: 18.2, hy: 7.6, hz: 38, bAz: 44, bEl: -44, gx: 17, gy: -6, gz: 41, cAz: -40, cEl: -40 };
const S_ON: K = { ...S_TWO, px: 9.8, hx: 18.6, hy: 8.2, hz: 37.6, bAz: 46, bEl: -45.5, gx: 17.6, gy: -6.6, gz: 40.4, cAz: -43, cEl: -41.5 };
function slashPlan(): Plan {
  const [w0, w1] = QG_SLASH.warn;
  const [s0, s1] = QG_SLASH.strike;
  return {
    long: QG_SLASH.long,
    strike: QG_SLASH.strike,
    hit: QG_SLASH.hit,
    // (the right fist swung out round the body at the slash's middle, not through it)
    bow: { hx: 9, hz: 5, hy: -3 },
    keys: [
      [0, {}],
      [0.24, { px: -0.4, pz: R.pz - 0.8, yaw: -8, twist: -4, pitch: 1, bend: -1, faceUp: 4, faceTurn: 4, hx: 6, hy: -13, hz: 52, bAz: -50, bEl: 18, gx: 6, gy: 12.5, gz: 51, cAz: 52, cEl: 16 }],
      [w0, S_DRAWN],
      [0.6, shakeS(1)],
      [0.7, shakeS(2)],
      [0.8, shakeS(3)],
      [w1 - 0.02, S_DRAWN],
      [s0, S_HIPS],
      [s1, S_ONE],
      [QG_SLASH.second[0], S_ONE2],
      [QG_SLASH.second[0] + FR, S_MID2],
      [QG_SLASH.second[1], S_TWO],
      [1.16, S_ON],
      [1.36, { ...S_ON, pz: R.pz - 4.8, pitch: 10, bend: 7 }],
      [1.54, { px: 4, pz: R.pz - 2.4, yaw: 2, twist: 2, pitch: 6, bend: 4, faceUp: 2, faceTurn: 0, hx: 15, hy: -1, hz: 40, bAz: 32, bEl: -45, gx: 15, gy: 1, gz: 39.5, cAz: -32, cEl: -46 }],
      [QG_SLASH.long, {}],
    ],
  };
}
function slashFeet(): (t: number) => P {
  const [s0, s1] = QG_SLASH.strike;
  return footwork(B, {
    L: { start: L0, moves: [{ t0: 0.22, t1: 0.44, to: plantBy(L0, 4, 0.4, 2), lift: 3 }, { t0: s0, t1: s1 + FR, to: plantBy(L0, 13, 0.4, 0), lift: 4 }, { t0: 1.4, t1: 1.62, to: L0, lift: 2.6 }] },
    R: { start: R0, moves: [{ t0: 1.0, t1: 1.12, to: plantBy(R0, 5, 0.2, 4), lift: 2 }, { t0: 1.46, t1: 1.66, to: R0, lift: 2.4 }] },
  });
}

// =============================================================================================
// THE SHARD FAN (their second blow): the blades crossed high, five shards gathering at the cross, held; flung apart in two
// frames, the shards thrown out in a fan

/**
 * Its times; the shards: how many, the fan's width (degrees), how far each flies (tiles), how fast (tiles a second), how far
 * before them they are as it lands (tiles), and how high they fly (their own lengths).
 */
export const QG_FAN = { long: 1.75, warn: [0.36, 0.8] as const, strike: [24 / FPS, 26 / FPS] as const, hit: 26 / FPS, count: 5, spread: 60, range: 8, speed: 16, from: 0.9, z: 44, form: [0.14, 0.5] as const };
/** Crossed high: the wrists crossed before the chest, the right blade up to the left, the left up to the right; leaning back. */
const F_CROSS: K = { px: -1, pz: R.pz - 2, yaw: 0, twist: 0, pitch: -3, bend: -6, roll: 0, side: 0, faceUp: 6, faceTurn: 0, hx: 14.5, hy: 3.2, hz: 56, bAz: 112, bEl: 50, bRoll: 90, gx: 11.5, gy: -3.2, gz: 57, cAz: -112, cEl: 50 };
const shakeF = (k: number): K => ({ ...F_CROSS, hz: (F_CROSS.hz as number) + (k % 2 ? 0.45 : -0.2), gz: (F_CROSS.gz as number) + (k % 2 ? -0.25 : 0.4), pz: (F_CROSS.pz as number) - 0.15 * (k % 2), bEl: (F_CROSS.bEl as number) + (k % 2 ? 0.7 : -0.3) });
const F_HIPS: K = { ...F_CROSS, pitch: 5, bend: -13, px: 0.4 };
/** Flung apart: both arms swept out wide before them, the blades level, out to either side. */
const F_FLUNG: K = { px: 4, pz: R.pz - 3, yaw: 0, twist: 0, pitch: 7, bend: 6, roll: 0, side: 0, faceUp: 0, faceTurn: 0, hx: 15, hy: -15, hz: 50, bAz: -48, bEl: -3, bRoll: 0, gx: 15, gy: 15, gz: 50, cAz: 48, cEl: -3 };
const F_ON: K = { ...F_FLUNG, px: 4.6, hx: 15.2, hy: -16.5, gy: 16.5, bAz: -56, cAz: 56, bEl: -6, cEl: -6 };
function fanPlan(): Plan {
  const [w0, w1] = QG_FAN.warn;
  const [s0, s1] = QG_FAN.strike;
  return {
    long: QG_FAN.long,
    strike: QG_FAN.strike,
    hit: QG_FAN.hit,
    keys: [
      [0, {}],
      [0.16, { px: -0.4, pz: R.pz - 1, pitch: 1, bend: -2, faceUp: 4, hx: 14, hy: -3, hz: 48, bAz: 96, bEl: 30, bRoll: 60, gx: 11.5, gy: 3, gz: 48, cAz: -40, cEl: 25 }],
      [w0, F_CROSS],
      [0.46, shakeF(1)],
      [0.57, shakeF(2)],
      [0.68, shakeF(3)],
      [w1 - 0.04, F_CROSS],
      [s0, F_HIPS],
      [s1, F_FLUNG],
      [0.97, F_ON],
      [1.25, { ...F_ON, pz: R.pz - 2.6, pitch: 6, bend: 5 }],
      [1.5, { px: 2, pz: R.pz - 1.6, pitch: 5, bend: 4, faceUp: 2, hx: 14, hy: -8, hz: 42, bAz: 0, bEl: -40, gx: 14, gy: 8, gz: 41, cAz: 0, cEl: -42 }],
      [QG_FAN.long, {}],
    ],
  };
}
function fanFeet(): (t: number) => P {
  return footwork(B, {
    L: { start: L0, moves: [{ t0: 0.86, t1: 0.98, to: plantBy(L0, 4, 0, 0), lift: 2.4 }, { t0: 1.46, t1: 1.66, to: L0, lift: 2.4 }] },
    R: { start: R0, moves: [{ t0: 0.08, t1: 0.28, to: plantBy(R0, -3, -0.6, -6), lift: 2.6 }, { t0: 1.42, t1: 1.62, to: R0, lift: 2.4 }] },
  });
}
/** The shards' ways out (degrees to their left of straight before them): five, sixty degrees from one side to the other. */
export const QG_FAN_WAYS: readonly number[] = Array.from({ length: QG_FAN.count }, (_, i) => -QG_FAN.spread / 2 + (QG_FAN.spread * i) / (QG_FAN.count - 1));
/** Where a shard of the fan is `t` seconds after it lands (their own lengths, from their place): out along its way, a sliver pointing the way it flies. */
export function fanShardAt(i: number, t: number): V3 {
  const a = QG_FAN_WAYS[i] * D;
  const d = (QG_FAN.from + QG_FAN.speed * Math.max(0, t)) * TILE3;
  return [Math.cos(a) * d, Math.sin(a) * d, QG_FAN.z];
}
/** How long a shard of the fan flies (seconds): its eight tiles at its pace. */
export const QG_FAN_FLIGHT = (QG_FAN.range - QG_FAN.from) / QG_FAN.speed;

// =============================================================================================
// STRUCK

export const QG_REEL = 0.4;
function reelPlan(): Plan {
  return {
    long: QG_REEL,
    keys: [
      [0, {}],
      [0.07, { px: -2.6, pz: R.pz + 0.4, pitch: -5, bend: -7, faceUp: R.faceUp + 18, faceTilt: 8, hx: 11, hy: -7, hz: 42, bAz: 10, bEl: -30, gx: 11.5, gy: 7, gz: 41, cAz: -12, cEl: -32, out: 0.1 }],
      [0.2, { px: -1.1, pitch: 2, bend: 3, faceUp: R.faceUp + 4 }],
      [QG_REEL, {}],
    ],
  };
}

// =============================================================================================
// THEIR DEATH (his pick: they shatter like a mirror)

/** Its times (seconds): jolted rigid; the cracks racing over them; the Hush leaving (art/queens_guard.ts QG_EXHALE); the shatter; the shards fading from the floor. */
export const QG_DIES = { long: 2.8, crack: [0.06, 0.66] as const, shatter: 1.5, flash: [1.3, 1.5] as const, gone: [2.2, 2.75] as const };
function diesPlan(): Plan {
  const rigid: K = { px: -2.2, pz: R.pz + 0.2, pitch: -4, bend: -5, faceUp: R.faceUp + 10, faceTilt: 4, hx: 11, hy: -8, hz: 42, bAz: 8, bEl: -32, gx: 11.5, gy: 8, gz: 41.5, cAz: -10, cEl: -33 };
  return {
    long: QG_DIES.long,
    keys: [
      [0, {}],
      [0.1, { ...rigid, px: -2.6, pitch: -5.5, bend: -7, faceUp: R.faceUp + 16, out: 0.05 }],
      [0.34, { ...rigid, out: 0.15 }],
      // the head back, the Hush pouring out of them in a grey breath, the pink going out
      [0.62, { ...rigid, faceUp: R.faceUp + 28, bend: -8, pitch: -5, out: 0.7 }],
      [1.2, { ...rigid, faceUp: R.faceUp + 24, bend: -7.5, pitch: -4.6, out: 1 }],
      [QG_DIES.shatter, { ...rigid, faceUp: R.faceUp + 23, bend: -7.4, pitch: -4.5, out: 1 }],
      [QG_DIES.long, { ...rigid, faceUp: R.faceUp + 23, bend: -7.4, pitch: -4.5, out: 1 }],
    ],
  };
}

// =============================================================================================
// THE SMEARS, THE SHARDS, THE GLINTS

export const QG_NAMES = {
  stand: 'The queen’s guard on guard',
  walk: 'The queen’s guard glide',
  attack: 'The double slash',
  reel: 'The queen’s guard are struck',
  dying: 'Cracks race over them; the Hush leaves them; they shatter like a mirror',
  stepIn: 'Into the glass',
  stepOut: 'Out of the glass',
  fan: 'The shard fan',
} as const;
const byName: Record<string, string> = Object.fromEntries(Object.entries(QG_NAMES).map(([k, v]) => [v, k]));
/** The strikes, by move: from the last frame of the wind-up to the frame it lands on (the double slash's second follows at once: QG_SLASH.second). */
export const QG_STRIKES: Readonly<Record<string, readonly [number, number]>> = { attack: QG_SLASH.strike, fan: QG_FAN.strike, stepIn: QG_STEP_IN.strike, stepOut: QG_STEP_OUT.strike };
/** Whether a frame of a move shows a strike's smear: from the frame after its wind-up ends to the frame after it lands (thinning then); and the double slash's second slash the same. */
export function smearedAt(move: string, t: number): boolean {
  const s = QG_STRIKES[move];
  const inside = (w: readonly [number, number]): boolean => t > w[0] + 1e-6 && t <= w[1] + FR + 1e-6;
  return !!s && (inside(s) || (move === 'attack' && inside(QG_SLASH.second)));
}
const PLANS: Record<string, Plan> = { attack: slashPlan(), fan: fanPlan(), stepIn: stepInPlan(), stepOut: stepOutPlan(), reel: reelPlan(), dying: diesPlan() };
const POSES: Record<string, (t: number) => K & Bones> = Object.fromEntries(Object.entries(PLANS).map(([k, p]) => [k, poseFn(p)]));
const FEET: Record<string, (t: number) => P> = { attack: slashFeet(), fan: fanFeet(), stepIn: stepInFeet(), stepOut: stepOutFeet() };
/** Their bones at a moment of one of their moves (with its footwork). */
function skelOf(move: string, t: number): Skeleton {
  const k = POSES[move](Math.max(0, Math.min(PLANS[move].long, t)));
  return solve(B, { ...bonesOf(k), ...(FEET[move]?.(t) ?? {}) } as Posed);
}
function posedOf(move: string, t: number): Posed {
  return { ...bonesOf(POSES[move](Math.max(0, Math.min(PLANS[move].long, t)))), ...(FEET[move]?.(t) ?? {}) } as Posed;
}
/** The outline of them, crown to foot, for the streaks through the glass. */
function outline(s: Skeleton): V3[] {
  return [add(s.head, [0, 0, 6]), s.head, s.shoulderL, s.shoulderR, s.elbowL, s.elbowR, s.handL, s.handR, s.ribs, s.pelvis, s.kneeL, s.kneeR, s.ankleL, s.ankleR, add(s.pelvis, [-6, 0, -14]), add(s.pelvis, [-6, 0, -28])];
}
/** THE SMEAR: after-images of what strikes, along the way it has come since its wind-up ended. */
function smearOf(move: string, t: number): V3[][] | null {
  if (!smearedAt(move, t)) return null;
  const S = QG_STRIKES[move];
  const second = move === 'attack' && t > QG_SLASH.second[0] + 1e-6;
  const [s0, s1] = second ? QG_SLASH.second : S;
  const to = Math.min(t, s1);
  const out: V3[][] = [];
  if (move === 'attack' || move === 'fan') {
    // (the blades' after-images through their sweep, a fan of them; and the arcs their points and middles swept)
    const n = 8;
    const which = move === 'fan' ? ['R', 'L'] : second ? ['L'] : ['R'];
    for (const side of which) {
      const arcs: V3[][] = [[], [], []];
      for (let i = 0; i <= n; i++) {
        const u = s0 - FR * 0.5 + ((to - (s0 - FR * 0.5)) * i) / n;
        const s = skelOf(move, u);
        const b = side === 'R' ? bladeR(s) : bladeL(s, posedOf(move, u));
        if (i % 3 === 0) out.push([b.at(QG_BLADE.long * 0.35), b.tip]);
        arcs[0].push(b.tip);
        arcs[1].push(b.at(QG_BLADE.long * 0.7));
        arcs[2].push(b.at(QG_BLADE.long * 0.4));
      }
      out.unshift(arcs[2]);
      out.push(arcs[1], arcs[0]);
    }
    if (move === 'fan') {
      // (and the shards' streaks as they are thrown)
      for (let i = 0; i < QG_FAN.count; i++) out.push([fanShard(i, s0).c, fanShard(i, (s0 + to) / 2).c, fanShard(i, to).c]);
    }
  } else {
    // (through the glass: a streak from every point of their outline along the way they have gone)
    const steps = 8;
    const at = Array.from({ length: steps + 1 }, (_, i) => outline(skelOf(move, s0 + ((to - s0) * i) / steps)));
    for (let j = 0; j < at[0].length; j++) out.push(at.map((p) => p[j]));
  }
  return t > s1 + 1e-6 ? out.slice(Math.floor(out.length / 2)) : out;
}
/** A shard of the fan at a moment of the move: gathering at the crossed blades, held there, thrown (in the strike) out to where the flight begins. */
function fanShard(i: number, t: number): QGShard {
  const a = QG_FAN_WAYS[i] * D;
  const way: V3 = [Math.cos(a), Math.sin(a), 0];
  const side: V3 = [-Math.sin(a), Math.cos(a), 0];
  const [s0, s1] = QG_FAN.strike;
  const held = (u: number): V3 => {
    const s = skelOf('fan', u);
    const x = add(lerp3(s.handL, s.handR, 0.5), [2.5, 0, 9]);
    return add(x, add(mul(way, 7 + 1.5 * Math.abs(i - 2)), [0, 0, (2 - Math.abs(i - 2)) * 2.2]));
  };
  const c = t <= s0 ? held(t) : lerp3(held(s0), fanShardAt(i, 0), clamp01((t - s0) / (s1 - s0)));
  const come = clamp01((t - QG_FAN.form[0] - 0.06 * i) / 0.14);
  const L = 5 * come;
  return { c, u: mul(way, Math.max(0.3, L)), v: mul(side, 1.6 * Math.max(0.3, come)), glass: true, lit: hash(i, Math.floor(t * 12), 8401) < 0.3 ? 1 : 0 };
}
/** THE MIRROR SHARDS as they shatter: born all over them, flung out, tumbling as they fall, lying glinting on the floor, fading one by one. */
const SHARD_N = 64;
const SHATTER = ((): { p0: V3; v: V3; spin: number; long: number; wide: number; fade: number }[] => {
  const s = skelOf('dying', QG_DIES.shatter);
  const q = posedOf('dying', QG_DIES.shatter);
  const on: V3[] = [];
  const along = (a: V3, b: V3, n: number): void => {
    for (let i = 0; i < n; i++) on.push(lerp3(a, b, (i + 0.5) / n));
  };
  along(s.head, add(s.head, [0, 0, 5]), 4);
  along(s.neck, s.pelvis, 12);
  for (const [a, b] of [[s.shoulderL, s.elbowL], [s.elbowL, s.handL], [s.shoulderR, s.elbowR], [s.elbowR, s.handR], [s.hipL, s.kneeL], [s.kneeL, s.ankleL], [s.hipR, s.kneeR], [s.kneeR, s.ankleR]] as const) along(a, b, 4);
  const bR = bladeR(s);
  const bL = bladeL(s, q);
  along(bR.guard, bR.tip, 6);
  along(bL.guard, bL.tip, 6);
  const mid = s.ribs;
  return Array.from({ length: SHARD_N }, (_, i) => {
    const p0 = on[i % on.length];
    const out = norm([p0[0] - mid[0] + (hash(i, 1, 8501) - 0.5) * 6, p0[1] - mid[1] + (hash(i, 2, 8501) - 0.5) * 6, 0], [1, 0, 0]);
    const sp = 18 + 40 * hash(i, 3, 8501);
    return { p0, v: add(mul(out, sp), [0, 0, 5 + 20 * hash(i, 4, 8501)]), spin: (hash(i, 5, 8501) - 0.5) * 30, long: 1.6 + 1.6 * hash(i, 6, 8501), wide: 0.7 + 0.5 * hash(i, 7, 8501), fade: QG_DIES.gone[0] + (QG_DIES.gone[1] - QG_DIES.gone[0]) * hash(i, 8, 8501) };
  });
})();
/** The shards as they shatter, `t` seconds into the death. */
function shatterShards(t: number): QGShard[] {
  const tau = t - QG_DIES.shatter;
  if (tau < 0) return [];
  const out: QGShard[] = [];
  const G = 400;
  const LOW = 3.6;
  SHATTER.forEach((sh, i) => {
    if (t >= sh.fade) return;
    // (falling: where it comes down to LOW it lies flat on the floor)
    const vz = sh.v[2];
    const land = (vz + Math.sqrt(vz * vz + 2 * G * Math.max(0.1, sh.p0[2] - LOW))) / G;
    const tt = Math.min(tau, land);
    const c: V3 = [sh.p0[0] + sh.v[0] * tt, sh.p0[1] + sh.v[1] * tt, Math.max(LOW, sh.p0[2] + vz * tt - (G / 2) * tt * tt)];
    const a = sh.spin * tt + i;
    if (tau < land) {
      const u = norm([Math.cos(a), Math.sin(a * 0.7), Math.sin(a * 1.3)], [1, 0, 0]);
      const v = norm(cross(u, norm([Math.sin(a), Math.cos(a), 0.5], [0, 0, 1])), [0, 1, 0]);
      out.push({ c, u: mul(u, sh.long), v: mul(v, sh.wide), glass: false, lit: hash(i, Math.floor(t * 15), 8502) < 0.25 ? 1 : 0 });
    } else {
      const b = a * 0.3;
      out.push({ c: [c[0], c[1], 0.4], u: [Math.cos(b) * sh.long, Math.sin(b) * sh.long, 0], v: [-Math.sin(b) * sh.wide, Math.cos(b) * sh.wide, 0], glass: false, lit: (Math.floor(t * 8) + i) % 9 === 0 ? 1 : 0 });
    }
  });
  return out;
}
/** How far the cracks have raced over them as they die. */
function crackOf(m: Moment): number {
  return m.dying ? smooth(QG_DIES.crack[0], QG_DIES.crack[1], m.t) : 0;
}
/** WHAT IS LAID AFTER THEIR EDGE: the X of glass light the double slash leaves in the air; glints thrown off the ripple as it closes; the cracks blazing before the shatter, and its burst of light. */
function moreOf(move: string, m: Moment): [V3, string, number][] {
  const out: [V3, string, number][] = [];
  const t = m.t;
  if (move === 'attack' && t > QG_SLASH.second[1] + FR - 1e-6 && t < QG_SLASH.second[1] + 0.36) {
    // THE X OF GLASS LIGHT: both slashes' arcs, hanging in the air before them, thinning away
    const k = (t - QG_SLASH.second[1]) / 0.36;
    for (const [w, side] of [[QG_SLASH.strike, 'R'], [QG_SLASH.second, 'L']] as const) {
      for (let i = 0; i <= 24; i++) {
        const u = w[0] + ((w[1] - w[0]) * i) / 24;
        const s = skelOf('attack', u);
        const b = side === 'R' ? bladeR(s) : bladeL(s, posedOf('attack', u));
        for (const along of [0.62, 0.82, 1]) {
          if (hash(i, Math.round(along * 10), 8601 + Math.floor(t * 30)) < k * 1.1) continue;
          out.push([b.at(QG_BLADE.long * along), along === 1 ? QG_XLIGHT[0] : along > 0.7 ? QG_XLIGHT[1] : QG_XLIGHT[2], k < 0.3 && along === 1 ? 2 : 1]);
        }
      }
    }
  }
  for (const [mv, S] of [['stepIn', QG_STEP_IN], ['stepOut', QG_STEP_OUT]] as const) {
    if (move !== mv || t < S.close[0] + 0.06 || t > S.close[1] + 0.06) continue;
    // GLINTS thrown off the ripple's rim as it closes
    const k = (t - S.close[0] - 0.06) / (S.close[1] - S.close[0]);
    const Hh = QG_RIPPLE.tall / 2;
    for (let i = 0; i < 18; i++) {
      const a = (i / 18) * Math.PI * 2 + hash(i, 1, 8701);
      const r = 1 + 0.5 * k * (0.6 + 0.8 * hash(i, 2, 8701));
      if (hash(i, 3, 8701) < k * 0.8) continue;
      out.push([[Math.cos(a) * QG_RIPPLE.half * r * (1 - 0.6 * k), QG_RIPPLE.y - 2, QG_RIPPLE.foot + Hh + Math.sin(a) * Hh * r * (1 - 0.5 * k)], i % 3 ? '#cfcaf2' : '#ffffff', k < 0.4 ? 2 : 1]);
    }
  }
  if (move === 'dying' && t >= QG_DIES.flash[0] && t < QG_DIES.shatter + 0.12) {
    // the cracks blazing white just before they burst; and the burst
    const s = m.s;
    const k = t < QG_DIES.shatter ? (t - QG_DIES.flash[0]) / (QG_DIES.flash[1] - QG_DIES.flash[0]) : 1;
    for (let i = 0; i < 40; i++) {
      if (hash(i, Math.floor(t * 30), 8801) > 0.35 + 0.5 * k) continue;
      const p = lerp3(s.head, s.pelvis, hash(i, 1, 8801));
      out.push([add(p, [(hash(i, 2, 8801) - 0.5) * 12, (hash(i, 3, 8801) - 0.5) * 12, (hash(i, 4, 8801) - 0.5) * 30]), t < QG_DIES.shatter ? '#f1eefc' : '#ffffff', t >= QG_DIES.shatter ? 2 : 1]);
    }
  }
  return out;
}
const SAY: QGuardSay = {
  away: (m) => awayAt(byName[m.move ?? ''] ?? '', m.t),
  ripple: (m) => rippleOf(byName[m.move ?? ''] ?? '', m.t),
  cracked: crackOf,
  shattered: (m) => !!m.dying && m.t >= QG_DIES.shatter,
  shards: (m) => {
    const mv = byName[m.move ?? ''] ?? '';
    if (m.dying) return shatterShards(m.t);
    if (mv === 'fan' && m.t >= QG_FAN.form[0] && m.t < QG_FAN.hit - 1e-6) return Array.from({ length: QG_FAN.count }, (_, i) => fanShard(i, m.t)).filter((s) => len3(s.u) > 0.35);
    return [];
  },
  smear: (m) => smearOf(byName[m.move ?? ''] ?? '', m.t),
  more: (m) => moreOf(m.dying ? 'dying' : byName[m.move ?? ''] ?? '', m),
};

// =============================================================================================
// THEM, AS THE GAME HOLDS A MONSTER

function qguardMob(): Mob {
  const paint = qguardPainter(SAY);
  const mv = (name: string, motion: Motion, more: Partial<MobMove> = {}): MobMove => ({ name, motion, rest: QG_REST, ...more });
  const glow = (warn: readonly [number, number]) => (t: number): number => (t >= warn[0] - 0.12 && t <= warn[1] ? (t < warn[0] ? (t - warn[0] + 0.12) / 0.12 : 1) : 0);
  return {
    id: 'queens-guard',
    name: 'A Hushed queen’s guard',
    size: 'medium: a head and a half taller than the knight, the tallest and thinnest guard of Act 2',
    build: B,
    stand: mv(QG_NAMES.stand, motionOf(standPlan())),
    attack: mv(QG_NAMES.attack, motionOf(PLANS.attack), { feet: FEET.attack, glint: glow(QG_SLASH.warn) }),
    more: {
      stepIn: mv(QG_NAMES.stepIn, motionOf(PLANS.stepIn), { feet: FEET.stepIn }),
      stepOut: mv(QG_NAMES.stepOut, motionOf(PLANS.stepOut), { feet: FEET.stepOut }),
      fan: mv(QG_NAMES.fan, motionOf(PLANS.fan), { feet: FEET.fan, glint: glow(QG_FAN.warn) }),
    },
    idleFrames: QG_STAND.frames,
    idleFps: QG_STAND.fps,
    walk: mv(QG_NAMES.walk, motionOf(glidePlan()), { period: QG_WALK.frames / QG_WALK.fps, ground: QG_GLIDE * TILE3 }),
    walkFrames: QG_WALK.frames,
    walkFps: QG_WALK.fps,
    pace: QG_GLIDE,
    reel: mv(QG_NAMES.reel, motionOf(PLANS.reel)),
    reelTime: QG_REEL,
    hit: QG_SLASH.hit,
    warn: QG_SLASH.warn[1] - QG_SLASH.warn[0],
    dieTime: QG_DIES.long,
    dying: mv(QG_NAMES.dying, motionOf(PLANS.dying)),
    aura: { x: QG_CANVAS.ax, y: QG_CANVAS.ay - 50, r: 40, color: '#9890b4', a: 0.06 },
    shadow: 11,
    canvas: QG_CANVAS,
    trueBack: true,
    bits: paint.bits,
    grains: paint.grains,
    fall: () => null,
  };
}
export const QUEENS_GUARD = qguardMob();
export function makeQGuardArt3(mob: Mob = QUEENS_GUARD): ActorArt {
  return { front: mobSet(mob, 'front', mob.pace), back: mobSet(mob, 'back', mob.pace) };
}

// =============================================================================================
// THEM AS THE CHECKS SEE THEM (art/boss_checks.ts)

export function qguardSolids(s: Skeleton): { limbs: CheckLimb[]; lumps: CheckLump[] } {
  const [rH, rK, rA] = B.legR;
  const [r0, r1] = B.armR;
  const limbs: CheckLimb[] = [];
  for (const side of ['L', 'R'] as const) {
    const L = side === 'L';
    limbs.push(
      { name: `leg${side}`, a: L ? s.hipL : s.hipR, b: L ? s.kneeL : s.kneeR, r: rH * 1.1 },
      { name: `shin${side}`, a: L ? s.kneeL : s.kneeR, b: L ? s.ankleL : s.ankleR, r: Math.max(rK, rA) * 1.2 },
      { name: `foot${side}`, a: add(L ? s.heelL : s.heelR, [0, 0, 1.6]), b: add(L ? s.toeL : s.toeR, [0, 0, 1.6]), r: 1.8 },
      { name: `upper${side}`, a: L ? s.shoulderL : s.shoulderR, b: L ? s.elbowL : s.elbowR, r: r0 * 1.16 },
      { name: `fore${side}`, a: L ? s.elbowL : s.elbowR, b: L ? s.handL : s.handR, r: r1 * 1.16 },
    );
  }
  limbs.push({ name: 'neck', a: s.neck, b: lerp3(s.neck, s.head, 0.5), r: 2.5 });
  const waistC = add(s.pelvis, mul(s.hips[2], B.waist * 0.5));
  const bp = breastAxes(s);
  const lumps: CheckLump[] = [
    { name: 'head', c: add(s.head, mul(s.face[2], 0.9)), rot: s.face, h: [B.headR[0] * 1.18, B.headR[1] * 1.26, B.headR[2] * 1.3] },
    { name: 'chest', c: lerp3(s.ribs, s.neck, 0.3), rot: s.chest, h: [B.ribDeep + 2.6, B.ribHalf + 2.2, len3(sub(s.neck, s.ribs)) * 0.55] },
    { name: 'breastplate', c: bp.c, rot: s.chest, h: [len3(bp.ax[0]), len3(bp.ax[1]), len3(bp.ax[2])] },
    { name: 'belly', c: lerp3(waistC, s.ribs, 0.45), rot: s.belly, h: [B.waistDeep + 2.6, B.waistHalf + 2.3, Math.max(3, len3(sub(s.ribs, waistC)) * 0.6)] },
    { name: 'hips', c: add(s.pelvis, mul(s.hips[2], B.waist * 0.2)), rot: s.hips, h: [B.pelvisDeep + 2.2, B.pelvisHalf + 2.2, B.waist * 0.75] },
  ];
  return { limbs, lumps };
}
function bladeThings(s: Skeleton, q: Posed): CheckThing[] {
  const out: CheckThing[] = [];
  for (const [name, b, may] of [['right blade', bladeR(s), ['foreR']], ['left blade', bladeL(s, q), ['foreL']]] as const) {
    const pts: V3[] = [];
    for (let k = 0; k <= QG_BLADE.long; k += 3) pts.push(b.at(k));
    out.push({ name, pts, r: 0.9, may });
  }
  return out;
}
export const QG_SHAPE: BossShape = {
  body: qguardSolids,
  tip: (move, t, s) => {
    if (move === 'dying' || move === 'stepIn' || move === 'stepOut') return null;
    return bladeR(s).tip;
  },
  things: (move, t, s, q) => (move === 'dying' && t >= QG_DIES.shatter ? [] : bladeThings(s, q)),
  strikes: QG_STRIKES,
  smeared: smearedAt,
  handovers: [
    // his stand into each move and back
    ...['attack', 'fan', 'reel'].flatMap((m): Handover[] => [{ from: 'stand', at: 0, to: m, toAt: 0 }, { from: m, at: 'end', to: 'stand', toAt: 0 }]),
    { from: 'stand', at: 0, to: 'dying', toAt: 0 },
    // into the glide and out of it at any step
    { from: 'stand', at: 0, to: 'walk', toAt: 0 },
    ...Array.from({ length: QG_WALK.frames + 1 }, (_, i): Handover => ({ from: 'walk', at: i / QG_WALK.fps, to: 'stand', toAt: 0 })),
    // THE MIRROR STEP: from the stand into the glass; out of it (wherever the game puts them); and back on guard
    { from: 'stand', at: 0, to: 'stepIn', toAt: 0 },
    { from: 'stepIn', at: 'end', to: 'stepOut', toAt: 0 },
    { from: 'stepOut', at: 'end', to: 'stand', toAt: 0 },
  ],
};
