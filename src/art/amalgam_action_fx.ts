// THE OSSUARY AMALGAMATION'S MOVES DONE THE ACTION WAY: WHAT THEY DO TO THE FLOOR (the art chat's helper, 1 Nov 2026;
// docs/mockups/action_f4_amalgam/README.md). A MOCK-UP: NOTHING OF THE GAME IMPORTS THIS FILE. Its moves themselves:
// art/amalgam_action.ts (AMALGAM_ACTION, off).
//
//   THE BONE RAIN   his pick, 31 Oct, in place of the skull swarm: as it slams down, the ossuary's walls shed the skulls in their
//                   niches over the whole floor, in three waves; each skull's SHADOW on the floor first, growing and darkening as
//                   it comes down, the reach of its burst ringed in the enemy's pink; it BURSTS where it lands (bone flying, a band
//                   of bone dust out to its reach); and (the second round, his word of 1 Nov) its bones then pull together into A
//                   BONE MITE (art/amalgam_mites.ts), in place of the first round's pile that slowed you.
//   THE ARMS        the arms of the dead out of the floor, more than before and bigger: four to a hole, half as big again.
//   THE SLAM'S RING its weight landing: a shockwave out over the floor round where its hands come down, the floor cracking (the
//                   Chained One's ring, art/chained_action_fx.ts, at its own sizes).
// Each is a picture of a moment, on a canvas of its own with the floor point it stands on (its anchor), in picture pixels (two to
// a game pixel), as the figures are; the floor layer goes under the figures, the air layer by halves (`behind` before a figure at
// its anchor, `before` after it). Every pixel is whole. Nothing is of the friend's cyan: bone, the floor's dust, the enemy's pink
// and fire, and white.

import { Px } from '../engine/px';
import type { Light, Sprite } from '../engine/px';
import { AM_KIT, OSS } from './bosses3';
import { BONE, INK, PINK, hash, lazyFrames, toSprite } from './kit';
import type { Painted } from './kit';
import { ENEMY_RIM, FLAME, SOCKET } from './mkit';
import type { Canvas } from './mkit';
import { TILE3, eyesOf, faceAlong, paintBits, skull, sphere } from './new_mobs3';
import type { Bit, Put } from './new_mobs3';
import { stage } from './skin';
import type { GameView, Stage } from './skin';
import { add, cross, mul, norm, sub } from './skeleton';
import type { V3 } from './skeleton';
import { floorPx } from './action_f1_fx';
import { RING, ringCanvas, ringPainted } from './chained_action_fx';
import { ACT_CANVAS, RAIN_HIT, RAKES, rakePath } from './amalgam_action';
import { project } from './skeleton';

const clamp01 = (v: number): number => (v < 0 ? 0 : v > 1 ? 1 : v);
const smooth = (u: number): number => {
  const k = clamp01(u);
  return k * k * (3 - 2 * k);
};
const TAU = Math.PI * 2;
const D = Math.PI / 180;
const WHITE = '#fff8ec';
const SEAM = '#0b0a11';
const K = AM_KIT;
export type Side = 'behind' | 'before' | 'all';

// =============================================================================================
// THE BONE RAIN

/**
 * THE BONE RAIN'S NUMBERS (seconds from the slam, RAIN_HIT; tiles).
 *   waves, first, gap   three waves: the first wave's skulls leave their niches 0.15 s after the slam, each wave 0.6 s after the
 *                       one before (each skull of a wave up to `ripple` later, so that a wave comes down as a ripple, not at once)
 *   fly                 1.0 s from its niche to the floor: its shadow is on the floor all that while (the warning)
 *   spacing             the skulls of all three waves lie on a lattice of triangles this far apart over the whole floor; each wave
 *                       is every third point of it, so that between a wave's skulls are gaps, and where the wave before burst
 *                       nothing more comes down
 *   r                   a hero within this of where a skull lands is struck as it bursts
 *   edge, clear         no skull nearer the wall than `edge`, nor nearer its middle than `clear` (it is not to land on itself)
 *   mite                what it leaves (the second round): a bone mite, pulling itself together out of its bones from `at` seconds
 *                       after it lands (art/amalgam_mites.ts MITE.form long); the scuff where it struck lies `scuff` seconds
 *   high                how high over the floor it falls from, as it comes in over the floor (game pixels)
 */
