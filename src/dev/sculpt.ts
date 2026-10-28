// SCULPTED FIGURES (the art chat, 23 Oct 2026). A DEV TOOL FOR MOCK-UPS; NOTHING OF THE GAME IMPORTS IT.
//
// The owner, 23 Oct 2026, of the new classes' sketches: “make sure the characters don’t just look like circles and squares
// slapped together”. The heroes' solids (art/skin.ts) are each a ball or a rod painted on a sheet of its own, with the
// style's dark seam wherever one ends in front of another: a body built of them reads as lumps, each ringed in ink.
//
// Here a figure is SCULPTED instead: the same kinds of solid (a ball, a rod that tapers, a block with rounded edges), but
// each MELTED INTO THE NEXT of the same stuff (a smooth union of distance fields), so a shoulder runs into the arm, a
// muscle into the body under it, a jaw into the skull. It is drawn by sending a ray from the eye through each pixel
// (the game's one camera, art/skeleton.ts `project`), lit as the solids are (art/skin.ts: light from the upper left and a
// little from the eye, its five tones), shaded darker in its own creases, and inked as the style asks: round the whole
// figure, where one stuff meets another (skin and cloth), and where a part passes in front of another (an arm across the
// chest), but NOT where two parts of one stuff run into each other. Outside the ink, the friend's crisp edge of light.
//
// What is lit is the style's: three tones a material and a light and a dark beside them (`toneOf`), crisp pixels, no
// smoothing. A material may paint its own colour at a point (stripes, stitches, an eye), told where on the figure it is.

import { Px, rgba } from '../engine/px';
import { INK, edge } from '../art/kit';
import type { Ramp } from '../art/kit';
import { stage, toneOf } from '../art/skin';
import type { PaintView, Sheet, Stage } from '../art/skin';
import type { V3 } from '../art/skeleton';

/** The light, as the eye sees it (art/skin.ts's own): from the left, from above, a little from the eye's side. */
const LX = -0.52;
const LY = -0.62;
const LZ = 0.59;

/** Where a ray met a sculpted figure. */
export interface Hit {
  /** The point, in the figure's own space. */
  p: V3;
  /** The way the skin faces there (a unit, the figure's space). */
  n: V3;
  /** How much of the light it takes (before its creases darken it). */
  nl: number;
  /** The tone it is painted in (0 darkest to 4 lightest). */
  tone: number;
  /** The solid nearest there (whose stuff it is). */
  prim: Prim;
  /** The pixel. */
  x: number;
  y: number;
}

/** A material: its five tones, and if it likes a colour of its own at a point (null: its tone's). */
export interface Mat {
  ramp: Ramp;
  paint?: (h: Hit) => string | null;
  /** Takes this much of the light off all of it (under a brim, a far limb). */
  shade?: number;
  /** How dark its creases go (the share of the light taken off where it is hemmed in; the default CREASE). */
  crease?: number;
  /**
   * It grows out of what it lies on (a beard on a jaw, hair on a brow): where it meets another stuff at one depth there is
   * no ink, only a soft line of that stuff's own dark tone, as a beard's shadow on the skin (his 23 Oct, “make sure the
   * characters don’t just look like circles and squares slapped together”: a beard ringed in ink reads as a bib).
   */
  meld?: boolean;
}

interface Common {
  /** Its material (`Sculpt.mat`). */
  mat: number;
  /** Which part of the figure it belongs to: two parts of one stuff are inked where one passes in front of the other. */
  piece: string;
  /** How far it melts into what went before it of its stuff (a length of the figure; 0 for a crisp join). */
  blend: number;
  /** Half-spaces it is cut by: only what lies where dot(p, n) <= o is kept. */
  cuts?: ReadonlyArray<{ n: V3; o: number }>;
  /** It takes away from its stuff instead of adding (a socket, a groove). */
  carve?: boolean;
  /** A name to know it by in a material's painter. */
  tag?: string;
}
/** A rod that tapers: from `a` (radius `ra`) to `b` (radius `rb`), rounded at both ends. */
export interface Cone extends Common { k: 'cone'; a: V3; b: V3; ra: number; rb: number }
/** A ball: its middle and its three half-lengths, each along its own line (an egg, a plate). */
export interface Ell extends Common { k: 'ell'; c: V3; axes: readonly [V3, V3, V3] }
/** A block with rounded edges: its middle, its three half-lengths along their own lines, and how round. */
export interface Box extends Common { k: 'box'; c: V3; axes: readonly [V3, V3, V3]; round: number }
/** A flat three-cornered sheet `thick` either side of its plane (a wing's leather between two of its fingers). */
export interface Tri extends Common { k: 'tri'; a: V3; b: V3; c: V3; thick: number }
export type Prim = Cone | Ell | Box | Tri;

// (what each solid works out once: its bounds, its axes as units and lengths)
interface Ready {
  p: Prim;
  bc: V3;
  br: number;
  ua?: readonly [V3, V3, V3];
  ul?: V3;
  ba?: V3;
  bb?: number;
}

const sub = (a: V3, b: V3): V3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const dot = (a: V3, b: V3): number => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const lenOf = (a: V3): number => Math.hypot(a[0], a[1], a[2]);

/** A smooth union: `a` and `b` melted together over `k`. */
function smin(a: number, b: number, k: number): number {
  if (k <= 0) return Math.min(a, b);
  const h = Math.max(k - Math.abs(a - b), 0) / k;
  return Math.min(a, b) - h * h * k * 0.25;
}

/** A figure being sculpted: its materials and solids, in the order they were laid on. */
export class Sculpt {
  readonly mats: Mat[] = [];
  readonly prims: Prim[] = [];
  /** Marks drawn on the figure after it is lit, where their point is seen (an eye, a brow): `w` by `h` pixels from it. */
  readonly marks: { p: V3; c: string; w: number; h: number; dx: number; dy: number; through: number; on: number }[] = [];
  /** A mark: drawn if what is at its pixel is no more than `through` nearer than it (and, given `on`, is that material). */
  mark(p: V3, c: string, w = 1, h = 1, dx = 0, dy = 0, through = 1.2, on = -1): void {
    this.marks.push({ p, c, w, h, dx, dy, through, on });
  }
  /**
   * TRULY TURNED (his rulebook's Heroes 7, “Truly turned, eight ways”): the whole figure turned this many degrees to its
   * left about the floor point under it, as it is drawn; never its picture flipped. `at` gives a point of it so turned
   * (for what is drawn beside it: a flame in its hand, its smoke).
   */
  spin = 0;
  at(p: V3): V3 {
    if (!this.spin) return p;
    const a = (this.spin * Math.PI) / 180;
    const c = Math.cos(a);
    const s = Math.sin(a);
    return [p[0] * c - p[1] * s, p[0] * s + p[1] * c, p[2]];
  }
  /** A material; returns its number. */
  mat(m: Mat): number {
    this.mats.push(m);
    return this.mats.length - 1;
  }
  cone(mat: number, piece: string, a: V3, b: V3, ra: number, rb: number, blend = 1.4, more: Partial<Common> = {}): Cone {
    const p: Cone = { k: 'cone', mat, piece, blend, a, b, ra, rb, ...more };
    this.prims.push(p);
    return p;
  }
  ell(mat: number, piece: string, c: V3, axes: readonly [V3, V3, V3], blend = 1.4, more: Partial<Common> = {}): Ell {
    const p: Ell = { k: 'ell', mat, piece, blend, c, axes, ...more };
    this.prims.push(p);
    return p;
  }
  box(mat: number, piece: string, c: V3, axes: readonly [V3, V3, V3], round: number, blend = 1.0, more: Partial<Common> = {}): Box {
    const p: Box = { k: 'box', mat, piece, blend, c, axes, round, ...more };
    this.prims.push(p);
    return p;
  }
  tri(mat: number, piece: string, a: V3, b: V3, c: V3, thick: number, blend = 0.6, more: Partial<Common> = {}): Tri {
    const p: Tri = { k: 'tri', mat, piece, blend, a, b, c, thick, ...more };
    this.prims.push(p);
    return p;
  }
}

function ready(p: Prim): Ready {
  if (p.k === 'tri') {
    const c: V3 = [(p.a[0] + p.b[0] + p.c[0]) / 3, (p.a[1] + p.b[1] + p.c[1]) / 3, (p.a[2] + p.b[2] + p.c[2]) / 3];
    return { p, bc: c, br: Math.max(lenOf(sub(p.a, c)), lenOf(sub(p.b, c)), lenOf(sub(p.c, c))) + p.thick };
  }
  if (p.k === 'cone') {
    const ab = sub(p.b, p.a);
    const L = lenOf(ab);
    return {
      p,
      bc: [(p.a[0] + p.b[0]) / 2, (p.a[1] + p.b[1]) / 2, (p.a[2] + p.b[2]) / 2],
      br: L / 2 + Math.max(p.ra, p.rb),
      ba: ab,
      bb: L * L,
    };
  }
  const ul: V3 = [lenOf(p.axes[0]) || 1e-6, lenOf(p.axes[1]) || 1e-6, lenOf(p.axes[2]) || 1e-6];
  const ua = p.axes.map((v, i) => [v[0] / ul[i], v[1] / ul[i], v[2] / ul[i]] as V3) as unknown as readonly [V3, V3, V3];
  const br = p.k === 'box' ? Math.hypot(ul[0], ul[1], ul[2]) + 0.01 : Math.max(ul[0], ul[1], ul[2]);
  return { p, bc: p.c, br, ua, ul };
}

/** How far a point is from one solid's skin (less than 0 inside it). */
function dist(r: Ready, q: V3): number {
  const p = r.p;
  let d: number;
  if (p.k === 'tri') {
    d = triDist(q, p.a, p.b, p.c) - p.thick;
  } else if (p.k === 'cone') {
    // a rod that tapers, rounded at its ends (a capsule whose radius runs from ra to rb)
    const pa = sub(q, p.a);
    const ba = r.ba as V3;
    const bb = r.bb as number;
    const h = bb > 0 ? Math.max(0, Math.min(1, dot(pa, ba) / bb)) : 0;
    const dx = pa[0] - ba[0] * h;
    const dy = pa[1] - ba[1] * h;
    const dz = pa[2] - ba[2] * h;
    d = Math.sqrt(dx * dx + dy * dy + dz * dz) - (p.ra + (p.rb - p.ra) * h);
  } else {
    const ua = r.ua as readonly [V3, V3, V3];
    const ul = r.ul as V3;
    const v = sub(q, p.c);
    const x = dot(v, ua[0]);
    const y = dot(v, ua[1]);
    const z = dot(v, ua[2]);
    if (p.k === 'ell') {
      const x0 = x / ul[0];
      const y0 = y / ul[1];
      const z0 = z / ul[2];
      const k0 = Math.sqrt(x0 * x0 + y0 * y0 + z0 * z0);
      const x1 = x0 / ul[0];
      const y1 = y0 / ul[1];
      const z1 = z0 / ul[2];
      const k1 = Math.sqrt(x1 * x1 + y1 * y1 + z1 * z1);
      d = k1 > 1e-9 ? (k0 * (k0 - 1)) / k1 : -Math.min(ul[0], ul[1], ul[2]);
    } else {
      const rr = Math.min(p.round, ul[0], ul[1], ul[2]);
      const qx = Math.abs(x) - ul[0] + rr;
      const qy = Math.abs(y) - ul[1] + rr;
      const qz = Math.abs(z) - ul[2] + rr;
      const mx = Math.max(qx, 0);
      const my = Math.max(qy, 0);
      const mz = Math.max(qz, 0);
      d = Math.sqrt(mx * mx + my * my + mz * mz) + Math.min(Math.max(qx, qy, qz), 0) - rr;
    }
  }
  if (p.cuts) for (const c of p.cuts) d = Math.max(d, dot(q, c.n) - c.o);
  return d;
}

/** How far a point is from a triangle (Inigo Quilez's way). */
const triCr = (x: V3, y: V3): V3 => [x[1] * y[2] - x[2] * y[1], x[2] * y[0] - x[0] * y[2], x[0] * y[1] - x[1] * y[0]];
const triSg = (v: number): number => (v > 0 ? 1 : v < 0 ? -1 : 0);
const triSeg = (e: V3, w: V3): number => {
  const t = Math.max(0, Math.min(1, dot(e, w) / (dot(e, e) || 1e-9)));
  const x = e[0] * t - w[0];
  const y = e[1] * t - w[1];
  const z = e[2] * t - w[2];
  return Math.sqrt(x * x + y * y + z * z);
};
function triDist(p: V3, a: V3, b: V3, c: V3): number {
  const ba = sub(b, a);
  const pa = sub(p, a);
  const cb = sub(c, b);
  const pb = sub(p, b);
  const ac = sub(a, c);
  const pc = sub(p, c);
  const nor = triCr(ba, ac);
  const inside = triSg(dot(triCr(ba, nor), pa)) + triSg(dot(triCr(cb, nor), pb)) + triSg(dot(triCr(ac, nor), pc)) >= 2;
  if (inside) {
    const nn = dot(nor, nor) || 1e-9;
    return Math.abs(dot(nor, pa)) / Math.sqrt(nn);
  }
  return Math.min(triSeg(ba, pa), triSeg(cb, pb), triSeg(ac, pc));
}

/** How far a point is from one solid's skin (for a check: is an arm inside the trunk?). */
export function primDist(p: Prim, q: V3): number {
  return dist(ready(p), q);
}
/** How low a solid reaches (its lowest point's height over the floor), for a check that nothing sinks into the floor. */
export function primLow(p: Prim): number {
  let low: number;
  if (p.k === 'cone') low = Math.min(p.a[2] - p.ra, p.b[2] - p.rb);
  else if (p.k === 'tri') low = Math.min(p.a[2], p.b[2], p.c[2]) - p.thick;
  else {
    const reach = p.k === 'ell' ? Math.hypot(p.axes[0][2], p.axes[1][2], p.axes[2][2]) : Math.abs(p.axes[0][2]) + Math.abs(p.axes[1][2]) + Math.abs(p.axes[2][2]);
    low = p.c[2] - reach;
  }
  // (a cut may take away its lowest part: a coat's hem cut level above the floor)
  if (p.cuts) for (const c of p.cuts) if (c.n[2] < -0.99) low = Math.max(low, -c.o);
  return low;
}

