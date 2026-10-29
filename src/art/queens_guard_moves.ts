// FLOOR 18'S QUEEN'S GUARD: THEIR MOVES (the art chat, 29 Oct 2026). A MOCK-UP: NOT IN THE GAME, behind QGUARD_ON
// (art/queens_guard.ts, off). Their look and the brief as offered are art/queens_guard.ts; what their blows leave on the
// floor, art/queens_guard_fx.ts.
//
// HIS PICK for how they move: “Measured, then a sudden charge (Recommended)”. And his rulebook's Movement 9 (24 Oct: “Like
// the wind up and wind down are big but the actual punch is lightning quick”; for the enemies, 28 Oct: “Start from now on,
// but every enemy is going to need that change eventually.  And bigger AOE to compensate for the extra time the player
// gets to evade”): each blow winds up big and is held (the warning), strikes in two frames smeared with its after-images,
// and winds down big; and its area is big. And his words of 28 Oct on speed and size (“It’s all too slow and too narrow
// and too small”; “Everything is always so plodding when you first animate them”): their march slow and heavy by his
// pick, their charge sudden and fast, their blows long, in tiles.
//
// THEIR MOVES:
//   STANDING: on guard, the round mirror shield up before the left of the chest, the halberd stood upright at the right
//     side, its axe to the front; breathing, the weight shifting, the helm turning slowly, the Hush leaking from the slit.
//   THE MARCH (his pick: measured): slow, heavy, deliberate steps (`QG_MARCH` tiles a second), each knee brought up, each
//     sabaton set down flat with the body sinking onto it; upright, the shield up, the halberd carried upright.
//   THE CHARGE (his pick: then sudden): all at once low behind the shield and running flat out (`QG_CHARGE` tiles a
//     second), long bounding strides, the cloak streaming, the halberd trailed at the right side.
//   THE HALBERD CHOP (their first blow): the halberd taken in both hands and heaved up high over the right shoulder, the
//     body leaning back, a step in, held there shaking, the axe glinting pink (THE WARNING); then hips first, in two
//     frames, chopped down over the top in a great arc, the axe biting the floor far before them (a long line of floor
//     splits and glass flies up all along it, art/queens_guard_fx.ts); held there bent over it, then heaved back up.
//   THE SHIELD CHARGE (their second blow): down into a crouch behind the shield, the right foot back, the left shoulder
//     forward, the halberd trailed low behind, held there shaking, the mirror glinting pink (THE WARNING); then hips first,
//     in two frames, a burst off the floor behind the shield, the game carrying them several tiles (`QG_BASH.carry`), the
//     shield punched out as it hits: the mirror flashes silver-white and a ring of light bursts out over the floor before
//     it; held, then up and on guard again where they came to.
//   STRUCK: jolted back, the helm snapped back, the cloak tossed, the Hush coughed out of the slit.
//   THEIR DEATH (the brief: the shield cracks like glass, to one knee, the Hush leaves them in a grey breath): the shield
//     cracks across like a mirror, glass falling from it; the halberd drops; down onto the right knee; there, head thrown
//     back, the Hush pours out of the slit in one great grey breath and the pink goes out of the eyes; the shield slides
//     off the arm; then the other knee gives and they sink down, sitting back on their heels, bowed over, still: people
//     again, alive.
//
// By his rulebook: every move through every check the bosses have (art/boss_checks.ts), from in front and behind, and the
// lightning strikes as his Movement 9 asks.
//   test: tsx --test tests/queens_guard.test.ts

import type { ActorArt } from './actor_types';
import type { BossShape, CheckLimb, CheckLump, CheckThing, Handover } from './boss_checks';
import { footwork, kneelHips, plantBy, plantOf } from './bosses3';
import type { FootTrack, Plant } from './bosses3';
import { hash } from './kit';
import { TILE3, mobSet } from './new_mobs3';
import type { Mob, MobMove, Moment } from './new_mobs3';
import { QG_BODY, QG_CANVAS, QG_EXHALE, QG_HALBERD, QG_HOLD, QG_SHIELD, halberdGrip, halberdOf, qguardPainter, shieldOf } from './queens_guard';
import type { QGuardSay } from './queens_guard';
import { about, add, heading, len, lerp3, mul, norm, solve, standing, sub } from './skeleton';
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
// A POSE AS THEIR MOVES ARE WRITTEN: the bones, and the halberd and the left hand said plainly
//   hx, hy, hz: the right fist on the halberd (forward of the pelvis, to its left, up from the floor);
//   hAz, hEl: the way the halberd points from its butt (its elevation may go past upright, over the top);
//   hRoll: its axe turned about the staff from facing the way it is swung (down and on, as it chops);
//   lOn: how far the left hand has gone from the shield's grip (its own place, lhx..) onto the staff, lAlong from the right fist;
//   rOn: how far the right fist is on the halberd (1), or let go of it and hanging free (0: rhx.. from its shoulder).

interface Halb {
  hx: number;
  hy: number;
  hz: number;
  hAz: number;
  hEl: number;
  hRoll: number;
  lOn: number;
  lAlong: number;
  rOn: number;
}
type K = P & Partial<Halb>;
const HALB_KEYS = ['hx', 'hy', 'hz', 'hAz', 'hEl', 'hRoll', 'lOn', 'lAlong', 'rOn'] as const;

/** The way the axe faces at a moment: square to the staff, the way an overhead chop sweeps it (down and on), turned `roll` about the staff. */
function axeWay(way: V3, az: number, el: number, roll: number): V3 {
  const perp: V3 = [Math.sin(el * D) * Math.cos(az * D), Math.sin(el * D) * Math.sin(az * D), -Math.cos(el * D)];
  return about(perp, way, roll);
}
/** A written pose as the bones' own fields: the halberd's grip worked out, and the left hand on the staff where it is. */
function bonesOf(k: K & Bones): Bones {
  const out: Record<string, number> = {};
  for (const [f, v] of Object.entries(k)) if (!(HALB_KEYS as readonly string[]).includes(f)) out[f] = v as number;
  const way = heading(k.hAz as number, k.hEl as number);
  const hand: V3 = [(k.hx as number) + k.px, (k.hy as number) + k.py, k.hz as number];
  Object.assign(out, halberdGrip(hand, way, axeWay(way, k.hAz as number, k.hEl as number, k.hRoll as number), k.draw));
  const rOn = clamp01(k.rOn ?? 1);
  if (rOn < 1 - 1e-4) {
    // (let go: the right hand from its own shoulder, along the figure's own ways, hanging)
    const freeR = solve(B, { ...(out as unknown as Bones), rhIn: 1, rhx: k.rhx, rhy: k.rhy, rhz: k.rhz } as Posed).handR;
    const Rh = lerp3(freeR, hand, rOn);
    Object.assign(out, { rhIn: 2, rhx: Rh[0], rhy: Rh[1], rhz: Rh[2] });
  }
  const on = clamp01(k.lOn ?? 0);
  if (on > 1e-4) {
    const free = solve(B, { ...(out as unknown as Bones), lhIn: k.lhIn } as Posed).handL;
    const staff = add(hand, mul(way, k.lAlong as number));
    const L = lerp3(free, staff, on);
    Object.assign(out, { lhIn: 2, lhx: L[0], lhy: L[1], lhz: L[2] });
  }
  return out as unknown as Bones;
}

// =============================================================================================
// THEIR REST: ON GUARD

