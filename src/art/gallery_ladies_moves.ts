// FLOOR 18'S LADIES-IN-WAITING: THEIR MOVES (the art chat, 29 Oct 2026). A MOCK-UP: NOT IN THE GAME, behind LADIES_ON
// (art/gallery_ladies.ts, off). Their look and the brief are art/gallery_ladies.ts; the light their mirrors throw on the
// floor, art/gallery_ladies_fx.ts.
//
// His pick for how they move: “Gliding in a line, quick (Recommended)”. His rule of 24 Oct for every attack (Movement 9:
// “Like the wind up and wind down are big but the actual punch is lightning quick”), and for the enemies, 28 Oct: “Start
// from now on, but every enemy is going to need that change eventually.  And bigger AOE to compensate for the extra time
// the player gets to evade”; and, of speed, “Everything is always so plodding when you first animate them.” So they are made
// quick from the first pass, measured in tiles, and their one blow winds up big and held, strikes in two frames smeared,
// and winds down big, its light thrown far.
//
// THEIR MOVES:
//   STANDING: the mirror held up to her face, gazing into it, turning her head to it; she breathes, her weight shifts, her
//     lips move on no sound, the grey breath leaking out; now and then her free hand goes up to the lace at her breast.
//   THE GLIDE (her walk, `LD_PACE` 3.2 tiles a second, quicker than the knight's 2.5): quick small steps hidden under the
//     hem, the body carried level and leaning into the going, the skirt sweeping back and swinging, the mirror held up.
//     (They come in a neat line: the game's to lay; the film shows four.)
//   THE DART (`LD_DART`): a dip, then a burst at you, two and a half tiles in under half a second, low and leaning, the
//     skirt streaming back and her free hand gathering it; she checks, the skirt swinging on past her, and settles. Painted
//     going on through her own picture: the game sets her down where it ends (`LD_DART.reach`).
//   THE FLASH (her one attack, `LD_FLASH`): she turns side-on, the mirror swept up high over her right shoulder and turned
//     to the light, her left hand pointing at you, and holds it while the glint builds on the glass (THE WARNING); her hips
//     come round first; THE STRIKE, in two frames, smeared: the mirror whipped round and down at you at arm's length, and
//     its light thrown out in a beam four and a half tiles long, two and a half wide at its end (art/gallery_ladies_fx.ts
//     lays it on the floor); carried on; then drawn back up to her face.
//   STRUCK: jolted back, the mirror jerked up, the Hush coughed out.
//   THE MIRROR CRACKS, THE HUSH LEAVES HER (her death): struck, she looks into the mirror and it cracks across; a gasp,
//     the Hush pouring up out of her in one great grey breath; the mirror falls from her hand; her knees give and she
//     sinks to the floor in a pool of her skirts, sits back, and bows over, a hand on the floor: alive, a woman again.
//
// By his rulebook: every move through every check the bosses have (art/boss_checks.ts), from in front and behind.
//   test: tsx --test tests/gallery_ladies.test.ts

import type { ActorArt } from './actor_types';
import type { BossShape, CheckLimb, CheckLump, CheckThing, Handover } from './boss_checks';
import { footwork, kneelHips, kneelSettle, plantBy, plantOf } from './bosses3';
import type { Plant } from './bosses3';
import { LADY_BODY, LADY_CANVAS, MIRROR, ladyPainter, mirrorOf } from './gallery_ladies';
import type { LadySay } from './gallery_ladies';
import { flashBeam, FLASH_FX } from './gallery_ladies_fx';
import { hash } from './kit';
import { TILE3, mobSet } from './new_mobs3';
import type { Mob, MobMove, Moment } from './new_mobs3';
import { add, aimFor, elbowFor, lerp3, mul, norm, solve, standing, sub } from './skeleton';
import type { Bones, Key3, Motion, Posed, Skeleton, V3 } from './skeleton';

type P = Partial<Bones>;
const B = LADY_BODY;
const FPS = 30;
const FR = 1 / FPS;
const fr = (t: number): number => t - Math.floor(t);
const clamp01 = (v: number): number => Math.max(0, Math.min(1, v));
const smooth = (a: number, b: number, t: number): number => {
  const u = clamp01((t - a) / (b - a));
  return u * u * (3 - 2 * u);
};

// =============================================================================================
// HOW SHE HOLDS HER MIRROR

/** The mirror's handle pointing `up`, its glass facing `face` (the figure's own ways): the bones' fields for it. */
const holding = (up: V3, face: V3): P => aimFor(norm(up), norm(face));
/** Her right fist from her right shoulder along the figure's ways; her left the same from her left. */
const rightAt = (x: number, y: number, z: number): P => ({ rhIn: 1, rhx: x, rhy: y, rhz: z });
const leftAt = (x: number, y: number, z: number): P => ({ lhIn: 1, lhx: x, lhy: y, lhz: z });

