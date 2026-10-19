// FLOOR 13'S BOSS, THE PALIMPSEST: ITS MOVES (the art chat for floors 11 to 15, 19 Oct 2026). A MOCK-UP: NOT IN THE
// GAME, behind PALIMPSEST_ON (art/palimpsest.ts, off). Its look and brief are art/palimpsest.ts: made on his word of
// 18 Oct, 21:24 Pacific, “Hey go without my say so.  If something is shit I’ll get it to it but you’re doing a great
// jobs. At least for 11-15”, the picks this chat would have marked recommended, and sent him with their films.
//
// ITS MOVES (his doc's four: “a pulp-fist slam (its basic attack); Paper Cuts, a whirl of slicing pages around it; Loose
// Leaves, pages that flap off as paper birds and dive at you; Rewrite, where it soaks fallen pages back up to heal unless
// they're burned”):
//   STANDING (art/palimpsest.ts): hunched, heaving, its weight rolling from foot to foot, its fists dripping.
//   THE LUMBER: slow, heavy strides, the body rolling over each foot, the great fists swinging.
//   THE PULP-FIST SLAM (its blow): both fists hauled up over its head, joined, rearing back; held there trembling, the
//     stolen words in it burning up through the cracks (THE WARNING); then, hips first, it heaves forward and brings
//     them down on the floor before it, a splash of pulp and paper; held there; heaved back up.
//   PAPER CUTS: it crouches and spreads its arms; its pages lift off it and stand out, their edges glinting pink (THE
//     WARNING); then they tear off and fly round it in a whirl, edge on, slicing, as it sways and stirs them round; the
//     whirl flies home and the pages lie down on it again.
//   LOOSE LEAVES: it rears back, chest out, arms flung back; the crest on its back stands up and shakes, the leaves'
//     edges glinting (THE WARNING); then it heaves forward and the leaves tear off and fold into paper birds that flap
//     up off it (the game takes them on from there, diving at the hero: art/palimpsest_shots.ts); the crest grows back.
//   REWRITE: it crouches low, its fists planted on the floor, its head bowed, the stolen words in it burning; the pages
//     lying about the floor crawl home to it across the floor and climb back onto it (the game's pages, the ones not
//     burned: art/palimpsest_shots.ts); it rises.
//   STRUCK: rocked back, pages torn off its front and flung away, the older writing under them showing.
//   ITS DEATH: rocked back; its pages slough off it, from its crown down, and fall about it; the stolen words rise out of
//     it, pink going pale as they go free; its knees give, and it falls forward onto its fists and its face, a heap of
//     old wet paper.
//
// By his rulebook: every move through every check the bosses have (art/boss_checks.ts), from in front and behind: its
// feet grip the floor; nothing through it; nothing in the floor; nothing jerky; the blow drawn back, held and carried
// through, hips first; alive when still.
//   test: tsx --test tests/palimpsest.test.ts

import { footwork, kneelHips, kneelSettle, plantBy, plantOf } from './bosses3';
import type { Plant } from './bosses3';
import type { BossShape, CheckLimb, CheckLump } from './boss_checks';
import type { ActorArt } from './actor_types';
import { hash } from './kit';
import { FLAME } from './mkit';
import { CREST, PAGES, PA_BODY, PA_CANVAS, PA_REST, PA_WHIRL, PULP, clamp01, crestLeaf, fistOf, fr, onSolid, pageSkin, palimpsestPainter, paStand, sm, solidsOf } from './palimpsest';
import type { PaSay, PageAt } from './palimpsest';
import { TILE3, mobSet, skeletonAt } from './new_mobs3';
import type { Mob, MobMove, Moment, Put } from './new_mobs3';
import { add, cross, dot, elbowFor, len, lerp3, mul, norm, solve, sub } from './skeleton';
import type { Bones, Key3, Motion, Posed, Skeleton, V3 } from './skeleton';

type P = Partial<Bones>;
const B = PA_BODY;
const R = PA_REST;
const L0 = plantOf(B, 'L', {}, R);
const R0 = plantOf(B, 'R', {}, R);

/** How worn it is painted (0 whole, 1 half its pages gone): the dev page's, and the game's to choose by its life. */
export const WEAR = { now: 0 };

/** Its elbows pointed as nearly toward these ways as its arms let them (the figure's own axes). */
function elbowsTo(pose: P, wantL: V3 | null, wantR: V3 | null): P {
  const q = { ...R, ...pose } as Posed;
  const le = wantL ? elbowFor(B, q, true, norm(wantL)) : q.le;
  const re = wantR ? elbowFor(B, { ...q, le } as Posed, false, norm(wantR)) : q.re;
  return { ...pose, le, re };
}
/** Both hands from the shoulders along the figure's own axes (forward, to its left, up), the right a mirror of the left unless said. */
const arms = (l: V3, r: V3 = [l[0], -l[1], l[2]]): P => ({ lhIn: 1, lhx: l[0], lhy: l[1], lhz: l[2], rhIn: 1, rhx: r[0], rhy: r[1], rhz: r[2] });

// =============================================================================================
// THE LUMBER

