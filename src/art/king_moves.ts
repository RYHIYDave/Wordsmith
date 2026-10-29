// FLOOR 19'S BOSS, THE KING: HIS MOVES (the art chat, 29 Oct 2026). A MOCK-UP: NOT IN THE GAME, behind KING_ON
// (art/king.ts, off). His look and his brief are art/king.ts; what his blows leave across the hall, art/king_fx.ts.
//
// His pick for how he moves: “Slow and heavy, huge reach (Recommended)”. And his rulebook's Movement 9 (24 Oct): “Like the
// wind up and wind down are big but the actual punch is lightning quick”, for every new enemy from the Princess on (28
// Oct: “Start from now on, but every enemy is going to need that change eventually.  And bigger AOE to compensate for the
// extra time the player gets to evade”): every blow of his winds up big and is held (the warning), strikes in two frames
// smeared with its after-images, and winds down big; and every blow reaches across the hall.
//
// HIS MOVES:
//   STANDING: bowed under the Hush, heaving for breath, his weight shifting; the Hush stirring on his back, its head
//     turning, its fog curling up through his crown; his sword's point on the stones behind him.
//   HIS WALK: slow and heavy, each foot set down with his whole weight, lurching from side to side; the sword dragged
//     behind him, its point grinding along the stones, sparks off it.
//   THE SWEEP (his basic blow): both hands on the grip, he hauls the great sword round behind him to his right, low, its
//     point grinding the stones, crouched, twisted far round, and holds it, the blade glinting pink (THE WARNING); his
//     hips go first; in two frames it sweeps round in front of him from behind his right to his left, smeared (and its
//     wave rolls out across most of the hall: art/king_fx.ts); it bites the stones at his left; he drags it back round
//     in front of him, grinding, and lets it down behind him.
//   THE DECREE: he takes the sword in both hands and raises it high over his head, point down, his face lifted to it,
//     and holds it (the warning); then drives it down into the stones before him (two frames): the stones crack, and the
//     rows of his knights rise out of the fog and march across the hall (art/king_fx.ts); he leans on it, wrenches it
//     out, and lets it down behind him.
//   THE CROWN: he crouches deep, the sword drawn back low, and holds it (the warning); he springs into the air (the game
//     carries him); at the top the sword is swung up high to his right; he comes down, and in two frames lands and slams
//     it down before him, smeared; the shockwave rings out across the hall (art/king_fx.ts); he sinks with the landing,
//     and rises slowly.
//   THE CURTAINS: he turns to the hangings and stretches out his left hand to them, his face turned away (the warning);
//     then flings it at you (two frames): the faces of his deeds stream out of the hangings at you (art/king_fx.ts); he
//     clutches at his breast.
//   THE HUSH CLIMBS OFF (his last phase): it lets go of him, rises off his back over his head and comes down at his
//     left, where it stands as its own figure (HUSH, below), and fights at his side; he straightens as its weight goes,
//     gasping, and bows again. From then on he is KING_ALONE: the same moves, nothing on his back.
//   STRUCK: he barely gives: rocked a little, the Hush's head jolting.
//   HIS DEATH: struck, he lets his sword fall; his knees give and he sinks onto them, swaying, his head bowing; he folds
//     forward and goes down, and lies still, as if asleep. The Hush (on his back, or at his side) unwinds into nothing.
//     (The clockwork songbird winding itself up and singing is art/king_fx.ts's, the game's to play beside him.)
//
// By his rulebook: every move through every check the bosses have (art/boss_checks.ts), from in front and behind, and
// the lightning strikes as his Movement 9 asks.
//   test: tsx --test tests/king.test.ts

import type { ActorArt } from './actor_types';
import type { BossShape, CheckLimb, CheckLump, CheckThing, Handover } from './boss_checks';
import { footOn, kneelHips, kneelSettle, plantOf } from './bosses3';
import type { Plant } from './bosses3';
import { hash } from './kit';
import { FLAME } from './mkit';
import { TILE3, mobSet } from './new_mobs3';
import type { Mob, MobMove, Moment } from './new_mobs3';
import { HUSH_BODY, HUSH_CANVAS, HUSH_REST, KING_BODY, KING_CANVAS, KING_REST, LEFT_ON_GRIP, SWORD, hushMix, hushMoved, hushPainter, hushRiding, hushStanding, kingPainter, swordOf } from './king';
import type { HushPose, KingSay } from './king';
import { add, cross, dot, elbowFor, len, lerp3, mul, norm, solve, sub } from './skeleton';
import type { Bones, Key3, Motion, Posed, Skeleton, V3 } from './skeleton';

type P = Partial<Bones>;
/** A key's pose, and two things of his own: how far his left hand is on the sword's grip (`grip`, 0 to 1), and how far the sword's point is put down on the stones (`floor`, 0 to 1). */
type KP = P & { grip?: number; floor?: number };
const B = KING_BODY;
const R = KING_REST;
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
// A MOVE THROUGH KEY POSES (as the Princess's): every field through its keys smoothly, straight through a lightning
// strike; sampled on every frame the game shows; and on each frame his left hand put on the grip and the sword's point
// put down on the stones as far as the keys say.

/** A value through keys [time, value], smooth through each (a monotone cubic: it does not overshoot, and it stops only where it turns back or holds). */
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

interface Plan {
  long: number;
  keys: ReadonlyArray<readonly [number, KP]>;
  /** The strike: from the last frame of its wind-up to the frame it lands on. */
  strike?: readonly [number, number];
  hit?: number;
}
const BASE: Record<string, number> = { ...(R as unknown as Record<string, number>), grip: 0, floor: 1 };
const FIELDS = Object.keys(BASE).filter((k) => k !== 'lhIn' && k !== 'rhIn' && typeof BASE[k] === 'number');
/** How high his sword's point rests on the stones (its own lengths). */
export const TIP_Z = 1.2;

/** A pose made whole: his left hand put on the grip as far as `grip` says, the sword's point put down on the stones as far as `floor` says. */
function resolved(p: Record<string, number>): Bones {
  const q = { ...R, ...p, lhIn: 1, rhIn: 1 } as unknown as Bones & { grip: number; floor: number };
  const fl = clamp01(q.floor ?? 0);
  if (fl > 1e-4) {
    // (the way down that puts the point on the stones: found between straight out and straight down)
    const tipZ = (el: number): number => swordOf(solve(B, { ...q, wEl: el } as Posed)).tip[2];
    let lo = -89.5;
    let hi = 30;
    if (tipZ(lo) > TIP_Z) {
      // (it cannot reach: pointed straight down)
      q.wEl = q.wEl + (lo - q.wEl) * fl;
    } else {
      for (let i = 0; i < 30; i++) {
        const mid = (lo + hi) / 2;
        if (tipZ(mid) < TIP_Z) lo = mid;
        else hi = mid;
      }
      q.wEl = q.wEl + ((lo + hi) / 2 - q.wEl) * fl;
    }
  }
  const g = clamp01(q.grip ?? 0);
  if (g > 1e-4) {
    const s = solve(B, q as Posed);
    const on = add(s.handR, mul(s.point, LEFT_ON_GRIP));
    const want = sub(on, s.shoulderL);
    q.lhx += (want[0] - q.lhx) * g;
    q.lhy += (want[1] - q.lhy) * g;
    q.lhz += (want[2] - q.lhz) * g;
  }
  const out = { ...q } as Record<string, number>;
  delete out.grip;
  delete out.floor;
  return out as unknown as Bones;
}

