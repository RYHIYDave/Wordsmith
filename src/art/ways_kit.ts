// THE WAYS ON, THEIR KIT (the art chat's, 22 Oct 2026; a mock-up: nothing of the game imports it): what every floor's
// way on is painted with (art/act1_ways.ts; art/act2_ways.ts).
//
// A WAY ON stands where the rules put it (game/ways.ts Ways.onward: a point at the far end of the boss's ground), and
// LEADS ON one of four ways along the grid (`WayDir`: the way from the boss's ground toward it, to the nearest of the
// four), so that it always leads away from the floor behind the hero, whichever way the floor runs. It is painted in
// the world (floor 4's painter in depth, Scene) in a frame of its own: `a` along the way on (+a: on, away from the
// boss's ground), `b` across it, `z` up; 40 to a tile across the floor, heights in picture pixels; anchored at the way's
// point on the floor. What goes down under the floor (a stair, a hole) is painted with the floor shifted up (Rig.Z0)
// and kept only where it is seen through its opening (`Rig.under`), as a hole in the floor is.
//
// Its two layers, as the game stands a thing that goes down and up (floor 4's cave, the town's stairs): `under`, with
// the floor, under what stands (the opening and what is seen down it); `over`, stood at the way's point (all that stands
// up on the floor). A film's frames are whole: both, the one over the other.

import { Px } from '../engine/px';
import type { Sprite } from '../engine/px';
import { Scene, XYZ, rot, toneAt } from './floor4';
import type { V3 } from './floor4';
import { add, cross, dot, mul, norm, sub } from './floor6';
import { GRAIN, compose, hash, limb } from './kit';
import type { Ramp } from './kit';

/** Which way a way on leads, along the grid: toward +x, -x, +y or -y. */
export type WayDir = 'x+' | 'x-' | 'y+' | 'y-';
export const WAY_DIRS: readonly WayDir[] = ['x+', 'x-', 'y+', 'y-'];

/** The way a way on leads, from where the boss stood to where it is: the nearest of the four. */
export function wayDirOf(dx: number, dy: number): WayDir {
  return Math.abs(dx) >= Math.abs(dy) ? (dx >= 0 ? 'x+' : 'x-') : dy >= 0 ? 'y+' : 'y-';
}

/** The world's way for a way's own (a along, b across, z up). */
export function turnOf(d: WayDir): (a: number, b: number, z: number) => V3 {
  switch (d) {
    case 'x+':
      return (a, b, z) => [a, b, z];
    case 'x-':
      return (a, b, z) => [-a, -b, z];
    case 'y+':
      return (a, b, z) => [-b, a, z];
    default:
      return (a, b, z) => [b, -a, z];
  }
}
/** And back: the way's own for the world's (on the floor). */
export function unturnOf(d: WayDir): (x: number, y: number) => [number, number] {
  switch (d) {
    case 'x+':
      return (x, y) => [x, y];
    case 'x-':
      return (x, y) => [-x, -y];
    case 'y+':
      return (x, y) => [y, -x];
    default:
      return (x, y) => [-y, x];
  }
}

/** A light frame's three ways, turned: a way's own axes in the world. */
export function axesTurned(d: WayDir, A: readonly [V3, V3, V3] = XYZ): [V3, V3, V3] {
  const T = turnOf(d);
  return A.map((v) => T(v[0], v[1], v[2])) as [V3, V3, V3];
}

/**
 * A PICTURE OF A WAY ON, in its own frame: `w` by `h` picture pixels, the way's point on the floor at (ax, ay); what
 * lies below the floor is painted with the floor shifted up Z0 so that the painter keeps it.
 */
