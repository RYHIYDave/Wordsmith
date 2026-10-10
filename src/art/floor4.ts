// THE AMALGAMATION'S FLOOR: the Crypt's fourth floor, themed after its boss (a mock-up; nothing of the
// game imports it).
//
// The owner, 10 Oct 2026: by 07:29, "I’d also like each floor to be themed after the boss.  Add this
// to the ruleset.  We need somewhere between 40-50 unique assets on each floor for each boss.  That
// can include wall tiles, floor tiles, breakables, stuff on the walls, on the floor, obstacles, the
// looks of doors and gates, traps, and quests." (His art rulebook, Places 7.) By 07:41, offered the
// four floors' themes, floor 4 the Amalgamation's: the ossuary the miners broke into. By 14:13, of
// floor 2: "Yes, on to floors 3 and 4 (Recommended)". His outline of 9 Oct: “By floor 4 it’s about half
// dirt and rocks with discarded and rusted mining equipment around.  There is a cult here that has
// found an ancient evil power residing under the crypt.  Floor 5 will have the Lair boss, which will be
// a very powerful cultist fleshmancer.  He is the one creating the ossuary guys and the giant
// amalgamation.”
//
// THE THEME, from the Ossuary Amalgamation as it is painted (art/bosses3.ts, on mockup/bosses): a heap
// of the dead, low and wide: dark packed bone, the fire in its cracks, skulls all over it with the pink
// in their sockets, rib cages and broken bones jutting from its hump, the dead's own arms reaching up
// out of it; no face but a maw low in its front full of fangs; six great arms of bone; it hauls itself
// on its arms; it eats the dead. So floor 4 is AN OLD OSSUARY THE MINERS BROKE INTO: walls of stacked
// skulls and long bones, niches lined with bone; the miners' tunnel through it, their timber, rails and
// a cart, their tools, all rusted and left; and the amalgamation's doing: bones dragged off into heaps,
// the earth raked by its hands, the dead's arms reaching up out of the heaps. The cult's candles burn
// here and there on skulls. It stands on the Crypt's fourth floor as he said yes to it (art/crypt.ts,
// CRYPT_FLOORS[3]: half the floor earth, half the walls rough rock, timber pit props, rusted gear).
//
// ITS MARKS, chosen with care: the maw (a ragged split full of fangs, wider than it is tall: a mouth,
// never an eye) on the boss's gate, the pink of his fire in it; three skulls heaped, one on two, on its
// other gates. Never a skull over crossed bones (a pirate's or poison's flag), never a cross.
//
// THE RULES IT KEEPS (his art rulebook): crisp pixels, two to a game pixel, light from the upper
// left, three tones a material, the indigo seam between parts; turned to the grid; a step quieter
// than the figures (the bone in the walls darker than any word); no glow but an honest fire's orange
// (no cyan; pink only in the boss's gate and, in the moments, in the eyes of the dead it stirs: Colour
// 3); old, broken and grim but never gory (Places 6); no carved words (Words in the world 3).
//
// Measures as the game's (art/isokit.ts): picture pixels, two to a game pixel; a tile 64 x 32 on
// the screen; along +x 32 right and 16 down, along +y 32 left and 16 down; heights up. Things built
// in the world are measured in picture pixels across the floor too, KT (40) to a tile (art/floor2.ts).

import { Px } from '../engine/px';
import type { Light, Sprite } from '../engine/px';
import { CRYPT_FLOORS, DIRT, OLD_IRON, OLD_RUST, ROCK, TIMBER } from './crypt';
import type { Theme } from './ground';
import { makeGateArt } from './gates';
import type { GateArt, Mark } from './gates';
import { Iso } from './isokit';
import { GRAIN, INK, ball, blend, compose, hash, limb, lit, mix } from './kit';
import type { Ramp } from './kit';
import { COAL, EMBER, GOLD, stoneOf, tongue, trunk } from './props';
import { FLAME } from './mkit';
import type { TrunkLook } from './props';
import {
  BEYOND, DEEP, LCX, LCY, PCX, PFOOT, PH, PW, SOLID, TALL, block, box, fillWith, flame, flat, fx, fy, lying, mid, onFacePx, quadUV, recolor, relief, shadeSide, shaded, spotsFrom, sunk, tilesOf, litSide, dustCloud, fastBlit, painted,
} from './floorkit';
import type { Moment, Piece, PieceKind, Spot, Track } from './floorkit';
import { FLOOR_DUST, KT, LIGHT_W, TOWARD, dot3, grainStream, onPic, paintGrains, paintPuffs, puffRing } from './floor2';
import type { Grain, Puff } from './floor2';

// =================================================================================================
// The colours

const THEME: Theme = CRYPT_FLOORS[3];
/** The dressed stone of the floor's blocks and steps (the walls' own, from their shade to a lit edge). */
const STONE: Ramp = stoneOf(THEME);
/** The stone of a wall's face turned to the light: its joint, its low tone, its usual, its high, and a lit edge. */
const FACE: Ramp = [THEME.lit[0], THEME.lit[1], THEME.lit[2], THEME.lit[4], THEME.lit[4]];
const SLAB = THEME.slab;
/** Rough rock, where the walls have fallen to it (the Crypt's own: a grey violet). */
const RAW: Ramp = [ROCK[0], ROCK[0], ROCK[1], ROCK[3], ROCK[3]];
/** Rock as what stands and lies: a step lighter, so that a boulder reads against the floor. */
const BOULDER: Ramp = ['#14122a', ROCK[0], ROCK[2], ROCK[3], '#5c5880'];
/** The earth: the Crypt's dark plum. */
const EARTH = DIRT;
const EARTH_R: Ramp = [DIRT[0], DIRT[0], DIRT[1], DIRT[3], DIRT[3]];
/** The packed earth of the heap of the dead: the earth, a step lighter where it is lit. */
const HEAP_EARTH: Ramp = [DIRT[0], DIRT[1], DIRT[2], DIRT[3], '#3e3048'];
/**
 * BONE, the amalgamation's own (art/bosses3.ts, OSS: packed grey bone, a lavender grey), a step
 * quieter as a place is: what lies and stands in the room; and in the walls' dark, a step under that
 * again (his Colour 4: the walls darker than any word), greyer than the indigo stone so it reads as bone.
 */
const BONE: Ramp = ['#1e1a30', '#2c2642', '#5e5780', '#9088b0', '#b0a8cc'];
const WALL_BONE: Ramp = ['#110e20', '#252038', '#3e3856', '#544e6c', '#605a76'];
/** Bone fallen out of a wall, on the floor before it (the wall's piece, and as quiet). */
const HEAP_BONE: Ramp = ['#1a1630', '#28233e', '#47415f', '#5c5676', '#625c7a'];
/** Iron left in the damp and rusted (the Crypt's). Small iron things a little brighter, so they read. */
const IRONS: Ramp = OLD_IRON;
const SMALL_IRON: Ramp = ['#1c1a3a', '#1c1a3a', '#4c4884', '#8480bc', '#a8a4dc'];
const DIM_IRON: Ramp = ['#16142c', '#16142c', '#34305e', '#4c4880', '#4c4880'];
const RUST: Ramp = OLD_RUST;
const GLINT = '#9a96c8';
/** Ore: dark rock, a dull metal glint in it. */
const ORE: Ramp = ['#0e0c1a', '#16142a', '#262340', '#36334f', '#5c5880'];
/** Hemp rope and sacking, grey with age. */
const ROPE: Ramp = ['#1e1820', '#1e1820', '#4a3e48', '#6a5c64', '#7e7078'];
const SACK: Ramp = ['#1a1520', '#221c28', '#3c3240', '#56495a', '#665868'];
/** The cult's black candles, and their robe: a wine so dark it is nearly black (the cultists' own colour, quieter). */
const WAX: Ramp = ['#100c18', '#100c18', '#262036', '#3c3452', '#4e4666'];
const ROBE: Ramp = ['#0e0a18', '#170f26', '#2a1c44', '#3c2a5c', '#48346a'];
/** Fired clay, old and dull. */
const CLAY: Ramp = ['#1c1424', '#2a1e30', '#4a3648', '#66505e', '#7a6270'];
/** Old soot, the cult's daub: dull and dark, never red (Places 6). */
const SOOT = ['#0b0910', '#120f18', '#1a1622'] as const;

const { tileOf, onTile, around } = tilesOf(THEME);

// =================================================================================================
// IN DEPTH: a little painter of round things in the world (picture pixels, KT to a tile; z up), each
// pixel the nearest of what is there, as the eye sees it; its light from the upper left (LIGHT_W).

export type V3 = [number, number, number];
const add = (a: V3, b: V3): V3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const sub = (a: V3, b: V3): V3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const mul = (a: V3, k: number): V3 => [a[0] * k, a[1] * k, a[2] * k];
const dot = (a: readonly number[], b: readonly number[]): number => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const cross = (a: V3, b: V3): V3 => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const norm = (a: V3): V3 => {
  const n = Math.hypot(a[0], a[1], a[2]) || 1;
  return [a[0] / n, a[1] / n, a[2] / n];
};
/** `a` turned about the unit axis `k` by `ang` (Rodrigues). */
export function rot(a: V3, k: V3, ang: number): V3 {
  const c = Math.cos(ang);
  const s = Math.sin(ang);
  const d = dot(a, k);
  const x = cross(k, a);
  return [a[0] * c + x[0] * s + k[0] * d * (1 - c), a[1] * c + x[1] * s + k[1] * d * (1 - c), a[2] * c + x[2] * s + k[2] * d * (1 - c)];
}
/** The way toward the eye: onPic of it is nothing. */
const EYE: V3 = [1, 1, 0.8];

/**
 * THE LIGHT the round things are painted in: from the upper left of the picture (LIGHT_W); but on a
 * wall's face turned to screen-right, from the upper left as the face is seen, and the whole a shade
 * darker (`dimmed`), as floorkit paints a flat picture into that face (onFacePx), so that a piece
 * built in the world sits in its face as one painted flat does: the face in the light lighter than
 * the one in shade (his rulebook, Places 4).
 */
const LIGHT_FACE_R: V3 = norm([0.45, 0.55, 0.7]);
const light = { L: LIGHT_W as readonly number[], dimmed: 0 };
/** Paint `f` in the light of a face (turned to screen-left: the world's own; to screen-right: as that face is seen), `k` of the way (1: in the face; 0: out in the room). */
function inFaceLight<T>(alongX: boolean, k: number, f: () => T): T {
  const was = { L: light.L, dimmed: light.dimmed };
  if (!alongX && k > 0) {
    light.L = norm(add(mul(LIGHT_FACE_R, k), mul(LIGHT_W as V3, 1 - k)));
    light.dimmed = k;
  }
  try {
    return f();
  } finally {
    light.L = was.L;
    light.dimmed = was.dimmed;
  }
}

/** Which tone of a ramp a face turned `n` takes, in the light from the upper left. */
export function toneAt(n: readonly number[], r: Ramp, bias = 0): string {
  const l = dot(n, light.L) + bias;
  return r[l > 0.66 ? 4 : l > 0.3 ? 3 : l > -0.12 ? 2 : l > -0.5 ? 1 : 0];
}

/**
 * A PICTURE PAINTED IN DEPTH, with (ox, oy) on it the world's (0, 0, 0): each pixel keeps whatever
 * of the world is nearest the eye, which thing it is (for the seams between things) and how high it
 * is (for the wall's fade).
 */
export class Scene {
  readonly z: Float32Array;
  readonly id: Int32Array;
  readonly hz: Float32Array;
  constructor(readonly p: Px, readonly ox: number, readonly oy: number) {
    this.z = new Float32Array(p.w * p.h).fill(-Infinity);
    this.id = new Int32Array(p.w * p.h).fill(-1);
    this.hz = new Float32Array(p.w * p.h);
  }
  at(w: readonly number[]): [number, number] {
    return [this.ox + (w[0] - w[1]) * 0.8, this.oy + (w[0] + w[1]) * 0.4 - w[2]];
  }
  put(x: number, y: number, d: number, c: string, id: number, h = 0): void {
    if (x < 0 || y < 0 || x >= this.p.w || y >= this.p.h) return;
    const i = y * this.p.w + x;
    if (d <= this.z[i]) return;
    this.z[i] = d;
    this.id[i] = id;
    this.hz[i] = h;
    this.p.set(x, y, light.dimmed > 0 && !SHINE.has(c) ? mix(c, '#06051a', 0.32 * light.dimmed) : c);
  }
  /** The point of the world, at the floor's height, that the eye sees through the middle of pixel (x, y): the rest of what it sees there lies along EYE from it. */
  ray(x: number, y: number): V3 {
    const sx = (x + 0.5 - this.ox) / 0.8;
    const sy = (y + 0.5 - this.oy) / 0.4;
    return [(sx + sy) / 2, (sy - sx) / 2, 0];
  }
  /**
   * AN EGG-SHAPED THING (an ellipsoid) at `c`, its axes `A` (unit, at right angles) and its half-sizes
   * `r` along them: `shade(n, w)` its colour where its face is turned `n` at the world's point `w`
   * (null: nothing there). `keep(w)`: whether that point is seen (not inside the wall).
   */
  egg(c: V3, A: readonly [V3, V3, V3], r: V3, shade: (n: V3, w: V3) => string | null, id: number, keep?: (w: V3) => boolean): void {
    const R = Math.max(r[0], r[1], r[2]) * 1.2 + 1;
    const [cx, cy] = this.at(c);
    const LD = [dot(EYE, A[0]) / r[0], dot(EYE, A[1]) / r[1], dot(EYE, A[2]) / r[2]];
    const a = LD[0] * LD[0] + LD[1] * LD[1] + LD[2] * LD[2];
    for (let y = Math.floor(cy - R); y <= Math.ceil(cy + R); y++) {
      if (y < 0 || y >= this.p.h) continue;
      for (let x = Math.floor(cx - R); x <= Math.ceil(cx + R); x++) {
        if (x < 0 || x >= this.p.w) continue;
        const q = sub(this.ray(x, y), c);
        const L0 = [dot(q, A[0]) / r[0], dot(q, A[1]) / r[1], dot(q, A[2]) / r[2]];
        const b = 2 * (L0[0] * LD[0] + L0[1] * LD[1] + L0[2] * LD[2]);
        const cc = L0[0] * L0[0] + L0[1] * L0[1] + L0[2] * L0[2] - 1;
        const disc = b * b - 4 * a * cc;
        if (disc < 0) continue;
        const t = (-b + Math.sqrt(disc)) / (2 * a);
        const l = [L0[0] + t * LD[0], L0[1] + t * LD[1], L0[2] + t * LD[2]];
        const w = add(c, add(q, mul(EYE, t)));
        if (w[2] < -0.3 || (keep && !keep(w))) continue;
        const n = norm(add(add(mul(A[0], l[0] / r[0]), mul(A[1], l[1] / r[1])), mul(A[2], l[2] / r[2])));
        const col = shade(n, w);
        if (col) this.put(x, y, dot(w, TOWARD), col, id, w[2]);
      }
    }
  }
  /** A BALL of one ramp, lit as it faces. */
  ball(c: V3, r: number, ramp: Ramp, id: number, keep?: (w: V3) => boolean, bias = 0): void {
    this.egg(c, [[1, 0, 0], [0, 1, 0], [0, 0, 1]], [r, r, r], (n) => toneAt(n, ramp, bias), id, keep);
  }
  /** A FOUR-CORNERED PIECE of the world (a plank, a side of a box), its corners in turn: `shade(u, v, w)` its colour `u` along from the first corner to the second and `v` from the first to the fourth. */
  quad(q: readonly [V3, V3, V3, V3], shade: (u: number, v: number, w: V3) => string | null, id: number): void {
    const pts = q.map((w) => this.at(w)) as [number, number][];
    const ys = pts.map((t) => t[1]);
    for (let y = Math.floor(Math.min(...ys)); y < Math.ceil(Math.max(...ys)); y++) {
      const yc = y + 0.5;
      const xs: number[] = [];
      for (let i = 0; i < 4; i++) {
        const a = pts[i];
        const b = pts[(i + 1) % 4];
        if ((a[1] <= yc && b[1] > yc) || (b[1] <= yc && a[1] > yc)) xs.push(a[0] + ((yc - a[1]) / (b[1] - a[1])) * (b[0] - a[0]));
      }
      xs.sort((m, n) => m - n);
      for (let k = 0; k + 1 < xs.length; k += 2) {
        for (let x = Math.round(xs[k]); x < Math.round(xs[k + 1]); x++) {
          const [u, v] = quadUV(x + 0.5, y + 0.5, pts[0], pts[1], pts[2], pts[3]);
          const e = add(q[0], mul(sub(q[1], q[0]), u));
          const g = add(q[3], mul(sub(q[2], q[3]), u));
          const w = add(e, mul(sub(g, e), v));
          if (w[2] < -0.3) continue;
          const col = shade(u, v, w);
          if (col) this.put(x, y, dot(w, TOWARD), col, id, w[2]);
        }
      }
    }
  }
  /** A BOX turned any way: its middle `c`, its axes `A` and half-sizes `r`; `shade(face, u, v, n)` the colour of each face seen (face: 0..5 for +A0, -A0, +A1, -A1, +A2, -A2). */
  box(c: V3, A: readonly [V3, V3, V3], r: V3, shade: (face: number, u: number, v: number, n: V3) => string | null, id: number): void {
    for (let f = 0; f < 6; f++) {
      const ax = f >> 1;
      const s = f % 2 ? -1 : 1;
      const n = mul(A[ax], s);
      if (dot(n, TOWARD) <= 0.01) continue;
      const o = add(c, mul(n, r[ax]));
      const e1 = A[(ax + 1) % 3];
      const e2 = A[(ax + 2) % 3];
      const r1 = r[(ax + 1) % 3];
      const r2 = r[(ax + 2) % 3];
      const P = (a: number, b: number): V3 => add(o, add(mul(e1, a * r1), mul(e2, b * r2)));
      this.quad([P(-1, -1), P(1, -1), P(1, 1), P(-1, 1)], (u, v) => shade(f, u, v, n), id);
    }
  }
  /** A ROD from `a` to `b` (a bone's shaft, a haft), thicker at one end, shaded across: as near the eye as its axis is along it. */
  rod(a: V3, b: V3, r0: number, r1: number, ramp: Ramp, id: number, keep?: (w: V3) => boolean): void {
    const [x0, y0] = this.at(a);
    const [x1, y1] = this.at(b);
    if (![x0, y0, x1, y1].every(Number.isFinite)) return;
    const tmp = new Px(this.p.w, this.p.h);
    limb(tmp, x0, y0, x1, y1, r0 * 1.1, r1 * 1.1, ramp);
    const d0 = dot(a, TOWARD) + (r0 + r1) / 2;
    const d1 = dot(b, TOWARD) + (r0 + r1) / 2;
    const L2 = (x1 - x0) ** 2 + (y1 - y0) ** 2 || 1;
    const bb = tmp.bounds();
    if (!bb) return;
    for (let y = bb.y; y < bb.y + bb.h; y++) {
      for (let x = bb.x; x < bb.x + bb.w; x++) {
        const c = tmp.get(x, y);
        if (!c) continue;
        const t = Math.max(0, Math.min(1, ((x + 0.5 - x0) * (x1 - x0) + (y + 0.5 - y0) * (y1 - y0)) / L2));
        const w = add(a, mul(sub(b, a), t));
        if (w[2] < -0.3 || (keep && !keep(w))) continue;
        this.put(x, y, d0 + (d1 - d0) * t, c, id, w[2]);
      }
    }
  }
  /** THE SEAMS between things (his rulebook, Pixels 5): where one thing ends in front of another, the farther one's edge in ink. */
  seams(step = 3): void {
    const { w, h } = this.p;
    const ink: number[] = [];
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const i = y * w + x;
        if (this.id[i] < 0) continue;
        for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]] as const) {
          const X = x + dx;
          const Y = y + dy;
          if (X < 0 || Y < 0 || X >= w || Y >= h) continue;
          const j = Y * w + X;
          if (this.id[j] >= 0 && this.id[j] !== this.id[i] && this.z[j] > this.z[i] + step) {
            ink.push(i);
            break;
          }
        }
      }
    }
    for (const i of ink) this.p.set(i % w, Math.floor(i / w), INK);
  }
}

// =================================================================================================
// SKULLS AND BONES, in depth

/** How a skull lies: its middle, the way its face looks (F), its crown (U), its size; its jaw (none, shut, or how far open); its eyes' colours (dark, or the fire kindled in them). */
export interface SkullPose {
  c: V3;
  F: V3;
  U: V3;
  R: number;
  jaw?: number | null;
  /** How far the pink is kindled in its sockets (0 dark; 1 burning). */
  burn?: number;
}
/** The enemy's fire in a skull's sockets, from a dull kindling to burning (his Colour 3: pink, the enemy's). */
function socketFire(burn: number, deep: number): string {
  if (burn <= 0.05) return DEEP;
  const k = burn * (1 - deep * 0.6);
  return k > 0.85 ? FLAME[3] : k > 0.6 ? FLAME[2] : k > 0.35 ? FLAME[1] : k > 0.15 ? FLAME[0] : '#2a0c22';
}
/**
 * A SKULL: its cranium, the bones of its face, its jaw, painted in depth; its sockets, its nose and
 * its teeth cut into it on the side it looks; lit as each part faces.
 */
export function skull(S: Scene, k: SkullPose, ramp: Ramp, id: number, keep?: (w: V3) => boolean): void {
  const F = norm(k.F);
  const U = norm(sub(k.U, mul(F, dot(k.U, F))));
  const Sd = cross(F, U);
  const R = k.R;
  const burn = k.burn ?? 0;
  const feature = (w: V3, onFace: boolean): string | null => {
    const q = sub(w, k.c);
    const f = dot(q, F) / R;
    const u = dot(q, U) / R;
    const s = dot(q, Sd) / R;
    if (f > 0.2) {
      // the sockets: two round hollows, big (never smaller than a game pixel across, so a small skull still reads as one)
      const rs = Math.max(0.28, 1.2 / R);
      const es = Math.max(0.42, 1.9 / R);
      for (const e of [-es, es]) {
        const d = Math.hypot((s - e) / rs, (u - 0.06) / (rs * 0.95));
        if (d < 1) return burn > 0 ? socketFire(burn, d) : DEEP;
      }
      // the nose: a small hollow, pointed up
      const nb = Math.max(0.12, 0.65 / R);
      if (u < -0.34 && u > -0.56 && Math.abs(s) < nb * ((u + 0.56) / 0.22) + 0.02) return DEEP;
      // the teeth, a row along the face's lower edge
      if (onFace && u < -0.62 && u > -0.84 && f > 0.3) return Math.abs((s * (R < 5 ? 4 : 6.5) + 20) % 1 - 0.5) < 0.18 ? ramp[0] : ramp[3];
    }
    return null;
  };
  const shadeOf = (onFace: boolean) => (n: V3, w: V3): string => feature(w, onFace) ?? toneAt(n, ramp);
  // the cranium
  S.egg(add(k.c, mul(U, 0.18 * R)), [F, U, Sd], [0.92 * R, 0.8 * R, 0.84 * R], shadeOf(false), id, keep);
  // the face, its cheeks and upper teeth
  S.egg(add(k.c, add(mul(F, 0.36 * R), mul(U, -0.4 * R))), [F, U, Sd], [0.56 * R, 0.46 * R, 0.68 * R], shadeOf(true), id, keep);
  // the jaw, hanging under it
  if (k.jaw !== undefined && k.jaw !== null) {
    const J = rot(U, Sd, -k.jaw);
    const Jf = rot(F, Sd, -k.jaw);
    const jc = add(add(k.c, mul(U, -0.62 * R)), add(mul(Jf, 0.3 * R), mul(J, -0.3 * R)));
    S.egg(jc, [Jf, J, Sd], [0.5 * R, 0.24 * R, 0.56 * R], (n, w) => {
      const q = sub(w, jc);
      const f = dot(q, Jf) / R;
      const u = dot(q, J) / R;
      const s = dot(q, Sd) / R;
      if (f > 0.25 && u > 0.05) return Math.abs((s * 6.5 + 20.5) % 1 - 0.5) < 0.16 ? ramp[1] : ramp[3];
      return toneAt(n, ramp);
    }, id, keep);
  }
}
/** A LONG BONE: its shaft, and its knuckled ends, from `a` to `b`. */
export function longBone(S: Scene, a: V3, b: V3, r: number, ramp: Ramp, id: number, keep?: (w: V3) => boolean): void {
  S.rod(a, b, r, r * 0.85, ramp, id, keep);
  const d = norm(sub(b, a));
  const side = norm(cross(d, Math.abs(d[2]) > 0.9 ? [1, 0, 0] : [0, 0, 1]));
  for (const [e, k] of [[a, 1], [b, 0.9]] as const) {
    S.ball(add(e, mul(side, r * 0.7 * k)), r * 1.25 * k, ramp, id, keep);
    S.ball(add(e, mul(side, -r * 0.7 * k)), r * 1.15 * k, ramp, id, keep);
  }
}
/** A RIB CAGE: a spine, and ribs curving round from it, `c` its middle, its spine along `L`, its breast toward `F`. */
export function ribCage(S: Scene, c: V3, L: V3, F: V3, size: number, ramp: Ramp, id: number, keep?: (w: V3) => boolean, spread = 1): void {
  const Ld = norm(L);
  const Fd = norm(sub(F, mul(Ld, dot(F, Ld))));
  const Sd = cross(Ld, Fd);
  const back = add(c, mul(Fd, -0.55 * size));
  S.rod(add(back, mul(Ld, -0.9 * size)), add(back, mul(Ld, 0.9 * size)), 0.18 * size, 0.16 * size, ramp, id, keep);
  for (let j = 0; j < 5; j++) {
    const along = -0.7 + 0.32 * j;
    const rr = size * (0.62 + 0.12 * Math.sin((j / 4) * Math.PI)) * spread;
    let prev: V3 | null = null;
    for (let a = -2.6; a <= 2.6; a += 0.32) {
      const w = add(add(back, mul(Ld, (along - 0.1 * (1 - Math.cos(a))) * size)), add(mul(Fd, rr * (1 - Math.cos(a)) * 0.55), mul(Sd, rr * Math.sin(a) * 0.8)));
      if (prev) S.rod(prev, w, 0.1 * size, 0.1 * size, ramp, id, keep);
      prev = w;
    }
  }
}

// =================================================================================================
// WALL PIECES, built in the world in front of a face, and the flat picture in the face behind them