const BASE = {
  ...standing(B),
  pz: -0.5, pitch: 1, bend: 2, roll: 0, side: 0, yaw: 0, twist: 0, faceUp: 3, faceTilt: 0, faceTurn: 0,
  lfx: 2.4, lfy: 1.2, lft: 14, lk: 8, lfp: 0, rfx: -2.0, rfy: -1.4, rft: -16, rk: -9, rfp: 0,
  // the left hand in the shield's grip, up before the left of the chest
  lhIn: 1, lhx: 9.5, lhy: -8.5, lhz: -11.5, le: -16,
  re: 0, pt: 0, out: 0, pAz: -28, pEl: 4,
} as Bones;
/** The halberd stood at the right side, the fist round it at `z`: the draw that rests its shoe on the floor. */
const plantedDraw = (z: number, el: number): number => ((z - 1.15) / Math.sin(el * D) - 7) / 48;
const H0: Halb = { hx: 5.2, hy: -13.6, hz: 44, hAz: 0, hEl: 87, hRoll: 0, lOn: 0, lAlong: -16, rOn: 1 };
export const QG_REST_K: K & Bones = { ...BASE, ...H0, draw: plantedDraw(H0.hz, H0.hEl) } as K & Bones;
export const QG_REST: Bones = bonesOf(QG_REST_K);
const R = QG_REST_K;
const L0: Plant = plantOf(B, 'L', {}, QG_REST);
const R0: Plant = plantOf(B, 'R', {}, QG_REST);

// =============================================================================================
// A MOVE THROUGH WRITTEN KEYS: every field through its keys smoothly, but straight through a lightning strike; one key a
// frame, at the frames the game shows

interface Plan {
  long: number;
  keys: ReadonlyArray<readonly [number, K]>;
  /** The strike: from the last frame of its wind-up to the frame it lands on. */
  strike?: readonly [number, number];
  hit?: number;
  /** Frames a second (30, but a loop's own). */
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
  return (t) => {
    const out: Record<string, number> = { lhIn: full[0][1].lhIn, rhIn: full[0][1].rhIn };
    if (st && a0 && a1 && t > st[0] && t < st[1]) {
      const k = (t - st[0]) / (st[1] - st[0]);
      for (const f of fields) out[f] = a0[f] + (a1[f] - a0[f]) * k;
    } else for (const f of fields) out[f] = (tracks.get(f) as Track)(t);
    return out as unknown as K & Bones;
  };
}
function motionOf(plan: Plan, extra?: (t: number, k: K & Bones) => K & Bones): Motion {
  const f = poseFn(plan);
  const fps = plan.fps ?? FPS;
  const keys: Key3[] = [];
  const n = Math.round(plan.long * fps);
  for (let i = 0; i <= n; i++) {
    const t = i / fps;
    const k = f(t);
    keys.push({ at: t, pose: bonesOf(extra ? extra(t, k) : k), ease: 'lin' });
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
      pz: R.pz + 0.9 * breath,
      py: 1.0 * Math.sin(a),
      roll: 1.6 * Math.sin(a),
      bend: R.bend - 2.0 * breath,
      pitch: R.pitch + 0.8 * Math.sin(a + 1.2),
      faceUp: R.faceUp + 2 * Math.sin(a + 0.4),
      faceTilt: 2 * Math.sin(a + 2.0),
      faceTurn: 9 * Math.sin(a + 0.8),
      lhx: R.lhx + 0.6 * Math.sin(a + 0.4),
      lhz: R.lhz + 0.5 * breath,
      pAz: R.pAz + 4 * Math.sin(a + 0.4),
    }]);
  }
  return { long: T, keys, fps: QG_STAND.fps, loop: true };
}

// =============================================================================================
// THE MARCH AND THE CHARGE (his pick: “Measured, then a sudden charge (Recommended)”): two loops of the same frames (the
// game shows a loop of either at the walk's frames a second), each painted for its own pace, its feet gripping the floor

/** Both loops: 24 frames at 20 a second (1.2 s round). */
export const QG_WALK = { frames: 24, fps: 20 } as const;
/** THE MARCH, tiles a second: slow and heavy, two long steps to the round (the knight walks 2.5). */
export const QG_MARCH = 1.0;
/** THE CHARGE, tiles a second: flat out, six bounding strides to the round. */
export const QG_CHARGE = 6.0;
interface Gait {
  /** Strides of each foot in a round; the share of each stride a foot is down; how high a foot is lifted; how far back it kicks up behind as it lifts. */
  strides: number;
  down: number;
  lift: number;
  kick: number;
  /** Feet turned out (degrees), and set apart. */
  turn: number;
  pace: number;
}
/**
 * A FOOT THROUGH A GAIT at `phase` (0 as it comes down): down, it goes straight back under the body at the floor's pace
 * (so on the floor it grips); lifted, it comes up and forward and is set down flat again. Its forward place (from the
 * standing ankle), its height and its tip (toes down).
 */
function gaitFoot(g: Gait, phase: number): [number, number, number] {
  const T = QG_WALK.frames / QG_WALK.fps / g.strides;
  const S = g.pace * TILE3 * g.down * T;
  const p = phase - Math.floor(phase);
  if (p <= g.down) return [S / 2 - (S * p) / g.down, 0, 0];
  const u = (p - g.down) / (1 - g.down);
  const e = u * u * (3 - 2 * u);
  // (up off the floor behind, kicked back and up, brought through, reaching, and set down flat: a stamp)
  const x = -S / 2 + S * e - g.kick * Math.sin(Math.PI * Math.min(1, u * 1.6)) * (1 - u);
  const z = g.lift * Math.pow(Math.sin(Math.PI * u), 0.7) + g.kick * 0.5 * Math.sin(Math.PI * Math.min(1, u * 1.4));
  const tip = 24 * Math.sin(Math.PI * Math.min(1, u * 1.3)) * (1 - u) - 6 * Math.sin(Math.PI * u) * u;
  return [x, z, tip];
}
const MARCH_G: Gait = { strides: 1, down: 0.56, lift: 6.5, kick: 2, turn: 0, pace: QG_MARCH };
const CHARGE_G: Gait = { strides: 3, down: 0.26, lift: 9, kick: 9, turn: 0, pace: QG_CHARGE };
function marchPlan(): Plan {
  const n = QG_WALK.frames;
  const keys: [number, K][] = [];
  for (let i = 0; i <= n; i++) {
    const t = i / QG_WALK.fps;
    const ph = i / n;
    const [lx, lz, lp] = gaitFoot(MARCH_G, ph);
    const [rx, rz, rp] = gaitFoot(MARCH_G, ph + 0.5);
    const a = ph * Math.PI * 2;
    // (each foot lands at a quarter of the round and three quarters: the body sinks onto it, then rises over it)
    const sink = Math.cos(a * 2 - 0.4);
    keys.push([t, {
      pz: R.pz - 1.6 + 1.1 * sink, py: 1.2 * Math.sin(a + 0.4), roll: 2.2 * Math.sin(a + 0.4), yaw: 3 * Math.cos(a), side: 0.8 * Math.sin(a),
      pitch: 3, bend: 2 + 0.8 * sink, faceUp: 4, faceTilt: 2 * Math.sin(a), faceTurn: -2 * Math.cos(a),
      lfx: R.lfx + lx, lfz: lz, lfp: lp, lfy: R.lfy, lft: R.lft,
      rfx: R.rfx + rx, rfz: rz, rfp: rp, rfy: R.rfy, rft: R.rft,
      lk: 10, rk: -10,
      // (the shield held up and steady, nodding with the step; the halberd carried upright, its shoe off the floor)
      lhx: R.lhx + 0.6 * Math.sin(a), lhz: R.lhz + 0.6 * sink, pAz: R.pAz,
      hx: 5.6 + 0.8 * Math.sin(a + Math.PI), hy: -13.6, hz: 45 + 0.6 * sink, hAz: 0, hEl: 86 + 1.5 * Math.sin(a + Math.PI), draw: 0.72,
    }]);
  }
  return { long: n / QG_WALK.fps, keys, fps: QG_WALK.fps, loop: true };
}
function chargePlan(): Plan {
  const n = QG_WALK.frames;
  const keys: [number, K][] = [];
  for (let i = 0; i <= n; i++) {
    const t = i / QG_WALK.fps;
    const ph = (i / n) * CHARGE_G.strides;
    const [lx, lz, lp] = gaitFoot(CHARGE_G, ph);
    const [rx, rz, rp] = gaitFoot(CHARGE_G, ph + 0.5);
    const a = ph * Math.PI * 2;
    // (the body lowest just after each foot comes down, highest in the flight between)
    const bob = Math.cos(a * 2 - 1.2);
    keys.push([t, {
      pz: -7.2 + 1.6 * bob, py: 0.6 * Math.sin(a), roll: 1.2 * Math.sin(a), yaw: -10 + 4 * Math.cos(a), twist: -8 - 3 * Math.cos(a),
      pitch: 17, bend: 10 + 1.2 * bob, side: 0, faceUp: 14, faceTilt: 0, faceTurn: 8,
      lfx: lx + 2, lfz: lz, lfp: lp, lfy: 2.0, lft: 6,
      rfx: rx + 2, rfz: rz, rfp: rp, rfy: -2.0, rft: -6,
      lk: 4, rk: -4,
      // (the shield before the face, square to the way they go; the halberd trailed at the right side, its head up behind)
      lhIn: 1, lhx: 15, lhy: -8.5, lhz: -5 + 0.5 * bob, le: 30, pAz: 0, pEl: 8,
      hx: 2 + 1.2 * Math.sin(a), hy: -14, hz: 33 + 1.0 * bob, hAz: -170, hEl: 48 + 3 * Math.sin(a), hRoll: 180, draw: 0.04,
    }]);
  }
  return { long: n / QG_WALK.fps, keys, fps: QG_WALK.fps, loop: true };
}

