// FLOOR 18'S QUEEN'S GUARD: THE MIRROR DUELLISTS (the art chat, 30 Oct 2026). A MOCK-UP: NOT IN THE GAME. Nothing of the
// game imports this file; `QGUARD_ON` is off. Their moves are art/queens_guard_moves.ts; what their blows leave on the floor,
// art/queens_guard_fx.ts.
//
// His doc's floor 18, THE GLASS GALLERY: the queen's wing, long galleries of mirrors and a great glasshouse on the roof; its
// palette silver, cold blue glass and dark violet; from the Grimms' "Snow White" (1812), drawn only from the book. The
// floor's plan, his yes: “Enemies: ladies-in-waiting, the queen's guard, and your own reflections”.
//
// HIS PICK, 30 Oct (asked how the queen's guard should change so it is nothing like the king's knights): “Mirror duellists
// (Recommended)”, offered as: "Look: tall and thin, elegant; mirrored plate like liquid silver, a faceless polished helm
// (you see yourself in it), violet cape. No shield, no halberd: a long glass blade in each hand. Move: they don't charge.
// They step into a mirror and step out of another beside you (the Queen's trick, smaller). Attacks: a fast double slash
// with the glass blades; a thrown fan of glass shards (ranged). Death: they shatter like a mirror. Silhouette: the tallest,
// thinnest guard of Act 2." It replaces the first design (the halberdiers with the round mirror shields, his yes of 29 Oct).
//
// WHO THEY ARE: the queen's own duellists, their words stolen. Each a head and a half taller than the knight and slim, long
// in the leg and the arm, in close-fitting MIRRORED PLATE that shows the gallery round it like liquid silver (cool silver,
// its lights lavender: the plate reflects, by where the eye stands, the glasshouse's light, the vault, the bright line of the
// far windows and the dark floor): a slim breastplate, a narrow waist and fauld, long tassets, small pauldrons, couters and
// poleyns, greaves, pointed sabatons, gauntlets. A FACELESS HELM, a smooth egg of mirror with a faint sheen across it, the
// Hush's dull pink deep behind it, the Hush seeping out under its rim. A VIOLET CAPE from the shoulders to the ankles,
// clasped at the pauldrons. In each hand A LONG GLASS BLADE, lavender and cold blue (hue 230 to 250), on a silver hilt.
// Nothing cyan anywhere (no hue between 160 and 205).

import { HUSH } from './crier';
import { BREATH_PALE, hushBreath, hushLeaves, lagOf } from './hushed';
import { hash } from './kit';
import type { Ramp } from './kit';
import { FLAME } from './mkit';
import { sphere } from './new_mobs3';
import type { Bit, MobCanvas, Moment, Put, Shape } from './new_mobs3';
import { wornOn } from './skin';
import type { Ring, Stage } from './skin';
import { add, buildOf, cross, dot, heading, lerp3, mul, norm, sub } from './skeleton';
import type { Bones, Build, Skeleton, V3 } from './skeleton';

/** THE SWITCH, OFF. Nothing of the game reads this file. */
export const QGUARD_ON = { on: false };

const fr = (t: number): number => t - Math.floor(t);
const clamp01 = (v: number): number => Math.max(0, Math.min(1, v));
const len3 = (v: V3): number => Math.hypot(v[0], v[1], v[2]);

// =============================================================================================
// THEIR COLOURS: mirrored silver with lavender lights; a violet cape; lavender and cold blue glass

/** The plate's own ramp (where it is drawn as a limb): liquid silver, deep darks and bright lavender lights. */
export const SILVER: Ramp = ['#1a182c', '#2c2a48', '#6a6894', '#b2b0d8', '#f4f2ff'];
/** An upright limb's plate, lit a step brighter (the light from above barely reaches a rod that stands upright). */
const SILVER_UP: Ramp = [SILVER[1], SILVER[2], SILVER[2], SILVER[3], SILVER[4]];
/** Its edges, a step brighter. */
const EDGE: Ramp = ['#2a2842', '#3e3c5e', '#9896c2', '#d4d2ee', '#ffffff'];
/** THE MIRROR: what the plate shows of the gallery by the way it reflects, darkest to brightest (the dark floor, the walls, the vault, the glasshouse's light). */
export const MIRROR: readonly string[] = ['#161428', '#2a2846', '#47456e', '#7a78a6', '#b0aed6', '#dcdaf4', '#ffffff'];
/** The cape: a dark royal violet. */
export const VIOLET: Ramp = ['#170d24', '#1d1130', '#3f2763', '#5a3a82', '#73509c'];
/** Under the plate, at the joints. */
const ARMING: Ramp = ['#130b1c', '#130b1c', '#2a1c3c', '#3d2a54', '#3d2a54'];
/** THE GLASS of the blades and the shards: lavender and cold blue (hue 230 to 250: never the friend's cyan). */
export const GLASS: Ramp = ['#1d1b45', '#2c2c6c', '#6670d2', '#a9b1f6', '#f0f1ff'];
/** The mirror-ripple they step through: a dark glass, its lights lavender. */
export const RIPPLE: Ramp = ['#1c1a38', '#353468', '#6266aa', '#a2a6e6', '#eceeff'];
/** The cracks that race over them as they die: a dark split with a bright lip. */
export const CRACK = { split: '#120e1c', lit: '#f1eefc' } as const;
/** The glasshouse's light over the gallery, and the slant of a line of its windows that the mirror catches. */
const SUN: V3 = norm([-0.35, 0.55, 1]);
const SHEEN: V3 = norm([0.5, -0.62, 0.3]);

// =============================================================================================
// THE BODY: a head and a half taller than the knight (58, his helm's top at 59.7), slim, long in the leg and the arm

