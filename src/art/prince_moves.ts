// FLOOR 17'S BOSS, THE PRINCE: HIS MOVES (the art chat, 29 Oct 2026). A MOCK-UP: NOT IN THE GAME, behind PRINCE_ON
// (art/prince.ts, off). His look and his brief are art/prince.ts; what his moves leave on the floor art/prince_fx.ts.
//
// His words for him, 28 Oct, 22:34 (of the Princess, and of the boss after her): “There are big bosses that can be slow.
// But like the prince with a rapier, dancing is going to need to be fast and constantly moving”; and before it, 22:27:
// “Everything is always so plodding when you first animate them.  I could tell you I want a cheetah boss and it would walk
// around like an old dog.”; and at 22:23: “It’s all too slow and too narrow and too small.  I could dodge anything you’ve
// put in these moves with my eyes closed”. His rulebook's Movement 9 for every attack (24 Oct: “Like the wind up and wind
// down are big but the actual punch is lightning quick”), and of the enemies (28 Oct): “Start from now on, but every enemy
// is going to need that change eventually.  And bigger AOE to compensate for the extra time the player gets to evade”.
// So he is made fast and never still from the first pass, every blow a big held wind-up, a strike of two frames smeared
// with its after-images, a big wind-down; and every area big, on the scale of a boss arena (about 17 by 20 tiles).
//
// HIS MOVES:
//   HIS STAND (never still): light on the balls of his feet, swaying, stepping from foot to foot in place, rising and
//     sinking; the rapier's point circling before him; his left hand turning in the air as a dancer's; his mask watching you.
//   THE DANCE-STEP (his walk, `PC_PACE` tiles a second): quick gliding steps on the balls of his feet, leaning into his way,
//     his coat streaming, the rapier carried out low at his side.
//   THE DART (`dart`, a burst): a turning leap, a whole turn in the air, his coat flung out round him; the game carries him
//     `DART.carry` tiles while he is in the air (`DART.air`).
//   THE THRUST (his attack): en garde, then coiled back onto his back leg, the rapier drawn back past his ear, its point at
//     you, glinting pink, held (THE WARNING); then the lunge, in two frames, smeared: he flies forward two and a half tiles
//     and the point is out four; carried on; held a breath; then he springs back, a step and a skip, with a flourish of
//     the blade, and is himself again.
//   THE DANCE (`dance`, then `waltz`): he sweeps into a deep bow, his left hand held out to you (held, the warning); he
//     snaps up with a flourish of the rapier over his head (two frames, smeared): the ring of masked partners rises round
//     you (art/prince_fx.ts); then he waltzes away round the arena with nobody in his arms, turning and turning (`waltz`:
//     the game carries him round his arc at `WALTZ_PACE`).
//   MASKS (`masks`): he whirls round and draws a fan of smiling gilt masks out of his coat, coiled, his arm across him, their
//     eye holes glinting (held, the warning); then he flings them backhand (two frames, smeared): they fly spinning across the
//     room in a fan (art/prince_fx.ts); his arm carries through and he spins back round.
//   MIDNIGHT (`midnight`): he draws himself up onto his toes and raises the rapier over his head, its point glinting (held,
//     the warning); he thrusts it straight up (two frames, smeared): the great clock strikes, and its twelve chimes roll out
//     across the floor as rings (art/prince_fx.ts) while he fights on; he turns once round with it held high, and brings it
//     down in a great arc.
//   STRUCK: knocked back, his coat flying; he catches himself on a step.
//   HIS DEATH: struck; his mask cracks across, and he puts his hand to it; he lets the rapier fall; the mask's halves fall
//     away and under it there is nothing but the Hush's grey fog, pouring out; he sinks to his knees as it drains out of him
//     and away; and his coat, empty, falls in on itself to the floor. Nothing is left but his clothes, the mask's halves and
//     the rapier.
//
// By his rulebook: every move through every check the bosses have (art/boss_checks.ts), from in front and behind.
//   test: tsx --test tests/prince.test.ts

import type { ActorArt } from './actor_types';
import type { BossShape, CheckLimb, CheckLump, CheckThing, Handover } from './boss_checks';
import { footOn, footwork, kneelHips, plantBy, plantOf } from './bosses3';
import type { Plant } from './bosses3';
import { hash } from './kit';
import { FLAME } from './mkit';
import { TILE3, mobSet } from './new_mobs3';
import type { Fall, Mob, MobMove, Moment } from './new_mobs3';
import { BREATH_PALE } from './hushed';
import { FOG, PC_CANVAS, PRINCE_BODY, PRINCE_REST, princePainter, rapierOf } from './prince';
import type { PrinceSay } from './prince';
import { add, chestOf, dot, lerp3, mul, norm, solve, sub } from './skeleton';
import type { Bones, Key3, Motion, Posed, Skeleton, V3 } from './skeleton';

type P = Partial<Bones>;
const B = PRINCE_BODY;
const R = PRINCE_REST;
const FPS = 30;
const FR = 1 / FPS;
const D = Math.PI / 180;
const TAU = Math.PI * 2;
const clamp01 = (v: number): number => Math.max(0, Math.min(1, v));
const hashOf = (i: number, j: number): number => hash(i, j, 7731);
const smooth = (a: number, b: number, t: number): number => {
  const u = clamp01((t - a) / (b - a));
  return u * u * (3 - 2 * u);
};

// =============================================================================================
// A MOVE THROUGH KEY POSES: every field through its keys smoothly (its speed carried through each key, not stopped at it),
// but straight through a lightning strike; his feet laid over it (each down where it lands until it lifts); sampled on
// every frame the game shows

type Track = (t: number) => number;
/** A value through keys [time, value], smooth through each (a monotone cubic: it does not overshoot, and it stops only where it turns back or holds). */
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

interface Plan {
  long: number;
  keys: ReadonlyArray<readonly [number, P]>;
  /** The strike: from the last frame of its wind-up to the frame it lands on. */
  strike?: readonly [number, number];
  hit?: number;
  /** His feet through it (art/bosses3.ts `footwork`), laid over the keys. */
  feet?: (t: number) => P;
  /** A move that goes round. */
  loop?: boolean;
}
const FIELDS = ['px', 'py', 'pz', 'yaw', 'pitch', 'roll', 'twist', 'bend', 'side', 'faceTurn', 'faceUp', 'faceTilt', 'lhx', 'lhy', 'lhz', 'rhx', 'rhy', 'rhz', 'le', 're', 'lfx', 'lfy', 'lfz', 'lfp', 'lft', 'rfx', 'rfy', 'rfz', 'rfp', 'rft', 'lk', 'rk', 'lkUp', 'rkUp', 'wAz', 'wEl', 'wRoll', 'draw', 'out', 'gale'] as const;
function poseFn(plan: Plan): (t: number) => P {
  const full = plan.keys.map(([t, p]) => [t, { ...R, ...p } as unknown as Record<string, number>] as const);
  const tracks = new Map(FIELDS.map((k) => [k, track(full.map(([t, p]) => [t, p[k]] as const))]));
  const st = plan.strike;
  const at = (t: number): Record<string, number> | undefined => full.find(([kt]) => Math.abs(kt - t) < 1e-6)?.[1];
  const a0 = st ? at(st[0]) : undefined;
  const a1 = st ? at(st[1]) : undefined;
  return (t) => {
    const out: Record<string, number> = { lhIn: 0, rhIn: 0 };
    if (st && a0 && a1 && t > st[0] && t < st[1]) {
      const k = (t - st[0]) / (st[1] - st[0]);
      for (const f of FIELDS) out[f] = a0[f] + (a1[f] - a0[f]) * k;
    } else for (const f of FIELDS) out[f] = (tracks.get(f) as Track)(t);
    return { ...(out as P), ...(plan.feet ? plan.feet(t) : {}) };
  };
}
function motionOf(plan: Plan): Motion {
  const f = poseFn(plan);
  const keys: Key3[] = [];
  const n = Math.round(plan.long * FPS);
  for (let i = 0; i <= n; i++) keys.push({ at: i / FPS, pose: f(i / FPS), ease: 'lin' });
  const m: Motion = plan.hit !== undefined ? { keys, hit: plan.hit } : { keys };
  return plan.loop ? { ...m, loop: 0 } : m;
}
/** His hands, each from its own shoulder along his chest's forward, left and up. */
const hands = (l: V3, r: V3, le: number, re: number): P => ({ lhIn: 0, lhx: l[0], lhy: l[1], lhz: l[2], le, rhIn: 0, rhx: r[0], rhy: r[1], rhz: r[2], re });
/** The way the rapier points (as the bones' heading has it: degrees round to his left from his front, and up). */
const blade = (az: number, el: number, roll = 0): P => ({ wAz: az, wEl: el, wRoll: roll });

