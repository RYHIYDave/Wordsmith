// FLOOR 15'S SMALL MOB, THE INKLINGS: THEIR MOVES (the art chat for floors 11 to 15, 19 Oct 2026). A MOCK-UP: NOT IN
// THE GAME, behind INKLINGS_ON (art/inklings.ts, off). Their look and brief are art/inklings.ts: made on his word of 18
// Oct, 21:24 Pacific, “Hey go without my say so.  If something is shit I’ll get it to it but you’re doing a great jobs. At
// least for 11-15”, the picks this chat would have marked recommended, and sent him with their films.
//
// THEIR MOVES:
//   STANDING (art/inklings.ts): swaying on their haunches, the ink running down them, the head twitching round.
//   THE SCUTTLE: low and quick, the long arms swinging.
//   THE INK LASH (their blow): they rear up tall, arms flung wide and high, claws spread, eyes flaring, quivering (THE
//     WARNING); then lunge, and rake both claws down across before them, ink flying off them.
//   MELT: they sink down and run into a pool of ink on the floor (the game slides the pool along the floor:
//     art/inkling_shots.ts).
//   RISE: out of a pool of ink, a lump bulges up, and they pull themselves up out of it to crouch before you.
//   STRUCK: splashed back, the ink rippling.
//   THEIR DEATH: they burst, ink splashing out of them; they slump and run down into a spreading pool, the eyes going
//     out, and the pool dries away to a dull stain.
//
// By his rulebook: every move through every check the bosses have (art/boss_checks.ts), from in front and behind.
//   test: tsx --test tests/inklings.test.ts

import { footwork, plantBy, plantOf } from './bosses3';
import type { BossShape, CheckLimb, CheckLump, Handover } from './boss_checks';
import type { ActorArt } from './actor_types';
import { hash } from './kit';
import { DROP, IK_BODY, IK_CANVAS, IK_REST, clamp01, inklingPainter, inklingStand, sm } from './inklings';
import { TILE3, mobSet } from './new_mobs3';
import type { Mob, MobMove, Moment } from './new_mobs3';
import { add, elbowFor, lerp3, mul, norm, sub } from './skeleton';
import type { Bones, Key3, Motion, Posed, Skeleton, V3 } from './skeleton';

type P = Partial<Bones>;
const B = IK_BODY;
const R = IK_REST;
const L0 = plantOf(B, 'L', {}, R);
const R0 = plantOf(B, 'R', {}, R);
const fr = (t: number): number => t - Math.floor(t);

function elbowsTo(pose: P, wantL: V3 | null, wantR: V3 | null): P {
  const q = { ...R, ...pose } as Posed;
  const le = wantL ? elbowFor(B, q, true, norm(wantL)) : q.le;
  const re = wantR ? elbowFor(B, { ...q, le } as Posed, false, norm(wantR)) : q.re;
  return { ...pose, le, re };
}
const glintOf = (t: number, a: number, b: number, c: number, d = 0.15): number => (t < a ? 0 : t < b ? sm((t - a) / (b - a)) : t < c ? 1 : t < c + d ? 1 - (t - c) / d : 0);

// =============================================================================================
// THE SCUTTLE: low and quick

export const IK_PACE = 1.3;
export const IK_WALK = { frames: 10, fps: 12 } as const;
function stepFoot(k: number, n: number, step: number, lift: number): [number, number, number] {
  const half = n / 2;
  if (k <= half) return [step * (half / 2 - k), 0, 0];
  const u = (k - half) / half;
  const g = u * u * (3 - 2 * u);
  return [-step * (half / 2) + step * half * g, lift * Math.sin(Math.PI * u), 10 * Math.sin(Math.PI * u) * (1 - u) - 4 * Math.sin(Math.PI * u) * u];
}
function inklingWalk(): Motion {
  const n = IK_WALK.frames;
  const d = (IK_PACE * TILE3) / IK_WALK.fps;
  const keys: Key3[] = [];
  for (let i = 0; i <= n; i++) {
    const j = i % n;
    const a = (j / n) * Math.PI * 2;
    const [lx, lz, lp] = stepFoot(j, n, d, 2.2);
    const [rx, rz, rp] = stepFoot((j + n / 2) % n, n, d, 2.2);
    const sag = Math.abs(Math.sin(a));
    keys.push({
      at: i / IK_WALK.fps,
      ease: 'lin',
      pose: {
        pz: R.pz - 0.8 * sag, py: 0.8 * Math.sin(a), roll: R.roll + 4 * Math.sin(a), yaw: 4 * Math.cos(a), side: 1.4 * Math.sin(a),
        bend: R.bend + 2 * sag, pitch: R.pitch + 6, faceUp: R.faceUp + 4,
        lfx: lx, lfz: lz, lfp: lp, lfy: R.lfy, lft: R.lft,
        rfx: rx, rfz: rz, rfp: rp, rfy: R.rfy, rft: R.rft,
        // (the long arms swinging against the legs)
        lhx: (R.lhx as number) - 4 * Math.sin(a), lhz: (R.lhz as number) + 1.6 * Math.max(0, -Math.sin(a)),
        rhx: (R.rhx as number) + 4 * Math.sin(a), rhz: (R.rhz as number) + 1.6 * Math.max(0, Math.sin(a)),
      },
    });
  }
  return { keys, loop: 0 };
}