/** The whole figure's distance field, worked out per material. */
export class Field {
  readonly rs: Ready[];
  readonly byMat: Ready[][];
  readonly carves: Ready[][];
  readonly kmax: number;
  constructor(readonly sc: Sculpt) {
    this.rs = sc.prims.map(ready);
    this.byMat = sc.mats.map(() => []);
    this.carves = sc.mats.map(() => []);
    for (const r of this.rs) (r.p.carve ? this.carves : this.byMat)[r.p.mat].push(r);
    this.kmax = Math.max(0.01, ...sc.prims.map((p) => p.blend));
  }
  /** The distance of a material's skin from a point (bounded by `cap`: beyond it, the answer need only be as big). */
  ofMat(m: number, q: V3, cap = Infinity): number {
    let d = Infinity;
    for (const r of this.byMat[m]) {
      // (too far to matter: its bounding ball further than what is already found, squared to spare a root)
      const far = Math.min(d, cap) + r.p.blend + r.br;
      if (far < 0) continue;
      const ex = q[0] - r.bc[0];
      const ey = q[1] - r.bc[1];
      const ez = q[2] - r.bc[2];
      if (ex * ex + ey * ey + ez * ez > far * far) continue;
      d = d === Infinity ? dist(r, q) : smin(d, dist(r, q), r.p.blend);
    }
    if (d === Infinity) return cap === Infinity ? 1e6 : cap + 1;
    for (const r of this.carves[m]) {
      const far = r.p.blend + 0.01 + r.br;
      const ex = q[0] - r.bc[0];
      const ey = q[1] - r.bc[1];
      const ez = q[2] - r.bc[2];
      if (ex * ex + ey * ey + ez * ez > far * far) continue;
      const c = -dist(r, q);
      // a smooth max: the carve taken out of the material, its edge eased over its blend
      const k = r.p.blend;
      if (k <= 0) d = Math.max(d, c);
      else {
        const h = Math.max(k - Math.abs(d - c), 0) / k;
        d = Math.max(d, c) + h * h * k * 0.25;
      }
    }
    return d;
  }
  /** The nearest skin of any material, and whose. */
  at(q: V3): { d: number; m: number } {
    let d = Infinity;
    let m = -1;
    for (let i = 0; i < this.byMat.length; i++) {
      const di = this.ofMat(i, q, d);
      if (di < d) {
        d = di;
        m = i;
      }
    }
    return { d, m };
  }
  /** The solid of a material nearest a point (whose part it is). */
  nearest(m: number, q: V3): Prim {
    let best = Infinity;
    let p = this.byMat[m][0]?.p ?? this.rs[0].p;
    for (const r of this.byMat[m]) {
      const lb = Math.hypot(q[0] - r.bc[0], q[1] - r.bc[1], q[2] - r.bc[2]) - r.br;
      if (lb > best) continue;
      const d = dist(r, q);
      if (d < best) {
        best = d;
        p = r.p;
      }
    }
    return p;
  }
}

// ---------------------------------------------------------------------------------------------
// THE FIELD, FAST (28 Oct 2026). The game is to paint every hero frame at load time, and the plain `Field` above takes a
// sixth of a second and more for one frame (seconds, for the demon), on a phone some times that. `Fast` works out THE
// VERY SAME NUMBERS, to the last bit, so every picture is the same to the pixel. It is quicker because:
//  1. its sums are done on numbers laid out flat, with nothing made and thrown away for each point it is asked of;
//  2. it asks of each point only the solids that can matter there. Space is cut into small cells (a few pixels square, a
//     few lengths deep), and each cell keeps a list of its solids: every solid but those that `Field` itself, at every
//     point of that cell, would pass over (its bounding ball further from the point than what is already found, by the
//     solid's blend). Which those are is PROVED, never guessed: what `Field` has already found when it comes to a solid is
//     never more than the most that some solid it looked at before could have left found anywhere in the cell (one looked
//     at and passed over leaves it less than its ball's reach; one taken in leaves it no more than its own distance). A
//     carve takes away and may raise what is found, so a material carved in a cell lends nothing to the proof for the
//     materials after it there. A cell's list is drawn from the list of the bigger cell it lies in;
//  3. it skips the sums whose answer is known without them, again only where that is proved: a solid whose skin is
//     further than what is found by its blend leaves it as it was, to the bit; a material that can give nothing nearer
//     than the nearest skin already found (in `at`) changes nothing; and where a solid nearer than what went before it by
//     its blend is taken in, what went before it is forgotten (what is found becomes its distance), so those before it
//     need not be asked at all. How near a solid can be is bounded for its whole cell from its distance at the cell's
//     middle, and at each point from the flat that touches its distance there (a rod's line, a block and a sheet bulge
//     nowhere inward, so their distance never falls below that flat; a ball's, as `dist` has it, is bounded through how
//     far out of it the point is, measured along its own half-lengths);
//  4. a pixel whose ray no skin of any material comes near enough to (by its blends) to be met is not marched;
//  5. what a material was found to be at the last point it was looked over at, in a cell, holds at the next point there,
//     less how far the point has gone times how fast any of its bounds can change: how near it can come, and the solid
//     to begin at (`Fast.ofSeg`); so mostly it is not looked over again.
// What is left is looked at in the same order and with the same sums as `Field` looks at every solid, so what it finds is
// the same. `SCULPT_SPEED.fast = false` draws with the plain field (to check one against the other).

/** Draw with the fast field (the same pictures, to the pixel), or the plain one. */
export const SCULPT_SPEED = { fast: true };
/**
 * The cells' size: pixels square, lengths deep (as `Stage.near` measures), and how many of them a side the bigger cells
 * their lists are drawn from are, the smallest first; for a figure of more than `many` solids, `manyCell`. A material of
 * at least `over` solids in a list is looked over at the point first (`Fast.ofSeg`); a point of the march further than
 * `far` times the next size's reach from every skin is asked from that size's list.
 */
export const CELL = { ts: 4, dt: 4, sizes: [4], over: 5, far: 2, many: 250, manyCell: { ts: 6, dt: 6, sizes: [2, 4] } };

const KC = 0;
const KE = 1;
const KB = 2;
const KT = 3;
/** Numbers kept for each solid (`Fast.g`). */
const GS = 40;
/** What a bound may be out by in its last bits, and more (lengths of a figure are tens, not millions). */
const SLACK = 1e-6;
/**
 * Numbers kept for each solid of a list (`Arena.F`): the least its distance can be where the list holds; its blend; the
 * least its distance can be AT A POINT of where the list holds, as a flat sum of the point (v = a + gx x + gy y + gz z,
 * the least being v times one number where v is not less than nothing, and times another where it is: six numbers); the
 * least what is found can come to from it on, if it was no less before; its ball's reach, and its middle; the most its
 * distance can be where the list holds; one over its blend. (Sixteen places, the first eight what a solid is looked over
 * by.)
 */
const FS = 8;
/** And the cold ones, kept apart (`Arena.C`): the least what is found can come to from it on, if it was no less before; its ball's reach, and its middle; the most its distance can be where the list holds; one over its blend. */
const CS = 8;
// (FS and CS the same, so one offset serves both)
/** (how near each solid of the material being asked can be, at the point it is asked of) */
let LQ = new Float64Array(256);
/** Numbers kept for each material of a list (`Arena.S`): its number; its first solid, after its last solid, after its last carve; the solid to begin at. */
const SS = 5;
/** And (`Arena.SF`): the least the material can give where the list holds; the least `Field` can have found when it comes to the solid to begin at. */
const SFS = 2;
/**
 * And (`Arena.W`), what was found when the material was last looked over at a point (`Fast.ofSeg`): the point; the least
 * the material could give there; the solid that set what is found to its own distance there, and the least what is found
 * could be when it came to it (-1: none); the solid looked over from (-1: never looked over); and how fast anything
 * looked over can change from point to point.
 */
const WS = 8;

/**
 * THE LISTS OF ONE DRAWING, kept flat: a list is a run of materials (`T`: its first and how many), each material a run of
 * its solids and carves (`S`, `SF`), each solid its number (`I`) and what is known of it where the list holds (`F`). Kept
 * for the next drawing (a pool, should one drawing be made inside another).
 */
class Arena {
  I = new Int32Array(1 << 14);
  F = new Float64Array(FS << 14);
  C = new Float64Array(CS << 14);
  S = new Int32Array(SS << 12);
  SF = new Float64Array(SFS << 12);
  W = new Float64Array(WS << 12);
  T = new Int32Array(2 << 12);
  ni = 0;
  ns = 0;
  nl = 1;
  reset(): void {
    this.ni = 0;
    this.ns = 0;
    this.nl = 1;
  }
  /** Room for this many more solids and materials. */
  room(items: number, segs: number): void {
    if (this.ni + items > this.I.length) {
      const n = Math.max(this.I.length * 2, this.ni + items);
      const I = new Int32Array(n);
      I.set(this.I.subarray(0, this.ni));
      this.I = I;
      const F = new Float64Array(n * FS);
      F.set(this.F.subarray(0, this.ni * FS));
      this.F = F;
      const C = new Float64Array(n * CS);
      C.set(this.C.subarray(0, this.ni * CS));
      this.C = C;
    }
    if (this.ns + segs > this.S.length / SS) {
      const n = Math.max((this.S.length / SS) * 2, this.ns + segs);
      const S = new Int32Array(n * SS);
      S.set(this.S.subarray(0, this.ns * SS));
      this.S = S;
      const SF = new Float64Array(n * SFS);
      SF.set(this.SF.subarray(0, this.ns * SFS));
      this.SF = SF;
      const W = new Float64Array(n * WS);
      W.set(this.W.subarray(0, this.ns * WS));
      this.W = W;
    }
  }
  /** A new list of the materials from `s0`, `n` of them. */
  list(s0: number, n: number): number {
    if (this.nl * 2 + 2 > this.T.length) {
      const T = new Int32Array(this.T.length * 2);
      T.set(this.T);
      this.T = T;
    }
    this.T[this.nl * 2] = s0;
    this.T[this.nl * 2 + 1] = n;
    return this.nl++;
  }
}
const ARENAS: Arena[] = [];

/** The smooth union, as `smin` has it (a bound kept by it: never more than either, and no less for either being more). */
function sminOf(a: number, b: number, k: number): number {
  if (k <= 0) return Math.min(a, b);
  const h = Math.max(k - Math.abs(a - b), 0) / k;
  return Math.min(a, b) - h * h * k * 0.25;
}