export class Rig {
  readonly S: Scene;
  readonly T: (a: number, b: number, z: number) => V3;
  readonly un: (x: number, y: number) => [number, number];
  constructor(readonly w: number, readonly h: number, readonly ax: number, readonly ay: number, readonly d: WayDir, readonly Z0 = 0) {
    this.S = new Scene(new Px(w, h), ax, ay + Z0);
    this.T = turnOf(d);
    this.un = unturnOf(d);
  }
  /** A point of the way's own frame, in the painter's world. */
  P(a: number, b: number, z: number): V3 {
    const p = this.T(a, b, z);
    return [p[0], p[1], p[2] + this.Z0];
  }
  /** A way of the way's own frame (no shift). */
  V(v: readonly number[]): V3 {
    return this.T(v[0], v[1], v[2]);
  }
  /** The axes, the way's own, in the world. */
  A(A: readonly [V3, V3, V3]): [V3, V3, V3] {
    return [this.V(A[0]), this.V(A[1]), this.V(A[2])];
  }
  /** The point of the floor (z 0, the way's own a and b) seen through the middle of pixel (x, y). */
  floorAt(x: number, y: number): [number, number] {
    const sx = (x + 0.5 - this.ax) / 0.8;
    const sy = (y + 0.5 - this.ay) / 0.4;
    return this.un((sx + sy) / 2, (sy - sx) / 2);
  }
  box(c: readonly number[], A: readonly [V3, V3, V3], r: V3, shade: (face: number, u: number, v: number, n: V3) => string | null, id: number): void {
    this.S.box(this.P(c[0], c[1], c[2]), this.A(A), r, shade, id);
  }
  quad(q: readonly (readonly number[])[], shade: (u: number, v: number, w: V3) => string | null, id: number): void {
    this.S.quad([this.P(q[0][0], q[0][1], q[0][2]), this.P(q[1][0], q[1][1], q[1][2]), this.P(q[2][0], q[2][1], q[2][2]), this.P(q[3][0], q[3][1], q[3][2])], shade, id);
  }
  egg(c: readonly number[], A: readonly [V3, V3, V3], r: V3, shade: (n: V3, w: V3) => string | null, id: number): void {
    this.S.egg(this.P(c[0], c[1], c[2]), this.A(A), r, shade, id);
  }
  ball(c: readonly number[], r: number, ramp: Ramp, id: number, bias = 0): void {
    this.S.ball(this.P(c[0], c[1], c[2]), r, ramp, id, undefined, bias);
  }
  /** A rod from a to b (the painter's own, painted in a little picture its own size: the painter's makes one the whole picture's size each time). */
  rod(a: readonly number[], b: readonly number[], r0: number, r1: number, ramp: Ramp, id: number): void {
    rodIn(this.S, this.P(a[0], a[1], a[2]), this.P(b[0], b[1], b[2]), r0, r1, ramp, id);
  }
  /** Keep only what is seen through the opening (`open(a, b)`: whether that point of the floor is open). */
  under(open: (a: number, b: number) => boolean): void {
    const p = this.S.p;
    for (let y = 0; y < p.h; y++) {
      for (let x = 0; x < p.w; x++) {
        if (!p.get(x, y)) continue;
        const [a, b] = this.floorAt(x, y);
        if (!open(a, b)) {
          p.erase(x, y);
          this.S.id[y * p.w + x] = -1;
          this.S.z[y * p.w + x] = -Infinity;
        }
      }
    }
  }
  /** A copy of this rig as it is now (its picture and its depths), to paint a frame's moving things on. */
  copy(): Rig {
    const r = new Rig(this.w, this.h, this.ax, this.ay, this.d, this.Z0);
    r.S.p.blit(this.S.p, 0, 0);
    r.S.z.set(this.S.z);
    r.S.id.set(this.S.id);
    r.S.hz.set(this.S.hz);
    return r;
  }
}