function poseFn(plan: Plan): (t: number) => Record<string, number> {
  const full = plan.keys.map(([t, p]) => [t, { ...BASE, ...(p as Record<string, number>) }] as const);
  const tracks = new Map(FIELDS.map((k) => [k, track(full.map(([t, p]) => [t, p[k]] as const))]));
  const st = plan.strike;
  const at = (t: number): Record<string, number> | undefined => full.find(([kt]) => Math.abs(kt - t) < 1e-6)?.[1];
  const a0 = st ? at(st[0]) : undefined;
  const a1 = st ? at(st[1]) : undefined;
  return (t) => {
    const out: Record<string, number> = {};
    if (st && a0 && a1 && t > st[0] && t < st[1]) {
      const k = (t - st[0]) / (st[1] - st[0]);
      for (const f of FIELDS) out[f] = a0[f] + (a1[f] - a0[f]) * k;
    } else for (const f of FIELDS) out[f] = (tracks.get(f) as (t: number) => number)(t);
    return out;
  };
}
/** A move's motion: a key on every frame the game shows (and every frame of a death at 20 a second), each made whole. */
function motionOf(plan: Plan, fps = FPS): Motion {
  const f = poseFn(plan);
  const keys: Key3[] = [];
  const n = Math.round(plan.long * fps);
  const times = new Set<number>();
  for (let i = 0; i <= n; i++) times.add(i / fps);
  if (fps !== FPS) for (let i = 0; i <= Math.round(plan.long * FPS); i++) times.add(i / FPS);
  for (const t of [...times].sort((a, b) => a - b)) keys.push({ at: t, pose: resolved(f(t)), ease: 'lin' });
  return plan.hit !== undefined ? { keys, hit: plan.hit } : { keys };
}
/** His hands from his shoulders along the figure's own ways. */
const hands = (l: V3, r: V3, le: number, re: number): KP => ({ lhx: l[0], lhy: l[1], lhz: l[2], le, rhx: r[0], rhy: r[1], rhz: r[2], re });
/** His right hand (from his shoulder) and the sword's way. */
const swordAt = (r: V3, az: number, el: number, roll = 90): KP => ({ rhx: r[0], rhy: r[1], rhz: r[2], wAz: az, wEl: el, wRoll: roll });
/** A pose with his right hand set where a point on the floor's own ways is (from where his right shoulder is in that pose). */
function rightTo(pose: KP, at: V3): KP {
  const s = solve(B, { ...R, ...pose, lhIn: 1, rhIn: 1 } as Posed);
  const d = sub(at, s.shoulderR);
  return { ...pose, rhx: d[0], rhy: d[1], rhz: d[2] };
}
/** And his left. */
function leftTo(pose: KP, at: V3): KP {
  const s = solve(B, { ...R, ...pose, lhIn: 1, rhIn: 1 } as Posed);
  const d = sub(at, s.shoulderL);
  return { ...pose, lhx: d[0], lhy: d[1], lhz: d[2] };
}

// =============================================================================================
// STANDING: 3.6 s round, two heaving breaths

export const KG_STAND_LONG = 3.6;
const STAND_FRAMES = 36;
function standPose(t: number): KP {
  const a = (t / KG_STAND_LONG) * TAU;
  const b = (t / (KG_STAND_LONG / 2)) * TAU;
  return {
    pz: R.pz + 1.0 * Math.sin(b), bend: R.bend - 3.2 * Math.sin(b), pitch: R.pitch - 0.8 * Math.sin(b), faceUp: R.faceUp + 2.5 * Math.sin(b - 0.6),
    py: 1.9 * Math.sin(a), roll: R.roll + 1.6 * Math.sin(a), side: -1.0 * Math.sin(a), yaw: R.yaw + 1.5 * Math.sin(a + 0.8),
    faceTurn: R.faceTurn + 5 * Math.sin(a + 1.2), faceTilt: 3 * Math.sin(a),
    lhx: R.lhx + 0.8 * Math.sin(a + 0.4), lhz: R.lhz + 0.6 * Math.sin(b), rhz: R.rhz + 0.5 * Math.sin(b + 0.3),
    wAz: R.wAz + 1.5 * Math.sin(a),
    floor: 1,
  };
}
function kingStand(): Motion {
  const keys: Key3[] = [];
  for (let i = 0; i <= STAND_FRAMES; i++) {
    const t = (i / STAND_FRAMES) * KG_STAND_LONG;
    keys.push({ at: t, ease: 'lin', pose: resolved({ ...BASE, ...(standPose(t) as Record<string, number>) }) });
  }
  return { loop: 0, keys };
}

// =============================================================================================
// HIS WALK: slow and heavy, 18 frames at 10 a second (two steps of 0.9 s), painted for KG_PACE tiles a second

export const KG_WALK = { frames: 18, fps: 10 };
/** His pace, tiles a second (the knight walks 2.5): his pick, slow and heavy. */
export const KG_PACE = 1.0;
const STRIDE = (KG_PACE * TILE3) / KG_WALK.fps;
function walkPose(j: number): KP {
  const n = KG_WALK.frames;
  const d = STRIDE;
  const a = (j / n) * TAU;
  // a foot: down from frame 0 to 9 (going back under him with the floor), then lifted and swung through to land again
  const foot = (k: number): [number, number, number] => {
    if (k <= 9) return [4.5 * d - d * k, 0, 0];
    const u = (k - 9) / 9;
    const g = u * u * (3 - 2 * u);
    return [-4.5 * d + 9 * d * g, 5.6 * Math.sin(Math.PI * u) ** 0.8, 12 * Math.sin(Math.PI * u) - 5 * u];
  };
  const [rx, rz, rp] = foot(j % n);
  const [lx, lz, lp] = foot((j + 9) % n);
  return {
    px: 0.5, py: -2.6 * Math.sin(a), pz: R.pz - 1.8 - 1.8 * Math.cos(2 * a),
    yaw: R.yaw + 5 * Math.cos(a), twist: R.twist - 4 * Math.cos(a), pitch: R.pitch + 2 + 1.2 * Math.cos(2 * a), bend: R.bend + 1.5 * Math.cos(2 * a),
    roll: 3.2 * Math.sin(a), side: 1.4 * Math.sin(a),
    faceUp: R.faceUp - 1 - 2.2 * Math.cos(2 * a), faceTurn: R.faceTurn - 3 * Math.cos(a), faceTilt: -2 * Math.sin(a),
    rfx: rx, rfz: rz, rfp: rp, rfy: R.rfy, rft: R.rft, rk: -14,
    lfx: lx, lfz: lz, lfp: lp, lfy: R.lfy, lft: R.lft, lk: 10,
    lhx: R.lhx - 3 * Math.cos(a), lhy: R.lhy + 0.6, lhz: R.lhz + 1.2 * Math.sin(2 * a),
    rhz: R.rhz + 1.0 * Math.cos(2 * a), wAz: R.wAz + 4 * Math.sin(a),
    floor: 1,
  };
}
function kingWalk(): Motion {
  const keys: Key3[] = [];
  for (let i = 0; i <= KG_WALK.frames; i++) keys.push({ at: i / KG_WALK.fps, ease: 'lin', pose: resolved({ ...BASE, ...(walkPose(i % KG_WALK.frames) as Record<string, number>) }) });
  return { keys, loop: 0 };
}
/** The frames of his walk at which the game may stop him (each foot passing the other: nearest his stand), and start him. */
export const KG_WALK_STOPS = [5 / KG_WALK.fps, 13 / KG_WALK.fps] as const;

// =============================================================================================
// THE SWEEP (his basic blow)