export const PA_PACE = 0.8;
export const PA_WALK = { frames: 12, fps: 8 } as const;
/** A foot of a walk of `n` frames, `k` frames into its round: down from the first frame to the middle one, carried back under the figure; then lifted and swung through. Forward, lift, how its sole is tipped. */
function stepFoot(k: number, n: number, step: number, lift: number): [number, number, number] {
  const half = n / 2;
  if (k <= half) return [step * (half / 2 - k), 0, 0];
  const u = (k - half) / half;
  const g = u * u * (3 - 2 * u);
  return [-step * (half / 2) + step * half * g, lift * Math.sin(Math.PI * u), 16 * Math.sin(Math.PI * u) * (1 - u) - 6 * Math.sin(Math.PI * u) * u];
}
function paWalk(): Motion {
  const n = PA_WALK.frames;
  const d = (PA_PACE * TILE3) / PA_WALK.fps;
  const keys: Key3[] = [];
  for (let i = 0; i <= n; i++) {
    const j = i % n;
    const a = (j / n) * Math.PI * 2;
    const [lx, lz, lp] = stepFoot(j, n, d, 6);
    const [rx, rz, rp] = stepFoot((j + n / 2) % n, n, d, 6);
    // (the body sinking onto each foot as it comes down and rolling over it; the fists swinging against the legs)
    const sag = Math.abs(Math.sin(a));
    keys.push({
      at: i / PA_WALK.fps,
      ease: 'lin',
      pose: {
        ...arms([R.lhx + 7 * Math.sin(a + Math.PI), R.lhy, R.lhz + 1.5 * sag], [R.rhx + 7 * Math.sin(a), R.rhy, R.rhz + 1.5 * sag]),
        lhIn: 0, rhIn: 0, le: R.le, re: R.re,
        pz: R.pz - 1.8 * sag, py: 2.0 * Math.sin(a), roll: 5 * Math.sin(a), yaw: 5 * Math.cos(a), side: 2.4 * Math.sin(a),
        bend: R.bend + 2 * sag, pitch: R.pitch + 2, faceUp: R.faceUp - 2 * sag, faceTilt: R.faceTilt + 4 * Math.sin(a), faceTurn: 5 * Math.cos(a),
        lfx: lx, lfz: lz, lfp: lp, lfy: R.lfy, lft: R.lft,
        rfx: rx, rfz: rz, rfp: rp, rfy: R.rfy, rft: R.rft,
      },
    });
  }
  return { keys, loop: 0 };
}

// =============================================================================================
// THE PULP-FIST SLAM

/** Its blow: how long; up, held (THE WARNING), the blow (a frame of the game's thirty a second), the fists on the floor from `land`, heaved back up from `lift`. */
export const PA_SLAM = { long: 2.1, up: 0.42, warn: [0.42, 0.78], hit: 27 / 30, land: 29 / 30, lift: 1.3 } as const;
const SH = PA_SLAM.hit;
/** The hands over its head, the fists together (L to its left). */
const OVER: P = arms([-6, -10, 39]);
/** Reared back under them. */
const REARED: P = { ...OVER, px: -3, pz: R.pz + 2.5, pitch: -6, bend: -10, faceUp: 36, faceTilt: 0, faceTurn: 0, lk: 14, rk: -14 };
const trembling = (k: number): P => ({ ...REARED, lhz: (REARED.lhz as number) + (k % 2 ? 0.8 : -0.5), rhz: (REARED.rhz as number) + (k % 2 ? 0.8 : -0.5), pz: (REARED.pz as number) + (k % 2 ? 0.25 : 0) });
/** The drive: the hips coming forward first, the chest and the fists still back. */
const DRIVE: P = { ...arms([-4, -10, 39]), px: 0, pz: R.pz + 1.0, pitch: 10, bend: -8, faceUp: 34, lk: 18, rk: -16 };
/** THE BLOW: heaved over, the fists coming down before it. */
const STRIKE: P = { ...arms([26, -8, -14]), px: 4, pz: R.pz - 3, pitch: 24, bend: 18, faceUp: 30, lk: 22, rk: -18 };
/** On the floor: the fists in it before it, its weight on them. */
const DOWN: P = { ...arms([30, -8, -32]), px: 5, pz: R.pz - 6, pitch: 28, bend: 26, faceUp: 34, lk: 24, rk: -20 };
const DOWN2: P = { ...DOWN, pz: R.pz - 6.6, pitch: 29, bend: 27 };
/** Heaving itself back up off them. */
const HEAVE: P = { ...arms([18, -2, -38]), px: 2, pz: R.pz - 3, pitch: 18, bend: 22, faceUp: 28, lk: 20, rk: -18 };
function paSlam(): Motion {
  return {
    hit: SH,
    keys: [
      { at: 0, pose: {} },
      // (a dip and the fists swung back, then hauled up over its head)
      { at: 0.16, pose: { ...arms([-8, 8, -36]), pz: R.pz - 1.5, pitch: R.pitch + 4, bend: R.bend + 4 }, ease: 'io' },
      { at: PA_SLAM.up, pose: REARED, ease: 'out' },
      { at: 0.5, pose: trembling(1), ease: 'io' },
      { at: 0.58, pose: trembling(2), ease: 'io' },
      { at: 0.66, pose: trembling(3), ease: 'io' },
      { at: PA_SLAM.warn[1], pose: trembling(4), ease: 'io' },
      { at: SH - 0.08, pose: DRIVE, ease: 'in' },
      { at: SH, pose: STRIKE, ease: 'lin' },
      { at: PA_SLAM.land, pose: DOWN, ease: 'out' },
      { at: PA_SLAM.lift, pose: DOWN2, ease: 'io' },
      { at: 1.62, pose: HEAVE, ease: 'io' },
      { at: PA_SLAM.long, pose: {}, ease: 'io' },
    ],
  };
}
function paSlamFeet(): (t: number) => P {
  return footwork(B, {
    L: { start: L0, moves: [{ t0: SH - 0.12, t1: SH - 0.01, to: plantBy(L0, 9, 1, 6), lift: 4 }, { t0: 1.62, t1: 1.94, to: L0, lift: 4 }] },
    R: { start: R0, moves: [] },
  });
}
/** Where the fists come down: the middle of the two at the moment they land (the figure's own lengths from its place on the floor). */
export function slamAt(): V3 {
  const s = skeletonAt(PALIMPSEST, 'attack', PA_SLAM.land);
  return lerp3(fistOf(s, 'L').c, fistOf(s, 'R').c, 0.5);
}

// =============================================================================================
// PAPER CUTS