export const RAIN = {
  waves: 3, first: 0.15, gap: 0.6, ripple: 0.12, fly: 1.0, spacing: 2.1, r: 0.9, edge: 0.9, clear: 1.8,
  mite: { at: 0.05, scuff: 1.2 },
  high: 150,
} as const;
/** A skull of the rain: where it lands (tiles from the arena's middle), its wave, when it leaves its niche and when it lands (seconds from the slam), the niche it falls from (on the wall, tiles from the middle), and its own number. */
export interface Drop {
  at: [number, number];
  wave: number;
  leave: number;
  land: number;
  from: [number, number];
  seed: number;
}
/**
 * WHERE THE SKULLS COME DOWN over an arena (an ellipse `rx` by `ry` tiles along the floor's two ways), it at `boss` (tiles from the
 * middle): every point of the lattice inside the floor (not within `edge` of the wall, nor within `clear` of it), each wave every
 * third point of it; each falling from the niche on the wall nearest it.
 */
export function rainDrops(arena: { rx: number; ry: number } = { rx: 8.5, ry: 10 }, boss: readonly [number, number] = [0, 0]): Drop[] {
  const out: Drop[] = [];
  const d = RAIN.spacing;
  const h = (d * Math.sqrt(3)) / 2;
  const n = Math.ceil(Math.max(arena.rx, arena.ry) / h) + 2;
  for (let j = -n; j <= n; j++) {
    for (let i = -n; i <= n; i++) {
      const x = i * d + j * d * 0.5;
      const y = j * h;
      const e = Math.hypot(x / arena.rx, y / arena.ry);
      // (how far in from the wall, near enough: along its way out from the middle)
      const toWall = (1 - e) * Math.hypot(x, y) / Math.max(e, 1e-6);
      if (e >= 1 || (e > 0.3 && toWall < RAIN.edge)) continue;
      if (Math.hypot(x - boss[0], y - boss[1]) < RAIN.clear) continue;
      const wave = (((i - j) % 3) + 3) % 3;
      const seed = out.length;
      const leave = RAIN.first + RAIN.gap * wave + RAIN.ripple * hash(i + 40, j + 40, 1301);
      const a = Math.atan2(y / arena.ry, x / arena.rx) + (hash(i + 40, j + 40, 1303) - 0.5) * 0.3;
      out.push({ at: [x, y], wave, leave, land: leave + RAIN.fly, from: [Math.cos(a) * arena.rx, Math.sin(a) * arena.ry], seed });
    }
  }
  return out;
}
/** Whether a skull bursting strikes a hero at (x, y) tiles from where it lands. */
export const rainStrikes = (x: number, y: number): boolean => Math.hypot(x, y) <= RAIN.r;
/**
 * A SKULL OF THE RAIN IN THE AIR, `u` (0 to 1) of the way from its niche to where it lands: where it is (tiles from the arena's
 * middle, and how high, game pixels). It is thrown out of the niche and in over the floor high, and comes down steep at the last,
 * onto its shadow.
 */
export function dropAt(d: Drop, u: number): [number, number, number] {
  const k = clamp01(u);
  const g = 1 - (1 - k) ** 2.2;
  const x = d.from[0] + (d.at[0] - d.from[0]) * g;
  const y = d.from[1] + (d.at[1] - d.from[1]) * g;
  const z = 46 * (1 - k) + RAIN.high * Math.sin(Math.PI * Math.min(1, k * 0.62 + 0.38 * k * k)) * (1 - k) + 300 * k * (1 - k) * (1 - k);
  return [x, y, Math.max(0, z)];
}