export const QG_BODY: Build = buildOf(72, 0.95, { shoulders: 0.95, chest: 0.84, depth: 0.86, waist: 0.72, hips: 0.86, legs: 1.08, arms: 1.1, trunk: 1.0, limbs: 0.78 });
const GB = QG_BODY;
/** Their picture: room for the blades raised high behind them and flung out wide, the mirror-ripple at their side, and the shards as they shatter. */
export const QG_CANVAS: MobCanvas = { w: 250, h: 236, ax: 104, ay: 154 };

// =============================================================================================
// THE GLASS BLADES

/** A blade: its length from the guard to the point, its half-width at the guard, the grip's length behind the guard, the guard's half-span. */
export const QG_BLADE = { long: 46, wide: 1.9, grip: 5.6, guard: 4.2 } as const;
/** A blade at a moment: where the fist holds it, the way it points, the way its edges stand, a place this far along it from the guard, the guard, its point. */
export interface QGBlade {
  fist: V3;
  way: V3;
  across: V3;
  guard: V3;
  tip: V3;
  at: (k: number) => V3;
}
function bladeFrom(fist: V3, way: V3, across0: V3): QGBlade {
  const w = norm(way, [1, 0, 0]);
  const across = norm(sub(across0, mul(w, dot(across0, w))), norm(cross(w, [0, 0, 1]), [0, 1, 0]));
  const guard = add(fist, mul(w, 2.4));
  const at = (k: number): V3 => add(guard, mul(w, k));
  return { fist, way: w, across, guard, tip: at(QG_BLADE.long), at };
}
/** The right blade: in the right fist, pointing as the bones' weapon points. */
export function bladeR(s: Skeleton): QGBlade {
  return bladeFrom(s.handR, s.point, s.across);
}
/** The left blade: in the left fist, pointing `pAz`, `pEl` of the pose; its edges square to the forearm as near as that allows. */
export function bladeL(s: Skeleton, q: { pAz: number; pEl: number }): QGBlade {
  const way = heading(q.pAz, q.pEl);
  const fore = norm(sub(s.handL, s.elbowL), [1, 0, 0]);
  let ac = cross(way, fore);
  if (len3(ac) < 0.2) ac = cross(way, [0, 0, 1]);
  return bladeFrom(s.handL, way, norm(ac, [0, 1, 0]));
}
/** The right blade in the right fist at `hand` (from their place on the floor), pointing `way`, its edges along `across`: the bones' fields. */
export function bladeGrip(hand: V3, way: V3, across: V3): Partial<Bones> {
  const w = norm(way);
  const deg = 180 / Math.PI;
  const wAz = Math.atan2(w[1], w[0]) * deg;
  const wEl = Math.asin(Math.max(-1, Math.min(1, w[2]))) * deg;
  let flat = sub([0, 0, 1], mul(w, w[2]));
  if (Math.hypot(...flat) < 1e-3) flat = [-1, 0, 0];
  flat = norm(flat);
  const ac = norm(sub(across, mul(w, dot(across, w))), flat);
  const wRoll = Math.atan2(dot(cross(flat, ac), w), dot(flat, ac)) * deg;
  return { rhIn: 2, rhx: hand[0], rhy: hand[1], rhz: hand[2], wAz, wEl, wRoll, draw: 0 };
}
/**
 * A GLASS BLADE: a silver grip and pommel behind the fist, a slim silver guard; the blade long and tapering to its point,
 * double-edged, its edges ground bright, a darker fuller down its middle, a sheen running across the glass; a pink glint
 * along its edges in the warning.
 */
function blade(put: Put, part: string, b: QGBlade, glint: number, t: number, seed: number): void {
  const B = QG_BLADE;
  put(part, 'hilt', { k: 'rod', a: add(b.fist, mul(b.way, -B.grip + 2.4)), b: b.guard, ra: 0.75, rb: 0.75, ramp: SILVER });
  put(part, 'hilt', { k: 'ball', c: add(b.fist, mul(b.way, -B.grip + 1.6)), ax: sphere(1.15), skin: EDGE });
  put(part, 'hilt', { k: 'rod', a: add(b.guard, mul(b.across, -B.guard)), b: add(b.guard, mul(b.across, B.guard)), ra: 0.7, rb: 0.7, ramp: EDGE });
  for (const k of [-1, 1]) put(part, 'hilt', { k: 'rod', a: add(b.guard, mul(b.across, k * B.guard)), b: add(add(b.guard, mul(b.across, k * (B.guard + 0.6))), mul(b.way, 1.6)), ra: 0.6, rb: 0.3, ramp: EDGE });
  // the glass: a core along it (seen edge-on, a line of light), and its flat
  put(part, 'blade', { k: 'rod', a: add(b.guard, mul(b.way, 0.3)), b: b.tip, ra: 0.85, rb: 0.16, ramp: GLASS });
  const half = B.long / 2;
  put(part, 'blade', {
    k: 'panel',
    c: b.at(half),
    u: mul(b.across, B.wide),
    v: mul(b.way, half),
    skin: (a, v, front, tone) => {
      const along = (v + half) / B.long;
      const w = B.wide * Math.min(1, (1 - along) * 3.2) * (1 - 0.18 * along);
      if (Math.abs(a) > w) return null;
      if (Math.abs(a) > w - 0.45) return GLASS[4];
      if (Math.abs(a) < 0.3 && along < 0.8) return GLASS[front ? 1 : 0];
      // (a sheen across the glass, sliding along it as it turns)
      const sh = fr(along * 2.2 + a * 0.12 + (front ? 0 : 0.5));
      if (sh < 0.1) return GLASS[4];
      if (sh < 0.22) return GLASS[3];
      return GLASS[Math.max(2, Math.min(3, tone))];
    },
  });
  if (glint > 0.05) {
    put('glint', part, { k: 'glow', p: b.at(B.long * 0.6), c: FLAME[1], r: 7 + 7 * glint, a: 0.45 * glint });
    for (let i = 0; i < 6; i++) {
      const k = (i + 0.5) / 6;
      const p = add(b.at(B.long * k), mul(b.across, (i % 2 ? 1 : -1) * B.wide * (1 - k) * 0.9));
      if (hash(i, Math.floor(t * 15), 8101 + seed) < 0.6) put('glint', part, { k: 'mote', p, c: i % 2 ? FLAME[2] : FLAME[3], size: 1 });
    }
  }
}