class Fast {
  readonly n: number;
  readonly nm: number;
  readonly kind: Uint8Array;
  readonly matOf: Int32Array;
  readonly carve: Uint8Array;
  readonly blend: Float64Array;
  readonly br: Float64Array;
  readonly bc: Float64Array;
  readonly g: Float64Array;
  readonly cut0: Int32Array;
  readonly cut1: Int32Array;
  readonly cutv: Float64Array;
  /** A carve's reach (as `Field.ofMat` works it out). */
  readonly farC: Float64Array;
  /** One over each solid's blend (none: nothing). */
  readonly inv: Float64Array;
  /** The first of the materials, when the first ones have no solids (they give 1e6 at once), or -1. */
  readonly lead: number;
  /** For each material, the solid `Field.nearest` starts from. */
  readonly first: Int32Array;
  /** Every solid but the carves, in `Field`'s order; where each material's begin in it. */
  readonly order: Int32Array;
  readonly mat0: Int32Array;
  /** The list of every solid, and each material's own. */
  readonly full: number;
  readonly fullMat: Int32Array;
  /** The material `at` found nearest. */
  m = -1;
  constructor(
    readonly f: Field,
    readonly A: Arena,
  ) {
    const rs = f.rs;
    const n = (this.n = rs.length);
    this.nm = f.byMat.length;
    this.kind = new Uint8Array(n);
    this.matOf = new Int32Array(n);
    this.carve = new Uint8Array(n);
    this.blend = new Float64Array(n);
    this.br = new Float64Array(n);
    this.bc = new Float64Array(n * 3);
    this.g = new Float64Array(n * GS);
    this.cut0 = new Int32Array(n);
    this.cut1 = new Int32Array(n);
    this.farC = new Float64Array(n);
    this.inv = new Float64Array(n);
    const cuts: number[] = [];
    const g = this.g;
    rs.forEach((r, i) => {
      const p = r.p;
      this.kind[i] = p.k === 'cone' ? KC : p.k === 'ell' ? KE : p.k === 'box' ? KB : KT;
      this.matOf[i] = p.mat;
      this.carve[i] = p.carve ? 1 : 0;
      this.blend[i] = p.blend;
      this.br[i] = r.br;
      this.bc[i * 3] = r.bc[0];
      this.bc[i * 3 + 1] = r.bc[1];
      this.bc[i * 3 + 2] = r.bc[2];
      this.farC[i] = p.blend + 0.01 + r.br;
      this.inv[i] = p.blend > 0 ? 1 / p.blend : 0;
      const o = i * GS;
      if (p.k === 'cone') {
        const ba = r.ba as V3;
        g.set([p.a[0], p.a[1], p.a[2], ba[0], ba[1], ba[2], r.bb as number, p.ra, p.rb - p.ra, Math.min(p.ra, p.rb), Math.max(p.ra, p.rb), p.b[0], p.b[1], p.b[2]], o);
      } else if (p.k === 'tri') {
        const ba = sub(p.b, p.a);
        const cb = sub(p.c, p.b);
        const ac = sub(p.a, p.c);
        const nor = triCr(ba, ac);
        const c1 = triCr(ba, nor);
        const c2 = triCr(cb, nor);
        const c3 = triCr(ac, nor);
        g.set([...p.a, ...p.b, ...p.c, ...ba, ...cb, ...ac, ...nor, ...c1, ...c2, ...c3, Math.sqrt(dot(nor, nor) || 1e-9), dot(ba, ba) || 1e-9, dot(cb, cb) || 1e-9, dot(ac, ac) || 1e-9, p.thick], o);
      } else {
        const ua = r.ua as readonly [V3, V3, V3];
        const ul = r.ul as V3;
        // (how much its three lines, when not square to each other, stretch a length, at most and at least)
        let most = 0;
        let least = Infinity;
        for (let a = 0; a < 3; a++) {
          let off = 0;
          for (let b = 0; b < 3; b++) if (b !== a) off += Math.abs(dot(ua[a], ua[b]));
          const own = dot(ua[a], ua[a]);
          most = Math.max(most, own + off);
          least = Math.min(least, own - off);
        }
        const sig = Math.sqrt(most) * (1 + 1e-9);
        const sigMin = Math.sqrt(Math.max(0, least)) * (1 - 1e-9);
        const rr = Math.min(p.k === 'box' ? p.round : 0, ul[0], ul[1], ul[2]);
        g.set([p.c[0], p.c[1], p.c[2], ...ua[0], ...ua[1], ...ua[2], ul[0], ul[1], ul[2], p.k === 'box' ? rr : Math.min(ul[0], ul[1], ul[2]), sig, Math.max(ul[0], ul[1], ul[2]), sigMin, p.k === 'box' && rr >= 0 ? Math.hypot(ul[0], ul[1], ul[2]) : -1], o);
      }
      this.cut0[i] = cuts.length / 4;
      if (p.cuts) for (const c of p.cuts) cuts.push(c.n[0], c.n[1], c.n[2], c.o);
      this.cut1[i] = cuts.length / 4;
    });
    this.cutv = new Float64Array(cuts);
    let lead = -1;
    for (let m = 0; m < this.nm && !f.byMat[m].length; m++) lead = 0;
    this.lead = f.byMat.some((b) => b.length) ? lead : -1;
    const index = new Map<Ready, number>();
    rs.forEach((r, i) => index.set(r, i));
    this.first = new Int32Array(this.nm).map((_, m) => (f.byMat[m].length ? (index.get(f.byMat[m][0]) as number) : 0));
    this.order = Int32Array.from(f.byMat.flatMap((b) => b.map((r) => index.get(r) as number)));
    this.mat0 = new Int32Array(this.nm + 1);
    for (let m = 0; m < this.nm; m++) this.mat0[m + 1] = this.mat0[m] + f.byMat[m].length;
    // (the lists that know nothing of where they hold: every solid asked)
    A.room(n * 2, this.nm * 2);
    const plain = (ids: number[]): void => {
      for (const i of ids) {
        const o = A.ni * FS;
        A.I[A.ni++] = i;
        A.F.set([-Infinity, this.blend[i], -Infinity, 0, 0, 0, 1, 1], o);
        A.C.set([-Infinity, this.br[i], this.bc[i * 3], this.bc[i * 3 + 1], this.bc[i * 3 + 2], Infinity, this.inv[i], 0], (o / FS) * CS);
      }
    };
    const seg = (m: number, prims: number[], carves: number[]): void => {
      const s = A.ns++;
      const i0 = A.ni;
      plain(prims);
      plain(carves);
      A.S.set([m, i0, i0 + prims.length, A.ni, i0], s * SS);
      A.SF[s * SFS] = -Infinity;
      A.SF[s * SFS + 1] = Infinity;
      A.W[s * WS + 6] = -1;
      A.W[s * WS + 7] = -1;
    };
    const ids = (rr: Ready[]): number[] => rr.map((r) => index.get(r) as number);
    const s0 = A.ns;
    for (let m = 0; m < this.nm; m++) if (f.byMat[m].length) seg(m, ids(f.byMat[m]), ids(f.carves[m]));
    this.full = A.list(s0, A.ns - s0);
    this.fullMat = new Int32Array(this.nm);
    for (let m = 0; m < this.nm; m++) {
      const s = A.ns;
      seg(m, ids(f.byMat[m]), ids(f.carves[m]));
      this.fullMat[m] = A.list(s, 1);
    }
  }
  /** Can it be trusted with this figure (every number of it a number)? */
  sound(): boolean {
    for (const a of [this.g, this.bc, this.br, this.blend, this.cutv]) for (let i = 0; i < a.length; i++) if (!Number.isFinite(a[i])) return false;
    return true;
  }

  /** `dist`: how far a point is from one solid's skin. The same sums in the same order. */
  dist(i: number, x: number, y: number, z: number): number {
    const g = this.g;
    const o = i * GS;
    let d: number;
    const k = this.kind[i];
    if (k === KC) {
      const pa0 = x - g[o];
      const pa1 = y - g[o + 1];
      const pa2 = z - g[o + 2];
      const ba0 = g[o + 3];
      const ba1 = g[o + 4];
      const ba2 = g[o + 5];
      const bb = g[o + 6];
      const h = bb > 0 ? Math.max(0, Math.min(1, (pa0 * ba0 + pa1 * ba1 + pa2 * ba2) / bb)) : 0;
      const dx = pa0 - ba0 * h;
      const dy = pa1 - ba1 * h;
      const dz = pa2 - ba2 * h;
      d = Math.sqrt(dx * dx + dy * dy + dz * dz) - (g[o + 7] + g[o + 8] * h);
    } else if (k === KT) {
      d = this.tri(o, x, y, z) - g[o + 34];
    } else {
      const v0 = x - g[o];
      const v1 = y - g[o + 1];
      const v2 = z - g[o + 2];
      const px = v0 * g[o + 3] + v1 * g[o + 4] + v2 * g[o + 5];
      const py = v0 * g[o + 6] + v1 * g[o + 7] + v2 * g[o + 8];
      const pz = v0 * g[o + 9] + v1 * g[o + 10] + v2 * g[o + 11];
      const u0 = g[o + 12];
      const u1 = g[o + 13];
      const u2 = g[o + 14];
      if (k === KE) {
        const x0 = px / u0;
        const y0 = py / u1;
        const z0 = pz / u2;
        const k0 = Math.sqrt(x0 * x0 + y0 * y0 + z0 * z0);
        const x1 = x0 / u0;
        const y1 = y0 / u1;
        const z1 = z0 / u2;
        const k1 = Math.sqrt(x1 * x1 + y1 * y1 + z1 * z1);
        d = k1 > 1e-9 ? (k0 * (k0 - 1)) / k1 : -g[o + 15];
      } else {
        const rr = g[o + 15];
        const qx = Math.abs(px) - u0 + rr;
        const qy = Math.abs(py) - u1 + rr;
        const qz = Math.abs(pz) - u2 + rr;
        const mx = Math.max(qx, 0);
        const my = Math.max(qy, 0);
        const mz = Math.max(qz, 0);
        d = Math.sqrt(mx * mx + my * my + mz * mz) + Math.min(Math.max(qx, qy, qz), 0) - rr;
      }
    }
    const c1 = this.cut1[i];
    if (c1 > 0) {
      const cv = this.cutv;
      for (let c = this.cut0[i] * 4; c < c1 * 4; c += 4) d = Math.max(d, x * cv[c] + y * cv[c + 1] + z * cv[c + 2] - cv[c + 3]);
    }
    return d;
  }
  /** `triDist`, the same sums. */
  tri(o: number, x: number, y: number, z: number): number {
    const g = this.g;
    const pa0 = x - g[o];
    const pa1 = y - g[o + 1];
    const pa2 = z - g[o + 2];
    const pb0 = x - g[o + 3];
    const pb1 = y - g[o + 4];
    const pb2 = z - g[o + 5];
    const pc0 = x - g[o + 6];
    const pc1 = y - g[o + 7];
    const pc2 = z - g[o + 8];
    const s1 = triSg(g[o + 21] * pa0 + g[o + 22] * pa1 + g[o + 23] * pa2);
    const s2 = triSg(g[o + 24] * pb0 + g[o + 25] * pb1 + g[o + 26] * pb2);
    const s3 = triSg(g[o + 27] * pc0 + g[o + 28] * pc1 + g[o + 29] * pc2);
    if (s1 + s2 + s3 >= 2) return Math.abs(g[o + 18] * pa0 + g[o + 19] * pa1 + g[o + 20] * pa2) / g[o + 30];
    // (the least of the three edges' distances: the root of the least of their squares, the very same number, as a root
    // never takes a bigger number to a smaller one)
    return Math.sqrt(Math.min(seg2(g[o + 9], g[o + 10], g[o + 11], g[o + 31], pa0, pa1, pa2), seg2(g[o + 12], g[o + 13], g[o + 14], g[o + 32], pb0, pb1, pb2), seg2(g[o + 15], g[o + 16], g[o + 17], g[o + 33], pc0, pc1, pc2)));
  }

