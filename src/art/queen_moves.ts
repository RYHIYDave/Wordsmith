// FLOOR 18'S BOSS, THE QUEEN: HER MOVES (the art chat, 29 Oct 2026). A MOCK-UP: NOT IN THE GAME, behind QUEEN_ON
// (art/queen.ts, off). Her look and his brief are art/queen.ts; what her moves leave in the hall, art/queen_fx.ts.
//
// His pick for how she moves: “Cold and slow, then sudden (Recommended)”. So her glide is slow and stately, but every
// blow and every step through the glass is sudden. And his rulebook's Movement 9 (24 Oct: “Like the wind up and wind
// down are big but the actual punch is lightning quick”; for enemies, 28 Oct: “Start from now on, but every enemy is
// going to need that change eventually.  And bigger AOE to compensate for the extra time the player gets to evade”):
// every blow of hers winds up big and is held (the warning), strikes in two frames smeared with its after-images, and
// winds down big; and what each blow covers is on the scale of the arena (TILE3 a tile; a boss arena an ellipse about
// 17 by 20 tiles). His words of 28 Oct, of the Princess's first moves: “It’s all too slow and too narrow and too small.
// I could dodge anything you’ve put in these moves with my eyes closed”.
//
// HER MOVES:
//   HER STAND: cold and still, but breathing; rising and sinking a hair on the air; her head turning as if she listened
//     to her mirror; her comb low at her side, its teeth down.
//   THE GLIDE (her walk): slow and stately, upright, a little lean into her way; no steps, her feet never down; her
//     mantle's train and her sleeves' points trailing.
//   THE COMB (her basic): she rises, turns away and draws her comb up high over her right shoulder, its teeth glinting
//     the enemy's pink, her left hand reaching out at you (THE WARNING, held); her hips turn first; THE STAB: in two
//     frames she lunges more than a tile and a half and drives the comb out at full reach, its teeth two tiles and more
//     from where she stood, smeared; it carries on and a cloud of violet poison bursts where it struck
//     (art/queen_fx.ts); she draws herself up again where she has come to (the game moves her there).
//   LOOKING GLASS (two moves): GLASS IN: a tall mirror gathers out of flying shards beside her, she turns to it and lays
//     her fingers on its glass, the glass rippling (the warning, held); in two frames she is through it, smeared, a
//     ripple bursting across it; the glass settles and the mirror bursts back into shards. GLASS OUT (the game puts her
//     far across the arena, behind you): a mirror gathers out of its shards, its glass stirs and her pink eyes show in it
//     (the warning, held); in two frames she is out of it, her comb raised, smeared; she glides on, turns to you, and the
//     mirror behind her bursts into shards.
//   REFLECTIONS: she lifts her left hand high to the mirrors, its fingers spread, cold glints gathering round it (the
//     warning, held); then sweeps it down at you (two frames, smeared): copies of you step out of the mirrors (another
//     helper's, mockup/reflections; where they come out, art/queen_fx.ts paints the mirror and its ripple).
//   SHATTER: she flings both arms up, rising high on the air, her head thrown back, shards lifting off the floor round
//     her while every mirror round the hall trembles (the warning, long, held); then slams her arms down and out (two
//     frames, smeared): every mirror bursts at once, a storm of glass flying across the hall in lanes, the gaps between
//     them safe to stand in (art/queen_fx.ts).
//   STRUCK: jolted back, her arms flung out, her head thrown back.
//   HER DEATH: struck, her hand goes to her crown and it cracks; the Hush leaves her in a grey breath; her comb falls
//     from her hand; she sinks out of the air to her knees while the spikes of her crown snap one by one and fall; she
//     sits back on her heels, her head bowed, the pink gone from her eyes; and her mirror at the end of the hall cracks
//     across and, for the first time, tells the truth (art/queen_fx.ts).
//
// By his rulebook: every move through every check the bosses have (art/boss_checks.ts), from in front and behind, and
// the lightning strikes as his Movement 9 asks.
//   test: tsx --test tests/queen.test.ts

import type { ActorArt } from './actor_types';
import type { BossShape, CheckLimb, CheckLump, CheckThing, Handover } from './boss_checks';
import { footOn, kneelHips } from './bosses3';
import type { Plant } from './bosses3';
import { hash } from './kit';
import { FLAME } from './mkit';
import { TILE3, mobSet } from './new_mobs3';
import type { Mob, MobMove, Moment } from './new_mobs3';
import { QN_CANVAS, QN_GLASS, QN_MIRROR, QN_POISON, QN_STAND_LONG, QUEEN_BODY, QUEEN_REST, combAt, queenPainter, queenStand } from './queen';
import type { Glass, QueenSay } from './queen';
import { add, lerp3, mul, solve, sub } from './skeleton';
import type { Bones, Key3, Motion, Posed, Skeleton, V3 } from './skeleton';

type P = Partial<Bones>;
const B = QUEEN_BODY;
const R = QUEEN_REST;
const FPS = 30;
const FR = 1 / FPS;
const clamp01 = (v: number): number => Math.max(0, Math.min(1, v));
const hashOf = (i: number, j: number): number => hash(i, j, 7731);
const smooth = (a: number, b: number, t: number): number => {
  const u = clamp01((t - a) / (b - a));
  return u * u * (3 - 2 * u);
};

/** A smooth curve through keyed values (monotone cubic: never overshooting a key), as the Princess's moves have it. */
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

// =============================================================================================
// A MOVE THROUGH KEY POSES: every field through its keys smoothly (its speed carried through each key, not stopped at
// it), but straight through a lightning strike; sampled on every frame the game shows