/** The sweep's times: its warning held; the strike, two frames; the hit; and the way the blade swings round (degrees from his front, to his left: from behind his right to his left). */
export const KG_SWEEP = { long: 2.6, warn: [0.62, 1.2] as const, strike: [37 / FPS, 39 / FPS] as const, hit: 39 / FPS, from: -165, to: 62, bite: 100 };
const SW_GATHER: KP = { yaw: -14, twist: -10, pz: R.pz - 3, pitch: 6, bend: 12, faceTurn: 0, ...hands([16, -18, -24], [12, -12, -30], -50, 16), wAz: -158, grip: 1, floor: 1 };
const SW_WOUND: KP = rightTo({ yaw: -36, twist: -40, pitch: 7, bend: 9, roll: -3, side: -2, pz: R.pz - 9, faceTurn: -4, faceUp: 8, le: -50, re: 30, wAz: -165, wEl: -12, wRoll: 50, grip: 1, floor: 0, lk: 18, rk: -22 }, [-6, -32, 40]);
const SW_HIPS: KP = { ...SW_WOUND, yaw: -20, twist: -56 };
const SW_SWEPT: KP = rightTo({ yaw: 34, twist: 30, pitch: 9, bend: 12, roll: 2, side: 2, pz: R.pz - 11, faceTurn: 8, faceUp: 0, le: -10, re: 10, wAz: 62, wEl: -16, wRoll: 50, grip: 1, floor: 0, lk: 16, rk: -20 }, [26, 20, 52]);
const SW_ON: KP = rightTo({ ...SW_SWEPT, yaw: 40, twist: 36, pitch: 11, bend: 14, pz: R.pz - 13, wAz: KG_SWEEP.bite, floor: 1 }, [22, 28, 44]);
function sweepPlan(): Plan {
  const [w0, w1] = KG_SWEEP.warn;
  const [s0, s1] = KG_SWEEP.strike;
  const tremble = (k: number): KP => ({ ...SW_WOUND, twist: (SW_WOUND.twist as number) - 1 * k, rhz: (SW_WOUND.rhz as number) + 0.5 * k, pz: (SW_WOUND.pz as number) - 0.4 * Math.abs(k) });
  return {
    long: KG_SWEEP.long,
    strike: KG_SWEEP.strike,
    hit: KG_SWEEP.hit,
    keys: [
      [0, { floor: 1 }],
      [0.3, SW_GATHER],
      [w0, SW_WOUND],
      [0.8, tremble(1)],
      [1.0, tremble(-1)],
      [w1, SW_WOUND],
      [s0, SW_HIPS],
      [s1, SW_SWEPT],
      [1.55, SW_ON],
      [1.75, { ...SW_ON, wAz: KG_SWEEP.bite + 6, pz: R.pz - 12 }],
      // (dragged back round in front of him, grinding the stones, and let down behind him)
      [2.0, rightTo({ ...SW_ON, yaw: 14, twist: 8, pitch: 9, bend: 13, pz: R.pz - 8, faceTurn: 4, wAz: 25, floor: 1, grip: 1 }, [28, -2, 40])],
      [2.25, rightTo({ yaw: -8, twist: -4, pitch: 7, bend: 13, pz: R.pz - 5, faceTurn: 2, wAz: -70, floor: 1, grip: 0.6, re: 20, lhx: 12, lhy: 12, lhz: -30, le: -24 }, [16, -30, 42])],
      [KG_SWEEP.long, { floor: 1, grip: 0 }],
    ],
  };
}

// =============================================================================================
// THE DECREE

export const KG_DECREE = { long: 2.8, warn: [0.72, 1.24] as const, strike: [38 / FPS, 40 / FPS] as const, hit: 40 / FPS };
/** Raised: upright, his hands high over his head, the sword held up point to the sky; his face lifted to it. */
const DC_UP: KP = { yaw: 0, twist: 0, pitch: -4, bend: -6, pz: R.pz + 1.5, faceTurn: 0, faceUp: 26, le: -30, re: 30, wAz: 0, wEl: 84, wRoll: 0, grip: 1, floor: 0 };
const DC_RAISED: KP = rightTo(DC_UP, [12, -1.5, 122]);
const DC_HIPS: KP = { ...DC_RAISED, pitch: 4, bend: -11, pz: R.pz };
/** Driven down: the sword's point in the stones before him, leaning on it, crouched. */
const DC_DOWN: KP = rightTo({ yaw: 0, twist: 0, pitch: 14, bend: 15, pz: R.pz - 11, faceTurn: 0, faceUp: -6, le: -20, re: 20, wAz: 0, wEl: -84, wRoll: 0, grip: 1, floor: 0 }, [31, -1.5, 74]);
const DC_LEAN: KP = rightTo({ ...DC_DOWN, pitch: 16, bend: 18, pz: R.pz - 13, floor: 1 }, [32, -1.5, 66]);
function decreePlan(): Plan {
  const [w0, w1] = KG_DECREE.warn;
  const [s0, s1] = KG_DECREE.strike;
  const tremble = (k: number): KP => rightTo({ ...DC_UP, faceUp: 27 + k }, [12, -1.5 + 0.4 * k, 122 + 0.6 * k]);
  return {
    long: KG_DECREE.long,
    strike: KG_DECREE.strike,
    hit: KG_DECREE.hit,
    keys: [
      [0, { floor: 1 }],
      // (lifted out to his right, swinging forward, and taken in both hands before him)
      [0.25, rightTo({ yaw: -6, pitch: 3, bend: 9, pz: R.pz - 1, wAz: -40, wEl: -30, wRoll: 0, grip: 0.3, floor: 0, re: 24, lhx: 14, lhy: 4, lhz: -24, le: -24 }, [16, -32, 58])],
      [0.45, rightTo({ yaw: 0, pitch: 0, bend: 4, pz: R.pz, faceUp: 14, wAz: 0, wEl: 30, wRoll: 0, grip: 1, floor: 0, le: -20, re: 20 }, [24, -1.5, 92])],
      [w0, DC_RAISED],
      [0.9, tremble(1)],
      [1.08, tremble(-1)],
      [w1, DC_RAISED],
      [s0, DC_HIPS],
      [s1, DC_DOWN],
      [1.5, DC_LEAN],
      [1.75, DC_LEAN],
      // (wrenched out, and swung down to his right, his left hand letting go)
      [2.0, rightTo({ ...DC_DOWN, pitch: 8, bend: 10, pz: R.pz - 5, faceUp: 2, wEl: -78, floor: 0, grip: 0, lhx: 12, lhy: 8, lhz: -32, le: -24 }, [26, -6, 86])],
      [2.3, rightTo({ yaw: -6, pitch: 5, bend: 11, pz: R.pz - 2, wAz: -95, wEl: -45, grip: 0, floor: 0.6, re: 18, lhx: 8, lhy: 6, lhz: -36, le: -20 }, [10, -30, 48])],
      [KG_DECREE.long, { floor: 1 }],
    ],
  };
}

// =============================================================================================
// THE CROWN