/** HER REST: upright and proud; the mirror held up before her face in her right hand, its glass turned to her, her head turned and tipped to it; her left hand at her waist; her feet together, the left a little before, turned out. */
const REST0: Bones = {
  ...standing(B),
  pz: 0, pitch: -2, bend: -2, roll: 0, side: 0, faceUp: -2, faceTilt: 6, faceTurn: -30,
  lfx: 1.4, lfy: 0.6, lft: 16, lk: 12, rfx: -1.0, rfy: -0.4, rft: -18, rk: -12,
  ...leftAt(6.2, -4.6, -18.5),
  ...rightAt(3.8, -6.2, 0.4),
  ...holding([0.05, -0.15, 1], [0.1, 1, 0.05]),
  le: 0, re: 0, out: 0,
} as Bones;
function elbowsTo(pose: P, wantL: V3 | null, wantR: V3 | null, rest: Bones = REST0): P {
  const q = { ...rest, ...pose } as Posed;
  const le = wantL ? elbowFor(B, q, true, norm(wantL)) : q.le;
  const re = wantR ? elbowFor(B, { ...q, le } as Posed, false, norm(wantR)) : q.re;
  return { ...pose, le, re };
}
/** (her elbows: the left out to her side and back, the right down and out under the mirror) */
const ELBOW_L: V3 = [-0.3, 1, -0.6];
const ELBOW_R: V3 = [0.1, -0.8, -1];
export const LADY_REST: Bones = { ...REST0, ...elbowsTo({}, ELBOW_L, ELBOW_R) } as Bones;
const R = LADY_REST;
const L0 = plantOf(B, 'L', {}, R);
const R0 = plantOf(B, 'R', {}, R);

// =============================================================================================
// A MOVE THROUGH KEY POSES (as the Princess's, art/princess_moves.ts): every field through its keys smoothly, its speed
// carried through each key, not stopped at it; but straight through a lightning strike; sampled on the game's frames

/** A value through keys [time, value], smooth through each (a monotone cubic: no overshoot; it stops only where it turns back or holds). */
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
  keys: ReadonlyArray<readonly [number, P]>;
  /** The strike: from the last frame of its wind-up to the frame it lands on. */
  strike?: readonly [number, number];
  hit?: number;
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

// =============================================================================================
// STANDING: GAZING INTO HER MIRROR

export const LD_STAND_LONG = 2.4;
export const LD_IDLE = { frames: 24, fps: 10 } as const;
function standMotion(): Motion {
  const T = LD_STAND_LONG;
  const keys: Key3[] = [];
  const N = 48;
  for (let i = 0; i <= N; i++) {
    const t = (i / N) * T;
    const a = (t / T) * Math.PI * 2;
    // (once round: her free hand up to the lace at her breast and down again)
    const tuck = smooth(1.15, 1.5, t) * (1 - smooth(1.75, 2.15, t));
    const l: V3 = [6.2 + (5.6 - 6.2) * tuck, -4.6 + (-2.8 + 4.6) * tuck, -18.5 + (-8.5 + 18.5) * tuck];
    keys.push({
      at: t,
      ease: 'lin',
      pose: elbowsTo({
        pz: R.pz + 0.75 * Math.sin(a), py: 1.1 * Math.sin(a + 0.6), roll: R.roll + 1.6 * Math.sin(a + 0.6), side: R.side + 1.2 * Math.sin(a + 0.6),
        bend: R.bend - 1.4 * Math.sin(a),
        faceTurn: R.faceTurn + 6 * Math.sin(a + 0.4), faceTilt: R.faceTilt + 4 * Math.sin(a * 2 + 0.3), faceUp: R.faceUp + 2 * Math.sin(a + 1),
        ...leftAt(l[0] + 0.4 * Math.sin(a), l[1], l[2] + 0.4 * Math.sin(a + 1)),
        ...rightAt(3.8 + 0.5 * Math.sin(a + 0.9), -6.2 + 0.4 * Math.sin(a + 0.2), 0.4 + 0.5 * Math.sin(a)),
        ...holding([0.05 + 0.06 * Math.sin(a + 0.9), -0.15 + 0.05 * Math.sin(a), 1], [0.1 + 0.12 * Math.sin(a + 0.4), 1, 0.05 + 0.04 * Math.sin(a * 2)]),
      }, lerp3(ELBOW_L, [0.2, 1, -0.4], tuck), ELBOW_R),
    });
  }
  return { loop: 0, keys };
}
/** Her lips, moving on words that make no sound. */
export function ladyJaw(t: number): number {
  const u = fr(t / LD_STAND_LONG);
  return 0.3 + 0.55 * Math.max(0, Math.sin(u * Math.PI * 7)) * (u < 0.45 || u > 0.9 ? 1 : 0.25);
}

// =============================================================================================
// THE GLIDE (his pick, “Gliding in a line, quick (Recommended)”)