/** A skull of the rain in the air, on its own canvas: big, tumbling, its eyes burning with the enemy's pink, a streak of dust and fire behind it as it falls; its middle on the anchor. `k` of the way round its tumble. */
export const RAIN_SKULL_CANVAS: Canvas = { w: 60, h: 92, ax: 30, ay: 64 };
export const RAIN_SKULL_FRAMES = 8;
export const RAIN_SKULL_R = 7.4;
export function rainSkullPainted(k: number, view: GameView = 'front'): Painted {
  const C = RAIN_SKULL_CANVAS;
  const st = stage(view, C.ax, C.ay, C);
  const bits: Bit[] = [];
  const put: Put = (part, piece, shape) => {
    bits.push({ part, piece, shape });
  };
  // (rolling over and over as it falls, its face to you all the while, a little down: it comes face first)
  const spin = k * TAU;
  const fwd: V3 = norm(add(st.eye, [0, 0, -0.75]));
  const s0 = norm(cross([0, 0, 1], fwd));
  const u0 = norm(cross(fwd, s0));
  const up = norm(add(mul(u0, Math.cos(spin)), mul(s0, Math.sin(spin))));
  const look = faceAlong(fwd, up);
  const r = RAIN_SKULL_R;
  skull(st, put, 'skull', 'skull', [0, 0, 0], look, [r, r * 0.9, r * 0.92], OSS, eyesOf(st, look), 1, Math.floor(k * RAIN_SKULL_FRAMES) % 2 === 0, 3);
  // (the streak behind it as it falls: up over it, dust and the enemy's fire)
  for (let j = 0; j < 22; j++) {
    for (const side of [-1, 1]) {
      const w = side * (1.2 + 0.09 * j) + Math.sin(j * 1.3 + k * TAU * 2 + side) * (0.5 + j * 0.06);
      if (j > 8 && hash(j, side + 2, 1351 + Math.floor(k * 8)) < (j - 8) / 16) continue;
      put('tail', 'tail', { k: 'mote', p: [w * 0.7, -w * 0.7, r * 0.8 + j * 1.5], c: j < 3 ? FLAME[3] : j < 7 ? FLAME[2] : j < 12 ? PINK[1] : '#4a4266', size: j < 8 ? 2 : 1 });
    }
  }
  put('skull', 'skull', { k: 'glow', p: [0, 0, 0], c: '#ff3a78', r: 9, a: 0.3 });
  const lights = paintBits(st, bits, [0, 0, 0]);
  return { px: st.whole(ENEMY_RIM), lights };
}
export function makeRainSkullArt(view: GameView = 'front'): Sprite[] {
  return lazyFrames(RAIN_SKULL_FRAMES, (i) => toSprite(rainSkullPainted(i / RAIN_SKULL_FRAMES, view), null, RAIN_SKULL_CANVAS.ax, RAIN_SKULL_CANVAS.ay));
}

/** The canvas of what a skull does where it lands: its shadow and mark, its burst, its pile. Its anchor is where it lands. */
export const DROP_CANVAS: Canvas = { w: 132, h: 112, ax: 66, ay: 74 };
const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
/** Whole pixels, each laid once (only where nothing is, if `under`). */
function pen(px: Px, under = false): (x: number, y: number, c: string) => void {
  return (x, y, c) => {
    const X = Math.round(x);
    const Y = Math.round(y);
    if (X < 1 || Y < 1 || X >= px.w - 1 || Y >= px.h - 1) return;
    if (under && px.d[(Y * px.w + X) * 4 + 3] !== 0) return;
    px.set(X, Y, c);
  };
}
function blob(dot: (x: number, y: number, c: string) => void, x: number, y: number, r: number, c: string, thin = 0, seed = 0): void {
  for (let j = -Math.ceil(r); j <= Math.ceil(r); j++) {
    for (let i = -Math.ceil(r); i <= Math.ceil(r); i++) {
      if (i * i + j * j > r * r + 0.3) continue;
      if (thin > 0 && hash(Math.round(x) + i, Math.round(y) + j, seed) < thin) continue;
      dot(x + i, y + j, c);
    }
  }
}
/**
 * WHAT A SKULL OF THE RAIN DOES WHERE IT LANDS, `t` seconds after it lands (the anchor). Before it lands (`t` from -RAIN.fly to 0):
 * on the floor, ITS SHADOW, small and faint as it leaves its niche, growing and darkening as it comes down, and THE REACH OF ITS
 * BURST ringed round it in the enemy's pink, filling in. As it lands and after:
 *   floor   the scuff where it struck, fading by RAIN.mite.scuff; a band of bone dust going out to its reach in a tenth of a second
 *           and more, the enemy's pink at its leading edge (its bones are the bone mite's, art/amalgam_mites.ts `form`)
 *   air     the flash (white, the enemy's gold and pink); bits of skull and teeth flung up and out, falling; a puff of bone dust
 * The air by halves (`side`): 'behind' before a figure where it lands, 'before' after it.
 */