/** Where his feet stand at rest. */
const L0 = plantOf(B, 'L', {}, R);
const R0 = plantOf(B, 'R', {}, R);
/** A foot put down `at` (forward, to his left), turned `turn` to his left, tipped `pitch` toes-down. */
const plant = (at: readonly [number, number], turn: number, pitch = 0): Plant => ({ at, turn, pitch, on: 'toe' });

// =============================================================================================
// HIS STAND: never still. Light on the balls of his feet; a step from foot to foot in place; swaying; rising and sinking;
// the rapier's point circling; his left hand turning in the air; his mask watching you.

export const PC_STAND = { frames: 24, fps: 10 } as const;
const STAND_LONG = PC_STAND.frames / PC_STAND.fps;
function standPlan(): Plan {
  const T = STAND_LONG;
  const keys: [number, P][] = [];
  const N = 48;
  for (let i = 0; i <= N; i++) {
    const t = (i / N) * T;
    const a = (t / T) * TAU;
    // (his weight from foot to foot twice round, rising onto his toes at each step; his body turning a little with it)
    const sway = Math.sin(2 * a);
    const rise = Math.sin(2 * a) ** 2;
    keys.push([t, {
      pz: R.pz + 2.0 * rise,
      py: 2.2 * sway,
      roll: R.roll - 2.2 * sway,
      side: R.side + 2.0 * sway,
      yaw: R.yaw + 6 * Math.sin(a),
      twist: R.twist - 5 * Math.sin(a) + 3 * sway,
      bend: R.bend - 1.6 * rise,
      pitch: R.pitch + 1.2 * rise,
      faceTurn: R.faceTurn + 10 * Math.sin(a),
      faceTilt: R.faceTilt + 6 * sway,
      faceUp: R.faceUp + 2.5 * rise,
      // (his left hand turning in the air as a dancer's; the rapier's point going round before him, and a flick of it)
      ...hands([R.lhx + 3.0 * Math.sin(a), R.lhy + 2.2 * (1 - Math.cos(a)), R.lhz + 4.0 * Math.sin(2 * a)], [R.rhx + 1.2 * Math.sin(2 * a), R.rhy + 0.8 * (1 - Math.cos(2 * a)), R.rhz + 1.2 * Math.sin(a)], R.le - 8 * Math.sin(a), R.re),
      ...blade(R.wAz + 6 * Math.sin(a) + 2 * Math.sin(3 * a), R.wEl + 4 * (1 - Math.cos(a)) + 2 * Math.sin(2 * a) ** 2, R.wRoll),
    }]);
  }
  // (his feet: a light step from one to the other, four to a round: each lifts, steps a little out or back, and is down again
  // where it stood by the round's end; up on their balls as he rises)
  const feet = footwork(B, {
    R: { start: R0, moves: [{ t0: 0.08, t1: 0.3, to: plantBy(R0, 1.6, -1.2, -6, { pitch: 26 }), lift: 4.5 }, { t0: 1.28, t1: 1.5, to: R0, lift: 4.5 }] },
    L: { start: L0, moves: [{ t0: 0.68, t1: 0.9, to: plantBy(L0, -1.4, 1.2, 6, { pitch: 18 }), lift: 4.5 }, { t0: 1.88, t1: 2.1, to: L0, lift: 4.5 }] },
  });
  return { long: T, keys, feet, loop: true };
}

// =============================================================================================
// THE DANCE-STEP (his walk): quick gliding steps on the balls of his feet, leaning into his way, his coat streaming

/** His speed dancing across the floor, tiles a second (the Princess glides at 4; the knight runs at 4.6, `TUNE.heroSpeed`:
 * the game may show the same frames faster, `walkFpsAt`, to have him outpace the knight). */
export const PC_PACE = 4.5;
export const PC_WALK = { frames: 12, fps: 30 } as const;
const WALK_LONG = PC_WALK.frames / PC_WALK.fps;
/** How long each foot is down in each round of the walk (a share of it): he is in the air between his steps. */
const WALK_DOWN = 0.3;
/** How far a foot sweeps back under him while it is down (his own lengths): the floor going by at his pace. */
const SWEEP = PC_PACE * TILE3 * WALK_LONG * WALK_DOWN;
/** A foot of the walk at `u` of the way round (its own round: 0 as it lands): where it is along the floor (forward of its mean), how high, how far tipped toes-down (its heel flicked up behind as it leaves the floor). */
function walkFoot(u: number): [number, number, number] {
  const w = ((u % 1) + 1) % 1;
  if (w < WALK_DOWN) {
    // (down on its ball, carried back under him at his pace: on the floor it stays)
    const k = w / WALK_DOWN;
    return [SWEEP / 2 - SWEEP * k, 0, 18 + 16 * k];
  }
  // (up: the heel flicked up behind, then swung through and reached forward to land again)
  const k = (w - WALK_DOWN) / (1 - WALK_DOWN);
  const g = k * k * (3 - 2 * k);
  return [-SWEEP / 2 + SWEEP * g - 3 * Math.sin(Math.PI * k) * (1 - k), 7.5 * Math.sin(Math.PI * k) ** 0.7, 34 + 26 * Math.sin(Math.PI * Math.min(1, k * 1.6)) * (1 - k) - 14 * k];
}
/** The walk's feet `t` seconds into a round. */
function walkFeetAt(t: number): P {
  const T = WALK_LONG;
  const [lx, lz, lp] = walkFoot(t / T + 0.5);
  const [rx, rz, rp] = walkFoot(t / T);
  return { ...footOn(B, 'L', plant([lx + 1.5, L0.at[1] - 0.6], 18, lp), lz), ...footOn(B, 'R', plant([rx + 1.5, R0.at[1] + 0.8], -10, rp), rz), lk: 18, rk: -12 };
}
/** The walk's body `t` seconds into a round: leaning hard into his way, chin up; his left arm swept back behind him as a dancer's, the rapier carried before him low, its point leading. */
function walkBodyAt(t: number): P {
  const a = (t / WALK_LONG) * TAU;
  const body: P = {
    px: 1.5, pz: R.pz - 2.2 + 0.9 * Math.cos(2 * a), py: 0.9 * Math.sin(a), pitch: 11, bend: 5, roll: 2 * Math.sin(a), side: 1.2 * Math.sin(a),
    yaw: R.yaw + 7 * Math.sin(a), twist: 2 - 11 * Math.sin(a), faceTurn: 4 + 4 * Math.sin(a), faceUp: 8, faceTilt: -4 + 2 * Math.sin(a),
  };
  return { ...armsTo(body, [-7 - 1.5 * Math.cos(a), 16, -7 + 1.5 * Math.sin(2 * a)], [13 + 1.5 * Math.sin(a), -6, -14], -40, 20), ...blade(-4 + 3 * Math.sin(a), -22) };
}
function walkPlan(): Plan {
  const T = WALK_LONG;
  const keys: [number, P][] = [];
  const N = PC_WALK.frames * 2;
  for (let i = 0; i <= N; i++) {
    const t = (i / N) * T;
    keys.push([t, { ...walkBodyAt(t), ...walkFeetAt(t) }]);
  }
  return { long: T, keys, loop: true };
}
/** From one foot's fields to another's (the bones' own), lifted off its spot before it goes and set straight down: `u` 0 to 1; `lift` the most it is raised over the way. */
function footBetween(side: 'L' | 'R', a: P, b: P, u: number, lift: number): P {
  const k = side === 'L' ? ['lfx', 'lfy', 'lfz', 'lfp', 'lft'] as const : ['rfx', 'rfy', 'rfz', 'rfp', 'rft'] as const;
  const g = smooth(0.15, 0.85, u);
  const out: P = {};
  for (const f of k) out[f] = (a[f] as number) + ((b[f] as number) - (a[f] as number)) * g;
  out[k[2]] = (out[k[2]] as number) + lift * Math.sin(Math.PI * clamp01(u)) ** 0.7;
  return out;
}
/** SETTING OFF (from his stand into his dance-step's first frame, 0.2 s): he drops his weight, leans in and springs off his left foot onto his right. */
export const PC_SET_OFF = 0.2;
function setOffPlan(): Plan {
  const T = PC_SET_OFF;
  const restFeet: P = { ...footOn(B, 'L', L0), ...footOn(B, 'R', R0) };
  const w0: P = { ...walkBodyAt(0), ...walkFeetAt(0) };
  const keys: [number, P][] = [];
  const N = 6;
  for (let i = 0; i <= N; i++) {
    const u = i / N;
    const g = smooth(0, 1, u);
    const body: P = {};
    for (const f of FIELDS) if (!/^(l|r)f/.test(f)) body[f] = ((R as unknown as Record<string, number>)[f] + (((w0 as Record<string, number>)[f] ?? (R as unknown as Record<string, number>)[f]) - (R as unknown as Record<string, number>)[f]) * g) as never;
    // (a little dip as he gathers himself to go)
    body.pz = (body.pz as number) - 1.5 * Math.sin(Math.PI * u);
    const lf = footBetween('L', restFeet, w0, u, 3);
    // (the right foot steps to where it lands in his first frame; the left lifts and swings to where it is then, in the air)
    const rf = footBetween('R', restFeet, w0, u, 3.5);
    if (u >= 1) Object.assign(lf, { lfz: w0.lfz });
    keys.push([u * T, { ...body, ...lf, ...rf }]);
  }
  return { long: T, keys };
}
/** HALTING (from his dance-step's first frame back into his stand, 0.3 s): he checks, leaning back off his planted right foot, and the left comes down and he is light on his feet again. */
export const PC_HALT = 0.3;
function haltPlan(): Plan {
  const T = PC_HALT;
  const restFeet: P = { ...footOn(B, 'L', L0), ...footOn(B, 'R', R0) };
  const w0: P = { ...walkBodyAt(0), ...walkFeetAt(0) };
  const keys: [number, P][] = [];
  const N = 9;
  for (let i = 0; i <= N; i++) {
    const u = i / N;
    const g = smooth(0, 1, u);
    const body: P = {};
    for (const f of FIELDS) if (!/^(l|r)f/.test(f)) body[f] = ((((w0 as Record<string, number>)[f] ?? (R as unknown as Record<string, number>)[f])) + ((R as unknown as Record<string, number>)[f] - ((w0 as Record<string, number>)[f] ?? (R as unknown as Record<string, number>)[f])) * g) as never;
    // (checked: leaning back against his way a moment)
    body.pitch = (body.pitch as number) - 7 * Math.sin(Math.PI * u);
    body.px = (body.px as number) - 2 * Math.sin(Math.PI * u);
    const lf = footBetween('L', w0, restFeet, clamp01(u / 0.55), 0);
    const rf = u < 0.4 ? footBetween('R', w0, w0, 0, 0) : footBetween('R', w0, restFeet, (u - 0.4) / 0.6, 3);
    keys.push([u * T, { ...body, ...lf, ...rf }]);
  }
  return { long: T, keys };
}