/** The charge's first frame (where the burst into it ends and the skid out of it begins), and the way its loop repeats: every 8 frames (0.4 s) the same. */
const CH0 = (): K & Bones => ({ ...R, ...chargePlan().keys[0][1] }) as K & Bones;
export const QG_CHARGE_EVERY = QG_WALK.frames / CHARGE_G.strides / QG_WALK.fps;
/**
 * INTO THE CHARGE, all at once (`chargeIn`, the game's to play between the march or the stand and the charge's loop): the
 * game carries them at the charge's full pace from its first frame (sudden: no run-up), while in a fifth of a second they
 * drop behind the shield, the right foot driving off the floor, the left flung out in a long first stride, the halberd
 * swung back over the shoulder; at its end the run takes over.
 * OUT OF IT (`chargeOut`, between the run and the stand or a blow): the game stops carrying them; the right foot is thrown
 * down before them and they skid on over it, slowing, and rise onto guard where they come to (`shift` on, figure lengths).
 */
export const QG_CHARGE_IN = { long: 0.2 } as const;
export const QG_CHARGE_OUT = { long: 0.4, shift: 24 } as const;
function chargeInPlan(): Plan {
  const c = CH0();
  const end: K = { ...c };
  const mid: K = { px: 1, pz: R.pz - 3.5, pitch: 9, bend: 6, yaw: -6, twist: -5, faceUp: 10, faceTurn: 5, lhIn: 1, lhx: 13, lhy: -8, lhz: -7, le: 10, pAz: -6, pEl: 6, hx: 3.5, hy: -14.2, hz: 40, hAz: -150, hEl: 62, hRoll: 170, draw: 0.1 };
  return { long: QG_CHARGE_IN.long, keys: [[0, {}], [0.1, mid], [QG_CHARGE_IN.long, end]] };
}
/** Its feet, each frame: the left lifted at once and flung out to where the run's first frame has it; the right pushing off, then up and through. */
function chargeInFeet(t: number, k: K & Bones): K & Bones {
  const c = CH0();
  const sh = 0;
  const T = QG_CHARGE_IN.long;
  const ground = QG_CHARGE * TILE3;
  const u = clamp01(t / T);
  const e = u * u * (3 - 2 * u);
  const push = 2 / FPS;
  const u2 = clamp01((t - push) / (T - push));
  const e2 = u2 * u2 * (3 - 2 * u2);
  return {
    ...k,
    lfx: R.lfx + (c.lfx + sh - R.lfx) * e, lfy: R.lfy + (c.lfy - R.lfy) * e, lfz: u <= 0 || u >= 1 ? (u >= 1 ? c.lfz : 0) : (c.lfz ?? 0) * e + 7 * Math.sin(Math.PI * u), lfp: (c.lfp ?? 0) * e + 10 * Math.sin(Math.PI * u), lft: R.lft + (c.lft - R.lft) * e,
    rfx: t <= push ? R.rfx - ground * t : R.rfx - ground * push + (c.rfx + sh - R.rfx + ground * push) * e2, rfy: R.rfy + (c.rfy - R.rfy) * e2, rfz: t <= push ? 0 : (c.rfz ?? 0) * e2 + 6 * Math.sin(Math.PI * u2), rfp: t <= push ? 0 : (c.rfp ?? 0) * e2 + 18 * Math.sin(Math.PI * u2), rft: R.rft + (c.rft - R.rft) * e2,
  } as K & Bones;
}
function chargeOutPlan(): Plan {
  const c = CH0();
  const P = QG_CHARGE_OUT.shift;
  return {
    long: QG_CHARGE_OUT.long,
    keys: [
      [0, c],
      // (carried on at the run's own speed a few frames, the right foot thrown down before them, the body leaning back against it, skidding on over it)
      [1 / FPS, { ...c, px: 6.2, pz: (c.pz as number) + 0.4, pitch: 12 }],
      [2 / FPS, { ...c, px: 12.6, pz: (c.pz as number) + 0.3, pitch: 9, bend: 7 }],
      [0.1, { px: 18.5, pz: R.pz - 6, pitch: 2, bend: 4, yaw: -8, twist: -6, roll: 0, side: 0, faceUp: 8, faceTurn: 6, lhIn: 1, lhx: 13, lhy: -8, lhz: -7, le: 20, pAz: -4, pEl: 6, hx: 2, hy: -13.8, hz: 34, hAz: -165, hEl: 56, hRoll: 180, draw: 0.04 }],
      [0.22, { px: 22.6, pz: R.pz - 4, pitch: -2, bend: 0, yaw: -4, twist: -2, faceUp: 4, faceTurn: 2, lhx: 11, lhy: -8.5, lhz: -10, le: 0, pAz: -18, hx: 4, hy: -14.4, hz: 43, hAz: -120, hEl: 78, hRoll: 120, draw: 0.14 }],
      [QG_CHARGE_OUT.long, { px: P }],
    ],
  };
}
/** Its feet, each frame: the left, just down, stays where it is until it steps up to stand; the right, in the air, thrown down before them and held. */
function chargeOutFeet(t: number, k: K & Bones): K & Bones {
  const c = CH0();
  const P = QG_CHARGE_OUT.shift;
  const land = 0.1;
  const u = clamp01(t / land);
  const e = u * u * (3 - 2 * u);
  const s0 = 0.24;
  const s1 = QG_CHARGE_OUT.long - 0.02;
  const v = clamp01((t - s0) / (s1 - s0));
  const ev = v * v * (3 - 2 * v);
  return {
    ...k,
    rfx: (c.rfx ?? 0) + (R.rfx + P - (c.rfx ?? 0)) * e, rfy: (c.rfy ?? 0) + (R.rfy - (c.rfy ?? 0)) * e, rfz: (c.rfz ?? 0) * (1 - e) + 3 * Math.sin(Math.PI * u) * (1 - u), rfp: (c.rfp ?? 0) * (1 - e), rft: (c.rft ?? 0) + (R.rft - (c.rft ?? 0)) * e,
    lfx: t <= s0 ? c.lfx : c.lfx + (R.lfx + P - c.lfx) * ev, lfy: (c.lfy ?? 0) + (R.lfy - (c.lfy ?? 0)) * ev, lfz: t <= s0 || t >= s1 ? 0 : 4 * Math.sin(Math.PI * v), lfp: 0, lft: (c.lft ?? 0) + (R.lft - (c.lft ?? 0)) * ev,
  } as K & Bones;
}