/** Her pace gliding, tiles a second (the knight walks 2.5; the gardeners rush at 1.6). */
export const LD_PACE = 3.2;
export const LD_GLIDE = { frames: 8, fps: 30 } as const;
/** A foot through one round of the glide: down and going back under her for half of it, then up a little and forward (small quick steps under the hem). */
function stepFoot(k: number, n: number, step: number, lift: number): [number, number, number] {
  const half = n / 2;
  if (k <= half) return [step * (half / 2 - k), 0, 0];
  const u = (k - half) / half;
  const g = u * u * (3 - 2 * u);
  return [-step * (half / 2) + step * half * g, lift * Math.sin(Math.PI * u), 4 * Math.sin(Math.PI * u) * (1 - u) - 6 * Math.sin(Math.PI * u) * u];
}
function glideMotion(): Motion {
  const n = LD_GLIDE.frames;
  const d = (LD_PACE * TILE3) / LD_GLIDE.fps;
  const keys: Key3[] = [];
  for (let i = 0; i <= n; i++) {
    const j = i % n;
    const a = (j / n) * Math.PI * 2;
    const [lx, lz, lp] = stepFoot(j, n, d, 2.4);
    const [rx, rz, rp] = stepFoot((j + n / 2) % n, n, d, 2.4);
    // (carried level: the least of bobs; her hips swaying from foot to foot, her shoulders a little against them)
    const bob = Math.abs(Math.cos(a));
    keys.push({
      at: i / LD_GLIDE.fps,
      ease: 'lin',
      pose: elbowsTo({
        pz: R.pz - 1.0 - 0.4 * bob, py: 0.6 * Math.sin(a), roll: 2.2 * Math.sin(a), yaw: 3 * Math.cos(a), twist: -3 * Math.cos(a), side: -1.0 * Math.sin(a),
        pitch: 6, bend: 2, faceUp: R.faceUp + 2, faceTilt: R.faceTilt - 2, faceTurn: R.faceTurn + 6,
        lfx: lx + 0.6, lfz: lz, lfp: lp, lfy: 0.3, lft: 8, lk: 6,
        rfx: rx - 0.6, rfz: rz, rfp: rp, rfy: -0.3, rft: -8, rk: -6,
        ...leftAt(6.0 + 0.4 * Math.sin(a), -4.4, -18.8 + 0.3 * bob),
        ...rightAt(4.4, -6.0, -0.2 + 0.3 * bob),
        ...holding([0.14, -0.15, 1], [0.1, 1, 0.05]),
      }, ELBOW_L, ELBOW_R),
    });
  }
  return { keys, loop: 0 };
}

// =============================================================================================
// THE DART: a burst at you

/** Its times; how far it takes her (her own lengths: two and a half tiles); its burst. */
export const LD_DART = { long: 0.8, reach: 2.5 * TILE3, burst: [0.1, 0.44] as const } as const;
const DART = LD_DART.reach;
/** How far on she is at a moment of it (her own lengths): the game's, to carry her by, if it would. */
export const dartAlong = (t: number): number => DART_PX(t);
const DART_PX = track([[0, 0], [0.1, -0.6], [0.17, 9], [0.25, 34], [0.33, 62], [0.4, 84], [0.48, 95.5], [0.6, DART]]);
function dartPlan(): Plan {
  const at = (t: number): number => DART_PX(t);
  return {
    long: LD_DART.long,
    keys: [
      [0, {}],
      // (the dip: down, leaning in, the mirror drawn in to her breast, her left hand going down to gather her skirt)
      [0.1, { px: at(0.1), pz: -3.6, pitch: 10, bend: 6, faceUp: 6, faceTurn: 0, faceTilt: 2, ...leftAt(5.2, 1.0, -26), ...rightAt(6.2, 3.4, -9), ...holding([0.5, 0.2, 1], [-0.7, 0.6, 0.3]) }],
      // (the burst: low and leaning hard, her skirt gathered up before her)
      [0.25, { px: at(0.25), pz: -4.2, pitch: 18, bend: 8, faceUp: 14, faceTurn: 0, faceTilt: 0, roll: -2, ...leftAt(7.4, 1.6, -25), ...rightAt(5.8, 3.2, -10), ...holding([0.6, 0.2, 1], [-0.6, 0.6, 0.4]) }],
      [0.4, { px: at(0.4), pz: -3.4, pitch: 12, bend: 6, faceUp: 10, faceTurn: 0, faceTilt: 2, roll: 2, ...leftAt(7.0, 1.2, -25), ...rightAt(6.2, 3.2, -9.5), ...holding([0.5, 0.2, 1], [-0.65, 0.6, 0.35]) }],
      // (she checks: rocked back, the skirt swinging on past her)
      [0.52, { px: at(0.52), pz: -1.6, pitch: -6, bend: -5, faceUp: 0, faceTurn: -6, faceTilt: 6, roll: 0, ...leftAt(7.4, -2.2, -18.5), ...rightAt(4.0, -5.6, -1.2), ...holding([0.12, -0.12, 1], [0.05, 1, 0.1]) }],
      [0.66, { px: at(0.66), pz: -0.4, pitch: -3, bend: -2.5, faceUp: -2, faceTurn: -12, faceTilt: 8, ...leftAt(6.2, -4.5, -18.6), ...rightAt(3.8, -6.2, 0.3) }],
      [LD_DART.long, { px: DART }],
    ],
  };
}
function dartFeet(): (t: number) => P {
  // (a stride on each foot, down and up as quick as the game's frames: two and a half tiles in four steps and a closing one)
  return footwork(B, {
    L: { start: L0, moves: [{ t0: 0.15, t1: 0.25, to: plantBy(L0, 46, 0.8, -6), lift: 2.6 }, { t0: 0.33, t1: 0.44, to: plantBy(L0, DART - 1.2, 0, 0), lift: 2.4 }, { t0: 0.5, t1: 0.62, to: plantBy(L0, DART, 0), lift: 1.4 }] },
    R: { start: R0, moves: [{ t0: 0.09, t1: 0.18, to: plantBy(R0, 22, -0.6, 4), lift: 2.4 }, { t0: 0.24, t1: 0.34, to: plantBy(R0, 70, -0.8, 6), lift: 2.6 }, { t0: 0.41, t1: 0.52, to: plantBy(R0, DART, 0), lift: 1.8 }] },
  });
}

// =============================================================================================
// THE FLASH (her one attack): Movement 9, big held wind-up, a strike of two frames, big wind-down

/**
 * Its times (seconds): how long; the warning (the mirror up and turned to the light, the glint building), held from and
 * to; the strike, from the last frame of the wind-up to the frame it lands on (two of the game's frames); the blow.
 */