  /** What `look` found: the last three solids that may set what is found to their own distance, and the least found before each. */
  r1 = -1;
  r2 = -1;
  r3 = -1;
  q1 = 0.5;
  q2 = 0.5;
  q3 = 0.5;
  /**
   * A MATERIAL LOOKED OVER AT A POINT, before it is asked (its solids `j0` on, of its place `s`): how near each solid can be
   * anywhere within `widen` of the point, into `LQ`; the solids that may set what is found to their own distance; and the
   * least the material can give there (the smooth union of the least of each, all taken in), which it returns.
   */
  look(s: number, j0: number, x: number, y: number, z: number, widen: number): number {
    const F = this.A.F;
    const C = this.A.C;
    const p1 = this.A.S[s * SS + 2];
    if (LQ.length < p1 - j0) LQ = new Float64Array(2 * (p1 - j0));
    const lq_ = LQ;
    let P = Infinity;
    let r1 = -1;
    let r2 = -1;
    let r3 = -1;
    let q1 = 0;
    let q2 = 0;
    let q3 = 0;
    for (let jj = j0; jj < p1; jj++) {
      const o = jj * FS;
      const k = F[o + 1];
      const lo = F[o];
      // (no nearer anywhere in the cell than what the others give, by its blend: it changes none of this)
      if (lo >= P + k) {
        lq_[jj - j0] = lo;
        continue;
      }
      let v = F[o + 2] + F[o + 3] * x + F[o + 4] * y + F[o + 5] * z;
      if (widen > 0) v -= widen * (Math.abs(F[o + 3]) + Math.abs(F[o + 4]) + Math.abs(F[o + 5]));
      let lq = v >= 0 ? v * F[o + 6] : v * F[o + 7];
      if (lo > lq) lq = lo;
      lq_[jj - j0] = lq;
      // (a smooth union is never less than the lesser by more than a quarter of what its blend outruns their gap by)
      if (P === Infinity) P = lq;
      else {
        if (P >= lq + k) {
          r3 = r2;
          q3 = q2;
          r2 = r1;
          q2 = q1;
          r1 = jj;
          q1 = P;
        }
        const gap = P > lq ? P - lq : lq - P;
        if (gap < k) {
          const h = (k - gap) * C[o + 6];
          P = (P < lq ? P : lq) - h * h * k * 0.25;
        } else if (lq < P) P = lq;
      }
    }
    this.r1 = r1;
    this.r2 = r2;
    this.r3 = r3;
    this.q1 = q1;
    this.q2 = q2;
    this.q3 = q3;
    // (its sums' slips allowed for once, here and where a solid's is used)
    return P - SLACK * (1 + Math.abs(P)) * (1 + (p1 - j0) * 1e-3);
  }
  /** Where a material of a list is to begin to be asked at a point: the solid proved for the cell to set what is found to its own distance, if `Field` takes it in here; else its first. */
  start(s: number, x: number, y: number, z: number, cap: number): number {
    const A = this.A;
    const F = A.F;
    const C = A.C;
    const j = A.S[s * SS + 4];
    const first = A.S[s * SS + 1];
    if (j === first) return j;
    const o = j * FS;
    const far = Math.min(A.SF[s * SFS + 1], cap) + F[o + 1] + C[o + 1];
    const ex = x - C[o + 2];
    const ey = y - C[o + 3];
    const ez = z - C[o + 4];
    return far >= 0 && ex * ex + ey * ey + ez * ez <= far * far ? j : first;
  }
  /** `Field.ofMat` for one material (`s`, its place in the arena), as far as `cap`; anything not less than `cap` where it cannot be less. */
  ofSeg(s: number, x: number, y: number, z: number, cap: number): number {
    // (BEGUN AT A SOLID THAT SETS WHAT IS FOUND TO ITS OWN DISTANCE, whatever went before it, if `Field` takes it in:
    // that it does, here; that it sets it so, proved for the cell)
    const j0 = this.start(s, x, y, z, cap);
    // LOOKED OVER FIRST, AT THE POINT, where there are enough solids to be worth it: how near each can be here; if the
    // material can give nothing nearer than what is found, it cannot win
    const A = this.A;
    const over = A.S[s * SS + 2] - j0 >= CELL.over && A.F[j0 * FS + 2] !== -Infinity;
    if (!over) return this.finish(s, j0, 0, x, y, z, cap);
    // (LOOKED OVER LATELY, NEAR HERE, from the same solid: nothing looked over can have come nearer than by how far the
    // point has gone, times how fast it can change; so the least the material could give then, and where to begin then,
    // less that, hold here)
    const W = A.W;
    const w = s * WS;
    if (W[w + 6] === j0) {
      const dx = x - W[w];
      const dy = y - W[w + 1];
      const dz = z - W[w + 2];
      const fall = W[w + 7] * Math.sqrt(dx * dx + dy * dy + dz * dz) * (1 + 1e-9) + SLACK;
      if (W[w + 3] - fall >= cap) return Infinity;
      if (W[w + 5] >= 0) {
        const r = W[w + 5];
        const pb = W[w + 4] - fall;
        const F = A.F;
        const o = r * FS;
        const k = F[o + 1];
        const v = F[o + 2] + F[o + 3] * x + F[o + 4] * y + F[o + 5] * z;
        const lq = Math.max(F[o], v >= 0 ? v * F[o + 6] : v * F[o + 7]);
        const C = A.C;
        const far = Math.min(pb, cap) + k + C[o + 1];
        const ex = x - C[o + 2];
        const ey = y - C[o + 3];
        const ez = z - C[o + 4];
        if (pb >= lq + k && far >= 0 && ex * ex + ey * ey + ez * ez <= far * far) {
          const b = this.dist(A.I[r], x, y, z);
          if (pb >= b + k + SLACK * (1 + Math.abs(pb) + Math.abs(b) + k)) return this.tail(s, j0, r + 1, b, false, x, y, z, cap);
        }
      }
    }
    const P = this.look(s, j0, x, y, z, 0);
    if (W[w + 7] < 0) W[w + 7] = this.steepest(s);
    W[w] = x;
    W[w + 1] = y;
    W[w + 2] = z;
    W[w + 3] = P;
    W[w + 5] = -1;
    W[w + 6] = j0;
    if (P >= cap) return Infinity;
    return this.finish(s, j0, 2, x, y, z, cap);
  }
  /** How fast anything looked over of a material of a list can change from point to point: the steepest of its flats. */
  steepest(s: number): number {
    const F = this.A.F;
    let g2 = 0;
    for (let j = this.A.S[s * SS + 1], p1 = this.A.S[s * SS + 2]; j < p1; j++) {
      const o = j * FS;
      const a = Math.max(Math.abs(F[o + 6]), Math.abs(F[o + 7]));
      const g = (F[o + 3] * F[o + 3] + F[o + 4] * F[o + 4] + F[o + 5] * F[o + 5]) * a * a;
      if (g > g2) g2 = g;
    }
    return Math.sqrt(g2) * (1 + 1e-9);
  }
  /**
   * The rest of `ofSeg`, from the solid `j0` (`over`: 0, not looked over at the point first; 1, looked over, by `look`,
   * from `j0`; 2, and where it began kept for the next point, as `ofSeg` has it).
   */
  finish(s: number, j0: number, over: number, x: number, y: number, z: number, cap: number): number {
    const A = this.A;
    const I = A.I;
    const F = A.F;
    const C = A.C;
    const S = A.S;
    const sb = s * SS;
    const p1 = S[sb + 2];
    const lq_ = LQ;
    let j = j0;
    let d = Infinity;
    if (over) {
      // (the last solid that may, here, set what is found to its own distance whatever went before it: the least what is
      // found can be when it comes to it, further than its own distance by its blend; and taken in)
      let tries = 0;
      for (let c = 0; c < 3 && tries < 2; c++) {
        const r = c === 0 ? this.r1 : c === 1 ? this.r2 : this.r3;
        if (r < 0) break;
        const pb0 = c === 0 ? this.q1 : c === 1 ? this.q2 : this.q3;
        const pb = pb0 - SLACK * (1 + Math.abs(pb0));
        const o = r * FS;
        const k = F[o + 1];
        if (!(pb >= lq_[r - j0] + k)) continue;
        const far = Math.min(pb, cap) + k + C[o + 1];
        const ex = x - C[o + 2];
        const ey = y - C[o + 3];
        const ez = z - C[o + 4];
        if (!(far >= 0 && ex * ex + ey * ey + ez * ez <= far * far)) continue;
        tries++;
        const b = this.dist(I[r], x, y, z);
        if (pb >= b + k + SLACK * (1 + Math.abs(pb) + Math.abs(b) + k)) {
          d = b;
          j = r + 1;
          if (over === 2) {
            A.W[s * WS + 5] = r;
            A.W[s * WS + 4] = pb;
          }
          break;
        }
      }
    }
    return this.tail(s, j0, j, d, over !== 0, x, y, z, cap);
  }
  /** The rest of `finish`, from the solid `j`, what is found so far `d` (`over`: each solid's least at the point worked out from `j0` on, by `look`). */
  tail(s: number, j0: number, j: number, d: number, over: boolean, x: number, y: number, z: number, cap: number): number {
    const A = this.A;
    const I = A.I;
    const F = A.F;
    const C = A.C;
    const S = A.S;
    const sb = s * SS;
    const p1 = S[sb + 2];
    const lq_ = LQ;
    for (; j < p1; j++) {
      const o = j * FS;
      const k = F[o + 1];
      // (its skin further off than what is found, by its blend: the smooth union would keep what it has, to the bit; how
      // near it can be at the point worked out here, if it was not above)
      let lo = over ? lq_[j - j0] : F[o];
      if (lo >= d + k) continue;
      if (lo === F[o]) {
        const v = F[o + 2] + F[o + 3] * x + F[o + 4] * y + F[o + 5] * z;
        const lq = v >= 0 ? v * F[o + 6] : v * F[o + 7];
        if (lq > lo) lo = lq;
        if (lo >= d + k) continue;
      }
      // (what is found, and all that is left, no nearer than the nearest skin of another material: it cannot win)
      if (d >= cap && C[o] >= cap) return Infinity;
      const far = Math.min(d, cap) + k + C[o + 1];
      if (far < 0) continue;
      const ex = x - C[o + 2];
      const ey = y - C[o + 3];
      const ez = z - C[o + 4];
      if (ex * ex + ey * ey + ez * ez > far * far) continue;
      const b = this.dist(I[j], x, y, z);
      if (d === Infinity) d = b;
      else if (k <= 0) d = Math.min(d, b);
      else {
        // (smin)
        const h = Math.max(k - Math.abs(d - b), 0) / k;
        d = Math.min(d, b) - h * h * k * 0.25;
      }
    }
    if (d === Infinity) return cap === Infinity ? 1e6 : cap + 1;
    const c1 = S[sb + 3];
    for (j = p1; j < c1; j++) {
      const o = j * FS;
      const i = I[j];
      const far = this.farC[i];
      const ex = x - C[o + 2];
      const ey = y - C[o + 3];
      const ez = z - C[o + 4];
      if (ex * ex + ey * ey + ez * ez > far * far) continue;
      const c = -this.dist(i, x, y, z);
      const k = F[o + 1];
      if (k <= 0) d = Math.max(d, c);
      else {
        const h = Math.max(k - Math.abs(d - c), 0) / k;
        d = Math.max(d, c) + h * h * k * 0.25;
      }
    }
    return d;
  }
  /**
   * `Field.ofMat` with no cap, from a material's own list, at the six points a step `e` off (x, y, z) along each line, as
   * the way the skin faces is asked (+x, -x, +y, -y, +z, -z), into `out`: the material looked over once for all six.
   */
  ofMat6(L: number, x: number, y: number, z: number, e: number, out: Float64Array): void {
    const s = this.A.T[L * 2];
    const first = this.A.S[s * SS + 1];
    const over = this.A.S[s * SS + 2] - first >= CELL.over && this.A.F[first * FS + 2] !== -Infinity;
    if (over) this.look(s, first, x, y, z, e * (1 + 1e-9) + SLACK);
    out[0] = this.finish(s, first, over ? 1 : 0, x + e, y + 0, z + 0, Infinity);
    out[1] = this.finish(s, first, over ? 1 : 0, x + -e, y + 0, z + 0, Infinity);
    out[2] = this.finish(s, first, over ? 1 : 0, x + 0, y + e, z + 0, Infinity);
    out[3] = this.finish(s, first, over ? 1 : 0, x + 0, y + -e, z + 0, Infinity);
    out[4] = this.finish(s, first, over ? 1 : 0, x + 0, y + 0, z + e, Infinity);
    out[5] = this.finish(s, first, over ? 1 : 0, x + 0, y + 0, z + -e, Infinity);
  }
  /** `Field.at` from a list: the nearest skin of any material (and whose, in `m`). */
  at(L: number, x: number, y: number, z: number): number {
    let d = Infinity;
    let m = -1;
    if (this.lead >= 0) {
      d = 1e6;
      m = this.lead;
    }
    const A = this.A;
    const s0 = A.T[L * 2];
    const s1 = s0 + A.T[L * 2 + 1];
    for (let s = s0; s < s1; s++) {
      // (a material that can give nothing nearer than what is found changes nothing)
      if (A.SF[s * SFS] >= d) continue;
      const di = this.ofSeg(s, x, y, z, d);
      if (di < d) {
        d = di;
        m = A.S[s * SS];
      }
    }
    this.m = m;
    return d;
  }
  /** `Field.nearest`, from a material's own list. */
  nearest(L: number, m: number, x: number, y: number, z: number): number {
    let best = Infinity;
    let p = this.first[m];
    const A = this.A;
    const I = A.I;
    const F = A.F;
    const C = A.C;
    const sb = A.T[L * 2] * SS;
    const p1 = A.S[sb + 2];
    for (let j = A.S[sb + 1]; j < p1; j++) {
      const o = j * FS;
      // (no nearer than the best, anywhere in the cell or here: it would not be taken)
      if (F[o] >= best) continue;
      const v = F[o + 2] + F[o + 3] * x + F[o + 4] * y + F[o + 5] * z;
      if ((v >= 0 ? v * F[o + 6] : v * F[o + 7]) >= best) continue;
      // (`Field.nearest`'s own test, its root worked out the slow way only where the quick one is too near to tell)
      const ex = x - C[o + 2];
      const ey = y - C[o + 3];
      const ez = z - C[o + 4];
      const e = Math.sqrt(ex * ex + ey * ey + ez * ez) - C[o + 1];
      const tol = 1e-9 * (1 + Math.abs(e) + C[o + 1]);
      if (e > best + tol) continue;
      if (e >= best - tol && Math.hypot(ex, ey, ez) - C[o + 1] > best) continue;
      const i = I[j];
      const d = this.dist(i, x, y, z);
      if (d < best) {
        best = d;
        p = i;
      }
    }
    return p;
  }