interface Plan {
  long: number;
  keys: ReadonlyArray<readonly [number, P]>;
  /** The strike: from the last frame of its wind-up to the frame it lands on. */
  strike?: readonly [number, number];
  hit?: number;
  /** Her feet put down where the keys say (on her knees); if not, they float with her, carried and turned as her hips are (she glides: her feet are never down). */
  feetSaid?: boolean;
}
/** HER FEET FLOAT WITH HER: under her gown, carried as her hips are carried (`px`, `py`) and turned as they turn (`yaw`), as they hang at rest. */
function floated(out: Record<string, number>): void {
  const D = Math.PI / 180;
  const c = Math.cos(out.yaw * D);
  const sn = Math.sin(out.yaw * D);
  for (const [side, sg] of [['l', 1], ['r', -1]] as const) {
    const x0 = out[`${side}fx`];
    const y0 = out[`${side}fy`] + sg * B.stance;
    out[`${side}fx`] = c * x0 - sn * y0 + out.px;
    out[`${side}fy`] = sn * x0 + c * y0 - sg * B.stance + out.py;
    out[`${side}ft`] += out.yaw;
  }
}
function poseFn(plan: Plan): (t: number) => P {
  const full = plan.keys.map(([t, p]) => [t, { ...R, ...p } as Record<string, number>] as const);
  const fields = Object.keys(full[0][1]).filter((k) => k !== 'lhIn' && k !== 'rhIn' && typeof full[0][1][k] === 'number');
  const tracks = new Map(fields.map((k) => [k, track(full.map(([t, p]) => [t, p[k]] as const))]));
  const st = plan.strike;
  const at = (t: number): Record<string, number> | undefined => full.find(([kt]) => Math.abs(kt - t) < 1e-6)?.[1];
  const a0 = st ? at(st[0]) : undefined;
  const a1 = st ? at(st[1]) : undefined;
  return (t) => {
    const out: Record<string, number> = { lhIn: full[0][1].lhIn, rhIn: full[0][1].rhIn };
    if (st && a0 && a1 && t > st[0] && t < st[1]) {
      const k = (t - st[0]) / (st[1] - st[0]);
      for (const f of fields) out[f] = a0[f] + (a1[f] - a0[f]) * k;
    } else for (const f of fields) out[f] = (tracks.get(f) as (t: number) => number)(t);
    if (!plan.feetSaid) floated(out);
    return out as P;
  };
}
function motionOf(plan: Plan): Motion {
  const f = poseFn(plan);
  const keys: Key3[] = [];
  const n = Math.round(plan.long * FPS);
  for (let i = 0; i <= n; i++) keys.push({ at: i / FPS, pose: f(i / FPS), ease: 'lin' });
  return plan.hit !== undefined ? { keys, hit: plan.hit } : { keys };
}
/** Her hands as the bones place them: each from its own shoulder along her own forward, left and up (`lhIn` 1). */
const hands = (l: V3, r: V3, le: number, re: number): P => ({ lhIn: 1, lhx: l[0], lhy: l[1], lhz: l[2], le, rhIn: 1, rhx: r[0], rhy: r[1], rhz: r[2], re });
const L0: V3 = [R.lhx, R.lhy, R.lhz];
const R0: V3 = [R.rhx, R.rhy, R.rhz];

// =============================================================================================
// THE GLIDE (her walk): slow and stately (his pick, “Cold and slow, then sudden (Recommended)”): upright, a little lean
// into her way, bobbing a hair on the air, her train and her sleeves' points trailing; no steps.

export const QN_GLIDE = { frames: 16, fps: 12 };
/** Her speed gliding, tiles a second: slower than you walk (the knight 2.5), stately; what is sudden in her is the glass. */
export const QN_PACE = 2.0;
function glidePlan(): Plan {
  const T = QN_GLIDE.frames / QN_GLIDE.fps;
  const keys: [number, P][] = [];
  for (let i = 0; i <= 16; i++) {
    const t = (i / 16) * T;
    const a = (t / T) * Math.PI * 2;
    keys.push([t, {
      pz: R.pz + 0.8 + 0.5 * Math.sin(a), pitch: 3, bend: 1 + 0.5 * Math.sin(a + 0.8), roll: 0.8 * Math.sin(a), side: 0.5 * Math.sin(a), faceUp: 4, faceTurn: -3 + 3 * Math.sin(a * 0.5), faceTilt: -2,
      ...hands([L0[0] - 0.4 - 0.4 * Math.cos(a), L0[1], L0[2] + 0.3 * Math.sin(a)], [R0[0] - 1.2 + 0.4 * Math.sin(a), R0[1] - 0.6, R0[2] + 0.4], R.le, R.re),
      lfz: R.lfz + 0.8 + 0.5 * Math.sin(a), rfz: R.rfz + 0.8 + 0.5 * Math.sin(a), lfx: R.lfx - 2, rfx: R.rfx - 2,
    }]);
  }
  return { long: T, keys };
}

// =============================================================================================
// THE COMB (her basic): a stab, lunging. Its warning big and held; the stab two frames; carried on; drawn up again.

/** How far she lunges with it (her own lengths): a tile and a half, and a little more as she carries on; the game moves her there as it ends. */
export const QN_LUNGE = 1.6 * TILE3;
export const QN_COMB = { long: 1.5, warn: [0.36, 0.7] as const, strike: [22 / FPS, 24 / FPS] as const, hit: 24 / FPS, lunge: QN_LUNGE } as const;
/** Wound up: risen, turned away to her right, leaning back; the comb drawn up high over her right shoulder, its teeth toward you; her left hand reaching out at you. */
const COCKED: P = { yaw: -30, twist: -18, pitch: -8, bend: -11, pz: R.pz + 4.2, faceTurn: 4, faceUp: 4, faceTilt: 5, ...hands([16, 5, 0], [-8, -6, 16], -20, 70) };
const HIPS_FIRST: P = { ...COCKED, yaw: -14, twist: -34, pitch: -5 };
/** Stabbed: lunged, low and long, her arm and the comb out at full reach before her, her left arm flung back. */
const STABBED: P = { px: QN_LUNGE * 0.84, yaw: 14, twist: 6, pitch: 10, bend: 11, pz: R.pz - 0.6, faceTurn: -4, faceUp: -6, faceTilt: 2, ...hands([-7, 11, -15], [24, 2, -7], -30, -8) };
const STAB_ON: P = { ...STABBED, px: QN_LUNGE * 0.96, yaw: 18, twist: 8, pitch: 12, bend: 13, ...hands([-8, 12, -16], [24.5, 3, -10], -32, -10) };
function combPlan(): Plan {
  const [w0, w1] = QN_COMB.warn;
  const [s0, s1] = QN_COMB.strike;
  return {
    long: QN_COMB.long,
    strike: QN_COMB.strike,
    hit: QN_COMB.hit,
    keys: [
      [0, {}],
      [0.18, { yaw: -14, twist: -8, pitch: -4, bend: -5, pz: R.pz + 2, faceTurn: 2, ...hands([11, 3, -9], [-3, -7, -2], -18, 44) }],
      [w0, COCKED],
      [0.53, { ...COCKED, pz: (COCKED.pz as number) + 0.35, ...hands([16.2, 5, 0.3], [-8.2, -6.1, 16.3], -20, 70) }],
      [w1, COCKED],
      [s0, HIPS_FIRST],
      [s1, STABBED],
      [1.0, STAB_ON],
      [1.24, { px: QN_LUNGE, yaw: 6, twist: 2, pitch: 3, bend: 3, pz: R.pz + 0.4, faceTurn: -6, faceUp: 2, ...hands([5, 4, -16], [9, -3, -18], -16, 14) }],
      [QN_COMB.long, { px: QN_LUNGE }],
    ],
  };
}