export const LD_FLASH = { long: 1.4, warn: [0.3, 0.6] as const, strike: [19 / FPS, 21 / FPS] as const, hit: 21 / FPS } as const;
const H = LD_FLASH.hit;
/** Up: turned side-on, the mirror swept up over her right shoulder and turned to the light above, her left hand pointing at you. */
const RAISED: P = { yaw: -32, twist: -16, pitch: -7, bend: -10, side: 3, roll: -2, pz: 1.0, faceUp: 6, faceTurn: 36, faceTilt: -4, ...leftAt(16, -3.0, 1.5), ...rightAt(-6.2, -3.8, 18.4), ...holding([-0.55, -0.3, 1], [0.3, 0.1, 1]) };
const LIFTING: P = { yaw: -14, twist: -7, pitch: -3, bend: -4, side: 1, pz: 0.3, faceUp: 0, faceTurn: 12, faceTilt: 2, ...leftAt(11, -4.2, -9), ...rightAt(2.5, -1.0, 9), ...holding([-0.15, -0.1, 1], [-0.4, 0.3, 0.8]) };
/** Her hips come round first, her chest still back. */
const HIPS_FIRST: P = { ...RAISED, yaw: -16, twist: -32, pitch: -4 };
/** STRUCK: the mirror whipped round and down at you at arm's length, its glass full on you; leaning in. */
const FLASHED: P = { yaw: 14, twist: 8, pitch: 9, bend: 8, side: -1, roll: 0, pz: -1.4, faceUp: -4, faceTurn: -2, faceTilt: 0, ...leftAt(-2.5, 3.5, -17.5), ...rightAt(17.5, 2.0, -3.0), ...holding([0.45, 0.05, 1], [1, 0, -0.42]) };
/** Carried on: a little further and lower. */
const THROUGH: P = { ...FLASHED, yaw: 18, twist: 11, pitch: 12, bend: 10, pz: -2.0, ...rightAt(18.2, 3.2, -9.0), ...holding([0.62, 0.08, 1], [1, 0, -0.62]) };
function flashPlan(): Plan {
  const [w0, w1] = LD_FLASH.warn;
  const [s0, s1] = LD_FLASH.strike;
  return {
    long: LD_FLASH.long,
    strike: LD_FLASH.strike,
    hit: H,
    keys: [
      [0, {}],
      [0.15, LIFTING],
      [w0, RAISED],
      [0.45, { ...RAISED, ...rightAt(-6.4, -3.9, 18.8), pz: 1.15 }],
      [w1, RAISED],
      [s0, HIPS_FIRST],
      [s1, FLASHED],
      [0.8, THROUGH],
      [0.95, { ...THROUGH, yaw: 12, twist: 6, pitch: 8, bend: 6, pz: -1.4, ...rightAt(15.5, 3.4, -8.2), ...leftAt(1, 1, -18.5) }],
      [1.18, { yaw: 3, twist: 1, pitch: 1, bend: 0, pz: -0.4, faceTurn: -8, faceUp: -2, ...rightAt(11.5, 3.0, -4.5), ...leftAt(4.5, -3.0, -18.8), ...holding([0.2, 0.02, 1], [-0.6, 0.45, 0.4]) }],
      [LD_FLASH.long, {}],
    ],
  };
}
function flashFeet(): (t: number) => P {
  return footwork(B, {
    // (the left foot a step in as the hips come round; the right turning on its ball behind; both back after)
    L: { start: L0, moves: [{ t0: 0.5, t1: 0.63, to: plantBy(L0, 7.5, 0.8, 4), lift: 1.8 }, { t0: 1.06, t1: 1.3, to: L0, lift: 1.6 }] },
    R: { start: R0, moves: [{ t0: 0.6, t1: 0.74, to: { ...R0, pitch: 22, turn: R0.turn + 10 } }, { t0: 1.08, t1: 1.3, to: R0 }] },
  });
}
/** The glint on the glass through the wind-up: building as it is raised, full through the held warning, and gone as the light is thrown. */
function flashGlint(t: number): number {
  if (t < 0.12 || t > H + FR) return 0;
  return t <= LD_FLASH.warn[1] ? smooth(0.12, LD_FLASH.warn[1], t) : 1;
}
const flashJaw = (t: number): number => (t < 0.15 ? 0.4 + 2 * t : t < H + 0.15 ? 0.95 : 0.95 - 0.55 * smooth(H + 0.15, LD_FLASH.long, t));

// =============================================================================================
// STRUCK, AND HER DEATH

export const LD_REEL = 0.4;
const JOLT: P = { px: -4.6, pitch: -13, bend: -16, side: -4, roll: 3, faceUp: 26, faceTilt: 18, faceTurn: -4, pz: 0.2, ...rightAt(3.0, -7.0, 8.0), ...leftAt(7.0, 3.0, -9), ...holding([-0.4, -0.3, 1], [-0.5, 0.8, 0.4]), out: 0.1 };
function reelPlan(): Plan {
  return { long: LD_REEL, keys: [[0, {}], [0.08, JOLT], [0.2, { px: -3.2, pitch: -5, bend: -6, side: -1, faceUp: 10, faceTilt: 10, ...rightAt(3.6, -6.0, 3.0), ...leftAt(6.6, -2.0, -15) }], [LD_REEL, {}]] };
}
/** Struck, knocked back a step: her left foot back under her as she is jolted, and in again. */
function reelFeet(): (t: number) => P {
  return footwork(B, {
    L: { start: L0, moves: [{ t0: 0.02, t1: 0.13, to: plantBy(L0, -5.5, 0.6, -4), lift: 1.6 }, { t0: 0.24, t1: 0.38, to: L0, lift: 1.4 }] },
  });
}