/** A face's frame: (along it, out of it, up) to the world's (x, y, z). The face turned to screen-left lies along x; the one turned to screen-right along y, so that the piece is not turned round on it. */
export const faceWorld = (alongX: boolean) => (a: number, b: number, z: number): V3 => (alongX ? [a, b, z] : [b, -a, z]);
/** The fade of the wall's top, as the face's own (floorkit, onFacePx): `v` up the face. */
function fadeAt(c: string, v: number): string {
  const FADE = TALL - SOLID;
  const fromTop = TALL - 1 - v;
  if (fromTop >= FADE || SHINE.has(c)) return c;
  return mix(c, BEYOND, [0.9, 0.66, 0.42, 0.2][Math.max(0, Math.floor((fromTop * 4) / FADE))]);
}
const SHINE = new Set<string>([...EMBER, COAL[2], COAL[3], '#fff0a0', '#ffb070', '#ff4f8a', '#c0206a', '#7a1058']);

/** What a wall piece is made of: a flat picture in the face (painted as floorkit's are, with fx and fy), and what stands out of it, built in the world with `w(a, b, z)` (a along the face in picture pixels of the world, 0.8 to a pixel across the face; b out of it; z up). */
interface WallMake {
  flat?: (p: Px) => void;
  solid?: (S: Scene, w: (a: number, b: number, z: number) => V3, alongX: boolean) => void;
  /** Fire, over all (not shaded on the face in shade, nor faded). */
  fire?: (p: Px) => void;
}
/** A face's axes in the world: along it, out of it, up. */
function axesOf(W: (a: number, b: number, z: number) => V3): [V3, V3, V3] {
  const o = W(0, 0, 0);
  return [norm(sub(W(1, 0, 0), o)), norm(sub(W(0, 1, 0), o)), [0, 0, 1]];
}
/** A way in the face's frame, in the world. */
const dirOf = (W: (a: number, b: number, z: number) => V3) => (v: V3): V3 => sub(W(v[0], v[1], v[2]), W(0, 0, 0));
/** A wall piece on one face, set `du` across and `dv` up: its flat picture skewed into the face and shaded as the face is, what stands out of it in front, a seam between. */
function wallSprite(m: WallMake, alongX: boolean, du: number, dv: number, lights: Light[] = []): Sprite {
  const base = new Px(PW, PH);
  if (m.flat) {
    const f = flat();
    m.flat(f);
    const g = flat();
    g.blit(f, du, -dv);
    base.blit(onFacePx(g, alongX), 0, 0);
  }
  let out = base;
  if (m.solid) {
    const S = new Scene(new Px(PW, PH), PCX, PFOOT);
    const W = faceWorld(alongX);
    inFaceLight(alongX, 1, () => m.solid!(S, (a, b, z) => W(a + du / 0.8, b, z + dv), alongX));
    // (nothing out past its tile's face: what runs back into the wall is in it, not beside it)
    for (let i = 0; i < S.id.length; i++) {
      const u = (i % PW) - PCX;
      if (S.id[i] >= 0 && (u < -15 || u > 14)) {
        S.id[i] = -1;
        S.p.erase(i % PW, Math.floor(i / PW));
      }
    }
    S.seams();
    // (the fade of the wall's top on what stands out of it too)
    for (let i = 0; i < S.id.length; i++) {
      if (S.id[i] < 0) continue;
      const x = i % PW;
      const y = Math.floor(i / PW);
      S.p.set(x, y, fadeAt(S.p.get(x, y)!, S.hz[i]));
    }
    out = compose(base, [S.p], null);
  }
  if (m.fire) {
    const f = flat();
    m.fire(f);
    const g = flat();
    g.blit(f, du, -dv);
    out.blit(onFacePx(g, alongX), 0, 0);
  }
  const s = out.sprite(PCX, PFOOT, GRAIN);
  if (lights.length) s.lights = lights.map((l) => ({ ...l }));
  return s;
}

// =================================================================================================
// WALL TILES

/**
 * THE SKULL WALL, the wall's height: the ossuary's own wall, as the dead were stacked in it: courses of
 * long bones laid with their knuckled ends out, two by two, and between them bands of skulls, three to
 * a tile, each turned a little its own way, staring out; the dark between them; up into the dark the
 * wall fades into. Each thing in it is one of `SKULL_WALL`, so that the moment that spills it moves
 * the very skulls and bones that were there. (along it, out of it, up: in the world's picture pixels)
 */
export interface WallBit { kind: 'skull' | 'end'; a: number; b: number; z: number; r: number; turn: number; tilt: number; seed: number; back: boolean }
export const SKULL_WALL: readonly WallBit[] = (() => {
  const out: WallBit[] = [];
  const ends = (z: number, row: number, back: boolean): void => {
    for (let k = -4; k <= 4; k++) {
      const a = k * 5.3 + (row % 2 ? 2.65 : 0) + (hash(k, row, 501) - 0.5) * 0.7;
      if (a < -16.4 || a > 15.4) continue;
      out.push({ kind: 'end', a, b: back ? -7 : 0.8 + hash(k, row, 502) * 1.2, z: z + (hash(k, row, 503) - 0.5) * 0.8, r: 1.5 + hash(k, row, 504) * 0.3, turn: (hash(k, row, 505) - 0.5) * 0.9, tilt: 0, seed: row * 16 + k + 8, back });
    }
  };
  const skulls = (z: number, row: number, back: boolean): void => {
    for (const [k, a] of (back && row % 2 ? [[0, -6.4], [1, 6.4]] : [[0, -12.8], [1, 0.2], [2, 12.6]]) as [number, number][]) {
      out.push({ kind: 'skull', a: a + (hash(k, row, 506) - 0.5) * 1.2, b: back ? -6.5 : 0.3, z: z + (hash(k, row, 507) - 0.5) * 1.2, r: 4.1 + hash(k, row, 508) * 0.4, turn: (hash(k, row, 509) - 0.5) * 0.7, tilt: (hash(k, row, 510) - 0.5) * 0.35, seed: row * 16 + k, back });
    }
  };
  // the face of it: a course of bone ends, a band of skulls, by turns, up into the dark
  ends(3.2, 0, false);
  skulls(11.8, 1, false);
  ends(20.6, 2, false);
  skulls(29.4, 3, false);
  ends(38.2, 4, false);
  skulls(47, 5, false);
  ends(55.8, 6, false);
  skulls(64.6, 7, false);
  ends(73.4, 8, false);
  ends(77.8, 9, false);
  // and further in, behind them, more of the dead: skulls, packed
  for (let k = 0; k < 7; k++) skulls(6 + k * 9, 20 + k, true);
  return out;
})();
/** A skull of the wall as it sits: its pose in the face's own frame (a, b, z), facing out. */
export function wallSkullPose(s: WallBit, alongX: boolean): { c: V3; F: V3; U: V3 } {
  // (each turned a little toward the room, whichever face it is in, and a little up: as the eye sees it, a skull)
  const F: V3 = rot(rot(norm([alongX ? 0.38 : -0.38, 1, 0.22]), [0, 0, 1], -s.turn * 0.6), [1, 0, 0], s.tilt);
  return { c: [s.a, s.b, s.z], F, U: [0, 0, 1] };
}
/** The bone of a knuckled end in the wall, as it lies: a long bone, its end out at (a, b, z), its shaft running back into the wall. */
export function wallBonePose(s: WallBit): { e: V3; d: V3; len: number } {
  const d: V3 = norm([Math.sin(s.turn) * 0.25, -1, (hash(s.seed, 1, 511) - 0.5) * 0.2]);
  return { e: [s.a, s.b, s.z], d, len: 15 + hash(s.seed, 2, 511) * 5 };
}
/**
 * A LONG BONE BY ITS KNUCKLED END: from its end `tip` (in the world) along `d` for `len`: two knobs
 * side by side at its end, its shaft, and two smaller at its far end. Laid in the wall with its end
 * out, the rest of it is in the wall (`keep`); spilled, the whole of it shows, the same bone.
 */
export function knuckleBone(S: Scene, tip: V3, d: V3, len: number, r: number, ramp: Ramp, id: number, keep?: (w: V3) => boolean): void {
  const side = norm(cross(d, Math.abs(d[2]) > 0.95 ? [1, 0, 0] : [0, 0, 1]));
  const far = add(tip, mul(d, len));
  S.rod(tip, far, r * 0.62, r * 0.55, ramp, id, keep);
  S.ball(add(tip, mul(side, r * 0.5)), r * 0.95, ramp, id, keep);
  S.ball(add(tip, mul(side, -r * 0.5)), r * 0.86, ramp, id, keep);
  S.ball(add(far, mul(side, r * 0.42)), r * 0.8, ramp, id, keep);
  S.ball(add(far, mul(side, -r * 0.42)), r * 0.72, ramp, id, keep);
}
/** A knuckled end of a long bone, seen end on, in the wall: two knobs side by side, and the shaft behind. */
function boneEnd(S: Scene, W: (a: number, b: number, z: number) => V3, s: WallBit, ramp: Ramp, id: number, keep?: (w: V3) => boolean): void {
  const { e, d, len } = wallBonePose(s);
  knuckleBone(S, W(e[0], e[1], e[2]), dirOf(W)(d), len, s.r, ramp, id, keep);
}
const inFront = (alongX: boolean) => (w: V3): boolean => (alongX ? w[1] : w[0]) >= -0.2;
/** The gaps between the dead in the skull wall: dark, a little earth showing. */
function skullWallGaps(p: Px): void {
  for (let v = 0; v <= 79; v++) for (let u = -16; u <= 15; u++) p.set(fx(u), fy(v), hash(u >> 1, v >> 1, 512) < 0.18 ? EARTH[1] : EARTH[0]);
}
/** Paint the skull wall's dead into `S` (only those `which` keeps), in the face's frame `W`. */
function skullWallDead(S: Scene, W: (a: number, b: number, z: number) => V3, alongX: boolean, which: (s: WallBit) => boolean = () => true): void {
  const keep = inFront(alongX);
  SKULL_WALL.forEach((s, i) => {
    if (!which(s)) return;
    const ramp = s.back ? dimBone : WALL_BONE;
    if (s.kind === 'skull') {
      const p = wallSkullPose(s, alongX);
      const toW = (v: V3): V3 => sub(W(v[0], v[1], v[2]), W(0, 0, 0));
      skull(S, { c: W(p.c[0], p.c[1], p.c[2]), F: toW(p.F), U: toW(p.U), R: s.r, jaw: null }, ramp, 1000 + i, s.back ? undefined : keep);
    } else boneEnd(S, W, s, ramp, 1000 + i, s.back ? undefined : keep);
  });
}
/** The dead further in, in the dark behind. */
const dimBone: Ramp = ['#0c0a1a', '#141128', '#221d38', '#302a48', '#3a3454'];
const skullWall: WallMake = { flat: skullWallGaps, solid: (S, W, alongX) => skullWallDead(S, W, alongX) };

/** A NICHE LINED WITH BONE: an arch sunk in the stone, bone ends set all round its rim, a skull for its keystone; in it, in the dark, a skull resting on a stack of long bones. */
const NICHE_IN = (u: number, v: number): boolean => Math.abs(u + 0.5) <= 6.5 && v >= 5 && (v <= 18 || (u + 0.5) ** 2 + ((v - 18) * 1.25) ** 2 <= 6.5 ** 2 * 1.0);
const bonedNiche: WallMake = {
  flat: (p) => {
    relief(p, FACE, (u, v) => Math.abs(u + 0.5) <= 10.5 && v >= 2 && (v <= 18 || (u + 0.5) ** 2 + ((v - 18) * 1.1) ** 2 <= 110) && !NICHE_IN(u, v), -11, 10, 2, 30);
    sunk(p, FACE, NICHE_IN, -8, 7, 5, 27, DEEP);
    // its sill
    for (let u = -9; u <= 8; u++) p.set(fx(u), fy(4), FACE[4]).set(fx(u), fy(3), FACE[2]).set(fx(u), fy(2), FACE[0]);
  },
  solid: (S, W, alongX) => {
    const keep = inFront(alongX);
    const toW = (v: V3): V3 => sub(W(v[0], v[1], v[2]), W(0, 0, 0));
    // the bone ends round its rim
    let n = 0;
    for (let t = -1; t <= 1.001; t += 0.2) {
      const ang = t * (Math.PI / 2);
      const a = (Math.sin(ang) * 9.6) / 0.8;
      const z = 18 + Math.cos(ang) * 8.6;
      if (Math.abs(t) > 0.85) continue;
      const s: WallBit = { kind: 'end', a, b: 0.4, z, r: 1.5, turn: ang * 0.4, tilt: 0, seed: 40 + n, back: false };
      boneEnd(S, W, s, WALL_BONE, 200 + n++, keep);
    }
    for (const side of [-1, 1]) {
      for (let z = 4; z <= 16; z += 3.6) {
        const s: WallBit = { kind: 'end', a: (side * 9.7) / 0.8, b: 0.4, z, r: 1.5, turn: 0, tilt: 0, seed: 60 + n, back: false };
        boneEnd(S, W, s, WALL_BONE, 200 + n++, keep);
      }
    }
    // the keystone: a skull
    skull(S, { c: W(0, 1, 28.6), F: toW([0, 1, 0.1]), U: toW([0, 0, 1]), R: 3.8, jaw: null }, WALL_BONE, 300, keep);
    // in it: long bones stacked, and a skull on them
    for (let k = 0; k < 3; k++) longBone(S, W(-6.4 + k * 0.4, -3, 6 + k * 2.2), W(6.4 - k * 0.3, -2.4, 6.4 + k * 2.2), 1, dimBone, 310 + k);
    skull(S, { c: W(0.6, -2.6, 15), F: toW([0.25, 1, 0]), U: toW([0, 0, 1]), R: 3.7, jaw: null }, dimBone, 320);
  },
};

/** THE MINERS' BREACH, the wall's height: where they broke through into the ossuary: a ragged hole knocked through the stone, its edges broken, the dead stacked in the dark beyond it; a crack run up from it into the dark; their timber set in it, two posts and a cap, holding it up. What came out of it lies heaped on the floor before it (breachHeap). */
const BREACH = (u: number, v: number): boolean => {
  const half = 9.5 + 1.8 * Math.sin(v * 0.31 + 1) + 1.2 * Math.sin(v * 0.83);
  return v >= 0 && v <= 38 + 3 * Math.sin(u * 0.5) && Math.abs(u + 0.5) <= half * (v < 30 ? 1 : 1 - (v - 30) / 14);
};
const breach: WallMake = {
  flat: (p) => {
    // the broken stone round it: rough rock where the dressed stone has come away
    for (let v = 0; v <= 46; v++) {
      for (let u = -15; u <= 14; u++) {
        if (BREACH(u, v)) continue;
        const near = BREACH(u - 2, v) || BREACH(u + 2, v) || BREACH(u, v - 2) || BREACH(u, v + 2);
        const near2 = BREACH(u - 4, v) || BREACH(u + 4, v) || BREACH(u, v - 4);
        if (near) p.set(fx(u), fy(v), BREACH(u + 2, v) || BREACH(u, v - 2) ? RAW[3] : RAW[0]);
        else if (near2 && hash(u, v, 520) < 0.7) p.set(fx(u), fy(v), hash(u >> 1, v >> 1, 521) < 0.5 ? RAW[2] : RAW[1]);
      }
    }
    // the hole: dark
    for (let v = 0; v <= 46; v++) for (let u = -14; u <= 13; u++) if (BREACH(u, v)) p.set(fx(u), fy(v), v < 3 ? EARTH[1] : DEEP);
    // the crack up from it into the dark
    let u = 1;
    for (let v = 40; v <= 79; v++) {
      u = Math.max(-6, Math.min(6, u + Math.round((hash(v >> 2, 3, 522) - 0.5) * 1.6)));
      p.set(fx(u), fy(v), DEEP).set(fx(u + 1), fy(v), FACE[0]);
      if (v % 7 === 0) p.set(fx(u - 1), fy(v), DEEP);
    }
  },
  solid: (S, W) => {
    // the dead stacked beyond, dim in the dark
    let n = 0;
    for (const [a, z] of [[-6, 10], [5, 9], [-1, 19], [-7, 27], [6, 26]] as const) {
      skull(S, { c: W(a, -9, z), F: dirOf(W)([0.2 * Math.sin(a), 1, 0]), U: [0, 0, 1], R: 3.8, jaw: null }, dimBone, 400 + n++);
    }
    for (const z of [3.5, 14.5, 22.5]) for (let a = -9; a <= 8; a += 4.6) boneEnd(S, W, { kind: 'end', a: a + (z % 2) * 2, b: -9.5, z, r: 1.5, turn: 0, tilt: 0, seed: n, back: true }, dimBone, 400 + n++);
    // the miners' set: two posts, a cap across them, a wedge driven over it
    const ax = axesOf(W);
    const timber = (f: number, _u: number, v: number, nn: V3): string => (f === 4 ? TIMBER[3] : v < 0.04 && f !== 5 ? TIMBER[0] : toneAt(nn, TIMBER, -0.1));
    S.box(W(-14.2, 0.6, 22), ax, [2.2, 1.8, 22], timber, 500);
    S.box(W(13.4, 0.6, 22), ax, [2.2, 1.8, 22], timber, 501);
    S.box(W(-0.4, 1, 46), ax, [16.4, 2, 2.4], (f, u, v, nn) => (f === 4 ? (u < 0.02 ? TIMBER[4] : TIMBER[3]) : Math.abs(u - 0.5) < 0.01 ? TIMBER[0] : toneAt(nn, TIMBER, -0.1)), 510);
    S.box(W(-6, 0.6, 50), ax, [3.4, 1.6, 1.6], (f, _u, _v, nn) => (f === 4 ? TIMBER[3] : toneAt(nn, TIMBER, -0.1)), 511);
  },
};
/** WHAT CAME OUT OF THE BREACH, heaped on the floor before it: broken stone and earth, long bones and a skull out of the ossuary, a snapped haft. At the middle of the tile in front of the wall. */
function breachHeap(): Sprite {
  const W = 80;
  const H = 56;
  const cx = 40;
  const cy = 32;
  const S = new Scene(new Px(W, H), cx, cy);
  const under = new Px(W, H);
  // earth and grit in a fan out from the wall
  for (let i = 0; i < 600; i++) {
    const a = hash(i, 1, 523) * Math.PI;
    const r = Math.sqrt(hash(i, 2, 523)) * 22;
    const x = Math.round(cx - 3 + Math.cos(a) * r * 1.2);
    const y = Math.round(cy - 7 + Math.sin(a) * r * 0.5);
    under.set(x, y, hash(i, 3, 523) < 0.25 ? EARTH[3] : r > 15 ? EARTH[1] : EARTH[2]);
  }
  // lumps of broken stone and rock
  let n = 0;
  for (const [x, y, r] of [[-14, -12, 4.6], [-4, -16, 5.4], [8, -10, 4], [14, -14, 3.4], [-10, 0, 3], [2, -4, 3.2], [-18, -2, 2.6]] as const) {
    S.egg([x, y, r * 0.55], [[1, 0, 0], [0, 1, 0], [0, 0, 1]], [r * 1.1, r * 0.9, r * 0.7], (nn) => toneAt(nn, n % 2 ? RAW : STONE), 600 + n++);
  }
  // the dead out of it (a step quieter than what lies in the room: it is the wall's)
  longBone(S, [-6, 4, 1.4], [8, 10, 1.6], 1.1, HEAP_BONE, 620);
  longBone(S, [4, -2, 3.6], [-8, -8, 4.6], 1.1, HEAP_BONE, 621);
  skull(S, { c: [10, 2, 4.2], F: [0.8, 1, 0.3], U: [0, 0, 1], R: 4.4, jaw: null }, HEAP_BONE, 622);
  // a snapped haft
  S.rod([-16, 8, 1.4], [-4, 14, 1.4], 1, 1, TIMBER, 623);
  S.seams();
  return compose(under, [S.p], null).sprite(cx, cy, GRAIN);
}

/** SHORED ROCK, the wall's height: the wall fallen in to rough rock and earth, and the miners' timber holding it back: two posts up into the dark, boards laid across behind them, the rock bulging between, earth spilled from a gap at the foot. */
const shoredRock: WallMake = {
  flat: (p) => {
    // the rock: lumps, each lit on its upper left, dark between
    for (let v = 0; v <= 79; v++) {
      for (let u = -14; u <= 13; u++) {
        const cu = Math.floor((u + 40) / 6);
        const cv = Math.floor((v + (cu % 2) * 3) / 6);
        const lu = (u + 40) % 6;
        const lv = (v + (cu % 2) * 3) % 6;
        const k = hash(cu, cv, 524);
        const c = lu === 0 || lv === 0 ? RAW[0] : lu === 1 || lv === 5 ? RAW[3] : k < 0.3 ? RAW[1] : RAW[2];
        p.set(fx(u), fy(v), c);
      }
    }
    // the boards across, behind the posts, gaps between them where the rock shows
    for (const v0 of [3, 13, 23, 33, 43, 53, 63, 73]) {
      if (v0 === 23) continue;
      for (let u = -12; u <= 11; u++) {
        const sag = Math.round(Math.sin(((u + 12) / 23) * Math.PI) * (v0 === 33 ? 1.4 : 0.5));
        for (let k = 0; k < 6; k++) p.set(fx(u), fy(v0 + k - sag), k === 5 ? TIMBER[3] : k === 0 ? TIMBER[0] : (u + v0) % 9 === 0 ? TIMBER[0] : TIMBER[2]);
      }
    }
    // the gap at its foot, and earth spilled out of it
    for (let u = -6; u <= 4; u++) for (let v = 0; v <= 2 + Math.round(2 * Math.sin(((u + 6) / 10) * Math.PI)); v++) p.set(fx(u), fy(v), v > 2 ? EARTH[3] : EARTH[2]);
    // the posts
    for (const u0 of [-14, 11]) {
      for (let v = 0; v <= 79; v++) {
        p.set(fx(u0), fy(v), TIMBER[3]).set(fx(u0 + 1), fy(v), TIMBER[2]).set(fx(u0 + 2), fy(v), TIMBER[2]).set(fx(u0 + 3), fy(v), TIMBER[0]);
        if (v % 11 === 4) p.set(fx(u0 + 1), fy(v), TIMBER[0]);
      }
    }
  },
};

/** THE DEAD'S ARM: a crack broken in the stone, and an arm of bone reaching out of it, its hand hooked over the broken edge, clawing at the stone. */
const deadArm: WallMake = {
  flat: (p) => {
    // the crack: a ragged dark split, its lips broken
    const crack = (u: number, v: number): boolean => {
      const c = 3 * Math.sin(v * 0.35) - 1;
      const w = 2.2 + 1.4 * Math.sin(v * 0.9) + (v > 14 && v < 26 ? 2 : 0);
      return v >= 4 && v <= 34 && Math.abs(u - c) < w;
    };
    for (let v = 2; v <= 36; v++) {
      for (let u = -12; u <= 10; u++) {
        if (crack(u, v)) p.set(fx(u), fy(v), DEEP);
        else if (crack(u - 1, v) || crack(u, v + 1)) p.set(fx(u), fy(v), FACE[0]);
        else if (crack(u + 1, v) || crack(u, v - 1)) p.set(fx(u), fy(v), FACE[4]);
      }
    }
  },
  solid: (S, W, alongX) => {
    const keep = (w: V3): boolean => (alongX ? w[1] : w[0]) >= -3;
    // the upper arm out of the crack, the forearm bent down across the face, the hand's fingers hooked over the crack's lip
    const sh = W(0, -2.5, 25);
    const el = W(-7, 4.5, 23);
    const wr = W(-12, 2.6, 14);
    longBone(S, sh, el, 1.3, WALL_BONE, 700, keep);
    S.rod(el, wr, 1, 0.9, WALL_BONE, 701, keep);
    S.rod(add(el, W(1.4, 0, 0)), add(wr, W(1.2, 0, -0.2)), 0.8, 0.8, WALL_BONE, 702, keep);
    S.ball(el, 1.9, WALL_BONE, 703, keep);
    // the hand: its back, and the fingers clawing down the stone
    const pa = W(-12.6, 2, 11);
    S.egg(pa, [norm(sub(W(1, 0, 0), W(0, 0, 0))), norm(sub(W(0, 1, 0), W(0, 0, 0))), [0, 0, 1]], [2.6, 1, 2.4], (n) => toneAt(n, WALL_BONE), 704, keep);
    for (let k = 0; k < 5; k++) {
      const a0 = -15.4 + k * 1.5;
      const z0 = 10 - (k === 0 ? 0 : 1);
      const k1 = W(a0 - (k === 0 ? 2 : 0.4), 1.6, z0 - 3.6);
      S.rod(W(a0 + 0.6, 1.8, z0), k1, 0.6, 0.55, WALL_BONE, 705 + k, keep);
      S.rod(k1, W(a0 - (k === 0 ? 2.8 : 0.6), 0.6, z0 - 6.2 + (k % 2)), 0.5, 0.4, WALL_BONE, 705 + k, keep);
    }
  },
};

/** A SEAM OF ORE in rough rock where the miners dug: the rock hacked back round it, the scores of their picks, the dull ore in a band across it, a lump half out. */
function oreSeam(p: Px): void {
  const inside = (u: number, v: number): boolean => ((u + 0.5) / 13) ** 2 + ((v - 14) / 10) ** 2 <= 1;
  for (let v = 3; v <= 25; v++) {
    for (let u = -14; u <= 13; u++) {
      if (!inside(u, v)) continue;
      const band = Math.abs(v - 14 - (u + 0.5) * 0.28) < 3 + Math.sin(u * 0.7);
      const edgeLit = !inside(u - 1, v) || !inside(u, v + 1);
      const edgeDark = !inside(u + 1, v) || !inside(u, v - 1);
      let c = edgeLit ? RAW[0] : edgeDark ? RAW[3] : hash(u >> 1, v >> 1, 530) < 0.4 ? RAW[1] : RAW[2];
      if (band && !edgeLit && !edgeDark) c = hash(u, v, 531) < 0.1 ? ORE[4] : hash(u >> 1, v, 532) < 0.5 ? ORE[2] : ORE[1];
      p.set(fx(u), fy(v), c);
    }
  }
  // the scores of the picks, short and slanting
  for (let i = 0; i < 9; i++) {
    const u0 = -11 + Math.floor(hash(i, 1, 533) * 22);
    const v0 = 6 + Math.floor(hash(i, 2, 533) * 16);
    for (let k = 0; k < 3; k++) p.set(fx(u0 + k), fy(v0 + k), DEEP).set(fx(u0 + k + 1), fy(v0 + k), RAW[3]);
  }
  // a lump of it hacked half out
  ball(p, fx(6), fy(12), 2.6, 2.2, ORE);
}