/** A ROD in a painter in depth, as Scene.rod paints one, in a little picture round it only. */
export function rodIn(S: Scene, a: V3, b: V3, r0: number, r1: number, ramp: Ramp, id: number): void {
  const [x0, y0] = S.at(a);
  const [x1, y1] = S.at(b);
  if (![x0, y0, x1, y1].every(Number.isFinite)) return;
  const m = Math.ceil(Math.max(r0, r1) * 1.6) + 3;
  const bx = Math.floor(Math.min(x0, x1)) - m;
  const by = Math.floor(Math.min(y0, y1)) - m;
  const bw = Math.ceil(Math.max(x0, x1)) + m - bx;
  const bh = Math.ceil(Math.max(y0, y1)) + m - by;
  if (bx + bw < 0 || by + bh < 0 || bx > S.p.w || by > S.p.h) return;
  const tmp = new Px(bw, bh);
  limb(tmp, x0 - bx, y0 - by, x1 - bx, y1 - by, r0 * 1.1, r1 * 1.1, ramp);
  const d0 = dot(a, TOWARD3) + (r0 + r1) / 2;
  const d1 = dot(b, TOWARD3) + (r0 + r1) / 2;
  const L2 = (x1 - x0) ** 2 + (y1 - y0) ** 2 || 1;
  for (let y = 0; y < bh; y++) {
    for (let x = 0; x < bw; x++) {
      const c = tmp.get(x, y);
      if (!c) continue;
      const X = x + bx;
      const Y = y + by;
      const t = Math.max(0, Math.min(1, ((X + 0.5 - x0) * (x1 - x0) + (Y + 0.5 - y0) * (y1 - y0)) / L2));
      const w = add(a, mul(sub(b, a), t));
      if (w[2] < -0.3) continue;
      S.put(X, Y, d0 + (d1 - d0) * t, c, id, w[2]);
    }
  }
}
const TOWARD3: V3 = [0.61, 0.61, 0.5];

/** Finish pictures painted in rigs: their seams, the indigo seam round each, the first under the rest; as a Sprite anchored at the way's point. */
export function finishRigs(rigs: readonly Rig[]): Sprite {
  const r0 = rigs[0];
  for (const r of rigs) r.S.seams();
  return compose(null, rigs.map((r) => r.S.p)).sprite(r0.ax, r0.ay, GRAIN);
}
/** A picture with nothing in it, the size of a rig's, anchored as it is. */
export function emptyOf(r: Rig): Sprite {
  return new Px(r.w, r.h).sprite(r.ax, r.ay, GRAIN);
}

// =================================================================================================
// THINGS THAT FALL: blocks (boxes) turning and tumbling, striking the ground and bouncing, sliding and coming to rest.

/** How fast things fall: as floor 4's loose things (art/floor4.ts FALL), picture pixels a frame, each frame. */
export const G = 1.0;

/** A block loose in a film, in the way's own frame: its middle, its axes (turned), its half sizes; how it moves and turns (an axis times how far a frame). */
export interface Block {
  c: V3;
  R: [V3, V3, V3];
  r: V3;
  v: V3;
  w: V3;
  free: boolean;
  still: number;
  /** How many frames running it has been on the ground. */
  touching: number;
  struck: { f: number; vz: number }[];
  /** How it bounces (0..1) and how hard it grips the ground. */
  e: number;
  mu: number;
}
export function block(c: V3, r: V3, R: [V3, V3, V3] = [[1, 0, 0], [0, 1, 0], [0, 0, 1]]): Block {
  return { c, R, r, v: [0, 0, 0], w: [0, 0, 0], free: false, still: 0, touching: 0, struck: [], e: 0.22, mu: 0.55 };
}
export const copyBlock = (b: Block): Block => ({ ...b, c: [...b.c] as V3, R: b.R.map((x) => [...x] as V3) as [V3, V3, V3], r: [...b.r] as V3, v: [...b.v] as V3, w: [...b.w] as V3, struck: [...b.struck] });
/** The eight corners of a block, where they are. */
export function cornersOf(b: Block): V3[] {
  const out: V3[] = [];
  for (const s0 of [-1, 1]) for (const s1 of [-1, 1]) for (const s2 of [-1, 1]) out.push(add(b.c, add(add(mul(b.R[0], s0 * b.r[0]), mul(b.R[1], s1 * b.r[1])), mul(b.R[2], s2 * b.r[2]))));
  return out;
}
/** Its middle points of the edges and faces too, so that an edge lying across a hump is held up by it. */
function contactsOf(b: Block): V3[] {
  const out = cornersOf(b);
  for (let i = 0; i < 3; i++) {
    for (const s of [-1, 1]) {
      const j = (i + 1) % 3;
      const k = (i + 2) % 3;
      for (const t of [-1, 1]) out.push(add(b.c, add(mul(b.R[i], s * b.r[i]), mul(b.R[j], t * b.r[j]))));
      out.push(add(b.c, add(mul(b.R[i], s * b.r[i]), mul(b.R[k], 0))));
    }
  }
  return out;
}
/** How a block turns: its reach squared, as a stand-in for its weight's spread (a box's own, of one weight). */
const spreadOf = (b: Block): number => (b.r[0] ** 2 + b.r[1] ** 2 + b.r[2] ** 2) / 3;