// =============================================================================================
// HANDS PUT WHERE THEY GO IN THE ROOM: a hand's place given from its own shoulder along the figure's own forward, left and up
// (not his chest's), turned into his chest's own lines for the pose it is in (so that every pose of his is said the same way)

function armsTo(body: P, l: V3 | null, r: V3 | null, le?: number, re?: number): P {
  const c = chestOf({ ...R, ...body } as Bones);
  const into = (d: V3): V3 => [dot(d, c[0]), dot(d, c[1]), dot(d, c[2])];
  const out: P = { ...body };
  if (l) {
    const v = into(l);
    Object.assign(out, { lhIn: 0, lhx: v[0], lhy: v[1], lhz: v[2] });
  }
  if (r) {
    const v = into(r);
    Object.assign(out, { rhIn: 0, rhx: v[0], rhy: v[1], rhz: v[2] });
  }
  if (le !== undefined) out.le = le;
  if (re !== undefined) out.re = re;
  return out;
}
/** A shake of a held pose (the warning held, trembling): `k` the frame of it. */
const tremble = (p: P, k: number, by = 0.35): P => ({ ...p, rhz: (p.rhz as number) + (k % 2 ? by : -by * 0.7), rhx: (p.rhx as number) + (k % 2 ? -by * 0.5 : by * 0.3), lhz: (p.lhz as number) + (k % 2 ? -by * 0.5 : by * 0.4) });
/** A key's own lines, kept from one key to the next while it holds (the warning). */
const KNEE = (l: number, r: number): P => ({ lk: l, rk: r });

// =============================================================================================
// THE THRUST (his attack): en garde; coiled back onto his back leg, the rapier drawn back past his ear, its point at you
// (held: the warning); THE LUNGE in two frames, smeared, carrying him two and a third tiles and the point four out; carried
// on; held a breath; then a step back and two skips, a flourish of the blade, and himself again

/** The thrust's times (seconds), and how far it carries him (his own lengths) and the point (from where he stood). */
export const PC_THRUST = { long: 2.0, warn: [0.45, 23 / FPS] as const, strike: [24 / FPS, 26 / FPS] as const, hit: 26 / FPS, carry: 92 } as const;
const TH = PC_THRUST;
/** En garde: turned side-on, his right foot forward, his left back and turned out, knees bent; the rapier out before him, its point at you; his left hand raised behind him. */
const EN_GARDE_BODY: P = { px: 2, py: 0, pz: -4.5, yaw: 38, twist: 14, pitch: 2, bend: -2, roll: 0, side: 0, faceTurn: 0, faceUp: 2, faceTilt: -4, ...KNEE(70, 6) };
const EN_GARDE: P = { ...armsTo(EN_GARDE_BODY, [-7, 9, 9], [15, -3, -6], -50, 10), ...blade(0, 4) };
/** Coiled: sunk back onto his back leg, leaning away; the rapier drawn back past his right ear, its point straight at you; his left hand thrust out before him at you, aiming. */
const COILED_BODY: P = { px: -11, py: 0, pz: -11, yaw: 56, twist: 12, pitch: -10, bend: -7, roll: 0, side: 3, faceTurn: -6, faceUp: 4, faceTilt: -6, ...KNEE(80, 12) };
const COILED: P = { ...armsTo(COILED_BODY, [21, 6, 2], [-9, -7, 8], -20, -60), ...blade(0, -2) };
/** His hips turned first: the hips come round, the chest still held back. */
const HIPS_GO: P = { ...COILED, yaw: 32, twist: 36, px: -7, pz: -11 };
/** THE LUNGE: flown forward, sunk deep on his right leg, his back leg out straight behind; the arm and blade one line at you. */
const LUNGE_BODY: P = { px: TH.carry, py: -1, pz: -12.5, yaw: 22, twist: 6, pitch: 12, bend: 4, roll: 0, side: -2, faceTurn: -8, faceUp: 6, faceTilt: -2, ...KNEE(70, 4) };
const LUNGE: P = { ...armsTo(LUNGE_BODY, [-15, 10, -11], [25.5, 1, -3], -10, 4), ...blade(0, -3) };
const LUNGE_ON: P = { ...armsTo({ ...LUNGE_BODY, px: TH.carry + 5, pz: -13.5, pitch: 14, bend: 6 }, [-16, 10, -13], [25.8, 1.2, -4.5], -10, 4), ...blade(0, -5) };
function thrustPlan(): Plan {
  const [w0, w1] = TH.warn;
  const [s0, s1] = TH.strike;
  // (where his feet go: en garde; the lunge, the right foot flung forward to land as the blow does and the left trailing in the air
  // behind to come down after; then back: the right steps back to the left, two skips back, and his feet set as they were)
  const EG_R = plant([12, -2.5], -6, 0);
  const EG_L = plant([-9, 2], 78, 0);
  const LU_R = plant([TH.carry + 17, -3], -4, 0);
  const LU_L = plant([TH.carry - 24, 3], 80, 6);
  const feet = footwork(B, {
    R: { start: R0, moves: [{ t0: 0.06, t1: 0.22, to: EG_R, lift: 3 }, { t0: s0, t1: s1, to: LU_R, lift: 6 }, { t0: 1.1, t1: 1.27, to: plant([TH.carry - 12, -3], -10, 8), lift: 4 }, { t0: 1.3, t1: 1.5, to: plant([44, -3], -8, 10), lift: 6 }, { t0: 1.54, t1: 1.74, to: plant([10, -3], -8, 6), lift: 6 }, { t0: 1.78, t1: 1.92, to: R0, lift: 2.5 }] },
    L: { start: L0, moves: [{ t0: 0.1, t1: 0.26, to: EG_L, lift: 2.5 }, { t0: s0, t1: s1 + 0.16, to: LU_L, lift: 7 }, { t0: 1.28, t1: 1.48, to: plant([34, 3], 60, 8), lift: 6 }, { t0: 1.52, t1: 1.72, to: plant([-2, 2], 46, 6), lift: 6 }, { t0: 1.8, t1: 1.94, to: L0, lift: 2.5 }] },
  });
  return {
    long: TH.long,
    strike: TH.strike,
    hit: TH.hit,
    feet,
    keys: [
      [0, {}],
      [0.22, EN_GARDE],
      [0.32, { ...EN_GARDE, px: 0, pz: -6 }],
      [w0, COILED],
      [0.56, tremble(COILED, 1)],
      [0.67, tremble(COILED, 2)],
      [w1, COILED],
      [s0, HIPS_GO],
      [s1, LUNGE],
      [s1 + 0.1, LUNGE_ON],
      [1.08, { ...LUNGE_ON, px: TH.carry + 4 }],
      // (back: the body lifted off the lunge, the blade swept up and round over his head and down: a flourish)
      [1.27, { ...armsTo({ px: TH.carry - 8, py: 0, pz: -6, yaw: 20, twist: 4, pitch: 4, bend: 0, roll: 0, side: 0, faceTurn: -2, faceUp: 4, faceTilt: -3, ...KNEE(40, 0) }, [-6, 16, -4], [14, -6, 6], -20, 10), ...blade(20, 40) }],
      [1.5, { ...armsTo({ px: 40, py: 0, pz: -2, yaw: 8, twist: 2, pitch: 2, bend: -2, roll: 0, side: 0, faceTurn: 2, faceUp: 4, faceTilt: -4, ...KNEE(34, -4) }, [0, 19, -6], [6, -12, 14], -20, 20), ...blade(-40, 30) }],
      [1.74, { ...armsTo({ px: 7, py: 0, pz: -2.5, yaw: -4, twist: 4, pitch: 1, bend: -2, roll: 0, side: 0, faceTurn: 6, faceUp: 3, faceTilt: -4, ...KNEE(30, -8) }, [2, 19, -9], [10, -6, -10], -20, 20), ...blade(-10, -8) }],
      [TH.long, {}],
    ],
  };
}