/** WHERE THE STONE HAS FALLEN AWAY: packed earth behind, and the dead in it as they were laid, long bones every way and a skull, half sunk. */
const charnelLayer: WallMake = {
  flat: (p) => {
    const top = (u: number): number => 22 + Math.round(3 * Math.sin(u * 0.4) + 2 * Math.sin(u * 1.3));
    for (let u = -14; u <= 13; u++) {
      for (let v = 1; v <= top(u); v++) {
        const edge = v === top(u);
        p.set(fx(u), fy(v), edge ? FACE[0] : hash(u >> 1, v >> 1, 534) < 0.25 ? EARTH[2] : hash(u, v, 535) < 0.1 ? EARTH[3] : EARTH[1]);
      }
      // the stone's broken edge over it
      p.set(fx(u), fy(top(u) + 1), FACE[4]).set(fx(u), fy(top(u) + 2), FACE[2]);
    }
  },
  solid: (S, W, alongX) => {
    const keep = inFront(alongX);
    longBone(S, W(-15, -0.6, 6), W(4, 0.2, 9), 1.2, WALL_BONE, 800, keep);
    longBone(S, W(-2, -0.4, 15), W(14, 0.3, 19), 1.1, WALL_BONE, 801, keep);
    longBone(S, W(8, -0.5, 3), W(15, 0.4, 13), 1, WALL_BONE, 802, keep);
    longBone(S, W(-14, -0.6, 17), W(-9, 0.2, 21.5), 1, WALL_BONE, 803, keep);
    skull(S, { c: W(-5, -1.2, 13), F: dirOf(W)([0.5, 0.8, 0.3]), U: [0, 0, 1], R: 4, jaw: null }, WALL_BONE, 804, keep);
  },
};

// =================================================================================================
// ON THE WALLS

/** A MINER'S LANTERN hung from a spike driven into the stone: an iron frame with a peaked cap and a ring, its glass lit by the flame inside: frame `f` of four. */
function minersLantern(f: number): (p: Px) => void {
  return (p) => {
    // the spike, and the ring the lantern hangs from
    for (let u = -2; u <= 1; u++) p.set(fx(u), fy(44), SMALL_IRON[3]).set(fx(u), fy(43), SMALL_IRON[1]);
    for (let a = 0; a < Math.PI * 2; a += 0.4) p.set(fx(Math.round(Math.cos(a) * 1.6)), fy(Math.round(41 + Math.sin(a) * 1.6)), Math.cos(a) < 0 ? SMALL_IRON[3] : SMALL_IRON[1]);
    // the cap, peaked
    for (let v = 34; v <= 38; v++) {
      const half = 1 + (38 - v) * 1.1;
      for (let u = -Math.round(half); u <= Math.round(half) - 1; u++) p.set(fx(u), fy(v), u < 0 ? IRONS[3] : IRONS[1]);
    }
    // the body: its frame of bars round two panes of glass, the fire in it
    for (let v = 23; v <= 33; v++) {
      for (let u = -5; u <= 4; u++) {
        const bar = u === -5 || u === 4 || u === 0 || u === -1 || v === 23 || v === 33;
        if (bar) p.set(fx(u), fy(v), u <= -1 ? IRONS[3] : IRONS[1]);
        else p.set(fx(u), fy(v), v < 26 ? EMBER[0] : (f + u + v) % 5 === 0 ? EMBER[2] : EMBER[1]);
      }
    }
    // the flame
    flame(p, fx(-1), fy(25), 6 + (f % 2), 1.6, [0, 1, 0, -1][f]);
    // its foot
    for (let u = -6; u <= 5; u++) p.set(fx(u), fy(22), IRONS[2]).set(fx(u), fy(21), IRONS[0]);
  };
}

/** A PICK DRIVEN INTO THE WALL: its point sunk in a split it made in the stone, the other arm of its head out, its haft hanging down along the wall. */
function pickInWall(p: Px): void {
  // the split in the stone round its point
  for (let k = 0; k < 7; k++) p.set(fx(6 + k), fy(34 + Math.round(k * 0.6)), DEEP).set(fx(6 + k), fy(33 + Math.round(k * 0.6)), FACE[4]);
  for (let k = 0; k < 4; k++) p.set(fx(9 - k), fy(30 - k), DEEP);
  const a = flat();
  // the head: its eye at the haft, one arm into the wall, the other out and curving down
  for (let k = 0; k <= 8; k++) a.set(fx(5 - k), fy(35 + Math.round(Math.sin((k / 8) * 1.6) * 3)), IRONS[3]).set(fx(5 - k), fy(34 + Math.round(Math.sin((k / 8) * 1.6) * 3)), IRONS[2]).set(fx(5 - k), fy(33 + Math.round(Math.sin((k / 8) * 1.6) * 3)), k > 5 ? RUST[2] : IRONS[0]);
  a.rect(fx(4), fy(37), 4, 5, IRONS[2]).set(fx(4), fy(37), IRONS[3]).set(fx(5), fy(37), IRONS[3]);
  // the haft, hanging down and out at a slant
  for (let k = 0; k <= 24; k++) {
    const u = 5 + Math.round(k * 0.42);
    const v = 32 - k;
    a.set(fx(u), fy(v), TIMBER[3]).set(fx(u + 1), fy(v), TIMBER[2]).set(fx(u + 2), fy(v), TIMBER[0]);
  }
  p.blit(compose(null, [a], null), 0, 0);
}

/** THE CULT'S CANDLE: a skull fixed on an iron spike in the wall, a fat black candle burning on its crown, the wax run down over its brow; a stub burning on the spike beside it: frame `f` of four. */
function cultCandle(f: number): WallMake {
  return {
    flat: (p) => {
      for (let u = -3; u <= 4; u++) p.set(fx(u), fy(25), SMALL_IRON[2]).set(fx(u), fy(24), SMALL_IRON[0]);
      // the stub on the spike's end, and its flame
      for (let v = 26; v <= 28; v++) p.set(fx(7), fy(v), WAX[3]).set(fx(8), fy(v), WAX[2]);
      flame(p, fx(7.5), fy(29), 4 + ((f + 1) % 2), 1.2, [1, 0, -1, 0][f]);
    },
    solid: (S, W, alongX) => {
      const toW = (v: V3): V3 => sub(W(v[0], v[1], v[2]), W(0, 0, 0));
      skull(S, { c: W(-1, 2.4, 30), F: toW([0, 1, 0.05]), U: toW([0, 0, 1]), R: 4.8, jaw: 0.05 }, BONE, 900, inFront(alongX));
      // the candle on its crown, and the wax run down over it
      S.rod(W(-1.2, 2.4, 35), W(-1.2, 2.4, 41.5), 1.9, 1.9, WAX, 901);
      for (const [a, z0, z1] of [[-3.2, 36, 31], [0.6, 36, 33], [-1.8, 36, 34]] as const) S.rod(W(a, 3.6, z0), W(a, 4.6, z1), 0.6, 0.55, WAX, 902);
    },
  };
}
function cultCandleFlame(f: number): (p: Px) => void {
  return (p) => flame(p, fx(-1), fy(42), 6 + (f % 2), 1.6, [0, 1, 0, -1][f]);
}

/** A GARLAND OF SKULLS: four small skulls strung on a rope swagged across the wall from two spikes, each hanging its own way. */
const garland: WallMake = {
  flat: (p) => {
    for (const u of [-14, 13]) p.set(fx(u), fy(34), SMALL_IRON[3]).set(fx(u), fy(33), SMALL_IRON[1]);
    for (let u = -14; u <= 13; u++) {
      const v = 33 - Math.round(9 * (1 - ((u + 0.5) / 13.5) ** 2));
      p.set(fx(u), fy(v), ROPE[3]).set(fx(u), fy(v - 1), ROPE[1]);
    }
  },
  solid: (S, W, alongX) => {
    const toW = (v: V3): V3 => sub(W(v[0], v[1], v[2]), W(0, 0, 0));
    for (const [k, u] of [[0, -8.4], [1, -2.8], [2, 2.8], [3, 8.4]] as const) {
      const v = 33 - 9 * (1 - ((u + 0.5) / 13.5) ** 2) - 3.6;
      const t = (hash(k, 1, 540) - 0.5) * 0.8;
      skull(S, { c: W(u / 0.8, 3, v), F: toW([Math.sin(t), Math.cos(t), -0.1]), U: toW([0, 0, 1]), R: 3.4, jaw: null }, BONE, 950 + k, inFront(alongX));
    }
  },
};

/** THE MINERS' LADDER, the wall's height: two rough rails up the wall into the dark, rungs pegged between them, one of them broken. */
function ladder(p: Px): void {
  for (let v = 0; v <= 79; v++) {
    const lean = Math.round(v * 0.03);
    for (const [u0, lit_] of [[-7, true], [4, false]] as const) {
      const u = u0 + lean;
      p.set(fx(u), fy(v), lit_ ? TIMBER[3] : TIMBER[2]).set(fx(u + 1), fy(v), TIMBER[2]).set(fx(u + 2), fy(v), TIMBER[0]);
    }
    if (v % 9 === 5 && v !== 32) for (let u = -5 + lean; u <= 3 + lean; u++) p.set(fx(u), fy(v), TIMBER[3]).set(fx(u), fy(v - 1), TIMBER[0]);
  }
  // the broken rung: its two stubs
  for (const [u, k] of [[-6, 1], [2, -1]] as const) p.set(fx(u + 2), fy(32), TIMBER[3]).set(fx(u + 2 + k), fy(32), TIMBER[3]).set(fx(u + 2 + k * 2), fy(31), TIMBER[4]);
}

/** THE MINERS' TOOLS, hung on spikes: a shovel and a sledgehammer, each at its own slant, their iron rusted. */
function minersTools(p: Px): void {
  const t = flat();
  for (const u of [-6, 6]) t.set(fx(u), fy(46), SMALL_IRON[3]).set(fx(u + 1), fy(46), SMALL_IRON[1]);
  // the shovel: its haft from the spike down, its blade broad and pointed at the foot
  for (let k = 0; k <= 22; k++) {
    const u = -6 - Math.round(k * 0.12);
    t.set(fx(u), fy(45 - k), TIMBER[3]).set(fx(u + 1), fy(45 - k), TIMBER[0]);
  }
  for (let v = 9; v <= 23; v++) {
    const half = v > 13 ? 4 : 1 + (v - 9) * 0.75;
    for (let u = -Math.round(half); u <= Math.round(half) - 1; u++) {
      const U = -9 + u;
      t.set(fx(U), fy(v), hash(U, v, 541) < 0.3 ? RUST[2] : u < -half + 1.5 ? IRONS[3] : u > half - 1.5 ? IRONS[0] : IRONS[2]);
    }
  }
  // the sledge: its haft slanting, its head across its foot
  for (let k = 0; k <= 22; k++) {
    const u = 6 + Math.round(k * 0.3);
    t.set(fx(u), fy(45 - k), TIMBER[3]).set(fx(u + 1), fy(45 - k), TIMBER[0]);
  }
  for (let v = 18; v <= 23; v++) for (let u = 8; u <= 18; u++) {
    const U = u - 2;
    t.set(fx(U), fy(v), v === 23 ? IRONS[3] : U === 6 ? IRONS[3] : hash(U, v, 542) < 0.35 ? RUST[2] : v < 19 ? IRONS[0] : IRONS[2]);
  }
  p.blit(compose(null, [t], null), 0, 0);
}

/**
 * THE MAW, the amalgamation's own, as a mark: a wide mouth with square-cut corners (never the almond
 * of an eye), great fangs hanging from its upper lip and standing from its lower one, crossing. (x, y)
 * across and up, in half its width; what is there: its lip, a fang, or the dark inside it.
 */
function mawAt(x: number, y: number): 'lip' | 'fang' | 'in' | null {
  if (Math.abs(x) > 1) return null;
  const h = 0.5 * Math.sqrt(Math.max(0, 1 - x ** 6)) + 0.03 * Math.sin(x * 13);
  if (Math.abs(y) > h + 0.13) return null;
  if (Math.abs(y) > h) return 'lip';
  // (great fangs, few, crooked and of every length: never a row so even it could be read as a letter)
  for (const [c, len, up, w] of [[-0.58, 0.8, 1, 0.15], [-0.18, 0.42, 1, 0.1], [0.3, 0.95, 1, 0.17], [0.7, 0.45, 1, 0.1], [-0.36, 0.55, -1, 0.13], [0.52, 0.66, -1, 0.14]] as const) {
    const d = up > 0 ? h - y : y + h;
    const L = len * 2 * h;
    if (d < L && Math.abs(x - c - (d / L) * 0.04 * Math.sign(c)) < w * (1 - d / L) + 0.012) return 'fang';
  }
  return 'in';
}

/** THE CULT'S DAUB: the maw, the amalgamation's, daubed large in old soot on the stone by those who serve it, its fangs daubed in bone-white over it, the soot smeared out round it. */
function cultDaub(p: Px): void {
  for (let v = 14; v <= 38; v++) {
    for (let u = -15; u <= 14; u++) {
      const x = (u + 0.5) / 13.5;
      const y = (v - 26) / 13.5;
      const k = mawAt(x, y);
      if (k === 'in') p.set(fx(u), fy(v), SOOT[0]);
      else if (k === 'lip') p.set(fx(u), fy(v), SOOT[1]);
      else if (k === 'fang') p.set(fx(u), fy(v), mawAt((u - 0.5) / 13.5, y) === 'fang' ? WALL_BONE[3] : WALL_BONE[4]);
      else if (Math.abs(x) < 1.1 && Math.abs(y) < 0.78 && hash(u >> 1, v >> 1, 545) < 0.4 - Math.abs(y) * 0.3) p.set(fx(u), fy(v), SOOT[2]);
    }
  }
}

/** A RIB CAGE ON A SPIKE: the ribs of one of the dead hung up by its spine on an iron spike, curving out from the wall. */
const ribsOnSpike: WallMake = {
  flat: (p) => {
    for (let u = -2; u <= 1; u++) p.set(fx(u), fy(44), SMALL_IRON[3]).set(fx(u), fy(43), SMALL_IRON[1]);
  },
  solid: (S, W, alongX) => {
    const toW = (v: V3): V3 => sub(W(v[0], v[1], v[2]), W(0, 0, 0));
    ribCage(S, W(0, 3.4, 32), toW([0, 0, 1]), toW([0.15, 1, 0]), 9, BONE, 980, inFront(alongX));
  },
};

/** THE DART SLOT, on this floor: a row of the dead's jaws set in the stone round a dark slot, their teeth along its lips, the darts' points glinting in it. */
const jawSlot: WallMake = {
  flat: (p) => {
    relief(p, FACE, (u, v) => Math.abs(u + 0.5) <= 12.5 && v >= 18 && v <= 34, -13, 12, 18, 34);
    for (let u = -9; u <= 8; u++) for (let v = 25; v <= 27; v++) p.set(fx(u), fy(v), DEEP);
    for (const u of [-6, 0, 6]) p.set(fx(u), fy(26), DIM_IRON[3]);
    p.set(fx(-3), fy(26), GLINT);
  },
  solid: (S, W, alongX) => {
    const keep = inFront(alongX);
    // the jaws: an arch of bone each, teeth up on the lower ones and down on the upper
    for (const [row, z, up] of [[0, 29.4, -1], [1, 22.6, 1]] as const) {
      for (let k = 0; k < 3; k++) {
        const a0 = (-8.4 + k * 8.4) / 0.8;
        let prev: V3 | null = null;
        for (let t = -1; t <= 1.001; t += 0.25) {
          const w = W(a0 + t * 4.4, 0.8 + (1 - t * t) * 1.2, z - up * (1 - t * t) * 1.6);
          if (prev) S.rod(prev, w, 0.8, 0.8, WALL_BONE, 990 + row * 3 + k, keep);
          prev = w;
        }
        for (let t = -0.75; t <= 0.76; t += 0.375) S.rod(W(a0 + t * 4.4, 1.2, z - up * 0.4), W(a0 + t * 4.4, 1.2, z + up * 1.6), 0.45, 0.4, WALL_BONE, 990 + row * 3 + k, keep);
      }
    }
  },
};

// =================================================================================================
// FLOOR TILES (a tile's picture, anchored at its top corner, as the floor's own)

/** The earth the floor has gone to: dark plum, mottled, a clod lit here and there. */
function earthAt(u: number, v: number, seed = 0): string {
  const g = hash(Math.floor(u * 22), Math.floor(v * 22), 550 + seed);
  const m = hash(Math.floor(u * 6), Math.floor(v * 6), 551 + seed);
  return g < 0.07 ? EARTH[3] : g < 0.16 ? EARTH[0] : m < 0.4 ? EARTH[2] : EARTH[1];
}
/** Is (x, y) (from the tile's middle) within `w` of the segment from (x0, y0) to (x1, y1)? And how far along it, and to which side. */
function onSeg(x: number, y: number, x0: number, y0: number, x1: number, y1: number): { d: number; t: number; side: number } {
  const dx = x1 - x0;
  const dy = y1 - y0;
  const L2 = dx * dx + dy * dy || 1;
  const t = Math.max(0, Math.min(1, ((x - x0) * dx + (y - y0) * dy) / L2));
  const px = x - (x0 + dx * t);
  const py = y - (y0 + dy * t);
  return { d: Math.hypot(px, py), t, side: px * -dy + py * dx };
}

/** THE MINERS' RAILS: two iron rails on timber sleepers set in the earth, gravel between; along x, or along y. The cart runs on them. */
function railsTile(alongX: boolean) {
  return (u: number, v: number): string | null => {
    const [x, y] = mid(u, v);
    const [s, t] = alongX ? [x, y] : [y, x];
    // the rails: a worn top catching the light, and its side in shade below it (toward the eye)
    for (const r of [-0.19, 0.19]) {
      const d = t - r;
      if (Math.abs(d) < 0.022) return hash(Math.floor((s + 1) * 30), 0, 552) < 0.12 ? '#5a5690' : DIM_IRON[3];
      if (d >= 0.022 && d < 0.045) return DIM_IRON[0];
    }
    // the sleepers across, their spikes by the rails
    const k = (s + 0.5) * 5;
    const sl = Math.abs((k % 1) - 0.5) < 0.17;
    if (sl && Math.abs(t) < 0.33) {
      if (Math.abs(Math.abs(t) - 0.25) < 0.02 && Math.abs((k % 1) - 0.5) < 0.06) return DIM_IRON[3];
      const edge = Math.abs((k % 1) - 0.5) > 0.13;
      return edge ? ((k % 1) - 0.5 < 0 ? TIMBER[3] : TIMBER[0]) : TIMBER[2];
    }
    // gravel between, earth beyond
    if (Math.abs(t) < 0.3) return hash(Math.floor(u * 30), Math.floor(v * 30), 553) < 0.3 ? RAW[2] : hash(Math.floor(u * 30), Math.floor(v * 30), 554) < 0.5 ? RAW[1] : EARTH[1];
    return earthAt(u, v, 1);
  };
}

/** EARTH AND BONES: the earth turned over, broken long bones pressed into it, a skull face up in it, staring, teeth here and there. */
function earthAndBones(u: number, v: number): string | null {
  const [x, y] = mid(u, v);
  const bones: ReadonlyArray<readonly [number, number, number, number]> = [[-0.36, -0.06, -0.06, -0.24], [0.06, 0.2, 0.36, 0.04], [-0.26, 0.2, -0.06, 0.36], [0.1, -0.34, 0.3, -0.14], [-0.34, 0.06, -0.2, 0.14]];
  for (const [x0, y0, x1, y1] of bones) {
    const sg = onSeg(x, y, x0, y0, x1, y1);
    const w = sg.t < 0.1 || sg.t > 0.9 ? 0.042 : 0.026;
    if (sg.d < w) return sg.side < 0 ? (sg.d > w * 0.5 ? WALL_BONE[4] : WALL_BONE[3]) : sg.d > w * 0.55 ? WALL_BONE[1] : WALL_BONE[2];
    if (sg.d < w + 0.02 && sg.side > 0) return EARTH[0];
  }
  // a skull face up, sunk to its brow: its crown, two sockets, its nose
  const sx = x + 0.02;
  const sy = y - 0.04;
  const sk = Math.hypot(sx / 1.05, sy);
  if (sk < 0.13) {
    for (const e of [-0.045, 0.045]) if (Math.hypot(sx - sy - e * 1.4, (sx + sy) * 1.6 - 0.07) < 0.035) return DEEP;
    if (Math.abs(sx - sy) < 0.015 && (sx + sy) * 1.6 > 0.13 && (sx + sy) * 1.6 < 0.17) return DEEP;
    return sk > 0.105 ? (sx + sy < 0 ? WALL_BONE[4] : WALL_BONE[1]) : sx + sy < -0.05 ? WALL_BONE[3] : WALL_BONE[2];
  }
  if (sk < 0.15) return EARTH[0];
  // teeth, here and there
  if (hash(Math.floor(u * 32), Math.floor(v * 32), 555) < 0.02) return WALL_BONE[3];
  return earthAt(u, v, 2);
}

/** WHERE ITS HANDS RAKED THE EARTH: five deep grooves dragged right across, close together where they start and fanned out where they end, the earth heaped along their lips. */
function clawRaked(u: number, v: number): string | null {
  const [x, y] = mid(u, v);
  for (let k = 0; k < 5; k++) {
    const spread = (k - 2) * (0.035 + 0.075 * (x + 0.5));
    const c = -0.02 + spread + 0.05 * Math.sin(x * 4 + k * 0.4);
    const d = y - c;
    const live = x > -0.46 + Math.abs(k - 2) * 0.03 && x < 0.44 - Math.abs(k - 2) * 0.04;
    if (!live) continue;
    const w = 0.026 * (1.1 - Math.abs(x) * 0.5);
    if (Math.abs(d) < w) return DEEP;
    if (d < 0 && d > -w - 0.022) return EARTH[0];
    if (d > 0 && d < w + 0.026) return EARTH[3];
  }
  return earthAt(u, v, 3);
}

/** A FLOOR PAVED WITH BONE: the ends of long bones set upright in the earth, packed close as cobbles, each with the dark of its marrow in it; a skull's crown among them. Laid in a slab of the floor. */
function bonePaved(u: number, v: number): string | null {
  const [x, y] = mid(u, v);
  let best = 9;
  let next = 9;
  let bk = 0;
  let bx = 0;
  let by = 0;
  for (let i = -4; i <= 4; i++) {
    for (let j = -5; j <= 5; j++) {
      const cx = (i + (j % 2 ? 0.5 : 0)) * 0.13 + (hash(i, j, 556) - 0.5) * 0.025;
      const cy = j * 0.11 + (hash(i, j, 557) - 0.5) * 0.025;
      const d = Math.hypot(x - cx, y - cy);
      if (d < best) {
        next = best;
        best = d;
        bk = i * 31 + j;
        bx = x - cx;
        by = y - cy;
      } else if (d < next) next = d;
    }
  }
  if (next - best < 0.016 || best > 0.062) return EARTH[0];
  const crown = hash(bk, 1, 558) < 0.08;
  if (!crown && best < 0.016) return DEEP;
  // each end lit on its upper left, in shade on its lower right
  const toL = bx + by;
  return toL < -0.03 ? WALL_BONE[4] : toL > 0.03 ? WALL_BONE[1] : crown ? WALL_BONE[3] : WALL_BONE[2];
}

/** THE DRAG: where the heap of the dead hauled itself through the earth, along x: a broad furrow smoothed and scored along its way, its banks heaped, and either side of it where its hands gripped, gouges in fives. */
function dragTrail(u: number, v: number): string | null {
  const [x, y] = mid(u, v);
  const c = 0.04 * Math.sin(x * 5);
  const d = y - c;
  if (Math.abs(d) < 0.17) {
    // the furrow: scored along
    if (hash(0, Math.floor((d + 0.2) * 70), 559) < 0.22) return EARTH[0];
    return d < -0.12 ? EARTH[1] : EARTH[2];
  }
  if (d <= -0.17 && d > -0.22) return EARTH[3];
  if (d >= 0.17 && d < 0.21) return EARTH[0];
  // the hands' gouges: a fan of five short scores, by turns on either bank
  for (const [hx, side] of [[-0.3, -1], [-0.05, 1], [0.22, -1], [0.42, 1]] as const) {
    const hy = c + side * 0.3;
    for (let k = 0; k < 5; k++) {
      const ang = (k - 2) * 0.3 + (side < 0 ? 0 : Math.PI);
      const s = onSeg(x, y, hx + Math.cos(ang + Math.PI / 2) * 0.02, hy, hx - Math.sin(ang) * 0.08 + Math.cos(ang + Math.PI / 2) * 0.02, hy - side * Math.cos(ang) * 0.06);
      if (s.d < 0.012) return DEEP;
    }
  }
  return earthAt(u, v, 4);
}

/** SPILLED ORE: lumps of ore and grit spilled across the floor's stones from a cart that went over. */
function spilledOre(u: number, v: number): string | null {
  const [x, y] = mid(u, v);
  for (let i = 0; i < 14; i++) {
    const cx = (hash(i, 1, 560) - 0.5) * 0.72;
    const cy = (hash(i, 2, 560) - 0.5) * 0.5 + cx * 0.4;
    const r = 0.04 + 0.045 * hash(i, 3, 560);
    const d = Math.hypot(x - cx, (y - cy) * 1.15);
    if (d < r) {
      const toL = (x - cx) + (y - cy);
      return toL < -r * 0.5 ? RAW[3] : toL > r * 0.45 ? ORE[0] : hash(i, 4, 560) < 0.5 && d < r * 0.35 ? ORE[4] : ORE[2];
    }
    if (d < r + 0.02 && (x - cx) + (y - cy) > 0) return SLAB[0];
  }
  if (hash(Math.floor(u * 30), Math.floor(v * 30), 561) < 0.1) return ORE[1];
  return around(u, v);
}

// =================================================================================================
// TRAPS

