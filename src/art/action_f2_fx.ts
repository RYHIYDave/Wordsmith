// FLOOR 2: WHAT THE CULTIST'S FIRE SIGIL AND THE SHADE'S FROST RAKE LEAVE ON THE FLOOR, AND THE SHADE'S FROST (the art chat's
// helper, 31 Oct 2026; docs/mockups/action_f2/README.md). A MOCK-UP: NOTHING OF THE GAME IMPORTS IT. The cultist's cast is in
// its live rig behind a switch that is off (art/monster_cultist.ts CULTIST_SIGIL); the Shade's frost is here, behind
// SHADE_FROST (off), a Shade painted as the game's with the cold added (its rake's motion is the game's own, untouched).
//
// The owner's review of every enemy for more action, his picks of 31 Oct:
//   THE CULTIST: offered "Fire sigil: draws a burning circle on the floor under you. It erupts in a pillar of fire a second
//     later and burns on for a few seconds."; his pick “Yes (Recommended)”.
//   THE SHADE: “Keep the rake”; and for FROST, the Shade (offered as: “The grave's cold: its rake chills you and leaves rime on
//     the floor that slows”).
// Under his rules: Movement 9 (“Like the wind up and wind down are big but the actual punch is lightning quick”), and for the
// enemies, 28 Oct (“Start from now on, but every enemy is going to need that change eventually.  And bigger AOE to compensate
// for the extra time the player gets to evade”).
//
//   THE FIRE SIGIL: as the cultist traces its ring in the air, the same ring is drawn on the floor under the hero, burning, in
//     step with its hand (a fuse of white fire going round); then its inner ring, six marks of flame between the two, and the
//     cult's three-pointed sign inside, all burning brighter as it holds its fire up, the enemy's pink at the ring's edge
//     pulsing faster, sparks rising (`sigilPainted`, before the eruption: the warning). As it flings its hand down, THE PILLAR:
//     in two frames (a streak of fire shooting up, then the pillar), a column of flame as wide as the ring and twice the
//     knight's height; it roars a moment and falls back into the floor, which BURNS ON, the fire shrinking in to the middle and
//     gone (`burnRadius`).
//   THE RIME: where the Shade rakes, frost spreads over the floor in a fifth of a second, a crust of rime, feathered and
//     glittering; it lies, slowing whoever stands in it; then it melts from its edge and is gone (`rimePainted`).
//   THE FROST ON THE SHADE: its claws gather frost as it raises them, and the cold falls off them like breath; as it rakes,
//     frost streaks with its claws and bursts off them; the cold drifts down off them after (`FROST_SHADE`, `makeFrostShadeArt`).
//
// Everything on the floor is a picture of a moment (seconds), on a canvas of its own with the floor point it stands on (its
// anchor), in picture pixels (two to a game pixel), as the figures are. THE FROST'S COLOURS (FROST) are a pale grey-blue, hue
// 224 to 230 degrees, a fifth or less saturated but for the deepest: well clear of the friend's cyan (art/kit.ts CYAN:
// #22d0e0, hue 186, 85 percent; its pale #b8fff8, hue 174, green over blue). Every pixel is whole.

import { Px } from '../engine/px';
import type { Light } from '../engine/px';
import type { ActorArt } from './actor_types';
import { INK, PINK, hash } from './kit';
import type { Painted } from './kit';
import { FLAME } from './mkit';
import type { Canvas } from './mkit';
import { SHADE, SHADE_HIT, mobSet } from './new_mobs3';
import type { Bit, Mob, Moment } from './new_mobs3';
import type { Stage } from './skin';
import { add, mul, norm, sub } from './skeleton';
import type { V3 } from './skeleton';
import { floorOf, floorPx } from './action_f1_fx';

const clamp01 = (v: number): number => (v < 0 ? 0 : v > 1 ? 1 : v);
const smooth = (a: number, b: number, t: number): number => {
  const u = clamp01((t - a) / (b - a));
  return u * u * (3 - 2 * u);
};
const FR = 1 / 30;
const TAU = Math.PI * 2;
/** A white hotter than the cultist's gold, a touch of the gold in it: the sigil's fuse, the pillar's heart. */
const WHITE = '#fffbea';
/** Scorched stone. */
const CHAR = ['#140c16', '#22141e', '#34202a'] as const;