/** The Crown's times: the crouch held; in the air (the game carries him `carry` tiles toward you); the landing, two frames. */
export const KG_CROWN = { long: 2.8, warn: [0.45, 0.95] as const, air: [1.02, 1.45] as const, strike: [43 / FPS, 45 / FPS] as const, hit: 45 / FPS, carry: 5, top: 56 };
/** Up on his toes as he springs: each toe where it stood, the heel lifted. */
const ON_TOES: KP = { ...footOn(B, 'L', { ...plantOf(B, 'L', {}, R), pitch: 34 }, 1.4), ...footOn(B, 'R', { ...plantOf(B, 'R', {}, R), pitch: 34 }, 1.4) };
const CR_CROUCH: KP = rightTo({ yaw: -16, twist: -6, pitch: 20, bend: 14, pz: R.pz - 16, faceTurn: 0, faceUp: 18, le: -40, re: 26, wAz: -160, wEl: -30, grip: 1, floor: 1, lk: 24, rk: -26 }, [14, -24, 36]);
/** At the top of his leap: knees drawn up, the sword swung up high to his right in both hands. */
const CR_TOP: KP = rightTo({ yaw: -12, twist: -16, pitch: -6, bend: -8, pz: R.pz + KG_CROWN.top, faceTurn: 0, faceUp: 10, le: -20, re: 40, wAz: -100, wEl: 58, grip: 1, floor: 0, lfz: KG_CROWN.top - 16, rfz: KG_CROWN.top - 19, lfx: 10, rfx: -1, lk: 16, rk: -16, lfp: 20, rfp: 24 }, [4, -26, 156]);
const CR_FALL: KP = { ...CR_TOP, pz: R.pz + 10, lfz: 2.5, rfz: 2.5, lfx: R.lfx, rfx: R.rfx, lfp: 8, rfp: 8, pitch: -4, bend: -6 };
/** Landed: deep, his feet down where they sprang from, the sword slammed down before him, its edge on the stones. */
const CR_SLAM: KP = rightTo({ yaw: 4, twist: 6, pitch: 22, bend: 18, pz: R.pz - 20, faceTurn: 0, faceUp: -4, le: -16, re: 14, wAz: 8, wEl: -26, wRoll: 0, grip: 1, floor: 0, lfz: 0, rfz: 0, lfx: R.lfx, rfx: R.rfx, lfp: 0, rfp: 0, lk: 22, rk: -24 }, [32, -4, 46]);
const CR_SUNK: KP = rightTo({ ...CR_SLAM, pz: R.pz - 23, pitch: 25, bend: 20, wAz: 10, floor: 1 }, [34, -4, 40]);
function crownPlan(): Plan {
  const [w0, w1] = KG_CROWN.warn;
  const [s0, s1] = KG_CROWN.strike;
  const tremble = (k: number): KP => rightTo({ ...CR_CROUCH, pz: (CR_CROUCH.pz as number) - 0.5 * Math.abs(k), twist: -6 - k }, [14, -24 + 0.4 * k, 36]);
  return {
    long: KG_CROWN.long,
    strike: KG_CROWN.strike,
    hit: KG_CROWN.hit,
    keys: [
      [0, { floor: 1 }],
      [0.2, rightTo({ yaw: -8, twist: -3, pitch: 12, bend: 15, pz: R.pz - 8, faceUp: 14, wAz: -156, grip: 0.5, floor: 1, re: 20, lhx: 16, lhy: 2, lhz: -26, le: -30 }, [14, -22, 40])],
      [w0, CR_CROUCH],
      [0.65, tremble(1)],
      [0.82, tremble(-1)],
      [w1, CR_CROUCH],
      // (the spring: up off his toes, the sword coming up)
      [KG_CROWN.air[0], rightTo({ ...CR_CROUCH, yaw: -14, twist: -14, pitch: 4, bend: 0, pz: R.pz + 2, faceUp: 14, wAz: -120, wEl: 10, floor: 0, ...ON_TOES }, [0, -32, 80])],
      [1.24, CR_TOP],
      [s0, CR_FALL],
      [s1, CR_SLAM],
      [1.62, CR_SUNK],
      [1.95, { ...CR_SUNK, pz: R.pz - 22 }],
      // (he rises slowly, the sword lifted off the stones and let down behind him)
      [2.35, rightTo({ yaw: -4, pitch: 9, bend: 12, pz: R.pz - 8, faceUp: 4, wAz: -80, wEl: -40, grip: 0.4, floor: 0.7, re: 18, lk: 14, rk: -16, lhx: 12, lhy: 12, lhz: -30, le: -24 }, [14, -30, 44])],
      [KG_CROWN.long, { floor: 1 }],
    ],
  };
}

// =============================================================================================
// THE CURTAINS

export const KG_CURTAINS = { long: 2.5, warn: [0.5, 0.98] as const, strike: [31 / FPS, 33 / FPS] as const, hit: 33 / FPS };
const CU_REACH: KP = { yaw: 16, twist: 22, pitch: 3, bend: 10, pz: R.pz - 1, faceTurn: 72, faceUp: 10, faceTilt: -6, ...hands([-14, 30, 16], [R.rhx, R.rhy, R.rhz], -40, R.re), floor: 1 };
const CU_HIPS: KP = { ...CU_REACH, yaw: 2, twist: 36 };
const CU_FLUNG: KP = { yaw: -10, twist: -12, pitch: 10, bend: 16, pz: R.pz - 4, faceTurn: 0, faceUp: 4, faceTilt: 0, ...hands([38, 4, 4], [R.rhx + 4, R.rhy, R.rhz + 2], -10, R.re), floor: 1 };
function curtainsPlan(): Plan {
  const [w0, w1] = KG_CURTAINS.warn;
  const [s0, s1] = KG_CURTAINS.strike;
  const tremble = (k: number): KP => ({ ...CU_REACH, lhz: 16 + 0.8 * k, lhy: 30 - 0.5 * k, faceTilt: -6 + k });
  return {
    long: KG_CURTAINS.long,
    strike: KG_CURTAINS.strike,
    hit: KG_CURTAINS.hit,
    keys: [
      [0, { floor: 1 }],
      [0.25, { yaw: 8, twist: 12, faceTurn: 40, ...hands([0, 22, -12], [R.rhx, R.rhy, R.rhz], -30, R.re), floor: 1 }],
      [w0, CU_REACH],
      [0.66, tremble(1)],
      [0.82, tremble(-1)],
      [w1, CU_REACH],
      [s0, CU_HIPS],
      [s1, CU_FLUNG],
      [1.35, { ...CU_FLUNG, pitch: 12, bend: 18, pz: R.pz - 5, ...hands([40, 0, -4], [R.rhx + 4, R.rhy, R.rhz + 1], -8, R.re) }],
      // (and he clutches at his breast, bowed)
      [1.85, { yaw: -2, twist: 2, pitch: 8, bend: 18, pz: R.pz - 3, faceTurn: 0, faceUp: -8, ...hands([14, -8, -24], [R.rhx, R.rhy, R.rhz], -40, R.re), floor: 1 }],
      [KG_CURTAINS.long, { floor: 1 }],
    ],
  };
}

// =============================================================================================
// THE HUSH CLIMBS OFF (his last phase)

export const KG_CLIMB = { long: 2.6, rise: [0.4, 1.3] as const, down: [1.3, 2.1] as const };
/** Where it stands once off him: at his left and a little behind (his own lengths: forward, to his left). */
export const HUSH_BESIDE: readonly [number, number] = [-8, 50];
function climbPlan(): Plan {
  return {
    long: KG_CLIMB.long,
    keys: [
      [0, { floor: 1 }],
      [0.4, { bend: R.bend + 5, pitch: R.pitch + 2, pz: R.pz - 1.5, faceUp: R.faceUp - 4, floor: 1 }],
      // (its weight going: he straightens, gasping, his head up)
      [1.2, { bend: 3, pitch: 0, pz: R.pz + 1.8, faceUp: 18, faceTurn: 20, ...hands([2, 6, -36], [R.rhx, R.rhy, R.rhz], -16, R.re), floor: 1 }],
      [1.7, { bend: 5, pitch: 1, pz: R.pz + 1.4, faceUp: 10, faceTurn: 34, floor: 1 }],
      [KG_CLIMB.long, { floor: 1 }],
    ],
  };
}

// =============================================================================================
// STRUCK, AND HIS DEATH

export const KG_REEL = 0.4;
function reelPlan(): Plan {
  return { long: KG_REEL, keys: [[0, { floor: 1 }], [0.08, { px: -2.4, pitch: R.pitch - 5, bend: R.bend - 5, faceUp: R.faceUp + 10, faceTilt: -4, pz: R.pz + 0.6, floor: 1 }], [KG_REEL, { floor: 1 }]] };
}