// =============================================================================================
// STRUCK: knocked back, his coat flying, his arms flung out; his left foot steps back to catch him; and he is up again

export const PC_REEL = 0.5;
function reelPlan(): Plan {
  const JOLT: P = { ...armsTo({ px: -5, pz: -1.5, pitch: -9, bend: -9, faceUp: 18, faceTilt: 6, yaw: -14, twist: 2 }, [-2, 20, 2], [6, -16, -6], -30, 20), ...blade(-30, 10) };
  const feet = footwork(B, { L: { start: L0, moves: [{ t0: 0.05, t1: 0.2, to: plantBy(L0, -6, 1, 6), lift: 3 }, { t0: 0.28, t1: 0.44, to: L0, lift: 2.5 }] } });
  return { long: PC_REEL, feet, keys: [[0, {}], [0.08, JOLT], [0.2, { ...JOLT, px: -4, pitch: -4, bend: -3, faceUp: 8 }], [PC_REEL, {}]] };
}

// =============================================================================================
// THE DART (a burst across the floor): a turning leap, a whole turn in the air, his coat flung out round him. The game
// carries him while he is in the air (`DART.air`), `DART.carry` tiles: here he leaps and lands where he took off.

export const DART = { long: 0.8, air: [0.17, 0.6] as const, carry: 4 } as const;
function dartPlan(): Plan {
  const up = (z: number, yaw: number, body: P = {}): P => ({ pz: z, yaw: R.yaw + yaw, ...body });
  const keys: [number, P][] = [
    [0, {}],
    // (gathered: sunk, the arms drawn in, the blade along his forearm)
    [0.14, { ...up(-5, -20, { twist: -10, bend: 6, pitch: 4, faceTurn: 20 }), ...hands([6, 9, -14], [9, -6, -12], -20, 20), ...blade(R.wAz - 20, -10) }],
    // (in the air: a whole turn to his left, the arms open and the rapier out at his side, then closing in as he comes round)
    [0.26, { ...up(9, 60, { twist: 10, bend: -4, pitch: 0, faceTurn: -30 }), ...hands([2, 18, -4], [4, -18, -4], -40, 40), ...blade(R.wAz - 60 + 60, 0) }],
    [0.4, { ...up(13, 200, { twist: 14, bend: -6, faceTurn: -40 }), ...hands([3, 17, 0], [3, -17, 0], -40, 40), ...blade(R.wAz - 60 + 200, 4) }],
    [0.54, { ...up(6, 330, { twist: 6, bend: -2, faceTurn: 10 }), ...hands([4, 14, -8], [8, -10, -12], -30, 30), ...blade(R.wAz - 30 + 330, -6) }],
    // (down: onto the ball of his right foot, sinking into it, and up)
    [0.62, { ...up(-4, 355, { twist: 4, bend: 4, pitch: 3 }), ...hands([4, 16, -10], [11, -5, -16], -24, 22), ...blade(R.wAz + 355, -14) }],
    [DART.long, { yaw: R.yaw + 360, wAz: R.wAz + 360 }],
  ];
  const [a0, a1] = DART.air;
  const feet = footwork(B, {
    R: { start: R0, moves: [{ t0: 0.04, t1: 0.14, to: { ...R0, pitch: 18 } }, { t0: a0, t1: a1, to: { ...R0, turn: R0.turn + 360, pitch: 12 }, lift: 16, about: [0, 0] }, { t0: 0.66, t1: 0.76, to: { ...R0, turn: R0.turn + 360 } }] },
    L: { start: L0, moves: [{ t0: 0.04, t1: 0.14, to: { ...L0, pitch: 18 } }, { t0: a0 - 0.02, t1: 0.7, to: { ...L0, turn: L0.turn + 360 }, lift: 20, about: [0, 0] }] },
  });
  return { long: DART.long, keys, feet };
}

// =============================================================================================
// THE DANCE: a deep bow, his left hand held out to you (held: the warning); up with a flourish of the rapier over his head
// (two frames, smeared): the ring of masked partners rises round you. Then THE WALTZ: away round the arena, turning and
// turning, nobody in his arms; the game carries him round his arc at `WALTZ.pace`.

export const PC_DANCE = { long: 1.5, warn: [0.45, 23 / FPS] as const, strike: [24 / FPS, 26 / FPS] as const, hit: 26 / FPS } as const;
const DN = PC_DANCE;
const BOW_BODY: P = { px: -3, pz: -9, yaw: -14, twist: 2, pitch: 12, bend: 44, roll: 0, side: 0, faceTurn: 6, faceUp: 30, faceTilt: -6, ...KNEE(40, -14) };
const BOW: P = { ...armsTo(BOW_BODY, [19, 5, -14], [2, -22, -6], -10, 30), ...blade(-90, -8) };
const BOW_HIPS: P = { ...BOW, pitch: 2, bend: 54, pz: -8 };
const FLOURISH_BODY: P = { px: 0, pz: 0.5, yaw: -6, twist: 6, pitch: -3, bend: -8, roll: 0, side: 0, faceTurn: 4, faceUp: 6, faceTilt: -4, ...KNEE(24, -8) };
const FLOURISH: P = { ...armsTo(FLOURISH_BODY, [4, 18, 10], [3, -6, 24], -50, 30), ...blade(30, 72) };
const FLOURISH_ON: P = { ...armsTo({ ...FLOURISH_BODY, bend: -10, pz: 1 }, [2, 19, 12], [-1, -4, 25], -50, 30), ...blade(70, 76) };
function dancePlan(): Plan {
  const [w0, w1] = DN.warn;
  const [s0, s1] = DN.strike;
  const back = plant([-15, -6], -24, 0);
  const feet = footwork(B, {
    R: { start: R0, moves: [{ t0: 0.08, t1: 0.3, to: back, lift: 2.5 }, { t0: s0, t1: s1 + 0.1, to: { ...back, pitch: 26 } }, { t0: 1.06, t1: 1.3, to: R0, lift: 3 }] },
  });
  return {
    long: DN.long,
    strike: DN.strike,
    hit: DN.hit,
    feet,
    keys: [
      [0, {}],
      [0.24, { ...armsTo({ ...BOW_BODY, bend: 14, pz: -3 }, [14, 10, -6], [8, -18, -4], -14, 24), ...blade(-60, -6) }],
      [w0, BOW],
      [0.6, tremble(BOW, 1, 0.25)],
      [w1, BOW],
      [s0, BOW_HIPS],
      [s1, FLOURISH],
      [s1 + 0.14, FLOURISH_ON],
      [1.2, { ...armsTo({ ...FLOURISH_BODY, bend: -4, pz: 0 }, [4, 19, -2], [8, -12, 6], -30, 20), ...blade(-30, 20) }],
      [DN.long, {}],
    ],
  };
}
/** The waltz: how long, how fast the game carries him (tiles a second), how many times he turns, and when each foot lands. */
export const WALTZ = { long: 1.6, pace: 4.0, turns: 2, steps: 8 } as const;
function waltzPlan(): Plan {
  const T = WALTZ.long;
  const ground = WALTZ.pace * TILE3;
  const spin = (t: number): number => 360 * WALTZ.turns * smooth(0, T, t);
  // (his feet: each lands under its own hip as he turns, a little ahead of it, and is carried back under him while it is
  // down; up, it goes round to its next place)
  const stepT = T / (WALTZ.steps + 1);
  const footAt = (side: 'L' | 'R', t: number): P => {
    const own = side === 'L' ? L0 : R0;
    const sg = side === 'L' ? 0 : 1;
    // its landings: every other step, at these moments
    const lands: number[] = [];
    for (let i = sg; i < WALTZ.steps; i += 2) lands.push(stepT * (i + 1));
    const DOWN = 0.12;
    /** Where a foot lands at moment `tl`: its own place turned with him, a little ahead. */
    const placeAt = (tl: number): Plant => {
      const a = spin(tl) * D;
      const [x, y] = own.at;
      return { at: [x * Math.cos(a) - y * Math.sin(a) + ground * DOWN * 0.5, x * Math.sin(a) + y * Math.cos(a)], turn: own.turn + spin(tl), pitch: 14, on: 'toe' };
    };
    const carried = (p: Plant, tl: number, now: number): Plant => ({ ...p, at: [p.at[0] - ground * (now - tl), p.at[1]] });
    // (at the start both feet are down where they stood, carried back with the floor; at the end down where they will stand)
    const startPl: Plant = { ...own, pitch: 0 };
    const endPl: Plant = { ...own, turn: own.turn + 360 * WALTZ.turns, pitch: 0 };
    const events: { t: number; p: Plant }[] = [{ t: 0, p: startPl }, ...lands.map((tl) => ({ t: tl, p: placeAt(tl) }))];
    // (the last landing: as it ends, where it stands still)
    const tEnd = T - 0.02;
    events.push({ t: tEnd, p: { ...endPl, at: [endPl.at[0] + ground * (T - tEnd), endPl.at[1]] } });
    let i = 0;
    while (i < events.length - 1 && t >= events[i + 1].t) i++;
    const e = events[i];
    const next = events[i + 1];
    const liftAt = i === events.length - 1 ? Infinity : Math.min(e.t + DOWN, next.t - 0.06);
    if (!next || t <= liftAt) return footOn(B, side, carried(e.p, e.t, t));
    // (in the air: from where it lifted to where it lands, round under him)
    const from = carried(e.p, e.t, liftAt);
    const u = clamp01((t - liftAt) / (next.t - liftAt));
    const g = u * u * (3 - 2 * u);
    const at: [number, number] = [from.at[0] + (next.p.at[0] - from.at[0]) * g, from.at[1] + (next.p.at[1] - from.at[1]) * g];
    return footOn(B, side, { at, turn: from.turn + (next.p.turn - from.turn) * g, pitch: 14, on: 'toe' }, 5 * Math.sin(Math.PI * u));
  };
  const keys: [number, P][] = [];
  const N = Math.round(T * FPS);
  for (let i = 0; i <= N; i++) {
    const t = i / FPS;
    const sp = spin(t);
    const k = Math.sin(Math.PI * clamp01(t / T));
    // (the rise and fall of a waltz, once to each step; his arms held round nobody)
    const rise = Math.sin(((t / stepT) * Math.PI)) ** 2;
    keys.push([t, {
      yaw: R.yaw + sp, pz: R.pz - 1 * k + 1.4 * rise * k, pitch: R.pitch + 2 * k, bend: R.bend - 3 * k, twist: R.twist - 4 * k, faceTurn: R.faceTurn + 20 * k, faceUp: R.faceUp + 6 * k, faceTilt: R.faceTilt - 6 * k,
      lhx: R.lhx + (9 - R.lhx) * k, lhy: R.lhy + (13 - R.lhy) * k, lhz: R.lhz + (6 - R.lhz) * k, le: R.le + (-46 - R.le) * k,
      rhx: R.rhx + (12 - R.rhx) * k, rhy: R.rhy + (5 - R.rhy) * k, rhz: R.rhz + (-9 - R.rhz) * k, re: R.re + (34 - R.re) * k,
      wAz: R.wAz + sp + 70 * k, wEl: R.wEl + 14 * k, wRoll: 0,
    }]);
  }
  return { long: T, keys, feet: (t) => ({ ...footAt('L', t), ...footAt('R', t) }) };
}