/** Which part of a picture that stands up off the floor: what is behind a figure at its middle, what is before it, or all. */
export type Side = 'behind' | 'before' | 'all';
/** Whether a floor point (tiles from the anchor) is on the side asked: before is nearer the camera (lower on the screen). */
const onSide = (fx: number, fy: number, side: Side): boolean => side === 'all' || (fx + fy > 0) === (side === 'before');

// =============================================================================================
// THE FIRE SIGIL

/**
 * ITS NUMBERS. Times are seconds from the eruption (the cultist's slam, art/monster_cultist.ts SIGIL_SLAM, 1.2 s into its cast).
 *   radius   the ring, in tiles (his rule: big): a hero whose middle is inside it at the eruption is struck. 1.5 to 2.0 drawn
 *            and tested; 1.75 the pick.
 *   delay    from when the ring first appears under the hero (as the cultist's hand begins its ring in the air) to the eruption.
 *   trace    how long the outer ring takes to be drawn round (the cultist's hand going once round its ring in the air).
 *   strike   the eruption's two frames: a streak of fire shooting up, then the pillar (the hit lands on the first, at 0).
 *   pillar   the pillar stands, roaring, this long; `fall`: it falls back into the floor over this.
 *   burn     the floor burns on this long after the pillar has fallen, its fire shrinking in to the middle: a hero inside
 *            burnRadius(t) is burned (the rules': so much a second).
 */
export const SIGIL = { radius: 1.75, delay: 1.04, trace: 0.4, strike: [0, FR] as const, pillar: 0.3, fall: 0.2, burn: 3.0 } as const;
/** How long the sigil's picture lasts after the eruption: after this it is empty. */
export const SIGIL_LONG = SIGIL.pillar + SIGIL.fall + SIGIL.burn;
/** How tall the pillar stands (picture pixels: the knight is about 100). */
export const PILLAR_TALL = 196;
/** The sigil's canvas: the ring (up to 2 tiles) on the floor, and the pillar over it. Its anchor is the ring's middle. */
export const SIGIL_CANVAS: Canvas = { w: 236, h: 318, ax: 118, ay: 266 };

/** How far out the floor still burns, `t` seconds after the eruption (tiles; 0 when it is out). */
export function burnRadius(t: number, radius: number = SIGIL.radius): number {
  if (t < 0) return 0;
  if (t < SIGIL.pillar) return radius;
  const u = (t - SIGIL.pillar) / (SIGIL.fall + SIGIL.burn);
  return u >= 1 ? 0 : radius * Math.pow(1 - u, 0.7);
}
/** Whether a hero `x`, `y` tiles from the sigil's middle is struck by the eruption. */
export const sigilStrikes = (x: number, y: number, radius: number = SIGIL.radius): boolean => Math.hypot(x, y) <= radius;

/** The sigil's lines, on the floor (tiles), for a ring of `R`: the inner ring's radius, the six marks of flame between the rings, the three-pointed sign inside. */
function sigilLines(R: number): { inner: number; marks: [number, number, number, number][]; sign: [number, number, number, number][] } {
  const inner = 0.66 * R;
  const marks: [number, number, number, number][] = [];
  for (let j = 0; j < 6; j++) {
    const a = ((j * 60 + 30) * Math.PI) / 180;
    const at = (r: number, da = 0): [number, number] => [r * Math.cos(a + da), r * Math.sin(a + da)];
    // (a tongue of flame: a stroke out from the inner ring, and a lick curling off it)
    const [x0, y0] = at(0.71 * R);
    const [x1, y1] = at(0.93 * R);
    const [x2, y2] = at(0.8 * R, 0.07);
    const [x3, y3] = at(0.9 * R, 0.12);
    marks.push([x0, y0, x1, y1], [x2, y2, x3, y3]);
  }
  const sign: [number, number, number, number][] = [];
  const pts = [90, 210, 330].map((d) => [inner * Math.cos((d * Math.PI) / 180), inner * Math.sin((d * Math.PI) / 180)] as [number, number]);
  for (let i = 0; i < 3; i++) sign.push([pts[i][0], pts[i][1], pts[(i + 1) % 3][0], pts[(i + 1) % 3][1]]);
  // (and from each point of it, in toward the middle)
  for (const p of pts) sign.push([p[0], p[1], p[0] * 0.25, p[1] * 0.25]);
  return { inner, marks, sign };
}
const segDist = (px: number, py: number, s: readonly [number, number, number, number]): number => {
  const [ax, ay, bx, by] = s;
  const dx = bx - ax;
  const dy = by - ay;
  const k = clamp01(((px - ax) * dx + (py - ay) * dy) / (dx * dx + dy * dy || 1));
  return Math.hypot(px - ax - dx * k, py - ay - dy * k);
};
/** How far round the screen a picture pixel is from the ring's middle (0 at the top, going clockwise, up to 1). */
const roundOf = (sx: number, sy: number): number => ((Math.atan2(sx, -sy * 2) / TAU) + 1) % 1;