// =============================================================================================
// LOOKING GLASS: into one mirror (GLASS IN) and out of another (GLASS OUT). Her looking-glass stands at her left, its
// glass facing her: from in front and from behind alike, she goes away from the eye into it, and it hides what of her
// has gone through.

/** Where her looking-glass stands (her own lengths): its glass this far to her left, facing her; as floor 18's tall wall mirror, its glass 58 across, 84 to its arch, the arch 22 higher. */
export const QN_GLASS_AT = { y: 19, half: 29, tall: 106, rise: 22 } as const;
export const QN_IN = { long: 1.4, form: [0, 0.42] as const, warn: [0.46, 0.767] as const, strike: [24 / FPS, 26 / FPS] as const, hit: 26 / FPS, gone: [1.02, 1.38] as const } as const;
export const QN_OUT = { long: 1.5, form: [0, 0.36] as const, warn: [0.38, 0.6] as const, strike: [18 / FPS, 20 / FPS] as const, hit: 20 / FPS, gone: [0.95, 1.34] as const } as const;
/** How far through the glass she goes (her own lengths, along her left): through it, and on out of sight. */
const THROUGH = 48;
/** Facing her glass, her fingers on it. */
const AT_GLASS: P = { yaw: 84, twist: 2, pitch: 1, bend: 1, py: 2, faceTurn: 88, faceUp: 3, faceTilt: -2, ...hands([4, 13, -3], [4.4, 1.8, -23.8], -40, 12) };
function glassInPlan(): Plan {
  const [w0, w1] = QN_IN.warn;
  const [s0, s1] = QN_IN.strike;
  return {
    long: QN_IN.long,
    strike: QN_IN.strike,
    hit: QN_IN.hit,
    keys: [
      [0, {}],
      [0.22, { yaw: 22, twist: 8, faceTurn: 56, faceUp: 4, py: 0.5, ...hands([7, 6, -12], [4.3, -3.0, -24], -24, 12) }],
      [w0, AT_GLASS],
      [0.62, { ...AT_GLASS, ...hands([4.2, 13.2, -2.8], [4.4, 1.8, -23.8], -40, 12) }],
      [w1, AT_GLASS],
      [s0, { ...AT_GLASS, py: 5, yaw: 86, twist: 0, pitch: 5 }],
      [s1, { ...AT_GLASS, py: THROUGH - 6, yaw: 88, twist: 0, pitch: 9, bend: 4, faceUp: 0, ...hands([5, 15, -2], [3, -1.5, -22], -40, 12) }],
      [1.0, { ...AT_GLASS, py: THROUGH, yaw: 88, twist: 0, pitch: 9, bend: 4, faceUp: 0, ...hands([5, 15.5, -2], [3, -1.8, -22], -40, 12) }],
      [QN_IN.long, { ...AT_GLASS, py: THROUGH + 1, yaw: 88, twist: 0, pitch: 8, bend: 4, faceUp: 0, ...hands([5, 15.5, -2.5], [3, -1.8, -22], -40, 12) }],
    ],
  };
}
/** Coming out of the glass: turned toward you as she comes, her comb up by her shoulder, her left hand before her. */
const COMING: P = { yaw: -84, twist: 8, pitch: 7, bend: 6, faceTurn: -60, faceUp: 0, faceTilt: 2, ...hands([12, 5, -6], [-2, -7, 8], -30, 50) };
function glassOutPlan(): Plan {
  const [s0, s1] = QN_OUT.strike;
  return {
    long: QN_OUT.long,
    strike: QN_OUT.strike,
    hit: QN_OUT.hit,
    keys: [
      [0, { ...COMING, py: THROUGH + 1 }],
      [QN_OUT.warn[0], { ...COMING, py: THROUGH }],
      [s0, { ...COMING, py: THROUGH - 1 }],
      [s1, { ...COMING, py: 9, yaw: -68, twist: 4, pitch: 9, bend: 7, faceTurn: -40 }],
      [0.84, { ...COMING, py: 3, yaw: -42, twist: 2, pitch: 5, bend: 4, faceTurn: -18, ...hands([11, 4, -9], [0, -7, -2], -26, 36) }],
      [1.12, { py: 0.6, yaw: -12, twist: 0, pitch: 1, bend: 0, faceTurn: -8, ...hands([8, 1, -15], [2, -4.5, -20], -16, 16) }],
      [QN_OUT.long, {}],
    ],
  };
}
/** Whether she is through the glass, and not here (none of her painted): after she steps in, and before she steps out. */
export function awayAt(move: string, t: number): boolean {
  if (move === 'glassIn') return t > QN_IN.strike[1] + 1e-6;
  if (move === 'glassOut') return t < QN_OUT.strike[1] - 1e-6;
  return false;
}
/** HER LOOKING-GLASS through the move: gathered out of its shards, rippling as she touches it and as she goes through, burst back into shards. */
export function glassOf(move: string, t: number): Glass | null {
  const at: [number, number] = [0, QN_GLASS_AT.y];
  const base = { at, half: QN_GLASS_AT.half, tall: QN_GLASS_AT.tall, rise: QN_GLASS_AT.rise, t };
  if (move === 'glassIn') {
    const s1 = QN_IN.strike[1];
    if (t >= QN_IN.long - 1e-6) return null;
    return {
      ...base,
      form: smooth(QN_IN.form[0], QN_IN.form[1], t),
      gone: smooth(QN_IN.gone[0], QN_IN.gone[1], t),
      ripples: [[3, 46, t - 0.5], [3, 46, t - 0.66], [0, 42, t - s1 + FR], [0, 42, t - s1 - 0.1]],
    };
  }
  if (move === 'glassOut') {
    const s1 = QN_OUT.strike[1];
    if (t >= QN_OUT.long - 1e-6) return null;
    return {
      ...base,
      form: smooth(QN_OUT.form[0], QN_OUT.form[1], t),
      gone: smooth(QN_OUT.gone[0], QN_OUT.gone[1], t),
      ripples: [[0, 62, t - 0.36], [0, 62, t - 0.5], [0, 44, t - s1 + FR], [0, 44, t - s1 - 0.1]],
    };
  }
  return null;
}