  /** What `bounds` found: the most a solid's distance can be, the most it leaves found once `Field` has looked at it, the least its distance can be; and the least at a point, as `FS` has it. */
  hiD = 0.5;
  hi = 0.5;
  lo = 0.5;
  la = 0.5;
  lx = 0.5;
  ly = 0.5;
  lz = 0.5;
  lp = 0.5;
  ln = 0.5;
  /** (the way out of a sheet at a point, from `triNear`) */
  tx = 0.5;
  ty = 0.5;
  tz = 0.5;
  /**
   * Bounds on a solid anywhere within `rho` of (cx, cy, cz) (`e` from its bounding ball's middle): `hiD`, the most its own
   * distance could be there; `hi`, that or what `Field` has already found when it passes over it there, whichever is more
   * (so the most it leaves found once it has looked at it); `lo`, the least its distance could be there. And the least at
   * each point there, flat in the point (`la`, `lx`, `ly`, `lz`, `lp`, `ln`): a rod's line, a block and a sheet are each
   * a skin round a solid that bulges nowhere inward, whose distance never falls below the flat that touches it at the
   * middle (its own slope there); a ball's k0 the same, and its distance (k0 - 1) times a number bounded over the cell.
   */
  bounds(i: number, cx: number, cy: number, cz: number, rho: number, e: number): void {
    const g = this.g;
    const o = i * GS;
    const k = this.kind[i];
    let A: number;
    let B: number;
    // (the flat: the least at a point is v = a + gx x + gy y + gz z, times lp where v is not below nothing, else ln)
    let la = -Infinity;
    let gx = 0;
    let gy = 0;
    let gz = 0;
    let lp = 1;
    let ln = 1;
    if (k === KC) {
      // (a rod: as far as its line is, less its thicker end, or its thinner)
      const pa0 = cx - g[o];
      const pa1 = cy - g[o + 1];
      const pa2 = cz - g[o + 2];
      const bb = g[o + 6];
      const hl = bb > 0 ? (pa0 * g[o + 3] + pa1 * g[o + 4] + pa2 * g[o + 5]) / bb : 0;
      const h = bb > 0 ? Math.max(0, Math.min(1, hl)) : 0;
      const dx = pa0 - g[o + 3] * h;
      const dy = pa1 - g[o + 4] * h;
      const dz = pa2 - g[o + 5] * h;
      const s = Math.sqrt(dx * dx + dy * dy + dz * dz);
      A = s + rho - g[o + 9];
      B = s - rho - g[o + 10];
      // (its line's distance: the flat touching it at the middle; its radius there, at most, over the cell, or along the
      // line where the cell is all beside it)
      if (s > 1e-9) {
        gx = dx / s;
        gy = dy / s;
        gz = dz / s;
      }
      const ra = g[o + 7];
      const dr = g[o + 8];
      const L = Math.sqrt(bb);
      if (bb > 0 && hl - rho / L > 0 && hl + rho / L < 1) {
        const f = dr / bb;
        gx -= f * g[o + 3];
        gy -= f * g[o + 4];
        gz -= f * g[o + 5];
        la = s - ra - dr * hl;
      } else {
        const hh = bb > 0 ? (dr > 0 ? Math.min(1, Math.max(0, hl + rho / L)) : Math.max(0, Math.min(1, hl - rho / L))) : 0;
        la = s - (ra + dr * hh);
      }
    } else if (k === KT) {
      // (a sheet: its distance from the point grows no faster than the point goes)
      const s = this.triNear(o, cx, cy, cz);
      A = s + rho - g[o + 34];
      B = s - rho - g[o + 34];
      la = s - g[o + 34];
      gx = this.tx;
      gy = this.ty;
      gz = this.tz;
    } else {
      const v0 = cx - g[o];
      const v1 = cy - g[o + 1];
      const v2 = cz - g[o + 2];
      const px = v0 * g[o + 3] + v1 * g[o + 4] + v2 * g[o + 5];
      const py = v0 * g[o + 6] + v1 * g[o + 7] + v2 * g[o + 8];
      const pz = v0 * g[o + 9] + v1 * g[o + 10] + v2 * g[o + 11];
      const u0 = g[o + 12];
      const u1 = g[o + 13];
      const u2 = g[o + 14];
      const sig = g[o + 16];
      if (k === KE) {
        // (a ball's distance, as `dist` has it, k0 (k0 - 1) / k1, is never more than the way out to its skin along the
        // line from its middle, nor than the point's distance from its middle less its least half-length; never less than
        // (k0 - 1) times its least half-length, out of it, or (k0 - 1) times its most, in it; and k0 changes no faster than
        // the point goes over its least half-length)
        const w = Math.sqrt(px * px + py * py + pz * pz);
        const x0 = px / u0;
        const y0 = py / u1;
        const z0 = pz / u2;
        const k0 = Math.sqrt(x0 * x0 + y0 * y0 + z0 * z0);
        const amin = g[o + 15];
        const amax = g[o + 17];
        const wMax = w + sig * rho;
        const kMax = k0 + (sig * rho) / amin;
        A = Math.min(kMax > 1 ? wMax * (1 - 1 / kMax) : 0, wMax - amin);
        const kMin = k0 - (sig * rho) / amin;
        B = kMin >= 1 ? (kMin - 1) * amin : -(1 - Math.max(0, kMin)) * amax;
        // (k0 is the length of a flat sum of the point: no less than the flat touching it at the middle; k0 / k1 lies
        // between bounds over the cell, from how far k0 and k1 can go there)
        if (k0 > 1e-6) {
          const x1 = x0 / u0;
          const y1 = y0 / u1;
          const z1 = z0 / u2;
          const k1 = Math.sqrt(x1 * x1 + y1 * y1 + z1 * z1);
          const d0 = (sig * rho) / amin;
          const d1 = (sig * rho) / (amin * amin);
          lp = k0 - d0 > 0 ? Math.max(amin, (k0 - d0) / (k1 + d1)) : amin;
          ln = k1 - d1 > 0 ? Math.min(amax, (k0 + d0) / (k1 - d1)) : amax;
          const w0 = x1 / k0;
          const w1 = y1 / k0;
          const w2 = z1 / k0;
          gx = w0 * g[o + 3] + w1 * g[o + 6] + w2 * g[o + 9];
          gy = w0 * g[o + 4] + w1 * g[o + 7] + w2 * g[o + 10];
          gz = w0 * g[o + 5] + w1 * g[o + 8] + w2 * g[o + 11];
          la = k0 - 1;
        }
      } else {
        // (a block: its distance grows no faster than its stretch)
        const rr = g[o + 15];
        const qx = Math.abs(px) - u0 + rr;
        const qy = Math.abs(py) - u1 + rr;
        const qz = Math.abs(pz) - u2 + rr;
        const mx = Math.max(qx, 0);
        const my = Math.max(qy, 0);
        const mz = Math.max(qz, 0);
        const ml = Math.sqrt(mx * mx + my * my + mz * mz);
        const s = ml + Math.min(Math.max(qx, qy, qz), 0) - rr;
        A = s + sig * rho;
        B = s - sig * rho;
        if (ml > 1e-9) {
          const w0 = (px > 0 ? mx : -mx) / ml;
          const w1 = (py > 0 ? my : -my) / ml;
          const w2 = (pz > 0 ? mz : -mz) / ml;
          gx = w0 * g[o + 3] + w1 * g[o + 6] + w2 * g[o + 9];
          gy = w0 * g[o + 4] + w1 * g[o + 7] + w2 * g[o + 10];
          gz = w0 * g[o + 5] + w1 * g[o + 8] + w2 * g[o + 11];
          la = s;
        }
      }
    }
    const c1 = this.cut1[i];
    if (c1 > 0) {
      // (its cuts can only take it further off)
      const cv = this.cutv;
      for (let c = this.cut0[i] * 4; c < c1 * 4; c += 4) A = Math.max(A, cx * cv[c] + cy * cv[c + 1] + cz * cv[c + 2] - cv[c + 3] + rho * Math.hypot(cv[c], cv[c + 1], cv[c + 2]));
    }
    this.hiD = A + SLACK * (1 + Math.abs(A));
    // (passed over: what is found is less than its ball's reach)
    A = Math.max(A, e + rho - this.br[i]);
    this.hi = A + SLACK * (1 + Math.abs(A));
    this.lo = B - SLACK * (1 + Math.abs(B));
    // (the flat, as a sum of the point itself: the value at the middle less the slope times the middle)
    if (la === -Infinity) {
      this.la = this.lo;
      this.lx = this.ly = this.lz = 0;
      this.lp = this.ln = 1;
    } else {
      const a0 = la - (gx * cx + gy * cy + gz * cz);
      this.la = a0 - SLACK * (1 + Math.abs(la) + Math.abs(a0));
      this.lx = gx;
      this.ly = gy;
      this.lz = gz;
      this.lp = lp;
      this.ln = ln;
    }
  }
  /** `tri`, and the way out of the sheet to the point (in `tx`, `ty`, `tz`; nothing where the point is on it). */
  triNear(o: number, x: number, y: number, z: number): number {
    const g = this.g;
    const pa0 = x - g[o];
    const pa1 = y - g[o + 1];
    const pa2 = z - g[o + 2];
    const pb0 = x - g[o + 3];
    const pb1 = y - g[o + 4];
    const pb2 = z - g[o + 5];
    const pc0 = x - g[o + 6];
    const pc1 = y - g[o + 7];
    const pc2 = z - g[o + 8];
    const s1 = triSg(g[o + 21] * pa0 + g[o + 22] * pa1 + g[o + 23] * pa2);
    const s2 = triSg(g[o + 24] * pb0 + g[o + 25] * pb1 + g[o + 26] * pb2);
    const s3 = triSg(g[o + 27] * pc0 + g[o + 28] * pc1 + g[o + 29] * pc2);
    this.tx = this.ty = this.tz = 0;
    if (s1 + s2 + s3 >= 2) {
      const sd = g[o + 18] * pa0 + g[o + 19] * pa1 + g[o + 20] * pa2;
      const d = Math.abs(sd) / g[o + 30];
      if (d > 1e-9) {
        const f = (sd > 0 ? 1 : -1) / g[o + 30];
        this.tx = g[o + 18] * f;
        this.ty = g[o + 19] * f;
        this.tz = g[o + 20] * f;
      }
      return d;
    }
    let best = Infinity;
    for (let c = 0; c < 3; c++) {
      const e0 = g[o + 9 + c * 3];
      const e1 = g[o + 10 + c * 3];
      const e2 = g[o + 11 + c * 3];
      const w0 = c === 0 ? pa0 : c === 1 ? pb0 : pc0;
      const w1 = c === 0 ? pa1 : c === 1 ? pb1 : pc1;
      const w2 = c === 0 ? pa2 : c === 1 ? pb2 : pc2;
      const t = Math.max(0, Math.min(1, (e0 * w0 + e1 * w1 + e2 * w2) / g[o + 31 + c]));
      const vx = w0 - e0 * t;
      const vy = w1 - e1 * t;
      const vz = w2 - e2 * t;
      const q = vx * vx + vy * vy + vz * vz;
      if (q < best) {
        best = q;
        const l = Math.sqrt(q);
        if (l > 1e-9) {
          this.tx = vx / l;
          this.ty = vy / l;
          this.tz = vz / l;
        } else this.tx = this.ty = this.tz = 0;
      }
    }
    return Math.sqrt(best);
  }

  /**
   * The list for the cell within `rho` of (cx, cy, cz), from the list `P` of a cell round it: `across` true for `at` (what
   * one material's solids prove holds for the materials after it), false for one material's own list (`ofMat` with no
   * cap, and `nearest`); `withLo` to work out how near each solid can be, and what follows from it (else a list only to
   * draw others from).
   */
  cull(P: number, cx: number, cy: number, cz: number, rho: number, across: boolean, withLo: boolean): number {
    const A = this.A;
    const ps0 = A.T[P * 2];
    const ps1 = ps0 + A.T[P * 2 + 1];
    A.room(A.S[(ps1 - 1) * SS + 3] - A.S[ps0 * SS + 1], ps1 - ps0);
    const I = A.I;
    const F = A.F;
    const C = A.C;
    const S = A.S;
    const SF = A.SF;
    const bc = this.bc;
    const br = this.br;
    const blend = this.blend;
    const s0 = A.ns;
    let n = A.ni;
    let G = Infinity;
    for (let ps = ps0; ps < ps1; ps++) {
      const start = n;
      let L = Infinity;
      const p1 = S[ps * SS + 2];
      for (let j = S[ps * SS + 1]; j < p1; j++) {
        const i = I[j];
        const ex = cx - bc[i * 3];
        const ey = cy - bc[i * 3 + 1];
        const ez = cz - bc[i * 3 + 2];
        const e = Math.sqrt(ex * ex + ey * ey + ez * ez);
        const anc = G < L ? G : L;
        // (passed over by `Field` at every point of the cell: its ball, swollen by its blend, further than anything
        // already found can be)
        const gone = e - rho - br[i] - blend[i] > anc + SLACK * (1 + Math.abs(anc) + e);
        // (what it leaves found is at least its ball's reach less its size: no use working it out if that is no better)
        const lends = e + rho - br[i] < L;
        if (lends || (!gone && withLo)) {
          this.bounds(i, cx, cy, cz, rho, e);
          if (lends && this.hi < L) L = this.hi;
        }
        if (!gone) {
          const o = n * FS;
          I[n++] = i;
          // (a list only to draw others from needs only its solids)
          if (!withLo) continue;
          F[o] = this.lo;
          F[o + 1] = blend[i];
          C[o + 6] = this.inv[i];
          C[o + 1] = br[i];
          C[o + 2] = bc[i * 3];
          C[o + 3] = bc[i * 3 + 1];
          C[o + 4] = bc[i * 3 + 2];
          C[o + 5] = this.hiD;
          F[o + 2] = this.la;
          F[o + 3] = this.lx;
          F[o + 4] = this.ly;
          F[o + 5] = this.lz;
          F[o + 6] = this.lp;
          F[o + 7] = this.ln;
        }
      }
      const pEnd = n;
      let clean = true;
      const c1 = S[ps * SS + 3];
      for (let j = p1; j < c1; j++) {
        const i = I[j];
        const ex = cx - bc[i * 3];
        const ey = cy - bc[i * 3 + 1];
        const ez = cz - bc[i * 3 + 2];
        const e = Math.sqrt(ex * ex + ey * ey + ez * ez);
        if (e - rho > this.farC[i] + SLACK * (1 + e)) continue;
        const o = n * FS;
        I[n++] = i;
        clean = false;
        if (!withLo) continue;
        F[o] = -Infinity;
        C[o] = -Infinity;
        F[o + 1] = blend[i];
        C[o + 6] = this.inv[i];
        C[o + 1] = br[i];
        C[o + 2] = bc[i * 3];
        C[o + 3] = bc[i * 3 + 1];
        C[o + 4] = bc[i * 3 + 2];
        C[o + 5] = Infinity;
        F[o + 2] = -Infinity;
        F[o + 3] = 0;
        F[o + 4] = 0;
        F[o + 5] = 0;
        F[o + 6] = 1;
        F[o + 7] = 1;
      }
      if (pEnd > start) {
        const s = A.ns++;
        S[s * SS] = S[ps * SS];
        S[s * SS + 1] = start;
        S[s * SS + 2] = pEnd;
        S[s * SS + 3] = n;
        A.W[s * WS + 6] = -1;
        A.W[s * WS + 7] = -1;
        if (withLo) this.settle(start, pEnd, s);
        else {
          S[s * SS + 4] = start;
          SF[s * SFS] = -Infinity;
          SF[s * SFS + 1] = Infinity;
        }
      } else n = start;
      if (across && clean && L < G) G = L;
    }
    A.ni = n;
    return A.list(s0, A.ns - s0);
  }
  /**
   * What follows, for a material of a list (its solids `start` to `end`, its place `s`), from how near each solid can be:
   * from each solid on, the least what is found can come to if it was no less before; the least the material can give;
   * and the solid to begin at.
   */
  private settle(start: number, end: number, s: number): void {
    const A = this.A;
    const I = A.I;
    const F = A.F;
    const C = A.C;
    const blend = this.blend;
    // (from each solid on: the nearest skin left, less the biggest blend left)
    let least = Infinity;
    let K = 0;
    for (let j = end - 1; j >= start; j--) {
      const lo = F[j * FS];
      if (lo < least) least = lo;
      const k = blend[I[j]];
      if (k > K) K = k;
      C[j * CS] = least - K - SLACK * (1 + Math.abs(least) + K);
    }
    // (the least what is found can be, at each solid: the smooth union of the least of each before it, all taken in;
    // where that is further than the most the solid can be by its blend, the solid sets what is found to its own
    // distance: the last such is where to begin)
    let at = start;
    let atP = Infinity;
    let U = Infinity;
    for (let j = start; j < end; j++) {
      const k = blend[I[j]];
      if (j > start && U >= C[j * CS + 5] + k + SLACK * (1 + Math.abs(U) + k)) {
        at = j;
        atP = U;
      }
      const lo = F[j * FS];
      U = U === Infinity ? lo : sminOf(U, lo, k);
      U -= SLACK * (1 + Math.abs(U));
    }
    A.S[s * SS + 4] = at;
    // (the least the material can give: the smooth union of the least of each, all taken in; its carves only take it
    // further off)
    A.SF[s * SFS] = U;
    A.SF[s * SFS + 1] = atP;
  }