/** A tongue of flame standing on the floor: its foot at (x, y) on a picture, `tall` and `wide` pixels; `lean` its tip's sway; `hot` how far in its heart goes white. */
function tongue(p: Px, x: number, y: number, tall: number, wide: number, lean: number, hot: number, seed: number): void {
  if (tall < 2 || wide < 1) return;
  const shells: [number, string][] = [[1, FLAME[1]], [0.78, FLAME[2]], [0.56, FLAME[3]], [0.34, FLAME[4]]];
  if (hot > 0) shells.push([0.18 + 0.12 * hot, WHITE]);
  for (const [s, c] of shells) {
    const rows = Math.max(1, Math.round(tall * (s === 1 ? 1 : 0.35 + 0.65 * s)));
    for (let i = 0; i < rows; i++) {
      const u = i / Math.max(1, rows - 1);
      // (round at its foot, widest a fifth of the way up, drawn out to a point)
      const prof = u < 0.2 ? Math.sqrt(1 - ((0.2 - u) / 0.2) ** 2 * 0.6) : Math.pow(1 - (u - 0.2) / 0.8, 1.3);
      const hw = Math.max(0.5, (wide / 2) * s * prof);
      const mid = x + lean * u * u * (tall / 30) + Math.sin(u * 5 + seed) * 0.6 * u;
      const y0 = Math.round(y - i - (s < 1 ? Math.round((1 - s) * tall * 0.08) : 0));
      for (let X = Math.round(mid - hw); X < Math.max(Math.round(mid - hw) + 1, Math.round(mid + hw)); X++) if (y0 >= 0 && X >= 0 && X < p.w && y0 < p.h) p.set(X, y0, c);
    }
  }
}

/**
 * THE SIGIL `t` seconds from the eruption (from -SIGIL.delay to SIGIL_LONG), for a ring of `radius` tiles. `layer` 'floor' is
 * what lies on the floor (the sigil's lines, the scorch), laid under the figures; 'air' is what stands up off it (sparks, the
 * pillar, the flames it leaves), laid by halves: `side` 'behind' before a figure standing at its middle, 'before' after it.
 */