/** BONE SPIKES: the earth with a scatter of holes in it, their lips heaped; with `ready`, the warning: the sharpened points of bones risen in every hole, pale, catching the light. Anchored at the middle. */
const SPIKE_HOLES: ReadonlyArray<readonly [number, number]> = [[-0.22, -0.22], [0.06, -0.26], [0.27, -0.06], [-0.27, 0.06], [-0.02, 0.0], [0.22, 0.2], [-0.08, 0.27]];
function boneSpikes(ready: boolean): Sprite {
  const t = tileOf(
    (u, v) => {
      const [x, y] = mid(u, v);
      for (const [hx, hy] of SPIKE_HOLES) {
        const dx = x - hx;
        const dy = y - hy;
        const d = Math.hypot(dx * 1.1, dy);
        if (d < 0.065) {
          if (ready) return d < 0.022 ? WALL_BONE[4] : dx + dy < 0 ? WALL_BONE[3] : WALL_BONE[1];
          return d < 0.05 ? DEEP : EARTH[0];
        }
        if (d < 0.09) return dx + dy > 0 ? RAW[3] : EARTH[0];
      }
      return earthAt(u, v, 5);
    },
  ).sprite(32, 0, GRAIN);
  return { ...t, ay: t.ay + 8 };
}

/** ROTTEN BOARDS over an old shaft, in a collar of timber: five planks, rot eaten into them; trodden on, `giving`, they sag and split, the dark showing between them. Anchored at the middle. */
function rottenBoards(giving: boolean): Sprite {
  const t = tileOf(
    (u, v) => {
      const [x, y] = mid(u, v);
      // the collar
      if (Math.abs(x) > 0.33 || Math.abs(y) > 0.33) {
        if (Math.abs(x) > 0.42 || Math.abs(y) > 0.42) return null;
        return x < -0.37 || y < -0.37 ? TIMBER[3] : Math.abs(x) > 0.39 || Math.abs(y) > 0.39 ? TIMBER[0] : TIMBER[2];
      }
      // the boards, along y, a gap between each
      const k = (x + 0.33) * (5 / 0.66);
      const f = k % 1;
      const plank = Math.floor(k);
      const sag = giving ? Math.max(0, 1 - (x * x + y * y) / 0.1) : 0;
      if (f < (giving ? 0.14 : 0.08)) return DEEP;
      if (giving && plank === 2 && Math.abs(y - 0.03 * Math.sin(x * 30)) < 0.035) return DEEP;
      if (f < 0.2) return sag > 0.4 ? TIMBER[0] : TIMBER[3];
      if (hash(plank, Math.floor((y + 0.5) * 9), 562) < 0.18) return EARTH[1];
      if (Math.abs(((y + 0.5) * 7 + plank * 0.37) % 1 - 0.5) < 0.05) return TIMBER[0];
      return sag > 0.5 ? TIMBER[0] : sag > 0.15 ? mix(TIMBER[0], TIMBER[2], 0.5) : TIMBER[2];
    },
  ).sprite(32, 0, GRAIN);
  return { ...t, ay: t.ay + 8 };
}

// =================================================================================================
// BREAKABLES: standing at the middle of their foot

/** AN ORE SACK: coarse sacking stuffed with ore, lumpy where the stones press it out, its neck bunched and tied with rope. 32 x 42 at (16, 36). */
function oreSack(): Sprite {
  const W = 32;
  const H = 42;
  const cx = 16;
  const foot = 36;
  const body = new Px(W, H);
  const tie = new Px(W, H);
  lit(body, SACK, [1, 3], [1, 4], (l) => {
    for (let y = 12; y <= foot - 1; y++) {
      const t = (y - 12) / (foot - 13);
      const half = 4 + 7.5 * Math.sin(Math.min(1, t * 1.25) * (Math.PI / 2)) + 0.8 * Math.sin(y * 1.3) - (t > 0.92 ? (t - 0.92) * 20 : 0);
      l.rect(Math.round(cx - half), y, Math.round(half * 2), 1, INK);
    }
    l.ellipse(cx, 10, 3, 3.2, INK);
  });
  // the lumps of ore pressing it out
  for (const [x, y] of [[-5, 24], [3, 20], [5, 29], [-2, 31]] as const) body.set(cx + x, y, SACK[4]).set(cx + x + 1, y + 1, SACK[1]);
  // the rope round its neck
  for (let x = cx - 4; x <= cx + 3; x++) tie.set(x, 13, ROPE[3]).set(x, 14, ROPE[1]);
  tie.set(cx + 4, 15, ROPE[2]).set(cx + 5, 16, ROPE[2]);
  return compose(null, [body, tie], null).sprite(cx, foot, GRAIN);
}

/** A HEAP OF SKULLS: three set on the floor and two on them, each staring its own way. 40 x 40 at (20, 32). */
function skullHeap(): Sprite {
  const S = new Scene(new Px(40, 40), 20, 32);
  const put = (c: V3, look: number, R: number, id: number): void => skull(S, { c, F: [Math.cos(look), Math.sin(look), 0.1], U: [0, 0, 1], R, jaw: null }, BONE, id);
  put([-5, -4, 4.2], 0.9, 4.2, 1);
  put([4, -5, 4.2], 0.2, 4.2, 2);
  put([-3, 5, 4.2], 1.6, 4.2, 3);
  put([-1, -2, 11.2], 0.8, 4.1, 4);
  put([5, 3, 4.4], 0.6, 4.3, 5);
  S.seams();
  return compose(null, [S.p], null).sprite(20, 32, GRAIN);
}

/** A JUG OF LAMP OIL: a fat earthenware jug, a loop handle, its neck stopped with a plug of wood. 28 x 40 at (14, 34). */
function oilJug(): Sprite {
  const W = 28;
  const H = 40;
  const cx = 14;
  const foot = 34;
  const body = new Px(W, H);
  const bits = new Px(W, H);
  lit(body, CLAY, [1, 3], [1, 4], (l) => {
    for (let y = 9; y <= foot - 1; y++) {
      const t = (y - 9) / (foot - 10);
      const half = t < 0.18 ? 2.6 : t < 0.3 ? 2.6 + (t - 0.18) * 40 : 7.4 + 1.6 * Math.sin(((t - 0.3) / 0.7) * Math.PI) - (t > 0.9 ? (t - 0.9) * 22 : 0);
      l.rect(Math.round(cx - half), y, Math.round(half * 2), 1, INK);
    }
  });
  // its lip, and the plug in it
  body.ellipse(cx, 9, 3.4, 1.2, CLAY[3]);
  bits.rect(cx - 2, 6, 4, 3, TIMBER[2]).set(cx - 2, 6, TIMBER[3]).set(cx - 1, 6, TIMBER[3]);
  // the handle, a loop from its neck to its shoulder
  for (let a = -0.4; a < Math.PI * 0.9; a += 0.1) bits.set(Math.round(cx + 5 + Math.sin(a) * 4), Math.round(15 - Math.cos(a) * 4), a < 1.2 ? CLAY[3] : CLAY[1]);
  // a band of glaze round its belly, worn
  for (let x = cx - 8; x <= cx + 8; x++) if (body.has(x, 22) && hash(x, 0, 563) < 0.7) body.set(x, 22, CLAY[1]);
  return compose(null, [body, bits], null).sprite(cx, foot, GRAIN);
}

/** AN ORE TUB: a squat tub of staves, two iron hoops round it, heaped with ore. 36 x 36 at (18, 30). */
function oreTub(): Sprite {
  const W = 36;
  const H = 36;
  const cx = 18;
  const foot = 30;
  const top = 16;
  const body = new Px(W, H);
  const iron = new Px(W, H);
  const S = new Scene(new Px(W, H), cx, foot);
  const half = (t: number): number => 11 - 1.5 * t;
  lit(body, TIMBER, [1, 4], [1, 5], (l) => {
    for (let y = top; y <= foot - 1; y++) l.rect(Math.round(cx - half((y - top) / (foot - 1 - top))), y, Math.round(half((y - top) / (foot - 1 - top)) * 2), 1, INK);
  });
  for (const f of [-0.6, -0.2, 0.2, 0.6]) for (let y = top + 2; y < foot - 1; y++) body.set(Math.round(cx + f * half((y - top) / (foot - 1 - top))), y, TIMBER[0]);
  body.ellipse(cx, top, 11, 3.6, TIMBER[0]);
  for (const t of [0.22, 0.8]) for (let x = Math.round(cx - half(t)); x < Math.round(cx + half(t)); x++) {
    const d = (x + 0.5 - cx) / half(t);
    iron.set(x, Math.round(top + t * (foot - 1 - top) + (1 - d * d) * 1.5), d < -0.3 ? IRONS[3] : d > 0.6 ? IRONS[0] : IRONS[2]);
  }
  // the ore heaped over its rim
  let n = 0;
  for (const [x, y, z, r] of [[-5, -2, 16, 3.2], [2, -4, 16.5, 3], [5, 1, 15.5, 2.8], [-1, 2, 17.5, 3.2], [-6, 3, 15, 2.4], [1, -1, 20, 2.6]] as const) S.ball([x, y, z], r, ORE, n++, undefined, 0.1);
  S.seams();
  return compose(null, [body, iron, S.p], null).sprite(cx, foot, GRAIN);
}

/**
 * WHAT A BREAKABLE LEAVES, on the floor where it stood: spread in an oval twice as wide as deep.
 * The sack (split open, its ore spilled), the skulls (rolled apart, one split), the jug (its shards,
 * its oil a dull dark pool), the tub (staves, a sprung hoop, ore).
 */
function brokenOf(kind: 'sack' | 'skulls' | 'jug' | 'tub'): Sprite {
  const W = 64;
  const H = 40;
  const cx = 32;
  const cy = 22;
  const p = new Px(W, H);
  const under = new Px(W, H);
  const S = new Scene(new Px(W, H), cx, cy);
  const ore = (n: number, seed: number, spread: number): void => {
    for (let i = 0; i < n; i++) {
      const a = hash(i, 1, seed) * Math.PI * 2;
      const r = Math.sqrt(hash(i, 2, seed)) * spread;
      S.ball([Math.cos(a) * r * 1.3, Math.sin(a) * r * 1.3, 1.6], 1.5 + hash(i, 3, seed) * 1.4, ORE, 10 + i, undefined, 0.1);
    }
  };
  const staves = (list: ReadonlyArray<readonly [number, number, number, 1 | -1]>, r: Ramp): void => {
    for (const [x, y, len, way] of list) {
      for (let k = 0; k < len; k++) {
        const xx = x + (way > 0 ? k : -k);
        const yy = y + Math.floor(k / 2);
        p.set(xx, yy, r[3]).set(xx, yy + 1, r[2]).set(xx, yy + 2, r[0]);
      }
    }
  };
  if (kind === 'sack') {
    // the sack split and flat, its ore spilled out in a fan
    lit(under, SACK, [1, 2], [1, 2], (l) => l.poly([[cx - 16, cy - 2], [cx - 6, cy - 7], [cx + 2, cy - 4], [cx - 2, cy + 3], [cx - 14, cy + 4]], INK));
    for (let x = cx - 14; x <= cx - 2; x++) under.set(x, cy - 1 + ((x * 3) % 2), SACK[1]);
    ore(11, 564, 9);
  } else if (kind === 'skulls') {
    skull(S, { c: [-12, -4, 4], F: [0.2, 1, 0.3], U: [0, 0, 1], R: 4.1, jaw: null }, BONE, 1);
    skull(S, { c: [14, 2, 3.8], F: [1, 0.4, -0.2], U: [0.2, -0.3, 1], R: 4.1, jaw: null }, BONE, 2);
    skull(S, { c: [-2, 10, 4], F: [0.9, 0.6, 0.4], U: [0, 0, 1], R: 4.2, jaw: null }, BONE, 3);
    // one split: its two halves, the hollow of it turned up
    S.egg([4, -8, 2], [[1, 0, 0], [0, 1, 0], [0, 0, 1]], [3.4, 3, 2.2], (n, w) => (w[2] > 3.2 ? BONE[1] : toneAt(n, BONE)), 4);
    S.egg([9, -12, 2], [[0.8, 0.6, 0], [-0.6, 0.8, 0], [0, 0, 1]], [3, 2.6, 2], (n, w) => (w[2] > 2.9 ? BONE[1] : toneAt(n, BONE)), 5);
    for (let i = 0; i < 6; i++) under.rect(cx - 16 + Math.floor(hash(i, 1, 565) * 32), cy - 5 + Math.floor(hash(i, 2, 565) * 10), 2, 1, BONE[2]);
  } else if (kind === 'jug') {
    under.ellipse(cx + 2, cy + 2, 14, 4.2, '#141019');
    under.ellipse(cx, cy + 1, 9, 2.6, '#1c1722');
    for (const [x, y, w, h] of [[cx - 13, cy - 3, 7, 4], [cx + 6, cy - 5, 6, 5], [cx - 2, cy + 3, 5, 3], [cx + 10, cy + 2, 4, 3]] as const) {
      lit(p, CLAY, [1, 2], [1, 2], (l) => l.poly([[x, y + h], [x + 1, y], [x + w, y + 1], [x + w - 1, y + h]], INK));
    }
    p.rect(cx + 15, cy - 4, 3, 2, TIMBER[2]).set(cx + 15, cy - 4, TIMBER[3]);
  } else {
    staves([[cx - 18, cy - 3, 11, 1], [cx + 2, cy + 3, 11, 1], [cx + 14, cy - 5, 9, -1], [cx - 6, cy - 8, 8, -1]], TIMBER);
    for (let a = 0; a < Math.PI * 1.3; a += 0.1) p.set(Math.round(cx - 4 + Math.cos(a + 2.4) * 7), Math.round(cy + 2 + Math.sin(a + 2.4) * 3), a < 1.5 ? IRONS[3] : IRONS[2]);
    ore(8, 566, 7);
  }
  S.seams();
  return compose(under, [p, S.p], null).sprite(cx, cy, GRAIN);
}

// =================================================================================================
// ON THE FLOOR: lying along its lines, at the middle of their floor

/** Old leather, black-brown. */
const LEATHER: Ramp = ['#0e0a12', '#18121c', '#30242e', '#483842', '#56444e'];

/** A MINER'S BOOTS, empty: one standing as he stood, its shaft slumped over, one fallen on its side, its studded sole turned to us. 44 x 36 at (22, 28). */
function emptyBoots(): Sprite {
  const W = 44;
  const H = 36;
  const cx = 22;
  const cy = 28;
  const p = new Px(W, H);
  const q = new Px(W, H);
  // the standing boot: its foot out toward the lower left, its shaft up, the top of it folded over
  lit(p, LEATHER, [1, 3], [1, 3], (l) => {
    l.poly([[cx - 4, cy - 2], [cx - 16, cy + 2], [cx - 18, cy], [cx - 16, cy - 3], [cx - 9, cy - 6], [cx - 4, cy - 8]], INK);
    l.rect(cx - 10, cy - 20, 7, 15, INK);
  });
  p.rect(cx - 10, cy - 21, 7, 2, LEATHER[4]).rect(cx - 10, cy - 19, 7, 1, LEATHER[0]);
  for (let y = cy - 18; y < cy - 6; y += 4) p.set(cx - 7, y, LEATHER[1]);
  p.line(cx - 17, cy + 1, cx - 5, cy - 2, LEATHER[0]);
  // the fallen one: on its side along the floor, its sole to us, studded, its mouth dark
  lit(q, LEATHER, [1, 2], [1, 2], (l) => {
    l.poly([[cx + 2, cy - 4], [cx + 15, cy - 9], [cx + 18, cy - 6], [cx + 6, cy + 1], [cx + 2, cy]], INK);
    l.poly([[cx + 14, cy - 10], [cx + 19, cy - 16], [cx + 21, cy - 14], [cx + 18, cy - 6]], INK);
  });
  q.ellipse(cx + 3, cy - 2, 1.6, 2.2, DEEP);
  for (let k = 0; k < 4; k++) q.set(cx + 7 + k * 3, cy - 3 - Math.round(k * 1.3), IRONS[3]);
  return compose(null, [p, q], null).sprite(cx, cy, GRAIN);
}

/** A RIB CAGE lying on its back, its ribs curving up, its skull rolled from it, an arm bone by it. 56 x 36 at (28, 24). */
function ribCageLying(): Sprite {
  const S = new Scene(new Px(56, 36), 28, 24);
  ribCage(S, [2, -1, 5.4], [0.9, -0.44, 0], [0, 0, 1], 9, BONE, 1);
  skull(S, { c: [15, -8, 3.8], F: [0.4, 0.9, 0.3], U: [0.9, -0.4, 0.2], R: 4, jaw: null }, BONE, 2);
  longBone(S, [-4, 9, 1.2], [-17, 4, 1.2], 1.05, BONE, 3);
  S.seams();
  return compose(null, [S.p], null).sprite(28, 24, GRAIN);
}

/** A BROKEN LADDER lying along y: its two rails snapped across the middle, the near half knocked askew, rungs gone. 64 x 44 at (32, 22). */
function brokenLadder(): Sprite {
  const W = 64;
  const H = 44;
  const S = new Scene(new Px(W, H), 32, 22);
  const rail = (a: V3, b: V3, id: number): void => S.rod(a, b, 1.3, 1.3, TIMBER, id);
  // the far half, straight
  rail([-6, -30, 1.3], [-6, -3, 1.3], 1);
  rail([6, -30, 1.3], [6, -4, 1.3], 2);
  for (const y of [-26, -18, -10]) S.rod([-6, y, 2], [6, y, 2], 0.9, 0.9, TIMBER, 3);
  // the near half, knocked askew
  const o: V3 = [2, 4, 1.3];
  const d = norm([0.5, 1, 0]);
  const s: V3 = [d[1], -d[0], 0];
  const P = (along: number, across: number): V3 => add(o, add(mul(d, along), mul(s, across)));
  rail(P(0, -6), P(24, -6), 4);
  rail(P(2, 6), P(26, 6), 5);
  for (const a of [7, 15]) S.rod(add(P(a, -6), [0, 0, 0.7]), add(P(a, 6), [0, 0, 0.7]), 0.9, 0.9, TIMBER, 6);
  // their splintered ends
  for (const [x, y] of [S.at([-6, -3, 1.3]), S.at([6, -4, 1.3]), S.at(P(0, -6)), S.at(P(2, 6))]) S.p.set(Math.round(x), Math.round(y) - 1, TIMBER[4]).set(Math.round(x) + 1, Math.round(y), TIMBER[4]);
  S.seams();
  return compose(null, [S.p], null).sprite(32, 22, GRAIN);
}

/** DRILL STEELS: the miners' long iron drills, three of them lying where they were dropped, each its own way, a hand hammer by them. 64 x 36 at (32, 20). */
function drillSteels(): Sprite {
  const S = new Scene(new Px(64, 36), 32, 20);
  const rods: [V3, V3][] = [[[-22, -6, 1], [12, -14, 1]], [[-18, 2, 1], [16, -4, 1]], [[-12, 10, 1], [20, 6, 1.2]]];
  rods.forEach(([a, b], i) => {
    S.rod(a, b, 0.8, 0.7, SMALL_IRON, 1 + i);
    S.ball(b, 1.2, SMALL_IRON, 1 + i);
  });
  // the hammer: a short haft, a square head
  S.rod([-6, 16, 1.2], [6, 12, 1.2], 1, 1, TIMBER, 5);
  S.box([7.5, 11.5, 2.2], [norm([0.32, 0.95, 0]), norm([-0.95, 0.32, 0]), [0, 0, 1]], [4, 2, 2.2], (_f, _u, _v, n) => toneAt(n, IRONS, 0.15), 6);
  S.seams();
  return compose(null, [S.p], null).sprite(32, 20, GRAIN);
}

/** AN ARM FROM A HEAP: a low heap of the dead's bones, and an arm of bone reaching up out of it, its hand clawed open. 52 x 60 at (26, 48). */
function armFromHeap(): Sprite {
  const S = new Scene(new Px(52, 60), 26, 48);
  S.egg([0, 0, 1], [[1, 0, 0], [0, 1, 0], [0, 0, 1]], [13, 11, 4.5], (n) => toneAt(n, EARTH_R), 1);
  longBone(S, [-12, -2, 4], [6, -6, 6], 1.2, BONE, 2);
  longBone(S, [-4, 8, 3.4], [10, 2, 5], 1.1, BONE, 3);
  longBone(S, [8, 8, 2.6], [-2, -10, 6.6], 1, BONE, 4);
  skull(S, { c: [-6, 6, 5.6], F: [0.7, 0.7, 0.3], U: [0, 0, 1], R: 4, jaw: null }, BONE, 5);
  // the arm: out of the heap's top, up and reaching, its hand open
  const sh: V3 = [2, -2, 5];
  const el: V3 = [-1, 2, 21];
  const wr: V3 = [5, 6, 33];
  longBone(S, sh, el, 1.3, BONE, 6);
  S.rod(el, wr, 1.1, 0.9, BONE, 7);
  S.rod(add(el, [0.8, -0.8, 0]), add(wr, [0.8, -0.8, 0]), 0.8, 0.7, BONE, 7);
  S.ball(el, 1.9, BONE, 7);
  S.egg(add(wr, [1, 1, 2]), [norm([0.4, 0.4, 0.8]), norm([0.7, -0.7, 0]), norm([-0.6, -0.6, 0.55])], [2.4, 2.2, 1], (n) => toneAt(n, BONE), 8);
  for (let k = 0; k < 5; k++) {
    const ang = -0.9 + k * 0.45;
    const base = add(wr, [1 + Math.cos(ang) * 1.6, 1 + Math.sin(ang) * 1.6, 3]);
    const mid_ = add(base, [Math.cos(ang) * 2.4, Math.sin(ang) * 2.4, 2.6]);
    S.rod(base, mid_, 0.55, 0.5, BONE, 9);
    S.rod(mid_, add(mid_, [Math.cos(ang) * 0.8, Math.sin(ang) * 0.8, 2]), 0.5, 0.4, BONE, 9);
  }
  S.seams();
  return compose(null, [S.p], null).sprite(26, 48, GRAIN);
}

/** A CULTIST'S ROBE, empty: crumpled where its wearer went to nothing, its hood fallen open, a sleeve flung out, a black candle stub rolled from it. 56 x 32 at (28, 18). */
function emptyRobe(): Sprite {
  const W = 56;
  const H = 32;
  const cx = 28;
  const cy = 18;
  const p = new Px(W, H);
  const bits = new Px(W, H);
  lit(p, ROBE, [1, 3], [1, 3], (l) => {
    l.poly([[cx - 20, cy + 2], [cx - 12, cy - 6], [cx + 2, cy - 8], [cx + 14, cy - 3], [cx + 18, cy + 4], [cx + 6, cy + 8], [cx - 10, cy + 7]], INK);
    // the sleeve flung out
    l.poly([[cx + 10, cy - 5], [cx + 22, cy - 10], [cx + 25, cy - 7], [cx + 15, cy], [cx + 10, cy - 1]], INK);
  });
  // its folds
  for (const [x0, y0, x1, y1] of [[cx - 12, cy - 2, cx + 2, cy + 4], [cx - 4, cy - 5, cx + 8, cy + 3], [cx + 4, cy - 6, cx + 12, cy + 1]] as const) p.line(x0, y0, x1, y1, ROBE[1]);
  // the hood, fallen open: its dark mouth
  lit(bits, ROBE, [1, 2], [1, 2], (l) => l.ellipse(cx - 17, cy - 1, 6, 4, INK));
  bits.ellipse(cx - 16, cy - 1, 3.6, 2.2, DEEP);
  // the candle stub, rolled clear
  bits.rect(cx + 6, cy + 9, 5, 2, WAX[3]).set(cx + 5, cy + 9, WAX[1]).set(cx + 11, cy + 9, INK);
  return compose(null, [p, bits], null).sprite(cx, cy, GRAIN);
}

/** A PIT PROP SNAPPED: a squared post broken in two, lying along x, its ends splintered where it gave. 64 x 40 at (32, 22). */
function snappedProp(): Sprite {
  const S = new Scene(new Px(64, 40), 32, 22);
  const grain = (f: number, u: number, v: number, n: V3): string => (f === 0 || f === 1 ? (Math.hypot(u - 0.5, v - 0.5) < 0.2 ? TIMBER[0] : TIMBER[3]) : Math.abs(((u * 6) % 1) - 0.5) < 0.08 ? TIMBER[0] : toneAt(n, TIMBER, -0.1));
  S.box([-12, -3, 3], [norm([1, 0.12, 0]), norm([-0.12, 1, 0]), [0, 0, 1]], [12, 3, 3], grain, 1);
  S.box([12, 2, 3.4], [norm([1, -0.3, 0.12]), norm([0.3, 1, 0]), norm([-0.12, 0, 1])], [11, 3, 3], grain, 2);
  // splinters at the break
  for (const [x, y, z] of [[0.5, -2, 5], [1.2, 0, 3.5], [1.4, 0.4, 6], [-0.4, -3.4, 2.4]] as const) {
    const [px, py] = S.at([x, y, z]);
    S.p.set(Math.round(px), Math.round(py), TIMBER[4]).set(Math.round(px) + 1, Math.round(py) - 1, TIMBER[3]);
  }
  S.seams();
  return compose(null, [S.p], null).sprite(32, 22, GRAIN);
}

// =================================================================================================
// STANDING THINGS, built in the world; anchored at the middle of their tile

/** The axes of the world. */
const XYZ: [V3, V3, V3] = [[1, 0, 0], [0, 1, 0], [0, 0, 1]];

/**
 * THE MINE CART, as it stands or goes: its body of planks, wider at the top than at its foot, iron at
 * its corners and a band round it; four iron wheels on two axles; heaped with ore, a skull and a long
 * bone on top. `o` its middle on the floor; `L`, `Wd`, `Up` its own axes as it is turned (along it,
 * across it, up); `spin` how far its wheels have turned; `upSpin` the wheels of its far side (left
 * spinning when it is over); `load` what is in it (each lump, from its own middle; null: gone).
 */