/** His death's times: his sword falls from his hand; he is on his knees; he folds forward; he lies still; the Hush unwinds. */
export const KG_DIES = { long: 3.6, drop: 0.42, knees: [0.55, 1.1] as const, fold: [1.85, 2.5] as const, down: 3.0, unwind: [0.3, 2.7] as const };
const TUCK = 52;
const KNEE_Z = B.legR[1] * 1.25;
const DIE_FEET: Record<'L' | 'R', Plant> = (() => {
  const L0 = plantOf(B, 'L', {}, R);
  const R0 = plantOf(B, 'R', {}, R);
  return { L: L0, R: R0 };
})();
const feetDown = (tuck: number): P => ({ ...footOn(B, 'L', { ...DIE_FEET.L, pitch: tuck }), ...footOn(B, 'R', { ...DIE_FEET.R, pitch: tuck }) });
const kneeling = (lean: number, body: KP): KP => kneelSettle(B, R, { ...kneelHips(B, R, DIE_FEET, TUCK, KNEE_Z, lean), ...body } as P, DIE_FEET, TUCK, KNEE_Z) as KP;
/** His arms let fall where his body puts them as it goes down: each hand on the stones beside him, the elbows out and down. */
function limp(body: KP, back: number, out: number): KP {
  const q = { ...R, ...body, lhIn: 1, rhIn: 1 } as Posed;
  const s = solve(B, q);
  const L: V3 = [s.shoulderL[0] - back, s.shoulderL[1] + out, 3.4];
  const Rr: V3 = [s.shoulderR[0] - back, s.shoulderR[1] - out, 3.4];
  const pose = { ...body, lhx: L[0] - s.shoulderL[0], lhy: L[1] - s.shoulderL[1], lhz: L[2] - s.shoulderL[2], rhx: Rr[0] - s.shoulderR[0], rhy: Rr[1] - s.shoulderR[1], rhz: Rr[2] - s.shoulderR[2] };
  const q2 = { ...R, ...pose, lhIn: 1, rhIn: 1 } as Posed;
  const le = elbowFor(B, q2, true, norm([0, 1, -0.4]));
  const re = elbowFor(B, { ...q2, le } as Posed, false, norm([0, -1, -0.4]));
  return { ...pose, le, re };
}
const HANGING: KP = { lhx: 6, lhy: 6, lhz: -38, le: -10, rhx: 6, rhy: -6, rhz: -38, re: 10 };
function diesPlan(): Plan {
  const ON_KNEES = kneeling(6, { yaw: -4, pitch: 6, roll: 2, twist: 0, bend: 14, side: 2, faceTurn: 0, faceUp: -12, faceTilt: 6, ...HANGING, floor: 0 });
  const FOLD = kneeling(12, { yaw: -4, pitch: 30, roll: 2, twist: 0, bend: 26, side: 1, faceTurn: 0, faceUp: -44, faceTilt: 4, lhx: 6, lhy: 3, lhz: -40, le: -10, rhx: 6, rhy: -3, rhz: -40, re: 10, floor: 0 });
  const SLUMP = limp(kneeling(26, { yaw: -4, pitch: 66, roll: 0, twist: 0, bend: 30, side: 0, faceTurn: 16, faceUp: -60, faceTilt: 12, floor: 0 }), 12, 14);
  const DOWN = { ...limp(kneeling(80, { yaw: -4, pitch: 88, roll: 0, twist: 0, bend: 6, side: 0, faceTurn: 50, faceUp: -24, faceTilt: 30, floor: 0 }), 36, 12), out: 1 };
  const f0 = feetDown(0);
  return {
    long: KG_DIES.long,
    keys: [
      [0, { floor: 1 }],
      [0.12, { px: -2.6, pitch: R.pitch - 6, bend: R.bend - 6, faceUp: R.faceUp + 14, pz: R.pz + 0.8, floor: 1 }],
      [KG_DIES.drop, { px: -1.4, pitch: R.pitch, bend: R.bend + 2, faceUp: R.faceUp + 4, pz: R.pz - 2, ...HANGING, rhx: 8, rhy: -12, rhz: -34, floor: 1, out: 0.2 }],
      [0.75, { ...f0, px: -0.8, pitch: R.pitch + 3, bend: R.bend + 4, pz: R.pz - 9, faceUp: 0, ...HANGING, lk: 24, rk: -24, floor: 0, out: 0.3 }],
      [KG_DIES.knees[1], { ...ON_KNEES, out: 0.45 }],
      [1.35, { ...ON_KNEES, pitch: 3, side: -2, roll: -2, faceTilt: -4, out: 0.55 }],
      [1.6, { ...ON_KNEES, pitch: 9, roll: 3, faceUp: -20, out: 0.7 }],
      [KG_DIES.fold[0], { ...FOLD, out: 0.8 }],
      [KG_DIES.fold[1], { ...SLUMP, out: 0.9 }],
      [2.6, { ...SLUMP, pz: (SLUMP.pz as number) + 0.8, out: 0.95 }],
      [KG_DIES.down, DOWN],
      [KG_DIES.long, DOWN],
    ],
  };
}
/** Where his sword lies once it has fallen from his hand: on the stones at his right, its point behind him. */
function droppedAt(t: number): { pommel: V3; way: V3; across: V3 } | null {
  if (t < KG_DIES.drop) return null;
  const s0 = bonesOf(KING, 'dying', KG_DIES.drop);
  const w = swordOf(s0);
  const k = smooth(0, 0.38, t - KG_DIES.drop);
  const lie: V3 = norm([-0.75, -0.66, 0]);
  const flatAcross: V3 = [-lie[1], lie[0], 0];
  const rest: V3 = [w.pommel[0] + 4, w.pommel[1] - 8, 2.4];
  // (it topples: the pommel falling to the stones, the blade laid flat along them, swung round a little)
  const way = norm(lerp3(w.way, lie, k), lie);
  const across = norm(sub(lerp3(w.across, flatAcross, k), mul(way, dot(lerp3(w.across, flatAcross, k), way))), flatAcross);
  const pommel = lerp3(w.pommel, rest, k * k);
  return { pommel: [pommel[0], pommel[1], Math.max(2.4, pommel[2])], way, across };
}

// =============================================================================================
// HIM, AS THE GAME HOLDS A MONSTER