/** Her death's times: the jolt; the mirror cracking; the gasp; the mirror dropped; her knees giving; down; sat back; bowed and still. */
export const LD_DIES = { long: 2.6, crack: [0.18, 0.42] as const, gasp: 0.45, drop: 0.56, knees: 1.05, sit: 1.55, still: 2.3 } as const;
const TUCK = 56;
const KNEE_Z = B.legR[1] * 1.3;
const DIE_FEET: Record<'L' | 'R', Plant> = { L: plantBy(L0, R0.at[0] - L0.at[0] - 4.5, -0.6), R: R0 };
const kneeling = (lean: number, body: P): P => kneelSettle(B, R, { ...kneelHips(B, R, DIE_FEET, TUCK, KNEE_Z, lean), ...body }, DIE_FEET, TUCK, KNEE_Z);
/** On her knees: the pose's hips and legs, with her body over them. */
function diesPlan(): Plan {
  const ON_KNEES = kneeling(4, { pitch: 3, bend: 8, roll: 2, faceUp: -18, faceTurn: -4, faceTilt: 10, ...leftAt(7.5, -3.5, -14), ...rightAt(7.0, 3.0, -13), out: 1 });
  const SAT = kneeling(-48, { pitch: 2, bend: 14, roll: 3, faceUp: -26, faceTurn: -6, faceTilt: 12, ...leftAt(8.5, 0.5, -17), ...rightAt(7.0, 3.5, -16), out: 1 });
  // (bowed over, sat back on her heels, her left hand on the floor by her knee, her right in her lap)
  const sb = solve(B, { ...R, ...SAT } as Posed);
  void sb;
  const BOWED0 = kneeling(-58, { pitch: 36, bend: 46, roll: 6, side: -8, faceUp: -40, faceTurn: -10, faceTilt: 18, ...rightAt(11, 4.5, -12), out: 1 });
  const bb = solve(B, { ...R, ...BOWED0, lhIn: 1, lhx: 0, lhy: 0, lhz: -10 } as Posed);
  const floorHand: V3 = [bb.kneeL[0] + 4.5, bb.kneeL[1] + 5.0, 1.4];
  const BOWED: P = { ...BOWED0, ...leftAt(floorHand[0] - bb.shoulderL[0], floorHand[1] - bb.shoulderL[1], floorHand[2] - bb.shoulderL[2]) };
  // (half way down: her knees going forward under her skirts, her hips sinking)
  const K4 = kneeling(4, { pitch: 1, bend: 2, faceUp: 6, faceTurn: -2, ...leftAt(5.5, -3.0, -15), ...rightAt(7.0, 1.5, -15), out: 0.9 });
  const HALF_DOWN: P = { ...K4, px: (K4.px as number) * 0.5 - 0.7, pz: (K4.pz as number) * 0.5 };
  return {
    long: LD_DIES.long,
    keys: [
      [0, {}],
      [0.08, { ...JOLT }],
      // (she brings the mirror before her eyes; it cracks across)
      [0.3, { px: -1.4, pitch: -3, bend: -3, faceUp: 2, faceTurn: -8, faceTilt: 4, pz: 0.3, ...rightAt(10.5, 3.6, -1.0), ...leftAt(5.5, -5.2, -16), ...holding([0.05, 0.05, 1], [-0.95, 0.3, 0]), out: 0.1 }],
      // (a gasp, her head thrown back, the Hush pouring out of her; the mirror falls from her hand)
      [LD_DIES.gasp, { px: -1.8, pitch: -8, bend: -13, faceUp: 34, faceTurn: -4, faceTilt: 2, pz: 0.6, ...rightAt(9.0, 2.0, -6.0), ...leftAt(4.5, -4.5, -12), ...holding([0.3, 0.1, 1], [-0.9, 0.3, 0.2]), out: 0.4 }],
      [0.7, { px: -1.5, pitch: -6, bend: -10, faceUp: 26, faceTurn: -2, faceTilt: 4, pz: 0.2, ...rightAt(7.5, 0.5, -15), ...leftAt(4.5, -3.0, -15), out: 0.75 }],
      // (her knees give: she sinks down into her skirts)
      [0.86, HALF_DOWN],
      [LD_DIES.knees, ON_KNEES],
      [1.3, { ...ON_KNEES, pz: (ON_KNEES.pz as number) + 0.5, pitch: -1, roll: -2, faceUp: -10 }],
      [LD_DIES.sit, SAT],
      [1.9, kneeling(-52, { pitch: 16, bend: 28, roll: 5, side: 3, faceUp: -34, faceTurn: -8, faceTilt: 15, ...leftAt(10, 3, -15), ...rightAt(9.0, 4.2, -15.5), out: 1 })],
      [LD_DIES.still, BOWED],
      [LD_DIES.long, { ...BOWED, bend: 47, faceUp: -41 }],
    ],
  };
}
function diesFeet(): (t: number) => P {
  return footwork(B, {
    // (her left foot a step back beside the right as she is struck; then both up on their toes as she goes down on her knees)
    L: { start: L0, moves: [{ t0: 0.06, t1: 0.26, to: DIE_FEET.L, lift: 1.8 }, { t0: 0.66, t1: 0.98, to: { ...DIE_FEET.L, pitch: TUCK } }] },
    R: { start: R0, moves: [{ t0: 0.66, t1: 0.98, to: { ...DIE_FEET.R, pitch: TUCK } }] },
  });
}
const dieJaw = (t: number): number => (t < 0.1 ? 0.6 : t < 1.2 ? 1 : 1 - 0.7 * smooth(1.2, 1.8, t));