/**
 * ONE FRAME OF THE LOOSE BLOCKS: each falls and turns; where any of its corners goes into the ground (`groundAt(a, b)`:
 * how high the ground is there) it is pushed out and struck back, turned about where it struck, its slide gripped; it
 * comes to rest. Blocks against blocks: pushed apart as balls of their smallest reach (they are not meant to meet).
 */
export function stepBlocks(bs: Block[], f: number, groundAt: (a: number, b: number) => number): void {
  for (const b of bs) {
    if (!b.free || b.still > 6) continue;
    b.v = [b.v[0], b.v[1], b.v[2] - G];
    b.c = add(b.c, b.v);
    const ang = Math.hypot(b.w[0], b.w[1], b.w[2]);
    if (ang > 1e-6) {
      const k = mul(b.w, 1 / ang);
      b.R = b.R.map((x) => norm(rot(x, k, ang))) as [V3, V3, V3];
      // (kept square)
      b.R[2] = norm(cross(b.R[0], b.R[1]));
      b.R[1] = norm(cross(b.R[2], b.R[0]));
    }
    const I = spreadOf(b) * 0.9;
    let touched = false;
    for (let it = 0; it < 3; it++) {
      // the deepest point in the ground
      let deep = 0;
      let at: V3 | null = null;
      for (const p of contactsOf(b)) {
        const pen = groundAt(p[0], p[1]) - p[2];
        if (pen > deep) {
          deep = pen;
          at = p;
        }
      }
      if (!at) break;
      touched = true;
      b.c = [b.c[0], b.c[1], b.c[2] + deep];
      at = [at[0], at[1], at[2] + deep];
      const rc = sub(at, b.c);
      const vc = add(b.v, cross(b.w, rc));
      if (vc[2] >= 0) continue;
      // (a strike: coming down hard after a while off the ground, not the knocks of settling)
      if (vc[2] < -2.4 && it === 0 && b.touching === 0) b.struck.push({ f, vz: vc[2] });
      const n: V3 = [0, 0, 1];
      const rn = cross(rc, n);
      const kk = 1 + dot(rn, rn) / I;
      const e = vc[2] < -2.5 ? b.e : 0;
      const j = (-(1 + e) * vc[2]) / kk;
      b.v = add(b.v, mul(n, j));
      b.w = add(b.w, mul(cross(rc, mul(n, j)), 1 / I));
      // the slide, gripped
      const vt: V3 = [vc[0], vc[1], 0];
      const st = Math.hypot(vt[0], vt[1]);
      if (st > 1e-4) {
        const td = mul(vt, -1 / st);
        const rt = cross(rc, td);
        const kt = 1 + dot(rt, rt) / I;
        const jt = Math.min(b.mu * j, st / kt);
        b.v = add(b.v, mul(td, jt));
        b.w = add(b.w, mul(cross(rc, mul(td, jt)), 1 / I));
      }
    }
    b.touching = touched ? b.touching + 1 : b.touching > 0 && b.touching < 4 ? b.touching : 0;
    if (touched) {
      // (on the ground it grinds to a stop: its turning and sliding worn away)
      const k = b.touching > 3 ? 0.86 : 0.95;
      b.w = mul(b.w, k);
      b.v = [b.v[0] * k, b.v[1] * k, b.v[2]];
    }
    b.w = mul(b.w, 0.995);
    const slow = Math.hypot(b.v[0], b.v[1]) < 0.5 && Math.abs(b.v[2]) < 1.2 && Math.hypot(b.w[0], b.w[1], b.w[2]) < 0.015;
    b.still = touched && slow ? b.still + 1 : 0;
    if (b.still > 4) {
      b.v = [0, 0, 0];
      b.w = [0, 0, 0];
      b.still = 7;
    }
  }
  // (apart)
  for (let i = 0; i < bs.length; i++) {
    for (let j = i + 1; j < bs.length; j++) {
      const A = bs[i];
      const B = bs[j];
      if (!A.free && !B.free) continue;
      const ra = Math.min(...A.r) * 1.1;
      const rb = Math.min(...B.r) * 1.1;
      const d = sub(A.c, B.c);
      const dist = Math.hypot(d[0], d[1], d[2]);
      if (dist >= ra + rb || dist < 1e-6) continue;
      const nn = mul(d, 1 / dist);
      const push = ra + rb - dist;
      const sa = !A.free ? 0 : !B.free ? 1 : 0.5;
      A.c = add(A.c, mul(nn, push * sa));
      B.c = sub(B.c, mul(nn, push * (1 - sa)));
      const rel = dot(sub(A.v, B.v), nn);
      if (rel < 0) {
        if (A.free) A.v = sub(A.v, mul(nn, rel * sa * 1.2));
        if (B.free) B.v = add(B.v, mul(nn, rel * (1 - sa) * 1.2));
      }
    }
  }
}