// =============================================================================================
// REFLECTIONS: her left hand lifted high to the mirrors, then swept down at you.

export const QN_REFLECT = { long: 1.8, warn: [0.5, 0.867] as const, strike: [28 / FPS, 30 / FPS] as const, hit: 30 / FPS } as const;
const BECKON: P = { yaw: 16, twist: 8, pitch: -5, bend: -7, pz: R.pz + 3.4, faceTurn: 24, faceUp: 14, faceTilt: -4, ...hands([9, 9, 21], [2, -6, -22], -50, 14) };
const SWEPT: P = { yaw: -10, twist: -4, pitch: 6, bend: 7, pz: R.pz + 1, faceTurn: -4, faceUp: -2, faceTilt: 2, ...hands([20, 5, -3], [1, -7, -21], -26, 14) };
function reflectPlan(): Plan {
  const [w0, w1] = QN_REFLECT.warn;
  const [s0, s1] = QN_REFLECT.strike;
  return {
    long: QN_REFLECT.long,
    strike: QN_REFLECT.strike,
    hit: QN_REFLECT.hit,
    keys: [
      [0, {}],
      [0.25, { yaw: 9, twist: 4, pz: R.pz + 1.6, faceTurn: 14, faceUp: 8, ...hands([9, 7, 4], [R0[0], R0[1] - 1, R0[2]], -40, 12) }],
      [w0, BECKON],
      [0.68, { ...BECKON, pz: (BECKON.pz as number) + 0.35, ...hands([9.2, 9.3, 21.3], [2, -6, -22], -50, 14) }],
      [w1, BECKON],
      [s0, { ...BECKON, yaw: 4, twist: 20 }],
      [s1, SWEPT],
      [1.2, { ...SWEPT, bend: 8, pitch: 7, ...hands([19, 3, -7], [1, -7, -21], -24, 14) }],
      [1.5, { yaw: -2, twist: 0, pitch: 2, bend: 2, pz: R.pz + 0.4, faceTurn: -6, ...hands([11, 1, -13], [R0[0], R0[1], R0[2]], -16, 12) }],
      [QN_REFLECT.long, {}],
    ],
  };
}

// =============================================================================================
// SHATTER: both arms flung up, held long while the hall's mirrors tremble; slammed down and out; every mirror bursts.

export const QN_SHATTER = { long: 2.5, warn: [0.5, 1.267] as const, strike: [39 / FPS, 41 / FPS] as const, hit: 41 / FPS } as const;
const ARMS_UP: P = { yaw: 0, twist: 0, pitch: -6, bend: -11, pz: R.pz + 7, faceTurn: 0, faceUp: 24, faceTilt: 0, ...hands([2, 17, 15], [2, -17, 15], -60, 60) };
const SLAMMED: P = { yaw: 0, twist: 0, pitch: 6, bend: 10, pz: R.pz + 1.2, faceTurn: -2, faceUp: -10, faceTilt: 0, ...hands([4, 17, -13], [4, -17, -13], -40, 40) };
function shatterPlan(): Plan {
  const [w0, w1] = QN_SHATTER.warn;
  const [s0, s1] = QN_SHATTER.strike;
  const shiver = (k: number): P => ({ ...ARMS_UP, pz: (ARMS_UP.pz as number) + 0.35 * k, roll: 0.8 * k, ...hands([2, 17 + 0.4 * k, 15 + 0.3 * k], [2, -17 + 0.4 * k, 15 - 0.3 * k], -60, 60) });
  return {
    long: QN_SHATTER.long,
    strike: QN_SHATTER.strike,
    hit: QN_SHATTER.hit,
    keys: [
      [0, {}],
      [0.24, { pitch: -2, bend: -4, pz: R.pz + 2.8, faceUp: 12, ...hands([5, 13, 1], [5, -13, 1], -50, 50) }],
      [w0, ARMS_UP],
      [0.75, shiver(1)],
      [1.0, shiver(-1)],
      [w1, ARMS_UP],
      [s0, { ...ARMS_UP, pitch: -1, bend: -14 }],
      [s1, SLAMMED],
      [1.62, { ...SLAMMED, bend: 12, pitch: 7, pz: R.pz + 0.8, ...hands([3, 18, -16], [3, -18, -16], -38, 38) }],
      [2.0, { pitch: 3, bend: 4, pz: R.pz + 1.2, faceUp: 0, ...hands([9, 6, -14], [5, -6, -18], -20, 20) }],
      [QN_SHATTER.long, {}],
    ],
  };
}

// =============================================================================================
// STRUCK, AND HER DEATH