// =============================================================================================
// THE INK LASH

/** Their blow: how long; the warning; the claws raking down across before them (a frame of the game's thirty a second). */
export const IK_LASH = { long: 1.3, warn: [0.22, 0.46], hit: 18 / 30 } as const;
const H = IK_LASH.hit;
/** Reared up tall, the arms flung wide and high, the claws spread, the head up. */
const REARED: P = elbowsTo({ px: -1.6, pz: -1.4, pitch: -6, bend: -8, side: 0, faceUp: 12, faceTilt: 0, lhIn: 1, lhx: 1, lhy: 13, lhz: 7, rhIn: 1, rhx: 1, rhy: -13, rhz: 7 }, [-0.2, 0.8, 0.4], [-0.2, -0.8, 0.4]);
const reared = (k: number): P => ({ ...REARED, lhz: (REARED.lhz as number) + (k % 2 ? 0.7 : -0.3), rhz: (REARED.rhz as number) + (k % 2 ? -0.3 : 0.7), roll: k % 2 ? 2 : -2 });
/** THE RAKE, frame by frame: hips first, then both claws brought down across before them, crossing. */
const RAKE: P[] = [
  { px: 0.6, pz: -2.4, pitch: 6, bend: 2, faceUp: 6, lhIn: 1, lhx: 5, lhy: 11, lhz: 6, rhIn: 1, rhx: 5, rhy: -11, rhz: 6 },
  { px: 2.6, pz: -4.0, pitch: 18, bend: 12, faceUp: 4, lhIn: 1, lhx: 10, lhy: 6, lhz: 0, rhIn: 1, rhx: 10, rhy: -6, rhz: 0 },
  { px: 4.6, pz: -5.6, pitch: 30, bend: 22, faceUp: 2, lhIn: 1, lhx: 13, lhy: 0, lhz: -8, rhIn: 1, rhx: 13, rhy: 0, rhz: -8 },
  { px: 5.6, pz: -6.6, pitch: 36, bend: 26, faceUp: 4, lhIn: 1, lhx: 13, lhy: -5, lhz: -14, rhIn: 1, rhx: 13, rhy: 5, rhz: -14 },
];
const rakeAt = (i: number): P => elbowsTo(RAKE[i], [0.2, 0.8, 0.2], [0.2, -0.8, 0.2]);
const RAKED: P = elbowsTo({ ...RAKE[3], px: 8.6, pz: -7.8, pitch: 41, lhx: 16, rhx: 16, lhy: -8, rhy: 8, lhz: -17, rhz: -17 }, [0.2, 0.8, 0.2], [0.2, -0.8, 0.2]);
function inklingLash(): Motion {
  const f = 1 / 30;
  return {
    hit: H,
    keys: [
      { at: 0, pose: {} },
      { at: IK_LASH.warn[0], pose: REARED, ease: 'io' },
      { at: 0.3, pose: reared(1), ease: 'io' },
      { at: 0.38, pose: reared(2), ease: 'io' },
      { at: IK_LASH.warn[1], pose: reared(3), ease: 'io' },
      { at: H - 3 * f, pose: rakeAt(0), ease: 'in' },
      { at: H - 2 * f, pose: rakeAt(1), ease: 'lin' },
      { at: H - f, pose: rakeAt(2), ease: 'lin' },
      { at: H, pose: rakeAt(3), ease: 'lin' },
      { at: H + 0.1, pose: RAKED, ease: 'out' },
      { at: 0.92, pose: elbowsTo({ ...RAKED, px: 3, pz: -6.4, pitch: 28 }, [0.2, 0.8, 0.2], [0.2, -0.8, 0.2]), ease: 'io' },
      { at: IK_LASH.long, pose: {}, ease: 'io' },
    ],
  };
}
function inklingLashFeet(): (t: number) => P {
  return footwork(B, {
    L: { start: L0, moves: [{ t0: H - 0.11, t1: H - 0.01, to: plantBy(L0, 6, 0.5, 2), lift: 2.2 }, { t0: 1.0, t1: 1.22, to: L0, lift: 1.8 }] },
    R: { start: R0, moves: [{ t0: H - 0.05, t1: H + 0.04, to: { ...R0, pitch: 14 } }, { t0: 1.02, t1: 1.2, to: R0 }] },
  });
}
const lashGlint = (t: number): number => glintOf(t, 0.08, IK_LASH.warn[0], H);
const lashOpen = (t: number): number => (t < 0.1 ? 0 : t < IK_LASH.warn[0] ? sm((t - 0.1) / 0.12) : t < 1.0 ? 1 : 1 - sm((t - 1.0) / 0.25));