// =============================================================================================
// MASKS: he whirls round and draws a fan of smiling gilt masks out of his coat; coiled, his arm across him, their eye holes
// glinting (held: the warning); flung backhand (two frames, smeared): they fly spinning across the room in a fan
// (art/prince_fx.ts); his arm carries through and he spins on round to face you again

export const PC_MASKS = { long: 1.85, warn: [0.45, 23 / FPS] as const, strike: [24 / FPS, 26 / FPS] as const, hit: 26 / FPS, n: 5 } as const;
const MK = PC_MASKS;
/** Drawing them: his left hand into his coat at his right breast. */
const DRAW_BODY: P = { px: 0, pz: -2, yaw: 6, twist: 8, pitch: 2, bend: 8, roll: 0, side: 0, faceTurn: -4, faceUp: 2, faceTilt: -4, ...KNEE(24, -12) };
/** Coiled: turned away to his left and leaning back, his left arm swept back and up behind him, the fan of masks held high; the rapier out before him at you. */
const COIL_BODY: P = { px: -3, pz: -5, yaw: 50, twist: 22, pitch: -5, bend: -5, roll: 0, side: -3, faceTurn: -2, faceUp: 4, faceTilt: -6, ...KNEE(60, -6) };
const COIL: P = { ...armsTo(COIL_BODY, [-15, 9, 11], [13, -7, -6], -40, 20), ...blade(0, -6) };
/** His hips come round first, his chest held back. */
const UNCOIL: P = { ...COIL, yaw: 26, twist: 46, px: -2 };
/** Flung: the left arm whipped forward and across him, the masks gone from his hand; the rapier swung out to his right for balance. */
const FLUNG_BODY: P = { px: 3, pz: -5, yaw: -16, twist: -30, pitch: 8, bend: 6, roll: 0, side: 2, faceTurn: 4, faceUp: 4, faceTilt: -4, ...KNEE(30, -14) };
const FLUNG: P = { ...armsTo(FLUNG_BODY, [19, -5, 2], [8, -15, -6], -20, 20), ...blade(-60, -8) };
const FLUNG_ON: P = { ...armsTo({ ...FLUNG_BODY, yaw: -24, twist: -36 }, [16, -10, 0], [6, -16, -7], -20, 20), ...blade(-70, -8) };
/** His turn back round to face you, after the fling: on round to his right a whole turn, his arms and blade kept as they are to his chest. */
function spinBack(): [number, P][] {
  const out: [number, P][] = [];
  const y0 = (FLUNG_ON.yaw as number);
  const t0 = (FLUNG_ON.twist as number);
  const y1 = (R.yaw as number) - 360;
  for (let i = 1; i <= 7; i++) {
    const k = i / 8;
    const t = 1.2 + 0.56 * k;
    const g = k * k * (3 - 2 * k);
    const yaw = y0 + (y1 - y0) * g;
    const twist = t0 + ((R.twist as number) - t0) * g;
    const body: P = { ...FLUNG_BODY, yaw, twist, pz: -5 + 4 * g, pitch: 8 * (1 - g), bend: 6 * (1 - g) + (R.bend as number) * g, faceTurn: 4 * (1 - g) + (R.faceTurn as number) * g };
    // (the arms out either side of him as he spins, the blade out to his right)
    const c = (yaw + twist) * D;
    const toWorld = (v: V3): V3 => [v[0] * Math.cos(c) - v[1] * Math.sin(c), v[0] * Math.sin(c) + v[1] * Math.cos(c), v[2]];
    out.push([t, { ...armsTo(body, toWorld([3, 18, -6 - 2 * g]), toWorld([8, -16, -10]), -30, 20), ...blade(yaw + twist - 40 + 20 * g, -8) }]);
  }
  return out;
}
function masksPlan(): Plan {
  const [w0, w1] = MK.warn;
  const [s0, s1] = MK.strike;
  // (his feet: the left steps back and out as he turns away; the right turns on its ball as he flings, and as he spins on round)
  const feet = footwork(B, {
    R: { start: R0, moves: [{ t0: 0.12, t1: 0.36, to: { ...R0, turn: R0.turn + 30, pitch: 14 } }, { t0: s0 - 0.02, t1: s1 + 0.12, to: { ...R0, turn: R0.turn - 26, pitch: 18 } }, { t0: 1.2, t1: 1.74, to: { ...R0, turn: R0.turn - 360, pitch: 12 } }, { t0: 1.74, t1: 1.82, to: { ...R0, turn: R0.turn - 360 } }] },
    L: { start: L0, moves: [{ t0: 0.1, t1: 0.32, to: plant([-9, 10], L0.turn + 34, 6), lift: 4 }, { t0: 1.2, t1: 1.78, to: { ...L0, turn: L0.turn - 360 }, lift: 6, about: [R0.at[0], R0.at[1]] }] },
  });
  return {
    long: MK.long,
    strike: MK.strike,
    hit: MK.hit,
    feet,
    keys: [
      [0, {}],
      [0.2, { ...armsTo(DRAW_BODY, [7, -6, -9], [11, -8, -12], 10, 20), ...blade(-10, -14) }],
      [w0, COIL],
      [0.6, tremble(COIL, 1, 0.3)],
      [w1, COIL],
      [s0, UNCOIL],
      [s1, FLUNG],
      [s1 + 0.16, FLUNG_ON],
      // (and on round to his right, a whole turn, to face you again)
      ...spinBack(),
      [MK.long, { yaw: R.yaw - 360, wAz: R.wAz - 360 }],
    ],
  };
}