export function dropPainted(t: number, layer: 'floor' | 'air', seed: number, side: Side = 'all', view: GameView = 'front'): Painted {
  const C = DROP_CANVAS;
  const lights: Light[] = [];
  if (t < -RAIN.fly - 1e-6 || t > RAIN.mite.scuff + 1e-6) return { px: new Px(C.w, C.h), lights };
  const px = new Px(C.w, C.h);
  void view;
  const at = (x: number, y: number): [number, number] => {
    const [X, Y] = floorPx(x, y);
    return [C.ax + X, C.ay + Y];
  };
  const R = RAIN.r;
  const fr = Math.floor(t * 30 + 1e-6);
  if (layer === 'floor') {
    const dot = pen(px, true);
    if (t < 0) {
      // ITS SHADOW, growing and darkening as it comes down
      const k = clamp01(1 + t / RAIN.fly);
      const rx = 7 + 20 * k * k;
      const ry = rx * 0.5;
      const thick = 0.25 + 0.7 * k;
      for (let y = -Math.ceil(ry); y <= Math.ceil(ry); y++) {
        for (let x = -Math.ceil(rx); x <= Math.ceil(rx); x++) {
          const e = (x / rx) ** 2 + (y / ry) ** 2;
          if (e > 1) continue;
          const X = C.ax + x;
          const Y = C.ay + y;
          if (BAYER[(Y & 3) * 4 + (X & 3)] / 16 < thick * (e > 0.65 ? 0.6 : 1)) dot(X, Y, INK);
        }
      }
      // THE REACH OF ITS BURST, a ring of the enemy's pink dashes, filling in as it comes down
      const n = Math.round(R * 110);
      for (let i = 0; i < n; i++) {
        const dash = i % 5;
        if (dash >= 1 + Math.round(3 * k)) continue;
        const a = (i / n) * TAU + k * 0.5;
        const [x, y] = at(Math.cos(a) * R, Math.sin(a) * R);
        dot(x, y, k > 0.7 && dash === 0 ? PINK[3] : PINK[2]);
        dot(x, y + 1, PINK[0]);
      }
      return { px, lights };
    }
    // the scuff where it struck
    const scuff = 1 - clamp01((t - 0.6) / (RAIN.mite.scuff - 0.6));
    if (scuff > 0) for (let j = -4; j <= 4; j++) for (let i = -9; i <= 9; i++) if ((i / 9) ** 2 + (j / 4) ** 2 < 0.7 && hash(i, j, 1325 + seed) < scuff * 0.7) dot(C.ax + i, C.ay + j, SEAM);
    // the band of bone dust going out to its reach, the enemy's pink at its leading edge
    const wave = 0.12;
    const reach = R * (1 - (1 - clamp01(t / wave)) ** 3);
    const left = 1 - clamp01((t - wave) / 0.25);
    if (left > 0) {
      const n = Math.round(R * 70);
      for (let k = 0; k < n; k++) {
        const a = (k / n) * TAU;
        if (t <= wave + 0.06 && k % 2 === 0) {
          const [x, y] = at(Math.cos(a) * reach, Math.sin(a) * reach);
          dot(x, y, PINK[3]);
        }
        for (let b = 0; b < 3; b++) {
          const r = reach - 0.35 * R * (b / 3) * (0.6 + 0.4 * hash(k, b, 1327));
          if (r < 0.15 || hash(k, b + fr * 7, 1329) > left * (1 - b * 0.22)) continue;
          const [x, y] = at(Math.cos(a) * r, Math.sin(a) * r);
          dot(x, y, b === 0 ? BONE[2] : BONE[1]);
        }
      }
    }
    return { px, lights };
  }
  // --- the air ---
  const dot = pen(px, false);
  const under = pen(px, true);
  if (t < 0) return { px, lights };
  const onSide = (y: number): boolean => side === 'all' || (y > C.ay) === (side === 'before');
  // the flash
  if (t < 0.08 && side !== 'behind') {
    const k = 1 - t / 0.08;
    const L = 8 + 12 * k;
    for (const [dx, dy] of [[1, 0], [-1, 0], [0.5, -1], [-0.5, -1], [0.85, -0.5], [-0.85, -0.5], [0, -1]] as const) {
      for (let s = 0; s < L; s++) dot(C.ax + dx * s, C.ay - 6 + dy * s * 0.9, s < L * 0.35 ? WHITE : s < L * 0.7 ? FLAME[4] : PINK[3]);
    }
    blob(dot, C.ax, C.ay - 6, 2 + 3 * k, WHITE);
    lights.push({ x: C.ax, y: C.ay - 8, r: 44 + 30 * k, color: SOCKET, a: 0.32 * k });
  }
  // bits of skull and teeth flung up and out, falling
  for (let k = 0; k < 18; k++) {
    const life = 0.28 + 0.22 * hash(k, 1, 1331 + seed);
    if (t > life) continue;
    const a = (k / 18) * TAU + hash(k, 2, 1331 + seed);
    const out = R * (0.3 + 0.7 * hash(k, 3, 1331)) * (t / life);
    const [x, y] = at(Math.cos(a) * out, Math.sin(a) * out);
    if (!onSide(y)) continue;
    const up = (14 + 22 * hash(k, 4, 1331)) * 4 * (t / life) * (1 - t / life) + 3 * (1 - t / life);
    dot(x, y - up, k % 3 ? BONE[3] : BONE[4]);
    if (k % 3 === 0) {
      dot(x + 1, y - up, BONE[2]);
      dot(x, y - up + 1, BONE[1]);
    }
  }
  // the puff of bone dust, settling (behind the bits)
  const settle = 1 - clamp01((t - 0.06) / 0.7);
  if (settle > 0) {
    for (let k = 0; k < 18; k++) {
      const a = hash(k, 1, 1333 + seed) * TAU;
      const r = (0.1 + 0.55 * hash(k, 2, 1333)) * R * Math.min(1, 0.4 + t / 0.2);
      const [x, y] = at(Math.cos(a) * r, Math.sin(a) * r);
      if (!onSide(y)) continue;
      blob(under, x, y - 3 - 9 * hash(k, 3, 1333), 1.4 + 1.8 * hash(k, 4, 1333), k % 3 ? '#6a6488' : BONE[1], 0.55 + 0.4 * (1 - settle), k);
    }
  }
  return { px, lights };
}