export const QN_REEL = 0.4;
const JOLT: P = { px: -2.2, pitch: -8, bend: -9, faceUp: 18, pz: R.pz + 1.2, ...hands([2, 9, -10], [2, -9, -10], -40, 40) };
function reelPlan(): Plan {
  return { long: QN_REEL, keys: [[0, {}], [0.07, JOLT], [QN_REEL, {}]] };
}
export const QN_DIES = { long: 3.4, drop: 0.62, crack: [0.18, 2.7] as const, sink: [1.0, 1.85] as const, sit: [2.05, 2.7] as const } as const;
const TUCK = 56;
const KNEE_Z = B.legR[1] * 1.3;
const KNEEL_FEET: Record<'L' | 'R', Plant> = { L: { at: [-12, 5.2], turn: 4, pitch: TUCK }, R: { at: [-12, -5.2], turn: -4, pitch: TUCK } };
const feetAt = (lift: number): P => ({ ...footOn(B, 'L', KNEEL_FEET.L, lift), ...footOn(B, 'R', KNEEL_FEET.R, lift) });
/** On her knees, upright (`lean` 0) or sat back on her heels (less than nothing). */
const kneel = (lean: number, body: P): P => ({ ...kneelHips(B, R, KNEEL_FEET, TUCK, KNEE_Z, lean), ...feetAt(0), ...body });
const LAP = (dz: number): P => hands([9.5, -2.6, -16 + dz], [9.5, 2.6, -16 + dz], -14, 14);
function diesPlan(): Plan {
  const K0 = kneel(4, { pitch: 4, bend: 8, faceUp: -20, faceTurn: 0, faceTilt: 6, ...LAP(0), out: 0.6 });
  const K1 = kneel(-48, { pitch: 2, bend: 13, faceUp: -28, faceTurn: 4, faceTilt: 10, ...LAP(-3), out: 1 });
  const sinkMid = { ...kneel(4, { pitch: 4, bend: 9, faceUp: -20, faceTurn: 0, faceTilt: 6, ...hands([7, -3.5, -10], [7, 3.5, -10], -10, 10), out: 0.45 }), ...feetAt(2.2) };
  return {
    long: QN_DIES.long,
    feetSaid: true,
    keys: [
      [0, {}],
      [0.1, { ...JOLT }],
      // her hand to her crown as it cracks; the Hush leaves her
      [0.42, { pitch: -3, bend: -4, faceUp: 14, faceTurn: 0, pz: R.pz + 0.8, ...hands([3, 2.5, 13], [4, -9, -12], -60, 30), out: 0.2 }],
      [0.62, { pitch: 1, bend: 3, faceUp: 4, faceTurn: 0, pz: R.pz + 0.2, ...hands([4, 2.2, 11], [6, -6, -14], -60, 20), out: 0.3 }],
      [QN_DIES.sink[0], { pitch: 4, bend: 9, faceUp: -14, faceTurn: 0, pz: R.pz - 1.2, ...hands([6.5, -3, -8], [6.5, 3, -9], -10, 10), out: 0.35, lfx: -4, rfx: -4, lfz: R.lfz + 1.5, rfz: R.rfz + 1.5 }],
      // she sinks out of the air to her knees
      [1.42, { ...sinkMid, pz: ((sinkMid.pz as number) + (R.pz - 1.2)) / 2 + 3 }],
      [QN_DIES.sink[1], K0],
      [QN_DIES.sit[0], { ...K0, faceUp: -22 }],
      [2.35, kneel(-24, { pitch: 3, bend: 10, faceUp: -25, faceTurn: 2, faceTilt: 8, ...LAP(-1.5), out: 0.85 })],
      // and sits back on her heels, her head bowed, still
      [QN_DIES.sit[1], K1],
      [QN_DIES.long, { ...K1, bend: 13.5, faceUp: -29 }],
    ],
  };
}

// =============================================================================================
// HER, AS THE GAME HOLDS A MONSTER