export interface CartPose { o: V3; L: V3; Wd: V3; Up: V3; spin: number; upSpin: number; load: (V3 | null)[]; bone: boolean; skull: boolean }
/** The cart's measures: half its length and width at its foot and at its top, where its body starts and ends up, its wheels. */
const CART = { l0: 14, w0: 9.6, l1: 18, w1: 12.2, z0: 9, z1: 28, wheelL: 11, wheelW: 12.4, wheelR: 6.6, wheelZ: 6.6 };
/** The lumps of ore heaped in it, from its middle (along, across, up) and their sizes. */
export const CART_LOAD: ReadonlyArray<readonly [number, number, number, number]> = [
  [-11, -6, 26, 3.6], [-3, -8, 26.6, 3.5], [6, -7, 26, 3.8], [12, -2, 25.6, 3.3], [-12, 3, 26, 3.4], [-5, 1, 28.8, 3.9], [3, 0, 29.4, 3.6], [11, 5, 26.2, 3.5], [-1, 8, 26.6, 3.5], [6, 8, 27.2, 3.2], [-8, 7, 28, 3.1], [0, -4, 31, 3.3], [-7, -3, 30.6, 3.2], [8, -4, 30, 3.2],
];
export const CART_STILL: CartPose = { o: [0, 0, 0], L: [1, 0, 0], Wd: [0, 1, 0], Up: [0, 0, 1], spin: 0, upSpin: 0, load: CART_LOAD.map(([a, b, c]) => [a, b, c]), bone: true, skull: true };
/** A point of the cart, from its own measures. */
export const cartPt = (k: CartPose, l: number, w: number, u: number): V3 => add(k.o, add(add(mul(k.L, l), mul(k.Wd, w)), mul(k.Up, u)));
function paintCart(S: Scene, k: CartPose, id0: number): void {
  const P = (l: number, w: number, u: number): V3 => cartPt(k, l, w, u);
  const { l0, w0, l1, w1, z0, z1 } = CART;
  // the corners of its body: foot (b) and top (t)
  const b = (sl: number, sw: number): V3 => P(sl * l0, sw * w0, z0);
  const t = (sl: number, sw: number): V3 => P(sl * l1, sw * w1, z1);
  const mid_ = P(0, 0, (z0 + z1) / 2);
  /** A side of it: planked across, iron at its two ends, a band along its middle; lit as it faces; seen from inside, dark. */
  const side = (q: [V3, V3, V3, V3], id: number): void => {
    const n0 = norm(cross(sub(q[1], q[0]), sub(q[3], q[0])));
    const out = dot(n0, sub(q[0], mid_)) > 0 ? n0 : mul(n0, -1);
    const seenOut = dot(out, TOWARD) > 0;
    S.quad(q, (u, v) => {
      if (!seenOut) return v > 0.92 ? TIMBER[2] : TIMBER[0];
      if (u < 0.07 || u > 0.93) return toneAt(out, IRONS, u < 0.07 ? 0.15 : 0);
      if (Math.abs(v - 0.55) < 0.07) return hash(Math.floor(u * 12), 1, 570) < 0.3 ? RUST[2] : toneAt(out, IRONS);
      if (Math.abs(((v * 4) % 1) - 0.5) > 0.42) return TIMBER[0];
      if (v > 0.93) return toneAt(out, TIMBER, 0.35);
      return toneAt(out, TIMBER);
    }, id);
  };
  // its floor, inside
  S.quad([b(-1, -1), b(1, -1), b(1, 1), b(-1, 1)], () => TIMBER[0], id0);
  side([b(-1, 1), b(1, 1), t(1, 1), t(-1, 1)], id0);
  side([b(1, -1), b(-1, -1), t(-1, -1), t(1, -1)], id0);
  side([b(1, 1), b(1, -1), t(1, -1), t(1, 1)], id0);
  side([b(-1, -1), b(-1, 1), t(-1, 1), t(-1, -1)], id0);
  // its underside, seen only as it goes over
  S.quad([b(-1, -1), b(-1, 1), b(1, 1), b(1, -1)], (u, v) => (dot(k.Up, TOWARD) < 0 ? (Math.abs(u - 0.5) < 0.06 || Math.abs(v - 0.5) < 0.05 ? IRONS[2] : TIMBER[1]) : null), id0);
  // its wheels and axles
  for (const sl of [-1, 1]) {
    const a0 = P(sl * CART.wheelL, -CART.wheelW, CART.wheelZ);
    const a1 = P(sl * CART.wheelL, CART.wheelW, CART.wheelZ);
    S.rod(a0, a1, 1, 1, IRONS, id0 + 1);
    for (const sw of [-1, 1]) {
      const c = P(sl * CART.wheelL, sw * CART.wheelW, CART.wheelZ);
      const face = mul(k.Wd, sw);
      const spin = sw < 0 ? k.upSpin : k.spin;
      wheel(S, c, face, k.L, k.Up, CART.wheelR, spin, id0 + 2 + (sl + 1) + (sw + 1) / 2);
    }
  }
  // the load
  k.load.forEach((q, i) => {
    if (!q) return;
    S.ball(P(q[0], q[1], q[2]), CART_LOAD[i][3], ORE, id0 + 10 + i, undefined, 0.1);
  });
  if (k.bone) longBone(S, P(-11, 3, 31), P(10, -5, 32.6), 1.2, BONE, id0 + 30);
  if (k.skull) skull(S, { c: P(1, 4, 34.4), F: add(mul(k.L, 0.5), add(mul(k.Wd, 0.85), mul(k.Up, 0.2))), U: k.Up, R: 4.6, jaw: null }, BONE, id0 + 31);
}
/** A WHEEL of iron: its rim, six spokes turned `spin`, its hub; `face` the way its outer side looks, `A` and `B` across it. */
export function wheel(S: Scene, c: V3, face: V3, A: V3, B: V3, R: number, spin: number, id: number): void {
  const out = dot(face, TOWARD) > 0;
  const lam = dot(out ? face : mul(face, -1), light.L);
  for (let r = 0; r <= R; r += 0.4) {
    for (let a = 0; a < Math.PI * 2; a += 0.4 / Math.max(r, 0.6)) {
      const p = add(c, add(mul(A, Math.cos(a) * r), mul(B, Math.sin(a) * r)));
      const rim = r > R - 1.4;
      const sp = ((a - spin) % (Math.PI / 3) + Math.PI / 3) % (Math.PI / 3);
      const spoke = sp < 0.18 || sp > Math.PI / 3 - 0.18;
      const hub = r < 1.3;
      if (!rim && !spoke && !hub) continue;
      // (the rim's tread lit on its upper side)
      const c_ = rim ? (r > R - 0.5 && Math.sin(a) > 0.3 ? IRONS[3] : lam > 0.2 ? IRONS[3] : lam > -0.3 ? IRONS[2] : IRONS[1]) : hub ? IRONS[3] : lam > -0.2 ? IRONS[2] : IRONS[1];
      const [x, y] = S.at(p);
      S.put(Math.round(x), Math.round(y), dot(p, TOWARD) + (out ? 0.6 : -0.6), c_, id, p[2]);
    }
  }
}
function mineCart(): Sprite {
  const S = new Scene(new Px(84, 76), 42, 54);
  paintCart(S, CART_STILL, 1);
  S.seams();
  return compose(null, [S.p], null).sprite(42, 54, GRAIN);
}

/** THE RAILS' END: a stop of heavy timber across the rails' end, two posts driven in, a baulk across them, a brace behind each, earth heaped behind it. Along x: the cart comes at it from -x. */
export function paintStop(S: Scene, o: V3, shake: number, id: number): void {
  const at = (v: V3): V3 => add(o, v);
  // earth and rock heaped behind it
  S.egg(at([11, 0, -2]), XYZ, [9, 15, 8], (n, w) => (hash(Math.floor(w[0] / 2), Math.floor(w[1] / 2) + Math.floor(w[2] / 2) * 9, 576) < 0.12 ? EARTH[3] : toneAt(n, EARTH_R, 0.1)), id);
  for (const [x, y, r] of [[13, -9, 3.2], [9, 5, 2.6], [15, 9, 2.2], [17, -2, 2.8]] as const) S.egg(at([x, y, r * 0.6]), XYZ, [r * 1.2, r, r * 0.8], (n) => toneAt(n, BOULDER), id + 4);
  // the posts
  for (const y of [-12, 12]) S.box(at([0, y, 9]), XYZ, [2.6, 2.6, 9], (f, _u, v, n) => (f === 4 ? TIMBER[3] : v > 0.9 ? TIMBER[0] : toneAt(n, TIMBER, -0.1)), id + 1);
  // the baulk across them, iron-faced where the carts strike it
  S.box(at([-2.4 + shake * 0.3, 0, 13 + shake * 0.4]), XYZ, [3, 16, 3.6], (f, u, v, n) => (f === 1 ? (u > 0.3 && u < 0.7 ? toneAt(n, IRONS, 0.25) : v < 0.1 ? TIMBER[3] : TIMBER[2]) : f === 4 ? TIMBER[3] : toneAt(n, TIMBER, -0.1)), id + 2);
  // braces behind, from its top down into the earth
  for (const y of [-12, 12]) S.rod(at([2, y, 15]), at([16, y, 2]), 1.4, 1.4, TIMBER, id + 3);
}
function railsEnd(): Sprite {
  const S = new Scene(new Px(80, 56), 40, 36);
  paintStop(S, [0, 0, 0], 0, 1);
  S.seams();
  return compose(null, [S.p], null).sprite(40, 36, GRAIN);
}

/** THE WINDLASS OVER THE SHAFT: a square shaft dropping into the dark, a collar of timber round its mouth; over it a frame of two trestles, a drum across them with the rope wound on it, a crank at one end; the rope down into the shaft, an ore bucket hanging at its mouth. 120 x 128 at (60, 92). */
function windlass(): Sprite {
  const W = 120;
  const H = 128;
  const S = new Scene(new Px(W, H), 60, 92);
  // the shaft: its mouth dark, its collar
  S.quad([[-14, -14, 0.2], [14, -14, 0.2], [14, 14, 0.2], [-14, 14, 0.2]], (u, v) => (u < 0.1 || v < 0.1 || u > 0.9 || v > 0.9 ? null : DEEP), 1);
  for (const [c, r] of [[[0, -15, 1.4], [16, 2.4, 1.4]], [[0, 15, 1.4], [16, 2.4, 1.4]], [[-15, 0, 1.4], [2.4, 13, 1.4]], [[15, 0, 1.4], [2.4, 13, 1.4]]] as [V3, V3][]) S.box(c, XYZ, r, (f, _u, _v, n) => (f === 4 ? TIMBER[3] : toneAt(n, TIMBER, -0.1)), 2);
  // the trestles: two legs each, splayed along y, a foot-beam
  for (const x of [-20, 20]) {
    for (const y of [-12, 12]) S.rod([x, y, 0], [x, 0, 40], 1.8, 1.6, TIMBER, 3);
    S.box([x, 0, 40.5], XYZ, [2.6, 3.2, 2.6], (f, _u, _v, n) => (f === 4 ? TIMBER[3] : toneAt(n, TIMBER, -0.1)), 3);
  }
  // the drum across, the rope wound on it
  for (let xx = -17; xx <= 17; xx += 0.5) {
    for (let a = 0; a < Math.PI * 2; a += 0.12) {
      const r = Math.abs(xx) < 10 ? 4.6 : 3.4;
      const p: V3 = [xx, Math.cos(a) * r, 41 + Math.sin(a) * r];
      const n: V3 = [0, Math.cos(a), Math.sin(a)];
      if (dot(n, TOWARD) < -0.2) continue;
      const coil = Math.abs(xx) < 10;
      const c = coil ? (Math.abs(((xx + 20) * 0.9) % 1 - 0.5) < 0.18 ? ROPE[1] : toneAt(n, ROPE)) : toneAt(n, TIMBER, -0.1);
      const [px, py] = S.at(p);
      S.put(Math.round(px), Math.round(py), dot(p, TOWARD), c, 4, p[2]);
    }
  }
  // the crank
  S.rod([23, 0, 41], [27, 0, 41], 1, 1, IRONS, 5);
  S.rod([27, 0, 41], [27, 4, 34], 1, 1, IRONS, 5);
  S.rod([27, 4, 34], [31, 4, 34], 1.2, 1.2, TIMBER, 5);
  // the rope down into the shaft, and the bucket hanging at its mouth
  S.rod([2, 4, 38], [2, 4, 14], 0.7, 0.7, ROPE, 6);
  const bc: V3 = [2, 4, 9];
  for (let z = 3; z <= 13; z += 0.4) {
    const r = 4.4 - (13 - z) * 0.08;
    for (let a = 0; a < Math.PI * 2; a += 0.1) {
      const p: V3 = [bc[0] + Math.cos(a) * r, bc[1] + Math.sin(a) * r, z];
      const n: V3 = [Math.cos(a), Math.sin(a), 0];
      const hoopRow = Math.abs(z - 5) < 0.6 || Math.abs(z - 11.5) < 0.6;
      const [px, py] = S.at(p);
      S.put(Math.round(px), Math.round(py), dot(p, TOWARD), hoopRow ? toneAt(n, IRONS, 0.2) : toneAt(n, TIMBER, -0.1), 7, z);
    }
  }
  S.egg([bc[0], bc[1], 13.2], XYZ, [4.1, 4.1, 0.6], () => ORE[2], 7);
  for (let a = 0.2; a < Math.PI - 0.2; a += 0.08) {
    const p: V3 = [bc[0] + Math.cos(a) * 4.6, bc[1], 13 + Math.sin(a) * 4];
    const [px, py] = S.at(p);
    S.put(Math.round(px), Math.round(py), dot(p, TOWARD) + 1, IRONS[3], 7, p[2]);
  }
  S.seams();
  return compose(null, [S.p], null).sprite(60, 92, GRAIN);
}

/** A PYRAMID OF SKULLS: stacked as the ossuary's keepers stacked them, nine, then four, then one, every one staring out. 64 x 64 at (32, 50). */
function skullPyramid(): Sprite {
  const S = new Scene(new Px(64, 64), 32, 50);
  let id = 1;
  const R = 4.4;
  for (const [n, z] of [[3, R * 0.9], [2, R * 0.9 + 7.4], [1, R * 0.9 + 14.8]] as const) {
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        const x = (i - (n - 1) / 2) * 9;
        const y = (j - (n - 1) / 2) * 9;
        const look = Math.atan2(y + 0.01, x + 0.01) * 0.6 + 0.78 * 0.4 + (hash(i, j, 571 + n) - 0.5) * 0.5;
        skull(S, { c: [x, y, z], F: [Math.cos(look), Math.sin(look), 0.05], U: [0, 0, 1], R: R - (n === 1 ? 0 : 0.2), jaw: null }, BONE, id++);
      }
    }
  }
  S.seams();
  return compose(null, [S.p], null).sprite(32, 50, GRAIN);
}

/**
 * THE CHARNEL HEAP: the dead dragged together into a heap by the amalgamation, as it gathers them to
 * eat: a mound of them packed in the earth, long bones every way on it, skulls in it staring out, a
 * rib cage, an arm hanging limp down its side. `h`: how it is (the moment that stirs it moves each of
 * them). Built so that the moment can move every bone of it.
 */
export interface HeapBit { kind: 'bone' | 'skull' | 'ribs'; a: V3; b: V3; r: number; F: V3; U: V3 }
export const HEAP = { rx: 30, ry: 26, h: 15 };
/** How high the heap's skin is at (x, y), its mound `h` high. */
export const heapTop = (x: number, y: number, h = HEAP.h): number => h * Math.sqrt(Math.max(0, 1 - (x / HEAP.rx) ** 2 - (y / HEAP.ry) ** 2));
/** The dead lying on the heap, at rest. */
export const HEAP_BITS: readonly HeapBit[] = (() => {
  const out: HeapBit[] = [];
  const on = (x: number, y: number, up = 0): V3 => [x, y, heapTop(x, y) + up];
  const bone = (x0: number, y0: number, x1: number, y1: number, r = 1.15): void => void out.push({ kind: 'bone', a: on(x0, y0, r + 0.2), b: on(x1, y1, r + 0.2), r, F: [1, 0, 0], U: [0, 0, 1] });
  const sk = (x: number, y: number, look: number, up = 0.6): void => void out.push({ kind: 'skull', a: on(x, y, 3.4 + up), b: [0, 0, 0], r: 4.4, F: norm([Math.cos(look), Math.sin(look), 0.3]), U: [0, 0, 1] });
  // (long bones every way over it, as they were dragged in: scattered over its skin, none alike)
  for (let i = 0; i < 18; i++) {
    const ang = i * 2.4 + 0.3;
    const r = 5 + 21 * Math.sqrt((i + 0.5) / 18);
    const x = Math.cos(ang) * r * (HEAP.rx / 30);
    const y = Math.sin(ang) * r * (HEAP.ry / 30);
    const d = hash(i, 1, 613) * Math.PI;
    const len = 6.5 + hash(i, 2, 613) * 3.5;
    bone(x - Math.cos(d) * len, y - Math.sin(d) * len, x + Math.cos(d) * len, y + Math.sin(d) * len, 1.05 + hash(i, 3, 613) * 0.3);
  }
  // (and spilled at its foot, on the floor)
  out.push({ kind: 'bone', a: [22, 18, 1.2], b: [34, 8, 1.2], r: 1.1, F: [1, 0, 0], U: [0, 0, 1] });
  out.push({ kind: 'bone', a: [-6, 30, 1.1], b: [10, 31, 1.1], r: 1, F: [1, 0, 0], U: [0, 0, 1] });
  out.push({ kind: 'skull', a: [28, 23, 3.6], b: [0, 0, 0], r: 4.2, F: norm([0.9, 0.6, 0.3]), U: [0, 0, 1] });
  sk(6, 14, 0.9);
  sk(17, 4, 0.5);
  sk(-7, -12, 0.3, 1.2);
  sk(-14, 6, 1.6);
  sk(2, -2, 0.8, 0.4);
  sk(-17, -9, 1.2);
  sk(11, -11, 0.2);
  sk(-4, 7, 1.1, 0.8);
  sk(19, 15, 0.7);
  out.push({ kind: 'ribs', a: on(-9, -3, 4.4), b: [0, 0, 0], r: 8.6, F: norm([0.3, 0.5, 0.8]), U: norm([0.85, -0.5, 0]) });
  out.push({ kind: 'ribs', a: on(4, -14, 4), b: [0, 0, 0], r: 7.6, F: norm([0.6, 0.3, 0.75]), U: norm([-0.4, 0.9, 0]) });
  return out;
})();
/** The skull of the heap the pink kindles in, its front one (toward the hero). */
export const HEAP_EYES = HEAP_BITS.findIndex((b) => b.kind === 'skull' && b.a[0] === -14 && b.a[1] === 6);
/** Paint the heap: its mound (`h` high) and its dead, each moved by `move(i, bit)` (null: as it lies). */
function paintHeap(S: Scene, h: number, bits: readonly (HeapBit | null)[], burn: number, id0: number): void {
  // the mound: the earth packed with the dead, dark, a few pale ends showing in it
  const mass = (n: V3, w: V3): string => {
    const g = hash(Math.floor(w[0] / 2.2), Math.floor(w[1] / 2.2) + Math.floor(w[2] / 2.2) * 7, 572);
    if (g < 0.16) return toneAt(n, WALL_BONE, 0.2);
    if (g < 0.22) return EARTH[0];
    return toneAt(n, HEAP_EARTH, 0.05);
  };
  const k = Math.max(0.05, h / HEAP.h);
  S.egg([0, 0, 0], XYZ, [HEAP.rx, HEAP.ry, Math.max(0.5, h)], mass, id0);
  for (const [x, y, r, z] of [[-10, -8, 9, 0.75], [9, -9, 8, 0.6], [-12, 8, 8, 0.6], [6, 8, 9, 0.7], [-2, 0, 10, 1.05]] as const) S.egg([x, y, 0], XYZ, [r * 1.1, r, Math.max(0.5, h * z)], mass, id0);
  bits.forEach((b, i) => {
    if (!b) return;
    if (b.kind === 'bone') longBone(S, b.a, b.b, b.r, BONE, id0 + 1 + i);
    else if (b.kind === 'skull') skull(S, { c: b.a, F: b.F, U: b.U, R: b.r, jaw: null, burn: i === HEAP_EYES ? burn : 0 }, BONE, id0 + 1 + i);
    else ribCage(S, b.a, b.U, b.F, b.r, BONE, id0 + 1 + i);
  });
}
const HEAP_W = 112;
const HEAP_H = 84;
const HEAP_AX = 56;
const HEAP_AY = 52;
function charnelHeap(): Sprite {
  const S = new Scene(new Px(HEAP_W, HEAP_H), HEAP_AX, HEAP_AY);
  paintHeap(S, HEAP.h, HEAP_BITS, 0, 1);
  S.seams();
  return compose(null, [S.p], null).sprite(HEAP_AX, HEAP_AY, GRAIN);
}
/** A TIMBER CRIB: rough logs laid two by two, crosswise, in a square stack, the miners' way of holding a roof up, their cut ends showing their rings; a wedge driven in at its top. 64 x 88 at (32, 70). */
function timberCrib(): Sprite {
  const S = new Scene(new Px(64, 88), 32, 70);
  let id = 1;
  const log = (a: V3, b: V3): void => {
    S.rod(a, b, 3, 3, TIMBER, id);
    // (its cut ends: the rings of the wood, the end toward the eye)
    const d = norm(sub(b, a));
    const s1 = norm(cross(d, [0, 0, 1]));
    const s2 = cross(s1, d);
    for (const e of [a, b]) {
      const out = dot(sub(e, mul(add(a, b), 0.5)), TOWARD) > 0;
      if (!out) continue;
      S.egg(e, [d, s1, s2], [0.5, 3, 3], (_n, w) => {
        const r = Math.hypot(dot(sub(w, e), s1), dot(sub(w, e), s2));
        return r > 2.4 ? TIMBER[1] : Math.abs(r - 1.3) < 0.45 ? TIMBER[1] : TIMBER[2];
      }, id);
    }
    id++;
  };
  for (let k = 0; k < 7; k++) {
    const z = 3 + k * 5.8;
    for (const s of [-1, 1]) {
      if (k % 2 === 0) log([-14, s * 10, z], [14, s * 10, z]);
      else log([s * 10, -14, z], [s * 10, 14, z]);
    }
  }
  S.box([-10, 12, 41.6], XYZ, [2.4, 1.4, 1.4], (_f, _u, _v, n) => toneAt(n, TIMBER, -0.1), id++);
  S.seams();
  return compose(null, [S.p], null).sprite(32, 70, GRAIN);
}

/** THE CULT'S ALTAR: a slab of rough rock laid on two stacks of skulls, three black candles burning on it, their wax run down over its edge: frame `f` of four. 72 x 72 at (36, 54). */
function cultAltar(f: number): Sprite {
  const W = 72;
  const H = 72;
  const S = new Scene(new Px(W, H), 36, 54);
  let id = 1;
  for (const x of [-11, 11]) {
    for (const [z, y] of [[4, -3], [4, 4], [11.4, 0.5]] as const) skull(S, { c: [x, y, z], F: [0.4, 1, 0.05], U: [0, 0, 1], R: 3.9, jaw: null }, BONE, id++);
  }
  S.box([0, 0, 17.4], XYZ, [19, 9, 2.4], (fc, u, v, n) => (fc === 4 ? (hash(Math.floor(u * 9), Math.floor(v * 5), 573) < 0.25 ? BOULDER[2] : u < 0.03 || v < 0.06 ? BOULDER[4] : BOULDER[3]) : toneAt(n, BOULDER, 0.1)), id++);
  // the candles and their wax
  const tops: [number, number][] = [];
  for (const [x, y, h] of [[-10, -2, 9], [1, 2, 6], [11, -1, 11]] as const) {
    S.rod([x, y, 19.8], [x, y, 19.8 + h], 1.5, 1.5, WAX, id);
    S.egg([x, y, 20], XYZ, [3, 3, 0.8], () => WAX[2], id++);
    const [px, py] = S.at([x, y, 19.8 + h]);
    tops.push([px, py]);
  }
  for (const [x, z0, z1] of [[-14, 19.6, 16], [6, 19.6, 15.4]] as const) S.rod([x, 9.4, z0], [x, 9.6, z1], 0.6, 0.5, WAX, id++);
  S.seams();
  const fire = new Px(W, H);
  tops.forEach(([x, y], i) => flame(fire, Math.round(x), Math.round(y) - 1, 5 + ((f + i) % 2), 1.4, [0, 1, 0, -1][(f + i) % 4]));
  const s = compose(null, [S.p], fire).sprite(36, 54, GRAIN);
  s.lights = [{ x: 36 / GRAIN, y: (tops[1][1] - 4) / GRAIN, r: 15 + (f % 2), color: EMBER[2], a: 0.5 }];
  return s;
}

/** THE BOULDER: a great rough rock fallen from the roof, and under it the pit prop it broke, its two ends sticking out. 80 x 72 at (40, 52). */
function boulder(): Sprite {
  const S = new Scene(new Px(80, 72), 40, 52);
  // the prop under it, snapped
  S.box([-14, 14, 2.4], [norm([1, -0.4, 0]), norm([0.4, 1, 0]), [0, 0, 1]], [9, 2.4, 2.4], (f, u, v, n) => (f === 1 ? TIMBER[3] : toneAt(n, TIMBER, -0.1)), 1);
  S.box([16, -10, 3], [norm([0.6, 1, 0.3]), norm([-1, 0.6, 0]), norm([-0.3, 0, 1])], [7, 2.4, 2.4], (f, _u, _v, n) => (f === 0 ? TIMBER[3] : toneAt(n, TIMBER, -0.1)), 2);
  // the rock: facets, lit as each faces
  // (flat facets: each face of the rock one tone, as it is turned)
  const facet = (n: V3): string => toneAt(norm([Math.round(n[0] * 1.6) / 1.6, Math.round(n[1] * 1.6) / 1.6, Math.round(n[2] * 1.6) / 1.6 + 0.05]), BOULDER, 0.05);
  S.egg([0, 0, 8], [norm([1, 0.3, 0]), norm([-0.3, 1, 0]), [0, 0, 1]], [21, 16, 13], facet, 3);
  S.egg([-6, -3, 18], [norm([1, -0.4, 0.2]), norm([0.4, 1, 0]), norm([-0.2, 0, 1])], [13, 12, 10], facet, 3);
  S.egg([9, 5, 9], [norm([0.7, 0.7, 0]), norm([-0.7, 0.7, 0]), [0, 0, 1]], [10, 8, 9], facet, 3);
  S.seams();
  return compose(null, [S.p], null).sprite(40, 52, GRAIN);
}