/** The whirl: the warning (its pages lifting, glinting), the pages torn off and flung out (`hit`), whirling to `home`, back on it by `on`. */
export const PA_CUTS = { long: 2.8, warn: [0.22, 0.7], hit: 0.75, out: 0.3, home: 2.2, on: 2.55 } as const;
/** How fast the whirl goes round (turns a second). */
const WHIRL_TURNS = 1.25;
const SPREAD: P = { ...arms([4, 30, -16]), pz: R.pz - 4, pitch: 14, bend: 18, faceUp: 30, lk: 22, rk: -22 };
const spreadShake = (k: number): P => ({ ...SPREAD, twist: k % 2 ? 2.5 : -2.5, lhz: (SPREAD.lhz as number) + (k % 2 ? 0.6 : -0.4) });
const FLUNG: P = { ...arms([0, 34, -6]), pz: R.pz - 1, pitch: 4, bend: 6, faceUp: 36, lk: 18, rk: -18 };
const stir = (dir: number): P => ({ ...FLUNG, twist: 18 * dir, yaw: 6 * dir, side: 3 * dir, ...arms([dir * 8, 32, -10], [-dir * 8, -32, -10]) });
function paCuts(): Motion {
  return {
    hit: PA_CUTS.hit,
    keys: [
      { at: 0, pose: {} },
      { at: PA_CUTS.warn[0], pose: SPREAD, ease: 'io' },
      { at: 0.34, pose: spreadShake(1), ease: 'io' },
      { at: 0.46, pose: spreadShake(2), ease: 'io' },
      { at: 0.58, pose: spreadShake(3), ease: 'io' },
      { at: PA_CUTS.warn[1], pose: spreadShake(4), ease: 'io' },
      { at: PA_CUTS.hit + 0.08, pose: FLUNG, ease: 'out' },
      { at: 1.15, pose: stir(1), ease: 'io' },
      { at: 1.55, pose: stir(-1), ease: 'io' },
      { at: 1.95, pose: stir(1), ease: 'io' },
      { at: PA_CUTS.on, pose: { ...SPREAD, pz: R.pz - 2, pitch: 10, bend: 14 }, ease: 'io' },
      { at: PA_CUTS.long, pose: {}, ease: 'io' },
    ],
  };
}

// =============================================================================================
// LOOSE LEAVES

/** The crest: shaking (THE WARNING), torn off at `hit` and folded into birds that flap up off it, gone from the picture at `launch` (the game's from there); the crest growing back. */
export const PA_LEAVES = { long: 2.2, warn: [0.38, 0.8], hit: 0.86, launch: 1.2, regrow: [1.45, 2.05] } as const;
const REAR: P = { ...arms([-14, 16, -34]), px: -2, pz: R.pz + 2.5, pitch: -6, bend: -12, faceUp: 42, faceTilt: 0, lk: 14, rk: -14 };
const rearShake = (k: number): P => ({ ...REAR, pz: (REAR.pz as number) + (k % 2 ? 0.4 : -0.2), bend: (REAR.bend as number) + (k % 2 ? -1 : 1) });
const HEAVED: P = { ...arms([16, 8, -36]), px: 3, pz: R.pz - 2.5, pitch: 18, bend: 22, faceUp: 26, lk: 20, rk: -20 };
/** Part of the way from one pose to another (every number of them). */
function between3(a: P, b: P, k: number): P {
  const out: Record<string, unknown> = {};
  for (const key of new Set([...Object.keys(a), ...Object.keys(b)])) {
    const va = (a as Record<string, unknown>)[key] ?? (R as unknown as Record<string, unknown>)[key];
    const vb = (b as Record<string, unknown>)[key] ?? (R as unknown as Record<string, unknown>)[key];
    out[key] = typeof va === 'number' && typeof vb === 'number' && !key.endsWith('In') ? va + (vb - va) * k : k < 0.5 ? va : vb;
  }
  return out as P;
}
function paLeaves(): Motion {
  return {
    hit: PA_LEAVES.hit,
    keys: [
      { at: 0, pose: {} },
      { at: PA_LEAVES.warn[0], pose: REAR, ease: 'out' },
      { at: 0.48, pose: rearShake(1), ease: 'io' },
      { at: 0.58, pose: rearShake(2), ease: 'io' },
      { at: 0.68, pose: rearShake(3), ease: 'io' },
      { at: PA_LEAVES.warn[1], pose: rearShake(4), ease: 'io' },
      { at: PA_LEAVES.hit, pose: between3(REAR, HEAVED, 0.3), ease: 'in' },
      { at: 0.93, pose: between3(REAR, HEAVED, 0.72), ease: 'lin' },
      { at: 1.05, pose: HEAVED, ease: 'out' },
      { at: 1.45, pose: { ...HEAVED, pitch: 16, bend: 20, pz: R.pz - 2 }, ease: 'io' },
      { at: PA_LEAVES.long, pose: {}, ease: 'io' },
    ],
  };
}

// =============================================================================================
// REWRITE

/** Crouched by `down`; its pages crawling home from `crawl[0]` to `crawl[1]`; risen by `long`. */
export const PA_REWRITE = { long: 3.0, down: 0.5, crawl: [0.5, 2.3], up: 2.45 } as const;
const HUNKER: P = { ...arms([20, 14, -46]), px: 2, pz: R.pz - 13, pitch: 26, bend: 24, faceUp: 6, faceTilt: 0, lk: 30, rk: -30 };
const hunkerBreath = (k: number): P => ({ ...HUNKER, pz: (HUNKER.pz as number) + (k % 2 ? 1.4 : 0), bend: (HUNKER.bend as number) + (k % 2 ? -2 : 1), faceUp: (HUNKER.faceUp as number) + (k % 2 ? 4 : 0) });
function paRewrite(): Motion {
  return {
    keys: [
      { at: 0, pose: {} },
      { at: PA_REWRITE.down, pose: HUNKER, ease: 'io' },
      { at: 0.9, pose: hunkerBreath(1), ease: 'io' },
      { at: 1.3, pose: hunkerBreath(2), ease: 'io' },
      { at: 1.7, pose: hunkerBreath(3), ease: 'io' },
      { at: 2.1, pose: hunkerBreath(4), ease: 'io' },
      { at: PA_REWRITE.up, pose: { ...HUNKER, pz: R.pz - 6, pitch: 18, bend: 20, faceUp: 20, ...arms([12, 10, -42]) }, ease: 'io' },
      { at: PA_REWRITE.long, pose: {}, ease: 'io' },
    ],
  };
}