export const QN_NAMES = {
  stand: 'The Queen stands',
  walk: 'The Queen glides',
  attack: 'The comb',
  glassIn: 'Looking Glass: into the glass',
  glassOut: 'Looking Glass: out of the glass',
  reflect: 'Reflections',
  shatter: 'Shatter',
  reel: 'The Queen is struck',
  dying: 'Her crown cracks; her mirror tells the truth',
} as const;
/** Each of her moves by the name the review knows it by (art/boss_checks.ts), its plan's pose at a moment. */
const PLANS: Record<string, Plan> = { attack: combPlan(), glassIn: glassInPlan(), glassOut: glassOutPlan(), reflect: reflectPlan(), shatter: shatterPlan(), reel: reelPlan(), dying: diesPlan() };
const POSES: Record<string, (t: number) => P> = Object.fromEntries(Object.entries(PLANS).map(([k, p]) => [k, poseFn(p)]));
const bonesOf = (move: string, t: number): Skeleton => solve(B, { ...R, ...(POSES[move]?.(Math.max(0, Math.min(PLANS[move].long, t))) ?? {}) } as Posed);
/** The strikes, by move: from the last frame of the wind-up to the frame it lands on. */
export const QN_STRIKES: Readonly<Record<string, readonly [number, number]>> = { attack: QN_COMB.strike, glassIn: QN_IN.strike, glassOut: QN_OUT.strike, reflect: QN_REFLECT.strike, shatter: QN_SHATTER.strike };
const WARNS: Readonly<Record<string, readonly [number, number]>> = { attack: QN_COMB.warn, glassIn: QN_IN.warn, glassOut: QN_OUT.warn, reflect: QN_REFLECT.warn, shatter: QN_SHATTER.warn };
const byName: Record<string, string> = Object.fromEntries(Object.entries(QN_NAMES).map(([k, v]) => [v, k]));
/** Whether a frame of a move shows its strike's smear: from the frame after its wind-up ends to the frame after it lands (thinning then). */
export function smearedAt(move: string, t: number): boolean {
  const s = QN_STRIKES[move];
  return !!s && t > s[0] + 1e-6 && t <= s[1] + FR + 1e-6;
}
/** The end of her that strikes in each move: her comb's teeth; her leading hand into the glass; her middle out of it; her casting hand. */
function tipOf(move: string, s: Skeleton): V3 | null {
  if (move === 'attack') return combAt(s).tip;
  if (move === 'glassIn' || move === 'reflect') return s.handL;
  if (move === 'glassOut') return s.pelvis;
  if (move === 'shatter') return s.handR;
  return null;
}
/** THE SMEAR: after-images of what strikes, along the way it has come since its wind-up ended. */
function smearOf(move: string, t: number): V3[][] | null {
  if (!smearedAt(move, t)) return null;
  const [s0, s1] = QN_STRIKES[move];
  const to = Math.min(t, s1);
  const out: V3[][] = [];
  const n = move === 'attack' ? 8 : 6;
  for (let i = 0; i <= n; i++) {
    const u = s0 - FR * 0.5 + ((to - (s0 - FR * 0.5)) * i) / n;
    const s = bonesOf(move, u);
    if (move === 'attack') {
      // (the arm and the comb as one straight line, and her outline lunging, crown to hem)
      if (i % 2 === 0) out.push([s.elbowR, combAt(s).tip]);
    } else if (move === 'glassIn' || move === 'glassOut') {
      // (streaks along the way she has gone, from each point of her outline: drawn whole below)
      continue;
    } else if (move === 'reflect') out.push([s.shoulderL, s.elbowL, s.handL]);
    else out.push([s.elbowR, s.handR], [s.elbowL, s.handL]);
  }
  // (through the glass: a streak from every point of her outline, crown to hem, along the way it has gone)
  if (move === 'glassIn' || move === 'glassOut') {
    const pts = (sk: Skeleton): V3[] => {
      const hemF = add(sk.pelvis, [0, 0, -sk.pelvis[2] + 3]);
      return [add(sk.head, [0, 0, 11]), add(sk.head, [0, 0, 4]), sk.head, sk.shoulderL, sk.shoulderR, sk.elbowL, sk.elbowR, sk.handL, sk.handR, sk.ribs, sk.pelvis,
        add(hemF, [6, 0, 0]), add(hemF, [-6, 0, 0]), add(hemF, [0, 8, 0]), add(hemF, [0, -8, 0]), lerp3(sk.pelvis, hemF, 0.5)];
    };
    const steps = 8;
    const at = Array.from({ length: steps + 1 }, (_, i) => pts(bonesOf(move, s0 + ((to - s0) * i) / steps)));
    for (let j = 0; j < at[0].length; j++) out.push(at.map((p) => p[j]));
  }
  // (the comb's whole way, its teeth's streak, all along it)
  if (move === 'attack') {
    const streak: V3[] = [];
    for (let i = 0; i <= 12; i++) streak.push(combAt(bonesOf('attack', s0 + ((to - s0) * i) / 12)).tip);
    out.unshift(streak);
  }
  return t > s1 + 1e-6 ? out.slice(Math.floor(out.length / 2)) : out;
}
/** WHAT IS LAID AFTER HER EDGE IN HER MOVES: the comb's teeth glinting pink through its warning and dripping poison; cold glints round her casting hand; shards lifting round her; her eyes in the glass; the Hush leaving her as she dies. */
function moreOf(move: string, m: Moment): [V3, string, number][] {
  const out: [V3, string, number][] = [];
  const t = m.t;
  const s = m.s;
  const warn = WARNS[move];
  const tick = Math.floor(t * 15);
  if (move === 'attack' && t >= warn[0] - 0.12 && t <= warn[1] + 0.03) {
    // THE TEETH GLINTING the enemy's pink, by turns, and a drop of violet poison falling from them
    const c = combAt(s);
    c.teeth.forEach(([, tip], i) => {
      if ((i + tick) % 2 === 0) out.push([tip, (i + tick) % 4 === 0 ? FLAME[4] : FLAME[2], 1]);
    });
    out.push([c.tip, FLAME[3], 2]);
    for (let j = 0; j < 3; j++) {
      const life = (t * 1.6 + j / 3) % 1;
      const from = c.teeth[(j * 2 + 1) % c.teeth.length][1];
      out.push([add(from, [0, 0, -14 * life * life]), QN_POISON[life < 0.5 ? 4 : 3], 1]);
    }
  }
  if (move === 'attack') {
    // THE PUFF as it strikes: a burst of violet at its teeth (the cloud that hangs there is art/queen_fx.ts's)
    const since = t - QN_COMB.hit;
    if (since >= -1e-6 && since < 0.2) {
      const c = combAt(s);
      const k = since / 0.2;
      for (let i = 0; i < 24; i++) {
        const a = (i / 24) * Math.PI * 2;
        const r = 3 + 14 * Math.sqrt(k) * (0.6 + 0.5 * hashOf(i, 1));
        out.push([add(c.tip, [Math.cos(a) * r, Math.sin(a) * r, Math.sin(a * 2 + i) * r * 0.5]), i % 3 === 0 ? FLAME[3] : QN_POISON[2 + (i % 3)], k < 0.5 ? 2 : 1]);
      }
    }
  }
  if (move === 'reflect' && t >= warn[0] - 0.15 && t <= warn[1] + 0.03) {
    // cold glints of glass gathering round her lifted hand, a point of pink in her palm
    const k = smooth(warn[0] - 0.15, warn[0] + 0.1, t);
    for (let i = 0; i < 18; i++) {
      const a = (i / 18) * Math.PI * 2 + t * (4 + (i % 3));
      const r = (5 + 3 * Math.sin(t * 7 + i)) * (0.4 + 0.6 * k) + (i % 2) * 2.5;
      out.push([add(s.handL, [Math.cos(a) * r, Math.sin(a) * r, Math.sin(a * 2 + i) * r * 0.7 + 1.5]), i % 3 === 0 ? QN_GLASS[4] : i % 3 === 1 ? QN_MIRROR[4] : QN_GLASS[3], (i + tick) % 3 === 0 ? 2 : 1]);
    }
    out.push([add(s.handL, [0, 0, 1.6]), FLAME[2], 2]);
  }
  if (move === 'shatter' && t >= 0.3 && t <= QN_SHATTER.hit + 0.5) {
    // SHARDS LIFTING off the floor round her as she holds it, whirling up; flung out as she slams
    const k = t <= QN_SHATTER.hit ? smooth(0.3, 1.1, t) : 1;
    const burst = t > QN_SHATTER.hit ? (t - QN_SHATTER.hit) / 0.5 : 0;
    for (let i = 0; i < 48; i++) {
      const a = hashOf(i, 2) * Math.PI * 2 + t * (2.2 + 1.5 * hashOf(i, 3));
      const r = (10 + 20 * hashOf(i, 4)) * (1 - 0.25 * k) + burst * (50 + 40 * hashOf(i, 7));
      const z = 2 + (8 + 50 * hashOf(i, 5)) * k * (1 - burst * burst) + burst * 10 * (1 - burst);
      if (burst > 0 && hashOf(i, 6) < burst) continue;
      const big = hashOf(i, 8) < 0.35;
      const p: V3 = [s.pelvis[0] + Math.cos(a) * r, s.pelvis[1] + Math.sin(a) * r, z];
      out.push([p, i % 3 === 0 ? QN_GLASS[4] : i % 3 === 1 ? QN_MIRROR[4] : QN_GLASS[3], big ? 3 : 2]);
      // (a shard is a sliver: a darker tail along its way round)
      if (big) out.push([[p[0] - Math.sin(a) * 2.5, p[1] + Math.cos(a) * 2.5, p[2] - 0.6], QN_GLASS[2], 2]);
    }
  }
  if (move === 'glassIn' && t >= warn[0] && t <= warn[1] + 0.03) {
    // her fingers on the glass: points of light where they touch it
    for (let i = 0; i < 3; i++) out.push([[s.handL[0] + (i - 1) * 0.9, QN_GLASS_AT.y - 0.6, s.handL[2] + 0.5 * i], (i + tick) % 2 ? QN_GLASS[4] : QN_GLASS[3], 1]);
  }
  if (move === 'glassOut' && t >= warn[0] - 0.06 && t < QN_OUT.strike[1] - 1e-6) {
    // HER EYES IN THE GLASS: the dull pink of them, where her face is behind it, coming nearer
    const k = smooth(warn[0] - 0.06, QN_OUT.strike[0], t);
    const y = QN_GLASS_AT.y - 0.8;
    const z = s.head[2] + 1;
    for (const e of [-3.4, 3.4]) {
      out.push([[s.head[0] + e, y, z], k > 0.4 ? FLAME[2] : FLAME[1], 2]);
      if (k > 0.7) out.push([[s.head[0] + e * 1.35, y, z + 0.6], FLAME[1], 1]);
    }
  }
  if (move === 'dying' && t > 0.3 && t < 1.7) {
    // THE HUSH LEAVES HER: a grey breath out of her lips, rising and thinning
    const mouth = add(s.head, add(mul(s.face[0], B.headR[0] * 0.9), mul(s.face[2], -B.headR[2] * 0.45)));
    for (let i = 0; i < 22; i++) {
      const life = (t - 0.3) * 1.5 - i * 0.045;
      if (life < 0 || life > 1) continue;
      const p = add(mouth, add(mul(s.face[0], 2 + 5 * life), [Math.sin(i * 1.7 + t * 3) * 1.6 * life, Math.cos(i * 1.3) * 1.6 * life, 2 + 16 * life]));
      out.push([p, life < 0.3 ? '#b6b0cc' : life < 0.6 ? '#9890b4' : '#625a7a', life < 0.5 ? 2 : 1]);
    }
  }
  return out;
}
/** Her comb as she dies: in her hand until she lets it go (`QN_DIES.drop`), then falling to lie on the floor at her right, before her. */
const DROP_AT = ((): { at: V3; deg: number } => {
  const s = bonesOf('dying', QN_DIES.drop);
  const c = combAt(s);
  const mid = lerp3(c.back[0], c.back[1], 0.5);
  return { at: [mid[0] + 4, mid[1] - 3, 0], deg: -30 };
})();
const SAY: QueenSay = {
  glass: (m) => glassOf(byName[m.move ?? ''] ?? '', m.t),
  away: (m) => awayAt(byName[m.move ?? ''] ?? '', m.t),
  crack: (m) => (m.dying ? smooth(QN_DIES.crack[0], QN_DIES.crack[1], m.t) : 0),
  dropped: (m) => (m.dying && m.t > QN_DIES.drop ? { ...DROP_AT, fall: clamp01((m.t - QN_DIES.drop) / 0.32) } : null),
  smear: (m) => smearOf(byName[m.move ?? ''] ?? '', m.t),
  more: (m) => moreOf(byName[m.move ?? ''] ?? '', m),
};