/** THE BONE COLUMN: a round column of the ossuary, faced with the dead: rings of skulls staring out between bands of bone ends, on a foot of stone, going up into the dark. 56 x 128 at (28, 112). */
function boneColumn(): Sprite {
  const S = new Scene(new Px(56, 128), 28, 112);
  const R = 11;
  // its core, dark
  for (let z = 4; z <= 100; z += 0.5) {
    for (let a = 0; a < Math.PI * 2; a += 0.06) {
      const p: V3 = [Math.cos(a) * R, Math.sin(a) * R, z];
      const [x, y] = S.at(p);
      S.put(Math.round(x), Math.round(y), dot(p, TOWARD) - 1, EARTH[0], 1, z);
    }
  }
  let id = 2;
  // its foot and cap of dressed stone
  for (const [z0, h, r] of [[0, 5, 14]] as const) {
    for (let z = z0; z <= z0 + h; z += 0.5) {
      for (let a = 0; a < Math.PI * 2; a += 0.04) {
        const n: V3 = [Math.cos(a), Math.sin(a), 0];
        const p: V3 = [n[0] * r, n[1] * r, z];
        const [x, y] = S.at(p);
        S.put(Math.round(x), Math.round(y), dot(p, TOWARD), z > z0 + h - 0.8 ? STONE[3] : toneAt(n, STONE, -0.1), id, z);
      }
    }
    S.egg([0, 0, z0 + h], XYZ, [r, r, 0.3], (_n, w) => (w[0] + w[1] < -r * 0.9 ? STONE[3] : STONE[2]), id++);
  }
  // rings of skulls between bands of bone ends
  for (const [z, kind] of [[9, 'end'], [13.4, 'end'], [22, 'skull'], [31, 'end'], [35.4, 'end'], [44, 'skull'], [53, 'end'], [57.4, 'end'], [66, 'skull'], [75, 'end'], [79.4, 'end'], [88, 'skull'], [97, 'end']] as const) {
    const n = kind === 'skull' ? 8 : 14;
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2 + (kind === 'end' ? (z % 2) * 0.2 : 0.2);
      const out: V3 = [Math.cos(a), Math.sin(a), 0];
      if (dot(out, TOWARD) < -0.3) continue;
      if (kind === 'skull') skull(S, { c: [out[0] * (R + 1.2), out[1] * (R + 1.2), z], F: out, U: [0, 0, 1], R: 4, jaw: null }, BONE, id++);
      else {
        const e: V3 = [out[0] * (R + 0.8), out[1] * (R + 0.8), z];
        const sd: V3 = [-out[1], out[0], 0];
        S.ball(add(e, mul(sd, 0.9)), 1.7, BONE, id);
        S.ball(add(e, mul(sd, -0.9)), 1.6, BONE, id++);
      }
    }
  }
  S.seams();
  // (up into the dark over the floor, as the walls go)
  for (let i = 0; i < S.id.length; i++) {
    if (S.id[i] < 0 || S.hz[i] < 62) continue;
    const x = i % S.p.w;
    const y = Math.floor(i / S.p.w);
    S.p.set(x, y, mix(S.p.get(x, y)!, BEYOND, [0.2, 0.42, 0.66, 0.9][Math.min(3, Math.floor((S.hz[i] - 62) / 9))]));
  }
  return compose(null, [S.p], null).sprite(28, 112, GRAIN);
}

/** THE RELIQUARY (the game's chest): an old box of dark wood bound in bone, where the ossuary's keepers kept what the dead left them. */
const RELIQUARY: TrunkLook = { a: 0.36, b: 0.24, rim: 13, rise: 7, wood: TIMBER, lid: ['#1a1220', '#1a1220', '#30222e', '#46323f', '#54404c'], metal: BONE, stone: null, planks: [6] };
function reliquary(open: boolean): Sprite {
  return trunk(56, 64, 28, 48, RELIQUARY, open).sprite(28, 48, GRAIN);
}

// =================================================================================================
// DOORS AND GATES

/**
 * THE DOOR'S LEAF on this floor: the miners' door, rough planks of uneven length nailed to two
 * battens across, iron straps at its hinges, a rope loop to pull it. As the game's leaf (art/gates.ts,
 * makeDoorLeaf): from its hinge (the anchor, on the floor) to its free end, (ex, ey) picture pixels
 * away along the floor. (No brace slanting between the battens: it would read as a letter.)
 */
export function minersDoorLeaf(ex: number, ey: number, high = 56, inShade = false): Sprite {
  const pad = 6;
  const w = Math.abs(ex) + pad * 2;
  const h = high + Math.abs(ey) + pad * 2;
  const p = new Px(w, h);
  const ox = ex >= 0 ? pad : pad - ex;
  const oy = high + pad + (ey < 0 ? -ey : 0);
  const at = (t: number, up: number): [number, number] => [Math.round(ox + ex * t), Math.round(oy + ey * t - up)];
  const steps = Math.max(Math.abs(ex), 1);
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const [x, y] = at(t, 0);
    const plank = Math.floor(t * 5);
    const joint = Math.abs((t * 5) % 1) < (1 / steps) * 2.4 && t > 0.05 && t < 0.95;
    const top = high - [0, 3, 1, 4, 2][Math.min(4, plank)];
    for (let up = 0; up < top; up++) {
      let c = joint ? TIMBER[0] : t < 0.04 ? TIMBER[3] : plank % 2 ? TIMBER[2] : mix(TIMBER[2], TIMBER[3], 0.3);
      const batten = [10, high - 16].some((b) => up >= b && up <= b + 4);
      if (batten) c = [10, high - 16].includes(up) ? TIMBER[3] : up === 14 || up === high - 12 ? TIMBER[0] : TIMBER[2];
      if (batten && i % 6 === 3 && [12, high - 14].includes(up)) c = IRONS[3];
      if (t < 0.14 && [11, 12, high - 15, high - 14].includes(up)) c = up % 2 ? IRONS[3] : IRONS[2];
      if (up === top - 1) c = TIMBER[3];
      if (up === 0) c = TIMBER[0];
      p.set(x, y - up, c);
    }
  }
  // the rope loop, near the free end
  const [lx, ly] = at(0.84, Math.round(high * 0.44));
  for (let a = 0; a < Math.PI * 2; a += 0.3) p.set(Math.round(lx + Math.cos(a) * 2), Math.round(ly + 2 + Math.sin(a) * 3), Math.cos(a) < 0 ? ROPE[3] : ROPE[1]);
  return (inShade ? recolor(p, shaded) : p).sprite(ox, oy, GRAIN);
}
function leafOf(ex: number, ey: number): Sprite {
  const dx = (ex / 32 + ey / 16) / 2;
  const dy = (ey / 16 - ex / 32) / 2;
  return minersDoorLeaf(ex, ey, 56, Math.abs(dy) > Math.abs(dx));
}

/** Three skulls heaped, one on two, as a mark: (x, y) in half its height, from its middle. */
function threeSkullsAt(x: number, y: number): 'bone' | 'dark' | null {
  for (const [cx, cy] of [[-0.5, -0.42], [0.5, -0.42], [0, 0.45]] as const) {
    const dx = x - cx;
    const dy = y - cy;
    const cran = Math.hypot(dx / 0.44, (dy - 0.06) / 0.4) <= 1;
    const face = Math.abs(dx) < 0.26 && dy < -0.08 && dy > -0.42;
    if (!cran && !face) continue;
    for (const e of [-0.17, 0.17]) if (Math.hypot((dx - e) / 0.12, (dy + 0.05) / 0.12) <= 1) return 'dark';
    if (Math.abs(dx) < 0.05 && dy < -0.18 && dy > -0.28) return 'dark';
    return 'bone';
  }
  return null;
}
/** THE MARK OVER THIS FLOOR'S GATES (art/gates.ts, a Mark): three skulls heaped, one on two, cut in a roundel on the keystone, in stone, giving off no light. */
const skullsMark: Mark = (x, y, st, _lit, lightLow) => {
  const d = Math.hypot(x, y);
  if (d > 12.4) return null;
  const toLight = y - (lightLow ? x : -x);
  if (d > 11.4) return st.joint;
  if (d > 9.4) return toLight > 5 ? st.light : toLight < -6 ? st.dark : st.body;
  const k = threeSkullsAt(x / 8, y / 8);
  if (k === 'dark') return st.joint;
  // (each skull raised out of the field and lit: its edge away from the light in shade)
  if (k === 'bone') return threeSkullsAt((x - (lightLow ? -1 : 1)) / 8, (y - 1) / 8) === 'bone' ? st.light : st.body;
  return st.dark;
};
/** OVER ITS OWN GATE: the maw cut in the stone, its fangs, the fire inside it burning pink (the enemy's, as the game's boss gate has the Warden's). */
const mawMark: Mark = (x, y, st, lit_, lightLow) => {
  const d = Math.hypot(x, y);
  if (d > 12.4) return null;
  const toLight = y - (lightLow ? x : -x);
  if (d > 11.4) return st.joint;
  if (d > 9.4) return toLight > 5 ? st.light : toLight < -6 ? st.dark : st.body;
  const m = mawAt(x / 9.4, y / 9.4);
  if (m === 'in') {
    const hot = Math.abs(y) < 1.6 && Math.abs(x) < 6;
    return lit_ ? (hot ? FLAME[4] : FLAME[3]) : hot ? FLAME[2] : FLAME[1];
  }
  if (m === 'fang') return st.light;
  if (m === 'lip') return st.joint;
  return st.dark;
};

let gates: GateArt | null = null;
/** THIS FLOOR'S DOORS AND GATES, as the game's (art/gates.ts): its stone, three skulls heaped over its gates, the maw over its boss's, its doors the miners' rough planks. */
export function ossuaryGates(): GateArt {
  return gates ?? (gates = makeGateArt(THEME, { gateMark: skullsMark, bossMark: mawMark, leaf: leafOf }));
}

// =================================================================================================
// QUESTS

/** THE ELDEST SKULL: the first of the dead the amalgamation gathered, found where it burst apart: a great old skull, twice a man's, cracked across, the fire gone out of it; a glint on its crown, so it reads as a thing to take. 48 x 44 at (24, 36). */
function eldestSkull(): Sprite {
  const S = new Scene(new Px(48, 44), 24, 36);
  skull(S, { c: [0, 0, 6.6], F: [0.55, 0.85, 0.12], U: [0, 0.1, 1], R: 7.4, jaw: 0.25 }, BONE, 1);
  S.seams();
  // a crack across its crown
  let [x, y] = S.at([-4, -3, 13]);
  for (let k = 0; k < 9; k++) {
    S.p.set(Math.round(x), Math.round(y), DEEP);
    x += 1;
    y += k % 3 === 1 ? 1 : 0;
  }
  const over = new Px(48, 44);
  const [gx, gy] = S.at([-2, 1, 13.4]);
  over.set(Math.round(gx), Math.round(gy), GOLD[3]).set(Math.round(gx) + 1, Math.round(gy), GOLD[2]);
  return compose(null, [S.p], over).sprite(24, 36, GRAIN);
}

// =================================================================================================
// THE SET

/**
 * WHERE EACH WALL PIECE MAY BE SET: its first spot, then others, (across, up) in picture pixels: low,
 * middle and high on the wall, and across it, each within its own tile's face and below where the
 * wall fades into the dark (his note on floor 1's: "I don’t like the wall panels all being in the
 * exact same spot").
 */
const SPOTS: Record<string, ReadonlyArray<readonly [number, number]>> = {
  'the skull wall': [[0, 0]],
  'bone-lined niche': [[4, -1], [-3, 11], [0, 19]],
  "the miners' breach": [[0, 0]],
  'shored rock': [[0, 0], [-1, 0], [1, 0]],
  "the dead's arm": [[7, -1], [4, 7], [1, 14]],
  'seam of ore': [[1, -5], [3, 3], [-3, 30]],
  'the charnel layer': [[2, -1], [0, 6], [-1, 24]],
  "miner's lantern": [[10, -17], [5, -5], [-9, 9]],
  'pick in the wall': [[-4, -4], [-12, 7], [-12, 14]],
  "the cult's candle": [[7, -16], [0, -1], [-5, 10]],
  'garland of skulls': [[-1, -5], [-1, 12], [1, 19]],
  "the miners' ladder": [[0, 0], [-7, 0], [6, 0]],
  "the miners' tools": [[-2, -8], [-2, -1], [-2, 6]],
  "the cult's daub": [[0, -16], [0, 1], [-1, 17]],
  'ribs on a spike': [[10, -15], [-7, 2], [-7, 9]],
  'jaw slot': [[0, 0]],
};

let made: Piece[] | null = null;
/** THE AMALGAMATION'S FLOOR, every piece, painted the first time they are asked for and kept. */
export function ossuaryPieces(): Piece[] {
  if (made) return made;
  /** A wall piece at each of its spots, on both faces; `frames` of it if it moves, `lights` for each. */
  const wall = (name: string, kind: PieceKind, make: (f: number) => WallMake, frames = 1, light?: (f: number, du: number, dv: number) => (alongX: boolean) => Light[]): Piece => {
    const spots: Spot[] = (SPOTS[name] ?? [[0, 0]]).map(([du, dv]) => {
      const left: Sprite[] = [];
      const right: Sprite[] = [];
      for (let f = 0; f < frames; f++) {
        left.push(wallSprite(make(f), true, du, dv, light ? light(f, du, dv)(true) : []));
        right.push(wallSprite(make(f), false, du, dv, light ? light(f, du, dv)(false) : []));
      }
      return { du, dv, left, right };
    });
    return { name, kind, left: spots[0].left, right: spots[0].right, spots };
  };
  const flatW = (paint: (p: Px) => void): ((f: number) => WallMake) => () => ({ flat: paint });
  const fireLight = (h: number) => (f: number, du: number, dv: number) => (alongX: boolean): Light[] => [{ x: (PCX + du) / GRAIN, y: (PFOOT - h - dv) / GRAIN, r: 14 + (f % 2), color: EMBER[2], a: alongX ? 0.5 : 0.42 }];
  const G = ossuaryGates();
  made = [
    // wall tiles
    wall('the skull wall', 'wall tile', () => skullWall),
    wall('bone-lined niche', 'wall tile', () => bonedNiche),
    { ...wall("the miners' breach", 'wall tile', () => breach), frames: [breachHeap()], shadow: 0.44 },
    wall('shored rock', 'wall tile', () => shoredRock),
    wall("the dead's arm", 'wall tile', () => deadArm),
    wall('seam of ore', 'wall tile', flatW(oreSeam)),
    wall('the charnel layer', 'wall tile', () => charnelLayer),
    // on the walls
    wall("miner's lantern", 'on the wall', (f) => ({ flat: minersLantern(f) }), 4, fireLight(28)),
    wall('pick in the wall', 'on the wall', flatW(pickInWall)),
    wall("the cult's candle", 'on the wall', (f) => ({ ...cultCandle(f), fire: cultCandleFlame(f) }), 4, fireLight(42)),
    wall('garland of skulls', 'on the wall', () => garland),
    wall("the miners' ladder", 'on the wall', flatW(ladder)),
    wall("the miners' tools", 'on the wall', flatW(minersTools)),
    wall("the cult's daub", 'on the wall', flatW(cultDaub)),
    wall('ribs on a spike', 'on the wall', () => ribsOnSpike),
    // floor tiles
    { name: 'the rails', kind: 'floor tile', frames: [onTile(railsTile(true)), onTile(railsTile(false))] },
    { name: 'earth and bones', kind: 'floor tile', frames: [onTile(earthAndBones)] },
    { name: 'raked earth', kind: 'floor tile', frames: [onTile(clawRaked)] },
    { name: 'bone-paved floor', kind: 'floor tile', frames: [onTile(bonePaved, box(0.08, 0.92, 0.08, 0.92))] },
    { name: 'the drag', kind: 'floor tile', frames: [onTile(dragTrail)] },
    { name: 'spilled ore', kind: 'floor tile', frames: [onTile(spilledOre)] },
    // traps
    { name: 'bone spikes', kind: 'trap', frames: [boneSpikes(false), boneSpikes(true)] },
    { name: 'rotten boards', kind: 'trap', frames: [rottenBoards(false), rottenBoards(true)] },
    wall('jaw slot', 'trap', () => jawSlot),
    // breakables: whole, and what each leaves broken
    { name: 'ore sack', kind: 'breakable', frames: [oreSack(), brokenOf('sack')], shadow: 0.24 },
    { name: 'heap of skulls', kind: 'breakable', frames: [skullHeap(), brokenOf('skulls')], shadow: 0.28 },
    { name: 'oil jug', kind: 'breakable', frames: [oilJug(), brokenOf('jug')], shadow: 0.2 },
    { name: 'ore tub', kind: 'breakable', frames: [oreTub(), brokenOf('tub')], shadow: 0.28 },
    // on the floor
    { name: 'empty boots', kind: 'on the floor', frames: [emptyBoots()], shadow: 0.26 },
    { name: 'rib cage', kind: 'on the floor', frames: [ribCageLying()], shadow: 0.3 },
    { name: 'broken ladder', kind: 'on the floor', frames: [brokenLadder()] },
    { name: 'drill steels', kind: 'on the floor', frames: [drillSteels()] },
    { name: 'arm from a heap', kind: 'on the floor', frames: [armFromHeap()], shadow: 0.36 },
    { name: "a cultist's robe", kind: 'on the floor', frames: [emptyRobe()] },
    { name: 'snapped prop', kind: 'on the floor', frames: [snappedProp()] },
    // obstacles
    { name: 'the mine cart', kind: 'obstacle', frames: [mineCart()], shadow: 0.5 },
    { name: "the rails' end", kind: 'obstacle', frames: [railsEnd()], shadow: 0.56 },
    { name: 'the windlass', kind: 'obstacle', frames: [windlass()], shadow: 0.66 },
    { name: 'pyramid of skulls', kind: 'obstacle', frames: [skullPyramid()], shadow: 0.46 },
    { name: 'the charnel heap', kind: 'obstacle', frames: [charnelHeap()], shadow: 0.7 },
    { name: 'timber crib', kind: 'obstacle', frames: [timberCrib()], shadow: 0.56 },
    { name: "the cult's altar", kind: 'obstacle', frames: [0, 1, 2, 3].map(cultAltar), shadow: 0.6 },
    { name: 'the boulder', kind: 'obstacle', frames: [boulder()], shadow: 0.62 },
    { name: 'the bone column', kind: 'obstacle', frames: [boneColumn()], shadow: 0.42 },
    { name: 'the reliquary', kind: 'obstacle', frames: [reliquary(false), reliquary(true)], shadow: 0.38 },
    // doors and gates
    { name: 'the door', kind: 'door', gates: G, frames: [G.leaf(32, 16), G.leaf(-32, 16), G.post] },
    { name: 'the gate', kind: 'gate', gates: G, frames: [...G.arch(true, false, false).map((q) => q.s), G.pillar(false)] },
    { name: "the boss's gate", kind: 'gate', gates: G, frames: [...G.arch(true, true, false).map((q) => q.s), G.pillar(true)] },
    // quests
    { name: 'the eldest skull', kind: 'quest', frames: [eldestSkull()], shadow: 0.16 },
  ];
  return made;
}

// =================================================================================================
// THE MOMENTS AROUND THE HERO

// His idea, 10 Oct, 07:52: “I’d also like a couple environmental things happening around you for
// immersion unique for each floor.  Something shifts above you and dust comes down, you spook a pack of
// birds and they fly off,  a root shrivels as you walk by.  That sort of stuff”. Each checked against
// his rulebook's Animations 1 before he sees it: “as big and wild and kinetic and weighty as possible.
// I’d rather it be a notch too high than a notch too low.”

/** How fast things fall, in the world's picture pixels a frame, each frame (fast: things fall fast and hit hard). */
const FALL = 1.0;
/** A thing loose in a moment: where its middle is, how fast it goes, which way it is turned (a skull's face and crown; a bone's length), how it turns. In whatever frame the moment keeps (a wall's: along, out, up). */
interface Body {
  kind: 'skull' | 'bone' | 'ore';
  p: V3;
  v: V3;
  F: V3;
  U: V3;
  axis: V3;
  spin: number;
  r: number;
  len: number;
  free: boolean;
  ground: boolean;
  still: boolean;
  hits: number;
  /** The frames it struck the floor, and how hard. */
  struck: { f: number; vz: number }[];
  /** A skull: which way its face looks when it comes to rest. */
  rest?: V3;
}
const copyBody = (b: Body): Body => ({ ...b, p: [...b.p] as V3, v: [...b.v] as V3, F: [...b.F] as V3, U: [...b.U] as V3, axis: [...b.axis] as V3, struck: [...b.struck], rest: b.rest ? ([...b.rest] as V3) : undefined });
/** A skull's (or a lump's) reach from its middle, as it lies. */
const skullReach = (b: Body): number => (b.kind === 'ore' ? 0.95 : 0.9) * b.r;
/** How low a bone reaches below its middle. */
const boneLow = (b: Body): number => Math.abs(b.F[2]) * b.len * 0.5 + b.r * 0.9;

/**
 * ONE FRAME OF THE LOOSE THINGS: each falls, turns, strikes the floor (bouncing if it strikes hard),
 * rolls or slides and comes to rest; a skull strikes the skulls about it and is turned aside, or rolls
 * off one it has come down on; nothing goes back into the wall (b < 0 is the wall, `wallTop` how high it
 * stands), nor through the floor.
 */
function stepBodies(bodies: Body[], f: number, wallTop: number, rolling = 0.9, groundAt: (a: number, b: number) => number = () => 0): void {
  for (const b of bodies) {
    if (!b.free || b.still) continue;
    b.v = [b.v[0], b.v[1], b.v[2] - FALL];
    b.p = add(b.p, b.v);
    if (b.spin) {
      b.F = norm(rot(b.F, b.axis, b.spin));
      if (b.kind !== 'bone') b.U = norm(rot(b.U, b.axis, b.spin));
    }
    const low = b.kind !== 'bone' ? skullReach(b) : boneLow(b);
    const g = groundAt(b.p[0], b.p[1]);
    // (off the edge of what it lay on: it falls again)
    if (b.ground && b.p[2] - low > g + 0.3) b.ground = false;
    // the wall
    const back = b.kind !== 'bone' ? skullReach(b) : b.r + Math.abs(b.F[1]) * b.len * 0.5;
    if (b.p[1] < back && b.p[2] < wallTop) {
      b.p = [b.p[0], back, b.p[2]];
      if (b.v[1] < 0) b.v = [b.v[0], -b.v[1] * 0.3, b.v[2]];
    }
    // the floor
    if (b.p[2] - low <= g) {
      b.p = [b.p[0], b.p[1], g + low];
      const hard = b.v[2] < -2.2;
      if (b.v[2] < -0.5) b.struck.push({ f, vz: b.v[2] });
      b.hits++;
      if (hard) {
        b.v = [b.v[0] * 0.72, b.v[1] * 0.72, -b.v[2] * (b.kind === 'bone' ? 0.34 : 0.42)];
        b.spin *= 0.6;
      } else {
        b.v = [b.v[0], b.v[1], 0];
        b.ground = true;
      }
      if (b.kind === 'bone') {
        // (a bone comes down along the floor)
        b.F = norm([b.F[0], b.F[1], b.F[2] * (b.hits > 1 ? 0 : 0.35)]);
        b.axis = [0, 0, 1];
        b.spin *= 0.5;
      }
    }
    if (b.ground) {
      const sp = Math.hypot(b.v[0], b.v[1]);
      if (b.kind !== 'bone') {
        // (slow, it grinds to a stop)
        const k = sp < 0.6 ? 0.8 : rolling;
        b.v = [b.v[0] * k, b.v[1] * k, 0];
        if (sp > 0.05) {
          b.axis = norm(cross([0, 0, 1], [b.v[0], b.v[1], 0]));
          b.spin = sp / b.r;
        } else b.spin = 0;
        // (slowing, it rocks over onto its base, its face to the room: as a skull comes to rest)
        if (sp < 0.5 && b.rest) {
          b.spin = 0;
          b.F = norm(add(mul(b.F, 0.7), mul(b.rest, 0.3)));
          b.U = norm(add(mul(b.U, 0.7), mul([0, 0, 1], 0.3)));
          if (dot(b.F, b.rest) < 0.995 || b.U[2] < 0.995) {
            b.still = false;
            continue;
          }
        }
      } else {
        b.v = [b.v[0] * 0.74, b.v[1] * 0.74, 0];
        b.spin *= 0.7;
      }
      if (sp < 0.06 && Math.abs(b.spin) < 0.02) {
        b.still = true;
        b.v = [0, 0, 0];
        b.spin = 0;
      }
    }
  }
  // skull against skull (and lump against lump): pushed apart, turned aside; one come down on another rolls off it
  const sk = bodies.filter((b) => b.kind !== 'bone' && b.free);
  for (let i = 0; i < sk.length; i++) {
    for (let j = 0; j < sk.length; j++) {
      if (i === j) continue;
      const A = sk[i];
      const B = sk[j];
      if (A.still) continue;
      const d = sub(A.p, B.p);
      const dist = Math.hypot(d[0], d[1], d[2]);
      const need = skullReach(A) + skullReach(B);
      if (dist >= need || dist < 1e-6) continue;
      const n = mul(d, 1 / dist);
      const share = B.still ? 1 : 0.5;
      A.p = add(A.p, mul(n, (need - dist) * share));
      const vn = dot(A.v, n);
      if (vn < 0) A.v = sub(A.v, mul(n, vn * 1.25));
      // (resting on it: off it, down its side)
      if (n[2] > 0.3) {
        A.ground = false;
        A.still = false;
        const h = norm([n[0] + 0.01, n[1], 0]);
        A.v = add(A.v, mul(h, 0.35));
      }
      if (B.still && vn < -0.4) B.still = false;
    }
  }
}

/** Where a body's middle is on the picture, from the anchor, in a frame `W`. */
const onScreen = (W: (a: number, b: number, z: number) => V3, p: V3): [number, number] => {
  const w = W(p[0], p[1], p[2]);
  return onPic(w[0], w[1], w[2]);
};

/**
 * THE SKULL WALL SPILLS. A stretch of the skull wall (the piece, `before`), the dead stacked in it as
 * they were laid, a weight of them behind. It creaks: grit trickles from between them, dust puffs out
 * of the joints; the middle of it bulges out, swelling and shuddering harder and harder, skulls
 * grinding forward out of their rows; and it bursts (the first jolt): an avalanche of skulls and long
 * bones pours out across the floor, the middle first and the rest after it, skulls bouncing and rolling
 * and knocking into one another, bones sliding out end first and tumbling, a cloud of dust blown out of
 * the hole and rolling over the floor; the wall above, its footing gone, slumps down into the hole and
 * pours out after them (the second jolt), with the dead from further in. Everything comes to rest in a
 * spill across the floor, grit still trickling from the dark hole it left (`after`). For a face turned
 * to screen-left (`alongX`) or to screen-right; anchored at the foot of the face under the middle of
 * its tile, as a wall piece is.
 */
