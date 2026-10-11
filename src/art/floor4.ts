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
import { CRYPT_FLOORS, DIRT, OLD_IRON, ROCK, TIMBER } from './crypt';
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
/** Rough rock in lumps, each facet its own tone. */
const ROCKY: Ramp = [ROCK[0], ROCK[0], ROCK[1], ROCK[2], ROCK[3]];
/** The Crypt's timber, its lit tones no further toward pink than its own (the fresh look found it rose under a light). */
const TIMBER_DIM: Ramp = [TIMBER[0], TIMBER[1], TIMBER[2], TIMBER[3], TIMBER[3]];
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
const BONE: Ramp = ['#1e1a30', '#2c2642', '#5a5378', '#867ea6', '#a49cc0'];
/** Bone in what stands big in the room (the column, the pyramid, the heap): a step quieter again, so that it stays under the figures (the first fresh look found them as bright as the hero's armour). */
const BIG_BONE: Ramp = ['#191528', '#252036', '#48425f', '#68618a', '#7d76a0'];
const WALL_BONE: Ramp = ['#110e20', '#252038', '#3e3856', '#544e6c', '#605a76'];
/** The amalgamation's fire, pink only (his Colour 3: the enemy's), from a dull kindling to burning: never orange, never red. */
const PINK: Ramp = ['#3a0c2a', '#7a1058', '#c0206a', '#ff4f8a', '#ff4f8a'];
/** The pink as it first kindles: a deep magenta (never a blood red). */
const KINDLING = ['#2a0a36', '#6a1280'] as const;
/** Bone fallen out of a wall, on the floor before it (the wall's piece, and as quiet). */
const HEAP_BONE: Ramp = ['#1a1630', '#28233e', '#47415f', '#5c5676', '#625c7a'];
/** Iron left in the damp and rusted (the Crypt's). Small iron things a little brighter, so they read. */
const IRONS: Ramp = OLD_IRON;
const SMALL_IRON: Ramp = ['#1c1a3a', '#1c1a3a', '#4c4884', '#8480bc', '#a8a4dc'];
const DIM_IRON: Ramp = ['#16142c', '#16142c', '#34305e', '#4c4880', '#4c4880'];
/** Rust, a dull grey-brown (never the red of blood: floor 2's second look found rust by bones reading as spatter). */
const RUST: Ramp = ['#221a24', '#221a24', '#3c2e3a', '#4c3e48', '#4c3e48'];
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
/** Ids from this one up are soft things (dust): no seam of ink round them, nor on what they hide. */
const SOFT = 1 << 20;

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
        if (this.id[i] < 0 || this.id[i] >= SOFT) continue;
        for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]] as const) {
          const X = x + dx;
          const Y = y + dy;
          if (X < 0 || Y < 0 || X >= w || Y >= h) continue;
          const j = Y * w + X;
          if (this.id[j] >= 0 && this.id[j] < SOFT && this.id[j] !== this.id[i] && this.z[j] > this.z[i] + step) {
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
  /** Its sockets this much bigger than a skull's own (the burning skull's, so that its eyes read). */
  big?: number;
}
/** The enemy's fire in a skull's sockets, from a dull kindling to burning (his Colour 3: pink, the enemy's): steady, one pink, its middle the brightest. */
function socketFire(burn: number, deep: number): string {
  if (burn <= 0.05) return DEEP;
  const k = burn * (1 - deep * 0.5);
  return k > 0.62 ? PINK[3] : k > 0.4 ? PINK[2] : k > 0.18 ? KINDLING[1] : KINDLING[0];
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
      const rs = Math.max(0.28, 1.2 / R) * (k.big ?? 1);
      const es = Math.max(0.42, 1.9 / R) * (1 + ((k.big ?? 1) - 1) * 0.4);
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
    S.ball(add(e, mul(side, r * 0.62 * k)), r * 1.08 * k, ramp, id, keep);
    S.ball(add(e, mul(side, -r * 0.62 * k)), r * 0.98 * k, ramp, id, keep);
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
  /** Fire, over all (not shaded on the face in shade, nor faded); `alongX` the face it is on. */
  fire?: (p: Px, alongX: boolean) => void;
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
    m.fire(f, alongX);
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
  // (and the ends of long bones packed between them: what shows when the face of it is gone)
  for (let k = 0; k < 7; k++) ends(1.5 + k * 9, 30 + k, true);
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
  S.rod(tip, far, r * 0.72, r * 0.64, ramp, id, keep);
  S.ball(add(tip, mul(side, r * 0.48)), r * 0.82, ramp, id, keep);
  S.ball(add(tip, mul(side, -r * 0.48)), r * 0.74, ramp, id, keep);
  S.ball(add(far, mul(side, r * 0.4)), r * 0.72, ramp, id, keep);
  S.ball(add(far, mul(side, -r * 0.4)), r * 0.64, ramp, id, keep);
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
const dimBone: Ramp = ['#0a0816', '#110e22', '#1c1830', '#28233e', '#302a48'];
/** The dead deep in the cavity the skull wall leaves. */
const CAVITY: Ramp = ['#07060f', '#0b0919', '#121024', '#1a1630', '#201c38'];
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

/**
 * THE MINERS' BREACH, the wall's height: where they broke through into the ossuary: a ragged hole
 * knocked through the stone well above the floor, its rim broken back to rough rock, cracks run out
 * from it; in it, packed tight in the dark, the dead as the ossuary stacked them, skulls and the ends
 * of long bones, earth between. No timber in it: nothing a player could read as a doorway (the first
 * fresh look did). What came out of it lies heaped on the floor before it (breachHeap).
 */
const BREACH_C: readonly [number, number] = [-0.5, 27];
/** How far the hole reaches from its middle, each way round (1 its usual): broken in jags. */
const breachR = (ang: number): number => {
  const k = Math.floor(((ang + Math.PI) / (Math.PI * 2)) * 15);
  return 1 + 0.13 * Math.sin(3 * ang + 1) + 0.08 * Math.sin(7 * ang + 2) + (hash(k, 0, 519) - 0.5) * 0.26;
};
const BREACH = (u: number, v: number): boolean => {
  const du = (u - BREACH_C[0]) / 12.4;
  const dv = (v - BREACH_C[1]) / 15;
  return Math.hypot(du, dv) < breachR(Math.atan2(dv, du));
};
/** The cracks run out from its rim: from (u, v), a way and a length. */
const BREACH_CRACKS: ReadonlyArray<readonly [number, number, number, number, number]> = [[-9, 39, -0.8, 1, 16], [7, 41, 0.5, 1, 22], [-12, 18, -1, -0.15, 5], [11, 15, 1, 0.3, 4]];
const breach: WallMake = {
  flat: (p) => {
    for (let v = 0; v <= 62; v++) {
      for (let u = -15; u <= 14; u++) {
        if (BREACH(u, v)) {
          // in it: earth packed between the dead; the reveal of the broken stone at its foot in the light, its top dark
          const lip = !BREACH(u, v - 2);
          const brow = !BREACH(u, v + 2);
          p.set(fx(u), fy(v), lip ? (BREACH(u, v - 1) ? RAW[2] : RAW[3]) : brow ? DEEP : hash(u >> 1, v >> 1, 518) < 0.3 ? EARTH[1] : EARTH[0]);
          continue;
        }
        // the broken rim round it: rough rock where the dressed stone came away, lumpy
        const near = BREACH(u - 2, v) || BREACH(u + 2, v) || BREACH(u, v - 2) || BREACH(u, v + 2);
        const near2 = BREACH(u - 4, v) || BREACH(u + 4, v) || BREACH(u, v - 4) || BREACH(u, v + 3);
        if (near) p.set(fx(u), fy(v), BREACH(u, v - 2) || BREACH(u + 2, v) ? RAW[0] : RAW[3]);
        else if (near2 && hash(u >> 1, v >> 1, 520) < 0.75) p.set(fx(u), fy(v), hash(u >> 1, v >> 1, 521) < 0.5 ? RAW[2] : RAW[1]);
      }
    }
    // the cracks out from its rim: thin, a lit edge under each
    BREACH_CRACKS.forEach(([u0, v0, du, dv, n], k) => {
      let u = u0;
      let v = v0;
      for (let i = 0; i < n; i++) {
        const iu = Math.round(u);
        const iv = Math.round(v);
        if (iu < -15 || iu > 14 || BREACH(iu, iv)) break;
        p.set(fx(iu), fy(iv), DEEP);
        if (!BREACH(iu, iv - 1)) p.set(fx(iu), fy(iv - 1), FACE[4]);
        u += du + (hash(i, k, 522) - 0.5) * 0.9;
        v += dv + (hash(i, k, 523) - 0.5) * 0.9;
      }
    });
  },
  solid: (S, W, alongX) => {
    const toW = dirOf(W);
    // the dead packed in it, in the dark behind the face: rows of skulls, the ends of long bones between
    let n = 0;
    const back = -5.5;
    for (const [z, row] of [[14.5, 0], [26.5, 1], [38.5, 2]] as const) {
      const as = row === 1 ? [-11, -0.5, 10] : [-14.5, -5, 4.5, 14];
      for (const a of as) {
        const t = (hash(n, 1, 524) - 0.5) * 0.7;
        skull(S, { c: W(a + (hash(n, 2, 524) - 0.5) * 1.4, back, z + (hash(n, 3, 524) - 0.5) * 1.4), F: toW([Math.sin(t) + (alongX ? 0.2 : -0.2), Math.cos(t), 0.12]), U: toW([0, 0, 1]), R: 3.9, jaw: null }, WALL_BONE, 400 + n++);
      }
    }
    for (const z of [20.5, 32.5]) for (let a = -15; a <= 15; a += 3.6) boneEnd(S, W, { kind: 'end', a: a + (z > 30 ? 1.8 : 0), b: back - 1, z, r: 1.5, turn: 0, tilt: 0, seed: n, back: true }, HEAP_BONE, 400 + n++);
    // (seen only through the hole, its broken reveal round it)
    const m = flat();
    for (let v = 0; v <= 62; v++) for (let u = -15; u <= 14; u++) if (BREACH(u, v) && BREACH(u, v - 2) && BREACH(u, v + 2) && BREACH(u - 1, v) && BREACH(u + 1, v)) m.set(fx(u), fy(v), INK);
    const seen = onFacePx(m, alongX);
    for (let i = 0; i < S.id.length; i++) {
      if (S.id[i] < 400 || S.id[i] >= 600) continue;
      const x = i % S.p.w;
      const y = Math.floor(i / S.p.w);
      if (!seen.has(x, y)) {
        S.id[i] = -1;
        S.p.erase(x, y);
      }
    }
  },
};
/** WHAT CAME OUT OF THE BREACH, heaped on the floor before it: broken stone and earth, long bones and a skull out of the ossuary. At the middle of the tile in front of the wall. */
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
    S.egg([x, y, r * 0.5], [[1, 0, 0], [0, 1, 0], [0, 0, 1]], [r, r * 0.85, r * 0.62], facetOf(ROCKY, 0.02), 600 + n++);
  }
  // the dead out of it (a step quieter than what lies in the room: it is the wall's)
  longBone(S, [-6, 4, 1.4], [8, 10, 1.6], 1.1, HEAP_BONE, 620);
  longBone(S, [4, -2, 3.6], [-8, -8, 4.6], 1.1, HEAP_BONE, 621);
  skull(S, { c: [10, 2, 4.2], F: [0.8, 1, 0.3], U: [0, 0, 1], R: 4.4, jaw: null }, HEAP_BONE, 622);
  skull(S, { c: [-15, 8, 3.8], F: [0.5, 1, 0.2], U: [0, 0, 1], R: 3.8, jaw: null }, HEAP_BONE, 623);
  S.seams();
  return compose(under, [S.p], null).sprite(cx, cy, GRAIN);
}

/** Facets of rough rock: each face of it one tone, as it is turned. */
const facetOf = (r: Ramp, bias = 0.05) => (n: V3): string => toneAt(norm([Math.round(n[0] * 1.6) / 1.6, Math.round(n[1] * 1.6) / 1.6, Math.round(n[2] * 1.6) / 1.6 + 0.05]), r, bias);
/** Timber squared and old: its top lit, its grain along it, its end dark. */
const timberFace = (f: number, u: number, _v: number, n: V3): string => (f === 4 ? TIMBER[3] : f < 2 ? TIMBER[1] : Math.abs(((u * 5) % 1) - 0.5) < 0.06 ? TIMBER[0] : toneAt(n, TIMBER, -0.1));

/**
 * SHORED ROCK, the wall's height: the wall fallen in to raw rock, and the miners' timber holding it
 * back: great lumps of the rock bulging out between a few boards laid across at their own slants, two
 * round props up into the dark holding the boards, one leaning; earth spilled at the foot.
 */
const shoredRock: WallMake = {
  flat: (p) => {
    // the rock behind all: lumps, each lit on its upper left, dark between
    for (let v = 0; v <= 79; v++) {
      for (let u = -14; u <= 13; u++) {
        const cu = Math.floor((u + 40) / 7);
        const cv = Math.floor((v + (cu % 2) * 3) / 6);
        const lu = (u + 40) % 7;
        const lv = (v + (cu % 2) * 3) % 6;
        const k = hash(cu, cv, 524);
        p.set(fx(u), fy(v), lu === 0 || lv === 0 ? RAW[0] : lu === 1 || lv === 5 ? RAW[3] : k < 0.35 ? RAW[1] : RAW[2]);
      }
    }
    // earth spilled from under the lowest board
    for (let u = -9; u <= 7; u++) for (let v = 0; v <= 1 + Math.round(2.4 * Math.sin(((u + 9) / 16) * Math.PI)); v++) p.set(fx(u), fy(v), v > 1 ? EARTH[3] : EARTH[2]);
  },
  solid: (S, W, alongX) => {
    const keep = inFront(alongX);
    const [A, B, U] = axesOf(W);
    let id = 560;
    // the rock bulging out: great rough lumps of it, crowding out past the boards, lit as each facet faces
    for (const [a, z, ra, rz, out] of [[-4, 27, 11, 9, 5.5], [5, 52, 10.5, 8, 5], [-9, 6, 7, 5.5, 3.6], [8, 72, 8, 6, 3.4], [11, 31, 6, 7, 4.2], [-11, 51, 6, 7, 3.8], [4, 9, 6, 4.5, 3]] as const) {
      S.egg(W(a, -0.5, z), [A, B, U], [ra, out, rz], facetOf(ROCKY, 0.08), id++, keep);
    }
    // two boards, short and askew, the rock pushing them out
    for (const [z, tilt, a0, len, b] of [[17, 0.12, -2, 11, 4.4], [41, -0.16, 2.5, 12.5, 5.4]] as const) {
      const along = norm(add(A, mul(U, tilt)));
      const up = norm(sub(U, mul(A, tilt)));
      S.box(W(a0, b, z), [along, B, up], [len, 0.9, 2.6], timberFace, id++);
    }
    // the props: one standing, one leaning hard, up into the dark
    S.rod(W(-11.5, 6.2, 0), W(-10.5, 5.4, 82), 2.4, 2.2, TIMBER_DIM, id++);
    S.rod(W(12, 6.6, 0), W(5, 5.6, 82), 2.4, 2.2, TIMBER_DIM, id++);
  },
};

/** THE DEAD'S ARM: a small dark hole broken in the stone, and out of it an arm of bone, its forearm down across the stone and its hand spread flat against it, fingers wide, clawing. */
const ARM_HOLE = (u: number, v: number): boolean => {
  const du = (u + 3) / 4.4;
  const dv = (v - 30) / 3.8;
  return Math.hypot(du, dv) < 1 + 0.16 * Math.sin(Math.atan2(dv, du) * 5 + 1);
};
const deadArm: WallMake = {
  flat: (p) => {
    for (let v = 23; v <= 37; v++) {
      for (let u = -10; u <= 4; u++) {
        if (ARM_HOLE(u, v)) p.set(fx(u), fy(v), DEEP);
        else if (ARM_HOLE(u, v + 1) || ARM_HOLE(u + 1, v)) p.set(fx(u), fy(v), FACE[0]);
        else if (ARM_HOLE(u, v - 1) || ARM_HOLE(u - 1, v)) p.set(fx(u), fy(v), FACE[4]);
      }
    }
  },
  solid: (S, W, alongX) => {
    const keep = (w: V3): boolean => (alongX ? w[1] : w[0]) >= -3;
    // the upper arm out of the hole, the elbow out from the wall, the forearm's two bones down across it
    const sh = W(-3.5, -2, 30);
    const el = W(-8, 4, 22);
    const wr = W(-11, 2.4, 13.5);
    longBone(S, sh, el, 1.7, WALL_BONE, 700, keep);
    S.ball(el, 2.4, WALL_BONE, 701, keep);
    const side = sub(W(1.1, 0, 0), W(0, 0, 0));
    S.rod(add(el, side), add(wr, side), 1.2, 1, WALL_BONE, 702, keep);
    S.rod(sub(el, side), sub(wr, side), 1, 0.85, WALL_BONE, 703, keep);
    flatHand(S, W, [-11, 1.6, 13.5], -Math.PI / 2 - 0.25, 1.2, WALL_BONE, 704, keep);
  },
};
/** A HAND OF BONE SPREAD FLAT against a wall's face, from its wrist (along, out, up), its fingers fanned out round `ang` (in the face: 0 along it, up π/2), `size` its scale. */
function flatHand(S: Scene, W: (a: number, b: number, z: number) => V3, wr: V3, ang: number, size: number, ramp: Ramp, id: number, keep?: (w: V3) => boolean): void {
  const at = (a: number, z: number, b = wr[1]): V3 => W(a, b, z);
  const way = (t: number): [number, number] => [Math.cos(t), Math.sin(t)];
  const [da, dz] = way(ang);
  // the palm: a flat egg along the hand
  const pc: [number, number] = [wr[0] + da * 3 * size, wr[2] + dz * 3 * size];
  const [A, B] = axesOf(W);
  const along = norm(add(mul(A, da), [0, 0, dz]));
  S.egg(at(pc[0], pc[1]), [along, B, norm(cross(B, along))], [3.4 * size, 1.1, 3.2 * size], (n) => toneAt(n, ramp), id, keep);
  for (let k = 0; k < 5; k++) {
    const thumb = k === 0;
    const t = ang + (thumb ? -1.25 : (k - 2.6) * 0.34);
    const [fa, fz] = way(t);
    let a = pc[0] + fa * (thumb ? 2.4 : 3) * size;
    let z = pc[1] + fz * (thumb ? 2.4 : 3) * size;
    const segs = thumb ? [2.6, 2.2] : [3.2, 2.6, 2.2];
    segs.forEach((len, j) => {
      // (each joint bent a little: clawing at the stone)
      const tt = t + (j === segs.length - 1 ? 0.35 : 0.12) * (k % 2 ? 1 : -1);
      const [ga, gz] = way(tt);
      const a1 = a + ga * len * size;
      const z1 = z + gz * len * size;
      S.rod(at(a, z, wr[1] + 0.3), at(a1, z1, wr[1] + 0.3 - j * 0.2), 0.62, 0.52, ramp, id, keep);
      S.ball(at(a1, z1, wr[1] + 0.3 - j * 0.2), 0.7, ramp, id, keep);
      a = a1;
      z = z1;
    });
  }
}

/** A SEAM OF ORE in rough rock where the miners dug: the rock hacked back round it, the scores of their picks; a jagged pale vein slanting across it, forking, and nuggets of metal in it catching the light (dull silver, never gold). */
const VEIN = ['#2c2840', '#504a6a', '#5e5878'] as const;
function oreSeam(p: Px): void {
  const inside = (u: number, v: number): boolean => {
    const a = Math.atan2(v - 15, u + 0.5);
    return ((u + 0.5) / 13.5) ** 2 + ((v - 15) / 11) ** 2 <= (1 + 0.1 * Math.sin(a * 6) + (hash(Math.floor((a + 4) * 3), 0, 529) - 0.5) * 0.16) ** 2;
  };
  for (let v = 2; v <= 28; v++) {
    for (let u = -15; u <= 14; u++) {
      if (!inside(u, v)) continue;
      const edgeLit = !inside(u - 1, v) || !inside(u, v + 1);
      const edgeDark = !inside(u + 1, v) || !inside(u, v - 1);
      p.set(fx(u), fy(v), edgeLit ? RAW[0] : edgeDark ? RAW[3] : hash(u >> 1, v >> 1, 530) < 0.55 ? RAW[0] : RAW[1]);
    }
  }
  // the vein: a jagged band from the lower left up to the right, and a fork off it
  const line = (u0: number, v0: number, u1: number, v1: number, w: number, seed: number): void => {
    let jag = 0;
    for (let u = u0; u <= u1; u++) {
      jag = Math.max(-1.6, Math.min(1.6, jag + (hash(u, seed, 531) - 0.5) * 1.6));
      const c = v0 + ((u - u0) / (u1 - u0)) * (v1 - v0) + jag;
      const half = w * (0.7 + 0.5 * hash(u >> 1, seed, 532));
      for (let v = Math.floor(c - half); v <= Math.ceil(c + half); v++) {
        if (!inside(u, v) || !inside(u, v + 1)) continue;
        p.set(fx(u), fy(v), v >= c + half - 0.6 ? VEIN[2] : v <= c - half + 0.6 ? RAW[0] : VEIN[1]);
      }
    }
  };
  line(-13, 8, 13, 22, 2.1, 1);
  line(-2, 14, 9, 7, 1.2, 2);
  // nuggets of metal along it, lit on their upper left
  for (const [u, v] of [[-8, 11], [1, 15], [8, 19], [4, 10]] as const) {
    p.set(fx(u - 1), fy(v + 1), ORE[3]).set(fx(u), fy(v + 1), GLINT).set(fx(u + 1), fy(v + 1), ORE[3]);
    p.set(fx(u - 1), fy(v), ORE[2]).set(fx(u), fy(v), ORE[3]).set(fx(u + 1), fy(v), ORE[1]).set(fx(u), fy(v - 1), ORE[0]);
  }
  // the scores of the picks, short and slanting
  for (let i = 0; i < 7; i++) {
    const u0 = -11 + Math.floor(hash(i, 1, 533) * 22);
    const v0 = 5 + Math.floor(hash(i, 2, 533) * 18);
    for (let k = 0; k < 3; k++) if (inside(u0 + k, v0 + k)) p.set(fx(u0 + k), fy(v0 + k), DEEP).set(fx(u0 + k + 1), fy(v0 + k), RAW[3]);
  }
}