export function sigilPainted(t: number, layer: 'floor' | 'air', radius: number = SIGIL.radius, side: Side = 'all'): Painted {
  const C = SIGIL_CANVAS;
  const px = new Px(C.w, C.h);
  const lights: Light[] = [];
  if (t < -SIGIL.delay - 1e-6 || t > SIGIL_LONG + 1e-6) return { px, lights };
  const R = radius;
  const f = Math.floor((t + 10) * 30 + 1e-6);
  const since = t + SIGIL.delay;
  /** The outer ring drawn round so far (0..1); the inner lines (0..1); how hot it all burns (0..1). */
  const traced = clamp01(since / SIGIL.trace);
  const lined = clamp01((since - SIGIL.trace) / 0.25);
  const heat = t < 0 ? 0.35 + 0.65 * smooth(-SIGIL.delay + SIGIL.trace, 0, t) : Math.max(0, 1 - (t - SIGIL.pillar) / (SIGIL.fall + SIGIL.burn * 0.5));
  const { inner, marks, sign } = sigilLines(R);
  if (layer === 'floor') {
    // THE SCORCH, once it has erupted: the stone burned black where the fire is, embers in it; the sigil's lines dying embers
    const burnR = burnRadius(t, R);
    for (let Y = 0; Y < C.h; Y++) {
      for (let X = 0; X < C.w; X++) {
        const sx = X + 0.5 - C.ax;
        const sy = Y + 0.5 - C.ay;
        const [fx, fy] = floorOf(sx, sy);
        const rho = Math.hypot(fx, fy);
        if (rho > R + 0.16) continue;
        let c: string | null = null;
        if (t >= 0 && rho <= Math.max(burnR, t < SIGIL.pillar + SIGIL.fall ? R : 0) + 0.06) {
          const h = hash(X, Y, 6101);
          const edge = rho > burnR - 0.12;
          c = h < (edge ? 0.35 : 0.62) ? CHAR[h < 0.2 ? 0 : 1] : null;
          // (embers: winking, more of them where it burns hottest)
          if (burnR > 0 && hash(X >> 1, Y, 6102 + (f >> 2)) < 0.035 * (1 - rho / (burnR + 0.01))) c = FLAME[hash(X, Y, f) < 0.5 ? 2 : 1];
        }
        // the sigil's lines: before the eruption burning brighter and brighter; in it white; after it embers going out
        const ring = Math.abs(rho - R) <= 0.07;
        const edgeBand = rho > R + 0.07 && rho <= R + 0.13;
        const round = roundOf(sx, sy);
        const onRing = ring && round <= traced;
        const onInner = lined > 0 && Math.abs(rho - inner) <= 0.045 && round <= clamp01(lined * 1.6);
        let onMark = false;
        if (lined > 0.3 && rho > inner && rho < R) for (let j = 0; j < marks.length; j++) if (j / marks.length <= (lined - 0.3) / 0.5 && segDist(fx, fy, marks[j]) <= 0.045) onMark = true;
        let onSign = false;
        if (lined > 0.5 && rho < inner) for (let j = 0; j < sign.length; j++) if (j / sign.length <= (lined - 0.5) / 0.5 && segDist(fx, fy, sign[j]) <= 0.045) onSign = true;
        if (rho < 0.13 * R && rho > 0.08 * R && lined > 0.9) onSign = true;
        if (onRing || onInner || onMark || onSign) {
          if (t < 0) {
            const flick = hash(X, Y, 6103 + f) < 0.12;
            const g = heat + (onRing ? 0.12 : 0) - (flick ? 0.25 : 0);
            c = g > 0.95 ? WHITE : g > 0.78 ? FLAME[4] : g > 0.55 ? FLAME[3] : FLAME[2];
            // (the fuse: the newest of the outer ring, white)
            if (onRing && traced < 1 && traced - round < 0.035) c = WHITE;
          } else if (t < SIGIL.strike[1] + 1e-6) c = WHITE;
          else if (heat > 0.05 && rho <= burnR + 0.05 && hash(X, Y, 6104) < 0.4 + heat) c = heat > 0.6 ? FLAME[3] : heat > 0.3 ? FLAME[2] : FLAME[1];
        }
        // the ring's edge: the enemy's pink, pulsing faster as the eruption comes (steady in its last fifth of a second)
        if (!c && edgeBand && t < 0 && round <= traced) {
          const hz = 3 + 7 * clamp01((t + SIGIL.delay) / SIGIL.delay);
          const on = t > -0.2 || Math.sin(TAU * hz * t) > -0.35;
          if (on) c = PINK[hash(X, Y, 6105) < 0.5 ? 2 : 3];
        }
        if (c) px.set(X, Y, c);
      }
    }
    if (t < 0) lights.push({ x: C.ax, y: C.ay, r: 40 + 50 * R * heat, color: FLAME[3], a: 0.18 + 0.3 * heat * traced });
    else if (burnRadius(t, R) > 0) lights.push({ x: C.ax, y: C.ay, r: 30 + 40 * burnRadius(t, R), color: FLAME[3], a: 0.25 + 0.3 * heat });
    return { px, lights };
  }
  // --- THE AIR ---
  const at = (fx: number, fy: number): [number, number] => {
    const [x, y] = floorPx(fx, fy);
    return [C.ax + x, C.ay + y];
  };
  if (t < 0) {
    // SPARKS rising off the ring as it burns, more as the eruption comes
    const n = Math.round(4 + 26 * heat * traced);
    for (let i = 0; i < n; i++) {
      const life = (t * (0.9 + hash(i, 1, 6201)) + hash(i, 2, 6201)) % 1;
      const a = hash(i, 3, 6201) * TAU;
      const fx = R * Math.cos(a);
      const fy = R * Math.sin(a);
      if (!onSide(fx, fy, side)) continue;
      const [x, y] = at(fx, fy);
      // (only off what of the ring is drawn yet)
      if (roundOf(x - C.ax, y - C.ay) > traced) continue;
      const yy = Math.round(y - 2 - (life < 0 ? life + 1 : life) * (14 + 26 * heat));
      px.set(Math.round(x + Math.sin(life * 7 + i) * 2), yy, life % 1 < 0.4 ? FLAME[4] : life % 1 < 0.75 ? FLAME[3] : FLAME[2]);
    }
    return { px, lights };
  }
  // THE PILLAR: tongues of fire round the ring and through it, standing up as one column
  const tall = t < SIGIL.strike[1] ? PILLAR_TALL * 1.04 : t < SIGIL.pillar ? PILLAR_TALL * (1 + 0.05 * Math.sin(t * 40)) : t < SIGIL.pillar + SIGIL.fall ? PILLAR_TALL * (1 - smooth(SIGIL.pillar, SIGIL.pillar + SIGIL.fall, t) * 0.85) : 0;
  const streak = t < SIGIL.strike[1] - 1e-6;
  if (tall > 0) {
    const ring = 30;
    const inside = 16;
    const all: [number, number, number][] = [];
    for (let i = 0; i < ring; i++) {
      const a = (i / ring) * TAU + 0.1;
      all.push([R * 0.97 * Math.cos(a), R * 0.97 * Math.sin(a), i]);
    }
    for (let i = 0; i < inside; i++) {
      const r = R * Math.sqrt(hash(i, 1, 6301)) * 0.85;
      const a = hash(i, 2, 6301) * TAU;
      all.push([r * Math.cos(a), r * Math.sin(a), 100 + i]);
    }
    // (sorted far to near, so that the nearer stand in front)
    all.sort((p, q) => p[0] + p[1] - (q[0] + q[1]));
    for (const [fx, fy, i] of all) {
      if (!onSide(fx, fy, side)) continue;
      const [x, y] = at(fx, fy);
      const own = 0.72 + 0.28 * hash(i, 4, 6302);
      const flick = 1 + 0.1 * Math.sin(t * 31 + i * 1.7);
      // (the column is tallest at its middle and its back, lower round its near edge, so that it reads as round)
      const h = Math.min(PILLAR_TALL * 1.1, tall * own * flick * (0.8 + 0.2 * clamp01(1 - (fx + fy) / (2 * R))));
      if (streak) {
        // the first frame: a streak shooting up, thin, white at its foot, broken
        for (let k = 0; k < h; k++) if (hash(i, k >> 2, 6303) > 0.2) px.set(Math.round(x), Math.round(y - k), k < h * 0.3 ? WHITE : k < h * 0.7 ? FLAME[4] : FLAME[3]);
        for (let k = 0; k < h * 0.6; k++) if (hash(i, k >> 1, 6304) > 0.5) px.set(Math.round(x) + 1, Math.round(y - k), FLAME[4]);
      } else tongue(px, x, y, h, 11 + 5 * hash(i, 5, 6302), Math.sin(t * 9 + i) * 3, t < SIGIL.pillar ? 1 : 0, i);
    }
    // its heart, white, while it roars
    if (!streak && t < SIGIL.pillar && side !== 'before') tongue(px, C.ax, C.ay + 4, tall * 0.9, R * 34, 0, 1, 7);
    // embers flung out of it
    if (!streak) {
      for (let i = 0; i < 40; i++) {
        const life = clamp01((t - hash(i, 1, 6305) * 0.1) / 0.5);
        if (life <= 0 || life >= 1) continue;
        const a = hash(i, 2, 6305) * TAU;
        const r = R * (0.9 + life * 0.25);
        const fx = r * Math.cos(a);
        const fy = r * Math.sin(a);
        if (!onSide(fx, fy, side)) continue;
        const [x, y] = at(fx, fy);
        const up = 20 + hash(i, 3, 6305) * (tall * 0.8) * (1 - life * 0.3) + life * 30;
        const Y = Math.round(y - up);
        if (Y > 2) px.set(Math.round(x), Y, life < 0.5 ? FLAME[4] : FLAME[2]);
      }
    }
    lights.push({ x: C.ax, y: C.ay - tall * 0.45, r: 60 + tall * 0.5, color: FLAME[3], a: streak ? 0.85 : 0.6 });
  }
  // THE FLOOR BURNING ON: low flames over what still burns, fewer and lower as it shrinks in
  const burnR = burnRadius(t, R);
  if (t > SIGIL.pillar * 0.7 && burnR > 0.02) {
    const n = 56;
    for (let i = 0; i < n; i++) {
      const r = R * Math.sqrt(hash(i, 1, 6401));
      if (r > burnR) continue;
      const a = hash(i, 2, 6401) * TAU;
      const fx = r * Math.cos(a);
      const fy = r * Math.sin(a);
      if (!onSide(fx, fy, side)) continue;
      const [x, y] = at(fx, fy);
      // (each flickers on its own beat; those near the edge of the fire lower: it is going out there)
      const life = 0.6 + 0.4 * Math.sin(t * (7 + 5 * hash(i, 3, 6401)) + i * 2.1);
      const h = (12 + 20 * hash(i, 4, 6401)) * life * clamp01((burnR - r) / 0.35 + 0.3) * (t < SIGIL.pillar + SIGIL.fall ? smooth(SIGIL.pillar * 0.7, SIGIL.pillar + SIGIL.fall, t) : 1);
      tongue(px, x, y, h, 5 + 4 * hash(i, 5, 6401), Math.sin(t * 5 + i) * 2, 0, i);
    }
  }
  return { px, lights };
}