  /** Two units square to each other and to the way the rays go, and each sheet's corners as seen along it (`lines`). */
  e1 = [0, 0, 0];
  e2 = [0, 0, 0];
  flat = new Float64Array(0);
  /** Ready `lineLow` for lines along `u` (a unit). */
  lines(ux: number, uy: number, uz: number): void {
    // (any line not along u, made square to it)
    let ax = Math.abs(ux) < 0.6 ? 1 : 0;
    let ay = ax ? 0 : 1;
    let az = 0;
    const t = ax * ux + ay * uy + az * uz;
    ax -= ux * t;
    ay -= uy * t;
    az -= uz * t;
    const l = Math.hypot(ax, ay, az);
    const e1 = [ax / l, ay / l, az / l];
    const e2 = [uy * e1[2] - uz * e1[1], uz * e1[0] - ux * e1[2], ux * e1[1] - uy * e1[0]];
    this.e1 = e1;
    this.e2 = e2;
    this.flat = new Float64Array(this.n * 6);
    const g = this.g;
    for (let i = 0; i < this.n; i++) {
      if (this.kind[i] !== KT) continue;
      const o = i * GS;
      for (let c = 0; c < 3; c++) {
        this.flat[i * 6 + c * 2] = g[o + c * 3] * e1[0] + g[o + c * 3 + 1] * e1[1] + g[o + c * 3 + 2] * e1[2];
        this.flat[i * 6 + c * 2 + 1] = g[o + c * 3] * e2[0] + g[o + c * 3 + 1] * e2[1] + g[o + c * 3 + 2] * e2[2];
      }
    }
  }
  /**
   * The least a solid's distance can be anywhere within `r` of the line through `p` along `u` (a unit, as `lines` was
   * readied for): how near the line comes to its line (a rod), to it as seen along the line (a sheet), or to its middle as
   * measured along its own lines (a block, a ball).
   */
  lineLow(i: number, px: number, py: number, pz: number, ux: number, uy: number, uz: number, r: number): number {
    const g = this.g;
    const o = i * GS;
    const k = this.kind[i];
    let B: number;
    if (k === KC) {
      // (a rod: no nearer than its line comes to the line, less its thicker end)
      B = segLine(g[o], g[o + 1], g[o + 2], g[o + 11], g[o + 12], g[o + 13], px, py, pz, ux, uy, uz) - r - g[o + 10];
    } else if (k === KT) {
      // (a sheet: no nearer than the line comes to it, which is how near the line's point comes to it as seen along it)
      const e1 = this.e1;
      const e2 = this.e2;
      const X = px * e1[0] + py * e1[1] + pz * e1[2];
      const Y = px * e2[0] + py * e2[1] + pz * e2[2];
      const f = this.flat;
      B = Math.sqrt(tri2(X, Y, f[i * 6], f[i * 6 + 1], f[i * 6 + 2], f[i * 6 + 3], f[i * 6 + 4], f[i * 6 + 5])) - 1e-6 * (1 + Math.abs(X) + Math.abs(Y)) - r - g[o + 34];
    } else {
      // (along its own lines, the point w = U (q - c): the line is a line there too, w = a + t b)
      const a0 = px - g[o];
      const a1 = py - g[o + 1];
      const a2 = pz - g[o + 2];
      let w0 = a0 * g[o + 3] + a1 * g[o + 4] + a2 * g[o + 5];
      let w1 = a0 * g[o + 6] + a1 * g[o + 7] + a2 * g[o + 8];
      let w2 = a0 * g[o + 9] + a1 * g[o + 10] + a2 * g[o + 11];
      let b0 = ux * g[o + 3] + uy * g[o + 4] + uz * g[o + 5];
      let b1 = ux * g[o + 6] + uy * g[o + 7] + uz * g[o + 8];
      let b2 = ux * g[o + 9] + uy * g[o + 10] + uz * g[o + 11];
      const sig = g[o + 16];
      if (k === KE) {
        // (a ball: its k0, the length of w over its half-lengths, at its least along the line, less what it can change
        // within r of it; its distance no less than (k0 - 1) times its least half-length, out of it, or its most, in it)
        w0 /= g[o + 12];
        w1 /= g[o + 13];
        w2 /= g[o + 14];
        b0 /= g[o + 12];
        b1 /= g[o + 13];
        b2 /= g[o + 14];
        const k0 = Math.max(0, perpLen(w0, w1, w2, b0, b1, b2) - (sig * r) / g[o + 15]);
        B = k0 >= 1 ? (k0 - 1) * g[o + 15] : -(1 - k0) * g[o + 17];
      } else {
        // (a block: no nearer than w comes to its middle, less its corners' reach)
        B = g[o + 19] < 0 ? -Infinity : Math.max(0, perpLen(w0, w1, w2, b0, b1, b2) - sig * r) - g[o + 19];
      }
    }
    return B - SLACK * (1 + Math.abs(B));
  }
  /**
   * The least any material can give where each solid of `order` (all solids but carves, in `Field`'s order) is no nearer
   * than `low` has it: for each material, the smooth union of those, all taken in (its carves only take it further off).
   */
  leastOf(low: Float64Array, stop = -Infinity): number {
    let least = Infinity;
    for (let m = 0; m < this.nm && least > stop; m++) {
      const U = this.leastOfMat(low, m, stop);
      if (U < least) least = U;
    }
    return least;
  }
  /** The same for one material (or anything not above `stop`, once it is clear that it will be no more than that). */
  leastOfMat(low: Float64Array, m: number, stop = -Infinity): number {
    const order = this.order;
    const blend = this.blend;
    let U = Infinity;
    const j1 = this.mat0[m + 1];
    for (let j = this.mat0[m]; j < j1; j++) {
      const l = low[j];
      if (U === Infinity) U = l;
      else {
        // (the smooth union, as `smin` has it but for its last bits)
        const k = blend[order[j]];
        const gap = U > l ? U - l : l - U;
        if (gap < k) {
          const h = (k - gap) * this.inv[order[j]];
          U = (U < l ? U : l) - h * h * k * 0.25;
        } else if (l < U) U = l;
        // (it only goes down)
        if (U <= stop) return U;
      }
    }
    return U === Infinity ? U : U - SLACK * (1 + Math.abs(U)) * (1 + j1 - this.mat0[m]) * 1e-3;
  }
}
/** How near the line a + t b (for any t) comes to nothing, or a little nearer. */
function perpLen(a0: number, a1: number, a2: number, b0: number, b1: number, b2: number): number {
  const bb = b0 * b0 + b1 * b1 + b2 * b2;
  const aa = a0 * a0 + a1 * a1 + a2 * a2;
  if (!(bb > 0)) return Math.sqrt(aa);
  const ab = a0 * b0 + a1 * b1 + a2 * b2;
  return Math.sqrt(Math.max(0, aa - (ab * ab) / bb - 1e-9 * (1 + aa))) * (1 - 1e-9);
}
/** The square of how near the point (x, y) comes to the flat three-cornered shape (x1, y1), (x2, y2), (x3, y3); nothing in it. */
function tri2(x: number, y: number, x1: number, y1: number, x2: number, y2: number, x3: number, y3: number): number {
  const c1 = (x2 - x1) * (y - y1) - (y2 - y1) * (x - x1);
  const c2 = (x3 - x2) * (y - y2) - (y3 - y2) * (x - x2);
  const c3 = (x1 - x3) * (y - y3) - (y1 - y3) * (x - x3);
  if ((c1 >= 0 && c2 >= 0 && c3 >= 0) || (c1 <= 0 && c2 <= 0 && c3 <= 0)) return 0;
  return Math.min(seg2d(x, y, x1, y1, x2, y2), seg2d(x, y, x2, y2, x3, y3), seg2d(x, y, x3, y3, x1, y1));
}
/** The square of how near (x, y) comes to the segment from (ax, ay) to (bx, by). */
function seg2d(x: number, y: number, ax: number, ay: number, bx: number, by: number): number {
  const ex = bx - ax;
  const ey = by - ay;
  const ee = ex * ex + ey * ey;
  const t = ee > 0 ? Math.max(0, Math.min(1, ((x - ax) * ex + (y - ay) * ey) / ee)) : 0;
  const dx = x - ax - ex * t;
  const dy = y - ay - ey * t;
  return dx * dx + dy * dy;
}
/** `triSeg`'s square, the same sums. */
function seg2(e0: number, e1: number, e2: number, ee: number, w0: number, w1: number, w2: number): number {
  const t = Math.max(0, Math.min(1, (e0 * w0 + e1 * w1 + e2 * w2) / ee));
  const x = e0 * t - w0;
  const y = e1 * t - w1;
  const z = e2 * t - w2;
  return x * x + y * y + z * z;
}
/**
 * How near the segment from a to b comes to the line through p along u (a unit), or a little nearer (never further):
 * the least of a quadratic, its sums' slips allowed for.
 */
function segLine(a0: number, a1: number, a2: number, b0: number, b1: number, b2: number, p0: number, p1: number, p2: number, u0: number, u1: number, u2: number): number {
  // (each end's offset from the line, square to it)
  let w0 = a0 - p0;
  let w1 = a1 - p1;
  let w2 = a2 - p2;
  let t = w0 * u0 + w1 * u1 + w2 * u2;
  w0 -= u0 * t;
  w1 -= u1 * t;
  w2 -= u2 * t;
  let v0 = b0 - a0;
  let v1 = b1 - a1;
  let v2 = b2 - a2;
  t = v0 * u0 + v1 * u1 + v2 * u2;
  v0 -= u0 * t;
  v1 -= u1 * t;
  v2 -= u2 * t;
  const ww = w0 * w0 + w1 * w1 + w2 * w2;
  const wv = w0 * v0 + w1 * v1 + w2 * v2;
  const vv = v0 * v0 + v1 * v1 + v2 * v2;
  // (|w + s v|^2 at its least for s from 0 to 1)
  let q: number;
  if (vv <= 0 || wv >= 0) q = ww;
  else if (-wv >= vv) q = ww + 2 * wv + vv;
  else q = ww - (wv * wv) / vv;
  const big = ww + Math.abs(2 * wv) + vv;
  return Math.sqrt(Math.max(0, q - 1e-9 * (1 + big))) - 1e-6;
}

/**
 * SPACE CUT INTO CELLS round a figure, as the picture sees it: `ts` pixels square, `dt` deep (as `Stage.near` measures);
 * each a list of the solids that can matter in it, worked out when first asked for, from the list of the bigger cell it
 * lies in (`sizes`: how many cells a side the bigger ones are, the smallest of them first), the biggest from every solid.
 * A point outside them all is asked of every solid.
 */
class Cells {
  readonly nx: number;
  readonly ny: number;
  readonly nz: number;
  /** For each size (the cells themselves first): how many cells a side, how many of it across, down and deep, its reach from its middle, and its lists. */
  readonly lv: { f: number; nx: number; ny: number; nz: number; rho: number; at: Int32Array; mats: Map<number, number> }[];
  constructor(
    readonly fa: Fast,
    readonly sx0: number,
    readonly sy0: number,
    readonly t0: number,
    sx1: number,
    sy1: number,
    t1: number,
    readonly ts: number,
    readonly dt: number,
    sizes: number[],
    readonly CX: V3,
    readonly CY: V3,
    readonly CZ: V3,
    readonly rows: readonly [V3, V3, V3],
    /** How far round a point of a cell a material's own list holds (the normal's little steps). */
    readonly pad: number,
  ) {
    this.nx = Math.max(1, Math.ceil((sx1 - sx0) / ts));
    this.ny = Math.max(1, Math.ceil((sy1 - sy0) / ts));
    this.nz = Math.max(1, Math.ceil((t1 - t0) / dt));
    this.lv = [1, ...sizes].map((f) => {
      const nx = Math.ceil(this.nx / f);
      const ny = Math.ceil(this.ny / f);
      const nz = Math.ceil(this.nz / f);
      return { f, nx, ny, nz, rho: this.reach((ts * f) / 2, (ts * f) / 2, (dt * f) / 2), at: new Int32Array(nx * ny * nz), mats: new Map<number, number>() };
    });
  }
  /** How far a corner of a box of these half-sizes (across, down, deep) is from its middle. */
  reach(hx: number, hy: number, hz: number): number {
    const { CX, CY, CZ } = this;
    let r = 0;
    for (let c = 0; c < 4; c++) {
      const a = c & 1 ? hy : -hy;
      const b = c & 2 ? hz : -hz;
      const v0 = hx * CX[0] + a * CY[0] + b * CZ[0];
      const v1 = hx * CX[1] + a * CY[1] + b * CZ[1];
      const v2 = hx * CX[2] + a * CY[2] + b * CZ[2];
      r = Math.max(r, Math.sqrt(v0 * v0 + v1 * v1 + v2 * v2));
    }
    return r * (1 + 1e-9) + SLACK;
  }
  /** The cell a point of the picture is in (x and y as `sx`, `sy` of the march, and how near), or -1 outside them all. */
  cell(sx: number, sy: number, t: number): number {
    const ix = Math.floor((sx - this.sx0) / this.ts);
    const iy = Math.floor((sy - this.sy0) / this.ts);
    const iz = Math.floor((t - this.t0) / this.dt);
    if (ix < 0 || iy < 0 || iz < 0 || ix >= this.nx || iy >= this.ny || iz >= this.nz) return -1;
    return (iz * this.ny + iy) * this.nx + ix;
  }
  /** The cell a point of the figure is in. */
  cellOf(x: number, y: number, z: number): number {
    const r = this.rows;
    return this.cell(r[0][0] * x + r[0][1] * y + r[0][2] * z, r[1][0] * x + r[1][1] * y + r[1][2] * z, r[2][0] * x + r[2][1] * y + r[2][2] * z);
  }
  /** The middle of a cell of a size (`f` cells a side; its place in cells of that size), in the figure's space. */
  private mid(ix: number, iy: number, iz: number, f: number): V3 {
    const sx = this.sx0 + (ix + 0.5) * this.ts * f;
    const sy = this.sy0 + (iy + 0.5) * this.ts * f;
    const t = this.t0 + (iz + 0.5) * this.dt * f;
    const { CX, CY, CZ } = this;
    return [CX[0] * sx + CY[0] * sy + CZ[0] * t, CX[1] * sx + CY[1] * sy + CZ[1] * t, CX[2] * sx + CY[2] * sy + CZ[2] * t];
  }
  /** The list `at` is to look at in a cell (-1: every solid). */
  atList(k: number): number {
    if (k < 0) return this.fa.full;
    const have = this.lv[0].at[k];
    if (have) return have;
    const ix = k % this.nx;
    const r = (k - ix) / this.nx;
    const iy = r % this.ny;
    return this.listAt(0, ix, iy, (r - iy) / this.ny);
  }
  /** The list of the bigger cell (the next size) a cell lies in, for a point far from every skin. */
  farList(k: number): number {
    if (k < 0 || this.lv.length < 2) return this.atList(k);
    const ix = k % this.nx;
    const r = (k - ix) / this.nx;
    const iy = r % this.ny;
    return this.listAt(1, ix, iy, (r - iy) / this.ny);
  }
  /** The list `at` is to look at in the cell of size `L` that the cell (ix, iy, iz) lies in. */
  private listAt(L: number, ix: number, iy: number, iz: number): number {
    const lv = this.lv[L];
    const bx = Math.floor(ix / lv.f);
    const by = Math.floor(iy / lv.f);
    const bz = Math.floor(iz / lv.f);
    const key = (bz * lv.ny + by) * lv.nx + bx;
    const have = lv.at[key];
    if (have) return have;
    const parent = L + 1 < this.lv.length ? this.listAt(L + 1, ix, iy, iz) : this.fa.full;
    const c = this.mid(bx, by, bz, lv.f);
    return (lv.at[key] = this.fa.cull(parent, c[0], c[1], c[2], lv.rho, true, L <= 1));
  }
  /** One material's own list in a cell, for `ofMat` with no cap and `nearest`, good within `pad` of the cell (-1: every solid). */
  matList(k: number, m: number): number {
    if (k < 0) return this.fa.fullMat[m];
    const ix = k % this.nx;
    const r = (k - ix) / this.nx;
    const iy = r % this.ny;
    return this.matAt(0, ix, iy, (r - iy) / this.ny, m);
  }
  private matAt(L: number, ix: number, iy: number, iz: number, m: number): number {
    const lv = this.lv[L];
    const bx = Math.floor(ix / lv.f);
    const by = Math.floor(iy / lv.f);
    const bz = Math.floor(iz / lv.f);
    const key = ((bz * lv.ny + by) * lv.nx + bx) * this.fa.nm + m;
    const have = lv.mats.get(key);
    if (have) return have;
    const parent = L + 1 < this.lv.length ? this.matAt(L + 1, ix, iy, iz, m) : this.fa.fullMat[m];
    const c = this.mid(bx, by, bz, lv.f);
    const out = this.fa.cull(parent, c[0], c[1], c[2], lv.rho + this.pad, false, L === 0);
    lv.mats.set(key, out);
    return out;
  }
}