// =============================================================================================
// STRUCK

export const PA_REEL = 0.45;
function paReel(): Motion {
  return {
    keys: [
      { at: 0, pose: {} },
      { at: 0.06, pose: { px: -3, pz: R.pz + 0.8, pitch: R.pitch - 8, bend: R.bend - 10, faceUp: R.faceUp + 16, lhx: R.lhx - 6, rhx: R.rhx - 6, lhz: R.lhz + 3, rhz: R.rhz + 3 }, ease: 'out' },
      { at: 0.2, pose: { px: -1.5, pitch: R.pitch - 2, bend: R.bend - 3, faceUp: R.faceUp + 5 }, ease: 'io' },
      { at: PA_REEL, pose: {}, ease: 'io' },
    ],
  };
}

// =============================================================================================
// ITS DEATH

export const PA_DIES = { long: 3.4, peel: [0.12, 1.5], words: [0.3, 2.4], knees: 1.2, down: 2.3 } as const;
const DIE_FEET = ((): Record<'L' | 'R', Plant> => ({ L: plantBy(L0, 2, 0), R: R0 }))();
const TUCK = 56;
const KNEE_DOWN = 9.0;
const kneeling = (lean: number, body: P): P => kneelSettle(B, R, { ...kneelHips(B, R, DIE_FEET, TUCK, KNEE_DOWN, lean), ...body }, DIE_FEET, TUCK, KNEE_DOWN);
const LIMP: P = { lhIn: 0, lhx: 6, lhy: 9, lhz: -40, le: -16, rhIn: 0, rhx: 6, rhy: -9, rhz: -40, re: 16 };
/** Its fists laid on the floor before it, where its body puts them as it goes down. */
function onFists(body: P, ahead: number, out: number, z: number): P {
  const s = solve(B, { ...R, ...body, lhIn: 0, rhIn: 0 } as Posed);
  const Lh: V3 = [s.shoulderL[0] + ahead, s.shoulderL[1] + out, z];
  const Rh: V3 = [s.shoulderR[0] + ahead, s.shoulderR[1] - out, z];
  const q = { ...R, ...body, lhIn: 2, lhx: Lh[0], lhy: Lh[1], lhz: Lh[2], rhIn: 2, rhx: Rh[0], rhy: Rh[1], rhz: Rh[2] } as Posed;
  const le = elbowFor(B, q, true, norm([0, 1, -0.2]));
  const re = elbowFor(B, { ...q, le } as Posed, false, norm([0, -1, -0.2]));
  return { ...body, lhIn: 2, lhx: Lh[0], lhy: Lh[1], lhz: Lh[2], rhIn: 2, rhx: Rh[0], rhy: Rh[1], rhz: Rh[2], le, re };
}
const ON_KNEES: P = kneeling(8, { yaw: 0, pitch: 8, roll: 2, twist: 0, bend: 14, side: 1, faceTurn: 0, faceUp: 10, faceTilt: 8, ...LIMP });
const FOLD: P = kneeling(20, { yaw: 3, pitch: 34, roll: 3, twist: 0, bend: 26, side: 1, faceTurn: 6, faceUp: -10, faceTilt: 8, ...LIMP });
const PRONE: P = { ...onFists(kneeling(46, { yaw: 6, pitch: 60, roll: 4, twist: 0, bend: 26, side: 0, faceTurn: 16, faceUp: -24, faceTilt: 14 }), 6, 4, 17), out: 1 };
function paDying(): Motion {
  return {
    keys: [
      { at: 0, pose: {} },
      { at: 0.08, pose: { px: -3, pz: R.pz + 0.8, pitch: R.pitch - 8, bend: R.bend - 10, faceUp: R.faceUp + 18, out: 0.1 }, ease: 'out' },
      // (shuddering as its pages slough off it, its arms falling slack)
      { at: 0.4, pose: { px: -2, pz: R.pz, pitch: R.pitch - 2, bend: R.bend - 2, faceUp: R.faceUp + 24, roll: -3, ...LIMP, out: 0.3 }, ease: 'io' },
      { at: 0.7, pose: { px: -1.5, pz: R.pz - 1, pitch: R.pitch + 2, bend: R.bend + 2, faceUp: R.faceUp + 14, roll: 3, ...LIMP, out: 0.6 }, ease: 'io' },
      // its knees give
      { at: 0.95, pose: { px: -0.5, pz: R.pz - 9, pitch: R.pitch + 4, bend: R.bend + 4, faceUp: 18, lk: 34, rk: -34, ...LIMP, out: 0.9 }, ease: 'in' },
      { at: PA_DIES.knees, pose: { ...ON_KNEES, out: 1 }, ease: 'out' },
      { at: 1.5, pose: { ...ON_KNEES, pz: (ON_KNEES.pz as number) + 0.8, pitch: 4, roll: -3, faceUp: 16, out: 1 }, ease: 'io' },
      { at: 1.8, pose: { ...ON_KNEES, pitch: 12, roll: 4, faceUp: 2, out: 1 }, ease: 'io' },
      // and falls forward onto its fists and its face
      { at: 2.05, pose: { ...FOLD, out: 1 }, ease: 'in' },
      { at: PA_DIES.down, pose: PRONE, ease: 'out' },
      { at: PA_DIES.long, pose: PRONE, ease: 'io' },
    ],
  };
}
function paDyingFeet(): (t: number) => P {
  const F = DIE_FEET;
  return footwork(B, {
    L: { start: L0, moves: [{ t0: 0.04, t1: 0.3, to: F.L, lift: 3 }, { t0: 0.8, t1: 1.16, to: { ...F.L, pitch: TUCK } }] },
    R: { start: R0, moves: [{ t0: 0.8, t1: 1.16, to: { ...F.R, pitch: TUCK } }] },
  });
}