// =============================================================================================
// THE ARMS OF THE DEAD OUT OF THE FLOOR, BIGGER, AND MORE OF THEM

/**
 * THE FLOOR ARMS' NUMBERS (seconds from the slam, ARMS_HIT; tiles): `n` holes, the first under the hero, the others round where he
 * stood between `near` and `far`; each bursting up `first` to `last` after the slam, its crack glowing `warn` before; a hero within
 * `r` of one as it comes up (`up` after it begins) is struck. Half as big again as the game's (`big`), four arms to a hole.
 * (The game's: five, 1.2 to 2.8 tiles, 0.55 to 1.0 s, warned 0.5 s, 0.62 round.)
 */
export const ARMS = { n: 8, near: 1.4, far: 3.2, first: 0.5, last: 1.1, warn: 0.6, up: 0.12, r: 0.9, big: 1.5 } as const;
export const BIG_ARM_CANVAS: Canvas = { w: 160, h: 176, ax: 80, ay: 128 };
export const BIG_ARM_FPS = 10;
export const BIG_ARM_FRAMES = 13;
export const BIG_ARM_TIME = BIG_ARM_FRAMES / BIG_ARM_FPS;
const BIG_ARM_UP = 0.15;
const BIG_ARM_SINK = 1.0;
const BIG_ARMS: ReadonlyArray<{ deg: number; a: number; b: number; r: number; lean: number }> = [
  { deg: -20, a: 12, b: 12, r: 2.4, lean: 0.12 },
  { deg: 70, a: 10.5, b: 10.5, r: 2.2, lean: 0.4 },
  { deg: 160, a: 11, b: 11, r: 2.3, lean: 0.35 },
  { deg: 250, a: 9.5, b: 9.5, r: 2.1, lean: 0.5 },
];
/**
 * A HOLE OF ARMS OF THE DEAD, `t` seconds after they begin to burst out (as the game's, art/bosses3.ts paintFloorArms, half as big
 * again, four arms): the floor bursts open, its stone flung up, the arms thrust up out of the dark, clawing; they grab at the air a
 * while, swaying; then they sink back down into it, closing, and the broken stone settles back. The hole on the anchor.
 */