// =============================================================================================
// WHAT IS LAID AFTER HER EDGE: the glint's star, the strike's smear, the beam, the glass as it cracks

/** The strike, by move. */
export const LD_STRIKES: Readonly<Record<string, readonly [number, number]>> = { attack: LD_FLASH.strike };
/** Whether a frame of a move shows its strike's smear: from the frame after its wind-up ends to the frame after it lands. */
export function smearedAt(move: string, t: number): boolean {
  const s = LD_STRIKES[move];
  return !!s && t > s[0] + 1e-6 && t <= s[1] + FR + 1e-6;
}
/** The smear's after-images: the oldest a dull lavender, the newest near white. Never cyan. */
export const SMEAR = ['#8a7aa4', '#cdbfdc', '#f4e8f0'] as const;
const PLANS: Record<string, Plan> = { attack: flashPlan(), dart: dartPlan(), reel: reelPlan(), dying: diesPlan() };
const POSES: Record<string, (t: number) => P> = Object.fromEntries(Object.entries(PLANS).map(([k, p]) => [k, poseFn(p)]));
const FEET: Record<string, (t: number) => P> = { attack: flashFeet(), dart: dartFeet(), dying: diesFeet(), reel: reelFeet() };
const bonesOf = (move: string, t: number): Skeleton => {
  const tt = Math.max(0, Math.min(PLANS[move].long, t));
  return solve(B, { ...R, ...POSES[move](tt), ...(FEET[move]?.(tt) ?? {}) } as Posed);
};
/** The mirror's oval as a line of points round it (its rim), at a moment's bones. */
function rimOf(s: Skeleton, n = 14): V3[] {
  const k = mirrorOf(s);
  const out: V3[] = [];
  for (let i = 0; i <= n; i++) {
    const a = (i / n) * Math.PI * 2;
    out.push(add(k.c, add(mul(k.up, Math.cos(a) * MIRROR.ry), mul(k.side, Math.sin(a) * MIRROR.rx))));
  }
  return out;
}
/** THE SMEAR: after-images of the mirror (its rim and its handle) along the way it has come since its wind-up ended. */
function smearOf(move: string, t: number): V3[][] | null {
  if (!smearedAt(move, t)) return null;
  const [s0, s1] = LD_STRIKES[move];
  const to = Math.min(t, s1);
  const out: V3[][] = [];
  const n = 9;
  for (let i = 0; i <= n; i++) {
    const u = s0 - FR * 0.5 + ((to - (s0 - FR * 0.5)) * i) / n;
    const s = bonesOf(move, u);
    const k = mirrorOf(s);
    // (the glass as it was: filled, so that its after-images run together into one swept blur; and the arm that swung it)
    const disc: V3[] = [];
    for (let a = -MIRROR.ry; a <= MIRROR.ry; a += 0.7) {
      for (let b = -MIRROR.rx; b <= MIRROR.rx; b += 0.7) if ((a / MIRROR.ry) ** 2 + (b / MIRROR.rx) ** 2 <= 1) disc.push(add(k.c, add(mul(k.up, a), mul(k.side, b))));
    }
    out.push(disc, [s.elbowR, s.handR, k.neck]);
  }
  return t > s1 + 1e-6 ? out.slice(Math.floor(out.length / 2)) : out;
}
/** A line of points laid as grains, every pixel along it (the oldest thinned to every other). */
function lineGrains(out: [V3, string, number][], line: ReadonlyArray<V3>, c: string, size: number, every = 1): void {
  for (let i = 1; i < line.length; i++) {
    const d = Math.hypot(line[i][0] - line[i - 1][0], line[i][1] - line[i - 1][1], line[i][2] - line[i - 1][2]);
    const n = Math.max(1, Math.ceil(d * 1.4));
    for (let e = 0; e < n; e++) if ((e + i) % every === 0) out.push([lerp3(line[i - 1], line[i], e / n), c, size]);
  }
}
/** The star of the glint on her glass as she winds up: four long arms and four short, white at the heart, lavender out along them. */
function glintStar(out: [V3, string, number][], s: Skeleton, k: number, t: number): void {
  if (k <= 0.05) return;
  const m = mirrorOf(s);
  const c = add(m.face, add(mul(m.up, 0.8), mul(m.side, -0.6)));
  const tw = 0.85 + 0.15 * Math.sin(t * 40);
  const long = (2 + 11 * k) * tw;
  for (const [dir, len] of [[[0, 0, 1], long], [[1, -1, 0], long], [[0.7, 0.7, 0.5], long * 0.5], [[-0.7, -0.7, 0.5], long * 0.5]] as [V3, number][]) {
    const d = norm(dir);
    for (let e = -len; e <= len; e += 0.6) {
      const far = Math.abs(e) / len;
      out.push([add(c, mul(d, e)), far < 0.25 ? '#ffffff' : far < 0.6 ? '#e6e0f4' : '#b6acd2', far < 0.2 ? 2 : 1]);
    }
  }
}
function moreOf(move: string, m: Moment): [V3, string, number][] {
  const out: [V3, string, number][] = [];
  const t = m.t;
  const s = m.s;
  if (move === 'attack') {
    glintStar(out, s, m.glint, t);
    const sm = smearOf('attack', t);
    if (sm) {
      sm.forEach((pts, j) => {
        const k = j / Math.max(1, sm.length - 1);
        const c = k > 0.7 ? SMEAR[2] : k > 0.35 ? SMEAR[1] : SMEAR[0];
        // (a disc's points each a grain; an arm's line drawn along)
        if (pts.length > 3) for (const p of pts) out.push([p, c, 2]);
        else lineGrains(out, pts, c, 2);
      });
    }
    // THE BEAM, thrown from the glass as it lands (art/gallery_ladies_fx.ts: its light in the air)
    if (t >= H - 1e-6) out.push(...flashBeam(mirrorOf(bonesOf('attack', H)).face, t - H, (i) => hash(i, Math.round(t * FPS), 7811)));
  }
  if (move === 'dying' && t >= LD_DIES.crack[0] && t < LD_DIES.crack[1] + 0.12) {
    // THE MIRROR CRACKS: a spray of glitter off the glass as it goes, falling
    const k = mirrorOf(s);
    const age = t - LD_DIES.crack[0];
    for (let i = 0; i < 16; i++) {
      const born = 0.1 * hash(i, 1, 7821);
      const a = age - born;
      if (a < 0 || a > 0.28) continue;
      const dir = norm([hash(i, 2, 7821) - 0.5, hash(i, 3, 7821) - 0.5, hash(i, 4, 7821) * 0.6]);
      const p = add(k.face, add(mul(dir, 2 + 14 * a), [0, 0, -60 * a * a]));
      out.push([p, i % 3 === 0 ? '#ffffff' : i % 3 === 1 ? '#c8c2dc' : '#8e98b8', a < 0.12 ? 2 : 1]);
    }
  }
  return out;
}
function lightsOf(move: string, m: Moment): { p: V3; c: string; r: number; a: number }[] {
  if (move !== 'attack' || m.t < H - 1e-6) return [];
  const k = 1 - smooth(0, FLASH_FX.hold + FLASH_FX.fade, m.t - H);
  if (k <= 0.02) return [];
  const face = mirrorOf(bonesOf('attack', H)).face;
  return [{ p: face, c: '#ece6ff', r: 40, a: 0.5 * k }, { p: [FLASH_FX.reach * 0.6, 0, 8], c: '#d6ceee', r: 54, a: 0.3 * k }];
}