// =============================================================================================
// WHAT EACH MOVE TELLS ITS PAINTER

/** Where a page lies on it at a moment of a move (to fly from, or to come home to). */
function pageOn(s: Skeleton, pg: PageAt): { c: V3; u: V3; v: V3; n: V3 } {
  const S = solidsOf(s)[pg.on as keyof ReturnType<typeof solidsOf>];
  const { p, n, round, down } = onSolid(S, pg.th, pg.h);
  const rnd = dot(cross(round, down), n) < 0 ? mul(round, -1) : round;
  const v = norm(add(down, mul(n, 0.32)));
  return { c: add(add(p, mul(n, 0.9)), mul(v, 0)), u: mul(rnd, pg.w), v: mul(v, pg.ht), n };
}
/** The skeletons of a move at moments (cached: pages fly from where they were when they tore off). */
const BONES = new Map<string, Skeleton>();
function bonesAt(move: string, t: number): Skeleton {
  const k = `${move}@${t.toFixed(2)}`;
  let s = BONES.get(k);
  if (!s) {
    s = skeletonAt(PALIMPSEST, move, Number(t.toFixed(2)));
    BONES.set(k, s);
  }
  return s;
}
/** A page in flight from where it tore off (`from`, at `t0`) to where it lands on the floor, `k` 0 to 1 of the way; tumbling as it goes, flat on the floor at the end. */
function flight(from: { c: V3; u: V3; v: V3; n: V3 }, land: V3, k: number, spin: number, pg: PageAt): { c: V3; u: V3; v: V3 } {
  const e = sm(k);
  // (thrown out off it and up a little, then down)
  const up = 10 * Math.sin(Math.PI * Math.min(1, k * 1.15)) * (1 - k * 0.4);
  const c = add(lerp3(from.c, land, e), [0, 0, up * (1 - e)]);
  // (turning over as it goes: its across and down swung round toward lying flat)
  const flatU: V3 = mul(norm([Math.cos(spin), Math.sin(spin), 0]), pg.w);
  const flatV: V3 = mul(norm([-Math.sin(spin), Math.cos(spin), 0]), pg.ht);
  const tumble = Math.sin(k * Math.PI * 2.2 + spin) * (1 - e) * 0.6;
  const u = add(lerp3(from.u, flatU, e), mul(from.n, tumble * pg.w * 0.5));
  const v = add(lerp3(from.v, flatV, e), mul(from.n, -tumble * pg.ht * 0.5));
  return { c: e >= 0.999 ? [land[0], land[1], 0.3 + Math.abs(flatU[2]) + Math.abs(flatV[2])] : c, u, v };
}
/** Where a page torn off it comes to lie: out from it along its skin's way, on the floor. */
function landing(from: { c: V3; n: V3 }, pg: PageAt, far: number): V3 {
  const out = norm([from.n[0], from.n[1], 0], [1, 0, 0]);
  const d = far * (0.7 + 0.6 * hash(pg.seed, 7, 7201));
  const side = (hash(pg.seed, 8, 7201) - 0.5) * far * 0.8;
  return [from.c[0] + out[0] * d - out[1] * side, from.c[1] + out[1] * d + out[0] * side, 0.4];
}

/** The pages torn off as it is struck: a few off its front (the ones first to go as it wears). */
const STRUCK_PAGES = new Set(PAGES.map((p, i) => [p, i] as const).filter(([p]) => p.keep < 0.14 && (p.on === 'chest' || p.on === 'belly' || p.on === 'hump') && Math.cos(p.th) > 0.1).map(([, i]) => i));
/** The pages that fly in its Paper Cuts: half of what it wears (not its head's). */
const WHIRL_PAGES = new Set(PAGES.map((p, i) => [p, i] as const).filter(([p]) => p.keep > 0.5 && p.on !== 'head').map(([, i]) => i));

function whirlAt(pg: PageAt, i: number, t: number): { c: V3; u: V3; v: V3 } {
  const a0 = hash(i, 1, 7211) * Math.PI * 2;
  const a = a0 + (t - PA_CUTS.hit) * WHIRL_TURNS * Math.PI * 2 * (0.85 + 0.3 * hash(i, 2, 7211));
  const r = PA_WHIRL.inner + (PA_WHIRL.outer - PA_WHIRL.inner) * hash(i, 3, 7211);
  const z = 10 + 44 * hash(i, 4, 7211) + 5 * Math.sin(t * 5 + i);
  const radial: V3 = [Math.cos(a), Math.sin(a), 0];
  const tangent: V3 = [-Math.sin(a), Math.cos(a), 0];
  const tilt = t * 7 + i;
  // (edge on to the way it goes, slicing: its face toward the middle, turning over)
  const v = add(mul([0, 0, 1], Math.cos(tilt) * pg.ht), mul(radial, Math.sin(tilt) * pg.ht * 0.6));
  return { c: [radial[0] * r, radial[1] * r, z], u: mul(tangent, pg.w), v };
}