/** WHERE THE STONE HAS FALLEN AWAY: packed earth behind, and the dead in it as they were laid, a layer of them: long bones lying straight along it, three skulls half sunk, staring out. */
const charnelLayer: WallMake = {
  flat: (p) => {
    const top = (u: number): number => 25 + Math.round(2.6 * Math.sin(u * 0.33 + 0.4) + 0.8 * Math.sin(u * 0.9));
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
    const toW = dirOf(W);
    // long bones lying along the layer, straight, side on (none crossing another)
    longBone(S, W(-16, 0.8, 4.2), W(-1, 0.8, 4.8), 1.25, WALL_BONE, 800, keep);
    longBone(S, W(4, 0.8, 3.8), W(16, 0.8, 4.4), 1.15, WALL_BONE, 801, keep);
    longBone(S, W(-5, 0.8, 21), W(10, 0.8, 20.2), 1.15, WALL_BONE, 802, keep);
    longBone(S, W(-16, 0.8, 21.6), W(-9, 0.8, 21.2), 1.05, WALL_BONE, 803, keep);
    // three skulls half sunk in it, staring out
    for (const [a, z, R, t, k] of [[-10, 12.5, 4, 0.25, 0], [3.5, 12, 4.3, -0.2, 1], [13.5, 13.5, 3.7, -0.4, 2]] as const) {
      skull(S, { c: W(a, -0.6, z), F: toW([Math.sin(t) + (alongX ? 0.25 : -0.25), Math.cos(t), 0.12]), U: toW([0, 0, 1]), R, jaw: null }, WALL_BONE, 804 + k, keep);
    }
  },
};

// =================================================================================================
// ON THE WALLS

/** How far out from the wall the lantern hangs. */
const LANTERN_OUT = 4.5;
/** Where the lantern's glass has its middle, up the wall. */
const LANTERN_Z = 27;
/**
 * A MINER'S LANTERN hung from an iron bracket driven into the stone: the bracket's plate on the wall,
 * its arm straight out, a hook at its end; the lantern hanging from it by its ring: a peaked iron cap,
 * a cage of bars round its glass, the flame inside it, an iron foot: frame `f` of four.
 */
function minersLantern(f: number): WallMake {
  return {
    flat: (p) => {
      // the bracket's plate on the stone
      for (let v = 37; v <= 43; v++) for (let u = -2; u <= 1; u++) p.set(fx(u), fy(v), u === -2 || v === 43 ? SMALL_IRON[3] : v === 37 ? SMALL_IRON[0] : SMALL_IRON[1]);
    },
    solid: (S, W) => {
      const [A, B, U] = axesOf(W);
      const o = LANTERN_OUT;
      // the bracket: its arm straight out from the plate, and down at its end to the ring
      S.rod(W(0, 0.4, 40), W(0, o + 0.6, 40), 0.8, 0.75, SMALL_IRON, 850);
      S.rod(W(0, o, 40), W(0, o, 36.6), 0.6, 0.6, SMALL_IRON, 850);
      // its ring
      S.ball(W(0, o, 35.8), 0.9, SMALL_IRON, 851);
      // the cap: peaked, iron
      for (let z = 31.5; z <= 35; z += 0.5) {
        const r = 3.3 * (1 - (z - 31.5) / 4);
        S.box(W(0, o, z), [A, B, U], [r, r, 0.3], (fc, _u, _v, n) => (fc === 4 ? (z > 34 ? DIM_IRON[3] : IRONS[2]) : toneAt(n, IRONS, 0.1)), 852);
      }
      // the glass, lit by the flame within, in a cage of bars: four at its corners and one up each side's middle, a band at its top and its foot
      S.box(W(0, o, LANTERN_Z), [A, B, U], [2.7, 2.7, 4.2], (fc, u, v) => {
        if (fc === 4 || fc === 5) return IRONS[1];
        if (u < 0.16 || u > 0.84 || Math.abs(u - 0.5) < 0.09 || v < 0.1 || v > 0.9) return fc === 0 || fc === 2 ? IRONS[2] : IRONS[1];
        return v < 0.35 ? GLASS[2] : v < 0.7 ? GLASS[1] : GLASS[0];
      }, 853);
      // its foot
      S.box(W(0, o, 22.2), [A, B, U], [3.2, 3.2, 0.8], (fc, _u, _v, n) => (fc === 4 ? IRONS[2] : toneAt(n, IRONS, 0)), 854);
    },
    // the flame, seen through the glass (as fire: as bright on the face in shade)
    fire: (p, alongX) => {
      const o = LANTERN_OUT;
      flame(p, fx(Math.round((alongX ? -0.8 : 0.8) * o)), fy(Math.round(LANTERN_Z - 2 - 0.4 * o + Math.floor(-0.4 * o))), 5 + (f % 2), 1.3, [0, 0.6, 0, -0.6][f]);
    },
  };
}
/** The lantern's glass, lit from within: a dull orange (the flame's, an honest fire's), never gold. */
const GLASS = ['#2e1810', '#4a2414', '#6a3418'] as const;
/** The lantern's light, at its glass. */
const lanternLight = (f: number, du: number, dv: number) => (alongX: boolean): Light[] => {
  const x = PCX + du + (alongX ? -1 : 1) * LANTERN_OUT * 0.8;
  const y = PFOOT - dv - LANTERN_Z + LANTERN_OUT * 0.4;
  return [{ x: x / GRAIN, y: y / GRAIN, r: 13 + (f % 2), color: EMBER[2], a: alongX ? 0.42 : 0.36 }];
};