export const KG_NAMES = {
  stand: 'The King stands bowed under the Hush',
  walk: 'The King walks, dragging his sword',
  attack: 'The sweep',
  decree: 'The Decree',
  crown: 'The Crown',
  curtains: 'The Curtains',
  climbOff: 'The Hush climbs off him',
  reel: 'The King is struck',
  dying: 'He sinks down; the Hush unwinds',
} as const;
const PLANS: Record<string, Plan> = { attack: sweepPlan(), decree: decreePlan(), crown: crownPlan(), curtains: curtainsPlan(), climbOff: climbPlan(), reel: reelPlan(), dying: diesPlan() };
const MOTIONS: Record<string, Motion> = Object.fromEntries(Object.entries(PLANS).map(([k, p]) => [k, motionOf(p, k === 'dying' ? 20 : FPS)]));
MOTIONS.stand = kingStand();
MOTIONS.walk = kingWalk();
/** The strikes, by move: from the last frame of the wind-up to the frame it lands on. */
export const KG_STRIKES: Readonly<Record<string, readonly [number, number]>> = { attack: KG_SWEEP.strike, decree: KG_DECREE.strike, crown: KG_CROWN.strike, curtains: KG_CURTAINS.strike };
export const KG_WARN: Readonly<Record<string, readonly [number, number]>> = { attack: KG_SWEEP.warn, decree: KG_DECREE.warn, crown: KG_CROWN.warn, curtains: KG_CURTAINS.warn };
const byName: Record<string, string> = Object.fromEntries(Object.entries(KG_NAMES).map(([k, v]) => [v, k]));
function bonesOf(mob: Mob, move: string, t: number): Skeleton {
  const mv = move === 'dying' ? mob.dying : move === 'stand' || move === 'walk' || move === 'attack' || move === 'reel' ? mob[move] : mob.more?.[move];
  const keys = (mv as MobMove).motion.keys;
  const long = keys[keys.length - 1].at;
  const tt = Math.max(0, Math.min(long, t));
  let i = 0;
  while (i < keys.length - 2 && tt > keys[i + 1].at) i++;
  const a = keys[i];
  const b = keys[i + 1] ?? a;
  const k = b.at > a.at ? (tt - a.at) / (b.at - a.at) : 0;
  const pose: Record<string, number> = {};
  for (const f of FIELDS) {
    const va = (a.pose as Record<string, number>)[f];
    const vb = (b.pose as Record<string, number>)[f];
    if (typeof va === 'number') pose[f] = va + ((typeof vb === 'number' ? vb : va) - va) * k;
  }
  return solve(B, { ...R, ...pose, lhIn: 1, rhIn: 1 } as Posed);
}
/** Whether a frame of a move shows its strike's smear: from the frame after its wind-up ends to the frame after it lands. */
export function smearedAt(move: string, t: number): boolean {
  const s = KG_STRIKES[move];
  return !!s && t > s[0] + 1e-6 && t <= s[1] + FR + 1e-6;
}
/** His blade as a line of points, from the guard to the point. */
function bladeLine(s: Skeleton): V3[] {
  const w = swordOf(s);
  return [0, 0.25, 0.5, 0.75, 1].map((k) => w.at(k));
}
/** THE SMEAR: after-images of what strikes, along the way it has come since its wind-up ended. */
function smearOf(mob: Mob, move: string, t: number): V3[][] | null {
  if (!smearedAt(move, t)) return null;
  const [s0, s1] = KG_STRIKES[move];
  const to = Math.min(t, s1);
  const out: V3[][] = [];
  // (the whole way it has swept since its wind-up ended, as after-images close together: a fan for the blade, its
  // newest bright; for his hand flung out, its arm)
  const n = move === 'attack' ? 64 : 32;
  for (let i = 0; i <= n; i++) {
    const u = s0 - FR * 0.5 + ((to - (s0 - FR * 0.5)) * i) / n;
    const s = bonesOf(mob, move, u);
    if (move === 'curtains') out.push([lerp3(s.elbowL, s.handL, 0.3), s.handL, add(s.handL, mul(norm(sub(s.handL, s.elbowL)), 6))]);
    else {
      const w = swordOf(s);
      out.push([0, 0.2, 0.4, 0.6, 0.8, 0.92, 1].map((k) => w.at(k)));
    }
  }
  return t > s1 + 1e-6 ? out.slice(Math.floor(out.length * 0.55)) : out;
}
/** SPARKS off his sword's point where it grinds on the stones, and what his blows kick up. */
const SPARK = ['#fff4c8', '#ffd27a', '#ff9a3a'];
const DUST = ['#4a4652', '#6a6674', '#8e8a98'];
function moreOf(move: string, m: Moment): [V3, string, number][] {
  const out: [V3, string, number][] = [];
  const t = m.t;
  const w = swordOf(m.s);
  const tip = w.tip;
  const dragging = tip[2] < TIP_Z + 1.5;
  const moving = move === 'walk' ? 1 : move === 'stand' ? 0.12 : 0.6;
  if (dragging && move !== 'dying') {
    // (sparks thrown back off the point as it grinds along)
    const tick = Math.floor(t * 30);
    const back = norm([-w.way[0], -w.way[1], 0], [-1, 0, 0]);
    for (let i = 0; i < 9; i++) {
      if (hashOf(tick, i) > moving) continue;
      const life = hashOf(tick + 7, i);
      const side = (hashOf(tick + 3, i) - 0.5) * 2;
      const p: V3 = [tip[0] + back[0] * 4 * life - back[1] * side * 3, tip[1] + back[1] * 4 * life + back[0] * side * 3, 0.8 + 4 * life * (1 - life) * 3];
      out.push([p, SPARK[i % 3], i % 4 === 0 ? 2 : 1]);
    }
  }
  const warn = KG_WARN[move];
  if (warn && t >= warn[0] - 0.08 && t <= warn[1] + 0.04 && move !== 'curtains') {
    // (pink glinting up and down his blade's edges through the warning)
    const tick = Math.floor(t * 15);
    for (let i = 0; i <= 12; i++) {
      if ((i + tick) % 3) continue;
      const k = 0.08 + 0.9 * (i / 12);
      out.push([add(w.at(k), mul(w.across, ((i % 2) * 2 - 1) * SWORD.half * 0.9)), (i + tick) % 2 ? FLAME[3] : FLAME[4], 1]);
    }
  }
  // WHAT HIS BLOWS KICK UP where they land: stone chips and dust
  const burst = (at: V3, since: number, n: number, reach: number, seed: number): void => {
    if (since < 0 || since > 0.5) return;
    const k = since / 0.5;
    for (let i = 0; i < n; i++) {
      if (hashOf(i, seed) < k * 0.8) continue;
      const a = (i / n) * TAU + hashOf(i, seed + 1);
      const r = reach * Math.sqrt(k) * (0.4 + 0.8 * hashOf(i, seed + 2));
      const up = (6 + 18 * hashOf(i, seed + 3)) * Math.sin(Math.PI * Math.min(1, k * 1.3));
      out.push([[at[0] + Math.cos(a) * r, at[1] + Math.sin(a) * r * 0.9, 0.6 + up], i % 3 === 0 ? SPARK[1] : DUST[i % 3], i % 5 === 0 ? 3 : 2]);
    }
  };
  if (move === 'attack') burst(swordOf(bonesOf(KING, 'attack', 1.55)).tip, t - 1.5, 26, 16, 5);
  if (move === 'decree') burst(swordOf(bonesOf(KING, 'decree', 1.5)).tip, t - KG_DECREE.hit, 40, 22, 6);
  if (move === 'crown') {
    burst(swordOf(bonesOf(KING, 'crown', 1.62)).tip, t - KG_CROWN.hit, 34, 22, 7);
    burst(lerp3(m.s.toeL, m.s.toeR, 0.5), t - KG_CROWN.hit, 40, 34, 8);
  }
  if (move === 'dying' && t >= KG_DIES.drop + 0.3 && t < KG_DIES.drop + 0.6) {
    const d = droppedAt(t);
    if (d) burst(add(d.pommel, mul(d.way, 30)), t - KG_DIES.drop - 0.32, 14, 10, 9);
  }
  return out;
}

/** THE HUSH AS IT CLIMBS OFF HIM, `t` seconds in: riding; rising up off his back over his head; down at his left, as it stands. */
function climbingHush(s: Skeleton, t: number): HushPose {
  const ride = hushRiding(s, t, [0, 0, 0]);
  const beside = besideHush(0);
  const [r0, r1] = KG_CLIMB.rise;
  const [d0, d1] = KG_CLIMB.down;
  if (t <= r0) {
    // (it lets go: its hands coming off him)
    const k = smooth(0.1, r0, t);
    return { ...ride, handL: add(ride.handL, mul(sub(ride.elL, ride.handL), 0.15 * k)), handR: add(ride.handR, [0, 0, 6 * k]) };
  }
  // (up off his back, high, and out over to his left above where it will stand, its arms out; then straight down onto its place)
  const highUp = hushMoved(beside, [0, 0, 40]);
  const spread = { ...highUp, handL: add(highUp.handL, [0, 12, 18]), handR: add(highUp.handR, [0, -4, 22]), elL: add(highUp.elL, [0, 6, 10]), elR: add(highUp.elR, [0, -2, 12]) };
  if (t <= r1) {
    const k = smooth(r0, r1, t);
    // (lifting off first, and only then out to the side: up out of his arms' way, then across over his shoulder)
    const up = hushMoved(ride, [0, 0, 26 * smooth(0, 0.45, k)]);
    return hushMix(up, spread, smooth(0.3, 1, k));
  }
  if (t <= d1) return hushMix(spread, beside, smooth(d0, d1, t));
  return beside;
}
/** The Hush at his side as its own figure stands, `t` seconds into its stand, on his own floor. */
function besideHush(t: number): HushPose {
  const s = solve(HUSH_BODY, hushStandPosed(t) as Posed);
  return hushMoved(hushStanding(s, [0, 0, 0]), [HUSH_BESIDE[0], HUSH_BESIDE[1], 0]);
}