/**
 * THE MARCH, FAST: what `draw` does for each pixel, with `Fast` (the same sums, so the same picture), into `zb`, `stuff`,
 * `piece` and `colour`; `shade` paints a pixel once its point, the way it faces and its material are known.
 */
function marchFast(
  fa: Fast,
  st: Stage,
  ax: number,
  ay: number,
  box: { xs: number; xe: number; ys: number; ye: number; zNear: number; zFar: number },
  CX: V3,
  CY: V3,
  CZ: V3,
  L2: number,
  E: number,
  shade: (x: number, y: number, t: number, q: V3, n: V3, m: number, open: number, prim: number) => void,
): void {
  const { xs, xe, ys, ye, zNear, zFar } = box;
  const r0 = st.seen([1, 0, 0]);
  const r1 = st.seen([0, 1, 0]);
  const r2 = st.seen([0, 0, 1]);
  const rows: [V3, V3, V3] = [[r0[0], r1[0], r2[0]], [r0[1], r1[1], r2[1]], [r0[2], r1[2], r2[2]]];
  // (the cells reach past the march as far as a crease is looked for off the skin)
  const padS = 2.6 * Math.max(lenOf(rows[0]), lenOf(rows[1])) + 2;
  const padT = 2.6 * lenOf(rows[2]) + 2;
  const cs = fa.n > CELL.many ? CELL.manyCell : CELL;
  const cells = new Cells(fa, xs + 0.5 - ax - padS, ys + 0.5 - ay - padS, zFar - padT, xe + 0.5 - ax + padS, ye + 0.5 - ay + padS, zNear + padT, cs.ts, cs.dt, cs.sizes, CX, CY, CZ, rows, E * (1 + 1e-9) + SLACK);
  // COLUMNS NO SKIN COMES NEAR ENOUGH TO BE MET are not marched: tiles of pixels, each looked at from the bigger tile it is
  // in (what each solid can be anywhere along a column round the tile's middle ray, wide enough for its corners)
  const TS = cs.ts;
  const TB = TS * 4;
  const NX = xe - xs + 1;
  const clear = new Uint8Array(NX * (ye - ys + 1));
  {
    const u0 = CZ[0] / L2;
    const u1 = CZ[1] / L2;
    const u2 = CZ[2] / L2;
    fa.lines(u0, u1, u2);
    const order = fa.order;
    const lowBig = new Float64Array(order.length);
    const low = new Float64Array(order.length);
    const lowPx = new Float64Array(order.length);
    const nearBig = 2 * cells.reach(TB / 2, TB / 2, 0) + 4;
    const nearTile = 2 * cells.reach(TS / 2, TS / 2, 0) + 4;
    const r1 = cells.reach(0, 0, 0);
    const near = new Int32Array(order.length);
    const touched = new Uint8Array(fa.nm);
    let nn = 0;
    let rest = Infinity;
    const column = (xa: number, xb: number, ya: number, yb: number, out: Float64Array, from: Float64Array | null, near: number): void => {
      const sx = (xa + xb) / 2 + 0.5 - ax;
      const sy = (ya + yb) / 2 + 0.5 - ay;
      const r = cells.reach((xb - xa) / 2, (yb - ya) / 2, 0);
      const p0 = CX[0] * sx + CY[0] * sy;
      const p1 = CX[1] * sx + CY[1] * sy;
      const p2 = CX[2] * sx + CY[2] * sy;
      for (let j = 0; j < order.length; j++) {
        if (from && from[j] >= near) out[j] = from[j];
        else out[j] = Math.max(from ? from[j] : -Infinity, fa.lineLow(order[j], p0, p1, p2, u0, u1, u2, r));
      }
    };
    for (let by = 0; by * TB <= ye - ys; by++) {
      for (let bx = 0; bx * TB <= xe - xs; bx++) {
        const xa = xs + bx * TB;
        const ya = ys + by * TB;
        const xb = Math.min(xe, xa + TB - 1);
        const yb = Math.min(ye, ya + TB - 1);
        column(xa, xb, ya, yb, lowBig, null, 0);
        const all = fa.leastOf(lowBig, 0.02) > 0.02;
        for (let ty = (ya - ys) / TS; ty * TS + ys <= yb; ty++) {
          for (let tx = (xa - xs) / TS; tx * TS + xs <= xb; tx++) {
            const fx = xs + tx * TS;
            const fy = ys + ty * TS;
            const gx = Math.min(xe, fx + TS - 1);
            const gy = Math.min(ye, fy + TS - 1);
            let tile = all;
            // (each pixel's own ray, in a tile that may be met: no solid's least along it is more than twice the
            // tile's reach above its least along the tile's, so none can be clear where the tile is not by that much)
            let each = false;
            if (!tile) {
              column(fx, gx, fy, gy, low, lowBig, nearBig);
              const reach2 = 2 * cells.reach((gx - fx) / 2, (gy - fy) / 2, 0) + 1e-3;
              const least = fa.leastOf(low, 0.02 - reach2);
              tile = least > 0.02;
              each = least + reach2 > 0.02;
            }
            if (!tile && !each) continue;
            if (!tile) {
              // (a pixel's ray changes only the solids near the tile's, and the materials they are of)
              nn = 0;
              touched.fill(0);
              for (let j = 0; j < order.length; j++) {
                lowPx[j] = low[j];
                if (low[j] < nearTile) {
                  near[nn++] = j;
                  touched[fa.matOf[order[j]]] = 1;
                }
              }
              rest = Infinity;
              for (let m = 0; m < fa.nm && rest > 0.02; m++) if (!touched[m]) rest = Math.min(rest, fa.leastOfMat(low, m, 0.02));
            }
            for (let y = fy; y <= gy; y++) {
              for (let x = fx; x <= gx; x++) {
                if (!tile) {
                  if (!(rest > 0.02)) continue;
                  const sx = x + 0.5 - ax;
                  const sy = y + 0.5 - ay;
                  const p0 = CX[0] * sx + CY[0] * sy;
                  const p1 = CX[1] * sx + CY[1] * sy;
                  const p2 = CX[2] * sx + CY[2] * sy;
                  for (let q = 0; q < nn; q++) {
                    const j = near[q];
                    lowPx[j] = Math.max(low[j], fa.lineLow(order[j], p0, p1, p2, u0, u1, u2, r1));
                  }
                  let ok = true;
                  for (let m = 0; m < fa.nm && ok; m++) if (touched[m] && !(fa.leastOfMat(lowPx, m, 0.02) > 0.02)) ok = false;
                  if (!ok) continue;
                }
                clear[(y - ys) * NX + (x - xs)] = 1;
              }
            }
          }
        }
      }
    }
  }
  const farD = cs.sizes.length ? CELL.far * cells.lv[1].rho : Infinity;
  const six = new Float64Array(6);
  for (let y = ys; y <= ye; y++) {
    for (let x = xs; x <= xe; x++) {
      if (clear[(y - ys) * NX + (x - xs)]) continue;
      const sx = x + 0.5 - ax;
      const sy = y + 0.5 - ay;
      const b0 = CX[0] * sx + CY[0] * sy;
      const b1 = CX[1] * sx + CY[1] * sy;
      const b2 = CX[2] * sx + CY[2] * sy;
      let t = zNear;
      let hit = false;
      let q0 = b0;
      let q1 = b1;
      let q2 = b2;
      let m = -1;
      let cell = -2;
      let L = fa.full;
      // (far from every skin, the list of a bigger cell does as well: fewer lists to work out)
      let far = true;
      for (let i = 0; i < 160 && t > zFar; i++) {
        q0 = b0 + CZ[0] * t;
        q1 = b1 + CZ[1] * t;
        q2 = b2 + CZ[2] * t;
        const k = cells.cell(sx, sy, t);
        if (k !== cell || far) {
          cell = k;
          L = far ? cells.farList(k) : cells.atList(k);
        }
        const d = fa.at(L, q0, q1, q2);
        far = d > farD;
        if (d < 0.02) {
          hit = true;
          m = fa.m;
          break;
        }
        t -= Math.max(0.02, (d * 0.8) / L2);
      }
      if (!hit) continue;
      // the way the skin faces, its creases, whose it is: as `draw` has them
      const ML = cells.matList(cell, m);
      fa.ofMat6(ML, q0, q1, q2, E, six);
      const nx = six[0] - six[1];
      const ny = six[2] - six[3];
      const nz = six[4] - six[5];
      const nn = Math.hypot(nx, ny, nz) || 1;
      const n: V3 = [nx / nn, ny / nn, nz / nn];
      const a0 = q0 + n[0] * 1.2;
      const a1 = q1 + n[1] * 1.2;
      const a2 = q2 + n[2] * 1.2;
      const o1 = fa.at(cells.atList(cells.cellOf(a0, a1, a2)), a0, a1, a2) / 1.2;
      const c0 = q0 + n[0] * 2.6;
      const c1 = q1 + n[1] * 2.6;
      const c2 = q2 + n[2] * 2.6;
      const o2 = fa.at(cells.atList(cells.cellOf(c0, c1, c2)), c0, c1, c2) / 2.6;
      const open = Math.max(0, Math.min(1, (o1 + o2) / 2));
      shade(x, y, t, [q0, q1, q2], n, m, open, fa.nearest(ML, m, q0, q1, q2));
    }
  }
}

/** What else is painted with a sculpted figure: parts of the old kind (a vial, a flame), on the same stage. */
export type Extras = (st: Stage) => void;

export interface Drawn {
  px: Px;
  /** How near the eye each pixel is (-Infinity where nothing is). */
  z: Float32Array;
  /** Whose each pixel is: a material's number, 1000 + an extra part's, or -1 for none. */
  stuff: Int32Array;
  st: Stage;
}

/** How far nearer a part must pass in front of another part of the same stuff to be inked off from it. */
const PIECE_STEP = 1.6;
/** How far nearer a fold of one part must stand over the rest of it to be inked off. */
const SELF_STEP = 5.5;
/** How dark a crease is: the share of the light taken off where the skin is hemmed in. */
/** How near in depth two stuffs must be, one of them melding, for their meeting to be soft and not inked. */
const MELD_STEP = 0.6;
const CREASE = 0.32;

/**
 * DRAW A SCULPTED FIGURE in one of the game's views, its floor point at (`ax`, `ay`) of a canvas of `size`; `extras`
 * painted on the same stage (their parts take part in who is nearest, and are inked as their own stuff); `rim`, the
 * colour of the crisp edge of light round it (the friend's cyan), or none.
 */
/** (for looking into a fault: the last figure drawn) */
/**
 * ONE FIGURE HELD IN ANOTHER (a thing in a hand, drawn as one picture with the hand so each hides the other truly): every
 * solid and material of `from` laid into `into`, each point of it moved by `turn` (a rotation, about its own floor point)
 * and then by `by`. Its stuffs stay its own (none melts into the other's).
 */
export function graft(into: Sculpt, from: Sculpt, turn: (v: V3) => V3, by: V3): void {
  const off = into.mats.length;
  into.mats.push(...from.mats);
  const m = (q: V3): V3 => {
    const r = turn(q);
    return [r[0] + by[0], r[1] + by[1], r[2] + by[2]];
  };
  for (const p of from.prims) {
    const cuts = p.cuts?.map((c) => {
      const n = turn(c.n);
      return { n, o: c.o + dot(n, by) };
    });
    const mat = p.mat + off;
    if (p.k === 'cone') into.prims.push({ ...p, mat, a: m(p.a), b: m(p.b), cuts });
    else if (p.k === 'tri') into.prims.push({ ...p, mat, a: m(p.a), b: m(p.b), c: m(p.c), cuts });
    else into.prims.push({ ...p, mat, c: m(p.c), axes: [turn(p.axes[0]), turn(p.axes[1]), turn(p.axes[2])], cuts } as Prim);
  }
}

export const LAST: { sc: Sculpt | null } = { sc: null };

/**
 * A sculpture drawn on a canvas, `extras` painted with it, and its crisp edge (`rim`). `overNear`, if given, how near the eye
 * the light painted over everything stands (as `Stage.near` measures it): where the sculpture is nearer than that, it hides
 * the light (a claw curled round in front of a fire held in it); without it, the light is over everything.
 */