/** A PICK DRIVEN INTO THE WALL: its head of iron (lighter than the stone, so it reads), one point sunk in a crack it split in the stone, the other out and curving down; its haft hanging down along the wall at a slant. */
function pickInWall(p: Px): void {
  // the crack round its buried point: a split, and short cracks out from it
  for (const [u0, v0, du, dv, n] of [[7, 37, 1, 0.4, 6], [8, 37, 0.6, 1, 5], [8, 36, 0.8, -0.9, 4]] as const) {
    for (let k = 0; k < n; k++) {
      const u = Math.round(u0 + du * k);
      const v = Math.round(v0 + dv * k);
      p.set(fx(u), fy(v), DEEP).set(fx(u), fy(v - 1), FACE[4]);
    }
  }
  const a = flat();
  // the head: from its buried point (at the crack) through its eye, and out to its other point, curving down
  for (let k = 0; k <= 15; k++) {
    const t = k / 15;
    const u = 7 - k;
    const v = 37 - Math.round((t * t) * 5);
    const thick = k < 2 || k > 12 ? 1 : 2;
    a.set(fx(u), fy(v + 1), SMALL_IRON[3]);
    if (thick > 1) a.set(fx(u), fy(v), SMALL_IRON[2]);
    a.set(fx(u), fy(v - thick + 1 - 1), SMALL_IRON[1]);
  }
  // its eye, where the haft goes in
  a.rect(fx(1), fy(39), 3, 4, SMALL_IRON[2]).set(fx(1), fy(39), SMALL_IRON[3]).set(fx(3), fy(36), SMALL_IRON[0]);
  // the haft, down and out at a slant
  for (let k = 0; k <= 22; k++) {
    const u = 2 + Math.round(k * 0.36);
    const v = 34 - k;
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
  for (const [u, k] of [[-6, 1], [2, -1]] as const) p.set(fx(u + 2), fy(32), TIMBER[3]).set(fx(u + 2 + k), fy(32), TIMBER[3]).set(fx(u + 2 + k * 2), fy(31), TIMBER[3]);
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
 * THE MAW, the amalgamation's own, as a mark: a mouth roaring open, wider than it is tall, its corners
 * cut square (never the almond of an eye); in it three great fangs, few and of every size: a great one
 * hanging on its left, a smaller on its right meeting one from its lower lip under it (never up and
 * down by turns, a row that could be read as letters, as the first fresh look read "WAW"); its throat deep in the middle. (x, y) across and up, in half its width.
 */
function mawAt(x: number, y: number): 'lip' | 'fang' | 'in' | 'throat' | null {
  if (Math.abs(x) > 1) return null;
  const h = 0.66 * Math.sqrt(Math.max(0, 1 - x ** 6)) + 0.035 * Math.sin(x * 11 + 0.6);
  // (a snarl: its upper lip drawn up on one side)
  const yc = y + 0.08 * x - (y > 0 ? 0.1 * Math.max(0, x) : 0);
  if (Math.abs(yc) > h + 0.15) return null;
  if (Math.abs(yc) > h) return 'lip';
  // (its fangs: a great one hanging on its left, a smaller on its right meeting one up from its lower lip under it; never up and down by turns, which reads as a W)
  for (const [c, len, up, w] of [[-0.42, 1.12, 1, 0.3], [0.5, 0.62, 1, 0.21], [0.56, 0.5, -1, 0.19]] as const) {
    const d = up > 0 ? h - yc : yc + h;
    const L = len * h;
    // (each fang wide at its root, to a point, curved in toward the middle)
    if (d < L && Math.abs(x - c + (d / L) ** 2 * 0.07 * Math.sign(c || 1)) < w * (1 - d / L) + 0.015) return 'fang';
  }
  return Math.hypot(x / 0.5, (yc + 0.05) / 0.38) < 1 ? 'throat' : 'in';
}

/** THE CULT'S DAUB: the maw, the amalgamation's, daubed on the stone by those who serve it: its lips in rough strokes of pale chalk, square at the corners, its three fangs stroked in, a smear off one corner; the stone showing through it all (never a filled black shape, which read as a hole, or as a famous bat in an oval). */
const CHALK = ['#3a3450', '#4e4866', '#5e5878'] as const;
function cultDaub(p: Px): void {
  for (let v = 10; v <= 42; v++) {
    for (let u = -15; u <= 14; u++) {
      const x = (u + 0.5) / 14;
      const y = (v - 26) / 14;
      if (Math.abs(x) > 1.02) continue;
      const h = 0.66 * Math.sqrt(Math.max(0, 1 - Math.min(1, Math.abs(x)) ** 6)) + 0.035 * Math.sin(x * 11 + 0.6);
      const yc = y + 0.08 * x - (y > 0 ? 0.1 * Math.max(0, x) : 0);
      // (a stroke is a little ragged, its paint thinner here and there)
      const gap = hash(u, v >> 1, 545) < 0.1;
      const lip = (Math.abs(yc - h) < 0.085 || Math.abs(yc + h) < 0.085 || (Math.abs(x) > 0.93 && Math.abs(yc) < h + 0.05)) && !gap;
      const fang = mawAt(x, y) === 'fang' && Math.abs(yc) < h - 0.02;
      if (fang) p.set(fx(u), fy(v), mawAt((u - 0.5) / 14, y) === 'fang' ? CHALK[1] : CHALK[2]);
      else if (lip) p.set(fx(u), fy(v), Math.abs(yc - h) < 0.04 || Math.abs(yc + h) < 0.04 ? CHALK[2] : CHALK[1]);
    }
  }
  // a smear off its corner, and a drip of it run down (short, never like tears)
  for (let k = 0; k < 5; k++) p.set(fx(14 - k), fy(29 + Math.round(k * 0.4)), CHALK[0]).set(fx(14 - k), fy(30 + Math.round(k * 0.4)), CHALK[1]);
}

/** A RIB CAGE ON A SPIKE: an iron spike driven into the wall, and on it, hung by the top of its spine, the ribs of one of the dead: the spine down its middle, the ribs curving out and round from it, drooping. */
const ribsOnSpike: WallMake = {
  flat: (p) => {
    for (let v = 41; v <= 45; v++) for (let u = -2; u <= 1; u++) p.set(fx(u), fy(v), u === -2 || v === 45 ? SMALL_IRON[3] : SMALL_IRON[1]);
  },
  solid: (S, W, alongX) => {
    const keep = inFront(alongX);
    // the spike: out from its plate, a little up, its point past the ribs
    S.rod(W(0, 0.4, 43), W(0, 11, 44.5), 0.75, 0.45, SMALL_IRON, 980);
    // the spine: its bones, one under another, from the spike down
    for (let k = 0; k < 7; k++) S.ball(W(0, 3.4 + k * 0.1, 42.6 - k * 3), 1.25 - k * 0.04, BONE, 981, keep);
    S.rod(W(0, 3.4, 42.6), W(0, 4, 24.6), 0.7, 0.7, BONE, 981, keep);
    // the ribs: four pairs, thick, each curving out from the spine and round, drooping to its end, open at the front
    for (let j = 0; j < 4; j++) {
      const z0 = 40 - j * 4.2;
      const R = 4.8 + 1.8 * Math.sin(((j + 0.8) / 4.6) * Math.PI);
      for (const s of [-1, 1]) {
        let prev: V3 | null = null;
        for (let t = 0; t <= 0.66; t += 0.066) {
          const th = t * Math.PI;
          const w = W(s * R * Math.sin(th) * 1.2, 3.6 + R * 0.55 * (1 - Math.cos(th)), z0 - 5.2 * (t / 0.66) ** 1.5);
          if (prev) S.rod(prev, w, 0.85, 0.75, BONE, 982 + j, keep);
          prev = w;
        }
      }
    }
  },
};

/** THE DART SLOT, on this floor: a stone plate, a long black slot across it, and set round the slot the dead's teeth, great pale fangs hanging into it from above and standing up into it from below, the darts' points glinting in the dark between. */
const jawSlot: WallMake = {
  flat: (p) => {
    relief(p, FACE, (u, v) => Math.abs(u + 0.5) <= 12.5 && v >= 17 && v <= 35, -13, 12, 17, 35);
    // the slot
    for (let u = -10; u <= 9; u++) for (let v = 22; v <= 30; v++) p.set(fx(u), fy(v), DEEP);
    // the fangs: three, great and pale and curved, far apart: two hanging from its upper lip, one standing from its lower at its end (never a zigzag that could be read as a letter)
    for (const [c, len, down, w, bend] of [[-6.5, 7, 1, 2.6, 1.2], [1.5, 5, 1, 2.2, 0.9], [6.5, 6, -1, 2.4, -1]] as const) {
      for (let d = 0; d < len; d++) {
        const t = d / len;
        const half = w * (1 - t) ** 0.8;
        const m = c + bend * t * t;
        const v = down > 0 ? 30 - d : 22 + d;
        for (let u = Math.round(m - half); u <= Math.round(m + half - 0.5); u++) p.set(fx(u), fy(v), u < m - half * 0.2 ? WALL_BONE[4] : u > m + half * 0.4 ? WALL_BONE[2] : WALL_BONE[3]);
      }
    }
    // the darts' points in the dark
    p.set(fx(-4), fy(26), GLINT).set(fx(-3), fy(26), DIM_IRON[3]).set(fx(5), fy(26), DIM_IRON[3]);
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

/** A bone lying flat on a tile, (x0, y0) to (x1, y1) (from the tile's middle), `w` thick: its colour at (x, y), or null. Lit on its side toward the light, its knobbed ends a little wider. */
function flatBone(x: number, y: number, b: readonly [number, number, number, number, number], ramp: Ramp): string | null {
  const [x0, y0, x1, y1, w0] = b;
  const sg = onSeg(x, y, x0, y0, x1, y1);
  const w = sg.t < 0.09 || sg.t > 0.91 ? w0 * 1.5 : w0;
  if (sg.d < w) return sg.side < 0 ? (sg.d > w * 0.45 ? ramp[4] : ramp[3]) : sg.d > w * 0.55 ? ramp[1] : ramp[2];
  return null;
}

/** EARTH AND BONES: the earth turned over, broken bones pressed into it every way, scattered as they fell (never in a pattern), a skull face up in it off to one side, teeth here and there. */
const EARTH_BONES: ReadonlyArray<readonly [number, number, number, number, number]> = [
  [-0.42, -0.08, -0.12, -0.3, 0.028], [0.0, 0.28, 0.38, 0.17, 0.03], [-0.34, 0.36, -0.2, 0.06, 0.026], [0.18, -0.42, 0.28, -0.16, 0.024], [-0.14, 0.02, -0.02, 0.14, 0.02], [0.26, -0.06, 0.44, 0.08, 0.02],
];
function earthAndBones(u: number, v: number): string | null {
  const [x, y] = mid(u, v);
  for (const b of EARTH_BONES) {
    const c = flatBone(x, y, b, WALL_BONE);
    if (c) return c;
    if (onSeg(x, y, b[0], b[1], b[2], b[3]).d < b[4] * 1.6 + 0.018 && onSeg(x, y, b[0], b[1], b[2], b[3]).side > 0) return EARTH[0];
  }
  // a skull face up, sunk to its brow, off to one side: its crown, two sockets, its nose
  const sx = x - 0.16;
  const sy = y + 0.1;
  const sk = Math.hypot(sx / 1.05, sy);
  if (sk < 0.12) {
    for (const e of [-0.042, 0.042]) if (Math.hypot(sx - sy - e * 1.4, (sx + sy) * 1.6 - 0.065) < 0.033) return DEEP;
    if (Math.abs(sx - sy) < 0.014 && (sx + sy) * 1.6 > 0.12 && (sx + sy) * 1.6 < 0.16) return DEEP;
    return sk > 0.097 ? (sx + sy < 0 ? WALL_BONE[4] : WALL_BONE[1]) : sx + sy < -0.05 ? WALL_BONE[3] : WALL_BONE[2];
  }
  if (sk < 0.14) return EARTH[0];
  if (hash(Math.floor(u * 32), Math.floor(v * 32), 555) < 0.02) return WALL_BONE[3];
  return earthAt(u, v, 2);
}

/** WHERE ITS HANDS RAKED THE EARTH: four long furrows dragged right across together, a little apart, each with its ridge of thrown-up earth lit along one lip and its other in shade, their ends ragged, clods kicked out where they stop. */
function clawRaked(u: number, v: number): string | null {
  const [x, y] = mid(u, v);
  // along a slant across the tile
  const s = x * 0.94 + y * 0.34;
  const t = -x * 0.34 + y * 0.94;
  for (let k = 0; k < 4; k++) {
    const c = -0.19 + k * 0.125 + 0.018 * Math.sin(s * 7 + k * 1.7) + 0.012 * Math.sin(s * 19 + k);
    const d = t - c;
    const s0 = -0.47 + hash(k, 1, 548) * 0.1 + 0.03 * Math.sin(t * 40);
    const s1 = 0.38 + hash(k, 2, 548) * 0.08 + 0.03 * Math.sin(t * 37 + k);
    if (s < s0 || s > s1 + 0.04) continue;
    const end = Math.min(1, (s - s0) / 0.08, (s1 - s) / 0.06 + 0.3);
    const w = 0.022 * (0.4 + 0.6 * Math.max(0, end));
    if (s > s1) {
      // the clods kicked out where it stops
      if (Math.abs(d) < 0.03 && hash(Math.floor(u * 40), Math.floor(v * 40), 549 + k) < 0.5) return hash(Math.floor(u * 40), Math.floor(v * 40), 547) < 0.5 ? EARTH[3] : EARTH[0];
      continue;
    }
    if (Math.abs(d) < w) return DEEP;
    if (d < 0 && d > -w - 0.02) return EARTH[0];
    if (d > 0 && d < w + 0.03) return EARTH[3];
  }
  return earthAt(u, v, 3);
}

/** A FLOOR PAVED WITH BONE: long bones laid flat and packed close every way, big and of every length, the earth between them; a skull's crown among them. Laid in a slab of the floor. */
const PAVED: ReadonlyArray<readonly [number, number, number, number, number]> = (() => {
  const out: [number, number, number, number, number][] = [];
  for (let i = 0; i < 5; i++) {
    for (let j = 0; j < 5; j++) {
      const k = i * 5 + j;
      const cx = -0.33 + i * 0.165 + (hash(k, 1, 556) - 0.5) * 0.08;
      const cy = -0.33 + j * 0.165 + (hash(k, 2, 556) - 0.5) * 0.08;
      const a = hash(k, 3, 556) * Math.PI;
      const len = 0.09 + hash(k, 4, 556) * 0.08;
      out.push([cx - Math.cos(a) * len, cy - Math.sin(a) * len, cx + Math.cos(a) * len, cy + Math.sin(a) * len, 0.026 + hash(k, 5, 556) * 0.01]);
    }
  }
  return out;
})();
/** A bone lying flat, bent a little along its length by `bend` (a share of its length, to one side). */
function curvedBone(x: number, y: number, b: readonly [number, number, number, number, number], bend: number, ramp: Ramp): string | null {
  const [x0, y0, x1, y1, w0] = b;
  const L = Math.hypot(x1 - x0, y1 - y0) || 1;
  const cx = (x0 + x1) / 2 - ((y1 - y0) / L) * bend * L;
  const cy = (y0 + y1) / 2 + ((x1 - x0) / L) * bend * L;
  const at = (t: number): [number, number] => [(1 - t) ** 2 * x0 + 2 * (1 - t) * t * cx + t * t * x1, (1 - t) ** 2 * y0 + 2 * (1 - t) * t * cy + t * t * y1];
  let best: { d: number; t: number; side: number } | null = null;
  for (let k = 0; k < 6; k++) {
    const [ax, ay] = at(k / 6);
    const [bx, by] = at((k + 1) / 6);
    const sg = onSeg(x, y, ax, ay, bx, by);
    if (!best || sg.d < best.d) best = { d: sg.d, t: (k + sg.t) / 6, side: sg.side };
  }
  const w = best!.t < 0.09 || best!.t > 0.91 ? w0 * 1.5 : w0;
  if (best!.d < w) return best!.side < 0 ? (best!.d > w * 0.45 ? ramp[4] : ramp[3]) : best!.d > w * 0.55 ? ramp[1] : ramp[2];
  return null;
}
function bonePaved(u: number, v: number): string | null {
  const [x, y] = mid(u, v);
  // a skull's crown among them
  const sk = Math.hypot((x + 0.12) / 1.05, y - 0.16);
  if (sk < 0.075) return sk > 0.058 ? (x + y < 0.04 ? WALL_BONE[4] : WALL_BONE[1]) : x + y < 0 ? WALL_BONE[3] : WALL_BONE[2];
  for (let i = PAVED.length - 1; i >= 0; i--) {
    const c = curvedBone(x, y, PAVED[i], (hash(i, 6, 556) - 0.5) * 0.36, WALL_BONE);
    if (c) return c;
  }
  return hash(Math.floor(u * 30), Math.floor(v * 30), 557) < 0.3 ? EARTH[1] : EARTH[0];
}

/** THE DRAG: where the heap of the dead hauled itself through the earth, along x: a broad trough, gouged deep in it here and there where it gripped, the earth pushed up along both its banks (lit on top), bits of bone it dropped trailing in it. */
function dragTrail(u: number, v: number): string | null {
  const [x, y] = mid(u, v);
  const c = 0.03 * Math.sin(x * 5 + 0.5);
  const d = y - c;
  const half = 0.17 + 0.02 * Math.sin(x * 11);
  // the banks: earth pushed up, its top lit, its outer side dark
  if (Math.abs(d) >= half && Math.abs(d) < half + 0.06) {
    const k = (Math.abs(d) - half) / 0.06;
    if (hash(Math.floor(u * 36), Math.floor(v * 36), 558) < 0.18) return EARTH[0];
    return k < 0.35 ? EARTH[0] : k < 0.75 ? EARTH[3] : EARTH[2];
  }
  if (Math.abs(d) < half) {
    // bits of bone trailing in it
    for (let i = 0; i < 6; i++) {
      const bx = -0.42 + i * 0.16 + hash(i, 1, 559) * 0.06;
      const by = c + (hash(i, 2, 559) - 0.5) * 0.2;
      const a = hash(i, 3, 559) * Math.PI;
      const L = 0.025 + hash(i, 4, 559) * 0.025;
      const col = flatBone(x, y, [bx - Math.cos(a) * L, by - Math.sin(a) * L, bx + Math.cos(a) * L, by + Math.sin(a) * L, 0.016], WALL_BONE);
      if (col) return col;
    }
    // the gouges of its grip: deep, short, raggedly along it
    for (let i = 0; i < 5; i++) {
      const gx = -0.36 + i * 0.18 + hash(i, 5, 559) * 0.05;
      const gy = c + (hash(i, 6, 559) - 0.5) * 0.18;
      const sg = onSeg(x, y, gx, gy, gx + 0.09, gy + (hash(i, 7, 559) - 0.5) * 0.04);
      if (sg.d < 0.022 * (1 - Math.abs(sg.t - 0.5) * 0.8)) return DEEP;
      if (sg.d < 0.04 && sg.side > 0) return EARTH[3];
    }
    // the trough: smoothed, scored along
    if (hash(0, Math.floor((d + 0.2) * 60), 560) < 0.18) return EARTH[0];
    return d < -half + 0.04 ? EARTH[0] : EARTH[1];
  }
  return earthAt(u, v, 4);
}

/** SPILLED ORE: lumps of ore spilled in a fan across the floor's stones from a cart that went over: each a dark rough lump, lit on its upper left, a glint of metal on some, its shadow by it; grit about them. */
const ORE_LUMPS: ReadonlyArray<readonly [number, number, number]> = (() => {
  const out: [number, number, number][] = [];
  for (let i = 0; i < 22; i++) {
    const a = -1 + hash(i, 1, 561) * 2;
    const r = Math.sqrt(hash(i, 2, 561)) * 0.5;
    out.push([-0.26 + Math.cos(a) * r, -0.06 + Math.sin(a) * r * 0.75, 0.05 + 0.055 * hash(i, 3, 561) * (1 - r)]);
  }
  return out.sort((p, q) => p[0] + p[1] - (q[0] + q[1]));
})();
function spilledOre(u: number, v: number): string | null {
  const [x, y] = mid(u, v);
  for (let i = ORE_LUMPS.length - 1; i >= 0; i--) {
    const [cx, cy, r] = ORE_LUMPS[i];
    const dx = x - cx;
    const dy = y - cy;
    // (rough: its rim broken in facets)
    const rr = r * (1 + 0.15 * Math.sin(Math.atan2(dy, dx) * 4 + i));
    const d = Math.hypot(dx, dy * 1.1);
    if (d < rr) {
      const toL = dx + dy;
      if (d > rr * 0.82) return toL < 0 ? ORE[3] : ORE[0];
      if (i % 3 === 0 && Math.hypot(dx + rr * 0.3, dy + rr * 0.3) < rr * 0.2) return GLINT;
      return toL < -rr * 0.35 ? RAW[3] : toL > rr * 0.4 ? ORE[1] : ORE[2];
    }
  }
  // their shadows, to the lower right of each
  for (const [cx, cy, r] of ORE_LUMPS) if (Math.hypot(x - cx - r * 0.45, (y - cy - r * 0.45) * 1.1) < r) return SLAB[0];
  if (hash(Math.floor(u * 30), Math.floor(v * 30), 562) < 0.12 && Math.hypot(x + 0.1, y + 0.06) < 0.5) return ORE[1];
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
    // the oil spilled, a dull dark pool
    under.ellipse(cx + 2, cy + 3, 16, 5, '#141019');
    under.ellipse(cx, cy + 2, 10, 3, '#1c1722');
    // great curved shards of its belly, their outsides lit, their insides dark
    for (const [x0, y0, w, h, turn] of [[cx - 17, cy - 4, 10, 6, 1], [cx + 5, cy - 7, 9, 7, -1], [cx - 4, cy + 3, 8, 5, 1]] as const) {
      lit(p, CLAY, [1, 2], [1, 2], (l) => l.poly([[x0, y0 + h], [x0 + 2, y0], [x0 + w, y0 + 1], [x0 + w - 1, y0 + h - 1], [x0 + w / 2, y0 + h + 1]], INK));
      // (its inside showing where it curls up)
      for (let x = x0 + 2; x < x0 + w - 2; x++) p.set(x, turn > 0 ? y0 + 2 : y0 + h - 2, CLAY[1]);
    }
    // its neck, whole, the plug still in it, its handle
    lit(p, CLAY, [1, 2], [1, 2], (l) => l.rect(cx + 11, cy - 2, 5, 6, INK));
    p.rect(cx + 12, cy - 4, 3, 2, TIMBER[2]).set(cx + 12, cy - 4, TIMBER[3]);
    for (let a = -0.4; a < Math.PI * 0.9; a += 0.15) p.set(Math.round(cx + 17 + Math.sin(a) * 3), Math.round(cy + 1 - Math.cos(a) * 3), a < 1.2 ? CLAY[3] : CLAY[1]);
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

/** A BOOT of old leather, in depth: its sole on the floor at `at`, its toe out along `toe`, its shaft up `up` (leaning as it slumps), its top folded over. */
function boot(S: Scene, at: V3, toe: V3, up: V3, id: number): void {
  const T = norm(toe);
  const Sd = norm(cross([0, 0, 1], T));
  // the sole and heel, dark, under it
  S.egg(add(at, add(mul(T, 3.4), [0, 0, 0.7])), [T, Sd, [0, 0, 1]], [7.6, 2.8, 0.8], () => LEATHER[0], id);
  // the foot, out to its toe
  S.egg(add(at, add(mul(T, 4), [0, 0, 2.4])), [T, Sd, [0, 0, 1]], [6.2, 2.5, 2.1], (n) => toneAt(n, LEATHER), id);
  // the shaft, up from the heel
  const top = add(at, mul(norm(up), 10));
  S.rod(add(at, [0, 0, 2]), top, 2.6, 2.5, LEATHER, id);
  // its folded top: a cuff turned down, lit, its mouth dark
  S.egg(top, [norm(up), Sd, norm(cross(norm(up), Sd))], [1.2, 3, 3], (n) => toneAt(n, LEATHER, 0.25), id);
  S.egg(add(top, mul(norm(up), 0.9)), [norm(up), Sd, norm(cross(norm(up), Sd))], [0.4, 2, 2], () => DEEP, id);
}
/** A MINER'S BOOTS, empty, a pair: one standing as he stood, one slumped against it, their tops folded over. 44 x 40 at (22, 30). */
function emptyBoots(): Sprite {
  const S = new Scene(new Px(44, 40), 22, 30);
  boot(S, [-2, -7, 0], [-0.35, 1, 0], [0, 0, 1], 1);
  boot(S, [6, 1, 0], [-0.2, 1, 0], [0.25, -0.2, 1], 2);
  S.seams();
  return compose(null, [S.p], null).sprite(22, 30, GRAIN);
}

/** A RIB CAGE lying on its back: its ribs arching up from the spine and round, open at the breast; its skull rolled from it, face up to us; an arm bone by it. 60 x 44 at (30, 28). */
function ribCageLying(): Sprite {
  const S = new Scene(new Px(60, 44), 30, 28);
  const L = norm([1, 1, 0]);
  const Sd = norm(cross([0, 0, 1], L));
  const o: V3 = [-2, -2, 0];
  // the spine along the floor
  for (let k = -4; k <= 4; k++) S.ball(add(o, add(mul(L, k * 2.4), [0, 0, 1.2])), 1.2, BONE, 1);
  // the ribs: five pairs, each an arch up from the spine and over, open in the middle where the breast was
  for (let j = 0; j < 5; j++) {
    const along = -6.5 + j * 3.4;
    const R = 6.4 + 1.6 * Math.sin(((j + 0.5) / 5) * Math.PI);
    for (const s of [-1, 1]) {
      let prev: V3 | null = null;
      for (let t = 0; t <= 0.72; t += 0.06) {
        const th = t * Math.PI;
        const w = add(o, add(mul(L, along + 1.6 * Math.sin(th)), add(mul(Sd, s * R * 1.1 * Math.sin(th)), [0, 0, 1.2 + R * (1 - Math.cos(th)) * 0.5])));
        if (prev) S.rod(prev, w, 0.8, 0.75, BONE, 2 + j);
        prev = w;
      }
    }
  }
  // the skull rolled from it, face up to the eye
  skull(S, { c: [-14, -16, 4.2], F: [0.55, 0.65, 0.5], U: [-0.6, -0.6, 0.5], R: 4.3, jaw: null }, BONE, 10);
  longBone(S, [10, -6, 1.2], [18, 8, 1.2], 1.1, BONE, 11);
  S.seams();
  return compose(null, [S.p], null).sprite(30, 28, GRAIN);
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

/** DRILL STEELS: the miners' long iron drills, three of them, thick, lying together where they were dropped, each with its chisel bit flared at its end; the hand hammer that drove them by them, its head square. 64 x 40 at (32, 22). */
function drillSteels(): Sprite {
  const S = new Scene(new Px(64, 40), 32, 22);
  const rods: [V3, V3][] = [[[-22, -7, 1.3], [14, -13, 1.3]], [[-20, -1, 1.3], [17, -6, 1.3]], [[-15, 5, 1.3], [12, 2, 1.3]]];
  rods.forEach(([a, b], i) => {
    S.rod(a, b, 1.2, 1.1, SMALL_IRON, 1 + i);
    // its bit: flared, a chisel's edge across
    const d = norm(sub(b, a));
    const s = norm(cross([0, 0, 1], d));
    S.box(add(b, mul(d, 1)), [d, s, [0, 0, 1]], [1.2, 2, 1.1], (_f, _u, _v, n) => toneAt(n, SMALL_IRON, 0.1), 1 + i);
    // its striking end, battered
    S.ball(a, 1.5, IRONS, 1 + i);
  });
  // the hammer: a stout haft, a square head
  S.rod([-6, 15, 1.4], [8, 9, 1.4], 1.2, 1.1, TIMBER_DIM, 5);
  S.box([10, 8.2, 2.6], [norm([0.32, 0.95, 0]), norm([-0.95, 0.32, 0]), [0, 0, 1]], [4.6, 2.4, 2.6], (f, _u, _v, n) => (f === 4 ? SMALL_IRON[3] : toneAt(n, IRONS, 0.15)), 6);
  S.seams();
  return compose(null, [S.p], null).sprite(32, 22, GRAIN);
}

/** AN ARM FROM A HEAP: a low heap of the dead's bones, and an arm of bone reaching up out of it, thick, its hand splayed open and clawing. 56 x 64 at (28, 52). */
function armFromHeap(): Sprite {
  const S = new Scene(new Px(56, 64), 28, 52);
  S.egg([0, 0, 1], XYZ, [13, 11, 4.5], (n) => toneAt(n, EARTH_R), 1);
  longBone(S, [-12, -2, 4], [6, -6, 6], 1.2, BONE, 2);
  longBone(S, [-4, 8, 3.4], [10, 2, 5], 1.1, BONE, 3);
  longBone(S, [8, 8, 2.6], [-2, -10, 6.6], 1, BONE, 4);
  skull(S, { c: [-6, 6, 5.6], F: [0.7, 0.7, 0.3], U: [0, 0, 1], R: 4, jaw: null }, BONE, 5);
  // the arm: out of the heap's top, up and reaching, thick
  const sh: V3 = [2, -2, 4];
  const el: V3 = [-2, 2, 19];
  const wr: V3 = [4, 6, 31];
  longBone(S, sh, el, 1.9, BONE, 6);
  S.ball(el, 2.6, BONE, 7);
  S.rod(add(el, [0.9, -0.9, 0]), add(wr, [0.8, -0.8, 0]), 1.5, 1.3, BONE, 7);
  S.rod(add(el, [-0.9, 0.9, 0]), add(wr, [-0.8, 0.8, 0]), 1.3, 1.1, BONE, 7);
  boneHand(S, wr, sub(wr, el), norm([0.8, 0.8, -0.2]), 0.55, BONE, 8, 1.35);
  S.seams();
  return compose(null, [S.p], null).sprite(28, 52, GRAIN);
}

/** A CULTIST'S ROBE, empty: crumpled where its wearer went to nothing: its body in folds, a cord round its middle, its peaked hood fallen open at its head end, a sleeve flung out along its side (the other under it: never the shape of a cross); a black candle stub rolled from it. 64 x 40 at (32, 22). */
function emptyRobe(): Sprite {
  const W = 64;
  const H = 40;
  const cx = 32;
  const cy = 22;
  const p = new Px(W, H);
  const bits = new Px(W, H);
  lit(p, ROBE, [1, 3], [1, 3], (l) => {
    // its body: from its neck (to the left) fanning out to its hem (to the right)
    l.poly([[cx - 12, cy - 5], [cx + 4, cy - 8], [cx + 19, cy - 12], [cx + 24, cy - 4], [cx + 24, cy + 5], [cx + 19, cy + 11], [cx + 4, cy + 8], [cx - 12, cy + 4]], INK);
    // one sleeve, trailing off under it toward its hem (the other beneath it: never arms spread as a cross)
    l.poly([[cx - 9, cy + 3], [cx - 2, cy + 6], [cx + 8, cy + 12], [cx + 13, cy + 14], [cx + 10, cy + 17], [cx - 1, cy + 12], [cx - 10, cy + 7]], INK);
  });
  // its folds, fanned out from its neck to its hem
  for (const [x1, y1] of [[cx + 21, cy - 9], [cx + 23, cy - 1], [cx + 21, cy + 7]] as const) p.line(cx - 6, cy, x1, y1, ROBE[1]);
  // its hem, ragged and fanned
  for (let y = cy - 11; y <= cy + 10; y++) if (hash(y, 0, 574) < 0.55) p.set(cx + 24 - Math.round(Math.abs(y - cy) * 0.3), y, ROBE[0]);
  // the cord round its middle, its two ends trailing out, tasselled
  p.line(cx + 3, cy - 8, cx + 5, cy + 8, ROPE[2]).line(cx + 4, cy - 8, cx + 6, cy + 8, ROPE[3]);
  for (const [x1, y1] of [[cx + 9, cy + 14], [cx + 3, cy + 14]] as const) {
    p.line(cx + 5, cy + 8, x1, y1, ROPE[2]);
    p.rect(x1 - 1, y1, 3, 2, ROPE[3]).set(x1 - 1, y1 + 2, ROPE[1]).set(x1 + 1, y1 + 2, ROPE[1]);
  }
  // the hood at its neck: a round cowl fallen back, its dark opening turned up
  lit(bits, ROBE, [1, 2], [1, 2], (l) => l.ellipse(cx - 17, cy - 1, 6.5, 4.6, INK));
  bits.ellipse(cx - 16.5, cy - 1.5, 3.8, 2.6, DEEP);
  bits.set(cx - 20, cy - 3, ROBE[0]).set(cx - 13, cy + 1, ROBE[1]);
  // the candle stub, rolled clear
  bits.rect(cx + 14, cy + 15, 5, 2, WAX[3]).set(cx + 13, cy + 15, WAX[1]).set(cx + 19, cy + 15, INK);
  return compose(null, [p, bits], null).sprite(cx, cy, GRAIN);
}

/** A PIT PROP SNAPPED: a squared post of timber broken in two, lying along x, each half's end at the break split into long splinters, the two halves askew. 72 x 40 at (36, 22). */
function snappedProp(): Sprite {
  const S = new Scene(new Px(72, 40), 36, 22);
  /** Squared timber: each face one tone (its top lit, its near side in the middle, its end the grain's rings): never rounded. */
  const sq = (f: number, u: number, v: number): string => {
    if (f === 4) return Math.abs(((v * 3) % 1) - 0.5) < 0.1 ? TIMBER[2] : TIMBER[3];
    if (f < 2) return Math.abs(Math.hypot(u - 0.5, v - 0.5) - 0.25) < 0.08 ? TIMBER[0] : TIMBER[1];
    if (f === 5) return TIMBER[0];
    return Math.abs(((v * 3) % 1) - 0.5) < 0.1 ? TIMBER[0] : f === 2 ? TIMBER[2] : TIMBER[1];
  };
  const halves: [V3, V3, number][] = [[[-13, -3, 3], norm([1, 0.12, 0]), 11], [[14, 3, 3.2], norm([1, -0.3, 0.1]), 10]];
  halves.forEach(([c, d, half], k) => {
    const s = norm(cross([0, 0, 1], d));
    S.box(c, [d, s, norm(cross(d, s))], [half, 3, 3], sq, 1 + k);
    // its broken end: long splinters standing out from it, pointed
    const end = add(c, mul(d, k === 0 ? half : -half));
    const way = mul(d, k === 0 ? 1 : -1);
    for (let j = 0; j < 5; j++) {
      const o = add(end, add(mul(s, (j - 2) * 1.2), [0, 0, (j % 2 ? 1 : -1) * 1.2 + (j === 2 ? 1.4 : 0)]));
      const len = 3.4 + hash(j, k, 575) * 4.4;
      S.rod(o, add(o, add(mul(way, len), [0, 0, (hash(j, k, 576) - 0.5) * 1.6])), 0.95, 0.2, [TIMBER[1], TIMBER[2], TIMBER[3], TIMBER[3], TIMBER[3]], 10 + k * 5 + j);
    }
  });
  S.seams();
  return compose(null, [S.p], null).sprite(36, 22, GRAIN);
}
// =================================================================================================
// STANDING THINGS, built in the world; anchored at the middle of their tile

/** The axes of the world. */
const XYZ: [V3, V3, V3] = [[1, 0, 0], [0, 1, 0], [0, 0, 1]];

/**
 * THE MINE CART, as it stands or goes: a deep tub of iron plate, wider at its top than at its foot,
 * iron straps down its corners and two bands round it, riveted; four small solid wheels of iron under
 * it, flanged to keep the rails; heaped with ore, skulls among it, a long bone on top. `o` its middle
 * on the floor; `L`, `Wd`, `Up` its own axes as it is turned (along it, across it, up); `spin` how far
 * its wheels have turned; `upSpin` the wheels of its far side (left spinning when it is over); `load`
 * what is in it (each, from its own middle; null: gone); `wheels` which of its wheels are on it.
 */
export interface CartPose { o: V3; L: V3; Wd: V3; Up: V3; spin: number; upSpin: number; load: (V3 | null)[]; bone: boolean; wheels?: boolean[] }
/** The cart's measures: half its length and width at its foot and at its top, where its tub starts and ends up, its wheels (on the rails, under the tub). */
export const CART = { l0: 12, w0: 7, l1: 15, w1: 10.4, z0: 6.6, z1: 30, wheelL: 8.4, wheelW: 7.8, wheelR: 4.6, wheelZ: 4.6 };
/** What is heaped in it, from its middle (along, across, up), its size, and whether it is a skull (else ore). */
export const CART_LOAD: ReadonlyArray<readonly [number, number, number, number, 0 | 1]> = [
  [-10, -5, 28, 3.6, 0], [-3, -7, 28.4, 3.5, 0], [6, -6, 28, 3.8, 0], [11, -1, 28.6, 4, 1], [-11, 3, 28, 3.4, 0], [-4, 1, 30.6, 3.9, 0], [3, 0, 31.2, 3.6, 0], [10, 5, 28.2, 3.5, 0], [-1, 7, 29.6, 4.1, 1], [6, 6, 29.2, 3.2, 0], [0, -4, 32.6, 3.3, 0], [-7, -2, 32.2, 3.2, 0],
  [8, -3, 33.4, 4.2, 1], [-8, 5, 32.6, 4, 1], [1, 4, 35.6, 4.4, 1],
];
export const CART_STILL: CartPose = { o: [0, 0, 0], L: [1, 0, 0], Wd: [0, 1, 0], Up: [0, 0, 1], spin: 0, upSpin: 0, load: CART_LOAD.map(([a, b, c]) => [a, b, c]), bone: true };
/** How a skull of its load looks out: up and toward the eye. */
const CART_SKULL_F: V3 = norm([0.5, 0.85, 0.25]);
/** A point of the cart, from its own measures. */
export const cartPt = (k: CartPose, l: number, w: number, u: number): V3 => add(k.o, add(add(mul(k.L, l), mul(k.Wd, w)), mul(k.Up, u)));
function paintCart(S: Scene, k: CartPose, id0: number): void {
  const P = (l: number, w: number, u: number): V3 => cartPt(k, l, w, u);
  const { l0, w0, l1, w1, z0, z1 } = CART;
  // the corners of its tub: foot (b) and top (t)
  const b = (sl: number, sw: number): V3 => P(sl * l0, sw * w0, z0);
  const t = (sl: number, sw: number): V3 => P(sl * l1, sw * w1, z1);
  const mid_ = P(0, 0, (z0 + z1) / 2);
  /** A side of it: iron plate, a strap down each corner, two bands round it riveted, its rim lit; seen from inside, dark. */
  const side = (q: [V3, V3, V3, V3], id: number): void => {
    const n0 = norm(cross(sub(q[1], q[0]), sub(q[3], q[0])));
    const out = dot(n0, sub(q[0], mid_)) > 0 ? n0 : mul(n0, -1);
    const seenOut = dot(out, TOWARD) > 0;
    S.quad(q, (u, v) => {
      if (!seenOut) return v > 0.93 ? IRONS[3] : Math.abs(v - 0.24) < 0.06 || Math.abs(v - 0.72) < 0.06 ? IRONS[2] : toneAt(mul(out, -1), IRONS, -0.15);
      if (v > 0.93) return toneAt(out, IRONS, 0.45);
      if (u < 0.07 || u > 0.93) return toneAt(out, IRONS, u < 0.07 ? 0.3 : 0.15);
      for (const bv of [0.24, 0.72]) {
        if (Math.abs(v - bv) < 0.07) return Math.abs(((u * 4) % 1) - 0.5) < 0.06 ? SMALL_IRON[3] : toneAt(out, IRONS, 0.35);
      }
      return hash(Math.floor(u * 3), Math.floor(v * 2), 570) < 0.3 ? RUST[2] : toneAt(out, IRONS, -0.05);
    }, id);
  };
  // its floor, inside
  S.quad([b(-1, -1), b(1, -1), b(1, 1), b(-1, 1)], (u, v) => (Math.abs(((u * 5) % 1) - 0.5) < 0.06 ? IRONS[2] : hash(Math.floor(u * 7), Math.floor(v * 5), 571) < 0.25 ? ORE[2] : IRONS[1]), id0);
  side([b(-1, 1), b(1, 1), t(1, 1), t(-1, 1)], id0);
  side([b(1, -1), b(-1, -1), t(-1, -1), t(1, -1)], id0);
  side([b(1, 1), b(1, -1), t(1, -1), t(1, 1)], id0);
  side([b(-1, -1), b(-1, 1), t(-1, 1), t(-1, -1)], id0);
  // its underside, seen only as it goes over: plate, a strap across, rivets
  S.quad([b(-1, -1), b(-1, 1), b(1, 1), b(1, -1)], (u, v) => (dot(k.Up, TOWARD) < 0 ? (Math.abs(u - 0.5) < 0.07 || Math.abs(v - 0.5) < 0.06 ? IRONS[3] : Math.abs(((u * 6) % 1) - 0.5) < 0.05 && Math.abs(((v * 4) % 1) - 0.5) < 0.08 ? SMALL_IRON[3] : IRONS[1]) : null), id0);
  // its wheels and axles
  for (const sl of [-1, 1]) {
    const a0 = P(sl * CART.wheelL, -CART.wheelW, CART.wheelZ);
    const a1 = P(sl * CART.wheelL, CART.wheelW, CART.wheelZ);
    S.rod(a0, a1, 0.9, 0.9, IRONS, id0 + 1);
    for (const sw of [-1, 1]) {
      const which = (sl + 1) + (sw + 1) / 2;
      if (k.wheels && !k.wheels[which]) continue;
      const c = P(sl * CART.wheelL, sw * CART.wheelW, CART.wheelZ);
      const spin = sw < 0 ? k.upSpin : k.spin;
      wheel(S, c, mul(k.Wd, sw), k.L, k.Up, CART.wheelR, spin, id0 + 2 + which);
    }
  }
  // the load
  k.load.forEach((q, i) => {
    if (!q) return;
    const [, , , r, kind] = CART_LOAD[i];
    if (kind) skull(S, { c: P(q[0], q[1], q[2]), F: add(mul(k.L, CART_SKULL_F[0]), add(mul(k.Wd, CART_SKULL_F[1]), mul(k.Up, CART_SKULL_F[2]))), U: k.Up, R: r, jaw: null }, BONE, id0 + 10 + i);
    else S.ball(P(q[0], q[1], q[2]), r, ORE, id0 + 10 + i, undefined, 0.1);
  });
  if (k.bone) longBone(S, P(-11, 1, 34), P(10, -5, 35.4), 1.2, BONE, id0 + 30);
}
/** A WHEEL of iron, small and solid: its disc, its rim lit on its upper side, its hub, four bolts round it turned `spin` (so that it is seen to turn), and its flange behind it, wider; `face` the way its outer side looks, `A` and `B` across it. */
export function wheel(S: Scene, c: V3, face: V3, A: V3, B: V3, R: number, spin: number, id: number, pale = false): void {
  const IR: Ramp = pale ? SMALL_IRON : IRONS;
  const F = norm(face);
  const Au = norm(sub(A, mul(F, dot(A, F))));
  const Bu = norm(cross(F, Au));
  // the flange behind it, a little wider, dark
  S.egg(sub(c, mul(F, 0.9)), [F, Au, Bu], [0.5, R + 0.7, R + 0.7], () => IRONS[0], id);
  // the wheel: a solid disc, its rim's tread lit on its upper side, its hub, four bolts turned with it
  S.egg(c, [F, Au, Bu], [0.75, R, R], (n, w) => {
    const q = sub(w, c);
    const a = dot(q, Au);
    const b = dot(q, Bu);
    const r = Math.hypot(a, b);
    const up = dot(norm(add(mul(Au, a), mul(Bu, b))), [0, 0, 1]);
    if (Math.abs(dot(n, F)) < 0.55) return up > 0.2 ? IR[3] : IR[1];
    if (r > R - 1) return up > 0 ? IR[3] : IR[2];
    if (r < 1.1) return SMALL_IRON[3];
    const ang = Math.atan2(b, a);
    for (let j = 0; j < 4; j++) {
      const t = spin + (j * Math.PI) / 2;
      if (Math.hypot(Math.cos(t) * R * 0.55 - a, Math.sin(t) * R * 0.55 - b) < 0.8) return SMALL_IRON[2];
    }
    return toneAt(n, IR, 0.1 + 0 * ang - (pale ? 0.25 : 0));
  }, id);
}
function mineCart(): Sprite {
  const S = new Scene(new Px(84, 80), 42, 56);
  paintCart(S, CART_STILL, 1);
  S.seams();
  return compose(null, [S.p], null).sprite(42, 56, GRAIN);
}

/** Where the rails' end's beam is struck, from its middle along x. */
const BUFFER = { face: 2.2 };
/**
 * THE RAILS' END: two stout posts driven in either side of the rails, a crossbeam between them at the
 * rails' own height, iron-faced where the carts strike it, the rails' ends curled up against it, earth
 * heaped behind (nothing like a chest's lid: the second fresh look read the block as one). Along x: the
 * cart comes at it from -x. `shake` its jump as it is struck; `split` how far its beam has split apart
 * and its posts leaned out (0 whole).
 */
export function paintStop(S: Scene, o: V3, shake: number, id: number, split = 0): void {
  const at = (v: V3): V3 => add(o, v);
  // earth heaped behind it
  S.egg(at([14, 0, -2]), XYZ, [7, 14, 6.5], (n, w) => (hash(Math.floor(w[0] / 2), Math.floor(w[1] / 2) + Math.floor(w[2] / 2) * 9, 576) < 0.12 ? EARTH[3] : toneAt(n, EARTH_R, 0.1)), id);
  // the rails' ends, curled up
  for (const y of [-7.6, 7.6]) {
    let prev = at([-18, y, 0.9]);
    S.rod(prev, at([-2, y, 0.9]), 0.8, 0.8, SMALL_IRON, id + 4);
    prev = at([-2, y, 0.9]);
    for (let t = 0.125; t <= 1.0001; t += 0.125) {
      const a = (t * Math.PI) / 2;
      const q = at([-2 + 4.6 * Math.sin(a), y, 0.9 + 4.6 * (1 - Math.cos(a))]);
      S.rod(prev, q, 0.8, 0.8, SMALL_IRON, id + 4);
      prev = q;
    }
  }
  // the posts, leaning out as the beam splits
  for (const s of [-1, 1]) {
    const lean = 0.35 * split * s;
    const up = norm([0.25 * split, Math.sin(lean), Math.cos(lean)]);
    const along = norm(cross([0, 1, 0], up));
    S.box(add(at([6.5 + shake * 0.2, s * 12.5, 0]), mul(up, 7.5)), [along, norm(cross(up, along)), up], [2.4, 2.4, 7.5], timberFace, id + 1);
  }
  // the crossbeam, at the rails' height, iron-faced; split, its two halves thrown back
  const face = (f: number, u: number, v: number, n: V3): string => {
    if (f === 1 && v > 0.15 && v < 0.85) return Math.abs(((u * 6) % 1) - 0.5) < 0.06 ? SMALL_IRON[3] : toneAt(n, IRONS, 0.3);
    if (f === 4) return Math.abs(((v * 3) % 1) - 0.5) < 0.08 ? TIMBER[2] : TIMBER[3];
    if (f === 2 || f === 3) return Math.abs(Math.hypot(u - 0.5, v - 0.5) - 0.28) < 0.07 ? TIMBER[0] : TIMBER[1];
    return Math.abs(((u * 7) % 1) - 0.5) < 0.05 ? TIMBER[0] : toneAt(n, TIMBER_DIM, -0.1);
  };
  if (split <= 0) S.box(at([BUFFER.face + 2.4 + shake * 0.3, 0, 6.4 + Math.max(0, shake) * 0.3]), XYZ, [2.4, 13.6, 2.6], face, id + 2);
  else {
    for (const s of [-1, 1]) {
      const turn = norm([1, s * 0.5 * split, 0.3 * split]);
      S.box(at([BUFFER.face + 2.4 + split * 4, s * (6.8 + split * 3), 6.4 + split * 1.5]), [turn, norm(cross([0, 0, 1], turn)), [0, 0, 1]], [2.4, 6.4, 2.6], face, id + 2 + (s > 0 ? 5 : 0));
    }
  }
}
function railsEnd(): Sprite {
  const S = new Scene(new Px(80, 56), 40, 36);
  paintStop(S, [0, 0, 0], 0, 1);
  S.seams();
  return compose(null, [S.p], null).sprite(40, 36, GRAIN);
}
/**
 * THE WINDLASS OVER THE SHAFT, low, as a miner works one: a square shaft dropping into the dark, a
 * collar of timber round its mouth; either side of it a stout post on its sill, and between them, waist
 * high, the drum, its rope wound round it in slanting bands; a crank on its end, an iron arm and a
 * wooden grip; the rope down from the drum to the bucket hanging over the shaft, heaped with ore.
 * (Low and broad: never the tall frame of a gallows.) 96 x 84 at (48, 56).
 */
function windlass(): Sprite {
  const W = 96;
  const H = 84;
  const S = new Scene(new Px(W, H), 48, 56);
  // the shaft: its mouth dark, its collar
  S.quad([[-12, -12, 0.2], [12, -12, 0.2], [12, 12, 0.2], [-12, 12, 0.2]], () => DEEP, 1);
  for (const [c, r] of [[[0, -13, 1.2], [14, 2, 1.2]], [[0, 13, 1.2], [14, 2, 1.2]], [[-13, 0, 1.2], [2, 11, 1.2]], [[13, 0, 1.2], [2, 11, 1.2]]] as [V3, V3][]) S.box(c, XYZ, r, timberFace, 2);
  // the posts on their sills, either side
  for (const x of [-18, 18]) {
    S.box([x, 0, 1.2], XYZ, [3.4, 9, 1.2], timberFace, 3);
    S.box([x, 0, 12.5], XYZ, [2.2, 2.6, 10.5], timberFace, 3);
  }
  // the drum between them, the rope wound on it in slanting bands, its ends bare wood
  const DZ = 19;
  for (let xx = -15.5; xx <= 15.5; xx += 0.4) {
    for (let a = 0; a < Math.PI * 2; a += 0.1) {
      const coil = Math.abs(xx) < 11;
      const r = coil ? 4.6 : 3.6;
      const p: V3 = [xx, Math.cos(a) * r, DZ + Math.sin(a) * r];
      const n: V3 = [0, Math.cos(a), Math.sin(a)];
      if (dot(n, TOWARD) < -0.2) continue;
      const band = (((xx * 0.3 + a / (Math.PI * 2)) % 1) + 1) % 1;
      const c = coil ? (band < 0.1 ? ROPE[1] : band < 0.3 ? toneAt(n, ROPE, 0.25) : toneAt(n, ROPE)) : toneAt(n, TIMBER_DIM, -0.1);
      const [px, py] = S.at(p);
      S.put(Math.round(px), Math.round(py), dot(p, TOWARD), c, 4, p[2]);
    }
  }
  // the axle out through the right post, the crank: an iron arm down from it, a wooden grip out
  S.rod([15, 0, DZ], [23.5, 0, DZ], 0.9, 0.9, IRONS, 5);
  S.rod([23.5, 0, DZ], [23.5, 2, DZ - 7.5], 0.9, 0.9, IRONS, 5);
  S.rod([23.5, 2, DZ - 7.5], [29, 2, DZ - 7.5], 1.2, 1.2, TIMBER_DIM, 5);
  // the rope down from the drum to the bucket over the shaft
  S.rod([1, 4.4, DZ - 1], [1, 4, 11.5], 0.7, 0.7, ROPE, 6);
  // the bucket: staves, two iron hoops, its bail, ore heaped in it
  const bc: V3 = [1, 4, 6];
  for (let z = 2; z <= 10; z += 0.4) {
    const r = 3.9 - (10 - z) * 0.08;
    for (let a = 0; a < Math.PI * 2; a += 0.1) {
      const p: V3 = [bc[0] + Math.cos(a) * r, bc[1] + Math.sin(a) * r, z];
      const n: V3 = [Math.cos(a), Math.sin(a), 0];
      const hoopRow = Math.abs(z - 3.6) < 0.5 || Math.abs(z - 8.6) < 0.5;
      const [px, py] = S.at(p);
      S.put(Math.round(px), Math.round(py), dot(p, TOWARD), hoopRow ? toneAt(n, IRONS, 0.2) : Math.abs(((a * 8 / Math.PI) % 1) - 0.5) < 0.08 ? TIMBER[0] : toneAt(n, TIMBER_DIM, -0.1), 7, z);
    }
  }
  for (const [x, y, z, r] of [[-1, 3, 10.4, 1.8], [2.2, 5, 10.6, 1.7], [0.6, 4, 11.6, 1.6]] as const) S.ball([x + 1, y, z], r, ORE, 7, undefined, 0.1);
  for (let a = 0.2; a < Math.PI - 0.2; a += 0.08) {
    const p: V3 = [bc[0] + Math.cos(a) * 4.1, bc[1], 10 + Math.sin(a) * 2.6];
    const [px, py] = S.at(p);
    S.put(Math.round(px), Math.round(py), dot(p, TOWARD) + 1, IRONS[3], 7, p[2]);
  }
  S.seams();
  return compose(null, [S.p], null).sprite(48, 56, GRAIN);
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
        skull(S, { c: [x, y, z], F: norm(add(mul([Math.cos(look), Math.sin(look), 0.05], 0.75), mul(TOWARD as V3, 0.35))), U: [0, 0, 1], R: R - (n === 1 ? 0 : 0.2), jaw: null }, BIG_BONE, id++);
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
  out.push({ kind: 'skull', a: [28, 23, 3.6], b: [0, 0, 0], r: 4.2, F: norm([0.5, 0.8, 0.35]), U: [0, 0, 1] });
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
/** The skull of the heap the pink kindles in: at its front, to the right (clear of the arm as it reaches for the hero). */
export const HEAP_EYES = HEAP_BITS.findIndex((b) => b.kind === 'skull' && b.a[0] === 19 && b.a[1] === 15);
/** Paint the heap: its mound (`h` high) and its dead, each moved by `move(i, bit)` (null: as it lies). */
function paintHeap(S: Scene, h: number, bits: readonly (HeapBit | null)[], burn: number, id0: number): void {
  // the mound: the earth packed with the dead, dark, a few pale ends showing in it
  const mass = (n: V3, w: V3): string => {
    const g = hash(Math.floor(w[0] / 2.2), Math.floor(w[1] / 2.2) + Math.floor(w[2] / 2.2) * 7, 572);
    if (g < 0.16) return toneAt(n, WALL_BONE, 0.1);
    if (g < 0.22) return EARTH[0];
    return toneAt(n, HEAP_EARTH, 0.05);
  };
  const k = Math.max(0.05, h / HEAP.h);
  S.egg([0, 0, 0], XYZ, [HEAP.rx, HEAP.ry, Math.max(0.5, h)], mass, id0);
  for (const [x, y, r, z] of [[-10, -8, 9, 0.75], [9, -9, 8, 0.6], [-12, 8, 8, 0.6], [6, 8, 9, 0.7], [-2, 0, 10, 1.05]] as const) S.egg([x, y, 0], XYZ, [r * 1.1, r, Math.max(0.5, h * z)], mass, id0);
  bits.forEach((b, i) => {
    if (!b) return;
    if (b.kind === 'bone') longBone(S, b.a, b.b, b.r, BIG_BONE, id0 + 1 + i);
    else if (b.kind === 'skull') skull(S, { c: b.a, F: b.F, U: b.U, R: b.r, jaw: null, burn: i === HEAP_EYES ? burn : 0, big: i === HEAP_EYES ? 1 + 0.5 * Math.min(1, burn * 1.5) : 1 }, BIG_BONE, id0 + 1 + i);
    else ribCage(S, b.a, b.U, b.F, b.r, BIG_BONE, id0 + 1 + i);
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

/**
 * THE CULT'S ALTAR: a great block of rough stone, its top laid with a cloth of the cult's dark wine
 * that hangs down its front, ragged at its hem; on it, in the middle, a skull looking out, and black
 * candles burning in a cluster at each end, of every height, their wax pooled and run down the cloth.
 * (No bones by the skull: nothing that could be read as a skull over crossed bones.) Frame `f` of
 * four. 72 x 72 at (36, 54).
 */
function cultAltar(f: number): Sprite {
  const W = 72;
  const H = 72;
  const S = new Scene(new Px(W, H), 36, 54);
  let id = 1;
  // the block
  S.box([0, 0, 8], XYZ, [17, 9.5, 8], (fc, u, v, n) => (fc === 4 ? (hash(Math.floor(u * 9), Math.floor(v * 5), 573) < 0.25 ? ALTAR_STONE[2] : ALTAR_STONE[3]) : hash(Math.floor(u * 10), Math.floor(v * 6) + fc * 9, 577) < 0.12 ? ALTAR_STONE[1] : toneAt(n, ALTAR_STONE, 0.1)), id++);
  // the cloth over its top, and down its front to a ragged hem
  S.quad([[-12, -9.6, 16.15], [12, -9.6, 16.15], [12, 9.6, 16.15], [-12, 9.6, 16.15]], (u) => (Math.abs(((u * 5) % 1) - 0.5) < 0.05 ? ROBE[2] : ROBE[3]), id);
  S.quad([[-12, 9.65, 16.15], [12, 9.65, 16.15], [12, 9.65, 3], [-12, 9.65, 3]], (u, v) => {
    const hem = 0.82 + 0.1 * Math.sin(u * 23) + (hash(Math.floor(u * 14), 0, 578) - 0.5) * 0.12;
    if (v > hem) return null;
    return Math.abs(((u * 6) % 1) - 0.5) < 0.07 ? ROBE[1] : v < 0.06 ? ROBE[3] : ROBE[2];
  }, id++);
  // the skull in the middle, looking out
  skull(S, { c: [0, 1, 20.4], F: [0.45, 1, 0.1], U: [0, 0, 1], R: 4.3, jaw: 0.08 }, BONE, id++);
  // the candles, a cluster at each end, and their wax
  const tops: [number, number][] = [];
  for (const [x, y, h] of [[-13, -3, 10], [-10, 2, 7], [-14.5, 4, 4.5], [10.5, -2.5, 8.5], [13.5, 2.5, 5.5]] as const) {
    S.rod([x, y, 16.3], [x, y, 16.3 + h], 1.35, 1.35, WAX, id);
    S.egg([x, y, 16.5], XYZ, [2.8, 2.6, 0.7], () => WAX[2], id++);
    const [px, py] = S.at([x, y, 16.3 + h]);
    tops.push([px, py]);
  }
  // wax run down the cloth's front, straight down
  for (const x of [-13, 11]) S.rod([x, 9.9, 16], [x, 9.9, 11.5], 0.65, 0.55, WAX, id++);
  S.seams();
  const fire = new Px(W, H);
  tops.forEach(([x, y], i) => flame(fire, Math.round(x), Math.round(y) - 1, 4 + ((f + i) % 2), 1.2, [0, 1, 0, -1][(f + i) % 4]));
  const s = compose(null, [S.p], fire).sprite(36, 54, GRAIN);
  s.lights = [{ x: 36 / GRAIN, y: (tops[1][1] - 2) / GRAIN, r: 15 + (f % 2), color: EMBER[2], a: 0.45 }];
  return s;
}
/** The altar's stone: rough, dark, a little lighter than the floor's rock so it reads as a block. */
const ALTAR_STONE: Ramp = ['#100e22', '#1a1830', '#2a2744', '#3a3656', '#46426a'];
/** THE BOULDER: a great rough rock fallen from the roof, dark, all broken facets and edges, a crack across it; under it the pit prop it broke, its two ends sticking out. 80 x 72 at (40, 52). */
const DARK_ROCK: Ramp = ['#0e0c1e', '#18162c', '#26233e', '#363252', '#444064'];
function boulder(): Sprite {
  const S = new Scene(new Px(80, 72), 40, 52);
  // the prop under it, snapped
  S.box([-14, 14, 2.4], [norm([1, -0.4, 0]), norm([0.4, 1, 0]), [0, 0, 1]], [9, 2.4, 2.4], (f, _u, _v, n) => (f === 1 ? TIMBER[3] : toneAt(n, TIMBER_DIM, -0.1)), 1);
  S.box([16, -10, 3], [norm([0.6, 1, 0.3]), norm([-1, 0.6, 0]), norm([-0.3, 0, 1])], [7, 2.4, 2.4], (f, _u, _v, n) => (f === 0 ? TIMBER[3] : toneAt(n, TIMBER_DIM, -0.1)), 2);
  // the rock: lumps of it, each all facets, rough, overlapping
  const facet = facetOf(DARK_ROCK, 0.02);
  for (const [c, r, turn] of [[[0, 0, 8], [21, 16, 13], 0.3], [[-6, -3, 18], [13, 12, 10], -0.4], [[9, 5, 9], [10, 8, 9], 0.8], [[-12, 6, 6], [8, 7, 6], 1.3], [[4, -8, 15], [9, 7, 8], 2]] as [V3, V3, number][]) {
    S.egg(c, [norm([Math.cos(turn), Math.sin(turn), 0.1]), norm([-Math.sin(turn), Math.cos(turn), 0]), norm([-0.1 * Math.cos(turn), 0, 1])], r, facet, 3);
  }
  S.seams();
  // a crack across it
  let [x, y] = S.at([-12, 10, 16]);
  for (let k = 0; k < 16; k++) {
    if (S.p.get(Math.round(x), Math.round(y))) S.p.set(Math.round(x), Math.round(y), DARK_ROCK[0]);
    x += 1;
    y += hash(k, 0, 579) < 0.45 ? -1 : 0;
  }
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
    const n = kind === 'skull' ? 7 : 14;
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2 + (kind === 'end' ? (z % 2) * 0.2 : 0.2);
      const out: V3 = [Math.cos(a), Math.sin(a), 0];
      if (dot(out, TOWARD) < -0.3) continue;
      if (kind === 'skull') skull(S, { c: [out[0] * (R + 1.2), out[1] * (R + 1.2), z], F: norm(add(mul(out, 0.55), mul(TOWARD as V3, 0.6))), U: [0, 0, 1], R: 4.2, jaw: null }, BIG_BONE, id++);
      else {
        const e: V3 = [out[0] * (R + 0.8), out[1] * (R + 0.8), z];
        const sd: V3 = [-out[1], out[0], 0];
        S.ball(add(e, mul(sd, 0.9)), 1.7, BIG_BONE, id);
        S.ball(add(e, mul(sd, -0.9)), 1.6, BIG_BONE, id++);
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

/**
 * THE RELIQUARY (the game's chest): a small casket of old dark wood under a peaked lid, iron bound at
 * its corners and along its ridge, a hasp on its front; opened, its lid thrown back, and in it what the
 * ossuary's keepers kept: a skull and the bones of a hand. No gold, nothing that glows. 56 x 56 at (28, 42).
 */
const CASKET_WOOD: Ramp = ['#1a1220', '#2a1c2c', '#433142', '#5b4556', '#6b5364'];
function reliquary(open: boolean): Sprite {
  const S = new Scene(new Px(56, 56), 28, 42);
  const hx = 9;
  const hy = 6;
  const hz = 5.5;
  const wood = (f: number, u: number, v: number, n: V3): string => {
    if ((f === 0 || f === 1) ? (u < 0.1 || u > 0.9) : (u < 0.07 || u > 0.93)) return toneAt(n, SMALL_IRON, -0.1);
    if (f === 2 && Math.abs(u - 0.5) < 0.08 && v > 0.55 && v < 0.9) return SMALL_IRON[2];
    if (f === 4) return open ? IRONS[0] : CASKET_WOOD[3];
    return Math.abs(((v * 3) % 1) - 0.5) < 0.06 ? CASKET_WOOD[0] : toneAt(n, CASKET_WOOD);
  };
  S.box([0, 0, hz + 1], XYZ, [hx, hy, hz], wood, 1);
  // its feet
  for (const [x, y] of [[-7.5, -4.5], [7.5, -4.5], [-7.5, 4.5], [7.5, 4.5]] as const) S.box([x, y, 0.5], XYZ, [1, 1, 0.5], () => IRONS[1], 1);
  const top = 2 * hz + 1;
  /** The lid: two slopes up to a ridge, its gable ends; turned back about its back eave by `turn`. */
  const lid = (turn: number): void => {
    const pivot: V3 = [0, -hy - 0.4, top];
    const T = (p: V3): V3 => add(pivot, rot(sub(p, pivot), [1, 0, 0], -turn));
    const ridge = 8.5;
    const slope = (s: number): [V3, V3, V3, V3] => [T([-hx - 0.6, s * (hy + 0.6), top]), T([hx + 0.6, s * (hy + 0.6), top]), T([hx + 0.6, 0, top + ridge]), T([-hx - 0.6, 0, top + ridge])];
    for (const s of [-1, 1]) {
      S.quad(slope(s), (u, v) => (u < 0.06 || u > 0.94 || v > 0.88 ? SMALL_IRON[2] : Math.abs(((u * 4) % 1) - 0.5) < 0.05 ? CASKET_WOOD[1] : s > 0 ? CASKET_WOOD[3] : CASKET_WOOD[2]), 2);
    }
    for (const e of [-1, 1]) S.quad([T([e * (hx + 0.6), -hy - 0.6, top]), T([e * (hx + 0.6), hy + 0.6, top]), T([e * (hx + 0.6), 0.01, top + ridge]), T([e * (hx + 0.6), -0.01, top + ridge])], () => CASKET_WOOD[2], 2);
  };
  if (!open) lid(0);
  else {
    lid(1.9);
    // in it: a skull, and the bones of a hand
    skull(S, { c: [-2.5, 0.5, top - 0.6], F: [0.4, 1, 0.5], U: [0, -0.4, 1], R: 3.6, jaw: null }, BONE, 3);
    for (let k = 0; k < 3; k++) S.rod([3 + k * 1.6, -3, top - 0.4], [4.5 + k * 1.4, 2.5, top - 0.2], 0.6, 0.5, BONE, 4);
  }
  S.seams();
  return compose(null, [S.p], null).sprite(28, 42, GRAIN);
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

/** A skull, face on, as a mark carved in relief: (x, y) from its middle, in half its height (y up): its bone, the dark of its sockets, nose and teeth, or nothing. */
function skullMarkAt(x: number, y: number): 'bone' | 'dark' | null {
  const cran = Math.hypot(x / 0.72, (y - 0.18) / 0.7) <= 1;
  const face = Math.abs(x) < 0.46 - Math.max(0, -0.55 - y) * 0.5 && y < -0.1 && y > -0.95;
  if (!cran && !face) return null;
  for (const e of [-0.3, 0.3]) if (Math.hypot((x - e) / 0.21, (y + 0.04) / 0.22) <= 1) return 'dark';
  if (y < -0.28 && y > -0.5 && Math.abs(x) < 0.1 * ((y + 0.5) / 0.22) + 0.02) return 'dark';
  if (y < -0.62 && y > -0.86 && Math.abs(x) < 0.38 && Math.abs(((x + 0.38) / 0.19) % 1 - 0.5) > 0.38) return 'dark';
  if (Math.abs(y + 0.6) < 0.035 && Math.abs(x) < 0.36) return 'dark';
  return 'bone';
}
/** THE MARK OVER THIS FLOOR'S GATES (art/gates.ts, a Mark): a skull, face on, carved in relief in a roundel on the keystone, big enough to read as one (the first fresh look found three small ones a ball); in stone, giving off no light. */
const skullsMark: Mark = (x, y, st, _lit, lightLow) => {
  const d = Math.hypot(x, y);
  if (d > 12.4) return null;
  const toLight = y - (lightLow ? x : -x);
  if (d > 11.4) return st.joint;
  if (d > 9.4) return toLight > 5 ? st.light : toLight < -6 ? st.dark : st.body;
  const k = skullMarkAt(x / 8.6, y / 8.6);
  if (k === 'dark') return st.joint;
  // (raised out of the field and lit: its edge away from the light in shade)
  if (k === 'bone') return skullMarkAt((x - (lightLow ? -1 : 1)) / 8.6, (y - 1) / 8.6) === 'bone' ? st.light : st.body;
  return st.dark;
};
/** OVER ITS OWN GATE: the maw cut in the stone, roaring open, its three fangs in stone, the fire inside it burning pink, hottest deep in its throat (the enemy's, as the game's boss gate has the Warden's; pink only, never orange). */
const mawMark: Mark = (x, y, st, lit_, lightLow) => {
  const d = Math.hypot(x, y);
  if (d > 12.4) return null;
  const toLight = y - (lightLow ? x : -x);
  if (d > 11.4) return st.joint;
  if (d > 9.4) return toLight > 5 ? st.light : toLight < -6 ? st.dark : st.body;
  // (smaller than the roundel, so that its square-cut corners show in the stone: a mouth, never an eye)
  const m = mawAt(x / 7.8, (y + 0.6) / 7.8);
  // (its fire hottest low in it, as from its throat below: never in rings, which would make it an eye)
  if (m === 'in' || m === 'throat') return y < -1.5 ? (lit_ ? PINK[3] : PINK[2]) : lit_ ? PINK[2] : PINK[1];
  if (m === 'fang') return st.light;
  if (m === 'lip') return st.joint;
  return st.dark;
};
let gates: GateArt | null = null;
/** THIS FLOOR'S DOORS AND GATES, as the game's (art/gates.ts): its stone, a skull carved over its gates, the maw over its boss's, its doors the miners' rough planks. */
export function ossuaryGates(): GateArt {
  return gates ?? (gates = makeGateArt(THEME, { gateMark: skullsMark, bossMark: mawMark, leaf: leafOf }));
}

// =================================================================================================
// QUESTS

/** THE ELDEST SKULL: the first of the dead the amalgamation gathered, found where it burst apart: a great old skull, twice a man's, cracked across, the fire gone out of it (no glint of gold on it: gold's glow is the enemy's). 48 x 44 at (24, 36). */
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
  return compose(null, [S.p], null).sprite(24, 36, GRAIN);
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
  'bone-lined niche': [[4, -2], [-1, 9], [-3, 17]],
  "the miners' breach": [[0, 0]],
  'shored rock': [[0, 0], [-1, 0], [1, 0]],
  "the dead's arm": [[12, 5], [2, 11], [0, 18]],
  'seam of ore': [[2, -4], [0, 7], [-2, 27]],
  'the charnel layer': [[1, 0], [0, 8], [0, 23]],
  "miner's lantern": [[5, -10], [2, 2], [-6, 10]],
  'pick in the wall': [[2, -11], [-1, -3], [-7, 12]],
  "the cult's candle": [[7, -19], [-6, 3], [0, 10]],
  'garland of skulls': [[2, -13], [2, 0], [0, 19]],
  "the miners' ladder": [[0, 0], [-7, 0], [6, 0]],
  "the miners' tools": [[-2, -8], [-2, -1], [-2, 6]],
  "the cult's daub": [[1, -14], [0, 4], [-1, 15]],
  'ribs on a spike': [[11, -9], [1, 1], [-1, 8]],
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
    wall("miner's lantern", 'on the wall', (f) => minersLantern(f), 4, lanternLight),
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
    { name: 'empty boots', kind: 'on the floor', frames: [emptyBoots()], shadow: 0.2 },
    { name: 'rib cage', kind: 'on the floor', frames: [ribCageLying()], shadow: 0.3 },
    { name: 'broken ladder', kind: 'on the floor', frames: [brokenLadder()] },
    { name: 'drill steels', kind: 'on the floor', frames: [drillSteels()] },
    { name: 'arm from a heap', kind: 'on the floor', frames: [armFromHeap()], shadow: 0.36 },
    { name: "a cultist's robe", kind: 'on the floor', frames: [emptyRobe()] },
    { name: 'snapped prop', kind: 'on the floor', frames: [snappedProp()] },
    // obstacles
    { name: 'the mine cart', kind: 'obstacle', frames: [mineCart()], shadow: 0.4 },
    { name: "the rails' end", kind: 'obstacle', frames: [railsEnd()], shadow: 0.4 },
    { name: 'the windlass', kind: 'obstacle', frames: [windlass()], shadow: 0.5 },
    { name: 'pyramid of skulls', kind: 'obstacle', frames: [skullPyramid()], shadow: 0.46 },
    { name: 'the charnel heap', kind: 'obstacle', frames: [charnelHeap()], shadow: 0.7 },
    { name: 'timber crib', kind: 'obstacle', frames: [timberCrib()], shadow: 0.56 },
    { name: "the cult's altar", kind: 'obstacle', frames: [0, 1, 2, 3].map(cultAltar), shadow: 0.42 },
    { name: 'the boulder', kind: 'obstacle', frames: [boulder()], shadow: 0.62 },
    { name: 'the bone column', kind: 'obstacle', frames: [boneColumn()], shadow: 0.42 },
    { name: 'the reliquary', kind: 'obstacle', frames: [reliquary(false), reliquary(true)], shadow: 0.26 },
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

const clamp01 = (t: number): number => Math.max(0, Math.min(1, t));
/** Eased from 0 to 1 as `t` goes from 0 to 1. */
const ease = (t: number): number => {
  const k = clamp01(t);
  return k * k * (3 - 2 * k);
};

// -------------------------------------------------------------------------------------------------
// DUST, as the first fresh look asked for it everywhere: few clouds, and big; each grows out of where
// it was struck over its first three frames; shaded, its top lit and its belly dark; blown out fast,
// then hanging and drifting; then SETTLING, sinking onto the floor and flattening into a low sheet
// that shrinks away as one, so that it is seen to go (never wearing away into specks). Painted in depth
// with what it is among, so that it hides only what is behind it.

/** The dust's tones: its belly to its lit top (the floor's own dust, a little lighter so that it shows). */
const DUST: Ramp = ['#221f31', '#302c42', '#423d57', '#55506c', '#686282'];
/** Dust settled on the floor: dark, as the floor's own. */
const DUST_LOW: Ramp = ['#191624', '#211d2e', '#2a2639', '#332e44', '#3b3550'];
interface Cloud { f0: number; p: V3; v: V3; R: number; hang: number; settle: number; life: number; seed: number }
/** A cloud born on frame `f0` at `p` (in the world), blown out `v` a frame at first, `R` at its biggest; it hangs `hang` frames, settles over `settle`, and is gone `life` frames after it was born. */
function cloud(f0: number, p: V3, v: V3, R: number, seed: number, life = 44, hang = 9, settle = 12): Cloud {
  return { f0, p, v, R, hang, settle, life, seed };
}
/** Where a cloud is on frame `f`: its middle, how far it reaches across and up (null: not there; gone on the frame `life` after it was born, its last frame `life - 1`). */
function cloudAt(c: Cloud, f: number): { c: V3; rh: number; rv: number; s: number } | null {
  const k = f - c.f0;
  if (k < 0 || k >= c.life) return null;
  // (grown out of where it was struck over three frames)
  const grow = Math.min(1, 0.36 + 0.32 * k);
  // (blown out fast, then hanging, drifting on a little and up)
  const go = (1 - 0.7 ** k) / (1 - 0.7);
  const hk = Math.min(k, c.hang);
  let p = add(c.p, add(mul(c.v, go), [c.v[0] * 0.05 * hk, c.v[1] * 0.05 * hk, 0.3 * hk]));
  let rh = c.R * grow * (1 + 0.012 * hk);
  let rv = c.R * 0.78 * grow;
  // (settling: sinking onto the floor and flattening)
  const s = ease((k - c.hang) / c.settle);
  p = [p[0], p[1], p[2] + (c.R * 0.08 - p[2]) * s];
  rv += (c.R * 0.15 - rv) * s;
  rh *= 1 + 0.35 * s;
  // (then shrinking away as one)
  const q = clamp01((k - c.hang - c.settle) / Math.max(1, c.life - 1 - c.hang - c.settle));
  rh *= Math.sqrt(1 - q);
  if (rh < 1.2) return null;
  return { c: p, rh, rv: Math.max(rv, 0.9), s };
}
/** The clouds on frame `f`, painted into `S` in depth (soft: no seam round them). `W` the frame they are in. */
function paintClouds(S: Scene, cs: readonly Cloud[], f: number, W: (a: number, b: number, z: number) => V3 = (a, b, z) => [a, b, z]): void {
  cs.forEach((c, i) => {
    const a = cloudAt(c, f);
    if (!a) return;
    // (a cloud: its middle, and smaller lobes on it up and to either side)
    const lobes: ReadonlyArray<readonly [number, number, number, number]> = [[0, 0, 0, 0.9], [0.55 + 0.2 * hash(c.seed, 1, 640), -0.25, 0.35, 0.62], [-0.5, 0.3 + 0.2 * hash(c.seed, 2, 640), 0.3, 0.58], [0.1, -0.1, 0.85, 0.55], [-0.2, -0.45, 0.6, 0.48], [0.35, 0.5, 0.15, 0.5]];
    for (const [dx, dy, dz, k] of lobes) {
      const w = W(a.c[0] + dx * a.rh, a.c[1] + dy * a.rh, a.c[2] + dz * a.rv);
      // (settling, it darkens into the floor's own dust, broken in tone: never a pale puddle)
      S.egg(w, XYZ, [a.rh * k, a.rh * k, a.rv * k], (n, q) => {
        const t = toneAt(n, a.s > 0.4 ? DUST_LOW : DUST, 0.05);
        return a.s > 0.4 && hash(Math.floor(q[0] / 2), Math.floor(q[1] / 2), 641) < 0.35 ? DUST_LOW[1] : t;
      }, SOFT + i);
    }
  });
}

// -------------------------------------------------------------------------------------------------
// LOOSE THINGS: skulls, bones, lumps of ore, splinters: falling, tumbling, striking and bouncing,
// rolling and sliding (down any slope they come to rest on), knocking into one another, at rest.

/** How fast things fall, in the world's picture pixels a frame, each frame (fast: things fall fast and hit hard). */
const FALL = 1.0;
/** A thing loose in a moment: where its middle is, how fast it goes, which way it is turned (a skull's face and crown; a bone's length), how it turns. In whatever frame the moment keeps (a wall's: along, out, up). */
interface Body {
  kind: 'skull' | 'bone' | 'ore' | 'splinter';
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
/** A new loose thing at `p`, at rest and not yet let go. */
/** Long things (bones, splinters) lie along the ground; the rest are round. */
const isLong = (b: Body): boolean => b.kind === 'bone' || b.kind === 'splinter';
const body = (kind: Body['kind'], p: V3, r: number, len = 0, F: V3 = [1, 0, 0], U: V3 = [0, 0, 1]): Body => ({ kind, p, v: [0, 0, 0], F, U, axis: [0, 0, 1], spin: 0, r, len, free: false, ground: false, still: false, hits: 0, struck: [] });
/** A skull's (or a lump's) reach from its middle, as it lies. */
const skullReach = (b: Body): number => (b.kind === 'ore' ? 0.95 : 0.9) * b.r;
/** How low a bone reaches below its middle. */
const boneLow = (b: Body): number => Math.abs(b.F[2]) * b.len * 0.5 + b.r * (b.kind === 'splinter' ? 0.6 : 0.9);

/**
 * ONE FRAME OF THE LOOSE THINGS: each falls and tumbles; strikes the ground (`groundAt`: how high it is
 * where it is) and bounces if it strikes hard; rolls or slides, down any slope it is on, and comes to
 * rest; a round one strikes those about it and is turned aside. Nothing goes back into the wall (b < 0
 * is the wall, `wallTop` how high it stands), nor through the ground.
 */
function stepBodies(bodies: Body[], f: number, wallTop: number, rolling = 0.93, groundAt: (a: number, b: number) => number = () => 0, fence: (a: number, b: number) => boolean = () => true): void {
  for (const b of bodies) {
    if (!b.free) continue;
    const low = (): number => (!isLong(b) ? skullReach(b) : boneLow(b));
    if (b.still) {
      // (what lies still rides up on what is heaped under it)
      const g = groundAt(b.p[0], b.p[1]);
      if (b.p[2] - low() < g) b.p = [b.p[0], b.p[1], g + low()];
      continue;
    }
    b.v = [b.v[0], b.v[1], b.v[2] - FALL];
    b.p = add(b.p, b.v);
    if (b.spin) {
      b.F = norm(rot(b.F, b.axis, b.spin));
      if (!isLong(b)) b.U = norm(rot(b.U, b.axis, b.spin));
    }
    const g = groundAt(b.p[0], b.p[1]);
    if (b.ground && b.p[2] - low() > g + 0.6) b.ground = false;
    // the wall
    const back = !isLong(b) ? skullReach(b) : b.r + Math.abs(b.F[1]) * b.len * 0.5;
    if (b.p[1] < back && b.p[2] < wallTop) {
      b.p = [b.p[0], back, b.p[2]];
      if (b.v[1] < 0) b.v = [b.v[0], -b.v[1] * 0.3, b.v[2]];
    }
    // the ground
    if (b.p[2] - low() <= g) {
      b.p = [b.p[0], b.p[1], g + low()];
      const hard = b.v[2] < -2.2;
      if (b.v[2] < -0.5) b.struck.push({ f, vz: b.v[2] });
      b.hits++;
      if (hard) {
        b.v = [b.v[0] * 0.78, b.v[1] * 0.78, -b.v[2] * (isLong(b) ? 0.36 : 0.46)];
        b.spin *= 0.7;
      } else {
        b.v = [b.v[0], b.v[1], 0];
        b.ground = true;
      }
      if (isLong(b)) {
        // (a bone comes down along the ground: never left standing on its end)
        b.F = norm([b.F[0], b.F[1], b.F[2] * (b.hits > 1 ? 0 : 0.3)]);
        b.axis = [0, 0, 1];
        b.spin *= 0.5;
        b.p = [b.p[0], b.p[1], g + low()];
      }
    }
    if (b.ground) {
      // (down the slope it lies on)
      const gx = (groundAt(b.p[0] + 1, b.p[1]) - groundAt(b.p[0] - 1, b.p[1])) / 2;
      const gy = (groundAt(b.p[0], b.p[1] + 1) - groundAt(b.p[0], b.p[1] - 1)) / 2;
      const steep = Math.hypot(gx, gy);
      const pull = isLong(b) ? 0.35 : 0.6;
      b.v = [b.v[0] - gx * pull, b.v[1] - gy * pull, 0];
      b.p = [b.p[0], b.p[1], groundAt(b.p[0], b.p[1]) + low()];
      // (past its fence, it is brought up short: nothing rolls on off the floor it fell on)
      if (!fence(b.p[0], b.p[1])) b.v = [b.v[0] * 0.5, b.v[1] * 0.5, 0];
      const sp = Math.hypot(b.v[0], b.v[1]);
      if (!isLong(b)) {
        const k = sp < 0.6 ? 0.8 : rolling;
        b.v = [b.v[0] * k, b.v[1] * k, 0];
        if (sp > 0.05) {
          b.axis = norm(cross([0, 0, 1], [b.v[0], b.v[1], 0]));
          b.spin = sp / b.r;
        } else b.spin = 0;
        // (slowing, a skull rocks over onto its base, its face to the room)
        if (sp < 0.5 && b.rest && steep < 0.3) {
          b.spin = 0;
          b.F = norm(add(mul(b.F, 0.6), mul(b.rest, 0.4)));
          b.U = norm(add(mul(b.U, 0.6), mul([0, 0, 1], 0.4)));
          if (dot(b.F, b.rest) < 0.98 || b.U[2] < 0.98) continue;
          b.F = norm(b.rest);
          b.U = norm(sub([0, 0, 1], mul(b.F, b.F[2])));
        }
      } else {
        b.v = [b.v[0] * 0.76, b.v[1] * 0.76, 0];
        b.spin *= 0.7;
      }
      if (Math.hypot(b.v[0], b.v[1]) < (steep < 0.35 ? 0.3 : 0.02) && Math.abs(b.spin) < 0.1 && steep < 0.45) {
        b.still = true;
        b.v = [0, 0, 0];
        b.spin = 0;
      }
    }
  }
  // round against round: pushed apart, turned aside; one come down on another rolls off it
  const sk = bodies.filter((b) => !isLong(b) && b.free);
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
      if (vn < 0) A.v = sub(A.v, mul(n, vn * 1.3));
      if (n[2] > 0.3) {
        A.ground = false;
        const h = norm([n[0] + 0.01, n[1], 0]);
        A.v = add(A.v, mul(h, 0.4));
      }
      if (B.still && vn < -0.6) B.still = false;
    }
  }
}
/** Let a body go: its speed, and a tumble about a way of its own. */
function letGo(b: Body, v: V3, seed: number, spin: number): void {
  b.free = true;
  b.v = v;
  b.axis = norm([hash(seed, 5, 650) - 0.5, hash(seed, 6, 650) - 0.5, (hash(seed, 7, 650) - 0.5) * 0.6]);
  b.spin = spin * (0.6 + 0.8 * hash(seed, 8, 650));
}
/** Paint a loose body into `S` in the frame `W` (the world's own if none), in `ramp`. */
function paintBody(S: Scene, b: Body, ramp: Ramp, id: number, W: (a: number, b: number, z: number) => V3 = (a, bb, z) => [a, bb, z], keep?: (w: V3) => boolean): void {
  const toW = (v: V3): V3 => sub(W(v[0], v[1], v[2]), W(0, 0, 0));
  if (b.kind === 'skull') skull(S, { c: W(b.p[0], b.p[1], b.p[2]), F: toW(b.F), U: toW(b.U), R: b.r, jaw: null }, ramp, id, keep);
  else if (b.kind === 'ore') S.ball(W(b.p[0], b.p[1], b.p[2]), b.r, ORE, id, keep, 0.1);
  else if (b.kind === 'splinter') S.rod(W(...sub(b.p, mul(b.F, b.len / 2))), W(...add(b.p, mul(b.F, b.len / 2))), b.r, b.r * 0.3, TIMBER_DIM, id, keep);
  else {
    const tip = sub(b.p, mul(b.F, b.len / 2));
    knuckleBone(S, W(tip[0], tip[1], tip[2]), toW(b.F), b.len, b.r, ramp, id, keep);
  }
}
/** Where a point of a frame `W` is on the picture, from the anchor. */
const onScreen = (W: (a: number, b: number, z: number) => V3, p: V3): [number, number] => {
  const w = W(p[0], p[1], p[2]);
  return onPic(w[0], w[1], w[2]);
};
/** A track's place for a body, from its place now and on the frame before. */
function trackAt(W: (a: number, b: number, z: number) => V3, p: V3, q: V3, base: number): { x: number; y: number; shown: number; size: number } {
  const [x, y] = onScreen(W, p);
  const [px, py] = onScreen(W, q);
  return { x, y, shown: 1, size: base + 2 * Math.hypot(x - px, y - py) };
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
function boneHand(S: Scene, wr: V3, along: V3, n: V3, curl: number, ramp: Ramp, id: number, size = 1): void {
  const A = norm(along);
  const N = norm(sub(n, mul(A, dot(n, A))));
  const Sd = cross(A, N);
  const palm = add(wr, mul(A, 3 * size));
  S.egg(palm, [A, N, Sd], [3.6 * size, 1.4 * size, 3.3 * size], (nn) => toneAt(nn, ramp), id);
  for (let k = 0; k < 5; k++) {
    const thumb = k === 0;
    const off = (k - 2.2) * 1.5;
    let p = add(add(wr, mul(A, (thumb ? 2 : 5.8) * size)), mul(Sd, (thumb ? -3.8 : off) * size));
    // (each finger out along the hand, fanned; then bent in at each joint toward the palm by `curl`)
    let dir = norm(add(add(mul(A, thumb ? 0.6 : 1), mul(Sd, thumb ? -0.8 : off * 0.14)), mul(N, 0.05)));
    const segs = thumb ? [3, 2.6] : [3.4, 2.6, 2.2];
    for (const len of segs) {
      dir = norm(add(mul(dir, Math.cos(curl * 0.62)), mul(N, Math.sin(curl * 0.62))));
      const q = add(p, mul(dir, len * size));
      S.rod(p, q, 0.8 * size, 0.62 * size, ramp, id);
      S.ball(q, 0.78 * size, ramp, id);
      p = q;
    }
  }
}

// -------------------------------------------------------------------------------------------------

/**
 * THE SKULL WALL SPILLS. A stretch of the skull wall (the piece, `before`), the dead stacked in it as
 * they were laid, a weight of them behind. It creaks: its courses bow out, the whole height of it
 * bulging, shuddering harder and harder, dust spurting from its joints; skulls pop loose from the bulge
 * and fall. Then it gives (the first jolt): the foot of its middle bursts out, an avalanche of skulls
 * and long bones thrown out across the floor, arcing, tumbling, bouncing and rolling; the top of the
 * middle drops after it in one block and breaks on the heap (the second jolt) into skulls bouncing and
 * rolling every way; then its two sides give (the third jolt), slumping out, their tops dropping and
 * breaking in turn (the fourth). What came down heaps against the wall in a deep cone and runs out over
 * the floor four tiles and more toward the hero, every skull come to rest with its face to the room;
 * where the wall was, a great ragged cavity, the dead packed in it further in (`after`). The dust:
 * a few great clouds, blown along the wall's foot from each blow, hanging, settling as sheets and gone.
 * For a face turned to screen-left (`alongX`) or to screen-right; anchored at the foot of the face under
 * the middle of its tile, as a wall piece is.
 */
function skullWallSpills(alongX: boolean): { frames: Sprite[]; before: Sprite[]; after: Sprite[]; tracks: Track[]; jolts: number[] } {
  const MW = 392;
  const MH = 292;
  // (the spill goes out toward the eye: down the screen and to the left, or to the right)
  const ax = alongX ? 296 : 96;
  const ay = 132;
  const W0 = faceWorld(alongX);
  const toW = dirOf(W0);
  const BULGE0 = 1;
  const POPS = [14, 20, 25];
  const BURST = 32;
  const DROP = 36;
  const BREAK = 43;
  const SIDES = 50;
  const SIDE_DROP = 54;
  const SIDE_BREAK = 61;
  const N = 168;
  /** Where on the wall each part gives: its middle, or its sides; its foot first, then its top as a block. */
  const segOf = (a: number): 0 | 1 => (Math.abs(a) < 6.5 ? 0 : 1);
  const FOOT = 31;
  /** What stays: the dead further in, and a few at its ragged rim and in its dark top. */
  const stays = (s: WallBit, i: number): boolean => s.back || (Math.abs(s.a) > 13.2 && hash(i, 1, 660) < 0.55) || (s.z > 70 && hash(i, 2, 660) < 0.7);
  /** How far the wall bows out at (a, z) as it bulges: most at its middle, the whole of its height. */
  const prof = (a: number, z: number): number => Math.max(0, 1 - (a / 21) ** 2 - ((z - 36) / 50) ** 2);
  // THE LOOSE ONES
  interface Loose { i: number; go: number; drop: number; brk: number; body: Body; pop: boolean }
  const loose: Loose[] = [];
  const popPick = SKULL_WALL.map((s, i) => i).filter((i) => SKULL_WALL[i].kind === 'skull' && !SKULL_WALL[i].back && Math.abs(SKULL_WALL[i].a) < 9 && SKULL_WALL[i].z > 25 && SKULL_WALL[i].z < 66).slice(0, POPS.length);
  SKULL_WALL.forEach((s, i) => {
    if (stays(s, i)) return;
    const pop = popPick.indexOf(i);
    const seg = segOf(s.a);
    const foot = s.z < FOOT + (seg ? 4 : 0);
    let go: number;
    let drop = -1;
    let brk = -1;
    if (pop >= 0) go = POPS[pop];
    else if (seg === 0) {
      if (foot) go = BURST + Math.round(Math.hypot(s.a / 6.5, (s.z - 12) / 20) * 2);
      else {
        drop = DROP;
        brk = BREAK;
        go = BREAK;
      }
    } else if (foot) go = SIDES + Math.round(hash(i, 3, 660) * 3);
    else {
      drop = SIDE_DROP + (s.a < 0 ? 0 : 2);
      brk = SIDE_BREAK + (s.a < 0 ? 0 : 2);
      go = brk;
    }
    let b: Body;
    if (s.kind === 'skull') {
      const q = wallSkullPose(s, alongX);
      b = body('skull', q.c, s.r, 0, q.F, q.U);
    } else {
      const q = wallBonePose(s);
      b = body('bone', add(q.e, mul(q.d, q.len / 2)), s.r, q.len, q.d);
    }
    loose.push({ i, go, drop, brk, body: b, pop: pop >= 0 });
  });
  /** The bulge's offset of a bit still in the wall, frame `f`: out, and its shudder, harder and harder; after the burst, what is left of it leaning out further. */
  const bulge = (s: WallBit, i: number, f: number): V3 => {
    if (f < BULGE0) return [0, 0, 0];
    const t = clamp01((f - BULGE0) / (BURST - BULGE0));
    const k = prof(s.a, s.z) * (s.back ? 0.25 : 1);
    const lean = f > BURST ? clamp01((f - BURST) / 14) * 3 * (segOf(s.a) ? 1 : 0.4) : 0;
    const amp = (0.2 + 1.5 * t * t) * k * (f > SIDE_DROP + 3 ? 0.2 : 1);
    const j = (q: number): number => (hash(i * 7 + f, q, 661) - 0.5) * 2;
    return [j(1) * amp, (13 * t ** 1.3 + lean) * k + Math.max(0, j(2)) * amp * 0.5, j(3) * amp * 0.7 - 3.4 * t * t * k];
  };
  /** A block as it drops: down, faster every frame, leaning out. */
  const fallOf = (L: Loose, f: number): V3 => {
    const t = Math.max(0, f - L.drop);
    return [0, 0.5 * t, -0.5 * FALL * t * t];
  };
  // THE CONE: what comes down heaps against the wall's foot, deep, running out over the floor
  const CONE = { a: 30, b: 74, h: 21 };
  const coneG = (f: number): number => 0.62 * ease((f - BURST) / 22) + 0.38 * ease((f - SIDES) / 22);
  const coneR = (f: number): [number, number, number] => {
    const g = coneG(f);
    return [CONE.a * (0.45 + 0.55 * g), CONE.b * (0.35 + 0.65 * g), CONE.h * g];
  };
  const groundAt = (f: number) => (a: number, b: number): number => {
    const [ra, rb, h] = coneR(f);
    if (h <= 0) return 0;
    return h * Math.sqrt(Math.max(0, 1 - (a / ra) ** 2 - (Math.max(0, b) / rb) ** 2)) ** 1.4;
  };
  // THE HEAP's own dead: skulls and bones packed on the cone, rising with it out of it as it grows
  const PILE: Body[] = [];
  for (let k = 0; k < 30; k++) {
    const t = Math.sqrt((k + 0.5) / 30);
    const ang = k * 2.4;
    const a = Math.cos(ang) * t * CONE.a * 0.85;
    const b = Math.abs(Math.sin(ang)) * t * CONE.b * 0.75 + 3;
    if (k % 3 === 2) {
      const d = hash(k, 1, 664) * Math.PI;
      PILE.push(body('bone', [a, b, 0], 1.4, 13 + hash(k, 2, 664) * 5, [Math.cos(d), Math.sin(d), 0]));
    } else {
      const t2 = (hash(k, 3, 664) - 0.5) * 1.4;
      PILE.push({ ...body('skull', [a, b, 0], 4 + hash(k, 4, 664) * 0.5, 0, norm([Math.sin(t2) + (alongX ? 0.4 : -0.4), Math.cos(t2), 0.3]), [0, 0, 1]) });
    }
  }
  /** Where a bit of the heap's own is, frame `f`: in the cone, rising out of it as it grows over it. */
  const pileAt = (q: Body, f: number): V3 => {
    const sH = groundAt(f)(q.p[0], q.p[1]);
    const reach = q.kind === 'bone' ? q.r : q.r * 0.9;
    return [q.p[0], q.p[1], sH - reach * 1.25 + Math.min(sH, reach * 1.6)];
  };
  // the run, frame by frame
  const bodies = loose.map((L) => copyBody(L.body));
  const states: Body[][] = [];
  for (let f = 0; f < N; f++) {
    loose.forEach((L, k) => {
      const b = bodies[k];
      if (b.free || f < L.go) return;
      const s = SKULL_WALL[L.i];
      const r = (q: number): number => hash(L.i, q, 662) - 0.5;
      const at = L.drop >= 0 ? add(add(L.body.p, bulge(s, L.i, L.drop - 1)), fallOf(L, f - 1)) : add(L.body.p, bulge(s, L.i, f - 1));
      b.p = at;
      let v: V3;
      if (L.pop) v = [r(1) * 1.2, 2.4 + r(2), 1.8 + r(3)];
      else if (L.drop >= 0) {
        // (the block breaks as it strikes the heap: thrown every way, mostly out)
        v = [s.a * 0.14 + r(1) * 3.4, 4.5 + 4.5 * (r(2) + 0.5), 2 + 2.5 * (r(3) + 0.5)];
      } else if (f < SIDES) {
        // (the burst: hardest at its middle, out and up)
        const w = 1 - clamp01(Math.hypot(s.a / 6.5, (s.z - 12) / 20));
        v = [s.a * 0.12 + r(1) * 2.6, 6 + 5 * w + r(2) * 2, 2.8 + 3 * w + r(3) * 1.4];
      } else v = [s.a * 0.14 + r(1) * 1.6, 3.2 + r(2) * 1.4, 1.4 + r(3) * 1.2];
      letGo(b, v, L.i, b.kind === 'skull' ? 0.22 : 0.34);
      if (b.kind === 'skull') b.rest = norm([(alongX ? 0.45 : -0.45) + r(9) * 1.1, 1, 0.12]);
    });
    if (f > 0) stepBodies(bodies, f, TALL, 0.955, groundAt(f), (a, b) => b < 132 && Math.abs(a) < 96);
    states.push(bodies.map((b, k) => {
      if (b.free) return copyBody(b);
      const L = loose[k];
      const s = SKULL_WALL[L.i];
      const o = L.drop >= 0 && f >= L.drop ? add(bulge(s, L.i, L.drop - 1), fallOf(L, f)) : bulge(s, L.i, f);
      return { ...copyBody(b), p: add(L.body.p, o) };
    }));
  }
  const last = states[N - 1];
  if (last.some((b) => !b.still)) throw new Error(`the skull wall (${alongX ? 'left' : 'right'}): something is still moving at the end: ` + last.filter((b) => !b.still).map((b) => `${b.kind} ${b.p.map((q) => q.toFixed(1))} v ${b.v.map((q) => q.toFixed(2))}`).join('; '));

  // THE DUST: spurting from the joints as it bulges; from each hole a skull pops from; blown along the wall's foot at each blow, low; a little where a skull first strikes hard
  const clouds: Cloud[] = [];
  const at = (a: number, b: number, z: number): V3 => [a, b, z];
  for (const [f0, a, z] of [[7, -6, 44], [11, 7, 24], [16, -9, 30], [21, 4, 54], [27, -2, 18]] as const) clouds.push(cloud(f0, at(a, 2, z), [a * 0.03, 1.1, 0.2], 3.4, f0, 30, 6, 8));
  POPS.forEach((f0, k) => {
    const s = SKULL_WALL[popPick[k]];
    if (s) clouds.push(cloud(f0, at(s.a, 2, s.z), [0, 1, 0], 3, 50 + k, 30, 6, 8));
  });
  for (const [f0, sgn, R, z, seed] of [[BURST, -1, 11, 7, 61], [BURST + 1, 1, 10, 9, 62], [BREAK, -1, 9, 10, 63], [BREAK, 1, 8.5, 12, 64], [SIDES, -1, 8.5, 8, 65], [SIDES + 1, 1, 8.5, 8, 66], [SIDE_BREAK, -1, 8, 10, 67], [SIDE_BREAK + 2, 1, 8, 10, 68]] as const) {
    clouds.push(cloud(f0, at(sgn * 8, 5, z), [sgn * 3.2, 1.1, 0.5], R, seed, N - 1 - f0 - (seed % 3) * 2, 14, 16));
  }
  // (and a plume over its top as each top drops)
  for (const [f0, a, seed] of [[DROP + 1, 0, 70], [SIDE_DROP + 1, -10, 71], [SIDE_DROP + 3, 10, 72]] as const) clouds.push(cloud(f0, at(a, 2, 74), [a * 0.04, 0.6, 0.9], 7, seed, N - 1 - f0 - 4, 16, 20));
  bodies.forEach((b, k) => {
    if (b.kind !== 'skull') return;
    const st = b.struck.find((q) => q.vz < -3.4);
    if (st && st.f < N - 40) clouds.push(cloud(st.f, [states[st.f][k].p[0], states[st.f][k].p[1], 1], [0, 0.4, 0.2], 3, 200 + k, 30, 5, 8));
  });

  const looseOf = new Map(loose.map((L, k) => [L.i, k]));
  const tracks: Track[] = loose.map((L) => ({ name: `${SKULL_WALL[L.i].kind === 'skull' ? 'skull' : 'bone'} ${L.i}`, at: [] }));
  const keepWall = inFront(alongX);
  const paint = (f: number): Sprite => {
    const S = new Scene(new Px(MW, MH), ax, ay);
    // the cone heaped against the wall: the dust and grit of the fall, packed, bits of bone in it
    const [ra, rb, h] = coneR(f);
    if (h > 0.6) {
      const [A, B, U] = axesOf(W0);
      S.egg(W0(0, 0, 0), [A, B, U], [ra, rb, h], (n, w) => {
        const g = hash(Math.floor(w[0] / 3), Math.floor(w[1] / 3) + Math.floor(w[2] / 3) * 13, 663);
        return g < 0.14 ? EARTH[0] : toneAt(n, HEAP_EARTH, -0.05);
      }, 900, keepWall);
      PILE.forEach((q, k) => {
        const p = pileAt(q, f);
        if (p[2] < -q.r) return;
        paintBody(S, { ...q, p }, HEAP_BONE, 910 + k, W0, keepWall);
      });
    }
    SKULL_WALL.forEach((s, i) => {
      const k = looseOf.get(i);
      // (the dead further in, once the face in front of them is gone: deep in the dark of the cavity)
      const deep = s.back && Math.abs(s.a) < 13 ? ease((f - (Math.abs(s.a) < 6.5 ? BURST : SIDES)) / 8) : 0;
      const ramp = s.back ? (deep > 0 ? blend(dimBone, CAVITY, deep) : dimBone) : WALL_BONE;
      if (k === undefined) {
        // (still in the wall: as in the piece, bulging and shuddering with it)
        const o = bulge(s, i, f);
        const Wb = (a: number, bb: number, z: number): V3 => W0(a + o[0], bb + o[1], z + o[2]);
        inFaceLight(alongX, 1, () => {
          if (s.kind === 'skull') {
            const q = wallSkullPose(s, alongX);
            skull(S, { c: Wb(q.c[0], q.c[1], q.c[2]), F: toW(q.F), U: toW(q.U), R: s.r, jaw: null }, ramp, 1000 + i, s.back ? undefined : keepWall);
          } else boneEnd(S, Wb, s, ramp, 1000 + i, s.back ? undefined : keepWall);
        });
        return;
      }
      const b = states[f][k];
      // (in the face's light while in the wall; the room's once out on the floor, and as bright as what lies in it)
      const inWall = clamp01(1 - (b.p[1] - 5) / 14);
      const keep = !b.free && f < (loose[k].drop >= 0 ? loose[k].drop : Infinity) ? keepWall : (w: V3): boolean => (alongX ? w[1] : w[0]) >= -9;
      inFaceLight(alongX, inWall, () => {
        const rampNow = blend(ramp, BONE, 1 - inWall);
        if (!b.free) {
          if (s.kind === 'skull') skull(S, { c: W0(b.p[0], b.p[1], b.p[2]), F: toW(b.F), U: toW(b.U), R: b.r, jaw: null }, rampNow, 1000 + i, keep);
          else {
            const q = wallBonePose(s);
            const o = sub(b.p, add(q.e, mul(q.d, q.len / 2)));
            boneEnd(S, (a, bb, z) => W0(a + o[0], bb + o[1], z + o[2]), s, rampNow, 1000 + i, keep);
          }
        } else paintBody(S, b, rampNow, 1000 + i, W0, keep);
      });
      tracks[k].at.push(trackAt(W0, b.p, f > 0 ? states[f - 1][k].p : b.p, b.kind === 'skull' ? 10 : 12));
    });
    paintClouds(S, clouds, f, W0);
    // (nothing of the wall out past its tile's face while it is in it, as the piece)
    for (let i = 0; i < S.id.length; i++) {
      const id = S.id[i];
      if (id < 1000 || id >= SOFT) continue;
      const k = looseOf.get(id - 1000);
      const out = k !== undefined && (states[f][k].free || (loose[k].drop >= 0 && f >= loose[k].drop));
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
    // the wall's own dark between the dead
    const g = flat();
    skullWallGaps(g);
    const base = new Px(MW, MH);
    base.blit(onFacePx(g, alongX), ax - PCX, ay - PFOOT);
    return compose(base, [S.p], null).sprite(ax, ay, GRAIN);
  };
  const frames: Sprite[] = [];
  for (let f = 0; f < N; f++) frames.push(paint(f));
  return { frames, before: [wallSprite(skullWall, alongX, 0, 0)], after: [frames[N - 1]], tracks, jolts: [BURST, BREAK, SIDES, SIDE_BREAK] };
}

// -------------------------------------------------------------------------------------------------

/** Where the rails' end stands from the cart's tile, along x (six tiles on), and where its buffer's face is. */
const STOP_X = 6 * KT;
const STOP_FACE = STOP_X + BUFFER.face;
/** The points of the cart that may touch the floor: its tub's corners, its wheels' rims. */
function cartPoints(k: CartPose): V3[] {
  const out: V3[] = [];
  for (const sl of [-1, 1]) for (const sw of [-1, 1]) {
    out.push(cartPt(k, sl * CART.l0, sw * CART.w0, CART.z0), cartPt(k, sl * CART.l1, sw * CART.w1, CART.z1));
    for (let a = 0; a < Math.PI * 2; a += Math.PI / 6) out.push(cartPt(k, sl * CART.wheelL + Math.cos(a) * CART.wheelR, sw * CART.wheelW, CART.wheelZ + Math.sin(a) * CART.wheelR));
  }
  return out;
}

/**
 * THE CART RUNS. A mine cart stands on its rails, heaped with ore and the dead (`before`), the rails
 * running on six tiles to their end, past the hero. It creaks: it rocks and shivers on its wheels, rust
 * flaking off it; it lurches, and starts to roll by itself, slow, then faster and faster, bucking and
 * clattering over every joint of the rails, sparks streaking from its wheels, a skull and a lump of
 * its load bounced off on the way; it strikes the buffer at the rails' end at full tilt (the first
 * jolt): the buffer splits and splinters fly, sparks spray; the cart pitches over it nose first, its
 * load flung on ahead, and goes right over through the air, wheels up, and lands on its back with a
 * crash (the second jolt) and a bounce; a wheel breaks off it and rolls away across the floor in a
 * wobbling curve, slower and slower, until it tips and falls flat, rattling; its load sprays on three
 * and four tiles, skulls among the ore, bouncing and rolling to rest; its last wheels spin on in the
 * air to the end. Anchored at the middle of the cart's tile; the rails run on from it along x to the
 * rails' end (the main chat lays them).
 */
function cartRuns(): Moment {
  const MW = 600;
  const MH = 352;
  const ax = 76;
  const ay = 116;
  const CREAK = 22;
  const ROLL = 44;
  const HIT = CREAK + ROLL;
  const TL = 16;
  const LAND = HIT + TL;
  const N = 190;
  const XHIT = STOP_FACE - CART.l1 - 0.5;
  const acc = (2 * XHIT) / (ROLL * ROLL);
  const vHit = acc * ROLL;
  const xAt = (f: number): number => {
    if (f < CREAK) return f >= 10 && f <= 13 ? [0, -1, -0.6, 0.5][f - 10] : 0;
    const t = Math.min(f - CREAK, ROLL);
    return 0.5 * acc * t * t;
  };
  /** The frames its front wheels cross a joint of the rails (every tile). */
  const joints: number[] = [];
  for (let f = CREAK + 1; f < HIT; f++) if (Math.floor((xAt(f) + CART.wheelL) / KT) > Math.floor((xAt(f - 1) + CART.wheelL) / KT)) joints.push(f);
  /** Its shiver as it creaks, and its buck at each joint: a hop, its nose up then down, a sway. */
  const jig = (f: number): { dz: number; pitch: number; roll: number } => {
    if (f < CREAK) {
      const k = f / CREAK;
      return { dz: Math.max(0, Math.sin(f * 1.7)) * 2.4 * k, pitch: 0.16 * Math.sin(f * 1.9) * k, roll: 0.12 * Math.sin(f * 1.3 + 1) * k };
    }
    let dz = 0;
    let pitch = 0;
    let roll = 0;
    joints.forEach((fj, n) => {
      const t = f - fj;
      if (t < 0 || t > 5) return;
      const e = [1, 0.8, 0.4, -0.25, -0.1, 0][t];
      dz += 2.6 * Math.max(0, e);
      pitch += 0.09 * e * (n % 2 ? -1 : 1);
      roll += 0.06 * e * (n % 2 ? 1 : -1);
    });
    return { dz, pitch, roll: roll + 0.012 * Math.sin(f * 2.3) };
  };
  /** How the cart is turned and where it is, frame by frame: on its rails; then over the buffer, through the air, onto its back, a bounce. */
  const poseAt = (f: number): CartPose => {
    const spin = xAt(Math.min(f, HIT)) / CART.wheelR;
    if (f < HIT) {
      const j = jig(f);
      let L: V3 = rot([1, 0, 0], [0, 1, 0], -j.pitch);
      let Up: V3 = rot([0, 0, 1], [0, 1, 0], -j.pitch);
      const Wd: V3 = rot([0, 1, 0], L, j.roll);
      Up = rot(Up, L, j.roll);
      L = norm(L);
      return { ...CART_STILL, o: [xAt(f), 0, j.dz + Math.max(0, j.pitch) * CART.wheelL], L, Wd, Up, spin, upSpin: spin, load: CART_STILL.load.map((q) => q) };
    }
    const t = f - HIT;
    // (over it nose first, faster and faster, its middle flying on in an arc; on its back; a bounce, rocking)
    const MID = (CART.z0 + CART.z1) / 2;
    let th: number;
    let x: number;
    let zc: number;
    const vx = vHit * 0.55;
    if (t <= TL) {
      th = Math.PI * (t / TL) ** 1.25;
      x = xAt(HIT) + vx * t;
      zc = MID + 7.5 * t - 0.5 * t * t;
    } else {
      const u = t - TL;
      th = Math.PI - 0.3 * Math.sin(Math.min(Math.PI, u * 0.45)) * Math.exp(-u / 9) * (u < 7 ? 1 : 0.6);
      x = xAt(HIT) + vx * TL + vx * 3.2 * (1 - Math.exp(-u / 3.2));
      zc = u < 10 ? 12 * Math.sin((Math.PI * u) / 10) : u < 16 ? 4 * Math.sin((Math.PI * (u - 10)) / 6) : 0;
    }
    const L: V3 = rot([1, 0, 0], [0, 1, 0], th);
    const Up: V3 = rot([0, 0, 1], [0, 1, 0], th);
    const turned = spin + 1.1 * 140 * (1 - Math.exp(-t / 140));
    const k: CartPose = { ...CART_STILL, o: sub([x, 0, zc], mul(Up, MID)), L, Wd: [0, 1, 0], Up, spin: turned, upSpin: turned, load: [], bone: false };
    // (never through the floor: set down on it where it would go under)
    const zMin = Math.min(...cartPoints(k).map((q) => q[2]));
    return { ...k, o: add(k.o, [0, 0, Math.max(0, -zMin) + (t > TL ? zc : 0)]), wheels: [true, true, true, f < LAND] };
  };
  // THE LOAD: carried with it, jostled at the joints; a skull and a lump of it bounced off on the way; the rest flung on ahead as it strikes
  const LOAD = CART_LOAD.map(([a, b, c, r, kind]) => ({ kind: kind ? ('skull' as const) : ('ore' as const), at: [a, b, c] as V3, r }));
  const spillAt = (i: number): number => (i === 13 && joints.length > 0 ? joints[0] + 1 : i === 4 && joints.length > 2 ? joints[2] + 1 : HIT);
  const bodies: Body[] = LOAD.map((q) => ({ ...body(q.kind, [0, 0, 0], q.r, 0, q.kind === 'skull' ? CART_SKULL_F : [1, 0, 0]), rest: q.kind === 'skull' ? norm([0.5, 1, 0.15]) : undefined }));
  const BONE_I = bodies.length;
  bodies.push(body('bone', [0, 0, 0], 1.2, 21.5, norm([21, -6, 1.4])));
  // (the splinters off the buffer)
  const SPL0 = bodies.length;
  for (let k = 0; k < 9; k++) bodies.push(body('splinter', [STOP_FACE + 1 + hash(k, 1, 671) * 4, (k - 4) * 3.2, 4 + hash(k, 2, 671) * 9], 1.1, 4 + hash(k, 3, 671) * 6, norm([hash(k, 4, 671) - 0.5, hash(k, 5, 671) - 0.5, 0.4])));
  // (rust flaking off it as it creaks)
  const FLAKES = [3, 7, 11, 15, 19].map((f0, k) => ({ f0, p: [(k - 2) * 5.5, CART.w1 - 1.5, 14 + (k % 3) * 4] as V3 }));
  const states: Body[][] = [];
  for (let f = 0; f < N; f++) {
    const k = poseAt(f);
    bodies.forEach((b, i) => {
      if (b.free) return;
      if (i >= SPL0) {
        if (f >= HIT) letGo(b, [-1.5 + hash(i, 6, 672) * 3.5, (b.p[1] / 4) * (1 + hash(i, 7, 672)), 3 + hash(i, 8, 672) * 4], i, 0.5);
        return;
      }
      const at = i === BONE_I ? [-0.5, -2, 35] as V3 : LOAD[i].at;
      // (jostled in it as it bucks)
      const jj = f < HIT ? jig(f).dz * 0.5 * hash(i, f, 673) : 0;
      const p = cartPt(k, at[0], at[1], at[2] + jj);
      if (f >= (i === BONE_I ? HIT : spillAt(i))) {
        const r = (q: number): number => hash(i, q, 674) - 0.5;
        const vNow = f < HIT ? acc * (f - CREAK) : vHit;
        b.p = p;
        letGo(b, f < HIT ? [vNow * 0.8, 3.2 + r(1), 2.8 + r(2)] : [vNow * (0.62 + 0.26 * (r(1) + 0.5)), r(2) * 4.4, 3 + 3 * (r(3) + 0.5)], i, b.kind === 'ore' ? 0.15 : 0.32);
        if (i === BONE_I) b.F = norm([21, -6, 0.4]);
      } else b.p = p;
    });
    if (f > 0) stepBodies(bodies, f, -1, 0.94, () => 0, (x, y) => x < STOP_X + 120 && Math.abs(y) < 60);
    states.push(bodies.map(copyBody));
  }
  if (states[N - 1].some((b) => !b.still)) throw new Error('the cart: its load is still moving at the end: ' + states[N - 1].filter((b) => !b.still).map((b) => `${b.kind} ${b.p.map((q) => q.toFixed(1))} v ${b.v.map((q) => q.toFixed(2))}`).join('; '));
  // THE WHEEL broken off as it lands: rolling away in a wobbling curve, slower and slower; it tips and falls flat, rattling
  const R = CART.wheelR;
  interface WheelPose { c: V3; face: V3; A: V3; B: V3; spin: number }
  const wheelPoses: (WheelPose | null)[] = [];
  {
    const k0 = poseAt(LAND);
    let c: V3 = cartPt(k0, CART.wheelL, CART.wheelW, CART.wheelZ);
    const z0 = c[2];
    let head = 0.25;
    let sp = vHit * 0.5;
    let spin = 0;
    let fall = -1;
    for (let f = 0; f < N; f++) {
      if (f < LAND) {
        wheelPoses.push(null);
        continue;
      }
      const u = f - LAND;
      if (fall < 0) {
        c = [c[0] + Math.cos(head) * sp, c[1] + Math.sin(head) * sp, 0];
        spin -= sp / R;
        head += 0.05 + 0.02 * Math.min(1, u / 10);
        sp *= 0.955;
        if (sp < 0.75) fall = f;
      }
      // (leaning into its curve, wobbling; then over, flat, rattling to a stop)
      const lean = fall < 0 ? 0.12 + 0.1 * Math.sin(u * 0.7) * Math.min(1, u / 6) : f - fall >= 24 ? Math.PI / 2 : Math.min(Math.PI / 2, 0.22 + ((f - fall) / 6) ** 2 * (Math.PI / 2)) - (f - fall > 6 ? 0.18 * Math.exp(-(f - fall - 6) / 3) * Math.abs(Math.cos((f - fall - 6) * 1.6)) : 0);
      const h: V3 = [Math.cos(head), Math.sin(head), 0];
      const face = norm(rot([-h[1], h[0], 0], h, lean));
      const B = norm(cross(face, h));
      // (dropping off the cart first, and a bounce)
      const drop = Math.max(0, z0 - R - 0.5 * u * u) + (u > 0 && z0 - R - 0.5 * u * u < 0 ? Math.max(0, 3 * Math.sin(((u - Math.sqrt(2 * Math.max(0, z0 - R))) * Math.PI) / 6)) * (u - Math.sqrt(2 * Math.max(0, z0 - R)) < 6 ? 1 : 0) : 0);
      const ctr: V3 = [c[0], c[1], R * Math.cos(lean) + 0.7 * Math.sin(lean) + drop];
      wheelPoses.push({ c: ctr, face, A: h, B, spin });
    }
  }
  // THE DUST: at the buffer as it strikes, blown out along it; all along the cart where it lands; where the wheel falls; where a skull first strikes hard
  const clouds: Cloud[] = [
    cloud(HIT, [STOP_FACE, -6, 4], [0.5, -2.6, 0.5], 8.5, 1, N - 1 - HIT, 14, 18),
    cloud(HIT, [STOP_FACE, 6, 4], [0.5, 2.6, 0.5], 8, 2, N - 3 - HIT, 14, 18),
  ];
  {
    const k = poseAt(LAND);
    for (const [l, s] of [[-12, -1], [0, 1], [12, -1]] as const) {
      const p = cartPt(k, l, 0, 0);
      clouds.push(cloud(LAND, [p[0], p[1] + s * 8, 3], [0.6, s * 2.2, 0.4], 7.5, 3 + l, N - 1 - LAND - Math.abs(l) / 4, 12, 18));
    }
  }
  const fallF = wheelPoses.findIndex((w, f) => w !== null && f > LAND && Math.abs(dot(w.face, [0, 0, 1])) > 0.95);
  if (fallF > 0 && fallF < N - 30) clouds.push(cloud(fallF, [wheelPoses[fallF]!.c[0], wheelPoses[fallF]!.c[1], 1], [0, 0, 0.2], 4, 9, 30, 6, 10));
  bodies.forEach((b, i) => {
    if (b.kind !== 'skull') return;
    const st = b.struck.find((q) => q.vz < -3);
    if (st && st.f < N - 34) clouds.push(cloud(st.f, [states[st.f][i].p[0], states[st.f][i].p[1], 1], [0.4, 0, 0.2], 3.2, 20 + i, 30, 5, 9));
  });
  // SPARKS streaking from its wheels on the rails as it goes fast, and a spray of them as it strikes: an honest fire's orange, short-lived
  interface Spark { f0: number; p: V3; v: V3; life: number }
  const sparks: Spark[] = [];
  for (let f0 = CREAK + 18; f0 < HIT; f0++) {
    for (let j = 0; j < 3; j++) {
      const sl = j === 1 ? -1 : 1;
      const sw = hash(f0, j, 675) < 0.5 ? -1 : 1;
      sparks.push({ f0, p: [xAt(f0) + sl * CART.wheelL, sw * CART.wheelW, 0.6], v: [-2.4 - hash(f0, j + 2, 675) * 2.4, sw * (0.4 + hash(f0, j + 4, 675)), 1.4 + hash(f0, j + 6, 675) * 1.8], life: 3 + (j % 2) });
    }
  }
  for (let j = 0; j < 18; j++) sparks.push({ f0: HIT + (j % 3), p: [STOP_FACE, (hash(j, 1, 676) - 0.5) * 20, 6 + hash(j, 2, 676) * 8], v: [-2 + hash(j, 3, 676) * 3, (hash(j, 4, 676) - 0.5) * 6, 1.4 + hash(j, 5, 676) * 3.6], life: 4 + (j % 3) });
  const sparkAt = (s: Spark, k: number): V3 => [s.p[0] + s.v[0] * k, s.p[1] + s.v[1] * k, Math.max(0.5, s.p[2] + s.v[2] * k - 0.6 * k * k)];
  const shakeAt = (f: number): number => (f < HIT ? 0 : 3.4 * Math.exp(-(f - HIT) / 4) * Math.cos((f - HIT) * 1.9));
  const splitAt = (f: number): number => (f < HIT ? 0 : ease((f - HIT + 1) / 5));
  const tracks: Track[] = [
    { name: 'the cart', at: [] },
    { name: 'the wheel', at: [] },
    ...bodies.map((b, i) => ({ name: `${b.kind} ${i}`, at: [] as Track['at'] })),
  ];
  const paint = (f: number, record: boolean): Sprite => {
    const S = new Scene(new Px(MW, MH), ax, ay);
    const k = poseAt(f);
    const load = k.load.map((q, i) => (q && !states[f][i].free ? q : null));
    paintCart(S, { ...k, load, bone: f < HIT }, 1);
    paintStop(S, [STOP_X, 0, 0], shakeAt(f), 100, splitAt(f));
    const w = wheelPoses[f];
    if (w) wheel(S, w.c, w.face, w.A, w.B, R, w.spin, 120, true);
    states[f].forEach((b, i) => {
      if (!b.free) return;
      paintBody(S, b, BONE, 200 + i);
    });
    // the rust flakes, falling and lying
    for (const fl of FLAKES) {
      if (f < fl.f0) continue;
      const t = f - fl.f0;
      const z = Math.max(0.8, fl.p[2] - 0.5 * t * t);
      S.ball([fl.p[0], fl.p[1] + Math.min(t, 4) * 0.3, z], 0.9, RUST, 150);
    }
    paintClouds(S, clouds, f);
    S.seams();
    const out = compose(null, [S.p], null);
    const fire = new Px(MW, MH);
    for (const s of sparks) {
      const kk = f - s.f0;
      if (kk < 0 || kk >= s.life) continue;
      const [x0, y0] = S.at(sparkAt(s, Math.max(0, kk - 0.8)));
      const [x1, y1] = S.at(sparkAt(s, kk));
      fire.line(Math.round(x0), Math.round(y0), Math.round(x1), Math.round(y1), kk < 2 ? EMBER[4] : EMBER[3]);
      fire.set(Math.round(x1) + 1, Math.round(y1), EMBER[2]);
    }
    fastBlit(out, fire, 0, 0);
    if (record) {
      const c = add(k.o, [0, 0, 14]);
      const pc = add(poseAt(Math.max(0, f - 1)).o, [0, 0, 14]);
      tracks[0].at.push(trackAt((a, b, z) => [a, b, z], c, pc, 26));
      const wp = (q: number): V3 => wheelPoses[q]?.c ?? cartPt(poseAt(q), CART.wheelL, CART.wheelW, CART.wheelZ);
      tracks[1].at.push(trackAt((a, b, z) => [a, b, z], wp(f), wp(Math.max(0, f - 1)), 10));
      states[f].forEach((b, i) => tracks[2 + i].at.push(trackAt((a, bb, z) => [a, bb, z], b.p, states[Math.max(0, f - 1)][i].p, b.kind === 'bone' ? 14 : b.kind === 'splinter' ? 9 : 8)));
    }
    return out.sprite(ax, ay, GRAIN);
  };
  const frames: Sprite[] = [];
  for (let f = 0; f < N; f++) frames.push(paint(f, true));
  return { name: 'the cart runs', frames, fps: 30, before: [paint(0, false)], after: [frames[N - 1]], tracks, jolts: [HIT, LAND], holds: [] };
}

// -------------------------------------------------------------------------------------------------

/**
 * THE BONES STIR. The heap of the dead lies still (`before`, the piece). Then it breathes: the whole
 * mound swelling and sinking, deeper each time, skulls rolling off it and down its sides; fingers of
 * bone poke up out of it here and there and draw back. THE ARM BURSTS OUT (the first jolt): bones and
 * skulls thrown up out of its top in a high fountain and raining down all round, and up out of the
 * ragged hole an arm of bone, great and thick, its hand as big as a skull; it rakes: down to the floor
 * on one side and across the front, dragging its claws through the earth; up and over and slamming down
 * on the other side, raking again toward the hero; reaching for him, its fingers clawing. The pink
 * kindles in the sockets of a skull at the heap's front, its eyes great and burning, lighting the bones
 * about it; steady, one pink. Then the arm comes apart, a piece at a time: its fingers drop, its hand,
 * its forearm, its upper arm last, crashing onto the heap (the second jolt). The heap slumps; bones
 * slide down over the burning skull and it sinks into the heap under them, its eyes glowing through the
 * gaps between them until the last of it is covered (never fading where it lies). What is left: the
 * heap, lower and changed, the arm's bones on it, the flung bones about it, the earth raked by its
 * claws (`after`). Anchored at the middle of the heap's tile.
 */
function bonesStir(): Moment {
  const MW = 352;
  const MH = 272;
  const ax = 176;
  const ay = 164;
  const BURST = 42;
  const GRASP_END = 94;
  const SINK = 112;
  const N = 172;
  const H0 = HEAP.h;
  /** How high the heap stands, frame by frame: breathing, deeper each time; swollen as the arm is out of it; slumping lower than it was. */
  const hAt = (f: number): number => {
    if (f < 1) return H0;
    if (f < BURST) {
      const A = 6 + 7 * (f / BURST);
      return H0 + A * 0.5 * (1 - Math.cos((2 * Math.PI * f) / 13.5));
    }
    if (f < GRASP_END) return H0 + 4 + 0.8 * Math.sin((f - BURST) * 0.4);
    const t = ease((f - GRASP_END) / 22);
    return H0 + 4 + 0.8 * Math.sin((GRASP_END - BURST) * 0.4) * (1 - t) - 7 * t;
  };
  const ground = (f: number) => (x: number, y: number): number => heapTop(x, y, hAt(f));
  /** A point of the heap's skin, riding up and down with it as it breathes. */
  const ride = (p: V3, f: number): V3 => {
    if (hAt(f) === H0) return p;
    const lift = p[2] - heapTop(p[0], p[1], H0);
    if (heapTop(p[0], p[1], H0) < 0.2) return p;
    return [p[0], p[1], heapTop(p[0], p[1], hAt(f)) + lift];
  };
  // WHICH GO: skulls rolled off it as it breathes; the bones and skulls of its top flung up as the arm bursts out
  const eyes = HEAP_BITS[HEAP_EYES];
  const centre = (b: HeapBit): [number, number] => (b.kind === 'bone' ? [(b.a[0] + b.b[0]) / 2, (b.a[1] + b.b[1]) / 2] : [b.a[0], b.a[1]]);
  const rollers = HEAP_BITS.map((b, i) => i).filter((i) => HEAP_BITS[i].kind === 'skull' && i !== HEAP_EYES && Math.hypot(...centre(HEAP_BITS[i])) > 6 && Math.hypot(...centre(HEAP_BITS[i])) < 22).slice(0, 4);
  const ROLLS = [8, 17, 26, 34];
  const flung = HEAP_BITS.map((b, i) => i).filter((i) => !rollers.includes(i) && i !== HEAP_EYES && HEAP_BITS[i].kind !== 'ribs' && Math.hypot(...centre(HEAP_BITS[i])) < 17);
  // (the bones by the burning skull: left on the heap, to slide down over it as it is buried)
  const buriers = HEAP_BITS.map((b, i) => i).filter((i) => HEAP_BITS[i].kind === 'bone' && !flung.includes(i) && !rollers.includes(i)).sort((p, q) => Math.hypot(centre(HEAP_BITS[p])[0] - eyes.a[0], centre(HEAP_BITS[p])[1] - eyes.a[1]) - Math.hypot(centre(HEAP_BITS[q])[0] - eyes.a[0], centre(HEAP_BITS[q])[1] - eyes.a[1])).slice(0, 3);
  type What = 'heap' | 'finger' | 'palm' | 'fore' | 'upper' | 'pour';
  interface Loose { what: What; i: number; go: number; body: Body }
  const loose: Loose[] = [];
  const add_ = (what: What, i: number, go: number, b: Body): void => void loose.push({ what, i, go, body: b });
  rollers.forEach((i, k) => add_('heap', i, ROLLS[k], { ...body('skull', [0, 0, 0], HEAP_BITS[i].r, 0, HEAP_BITS[i].F), rest: norm([0.6, 1, 0.12]) }));
  for (const i of flung) {
    const b = HEAP_BITS[i];
    if (b.kind === 'skull') add_('heap', i, BURST, { ...body('skull', [0, 0, 0], b.r, 0, b.F), rest: norm([0.6, 1, 0.12]) });
    else add_('heap', i, BURST, body('bone', [0, 0, 0], b.r, Math.hypot(...sub(b.b, b.a)), norm(sub(b.b, b.a))));
  }
  // (more of the dead on the heap above it, poured down over the burning skull as it is buried)
  const pourers = HEAP_BITS.map((b, i) => i).filter((i) => !rollers.includes(i) && !flung.includes(i) && !buriers.includes(i) && i !== HEAP_EYES && HEAP_BITS[i].kind !== 'ribs')
    .sort((p, q) => Math.hypot(centre(HEAP_BITS[p])[0] - eyes.a[0] - 8, centre(HEAP_BITS[p])[1] - eyes.a[1] + 10) - Math.hypot(centre(HEAP_BITS[q])[0] - eyes.a[0] - 8, centre(HEAP_BITS[q])[1] - eyes.a[1] + 10)).slice(0, 4);
  pourers.forEach((i, k) => {
    const b = HEAP_BITS[i];
    add_('pour', i, SINK + 2 + k * 6, b.kind === 'skull' ? { ...body('skull', [0, 0, 0], b.r, 0, b.F), rest: norm([0.6, 1, 0.12]) } : body('bone', [0, 0, 0], b.r, Math.hypot(...sub(b.b, b.a)), norm(sub(b.b, b.a))));
  });
  // THE ARM: its shoulder in the heap's top; its upper arm and forearm long and thick; its hand great
  const UP = 27;
  const LOW = 26;
  const HAND = 1.9;
  const shoulderAt = (f: number): V3 => [-2, -2, heapTop(0, 0, hAt(f)) - 3];
  /** Where its hand goes, frame by frame from the burst, and how its fingers claw (0 spread, 1.3 shut). */
  const KEYS: ReadonlyArray<readonly [number, V3, number]> = [
    [0, [0, 0, 8], 1.2], [4, [2, 2, 72], 0.2], [7, [0, 2, 74], 0.1], [13, [-42, 18, 5], 0.6], [16, [-38, 28, 5], 1], [22, [8, 46, 5], 1.2], [27, [42, 8, 5], 0.7],
    [32, [14, 0, 60], 0.1], [37, [46, -4, 5], 0.6], [40, [42, 10, 5], 1.1], [47, [-8, 50, 5], 1.2], [51, [-14, 52, 8], 0.4], [56, [-16, 54, 10], 0.1], [GRASP_END - BURST, [-12, 50, 6], 1.1],
  ];
  const handAt = (f: number): { p: V3; curl: number } => {
    const t = f - BURST;
    if (t <= 0) return { p: add(shoulderAt(f), [0, 0, 6]), curl: 1.2 };
    let k = 0;
    while (k < KEYS.length - 2 && KEYS[k + 1][0] <= t) k++;
    const [t0, p0, c0] = KEYS[k];
    const [t1, p1, c1] = KEYS[k + 1];
    const u = ease((t - t0) / (t1 - t0));
    const base = add(add(p0, mul(sub(p1, p0), u)), [0, 0, heapTop(0, 0, hAt(f)) * (k < 1 ? 1 : 0)]);
    // (its fingers working all the while it reaches)
    const curl = c0 + (c1 - c0) * u + (t > 50 ? 0.4 * Math.sin(t * 1.3) : 0);
    return { p: base, curl: Math.max(0, Math.min(1.3, curl)) };
  };
  const armAt = (f: number): { sh: V3; el: V3; wr: V3; curl: number; along: V3; palm: V3 } => {
    const g = Math.min(f, GRASP_END - 1);
    const sh = shoulderAt(g);
    const h = handAt(g);
    // (its elbow up high and out, as a thing of bone hauls itself: never folded flat)
    const { el, hand } = reach2(sh, h.p, UP, LOW, norm([-0.45, -0.6, 0.8]));
    const along = norm(sub(hand, el));
    // (its palm down to the floor as it rakes, out to the hero as it reaches)
    const palm = norm(add(mul([0, 0, -1], 0.7), mul([0.3, 0.6, 0], 0.5)));
    return { sh, el, wr: hand, curl: h.curl, along, palm };
  };
  /** The arm's pieces, at the moment it starts to come apart: where each is. */
  const at0 = armAt(GRASP_END - 1);
  const FINGERS = [0, 1, 2, 3, 4].map((k) => {
    const A = at0.along;
    const N_ = norm(sub(at0.palm, mul(A, dot(at0.palm, A))));
    const Sd = cross(A, N_);
    const off = (k - 2.2) * 1.5 * HAND;
    return add(add(at0.wr, mul(A, 8 * HAND)), mul(Sd, off));
  });
  FINGERS.forEach((p, k) => add_('finger', k, GRASP_END + k, body('bone', p, 0.75 * HAND, 6 * HAND, norm(add(at0.along, [0, 0, -0.3])))));
  add_('palm', 0, GRASP_END + 5, body('bone', add(at0.wr, mul(at0.along, 3 * HAND)), 1.4 * HAND, 4.5 * HAND, at0.along));
  for (const s of [-1, 1]) {
    const side: V3 = [s * 1.4, -s * 1.4, 0];
    add_('fore', s, GRASP_END + 8 + (s > 0 ? 1 : 0), body('bone', add(mul(add(at0.el, at0.wr), 0.5), side), s > 0 ? 2.1 : 1.8, LOW, norm(sub(at0.wr, at0.el))));
  }
  add_('upper', 0, GRASP_END + 12, body('bone', mul(add(at0.sh, at0.el), 0.5), 2.8, UP, norm(sub(at0.el, at0.sh))));
  // THE BURNING SKULL: kindling after the burst, steady; turning its face to the hero; then sinking into the heap under the poured bones
  const KINDLE = BURST + 49;
  const burnAt = (f: number): number => (f < KINDLE ? 0 : Math.min(1, (f - KINDLE) / 9));
  const SUNK = SINK + 50;
  const eyesAt = (f: number): { c: V3; F: V3 } => {
    const base = ride(eyes.a, Math.min(f, SINK));
    const look = clamp01((f - KINDLE) / 10);
    const F = look === 0 ? eyes.F : norm(add(mul(eyes.F, 1 - look), mul([0.55, 0.7, 0.45], look)));
    const k = ease((f - SINK - 14) / (SUNK - SINK - 14));
    if (k === 0) return { c: base, F };
    return { c: add(base, [-k * 2, -k * 2, -k * 12]), F: norm(add(F, [0, 0, -k * 0.5])) };
  };
  // the run
  const bodies = loose.map((L) => L.body);
  const states: Body[][] = [];
  for (let f = 0; f < N; f++) {
    for (const L of loose) {
      const b = L.body;
      if (b.free || f < L.go) continue;
      const r = (q: number): number => hash(L.i * 13 + L.what.length, q, 680) - 0.5;
      if (L.what === 'heap' || L.what === 'pour') {
        const src = HEAP_BITS[L.i];
        if (src.kind === 'skull') b.p = ride(src.a, f - 1);
        else {
          const a = ride(src.a, f - 1);
          const e = ride(src.b, f - 1);
          b.p = mul(add(a, e), 0.5);
          b.F = norm(sub(e, a));
        }
        const out = norm([b.p[0] + r(1) * 6 + 0.01, b.p[1] + r(2) * 6, 0]);
        const e = eyesAt(f).c;
        const to = norm([e[0] - b.p[0], e[1] - b.p[1] + 0.01, 0]);
        // (rolled off as it breathes; thrown high as the arm bursts out; or slid down over the burning skull)
        letGo(b, L.what === 'pour' ? [to[0] * 1.3, to[1] * 1.3, 0.5] : L.go === BURST ? [out[0] * (1.4 + 1.6 * (r(3) + 0.5)), out[1] * (1.4 + 1.6 * (r(3) + 0.5)), 8.5 + 3.5 * (r(4) + 0.5)] : [out[0] * 1.7, out[1] * 1.7, 0.8], L.i, L.go === BURST ? 0.35 : 0.1);
      } else {
        // (the arm's pieces: let go where they are, and down)
        letGo(b, [r(1) * 0.8, r(2) * 0.8, -0.5], 70 + L.i + L.what.length, L.what === 'finger' ? 0.3 : 0.08);
      }
    }
    if (f > 0) stepBodies(bodies, f, -1, 0.9, ground(f));
    states.push(bodies.map(copyBody));
  }
  if (states[N - 1].some((b) => !b.still)) throw new Error('the heap: something still moving at the end: ' + states[N - 1].filter((b) => !b.still).map((b) => `${b.kind} ${b.p.map((q) => q.toFixed(1))} v ${b.v.map((q) => q.toFixed(2))}`).join('; '));
  const collapse = Math.max(...loose.filter((L) => L.what === 'upper').map((L) => L.body.struck[0]?.f ?? GRASP_END + 16));
  // (the bones by it sliding down over it as it goes)
  // (each slides down over it in turn and lies across it: low across its jaw, across its eyes, over its brow; the glow showing between them)
  const coverAt = (p: V3, f: number, k: number, mid: V3): V3 => {
    const q = ride(p, Math.min(f, SINK));
    const t = ease((f - SINK - 2 - k * 6) / 15);
    if (t === 0) return q;
    const e = eyesAt(f).c;
    const target = add(e, [[3.4, 3.4, -0.6], [3, 3, 1.9], [1.8, 1.8, 4.4]][k] as V3);
    const off = sub(q, ride(mid, Math.min(f, SINK)));
    const to = add(target, [off[0] * 0.9, off[1] * 0.9, 0]);
    return add(q, mul(sub(to, q), t));
  };
  // THE FINGERS that poke up out of it before it bursts, and draw back
  const POKES: ReadonlyArray<readonly [number, number, number]> = [[12, -12, 8], [22, 10, -6], [31, -4, 14]];
  // THE DUST: from its top as the arm bursts out, blown low to either side; where its hand slams down; where the arm's pieces crash
  const clouds: Cloud[] = [
    cloud(BURST, [-6, -4, H0 + 2], [-2.4, -0.6, 0.8], 7.5, 1, 50, 10, 14),
    cloud(BURST, [6, -6, H0 + 2], [2.2, -1.2, 0.8], 7, 2, 52, 10, 14),
  ];
  clouds.push(cloud(SINK + 28, [eyes.a[0] + 8, eyes.a[1] + 8, 3], [0.5, 0.6, 0.3], 4.5, 7, N - (SINK + 28), 8, 10));
  for (const t of [13, 37]) {
    const p = handAt(BURST + t).p;
    clouds.push(cloud(BURST + t, [p[0], p[1], 2], [0, 0.8, 0.3], 5.5, 3 + t, 40, 8, 12));
  }
  loose.forEach((L, k) => {
    if (L.what !== 'upper' && L.what !== 'fore') return;
    const st = L.body.struck[0];
    if (st) clouds.push(cloud(st.f, [states[st.f][k].p[0] - 6, states[st.f][k].p[1] - 6, states[st.f][k].p[2]], [-1.2, -1.2, 0.5], 5, 10 + k, N - 2 - st.f, 10, 16));
  });
  // THE RAKED EARTH: where its claws dragged across the floor
  const grooves: [number, V3, V3][] = [];
  for (let f = BURST + 1; f < GRASP_END; f++) {
    const A = armAt(f);
    const B = armAt(f - 1);
    if (A.wr[2] > 4 || B.wr[2] > 4) continue;
    for (let k = 0; k < 4; k++) {
      const s = (k - 1.5) * 2.4;
      const side = norm(cross(A.along, [0, 0, 1]));
      const tip = (Q: typeof A): V3 => add(add(Q.wr, mul(Q.along, 9 * HAND)), mul(side, s * HAND * 0.8));
      grooves.push([f, tip(B), tip(A)]);
    }
  }
  const tracks: Track[] = [
    { name: 'the hand', fromEdge: true, at: [] },
    { name: 'the burning eyes', at: [] },
    { name: 'its forearm', fromEdge: true, at: [] },
    { name: 'its upper arm', fromEdge: true, at: [] },
    { name: 'the heap', at: [] },
    ...loose.map((L, k) => ({ name: `${L.what === 'heap' || L.what === 'pour' ? (HEAP_BITS[L.i].kind === 'skull' ? 'skull' : 'bone') : L.what} ${k}`, fromEdge: L.what === 'finger' || L.what === 'palm' || L.what === 'fore' || L.what === 'upper', at: [] as Track['at'] })),
  ];
  const ID_EYES = 2 + HEAP_EYES;
  let peak = 1;
  let seenPeak = 1;
  const burnPx: number[] = [];
  const paint = (f: number, record: boolean): Sprite => {
    const S = new Scene(new Px(MW, MH), ax, ay);
    const under = new Px(MW, MH);
    // the earth raked by its claws
    for (const [f0, a, b] of grooves) {
      if (f0 > f) continue;
      const [x0, y0] = S.at(a);
      const [x1, y1] = S.at(b);
      under.line(Math.round(x0), Math.round(y0), Math.round(x1), Math.round(y1), DEEP);
      under.line(Math.round(x0), Math.round(y0) - 1, Math.round(x1), Math.round(y1) - 1, EARTH[3]);
    }
    // the heap and its dead, as they are moved
    const gone = new Set(loose.filter((L) => (L.what === 'heap' || L.what === 'pour') && f >= L.go).map((L) => L.i));
    const bits = HEAP_BITS.map((b, i): HeapBit | null => {
      if (gone.has(i)) return null;
      if (i === HEAP_EYES) {
        const e = eyesAt(f);
        return { ...b, a: e.c, F: e.F };
      }
      const k = buriers.indexOf(i);
      if (k >= 0) {
        const m = mul(add(b.a, b.b), 0.5);
        return { ...b, a: coverAt(b.a, f, k, m), b: coverAt(b.b, f, k, m) };
      }
      return { ...b, a: ride(b.a, f), b: b.kind === 'bone' ? ride(b.b, f) : b.b };
    });
    paintHeap(S, hAt(f), bits, burnAt(f), 1);
    // the ragged hole the arm came out of: dark, never a lid
    if (f >= BURST) {
      const top = heapTop(0, 0, hAt(f));
      S.egg([-2, -2, top - 1.4], XYZ, [6.5, 5.5, 1.6], (n, w) => (hash(Math.floor(w[0]), Math.floor(w[1]), 681) < 0.3 ? EARTH[0] : DEEP), 40);
    }
    // the fingers poking up out of it, and drawing back
    POKES.forEach(([f0, x, y], k) => {
      const t = f - f0;
      if (t < 0 || t > 9) return;
      const e = Math.sin((Math.PI * t) / 9);
      const z0 = heapTop(x, y, hAt(f));
      for (let j = 0; j < 3; j++) {
        const o: V3 = [x + (j - 1) * 2.2, y + (j % 2) * 1.2, z0 - 1];
        const tip = add(o, [0.6 * Math.sin(t * 0.9 + j), 0.6, (4.5 + j) * e]);
        S.rod(o, tip, 0.8, 0.55, BIG_BONE, 50 + k);
        S.ball(tip, 0.65, BIG_BONE, 50 + k);
      }
    });
    // the arm, while it is whole, and what is left of it as it comes apart
    const pieceGone = (what: What, i = 0): boolean => loose.some((L) => L.what === what && (what === 'fore' || what === 'finger' ? L.i === i : true) && f >= L.go);
    if (f >= BURST && f < GRASP_END + 13) {
      const A = armAt(f);
      // (its bones tapered, knobbed at the joints: never two straight sticks)
      if (!pieceGone('upper')) {
        S.rod(A.sh, A.el, 3.3, 2.2, BIG_BONE, 60);
        S.ball(A.sh, 3.6, BIG_BONE, 60);
      }
      if (!pieceGone('upper') || !pieceGone('fore', -1)) {
        S.ball(add(A.el, [0.9, -0.9, 0.4]), 3.2, BIG_BONE, 61);
        S.ball(add(A.el, [-0.9, 0.9, -0.2]), 2.8, BIG_BONE, 61);
      }
      if (!pieceGone('fore', 1)) S.rod(add(A.el, [1.3, -1.3, 0]), add(A.wr, [0.9, -0.9, 0]), 2.2, 1.4, BIG_BONE, 61);
      if (!pieceGone('fore', -1)) S.rod(add(A.el, [-1.3, 1.3, 0]), add(A.wr, [-0.9, 0.9, 0]), 1.8, 1.2, BIG_BONE, 61);
      if (!pieceGone('palm')) S.ball(A.wr, 2, BIG_BONE, 62);
      if (!pieceGone('palm')) {
        if (f < GRASP_END) boneHand(S, A.wr, A.along, A.palm, A.curl, BIG_BONE, 62, HAND);
        else {
          const N_ = norm(sub(A.palm, mul(A.along, dot(A.palm, A.along))));
          S.egg(add(A.wr, mul(A.along, 3 * HAND)), [A.along, N_, cross(A.along, N_)], [3.6 * HAND, 1.4 * HAND, 3.3 * HAND], (nn) => toneAt(nn, BIG_BONE), 62);
        }
      }
    }
    // the loose ones
    states[f].forEach((b, k) => {
      // (a finger not yet fallen, once the hand has stopped: as it was)
      if (!b.free && !(loose[k].what === 'finger' && f >= GRASP_END)) return;
      paintBody(S, b, BIG_BONE, 70 + k);
    });
    paintClouds(S, clouds, f);
    S.seams();
    // the pink of its eyes lighting the bones about it (steady)
    const burn = burnAt(f);
    const e = eyesAt(f);
    const [ex, ey] = S.at(e.c);
    let n = 0;
    for (let i = 0; i < S.id.length; i++) {
      if (S.id[i] !== ID_EYES) continue;
      const c = S.p.get(i % MW, Math.floor(i / MW))!;
      if (c === PINK[3] || c === PINK[2] || c === KINDLING[1]) n += c === PINK[3] ? 1 : c === PINK[2] ? 0.75 : 0.45;
    }
    burnPx[f] = n;
    seenPeak = Math.max(seenPeak, n);
    // (only as much as its eyes show: covered, they light nothing)
    const glow = burn * Math.min(1, n / Math.max(1, seenPeak));
    if (glow > 0.02) {
      for (let i = 0; i < S.id.length; i++) {
        const id = S.id[i];
        if (id < 0 || id >= SOFT) continue;
        const x = i % MW;
        const y = Math.floor(i / MW);
        const c = S.p.get(x, y)!;
        if (PINK.includes(c) || (KINDLING as readonly string[]).includes(c)) continue;
        const d = Math.hypot(x - ex, (y - ey) * 1.3);
        if (d < 16) S.p.set(x, y, mix(c, PINK[2], 0.32 * glow * (1 - d / 16)));
      }
    }
    const out = compose(under, [S.p], null);
    const sp = out.sprite(ax, ay, GRAIN);
    if (n > 0) sp.lights = [{ x: ex / GRAIN, y: ey / GRAIN, r: 10, color: PINK[3], a: 0.24 * Math.min(1, n / Math.max(1, peak)) }];
    if (record) {
      const W = (a: number, b: number, z: number): V3 => [a, b, z];
      const arm = (which: 'hand' | 'fore' | 'upper', q: number): V3 | null => {
        if (q < BURST) return null;
        const A = armAt(q);
        const k = loose.findIndex((L) => L.what === (which === 'hand' ? 'palm' : which) && (which !== 'fore' || L.i === 1));
        if (states[q][k].free) return states[q][k].p;
        return which === 'hand' ? A.wr : which === 'upper' ? mul(add(A.sh, A.el), 0.5) : mul(add(A.el, A.wr), 0.5);
      };
      (['hand', 'fore', 'upper'] as const).forEach((which, j) => {
        const p = arm(which, f);
        const q = arm(which, f - 1);
        tracks[j === 0 ? 0 : j === 1 ? 2 : 3].at.push(p ? trackAt(W, p, q ?? p, 14) : null);
      });
      const [cx, cy] = onPic(e.c[0], e.c[1], e.c[2]);
      tracks[1].at.push({ x: cx, y: cy, shown: n, size: 6 });
      tracks[4].at.push(trackAt(W, [0, 0, hAt(f)], [0, 0, hAt(Math.max(0, f - 1))], 10));
      states[f].forEach((b, k) => {
        const L = loose[k];
        const onHeap = L.what === 'heap' || L.what === 'pour';
        const where = (q: number): V3 | null => (states[q][k].free ? states[q][k].p : onHeap ? ride(HEAP_BITS[L.i].a, q) : L.what === 'finger' && q >= GRASP_END ? states[q][k].p : null);
        const p = where(f);
        tracks[5 + k].at.push(p ? trackAt(W, p, where(Math.max(0, f - 1)) ?? p, 12) : null);
      });
    }
    return sp;
  };
  const frames: Sprite[] = [];
  for (let f = 0; f < N; f++) frames.push(paint(f, true));
  peak = Math.max(1, ...burnPx);
  for (const a of tracks[1].at) if (a) a.shown = Math.min(1, a.shown / peak);
  for (const fr of frames) if (fr.lights) for (const l of fr.lights) l.a = Math.min(0.24, l.a ?? 0);
  // (a jolt as it bursts out, as its hand slams down on each side, and as its upper arm crashes onto the heap)
  return { name: 'the bones stir', frames, fps: 30, before: [charnelHeap()], after: [frames[N - 1]], tracks, jolts: [BURST, BURST + 13, BURST + 37, collapse], holds: [] };
}

const films = new Map<string, ReturnType<typeof skullWallSpills>>();
const filmOf = (alongX: boolean): ReturnType<typeof skullWallSpills> => {
  const k = alongX ? 'left' : 'right';
  if (!films.has(k)) films.set(k, skullWallSpills(alongX));
  return films.get(k)!;
};
const each: (Moment | null)[] = [null, null, null];
/** One of floor 4's moments (0 the skull wall, 1 the cart, 2 the heap), made the first time it is asked for and kept. */
export function ossuaryMoment(n: number): Moment {
  const had = each[n];
  if (had) return had;
  let m: Moment;
  if (n === 0) {
    const sl = filmOf(true);
    const sr = filmOf(false);
    m = { name: 'the skull wall spills', frames: sl.frames, fps: 30, before: sl.before, after: sl.after, tracks: sl.tracks, jolts: sl.jolts, holds: [], right: { frames: sr.frames, before: sr.before, after: sr.after, tracks: sr.tracks } };
  } else m = n === 1 ? cartRuns() : bonesStir();
  return (each[n] = m);
}
/** A film of floor 4's moments for a page to show (0 the skull wall in a face turned to screen-left, 3 the same turned to screen-right, 1 the cart, 2 the heap), painting no more than that one. */
export function ossuaryFilm(n: number): { name: string; frames: Sprite[]; before: Sprite[] | null; after: Sprite[] | null; jolts: number[] } {
  if (n === 0 || n === 3) {
    const f = filmOf(n === 0);
    return { name: 'the skull wall spills', frames: f.frames, before: f.before, after: f.after, jolts: f.jolts };
  }
  const m = ossuaryMoment(n);
  return { name: m.name, frames: m.frames, before: m.before, after: m.after, jolts: m.jolts };
}
let moments: Moment[] | null = null;
/** Floor 4's moments around the hero, made the first time they are asked for and kept. */
export function ossuaryMoments(): Moment[] {
  if (moments) return moments;
  return (moments = [0, 1, 2].map(ossuaryMoment));
}