// =============================================================================================
// THE MIRROR: the plate shows what lies the way the eye's line comes off it

/**
 * A skin of mirror for a round thing (a pauldron, a poleyn, the helm, the breastplate): at each point of it, the way the
 * eye's line comes off it, and what of the gallery lies that way (the glasshouse's light, the lit vault above the bright
 * line of the far windows, the dark floor below); the side away from the light a step darker. `dark`: steps darker still.
 */
function chrome(axes: readonly [V3, V3, V3], eye: V3, dark = 0, off?: (u: V3) => boolean): (u: V3, tone: number) => string | null {
  const inv = axes.map((a) => mul(a, 1 / Math.max(1e-6, dot(a, a)))) as [V3, V3, V3];
  return (u, tone) => {
    if (off?.(u)) return null;
    const n = norm(add(add(mul(inv[0], u[0]), mul(inv[1], u[1])), mul(inv[2], u[2])), [0, 0, 1]);
    const r = sub(mul(n, 2 * dot(n, eye)), eye);
    if (dot(r, SUN) > 0.955) return MIRROR[6];
    let k: number;
    if (Math.abs(dot(r, SHEEN)) < 0.045) k = 5;
    else {
      const h = r[2] + 0.18;
      k = h > 0.5 ? 5 : h > 0.22 ? 4 : h > 0.04 ? 3 : h > -0.05 ? 5 : h > -0.3 ? 2 : 1;
    }
    if (tone <= 1) k -= 1;
    return MIRROR[Math.max(0, Math.min(6, k - dark))];
  };
}

// =============================================================================================
// THE MIRROR-RIPPLE THEY STEP THROUGH (the Queen's Looking Glass, smaller): a pane of rippling glass in the air at their side

/**
 * A mirror-ripple as one of their moves has it: its glass the plane `y` (their own lengths, to their left) facing along -y
 * (toward them), its middle along x at `x`, its foot just off the floor; `half` its half-width, `tall` its height; `open`
 * how far its oval has opened out from its middle (0 shut, 1 whole); ripples running out across it, each from a point
 * (across from its middle, and up from its foot) and how long ago (seconds).
 */
export interface Ripple {
  x: number;
  y: number;
  half: number;
  tall: number;
  open: number;
  ripples: ReadonlyArray<readonly [number, number, number]>;
}
/** The mirror-ripple's size: as tall as they are and more, half as wide again as their shoulders. */
export const QG_RIPPLE = { y: 19, half: 20, tall: 96, foot: 2.2 } as const;
/** THE MIRROR-RIPPLE: an oval of dark glass opening out of the air from its middle, its rim a ring of lavender light, sheen running down it, ripples running out across it from where they pass. */
function rippleBits(put: Put, g: Ripple): void {
  if (g.open <= 0.01) return;
  const W = g.half;
  const Hh = g.tall / 2;
  const c: V3 = [g.x, g.y, QG_RIPPLE.foot + Hh];
  const o = Math.min(1, g.open);
  put('glass', 'pane', {
    k: 'panel',
    c,
    u: [W, 0, 0],
    v: [0, 0, Hh],
    skin: (a, b, front, tone) => {
      // (an oval, a little pointed at its crown, like the gallery's arched glass)
      const bb = b > 0 ? b / (Hh * (1 - 0.08 * (a / W) ** 2)) : b / Hh;
      const e = Math.hypot(a / W, bb);
      if (e > o) return null;
      if (e > o - 0.06) return RIPPLE[4];
      if (e > o - 0.1) return RIPPLE[3];
      if (!front) return RIPPLE[0];
      let k = Math.max(1, Math.min(2, tone));
      // (sheen running slantwise down it, as water down glass)
      const sh = fr((a * 0.6 + b) / 26 + 0.3);
      if (sh < 0.06) k = 3;
      // the ripples: bright rings running out, fading as they go
      for (const [ra, rb, age] of g.ripples) {
        if (age < 0) continue;
        const d = Math.hypot(a - ra, (b + Hh - rb) * 0.85);
        for (const lag of [0, 0.12, 0.24]) {
          const r = 60 * (age - lag);
          if (r < 0) continue;
          const fade = 1 - clamp01((age - lag) / 0.5);
          if (fade > 0 && Math.abs(d - r) < 1.0 + 0.8 * fade) k = Math.min(4, k + (lag === 0 ? 2 : 1));
        }
      }
      return RIPPLE[k];
    },
  });
  put('glint', 'glass', { k: 'glow', p: c, c: '#c8c4f0', r: 30 * o, a: 0.18 * o });
}

// =============================================================================================
// THE SHARDS: of glass (the thrown fan), of mirror (as they shatter)