// =============================================================================================
// HER, AS THE GAME HOLDS A MONSTER

export const LD_NAMES = {
  stand: 'A lady-in-waiting gazes into her mirror',
  walk: 'The ladies glide',
  attack: 'The mirror flash',
  dart: 'The dart',
  reel: 'A lady-in-waiting is struck',
  dying: 'The mirror cracks, the Hush leaves her',
} as const;
const byName: Record<string, string> = Object.fromEntries(Object.entries(LD_NAMES).map(([k, v]) => [v, k]));
const SAY: LadySay = {
  dropped: (m) => !!m.dying && m.t >= LD_DIES.drop,
  crack: (m) => (m.dying ? smooth(LD_DIES.crack[0], LD_DIES.crack[1], m.t) : 0),
  more: (m) => moreOf(byName[m.move ?? ''] ?? '', m),
  puff: (m) => (m.dying ? Math.max(0, 2.2 * (1 - smooth(0.2, 1.4, m.t))) : 0.35 + 0.8 * clamp01(m.glint)),
  lights: (m) => lightsOf(byName[m.move ?? ''] ?? '', m),
};

function ladyMob(): Mob {
  const paint = ladyPainter(SAY);
  const mv = (name: string, motion: Motion, more: Partial<MobMove> = {}): MobMove => ({ name, motion, rest: R, ...more });
  // (the fall of the mirror from her hand: face up on the floor to her right, cracked)
  const dropAt = bonesOf('dying', LD_DIES.drop);
  const glassUp = mirrorOf(dropAt).n;
  return {
    id: 'gallery-lady',
    name: 'A lady-in-waiting',
    size: "small: the knight's height, in crowds",
    build: B,
    stand: mv(LD_NAMES.stand, standMotion(), { jaw: ladyJaw }),
    attack: mv(LD_NAMES.attack, motionOf(PLANS.attack), { feet: FEET.attack, glint: flashGlint, jaw: flashJaw }),
    more: {
      dart: mv(LD_NAMES.dart, motionOf(PLANS.dart), { feet: FEET.dart, jaw: () => 0.55 }),
    },
    idleFrames: LD_IDLE.frames,
    idleFps: LD_IDLE.fps,
    walk: mv(LD_NAMES.walk, glideMotion(), { period: LD_GLIDE.frames / LD_GLIDE.fps, ground: LD_PACE * TILE3, jaw: (t) => 0.4 + 0.25 * Math.max(0, Math.sin(t * 9)) }),
    walkFrames: LD_GLIDE.frames,
    walkFps: LD_GLIDE.fps,
    pace: LD_PACE,
    reel: mv(LD_NAMES.reel, motionOf(PLANS.reel), { feet: FEET.reel, jaw: (t) => (t < 0.25 ? 1 : 0.45) }),
    reelTime: LD_REEL,
    hit: H,
    warn: LD_FLASH.warn[1] - LD_FLASH.warn[0],
    dieTime: LD_DIES.long,
    dying: mv(LD_NAMES.dying, motionOf(PLANS.dying), { feet: FEET.dying, jaw: dieJaw }),
    aura: { x: LADY_CANVAS.ax, y: LADY_CANVAS.ay - 40, r: 32, color: '#9890b4', a: 0.06 },
    shadow: 12,
    canvas: LADY_CANVAS,
    trueBack: true,
    bits: paint.bits,
    grains: paint.grains,
    fall(piece) {
      if (piece === 'mirror') return { from: LD_DIES.drop, to: [9, -21], spin: 50, lay: 'flat', up: glassUp, hop: 1.0 };
      return null;
    },
  };
}
export const GALLERY_LADY = ladyMob();
export function makeLadyArt3(mob: Mob = GALLERY_LADY): ActorArt {
  return { front: mobSet(mob, 'front', mob.pace), back: mobSet(mob, 'back', mob.pace) };
}