function skullWallSpills(alongX: boolean): { frames: Sprite[]; before: Sprite[]; after: Sprite[]; tracks: Track[]; jolts: number[] } {
  const MW = 200;
  const MH = 168;
  // (the spill goes out toward the eye: down the screen and to the left, or to the right)
  const ax = alongX ? 124 : 76;
  const ay = 116;
  const W = faceWorld(alongX);
  const toW = dirOf(W);
  const BURST = 26;
  const SLUMP = BURST + 13;
  /** Where the wall gives: the burst (how far into it, 0 its middle, 1 its rim), and where it slumps after. */
  const burstAt = (a: number, z: number, seed: number): number => Math.hypot(a / 17.5, (z - 25) / 19.5) + (hash(seed, 3, 580) - 0.5) * 0.12;
  const slumpAt = (s: WallBit): boolean => (!s.back && s.z > 43 && s.z < 66 && Math.abs(s.a) < 11.5) || (s.back && Math.hypot(s.a / 14, (s.z - 28) / 18) < 1);
  // THE LOOSE ONES: each skull and bone of the wall that goes, with the frame it is let go
  interface Loose { i: number; body: Body; go: number; w: number }
  const loose: Loose[] = [];
  SKULL_WALL.forEach((s, i) => {
    const k = burstAt(s.a, s.z, i);
    const first = !s.back && k < 1;
    const second = slumpAt(s);
    if (!first && !second) return;
    const w = first ? 1 - k : 0;
    let body: Body;
    if (s.kind === 'skull') {
      const q = wallSkullPose(s, alongX);
      body = { kind: 'skull', p: q.c, v: [0, 0, 0], F: q.F, U: q.U, axis: [1, 0, 0], spin: 0, r: s.r, len: 0, free: false, ground: false, still: false, hits: 0, struck: [] };
    } else {
      const q = wallBonePose(s);
      body = { kind: 'bone', p: add(q.e, mul(q.d, q.len / 2)), v: [0, 0, 0], F: q.d, U: [0, 0, 1], axis: [0, 0, 1], spin: 0, r: s.r, len: q.len, free: false, ground: false, still: false, hits: 0, struck: [] };
    }
    // (the middle of the burst first, its rim a few frames after; the wall above as it slumps; those further in last)
    const go = first ? BURST + Math.round((1 - w) * 5) : SLUMP + (s.back ? 3 + Math.round(hash(i, 4, 580) * 5) : Math.round((s.z - 43) / 7));
    loose.push({ i, body, go, w });
  });
  /** How each is flung as it is let go: out of the wall, spreading, the burst's middle hardest. */
  const fling = (L: Loose): V3 => {
    const s = SKULL_WALL[L.i];
    const r = (k: number): number => hash(L.i, k, 581) - 0.5;
    if (L.go < SLUMP) return [s.a * 0.09 + r(1) * 1.8, 3.6 + 4 * L.w + r(2) * 1.2, 1.4 + 2.6 * L.w + r(3) * 0.8];
    return [s.a * 0.04 + r(1) * 1.0, 1.2 + r(2) * 1.0, s.back ? 0.6 : 0];
  };
  // THE BULGE before it goes: out of the wall, and the shudder, harder and harder
  const bulge = (L: Loose, f: number): V3 => {
    if (L.w <= 0 || f < 1) return [0, 0, 0];
    const t = Math.min(1, f / BURST);
    const amp = (0.25 + 2.2 * t * t) * L.w;
    const j = (k: number): number => (hash(L.i * 7 + f, k, 582) - 0.5) * 2;
    const w = Math.sqrt(L.w);
    return [j(1) * amp, 10 * t ** 1.6 * w + Math.max(0, j(2)) * amp * 0.5, j(3) * amp * 0.8 - 2.2 * t * t * w];
  };
  // the run: every loose one, frame by frame, in the wall's frame
  const N = 112;
  const states: Body[][] = [];
  const bodies = loose.map((L) => copyBody(L.body));
  for (let f = 0; f < N; f++) {
    loose.forEach((L, k) => {
      const b = bodies[k];
      if (!b.free && f >= L.go) {
        b.free = true;
        b.p = add(L.body.p, bulge(L, L.go - 1));
        b.v = fling(L);
        b.axis = norm([hash(L.i, 5, 581) - 0.5, hash(L.i, 6, 581) - 0.5, hash(L.i, 7, 581) - 0.5]);
        b.spin = (b.kind === 'skull' ? 0.18 : 0.3) * (0.5 + hash(L.i, 8, 581));
        if (b.kind === 'skull') b.rest = norm([(alongX ? 0.5 : -0.5) + (hash(L.i, 9, 581) - 0.5) * 1.2, 1, 0.12]);
      }
    });
    if (f > 0) stepBodies(bodies, f, TALL, 0.92);
    states.push(bodies.map((b, k) => (b.free ? copyBody(b) : { ...copyBody(b), p: add(loose[k].body.p, bulge(loose[k], f)) })));
  }
  const last = states[N - 1];
  if (last.some((b) => !b.still)) throw new Error('the skull wall: something is still moving at the end: ' + last.filter((b) => !b.still).map((b) => `${b.kind} ${b.p.map((q) => q.toFixed(1))} v ${b.v.map((q) => q.toFixed(2))} g ${b.ground} spin ${b.spin.toFixed(3)}`).join('; '));

  // THE DUST: puffing out of the joints as it bulges; blown out of the hole as it bursts and as it slumps; where each strikes the floor
  const puffs: Puff[] = [];
  const toPuff = (f0: number, a: number, b: number, z: number, da: number, db: number, v: number, big: number, rise: number, life: number, seed: number): void => {
    const w = W(a, b, z);
    const dw = toW([da, db, 0]);
    puffs.push({ f0, x: w[0], y: w[1], z: w[2], ang: Math.atan2(dw[1], dw[0]), v, r0: 1.6, grow: big, rise, life, seed });
  };
  for (const [f0, a, z] of [[9, -12, 38], [13, 10, 12], [17, -4, 42], [20, 13, 30], [22, -14, 14], [24, 2, 8]] as const) toPuff(f0, a, 1, z, a * 0.02, 1, 1.4, 3.2, -0.3, 12, f0);
  for (let k = 0; k < 16; k++) {
    const ang = (k / 16) * Math.PI - Math.PI / 2 + (hash(k, 1, 583) - 0.5) * 0.4;
    toPuff(BURST, Math.sin(ang) * 10, 2, 14 + hash(k, 2, 583) * 22, Math.sin(ang), Math.cos(ang) * 1.4, 3 + 2.4 * hash(k, 3, 583), 3.6 + 1.6 * hash(k, 4, 583), -0.9, 11 + Math.floor(hash(k, 5, 583) * 4), 100 + k);
  }
  for (let k = 0; k < 9; k++) {
    const ang = (k / 9) * Math.PI - Math.PI / 2;
    toPuff(SLUMP, Math.sin(ang) * 8, 2, 30 + hash(k, 2, 584) * 12, Math.sin(ang), Math.cos(ang), 2.2 + hash(k, 3, 584), 3.4, -1, 11, 130 + k);
  }
  // (a low cloud rolling out over the floor from the foot of the burst)
  for (let k = 0; k < 12; k++) {
    const ang = (k / 12) * Math.PI - Math.PI / 2;
    toPuff(BURST + 7, Math.sin(ang) * 6, 10, 1, Math.sin(ang), Math.cos(ang) * 1.3, 2.8 + hash(k, 1, 585), 3.4, 0.05, 14, 150 + k);
  }
  bodies.forEach((b, k) => {
    for (const st of b.struck.slice(0, 2)) if (st.vz < -2.5) {
      const p = states[st.f][k].p;
      const n = b.kind === 'skull' ? 5 : 4;
      for (let j = 0; j < n; j++) {
        const ang = (j / n) * Math.PI * 2 + hash(k, j, 586);
        toPuff(st.f, p[0], p[1], 0, Math.cos(ang), Math.sin(ang), 0.9 + 0.4 * hash(k, j, 587), b.kind === 'skull' ? 3 : 2.4, 0.15, 12, 200 + k * 4 + j);
      }
    }
  });
  // GRIT: trickling from between them as it bulges, and from the hole's top after, to the last frame
  const grit: Grain[] = [];
  const gritAt = (f0: number, a: number, z: number, vb: number, g: number): void => {
    const w = W(a, 1, z);
    const dv = toW([0, vb, 0]);
    grit.push([f0, w[0], w[1], w[2], dv[0], dv[1], g]);
  };
  for (let f0 = 1; f0 < BURST; f0 += f0 < 12 ? 2 : 1) gritAt(f0, (hash(f0, 1, 588) - 0.5) * 30, 10 + hash(f0, 2, 588) * 32, 0.15, 0.55);
  const top = (a: number): number => 25 + 19.5 * Math.sqrt(Math.max(0, 1 - (a / 17.5) ** 2));
  for (const g of grainStream(BURST + 2, N - 1, 0.5, (i) => {
    const a = (hash(i, 1, 589) - 0.5) * 18;
    return [a, 0, Math.max(top(a), SLUMP < BURST + 2 ? 0 : 0) - 1];
  })) gritAt(g[0], g[1], g[3], 0.2 + 0.2 * hash(g[0], 3, 589), 0.5);

  // THE HOLE: where the wall went, deep and dark, growing as it bursts and as the wall above slumps
  const holeAt = (u: number, v: number, f: number): boolean => {
    const a = u / 0.8;
    if (f >= BURST && Math.hypot(a / 16.5, (v - 25) / 18.5) < 1) return true;
    return f >= SLUMP && Math.abs(a) < 10.5 && v > 40 && v < 62 - Math.abs(a) * 0.5;
  };
  const W0 = faceWorld(alongX);
  const looseOf = new Map(loose.map((L, k) => [L.i, k]));
  const tracks: Track[] = loose.map((L) => ({ name: `${SKULL_WALL[L.i].kind === 'skull' ? 'skull' : 'bone'} ${L.i}`, at: [] }));
  const paint = (f: number, record: boolean): Sprite => {
    const S = new Scene(new Px(MW, MH), ax, ay);
    const keepWall = inFront(alongX);
    SKULL_WALL.forEach((s, i) => {
      const k = looseOf.get(i);
      const ramp = s.back ? dimBone : WALL_BONE;
      if (k === undefined) {
        inFaceLight(alongX, 1, () => {
          if (s.kind === 'skull') {
            const q = wallSkullPose(s, alongX);
            skull(S, { c: W0(q.c[0], q.c[1], q.c[2]), F: toW(q.F), U: toW(q.U), R: s.r, jaw: null }, ramp, 1000 + i, s.back ? undefined : keepWall);
          } else boneEnd(S, W0, s, ramp, 1000 + i, s.back ? undefined : keepWall);
        });
        return;
      }
      const b = states[f][k];
      // (in the face's light while in the wall; the room's once out on the floor)
      const inWall = Math.max(0, Math.min(1, 1 - (b.p[1] - 4) / 12));
      // (what is still in the wall is hidden by it; what is out, and what comes from the dark in the hole, is all seen)
      const keep = !b.free ? (s.back ? undefined : keepWall) : (w: V3): boolean => (alongX ? w[1] : w[0]) >= -9;
      // (out in the room, as bright as what lies in it; the dead from further in come out of the dark)
      const rampNow = blend(ramp, BONE, 1 - inWall);
      inFaceLight(alongX, inWall, () => {
        if (!b.free) {
          // (still in the wall, bulging: as it sits in the piece, moved)
          const o = bulge(loose[k], f);
          const Wb = (a: number, bb: number, z: number): V3 => W0(a + o[0], bb + o[1], z + o[2]);
          if (s.kind === 'skull') {
            const q = wallSkullPose(s, alongX);
            skull(S, { c: Wb(q.c[0], q.c[1], q.c[2]), F: toW(q.F), U: toW(q.U), R: s.r, jaw: null }, rampNow, 1000 + i, keep);
          } else boneEnd(S, Wb, s, rampNow, 1000 + i, keep);
        } else if (b.kind === 'skull') {
          skull(S, { c: W0(b.p[0], b.p[1], b.p[2]), F: toW(b.F), U: toW(b.U), R: b.r, jaw: null }, rampNow, 1000 + i, keep);
        } else {
          const tip = sub(b.p, mul(b.F, b.len / 2));
          knuckleBone(S, W0(tip[0], tip[1], tip[2]), toW(b.F), b.len, b.r, rampNow, 1000 + i, keep);
        }
      });
      if (record) {
        const [x, y] = onScreen(W0, b.p);
        const [px, py] = onScreen(W0, f > 0 ? states[f - 1][k].p : b.p);
        const sp = Math.hypot(x - px, y - py);
        tracks[k].at.push({ x, y, shown: 1, size: (b.kind === 'skull' ? 10 : 12) + 2 * sp });
      }
    });
    // (nothing of the wall out past its tile's face, as the piece)
    for (let i = 0; i < S.id.length; i++) {
      const id = S.id[i];
      if (id < 1000) continue;
      const k = looseOf.get(id - 1000);
      const out = k !== undefined && states[f][k].free;
      const u = (i % MW) - ax;
      if (!out && (u < -15 || u > 14)) {
        S.id[i] = -1;
        S.p.erase(i % MW, Math.floor(i / MW));
      }
    }
    S.seams();
    for (let i = 0; i < S.id.length; i++) {
      if (S.id[i] < 0) continue;
      const x = i % MW;
      const y = Math.floor(i / MW);
      S.p.set(x, y, fadeAt(S.p.get(x, y)!, S.hz[i]));
    }
    // the wall's own dark between the dead, and the hole
    const g = flat();
    skullWallGaps(g);
    if (f >= BURST) for (let v = 0; v <= 79; v++) for (let u = -16; u <= 15; u++) if (holeAt(u, v, f)) g.set(fx(u), fy(v), hash(u >> 1, v >> 1, 590) < 0.12 ? EARTH[0] : DEEP);
    // (the cracks round it opening as it bulges, and the gaps between the dead in it gone to black)
    if (f > 4 && f < BURST) {
      const t = (f - 4) / (BURST - 4);
      for (let v = 0; v <= 79; v++) for (let u = -16; u <= 15; u++) {
        const k = Math.hypot(u / 0.8 / 17.5, (v - 25) / 19.5);
        if (k < 1 - 0.5 * (1 - t) && (Math.abs(k - (1 - 0.5 * (1 - t))) < 0.07 || hash(u, v, 591) < t * 0.8)) g.set(fx(u), fy(v), DEEP);
      }
    }
    const base = new Px(MW, MH);
    base.blit(onFacePx(g, alongX), ax - PCX, ay - PFOOT);
    const out = compose(base, [S.p], null);
    // the dust over all, and the grit
    paintPuffs(puffs, f, ax, ay, out, null, [FLOOR_DUST[1], FLOOR_DUST[2]]);
    paintGrains(out, grit, f, ax, ay, ['#5a546e', FLOOR_DUST[0]]);
    return out.sprite(ax, ay, GRAIN);
  };
  const frames: Sprite[] = [];
  for (let f = 0; f < N; f++) frames.push(paint(f, true));
  return { frames, before: [wallSprite(skullWall, alongX, 0, 0)], after: [frames[N - 1]], tracks, jolts: [BURST, SLUMP] };
}

/** Where the rails' end stands from the cart, along x (four tiles), and where its baulk's face is. */
const STOP_X = 4 * KT;
const STOP_FACE = STOP_X - 5.4;
/** The earth heaped behind the stop: how high it is at (x, y). */
const stopMound = (x: number, y: number): number => Math.max(0, -2 + 8 * Math.sqrt(Math.max(0, 1 - ((x - STOP_X - 11) / 9) ** 2 - (y / 15) ** 2)));
/** The points of the cart that may touch the floor or the stop: its body's corners, its wheels' rims. */
function cartPoints(k: CartPose): V3[] {
  const out: V3[] = [];
  for (const sl of [-1, 1]) for (const sw of [-1, 1]) {
    out.push(cartPt(k, sl * CART.l0, sw * CART.w0, CART.z0), cartPt(k, sl * CART.l1, sw * CART.w1, CART.z1));
    for (let a = 0; a < Math.PI * 2; a += Math.PI / 8) out.push(cartPt(k, sl * CART.wheelL + Math.cos(a) * CART.wheelR, sw * CART.wheelW, CART.wheelZ + Math.sin(a) * CART.wheelR));
  }
  return out;
}

/**
 * THE CART RUNS. A mine cart stands on its rails, heaped with ore, a skull and a bone on the heap
 * (`before`), the rails' end four tiles on. It creaks: it shudders on its wheels, rust sifting off it;
 * it lurches, and starts to roll by itself, slow at first, then faster and faster, rattling over the
 * rails' joints, sparks flying from its wheels; it strikes the rails' end at full tilt (the first
 * jolt): it stops dead, the baulk jumping, its back end kicking up, its load flung on over the stop;
 * it goes over onto its side with a crash (the second jolt), the rest of its load pouring out; the
 * ore and the skull bounce and roll and come to rest, dust bursting at each blow; one of its wheels is
 * left turning in the air, slower and slower. Anchored at the middle of the cart's tile: the rails
 * run on from it along x to the stop (the main chat lays them).
 */
function cartRuns(): Moment {
  const MW = 280;
  const MH = 184;
  const ax = 48;
  const ay = 72;
  const CREAK = 16;
  const ROLL = 34;
  const HIT = CREAK + ROLL;
  const TIP = 15;
  const LAND = HIT + TIP;
  const N = 132;
  const XHIT = STOP_FACE - CART.l1;
  const acc = (2 * XHIT) / (ROLL * ROLL);
  const vHit = acc * ROLL;
  /** The cart's way along the rails, frame by frame: still, shuddering, a lurch, rolling faster and faster. */
  const xAt = (f: number): number => {
    if (f < CREAK) return f >= 9 && f <= 12 ? [0, -0.8, -0.4, 0.3][f - 9] : 0;
    const t = Math.min(f - CREAK, ROLL);
    return 0.5 * acc * t * t;
  };
  // (its shudder as it creaks, and its rattle over the joints as it goes)
  const jig = (f: number): [number, number] => {
    if (f < CREAK) {
      const k = f / CREAK;
      return [0, f > 1 ? (hash(f, 1, 600) - 0.5) * 1.2 * k : 0];
    }
    const x = xAt(f);
    const joint = Math.abs(((x + 20) % KT) - 20) < 4 ? 1.4 : 0;
    return [0, (hash(f, 2, 600) - 0.5) * 0.9 * Math.min(1, (f - CREAK) / 12) + joint];
  };
  /** How the cart is turned after it strikes: its back end kicking up and falling, as it goes over onto its side. */
  const tipAt = (t: number): { pitch: number; roll: number } => {
    const up = 0.78;
    const pitch = t <= 5 ? up * Math.sin((Math.PI / 2) * (t / 5)) : t <= TIP ? up * Math.cos((Math.PI / 2) * ((t - 5) / (TIP - 5))) ** 2 : 0;
    const r = Math.max(0, Math.min(1, (t - 2) / (TIP - 2)));
    // (falling over: slow to start, fast at the end; then it rocks on its side and lies still)
    let roll = (Math.PI / 2) * r * r;
    if (t > TIP) roll = Math.PI / 2 - 0.16 * Math.sin(Math.min(Math.PI, ((t - TIP) / 7) * Math.PI)) * Math.exp(-(t - TIP) / 6);
    return { pitch, roll };
  };
  const poseAt = (f: number): CartPose => {
    const spin = xAt(Math.min(f, HIT)) / CART.wheelR;
    // (the wheels of its far side, once it is over, turning on in the air, slower and slower)
    const upSpin = f <= HIT ? spin : spin + (0.5 * (1 - Math.exp(-(f - HIT) / 38))) * 38;
    if (f < HIT) {
      const [dx, dz] = jig(f);
      return { ...CART_STILL, o: [xAt(f) + dx, 0, dz], spin, upSpin, load: CART_STILL.load.map((q) => q) };
    }
    const { pitch, roll } = tipAt(f - HIT);
    let L: V3 = rot([1, 0, 0], [0, 1, 0], pitch);
    let Wd: V3 = [0, 1, 0];
    let Up: V3 = rot([0, 0, 1], [0, 1, 0], pitch);
    Wd = rot(Wd, L, -roll);
    Up = rot(Up, L, -roll);
    L = norm(L);
    const k: CartPose = { ...CART_STILL, o: [0, 0, 0], L, Wd, Up, spin, upSpin, load: [] };
    // (set down so that it rests on the floor, its front against the stop, its near side where it falls)
    const pts = cartPoints(k);
    const zMin = Math.min(...pts.map((q) => q[2]));
    const xMax = Math.max(...pts.map((q) => q[0]));
    const yMax = Math.max(...pts.map((q) => q[1]));
    return { ...k, o: [STOP_FACE - xMax, CART.w1 + 0.6 * roll - yMax, -zMin] };
  };
  // THE LOAD: carried with it until it strikes; then flung on over the stop, and the rest poured out as it goes over
  const LOAD: { kind: 'ore' | 'skull' | 'bone'; at: V3; r: number; len: number }[] = [
    ...CART_LOAD.map(([a, b, c, r]) => ({ kind: 'ore' as const, at: [a, b, c] as V3, r, len: 0 })),
    { kind: 'skull', at: [1, 4, 34.4], r: 4.6, len: 0 },
    { kind: 'bone', at: [-0.5, -1, 31.8], r: 1.2, len: 22.6 },
  ];
  const still = poseAt(HIT - 1);
  const bodies: Body[] = LOAD.map((q, i) => {
    const F: V3 = q.kind === 'bone' ? norm([21, -8, 1.6]) : q.kind === 'skull' ? norm([0.5, 0.85, 0.2]) : [1, 0, 0];
    return { kind: q.kind, p: cartPt(still, q.at[0], q.at[1], q.at[2]), v: [0, 0, 0], F, U: [0, 0, 1], axis: [0, 1, 0], spin: 0, r: q.r, len: q.len, free: false, ground: false, still: false, hits: 0, struck: [], rest: q.kind === 'skull' ? norm([0.6, 1, 0.1]) : undefined };
  });
  // (which go over the stop at once, and which pour out as it goes over)
  const flungAt = (i: number): number => (LOAD[i].at[2] > 29 || LOAD[i].kind !== 'ore' ? HIT : HIT + 5 + (i % 5));
  const states: Body[][] = [];
  for (let f = 0; f < N; f++) {
    const k = poseAt(f);
    bodies.forEach((b, i) => {
      if (b.free) return;
      if (f >= flungAt(i)) {
        b.free = true;
        b.p = cartPt(k, LOAD[i].at[0], LOAD[i].at[1], LOAD[i].at[2]);
        const r = (j: number): number => hash(i, j, 601) - 0.5;
        b.v = f === HIT ? [vHit * (0.32 + 0.24 * (r(1) + 0.5)), 0.8 + r(2) * 2.4, 3.4 + 2 * (r(3) + 0.5)] : [0.8 + r(1) * 1.2, 2.6 + r(2) * 1.6, 1];
        b.axis = norm([r(4), r(5), r(6)]);
        b.spin = b.kind === 'ore' ? 0 : 0.35;
      } else b.p = cartPt(k, LOAD[i].at[0], LOAD[i].at[1], LOAD[i].at[2]);
    });
    if (f > HIT) stepBodies(bodies, f, -1, 0.8, stopMound);
    states.push(bodies.map(copyBody));
  }
  if (states[N - 1].some((b) => !b.still)) throw new Error('the cart: its load is still moving at the end: ' + states[N - 1].filter((b) => !b.still).map((b) => `${b.kind} ${b.p.map((q) => q.toFixed(1))} v ${b.v.map((q) => q.toFixed(2))} g ${b.ground}`).join('; '));
  // THE DUST: at the stop as it strikes; all along its side as it comes down; where the load strikes
  const puffs: Puff[] = [
    ...puffRing(HIT, STOP_FACE, 0, 2, 14, 2.2, 3.4, 61),
    ...puffRing(HIT, STOP_FACE - 2, 0, 18, 7, 1.6, 2.6, 62),
  ];
  {
    const k = poseAt(LAND);
    for (const l of [-15, -5, 5, 15]) {
      const p = cartPt(k, l, CART.w1, CART.z1);
      puffs.push(...puffRing(LAND, p[0], p[1], 0, 6, 1.8, 3, 63 + l));
    }
  }
  bodies.forEach((b, i) => {
    const st = b.struck.find((q) => q.vz < -2.5);
    if (!st) return;
    const p = states[st.f][i].p;
    puffs.push(...puffRing(st.f, p[0], p[1], 0, 4, 0.9, 2.4, 80 + i));
  });
  // RUST shaken off it as it creaks and rattles; grit off the stop as it is struck
  const grit: Grain[] = [];
  for (let f0 = 1; f0 < HIT; f0 += f0 < CREAK ? 2 : 3) {
    const x = xAt(f0) + (hash(f0, 1, 602) - 0.5) * 24;
    grit.push([f0, x, (hash(f0, 2, 602) - 0.5) * 18, 8 + hash(f0, 3, 602) * 8, 0, 0, 0.6]);
  }
  for (let i = 0; i < 14; i++) grit.push([HIT, STOP_X - 4 + (hash(i, 1, 603) - 0.5) * 6, (hash(i, 2, 603) - 0.5) * 30, 17, -0.4 - hash(i, 3, 603) * 0.8, (hash(i, 4, 603) - 0.5) * 0.8, 0.7]);
  // SPARKS off its wheels on the rails as it goes fast, and a spray of them as it strikes: short streaks of an honest fire's orange
  interface Spark { f0: number; p: V3; v: V3; life: number }
  const sparks: Spark[] = [];
  for (let f0 = CREAK + 14; f0 < HIT; f0++) {
    for (let j = 0; j < 2; j++) {
      const sl = j ? 1 : -1;
      const sw = hash(f0, j, 604) < 0.5 ? -1 : 1;
      sparks.push({ f0, p: [xAt(f0) + sl * CART.wheelL, sw * CART.wheelW, 0.6], v: [-1.6 - hash(f0, j + 2, 604) * 2, sw * (0.5 + hash(f0, j + 4, 604)), 1.2 + hash(f0, j + 6, 604) * 1.6], life: 3 + (j % 2) });
    }
  }
  for (let j = 0; j < 14; j++) sparks.push({ f0: HIT, p: [STOP_FACE, (hash(j, 1, 605) - 0.5) * 16, 6 + hash(j, 2, 605) * 8], v: [-1 + hash(j, 3, 605) * 2, (hash(j, 4, 605) - 0.5) * 5, 1 + hash(j, 5, 605) * 3.4], life: 4 + (j % 3) });
  const sparkAt = (s: Spark, k: number): V3 => [s.p[0] + s.v[0] * k, s.p[1] + s.v[1] * k, Math.max(0.5, s.p[2] + s.v[2] * k - 0.6 * k * k)];
  /** The stop's shake as it is struck: its baulk jumps and settles. */
  const shakeAt = (f: number): number => (f < HIT ? 0 : 3.2 * Math.exp(-(f - HIT) / 4) * Math.cos((f - HIT) * 1.9));
  const tracks: Track[] = [{ name: 'the cart', at: [] }, ...LOAD.map((q, i) => ({ name: `${q.kind} ${i}`, at: [] as Track['at'] }))];
  const paint = (f: number, record: boolean): Sprite => {
    const S = new Scene(new Px(MW, MH), ax, ay);
    const k = poseAt(f);
    paintCart(S, { ...k, load: [], bone: false, skull: false }, 1);
    paintStop(S, [STOP_X, 0, 0], shakeAt(f), 100);
    states[f].forEach((b, i) => {
      const id = 200 + i;
      if (b.kind === 'ore') S.ball(b.p, b.r, ORE, id, undefined, 0.1);
      else if (b.kind === 'skull') skull(S, { c: b.p, F: b.F, U: b.U, R: b.r, jaw: null }, BONE, id);
      else longBone(S, sub(b.p, mul(b.F, b.len / 2)), add(b.p, mul(b.F, b.len / 2)), b.r, BONE, id);
    });
    S.seams();
    const out = compose(null, [S.p], null);
    const fire = new Px(MW, MH);
    for (const s of sparks) {
      const kk = f - s.f0;
      if (kk < 0 || kk >= s.life) continue;
      const [x0, y0] = S.at(sparkAt(s, Math.max(0, kk - 0.6)));
      const [x1, y1] = S.at(sparkAt(s, kk));
      fire.line(Math.round(x0), Math.round(y0), Math.round(x1), Math.round(y1), kk < 2 ? EMBER[4] : EMBER[3]);
      fire.set(Math.round(x1) + 1, Math.round(y1), EMBER[2]);
    }
    paintPuffs(puffs, f, ax, ay, out, null, [FLOOR_DUST[1], FLOOR_DUST[2]]);
    fastBlit(out, fire, 0, 0);
    paintGrains(out, grit, f, ax, ay, ['#5a4a5e', '#2e2434']);
    if (record) {
      const c = cartPt(k, 0, 0, 12);
      const pc = cartPt(poseAt(Math.max(0, f - 1)), 0, 0, 12);
      const [x, y] = onPic(c[0], c[1], c[2]);
      const [px, py] = onPic(pc[0], pc[1], pc[2]);
      tracks[0].at.push({ x, y, shown: 1, size: 24 + 2 * Math.hypot(x - px, y - py) });
      states[f].forEach((b, i) => {
        const [bx, by] = onPic(b.p[0], b.p[1], b.p[2]);
        const q = states[Math.max(0, f - 1)][i].p;
        const [qx, qy] = onPic(q[0], q[1], q[2]);
        tracks[1 + i].at.push({ x: bx, y: by, shown: 1, size: (b.kind === 'bone' ? 14 : 8) + 2 * Math.hypot(bx - qx, by - qy) });
      });
    }
    return out.sprite(ax, ay, GRAIN);
  };
  const frames: Sprite[] = [];
  for (let f = 0; f < N; f++) frames.push(paint(f, true));
  return { name: 'the cart runs', frames, fps: 30, before: [paint(0, false)], after: [frames[N - 1]], tracks, jolts: [HIT, LAND], holds: [] };
}