export function bigArmsPainted(t: number, view: GameView = 'front'): Painted {
  const C = BIG_ARM_CANVAS;
  const S = ARMS.big;
  const st = stage(view, C.ax, C.ay, C);
  const bits: Bit[] = [];
  const put: Put = (part, piece, shape) => {
    bits.push({ part, piece, shape });
  };
  const up: V3 = [0, 0, 1];
  const out = t < BIG_ARM_UP ? 1 - (1 - t / BIG_ARM_UP) ** 2 : t < BIG_ARM_SINK ? 1 : 1 - smooth((t - BIG_ARM_SINK) / (BIG_ARM_TIME - 0.12 - BIG_ARM_SINK));
  const open = t < BIG_ARM_SINK ? 1 : 1 - smooth((t - BIG_ARM_SINK) / (BIG_ARM_TIME + 0.05 - BIG_ARM_SINK));
  const hr = 7.5 * S * open;
  if (open > 0.12) put('hole', 'hole', {
    k: 'ball',
    c: [0, 0, 0.15],
    ax: [[hr, 0, 0], [0, hr * 0.9, 0], [0, 0, 0.15]],
    skin: (u) => {
      const r = Math.hypot(u[0], u[1]);
      return r < 0.4 ? FLAME[0] : r < 0.62 ? '#2a0a26' : INK;
    },
  });
  if (open > 0.3) put('hole', 'hole', { k: 'glow', p: [0, 0, 1], c: '#ff3a78', r: 14 * open, a: 0.38 * out });
  for (let j = 0; j < 9; j++) {
    const th = (j / 9) * TAU + hash(j, 1, 1341) * 0.5;
    const rad: V3 = [Math.cos(th), Math.sin(th), 0];
    const tan: V3 = [-Math.sin(th), Math.cos(th), 0];
    const vz = 34 + 34 * hash(j, 2, 1341);
    const fl = (2 * vz) / 260;
    const tt = Math.min(t, fl);
    const z = Math.max(0, vz * tt - 130 * tt * tt);
    const tip = (t < fl ? 50 : 30 * (1 - smooth((t - BIG_ARM_SINK) / 0.4))) * D * (0.6 + 0.4 * hash(j, 3, 1341));
    const r0 = hr + 3.6 * S + 7 * tt;
    const c: V3 = add(mul(rad, r0), [0, 0, 1.0 + z]);
    const radU = add(mul(rad, Math.cos(tip)), mul(up, Math.sin(tip)));
    const upU = add(mul(rad, -Math.sin(tip)), mul(up, Math.cos(tip)));
    const big = (3 + 1.6 * hash(j, 4, 1341)) * S * Math.sqrt(Math.max(0, open));
    if (big < 1.4) continue;
    put(`slab${j}`, `slab${j}`, { k: 'ball', c: [c[0], c[1], c[2] * open], ax: [mul(radU, big * 0.8), mul(tan, big), mul(upU, 1.3)], skin: K.FLOOR_STONE });
  }
  if (out > 0.35) {
    BIG_ARMS.forEach((A, k) => {
      const th = A.deg * D;
      const o: V3 = [Math.cos(th), Math.sin(th), 0];
      const side: V3 = [-o[1], o[0], 0];
      const base: V3 = [o[0] * 3.2 * S, o[1] * 3.2 * S, 0.4];
      const sway = t < BIG_ARM_SINK ? Math.sin(t * 7 + k * 2.1) * 0.3 * clamp01((t - 0.1) / 0.2) : 0;
      const d1 = norm(add(add(mul(o, A.lean), up), mul(side, sway * 0.6)));
      const el = add(base, mul(d1, A.a * S * out));
      const d2 = norm(add(add(mul(o, A.lean + 0.5), mul(up, 0.75)), mul(side, sway)));
      const hand = add(el, mul(d2, A.b * S * out));
      const grab = t < BIG_ARM_UP + 0.1 ? 1 : t < BIG_ARM_SINK ? 0.5 + 0.45 * Math.sin(t * 11 + k * 2.3) : 0.15;
      const part = `fa${k}`;
      const r = A.r * S;
      put(part, part, { k: 'rod', a: base, b: el, ra: r, rb: r * 0.85, ramp: K.DEEP_OSS, far: true });
      put(part, part, { k: 'ball', c: el, ax: sphere(r * 1.15), skin: OSS, far: true });
      const fd = norm(sub(hand, el), up);
      const sd = norm(cross(fd, up), side);
      for (const q of [-1, 1]) put(part, part, { k: 'rod', a: add(el, mul(sd, q * r * 0.4)), b: add(hand, mul(sd, q * r * 0.3)), ra: r * 0.5, rb: r * 0.42, ramp: OSS, far: true });
      K.deadHand(put, part, hand, fd, sd, r * 0.95, grab, OSS);
    });
  }
  const lights = paintBits(st, bits, [0, 0, 6]);
  return { px: st.whole(ENEMY_RIM), lights };
}
export function makeBigArmArt(view: GameView = 'front'): Sprite[] {
  return lazyFrames(BIG_ARM_FRAMES, (i) => toSprite(bigArmsPainted(i / BIG_ARM_FPS, view), null, BIG_ARM_CANVAS.ax, BIG_ARM_CANVAS.ay));
}