// =============================================================================================
// THE FROST: THE SHADE'S RAKE, COLD, AND THE RIME IT LEAVES

/** THE FROST'S COLOURS: a pale grey-blue (hue 224 to 230), from the shadow in it to its glitter. Never the friend's cyan. */
export const FROST = ['#4e5878', '#7c88aa', '#aab2d2', '#d4d9ee', '#eff1fb'] as const;

/**
 * THE RIME'S NUMBERS. Times are seconds from the Shade's blow (art/new_mobs3.ts SHADE_HIT, 0.5 s into its rake).
 *   radius   the patch, in tiles (round its middle; its edge ragged, from 0.86 to 1 of it). 1.0 to 1.25 drawn and tested.
 *   ahead    its middle, in tiles before the Shade (its claws come down 0.6 tiles before it; the rake reaches 1.1).
 *   form     it spreads out from its middle this long, from the blow.
 *   lie      it lies this long from the blow, then is gone; `melt`, the last part of that, in which it melts from its edge.
 *   slow     whoever stands in it goes this much slower (the rules': a suggestion).
 */
export const RIME = { radius: 1.2, ahead: 1.0, form: 0.2, lie: 4.0, melt: 1.0, slow: 0.4 } as const;
/** The rime's canvas, its anchor the patch's middle. */
export const RIME_CANVAS: Canvas = { w: 132, h: 72, ax: 66, ay: 36 };

