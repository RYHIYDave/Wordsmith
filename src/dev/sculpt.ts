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
  for (let y = Math.max(0, Math.floor(y0)); y <= Math.min(H - 1, Math.ceil(y1)); y++) {
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
        for (const j of [k - 1, k + 1, k - W, k + W]) {
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
