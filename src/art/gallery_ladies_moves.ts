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
import { footwork, plantBy, plantOf } from './bosses3';
import type { Plant } from './bosses3';
import { LADY_BODY, LADY_CANVAS, MIRROR, ladyPainter, mirrorAt, mirrorOf } from './gallery_ladies';
import type { LadySay } from './gallery_ladies';
import { flashBeam, FLASH_FX } from './gallery_ladies_fx';
import { hash } from './kit';
import { TILE3, mobSet } from './new_mobs3';
import type { Mob, MobMove, Moment } from './new_mobs3';
import { add, aimFor, cross, dot, elbowFor, lerp3, mul, norm, solve, standing, sub } from './skeleton';
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
  ...rightAt(3.2, -7.6, 0.4),
  ...holding([0.05, -0.15, 1], [-0.35, 0.94, 0.05]),
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
        ...rightAt(3.2 + 0.5 * Math.sin(a + 0.9), -7.6 + 0.4 * Math.sin(a + 0.2), 0.4 + 0.5 * Math.sin(a)),
        ...holding([0.05 + 0.06 * Math.sin(a + 0.9), -0.15 + 0.05 * Math.sin(a), 1], [-0.35 + 0.1 * Math.sin(a + 0.4), 0.94, 0.05 + 0.04 * Math.sin(a * 2)]),
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
// THE GLIDES (his picks: “Gliding in a line, quick (Recommended)”; and of 30 Oct, “Yes, these (Recommended)”: they never
// dart, they glide in their neat line and keep their distance, circling to flash at you from range, backing away if you
// close in). FOUR GLIDES, ALL FACING YOU (the way the picture faces): forward (her walk), backing away, and circling to
// her left or to her right. No step shows: the steps are tiny and quick (fifteen a second), all under the hem, which skims
// the floor; the body carried level; the gown trailing after the way she goes.

/** Her pace gliding forward, tiles a second (the knight walks 2.5; the gardeners rush at 1.6). */
export const LD_PACE = 3.2;
export const LD_GLIDE = { frames: 8, fps: 30 } as const;
/** EACH GLIDE: the way she goes (her own ways: forward, to her left), and how fast (tiles a second). The game plays each facing you, and carries her that way at that pace. */
export const LD_GLIDES = {
  walk: { way: [1, 0] as const, pace: LD_PACE },
  glideBack: { way: [-1, 0] as const, pace: 2.4 },
  glideLeft: { way: [0, 1] as const, pace: 2.8 },
  glideRight: { way: [0, -1] as const, pace: 2.8 },
} as const;
export type GlideName = keyof typeof LD_GLIDES;
/** Her steps: four to a round of the glide; each foot's own round four frames, down for the first two (going back under her as the floor goes by), lifted for two. */
const STEP_ROUND = 4;
/** The feet kept back from the way she goes (her own lengths), under the hem's leading edge; and apart, circling, so that the closing foot never meets the other. */
const FEET_BACK = 3.0;
/** One foot `k` frames into its own round: how far along the way she goes it is (from its mean) and how high. */
function glideFoot(k: number, d: number, lift: number): [number, number] {
  const half = STEP_ROUND / 2;
  if (k <= half) return [d * (half / 2 - k), 0];
  const u = (k - half) / half;
  const g = u * u * (3 - 2 * u);
  return [d * (-half / 2 + half * g), lift * Math.sin(Math.PI * u)];
}
/** A GLIDE: the way she goes, and how fast. */
function glideMotion(name: GlideName): Motion {
  const { way, pace } = LD_GLIDES[name];
  const [wx, wy] = way;
  const n = LD_GLIDE.frames;
  const d = (pace * TILE3) / LD_GLIDE.fps;
  const side = wy !== 0;
  // (circling: her feet wider, so that the one closing in stays a foot's width from the other at its nearest)
  const wide = side ? 2 * d + 2.8 - 2 * B.stance : 0;
  const keys: Key3[] = [];
  for (let i = 0; i <= n; i++) {
    const j = i % n;
    const a = (j / n) * Math.PI * 2;
    const [l, lz] = glideFoot(j % STEP_ROUND, d, 1.4);
    const [r, rz] = glideFoot((j + STEP_ROUND / 2) % STEP_ROUND, d, 1.4);
    const cx = -FEET_BACK * wx * (wx > 0 ? 1.25 : 1);
    const cy = -FEET_BACK * 0.8 * wy;
    // (carried level, no bob to speak of; leaning a little into the way she goes; the mirror held up before her face)
    const bob = 0.15 * Math.abs(Math.sin(a * 2));
    keys.push({
      at: i / LD_GLIDE.fps,
      ease: 'lin',
      pose: elbowsTo({
        pz: R.pz - 1.0 - bob, py: 0.4 * Math.sin(a), roll: -2.5 * wy + 0.8 * Math.sin(a), yaw: 1.5 * Math.cos(a), twist: -1.5 * Math.cos(a), side: -0.6 * Math.sin(a) - 1.2 * wy,
        pitch: wx > 0 ? 5 : wx < 0 ? -3 : 1, bend: wx > 0 ? 2 : wx < 0 ? -2 : 0, faceUp: R.faceUp + 2, faceTilt: R.faceTilt - 2 + 3 * wy, faceTurn: R.faceTurn + 6,
        lfx: 0.4 + cx + l * wx, lfy: 0.3 + cy + (wide / 2) + l * wy, lfz: lz, lfp: 0, lft: 8, lk: 6,
        rfx: -0.4 + cx + r * wx, rfy: -0.3 + cy - (wide / 2) + r * wy, rfz: rz, rfp: 0, rft: -8, rk: -6,
        ...leftAt(6.0 + 0.3 * Math.sin(a) + (wx < 0 ? 0.8 : 0), -4.4 - (wx < 0 ? 0.5 : 0), -18.8 + 0.2 * Math.cos(a * 2)),
        ...rightAt(3.8, -7.4, -0.2 + 0.2 * Math.cos(a * 2)),
        ...holding([0.14, -0.15, 1], [-0.35, 0.94, 0.05]),
      }, ELBOW_L, ELBOW_R),
    });
  }
  return { keys, loop: 0 };
}
/**
 * Where a foot that is down is ON THE FLOOR, circling (for the checks: the floor goes by under her to her side as the game
 * carries her, and art/boss_checks.ts counts only a walk's going forward): each heel and toe moved on by as far as the
 * floor has gone since that foot came down. Forward and back, the checks' own `ground` does it.
 */