/** A shard: its middle, its long half (to its point) and its short half (across), and whether it is glass (the fan) or mirror (them, shattered); how bright (0 to 1). */
export interface QGShard {
  c: V3;
  u: V3;
  v: V3;
  glass: boolean;
  lit: number;
}
/** A SHARD: a long narrow sliver, pointed at one end, its edge catching the light; glass or mirror. */
function shardBit(put: Put, part: string, sh: QGShard): void {
  put(part, 'shard', {
    k: 'panel',
    c: sh.c,
    u: sh.v,
    v: sh.u,
    skin: (a, b, front, tone) => {
      const lu = len3(sh.u);
      const lv = len3(sh.v);
      const along = (b / lu + 1) / 2;
      const w = lv * (along < 0.3 ? 0.4 + 2 * along : (1 - along) / 0.7);
      if (Math.abs(a) > w) return null;
      const edge = Math.abs(a) > w - 0.5;
      if (sh.glass) return edge || sh.lit > 0.7 ? GLASS[4] : GLASS[front ? Math.max(2, Math.min(3, tone)) : 1];
      if (sh.lit > 0.7) return MIRROR[6];
      return edge ? MIRROR[5] : MIRROR[front ? Math.max(2, Math.min(4, tone + 1)) : 1];
    },
  });
}

// =============================================================================================
// WHAT THE PAINTER IS TOLD OF THEM AT A MOMENT, by their moves (art/queens_guard_moves.ts)

export interface QGuardSay {
  /** Through the mirror-ripple: none of them painted (the ripple, the shards and the smear are). */
  away: (m: Moment) => boolean;
  /** The mirror-ripple, if there is one. */
  ripple: (m: Moment) => Ripple | null;
  /** How far the cracks have raced over them as they die (0 none to 1 all over), and whether they have shattered (none of them painted but the shards). */
  cracked: (m: Moment) => number;
  shattered: (m: Moment) => boolean;
  /** Shards: the fan forming on the blades and thrown, or them shattered. */
  shards: (m: Moment) => QGShard[];
  /** THE SMEAR OF A LIGHTNING STRIKE (his Movement 9): after-images of what strikes, each a line of points, the oldest first. */
  smear?: (m: Moment) => V3[][] | null;
  /** What is laid after their edge: the X of glass light, glints. */
  more?: (m: Moment) => [V3, string, number][];
}

// =============================================================================================
// THEM AS SOLIDS

/** A plated arm: a small rounded pauldron of mirror; the rerebrace; a mirror couter; the vambrace; a gauntlet, its fingers closed round the grip. */
function arm(put: Put, st: Stage, s: Skeleton, side: 'L' | 'R', cu: V3): void {
  const sh = side === 'L' ? s.shoulderL : s.shoulderR;
  const el = side === 'L' ? s.elbowL : s.elbowR;
  const hand = side === 'L' ? s.handL : s.handR;
  const [r0, r1, r2] = GB.armR;
  const fore = norm(sub(hand, el), [0, 0, -1]);
  put(`arm${side}`, `sleeve${side}`, { k: 'rod', a: sh, b: el, ra: r0 * 1.0, rb: r1 * 1.0, ramp: ARMING, far: true });
  put(`arm${side}`, `rerebrace${side}`, { k: 'rod', a: lerp3(sh, el, 0.24), b: lerp3(sh, el, 0.86), ra: r0 * 1.16, rb: r1 * 1.2, ramp: SILVER_UP, far: true });
  // THE PAULDRON: a cup of mirror over the shoulder, its ridge, a lame below it
  const lat = norm(sub(sh, lerp3(s.shoulderL, s.shoulderR, 0.5)), [0, side === 'L' ? 1 : -1, 0]);
  const pax: [V3, V3, V3] = [mul(s.chest[0], r0 * 1.8), mul(lat, r0 * 1.7), mul(cu, r0 * 1.45)];
  const cut = (u: V3): boolean => u[2] < -0.4;
  const pm = chrome(pax, st.eye, 0, cut);
  put(`arm${side}`, `pauldron${side}`, { k: 'ball', c: add(add(sh, mul(cu, 1.2)), mul(lat, 0.7)), ax: pax, skin: (u, tone) => (Math.abs(u[1]) < 0.08 && u[2] > 0.3 ? EDGE[4] : u[2] < -0.28 && !cut(u) ? EDGE[Math.max(1, tone)] : pm(u, tone)), far: true });
  // the couter at the elbow
  const cax: [V3, V3, V3] = [mul(fore, r1 * 1.3), mul(lat, r1 * 1.3), mul(cu, r1 * 1.3)];
  put(`fore${side}`, `couter${side}`, { k: 'ball', c: el, ax: sphere(r1 * 1.32), skin: chrome(cax, st.eye), far: true });
  const wrist = add(hand, mul(fore, -1.2));
  put(`fore${side}`, `vambrace${side}`, { k: 'rod', a: el, b: lerp3(el, wrist, 0.74), ra: r1 * 1.16, rb: r2 * 1.16, ramp: SILVER_UP, far: true });
  put(`fore${side}`, `cuff${side}`, { k: 'rod', a: lerp3(el, wrist, 0.7), b: wrist, ra: r1 * 1.3, rb: r2 * 1.14, ramp: EDGE, far: true });
  const e1 = norm(sub(cu, mul(fore, dot(cu, fore))), [0, 0, 1]);
  const e2 = norm(cross(fore, e1), [0, 1, 0]);
  put(`hand${side}`, `hand${side}`, { k: 'ball', c: add(hand, mul(fore, 0.3)), ax: [mul(fore, 1.8), mul(e2, 1.6), mul(e1, 1.1)], skin: SILVER, far: true });
  for (let i = 0; i < 4; i++) {
    const spread = (i - 1.5) * 0.34;
    const base = add(hand, add(mul(fore, 1.4), mul(e2, spread * 0.9)));
    const mid = add(base, add(mul(fore, 0.8), mul(e1, -1.0)));
    const tip = add(mid, add(mul(fore, 0.2), mul(e1, -1.1)));
    put(`hand${side}`, `finger${side}`, { k: 'rod', a: base, b: mid, ra: 0.55, rb: 0.5, ramp: SILVER, far: true });
    put(`hand${side}`, `finger${side}`, { k: 'rod', a: mid, b: tip, ra: 0.5, rb: 0.4, ramp: SILVER, far: true });
  }
}
/** A plated leg, long: the cuisse; a mirror poleyn at the knee; the greave; a long pointed sabaton of mirror. */
function leg(put: Put, st: Stage, s: Skeleton, side: 'L' | 'R'): void {
  const hip = side === 'L' ? s.hipL : s.hipR;
  const knee = side === 'L' ? s.kneeL : s.kneeR;
  const ankle = side === 'L' ? s.ankleL : s.ankleR;
  const heel = side === 'L' ? s.heelL : s.heelR;
  const toe = side === 'L' ? s.toeL : s.toeR;
  const [rH, rK, rA] = GB.legR;
  const thigh = norm(sub(knee, hip), [0, 0, -1]);
  const before = norm(cross(thigh, s.hips[1]), s.hips[0]);
  put(`leg${side}`, `leg${side}`, { k: 'rod', a: hip, b: knee, ra: rH * 1.04, rb: rK * 1.0, ramp: ARMING, far: true });
  put(`leg${side}`, `cuisse${side}`, { k: 'rod', a: lerp3(hip, knee, 0.28), b: lerp3(hip, knee, 0.92), ra: rH * 1.1, rb: rK * 1.14, ramp: SILVER_UP, far: true });
  put(`leg${side}`, `poleyn${side}`, { k: 'ball', c: add(knee, mul(before, 0.7)), ax: sphere(rK * 1.18), skin: chrome([mul(before, rK * 1.18), mul(s.hips[1], rK * 1.18), [0, 0, rK * 1.18]], st.eye), far: true });
  const shin = norm(sub(ankle, knee), [0, 0, -1]);
  put(`shin${side}`, `greave${side}`, { k: 'rod', a: add(knee, mul(shin, 1.6)), b: ankle, ra: rK * 1.18, rb: rA * 1.28, ramp: SILVER_UP, far: true });
  const fwd = norm(sub(toe, heel), [1, 0, 0]);
  const side3 = norm(Math.abs(fwd[2]) < 0.95 ? [-fwd[1], fwd[0], 0] : cross(s.hips[2], fwd), [0, 1, 0]);
  const up3 = norm(cross(fwd, side3), [0, 0, 1]);
  const fax: [V3, V3, V3] = [mul(fwd, 6.0), mul(side3, 1.9), mul(up3, 1.7)];
  put(`foot${side}`, `foot${side}`, { k: 'ball', c: add(lerp3(heel, toe, 0.56), mul(up3, 1.65)), ax: fax, skin: chrome(fax, st.eye), far: true });
}