// =============================================================================================
// MELT AND RISE

/** Sunk into its pool: as low as it goes, curled over its knees, the arms in the pool. */
const SUNK: P = elbowsTo({ px: 0.4, pz: -15.5, pitch: 40, bend: 30, faceUp: -10, lhIn: 1, lhx: 6, lhy: 3, lhz: -8, rhIn: 1, rhx: 6, rhy: -3, rhz: -8 }, [0, 0.9, 0.3], [0, -0.9, 0.3]);
/** Melt: how long; when it runs down into the pool. */
export const IK_MELT = { long: 0.9, run: [0.12, 0.8] } as const;
function inklingMelt(): Motion {
  return {
    keys: [
      { at: 0, pose: {} },
      { at: 0.25, pose: elbowsTo({ pz: R.pz - 3, pitch: 30, bend: 26, faceUp: 6, lhz: -18, rhz: -18 }, [-0.1, 0.9, -0.2], [-0.1, -0.9, -0.2]), ease: 'io' },
      { at: 0.7, pose: SUNK, ease: 'io' },
      { at: IK_MELT.long, pose: SUNK, ease: 'io' },
    ],
  };
}
/** Rise: how long; when it pulls itself up out of the pool. */
export const IK_RISE = { long: 1.1, up: [0.08, 0.82] } as const;
function inklingRise(): Motion {
  return {
    keys: [
      { at: 0, pose: SUNK },
      { at: 0.2, pose: SUNK, ease: 'io' },
      { at: 0.6, pose: elbowsTo({ pz: R.pz - 4, pitch: 34, bend: 28, faceUp: 14, faceTilt: 8, lhz: -14, rhz: -14 }, [-0.1, 0.9, -0.2], [-0.1, -0.9, -0.2]), ease: 'io' },
      { at: 0.86, pose: { pz: R.pz + 0.6, pitch: 18, bend: 18, faceUp: 22, faceTilt: -4 }, ease: 'io' },
      { at: IK_RISE.long, pose: {}, ease: 'io' },
    ],
  };
}

// =============================================================================================
// STRUCK AND THEIR DEATH

export const IK_REEL = 0.35;
function inklingReel(): Motion {
  return {
    keys: [
      { at: 0, pose: {} },
      { at: 0.06, pose: { px: -2.2, pz: R.pz + 0.8, pitch: 10, bend: 10, faceUp: R.faceUp + 20, faceTilt: 10, lhx: (R.lhx as number) - 3, rhx: (R.rhx as number) - 3, out: 0.1 }, ease: 'out' },
      { at: 0.16, pose: { px: -0.8, pitch: 22, bend: 20, faceUp: R.faceUp + 4 }, ease: 'io' },
      { at: IK_REEL, pose: {}, ease: 'io' },
    ],
  };
}
/** Their death: how long; the burst; slumping; running down into the pool; the pool drying to a stain. */
export const IK_DIES = { long: 1.8, burst: [0.04, 0.5], slump: 0.5, melt: [0.3, 1.0], dry: [1.1, 1.8] } as const;
function inklingDying(): Motion {
  return {
    keys: [
      { at: 0, pose: {} },
      { at: 0.06, pose: { px: -2.4, pz: R.pz + 1.4, pitch: 2, bend: 0, faceUp: 30, faceTilt: 10, lhz: (R.lhz as number) + 6, rhz: (R.rhz as number) + 6, out: 0.4 }, ease: 'out' },
      { at: IK_DIES.slump, pose: { ...SUNK, pz: (SUNK.pz as number) + 4, out: 1 }, ease: 'io' },
      { at: 1.0, pose: { ...SUNK, out: 1 }, ease: 'io' },
      { at: IK_DIES.long, pose: { ...SUNK, out: 1 }, ease: 'io' },
    ],
  };
}
/** INK FLUNG: drops thrown out from `from` over [t0, t1], as the claws rake or as it bursts. */
function inkFlung(out: [V3, string, number][], from: V3[], t: number, t0: number, t1: number, n: number, reach: number): void {
  if (t < t0 || t > t1) return;
  const k = (t - t0) / (t1 - t0);
  for (let i = 0; i < n; i++) {
    const o = from[i % from.length];
    const a = i * 2.39996;
    const r = reach * (0.3 + 0.7 * hash(i, 1, 8611)) * Math.sqrt(k);
    const up = 8 * hash(i, 2, 8611);
    const p: V3 = [o[0] + Math.cos(a) * r, o[1] + Math.sin(a) * r, o[2] + up * 4 * k * (1 - k) - o[2] * k * k];
    if (p[2] > 0.4) out.push([p, DROP, i % 3 === 0 ? 2 : 1]);
  }
}