// =============================================================================================
// HER AS THE CHECKS SEE HER (art/boss_checks.ts)

const len3 = (v: V3): number => Math.hypot(v[0], v[1], v[2]);
export function ladySolids(s: Skeleton): { limbs: CheckLimb[]; lumps: CheckLump[] } {
  const [rH, rK, rA] = B.legR;
  const [r0, r1] = B.armR;
  const limbs: CheckLimb[] = [];
  for (const side of ['L', 'R'] as const) {
    const L = side === 'L';
    limbs.push(
      { name: `leg${side}`, a: L ? s.hipL : s.hipR, b: L ? s.kneeL : s.kneeR, r: rH * 1.1 },
      { name: `shin${side}`, a: L ? s.kneeL : s.kneeR, b: L ? s.ankleL : s.ankleR, r: Math.max(rK, rA) * 1.15 },
      { name: `foot${side}`, a: add(L ? s.heelL : s.heelR, [0, 0, 1.1]), b: add(L ? s.toeL : s.toeR, [0, 0, 0.85]), r: 1.15 },
      { name: `upper${side}`, a: L ? s.shoulderL : s.shoulderR, b: L ? s.elbowL : s.elbowR, r: r0 * 1.12 },
      { name: `fore${side}`, a: L ? s.elbowL : s.elbowR, b: L ? s.handL : s.handR, r: r1 * 1.08 },
    );
  }
  limbs.push({ name: 'neck', a: s.neck, b: lerp3(s.neck, s.head, 0.5), r: 1.9 });
  const waistC = add(s.pelvis, mul(s.hips[2], B.waist * 0.62));
  const lumps: CheckLump[] = [
    { name: 'head', c: add(s.head, mul(s.face[2], -0.2)), rot: s.face, h: [B.headR[0] * 1.05, B.headR[1] * 1.08, B.headR[2] * 1.02] },
    { name: 'chest', c: lerp3(s.ribs, s.neck, 0.3), rot: s.chest, h: [B.ribDeep + 1.2, B.ribHalf + 1.1, len3(sub(s.neck, s.ribs)) * 0.55] },
    { name: 'belly', c: lerp3(waistC, s.ribs, 0.45), rot: s.belly, h: [B.waistDeep + 1.3, B.waistHalf + 1.2, Math.max(3, len3(sub(s.ribs, waistC)) * 0.6)] },
    { name: 'hips', c: add(s.pelvis, mul(s.hips[2], B.waist * 0.2)), rot: s.hips, h: [B.pelvisDeep + 2.0, B.pelvisHalf + 2.0, B.waist * 0.75] },
  ];
  return { limbs, lumps };
}
function mirrorThings(s: Skeleton): CheckThing[] {
  const k = mirrorOf(s);
  const rim = rimOf(s, 8);
  return [
    { name: 'mirror handle', pts: [k.butt, k.grip, k.neck], r: 0.6, may: ['foreR'] },
    { name: 'mirror glass', pts: [k.c, ...rim.slice(0, 8)], r: 0.6, may: [] },
  ];
}
const ALL_MOVES = ['stand', 'walk', 'attack', 'reel', 'dying', 'dart'];
export const LD_SHAPE: BossShape = {
  body: ladySolids,
  tip: (move, _t, s) => (move === 'attack' ? mirrorOf(s).face : null),
  things: (move, t, s) => (move === 'dying' && t >= LD_DIES.drop ? [] : mirrorThings(s)),
  strikes: LD_STRIKES,
  smeared: smearedAt,
  handovers: [
    ...ALL_MOVES.filter((m) => m !== 'stand' && m !== 'walk').flatMap((m): Handover[] =>
      m === 'dying' ? [{ from: 'stand', at: 0, to: m, toAt: 0 }] : [{ from: 'stand', at: 0, to: m, toAt: 0 }, { from: m, at: 'end', to: 'stand', toAt: 0, shift: m === 'dart' ? [DART, 0] : undefined }],
    ),
    // (the dart straight into her flash, where it set her down)
    { from: 'dart', at: 'end', to: 'attack', toAt: 0, shift: [DART, 0] },
    { from: 'stand', at: 0, to: 'walk', toAt: 0 },
    ...Array.from({ length: LD_GLIDE.frames + 1 }, (_, i): Handover => ({ from: 'walk', at: i / LD_GLIDE.fps, to: 'stand', toAt: 0 })),
    ...Array.from({ length: LD_GLIDE.frames + 1 }, (_, i): Handover => ({ from: 'walk', at: i / LD_GLIDE.fps, to: 'dart', toAt: 0 })),
  ],
};
void sub;