// =============================================================================================
// THE SLAM'S RING

/**
 * WHERE ITS WEIGHT LANDS: a shockwave ring (art/chained_action_fx.ts `ringPainted`) round the middle of where its front hands come
 * down (`ahead` tiles before it), `radius` tiles: the swipe's finisher, the bone rain's slam, the floor arms' slam. A hero within
 * the finisher's ring as it goes out is struck (the bone rain's and the floor arms' are their weight shaking the floor: what
 * strikes there is the skulls and the arms).
 */
export const SLAM_RING = { ahead: 1.71, finisher: 2.6, rain: 3.2, arms: 2.8, long: RING.long } as const;
export const slamRingCanvas = (radius: number): Canvas => ringCanvas(radius);
export function slamRingPainted(t: number, layer: 'floor' | 'air', radius: number, side: Side = 'all', seed = 61): Painted {
  return ringPainted(t, layer, radius, side, seed);
}
/** Seconds into the bone rain at which each skull lands (for the film: RAIN_HIT plus its own landing). */
export const rainLandsAt = (d: Drop): number => RAIN_HIT + d.land;

// =============================================================================================
// THE RAKES' GOUGES: its claws ripped across the floor

/**
 * WHERE A RAKE'S CLAWS TORE THE FLOOR (the figure's own lengths from its middle as the move began, on the floor): four gouges along
 * the way its hand went where it came down low, `apart` lengths apart across it. They lie `lie` seconds after the rake lands,
 * glowing with the enemy's fire at first (`hot`), and fade over `fade`.
 */