/** A paper bird: a leaf of its crest folded, flapping, from where it tore off up off it (`k` 0 to 1 of the way to where the game takes it on). */
function bird(put: Put, from: V3, to: V3, k: number, t: number, seed: number): void {
  const e = sm(k);
  const c = lerp3(from, to, e);
  const way = norm(sub(to, from), [0, 0, 1]);
  const side = norm(cross(way, [0, 0, 1]), [0, 1, 0]);
  const flap = Math.sin(t * 34 + seed) * 0.9;
  // its body, a folded page; its two wings off it, beating
  put('bird', 'bird', { k: 'panel', c, u: mul(way, 5.6), v: mul(norm(add([0, 0, 1], mul(side, 0.2))), 2.0), skin: pageSkin(seed, 5.6, 2.0) });
  for (const sgn of [-1, 1]) {
    const wingOut = norm(add(mul(side, sgn * Math.cos(flap)), [0, 0, Math.sin(flap)]));
    put('bird', 'bird', { k: 'panel', c: add(c, mul(wingOut, 5.4)), u: mul(way, 4.4), v: mul(wingOut, 5.4), skin: pageSkin(seed + sgn, 4.4, 5.4, 0, 0.5) });
  }
}

/** Its pages lying on the floor about it as it begins its Rewrite: where each lies (from its place), which way, which page. */
const STRAYS = Array.from({ length: 14 }, (_, j) => {
  const a = (j / 14) * Math.PI * 2 + hash(j, 1, 7221) * 0.4;
  const r = 46 + 46 * hash(j, 2, 7221);
  return { at: [Math.cos(a) * r, Math.sin(a) * r] as [number, number], spin: hash(j, 3, 7221) * Math.PI * 2, seed: 600 + j, go: PA_REWRITE.crawl[0] + 0.1 * j };
});
/** How long a page takes to crawl home across the floor, and to climb onto it. */
const CRAWL = 0.75;
const CLIMB = 0.3;

const glintOf = (t: number, a: number, b: number, c: number): number => (t < a ? 0 : t < b ? sm((t - a) / (b - a)) : t < c ? 1 : 0);

/** Its moves' names, as the game holds them (a moment says which move it is of by its name). */
export const NAMES = { stand: 'The Palimpsest stands, heaving', walk: 'The Palimpsest lumbers', attack: 'The pulp-fist slam', cuts: 'Paper Cuts', leaves: 'Loose Leaves', rewrite: 'Rewrite', reel: 'The Palimpsest is struck', dying: 'Its pages slough away' } as const;
const KEY_OF = new Map<string, string>(Object.entries(NAMES).map(([k, v]) => [v, k]));