export function draw(sc0: Sculpt, view: PaintView, ax: number, ay: number, size: { readonly w: number; readonly h: number }, extras?: Extras, rim: string | null = null, overNear?: () => number): Drawn {
  const sc = spun(sc0);
  const W = size.w;
  const H = size.h;
  const st = stage(view, ax, ay, size);
  LAST.sc = sc0;
  const f = new Field(sc);
  const extraParts: Sheet[] = [];
  if (extras) {
    const before = st.part;
    st.part = (where) => {
      const s = before(where);
      extraParts.push(s);
      return s;
    };
    extras(st);
    st.part = before;
  }
  const col = (k: number): V3 => [st.back[0][k], st.back[1][k], st.back[2][k]];
  const CX = col(0);
  const CY = col(1);
  const CZ = col(2);
  const L2 = lenOf(CZ);
  // the box on the canvas that the solids can reach, and how near and far they go
  let x0 = Infinity;
  let x1 = -Infinity;
  let y0 = Infinity;
  let y1 = -Infinity;
  let zFar = Infinity;
  let zNear = -Infinity;
  for (const r of f.rs) {
    if (r.p.carve) continue;
    const [sx, sy] = st.at(r.bc);
    const zc = st.near(r.bc);
    const reach = r.br * 1.25 + 1;
    x0 = Math.min(x0, sx - reach);
    x1 = Math.max(x1, sx + reach);
    y0 = Math.min(y0, sy - reach);
    y1 = Math.max(y1, sy + reach);
    zFar = Math.min(zFar, zc - r.br * 1.2 - 1);
    zNear = Math.max(zNear, zc + r.br * 1.2 + 1);
  }
  const N = W * H;
  const zb = new Float32Array(N).fill(-Infinity);
  // who each pixel is: its stuff (a material's number, or 1000 + an extra part's), and its part's number
  const stuff = new Int32Array(N).fill(-1);
  const piece = new Int32Array(N).fill(-1);
  const colour = new Uint32Array(N);
  const pieces = new Map<string, number>();
  const pieceOf = (m: number, name: string): number => {
    const key = `${m}:${name}`;
    let n = pieces.get(key);
    if (n === undefined) pieces.set(key, (n = pieces.size));
    return n;
  };
  const pack = (c: string): number => {
    const v = rgba(c);
    return ((v[0] << 24) | (v[1] << 16) | (v[2] << 8) | 255) >>> 0;
  };
  const E = 0.18;
  const arena = SCULPT_SPEED.fast && x0 <= x1 && y0 <= y1 ? (ARENAS.pop() ?? new Arena()) : null;
  arena?.reset();
  const fa = arena ? new Fast(f, arena) : null;
  if (arena && !fa?.sound()) ARENAS.push(arena);
  if (arena && fa && fa.sound()) {
    // THE SAME MARCH, ASKING EACH POINT ONLY WHAT CAN MATTER THERE (see `Fast`)
    try {
      const box = { xs: Math.max(0, Math.floor(x0)), xe: Math.min(W - 1, Math.ceil(x1)), ys: Math.max(0, Math.floor(y0)), ye: Math.min(H - 1, Math.ceil(y1)), zNear, zFar };
      // (each solid's part's number, as `pieceOf` gives it the first time it is asked)
      const pieceAt = new Int32Array(fa.n).fill(-1);
      marchFast(fa, st, ax, ay, box, CX, CY, CZ, L2, E, (x, y, t, q, n, m, open, pi) => {
        const seenN = st.seen(n);
        const sl = Math.hypot(seenN[0], seenN[1], seenN[2]) || 1;
        const nl = (seenN[0] * LX + seenN[1] * LY + seenN[2] * LZ) / sl;
        const mat = sc.mats[m];
        const tone = toneOf(nl - (1 - open) * (mat.crease ?? CREASE) - (mat.shade ?? 0));
        const prim = f.rs[pi].p;
        const h: Hit = { p: q, n, nl, tone, prim, x, y };
        const c = (mat.paint && mat.paint(h)) || mat.ramp[tone];
        const k = y * W + x;
        zb[k] = t;
        stuff[k] = m;
        piece[k] = pieceAt[pi] >= 0 ? pieceAt[pi] : (pieceAt[pi] = pieceOf(m, prim.piece));
        colour[k] = pack(c);
      });
    } finally {
      ARENAS.push(arena);
    }
  } else for (let y = Math.max(0, Math.floor(y0)); y <= Math.min(H - 1, Math.ceil(y1)); y++) {
    for (let x = Math.max(0, Math.floor(x0)); x <= Math.min(W - 1, Math.ceil(x1)); x++) {
      const sx = x + 0.5 - ax;
      const sy = y + 0.5 - ay;
      const base: V3 = [CX[0] * sx + CY[0] * sy, CX[1] * sx + CY[1] * sy, CX[2] * sx + CY[2] * sy];
      let t = zNear;
      let hit = false;
      let q: V3 = base;
      let m = -1;
      for (let i = 0; i < 160 && t > zFar; i++) {
        q = [base[0] + CZ[0] * t, base[1] + CZ[1] * t, base[2] + CZ[2] * t];
        const a = f.at(q);
        if (a.d < 0.02) {
          hit = true;
          m = a.m;
          break;
        }
        t -= Math.max(0.02, (a.d * 0.8) / L2);
      }
      if (!hit) continue;
      // the way the skin faces: the field's slope there, in the stuff that was met
      const g = (dx: number, dy: number, dz: number): number => f.ofMat(m, [q[0] + dx, q[1] + dy, q[2] + dz]);
      const nx = g(E, 0, 0) - g(-E, 0, 0);
      const ny = g(0, E, 0) - g(0, -E, 0);
      const nz = g(0, 0, E) - g(0, 0, -E);
      const nn = Math.hypot(nx, ny, nz) || 1;
      const n: V3 = [nx / nn, ny / nn, nz / nn];
      const seenN = st.seen(n);
      const sl = Math.hypot(seenN[0], seenN[1], seenN[2]) || 1;
      const nl = (seenN[0] * LX + seenN[1] * LY + seenN[2] * LZ) / sl;
      // its creases: how hemmed in the skin is, a little way out from it
      const o1 = f.at([q[0] + n[0] * 1.2, q[1] + n[1] * 1.2, q[2] + n[2] * 1.2]).d / 1.2;
      const o2 = f.at([q[0] + n[0] * 2.6, q[1] + n[1] * 2.6, q[2] + n[2] * 2.6]).d / 2.6;
      const open = Math.max(0, Math.min(1, (o1 + o2) / 2));
      const mat = sc.mats[m];
      const tone = toneOf(nl - (1 - open) * (mat.crease ?? CREASE) - (mat.shade ?? 0));
      const prim = f.nearest(m, q);
      const h: Hit = { p: q, n, nl, tone, prim, x, y };
      const c = (mat.paint && mat.paint(h)) || mat.ramp[tone];
      const k = y * W + x;
      zb[k] = t;
      stuff[k] = m;
      piece[k] = pieceOf(m, prim.piece);
      colour[k] = pack(c);
    }
  }
  // the parts of the old kind, nearer at a pixel than the sculpture, win it
  extraParts.forEach((s, j) => {
    for (let k = 0, i = 3; k < N; k++, i += 4) {
      if (s.d[i] === 0) continue;
      const zk = s.z[k];
      const here = zk !== zk ? s.near : zk;
      if (here < zb[k]) continue;
      zb[k] = here;
      stuff[k] = 1000 + j;
      piece[k] = 100000 + j;
      colour[k] = ((s.d[i - 3] << 24) | (s.d[i - 2] << 16) | (s.d[i - 1] << 8) | 255) >>> 0;
    }
  });
  // CLEAN CLUSTERS: a lone pixel of a tone its own stuff has all round it in another is given that one (no speckle)
  {
    const was = colour.slice();
    for (let y = 1; y < H - 1; y++) {
      for (let x = 1; x < W - 1; x++) {
        const k = y * W + x;
        if (stuff[k] < 0 || stuff[k] >= 1000) continue;
        let same = -1;
        let all = true;
        let n = 0;
        for (let side = 0; side < 4; side++) {
          const j = side === 0 ? k - 1 : side === 1 ? k + 1 : side === 2 ? k - W : k + W;
          if (stuff[j] !== stuff[k]) continue;
          n++;
          if (same < 0) same = j;
          else if (was[j] !== was[same]) all = false;
        }
        if (n >= 3 && all && same >= 0 && was[same] !== was[k]) colour[k] = was[same];
      }
    }
  }
  // THE MARKS: drawn where their point is seen (no further than a length behind what is there)
  for (const mk of sc.marks) {
    const [mx, my] = st.at(mk.p);
    const mz = st.near(mk.p);
    const x0m = Math.floor(mx) + mk.dx;
    const y0m = Math.floor(my) + mk.dy;
    const k0 = Math.floor(my) * W + Math.floor(mx);
    if (k0 < 0 || k0 >= N || stuff[k0] < 0 || zb[k0] - mz > mk.through || (mk.on >= 0 && stuff[k0] !== mk.on)) continue;
    for (let yy = y0m; yy < y0m + mk.h; yy++) for (let xx = x0m; xx < x0m + mk.w; xx++) {
      if (xx < 0 || yy < 0 || xx >= W || yy >= H) continue;
      const k = yy * W + xx;
      if (stuff[k] !== stuff[k0]) continue;
      colour[k] = pack(mk.c);
      // (a mark is no seam: it keeps the colour it is given)
    }
  }
  const out = new Px(W, H);
  const o = out.d;
  const ink = rgba(INK);
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const k = y * W + x;
      const i = k * 4;
      let seam = false;
      let soft = false;
      for (let side = 0; side < 4 && !seam; side++) {
        const xx = side === 0 ? x - 1 : side === 1 ? x + 1 : x;
        const yy = side === 2 ? y - 1 : side === 3 ? y + 1 : y;
        if (xx < 0 || yy < 0 || xx >= W || yy >= H) continue;
        const j = yy * W + xx;
        if (stuff[j] < 0) continue;
        if (stuff[k] < 0) {
          seam = true;
          continue;
        }
        const dz = zb[j] - zb[k];
        if (stuff[j] !== stuff[k]) {
          seam = dz > 0.4 || (dz > -0.4 && stuff[j] > stuff[k]);
          if (seam && Math.abs(dz) <= MELD_STEP && stuff[j] < 1000 && stuff[k] < 1000 && (sc.mats[stuff[j]].meld || sc.mats[stuff[k]].meld)) {
            seam = false;
            soft = true;
          }
        }
        else if (piece[j] !== piece[k]) seam = dz > PIECE_STEP;
        else seam = dz > SELF_STEP;
      }
      if (!seam && soft) {
        const c = rgba(sc.mats[stuff[k]].ramp[1]);
        o[i] = c[0];
        o[i + 1] = c[1];
        o[i + 2] = c[2];
        o[i + 3] = 255;
      } else if (seam) {
        o[i] = ink[0];
        o[i + 1] = ink[1];
        o[i + 2] = ink[2];
        o[i + 3] = 255;
      } else if (stuff[k] >= 0) {
        const c = colour[k];
        o[i] = (c >>> 24) & 255;
        o[i + 1] = (c >>> 16) & 255;
        o[i + 2] = (c >>> 8) & 255;
        o[i + 3] = 255;
      }
    }
  }
  const ud = st.under.d;
  const vd = st.over.d;
  const lightNear = overNear ? overNear() : Infinity;
  for (let i = 0; i < N * 4; i += 4) {
    if (o[i + 3] === 0 && ud[i + 3] > 0) {
      o[i] = ud[i];
      o[i + 1] = ud[i + 1];
      o[i + 2] = ud[i + 2];
      o[i + 3] = 255;
    }
    if (vd[i + 3] > 0 && !(o[i + 3] > 0 && zb[i >> 2] > lightNear)) {
      o[i] = vd[i];
      o[i + 1] = vd[i + 1];
      o[i + 2] = vd[i + 2];
      o[i + 3] = 255;
    }
  }
  if (rim) edge(out, rim);
  return { px: out, z: zb, stuff, st };
}

/** A figure as its `spin` turns it: every solid, cut and mark turned round the floor point under it. */
function spun(sc: Sculpt): Sculpt {
  if (!sc.spin) return sc;
  const t = (p: V3): V3 => sc.at(p);
  const out = new Sculpt();
  out.mats.push(...sc.mats);
  for (const p of sc.prims) {
    const cuts = p.cuts?.map((c) => ({ n: t(c.n), o: c.o }));
    if (p.k === 'cone') out.prims.push({ ...p, a: t(p.a), b: t(p.b), cuts });
    else if (p.k === 'tri') out.prims.push({ ...p, a: t(p.a), b: t(p.b), c: t(p.c), cuts });
    else out.prims.push({ ...p, c: t(p.c), axes: [t(p.axes[0]), t(p.axes[1]), t(p.axes[2])], cuts } as Prim);
  }
  for (const m of sc.marks) out.marks.push({ ...m, p: t(m.p) });
  // (a material's painter is told where on the figure a point is as it was built, so its stripes and seams turn with it)
  const back = (p: V3): V3 => {
    const a = (-sc.spin * Math.PI) / 180;
    return [p[0] * Math.cos(a) - p[1] * Math.sin(a), p[0] * Math.sin(a) + p[1] * Math.cos(a), p[2]];
  };
  const was = new Map<Prim, Prim>();
  out.prims.forEach((p, i) => was.set(p, sc.prims[i]));
  out.mats.length = 0;
  for (const m of sc.mats) {
    out.mats.push(!m.paint ? m : { ...m, paint: (h) => (m.paint as (h: Hit) => string | null)({ ...h, p: back(h.p), n: back(h.n), prim: was.get(h.prim) ?? h.prim }) });
  }
  return out;
}

// ---------------------------------------------------------------------------------------------
// Helpers for a material's painter: where on a solid a point is

/** How far along a rod a point is (0 at `a`, 1 at `b`), and round it (radians from its `ref` side). */
export function onCone(c: Cone, p: V3, ref: V3): { t: number; around: number } {
  const ab = sub(c.b, c.a);
  const L2 = dot(ab, ab) || 1;
  const t = Math.max(0, Math.min(1, dot(sub(p, c.a), ab) / L2));
  const axis: V3 = [ab[0] / Math.sqrt(L2), ab[1] / Math.sqrt(L2), ab[2] / Math.sqrt(L2)];
  const foot: V3 = [c.a[0] + ab[0] * t, c.a[1] + ab[1] * t, c.a[2] + ab[2] * t];
  const out = sub(p, foot);
  // (`ref` made square to the rod, and the third way round it)
  const r0 = sub(ref, [axis[0] * dot(ref, axis), axis[1] * dot(ref, axis), axis[2] * dot(ref, axis)]);
  const rl = lenOf(r0) || 1;
  const u: V3 = [r0[0] / rl, r0[1] / rl, r0[2] / rl];
  const v: V3 = [axis[1] * u[2] - axis[2] * u[1], axis[2] * u[0] - axis[0] * u[2], axis[0] * u[1] - axis[1] * u[0]];
  return { t, around: Math.atan2(dot(out, v), dot(out, u)) };
}
/** Where a point is on a ball or a block, along its own three lines (-1 to 1 at its skin). */
export function onBall(e: Ell | Box | Tri, p: V3): V3 {
  if (e.k === 'tri') return [0, 0, 0];
  const v = sub(p, e.c);
  return e.axes.map((a) => dot(v, a) / Math.max(1e-6, dot(a, a))) as unknown as V3;
}