function gripsOf(move: string, t: number, s: Skeleton): { name: string; p: V3 }[] {
  const pts = [{ name: 'heelL', p: s.heelL }, { name: 'toeL', p: s.toeL }, { name: 'heelR', p: s.heelR }, { name: 'toeR', p: s.toeR }];
  const g = (LD_GLIDES as Record<string, { way: readonly [number, number]; pace: number }>)[move];
  if (!g || g.way[1] === 0) return pts;
  const P = STEP_ROUND / LD_GLIDE.fps;
  const since = (land: number): number => {
    const u = (((t - land) % P) + P) % P;
    return u > P - 1e-6 ? 0 : u;
  };
  const by = { L: g.pace * TILE3 * since(0) * g.way[1], R: g.pace * TILE3 * since(P / 2) * g.way[1] };
  return pts.map(({ name, p }) => ({ name, p: [p[0], p[1] + by[name.endsWith('L') ? 'L' : 'R'], p[2]] as V3 }));
}

// =============================================================================================
// THE DART: a burst at you. NO LONGER ONE OF HER MOVES (his pick of 30 Oct: “never dart”): its code kept here, out of her
// move set (`GALLERY_LADY.more` has only her glides); nothing plays it.

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
      [0.52, { px: at(0.52), pz: -1.6, pitch: -6, bend: -5, faceUp: 0, faceTurn: -6, faceTilt: 6, roll: 0, ...leftAt(7.4, -2.2, -18.5), ...rightAt(3.4, -7.0, -1.2), ...holding([0.12, -0.12, 1], [-0.3, 0.94, 0.1]) }],
      [0.66, { px: at(0.66), pz: -0.4, pitch: -3, bend: -2.5, faceUp: -2, faceTurn: -12, faceTilt: 8, ...leftAt(6.2, -4.5, -18.6), ...rightAt(3.2, -7.6, 0.3) }],
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
export const LD_FLASH = { long: 1.6, warn: [0.3, 0.8] as const, strike: [25 / FPS, 27 / FPS] as const, hit: 27 / FPS } as const;
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
      // (HELD half a second, for a blow thrown from range: the mirror rising a little and turning to catch the light)
      [0.55, { ...RAISED, ...rightAt(-6.4, -3.9, 18.8), pz: 1.15 }],
      [w1, RAISED],
      [s0, HIPS_FIRST],
      [s1, FLASHED],
      [H + 0.1, THROUGH],
      [H + 0.25, { ...THROUGH, yaw: 12, twist: 6, pitch: 8, bend: 6, pz: -1.4, ...rightAt(15.5, 3.4, -8.2), ...leftAt(1, 1, -18.5) }],
      [H + 0.48, { yaw: 3, twist: 1, pitch: 1, bend: 0, pz: -0.4, faceTurn: -8, faceUp: -2, ...rightAt(11.5, 3.0, -4.5), ...leftAt(4.5, -3.0, -18.8), ...holding([0.2, 0.02, 1], [-0.6, 0.45, 0.4]) }],
      [LD_FLASH.long, {}],
    ],
  };
}
function flashFeet(): (t: number) => P {
  return footwork(B, {
    // (the left foot a step in as the hips come round; the right turning on its ball behind; both back after)
    L: { start: L0, moves: [{ t0: 0.7, t1: 0.83, to: plantBy(L0, 7.5, 0.8, 4), lift: 1.8 }, { t0: 1.26, t1: 1.5, to: L0, lift: 1.6 }] },
    R: { start: R0, moves: [{ t0: 0.8, t1: 0.94, to: { ...R0, pitch: 22, turn: R0.turn + 10 } }, { t0: 1.28, t1: 1.5, to: R0 }] },
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
  return { long: LD_REEL, keys: [[0, {}], [0.08, JOLT], [0.2, { px: -3.2, pitch: -5, bend: -6, side: -1, faceUp: 10, faceTilt: 10, ...rightAt(3.2, -7.2, 3.0), ...leftAt(6.6, -2.0, -15) }], [LD_REEL, {}]] };
}
/** Struck, knocked back a step: her left foot back under her as she is jolted, and in again. */
function reelFeet(): (t: number) => P {
  return footwork(B, {
    L: { start: L0, moves: [{ t0: 0.02, t1: 0.13, to: plantBy(L0, -5.5, 0.6, -4), lift: 1.6 }, { t0: 0.24, t1: 0.38, to: L0, lift: 1.4 }] },
  });
}

// HER DEATH, THE SWOON (his pick of 30 Oct, “Yes, these (Recommended)”, to make Act 2's enemies die differently): struck
// dead, she sways, the back of her left hand lifted to her brow, her eyes closing; the mirror slips from her right hand,
// falls, lands and cracks (a starred crack across its glass, a glint, a few tiny shards); a slow theatrical swoon, her knees
// giving, she sinks back and down onto the floor and faints back across it in a heap of silver-grey gown, the gown pooling
// round her; the Hush leaves her in a grey breath; she lies still, alive.

/**
 * Her death's times (seconds; the game shows a death at twenty frames a second): struck (`jolt`); the back of her hand at
 * her brow (`brow`); her eyes closing (`shut`); the mirror slipping from her hand (`slip`) and landing, cracking (`land`);
 * her knees giving, sinking down (`knees`) to sit on the floor (`sit`); fainting back across it (`lie`); the Hush leaving
 * her (`breath`); still from `still`.
 */
const DIE_T = {
  long: 3.6,
  jolt: 0.08,
  brow: 0.42,
  shut: [0.26, 0.62] as const,
  slip: 0.64,
  knees: [0.74, 1.7] as const,
  sit: 1.7,
  lie: [1.74, 2.42] as const,
  breath: [1.95, 3.05] as const,
  still: 3.1,
};
const DIE_FEET: Record<'L' | 'R', Plant> = { L: plantBy(L0, R0.at[0] - L0.at[0] - 4.5, -0.6), R: R0 };
/** The face's numbers (as `solve` reads them: turned, then up, then tilted) for a face looking along `f`, its left `l`. */
function faceNumbers(f: V3, l: V3): P {
  const up = Math.asin(Math.max(-1, Math.min(1, f[2])));
  const turn = Math.atan2(f[1], f[0]);
  const l0: V3 = [-Math.sin(turn), Math.cos(turn), 0];
  const u0: V3 = [-Math.sin(up) * Math.cos(turn), -Math.sin(up) * Math.sin(turn), Math.cos(up)];
  const tilt = Math.atan2(dot(l, u0), dot(l, l0));
  return { faceTurn: (turn * 180) / Math.PI, faceUp: (up * 180) / Math.PI, faceTilt: (tilt * 180) / Math.PI };
}
/** A hand put at `to` (the figure's own place), from its shoulder along the figure's ways, as the pose has the shoulder. */
function handTo(pose: P, side: 'L' | 'R', to: V3): P {
  const s = solve(B, { ...R, ...pose } as Posed);
  const sh = side === 'L' ? s.shoulderL : s.shoulderR;
  return side === 'L' ? leftAt(to[0] - sh[0], to[1] - sh[1], to[2] - sh[2]) : rightAt(to[0] - sh[0], to[1] - sh[1], to[2] - sh[2]);
}
/** THE BACK OF HER LEFT HAND AT HER BROW, for a pose: just before her forehead, a little to its left; her elbow out to her side and up. */
function browHand(pose: P): P {
  const s = solve(B, { ...R, ...pose } as Posed);
  const [ff, fl, fu] = s.face;
  const hc = add(s.head, mul(fu, -0.2));
  const to = add(hc, add(mul(ff, B.headR[0] + 1.25), add(mul(fu, B.headR[2] * 0.22), mul(fl, 0.4))));
  return elbowsTo({ ...pose, ...handTo(pose, 'L', to) }, [0.05, 1, 0.75], null);
}
/** The lowest of her (her trunk, her head and the coil of her hair) as posed, above the floor: so that she rests on it. */
function restingZ(pose: P): number {
  const s = solve(B, { ...R, ...pose, pz: 0 } as Posed);
  const { lumps } = ladySolids(s);
  let lo = Infinity;
  for (const l of lumps) lo = Math.min(lo, l.c[2] - Math.hypot(l.h[0] * l.rot[0][2], l.h[1] * l.rot[1][2], l.h[2] * l.rot[2][2]));
  const [ff, fl, fu] = s.face;
  const hr = B.headR;
  const hc = add(s.head, mul(fu, -0.2));
  const coilUp = norm(add(fu, mul(ff, -0.25)));
  const coil = add(hc, add(mul(fu, hr[2] * 0.78), mul(ff, -hr[0] * 0.36)));
  lo = Math.min(lo, coil[2] - Math.hypot(hr[0] * 0.62 * ff[2], hr[1] * 0.66 * fl[2], hr[2] * 0.5 * coilUp[2]));
  return -lo + 0.35;
}
/** Her legs as she lies: under her gown, the knees fallen out to either side on the floor, the feet together before her. */
function lyingFeet(px: number): P {
  const leg = (side: 'L' | 'R'): P => {
    const L = side === 'L';
    const ankle: V3 = [px + 17, L ? 1.7 : -1.7, 3.2];
    const ys = L ? B.stance : -B.stance;
    return L
      ? { lfx: ankle[0], lfy: ankle[1] - ys, lfz: ankle[2] - B.ankle, lfp: 10, lft: 40 }
      : { rfx: ankle[0], rfy: ankle[1] - ys, rfz: ankle[2] - B.ankle, rfp: 10, rft: -40 };
  };
  return { ...leg('L'), ...leg('R') };
}
const LIE_PX = -12;
const LIE_FEET = lyingFeet(LIE_PX);
/** Her feet as she sinks and sits: down where they stood (the left a step back beside the right as she is struck). */
const standFeet = footwork(B, { L: { start: L0, moves: [{ t0: 0.06, t1: 0.26, to: DIE_FEET.L, lift: 1.8 }] } });
const FEET_GO: Record<'L' | 'R', readonly [number, number]> = { L: [1.86, 2.26], R: [1.92, 2.32] };
function diesFeet(t: number): P {
  const a = { ...R, ...standFeet(Math.min(t, 1.0)) } as Record<string, number>;
  const b = LIE_FEET as Record<string, number>;
  const out: P = {};
  for (const side of ['L', 'R'] as const) {
    const [t0, t1] = FEET_GO[side];
    const u = smooth(t0, t1, t);
    const lift = 3.4 * Math.sin(Math.PI * clamp01((t - t0) / (t1 - t0)));
    const o = out as Record<string, number>;
    for (const f of ['fx', 'fy', 'fz', 'fp', 'ft']) {
      const k = (side === 'L' ? 'l' : 'r') + f;
      o[k] = a[k] + (b[k] - a[k]) * u + (f === 'fz' ? lift : 0);
    }
  }
  return out;
}
function diesPlan(): Plan {
  // STRUCK, then SWAYING BACK, the back of her left hand to her brow, her head thrown back; her right arm out at her side,
  // the mirror hanging loose in her hand
  const BROW0: P = { px: -2.6, py: -0.8, pz: 0.3, pitch: -7, bend: -12, roll: 3, side: 2, yaw: 4, twist: 4, faceUp: 15, faceTurn: 8, faceTilt: -10, out: 0.3, ...rightAt(2.5, -12.5, -9.5), ...holding([0.25, -0.35, -1], [0.75, -0.2, 0.3]) };
  const BROW = elbowsTo(browHand(BROW0), null, [0.1, -1, -0.4]);
  // (swaying the other way, forward and to her left: the mirror gone from her hand, the arm hanging; her knees beginning to go)
  const SWAY0: P = { px: -1.6, py: 0.6, pz: -1.4, pitch: -4, bend: -9, roll: -2.5, side: -2, yaw: -2, twist: -2, faceUp: 20, faceTurn: 6, faceTilt: -4, out: 0.8, lkUp: 8, rkUp: 8, ...rightAt(3.0, -9.5, -17), ...holding([0.3, -0.4, -1], [0.75, -0.3, 0.3]) };
  const SWAY = elbowsTo(browHand(SWAY0), null, ELBOW_R);
  // (sinking: her knees giving under her skirts, her hips going down and back, the hand still at her brow)
  const SINK0: P = { px: -4.6, py: 0.4, pz: -12, pitch: -10, bend: -6, roll: -3, side: -1, yaw: -1, twist: -1, faceUp: 22, faceTurn: 6, faceTilt: 6, out: 1, lk: 14, rk: -14, lkUp: 34, rkUp: 34, ...rightAt(3.5, -9.0, -16) };
  const SINK = elbowsTo(browHand(SINK0), null, ELBOW_R);
  // (down: sat on the floor behind her feet, leaning back, her knees up under the gown)
  const SIT0: P = { px: -9, py: 0.2, pitch: -24, bend: -8, roll: -3, side: 0, yaw: 0, twist: 0, faceUp: 18, faceTurn: 6, faceTilt: 8, out: 1, lk: 16, rk: -16, lkUp: 62, rkUp: 62 };
  const sitZ = restingZ(SIT0);
  const SIT1: P = { ...SIT0, pz: sitZ };
  const sitS = solve(B, { ...R, ...SIT1 } as Posed);
  const SIT = elbowsTo(browHand({ ...SIT1, ...handTo(SIT1, 'R', [sitS.pelvis[0] + 1.5, sitS.pelvis[1] - 9.5, 1.9]) }), null, [0.1, -1, 0.2]);
  // FAINTING BACK ACROSS THE FLOOR: lying back, the face up and turned over to her right; the left arm flung back above her
  // head onto the floor, the right out at her side on it; the knees fallen out to either side under the gown
  const face = faceNumbers(norm([0.08, -0.55, 0.83]), norm([0, 0.83, 0.55]));
  const LIE0: P = { px: LIE_PX, py: 0.4, pitch: -84, bend: -12, roll: 0, side: 0, yaw: 0, twist: 0, ...face, out: 1, lk: 85, rk: -85, lkUp: -12, rkUp: -12, ...LIE_FEET };
  const lieZ = restingZ(LIE0);
  const LIE1: P = { ...LIE0, pz: lieZ };
  const ls = solve(B, { ...R, ...LIE1 } as Posed);
  const reach = (B.upperArm + B.foreArm) * 0.93;
  const onFloorFrom = (sh: V3, dx: number, dy: number): V3 => {
    const flat = Math.sqrt(Math.max(1, reach * reach - (sh[2] - 1.9) ** 2));
    const k = flat / Math.hypot(dx, dy);
    return [sh[0] + dx * k, sh[1] + dy * k, 1.9];
  };
  const leftLies = onFloorFrom(ls.shoulderL, -1, 0.55);
  const rightLies = onFloorFrom(ls.shoulderR, 0.25, -1);
  const LIE = elbowsTo({ ...LIE1, ...handTo(LIE1, 'L', leftLies), ...handTo(LIE1, 'R', rightLies) }, [0.1, 1, 0.3], [0.1, -1, 0.3]);
  // (between: lying back by degrees, each resting on the floor as it goes; the left hand slipping from her brow and falling back over her head)
  const between: [number, P][] = [];
  const [l0, l1] = DIE_T.lie;
  for (const u of [0.28, 0.5, 0.72, 0.88]) {
    const e = u * u * (3 - 2 * u);
    const mix = (a: number, b: number, k = e): number => a + (b - a) * k;
    const body: P = {
      px: mix(SIT0.px as number, LIE_PX), py: mix(0.2, 0.4), pitch: mix(-24, -84, Math.min(1, e * 1.08)), bend: mix(-8, -12), roll: mix(-3, 0), side: 0, yaw: 0, twist: 0,
      faceTurn: mix(SIT0.faceTurn as number, face.faceTurn as number), faceUp: mix(SIT0.faceUp as number, face.faceUp as number), faceTilt: mix(SIT0.faceTilt as number, face.faceTilt as number),
      out: 1, lk: mix(16, 85), rk: mix(-16, -85), lkUp: mix(62, -12), rkUp: mix(62, -12),
    };
    const z = restingZ(body);
    const posed = { ...body, pz: z };
    const s = solve(B, { ...R, ...posed } as Posed);
    const brow = browHand(posed);
    // (the left hand: off her brow and back over her head)
    const over = add(s.head, add(mul(s.face[2], 5 + 4 * u), mul(s.face[0], 2 - 2 * u)));
    const lh = u < 0.4 ? brow : elbowsTo({ ...posed, ...handTo(posed, 'L', u > 0.8 ? lerp3(over, leftLies, (u - 0.8) / 0.2 * 0.6) : over) }, [-0.1, 1, 0.5], null);
    const rh = handTo(posed, 'R', lerp3([s.pelvis[0] + 1.5, s.pelvis[1] - 9.5, 1.9], rightLies, e));
    between.push([l0 + (l1 - l0) * u, elbowsTo({ ...lh, ...rh }, null, [0.1, -1, 0.25])]);
  }
  return {
    long: DIE_T.long,
    keys: [
      [0, {}],
      [DIE_T.jolt, { ...JOLT, out: 0.1 }],
      [DIE_T.brow, BROW],
      [0.7, SWAY],
      [1.2, SINK],
      [DIE_T.sit, SIT],
      ...between,
      [l1, LIE],
      // (eased: her head over a little further, her hands loose; then still)
      [2.75, { ...LIE, faceTilt: (LIE.faceTilt as number) + 4, faceUp: (LIE.faceUp as number) - 3 }],
      [DIE_T.long, { ...LIE, faceTilt: (LIE.faceTilt as number) + 4, faceUp: (LIE.faceUp as number) - 3 }],
    ],
  };
}
/** Her eyes closing (0 open, 1 shut), as she swoons. */
const dieShut = (t: number): number => smooth(DIE_T.shut[0], DIE_T.shut[1], t);
/** Her lips: parted in a sigh as she is struck and sways, closing as she lies. */
const dieJaw = (t: number): number => (t < 0.1 ? 0.6 : t < 1.6 ? 0.9 : 0.9 - 0.6 * smooth(1.6, 2.6, t));

// THE MIRROR LOOSE OF HER HAND: from where it is as it slips, falling (tumbling over to lie face up), landing flat on its
// back at her right side (`LANDS`, from her floor point), cracking as it lands; a little clatter; still.
const MIRROR_LIES: V3 = [7, -31, 0.95];
const G = 400;
interface LoosePath { c0: V3; frame0: [V3, V3, V3]; fall: number; land: number }
let LOOSE: LoosePath | null = null;
/** The mirror's own ways (its handle's way, its glass's, across it), as it lies: face up, its handle toward her. */
const LIES_UP: V3 = norm([0.35, -1, 0]);
const LIES_FRAME: [V3, V3, V3] = [LIES_UP, [0, 0, 1], norm(cross([0, 0, 1], LIES_UP))];
/** Turned by `deg` about `axis`. */
function about(v: V3, axis: V3, deg: number): V3 {
  const a = (deg * Math.PI) / 180;
  const c = Math.cos(a);
  const s = Math.sin(a);
  const k = norm(axis);
  const d = dot(k, v);
  const x = cross(k, v);
  return [v[0] * c + x[0] * s + k[0] * d * (1 - c), v[1] * c + x[1] * s + k[1] * d * (1 - c), v[2] * c + x[2] * s + k[2] * d * (1 - c)];
}
/** The turn that takes one set of ways onto another, as an axis and its whole angle (degrees). */
function turnBetween(a: [V3, V3, V3], b: [V3, V3, V3]): { axis: V3; deg: number } {
  // (R = b·aᵀ; its axis and angle)
  const m = (i: number, j: number): number => b[0][i] * a[0][j] + b[1][i] * a[1][j] + b[2][i] * a[2][j];
  const tr = m(0, 0) + m(1, 1) + m(2, 2);
  const ang = Math.acos(Math.max(-1, Math.min(1, (tr - 1) / 2)));
  if (ang < 1e-4) return { axis: [0, 0, 1], deg: 0 };
  const ax: V3 = [m(2, 1) - m(1, 2), m(0, 2) - m(2, 0), m(1, 0) - m(0, 1)];
  return { axis: Math.hypot(...ax) > 1e-6 ? norm(ax) : [1, 0, 0], deg: (ang * 180) / Math.PI };
}
/** THE MIRROR AS IT IS, OFF HER HAND (dying, from `slip`): its middle and ways, how far cracked (it cracks as it lands), the glint off the crack, and the shards. */
export interface LooseMirror { c: V3; up: V3; n: V3; side: V3; crack: number; glint: number; shards: V3[]; t: number }
export function mirrorLooseAt(t: number): LooseMirror | null {
  if (!LOOSE || t < DIE_T.slip) return null;
  const { c0, frame0, fall, land } = LOOSE;
  const tau = Math.min(t, land + 0.3) - DIE_T.slip;
  const k = Math.min(1, tau / fall);
  // (falling as a dropped thing does: slow at first, faster; out from her side as it goes; a hop of a clatter as it lands)
  let z = c0[2] + (MIRROR_LIES[2] - c0[2]) * k * k;
  const after = t - land;
  if (after > 0 && after < 0.12) z = MIRROR_LIES[2] + 0.9 * Math.sin((Math.PI * after) / 0.12);
  const across = k;
  const c: V3 = [c0[0] + (MIRROR_LIES[0] - c0[0]) * across, c0[1] + (MIRROR_LIES[1] - c0[1]) * across, z];
  // (tumbling over onto its back as it falls, turning a little as it goes)
  const { axis, deg } = turnBetween(frame0, LIES_FRAME);
  const kk = smooth(0, 1, Math.min(1, k * 1.05));
  const spin = 40 * (1 - kk);
  const turn = (v: V3): V3 => about(about(v, axis, deg * kk), [0, 0, 1], spin);
  const [up, n, side] = [turn(frame0[0]), turn(frame0[1]), turn(frame0[2])];
  const crack = after >= -1e-6 ? 1 : 0;
  const glint = after >= -1e-6 ? Math.max(0, 1 - after / 0.4) : 0;
  // (the shards: flung out from its edge as it lands, a hop each, and lying round it)
  const shards: V3[] = [];
  if (after >= -1e-6) {
    for (let i = 0; i < 6; i++) {
      const a = -1.1 + i * 0.75 + 0.3 * hash(i, 1, 7861);
      const far = 6.5 + 4 * hash(i, 2, 7861);
      const u = Math.min(1, after / (0.1 + 0.08 * hash(i, 3, 7861)));
      const dir: V3 = [Math.cos(a), Math.sin(a), 0];
      const at = add(MIRROR_LIES, mul(dir, 3 + (far - 3) * (1 - (1 - u) * (1 - u))));
      shards.push([at[0], at[1], 0.4 + 3 * u * (1 - u) * 4 * 0.5]);
    }
  }
  return { c, up, n, side, crack, glint, shards, t };
}

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
const FEET: Record<string, (t: number) => P> = { attack: flashFeet(), dart: dartFeet(), dying: diesFeet, reel: reelFeet() };
const bonesOf = (move: string, t: number): Skeleton => {
  const tt = Math.max(0, Math.min(PLANS[move].long, t));
  return solve(B, { ...R, ...POSES[move](tt), ...(FEET[move]?.(tt) ?? {}) } as Posed);
};
// (the mirror's fall, from where it is in her hand as it slips: how long it falls, and when it lands)
LOOSE = ((): LoosePath => {
  const k = mirrorOf(bonesOf('dying', DIE_T.slip));
  const fall = Math.sqrt((2 * Math.max(1, k.c[2] - MIRROR_LIES[2])) / G);
  return { c0: k.c, frame0: [k.up, k.n, k.side], fall, land: DIE_T.slip + fall };
})();
/** HER DEATH'S TIMES (see DIE_T), and when the mirror lands and cracks (`land`). */
export const LD_DIES = { ...DIE_T, land: LOOSE.land } as const;
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
  if (move === 'dying') {
    // THE MIRROR CRACKS AS IT LANDS: a glint off the crack, flaring and going; the tiny shards flung off it, lying round it
    const lm = mirrorLooseAt(t);
    if (lm && lm.crack > 0) {
      if (lm.glint > 0.03) {
        const c = add(lm.c, add(mul(lm.n, MIRROR.thick + 0.5), add(mul(lm.up, 1.2), mul(lm.side, -0.8))));
        const long = 2 + 10 * lm.glint;
        for (const [dir, len] of [[[0, 0, 1], long], [norm(add(lm.up, mul(lm.side, -1))), long * 0.8], [norm(add(lm.up, lm.side)), long * 0.45], [lm.side, long * 0.45]] as [V3, number][]) {
          for (let e = -len; e <= len; e += 0.6) {
            const far = Math.abs(e) / len;
            out.push([add(c, mul(dir, e)), far < 0.25 ? '#ffffff' : far < 0.6 ? '#e6e0f4' : '#b6acd2', far < 0.2 && lm.glint > 0.4 ? 2 : 1]);
          }
        }
      }
      lm.shards.forEach((p, i) => out.push([p, i % 3 === 0 ? '#ffffff' : i % 3 === 1 ? '#c8c2dc' : '#8e98b8', 1]));
    }
  }
  void s;
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
  glideBack: 'She glides back, away from you',
  glideLeft: 'She glides round you, to her left',
  glideRight: 'She glides round you, to her right',
  attack: 'The mirror flash',
  dart: 'The dart',
  reel: 'A lady-in-waiting is struck',
  dying: 'She swoons; the mirror falls and cracks; the Hush leaves her',
} as const;
const byName: Record<string, string> = Object.fromEntries(Object.entries(LD_NAMES).map(([k, v]) => [v, k]));
const glideOf = (m: Moment): { way: readonly [number, number]; pace: number } | undefined => (LD_GLIDES as Record<string, { way: readonly [number, number]; pace: number }>)[byName[m.move ?? ''] ?? ''];
const SAY: LadySay = {
  dropped: (m) => !!m.dying && m.t >= LD_DIES.slip,
  // (the mirror in her hand never cracks now: it cracks as it lands, loose of her)
  crack: () => 0,
  loose: (m) => (m.dying ? mirrorLooseAt(m.t) : null),
  shut: (m) => (m.dying ? dieShut(m.t) : 0),
  more: (m) => moreOf(byName[m.move ?? ''] ?? '', m),
  // (as she swoons, only a thread of it, and none as she lies; then it leaves her in one great breath)
  puff: (m) => (m.dying ? Math.max(0, 0.6 * (1 - smooth(0.05, 0.32, m.t))) + (m.t > DIE_T.breath[0] && m.t < DIE_T.breath[1] ? 1.5 * Math.sin((Math.PI * (m.t - DIE_T.breath[0])) / (DIE_T.breath[1] - DIE_T.breath[0])) : 0) : 0.35 + 0.8 * clamp01(m.glint)),
  lights: (m) => lightsOf(byName[m.move ?? ''] ?? '', m),
  dies: { breath: DIE_T.breath, still: DIE_T.still, pool: (t) => ({ k: smooth(0.95, DIE_T.sit + 0.05, t), lie: smooth(DIE_T.lie[0], DIE_T.lie[1], t) }) },
  glide: (m) => (glideOf(m) ? 1 : 0),
  drift: (m) => {
    const g = glideOf(m);
    return g && g.way[1] !== 0 ? [0, g.way[1] * g.pace * TILE3 * FR, 0] : [0, 0, 0];
  },
};

function ladyMob(): Mob {
  const paint = ladyPainter(SAY);
  const mv = (name: string, motion: Motion, more: Partial<MobMove> = {}): MobMove => ({ name, motion, rest: R, ...more });
  // HER GLIDES, all facing you: forward (her walk), back, and round you to her left and to her right; each carried at its own pace
  const glide = (name: GlideName): MobMove => mv(LD_NAMES[name], glideMotion(name), { period: LD_GLIDE.frames / LD_GLIDE.fps, ground: LD_GLIDES[name].way[0] * LD_GLIDES[name].pace * TILE3, jaw: (t) => 0.4 + 0.25 * Math.max(0, Math.sin(t * 9)) });
  return {
    id: 'gallery-lady',
    name: 'A lady-in-waiting',
    size: "small: the knight's height, in crowds",
    build: B,
    stand: mv(LD_NAMES.stand, standMotion(), { jaw: ladyJaw }),
    attack: mv(LD_NAMES.attack, motionOf(PLANS.attack), { feet: FEET.attack, glint: flashGlint, jaw: flashJaw }),
    // (the dart is no longer hers: his pick of 30 Oct, “never dart”; its code is kept above, out of her moves)
    more: { glideBack: glide('glideBack'), glideLeft: glide('glideLeft'), glideRight: glide('glideRight') },
    idleFrames: LD_IDLE.frames,
    idleFps: LD_IDLE.fps,
    walk: glide('walk'),
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
    // (nothing of her falls by itself: the mirror as it falls and lies is in her own frames, art/gallery_ladies.ts)
    fall() {
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

function len3(v: V3): number {
  return Math.hypot(v[0], v[1], v[2]);
}
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
function mirrorThings(k: ReturnType<typeof mirrorOf>, may: string[] = ['foreR']): CheckThing[] {
  const rim: V3[] = [];
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    rim.push(add(k.c, add(mul(k.up, Math.cos(a) * MIRROR.ry), mul(k.side, Math.sin(a) * MIRROR.rx))));
  }
  return [
    { name: 'mirror handle', pts: [k.butt, k.grip, k.neck], r: 0.6, may },
    { name: 'mirror glass', pts: [k.c, ...rim], r: 0.6, may: may.filter((x) => x !== 'foreR') },
  ];
}
/** Her glides, and all her moves. */
export const LD_GLIDE_MOVES: readonly GlideName[] = ['walk', 'glideBack', 'glideLeft', 'glideRight'];
const glideFrames = (g: string): number[] => Array.from({ length: LD_GLIDE.frames + 1 }, (_, i) => i / LD_GLIDE.fps);
export const LD_SHAPE: BossShape = {
  body: ladySolids,
  tip: (move, _t, s) => (move === 'attack' ? mirrorOf(s).face : null),
  things: (move, t, s) => {
    if (move !== 'dying' || t < LD_DIES.slip) return mirrorThings(mirrorOf(s));
    // (loose of her hand, falling past her arm and lying beside her: through nothing of her)
    const lm = mirrorLooseAt(t);
    return lm ? mirrorThings(mirrorAt(lm.c, lm.up, lm.n, lm.side), t < LD_DIES.slip + 0.12 ? ['foreR', 'handR'] : []) : [];
  },
  grips: (move, t, s) => gripsOf(move, t, s),
  strikes: LD_STRIKES,
  smeared: smearedAt,
  handovers: [
    // (her stand, from any frame of it, into each move; her flash and struck back into it)
    ...['attack', 'reel', 'dying', ...LD_GLIDE_MOVES].map((m): Handover => ({ from: 'stand', at: 0, to: m, toAt: 0 })),
    { from: 'attack', at: 'end', to: 'stand', toAt: 0 },
    { from: 'reel', at: 'end', to: 'stand', toAt: 0 },
    // (each glide, from any frame of it: into her stand, into her flash, and into each other glide, as she turns her going)
    ...LD_GLIDE_MOVES.flatMap((g) => glideFrames(g).flatMap((at): Handover[] => [
      { from: g, at, to: 'stand', toAt: 0 },
      { from: g, at, to: 'attack', toAt: 0 },
      ...LD_GLIDE_MOVES.filter((h) => h !== g).map((h): Handover => ({ from: g, at, to: h, toAt: 0 })),
    ])),
  ],
};
void sub;