// =============================================================================================
// MIDNIGHT: up onto his toes, the rapier raised over his head and drawn back, its point glinting (held: the warning); thrust
// straight up at the ceiling (two frames, smeared): the great clock strikes, and its chimes roll out across the floor as
// rings (art/prince_fx.ts) while he fights on; he turns once round with it held high, and brings it down in a great arc

export const PC_MIDNIGHT = { long: 2.6, warn: [0.5, 26 / FPS] as const, strike: [27 / FPS, 29 / FPS] as const, hit: 29 / FPS } as const;
const MN = PC_MIDNIGHT;
const RAISED_BODY: P = { px: -1, pz: 2.5, yaw: -4, twist: 4, pitch: -3, bend: -16, roll: 0, side: 3, faceTurn: 4, faceUp: 34, faceTilt: -6, ...KNEE(14, -6) };
const RAISED: P = { ...armsTo(RAISED_BODY, [2, 19, 13], [-8, -2, 17], -40, 70), ...blade(170, 42) };
const RAISED_HIPS: P = { ...RAISED, pitch: 0, bend: -19, pz: 3 };
const STRUCK_UP: P = { ...armsTo({ ...RAISED_BODY, pz: 2.5, bend: -6 }, [4, 22, 6], [2, -3, 25], -40, 40), ...blade(0, 88) };
function midnightPlan(): Plan {
  const [w0, w1] = MN.warn;
  const [s0, s1] = MN.strike;
  const toes = (p: Plant): Plant => ({ ...p, pitch: 30 });
  const feet = footwork(B, {
    R: { start: R0, moves: [{ t0: 0.1, t1: 0.45, to: toes(R0) }, { t0: 1.3, t1: 2.0, to: { ...toes(R0), turn: R0.turn + 360 } }, { t0: 2.2, t1: 2.5, to: { ...R0, turn: R0.turn + 360 } }] },
    L: { start: L0, moves: [{ t0: 0.1, t1: 0.3, to: toes(plant([-4, 4], L0.turn)), lift: 3 }, { t0: 1.3, t1: 2.0, to: { ...toes(plant([-4, 4], L0.turn)), turn: L0.turn + 360 }, lift: 7, about: [R0.at[0], R0.at[1]] }, { t0: 2.2, t1: 2.45, to: { ...L0, turn: L0.turn + 360 }, lift: 3 }] },
  });
  const up = STRUCK_UP;
  return {
    long: MN.long,
    strike: MN.strike,
    hit: MN.hit,
    feet,
    keys: [
      [0, {}],
      [0.26, { ...armsTo({ ...RAISED_BODY, pz: 0.5, bend: -4, faceUp: 10 }, [6, 16, -6], [10, -4, 4], -30, 20), ...blade(0, 80) }],
      [w0, RAISED],
      [0.65, tremble(RAISED, 1, 0.3)],
      [0.78, tremble(RAISED, 2, 0.3)],
      [w1, RAISED],
      [s0, RAISED_HIPS],
      [s1, up],
      [1.1, { ...up, pz: 3 }],
      [1.3, { ...up, pz: 2.5 }],
      // (once round to his left on his toes, the blade held high)
      [1.65, { ...up, yaw: R.yaw + 180, wAz: 180, faceUp: 20 }],
      [2.0, { ...up, yaw: R.yaw + 360, wAz: 360, faceUp: 14 }],
      // (and down in a great arc out to his right and before him)
      [2.25, { ...armsTo({ ...RAISED_BODY, yaw: R.yaw + 360, pz: 0, bend: -2, faceUp: 6 }, [4, 20, -6], [4, -20, 4], -30, 30), ...blade(360 - 80, 10) }],
      [MN.long, { yaw: R.yaw + 360, wAz: R.wAz + 360 }],
    ],
  };
}

// =============================================================================================
// HIS DEATH: struck; the mask cracks across and he puts his hand to it; the rapier falls; the mask's halves fall away, and
// under it is nothing but the Hush's grey fog, pouring out; he sinks to his knees as it drains out of him and away up the
// stairs; and his coat, empty, falls in on itself to the floor

export const PC_DIES = { long: 3.6, crack: [0.16, 0.48] as const, drop: 0.36, maskFalls: 0.72, bonnetFalls: 1.45, gone: [1.25, 2.0] as const, kneel: [1.0, 1.62] as const, empty: [1.75, 2.8] as const, drain: [0.72, 3.3] as const } as const;
const DI = PC_DIES;
const TUCK = 50;
const KNEE_Z = B.legR[1] * 1.25;
const DIE_FEET: Record<'L' | 'R', Plant> = { L: plant([-14, 5.5], 30, TUCK), R: plant([-10, -5], -14, TUCK) };
const kneelAt = (lean: number, body: P): P => ({ ...kneelHips(B, R, DIE_FEET, TUCK, KNEE_Z, lean), ...body });
function diesPlan(): Plan {
  const JOLT: P = { ...armsTo({ px: -4, pz: -1, pitch: -9, bend: -10, faceUp: 20, faceTilt: 8, yaw: -10, twist: 4 }, [-2, 19, 2], [8, -15, -6], -30, 20), ...blade(-40, 6) };
  // (his left hand at the mask, over the crack)
  const HAND_TO_MASK: P = { ...armsTo({ px: -6, pz: -2, pitch: -5, bend: -2, faceUp: 16, faceTurn: 10, faceTilt: -8, yaw: -12, twist: 6 }, [6, -3, 13], [8, -14, -12], -30, 20), ...blade(-50, -40) };
  const K0 = kneelAt(6, { ...armsTo({ pitch: 6, bend: 10, faceUp: -10, faceTurn: 0, faceTilt: 8, yaw: R.yaw, twist: 0, roll: 0, side: 0 }, [6, 10, -18], [8, -10, -18], -10, 10), out: 0.6 });
  const K1 = kneelAt(30, { ...armsTo({ pitch: 18, bend: 26, faceUp: -30, faceTurn: 6, faceTilt: 12, yaw: R.yaw, twist: 0, roll: 0, side: 0 }, [8, 9, -16], [10, -9, -16], -10, 10), out: 1 });
  const feet = footwork(B, {
    L: { start: L0, moves: [{ t0: 0.12, t1: 0.34, to: plant(DIE_FEET.L.at, DIE_FEET.L.turn, 0), lift: 3.5 }, { t0: DI.kneel[0] - 0.1, t1: DI.kneel[1] - 0.15, to: DIE_FEET.L }] },
    R: { start: R0, moves: [{ t0: 0.4, t1: 0.62, to: plant(DIE_FEET.R.at, DIE_FEET.R.turn, 0), lift: 2.5 }, { t0: DI.kneel[0] - 0.1, t1: DI.kneel[1] - 0.15, to: DIE_FEET.R }] },
  });
  const midSink = { ...kneelAt(4, { ...armsTo({ pitch: 4, bend: 8, faceUp: -6, yaw: R.yaw, twist: 0 }, [7, 11, -14], [8, -12, -16], -10, 10), out: 0.45 }) };
  return {
    long: DI.long,
    feet,
    keys: [
      [0, {}],
      [0.1, JOLT],
      [0.32, HAND_TO_MASK],
      [0.6, { ...HAND_TO_MASK, px: -7, faceTurn: 18, faceTilt: -12, faceUp: 12, bend: 2 }],
      // (the halves fall; his hand drops; the fog pours out where his face was)
      [DI.maskFalls + 0.12, { ...armsTo({ px: -5, pz: -3, pitch: 0, bend: 4, faceUp: 6, faceTurn: 6, faceTilt: 6, yaw: -10, twist: 4 }, [6, 14, -16], [8, -14, -16], -10, 20), out: 0.3 }],
      [DI.kneel[0], { ...armsTo({ px: -4, pz: -4, pitch: 2, bend: 6, faceUp: 0, faceTurn: 4, faceTilt: 6, yaw: -10, twist: 2 }, [7, 13, -17], [8, -13, -17], -10, 20), out: 0.38 }],
      [1.3, { ...midSink, pz: (midSink.pz as number) + 6 }],
      [DI.kneel[1], K0],
      [2.1, { ...K0, ...kneelAt(18, {}), bend: 18, faceUp: -20 }],
      [2.7, K1],
      [DI.long, K1],
    ],
  };
}

// =============================================================================================
// HIM, AS THE GAME HOLDS A MONSTER

export const PC_NAMES = {
  stand: 'The Prince dances in place',
  walk: 'The dance-step',
  attack: 'The thrust',
  reel: 'The Prince is struck',
  dying: 'The mask cracks',
  setOff: 'He sets off',
  halt: 'He checks',
  dart: 'The dart',
  dance: 'The Dance',
  waltz: 'The waltz',
  masks: 'Masks',
  midnight: 'Midnight',
} as const;