// =============================================================================================
// WHAT EACH MOVE TELLS THEIR PAINTER

export const NAMES = { stand: 'An inkling crouches', walk: 'An inkling scuttles', attack: 'The ink lash', melt: 'An inkling melts', rise: 'An inkling rises', reel: 'An inkling is struck', dying: 'An inkling bursts' } as const;
const KEY_OF = new Map<string, string>(Object.entries(NAMES).map(([k, v]) => [v, k]));
const keyOf = (m: Moment): string => (m.dying ? 'dying' : KEY_OF.get(m.move ?? '') ?? '');

function inklingMob(): Mob {
  const paint = inklingPainter({
    form: (m) => {
      const k = keyOf(m);
      if (k === 'melt') return 1 - sm((m.t - IK_MELT.run[0]) / (IK_MELT.run[1] - IK_MELT.run[0]));
      if (k === 'rise') return sm((m.t - IK_RISE.up[0]) / (IK_RISE.up[1] - IK_RISE.up[0]));
      if (k === 'dying') return 1 - sm((m.t - IK_DIES.melt[0]) / (IK_DIES.melt[1] - IK_DIES.melt[0]));
      return 1;
    },
    pool: (m) => {
      const k = keyOf(m);
      if (k === 'melt') return 0.32 + 0.12 * sm(m.t / IK_MELT.long);
      if (k === 'rise') return 0.44 - 0.12 * sm((m.t - 0.4) / 0.6);
      if (k === 'dying') return 0.32 + 0.4 * sm((m.t - 0.1) / 1.2);
      return 0.32;
    },
    dried: (m) => (keyOf(m) === 'dying' ? 0.6 * sm((m.t - IK_DIES.dry[0]) / (IK_DIES.dry[1] - IK_DIES.dry[0])) : 0),
    open: (m) => (keyOf(m) === 'attack' ? lashOpen(m.t) : keyOf(m) === 'reel' ? 0.6 : 0.2),
    flare: (m) => (keyOf(m) === 'attack' ? clamp01(m.glint) : 0),
    grains: (m, out) => {
      const k = keyOf(m);
      if (k === 'attack') inkFlung(out, [m.s.handL, m.s.handR], m.t, H - 1 / 30, H + 0.25, 16, 12);
      if (k === 'dying') inkFlung(out, [m.s.ribs, m.s.head, m.s.pelvis], m.t, IK_DIES.burst[0], IK_DIES.burst[1], 30, 22);
      if (k === 'reel') inkFlung(out, [m.s.ribs], m.t, 0.02, 0.3, 8, 10);
    },
  });
  const mv = (name: string, motion: Motion, more: Partial<MobMove> = {}): MobMove => ({ name, motion, rest: R, ...more });
  return {
    id: 'inkling',
    name: 'An inkling',
    size: "small: crouched about the knight's chest",
    build: B,
    stand: mv(NAMES.stand, inklingStand()),
    attack: mv(NAMES.attack, inklingLash(), { feet: inklingLashFeet(), glint: lashGlint }),
    idleFrames: 28,
    idleFps: 10,
    walk: mv(NAMES.walk, inklingWalk(), { period: IK_WALK.frames / IK_WALK.fps, ground: IK_PACE * TILE3 }),
    walkFrames: IK_WALK.frames,
    walkFps: IK_WALK.fps,
    pace: IK_PACE,
    reel: mv(NAMES.reel, inklingReel()),
    reelTime: IK_REEL,
    hit: H,
    warn: IK_LASH.warn[1] - IK_LASH.warn[0],
    dieTime: IK_DIES.long,
    dying: mv(NAMES.dying, inklingDying()),
    more: {
      melt: mv(NAMES.melt, inklingMelt()),
      rise: mv(NAMES.rise, inklingRise()),
    },
    aura: { x: IK_CANVAS.ax, y: IK_CANVAS.ay - 26, r: 30, color: '#ff3a78', a: 0.06 },
    shadow: 0,
    canvas: IK_CANVAS,
    trueBack: true,
    bits: paint.bits,
    grains: paint.grains,
  };
}
export const INKLING = inklingMob();
export function makeInklingArt3(mob: Mob = INKLING, pace = mob.pace): ActorArt {
  return { front: mobSet(mob, 'front', pace), back: mobSet(mob, 'back', pace) };
}