/** THE CUIRASS, slim, from the fauld up under the arms; its narrow waist. */
function cuirassRings(s: Skeleton): Ring[] {
  const [cf, cl] = s.chest;
  const be = s.belly;
  const waistC = add(s.pelvis, mul(s.hips[2], GB.waist * 0.5));
  return [
    { c: add(s.pelvis, mul(s.hips[2], GB.waist * 0.12)), u: mul(s.hips[0], GB.pelvisDeep + 2.0), v: mul(s.hips[1], GB.pelvisHalf + 2.0) },
    { c: waistC, u: mul(be[0], GB.waistDeep + 2.0), v: mul(be[1], GB.waistHalf + 1.9) },
    { c: lerp3(waistC, s.ribs, 0.55), u: mul(be[0], GB.waistDeep + 2.8), v: mul(be[1], GB.waistHalf + 2.4) },
    { c: s.ribs, u: mul(cf, GB.ribDeep + 2.6), v: mul(cl, GB.ribHalf + 2.2) },
    { c: lerp3(s.ribs, s.neck, 0.64), u: mul(cf, GB.ribDeep + 1.7), v: mul(cl, GB.shoulderHalf + 0.2) },
    { c: add(s.neck, mul(s.chest[2], -0.8)), u: mul(cf, 3.6), v: mul(cl, 4.2) },
  ];
}
/** The breastplate's mirror: a shell over the chest's front. */
function breastAxes(s: Skeleton): { c: V3; ax: [V3, V3, V3] } {
  const [cf, cl, cu] = s.chest;
  return { c: add(lerp3(s.ribs, s.neck, 0.2), mul(cf, 0.6)), ax: [mul(cf, GB.ribDeep + 2.4), mul(cl, GB.ribHalf + 2.0), mul(cu, GB.chest * 0.5)] };
}