// =============================================================================================
// THE HALBERD CHOP (their first blow): heaved up over the right shoulder, held; chopped down over the top in two frames

/**
 * The chop's times (seconds; the strike from the last frame of its wind-up to the frame it lands on), and how far its
 * line reaches over the floor before them (tiles: the axe bites at `bite`, and the floor splits on along the line to `reach`,
 * `wide` across; art/queens_guard_fx.ts).
 */
export const QG_CHOP = { long: 2.0, warn: [0.52, 0.9] as const, strike: [27 / FPS, 29 / FPS] as const, hit: 29 / FPS, bite: 2.0, from: 1.2, reach: 6.5, wide: 1.6 };
/** The chop is struck one-handed, the right fist down by the butt for all its reach; the shield kept up before them. */
const CHOP_DRAW = 0.04;
/** Lifted off the floor in the right fist, tipping back over the shoulder, the grip sliding down to the butt; the shield brought up. */
const C_TAKE: K = { px: -0.8, pz: R.pz - 0.6, yaw: -7, twist: -4, pitch: 1, bend: 1, faceUp: 6, faceTurn: 6, hx: 3, hy: -13.5, hz: 54, hAz: 6, hEl: 104, hRoll: 0, draw: 0.32, lhx: 11, lhy: -7, lhz: -9, le: -18, pAz: -20, pEl: 6 };
/** Heaved up high over the right shoulder, the head of it far back and up; the body leaning back and wound round, a step in; the shield held out before them. */
const C_RAISED: K = { px: 1.6, pz: R.pz - 1.4, yaw: -18, twist: -10, pitch: -5, bend: -10, roll: -1, side: 1, faceUp: 12, faceTurn: 16, hx: -3, hy: -12, hz: 77, hAz: 10, hEl: 134, hRoll: 0, draw: CHOP_DRAW, lhx: 13, lhy: -5, lhz: -7, le: -24, pAz: -14, pEl: 10 };
const shakeC = (k: number): K => ({ ...C_RAISED, hz: (C_RAISED.hz as number) + (k % 2 ? 0.6 : -0.3), hx: (C_RAISED.hx as number) - 0.3 * (k % 2), hEl: (C_RAISED.hEl as number) + (k % 2 ? 0.9 : -0.4), pz: (C_RAISED.pz as number) - 0.15 * (k % 2) });
/** Hips first: the hips already coming round and forward, the chest and the halberd still back. */
const C_HIPS: K = { ...C_RAISED, yaw: -6, twist: -22, pitch: 0, bend: -11, px: 3.0 };
/** Struck: lunged in and bent over it, the arm flung out its length, the axe bitten into the floor far before them; the shield swung out to the left. */
const C_BITE: K = { px: 8, pz: R.pz - 8.5, yaw: 8, twist: 6, pitch: 16, bend: 20, roll: 1, side: 0, faceUp: 4, faceTurn: -4, hx: 19, hy: -8, hz: 31, hAz: 3, hEl: -15, hRoll: 0, draw: CHOP_DRAW, lhx: 6, lhy: 4, lhz: -12, le: -30, pAz: 20, pEl: 20 };
const C_ON: K = { ...C_BITE, px: 9.4, pz: R.pz - 9, pitch: 18, bend: 22, hx: 20.6, hz: 32.6, hEl: -14.6 };
const C_HEAVE: K = { px: 6, pz: R.pz - 4, yaw: 4, twist: 0, pitch: 8, bend: 8, faceUp: 4, faceTurn: 0, hx: 14, hy: -11, hz: 42, hAz: 6, hEl: 42, hRoll: 0, draw: 0.2, lhx: 10, lhy: -6, lhz: -10, le: -20, pAz: -16 };
const C_UP: K = { px: 2, pz: R.pz - 1, yaw: 0, twist: 0, pitch: 3, bend: 3, faceUp: 3, hx: 7, hy: -13, hz: 46, hAz: 0, hEl: 80, hRoll: 0, draw: 0.62, le: -16, pAz: R.pAz };
function chopPlan(): Plan {
  const [w0, w1] = QG_CHOP.warn;
  const [s0, s1] = QG_CHOP.strike;
  return {
    long: QG_CHOP.long,
    strike: QG_CHOP.strike,
    hit: QG_CHOP.hit,
    keys: [
      [0, {}],
      [0.18, C_TAKE],
      [0.36, { ...C_RAISED, px: 0.4, pz: R.pz - 0.8, hz: 70, hEl: 122, bend: -6, pitch: -3, yaw: -12, draw: 0.1 }],
      [w0, C_RAISED],
      [0.62, shakeC(1)],
      [0.72, shakeC(2)],
      [0.82, shakeC(3)],
      [w1 - 0.02, C_RAISED],
      [s0, C_HIPS],
      [s1, C_BITE],
      [1.08, C_ON],
      [1.36, { ...C_ON, pz: R.pz - 7.5, bend: 19, pitch: 15, hz: 33.4, hEl: -14 }],
      [1.56, C_HEAVE],
      [1.78, C_UP],
      [QG_CHOP.long, {}],
    ],
  };
}
function chopFeet(): (t: number) => P {
  return footwork(B, {
    L: { start: L0, moves: [{ t0: 0.2, t1: 0.42, to: plantBy(L0, 9, 0.6, 4), lift: 4.5 }, { t0: 1.6, t1: 1.86, to: L0, lift: 3 }] },
    R: { start: R0, moves: [{ t0: 0.08, t1: 0.26, to: plantBy(R0, -2.5, -0.8, -12), lift: 2.6 }, { t0: 0.84, t1: 0.92, to: plantBy(R0, -2.5, -0.8, 0, { pitch: 24 }) }, { t0: 1.5, t1: 1.76, to: R0, lift: 3 }] },
  });
}

// =============================================================================================
// THE SHIELD CHARGE (their second blow): crouched behind the shield, held; a burst in two frames, the game carrying them

/**
 * The shield charge's times; how far the game carries them through the strike (tiles: `carry`, in its two frames, the
 * after-images streaking all the way back), and on again as it ends (`end`: they have come that far on the floor, figure
 * lengths); the lane it hits along (`wide` tiles) and the ring of light that bursts from the shield as it lands (`ring` tiles
 * across, art/queens_guard_fx.ts).
 */