// =============================================================================================
// THEM AS THE CHECKS SEE THEM (art/boss_checks.ts)

const len3 = (v: V3): number => Math.hypot(v[0], v[1], v[2]);
export function inklingSolids(s: Skeleton): { limbs: CheckLimb[]; lumps: CheckLump[] } {
  const [rH, rK, rA] = B.legR;
  const [r0, r1] = B.armR;
  const limbs: CheckLimb[] = [];
  for (const side of ['L', 'R'] as const) {
    const L = side === 'L';
    limbs.push(
      { name: `leg${side}`, a: L ? s.hipL : s.hipR, b: L ? s.kneeL : s.kneeR, r: rH * 1.0 },
      { name: `shin${side}`, a: L ? s.kneeL : s.kneeR, b: L ? s.ankleL : s.ankleR, r: Math.max(rK, rA) * 0.95 },
      { name: `foot${side}`, a: add(L ? s.heelL : s.heelR, [0, 0, 1.1]), b: add(L ? s.toeL : s.toeR, [0, 0, 1.1]), r: 1.2 },
      { name: `upper${side}`, a: L ? s.shoulderL : s.shoulderR, b: L ? s.elbowL : s.elbowR, r: r0 * 1.0 },
      { name: `fore${side}`, a: L ? s.elbowL : s.elbowR, b: L ? s.handL : s.handR, r: r1 * 0.9 },
    );
  }
  limbs.push({ name: 'neck', a: s.neck, b: lerp3(s.neck, s.head, 0.5), r: 2.1 });
  const waistC = add(s.pelvis, mul(s.hips[2], B.waist * 0.6));
  const lumps: CheckLump[] = [
    { name: 'head', c: s.head, rot: s.face, h: [B.headR[0] * 1.05, B.headR[1] * 1.1, B.headR[2] * 0.95] },
    { name: 'chest', c: lerp3(s.ribs, s.neck, 0.3), rot: s.chest, h: [B.ribDeep + 1.6, B.ribHalf + 1.2, len3(sub(s.neck, s.ribs)) * 0.55] },
    { name: 'belly', c: lerp3(waistC, s.ribs, 0.45), rot: s.belly, h: [B.waistDeep + 1.0, B.waistHalf + 1.0, Math.max(2.5, len3(sub(s.ribs, waistC)) * 0.6)] },
    { name: 'hips', c: add(s.pelvis, mul(s.hips[2], B.waist * 0.2)), rot: s.hips, h: [B.pelvisDeep + 1.0, B.pelvisHalf + 1.0, B.waist * 0.75] },
  ];
  return { limbs, lumps };
}
function inklingHandovers(mob: Mob): Handover[] {
  const out: Handover[] = [];
  for (const m of ['attack', 'reel', 'melt']) out.push({ from: 'stand', at: 0, to: m, toAt: 0 });
  for (const m of ['attack', 'reel', 'rise']) out.push({ from: m, at: 'end', to: 'stand', toAt: 0 });
  out.push({ from: 'stand', at: 0, to: 'dying', toAt: 0 }, { from: 'stand', at: 0, to: 'walk', toAt: 0 });
  const walkLong = mob.walkFrames / mob.walkFps;
  for (let i = 0; i <= mob.walkFrames; i++) out.push({ from: 'walk', at: (i / mob.walkFrames) * walkLong, to: 'stand', toAt: 0 });
  // (sunk into its pool, it rises where it sank, or where the game has slid the pool to)
  out.push({ from: 'melt', at: 'end', to: 'rise', toAt: 0 });
  return out;
}
export const IK_SHAPE: BossShape = {
  body: inklingSolids,
  // (what they strike with: the claws, as they rake)
  tip: (move, _t, s) => (move === 'attack' ? lerp3(s.handL, s.handR, 0.5) : null),
  handovers: inklingHandovers(INKLING),
};
void fr;