function queenMob(): Mob {
  const paint = queenPainter(SAY);
  const mv = (name: string, motion: Motion, more: Partial<MobMove> = {}): MobMove => ({ name, motion, rest: R, ...more });
  const glow = (warn: readonly [number, number]) => (t: number): number => (t >= warn[0] && t <= warn[1] ? 1 : 0);
  return {
    id: 'queen',
    name: 'The Queen',
    size: 'a boss: a head and a half taller than the knight',
    build: B,
    stand: mv(QN_NAMES.stand, queenStand()),
    attack: mv(QN_NAMES.attack, motionOf(PLANS.attack), { glint: glow(QN_COMB.warn) }),
    more: {
      glassIn: mv(QN_NAMES.glassIn, motionOf(PLANS.glassIn), { glint: glow(QN_IN.warn) }),
      glassOut: mv(QN_NAMES.glassOut, motionOf(PLANS.glassOut), { glint: glow(QN_OUT.warn) }),
      reflect: mv(QN_NAMES.reflect, motionOf(PLANS.reflect), { glint: glow(QN_REFLECT.warn) }),
      shatter: mv(QN_NAMES.shatter, motionOf(PLANS.shatter), { glint: glow(QN_SHATTER.warn) }),
    },
    idleFrames: 28,
    idleFps: 10,
    walk: mv(QN_NAMES.walk, { ...motionOf(glidePlan()), loop: 0 }, { period: QN_GLIDE.frames / QN_GLIDE.fps, ground: QN_PACE * TILE3 }),
    walkFrames: QN_GLIDE.frames,
    walkFps: QN_GLIDE.fps,
    pace: QN_PACE,
    reel: mv(QN_NAMES.reel, motionOf(PLANS.reel)),
    reelTime: QN_REEL,
    hit: QN_COMB.hit,
    warn: QN_COMB.warn[1] - QN_COMB.warn[0],
    dieTime: QN_DIES.long,
    dying: mv(QN_NAMES.dying, motionOf(PLANS.dying)),
    aura: { x: QN_CANVAS.ax, y: QN_CANVAS.ay - 50, r: 46, color: '#8a84b4', a: 0.08 },
    shadow: 15,
    canvas: QN_CANVAS,
    trueBack: true,
    bits: paint.bits,
    grains: paint.grains,
  };
}
export const QUEEN = queenMob();
export function makeQueenArt3(mob: Mob = QUEEN): ActorArt {
  return { front: mobSet(mob, 'front', mob.pace), back: mobSet(mob, 'back', mob.pace) };
}