export const QG_BASH = { long: 1.85, warn: [0.34, 0.8] as const, strike: [24 / FPS, 26 / FPS] as const, hit: 26 / FPS, carry: 3.0, end: 18, wide: 1.6, ring: 3.2, flash: [26 / FPS, 26 / FPS + 0.3] as const };
const BE = QG_BASH.end;
const B_CROUCH: K = { px: -3, pz: R.pz - 8.5, yaw: -24, twist: -6, pitch: 13, bend: 11, roll: 0, side: 0, faceUp: 14, faceTurn: 22, lhIn: 1, lhx: 15.5, lhy: -10.5, lhz: -5, le: 34, pAz: -2, pEl: 6, hx: -2, hy: -13.5, hz: 31, hAz: -170, hEl: 44, hRoll: 180, draw: 0.04, lOn: 0 };
const shakeB = (k: number): K => ({ ...B_CROUCH, pz: (B_CROUCH.pz as number) + (k % 2 ? -0.35 : 0.2), lhx: (B_CROUCH.lhx as number) + (k % 2 ? 0.35 : -0.2), px: (B_CROUCH.px as number) - 0.25 * (k % 2) });
const B_HIPS: K = { ...B_CROUCH, yaw: -15, twist: -14, px: -1.2, pitch: 13 };
/** Landed: the shield punched out its arm's length, the body flung in behind it. */
const B_HIT: K = { px: 17, pz: R.pz - 6, yaw: -6, twist: -4, pitch: 18, bend: 8, roll: 0, side: 0, faceUp: 10, faceTurn: 6, lhIn: 1, lhx: 19.5, lhy: -5, lhz: -4, le: 26, pAz: 0, pEl: 4, hx: -5, hy: -13.5, hz: 32, hAz: -170, hEl: 40, hRoll: 180, draw: 0.04, lOn: 0 };
const B_ON: K = { ...B_HIT, px: 20, pz: R.pz - 6.6, pitch: 20, bend: 9, lhx: 20.5, hx: -6, hEl: 38 };
const B_RISE: K = { px: BE + 1, pz: R.pz - 2, yaw: -2, twist: 0, pitch: 6, bend: 4, faceUp: 6, faceTurn: 2, lhIn: 1, lhx: 12, lhy: -3, lhz: -11, le: 16, pAz: 20, pEl: 4, hx: 3, hy: -13.8, hz: 42, hAz: -150, hEl: 76, hRoll: 90, draw: 0.5, lOn: 0 };
function bashPlan(): Plan {
  const [w0, w1] = QG_BASH.warn;
  const [s0, s1] = QG_BASH.strike;
  const rest: K = { px: BE };
  return {
    long: QG_BASH.long,
    strike: QG_BASH.strike,
    hit: QG_BASH.hit,
    keys: [
      [0, {}],
      [0.07, { px: -0.4, pz: R.pz - 1, hx: 4.6, hy: -13.6, hz: 47, hAz: -10, hEl: 88, draw: 0.2 }],
      [0.14, { px: -1.2, pz: R.pz - 3, yaw: -10, pitch: 6, bend: 5, faceUp: 8, faceTurn: 10, lhx: 13, lhy: -5, lhz: -9, le: 22, pAz: 10, hx: 3, hy: -13.6, hz: 40, hAz: -160, hEl: 66, hRoll: 150, draw: 0.08 }],
      [w0, B_CROUCH],
      [0.45, shakeB(1)],
      [0.56, shakeB(2)],
      [0.67, shakeB(3)],
      [w1 - 0.04, B_CROUCH],
      [s0, B_HIPS],
      [s1, B_HIT],
      [0.96, B_ON],
      [1.22, { ...B_ON, px: 19.5, pz: R.pz - 5.2, pitch: 15, bend: 7 }],
      [1.5, B_RISE],
      [1.7, { ...R, ...rest, hx: R.hx, lhx: R.lhx, pz: R.pz - 0.6 }],
      [QG_BASH.long, rest],
    ],
  };
}
function bashFeet(): (t: number) => P {
  const [s0, s1] = QG_BASH.strike;
  return footwork(B, {
    L: { start: L0, moves: [{ t0: s0, t1: s1, to: plantBy(L0, 33, -1, -6), lift: 7 }, { t0: 1.56, t1: 1.78, to: plantBy(L0, BE, 0), lift: 3.2 }] },
    R: { start: R0, moves: [{ t0: 0.06, t1: 0.26, to: plantBy(R0, -9, -1.5, -14), lift: 3 }, { t0: s0, t1: 0.97, to: plantBy(R0, 3, -0.5, -10), lift: 8 }, { t0: 1.3, t1: 1.52, to: plantBy(R0, BE, 0), lift: 3.4 }] },
  });
}

// =============================================================================================
// STRUCK

export const QG_REEL = 0.4;
function reelPlan(): Plan {
  return {
    long: QG_REEL,
    keys: [
      [0, {}],
      [0.07, { px: -2.8, pz: R.pz + 0.5, pitch: -5, bend: -7, faceUp: R.faceUp + 18, faceTilt: 8, lhx: R.lhx - 1.5, lhz: R.lhz + 1.5, pAz: R.pAz + 14, out: 0.1 }],
      [0.2, { px: -1.2, pitch: 3, bend: 5, faceUp: R.faceUp + 4 }],
      [QG_REEL, {}],
    ],
  };
}

// =============================================================================================
// THEIR DEATH: the shield cracks like glass; to one knee; the Hush leaves them in a grey breath; then down