function kingSay(rider: boolean): KingSay {
  return {
    hush: (m) => {
      const move = byName[m.move ?? ''] ?? '';
      if (move === 'climbOff') return m.t < KG_CLIMB.down[1] + 0.3 ? climbingHush(m.s, m.t) : null;
      return rider ? 'riding' : null;
    },
    unwind: (m) => (m.dying ? smooth(KG_DIES.unwind[0], KG_DIES.unwind[1], m.t) : 0),
    dropped: (m) => (m.dying ? droppedAt(m.t) : null),
    smear: (m) => smearOf(rider ? KING : KING_ALONE, byName[m.move ?? ''] ?? '', m.t),
    more: (m) => moreOf(byName[m.move ?? ''] ?? '', m),
  };
}

function kingMob(rider: boolean): Mob {
  const paint = kingPainter(kingSay(rider));
  const mv = (name: string, motion: Motion, more: Partial<MobMove> = {}): MobMove => ({ name, motion, rest: R, ...more });
  const glow = (warn: readonly [number, number]) => (t: number): number => (t >= warn[0] && t <= warn[1] ? 1 : 0);
  const more: Record<string, MobMove> = {
    decree: mv(KG_NAMES.decree, MOTIONS.decree, { glint: glow(KG_DECREE.warn) }),
    crown: mv(KG_NAMES.crown, MOTIONS.crown, { glint: glow(KG_CROWN.warn) }),
    curtains: mv(KG_NAMES.curtains, MOTIONS.curtains),
  };
  if (rider) more.climbOff = mv(KG_NAMES.climbOff, MOTIONS.climbOff);
  return {
    id: rider ? 'king' : 'kingAlone',
    name: 'The King',
    size: 'a boss: twice the knight, with the Hush on his back',
    build: B,
    stand: mv(KG_NAMES.stand, MOTIONS.stand),
    attack: mv(KG_NAMES.attack, MOTIONS.attack, { glint: glow(KG_SWEEP.warn) }),
    more,
    idleFrames: STAND_FRAMES,
    idleFps: 10,
    walk: mv(KG_NAMES.walk, MOTIONS.walk, { period: KG_WALK.frames / KG_WALK.fps, ground: KG_PACE * TILE3 }),
    walkFrames: KG_WALK.frames,
    walkFps: KG_WALK.fps,
    pace: KG_PACE,
    reel: mv(KG_NAMES.reel, MOTIONS.reel),
    reelTime: KG_REEL,
    hit: KG_SWEEP.hit,
    warn: KG_SWEEP.warn[1] - KG_SWEEP.warn[0],
    dieTime: KG_DIES.long,
    dying: mv(KG_NAMES.dying, MOTIONS.dying),
    aura: { x: KING_CANVAS.ax, y: KING_CANVAS.ay - 60, r: 60, color: '#5a5a8a', a: 0.08 },
    shadow: 26,
    canvas: KING_CANVAS,
    trueBack: true,
    bits: paint.bits,
    grains: paint.grains,
  };
}

// =============================================================================================
// THE HUSH ON ITS OWN (his last phase): it stands at his side; its own moves are to come

export const HS_STAND_LONG = 3.6;
const HUSH_FRAMES = 36;
const HR = HUSH_REST;
function hushStandPosed(t: number): P {
  const a = (t / HS_STAND_LONG) * TAU;
  const b = (t / (HS_STAND_LONG / 2)) * TAU;
  return {
    ...HR,
    pz: HR.pz + 1.6 * Math.sin(b), py: 2.2 * Math.sin(a), roll: 2 * Math.sin(a), side: 2.5 * Math.sin(a + 0.5), bend: HR.bend + 2 * Math.sin(b + 0.6),
    faceTurn: 14 * Math.sin(a + 0.3), faceTilt: HR.faceTilt + 7 * Math.sin(a * 2 + 0.2), faceUp: HR.faceUp + 3 * Math.sin(b),
    lhx: HR.lhx + 2.5 * Math.sin(a + 1), lhy: HR.lhy + 1.5 * Math.sin(b), lhz: HR.lhz + 1.8 * Math.sin(b + 0.4),
    rhx: HR.rhx + 2.5 * Math.sin(a + 2.4), rhy: HR.rhy - 1.5 * Math.sin(b + 1), rhz: HR.rhz + 1.8 * Math.sin(b + 1.4),
    lfz: HR.lfz + 1.6 * Math.sin(b), rfz: HR.rfz + 1.6 * Math.sin(b),
  };
}
function hushStand(): Motion {
  const keys: Key3[] = [];
  for (let i = 0; i <= HUSH_FRAMES; i++) {
    const t = (i / HUSH_FRAMES) * HS_STAND_LONG;
    keys.push({ at: t, ease: 'lin', pose: hushStandPosed(t) });
  }
  return { loop: 0, keys };
}
/** ITS END (as he dies): it rears up, its arms thrown up, and unwinds into nothing, its fog spiralling up off it. */
export const HS_DIES = { long: 3.0, unwind: [0.25, 2.6] as const };
function hushDies(): Motion {
  const up = (k: number): P => ({ ...HR, pz: HR.pz + 10 * k, pitch: HR.pitch - 14 * k, bend: HR.bend - 20 * k, faceUp: HR.faceUp + 30 * k, lhIn: 0, lhx: 6, lhy: 10 + 6 * k, lhz: -44 + 70 * k, le: -16, rhIn: 0, rhx: 6, rhy: -10 - 6 * k, rhz: -44 + 70 * k, re: 16 });
  const keys: Key3[] = [];
  for (let i = 0; i <= Math.round(HS_DIES.long * 20); i++) {
    const t = i / 20;
    keys.push({ at: t, ease: 'lin', pose: up(smooth(0, 0.9, t)) });
  }
  return { keys };
}
function hushMob(): Mob {
  const paint = hushPainter((m) => (m.dying ? smooth(HS_DIES.unwind[0], HS_DIES.unwind[1], m.t) : 0));
  const stand: MobMove = { name: 'The Hush stands at his side', motion: hushStand(), rest: HR };
  return {
    id: 'hush',
    name: 'The Hush',
    size: 'a boss’s other half: the King’s height, at his side',
    build: HUSH_BODY,
    stand,
    // (its own moves are to come: until then its stand stands in for them, and the review does not look at them)
    attack: { ...stand, name: 'The Hush (its attack to come)' },
    walk: { ...stand, name: 'The Hush (its glide to come)' },
    reel: { ...stand, name: 'The Hush (struck: to come)' },
    idleFrames: HUSH_FRAMES,
    idleFps: 10,
    walkFrames: HUSH_FRAMES,
    walkFps: 10,
    pace: 0,
    reelTime: 0.3,
    hit: 0,
    warn: 0,
    dieTime: HS_DIES.long,
    dying: { name: 'The Hush unwinds into nothing', motion: hushDies(), rest: HR },
    aura: { x: HUSH_CANVAS.ax, y: HUSH_CANVAS.ay - 50, r: 40, color: '#625a7a', a: 0.06 },
    shadow: 10,
    canvas: HUSH_CANVAS,
    trueBack: true,
    bits: paint.bits,
    grains: paint.grains,
  };
}
export const HUSH: Mob = hushMob();