// =============================================================================================
// HER AS THE CHECKS SEE HER (art/boss_checks.ts)

const len3 = (v: V3): number => Math.hypot(v[0], v[1], v[2]);
export function queenSolids(s: Skeleton): { limbs: CheckLimb[]; lumps: CheckLump[] } {
  const [rH, rK, rA] = B.legR;
  const [r0, r1] = B.armR;
  const limbs: CheckLimb[] = [];
  for (const side of ['L', 'R'] as const) {
    const L = side === 'L';
    limbs.push(
      { name: `leg${side}`, a: L ? s.hipL : s.hipR, b: L ? s.kneeL : s.kneeR, r: rH * 1.1 },
      { name: `shin${side}`, a: L ? s.kneeL : s.kneeR, b: L ? s.ankleL : s.ankleR, r: Math.max(rK, rA) * 1.15 },
      { name: `upper${side}`, a: L ? s.shoulderL : s.shoulderR, b: L ? s.elbowL : s.elbowR, r: r0 * 1.15 },
      { name: `fore${side}`, a: L ? s.elbowL : s.elbowR, b: L ? s.handL : s.handR, r: r1 * 1.1 },
    );
  }
  limbs.push({ name: 'neck', a: s.neck, b: lerp3(s.neck, s.head, 0.5), r: 1.9 });
  const waistC = add(s.pelvis, mul(s.hips[2], B.waist * 0.62));
  const lumps: CheckLump[] = [
    { name: 'head', c: add(s.head, mul(s.face[2], -0.2)), rot: s.face, h: [B.headR[0] * 1.03, B.headR[1] * 1.05, B.headR[2] * 1.06] },
    { name: 'chest', c: lerp3(s.ribs, s.neck, 0.3), rot: s.chest, h: [B.ribDeep + 1.3, B.ribHalf + 1.1, len3(sub(s.neck, s.ribs)) * 0.55] },
    { name: 'belly', c: lerp3(waistC, s.ribs, 0.45), rot: s.belly, h: [B.waistDeep + 1.4, B.waistHalf + 1.2, Math.max(3, len3(sub(s.ribs, waistC)) * 0.6)] },
    { name: 'hips', c: add(s.pelvis, mul(s.hips[2], B.waist * 0.2)), rot: s.hips, h: [B.pelvisDeep + 2.2, B.pelvisHalf + 2.0, B.waist * 0.75] },
  ];
  return { limbs, lumps };
}
/** Her comb as the checks see it: along its back and its middle tooth, held in her right hand. */
function combThing(s: Skeleton): CheckThing {
  const c = combAt(s);
  const mid = c.teeth[Math.floor(c.teeth.length / 2)];
  const pts: V3[] = [c.back[0], lerp3(c.back[0], c.back[1], 0.5), c.back[1]];
  for (let i = 0; i <= 4; i++) pts.push(lerp3(mid[0], mid[1], i / 4));
  return { name: 'comb', pts, r: 1.0, may: ['foreR'] };
}
const ALL_MOVES = ['stand', 'walk', 'attack', 'reel', 'dying', 'glassIn', 'glassOut', 'reflect', 'shatter'];
export const QN_SHAPE: BossShape = {
  body: queenSolids,
  tip: (move, _t, s) => tipOf(move, s),
  things: (move, t, s) => (move === 'dying' && t >= QN_DIES.drop ? [] : [combThing(s)]),
  follow: (_move, _t, s) => ({ head: s.head, handL: s.handL, handR: s.handR, pelvis: s.pelvis, chest: s.ribs }),
  strikes: QN_STRIKES,
  smeared: smearedAt,
  handovers: [
    // (her stand, from whatever frame of it, into each move that begins from it; and each back to it as it ends)
    ...['attack', 'reel', 'dying', 'glassIn', 'reflect', 'shatter'].map((m): Handover => ({ from: 'stand', at: 0, to: m, toAt: 0 })),
    // (the comb ends where she has lunged to: the game has moved her there)
    { from: 'attack', at: 'end', to: 'stand', toAt: 0, shift: [QN_LUNGE, 0] },
    ...['reel', 'glassOut', 'reflect', 'shatter'].map((m): Handover => ({ from: m, at: 'end', to: 'stand', toAt: 0 })),
    // (into the glass and out of another: she is not seen at the end of the one nor the start of the other, so nothing of her leaps: tests/queen.test.ts holds that)
    { from: 'stand', at: 0, to: 'walk', toAt: 0 },
    ...Array.from({ length: QN_GLIDE.frames + 1 }, (_, i): Handover => ({ from: 'walk', at: i / QN_GLIDE.fps, to: 'stand', toAt: 0 })),
  ],
};
void ALL_MOVES;
void QN_STAND_LONG;
void sub;
