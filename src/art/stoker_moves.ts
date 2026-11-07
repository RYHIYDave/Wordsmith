// FLOOR 3'S SIDE BOSS, THE STOKER: HIS MOVES (the art chat, 4 Nov 2026). A MOCK-UP: NOT IN THE GAME, behind STOKER_ON
// (art/stoker.ts, off). His look and his words are art/stoker.ts; what his fire does on the floor, art/stoker_fx.ts.
//
// His rules for every attack (his Movement 9, 24 Oct: “Like the wind up and wind down are big but the actual punch is lightning
// quick”; for the enemies, 28 Oct: “Start from now on, but every enemy is going to need that change eventually.  And bigger AOE
// to compensate for the extra time the player gets to evade”), his rulebook's Monsters 9, “Action, like a movie”, and his
// Animations 1 (“as big and wild and kinetic and weighty as possible.  I’d rather it be a notch too high than a notch too
// low.”); and “I’d rather have to pull back from a 10 then build up from a 1.”
//
// HIS MOVES:
//   HIS STAND: heavy on bent knees, breathing: his firebox's glow swelling and sinking with each breath, smoke puffed out of his
//     flue as he breathes out, sparks with it; his shovel's blade resting on the floor at his right, his left fist hanging.
//   HIS WALK (`ST_PACE` tiles a second): heavy, long strides, each foot stamped down (soot puffed up off the floor, and the floor
//     shaken: `ST_SHAKE` for the game's camera), his whole bulk dropping onto it; his shovel dragged at his right, its lip
//     scraping the floor and throwing sparks.
//   THE SHOVEL OF COALS (`attack`, `ST_COALS`): his fire-door flung open of itself; his fist run down the haft and THE SHOVEL
//     DRIVEN INTO HIS OWN FIREBOX, HELD, rocked, scooping (the coals white-hot, sparks gushing out); torn out heaped, the door
//     slammed; the shovel swung up and back over his right shoulder, his left arm flung out at you, HELD high (the coals blazing
//     over his head; WHERE THEY WILL COME DOWN marked on the floor); hips first; then in TWO FRAMES the shovel whipped over the top,
//     smeared, and THE COALS FLUNG, arcing out to come down where you stood, each a fire burning on the floor; carried on down to
//     the floor before him; and back to his stand.
//   THE FIRE RAKE (`rake`, `ST_RAKE`): turned away to his right, the shovel heaved up high over his right shoulder, HELD (the arc
//     marked on the floor before him); hips first; SLAMMED DOWN onto the floor at his right in TWO FRAMES, smeared; then dragged
//     round before him, his whole bulk turning, the blade scraping a SHEET OF FIRE up off the floor in a wide arc that burns on.
//   THE FURNACE BURSTS (`burst`, `ST_BURST`, his finisher when he is low on life): his arms flung wide, his chest thrown out, his
//     fire-door BURST OPEN of itself, the fire inside roaring white, HELD, shaking (a ring marked on the floor round him, its gaps
//     marked too); hips first; then in TWO FRAMES he hurls himself forward and down, smeared, and the fire belches out of him and
//     A RING OF FIRE ROLLS OUT over the floor round him; spent, heaving, his fire burnt low, smoke pouring out of him; the door
//     clanged shut; back to his stand.
//   STRUCK: jolted back, his door banged open a crack, sparks burst out of it.
//   HIS DEATH: struck, his fire flaring white, his door bursting open, rearing back, the shovel flung down; he sinks to his knees
//     and slumps, his fire going out, cooling to black iron and ash; THE GEAR clatters out of his open grate, bounces and lies on
//     the floor before him (the crank's missing gear: the game's to pick up).
//
// By his rulebook: every move through every check the bosses have (art/boss_checks.ts `checkBoss`), from in front and behind.
//   test: tsx --test tests/stoker.test.ts

import type { ActorArt } from './actor_types';
import { footwork, kneelHips, plantBy, plantOf } from './bosses3';
import type { Plant } from './bosses3';
import type { BossShape, CheckLimb, CheckLump, CheckThing } from './boss_checks';
import { DOOR, FLUE_R, GEAR, SHOVEL, ST_BODY, ST_CANVAS, ST_DEATH, ST_REST, bellyOf, domeOf, doorFrameOf, flueOf, helmOf, mouthOf, pauldronOf, shovelOf, stokerPainter } from './stoker';
import type { StokerSay } from './stoker';
import { TILE3, mobSet } from './new_mobs3';
import type { Mob, MobMove, Moment } from './new_mobs3';
import { add, elbowFor, heading, len, lerp3, mul, norm, solve, sub } from './skeleton';
import type { Bones, Key3, Motion, Posed, Skeleton, V3 } from './skeleton';

type P = Partial<Bones>;
const B = ST_BODY;
const R = ST_REST;
const FPS = 30;
const FR = 1 / FPS;
const TAU = Math.PI * 2;
const clamp01 = (v: number): number => Math.max(0, Math.min(1, v));
const smooth = (a: number, b: number, t: number): number => {
  const u = clamp01((t - a) / (b - a));
  return u * u * (3 - 2 * u);
};
const fr = (t: number): number => t - Math.floor(t);
/** A moment on the game's frames: frame `n`, at 30 a second. */
const f = (n: number): number => n / FPS;

// =============================================================================================
// A MOVE THROUGH KEY POSES: every number through its keys smoothly (slow at each turn, its speed carried through each key that is
// not one), but straight through a lightning strike; sampled on every frame the game shows. His left hand is worked out on every
// frame: hanging free from his shoulder, or on the shovel's haft, or between (so that it never leaps from the one to the other).