const PLANS: Record<string, Plan> = {
  stand: standPlan(), walk: walkPlan(), attack: thrustPlan(), reel: reelPlan(), dying: diesPlan(), setOff: setOffPlan(), halt: haltPlan(),
  dart: dartPlan(), dance: dancePlan(), waltz: waltzPlan(), masks: masksPlan(), midnight: midnightPlan(),
};
const POSES: Record<string, (t: number) => P> = Object.fromEntries(Object.entries(PLANS).map(([k, p]) => [k, poseFn(p)]));
/** His bones at a moment of a move (by the name the review knows it by). */
export const bonesOf = (move: string, t: number): Skeleton => solve(B, { ...R, ...(POSES[move]?.(Math.max(0, Math.min(PLANS[move].long, t))) ?? {}) } as Posed);
const byName: Record<string, string> = Object.fromEntries(Object.entries(PC_NAMES).map(([k, v]) => [v, k]));
/** The strikes, by move: from the last frame of the wind-up to the frame it lands on. */
export const PC_STRIKES: Readonly<Record<string, readonly [number, number]>> = { attack: TH.strike, dance: DN.strike, masks: MK.strike, midnight: MN.strike };
const WARNS: Readonly<Record<string, readonly [number, number]>> = { attack: TH.warn, dance: DN.warn, masks: MK.warn, midnight: MN.warn };
/** Whether a frame of a move shows its strike's smear: from the frame after its wind-up ends to the frame after it lands (thinning then). */
export function smearedAt(move: string, t: number): boolean {
  const s = PC_STRIKES[move];
  return !!s && t > s[0] + 1e-6 && t <= s[1] + FR + 1e-6;
}
/** The end he strikes with, by move: the rapier's point; in Masks, his left hand with the fan in it. */
function tipOf(move: string, s: Skeleton): V3 | null {
  if (move === 'masks') return s.handL;
  if (move === 'attack' || move === 'dance' || move === 'midnight') return rapierOf(s).tip;
  return null;
}
/** THE SMEAR: after-images of what strikes, along the way it has come since its wind-up ended. */
function smearOf(move: string, t: number): V3[][] | null {
  if (!smearedAt(move, t)) return null;
  const [s0, s1] = PC_STRIKES[move];
  const to = Math.min(t, s1);
  const out: V3[][] = [];
  const n = 8;
  const us = Array.from({ length: n + 1 }, (_, i) => s0 - FR * 0.4 + ((to - (s0 - FR * 0.4)) * i) / n);
  const sks = us.map((u) => bonesOf(move, u));
  if (move === 'attack') {
    // (his whole body flung forward: streaks along the way his head, his shoulders, his hips and his knees have come, dimmest)
    for (const at of [(s: Skeleton) => add(s.head, [0, 0, 3]), (s: Skeleton) => s.neck, (s: Skeleton) => s.ribs, (s: Skeleton) => s.pelvis, (s: Skeleton) => s.kneeL, (s: Skeleton) => s.kneeR, (s: Skeleton) => s.shoulderL]) out.push(sks.map(at));
  }
  sks.forEach((s) => {
    if (move === 'masks') {
      out.push([s.elbowL, s.handL, add(s.handL, mul(norm(sub(s.handL, s.elbowL)), 5))]);
      return;
    }
    const r = rapierOf(s);
    out.push([r.guard, lerp3(r.guard, r.tip, 0.5), r.tip]);
  });
  // (and after it has landed, thinned: the oldest gone)
  return t > s1 + 1e-6 ? out.slice(Math.floor(out.length / 2)) : out;
}
/** How his coat flies out as he turns: from how fast his hips are turning now. */
function twirlOf(move: string, t: number): { k: number; trail: number } {
  const f = POSES[move];
  if (!f || move === 'dying') return { k: 0, trail: 0 };
  const yawAt = (u: number): number => ((f(Math.max(0, Math.min(PLANS[move].long, u))).yaw as number) ?? R.yaw);
  // (the coat takes a moment to fly out and a moment to settle: the turn of the last fifth of a second, the newest most)
  let w = 0;
  let sum = 0;
  for (let j = 0; j < 6; j++) {
    const k = 1 - j / 7;
    w += k * (yawAt(t - j * FR) - yawAt(t - (j + 1) * FR)) / FR;
    sum += k;
  }
  w /= sum * 900;
  return { k: Math.min(0.7, Math.abs(w) * 1.3), trail: Math.max(-35, Math.min(35, w * 40)) };
}
/** A PUFF OF THE HUSH'S FOG, as grains: a soft round of pale grey `r` across at `c`, its middle palest, its edge dithered away; thinning as it ages (`age` 0 to 1). */
function puff(out: [V3, string, number][], c: V3, r: number, age: number, seed: number): void {
  const step = 0.9;
  const n = Math.ceil(r / step);
  for (let i = -n; i <= n; i++) for (let j = -n; j <= n; j++) for (let k = -n; k <= n; k++) {
    const d = Math.hypot(i, j, k) * step / r;
    if (d > 1) continue;
    // (thinner toward its edge and as it ages)
    if (hash(i * 7 + seed, j * 13 + k * 31, 7741) < d * 0.8 + age * 0.75 - 0.15) continue;
    const col = d < 0.35 && age < 0.5 ? BREATH_PALE : d < 0.7 && age < 0.75 ? FOG[4] : FOG[3];
    out.push([add(c, [i * step, j * step, k * step]), col, 1]);
  }
}
/** WHAT IS LAID AFTER HIS EDGE IN HIS MOVES: the point glinting pink through each warning (the masks' eye holes in his fan); the fog pouring out of him as he dies, and away. */
function moreOf(move: string, m: Moment): [V3, string, number][] {
  const out: [V3, string, number][] = [];
  const t = m.t;
  const s = m.s;
  const warn = WARNS[move];
  if (warn && t >= warn[0] - 0.12 && t <= warn[1] + 0.04) {
    const tick = Math.floor(t * 15);
    if (move === 'masks') {
      // (the fan's eye holes, glinting by turns)
      for (let i = 0; i < MK.n; i++) {
        if ((i + tick) % 2) continue;
        out.push([add(s.handL, [0, 0, 1.5 + (i % 3)]), i % 3 ? FLAME[3] : FLAME[2], 1]);
      }
    } else {
      // (the light running down the blade to its point, and burning there)
      const r = rapierOf(s);
      for (let i = 0; i <= 8; i++) {
        const k = i / 8;
        if ((i + tick) % 3 !== 0 && i < 7) continue;
        out.push([lerp3(r.guard, r.tip, k), i >= 7 ? FLAME[4] : FLAME[3], i === 8 ? 2 : 1]);
      }
    }
  }
  if (move === 'dying') {
    const crackK = smooth(DI.crack[0], DI.crack[1], t);
    const face = add(s.head, mul(s.face[0], B.headR[0] * 1.05));
    if (crackK > 0.05 && t < DI.maskFalls) {
      // (fog seeping out of the crack, in threads)
      for (let i = 0; i < 6; i++) {
        const life = (t * 1.6 + hashOf(i, 1)) % 1;
        puff(out, add(face, [Math.sin(i * 2.1) * 1.5 - life * 3, Math.cos(i * 1.7) * 1.5, life * 8 - 1]), 0.6 + 0.8 * life, life, i);
      }
    }
    // (as the halves fall away: the fog bursts out where his face was, in a great puff)
    if (t >= DI.maskFalls && t < DI.maskFalls + 0.45) {
      const k = (t - DI.maskFalls) / 0.45;
      for (let i = 0; i < 7; i++) {
        const a = (i / 7) * TAU;
        puff(out, add(face, add(mul(s.face[0], 3 + 9 * k), [Math.cos(a) * 6 * k, Math.sin(a) * 6 * k, 3 * k + Math.sin(a) * 4 * k])), 2.5 + 3 * k, k, 90 + i);
      }
    }
    const [d0, d1] = DI.drain;
    if (t >= d0 && t <= d1) {
      // THE HUSH DRAINING OUT OF HIM: billowing out of where his face was and out of his collar, rising and streaming away up
      // and back (up the stairs), each puff swelling and thinning as it goes, fewer and fewer, gone
      const k = (t - d0) / (d1 - d0);
      const DRAIN = norm([-0.75, 0.4, 0.55]);
      const n = 44;
      for (let i = 0; i < n; i++) {
        const own = hashOf(i, 2);
        // (each puff leaves him in its turn, most at first; by the end none are left to leave)
        const born = Math.sqrt(own) * 0.78;
        const age = (k - born) * 3.0;
        if (age < 0 || age > 1) continue;
        const src = i % 4 === 3 ? s.neck : face;
        const drift = 4 + 52 * age * (0.7 + 0.5 * hashOf(i, 3));
        const swirl: V3 = [Math.sin(i * 1.3 + t * 3) * 4 * age, Math.cos(i * 2.1 + t * 2.4) * 4 * age, 0];
        puff(out, add(add(src, mul(DRAIN, drift)), swirl), 2.2 + 4.2 * age, age, i);
      }
    }
  }
  return out;
}
const SAY: PrinceSay = {
  armed: () => true,
  twirl: (m) => twirlOf(byName[m.move ?? ''] ?? '', m.t),
  smear: (m) => smearOf(byName[m.move ?? ''] ?? '', m.t),
  more: (m) => moreOf(byName[m.move ?? ''] ?? '', m),
  fan: (m) => {
    if (byName[m.move ?? ''] !== 'masks') return null;
    const t = m.t;
    if (t < 0.16 || t > MK.hit + 1e-6) return null;
    return { n: MK.n, open: smooth(0.16, MK.warn[0], t) };
  },
  crack: (m) => (m.dying ? smooth(DI.crack[0], DI.crack[1], m.t) : 0),
  unmasked: (m) => !!m.dying && m.t >= DI.maskFalls,
  empty: (m) => (m.dying ? smooth(DI.empty[0], DI.empty[1], m.t) : 0),
  gone: (m) => (m.dying ? smooth(DI.gone[0], DI.gone[1], m.t) : 0),
};
/** How the pieces of him fall as he dies (art/new_mobs3.ts `fallApart`): the rapier first, then the mask's halves, then his bonnet. */
function fallOf(piece: string): Fall | null {
  const faceAt = (t: number): V3 => bonesOf('dying', t).face[0];
  if (piece === 'rapier') return { from: DI.drop, to: [10, -10], spin: 30, lay: 'axis', hop: 1.2 };
  if (piece === 'maskA') return { from: DI.maskFalls, to: [17, 9], spin: 50, lay: 'flat', up: faceAt(DI.maskFalls), hop: 0.8 };
  if (piece === 'maskB') return { from: DI.maskFalls + 0.05, to: [21, -9], spin: -70, lay: 'flat', up: faceAt(DI.maskFalls + 0.05), hop: 0.6 };
  if (piece === 'bonnet' || piece === 'plume') return { from: DI.bonnetFalls, to: [-12, 8], spin: 60, lay: 'axis', hop: 0.5 };
  return null;
}