function sayOf(m: Moment): PaSay {
  const t = m.t;
  const wear = WEAR.now;
  switch (m.dying ? 'dying' : KEY_OF.get(m.move ?? '') ?? '') {
    case 'attack': {
      const glow = glintOf(t, 0.2, PA_SLAM.up, PA_SLAM.land) * 0.8;
      return {
        wear,
        glow,
        stir: 0.3 + glow,
        grains: (out) => {
          const since = t - PA_SLAM.land;
          if (since < 0 || since > 0.6) return;
          // the splash: pulp and scraps thrown out round where the fists came down
          const c = lerp3(fistOf(m.s, 'L').c, fistOf(m.s, 'R').c, 0.5);
          const q = since / 0.6;
          for (let i = 0; i < 80; i++) {
            const a = i * 2.39996;
            const sp = 0.6 + 0.8 * hash(i, 1, 7231);
            const r = 10 + 46 * Math.sqrt(q) * sp;
            const z = Math.max(0.5, 2 + 26 * sp * q * (1 - q) * 4 * (0.4 + hash(i, 2, 7231)) - 0);
            if (q > 0.85 && hash(i, 3, 7231) < q) continue;
            out.push([[c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r * 0.9, z], i % 5 === 0 ? '#c8c0aa' : i % 2 ? PULP[3] : PULP[2], q < 0.5 ? (i % 3 === 0 ? 3 : 2) : 1]);
          }
        },
      };
    }
    case 'cuts': {
      const lift = (i: number): number => (WHIRL_PAGES.has(i) && t < PA_CUTS.hit ? glintOf(t, PA_CUTS.warn[0] - 0.1, PA_CUTS.warn[1], 9) * (0.45 + 0.1 * Math.sin(t * 40 + i)) : 0);
      return {
        wear,
        stir: 0.6,
        lift: (i) => lift(i),
        blade: (i) => (i >= 0 && WHIRL_PAGES.has(i) ? glintOf(t, PA_CUTS.warn[0], PA_CUTS.warn[1], PA_CUTS.on) : 0),
        flown: (i, pg, at) => {
          if (!WHIRL_PAGES.has(i) || t < PA_CUTS.hit || t >= PA_CUTS.on) return null;
          const out = t < PA_CUTS.hit + PA_CUTS.out ? sm((t - PA_CUTS.hit) / PA_CUTS.out) : t < PA_CUTS.home ? 1 : 1 - sm((t - PA_CUTS.home) / (PA_CUTS.on - PA_CUTS.home));
          const w = whirlAt(pg, i, t);
          return { c: lerp3(at.c, w.c, out), u: lerp3(at.u, w.u, out), v: lerp3(at.v, w.v, out) };
        },
      };
    }
    case 'leaves': {
      return {
        wear,
        stir: t < PA_LEAVES.warn[0] ? 0.3 + 2 * t : t < PA_LEAVES.hit ? 1 : 0.3,
        blade: (i) => (i < 0 ? glintOf(t, PA_LEAVES.warn[0] - 0.1, PA_LEAVES.warn[0], PA_LEAVES.hit) : 0),
        crest: () => (t < PA_LEAVES.hit ? 0 : t < PA_LEAVES.regrow[0] ? 1 : 1 - sm((t - PA_LEAVES.regrow[0]) / (PA_LEAVES.regrow[1] - PA_LEAVES.regrow[0]))),
        extra: (put, mm) => {
          if (t < PA_LEAVES.hit || t >= PA_LEAVES.launch) return;
          const k = (t - PA_LEAVES.hit) / (PA_LEAVES.launch - PA_LEAVES.hit);
          const s0 = bonesAt('leaves', PA_LEAVES.hit);
          CREST.forEach((c, i) => {
            const L = crestLeaf(s0, i, PA_LEAVES.hit, 1);
            const from = add(L.root, mul(L.up, L.ht));
            const [cf, cl] = mm.s.chest;
            const to = add(from, add(add(mul(norm([cf[0], cf[1], 0], [1, 0, 0]), 30 + 10 * hash(i, 1, 7241)), mul(cl, c.k * 34)), [0, 0, 30 + 14 * hash(i, 2, 7241)]));
            bird(put, from, to, k, t, c.seed);
          });
        },
      };
    }
    case 'rewrite': {
      const glow = 0.5 + 0.5 * Math.sin((t - PA_REWRITE.down) * 9) ** 2;
      return {
        wear,
        glow: t < PA_REWRITE.down ? sm(t / PA_REWRITE.down) * 0.6 : t < PA_REWRITE.up ? glow : 0.6 * (1 - sm((t - PA_REWRITE.up) / (PA_REWRITE.long - PA_REWRITE.up))),
        stir: 0.5,
        extra: (put, mm) => {
          // the pages lying about the floor, crawling home to it across the floor and climbing onto it
          const S = solidsOf(mm.s);
          STRAYS.forEach((p, j) => {
            const go = t - p.go;
            if (go >= CRAWL + CLIMB) return;
            const target = S[(['thighL', 'thighR', 'belly', 'hips', 'shinL', 'shinR'] as const)[j % 6]];
            const pw = 5.6;
            const ph = 6.4;
            const lie = (c: V3, spin: number, lift: number): void => {
              const u: V3 = [Math.cos(spin) * pw, Math.sin(spin) * pw, 0];
              const v: V3 = add(mul([-Math.sin(spin), Math.cos(spin), 0], ph * Math.cos(lift)), [0, 0, ph * Math.sin(lift)]);
              put('stray', 'stray', { k: 'panel', c: add(c, [0, 0, Math.abs(v[2]) + 0.4]), u, v, skin: pageSkin(p.seed, pw, ph, 0, go > 0 ? 0.3 : 0) });
            };
            const home: V3 = [target.c[0] * 0.8, target.c[1] * 0.8, ph + 0.4];
            if (go < 0) lie([p.at[0], p.at[1], 0], p.spin, 0);
            else if (go < CRAWL) {
              // (sliding over the floor toward it, its edges lifting and dropping like a thing breathing; rearing up at the last)
              const k = sm(go / CRAWL);
              const c: V3 = [p.at[0] + (home[0] - p.at[0]) * k, p.at[1] + (home[1] - p.at[1]) * k, 0];
              if (k > 0.8) {
                lie(c, p.spin + k * 1.2, 0.35 + (Math.PI / 2 - 0.35) * sm((k - 0.8) / 0.2));
                return;
              }
              lie(c, p.spin + k * 1.2, 0.35 * Math.abs(Math.sin(go * 16 + j)));
            } else {
              // (climbing onto it, up its leg, and lying down on it)
              const k = sm((go - CRAWL) / CLIMB);
              const c0 = lerp3(home, target.c, k);
              const n = norm([c0[0] - target.c[0], c0[1] - target.c[1], 0], [1, 0, 0]);
              const u = mul(norm(cross(n, [0, 0, 1]), [1, 0, 0]), pw * (1 - 0.6 * k));
              const v = mul(norm(add([0, 0, -1], mul(n, 0.3))), ph * (1 - 0.6 * k));
              const c = add(c0, mul(n, target.r[0] * (1 - k)));
              const low = c[2] - Math.abs(u[2]) - Math.abs(v[2]);
              put('stray', 'stray', { k: 'panel', c: low < 0.3 ? [c[0], c[1], c[2] + 0.3 - low] : c, u, v, skin: pageSkin(p.seed, pw, ph, 0, 0.3) });
            }
          });
        },
      };
    }
    case 'reel': {
      return {
        wear,
        stir: 0.8,
        flown: (i, pg) => {
          if (!STRUCK_PAGES.has(i) || t < 0.04) return null;
          const s0 = bonesAt('reel', 0.04);
          const from = pageOn(s0, pg);
          return flight(from, landing(from, pg, 22), Math.min(1, (t - 0.04) / 0.36), hash(pg.seed, 9, 7202) * 6, pg);
        },
      };
    }
    case 'dying':
      {
        // ITS DEATH: its pages slough off from its crown down; the stolen words rise out of it
        return {
          wear,
          glow: 0.6 * (1 - sm((t - 1.6) / 0.8)),
          heap: sm((t - (PA_DIES.down - 0.15)) / 0.9),
          stir: 0.5 * (1 - sm(t / 1.2)),
          crest: (i) => sm((t - 0.15 - i * 0.05) / 0.3),
          flown: (i, pg) => {
            const t0 = peelAt(pg);
            if (t < t0) return null;
            const s0 = bonesAt('dying', t0);
            const from = pageOn(s0, pg);
            return flight(from, landing(from, pg, 14), Math.min(1, (t - t0) / 0.5), hash(pg.seed, 9, 7202) * 6, pg);
          },
          grains: (out) => wordsFree(out, m.s, t),
        };
      }
    default:
      return { wear, stir: m.move === NAMES.walk ? 0.4 : 0.25 };
  }
}
/** When a page sloughs off it as it dies: from its crown down, its head's first. */
function peelAt(pg: PageAt): number {
  const top = pg.on === 'head' || pg.on === 'hump' ? 0 : pg.on === 'chest' || pg.on.startsWith('upper') ? 0.25 : pg.on === 'belly' || pg.on.startsWith('fore') ? 0.5 : pg.on === 'hips' || pg.on.startsWith('thigh') ? 0.75 : 1;
  return PA_DIES.peel[0] + (PA_DIES.peel[1] - PA_DIES.peel[0] - 0.4) * (top * 0.85 + 0.15 * hash(pg.seed, 11, 7203)) + (0.5 - pg.h) * 0.08;
}
/** THE STOLEN WORDS GOING FREE as it dies: grains of the enemy's pink rising up out of it, going pale as they rise. */
const FREED = ['#7a7468', '#a49c8c', '#cec6b2', '#e8e2d2', '#f6f2e6'];
function wordsFree(out: [V3, string, number][], s: Skeleton, t: number): void {
  const [a, b] = PA_DIES.words;
  if (t < a || t > b) return;
  const pour = sm((t - a) / 0.3) * (1 - sm((t - (b - 0.6)) / 0.6));
  const N = Math.round(110 * pour);
  const S = solidsOf(s);
  const from = [S.hump.c, S.chest.c, S.belly.c, S.hips.c];
  for (let i = 0; i < N; i++) {
    const life = fr(t * 0.7 + i / 110 + 0.19 * hash(i, 3, 7251));
    const o = from[i % 4];
    const ang = i * 2.39996;
    const r = (3 + 14 * hash(i, 4, 7251)) * (1 + life);
    const p: V3 = [o[0] + Math.cos(ang + life * 2) * r, o[1] + Math.sin(ang + life * 2) * r, o[2] + life * 70 + Math.sin(life * 9 + i) * 2];
    const pale = life > 0.6 - 0.4 * sm((t - a) / 1.2);
    out.push([p, pale ? FREED[life > 0.85 ? 4 : 3] : life < 0.25 ? FLAME[3] : FLAME[2], life < 0.4 ? 2 : 1]);
  }
}