/** THE CAPE: violet from the shoulders down the back to the ankles, clasped at the pauldrons; left behind as they go, stirring as they stand. */
function cape(put: Put, s: Skeleton, lag: V3, wind: number, flare: number): void {
  const [cf, cl, cu] = s.chest;
  const f = norm([s.hips[0][0], s.hips[0][1], 0], [1, 0, 0]);
  const l: V3 = [-f[1], f[0], 0];
  const top: Ring = { c: add(add(s.neck, mul(cu, -1.0)), mul(cf, -0.9)), u: mul(cf, GB.ribDeep + 2.2), v: mul(cl, GB.shoulderHalf + 3.4) };
  const midC = add(add(lerp3(s.waist, s.ribs, 0.35), mul(f, -1.2)), mul(lag, 0.5));
  const midR: Ring = { c: midC, u: mul(f, GB.ribDeep + 3.2 + 1.2 * flare), v: mul(l, GB.ribHalf + 4.6) };
  const down = norm(sub(s.pelvis, s.neck), [0, 0, -1]);
  const h0 = add(s.pelvis, mul(down, GB.thigh + GB.shank * 0.78));
  const hz = Math.max(3.4, h0[2]) + 5 * flare;
  const hc: V3 = [h0[0] - 3.2 * f[0] + lag[0] * 2.6 - 8 * flare * f[0], h0[1] - 3.2 * f[1] + lag[1] * 2.6 - 8 * flare * f[1], hz];
  const wide = (GB.ribHalf + 6.6) * (1 + 0.2 * flare);
  const deep = (GB.ribDeep + 3.6) * (1 + 0.3 * flare);
  const pts: V3[] = [];
  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * Math.PI * 2;
    const rear = Math.max(0, -Math.cos(a));
    const p0 = add(hc, add(mul(f, Math.cos(a) * deep), mul(l, Math.sin(a) * wide)));
    const ripple = Math.sin(wind * Math.PI * 2 + a * 2) * (0.7 + 1.8 * flare);
    pts.push(add(p0, add(mul(f, -rear * (1.4 + 3 * flare)), [0, 0, Math.max(-p0[2] + 2.6, ripple + rear * 0.8)])));
  }
  const hem: Ring = { c: hc, u: mul(f, deep), v: mul(l, wide), pts };
  put('cape', 'cape', { k: 'cloth', rings: [top, midR, hem], ramp: VIOLET, look: { arc: [62, 298], folds: [110, 140, 165, 195, 220, 250], lift: 0.1, hem: EDGE, lining: 0.35 } });
  for (const k of [1, -1]) {
    const at = add(add(s.neck, mul(cl, k * (GB.shoulderHalf - 0.6))), add(mul(cf, GB.ribDeep * 0.45), mul(cu, -1.0)));
    put('clasp', 'clasp', { k: 'ball', c: at, ax: sphere(1.15), skin: EDGE });
  }
}

/**
 * THE FACELESS HELM: a smooth egg of mirror, taller than it is wide, a faint sheen across it (you see the gallery, and
 * yourself, in it); deep behind its face the Hush's dull pink, two smudges where eyes would be; its rim over the gorget.
 * Returns where the Hush seeps out under the rim, and the face's ways.
 */
function head(put: Put, st: Stage, s: Skeleton, lit: number): { chin: V3; ff: V3; fl: V3; fu: V3 } {
  const [ff, fl, fu] = wornOn(st, s, 8);
  const hr: V3 = [GB.headR[0] * 1.18, GB.headR[1] * 1.26, GB.headR[2] * 1.3];
  const hc = add(s.head, mul(fu, 0.9));
  const ax: [V3, V3, V3] = [mul(ff, hr[0]), mul(fl, hr[1]), mul(fu, hr[2])];
  const mirror = chrome(ax, st.eye);
  const deep = lit > 0.4;
  put('helm', 'helm', {
    k: 'ball',
    c: hc,
    ax,
    skin: (u, tone) => {
      // (its rim at the foot, a bright edge over the gorget)
      if (u[2] < -0.86) return EDGE[Math.max(1, tone)];
      // THE FACE: the mirror darkened where the Hush's pink shows deep behind it
      if (u[0] > 0.35 && Math.abs(u[1]) < 0.62 && u[2] > -0.55 && u[2] < 0.42) {
        if (deep) {
          for (const k of [-1, 1]) {
            const e = Math.hypot((u[1] - k * 0.3) / 0.2, (u[2] - 0.06) / 0.14);
            if (e < 1) return e < 0.55 ? FLAME[0] : '#4a1a3c';
          }
        }
        const m = mirror(u, tone) as string;
        const i = MIRROR.indexOf(m);
        return i > 3 ? m : MIRROR[Math.max(0, i - 1)];
      }
      return mirror(u, tone);
    },
  });
  // the Hush's dull pink deep behind the face (gone out as the Hush leaves them)
  for (const k of [-1, 1]) {
    const e = add(hc, add(mul(ff, hr[0] * 0.93), add(mul(fl, k * hr[1] * 0.3), mul(fu, hr[2] * 0.06))));
    put('helm', 'eyes', { k: 'dot', p: e, c: deep ? FLAME[1] : '#2a1e24', facing: ff, c2: deep ? FLAME[0] : '#2a1e24' });
  }
  const chin = add(hc, add(mul(ff, hr[0] * 0.62), mul(fu, -hr[2] * 0.82)));
  return { chin, ff, fl, fu };
}

/** The Hush leaking out of them at each moment, laid after their edge (Mob.grains). */
const GRAINS = new WeakMap<Moment, [V3, string, number][]>();
/** THE HUSH SEEPING OUT under the helm's rim: short grey wisps, curling up past the helm; more as they wind up a blow (`hard`). */
function seep(put: Put, at: V3, out: V3, ff: V3, t: number, seed: number, hard: number): void {
  const N = Math.round(6 + 6 * hard);
  for (let i = 0; i < N; i++) {
    const life = fr(t * (0.8 + 0.5 * hard) + i / N + 0.17 * hash(i, seed, 2321));
    if (life > 0.55 + 0.4 * hard) continue;
    const curl = life * 5 + seed;
    const p = add(at, add(mul(out, (0.6 + life * (2.4 + 2.4 * hard)) * (0.8 + 0.4 * hash(i, seed, 2322))), add(mul(ff, 0.6 + Math.sin(curl) * (0.4 + life * 1.4)), [0, 0, life * (6 + 6 * hard)])));
    const c = life < 0.2 ? BREATH_PALE : life < 0.45 ? HUSH[4] : HUSH[3];
    put('hush', 'hush', { k: 'mote', p, c, size: life < 0.3 ? 3 : 2 });
  }
}
/** The smear's after-images: the oldest a dull violet, the newest silver-white. */
export const QG_SMEAR = ['#6e6c9a', '#c2c2e4', '#f4f4ff'] as const;
/** The X of glass light the double slash leaves in the air. */
export const QG_XLIGHT = ['#e8eaff', '#b4baf4', '#8a90dc'] as const;
/** When the Hush pours out of them as they die (seconds into it). */
export const QG_EXHALE: readonly [number, number] = [0.42, 1.36];