/** Let a block go, pushed `v`, turning `w` (an axis times how far a frame, the way's own). */
export function letBlockGo(b: Block, v: V3, w: V3): void {
  b.free = true;
  b.still = 0;
  b.touching = 0;
  b.v = v;
  b.w = w;
}

/** Paint a block: its middle and axes from the way's own frame; its faces by `shade(face, u, v, n)` (faces 0..5 for +R0, -R0, +R1, -R1, +R2, -R2). */
export function paintBlock(rig: Rig, b: Block, shade: (face: number, u: number, v: number, n: V3) => string | null, id: number, jog: V3 = [0, 0, 0]): void {
  rig.box(add(b.c, jog), b.R, b.r, shade, id);
}

// =================================================================================================
// GRIT AND CHIPS: little stones flung, falling and bouncing, rolling to rest.

export interface Chip {
  p: V3;
  v: V3;
  r: number;
  f0: number;
  still: boolean;
  seed: number;
}
export const chip = (f0: number, p: V3, v: V3, r: number, seed: number): Chip => ({ p, v, r, f0, still: false, seed });
export function stepChips(cs: Chip[], f: number, groundAt: (a: number, b: number) => number): void {
  for (const c of cs) {
    if (f < c.f0 || c.still) continue;
    c.v = [c.v[0], c.v[1], c.v[2] - G];
    c.p = add(c.p, c.v);
    const g = groundAt(c.p[0], c.p[1]) + c.r * 0.7;
    if (c.p[2] < g) {
      c.p = [c.p[0], c.p[1], g];
      if (c.v[2] < -2) c.v = [c.v[0] * 0.6, c.v[1] * 0.6, -c.v[2] * 0.35];
      else {
        c.v = [c.v[0] * 0.7, c.v[1] * 0.7, 0];
        if (Math.hypot(c.v[0], c.v[1]) < 0.2) c.still = true;
      }
    }
  }
}
export function paintChips(rig: Rig, cs: readonly Chip[], f: number, ramp: Ramp, id0: number): void {
  cs.forEach((c, i) => {
    if (f < c.f0) return;
    if (c.r < 1.6) {
      const [x, y] = rig.S.at(rig.P(c.p[0], c.p[1], c.p[2]));
      const w = rig.P(c.p[0], c.p[1], c.p[2]);
      rig.S.put(Math.round(x), Math.round(y), dot(w, [0.61, 0.61, 0.5]), hash(c.seed, 1, 77) < 0.5 ? ramp[3] : ramp[2], id0 + i, w[2]);
      return;
    }
    rig.egg(c.p, XYZ, [c.r, c.r * 0.85, c.r * 0.75], (n) => toneAt(n, ramp, 0.05), id0 + i);
  });
}