function princeMob(): Mob {
  const paint = princePainter(SAY);
  const mv = (name: string, motion: Motion, more: Partial<MobMove> = {}): MobMove => ({ name, motion, rest: R, ...more });
  const glow = (warn: readonly [number, number]) => (t: number): number => (t >= warn[0] && t <= warn[1] ? 1 : 0);
  return {
    id: 'prince',
    name: 'The Prince',
    size: 'a boss: a head taller than the knight',
    build: B,
    stand: mv(PC_NAMES.stand, motionOf(PLANS.stand)),
    attack: mv(PC_NAMES.attack, motionOf(PLANS.attack), { glint: glow(TH.warn) }),
    more: {
      setOff: mv(PC_NAMES.setOff, motionOf(PLANS.setOff)),
      halt: mv(PC_NAMES.halt, motionOf(PLANS.halt)),
      dart: mv(PC_NAMES.dart, motionOf(PLANS.dart)),
      dance: mv(PC_NAMES.dance, motionOf(PLANS.dance), { glint: glow(DN.warn) }),
      waltz: mv(PC_NAMES.waltz, motionOf(PLANS.waltz), { ground: WALTZ.pace * TILE3 }),
      masks: mv(PC_NAMES.masks, motionOf(PLANS.masks), { glint: glow(MK.warn) }),
      midnight: mv(PC_NAMES.midnight, motionOf(PLANS.midnight), { glint: glow(MN.warn) }),
    },
    idleFrames: PC_STAND.frames,
    idleFps: PC_STAND.fps,
    walk: mv(PC_NAMES.walk, motionOf(PLANS.walk), { period: WALK_LONG, ground: PC_PACE * TILE3 }),
    walkFrames: PC_WALK.frames,
    walkFps: PC_WALK.fps,
    pace: PC_PACE,
    reel: mv(PC_NAMES.reel, motionOf(PLANS.reel)),
    reelTime: PC_REEL,
    hit: TH.hit,
    warn: TH.warn[1] - TH.warn[0],
    dieTime: DI.long,
    dying: mv(PC_NAMES.dying, motionOf(PLANS.dying)),
    aura: { x: PC_CANVAS.ax, y: PC_CANVAS.ay - 50, r: 46, color: '#8a7aa0', a: 0.08 },
    shadow: 14,
    canvas: PC_CANVAS,
    trueBack: true,
    bits: paint.bits,
    grains: paint.grains,
    fall: fallOf,
  };
}
export const PRINCE = princeMob();
export function makePrinceArt3(mob: Mob = PRINCE): ActorArt {
  return { front: mobSet(mob, 'front', mob.pace), back: mobSet(mob, 'back', mob.pace) };
}

// =============================================================================================
// HIM AS THE CHECKS SEE HIM (art/boss_checks.ts)

const len3 = (v: V3): number => Math.hypot(v[0], v[1], v[2]);
export function princeSolids(s: Skeleton): { limbs: CheckLimb[]; lumps: CheckLump[] } {
  const [rH, rK, rA] = B.legR;
  const [r0, r1] = B.armR;
  const limbs: CheckLimb[] = [];
  for (const side of ['L', 'R'] as const) {
    const L = side === 'L';
    limbs.push(
      { name: `leg${side}`, a: L ? s.hipL : s.hipR, b: L ? s.kneeL : s.kneeR, r: rH * 1.05 },
      { name: `shin${side}`, a: L ? s.kneeL : s.kneeR, b: L ? s.ankleL : s.ankleR, r: Math.max(rK, rA) * 1.18 },
      { name: `upper${side}`, a: L ? s.shoulderL : s.shoulderR, b: L ? s.elbowL : s.elbowR, r: r0 * 1.2 },
      { name: `fore${side}`, a: L ? s.elbowL : s.elbowR, b: L ? s.handL : s.handR, r: r1 * 1.1 },
    );
  }
  limbs.push({ name: 'neck', a: s.neck, b: lerp3(s.neck, s.head, 0.5), r: 2.4 });
  const waistC = add(s.pelvis, mul(s.hips[2], B.waist * 0.55));
  const lumps: CheckLump[] = [
    { name: 'head', c: s.head, rot: s.face, h: [B.headR[0] * 1.1, B.headR[1] * 1.1, B.headR[2] * 1.05] },
    { name: 'chest', c: lerp3(s.ribs, s.neck, 0.3), rot: s.chest, h: [B.ribDeep + 2.2, B.ribHalf + 2.4, len3(sub(s.neck, s.ribs)) * 0.55] },
    { name: 'belly', c: lerp3(waistC, s.ribs, 0.45), rot: s.belly, h: [B.waistDeep + 2.4, B.waistHalf + 2.4, Math.max(3, len3(sub(s.ribs, waistC)) * 0.6)] },
    { name: 'hips', c: add(s.pelvis, mul(s.hips[2], B.waist * 0.2)), rot: s.hips, h: [B.pelvisDeep + 2.6, B.pelvisHalf + 2.2, B.waist * 0.75] },
  ];
  return { limbs, lumps };
}
const SHAPE_MOVES = ['stand', 'walk', 'attack', 'reel', 'dying', 'dart', 'dance', 'waltz', 'masks', 'midnight', 'setOff', 'halt'];
export const PC_SHAPE: BossShape = {
  body: princeSolids,
  tip: (move, _t, s) => tipOf(move, s),
  things: (move, t, s) => {
    if (move === 'dying' && t >= DI.drop) return [];
    const r = rapierOf(s);
    const pts: V3[] = [];
    for (let i = 0; i <= 10; i++) pts.push(lerp3(r.guard, r.tip, i / 10));
    return [{ name: 'rapier', pts, r: 0.9, may: ['foreR'] }];
  },
  strikes: PC_STRIKES,
  smeared: smearedAt,
  handovers: [
    ...SHAPE_MOVES.filter((m) => !['stand', 'walk', 'waltz', 'setOff', 'halt'].includes(m)).flatMap((m): Handover[] => (m === 'dying' ? [{ from: 'stand', at: 0, to: m, toAt: 0 }] : [{ from: 'stand', at: 0, to: m, toAt: 0 }, { from: m, at: 'end', to: 'stand', toAt: 0 }])),
    // (into his dance-step and out of it as the other bosses go: setting off from his stand into its first frame; and out of
    // it at the end of a round, its first frame, into his check and so to his stand)
    { from: 'stand', at: 0, to: 'setOff', toAt: 0 },
    { from: 'setOff', at: 'end', to: 'walk', toAt: 0 },
    { from: 'walk', at: 0, to: 'halt', toAt: 0 },
    { from: 'halt', at: 'end', to: 'stand', toAt: 0 },
    { from: 'dance', at: 'end', to: 'waltz', toAt: 0 },
    { from: 'waltz', at: 'end', to: 'stand', toAt: 0 },
  ],
};
void byName;