/** How far out the rime lies `t` seconds after the blow, in the way `a` (radians on the floor), for a patch of `radius` tiles: ragged, spreading, then melting in. */
export function rimeEdge(t: number, a: number, radius: number = RIME.radius): number {
  if (t < 0 || t > RIME.lie) return 0;
  const rag = 0.86 + 0.06 * Math.sin(3 * a + 1.3) + 0.05 * Math.sin(5 * a + 0.4) + 0.03 * Math.sin(9 * a + 2.2);
  const grow = t < RIME.form ? 1 - (1 - t / RIME.form) ** 2 : 1;
  const melt = t > RIME.lie - RIME.melt ? 1 - 0.55 * smooth(RIME.lie - RIME.melt, RIME.lie, t) : 1;
  return radius * Math.min(1, rag + 0.03) * grow * melt;
}
/** Whether a hero `x`, `y` tiles from the rime's middle is in it (and slowed), `t` seconds after the blow. */
export const rimeHolds = (t: number, x: number, y: number, radius: number = RIME.radius): boolean => {
  const e = rimeEdge(t, Math.atan2(y, x), radius);
  return e > 0 && Math.hypot(x, y) <= e;
};

/**
 * THE RIME `t` seconds after the Shade's blow, for a patch of `radius` tiles: a crust of frost on the floor, darker at its
 * very edge, feathered with crystals running out from its middle, glittering; spreading out in a fifth of a second; at last
 * melting in from its edge, broken up, gone. It lies flat: laid under the figures.
 */