/** Its times (seconds): the shield cracking, the halberd dropping, down on one knee, the shield sliding off, the gasp, down on both and sat back, still. */
export const QG_DIES = { long: 3.4, crack: [0.06, 0.42] as const, drop: 0.36, knee: 1.0, shield: 1.12, gasp: 1.3, hold: [1.0, 2.0] as const, down: [2.0, 2.65] as const };
const TUCK = 56;
const KNEE_Z = B.legR[1] * 1.3;
/** On one knee: the right knee down, its foot back on its toes; the left foot planted flat before them, that knee up. */
const KNEEL_R: Plant = plantBy(R0, -13, 0.5, 0);
const KNEEL_L: Plant = plantBy(L0, 19, -0.5, 4);
/** Down on both, sat back on the heels: the left knee down beside the right, its foot back on its toes too. */
const DOWN_L: Plant = plantBy(L0, KNEEL_R.at[0] - L0.at[0], -0.5, 0);
const mirrorR = (p: Plant): Plant => ({ ...p, at: [p.at[0], -p.at[1]], turn: -p.turn });
function oneKnee(lean: number, body: K): K {
  const h = kneelHips(B, QG_REST, { L: mirrorR(KNEEL_R), R: KNEEL_R }, TUCK, KNEE_Z, lean);
  return { ...h, lk: 0, lkUp: 70, ...body };
}
const bothKnees = (lean: number, body: K): K => ({ ...kneelHips(B, QG_REST, { L: DOWN_L, R: KNEEL_R }, TUCK, KNEE_Z, lean), ...body });
const HANG = -(B.upperArm + B.foreArm) * 0.92;
/** The arms hanging (from the shoulders, along the figure's own ways: down whatever the body does), the left with the shield on it. */
const HANGING: K = { lhx: 2, lhy: 3, lhz: HANG + 2, le: -6, pAz: 80, pEl: -10, rhx: 2, rhy: -3, rhz: HANG + 2, re: 6, rOn: 0 };
function diesPlan(): Plan {
  const free = { hx: 6, hy: -13.6, hz: 44, hAz: 0, hEl: 87, hRoll: 0, draw: R.draw, lOn: 0 };
  const K1 = oneKnee(6, { yaw: 0, pitch: 3, roll: 1, twist: 0, bend: 8, side: 1, faceTurn: 0, faceUp: -8, faceTilt: 8, ...HANGING, ...free, out: 0.6 });
  const GASP = oneKnee(-6, { yaw: 0, pitch: -2, roll: 0, twist: 0, bend: -12, side: 0, faceTurn: 0, faceUp: 34, faceTilt: 0, ...HANGING, lhy: 9, ...free, out: 0.85 });
  const SAG = oneKnee(10, { yaw: 2, pitch: 6, roll: 3, twist: 0, bend: 16, side: 1, faceTurn: 4, faceUp: -18, faceTilt: 10, ...HANGING, ...free, out: 1 });
  const LAP: K = { lhx: 9, lhy: -3, lhz: -26, le: -10, pAz: 80, pEl: -10 };
  const DOWN = bothKnees(-38, { yaw: 3, pitch: 4, roll: 2, twist: 0, bend: 40, side: 1, faceTurn: 6, faceUp: -42, faceTilt: 10, ...HANGING, ...LAP, ...free, out: 1 });
  const DOWN2 = { ...DOWN, bend: 42, faceUp: -44, pz: (DOWN.pz as number) - 0.4 };
  return {
    long: QG_DIES.long,
    keys: [
      [0, {}],
      // the shield cracks: jolted back, the shield arm flung out
      [0.1, { px: -2.6, pz: R.pz + 0.4, pitch: -4, bend: -6, faceUp: R.faceUp + 16, lhx: R.lhx - 1, lhz: R.lhz + 2.5, pAz: R.pAz - 6, pEl: 12, out: 0.1 }],
      [QG_DIES.drop, { px: -2.0, pz: R.pz - 0.4, pitch: -1, bend: 2, faceUp: R.faceUp - 10, faceTilt: 6, lhx: R.lhx - 2, lhy: R.lhy + 1, lhz: R.lhz - 1, pAz: R.pAz - 4, pEl: 8, rOn: 1, out: 0.25 }],
      // the halberd drops (QG_DIES.drop): the arms fall to the sides
      [0.62, { px: -1.4, pz: R.pz - 1, pitch: 2, bend: 6, faceUp: -10, faceTilt: 6, ...HANGING, ...free, out: 0.4 }],
      // down onto the right knee, the left foot planted before them
      [0.84, { px: 0, pz: R.pz - 8, pitch: 4, bend: 8, faceUp: -10, lk: 20, rk: -24, ...HANGING, ...free, out: 0.5 }],
      [QG_DIES.knee, K1],
      // the gasp: head thrown back, the Hush pouring out of the slit
      [QG_DIES.gasp, GASP],
      [1.62, { ...GASP, faceUp: 30, bend: -10 }],
      [QG_DIES.hold[1], SAG],
      // then the other knee gives and they sink down, sat back on their heels, bowed over
      [2.3, bothKnees(-10, { yaw: 2, pitch: 6, roll: 2, twist: 0, bend: 28, side: 1, faceTurn: 4, faceUp: -30, faceTilt: 10, ...HANGING, ...free, out: 1 })],
      [QG_DIES.down[1], DOWN],
      [QG_DIES.long, DOWN2],
    ],
  };
}
function diesFeet(): (t: number) => P {
  return footwork(B, {
    L: { start: L0, moves: [{ t0: 0.66, t1: 0.94, to: KNEEL_L, lift: 3.2 }, { t0: 2.04, t1: 2.36, to: { ...DOWN_L, pitch: TUCK }, lift: 2.0 }] },
    R: { start: R0, moves: [{ t0: 0.62, t1: 0.9, to: { ...KNEEL_R, pitch: TUCK }, lift: 1.6 }] },
  });
}

// =============================================================================================
// THE SMEARS, THE FLASH, THE GLASS