/** A monotone curve through keys: slow at each turn, its speed carried through each key that is not one. */
function track(keys: ReadonlyArray<readonly [number, number]>): (t: number) => number {
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

/** One key of a move: his body (over and above his rest), and his shovel and his hands. */
export interface StKey {
  body?: P;
  /** His right fist (on the floor's own axes from his floor point), the way the haft runs from it (`az`, `el` as `heading` has them), how far down the haft his fist holds it, the way the scoop faces. */
  grip?: V3;
  az?: number;
  el?: number;
  hold?: number;
  face?: V3;
  /** His left fist: hanging free (from his left shoulder, on the floor's axes), or `on` the haft (1) `al` down it from its top. */
  left?: V3;
  on?: number;
  al?: number;
  /** The ways his elbows go (each arm's own: forward, out to its side, up). */
  wl?: V3;
  wr?: V3;
}
const HANG_L: V3 = [-0.35, 0.9, -0.25];
const HANG_R: V3 = [-0.35, -0.9, -0.25];
/** His rest as a key: the shovel's blade on the floor at his right, its grip in his right fist at his hip; his left fist hanging. */
export const ST_KEY0: Required<StKey> = { body: {}, grip: [R.rhx, R.rhy, R.rhz], az: R.wAz, el: R.wEl, hold: SHOVEL.grip, face: [0, 0, 1], left: [-1.5, 7, -50], on: 0, al: 30, wl: HANG_L, wr: HANG_R };
/** The same direction of the haft said the other way round (az + 180, 180 - el): for a swing over the top, so that its numbers go on smoothly. */
const over = (az: number, el: number): [number, number] => [az + 180, 180 - el];
const REST_OVER = over(ST_KEY0.az, ST_KEY0.el);

interface Plan {
  long: number;
  keys: ReadonlyArray<readonly [number, StKey]>;
  /** The strike: from the last frame of its wind-up to the frame it lands on. */
  strike?: readonly [number, number];
  hit?: number;
}
/** The numbers a key is tracked by. */
const BODY_FIELDS = ['px', 'py', 'pz', 'yaw', 'pitch', 'roll', 'twist', 'bend', 'side', 'hunch', 'shrug', 'faceTurn', 'faceUp', 'faceTilt', 'lfx', 'lfy', 'lfz', 'lfp', 'lft', 'rfx', 'rfy', 'rfz', 'rfp', 'rft', 'lk', 'rk', 'lkUp', 'rkUp'] as const;
function numbersOf(k: StKey): Record<string, number> {
  const b = { ...R, ...(k.body ?? {}) } as unknown as Record<string, number>;
  const out: Record<string, number> = {};
  for (const n of BODY_FIELDS) out[n] = b[n] ?? 0;
  const g = k.grip ?? ST_KEY0.grip;
  const fc = norm(k.face ?? ST_KEY0.face);
  const lf = k.left ?? ST_KEY0.left;
  const wl = norm(k.wl ?? ST_KEY0.wl);
  const wr = norm(k.wr ?? ST_KEY0.wr);
  Object.assign(out, {
    gx: g[0], gy: g[1], gz: g[2], az: k.az ?? ST_KEY0.az, el: k.el ?? ST_KEY0.el, hold: k.hold ?? ST_KEY0.hold,
    fx: fc[0], fy: fc[1], fz: fc[2], lx: lf[0], ly: lf[1], lz: lf[2], on: k.on ?? 0, al: k.al ?? ST_KEY0.al,
    wlx: wl[0], wly: wl[1], wlz: wl[2], wrx: wr[0], wry: wr[1], wrz: wr[2],
  });
  return out;
}
/** A move's numbers at any moment: through its keys, straight through its strike. */
function numbersFn(plan: Plan): (t: number) => Record<string, number> {
  const full = plan.keys.map(([t, k]) => [t, numbersOf(k)] as const);
  const names = Object.keys(full[0][1]);
  const tracks = new Map(names.map((n) => [n, track(full.map(([t, v]) => [t, v[n]] as const))]));
  const st = plan.strike;
  const at = (t: number): Record<string, number> | undefined => full.find(([kt]) => Math.abs(kt - t) < 1e-6)?.[1];
  const a0 = st ? at(st[0]) : undefined;
  const a1 = st ? at(st[1]) : undefined;
  return (t) => {
    const out: Record<string, number> = {};
    const inStrike = !!(st && a0 && a1 && t > st[0] && t < st[1]);
    const k = inStrike && st ? (t - st[0]) / (st[1] - st[0]) : 0;
    for (const n of names) out[n] = inStrike && a0 && a1 ? a0[n] + (a1[n] - a0[n]) * k : (tracks.get(n) as (t: number) => number)(t);
    return out;
  };
}
/** The bones' pose from a move's numbers at a moment: his right fist and the haft; his left fist worked out where it is; his elbows. */
function poseOfNumbers(v: Record<string, number>): P {
  const body: Record<string, number> = {};
  for (const n of BODY_FIELDS) body[n] = v[n];
  const base = { ...R, ...body, rhIn: 2, rhx: v.gx, rhy: v.gy, rhz: v.gz, wAz: v.az, wEl: v.el, wRoll: 0 } as unknown as Posed;
  // (his left fist free from his shoulder, and on the haft, and between)
  const s0 = solve(B, { ...base, lhIn: 1, lhx: v.lx, lhy: v.ly, lhz: v.lz } as Posed);
  const free = s0.handL;
  const p = s0.point;
  const top = add(s0.handR, mul(p, -v.hold));
  const onIt = add(top, mul(p, v.al));
  const k = clamp01(v.on);
  const w = k * k * (3 - 2 * k);
  const lh = lerp3(free, onIt, w);
  const q = { ...base, lhIn: 2, lhx: lh[0], lhy: lh[1], lhz: lh[2] } as Posed;
  const le = elbowFor(B, q, true, norm([v.wlx, v.wly, v.wlz]));
  const re = elbowFor(B, { ...q, le } as Posed, false, norm([v.wrx, v.wry, v.wrz]));
  return { ...body, lhIn: 2, lhx: lh[0], lhy: lh[1], lhz: lh[2], rhIn: 2, rhx: v.gx, rhy: v.gy, rhz: v.gz, wAz: v.az, wEl: v.el, wRoll: 0, le, re } as P;
}
function motionOf(plan: Plan, loop = false, n = Math.round(plan.long * FPS), fps = FPS): { motion: Motion; numbers: (t: number) => Record<string, number> } {
  const nf = numbersFn(plan);
  const keys: Key3[] = [];
  for (let i = 0; i <= n; i++) keys.push({ at: i / fps, pose: poseOfNumbers(nf(i / fps)), ease: 'lin' });
  const motion: Motion = loop ? { keys, loop: 0 } : plan.hit !== undefined ? { keys, hit: plan.hit } : { keys };
  return { motion, numbers: nf };
}
/** A pose trembling: his fist and the haft shaken a little (a held wind-up). */
const shaken = (k: StKey, i: number, by = 1): StKey => ({
  ...k,
  grip: add(k.grip ?? ST_KEY0.grip, [0.35 * by * (i % 2 ? 1 : -1), 0.25 * by * (i % 2 ? -1 : 1), 0.6 * by * (i % 2 ? 1 : -1)]),
  el: (k.el ?? ST_KEY0.el) + 1.2 * by * (i % 2 ? 1 : -1),
  body: { ...(k.body ?? {}), pz: ((k.body?.pz as number | undefined) ?? R.pz) + 0.35 * by * (i % 2 ? 1 : -1) },
});

// =============================================================================================
// HIS FEET

const L0: Plant = plantOf(B, 'L', {}, R);
const R0: Plant = plantOf(B, 'R', {}, R);

// =============================================================================================
// HIS STAND: heavy, breathing

export const ST_STAND_LONG = 2.4;
export const ST_STAND = { frames: 24, fps: 10 } as const;
function standKey(t: number): StKey {
  const a = (t / ST_STAND_LONG) * TAU;
  const inh = Math.sin(a);
  return {
    body: {
      pz: R.pz + 1.5 * inh, py: 1.3 * Math.sin(a + 0.6), roll: 1.6 * Math.sin(a + 0.6), side: 1.2 * Math.sin(a + 0.6),
      pitch: R.pitch - 1.0 * inh, bend: R.bend - 1.8 * inh, hunch: (R.hunch ?? 0) - 3 * inh, shrug: (R.shrug ?? 0) + 0.12 * inh,
      faceTurn: 9 * Math.sin(a + 0.3), faceUp: R.faceUp + 3 * inh, faceTilt: 3 * Math.sin(a + 1.2),
    },
    grip: [R.rhx + 0.5 * Math.sin(a + 0.6), R.rhy + 0.4 * Math.sin(a + 0.6), R.rhz + 0.9 * inh],
    left: [ST_KEY0.left[0] + 1.6 * Math.sin(a + 0.9), ST_KEY0.left[1] + 0.8 * Math.sin(a + 1.4), ST_KEY0.left[2] + 1.2 * Math.sin(a + 0.9)],
  };
}
const standPlan = (): Plan => ({ long: ST_STAND_LONG, keys: Array.from({ length: 49 }, (_, i) => [(i / 48) * ST_STAND_LONG, standKey((i / 48) * ST_STAND_LONG)] as const) });

// =============================================================================================
// HIS WALK: heavy, long strides, each foot stamped down; the shovel dragged at his right

/** His walk, tiles a second (the knight walks 2.5 in the pictures; the game's hero runs 4.6). */
export const ST_PACE = 1.4;
export const ST_WALK = { frames: 12, fps: 10 } as const;
const WALK_LONG = ST_WALK.frames / ST_WALK.fps;
/** The game's camera shaken this far (game pixels) as each of his feet comes down, for a tenth of a second. */
export const ST_SHAKE = { by: 1, long: 0.1 } as const;
/** A foot of the walk at step `k` of `n`: down and carried back under him with the floor; then lifted, swung forward and stamped down. */
function stepFoot(k: number, n: number, step: number, lift: number): [number, number, number] {
  const half = n / 2;
  if (k <= half) return [step * (half / 2 - k), 0, 0];
  const u = (k - half) / half;
  const g = u * u * (3 - 2 * u);
  return [-step * (half / 2) + step * half * g, lift * Math.sin(Math.PI * u) ** 0.8, 14 * Math.sin(Math.PI * u) * (1 - u) - 6 * Math.sin(Math.PI * u) * u];
}
function walkKey(t: number): StKey {
  const n = ST_WALK.frames;
  const d = (ST_PACE * TILE3) / ST_WALK.fps;
  const k = (t / WALK_LONG) * n;
  const a = (t / WALK_LONG) * TAU;
  const [lx, lz, lp] = stepFoot(k % n, n, d, 9);
  const [rx, rz, rp] = stepFoot((k + n / 2) % n, n, d, 9);
  // (his bulk drops onto each foot as it comes down, and rises over it; rolled onto the foot that is down; turning with his steps)
  const drop = Math.cos(2 * a);
  return {
    body: {
      pz: R.pz - 0.4 - 2.4 * Math.max(0, drop) ** 2 + 1.0 * Math.max(0, -drop), py: 2.2 * Math.cos(a), roll: 3.2 * Math.cos(a), side: 1.6 * Math.cos(a),
      yaw: 5 * Math.sin(a), twist: -4 * Math.sin(a), pitch: R.pitch + 2.5 + 1.2 * drop, bend: R.bend + 1 + 1.5 * drop, hunch: (R.hunch ?? 0) + 1,
      faceTurn: -3 * Math.sin(a), faceUp: R.faceUp + 2 - 2 * drop, faceTilt: 2.5 * Math.cos(a),
      lfx: R.lfx + lx, lfz: lz, lfp: lp, rfx: R.rfx + rx, rfz: rz, rfp: rp,
    },
    // (the shovel dragged at his right, its lip scraping the floor)
    grip: [R.rhx + 1 + 1.5 * Math.sin(a), R.rhy, R.rhz + 1 + 1.0 * drop],
    az: R.wAz - 2 + 2.5 * Math.sin(a), el: R.wEl + 1.2 + 0.6 * drop,
    // (his left fist swung against his left foot)
    left: [ST_KEY0.left[0] + 9 * Math.sin(a + Math.PI), ST_KEY0.left[1] + 1, ST_KEY0.left[2] + 3 * Math.max(0, Math.sin(a + Math.PI))],
  };
}
const walkPlan = (): Plan => ({ long: WALK_LONG, keys: Array.from({ length: 49 }, (_, i) => [(i / 48) * WALK_LONG, walkKey((i / 48) * WALK_LONG)] as const) });

// =============================================================================================
// THE SHOVEL OF COALS (`attack`)

/**
 * Its times (seconds, on the game's frames): the door flung open (`open`); THE SHOVEL DRIVEN INTO HIS FIREBOX by `plunge`, HELD,
 * scooping, to `out`; the door slammed (`shut`); swung up and back over his shoulder by `warn[0]`, HELD to `warn[1]`, where the
 * coals will come down marked on the floor from `mark` (the fx's); hips first; THE STRIKE, two frames (`strike`), the coals
 * flung at `hit`; carried on down to the floor by `down`; at his stand again by `long`.
 */
export const ST_COALS = { long: 3.1, open: [0.1, 0.28] as const, plunge: 0.38, out: 0.86, shut: [0.92, 1.02] as const, warn: [1.32, f(51)] as const, mark: 1.0, strike: [f(53), f(55)] as const, hit: f(55), down: 2.15 } as const;
function coalsPlan(): Plan {
  const C = ST_COALS;
  const [s0, s1] = C.strike;
  const PLUNGE: StKey = {
    body: { pz: R.pz - 4, px: 1, pitch: 7, bend: 5, yaw: 8, twist: 6, hunch: 16, faceUp: -18, faceTurn: -10 },
    grip: [53, -21, 69], az: 139, el: -11, hold: 52, face: [0.15, 0.2, 1],
    left: [10, 15, 16], wl: [-0.3, 1, 0.2], wr: [-0.5, -0.8, 0.0],
  };
  const RAISED: StKey = {
    body: { pz: R.pz - 1.5, px: -3, pitch: -7, bend: -9, yaw: -16, twist: -14, side: 3, hunch: 6, faceUp: 10, faceTurn: 14, rfx: R.rfx - 2 },
    grip: [-3, -38, 124], az: 196, el: 8, hold: SHOVEL.grip, face: [-0.1, 0, 1],
    left: [44, 15, 2], wl: [-0.1, 0.6, -0.8], wr: [-0.3, -0.75, 0.6],
  };
  return {
    long: C.long,
    strike: C.strike,
    hit: C.hit,
    keys: [
      [0, {}],
      // the shovel swung round before him, his fist run down its haft
      [0.2, { body: { pz: R.pz - 3, pitch: 7, bend: 4, yaw: 6, twist: 6, hunch: 14, faceUp: -8 }, grip: [36, -36, 62], az: 70, el: -16, hold: 30, face: [0, 0, 1], left: [8, 14, -12], wl: [-0.3, 1, -0.1], wr: [-0.4, -0.9, -0.1] }],
      [0.3, { ...PLUNGE, grip: [49, -27, 70], az: 128, el: -10, hold: 46, left: [9, 15, 10] }],
      // DRIVEN INTO HIS FIREBOX, HELD, rocked
      [C.plunge, PLUNGE],
      [0.5, { ...PLUNGE, grip: [51, -22, 70.5], el: -9, body: { ...PLUNGE.body, pz: R.pz - 3.4 } }],
      [0.62, { ...PLUNGE, grip: [53.5, -20, 68.5], el: -12 }],
      [0.74, { ...PLUNGE, grip: [51.5, -22, 70.5], el: -9.5, body: { ...PLUNGE.body, pz: R.pz - 3.4 } }],
      // torn out heaped
      [C.out, { ...PLUNGE, body: { pz: R.pz - 2.6, px: 0, pitch: 2, bend: 1, yaw: 4, twist: 0, hunch: 12, faceUp: -2, faceTurn: 0 }, grip: [58, -31, 76], az: 146, el: -6, hold: 48, left: [12, 13, -6] }],
      // swung out to his right, up and back over his right shoulder, his fist run back to the grip
      [0.94, { body: { pz: R.pz - 2.3, px: 0.5, pitch: 1, bend: 0, yaw: 0, twist: -2, hunch: 11, faceUp: 2, faceTurn: 2 }, grip: [54, -40, 86], az: 156, el: 26, hold: 42, face: [0.4, 0, 1], left: [18, 14, -8], wl: [-0.2, 0.9, -0.4], wr: [-0.4, -0.9, -0.1] }],
      [1.0, { body: { pz: R.pz - 2, px: 0, pitch: 0, bend: -1, yaw: -4, twist: -4, hunch: 10, faceUp: 4, faceTurn: 4 }, grip: [45, -51, 90], az: 170, el: 24, hold: 34, face: [0, 0, 1], left: [22, 14, -10], wl: [-0.2, 0.9, -0.4], wr: [-0.3, -0.9, 0.1] }],
      [1.12, { body: { pz: R.pz - 1.5, px: -1.5, pitch: -4, bend: -5, yaw: -9, twist: -8, side: 1.5, hunch: 8, faceUp: 8, faceTurn: 8 }, grip: [24, -48, 108], az: 206, el: 6, hold: 16, face: [0, 0, 1], left: [30, 15, -14], wl: [-0.2, 0.8, -0.6], wr: [-0.4, -0.8, 0.3] }],
      [C.warn[0], RAISED],
      // HELD, trembling
      [1.42, shaken(RAISED, 1)],
      [1.52, shaken(RAISED, 2)],
      [1.62, shaken(RAISED, 3)],
      [C.warn[1], RAISED],
      // hips first: his hips turned on under him, his chest held back
      [s0, { ...RAISED, body: { ...RAISED.body, yaw: -5, pitch: -3, twist: -25, bend: -9, px: -1.5 }, grip: [-2, -37, 124], el: 11 }],
      // THE STRIKE: whipped over the top, the coals flung
      [s1, { body: { pz: R.pz - 4.5, px: 5, pitch: 9, bend: 14, yaw: 6, twist: 4, side: 0, hunch: 16, faceUp: 2, faceTurn: 0, rfx: R.rfx - 2 }, grip: [34, -33, 110], az: 190, el: 142, hold: SHOVEL.grip, face: [0.5, 0, 0.85], left: [-14, 17, -36], wl: [-0.5, 0.8, -0.2], wr: [-0.2, -0.8, 0.5] }],
      [2.0, { body: { pz: R.pz - 6, px: 7, pitch: 14, bend: 19, yaw: 7, twist: 5, hunch: 20, faceUp: -2, rfx: R.rfx - 2 }, grip: [44, -31, 92], az: 188, el: 176, face: [-0.1, 0, -1], left: [-8, 12, -44], wl: HANG_L, wr: [-0.3, -0.9, 0.1] }],
      [C.down, { body: { pz: R.pz - 6.5, px: 7, pitch: 15, bend: 21, yaw: 6, twist: 4, hunch: 22, faceUp: -5, rfx: R.rfx - 2 }, grip: [42, -32, 76], az: 186, el: 202, face: [-0.4, 0, -1], left: [-5, 9, -46] }],
      [2.5, { body: { pz: R.pz - 4.5, px: 4, pitch: 9, bend: 11, yaw: 2, twist: 1, hunch: 16, faceUp: -2 }, grip: [26, -34, 58], az: REST_OVER[0] + 8, el: REST_OVER[1] - 4, face: [0, -1, 0] }],
      [C.long, { grip: ST_KEY0.grip, az: REST_OVER[0], el: REST_OVER[1], face: [0, 0, 1] }],
    ],
  };
}
function coalsFeet(): (t: number) => P {
  const C = ST_COALS;
  return footwork(B, {
    L: { start: L0, moves: [{ t0: C.warn[1] - 0.14, t1: C.strike[1] - 0.01, to: plantBy(L0, 13, -1, -6), lift: 4.5 }, { t0: 2.55, t1: 2.95, to: L0, lift: 3.5 }] },
    R: { start: R0, moves: [{ t0: 0.98, t1: 1.24, to: plantBy(R0, -9, -2, -10), lift: 4 }, { t0: 2.4, t1: 2.75, to: R0, lift: 3.5 }] },
  });
}

// =============================================================================================
// THE FIRE RAKE (`rake`)

/**
 * Its times: turned to his right and the shovel heaved up over his right shoulder by `warn[0]`, HELD to `warn[1]` (the arc marked
 * on the floor from `mark`); hips first; THE STRIKE, two frames, slammed down on the floor at his right at `hit`; then DRAGGED round
 * before him to his left (`drag`), scraping a sheet of fire up off the floor; lifted, and back to his stand by `long`.
 */
export const ST_RAKE = { long: 3.0, warn: [0.42, f(27)] as const, mark: 0.3, strike: [f(29), f(31)] as const, hit: f(31), drag: [f(31), f(45)] as const } as const;
/** The rake's arc, the ways of the blade on the floor (degrees off his forward, to his left), from its start to its end. */
export const RAKE_ARC = [-75, 60] as const;
function rakePlan(): Plan {
  const K = ST_RAKE;
  const [s0, s1] = K.strike;
  const UP: StKey = {
    body: { pz: R.pz - 1, px: -2, pitch: -6, bend: -8, yaw: -30, twist: -16, side: 4, hunch: 6, faceUp: 8, faceTurn: 30, rfx: R.rfx - 3 },
    grip: [0, -44, 126], az: -150, el: 60, hold: SHOVEL.grip, face: [-0.6, 0.3, -0.5],
    left: [36, 20, -6], wl: [-0.1, 0.7, -0.7], wr: [-0.3, -0.7, 0.6],
  };
  // (the blade on the floor `deg` off his forward: his body turned with it, his fist out before him that way)
  const onFloor = (deg: number, body: P, reach = 1): StKey => {
    // (his body turned three quarters of the way with the blade; his fist out before his right shoulder)
    const y = ((deg * 0.75) * Math.PI) / 180;
    const bx = 40 * reach;
    const by = -22;
    const gr: V3 = [bx * Math.cos(y) - by * Math.sin(y), bx * Math.sin(y) + by * Math.cos(y), 50];
    return { body: { ...body, yaw: deg * 0.75 }, grip: gr, az: deg - 4, el: -44, hold: SHOVEL.grip, face: [0, 0, 1], left: [-6, 16, -40], wl: [-0.4, 0.9, -0.1], wr: [-0.2, -0.9, -0.2] };
  };
  return {
    long: K.long,
    strike: K.strike,
    hit: K.hit,
    keys: [
      [0, {}],
      [0.2, { body: { pz: R.pz - 2.5, px: -1, pitch: -1, bend: -2, yaw: -16, twist: -8, side: 2, hunch: 9, faceUp: 4, faceTurn: 16 }, grip: [12, -48, 92], az: -82, el: 12, face: [0, -0.2, 1], left: [14, 16, -28], wl: [-0.3, 0.9, -0.4], wr: [-0.4, -0.85, 0.2] }],
      [K.warn[0], UP],
      [0.52, shaken(UP, 1)],
      [0.62, shaken(UP, 2)],
      [0.72, shaken(UP, 3)],
      [0.82, shaken(UP, 4)],
      [K.warn[1], UP],
      // hips first
      [s0, { ...UP, body: { ...UP.body, yaw: -40, twist: -8, pitch: -2 }, grip: [1, -44, 125], el: 58 }],
      // SLAMMED DOWN on the floor at his right
      [s1, onFloor(RAKE_ARC[0], { pz: R.pz - 7, px: 4, pitch: 14, bend: 14, twist: -2, side: -2, hunch: 18, faceUp: -10, faceTurn: -10 }, 1.05)],
      // DRAGGED round before him, his bulk turning with it
      [f(38), onFloor(-8, { pz: R.pz - 7.5, px: 5, pitch: 15, bend: 14, twist: 0, side: -1, hunch: 18, faceUp: -10, faceTurn: 0 }, 1.1)],
      [K.drag[1], onFloor(RAKE_ARC[1], { pz: R.pz - 7, px: 4, pitch: 13, bend: 12, twist: 4, side: 1, hunch: 17, faceUp: -8, faceTurn: 6 }, 1.0)],
      // lifted off the floor at his left, and back round
      [1.8, { body: { pz: R.pz - 5, px: 2.5, pitch: 8, bend: 7, yaw: 30, twist: 4, hunch: 14, faceUp: -2, faceTurn: 4 }, grip: [38, 4, 62], az: 48, el: -24, face: [0, 0, 1], left: [-6, 14, -44] }],
      [2.4, { body: { pz: R.pz - 3.5, px: 1, pitch: 5, bend: 4, yaw: 8, twist: 1, hunch: 13, faceUp: 0 }, grip: [22, -26, 52], az: 6, el: -34, face: [0, 0, 1] }],
      [K.long, {}],
    ],
  };
}
function rakeFeet(): (t: number) => P {
  const K = ST_RAKE;
  return footwork(B, {
    R: { start: R0, moves: [{ t0: 0.08, t1: 0.36, to: plantBy(R0, -10, -4, -24), lift: 4 }, { t0: K.hit + 0.02, t1: K.drag[1] + 0.1, to: plantBy(R0, -10, -4, 10, { pitch: 24 }) }, { t0: 2.2, t1: 2.6, to: R0, lift: 3.5 }] },
    L: { start: L0, moves: [{ t0: K.warn[1] - 0.1, t1: K.hit - 0.01, to: plantBy(L0, 8, -4, -30), lift: 4 }, { t0: K.hit + 0.04, t1: K.drag[1], to: plantBy(L0, 8, -4, 20, { pitch: 22 }) }, { t0: 2.3, t1: 2.75, to: L0, lift: 3.5 }] },
  });
}

// =============================================================================================
// THE FURNACE BURSTS (`burst`, his finisher)

/**
 * Its times: his arms flung wide and his door burst open by `warn[0]` (`open`), HELD, roaring, to `warn[1]` (the ring marked on
 * the floor from `mark`); hips first; THE STRIKE, two frames, he hurls himself forward and the fire belches out of him at `hit`, the
 * ring rolling out (the fx's); spent to `spent`; the door clanged shut (`shut`); back to his stand by `long`.
 */
export const ST_BURST = { long: 3.4, open: [0.3, 0.46] as const, warn: [0.55, f(40)] as const, mark: 0.4, strike: [f(42), f(44)] as const, hit: f(44), spent: 2.2, shut: [2.55, 2.75] as const } as const;
function burstPlan(): Plan {
  const K = ST_BURST;
  const [s0, s1] = K.strike;
  const WIDE: StKey = {
    body: { pz: R.pz + 1.5, px: -4, pitch: -9, bend: -12, yaw: 0, twist: 0, side: 0, hunch: 0, shrug: 0, faceUp: 22, faceTurn: 0 },
    grip: [-4, -62, 100], az: -90, el: 40, hold: 8, face: [1, 0, 0.2],
    left: [-4, 44, 16], wl: [-0.2, 0.8, -0.6], wr: [-0.2, -0.8, -0.6],
  };
  return {
    long: K.long,
    strike: K.strike,
    hit: K.hit,
    keys: [
      [0, {}],
      [0.24, { body: { pz: R.pz - 3, px: 1, pitch: 6, bend: 6, hunch: 14, shrug: 0.4, faceUp: -6 }, grip: [12, -44, 70], az: -60, el: 14, hold: 12, face: [0.3, 0, 1], left: [8, 24, -26] }],
      [K.warn[0], WIDE],
      [0.7, shaken({ ...WIDE, left: [-3, 44.5, 17] }, 1, 0.8)],
      [0.85, shaken({ ...WIDE, left: [-4, 43.5, 15.5] }, 2, 0.8)],
      [1.0, shaken({ ...WIDE, left: [-3, 44.5, 17] }, 3, 0.8)],
      [1.15, shaken({ ...WIDE, left: [-4, 43.5, 15.5] }, 4, 0.8)],
      [K.warn[1], WIDE],
      // hips first: his hips thrown forward under him, his chest still arched back
      [s0, { ...WIDE, body: { ...WIDE.body, px: -1.5, pitch: -2, bend: -18 } }],
      // THE STRIKE: hurled forward and down, the fire belching out of him
      [s1, { body: { pz: R.pz - 7, px: 7, pitch: 16, bend: 18, hunch: 22, shrug: 0.5, faceUp: -6, lk: 22, rk: -22 }, grip: [18, -56, 64], az: -60, el: 4, hold: 8, face: [0.2, 0, 1], left: [22, 30, -26], wl: [-0.3, 0.9, -0.3], wr: [-0.3, -0.9, -0.3] }],
      [1.75, { body: { pz: R.pz - 8, px: 8, pitch: 18, bend: 20, hunch: 24, shrug: 0.5, faceUp: -9, lk: 22, rk: -22 }, grip: [22, -52, 58], az: -55, el: -6, face: [0.2, 0, 1], left: [24, 26, -32] }],
      // spent, heaving
      [K.spent, { body: { pz: R.pz - 8.5, px: 6, pitch: 16, bend: 19, hunch: 26, shrug: 0.55, faceUp: -12, lk: 20, rk: -20 }, grip: [20, -48, 52], az: -40, el: -24, hold: 12, face: [0, 0, 1], left: [10, 16, -42] }],
      [2.6, { body: { pz: R.pz - 6, px: 3, pitch: 10, bend: 10, hunch: 20, faceUp: -6 }, grip: [12, -40, 48], az: -26, el: -32, hold: 6, face: [0, 0, 1], left: [2, 10, -46] }],
      [K.long, {}],
    ],
  };
}
function burstFeet(): (t: number) => P {
  const K = ST_BURST;
  return footwork(B, {
    L: { start: L0, moves: [{ t0: 0.16, t1: 0.44, to: plantBy(L0, -2, 4, 6), lift: 3.5 }, { t0: K.hit - 0.1, t1: K.hit, to: plantBy(L0, 10, 3, -4), lift: 3.5 }, { t0: 2.75, t1: 3.15, to: L0, lift: 3 }] },
    R: { start: R0, moves: [{ t0: 0.2, t1: 0.48, to: plantBy(R0, -2, -4, -6), lift: 3.5 }, { t0: 2.85, t1: 3.25, to: R0, lift: 3 }] },
  });
}

// =============================================================================================
// STRUCK, AND HIS DEATH

export const ST_REEL = 0.4;
function reelPlan(): Plan {
  const JOLT: StKey = { body: { pz: R.pz + 1, px: -5, pitch: -6, bend: -7, hunch: 6, faceUp: 18, faceTilt: -6 }, grip: [R.rhx - 3, R.rhy - 2, R.rhz + 4], el: R.wEl + 4, left: [-6, 12, -42] };
  return { long: ST_REEL, keys: [[0, {}], [0.1, JOLT], [0.24, { body: { pz: R.pz - 1, px: -2, pitch: 1, bend: 0, hunch: 10, faceUp: 6 }, grip: [R.rhx - 1, R.rhy - 1, R.rhz + 1.5], left: [-3, 9, -47] }], [ST_REEL, {}]] };
}
/**
 * HIS DEATH: THE FURNACE EXPLODES (his pick of 6 Nov 2026, “Furnace explodes (Recommended)”; its timings art/stoker.ts
 * `ST_DEATH`). Struck (the jolt), he staggers, and STIFFENS UPRIGHT as his firebox overloads: his knees locked straight, his chest
 * thrown out, his head flung back, his arms rigid out from his sides, his fists clenched (the shovel let fall at `drop`); held,
 * swelling more, to the strike; then he bursts (art/stoker.ts `blastBits`: nothing of his body is painted from the burst, only
 * the pieces he flies apart into). His feet never leave the floor.
 */
export const ST_DIES = ST_DEATH;
/** Where the gear lies when it is still, from his floor point (his own lengths: forward, to his left), flat on the floor. */
export const GEAR_REST: readonly [number, number] = [88, 14];
const KNEE_Z = B.legR[1] * 1.12;
function diesPlan(): Plan {
  const K = ST_DIES;
  const STIFF: StKey = { body: { pz: R.pz + 3.0, px: -1.5, pitch: -5, bend: -9, roll: 0, yaw: 0, twist: 0, hunch: 3, shrug: 0.85, faceUp: 26, faceTilt: 0, faceTurn: 0 }, grip: [6, -52, 60], az: -100, el: -8, hold: 10, face: [1, 0, 0.3], left: [0, 23, -27], wl: [-0.3, 0.8, -0.5], wr: [-0.3, -0.8, -0.5] };
  const SWELL: StKey = { body: { pz: R.pz + 3.6, px: -2, pitch: -6.5, bend: -12, roll: 0, yaw: 0, twist: 0, hunch: 1, shrug: 1.0, faceUp: 32, faceTilt: 0, faceTurn: 0 }, grip: [5, -56, 64], az: -100, el: -6, hold: 10, face: [1, 0, 0.3], left: [-1, 27, -24], wl: [-0.3, 0.8, -0.5], wr: [-0.3, -0.8, -0.5] };
  return {
    long: K.long,
    keys: [
      [0, {}],
      // struck: jolted back
      [K.jolt, { body: { pz: R.pz + 1, px: -5, pitch: -6, bend: -7, hunch: 6, faceUp: 18 }, grip: [R.rhx - 3, R.rhy - 2, R.rhz + 4], left: [-6, 12, -42] }],
      // staggering, his fire flaring, the shovel slipping from his fist
      [0.32, { body: { pz: R.pz - 1, px: -3, pitch: 2, bend: 1, roll: 3, hunch: 13, faceUp: 6, faceTilt: 6 }, grip: [R.rhx + 2, R.rhy - 8, R.rhz + 6], az: -100, el: -6, hold: 10, face: [1, 0, 0.3], left: [-4, 16, -38], wl: [-0.3, 0.8, -0.5], wr: [-0.3, -0.8, -0.5] }],
      // STIFFENED UPRIGHT as his firebox overloads, and held, swelling, to the burst
      [K.stiff, STIFF],
      [K.strike[0], SWELL],
      [K.long, SWELL],
    ],
  };
}
// =============================================================================================
// WHAT A MOMENT SAYS OVER AND ABOVE THE BONES

export const ST_NAMES = {
  stand: 'The Stoker stands, breathing fire',
  walk: 'The Stoker walks',
  attack: 'The shovel of coals',
  rake: 'The fire rake',
  burst: 'The furnace bursts',
  reel: 'The Stoker is struck',
  dying: 'His furnace explodes',
} as const;
type MoveName = keyof typeof ST_NAMES;
const byName: Record<string, MoveName> = Object.fromEntries(Object.entries(ST_NAMES).map(([k, v]) => [v, k as MoveName]));
const PLANS: Record<MoveName, Plan> = { stand: standPlan(), walk: walkPlan(), attack: coalsPlan(), rake: rakePlan(), burst: burstPlan(), reel: reelPlan(), dying: diesPlan() };
const LOOPS = new Set<string>(['stand', 'walk']);
const MOTIONS = new Map<MoveName, { motion: Motion; numbers: (t: number) => Record<string, number> }>();
function made(move: MoveName): { motion: Motion; numbers: (t: number) => Record<string, number> } {
  let m = MOTIONS.get(move);
  if (!m) {
    const plan = PLANS[move];
    m = move === 'stand' ? motionOf(plan, true, ST_STAND.frames, ST_STAND.fps) : move === 'walk' ? motionOf(plan, true, ST_WALK.frames, ST_WALK.fps) : motionOf(plan);
    MOTIONS.set(move, m);
  }
  return m;
}
/** A move's numbers at a moment (a move that goes round, folded). */
function numbersAt(move: MoveName, t: number): Record<string, number> {
  const plan = PLANS[move];
  const u = LOOPS.has(move) ? plan.long * fr(t / plan.long) : Math.max(0, Math.min(plan.long, t));
  return made(move).numbers(u);
}
const moveOfMoment = (m: Moment): MoveName => (m.dying ? 'dying' : (byName[m.move ?? ''] ?? 'stand'));

/** His fire through a move (0 out, 0.6 or so breathing, 1 roaring, 1.5 white-hot). */
export function heatAt(move: string, t: number): number {
  if (move === 'stand') return 0.6 + 0.16 * Math.sin((t / ST_STAND_LONG) * TAU);
  if (move === 'walk') return 0.62 + 0.06 * Math.sin((t / WALK_LONG) * TAU * 2);
  if (move === 'attack') {
    const C = ST_COALS;
    return 0.6 + 0.8 * smooth(C.open[0], C.plunge, t) - 0.2 * smooth(C.out, C.warn[0], t) + 0.3 * smooth(C.warn[0], C.warn[1], t) - 0.75 * smooth(C.hit, C.long, t);
  }
  if (move === 'rake') {
    const K = ST_RAKE;
    return 0.6 + 0.55 * smooth(0.1, K.warn[0], t) - 0.4 * smooth(K.drag[1], K.long, t) - 0.15 * smooth(K.hit, K.drag[1], t);
  }
  if (move === 'burst') {
    const K = ST_BURST;
    return 0.6 + 1.0 * smooth(0.2, K.warn[0], t) + 0.25 * smooth(K.warn[0], K.warn[1], t) - 1.6 * smooth(K.hit + 0.1, K.spent, t) + 0.45 * smooth(K.spent + 0.3, K.long, t);
  }
  if (move === 'reel') return 0.6 + 0.6 * Math.sin(Math.PI * clamp01(t / ST_REEL));
  if (move === 'dying') return 0.6 + 0.35 * smooth(0, 0.25, t) + 0.65 * smooth(ST_DIES.build[0], ST_DIES.strike[0], t);
  return 0.6;
}
/** His fire-door through a move (0 shut, 1 flung wide). */
export function doorAt(move: string, t: number): number {
  if (move === 'attack') return smooth(ST_COALS.open[0], ST_COALS.open[1], t) * (1 - smooth(ST_COALS.shut[0], ST_COALS.shut[1], t));
  if (move === 'burst') return smooth(ST_BURST.open[0], ST_BURST.open[1], t) * (1 - smooth(ST_BURST.shut[0], ST_BURST.shut[1], t));
  if (move === 'reel') return 0.28 * Math.sin(Math.PI * clamp01(t / 0.3));
  if (move === 'dying') return 0.1 * smooth(ST_DIES.build[0], ST_DIES.strike[0], t);
  return 0;
}
/** The coals on his shovel through the move of coals: scooped as it is in his firebox, heaped, flung. */
function loadAt(move: string, t: number): { n: number; hot: number } {
  if (move !== 'attack') return { n: 0, hot: 0 };
  const C = ST_COALS;
  if (t >= C.hit - 1e-6) return { n: 0, hot: 0 };
  return { n: smooth(C.plunge + 0.04, 0.7, t), hot: 0.7 + 0.3 * smooth(C.out, C.warn[0], t) };
}
/** Sparks burst out of his door: as it is flung open, slammed shut, struck, and as his fire flares in his death. */
function burstAt(move: string, t: number): { k: number; since: number } | null {
  const at = (t0: number, k: number): { k: number; since: number } | null => (t >= t0 && t < t0 + 0.6 ? { k, since: t - t0 } : null);
  if (move === 'attack') return at(ST_COALS.shut[1], 0.9) ?? at(ST_COALS.open[0] + 0.06, 1.0);
  if (move === 'burst') return at(ST_BURST.open[0] + 0.06, 1.2);
  if (move === 'reel') return at(0.02, 0.8);
  if (move === 'dying') return at(0.02, 0.9);
  return null;
}
/** The fire belching out of his open door in the burst: from the hit, a gout out to 3 tiles, dying away. */
export function goutAt(move: string, t: number): { k: number; reach: number } {
  if (move !== 'burst') return { k: 0, reach: 0 };
  const K = ST_BURST;
  const k = smooth(K.strike[0], K.hit, t) * (1 - smooth(K.hit + 0.25, 1.95, t));
  return { k, reach: (1.2 + 1.6 * smooth(K.hit - 0.04, K.hit + 0.2, t)) * TILE3 };
}
/** When each foot last came down (seconds before `t`; -1 if not within the walk's round). */
function stampAt(move: string, t: number): { L: number; R: number } {
  if (move !== 'walk') return { L: -1, R: -1 };
  const u = fr(t / WALK_LONG) * WALK_LONG;
  // (each foot comes down at the start of its stance: the left at 0, the right half a round on)
  const since = (at: number): number => ((u - at) % WALK_LONG + WALK_LONG) % WALK_LONG;
  return { L: since(0), R: since(WALK_LONG / 2) };
}
/** His fire going out as he dies (0 alive, 1 black iron and ash). */
export function coldAt(move: string, t: number): number {
  void move;
  void t;
  return 0;
}
/** THE GEAR as he dies: spinning out of the fireball as he bursts (`gear`), flung high, clanging down onto its edge, bouncing twice, rolled over flat and lying still at GEAR_REST by `gearStill`. */
export function gearAt(move: string, t: number, s: Skeleton): { c: V3; up: V3; spin: number } | null {
  if (move !== 'dying' || t < ST_DIES.gear) return null;
  const from = bellyOf(s).c;
  const u = t - ST_DIES.gear;
  const rest: V3 = [GEAR_REST[0], GEAR_REST[1], 0.3];
  // (flung up out of the fire and down onto its edge in 0.7 s, a bounce of 0.2 s, a little one of 0.12 s, then rolled over flat)
  const g = 900;
  const T1 = 0.7;
  const T2 = 0.2;
  const T3 = 0.12;
  const total = ST_DIES.gearStill - ST_DIES.gear;
  const vz = (GEAR.r - from[2] + (g * T1 * T1) / 2) / T1;
  const xy = (k: number): [number, number] => [from[0] + (rest[0] - from[0]) * k, from[1] + (rest[1] - from[1]) * k];
  let z: number;
  let k: number;
  if (u < T1) {
    k = 0.8 * (u / T1);
    z = from[2] + vz * u - (g * u * u) / 2;
  } else if (u < T1 + T2) {
    const v = (u - T1) / T2;
    k = 0.8 + 0.12 * v;
    z = GEAR.r + 9 * 4 * v * (1 - v);
  } else if (u < T1 + T2 + T3) {
    const v = (u - T1 - T2) / T3;
    k = 0.92 + 0.05 * v;
    z = GEAR.r + 3 * 4 * v * (1 - v);
  } else {
    k = 0.97 + 0.03 * smooth(T1 + T2 + T3, total, u);
    z = GEAR.r;
  }
  // (on its edge as it flies and bounces, spinning; rolled down flat on the floor at the last)
  const lay = smooth(T1 + T2 + T3 - 0.02, total, u);
  const [x, y] = xy(Math.min(1, k));
  const edgeUp: V3 = norm([0.2, 1, 0.15]);
  const up = norm(lerp3(edgeUp, [0, 0, 1], lay));
  const rim = GEAR.r * Math.sqrt(Math.max(0, 1 - up[2] * up[2])) + GEAR.thick / 2 + 0.4;
  const zz = Math.max(z * (1 - lay) + (GEAR.thick / 2 + 0.6) * lay, rim);
  return { c: [x, y, zz], up, spin: 1100 * (1 - Math.exp(-u * 2.6)) };
}

/** HIS STRIKES (his rulebook's Movement 9): from the last frame of each wind-up to the frame it lands on. */
export const ST_STRIKES: Readonly<Record<string, readonly [number, number]>> = { attack: ST_COALS.strike, rake: ST_RAKE.strike, burst: ST_BURST.strike };
/** Whether a frame of a move shows its strike's smear: from the frame after its wind-up ends to the frame after it lands. */
export function smearedAt(move: string, t: number): boolean {
  const s = ST_STRIKES[move];
  return !!s && t > s[0] + 1e-6 && t <= s[1] + FR + 1e-6;
}
/** Where the shovel is at a moment of a move. */
function shovelAt(move: MoveName, t: number, s: Skeleton): ReturnType<typeof shovelOf> {
  const v = numbersAt(move, t);
  return shovelOf(s, [v.fx, v.fy, v.fz], v.hold);
}
const bonesOf = (move: MoveName, t: number): Skeleton => {
  const mv = moveOf(move);
  const q = { ...R, ...poseOfNumbers(numbersAt(move, t)) } as Posed;
  return solve(B, mv.feet ? ({ ...q, ...mv.feet(LOOPS.has(move) ? t : Math.max(0, Math.min(PLANS[move].long, t))) } as Posed) : q);
};
/** THE SMEAR: after-images of what strikes (the shovel's scoop and his fist; in the burst, his door and his fists), along the way they have come since the wind-up ended. */
function smearOf(move: MoveName, t: number): V3[][] | null {
  if (!smearedAt(move, t)) return null;
  const [s0, s1] = ST_STRIKES[move];
  const to = Math.min(t, s1);
  const out: V3[][] = [];
  const n = 6;
  // (the ghosts of what strikes, each where it was; and the ways its ends came, swept arcs)
  const ways: V3[][] = [];
  for (let i = 0; i <= n; i++) {
    const u = s0 - FR * 0.5 + ((to - (s0 - FR * 0.5)) * i) / n;
    const s = bonesOf(move, u);
    const ends: V3[] = [];
    if (move === 'burst') {
      out.push([s.elbowL, s.handL], [s.elbowR, s.handR]);
      ends.push(s.handL, s.handR, mouthOf(s));
    } else {
      const sv = shovelAt(move, u, s);
      if (i === n) out.push([s.handR, sv.socket, sv.lip]);
      // (a band swept by the scoop: its lip across its whole width, and its heel)
      for (let a = -1; a <= 1.001; a += 0.25) ends.push(add(sv.lip, mul(sv.across, SHOVEL.half * a)));
      ends.push(sv.heel, sv.socket);
    }
    ends.forEach((p, j) => (ways[j] ??= []).push(p));
  }
  const kept = t > s1 + 1e-6 ? out.slice(Math.floor(out.length / 2)) : out;
  return [...kept, ...ways.map((w) => (t > s1 + 1e-6 ? w.slice(Math.floor(w.length / 2)) : w))];
}
/** What every moment of his moves says over and above his bones (for his painter). */
export const ST_SAY: StokerSay = {
  heat: (m) => heatAt(moveOfMoment(m), m.t),
  door: (m) => doorAt(moveOfMoment(m), m.t),
  face: (m) => {
    const v = numbersAt(moveOfMoment(m), m.t);
    return [v.fx, v.fy, v.fz];
  },
  hold: (m) => numbersAt(moveOfMoment(m), m.t).hold,
  load: (m) => loadAt(moveOfMoment(m), m.t),
  held: (m) => !(m.dying && m.t > ST_DIES.drop + 1e-6),
  bonesAt: (t) => bonesOf('dying', t),
  cold: (m) => coldAt(moveOfMoment(m), m.t),
  burst: (m) => burstAt(moveOfMoment(m), m.t),
  smoke: (m) => {
    const move = moveOfMoment(m);
    if (move === 'stand') return 0.6 + 0.6 * Math.max(0, -Math.sin((m.t / ST_STAND_LONG) * TAU));
    if (move === 'burst') return 1 + 1.4 * smooth(ST_BURST.hit, ST_BURST.spent, m.t);
    if (move === 'dying') return 0.9 + 1.6 * smooth(ST_DIES.build[0], ST_DIES.strike[0], m.t);
    return 0.9;
  },
  gout: (m) => goutAt(moveOfMoment(m), m.t),
  stamp: (m) => stampAt(moveOfMoment(m), m.t),
  scrape: (m) => {
    const move = moveOfMoment(m);
    if (move === 'walk') return 1;
    if (move === 'rake') return m.t >= ST_RAKE.hit - 1e-6 && m.t <= ST_RAKE.drag[1] + 0.05 ? 1 : 0;
    return 0;
  },
  gear: (m) => gearAt(moveOfMoment(m), m.t, m.s),
  smear: (m) => smearOf(moveOfMoment(m), m.t),
};

// =============================================================================================
// HIM, AS THE GAME HOLDS A MONSTER

function moveOf(move: MoveName): MobMove {
  return STOKER_MOVES[move];
}
function glintAt(move: MoveName, t: number): number {
  // (his eyes flaring gold, the warning: from as he winds up to just after he strikes)
  const w = move === 'attack' ? ST_COALS.warn : move === 'rake' ? ST_RAKE.warn : move === 'burst' ? ST_BURST.warn : null;
  const hit = move === 'attack' ? ST_COALS.hit : move === 'rake' ? ST_RAKE.hit : ST_BURST.hit;
  if (!w) return 0;
  if (t < w[0] - 0.2 || t > hit + 0.2) return 0;
  if (t < w[0]) return (t - (w[0] - 0.2)) / 0.2;
  if (t <= hit) return 1;
  return 1 - (t - hit) / 0.2;
}
const mv = (key: MoveName, more: Partial<MobMove> = {}): MobMove => ({ name: ST_NAMES[key], motion: made(key).motion, rest: R, glint: (t) => glintAt(key, t), ...more });
const STOKER_MOVES: Record<MoveName, MobMove> = {
  stand: mv('stand'),
  walk: mv('walk', { period: WALK_LONG, ground: ST_PACE * TILE3 }),
  attack: mv('attack', { feet: coalsFeet() }),
  rake: mv('rake', { feet: rakeFeet() }),
  burst: mv('burst', { feet: burstFeet() }),
  reel: mv('reel'),
  dying: mv('dying'),
};
function stokerMob(): Mob {
  const paint = stokerPainter(ST_SAY);
  return {
    id: 'stoker',
    name: 'The Stoker',
    size: "a boss of his own: twice the knight's height",
    build: B,
    stand: STOKER_MOVES.stand,
    attack: STOKER_MOVES.attack,
    more: { rake: STOKER_MOVES.rake, burst: STOKER_MOVES.burst },
    idleFrames: ST_STAND.frames,
    idleFps: ST_STAND.fps,
    walk: STOKER_MOVES.walk,
    walkFrames: ST_WALK.frames,
    walkFps: ST_WALK.fps,
    pace: ST_PACE,
    reel: STOKER_MOVES.reel,
    reelTime: ST_REEL,
    hit: ST_COALS.hit,
    warn: ST_COALS.warn[1] - ST_COALS.warn[0],
    dieTime: ST_DIES.long,
    dying: STOKER_MOVES.dying,
    aura: { x: ST_CANVAS.ax, y: ST_CANVAS.ay - 60, r: 90, color: '#ff8a2a', a: 0.12 },
    shadow: 30,
    canvas: ST_CANVAS,
    trueBack: true,
    bits: paint.bits,
    grains: paint.grains,
    // (the shovel flung down from his fist as he dies, and lying on the floor at his right)
    // (nothing of him falls as the game's dying monsters' pieces fall: he lets his shovel fall and flies apart himself, art/stoker.ts `blastBits`)
    fall: () => null,
  };
}
export const STOKER: Mob = stokerMob();
export function makeStokerArt(mob: Mob = STOKER, pace = mob.pace): ActorArt {
  return { front: mobSet(mob, 'front', pace), back: mobSet(mob, 'back', pace) };
}

// =============================================================================================
// HIM AS THE CHECKS SEE HIM (art/boss_checks.ts)

const len3 = (v: V3): number => Math.hypot(v[0], v[1], v[2]);
/** His outside as painted: his arms, his legs, his boots and his neck (the gorget) as limbs; his head (the helm, as low and as big as it is painted), his firebox, its dome, his skirt and his flue as solids. */
export function stokerSolids(s: Skeleton): { limbs: CheckLimb[]; lumps: CheckLump[] } {
  const [r0, r1] = B.armR;
  const [l0, l1, l2] = B.legR;
  const limbs: CheckLimb[] = [];
  for (const side of ['L', 'R'] as const) {
    const L = side === 'L';
    limbs.push(
      { name: `upper${side}`, a: L ? s.shoulderL : s.shoulderR, b: L ? s.elbowL : s.elbowR, r: r0 },
      { name: `fore${side}`, a: L ? s.elbowL : s.elbowR, b: L ? s.handL : s.handR, r: r1 },
      { name: `leg${side}`, a: L ? s.hipL : s.hipR, b: L ? s.kneeL : s.kneeR, r: l0 },
      { name: `shin${side}`, a: L ? s.kneeL : s.kneeR, b: L ? s.ankleL : s.ankleR, r: l1 },
      { name: `foot${side}`, a: add(L ? s.heelL : s.heelR, [0, 0, 3]), b: add(L ? s.toeL : s.toeR, [0, 0, 3]), r: l2 * 1.2 },
    );
  }
  // (the gorget, thick, flaring down into his shoulders)
  limbs.push({ name: 'neck', a: s.neck, b: lerp3(s.neck, s.head, 0.5), r: 8.0 });
  const fl = flueOf(s);
  for (let i = 1; i < fl.length; i++) limbs.push({ name: 'flue', a: fl[i - 1], b: fl[i], r: FLUE_R });
  const bl = bellyOf(s);
  const dm = domeOf(s);
  const hm = helmOf(s);
  const pl = pauldronOf(s, 'L');
  const pr = pauldronOf(s, 'R');
  const lumps: CheckLump[] = [
    // (the helm as it is painted: from its crest to under its jaw, set low between his shoulders; art/stoker.ts `helmOf`, `HELM`)
    { name: 'head', c: add(add(hm.c, mul(hm.u, -1.5)), mul(hm.f, 0.7)), rot: s.face, h: [10.0, 11.2, 11.0] },
    { name: 'firebox', c: bl.c, rot: s.belly, h: bl.r },
    { name: 'dome', c: dm.c, rot: s.chest, h: [len3(dm.ax[0]), len3(dm.ax[1]), len3(dm.ax[2])] },
    { name: 'hips', c: add(s.pelvis, mul(s.hips[2], 2)), rot: s.hips, h: [B.pelvisDeep + 5, B.pelvisHalf + 5.5, 6] },
  ];
  void pl;
  void pr;
  return { limbs, lumps };
}
const ALL = ['stand', 'walk', 'attack', 'rake', 'burst', 'reel', 'dying'] as const;
export const ST_SHAPE: BossShape = {
  body: stokerSolids,
  // (what strikes: the shovel's lip; in the burst, the fire-door's middle, where the fire comes out)
  tip: (move, t, s) => {
    if (move === 'burst') return mouthOf(s);
    if (move === 'dying' && t >= ST_DIES.drop) return null;
    const m = byName[ST_NAMES[move as MoveName]] ?? null;
    return m ? shovelAt(m, t, s).lip : null;
  },
  // (the shovel: its haft may lie in his right fist, and in his left when it holds it; its scoop in his firebox as it scoops)
  things: (move, t, s) => {
    const m = move as MoveName;
    if (!(m in PLANS) || (m === 'dying' && t >= ST_DIES.drop)) return [];
    const sv = shovelAt(m, t, s);
    const v = numbersAt(m, t);
    const may = ['foreR', ...(v.on > 0.5 ? ['foreL'] : [])];
    const scooping = m === 'attack' && t > ST_COALS.open[0] + 0.08 && t < ST_COALS.shut[0];
    const haft: V3[] = [];
    for (let k = 0; k <= 1.0001; k += 0.1) haft.push(lerp3(sv.top, sv.socket, k));
    const scoop: V3[] = [];
    for (const a of [-1, 0, 1]) for (const b of [0, 0.5, 1]) scoop.push(add(add(sv.heel, mul(sv.bladeWay, SHOVEL.blade * b)), mul(sv.across, SHOVEL.half * a * 0.9)));
    return [
      { name: 'shovel haft', pts: haft, r: 1.8, may },
      { name: 'shovel scoop', pts: scoop, r: 1.2, may: scooping ? [...may, 'firebox', 'dome'] : may },
    ];
  },
  // (the points of him followed from frame to frame and where one move hands over to the next: his head, his chest, his hips, his hands and his elbows; his feet are held by SLIDE)
  follow: (_move, _t, s) => ({ head: s.head, chest: s.ribs, pelvis: s.pelvis, handL: s.handL, handR: s.handR, elbowL: s.elbowL, elbowR: s.elbowR }),
  strikes: ST_STRIKES,
  smeared: smearedAt,
  low: { knee: KNEE_Z * 0.9 },
};
export { ALL as ST_MOVES, bonesOf as stokerBonesOf, numbersAt as stokerNumbersAt, shovelAt as stokerShovelAt };
export const ST_LONG = { attack: ST_COALS.long, rake: ST_RAKE.long, burst: ST_BURST.long } as const;
void DOOR;
void len;
void sub;
void heading;