export function rimePainted(t: number, radius: number = RIME.radius): Painted {
  const C = RIME_CANVAS;
  const px = new Px(C.w, C.h);
  const lights: Light[] = [];
  if (t < 0 || t > RIME.lie) return { px, lights };
  const f = Math.floor(t * 30 + 1e-6);
  const melting = smooth(RIME.lie - RIME.melt, RIME.lie, t);
  // the feathers: crystals running out from the middle, each with barbs (tiles, as segments)
  const feathers: [number, number, number, number][] = [];
  for (let i = 0; i < 11; i++) {
    const a = (i / 11) * TAU + hash(i, 1, 7101) * 0.4;
    const l = radius * (0.55 + 0.35 * hash(i, 2, 7101));
    const ca = Math.cos(a);
    const sa = Math.sin(a);
    feathers.push([ca * 0.12, sa * 0.12, ca * l, sa * l]);
    for (const k of [0.4, 0.6, 0.8]) {
      const bx = ca * l * k;
      const by = sa * l * k;
      for (const s of [-1, 1]) feathers.push([bx, by, bx + Math.cos(a + s * 0.6) * l * 0.16, by + Math.sin(a + s * 0.6) * l * 0.16]);
    }
  }
  for (let Y = 0; Y < C.h; Y++) {
    for (let X = 0; X < C.w; X++) {
      const sx = X + 0.5 - C.ax;
      const sy = Y + 0.5 - C.ay;
      const [fx, fy] = floorOf(sx, sy);
      const rho = Math.hypot(fx, fy);
      const e = rimeEdge(t, Math.atan2(fy, fx), radius);
      if (rho > e) continue;
      const h = hash(X, Y, 7102);
      // (melting: it breaks up from the edge in)
      if (melting > 0 && h < melting * (0.4 + 0.6 * (rho / Math.max(0.01, e)))) continue;
      let c: string = h < 0.55 ? FROST[2] : h < 0.85 ? FROST[1] : FROST[3];
      if (rho > e - 0.06) c = FROST[0];
      else if (rho > e - 0.13) c = h < 0.5 ? FROST[1] : FROST[2];
      let feather = false;
      for (const s of feathers) if (segDist(fx, fy, s) < 0.028) feather = true;
      if (feather && rho < e - 0.06) c = FROST[3];
      // glitter: a crystal catching the light, a frame or two at a time
      if (rho < e - 0.08 && hash(X, Y, 7103 + (f >> 1)) < 0.025) c = FROST[4];
      // (and a fleck of the enemy's pink, here and there in its edge: its cold is the Shade's)
      if (rho > e - 0.06 && hash(X, Y, 7104) < 0.07) c = PINK[1];
      px.set(X, Y, c);
    }
  }
  lights.push({ x: C.ax, y: C.ay, r: 36 * radius, color: FROST[3], a: 0.12 * (1 - melting) });
  return { px, lights };
}

/** THE SWITCH for the Shade's frost (and its rime): while it is off, the game's Shade is as it is (the game makes it, art/bestiary.ts, without this file). */
export const SHADE_FROST = { on: false };

/** A claw's tip: from the hand on along the forearm (the figure's own lengths), as the Shade's own streak follows it. */
const clawOf = (hand: V3, elbow: V3): V3 => add(hand, mul(norm(sub(hand, elbow)), 3.2));

/**
 * THE COLD ON THE SHADE, at a moment of its rake (nothing at any other: its hover, its glide, its death are the game's own).
 * Its claws GATHER FROST as it raises them (crystals at their tips, a pale glow), and the cold FALLS OFF THEM like breath,
 * drifting down and spreading as it goes; as it rakes, frost streaks with its claws, beside its own pale streaks, and bursts
 * off them; after, the cold drifts down off them and is gone by the rake's end.
 */