/** Two bones from a shoulder to a hand (`a` and `b` long): where the elbow is, bent toward `hint`; the hand within reach. */
function reach2(sh: V3, target: V3, a: number, b: number, hint: V3): { el: V3; hand: V3 } {
  let d = sub(target, sh);
  let L = Math.hypot(d[0], d[1], d[2]);
  const most = (a + b) * 0.995;
  let hand = target;
  if (L > most) {
    hand = add(sh, mul(d, most / L));
    d = sub(hand, sh);
    L = most;
  }
  const dir = mul(d, 1 / Math.max(L, 1e-6));
  const x = (a * a - b * b + L * L) / (2 * L);
  const h = Math.sqrt(Math.max(0, a * a - x * x));
  const e = norm(sub(hint, mul(dir, dot(hint, dir))));
  return { el: add(add(sh, mul(dir, x)), mul(e, h)), hand };
}
/**
 * A HAND OF BONE at its wrist `wr`, its palm turned `n`, its fingers out along `along`: spread wide
 * (`curl` 0) or clawed shut (`curl` 1.3); each finger three bones, its thumb off to one side.
 */
function boneHand(S: Scene, wr: V3, along: V3, n: V3, curl: number, ramp: Ramp, id: number): void {
  const A = norm(along);
  const N = norm(sub(n, mul(A, dot(n, A))));
  const Sd = cross(A, N);
  const palm = add(wr, mul(A, 3));
  S.egg(palm, [A, N, Sd], [3.6, 1.4, 3.3], (nn) => toneAt(nn, ramp), id);
  for (let k = 0; k < 5; k++) {
    const thumb = k === 0;
    const off = (k - 2.2) * 1.5;
    let p = add(add(wr, mul(A, thumb ? 2 : 5.8)), mul(Sd, thumb ? -3.8 : off));
    // (each finger out along the hand, fanned; then bent in at each joint toward the palm by `curl`)
    let dir = norm(add(add(mul(A, thumb ? 0.6 : 1), mul(Sd, thumb ? -0.8 : off * 0.14)), mul(N, 0.05)));
    const segs = thumb ? [3, 2.6] : [3.4, 2.6, 2.2];
    for (const len of segs) {
      dir = norm(add(mul(dir, Math.cos(curl * 0.62)), mul(N, Math.sin(curl * 0.62))));
      const q = add(p, mul(dir, len));
      S.rod(p, q, 0.8, 0.62, ramp, id);
      S.ball(q, 0.78, ramp, id);
      p = q;
    }
  }
}

/**
 * THE BONES STIR. The heap of the dead lies still (`before`, the piece). A bone on it twitches, and
 * another; a skull rolls off its top and down its side to the floor; the whole heap heaves as if it
 * breathed, its bones grinding and sliding together; then AN ARM OF BONE BURSTS UP OUT OF IT (the
 * first jolt), flinging bones and a skull off it, and claws at the air: up high and reaching for the
 * hero, its hand clenching and spreading; in the front of the heap a skull's sockets kindle with the
 * pink of the thing's fire, and its face turns to him. Then it all gives: the arm comes apart and
 * crashes down onto the heap in pieces (the second jolt), the heap slumps, and the burning skull is
 * dragged down into it, the bones sliding over it, its pink eyes the last of it to go under (never
 * fading out where it lies: seen going into the heap). What is left: the heap, lower and changed, the
 * arm's bones on it, the flung bones about it (`after`). Anchored at the middle of the heap's tile.
 */
function bonesStir(): Moment {
  const MW = 184;
  const MH = 164;
  const ax = 92;
  const ay = 112;
  const ROLL = 9;
  const HEAVE = 16;
  const BURST = 38;
  const GRASP_END = 78;
  const FALLS = 80;
  const SINK = 84;
  const N = 124;
  const H0 = HEAP.h;
  /** How high the heap stands, frame by frame: still, heaving twice, swollen, then slumping lower than it was. */
  const hAt = (f: number): number => {
    if (f < HEAVE) return H0;
    if (f < BURST) {
      const t = (f - HEAVE) / (BURST - HEAVE);
      return H0 + 6.5 * t + 1.6 * Math.sin(t * Math.PI * 3);
    }
    if (f < FALLS) return H0 + 6.5 + 0.6 * Math.sin((f - BURST) * 0.5);
    const t = Math.min(1, (f - FALLS) / 7);
    const low = H0 - 2.6;
    const base = H0 + 6.5 + (low - H0 - 6.5) * (1 - (1 - t) ** 2);
    return base + (f > FALLS + 7 ? 0.5 * Math.exp(-(f - FALLS - 7) / 5) * Math.sin((f - FALLS - 7) * 1.4) : 0);
  };
  /** How far its bones have slid together toward its top (0 to 1). */
  const slideAt = (f: number): number => (f < HEAVE ? 0 : f < BURST ? 0.16 * ((f - HEAVE) / (BURST - HEAVE)) ** 1.4 : f < FALLS ? 0.16 : 0.16 * Math.max(0.4, 1 - (f - FALLS) / 10));
  /** How hard it trembles. */
  const shiver = (f: number): number => (f < HEAVE ? 0.12 : f < BURST ? 0.3 + 0.7 * ((f - HEAVE) / (BURST - HEAVE)) : f < FALLS ? 0.45 : Math.max(0.05, 0.45 * Math.exp(-(f - FALLS) / 10)));
  // THE TWITCHES: a bone jerked up, here and there, in the first half second
  const TWITCH: ReadonlyArray<readonly [number, number]> = [[2, 2], [5, 6], [7, 0], [11, 7], [13, 3]];
  // WHICH GO LOOSE: the skull on its top rolls off; others flung as the arm bursts up
  const topSkull = HEAP_BITS.findIndex((b) => b.kind === 'skull' && b.a[0] === 2 && b.a[1] === -2);
  const flungIdx = HEAP_BITS.map((b, i) => i).filter((i) => i !== topSkull && i !== HEAP_EYES && HEAP_BITS[i].kind === 'bone' && Math.hypot((HEAP_BITS[i].a[0] + HEAP_BITS[i].b[0]) / 2, (HEAP_BITS[i].a[1] + HEAP_BITS[i].b[1]) / 2) < 9);
  /** A point of the heap's skin moved with it: drawn in toward its top, riding up and down with it. */
  const ride = (p: V3, f: number, i: number): V3 => {
    const s = slideAt(f);
    const x = p[0] * (1 - s);
    const y = p[1] * (1 - s);
    const lift = p[2] - heapTop(p[0], p[1], H0);
    const onIt = heapTop(p[0], p[1], H0) > 0.2;
    // (the bones by the skull whose eyes kindle tremble less, so that its eyes are not hidden in a flicker)
    const nearEyes = Math.hypot(p[0] - HEAP_BITS[HEAP_EYES].a[0], p[1] - HEAP_BITS[HEAP_EYES].a[1]) < 12;
    const j = f === 0 ? 0 : shiver(f) * (nearEyes ? 0.25 : 1);
    const r = (k: number): number => (hash(i * 31 + f, k, 610) - 0.5) * 2 * j;
    let z = onIt ? heapTop(x, y, hAt(f)) + lift : p[2];
    for (const [t0, k] of TWITCH) if (k === i && f >= t0 && f < t0 + 3) z += [2.6, 1.4, 0.5][f - t0];
    return [x + r(1), y + r(2), z + (onIt ? r(3) : 0)];
  };
  // THE ARM: out of the heap's top, up and reaching for him, its hand clawing at the air
  const HUP = 23;
  const HLOW = 22;
  const shoulderAt = (f: number): V3 => [-1, -1, heapTop(0, 0, hAt(f)) - 3];
  /** Where its hand is, frame by frame, and how clawed (0 spread, 1.3 shut): up out of the heap, high and reaching, clutching and spreading. */
  const handAt = (f: number): { p: V3; curl: number } => {
    const sh = shoulderAt(f);
    const t = f - BURST;
    if (t < 0) return { p: add(sh, [1, 1, 4 + t * 3]), curl: 1.2 };
    // (up fast, overshooting, then swaying out toward the hero and back, a lunge at the end)
    const up = [3, 19, 33, 42.6, 46.4, 44.2, 42.8][Math.min(t, 6)];
    const sway = t < 6 ? 0 : Math.sin((t - 6) * 0.22) * 6;
    const lunge = t > 30 ? Math.min(1, (t - 30) / 6) * 13 : 0;
    const out = 2 + Math.min(1, t / 6) * 3 + lunge;
    const curl = t < 4 ? 1.1 : [0.1, 0.2, 0.9, 1.3, 1.3, 0.8, 0.1, 0.05, 0.6, 1.3, 1.2, 0.3, 0.05, 0.05][Math.min(13, Math.floor((t - 4) / 3))];
    return { p: add(sh, [out + sway * 0.7, out - sway * 0.7, up - lunge * 0.5 + Math.sin(t * 0.9) * 0.6]), curl };
  };
  // THE LOOSE ONES: the skull off its top; the bones flung off as the arm bursts up; the arm's own bones as it comes apart
  type What = 'skull' | 'bone' | 'upper' | 'fore' | 'hand';
  interface Loose { what: What; i: number; go: number; body: Body }
  const loose: Loose[] = [];
  const groundNow = { h: H0 };
  const ground = (x: number, y: number): number => heapTop(x, y, groundNow.h);
  const bodies: Body[] = [];
  const mk = (what: What, i: number, go: number): Loose => {
    const L: Loose = { what, i, go, body: { kind: what === 'skull' || what === 'hand' ? 'skull' : 'bone', p: [0, 0, 0], v: [0, 0, 0], F: [1, 0, 0], U: [0, 0, 1], axis: [0, 0, 1], spin: 0, r: what === 'hand' ? 3.2 : what === 'skull' ? HEAP_BITS[i].r : 1.1, len: 0, free: false, ground: false, still: false, hits: 0, struck: [], rest: what === 'skull' ? norm([0.7, 1, 0.1]) : undefined } };
    loose.push(L);
    bodies.push(L.body);
    return L;
  };
  mk('skull', topSkull, ROLL);
  for (const i of flungIdx) mk('bone', i, BURST);
  mk('upper', -1, GRASP_END);
  mk('fore', -1, GRASP_END + 1);
  mk('hand', -1, GRASP_END);
  const armAt = (f: number): { sh: V3; el: V3; wr: V3; curl: number; palm: V3 } => {
    const sh = shoulderAt(f);
    const h = handAt(f);
    const { el, hand } = reach2(sh, h.p, HUP, HLOW, [-0.6, -0.6, 0.3]);
    return { sh, el, wr: hand, curl: h.curl, palm: norm([0.8, 0.8, -0.4]) };
  };
  const states: Body[][] = [];
  for (let f = 0; f < N; f++) {
    groundNow.h = hAt(f);
    for (const L of loose) {
      const b = L.body;
      if (b.free || f < L.go) continue;
      b.free = true;
      const r = (k: number): number => hash(L.what.length * 7 + L.i, k, 611) - 0.5;
      if (L.what === 'skull' || L.what === 'bone') {
        const src = HEAP_BITS[L.i];
        if (L.what === 'skull') {
          b.p = ride(src.a, f - 1, L.i);
          b.F = src.F;
          b.v = [0.9, 1.1, 0.4];
        } else {
          const a = ride(src.a, f - 1, L.i);
          const e = ride(src.b, f - 1, L.i);
          b.p = mul(add(a, e), 0.5);
          b.len = Math.hypot(...sub(e, a));
          b.F = norm(sub(e, a));
          b.r = src.r;
          // (flung off the top as the arm bursts up through it, out and up)
          const out = norm([b.p[0] + r(1) * 4, b.p[1] + r(2) * 4, 0]);
          b.v = [out[0] * (2.4 + r(3)), out[1] * (2.4 + r(3)), 4 + 2 * (r(4) + 0.5)];
        }
        b.axis = norm([r(5), r(6), r(7)]);
        b.spin = 0.3;
      } else {
        const A = armAt(f - 1);
        if (L.what === 'upper') {
          b.p = mul(add(A.sh, A.el), 0.5);
          b.F = norm(sub(A.el, A.sh));
          b.len = HUP;
          b.r = 2.1;
        } else if (L.what === 'fore') {
          b.p = mul(add(A.el, A.wr), 0.5);
          b.F = norm(sub(A.wr, A.el));
          b.len = HLOW;
          b.r = 1.5;
        } else {
          b.p = A.wr;
          b.F = norm(sub(A.wr, A.el));
          b.U = A.palm;
        }
        // (it goes limp and drops back onto the heap, the weight of it)
        b.v = [-0.7 + r(1) * 0.5, -0.7 + r(2) * 0.5, -1.2];
        b.axis = norm([r(3), r(4), 0.2]);
        b.spin = 0.12;
      }
    }
    if (f > 0) stepBodies(bodies, f, -1, 0.82, ground);
    states.push(bodies.map(copyBody));
  }
  if (states[N - 1].some((b) => !b.still)) throw new Error('the heap: something still moving at the end: ' + states[N - 1].filter((b) => !b.still).map((b) => `${b.kind} ${b.p.map((q) => q.toFixed(1))} v ${b.v.map((q) => q.toFixed(2))}`).join('; '));
  const collapse = Math.max(...loose.filter((L) => L.what !== 'skull' && L.what !== 'bone').map((L) => L.body.struck[0]?.f ?? FALLS + 4));
  // THE BURNING SKULL: kindling as the arm claws; turning its face to him; then dragged down into the heap
  const eyes = HEAP_BITS[HEAP_EYES];
  const burnAt = (f: number): number => (f < BURST + 6 ? 0 : Math.min(1, (f - BURST - 6) / 9) * (0.85 + 0.15 * Math.sin(f * 1.7)));
  const SUNK = N - 8;
  const eyesAt = (f: number): { c: V3; F: V3 } => {
    const base = ride(eyes.a, Math.min(f, SINK), HEAP_EYES);
    const look = f < BURST + 8 ? 0 : Math.min(1, (f - BURST - 8) / 10);
    const F = norm(add(mul(eyes.F, 1 - look), mul([0.62, 0.62, 0.48], look)));
    if (f < SINK) return { c: add(base, [0, 0, look * 2.4]), F };
    const t = Math.min(1, (f - SINK) / (SUNK - SINK));
    const k = t * t * (3 - 2 * t);
    return { c: add(base, [-k * 4, -k * 4, 2.4 - k * 15]), F: norm(add(F, [0, 0, -k * 0.6])) };
  };
  // (two bones of the heap slide down over it as it goes under)
  const covers = HEAP_BITS.map((b, i) => i).filter((i) => HEAP_BITS[i].kind === 'bone' && !flungIdx.includes(i) && Math.hypot((HEAP_BITS[i].a[0] + HEAP_BITS[i].b[0]) / 2 - eyes.a[0], (HEAP_BITS[i].a[1] + HEAP_BITS[i].b[1]) / 2 - eyes.a[1]) < 13).slice(0, 2);
  const coverAt = (p: V3, f: number, i: number, k: number): V3 => {
    const q = ride(p, f, i);
    if (f < SINK + 4) return q;
    const t = Math.min(1, (f - SINK - 4) / (SUNK - SINK - 2));
    const e = ride(eyes.a, SINK, HEAP_EYES);
    const to: V3 = [e[0] + (k ? 2 : -2) - 1, e[1] + (k ? -2 : 2) - 1, 0];
    const d = mul(sub(to, [q[0], q[1], 0]), t * t * 0.5);
    const x = q[0] + d[0];
    const y = q[1] + d[1];
    return [x, y, heapTop(x, y, hAt(f)) + 1.3];
  };
  // DUST: from the heap as the arm bursts out; where the flung bones and the arm's pieces strike; as it slumps
  const puffs: Puff[] = [...puffRing(BURST, 0, 0, H0 + 6, 10, 1.6, 3.4, 71)];
  loose.forEach((L, k) => {
    const st = L.body.struck.find((q) => q.vz < -2.2);
    if (st) puffs.push(...puffRing(st.f, states[st.f][k].p[0], states[st.f][k].p[1], states[st.f][k].p[2] - 2, 5, 1.1, 2.6, 90 + k));
  });
  puffs.push(...puffRing(FALLS + 2, 0, 0, 2, 14, 2, 3.2, 72));
  // GRIT: sifting down its sides as it heaves, and after
  const grit: Grain[] = [];
  for (let f0 = 1; f0 < N - 6; f0 += f0 < BURST ? 2 : 3) {
    const a = hash(f0, 1, 612) * Math.PI * 2;
    const r = 6 + hash(f0, 2, 612) * 14;
    grit.push([f0, Math.cos(a) * r, Math.sin(a) * r, heapTop(Math.cos(a) * r, Math.sin(a) * r, hAt(f0)) + 3, Math.cos(a) * 0.5, Math.sin(a) * 0.5, 0.5]);
  }
  // (the arm's hand, its upper arm and its forearm: up out of the heap at the jolt, and on as the pieces it falls in)
  const tracks: Track[] = [
    { name: 'the hand', fromEdge: true, at: [] },
    { name: 'the burning eyes', at: [] },
    { name: 'its upper arm', fromEdge: true, at: [] },
    { name: 'its forearm', fromEdge: true, at: [] },
    ...loose.filter((L) => L.what === 'skull' || L.what === 'bone').map((L) => ({ name: `${L.what} ${L.i}`, at: [] as Track['at'] })),
  ];
  const armPart = (f: number, which: 'hand' | 'upper' | 'fore'): V3 | null => {
    if (f < BURST) return null;
    if (f < GRASP_END) {
      const A = armAt(f);
      return which === 'hand' ? A.wr : which === 'upper' ? mul(add(A.sh, A.el), 0.5) : mul(add(A.el, A.wr), 0.5);
    }
    const k = loose.findIndex((L) => L.what === which);
    return states[f][k].free ? states[f][k].p : which === 'fore' ? mul(add(armAt(GRASP_END - 1).el, armAt(GRASP_END - 1).wr), 0.5) : armPart(GRASP_END - 1, which);
  };
  let peak = 1;
  const burnPx: number[] = [];
  const paint = (f: number, record: boolean): Sprite => {
    const S = new Scene(new Px(MW, MH), ax, ay);
    // the heap and its dead, as they are moved
    const bits = HEAP_BITS.map((b, i): HeapBit | null => {
      if (loose.some((L) => L.i === i && (L.what === 'skull' || L.what === 'bone') && f >= L.go)) return null;
      if (i === HEAP_EYES) {
        const e = eyesAt(f);
        return { ...b, a: e.c, F: e.F };
      }
      const k = covers.indexOf(i);
      if (k >= 0) return { ...b, a: coverAt(b.a, f, i, k), b: coverAt(b.b, f, i, k) };
      return { ...b, a: ride(b.a, f, i), b: b.kind === 'bone' ? ride(b.b, f, i) : b.b, U: b.U };
    });
    paintHeap(S, hAt(f), bits, burnAt(f), 1);
    // the arm, while it is whole
    if (f >= BURST - 3 && f < GRASP_END) {
      const A = armAt(f);
      longBone(S, A.sh, A.el, 2.1, BONE, 60);
      S.rod(A.el, A.wr, 1.6, 1.3, BONE, 61);
      S.rod(add(A.el, [1.2, -1.2, 0]), add(A.wr, [1, -1, 0]), 1.2, 1, BONE, 61);
      S.ball(A.el, 2.8, BONE, 61);
      boneHand(S, A.wr, sub(A.wr, A.el), A.palm, A.curl, BONE, 62);
    }
    // the loose ones
    states[f].forEach((b, k) => {
      const L = loose[k];
      if (!b.free) return;
      const id = 70 + k;
      if (L.what === 'skull') skull(S, { c: b.p, F: b.F, U: b.U, R: b.r, jaw: null }, BONE, id);
      else if (L.what === 'hand') boneHand(S, b.p, b.F, b.U, 1, BONE, id);
      else longBone(S, sub(b.p, mul(b.F, b.len / 2)), add(b.p, mul(b.F, b.len / 2)), b.r, BONE, id);
    });
    S.seams();
    const out = compose(null, [S.p], null);
    paintPuffs(puffs, f, ax, ay, out, null, [FLOOR_DUST[1], FLOOR_DUST[2]]);
    paintGrains(out, grit, f, ax, ay, ['#4a3e52', '#2a2232']);
    // how much of the fire in its eyes shows
    // (how much fire, the brighter the more)
    let n = 0;
    const weight = new Map<string, number>([['#2a0c22', 0.1], [FLAME[0], 0.3], [FLAME[1], 0.55], [FLAME[2], 0.8], [FLAME[3], 1]]);
    for (let i = 0; i < S.id.length; i++) if (S.id[i] === 2 + HEAP_EYES) n += weight.get(S.p.get(i % MW, Math.floor(i / MW)) ?? '') ?? 0;
    burnPx[f] = n;
    const sp = out.sprite(ax, ay, GRAIN);
    const e = eyesAt(f);
    const [ex, ey] = S.at(e.c);
    if (n > 0) sp.lights = [{ x: ex / GRAIN, y: ey / GRAIN, r: 7 + 3 * burnAt(f), color: '#ff3a78', a: 0.16 * burnAt(f) * Math.min(1, n / Math.max(1, peak)) }];
    if (record) {
      for (const [ti, which] of [[0, 'hand'], [2, 'upper'], [3, 'fore']] as const) {
        const p = armPart(f, which);
        const q = armPart(f - 1, which);
        if (!p) {
          tracks[ti].at.push(null);
          continue;
        }
        const [x, y] = onPic(p[0], p[1], p[2]);
        const [px, py] = q ? onPic(q[0], q[1], q[2]) : [x, y];
        tracks[ti].at.push({ x, y, shown: 1, size: 12 + 2 * Math.hypot(x - px, y - py) });
      }
      const [cx, cy] = onPic(e.c[0], e.c[1], e.c[2]);
      tracks[1].at.push({ x: cx, y: cy, shown: n, size: 6 });
      let ti = 4;
      states[f].forEach((b, k) => {
        if (loose[k].what !== 'skull' && loose[k].what !== 'bone') return;
        const [x, y] = onPic(b.p[0], b.p[1], b.p[2]);
        const q = states[Math.max(0, f - 1)][k].p;
        const [px, py] = onPic(q[0], q[1], q[2]);
        tracks[ti++].at.push({ x, y, shown: 1, size: 12 + 2 * Math.hypot(x - px, y - py) });
      });
    }
    return sp;
  };
  const frames: Sprite[] = [];
  for (let f = 0; f < N; f++) frames.push(paint(f, true));
  // (how much of its eyes' fire shows, as a share of the most it ever shows)
  peak = Math.max(1, ...burnPx);
  for (const a of tracks[1].at) if (a) a.shown = Math.min(1, a.shown / peak);
  return { name: 'the bones stir', frames, fps: 30, before: [charnelHeap()], after: [frames[N - 1]], tracks, jolts: [BURST, collapse], holds: [] };
}

let moments: Moment[] | null = null;
/** Floor 4's moments around the hero, made the first time they are asked for and kept. */
export function ossuaryMoments(): Moment[] {
  if (moments) return moments;
  const sl = skullWallSpills(true);
  const sr = skullWallSpills(false);
  const spill: Moment = { name: 'the skull wall spills', frames: sl.frames, fps: 30, before: sl.before, after: sl.after, tracks: sl.tracks, jolts: sl.jolts, holds: [], right: { frames: sr.frames, before: sr.before, after: sr.after, tracks: sr.tracks } };
  return (moments = [spill, cartRuns(), bonesStir()]);
}