export const RAKE_GOUGE = { apart: 5, low: 16, lie: 1.6, fade: 0.5, hot: 0.35 } as const;
export function rakeGouges(i: number): V3[][] {
  const way = rakePath(i).filter((p) => p[2] < RAKE_GOUGE.low);
  const out: V3[][] = [[], [], [], []];
  for (let k = 0; k < way.length; k++) {
    const p = way[k];
    const o = norm([p[0], p[1], 0], [1, 0, 0]);
    for (let c = 0; c < 4; c++) {
      const r = (c - 1.5) * RAKE_GOUGE.apart + 6;
      out[c].push([p[0] + o[0] * r, p[1] + o[1] * r, 0]);
    }
  }
  return out;
}
const GOUGES = new Map<number, V3[][]>();
/** A RAKE'S GOUGES IN THE FLOOR, `since` seconds after it lands, on a canvas as its own (ACT_CANVAS, its floor point the anchor): torn deep and dark, their lips broken up pale, glowing with the enemy's fire at first; chips of bone lying along them; fading. */
export function rakeFloorPainted(since: number, i: number, view: GameView = 'front'): Painted {
  const C = ACT_CANVAS;
  const px = new Px(C.w, C.h);
  const lights: Light[] = [];
  if (since < 0 || since > RAKE_GOUGE.lie + RAKE_GOUGE.fade) return { px, lights };
  if (!GOUGES.has(i)) GOUGES.set(i, rakeGouges(i));
  const lines = GOUGES.get(i) as V3[][];
  const dot = pen(px, false);
  const under = pen(px, true);
  const fade = 1 - clamp01((since - RAKE_GOUGE.lie) / RAKE_GOUGE.fade);
  const hot = 1 - clamp01(since / RAKE_GOUGE.hot);
  const at = (p: V3): [number, number] => {
    const q = project(p, view);
    return [C.ax + q[0], C.ay + q[1]];
  };
  lines.forEach((line, c) => {
    for (let k = 1; k < line.length; k++) {
      const [x0, y0] = at(line[k - 1]);
      const [x1, y1] = at(line[k]);
      const n = Math.max(1, Math.ceil(Math.hypot(x1 - x0, y1 - y0)));
      // (deepest in its middle, thinning to its ends)
      const mid = Math.sin(Math.PI * (k / line.length));
      for (let j = 0; j < n; j++) {
        const u = j / n;
        const x = x0 + (x1 - x0) * u;
        const y = y0 + (y1 - y0) * u;
        if (hash(Math.round(x), Math.round(y), 2201 + c) > fade * (0.6 + 0.4 * mid) + 0.05) continue;
        dot(x, y, hot > 0.3 && mid > 0.3 ? (hot > 0.7 ? PINK[3] : PINK[2]) : INK);
        if (mid > 0.45) dot(x, y + 1, hot > 0.5 ? FLAME[1] : SEAM);
        under(x, y - 1, hash(Math.round(x), c, 2203) < 0.5 ? '#6a6488' : '#4a4266');
      }
    }
    // chips of bone along it
    for (let k = 2; k < line.length; k += 3) {
      if (hash(k, c, 2205) > 0.55 * fade) continue;
      const [x, y] = at(line[k]);
      const dx = Math.round((hash(k, c, 2207) - 0.5) * 8);
      const dy = Math.round((hash(k, c, 2209) - 0.5) * 5);
      under(x + dx, y + dy, BONE[2]);
      if (hash(k, c, 2211) < 0.4) under(x + dx + 1, y + dy, BONE[1]);
    }
  });
  if (hot > 0) {
    const mid = lines[1][Math.floor(lines[1].length / 2)];
    if (mid) {
      const [x, y] = at(mid);
      lights.push({ x, y, r: 70, color: SOCKET, a: 0.22 * hot });
    }
  }
  void RAKES;
  return { px, lights };
}