/**
 * CRACKS RACING OVER THEM as they die: on each plate a jagged line of dark split with a bright lip, run out from the middle
 * of the side toward the eye as far as `k` has come (on a limb, along it; on a round plate, out from it in a star).
 */
function cracksOn(put: Put, part: string, sh: Shape, eye: V3, k: number, seed: number): void {
  if (k <= 0) return;
  const lines: V3[][] = [];
  if (sh.k === 'rod') {
    const ax = sub(sh.b, sh.a);
    const L = len3(ax);
    if (L < 2) return;
    const w = mul(ax, 1 / L);
    const e = norm(sub(eye, mul(w, dot(eye, w))), [1, 0, 0]);
    const lat = norm(cross(w, e), [0, 1, 0]);
    const n = Math.max(3, Math.round(L / 2.4));
    const reach = Math.min(1, k * 1.6);
    const pts: V3[] = [];
    for (let i = 0; i <= n; i++) {
      const s0 = i / n;
      if (Math.abs(s0 - 0.5) > reach / 2) continue;
      const ph = (hash(i, seed, 8301) - 0.5) * 1.3;
      const r = (sh.ra + (sh.rb - sh.ra) * s0) * 1.0;
      pts.push(add(add(sh.a, mul(ax, s0)), add(mul(e, r * Math.cos(ph)), mul(lat, r * Math.sin(ph)))));
    }
    if (pts.length > 1) lines.push(pts);
  } else if (sh.k === 'ball') {
    const [A0, A1, A2] = sh.ax;
    const inv = [A0, A1, A2].map((a) => dot(eye, a) / Math.max(1e-6, dot(a, a)));
    const pole = norm(inv as unknown as V3, [1, 0, 0]);
    const t1 = norm(cross(pole, Math.abs(pole[2]) < 0.9 ? [0, 0, 1] : [1, 0, 0]), [0, 1, 0]);
    const t2 = cross(pole, t1);
    const arms = 4;
    for (let j = 0; j < arms; j++) {
      const a0 = (j / arms) * Math.PI * 2 + hash(j, seed, 8302) * 1.2;
      const pts: V3[] = [];
      for (let i = 0; i <= 5; i++) {
        const rr = (i / 5) * 1.25 * Math.min(1, k * 1.5);
        const a = a0 + (hash(i, j + seed, 8303) - 0.5) * 0.7;
        const u = norm(add(pole, add(mul(t1, Math.cos(a) * rr), mul(t2, Math.sin(a) * rr))));
        if (dot(u, pole) < 0.2) break;
        pts.push(add(sh.c, add(add(mul(A0, u[0] * 1.02), mul(A1, u[1] * 1.02)), mul(A2, u[2] * 1.02))));
      }
      if (pts.length > 1) lines.push(pts);
    }
  } else return;
  for (const pts of lines) {
    for (let i = 1; i < pts.length; i++) {
      put(part, 'crack', { k: 'thread', a: pts[i - 1], b: pts[i], c: CRACK.split, lift: 0.7 });
      put(part, 'crack', { k: 'thread', a: add(pts[i - 1], [0, 0, 0.55]), b: add(pts[i], [0, 0, 0.55]), c: CRACK.lit, lift: 0.6 });
    }
  }
}