// =================================================================================================
// DUST: clouds as floor 4's (art/floor4.ts cloud, cloudAt), in a ramp of the place's own (daylight dust is pale).

export { cloud, cloudAt } from './floor4';
import { cloudAt as cloudAt4 } from './floor4';
import type { Cloud } from './floor4';
export type { Cloud };
/** The dust's clouds on frame `f`, in `ramp` (as it hangs) and `low` (as it settles), soft: no seam round them. */
export function paintDust(rig: Rig, cs: readonly Cloud[], f: number, ramp: Ramp, low: Ramp, id0: number): void {
  cs.forEach((c, i) => {
    const a = cloudAt4(c, f);
    if (!a) return;
    const lobes: ReadonlyArray<readonly [number, number, number, number]> = [[0, 0, 0, 0.9], [0.55 + 0.2 * hash(c.seed, 1, 640), -0.25, 0.35, 0.62], [-0.5, 0.3 + 0.2 * hash(c.seed, 2, 640), 0.3, 0.58], [0.1, -0.1, 0.85, 0.55], [-0.2, -0.45, 0.6, 0.48], [0.35, 0.5, 0.15, 0.5]];
    for (const [dx, dy, dz, k] of lobes) {
      // (daylight's dust is thin: it is seen through, more and more as it settles and goes)
      const thick = Math.max(0.25, 0.92 - a.s * 0.55 - Math.max(0, (f - c.f0 - c.hang - c.settle) / Math.max(1, c.life - c.hang - c.settle)) * 0.4);
      rig.egg([a.c[0] + dx * a.rh, a.c[1] + dy * a.rh, a.c[2] + dz * a.rv], XYZ, [a.rh * k, a.rh * k, a.rv * k], (n, q) => {
        if (hash(Math.round(q[0] * 1.25 - q[1] * 1.25), Math.round(q[0] * 0.6 + q[1] * 0.6 - q[2]), 642) > thick) return null;
        const t = toneAt(n, a.s > 0.4 ? low : ramp, 0.05);
        return t;
      }, id0 + i);
    }
  });
}

/** A way's film: its frames (whole: what is under and what stands, as one), 30 a second; its jolts (frames); how hard each. */
export interface WayFilm {
  frames: Sprite[];
  fps: number;
  jolts: number[];
  kicks: number[];
}
/** A way on as the game stands it: shut (while the boss lives), its film (as he dies), open (after); each its two layers. */
export interface WayArt {
  shut: { under: Sprite; over: Sprite };
  film: WayFilm;
  open: { under: Sprite; over: Sprite };
  /** How far back from the way's point (tiles, toward the boss's ground) the picture is anchored: its mouth, where he goes in (0: at the point). */
  back?: number;
}
/** Where a floor begins, as the game stands it: what he came out of, its two layers. */
export interface StartArt {
  under: Sprite;
  over: Sprite;
}