export const QG_NAMES = {
  stand: 'The queen’s guard stands on guard',
  walk: 'The queen’s guard march',
  chargeIn: 'Into the charge',
  charge: 'The charge',
  chargeOut: 'Out of the charge',
  attack: 'The halberd chop',
  bash: 'The shield charge',
  reel: 'The queen’s guard are struck',
  dying: 'The shield cracks; to one knee; the Hush leaves them',
} as const;
const byName: Record<string, string> = Object.fromEntries(Object.entries(QG_NAMES).map(([k, v]) => [v, k]));
/** The strikes, by move: from the last frame of the wind-up to the frame it lands on. */
export const QG_STRIKES: Readonly<Record<string, readonly [number, number]>> = { attack: QG_CHOP.strike, bash: QG_BASH.strike };
/** Whether a frame of a move shows its strike's smear: from the frame after its wind-up ends to the frame after it lands (thinning then). */
export function smearedAt(move: string, t: number): boolean {
  const s = QG_STRIKES[move];
  return !!s && t > s[0] + 1e-6 && t <= s[1] + FR + 1e-6;
}
const PLANS: Record<string, Plan> = { attack: chopPlan(), bash: bashPlan(), reel: reelPlan(), dying: diesPlan() };
const POSES: Record<string, (t: number) => K & Bones> = Object.fromEntries(Object.entries(PLANS).map(([k, p]) => [k, poseFn(p)]));
const FEET: Record<string, (t: number) => P> = { attack: chopFeet(), bash: bashFeet() };
/** Their bones at a moment of one of their blows (with its footwork). */
function skelOf(move: string, t: number): Skeleton {
  const k = POSES[move](Math.max(0, Math.min(PLANS[move].long, t)));
  return solve(B, { ...bonesOf(k), ...(FEET[move]?.(t) ?? {}) } as Posed);
}
/** How far the game has carried them through the shield charge's strike (figure lengths, along their forward). */
export function bashCarried(t: number): number {
  const [s0, s1] = QG_BASH.strike;
  return QG_BASH.carry * TILE3 * clamp01((t - s0) / (s1 - s0));
}
/** THE SMEAR: after-images of what strikes, along the way it has come since its wind-up ended. */
function smearOf(move: string, t: number): V3[][] | null {
  if (!smearedAt(move, t)) return null;
  const [s0, s1] = QG_STRIKES[move];
  const to = Math.min(t, s1);
  const out: V3[][] = [];
  if (move === 'attack') {
    // (the halberd's after-images: its staff at each moment of its arc, a fan of them over the top; and the arcs its point,
    // its edge and its axe's horns swept)
    const n = 9;
    const arcs: V3[][] = [[], [], [], []];
    for (let i = 0; i <= n; i++) {
      const u = s0 - FR * 0.5 + ((to - (s0 - FR * 0.5)) * i) / n;
      const s = skelOf(move, u);
      const q = POSES[move](u);
      const h = halberdOf(s, q);
      if (i % 3 === 0) out.push([h.at(QG_HALBERD.long * 0.4), h.at(QG_HALBERD.long)]);
      arcs[0].push(h.tip);
      arcs[1].push(h.edge);
      arcs[2].push(add(h.at(QG_HALBERD.bladeLo), mul(h.across, QG_HALBERD.out * 0.9)));
      arcs[3].push(h.at(QG_HALBERD.long * 0.7));
    }
    out.unshift(arcs[3]);
    out.push(arcs[2], arcs[0], arcs[1]);
  } else {
    // (the shield charge: streaks back along the whole way the game has carried them, from the shield's rim, the crest
    // of the helm, the pauldrons and the knees; and the shield's own after-images)
    const back = bashCarried(to);
    const s = skelOf(move, to);
    const q = POSES[move](to);
    const sh = shieldOf(s, q);
    const pts: V3[] = [...sh.rim, lerp3(sh.c, sh.rim[2], 0.5), lerp3(sh.c, sh.rim[8], 0.5), add(s.head, [0, 0, 9]), add(s.head, [-2, 0, 15]), s.shoulderL, s.shoulderR, s.kneeL, s.kneeR, s.pelvis, s.ankleL, s.ankleR];
    for (let i = 0; i < pts.length; i++) {
      const p = pts[i];
      const len0 = back * (0.55 + 0.45 * hash(i, 1, 8151));
      out.push([add(p, [-len0, 0, 0]), add(p, [-len0 * 0.5, 0, 0]), add(p, [-3, 0, 0])]);
    }
    // (the newest of them, the shield's own after-image just behind it: its rim's outer edges, a step back)
    {
      const u = s0 + (to - s0) * 0.6;
      const shi = shieldOf(skelOf(move, u), POSES[move](u));
      const off = bashCarried(u) - back;
      out.push(shi.rim.slice(0, 7).map((p) => add(p, [off, 0, 0])));
    }
  }
  // (and after it has landed, thinned: the oldest gone)
  return t > s1 + 1e-6 ? out.slice(Math.floor(out.length / 2)) : out;
}
/** How hard the mirror flashes as it hits (the shield charge's), 0 to 1. */
function flashOf(move: string, t: number): number {
  if (move !== 'bash') return 0;
  const [f0, f1] = QG_BASH.flash;
  if (t < f0 - 1e-6 || t > f1) return 0;
  return 1 - smooth(f0, f1, t);
}
/** How far the shield has cracked as they die. */
function crackOf(m: Moment): number {
  return m.dying ? smooth(QG_DIES.crack[0], QG_DIES.crack[1], m.t) : 0;
}
/** WHAT IS LAID AFTER THEIR EDGE IN THEIR MOVES: the flash bursting from the mirror as it hits; the glass falling from it as it cracks. */
function moreOf(move: string, m: Moment): [V3, string, number][] {
  const out: [V3, string, number][] = [];
  const t = m.t;
  if (move === 'bash') {
    const [f0, f1] = QG_BASH.flash;
    if (t >= f0 - 1e-6 && t <= f1) {
      // THE FLASH: a star of silver-white light thrown out from the mirror's face, and sparks of glass
      const k = (t - f0) / (f1 - f0);
      const sh = shieldOf(m.s, m.q);
      const across = sh.across;
      const up = sh.up;
      for (let i = 0; i < 16; i++) {
        const a = (i / 16) * Math.PI * 2 + 0.2;
        const ray = i % 2 === 0 ? 1 : 0.55;
        const r0 = 3 + 30 * ray * Math.sqrt(k);
        for (let j = 0; j < 4; j++) {
          const r = r0 * (0.55 + 0.15 * j);
          if (hash(i, j + Math.floor(t * 30), 8161) < k * 0.9) continue;
          const p = add(add(sh.c, mul(sh.n, 3 + 6 * k)), add(mul(across, Math.cos(a) * r), mul(up, Math.sin(a) * r)));
          out.push([p, k < 0.35 ? '#ffffff' : j % 2 ? '#e6e2fa' : '#b8b2d8', k < 0.4 && j < 2 ? 2 : 1]);
        }
      }
    }
  }
  if (move === 'dying' && t >= QG_DIES.crack[0]) {
    // THE GLASS FALLING FROM IT: shards of mirror flung off the shield as it cracks, falling, and lying where they land
    const s0 = skelOf('dying', QG_DIES.crack[0] + 0.04);
    const sh = shieldOf(s0, POSES.dying(QG_DIES.crack[0] + 0.04));
    for (let i = 0; i < 22; i++) {
      const born = QG_DIES.crack[0] + 0.32 * hash(i, 1, 8171);
      const age = t - born;
      if (age < 0) continue;
      const a = hash(i, 2, 8171) * Math.PI * 2;
      const r = QG_SHIELD.r * Math.sqrt(hash(i, 3, 8171)) * 0.9;
      const p0 = add(sh.c, add(mul(sh.across, Math.cos(a) * r), mul(sh.up, Math.sin(a) * r)));
      const v: V3 = add(mul(sh.n, 26 + 30 * hash(i, 4, 8171)), [10 * (hash(i, 5, 8171) - 0.5), 18 * (hash(i, 6, 8171) - 0.5), 30 + 30 * hash(i, 7, 8171)]);
      const land = (v[2] + Math.sqrt(v[2] * v[2] + 2 * 400 * Math.max(0.1, p0[2]))) / 400;
      const tt = Math.min(age, land);
      const p: V3 = [p0[0] + v[0] * tt, p0[1] + v[1] * tt, Math.max(0.4, p0[2] + v[2] * tt - 200 * tt * tt)];
      const lit = (Math.floor(t * 12) + i) % 4 === 0;
      out.push([p, lit ? '#f4f2ff' : i % 3 === 0 ? '#bcb8dc' : '#8a86ae', age < land ? 2 : 1]);
    }
  }
  return out;
}
const SAY: QGuardSay = {
  dropped: (m) => !!m.dying && m.t >= QG_DIES.drop,
  cracked: crackOf,
  smear: (m) => smearOf(byName[m.move ?? ''] ?? '', m.t),
  more: (m) => moreOf(byName[m.move ?? ''] ?? '', m),
  flash: (m) => flashOf(byName[m.move ?? ''] ?? '', m.t),
  glintOn: (m) => (byName[m.move ?? ''] === 'bash' ? 'shield' : 'halberd'),
};

// =============================================================================================
// THEM, AS THE GAME HOLDS A MONSTER

/** The way the shield's face looks as it slides off the arm: turned to the sky as it lies (cracked, its mirror up). */
const SHIELD_UP: V3 = shieldOf(skelOf('dying', QG_DIES.shield), POSES.dying(QG_DIES.shield)).n;
function qguardMob(): Mob {
  const paint = qguardPainter(SAY);
  const mv = (name: string, motion: Motion, more: Partial<MobMove> = {}): MobMove => ({ name, motion, rest: QG_REST, ...more });
  const glow = (warn: readonly [number, number]) => (t: number): number => (t >= warn[0] - 0.12 && t <= warn[1] ? (t < warn[0] ? (t - warn[0] + 0.12) / 0.12 : 1) : 0);
  return {
    id: 'queens-guard',
    name: 'A Hushed queen’s guard',
    size: 'medium: a head taller than the knight',
    build: B,
    stand: mv(QG_NAMES.stand, motionOf(standPlan())),
    attack: mv(QG_NAMES.attack, motionOf(PLANS.attack), { feet: FEET.attack, glint: glow(QG_CHOP.warn) }),
    more: {
      chargeIn: mv(QG_NAMES.chargeIn, motionOf(chargeInPlan(), chargeInFeet), { ground: QG_CHARGE * TILE3 }),
      charge: mv(QG_NAMES.charge, motionOf(chargePlan()), { period: QG_WALK.frames / QG_WALK.fps / CHARGE_G.strides, ground: QG_CHARGE * TILE3 }),
      chargeOut: mv(QG_NAMES.chargeOut, motionOf(chargeOutPlan(), chargeOutFeet)),
      bash: mv(QG_NAMES.bash, motionOf(PLANS.bash), { feet: FEET.bash, glint: glow(QG_BASH.warn) }),
    },
    idleFrames: QG_STAND.frames,
    idleFps: QG_STAND.fps,
    walk: mv(QG_NAMES.walk, motionOf(marchPlan()), { period: QG_WALK.frames / QG_WALK.fps, ground: QG_MARCH * TILE3 }),
    walkFrames: QG_WALK.frames,
    walkFps: QG_WALK.fps,
    pace: QG_MARCH,
    reel: mv(QG_NAMES.reel, motionOf(PLANS.reel)),
    reelTime: QG_REEL,
    hit: QG_CHOP.hit,
    warn: QG_CHOP.warn[1] - QG_CHOP.warn[0],
    dieTime: QG_DIES.long,
    dying: mv(QG_NAMES.dying, motionOf(PLANS.dying), { feet: diesFeet() }),
    aura: { x: QG_CANVAS.ax, y: QG_CANVAS.ay - 48, r: 42, color: '#9890b4', a: 0.06 },
    shadow: 14,
    canvas: QG_CANVAS,
    trueBack: true,
    bits: paint.bits,
    grains: paint.grains,
    // (the halberd drops from the hand and falls clear to their right; the cracked shield slides off the arm to their left)
    fall(piece) {
      if (piece === 'halberd') return { from: QG_DIES.drop, to: [-6, -54], spin: -30, lay: 'axis', hop: 1.4 };
      if (piece === 'shield') return { from: QG_DIES.shield, to: [2, 33], spin: 20, lay: 'flat', up: SHIELD_UP, hop: 1.0 };
      return null;
    },
  };
}
export const QUEENS_GUARD = qguardMob();
export function makeQGuardArt3(mob: Mob = QUEENS_GUARD): ActorArt {
  return { front: mobSet(mob, 'front', mob.pace), back: mobSet(mob, 'back', mob.pace) };
}