function guardBits(st: Stage, m: Moment, say: QGuardSay): Bit[] {
  const { s, q } = m;
  const bits: Bit[] = [];
  const grains: [V3, string, number][] = [];
  GRAINS.set(m, grains);
  const crack = say.cracked(m);
  let seedN = 0;
  const put: Put = (part, piece, shape) => {
    if (shape.k === 'mote' && (part === 'hush' || part === 'glint')) {
      grains.push([shape.p, shape.c, shape.size]);
      return;
    }
    bits.push({ part, piece, shape });
    // (as they die, the cracks race over every plate of them)
    if (crack > 0 && (shape.k === 'rod' || shape.k === 'ball') && part !== 'hush' && piece !== 'crack' && piece !== 'blade' && piece !== 'hilt' && !/^finger|^hand|^sleeve|^leg[LR]$|clasp/.test(piece)) cracksOn(put, part, shape, st.eye, crack, ++seedN);
  };
  const ripple = say.ripple(m);
  if (ripple) rippleBits(put, ripple);
  for (const sh of say.shards(m)) shardBit(put, sh.glass ? 'fan' : 'shards', sh);
  const away = say.away(m) || say.shattered(m);
  const [cf, cl, cu] = s.chest;
  const lit = 1 - clamp01(q.out);
  const seed = 31;
  if (!away) {
    const lag = lagOf(m, 1.5, 3.2);
    const speed = len3(m.come) * 30;
    const flare = clamp01((speed - 60) / 140);
    for (const side of ['L', 'R'] as const) leg(put, st, s, side);
    // THE CUIRASS of mirrored plate, slim; its fauld; the breastplate's mirror over the chest
    put('body', 'cuirass', { k: 'cloth', rings: cuirassRings(s), ramp: SILVER, look: { folds: [0], lift: 0.03 } });
    const bp = breastAxes(s);
    put('body', 'breastplate', { k: 'ball', c: bp.c, ax: bp.ax, skin: chrome(bp.ax, st.eye, 0, (u) => u[0] < 0.1 || u[2] < -0.75) });
    const fauld = (k: number): Ring => ({ c: add(s.pelvis, mul(s.hips[2], GB.waist * 0.14 - k * 2.0)), u: mul(s.hips[0], GB.pelvisDeep + 2.2 + k * 0.3), v: mul(s.hips[1], GB.pelvisHalf + 2.2 + k * 0.3) });
    put('body', 'fauld', { k: 'band', ring: fauld(0), ramp: EDGE, rows: 1 });
    put('body', 'fauld', { k: 'band', ring: fauld(1), ramp: SILVER, rows: 2 });
    // THE TASSETS: long narrow plates of mirror hung from the fauld over the front of each thigh
    for (const side of ['L', 'R'] as const) {
      const hip = side === 'L' ? s.hipL : s.hipR;
      const knee = side === 'L' ? s.kneeL : s.kneeR;
      const thigh = norm(sub(knee, hip), [0, 0, -1]);
      const before = norm(cross(thigh, s.hips[1]), s.hips[0]);
      const lat = norm(cross(before, thigh), s.hips[1]);
      const rH = GB.legR[0];
      const top = add(hip, mul(before, rH * 1.3 + 1.3));
      const low = add(lerp3(hip, knee, 0.5), mul(before, rH * 1.2 + 1.5));
      put(`leg${side}`, `tasset${side}`, { k: 'panel', c: lerp3(top, low, 0.5), u: mul(lat, rH * 1.2), v: mul(sub(low, top), -0.5), skin: (a, b, front, tone) => (front ? (Math.abs(a) > rH * 1.2 - 0.55 ? EDGE[Math.max(2, tone)] : MIRROR[fr((b + 10) / 2.4) < 0.18 ? 2 : Math.max(3, Math.min(5, tone + 2))]) : SILVER[1]) });
    }
    put('body', 'belt', { k: 'band', ring: { c: add(s.pelvis, mul(s.hips[2], GB.waist * 0.5)), u: mul(s.belly[0], GB.waistDeep + 2.3), v: mul(s.belly[1], GB.waistHalf + 2.2) }, ramp: EDGE, rows: 1 });
    put('neck', 'gorget', { k: 'band', ring: { c: add(s.neck, mul(cu, -0.3)), u: mul(cf, 3.8), v: mul(cl, 4.3) }, ramp: SILVER, rows: 2 });
    put('neck', 'neck', { k: 'rod', a: add(s.neck, mul(cu, -1.4)), b: lerp3(s.neck, s.head, 0.5), ra: 2.5, rb: 2.4, ramp: SILVER });
    cape(put, s, lag, m.wind, flare);
    arm(put, st, s, 'L', cu);
    arm(put, st, s, 'R', cu);
    const hd = head(put, st, s, lit);
    const glint = clamp01(m.glint);
    blade(put, 'bladeR', bladeR(s), glint, m.t, 0);
    blade(put, 'bladeL', bladeL(s, q), glint, m.t + 0.37, 7);
    // THE HUSH SEEPING OUT under the helm; as they die it pours out in one great breath
    if (!m.dying || m.t < QG_EXHALE[0]) {
      const hard = glint;
      hushBreath(put, add(hd.chin, mul(hd.ff, 0.6)), hd.ff, hd.fl, m.t, 0.3 + 0.5 * hard, seed);
      seep(put, add(hd.chin, mul(hd.fl, 2.6)), hd.fl, hd.ff, m.t, seed, hard);
      seep(put, add(hd.chin, mul(hd.fl, -2.6)), mul(hd.fl, -1), hd.ff, m.t + 0.41, seed + 5, hard);
    } else {
      hushBreath(put, hd.chin, hd.ff, hd.fl, m.t, Math.max(0, 2.2 * (1 - clamp01((m.t - QG_EXHALE[0] - 0.1) / 0.9))), seed);
    }
    if (m.dying) hushLeaves(put, hd.chin, hd.ff, hd.fl, m.t, seed, QG_EXHALE[0], QG_EXHALE[1]);
  }
  // THE SMEAR of a lightning strike: its after-images, the oldest thinned to every other point
  const sm = say.smear?.(m);
  if (sm) {
    sm.forEach((line, j) => {
      const k = j / Math.max(1, sm.length - 1);
      for (let i = 1; i < line.length; i++) {
        const [x0, y0] = st.at(line[i - 1]);
        const [x1, y1] = st.at(line[i]);
        const n = Math.max(1, Math.ceil(Math.hypot(x1 - x0, y1 - y0)));
        for (let e = 0; e < n; e++) {
          if (k < 0.5 && (e + i) % 2) continue;
          bits.push({ part: 'smear', piece: 'smear', shape: { k: 'mote', p: lerp3(line[i - 1], line[i], e / n), c: k > 0.7 ? QG_SMEAR[2] : k > 0.35 ? QG_SMEAR[1] : QG_SMEAR[0], size: k > 0.7 ? 2 : 1 } });
        }
      }
    });
  }
  grains.push(...(say.more?.(m) ?? []));
  return bits;
}

/** THE QUEEN'S GUARD AS THE PAINTER TAKES THEM. */
export function qguardPainter(say: QGuardSay): { bits: (st: Stage, m: Moment) => Bit[]; grains: (st: Stage, m: Moment) => ReadonlyArray<readonly [V3, string, number]> } {
  return { bits: (st, m) => guardBits(st, m, say), grains: (_st, m) => GRAINS.get(m) ?? [] };
}
/** Where the breastplate is (for the checks). */
export { breastAxes };