// =============================================================================================
// IT, AS THE GAME HOLDS A MONSTER

function palimpsestMob(): Mob {
  const paint = palimpsestPainter(sayOf);
  const mv = (name: string, motion: Motion, more: Partial<MobMove> = {}): MobMove => ({ name, motion, rest: R, ...more });
  return {
    id: 'palimpsest',
    name: 'The Palimpsest',
    size: 'a boss: a giant, near twice the knight\'s height',
    build: B,
    stand: mv(NAMES.stand, paStand()),
    attack: mv(NAMES.attack, paSlam(), { feet: paSlamFeet(), glint: (t) => glintOf(t, 0.2, PA_SLAM.up, PA_SLAM.land) }),
    idleFrames: 32,
    idleFps: 10,
    walk: mv(NAMES.walk, paWalk(), { period: PA_WALK.frames / PA_WALK.fps, ground: PA_PACE * TILE3 }),
    walkFrames: PA_WALK.frames,
    walkFps: PA_WALK.fps,
    pace: PA_PACE,
    more: {
      cuts: mv(NAMES.cuts, paCuts()),
      leaves: mv(NAMES.leaves, paLeaves()),
      rewrite: mv(NAMES.rewrite, paRewrite()),
    },
    reel: mv(NAMES.reel, paReel()),
    reelTime: PA_REEL,
    hit: SH,
    warn: PA_SLAM.warn[1] - PA_SLAM.warn[0],
    dieTime: PA_DIES.long,
    dying: mv(NAMES.dying, paDying(), { feet: paDyingFeet() }),
    aura: { x: PA_CANVAS.ax, y: PA_CANVAS.ay - 70, r: 96, color: '#ff3a78', a: 0.12 },
    shadow: 30,
    canvas: PA_CANVAS,
    trueBack: true,
    bits: paint.bits,
    grains: paint.grains,
  };
}
export const PALIMPSEST = palimpsestMob();
export function makePalimpsestArt(mob: Mob = PALIMPSEST, pace = mob.pace): ActorArt {
  return { front: mobSet(mob, 'front', pace), back: mobSet(mob, 'back', pace) };
}

// =============================================================================================
// IT AS THE CHECKS SEE IT (art/boss_checks.ts): its outside as painted, by name

export function paSolids(s: Skeleton): { limbs: CheckLimb[]; lumps: CheckLump[] } {
  const S = solidsOf(s);
  const limbs: CheckLimb[] = [];
  for (const side of ['L', 'R'] as const) {
    const L = side === 'L';
    const th = S[L ? 'thighL' : 'thighR'];
    const sh = S[L ? 'shinL' : 'shinR'];
    const up = S[L ? 'upperL' : 'upperR'];
    const fo = S[L ? 'foreL' : 'foreR'];
    limbs.push(
      { name: `leg${side}`, a: L ? s.hipL : s.hipR, b: L ? s.kneeL : s.kneeR, r: th.r[0] },
      { name: `shin${side}`, a: L ? s.kneeL : s.kneeR, b: L ? s.ankleL : s.ankleR, r: sh.r[0] },
      { name: `foot${side}`, a: add(L ? s.heelL : s.heelR, [0, 0, 3.4]), b: add(L ? s.toeL : s.toeR, [0, 0, 3.4]), r: 3.6 },
      { name: `upper${side}`, a: L ? s.shoulderL : s.shoulderR, b: L ? s.elbowL : s.elbowR, r: up.r[0] },
      { name: `fore${side}`, a: L ? s.elbowL : s.elbowR, b: L ? s.handL : s.handR, r: fo.r[0] },
    );
  }
  limbs.push({ name: 'neck', a: s.neck, b: lerp3(s.neck, s.head, 0.5), r: 4 });
  const lump = (name: string, k: keyof typeof S, shrink = 1): CheckLump => ({ name, c: S[k].c, rot: [S[k].f, S[k].l, S[k].u], h: mul(S[k].r, shrink) as V3 });
  // (its fists are its arms' own ends: not solids its arms keep out of)
  const lumps: CheckLump[] = [lump('head', 'head'), lump('hump', 'hump'), lump('chest', 'chest'), lump('belly', 'belly'), lump('hips', 'hips')];
  return { limbs, lumps };
}
export const PA_SHAPE: BossShape = {
  body: paSolids,
  // (what it strikes with: its two fists, together)
  tip: (move, _t, s) => (move === 'attack' ? lerp3(fistOf(s, 'L').c, fistOf(s, 'R').c, 0.5) : null),
};
void len;