// =============================================================================================
// THEM AS THE CHECKS SEE THEM (art/boss_checks.ts)

const len3 = (v: V3): number => Math.hypot(v[0], v[1], v[2]);
export function qguardSolids(s: Skeleton): { limbs: CheckLimb[]; lumps: CheckLump[] } {
  const [rH, rK, rA] = B.legR;
  const [r0, r1] = B.armR;
  const limbs: CheckLimb[] = [];
  for (const side of ['L', 'R'] as const) {
    const L = side === 'L';
    limbs.push(
      { name: `leg${side}`, a: L ? s.hipL : s.hipR, b: L ? s.kneeL : s.kneeR, r: rH * 1.12 },
      { name: `shin${side}`, a: L ? s.kneeL : s.kneeR, b: L ? s.ankleL : s.ankleR, r: Math.max(rK, rA) * 1.25 },
      { name: `foot${side}`, a: add(L ? s.heelL : s.heelR, [0, 0, 1.8]), b: add(L ? s.toeL : s.toeR, [0, 0, 1.8]), r: 2.1 },
      { name: `upper${side}`, a: L ? s.shoulderL : s.shoulderR, b: L ? s.elbowL : s.elbowR, r: r0 * 1.2 },
      { name: `fore${side}`, a: L ? s.elbowL : s.elbowR, b: L ? s.handL : s.handR, r: r1 * 1.18 },
    );
  }
  limbs.push({ name: 'neck', a: s.neck, b: lerp3(s.neck, s.head, 0.5), r: 3.0 });
  const waistC = add(s.pelvis, mul(s.hips[2], B.waist * 0.5));
  const lumps: CheckLump[] = [
    { name: 'head', c: add(s.head, mul(s.face[2], 0.2)), rot: s.face, h: [B.headR[0] * 1.1, B.headR[1] * 1.12, B.headR[2] * 1.08] },
    { name: 'chest', c: lerp3(s.ribs, s.neck, 0.3), rot: s.chest, h: [B.ribDeep + 3.1, B.ribHalf + 2.6, len3(sub(s.neck, s.ribs)) * 0.55] },
    { name: 'belly', c: lerp3(waistC, s.ribs, 0.45), rot: s.belly, h: [B.waistDeep + 3.0, B.waistHalf + 2.6, Math.max(3, len3(sub(s.ribs, waistC)) * 0.6)] },
    { name: 'hips', c: add(s.pelvis, mul(s.hips[2], B.waist * 0.2)), rot: s.hips, h: [B.pelvisDeep + 2.6, B.pelvisHalf + 2.4, B.waist * 0.75] },
  ];
  return { limbs, lumps };
}
function halberdThings(s: Skeleton, q: Posed): CheckThing[] {
  const h = halberdOf(s, q);
  const staff: V3[] = [];
  for (let k = 0; k <= QG_HALBERD.long; k += 4) staff.push(h.at(k));
  const onIt = (hand: V3): boolean => {
    const ab = sub(h.tip, h.butt);
    const k = Math.max(0, Math.min(1, ((hand[0] - h.butt[0]) * ab[0] + (hand[1] - h.butt[1]) * ab[1] + (hand[2] - h.butt[2]) * ab[2]) / Math.max(1e-6, ab[0] * ab[0] + ab[1] * ab[1] + ab[2] * ab[2])));
    return len(sub(hand, add(h.butt, mul(ab, k)))) < 1.2 + B.armR[2] * 1.2 + 2.5;
  };
  const may = [...(onIt(s.handL) ? ['foreL'] : []), 'foreR'];
  const H = QG_HALBERD;
  const axe: V3[] = [h.at(H.bladeLo), h.at(H.bladeHi), h.edge, add(h.at(H.bladeLo - 1), mul(h.across, H.out * 0.9)), add(h.at(H.bladeHi + 1), mul(h.across, H.out * 0.9)), add(h.at(H.fluke - 3.4), mul(h.across, -8.2))];
  return [
    { name: 'halberd', pts: staff, r: 1.1, may },
    { name: 'halberd axe', pts: axe, r: 1.2, may },
  ];
}
function shieldThings(s: Skeleton, q: Posed): CheckThing[] {
  const sh = shieldOf(s, q);
  return [{ name: 'shield', pts: [sh.c, ...sh.rim], r: 1.0, may: ['foreL', 'upperL'] }];
}
export const QG_SHAPE: BossShape = {
  body: qguardSolids,
  tip: (move, t, s, q) => {
    if (move === 'dying' && t >= QG_DIES.drop) return null;
    if (move === 'bash' || move === 'charge') return shieldOf(s, q).c;
    return halberdOf(s, q).edge;
  },
  things: (move, t, s, q) => {
    const out: CheckThing[] = [];
    if (!(move === 'dying' && t >= QG_DIES.drop)) out.push(...halberdThings(s, q));
    if (!(move === 'dying' && t >= QG_DIES.shield)) out.push(...shieldThings(s, q));
    return out;
  },
  strikes: QG_STRIKES,
  smeared: smearedAt,
  handovers: [
    // his stand into each move and back (the shield charge ends where it has driven to)
    ...['attack', 'bash', 'reel'].flatMap((m): Handover[] => [{ from: 'stand', at: 0, to: m, toAt: 0 }, { from: m, at: 'end', to: 'stand', toAt: 0, ...(m === 'bash' ? { shift: [QG_BASH.end, 0] as const } : {}) }]),
    { from: 'stand', at: 0, to: 'dying', toAt: 0 },
    // into his march and out of it at any step
    { from: 'stand', at: 0, to: 'walk', toAt: 0 },
    ...Array.from({ length: QG_WALK.frames + 1 }, (_, i): Handover => ({ from: 'walk', at: i / QG_WALK.fps, to: 'stand', toAt: 0 })),
    // MEASURED, THEN A SUDDEN CHARGE: from his stand or any step of his march into the charge; into its loop; out of it at
    // any of its strides' starts; and from the skid into his stand or either blow
    { from: 'stand', at: 0, to: 'chargeIn', toAt: 0 },
    ...Array.from({ length: QG_WALK.frames + 1 }, (_, i): Handover => ({ from: 'walk', at: i / QG_WALK.fps, to: 'chargeIn', toAt: 0 })),
    { from: 'chargeIn', at: 'end', to: 'charge', toAt: 0 },
    ...[0, 1, 2].map((k): Handover => ({ from: 'charge', at: k * QG_CHARGE_EVERY, to: 'chargeOut', toAt: 0 })),
    ...['stand', 'attack', 'bash'].map((m): Handover => ({ from: 'chargeOut', at: 'end', to: m, toAt: 0, shift: [QG_CHARGE_OUT.shift, 0] })),
  ],
};
void QG_EXHALE;
void QG_HOLD;