export const KING: Mob = kingMob(true);
/** HIM IN HIS LAST PHASE: the Hush climbed off him (it stands at his side as HUSH); the same moves. */
export const KING_ALONE: Mob = kingMob(false);
export function makeKingArt3(mob: Mob = KING): ActorArt {
  return { front: mobSet(mob, 'front', mob.pace), back: mobSet(mob, 'back', mob.pace) };
}
export function makeHushArt3(): ActorArt {
  return { front: mobSet(HUSH, 'front', 1), back: mobSet(HUSH, 'back', 1) };
}

// =============================================================================================
// HIM AS THE CHECKS SEE HIM (art/boss_checks.ts)

export function kingSolids(s: Skeleton, rider: boolean, hush?: HushPose | null): { limbs: CheckLimb[]; lumps: CheckLump[] } {
  const [rH, rK, rA] = B.legR;
  const [r0, r1] = B.armR;
  const limbs: CheckLimb[] = [];
  for (const side of ['L', 'R'] as const) {
    const L = side === 'L';
    limbs.push(
      { name: `leg${side}`, a: L ? s.hipL : s.hipR, b: L ? s.kneeL : s.kneeR, r: rH * 1.12 },
      { name: `shin${side}`, a: L ? s.kneeL : s.kneeR, b: L ? s.ankleL : s.ankleR, r: Math.max(rK, rA) * 1.18 },
      { name: `upper${side}`, a: L ? s.shoulderL : s.shoulderR, b: L ? s.elbowL : s.elbowR, r: r0 * 1.12 },
      { name: `fore${side}`, a: L ? s.elbowL : s.elbowR, b: L ? s.handL : s.handR, r: r1 * 1.1 },
    );
  }
  limbs.push({ name: 'neck', a: s.neck, b: lerp3(s.neck, s.head, 0.5), r: 3.4 });
  const waistC = add(s.pelvis, mul(s.hips[2], B.waist * 0.5));
  const lumps: CheckLump[] = [
    { name: 'head', c: add(s.head, mul(s.face[2], -0.2)), rot: s.face, h: [B.headR[0] * 1.05, B.headR[1] * 1.08, B.headR[2] * 1.02] },
    { name: 'chest', c: lerp3(s.ribs, s.neck, 0.3), rot: s.chest, h: [B.ribDeep + 2.8, B.ribHalf + 2.4, len(sub(s.neck, s.ribs)) * 0.55] },
    { name: 'belly', c: lerp3(waistC, s.ribs, 0.45), rot: s.belly, h: [B.waistDeep + 2.8, B.waistHalf + 2.6, Math.max(3, len(sub(s.ribs, waistC)) * 0.6)] },
    { name: 'hips', c: add(s.pelvis, mul(s.hips[2], B.waist * 0.2)), rot: s.hips, h: [B.pelvisDeep + 2.6, B.pelvisHalf + 2.4, B.waist * 0.75] },
  ];
  const H = hush === undefined ? (rider ? hushRiding(s, 0, [0, 0, 0]) : null) : hush;
  if (H && H.gone < 0.5) lumps.push({ name: 'hush', c: H.chest, rot: H.rot, h: [6.5 * H.bulk, 10.5 * H.bulk, 8] });
  return { limbs, lumps };
}
/** What he carries, and what rides him, at a moment of a move. */
function thingsOf(mob: Mob, move: string, t: number, s: Skeleton): CheckThing[] {
  const out: CheckThing[] = [];
  if (!(move === 'dying' && t >= KG_DIES.drop)) out.push({ name: 'sword', pts: bladeLine(s), r: 1.5, may: ['foreR', 'foreL'] });
  const H = hushAt(mob, move, t, s);
  if (H && H.gone < 0.5) {
    out.push({ name: 'hushArmR', pts: [H.shR, lerp3(H.shR, H.elR, 0.5), H.elR, lerp3(H.elR, H.handR, 0.5), H.handR], r: 1.6, may: ['upperR', 'chest', 'hush'] });
    out.push({ name: 'hushArmL', pts: [H.shL, lerp3(H.shL, H.elL, 0.5), H.elL, lerp3(H.elL, H.handL, 0.5), H.handL], r: 1.6, may: ['upperL', 'chest', 'hush'] });
  }
  return out;
}
/** The Hush with him at a moment of a move (riding, climbing off, or not with him). */
function hushAt(mob: Mob, move: string, t: number, s: Skeleton): HushPose | null {
  if (move === 'climbOff') return t < KG_CLIMB.down[1] + 0.3 ? climbingHush(s, t) : null;
  if (mob.id !== 'king') return null;
  const H = hushRiding(s, t, [0, 0, 0]);
  return move === 'dying' ? { ...H, gone: smooth(KG_DIES.unwind[0], KG_DIES.unwind[1], t) } : H;
}
const tipOf = (move: string, t: number, s: Skeleton): V3 | null => {
  if (move === 'curtains') return s.handL;
  if (move === 'dying') return t < KG_DIES.drop ? swordOf(s).tip : null;
  return swordOf(s).tip;
};
const STOPS = KG_WALK_STOPS;
function handoversOf(mob: Mob): Handover[] {
  const moves = ['attack', 'decree', 'crown', 'curtains', 'reel', ...(mob.id === 'king' ? ['climbOff'] : [])];
  return [
    ...moves.flatMap((m): Handover[] => [{ from: 'stand', at: 0, to: m, toAt: 0 }, { from: m, at: 'end', to: 'stand', toAt: 0, mob: m === 'climbOff' ? KING_ALONE : undefined }]),
    { from: 'stand', at: 0, to: 'dying', toAt: 0 },
    // (his walk: set off at a frame where his feet pass, and stopped at one)
    { from: 'stand', at: 0, to: 'walk', toAt: STOPS[0] },
    ...STOPS.map((t): Handover => ({ from: 'walk', at: t, to: 'stand', toAt: 0 })),
  ];
}
function kingShape(mob: Mob): BossShape {
  return {
    body: (s) => kingSolids(s, mob.id === 'king'),
    tip: (move, t, s) => tipOf(move, t, s),
    things: (move, t, s) => thingsOf(mob, move, t, s),
    strikes: KG_STRIKES,
    smeared: smearedAt,
    handovers: handoversOf(mob),
    after: mob.id === 'king' ? { climbOff: KING_ALONE } : undefined,
    thingsOf: (other) => (move, t, s) => thingsOf(other, move, t, s),
  };
}
export const KG_SHAPE: BossShape = kingShape(KING);
export const KG_ALONE_SHAPE: BossShape = kingShape(KING_ALONE);
/** The Hush on its own: it hovers (a flier, its feet never down); its stand and its end are reviewed (its other moves are to come). */
export const HS_SHAPE: BossShape = {
  body: (s) => {
    const [cf, cl, cu] = s.chest;
    return {
      limbs: [{ name: 'neck', a: s.neck, b: lerp3(s.neck, s.head, 0.5), r: 2.2 }, { name: 'upperL', a: s.shoulderL, b: s.elbowL, r: 2.6 }, { name: 'upperR', a: s.shoulderR, b: s.elbowR, r: 2.6 }],
      lumps: [
        { name: 'head', c: s.head, rot: s.face, h: [6.2, 5.6, 8.6] },
        { name: 'chest', c: lerp3(s.ribs, s.neck, 0.35), rot: [cf, cl, cu], h: [6.5, 10.5, 9] },
      ],
    };
  },
  pictures: ['walk', 'attack', 'reel'],
  handovers: [{ from: 'stand', at: 0, to: 'dying', toAt: 0 }],
};
void cross;
void HS_STAND_LONG;