export function frostBits(st: Stage, m: Moment): Bit[] {
  const bits: Bit[] = [];
  if (m.move !== SHADE.attack.name) return bits;
  void st;
  const t = m.t;
  const s = m.s;
  const gather = t < SHADE_HIT ? clamp01(t / 0.17) : Math.max(0, 1 - (t - SHADE_HIT) / 0.32);
  if (gather <= 0.01) return bits;
  const claws: V3[] = [clawOf(s.handL, s.elbowL), clawOf(s.handR, s.elbowR)];
  claws.forEach((c, side) => {
    // the crystals on the tip (while raised and held, and as it rakes)
    if (t < SHADE_HIT + 0.12) {
      for (let i = 0; i < 8; i++) {
        if (hash(i, side, 7201) > gather) continue;
        const p: V3 = add(c, [(hash(i, 1, 7202 + side) - 0.5) * 5, (hash(i, 2, 7202 + side) - 0.5) * 5, (hash(i, 3, 7202 + side) - 0.5) * 5]);
        bits.push({ part: 'frost', piece: 'frost', shape: { k: 'mote', p, c: i < 3 ? FROST[4] : FROST[3], size: i < 2 ? 2 : 1 } });
      }
      bits.push({ part: 'frost', piece: 'frost', shape: { k: 'glow', p: c, c: FROST[3], r: 6 + 5 * gather, a: 0.35 * gather } });
    }
    // the breath of cold: falling off the claw, spreading, fading
    const n = Math.round(22 * gather);
    for (let i = 0; i < n; i++) {
      const life = (t * 1.7 + hash(i, side, 7203)) % 1;
      const drift: V3 = [(hash(i, 4, 7203) - 0.5) * 10 * life, (hash(i, 5, 7203) - 0.5) * 10 * life, -life * 22];
      const p = add(c, drift);
      if (p[2] < 1) continue;
      bits.push({ part: 'frost', piece: 'frost', shape: { k: 'mote', p, c: life < 0.3 ? FROST[4] : life < 0.6 ? FROST[3] : FROST[2], size: life < 0.5 ? 2 : 1 } });
    }
  });
  // as it rakes: frost streaking with its claws (beside its own pale streaks), and bursting off them
  if (m.blur) {
    for (const trail of [m.trailL, m.trailR]) {
      if (!trail) continue;
      for (let i = 1; i < trail.length; i++) {
        const a = trail[i - 1];
        const b = trail[i];
        for (let j = 0; j < 3; j++) {
          const p = add(add(a, mul(sub(b, a), j / 3)), [0, 0, 2.4]);
          bits.push({ part: 'frost', piece: 'frost', shape: { k: 'mote', p, c: i < trail.length / 2 ? FROST[4] : FROST[3], size: 1 } });
        }
      }
    }
  }
  if (t >= SHADE_HIT && t < SHADE_HIT + 0.2) {
    const k = (t - SHADE_HIT) / 0.2;
    for (const c of claws) {
      for (let i = 0; i < 8; i++) {
        const a = hash(i, 1, 7204) * TAU;
        const p: V3 = add(c, [Math.cos(a) * (2 + 9 * k), Math.sin(a) * (2 + 9 * k), -k * 8 + (hash(i, 2, 7204) - 0.5) * 4]);
        if (p[2] < 1) continue;
        bits.push({ part: 'frost', piece: 'frost', shape: { k: 'mote', p, c: k < 0.5 ? FROST[4] : FROST[2], size: k < 0.4 ? 2 : 1 } });
      }
    }
  }
  return bits;
}

/** THE SHADE, COLD: the game's Shade (its every move as the game has it), with the frost on its claws in its rake. */
export const FROST_SHADE: Mob = { ...SHADE, bits: (st, m) => [...SHADE.bits(st, m), ...frostBits(st, m)] };
/** The cold Shade as the game holds a monster (as art/new_mobs3.ts makeShadeArt3). */
export function makeFrostShadeArt(pace = SHADE.pace): ActorArt {
  return { front: mobSet(FROST_SHADE, 'front', pace), back: mobSet(FROST_SHADE, 'back', pace) };
}
void INK;
